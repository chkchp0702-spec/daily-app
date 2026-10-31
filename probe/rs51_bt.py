"""#51 일본 「혼자 약함」(닛케이 5일 − S&P 5일(간밤 뺀 같은 창) 1년 순위 ≤10%) 다음 날 — 확률 보강 일지 10/31 16시 (Actions)
#49 ➖: 교차 로지스틱만 좋아짐. 칸 수 줄인 걸어가기(간밤 S&P 3칸)·사건 솎기(4일 안 겹침 뺌)로 다시."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, lab, one, logit_fit

cfg = prob.MK["JP"]
H = prob.load_hist([cfg["ix"], "^GSPC"])
sp = H["^GSPC"]["Close"].dropna(); sp = sp[sp > 0]
d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2000-01-01"].copy()
own5 = np.log(d["c"]).diff(5)
sp5 = prob_x.align(np.log(sp).diff(5).shift(1), d.index)
sp1 = prob_x.align(np.log(sp).diff(1), d.index)
r1s = prob_x.align(prob_x.rank252(np.log(sp).diff(1)), d.index)
rel = own5 - sp5
rr = prob_x.rank252(rel.dropna()).reindex(d.index)
ro = prob_x.rank252(own5.dropna()).reindex(d.index)
rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
v = rr.notna() & ro.notna() & rs.notna() & r1s.notna()
dd = d[v].copy(); rr, ro, rs, r1s, sp1 = rr[v], ro[v], rs[v], r1s[v], sp1[v]
fl = rr <= .1
# 사건 솎기: 앞 4거래일 안에 이미 약함이었던 날은 뺀다(첫날만)
fe = fl & ~(fl.shift(1, fill_value=False) | fl.shift(2, fill_value=False) | fl.shift(3, fill_value=False) | fl.shift(4, fill_value=False))
mid = dd.index[len(dd) // 2]
cells = {}
for nm, f in (("약함 전체", fl), ("약함 첫날(솎음)", fe)):
    cells[nm] = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid)):
        c_ = prob.cond(dd[msk], f[msk], nm)
        cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1)]
    r5 = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
    c_ = prob.cond(dd[r5], f[r5], nm)
    cells[nm]["최근5년"] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[r5, "y1"].mean()) * 100, 1)]
q3 = pd.Series(np.select([r1s >= 2/3, r1s >= 1/3], ["n3", "n2"], "n1"), index=dd.index, dtype=object)
q5 = pd.Series(np.select([r1s >= .8, r1s >= .6, r1s >= .4, r1s >= .2], ["n5", "n4", "n3", "n2"], "n1"), index=dd.index, dtype=object)
el = one(rr, fl, "l"); ee = one(rr, fe, "l")
st = str(dd.index[400].date())
res = {"n": len(dd), "mid": str(mid.date()), "last": str(dd.index[-1].date()), "cur_rank": round(float(rr.iloc[-1]), 3),
       "cur_rel%": round(float(rel.reindex(dd.index).iloc[-1]) * 100, 2), "칸(n,y1차)": cells,
       "겹침": {"약함일": int(fl.sum()), "첫날": int(fe.sum()), "그중 간밤S&P≥67": int((fl & (r1s >= 2/3)).sum()), "그중 자기5≤10": int((fl & (ro <= .1)).sum())}}
for tag, base in (("간밤3칸", lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl") + "|" + q3), ("간밤3칸만", q3), ("간밤5칸", lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl") + "|" + q5)):
    P = {"평소": wf(dd, el, "y1", 1)[1], "기존": wf(dd, base, "y1", 1)[0], "+약함": wf(dd, base + "|" + el, "y1", 1)[0], "+첫날": wf(dd, base + "|" + ee, "y1", 1)[0]}
    for pr in (50, 200):
        P[f"+약함(사전{pr})"] = wf(dd, base + "|" + el, "y1", 1, prior=pr)[0]
    res["걸어가기 " + tag] = score(dd, "y1", P, start=st)
# 덧셈형: 기존 걸어가기 확률 로짓 + 약함 몫(앞에서 배운 칸 차이를 로짓으로) — 칸을 곱하지 않고 더하기
base = lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl") + "|" + q3
pb = wf(dd, base, "y1", 1)[0]
y = dd["y1"]; known = y.shift(1); flk = fl.shift(1, fill_value=False)
k = known.where(flk).fillna(0).cumsum(); n_ = (known.notna() & flk).astype(float).cumsum()
bse = known.expanding().mean()
pl = (k + 100 * bse) / (n_ + 100)
lo = lambda p: np.log(p / (1 - p))
for w in (0.3, 0.5, 1.0):
    pa = pb.copy(); m = fl & pb.notna() & pl.notna()
    pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m])))))
    res.setdefault("덧셈형", {})[f"w{w}"] = score(dd, "y1", {"기존": pb, "+약함": pa}, start=st)
D = pd.DataFrame({"c": 1.0, "oh": ro >= .9, "ol": ro <= .1, "sh": rs >= .9, "sl": rs <= .1, "s1": (sp1 / sp1.std()).clip(-4, 4), "l": fl, "e": fe}, index=dd.index).astype(float)
m = y.notna(); idx = dd.index[m]; mi = idx[len(idx) // 2]; yy = y[m].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi
R = {}
for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
    s_ = {}
    for kk, cols in (("기존", [0,1,2,3,4,5]), ("+약함", [0,1,2,3,4,5,6]), ("+첫날", [0,1,2,3,4,5,7])):
        w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
        s_[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
        if kk != "기존": s_[kk + "계수"] = round(float(w_[6]), 3)
    R[nm] = s_
res["교차"] = R
print(json.dumps(res, ensure_ascii=False, indent=1))
json.dump(res, open("probe/rs51_bt.json", "w"), ensure_ascii=False, indent=1)
