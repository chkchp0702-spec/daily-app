import requests, os, json, datetime, re
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128"})
log = {}
for k in range(1, 6):
    d = datetime.date.today() - datetime.timedelta(days=k)
    if d.weekday() >= 5: continue
    try:
        r = S.post("https://www.treasurydirect.gov/GA-FI/FedInvest/selectSecurityPriceDate",
                   data={"priceDateDay": d.day, "priceDateMonth": d.month, "priceDateYear": d.year, "fileType": "csv", "csv": "CSV FORMAT"}, timeout=60)
        log[str(d)] = [r.status_code, r.headers.get("content-type"), len(r.text)]
        open(f"{OUT}/fedinvest_{d}.txt", "w").write(r.text[:300000])
        if r.status_code == 200 and len(r.text) > 2000: break
    except Exception as e:
        log[str(d)] = repr(e)[:200]
# 미래에셋 미국채 판매정보 과거 글 목록 (여러 쪽)
B = "https://securities.miraeasset.com"
S.get(B + "/", timeout=30)
items = {}
for page in range(1, 6):
    try:
        t = S.get(B + f"/bbs/board/message/list.do?categoryId=1282&curPage={page}", timeout=40).text
        ids = re.findall(r"view\('(\d+)','(\d+)'\)[^>]*>\s*([^<]*판매정보[^<]*)", t)
        log[f"page{page}"] = len(ids)
        for mid, no, title in ids:
            v = S.get(B + f"/bbs/board/message/view.do?messageId={mid}&messageNumber={no}&messageCategoryId=0&categoryId=1282", timeout=40).text
            for nm in re.findall(r"(T\s+[\d\s/]+\s+\d{2}/\d{2}/\d{2})", re.sub(r"<[^>]+>", " ", v)):
                nm = re.sub(r"\s+", " ", nm).strip(); items.setdefault(nm, []).append(title.strip()[-11:-1])
    except Exception as e:
        log[f"page{page}"] = repr(e)[:200]
json.dump({"log": log, "mirae_ust": items}, open(f"{OUT}/p15.json", "w"), ensure_ascii=False, indent=1)
