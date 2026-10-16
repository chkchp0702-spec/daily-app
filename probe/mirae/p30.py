import asyncio, json, os, re, datetime
from playwright.async_api import async_playwright
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto("https://dart.fss.or.kr/dsab007/main.do", timeout=90000); await pg.wait_for_timeout(2000)
        st = (datetime.date.today() - datetime.timedelta(days=10)).strftime("%Y%m%d"); en = datetime.date.today().strftime("%Y%m%d")
        await pg.evaluate("""(a)=>{var f=document.searchForm; f.startDate.value=a[0]; f.endDate.value=a[1]; f.reportName.value=''; f.textPresenterNm.value='삼성증권'; var mr=document.getElementById('maxResultsCb'); if(mr) mr.value='100'; if (f.maxResults) f.maxResults.value='100';
            document.querySelectorAll('input[name=publicType]').forEach(x=>x.checked=false); var o=document.getElementById('option'); if(o) o.value='report';}""", [st, en])
        await pg.evaluate("search(0)"); await pg.wait_for_timeout(8000)
        rows = await pg.evaluate("""()=>[...document.querySelectorAll('#listContents table tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.innerText.trim()).concat([((tr.querySelector('a[href*=rcpNo]')||{}).href||'')]))""")
        res["rows"] = rows[:100]
        els = [r for r in rows if "일괄" in " ".join(r) or "투자설명" in " ".join(r) or "증권신고" in " ".join(r)]
        res["n_els"] = len(els)
        docs = {}
        for r in els[:3]:
            m = re.search(r"rcpNo=(\d+)", r[-1] or "")
            if not m: continue
            rc = m.group(1)
            await pg.goto(f"https://dart.fss.or.kr/dsaf001/main.do?rcpNo={rc}", timeout=60000); await pg.wait_for_timeout(3000)
            toc = await pg.evaluate("[...document.querySelectorAll('#listTree a, .jstree-anchor')].map(a=>a.innerText.trim()).slice(0,60)")
            txt = ""
            for f in pg.frames:
                if "viewer.do" in f.url:
                    try: txt = await f.inner_text("body")
                    except Exception: pass
            docs[rc] = {"title": r, "toc": toc, "txt": txt[:15000]}
        res["docs"] = docs
        await b.close()
    json.dump(res, open(f"{OUT}/p30.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
