"""#20 주말 비트코인 → 월요일(주말 뒤 첫날) 검증 — 확률 보강 일지 10/28 16시 (Actions 에서 실행)
행 t = 다음 거래일까지 3일 이상 비는 날(금요일 등). 특성 = 비트코인 UTC 일봉 종가 t → (다음 거래일 전날)
= 아시아 개장 직전(한국 09:00)까지 주말 동안의 등락. 목표 = 다음 거래일 오름(y1).
(1) 칸: 고정 ±3%·±1% · (2) 걸어가며 로지스틱: 기본(금요일 S&P 등락) vs 기본+주말 비트코인, 앞/뒤·최근5년 브라이어."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob

syms = sorted({c["ix"] for c in prob.MK.values()} | {"BTC-USD"})
H = prob.load_hist(syms)
btc = H["BTC-USD"]["Close"].astype(float).dropna()
btc = btc[~btc.index.duplicated(keep="last")]
print("BTC 이력", btc.index[0].date(), btc.index[-1].date(), len(btc))
sp = H["^GSPC"]["Close"].astype(float)
spr = sp.pct_change()


def wk_ret(idx):
    out = pd.Series(np.nan, index=idx)
    nxt = pd.Series(idx[1:].append(pd.DatetimeIndex([pd.NaT])), index=idx)
    for t in idx:
        t2 = nxt[t]
        if pd.isna(t2) or (t2 - t).days < 3:
            continue
        a = btc.asof(t); b = btc.asof(t2 - pd.Timedelta(days=1))
        if t < btc.index[0] or pd.isna(a) or pd.isna(b):
            continue
        out[t] = np.log(b / a)
    return out


def wfl(y, X0, X1, start="2016-01-01", minn=150):
    """걸어가며 로지스틱 — 그 시점 이전 행만으로 적합"""
    ok = y.notna() & X0.notna().all(axis=1) & X1.notna().all(axis=1)
    y, X0, X1 = y[ok], X0[ok], X1[ok]
    p0, p1, idx = [], [], []
    for i in range(len(y)):
        if i < minn or y.index[i] < pd.Timestamp(start):
            continue
        w0 = prob.logistic_fit(X0.values[:i], y.values[:i], l2=2.0)
        w1 = prob.logistic_fit(X1.values[:i], y.values[:i], l2=2.0)
        p0.append(1 / (1 + np.exp(-(w0[0] + X0.values[i] @ w0[1:]))))
        p1.append(1 / (1 + np.exp(-(w1[0] + X1.values[i] @ w1[1:]))))
        idx.append(y.index[i])
    p0, p1, idx = np.array(p0), np.array(p1), pd.DatetimeIndex(idx)
    yy = y.reindex(idx).values
    mid = idx[len(idx) // 2]
    r = {"n": len(idx), "mid": str(mid.date())}
    for nm, m in (("앞", idx < mid), ("뒤", idx >= mid), ("최근5년", idx >= idx[-1] - pd.Timedelta(days=1826))):
        r[nm] = [int(m.sum()), round(float(((p0[m] - yy[m]) ** 2).mean()), 5), round(float(((p1[m] - yy[m]) ** 2).mean()), 5)]
    w = prob.logistic_fit(X1.values, y.values, l2=2.0)
    r["coef_all"] = [round(float(v), 3) for v in w]
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2014-09-01"].copy()
    d["bw"] = wk_ret(d.index) * 100
    d["spf"] = spr.reindex(d.index) * 100 if mk == "US" else spr.reindex(spr.index.union(d.index)).ffill().reindex(d.index) * 100
    w = d[d["bw"].notna() & d["y1"].notna()].copy()
    base_all = d["y1"].mean()
    mid = w.index[len(w) // 2]
    R = {"n_wk": len(w), "평소_주말뒤": round(float(w["y1"].mean()), 3), "평소_전체": round(float(base_all), 3), "mid": str(mid.date()),
         "corr_bw_spf": round(float(w["bw"].corr(w["spf"])), 3), "now_bw": round(float(d["bw"].dropna().iloc[-1]), 2), "now_date": str(d["bw"].dropna().index[-1].date())}
    rows = {}
    for L, f in (("≤-3%", w["bw"] <= -3), ("-3~-1", (w["bw"] > -3) & (w["bw"] <= -1)), ("-1~+1", (w["bw"] > -1) & (w["bw"] < 1)),
                 ("+1~+3", (w["bw"] >= 1) & (w["bw"] < 3)), ("≥+3%", w["bw"] >= 3), ("≤-1%", w["bw"] <= -1), ("≥+1%", w["bw"] >= 1)):
        row = {}
        for half, msk in (("앞", w.index < mid), ("뒤", w.index >= mid)):
            s = w[msk & f]; b = w.loc[msk, "y1"].mean()
            row[half] = [len(s), round((s["y1"].mean() - b) * 100, 1) if len(s) else None]
        rows[L] = row
    R["칸"] = rows
    # 금요일 미국 등락이 이미 설명한 몫을 빼고도 남는지
    R["wf"] = wfl(w["y1"], w[["spf"]], w[["spf", "bw"]])
    # 비트코인 등락을 ±5% 로 자른 판
    w["bwc"] = w["bw"].clip(-5, 5)
    R["wf_clip5"] = wfl(w["y1"], w[["spf"]], w[["spf", "bwc"]])
    print(mk, json.dumps(R, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/btcwk_bt.json", "w"), ensure_ascii=False, indent=1)
