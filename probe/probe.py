import json, urllib.request, re
H = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148", "Accept": "application/json, text/plain, */*", "Referer": "https://m.stock.naver.com/"}
D = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", "Accept": "text/html,application/json,*/*"}
URLS = [
 ("m", "https://m.stock.naver.com/api/stock/133690/etfAnalysis"),
 ("d", "https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd=133690"),
 ("d", "https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd=360750"),
 ("d", "https://stockanalysis.com/etf/soxl/holdings/"),
 ("d", "https://stockanalysis.com/etf/tlt/holdings/"),
 ("d", "https://stockanalysis.com/etf/qqq/holdings/"),
 ("d", "https://www.zacks.com/funds/etf/SOXL/holding"),
 ("d", "https://api.nasdaq.com/api/quote/SOXL/info?assetclass=etf"),
 ("m", "https://m.stock.naver.com/api/stock/133690/integration"),
]
out = {}
for kind, u in URLS:
    try:
        req = urllib.request.Request(u, headers=H if kind == "m" else D)
        with urllib.request.urlopen(req, timeout=25) as r:
            b = r.read()
        t = b.decode("utf-8", "replace")
        o = {"len": len(t)}
        if "etfAnalysis" in u:
            j = json.loads(t); o["top10"] = j.get("etfTop10MajorConstituentAssets")
        elif "wisereport" in u:
            m = re.search(r"var\s+CU_data\s*=\s*(\{.*?\});", t, re.S)
            o["cu"] = m.group(1)[:3000] if m else None
            o["has"] = "CU_data" in t
        elif "stockanalysis" in u:
            i = t.find("holdings"); o["head"] = t[:300]
            m = re.search(r"<table.*?</table>", t, re.S)
            o["table"] = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " | ", m.group(0)))[:2500] if m else None
            m2 = re.search(r"holdings:\s*\[(.*?)\]", t, re.S)
            o["svelte"] = m2.group(0)[:1500] if m2 else None
        else:
            o["head"] = t[:2500]
        out[u] = o
    except Exception as e:
        out[u] = {"error": repr(e)[:300]}
try:
    import yfinance as yf
    for s in ("SOXL", "TLT", "GLD", "IBIT"):
        fd = yf.Ticker(s).funds_data
        r = {}
        for k in ("top_holdings", "asset_classes", "bond_holdings", "sector_weightings"):
            try:
                v = getattr(fd, k); r[k] = v.to_dict() if hasattr(v, "to_dict") else v
            except Exception as e:
                r[k] = "ERR " + repr(e)[:150]
        out["yf_" + s] = json.loads(json.dumps(r, default=str))
except Exception as e:
    out["yf"] = repr(e)
json.dump(out, open("probe_out.json", "w"), ensure_ascii=False, indent=1)
print({k: (v.get("len"), v.get("error")) if isinstance(v, dict) else v for k, v in out.items()})
