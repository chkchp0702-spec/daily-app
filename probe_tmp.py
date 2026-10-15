"""#4 검증: 한국 닻(간밤 S&P)에 ① EWY(미국 상장 한국 ETF)의 코스피 마감 뒤 초과 등락 ② 밤사이 원달러를 더하면 나아지나."""
import json
import numpy as np, pandas as pd, yfinance as yf
E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]
def dl(s, **k):
    x = yf.download(s, auto_adjust=False, progress=False, **k)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    return x
def d1(s):
    c = dl(s, period="max", interval="1d")["Close"].dropna(); c.index = pd.to_datetime(c.index).tz_localize(None).normalize()
    return c[~c.index.duplicated(keep="last")]
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def bucket_rate(tr_x, tr_y, te_x, base):
    tb = np.digitize(tr_x, E9); out = []
    for b in np.digitize(te_x, E9):
        m = tb == b; out.append((float(tr_y[m].sum()) + 20 * base) / (int(m.sum()) + 20))
    return np.array(out)
def logit_fit(X, y, l2=1.0, it=50):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)])
        w -= np.linalg.solve(H, g)
    return w
def lp(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
def lg(p): p = np.clip(p, 1e-4, 1 - 1e-4); return np.log(p / (1 - p))
sp, ks, ewy, krw = d1("^GSPC"), d1("^KS11"), d1("EWY"), d1("KRW=X")
spr, ksr, ewr, kwr = sp.pct_change(), ks.pct_change(), ewy.pct_change(), krw.pct_change()
kd = list(ks.index); rows = []
for t in spr.index[spr.index >= "2012-01-01"]:
    if pd.isna(spr.get(t)) or pd.isna(ewr.get(t)): continue
    nx = ks.index[ks.index > t]
    if not len(nx): continue
    D = nx[0]; i = kd.index(D)
    if i < 2 or kd[i - 1] > t: continue
    P = kd[i - 1]
    rows.append((D, float(spr[t]), float(ewr[t]), float(ksr[P]), float(kwr.get(t, np.nan)), int(ks[D] > ks[P])))
R = pd.DataFrame(rows, columns=["D", "us", "ewy", "ksP", "krw", "y"]).drop_duplicates("D").dropna()
R["ewyx"] = R["ewy"] - R["ksP"]          # EWY 등락 중 코스피 그날 장에 이미 반영된 몫을 뺀 것 ≈ 코스피 마감 뒤 소식
OUT = {"n": len(R), "corr": {c: round(float(np.corrcoef(R[c], R["y"])[0, 1]), 3) for c in ["us", "ewy", "ewyx", "krw"]}}
mid = R["D"].iloc[len(R) // 2]; A, B = R[R["D"] < mid], R[R["D"] >= mid]; OUT["split"] = str(mid.date())
for nm, T in {"all": R, "A": A, "B": B}.items():
    up, dn = T[T["ewyx"] > 0.005], T[T["ewyx"] < -0.005]
    OUT["ewyx_" + nm] = {"up_n": len(up), "up_y": round(float(up["y"].mean()), 3), "dn_n": len(dn), "dn_y": round(float(dn["y"].mean()), 3), "base": round(float(T["y"].mean()), 3)}
    # 같은 간밤 S&P 칸(약보합 ±0.2~0.5%) 안에서도 갈리나
for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
    y = te["y"].values; base = float(tr["y"].mean()); r = {"n": len(te)}
    p0 = bucket_rate(tr["us"].values, tr["y"].values, te["us"].values, base)
    p0tr = bucket_rate(tr["us"].values, tr["y"].values, tr["us"].values, base)
    r["칸_us"] = round(brier(p0, y), 4); r["hit_us"] = round(float(np.mean((p0 > .5) == (y == 1))), 3)
    for lab, cols in {"ewyx": ["ewyx"], "ewy": ["ewy"], "krw": ["krw"], "ewyx+krw": ["ewyx", "krw"]}.items():
        Xtr = np.c_[lg(p0tr), tr[cols].values * 100]; Xte = np.c_[lg(p0), te[cols].values * 100]
        w = logit_fit(Xtr, tr["y"].values); q = lp(w, Xte)
        r["칸_us+" + lab] = round(brier(q, y), 4); r["hit_" + lab] = round(float(np.mean((q > .5) == (y == 1))), 3); r["w_" + lab] = [round(float(v), 3) for v in w]
    p2 = bucket_rate(tr["ewy"].values, tr["y"].values, te["ewy"].values, base)
    r["칸_ewy만"] = round(brier(p2, y), 4)
    OUT[nm] = r
# 밤사이 원달러(60분봉 2년): 코스피 마감 15:30 → 다음 날 08:30 KST
try:
    k = dl("KRW=X", period="730d", interval="60m")["Close"].dropna()
    ki = pd.to_datetime(k.index); k.index = (ki.tz_localize("UTC") if ki.tz is None else ki).tz_convert("Asia/Seoul")
    R2 = R[R["D"] >= k.index[0].tz_localize(None).normalize() + pd.Timedelta(days=3)].copy(); on = []
    for D in R2["D"]:
        P = kd[kd.index(D) - 1]
        a = k[k.index <= pd.Timestamp(P.strftime("%Y-%m-%d") + " 15:30", tz="Asia/Seoul")]
        b = k[k.index <= pd.Timestamp(D.strftime("%Y-%m-%d") + " 08:30", tz="Asia/Seoul")]
        on.append(float(b.iloc[-1] / a.iloc[-1] - 1) if len(a) and len(b) and b.index[-1] > a.index[-1] else np.nan)
    R2["kon"] = on; R2 = R2.dropna()
    m2 = R2["D"].iloc[len(R2) // 2]; A2, B2 = R2[R2["D"] < m2], R2[R2["D"] >= m2]; O2 = {"n": len(R2), "split": str(m2.date()), "corr_kon_y": round(float(np.corrcoef(R2["kon"], R2["y"])[0, 1]), 3), "corr_kon_us": round(float(np.corrcoef(R2["kon"], R2["us"])[0, 1]), 3)}
    for nm, (tr, te) in {"앞→뒤": (A2, B2), "뒤→앞": (B2, A2)}.items():
        Lt = R[~R["D"].isin(set(te["D"]))]; base = float(Lt["y"].mean()); y = te["y"].values
        p0 = bucket_rate(Lt["us"].values, Lt["y"].values, te["us"].values, base); p0tr = bucket_rate(Lt["us"].values, Lt["y"].values, tr["us"].values, base)
        r = {"n": len(te), "칸_us": round(brier(p0, y), 4)}
        for lab, cols in {"kon": ["kon"], "ewyx": ["ewyx"], "ewyx+kon": ["ewyx", "kon"]}.items():
            w = logit_fit(np.c_[lg(p0tr), tr[cols].values * 100], tr["y"].values); q = lp(w, np.c_[lg(p0), te[cols].values * 100])
            r[lab] = round(brier(q, y), 4); r["w_" + lab] = [round(float(v), 3) for v in w]
        O2[nm] = r
    OUT["krw_on"] = O2
except Exception as e:
    OUT["krw_on"] = {"err": repr(e)[:300]}
print("KR4_BT " + json.dumps(OUT, ensure_ascii=False))
