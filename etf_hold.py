"""🔬 내 돈 속 진짜 종목 — 10/23 A10/23-3 (사용자 「1,2,3 다 진행」)
   포트 설계기의 S&P500(SPY)·나스닥100(QQQ) 을 구성 종목까지 풀어 보기 위한 구성표 → archive/x/etf_hold.json
   (금(GLD)·현금(BIL)은 종목이 아니라 그대로 「금」「현금」)

   받는 곳 (앞에서 받으면 뒤는 안 감 · 숫자를 지어내지 않음 — 다 실패하면 옛 파일 그대로)
   · SPY : SSGA 공식 일일 구성표(xlsx) → iShares IVV(같은 S&P500 지수) CSV → 야후 상위 10
   · QQQ : Invesco 공식 구성표(CSV) → slickcharts 나스닥100 표 → 야후 상위 10
   종목마다 [티커, 이름, 비중%] · SPY 는 상위 120개 + 나머지 합, QQQ 는 전부(약 100개).
   하루 한 번이면 충분 — 파일 날짜가 오늘(KST)이면 건너뜀.
"""
import csv
import datetime as dt
import io
import json
import os
import re
import sys

import requests

OUT = os.path.join("archive", "x", "etf_hold.json")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Accept": "*/*", "Accept-Language": "en-US,en;q=0.9"}
KST = dt.timezone(dt.timedelta(hours=9))
TOPN = {"SPY": 120, "QQQ": 150}


def clean(rows):
    out, seen = [], set()
    for t, n, w in rows:
        t = re.sub(r"[^A-Z0-9.\-]", "", str(t or "").upper()).replace(".", "-") if t else ""
        try:
            w = float(str(w).replace("%", "").replace(",", ""))
        except Exception:
            continue
        if w <= 0 or not t or t in ("CASH", "USD", "-", "") or "CASH" in str(n).upper() and w < 1:
            continue
        if t in seen:
            continue
        seen.add(t)
        out.append([t, str(n or "").strip()[:40], round(w, 4)])
    out.sort(key=lambda r: -r[2])
    return out


def spy_ssga():
    import pandas as pd
    u = "https://www.ssga.com/us/en/intermediary/library-content/products/fund-data/etfs/us/holdings-daily-us-en-spy.xlsx"
    r = requests.get(u, headers=UA, timeout=40)
    r.raise_for_status()
    df = pd.read_excel(io.BytesIO(r.content), header=None)
    hi = next(i for i in range(min(15, len(df))) if "Ticker" in [str(x).strip() for x in df.iloc[i].tolist()])
    df.columns = [str(x).strip() for x in df.iloc[hi].tolist()]
    df = df.iloc[hi + 1:]
    asof = ""
    try:
        head = pd.read_excel(io.BytesIO(r.content), header=None, nrows=hi).astype(str).values.ravel().tolist()
        m = next((re.search(r"As of (\d{1,2}-\w{3}-\d{4})", x) for x in head if "As of" in x), None)
        if m:
            asof = dt.datetime.strptime(m.group(1), "%d-%b-%Y").strftime("%Y-%m-%d")
    except Exception:
        pass
    rows = clean([(t, n, w) for t, n, w in zip(df["Ticker"], df["Name"], df["Weight"])])
    return rows, "SSGA 공식 구성표", asof


def spy_ivv():
    u = "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf/1467271812596.ajax?fileType=csv&fileName=IVV_holdings&dataType=fund"
    r = requests.get(u, headers=UA, timeout=40)
    r.raise_for_status()
    txt = r.text
    lines = txt.splitlines()
    hi = next(i for i, l in enumerate(lines) if l.startswith("Ticker,"))
    asof = ""
    for l in lines[:hi]:
        m = re.search(r'As Of","?([A-Za-z]{3} \d{1,2}, \d{4})', l)
        if m:
            asof = dt.datetime.strptime(m.group(1), "%b %d, %Y").strftime("%Y-%m-%d")
    rd = csv.DictReader(io.StringIO("\n".join(lines[hi:])))
    rows = clean([(x.get("Ticker"), x.get("Name"), x.get("Weight (%)")) for x in rd if (x.get("Asset Class") or "Equity") == "Equity"])
    return rows, "iShares IVV 구성표(같은 S&P500 지수)", asof


def qqq_invesco():
    u = "https://www.invesco.com/us/financial-products/etfs/holdings/main/holdings/0?audienceType=Investor&action=download&ticker=QQQ"
    r = requests.get(u, headers=UA, timeout=40)
    r.raise_for_status()
    rd = csv.DictReader(io.StringIO(r.text.lstrip("﻿")))
    rows, asof = [], ""
    for x in rd:
        k = {str(a).strip(): b for a, b in x.items()}
        t = k.get("Holding Ticker") or k.get("Ticker")
        w = k.get("Weight") or k.get("Weight (%)")
        rows.append((t, k.get("Name") or k.get("Security Name"), w))
        asof = asof or str(k.get("Date") or "").strip()
    try:
        asof = dt.datetime.strptime(asof, "%m/%d/%Y").strftime("%Y-%m-%d")
    except Exception:
        asof = ""
    return clean(rows), "Invesco 공식 구성표", asof


def qqq_slick():
    r = requests.get("https://www.slickcharts.com/nasdaq100", headers=UA, timeout=40)
    r.raise_for_status()
    rows = []
    for m in re.finditer(r"<tr>\s*<td>\d+</td>\s*<td[^>]*><a[^>]*>([^<]+)</a></td>\s*<td[^>]*><a[^>]*>([^<]+)</a></td>\s*<td[^>]*>([\d.]+)%?</td>", r.text):
        rows.append((m.group(2), m.group(1), m.group(3)))
    return clean(rows), "slickcharts 나스닥100", ""


def yahoo_top(sym):
    import yfinance as yf
    th = yf.Ticker(sym).funds_data.top_holdings
    rows = [(i, th.loc[i].get("Name", i), float(th.loc[i].iloc[-1]) * 100) for i in th.index]
    return clean(rows), "야후 상위 10(그 밖은 「나머지」)", ""


def get(sym, fns):
    for f in fns:
        try:
            rows, src, asof = f()
            tot = sum(r[2] for r in rows)
            if len(rows) >= 10 and 40 <= tot <= 105 or (f is fns[-1] and len(rows) >= 5):
                print("✓", sym, f.__name__, len(rows), "종목 · 합", round(tot, 1), "%")
                return rows, src, asof
            print("✗", sym, f.__name__, "모양 이상", len(rows), round(tot, 1))
        except Exception as e:
            print("✗", sym, f.__name__, str(e)[:160])
    return None


def main():
    today = dt.datetime.now(KST).strftime("%Y-%m-%d")
    old = {}
    try:
        old = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        pass
    if old.get("date") == today and "--force" not in sys.argv:
        print("오늘 이미 받음 — 건너뜀"); return 0
    out = {"date": today, "updated": dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "etf": dict(old.get("etf") or {})}
    for sym, fns in (("SPY", [spy_ssga, spy_ivv, lambda: yahoo_top("SPY")]), ("QQQ", [qqq_invesco, qqq_slick, lambda: yahoo_top("QQQ")])):
        g = get(sym, fns)
        if not g:
            continue
        rows, src, asof = g
        tot = sum(r[2] for r in rows)
        top = rows[:TOPN[sym]]
        out["etf"][sym] = {"src": src, "asof": asof or today, "n": len(rows), "top": top,
                           "rest": round(max(0.0, 100.0 - sum(r[2] for r in top)), 3)}
    if not out["etf"]:
        print("구성표를 하나도 못 받음 — 옛 파일 그대로"); return 0
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("✓ etf_hold", {k: v["n"] for k, v in out["etf"].items()})
    return 0


if __name__ == "__main__":
    sys.exit(main())
