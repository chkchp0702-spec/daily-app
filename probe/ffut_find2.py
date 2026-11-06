"""#73 2차 — 네이버 새 투자자 동향 페이지·다음 선물 페이지의 JS 에서 API 주소 뽑기 → 선물 이력 시험"""
import requests, re
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, h=None):
    try:
        r = requests.get(u, headers={**UA, **(h or {})}, timeout=25); return r
    except Exception as e: print("ERR", u[:100], str(e)[:80])
def apis(txt):
    return sorted(set(re.findall(r'["\'`]((?:https?:)?//[a-z.\-]*(?:naver|daum|pstatic|kakao)[a-z.\-]*/[^"\'`\s]{3,140}|/(?:api|front-api)/[^"\'`\s]{3,140})["\'`]', txt)))
for page in ("https://finance.naver.com/market/stock/kr/trend/trader", "https://finance.naver.com/market/stock/kr/trend/foreigner",
             "https://finance.daum.net/domestic/futures", "https://finance.daum.net/domestic/investors"):
    r = get(page, {"Referer": "https://finance.daum.net/"} if "daum" in page else None)
    if r is None: continue
    print("PAGE", r.status_code, len(r.text), page)
    found = set(apis(r.text))
    js = sorted(set(re.findall(r'src="([^"]+\.js)"', r.text)))
    for j in js[:60]:
        if j.startswith("/"): j = ("https://finance.naver.com" if "naver" in page else "https://finance.daum.net") + j
        rj = get(j)
        if rj is not None and rj.status_code == 200:
            a = [x for x in apis(rj.text) if re.search(r'trend|investor|trader|futur|deal', x, re.I)]
            found |= set(a)
    for a in sorted(found):
        if re.search(r'trend|investor|trader|futur|deal|Investor', a): print("API", page.split("/")[-1], a)
# 추측 시험
H = {"Referer": "https://finance.naver.com/"}
for u in ("https://finance.naver.com/api/market/stock/kr/trend/trader?category=FUTURES",
          "https://m.stock.naver.com/front-api/market/investor/trend?category=futures",
          "https://api.stock.naver.com/index/FUT/trend?pageSize=10&page=1",
          "https://m.stock.naver.com/api/index/FUT/trend?pageSize=10&page=1&startDateTime=20250101",
          "https://m.stock.naver.com/api/index/KOSPI/trend/history?pageSize=10",
          "https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=2&market=FUTURES",
          "https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=2&fieldName=futures"):
    r = get(u, {"Referer": "https://finance.daum.net/"} if "daum" in u else {"Referer": "https://m.stock.naver.com/"})
    if r is not None: print("SRC", r.status_code, u, "|", r.text[:250].replace("\n", " "))
