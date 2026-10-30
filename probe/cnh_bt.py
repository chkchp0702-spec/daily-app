"""#32 역외 위안(CNH=X, 달러당 위안) 5일 급변 꼬리 → 중국·홍콩 — 확률 보강 일지 10/30 09시 (Actions)
위안 급약세(≥90%) = 중국 자금 이탈? ① 칸 앞/뒤 ② 달러지수·S&P 5일 꼬리 칸 위에 더해도 좋아지는지(겹침) ③ 겹치는 날 ④ 지금 백분위. 아시아는 미국 날짜 t 값 → 다음 아시아 장(prob_x.align)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"CNH=X", "CNY=X", "DX-Y.NYB", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
dx, sp = cs("DX-Y.NYB"), cs("^GSPC")
cl = cs("CNH=X")
cny = cs("CNY=X") if "CNY=X" in H else None
if cny is not None:
    print("CNY", cny.index[0].date(), len(cny))
    if cl.index[0] > pd.Timestamp("2012-01-01"):   # 역외 이력이 짧으면 앞은 역내(CNY)로 이음
        cl = pd.concat([cny[cny.index < cl.index[0]], cl])
print("CNH", cl.index[0].date(), cl.index[-1].date(), len(cl), float(cl.iloc[-1]))


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; ok = y.notna()
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2012-01-01"):
    y = d[ycol]
    ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


out = {}
for mk, cfg in prob.MK.items():
    if mk not in ("CN", "HK", "KR"): continue
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2001-01-01"].copy()
    us = mk == "US"
    A = (lambda s: prob_x.rank252(s).reindex(d.index).ffill()) if us else (lambda s: prob_x.align(prob_x.rank252(s), d.index))
    ro = A(np.log(cl).diff(5)); rd = A(np.log(dx).diff(5)); rs = A(np.log(sp).diff(5))
    oil = pd.Series(np.where(ro >= 0.9, "hi", None), index=d.index, dtype=object).where(ro.notna())
    oil_hi = pd.Series(np.where(ro <= 0.1, "lo", None), index=d.index, dtype=object).where(ro.notna())
    dxl = pd.Series(np.where(rd >= 0.9, "dh", np.where(rd <= 0.1, "dl", "-")), index=d.index, dtype=object).where(rd.notna())
    spl = pd.Series(np.where(rs <= 0.1, "sl", np.where(rs >= 0.9, "sh", "-")), index=d.index, dtype=object).where(rs.notna())
    comb_d = dxl + "|" + oil.fillna("-")
    comb_s = spl + "|" + oil.fillna("-")
    comb_ds = dxl + "|" + spl
    comb_dso = dxl + "|" + spl + "|" + oil.fillna("-")
    f = (ro >= 0.9).fillna(False); f2 = (ro <= 0.1).fillna(False)
    mid = d.index[len(d) // 2]
    cells = {}
    for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
        c_ = prob.cond(d[msk], f[msk], "lo")
        cells[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    cells2 = {}
    for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
        c_ = prob.cond(d[msk], f2[msk], "lo")
        cells2[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    ov = {"위안약세일수": int(f.sum()), "그중 달러≥90": int((f & (rd >= 0.9)).sum()), "그중 S&P5일≤10": int((f & (rs <= 0.1)).sum())}
    R = {"cur_rank": None if pd.isna(ro.iloc[-1]) else round(float(ro.iloc[-1]), 3), "cur_r5": round(float(np.log(cl).diff(5).iloc[-1]) * 100, 2),
         "약세칸(n,y1차,y5차)": cells, "강세칸": cells2, "겹침": ov}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {}
        P["평소"] = wf(d, oil, ycol, h)[1]
        P["위안약세"] = wf(d, oil, ycol, h)[0]
        P["위안강세"] = wf(d, oil_hi, ycol, h)[0]
        P["달러"] = wf(d, dxl, ycol, h)[0]
        P["달러+위안"] = wf(d, comb_d, ycol, h)[0]
        P["S&P"] = wf(d, spl, ycol, h)[0]
        P["S&P+위안"] = wf(d, comb_s, ycol, h)[0]
        P["달러+S&P"] = wf(d, comb_ds, ycol, h)[0]
        P["달러+S&P+위안"] = wf(d, comb_dso, ycol, h)[0]
        R[ycol] = score(d, ycol, P)
    print(mk, json.dumps(R, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/cnh_bt.json", "w"), ensure_ascii=False, indent=1)
