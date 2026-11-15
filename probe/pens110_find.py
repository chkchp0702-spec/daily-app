"""#110 연기금 자료 길 2차 — 다음 details 파라미터 · 네이버 새 화면 JS 에서 api 경로 뽑기"""
import re, json, requests
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36"
out = {}
D = "https://finance.daum.net/api/investor/KOSPI/days"
for p in ({"details": "true"}, {"detail": "true"}, {"isDetail": "true"}, {"includeDetails": "true"}, {"withDetails": "true"}, {"detailYn": "Y"}, {"type": "detail"}):
    try:
        r = requests.get(D, params={"page": 1, "perPage": 2, **p}, headers={"User-Agent": UA, "Referer": "https://finance.daum.net/domestic/investors"}, timeout=15)
        t = r.text; out[str(p)] = [r.status_code, t[:250]]; print("daum", p, r.status_code, '"details":null' not in t, t[:250])
    except Exception as e: print("daum err", p, e)
for u in ("https://finance.daum.net/api/investor/KOSPI/days/details?page=1&perPage=2", "https://finance.daum.net/api/investor/details/KOSPI/days?page=1&perPage=2",
          "https://finance.daum.net/api/investor/KOSPI/institutions?page=1&perPage=2", "https://finance.daum.net/api/investors/KOSPI/days?page=1&perPage=2"):
    try:
        r = requests.get(u, headers={"User-Agent": UA, "Referer": "https://finance.daum.net/domestic/investors"}, timeout=15); print("daum2", u, r.status_code, r.text[:250])
    except Exception as e: print("err", u, e)
def paths(page, base):
    try:
        r = requests.get(page, headers={"User-Agent": UA}, timeout=20); h = r.text
    except Exception as e: print("err", page, e); return
    print("page", page, r.status_code, r.url, len(h))
    srcs = re.findall(r'<script[^>]+src="([^"]+)"', h); found = set(re.findall(r'api/[a-zA-Z0-9_/\-]*(?:nvestor|rend|pension|deal)[a-zA-Z0-9_/\-]*', h))
    for s in srcs[:60]:
        if s.startswith("//"): s = "https:" + s
        elif s.startswith("/"): s = base + s
        try:
            j = requests.get(s, headers={"User-Agent": UA}, timeout=20).text
            for m in re.findall(r'["\'`]([^"\'`]{0,40}(?:nvestor|trend|Trend|pension|Pension)[^"\'`]{0,80})["\'`]', j):
                if "/" in m or "pension" in m.lower(): found.add(m)
        except Exception: pass
    print("found", page, sorted(found)[:120])
paths("https://stock.naver.com/market/stock/kr/trend/investor", "https://stock.naver.com")
paths("https://finance.naver.com/sise/sise_trans_style.naver", "https://finance.naver.com")
paths("https://finance.daum.net/domestic/investors", "https://finance.daum.net")
for u in ("https://stock.naver.com/api/domestic/market/trendInvestorByDay?tradeType=KRX&krxMarketType=KOSPI&bizdate=20261113&startIdx=0&pageSize=3",
          "https://stock.naver.com/api/domestic/market/investorTrend/day?krxMarketType=KOSPI&bizdate=20261113",
          "https://m.stock.naver.com/api/index/KOSPI/investor?bizdate=20261113", "https://m.stock.naver.com/api/index/KOSPI/trend/detail?bizdate=20261113"):
    try:
        r = requests.get(u, headers={"User-Agent": UA}, timeout=15); print("try", u, r.status_code, r.text[:250])
    except Exception as e: print("err", u, e)
