"""#18 구리/금 비율 검증 — 확률 보강 일지 10/28 14시 (Actions 에서 실행)
구리(HG=F)÷금(GC=F) = 경기·위험선호(구리↑) 대 안전자산(금↑). 20·60일 변화의 1년 백분위를 칸으로 나눠
같은 칸 과거 날들의 다음 날·5일 오름 비율이 평소와 다른지, 걸어가며(사전 100) 브라이어가 앞/뒤 둘 다 좋아지는지.
아시아는 미국 날짜 t 값을 다음 아시아 장에 씀(prob_x.align)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"HG=F", "GC=F"})
H = prob.load_hist(syms)
hg, gc = H["HG=F"]["Close"], H["GC=F"]["Close"]
both = pd.concat([hg, gc], axis=1, keys=["hg", "gc"]).dropna()
both = both[(both > 0).all(axis=1)]
lr = np.log(both["hg"] / both["gc"])
print("구리/금 이력", lr.index[0].date(), lr.index[-1].date(), len(lr))
F = {"20일": lr.diff(20), "60일": lr.diff(60), "5일": lr.diff(5)}


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
        q5 = pd.cut(rk, [-0.01, .2, .4, .6, .8, 1.01], labels=["0-20", "20-40", "40-60", "60-80", "80-100"])
        tail = pd.cut(rk, [-0.01, .1, .9, 1.01], labels=["≤10", "mid", "≥90"]).astype(object).where(lambda x: x != "mid")
        mid = d.index[len(d) // 2]
        rows = {}
        for L in list(q5.cat.categories) + ["≤10", "≥90"]:
            f = (q5 == L) if L in q5.cat.categories else (tail == L)
            f = f.fillna(False)
            row = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], L)
                b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
                row[half] = None if not c_ else [c_["n"], round((c_["p1"] - b1) * 100, 1), round(((c_["p5"] or 0) - b5) * 100, 1)]
            rows[L] = row
        R[fn] = {"cur_rank": round(cur, 3), "칸": rows,
                 "brier_q5_y1": wf(d, q5.astype(object), "y1", 1), "brier_q5_y5": wf(d, q5.astype(object), "y5", 5),
                 "brier_tail_y1": wf(d, tail, "y1", 1), "brier_tail_y5": wf(d, tail, "y5", 5)}
        print(mk, fn, json.dumps(R[fn], ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/cug_bt.json", "w"), ensure_ascii=False, indent=1)
