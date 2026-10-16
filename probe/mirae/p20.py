import requests, os, json, re
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36", "Referer": "https://dart.fss.or.kr/dsab007/main.do"})
log = {}
try:
    r = S.get("https://dart.fss.or.kr/dsab007/main.do", timeout=40); log["main"] = [r.status_code, len(r.text)]
    open(f"{OUT}/dart_main.html", "w").write(r.text[:200000])
except Exception as e: log["main"] = repr(e)
for nm in ["타임폴리오자산운용", "브이아이피자산운용", "머스트자산운용"]:
    for pt in ["D", ""]:
        try:
            r = S.post("https://dart.fss.or.kr/dsab007/detailSearch.ax", data={"currentPage": 1, "maxResults": 100, "maxLinks": 10, "sort": "date", "series": "desc",
                       "textCrpCik": "", "textCrpNm": "", "textPresenterNm": nm, "startDate": "20250416", "endDate": "20261016", "finalReport": "recent",
                       "publicType": pt, "reportName": "주식등의대량보유상황보고서" if not pt else ""}, timeout=60)
            log[nm + pt] = [r.status_code, len(r.text)]
            open(f"{OUT}/dart_{nm}_{pt or 'x'}.html", "w").write(r.text[:300000])
        except Exception as e: log[nm + pt] = repr(e)
json.dump(log, open(f"{OUT}/p20.json", "w"), ensure_ascii=False, indent=1)
