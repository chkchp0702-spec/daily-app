"""#41 대만 TSMC ADR(TSM) − 대만 현지(^TWII·2330.TW) 초과 등락 → 한국·일본 다음 장 — SOX 닻(#25) 위에 더해도 나아지나 — 확률 보강 일지 10/30 14시 (Actions)
(아래는 #25 틀) 미 반도체(^SOX) − S&P 초과 등락 → 한국·일본·홍콩 「다음 장」 방향 — 닻(간밤 S&P + 국가 ETF 초과) 위에 더해도 나아지나 — 확률 보강 일지 10/29 12시 (Actions)
아시아 D 장의 방향(종가 D > 종가 P) · 특성은 P~D 사이 마지막 미국 날 t: us=S&P 등락, etfx=국가 ETF 등락 − 아시아 P 등락, sx=SOX 등락 − S&P 등락.
① 두 기간 교차(앞→뒤·뒤→앞) 로지스틱 브라이어 ② 해마다 다시 맞추며 걸어가는 브라이어(2008~) ③ 칸: sx 잔차(us·etfx 로 설명 못 한 몫) ±1% 앞/뒤 상승 비율 ④ 지금 값."""
import json
import numpy as np, pandas as pd, yfinance as yf
SY = ["^KS11", "^N225", "^GSPC", "^SOX", "EWY", "EWJ", "TSM", "^TWII", "2330.TW"]
df = yf.download(SY, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
print({s: (str(v.index[0].date()), str(v.index[-1].date()), len(v)) for s, v in C.items()})
spr = C["^GSPC"].pct_change(); sxr = C["^SOX"].pct_change()
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
SETS = {"닻": ["us", "etfx"], "닻+sx": ["us", "etfx", "sx"], "닻+sx+tw": ["us", "etfx", "sx", "tw"], "닻+sx+tw2": ["us", "etfx", "sx", "tw2"], "닻+sx+twres": ["us", "etfx", "sx", "twres"], "닻+tw2": ["us", "etfx", "tw2"]}
tsr = C["TSM"].pct_change(); twi = C["^TWII"].pct_change(); tsl = C["2330.TW"].pct_change()
def asof(s, t):
    s = s.dropna(); k = s.index.searchsorted(t, side="right") - 1
    return np.nan if k < 0 or (t - s.index[k]).days > 4 else float(s.iloc[k])
OUT = {}
for mk, ix, etf in (("KR", "^KS11", "EWY"), ("JP", "^N225", "EWJ")):
    a = C[ix]; E = C[etf].pct_change(); ar = a.pct_change()
    us_d = spr.dropna().index
    rows = []
    days = a.index
    for i in range(2, len(days)):
        D, P = days[i], days[i - 1]
        j = us_d.searchsorted(D) - 1
        if j < 0: continue
        t = us_d[j]
        if t < P: continue
        if t not in sxr.index or t not in E.index or pd.isna(sxr[t]) or pd.isna(E[t]): continue
        if t not in tsr.index or pd.isna(tsr[t]): continue
        a1, a2 = asof(twi, t), asof(tsl, t)
        if np.isnan(a1) or np.isnan(a2): continue
        rows.append((D, float(spr[t]), float(E[t] - ar[P]), float(sxr[t] - spr[t]), float(tsr[t]) - a1, float(tsr[t]) - a2, int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "tw", "tw2", "y"]).set_index("D")
    R = R[R.index >= "2001-01-01"]
    for c in ["us", "etfx", "sx", "tw", "tw2"]: R[c] = R[c].clip(-0.08, 0.08) * 100
    bt = np.linalg.lstsq(np.c_[np.ones(len(R)), R[["us", "etfx", "sx"]].values], R["tw2"].values, rcond=None)[0]
    R["twres"] = R["tw2"] - np.c_[np.ones(len(R)), R[["us", "etfx", "sx"]].values] @ bt
    b = np.linalg.lstsq(np.c_[np.ones(len(R)), R[["us", "etfx"]].values], R["sx"].values, rcond=None)[0]
    R["sxres"] = R["sx"] - np.c_[np.ones(len(R)), R[["us", "etfx"]].values] @ b
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "corr": R[["us", "etfx", "sx", "tw", "tw2", "twres", "y"]].corr()["y"].round(3).to_dict(),
           "corr_sx_etfx": round(float(R["sx"].corr(R["etfx"])), 3), "corr_tw2_sx": round(float(R["tw2"].corr(R["sx"])), 3), "corr_tw2_etfx": round(float(R["tw2"].corr(R["etfx"])), 3)}
    for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
        r = {"평소": brier(np.full(len(te), tr["y"].mean()), te["y"])}
        for lab, cols in SETS.items():
            w = fit(tr[cols].values, tr["y"].values); r[lab] = brier(pr(w, te[cols].values), te["y"]); r[lab + "_w"] = [round(float(v), 3) for v in w]
        res[nm] = r
    # 해마다 다시 맞추며 걸어가기 (2008~)
    wf = {k: [] for k in SETS}; ys = []
    for yr in range(2010, R.index[-1].year + 1):
        tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
        if not len(te): continue
        ys.append(te["y"].values)
        for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr["y"].values), te[cols].values))
    yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
    res["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2010~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근5년", slice(n - 1250, n)))}
    # 칸: sx 잔차 ±1%
    cells = {}
    for half, T in (("앞", A), ("뒤", B)):
        cells[half] = {"평소": round(float(T["y"].mean()) * 100, 1)}
        for lab, m in (("twres≥+1.5", T["twres"] >= 1.5), ("twres≤−1.5", T["twres"] <= -1.5), ("tw2≥+2", T["tw2"] >= 2), ("tw2≤−2", T["tw2"] <= -2)):
            cells[half][lab] = [int(m.sum()), round(float(T.loc[m, "y"].mean()) * 100, 1) if m.sum() else None]
    res["칸"] = cells
    last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 2) for c in ["us", "etfx", "sx", "tw2", "twres"]}}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
# 지금 미국 마지막 날 값
t = spr.dropna().index[-1]
OUT["now_us"] = {"t": str(t.date()), "sp": round(float(spr[t]) * 100, 2), "sox": round(float(sxr[t]) * 100, 2), "sx": round(float(sxr[t] - spr[t]) * 100, 2), "tsm": round(float(tsr[t]) * 100, 2), "tw2": round((float(tsr[t]) - asof(tsl, t)) * 100, 2)}
print("now", OUT["now_us"])
json.dump(OUT, open("probe/tsm_bt.json", "w"), ensure_ascii=False, indent=1)
