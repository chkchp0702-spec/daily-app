import requests, os, json, re, html, time
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36", "Referer": "https://dart.fss.or.kr/dsab007/main.do", "X-Requested-With": "XMLHttpRequest"})
S.get("https://dart.fss.or.kr/dsab007/main.do", timeout=40)
NM = ["타임폴리오자산운용", "브이아이피자산운용", "머스트자산운용", "디에스자산운용", "라이프자산운용", "타이거자산운용투자일임", "더블유자산운용", "디더블유에스자산운용",
      "케이씨지아이자산운용", "쿼드자산운용", "안다자산운용", "라쿤자산운용", "르네상스자산운용", "밸류파트너스자산운용", "블리츠자산운용", "빌리언폴드자산운용",
      "씨앗자산운용", "마이다스에셋자산운용", "보고자산운용", "유경피에스지자산운용", "지안자산운용", "토터스자산운용", "한앤파트너스자산운용", "인사이트자산운용",
      "더제이자산운용", "블래쉬자산운용", "비전자산운용", "에이아이파트너스자산운용", "지브이에이자산운용", "알펜루트자산운용", "파인밸류자산운용", "에이원자산운용",
      "수성자산운용", "포커스자산운용", "오라이언자산운용", "라이노스자산운용", "브이엠자산운용", "아우름자산운용", "인벡스자산운용", "웰컴자산운용", "삼성자산운용",
      "티씨케이인베스트먼트", "유리자산운용", "제이비자산운용", "씨케이자산운용", "태생자산운용", "더블유더블유지자산운용", "리딩투자증권", "에이치자산운용"]
res = {}
def q(nm, page=1):
    d = {"currentPage": page, "maxResults": 100, "maxLinks": 10, "sort": "date", "series": "desc", "textCrpCik": "", "textCrpNm": "", "textPresenterNm": nm,
         "startDate": "20240101", "endDate": "20261016", "finalReport": "recent", "publicType": "D001", "option": "", "autoSearch": "Y", "searchGubun": "SEARCH",
         "businessCode": "all", "corporationType": "all", "closingAccountsMonth": "all", "decadeType": "", "reportName": "", "tocSrch": "", "keyword": "", "lateKeyword": ""}
    r = S.post("https://dart.fss.or.kr/dsab007/detailSearchMain3.do", data=d, timeout=90)
    return r
for nm in NM:
    try:
        r = q(nm); t = r.text
        if nm == NM[0]: open(f"{OUT}/dart_list_sample.html", "w").write(t[:200000])
        rows = []
        for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
            tds = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip() for x in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
            rc = re.search(r"rcpNo=(\d+)", tr)
            if len(tds) >= 5: rows.append(tds + [rc.group(1) if rc else ""])
        tot = re.search(r"총\s*([\d,]+)\s*건|\[\s*([\d/]+)\s*\]\s*\[총\s*([\d,]+)건\]", re.sub(r"<[^>]+>", " ", t))
        res[nm] = {"st": r.status_code, "n": len(rows), "tot": tot.group(0) if tot else None, "rows": rows[:100]}
    except Exception as e:
        res[nm] = {"err": repr(e)[:200]}
    time.sleep(1.5)
json.dump(res, open(f"{OUT}/p21.json", "w"), ensure_ascii=False, indent=1)
