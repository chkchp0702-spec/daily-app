"""#97 코스피200 선물 미결제약정 — 2차: 네이버 새 선물 화면(sise_index.naver?code=FUT) HTML·JS 에서 미결제 자료 길 찾기 (Actions, 11/14 14시)"""
import re, requests
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36"}
for page in ["https://finance.naver.com/sise/sise_index.naver?code=FUT", "https://m.stock.naver.com/domestic/index/FUT/total"]:
    try: h = requests.get(page, headers=UA, timeout=15).text
    except Exception as e: print("ERR", page, e); continue
    for m in re.finditer(r'(openInterest|미결제|OpenInt|openInt)', h):
        print("HTML", page[:60], h[max(0, m.start()-200):m.end()+200].replace("\n", " "), flush=True); break
    js = set(re.findall(r'(?:src|href)="([^"]+?\.js)"', h)) | set(re.findall(r'"((?:https://[^"]+)?/_next/static/[^"]+?\.js)"', h))
    print("js", page[:60], len(js), flush=True)
    apis = set(); hits = []
    for s in js:
        u = s if s.startswith("http") else (("https://finance.naver.com" if "finance" in page else "https://m.stock.naver.com") + s)
        try: b = requests.get(u, headers=UA, timeout=15).text
        except Exception: continue
        for m in re.finditer(r'(openInterest|미결제|unsettled|OpenInt)', b):
            hits.append((u[-50:], b[max(0, m.start()-300):m.end()+150].replace("\n", " ")))
        for m in re.findall(r'["`\'](/api/[A-Za-z0-9_/\-{}$.:]+|https://[a-z.]*naver\.com/api/[A-Za-z0-9_/\-{}$.:]+)', b):
            apis.add(m)
    print("apis", sorted(a for a in apis if re.search(r'index|utur|eriv|trend|FUT|price', a))[:120], flush=True)
    for x in hits[:8]: print("HIT", x, flush=True)
for u in ["https://m.stock.naver.com/api/index/FUT/integration", "https://m.stock.naver.com/api/index/FUT/basic", "https://m.stock.naver.com/api/index/FUT/trend", "https://m.stock.naver.com/api/index/FUT/futures", "https://m.stock.naver.com/api/index/FUT/investor"]:
    try:
        r = requests.get(u, headers=dict(UA, Referer="https://m.stock.naver.com/"), timeout=15); print(r.status_code, u, r.text[:600].replace("\n", " "), flush=True)
    except Exception as e: print("ERR", u, e)
