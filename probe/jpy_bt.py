"""#30 엔/달러(JPY=X) 5일 급변 꼬리 → 일본(·한국) 다음 날·5일 — 확률 보강 일지 10/29 15시 (Actions)
5일 로그 변화의 1년 백분위 ≥90%(엔 급약세)·≤10%(엔 급강세) 한쪽씩 칸 · 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: 이미 붙인 💱 환율 5칸(같은 5일 변화, 고정 구간)·달러지수 5일 꼬리·S&P 5일 꼬리 칸 위에 더해도 좋아지는지.
JPY=X 는 prob_x 💱 와 같이 reindex(idx).ffill() (야후 FX 일봉은 GMT 하루 · 도쿄 다음 개장 전)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"JPY=X", "KRW=X", "DX-Y.NYB", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
jp, kw, dx, sp = cs("JPY=X"), cs("KRW=X"), cs("DX-Y.NYB"), cs("^GSPC")
print("JPY", jp.index[0].date(), jp.index[-1].date(), len(jp), float(jp.iloc[-1]))


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2006-01-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())


out = {}
for mk in ("JP", "KR"):
    cfg = prob.MK[mk]
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2001-01-01"].copy()
    A = lambda s: prob_x.align(prob_x.rank252(s), d.index)
    jf = jp.reindex(d.index).ffill()
    j5 = np.log(jf).diff(5)
    rj = prob_x.rank252(j5)
    rd = A(np.log(dx).diff(5)); rs = A(np.log(sp).diff(5))
    fxs = kw if mk == "KR" else jp
    f5 = fxs.reindex(d.index).ffill().pct_change(5)
    fxb = pd.cut(f5, [-9, -0.015, -0.004, 0.004, 0.015, 9], labels=["a", "b", "c", "e", "f"]).astype(object).where(f5.notna())
    j_hi = pd.Series(np.where(rj >= 0.9, "jh", "-"), index=d.index, dtype=object).where(rj.notna())
    j_lo = pd.Series(np.where(rj <= 0.1, "jl", "-"), index=d.index, dtype=object).where(rj.notna())
    j_b = lab(rj, "jh", "jl")
    oth = fxb + "|" + lab(rd, "dh", "dl") + "|" + lab(rs, "sh", "sl")
    mid = d.index[len(d) // 2]
    cells = {}
    for nm, f in (("≥90(엔약세)", (rj >= 0.9).fillna(False)), ("≤10(엔강세)", (rj <= 0.1).fillna(False))):
        cells[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    fh = (rj >= 0.9).fillna(False); fl = (rj <= 0.1).fillna(False)
    ov = {"엔약세일": int(fh.sum()), "엔약세&달러≥90": int((fh & (rd >= 0.9)).sum()), "엔약세&S&P≥90": int((fh & (rs >= 0.9)).sum()),
          "엔강세일": int(fl.sum()), "엔강세&S&P≤10": int((fl & (rs <= 0.1)).sum()), "엔강세&달러≤10": int((fl & (rd <= 0.1)).sum()),
          "엔강세&💱최강칸(a)": int((fl & (fxb == "a")).sum()) if mk == "JP" else None}
    R = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rj.iloc[-1]) else round(float(rj.iloc[-1]), 3), "cur_j5": round(float(j5.iloc[-1]) * 100, 2), "칸(n,y1차,y5차)": cells, "겹침": ov}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(d, j_b, ycol, h)[1], "엔약세": wf(d, j_hi, ycol, h)[0], "엔강세": wf(d, j_lo, ycol, h)[0], "엔양쪽": wf(d, j_b, ycol, h)[0],
             "기존(💱5칸·달러·S&P)": wf(d, oth, ycol, h)[0], "기존+엔약세": wf(d, oth + "|" + j_hi, ycol, h)[0],
             "기존+엔강세": wf(d, oth + "|" + j_lo, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + j_b, ycol, h)[0]}
        R[ycol] = score(d, ycol, P)
    print(mk, json.dumps(R, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/jpy_bt.json", "w"), ensure_ascii=False, indent=1)
