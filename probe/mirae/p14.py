import asyncio, json, os, requests, datetime
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
from playwright.async_api import async_playwright
B = "https://securities.miraeasset.com"
URLS = {"fund": B + "/hks/hks4116/p11.do?fd_cd=KR5153490532", "bond": B + "/hks/hks4036/v01.do?itemCode=KR103502GA34", "bond2": B + "/hks/hks4036/v01.do?itemCode=KR6213502F42"}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(locale="ko-KR", viewport={"width": 1280, "height": 2400})
        out = {}
        for name, u in URLS.items():
            pg = await ctx.new_page(); xhr = []
            async def onresp(r, xhr=xhr):
                try:
                    if r.request.resource_type in ("xhr", "fetch"):
                        t = ""
                        try: t = (await r.text())[:6000]
                        except Exception: pass
                        xhr.append({"url": r.url, "m": r.request.method, "post": (r.request.post_data or "")[:600], "body": t})
                except Exception: pass
            pg.on("response", lambda r: asyncio.ensure_future(onresp(r)))
            try: await pg.goto(u, wait_until="networkidle", timeout=90000)
            except Exception as e: print(name, e)
            await pg.wait_for_timeout(4000)
            # 탭 누르기 (구성/포트폴리오)
            for t in ["포트폴리오", "자산구성", "투자자산", "보유종목", "구성"]:
                try:
                    l = pg.locator("a", has_text=t)
                    if await l.count(): await l.first.click(); await pg.wait_for_timeout(2500)
                except Exception: pass
            txt = await pg.evaluate("document.body.innerText.slice(0,40000)")
            await pg.screenshot(path=f"{OUT}/{name}.png", full_page=True)
            out[name] = {"url": pg.url, "text": txt, "xhr": xhr}
            await pg.close()
        json.dump(out, open(f"{OUT}/p14.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128"})
log = {}
for k in range(1, 6):
    d = datetime.date.today() - datetime.timedelta(days=k)
    u = f"https://www.anbima.com.br/informacoes/merc-sec/arqs/ms{d.strftime('%y%m%d')}.txt"
    try:
        r = S.get(u, timeout=60); log[u] = [r.status_code, len(r.content)]
        if r.status_code == 200 and len(r.content) > 1000:
            open(f"{OUT}/anbima.txt", "wb").write(r.content); break
    except Exception as e:
        log[u] = repr(e)[:200]
json.dump(log, open(f"{OUT}/p14log.json", "w"), indent=1)
