"""#15 검증: 중국·홍콩 닻(간밤 미국 + 미국 마감 뒤 선물, 개장 직전까지)에
「먼저 열린 일본·한국 첫 1시간 등락」을 더하면 그날 종가 방향 맞히기가 나아지나.
(중국·홍콩 개장 09:30 = 한국·일본 10:30 — 일본·한국은 이미 1시간 30분 거래)"""
import json
import numpy as np, pandas as pd, yfinance as yf
E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]
def dl(s, **k):
    x = yf.download(s, auto_adjust=False, progress=False, **k)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    return x
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def utc(s):
    i = pd.to_datetime(s.index); i = i.tz_localize("UTC") if i.tz is None else i
    s.index = i.tz_convert("UTC"); return s
def daily(sym):
    a = dl(sym, period="5y", interval="1d")["Close"].dropna(); a.index = pd.to_datetime(a.index).tz_localize(None).normalize()
    return a[~a.index.duplicated(keep="last")]
def logit_fit(X, y, l2=1.0, it=50):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)])
        w -= np.linalg.solve(H, g)
    return w
def lp(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
def bucket_rate(tr_x, tr_y, te_x, base):
    tb = np.digitize(tr_x, E9); eb = np.digitize(te_x, E9); out = []
    for b in eb:
        m = tb == b; n = int(m.sum()); out.append((float(tr_y[m].sum()) + 20 * base) / (n + 20))
    return np.array(out)
sp = daily("^GSPC"); spr = sp.pct_change()
es = utc(dl("ES=F", period="730d", interval="60m")["Close"].dropna())
H60 = {"JP": utc(dl("^N225", period="730d", interval="60m")["Close"].dropna()),
       "KR": utc(dl("^KS11", period="730d", interval="60m")["Close"].dropna())}
DD = {"JP": daily("^N225"), "KR": daily("^KS11")}
TZ = {"JP": "Asia/Tokyo", "KR": "Asia/Seoul"}
print("bars", len(es), {k: (len(v), str(v.index[0]), str(v.index[-1])) for k, v in H60.items()})
print("JP bar hours", sorted(set(H60["JP"].index.tz_convert("Asia/Tokyo").strftime("%H:%M")))[:12])
print("KR bar hours", sorted(set(H60["KR"].index.tz_convert("Asia/Seoul").strftime("%H:%M")))[:12])
def first_move(k, D, o):
    """D 날 아시아 k 의 전날 종가 → o 이전에 끝난 마지막 60분봉 종가 등락."""
    d = DD[k]; s = H60[k]
    loc = s.index.tz_convert(TZ[k]); sd = s[(loc.normalize().tz_localize(None) == D)]
    sd = sd[sd.index + pd.Timedelta(minutes=60) <= o]
    if not len(sd): return None
    prev = d[d.index < D]
    if not len(prev): return None
    return float(sd.iloc[-1] / prev.iloc[-1] - 1)
OUT = {}
for mk, (sym, tz) in {"CN": ("000001.SS", "Asia/Shanghai"), "HK": ("^HSI", "Asia/Hong_Kong")}.items():
    try:
        a = daily(sym); adays = list(a.index); rows = []
        for t in spr.index[spr.index >= es.index[0].tz_convert(None).normalize() - pd.Timedelta(days=3)]:
            if pd.isna(spr.get(t)): continue
            nx = [D for D in adays if D > t][:1]
            if not nx: continue
            D = nx[0]; i = adays.index(D)
            if i == 0 or adays[i - 1] > t: continue
            c16 = pd.Timestamp(t.strftime("%Y-%m-%d") + " 16:00", tz="America/New_York").tz_convert("UTC")
            o = pd.Timestamp(D.strftime("%Y-%m-%d") + " 09:30", tz=tz).tz_convert("UTC")
            pre = es[es.index + pd.Timedelta(minutes=60) <= c16]; aft = es[(es.index >= c16) & (es.index + pd.Timedelta(minutes=60) <= o)]
            if not len(pre) or not len(aft) or (c16 - (pre.index[-1] + pd.Timedelta(minutes=60))) > pd.Timedelta(hours=1): continue
            post = float(aft.iloc[-1] / pre.iloc[-1] - 1)
            jp = first_move("JP", D, o); kr = first_move("KR", D, o)
            rows.append((D, float(spr[t]), post, jp, kr, int(a[D] > a[adays[i - 1]])))
        R = pd.DataFrame(rows, columns=["D", "us", "post", "jp", "kr", "y"]).drop_duplicates("D")
        res = {"n_all": len(R), "jp_na": int(R["jp"].isna().sum()), "kr_na": int(R["kr"].isna().sum())}
        R = R.dropna(); R["anc"] = R["us"] + R["post"]
        R["asia"] = R[["jp", "kr"]].mean(axis=1)
        b = np.polyfit(R["anc"], R["asia"], 1); R["res"] = R["asia"] - np.polyval(b, R["anc"])
        res.update({"n": len(R), "corr_anc_asia": round(float(np.corrcoef(R["anc"], R["asia"])[0, 1]), 3),
                    "corr_res_y": round(float(np.corrcoef(R["res"], R["y"])[0, 1]), 3),
                    "corr_anc_y": round(float(np.corrcoef(R["anc"], R["y"])[0, 1]), 3), "beta": [round(float(v), 3) for v in b]})
        days = sorted(R["D"]); mid = days[len(days) // 2]; A, B = R[R["D"] < mid], R[R["D"] >= mid]
        res["split"] = str(mid.date())
        for nm, T in {"A": A, "B": B}.items():
            up, dn = T[T["res"] > 0.003], T[T["res"] < -0.003]
            res["cond_" + nm] = {"n_up": len(up), "y_up": round(float(up["y"].mean()), 3), "n_dn": len(dn), "y_dn": round(float(dn["y"].mean()), 3), "base": round(float(T["y"].mean()), 3)}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            y = te["y"].values; base = float(tr["y"].mean()); r = {"n": len(te), "base": round(brier(np.full(len(y), base), y), 4)}
            r["칸_anc"] = round(brier(bucket_rate(tr["anc"].values, tr["y"].values, te["anc"].values, base), y), 4)
            for lab, cols in {"로짓_anc": ["anc"], "로짓_anc+jp": ["anc", "jp"], "로짓_anc+kr": ["anc", "kr"], "로짓_anc+asia": ["anc", "asia"], "로짓_anc+res": ["anc", "res"]}.items():
                w = logit_fit(tr[cols].values * 100, tr["y"].values); q = lp(w, te[cols].values * 100)
                r[lab] = round(brier(q, y), 4); r["hit_" + lab] = round(float(np.mean((q > .5) == (y == 1))), 3)
                if lab == "로짓_anc+asia": r["w"] = [round(float(v), 3) for v in w]
            res[nm] = r
        OUT[mk] = res
    except Exception as e:
        import traceback; traceback.print_exc(); OUT[mk] = {"err": repr(e)[:300]}
print("EARLY_BT " + json.dumps(OUT, ensure_ascii=False))
