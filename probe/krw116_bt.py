"""#116 원달러 1년 신고가(원화 1년 최약) 경신일 → 코스피 다음 날·5일 — 확률 보강 일지 11/17 14시 (Actions)
KRW=X 종가가 직전 251일 최고 이상(신고가) · 20일 만의 첫 신고가 · 신고가 0.5% 안 · 반대로 1년 최저(원화 최강).
기존 = 💱 원/달러 5일 5칸 + S&P 5일 꼬리. 걸어가며 사전 100 브라이어 앞/뒤·최근5년 + 교차 로지스틱."""
import json, sys, os, time
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x
try:
    import yfinance as yf
except ImportError: yf = None
H = prob.load_hist(["^KS11", "^GSPC", "KRW=X"])
for s_ in ("^KS11", "^GSPC", "KRW=X"):
    for _ in range(3):
        if s_ in H and len(H[s_]) > 1000: break
        time.sleep(3)
        try:
            x_ = yf.Ticker(s_).history(start="2000-01-01", auto_adjust=False)[["Open", "High", "Low", "Close"]]
            x_.index = pd.to_datetime(x_.index).tz_localize(None); H[s_] = x_
        except Exception as e: print("재시도 실패", s_, e)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
sp, fx = cs("^GSPC"), cs("KRW=X")
# 엉터리 값 거르기(하루 ±8% 넘는 튐)
fx = fx[(fx.pct_change().abs() < 0.08) | fx.pct_change().isna()]
print("KRW", fx.index[0].date(), fx.index[-1].date(), len(fx), "지금", round(float(fx.iloc[-1]), 1))
pmax = fx.shift(1).rolling(251, min_periods=200).max(); pmin = fx.shift(1).rolling(251, min_periods=200).min()
hi = fx >= pmax; lo = fx <= pmin
first = hi & (~hi.shift(1).rolling(20, min_periods=1).max().astype(bool))
near = fx >= pmax * 0.995
lofirst = lo & (~lo.shift(1).rolling(20, min_periods=1).max().astype(bool))
SIG = {"신고가": hi, "첫신고가20": first, "신고가0.5%안": near, "1년최저": lo, "첫최저20": lofirst}
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


out = {"now": {k: bool(v.iloc[-1]) for k, v in SIG.items()}, "fx": [str(fx.index[-1].date()), round(float(fx.iloc[-1]), 1), round(float(pmax.iloc[-1]), 1), round(float(pmin.iloc[-1]), 1)]}
print("지금", out)
d = prob.feats(H["^KS11"]); d = d[d.index >= "2003-06-01"].copy()
A = lambda s: prob_x.align(s, d.index)
rs = A(prob_x.rank252(np.log(sp).diff(5)))
f5 = A(fx.pct_change(5))
fxl = pd.Series(pd.cut(f5, [-9, -0.015, -0.004, 0.004, 0.015, 9], labels=["a", "b", "c", "e", "f"]).astype(str), index=d.index).where(f5.notna())
oth = lab(rs, "sh", "sl") + "|" + fxl
mid = d.index[len(d) // 2]
R = {"mid": str(mid.date())}
for key, s in SIG.items():
    q = A(s.astype(float)).fillna(0) > 0.5
    cells = {}
    for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid), ("최근5년", d.index >= d.index[-1] - pd.Timedelta(days=1826))):
        c_ = prob.cond(d[msk], q[msk], key)
        cells[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    # 5일 간격(겹침 줄임): 신호 뒤 5일 안 다시 켜진 날 뺀 사건
    ev = q & ~(q.shift(1).rolling(5, min_periods=1).max().fillna(0).astype(bool))
    ce = {}
    for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
        c_ = prob.cond(d[msk], ev[msk], key)
        ce[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    e1 = one(rs, q, "q")
    rr = {"칸(n,y1차,y5차)": cells, "사건(솎음)": ce, "겹침": {"n": int(q.sum()), "&S&P≤10": int((q & (rs <= .1)).sum()), "&원달러5일+1.5%↑": int((q & (f5 >= 0.015)).sum())}}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(d, e1, ycol, h)[1], "혼자": wf(d, e1, ycol, h)[0], "기존": wf(d, oth, ycol, h)[0], "기존+": wf(d, oth + "|" + e1, ycol, h)[0]}
        rr[ycol] = score(d, ycol, P)
    Dm = pd.DataFrame({"c": 1.0, "sh": rs >= .9, "sl": rs <= .1, "fa": f5 <= -0.015, "fb": f5 <= -0.004, "fe": f5 >= 0.004, "ff": f5 >= 0.015, "q": q}, index=d.index).astype(float)
    ok = rs.notna() & f5.notna() & (d.index >= "2005-01-01")
    for ycol in ("y1", "y5"):
        m = ok & d[ycol].notna(); idx = d.index[m]; md = idx[len(idx) // 2]
        y = d.loc[m, ycol].values.astype(float); Xa = Dm[m].values; a, b_ = idx < md, idx >= md
        xr = {}
        for tn, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            s2 = {}
            for k, cols in (("기존", [0,1,2,3,4,5,6]), ("+신호", [0,1,2,3,4,5,6,7])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s2[k] = round(float(((p - y[te]) ** 2).mean()), 5); s2[k + "계수"] = round(float(w[-1]), 3)
            xr[tn] = s2
        rr["교차_" + ycol] = xr
    R[key] = rr
    print(key, json.dumps(rr, ensure_ascii=False))
out["KR"] = R
json.dump(out, open("probe/krw116_bt.json", "w"), ensure_ascii=False, indent=1)
