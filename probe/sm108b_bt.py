"""#108b 닻 「9칸」 대신 「매끈한 곡선」 — 실제 닻과 같게(2012~ 평가 · 칸 사전 20 · ETF·KWEB 기울기 그대로) 다시 재기. 확률 보강 일지 11/13 14시 (Actions)
칸 쪽: 그날 앞 모든 날(2000~)로 칸 비율(사전 20) — prob.py cond 와 같음.
곡선 쪽: 그날 앞 모든 날로 로지스틱 a + b·tanh(S&P%/1.5) (21일마다 다시 맞춤).
두 쪽 모두 같은 ETF 초과(0.16/1%p ±0.3)·KWEB−EWH(홍콩 0.15 ±0.25) 기울기를 얹어 브라이어 비교."""
import json
import numpy as np, pandas as pd, yfinance as yf
E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]; PRI = 20
SY = ["^KS11", "^N225", "^HSI", "000001.SS", "^GSPC", "EWY", "EWJ", "EWH", "KWEB"]
df = yf.download(SY, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
spr = C["^GSPC"].pct_change().dropna(); usd = spr.index
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def lg(p): p = np.clip(p, 1e-4, 1 - 1e-4); return np.log(p / (1 - p))
def sg(z): return 1 / (1 + np.exp(-z))
def fit(x, y, l2=1.0, it=25):
    X = np.c_[np.ones(len(x)), x]; w = np.zeros(2)
    for _ in range(it):
        p = sg(X @ w); g = X.T @ (p - y) + l2 * np.r_[0, w[1]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag([0, 1]); w -= np.linalg.solve(H, g)
    return w
OUT = {}
for mk, ix, etf in (("HK", "^HSI", "EWH"), ("KR", "^KS11", "EWY"), ("JP", "^N225", "EWJ"), ("CN", "000001.SS", None)):
    a = C[ix]; ar = a.pct_change(); E = C[etf].pct_change() if etf else None
    K = C["KWEB"].pct_change() if mk == "HK" else None; rows = []
    for i in range(2, len(a.index)):
        D, P = a.index[i], a.index[i - 1]
        j = usd.searchsorted(D) - 1
        if j < 0: continue
        t = usd[j]
        if t < P: continue
        ex_ = float(E.get(t, np.nan) - ar[P]) if etf else np.nan
        kx_ = float(K.get(t, np.nan) - E.get(t, np.nan)) if K is not None else np.nan
        rows.append((D, float(spr[t]), ex_, kx_, int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "ex", "kx", "y"]).set_index("D")
    us = R["us"].values; y = R["y"].values.astype(float); bk = np.digitize(us, E9)
    adj = np.zeros(len(R))
    if etf: adj += np.clip(0.16 * np.nan_to_num(R["ex"].values) * 100, -0.3, 0.3)
    if mk == "HK": adj += np.clip(0.15 * np.nan_to_num(R["kx"].values) * 100, -0.25, 0.25)
    st = np.tanh(us * 100 / 1.5)
    ev = np.where(R.index >= "2012-01-01")[0]
    pb, ps, w = np.zeros(len(R)), np.zeros(len(R)), None
    for c, i in enumerate(ev):
        base = y[:i].mean(); m = bk[:i] == bk[i]
        pb[i] = (y[:i][m].sum() + PRI * base) / (m.sum() + PRI)
        if c % 21 == 0: w = fit(st[:i], y[:i])
        ps[i] = sg(w[0] + w[1] * st[i])
    B = sg(lg(pb) + adj); S = sg(lg(ps) + adj); M = sg((lg(pb) + lg(ps)) / 2 + adj)
    idx = R.index; res = {"n_eval": len(ev), "w_last": [round(float(v), 3) for v in w]}
    segs = {"전체": ev}
    n = len(ev); segs.update({f"토막{k+1}": ev[k * n // 3:(k + 1) * n // 3] for k in range(3)})
    segs["앞반"] = ev[:n // 2]; segs["뒤반"] = ev[n // 2:]
    segs["최근5년"] = ev[idx[ev] >= idx[-1] - pd.Timedelta(days=365 * 5)]
    segs["최근2년"] = ev[idx[ev] >= idx[-1] - pd.Timedelta(days=365 * 2)]
    for k, s in segs.items():
        res[k] = {"n": len(s), "칸": brier(B[s], y[s]), "곡선": brier(S[s], y[s]), "반반": brier(M[s], y[s]),
                  "적중칸": round(float(((B[s] > .5) == y[s]).mean()) * 100, 1), "적중곡선": round(float(((S[s] > .5) == y[s]).mean()) * 100, 1)}
    # 큰 날(|S&P|≥1.5%) 따로
    big = ev[np.abs(us[ev]) >= 0.015]
    res["큰날"] = {"n": len(big), "칸": brier(B[big], y[big]), "곡선": brier(S[big], y[big]), "실제": round(float(y[big].mean()) * 100, 1)}
    # 지금 값 비교용 표: S&P −3..+3%
    grid = {}
    for g in (-0.03, -0.015, -0.007, -0.003, 0.0, 0.003, 0.007, 0.015, 0.03):
        m = bk == np.digitize([g], E9)[0]; base = y.mean()
        grid[f"{g*100:+.1f}%"] = [round(float((y[m].sum() + PRI * base) / (m.sum() + PRI)) * 100, 1), round(float(sg(w[0] + w[1] * np.tanh(g * 100 / 1.5))) * 100, 1)]
    res["칸vs곡선"] = grid
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
json.dump(OUT, open("probe/sm108b_bt.json", "w"), ensure_ascii=False, indent=1)
