"""
해외 종목 한글 이름 받기 (네이버증권 해외주식 목록) → <dest>/names_ko.json  {야후심볼: 한글이름}
  python opdb/names_ko.py --dest opdata
실패해도 기존 파일은 그대로 둔다.
"""
import argparse, json, os, sys, time, urllib.request

HDR = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
# 네이버 거래소 이름 후보 → 시장
EXCHANGES = [("NASDAQ", "US"), ("NYSE", "US"), ("AMEX", "US"),
             ("TOKYO", "JP"), ("HONG_KONG", "HK"), ("SHANGHAI", "CN"), ("SHENZHEN", "CN")]


def get(url):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def yahoo(sym, mkt, reuters=""):
    s = str(sym or "").strip()
    if not s:
        return None
    if mkt == "US":
        return s.replace(".", "-")
    if mkt == "JP":
        return s.split(".")[0] + ".T"
    if mkt == "HK":
        return s.split(".")[0].zfill(4) + ".HK"
    if mkt == "CN":
        c = s.split(".")[0]
        if reuters.endswith(".SS") or reuters.endswith(".SH"):
            return c + ".SS"
        if reuters.endswith(".SZ"):
            return c + ".SZ"
        return c + (".SS" if c.startswith(("6", "9")) else ".SZ")
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", required=True)
    ap.add_argument("--pages", type=int, default=80)
    a = ap.parse_args()
    path = os.path.join(a.dest, "names_ko.json")
    names = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
    before = len(names)
    for ex, mkt in EXCHANGES:
        got = 0
        for page in range(1, a.pages + 1):
            url = f"https://api.stock.naver.com/stock/exchange/{ex}/marketValue?page={page}&pageSize=100"
            try:
                d = get(url)
            except Exception as e:
                print(ex, "실패", page, e)
                break
            rows = d.get("stocks") or d.get("result") or []
            if not rows:
                break
            for r in rows:
                ko = (r.get("stockName") or "").strip()
                sym = yahoo(r.get("symbolCode") or r.get("itemCode"), mkt, r.get("reutersCode") or "")
                if ko and sym and any("가" <= ch <= "힣" for ch in ko):
                    names[sym] = ko
                    got += 1
            time.sleep(0.15)
        print(ex, mkt, "한글 이름", got, flush=True)
    if len(names) >= before:
        json.dump(names, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("전체", len(names), "(이전", before, ")")
    for k in ("V", "AAPL", "MA", "7203.T", "0700.HK", "600519.SS"):
        print(" ", k, names.get(k))


if __name__ == "__main__":
    main()
