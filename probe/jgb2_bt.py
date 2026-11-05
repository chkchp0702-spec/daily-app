"""#74 일본 10년 국채금리(CNBC JP10Y) 5일 급변 꼬리 → 5개 시장 — 확률 보강 11/5 14시 (Actions)
5·20일 변화(%p 수준차)의 1년 백분위 ≥90%(금리 급등)·≤10%(급락) 한쪽씩 칸. 도쿄 날짜 값 → 같은 날 행(다음 날 예측).
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

JG = None
for s in ("JP10Y", "JP10Y-JP", "JP10YR"):
    try:
        v = cnbc(s); print("CNBC", s, len(v), v.index[0].date() if len(v) else None, v.index[-1].date() if len(v) else None, v.tail(3).to_dict())
        if len(v) > 1000 and JG is None: JG = v
    except Exception as e:
        print("CNBC", s, "ERR", str(e)[:100])
for s in ():  # 다음 후보(#75·#76) 자료 확인만
    try:
        v = cnbc(s); print("NEXT", s, len(v), v.index[0].date() if len(v) else None, v.tail(2).to_dict())
    except Exception as e:
        print("NEXT", s, "ERR", str(e)[:100])
if JG is None: sys.exit("JP10Y 없음")
# 요일 분포(주말 바가 있으면 날짜 어긋남 의심)
print("요일", JG.index.dayofweek.value_counts().sort_index().to_dict())

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



# #74 2차: 일본 20일 급락(≤10) → 닛케이 5일 — 하루·이틀 늦춤 · 5일 간격 표본(시작점 5개) · 사건 솎기
mk = "JP"; cfg = prob.MK[mk]
d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "1995-01-01"].copy()
A = lambda s: prob_x.align(prob_x.rank252(s), d.index)
rv = A(tn.diff(5)); rs = A(np.log(sp).diff(5))
oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
res = {}
for lg in (0, 1, 2):
    rg = prob_x.align(prob_x.rank252(sk.diff(20)), d.index).shift(lg)
    f = (rg <= 0.1).fillna(False); gl = one(rg, rg <= 0.1, "gl")
    mid = d.index[len(d) // 2]; R = {"cur": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3)}
    # 사건 솎기: 꼬리 첫날만(전 10일 꼬리 없음)
    first = f & ~f.shift(1, fill_value=False).rolling(10, min_periods=1).max().astype(bool)
    for nm, ff in (("매일", f), ("첫날", first)):
        R[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid), ("최근5년", d.index >= d.index[-1] - pd.Timedelta(days=1826))):
            y5 = d.loc[msk, "y5"]; sel = y5[ff[msk]].dropna()
            R[nm][half] = [int(len(sel)), round((sel.mean() - y5.mean()) * 100, 1) if len(sel) else None]
    for st in range(5):
        ds = d.iloc[st::5].copy(); o2 = oth.iloc[st::5]; g2 = gl.iloc[st::5]; f2 = f.iloc[st::5]
        md = ds.index[len(ds) // 2]; cell = {}
        for half, msk in (("앞", ds.index < md), ("뒤", ds.index >= md)):
            y5 = ds.loc[msk, "y5"]; sel = y5[f2[msk]].dropna(); cell[half] = [int(len(sel)), round((sel.mean() - y5.mean()) * 100, 1)]
        P = {"기존": wf(ds, o2, "y5", 1, prior=20)[0], "기존+낮음": wf(ds, o2 + "|" + g2, "y5", 1, prior=20)[0]}
        R[f"시작{st}"] = {"칸": cell, "브라이어": score(ds, "y5", P)}
    res[f"lag{lg}"] = R
    print("JP 20일≤10 y5 lag", lg, json.dumps(R, ensure_ascii=False))
json.dump(res, open("probe/jgb2_bt.json", "w"), ensure_ascii=False, indent=1)
