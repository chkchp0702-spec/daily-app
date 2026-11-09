"""#84b VKOSPI 5일 급등·급락 → 한국 종목 시총 하위⅓ vs 상위⅓ 「시장보다 나을 확률」(yr5) — 확률 보강 11/9 16시 (Actions)
종목 = prob_sec 와 같은 한국 시총 상위 250(opdata sec.json) · 야후 2009~ 일봉 · 과거 시총 ≈ 지금 시총×(그날 종가/마지막 종가).
신호: 그날(t) 종가 시점 VKOSPI 5일 변화 1년 순위 up ≥0.9 · dn ≤0.1. y = 종목 5일 등락 > 코스피 5일 등락.
① 날 평균(소형⅓·대형⅓·차이) 칸 앞/뒤·최근5년·5일 간격 ② 종목-날 로지스틱(크기만 vs 크기×신호) 교차·걸어가기 브라이어."""
import json
import numpy as np, pandas as pd, requests, yfinance as yf
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
r = requests.get("https://ts-api.cnbc.com/harmony/app/bars/.KSVKOSPI/1D/20030101000000/20261110000000/adjusted/EST5EDT.json", headers=UA, timeout=40)
bars = r.json().get("barData", {}).get("priceBars", [])
vk = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
vk = vk[~vk.index.duplicated(keep="last")]; vk = vk[vk > 0]
vkq = np.log(vk / vk.shift(5)).rolling(252, min_periods=200).rank(pct=True)
print("VKOSPI", len(vk), vk.index[0].date(), vk.index[-1].date(), "지금 순위", round(float(vkq.iloc[-1]), 3))
sec = requests.get("https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/sec.json", timeout=90).json()
cand = sorted([(s, v[2]) for s, v in sec.items() if s.endswith((".KS", ".KQ")) and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1])[:250]
cap = dict(cand); syms = list(cap)
print("종목", len(syms))
df = yf.download(syms + ["^KS11"], start="2009-01-01", interval="1d", group_by="ticker", auto_adjust=True, progress=False, threads=True)
C = {}
for s in syms + ["^KS11"]:
    try:
        x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]
        if len(x) > 300: C[s] = x[x > 0]
    except Exception: pass
ix = C.pop("^KS11"); days = ix.index
CL = pd.DataFrame(C).reindex(days)
print("받은 종목", CL.shape[1], days[0].date(), days[-1].date())
F5 = CL.shift(-5) / CL - 1; M5 = ix.shift(-5) / ix - 1
Y = (F5.gt(M5, axis=0)).astype(float).where(F5.notna() & M5.notna().values[:, None])
CAPT = CL / CL.ffill().iloc[-1] * pd.Series({s: cap[s] for s in CL.columns})
RK = CAPT.rank(axis=1, pct=True)
own5 = np.log(ix / ix.shift(5)).rolling(252).rank(pct=True)
v = vkq.reindex(days, method="ffill", limit=3)
rows = []
for t in days[260:-5]:
    y = Y.loc[t]; rk = RK.loc[t]; ok = y.notna() & rk.notna()
    if ok.sum() < 60 or pd.isna(v.get(t)): continue
    sm = y[ok & (rk <= 1 / 3)].mean(); lg = y[ok & (rk > 2 / 3)].mean()
    rows.append((t, float(v[t]), float(own5.get(t, np.nan)), sm, lg, int(ok.sum())))
R = pd.DataFrame(rows, columns=["t", "v", "o", "S", "L", "n"]).set_index("t"); R["Dif"] = R.S - R.L
R["up"] = R.v >= 0.9; R["dn"] = R.v <= 0.1
mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]; L5 = R.iloc[-1250:]
out = {"날": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "평균종목수": round(float(R.n.mean()))}
for lab in ("up", "dn"):
    c = {}
    for seg, T in (("앞", A), ("뒤", B), ("최근5년", L5)):
        m = T[lab]
        c[seg] = {"n": int(m.sum()), "소형%p": round((T.S[m].mean() - T.S.mean()) * 100, 1), "대형%p": round((T.L[m].mean() - T.L.mean()) * 100, 1),
                  "차이(소−대)": round(T.Dif[m].mean() * 100, 1), "평소차이": round(T.Dif.mean() * 100, 1)}
    for seg, T in (("앞순수", A), ("뒤순수", B)):
        m = T[lab] & ~((T.o <= 0.1) | (T.o >= 0.9)); c[seg] = {"n": int(m.sum()), "차이(소−대)": round(T.Dif[m].mean() * 100, 1), "평소차이": round(T.Dif.mean() * 100, 1)}
    sp = []
    for st in range(5):
        T = R.iloc[st::5]; h = T[T.index < mid]; g = T[T.index >= mid]
        sp.append([round((h.Dif[h[lab]].mean() - h.Dif.mean()) * 100, 1), round((g.Dif[g[lab]].mean() - g.Dif.mean()) * 100, 1), int(h[lab].sum()), int(g[lab].sum())])
    c["5일간격 차이 변화(앞,뒤,n앞,n뒤)"] = sp
    out[lab] = c
# 종목-날 로지스틱 (5일 간격 표본)
def brier(p, y): return round(float(np.mean((p - y) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
st = []
for t in R.index[::5]:
    y = Y.loc[t]; rk = RK.loc[t]; ok = y.notna() & rk.notna(); u = float(R.at[t, "up"]); d = float(R.at[t, "dn"])
    for s in y.index[ok]:
        q = rk[s]; sm = float(q <= 1 / 3); lg = float(q > 2 / 3)
        st.append((t, sm, lg, u, d, sm * u, lg * u, sm * d, lg * d, y[s]))
S = pd.DataFrame(st, columns=["t", "sm", "lg", "u", "d", "smu", "lgu", "smd", "lgd", "y"]).set_index("t")
SETS = {"크기": ["sm", "lg"], "크기+up": ["sm", "lg", "u", "smu", "lgu"], "크기+dn": ["sm", "lg", "d", "smd", "lgd"]}
sA, sB = S[S.index < mid], S[S.index >= mid]; lg_ = {}
for nm, (tr, te) in {"앞→뒤": (sA, sB), "뒤→앞": (sB, sA)}.items():
    q = {"평소": brier(np.full(len(te), tr.y.mean()), te.y.values)}
    for k, cols in SETS.items():
        w = fit(tr[cols].values, tr.y.values); q[k] = brier(pr(w, te[cols].values), te.y.values)
        if k != "크기": q[k + "_계수"] = [round(float(x), 3) for x in w[3:]]
    lg_[nm] = q
wf = {k: [] for k in SETS}; ys = []
for yr in range(2014, S.index[-1].year + 1):
    tr = S[S.index < f"{yr}-01-01"]; te = S[(S.index >= f"{yr}-01-01") & (S.index < f"{yr + 1}-01-01")]
    if not len(te): continue
    ys.append(te.y.values)
    for k, cols in SETS.items(): wf[k].append(pr(fit(tr[cols].values, tr.y.values), te[cols].values))
yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
lg_["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2014~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근약5년", slice(max(0, n - n * 5 // 13), n)))}
out["로지스틱(종목-날, 5일 간격)"] = {"n": len(S), **lg_}
out["지금"] = {"t": str(R.index[-1].date()), "v": round(float(v.iloc[-1]), 3)}
print("RESULT", json.dumps(out, ensure_ascii=False))
