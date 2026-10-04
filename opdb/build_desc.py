"""
전 종목 한국어 회사 설명 받기 → out/k/<심볼>.json  {"desc_ko": "..."}
  한국: 와이즈리포트 기업개요 (cmp_comment)
  해외: 네이버증권 해외종목 개요 (api.stock.naver.com/stock/<로이터코드>/overview)
  python opdb/build_desc.py --shard 3 --of 20 --rc names_rc.json --out out
"""
import argparse, html, json, os, re, sys, time, urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from common import universe, fnv, fname  # noqa: E402

H_M = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
       "Accept": "application/json, text/plain, */*", "Referer": "https://m.stock.naver.com/"}
H_D = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"}


def get(url, hdr):
    req = urllib.request.Request(url, headers=hdr)
    with urllib.request.urlopen(req, timeout=20) as r:
        b = r.read()
    try:
        return b.decode("utf-8")
    except UnicodeDecodeError:
        return b.decode("euc-kr", "replace")


def kr_desc(code):
    t = get(f"https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx?cmp_cd={code}", H_D)
    m = re.search(r'class="cmp_comment">(.*?)</div>', t, re.S)
    if not m:
        return ""
    lis = re.findall(r"<li[^>]*>(.*?)</li>", m.group(1), re.S)
    txt = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", x)).strip() for x in lis) if lis else \
        html.unescape(re.sub(r"<[^>]+>", " ", m.group(1)))
    return re.sub(r"\s+", " ", txt).strip()


def guess_rc(sym, mkt):
    c = sym.split(".")[0]
    if mkt == "JP":
        return [c + ".T"]
    if mkt == "HK":
        return [c.zfill(4) + ".HK"]
    if mkt == "CN":
        return [c + (".SS" if sym.endswith(".SS") else ".SZ"), c + ".SH"]
    if mkt == "US":
        b = sym.replace("-", ".")
        return [b + ".O", b, b + ".K", b + ".N", b + ".A"]
    return []


def world_desc(rcs):
    for rc in rcs:
        try:
            d = json.loads(get(f"https://api.stock.naver.com/stock/{rc}/overview", H_M))
        except Exception:
            continue
        s = d.get("summary") or (d.get("summaries") or {}).get("summary") or ""
        if s:
            return re.sub(r"\s+", " ", re.sub(r"<br\s*/?>", " ", s)).strip()
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shard", type=int, required=True)
    ap.add_argument("--of", type=int, required=True)
    ap.add_argument("--rc", default="names_rc.json")
    ap.add_argument("--out", default="out")
    ap.add_argument("--sleep", type=float, default=0.25)
    a = ap.parse_args()
    rc = json.load(open(a.rc)) if os.path.exists(a.rc) else {}
    todo = [(s, n, m) for s, n, m in universe(os.path.join("_src", "Cup")) if fnv(s) % a.of == a.shard]
    os.makedirs(os.path.join(a.out, "k"), exist_ok=True)
    ok = miss = 0
    t0 = time.time()
    for i, (s, n, m) in enumerate(todo):
        try:
            if m == "KR":
                txt = kr_desc(s.split(".")[0])
            else:
                rcs = ([rc[s]] if rc.get(s) else []) + [g for g in guess_rc(s, m) if g != rc.get(s)]
                txt = world_desc(rcs[:3])
        except Exception as e:
            txt = ""
            if miss < 5:
                print("실패", s, e, flush=True)
        if txt:
            json.dump({"desc_ko": txt}, open(os.path.join(a.out, "k", fname(s) + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
            ok += 1
        else:
            miss += 1
        time.sleep(a.sleep)
        if i % 200 == 0:
            print(f"  {i}/{len(todo)} 성공 {ok} 없음 {miss} ({time.time() - t0:.0f}s)", flush=True)
    print("끝", ok, miss)


if __name__ == "__main__":
    main()
