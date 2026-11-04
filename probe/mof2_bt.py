"""#64b 일본 「외국인 4주 순매수 많음」(52주 ≥90) → 닛케이 5일 다시 — 확률 보강 일지 11/4 11시 (Actions)
#64 ✅ 는 겹친 5일 표본. → 5일 간격 표본(시작점 5개) · 사건 솎기 · 목요일(발표일)만 · 자기 ≥90 뺀 「순수」
· 5일 간격 걸어가기(칸 곱하기·덧셈형) · 5일 간격 교차 로지스틱. 보수적으로 주 끝(토)+5일(목, 발표일) 부터 사용(+4 와 비교)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, lab, one, logit_fit

W = prob_x.mof_week()
print("MOF", len(W), W.index[0].date(), W.index[-1].date())
H = prob.load_hist(["^N225", "^GSPC"])
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
lo = lambda p: np.log(p / (1 - p))
d0 = prob.feats(H["^N225"]); d0 = d0[d0.index >= "2005-06-01"].copy()
OUT = {}
for lag in (5, 4):
    av = W.copy(); av.index = av.index + pd.Timedelta(days=lag)
    r4 = av.rolling(4).sum().rolling(52, min_periods=40).rank(pct=True)
    a = prob_x.align(r4, d0.index); src = prob_x.align(pd.Series(r4.index, index=r4.index), d0.index)
    gap = (pd.Series(d0.index, index=d0.index) - pd.to_datetime(src)).dt.days
    rg = a.where(gap <= 10)
    ro = prob_x.rank252(np.log(cs("^N225")).diff(5)).reindex(d0.index)
    rs = prob_x.align(prob_x.rank252(np.log(cs("^GSPC")).diff(5)), d0.index)
    v = ro.notna() & rs.notna() & rg.notna(); dd = d0[v].copy(); ro, rs, rg = ro[v], rs[v], rg[v]
    fh = rg >= .9; pure = fh & ~(ro >= .9)
    newwk = pd.Series(pd.to_datetime(src[v]).values, index=dd.index); first = newwk != newwk.shift(1)
    def thin(f):
        th = f.copy(); last = -99
        for i in range(len(f)):
            if f.iloc[i]:
                if i - last < 5: th.iloc[i] = False
                else: last = i
        return th
    th = thin(fh); pos = np.arange(len(dd)); y5 = dd["y5"]; mid = dd.index[len(dd) // 2]
    r5 = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
    cells = {}
    def cell(f, name, base_mask=None):
        r = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5)):
            mm = msk & y5.notna()
            if base_mask is not None: mm = mm & base_mask
            b0 = y5[mm].mean(); s = y5[mm & f]
            r[half] = [int(len(s)), round((s.mean() - b0) * 100, 1) if len(s) else None]
        cells[name] = r
    cell(fh, "전체(겹침)"); cell(th, "사건 솎기"); cell(pure, "순수(자기≥90 뺌)")
    cell(fh & first, "발표 첫날만(주 1번)", first)
    for k in range(5): cell(fh & pd.Series(pos % 5 == k, index=dd.index), f"5일 간격 시작{k}")
    oth = lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl"); eg = one(rg, fh, "g")
    pb = wf(dd, oth, "y5", 5)[0]; bse = y5.shift(5).expanding().mean()
    known = y5.shift(5); fk = fh.shift(5, fill_value=False)
    pl = (known.where(fk).fillna(0).cumsum() + 100 * bse) / ((known.notna() & fk).astype(float).cumsum() + 100)
    Pm = {"기존": pb, "칸곱": wf(dd, oth + "|" + eg, "y5", 5)[0]}
    for w in (0.3, 0.5, 1.0):
        pa = pb.copy(); m = fh & pb.notna() & pl.notna()
        pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m]))))); Pm[f"덧셈 w{w}"] = pa
    st = dd.index[250]; wfr = {}
    masks = {f"시작{k}": pd.Series(pos % 5 == k, index=dd.index) for k in range(5)}; masks["발표첫날"] = first
    for key, sel in masks.items():
        ev = y5.notna() & (dd.index >= st) & sel
        for p in Pm.values(): ev &= p.notna()
        mi = dd.index[ev][len(dd.index[ev]) // 2]; rr = {}
        for nm, msk in (("앞", ev & (dd.index < mi)), ("뒤", ev & (dd.index >= mi)), ("최근5년", ev & r5)):
            rr[nm] = {kk: round(float(((p[msk] - y5[msk]) ** 2).mean()), 5) for kk, p in Pm.items()}
        wfr[key] = rr
    avg = {nm: {kk: round(float(np.mean([wfr[f"시작{k}"][nm][kk] for k in range(5)])), 5) for kk in Pm} for nm in ("앞", "뒤", "최근5년")}
    D = pd.DataFrame({"c": 1.0, "oh": ro >= .9, "ol": ro <= .1, "sh": rs >= .9, "sl": rs <= .1, "g": fh}, index=dd.index).astype(float)
    cx = {nm: {"기존": [], "+많음": [], "계수": []} for nm in ("앞→뒤", "뒤→앞")}
    for key, sel in masks.items():
        m = y5.notna() & sel; idx = dd.index[m]; mi = idx[len(idx) // 2]
        yv = y5[m].values.astype(float); X = D[m].values; a_, b_ = idx < mi, idx >= mi
        for nm, tr, te in (("앞→뒤", a_, b_), ("뒤→앞", b_, a_)):
            for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("+많음", [0, 1, 2, 3, 4, 5])):
                w = logit_fit(X[tr][:, cols], yv[tr]); p = 1 / (1 + np.exp(-X[te][:, cols] @ w))
                cx[nm][kk].append(round(float(((p - yv[te]) ** 2).mean()), 5))
                if kk != "기존": cx[nm]["계수"].append(round(float(w[5]), 3))
    out = {"lag": lag, "n": len(dd), "mid": str(mid.date()), "기간": [str(dd.index[0].date()), str(dd.index[-1].date())],
           "많음일": int(fh.sum()), "솎은 사건": int(th.sum()), "순수": int(pure.sum()), "cur_rank": round(float(rg.iloc[-1]), 3),
           "칸(n,y5차%p)": cells, "걸어가기 5일간격 평균": avg, "걸어가기 시작별": wfr, "교차(시작0~4,발표첫날)": cx}
    print("R", lag, json.dumps(out, ensure_ascii=False))
    OUT[lag] = out
json.dump(OUT, open("probe/mof2_bt.json", "w"), ensure_ascii=False, indent=1)
