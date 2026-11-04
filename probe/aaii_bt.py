"""#65 AAII 개인투자자 심리(강세−약세 %, 주간 목요일 발표) 꼬리 → 5개 시장 — 11/4 12시 (Actions)
역발상 근거: Fisher & Statman 2000 「Investor Sentiment and Stock Returns」 https://www.jstor.org/stable/4480240
자료 주소 여러 곳 시험 → 받은 주(목) + 1일부터 사용. 강세−약세 1주·4주 평균 52주 백분위 ≥90·≤10 칸.
걸어가며 사전 100 브라이어 앞/뒤·최근5년 · 기존(자기 5일·S&P 5일 꼬리) 칸 위 + 교차 로지스틱."""
import json, sys, os, io
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd())
import prob, prob_x
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept": "*/*", "Referer": "https://www.aaii.com/sentimentsurvey"}
W = None
for u in ["https://www.aaii.com/files/surveys/sentiment.xls", "http://www.aaii.com/files/surveys/sentiment.xls",
          "https://aaii.com/files/surveys/sentiment.xls"]:
    try:
        r = requests.get(u, headers=UA, timeout=30); print("TRY", u, r.status_code, len(r.content), r.content[:8])
        if r.status_code != 200 or len(r.content) < 20000: continue
        x = pd.read_excel(io.BytesIO(r.content), header=None)
        rows = []
        for _, rr in x.iterrows():
            dt = pd.to_datetime(rr[0], errors="coerce")
            try: b, e = float(rr[1]), float(rr[3])
            except (TypeError, ValueError): continue
            if pd.isna(dt) or pd.isna(b) or pd.isna(e) or not (0 <= b <= 1.0 and 0 <= e <= 1.0): continue
            rows.append((dt, b - e))
        if len(rows) > 500:
            W = pd.Series(dict(rows)).sort_index(); W = W[~W.index.duplicated()]; print("AAII OK", u, len(W)); break
    except Exception as ex:
        print("TRY", u, "ERR", repr(ex)[:150])
if W is None:
    print("AAII none"); sys.exit(0)
print("AAII weeks", len(W), W.index[0].date(), W.index[-1].date(), "last", W.iloc[-4:].round(3).to_dict())
av = W.copy(); av.index = av.index + pd.Timedelta(days=1)
r1 = av.rolling(52, min_periods=40).rank(pct=True); r4 = av.rolling(4).mean().rolling(52, min_periods=40).rank(pct=True)
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


def score(d, ycol, ps, start="2000-01-01"):
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
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "1999-06-01"].copy()
    own = prob_x.rank252(np.log(H[cfg["ix"]]["Close"].dropna()).diff(5)).reindex(d.index)
    rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index) if mk != "US" else prob_x.rank252(np.log(sp).diff(5)).reindex(d.index)
    oth = lab(own, "oh", "ol") + "|" + lab(rs, "sh", "sl")
    thu = pd.Series(d.index.day_of_week == 4, index=d.index)
    R = {}
    for fn, rr in (("1주", r1), ("4주평균", r4)):
        rg = stale_align(rr, d.index); mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90(낙관 꼬리)", (rg >= 0.9).fillna(False)), ("≤10(비관 꼬리)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
                c2 = prob.cond(d[msk], (f & thu)[msk], nm)
                cells[nm][half + "_목만"] = None if not c2 else [c2["n"], round((c2["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c2["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"낙관일": int(fh.sum()), "&자기≥90": int((fh & (own >= .9)).sum()), "비관일": int(fl.sum()), "&자기≤10": int((fl & (own <= .1)).sum()), "&S&P≤10": int((fl & (rs <= .1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0], "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0]}
            r[ycol] = score(d, ycol, P)
        D = pd.DataFrame({"c": 1.0, "oh": own >= .9, "ol": own <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = own.notna() & rs.notna() & rg.notna() & (d.index >= "2000-01-01")
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
json.dump(out, open("probe/aaii_bt.json", "w"), ensure_ascii=False, indent=1)
