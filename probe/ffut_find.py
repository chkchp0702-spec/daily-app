"""#73 외국인 코스피200 선물 순매수 일별 — 공개 주소 찾기 (다음·네이버·freesis·KRX)"""
import requests, json, re
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
DA = {"Referer": "https://finance.daum.net/"}
MO = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
def tr(u, h=None, m="get", data=None, n=300, enc=None):
    try:
        r = requests.request(m, u, headers={**UA, **(h or {})}, data=data, timeout=25)
        if enc: r.encoding = enc
        print("SRC", r.status_code, len(r.text), u[:140], "|", r.text[:n].replace("\n", " ")); return r
    except Exception as e: print("SRC err", u[:140], str(e)[:100])
# 1) 다음 현물 행의 모든 키 (선물 칸이 섞여 있는지)
r = tr("https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=2", DA, n=1500)
for k in ("FUTURES", "FUTURE", "KOSPI200", "K200F", "KOSPI200F", "futures", "F", "DERIVATIVES", "KOSPI200FUTURES"):
    tr(f"https://finance.daum.net/api/investor/{k}/days?page=1&perPage=2", DA)
for u in ("https://finance.daum.net/api/futures/investors/days?page=1&perPage=2",
          "https://finance.daum.net/api/futures/investor/days?page=1&perPage=2",
          "https://finance.daum.net/api/investor/futures/days?page=1&perPage=2",
          "https://finance.daum.net/api/futures/KOSPI200/investors?page=1&perPage=2",
          "https://finance.daum.net/api/quotes/futures?symbolCode=KOSPI200F",
          "https://finance.daum.net/api/futures/main",
          "https://finance.daum.net/api/derivatives/futures/investors/days?page=1&perPage=2"):
    tr(u, DA)
# 2) 네이버 PC 투자자별 매매동향(일별) — sosok 별
for s in ("", "01", "02", "03", "04", "05", "06"):
    tr(f"https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate=20261105&sosok={s}&page=1", n=200, enc="euc-kr")
r = tr("https://finance.naver.com/sise/sise_trans_style.naver", n=100, enc="euc-kr")
if r is not None:
    print("LINKS", sorted(set(re.findall(r'(?:src|href)="([^"]*(?:investor|Deal|trend)[^"]*)"', r.text)))[:40])
r = tr("https://finance.naver.com/sise/sise_index.naver?code=FUT", n=100, enc="euc-kr")
if r is not None:
    print("LINKS2", sorted(set(re.findall(r'(?:src|href)="([^"]*(?:investor|Deal|trend|Trend)[^"]*)"', r.text)))[:40])
# 3) 네이버 모바일
for u in ("https://m.stock.naver.com/api/index/FUT/trend", "https://m.stock.naver.com/api/index/KPI200/trend",
          "https://m.stock.naver.com/api/index/KOSPI/trend", "https://m.stock.naver.com/api/futures/FUT/trend",
          "https://m.stock.naver.com/api/index/FUT/integration", "https://m.stock.naver.com/api/index/FUT/basic",
          "https://m.stock.naver.com/api/index/KOSPI/investor/trend?pageSize=5&page=1",
          "https://m.stock.naver.com/api/index/FUT/investor/trend?pageSize=5&page=1",
          "https://api.stock.naver.com/index/FUT/investor/trend?pageSize=5&page=1"):
    tr(u, MO, n=600)
# 4) freesis 메타 목록 — 파생 쪽 표 이름 훑기
for code in ("0100000020", "0100000030", "0100000040", "0200000010", "0200000020", "0300000010"):
    tr("https://freesis.kofia.or.kr/meta/getMetaDataList.do", {"Content-Type": "application/json", "Referer": "https://freesis.kofia.or.kr/"}, "post",
       json.dumps({"tmpV40": code, "tmpV1": "D", "OBJ_NM": "STATSCU0100000010BO"}), n=300)
# 5) KRX 투자자별 거래실적(파생) json — 쿠키 세션
s = requests.Session(); s.headers.update(UA)
try:
    s.get("http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201050101", timeout=20)
    for bld in ("dbms/MDC/STAT/standard/MDCSTAT13101", "dbms/MDC/STAT/standard/MDCSTAT13102"):
        r3 = s.post("http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", headers={"Referer": "http://data.krx.co.kr/"}, timeout=20,
                    data={"bld": bld, "locale": "ko_KR", "prodId": "KRDRVFUK2I", "strtDd": "20261020", "endDd": "20261105", "inqTpCd": "2", "trdVolVal": "2", "askBid": "3"})
        print("KRX", bld, r3.status_code, r3.text[:300])
except Exception as e: print("KRX err", str(e)[:100])
