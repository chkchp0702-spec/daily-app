"""#8 거래대금(거래량) 급증 검증 — 확률 보강 일지 10/21 16시 (Actions 에서 실행)
   지수 거래량 5일 평균 ÷ 60일 평균 의 1년 백분위 → 5칸 / 꼬리(≥90·≤10) / 「급증+하락(투매)」 꼬리
   걸어가며(그날 이전 자료만, 사전 150) 칸별 비율 → 브라이어 평소 vs 방법, 앞/뒤 절반·최근 2년"""
import json, sys, os
import numpy as np, pandas as pd, yfinance as yf
sys.path.insert(0, os.getcwd())
import prob

def wf(d, lab, ycol, prior=150, start="2005-01-01"):
    y = d[ycol]; h = 1 if ycol == "y1" else 5
    ok = y.notna()
    known = y.where(ok).shift(h); base = known.expanding().mean()
    p = base.copy()
    labs = [l for l in lab.dropna().unique()]
    for L in labs:
        t = (lab == L); ts = t.shift(h, fill_value=False).astype(bool)
        k = known.where(ts).fillna(0).cumsum(); n = (known.notna() & ts).astype(float).cumsum()
        pt = (k + prior * base) / (n + prior)
        p = p.where(~t, pt)
    ev = ok & (d.index >= start) & base.notna() & lab.notna()
    ix = d.index[ev]
    if len(ix) < 300: return None
    mid = ix[len(ix) // 2]; res = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근2년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=730)))):
        cells = {}
        for L in labs:
            mt = msk & (lab == L)
            if mt.sum(): cells[str(L)] = [int(mt.sum()), round(float(y[mt].mean() - y[msk].mean()) * 100, 1)]
        res[nm] = {"브라이어": [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5)],
                   "평소": round(float(y[msk].mean()) * 100, 1), "칸(n,차이%p)": cells}
    return res

out = {}
for mk, cfg in prob.MK.items():
    s = cfg["ix"]
    px = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(px.columns, pd.MultiIndex): px.columns = px.columns.get_level_values(0)
    px.index = pd.to_datetime(px.index).tz_localize(None)
    px = px[["Open", "Close", "Volume"]].dropna(subset=["Close"])
    v = px["Volume"].astype(float).replace(0, np.nan)
    d = prob.feats(px)
    vr = v.rolling(5, min_periods=4).mean() / v.rolling(60, min_periods=40).mean()
    rk = vr.rolling(252, min_periods=120).rank(pct=True)
    first = v.dropna().index[0] if v.notna().any() else None
    print("==", mk, s, "거래량 있는 날", int(v.notna().sum()), "부터", first, "지금 vr", round(float(vr.iloc[-1]), 3), "백분위", round(float(rk.iloc[-1]), 3))
    if v.notna().sum() < 1500: out[mk] = {"skip": "거래량 자료 부족"}; continue
    d = d[d.index >= first]; rk = rk.reindex(d.index)
    lab5 = pd.cut(rk, [-0.01, 0.2, 0.4, 0.6, 0.8, 1.01], labels=["매우적음", "적음", "보통", "많음", "급증"]).astype(object).where(rk.notna())
    tailH = pd.Series(np.where(rk >= 0.9, "급증≥90", "그외"), index=d.index).where(rk.notna())
    tailL = pd.Series(np.where(rk <= 0.1, "가뭄≤10", "그외"), index=d.index).where(rk.notna())
    dn = d["r5"] < -0.02
    capit = pd.Series(np.where((rk >= 0.8) & dn, "급증+5일↓2%", "그외"), index=d.index).where(rk.notna())
    upv = pd.Series(np.where((rk >= 0.8) & (d["r5"] > 0.02), "급증+5일↑2%", "그외"), index=d.index).where(rk.notna())
    R = {"now": [str(d.index[-1].date()), round(float(vr.iloc[-1]), 3), round(float(rk.iloc[-1]), 3), round(float(d["r5"].iloc[-1]) * 100, 2)]}
    for nm, lab in (("5칸", lab5), ("급증꼬리", tailH), ("가뭄꼬리", tailL), ("투매", capit), ("급증상승", upv)):
        for yc in ("y1", "y5"):
            r = wf(d, lab, yc); R.setdefault(nm, {})[yc] = r
            if r: print(mk, nm, yc, json.dumps({k: v for k, v in r.items() if k != "mid"}, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/vol_bt.json", "w"), ensure_ascii=False, indent=1)
