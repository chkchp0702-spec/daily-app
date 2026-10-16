import asyncio, json, os, re
from playwright.async_api import async_playwright
OUT = "probe/mirae/out"
RC = ["20261014000303", "20261016000197"]
async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        # 삼성 10/14 주가연계증권 접수번호 찾기
        await pg.goto("https://dart.fss.or.kr/dsab007/main.do", timeout=90000); await pg.wait_for_timeout(1500)
        await pg.evaluate("""()=>{var f=document.searchForm; f.startDate.value='20261013'; f.endDate.value='20261016'; f.textPresenterNm.value='삼성증권'; document.querySelectorAll('input[name=publicType]').forEach(x=>x.checked=false); var o=document.getElementById('option'); if(o) o.value='report';}""")
        await pg.evaluate("search(0)"); await pg.wait_for_timeout(6000)
        rows = await pg.evaluate("""()=>[...document.querySelectorAll('#listContents table tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.innerText.trim()).concat([((tr.querySelector('a[href*=rcpNo]')||{}).href||'')]))""")
        rcs = [re.search(r"rcpNo=(\d+)", r[-1]).group(1) for r in rows if "주가연계증권" in r[2] or "주가연계파생결합사채" in r[2]][:2]
        for rc in rcs:
            await pg.goto(f"https://dart.fss.or.kr/dsaf001/main.do?rcpNo={rc}", timeout=60000); await pg.wait_for_timeout(2500)
            out = {}
            for key in ["모집 또는 매출의 개요", "1. 공모개요", "Ⅱ. 증권의 주요 권리내용"]:
                try:
                    a = pg.locator(".jstree-anchor", has_text=key).first
                    await a.click(); await pg.wait_for_timeout(2500)
                    for f in pg.frames:
                        if "viewer.do" in f.url:
                            out[key] = (await f.inner_text("body"))[:12000]
                except Exception as e:
                    out[key] = repr(e)[:200]
            res[rc] = out
        await b.close()
    json.dump(res, open(f"{OUT}/p31.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
