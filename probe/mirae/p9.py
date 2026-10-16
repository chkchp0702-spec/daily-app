import requests, os, re, json
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128"})
S.get("https://dis.kofia.or.kr/", timeout=30)
for n in ["inc/DISFundStdPrcRate", "inc/DISFundROPCmpAnn", "inc/DISPefInvestAnnStut", "inc/DISFundStdPrice", "inc/DISPridRcyList", "../com/grd"]:
    r = S.get(f"https://dis.kofia.or.kr/wq/fundann/{n}.xml", timeout=60); n = n.split("/")[-1]
    open(f"{OUT}/{n}.xml", "w").write(r.text)
    print(n, r.status_code, len(r.text))
