"""#94 프로그램 매매 — 네이버 새 화면(sise_program.naver, Next.js) 안의 자료 주소 찾기"""
import requests, re
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36", "Referer": "https://finance.naver.com/"}
t = requests.get("https://finance.naver.com/sise/sise_program.naver", headers=UA, timeout=20).text
print("len", len(t))
urls = sorted(set(re.findall(r'https?://[a-zA-Z0-9./_\-]*(?:api|front)[a-zA-Z0-9./_\-?=&{}]*', t)))
print("URLS", urls[:60])
paths = sorted(set(re.findall(r'["\'](/[a-zA-Z0-9_\-]*api[a-zA-Z0-9/_\-{}]*)', t)))
print("PATHS", paths[:60])
for k in ("program", "Program", "arbitrage", "Arbitrage", "nonArb", "비차익"):
    for m in list(re.finditer(k, t))[:4]:
        print("CTX", k, "|", t[max(0, m.start() - 200): m.start() + 300].replace("\n", " "))
js = sorted(set(re.findall(r'src="([^"]+\.js)"', t)))
print("JS", len(js))
hit = 0
for j in js:
    u = j if j.startswith("http") else "https://finance.naver.com" + j
    try: s = requests.get(u, headers=UA, timeout=20).text
    except Exception: continue
    for m in re.finditer(r'[`"\'][^`"\']{0,80}[pP]rogram[^`"\']{0,120}[`"\']', s):
        print("JSHIT", u[-60:], "|", m.group(0)[:220]); hit += 1
        if hit > 40: break
    if hit > 40: break
for u in ("https://m.stock.naver.com/front-api/index/programTrading?category=KOSPI",
          "https://finance.naver.com/api/sise/programTrend?sosok=KOSPI",
          "https://m.stock.naver.com/api/index/KOSPI/programTrading?pageSize=3&page=1"):
    try:
        r = requests.get(u, headers=UA, timeout=20); print("SRC", r.status_code, u, r.text[:200].replace("\n", " "))
    except Exception as e: print("err", u)
