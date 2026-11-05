# 🩹 11/05 넘침 점검 — 모든 탭·접힌 카드·더 보기 화면을 펼쳐 카드/화면 오른쪽 밖으로 나간 칸을 찾음. 사용: FSV=1.25 python3 tools/overflow_audit.py 320  (http://localhost:8765 에 앱을 띄워 두고)
import asyncio, os, re, sys, json
from playwright.async_api import async_playwright
MSR="/home/claude/chkchp0702-spec/market-strategy-report/"
async def route(r):
    u=r.request.url; m=re.search(r"market-strategy-report/main/(.+?)(\?|$)",u)
    if m and os.path.exists(MSR+m.group(1)): await r.fulfill(path=MSR+m.group(1), content_type="application/json"); return
    await r.continue_()
TABS = sys.argv[2].split(",") if len(sys.argv)>2 else ["home","market","sector","prob","feed","port","score","whale","cup","gap","screen","sigmore","bond","fund","els","prop","luck","saju","tarot","lotto"]
W = int(sys.argv[1]) if len(sys.argv)>1 else 320
FSV = os.environ.get('FSV','1.25')
FIND = r"""
(root) => {
  const vw = document.documentElement.clientWidth, out = [];
  const okScroll = el => { for (let p = el; p && p !== document.body; p = p.parentElement){ const cs = getComputedStyle(p); if (/(auto|scroll)/.test(cs.overflowX) && p.scrollWidth > p.clientWidth + 2) return true; } return false; };
  const path = el => { const a=[]; for (let p=el; p && p.id!=='main' && p.id!=='sheet' && a.length<5; p=p.parentElement){ a.unshift(p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(p.className&&typeof p.className==='string'?'.'+p.className.trim().split(/\s+/).slice(0,2).join('.'):'')); } return a.join(' > '); };
  root.querySelectorAll('*').forEach(el => {
    if (!el.offsetParent && getComputedStyle(el).position!=='fixed') return;
    if (el.closest('svg,canvas,.ppx,.pp-pv,#ppx,.h2-tmw,.h2-dc,.sv-bars,.uxob-tip')) return;
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return;
    const cd = el.closest('.card'); const cr = cd && cd !== el ? cd.getBoundingClientRect() : null;
    if (cr && r.right > cr.right + 1 && r.left < cr.right && !okScroll(el) && !(el.parentElement && el.parentElement.getBoundingClientRect().right > cr.right + 1 && el.parentElement !== cd)){
      out.push({k:'clip', px: Math.round(r.right - cr.right), p: path(el), t: (el.innerText||'').replace(/\s+/g,' ').slice(0,40)}); return;
    }
    if (r.right > vw + 1 && r.left < vw && !okScroll(el)){
      // only report the outermost offender
      const p = el.parentElement, pr = p && p.getBoundingClientRect();
      if (pr && pr.right > vw + 1 && !okScroll(p) && p !== root) return;
      out.push({k:'over', px: Math.round(r.right - vw), p: path(el), t: (el.innerText||'').replace(/\s+/g,' ').slice(0,40)});
    }
  });
  return out;
}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chromium", args=["--disable-dev-shm-usage"])
        ctx = await b.new_context(viewport={"width":W,"height":740}, device_scale_factor=1)
        pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
        await pg.add_init_script(("var FSV="+FSV+";") + "if(!sessionStorage.x){localStorage.clear();localStorage.setItem('wow_ob','1');localStorage.setItem('ux_ob3','1');localStorage.setItem('ui',JSON.stringify({fs:FSV}));sessionStorage.x=1}")
        await pg.route("**/raw.githubusercontent.com/**", route)
        await pg.goto("http://localhost:8765/#home"); await pg.wait_for_timeout(7000)
        allr = {}
        for tab in TABS:
            await pg.evaluate(f"go('{tab}')"); await pg.wait_for_timeout(4500)
            # expand all folded
            for _ in range(2):
                await pg.evaluate("document.querySelectorAll('.cz.cz-on').forEach(c=>c.classList.remove('cz-on')); document.querySelectorAll('#main details').forEach(d=>d.open=true); document.querySelectorAll('.xs-clamp').forEach(c=>c.classList.remove('xs-clamp')); document.querySelectorAll('.clp').forEach(c=>{c.classList.remove('clp');c.style.maxHeight=''}); document.querySelectorAll('#main .xs-hid').forEach(c=>c.classList.remove('xs-hid'))")
                await pg.wait_for_timeout(700)
            await pg.evaluate("window.__heal && __heal()"); await pg.wait_for_timeout(300)
            res = await pg.evaluate(FIND, await pg.query_selector("#main"))
            # sheets from 더 보기
            n = await pg.evaluate("document.querySelectorAll('#main .xs-more [data-xs], #main .xs-more li, #main .xs-more .xs-i, #main .xs-more button').length")
            items = await pg.query_selector_all("#main .xs-more .xs-list > *")
            for i in range(len(items)):
                its = await pg.query_selector_all("#main .xs-more .xs-list > *")
                if i >= len(its): break
                try:
                    await its[i].click(timeout=2000); await pg.wait_for_timeout(1500)
                    sh = await pg.query_selector("#sheet")
                    if sh:
                        await pg.evaluate("document.querySelectorAll('#sheet details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(300); await pg.evaluate("window.__heal && __heal()"); await pg.wait_for_timeout(200)
                        r2 = await pg.evaluate(FIND, sh)
                        for x in r2: x['sheet']=i
                        res += r2
                        await pg.evaluate("window.closeSheet && closeSheet()"); await pg.wait_for_timeout(500)
                except Exception as e:
                    pass
            allr[tab]=res
            print(f"== {tab}: {len(res)}", flush=True)
            for x in res[:40]: print("   ", x)
        print("ERR", errs[:5])
        json.dump(allr, open(f"audit{W}.json","w"), ensure_ascii=False)
        await b.close()
asyncio.run(main())
