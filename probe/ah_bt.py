"""#60 항셍 AH 프리미엄 5·20일 변화·수준 1년 백분위 꼬리 → 홍콩·중국 다음 날·5일 — 확률 보강 일지 11/3 14시 (Actions)
자료: 야후 ^HSAHP 먼저 · 없거나 짧으면 대표 A/H 동시상장 10쌍으로 직접 계산(log(A ÷ (H×HKD/CNY)) 평균).
같은 날 값 → 다음 거래일(홍콩 16:10 마감 뒤 · 중국 다음 장 전 앎).
걸어가며 사전 100 브라이어 앞/뒤·최근5년 · 겹침: 자기 지수 5일 꼬리·S&P 5일 꼬리 칸 위 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

PAIRS = [("0939.HK", "601939.SS"), ("1398.HK", "601398.SS"), ("0857.HK", "601857.SS"), ("3988.HK", "601988.SS"),
         ("2318.HK", "601318.SS"), ("0386.HK", "600028.SS"), ("1288.HK", "601288.SS"), ("0998.HK", "601998.SS"),
         ("0914.HK", "600585.SS"), ("2628.HK", "601628.SS"), ("0168.HK", "600600.SS"), ("1088.HK", "601088.SS")]
syms = sorted({"000001.SS", "^HSI", "^GSPC", "^HSAHP", "HKDCNY=X"} | {a for p in PAIRS for a in p})
H = prob.load_hist(syms)
def cs(s):
    if s not in H: return pd.Series(dtype=float)
    x = H[s]["Close"].dropna(); return x[x > 0]
src = {}
ah_y = cs("^HSAHP")
src["^HSAHP"] = None if ah_y.empty else [str(ah_y.index[0].date()), str(ah_y.index[-1].date()), len(ah_y), round(float(ah_y.iloc[-1]), 2)]
fx = cs("HKDCNY=X")
src["HKDCNY=X"] = None if fx.empty else [str(fx.index[0].date()), len(fx)]
lp = []
for h, a in PAIRS:
    hh, aa = cs(h), cs(a)
    if hh.empty or aa.empty or fx.empty: src[h] = 0; continue
    idx = hh.index.intersection(aa.index)
    f = fx.reindex(idx.union(fx.index)).ffill().reindex(idx)
    r = np.log(aa.reindex(idx) / (hh.reindex(idx) * f)).dropna()
    r = r[(r.diff().abs() < 0.25) | r.diff().isna()]  # 분할 등 튐 제거
    src[h] = len(r); lp.append(r.rename(h))
P = pd.concat(lp, axis=1) if lp else pd.DataFrame()
own = None
if not P.empty:
    cnt = P.notna().sum(axis=1); own = P.where(cnt >= 6).mean(axis=1).dropna()  # 6쌍 이상 있는 날만 (로그 프리미엄)
    src["직접계산"] = [str(own.index[0].date()), str(own.index[-1].date()), len(own), round(float(np.exp(own.iloc[-1]) * 100), 1)]
if len(ah_y) > 2000 and own is not None:
    j = pd.concat([np.log(ah_y), own], axis=1).dropna(); src["상관(변화20일)"] = round(float(j.diff(20).corr().iloc[0, 1]), 3)
print("자료", json.dumps(src, ensure_ascii=False))
SER = {}
if len(ah_y) > 2000: SER["HSAHP"] = np.log(ah_y)
if own is not None and len(own) > 2000: SER["직접"] = own
sp = cs("^GSPC")


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2005-01-01"):
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


out = {"자료": src}
for mk in ("HK", "CN"):
    cfg = prob.MK[mk]
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2003-01-01"].copy()
    A = lambda s: prob_x.align(prob_x.rank252(s), d.index)
    ro = A(np.log(cs(cfg["ix"])).diff(5)); rs = A(np.log(sp).diff(5))
    oth = lab(ro, "oh", "ol") + "|" + lab(rs, "sh", "sl")
    R = {}
    for sn, base_s in SER.items():
        for fn, ser in (("수준", base_s), ("5일변화", base_s.diff(5)), ("20일변화", base_s.diff(20))):
            rg = A(ser); ok0 = rg.notna(); dd = d.index[ok0]; mid = dd[len(dd) // 2]; cells = {}
            for nm, f in (("≥90(A 비쌈↑)", (rg >= 0.9).fillna(False)), ("≤10(H 비쌈↑)", (rg <= 0.1).fillna(False))):
                cells[nm] = {}
                for half, msk in (("앞", ok0 & (d.index < mid)), ("뒤", ok0 & (d.index >= mid))):
                    c_ = prob.cond(d[msk], f[msk], nm)
                    cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
            gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
            r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells,
                 "겹침": {"높음&자기≥90": int(((rg >= .9) & (ro >= .9)).sum()), "낮음&자기≤10": int(((rg <= .1) & (ro <= .1)).sum()), "높음일": int((rg >= .9).sum()), "낮음일": int((rg <= .1).sum())}}
            for ycol, h in (("y1", 1), ("y5", 5)):
                Pp = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                      "기존(자기·S&P)": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0],
                      "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0]}
                r[ycol] = score(d, ycol, Pp)
            D = pd.DataFrame({"c": 1.0, "oh": ro >= .9, "ol": ro <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
            ok = ro.notna() & rs.notna() & rg.notna() & (d.index >= "2005-01-01")
            X = {}
            for ycol in ("y1", "y5"):
                m = ok & d[ycol].notna(); idx = d.index[m]; md = idx[len(idx) // 2]
                y = d.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b = idx < md, idx >= md
                xr = {}
                for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
                    s = {}
                    for k, cols in (("기존", [0, 1, 2, 3, 4]), ("+높음", [0, 1, 2, 3, 4, 5]), ("+낮음", [0, 1, 2, 3, 4, 6])):
                        w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                        s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                        if k != "기존": s[k + "계수"] = round(float(w[-1]), 3)
                    xr[nm] = s
                X[ycol] = xr
            r["교차"] = X
            R[sn + "·" + fn] = r
            print(mk, sn, fn, json.dumps(r, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/ah_bt.json", "w"), ensure_ascii=False, indent=1)
