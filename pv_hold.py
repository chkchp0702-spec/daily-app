"""🧺 사모펀드 「구성 엿보기」 — 운용사가 금감원 DART 에 낸 「주식등의 대량보유상황보고서」(5% 룰)로 운용사 단위 보유 종목
   (10/16 사용자: 「사모펀드들 안에 구성종목 어캐든 찾아서 다 집어넣어」)
   사모펀드는 펀드별 보유 종목을 공개하지 않음 → 공개된 것 중 가장 가까운 것 = 그 운용사(모든 펀드·일임 합계)가 5% 넘게 가진 상장사.
   ① 목록: DART 상세검색(보고자=운용사, 공시유형 D001, 최종보고서만) — 화면 스크립트가 만드는 요청이라 headless 브라우저로
   ② 보고서마다 요약정보(보유비율 직전→이번, 기준일, 보유목적) — viewer.do 를 requests 로, 이미 받은 접수번호는 다시 안 받음
   결과 → archive/x/pv_hold.json  (공개 자료만 · 사내 라인업 내용은 없음)
"""
import asyncio, datetime, html, json, os, re, time
import requests

OUT = os.path.join("archive", "x", "pv_hold.json")
MG = ["타임폴리오자산운용", "머스트자산운용", "브이아이피자산운용", "디에스자산운용", "라이프자산운용", "타이거자산운용투자일임", "케이씨지아이자산운용",
      "쿼드자산운용", "안다자산운용", "라쿤자산운용", "르네상스자산운용", "밸류파트너스자산운용", "블리츠자산운용", "빌리언폴드자산운용", "씨앗자산운용",
      "마이다스에셋자산운용", "보고자산운용", "유경피에스지자산운용", "지안자산운용", "토터스자산운용", "한앤파트너스자산운용", "인사이트자산운용",
      "더제이자산운용", "블래쉬자산운용", "비전자산운용", "에이아이파트너스자산운용", "지브이에이자산운용", "알펜루트자산운용", "파인밸류자산운용",
      "에이원자산운용", "수성자산운용", "포커스자산운용", "오라이언자산운용", "라이노스자산운용", "브이엠자산운용", "아우름자산운용", "인벡스자산운용",
      "웰컴자산운용", "유리자산운용", "태생자산운용", "제이비자산운용", "트러스톤자산운용"]
B = "https://dart.fss.or.kr"
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36"})


class DartDown(Exception):
    pass


async def lists():
    from playwright.async_api import async_playwright
    out = {}
    start = (datetime.date.today() - datetime.timedelta(days=730)).strftime("%Y%m%d"); end = datetime.date.today().strftime("%Y%m%d")
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        for k in range(4):   # 10/22 자가 업그레이드: DART 첫 화면 90초 멈춤으로 하루 실패 → 다시 (load 대신 domcontentloaded)
            try:             # 10/29: 3번 다 같은 창에서 멈춤 → 매번 새 창(쿠키·연결 새로)으로 · 쉬는 시간 20→60초
                await pg.goto(B + "/dsab007/main.do", timeout=90000, wait_until="domcontentloaded"); await pg.wait_for_function("!!document.searchForm", timeout=30000); break
            except Exception as e:
                print(f"DART 첫 화면 {k+1}/4 실패:", str(e)[:80])
                if k == 3: raise DartDown(str(e)[:120])
                try: await pg.close()
                except Exception: pass
                await asyncio.sleep(60); pg = await (await b.new_context()).new_page()
        await pg.wait_for_timeout(2000)
        for nm in MG:
            try:
                await pg.evaluate("""(a)=>{var f=document.searchForm; f.textPresenterNm.value=a[0]; f.startDate.value=a[1]; f.endDate.value=a[2];
                    if (f.maxResults) f.maxResults.value='100'; var mr=document.getElementById('maxResultsCb'); if(mr) mr.value='100';
                    document.querySelectorAll('input[name=publicType]').forEach(x=>x.checked=(x.value=='D001')); var o=document.getElementById('option'); if(o) o.value='report';
                    document.getElementById('listContents') && (document.getElementById('listContents').innerHTML='');}""", [nm, start, end])
                await pg.evaluate("search(0)")
                for _ in range(30):
                    await pg.wait_for_timeout(500)
                    if await pg.evaluate("!!document.querySelector('#listContents table') || /없습니다/.test((document.getElementById('listContents')||{}).innerText||'')"): break
                rows = await pg.evaluate("""()=>[...document.querySelectorAll('#listContents table tbody tr')].map(tr=>{var t=[...tr.querySelectorAll('td')].map(td=>td.innerText.trim());
                    var a=tr.querySelector('a[href*=rcpNo]')||tr.querySelector('a[onclick*=openReportViewer]'); var m=a?((a.href||'')+(a.getAttribute('onclick')||'')).match(/(\\d{14})/):null; return t.concat([m?m[1]:''])})""")
                out[nm] = [r for r in rows if len(r) >= 6 and r[-1]]
                print(nm, len(out[nm]))
            except Exception as e:
                print("✗", nm, e); out[nm] = None
        await b.close()
    return out


def parse(x):
    x = re.sub(r"\s+", " ", x)
    g = lambda p: (re.search(p, x) or [None, None])[1]
    num = lambda v: float(v.replace(",", "")) if v and re.match(r"^[\d,.]+$", v) else None
    nw = re.search(r"이번 보고서\s*([\d,]+)\s*([\d.]+)", x); pv = re.search(r"직전 보고서\s*([\d,\-]+)\s*([\d.\-]+)", x)
    return {"co": (g(r"발행회사명\s*(.+?)\s*발행회사와의") or "").strip(), "d": g(r"보고서작성기준일\s*:\s*(\d{4}년 \d{2}월 \d{2}일)"),
            "r": num(nw.group(2)) if nw else None, "r0": num(pv.group(2)) if pv else None, "sh": num(nw.group(1)) if nw else None,
            "why": (g(r"보고사유\s*(.+?)\s*보유목적") or "").strip()[:60], "purp": (g(r"보유목적\s*(\S+)") or "").strip()}


async def details(rcs):
    """보고서 요약정보 — 화면 iframe(viewer.do) 글자를 읽음"""
    from playwright.async_api import async_playwright
    out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        for k, rc in enumerate(rcs):
            try:
                await pg.goto(f"{B}/dsaf001/main.do?rcpNo={rc}", timeout=60000); await pg.wait_for_timeout(1200)
                txt = ""
                for f in pg.frames:
                    if "viewer.do" in f.url:
                        try: txt = await f.inner_text("body")
                        except Exception: pass
                out[rc] = parse(txt) if txt else {}
            except Exception as e:
                out[rc] = {}; print("✗", rc, str(e)[:80])
            if k % 50 == 0: print("detail", k, len(rcs))
        await b.close()
    return out


def price(res):
    """🧮 10/16 사용자 「구성종목 비율도!」 — 보유 주식 수 × 최근 종가 = 평가금액 → 운용사가 5% 넘게 가진 종목들 안에서의 비중(%)
       종목코드: 한국거래소 KIND 상장회사 목록(회사명 → 코드) · 종가: 야후(.KS/.KQ)"""
    try:
        t = S.get("https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13", timeout=60)
        t.encoding = "euc-kr"
        code = {}
        for tr in re.findall(r"<tr>(.*?)</tr>", t.text, re.S):
            td = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip() for x in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
            if len(td) >= 3 and re.match(r"^[0-9A-Z]{6}$", td[2]): code[re.sub(r"\s+", "", td[0])] = (td[2], td[1])
        print("kind", len(code))
    except Exception as e:
        print("✗ kind", e); return
    want = {}
    for L in res.values():
        for it in L:
            c = code.get(re.sub(r"\s+", "", it["nm"]).replace("(주)", ""))
            if c:
                it["cd"] = c[0]; want[c[0]] = c[0] + (".KQ" if "코스닥" in c[1] or it.get("mk") == "코" else ".KS")
    px = {}
    try:
        import yfinance as yf
        tk = sorted(set(want.values()))
        h = yf.download(tk, period="13mo", interval="1d", progress=False, auto_adjust=True, group_by="column", threads=True)["Close"]
        global CLOSE
        CLOSE = (h, want)
        for k6, t_ in want.items():
            try:
                col = h[t_] if hasattr(h, "columns") and t_ in h.columns else h
                v = col.dropna()
                if len(v): px[k6] = float(v.iloc[-1])
            except Exception:
                pass
    except Exception as e:
        print("✗ 가격", e)
    for L in res.values():
        tot = 0
        for it in L:
            if it.get("cd") in px and it.get("sh") and (it.get("r") or 0) >= 5:
                it["px"] = round(px[it["cd"]], 2); it["val"] = round(it["sh"] * px[it["cd"]] / 1e8, 1); tot += it["val"]
            else:
                it.pop("val", None)
        for it in L:
            if it.get("val") and tot: it["w"] = round(it["val"] / tot * 100, 1)
    print("가격", len(px))
    basket(res)


CLOSE = None


def basket(res):
    """🧮 운용사 바스켓 지수 — 5% 넘게 가진 종목을 지금 평가금액 비중으로 묶은 하루 수익률(수정주가) 누적.
       금투협에 기준가가 없는 사모펀드의 「추정」 후보 중 하나 (앱이 과거 성적과 맞춰 보고 가장 잘 맞는 후보를 고름)"""
    if CLOSE is None: return
    h, want = CLOSE
    out = {}
    for nm, L in res.items():
        ws = [(want[it["cd"]], it["val"]) for it in L if it.get("val") and it.get("cd") in want]
        ws = [(t, v) for t, v in ws if hasattr(h, "columns") and t in h.columns]
        if len(ws) < 2: continue
        r = h[[t for t, _ in ws]].pct_change()
        w = {t: v for t, v in ws}
        idx, v, ds = 1.0, [], []
        for d, row in r.iterrows():
            ok = [(t, row[t]) for t in w if row[t] == row[t]]
            if not ok: continue
            tw = sum(w[t] for t, _ in ok)
            idx *= 1 + sum(w[t] * x for t, x in ok) / tw
            ds.append(d.strftime("%Y-%m-%d")); v.append(round(idx, 5))
        out[nm] = {"d": ds, "v": v, "n": len(ws)}
    json.dump(out, open(os.path.join("archive", "x", "pv_basket.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("바스켓", len(out))


def main():
    try: old = json.load(open(OUT, encoding="utf-8"))
    except Exception: old = {}
    cache = {}
    for m, L in (old.get("mg") or {}).items():
        for it in L: cache[it["rc"]] = it
    try:
        L = asyncio.run(lists())
    except DartDown as e:
        # 10/29 자가 업그레이드: DART 사이트가 통째로 안 열리는 날(10/22·10/29)은 전 자료를 그대로 두고 성공으로 끝냄.
        # 단 마지막 갱신이 3일(주말 포함 72시간)보다 오래됐으면 실패로 끝내 🩺 건강검진이 잡게 함.
        KST = datetime.timezone(datetime.timedelta(hours=9))
        try: age = (datetime.datetime.now(KST) - datetime.datetime.strptime(old.get("updated", "")[:16], "%Y-%m-%d %H:%M").replace(tzinfo=KST)).total_seconds() / 3600
        except Exception: age = 999
        print(f"DART 안 열림 — 마지막 자료 {age:.0f}시간 전:", e)
        if age > 72: raise
        print("전 자료 그대로 둠 (다음 날 다시)"); return
    res, err, need = {}, [], []
    for nm, rows in L.items():
        if rows is None: continue
        seen = set()
        for r in rows[:100]:
            co = re.sub(r"^(유|코|넥|기)\s+", "", r[1]).replace(" IR", "").strip()
            if co in seen: continue
            seen.add(co)
            if r[-1] not in cache or cache[r[-1]].get("sh") is None: need.append(r[-1])
    D = asyncio.run(details(need[:600])) if need else {}
    for nm, rows in L.items():
        if rows is None: res[nm] = (old.get("mg") or {}).get(nm, []); err.append(nm); continue
        items, seen = [], set()
        for r in rows[:100]:
            rc = r[-1]; co = re.sub(r"^(유|코|넥|기)\s+", "", r[1]).replace(" IR", "").strip()
            if co in seen: continue          # 같은 회사는 가장 최근 보고서 하나만
            seen.add(co)
            mk = r[1][:1] if r[1][:1] in ("유", "코", "넥") else ""
            it = dict(cache.get(rc) or {})
            it.update({"rc": rc, "nm": co, "mk": mk, "date": r[4].replace(".", "-"), "title": r[2]})
            it.update({k: v for k, v in (D.get(rc) or {}).items() if v not in (None, "")})
            items.append(it)
        res[nm] = items
    price(res)
    json.dump({"updated": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y-%m-%d %H:%M"), "src": "금융감독원 DART 주식등의 대량보유상황보고서(최종보고서)", "mg": res, "errors": err},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("done", sum(len(v) for v in res.values()))


if __name__ == "__main__":
    main()
