"""#89 중국 「밤 갭 비대칭」(오늘 시가 갭 부호·크기 → 그날 낮·다음 날·5일) — 확률 보강 11/9 13시 (Actions)
근거: https://hull-repository.worktribe.com/output/4164212/the-asymmetric-overnight-return-anomaly-in-the-chinese-stock-market
갭 = log(오늘 시가/전날 종가). 1년 순위 꼬리(≥90·≤10)·3칸(≤30·≥70) · 사건 솎기 · 앞/뒤·최근5년 칸 ·
기존(자기·S&P 5일 꼬리 + 간밤 S&P 3칸) 위 걸어가기(칸곱·덧셈형) · 교차 로지스틱 · 5일 간격 표본.
#48(1일 밤·낮 엇갈림)·#40(밤 5일 누적)과 다른 20일 괴리. 한국이 본 대상, 일·중·홍은 곁가지 확인."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import night, wf, score, lab, one, logit_fit

H = prob.load_hist(["^KS11", "^N225", "000001.SS", "^HSI", "^GSPC"])
sp = H["^GSPC"]["Close"].dropna()
lo_ = lambda p: np.log(p / (1 - p))
OUT = {}
for mk in ("CN", "HK", "KR", "JP"):
    cfg = prob.MK[mk]; px = H[cfg["ix"]]
    n_, yrs = night(px)
    dayr = np.log(px["Close"].astype(float) / px["Open"].astype(float)).where(n_.notna())
    g = n_
    rgx = prob_x.rank252(g.dropna())
    def intr(f):
        f = f.reindex(dayr.index, fill_value=False) & dayr.notna(); b = (dayr > 0)[dayr.notna()]
        mid_ = dayr.dropna().index[len(dayr.dropna()) // 2]
        return [[int((f & (dayr.index < mid_)).sum()), round(((dayr[f & (dayr.index < mid_)] > 0).mean() - b[b.index < mid_].mean()) * 100, 1)],
                [int((f & (dayr.index >= mid_)).sum()), round(((dayr[f & (dayr.index >= mid_)] > 0).mean() - b[b.index >= mid_].mean()) * 100, 1)]]
    rr = rgx.reindex(dayr.index)
    INTR = {"갭≥90 그날낮": intr(rr >= .9), "갭≤10 그날낮": intr(rr <= .1), "갭≤-1% 그날낮": intr(g <= -0.01), "갭≥+1% 그날낮": intr(g >= 0.01)}
    d = prob.feats(px)
    rg = prob_x.rank252(g.dropna()).reindex(d.index)
    ro = prob_x.rank252(np.log(d["c"]).diff(5).dropna()).reindex(d.index)
    rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
    sp1 = prob_x.align(np.log(sp).diff(1), d.index)
    v = rg.notna() & ro.notna() & rs.notna() & sp1.notna()
    dd = d[v].copy(); rg, ro, rs, sp1 = rg[v], ro[v], rs[v], sp1[v]
    mid = dd.index[len(dd) // 2]; r5 = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
    res = {"n": len(dd), "first": str(dd.index[0].date()), "mid": str(mid.date()), "last": str(dd.index[-1].date()),
           "cur_rank": round(float(rg.iloc[-1]), 3), "cur_gap%": round(float(g.dropna().iloc[-1]) * 100, 2), "그날낮(앞[n,%p],뒤)": INTR, "결측해": {k: v for k, v in yrs.items() if v > 0.2}}
    q3 = pd.Series(np.select([sp1.rank(pct=True) >= 2/3, sp1.rank(pct=True) >= 1/3], ["n3", "n2"], "n1"), index=dd.index, dtype=object)
    base = lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl") + "|" + q3
    st = str(dd.index[300].date())
    for tag, f in (("갭≥90", rg >= .9), ("갭≤10", rg <= .1), ("갭≤-1%", (g.reindex(dd.index) <= -0.01)), ("갭≥+1%", (g.reindex(dd.index) >= 0.01)), ("갭≤10&낮↑", (rg <= .1) & (dayr.reindex(dd.index) > 0)), ("갭≥90&낮↓", (rg >= .9) & (dayr.reindex(dd.index) < 0))):
        fe = f & ~(f.shift(1, fill_value=False) | f.shift(2, fill_value=False) | f.shift(3, fill_value=False) | f.shift(4, fill_value=False))
        cell = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5)):
            c_ = prob.cond(dd[msk], f[msk], tag)
            if not c_: cell[half] = None; continue
            b1 = dd.loc[msk, "y1"].mean(); b5 = dd.loc[msk, "y5"].mean()
            cell[half] = {"n": c_["n"], "d1": round((c_["p1"] - b1) * 100, 1), "d5": round((c_["p5"] - b5) * 100, 1) if c_["p5"] is not None else None}
            c2 = prob.cond(dd[msk], fe[msk], tag)
            if c2: cell[half]["솎음"] = [c2["n"], round((c2["p1"] - b1) * 100, 1), round((c2["p5"] - b5) * 100, 1) if c2["p5"] is not None else None]
        r = {"칸": cell}
        el = one(rg, f, "g")
        for yc, h in (("y1", 1), ("y5", 5)):
            P = {"기존": wf(dd, base, yc, h)[0], "+갭": wf(dd, base + "|" + el, yc, h)[0]}
            r[f"칸곱 {yc}"] = score(dd, yc, P, start=st)
            pb = P["기존"]; y = dd[yc]; known = y.shift(h); fk = f.shift(h, fill_value=False)
            k = known.where(fk).fillna(0).cumsum(); nn = (known.notna() & fk).astype(float).cumsum()
            bse = known.expanding().mean(); pl = (k + 100 * bse) / (nn + 100)
            pa = pb.copy(); m = f & pb.notna() & pl.notna()
            pa[m] = 1 / (1 + np.exp(-(lo_(pb[m]) + 0.5 * (lo_(pl[m]) - lo_(bse[m])))))
            r[f"덧셈w0.5 {yc}"] = score(dd, yc, {"기존": pb, "+갭": pa}, start=st)
            # 교차 로지스틱
            D = pd.DataFrame({"c": 1.0, "oh": ro >= .9, "ol": ro <= .1, "sh": rs >= .9, "sl": rs <= .1,
                              "s1": (sp1 / sp1.std()).clip(-4, 4), "g": f}, index=dd.index).astype(float)
            mm = y.notna(); idx = dd.index[mm]; mi = idx[len(idx) // 2]; yy = y[mm].values.astype(float); Xa = D[mm].values
            a, b_ = idx < mi, idx >= mi; R = {}
            for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
                w0 = logit_fit(Xa[tr][:, :6], yy[tr]); w1 = logit_fit(Xa[tr], yy[tr])
                p0 = 1 / (1 + np.exp(-Xa[te][:, :6] @ w0)); p1 = 1 / (1 + np.exp(-Xa[te] @ w1))
                R[nm] = [round(float(((p0 - yy[te]) ** 2).mean()), 5), round(float(((p1 - yy[te]) ** 2).mean()), 5), round(float(w1[6]), 3)]
            r[f"교차 {yc}(기존,+갭,계수)"] = R
        # 5일 간격 표본 5일 결과
        s5 = []
        for s0 in range(5):
            ix = dd.index[s0::5]; q = dd.loc[ix]; ff = f.loc[ix]; m_ = ix < mid
            s5.append([round((q.loc[m_ & ff.values, "y5"].mean() - q.loc[m_, "y5"].mean()) * 100, 1),
                       round((q.loc[~m_ & ff.values, "y5"].mean() - q.loc[~m_, "y5"].mean()) * 100, 1)])
        r["5일간격 y5(앞,뒤)"] = s5
        r["겹침(자기5꼬리)"] = int((f & ((ro >= .9) | (ro <= .1))).sum()); r["날수"] = int(f.sum())
        res[tag] = r
    OUT[mk] = res
print(json.dumps(OUT, ensure_ascii=False, indent=1))
