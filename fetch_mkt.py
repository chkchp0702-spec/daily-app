"""시장 전체 투자자별(연기금·사모·투신·보험·은행·금융투자·외국인·개인) 일별 순매수 — 다음 금융 details=true (로그인 없음) + 지수 종가(네이버)"""
import json, urllib.request, time, csv
H={"User-Agent":"Mozilla/5.0","Accept":"application/json"}
def get(u,ref):
    for k in range(4):
        try: return json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={**H,"Referer":ref}),timeout=25).read().decode())
        except Exception as e: err=e; time.sleep(2*(k+1))
    raise err
rows=[]
for mk in ("KOSPI","KOSDAQ"):
    pg=1
    while True:
        j=get(f"https://finance.daum.net/api/investor/{mk}/days?page={pg}&perPage=100&details=true","https://finance.daum.net/domestic/investors")
        for x in j.get("data") or []:
            d=x.get("details") or {}
            rows.append({"mk":mk,"date":x["date"][:10],**{k:d.get(k) for k in ("FOREIGN","INDIVIDUAL","FINANCIAL_INVESTOR","INSURANCE_COMPANIES","MUTUAL_FUND","PRIVATE_EQUITY_FUND","BANK","ETC_FINANCIAL_INSTITUTION","PENSION_FUND","ETC_CORPORATION","ETC_FOREIGN")},"INST":x.get("institutionStraightPurchasePrice")})
        if pg>=(j.get("totalPages") or 0) or not j.get("data"): break
        pg+=1; time.sleep(0.2)
    print(mk,pg)
w=csv.DictWriter(open("out/mkt_flow.csv","w",newline=""),fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
ix=[]
for mk in ("KOSPI","KOSDAQ"):
    for pg in range(1,40):
        j=get(f"https://m.stock.naver.com/api/index/{mk}/price?page={pg}&pageSize=100","https://m.stock.naver.com/")
        if not j: break
        for x in j: ix.append({"mk":mk,"date":x["localTradedAt"][:10],"close":str(x["closePrice"]).replace(",","")})
        if len(j)<100: break
        time.sleep(0.15)
    print(mk,"index",pg)
w=csv.DictWriter(open("out/mkt_index.csv","w",newline=""),fieldnames=["mk","date","close"]); w.writeheader(); w.writerows(ix)
print(len(rows),len(ix))
