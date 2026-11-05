"""#74 일본 10년 국채금리(CNBC JP10Y) 5일 급변 꼬리 → 5개 시장 — 확률 보강 11/5 14시 (Actions)
5·20일 변화(%p 수준차)의 1년 백분위 ≥90%(금리 급등)·≤10%(급락) 한쪽씩 칸. 도쿄 날짜 값 → 같은 날 행(다음 날 예측).
겹침: 미 10년(^TNX)·S&P 5일 꼬리 칸 위 + 교차 로지스틱. 하루 늦춘(lag1) 판도 같이 — 날짜 어긋남 점검."""
import json, sys, os, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

def cnbc(sym, start="20000101"):
    end = (pd.Timestamp.today() + pd.Timedelta(days=2)).strftime("%Y%m%d")
    u = f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/1D/{start}000000/{end}000000/adjusted/EST5EDT.json"
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"})
    with urllib.request.urlopen(req, timeout=40) as r:
        bars = json.loads(r.read().decode("utf-8")).get("barData", {}).get("priceBars", [])
    v = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
    return v[~v.index.duplicated(keep="last")]

JG = None
for s in ("JP10Y", "JP10Y-JP", "JP10YR"):
    try:
        v = cnbc(s); print("CNBC", s, len(v), v.index[0].date() if len(v) else None, v.index[-1].date() if len(v) else None, v.tail(3).to_dict())
        if len(v) > 1000 and JG is None: JG = v
    except Exception as e:
        print("CNBC", s, "ERR", str(e)[:100])
for s in ("KR10Y", "KR3Y", "US2Y"):  # 다음 후보(#75·#76) 자료 확인만
    try:
        v = cnbc(s); print("NEXT", s, len(v), v.index[0].date() if len(v) else None, v.tail(2).to_dict())
    except Exception as e:
        print("NEXT", s, "ERR", str(e)[:100])
if JG is None: sys.exit("JP10Y 없음")
# 요일 분포(주말 바가 있으면 날짜 어긋남 의심)
print("요일", JG.index.dayofweek.value_counts().sort_index().to_dict())

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^TNX", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
tn, sp = cs("^TNX"), cs("^GSPC")
sk = JG

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
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "1995-01-01"].copy()
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rv = A(tn.diff(5)); rs = A(np.log(sp).diff(5))
    oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
    R = {}
    for fn, ser, lg in (("5일변화", sk.diff(5), 0), ("20일변화", sk.diff(20), 0), ("5일변화_lag1", sk.diff(5), 1)):
        rg = prob_x.align(prob_x.rank252(ser), d.index).shift(lg); mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90(금리 급등)", (rg >= 0.9).fillna(False)), ("≤10(금리 급락)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"높음일": int(fh.sum()), "높음&미10년≥90": int((fh & (rv >= 0.9)).sum()), "높음&미10년≤10": int((fh & (rv <= 0.1)).sum()),
              "낮음일": int(fl.sum()), "낮음&미10년≥90": int((fl & (rv >= 0.9)).sum()), "낮음&S&P≤10": int((fl & (rs <= 0.1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존(미10년·S&P)": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0],
                 "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + gb, ycol, h)[0]}
            r[ycol] = score(d, ycol, P)
        # 교차 로지스틱
        D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = rv.notna() & rs.notna() & rg.notna() & (d.index >= "2002-01-01")
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
json.dump(out, open("probe/jgb_bt.json", "w"), ensure_ascii=False, indent=1)
