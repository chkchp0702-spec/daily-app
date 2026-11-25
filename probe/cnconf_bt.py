"""11/25 10시 🎯 자신 있는 날 넓히기 4 — 중국(상해종합, 골라진 날 13%뿐)
  미리 정한 후보(결과 보기 전):
    hsx  = 항셍 그날 등락 − 상해 그날 등락 (홍콩은 상해보다 1시간 늦게 닫음 → 상해 다음 날 장 전에 앎)
    ashx = 미국 상장 A주 ETF(ASHR) 그날 등락 − 상해 그날 등락 (상해 마감 뒤 미국 시간까지 더 움직인 몫, 한국 etfx 와 같은 꼴)
    ashg = log(ASHR/상해) 20일 평균 대비 벌어짐(일본 nkg 와 같은 수준판)
  기본 = 지금 화면 conf(usr·ar1·r5·lvix). 같은 표본(ASHR 있는 날, 2014~), 해마다 걸어가기.
  붙이는 조건(etflv_bt 와 같음): 골라진 날 적중·비율이 앞·뒤 모두 기본보다 늘(하나는 같아도 됨)고 최근3년 적중이 안 나빠질 때 + 방향 브라이어 안 나빠짐."""
import json, os, sys, time
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import prob, prob_vol
syms = ["000001.SS", "^HSI", "^GSPC", "^VIX", "ASHR"]
H = prob.load_hist(syms)
for s_ in ("ASHR", "^HSI"):
    for _ in range(3):
        if len(H.get(s_, pd.DataFrame()).get("Close", pd.Series(dtype=float)).dropna()):
            break
        time.sleep(3); H.update(prob.load_hist([s_]))
for s in ("ASHR", "^HSI"):
    x = H.get(s, pd.DataFrame()).get("Close")
    print("자료", s, None if x is None else (len(x.dropna()), str(x.dropna().index[0].date()), str(x.dropna().index[-1].date())), flush=True)
spx = H["^GSPC"]["Close"].dropna(); vix = H["^VIX"]["Close"].dropna()
def brier(d, P):
    y = d["y1"].reindex(P.index); m = P.notna() & y.notna()
    return round(float(np.mean((P[m] - y[m]) ** 2)), 5)
c = H["000001.SS"]["Close"].dropna()
d = prob_vol.frame(c, spx, vix, True)
r1 = (c.pct_change() * 100).clip(-10, 10)
hs = H["^HSI"]["Close"].dropna()
hsr = (hs.pct_change() * 100).reindex(c.index)          # 같은 날짜(홍콩 마감이 1시간 늦음)
d["hsx"] = (hsr - r1).clip(-8, 8)
a = prob_vol._align(H["ASHR"]["Close"].dropna(), c.index)  # 미국 날짜 t → 다음 아시아 날짜
ar = prob_vol._align(H["ASHR"]["Close"].dropna().pct_change() * 100, c.index)
d["ashx"] = (ar - r1).clip(-8, 8)
g = np.log(a / c); d["ashg"] = ((g - g.rolling(20).mean().shift(1)) * 100).clip(-8, 8)
print("날짜 확인: 다음 날 등락과 상관", {k: round(float(d[k].corr(d["y1"])), 3) for k in ("hsx", "ashx", "ashg")}, flush=True)
base = ["usr", "ar1", "r5", "lvix"]
var = [("기본", base), ("+hsx", base + ["hsx"]), ("+ashx", base + ["ashx"]), ("+ashg", base + ["ashg"])]
allc = sorted({x for _, v in var for x in v})
dd = d.dropna(subset=allc)
R = {}
for nm, f in var:
    try:
        cf = prob_vol.conf(dd, f)
        P, _ = prob_vol.walk(dd, f, "y1")
        cf["brier"] = brier(dd, P)
    except Exception as ex:
        cf = {"err": str(ex)[:160]}
    R[nm] = cf
    print("CN", nm, "n", cf.get("n"), "from", cf.get("from"), "brier", cf.get("brier"), " | ".join(f"{k} 고른 {cf.get(k,{}).get('sel_share')}% 적중 {cf.get(k,{}).get('sel_hit')} (전체 {cf.get(k,{}).get('all_hit')})" for k in ("앞", "뒤", "최근3년", "전체")), "now", cf.get("p"), flush=True)
json.dump(R, open("probe/cnconf_bt.json", "w"), ensure_ascii=False)
