"""#88 대만 가권(^TWII) 같은 날 등락 − 코스피 같은 날 등락 → 한국 다음 장 방향 — 닻(간밤 S&P + EWY 초과 + SOX) 위 — 확률 보강 일지 11/9 09시 (Actions)
#83 kweb_bt.py 틀 재사용. P = 한국 앞 거래일, D = 다음 장. tw = 대만 P 등락 − 코스피 P 등락(대만 13:30 마감 · 한국 15:30 → 같은 날 자료),
tw5 = 5일 누적 차이, twres = 닻 특성으로 설명 안 된 나머지, kr = 코스피 P 등락(대조).
① 두 기간 교차 로지스틱 브라이어 ② 해마다 다시 맞추며 걸어가는 브라이어(2010~) ③ 칸 ±1%p 앞/뒤 상승 비율 ④ 지금 값."""
import json
import numpy as np, pandas as pd, yfinance as yf
SY = ["^KS11", "^TWII", "^GSPC", "^SOX", "EWY"]
df = yf.download(SY, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
print({s: (str(v.index[0].date()), str(v.index[-1].date()), len(v)) for s, v in C.items()})
spr = C["^GSPC"].pct_change(); sxr = C["^SOX"].pct_change(); E = C["EWY"].pct_change()
a = C["^KS11"]; ar = a.pct_change(); tw = C["^TWII"]; twr = tw.pct_change()
tw5 = np.log(tw).diff(5); kr5 = np.log(a).diff(5)
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
us_d = spr.dropna().index; days = a.index; rows = []
for i in range(6, len(days)):
    D, P = days[i], days[i - 1]
    if P not in twr.index or pd.isna(twr[P]) or pd.isna(tw5.get(P, np.nan)): continue
    j = us_d.searchsorted(D) - 1
    if j < 0: continue
    t = us_d[j]
    if t < P or t not in E.index or pd.isna(E[t]) or pd.isna(sxr.get(t, np.nan)): continue
    rows.append((D, float(spr[t]), float(E[t] - ar[P]), float(sxr[t] - spr[t]), float(ar[P]), float(twr[P] - ar[P]), float(tw5[P] - kr5[P]), float(twr[P]), int(a[D] > a[P])))
R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "kr", "tw", "tw5", "twr", "y"]).set_index("D")
R = R[R.index >= "2002-01-01"]
for c in ["us", "etfx", "sx", "kr", "tw", "twr"]: R[c] = R[c].clip(-0.08, 0.08) * 100
R["tw5"] = R["tw5"].clip(-0.2, 0.2) * 100
base = ["us", "etfx", "sx"]
b = np.linalg.lstsq(np.c_[np.ones(len(R)), R[base].values], R["tw"].values, rcond=None)[0]
R["twres"] = R["tw"] - np.c_[np.ones(len(R)), R[base].values] @ b
SETS = {"닻": base, "닻+kr": base + ["kr"], "닻+tw": base + ["tw"], "닻+twres": base + ["twres"], "닻+tw5": base + ["tw5"], "닻+twr": base + ["twr"], "닻+tw+tw5": base + ["tw", "tw5"]}
mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()),
       "corr_y": R[["us", "etfx", "sx", "kr", "tw", "twres", "tw5", "twr"]].corrwith(R["y"]).round(3).to_dict(),
       "corr_tw_etfx": round(float(R["tw"].corr(R["etfx"])), 3)}
for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
    r = {"평소": brier(np.full(len(te), tr["y"].mean()), te["y"])}
    for lab, cols in SETS.items():
        w = fit(tr[cols].values, tr["y"].values); r[lab] = brier(pr(w, te[cols].values), te["y"]); r[lab + "_w"] = [round(float(v), 3) for v in w]
    res[nm] = r
wf = {k: [] for k in SETS}; ys = []
for yr in range(2010, R.index[-1].year + 1):
    tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
    if not len(te): continue
    ys.append(te["y"].values)
    for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr["y"].values), te[cols].values))
yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
res["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2010~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근3년", slice(max(0, n - 750), n)))}
cells = {}
for half, T in (("앞", A), ("뒤", B)):
    cells[half] = {"평소": round(float(T["y"].mean()) * 100, 1)}
    for lab, m in (("tw≥+1", T["tw"] >= 1), ("tw≤−1", T["tw"] <= -1), ("res≥+1", T["twres"] >= 1), ("res≤−1", T["twres"] <= -1), ("tw5≥+3", T["tw5"] >= 3), ("tw5≤−3", T["tw5"] <= -3)):
        cells[half][lab] = [int(m.sum()), round(float(T.loc[m, "y"].mean()) * 100, 1) if m.sum() else None]
res["칸"] = cells
last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 2) for c in ["us", "etfx", "kr", "tw", "twres", "tw5"]}}
P = a.index[-1]
res["오늘"] = {"P": str(P.date()), "kr": round(float(ar[P]) * 100, 2), "tw": round(float(twr.get(P, np.nan)) * 100, 2), "tw5-kr5": round(float(tw5.get(P, np.nan) - kr5[P]) * 100, 2)}
print("KR", json.dumps(res, ensure_ascii=False))
json.dump(res, open("probe/tw88_bt.json", "w"), ensure_ascii=False, indent=1)
