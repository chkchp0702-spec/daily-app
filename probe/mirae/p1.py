"""미래에셋증권 상품 페이지 구조 살피기 (임시) — 첫 화면 메뉴 링크·XHR 주소 모으기"""
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
URLS = sys.argv[1:] or ["https://securities.miraeasset.com/"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(locale="ko-KR", user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36")
        res = {}
        for i, u in enumerate(URLS):
            pg = await ctx.new_page(); xhr = []
            async def onresp(r):
                try:
                    ct = r.headers.get("content-type", "")
                    if r.request.resource_type in ("xhr", "fetch") or "json" in ct:
                        body = ""
                        try: body = (await r.text())[:3000]
                        except Exception: pass
                        xhr.append({"url": r.url, "method": r.request.method, "post": (r.request.post_data or "")[:500], "ct": ct, "body": body})
                except Exception: pass
            pg.on("response", lambda r: asyncio.ensure_future(onresp(r)))
            try:
                await pg.goto(u, wait_until="networkidle", timeout=60000)
            except Exception as e:
                print("goto", u, e)
            await pg.wait_for_timeout(4000)
            links, txt, html = [], "", ""
            for fr in pg.frames:
                try:
                    links += await fr.evaluate("""[...document.querySelectorAll('a')].map(a=>[(a.textContent||'').trim().replace(/\\s+/g,' ').slice(0,40), a.getAttribute('href')||'', a.getAttribute('onclick')||''])""")
                    txt += "\n=== " + fr.url + "\n" + await fr.evaluate("document.body ? document.body.innerText.slice(0, 30000) : ''")
                    html += "\n<!-- FRAME " + fr.url + " -->\n" + await fr.content()
                except Exception as e:
                    print("frame", fr.url, e)
            open(f"{OUT}/p{i}.html", "w").write(html[:600000])
            res[u] = {"final": pg.url, "title": await pg.title(), "links": links, "xhr": xhr, "text": txt}
            await pg.screenshot(path=f"{OUT}/p{i}.png", full_page=False)
            await pg.close()
        json.dump(res, open(f"{OUT}/p1.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
