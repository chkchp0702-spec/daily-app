"""
🎯 10/26 A10/26-1 「내 목표가·손절가, 어느 쪽이 먼저 닿나」 — 관심종목 일봉(2006~ · 종가·고가·저가)
  앱 관심종목(users.json — 목표가·손절가 알림 때문에 이미 올라오는 종목 코드)과 시장 기준 지수 5개의 일봉을
  archive/x/memo_px/<코드>.json 에 둔다. 앱이 「같은 비율로 매 거래일 들어갔다면 목표·손절 중 어느 쪽이 먼저」를 휴대폰에서 계산.
  · 없는 파일이나 7일 넘은 파일만 받는다(매시간 watch 뒤 — 대부분 바로 끝남)
  · 관심종목에서 빠진 종목 파일은 지운다(지수 5개는 늘 둠)
  python memo_px.py
"""
import datetime as dt
import json
import os
import re
import time

KST = dt.timezone(dt.timedelta(hours=9))
OUT = os.path.join("archive", "x", "memo_px")
USERS = os.path.join("archive", "x", "users.json")
BASE = ["^GSPC", "^KS11", "^KQ11", "^N225", "^HSI", "000001.SS"]   # 시장마다 같은 비율 기준선
START = "2006-01-01"
MAXAGE = 7


def fname(s):
    return re.sub(r"[^A-Za-z0-9._-]", "_", s) + ".json"


def wanted():
    try:
        U = json.load(open(USERS, encoding="utf-8"))
    except Exception:
        U = {}
    syms = set()
    for u in U.values():
        for it in u.get("wl") or []:
            if it and isinstance(it[0], str) and it[0]:
                syms.add(it[0])
    return sorted(syms)


def fetch(s):
    import yfinance as yf
    cands = [s + ".KS", s + ".KQ"] if re.fullmatch(r"\d{6}", s) else [s]
    for y in cands:
        for attempt in range(2):
            try:
                df = yf.download(y, start=START, interval="1d", auto_adjust=True, progress=False, threads=False)
                break
            except Exception as e:
                print("  재시도", y, e)
                time.sleep(5)
        else:
            continue
        if df is None or df.empty:
            continue
        if hasattr(df.columns, "levels"):
            df.columns = df.columns.get_level_values(0)
        df = df[["Close", "High", "Low"]].dropna(subset=["Close"])
        df["High"] = df["High"].fillna(df["Close"]); df["Low"] = df["Low"].fillna(df["Close"])
        if len(df) < 120:
            continue
        d0 = df.index[0]
        r = lambda v: float(f"{float(v):.6g}")
        return {"s": s, "y": y, "at": dt.datetime.now(KST).strftime("%Y-%m-%d"), "d0": d0.strftime("%Y-%m-%d"),
                "t": [int((x - d0).days) for x in df.index], "c": [r(v) for v in df["Close"]],
                "h": [r(v) for v in df["High"]], "l": [r(v) for v in df["Low"]]}
    return None


def main():
    os.makedirs(OUT, exist_ok=True)
    want = wanted()
    keep = {fname(s) for s in want + BASE}
    for f in os.listdir(OUT):
        if f.endswith(".json") and f not in keep and f != "index.json":
            os.remove(os.path.join(OUT, f)); print("뺌", f)
    today = dt.datetime.now(KST).date()
    got, idx = 0, {}
    for s in BASE + want:
        p = os.path.join(OUT, fname(s))
        old = None
        try:
            old = json.load(open(p, encoding="utf-8"))
        except Exception:
            pass
        if old and (today - dt.date.fromisoformat(old.get("at", "2000-01-01"))).days < MAXAGE:
            idx[s] = [old.get("y"), old.get("d0"), len(old.get("c") or [])]
            continue
        if got >= 40:            # 한 번에 너무 많이 받지 않기 (다음 시간에 이어서)
            continue
        j = fetch(s)
        got += 1
        if not j:
            print("못 받음", s)
            idx[s] = [None, None, 0]
            continue
        json.dump(j, open(p, "w", encoding="utf-8"), separators=(",", ":"))
        idx[s] = [j["y"], j["d0"], len(j["c"])]
        print("받음", s, j["y"], j["d0"], len(j["c"]))
        time.sleep(0.5)
    json.dump({"at": dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "s": idx}, open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    print("관심종목 일봉", len(want), "· 새로 받음", got)


if __name__ == "__main__":
    main()
