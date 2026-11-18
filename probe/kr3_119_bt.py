"""#119 한국 국고채 3년 금리 5·20일 급변 꼬리 → 5개 시장 — 확률 보강 11/18 10시 (Actions)
자료 길: CNBC KR3Y 계열 이름 여러 개 → 네이버 PC 금리 일별(IRR_GOVT03Y) 쪽 넘김 → 네이버 모바일 API.
#75(10년) 과 같은 틀 + 「기존」에 한국 10년 5일 칸도 넣어 3년 몫만 따로 봄."""
import json, sys, os, urllib.request, re
from concurrent.futures import ThreadPoolExecutor
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd())
import prob, prob_x
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}

def cnbc(sym, start="20000101"):
    end = (pd.Timestamp.today() + pd.Timedelta(days=2)).strftime("%Y%m%d")
    u = f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/1D/{start}000000/{end}000000/adjusted/EST5EDT.json"
    r = requests.get(u, headers=UA, timeout=40)
    bars = r.json().get("barData", {}).get("priceBars", []) or []
    v = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
    return v[~v.index.duplicated(keep="last")]

def naver_page(p):
    u = f"https://finance.naver.com/marketindex/interestDailyQuote.naver?marketindexCd=IRR_GOVT03Y&page={p}"
    try:
        r = requests.get(u, headers=UA, timeout=20); t = r.content.decode("euc-kr", "ignore")
        rows = re.findall(r"(\d{4}\.\d{2}\.\d{2})</td>\s*<td[^>]*>\s*([\d.]+)", t)
        return [(pd.Timestamp(a.replace(".", "-")), float(b)) for a, b in rows]
    except Exception as e:
        return []

SER = {}
for s_ in ("KR3Y", "KR3YT=RR", "KR2Y", "KR5Y", "KR10Y"):
    try:
        v = cnbc(s_); print("CNBC", s_, len(v), v.index[0].date() if len(v) else None, v.index[-1].date() if len(v) else None)
        if len(v) > 1000: SER["c:" + s_] = v
    except Exception as e:
        print("CNBC", s_, "ERR", str(e)[:100])
r0 = naver_page(1); print("NAVER p1", len(r0), r0[:3])
if r0:
    rows = []
    with ThreadPoolExecutor(16) as ex:
        for i, rr in enumerate(ex.map(naver_page, range(1, 801))):
            rows += rr
    v = pd.Series(dict(rows)).sort_index(); v = v[~v.index.duplicated()]
    print("NAVER IRR_GOVT03Y", len(v), v.index[0].date() if len(v) else None, v.index[-1].date() if len(v) else None, v.tail(3).to_dict())
    if len(v) > 1000: SER["n:3Y"] = v
def nm_page(p):
    u = f"https://api.stock.naver.com/marketindex/bond/KR3YT=RR/prices?page={p}&pageSize=100"
    try:
        js = requests.get(u, headers=UA, timeout=20).json()
        return [(pd.Timestamp(x["localTradedAt"][:10]), float(str(x["closePrice"]).replace(",", ""))) for x in js]
    except Exception as e:
        return []
rows = []
for b in range(0, 80, 16):
    with ThreadPoolExecutor(16) as ex:
        got = list(ex.map(nm_page, range(b + 1, b + 17)))
    for g in got: rows += g
    if not got[-1]: break
if rows:
    v = pd.Series(dict(rows)).sort_index(); v = v[~v.index.duplicated()]
    print("NAVER-M KR3YT=RR", len(v), v.index[0].date(), v.index[-1].date(), v.tail(3).to_dict())
    if len(v) > 1000: SER["n:3Y"] = v
K3 = SER.get("n:3Y"); K5 = SER.get("c:KR5Y")
if K3 is None: K3 = K5; print("3년 없음 → 5년으로")
K10 = SER.get("c:KR10Y")
print("요일", K3.index.dayofweek.value_counts().sort_index().to_dict(), "지금", K3.tail(5).to_dict())
syms = sorted({c["ix"] for c in prob.MK.values()} | {"^TNX", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
tn, sp = cs("^TNX"), cs("^GSPC")

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
    rv = A(tn.diff(5)); rs = A(np.log(sp).diff(5))
    oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
    r10 = prob_x.align(prob_x.rank252(K10.diff(5)), d.index) if K10 is not None else None
    oth10 = oth + "|" + lab(r10, "kh", "kl") if r10 is not None else oth
    R = {}
    FS = [("3년5일", K3.diff(5), 0), ("3년20일", K3.diff(20), 0), ("3년5일_lag1", K3.diff(5), 1)] + ([("5년5일", K5.diff(5), 0), ("5년20일", K5.diff(20), 0)] if K5 is not None else [])
    for fn, ser, lg in FS:
        rg = prob_x.align(prob_x.rank252(ser), d.index).shift(lg); mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90(금리 급등)", (rg >= 0.9).fillna(False)), ("≤10(금리 급락)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"높음일": int(fh.sum()), "높음&미10년≥90": int((fh & (rv >= 0.9)).sum()), "높음&미10년≤10": int((fh & (rv <= 0.1)).sum()), "높음&한10년≥90": int((fh & (r10 >= 0.9)).sum()) if r10 is not None else None, "낮음&한10년≤10": int((fl & (r10 <= 0.1)).sum()) if r10 is not None else None,
              "낮음일": int(fl.sum()), "낮음&미10년≥90": int((fl & (rv >= 0.9)).sum()), "낮음&S&P≤10": int((fl & (rs <= 0.1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존(미10년·S&P)": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0],
                 "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + gb, ycol, h)[0],
                 "기존+10년": wf(d, oth10, ycol, h)[0], "기존+10년+높음": wf(d, oth10 + "|" + gh, ycol, h)[0], "기존+10년+낮음": wf(d, oth10 + "|" + gl, ycol, h)[0]}
            r[ycol] = score(d, ycol, P)
        # 교차 로지스틱
        D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = rv.notna() & rs.notna() & rg.notna() & (d.index >= "2002-01-01")
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
json.dump(out, open("probe/kr3_119.json", "w"), ensure_ascii=False, indent=1)
