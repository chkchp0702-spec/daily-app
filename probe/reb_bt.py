"""#16 월말 연기금 리밸런싱 검증 — 확률 보강 일지 10/28 10시 (Actions 에서 실행)
Etula·Rinne·Suominen·Vaittinen 「Dash for Cash」: 그달 주식이 채권보다 많이 오르면 월말 마지막 며칠 주식이 약함(되맞춤 매도).
특성: 그달 주식 누적(지난달 마지막 종가 대비) − 국채 TLT 누적 · 그리고 주식 누적만. 대상 날 = 그달 남은 거래일 1~4일(다음 날이 아직 월말)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"TLT"})
H = prob.load_hist(syms)
tlt = H["TLT"]["Close"].astype(float)
E = [-99, -3, -1, 1, 3, 99]
L = ["−3%↓", "−3~−1", "−1~+1", "+1~+3", "+3%↑"]


def mtd(c):
    """그달 누적: 지난달 마지막 종가 대비"""
    m = c.index.to_period("M")
    prev_last = c.groupby(m).last().shift(1)
    return c / prev_last.reindex(m).values - 1


def wf_brier(d, cut, ycol, prior=150):
    """앞 자료로만: 칸 확률 = (칸 오른 수 + prior·기저율)/(칸 수 + prior) vs 기저율(같은 월말 창)만"""
    y = d[ycol]; ok = y.notna() & cut.notna()
    sh = 1 if ycol == "y1" else 5
    yy = y.where(ok); known = yy.shift(sh)
    base = known.expanding().mean()
    num = pd.Series(0.0, index=d.index); den = pd.Series(0.0, index=d.index)
    for lb in cut.dropna().unique():
        m = (cut == lb)
        mm = m.shift(sh, fill_value=False)
        k = known.where(mm).fillna(0).cumsum()
        n = (known.notna() & mm).astype(float).cumsum()
        num = num.where(~m, k); den = den.where(~m, n)
    p = (num + prior * base) / (den + prior)
    ev = ok & (d.index >= "2008-01-01") & base.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    res = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근3년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1095)))):
        res[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 4), round(float(((p[msk] - y[msk]) ** 2).mean()), 4), int(msk.sum())]
    return res


out = {"mk": {}}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2002-08-01"].copy()
    m = d.index.to_period("M")
    pos = d.groupby(m).cumcount()
    cnt = d.groupby(m)["c"].transform("size")
    rem = cnt - 1 - pos                                   # 그달 남은 거래일 (0 = 마지막 날)
    # 이번 달은 아직 안 끝남 → 남은 날 = 달 끝까지 영업일
    cur = d.index[-1]
    me = (cur + pd.offsets.BMonthEnd(0))
    rem.loc[m == cur.to_period("M")] = [len(pd.bdate_range(t, me)) - 1 for t in d.index[m == cur.to_period("M")]]
    win = (rem >= 1) & (rem <= 4)
    s_m = mtd(d["c"]) * 100
    b = tlt.reindex(tlt.index.union(d.index)).ffill()
    b_m = mtd(b).reindex(d.index) * 100
    if mk != "US":
        b_m = prob_x.align(mtd(tlt) * 100, d.index)       # 아시아는 하루 늦은 미국 값
    sig = {"주식−채권": s_m - b_m, "주식만": s_m}
    R = {"rem_now": int(rem.iloc[-1]), "now": {k: round(float(v.iloc[-1]), 2) for k, v in sig.items() if pd.notna(v.iloc[-1])}}
    dw = d[win]
    mid = dw.index[len(dw) // 2]
    R["mid"] = str(mid.date()); R["base1"] = round(dw["y1"].mean() * 100, 1); R["base5"] = round(dw["y5"].mean() * 100, 1)
    R["base1_all"] = round(d["y1"].mean() * 100, 1)
    for nm, x in sig.items():
        cut = pd.cut(x.where(win), E, labels=L)
        tb = []
        for lb in L:
            row = {"k": lb}
            for half, msk in (("all", win), ("앞", win & (d.index < mid)), ("뒤", win & (d.index >= mid))):
                c_ = prob.cond(d[msk], (cut == lb)[msk].fillna(False), lb)
                b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
                row[half] = None if not c_ else {"n": c_["n"], "d1": round((c_["p1"] - b1) * 100, 1), "d5": round(((c_["p5"] or 0) - b5) * 100, 1)}
            tb.append(row)
        # 위/아래 두 칸으로 묶은 것 (+1%↑ vs −1%↓)
        cut2 = pd.cut(x.where(win), [-99, -1, 1, 99], labels=["아래", "가운데", "위"])
        R[nm] = {"table": tb, "brier1": wf_brier(d, cut2, "y1"), "brier5": wf_brier(d, cut2, "y5"),
                 "brier1_5칸": wf_brier(d, cut, "y1")}
        print(mk, nm, json.dumps(R[nm], ensure_ascii=False))
    print(mk, "지금", R["rem_now"], R["now"], "창 기저", R["base1"], R["base5"], "전체", R["base1_all"])
    out["mk"][mk] = R
json.dump(out, open("probe/reb_bt.json", "w"), ensure_ascii=False, indent=1)
