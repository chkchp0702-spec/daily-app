"""🎲 10/28 #22 검증: 장중 모멘텀(Gao·Han·Li·Zhou 2018) — 첫 1시간 등락 → 마지막 구간 방향 · 「오늘 종가 확률」 개선?
야후 60분봉(약 730일). 날마다: r1 = 어제 종가→첫 봉 종가(간밤 포함, 논문 방식) · r1x = 첫 봉 시가→첫 봉 종가(장중만) ·
스냅 = 끝에서 둘째 봉 종가(미국 15:30) · rL = 스냅→종가(마지막 구간).
(a) 칸: P(rL>0 | r1>0) vs | r1<0 — 앞/뒤 절반. (b) 스냅 시각 종가>어제 확률: 로지스틱 [z] vs [z, r1/σ] 앞→뒤·뒤→앞 브라이어."""
import json, math
import numpy as np, pandas as pd, yfinance as yf
MK = {"US": ("^GSPC", "America/New_York"), "KR": ("^KS11", "Asia/Seoul"), "JP": ("^N225", "Asia/Tokyo"),
      "HK": ("^HSI", "Asia/Hong_Kong"), "CN": ("000001.SS", "Asia/Shanghai")}
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def fit(X, y, it=300, lam=1e-3):
    X = np.column_stack([np.ones(len(X)), X]); w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + lam * w
        H = (X.T * (p * (1 - p))) @ X / len(y) + lam * np.eye(len(w)); w -= np.linalg.solve(H, g)
    return w
def pred(w, X): X = np.column_stack([np.ones(len(X)), X]); return 1 / (1 + np.exp(-X @ w))
OUT = {}
for mk, (sym, tz) in MK.items():
    try:
        dd = yf.download(sym, period="5y", interval="1d", auto_adjust=False, progress=False)
        hh = yf.download(sym, period="730d", interval="60m", auto_adjust=False, progress=False)
        for d in (dd, hh):
            if isinstance(d.columns, pd.MultiIndex): d.columns = d.columns.get_level_values(0)
        dc = dd["Close"].dropna(); dc.index = pd.to_datetime(dc.index).tz_localize(None).normalize()
        dc = dc[~dc.index.duplicated(keep="last")]
        sig = np.log(dc).diff().rolling(20).std().shift(1); prev = dc.shift(1)
        h = hh[["Open", "Close"]].dropna().copy(); idx = pd.to_datetime(h.index)
        if idx.tz is None: idx = idx.tz_localize("UTC")
        h.index = idx.tz_convert(tz); h["day"] = [pd.Timestamp(t.date()) for t in h.index]
        nb = h.groupby("day").size(); full = int(nb.mode().iloc[0])
        rows = []
        for day, g in h.groupby("day"):
            if len(g) != full or full < 4 or day not in dc.index: continue
            pv, s = prev.get(day), sig.get(day)
            if pd.isna(pv) or pd.isna(s) or s <= 0: continue
            c1, o1, cs, cl = float(g["Close"].iloc[0]), float(g["Open"].iloc[0]), float(g["Close"].iloc[-2]), float(dc[day])
            rows.append((day, math.log(c1 / pv), math.log(c1 / o1), math.log(cs / pv), math.log(cl / cs), float(s), int(cl > pv)))
        R = pd.DataFrame(rows, columns=["day", "r1", "r1x", "chs", "rL", "sig", "y"])
        R["z"] = R["chs"] / R["sig"]; R["a"] = R["r1"] / R["sig"]; R["ax"] = R["r1x"] / R["sig"]
        mid = R["day"].iloc[len(R) // 2]; A, B = R[R["day"] < mid], R[R["day"] >= mid]
        res = {"n": len(R), "bars": full, "split": str(mid.date()), "first": str(R["day"].iloc[0].date())}
        for nm, T in {"앞": A, "뒤": B, "전체": R}.items():
            up = T[T["r1"] > 0]; dn = T[T["r1"] < 0]; upx = T[T["r1x"] > 0]; dnx = T[T["r1x"] < 0]
            res["칸_" + nm] = {"base": round(float((T["rL"] > 0).mean()), 3),
                "r1+": [len(up), round(float((up["rL"] > 0).mean()), 3)], "r1-": [len(dn), round(float((dn["rL"] > 0).mean()), 3)],
                "r1x+": [len(upx), round(float((upx["rL"] > 0).mean()), 3)], "r1x-": [len(dnx), round(float((dnx["rL"] > 0).mean()), 3)],
                "corr_r1_rL": round(float(np.corrcoef(T["r1"], T["rL"])[0, 1]), 3),
                "corr_r1x_rL": round(float(np.corrcoef(T["r1x"], T["rL"])[0, 1]), 3)}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            o = {}
            for k, cols in {"z": ["z"], "z+r1": ["z", "a"], "z+r1x": ["z", "ax"]}.items():
                w = fit(tr[cols].values, tr["y"].values.astype(float))
                o[k] = round(brier(pred(w, te[cols].values), te["y"].values), 5)
                if k != "z": o[k + "_coef"] = round(float(w[-1]), 3)
            res[nm] = o
        OUT[mk] = res
    except Exception as e:
        OUT[mk] = {"err": repr(e)[:300]}
print("IMOM_BT " + json.dumps(OUT, ensure_ascii=False))
