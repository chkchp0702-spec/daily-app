"""#82 중국 상품선물 「경기 바로미터」(공업품 바구니) 등락 → 중국·홍콩(·한국) 다음 장·5일 — 확률 보강 일지 11/6 14시 (Actions)
자료: 시나 선물 일봉(주력 연속 CU0·AL0·ZN0·RB0·HC0·I0·J0·JM0) — 막히면 동방재부 push2his · akshare 순서로 시험.
바구니 = 품목별 하루 등락(±8% 자름, 주력 교체 튐 완화)의 평균. 특성(아시아 P 장 마감 기준): c1=바구니 P 등락, c5=5일 합, cx=c1−지수 P 등락, a1·a5=지수 자기.
① 칸: c5·c1 1년 백분위 ≥90·≤10 → 다음 날·5일 상승 비율 앞/뒤 ② 기존(간밤 S&P + 자기 1·5일) 위 교차 로지스틱 브라이어 ③ 해마다 다시 맞추는 걸어가기 ④ 지금 값."""
import json, time
import numpy as np, pandas as pd, requests, yfinance as yf
H = {"User-Agent": "Mozilla/5.0", "Referer": "https://finance.sina.com.cn/"}
SYMS = ["CU0", "AL0", "ZN0", "RB0", "HC0", "I0", "J0", "JM0"]
EM = {"CU0": "113.cum", "AL0": "113.alm", "ZN0": "113.znm", "RB0": "113.rbm", "HC0": "113.hcm", "I0": "114.im", "J0": "114.jm", "JM0": "114.jmm"}
def sina(s):
    best = (None, None)
    for u in (f"https://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine?symbol={s}",
              f"https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_{s}=/InnerFuturesNewService.getDailyKLine?symbol={s}"):
        try:
            r = requests.get(u, headers=H, timeout=20); print("sina", s, r.status_code, len(r.text))
            t = r.text
            if "(" in t[:200] and t.strip().endswith(")"): t = t[t.index("(") + 1:t.rindex(")")]
            elif "=" in t[:60]: t = t[t.index("=") + 1:].strip().rstrip(";")
            d = json.loads(t)
            if isinstance(d, list) and d:
                if isinstance(d[0], dict): rows = [(x.get("d") or x.get("date"), float(x.get("c") or x.get("close"))) for x in d]
                else: rows = [(x[0], float(x[4])) for x in d]
                s_ = pd.Series(dict(rows)); s_.index = pd.to_datetime(s_.index); s_ = s_.sort_index(); print("  ", s, str(s_.index[0].date()), str(s_.index[-1].date()), len(s_))
                if best[0] is None or s_.index[-1] > best[0].index[-1]: best = (s_, "sina")
        except Exception as e: print("sina err", s, repr(e)[:120])
    return best
def em(s):
    u = f"https://push2his.eastmoney.com/api/qt/stock/kline/get?secid={EM[s]}&klt=101&fqt=0&beg=19900101&end=20991231&fields1=f1&fields2=f51,f53"
    try:
        r = requests.get(u, headers={"User-Agent": "Mozilla/5.0"}, timeout=20); print("em", s, r.status_code, len(r.text))
        k = r.json()["data"]["klines"]; s_ = pd.Series({x.split(",")[0]: float(x.split(",")[1]) for x in k}); s_.index = pd.to_datetime(s_.index); return s_.sort_index(), "eastmoney"
    except Exception as e: print("em err", s, repr(e)[:120]); return None, None
P = {}; SRC = {}
for s in SYMS:
    x, src = sina(s)
    y, _ = em(s)
    if y is not None and len(y) > 50:
        print("  em", s, str(y.index[0].date()), str(y.index[-1].date()), len(y))
        if x is None or len(x) < 500: x, src = y, "eastmoney"
        elif y.index[-1] > x.index[-1] and y.index[0] <= x.index[-1]:   # 등락률로 이어 붙임(가격 수준 차이 무시)
            r = pd.concat([x.pct_change().dropna(), y.pct_change()[y.index > x.index[-1]].dropna()])
            x = (1 + r).cumprod() * 100; src = "sina+eastmoney"
    if x is not None and len(x) >= 500: P[s] = x[x > 0]; SRC[s] = src
    time.sleep(0.5)
if len(P) < 4:
    try:
        import subprocess; subprocess.run("pip install -q akshare", shell=True); import akshare as ak
        for s in SYMS:
            if s in P: continue
            try:
                d = ak.futures_zh_daily_sina(symbol=s); x = pd.Series(d["close"].astype(float).values, index=pd.to_datetime(d["date"])); P[s] = x; SRC[s] = "akshare"
            except Exception as e: print("ak err", s, repr(e)[:120])
    except Exception as e: print("akshare 실패", repr(e)[:120])
print("품목:", {s: (str(v.index[0].date()), str(v.index[-1].date()), len(v), SRC[s]) for s, v in P.items()})
if len(P) < 4: raise SystemExit("자료 부족")
RET = pd.DataFrame({s: v.pct_change().clip(-0.08, 0.08) for s, v in P.items()})
bask = RET.mean(axis=1, skipna=True)[RET.notna().sum(axis=1) >= 3].dropna()
print("바구니", str(bask.index[0].date()), str(bask.index[-1].date()), len(bask), "평균", round(float(bask.mean()) * 100, 3))
SY = ["000001.SS", "^HSI", "^KS11", "^GSPC"]
df = yf.download(SY, start="2003-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=False)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}; spr = C["^GSPC"].pct_change().dropna()
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        Hh = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(Hh, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
def pct(s, n=250): return s.rolling(n, min_periods=200).apply(lambda v: (v[:-1] < v[-1]).mean() * 100, raw=True)
OUT = {"src": SRC}
for mk, ix in (("CN", "000001.SS"), ("HK", "^HSI"), ("KR", "^KS11")):
    a = C[ix]; days = a.index
    b = bask.reindex(days).fillna(0.0)  # 그 나라 장날에 맞춤(바구니 없는 날 0)
    b = b[(b.index >= bask.index[0]) & (b.index <= bask.index[-1])]
    ar = a.pct_change()
    c5 = b.rolling(5).sum(); a5 = a.pct_change(5)
    pc1, pc5 = pct(b), pct(c5)
    us_d = spr.index; rows = []
    for i in range(1, len(days) - 5):
        Pd, D = days[i], days[i + 1]
        if Pd not in b.index or Pd > bask.index[-1] or pd.isna(pc5.get(Pd, np.nan)) or pd.isna(a5.get(Pd, np.nan)): continue
        j = us_d.searchsorted(D) - 1
        if j < 0 or us_d[j] < Pd: us = 0.0
        else: us = float(spr.iloc[j])
        rows.append((D, us, float(ar[Pd]), float(a5[Pd]), float(b[Pd]), float(c5[Pd]), float(b[Pd] - ar[Pd]), float(pc1[Pd]), float(pc5[Pd]),
                     int(a[D] > a[Pd]), int(a.iloc[i + 5] > a[Pd])))
    R = pd.DataFrame(rows, columns=["D", "us", "a1", "a5", "c1", "c5", "cx", "p1", "p5", "y1", "y5"]).set_index("D")
    for c in ["us", "a1", "c1", "cx"]: R[c] = R[c].clip(-0.08, 0.08) * 100
    for c in ["a5", "c5"]: R[c] = R[c].clip(-0.2, 0.2) * 100
    R["t5hi"] = (R["p5"] >= 90).astype(float); R["t5lo"] = (R["p5"] <= 10).astype(float)
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "corr": R[["c1", "c5", "cx"]].corrwith(R["y1"]).round(3).to_dict(), "corr_c1_a1": round(float(R["c1"].corr(R["a1"])), 3)}
    base = ["us", "a1", "a5"]
    SETS = {"기존": base, "+c1": base + ["c1"], "+cx": base + ["cx"], "+c5": base + ["c5"], "+꼬리5": base + ["t5hi", "t5lo"]}
    for yv in ("y1", "y5"):
        rr = {}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            r = {"평소": brier(np.full(len(te), tr[yv].mean()), te[yv])}
            for lab, cols in SETS.items():
                w = fit(tr[cols].values, tr[yv].values); r[lab] = brier(pr(w, te[cols].values), te[yv]); r[lab + "_w"] = [round(float(v), 3) for v in w[len(base) + 1:]]
            rr[nm] = r
        wf = {k: [] for k in SETS}; ys = []
        for yr in range(2013, R.index[-1].year + 1):
            tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
            if len(tr) < 500 or not len(te): continue
            ys.append(te[yv].values)
            for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr[yv].values), te[cols].values))
        yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
        rr["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("앞", slice(0, h)), ("뒤", slice(h, n)), ("최근5년", slice(max(0, n - 1250), n)))}
        cells = {}
        for half, T in (("앞", A), ("뒤", B), ("최근5년", R[R.index >= R.index[-1] - pd.Timedelta(days=1826)])):
            cells[half] = {"평소": round(float(T[yv].mean()) * 100, 1)}
            for lab, m in (("c5≥90", T["p5"] >= 90), ("c5≤10", T["p5"] <= 10), ("c1≥90", T["p1"] >= 90), ("c1≤10", T["p1"] <= 10), ("cx≥+1", T["cx"] >= 1), ("cx≤−1", T["cx"] <= -1)):
                cells[half][lab] = [int(m.sum()), round(float(T.loc[m, yv].mean()) * 100, 1) if m.sum() else None]
        rr["칸"] = cells
        res[yv] = rr
    last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 2) for c in ["c1", "c5", "cx", "p1", "p5"]}}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
OUT["now"] = {"bask_last": str(bask.index[-1].date()), "c1": round(float(bask.iloc[-1]) * 100, 2), "c5": round(float(bask.iloc[-5:].sum()) * 100, 2)}
print("now", OUT["now"])
json.dump(OUT, open("probe/ccm_bt.json", "w"), ensure_ascii=False, indent=1)
