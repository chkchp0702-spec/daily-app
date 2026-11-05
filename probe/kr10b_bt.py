"""#75b 한국 10년 5일 급등(≥90) → 일본 5일 · 5일 간격 표본(시작점 5개) — 확률 보강 11/5 15시 (Actions)
5·20일 변화(%p 수준차)의 1년 백분위 ≥90%(금리 급등)·≤10%(급락) 한쪽씩 칸. 서울 날짜 값 → 같은 날 행(다음 날 예측).
겹침: 미 10년(^TNX)·S&P 5일 꼬리 칸 위 + 교차 로지스틱. 하루 늦춘(lag1) 판도 같이 — 날짜 어긋남 점검."""
import json, sys, os, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

def cnbc(sym, start="20000101"):
    end = (pd.Timestamp.today() + pd.Timedelta(days=2)).strftime("%Y%m%d")
    u = f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/1D/{start}000000/{end}000000/adjusted/EST5EDT.json"
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"})
    with urllib.request.urlopen(req, timeout=40) as r:
        bars = json.loads(r.read().decode("utf-8")).get("barData", {}).get("priceBars", [])
    v = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
    return v[~v.index.duplicated(keep="last")]

SER = {}
for s_ in ("KR10Y", "KR3Y"):
    try:
        v = cnbc(s_); print("CNBC", s_, len(v), v.index[0].date() if len(v) else None, v.index[-1].date() if len(v) else None, v.tail(3).to_dict())
        print("요일", s_, v.index.dayofweek.value_counts().sort_index().to_dict())
        if len(v) > 1000: SER[s_] = v
    except Exception as e:
        print("CNBC", s_, "ERR", str(e)[:100])
if "KR10Y" not in SER: sys.exit("KR10Y 없음")
JG = SER["KR10Y"]
syms = sorted({c["ix"] for c in prob.MK.values()} | {"^TNX", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
tn, sp = cs("^TNX"), cs("^GSPC")
sk = JG

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



R = {}
d0 = prob.feats(H[prob.MK["JP"]["ix"]]); d0 = d0[d0.index >= "2005-01-01"].copy()
A = lambda s: prob_x.align(prob_x.rank252(s), d0.index)
rv0 = A(tn.diff(5)); rs0 = A(np.log(sp).diff(5))
for lg in (0, 1):
    rg0 = A(sk.diff(5)).shift(lg)
    for st in range(5):
        d = d0.iloc[st::5].copy(); rg, rv, rs = rg0.reindex(d.index), rv0.reindex(d.index), rs0.reindex(d.index)
        mid = d.index[len(d) // 2]; f = (rg >= 0.9).fillna(False); cells = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            yy = d.loc[msk, "y5"]; cells[half] = [int(f[msk].sum()), round((yy[f[msk]].mean() - yy.mean()) * 100, 1)]
        oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl"); gh = one(rg, rg >= 0.9, "gh")
        base = wf(d, oth, "y5", 1)[0]; add = wf(d, oth + "|" + gh, "y5", 1)[0]
        # 덧셈형 w0.5: 칸 로그오즈 차이 절반
        lo = lambda p: np.log(p / (1 - p)); pg = wf(d, gh, "y5", 1)[0]; pb = wf(d, gh, "y5", 1)[1]
        addw = 1 / (1 + np.exp(-(lo(base) + 0.5 * (lo(pg) - lo(pb)))))
        sc = score(d, "y5", {"기존": base, "칸곱": add, "덧셈w0.5": addw}, start="2006-01-01")
        D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9}, index=d.index).astype(float)
        m = rv.notna() & rs.notna() & rg.notna() & d["y5"].notna(); idx = d.index[m]; md = idx[len(idx)//2]
        y = d.loc[m, "y5"].values.astype(float); Xa = D[m].values; a, b = idx < md, idx >= md; xr = {}
        for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
            o = {}
            for k, cols in (("기존", [0,1,2,3,4]), ("+높음", [0,1,2,3,4,5])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1/(1+np.exp(-Xa[te][:, cols] @ w)); o[k] = round(float(((p-y[te])**2).mean()), 5)
            xr[nm] = o
        r = {"lag": lg, "시작": st, "칸(n,y5차)": cells, "걸어가기": sc, "교차": xr}
        print("JP5", json.dumps(r, ensure_ascii=False)); R[f"{lg}_{st}"] = r
json.dump(R, open("probe/kr10b_bt.json", "w"), ensure_ascii=False, indent=1)
