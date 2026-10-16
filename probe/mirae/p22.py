import asyncio, json, os, re
from playwright.async_api import async_playwright
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
NM = ["타임폴리오자산운용", "브이아이피자산운용", "머스트자산운용"]
async def main():
    res = {}; cap = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        pg.on("request", lambda r: cap.append([r.method, r.url, (r.post_data or "")[:600], dict(r.headers)]) if ".ax" in r.url or "Search" in r.url else None)
        await pg.goto("https://dart.fss.or.kr/dsab007/main.do", timeout=60000)
        await pg.wait_for_timeout(2000)
        for nm in NM:
            try:
                await pg.evaluate("""(nm)=>{var f=document.searchForm; f.textPresenterNm.value=nm; f.startDate.value='20240101'; f.endDate.value='20261016';
                    document.querySelectorAll('input[name=publicType]').forEach(x=>x.checked=(x.value=='D001')); var o=document.getElementById('option'); if(o) o.value='report';}""", nm)
                await pg.evaluate("search(0)")
                await pg.wait_for_timeout(6000)
                h = await pg.inner_html("body")
                open(f"{OUT}/dart_pw_{nm}.html", "w").write(h[:300000])
                rows = await pg.evaluate("""()=>[...document.querySelectorAll('.table_list tbody tr, #listContents table tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.innerText.trim()).concat([(tr.querySelector('a[href*=rcpNo]')||{}).href||'']))""")
                res[nm] = rows[:60]
            except Exception as e:
                res[nm] = repr(e)[:300]
        await b.close()
    json.dump({"res": res, "cap": cap[:20]}, open(f"{OUT}/p22.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
