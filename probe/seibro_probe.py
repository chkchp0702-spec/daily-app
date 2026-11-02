# #34 대차잔고 길 찾기 — m.seibro.or.kr 대차 화면 본문 스크립트에서 ajax 주소·series 뽑기
import re, requests, json
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
                  "Referer": "https://m.seibro.or.kr/"})
B = "https://m.seibro.or.kr"
def get(p, **kw):
    try:
        r = S.get(B + p, timeout=25, **kw); return r
    except Exception as e:
        print("ERR", p, e); return None
def post(p, data, **kw):
    try:
        r = S.post(B + p, data=data, timeout=25, **kw); return r
    except Exception as e:
        print("ERR", p, e); return None
for p in ["/cnts/loan/selectStockLoanState.do", "/cnts/loan/selectLoanRank.do"]:
    r = get(p)
    if r is None: continue
    t = r.text
    print("=====", p, r.status_code, len(t))
    for m in sorted(set(re.findall(r"['\"](/[A-Za-z0-9_/]+\.do)['\"]", t))): print("  URL", m)
    for m in re.findall(r"(?:url|action)\s*[:=]\s*['\"]([^'\"]+)['\"]", t): print("  AJAX", m)
    for m in re.findall(r"<(?:input|select)[^>]*name=['\"]([^'\"]+)['\"][^>]*>", t): print("  FIELD", m)
    for k in ["series", "categories", "data:", "xAxis"]:
        for mm in re.finditer(k, t):
            print("  CTX", k, repr(t[max(0, mm.start()-150): mm.start()+350])[:520]); break
    scr = re.findall(r"<script[^>]*>(.*?)</script>", t, re.S)
    big = [s for s in scr if len(s) > 200]
    for s in big[:6]:
        print("  --- SCRIPT", len(s)); print(s[:2500])
# 흔한 ajax 이름 짐작
for p in ["/cnts/loan/selectStockLoanStateList.do", "/cnts/loan/selectStockLoanStateAjax.do",
          "/cnts/loan/selectStockLoanStateChart.do", "/cnts/loan/getStockLoanState.do",
          "/cnts/loan/selectLoanRankList.do", "/cnts/loan/selectLoanRankAjax.do"]:
    for f in (get, lambda q: post(q, {})):
        r = f(p)
        if r is not None: print("TRY", p, r.status_code, len(r.text), repr(r.text[:300]))
