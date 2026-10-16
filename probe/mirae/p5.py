"""브라질 국채(Tesouro Direto)·사모펀드 공개 자료 살피기 (임시)"""
import json, os, re, requests
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36", "Accept": "application/json, text/html"})
log = {}
def tryget(name, url, **kw):
    try:
        r = S.get(url, timeout=40, **kw); log[name] = [r.status_code, len(r.text), r.headers.get("content-type", "")[:40]]
        open(f"{OUT}/{name}.txt", "w").write(r.text[:400000])
    except Exception as e:
        log[name] = repr(e)[:200]
tryget("tesouro", "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json")
tryget("kofia_main", "https://dis.kofia.or.kr/")
tryget("kofia_fund", "https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAnnPFundStat.xml")
tryget("fundamoa", "https://fundamoa.kofia.or.kr/")
tryget("brl_yield", "https://www.anbima.com.br/informacoes/est-termo/CZ.asp")
json.dump(log, open(f"{OUT}/p5log.json", "w"), ensure_ascii=False, indent=1)
