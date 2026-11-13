"""#108 간밤 S&P 큰 움직임(±1.5%↑) 뒤 아시아 과잉/과소 반응 — 확률 보강 일지 11/13 12시 (Actions)
https://ideas.repec.org/a/eee/empfin/v17y2010i3p428-440.html
지금 닻 = 간밤 S&P 9칸(LEAD_E9, 사전 20) + 국가 ETF 초과(선형). 꼬리 날(|S&P|≥1.5%)에서 칸 확률이 실제와 어긋나는지,
칸 안 크기(꼬리 초과분) · 포화(tanh) 항을 더하면 두 기간·걸어가기 브라이어가 좋아지는지."""
import json
import numpy as np, pandas as pd, yfinance as yf
E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]; PRI = 20
SY = ["^KS11", "^N225", "^HSI", "000001.SS", "^GSPC", "EWY", "EWJ", "EWH"]
df = yf.download(SY, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
spr = C["^GSPC"].pct_change().dropna(); usd = spr.index
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, off, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-(X @ w + off))); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        Hh = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(Hh, g)
    return w
def pr(w, X, off): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w + off)))
def lg(p): p = np.clip(p, 1e-4, 1 - 1e-4); return np.log(p / (1 - p))
def bucket_p(tr, te):
    b_tr = np.digitize(tr["us"].values / 100, E9); b_te = np.digitize(te["us"].values / 100, E9); base = tr["y"].mean()
    rate = {k: (tr["y"].values[b_tr == k].sum() + PRI * base) / ((b_tr == k).sum() + PRI) for k in range(9)}
    return np.array([rate[k] for k in b_te])
OUT = {}
for mk, ix, etf in (("KR", "^KS11", "EWY"), ("JP", "^N225", "EWJ"), ("HK", "^HSI", "EWH"), ("CN", "000001.SS", None)):
    a = C[ix]; ar = a.pct_change(); E = C[etf].pct_change() if etf else None; rows = []
    for i in range(2, len(a.index)):
        D, P = a.index[i], a.index[i - 1]
        j = usd.searchsorted(D) - 1
        if j < 0: continue
        t = usd[j]
        if t < P: continue
        ex_ = float(E.get(t, np.nan) - ar[P]) if etf else 0.0
        if np.isnan(ex_): ex_ = 0.0
        rows.append((D, float(spr[t]), ex_, int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "y"]).set_index("D")
    R["us"] = R["us"].clip(-0.1, 0.1) * 100; R["etfx"] = R["etfx"].clip(-0.08, 0.08) * 100
    R["tail"] = np.sign(R["us"]) * np.maximum(R["us"].abs() - 1.5, 0)   # 칸 밖 크기
    R["sat"] = np.tanh(R["us"] / 1.5)
    R["big"] = (R["us"].abs() >= 1.5).astype(float) * np.sign(R["us"])
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    SETS = {"칸": [], "칸+etf": ["etfx"], "칸+etf+tail": ["etfx", "tail"], "칸+etf+big": ["etfx", "big"], "선형us+etf": None, "포화sat+etf": None}
    def run(tr, te):
        r = {"평소": brier(np.full(len(te), tr["y"].mean()), te["y"])}
        otr, ote = lg(bucket_p(tr, tr)), lg(bucket_p(tr, te))
        for lab, cols in SETS.items():
            if cols is None:
                cc = ["us", "etfx"] if lab.startswith("선형") else ["sat", "etfx"]
                w = fit(tr[cc].values, tr["y"].values, np.zeros(len(tr))); p = pr(w, te[cc].values, np.zeros(len(te)))
            elif not cols:
                p = bucket_p(tr, te); w = []
            else:
                w = fit(tr[cols].values, tr["y"].values, otr); p = pr(w, te[cols].values, ote)
            r[lab] = brier(p, te["y"]); r[lab + "_w"] = [round(float(v), 3) for v in w]
            if lab == "칸+etf":
                tm = te["us"].abs() >= 1.5
                r["꼬리날"] = {"n": int(tm.sum()), "실제": round(float(te.loc[tm, "y"].mean()) * 100, 1), "칸+etf예측": round(float(p[tm.values].mean()) * 100, 1)}
                for sg, mm in (("+", te["us"] >= 1.5), ("−", te["us"] <= -1.5)):
                    r["꼬리" + sg] = [int(mm.sum()), round(float(te.loc[mm, "y"].mean()) * 100, 1), round(float(p[mm.values].mean()) * 100, 1)]
                for sg, mm in (("+2", te["us"] >= 2.5), ("−2", te["us"] <= -2.5)):
                    r["큰꼬리" + sg] = [int(mm.sum()), round(float(te.loc[mm, "y"].mean()) * 100, 1), round(float(p[mm.values].mean()) * 100, 1)]
        return r
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "앞→뒤": run(A, B), "뒤→앞": run(B, A)}
    n = len(R); cut = [int(n * 0.4), int(n * 0.6), int(n * 0.8), n]; wk = {}
    for k in range(3):
        rr = run(R.iloc[:cut[k]], R.iloc[cut[k]:cut[k + 1]]); wk[f"토막{k+1}"] = {kk: v for kk, v in rr.items() if not kk.endswith("_w") and not kk.startswith("꼬리") and not kk.startswith("큰")}
    res["걸어가기"] = wk
    rec = R[R.index >= R.index[-1] - pd.Timedelta(days=365 * 5)]; old = R[R.index < rec.index[0]]
    rr = run(old, rec); res["최근5년"] = {kk: v for kk, v in rr.items() if not kk.endswith("_w")}
    res["지금"] = {"D": str(R.index[-1].date()), "us": round(float(R["us"].iloc[-1]), 3)}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
json.dump(OUT, open("probe/os108_bt.json", "w"), ensure_ascii=False, indent=1)
