"""#84 VKOSPI → 한국 스타일 순환(소형 대 대형) — 확률 보강 11/9 14시 (Actions)
소형 대리 = 코스닥(^KQ11) · 대형 = 코스피200(^KS200). y5 = 다음 5일 코스닥 등락 > 코스피200 등락.
조건(P 이하 마지막 VKOSPI): 1년 백분위 ≥90 · ≤10 · 5일 변화 1년 순위 ≥90 · ≤10.
① 칸: 평소 대비 차이 앞/뒤(가운데 날 기준)·최근5년 · 5일 간격(겹치지 않게) ② 걸어가며 브라이어(사전 100) — 평소 vs 칸
③ 교차 로지스틱: 기준 [소형−대형 지난 5·20일] 위에 칸 더하기. 같은 걸 다음 날(y1)도."""
import json
import numpy as np, pandas as pd, requests, yfinance as yf
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
r = requests.get("https://ts-api.cnbc.com/harmony/app/bars/.KSVKOSPI/1D/20030101000000/20261111000000/adjusted/EST5EDT.json", headers=UA, timeout=40)
bars = r.json().get("barData", {}).get("priceBars", [])
vk = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
vk = vk[~vk.index.duplicated(keep="last")]; vk = vk[vk > 0]
print("VKOSPI", len(vk), vk.index[0].date(), vk.index[-1].date(), round(float(vk.iloc[-1]), 2))
SY = ["^KQ11", "^KS200", "^KS11"]
df = yf.download(SY, start="2007-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def cl(s):
    x = df[s]["Close"].dropna(); x.index = pd.to_datetime(x.index).tz_localize(None); x = x[~x.index.duplicated(keep="last")]; return x[x > 0]
C = {s: cl(s) for s in SY}
for s in SY: print(s, len(C[s]), C[s].index[0].date(), C[s].index[-1].date())
L = C["^KS200"]; S = C["^KQ11"].reindex(L.index).ffill(limit=2)
lr = np.log(S).diff() - np.log(L).diff()          # 소형−대형 하루
vkp = vk.rolling(252).rank(pct=True)
vk5 = np.log(vk).diff(5); vk5p = vk5.rolling(252).rank(pct=True)
days = L.index
rows = []
for i in range(25, len(days) - 5):
    P = days[i]
    k = vk.index.searchsorted(P, side="right") - 1
    if k < 252 or (P - vk.index[k]).days > 6 or pd.isna(vkp.iloc[k]) or pd.isna(vk5p.iloc[k]): continue
    f1 = lr.iloc[i + 1]; f5 = lr.iloc[i + 1:i + 6].sum(); b5 = lr.iloc[i - 4:i + 1].sum(); b20 = lr.iloc[i - 19:i + 1].sum()
    if any(pd.isna(v) for v in (f1, f5, b5, b20)): continue
    rows.append((P, float(vkp.iloc[k]), float(vk5p.iloc[k]), float(b5) * 100, float(b20) * 100, int(f1 > 0), int(f5 > 0), float(f5) * 100))
R = pd.DataFrame(rows, columns=["P", "vkp", "vk5p", "b5", "b20", "y1", "y5", "f5"]).set_index("P")
R["hi"] = (R.vkp >= 0.9).astype(float); R["lo"] = (R.vkp <= 0.1).astype(float)
R["j_up"] = (R.vk5p >= 0.9).astype(float); R["j_dn"] = (R.vk5p <= 0.1).astype(float)
mid = R.index[len(R) // 2]; rec = R.index[-1] - pd.Timedelta(days=365 * 5)
print("표본", len(R), R.index[0].date(), R.index[-1].date(), "가운데", mid.date())
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)
def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(H, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
OUT = {"n": len(R), "from": str(R.index[0].date()), "mid": str(mid.date()), "now": {"vk": round(float(vk.iloc[-1]), 2), "vkp": round(float(vkp.iloc[-1]), 3), "vk5p": round(float(vk5p.iloc[-1]), 3)}}
for yc in ("y1", "y5"):
    o = {}
    A, B, Z = R[R.index < mid], R[R.index >= mid], R[R.index >= rec]
    sp = R.iloc[::5]; SA, SB = sp[sp.index < mid], sp[sp.index >= mid]
    o["평소"] = [round(A[yc].mean() * 100, 1), round(B[yc].mean() * 100, 1), round(Z[yc].mean() * 100, 1)]
    for c in ("hi", "lo", "j_up", "j_dn"):
        cell = {}
        for nm, X in (("앞", A), ("뒤", B), ("최근5", Z)):
            m = X[X[c] == 1]; cell[nm] = [len(m), round((m[yc].mean() - X[yc].mean()) * 100, 1) if len(m) else None]
        for nm, X in (("5일간격앞", SA), ("5일간격뒤", SB)):
            m = X[X[c] == 1]; cell[nm] = [len(m), round((m[yc].mean() - X[yc].mean()) * 100, 1) if len(m) else None]
        if yc == "y5":
            cell["평균f5"] = [round(float(A[A[c] == 1].f5.mean()), 2), round(float(B[B[c] == 1].f5.mean()), 2)]
        # 걸어가며 브라이어 (2012~ 해마다, 사전 100)
        pb, pc, ys, yrs = [], [], [], []
        for yr in range(2012, R.index[-1].year + 1):
            tr = R[R.index < f"{yr}-01-01"]; te = R[(R.index >= f"{yr}-01-01") & (R.index < f"{yr + 1}-01-01")]
            if len(te) == 0: continue
            base = tr[yc].mean(); m = tr[tr[c] == 1]; n = len(m)
            rc = (m[yc].sum() + 100 * base) / (n + 100)
            pb += [base] * len(te); pc += list(np.where(te[c] == 1, rc, base)); ys += list(te[yc]); yrs += list(te.index)
        W = pd.DataFrame({"b": pb, "c": pc, "y": ys}, index=yrs)
        cut = W.index[len(W) // 2]
        cell["걸어가기"] = {nm: [brier(X.b, X.y), brier(X.c, X.y)] for nm, X in (("앞", W[W.index < cut]), ("뒤", W[W.index >= cut]), ("최근5", W[W.index >= rec]))}
        # 교차 로지스틱: 기준 b5·b20 위에 칸
        cx = {}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            w0 = fit(tr[["b5", "b20"]].values, tr[yc].values); w1 = fit(tr[["b5", "b20", c]].values, tr[yc].values)
            cx[nm] = [brier(pr(w0, te[["b5", "b20"]].values), te[yc]), brier(pr(w1, te[["b5", "b20", c]].values), te[yc]), round(float(w1[-1]), 3)]
        cell["교차"] = cx
        o[c] = cell
    OUT[yc] = o
print(json.dumps(OUT, ensure_ascii=False, indent=1))
