import re, urllib.request, json
out=[]
def log(*a): s=" ".join(str(x) for x in a); print(s); out.append(s)
H={"User-Agent":"Mozilla/5.0"}
html=urllib.request.urlopen(urllib.request.Request("https://finance.daum.net/domestic/investors",headers=H),timeout=25).read().decode()
js=[j for j in re.findall(r'src="([^"]+\.js)"',html) if 'daumcdn' in j]
q=urllib.request.urlopen(urllib.request.Request("https://finance.daum.net/quotes/A005930",headers=H),timeout=25).read().decode()
js+= [j for j in re.findall(r'src="([^"]+\.js)"',q) if 'daumcdn' in j and j not in js]
for u in js:
    s=urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=25).read().decode("utf-8","replace")
    for m in re.finditer(r"(?:url|URL|api|Api)\s*[:=]\s*['\"`]([^'\"`]*(?:invest|rank|pension|trend)[^'\"`]*)['\"`]",s): log("URL",u.split('/')[-1],m.group(1))
    for m in re.finditer(r"['\"`](/api/[^'\"`]{3,80})['\"`]",s):
        if any(k in m.group(1).lower() for k in ("invest","rank","trend","pension","institution")): log("API",u.split('/')[-1],m.group(1))
    for kw in ("investorType","PENSION_FUND'","rankings","straightPurchaseRank"):
        for m in list(re.finditer(kw,s))[:2]: log("KW",kw,u.split('/')[-1],s[max(0,m.start()-200):m.start()+200].replace("\n"," "))
H2={**H,"Accept":"application/json","Referer":"https://finance.daum.net/domestic/investors"}
for u in ["https://finance.daum.net/api/investor/KOSPI/days?page=1&perPage=1&details=true","https://finance.daum.net/api/investor/KOSDAQ/days?page=1&perPage=1&details=true"]:
    log("DET",urllib.request.urlopen(urllib.request.Request(u,headers=H2),timeout=25).read().decode()[:1500])
open("out/probe4.txt","w").write("\n".join(out))
