"""🎲 11/10 #96 검증: 장중 닻 「절편」 — 지금 등락이 0 이어도 종가가 어제보다 높을 확률이 50%가 아닌가?
야후 60분봉(약 730일) · 각 날 각 시각 스냅에 prob.py 와 같은 장중 닻 식(흔들림 넓힘·시각별 남은 흔들림 INTRA_VH)을 만들고,
대안 ① 로짓 절편 c (상수) ② 남은 시간만큼의 표류 mu·rem (z 에 더함) 을 앞 절반에서 맞춰 뒤 절반에 써 봄(그 반대도).
보조: 일봉 2000~ 「갭 스냅」(시가 = 지금 값, 남은 = 시가→종가)으로 같은 절편을 2013 기준 앞/뒤에서."""
import json, math, sys
import numpy as np, pandas as pd, yfinance as yf
from statistics import NormalDist
sys.path.insert(0, ".")
N = NormalDist()
INTRA_VH = {"KR": {60: 0.398, 120: 0.27, 180: 0.18, 240: 0.138, 300: 0.091, 360: 0.033},
            "JP": {60: 0.274, 120: 0.205, 180: 0.176, 240: 0.106, 300: 0.063, 360: 0.018},
            "HK": {60: 0.346, 120: 0.239, 180: 0.216, 240: 0.16, 300: 0.085, 360: 0.024}}
def intra_var(mk, el, tot, rem):
    t = INTRA_VH.get(mk)
    if not t: return rem
    pts = [(0, 1.0)] + sorted(t.items()) + [(tot, 0.003)]
    for (a, va), (b, vb) in zip(pts, pts[1:]):
        if a <= el <= b: return max(0.003, va + (vb - va) * (el - a) / (b - a or 1))
    return max(0.003, rem)
MK = {"KR": ("^KS11", "Asia/Seoul", 900, 1530), "JP": ("^N225", "Asia/Tokyo", 900, 1530),
      "CN": ("000001.SS", "Asia/Shanghai", 930, 1500), "HK": ("^HSI", "Asia/Hong_Kong", 930, 1610),
      "US": ("^GSPC", "America/New_York", 930, 1600)}
def mins(hm): return hm // 100 * 60 + hm % 100
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def cdf(z): return 0.5 * (1 + np.vectorize(math.erf)(np.asarray(z) / math.sqrt(2)))
def lg(p): p = np.clip(p, 0.01, 0.99); return np.log(p / (1 - p))
def sg(x): return 1 / (1 + np.exp(-x))
def model(T, kind, a):
    z = T["chg"].values / (T["sig"].values * np.sqrt(T["vr"].values))
    if kind == "drift": z = z + a * T["rem"].values / (T["sig"].values * np.sqrt(T["vr"].values))
    p = np.clip(cdf(z), 0.01, 0.99)
    if kind == "logit": p = sg(lg(p) + a)
    return p
GRID = {"logit": np.round(np.arange(-0.6, 0.61, 0.02), 3), "drift": np.round(np.arange(-0.004, 0.0041, 0.0001), 5)}
def fit(T, kind):
    return min(GRID[kind], key=lambda a: brier(model(T, kind, a), T["y"]))
OUT = {}
for mk, (sym, tz, op, cl) in MK.items():
    try:
        dd = yf.download(sym, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
        hh = yf.download(sym, period="730d", interval="60m", auto_adjust=False, progress=False)
        for x in (dd, hh):
            if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
        dd = dd[["Open", "Close"]].dropna(); dd.index = pd.to_datetime(dd.index).tz_localize(None).normalize()
        dd = dd[~dd.index.duplicated(keep="last")]
        dc = dd["Close"]
        r = dc.pct_change()
        s20 = r.rolling(20).std(); rms5 = (r ** 2).rolling(5).mean() ** 0.5
        sig = np.maximum(s20, ((s20 ** 2 + rms5 ** 2) / 2) ** 0.5).shift(1)
        prev = dc.shift(1)
        hx = hh["Close"].dropna(); idx = pd.to_datetime(hx.index)
        if idx.tz is None: idx = idx.tz_localize("UTC")
        idx = idx.tz_convert(tz)
        tot = mins(cl) - mins(op); rows = []
        for t, v in zip(idx, hx.values):
            day = pd.Timestamp(t.date())
            if day not in dc.index or pd.isna(prev.get(day)) or pd.isna(sig.get(day)): continue
            el = min(t.hour * 60 + t.minute + 60, mins(cl)) - mins(op)
            if el <= 0 or el >= tot: continue
            rem = max(0.02, 1 - el / tot)
            rows.append((day, el, rem, math.log(float(v) / float(prev[day])), float(sig[day]), intra_var(mk, el, tot, rem), int(dc[day] > prev[day])))
        R = pd.DataFrame(rows, columns=["day", "el", "rem", "chg", "sig", "vr", "y"]); R = R[R["sig"] > 0]
        days = sorted(R["day"].unique()); mid = days[len(days) // 2]
        A, B = R[R["day"] < mid], R[R["day"] >= mid]
        res = {"n": len(R), "days": len(days), "split": str(mid.date())}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            o = {"n": len(te), "b0": round(brier(model(te, "none", 0), te["y"]), 5)}
            for k in ("logit", "drift"):
                a = fit(tr, k); o[k] = [float(a), round(brier(model(te, k, a), te["y"]), 5)]
            z = te["chg"] / (te["sig"] * np.sqrt(te["vr"]))
            fl = te[z.abs() < 0.3]; o["flat"] = [len(fl), round(float(fl["y"].mean()) * 100, 1) if len(fl) else None]
            res[nm] = o
        # 시각별 평탄(|z|<0.3) 오른 비율 (전체)
        z = R["chg"] / (R["sig"] * np.sqrt(R["vr"]))
        res["flat_by_el"] = {int(e): [int(len(g)), round(float(g["y"].mean()) * 100, 1)] for e, g in R[z.abs() < 0.3].groupby("el")}
        # 일봉 갭 스냅(개장 순간): 지금 값 = 시가, vr = 시가→종가 남은 흔들림(앞 기간 실측)
        D = pd.DataFrame({"chg": np.log(dd["Open"] / prev), "fin": np.log(dc / dd["Open"]), "sig": sig, "y": (dc > prev).astype(int)}).dropna()
        D = D[(D["sig"] > 0) & (dd["Open"].reindex(D.index) != dc.reindex(D.index))]
        D = D[D.index >= "2001-01-01"]; m2 = D.index[len(D) // 2]
        DA, DB = D[D.index < m2], D[D.index >= m2]
        gd = {"n": len(D), "split": str(m2.date())}
        for nm, (tr, te) in {"앞→뒤": (DA, DB), "뒤→앞": (DB, DA)}.items():
            vr = float(((tr["fin"] / tr["sig"]) ** 2).mean())
            tr = tr.assign(vr=vr, rem=1.0); te = te.assign(vr=vr, rem=1.0)
            o = {"n": len(te), "vr": round(vr, 3), "b0": round(brier(model(te, "none", 0), te["y"]), 5)}
            for k in ("logit", "drift"):
                a = fit(tr, k); o[k] = [float(a), round(brier(model(te, k, a), te["y"]), 5)]
            z = te["chg"] / (te["sig"] * np.sqrt(te["vr"])); fl = te[z.abs() < 0.3]
            o["flat"] = [len(fl), round(float(fl["y"].mean()) * 100, 1)]
            gd[nm] = o
        rec = D[D.index >= D.index[-1] - pd.Timedelta(days=1826)]
        res["gap_daily"] = gd; res["recent5_flat_open_up"] = round(float(rec["y"][(rec["chg"].abs() < 0.001)].mean()) * 100, 1)
        OUT[mk] = res
    except Exception as e:
        OUT[mk] = {"err": repr(e)[:300]}
    print(mk, json.dumps(OUT[mk], ensure_ascii=False), flush=True)
print("ICPT_BT " + json.dumps(OUT, ensure_ascii=False))
