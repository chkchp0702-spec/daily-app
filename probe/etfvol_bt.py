"""#80·#80b 국가 ETF 거래량 급증(EWY·EWJ·EWH) → 현지 다음 날·5일 — 확률 보강 11/6 11시 (Actions)
특성 = ETF 거래대금(종가×거래량) 5일÷60일 평균 의 1년 백분위.
칸: 「급증·ETF 5일 오름」(≥90 & r5>0) · 「급증·ETF 5일 내림(투매)」(≥90 & r5≤0) · 「가뭄」(≤10).
기존 칸 = ETF 자기 5일 등락 꼬리 · S&P 5일 꼬리 · 달러지수 5일 꼬리 (가격 움직임과 겹침 확인).
미국 날짜 값 → 다음 아시아 장(prob_x.align). 걸어가며 사전 100 브라이어 앞/뒤·최근5년 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x
import yfinance as yf

ETF = {"KR": "EWY", "JP": "EWJ", "HK": "EWH"}
syms = sorted({prob.MK[m]["ix"] for m in ETF} | {"DX-Y.NYB", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
dx, sp = cs("DX-Y.NYB"), cs("^GSPC")


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())
def one(m, nm, ref):
    return pd.Series(np.where(m, nm, "-"), index=ref.index, dtype=object).where(ref.notna())


def logit_fit(X, y, l2=1.0, it=100):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w


out = {}
for mk, tk in ETF.items():
    V = yf.download(tk, start="1997-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(V.columns, pd.MultiIndex): V.columns = V.columns.get_level_values(0)
    V.index = pd.to_datetime(V.index).tz_localize(None)
    dv = (V["Close"] * V["Volume"]).replace(0, np.nan).dropna()
    vr = dv.rolling(5).mean() / dv.rolling(60).mean()
    er5 = np.log(V["Close"]).diff(5)
    rk = prob_x.rank252(vr)
    print("ETF", tk, dv.index[0].date(), dv.index[-1].date(), len(dv), "now ratio", round(float(vr.iloc[-1]), 2), "rank", round(float(rk.iloc[-1]), 3), "r5", round(float(er5.iloc[-1]) * 100, 2))
    d = prob.feats(H[prob.MK[mk]["ix"]]); d = d[d.index >= "2001-01-01"].copy()
    A = lambda s: prob_x.align(s, d.index)
    rg = A(rk); up = A((er5 > 0).astype(float).where(er5.notna()))
    re = A(prob_x.rank252(er5)); rs = A(prob_x.rank252(np.log(sp).diff(5))); rv = A(prob_x.rank252(np.log(dx).diff(5)))
    ok0 = rg.notna() & re.notna() & rs.notna() & rv.notna()
    d = d[ok0]; rg, up, re, rs, rv = [x[ok0] for x in (rg, up, re, rs, rv)]
    fU = (rg >= 0.9) & (up > 0.5); fD = (rg >= 0.9) & (up <= 0.5); fL = rg <= 0.1
    mid = d.index[len(d) // 2]; cells = {}
    for nm, f in (("급증·오름", fU), ("급증·투매", fD), ("가뭄", fL)):
        cells[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    ov = {"투매일": int(fD.sum()), "투매&ETF5일≤10": int((fD & (re <= 0.1)).sum()), "투매&S&P≤10": int((fD & (rs <= 0.1)).sum()),
          "오름일": int(fU.sum()), "오름&ETF5일≥90": int((fU & (re >= 0.9)).sum()), "가뭄일": int(fL.sum())}
    oth = lab(re, "eh", "el") + "|" + lab(rs, "sh", "sl") + "|" + lab(rv, "vh", "vl")
    gU, gD, gL = one(fU, "gu", rg), one(fD, "gd", rg), one(fL, "gl", rg)
    gA = pd.Series(np.where(fU, "gu", np.where(fD, "gd", np.where(fL, "gl", "-"))), index=rg.index, dtype=object)
    r = {"mid": str(mid.date()), "n": len(d), "cur": [None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), float(up.iloc[-1])], "칸(n,y1차,y5차)": cells, "겹침": ov}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(d, gA, ycol, h)[1], "기존(ETF·S&P·달러5일)": wf(d, oth, ycol, h)[0],
             "기존+오름": wf(d, oth + "|" + gU, ycol, h)[0], "기존+투매": wf(d, oth + "|" + gD, ycol, h)[0],
             "기존+가뭄": wf(d, oth + "|" + gL, ycol, h)[0], "기존+셋": wf(d, oth + "|" + gA, ycol, h)[0]}
        r[ycol] = score(d, ycol, P, "2004-01-01")
    D = pd.DataFrame({"c": 1.0, "eh": re >= .9, "el": re <= .1, "sh": rs >= .9, "sl": rs <= .1, "vh": rv >= .9, "vl": rv <= .1, "gu": fU, "gd": fD, "gl": fL}, index=d.index).astype(float)
    X = {}
    for ycol in ("y1", "y5"):
        m = d[ycol].notna() & (d.index >= "2004-01-01"); idx = d.index[m]; md = idx[len(idx) // 2]
        y = d.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b = idx < md, idx >= md
        xr = {}
        for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
            s = {}
            for k, cols in (("기존", list(range(7))), ("+오름", list(range(7)) + [7]), ("+투매", list(range(7)) + [8]), ("+가뭄", list(range(7)) + [9])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                if k != "기존": s[k + "계수"] = round(float(w[-1]), 3)
            xr[nm] = s
        X[ycol] = xr
    r["교차"] = X
    # 덧셈형(#80b): 기존 걸어가기 로짓 + 「급증·오름」 칸 몫 · 첫날만(사건 솎기) 칸도
    lo = lambda p: np.log(p / (1 - p))
    fE = fU & ~fU.shift(1, fill_value=False)
    r["첫날칸"] = {}
    for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
        c_ = prob.cond(d[msk], fE[msk], "첫날")
        r["첫날칸"][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    for ycol, h in (("y1", 1), ("y5", 5)):
        pb = wf(d, oth, ycol, h)[0]; y = d[ycol]; known = y.shift(h); bse = known.expanding().mean()
        for tg, ff in (("오름", fU), ("투매", fD)):
            fk = ff.shift(h, fill_value=False)
            k = known.where(fk).fillna(0).cumsum(); n_ = (known.notna() & fk).astype(float).cumsum()
            pl = (k + 100 * bse) / (n_ + 100)
            P = {"기존": pb}
            for w in (0.3, 0.5, 1.0):
                pa = pb.copy(); m_ = ff & pb.notna() & pl.notna()
                pa[m_] = 1 / (1 + np.exp(-(lo(pb[m_]) + w * (lo(pl[m_]) - lo(bse[m_])))))
                P[f"+{tg} w{w}"] = pa
            r.setdefault("덧셈형", {})[f"{ycol} {tg}"] = score(d, ycol, P, "2004-01-01")
    print(mk, tk, json.dumps(r, ensure_ascii=False))
    out[mk] = r
json.dump(out, open("probe/etfvol_bt.json", "w"), ensure_ascii=False, indent=1)
