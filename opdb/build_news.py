"""
종목 뉴스만 받기 → out/n/<심볼>.json  (천천히: 종목당 1~2번 호출 + 쉬기)
  python opdb/build_news.py --shard 3 --of 20 --out out --meta meta.json --names names_ko.json
한글 이름이 있으면 '한글이름 주가' 로 구글 뉴스(한국어) 검색, 없으면 영어 이름. 부족하면 야후 뉴스로 채움.
"""
import argparse, dataclasses, json, os, signal, sys, time

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
sys.path.insert(0, os.path.dirname(__file__))
from common import fnv, fname  # noqa: E402
from onepager import data as D  # noqa: E402

START = time.time()
BUDGET = 5 * 3600


def _alarm(*_):
    raise TimeoutError()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shard", type=int, required=True)
    ap.add_argument("--of", type=int, required=True)
    ap.add_argument("--out", default="out")
    ap.add_argument("--meta", default="meta.json")
    ap.add_argument("--names", default="names_ko.json")
    ap.add_argument("--sleep", type=float, default=1.2)
    a = ap.parse_args()
    meta = json.load(open(a.meta)) if os.path.exists(a.meta) else {}
    names = json.load(open(a.names, encoding="utf-8")) if os.path.exists(a.names) else {}
    syms = [s for s, v in meta.items() if len(v) <= 4 and fnv(s) % a.of == a.shard]
    print(f"shard {a.shard}: {len(syms)}개", flush=True)
    os.makedirs(os.path.join(a.out, "n"), exist_ok=True)
    signal.signal(signal.SIGALRM, _alarm)
    got = fails = 0
    yf = None
    for i, s in enumerate(syms):
        if time.time() - START > BUDGET:
            break
        disp, mkt, _, long_name = meta[s][:4]
        ko = names.get(s) if mkt != "KR" else disp
        q = (ko or long_name or disp) + " 주가"
        news = []
        try:
            signal.alarm(25)
            news = D.google_news(q, limit=6)
            signal.alarm(0)
        except Exception:
            signal.alarm(0)
            fails += 1
            if fails % 20 == 0:
                time.sleep(30)          # 막히면 잠깐 쉬기
        if len(news) < 3:
            try:
                if yf is None:
                    import yfinance as yf  # noqa
                signal.alarm(20)
                news += D.parse_yf_news(yf.Ticker(s).news)
                signal.alarm(0)
            except Exception:
                signal.alarm(0)
        news = D._dedupe(news)[:6]
        if news:
            got += 1
            json.dump([dataclasses.asdict(n) for n in news], open(os.path.join(a.out, "n", fname(s) + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
        time.sleep(a.sleep)
        if i % 200 == 0:
            print(f"  {i}/{len(syms)} 뉴스 {got} 실패 {fails} ({time.time() - START:.0f}s)", flush=True)
    print("끝", got, fails)


if __name__ == "__main__":
    main()
