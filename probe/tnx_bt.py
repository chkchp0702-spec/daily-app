"""#26 미 10년 금리(^TNX) 5일 급변 꼬리 → 다음 날·5일 — 확률 보강 일지 10/29 13시 (Actions)
5일 금리 변화(%p 차이)의 1년 백분위 ≥90%(급등)·≤10%(급락) 한쪽씩 칸 · 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: 이미 붙인 MOVE 5일 급등·달러지수 5일 꼬리·S&P 5일 꼬리 칸 위에 더해도 좋아지는지. 아시아는 미국 날짜 t → 다음 아시아 장."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^TNX", "DX-Y.NYB", "^GSPC", "^MOVE"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
tn, dx, sp, mv = cs("^TNX"), cs("DX-Y.NYB"), cs("^GSPC"), cs("^MOVE")
print("TNX", tn.index[0].date(), tn.index[-1].date(), len(tn), float(tn.iloc[-1]))


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


def lab(r, hi, lo, tag):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2001-01-01"].copy()
    us = mk == "US"
    A = (lambda s: prob_x.rank252(s).reindex(d.index).ffill()) if us else (lambda s: prob_x.align(prob_x.rank252(s), d.index))
    rt = A(tn.diff(5)); rd = A(np.log(dx).diff(5)); rs = A(np.log(sp).diff(5)); rm = A(np.log(mv).diff(5))
    t_hi = pd.Series(np.where(rt >= 0.9, "th", "-"), index=d.index, dtype=object).where(rt.notna())
    t_lo = pd.Series(np.where(rt <= 0.1, "tl", "-"), index=d.index, dtype=object).where(rt.notna())
    t_b = lab(rt, "th", "tl", "t")
    oth = lab(rd, "dh", "dl", "d") + "|" + lab(rs, "sh", "sl", "s") + "|" + pd.Series(np.where(rm >= 0.9, "mh", "-"), index=d.index, dtype=object).where(rm.notna())
    mid = d.index[len(d) // 2]
    cells = {}
    for nm, f in (("≥90", (rt >= 0.9).fillna(False)), ("≤10", (rt <= 0.1).fillna(False))):
        cells[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    fh = (rt >= 0.9).fillna(False); fl = (rt <= 0.1).fillna(False)
    ov = {"급등일": int(fh.sum()), "급등&MOVE≥90": int((fh & (rm >= 0.9)).sum()), "급등&달러≥90": int((fh & (rd >= 0.9)).sum()),
          "급락일": int(fl.sum()), "급락&S&P≤10": int((fl & (rs <= 0.1)).sum()), "급락&MOVE≥90": int((fl & (rm >= 0.9)).sum())}
    R = {"cur_rank": None if pd.isna(rt.iloc[-1]) else round(float(rt.iloc[-1]), 3), "cur_d5": round(float(tn.diff(5).iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(d, t_b, ycol, h)[1], "금리급등": wf(d, t_hi, ycol, h)[0], "금리급락": wf(d, t_lo, ycol, h)[0], "금리양쪽": wf(d, t_b, ycol, h)[0],
             "기존(달러·S&P·MOVE)": wf(d, oth, ycol, h)[0], "기존+급등": wf(d, oth + "|" + t_hi, ycol, h)[0],
             "기존+급락": wf(d, oth + "|" + t_lo, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + t_b, ycol, h)[0]}
        R[ycol] = score(d, ycol, P)
    print(mk, json.dumps(R, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/tnx_bt.json", "w"), ensure_ascii=False, indent=1)
