import urllib.request, json
UA={"User-Agent":"Mozilla/5.0"}
for d in ["2019-11-01","2020-03-16","2021-06-01","2022-06-01","2023-06-01","2024-06-03","2025-06-02"]:
    for u in [f"https://cdn.cboe.com/data/us/options/market_statistics/daily/{d}_daily_options"]:
        try:
            b=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=15).read(); j=json.loads(b)
            r=[x for x in j.get("ratios",[]) if "EQUITY" in x["name"] or "TOTAL" in x["name"]]; print("OK",d,r)
        except Exception as e: print("FAIL",d,str(e)[:80])
