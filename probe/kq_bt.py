"""#38 코스닥÷코스피(^KQ11/^KS11) 5일 꼬리 → 한국 다음 날·5일 — 확률 보강 일지 10/30 13시 (Actions)
개인 투기 쏠림(≥90%)·되돌림(≤10%) 가설. 같은 한국 달력(그날 마감 값 → 다음 날).
걸어가며 사전 100 브라이어 앞/뒤·최근5년. 겹침: 코스피 자기 5일·S&P 5일 꼬리 칸 위 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

H = prob.load_hist(["^KS11", "^KQ11", "^GSPC"])
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
ks, kq, sp = cs("^KS11"), cs("^KQ11"), cs("^GSPC")
b = pd.concat([kq, ks], axis=1, keys=["q", "s"]).dropna(); sprd = np.log(b["q"] / b["s"])
print("KQ/KS", sprd.index[0].date(), sprd.index[-1].date(), len(sprd))

def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base
def score(d, ycol, ps, start="2002-01-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]; r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r
def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())
def one(r, c_, nm):
    return pd.Series(np.where(c_, nm, "-"), index=r.index, dtype=object).where(r.notna())

d = prob.feats(H["^KS11"]); d = d[d.index >= "2000-01-01"].copy()
rk = prob_x.rank252(np.log(ks).diff(5)).reindex(d.index)
rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
re_ = prob_x.rank252(sprd.diff(5)).reindex(d.index)
oth = lab(rk, "kh", "kl") + "|" + lab(rs, "sh", "sl")
mid = d.index[len(d) // 2]; cells = {}
for nm, f in (("≤10(코스닥 되돌림)", (re_ <= 0.1).fillna(False)), ("≥90(코스닥 쏠림)", (re_ >= 0.9).fillna(False))):
    cells[nm] = {}
    for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
        c_ = prob.cond(d[msk], f[msk], nm)
        cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
fl = (re_ <= 0.1).fillna(False); fh = (re_ >= 0.9).fillna(False)
ov = {"되돌림일": int(fl.sum()), "되돌림&코스피≤10": int((fl & (rk <= .1)).sum()), "되돌림&코스피≥90": int((fl & (rk >= .9)).sum()),
      "쏠림일": int(fh.sum()), "쏠림&코스피≥90": int((fh & (rk >= .9)).sum()), "쏠림&코스피≤10": int((fh & (rk <= .1)).sum())}
el, eh, eb = one(re_, re_ <= 0.1, "el"), one(re_, re_ >= 0.9, "eh"), lab(re_, "eh", "el")
r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(re_.iloc[-1]) else round(float(re_.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
for ycol, h in (("y1", 1), ("y5", 5)):
    P = {"평소": wf(d, eb, ycol, h)[1], "되돌림": wf(d, el, ycol, h)[0], "쏠림": wf(d, eh, ycol, h)[0], "양쪽": wf(d, eb, ycol, h)[0],
         "기존(코스피·S&P)": wf(d, oth, ycol, h)[0], "기존+되돌림": wf(d, oth + "|" + el, ycol, h)[0],
         "기존+쏠림": wf(d, oth + "|" + eh, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + eb, ycol, h)[0]}
    r[ycol] = score(d, ycol, P)
print("KR", json.dumps(r, ensure_ascii=False))

def logit_fit(X, y, l2=1.0, it=200):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w
D = pd.DataFrame({"c": 1.0, "kh": rk >= .9, "kl": rk <= .1, "sh": rs >= .9, "sl": rs <= .1, "e": re_ <= .1, "eh": re_ >= .9}, index=d.index).astype(float)
ok = rk.notna() & rs.notna() & re_.notna() & (d.index >= "2002-01-01"); R = {}
for ycol in ("y1", "y5"):
    m = ok & d[ycol].notna(); idx = d.index[m]; mi = idx[len(idx) // 2]
    y = d.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi; rr = {}
    for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
        s = {}
        for k, cols in (("기존", [0,1,2,3,4]), ("기존+되돌림", [0,1,2,3,4,5]), ("기존+쏠림", [0,1,2,3,4,6]), ("기존+양쪽", [0,1,2,3,4,5,6])):
            w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
            s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
            if k != "기존": s[k + "계수"] = [round(float(v), 3) for v in w[5:]]
        rr[nm] = s
    R[ycol] = rr
print("교차 KR", json.dumps(R, ensure_ascii=False))
json.dump({"tab": r, "cross": R}, open("probe/kq_bt.json", "w"), ensure_ascii=False, indent=1)
