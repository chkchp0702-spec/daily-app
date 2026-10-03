"""
원페이지 리포트를 미리 만들어 둔다 (가격·차트는 앱에서 매일 붙임).
  python opdb/build_static.py --shard 3 --of 20 --out out --meta meta.json [--max N] [--days 30]
  - 이 묶음(shard)에 속하는 종목 중, 만든 지 --days 일이 지났거나 없는 것만 만든다.
결과: out/s/<심볼>.html, out/meta_<shard>.json
"""
import argparse, datetime as dt, json, os, signal, sys, time

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
sys.path.insert(0, os.path.dirname(__file__))
from common import universe, fname, fnv  # noqa: E402

from onepager.models import Ticker  # noqa: E402
from onepager import data as D  # noqa: E402
from onepager.narrative import rule_based  # noqa: E402
from onepager.render import render, CSS  # noqa: E402
from onepager.resolver import ALIASES  # noqa: E402

KO_NAME = {}
for _k, (_sym, _disp, _m) in ALIASES.items():
    KO_NAME.setdefault(_sym, _disp)

START = time.time()
BUDGET = 5 * 3600 + 15 * 60   # GitHub 6시간 제한 전에 멈춤


class Timeout(Exception):
    pass


def _alarm(*_):
    raise Timeout()


def build_one(sym, name, mkt):
    import yfinance as yf
    t = yf.Ticker(sym)
    info = t.info or {}
    if not D._has_price(info):
        raise LookupError("no price")
    disp = KO_NAME.get(sym)
    if not disp:
        if mkt in ("US", "JP", "HK") or not name or name == sym or name.startswith("TSE"):
            disp = info.get("shortName") or info.get("longName") or name or sym
        else:
            disp = name          # 한국·중국은 목록의 한글·한자 이름 그대로
    tk = Ticker(symbol=sym, name=disp, market=mkt)
    d = D.parse_info(tk, info)
    d.financials = D._safe(lambda: D.parse_income_stmt(t.income_stmt), [])
    D._safe(lambda: D.parse_recommendations(t.recommendations, d.analyst), None)
    D._safe(lambda: D.parse_upgrades(t.upgrades_downgrades, d.analyst), None)
    d.news = D._safe(lambda: D.google_news(D._news_query(tk, info), limit=6), [])
    d.as_of = dt.date.today().isoformat()
    html = render(d, rule_based(d)).replace(CSS, "")
    long_name = info.get("longName") or info.get("shortName") or ""
    return disp, long_name, html


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shard", type=int, required=True)
    ap.add_argument("--of", type=int, required=True)
    ap.add_argument("--out", default="out")
    ap.add_argument("--meta", default="")
    ap.add_argument("--max", type=int, default=0)
    ap.add_argument("--days", type=int, default=30)
    a = ap.parse_args()

    meta = json.load(open(a.meta)) if a.meta and os.path.exists(a.meta) else {}
    cut = (dt.date.today() - dt.timedelta(days=a.days)).isoformat()
    todo = [(s, n, m) for s, n, m in universe(os.path.join("_src", "Cup"))
            if fnv(s) % a.of == a.shard and (s not in meta or meta[s][2] < cut)]
    todo.sort(key=lambda x: meta.get(x[0], ["", "", ""])[2])          # 오래된 것부터
    if a.max:
        todo = todo[: a.max]
    print(f"shard {a.shard}/{a.of}: {len(todo)}개", flush=True)

    os.makedirs(os.path.join(a.out, "s"), exist_ok=True)
    out_meta, ok, fail, slow = {}, 0, 0, 0.0
    signal.signal(signal.SIGALRM, _alarm)
    for i, (sym, name, mkt) in enumerate(todo):
        if time.time() - START > BUDGET:
            print("시간 예산 소진 — 중단", flush=True)
            break
        for attempt in range(2):
            try:
                signal.alarm(45)
                disp, long_name, html = build_one(sym, name, mkt)
                signal.alarm(0)
                with open(os.path.join(a.out, "s", fname(sym) + ".html"), "w", encoding="utf-8") as f:
                    f.write(html)
                out_meta[sym] = [disp, mkt, dt.date.today().isoformat(), long_name]
                ok += 1
                break
            except Exception as e:
                signal.alarm(0)
                msg = str(e)
                if ("Too Many" in msg or "429" in msg or "Rate" in msg) and attempt == 0:
                    slow = min(slow + 1.0, 5.0)
                    print("속도 제한 — 60초 대기", flush=True)
                    time.sleep(60)
                    continue
                fail += 1
                # 실패한 종목도 기록해서 매일 다시 시도하지 않게 (7일 뒤 재시도)
                retry = (dt.date.today() - dt.timedelta(days=max(a.days - 7, 0))).isoformat()
                out_meta[sym] = [name, mkt, retry, "", "x"]
                break
        if slow:
            time.sleep(slow)
        if i % 50 == 0:
            print(f"  {i}/{len(todo)} 성공 {ok} 실패 {fail} ({time.time() - START:.0f}s)", flush=True)
    json.dump(out_meta, open(os.path.join(a.out, f"meta_{a.shard}.json"), "w"), ensure_ascii=False)
    with open(os.path.join(a.out, "op.css"), "w", encoding="utf-8") as f:
        f.write(CSS)
    print(f"끝: 성공 {ok} 실패 {fail}", flush=True)


if __name__ == "__main__":
    main()
