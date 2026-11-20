"""11/20 12시 🌊 2-B KRX 계정 자료 → 한국 흔들림·급락 위험 (퀀트 기법 총점검 뒤 「다 해」)
  1) 받기(pykrx + 비밀값 KRX_ID·KRX_PW — 값은 출력하지 않음):
     ① 코스피·코스닥 공매도 거래대금(투자자 합계) ÷ 시장 거래대금 = 공매도 거래 비중 → archive/x/kr_short.csv
     ②③ 파생(옵션 투자자별·선물 미결제) — pykrx 에 있는 함수 이름부터 찾아 적음(이번엔 발견만)
  2) 시험: 한국 🌊 3목표 × 저녁판(하루 전 값)·아침판(그날 값) · 형태(결과 보기 전에 정함): 수준 log 비중 · 1년 백분위 · 5일 변화
     공매도 전면 금지 기간(2020-03-16~2021-05-02, 2023-11-06~2025-03-30)은 비움
     기본 = 화면 특성(lrv5·lrv20·ar1·r5·lvix·dvix [+usa·usr] + hl5(HL_TG)) · 같은 표본
     붙이는 조건: 앞·뒤·최근3년 실력 모두 기본보다↑ + 최근3년 > 0 · 방향 확률엔 붙이지 않음"""
import datetime as dt, json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd

print("KRX_ID 있음" if os.environ.get("KRX_ID") else "KRX_ID 없음", flush=True)
from pykrx import stock

print("pykrx 파생 함수:", [n for n in dir(stock) if any(k in n.lower() for k in ("future", "option", "deriv", "shorting"))], flush=True)

today = dt.date.today()
rows = []
for mkt, tk in (("KOSPI", "1001"), ("KOSDAQ", "2001")):
    for y in range(2008, today.year + 1):
        a, b = f"{y}0101", min(dt.date(y, 12, 31), today).strftime("%Y%m%d")
        sv = tv = None
        try:
            s = stock.get_shorting_investor_value_by_date(a, b, mkt)
            col = [c for c in s.columns if "합계" in str(c)] or [s.columns[-1]]
            sv = s[col[0]].astype(float)
        except Exception as e:
            print("공매도", mkt, y, "실패", str(e)[:150], flush=True)
        try:
            o = stock.get_index_ohlcv(a, b, tk)
            col = [c for c in o.columns if "거래대금" in str(c)]
            tv = o[col[0]].astype(float) if col else None
        except Exception as e:
            print("지수", mkt, y, "실패", str(e)[:150], flush=True)
        if sv is not None and tv is not None and len(sv):
            d = pd.DataFrame({"short_val": sv, "trade_val": tv.reindex(sv.index)})
            d["mkt"] = mkt; rows.append(d)
            print("공매도", mkt, y, len(d), flush=True)
if not rows:
    print("공매도 자료 없음 — 끝"); sys.exit(0)
K = pd.concat(rows); K.index = pd.to_datetime(K.index); K.index.name = "date"
K.reset_index()[["date", "mkt", "short_val", "trade_val"]].to_csv("archive/x/kr_short.csv", index=False)
print(K.groupby("mkt").apply(lambda g: f"{g.index.min().date()}~{g.index.max().date()} n={len(g)}"), flush=True)

# ②③ 발견: pykrx 의 선물/옵션 함수 시그니처만 출력
import inspect
for n in dir(stock):
    if any(k in n.lower() for k in ("future", "option")):
        try: print("함수", n, inspect.signature(getattr(stock, n)), flush=True)
        except Exception: pass

# ---- 시험
import yfinance as yf
import prob, prob_vol
H = {}
for s in ("^KS11", "^GSPC", "^VIX"):
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    H[s] = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"]); H[s] = H[s][~H[s].index.duplicated(keep="last")]
spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
px = H["^KS11"]; c = px["Close"]; idx = c.index
hl = np.log((px["High"] / px["Low"]).where(px["High"] > px["Low"]))
hl5 = np.log(hl.rolling(5, min_periods=3).mean() * 100 + 0.05)
ban = [("2020-03-16", "2021-05-02"), ("2023-11-06", "2025-03-30")]
SRC = {}
for mkt, nm in (("KOSPI", "sk"), ("KOSDAQ", "sq")):
    g = K[K.mkt == mkt]
    r = (g["short_val"] / g["trade_val"]).where((g["short_val"] > 0) & (g["trade_val"] > 0))
    for a, b in ban: r[(r.index >= a) & (r.index <= b)] = np.nan
    SRC[nm] = np.log(r)

def forms(s):
    s2 = s.dropna()
    return {"lv": s, "pc": s2.rolling(252, min_periods=200).rank(pct=True).reindex(s.index), "d5": (s2 - s2.shift(5)).reindex(s.index)}

summary = []; out = {}; ntest = 0
for mn in ("저녁판", "아침판"):
    if mn == "저녁판":
        d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
    else:
        d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
    d["hl5"] = hl5
    for sn, s in SRC.items():
        for fn, f in forms(s).items():
            f = f.reindex(idx)
            d[sn + "_" + fn] = f.shift(1) if mn == "저녁판" else f
    for tg in prob_vol.TG:
        base = base0 + (["hl5"] if tg in prob_vol.HL_TG.get("KR", ()) else [])
        for sn in SRC:
            cols = [sn + "_" + fn for fn in ("lv", "pc", "d5")]
            dd = d.dropna(subset=base + cols)
            res = {}
            try:
                P, B = prob_vol.walk(dd, base, tg, start=2010); res["기본"] = prob_vol.judge(dd, P, B, tg)
            except Exception as e:
                print(mn, tg, sn, "기본 err", e, flush=True); continue
            for col in cols:
                ntest += 1
                try:
                    P, B = prob_vol.walk(dd, base + [col], tg, start=2010); res["+" + col] = prob_vol.judge(dd, P, B, tg)
                except Exception as e:
                    res["+" + col] = {"err": str(e)[:100]}
            b = res["기본"]
            if not b: print(mn, tg, sn, "표본 부족", flush=True); continue
            for nm, j in res.items():
                if not j or "err" in j: print(mn, tg, nm, j, flush=True); continue
                better = nm != "기본" and all(j[k]["skill"] > b[k]["skill"] for k in ("앞", "뒤", "최근3년")) and j["최근3년"]["skill"] > 0
                line = f"KR {mn} {tg} {nm:10s} 앞 {j['앞']['skill']} 뒤 {j['뒤']['skill']} 최근3년 {j['최근3년']['skill']} 전체 {j['전체']['skill']} auc {j['auc']} n {j['n']} from {j['from']} {'✅' if better else ''}"
                print(line, flush=True)
                if better: summary.append(line + f"  (기본 {b['앞']['skill']}/{b['뒤']['skill']}/{b['최근3년']['skill']})")
            out[f"{mn}_{tg}_{sn}"] = {k: ({x: v[x] for x in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n", "from")} if v and "err" not in v else v) for k, v in res.items()}
json.dump(out, open("probe/krxacct_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수", ntest)
print("==== 통과")
for s in summary: print(s)
print("끝")
