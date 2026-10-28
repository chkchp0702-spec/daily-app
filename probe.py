import json, urllib.request, urllib.parse, time
H={"User-Agent":"Mozilla/5.0","Accept":"application/json"}
def get(u,h=None,data=None):
    r=urllib.request.Request(u,headers={**H,**(h or {})},data=data); return urllib.request.urlopen(r,timeout=25).read().decode("utf-8","replace")
out=[]
def log(*a): s=" ".join(str(x) for x in a); print(s); out.append(s)
# 1 Daum per-stock investor days
for per in (5,100):
  for pg in (1,):
    try:
        t=get(f"https://finance.daum.net/api/investor/days?symbolCode=A005930&page={pg}&perPage={per}",{"Referer":"https://finance.daum.net/quotes/A005930"})
        j=json.loads(t); rows=j.get("data") or []
        log("daum per",per,"rows",len(rows),"keys",sorted(rows[0].keys()) if rows else t[:200], "totalPages",j.get("totalPages"), "first",rows[0] if rows else None)
    except Exception as e: log("daum err",per,e)
for pg in (10,50,100,200):
    try:
        j=json.loads(get(f"https://finance.daum.net/api/investor/days?symbolCode=A005930&page={pg}&perPage=100",{"Referer":"https://finance.daum.net/quotes/A005930"}))
        rows=j.get("data") or []; log("daum page",pg,len(rows), rows[-1]["date"] if rows else None)
    except Exception as e: log("daum page err",pg,e)
# Daum other investor endpoints
for path in ["investor/days/detail","investor/detail/days","investor/institution/days"]:
    try:
        t=get(f"https://finance.daum.net/api/{path}?symbolCode=A005930&page=1&perPage=3",{"Referer":"https://finance.daum.net/quotes/A005930"}); log("daum",path,t[:300])
    except Exception as e: log("daum",path,"err",e)
# 2 KRX investor by stock
try:
    data=urllib.parse.urlencode({"bld":"dbms/MDC/STAT/standard/MDCSTAT02303","isuCd":"KR7005930003","strtDd":"20261001","endDd":"20261027","trdVolVal":"2","askBid":"3"}).encode()
    t=get("http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",{"Referer":"http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd","Content-Type":"application/x-www-form-urlencoded"},data); log("krx",t[:300])
except Exception as e: log("krx err",e)
# 3 Naver frgn page
try:
    t=get("https://finance.naver.com/item/frgn.naver?code=005930&page=200",{"Referer":"https://finance.naver.com/"}); 
    import re; d=re.findall(r'(\d{4}\.\d{2}\.\d{2})',t); log("naver frgn p200 dates",d[:2],d[-2:] if d else None,len(t))
except Exception as e: log("naver err",e)
try:
    t=get("https://m.stock.naver.com/api/stock/005930/trend?pageSize=10",{"Referer":"https://m.stock.naver.com/"}); log("naver m trend",t[:400])
except Exception as e: log("naver m err",e)
open("out/probe.txt","w").write("\n".join(out))
