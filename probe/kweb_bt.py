"""#83 미 상장 중국 인터넷 ETF(KWEB) 초과 등락 → 홍콩·중국 다음 장 — 닻(간밤 S&P + EWH 초과) 위 — 확률 보강 일지 11/6 13시 (Actions)
옛 #77 틀 재사용: eu=KWEB 등락, ex=KWEB−S&P, exres=닻 특성으로 설명 안 된 나머지. 홍콩은 kx=KWEB−EWH 도.
#77 원래 설명: 유럽(STOXX 600) − S&P 같은 날 초과 등락 → 아시아 「다음 장」 방향 — 닻(간밤 S&P + 국가 ETF 초과, 한국은 +SOX) 위에 더해도 나아지나 — 확률 보강 일지 11/5 17시 (Actions)
아시아 D 장의 방향(종가 D > 종가 P) · 특성은 P~D 사이 마지막 미국 날 t: us=S&P 등락, etfx=국가 ETF 등락 − 아시아 P 등락, sx=SOX−S&P, eu=유럽 t 등락, ex=eu−us.
① 두 기간 교차 로지스틱 브라이어 ② 해마다 다시 맞추며 걸어가는 브라이어(2010~) ③ 칸: ex 잔차 ±1% 앞/뒤 상승 비율 ④ 지금 값."""
import json
import numpy as np, pandas as pd, yfinance as yf
SY = ["^KS11", "^N225", "^HSI", "000001.SS", "^GSPC", "^SOX", "EWY", "EWJ", "EWH", "KWEB", "FXI"]
df = yf.download(SY, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
print({s: (str(v.index[0].date()), str(v.index[-1].date()), len(v)) for s, v in C.items()})
EU = "KWEB"
print("유럽 지수:", EU)
spr = C["^GSPC"].pct_change(); sxr = C["^SOX"].pct_change(); eur = C[EU].pct_change()
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
OUT = {}
for mk, ix, etf in (("HK", "^HSI", "EWH"), ("CN", "000001.SS", None), ("KR", "^KS11", "EWY")):
    base = ["us"] + (["etfx"] if etf else []) + (["sx"] if mk == "KR" else [])
    SETS = {"닻": base, "닻+ex": base + ["ex"], "닻+exres": base + ["exres"], "닻+eu": base + ["eu"], "닻+kx": base + ["kx"]}
    a = C[ix]; E = C[etf].pct_change() if etf else None; ar = a.pct_change()
    us_d = spr.dropna().index
    rows = []
    days = a.index
    for i in range(2, len(days)):
        D, P = days[i], days[i - 1]
        j = us_d.searchsorted(D) - 1
        if j < 0: continue
        t = us_d[j]
        if t < P: continue
        if t not in eur.index or pd.isna(eur[t]) or t not in sxr.index or pd.isna(sxr[t]): continue
        ex_ = float(E[t] - ar[P]) if etf else 0.0
        if etf and (t not in E.index or pd.isna(E[t])): continue
        kx_ = float(eur[t] - (E[t] if etf else spr[t]))
        rows.append((D, float(spr[t]), ex_, float(sxr[t] - spr[t]), float(eur[t]), float(eur[t] - spr[t]), kx_, int(a[D] > a[P])))
    R = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "eu", "ex", "kx", "y"]).set_index("D")
    R = R[R.index >= "2013-09-01"]
    for c in ["us", "etfx", "sx", "eu", "ex", "kx"]: R[c] = R[c].clip(-0.08, 0.08) * 100
    b = np.linalg.lstsq(np.c_[np.ones(len(R)), R[base].values], R["ex"].values, rcond=None)[0]
    R["exres"] = R["ex"] - np.c_[np.ones(len(R)), R[base].values] @ b
    mid = R.index[len(R) // 2]; A, B = R[R.index < mid], R[R.index >= mid]
    res = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "corr_y": R[["us", "etfx", "sx", "eu", "ex", "exres", "kx"]].corrwith(R["y"]).round(3).to_dict(),
           "corr_ex_etfx": round(float(R["ex"].corr(R["etfx"])), 3), "corr_kx_etfx": round(float(R["kx"].corr(R["etfx"])), 3)}
    for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
        r = {"평소": brier(np.full(len(te), tr["y"].mean()), te["y"])}
        for lab, cols in SETS.items():
            w = fit(tr[cols].values, tr["y"].values); r[lab] = brier(pr(w, te[cols].values), te["y"]); r[lab + "_w"] = [round(float(v), 3) for v in w]
        res[nm] = r
    wf = {k: [] for k in SETS}; ys = []
    for yr in range(2017, R.index[-1].year + 1):
        tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
        if not len(te): continue
        ys.append(te["y"].values)
        for lab, cols in SETS.items(): wf[lab].append(pr(fit(tr[cols].values, tr["y"].values), te[cols].values))
    yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wf.items()}; n = len(yy); h = n // 2
    res["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2017~앞", slice(0, h)), ("뒤", slice(h, n)), ("최근3년", slice(max(0, n - 750), n)))}
    cells = {}
    for half, T in (("앞", A), ("뒤", B)):
        cells[half] = {"평소": round(float(T["y"].mean()) * 100, 1)}
        for lab, m in (("res≥+1", T["exres"] >= 1), ("res≤−1", T["exres"] <= -1), ("ex≥+1", T["ex"] >= 1), ("ex≤−1", T["ex"] <= -1), ("kx≥+1", T["kx"] >= 1), ("kx≤−1", T["kx"] <= -1)):
            cells[half][lab] = [int(m.sum()), round(float(T.loc[m, "y"].mean()) * 100, 1) if m.sum() else None]
    res["칸"] = cells
    last = R.iloc[-1]; res["지금"] = {"D": str(R.index[-1].date()), **{c: round(float(last[c]), 2) for c in ["us", "etfx", "eu", "ex", "exres", "kx"]}}
    print(mk, json.dumps(res, ensure_ascii=False)); OUT[mk] = res
t = spr.dropna().index[-1]
OUT["now"] = {"t": str(t.date()), "sp": round(float(spr[t]) * 100, 2), "eu": round(float(eur.get(t, np.nan)) * 100, 2), "eu_index": EU}
print("now", OUT["now"])
json.dump(OUT, open("probe/kweb_bt.json", "w"), ensure_ascii=False, indent=1)
