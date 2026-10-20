"""#4b 파생: 코스피200 선물 베이시스(선물/현물−1) 검증 — 확률 보강 일지 10/20 16시 (Actions)
자료: 네이버 fchart.stock.naver.com/sise.nhn?symbol=FUT (2010-03~, 주간 정규장 근월물) · KPI200"""
import json, sys, os, re, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x
UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://m.stock.naver.com/"}
def fch(sym, n=5000):
    t = urllib.request.urlopen(urllib.request.Request(f"https://fchart.stock.naver.com/sise.nhn?symbol={sym}&timeframe=day&count={n}&requestType=0", headers=UA), timeout=30).read().decode("euc-kr", "replace")
    rows = re.findall(r'data="(\d{8})\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|', t)
    return pd.Series({pd.Timestamp(r[0]): float(r[4]) for r in rows if r[4]}).sort_index()
# 야간 주소 더 시험
for s in ("FUTN", "FUT_N", "NFUT", "KOSPI200_NIGHT", "FUT1", "101S"):
    try: print("야간?", s, len(fch(s, 5)))
    except Exception as e: print("야간?", s, repr(e)[:80])
try:
    b = json.loads(urllib.request.urlopen(urllib.request.Request("https://m.stock.naver.com/api/index/FUT/basic", headers=UA), timeout=20).read())
    print("FUT basic 칸:", list(b.keys()))
    print({k: v for k, v in b.items() if re.search("night|Night|over|Over|after|After", k)})
except Exception as e: print("basic", e)
fut, k2 = fch("FUT"), fch("KPI200")
print("FUT", fut.index[0].date(), fut.index[-1].date(), len(fut), "KPI200", k2.index[0].date(), len(k2))
bs = (fut / k2 - 1).dropna() * 100
bs = bs[bs.abs() < 5]
rk = bs.rolling(252, min_periods=120).rank(pct=True) * 100
ch = (bs - bs.rolling(5).mean())
print("베이시스 지금 %.2f%% 1년 백분위 %.0f" % (bs.iloc[-1], rk.iloc[-1]), bs.index[-1].date())
H = prob.load_hist(["^KS11"])
d = prob.feats(H["^KS11"]); d = d[d.index >= "2010-06-01"]
def wf(d, cut, yc, prior=150):
    y = d[yc]; ok = y.notna() & cut.notna(); yy = y.where(ok)
    sh = 1 if yc == "y1" else 5
    known = yy.shift(sh); base = known.expanding().mean()
    num = pd.Series(0.0, index=d.index); den = pd.Series(0.0, index=d.index)
    for lb in cut.dropna().unique():
        m = (cut == lb); ms = m.shift(sh, fill_value=False)
        k = known.where(ms).fillna(0).cumsum(); n = (known.notna() & ms).astype(float).cumsum()
        num = num.where(~m, k); den = den.where(~m, n)
    p = (num + prior * base) / (den + prior)
    ev = ok & (d.index >= "2012-01-01") & base.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]; res = {}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근2년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=730)))):
        res[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 4), round(float(((p[msk] - y[msk]) ** 2).mean()), 4)]
    res["mid"] = str(mid.date()); return res
out = {"now": {"basis": round(float(bs.iloc[-1]), 3), "rank": round(float(rk.iloc[-1]), 1), "asof": str(bs.index[-1].date())}}
E = [-1, 10, 30, 70, 90, 101]; L = ["아주 낮음(≤10)", "낮음", "보통", "높음", "아주 높음(≥90)"]
E2 = [-9, -0.3, -0.1, 0.1, 0.3, 9]; L2 = ["급락(−0.3↓)", "내림", "그대로", "오름", "급등(+0.3↑)"]
for nm, x, EE, LL in (("rank", rk, E, L), ("ch5", ch, E2, L2), ("level", bs, [-9, -0.5, 0, 0.5, 9], ["백워(−0.5↓)", "약백워", "약콘탱고", "콘탱고(+0.5↑)"])):
    cut = pd.cut(x.reindex(d.index), EE, labels=LL)
    mid = d.index[len(d) // 2]; tb = []
    for lb in LL:
        row = {"k": lb}
        for half, msk in (("all", pd.Series(True, index=d.index)), ("앞", pd.Series(d.index < mid, index=d.index)), ("뒤", pd.Series(d.index >= mid, index=d.index))):
            m = prob.cond(d[msk], (cut == lb)[msk].fillna(False), lb)
            b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
            row[half] = None if not m else {"n": m["n"], "d1": round((m["p1"] - b1) * 100, 1), "d5": round(((m["p5"] or 0) - b5) * 100, 1)}
        row["now"] = bool(len(cut.dropna()) and cut.dropna().iloc[-1] == lb); tb.append(row)
    out[nm] = {"mid": str(mid.date()), "base1": round(d["y1"].mean() * 100, 1), "table": tb, "brier1": wf(d, cut, "y1"), "brier5": wf(d, cut, "y5")}
    print(nm, json.dumps(out[nm], ensure_ascii=False))
json.dump(out, open("probe/basis_bt.json", "w"), ensure_ascii=False, indent=1)
