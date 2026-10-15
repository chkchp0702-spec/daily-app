"""🧭 나침반 지수에 live_*.json(장중·방금 마감 값)을 덧입히기 — pandas 없이 (collect.py 가 시스템 파이썬으로 돌아서)

10/15 사용자: "이걸 횡보장이라고 하는게 말이 되니?" — 나침반 지수는 아침 9시 한 번 받은 값(코스피 −5.3%)에 머물러 있고
그 사이 live 는 −7.9%. 또 일본·홍콩·중국은 야후가 어제 봉을 안 줘서 10/13 에 멈춰 있었음.
→ collect 때마다 live 값으로 ① 빠진 어제 봉 채우기 ② 오늘 봉 덮어쓰기 ③ 국면·등락·이평 다시 계산.
국면 규칙은 opdb/compass.py regime() 과 똑같이 (급락 → 하락장 포함). 같은 결과인지 tools 없이 아래 _selftest 로 확인.
"""
import datetime, json, os

# 나침반 지수 sym → (live 파일, live 안 이름, 시장 시간대, 마감 시·분)
LIVE = {"^KS11": ("kr", "코스피"), "^KQ11": ("kr", "코스닥"), "^N225": ("jp", "닛케이 225"),
        "000001.SS": ("cn", "상해종합"), "399001.SZ": ("cn", "선전성분"), "^HSI": ("hk", "항셍"),
        "^GSPC": ("us", "S&P500"), "^IXIC": ("us", "나스닥")}
TZ = {"US": ("America/New_York", 16, 0), "KR": ("Asia/Seoul", 15, 30), "JP": ("Asia/Tokyo", 15, 30),
      "CN": ("Asia/Shanghai", 15, 0), "HK": ("Asia/Hong_Kong", 16, 10)}


def _ma(a, n, i):
    return sum(a[i - n + 1:i + 1]) / n if i >= n - 1 else None


def regime(cl):
    """opdb/compass.py regime() 와 같은 판정 (pandas 없이) → (국면, 이유, 20일선 기울기%)"""
    n = len(cl); c = cl[-1]
    m20, m60 = _ma(cl, 20, n - 1), _ma(cl, 60, n - 1)
    slope = (m20 / _ma(cl, 20, n - 11) - 1) * 100 if n > 31 else 0
    if m60 is None:
        return "횡보장", "데이터가 짧아 판단 보류", slope
    a20, a60 = c > m20, c > m60
    if n > 21 and not a20:
        r20 = (c / cl[-21] - 1) * 100
        dd20 = (c / max(cl[-20:]) - 1) * 100
        if r20 <= -8 or dd20 <= -10:
            return "하락장", f"급락 — 20거래일 {r20:+.1f}%, 20일 고점 대비 {dd20:+.1f}% (20일선 아래)", slope
    if a20 and m20 > m60 and slope > 0.3:
        return "상승장", "지수가 20일선·60일선 위, 20일선이 오르는 중", slope
    if (not a20) and m20 < m60 and slope < -0.3:
        return "하락장", "지수가 20일선·60일선 아래, 20일선이 내려가는 중", slope
    why = ("60일선 위에서 숨 고르기 (20일선 아래)" if a60 and not a20 else "20일선은 회복, 60일선은 아직 아래" if a20 and not a60
           else "선들 위에 있지만 20일선 기울기가 평평" if a20 else "선들 아래지만 하락 기울기가 완만")
    return "횡보장", why, slope


def _r(v, d=2):
    return None if v is None else round(float(v), d)


def _prev_wd(d):
    x = datetime.date.fromisoformat(d) - datetime.timedelta(days=1)
    while x.weekday() >= 5:
        x -= datetime.timedelta(days=1)
    return x.isoformat()


def refresh(ix, mk, now_utc=None):
    """ohlc 로 ix 의 숫자·국면을 다시 계산 (ohlc 는 이미 덧입혀진 상태)"""
    o = ix["ohlc"]; cl = [r[4] for r in o]; ds = [r[0] for r in o]; n = len(cl)
    if n < 25:
        return
    lab, why, slope = regime(cl)
    ix.update({"date": ds[-1], "last": _r(cl[-1]), "chg1": _r((cl[-1] / cl[-2] - 1) * 100), "chg5": _r((cl[-1] / cl[-6] - 1) * 100),
               "chg20": _r((cl[-1] / cl[-21] - 1) * 100), "hi52": _r(max(cl)), "lo52": _r(min(cl)),
               "dates": [d[5:].replace("-", "/") for d in ds[-60:]], "close": [_r(v) for v in cl[-60:]],
               "ma20": [_r(_ma(cl, 20, i)) for i in range(n - 60, n)], "ma60": _r(_ma(cl, 60, n - 1)), "slope20": _r(slope),
               "regime": lab, "why": why, "crash": why.startswith("급락"),
               "reg_hist": [[ds[i][5:].replace("-", "/"), regime(cl[:i + 1])[0]] for i in range(max(70, n - 60), n)]})
    py = [i for i, d in enumerate(ds) if d[:4] < ds[-1][:4]]
    ix["chgYtd"] = _r((cl[-1] / cl[py[-1]] - 1) * 100) if py else None
    ix["live"] = _is_live(mk, ds[-1], now_utc)


def _is_live(mk, d, now_utc=None):
    try:
        from zoneinfo import ZoneInfo
        tz, hh, mm = TZ[mk]
        now = (now_utc or datetime.datetime.now(datetime.timezone.utc)).astimezone(ZoneInfo(tz))
        return d == now.strftime("%Y-%m-%d") and (now.hour, now.minute) < (hh, mm)
    except Exception:
        return False


def _fix_summary(m):
    """한 줄 요약은 종목 날짜(m.date) 기준인데 지수 등락만 오늘 장중 것이 섞였음(「종목 비슷한 날, 코스피 −5.2%」) → 같은 날 지수 등락으로"""
    import re
    ix, d = m["index"][0], m.get("date")
    ds = [r[0] for r in ix.get("ohlc") or []]
    if not m.get("summary") or d not in ds or ds.index(d) < 1:
        return
    i = ds.index(d); o = ix["ohlc"]
    ch = (o[i][4] / o[i - 1][4] - 1) * 100
    m["summary"] = re.sub(re.escape(ix["name"]) + r" [+-]?\d+(\.\d+)?%", f"{ix['name']} {ch:+.1f}%", m["summary"], count=1)


def overlay(C, live_dir, now_utc=None, log=print):
    """compass.json(C) 의 각 시장 지수에 live 값을 덧입힘. 바꾼 지수 수를 돌려줌."""
    cache, done = {}, 0
    for mk, m in (C.get("markets") or {}).items():
        for ix in m.get("index") or []:
            if ix.get("sym") not in LIVE or not ix.get("ohlc"):
                continue
            f, nm = LIVE[ix["sym"]]
            if f not in cache:
                try:
                    cache[f] = json.load(open(os.path.join(live_dir, f"live_{f}.json"), encoding="utf-8"))
                except Exception:
                    cache[f] = None
            j = cache[f]
            lv = next((x for x in (j or {}).get("index") or [] if x.get("name") == nm and x.get("last")), None)
            if not lv or lv.get("chg") is None:
                continue
            d = lv.get("date") or j.get("sess") or j.get("date")
            o = ix["ohlc"]
            if not d or d < o[-1][0] or datetime.date.fromisoformat(d).weekday() >= 5:
                continue
            last, chg = float(lv["last"]), float(lv["chg"])
            pc = last / (1 + chg / 100)
            before = [r for r in o if r[0] < d]
            if not before:
                continue
            # ① 어제 봉이 빠졌으면 채움 (휴장일이면 어제 종가 = 그 전 종가라 차이 0.05% 안 → 건너뜀)
            pdd = _prev_wd(d)
            if before[-1][0] < pdd and abs(pc / before[-1][4] - 1) > 0.0005:
                before.append([pdd, _r(pc), _r(pc), _r(pc), _r(pc), 0])
                log(f"📅 {ix['name']} 빠진 봉 채움 {pdd} {pc:.2f}")
            # ② 오늘 봉: 야후 봉이 있으면 고가·저가만 넓히고 종가를 live 로
            t = next((r for r in o if r[0] == d), None)
            if t:
                row = [d, t[1], max(t[2], last), min(t[3], last), _r(last), t[5]]
            else:
                row = [d, _r(pc), _r(max(pc, last)), _r(min(pc, last)), _r(last), 0]
            ix["ohlc"] = (before + [row])[-260:]
            old = (ix.get("regime"), ix.get("last"), ix.get("date"))
            refresh(ix, mk, now_utc)
            done += 1
            if old != (ix["regime"], ix["last"], ix["date"]):
                log(f"🧭 {mk} {ix['name']}: {old} → {(ix['regime'], ix['last'], ix['date'])} live={ix['live']}")
        if m.get("index"):
            m["regime"] = m["index"][0]["regime"]
            _fix_summary(m)
    return done


if __name__ == "__main__":       # python3 opdb/ixlive.py archive/sector/<날짜>/compass.json archive/x
    import sys
    p = sys.argv[1]; C = json.load(open(p, encoding="utf-8"))
    print("바꾼 지수", overlay(C, sys.argv[2]))
    json.dump(C, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
