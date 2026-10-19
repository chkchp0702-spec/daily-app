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


MK_FILE = {"KR": "kr", "JP": "jp", "CN": "cn", "HK": "hk", "US": "us"}


def _mood(up, dn):
    r = up / max(1, up + dn)
    return ("오른 종목이 압도적으로 많은" if r >= .65 else "오른 종목이 더 많은" if r >= .55 else "오른 종목과 내린 종목이 비슷한" if r > .45
            else "내린 종목이 더 많은" if r > .35 else "내린 종목이 압도적으로 많은")


def _cards_live(m, j, log=print):
    """🧭 10/19 사용자 「진짜 쫌…」 — 코스피 −3% 장중(10:11)인데 「오늘 이 업종·종목을 보자」·「섹터 등락」이 지난 금요일(10/16) 마감
    (의료기기 +8.7% 등)을 그대로 보여 줌. live 가 더 새 장이면 섹터·강한/약한 업종·대형주 등락도 live 값으로 바꾼다.
    지난 마감 값은 m.prev 에 한 번만 남기고(10분마다 다시 해도 같은 결과), 1주·1개월(r5·r20)·흐름(path·heat)은 지난 마감까지 값을 그대로 둔다."""
    pv = m.setdefault("prev", {})
    if "sectors" not in pv:
        pv.update({k: m.get(k) for k in ("sectors", "strong", "weak", "leaders", "laggards", "top_cap")})
    r5 = {}
    for x in (pv.get("sectors") or []):
        for t in (x.get("big") or []) + (x.get("hot") or []) + (x.get("top") or []):
            if t.get("s"):
                r5[t["s"]] = t.get("r5")
    for t in (pv.get("leaders") or []) + (pv.get("laggards") or []) + (pv.get("top_cap") or []):
        if t.get("s"):
            r5.setdefault(t["s"], t.get("r5"))
    st = lambda t: {"s": t.get("s"), "n": t.get("n"), "r1": t.get("r"), "r5": r5.get(t.get("s"))}
    # 섹터: 오늘 등락·오른/내린 종목 수·대표 종목은 live, 1주·1개월·흐름은 지난 마감
    old = {x.get("k"): x for x in (pv.get("sectors") or [])}
    lv = {x.get("k"): x for x in (j.get("sectors") or []) if x.get("r") is not None}
    secs = []
    for k, o in old.items():
        x = lv.get(k)
        if not x:
            continue                      # live 에 없는 섹터(일본 방산 등)는 오늘 칸에서 뺌 — 옛 값을 오늘처럼 보이지 않게
        n = dict(o)
        n.update({"r1": x["r"], "up": x.get("up", o.get("up")), "down": x.get("down", o.get("down")), "big": [st(t) for t in x.get("big") or []]})
        n["hot"] = sorted(n["big"], key=lambda t: -(t["r1"] or 0))
        secs.append(n)
    if secs:
        m["sectors"] = secs
    # 강한·약한 업종
    pr = {x.get("name"): x for x in (pv.get("strong") or []) + (pv.get("weak") or [])}
    ind = lambda x: {"name": x["name"], "n": x.get("n"), "up": x.get("up"), "down": x.get("down"), "r1": x.get("r"),
                     "r5": (pr.get(x["name"]) or {}).get("r5"), "lead": [st(t) for t in x.get("lead") or []], "big": []}
    if j.get("strong"):
        m["strong"] = [ind(x) for x in j["strong"] if x.get("r") is not None]
    if j.get("weak"):
        m["weak"] = [ind(x) for x in j["weak"] if x.get("r") is not None]
    # 대형주: 섹터 대표 종목(큰 회사) + 거래대금 상위로 오늘 등락 지도
    mp = {}
    for x in (j.get("sectors") or []):
        for t in x.get("big") or []:
            if t.get("s") and t.get("r") is not None:
                mp[t["s"]] = t
    big = sorted(mp.values(), key=lambda t: -t["r"])     # 「많이 오른 대형주」는 섹터 대표(큰 회사)만
    for t in (j.get("value") or []):                    # 시가총액 TOP 10 칸은 거래대금 상위로도 채움
        if t.get("s") and t.get("r") is not None:
            mp.setdefault(t["s"], t)
    if len(big) >= 8:
        m["leaders"] = [st(t) for t in big[:8] if t["r"] > 0] or [st(t) for t in big[:8]]
        m["laggards"] = [st(t) for t in big[::-1][:5] if t["r"] < 0]
    for n in secs:                          # 섹터 대장주 10개: 오늘 값을 아는 종목만 live, 모르는 종목은 비움(옛 값을 오늘처럼 안 보이게 — 앱이 줄마다 지금 시세를 따로 불러옴)
        n["top"] = [dict(t, r1=(mp[t["s"]]["r"] if t.get("s") in mp else None)) for t in (old.get(n.get("k")) or {}).get("top") or []]
    tc = []
    for t in (pv.get("top_cap") or []):
        x = mp.get(t.get("s"))
        if x:
            tc.append(dict(t, r1=x["r"]))
    if tc:
        m["top_cap"] = tc
    m["live"]["cards"] = True
    log(f"🧭 {m.get('name')} 카드(섹터 {len(secs)}·업종 {len(m.get('strong') or [])}·대형주 {len(big)}) → live {j.get('t')}")


def _breadth_live(m, j, mk, log=print):
    """🧭 10/15 사용자: "오른 종목과 내린 종목이 같다라….. 장난하냐?" — 코스피 −7.9% 인데 머리말 요약이 어제(10/14) 종목 수(1,252 vs 1,189).
    live 가 더 새 장(오늘)이면 오른·내린 종목 수·중간값·요약을 live 로 바꾸고, 어제 것은 m.prev 에 남김 (10분마다 다시 해도 같은 결과)."""
    d = (j or {}).get("sess") or (j or {}).get("date")
    if not d or not m.get("date") or d <= m["date"] or not j.get("total"):
        return
    if not m.get("live"):
        m["prev"] = {k: m.get(k) for k in ("date", "up", "down", "flat", "total", "median1", "limit_up", "summary")}
    up, dn, fl = int(j["up"]), int(j["down"]), int(j.get("flat") or 0)
    ss = sorted([x for x in j.get("sectors") or [] if x.get("r") is not None], key=lambda x: -x["r"])
    st = (j.get("strong") or [None])[0]
    m["live"] = {"date": d, "t": j.get("t"), "note": j.get("note"),
                 "ss": [[x["name"], x["r"]] for x in ss],
                 "st": {"name": st["name"], "r": st.get("r"), "lead": (st.get("lead") or [{}])[0].get("n")} if st else None}
    m.update({"up": up, "down": dn, "flat": fl, "total": int(j["total"]), "median1": _r(j.get("median")), "limit_up": j.get("limit_up")})
    lab = f"{int(d[5:7])}/{int(d[8:])}"
    base = [b for b in m.get("breadth_hist") or [] if b[0] != lab]
    # 흐름 막대는 같은 종목 묶음일 때만 오늘을 붙임 (일본·중국·홍콩 live 는 큰 회사 약 500종목이라 어제 전 종목 막대와 크기가 안 맞음)
    same = int(j["total"]) >= 0.8 * (m["prev"].get("total") or 0)
    m["breadth_hist"] = (base + [[lab, up, dn, fl]])[-60:] if same else base
    u10 = [b[1] / max(1, b[1] + b[2]) for b in base[-9:]] + [up / max(1, up + dn)]
    m["breadth10"] = round(sum(u10) / len(u10) * 100) if u10 else m.get("breadth10")
    ix = (m.get("index") or [None])[0]
    parts = [_mood(up, dn) + f" 장 (오른 {up:,} · 내린 {dn:,})"]
    if ix and ix.get("chg1") is not None:
        parts.append(f"{ix['name']} {ix['chg1']:+.1f}%")
    best = [x["name"] for x in ss[:2] if x["r"] > 0]
    worst = [x["name"] for x in ss[-2:] if x["r"] < 0]
    if best:
        parts.append("·".join(best) + " 강세")
    if worst:
        parts.append("·".join(reversed(worst)) + " 약세")
    m["summary"] = ", ".join(parts) + "."
    _cards_live(m, j, log)
    # 체감 온도도 오늘 값으로 (미국 VIX 는 원래 계산 그대로 두려고 미국은 건너뜀 — 미국은 live 가 같은 장이라 여기 안 옴)
    try:
        import sys as _s
        _s.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from compass import fear_greed
        fg = fear_greed(m, mk if mk != "US" else "_")
        if fg:
            m["fg"] = fg
    except Exception as e:
        log("체감 온도 다시 계산 실패", e)
    log(f"🧮 {mk} 종목 수 → live {d} {j.get('t')}: 오른 {up} · 내린 {dn} (전 {m['prev'].get('date')}: {m['prev'].get('up')} · {m['prev'].get('down')})")


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
            if not m.get("live"):
                _fix_summary(m)
        f = MK_FILE.get(mk)
        if f and f not in cache:
            try:
                cache[f] = json.load(open(os.path.join(live_dir, f"live_{f}.json"), encoding="utf-8"))
            except Exception:
                cache[f] = None
        if f:
            _breadth_live(m, cache.get(f), mk, log)
    return done


if __name__ == "__main__":       # python3 opdb/ixlive.py archive/sector/<날짜>/compass.json archive/x
    import sys
    p = sys.argv[1]; C = json.load(open(p, encoding="utf-8"))
    print("바꾼 지수", overlay(C, sys.argv[2]))
    json.dump(C, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
