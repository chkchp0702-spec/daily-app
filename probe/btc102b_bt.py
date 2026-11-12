"""#102b 비트코인 5일 등락 1년 순위 꼬리 → 중국·홍콩(≥90)·한국(≤10) 일주일 — 5일 간격(시작점 5개)·첫날만·걸어가기(해마다 다시 맞춤, 자기·S&P 5·20일 위) 브라이어 — 11/12 10시"""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x
H = prob.load_hist(sorted({c["ix"] for c in prob.MK.values()} | {"BTC-USD"}))
btc = H["BTC-USD"]["Close"].astype(float).dropna()
b5 = prob_x.rank252(np.log(btc).diff(5))
sp = H["^GSPC"]["Close"].astype(float)
sig = lambda x: 1 / (1 + np.exp(-x))
for mk, side in (("CN", "hi"), ("HK", "hi"), ("KR", "lo"), ("JP", "hi")):
    d = prob.feats(H[prob.MK[mk]["ix"]]); d = d[d.index >= "2015-10-01"].copy()
    rb = b5.reindex(d.index, method="ffill")
    f = (rb >= 0.9) if side == "hi" else (rb <= 0.1)
    f = f.fillna(False)
    s5 = np.log(sp).diff(5).reindex(d.index, method="ffill"); s20 = np.log(sp).diff(20).reindex(d.index, method="ffill")
    mid = d.index[len(d) // 2]; r = {"side": side, "mid": str(mid.date()), "지금순위": round(float(rb.iloc[-1]), 3)}
    sp_ = []
    for st in range(5):
        idx = d.index[st::5]; dd = d.loc[idx]; ff = f.loc[idx]; rr = []
        for m in (dd.index < mid, dd.index >= mid):
            y = dd.loc[m, "y5"].dropna(); fy = ff.loc[y.index]
            rr.append([int(fy.sum()), round(float((y[fy].mean() - y.mean()) * 100), 1)])
        sp_.append(rr)
    r["5일간격"] = sp_
    first = f & ~f.shift(1, fill_value=False).rolling(5, min_periods=1).max().astype(bool)
    rr = []
    for m in (d.index < mid, d.index >= mid):
        y = d.loc[m, "y5"].dropna(); fy = first.loc[y.index]
        rr.append([int(fy.sum()), round(float((y[fy].mean() - y.mean()) * 100), 1)])
    r["첫날"] = rr
    X0 = pd.concat([d["r5"] * 100, d["r20"] * 100, s5 * 100, s20 * 100], axis=1)
    X1 = pd.concat([X0, f.astype(float)], axis=1)
    y = d["y5"]; ok = y.notna() & X1.notna().all(axis=1); y, X0, X1 = y[ok], X0[ok], X1[ok]
    p0, p1, ix = [], [], []
    for Y in range(2018, 2027):
        tr = (y.index.year < Y) & (y.index < pd.Timestamp(f"{Y}-01-01") - pd.Timedelta(days=8)); te = y.index.year == Y
        if te.sum() == 0: continue
        w0 = prob.logistic_fit(X0.values[tr], y.values[tr], l2=2.0); w1 = prob.logistic_fit(X1.values[tr], y.values[tr], l2=2.0)
        p0 += list(sig(w0[0] + X0.values[te] @ w0[1:])); p1 += list(sig(w1[0] + X1.values[te] @ w1[1:])); ix += list(y.index[te])
    p0, p1, ix = np.array(p0), np.array(p1), pd.DatetimeIndex(ix); yy = y.reindex(ix).values; m2 = ix[len(ix) // 2]
    for nm, m in (("걷기앞", ix < m2), ("걷기뒤", ix >= m2), ("최근5년", ix >= ix[-1] - pd.Timedelta(days=1826))):
        r[nm] = [int(m.sum()), round(float(((p0[m] - yy[m]) ** 2).mean()), 5), round(float(((p1[m] - yy[m]) ** 2).mean()), 5)]
    w = prob.logistic_fit(X1.values, y.values, l2=2.0); r["계수"] = round(float(w[-1]), 3)
    yb = y.mean(); r["칸p5"] = [int(f.reindex(y.index).sum()), round(float(y[f.reindex(y.index)].mean() * 100), 1), round(float(yb * 100), 1)]
    print(mk, json.dumps(r, ensure_ascii=False))
