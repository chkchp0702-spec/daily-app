"""
종목 뉴스만 받기 → out/n/<심볼>.json  (천천히: 종목당 1~4번 호출 + 쉬기)
  python opdb/build_news.py --shard 3 --of 14 --out out --meta meta.json --names names_ko.json
순서: ① 구글 뉴스(한국어, 최근 30일) → (중국) 동방재부 뉴스 검색·구글 중국어 / (홍콩) 구글 홍콩판
      → ② 야후 검색 뉴스(해외 전부) → ③ 구글 영어 "<영문명> stock"(최근 30일, 해외 종목)
      → ④ 빙 뉴스(한국어·영어) → ⑤ 그래도 없으면 구글 한국어 기간 제한 없이 → (중국) 동방재부 기간 없이 → 회사 공시.
ETF(etf_list.json)도 받는다: 한국 ETF = 구글 한국어 이름 / 미국 ETF = 야후 → 구글 영어 "정확한 이름" → 빙.
구글이 막히면(연속 실패) 10분간 구글을 건너뛰고 야후·빙으로만 받는다.
끝까지 뉴스가 없는 종목은 out/t/<shard>.json 에 '오늘 시도함'으로 남겨 다음 밤엔 뒤로 미룬다
(예전엔 뉴스 없는 종목을 매일 맨 앞에서 다시 시도해서 하룻밤에 몇 개밖에 못 늘었다).
"""
import argparse, dataclasses, datetime as dt, json, os, re, signal, sys, time
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

    def get(self, q, hl="ko", gl="KR", limit=6, ceid=None):
        if not self.ok():
            return []
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
            {"q": q, "hl": hl, "gl": gl, "ceid": ceid or f"{gl}:{hl.split('-')[0]}"})
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
    try:
        import yfinance as yf
        signal.alarm(20)
        items = yf.Search(sym, news_count=6, max_results=1).news
        signal.alarm(0)
    except Exception:
        signal.alarm(0)
        return []
    return D.parse_yf_news(items)


def _cn_code(sym):
    """600198.SS → 600198 (중국 A주 6자리)"""
    c = sym.split(".")[0]
    return c if c.isdigit() and len(c) == 6 else ""


def em_news(keyword, limit=6):
    """동방재부(eastmoney) 뉴스 검색 — 중국어 종목명으로. 중국 A주 뉴스가 구글보다 훨씬 많다."""
    if not keyword:
        return []
    param = {"uid": "", "keyword": keyword, "type": ["cmsArticleWebOld"], "client": "web", "clientType": "web",
             "clientVersion": "curr", "param": {"cmsArticleWebOld": {"searchScope": "default", "sort": "time",
                                                                      "pageIndex": 1, "pageSize": 10, "preTag": "", "postTag": ""}}}
    url = "https://search-api-web.eastmoney.com/search/jsonp?" + urllib.parse.urlencode(
        {"cb": "cb", "param": json.dumps(param, ensure_ascii=False, separators=(",", ":"))})
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=dict(UA, Referer="https://so.eastmoney.com/")), timeout=8) as r:
            t = r.read().decode("utf-8", "replace")
        d = json.loads(t[t.find("(") + 1:t.rfind(")")])
        rows = (d.get("result") or {}).get("cmsArticleWebOld") or []
    except Exception:
        return []
    out = []
    for x in rows:
        title = re.sub(r"<[^>]+>", "", x.get("title") or "").strip()
        if not title:
            continue
        out.append(NewsItem(title=title, publisher=(x.get("mediaName") or "东方财富").strip(),
                            link=x.get("url") or "", date=(x.get("date") or "")[:10]))
    out.sort(key=lambda n: n.date, reverse=True)
    return out[:limit]


def em_notice(code, limit=6):
    """동방재부 회사 공시(公告) — 상장사는 공시가 늘 있으므로 중국 A주 마지막 보루."""
    if not code:
        return []
    url = "https://np-anotice-stock.eastmoney.com/api/security/ann?" + urllib.parse.urlencode(
        {"sr": -1, "page_size": limit, "page_index": 1, "ann_type": "A", "client_source": "web",
         "stock_list": code, "f_node": 0, "s_node": 0})
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=dict(UA, Referer="https://data.eastmoney.com/")), timeout=8) as r:
            d = json.loads(r.read().decode("utf-8", "replace"))
        rows = (d.get("data") or {}).get("list") or []
    except Exception:
        return []
    out = []
    for x in rows:
        title = (x.get("title") or x.get("title_ch") or "").strip()
        art = x.get("art_code") or ""
        if not title or not art:
            continue
        out.append(NewsItem(title="[공시] " + title, publisher="东方财富 公告",
                            link=f"https://data.eastmoney.com/notices/detail/{code}/{art}.html",
                            date=(x.get("notice_date") or x.get("display_time") or "")[:10]))
    return out[:limit]


SPAM = re.compile(r"Calgary Rough|도박|토토|카지노|바카라|파워볼|슬롯|홀덤|마작|먹튀|사설\s*사이트|릴\s*(게임|영역)|룰렛|casino|betting|gambl", re.I)


def clean(items):
    """도박·광고성 글 빼기 (구글 한국어 검색에 섞여 들어옴)"""
    return [n for n in items if not SPAM.search((n.title or "") + " " + (n.publisher or ""))]


def about(items, *keys):
    """제목에 이름·티커가 들어간 것만 (짧은 티커·흔한 이름 검색에 엉뚱한 기사가 섞이는 것 막기)"""
    ks = [k for k in keys if k and len(k) >= 2]
    if not ks:
        return items
    def hit(t):
        t2 = (t or "").replace(" ", "").lower()
        return any(k.replace(" ", "").lower() in t2 for k in ks)
    return [n for n in items if hit(n.title)]


def _tick(items, sym):
    """제목에 티커가 대문자 단어로 있는 것만 (예: SPY ETF)"""
    r = re.compile(r"(?<![A-Za-z])" + re.escape(sym) + r"(?![a-z])")
    return [n for n in items if r.search(n.title or "")]


def _core(name):
    """ETF 이름에서 검색에 쓸 핵심 (예: 'SPDR S&P 500 ETF Trust' → 'SPDR S&P 500')"""
    n = re.sub(r"\b(ETF|Trust|Fund|Shares|Index|Portfolio|Series)\b.*$", "", name or "", flags=re.I).strip(" -,")
    return n if len(n) >= 8 and " " in n else name      # 너무 짧으면(예: 'EA') 전체 이름


def recent(items, days=30):
    cut = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    return [n for n in items if (n.date or "") >= cut]


def one(s, meta, etf, names, g, src):
    """한 종목(또는 ETF) 뉴스 모으기 → [NewsItem]"""
    if s in etf:                                    # ── ETF ──
        disp, mkt = etf[s]
        ko = names.get(s) or (disp if mkt == "KR" else "")
        news = []
        if mkt == "KR":                             # 한국 ETF: 정확한 이름 + ETF
            news = about(clean(g.get(f'"{disp}" ETF when:30d')), disp) or about(clean(g.get(f"{disp} when:30d")), disp)
            src["google"] += 1 if news else 0
        else:                                       # 미국 ETF: 정확한 이름 → "티커 ETF" → 야후(제목에 티커 있는 것만)
            core = _core(disp)
            news = [n for n in clean(g.get(f'"{core}" when:30d', hl="en-US", gl="US")) if about([n], core) or _tick([n], s)]
            if len(news) < 3:
                news += _tick(clean(g.get(f'"{s}" ETF when:30d', hl="en-US", gl="US")), s)
            src["google_en"] += 1 if news else 0
            if len(news) < 3:
                y = _tick(recent(yahoo(s), 45), s)
                src["yahoo"] += 1 if y else 0
                news += y
            if len(news) < 3 and ko:
                news += about(clean(g.get(f"{ko} when:30d")), ko)
        if len(news) < 3:
            b = clean(recent(bing(f'"{disp}"', mkt="ko" if mkt == "KR" else None)))
            b = about(b, disp, _core(disp)) if mkt == "KR" else (about(b, _core(disp)) or _tick(b, s))
            src["bing"] += 1 if b else 0
            news += b
        if not news:
            o = about(clean(g.get(f'"{disp}"' if mkt == "KR" else f'"{_core(disp)}"', **({} if mkt == "KR" else {"hl": "en-US", "gl": "US"}))), disp, _core(disp))
            src["old"] += 1 if o else 0
            news += o
        src["etf"] += 1 if news else 0
        return news
    disp, mkt, _, long_name = meta[s][:4]           # ── 주식 ──
    ko = names.get(s) if mkt != "KR" else disp
    q = (ko or long_name or disp) + " 주가"
    news = g.get(q + " when:30d")
    if news:
        src["google"] += 1
    if mkt == "CN":                                 # 중국: 중국어 이름으로 동방재부·구글 중국어
        if len(news) < 3:
            c = recent(em_news(disp))
            src["em"] += 1 if c else 0
            news += c
        if len(news) < 3:
            c = g.get(f"{disp} when:30d", hl="zh-CN", gl="CN", ceid="CN:zh-Hans")
            src["cn"] += 1 if c else 0
            news += c
    if mkt == "HK" and len(news) < 3:               # 홍콩: 구글 홍콩판(번체·영문)
        code = s.split(".")[0]
        c = g.get(f'"{long_name or disp}" when:30d', hl="zh-HK", gl="HK", ceid="HK:zh-Hant") if (long_name or disp) else []
        if not c and code.isdigit():
            c = g.get(f"{int(code):05d} 股票 when:30d", hl="zh-HK", gl="HK", ceid="HK:zh-Hant")
        src["cn"] += 1 if c else 0
        news += c
    if mkt == "JP" and len(news) < 3:               # 일본: 구글 일본판 (영문 회사명 · 종목코드)
        code = s.split(".")[0]
        c = g.get(f'"{long_name or disp}" when:30d', hl="ja", gl="JP", ceid="JP:ja") if (long_name or disp) else []
        if not c and code.isalnum():
            c = about(g.get(f"{code} 株価 when:30d", hl="ja", gl="JP", ceid="JP:ja"), code)
        src["cn"] += 1 if c else 0
        news += c
    if len(news) < 3 and mkt != "KR":               # 야후 검색 뉴스 (예전엔 미국만 → 해외 전부)
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
    if not news:                                    # 기간 없이 — 해외는 제목에 이름이 있는 것만 (엉뚱한 옛 기사 막기)
        o = g.get(q)
        if mkt != "KR":
            o = about(o, ko, disp, (long_name or "").split(",")[0])
        src["old"] += 1 if o else 0
        news += o
    if not news and mkt == "CN":                    # 그래도 없으면: 기간 없이 동방재부 → 회사 공시
        news = em_news(disp) or em_notice(_cn_code(s))
        src["notice"] += 1 if news else 0
    return news


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shard", type=int, required=True)
    ap.add_argument("--of", type=int, required=True)
    ap.add_argument("--out", default="out")
    ap.add_argument("--meta", default="meta.json")
    ap.add_argument("--names", default="names_ko.json")
    ap.add_argument("--sleep", type=float, default=1.0)
    ap.add_argument("--age", default="newsage.json", help="{심볼: 마지막 뉴스 날짜 또는 뉴스 없이 시도한 날} — 없는 것·오래된 것부터")
    ap.add_argument("--etfs", default="etf_list.json", help="ETF 목록 [[심볼, 이름, 시장]] — ETF 뉴스도 받기")
    ap.add_argument("--limit", type=int, default=0, help="시험용: 앞에서 N개만")
    ap.add_argument("--only", default="", help="시험용: 쉼표로 심볼 지정")
    a = ap.parse_args()
    meta = json.load(open(a.meta)) if os.path.exists(a.meta) else {}
    names = json.load(open(a.names, encoding="utf-8")) if os.path.exists(a.names) else {}
    etf = {}
    if os.path.exists(a.etfs):
        for r in json.load(open(a.etfs, encoding="utf-8")):
            if r and r[0] not in meta:
                etf[r[0]] = (r[1] if len(r) > 1 else r[0], r[2] if len(r) > 2 else "US")
    syms = [s for s, v in meta.items() if len(v) <= 4 and fnv(s) % a.of == a.shard]
    syms += [s for s in etf if fnv(s) % a.of == a.shard]
    if a.only:
        syms = [s for s in a.only.split(",") if s in meta or s in etf]
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
    src = {"google": 0, "yahoo": 0, "google_en": 0, "bing": 0, "old": 0, "cn": 0, "em": 0, "notice": 0, "etf": 0}
    for i, s in enumerate(syms):
        if time.time() - START > BUDGET or (a.limit and i >= a.limit):
            break
        try:
            news = one(s, meta, etf, names, g, src)
        except Exception as ex:                     # 한 종목 오류로 전체가 멈추지 않게
            print("  오류", s, ex, flush=True)
            news = []
        news = D._dedupe(clean(news))
        news.sort(key=lambda n: n.date or "", reverse=True)
        news = news[:6]
        if a.only:
            print(" ", s, len(news), [f"{n.date} {n.publisher[:12]} {n.title[:40]}" for n in news[:3]], flush=True)
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
