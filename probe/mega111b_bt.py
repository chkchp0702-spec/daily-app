"""#111b (11/16 12시) 덧셈형 w 0.3/0.5/1.0 — 발표 밤 표시 칸 몫을 닻 로짓 위에 더해 걸어가기 · 사건날·최근5년·해마다 방향 · 원본 #111 미 대형 기술주(NVDA·AAPL·MSFT·AMZN·GOOGL·META·TSLA) 실적 발표 → 다음 아시아 장 — 확률 보강 일지 11/16 10시 (Actions)
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

def lg(p): p=min(max(p,1e-4),1-1e-4); return float(np.log(p/(1-p)))
OUT = {"n_events": len(EV), "n_days": len(G)}
now = pd.Timestamp.now()
UP = []
for s in STK:
    try:
        ed = yf.Ticker(s).get_earnings_dates(limit=8)
        for ts in ed.index:
            t = pd.Timestamp(ts)
            if t.tzinfo is not None: t = t.tz_convert("America/New_York").tz_localize(None)
            if t >= now - pd.Timedelta(days=3): UP.append([s, str(t)])
    except Exception as e: UP.append([s, "err " + str(e)[:60]])
OUT["upcoming"] = sorted(UP, key=lambda x: x[1])
for mk, ix, etf in (("KR", "^KS11", "EWY"), ("HK", "^HSI", "EWH"), ("JP", "^N225", "EWJ")):
    a = C[ix]; E = C[etf].pct_change(); ar = a.pct_change(); days = a.index
    rows = []
    for i in range(2, len(days)):
        D, P = days[i], days[i - 1]
        j = us_d.searchsorted(D) - 1
        if j < 1: continue
        t = us_d[j]
        if t < P or pd.isna(E.get(t, np.nan)) or pd.isna(sxr.get(t, np.nan)): continue
        Rn = us_d[j + 1] if j + 1 < len(us_d) else None
        ev = 1 if (Rn is not None and Rn.normalize() == D.normalize() and Rn in G.index) else 0
        rows.append((D, spr[t], E[t] - ar[P], sxr[t] - spr[t], ev, int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "ev", "y"]).set_index("D")
    R = R[R.index >= "2006-01-01"]
    for c in ["us", "etfx", "sx"]: R[c] = R[c].astype(float).clip(-0.15, 0.15) * 100
    cols = ["us", "etfx", "sx"]
    ys, base, adds, evs, yrs = [], [], [], [], []
    for yr in range(2012, R.index[-1].year + 1):
        tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
        if not len(te): continue
        w = fit(tr[cols].values, tr["y"].values); p0 = pr(w, te[cols].values)
        # 칸 몫: 훈련 기간 사건날의 「실제 − 닻 예측」 로짓 차이(사전 100 으로 줄임)
        ptr = pr(w, tr[cols].values); m = tr["ev"].values == 1; n = int(m.sum())
        d = (lg(tr["y"].values[m].mean()) - lg(ptr[m].mean())) * n / (n + 100) if n else 0.0
        ys.append(te["y"].values); base.append(p0); adds.append(np.full(len(te), d)); evs.append(te["ev"].values); yrs.append(np.full(len(te), yr))
    yy = np.concatenate(ys); P0 = np.concatenate(base); DD = np.concatenate(adds); EV1 = np.concatenate(evs).astype(bool); YR = np.concatenate(yrs)
    L0 = np.log(P0 / (1 - P0)); nn = len(yy); h = nn // 2
    res = {"n": nn, "ev": int(EV1.sum()), "d_last": round(float(DD[-1]), 3)}
    for s in (0.0, 0.3, 0.5, 1.0):
        p = 1 / (1 + np.exp(-(L0 + s * DD * EV1)))
        res[f"w{s}"] = {seg: brier(p[sl], yy[sl]) for seg, sl in (("앞", slice(0, h)), ("뒤", slice(h, nn)), ("최근5년", slice(nn - 1250, nn)), ("최근3년", slice(nn - 750, nn)))}
        r5 = np.zeros(nn, bool); r5[nn - 1250:] = True
        res[f"w{s}"]["사건날_최근5년"] = [int((EV1 & r5).sum()), brier(p[EV1 & r5], yy[EV1 & r5])]
        res[f"w{s}"]["사건날_전체"] = brier(p[EV1], yy[EV1])
    # 해마다: 사건날 실제 − 닻 예측
    yrow = {}
    for yr in np.unique(YR):
        m = (YR == yr) & EV1
        if m.sum(): yrow[int(yr)] = [int(m.sum()), round(float(yy[m].mean() * 100), 1), round(float(P0[m].mean() * 100), 1)]
    res["해마다(n·실제·닻)"] = yrow
    res["해마다_실제<닻"] = f"{sum(1 for v in yrow.values() if v[1] < v[2])}/{len(yrow)}"
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
print("upcoming", OUT["upcoming"])
json.dump(OUT, open("probe/mega111b_bt.json", "w"), ensure_ascii=False, indent=1)
