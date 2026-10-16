import requests, os, re, json
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128"})
S.get("https://dis.kofia.or.kr/", timeout=30)
for n in ["DISFundStdPrcRate", "DISFundROPCmpAnn", "DISPefInvestAnnStut", "DISFundStdPrice", "DISPridRcyList"]:
    r = S.get(f"https://dis.kofia.or.kr/wq/fundann/{n}.xml", timeout=60)
    open(f"{OUT}/{n}.xml", "w").write(r.text)
    print(n, r.status_code, len(r.text))
