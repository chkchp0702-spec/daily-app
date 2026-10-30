"""#43 한국 「미 소형주 강세」 다음 날 다시 — 확률 보강 일지 10/30 17시 (Actions)
#39 ➖ 이어서: (1) S&P 5일 강세(≥90%) 겹친 날 뺀 「순수 소형주 강세」 칸 앞/뒤
(2) 5일 간격 표본(겹치지 않게)으로 칸 앞/뒤 다시 (3) 기존 칸(위험선호·SOX·S&P) 위 걸어가며 브라이어 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
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


def logit_fit(X, y, l2=1.0, it=200):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w

out = {}
for mk in ("KR", "JP"):
    cfg = prob.MK.get(mk)
    if not cfg: continue
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2000-01-01"].copy()
    A = lambda s: prob_x.align(prob_x.rank252(s), d.index)
    rd = A(np.log(dx).diff(5)); rs = A(np.log(sp).diff(5)); rc = A(crd.diff(5)); re_ = A(sprd.diff(5))
    oth = lab(rc, "ch", "cl") + "|" + lab(rd, "dh", "dl") + "|" + lab(rs, "sh", "sl")
    mid = d.index[len(d) // 2]
    fh = (re_ >= 0.9).fillna(False); pure = fh & ~(rs >= 0.9).fillna(False)
    step = pd.Series(np.arange(len(d)) % 5 == 0, index=d.index)
    cells = {}
    for nm, f in (("강세 전체", fh), ("순수 강세(S&P≥90 뺌)", pure), ("강세 5일 간격", fh & step), ("순수 강세 5일 간격", pure & step)):
        cells[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            sub = d[msk]; ff = f[msk]; yy = sub.loc[ff, "y1"].dropna()
            cells[nm][half] = [int(len(yy)), round((yy.mean() - sub["y1"].mean()) * 100, 1) if len(yy) else None]
    pl = one(re_, pure, "ep")
    r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(re_.iloc[-1]) else round(float(re_.iloc[-1]), 3),
         "cur_sp": None if pd.isna(rs.iloc[-1]) else round(float(rs.iloc[-1]), 3), "칸(n,y1차%p)": cells}
    P = {"평소": wf(d, pl, "y1", 1)[1], "기존": wf(d, oth, "y1", 1)[0], "기존+순수강세": wf(d, oth + "|" + pl, "y1", 1)[0]}
    r["y1"] = score(d, "y1", P)
    D = pd.DataFrame({"c": 1.0, "ch": rc >= .9, "cl": rc <= .1, "dh": rd >= .9, "dl": rd <= .1, "sh": rs >= .9, "sl": rs <= .1, "ep": pure}, index=d.index).astype(float)
    ok = rd.notna() & rs.notna() & rc.notna() & re_.notna() & (d.index >= "2002-01-01") & d["y1"].notna()
    idx = d.index[ok]; m2 = idx[len(idx) // 2]; y = d.loc[ok, "y1"].values.astype(float); Xa = D[ok].values
    a, b_ = idx < m2, idx >= m2; R = {}
    for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
        s = {}
        for k, cols in (("기존", list(range(7))), ("기존+순수강세", list(range(8)))):
            w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
            s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
            if len(cols) == 8: s["계수"] = round(float(w[7]), 3)
        R[nm] = s
    r["교차"] = R
    print(mk, json.dumps(r, ensure_ascii=False)); out[mk] = r
json.dump(out, open("probe/rut2_bt.json", "w"), ensure_ascii=False, indent=1)
