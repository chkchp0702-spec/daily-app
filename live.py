"""
나침반 장중판 (한국) — 장 시간에 10분마다 (live.yml)
  네이버 시세로 코스피·코스닥 전 종목 → 상승/하락 종목 수, 섹터·업종·테마 등락, 거래대금 상위
  → archive/x/live_kr.json  (그날 흐름은 snaps 에 쌓임)
  python live.py
"""
import csv
import datetime as dt
import io
import json
import os
import statistics
import time
import urllib.request
from collections import defaultdict

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
FORCE = os.environ.get("FORCE") == "1"     # 시험: 장 시간이 아니어도 돌려서 live_kr_test.json 에 쓰기
OUT = os.path.join("archive", "x", "live_kr_test.json" if FORCE else "live_kr.json")
H = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/", "Accept": "application/json"}
OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"
THEMES = "https://raw.githubusercontent.com/chkchp0702-spec/stock-screener/main/data/themes.csv"
SECTOR_KO = {
    "Technology": ("💻", "IT·기술"), "Financial Services": ("🏦", "금융"), "Healthcare": ("💊", "헬스케어"),
    "Consumer Cyclical": ("🛍️", "경기소비재"), "Consumer Defensive": ("🛒", "필수소비재"), "Industrials": ("🏭", "산업재"),
    "Communication Services": ("📡", "통신·미디어"), "Energy": ("🛢️", "에너지"), "Basic Materials": ("⛏️", "소재"),
    "Utilities": ("⚡", "유틸리티"), "Real Estate": ("🏢", "부동산"),
}
EPS = 0.05
import re
ETF = re.compile(r"^(KODEX|TIGER|KBSTAR|RISE|ACE|SOL|HANARO|KOSEF|ARIRANG|PLUS|TIMEFOLIO|KIWOOM|1Q|WON|BNK|마이티|히어로즈|TRUE|파워|UNICORN|VITA|FOCUS|ITF|DAISHIN|에셋플러스|KoAct|TREX|마이다스|흥국|파인|대신|신한|미래에셋|삼성|KB|하나|N2|QV|메리츠|키움|한투|IBK|유진|NH)\s")   # ±0.05% 이내 보합


def get(url, timeout=20, raw=False):
    req = urllib.request.Request(url, headers=H)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        t = r.read().decode("utf-8", errors="ignore")
    return t if raw else json.loads(t)


def num(v):
    try:
        return float(str(v).replace(",", ""))
    except Exception:
        return None


def fetch(mkt):
    rows, page, empty = [], 1, 0
    while page <= 60:
        try:
            items = get(f"https://m.stock.naver.com/api/stocks/marketValue/{mkt}?page={page}&pageSize=100").get("stocks") or []
        except Exception:
            items = []
        if not items:
            empty += 1
            if empty >= 2:
                break
            page += 1
            time.sleep(0.5)
            continue
        empty = 0
        for x in items:
            if (x.get("stockEndType") and x["stockEndType"] != "stock") or ETF.match(x.get("stockName") or "") or "ETN" in (x.get("stockName") or ""):
                continue
            rows.append({"c": x.get("itemCode"), "n": x.get("stockName"), "p": num(x.get("closePriceRaw") or x.get("closePrice")),
                         "r": num(x.get("fluctuationsRatio")), "v": num(x.get("accumulatedTradingValueRaw")) or 0,
                         "cap": num(x.get("marketValueRaw")) or (num(x.get("marketValue")) or 0) * 1e8, "m": "KQ" if mkt == "KOSDAQ" else "KS"})
        page += 1
        time.sleep(0.2)
    return rows


def index(code):
    j = get(f"https://m.stock.naver.com/api/index/{code}/basic")
    return {"name": {"KOSPI": "코스피", "KOSDAQ": "코스닥"}[code], "last": num(j.get("closePrice")), "chg": num(j.get("fluctuationsRatio")),
            "status": j.get("marketStatus")}


def wavg(items):
    tw = sum(x["cap"] for x in items)
    return sum(x["r"] * x["cap"] for x in items) / tw if tw > 0 else statistics.median([x["r"] for x in items])


def st(x):
    return {"s": x["c"] + "." + x["m"], "n": x["n"], "r": round(x["r"], 2), "p": x["p"]}


def main():
    hm = NOW.hour * 100 + NOW.minute
    if not FORCE and (NOW.weekday() >= 5 or not (900 <= hm <= 1545)):
        print("장 시간 아님")
        return
    ix = [index("KOSPI"), index("KOSDAQ")]
    old = {}
    try:
        old = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        pass
    if not FORCE and ix[0]["status"] and ix[0]["status"] != "OPEN" and not (1530 <= hm <= 1545 and old.get("date") == NOW.strftime("%Y-%m-%d")):
        print("한국 장이 열리지 않음", ix[0]["status"])
        return
    rows = [x for x in fetch("KOSPI") + fetch("KOSDAQ") if x["c"] and x["r"] is not None and x["p"]]
    if len(rows) < 500:
        print("종목이 너무 적음", len(rows))
        return
    # 우선주·스팩 빼기
    rows = [x for x in rows if not (x["n"] or "").endswith(("우", "우B", "우C")) and "스팩" not in (x["n"] or "")]
    up = sum(1 for x in rows if x["r"] > EPS)
    dn = sum(1 for x in rows if x["r"] < -EPS)
    meta = {}
    try:
        sec = get(OPD + "sec.json", timeout=60)
        for k, v in sec.items():
            if k.endswith((".KS", ".KQ")) and isinstance(v, list):
                meta[k[:6]] = v
    except Exception as e:
        print("섹터 목록 실패", e)
    by_s, by_i = defaultdict(list), defaultdict(list)
    for x in rows:
        m = meta.get(x["c"])
        if m:
            if m[0] in SECTOR_KO:
                by_s[m[0]].append(x)
            if m[1]:
                by_i[m[1]].append(x)
    sectors = []
    for k, items in by_s.items():
        if len(items) >= 5:
            big = sorted(items, key=lambda x: -x["cap"])
            sectors.append({"k": k, "icon": SECTOR_KO[k][0], "name": SECTOR_KO[k][1], "n": len(items), "r": round(wavg(items), 2),
                            "up": sum(1 for x in items if x["r"] > EPS), "down": sum(1 for x in items if x["r"] < -EPS),
                            "big": [st(x) for x in big[:3]]})
    sectors.sort(key=lambda x: -x["r"])
    inds = []
    for k, items in by_i.items():
        if len(items) >= 5:
            lead = sorted(items, key=lambda x: -(x["cap"] * x["r"]))
            inds.append({"name": k, "n": len(items), "r": round(wavg(items), 2), "cap": sum(x["cap"] for x in items),
                         "up": sum(1 for x in items if x["r"] > EPS), "down": sum(1 for x in items if x["r"] < -EPS), "lead": [st(x) for x in lead[:3]]})
    inds.sort(key=lambda x: -x["cap"])
    pool = sorted(inds[: max(15, int(len(inds) * 0.6))], key=lambda x: -x["r"])
    for x in pool:
        x.pop("cap", None)
    # 테마 (단타 프로그램의 테마 목록)
    themes = []
    try:
        byc = {x["c"]: x for x in rows}
        g = defaultdict(list)
        for r in csv.DictReader(io.StringIO(get(THEMES, raw=True).lstrip("﻿"))):
            if r.get("kind") == "theme" and r.get("code") in byc:
                g[r["group"]].append(byc[r["code"]])
        for k, items in g.items():
            if len(items) >= 4:
                rs = sorted(items, key=lambda x: -x["r"])
                themes.append({"name": k, "n": len(items), "r": round(statistics.mean(x["r"] for x in items), 2),
                               "up3": sum(1 for x in items if x["r"] >= 3), "lead": [st(x) for x in rs[:3]]})
        themes.sort(key=lambda x: -x["r"])
    except Exception as e:
        print("테마 실패", e)
    tv = sorted(rows, key=lambda x: -x["v"])[:12]
    t = NOW.strftime("%H:%M")
    snaps = old.get("snaps", []) if old.get("date") == NOW.strftime("%Y-%m-%d") else []
    snaps = [s for s in snaps if s[0] != t] + [[t, up, dn, ix[0]["chg"], ix[1]["chg"]]]
    out = {"date": NOW.strftime("%Y-%m-%d"), "t": t, "total": len(rows), "up": up, "down": dn, "flat": len(rows) - up - dn,
           "median": round(statistics.median(x["r"] for x in rows), 2), "limit_up": sum(1 for x in rows if x["r"] >= 29.5),
           "limit_dn": sum(1 for x in rows if x["r"] <= -29.5), "index": ix, "sectors": sectors, "strong": pool[:6],
           "weak": list(reversed(pool[-4:])) if len(pool) > 10 else [], "themes": themes[:8], "themes_weak": list(reversed(themes[-3:])) if len(themes) > 10 else [],
           "value": [dict(st(x), v=round(x["v"] / 1e8)) for x in tv], "snaps": snaps,
           "movers": [st(x) for x in sorted([x for x in rows if x["cap"] >= 1e12], key=lambda x: -x["r"])[:8]]}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("장중 나침반", t, f"상승 {up} 하락 {dn}", len(sectors), len(pool), len(themes))


if __name__ == "__main__":
    main()
