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
    # 같은 업종 비교용: (시장, 업종) → 회사 목록
    nk = {}
    try:
        nk = json.load(open(os.path.join(a.dest, "names_ko.json"), encoding="utf-8"))
    except Exception:
        pass
    groups = {}
    for f in files:
        try:
            r = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        t = r.get("ticker") or {}
        ind = r.get("industry")
        if not ind or not r.get("market_cap"):
            continue
        fin = [y for y in (r.get("financials") or []) if y.get("revenue")]
        g = om = None
        if len(fin) >= 2 and fin[-2]["revenue"]:
            g = fin[-1]["revenue"] / fin[-2]["revenue"] - 1
        if fin and fin[-1].get("operating_income") is not None:
            om = fin[-1]["operating_income"] / fin[-1]["revenue"]
        name = nk.get(t.get("symbol")) if t.get("market") != "KR" else None
        groups.setdefault((t.get("market"), ind), []).append({"sym": t.get("symbol"), "name": name or t.get("name") or t.get("symbol"),
            "cap": r.get("market_cap"), "pe": r.get("pe"), "g": g, "om": om, "cur": r.get("currency")})
    for k in groups:
        groups[k].sort(key=lambda x: -(x["cap"] or 0))
    print("업종 그룹", len(groups))

    def peers_of(raw):
        t = raw.get("ticker") or {}
        gl = groups.get((t.get("market"), raw.get("industry"))) or []
        top = gl[:5]
        if not any(x["sym"] == t.get("symbol") for x in top):
            me = next((x for x in gl if x["sym"] == t.get("symbol")), None)
            if me:
                top = top[:4] + [me]
        return top

    ok = bad = 0
    for i, f in enumerate(files):
        try:
            raw = json.load(open(f, encoding="utf-8"))
            ef = os.path.join(a.dest, "e", os.path.basename(f))
            if os.path.exists(ef):
                ex = json.load(open(ef, encoding="utf-8"))
                raw["estimates"], raw["ltg"] = ex.get("estimates", []), ex.get("ltg")
                if ex.get("cal"):
                    raw["calendar"] = ex["cal"]
            nf = os.path.join(a.dest, "n", os.path.basename(f))
            if os.path.exists(nf):
                raw["news"] = json.load(open(nf, encoding="utf-8"))
            kf = os.path.join(a.dest, "k", os.path.basename(f))
            if os.path.exists(kf):
                raw["desc_ko"] = json.load(open(kf, encoding="utf-8")).get("desc_ko") or raw.get("desc_ko", "")
            d = load(raw)
            html = render(d, rule_based(d), fx=fx, peers=peers_of(raw)).replace(CSS, "")
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
    # ETF 리포트도 다시 그리기 (x/*.json)
    from onepager.etf import render_etf
    import re as _re
    # 한국 ETF 중 해외 주식을 담아 비중이 '-' 인 것 → 같은 지수를 따르는 미국 ETF 비중으로
    PROXY = [(r"필라델피아|PHLX|미국\s*반도체", "SOXX"), (r"배당\s*다우존스|Dividend\s*100", "SCHD"),
             (r"다우존스\s*30|다우존스\s*산업|Dow Jones Industrial", "DIA"), (r"FANG|팡플러스", "FNGS"),
             (r"러셀\s*2000|Russell\s*2000", "IWM"), (r"나스닥\s*100|NASDAQ[\s-]*100", "QQQ"),
             (r"S&P\s*500|S&P500|에스앤피500", "IVV"), (r"MSCI\s*World|선진국", "URTH"), (r"차이나|CSI\s*300|중국", "ASHR"),
             (r"인도|Nifty|India", "INDA"), (r"일본|닛케이|TOPIX|Nikkei", "EWJ"), (r"베트남|Vietnam", "VNM")]
    xdir = os.path.join(a.dest, "x")
    US_IDX = [(r"Semiconductor", "SOXX"), (r"Nasdaq|QQQ", "QQQ"), (r"S&P\s*500|S&P500", "IVV"), (r"Technology|\bTech\b", "XLK"),
              (r"Russell\s*2000|Small\s*Cap", "IWM"), (r"Dow\s*30|Dow Jones", "DIA"), (r"Financial", "XLF"), (r"Energy|Oil\s*&\s*Gas", "XLE"),
              (r"Biotech", "XBI"), (r"Gold Miners", "GDX"), (r"Homebuilder", "XHB"), (r"Regional Bank", "KRE"), (r"Health\s*Care|Healthcare", "XLV"),
              (r"Real Estate", "XLRE"), (r"China|FTSE China", "FXI"), (r"Fang|FANG", "FNGS")]
    ONE = {"Tesla": "TSLA", "NVIDIA": "NVDA", "Apple": "AAPL", "Microsoft": "MSFT", "Amazon": "AMZN", "Meta": "META", "Alphabet": "GOOGL",
           "Google": "GOOGL", "AMD": "AMD", "Coinbase": "COIN", "MicroStrategy": "MSTR", "Strategy": "MSTR", "Palantir": "PLTR", "Netflix": "NFLX",
           "Broadcom": "AVGO", "Micron": "MU", "Super Micro": "SMCI", "Rivian": "RIVN", "Uber": "UBER", "Robinhood": "HOOD", "IonQ": "IONQ"}
    LEV = r"\b[1-9](\.\d)?[Xx]\b|Bull|Bear|Ultra|Leveraged|Inverse|Short|Daily"

    def proxy_for(x):
        hs = x.get("holdings") or []
        if x.get("mkt") == "US":
            en = (x.get("name_en") or x.get("name") or "")
            if not _re.search(LEV, en):
                return None
            swap = any("SWAP" in (h.get("name") or "").upper() for h in hs) or sum(h.get("w") or 0 for h in hs) > 110 or not any(h.get("w") for h in hs)
            if not swap:
                return None
            m = _re.search(r"([1-9](?:\.\d)?)[Xx]", en)
            mult = (m.group(1) + "배") if m else "3배" if "UltraPro" in en else "2배" if "Ultra" in en else "몇 배"
            inv = bool(_re.search(r"Bear|Inverse|Short", en))
            for k, t in ONE.items():
                if _re.search(r"\b(" + _re.escape(k) + "|" + t + r")\b", en):
                    note = f"이 ETF는 <b>{nk.get(t, t)}</b> 한 종목을 스왑 계약으로 하루 {'반대로 ' if inv else ''}{mult} 따라가요."
                    return "", {"holdings": [{"code": t, "name": nk.get(t, t), "w": 100.0}]}, note
            for pat, t in US_IDX:
                if _re.search(pat, en, _re.I):
                    pf = os.path.join(xdir, t + ".json")
                    if os.path.exists(pf):
                        px_ = json.load(open(pf, encoding="utf-8"))
                        if any(h.get("w") for h in px_.get("holdings") or []):
                            note = (f"레버리지·인버스 ETF는 주식 대신 <b>스왑 계약</b>으로 지수를 하루 {'반대로 ' if inv else ''}{mult} 따라가요. "
                                    f"그래서 실제 담고 있는 건 스왑·현금이고, 위 그림은 기초 지수(=<b>{t}</b>) 구성이에요.")
                            return t, px_, note
            return None
        if x.get("mkt") != "KR" or any(h.get("w") for h in hs):
            return None
        txt = (x.get("name") or "") + " " + (x.get("index") or "")
        for pat, t in PROXY:
            if _re.search(pat, txt, _re.I):
                pf = os.path.join(xdir, t + ".json")
                if os.path.exists(pf):
                    px_ = json.load(open(pf, encoding="utf-8"))
                    if any(h.get("w") for h in px_.get("holdings") or []):
                        return t, px_, (f"이 ETF는 운용사가 비중을 공개하지 않아서, <b>같은 지수를 따르는 미국 ETF {t}</b>의 비중으로 보여줘요. 실제와 조금 다를 수 있어요.")
        return None
    eo = eb = 0
    for f in glob.glob(os.path.join(a.dest, "x", "*.json")):
        try:
            x = json.load(open(f, encoding="utf-8"))
            pr = proxy_for(x)
            if pr:
                t, px_, note = pr
                x["holdings_own"] = x.get("holdings")
                x["holdings"] = [dict(h, name=(nk.get(h.get("code")) or h["name"])) for h in px_["holdings"]]
                x["hold_proxy"] = t or "—"
                x["hold_note"] = note
                if not x.get("sectors"):
                    x["sectors"] = px_.get("sectors") or []
            with open(os.path.join(a.dest, "s", os.path.basename(f)[:-5] + ".html"), "w", encoding="utf-8") as fh:
                fh.write(render_etf(x, fx))
            eo += 1
        except Exception as e:
            eb += 1
            if eb < 5:
                print("ETF 실패", f, e)
    print("ETF", eo, "실패", eb)
    with open(os.path.join(a.dest, "op.css"), "w", encoding="utf-8") as fh:
        fh.write(CSS)
    print("끝: 성공", ok, "실패", bad)


if __name__ == "__main__":
    main()
