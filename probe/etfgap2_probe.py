# 🎯 11/26 12시: 장중(KST 10~11시대) 실행에서 EWY·FXI·ASHR 일봉이 전날 봉을 잃는 문제 — 지금 야후가 무엇을 주는지
import yfinance as yf, pandas as pd, datetime as dt
print("UTC now", dt.datetime.utcnow())
S = ["EWY", "FXI", "ASHR", "^GSPC", "SPY", "NKD=F", "KWEB", "EWJ"]
df = yf.download(S, start="2026-11-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
for s in S:
    try:
        sub = df[s][["Open", "Close", "Volume"]]
        print("묶음", s, sub.tail(3).to_string().replace("\n", " | "))
    except Exception as e:
        print("묶음 실패", s, e)
for s in ["EWY", "FXI", "ASHR"]:
    one = yf.download(s, start="2026-11-01", interval="1d", auto_adjust=False, progress=False)
    print("하나", s, one.tail(3).to_string().replace("\n", " | "))
    t = yf.Ticker(s)
    try:
        h = t.history(period="5d", interval="1d", auto_adjust=False)
        print("history", s, h[["Close"]].tail(3).to_string().replace("\n", " | "))
    except Exception as e:
        print("history 실패", s, e)
    try:
        h = t.history(period="5d", interval="1h", auto_adjust=False, prepost=False)
        print("1h", s, h[["Close"]].tail(4).to_string().replace("\n", " | "))
    except Exception as e:
        print("1h 실패", s, e)
    try:
        fi = t.fast_info
        print("fast", s, fi.get("previousClose"), fi.get("lastPrice"), fi.get("regularMarketPreviousClose"))
    except Exception as e:
        print("fast 실패", s, e)
    try:
        h = t.history(period="1mo", interval="1d", auto_adjust=False, repair=False, raise_errors=False)
        print("1mo", s, h[["Close"]].tail(3).to_string().replace("\n", " | "))
    except Exception as e:
        print("1mo 실패", s, e)
