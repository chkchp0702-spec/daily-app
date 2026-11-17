"""#115 CFTC 투기적 포지션(비상업 순매수 ÷ 미결제) 52주 백분위 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 11/17 12시 (Actions)
엔 선물(097741)·E-mini S&P(13874A) · 화요일 기준 → 금요일 발표(미국 장 마감 전) → 금요일(미국 날짜) 값으로, 아시아는 prob_x.align.
수준 백분위(52주) ≤10%·≥90% + 4주 변화 백분위 꼬리. 걸어가며 사전 100 브라이어 앞/뒤·최근5년 · 기존(S&P·달러지수 5일 꼬리) 칸 위 + 교차 로지스틱."""
import json, sys, os, io, zipfile, time
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd())
import prob, prob_x

UA = {"User-Agent": "Mozilla/5.0"}
CODES = {"097741": "yen", "13874A": "es"}
rows = []
def take(df):
    cols = {c.lower(): c for c in df.columns}
    def f(*keys):
        for lc, c in cols.items():
            if all(k in lc for k in keys): return c
    cc = f("contract", "code") or f("cftc_contract_market_code")
    dc = f("as of date", "yyyy-mm-dd") or f("report_date_as_yyyy_mm_dd")
    oi = f("open interest (all)") or f("open_interest_all")
    lo = f("noncommercial positions-long (all)") or f("noncomm_positions_long_all")
    sh = f("noncommercial positions-short (all)") or f("noncomm_positions_short_all")
    x = df[[cc, dc, oi, lo, sh]].copy(); x.columns = ["code", "date", "oi", "lo", "sh"]
    x["code"] = x["code"].astype(str).str.strip().str.upper()
    x = x[x["code"].isin(CODES)]
    rows.append(x)
src = []
for nm in ["deacot1986_2016"] + [f"deacot{y}" for y in range(2017, 2027)]:
    u = f"https://www.cftc.gov/files/dea/history/{nm}.zip"
    try:
        r = requests.get(u, headers=UA, timeout=60); print(nm, r.status_code, len(r.content))
        if r.status_code != 200: continue
        z = zipfile.ZipFile(io.BytesIO(r.content))
        for n in z.namelist():
            take(pd.read_csv(z.open(n), low_memory=False)); src.append(u)
    except Exception as e: print("실패", nm, e)
if not rows:
    u = "https://publicreporting.cftc.gov/resource/6dca-aqww.csv?$where=cftc_contract_market_code%20in('097741','13874A')&$limit=50000"
    r = requests.get(u, headers=UA, timeout=90); print("socrata", r.status_code, len(r.content))
    take(pd.read_csv(io.StringIO(r.text))); src.append(u)
C = pd.concat(rows); C["date"] = pd.to_datetime(C["date"]); C = C.drop_duplicates(["code", "date"]).sort_values("date")
S = {}
for code, nm in CODES.items():
    x = C[C.code == code].set_index("date")
    net = (x["lo"].astype(float) - x["sh"].astype(float)) / x["oi"].astype(float)
    S[nm] = net; print("COT", nm, net.index[0].date(), net.index[-1].date(), len(net), "지금", round(float(net.iloc[-1]), 3))
def wk_rank(net, kind):
    v = net if kind == "lvl" else net.diff(4)
    r = v.rolling(52, min_periods=30).rank(pct=True)
    r.index = r.index + pd.Timedelta(days=3)   # 화 → 금 발표
    return r

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "DX-Y.NYB"})
H = prob.load_hist(syms)
import yfinance as yf
for s_ in ("^GSPC", "DX-Y.NYB"):
    for _ in range(3):
        if s_ in H and len(H[s_]) > 1000: break
        time.sleep(3)
        try:
            x_ = yf.Ticker(s_).history(start="2000-01-01", auto_adjust=False)[["Open", "Close"]]
            x_.index = pd.to_datetime(x_.index).tz_localize(None); H[s_] = x_
        except Exception as e: print("재시도 실패", s_, e)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
sp, dx = cs("^GSPC"), cs("DX-Y.NYB")


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base
def score(d, ycol, ps, start="2007-01-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r
def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())
def one(r, cond_, nm):
    return pd.Series(np.where(cond_, nm, "-"), index=r.index, dtype=object).where(r.notna())
def logit_fit(X, y, l2=1.0, it=100):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w

out = {"src": src[:2] + ["…"], "now": {}}
for nm in S:
    for kind in ("lvl", "chg4"):
        r = wk_rank(S[nm], kind); out["now"][f"{nm}_{kind}"] = [str(r.index[-1].date()), round(float(r.iloc[-1]), 3)]
print("지금", out["now"])
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2000-01-01"].copy()
    A = (lambda s: prob_x.align(s, d.index)) if mk != "US" else (lambda s: s[~s.index.duplicated()].reindex(s.index.union(d.index)).ffill().reindex(d.index))
    rs = A(prob_x.rank252(np.log(sp).diff(5))); rx = A(prob_x.rank252(np.log(dx).diff(5)))
    oth = lab(rs, "sh", "sl") + "|" + lab(rx, "xh", "xl")
    mid = d.index[len(d) // 2]
    R = {"mid": str(mid.date())}
    for nm in S:
        for kind in ("lvl", "chg4"):
            q = A(wk_rank(S[nm], kind)); key = f"{nm}_{kind}"
            cells = {}
            for cn, f in (("≤10", (q <= 0.1).fillna(False)), ("≥90", (q >= 0.9).fillna(False))):
                cells[cn] = {}
                for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                    c_ = prob.cond(d[msk], f[msk], cn)
                    cells[cn][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
            el, eh = one(q, q <= 0.1, "ql"), one(q, q >= 0.9, "qh")
            rr = {"칸(n,y1차,y5차)": cells, "겹침": {"≤10": int((q <= .1).sum()), "≤10&S&P≤10": int(((q <= .1) & (rs <= .1)).sum()), "≥90": int((q >= .9).sum()), "≥90&S&P≥90": int(((q >= .9) & (rs >= .9)).sum())}}
            for ycol, h in (("y1", 1), ("y5", 5)):
                P = {"평소": wf(d, el, ycol, h)[1], "낮음": wf(d, el, ycol, h)[0], "높음": wf(d, eh, ycol, h)[0],
                     "기존": wf(d, oth, ycol, h)[0], "기존+낮음": wf(d, oth + "|" + el, ycol, h)[0], "기존+높음": wf(d, oth + "|" + eh, ycol, h)[0]}
                rr[ycol] = score(d, ycol, P)
            # 교차 로지스틱
            Dm = pd.DataFrame({"c": 1.0, "sh": rs >= .9, "sl": rs <= .1, "xh": rx >= .9, "xl": rx <= .1, "ql": q <= .1, "qh": q >= .9}, index=d.index).astype(float)
            ok = rs.notna() & rx.notna() & q.notna() & (d.index >= "2007-01-01")
            for ycol in ("y1", "y5"):
                m = ok & d[ycol].notna(); idx = d.index[m]; md = idx[len(idx) // 2]
                y = d.loc[m, ycol].values.astype(float); Xa = Dm[m].values; a, b_ = idx < md, idx >= md
                xr = {}
                for tn, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
                    s = {}
                    for k, cols in (("기존", [0,1,2,3,4]), ("+낮음", [0,1,2,3,4,5]), ("+높음", [0,1,2,3,4,6])):
                        w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                        s[k] = round(float(((p - y[te]) ** 2).mean()), 5); s[k + "계수"] = round(float(w[-1]), 3)
                    xr[tn] = s
                rr["교차_" + ycol] = xr
            R[key] = rr
            print(mk, key, json.dumps(rr, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/cot115_bt.json", "w"), ensure_ascii=False, indent=1)
