"""
저장해 둔 원본 데이터(d/*.json)로 리포트(s/*.html)만 다시 그린다 — 야후 호출 없음.
  python opdb/rerender.py --dest opdata
리포트 디자인(render.py)만 바꿨을 때 몇 분 만에 전체를 새로 만든다.
"""
import argparse, glob, json, os, sys

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
from onepager.models import AnalystView, FinancialYear, NewsItem, StockData, Ticker  # noqa: E402
from onepager.narrative import rule_based  # noqa: E402
from onepager.render import render, CSS  # noqa: E402


def load(raw):
    t = Ticker(**raw["ticker"])
    a = AnalystView(**raw["analyst"])
    fin = [FinancialYear(**f) for f in raw.get("financials", [])]
    news = [NewsItem(**n) for n in raw.get("news", [])]
    rest = {k: v for k, v in raw.items() if k not in ("ticker", "analyst", "financials", "news", "price_history")}
    d = StockData(ticker=t, analyst=a, financials=fin, news=news, **rest)
    d.price_history = [tuple(x) for x in raw.get("price_history", [])]
    return d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", required=True)
    a = ap.parse_args()
    files = glob.glob(os.path.join(a.dest, "d", "*.json"))
    fxp = os.path.join(a.dest, "p", "fx.json")
    fx = json.load(open(fxp)) if os.path.exists(fxp) else None
    print("환율", fx)
    ok = bad = 0
    for i, f in enumerate(files):
        try:
            raw = json.load(open(f, encoding="utf-8"))
            ef = os.path.join(a.dest, "e", os.path.basename(f))
            if os.path.exists(ef):
                ex = json.load(open(ef, encoding="utf-8"))
                raw["estimates"], raw["ltg"] = ex.get("estimates", []), ex.get("ltg")
            nf = os.path.join(a.dest, "n", os.path.basename(f))
            if os.path.exists(nf):
                raw["news"] = json.load(open(nf, encoding="utf-8"))
            d = load(raw)
            html = render(d, rule_based(d), fx=fx).replace(CSS, "")
            out = os.path.join(a.dest, "s", os.path.basename(f)[:-5] + ".html")
            with open(out, "w", encoding="utf-8") as fh:
                fh.write(html)
            ok += 1
        except Exception as e:
            bad += 1
            if bad < 5:
                print("실패", f, e)
        if i % 2000 == 0:
            print(i, "/", len(files), flush=True)
    with open(os.path.join(a.dest, "op.css"), "w", encoding="utf-8") as fh:
        fh.write(CSS)
    print("끝: 성공", ok, "실패", bad)


if __name__ == "__main__":
    main()
