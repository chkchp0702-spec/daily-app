"""#102 비트코인 「아시아 개장 직전 24시간」 등락 → 한·일·중·홍 다음 날(닻 위) · 5일 꼬리 → 5개 시장 — 확률 보강 11/12 10시 (Actions)
근거: The Structural Shifts in Bitcoin's Role as a Predictor of the KOSPI Index https://scholar.kyobobook.co.kr/article/detail/4010068533303
야후 BTC-USD 일봉 종가(UTC 자정 = 한국 09:00). 행 t(그 나라 날짜) → 특성 = BTC 종가[t] / 종가[t-1] (한국 09:00 t → 09:00 t+1, 개장 전 알 수 있음).
닻(간밤 S&P 등락 + 국가 ETF 초과 + 자기 하루 등락) 위에 BTC z(60일 흔들림으로 나눔) 더해 교차·걸어가기(해마다 다시 맞춤) 브라이어 + 잔차 칸.
5일: BTC 5일 등락 1년 순위 꼬리(≥90·≤10) → y5, S&P 5일 꼬리 칸 위."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

ETF = {"KR": "EWY", "JP": "EWJ", "HK": "EWH", "CN": "FXI"}
syms = sorted({c["ix"] for c in prob.MK.values()} | {"BTC-USD"} | set(ETF.values()))
H = prob.load_hist(syms)
btc = H["BTC-USD"]["Close"].astype(float).dropna()
print("BTC", btc.index[0].date(), btc.index[-1].date(), len(btc))
bl = np.log(btc).diff()
bz = bl / bl.rolling(60, min_periods=30).std().shift(1)
b5 = prob_x.rank252(np.log(btc).diff(5))
sp = H["^GSPC"]["Close"].astype(float)
spr = np.log(sp).diff()
print("지금 BTC 하루", round(float(bl.iloc[-1]) * 100, 2), "% z", round(float(bz.iloc[-1]), 2), "5일 순위", round(float(b5.iloc[-1]), 3))


def sig(x):
    return 1 / (1 + np.exp(-x))


def pr(X, w):
    return sig(w[0] + X @ w[1:])


def bs(p, y):
    return round(float(((p - y) ** 2).mean()), 5)


out = {}
for mk in ["KR", "JP", "CN", "HK"]:
    d = prob.feats(H[prob.MK[mk]["ix"]]); d = d[d.index >= "2014-10-01"].copy()
    ix = d.index
    # 같은 날짜 미국(뉴욕 t 마감 = 아시아 t+1 개장 전)
    s1 = spr.reindex(ix, method="ffill")
    e = H[ETF[mk]]["Close"].astype(float)
    ex = (np.log(e).diff() - spr).reindex(ix, method="ffill")
    # 한국 날짜 t 의 BTC 종가 = UTC t 23:59 → 한국 t+1 09:00
    z = bz.reindex(ix, method="ffill").clip(-4, 4)
    X0 = pd.concat([s1 * 100, ex * 100, d["r"] * 100], axis=1)
    X1 = pd.concat([X0, z], axis=1)
    y = d["y1"]
    ok = y.notna() & X1.notna().all(axis=1)
    y, X0, X1 = y[ok], X0[ok], X1[ok]
    mid = y.index[len(y) // 2]
    A, B = y.index < mid, y.index >= mid
    r = {"n": int(len(y)), "mid": str(mid.date()), "corr_z_s1": round(float(np.corrcoef(X1.iloc[:, -1], X1.iloc[:, 0])[0, 1]), 2)}
    for nm, tr, te in (("앞→뒤", A, B), ("뒤→앞", B, A)):
        w0 = prob.logistic_fit(X0.values[tr], y.values[tr], l2=2.0)
        w1 = prob.logistic_fit(X1.values[tr], y.values[tr], l2=2.0)
        r[nm] = [bs(pr(X0.values[te], w0), y.values[te]), bs(pr(X1.values[te], w1), y.values[te]), round(float(w1[-1]), 3)]
    # 걸어가기 — 해마다 그 전 자료로 다시 맞춤 (2017~)
    p0, p1, idx = [], [], []
    for Y in range(2017, 2027):
        tr = y.index.year < Y; te = y.index.year == Y
        if te.sum() == 0:
            continue
        w0 = prob.logistic_fit(X0.values[tr], y.values[tr], l2=2.0)
        w1 = prob.logistic_fit(X1.values[tr], y.values[tr], l2=2.0)
        p0 += list(pr(X0.values[te], w0)); p1 += list(pr(X1.values[te], w1)); idx += list(y.index[te])
    p0, p1, idx = np.array(p0), np.array(p1), pd.DatetimeIndex(idx); yy = y.reindex(idx).values
    m2 = idx[len(idx) // 2]
    for nm, m in (("걷기앞", idx < m2), ("걷기뒤", idx >= m2), ("최근5년", idx >= idx[-1] - pd.Timedelta(days=1826))):
        r[nm] = [int(m.sum()), bs(p0[m], yy[m]), bs(p1[m], yy[m])]
    # 잔차 칸: 닻만 맞춘 확률 대비 BTC z 꼬리 날 실제 상승
    w0 = prob.logistic_fit(X0.values, y.values, l2=2.0); pa = pr(X0.values, w0)
    zz = X1.iloc[:, -1]
    for nm, msk in (("z≥+1.5", zz >= 1.5), ("z≤−1.5", zz <= -1.5)):
        rr = []
        for h in (A, B):
            m = msk.values & h
            rr.append([int(m.sum()), round(float((y.values[m] - pa[m]).mean() * 100), 1)])
        r[nm] = rr
    # 5일 꼬리
    dd = prob.feats(H[prob.MK[mk]["ix"]]); dd = dd[dd.index >= "2015-10-01"]
    rb = b5.reindex(dd.index, method="ffill"); rs = prob_x.rank252(np.log(sp).diff(5)).reindex(dd.index, method="ffill")
    y5 = dd["y5"]; mm = dd.index[len(dd) // 2]
    for nm, f in (("5일≥90", rb >= 0.9), ("5일≤10", rb <= 0.1), ("5일≥90&S&P꼬리아님", (rb >= 0.9) & (rs < 0.9)), ("5일≤10&S&P꼬리아님", (rb <= 0.1) & (rs > 0.1))):
        rr = []
        for h in (dd.index < mm, dd.index >= mm):
            yv = y5[h].dropna(); fy = f.reindex(yv.index).fillna(False)
            rr.append([int(fy.sum()), round(float((yv[fy].mean() - yv.mean()) * 100), 1)])
        r[nm] = rr
    out[mk] = r
    print(mk, json.dumps(r, ensure_ascii=False))

# 미국 5일 꼬리
dd = prob.feats(H["^GSPC"]); dd = dd[dd.index >= "2015-10-01"]
rb = b5.reindex(dd.index, method="ffill"); mm = dd.index[len(dd) // 2]; r = {}
for nm, f in (("5일≥90", rb >= 0.9), ("5일≤10", rb <= 0.1)):
    rr = []
    for h in (dd.index < mm, dd.index >= mm):
        yv = dd["y5"][h].dropna(); fy = f.reindex(yv.index).fillna(False)
        rr.append([int(fy.sum()), round(float((yv[fy].mean() - yv.mean()) * 100), 1)])
    r[nm] = rr
print("US", json.dumps(r, ensure_ascii=False))
