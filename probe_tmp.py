"""임시: #10 공매도·대차잔고 자료 길 찾기"""
import json, requests
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
def fz(obj, a="20250101", b="20261231", p="D"):
    r = requests.post("https://freesis.kofia.or.kr/meta/getMetaDataList.do",
        json={"dmSearch": {"tmpV40": "100000000", "tmpV41": "1", "tmpV1": p, "tmpV45": a, "tmpV46": b, "OBJ_NM": obj}},
        headers={**UA, "Content-Type": "application/json; charset=UTF-8", "Referer": "https://freesis.kofia.or.kr/"}, timeout=30)
    return r
for pre in ("STATSCU01000000", "STATSCU02000000", "STATSCU03000000"):
    for i in range(10, 260, 10):
        obj = f"{pre}{i:03d}BO"
        try:
            r = fz(obj); j = r.json(); ds = j.get("ds1") or []
            if ds: print("FZ", obj, len(ds), json.dumps(ds[-1], ensure_ascii=False)[:300], [k for k in j.keys()])
        except Exception as e: pass
# KRX
for bld, extra in (("dbms/MDC/STAT/srt/MDCSTAT30001", {"mktId": "STK", "strtDd": "20260901", "endDd": "20261027"}),
                   ("dbms/MDC/STAT/srt/MDCSTAT30101", {"mktId": "STK", "inqCond": "1", "strtDd": "20260901", "endDd": "20261027"}),
                   ("dbms/MDC/STAT/srt/MDCSTAT30501", {"mktId": "STK", "strtDd": "20260901", "endDd": "20261027"})):
    for host in ("http://data.krx.co.kr", "https://data.krx.co.kr"):
        try:
            r = requests.post(host + "/comm/bldAttendant/getJsonData.cmd", data={"bld": bld, **extra}, headers={**UA, "Referer": host + "/contents/MDC/MDI/mdiLoader/index.cmd"}, timeout=20)
            print("KRX", host, bld, r.status_code, r.text[:300].replace("\n", " "))
        except Exception as e: print("KRX", host, bld, "ERR", e)
for nm, url in (("krxshort", "https://short.krx.co.kr/contents/SRT/02/02010100/SRT02010100.jsp"),
                ("daum_short", "https://finance.daum.net/api/trend/short_selling?symbolCode=A005930"),
                ("naver_short", "https://m.stock.naver.com/api/stock/005930/shortSelling"),
                ("naver_lend", "https://m.stock.naver.com/api/stock/005930/lending")):
    try:
        r = requests.get(url, headers={**UA, "Referer": "https://finance.daum.net/"}, timeout=20); print("URL", nm, r.status_code, r.text[:200].replace("\n", " "))
    except Exception as e: print("URL", nm, "ERR", e)
