"""#6 장단기 금리차(^TNX − ^IRX) 검증 — 확률 보강 일지 10/15 12시 (Actions 에서 실행)"""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^TNX", "^IRX"})
H = prob.load_hist(syms)
tnx, irx = H["^TNX"]["Close"].astype(float), H["^IRX"]["Close"].astype(float)
sp = (tnx - irx).dropna()
sp = sp[sp.index >= "1995-01-01"]
if prob.FAKE: sp = sp / sp.abs().max() * 3
ch60 = sp.diff(60)
print("금리차 지금", round(sp.iloc[-1], 2), sp.index[-1].date(), "60일 변화", round(ch60.iloc[-1], 2))
E1 = [-9, 0, 0.5, 1.5, 9]; L1 = ["역전(<0)", "평평(0~0.5)", "보통(0.5~1.5)", "가파름(>1.5)"]
E2 = [-9, -0.5, -0.15, 0.15, 0.5, 9]; L2 = ["급히 평평(−0.5↓)", "평평해짐", "그대로", "가팔라짐", "급히 가팔라짐(+0.5↑)"]
out = {"now": {"spread": round(float(sp.iloc[-1]), 2), "ch60": round(float(ch60.iloc[-1]), 2), "asof": str(sp.index[-1].date())}, "mk": {}}

def wf_brier(d, cut, prior=150):
    """앞 자료로만: 칸 확률 = (칸 오른 수 + prior·기저율)/(칸 수 + prior) vs 기저율만 — 2010~ 브라이어"""
    y = d["y1"]; ok = y.notna() & cut.notna()
    yy = y.where(ok); known = yy.shift(1)            # t 의 결과는 t+1 에 앎
    base = known.expanding().mean()
    res = {}
    num = pd.Series(0.0, index=d.index); den = pd.Series(0.0, index=d.index)
    for lb in cut.dropna().unique():
        m = (cut == lb)
        k = (known.where(m.shift(1, fill_value=False)).fillna(0)).cumsum()
        n = (known.notna() & m.shift(1, fill_value=False)).astype(float).cumsum()
        num = num.where(~m, k); den = den.where(~m, n)
    p = (num + prior * base) / (den + prior)
    ev = ok & (d.index >= "2010-01-01") & base.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근2년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=730)))):
        b0 = float(((base[msk] - y[msk]) ** 2).mean()); b1 = float(((p[msk] - y[msk]) ** 2).mean())
        res[nm] = [round(b0, 4), round(b1, 4)]
    res["mid"] = str(mid.date())
    return res

for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2000-01-01"]
    lag = (lambda s: s.reindex(d.index).ffill()) if mk == "US" else (lambda s: prob_x.align(s, d.index))
    R = {}
    for nm, x, E, L in (("level", lag(sp), E1, L1), ("ch60", lag(ch60), E2, L2)):
        cut = pd.cut(x, E, labels=L)
        base1 = d["y1"].mean(); base5 = d["y5"].mean()
        mid = d.index[len(d) // 2]
        tb = []
        for lb in L:
            row = {"k": lb}
            for half, msk in (("all", pd.Series(True, index=d.index)), ("앞", pd.Series(d.index < mid, index=d.index)), ("뒤", pd.Series(d.index >= mid, index=d.index))):
                m = prob.cond(d[msk], (cut == lb)[msk].fillna(False), lb)
                b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
                row[half] = None if not m else {"n": m["n"], "d1": round((m["p1"] - b1) * 100, 1), "d5": round(((m["p5"] or 0) - b5) * 100, 1), "p1": round(m["p1"] * 100, 1), "p5": round((m["p5"] or 0) * 100, 1)}
            row["now"] = bool(len(cut.dropna()) and cut.dropna().iloc[-1] == lb)
            tb.append(row)
        R[nm] = {"base1": round(base1 * 100, 1), "base5": round(base5 * 100, 1), "mid": str(mid.date()), "table": tb, "brier1": wf_brier(d, cut)}
        print(mk, nm, json.dumps(R[nm], ensure_ascii=False))
    out["mk"][mk] = R
json.dump(out, open("probe/curve_bt.json", "w"), ensure_ascii=False, indent=1)
