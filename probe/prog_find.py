"""#94 프로그램 매매 일별 — 공개 주소 찾기 (다음·네이버·KRX)"""
import requests
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
DA = {"Referer": "https://finance.daum.net/"}
NV = {"Referer": "https://finance.naver.com/"}
MO = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
def tr(u, h=None, n=400):
    try:
        r = requests.get(u, headers={**UA, **(h or {})}, timeout=20)
        print("SRC", r.status_code, len(r.content), u[:150], "|", r.text[:n].replace("\n", " "), flush=True)
    except Exception as e: print("SRC err", u[:150], str(e)[:100])
for u in ("https://finance.daum.net/api/program/KOSPI/days?page=1&perPage=3",
          "https://finance.daum.net/api/programs/KOSPI/days?page=1&perPage=3",
          "https://finance.daum.net/api/program_trading/KOSPI/days?page=1&perPage=3",
          "https://finance.daum.net/api/program_trades/KOSPI/days?page=1&perPage=3",
          "https://finance.daum.net/api/trading/program/KOSPI/days?page=1&perPage=3",
          "https://finance.daum.net/api/investor/program/KOSPI/days?page=1&perPage=3",
          "https://finance.daum.net/api/market_index/programs?market=KOSPI",
          "https://finance.daum.net/api/program/days?market=KOSPI&page=1&perPage=3",
          "https://finance.daum.net/api/programs/days?market=KOSPI&page=1&perPage=3",
          "https://finance.daum.net/domestic/program"):
    tr(u, DA)
tr("https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=1", DA, n=2500)
for u in ("https://finance.naver.com/sise/sise_program.naver",
          "https://finance.naver.com/sise/programDealTrendDay.naver?bizdate=20261113&sosok=01&page=1",
          "https://finance.naver.com/sise/programDealTrendDay.nhn?bizdate=20261113&sosok=&page=1",
          "https://finance.naver.com/sise/sise_program_day.naver"):
    tr(u, NV)
for u in ("https://m.stock.naver.com/api/index/KOSPI/program?pageSize=3&page=1",
          "https://m.stock.naver.com/api/index/KOSPI/programTrend?pageSize=3&page=1",
          "https://m.stock.naver.com/api/index/KOSPI/trend?pageSize=3&page=1",
          "https://m.stock.naver.com/api/index/KOSPI/investor?pageSize=3&page=1",
          "https://api.stock.naver.com/index/KOSPI/program",
          "https://api.stock.naver.com/index/KOSPI/trend/program?pageSize=3",
          "https://m.stock.naver.com/front-api/index/program?category=KOSPI&pageSize=3&page=1",
          "https://m.stock.naver.com/front-api/domestic/index/program?code=KOSPI"):
    tr(u, MO)
