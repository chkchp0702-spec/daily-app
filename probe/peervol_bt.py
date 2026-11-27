"""11/27 12시 🌊 흔들림 보강: 「다른 시장들의 흔들림」(전염·동조) → 5시장 3목표
  (자기 종가·VIX 가 아니라 나머지 4개 시장 지수에서 나오는 값 — 그 시점에 이미 닫힌 시장만 씀)
  형태(결과 보기 전에 정함) 3가지: pv5 = log(나머지 4시장 5일 표준편차 평균) · nbig = 나머지 4시장 중 마지막 날 ±1% 넘은 수 · pmin5 = 나머지 4시장 5일 수익 중 가장 나쁜 값
  때 맞춤: 아시아 저녁판 = 다른 아시아·미국 모두 하루 전 값(홍콩이 아직 안 닫혔을 수 있음) · 아시아 아침판 = 아시아 그날·미국 그날(간밤) · 미국 = 아시아 그날
  근거: 변동성 전염(Diebold·Yilmaz 2009 spillover)
  기본 = lrv5·lrv20·ar1·r5·lvix·dvix [+usa·usr 아침판] + hl5(HL_TG) · 같은 표본
  붙이는 조건: 앞·뒤·최근3년 실력 모두 기본보다↑ 그리고 최근3년 > 0"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX"})
H = {}
for s in syms:
    x = yf.download(s, start="1995-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()) if len(H[s]) else "-", str(H[s].index[-1].date()) if len(H[s]) else "-", flush=True)

spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
FN = ("pv5", "nbig", "pmin5")
RET = {mk: H[c["ix"]]["Close"].astype(float).pct_change() for mk, c in prob.MK.items()}


def peers(me, mode):
    sd, big, r5 = [], [], []
    idx = H[prob.MK[me]["ix"]].index
    for mk, r in RET.items():
        if mk == me:
            continue
        a = r.rolling(5).std() * 100; b = (r.abs() > 0.01).astype(float).where(r.notna()); c5 = (1 + r).rolling(5).apply(np.prod, raw=True) - 1
        if mode == "저녁판":
            a, b, c5 = a.shift(1), b.shift(1), c5.shift(1)
        sd.append(prob_vol._align(a.dropna(), idx)); big.append(prob_vol._align(b.dropna(), idx)); r5.append(prob_vol._align(c5.dropna(), idx))
    return {"pv5": np.log(pd.concat(sd, axis=1).mean(axis=1) + 0.05),
            "nbig": pd.concat(big, axis=1).sum(axis=1, min_count=4),
            "pmin5": (pd.concat(r5, axis=1).min(axis=1) * 100).clip(-20, 20)}


out = {}; summary = []; ntest = 0
for mk, cfg in prob.MK.items():
    px = H[cfg["ix"]]; c = px["Close"]; idx = c.index
    asia = mk != "US"
    hl = np.log((px["High"] / px["Low"]).where(px["High"] > px["Low"]))
    hl5 = np.log(hl.rolling(5, min_periods=3).mean() * 100 + 0.05)
    modes = ("저녁판", "아침판") if asia else ("미국",)
    R = {}
    for mn in modes:
        if mn == "저녁판":
            d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        elif mn == "아침판":
            d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
        else:
            d = prob_vol.frame(c, None, vix, False); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        d["hl5"] = hl5
        for fn, f in peers(mk, mn).items():
            d["h_" + fn] = f
        for tg in prob_vol.TG:
            base = base0 + (["hl5"] if tg in prob_vol.HL_TG.get(mk, ()) else [])
            for sn in ("h",):
                cols = [sn + "_" + fn for fn in FN]
                dd = d.dropna(subset=base + cols)
                res = {}
                try:
                    P, B = prob_vol.walk(dd, base, tg); res["기본"] = prob_vol.judge(dd, P, B, tg)
                except Exception as e:
                    print(mk, mn, tg, sn, "기본 err", e, flush=True); continue
                for col in cols:
                    ntest += 1
                    try:
                        P, B = prob_vol.walk(dd, base + [col], tg); res["+" + col] = prob_vol.judge(dd, P, B, tg)
                    except Exception as e:
                        res["+" + col] = {"err": str(e)[:100]}
                b = res["기본"]
                if not b:
                    print(mk, mn, tg, sn, "표본 부족", flush=True); continue
                for nm, j in res.items():
                    if not j or "err" in j:
                        print(mk, mn, tg, nm, j, flush=True); continue
                    better = nm != "기본" and all(j[k]["skill"] > b[k]["skill"] for k in ("앞", "뒤", "최근3년")) and j["최근3년"]["skill"] > 0
                    line = f"{mk} {mn} {tg} {nm:10s} 앞 {j['앞']['skill']} 뒤 {j['뒤']['skill']} 최근3년 {j['최근3년']['skill']} 전체 {j['전체']['skill']} auc {j['auc']} n {j['n']} from {j['from']} {'✅' if better else ''}"
                    print(line, flush=True)
                    if better:
                        summary.append(line + f"  (기본 {b['앞']['skill']}/{b['뒤']['skill']}/{b['최근3년']['skill']})")
                R[f"{mn}_{tg}_{sn}"] = {k: ({x: v[x] for x in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n", "from")} if v and "err" not in v else v) for k, v in res.items()}
    out[mk] = R
json.dump(out, open("probe/peervol_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수", ntest)
print("==== 통과(앞·뒤·최근3년 모두↑ + 최근3년>0)")
for s in summary:
    print(s)
print("끝")
