"""#94 프로그램 매매 — 네이버 새 API /api/domestic/market/trendProgram 파라미터 찾기"""
import requests, re
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36", "Referer": "https://finance.naver.com/market/stock/kr/trend/program"}
s = requests.get("https://ssl.pstatic.net/imgstock/fn/real/pc/_next/static/chunks/app/market/stock/kr/trend/program/page-7c4b34513aaf44be.js", headers=UA, timeout=20).text
for m in re.finditer("trendProgram", s):
    print("CTX |", s[max(0, m.start() - 700): m.start() + 500].replace("\n", " "))
base = ["https://finance.naver.com", "https://stock.naver.com", "https://m.stock.naver.com"]
qs = ["", "?marketType=KOSPI", "?market=KOSPI", "?sosok=KOSPI&page=1&pageSize=20", "?marketType=KOSPI&page=1&pageSize=20", "?category=KOSPI&page=1&pageSize=20",
      "?bizdate=20261113&marketType=KOSPI&page=1&pageSize=20", "?type=KOSPI&page=1&pageSize=20"]
for b in base:
    for q in qs:
        u = b + "/api/domestic/market/trendProgram" + q
        try:
            r = requests.get(u, headers=UA, timeout=15); print("SRC", r.status_code, len(r.content), u, "|", r.text[:300].replace("\n", " "), flush=True)
            if r.status_code == 404 and q == "": break
        except Exception as e: print("err", u, str(e)[:60])
