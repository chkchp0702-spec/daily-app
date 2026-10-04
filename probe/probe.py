import json, urllib.request, traceback
H = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148", "Accept": "application/json, text/plain, */*", "Referer": "https://m.stock.naver.com/"}
URLS = [
 "https://m.stock.naver.com/api/stock/445680/integration",
 "https://m.stock.naver.com/api/stock/445680/overview",
 "https://api.stock.naver.com/stock/445680/integration",
 "https://m.stock.naver.com/api/stock/445680/basic",
 "https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx?cmp_cd=445680",
 "https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx?cmp_cd=005930",
 "https://api.stock.naver.com/stock/AAPL.O/overview",
 "https://api.stock.naver.com/stock/AAPL.O/integration",
 "https://m.stock.naver.com/api/stock/AAPL.O/integration",
 "https://api.stock.naver.com/stock/0700.HK/integration",
 "https://api.nasdaq.com/api/screener/etf?download=true",
 "https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0",
 "https://m.stock.naver.com/api/stock/069500/etfAnalysis",
 "https://m.stock.naver.com/api/stock/069500/integration",
 "https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd=069500",
 "https://m.stock.naver.com/api/etf/069500/component",
]
out = {}
for u in URLS:
    try:
        h = dict(H)
        if "nasdaq" in u:
            h = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0", "Accept": "application/json"}
        req = urllib.request.Request(u, headers=h)
        with urllib.request.urlopen(req, timeout=25) as r:
            b = r.read()
            try:
                t = b.decode("utf-8")
            except UnicodeDecodeError:
                t = b.decode("euc-kr", "replace")
            out[u] = {"status": r.status, "len": len(t), "head": t[:6000]}
            if "wisereport" in u:
                for kw in ("기업개요", "매출구성", "제품", "cmp_comment", "구성종목", "CU_"):
                    i = t.find(kw)
                    if i >= 0:
                        out[u]["at_" + kw] = t[max(0, i - 300): i + 2500]
    except Exception as e:
        out[u] = {"error": repr(e)[:300]}
try:
    import yfinance as yf
    for s in ("SPY", "QQQ", "069500.KS"):
        t = yf.Ticker(s); fd = t.funds_data
        res = {}
        for k in ("description", "fund_overview", "fund_operations", "top_holdings", "sector_weightings", "asset_classes"):
            try:
                v = getattr(fd, k)
                res[k] = v.to_dict() if hasattr(v, "to_dict") else v
            except Exception as e:
                res[k] = "ERR " + repr(e)[:200]
        try:
            info = t.info; res["info"] = {k: info.get(k) for k in ("longName", "category", "totalAssets", "yield", "annualReportExpenseRatio", "netExpenseRatio", "fundFamily", "quoteType", "longBusinessSummary")}
        except Exception as e:
            res["info"] = repr(e)
        out["yf_" + s] = json.loads(json.dumps(res, default=str))
except Exception:
    out["yf"] = traceback.format_exc()[-800:]
json.dump(out, open("probe_out.json", "w"), ensure_ascii=False, indent=1)
print({k: (v.get("status") if isinstance(v, dict) else None, v.get("len") if isinstance(v, dict) else None, v.get("error") if isinstance(v, dict) else None) for k, v in out.items()})
