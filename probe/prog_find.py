"""#94 trendProgram 이력 길이 — chart 기간·startIdx 단위·NXT"""
import requests
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36", "Referer": "https://stock.naver.com/market/stock/kr/trend/program"}
B = "https://stock.naver.com/api/domestic/market/trendProgram"
def t(u, p):
    try:
        r = requests.get(u, params=p, headers=UA, timeout=20); j = r.text
        try:
            c = r.json(); L = c.get("content") if isinstance(c, dict) else c
            if isinstance(c, dict) and L is None:
                L = next((v for v in c.values() if isinstance(v, list)), None)
            ds = [x.get("bizdate") or x.get("localDate") or x.get("date") for x in (L or []) if isinstance(x, dict)]
            print("SRC", r.status_code, p, "n", len(L or []), ds[:1], ds[-1:], "|", str(c)[:250], flush=True)
        except Exception: print("SRC", r.status_code, p, j[:250])
    except Exception as e: print("err", p, str(e)[:80])
for si in (1, 2, 50, 99):
    t(B, {"tradeType": "KRX", "krxMarketType": "KOSPI", "bizdate": "20261113", "startIdx": si, "pageSize": 100, "periodType": "DAY"})
t(B, {"tradeType": "KRX", "krxMarketType": "KOSPI", "bizdate": "20261113", "startIdx": 0, "pageSize": 1000, "periodType": "DAY"})
for sd in ("20000101", "20200101", "20250101", "20260801"):
    t(B + "/chart", {"tradeType": "KRX", "krxMarketType": "KOSPI", "bizdate": "20261113", "startDate": sd, "endDate": "20261113", "periodType": "DAY"})
