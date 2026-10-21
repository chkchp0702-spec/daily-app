"""🇧🇷 브라질 국채 실시간 금리 — archive/x/brl_live.json (10/21 사용자 「달러표시 브라질국채도 다른 것들과 똑같이 넣어 · 구분해서 · 실시간 금리 잘 반영」)

자료 (로그인 없이 공개):
  ① 달러표시 브라질 국채(글로벌본드, CUSIP 105756) 전 종목 — TradingView 채권 스캐너(scanner.tradingview.com/bond/scan)
     · 같은 ISIN 이 여러 거래소(BONDS.com 실시간 · 룩셈부르크 · 프랑크푸르트 · 슈투트가르트 · EuroTLX 15분 지연)에 있으면
       실시간(BONDSCOM) 값을 쓰고, 없으면 거래소 값의 가운데(중앙값). 숫자는 받은 그대로.
  ② 미국 국채 수익률 곡선(재무부 일일) → 같은 만기 미국채보다 몇 %p 더 주는지(가산금리)
  ③ 헤알 국채 10년 · 미국 10년 · 헤알/달러 · 원/달러 — CNBC 시세(장중 실시간)
  ④ 하루 한 점씩 흐름(hist) — 400일
평일 20분마다(brl_live.yml). 못 받은 칸은 errors 에 남기고 지난 값을 유지.
"""
import datetime, json, os, re, statistics, sys
import requests

OUT = os.path.join("archive", "x", "brl_live.json")
KST = datetime.timezone(datetime.timedelta(hours=9))
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"})
ERR = []
RANK = {"BONDSCOM": 0, "LUXSE": 2, "FWB": 3, "SWB": 3, "EUROTLX": 3, "BER": 4, "MUN": 4, "DUS": 4, "HAM": 4}


def tv_bonds():
    cols = ["name", "description", "close", "yield_to_maturity", "maturity_date", "exchange", "update_mode", "change"]
    r = S.post("https://scanner.tradingview.com/bond/scan", timeout=40,
               json={"filter": [{"left": "name", "operation": "match", "right": "US105756"}], "columns": cols, "range": [0, 300]})
    r.raise_for_status()
    rows = r.json().get("data") or []
    by = {}
    today = int(datetime.date.today().strftime("%Y%m%d"))
    for x in rows:
        d = dict(zip(cols, x["d"]))
        isin = (d["name"] or "")[:12]
        if len(isin) != 12 or not d.get("maturity_date") or d["maturity_date"] <= today:
            continue
        if d.get("close") is None or d.get("yield_to_maturity") is None:
            continue
        if not (20 < d["close"] < 200 and -5 < d["yield_to_maturity"] < 30):
            continue
        by.setdefault(isin, []).append(d)
    out = []
    for isin, qs in by.items():
        desc = qs[0]["description"] or ""
        m = re.search(r"([\d.]+)%", desc)
        cpn = float(m.group(1)) if m else None
        qs.sort(key=lambda q: RANK.get(q["exchange"], 5))
        live = [q for q in qs if q.get("update_mode") == "streaming"]
        if live:
            q = live[0]; px, y, src = q["close"], q["yield_to_maturity"], q["exchange"] + " 실시간"
        else:
            px = statistics.median(q["close"] for q in qs); y = statistics.median(q["yield_to_maturity"] for q in qs)
            src = "거래소 " + str(len(qs)) + "곳 가운데값 · 15분 지연"
        md = str(qs[0]["maturity_date"])
        mat = f"{md[:4]}-{md[4:6]}-{md[6:8]}"
        out.append({"isin": isin, "name": desc.replace("Government of Brazil", "브라질").strip(), "cpn": cpn, "mat": mat,
                    "px": round(px, 3), "ytm": round(y, 3), "src": src, "n": len(qs),
                    "chg": next((q.get("change") for q in qs if q.get("change") is not None), None)})
    if not out:
        raise RuntimeError("TradingView 브라질 달러채 0개")
    out.sort(key=lambda x: x["mat"])
    return out


def ust_curve():
    y = datetime.date.today().year
    u = f"https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/{y}/all?type=daily_treasury_yield_curve&field_tdr_date_value={y}&page&_format=csv"
    TEN = {"1 Mo": 1/12, "3 Mo": .25, "6 Mo": .5, "1 Yr": 1, "2 Yr": 2, "3 Yr": 3, "5 Yr": 5, "7 Yr": 7, "10 Yr": 10, "20 Yr": 20, "30 Yr": 30}
    t = S.get(u, timeout=40).text.strip().splitlines()
    hd = [h.strip('"') for h in t[0].split(",")]
    for ln in t[1:]:
        c = ln.split(",")
        pts = sorted((TEN[h], float(v)) for h, v in zip(hd[1:], c[1:]) if h in TEN and v.strip() not in ("", "N/A"))
        if len(pts) >= 6:
            m, d, yy = c[0].split("/")
            return f"{yy}-{m}-{d}", pts
    raise RuntimeError("재무부 곡선 없음")


def interp(pts, t):
    if t <= pts[0][0]: return pts[0][1]
    if t >= pts[-1][0]: return pts[-1][1]
    for (a, ya), (b, yb) in zip(pts, pts[1:]):
        if a <= t <= b: return ya + (yb - ya) * (t - a) / (b - a)


def cnbc():
    syms = ["BR10Y", "US10Y", "BRL=", "KRW="]
    r = S.get("https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol", timeout=30,
              params={"symbols": "|".join(syms), "requestMethod": "itv", "noform": "0", "partnerId": "2", "fund": "1", "exthrs": "1", "output": "json", "events": "1"})
    q = r.json()["FormattedQuoteResult"]["FormattedQuote"]
    f = lambda s: float(str(s).replace("%", "").replace(",", "").replace("+", "")) if s not in (None, "", "UNCH") else None
    out = {}
    for x in q:
        out[x["symbol"]] = {"v": f(x.get("last")), "chg": f(x.get("change")), "t": x.get("last_time"), "mat": x.get("maturity_date"), "cpn": x.get("coupon")}
    return out


def main():
    old = {}
    try:
        old = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        pass
    now = datetime.datetime.now(KST)
    D = {"at": now.strftime("%Y-%m-%d %H:%M"), "usd": old.get("usd") or [], "q": old.get("q") or {}, "curve": old.get("curve"), "hist": old.get("hist") or {}}
    try:
        D["usd"] = tv_bonds(); D["usd_at"] = D["at"]
    except Exception as e:
        ERR.append(f"달러채: {str(e)[:100]}")
    try:
        cd, pts = ust_curve(); D["curve"] = cd
        for x in D["usd"]:
            t = max(0.05, (datetime.date.fromisoformat(x["mat"]) - now.date()).days / 365.25)
            u = interp(pts, t); x["ust"] = round(u, 3); x["sp"] = round(x["ytm"] - u, 3)
        # 헤알 표시 글로벌본드(예: 10.25% 2028 — 헤알로 정해지고 달러로 지급)는 금리가 헤알 수준이라 달러채에서 뺀다
        D["usd"] = [x for x in D["usd"] if x.get("sp") is None or x["sp"] < 4]
    except Exception as e:
        ERR.append(f"미국채 곡선: {str(e)[:100]}")
    try:
        q = cnbc(); D["q"] = q; D["q_at"] = D["at"]
        if q.get("BRL=", {}).get("v") and q.get("KRW=", {}).get("v"):
            D["brlkrw"] = round(q["KRW="]["v"] / q["BRL="]["v"], 2)
    except Exception as e:
        ERR.append(f"CNBC: {str(e)[:100]}")
    # 하루 한 점 — 10년 근처 달러채(가산금리 포함) · 헤알 10년
    bm = min(D["usd"], key=lambda x: abs((datetime.date.fromisoformat(x["mat"]) - now.date()).days / 365.25 - 10), default=None)
    day = now.strftime("%Y-%m-%d")
    h = D["hist"].get(day, {})
    if bm: h.update({"usd10": bm["ytm"], "sp10": bm.get("sp"), "bm": bm["name"]})
    if (D["q"].get("BR10Y") or {}).get("v") is not None: h["brl10"] = D["q"]["BR10Y"]["v"]
    if D.get("brlkrw"): h["fx"] = D["brlkrw"]
    if h: D["hist"][day] = h
    cut = (now - datetime.timedelta(days=400)).strftime("%Y-%m-%d")
    D["hist"] = {k: v for k, v in sorted(D["hist"].items()) if k >= cut}
    D["errors"] = ERR
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(D, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"브라질 달러채 {len(D['usd'])}개 · 오류 {ERR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
