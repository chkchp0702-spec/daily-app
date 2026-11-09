"""#92 VKOSPI 5일 급등·급락 꼬리 → 코스피·닛케이·항셍 자체 다음 날·5일 — 확률 보강 11/9 15시 (Actions)
특성: P(그 나라 전날) 이하 마지막 VKOSPI 의 5일 변화(log) 1년 순위 → up=≥0.9 · dn=≤0.1.
기존 칸: 자기 지수 5일 등락 1년 순위 꼬리(≥0.9·≤0.1) · S&P 5일 꼬리(P 이전 마지막 미국 날) · VIX 5일 꼬리.
① 칸(다음 날·5일 상승 비율 − 평소, 앞/뒤 절반) ② 5일 간격 표본 ③ 교차 로지스틱(기존 vs 기존+up/dn) ④ 걸어가기(2014~) 앞/뒤·최근5년 브라이어.
y = 종가 D > 종가 P · y5 = 종가 D+4 > 종가 P."""
import json
import numpy as np, pandas as pd, requests, yfinance as yf
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
r = requests.get("https://ts-api.cnbc.com/harmony/app/bars/.KSVKOSPI/1D/20030101000000/20261110000000/adjusted/EST5EDT.json", headers=UA, timeout=40)
bars = r.json().get("barData", {}).get("priceBars", [])
vk = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
vk = vk[~vk.index.duplicated(keep="last")]; vk = vk[vk > 0]
print("VKOSPI", len(vk), vk.index[0].date(), vk.index[-1].date(), round(float(vk.iloc[-1]), 2))
vk5 = np.log(vk / vk.shift(5)); vkq = vk5.rolling(252, min_periods=200).rank(pct=True)
print("VKOSPI 5일 변화 순위 마지막 5:", vkq.tail(5).round(3).to_dict())
SY = ["^KS11", "^N225", "^HSI", "^GSPC", "^VIX"]
df = yf.download(SY, start="2007-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
spq = np.log(C["^GSPC"] / C["^GSPC"].shift(5)).rolling(252).rank(pct=True)
vxq = np.log(C["^VIX"] / C["^VIX"].shift(5)).rolling(252).rank(pct=True)
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
def last_le(s, d, maxgap=6):
    k = s.index.searchsorted(d, side="right") - 1
    if k < 0 or pd.isna(s.iloc[k]) or (d - s.index[k]).days > maxgap: return None
    return float(s.iloc[k])
BASE = ["own_hi", "own_lo", "sp_hi", "sp_lo", "vx_hi", "vx_lo"]
SETS = {"기존": BASE, "기존+up": BASE + ["up"], "기존+dn": BASE + ["dn"], "기존+up+dn": BASE + ["up", "dn"]}
OUT = {}
for mk, ix in (("KR", "^KS11"), ("JP", "^N225"), ("HK", "^HSI")):
    a = C[ix]; days = a.index; ownq = np.log(a / a.shift(5)).rolling(252).rank(pct=True)
    rows = []
    for i in range(260, len(days) - 4):
        D, P = days[i], days[i - 1]
        v = last_le(vkq, P); o = ownq.get(P)
        # 미국 날은 P 이전(아시아 P 종가 시점에 알려진 마지막 미국 종가 = P-1 미국)
        s = last_le(spq, P - pd.Timedelta(days=1), 5); x = last_le(vxq, P - pd.Timedelta(days=1), 5)
        if v is None or s is None or x is None or o is None or pd.isna(o): continue
        rows.append((D, v, o, s, x, int(a[D] > a[P]), int(a[days[i + 4]] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "v", "o", "s", "x", "y", "y5"]).set_index("D")
    R["up"] = (R.v >= 0.9).astype(float); R["dn"] = (R.v <= 0.1).astype(float)
    R["own_hi"] = (R.o >= 0.9).astype(float); R["own_lo"] = (R.o <= 0.1).astype(float)
    R["sp_hi"] = (R.s >= 0.9).astype(float); R["sp_lo"] = (R.s <= 0.1).astype(float)
    R["vx_hi"] = (R.x >= 0.9).astype(float); R["vx_lo"] = (R.x <= 0.1).astype(float)
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]; L5 = R.iloc[-1250:]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()),
           "겹침": {"up&own_lo": int((R.up * R.own_lo).sum()), "up&vx_hi": int((R.up * R.vx_hi).sum()), "up": int(R.up.sum()),
                   "dn&own_hi": int((R.dn * R.own_hi).sum()), "dn&vx_lo": int((R.dn * R.vx_lo).sum()), "dn": int(R.dn.sum())}}
    cells = {}
    for ycol in ("y", "y5"):
        for lab in ("up", "dn"):
            c = {}
            for seg, T in (("앞", A), ("뒤", B), ("최근5년", L5)):
                m = T[lab] == 1; c[seg] = [int(m.sum()), round(float(T.loc[m, ycol].mean() - T[ycol].mean()) * 100, 1) if m.sum() else None, round(float(T[ycol].mean()) * 100, 1)]
            # 기존 칸 안 겹친 날만(순수)
            for seg, T in (("앞순수", A), ("뒤순수", B)):
                m = (T[lab] == 1) & (T[BASE].sum(axis=1) == 0); c[seg] = [int(m.sum()), round(float(T.loc[m, ycol].mean() - T[ycol].mean()) * 100, 1) if m.sum() else None]
            if ycol == "y5":
                sp = []
                for st in range(5):
                    T = R.iloc[st::5]; h = T[T.index < mid]; g = T[T.index >= mid]
                    sp.append([round(float(h.loc[h[lab] == 1, "y5"].mean() - h.y5.mean()) * 100, 1) if (h[lab] == 1).sum() else None,
                               round(float(g.loc[g[lab] == 1, "y5"].mean() - g.y5.mean()) * 100, 1) if (g[lab] == 1).sum() else None, int((h[lab] == 1).sum()), int((g[lab] == 1).sum())])
                c["5일간격(앞,뒤,n앞,n뒤)"] = sp
            cells[f"{ycol}_{lab}"] = c
    res["칸(n, 차이%p, 평소%)"] = cells
    for ycol in ("y", "y5"):
        rr = {}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            q = {"평소": brier(np.full(len(te), tr[ycol].mean()), te[ycol])}
            for lab, cols in SETS.items():
                w = fit(tr[cols].values, tr[ycol].values); q[lab] = brier(pr(w, te[cols].values), te[ycol])
                if lab != "기존": q[lab + "_계수"] = [round(float(v), 3) for v in w[1 + len(BASE):]]
            rr[nm] = q
        wf = {k: [] for k in SETS}; ys = []
        for yr in range(2014, R.index[-1].year + 1):
            tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
            if ycol == "y5": tr = tr.iloc[:-4]
            if not len(te): continue
            ys.append(te[ycol].values)
            for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr[ycol].values), te[cols].values))
        yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
        rr["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2014~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근5년", slice(max(0, n - 1250), n)))}
        res[ycol] = rr
    last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 3) for c in ["v", "o", "s", "x"]}}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
