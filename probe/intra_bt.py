"""🎲 10/15 검증: 「장중 닻」 실측 — 지금 등락 + 남은 시간 → 종가가 어제보다 높을 확률.
야후 60분봉(최근 약 730일)으로, 각 날 각 시각에 prob.py 와 같은 식(무작위 걸음: Φ(등락 ÷ (하루 흔들림 × √남은 시간 비율)))을
만들어 실제 결과와 비교. 대안 = 시각별 「남은 흔들림 비율」 v_h 를 앞 절반에서 재서 뒤 절반에 써 보기(그 반대도)."""
import json, math
import numpy as np, pandas as pd, yfinance as yf
from statistics import NormalDist
N = NormalDist()
MK = {"KR": ("^KS11", "Asia/Seoul", 900, 1530), "JP": ("^N225", "Asia/Tokyo", 900, 1530),
      "CN": ("000001.SS", "Asia/Shanghai", 930, 1500), "HK": ("^HSI", "Asia/Hong_Kong", 930, 1610),
      "US": ("^GSPC", "America/New_York", 930, 1600)}
def mins(hm): return hm // 100 * 60 + hm % 100
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def ll(p, y):
    p = np.clip(np.asarray(p), 0.005, 0.995); y = np.asarray(y); return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))
OUT = {}
for mk, (sym, tz, op, cl) in MK.items():
    try:
        dd = yf.download(sym, period="5y", interval="1d", auto_adjust=False, progress=False)
        hh = yf.download(sym, period="730d", interval="60m", auto_adjust=False, progress=False)
        if isinstance(dd.columns, pd.MultiIndex): dd.columns = dd.columns.get_level_values(0)
        if isinstance(hh.columns, pd.MultiIndex): hh.columns = hh.columns.get_level_values(0)
        dc = dd["Close"].dropna(); dc.index = pd.to_datetime(dc.index).tz_localize(None).normalize()
        dc = dc[~dc.index.duplicated(keep="last")]
        lr = np.log(dc).diff()
        sig = lr.rolling(20).std().shift(1)          # 그날 이전 20일 하루 흔들림 (prob.py 와 같은 길이)
        prev = dc.shift(1)
        hx = hh["Close"].dropna()
        idx = pd.to_datetime(hx.index)
        if idx.tz is None: idx = idx.tz_localize("UTC")
        idx = idx.tz_convert(tz)
        tot = mins(cl) - mins(op)
        rows = []
        for t, v in zip(idx, hx.values):
            day = pd.Timestamp(t.date())
            if day not in dc.index or pd.isna(prev.get(day)) or pd.isna(sig.get(day)): continue
            end = min(t.hour * 60 + t.minute + 60, mins(cl))
            el = end - mins(op)
            if el <= 0 or el >= tot: continue
            rem = 1 - el / tot
            chg = math.log(float(v) / float(prev[day]))
            fin = math.log(float(dc[day]) / float(v))  # 남은 시간 동안 실제 움직임
            rows.append((day, el, rem, chg, float(sig[day]), fin, int(dc[day] > prev[day])))
        R = pd.DataFrame(rows, columns=["day", "el", "rem", "chg", "sig", "fin", "y"])
        R = R[R["sig"] > 0]
        R["p_rw"] = [N.cdf(c / (s * math.sqrt(r))) for c, s, r in zip(R["chg"], R["sig"], R["rem"])]
        days = sorted(R["day"].unique()); mid = days[len(days) // 2]
        A, B = R[R["day"] < mid], R[R["day"] >= mid]
        def vh(T):   # 시각별 남은 흔들림 비율 = E[(남은 움직임/σ)²]
            return (T.assign(z2=(T["fin"] / T["sig"]) ** 2).groupby("el")["z2"].mean()).to_dict()
        res = {"n": len(R), "days": len(days), "split": str(mid.date())}
        for nm, (tr, te) in {"앞→뒤": (A, B), "뒤→앞": (B, A)}.items():
            v = vh(tr)
            pe = [N.cdf(c / (s * math.sqrt(max(0.003, v.get(e, r))))) for c, s, r, e in zip(te["chg"], te["sig"], te["rem"], te["el"])]
            res[nm] = {"n": len(te), "brier_rw": round(brier(te["p_rw"], te["y"]), 4), "brier_vh": round(brier(pe, te["y"]), 4),
                       "ll_rw": round(ll(te["p_rw"], te["y"]), 4), "ll_vh": round(ll(pe, te["y"]), 4),
                       "hit": round(float(np.mean((te["p_rw"] > 0.5) == (te["y"] == 1))), 4),
                       "v_vs_rem": {int(e): [round(v[e], 3), round(1 - e / tot, 3)] for e in sorted(v)}}
        # 칸별 실측 (전체): 무작위 걸음이 말한 확률 vs 실제 상승 비율
        R["b"] = pd.cut(R["p_rw"], [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1.0])
        cal = R.groupby("b", observed=True).agg(n=("y", "size"), p=("p_rw", "mean"), up=("y", "mean"))
        res["cal"] = [[str(i), int(r.n), round(r.p, 3), round(r.up, 3)] for i, r in cal.iterrows()]
        res["v_all"] = {int(e): [round(x, 3), round(1 - e / tot, 3)] for e, x in vh(R).items()}
        OUT[mk] = res
    except Exception as e:
        OUT[mk] = {"err": repr(e)[:300]}
print("INTRA_BT " + json.dumps(OUT, ensure_ascii=False))
