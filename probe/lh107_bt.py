"""#107 미국 장 마지막 30분·90분 등락 → 아시아 다음 장(닻 위) — 확률 보강 일지 11/13 10시 (Actions)
Gao·Han·Li·Zhou 2018 「Market Intraday Momentum」 마지막 30분. 야후 60분봉 730일(^GSPC·ES=F) + 일봉.
닻 = 간밤 S&P 등락 + 국가 ETF 초과(한·일·홍) + SOX 초과(한국) + 미국 마감 뒤 개장 직전까지 ES 선물 등락.
① 두 기간 교차 로지스틱 브라이어 ② 세 토막 걸어가기 ③ 잔차 칸(상위·하위 30%) ④ 미국 자체 다음 날."""
import json
import numpy as np, pandas as pd, yfinance as yf
H = {}
for s in ("^GSPC", "ES=F"):
    h = yf.download(s, period="730d", interval="60m", auto_adjust=False, progress=False)
    if isinstance(h.columns, pd.MultiIndex): h.columns = h.columns.get_level_values(0)
    h.index = pd.to_datetime(h.index); h.index = h.index.tz_convert("UTC") if h.index.tz is not None else h.index.tz_localize("UTC")
    H[s] = h["Close"].dropna(); print(s, H[s].index[0], H[s].index[-1], len(H[s]))
SY = ["^KS11", "^N225", "^HSI", "000001.SS", "^GSPC", "^SOX", "EWY", "EWJ", "EWH"]
df = yf.download(SY, period="4y", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
spr = C["^GSPC"].pct_change(); sxr = C["^SOX"].pct_change()
# 미국 날별 마지막 30·90분
g = H["^GSPC"]; gl = g.copy(); gl.index = gl.index.tz_convert("America/New_York")
LH = {}
for d, x in gl.groupby(gl.index.date):
    hm = {(t.hour, t.minute): v for t, v in x.items()}
    if (15, 30) not in hm or (14, 30) not in hm or (13, 30) not in hm: continue
    cls = float(C["^GSPC"].get(pd.Timestamp(d), np.nan))
    if np.isnan(cls): continue
    close_utc = pd.Timestamp(d).tz_localize("America/New_York") + pd.Timedelta(hours=16)
    LH[pd.Timestamp(d)] = (cls / hm[(14, 30)] - 1, cls / hm[(13, 30)] - 1, close_utc.tz_convert("UTC"))
print("마지막 시간 날 수", len(LH))
es = H["ES=F"]; es_end = es.copy(); es_end.index = es_end.index + pd.Timedelta(hours=1)
def es_at(T):
    i = es_end.index.searchsorted(T, side="right") - 1
    return float(es_end.iloc[i]) if i >= 0 and (T - es_end.index[i]) < pd.Timedelta(hours=3) else np.nan
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); gg = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        Hh = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(Hh, gg)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
OPEN = {"KR": (0, 0), "JP": (0, 0), "HK": (1, 30), "CN": (1, 30)}  # 개장 UTC
OUT = {}
lh_days = pd.DatetimeIndex(sorted(LH))
for mk, ix, etf in (("KR", "^KS11", "EWY"), ("JP", "^N225", "EWJ"), ("HK", "^HSI", "EWH"), ("CN", "000001.SS", None), ("US", "^GSPC", None)):
    a = C[ix]; ar = a.pct_change(); E = C[etf].pct_change() if etf else None
    rows = []
    for i in range(2, len(a.index)):
        D, P = a.index[i], a.index[i - 1]
        if mk == "US": t = P
        else:
            j = lh_days.searchsorted(D) - 1
            if j < 0: continue
            t = lh_days[j]
            if t < P: continue
        if t not in LH or t not in spr.index or pd.isna(spr[t]): continue
        l30, l90, cu = LH[t]
        if mk == "US": post = 0.0
        else:
            h0, m0 = OPEN[mk]; T = pd.Timestamp(D.date()).tz_localize("UTC") + pd.Timedelta(hours=h0, minutes=m0)
            e0, e1 = es_at(cu), es_at(T)
            if np.isnan(e0) or np.isnan(e1): continue
            post = e1 / e0 - 1
        ex_ = float(E.get(t, np.nan) - ar[P]) if etf else 0.0
        if np.isnan(ex_): continue
        sx = float(sxr.get(t, np.nan) - spr[t])
        if np.isnan(sx): sx = 0.0
        rows.append((D, float(spr[t]), ex_, sx, post, l30, l90, int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "post", "l30", "l90", "y"]).set_index("D")
    for c in ["us", "etfx", "sx", "post", "l30", "l90"]: R[c] = R[c].clip(-0.08, 0.08) * 100
    base = ["us"] + (["etfx"] if etf else []) + (["sx"] if mk == "KR" else []) + (["post"] if mk != "US" else [])
    for c in ("l30", "l90"):
        b = np.linalg.lstsq(np.c_[np.ones(len(R)), R[base].values], R[c].values, rcond=None)[0]
        R[c + "r"] = R[c] - np.c_[np.ones(len(R)), R[base].values] @ b
    SETS = {"닻": base, "+l30": base + ["l30"], "+l90": base + ["l90"], "+l30r": base + ["l30r"], "+l90r": base + ["l90r"]}
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "corr_y": R[["us", "post", "l30", "l90", "l30r", "l90r"]].corrwith(R["y"]).round(3).to_dict(),
           "corr_l30_post": round(float(R["l30"].corr(R["post"])), 3) if mk != "US" else None}
    for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
        r = {"평소": brier(np.full(len(te), tr["y"].mean()), te["y"])}
        for lab, cols in SETS.items():
            w = fit(tr[cols].values, tr["y"].values); r[lab] = brier(pr(w, te[cols].values), te["y"]); r[lab + "_w"] = [round(float(v), 3) for v in w]
        res[nm] = r
    n = len(R); cut = [int(n * 0.4), int(n * 0.6), int(n * 0.8), n]; wk = {}
    for k in range(3):
        tr, te = R.iloc[:cut[k]], R.iloc[cut[k]:cut[k + 1]]
        wk[f"토막{k+1}"] = {lab: brier(pr(fit(tr[cols].values, tr["y"].values), te[cols].values), te["y"]) for lab, cols in SETS.items()}
    res["걸어가기"] = wk
    cells = {}
    for half, T in (("앞", A), ("뒤", B)):
        q7, q3 = R["l30r"].quantile(0.7), R["l30r"].quantile(0.3)
        cells[half] = {"평소": round(float(T["y"].mean()) * 100, 1)}
        for lab, m in (("l30r상위30", T["l30r"] >= q7), ("l30r하위30", T["l30r"] <= q3), ("l30≥+0.3", T["l30"] >= 0.3), ("l30≤−0.3", T["l30"] <= -0.3)):
            cells[half][lab] = [int(m.sum()), round(float(T.loc[m, "y"].mean()) * 100, 1) if m.sum() else None]
    res["칸"] = cells
    last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 3) for c in ["us", "post", "l30", "l90", "l30r"]}}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
t = lh_days[-1]; OUT["now"] = {"t": str(t.date()), "l30": round(LH[t][0] * 100, 3), "l90": round(LH[t][1] * 100, 3)}
print("now", OUT["now"])
json.dump(OUT, open("probe/lh107_bt.json", "w"), ensure_ascii=False, indent=1)
