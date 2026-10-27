"""#12 검증: 한국·일본 「오늘 장 확률」 닻(간밤 미국 + 마감 뒤 ES 선물 + 국가 ETF 초과)에
CME 닛케이 선물(NKD=F) · 환율(KRW=X·JPY=X)의 「그 나라 마감 → 개장 직전」 등락을 더하면 나아지나.
같이: 시가 갭(시가/전일 종가−1)을 얼마나 설명하나(R²) — 🌙 개장 전 나침반용."""
import json
import numpy as np, pandas as pd, yfinance as yf
def dl(s, **k):
    x = yf.download(s, auto_adjust=False, progress=False, **k)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    return x
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def utc(s):
    i = pd.to_datetime(s.index); i = i.tz_localize("UTC") if i.tz is None else i
    s.index = i.tz_convert("UTC"); return s.sort_index()
def daily(sym, cols=("Close",)):
    a = dl(sym, period="5y", interval="1d")[list(cols)].dropna(); a.index = pd.to_datetime(a.index).tz_localize(None).normalize()
    return a[~a.index.duplicated(keep="last")]
def logit_fit(X, y, l2=1.0, it=50):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)])
        w -= np.linalg.solve(H, g)
    return w
def lp(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
def at(s, cut):
    """cut 이전에 끝난 마지막 60분봉 종가 (끝 시각과 cut 사이 3시간 넘게 비면 None)."""
    q = s[s.index + pd.Timedelta(minutes=60) <= cut]
    if not len(q) or cut - (q.index[-1] + pd.Timedelta(minutes=60)) > pd.Timedelta(hours=3): return None
    return float(q.iloc[-1])
sp = daily("^GSPC")["Close"]; spr = sp.pct_change()
I60 = {}
for s in ["ES=F", "NKD=F", "KRW=X", "JPY=X"]:
    try: I60[s] = utc(dl(s, period="730d", interval="60m")["Close"].dropna())
    except Exception as e: print("fail", s, e)
print("bars", {k: (len(v), str(v.index[0]), str(v.index[-1])) for k, v in I60.items()})
es = I60["ES=F"]
CFG = {"KR": ("^KS11", "EWY", "KRW=X", "Asia/Seoul", "15:30"), "JP": ("^N225", "EWJ", "JPY=X", "Asia/Tokyo", "15:30")}
OUT = {}
for mk, (ix, etf, fxs, tz, cls) in CFG.items():
    try:
        A = daily(ix, ("Open", "Close")); a = A["Close"]; E = daily(etf)["Close"].pct_change()
        days = list(a.index); rows = []
        for i in range(1, len(days)):
            D, P = days[i], days[i - 1]
            ts = [t for t in spr.index if P <= t < D and not pd.isna(spr[t])]
            if not ts: continue
            t = ts[-1]
            c16 = pd.Timestamp(t.strftime("%Y-%m-%d") + " 16:00", tz="America/New_York").tz_convert("UTC")
            o = pd.Timestamp(D.strftime("%Y-%m-%d") + " 09:00", tz=tz).tz_convert("UTC")
            pc = pd.Timestamp(P.strftime("%Y-%m-%d") + " " + cls, tz=tz).tz_convert("UTC")
            if o < es.index[0] + pd.Timedelta(days=2): continue
            e0, e1 = at(es, c16), at(es, o)
            if e0 is None or e1 is None: continue
            n0, n1 = at(I60["NKD=F"], pc), at(I60["NKD=F"], o)
            f0, f1 = at(I60[fxs], pc), at(I60[fxs], o)
            exr = float(E[t] - (a[P] / a[days[i - 2]] - 1)) if (i >= 2 and t in E.index and not pd.isna(E[t])) else np.nan
            rows.append((D, float(spr[t]), e1 / e0 - 1, exr, (n1 / n0 - 1) if n0 and n1 else np.nan,
                         (f1 / f0 - 1) if f0 and f1 else np.nan, float(A["Open"][D] / a[P] - 1), int(a[D] > a[P])))
        R = pd.DataFrame(rows, columns=["D", "us", "post", "etfx", "nkd", "fx", "gap", "y"])
        res = {"n_all": len(R), "na": R.isna().sum().to_dict()}
        R = R.dropna(); R["anc"] = R["us"] + R["post"]
        R = R[R["gap"].abs() > 1e-6]
        b = np.polyfit(R["anc"], R["nkd"], 1); R["nres"] = R["nkd"] - np.polyval(b, R["anc"])
        res.update({"n": len(R), "beta_nkd_anc": [round(float(v), 3) for v in b],
                    "corr": {c: round(float(np.corrcoef(R[c], R["y"])[0, 1]), 3) for c in ["anc", "etfx", "nkd", "nres", "fx", "gap"]},
                    "corr_gap": {c: round(float(np.corrcoef(R[c], R["gap"])[0, 1]), 3) for c in ["anc", "etfx", "nkd", "nres", "fx"]}})
        # 시가 갭 R²
        def r2(cols, T):
            X = np.c_[np.ones(len(T)), T[cols].values]; w = np.linalg.lstsq(X, T["gap"].values, rcond=None)[0]
            return round(1 - float(np.var(T["gap"].values - X @ w) / np.var(T["gap"].values)), 3)
        res["gapR2"] = {"+".join(c): r2(list(c), R) for c in [("anc",), ("anc", "etfx"), ("anc", "etfx", "nkd"), ("anc", "etfx", "fx"), ("nkd",), ("anc", "etfx", "nkd", "fx")]}
        ds = sorted(R["D"]); mid = ds[len(ds) // 2]; A_, B_ = R[R["D"] < mid], R[R["D"] >= mid]
        res["split"] = str(mid.date())
        for nm, T in {"A": A_, "B": B_}.items():
            up, dn = T[T["nres"] > 0.003], T[T["nres"] < -0.003]
            res["cond_" + nm] = {"n_up": len(up), "y_up": round(float(up["y"].mean()), 3), "n_dn": len(dn), "y_dn": round(float(dn["y"].mean()), 3), "base": round(float(T["y"].mean()), 3)}
        for nm, (tr, te) in {"앞→뒤": (A_, B_), "뒤→앞": (B_, A_)}.items():
            y = te["y"].values; r = {"n": len(te), "base": round(brier(np.full(len(y), tr["y"].mean()), y), 4)}
            for lab, cols in {"anc": ["anc"], "anc+etf": ["anc", "etfx"], "+nkd": ["anc", "etfx", "nkd"], "+nres": ["anc", "etfx", "nres"],
                              "+fx": ["anc", "etfx", "fx"], "+nkd+fx": ["anc", "etfx", "nkd", "fx"]}.items():
                w = logit_fit(tr[cols].values * 100, tr["y"].values); q = lp(w, te[cols].values * 100)
                r[lab] = round(brier(q, y), 4); r["w_" + lab] = [round(float(v), 3) for v in w]
            res[nm] = r
        OUT[mk] = res
    except Exception as e:
        import traceback; traceback.print_exc(); OUT[mk] = {"err": repr(e)[:300]}
print("GAP_BT " + json.dumps(OUT, ensure_ascii=False, default=str))
