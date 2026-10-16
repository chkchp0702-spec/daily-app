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


async def lists():
    from playwright.async_api import async_playwright
    out = {}
    start = (datetime.date.today() - datetime.timedelta(days=730)).strftime("%Y%m%d"); end = datetime.date.today().strftime("%Y%m%d")
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(B + "/dsab007/main.do", timeout=90000); await pg.wait_for_timeout(2000)
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


def detail(rc):
    t = S.get(f"{B}/dsaf001/main.do?rcpNo={rc}", timeout=40).text
    m = re.search(r"viewDoc\('(\d+)',\s*'(\d+)',\s*'(\d+)',\s*'(\d+)',\s*'(\d+)',\s*'([^']+)'", t)
    if not m: return None
    v = S.get(f"{B}/report/viewer.do?rcpNo={m.group(1)}&dcmNo={m.group(2)}&eleId={m.group(3)}&offset={m.group(4)}&length={m.group(5)}&dtd={m.group(6)}", timeout=40)
    v.encoding = v.apparent_encoding or "utf-8"
    x = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", v.text)))
    g = lambda p: (re.search(p, x) or [None, None])[1]
    num = lambda s: float(s.replace(",", "")) if s else None
    nw = re.search(r"이번 보고서\s*([\d,]+)\s*([\d.]+)", x); pv = re.search(r"직전 보고서\s*([\d,\-]+)\s*([\d.\-]+)", x)
    return {"co": (g(r"발행회사명\s*(.+?)\s*발행회사와의") or "").strip(), "d": g(r"보고서작성기준일\s*:\s*(\d{4}년 \d{2}월 \d{2}일)"),
            "r": num(nw.group(2)) if nw else None, "r0": num(pv.group(2)) if pv and pv.group(2) not in ("-",) else None,
            "sh": num(nw.group(1)) if nw else None, "why": (g(r"보고사유\s*(.+?)\s*보유목적") or "").strip()[:60], "purp": (g(r"보유목적\s*(\S+)") or "").strip()}


def main():
    try: old = json.load(open(OUT, encoding="utf-8"))
    except Exception: old = {}
    cache = {}
    for m, L in (old.get("mg") or {}).items():
        for it in L: cache[it["rc"]] = it
    L = asyncio.run(lists())
    res, err = {}, []
    for nm, rows in L.items():
        if rows is None: res[nm] = (old.get("mg") or {}).get(nm, []); err.append(nm); continue
        items = []
        for r in rows[:100]:
            rc = r[-1]; mk = "유" if r[1].startswith("유") else "코" if r[1].startswith("코") else "넥" if r[1].startswith("넥") else ""
            if rc in cache: items.append(cache[rc]); continue
            try:
                d = detail(rc) or {}
            except Exception as e:
                d = {}; print("✗", rc, e)
            it = {"rc": rc, "nm": re.sub(r"^(유|코|넥|기)\s+", "", r[1]).replace(" IR", "").strip(), "mk": mk, "date": r[4].replace(".", "-"), "title": r[2]}
            it.update({k: v for k, v in d.items() if v not in (None, "")})
            items.append(it); time.sleep(0.4)
        res[nm] = items
    json.dump({"updated": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y-%m-%d %H:%M"), "src": "금융감독원 DART 주식등의 대량보유상황보고서(최종보고서)", "mg": res, "errors": err},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("done", sum(len(v) for v in res.values()))


if __name__ == "__main__":
    main()
