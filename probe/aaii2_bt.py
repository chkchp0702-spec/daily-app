"""#65b AAII 낙관 꼬리 → 5일 다시 — 확률 보강 일지 11/4 13시 (Actions)
#65 ➖ : 미국 1주 낙관(≥90) 5일 · 한국 4주 평균 낙관(≥90) 5일 — 겹친 5일 표본이었음.
→ 5일 간격 표본(시작점 5개) · 금요일(발표 다음 날)만 · 사건 솎기 · 자기 ≥90 뺀 「순수」
· 5일 간격 걸어가기(칸 곱하기·덧셈형) · 5일 간격 교차 로지스틱. mof2_bt.py 와 같은 틀."""
import json, sys, os, io
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, lab, one, logit_fit
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept": "*/*", "Referer": "https://www.aaii.com/sentimentsurvey"}
r = requests.get("https://www.aaii.com/files/surveys/sentiment.xls", headers=UA, timeout=30); print("TRY", r.status_code, len(r.content))
x = pd.read_excel(io.BytesIO(r.content), header=None); rows = []
for _, rr in x.iterrows():
    dt = pd.to_datetime(rr[0], errors="coerce")
    try: b, e = float(rr[1]), float(rr[3])
    except (TypeError, ValueError): continue
    if pd.isna(dt) or pd.isna(b) or pd.isna(e) or not (0 <= b <= 1 and 0 <= e <= 1): continue
    rows.append((dt, b - e))
W = pd.Series(dict(rows)).sort_index(); W = W[~W.index.duplicated()]
print("AAII", len(W), W.index[0].date(), W.index[-1].date())
H = prob.load_hist(["^KS11", "^GSPC"])
def cs(s):
    v = H[s]["Close"].dropna(); return v[v > 0]
lo = lambda p: np.log(p / (1 - p))
av = W.copy(); av.index = av.index + pd.Timedelta(days=1)
R1 = av.rolling(52, min_periods=40).rank(pct=True); R4 = av.rolling(4).mean().rolling(52, min_periods=40).rank(pct=True)
OUT = {}
for mk, ix, rr_ in (("US", "^GSPC", R1), ("KR", "^KS11", R4)):
    d0 = prob.feats(H[ix]); d0 = d0[d0.index >= "1999-06-01"].copy()
    a = prob_x.align(rr_, d0.index); src = prob_x.align(pd.Series(rr_.index, index=rr_.index), d0.index)
    gap = (pd.Series(d0.index, index=d0.index) - pd.to_datetime(src)).dt.days
    rg = a.where(gap <= 10)
    ro = prob_x.rank252(np.log(cs(ix)).diff(5)).reindex(d0.index)
    rs = prob_x.rank252(np.log(cs("^GSPC")).diff(5)).reindex(d0.index) if mk == "US" else prob_x.align(prob_x.rank252(np.log(cs("^GSPC")).diff(5)), d0.index)
    v = ro.notna() & rs.notna() & rg.notna() & (d0.index >= "2000-01-01"); dd = d0[v].copy(); ro, rs, rg = ro[v], rs[v], rg[v]
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
    cx = {nm: {"기존": [], "+낙관": [], "계수": []} for nm in ("앞→뒤", "뒤→앞")}
    for key, sel in masks.items():
        m = y5.notna() & sel; idx = dd.index[m]; mi = idx[len(idx) // 2]
        yv = y5[m].values.astype(float); X = D[m].values; a_, b_ = idx < mi, idx >= mi
        for nm, tr, te in (("앞→뒤", a_, b_), ("뒤→앞", b_, a_)):
            for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("+낙관", [0, 1, 2, 3, 4, 5])):
                w = logit_fit(X[tr][:, cols], yv[tr]); p = 1 / (1 + np.exp(-X[te][:, cols] @ w))
                cx[nm][kk].append(round(float(((p - yv[te]) ** 2).mean()), 5))
                if kk != "기존": cx[nm]["계수"].append(round(float(w[5]), 3))
    out = {"mk": mk, "n": len(dd), "mid": str(mid.date()), "기간": [str(dd.index[0].date()), str(dd.index[-1].date())],
           "낙관일": int(fh.sum()), "솎은 사건": int(th.sum()), "순수": int(pure.sum()), "cur_rank": round(float(rg.iloc[-1]), 3),
           "칸(n,y5차%p)": cells, "걸어가기 5일간격 평균": avg, "걸어가기 시작별": wfr, "교차(시작0~4,발표첫날)": cx}
    print("R", mk, json.dumps(out, ensure_ascii=False))
    OUT[mk] = out
json.dump(OUT, open("probe/aaii2_bt.json", "w"), ensure_ascii=False, indent=1)
