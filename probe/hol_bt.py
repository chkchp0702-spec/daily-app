"""#17 휴일 전날 효과 검증 — 확률 보강 일지 10/28 12시 (Actions 에서 실행)
Ariel(1990) 등: 휴장 전 마지막 거래일 수익률이 평소보다 높다.
휴장 판정 = 지수 이력의 빈칸: 다음 거래일까지 평일(월~금)이 하나 이상 비면 그 날은 「휴일 앞날」.
  A「내일이 휴일 앞날」: 오늘(t) 기준 다음 거래일(t+1)이 휴일 앞날 → y1 = t+1 오름
  B「내일이 휴일 뒤 첫날」: 오늘(t)이 휴일 앞날 → y1 = 휴장 건너 첫날 오름
  A3·B3: 비는 평일 2일 이상(설·추석·골든위크 등 긴 연휴)
holidays 패키지 달력과 이력 빈칸이 얼마나 맞는지도 센다(앞으로 날짜 판정에 쓸 수 있는지)."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob

try:
    import holidays as HL
except Exception:
    HL = None

syms = sorted({c["ix"] for c in prob.MK.values()})
H = prob.load_hist(syms)
HC = {"KR": "KR", "JP": "JP", "CN": "CN", "HK": "HK", "US": "NYSE"}


def gap_bdays(idx):
    """다음 거래일까지 비는 평일 수"""
    nx = list(idx[1:]) + [None]
    out = []
    for a, b in zip(idx, nx):
        out.append(np.nan if b is None else len(pd.bdate_range(a, b)) - 2)
    return pd.Series(out, index=idx)


def wf(d, flag, prior=100):
    """걸어가며: 표시된 날 = (앞 자료 표시날 오른 수 + prior·기저)/(n + prior), 나머지 = 기저"""
    y = d["y1"]; ok = y.notna()
    known = y.where(ok).shift(1)
    base = known.expanding().mean()
    fm = flag.shift(1, fill_value=False)
    k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
    p = base.where(~flag, (k + prior * base) / (n + prior))
    ev = ok & (d.index >= "2006-01-01") & base.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5), int((msk & flag).sum())]
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2000-01-01"].copy()
    g = gap_bdays(d.index)
    pre = (g >= 1)                     # 이 날이 휴일 앞날
    pre3 = (g >= 2)
    A = pre.shift(-1, fill_value=False)   # 내일이 휴일 앞날
    A3 = pre3.shift(-1, fill_value=False)
    sets = {"A 내일=휴일 앞날": A, "A3 내일=긴 연휴 앞날": A3, "B 내일=휴일 뒤 첫날": pre, "B3 내일=긴 연휴 뒤 첫날": pre3}
    mid = d.index[len(d) // 2]
    R = {"base1": round(d["y1"].mean() * 100, 1), "mid": str(mid.date()), "n_days": len(d)}
    for nm, f in sets.items():
        row = {}
        for half, msk in (("all", d.index == d.index), ("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
            row[half] = None if not c_ else {"n": c_["n"], "p1": round(c_["p1"] * 100, 1), "d1": round((c_["p1"] - b1) * 100, 1), "d5": round(((c_["p5"] or 0) - b5) * 100, 1)}
        row["brier"] = wf(d, f)
        R[nm] = row
        print(mk, nm, json.dumps(row, ensure_ascii=False))
    # holidays 달력과 이력 빈칸 비교 (2015~)
    if HL is not None:
        try:
            yrs = range(2015, 2028)
            cal = HL.financial_holidays("NYSE", years=yrs) if mk == "US" else HL.country_holidays(HC[mk], years=yrs)
            dd = d[d.index >= "2015-01-01"]
            hist_pre = set(dd.index[(gap_bdays(dd.index) >= 1).values].date)
            cal_pre = set()
            for t in dd.index[:-1]:
                nb = (t + pd.offsets.BDay(1)).date()
                if nb in cal:
                    cal_pre.add(t.date())
            R["cal_match"] = {"hist": len(hist_pre), "cal": len(cal_pre), "both": len(hist_pre & cal_pre)}
            fut = [str(x) for x in sorted(cal) if pd.Timestamp(x) > d.index[-1] and pd.Timestamp(x).weekday() < 5][:6]
            R["next_hol"] = fut
            print(mk, "달력 맞음", R["cal_match"], "다음 휴일", fut)
        except Exception as e:
            print(mk, "달력 오류", e)
    out[mk] = R
json.dump(out, open("probe/hol_bt.json", "w"), ensure_ascii=False, indent=1)
