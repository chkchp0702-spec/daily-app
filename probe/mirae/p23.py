import asyncio, json, os, re
from playwright.async_api import async_playwright
OUT = "probe/mirae/out"
async def main():
    out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        for rc in ["20261012000426", "20260807000692"]:
            await pg.goto(f"https://dart.fss.or.kr/dsaf001/main.do?rcpNo={rc}", timeout=60000); await pg.wait_for_timeout(3000)
            src = await pg.evaluate("(document.getElementById('ifrm')||{}).src||''")
            txt = ""
            for f in pg.frames:
                try: txt += "\n=====FRAME " + f.url + "\n" + (await f.inner_text("body"))[:6000]
                except Exception: pass
            out[rc] = {"src": src, "txt": txt}
        await b.close()
    json.dump(out, open(f"{OUT}/p23.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
