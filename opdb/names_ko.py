"""
해외 종목 한글 이름 받기 (네이버증권 해외주식 목록) → <dest>/names_ko.json  {야후심볼: 한글이름}
  python opdb/names_ko.py --dest opdata
실패해도 기존 파일은 그대로 둔다.
"""
import argparse, json, os, re, sys, time, urllib.request

HDR = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
# 네이버 거래소 이름 후보 → 시장
EXCHANGES = [("NASDAQ", "US"), ("NYSE", "US"), ("AMEX", "US"),
             ("TOKYO", "JP"), ("HONG_KONG", "HK"), ("HONGKONG", "HK"), ("HKEX", "HK"), ("HKG", "HK"),
             ("SHANGHAI", "CN"), ("SHENZHEN", "CN")]


def get(url):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def yahoo(sym, mkt, reuters=""):
    s = str(sym or "").strip()
    rc = str(reuters or "").upper()
    # 로이터 코드가 있으면 그걸로 시장을 판단 (0700.HK, 7203.T, 600519.SS …)
    if rc.endswith(".HK"):
        return rc.split(".")[0].lstrip("0").zfill(4) + ".HK"
    if rc.endswith(".T"):
        return rc.split(".")[0] + ".T"
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
    debug = {}
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
            if page == 1:
                debug[ex] = {"keys": list(d.keys())[:10], "n": len(rows), "sample": rows[:2]}
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
    json.dump(debug, open(os.path.join(a.dest, "names_debug.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    translate_missing(a.dest, names)
    print("전체", len(names), "(이전", before, ")")
    for k in ("V", "AAPL", "MA", "7203.T", "0700.HK", "600519.SS"):
        print(" ", k, names.get(k))


SUFFIX = re.compile(r"[,.]?\s*\b(Inc|Incorporated|Corp|Corporation|Co|Company|Ltd|Limited|PLC|plc|S\.?A|AG|N\.?V|Holdings? Ltd|Class [A-Z]|Common Stock|Ordinary Shares?|American Depositary Shares?|ADR|ADS|- .*)\b\.?", re.I)


def translate_missing(dest, names, limit=6000, budget=20 * 60):
    """네이버에 한글 이름이 없는 해외 종목 → 영어 이름을 번역해 검색 별칭으로 (names_tr.json, 한 번 번역한 건 다시 안 함)"""
    sys.path.insert(0, os.path.join("_src", "stock-onepager"))
    sys.path.insert(0, os.path.dirname(__file__))
    try:
        from onepager.data import translate_ko
        from common import universe
    except Exception as e:
        print("번역 준비 실패", e)
        return
    tpath = os.path.join(dest, "names_tr.json")
    tr = json.load(open(tpath, encoding="utf-8")) if os.path.exists(tpath) else {}
    meta = json.load(open(os.path.join(dest, "meta.json"), encoding="utf-8")) if os.path.exists(os.path.join(dest, "meta.json")) else {}
    todo = []
    for sym, name, mkt in universe(os.path.join("_src", "Cup")):
        if mkt == "KR" or sym in names or sym in tr:
            continue
        en = (meta.get(sym) or [None, None, None, ""])[3] or (meta.get(sym) or [name])[0] or name
        if not en or en.startswith("TSE"):
            continue
        todo.append((sym, en))
    print("번역할 이름", len(todo), flush=True)
    t0 = time.time()
    for i, (sym, en) in enumerate(todo[:limit]):
        if time.time() - t0 > budget:
            print("시간 예산 끝 — 다음 실행 때 이어서", i, flush=True)
            break
        base = SUFFIX.sub("", en).strip(" ,.-") or en
        ko = translate_ko(base)
        if ko and any("\uac00" <= ch <= "\ud7a3" for ch in ko):
            tr[sym] = ko
        elif ko:
            tr[sym] = ""          # 번역은 됐지만 한글이 아님 → 다시 안 함
        if i % 500 == 0:
            print(" ", i, sym, en, "→", ko, flush=True)
            json.dump(tr, open(tpath, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(tr, open(tpath, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("번역 이름", sum(1 for v in tr.values() if v))


if __name__ == "__main__":
    main()
