"""#40 「밤 수익률」(시가÷전날 종가) 5일 누적 꼬리 → 다음 날·5일 — 확률 보강 일지 10/30 16시 (Actions)
밤 수익률 = 투자 심리(https://scholarworks.bwise.kr/cau/handle/2019.sw.cau/33122). 자기 지수 Open·Close.
시가 자료가 망가진 해(시가=전날 종가 비율 >20%)는 뺀다. 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: 자기 5일 등락·S&P 5일 꼬리 칸 위 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC"})
H = prob.load_hist(syms)
sp = H["^GSPC"]["Close"].dropna(); sp = sp[sp > 0]
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


out = {}; X_out = {}
def logit_fit(X, y, l2=1.0, it=200):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w
for mk, cfg in prob.MK.items():
    px = H[cfg["ix"]]; ng, badyr = night(px)
    d = prob.feats(px); d = d[d.index >= "2000-01-01"].copy()
    ng = ng.reindex(d.index)
    n5 = ng.rolling(5, min_periods=5).sum()
    ok0 = n5.notna()
    rn = prob_x.rank252(n5.dropna()).reindex(d.index)
    rn1 = prob_x.rank252(ng.dropna()).reindex(d.index)
    rr = prob_x.rank252(np.log(d["c"]).diff(5).dropna()).reindex(d.index)
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rs = A(np.log(sp).diff(5))
    v = rn.notna()
    print(mk, "시가 쓸 수 있는 날", int(v.sum()), "첫날", None if not v.any() else str(d.index[v][0].date()), "망가진 해", {k: x for k, x in badyr.items() if x > 0.2})
    if v.sum() < 800: out[mk] = {"skip": int(v.sum()), "badyr": badyr}; continue
    dd = d[v].copy(); rn, rn1, rr, rs = rn[v], rn1[v], rr[v], rs[v]
    oth = lab(rr, "rh", "rl") + "|" + lab(rs, "sh", "sl")
    mid = dd.index[len(dd) // 2]
    cells = {}
    for nm, f in (("5일≤10(밤 약함)", rn <= 0.1), ("5일≥90(밤 강함)", rn >= 0.9), ("1일≤10", rn1 <= 0.1), ("1일≥90", rn1 >= 0.9)):
        f = f.fillna(False); cells[nm] = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid)):
            c_ = prob.cond(dd[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - dd.loc[msk, "y5"].mean()) * 100, 1)]
    fl, fh = (rn <= .1).fillna(False), (rn >= .9).fillna(False)
    ov = {"약함일": int(fl.sum()), "약함&자기5일≤10": int((fl & (rr <= .1)).sum()), "약함&S&P≤10": int((fl & (rs <= .1)).sum()),
          "강함일": int(fh.sum()), "강함&자기5일≥90": int((fh & (rr >= .9)).sum()), "corr(n5순위,r5순위)": round(float(rn.corr(rr)), 2)}
    el, eh, eb = one(rn, rn <= 0.1, "el"), one(rn, rn >= 0.9, "eh"), lab(rn, "eh", "el")
    r = {"mid": str(mid.date()), "n": len(dd), "cur_rank5": round(float(rn.iloc[-1]), 3), "cur_rank1": None if pd.isna(rn1.iloc[-1]) else round(float(rn1.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
    st = str(dd.index[min(400, len(dd) - 1)].date())
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(dd, eb, ycol, h)[1], "약함": wf(dd, el, ycol, h)[0], "강함": wf(dd, eh, ycol, h)[0], "양쪽": wf(dd, eb, ycol, h)[0],
             "기존(자기5일·S&P)": wf(dd, oth, ycol, h)[0], "기존+약함": wf(dd, oth + "|" + el, ycol, h)[0],
             "기존+강함": wf(dd, oth + "|" + eh, ycol, h)[0], "기존+양쪽": wf(dd, oth + "|" + eb, ycol, h)[0]}
        r[ycol] = score(dd, ycol, P, start=st)
    D = pd.DataFrame({"c": 1.0, "rh": rr >= .9, "rl": rr <= .1, "sh": rs >= .9, "sl": rs <= .1, "e": rn <= .1, "eh": rn >= .9}, index=dd.index).astype(float)
    okm = rr.notna() & rs.notna()
    R = {}
    for ycol in ("y1", "y5"):
        m = okm & dd[ycol].notna(); idx = dd.index[m]; mi = idx[len(idx) // 2]
        y = dd.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi
        rx = {}
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            s_ = {}
            for k, cols in (("기존", [0,1,2,3,4]), ("기존+약함", [0,1,2,3,4,5]), ("기존+강함", [0,1,2,3,4,6]), ("기존+양쪽", [0,1,2,3,4,5,6])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s_[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                if k != "기존": s_[k + "계수"] = [round(float(x), 3) for x in w[5:]]
            rx[nm] = s_
        R[ycol] = rx
    r["교차"] = R
    print(mk, json.dumps(r, ensure_ascii=False))
    out[mk] = r
json.dump(out, open("probe/night_bt.json", "w"), ensure_ascii=False, indent=1)
