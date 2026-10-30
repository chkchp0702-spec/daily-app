"""#39 미 소형주(^RUT÷^GSPC) 5일 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 10/30 15시 (Actions)
소형주 강세(≥90%)=위험선호 폭 넓음 · 약세(≤10%)=위험회피 가설.
미국 날짜 값 → 다음 아시아 장(prob_x.align). 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: 위험선호(XLY/XLP)·SOX−S&P·S&P 5일 꼬리 칸 위에 더해도 좋아지는지 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^RUT", "XLY", "XLP", "^SOX", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
ru, xy, xp, sx, sp = cs("^RUT"), cs("XLY"), cs("XLP"), cs("^SOX"), cs("^GSPC")
b = pd.concat([ru, sp], axis=1, keys=["e", "i"]).dropna(); sprd = np.log(b["e"] / b["i"])
c2 = pd.concat([xy, xp], axis=1, keys=["h", "l"]).dropna(); crd = np.log(c2["h"] / c2["l"])
c3 = pd.concat([sx, sp], axis=1, keys=["a", "b"]).dropna(); sxr = np.log(c3["a"] / c3["b"])
dx = np.exp(sxr)
print("RUT/SPX", sprd.index[0].date(), sprd.index[-1].date(), len(sprd), "SOX/SPX", sxr.index[0].date())


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2002-01-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())
def one(r, cond_, nm):
    return pd.Series(np.where(cond_, nm, "-"), index=r.index, dtype=object).where(r.notna())


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2000-01-01"].copy()
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rd = A(np.log(dx).diff(5)); rs = A(np.log(sp).diff(5)); rc = A(crd.diff(5)); re_ = A(sprd.diff(5))
    oth = lab(rc, "ch", "cl") + "|" + lab(rd, "dh", "dl") + "|" + lab(rs, "sh", "sl")
    mid = d.index[len(d) // 2]
    cells = {}
    for nm, f in (("≤10(소형주 약세)", (re_ <= 0.1).fillna(False)), ("≥90(소형주 강세)", (re_ >= 0.9).fillna(False))):
        cells[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    fl = (re_ <= 0.1).fillna(False); fh = (re_ >= 0.9).fillna(False)
    ov = {"약세일": int(fl.sum()), "약세&위험선호≤10": int((fl & (rc <= 0.1)).sum()), "약세&SOX≤10": int((fl & (rd <= 0.1)).sum()), "약세&S&P≤10": int((fl & (rs <= 0.1)).sum()),
          "강세일": int(fh.sum()), "강세&S&P≥90": int((fh & (rs >= 0.9)).sum()), "강세&SOX≥90": int((fh & (rd >= 0.9)).sum())}
    el, eh, eb = one(re_, re_ <= 0.1, "el"), one(re_, re_ >= 0.9, "eh"), lab(re_, "eh", "el")
    r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(re_.iloc[-1]) else round(float(re_.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(d, eb, ycol, h)[1], "약세": wf(d, el, ycol, h)[0], "강세": wf(d, eh, ycol, h)[0], "양쪽": wf(d, eb, ycol, h)[0],
             "기존(위험선호·SOX·S&P)": wf(d, oth, ycol, h)[0], "기존+약세": wf(d, oth + "|" + el, ycol, h)[0],
             "기존+강세": wf(d, oth + "|" + eh, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + eb, ycol, h)[0]}
        r[ycol] = score(d, ycol, P)
    print(mk, json.dumps(r, ensure_ascii=False))
    out[mk] = r


def logit_fit(X, y, l2=1.0, it=200):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w
X_out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2000-01-01"].copy()
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rd = A(np.log(dx).diff(5)); rs = A(np.log(sp).diff(5)); rc = A(crd.diff(5)); re_ = A(sprd.diff(5))
    D = pd.DataFrame({"c": 1.0, "ch": rc >= .9, "cl": rc <= .1, "dh": rd >= .9, "dl": rd <= .1, "sh": rs >= .9, "sl": rs <= .1, "e": re_ <= .1, "eh": re_ >= .9}, index=d.index).astype(float)
    ok = rd.notna() & rs.notna() & rc.notna() & re_.notna() & (d.index >= "2002-01-01")
    R = {}
    for ycol in ("y1", "y5"):
        m = ok & d[ycol].notna(); idx = d.index[m]; mid = idx[len(idx) // 2]
        y = d.loc[m, ycol].values.astype(float); Xa = D[m].values
        a, b_ = idx < mid, idx >= mid
        r = {}
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            s = {}
            for k, cols in (("기존", list(range(7))), ("기존+약세", list(range(8))), ("기존+강세", list(range(7)) + [8]), ("기존+양쪽", list(range(9)))):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                if k != "기존": s[k + "계수"] = [round(float(v), 3) for v in w[7:]]
            r[nm] = s
        R[ycol] = r
    print("교차", mk, json.dumps(R, ensure_ascii=False)); X_out[mk] = R
json.dump({"tab": out, "cross": X_out}, open("probe/rut_bt.json", "w"), ensure_ascii=False, indent=1)
