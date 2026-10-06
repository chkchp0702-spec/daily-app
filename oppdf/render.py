"""
📄 종목리포트 PDF 미리 만들기 — 앱 화면 그대로 (크롬 page.pdf)
  앱(index.html)을 서버의 크롬에서 열어 종목리포트를 띄운 뒤, 앱이 완성한 리포트 화면(iframe)을
  휴대폰 폭(390px) 한 장짜리 긴 PDF로 저장한다. 그림·차트·사진이 앱과 똑같이 들어간다.

  python oppdf/render.py --opdata <opdata 체크아웃> --out <폴더> --syms NVDA 005930.KS ...
  python oppdf/render.py --opdata ... --out ... --list syms.txt [--workers 3] [--limit 600]
"""
import argparse, asyncio, functools, http.server, json, os, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OPD_PREFIX = "raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"


def serve(port):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k):
            pass
    h = functools.partial(Q, directory=ROOT)
    s = http.server.ThreadingHTTPServer(("127.0.0.1", port), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def ctype(p):
    return "text/html; charset=utf-8" if p.endswith(".html") else "text/css" if p.endswith(".css") else "application/json"


async def main(a):
    from playwright.async_api import async_playwright
    syms = list(a.syms or [])
    if a.list:
        syms += [l.strip() for l in open(a.list, encoding="utf-8") if l.strip()]
    if a.limit:
        syms = syms[:a.limit]
    os.makedirs(a.out, exist_ok=True)
    port = a.port
    serve(port)
    done, fail = {}, []

    async def route(rt):
        u = rt.request.url
        if OPD_PREFIX in u:
            p = u.split(OPD_PREFIX, 1)[1].split("?")[0]
            f = os.path.join(a.opdata, p)
            if os.path.isfile(f):
                return await rt.fulfill(status=200, body=open(f, "rb").read(), headers={"content-type": ctype(p), "access-control-allow-origin": "*"})
            return await rt.fulfill(status=404, body="")
        if "ntfy.sh" in u or "google-analytics" in u:
            return await rt.abort()
        return await rt.continue_()

    async with async_playwright() as pw:
        br = await pw.chromium.launch()

        async def worker(q, wid):
            ctx = await br.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
            await ctx.add_init_script("try{localStorage.setItem('userName','pdf-bot')}catch(e){}; window.prompt=()=>'pdf-bot';")
            await ctx.route("**/*", route)
            app = await ctx.new_page()
            await app.goto(f"http://127.0.0.1:{port}/index.html#onepager", wait_until="domcontentloaded")
            await app.wait_for_function("typeof opShow === 'function' && typeof opLoadIdx === 'function'", timeout=60000)
            await app.evaluate("() => opLoadIdx()")
            out = await ctx.new_page()
            await out.emulate_media(media="screen")          # 인쇄용 CSS(A4) 말고 화면 그대로
            while q:
                sym = q.pop(0)
                t0 = time.time()
                try:
                    await app.evaluate("() => { var b = document.getElementById('opbox'); if (b) b.innerHTML = ''; }")
                    ok = await app.evaluate("(s) => { var r = (window.OPIDX || []).filter(function(x){ return x.sym === s; })[0]; if (!r || !r.built) return false; opShow(s, true); return true; }", sym)
                    if not ok:
                        fail.append([sym, "리포트 없음"]); continue
                    await app.wait_for_selector("#opbox .pdfbar", timeout=45000)
                    html = await app.evaluate("() => { var fr = document.querySelector('#opbox iframe'); return fr.contentDocument.documentElement.outerHTML; }")
                    html = html.replace("<head>", '<head><meta name="viewport" content="width=390"><base href="https://chkchp0702-spec.github.io/daily-app/">', 1)
                    await out.set_content(html, wait_until="load", timeout=40000)
                    try:
                        await out.wait_for_load_state("networkidle", timeout=12000)
                    except Exception:
                        pass
                    # 늦게 오는 사진은 기다리되, 끝내 못 오면 빈 칸 대신 숨김
                    await out.evaluate("""async () => { const imgs=[...document.images]; await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload=i.onerror=r; setTimeout(r, 8000); })));
                        imgs.forEach(i => { if (!i.naturalWidth) i.style.visibility='hidden'; }); }""")
                    h = await out.evaluate("() => Math.ceil(document.documentElement.scrollHeight)")
                    await out.add_style_tag(content="@page{size:390px %dpx;margin:0} html,body{margin:0}" % (h + 2))
                    fn = os.path.join(a.out, a.fname(sym) + ".pdf")
                    await out.pdf(path=fn, width="390px", height=f"{h + 2}px", print_background=True,
                                  margin={"top": "0", "bottom": "0", "left": "0", "right": "0"}, page_ranges="1", prefer_css_page_size=True)
                    done[sym] = round(os.path.getsize(fn) / 1024)
                    if len(done) % 50 == 0:              # 시간 제한으로 끊겨도 만든 것까지는 올라가게 중간 저장
                        json.dump({"done": done, "fail": fail}, open(os.path.join(a.out, "_result.json"), "w", encoding="utf-8"), ensure_ascii=False)
                    print(f"[{wid}] {sym} {done[sym]}KB {time.time()-t0:.1f}s", flush=True)
                except Exception as e:
                    fail.append([sym, str(e)[:120]])
                    print(f"[{wid}] {sym} 실패 {str(e)[:120]}", flush=True)
            await ctx.close()

        q = list(syms)
        await asyncio.gather(*[worker(q, i) for i in range(max(1, a.workers))])
        await br.close()
    json.dump({"done": done, "fail": fail}, open(os.path.join(a.out, "_result.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print(f"끝: {len(done)}개 성공 · {len(fail)}개 실패")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--opdata", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--syms", nargs="*")
    ap.add_argument("--list")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--port", type=int, default=8811)
    a = ap.parse_args()
    import re
    a.fname = lambda s: re.sub(r"[^A-Za-z0-9.-]", "_", s)   # 앱 opFile() 과 같은 규칙
    asyncio.run(main(a))
