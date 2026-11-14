"""#97 코스피200 선물 미결제약정 일별 이력 — 공개 주소 찾기 (Actions, 11/14 14시)"""
import re, requests, json
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36"}
def t(u, h=None, method="GET", data=None, n=300):
    try:
        hh = dict(UA); hh.update(h or {})
        r = requests.request(method, u, headers=hh, data=data, timeout=15)
        print(r.status_code, len(r.text), u[:160], "|", r.text[:n].replace("\n", " "), flush=True)
        return r
    except Exception as e:
        print("ERR", u[:160], str(e)[:80], flush=True)
NR = {"Referer": "https://stock.naver.com/"}
# 1) 네이버 새 화면 JS 에서 파생·선물 api 경로 찾기
for page in ["https://stock.naver.com/market/stock/kr/trend/program", "https://stock.naver.com/marketindex/futures", "https://stock.naver.com/market/futures/kr/FUT", "https://m.stock.naver.com/futures/FUT/total", "https://stock.naver.com/"]:
    r = t(page, n=80)
    if not r or r.status_code != 200: continue
    js = set(re.findall(r'src="([^"]+\.js)"', r.text)) | set(re.findall(r'"(/_next/static/[^"]+\.js)"', r.text))
    found = set()
    for s in list(js)[:60]:
        u = s if s.startswith("http") else ("https://stock.naver.com" + s if s.startswith("/") else s)
        try: b = requests.get(u, headers=UA, timeout=15).text
        except Exception: continue
        for m in re.findall(r'["`\']((?:https://[a-z.]+naver\.com)?/api/[A-Za-z0-9_/\-{}$.]*(?:utur|eriv|penInterest|FUT|option|Option)[A-Za-z0-9_/\-{}$.]*)', b):
            found.add(m)
    print("JS found", page, sorted(found)[:80], flush=True)
# 2) 추측 주소들
B = "20261113"
for u in [
    "https://m.stock.naver.com/api/futures/FUT/basic", "https://m.stock.naver.com/api/futures/FUT/price?pageSize=5&page=1",
    "https://m.stock.naver.com/api/index/FUT/price?pageSize=5&page=1", "https://m.stock.naver.com/api/futures/FUT/integration",
    "https://stock.naver.com/api/domestic/futures/FUT/price?pageSize=5&page=1", "https://stock.naver.com/api/domestic/market/trendFutures?bizdate=%s&startIdx=0&pageSize=5&periodType=DAY" % B,
    "https://stock.naver.com/api/domestic/futures/FUT/trend?bizdate=%s&startIdx=0&pageSize=5" % B,
    "https://api.stock.naver.com/futures/FUT/price?pageSize=5&page=1", "https://api.stock.naver.com/index/FUT/price?pageSize=5&page=1",
    "https://finance.naver.com/sise/sise_index.naver?code=FUT", "https://finance.naver.com/sise/sise_index_day.naver?code=FUT&page=1",
    "https://fchart.stock.naver.com/sise.nhn?symbol=FUT&timeframe=day&count=3&requestType=0",
    "https://fchart.stock.naver.com/siseJson.nhn?symbol=FUT&requestType=1&startTime=20261101&endTime=20261113&timeframe=day",
    "https://finance.daum.net/api/future/KOSPI200/days?perPage=5&page=1", "https://finance.daum.net/api/quotes/FUT?summary=false",
    "https://finance.daum.net/api/futures/days?perPage=5&page=1", "https://finance.daum.net/api/market_index/futures/days?perPage=5",
]:
    t(u, NR if "naver" in u else {"Referer": "https://finance.daum.net/"})
# 3) KRX 정보데이터시스템 파생 일별(미결제약정 포함) · 로그인 없이 되는지
for bld, extra in [("dbms/MDC/STAT/standard/MDCSTAT12501", {"prodId": "KRDRVFUK2I", "mktTpCd": "T", "strtDd": "20261101", "endDd": "20261113"}),
                   ("dbms/MDC/STAT/standard/MDCSTAT12601", {"prodId": "KRDRVFUK2I", "trdDd": B, "mktTpCd": "T"}),
                   ("dbms/MDC/STAT/standard/MDCSTAT13101", {"prodId": "KRDRVFUK2I", "strtDd": "20261101", "endDd": "20261113"})]:
    d = {"bld": bld, "locale": "ko_KR"}; d.update(extra)
    t("https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", {"Referer": "https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd"}, "POST", d)
# 4) 인베스팅·시카고 무관 대안: 한국거래소 공개 통계 · 금투협 freesis 파생 표
for u in ["https://open.krx.co.kr/contents/OPN/99/OPN99000001.jspx", "https://global.krx.co.kr/contents/GLB/99/GLB99000001.jspx"]:
    t(u, n=80)
