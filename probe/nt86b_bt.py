"""#86b 홍콩 「NT 배율 5일 급락」(닛케이÷TOPIX 5일 변화 1년 순위 ≤10%) 다음 날 다시 — 확률 보강 11/9 10시 (Actions)
#86 ➖: 앞/뒤 나누기가 2000~ 전체 가운데라 NT(2009~) 앞 기간 n 87. 이번엔 NT 자료 기간 안에서 앞/뒤·최근5년 ·
사건 솎기(앞 4거래일 안 겹침 뺌) · 5일 간격 표본 · 덧셈형 걸어가기 · 교차 로지스틱(자기·S&P 5일 꼬리 + 간밤 S&P 연속값)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, lab, one, logit_fit

cfg = prob.MK["HK"]
H = prob.load_hist([cfg["ix"], "^N225", "1306.T", "^TOPX", "^GSPC"])
def cs(s):
    x = H[s]["Close"].dropna() if s in H else pd.Series(dtype=float); return x[x > 0]
tp = max((cs("1306.T"), cs("^TOPX")), key=len)
tp = tp[np.log(tp).diff().abs().fillna(0) < 0.15]
nt = (cs("^N225") / tp).dropna()
sp = cs("^GSPC")
d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2009-01-01"].copy()
rg = prob_x.rank252(np.log(nt).diff(5).dropna()).reindex(d.index).ffill(limit=3)
ro = prob_x.rank252(np.log(d["c"]).diff(5).dropna()).reindex(d.index)
rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
sp1 = prob_x.align(np.log(sp).diff(1), d.index)
v = rg.notna() & ro.notna() & rs.notna() & sp1.notna()
dd = d[v].copy(); rg, ro, rs, sp1 = rg[v], ro[v], rs[v], sp1[v]
fl = rg <= .1
fe = fl & ~(fl.shift(1, fill_value=False) | fl.shift(2, fill_value=False) | fl.shift(3, fill_value=False) | fl.shift(4, fill_value=False))
mid = dd.index[len(dd) // 2]; r5 = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
cells = {}
for nm, f in (("급락 전체", fl), ("급락 첫날(솎음)", fe)):
    cells[nm] = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5)):
        c_ = prob.cond(dd[msk], f[msk], nm)
        cells[nm][half] = None if not c_ else [c_["n"], round(c_["p1"] * 100, 1), round(dd.loc[msk, "y1"].mean() * 100, 1), round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1)]
# 5일 간격 표본(시작점 5개) — 급락 날 다음 날 오름 비율 − 같은 표본 평소
sp5 = {}
for s0 in range(5):
    ix = dd.index[s0::5]; q = dd.loc[ix]; f = fl.loc[ix]; m_ = ix < mid
    sp5[s0] = [[int(f[m_].sum()), round((q.loc[m_ & f.values, "y1"].mean() - q.loc[m_, "y1"].mean()) * 100, 1)],
               [int(f[~m_].sum()), round((q.loc[~m_ & f.values, "y1"].mean() - q.loc[~m_, "y1"].mean()) * 100, 1)]]
q3 = pd.Series(np.select([sp1.rank(pct=True) >= 2/3, sp1.rank(pct=True) >= 1/3], ["n3", "n2"], "n1"), index=dd.index, dtype=object)
base = lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl") + "|" + q3
el = one(rg, fl, "l"); ee = one(rg, fe, "l")
st = str(dd.index[300].date())
res = {"n": len(dd), "mid": str(mid.date()), "last": str(dd.index[-1].date()), "cur_rank": round(float(rg.iloc[-1]), 3),
       "칸(n,p1,평소,차)": cells, "5일간격(앞[n,차],뒤[n,차])": sp5,
       "겹침": {"급락일": int(fl.sum()), "첫날": int(fe.sum()), "그중 자기5≤10": int((fl & (ro <= .1)).sum()), "그중 S&P5≤10": int((fl & (rs <= .1)).sum())}}
P = {"평소": wf(dd, el, "y1", 1)[1], "기존": wf(dd, base, "y1", 1)[0], "+급락": wf(dd, base + "|" + el, "y1", 1)[0], "+첫날": wf(dd, base + "|" + ee, "y1", 1)[0]}
res["걸어가기 칸곱"] = score(dd, "y1", P, start=st)
pb = P["기존"]; y = dd["y1"]; known = y.shift(1); flk = fl.shift(1, fill_value=False)
k = known.where(flk).fillna(0).cumsum(); n_ = (known.notna() & flk).astype(float).cumsum()
bse = known.expanding().mean(); pl = (k + 100 * bse) / (n_ + 100)
lo = lambda p: np.log(p / (1 - p))
for w in (0.3, 0.5, 1.0):
    pa = pb.copy(); m = fl & pb.notna() & pl.notna()
    pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m])))))
    res.setdefault("덧셈형", {})[f"w{w}"] = score(dd, "y1", {"기존": pb, "+급락": pa}, start=st)
D = pd.DataFrame({"c": 1.0, "oh": ro >= .9, "ol": ro <= .1, "sh": rs >= .9, "sl": rs <= .1, "s1": (sp1 / sp1.std()).clip(-4, 4), "l": fl, "e": fe}, index=dd.index).astype(float)
m = y.notna(); idx = dd.index[m]; mi = idx[len(idx) // 2]; yy = y[m].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi
R = {}
for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
    s_ = {}
    for kk, cols in (("기존", [0,1,2,3,4,5]), ("+급락", [0,1,2,3,4,5,6]), ("+첫날", [0,1,2,3,4,5,7])):
        w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
        s_[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
        if kk != "기존": s_[kk + "계수"] = round(float(w_[6]), 3)
    R[nm] = s_
res["교차"] = R
print(json.dumps(res, ensure_ascii=False, indent=1))
