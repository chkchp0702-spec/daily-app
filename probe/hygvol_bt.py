"""#68 하이일드(HYG) 거래량 급증 꼬리 → 5개 시장 — 확률 보강 11/4 16시 (Actions)
특성 = HYG 거래대금(종가×거래량) 5일 평균 ÷ 60일 평균 의 1년 백분위. 「높음」 = ≥90(급증) · 「낮음」 = 급증이면서 HYG 5일 하락(투매).
기존 칸 = 💳 크레딧(HYG/LQD 20일 변화) 꼬리 · S&P 5일 꼬리 · 달러지수 5일 꼬리.
미국 날짜 값 → 다음 아시아 장(prob_x.align). 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: VIX 수준 꼬리·S&P 5일 꼬리 칸 위에 더해도 좋아지는지 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"HYG", "LQD", "DX-Y.NYB", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
vx, sp, hy, lq = cs("DX-Y.NYB"), cs("^GSPC"), cs("HYG"), cs("LQD")
import yfinance as yf
V = yf.download("HYG", start="2007-01-01", interval="1d", auto_adjust=False, progress=False)
if isinstance(V.columns, pd.MultiIndex): V.columns = V.columns.get_level_values(0)
V.index = pd.to_datetime(V.index).tz_localize(None)
dv = (V["Close"] * V["Volume"]).replace(0, np.nan).dropna()
vr = dv.rolling(5).mean() / dv.rolling(60).mean()
hyr5 = np.log(V["Close"]).diff(5)
cr = np.log(hy / lq.reindex(hy.index).ffill()).diff(20)
print("HYGVOL", dv.index[0].date(), dv.index[-1].date(), len(dv), round(float(vr.iloc[-1]), 2), "rank", round(float(prob_x.rank252(vr).iloc[-1]), 3))


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


def logit_fit(X, y, l2=1.0, it=100):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "1995-01-01"].copy()
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rv = A(np.log(vx).diff(5)); rs = A(np.log(sp).diff(5)); rj = A(cr)
    oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl") + "|" + lab(rj, "jh", "jl")
    R = {}
    for fn in ("거래대금5/60",):
        rg0 = A(vr); hd = (hyr5 < 0).astype(float).where(hyr5.notna())
        hdA = (hd.reindex(d.index).ffill() if mk == "US" else prob_x.align(hd, d.index))
        # 「낮음」 칸 = 급증 & HYG 5일 하락 → 0.0 로, 나머지 0.5 로 표시(≤0.1 판정용)
        rg = rg0.copy(); rg = rg.where(~((rg0 >= 0.9) & (hdA > 0.5)), -1.0).where(~((rg0 >= 0.9) & (hdA <= 0.5)), 0.95)
        rg = rg.where((rg < 0) | (rg >= 0.95), 0.5).where(rg0.notna())
        d = d[d.index >= "2008-01-01"]; rg = rg.reindex(d.index); rv, rs, rj = rv.reindex(d.index), rs.reindex(d.index), rj.reindex(d.index)
        oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl") + "|" + lab(rj, "jh", "jl")
        mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90 급증·HYG 오름", (rg >= 0.9).fillna(False)), ("급증·HYG 5일 하락(투매)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"높음일": int(fh.sum()), "높음&달러≥90": int((fh & (rv >= 0.9)).sum()), "높음&달러≤10": int((fh & (rv <= 0.1)).sum()),
              "낮음일": int(fl.sum()), "낮음&달러≥90": int((fl & (rv >= 0.9)).sum()), "낮음&S&P≤10": int((fl & (rs <= 0.1)).sum()), "낮음&크레딧≤10": int((fl & (rj <= 0.1)).sum()), "높음&크레딧≤10": int((fh & (rj <= 0.1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존(달러·S&P·크레딧)": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0],
                 "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + gb, ycol, h)[0]}
            r[ycol] = score(d, ycol, P, "2009-01-01")
        # 교차 로지스틱
        D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "jh": rj >= .9, "jl": rj <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = rv.notna() & rs.notna() & rj.notna() & rg.notna() & (d.index >= "2009-01-01")
        X = {}
        for ycol in ("y1", "y5"):
            m = ok & d[ycol].notna(); idx = d.index[m]; md = idx[len(idx) // 2]
            y = d.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b = idx < md, idx >= md
            xr = {}
            for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
                s = {}
                for k, cols in (("기존", [0, 1, 2, 3, 4, 5, 6]), ("+높음", [0, 1, 2, 3, 4, 5, 6, 7]), ("+낮음", [0, 1, 2, 3, 4, 5, 6, 8])):
                    w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                    s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                    if k != "기존": s[k + "계수"] = round(float(w[-1]), 3)
                xr[nm] = s
            X[ycol] = xr
        r["교차"] = X
        R[fn] = r
        print(mk, fn, json.dumps(r, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/hygvol_bt.json", "w"), ensure_ascii=False, indent=1)
