"""🔑 KRX 공매도 거래 비중 매일 이어 쌓기 (11/20 🎲 2-B — 비밀값 KRX_ID·KRX_PW, 값은 출력 안 함)
   archive/x/kr_short.csv (date, mkt, short_val, trade_val) · 공매도 거래대금(투자자 합계) · 지수 거래대금
   🌊 한국 일주일 −3% 에 코스닥 공매도 비중 1년 백분위가 2023~ 짧은 표본에서 저녁·아침판 모두 나았음(➖ 그림자) → 이력 쌓아 다시 검증"""
import datetime as dt, os, sys
import pandas as pd
from pykrx import stock

P = "archive/x/kr_short.csv"
old = pd.read_csv(P) if os.path.exists(P) else pd.DataFrame(columns=["date", "mkt", "short_val", "trade_val"])
a = (pd.to_datetime(old["date"]).max() - pd.Timedelta(days=14)).strftime("%Y%m%d") if len(old) else "20170101"
b = dt.date.today().strftime("%Y%m%d")
new = []
for mkt, tk in (("KOSPI", "1001"), ("KOSDAQ", "2001")):
    try:
        s = stock.get_shorting_investor_value_by_date(a, b, mkt)
        col = [c for c in s.columns if "합계" in str(c)] or [s.columns[-1]]
        o = stock.get_index_ohlcv(a, b, tk); tc = [c for c in o.columns if "거래대금" in str(c)][0]
        d = pd.DataFrame({"short_val": s[col[0]].astype(float), "trade_val": o[tc].astype(float).reindex(s.index)})
        d.index = pd.to_datetime(d.index).strftime("%Y-%m-%d"); d.index.name = "date"
        d = d.reset_index(); d["mkt"] = mkt; new.append(d)
        print(mkt, len(d), d["date"].max())
    except Exception as e:
        print(mkt, "실패", str(e)[:150])
if not new:
    sys.exit(0)
df = pd.concat([old] + new)
df = df[df["short_val"].fillna(0) > 0].drop_duplicates(["date", "mkt"], keep="last").sort_values(["mkt", "date"])
df[["date", "mkt", "short_val", "trade_val"]].to_csv(P, index=False)
print("저장", len(df))
