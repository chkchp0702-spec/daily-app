"""#48 밤·낮 엇갈림(밤 오르고 낮 내림 / 그 반대) → 다음 날·5일 — 확률 보강 일지 10/31 13시 (Actions)
한국 밤 수익률 반응 https://scholar.xjtlu.edu.cn:443/en/publications/how-do-investors-react-to-overnight-returns-evidence-from-korea
밤 = log(시가/전날 종가), 낮 = log(종가/시가). 1년 순위로 밤≥70%&낮≤30% = 「밤↑낮↓」, 밤≤30%&낮≥70% = 「밤↓낮↑」.
시가 망가진 해 뺌(night_bt 와 같음). 걸어가며 사전 100 브라이어 앞/뒤·최근5년 · 기존(자기 1일·S&P 5일 꼬리) 위 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import night, wf, score, lab, one, logit_fit

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC"})
H = prob.load_hist(syms)
sp = H["^GSPC"]["Close"].dropna(); sp = sp[sp > 0]
out = {}
for mk, cfg in prob.MK.items():
    px = H[cfg["ix"]]; ng, badyr = night(px)
    d = prob.feats(px); d = d[d.index >= "2000-01-01"].copy()
    ng = ng.reindex(d.index)
    dy = np.log(px["Close"].astype(float) / px["Open"].astype(float)).reindex(d.index).where(ng.notna())
    rn = prob_x.rank252(ng.dropna()).reindex(d.index)
    rd = prob_x.rank252(dy.dropna()).reindex(d.index)
    r1 = prob_x.rank252(np.log(d["c"]).diff(1).dropna()).reindex(d.index)
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rs = A(np.log(sp).diff(5))
    v = rn.notna() & rd.notna() & r1.notna()
    print(mk, "쓸 수 있는 날", int(v.sum()))
    if v.sum() < 800: out[mk] = {"skip": int(v.sum())}; continue
    dd = d[v].copy(); rn, rd, r1, rs = rn[v], rd[v], r1[v], rs[v]
    fa = (rn >= .7) & (rd <= .3)   # 밤↑낮↓
    fb = (rn <= .3) & (rd >= .7)   # 밤↓낮↑
    fa2 = (rn >= .9) & (rd <= .1); fb2 = (rn <= .1) & (rd >= .9)
    mid = dd.index[len(dd) // 2]
    cells = {}
    for nm, f in (("밤↑낮↓(70/30)", fa), ("밤↓낮↑(70/30)", fb), ("밤↑낮↓(90/10)", fa2), ("밤↓낮↑(90/10)", fb2)):
        f = f.fillna(False); cells[nm] = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid)):
            c_ = prob.cond(dd[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - dd.loc[msk, "y5"].mean()) * 100, 1)]
    ov = {"밤↑낮↓일": int(fa.sum()), "그중 자기1일≤30": int((fa & (r1 <= .3)).sum()), "밤↓낮↑일": int(fb.sum()), "그중 자기1일≥70": int((fb & (r1 >= .7)).sum()),
          "corr(낮,1일)": round(float(rd.corr(r1)), 2)}
    ea = one(rn, fa, "a"); eb_ = one(rn, fb, "b"); eab = pd.Series(np.where(fa, "a", np.where(fb, "b", "-")), index=dd.index, dtype=object)
    oth = lab(r1, "rh", "rl") + "|" + lab(rs, "sh", "sl")
    r = {"mid": str(mid.date()), "n": len(dd), "cur_night": round(float(rn.iloc[-1]), 3), "cur_day": round(float(rd.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
    st = str(dd.index[min(400, len(dd) - 1)].date())
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(dd, eab, ycol, h)[1], "엇갈림만": wf(dd, eab, ycol, h)[0],
             "기존(자기1일·S&P5일)": wf(dd, oth, ycol, h)[0], "기존+밤↑낮↓": wf(dd, oth + "|" + ea, ycol, h)[0],
             "기존+밤↓낮↑": wf(dd, oth + "|" + eb_, ycol, h)[0], "기존+둘다": wf(dd, oth + "|" + eab, ycol, h)[0]}
        r[ycol] = score(dd, ycol, P, start=st)
    D = pd.DataFrame({"c": 1.0, "rh": r1 >= .9, "rl": r1 <= .1, "sh": rs >= .9, "sl": rs <= .1, "a": fa, "b": fb}, index=dd.index).astype(float)
    okm = rs.notna(); R = {}
    for ycol in ("y1", "y5"):
        m = okm & dd[ycol].notna(); idx = dd.index[m]; mi = idx[len(idx) // 2]
        y = dd.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi
        rx = {}
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            s_ = {}
            for k, cols in (("기존", [0,1,2,3,4]), ("기존+밤↑낮↓", [0,1,2,3,4,5]), ("기존+밤↓낮↑", [0,1,2,3,4,6]), ("기존+둘다", [0,1,2,3,4,5,6])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s_[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                if k != "기존": s_[k + "계수"] = [round(float(x), 3) for x in w[5:]]
            rx[nm] = s_
        R[ycol] = rx
    r["교차"] = R
    print(mk, json.dumps(r, ensure_ascii=False))
    out[mk] = r
json.dump(out, open("probe/odd_bt.json", "w"), ensure_ascii=False, indent=1)
