"""#72 코스피200 야간 선물·A50 선물 주소 찾기 — CNBC symlookup·ts-api · investing api 검색"""
import requests, json
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def tr(u, h=None, n=300):
    try:
        r = requests.get(u, headers={**UA, **(h or {})}, timeout=25)
        print("SRC", r.status_code, len(r.text), u[:140], "|", r.text[:n].replace("\n", " ")); return r
    except Exception as e: print("SRC err", u[:120], str(e)[:100])
# 1) CNBC 심볼 찾기
for q in ("KOSPI", "KOSPI 200", "KS200", "A50", "FTSE China A50", "China A50", "Korea", "Nikkei"):
    tr(f"https://symlookup.cnbc.com/symservice/symlookup.do?prefix={requests.utils.quote(q)}&partnerid=20064&pgok=1&pgsize=50", n=1500)
# 2) CNBC 후보 심볼 바로
cands = ["@KS.1", "@KS200.1", "@KOS.1", "@KM.1", "@K2.1", "@CN.1", "@XU.1", "@A50.1", "@FCH.1", "@NK.1", "@NKD.1", "@SP.1", "@ES.1",
         ".KS200", ".KS11", ".KSFUT", ".FTXIN9", ".FTXIN9F", "KS200FUT", "CNA50"]
for s in cands:
    r = tr(f"https://ts-api.cnbc.com/harmony/app/bars/{requests.utils.quote(s)}/1D/20240101000000/20261106000000/adjusted/EST5EDT.json", n=200)
    if r is not None and r.status_code == 200 and '"priceBars"' in r.text:
        try:
            pb = r.json().get("barData", {}).get("priceBars") or []
            print("  BARS", s, len(pb), pb[:1], pb[-2:])
        except Exception as e: print("  parse", e)
# 3) CNBC 시간봉 (야간 확인용) — 후보 중 일봉 나온 것만
for s in ("@KS.1", "@SP.1", "@NK.1", "@CN.1"):
    for iv in ("1H", "60M", "5M"):
        r = tr(f"https://ts-api.cnbc.com/harmony/app/bars/{requests.utils.quote(s)}/{iv}/20261020000000/20261106000000/adjusted/EST5EDT.json", n=200)
        if r is not None and r.status_code == 200 and '"priceBars"' in r.text:
            pb = r.json().get("barData", {}).get("priceBars") or []
            print("  IBARS", s, iv, len(pb), pb[:1], pb[-3:])
# 4) investing api 검색
for q in ("KOSPI 200 Futures", "China A50 Futures"):
    tr(f"https://api.investing.com/api/search/v2/search?q={requests.utils.quote(q)}", {"domain-id": "www"}, n=1500)
