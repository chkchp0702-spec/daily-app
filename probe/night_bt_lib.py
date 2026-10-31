"""night_bt.py 의 함수만 (odd_bt 용)"""
import numpy as np, pandas as pd

def night(px):
    o, c = px["Open"].astype(float), px["Close"].astype(float)
    pc = c.shift(1); n = np.log(o / pc)
    bad = (o <= 0) | o.isna() | ((o - pc).abs() < 1e-9 * pc) | ((o - c).abs() < 1e-9 * c)
    yr = bad.groupby(px.index.year).mean()
    okyr = yr[yr <= 0.2].index
    n = n.where(~bad & px.index.year.isin(okyr) & (n.abs() < 0.15))
    return n, {int(k): round(float(v), 2) for k, v in yr.items()}



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
