"""11/19 16시 🎯 자신 있는 날 넓히기 2 — 일본·홍콩·중국에 「그 나라 마감 뒤」 선물 근거 (걸어가기 · 앞/뒤/최근3년)
  기본 = 화면 conf(간밤 S&P usr · 자기 등락 크기 ar1 · 5일 r5 · VIX lvix (+한국 etfx=EWY))
  후보: nkx = CME 닛케이 선물(NKD=F, 엔 지수 그대로·환율 잡음 없음) 그날 등락 − 닛케이 그날 등락 (일본 마감 뒤 몫)
        nkg = log(NKD/닛케이) 의 20일 평균 대비 벌어짐(수준판)
        esx = E-mini S&P(ES=F) 그날 등락 − S&P 그날 등락 (미국 현물 마감 뒤 몫)
  붙이는 조건: 골라진 날 적중·비율이 앞·뒤 모두 기본보다 늘(하나는 같아도 됨)고 최근3년 적중이 안 나빠질 때. 같은 표본(후보 있는 날만)."""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import prob, prob_vol
syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX", "EWY", "NKD=F", "ES=F"})
H = prob.load_hist(syms)
for s in ("NKD=F", "ES=F", "EWY"):
    x = H.get(s, pd.DataFrame()).get("Close")
    print("자료", s, None if x is None else (len(x.dropna()), str(x.dropna().index[0].date()), str(x.dropna().index[-1].date())), flush=True)
spx = H["^GSPC"]["Close"].dropna(); vix = H["^VIX"]["Close"].dropna()
def brier(d, P):
    y = d["y1"].reindex(P.index); m = P.notna() & y.notna()
    return round(float(np.mean((P[m] - y[m]) ** 2)), 5)
def rx(sym, c):
    e = H[sym]["Close"].dropna()
    return prob_vol._align(e.pct_change() * 100, c.index)
out = {}
for mk in ("KR", "JP", "CN", "HK"):
    c = H[prob.MK[mk]["ix"]]["Close"].dropna()
    d = prob_vol.frame(c, spx, vix, True)
    r1 = (c.pct_change() * 100).clip(-10, 10)
    base = ["usr", "ar1", "r5", "lvix"]
    if mk == "KR":
        d["etfx"] = (rx("EWY", c) - r1).clip(-8, 8); base = base + ["etfx"]
    cand = {}
    if "ES=F" in H:
        d["esx"] = (rx("ES=F", c) - prob_vol._align(spx.pct_change() * 100, c.index)).clip(-5, 5); cand["esx"] = ["esx"]
    if "NKD=F" in H:
        d["nkx"] = (rx("NKD=F", c) - r1).clip(-8, 8) if mk == "JP" else rx("NKD=F", c).clip(-8, 8) - prob_vol._align(H["^N225"]["Close"].pct_change() * 100, c.index).clip(-8, 8)
        cand["nkx"] = ["nkx"]
        if mk == "JP":
            nk = prob_vol._align(H["NKD=F"]["Close"].dropna(), c.index)
            g = np.log(nk / c); d["nkg"] = ((g - g.rolling(20).mean().shift(1)) * 100).clip(-8, 8); cand["nkg"] = ["nkg"]
    allc = sorted({x for v in cand.values() for x in v})
    dd = d.dropna(subset=base + allc)
    dd = dd[dd.index >= "2004-01-01"]
    R = {}
    for nm, f in [("기본", base)] + [("+" + k, base + v) for k, v in cand.items()]:
        try:
            cf = prob_vol.conf(dd, f)
            P, _ = prob_vol.walk(dd, f, "y1")
            cf["brier"] = brier(dd, P)
        except Exception as ex:
            cf = {"err": str(ex)[:160]}
        R[nm] = cf
        print(mk, nm, "n", cf.get("n"), "from", cf.get("from"), "brier", cf.get("brier"), " | ".join(f"{k} 고른 {cf.get(k,{}).get('sel_share')}% 적중 {cf.get(k,{}).get('sel_hit')} (전체 {cf.get(k,{}).get('all_hit')})" for k in ("앞", "뒤", "최근3년", "전체")), "now", cf.get("p"), flush=True)
    out[mk] = R
json.dump(out, open("probe/nkd_bt.json", "w"), ensure_ascii=False)
