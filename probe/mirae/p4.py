import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(locale="ko-KR", viewport={"width":1280,"height":2400})).new_page()
        xhr = []
        pg.on("request", lambda r: xhr.append([r.method, r.url, (r.post_data or "")[:300]]) if r.resource_type in ("xhr","fetch") else None)
        await pg.goto("https://securities.miraeasset.com/hks/hks4046/v01.do", wait_until="networkidle"); await pg.wait_for_timeout(3000)
        t = await pg.evaluate("document.body.innerText")
        tables = await pg.evaluate("[...document.querySelectorAll('table')].map(t=>t.innerText.slice(0,3000))")
        await pg.screenshot(path="probe/mirae/out/p4_ind.png", full_page=True)
        json.dump({"url": pg.url, "text": t[:20000], "tables": tables, "xhr": xhr}, open("probe/mirae/out/p4.json","w"), ensure_ascii=False, indent=1)
asyncio.run(main())
