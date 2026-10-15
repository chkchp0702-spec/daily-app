"""☕ 돌파 임박 — 지금 값으로 다시 재기 (10/15 사용자 「다 진행해」 · 📱 A12-3)
  오늘 컵 cards.json 의 「돌파 임박」(돌파선까지 3% 안 · 아직 안 뚫음) 종목만 지금 가격을 받아
  돌파선과의 거리를 다시 계산 → archive/x/cup_live.json
  · 한국: 네이버 모바일 API (장중 실시간에 가까움)
  · 미국·일본·중국·홍콩: 야후 5분봉 (미국은 시간외 포함)
  · live.yml(아시아 장·미국 정규장) · uspre.yml(미국 장 밖) 에서 10분마다
  · 같은 날 처음 돌파선을 넘은 시각은 「x」에 남김 (오늘 넘었다가 다시 내려와도 기록)
  python cup_live.py
"""
import datetime as dt
import glob
import json
import os
import urllib.request
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "archive", "x", "cup_live.json")
KST = ZoneInfo("Asia/Seoul")
UA = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
# 시장별 정규장 (현지 시각, 분)
HOURS = {"KR": ("Asia/Seoul", 540, 930), "JP": ("Asia/Tokyo", 540, 930), "CN": ("Asia/Shanghai", 570, 900),
         "HK": ("Asia/Hong_Kong", 570, 960), "US": ("America/New_York", 570, 960)}


def num(v):
    try:
        return float(str(v).replace(",", "").replace("+", "").replace("%", ""))
    except Exception:
        return None


def sess(mkt, now):
    tz, a, b = HOURS.get(mkt, HOURS["US"])
    t = now.astimezone(ZoneInfo(tz))
    if t.weekday() >= 5:
        return "마감"
    m = t.hour * 60 + t.minute
    if a <= m < b:
        return "장중"
    if mkt == "US" and (240 <= m < a or b <= m < 1200):
        return "시간외"
    return "마감"


def kr_px(code):
    with urllib.request.urlopen(urllib.request.Request(f"https://m.stock.naver.com/api/stock/{code.split('.')[0]}/basic", headers=UA), timeout=20) as r:
        j = json.loads(r.read().decode("utf-8", "ignore"))
    return num(j.get("closePriceRaw") or j.get("closePrice"))


def yf_px(syms):
    out = {}
    if not syms:
        return out
    import yfinance as yf
    df = yf.download(syms, period="5d", interval="5m", prepost=True, group_by="ticker", auto_adjust=False, progress=False, threads=True)
    for s in syms:
        try:
            multi = hasattr(df.columns, "levels") and s in df.columns.get_level_values(0)
            c = (df[s] if multi else df)["Close"].dropna()
            if len(c):
                out[s] = float(c.iloc[-1])
        except Exception as e:
            print("야후 실패", s, e)
    return out


def main():
    now = dt.datetime.now(KST)
    files = sorted(glob.glob(os.path.join(ROOT, "archive", "cup", "*", "cards.json")))
    if not files:
        return
    day = os.path.basename(os.path.dirname(files[-1]))
    d = json.load(open(files[-1], encoding="utf-8"))
    near = [c for c in d.get("top") or [] if c.get("dist") is not None and -3 <= c["dist"] < 0 and not c.get("brk") and c.get("pivot")]
    try:
        prev = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        prev = {}
    if prev.get("day") != day:
        prev = {"day": day, "items": {}}
    items = prev.get("items", {})
    try:
        yq = yf_px([c["code"] for c in near if c.get("mkt") != "KR"])
    except Exception as e:
        print("야후 전체 실패", e)
        yq = {}
    for c in near:
        code, mkt = c["code"], c.get("mkt") or "US"
        try:
            p = kr_px(code) if mkt == "KR" else yq.get(code)
        except Exception as e:
            print("시세 실패", code, e)
            p = None
        if p is None:
            continue
        dist = round((p / c["pivot"] - 1) * 100, 2)
        old = items.get(code, {})
        cur = {"p": round(p, 4), "d": dist, "pv": c["pivot"], "at": now.strftime("%Y-%m-%d %H:%M"), "s": sess(mkt, now), "x": old.get("x")}
        if dist >= 0 and not cur["x"]:
            cur["x"] = now.strftime("%m/%d %H:%M")
        items[code] = cur
    out = {"day": day, "at": now.strftime("%Y-%m-%d %H:%M"), "n": len(near), "items": {k: v for k, v in items.items() if any(c["code"] == k for c in near)}}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("돌파 임박", len(near), "종목 →", len(out["items"]), "개 값", sum(1 for v in out["items"].values() if v["d"] >= 0), "개 넘음")


if __name__ == "__main__":
    main()
