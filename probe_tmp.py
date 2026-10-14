import urllib.request, urllib.parse, json
H={"User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)","Referer":"https://m.stock.naver.com/","Accept":"application/json"}
def t(url, data=None, h=H):
    try:
        req=urllib.request.Request(url, data=data, headers=h)
        b=urllib.request.urlopen(req,timeout=20).read()
        print("OK",url[:110],len(b),b[:400].decode("utf-8","ignore").replace("\n"," "))
    except Exception as e: print("ERR",url[:110],e)
for u in ["https://m.stock.naver.com/api/index/KOSPI/trend",
          "https://m.stock.naver.com/api/index/KOSPI/trend?page=1&pageSize=60",
          "https://m.stock.naver.com/api/index/KOSPI/investorTrend?page=1&pageSize=60",
          "https://m.stock.naver.com/api/index/KOSPI/trend/list?page=1&pageSize=60",
          "https://m.stock.naver.com/api/index/KOSPI/integration",
          "https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate=20261014&sosok=&page=1",
          "https://finance.naver.com/sise/sise_trans_style.naver",
          "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
          "https://production.dataviz.cnn.io/index/fearandgreed/graphdata/2021-01-01",
          "https://production.dataviz.cnn.io/index/fearandgreed/graphdata/2024-01-01"]:
    t(u, h=dict(H, Referer="https://edition.cnn.com/") if "cnn" in u else H)
d=urllib.parse.urlencode({"bld":"dbms/MDC/STAT/standard/MDCSTAT02203","locale":"ko_KR","inqTpCd":"2","trdVolVal":"2","askBid":"3","mktId":"STK","strtDd":"20260901","endDd":"20261014","share":"1","money":"1","csvxls_isNo":"false"}).encode()
t("http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", d, {"User-Agent":"Mozilla/5.0","Referer":"http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020303","Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"})
