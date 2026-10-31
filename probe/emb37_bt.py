"""#37 일본 신흥국 달러채 약세(log(EMB/IEF) 5일 변화 1년 순위 ≤10%) 다음 날 다시 — 확률 보강 일지 10/31 17시 (Actions)
#35 ➖: 일본은 칸 위 뒤 기간 나빠짐 · 교차만 좋아짐. 사건 솎기(4일 안 겹침 뺌)·덧셈형(기존 로짓 + 칸 몫×w)·교차 로지스틱으로 다시."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, lab, one, logit_fit

cfg = prob.MK["JP"]
H = prob.load_hist([cfg["ix"], "EMB", "IEF", "HYG", "LQD", "DX-Y.NYB", "^GSPC"])
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
b = pd.concat([cs("EMB"), cs("IEF")], axis=1, keys=["e", "i"]).dropna(); sprd = np.log(b["e"] / b["i"])
c2 = pd.concat([cs("HYG"), cs("LQD")], axis=1, keys=["h", "l"]).dropna(); crd = np.log(c2["h"] / c2["l"])
dx, sp = cs("DX-Y.NYB"), cs("^GSPC")
d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2008-06-01"].copy()
A = lambda s: prob_x.align(prob_x.rank252(s), d.index)
rd, rs, rc, re_ = A(np.log(dx).diff(5)), A(np.log(sp).diff(5)), A(crd.diff(5)), A(sprd.diff(5))
v = rd.notna() & rs.notna() & rc.notna() & re_.notna()
dd = d[v].copy(); rd, rs, rc, re_ = rd[v], rs[v], rc[v], re_[v]
fl = re_ <= .1
fe = fl & ~(fl.shift(1, fill_value=False) | fl.shift(2, fill_value=False) | fl.shift(3, fill_value=False) | fl.shift(4, fill_value=False))
mid = dd.index[len(dd) // 2]
cells = {}
for nm, f in (("약세 전체", fl), ("약세 첫날(솎음)", fe)):
    cells[nm] = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", dd.index >= dd.index[-1] - pd.Timedelta(days=1826))):
        c_ = prob.cond(dd[msk], f[msk], nm)
        cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1)]
oth = lab(rc, "ch", "cl") + "|" + lab(rd, "dh", "dl") + "|" + lab(rs, "sh", "sl")
el, ee = one(re_, fl, "el"), one(re_, fe, "el")
st = "2010-01-01"
res = {"n": len(dd), "mid": str(mid.date()), "last": str(dd.index[-1].date()), "cur_rank": round(float(re_.iloc[-1]), 3), "칸(n,y1차)": cells,
       "겹침": {"약세일": int(fl.sum()), "첫날": int(fe.sum()), "&크레딧≤10": int((fl & (rc <= .1)).sum()), "&달러≥90": int((fl & (rd >= .9)).sum()), "&S&P≤10": int((fl & (rs <= .1)).sum())}}
P = {"평소": wf(dd, el, "y1", 1)[1], "기존": wf(dd, oth, "y1", 1)[0], "+약세": wf(dd, oth + "|" + el, "y1", 1)[0], "+첫날": wf(dd, oth + "|" + ee, "y1", 1)[0]}
res["걸어가기 칸곱"] = score(dd, "y1", P, start=st)
pb = P["기존"]; y = dd["y1"]; known = y.shift(1); lo = lambda p: np.log(p / (1 - p))
bse = known.expanding().mean()
for tag, f in (("전체", fl), ("첫날", fe)):
    fk = f.shift(1, fill_value=False)
    k = known.where(fk).fillna(0).cumsum(); n_ = (known.notna() & fk).astype(float).cumsum()
    pl = (k + 100 * bse) / (n_ + 100)
    for w in (0.3, 0.5, 1.0):
        pa = pb.copy(); m = f & pb.notna() & pl.notna()
        pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m])))))
        res.setdefault("덧셈형 " + tag, {})[f"w{w}"] = score(dd, "y1", {"기존": pb, "+약세": pa}, start=st)
D = pd.DataFrame({"c": 1.0, "ch": rc >= .9, "cl": rc <= .1, "dh": rd >= .9, "dl": rd <= .1, "sh": rs >= .9, "sl": rs <= .1, "e": fl, "f": fe}, index=dd.index).astype(float)
m = y.notna() & (dd.index >= st); idx = dd.index[m]; mi = idx[len(idx) // 2]; yy = y[m].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi
R = {}
for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
    s_ = {}
    for kk, cols in (("기존", [0,1,2,3,4,5,6]), ("+약세", [0,1,2,3,4,5,6,7]), ("+첫날", [0,1,2,3,4,5,6,8])):
        w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
        s_[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
        if kk != "기존": s_[kk + "계수"] = round(float(w_[7]), 3)
    R[nm] = s_
res["교차"] = R
print(json.dumps(res, ensure_ascii=False, indent=1))
