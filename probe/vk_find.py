"""#61 VKOSPI 공개 주소 찾기 — 확률 보강 11/3 16시 (Actions)"""
import requests, re
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://finance.naver.com/"}
U = [
 "https://fchart.stock.naver.com/sise.nhn?symbol=VKOSPI&timeframe=day&count=6000&requestType=0",
 "https://fchart.stock.naver.com/sise.nhn?symbol=KPI200VOL&timeframe=day&count=6000&requestType=0",
 "https://fchart.stock.naver.com/sise.nhn?symbol=VKOSPI200&timeframe=day&count=6000&requestType=0",
 "https://api.stock.naver.com/chart/domestic/index/VKOSPI?periodType=dayCandle",
 "https://api.stock.naver.com/chart/domestic/index/VKOSPI/day?startDateTime=200901010000&endDateTime=202611040000",
 "https://m.stock.naver.com/api/index/VKOSPI/price?pageSize=20&page=1",
 "https://m.stock.naver.com/api/index/VKOSPI/basic",
 "https://finance.naver.com/sise/sise_index_day.naver?code=VKOSPI&page=1",
 "https://finance.daum.net/api/quotes/D.VKOSPI?summary=false",
 "https://finance.daum.net/api/market_index/days?page=1&perPage=10&market=VKOSPI",
 "https://query1.finance.yahoo.com/v8/finance/chart/%5EVKOSPI?range=max&interval=1d",
 "https://stooq.com/q/d/l/?s=^vkospi&i=d",
 "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",
]
for u in U:
    try:
        if "krx" in u:
            r = requests.post(u, data={"bld": "dbms/MDC/STAT/standard/MDCSTAT00301", "indIdx": "1", "indIdx2": "300", "strtDd": "20240101", "endDd": "20241231"}, headers={**UA, "Referer": "https://data.krx.co.kr/"}, timeout=20)
        else:
            h = dict(UA)
            if "daum" in u: h["Referer"] = "https://finance.daum.net/"
            r = requests.get(u, headers=h, timeout=20)
        t = r.text
        print("##", r.status_code, len(t), u); print(re.sub(r"\s+", " ", t[:400])); print("   ...", re.sub(r"\s+", " ", t[-200:]))
    except Exception as e:
        print("##", "ERR", u, e)
