import json, urllib.request
H={"User-Agent":"Mozilla/5.0","Accept":"application/json"}
out=[]
def log(*a): s=" ".join(str(x) for x in a); print(s); out.append(s)
def t(u,ref="https://finance.daum.net/"):
    try:
        r=urllib.request.Request(u,headers={**H,"Referer":ref}); x=urllib.request.urlopen(r,timeout=25).read().decode("utf-8","replace"); log("OK",u,"->",x[:700])
    except urllib.error.HTTPError as e: log("HTTP",e.code,u,e.read()[:150])
    except Exception as e: log("ERR",u,e)
R="https://finance.daum.net/quotes/A005930"
for u in ["https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=1&details=true",
          "https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=1&detail=true",
          "https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=1&isDetail=true",
          "https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=1&fieldName=details",
          "https://finance.daum.net/api/investor/KOSPI/details?page=1&perPage=1",
          "https://finance.daum.net/api/investor/KOSPI/days/details?page=1&perPage=1",
          "https://finance.daum.net/api/investor/days?symbolCode=A005930&page=1&perPage=1&details=true",
          "https://finance.daum.net/api/investor/days?symbolCode=A005930&page=1&perPage=1&detail=true",
          "https://finance.daum.net/api/investor/days?symbolCode=A005930&page=1&perPage=1&isDetail=true",
          "https://finance.daum.net/api/investor/details?symbolCode=A005930&page=1&perPage=1",
          "https://finance.daum.net/api/investor/A005930/days?page=1&perPage=1",
          "https://finance.daum.net/api/investor/A005930/details?page=1&perPage=1",
          "https://finance.daum.net/api/quotes/A005930/investors?page=1&perPage=1",
          "https://finance.daum.net/api/trend/investors/A005930?page=1&perPage=1",
          "https://finance.daum.net/api/investor/ranks?market=KOSPI&investorType=PENSION&page=1&perPage=3",
          "https://finance.daum.net/api/investor/KOSPI/ranks?page=1&perPage=3",
          "https://finance.daum.net/api/trend/investor_ranks?market=KOSPI&page=1&perPage=3"]:
    t(u,R)
# find API names in daum JS bundle
try:
    import re
    r=urllib.request.Request("https://finance.daum.net/domestic/investors",headers={"User-Agent":"Mozilla/5.0"}); html=urllib.request.urlopen(r,timeout=25).read().decode("utf-8","replace")
    js=re.findall(r'src="([^"]+\.js)"',html); log("js files",js[:15])
    for j in js:
        u=j if j.startswith("http") else "https://finance.daum.net"+j
        try:
            s=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=25).read().decode("utf-8","replace")
            apis=sorted(set(re.findall(r'["\'`](/api/[a-zA-Z0-9_/\-\$\{\}\.]+)',s)))
            inv=[a for a in apis if 'invest' in a.lower() or 'pension' in a.lower() or 'rank' in a.lower()]
            if inv: log("JS",u[-50:],inv[:60])
            for kw in ("pension","privateEquity","PENSION","연기금","financialInvestment"):
                for m in list(re.finditer(kw,s))[:2]: log("KW",kw,u[-40:],s[max(0,m.start()-160):m.start()+160].replace("\n"," "))
        except Exception as e: log("js err",u,e)
except Exception as e: log("page err",e)
open("out/probe3.txt","w").write("\n".join(out))
