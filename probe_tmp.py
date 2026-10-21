import requests, json, string
S=requests.Session(); S.headers["User-Agent"]="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36"
def show(n,f):
    try: r=f(); print("==",n,r.status_code,r.text[:1500].replace("\n"," "))
    except Exception as e: print("==",n,"ERR",e)
show("onv", lambda: S.get("https://api.onvista.de/api/v1/bonds/ISIN:US105756CJ75/snapshot",timeout=30))
show("tv", lambda: S.post("https://scanner.tradingview.com/bond/scan",json={"filter":[{"left":"name","operation":"match","right":"US105756"}],"columns":["name","description","close","yield_to_maturity","coupon","maturity_date","currency","exchange","update_mode"],"range":[0,100]},timeout=30))
show("tv2", lambda: S.post("https://scanner.tradingview.com/bond/scan",json={"filter":[{"left":"issuer_name","operation":"match","right":"Brazil"}],"columns":["name","description","close","yield_to_maturity","coupon","maturity_date","currency","exchange"],"range":[0,100]},timeout=30))
show("frank", lambda: S.get("https://api.boerse-frankfurt.de/v1/data/price_information/single?isin=US105756CJ75&mic=XFRA",timeout=30))
show("finra", lambda: S.get("https://www.finra.org/finra-data/fixed-income/bond?symbol=&bondType=SOVEREIGN",timeout=30))
show("cnbc", lambda: S.get("https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=BR10Y-USD%7CBR10Y&requestMethod=itv&noform=0&partnerId=2&fund=1&exthrs=1&output=json&events=1",timeout=30))
