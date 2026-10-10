"""
종목리포트 '이 회사는 이렇게 돈을 번다' 사진 받기 (위키백과·위키미디어 공용, 자유 이용 사진)
  준비:  python opdb/build_media.py --prep --dest opdata --out media_todo.json
  받기:  python opdb/build_media.py --shard 3 --of 20 --todo media_todo.json --out out
결과: out/m/<심볼>.json  {"photo": 회사 사진 URL, "pimg": {제품 이름: 사진 URL}}
"""
import argparse, glob, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
sys.path.insert(0, os.path.dirname(__file__))
from common import fnv, fname  # noqa: E402

UA = {"User-Agent": "CHInvestingApp/1.0 (https://chkchp0702-spec.github.io/daily-app/)"}
COMPANY = re.compile(r"기업|회사|그룹|제조|업체|은행|지주|브랜드|법인|company|corporation|manufacturer|bank|group|firm|conglomerate|retailer|holding|brand|airline|insurer|developer|producer|operator|maker|provider", re.I)
GENERIC = re.compile(r"^(서비스|제품|솔루션|기술|사업|부품|소재|장비|시스템|플랫폼|소프트웨어|콘텐츠|제조|판매|유통|기타|관련 ?제품|각종|기업|고객|인프라|운영|개발|연구)$")
START = time.time()
SLEEP = float(os.environ.get("MEDIA_SLEEP", "0.3"))


def get_json(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode("utf-8"))


ERR = {"n": 0, "last": ""}


def summary(lang, title):
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title.replace(" ", "_"), safe="")
    j = None
    for k in range(4):
        try:
            j = get_json(url)
            break
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            ERR["n"] += 1; ERR["last"] = f"{e.code} {url[:60]}"
            time.sleep(3 * (k + 1) if e.code == 429 else 1)
        except Exception as e:
            ERR["n"] += 1; ERR["last"] = repr(e)[:80]
            time.sleep(1)
    if j is None:
        return None
    if j.get("type") != "standard":
        return None
    return j


def thumb(j):
    t = ((j or {}).get("thumbnail") or {}).get("source") or ""
    if not t or re.search(r"logo|\.svg", t, re.I):          # 로고·도식은 빼고 '사진'만
        return ""
    return t


def prep(dest, out):
    from onepager.bizmap import products
    from onepager.narrative import clean_desc
    nk = {}
    try:
        nk = json.load(open(os.path.join(dest, "names_ko.json"), encoding="utf-8"))
    except Exception:
        pass
    todo = []
    for f in glob.glob(os.path.join(dest, "d", "*.json")):
        try:
            r = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        t = r.get("ticker") or {}
        sym = t.get("symbol")
        kf = os.path.join(dest, "k", os.path.basename(f))
        desc = ""
        if os.path.exists(kf):
            desc = clean_desc(json.load(open(kf, encoding="utf-8")).get("desc_ko") or "")
        desc = desc or r.get("business_summary_ko") or ""
        prods = [nm for _, nm in products(desc)]
        ko = t.get("name") if t.get("market") == "KR" else nk.get(sym, "")
        todo.append({"s": sym, "ko": ko or "", "en": "", "p": prods, "cap": r.get("market_cap") or 0})
    meta = {}
    try:
        meta = json.load(open(os.path.join(dest, "meta.json"), encoding="utf-8"))
    except Exception:
        pass
    for x in todo:
        m = meta.get(x["s"])
        if m and len(m) >= 4:
            x["en"] = m[3] or ""
    json.dump(todo, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    print("준비", len(todo), "제품 있음", sum(1 for x in todo if x["p"]))


def run(shard, of, todo_path, out, have=""):
    todo = [x for x in json.load(open(todo_path, encoding="utf-8")) if fnv(x["s"]) % of == shard]
    if have and os.path.isdir(have):
        todo = [x for x in todo if not os.path.exists(os.path.join(have, fname(x["s"]) + ".json"))]
    # 큰 회사부터 (한 번에 다 못 받을 때를 대비)
    todo.sort(key=lambda x: -(x.get("cap") or 0))
    os.makedirs(os.path.join(out, "m"), exist_ok=True)
    cache = {}

    def term_img(t):
        if t in cache:
            return cache[t]
        img = ""
        if not GENERIC.match(t):
            for lang, title in (("ko", t), ("en", t)):
                if lang == "en" and re.search(r"[가-힣]", t):
                    continue
                img = thumb(summary(lang, title))
                time.sleep(SLEEP)
                if img:
                    break
        cache[t] = img
        return img

    got_p = got_c = 0
    for i, x in enumerate(todo):
        if time.time() - START > 105 * 60:          # 10/10: 바깥 timeout 110분보다 먼저 스스로 끝내기 (매일 「실패」로 찍히던 것)
            break
        photo = ""
        if x["ko"] and re.search(r"[가-힣]", x["ko"]):
            j = summary("ko", re.sub(r"\s*\(.*?\)\s*", "", x["ko"]))
            if j and COMPANY.search((j.get("description") or "") + " " + (j.get("extract") or "")[:300]):
                photo = thumb(j)
            time.sleep(SLEEP)
        if not photo and x["en"]:
            for title in (x["en"], re.sub(r"[,.]?\s*(Inc|Incorporated|Corp|Corporation|Co|Ltd|Limited|PLC|N\.V|S\.A|AG|Holdings?|Group|Class [A-Z]|Common Stock|ADR|American Depositary Shares?)\b\.?", "", x["en"], flags=re.I).strip(" ,.-")):
                if not title:
                    continue
                j = summary("en", title)
                time.sleep(SLEEP)
                if j and COMPANY.search((j.get("description") or "") + " " + (j.get("extract") or "")[:300]):
                    photo = thumb(j)
                    break
        pimg = {}
        for t in x["p"][:6]:
            u = term_img(t)
            if u:
                pimg[t] = u
        if photo or pimg:
            json.dump({"photo": photo, "pimg": pimg}, open(os.path.join(out, "m", fname(x["s"]) + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
        got_c += bool(photo)
        got_p += bool(pimg)
        if i % 200 == 0:
            print(f"  {i}/{len(todo)} 회사사진 {got_c} 제품사진 {got_p} 오류 {ERR['n']} {ERR['last']} ({time.time() - START:.0f}s)", flush=True)
    print("끝", len(todo), got_c, got_p)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--prep", action="store_true")
    ap.add_argument("--dest", default="opdata")
    ap.add_argument("--out", default="out")
    ap.add_argument("--todo", default="media_todo.json")
    ap.add_argument("--shard", type=int, default=0)
    ap.add_argument("--of", type=int, default=1)
    ap.add_argument("--have", default="")
    a = ap.parse_args()
    if a.prep:
        prep(a.dest, a.out)
    else:
        run(a.shard, a.of, a.todo, a.out, a.have)
