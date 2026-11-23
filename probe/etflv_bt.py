"""11/23 10시 🎯 자신 있는 날 넓히기 3 — 국가 ETF 「수준판」(일본 nkg 처럼 log(ETF/지수) 의 20일 평균 대비 벌어짐)
  미리 정한 후보(결과 보기 전):
    한국: ewg = log(EWY/코스피) 벌어짐 → (a) etfx 대신 (b) etfx 에 더해
    홍콩: ehg = log(EWH/항셍) 벌어짐(홍콩달러 페그라 환율 잡음 적음) · fxg = log(FXI/항셍) 벌어짐
    중국: fxg = log(FXI/상해종합) 벌어짐
  기본 = 지금 화면 conf(usr·ar1·r5·lvix, 한국은 +etfx). 같은 표본(후보 있는 날만), 해마다 걸어가기.
  붙이는 조건(nkd_bt 와 같음): 골라진 날 적중·비율이 앞·뒤 모두 기본보다 늘(하나는 같아도 됨)고 최근3년 적중이 안 나빠질 때 + 방향 브라이어 안 나빠짐."""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import prob, prob_vol
syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX", "EWY", "EWH", "FXI"})
H = prob.load_hist(syms)
for s in ("EWY", "EWH", "FXI"):
    x = H.get(s, pd.DataFrame()).get("Close")
    print("자료", s, None if x is None else (len(x.dropna()), str(x.dropna().index[0].date()), str(x.dropna().index[-1].date())), flush=True)
spx = H["^GSPC"]["Close"].dropna(); vix = H["^VIX"]["Close"].dropna()
def brier(d, P):
    y = d["y1"].reindex(P.index); m = P.notna() & y.notna()
    return round(float(np.mean((P[m] - y[m]) ** 2)), 5)
def rx(sym, c):
    return prob_vol._align(H[sym]["Close"].dropna().pct_change() * 100, c.index)
def gap(sym, c):
    e = prob_vol._align(H[sym]["Close"].dropna(), c.index)
    g = np.log(e / c)
    return ((g - g.rolling(20).mean().shift(1)) * 100).clip(-8, 8)
out = {}
for mk in ("KR", "HK", "CN"):
    c = H[prob.MK[mk]["ix"]]["Close"].dropna()
    d = prob_vol.frame(c, spx, vix, True)
    r1 = (c.pct_change() * 100).clip(-10, 10)
    base = ["usr", "ar1", "r5", "lvix"]
    var = []
    if mk == "KR":
        d["etfx"] = (rx("EWY", c) - r1).clip(-8, 8); d["ewg"] = gap("EWY", c)
        var = [("기본", base + ["etfx"]), ("ewg 대신", base + ["ewg"]), ("+ewg", base + ["etfx", "ewg"])]
    if mk == "HK":
        d["ehg"] = gap("EWH", c); d["fxg"] = gap("FXI", c)
        var = [("기본", base), ("+ehg", base + ["ehg"]), ("+fxg", base + ["fxg"])]
    if mk == "CN":
        d["fxg"] = gap("FXI", c)
        var = [("기본", base), ("+fxg", base + ["fxg"])]
    allc = sorted({x for _, v in var for x in v})
    dd = d.dropna(subset=allc)
    dd = dd[dd.index >= "2004-01-01"]
    R = {}
    for nm, f in var:
        try:
            cf = prob_vol.conf(dd, f)
            P, _ = prob_vol.walk(dd, f, "y1")
            cf["brier"] = brier(dd, P)
        except Exception as ex:
            cf = {"err": str(ex)[:160]}
        R[nm] = cf
        print(mk, nm, "n", cf.get("n"), "from", cf.get("from"), "brier", cf.get("brier"), " | ".join(f"{k} 고른 {cf.get(k,{}).get('sel_share')}% 적중 {cf.get(k,{}).get('sel_hit')} (전체 {cf.get(k,{}).get('all_hit')})" for k in ("앞", "뒤", "최근3년", "전체")), "now", cf.get("p"), flush=True)
    out[mk] = R
json.dump(out, open("probe/etflv_bt.json", "w"), ensure_ascii=False)
