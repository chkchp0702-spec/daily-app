import asyncio, json, os, re, requests
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
from playwright.async_api import async_playwright
B = "https://dis.kofia.or.kr/websquare/index.jsp?w2xPath="
SALE = "/wq/fundann/DISFundSaleStdPrcRate.xml&divisionId=MDIS01013007000000&serviceId=SDIS01013007000"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(locale="ko-KR", viewport={"width": 1400, "height": 2200})
        pg = await ctx.new_page(); xhr = []
        async def onresp(r):
            try:
                if r.request.method == "POST" and "XMLSERVICES" in r.url:
                    t = ""
                    try: t = (await r.text())[:3000]
                    except Exception: pass
                    xhr.append({"post": (r.request.post_data or "")[:3000], "status": r.status, "body": t})
            except Exception: pass
        pg.on("response", lambda r: asyncio.ensure_future(onresp(r)))
        await pg.goto(B + SALE, wait_until="networkidle", timeout=90000); await pg.wait_for_timeout(6000)
        info = {"opts": await pg.evaluate("(()=>{var s=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>/미래에셋증권/.test(o.text)));return s?[s.id,[...s.options].filter(o=>/미래에셋/.test(o.text)).map(o=>o.text+'='+o.value)]:null})()")}
        n0 = len(xhr)
        info["set"] = await pg.evaluate("(()=>{ try{ var s=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>/미래에셋증권/.test(o.text))); var o=[...s.options].find(o=>/미래에셋증권/.test(o.text)); compCd.setValue(o.value); comdity.setValue('2'); goSearch(); return 'ok '+o.value; }catch(e){ return 'err '+e; } })()")
        await pg.wait_for_timeout(12000)
        info["text"] = await pg.evaluate("(()=>{var t=document.body.innerText;var i=t.indexOf('검색결과');return t.slice(i,i+3000)})()")
        info["xhr"] = xhr[n0:]
        json.dump(info, open(f"{OUT}/p13.json", "w"), ensure_ascii=False, indent=1)
asyncio.run(main())
# NAV 과거 시점
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128", "Content-Type": "text/xml", "Accept": "text/xml", "Referer": "https://dis.kofia.or.kr/websquare/index.jsp"})
S.get("https://dis.kofia.or.kr/", timeout=30)
for d in ["20251015", "20260415", "20260715", "20260915"]:
    body = f'<?xml version="1.0" encoding="utf-8"?><message><proframeHeader><pfmAppName>FS-DIS2</pfmAppName><pfmSvcName>DISFundStdPrcRateSO</pfmSvcName><pfmFnName>select</pfmFnName></proframeHeader><systemHeader></systemHeader><DISCondFuncDTO><tmpV30>{d}</tmpV30><tmpV3></tmpV3><tmpV4></tmpV4><tmpV5></tmpV5><tmpV7>2</tmpV7><tmpV11></tmpV11><tmpV12></tmpV12><tmpV50></tmpV50><tmpV51></tmpV51></DISCondFuncDTO></message>'
    r = S.post("https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/", data=body.encode(), timeout=180)
    open(f"{OUT}/pv_{d}.xml", "w").write(r.text); print(d, len(r.text))
