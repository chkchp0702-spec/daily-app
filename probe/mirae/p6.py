import asyncio, json, os, re, requests
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
from playwright.async_api import async_playwright
log = {}
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128"})
for n, u in [("tt_csv", "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv"),
             ("td_v2", "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/v2/treasurybondsinfo.json"),
             ("td_bff", "https://www.tesourodireto.com.br/b3/tesourodireto/service/api/treasurybondsinfo.json")]:
    try:
        r = S.get(u, timeout=120, stream=True); b = r.raw.read(300000, decode_content=True); log[n] = [r.status_code, r.headers.get("content-type", "")[:40], len(b)]
        open(f"{OUT}/{n}.txt", "wb").write(b)
    except Exception as e:
        log[n] = repr(e)[:200]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(locale="ko-KR", viewport={"width": 1280, "height": 1600})
        for name, url in [("td", "https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm"), ("kofia", "https://dis.kofia.or.kr/")]:
            pg = await ctx.new_page(); xhr = []
            async def onresp(r, xhr=xhr):
                try:
                    if r.request.resource_type in ("xhr", "fetch", "document") and "json" in r.headers.get("content-type", "") or ".json" in r.url or ".xml" in r.url:
                        t = ""
                        try: t = (await r.text())[:2500]
                        except Exception: pass
                        xhr.append({"url": r.url, "m": r.request.method, "post": (r.request.post_data or "")[:400], "body": t})
                except Exception: pass
            pg.on("response", lambda r: asyncio.ensure_future(onresp(r)))
            try: await pg.goto(url, wait_until="networkidle", timeout=90000)
            except Exception as e: print(name, e)
            await pg.wait_for_timeout(5000)
            txt = ""; links = []
            for fr in pg.frames:
                try:
                    txt += "\n== " + fr.url + "\n" + await fr.evaluate("document.body?document.body.innerText.slice(0,30000):''")
                    links += await fr.evaluate("[...document.querySelectorAll('a,li,button')].map(a=>[(a.textContent||'').trim().replace(/\\s+/g,' ').slice(0,50),a.getAttribute('href')||'',a.getAttribute('onclick')||a.getAttribute('id')||'']).filter(x=>x[0])")
                except Exception as e: print("fr", e)
            await pg.screenshot(path=f"{OUT}/{name}.png", full_page=True)
            json.dump({"text": txt, "links": links[:800], "xhr": xhr}, open(f"{OUT}/{name}.json", "w"), ensure_ascii=False, indent=1)
            await pg.close()
asyncio.run(main())
json.dump(log, open(f"{OUT}/p6log.json", "w"), indent=1)
