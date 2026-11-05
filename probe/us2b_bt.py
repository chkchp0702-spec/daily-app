"""#76b 미 2년 금리 20일 급등(≥90) → 중국 5일 — 5일 간격 표본(시작점 5개)·사건 솎기 · 확률 보강 11/5 16시 (Actions)"""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.argv = [sys.argv[0]]
import importlib.util
src = open("probe/us2_bt.py").read().split("out = {}")[0]
exec(src)
cfg = prob.MK["CN"]; d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "1995-01-01"].copy()
A = lambda s: prob_x.align(prob_x.rank252(s), d.index)
rv = A(tn.diff(5)); rs = A(np.log(sp).diff(5))
oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
rg = A(sk.diff(20).dropna()); gh = one(rg, rg >= 0.9, "gh")
mid = d.index[len(d) // 2]; R = {"mid": str(mid.date()), "cur": round(float(rg.iloc[-1]), 3)}
f = (rg >= 0.9).fillna(False)
first = f & ~f.shift(1, fill_value=False).rolling(5, min_periods=1).max().astype(bool)
for nm, ff in (("겹침", f), ("첫날만", first)):
    R[nm] = {}
    for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
        c_ = prob.cond(d[msk], ff[msk], nm)
        R[nm][half] = None if not c_ else [c_["n"], round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
for s0 in range(5):
    ds = d.iloc[s0::5]; o = oth.iloc[s0::5]; g = gh.iloc[s0::5]; fs = f.iloc[s0::5]
    cell = {}
    for half, msk in (("앞", ds.index < mid), ("뒤", ds.index >= mid)):
        yy = ds.loc[msk, "y5"]; cell[half] = [int(fs[msk].sum()), round((yy[fs[msk]].mean() - yy.mean()) * 100, 1)]
    P = {"기존": wf(ds, o, "y5", 1, 20)[0], "기존+높음": wf(ds, o + "|" + g, "y5", 1, 20)[0]}
    R[f"시작{s0}"] = {"칸": cell, "걸어가기": score(ds, "y5", P)}
print(json.dumps(R, ensure_ascii=False))
