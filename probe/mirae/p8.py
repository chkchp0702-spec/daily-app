import asyncio, json, os
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
from playwright.async_api import async_playwright
B = "https://dis.kofia.or.kr/websquare/index.jsp?w2xPath="
RATE = "/wq/fundann/DISFundStdPrcRate.xml&divisionId=MDIS01004003000000&serviceId=SDIS01004003000"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(locale="ko-KR", viewport={"width": 1400, "height": 2200})
        pg = await ctx.new_page(); xhr = []
        async def onresp(r):
            try:
                if r.request.resource_type in ("xhr", "fetch") and r.request.method == "POST":
                    t = ""
                    try: t = (await r.text())[:6000]
                    except Exception: pass
                    xhr.append({"url": r.url, "hdr": dict(r.request.headers), "post": (r.request.post_data or "")[:4000], "status": r.status, "body": t})
            except Exception: pass
        pg.on("response", lambda r: asyncio.ensure_future(onresp(r)))
        await pg.goto(B + RATE, wait_until="networkidle", timeout=90000); await pg.wait_for_timeout(4000)
        info = {}
        info["selects"] = await pg.evaluate("[...document.querySelectorAll('select')].map(s=>[s.id,s.options.length,[...s.options].slice(0,5).map(o=>o.text+'='+o.value)])")
        info["inputs"] = await pg.evaluate("[...document.querySelectorAll('input')].map(i=>[i.id,i.type,i.value,i.className]).slice(0,60)")
        info["buttons"] = await pg.evaluate("[...document.querySelectorAll('a,button,img,input[type=button],input[type=image]')].filter(x=>/조회|검색/.test((x.innerText||x.alt||x.value||x.title||''))).map(x=>[x.tagName,x.id,(x.innerText||x.alt||x.value||'').trim().slice(0,20),x.className])")
        # 운용사 = 타임폴리오자산운용 고르고 조회
        try:
            await pg.evaluate("""(()=>{var s=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>/타임폴리오/.test(o.text)));if(!s)return 'nosel';var o=[...s.options].find(o=>/타임폴리오/.test(o.text));s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));return o.value;})()""")
            await pg.wait_for_timeout(1500)
            for sel in ["a:has-text('조회')", "button:has-text('조회')", "input[value='조회']", "img[alt='조회']", "[title='조회']", "a:has-text('검색')"]:
                l = pg.locator(sel)
                if await l.count():
                    await l.first.click(); info["clicked"] = sel; break
            await pg.wait_for_timeout(8000)
        except Exception as e:
            info["err"] = repr(e)[:300]
        info["text"] = await pg.evaluate("document.body.innerText.slice(0,30000)")
        await pg.screenshot(path=f"{OUT}/k_rate2.png", full_page=True)
        info["xhr"] = xhr
        json.dump(info, open(f"{OUT}/p8.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
