"""#3 검증: 아시아 닻(간밤 S&P 종가 등락)에 「미국 마감(뉴욕 16:00) 뒤 ~ 아시아 개장 직전」 S&P 선물 등락을 더하면 나아지나."""
import json, math
import numpy as np, pandas as pd, yfinance as yf
E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]
MK = {"KR": ("^KS11", "Asia/Seoul", 900), "JP": ("^N225", "Asia/Tokyo", 900), "CN": ("000001.SS", "Asia/Shanghai", 930), "HK": ("^HSI", "Asia/Hong_Kong", 930)}
def dl(s, **k):
    x = yf.download(s, auto_adjust=False, progress=False, **k)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    return x
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
sp = dl("^GSPC", period="5y", interval="1d")["Close"].dropna(); sp.index = pd.to_datetime(sp.index).tz_localize(None).normalize()
spr = sp.pct_change()
es = dl("ES=F", period="730d", interval="60m")["Close"].dropna()
ei = pd.to_datetime(es.index); ei = ei.tz_localize("UTC") if ei.tz is None else ei
es.index = ei.tz_convert("UTC")
print("ES bars", len(es), es.index[0], es.index[-1])
OUT = {}
def bucket_rate(tr_x, tr_y, te_x, base):
    tb = np.digitize(tr_x, E9); eb = np.digitize(te_x, E9); out = []
    for b in eb:
        m = tb == b; n = int(m.sum()); out.append((float(tr_y[m].sum()) + 20 * base) / (n + 20))
    return np.array(out)
def logit_fit(X, y, l2=1.0, it=50):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)])
        w -= np.linalg.solve(H, g)
    return w
def logit_pred(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
for mk, (sym, tz, op) in MK.items():
    try:
        a = dl(sym, period="5y", interval="1d")["Close"].dropna(); a.index = pd.to_datetime(a.index).tz_localize(None).normalize()
        a = a[~a.index.duplicated(keep="last")]
        adays = list(a.index); rows = []
        for t in spr.index:
            if pd.isna(spr.get(t)): continue
            nxt = [D for D in adays if D > t][:1]
            if not nxt: continue
            D = nxt[0]; i = adays.index(D)
            if i == 0: continue
            prevD = adays[i - 1]
            if prevD > t: continue                       # 아시아 직전 거래일이 미국 t 뒤면(미국 휴장 등) 건너뜀
            c16 = pd.Timestamp(t.strftime("%Y-%m-%d") + " 16:00", tz="America/New_York").tz_convert("UTC")
            o = pd.Timestamp(D.strftime("%Y-%m-%d") + f" {op//100:02d}:{op%100:02d}", tz=tz).tz_convert("UTC")
            pre = es[(es.index + pd.Timedelta(minutes=60) <= c16)]
            aft = es[(es.index >= c16) & (es.index + pd.Timedelta(minutes=60) <= o)]
            if not len(pre) or not len(aft): continue
            if (c16 - (pre.index[-1] + pd.Timedelta(minutes=60))) > pd.Timedelta(hours=1): continue
            post = float(aft.iloc[-1] / pre.iloc[-1] - 1)
            rows.append((D, float(spr[t]), post, int(a[D] > a[prevD])))
        R = pd.DataFrame(rows, columns=["D", "us", "post", "y"]).drop_duplicates("D")
        days = sorted(R["D"]); mid = days[len(days) // 2]
        A, B = R[R["D"] < mid], R[R["D"] >= mid]
        res = {"n": len(R), "split": str(mid.date()), "post_sd": round(float(R["post"].std()) * 100, 3),
               "corr_post_y": round(float(np.corrcoef(R["post"], R["y"])[0, 1]), 3)}
        # 같은 간밤 미국 칸 안에서: 선물 마감 뒤 + vs −
        for nm, T in {"all": R, "A": A, "B": B}.items():
            up, dn = T[T["post"] > 0.002], T[T["post"] < -0.002]
            res["cond_" + nm] = {"n_up": len(up), "y_up": round(float(up["y"].mean()), 3) if len(up) else None,
                                  "n_dn": len(dn), "y_dn": round(float(dn["y"].mean()), 3) if len(dn) else None,
                                  "base": round(float(T["y"].mean()), 3)}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            base = float(tr["y"].mean()); y = te["y"].values
            p0 = bucket_rate(tr["us"].values, tr["y"].values, te["us"].values, base)
            p1 = bucket_rate((tr["us"] + tr["post"]).values, tr["y"].values, (te["us"] + te["post"]).values, base)
            w0 = logit_fit(tr[["us"]].values * 100, tr["y"].values); w1 = logit_fit(tr[["us", "post"]].values * 100, tr["y"].values)
            q0 = logit_pred(w0, te[["us"]].values * 100); q1 = logit_pred(w1, te[["us", "post"]].values * 100)
            res[nm] = {"n": len(te), "brier_base": round(brier(np.full(len(y), base), y), 4),
                       "칸_us": round(brier(p0, y), 4), "칸_us+post": round(brier(p1, y), 4),
                       "로짓_us": round(brier(q0, y), 4), "로짓_us+post": round(brier(q1, y), 4),
                       "hit_us": round(float(np.mean((p0 > .5) == (y == 1))), 3), "hit_us+post": round(float(np.mean((p1 > .5) == (y == 1))), 3),
                       "w_post": [round(float(v), 3) for v in w1]}
        OUT[mk] = res
    except Exception as e:
        OUT[mk] = {"err": repr(e)[:300]}
print("POST_BT " + json.dumps(OUT, ensure_ascii=False))
