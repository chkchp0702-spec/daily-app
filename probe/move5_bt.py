"""#24 한국 MOVE 5일 급등 꼬리(≥90% 한쪽만) 다시 보기 + #21 유가(CL=F) 5일 급변 꼬리 미리 보기 — 확률 보강 일지 10/29 10시 (Actions)
#19 에서 MOVE 5일 변화 ≥90% 한국 −5.4·−6.4%p ➖. 한쪽 꼬리(≥90%·≥95%)만 칸으로 두고 나머지는 평소 → 걸어가며(사전 100) 브라이어 앞/뒤.
아시아는 미국 날짜 t 값을 다음 아시아 장에 씀(prob_x.align)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^MOVE", "CL=F"})
H = prob.load_hist(syms)
mv = H["^MOVE"]["Close"].dropna(); mv = mv[mv > 0]
cl = H["CL=F"]["Close"].dropna(); cl = cl[cl > 0]
print("MOVE", mv.index[0].date(), mv.index[-1].date(), len(mv), float(mv.iloc[-1]))
print("CL", cl.index[0].date(), cl.index[-1].date(), len(cl), float(cl.iloc[-1]))
F = {"MOVE5": np.log(mv).diff(5), "유가5": np.log(cl).diff(5)}


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; ok = y.notna()
    known = y.shift(h)                      # t 에 아는 결과
    base = known.expanding().mean()
    p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L)
        fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    ev = ok & (d.index >= "2006-01-01") & base.notna() & lab.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5)]
    r["mid"] = str(mid.date())
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2001-01-01"].copy()
    R = {}
    for fn, s in F.items():
        rk = prob_x.align(prob_x.rank252(s), d.index) if mk != "US" else prob_x.rank252(s).reindex(d.index).ffill()
        cur = float(rk.dropna().iloc[-1])
        mid = d.index[len(d) // 2]
        labs = {"≥90": (rk >= 0.9), "≥95": (rk >= 0.95), "≤10": (rk <= 0.1), "≤5": (rk <= 0.05)}
        rows = {}
        for L, f in labs.items():
            f = f.fillna(False)
            row = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], L)
                b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
                row[half] = None if not c_ else [c_["n"], round((c_["p1"] - b1) * 100, 1), round(((c_["p5"] or 0) - b5) * 100, 1)]
            rows[L] = row
        def one(L):
            return pd.Series(np.where(labs[L].fillna(False), L, None), index=d.index, dtype=object).where(rk.notna())
        both = pd.Series(np.where(rk >= 0.9, "hi", np.where(rk <= 0.1, "lo", None)), index=d.index, dtype=object)
        R[fn] = {"cur_rank": round(cur, 3), "mid": str(mid.date()), "칸": rows,
                 "hi90_y1": wf(d, one("≥90"), "y1", 1), "hi90_y5": wf(d, one("≥90"), "y5", 5),
                 "hi95_y1": wf(d, one("≥95"), "y1", 1),
                 "lo10_y1": wf(d, one("≤10"), "y1", 1), "lo10_y5": wf(d, one("≤10"), "y5", 5),
                 "both_y1": wf(d, both, "y1", 1), "both_y5": wf(d, both, "y5", 5)}
        print(mk, fn, json.dumps(R[fn], ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/move5_bt.json", "w"), ensure_ascii=False, indent=1)
