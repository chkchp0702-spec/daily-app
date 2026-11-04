"""#64 일본 재무성 주간 「외국인의 일본 주식 순매수」(対内証券投資 株式・投資ファンド持分 ネット) 꼬리 → 5개 시장 — 11/4 10시 (Actions)
자료: https://www.mof.go.jp/policy/international_policy/reference/itn_transactions_in_securities/week.csv (2005-01~, 억엔)
주(일~토) 끝 + 4일(목요일 08:50 JST 발표) 부터 사용. 1주 순매수·4주 합의 52주 백분위 ≥90·≤10 칸.
걸어가며 사전 100 브라이어 앞/뒤·최근5년 · 기존(자기 5일·S&P 5일 꼬리) 칸 위 + 교차 로지스틱 · 발표일(목)만 칸."""
import json, sys, os, re, unicodedata, io
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

import csv
rows = []
for raw in csv.reader(open("probe/mof_week.csv", newline="")):
    c = [unicodedata.normalize("NFKC", x).replace(",", "").strip() for x in raw]
    if len(c) < 15: continue
    m = re.match(r"(\d{4})\.(\d{1,2})\.(\d{1,2})\s*~\s*(?:(\d{4})\.)?(\d{1,2})\.(\d{1,2})", c[0].replace(" ", ""))
    if not m: continue
    y, mo, dd = int(m[1]), int(m[2]), int(m[3]); ey = int(m[4]) if m[4] else (y + 1 if int(m[5]) < mo else y)
    try: v = float(c[14].replace("−", "-").replace("▲", "-"))
    except ValueError: continue
    rows.append((pd.Timestamp(ey, int(m[5]), int(m[6])), v))
W = pd.Series({a: b for a, b in rows}).sort_index()
print("MOF weeks", len(W), W.index[0].date(), W.index[-1].date(), "last", W.iloc[-4:].round(0).to_dict())
av = W.copy(); av.index = av.index + pd.Timedelta(days=4)
r1 = av.rolling(52, min_periods=40).rank(pct=True); r4 = av.rolling(4).sum().rolling(52, min_periods=40).rank(pct=True)
print("CUR rank 1주", round(float(r1.iloc[-1]), 3), "4주", round(float(r4.iloc[-1]), 3))

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC"})
H = prob.load_hist(syms)
sp = H["^GSPC"]["Close"].dropna()


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2006-01-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]; r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())
def one(r, c_, nm):
    return pd.Series(np.where(c_, nm, "-"), index=r.index, dtype=object).where(r.notna())


def logit_fit(X, y, l2=1.0, it=100):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w


def stale_align(s, idx, maxd=10):
    a = prob_x.align(s, idx); src = prob_x.align(pd.Series(s.index, index=s.index), idx)
    gap = (pd.Series(idx, index=idx) - pd.to_datetime(src)).dt.days
    return a.where(gap <= maxd)


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2005-06-01"].copy()
    own = prob_x.rank252(np.log(H[cfg["ix"]]["Close"].dropna()).diff(5)).reindex(d.index)
    rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index) if mk != "US" else prob_x.rank252(np.log(sp).diff(5)).reindex(d.index)
    oth = lab(own, "oh", "ol") + "|" + lab(rs, "sh", "sl")
    thu = pd.Series(d.index.day_of_week == 3, index=d.index)
    R = {}
    for fn, rr in (("1주", r1), ("4주합", r4)):
        rg = stale_align(rr, d.index); mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90(외국인 많이 삼)", (rg >= 0.9).fillna(False)), ("≤10(많이 팖)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
                c2 = prob.cond(d[msk], (f & thu)[msk], nm)
                cells[nm][half + "_목만"] = None if not c2 else [c2["n"], round((c2["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c2["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"많이삼일": int(fh.sum()), "&자기≥90": int((fh & (own >= .9)).sum()), "많이팖일": int(fl.sum()), "&자기≤10": int((fl & (own <= .1)).sum()), "&S&P≤10": int((fl & (rs <= .1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0], "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0]}
            r[ycol] = score(d, ycol, P)
        D = pd.DataFrame({"c": 1.0, "oh": own >= .9, "ol": own <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = own.notna() & rs.notna() & rg.notna() & (d.index >= "2006-01-01")
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
        r["교차"] = X; R[fn] = r
        print(mk, fn, json.dumps(r, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/mof_bt.json", "w"), ensure_ascii=False, indent=1)
