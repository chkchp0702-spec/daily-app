"""
종목 뉴스만 받기 → out/n/<심볼>.json  (천천히: 종목당 1~4번 호출 + 쉬기)
  python opdb/build_news.py --shard 3 --of 14 --out out --meta meta.json --names names_ko.json
순서: ① 구글 뉴스(한국어, 최근 30일) → ② 야후 검색 뉴스(미국 종목에 강함) → ③ 구글 영어 "<영문명> stock"(최근 30일, 해외 종목)
      → ④ 빙 뉴스(한국어·영어) → ⑤ 그래도 없으면 구글 한국어 기간 제한 없이.
구글이 막히면(연속 실패) 10분간 구글을 건너뛰고 야후·빙으로만 받는다.
끝까지 뉴스가 없는 종목은 out/t/<shard>.json 에 '오늘 시도함'으로 남겨 다음 밤엔 뒤로 미룬다
(예전엔 뉴스 없는 종목을 매일 맨 앞에서 다시 시도해서 하룻밤에 몇 개밖에 못 늘었다).
"""
import argparse, dataclasses, datetime as dt, json, os, signal, sys, time
import urllib.parse, urllib.request
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
sys.path.insert(0, os.path.dirname(__file__))
from common import fnv, fname  # noqa: E402
from onepager import data as D  # noqa: E402
from onepager.models import NewsItem  # noqa: E402

START = time.time()
BUDGET = int(float(os.environ.get("NEWS_HOURS", "5")) * 3600)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}


def _alarm(*_):
    raise TimeoutError()


class Google:
    """구글 뉴스 RSS — 연속 실패하면 잠깐 쉬게(막힘 피하기)."""

    def __init__(self):
        self.streak = 0
        self.off_until = 0.0
        self.fails = 0

    def ok(self):
        return time.time() >= self.off_until

    def get(self, q, hl="ko", gl="KR", limit=6):
        if not self.ok():
            return []
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
            {"q": q, "hl": hl, "gl": gl, "ceid": f"{gl}:{hl.split('-')[0]}"})
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=7) as r:
                out = D.parse_google_rss(r.read(), limit)
            self.streak = 0
            return out
        except Exception:
            self.fails += 1
            self.streak += 1
            if self.streak >= 5:              # 막힘 → 10분 쉬고 다시
                self.off_until = time.time() + 600
                self.streak = 0
                print(f"  구글 막힘 → 10분 쉼 (누적 실패 {self.fails})", flush=True)
            return []


def bing(q, limit=6, mkt=None):
    p = {"q": q, "format": "rss"}
    if mkt == "ko":
        p.update({"setlang": "ko", "cc": "KR"})
    url = "https://www.bing.com/news/search?" + urllib.parse.urlencode(p)
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=8) as r:
            root = ET.fromstring(r.read())
    except Exception:
        return []
    from email.utils import parsedate_to_datetime
    out = []
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        if not title:
            continue
        src = ""
        for ch in it:
            if ch.tag.endswith("Source"):
                src = (ch.text or "").strip()
        link = it.findtext("link") or ""
        if "url=" in link:                          # 빙 이동 주소 → 원래 기사 주소
            try:
                link = urllib.parse.parse_qs(urllib.parse.urlparse(link).query).get("url", [link])[0]
            except Exception:
                pass
        if not src:
            src = urllib.parse.urlparse(link).netloc.replace("www.", "")
        date = ""
        try:
            date = parsedate_to_datetime(it.findtext("pubDate") or "").date().isoformat()
        except Exception:
            pass
        out.append(NewsItem(title=title, publisher=src, link=link, date=date))
    out.sort(key=lambda n: n.date, reverse=True)
    return out[:limit]


def yahoo(sym):
    import yfinance as yf
    try:
        signal.alarm(20)
        items = yf.Search(sym, news_count=6, max_results=1).news
        signal.alarm(0)
    except Exception:
        signal.alarm(0)
        return []
    return D.parse_yf_news(items)


def recent(items, days=30):
    cut = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    return [n for n in items if (n.date or "") >= cut]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shard", type=int, required=True)
    ap.add_argument("--of", type=int, required=True)
    ap.add_argument("--out", default="out")
    ap.add_argument("--meta", default="meta.json")
    ap.add_argument("--names", default="names_ko.json")
    ap.add_argument("--sleep", type=float, default=1.0)
    ap.add_argument("--age", default="newsage.json", help="{심볼: 마지막 뉴스 날짜 또는 뉴스 없이 시도한 날} — 없는 것·오래된 것부터")
    a = ap.parse_args()
    meta = json.load(open(a.meta)) if os.path.exists(a.meta) else {}
    names = json.load(open(a.names, encoding="utf-8")) if os.path.exists(a.names) else {}
    syms = [s for s, v in meta.items() if len(v) <= 4 and fnv(s) % a.of == a.shard]
    age = json.load(open(a.age)) if os.path.exists(a.age) else {}
    syms.sort(key=lambda x: age.get(x, ""))      # 한 번도 안 한 종목 → 오래된 종목 순
    print(f"shard {a.shard}: {len(syms)}개 (처음 {sum(1 for x in syms if x not in age)})", flush=True)
    os.makedirs(os.path.join(a.out, "n"), exist_ok=True)
    os.makedirs(os.path.join(a.out, "t"), exist_ok=True)
    signal.signal(signal.SIGALRM, _alarm)
    g = Google()
    today = dt.date.today().isoformat()
    tried = {}
    got = fresh = 0
    src = {"google": 0, "yahoo": 0, "google_en": 0, "bing": 0, "old": 0}
    for i, s in enumerate(syms):
        if time.time() - START > BUDGET:
            break
        disp, mkt, _, long_name = meta[s][:4]
        ko = names.get(s) if mkt != "KR" else disp
        q = (ko or long_name or disp) + " 주가"
        news = g.get(q + " when:30d")
        if news:
            src["google"] += 1
        if len(news) < 3 and mkt == "US":
            y = recent(yahoo(s), 45)
            src["yahoo"] += 1 if y else 0
            news += y
        if len(news) < 3 and mkt != "KR" and long_name:
            e = g.get(f"{long_name} stock when:30d", hl="en-US", gl="US")
            src["google_en"] += 1 if e else 0
            news += e
        if len(news) < 3:
            b = recent(bing(q, mkt="ko")) or (recent(bing(long_name)) if mkt != "KR" and long_name else [])
            src["bing"] += 1 if b else 0
            news += b
        if not news:
            o = g.get(q)
            src["old"] += 1 if o else 0
            news += o
        news = D._dedupe(news)
        news.sort(key=lambda n: n.date or "", reverse=True)
        news = news[:6]
        if news:
            got += 1
            fresh += 1 if recent(news) else 0
            json.dump([dataclasses.asdict(n) for n in news], open(os.path.join(a.out, "n", fname(s) + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
        else:
            tried[s] = today
        time.sleep(a.sleep)
        if i % 200 == 0:
            print(f"  {i}/{len(syms)} 뉴스 {got} (30일 안 {fresh}) 없음 {len(tried)} 구글실패 {g.fails} 원천 {src} ({time.time() - START:.0f}s)", flush=True)
    json.dump(tried, open(os.path.join(a.out, "t", f"{a.shard}.json"), "w"))
    print("끝", got, "30일 안", fresh, "없음", len(tried), "구글실패", g.fails, src)


if __name__ == "__main__":
    main()
