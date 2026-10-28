import json, urllib.request, urllib.parse, re
H={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
out=[]
def log(*a): s=" ".join(str(x) for x in a); print(s); out.append(s)
def get(u,h=None,data=None):
    r=urllib.request.Request(u,headers={**H,**(h or {})},data=data)
    with urllib.request.urlopen(r,timeout=25) as x: return x.status, x.read().decode("utf-8","replace"), dict(x.headers)
def tryit(nm,u,h=None,data=None,pat=None):
    try:
        st,t,hd=get(u,h,data)
        hits = [m.start() for m in re.finditer(pat,t)][:3] if pat else []
        log(f"[{nm}] {st} len={len(t)} hits({pat})={len(hits)}", (t[max(0,hits[0]-200):hits[0]+400] if hits else t[:400]).replace("\n"," "))
    except urllib.error.HTTPError as e:
        log(f"[{nm}] HTTP {e.code}", e.read()[:300].decode("utf-8","replace"))
    except Exception as e: log(f"[{nm}] ERR {e}")
KR={"Referer":"https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd","Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","X-Requested-With":"XMLHttpRequest"}
d=urllib.parse.urlencode({"bld":"dbms/MDC/STAT/standard/MDCSTAT02303","isuCd":"KR7005930003","strtDd":"20261020","endDd":"20261027","trdVolVal":"2","askBid":"3","detailView":"1"}).encode()
tryit("krx 종목 투자자 상세","https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",KR,d)
d2=urllib.parse.urlencode({"bld":"dbms/MDC/STAT/standard/MDCSTAT02401","mktId":"STK","invstTpCd":"6000","strtDd":"20261027","endDd":"20261027","share":"2","money":"3"}).encode()
tryit("krx 연기금 순매수 종목순위","https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",KR,d2)
tryit("krx 메인","https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd",None,None,"로그인|login")
tryit("fnguide","https://comp.fnguide.com/SVO2/ASP/SVD_main.asp?pGB=1&gicode=A005930",None,None,"연기금")
tryit("wisereport","https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx?cmp_cd=005930",None,None,"연기금")
tryit("naver 시장 투자자 일별","https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate=20261027&sosok=01",None,None,"연기금")
tryit("naver 시장 투자자 일별 sosok02","https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate=20261027&sosok=02",None,None,"연기금")
try:
    st,t,_=get("https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=2",{"Referer":"https://finance.daum.net/","Accept":"application/json"}); log("[daum KOSPI keys]", t[:900])
except Exception as e: log("daum kospi err",e)
for p in ["https://m.stock.naver.com/api/stock/005930/integration","https://m.stock.naver.com/api/stock/005930/investor","https://m.stock.naver.com/api/stock/005930/investorTrend","https://stock.naver.com/api/domestic/stock/005930/investor-trend?page=1&pageSize=5"]:
    tryit("naver "+p.split('005930/')[1][:30],p,{"Referer":"https://m.stock.naver.com/"},None,"pension|연기금|사모|privateEquity")
tryit("kind 공시 대량보유 국민연금","https://kind.krx.co.kr/disclosure/searchtotalinfo.do",None,None,"국민연금")
open("out/probe2.txt","w").write("\n".join(out))
