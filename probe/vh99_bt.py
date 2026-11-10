"""🎲 11/10 #99 장중 닻 「남은 흔들림」 시각표 다시 재기 + 하루 흔들림 식(20일 vs 20일·5일 섞기) 점검.
야후 60분봉 730일. 지금 prob.py 식(P0)과 대안들을 앞 절반에서 맞춰 뒤 절반에 써 보고(반대도) 브라이어 비교."""
import json, math
import numpy as np, pandas as pd, yfinance as yf
from statistics import NormalDist
N = NormalDist()
MK = {"KR": ("^KS11", "Asia/Seoul", 900, 1530), "JP": ("^N225", "Asia/Tokyo", 900, 1530),
      "CN": ("000001.SS", "Asia/Shanghai", 930, 1500), "HK": ("^HSI", "Asia/Hong_Kong", 930, 1610),
      "US": ("^GSPC", "America/New_York", 930, 1600)}
VH = {"KR": {60: 0.398, 120: 0.27, 180: 0.18, 240: 0.138, 300: 0.091, 360: 0.033},
      "JP": {60: 0.274, 120: 0.205, 180: 0.176, 240: 0.106, 300: 0.063, 360: 0.018},
      "HK": {60: 0.346, 120: 0.239, 180: 0.216, 240: 0.16, 300: 0.085, 360: 0.024}}
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
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            cur = VH.get(mk)
            fit = vh_fit(tr, "sp")
            # 줄인 표: 새로 잰 표와 지금 표(없으면 무작위 걸음)를 반반
            half = {e: 0.5 * fit[e] + 0.5 * interp(cur, e, tot, 1 - e / tot) for e in fit}
            # 기울기 k: 학습 절반에서 지금 식 z 에 곱할 값 고르기
            ks = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.25, 1.4]
            kb = min(ks, key=lambda k: brier(pr(tr, cur, "sp", k), tr.y))
            d = {"n": len(te),
                 "P0_지금": round(brier(pr(te, cur, "sp"), te.y), 5),
                 "P1_20일만": round(brier(pr(te, cur, "s20"), te.y), 5),
                 "P2_새표": round(brier(pr(te, fit, "sp"), te.y), 5),
                 "P2b_반반": round(brier(pr(te, half, "sp"), te.y), 5),
                 "P3_기울기": round(brier(pr(te, cur, "sp", kb), te.y), 5), "k": kb,
                 "RW": round(brier(pr(te, None, "sp"), te.y), 5),
                 "fit": {e: round(x, 3) for e, x in sorted(fit.items())}}
            res[nm] = d
        res["fit_all"] = {e: round(x, 3) for e, x in sorted(vh_fit(R, "sp").items())}
        OUT[mk] = res
    except Exception as e:
        OUT[mk] = {"err": repr(e)[:300]}
print("VH99 " + json.dumps(OUT, ensure_ascii=False))
