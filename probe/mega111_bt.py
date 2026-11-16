"""#111 미 대형 기술주(NVDA·AAPL·MSFT·AMZN·GOOGL·META·TSLA) 실적 발표 → 다음 아시아 장 — 확률 보강 일지 11/16 10시 (Actions)
반응일 R = 장 마감 뒤 발표면 다음 미국 거래일, 장 전 발표면 그날.
T1(상한 시험, 뒷북): 아시아 R일 장(미국 R 개장 전) 방향 ~ 닻[us(R-1), etfx] + gap(종목 시가R/종가R-1 − S&P 같은 갭) — 실제로는 시간외 값이 필요. 이것도 안 좋아지면 기각.
T2(제때 쓸 수 있음): 아시아 R 다음 장 방향 ~ 닻[us(R), etfx, sx] + react(종목 R일 등락 − S&P R일 등락).
특성은 발표 없는 날 0. 두 기간 교차 + 해마다 걸어가기(2012~) 브라이어 · 사건 날만 따로 · 칸(갭/반응 ±3%)."""
import json
import numpy as np, pandas as pd, yfinance as yf
STK = ["NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA"]
SY = ["^KS11", "^N225", "^HSI", "^GSPC", "^SOX", "EWY", "EWJ", "EWH"] + STK
df = yf.download(SY, start="2005-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def col(s, f="Close"):
    x = df[s][f].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: col(s) for s in SY}; O = {s: col(s, "Open") for s in ["^GSPC"] + STK}
us_d = C["^GSPC"].index
# ---- 실적 일정 ----
EV = []
for s in STK:
    try:
        ed = yf.Ticker(s).get_earnings_dates(limit=100)
    except Exception as e:
        print("실적 실패", s, e); continue
    if ed is None: continue
    for ts in ed.index:
        t = pd.Timestamp(ts)
        if t.tzinfo is not None: t = t.tz_convert("America/New_York").tz_localize(None)
        if t > pd.Timestamp.now(): continue
        d = t.normalize()
        after = t.hour >= 16 or (t.hour == 0 and t.minute == 0 and s != "NVDA" and False)
        # 시각이 없으면(00:00) 이 종목들은 거의 모두 장 마감 뒤 발표 → 마감 뒤로 본다
        if t.hour == 0 and t.minute == 0: after = True
        k = us_d.searchsorted(d) if not after else us_d.searchsorted(d, side="right")
        if k >= len(us_d) or k < 1: continue
        R = us_d[k]
        EV.append((s, R))
print("실적 건", len(EV), {s: sum(1 for a, _ in EV if a == s) for s in STK})
spr = C["^GSPC"].pct_change(); sxr = C["^SOX"].pct_change()
spgap = O["^GSPC"] / C["^GSPC"].shift(1) - 1
gapd, reactd = {}, {}
for s, R in EV:
    if R not in O[s].index or R not in C[s].index: continue
    i = C[s].index.get_loc(R)
    if i < 1: continue
    g = O[s][R] / C[s].iloc[i - 1] - 1 - (spgap.get(R, 0) if pd.notna(spgap.get(R, np.nan)) and R >= pd.Timestamp("2008-01-01") else 0)
    rr = C[s].pct_change()[R] - spr[R]
    gapd.setdefault(R, []).append(g); reactd.setdefault(R, []).append(rr)
G = pd.Series({k: float(np.mean(v)) for k, v in gapd.items()}).sort_index()
RE = pd.Series({k: float(np.mean(v)) for k, v in reactd.items()}).sort_index()
print("사건 반응일", len(G), "첫", str(G.index[0].date()) if len(G) else None)
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
OUT = {"n_events": len(EV), "n_days": len(G)}
for mk, ix, etf in (("KR", "^KS11", "EWY"), ("JP", "^N225", "EWJ"), ("HK", "^HSI", "EWH")):
    a = C[ix]; E = C[etf].pct_change(); ar = a.pct_change(); days = a.index
    rows = []
    for i in range(2, len(days)):
        D, P = days[i], days[i - 1]
        # T1: 미국 R 이 D 와 같은 날(아시아 D 장은 미국 R 개장 전) → 마지막 미국 날 t = D 앞 미국 날
        j = us_d.searchsorted(D) - 1
        if j < 1: continue
        t = us_d[j]
        if t < P or pd.isna(E.get(t, np.nan)) or pd.isna(sxr.get(t, np.nan)): continue
        Rn = us_d[j + 1] if j + 1 < len(us_d) else None  # 아시아 D 뒤 처음 미국 날
        gap = G.get(Rn, 0.0) if Rn is not None and Rn.normalize() == D.normalize() else 0.0
        react = RE.get(t, 0.0)
        rows.append((D, spr[t], E[t] - ar[P], sxr[t] - spr[t], gap, react, int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "gap", "react", "y"]).set_index("D")
    R = R[R.index >= "2006-01-01"]
    for c in ["us", "etfx", "sx", "gap", "react"]: R[c] = R[c].astype(float).clip(-0.15, 0.15) * 100
    R["ev1"] = (R["gap"] != 0).astype(int); R["ev2"] = (R["react"] != 0).astype(int)
    SETS = {"닻": ["us", "etfx", "sx"], "닻+gap(T1 뒷북)": ["us", "etfx", "sx", "gap"], "닻+react(T2)": ["us", "etfx", "sx", "react"]}
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "ev1": int(R["ev1"].sum()), "ev2": int(R["ev2"].sum())}
    for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
        r = {}
        for lab, cols in SETS.items():
            w = fit(tr[cols].values, tr["y"].values); p = pr(w, te[cols].values)
            evm = (te["ev1"] if "gap" in lab else te["ev2"]).values.astype(bool) if lab != "닻" else None
            r[lab] = brier(p, te["y"]); r[lab + "_w"] = [round(float(v), 3) for v in w]
            if evm is not None:
                w0 = fit(tr[SETS["닻"]].values, tr["y"].values); p0 = pr(w0, te[SETS["닻"]].values)
                r[lab + "_사건날"] = [int(evm.sum()), brier(p0[evm], te["y"].values[evm]), brier(p[evm], te["y"].values[evm])]
        res[nm] = r
    wf = {k: [] for k in SETS}; ys = []; e1 = []; e2 = []
    for yr in range(2012, R.index[-1].year + 1):
        tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
        if not len(te): continue
        ys.append(te["y"].values); e1.append(te["ev1"].values); e2.append(te["ev2"].values)
        for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr["y"].values), te[cols].values))
    yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; E1 = np.concatenate(e1).astype(bool); E2 = np.concatenate(e2).astype(bool); n = len(yy); h = n // 2
    res["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2012~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근5년", slice(n - 1250, n)))}
    res["걸어가기_사건날"] = {"T1": [int(E1.sum()), brier(W["닻"][E1], yy[E1]), brier(W["닻+gap(T1 뒷북)"][E1], yy[E1])],
                          "T2": [int(E2.sum()), brier(W["닻"][E2], yy[E2]), brier(W["닻+react(T2)"][E2], yy[E2])]}
    cells = {}
    for half, T in (("앞", A), ("뒤", B)):
        cells[half] = {"평소": round(float(T["y"].mean()) * 100, 1)}
        for lab, m in (("gap≥+3", T["gap"] >= 3), ("gap≤−3", T["gap"] <= -3), ("react≥+3", T["react"] >= 3), ("react≤−3", T["react"] <= -3), ("사건1", T["ev1"] == 1), ("사건2", T["ev2"] == 1)):
            cells[half][lab] = [int(m.sum()), round(float(T.loc[m, "y"].mean()) * 100, 1) if m.sum() else None]
    res["칸"] = cells
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
json.dump(OUT, open("probe/mega111_bt.json", "w"), ensure_ascii=False, indent=1)
