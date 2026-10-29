"""#27 VIX 하루 급등(+20%↑) 다음 날 되돌림 — 확률 보강 일지 10/29 14시 (Actions)
VIX 하루 로그 변화: (a) +20%↑ 절대 기준 (b) 1년 백분위 ≥95% · 다음 날·5일 · 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: 기존 VIX 기간구조 칸 + VIX 수준 칸 + S&P 하루 등락 5칸(아시아 닻이 이미 간밤 S&P 를 씀) 위에 더해도 좋아지는지."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^VIX", "^VIX3M", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
vx, v3, sp = cs("^VIX"), cs("^VIX3M"), cs("^GSPC")
print("VIX", vx.index[0].date(), vx.index[-1].date(), len(vx), float(vx.iloc[-1]))
j = np.log(vx).diff()
print("최근 VIX 하루 변화", {str(k.date()): round(float(v) * 100, 1) for k, v in j.tail(5).items()})


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2006-01-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def S(x, idx):
    return pd.Series(x, index=idx, dtype=object)


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2001-01-01"].copy()
    us = mk == "US"
    A = (lambda s: s.reindex(d.index).ffill()) if us else (lambda s: prob_x.align(s, d.index))
    ja = A(j); jr = A(prob_x.rank252(j)); vt = A(vx / v3.reindex(vx.index).ffill()); vl = A(vx); sr = A(np.log(sp).diff())
    j20 = S(np.where(ja >= np.log(1.2), "j", "-"), d.index).where(ja.notna())
    j95 = S(np.where(jr >= 0.95, "j", "-"), d.index).where(jr.notna())
    vtb = S(pd.cut(vt, [0, 0.85, 0.95, 1.0, 1.1, 9], labels=False).astype("float").astype(str), d.index).where(vt.notna())
    vlb = S(pd.cut(vl, [0, 13, 17, 22, 30, 200], labels=False).astype("float").astype(str), d.index).where(vl.notna())
    spb = S(pd.cut(sr, [-9, -0.02, -0.007, 0.007, 0.02, 9], labels=False).astype("float").astype(str), d.index).where(sr.notna())
    oth = vtb + "|" + vlb + "|" + spb
    mid = d.index[len(d) // 2]
    cells = {}
    for nm, f in (("+20%↑", (ja >= np.log(1.2)).fillna(False)), ("백분위≥95", (jr >= 0.95).fillna(False))):
        cells[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    f20 = (ja >= np.log(1.2)).fillna(False)
    ov = {"급등일": int(f20.sum()), "급등&S&P−2%↓": int((f20 & (sr <= -0.02)).sum()), "급등&기간구조≥1": int((f20 & (vt >= 1.0)).sum())}
    R = {"cur_j": None if pd.isna(ja.iloc[-1]) else round(float(ja.iloc[-1]) * 100, 1), "칸(n,y1차,y5차)": cells, "겹침": ov}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(d, j20, ycol, h)[1], "급등20": wf(d, j20, ycol, h)[0], "급등95": wf(d, j95, ycol, h)[0],
             "기존(기간구조·수준·S&P)": wf(d, oth, ycol, h)[0], "기존+급등20": wf(d, oth + "|" + j20, ycol, h)[0],
             "기존+급등95": wf(d, oth + "|" + j95, ycol, h)[0]}
        R[ycol] = score(d, ycol, P)
    print(mk, json.dumps(R, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/vixj_bt.json", "w"), ensure_ascii=False, indent=1)
