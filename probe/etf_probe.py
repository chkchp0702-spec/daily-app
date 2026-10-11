import json, re, sys, urllib.request
UA_M = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148", "Accept": "application/json", "Referer": "https://m.stock.naver.com/"}
UA_D = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
def get(u, h, raw=False):
    with urllib.request.urlopen(urllib.request.Request(u, headers=h), timeout=25) as r:
        t = r.read().decode("utf-8", "ignore")
    return t if raw else json.loads(t)
out = {}
for code in sys.argv[1:]:
    o = {}
    try:
        a = get(f"https://m.stock.naver.com/api/stock/{code}/etfAnalysis", UA_M)
        o["top10"] = a.get("etfTop10MajorConstituentAssets")
        o["keys"] = list(a.keys())
    except Exception as e:
        o["naver_err"] = str(e)
    try:
        t = get(f"https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd={code}", UA_D, raw=True)
        o["wise_len"] = len(t); o["has_cu"] = "CU_data" in t
        m = re.search(r"var\s+CU_data\s*=\s*(\{.*?\});", t, re.S)
        if m:
            g = json.loads(m.group(1)).get("grid_data") or []
            o["wise_n"] = len(g); o["wise_first"] = g[:3]
        else:
            o["wise_head"] = t[:300]
    except Exception as e:
        o["wise_err"] = str(e)
    out[code] = o
json.dump(out, open("archive/x/probe_etf.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
