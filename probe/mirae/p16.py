import requests, os, json, datetime
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128"})
log = {}
def get(name, url, n=400000, **kw):
    try:
        r = S.get(url, timeout=60, **kw); log[name] = [r.status_code, r.headers.get("content-type"), len(r.text)]
        open(f"{OUT}/{name}.txt", "w").write(r.text[:n])
    except Exception as e:
        log[name] = repr(e)[:200]
y = datetime.date.today().year
get("td_secs", "https://www.treasurydirect.gov/TA_WS/securities/search?format=json&type=Note&pagesize=50")
get("fd_auct", "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query?filter=security_type:in:(Note,Bond,TIPS)&sort=-auction_date&page[size]=1000&fields=cusip,security_type,security_term,auction_date,issue_date,maturity_date,int_rate,high_yield,reopening")
get("fd_mspd", "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/debt/mspd/mspd_table_3_market?sort=-record_date&page[size]=50")
get("yc_csv", f"https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/{y}/all?type=daily_treasury_yield_curve&field_tdr_date_value={y}&page&_format=csv")
get("yc_real", f"https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/{y}/all?type=daily_treasury_real_yield_curve&field_tdr_date_value={y}&page&_format=csv")
get("fd_avg", "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=5")
json.dump(log, open(f"{OUT}/p16.json", "w"), indent=1)
