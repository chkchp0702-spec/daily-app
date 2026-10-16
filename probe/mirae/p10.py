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
                if r.request.method == "POST" and "XMLSERVICES" in r.url:
                    t = ""
                    try: t = (await r.text())[:20000]
                    except Exception: pass
                    xhr.append({"post": (r.request.post_data or "")[:5000], "status": r.status, "body": t})
            except Exception: pass
        pg.on("response", lambda r: asyncio.ensure_future(onresp(r)))
        await pg.goto(B + RATE, wait_until="networkidle", timeout=90000); await pg.wait_for_timeout(5000)
        n0 = len(xhr)
        info = {}
        try:
            info["set"] = await pg.evaluate("(()=>{ try{ comdity.setValue('2'); }catch(e){ return 'err '+e; } try{ goSearch(); return 'ok'; }catch(e){ return 'gs '+e; } })()")
        except Exception as e:
            info["set"] = repr(e)
        await pg.wait_for_timeout(12000)
        info["text"] = await pg.evaluate("document.body.innerText.slice(0,20000)")
        info["xhr"] = xhr[n0:]
        await pg.screenshot(path=f"{OUT}/k_rate3.png", full_page=True)
        json.dump(info, open(f"{OUT}/p10.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
