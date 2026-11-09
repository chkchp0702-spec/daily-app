"""#93 VIX9D÷VIX(9일 공포 ÷ 30일 공포) 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 11/9 17시 (Actions)
칸: 비율 1년 순위 ≥90·≤10 · 비율 >1(9일 공포가 30일보다 큼). 앞/뒤 절반 칸 + 걸어가며(사전 100) 브라이어:
 (가) 평소 vs 칸  (나) 🌡️ VIX÷VIX3M 5칸 vs 5칸×VIX9D 꼬리(겹침 확인). 아시아는 미국 날짜 t 값을 다음 아시아 장에(prob_x.align)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^VIX", "^VIX9D", "^VIX3M", "^GSPC"})
H = prob.load_hist(syms)
c = lambda s: H[s]["Close"].dropna()
v, v9, v3 = c("^VIX"), c("^VIX9D"), c("^VIX3M")
print("VIX9D", v9.index[0].date(), v9.index[-1].date(), len(v9), float(v9.iloc[-1]), "VIX", float(v.iloc[-1]), "VIX3M", float(v3.iloc[-1]))
r9 = (v9 / v.reindex(v9.index).ffill()).dropna()
vt = (v / v3.reindex(v.index).ffill()).dropna()
print("r9 now", round(float(r9.iloc[-1]), 3), "rank", round(float(prob_x.rank252(r9).dropna().iloc[-1]), 3), "vterm now", round(float(vt.iloc[-1]), 3), "r9>1 days", int((r9 > 1).sum()))
vtb = pd.cut(vt, [0, 0.85, 0.95, 1.0, 1.1, 9], labels=["a", "b", "c", "d", "e"]).astype(object)


def model(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in lab.dropna().unique():
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def brier(d, ycol, ps, start):
    y = d[ycol]; ok = y.notna() & (d.index >= start)
    for p in ps: ok &= p.notna()
    idx = d.index[ok]; mid = idx[len(idx) // 2]; r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid)), ("최근5년", ok & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for p in ps]
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2011-01-01"].copy()
    al = (lambda s: prob_x.align(s, d.index)) if mk != "US" else (lambda s: s.reindex(d.index).ffill())
    rk = al(prob_x.rank252(r9)); raw = al(r9); vb = al(vtb)
    tails = {"≥90": rk >= 0.9, "≤10": rk <= 0.1, ">1": raw > 1.0}
    ok = rk.notna() & vb.notna()
    idx = d.index[ok]; mid = idx[len(idx) // 2]
    R = {"cur": {"rank": round(float(rk.dropna().iloc[-1]), 3), "raw": round(float(raw.dropna().iloc[-1]), 3)}, "mid": str(mid.date())}
    for L, f in tails.items():
        f = f.fillna(False) & ok
        row = {}
        for half, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid))):
            c_ = prob.cond(d[msk], f[msk], L)
            b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
            row[half] = None if not c_ else [c_["n"], round((c_["p1"] - b1) * 100, 1), round(((c_["p5"] or 0) - b5) * 100, 1)]
        lab = pd.Series(np.where(f, L, None), index=d.index, dtype=object).where(ok)
        labv = vb.where(ok).astype(object)
        labc = (labv + "|" + np.where(f, "T", "-")).where(ok)
        res = {"칸": row}
        for ycol, h in (("y1", 1), ("y5", 5)):
            pA, base = model(d, lab, ycol, h); pV, _ = model(d, labv, ycol, h); pC, _ = model(d, labc, ycol, h)
            res[ycol] = brier(d, ycol, [base, pA, pV, pC], "2012-06-01")   # [평소, 칸만, VIX3M5칸, 5칸×꼬리]
        overlap = int((f & (vb.isin(["d", "e"]))).sum())
        res["겹침_vterm역전"] = [overlap, int(f.sum())]
        R[L] = res
        print(mk, L, json.dumps(res, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/vix9_bt.json", "w"), ensure_ascii=False, indent=1)
