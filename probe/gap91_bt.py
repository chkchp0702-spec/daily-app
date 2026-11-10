"""🎲 11/10 #91 검증: 중국 「시가 갭 +1%↑ → 그날 낮 되돌림」을 장중 닻(오늘 종가가 어제보다 높을 확률)에 더할지.
지금 중국 장중 닻 = Φ(지금 등락 ÷ (하루 흔들림 × √남은 시간 비율)) — 갭과 장중 움직임을 같은 무게로 봄.
(A) 일봉 2000~: 개장 스냅(지금 등락 = 갭, 남은 시간 1) → y = 종가>어제. 닻 그대로 vs 닻 로짓 + b·특성(갭≥+1% / 갭≤−1% / 양의 갭 z)
    앞→뒤·뒤→앞(2013 기준) 브라이어 + 최근5년 + 칸(갭≥+1% 날 실제 비율 vs 닻 평균).
(B) 60분봉 730일: 각 봉 종가 스냅마다 같은 비교(지금 등락 = 갭 + 장중) — 그 시각에도 「갭 몫」이 덜 믿을 만한지."""
import json, math
import numpy as np, pandas as pd, yfinance as yf
from statistics import NormalDist
N = NormalDist()
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def lg(p): p = np.clip(p, 1e-4, 1 - 1e-4); return np.log(p / (1 - p))
def fit_off(off, X, y, it=100, lam=1e-3):
    X = np.column_stack([np.ones(len(X)), X]); w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-(off + X @ w))); g = X.T @ (p - y) / len(y) + lam * w
        H = (X.T * (p * (1 - p))) @ X / len(y) + lam * np.eye(len(w)); w -= np.linalg.solve(H, g)
    return w
def pr_off(w, off, X): X = np.column_stack([np.ones(len(X)), X]); return 1 / (1 + np.exp(-(off + X @ w)))
def dl(sym, **k):
    d = yf.download(sym, auto_adjust=False, progress=False, **k)
    if isinstance(d.columns, pd.MultiIndex): d.columns = d.columns.get_level_values(0)
    return d
OUT = {}
def evaluate(R, split, tag):
    R = R.dropna().copy(); R["pa"] = [N.cdf(z) for z in R["z"]]; R["off"] = lg(R["pa"].values)
    R["up1"] = (R["gap"] >= 0.01).astype(float); R["dn1"] = (R["gap"] <= -0.01).astype(float)
    R["gpos"] = np.maximum(R["gz"], 0); R["gneg"] = np.minimum(R["gz"], 0)
    A, B = R[R["day"] < split], R[R["day"] >= split]; L5 = R[R["day"] >= R["day"].max() - pd.Timedelta(days=1826)]
    res = {"n": len(R), "nA": len(A), "nB": len(B), "split": str(split.date())}
    for nm, T in {"앞": A, "뒤": B, "최근5년": L5}.items():
        c = {"base": round(float(T["y"].mean()), 3), "닻브라이어": round(brier(T["pa"], T["y"]), 5)}
        for k in ("up1", "dn1"):
            S = T[T[k] == 1]
            c[k] = [len(S), round(float(S["y"].mean()), 3) if len(S) else None, round(float(S["pa"].mean()), 3) if len(S) else None]
        res["칸_" + nm] = c
    feats = {"절편만": [], "up1": ["up1"], "dn1": ["dn1"], "up1+dn1": ["up1", "dn1"], "gpos": ["gpos"], "gpos+gneg": ["gpos", "gneg"], "z재보정": ["z"]}
    for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
        o = {"닻": round(brier(te["pa"], te["y"]), 5)}
        for k, cols in feats.items():
            X = tr[cols].values if cols else np.zeros((len(tr), 0)); Xt = te[cols].values if cols else np.zeros((len(te), 0))
            w = fit_off(tr["off"].values, X, tr["y"].values.astype(float))
            o[k] = round(brier(pr_off(w, te["off"].values, Xt), te["y"].values), 5); o[k + "_w"] = [round(float(v), 3) for v in w]
        res[nm] = o
    # 걸어가기(2008~ 해마다 다시 맞춤) up1 · gpos
    yrs = sorted(set(R["day"].dt.year)); wk = {"닻": [], "up1": [], "gpos": [], "y": [], "day": []}
    for yv in yrs:
        tr = R[R["day"].dt.year < yv]; te = R[R["day"].dt.year == yv]
        if len(tr) < 500 or not len(te): continue
        for k in ("up1", "gpos"):
            w = fit_off(tr["off"].values, tr[[k]].values, tr["y"].values.astype(float)); wk[k] += list(pr_off(w, te["off"].values, te[[k]].values))
        wk["닻"] += list(te["pa"]); wk["y"] += list(te["y"]); wk["day"] += list(te["day"])
    if wk["y"]:
        W = pd.DataFrame(wk)
        for nm, T in {"앞": W[W["day"] < split], "뒤": W[W["day"] >= split], "최근5년": W[W["day"] >= W["day"].max() - pd.Timedelta(days=1826)]}.items():
            res["걸어가기_" + nm] = {k: round(brier(T[k], T["y"]), 5) for k in ("닻", "up1", "gpos")} | {"n": len(T)}
    OUT[tag] = res
try:
    d = dl("000001.SS", start="2000-01-01", interval="1d")[["Open", "Close"]].dropna()
    d.index = pd.to_datetime(d.index).tz_localize(None).normalize(); d = d[~d.index.duplicated(keep="last")]
    d = d[(d["Open"] > 0) & (d["Close"] > 0)]
    r = np.log(d["Close"]).diff(); sig20 = r.rolling(20).std().shift(1); rms5 = np.sqrt((r ** 2).rolling(5).mean()).shift(1)
    sig = np.maximum(sig20, np.sqrt((sig20 ** 2 + rms5 ** 2) / 2))
    pv = d["Close"].shift(1); gap = np.log(d["Open"] / pv)
    bad = (d["Open"] == d["Close"]) | (gap.abs() > 0.11)       # 시가가 종가와 같은 날(자료 망가짐)·±11% 넘는 갭은 뺌
    R = pd.DataFrame({"day": d.index, "gap": gap.values, "gz": (gap / sig).values, "z": (gap / sig).values,
                      "y": (d["Close"] > pv).astype(float).values})[~bad.values]
    R = R.iloc[1:]; OUT["일봉_open_bad빼기"] = int(bad.sum())
    evaluate(R, pd.Timestamp("2013-06-01"), "A_일봉_개장스냅")
    # (B) 60분봉
    h = dl("000001.SS", period="730d", interval="60m")[["Open", "Close"]].dropna()
    idx = pd.to_datetime(h.index); idx = idx.tz_localize("UTC") if idx.tz is None else idx
    h.index = idx.tz_convert("Asia/Shanghai"); h["day"] = [pd.Timestamp(t.date()) for t in h.index]
    nb = h.groupby("day").size(); full = int(nb.mode().iloc[0]); rows = []
    tot = 240
    for day, g in h.groupby("day"):
        if len(g) != full or day not in d.index: continue
        p_, s_ = pv.get(day), sig.get(day)
        if pd.isna(p_) or pd.isna(s_) or s_ <= 0: continue
        o1 = float(g["Open"].iloc[0]); gp = math.log(o1 / p_); cl = float(d["Close"][day])
        for i in range(len(g) - 1):
            t = g.index[i] + pd.Timedelta(minutes=60)       # 봉 끝 시각
            el = (t.hour * 60 + t.minute) - 570
            if t.hour >= 13: el -= 90                        # 점심 11:30~13:00
            rem = max(0.02, 1 - el / tot); chg = math.log(float(g["Close"].iloc[i]) / p_)
            rows.append((day, i, gp, gp / s_, chg / (s_ * math.sqrt(rem)), float(cl > p_)))
    H = pd.DataFrame(rows, columns=["day", "bar", "gap", "gz", "z", "y"])
    OUT["B_bars"] = full; OUT["B_first"] = str(H["day"].min().date()) if len(H) else None
    mid = sorted(H["day"].unique())[len(H["day"].unique()) // 2]
    evaluate(H, pd.Timestamp(mid), "B_60분_전체스냅")
    for b in sorted(H["bar"].unique()):
        evaluate(H[H["bar"] == b].copy(), pd.Timestamp(mid), f"B_60분_봉{b}")
except Exception as e:
    import traceback; OUT["err"] = traceback.format_exc()[-800:]
print("GAP91_BT " + json.dumps(OUT, ensure_ascii=False, default=str))
