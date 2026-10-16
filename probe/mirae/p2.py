"""미래에셋 상품 자료 직접 받아 보기 (임시)"""
import json, os, re, requests
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
B = "https://securities.miraeasset.com"
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36", "Accept-Language": "ko-KR"})
log = {}
def save(n, t): open(f"{OUT}/{n}", "w").write(t)
try:
    S.get(B + "/", timeout=30)
    r = S.get(B + "/hks/hks4036/r01.do", timeout=30); save("bond_r01.html", r.text); log["bond"] = [r.status_code, len(r.text)]
    r = S.get(B + "/hks/hks4037/r03.do", timeout=30); save("bond_r03.html", r.text); log["bond_ref"] = [r.status_code, len(r.text)]
    for c in ("1282", "2078", "1860"):
        r = S.get(B + f"/bbs/board/message/list.do?categoryId={c}", timeout=30); save(f"board_{c}.html", r.text); log["board" + c] = [r.status_code, len(r.text)]
    r = S.post(B + "/search/getTotalSearch.jsp", data={"query": "", "sort": "M3_BNFR", "sort_opt": "DESC", "startCount": "0", "listCount": "3000", "HIGH_RSK_YN": ""}, timeout=60)
    save("fund_all.json", r.text.strip()); log["fund"] = [r.status_code, len(r.text)]
    rows, nk = [], ""
    for i in range(10):
        r = S.post(B + "/hks/hks4022/a01.json", data={"omkt_drvs_tcd": "0", "dlbr_term_yn": "0", "itm_nm": "", "prgs_scd": "01", "qry_sort_tp": "0", "qry_sort_sqn": "0", "next_key": nk}, headers={"X-Requested-With": "XMLHttpRequest", "Referer": B + "/hks/hks4023/n01_1.do"}, timeout=30)
        j = r.json(); rows += j.get("grid01") or []
        log["els_page%d" % i] = [r.status_code, j.get("continueYn"), j.get("cts")]
        if j.get("continueYn") != "1": break
        nk = (j.get("cts") or [{}])[0].get("next_key", "")
    json.dump(rows, open(f"{OUT}/els.json", "w"), ensure_ascii=False, indent=0)
    for p in ("02",):
        r = S.post(B + "/hks/hks4022/a01.json", data={"omkt_drvs_tcd": "0", "dlbr_term_yn": "0", "itm_nm": "", "prgs_scd": p, "qry_sort_tp": "0", "qry_sort_sqn": "0", "next_key": ""}, headers={"X-Requested-With": "XMLHttpRequest"}, timeout=30)
        save(f"els_{p}.json", r.text)
except Exception as e:
    log["err"] = repr(e)
json.dump(log, open(f"{OUT}/p2log.json", "w"), ensure_ascii=False, indent=1)
