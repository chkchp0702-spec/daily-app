"""
나침반 장중판 — 일본·중국·홍콩 (live.yml, 30분마다)
  야후 일봉(장중엔 마지막 봉이 실시간에 가깝게 바뀜, 약 15분 늦음)으로 시가총액 큰 500종목
  → archive/x/live_jp.json / live_cn.json / live_hk.json
  python live_world.py            (장 열린 시장만)
  FORCE=1 python live_world.py    (시험: 셋 다 → live_*_test.json)
"""
import datetime as dt
import json
import os
import statistics
import urllib.request
from collections import defaultdict

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
FORCE = os.environ.get("FORCE") == "1"
OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"
N = 500
EPS = 0.05
# 장 시간 (한국 시간, 점심 휴장은 무시) · 대표 지수 · 통화
MK = {
    "JP": {"open": 900, "close": 1530, "suffix": (".T",), "index": [("^N225", "닛케이 225"), ("^TOPX", "토픽스")], "cur": "엔", "name": "일본", "flag": "🇯🇵"},
    "CN": {"open": 1030, "close": 1600, "suffix": (".SS", ".SZ"), "index": [("000001.SS", "상해종합"), ("399001.SZ", "선전성분")], "cur": "위안", "name": "중국", "flag": "🇨🇳"},
    "HK": {"open": 1030, "close": 1710, "suffix": (".HK",), "index": [("^HSI", "항셍")], "cur": "홍콩달러", "name": "홍콩", "flag": "🇭🇰"},
}
SECTOR_KO = {
    "Technology": ("💻", "IT·기술"), "Financial Services": ("🏦", "금융"), "Healthcare": ("💊", "헬스케어"),
    "Consumer Cyclical": ("🛍️", "경기소비재"), "Consumer Defensive": ("🛒", "필수소비재"), "Industrials": ("🏭", "산업재"),
    "Communication Services": ("📡", "통신·미디어"), "Energy": ("🛢️", "에너지"), "Basic Materials": ("⛏️", "소재"),
    "Utilities": ("⚡", "유틸리티"), "Real Estate": ("🏢", "부동산"),
}


def get(url, timeout=60):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def wavg(items):
    tw = sum(x["cap"] for x in items)
    return sum(x["r"] * x["cap"] for x in items) / tw if tw > 0 else statistics.median([x["r"] for x in items])


def st(x):
    return {"s": x["c"], "n": x["n"], "r": round(x["r"], 2), "p": x["p"]}


def run(mk, sec, names):
    import yfinance as yf
    import pandas as pd
    cfg = MK[mk]
    hm = NOW.hour * 100 + NOW.minute
    out_p = os.path.join("archive", "x", f"live_{mk.lower()}{'_test' if FORCE else ''}.json")
    old = {}
    try:
        old = json.load(open(out_p, encoding="utf-8"))
    except Exception:
        pass
    if not FORCE and (NOW.weekday() >= 5 or not (cfg["open"] <= hm <= cfg["close"] + 15)):
        print(mk, "장 시간 아님")
        return
    cand = sorted([(s, v) for s, v in sec.items() if s.endswith(cfg["suffix"]) and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1][2])[:N]
    syms = [s for s, _ in cand]
    ix_syms = [s for s, _ in cfg["index"]]
    df = yf.download(syms + ix_syms, period="5d", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
    today = NOW.date()
    rows, ix = [], []
    for s, v in cand:
        try:
            sub = df[s][["Close", "Volume"]].dropna(subset=["Close"])
            if len(sub) < 2:
                continue
            if not FORCE and sub.index[-1].date() != today:
                continue                                    # 오늘 봉이 없음 (휴장 또는 아직 시작 전)
            c, p = float(sub["Close"].iloc[-1]), float(sub["Close"].iloc[-2])
            rows.append({"c": s, "n": names.get(s, s), "p": round(c, 3), "r": (c / p - 1) * 100, "v": c * float(sub["Volume"].iloc[-1] or 0),
                         "cap": v[2] or 0, "sec": v[0], "ind": v[1]})
        except Exception:
            continue
    for s, nm in cfg["index"]:
        try:
            sub = df[s]["Close"].dropna()
            ix.append({"name": nm, "last": round(float(sub.iloc[-1]), 2), "chg": round((float(sub.iloc[-1]) / float(sub.iloc[-2]) - 1) * 100, 2),
                       "date": sub.index[-1].strftime("%Y-%m-%d")})
        except Exception:
            pass
    if len(rows) < 50:
        print(mk, "오늘 자료가 적음 (휴장?)", len(rows))
        return
    up = sum(1 for x in rows if x["r"] > EPS)
    dn = sum(1 for x in rows if x["r"] < -EPS)
    by_s, by_i = defaultdict(list), defaultdict(list)
    for x in rows:
        if x["sec"] in SECTOR_KO:
            by_s[x["sec"]].append(x)
        if x["ind"]:
            by_i[x["ind"]].append(x)
    sectors = []
    for k, items in by_s.items():
        if len(items) >= 3:
            big = sorted(items, key=lambda x: -x["cap"])
            sectors.append({"k": k, "icon": SECTOR_KO[k][0], "name": SECTOR_KO[k][1], "n": len(items), "r": round(wavg(items), 2),
                            "up": sum(1 for x in items if x["r"] > EPS), "down": sum(1 for x in items if x["r"] < -EPS), "big": [st(x) for x in big[:3]]})
    sectors.sort(key=lambda x: -x["r"])
    inds = []
    for k, items in by_i.items():
        if len(items) >= 4:
            lead = sorted(items, key=lambda x: -(x["cap"] * x["r"]))
            inds.append({"name": k, "n": len(items), "r": round(wavg(items), 2), "up": sum(1 for x in items if x["r"] > EPS),
                         "down": sum(1 for x in items if x["r"] < -EPS), "lead": [st(x) for x in lead[:3]]})
    inds.sort(key=lambda x: -x["r"])
    t = NOW.strftime("%H:%M")
    snaps = old.get("snaps", []) if old.get("date") == NOW.strftime("%Y-%m-%d") else []
    snaps = [x for x in snaps if x[0] != t] + [[t, up, dn, ix[0]["chg"] if ix else None, ix[1]["chg"] if len(ix) > 1 else None]]
    out = {"mkt": mk, "flag": cfg["flag"], "name": cfg["name"], "date": NOW.strftime("%Y-%m-%d"), "t": t, "total": len(rows), "up": up, "down": dn,
           "flat": len(rows) - up - dn, "median": round(statistics.median(x["r"] for x in rows), 2), "limit_up": None, "limit_dn": None, "index": ix,
           "sectors": sectors, "strong": inds[:6], "weak": list(reversed(inds[-4:])) if len(inds) > 10 else [], "themes": [],
           "value": [dict(st(x), v=round(x["v"] / 1e8)) for x in sorted(rows, key=lambda x: -x["v"])[:12]], "vcur": cfg["cur"], "snaps": snaps,
           "movers": [st(x) for x in sorted(rows, key=lambda x: -x["r"])[:8]], "note": f"시가총액 큰 {len(rows)}종목 · 야후 시세(약 15분 늦음)"}
    os.makedirs(os.path.dirname(out_p), exist_ok=True)
    json.dump(out, open(out_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(mk, "장중 나침반", t, f"상승 {up} 하락 {dn}", len(sectors), len(inds))


def main():
    hm = NOW.hour * 100 + NOW.minute
    todo = [k for k, c in MK.items() if FORCE or (NOW.weekday() < 5 and c["open"] <= hm <= c["close"] + 15)]
    if not todo:
        print("열린 시장 없음")
        return
    sec = get(OPD + "sec.json")
    names = {}
    try:
        names = {r[0]: r[1] for r in get(OPD + "idx.json", timeout=90)}
    except Exception as e:
        print("이름 실패", e)
    for k in todo:
        try:
            run(k, sec, names)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(k, "실패", e)


if __name__ == "__main__":
    main()
