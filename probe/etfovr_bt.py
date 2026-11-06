"""#79 국가 ETF 「과잉반응」 — 국가 ETF 초과 등락(etfx)이 큰 날(|z|≥2) 다음 아시아 장이 닻 예측만큼 따라가나 — 확률 보강 일지 11/6 10시 (Actions)
닻 = 간밤 S&P(us) + 국가 ETF − 현지 등락(etfx) (+한국 SOX−S&P). z = etfx / 이전 60일 표준편차.
① 꼬리 날(|z|≥2) 닻 예측 평균 vs 실제 상승 비율(앞/뒤) ② 교차 로지스틱: 닻 vs 닻+꼬리넘침 vs etfx 잘라내기(±2σ) ③ 걸어가기(2010~)."""
import json
import numpy as np, pandas as pd, yfinance as yf
SY = ["^KS11", "^N225", "^HSI", "^GSPC", "^SOX", "EWY", "EWJ", "EWH"]
df = yf.download(SY, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
spr = C["^GSPC"].pct_change(); sxr = C["^SOX"].pct_change()
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
OUT = {}
for mk, ix, etf in (("KR", "^KS11", "EWY"), ("JP", "^N225", "EWJ"), ("HK", "^HSI", "EWH")):
    a = C[ix]; E = C[etf].pct_change(); ar = a.pct_change(); us_d = spr.dropna().index
    rows = []; days = a.index
    for i in range(2, len(days)):
        D, P = days[i], days[i - 1]; j = us_d.searchsorted(D) - 1
        if j < 0: continue
        t = us_d[j]
        if t < P or t not in E.index or pd.isna(E[t]) or t not in sxr.index or pd.isna(sxr[t]) or pd.isna(ar[P]): continue
        rows.append((D, float(spr[t]), float(E[t] - ar[P]), float(sxr[t] - spr[t]), int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "y"]).set_index("D")
    for c in ["us", "etfx", "sx"]: R[c] = R[c].clip(-0.08, 0.08) * 100
    sd = R["etfx"].rolling(60, min_periods=40).std().shift(1)
    R["z"] = R["etfx"] / sd
    R = R[(R.index >= "2002-01-01") & R["z"].notna()]
    R["over"] = np.sign(R["z"]) * np.clip(R["z"].abs() - 2, 0, None) * sd.reindex(R.index)   # 2σ 넘친 몫(%)
    R["clip"] = R["etfx"] - R["over"]                                                        # ±2σ 로 자른 etfx
    base = ["us", "etfx"] + (["sx"] if mk == "KR" else [])
    SETS = {"닻": base, "닻+넘침": base + ["over"], "잘라낸닻": [c if c != "etfx" else "clip" for c in base]}
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "꼬리날": int((R["z"].abs() >= 2).sum())}
    for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
        r = {"평소": brier(np.full(len(te), tr["y"].mean()), te["y"])}
        for lab, cols in SETS.items():
            w = fit(tr[cols].values, tr["y"].values); p = pr(w, te[cols].values); r[lab] = brier(p, te["y"]); r[lab + "_w"] = [round(float(v), 3) for v in w]
            if lab == "닻":
                cal = {}
                for cn, m in (("z≥+2", te["z"] >= 2), ("z≤−2", te["z"] <= -2), ("|z|<2", te["z"].abs() < 2)):
                    m = m.values; cal[cn] = [int(m.sum()), round(float(p[m].mean()) * 100, 1), round(float(te["y"].values[m].mean()) * 100, 1)] if m.sum() else None
                r["꼬리(n,예측%,실제%)"] = cal
        res[nm] = r
    wf = {k: [] for k in SETS}; ys = []
    for yr in range(2010, R.index[-1].year + 1):
        tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
        if not len(te): continue
        ys.append(te["y"].values)
        for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr["y"].values), te[cols].values))
    yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
    res["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2010~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근5년", slice(n - 1250, n)))}
    last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 2) for c in ["us", "etfx", "z", "over"]}}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
json.dump(OUT, open("probe/etfovr_bt.json", "w"), ensure_ascii=False, indent=1)
