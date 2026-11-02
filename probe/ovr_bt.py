"""#55 큰 하락일·큰 상승일 뒤 과잉반응 되돌림 — 확률 보강 일지 11/2 15시 (Actions)
자기 지수 1일 등락 꼬리(고정 ±3% · 변동성 맞춤 ±2σ(20일)) → 다음 날·5일.
칸(앞/뒤 절반) + 걸어가며(사전 100) 브라이어: ⓐ 평소 대비 ⓑ 기존 ① 연속일수 칸 위에 꼬리를 덧붙였을 때 개선되는지."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob

H = prob.load_hist(sorted({c["ix"] for c in prob.MK.values()}))


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; ok = y.notna()
    known = y.shift(h)
    base = known.expanding().mean()
    p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L)
        fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base, ok


def score(d, ycol, pa, pb, ok):
    y = d[ycol]
    ev = ok & pa.notna() & pb.notna() & (d.index >= "2006-01-01")
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((pa[msk] - y[msk]) ** 2).mean()), 5), round(float(((pb[msk] - y[msk]) ** 2).mean()), 5)]
    r["mid"] = str(mid.date())
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2001-01-01"].copy()
    sig = d["r"].rolling(20).std().shift(1)
    z = d["r"] / sig
    tails = {"−3%↓": d["r"] <= -0.03, "+3%↑": d["r"] >= 0.03, "−2σ↓": z <= -2, "+2σ↑": z >= 2}
    mid = d.index[len(d) // 2]
    rows = {}
    for L, f in tails.items():
        f = f.fillna(False)
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], L)
            b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
            row[half] = None if not c_ else [c_["n"], round((c_["p1"] - b1) * 100, 1), round(((c_["p5"] or 0) - b5) * 100, 1)]
        row["오늘"] = bool(f.iloc[-1])
        rows[L] = row
    stk = d["streak"].map(prob.streak_bucket)
    R = {"mid": str(mid.date()), "오늘등락": round(float(d["r"].iloc[-1]) * 100, 2), "오늘z": round(float(z.iloc[-1]), 2), "칸": rows}
    for kind, (dn, upk) in {"고정": ("−3%↓", "+3%↑"), "σ": ("−2σ↓", "+2σ↑")}.items():
        t = pd.Series(np.where(tails[dn].fillna(False), "dn", np.where(tails[upk].fillna(False), "up", None)), index=d.index, dtype=object)
        tdn = pd.Series(np.where(tails[dn].fillna(False), "dn", None), index=d.index, dtype=object)
        for ycol, h in (("y1", 1), ("y5", 5)):
            p0, base, ok = wf(d, pd.Series([None] * len(d), index=d.index, dtype=object), ycol, h)
            pt, _, _ = wf(d, t, ycol, h)
            pd_, _, _ = wf(d, tdn, ycol, h)
            ps, _, _ = wf(d, stk, ycol, h)
            pst, _, _ = wf(d, stk + "|" + t.fillna("-"), ycol, h)
            R[f"{kind}_{ycol}"] = {"평소→꼬리": score(d, ycol, base, pt, ok), "평소→하락꼬리만": score(d, ycol, base, pd_, ok),
                                   "연속일수→+꼬리": score(d, ycol, ps, pst, ok)}
    print(mk, json.dumps(R, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/ovr_bt.json", "w"), ensure_ascii=False, indent=1)
