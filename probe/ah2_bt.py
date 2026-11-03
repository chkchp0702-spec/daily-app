"""#60b 중국 「A 프리미엄 5일 급등」(≥90) 다음 5일 다시 — 확률 보강 일지 11/3 15시 (Actions)
#60 ➖: 칸 −8.5·−7.0%p(n 212·243)인데 걸어가기 앞 나빠짐 · 자기 5일 ≥90 와 87일 겹침.
→ 5일 간격 표본(시작점 5개) · 사건 솎기 · 자기 ≥90 겹친 날 뺀 「순수」 · 5일 간격 걸어가기(칸 곱하기·덧셈형) · 5일 간격 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, lab, one, logit_fit

PAIRS = [("0939.HK", "601939.SS"), ("1398.HK", "601398.SS"), ("0857.HK", "601857.SS"), ("3988.HK", "601988.SS"),
         ("2318.HK", "601318.SS"), ("0386.HK", "600028.SS"), ("1288.HK", "601288.SS"), ("0998.HK", "601998.SS"),
         ("0914.HK", "600585.SS"), ("2628.HK", "601628.SS"), ("0168.HK", "600600.SS"), ("1088.HK", "601088.SS")]
H = prob.load_hist(sorted({"000001.SS", "^GSPC", "HKDCNY=X"} | {a for p in PAIRS for a in p}))
def cs(s):
    if s not in H: return pd.Series(dtype=float)
    x = H[s]["Close"].dropna(); return x[x > 0]
fx = cs("HKDCNY=X"); lp = []
for h, a in PAIRS:
    hh, aa = cs(h), cs(a)
    if hh.empty or aa.empty: continue
    idx = hh.index.intersection(aa.index)
    f = fx.reindex(idx.union(fx.index)).ffill().reindex(idx)
    r = np.log(aa.reindex(idx) / (hh.reindex(idx) * f)).dropna()
    r = r[(r.diff().abs() < 0.25) | r.diff().isna()]; lp.append(r.rename(h))
P = pd.concat(lp, axis=1); own = P.where(P.notna().sum(axis=1) >= 6).mean(axis=1).dropna()
lo = lambda p: np.log(p / (1 - p))
d = prob.feats(H["000001.SS"]); d = d[d.index >= "2003-01-01"].copy()
A_ = lambda s: prob_x.align(prob_x.rank252(s), d.index)
ro = A_(np.log(cs("000001.SS")).diff(5)); rs = A_(np.log(cs("^GSPC")).diff(5)); rg = A_(own.diff(5))
v = ro.notna() & rs.notna() & rg.notna(); dd = d[v].copy(); ro, rs, rg = ro[v], rs[v], rg[v]
fh = rg >= .9; pure = fh & ~(ro >= .9)
def thin(f):
    th = f.copy(); last = -99
    for i in range(len(f)):
        if f.iloc[i]:
            if i - last < 5: th.iloc[i] = False
            else: last = i
    return th
th = thin(fh); pos = np.arange(len(dd)); y5 = dd["y5"]; mid = dd.index[len(dd) // 2]
r5 = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
cells = {}
def cell(f, name):
    r = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5)):
        mm = msk & y5.notna(); b0 = y5[mm].mean(); s = y5[mm & f]
        r[half] = [int(len(s)), round((s.mean() - b0) * 100, 1) if len(s) else None]
    cells[name] = r
cell(fh, "전체(겹침)"); cell(th, "사건 솎기"); cell(pure, "순수(자기≥90 뺌)")
for k in range(5): cell(fh & pd.Series(pos % 5 == k, index=dd.index), f"5일 간격 시작{k}")
oth = lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl"); eg = one(rg, fh, "g")
pb = wf(dd, oth, "y5", 5)[0]; bse = y5.shift(5).expanding().mean()
known = y5.shift(5); fk = fh.shift(5, fill_value=False)
pl = (known.where(fk).fillna(0).cumsum() + 100 * bse) / ((known.notna() & fk).astype(float).cumsum() + 100)
Pm = {"기존": pb, "칸곱": wf(dd, oth + "|" + eg, "y5", 5)[0]}
for w in (0.3, 0.5, 1.0):
    pa = pb.copy(); m = fh & pb.notna() & pl.notna()
    pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m]))))); Pm[f"덧셈 w{w}"] = pa
st = dd.index[400]; wfr = {}
for k in range(5):
    ev = y5.notna() & (dd.index >= st) & pd.Series(pos % 5 == k, index=dd.index)
    for p in Pm.values(): ev &= p.notna()
    mi = dd.index[ev][len(dd.index[ev]) // 2]; rr = {}
    for nm, msk in (("앞", ev & (dd.index < mi)), ("뒤", ev & (dd.index >= mi)), ("최근5년", ev & r5)):
        rr[nm] = {kk: round(float(((p[msk] - y5[msk]) ** 2).mean()), 5) for kk, p in Pm.items()}
    wfr[f"시작{k}"] = rr
avg = {nm: {kk: round(float(np.mean([wfr[f"시작{k}"][nm][kk] for k in range(5)])), 5) for kk in Pm} for nm in ("앞", "뒤", "최근5년")}
D = pd.DataFrame({"c": 1.0, "oh": ro >= .9, "ol": ro <= .1, "sh": rs >= .9, "sl": rs <= .1, "g": fh}, index=dd.index).astype(float)
cx = {nm: {"기존": [], "+급등": [], "계수": []} for nm in ("앞→뒤", "뒤→앞")}
for k in range(5):
    m = y5.notna() & pd.Series(pos % 5 == k, index=dd.index); idx = dd.index[m]; mi = idx[len(idx) // 2]
    yv = y5[m].values.astype(float); X = D[m].values; a, b_ = idx < mi, idx >= mi
    for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
        for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("+급등", [0, 1, 2, 3, 4, 5])):
            w = logit_fit(X[tr][:, cols], yv[tr]); p = 1 / (1 + np.exp(-X[te][:, cols] @ w))
            cx[nm][kk].append(float(((p - yv[te]) ** 2).mean()))
            if kk != "기존": cx[nm]["계수"].append(round(float(w[5]), 3))
for nm in cx:
    for kk in ("기존", "+급등"): cx[nm][kk] = round(float(np.mean(cx[nm][kk])), 5)
out = {"n": len(dd), "mid": str(mid.date()), "기간": [str(dd.index[0].date()), str(dd.index[-1].date())], "급등일": int(fh.sum()),
       "솎은 사건": int(th.sum()), "순수": int(pure.sum()), "cur_rank": round(float(rg.iloc[-1]), 3),
       "칸(n,y5차%p)": cells, "걸어가기 5일간격 평균": avg, "걸어가기 시작별": wfr, "교차(5개 평균)": cx}
print("R", json.dumps(out, ensure_ascii=False))
json.dump(out, open("probe/ah2_bt.json", "w"), ensure_ascii=False, indent=1)
