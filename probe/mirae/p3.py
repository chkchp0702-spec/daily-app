import asyncio, json, os
from playwright.async_api import async_playwright
OUT = "probe/mirae/out"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(locale="ko-KR", viewport={"width": 1280, "height": 2400})
        res = {}
        for cat in ("1282", "2078"):
            pg = await ctx.new_page()
            await pg.goto(f"https://securities.miraeasset.com/bbs/board/message/list.do?categoryId={cat}", wait_until="networkidle")
            a = pg.locator("a", has_text="판매정보").first
            await a.click(); await pg.wait_for_load_state("networkidle"); await pg.wait_for_timeout(2000)
            txt = await pg.evaluate("document.body.innerText")
            imgs = await pg.evaluate("[...document.querySelectorAll('img')].map(i=>i.src).filter(s=>!/common|layout|new2016|ico/.test(s))")
            tables = await pg.evaluate("[...document.querySelectorAll('table')].map(t=>t.innerText.slice(0,4000))")
            res[cat] = {"url": pg.url, "text": txt[:15000], "imgs": imgs, "tables": tables}
            await pg.screenshot(path=f"{OUT}/board_{cat}.png", full_page=True)
        json.dump(res, open(f"{OUT}/p3.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
