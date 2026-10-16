"""🎯 ELS 타사 비교 — 10/16 사용자 「Els도 타사들꺼랑 비교해 보기 편하게 · Els 나올때마다 똑같이 계속 비교」
   모든 증권사가 ELS·ELB 를 공모할 때 금감원 DART 에 내는 「일괄신고추가서류(파생결합증권-주가연계증권 / 파생결합사채-주가연계파생결합사채)」에서
   회차마다 [모집 또는 매출의 개요]·[증권의 주요 권리내용]을 읽어 발행사·기초자산·연 수익률·최대손실·조기상환 배리어·KI·청약기간·만기를 뽑음.
   DART 검색·목차는 화면 스크립트라 headless 브라우저. 이미 읽은 회차(접수번호+순번)는 다시 안 읽음. → archive/x/els_all.json
"""
import asyncio, datetime, json, os, re

OUT = os.path.join("archive", "x", "els_all.json")
KINDS = ["일괄신고추가서류(파생결합증권-주가연계증권)", "일괄신고추가서류(파생결합사채-주가연계파생결합사채)"]
B = "https://dart.fss.or.kr"


def pct(s):
    try: return float(s)
    except Exception: return None


def parse(ov, rt):
    g = lambda p, t=ov: (re.search(p, t, re.S) or [None, None])[1]
    o = {}
    nm = g(r"종목명\s*[:：]?\s*(.+?)\]") or g(r"종목명\s+(.+?)\n")
    o["nm"] = re.sub(r"\s+", " ", (nm or "")).strip()[:80]
    o["risk"] = (re.search(r"\((\d등급[^)]*)\)", ov) or [None, None])[1]
    ua = g(r"\n기초자산\s+(.+?)\n(?:모\s*집\s*총\s*액|모집|매출)")
    o["ua"] = re.sub(r"\s+", " ", ua or "").strip()[:200]
    amt = g(r"모\s*집\s*총\s*액\s+([\d,]+)\s*원")
    o["amt"] = round(int(amt.replace(",", "")) / 1e8, 1) if amt else None
    d = re.findall(r"(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일", g(r"청약기간(.{0,120})") or "")
    if d: o["s"] = "%s-%02d-%02d" % (d[0][0], int(d[0][1]), int(d[0][2])); o["e"] = "%s-%02d-%02d" % (d[-1][0], int(d[-1][1]), int(d[-1][2]))
    m = re.findall(r"(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일", g(r"만\s*기\s*일[^\n]*\s*(.{0,40})") or "")
    if m: o["mat"] = "%s-%02d-%02d" % (m[0][0], int(m[0][1]), int(m[0][2]))
    # 권리내용: 연 수익률(최대), 최대손실, 배리어, KI
    yrs = [pct(x) for x in re.findall(r"연\s*([\d.]+)\s*%", rt)]
    yrs = [x for x in yrs if x is not None and 0 < x < 60]
    o["cpn"] = max(yrs) if yrs else None
    ml = g(r"최대손실액\s+(.+?)\n", rt) or ""
    o["nolos"] = bool(re.search(r"손실이 발생하지 않|원금.{0,6}(보장|지급)", ml))
    mlp = re.search(r"-\s*(\d{1,3}(?:\.\d+)?)\s*%", (g(r"최대손실액(.{0,300})", rt) or ""))
    o["loss"] = -pct(mlp.group(1)) if mlp else (0 if o["nolos"] else None)
    bars = [int(x) for x in re.findall(r"최초기준가격의?\s*\[?\s*(\d{2,3})\s*\]?\s*%\s*(?:보다 크거나 같|이상)", rt)]
    seq = []
    for x in bars:
        if not seq or seq[-1] != x: seq.append(x)
    o["bars"] = seq[:12]
    ki = re.search(r"최초기준가격의?\s*\[?\s*(\d{2,3})\s*\]?\s*%\s*(?:보다 작은|미만)[^\n]{0,80}(?:하락한 적|하락한계|한 번이라도|한번이라도)", rt) or \
         re.search(r"(?:하락한계가격|낙인|Knock-?In)[^\n]{0,60}?(\d{2,3})\s*%", rt)
    o["ki"] = int(ki.group(1)) if ki else None
    cyc = re.search(r"매\s*(\d{1,2})\s*개월", rt)
    o["cyc"] = int(cyc.group(1)) if cyc else None
    o["monthly"] = bool(re.search(r"월\s*수익|월지급|매월", rt))
    return o


async def main():
    from playwright.async_api import async_playwright
    try: old = json.load(open(OUT, encoding="utf-8"))
    except Exception: old = {}
    cache = {x["id"]: x for x in old.get("items", [])}
    today = datetime.date.today()
    st = (today - datetime.timedelta(days=12)).strftime("%Y%m%d"); en = today.strftime("%Y%m%d")
    items, err = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(B + "/dsab007/main.do", timeout=90000); await pg.wait_for_timeout(1500)
        rows = []
        for k in KINDS:
            for page in range(1, 6):
                await pg.evaluate("""(a)=>{var f=document.searchForm; f.startDate.value=a[0]; f.endDate.value=a[1]; f.reportName.value=a[2]; f.textPresenterNm.value=''; f.textCrpNm.value='';
                    var mr=document.getElementById('maxResultsCb'); if(mr) mr.value='100'; if (f.maxResults) f.maxResults.value='100'; if (f.currentPage) f.currentPage.value=a[3];
                    document.querySelectorAll('input[name=publicType]').forEach(x=>x.checked=false); var o=document.getElementById('option'); if(o) o.value='report';}""", [st, en, k, page])
                await pg.evaluate("search(%d)" % (page - 1) if page > 1 else "search(0)")
                await pg.wait_for_timeout(5000)
                rr = await pg.evaluate("""()=>[...document.querySelectorAll('#listContents table tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.innerText.trim()).concat([((tr.querySelector('a[href*=rcpNo]')||{}).href||'')]))""")
                rr = [r for r in rr if len(r) >= 6 and "주가연계" in r[2]]
                new = [r for r in rr if r not in rows]
                rows += new
                if len(rr) < 100 or not new: break
        print("filings", len(rows))
        t0 = datetime.datetime.now()
        for r in rows:
            m = re.search(r"rcpNo=(\d+)", r[-1] or "")
            if not m: continue
            rc = m.group(1)
            if any(x.startswith(rc + ":") for x in cache):
                items += [v for k_, v in cache.items() if k_.startswith(rc + ":")]; continue
            if (datetime.datetime.now() - t0).seconds > 1800: err.append("시간 초과 — 나머지는 다음 회차"); break
            try:
                await pg.goto(f"{B}/dsaf001/main.do?rcpNo={rc}", timeout=60000); await pg.wait_for_timeout(2000)
                A1 = pg.locator(".jstree-anchor", has_text="모집 또는 매출의 개요"); A2 = pg.locator(".jstree-anchor", has_text="증권의 주요 권리내용")
                n = min(await A1.count(), await A2.count(), 30)
                for i in range(n):
                    tx = {}
                    for key, A in (("ov", A1), ("rt", A2)):
                        await A.nth(i).click(); await pg.wait_for_timeout(1600)
                        tx[key] = ""
                        for f in pg.frames:
                            if "viewer.do" in f.url:
                                try: tx[key] = await f.inner_text("body")
                                except Exception: pass
                    o = parse(tx["ov"], tx["rt"])
                    o.update({"id": f"{rc}:{i}", "rc": rc, "iss": r[3] if len(r) > 3 else "", "date": (r[4] if len(r) > 4 else "").replace(".", "-"),
                              "kind": "ELB" if "파생결합사채" in r[2] else "ELS"})
                    items.append(o)
                print(rc, r[3], n)
            except Exception as e:
                err.append(f"{rc}: {str(e)[:80]}")
        await b.close()
    keep = [x for x in items if (x.get("e") or x.get("date") or "") >= (today - datetime.timedelta(days=14)).isoformat()]
    json.dump({"updated": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y-%m-%d %H:%M"),
               "src": "금융감독원 DART 일괄신고추가서류(주가연계증권·주가연계파생결합사채)", "items": keep, "errors": err},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("items", len(keep), "errors", err[:3])


if __name__ == "__main__":
    asyncio.run(main())
