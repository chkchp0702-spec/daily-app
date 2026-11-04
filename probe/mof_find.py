"""#64 일본 재무성 주간 대내외 증권투자(외국인의 일본 주식 순매수) 자료 찾기 — 11/4 10시"""
import requests, re, io
U = ["https://www.mof.go.jp/english/policy/international_policy/reference/itn_transactions_in_securities/week.csv",
     "https://www.mof.go.jp/policy/international_policy/reference/itn_transactions_in_securities/week.csv",
     "https://www.mof.go.jp/english/policy/international_policy/reference/itn_transactions_in_securities/index.htm",
     "https://www.mof.go.jp/policy/international_policy/reference/itn_transactions_in_securities/index.htm"]
hd = {"User-Agent": "Mozilla/5.0"}
got = None
for u in U:
    try:
        r = requests.get(u, headers=hd, timeout=30)
        print("URL", r.status_code, len(r.content), u)
        if u.endswith(".htm"):
            for m in set(re.findall(r'href="([^"]+\.(?:csv|xlsx?))"', r.text)): print("  LINK", m)
        elif r.status_code == 200 and got is None:
            got = r.content
    except Exception as e:
        print("URL ERR", u, e)
if got:
    for enc in ("utf-8-sig", "shift_jis", "cp932"):
        try: t = got.decode(enc); break
        except Exception: continue
    open("probe/mof_week.csv", "w").write(t)
    L = t.splitlines(); print("SAVED lines", len(L))
    for x in L[:16]: print("HEAD", x[:300])
    for x in L[-4:]: print("TAIL", x[:300])
else:
    print("NOTHING")
