"""11/20 10시 🌊 2-A 옵션 꼬리 가격 → 흔들림·급락 위험 (퀀트 기법 총점검 뒤 「다 해」)
  후보 자료(미국 날짜 t 값 → 아시아는 날짜 t 에 맞춤: 아침판 = 그날 밤 값, 저녁판 = 하루 전 값):
    skew  CBOE SKEW(^SKEW) — 외가 풋이 얼마나 비싼가
    pcr   Cboe 전체 풋/콜 비율(archive/x/pcr_total.csv — 2006-11~)
    v9    VIX9D/VIX(^VIX9D, 2011~) — 가까운 만기 겁(역전 = 당장 겁)
  형태(결과 보기 전에 정함) 3가지씩: 수준(lv) · 1년 백분위(pc, 252일) · 5일 변화(d5)
  기본 = 지금 화면 특성(lrv5·lrv20·ar1·r5·lvix·dvix [+usa·usr 아침판] + hl5(HL_TG)) · gap 은 뺌(같은 표본 비교라 상대 판정엔 영향 적음)
  표본: 자료마다 그 자료가 있는 날로 같은 표본(기본도 그 표본에서 다시)
  붙이는 조건: 앞·뒤·최근3년 실력 모두 기본보다↑ 그리고 최근3년 > 0"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX", "^SKEW", "^VIX9D"})
H = {}
for s in syms:
    x = yf.download(s, start="1995-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()) if len(H[s]) else "-", str(H[s].index[-1].date()) if len(H[s]) else "-", flush=True)

pcr = pd.read_csv("archive/x/pcr_total.csv", index_col=0, parse_dates=True)["pcr"].astype(float)
pcr = pcr[pcr > 0]
print("자료 pcr", len(pcr), str(pcr.index[0].date()), str(pcr.index[-1].date()), flush=True)
spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
SRC = {}
if len(H["^SKEW"]) > 1000:
    SRC["skew"] = np.log(H["^SKEW"]["Close"])
SRC["pcr"] = np.log(pcr)
if len(H["^VIX9D"]) > 1000:
    v9 = H["^VIX9D"]["Close"]
    SRC["v9"] = np.log(v9 / vix.reindex(v9.index)).dropna()


def forms(s):
    s = s.dropna()
    return {"lv": s, "pc": s.rolling(252, min_periods=200).rank(pct=True), "d5": (s - s.shift(5))}


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
        for sn, s in SRC.items():
            for fn, f in forms(s).items():
                if mn == "저녁판":
                    f = f.shift(1)
                d[sn + "_" + fn] = prob_vol._align(f, idx) if asia else f.reindex(idx).ffill()
        for tg in prob_vol.TG:
            base = base0 + (["hl5"] if tg in prob_vol.HL_TG.get(mk, ()) else [])
            for sn in SRC:
                cols = [sn + "_" + fn for fn in ("lv", "pc", "d5")]
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
json.dump(out, open("probe/skewvol_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수", ntest)
print("==== 통과(앞·뒤·최근3년 모두↑ + 최근3년>0)")
for s in summary:
    print(s)
print("끝")
