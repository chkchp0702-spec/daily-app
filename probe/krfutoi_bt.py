"""11/23 12시 🌊 2-B 나머지: 코스피200 선물 미결제(KRX 계정으로 받은 archive/x/kr_fut_oi.csv, 2010~) → 한국 흔들림·급락 위험
  형태(결과 보기 전에 정함): 전체 미결제 oi_all 의 수준 log · 1년 백분위 · 5일 변화(log)
  저녁판 = 하루 전 값(마감 직후엔 확정 미결제를 모름) · 아침판 = 그날 값
  기본 = 화면 특성(lrv5·lrv20·ar1·r5·lvix·dvix [+usa·usr]) + hl5(HL_TG) + skew(OPT_TG 한국 5일) · 같은 표본
  붙이는 조건: 앞·뒤·최근3년 실력 모두 기본보다↑ + 최근3년 > 0 (+ 저녁·아침판 둘 다) · 방향 확률엔 붙이지 않음"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd, yfinance as yf
import prob_vol

K = pd.read_csv("archive/x/kr_fut_oi.csv", parse_dates=["date"]).set_index("date").sort_index()
K = K[~K.index.duplicated(keep="last")]
oi = K["oi_all"].where(K["oi_all"] > 0)
print("미결제", K.index.min().date(), "~", K.index.max().date(), "n", int(oi.notna().sum()), flush=True)

H = {}
for s in ("^KS11", "^GSPC", "^VIX", "^SKEW"):
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    H[s] = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"]); H[s] = H[s][~H[s].index.duplicated(keep="last")]
    print(s, len(H[s]), flush=True)
spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
px = H["^KS11"]; c = px["Close"]; idx = c.index
hl5 = prob_vol._hl5(px, idx)
sk = np.log(H["^SKEW"]["Close"].where(H["^SKEW"]["Close"] > 0)).dropna()

lo = np.log(oi).dropna()
F = {"lv": lo, "pc": lo.rolling(252, min_periods=200).rank(pct=True), "d5": lo - lo.shift(5)}

summary = []; out = {}; ntest = 0
for mn in ("저녁판", "아침판"):
    if mn == "저녁판":
        d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
    else:
        d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
    d["hl5"] = hl5
    d["skew"] = prob_vol._align(sk if mn == "아침판" else sk.shift(1), d.index)
    for fn, f in F.items():
        f = f.reindex(d.index)
        d["oi_" + fn] = f.shift(1) if mn == "저녁판" else f
    for tg in prob_vol.TG:
        base = base0 + (["hl5"] if tg in prob_vol.HL_TG.get("KR", ()) else []) + (["skew"] if prob_vol.OPT_TG.get("KR", {}).get(tg) == "skew" else [])
        cols = ["oi_lv", "oi_pc", "oi_d5"]
        dd = d.dropna(subset=base + cols)
        res = {}
        P, B = prob_vol.walk(dd, base, tg, start=2010); res["기본"] = prob_vol.judge(dd, P, B, tg)
        for col in cols:
            ntest += 1
            P, B = prob_vol.walk(dd, base + [col], tg, start=2010); res["+" + col] = prob_vol.judge(dd, P, B, tg)
        b = res["기본"]
        if not b: print(mn, tg, "표본 부족", flush=True); continue
        for nm, j in res.items():
            if not j: continue
            better = nm != "기본" and all(j[k]["skill"] > b[k]["skill"] for k in ("앞", "뒤", "최근3년")) and j["최근3년"]["skill"] > 0
            line = f"KR {mn} {tg} {nm:8s} 앞 {j['앞']['skill']} 뒤 {j['뒤']['skill']} 최근3년 {j['최근3년']['skill']} 전체 {j['전체']['skill']} auc {j['auc']} n {j['n']} from {j['from']} {'✅' if better else ''}"
            print(line, flush=True)
            if better: summary.append(line + f"  (기본 {b['앞']['skill']}/{b['뒤']['skill']}/{b['최근3년']['skill']} auc {b['auc']})")
        out[f"{mn}_{tg}"] = {k: ({x: v[x] for x in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n", "from")} if v else v) for k, v in res.items()}
json.dump(out, open("probe/krfutoi_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수", ntest)
print("==== 통과")
for s in summary: print(s)
print("끝")
