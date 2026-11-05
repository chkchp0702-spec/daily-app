"""#72 2차 — CNBC symlookup 로 선물(DERIVATIVE)만 · @ 접두 후보 · 시간봉 이력 깊이"""
import requests, json
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def j(u):
    try:
        r = requests.get(u, headers=UA, timeout=25); return r.status_code, r.text
    except Exception as e: return 0, str(e)
seen = set()
for q in ("@K", "@KS", "@KO", "@KP", "@XI", "@XU", "@CN", "@FT", "@A5", "@HS", "@HC", "@TW", "@SG", "@MH", "Kospi Fut", "KOSPI 200 Fut", "FTSE China", "SGX", "A50 Fut", "China A50 Fut", "Hang Seng Fut", "Korea Fut", "@"):
    sc, t = j(f"https://symlookup.cnbc.com/symservice/symlookup.do?prefix={requests.utils.quote(q)}&partnerid=20064&pgok=1&pgsize=100")
    try: arr = json.loads(t)[1:]
    except Exception: print("LK", q, sc, t[:100]); continue
    for a in arr:
        if a.get("issueType") in ("DERIVATIVE", "FUTURE", "INDEX") and a["symbolName"] not in seen:
            seen.add(a["symbolName"]); print("LK", q, "|", a.get("issueType"), a["symbolName"], "|", a.get("companyName"), "|", a.get("exchangeName"))
def bars(s, iv, a, b):
    sc, t = j(f"https://ts-api.cnbc.com/harmony/app/bars/{requests.utils.quote(s)}/{iv}/{a}/{b}/adjusted/EST5EDT.json")
    try: pb = json.loads(t).get("barData", {}).get("priceBars") or []
    except Exception: pb = []
    return pb
for s in sorted(seen):
    if not s.startswith("@"): continue
    pb = bars(s, "1D", "20000101000000", "20261106000000")
    if pb: print("D", s, len(pb), pb[0]["tradeTime"], pb[-1]["tradeTime"], pb[-1]["close"])
# 시간봉 이력 깊이 (@NK.1 기준) — 어디까지 되나
for a in ("20240101000000", "20250101000000", "20260101000000"):
    pb = bars("@NK.1", "1H", a, "20261106000000"); print("H @NK.1", a, len(pb), pb[0]["tradeTime"] if pb else None)
