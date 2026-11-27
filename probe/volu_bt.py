"""11/27 14시 🌊 흔들림 보강: 자기 지수 「거래량」(거래량-변동성 관계) → 5시장 3목표
  (방향엔 #8 로 10/21 기각 — 흔들림 쪽엔 처음)
  형태(결과 보기 전에 정함) 3가지: u1 = log(오늘 거래량 ÷ 60일 평균) · u5 = log(5일 평균 ÷ 60일 평균) · up = u5 의 1년(250일) 백분위
  때 맞춤: 자기 시장 그날 마감 뒤 값(저녁판·아침판·미국 모두 그날 거래량) · 거래량 0 은 빈칸
  근거: 거래량이 변동성 군집을 상당 부분 설명(Lamoureux·Lastrapes 1990, 혼합분포 가설)
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
    x = x[["Open", "High", "Low", "Close", "Volume"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()) if len(H[s]) else "-", str(H[s].index[-1].date()) if len(H[s]) else "-", flush=True)

spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
FN = ("u1", "u5", "up")


def volf(px):
    v = px["Volume"].astype(float).where(px["Volume"] > 0)
    m60 = v.rolling(60, min_periods=40).mean()
    u5 = np.log(v.rolling(5, min_periods=4).mean() / m60)
    return {"u1": np.log(v / m60).clip(-3, 3), "u5": u5.clip(-3, 3),
            "up": u5.rolling(250, min_periods=200).rank(pct=True)}


out = {}; summary = []; ntest = 0
for mk, cfg in prob.MK.items():
    px = H[cfg["ix"]]; c = px["Close"]; idx = c.index
    asia = mk != "US"
    vv = px["Volume"]; print("거래량", mk, "0 아닌 날", int((vv > 0).sum()), "첫", str(vv[vv > 0].index[0].date()) if (vv > 0).any() else "-", "최근20일 0 수", int((vv.iloc[-20:] <= 0).sum()), flush=True)
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
        for fn, f in volf(px).items():
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
json.dump(out, open("probe/volu_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수", ntest)
print("==== 통과(앞·뒤·최근3년 모두↑ + 최근3년>0)")
for s in summary:
    print(s)
print("끝")
