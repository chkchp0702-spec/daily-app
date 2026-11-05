"""#69 VKOSPI 주소 찾기 2차 — CNBC ts-api · investing tvc · 마켓워치·WSJ · 네이버 api 변형 · KRX 세션 쿠키"""
import requests, json
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def tr(u, h=None, m="get", data=None):
    try:
        r = requests.request(m, u, headers={**UA, **(h or {})}, data=data, timeout=25)
        print("SRC", r.status_code, len(r.text), u[:120], "|", r.text[:220].replace("\n", " ")); return r
    except Exception as e: print("SRC err", u[:120], str(e)[:100])
for sym in (".VKOSPI", "VKOSPI", ".KSVKOSPI"):
    tr(f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/1D/20030101000000/20261105000000/adjusted/EST5EDT.json")
tr("https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=.VKOSPI&requestMethod=itv&noform=1&output=json")
for h in ("tvc4", "tvc6"):
    tr(f"https://{h}.investing.com/725910b675af9252224ca6069a1e73cc/1730000000/1/1/8/search?limit=30&query=VKOSPI&type=&exchange=")
tr("https://www.marketwatch.com/investing/index/vkospi?countrycode=kr")
tr("https://www.wsj.com/market-data/quotes/index/KR/XKRX/VKOSPI/historical-prices")
for u in ("https://api.stock.naver.com/chart/domestic/index/VKOSPI?periodType=dayCandle",
          "https://api.stock.naver.com/index/VKOSPI/basic",
          "https://m.stock.naver.com/api/index/VKOSPI/price?pageSize=10&page=1",
          "https://api.stock.naver.com/chart/domestic/index/KPI200VOL?periodType=dayCandle",
          "https://finance.daum.net/api/quote/D0011001/days?symbolCode=D0011001&page=1&perPage=10"):
    tr(u, {"Referer": "https://finance.daum.net/"} if "daum" in u else None)
s = requests.Session(); s.headers.update(UA)
try:
    r0 = s.get("http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201010105", timeout=20); print("KRX page", r0.status_code, dict(s.cookies))
    hk = {"Referer": "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201010105"}
    r = s.post("http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd", headers=hk, timeout=20,
               data={"locale": "ko_KR", "indIdx": "1", "indIdx2": "300", "strtDd": "20240101", "endDd": "20240131", "share": "2", "money": "3", "csvxls_isNo": "false", "name": "fileDown", "url": "dbms/MDC/STAT/standard/MDCSTAT01201"})
    print("KRX otp", r.status_code, r.text[:60])
    r2 = s.post("http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd", headers={"Referer": "http://data.krx.co.kr/"}, data={"code": r.text}, timeout=20)
    print("KRX dl", r2.status_code, len(r2.content), r2.content[:200].decode("euc-kr", "ignore").replace("\n", " "))
    r3 = s.post("http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", headers=hk, timeout=20,
                data={"bld": "dbms/MDC/STAT/standard/MDCSTAT01201", "locale": "ko_KR", "indIdx": "1", "indIdx2": "300", "strtDd": "20240101", "endDd": "20240131", "share": "2", "money": "3", "csvxls_isNo": "false"})
    print("KRX json", r3.status_code, r3.text[:200])
except Exception as e: print("KRX err", str(e)[:100])
