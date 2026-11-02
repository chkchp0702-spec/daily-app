# #34 대차잔고 길 찾기 2 — selectStockLoanState.do 의 폼·선택지·차트 숫자만 짧게
import re, requests
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
                  "Referer": "https://m.seibro.or.kr/"})
B = "https://m.seibro.or.kr"
def show(tag, r):
    t = r.text
    print("=====", tag, r.status_code, len(t))
    for m in re.findall(r"<form[^>]*>", t): print(" FORM", m[:200])
    for m in re.findall(r"<input[^>]*>", t): print(" INPUT", m[:200])
    for sel in re.findall(r"<select[^>]*>.*?</select>", t, re.S):
        print(" SELECT", re.sub(r"\s+", " ", sel)[:600])
    for m in re.findall(r"(categories\s*:\s*\[.*?\])", t, re.S): print(" CAT", re.sub(r"\s+", " ", m)[:800])
    for m in re.findall(r"(name\s*:\s*'[^']*'\s*,\s*data\s*:\s*\[.*?\])", t, re.S): print(" SER", re.sub(r"\s+", " ", m)[:800])
    for m in re.findall(r"form\.action\s*=\s*\"[^\"]+\"", t): print(" ACT", m)
    for m in re.findall(r"function\s+\w+\s*\([^)]*\)\s*\{[^}]{0,400}", t):
        if "submit" in m or "ajax" in m or "action" in m: print(" FN", re.sub(r"\s+", " ", m)[:400])
    # 표
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S)
    for rr in rows[:25]:
        cells = [re.sub(r"<[^>]+>|\s+", " ", c).strip() for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", rr, re.S)]
        if cells: print(" TR", cells)
    print(" ROWS", len(rows))
p = "/cnts/loan/selectStockLoanState.do"
r = S.get(B + p, timeout=25); show("GET", r)
t = r.text
names = re.findall(r"<(?:input|select)[^>]*name=['\"]([^'\"]+)['\"]", t)
print("NAMES", names)
# 날짜 바꾸기 시도
for data in [{"strtDd": "20240101", "endDd": "20241231"}, {"fromDt": "20240101", "toDt": "20241231"},
             {"STD_DT": "20240102"}, {"searchStartDate": "2024-01-01", "searchEndDate": "2024-12-31"}]:
    d = {n: "" for n in names}; d.update(data)
    try:
        r2 = S.post(B + p, data=d, timeout=25); show("POST " + str(data), r2)
    except Exception as e: print("ERR", e)
