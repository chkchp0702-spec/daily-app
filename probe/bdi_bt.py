"""#70 발틱 건화물 운임지수(BDI) 5·20일 급변 꼬리 → 5개 시장 — 확률 보강 11/4 17시 (Actions)
자료 찾기: 야후 ^BDI·BDIY · stooq · investing api · 없으면 야후 BDRY(건화물 운임 선물 ETF, 2018-03~).
런던 오후 발표 → 다음 아시아 장(prob_x.align). 걸어가며 사전 100 브라이어 앞/뒤·최근5년 · 달러·S&P 5일 꼬리 칸 위 + 교차 로지스틱."""
import json, sys, os, io
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd())
import prob, prob_x
import yfinance as yf

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
cand = {}
def yser(t):
    try:
        V = yf.download(t, start="1995-01-01", interval="1d", auto_adjust=True, progress=False)
        if isinstance(V.columns, pd.MultiIndex): V.columns = V.columns.get_level_values(0)
        V.index = pd.to_datetime(V.index).tz_localize(None); s = V["Close"].dropna(); return s[s > 0]
    except Exception as e:
        print("SRC", t, "err", str(e)[:80]); return pd.Series(dtype=float)
for t in ("^BDI", "BDIY", "^BDIY", "BDI", "BDRY"):
    s = yser(t); print("SRC yahoo", t, len(s), s.index[0].date() if len(s) else "", s.index[-1].date() if len(s) else ""); cand["y:" + t] = s
for u in ("https://stooq.com/q/d/l/?s=bdi&i=d", "https://stooq.com/q/d/l/?s=^bdi&i=d", "https://stooq.com/q/d/l/?s=bdiy&i=d"):
    try:
        r = requests.get(u, headers=UA, timeout=20); print("SRC", u, r.status_code, r.text[:80].replace("\n", " "))
        if r.ok and r.text.startswith("Date"):
            df = pd.read_csv(io.StringIO(r.text), parse_dates=["Date"]).set_index("Date"); cand["stooq:" + u] = df["Close"].dropna()
    except Exception as e: print("SRC", u, "err", str(e)[:80])
for u, h in (("https://api.investing.com/api/financialdata/historical/940793?start-date=2000-01-01&end-date=2026-11-04&time-frame=Daily&add-missing-rows=false", {**UA, "domain-id": "www"}),
             ("https://www.investing.com/indices/baltic-dry-historical-data", UA),
             ("https://tradingeconomics.com/commodity/baltic", UA)):
    try:
        r = requests.get(u, headers=h, timeout=20); print("SRC", u[:70], r.status_code, len(r.text), r.text[:100].replace("\n", " "))
        if r.ok and u.startswith("https://api.investing"):
            js = r.json().get("data", []); s = pd.Series({pd.Timestamp(x["rowDateTimestamp"][:10]): float(str(x["last_closeRaw"])) for x in js}).sort_index()
            print("SRC investing rows", len(s)); cand["inv"] = s
    except Exception as e: print("SRC", u[:70], "err", str(e)[:80])
best = max(cand, key=lambda k: len(cand[k])); sk = cand[best]
print("BDI use", best, sk.index[0].date(), sk.index[-1].date(), len(sk), round(float(sk.iloc[-1]), 2))

syms = sorted({c["ix"] for c in prob.MK.values()} | {"DX-Y.NYB", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
vx, sp = cs("DX-Y.NYB"), cs("^GSPC")


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2002-01-01"):
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


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= max(pd.Timestamp("1995-01-01"), sk.index[0] + pd.Timedelta(days=400))].copy()
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rv = A(np.log(vx).diff(5)); rs = A(np.log(sp).diff(5))
    oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
    R = {}
    for fn, ser in (("5일변화", np.log(sk).diff(5)), ("20일변화", np.log(sk).diff(20))):
        rg = A(ser); mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90(운임 급등)", (rg >= 0.9).fillna(False)), ("≤10(운임 급락)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"높음일": int(fh.sum()), "높음&달러≥90": int((fh & (rv >= 0.9)).sum()), "높음&달러≤10": int((fh & (rv <= 0.1)).sum()),
              "낮음일": int(fl.sum()), "낮음&달러≥90": int((fl & (rv >= 0.9)).sum()), "낮음&S&P≤10": int((fl & (rs <= 0.1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존(달러·S&P)": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0],
                 "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + gb, ycol, h)[0]}
            r[ycol] = score(d, ycol, P, str(d.index[0].date()))
        # 교차 로지스틱
        D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = rv.notna() & rs.notna() & rg.notna() & (d.index >= d.index[0])
        X = {}
        for ycol in ("y1", "y5"):
            m = ok & d[ycol].notna(); idx = d.index[m]; md = idx[len(idx) // 2]
            y = d.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b = idx < md, idx >= md
            xr = {}
            for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
                s = {}
                for k, cols in (("기존", [0, 1, 2, 3, 4]), ("+높음", [0, 1, 2, 3, 4, 5]), ("+낮음", [0, 1, 2, 3, 4, 6])):
                    w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                    s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                    if k != "기존": s[k + "계수"] = round(float(w[-1]), 3)
                xr[nm] = s
            X[ycol] = xr
        r["교차"] = X
        R[fn] = r
        print(mk, fn, json.dumps(r, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/bdi_bt.json", "w"), ensure_ascii=False, indent=1)
