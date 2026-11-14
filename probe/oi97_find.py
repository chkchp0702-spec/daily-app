"""#97 코스피200 선물 미결제약정 — 3차: integration 칸 이름 · 일별 price 칸 · securityFe futures 경로 (Actions, 11/14 14시)"""
import requests, json
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36"}
def g(u, ref):
    try:
        r = requests.get(u, headers=dict(UA, Referer=ref), timeout=15); return r.status_code, r.text
    except Exception as e: return 0, str(e)
s, t = g("https://m.stock.naver.com/api/index/FUT/integration", "https://m.stock.naver.com/")
try: print("integration", [(x.get("code"), x.get("key"), x.get("value")) for x in json.loads(t).get("totalInfos", [])], flush=True)
except Exception: print("integration", s, t[:300])
s, t = g("https://m.stock.naver.com/api/index/FUT/price?pageSize=60&page=1", "https://m.stock.naver.com/")
try: J = json.loads(t); print("price item keys", list(J[0].keys()), "n", len(J), J[-1].get("localTradedAt"), flush=True)
except Exception: print("price", s, t[:300])
s, t = g("https://m.stock.naver.com/api/index/FUT/price?pageSize=60&page=60", "https://m.stock.naver.com/"); print("price page60", s, t[:200], flush=True)
F = "https://finance.naver.com"
for p in ["/api/securityFe/api/futures/FUT", "/api/securityFe/api/futures/FUT/price", "/api/securityFe/api/futures/FUT/prices", "/api/securityFe/api/futures/FUT/integration",
          "/api/securityFe/api/futures/FUT/basic", "/api/securityFe/api/futures/FUT/trend", "/api/securityFe/api/futures/price?code=FUT", "/api/securityFe/api/index/FUT/price?pageSize=5&page=1",
          "/api/securityFe/api/index/FUT/integration", "/api/securityFe/api/futures/FUT/openInterest", "/api/securityFe/api/futures/FUT/price?pageSize=5&page=1"]:
    s, t = g(F + p, F + "/sise/sise_index.naver?code=FUT"); print(s, p, t[:400].replace("\n", " "), flush=True)
