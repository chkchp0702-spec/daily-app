"""🧪 화면 자동 점검 (10/15 사용자: 「앱의 기본적인 것들은 네가 알아서 — 일일이 내가 다 탭해 봐야겠니?」)
   python3 tools/ui_audit.py home,market,sector,prob,port,score,whale,cup,gap,screen,feed
   market-strategy-report 는 ../market-strategy-report 에 clone 해 두면 그 자료를 씀. 결과 /tmp/ui_audit.json
   모든 탭: 화면 안 버튼을 하나씩 눌러 ① 누른 버튼이 화면에서 150px 넘게 튀는지 ② 화면 맨 위/맨 아래로 날아가는지 ③ JS 오류를 모은다"""
import asyncio, os, re, sys, json
from playwright.async_api import async_playwright
APP=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); MSR=os.path.join(os.path.dirname(APP), "market-strategy-report")
TABS=sys.argv[1].split(",")
SEL="#main button, #main .fold, #main summary, #main [data-pf], #main [data-m], #main [data-f], #main [data-win], #main [data-bg], #main [data-cm], #main .chip[data-k]"
JS_LIST="""(sel)=>{var a=[].slice.call(document.querySelectorAll(sel)).filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.closest('a[href^=http]')&&!/공유|복사|📤|PDF|크게 보기|새 창/.test(e.innerText||'');});
  a.forEach(function(e,i){e.setAttribute('data-au',i)}); return a.length;}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        out={}
        for tab in TABS:
            ctx=await b.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
            pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)[:160]))
            async def route(r):
                u=r.request.url
                for repo,root in (("market-strategy-report",MSR),("daily-app",APP)):
                    m=re.search(repo+r"/(?:main|refs/heads/main)/(.+?)(\?|$)",u)
                    if m:
                        f=os.path.join(root,m.group(1)); return await (r.fulfill(path=f) if os.path.isfile(f) else r.fulfill(status=404,body=""))
                m=re.search(r"//app/(.*?)(\?|#|$)",u)
                if m:
                    f=os.path.join(APP,m.group(1) or "index.html"); return await (r.fulfill(path=f) if os.path.isfile(f) else r.fulfill(status=404,body=""))
                return await r.fulfill(status=404,body="")
            await ctx.route("**/*",route)
            await pg.goto("http://app/index.html#"+tab); await pg.wait_for_timeout(3500)
            n=await pg.evaluate(JS_LIST, SEL); bad=[]
            for i in range(min(n,140)):
                h0=await pg.evaluate("location.hash")
                info=await pg.evaluate(f"""(()=>{{var e=document.querySelector('[data-au="{i}"]'); if(!e||!e.isConnected) return null; e.scrollIntoView({{block:'center'}}); var r=e.getBoundingClientRect(); return [Math.round(r.top),(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,22).replace(/\\s+/g,' ')]}})()""")
                if not info: continue
                await pg.wait_for_timeout(120)
                info=await pg.evaluate(f"""(()=>{{var e=document.querySelector('[data-au="{i}"]'); var r=e.getBoundingClientRect(); return [Math.round(r.top),((e.innerText||'').trim().slice(0,22).replace(/\\s+/g,' '))||e.outerHTML.slice(0,140)]}})()""")
                jumpby=await pg.evaluate(f"""(()=>{{var e=document.querySelector('[data-au="{i}"]'); return !!(e&&e.closest('[data-j]'))}})()""")   # 10/20 「숫자 누르면 그 종목으로」(ux1015c sigJump) — 옮겨 가는 게 정답
                try:
                    await pg.evaluate(f"""document.querySelector('[data-au="{i}"]').click()""")
                except Exception as ex:
                    continue
                await pg.wait_for_timeout(700)
                h1=await pg.evaluate("location.hash")
                if jumpby:
                    await pg.goto("http://app/index.html#"+tab); await pg.wait_for_timeout(2500); await pg.evaluate(JS_LIST, SEL); continue
                if h1!=h0:      # 다른 화면으로 가는 버튼 — 되돌리고 계속
                    await pg.goto("http://app/index.html#"+tab); await pg.wait_for_timeout(2500); await pg.evaluate(JS_LIST, SEL); continue
                aft=await pg.evaluate(f"""(()=>{{var e=document.querySelector('[data-au="{i}"]'); var H=document.documentElement.scrollHeight, y=scrollY; if(!e||!e.isConnected) return [null,y,H]; var r=e.getBoundingClientRect(); return [Math.round(r.top),y,H]}})()""")
                if aft[0] is None:
                    # 다시 그려져 버튼이 바뀜 — 같은 글자의 버튼을 찾아 위치 비교
                    aft2=await pg.evaluate("""(t)=>{var c=[].slice.call(document.querySelectorAll('#main button,#main [data-m],#main [data-pf],#main .fold')).filter(function(e){return (e.innerText||'').trim().slice(0,22).replace(/\\s+/g,' ')===t}); if(!c.length) return null; var best=c.map(function(e){return Math.round(e.getBoundingClientRect().top)}); return best}""", info[1])
                    if aft2 and min(abs(x-info[0]) for x in aft2) > 150:
                        bad.append({"btn":info[1],"before":info[0],"after":aft2[:3],"note":"다시 그려진 뒤 위치"})
                    await pg.evaluate(JS_LIST, SEL)
                elif abs(aft[0]-info[0])>150:
                    bad.append({"btn":info[1],"before":info[0],"after":aft[0],"scrollY":aft[1]})
            # 10/16 사용자 「저 숫자들 안 겹치게 해」 — 글이 화면 밖으로 나가거나 이름이 오른쪽 숫자와 겹치는지
            ovf=await pg.evaluate("""(()=>{var W=document.documentElement.clientWidth,b=[];
              // 10/31: 세로 막대(.vc) 날짜·값 글자는 칸 가운데에 걸쳐 놓는 것(viz.cols 가 10/31부터 막대 많으면 k칸마다만 글자 → 서로 안 겹침)
              // 10/31: 화면 안에서 꾸밈(aria-hidden — 🏠 날씨판 조이 머리 위 ⛈ 소품 right −10px, 일부러 삐져나오게)이 칸 밖으로 나온 건 글자 넘침 아님
              // 10/24: 넘침의 원인이 🧒 조이 단추(.gd-b·.gd-i 의 보이지 않는 누르는 칸 :after −12px)·화면 끝까지 펼친 띠(.po-stk)나 옆으로 미는 칩 줄(.fold-jump 등 overflow-x:auto)뿐이고 화면 안이면 정상 — 글자 넘침만 센다
              if(!document.getElementById('au-st')){var st=document.createElement('style');st.id='au-st';st.textContent='.au-noaf .gd-b:after,.au-noaf .gd-i:after{display:none!important}';document.head.appendChild(st);}
              function onlyOk(el,r){if(r.right>W+1)return false;el.classList.add('au-noaf');var sw=el.scrollWidth;el.classList.remove('au-noaf');if(sw<=el.clientWidth+2)return true;var R=r.right-(parseFloat(getComputedStyle(el).paddingRight)||0)+2,c=[].filter.call(el.querySelectorAll('*'),function(d){return d.getBoundingClientRect().right>R;});
                if(!c.length)return false;return c.every(function(d){if(d.closest('.gd-b')||d.closest('[aria-hidden="true"]')||d.matches('.vc-x,.vc-n'))return true;var dr=d.getBoundingClientRect();if(dr.left<=1&&dr.right<=W+1&&dr.right>=W-1)return true;for(var q=d;q&&q!==el;q=q.parentElement){var ox=getComputedStyle(q).overflowX,qr=q.getBoundingClientRect();if(ox!=='visible'||(qr.left<=1&&qr.right>=W-1&&qr.right<=W+1))return true;}return false;});}document.querySelectorAll('#main *').forEach(function(el){var r=el.getBoundingClientRect();if(!r.width||el.closest('.seg2,.pd-cfw,.tabs,.dates,[style*="overflow"]'))return;
              for(var q=el.parentElement;q&&q.id!=='main';q=q.parentElement){var ox=getComputedStyle(q).overflowX;if(ox==='auto'||ox==='scroll')return;}
              // 10/27: 화면 안에서 잘라 숨기는 칸(overflow hidden) 속 글자 없는 꾸밈(🏠 맑은 날 해 .tz-sun, aria-hidden)은 「밖」 아님 — 글자 있는 건(잘려 안 보이는 ▲ 등) 그대로 셈
              if(r.right>W+1&&!el.children.length&&!((el.getAttribute('aria-hidden')==='true'||!(el.innerText||'').trim())&&(function(){for(var q=el.parentElement;q&&q.id!=='main';q=q.parentElement){var ox=getComputedStyle(q).overflowX;if((ox==='hidden'||ox==='clip')&&q.getBoundingClientRect().right<=W+1)return true;}return false;})()))b.push('밖 '+(el.innerText||'').slice(0,24));
              var cs=getComputedStyle(el);if(cs.overflowX==='visible'&&cs.textOverflow!=='ellipsis'&&el.scrollWidth>el.clientWidth+2&&el.clientWidth>0&&(el.innerText||'').trim()&&!onlyOk(el,r))b.push('넘침 '+el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/ +/).join('.'):'')+' '+(el.innerText||'').slice(0,24)+' (+'+(el.scrollWidth-el.clientWidth)+'px)');});return b.slice(0,8);})()""")
            out[tab]={"buttons":n,"jumps":bad,"errors":sorted(set(errs))[:8],"overflow":ovf}
            print(tab, n, "jumps", len(bad), "errors", len(set(errs)), "overflow", len(ovf), flush=True)
            for o in ovf: print("   ", o)
            for x in bad[:12]: print("   ", x)
            for e in sorted(set(errs))[:5]: print("   ERR", e)
            await ctx.close()
        json.dump(out,open("/tmp/ui_audit.json","w"),ensure_ascii=False,indent=1)
        await b.close()
asyncio.run(main())
