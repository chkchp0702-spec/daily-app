"""임시 시험(11/18): 야후가 마지막 마감 봉을 빼고 주는지 — period=1y vs start/end vs 직접 chart API"""
import datetime as dt, json, time, urllib.request
import yfinance as yf
S = ["AAPL", "MSFT", "NVDA", "SPY", "JPM", "XOM", "005930.KS", "7203.T", "0700.HK", "600519.SS"]
print("yfinance", yf.__version__, dt.datetime.utcnow().isoformat())
def last(df):
    out = {}
    for s in S:
        try:
            c = df[s]["Close"].dropna(); out[s] = c.index[-1].strftime("%m-%d")
        except Exception as e:
            out[s] = "x"
    return out
print("period=1y      ", last(yf.download(S, period="1y", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)))
now = dt.datetime.utcnow()
print("start/end      ", last(yf.download(S, start=(now - dt.timedelta(days=370)).strftime("%Y-%m-%d"), end=(now + dt.timedelta(days=2)).strftime("%Y-%m-%d"), interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)))
print("period=5d      ", last(yf.download(S, period="5d", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)))
print("US 만 period=1y", last(yf.download(S[:6], period="1y", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)))
for host in ("query1", "query2"):
    for q in ("range=1y&interval=1d", "period1=%d&period2=%d&interval=1d" % (int(time.time()) - 370 * 86400, int(time.time()) + 86400)):
        try:
            u = "https://%s.finance.yahoo.com/v8/finance/chart/AAPL?%s" % (host, q)
            j = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=20).read())
            r = j["chart"]["result"][0]; ts = r["timestamp"]; cl = r["indicators"]["quote"][0]["close"]
            print(host, q[:8], [(dt.datetime.utcfromtimestamp(t).strftime("%m-%d %H:%M"), None if c is None else round(c, 2)) for t, c in zip(ts[-3:], cl[-3:])], "regularMarketTime", dt.datetime.utcfromtimestamp(r["meta"]["regularMarketTime"]).strftime("%m-%d %H:%M"))
        except Exception as e:
            print(host, q[:8], "실패", str(e)[:120])
