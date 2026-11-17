"""#117 지수 52주 고점·역사적 고점 근접도(Li & Yu 2012) → 5개 시장 다음 날·5일 — 확률 보강 일지 11/17 16시 (Actions)
n52 = 종가÷직전 252일 최고 · nath = 종가÷그때까지 최고(야후 period=max 처음부터).
Li & Yu: 52주 고점 근접 → 이후 수익 +(덜 반응) · 역사적 고점 근접 → −(과잉).
기존 = 자기 5일·S&P 5일 꼬리 + 「52주 고점 대비」 1년 순위 3칸(심리 종합이 이미 쓰는 몫). 걸어가며 사전 100 브라이어 앞/뒤·최근5년 + 교차 로지스틱(연속값)."""
import json, sys, os, time
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x
import yfinance as yf
MK = {"KR": "^KS11", "JP": "^N225", "CN": "000001.SS", "HK": "^HSI", "US": "^GSPC"}
H = {}
for s_ in MK.values():
    for _ in range(4):
        try:
            x_ = yf.Ticker(s_).history(period="max", auto_adjust=False)[["Open", "High", "Low", "Close"]]
            x_.index = pd.to_datetime(x_.index).tz_localize(None)
            if len(x_) > 3000: H[s_] = x_; break
        except Exception as e: print("재시도", s_, e)
        time.sleep(4)
    print(s_, H[s_].index[0].date(), H[s_].index[-1].date(), len(H[s_]))
def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base
def score(d, ycol, ps, mid):
    y = d[ycol]; ev = y.notna()
    for p in ps.values(): ev &= p.notna()
    r = {}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r
def lab3(r):
    return pd.Series(np.where(r >= 0.9, "H", np.where(r <= 0.1, "L", "-")), index=r.index, dtype=object).where(r.notna())
def logit_fit(X, y, l2=1.0, it=60):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w
sp = H["^GSPC"]["Close"].dropna()
out = {}
for mk, sym in MK.items():
    px = H[sym]; c0 = px["Close"].dropna(); c0 = c0[c0 > 0]
    nath_all = c0 / c0.cummax()
    n52_all = c0 / c0.rolling(252, min_periods=200).max()
    d = prob.feats(px.loc[c0.index]); d = d[d.index >= "2000-01-01"].copy()
    A = (lambda s: s.reindex(d.index)) if mk == "US" else (lambda s: prob_x.align(s, d.index))
    n52 = n52_all.reindex(d.index); nath = nath_all.reindex(d.index)
    r5 = prob_x.rank252(np.log(d["c"]).diff(5)); rsp = A(prob_x.rank252(np.log(sp).diff(5)))
    r52 = prob_x.rank252(n52 - 1)
    oth = lab3(r5) + "|" + lab3(rsp) + "|" + lab3(r52)
    SIG = {"ATH 2%안": nath >= 0.98, "ATH 신고가": nath >= 0.9999,
           "52주 3%안·ATH 15%↓(Li&Yu 덜반응)": (n52 >= 0.97) & (nath < 0.85),
           "ATH 40%↓": nath < 0.6, "52주 3%안": n52 >= 0.97}
    mid = d.index[len(d) // 2]
    R = {"mid": str(mid.date()), "now": {"n52": round(float(n52.iloc[-1]), 4), "nath": round(float(nath.iloc[-1]), 4), "date": str(d.index[-1].date())}}
    for key, q in SIG.items():
        q = q.fillna(False)
        cells = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid), ("최근5년", d.index >= d.index[-1] - pd.Timedelta(days=1826))):
            c_ = prob.cond(d[msk], q[msk], key)
            cells[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        e1 = pd.Series(np.where(q, "q", "-"), index=d.index, dtype=object).where(r5.notna())
        rr = {"칸(n,y1차,y5차)": cells, "지금": bool(q.iloc[-1]), "겹침&52주상위10%": int((q & (r52 >= 0.9)).sum()), "n": int(q.sum())}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, e1, ycol, h)[1], "기존": wf(d, oth, ycol, h)[0], "기존+": wf(d, oth + "|" + e1, ycol, h)[0]}
            rr[ycol] = score(d, ycol, P, mid)
        R[key] = rr
    # 교차 로지스틱 — 연속값: 기존 [c, r5 꼬리2, rsp 꼬리2, n52−1] + log(nath)
    Dm = pd.DataFrame({"c": 1.0, "a": r5 >= .9, "b": r5 <= .1, "e": rsp >= .9, "f": rsp <= .1,
                       "n52": (n52 - 1) * 10, "ath": np.log(nath) * 5, "ath2": (nath >= 0.98).astype(float)}, index=d.index).astype(float)
    ok = Dm.notna().all(axis=1) & r5.notna() & rsp.notna()
    for ycol in ("y1", "y5"):
        m = ok & d[ycol].notna(); idx = d.index[m]; md = idx[len(idx) // 2]
        y = d.loc[m, ycol].values.astype(float); Xa = Dm[m].values; a, b_ = idx < md, idx >= md
        xr = {}
        for tn, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            s2 = {}
            for k, cols in (("기존", [0, 1, 2, 3, 4]), ("+52주", [0, 1, 2, 3, 4, 5]), ("+52주+ATH", [0, 1, 2, 3, 4, 5, 6]), ("+52주+ATH2%", [0, 1, 2, 3, 4, 5, 7])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s2[k] = round(float(((p - y[te]) ** 2).mean()), 5); s2[k + "계수"] = [round(float(v), 3) for v in w[5:]]
            xr[tn] = s2
        R["교차_" + ycol] = xr
    out[mk] = R
    print(mk, json.dumps(R, ensure_ascii=False))
json.dump(out, open("probe/ath117_bt.json", "w"), ensure_ascii=False, indent=1)
