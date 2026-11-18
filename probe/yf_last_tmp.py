import datetime as dt
import yfinance as yf, pandas as pd
S = ["AAPL", "MSFT", "SPY", "XOM", "BRK-B", "005930.KS", "7203.T", "0700.HK", "600519.SS"]
d = yf.download(S, period="5d", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)
print("일봉 꼬리 AAPL", d["AAPL"].tail(3).to_dict("split")["data"], [str(x) for x in d.index[-3:]])
for iv in ("1h", "30m", "5m"):
    h = yf.download(S, period="5d", interval=iv, group_by="ticker", auto_adjust=False, threads=True, progress=False, ignore_tz=False)
    out = {}
    for s in S:
        try:
            c = h[s]["Close"].dropna(); out[s] = (str(c.index[-1])[:16], round(float(c.iloc[-1]), 2))
        except Exception as e:
            out[s] = "x"
    print(iv, out)
for s in ("AAPL", "XOM"):
    fi = yf.Ticker(s).fast_info
    print(s, "fast_info last", fi["lastPrice"], "prev", fi["previousClose"])
