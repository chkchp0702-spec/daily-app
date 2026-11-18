"""11/18 🎯 자신 있는 날 넓히기 — prob_vol.conf 특성에 아시아 닻 근거 더하기 시험 (걸어가기 · 앞/뒤/최근3년)
  기본: 간밤 S&P(usr) + 자기 등락 크기(ar1) + 5일(r5) + VIX(lvix)
  후보: etfx = 미국 상장 국가 ETF(EWY·EWJ·EWH) 그날 등락 − 그 나라 지수 그날 등락 (그 나라 마감 뒤 더 움직인 몫)
        r1 = 자기 그날 등락(부호) · 둘 다 · 기준 58/42·62/38
  붙이는 조건: 골라진 날 적중(sel_hit)·골라진 날 비율(sel_share) 이 앞·뒤 모두 기본보다 늘(또는 같고 다른 쪽이 늘)고 최근3년 적중이 안 나빠질 때"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import prob, prob_vol
ETF = {"KR": "EWY", "JP": "EWJ", "HK": "EWH"}
syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX"} | set(ETF.values()))
H = prob.load_hist(syms)
spx = H["^GSPC"]["Close"].dropna(); vix = H["^VIX"]["Close"].dropna()
def brier(d, P):
    y = d["y1"].reindex(P.index); m = P.notna() & y.notna()
    return round(float(np.mean((P[m] - y[m]) ** 2)), 5)
out = {}
for mk, cfg in prob.MK.items():
    if mk == "US" or cfg["ix"] not in H:
        continue
    c = H[cfg["ix"]]["Close"].dropna()
    d = prob_vol.frame(c, spx, vix, True)
    d["r1"] = (c.pct_change() * 100).clip(-10, 10)
    base = ["usr", "ar1", "r5", "lvix"]
    V = {"기본": (base, .4, .6), "+r1": (base + ["r1"], .4, .6), "기본 58/42": (base, .42, .58), "기본 62/38": (base, .38, .62)}
    if mk in ETF and ETF[mk] in H:
        e = H[ETF[mk]]["Close"].dropna()
        er = prob_vol._align(e.pct_change() * 100, c.index)
        d["etfx"] = (er - d["r1"]).clip(-8, 8)
        V["+etfx"] = (base + ["etfx"], .4, .6)
        V["+etfx+r1"] = (base + ["etfx", "r1"], .4, .6)
    R = {}
    for nm, (f, lo, hi) in V.items():
        dd = d.dropna(subset=f) if "etfx" in f else d.dropna(subset=["etfx"]) if "etfx" in d else d
        try:
            cf = prob_vol.conf(dd, f, lo, hi)
            P, _ = prob_vol.walk(dd, f, "y1")
            cf["brier"] = brier(dd, P)
        except Exception as ex:
            cf = {"err": str(ex)[:120]}
        R[nm] = cf
        print(mk, nm, "brier", cf.get("brier"), " | ".join(f"{k} 고른 {cf.get(k,{}).get('sel_share')}% 적중 {cf.get(k,{}).get('sel_hit')} (전체 {cf.get(k,{}).get('all_hit')})" for k in ("앞", "뒤", "최근3년", "전체")), "now", cf.get("p"), flush=True)
    out[mk] = R
json.dump(out, open("probe/conf_bt.json", "w"), ensure_ascii=False)
