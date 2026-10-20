import urllib.request, json
H={"User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)","Referer":"https://m.stock.naver.com/"}
U=[
"https://m.stock.naver.com/api/index/FUT/basic",
"https://m.stock.naver.com/api/index/FUT/price?pageSize=20&page=1",
"https://m.stock.naver.com/api/index/KPI200/price?pageSize=3&page=1",
"https://api.stock.naver.com/index/FUT/basic",
"https://api.finance.naver.com/siseJson.naver?symbol=FUT&requestType=1&startTime=20250601&endTime=20261020&timeframe=day",
"https://fchart.stock.naver.com/sise.nhn?symbol=FUT&timeframe=day&count=30&requestType=0",
"https://fchart.stock.naver.com/sise.nhn?symbol=FUT_NIGHT&timeframe=day&count=30&requestType=0",
"https://finance.naver.com/sise/sise_index_day.naver?code=FUT&page=1",
"https://finance.daum.net/api/quote/futures/KR4101",
"https://finance.daum.net/api/domestic/futures",
"https://query1.finance.yahoo.com/v8/finance/chart/%5EKS200?range=1mo&interval=1d",
"https://query1.finance.yahoo.com/v8/finance/chart/KS200%3DF?range=1mo&interval=1d",
"https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd?bld=dbms/MDC/STAT/standard/MDCSTAT12501&prodId=KRDRVFUK2I&strtDd=20261001&endDd=20261020&trdDdTp=2",
"https://stooq.com/q/d/l/?s=^kospi&i=d",
"https://www.investing.com/indices/korea-200-futures-historical-data",
]
for u in U:
    for hd in (H, dict(H, Referer="https://finance.daum.net/")):
        try:
            r=urllib.request.urlopen(urllib.request.Request(u,headers=hd),timeout=20); b=r.read()
            print("OK",r.status,len(b),u,"\n   ",b[:400].decode("utf-8","replace").replace("\n"," "))
            break
        except Exception as e:
            print("ERR",u,repr(e)[:120])
