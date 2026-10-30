import re, requests
U = "https://m.seibro.or.kr/cnts/loan/selectStockLoanState.do"
hd = {"User-Agent": "Mozilla/5.0 (iPhone)", "Referer": "https://m.seibro.or.kr/"}
try:
    t = requests.get(U, headers=hd, timeout=20).text
    print("LEN", len(t))
    for m in re.finditer(r"(series|categories|data\s*:|url\s*:|\.do|ajax|function\s+\w+)", t):
        s = max(0, m.start() - 120); print("--", re.sub(r"\s+", " ", t[s:m.end() + 200]))
except Exception as e:
    print("ERR", e)
