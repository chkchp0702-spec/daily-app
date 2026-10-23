import numpy as np, pandas as pd
def wf(d, lab, ycol, prior=150, start="2005-01-01"):
    y = d[ycol]; h = 1 if ycol == "y1" else 5
    ok = y.notna(); known = y.where(ok).shift(h); base = known.expanding().mean(); p = base.copy()
    labs = [l for l in lab.dropna().unique()]
    for L in labs:
        t = (lab == L); ts = t.shift(h, fill_value=False).astype(bool)
        k = known.where(ts).fillna(0).cumsum(); n = (known.notna() & ts).astype(float).cumsum()
        p = p.where(~t, (k + prior * base) / (n + prior))
    ev = ok & (d.index >= start) & base.notna() & lab.notna(); ix = d.index[ev]
    if len(ix) < 300: return None
    mid = ix[len(ix) // 2]; res = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근2년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=730)))):
        cells = {}
        for L in labs:
            mt = msk & (lab == L)
            if mt.sum(): cells[str(L)] = [int(mt.sum()), round(float(y[mt].mean() - y[msk].mean()) * 100, 1)]
        res[nm] = {"브라이어": [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5)],
                   "평소": round(float(y[msk].mean()) * 100, 1), "칸(n,차이%p)": cells}
    return res
