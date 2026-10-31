"""#50 홍콩 「밤↓낮↑」 → 5일 다시 — 확률 보강 일지 10/31 15시 (Actions)
#48 에서 홍콩 밤↓낮↑ 5일 −5.4·−3.7%p, 교차 두 방향 좋아짐, 걸어가기 앞 나빠짐(➖).
5일 등락은 날마다 겹치므로 (1) 5일 간격 표본(시작점 0~4 다섯 가지) (2) 사건 솎기(사건 뒤 4일 안 사건 뺌)로 칸 앞/뒤 다시,
(3) 걸어가며 브라이어를 5일 간격 날에서만 채점, (4) 5일 간격 표본 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import night, wf, lab, one, logit_fit

out = {}
H = prob.load_hist(sorted({prob.MK[m]["ix"] for m in prob.MK} | {"^GSPC"}))
sp = H["^GSPC"]["Close"].dropna(); sp = sp[sp > 0]
for mk in [m for m in prob.MK if prob.MK[m]["ix"] in ("^HSI",)] or ["HK"]:
    cfg = prob.MK[mk]; px = H[cfg["ix"]]; ng, _ = night(px)
    d = prob.feats(px); d = d[d.index >= "2000-01-01"].copy()
    ng = ng.reindex(d.index)
    dy = np.log(px["Close"].astype(float) / px["Open"].astype(float)).reindex(d.index).where(ng.notna())
    rn = prob_x.rank252(ng.dropna()).reindex(d.index); rd = prob_x.rank252(dy.dropna()).reindex(d.index)
    r1 = prob_x.rank252(np.log(d["c"]).diff(1).dropna()).reindex(d.index)
    rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
    v = rn.notna() & rd.notna() & r1.notna() & rs.notna()
    dd = d[v].copy(); rn, rd, r1, rs = rn[v], rd[v], r1[v], rs[v]
    fb = ((rn <= .3) & (rd >= .7)).fillna(False)
    mid = dd.index[len(dd) // 2]; y5 = dd["y5"]
    # (2) 사건 솎기
    th = fb.copy(); last = -99; pos = np.arange(len(dd))
    for i in pos:
        if fb.iloc[i]:
            if i - last < 5: th.iloc[i] = False
            else: last = i
    cells = {}
    def cell(f, name):
        r = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid)):
            m = msk & y5.notna(); base = y5[m].mean(); s = y5[m & f]
            r[half] = [int(len(s)), round((s.mean() - base) * 100, 1) if len(s) else None]
        cells[name] = r
    cell(fb, "전체(겹침)"); cell(th, "사건 솎기(4일 안 뺌)")
    for k in range(5):
        cell(fb & pd.Series(pos % 5 == k, index=dd.index), f"5일 간격 시작{k}")
    # (3) 걸어가며 브라이어, 5일 간격 날만 채점
    oth = lab(r1, "rh", "rl") + "|" + lab(rs, "sh", "sl"); eb = one(rn, fb, "b")
    P = {"평소": wf(dd, eb, "y5", 5)[1], "기존": wf(dd, oth, "y5", 5)[0], "기존+밤↓낮↑": wf(dd, oth + "|" + eb, "y5", 5)[0]}
    st = dd.index[min(400, len(dd) - 1)]
    wfr = {}
    for k in range(5):
        ev = y5.notna() & (dd.index >= st) & pd.Series(pos % 5 == k, index=dd.index)
        for p in P.values(): ev &= p.notna()
        mi = dd.index[ev][len(dd.index[ev]) // 2]
        rr = {}
        for nm, msk in (("앞", ev & (dd.index < mi)), ("뒤", ev & (dd.index >= mi)), ("최근5년", ev & (dd.index >= dd.index[-1] - pd.Timedelta(days=1826)))):
            rr[nm] = {kk: round(float(((p[msk] - y5[msk]) ** 2).mean()), 5) for kk, p in P.items()}
        wfr[f"시작{k}"] = rr
    # 평균
    avg = {nm: {kk: round(float(np.mean([wfr[f"시작{k}"][nm][kk] for k in range(5)])), 5) for kk in P} for nm in ("앞", "뒤", "최근5년")}
    # (4) 5일 간격 교차 로지스틱(시작점 5개 평균)
    D = pd.DataFrame({"c": 1.0, "rh": r1 >= .9, "rl": r1 <= .1, "sh": rs >= .9, "sl": rs <= .1, "b": fb}, index=dd.index).astype(float)
    cx = {"앞→뒤": {"기존": [], "기존+밤↓낮↑": [], "계수": []}, "뒤→앞": {"기존": [], "기존+밤↓낮↑": [], "계수": []}}
    for k in range(5):
        m = y5.notna() & pd.Series(pos % 5 == k, index=dd.index); idx = dd.index[m]; mi = idx[len(idx) // 2]
        y = y5[m].values.astype(float); X = D[m].values; a, b_ = idx < mi, idx >= mi
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("기존+밤↓낮↑", [0, 1, 2, 3, 4, 5])):
                w = logit_fit(X[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-X[te][:, cols] @ w))
                cx[nm][kk].append(float(((p - y[te]) ** 2).mean()))
                if kk != "기존": cx[nm]["계수"].append(round(float(w[5]), 3))
    for nm in cx:
        for kk in ("기존", "기존+밤↓낮↑"): cx[nm][kk] = round(float(np.mean(cx[nm][kk])), 5)
    r = {"mid": str(mid.date()), "n": len(dd), "사건": int(fb.sum()), "솎은 사건": int(th.sum()),
         "cur": [round(float(rn.iloc[-1]), 3), round(float(rd.iloc[-1]), 3)], "칸(n,y5차%p)": cells,
         "걸어가기 5일간격 평균": avg, "걸어가기 시작별": wfr, "교차(5개 평균)": cx}
    print(mk, json.dumps(r, ensure_ascii=False))
    out[mk] = r
json.dump(out, open("probe/odd2_bt.json", "w"), ensure_ascii=False, indent=1)
