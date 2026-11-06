"""#78 한국 국가 CDS 5년물 일별 이력 주소 찾기 — 확률 보강 일지 11/6 10시 (Actions)"""
import requests, json
H = {"User-Agent": "Mozilla/5.0"}
def j(u, **k):
    try:
        r = requests.get(u, headers=H, timeout=20, **k); return r.status_code, r.text
    except Exception as e: return -1, str(e)[:100]
for q in ["Korea CDS", "KOREA 5Y", "CDS 5Y", "South Korea CDS", "KR5Y", "sovereign CDS"]:
    sc, t = j(f"https://symlookup.cnbc.com/symservice/symlookup.do?prefix={requests.utils.quote(q)}&partnerid=20064&pgok=1&pgsize=50")
    try: L = [(x.get("symbolName"), x.get("companyName"), x.get("assetType")) for x in json.loads(t)]
    except Exception: L = t[:200]
    print("lookup", q, sc, L[:15])
for s in ["KR5YCDS", "KOREA5YCDS", "KRGV5YCDS", "SKOREA5YCDS", "KOR5YCDS", "KR5YUSAC", "KR5Y-CDS", "CKOR1U5"]:
    sc, t = j(f"https://ts-api.cnbc.com/harmony/app/bars/{s}/1D/20100101000000/20261106000000/adjusted/EST5EDT.json")
    print("bars", s, sc, t[:160])
for u in ["https://www.worldgovernmentbonds.com/cds-historical-data/south-korea/5-years/",
          "https://www.worldgovernmentbonds.com/wp-json/sovereign-cds/v1/history?country=south-korea&tenor=5Y",
          "https://api.investing.com/api/financialdata/historical/1155203?start-date=2015-01-01&end-date=2026-11-06&time-frame=Daily&add-missing-rows=false",
          "https://www.investing.com/rates-bonds/south-korea-cds-5-years-usd-historical-data",
          "https://finance.daum.net/api/exchanges/summaries", 
          "https://m.stock.naver.com/front-api/marketIndex/productDetail?category=bond&reutersCode=KR5YCDS",
          "https://stooq.com/q/d/l/?s=kr5ycds&i=d",
          "https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/817Y002/D/20250101/20251231/010200000"]:
    sc, t = j(u, headers={**H, "Referer": "https://finance.daum.net/"})
    print("url", u, sc, len(t), t[:200].replace("\n", " "))
