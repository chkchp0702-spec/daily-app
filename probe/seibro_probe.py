"""#34 seibro 대차 현황 ajax 주소 찾기 — 10/30 10시 (Actions 임시)"""
import re, requests
UA = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"}
S = requests.Session()
for u in ["https://m.seibro.or.kr/cnts/loan/selectStockLoanState.do",
          "https://m.seibro.or.kr/cnts/loan/selectLoanRank.do",
          "https://m.seibro.or.kr/cnts/loan/selectStockLoanDeal.do"]:
    try:
        r = S.get(u, headers=UA, timeout=20); t = r.text
        print("==", u, r.status_code, len(t))
        print("  .do/.json:", sorted(set(re.findall(r"[\w/.-]+\.(?:do|json|jsp)", t)))[:60])
        print("  ajax:", re.findall(r"(?:url|action)\s*[:=]\s*['\"]([^'\"]+)", t)[:30])
        print("  inputs:", sorted(set(re.findall(r'(?:name|id)="(\w+)"', t)))[:60])
        js = sorted(set(re.findall(r'src="([^"]+\.js[^"]*)"', t)))
        print("  js:", js[:20])
        for j in js:
            if "jquery" in j.lower(): continue
            jj = j if j.startswith("http") else "https://m.seibro.or.kr" + j
            try:
                tj = S.get(jj, headers=UA, timeout=20).text
                hits = sorted(set(re.findall(r"[\w/.-]*(?:[Ll]oan|[Ll]end)[\w/.-]*\.(?:do|json)", tj)))
                if hits: print("   js", jj, hits[:30])
            except Exception as e: print("   js ERR", jj, e)
        m = re.search(r"<script[^>]*>(?:(?!</script>).)*(?:ajax|\$\.post|fetch)(?:(?!</script>).)*</script>", t, re.S)
        if m: print("  script:", re.sub(r"\s+", " ", m.group(0))[:1500])
    except Exception as e:
        print("==", u, "ERR", e)
