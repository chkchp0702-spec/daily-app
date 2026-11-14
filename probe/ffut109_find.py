"""#109 외국인·기관 코스피200 선물 순매수 이력 주소 찾기 (임시 시험)."""
import re, requests
H = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
def get(u, n=300):
    try:
        r = requests.get(u, headers=H, timeout=20)
        t = r.text
        print(f"[{r.status_code}] {u} len={len(t)} :: {t[:n]!r}")
        return r.status_code, t
    except Exception as e:
        print(f"[ERR] {u} {e}"); return 0, ""
B = "https://m.stock.naver.com/api/index/FUT/trend"
for q in ["", "?bizdate=20251113", "?bizdate=20260102", "?startIdx=0&pageSize=50", "?page=2&pageSize=20",
          "?periodType=day&count=30", "?date=20251113", "?endDate=20251113", "?pageSize=60"]:
    get(B + q)
for p in ["https://m.stock.naver.com/api/index/FUT/trend/list", "https://m.stock.naver.com/api/index/FUT/trends",
          "https://m.stock.naver.com/api/index/FUT/investor", "https://m.stock.naver.com/api/index/KPI200/trend",
          "https://m.stock.naver.com/api/index/KOSPI/trend", "https://m.stock.naver.com/api/index/KOSPI/trend?bizdate=20251113",
          "https://m.stock.naver.com/api/index/KOSPI/investor?pageSize=20",
          "https://stock.naver.com/api/domestic/market/trendInvestor?category=FUTURES&startIdx=0&pageSize=20",
          "https://stock.naver.com/api/domestic/market/trendInvestorFutures?startIdx=0&pageSize=20",
          "https://stock.naver.com/api/domestic/market/trendFutures?startIdx=0&pageSize=20",
          "https://stock.naver.com/api/domestic/market/trendDeal?category=FUT&startIdx=0&pageSize=20",
          "https://stock.naver.com/api/domestic/market/trendProgram?category=KOSPI&startIdx=0&pageSize=2",
          "https://finance.daum.net/api/investor/futures/days?page=1&perPage=10",
          "https://finance.daum.net/api/investor/KOSPI200F/days?page=1&perPage=10",
          ]:
    get(p)
# JS 번들에서 api 경로 찾기
for page in ["https://stock.naver.com/market/stock/kr/investor", "https://stock.naver.com/", "https://stock.naver.com/market/futures",
             "https://m.stock.naver.com/domestic/index/FUT/total", "https://m.stock.naver.com/domestic/index/FUT/trend"]:
    s, t = get(page, 100)
    js = set(re.findall(r'src="([^"]+\.js)"', t))
    print(" js", len(js))
    seen = set()
    for j in list(js)[:60]:
        u = j if j.startswith("http") else ("https://stock.naver.com" if "m.stock" not in page else "https://m.stock.naver.com") + j
        try:
            c = requests.get(u, headers=H, timeout=20).text
        except Exception:
            continue
        for m in re.findall(r'["\'`](/?api/[A-Za-z0-9_/\-\{\}\$\.]*(?:[Tt]rend|[Ii]nvestor|[Ff]ut)[A-Za-z0-9_/\-\{\}\$\.]*)', c):
            if m not in seen:
                seen.add(m)
                i = c.find(m); print("  API", m, "::", c[max(0,i-80):i+160].replace("\n"," ")[:260])
