import json, urllib.request, urllib.parse
H = {"User-Agent": "CHInvestingApp/1.0 (https://chkchp0702-spec.github.io/daily-app/; chk app)"}
out = {}
def get(u, raw=False):
    req = urllib.request.Request(u, headers=H)
    with urllib.request.urlopen(req, timeout=20) as r:
        b = r.read(); return (r.status, r.headers.get("Content-Type"), len(b), (b[:600].decode("utf-8", "replace") if not raw else ""))
tests = [
 "https://ko.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote("스마트폰"),
 "https://ko.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote("냉장고"),
 "https://ko.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote("DRAM"),
 "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote("iPhone"),
 "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote("Apple Inc."),
 "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=400&generator=search&gsrsearch=" + urllib.parse.quote("Curiox Biosystems") + "&gsrlimit=1",
 "https://ko.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=" + urllib.parse.quote("삼성전자"),
 "https://ssl.pstatic.net/imgstock/fn/real/logo/png/stock/Stock005930.png",
 "https://ssl.pstatic.net/imgstock/fn/real/logo/png/stock/StockAAPL.O.png",
 "https://ssl.pstatic.net/imgstock/fn/real/logo/png/stock/StockAAPL.png",
 "https://www.google.com/s2/favicons?domain=apple.com&sz=128",
 "https://www.google.com/s2/favicons?domain=curiox.com&sz=128",
 "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png",
]
for u in tests:
    try:
        out[u] = get(u, raw=("png" in u or "favicon" in u or "upload." in u))
    except Exception as e:
        out[u] = repr(e)[:200]
json.dump(out, open("probe_out.json", "w"), ensure_ascii=False, indent=1)
print(out)
