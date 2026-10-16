import asyncio, json, os
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
from playwright.async_api import async_playwright
B = "https://dis.kofia.or.kr/websquare/index.jsp?w2xPath="
PAGES = {"rop": "/wq/fundann/DISFundROPCmpAnn.xml&divisionId=MDIS01009001000000&serviceId=SDIS01009001000",
         "rate": "/wq/fundann/DISFundStdPrcRate.xml&divisionId=MDIS01004003000000&serviceId=SDIS01004003000",
         "pef": "/wq/fundann/DISPefInvestAnnStut.xml&divisionId=MDIS01019001000000&serviceId=SDIS01019001000",
         "srch": "/wq/fundann/DISFundAnnSrch.xml&divisionId=MDIS01001000000000&serviceId=SDIS01001000000"}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(locale="ko-KR", viewport={"width": 1400, "height": 1800})
        out = {}
        for name, path in PAGES.items():
            pg = await ctx.new_page(); xhr = []
            async def onresp(r, xhr=xhr):
                try:
                    if r.request.resource_type in ("xhr", "fetch"):
                        t = ""
                        try: t = (await r.text())[:4000]
                        except Exception: pass
                        xhr.append({"url": r.url, "m": r.request.method, "hdr": {k: v for k, v in r.request.headers.items() if k.lower() in ("content-type", "x-requested-with", "accept")}, "post": (r.request.post_data or "")[:3000], "status": r.status, "body": t})
                except Exception: pass
            pg.on("response", lambda r: asyncio.ensure_future(onresp(r)))
            try: await pg.goto(B + path, wait_until="networkidle", timeout=90000)
            except Exception as e: print(name, e)
            await pg.wait_for_timeout(5000)
            # 검색/조회 버튼 눌러보기
            try:
                btn = pg.locator("a,button,input[type=button]", has_text="조회").first
                if await btn.count(): await btn.click(); await pg.wait_for_timeout(6000)
            except Exception as e: print("click", name, e)
            txt = await pg.evaluate("document.body?document.body.innerText.slice(0,40000):''")
            sels = await pg.evaluate("[...document.querySelectorAll('select')].map(s=>[s.id,[...s.options].map(o=>o.text+'='+o.value).slice(0,40)])")
            await pg.screenshot(path=f"{OUT}/k_{name}.png", full_page=True)
            out[name] = {"text": txt, "selects": sels, "xhr": xhr}
            await pg.close()
        json.dump(out, open(f"{OUT}/p7.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
