"""#98b EPU 「아주 잠잠」 → 한국·중국 일주일 — 두 시장 묶기 · 절대 수준 칸 · VIX 수준 칸 위 겹침 — 11/11 13시 (Actions)
자료: policyuncertainty.com All_Daily_Policy_Data.csv (7일 평균, 하루 늦게).
칸: Q = EPU 1년 순위 ≤10 · A = EPU7 절대 수준 전체 이력 하위 20% 이하(걸어가며 확장 분위).
기존: VIX 1년 순위 5칸 · 🌡️ VIX÷VIX3M 5칸. 브라이어(걸어가며 사전 100) 앞/뒤·최근5년 · 5일 간격 교차 로지스틱(두 시장 묶음)."""
import json, sys, os, io
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd())
import prob, prob_x
r = requests.get("https://www.policyuncertainty.com/media/All_Daily_Policy_Data.csv", headers={"User-Agent": "Mozilla/5.0"}, timeout=60)
t = pd.read_csv(io.StringIO(r.text))
epu = pd.Series(pd.to_numeric(t["daily_policy_index"], errors="coerce").values,
                index=pd.to_datetime(dict(year=t["year"], month=t["month"], day=t["day"]))).dropna().sort_index()
print("EPU", epu.index[0].date(), epu.index[-1].date(), len(epu))
m7 = epu.rolling(7, min_periods=5).mean()
bd = pd.bdate_range(m7.index[0], m7.index[-1])
m7 = m7.reindex(bd).ffill().shift(1).dropna()
rkq = prob_x.rank252(np.log(m7))
absq = m7.expanding(500).quantile(0.2)          # 걸어가며 하위 20% 경계
Aflag = (m7 <= absq).astype(float).where(absq.notna())
print("now epu7", round(float(m7.iloc[-1]), 1), "rank", round(float(rkq.iloc[-1]), 3), "abs20", round(float(absq.iloc[-1]), 1))

syms = sorted({prob.MK[k]["ix"] for k in ("KR", "CN")} | {"^VIX", "^VIX3M"})
H = prob.load_hist(syms)
v = H["^VIX"]["Close"].dropna(); v3 = H["^VIX3M"]["Close"].dropna()
vt = (v / v3.reindex(v.index).ffill()).dropna()
vtb = pd.cut(vt, [0, 0.85, 0.95, 1.0, 1.1, 9], labels=list("abcde")).astype(object)
vr = prob_x.rank252(v)
vrb = pd.cut(vr, [-.01, .2, .4, .6, .8, 1.01], labels=list("12345")).astype(object)
print("corr EPU rank vs VIX rank", round(float(pd.concat([rkq, vr], axis=1).dropna().corr().iloc[0, 1]), 2))

def model(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in lab.dropna().unique():
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p

def brier(d, ycol, ps, ok0):
    y = d[ycol]; ok = y.notna() & ok0
    for p in ps: ok &= p.notna()
    idx = d.index[ok]; mid = idx[len(idx) // 2]; r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid)), ("최근5년", ok & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for p in ps]
    return r

def fit(Xa, ya, l2=1.0):
    w = np.zeros(Xa.shape[1] + 1); A = np.c_[np.ones(len(Xa)), Xa]
    for _ in range(100):
        p = 1 / (1 + np.exp(-A @ w)); g = A.T @ (p - ya) / len(ya) + l2 * np.r_[0, w[1:]] / len(ya)
        Hm = (A.T * (p * (1 - p))) @ A / len(ya) + l2 * np.eye(len(w)) / len(ya)
        w -= np.linalg.solve(Hm, g)
    return w

out = {}; pool = []
for mk in ("KR", "CN"):
    d = prob.feats(H[prob.MK[mk]["ix"]]); d = d[d.index >= "2008-01-01"].copy()
    al = lambda s: prob_x.align(s, d.index)
    Q = (al(rkq) <= 0.1); A = al(Aflag) == 1; VB = al(vrb); TB = al(vtb)
    ok = al(rkq).notna() & VB.notna() & TB.notna() & d["y5"].notna() & al(Aflag).notna()
    R = {"now": {"Q": bool(Q.iloc[-1]), "A": bool(A.iloc[-1]), "VIX칸": VB.iloc[-1]}}
    # 칸: VIX 수준 칸별 Q vs 나머지
    idx = d.index[ok]; mid = idx[len(idx) // 2]
    for nm, f in (("Q", Q), ("A", A), ("Q&A", Q & A)):
        rr = {}
        for half, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid))):
            rr[half] = [int((f & msk).sum()), round((d.loc[f & msk, "y5"].mean() - d.loc[msk, "y5"].mean()) * 100, 1)]
            # VIX 칸 안에서 차이(칸 평균 빼고)
            bm = d.loc[msk, "y5"].groupby(VB[msk]).mean(); res = d["y5"] - VB.map(bm).astype(float)
            rr[half + "_VIX칸안"] = round(float(res[f & msk].mean()) * 100, 1)
            pos = np.arange(len(d))
            rr[half + "_5일간격"] = [round((d.loc[f & msk & (pos % 5 == s), "y5"].mean() - d.loc[msk & (pos % 5 == s), "y5"].mean()) * 100, 1) for s in range(5)]
        rr["VIX칸분포"] = {k: int(v) for k, v in VB[f & ok].value_counts().sort_index().items()}
        R[nm] = rr
    # 걸어가며 브라이어: [VIX5, VIX5×Q, VIX5×A, VIX3M5, VIX3M5×Q, VIX3M5×A]
    labs = [VB.where(ok), (VB + Q.map({True: "q", False: ""})).where(ok), (VB + A.map({True: "q", False: ""})).where(ok),
            TB.where(ok), (TB + Q.map({True: "q", False: ""})).where(ok), (TB + A.map({True: "q", False: ""})).where(ok)]
    ps = [model(d, L, "y5", 5) for L in labs]
    R["걸어가기[V,V×Q,V×A,T,T×Q,T×A]"] = brier(d, "y5", ps, ok & (d.index >= "2010-01-01"))
    out[mk] = R; print(mk, json.dumps(R, ensure_ascii=False))
    X = pd.get_dummies(VB.where(ok)).astype(float).add_prefix("v")
    X = pd.concat([X, pd.get_dummies(TB.where(ok)).astype(float).add_prefix("t")], axis=1)
    X["CN"] = 1.0 if mk == "CN" else 0.0; X["Q"] = Q.astype(float); X["A"] = A.astype(float)
    X["y"] = d["y5"]; X["first"] = d.index < mid; X["ok"] = ok & (pd.Series(np.arange(len(d)) % 5 == 0, index=d.index))
    pool.append(X[X["ok"]])
P = pd.concat(pool).fillna(0)
base = [c for c in P.columns if c[0] in "vt" or c == "CN"]
cx = {}
for nmx, tr in (("앞→뒤", True), ("뒤→앞", False)):
    a = P[P["first"] == tr]; b = P[P["first"] != tr]; res = []
    for extra in ([], ["Q"], ["A"]):
        cols = base + extra; w = fit(a[cols].values, a["y"].values)
        pb = 1 / (1 + np.exp(-(np.c_[np.ones(len(b)), b[cols].values] @ w)))
        res.append([round(float(((pb - b["y"].values) ** 2).mean()), 5), round(float(w[-1]), 3) if extra else None])
    cx[nmx] = res
out["묶음교차(5일간격)[base,+Q,+A]"] = cx; out["n묶음"] = int(len(P))
print("POOL", json.dumps(cx, ensure_ascii=False), len(P))
json.dump(out, open("probe/epu98b_bt.json", "w"), ensure_ascii=False, indent=1)
