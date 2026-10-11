import json, sys, urllib.request, urllib.parse, urllib.error, datetime as dt
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
     "Referer": "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201030108", "X-Requested-With": "XMLHttpRequest",
     "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"}
import http.cookiejar
CJ = http.cookiejar.CookieJar(); OP = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CJ))
try:
    OP.open(urllib.request.Request("http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201030108", headers={"User-Agent": H["User-Agent"]}), timeout=30).read()
except Exception as e:
    print("page", e)
def post(d):
    req = urllib.request.Request("http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", data=urllib.parse.urlencode(d).encode(), headers=H)
    try:
        r = OP.open(req, timeout=30)
    except urllib.error.HTTPError as e:
        return {"http": e.code, "body": e.read().decode("utf-8", "ignore")[:300]}
    with r:
        t = r.read().decode("utf-8", "ignore")
    try: return json.loads(t)
    except Exception: return {"raw": t[:400]}
out = {}
for code in sys.argv[1:]:
    o = {}
    try:
        f = post({"bld": "dbms/comm/finder/finder_secuprodisu", "mktsel": "ETF", "searchText": code})
        o["finder"] = (f.get("block1") or f)  if isinstance(f, dict) else f
        isin = ((f.get("block1") or [{}])[0]).get("full_code")
        o["isin"] = isin
        for back in range(0, 6):
            d = (dt.date.today() - dt.timedelta(days=back)).strftime("%Y%m%d")
            p = post({"bld": "dbms/MDC/STAT/standard/MDCSTAT05001", "locale": "ko_KR", "tboxisuCd_finder_secuprodisu1_0": code + "/" + ((f.get("block1") or [{}])[0]).get("codeName", ""),
                      "isuCd": isin, "isuCd2": isin, "codeNmisuCd_finder_secuprodisu1_0": ((f.get("block1") or [{}])[0]).get("codeName", ""), "param1isuCd_finder_secuprodisu1_0": "",
                      "trdDd": d, "share": "1", "money": "1", "csvxls_isNo": "false"})
            rows = p.get("output") if isinstance(p, dict) else None
            if rows:
                o["date"] = d; o["n"] = len(rows); o["rows"] = rows[:4]; break
            o.setdefault("tries", []).append({d: str(p)[:200]})
    except Exception as e:
        o["err"] = str(e)
    out[code] = o
json.dump(out, open("archive/x/probe_etf.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
