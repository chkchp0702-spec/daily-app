"""🎲 11/11 #100b 고정 기울기(×1.05·1.1·1.15)를 「학습 절반 표」 위에서 다시 — 앞→뒤·뒤→앞 + 세 토막(⅓씩 돌려가며). 원래 #100 장중 닻 z 기울기(×k) — #99 새 표 위에서. 학습 절반에서 표·k 를 맞춰 시험 절반에 쓰고(반대도) 브라이어 비교.
k 는 z=등락/(흔들림·√남은흔들림) 에 곱하는 값 = 표를 1/k² 로 줄이는 것과 같음."""
import json, math
import numpy as np, pandas as pd, yfinance as yf
from statistics import NormalDist
N = NormalDist()
MK = {"KR": ("^KS11", "Asia/Seoul", 900, 1530), "JP": ("^N225", "Asia/Tokyo", 900, 1530),
      "CN": ("000001.SS", "Asia/Shanghai", 930, 1500), "HK": ("^HSI", "Asia/Hong_Kong", 930, 1610),
      "US": ("^GSPC", "America/New_York", 930, 1600)}
VH = {"KR": {60: 0.332, 120: 0.227, 180: 0.155, 240: 0.119, 300: 0.079, 360: 0.028},
      "JP": {60: 0.245, 120: 0.179, 180: 0.155, 240: 0.094, 300: 0.056, 360: 0.017},
      "CN": {60: 0.662, 120: 0.458, 180: 0.457, 240: 0.322, 300: 0.089},
      "HK": {60: 0.319, 120: 0.218, 180: 0.197, 240: 0.145, 300: 0.076, 360: 0.021},
      "US": {60: 0.612, 120: 0.442, 180: 0.38, 240: 0.279, 300: 0.17, 360: 0.07}}
C0 = {"CN": 0.15}
def mins(hm): return hm // 100 * 60 + hm % 100
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def lg(p): p = min(0.99, max(0.01, p)); return math.log(p / (1 - p))
def sg(x): return 1 / (1 + math.exp(-x))
def interp(t, el, tot, rem):
    if not t: return rem
    pts = [(0, 1.0)] + sorted(t.items()) + [(tot, 0.003)]
    for (a, va), (b, vb) in zip(pts, pts[1:]):
        if a <= el <= b: return max(0.003, va + (vb - va) * (el - a) / (b - a or 1))
    return max(0.003, rem)
def prob(z, c0):
    p = min(0.99, max(0.01, N.cdf(z)))
    return min(0.99, max(0.01, sg(lg(p) + c0))) if c0 else p
OUT = {}
for mk, (sym, tz, op, cl) in MK.items():
    try:
        dd = yf.download(sym, period="5y", interval="1d", auto_adjust=False, progress=False)
        hh = yf.download(sym, period="730d", interval="60m", auto_adjust=False, progress=False)
        if isinstance(dd.columns, pd.MultiIndex): dd.columns = dd.columns.get_level_values(0)
        if isinstance(hh.columns, pd.MultiIndex): hh.columns = hh.columns.get_level_values(0)
        dc = dd["Close"].dropna(); dc.index = pd.to_datetime(dc.index).tz_localize(None).normalize()
        dc = dc[~dc.index.duplicated(keep="last")]
        r = dc.pct_change()
        s20 = r.rolling(20).std().shift(1)
        rms5 = (r ** 2).rolling(5).mean().pow(0.5).shift(1)
        sp = np.maximum(s20, ((s20 ** 2 + rms5 ** 2) / 2) ** 0.5)
        prev = dc.shift(1)
        hx = hh["Close"].dropna(); idx = pd.to_datetime(hx.index)
        if idx.tz is None: idx = idx.tz_localize("UTC")
        idx = idx.tz_convert(tz); tot = mins(cl) - mins(op)
        rows = []
        for t, v in zip(idx, hx.values):
            day = pd.Timestamp(t.date())
            if day not in dc.index or pd.isna(prev.get(day)) or pd.isna(s20.get(day)) or pd.isna(sp.get(day)): continue
            el = min(t.hour * 60 + t.minute + 60, mins(cl)) - mins(op)
            if el <= 0 or el >= tot: continue
            chg = math.log(float(v) / float(prev[day])); fin = math.log(float(dc[day]) / float(v))
            rows.append((day, el, 1 - el / tot, chg, float(s20[day]), float(sp[day]), fin, int(dc[day] > prev[day])))
        R = pd.DataFrame(rows, columns=["day", "el", "rem", "chg", "s20", "sp", "fin", "y"])
        R = R[(R.s20 > 0) & (R.sp > 0)]
        days = sorted(R.day.unique()); mid = days[len(days) // 2]
        A, B = R[R.day < mid], R[R.day >= mid]
        c0 = C0.get(mk, 0)
        def vh_fit(T, sc): return {int(e): float(x) for e, x in (T.assign(z2=(T.fin / T[sc]) ** 2).groupby("el").z2.mean()).items()}
        def pr(T, table, sc, k=1.0):
            return [prob(k * c / (s * math.sqrt(interp(table, e, tot, rm))), c0) for c, s, e, rm in zip(T.chg, T[sc], T.el, T.rem)]
        res = {"n": len(R), "days": len(days), "split": str(mid.date())}
        KS = [1.0, 1.05, 1.1, 1.15, 1.2]
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            ft = vh_fit(tr, "sp")
            res[nm] = {"n": len(te), **{f"학습표x{k}": round(brier(pr(te, ft, "sp", k), te.y), 5) for k in KS},
                       **{f"지금표x{k}": round(brier(pr(te, VH[mk], "sp", k), te.y), 5) for k in (1.0, 1.1)}}
        th = [days[0], days[len(days) // 3], days[2 * len(days) // 3], days[-1] + pd.Timedelta(days=1)]
        for i in range(3):
            te = R[(R.day >= th[i]) & (R.day < th[i + 1])]; tr = R.drop(te.index)
            ft = vh_fit(tr, "sp")
            res[f"셋{i+1}"] = {"n": len(te), **{f"x{k}": round(brier(pr(te, ft, "sp", k), te.y), 5) for k in KS}}
        # 최근 1년만 시험(그 앞 전부로 표 맞춤)
        cut = days[-1] - pd.Timedelta(days=365)
        tr, te = R[R.day < cut], R[R.day >= cut]
        ft = vh_fit(tr, "sp")
        res["최근1년"] = {"n": len(te), **{f"x{k}": round(brier(pr(te, ft, "sp", k), te.y), 5) for k in KS}}
        OUT[mk] = res
    except Exception as e:
        OUT[mk] = {"err": repr(e)[:300]}
print("K100B " + json.dumps(OUT, ensure_ascii=False))
