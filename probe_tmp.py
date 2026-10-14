import urllib.request, urllib.parse, json, subprocess, sys
def t(url, data=None, h=None, n=300):
    h = h or {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"}
    try:
        b=urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h),timeout=20).read()
        print("OK",url[:120],len(b),b[:n].decode("utf-8","ignore").replace("\n"," ")); return b
    except Exception as e: print("ERR",url[:120],e)
D={"User-Agent":"Mozilla/5.0","Referer":"https://finance.daum.net/"}
t("https://finance.daum.net/api/investor/days?page=1&perPage=30&market=KOSPI&pagination=true", h=D)
t("https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=30", h=D)
t("https://finance.daum.net/api/market_index/days?page=1&perPage=10&market=KOSPI&pagination=true", h=D)
N={"User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)","Referer":"https://m.stock.naver.com/"}
t("https://m.stock.naver.com/api/stock/005930/trend?pageSize=10&page=1", h=N)
t("https://m.stock.naver.com/api/index/KOSPI/trend?bizdate=20260901", h=N)
t("https://finance.naver.com/sise/investorDealTrendDay.nhn?bizdate=20261014&sosok=&page=1")
t("https://finance.naver.com/sise/sise_deal_trend_day.naver?bizdate=20261014&sosok=01&page=1")
# KRX OTP csv
K={"User-Agent":"Mozilla/5.0","Referer":"http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020303","Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}
q=urllib.parse.urlencode({"locale":"ko_KR","inqTpCd":"2","trdVolVal":"2","askBid":"3","mktId":"STK","strtDd":"20260901","endDd":"20261014","share":"1","money":"1","csvxls_isNo":"false","name":"fileDown","url":"dbms/MDC/STAT/standard/MDCSTAT02203"}).encode()
otp=t("http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd", q, K)
if otp: t("http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd", urllib.parse.urlencode({"code":otp.decode()}).encode(), K, 500)
subprocess.run([sys.executable,"-m","pip","install","-q","pykrx"])
try:
    from pykrx import stock
    df=stock.get_market_trading_value_by_date("20260901","20261014","KOSPI")
    print("PYKRX", df.tail(3))
except Exception as e: print("PYKRX ERR", e)
# 신용잔고 / 공매도 (금투협 freesis, KRX)
t("https://freesis.kofia.or.kr/stat/FreeSIS.do?parentDivId=MSIS10000000000000&serviceId=STATSCU0100000070")
t("https://api.alternative.me/fng/?limit=2")
