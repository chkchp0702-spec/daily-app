"""#71 닛케이 VI(일본)·VHSI(홍콩) − VIX 백분위 — #69b 와 같은 방식으로 실제 닻 연속값 로지스틱 위에 — 확률 보강 11/5 11시 (Actions)
아시아 D 장 방향(종가 D > 종가 P) · 5일(종가 D+4 > 종가 P) · 특성: P~D 사이 마지막 미국 날 t 의 us·etfx·sx(#25 와 같음)
+ vkp(P 이하 마지막 VKOSPI 1년 백분위) · vixp(t 의 VIX 1년 백분위) · d=vkp−vixp · tail=d≤−? (1년 백분위 차의 1년 순위 ≤10%) · hi=vkp≥0.9.
① 두 기간 교차 로지스틱 ② 해마다 다시 맞추며 걸어가기(2012~) 앞/뒤·최근5년 ③ 닻 잔차 칸."""
import json
import numpy as np, pandas as pd, requests, yfinance as yf
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def cnbc(sym):
    try:
        r = requests.get(f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/1D/20030101000000/20261106000000/adjusted/EST5EDT.json", headers=UA, timeout=40)
        bars = r.json().get("barData", {}).get("priceBars", []) or []
    except Exception as e:
        print("cnbc", sym, "err", str(e)[:80]); return None
    v = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
    v = v[~v.index.duplicated(keep="last")]; v = v[v > 0]
    print("cnbc", sym, r.status_code, len(v), (v.index[0].date(), v.index[-1].date(), round(float(v.iloc[-1]), 2)) if len(v) else "")
    return v if len(v) > 500 else None
VOL = {}
for mk, cands in (("JP", [".JNIV", "JNIV", ".NKVI", ".JNIV.OS", ".NIV"]), ("HK", [".VHSI", "VHSI", ".HSIV", ".VHSI.HK"])):
    for c in cands:
        v = cnbc(c)
        if v is not None: VOL[mk] = v; break
SY = ["^N225", "^HSI", "^GSPC", "^SOX", "^VIX", "EWJ", "EWH"]
df = yf.download(SY, start="2007-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
spr = C["^GSPC"].pct_change(); sxr = C["^SOX"].pct_change()
vixp = C["^VIX"].rolling(252).rank(pct=True)
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
SETS = {"닻": ["us", "etfx", "sx"], "닻+d": ["us", "etfx", "sx", "d"], "닻+tail": ["us", "etfx", "sx", "tail"],
        "닻+vkp": ["us", "etfx", "sx", "vkp"], "닻+hi": ["us", "etfx", "sx", "hi"], "닻+d+vkp": ["us", "etfx", "sx", "d", "vkp"]}
OUT = {}
for mk, ix, etf in (("JP", "^N225", "EWJ"), ("HK", "^HSI", "EWH")):
    if mk not in VOL: print(mk, "자료 없음"); continue
    vkp = VOL[mk].rolling(252).rank(pct=True)
    a = C[ix]; E = C[etf].pct_change(); ar = a.pct_change(); us_d = spr.dropna().index; days = a.index
    rows = []
    for i in range(2, len(days) - 4):
        D, P = days[i], days[i - 1]
        j = us_d.searchsorted(D) - 1
        if j < 0: continue
        t = us_d[j]
        if t < P or t not in sxr.index or t not in E.index or pd.isna(sxr[t]) or pd.isna(E[t]): continue
        k = vkp.index.searchsorted(P, side="right") - 1
        if k < 0 or pd.isna(vkp.iloc[k]) or (P - vkp.index[k]).days > 6 or t not in vixp.index or pd.isna(vixp[t]): continue
        rows.append((D, float(spr[t]), float(E[t] - ar[P]), float(sxr[t] - spr[t]), float(vkp.iloc[k]), float(vixp[t]), int(a[D] > a[P]), int(a[days[i + 4]] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "vkp", "vixp", "y", "y5"]).set_index("D")
    for c in ["us", "etfx", "sx"]: R[c] = R[c].clip(-0.08, 0.08) * 100
    R["d"] = R["vkp"] - R["vixp"]
    R["tail"] = (R["d"].rolling(252, min_periods=120).rank(pct=True) <= 0.10).astype(float)
    R["hi"] = (R["vkp"] >= 0.9).astype(float)
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "corr_y": R[["us", "etfx", "sx", "d", "vkp", "tail", "y"]].corr()["y"].round(3).to_dict(),
           "corr_d_us": round(float(R["d"].corr(R["us"])), 3)}
    for ycol in ("y", "y5"):
        rr = {}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            q = {"평소": brier(np.full(len(te), tr[ycol].mean()), te[ycol])}
            for lab, cols in SETS.items():
                w = fit(tr[cols].values, tr[ycol].values); q[lab] = brier(pr(w, te[cols].values), te[ycol]); q[lab + "_w"] = [round(float(v), 3) for v in w[len(cols) - 1 + 1 - 1:]][-1]
            rr[nm] = q
        wf = {k: [] for k in SETS}; ys = []
        for yr in range(2012, R.index[-1].year + 1):
            tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
            if ycol == "y5": tr = tr.iloc[:-4]
            if not len(te): continue
            ys.append(te[ycol].values)
            for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr[ycol].values), te[cols].values))
        yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
        rr["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2012~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근5년", slice(n - 1250, n)))}
        res[ycol] = rr
    # 닻 잔차 칸: 닻 로지스틱(전체) 예측 대비 실제
    w0 = fit(R[["us", "etfx", "sx"]].values, R["y"].values); R["p0"] = pr(w0, R[["us", "etfx", "sx"]].values)
    cells = {}
    for half, T in (("앞", R[R.index < mid]), ("뒤", R[R.index >= mid])):
        cells[half] = {}
        for lab, m in (("tail", T["tail"] == 1), ("hi", T["hi"] == 1)):
            cells[half][lab] = [int(m.sum()), round(float((T.loc[m, "y"] - T.loc[m, "p0"]).mean()) * 100, 1) if m.sum() else None]
    res["닻잔차칸(실제−닻 %p)"] = cells
    last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 3) for c in ["us", "etfx", "sx", "vkp", "vixp", "d", "tail"]}}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
