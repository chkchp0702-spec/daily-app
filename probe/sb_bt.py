"""#63 남향 자금(港股通 순매수) 5·20일 합 1년 백분위 꼬리 → 홍콩·중국 — 확률 보강 11/3 17시 (Actions)
자료 probe/sb.csv (sb_find.py). 같은 날 홍콩 마감 뒤 확정 → 그날 행에 그대로(다음 날 예측).
기존 칸 = 자기 지수 5일 꼬리 · S&P 5일 꼬리.
SKEW = 옵션 시장이 매기는 「꼬리 급락」 값. 수준·5일 변화 1년 백분위 ≥90%·≤10% 한쪽씩 칸.
미국 날짜 값 → 다음 아시아 장(prob_x.align). 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: VIX 수준 꼬리·S&P 5일 꼬리 칸 위에 더해도 좋아지는지 + 교차 로지스틱."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
sp = cs("^GSPC")
sb = pd.read_csv("probe/sb.csv", index_col=0, parse_dates=True)["net"].astype(float).sort_index()
sb = sb[~sb.index.duplicated()]
print("SB", sb.index[0].date(), sb.index[-1].date(), len(sb), sb.tail(3).round(1).to_dict())


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2015-06-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근3년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1096)))):
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
for mk in ("HK", "CN"):
    cfg = prob.MK[mk]
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= sb.index[0] + pd.Timedelta(days=200)].copy()
    rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
    rv = prob_x.rank252(d["r5"])  # 자기 5일 (vh/vl 이름 그대로)
    oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
    R = {}
    for fn, ser in (("5일합", sb.rolling(5).sum()), ("20일합", sb.rolling(20).sum()), ("1일", sb)):
        rg = prob_x.rank252(ser).reindex(d.index).ffill(limit=3); mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90(남향 큰 순매수)", (rg >= 0.9).fillna(False)), ("≤10(남향 순매수 적음)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"높음일": int(fh.sum()), "높음&자기5일≥90": int((fh & (rv >= 0.9)).sum()), "높음&자기5일≤10": int((fh & (rv <= 0.1)).sum()),
              "낮음일": int(fl.sum()), "낮음&자기5일≥90": int((fl & (rv >= 0.9)).sum()), "낮음&S&P≤10": int((fl & (rs <= 0.1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존(달러·S&P)": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0],
                 "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + gb, ycol, h)[0]}
            r[ycol] = score(d, ycol, P)
        # 교차 로지스틱
        D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = rv.notna() & rs.notna() & rg.notna() & (d.index >= "2015-06-01")
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
        R[fn] = r
        print(mk, fn, json.dumps(r, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/sb_bt.json", "w"), ensure_ascii=False, indent=1)
