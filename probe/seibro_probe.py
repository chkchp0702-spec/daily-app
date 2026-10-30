"""#29 대차잔고 주소 시험 — 10/30 09시 (Actions 임시)"""
import re, requests
UA = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"}
urls = ["https://m.seibro.or.kr/cnts/loan/selectStockLoanDeal.do",
        "https://m.seibro.or.kr/cnts/loan/selectStockLoanBal.do",
        "https://m.seibro.or.kr/cnts/loan/selectStockLoanMarket.do",
        "https://m.seibro.or.kr/cnts/loan/",
        "https://seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/loan/BIP_CNTS07001V.xml&menuNo=35",
        "https://api.seibro.or.kr/openapi/service/StockSvc/getStkLendingInfo"]
for u in urls:
    try:
        r = requests.get(u, headers=UA, timeout=20)
        t = r.text
        print("==", u, r.status_code, len(t))
        print("  .do:", sorted(set(re.findall(r"[\w/]+\.do", t)))[:40])
        print("  forms:", re.findall(r"<form[^>]*>", t)[:5])
        print("  inputs:", sorted(set(re.findall(r'name="(\w+)"', t)))[:40])
        print("  txt:", re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t))[:600])
    except Exception as e:
        print("==", u, "ERR", e)
