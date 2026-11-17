"""#114 (11/17 10시) 미국 장 마감 위치 CLV = (2C−H−L)/(H−L) (S&P 그날 고가·저가 사이 종가 위치, −1 저가 마감 ~ +1 고가 마감)
→ 아시아 다음 장(닻 위) · 미국 다음 날·5일. 확률 보강 일지 (Actions).
칸: CLV ≥0.6(고가 마감) / ≤−0.6(저가 마감) — 다음 날 오름% vs 평소, 그리고 「실제 − 닻 예측」(걸어가며) 앞/뒤(2013-06 기준).
걸어가기(2012~ 해마다 다시 맞춤): 닻[us, etfx, sx] vs 닻+clv · 닻+clv 꼬리(±0.6 표시) · 브라이어 앞/뒤/최근5년."""
import json
import numpy as np, pandas as pd, yfinance as yf
SY = ["^GSPC", "^KS11", "^N225", "^HSI", "000001.SS", "^SOX", "EWY", "EWJ", "EWH", "FXI"]
df = yf.download(SY, start="1999-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def col(s, f="Close"):
    x = df[s][f].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: col(s) for s in SY}
H, L = col("^GSPC", "High"), col("^GSPC", "Low")
sp = C["^GSPC"]; us_d = sp.index
rng = (H - L)
clv = ((2 * sp - H - L) / rng).where(rng > 0).clip(-1, 1)
clv = clv[clv.index >= "2000-01-01"]
print("CLV 날", int(clv.notna().sum()), "지금", str(clv.index[-1].date()), round(float(clv.iloc[-1]), 3), "평균", round(float(clv.mean()), 3))
spr = sp.pct_change(); sxr = C["^SOX"].pct_change()
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        Hm = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(Hm, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
MID = pd.Timestamp("2013-06-01")
OUT = {"clv_now": [str(clv.index[-1].date()), round(float(clv.iloc[-1]), 3)]}
def walk(R, base, extra_sets, tag):
    ys, P = [], {k: [] for k in ["base"] + list(extra_sets)}; idx = []
    for yr in range(2012, R.index[-1].year + 1):
        tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
        if not len(te): continue
        ys.append(te["y"].values); idx.append(te.index)
        P["base"].append(pr(fit(tr[base].values, tr["y"].values), te[base].values))
        for k, cols in extra_sets.items():
            P[k].append(pr(fit(tr[cols].values, tr["y"].values), te[cols].values))
    yy = np.concatenate(ys); ix = np.concatenate(idx); nn = len(yy); h = nn // 2
    res = {"n": nn}
    for k in P:
        p = np.concatenate(P[k])
        res[k] = {"앞": brier(p[:h], yy[:h]), "뒤": brier(p[h:], yy[h:]), "최근5년": brier(p[-1250:], yy[-1250:])}
    # 꼬리 날 실제 − 닻
    p0 = np.concatenate(P["base"]); cv = R.loc[ix, "clv"].values
    for nm, m in (("고가마감", cv >= 0.6), ("저가마감", cv <= -0.6)):
        out = {}
        for seg, sl in (("앞", slice(0, h)), ("뒤", slice(h, nn))):
            mm = m[sl]
            out[seg] = [int(mm.sum()), round(float(yy[sl][mm].mean() * 100), 1), round(float(p0[sl][mm].mean() * 100), 1)] if mm.sum() else None
        res["칸_실제vs닻_" + nm] = out
    print(tag, json.dumps(res, ensure_ascii=False)); return res
for mk, ix, etf in (("KR", "^KS11", "EWY"), ("JP", "^N225", "EWJ"), ("HK", "^HSI", "EWH"), ("CN", "000001.SS", "FXI")):
    a = C[ix]; E = C[etf].pct_change(); ar = a.pct_change(); days = a.index; rows = []
    for i in range(2, len(days)):
        D, Pd = days[i], days[i - 1]
        j = us_d.searchsorted(D) - 1
        if j < 1: continue
        t = us_d[j]
        if t < Pd or pd.isna(clv.get(t, np.nan)) or pd.isna(E.get(t, np.nan)) or pd.isna(sxr.get(t, np.nan)): continue
        y1 = int(a[D] > a[Pd]); y5 = int(a.iloc[min(i + 4, len(a) - 1)] > a[Pd]) if i + 4 < len(a) else np.nan
        rows.append((D, spr[t], E[t] - ar[Pd], sxr[t] - spr[t], clv[t], y1, y5))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "clv", "y", "y5"]).set_index("D")
    for c in ["us", "etfx", "sx"]: R[c] = R[c].astype(float).clip(-0.15, 0.15) * 100
    R["hi"] = (R["clv"] >= 0.6).astype(float); R["lo"] = (R["clv"] <= -0.6).astype(float)
    # 단순 칸
    st = {}
    for seg, m0 in (("앞", R.index < MID), ("뒤", R.index >= MID)):
        b = R[m0]; st[seg] = {"평소": [len(b), round(b["y"].mean() * 100, 1)],
            "고가마감": [int(b["hi"].sum()), round(b.loc[b.hi == 1, "y"].mean() * 100, 1)],
            "저가마감": [int(b["lo"].sum()), round(b.loc[b.lo == 1, "y"].mean() * 100, 1)]}
    print(mk, "칸", json.dumps(st, ensure_ascii=False))
    base = ["us", "etfx", "sx"]
    r1 = walk(R, base, {"+clv": base + ["clv"], "+꼬리": base + ["hi", "lo"]}, mk + " 다음날")
    R5 = R.dropna(subset=["y5"]).copy(); R5["y"] = R5["y5"].astype(int)
    r5 = walk(R5, base, {"+clv": base + ["clv"], "+꼬리": base + ["hi", "lo"]}, mk + " 5일")
    OUT[mk] = {"칸": st, "다음날": r1, "5일": r5}
# 미국 자신: CLV(t) → t+1, t+5
R = pd.DataFrame({"us": spr * 100, "clv": clv})
R["y"] = (sp.shift(-1) > sp).astype(float); R["y5"] = (sp.shift(-5) > sp).astype(float)
R = R.dropna(); R = R.iloc[:-5]
R["us"] = R["us"].clip(-15, 15); R["hi"] = (R["clv"] >= 0.6).astype(float); R["lo"] = (R["clv"] <= -0.6).astype(float)
st = {}
for seg, m0 in (("앞", R.index < MID), ("뒤", R.index >= MID)):
    b = R[m0]; st[seg] = {k: [int(len(b) if k == "평소" else b[c].sum()), round(b.loc[(b[c] == 1) if c else slice(None), "y"].mean() * 100, 1), round(b.loc[(b[c] == 1) if c else slice(None), "y5"].mean() * 100, 1)] for k, c in (("평소", None), ("고가마감", "hi"), ("저가마감", "lo"))}
print("US 칸(n·다음날·5일)", json.dumps(st, ensure_ascii=False))
u1 = walk(R, ["us"], {"+clv": ["us", "clv"], "+꼬리": ["us", "hi", "lo"]}, "US 다음날")
R5 = R.copy(); R5["y"] = R5["y5"]
u5 = walk(R5, ["us"], {"+clv": ["us", "clv"], "+꼬리": ["us", "hi", "lo"]}, "US 5일")
OUT["US"] = {"칸": st, "다음날": u1, "5일": u5}
json.dump(OUT, open("probe/clv114_bt.json", "w"), ensure_ascii=False, indent=1)
print("JSON", json.dumps(OUT, ensure_ascii=False))
