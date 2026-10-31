"""#49 아시아−미국 5일 상대 강도 꼬리 되돌림 → 다음 날·5일 — 확률 보강 일지 10/31 14시 (Actions)
상대 강도 = 그 나라 지수 5일 로그 등락 − S&P 5일 로그 등락(미국 하루 늦춘 같은 창 — v1 은 간밤 미국 하루가 섞여 닻과 겹쳤음). 1년 순위 ≥90%(혼자 너무 셈) / ≤10%(혼자 너무 약함).
되돌림 가설: 혼자 너무 세면 다음에 덜 오름, 너무 약하면 따라잡음. 걸어가며 사전 100 브라이어 앞/뒤·최근5년 ·
기존(자기 5일·S&P 5일 꼬리·간밤 S&P 5칸) 위 + 교차 로지스틱. 5일 간격 표본도 칸만 따로."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, lab, one, logit_fit

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC"})
H = prob.load_hist(syms)
sp = H["^GSPC"]["Close"].dropna(); sp = sp[sp > 0]
out = {}
for mk, cfg in prob.MK.items():
    if mk == "US": continue
    px = H[cfg["ix"]]
    d = prob.feats(px); d = d[d.index >= "2000-01-01"].copy()
    own5 = np.log(d["c"]).diff(5)
    sp5 = prob_x.align(np.log(sp).diff(5).shift(1), d.index)   # v2: 같은 창(아시아 t 마감 ↔ 미국 t-1 마감) — 간밤 미국 하루는 뺌
    sp1 = prob_x.align(np.log(sp).diff(1), d.index)              # 간밤 미국(닻이 이미 쓰는 몫) → 기존 칸에 넣어 겹침 제거
    r1s = prob_x.align(prob_x.rank252(np.log(sp).diff(1)), d.index)
    rel = (own5 - sp5)
    rr = prob_x.rank252(rel.dropna()).reindex(d.index)
    ro = prob_x.rank252(own5.dropna()).reindex(d.index)
    rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
    v = rr.notna() & ro.notna() & rs.notna() & r1s.notna()
    dd = d[v].copy(); rr, ro, rs, r1s, sp1 = rr[v], ro[v], rs[v], r1s[v], sp1[v]
    q1 = pd.Series(np.select([r1s >= .8, r1s >= .6, r1s >= .4, r1s >= .2], ["n5", "n4", "n3", "n2"], "n1"), index=dd.index, dtype=object)
    print(mk, "쓸 수 있는 날", len(dd))
    fh, fl = rr >= .9, rr <= .1
    mid = dd.index[len(dd) // 2]
    cells = {}
    for nm, f in (("혼자 셈(≥90)", fh), ("혼자 약함(≤10)", fl)):
        cells[nm] = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid)):
            c_ = prob.cond(dd[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - dd.loc[msk, "y5"].mean()) * 100, 1)]
        # 5일 간격 표본(겹침 없이)
        sub = dd.iloc[::5]; fs = f.iloc[::5]; mid5 = sub.index[len(sub) // 2]; c5 = {}
        for half, msk in (("앞", sub.index < mid5), ("뒤", sub.index >= mid5)):
            ss = sub[msk]; ff = fs[msk]
            c5[half] = [int(ff.sum()), round((ss.loc[ff, "y5"].mean() - ss["y5"].mean()) * 100, 1)] if ff.sum() else None
        cells[nm]["5일간격(n,y5차)"] = c5
    ov = {"셈일": int(fh.sum()), "그중 자기5일≥90": int((fh & (ro >= .9)).sum()), "그중 S&P5일≤10": int((fh & (rs <= .1)).sum()), "그중 간밤S&P≤20": int((fh & (r1s <= .2)).sum()),
          "약함일": int(fl.sum()), "그중 자기5일≤10": int((fl & (ro <= .1)).sum()), "그중 S&P5일≥90": int((fl & (rs >= .9)).sum()), "그중 간밤S&P≥80": int((fl & (r1s >= .8)).sum()),
          "corr(상대,자기5)": round(float(rr.corr(ro)), 2)}
    eh = one(rr, fh, "h"); el = one(rr, fl, "l"); ehl = pd.Series(np.where(fh, "h", np.where(fl, "l", "-")), index=dd.index, dtype=object)
    oth = lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl") + "|" + q1
    r = {"mid": str(mid.date()), "n": len(dd), "cur_rel": round(float(rel.reindex(dd.index).iloc[-1]) * 100, 2), "cur_rank": round(float(rr.iloc[-1]), 3),
         "last": str(dd.index[-1].date()), "칸(n,y1차,y5차)": cells, "겹침": ov}
    st = str(dd.index[min(400, len(dd) - 1)].date())
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(dd, ehl, ycol, h)[1], "상대만": wf(dd, ehl, ycol, h)[0],
             "기존(자기5·S&P5·간밤5칸)": wf(dd, oth, ycol, h)[0], "기존+셈": wf(dd, oth + "|" + eh, ycol, h)[0],
             "기존+약함": wf(dd, oth + "|" + el, ycol, h)[0], "기존+둘다": wf(dd, oth + "|" + ehl, ycol, h)[0]}
        r[ycol] = score(dd, ycol, P, start=st)
    D = pd.DataFrame({"c": 1.0, "oh": ro >= .9, "ol": ro <= .1, "sh": rs >= .9, "sl": rs <= .1, "s1": (sp1 / sp1.std()).clip(-4, 4), "h": fh, "l": fl}, index=dd.index).astype(float)
    R = {}
    for ycol in ("y1", "y5"):
        m = dd[ycol].notna(); idx = dd.index[m]; mi = idx[len(idx) // 2]
        y = dd.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi
        rx = {}
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            s_ = {}
            for k, cols in (("기존", [0,1,2,3,4,5]), ("기존+셈", [0,1,2,3,4,5,6]), ("기존+약함", [0,1,2,3,4,5,7]), ("기존+둘다", [0,1,2,3,4,5,6,7])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s_[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                if k != "기존": s_[k + "계수"] = [round(float(x), 3) for x in w[6:]]
            rx[nm] = s_
        R[ycol] = rx
    r["교차"] = R
    print(mk, json.dumps(r, ensure_ascii=False))
    out[mk] = r
json.dump(out, open("probe/rs_bt.json", "w"), ensure_ascii=False, indent=1)
