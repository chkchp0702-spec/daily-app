"""
👔 PB 한 장 — 장중 매시간 갱신 (10/28 사용자 「1·2번 내용은 장중 한 시간마다 갱신 · 알람은 그대로 두 번」)
  아침(장 전)엔 시황리포트의 고객용 5줄(kakao.lines), 장중(09~15:30)엔 실시간 자료로 다시 씀 → archive/x/pbbrief.json
  앱: 🏠 「👔 PB 한 장」 카드 + 📨 고객에게 보내기 「지금 시장 한 장」 이 이걸 읽음. 알림(푸시)은 아침 한 번만(plus.py).
  python pbbrief.py
"""
import datetime as dt
import glob
import json
import os
import re

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
TODAY = NOW.strftime("%Y-%m-%d")
X = os.path.join("archive", "x")
OUT = os.path.join(X, "pbbrief.json")


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def strip(t):
    return re.sub(r"<[^>]+>", "", str(t or "")).replace("&nbsp;", " ").replace("\n", " ").strip()


def sg(v, d=1):
    if v is None:
        return "–"
    return f"{v:+.{d}f}%".replace("+-", "−").replace("-", "−")


def market_data():
    md = sorted(glob.glob(os.path.join("archive", "market", "20*", "data.json")))
    return (jl(md[-1], {}) if md else {}) or {}


def regime_line():
    cs = sorted(glob.glob(os.path.join("archive", "sector", "20*", "compass.json")))
    if not cs:
        return ""
    C = jl(cs[-1], {}) or {}
    ms = C.get("markets") or {}
    return " · ".join(f"{m['flag']}{m['regime'][:2]}" for k, m in ms.items())


def events(d):
    ev = []
    for sc in (d.get("schedule") or [])[:1]:
        ev.append(strip(sc.get("what"))[:70])
    ec = jl(os.path.join(X, "earn_cal.json"), {}) or {}
    soon = [x for x in ec.get("items") or [] if x.get("kind") == "실적" and x.get("d", "") <= (NOW.date() + dt.timedelta(days=1)).isoformat()]
    if soon:
        ev.append("실적 " + ", ".join(x["n"][:10] for x in soon[:3]))
    return ev


def intraday(d):
    """장중판: 실시간 한국(live_kr) + 미국 선물(live_us_pre) + 두뇌 한 줄"""
    L = jl(os.path.join(X, "live_kr.json"), {}) or {}
    U = jl(os.path.join(X, "live_us_pre.json"), {}) or {}
    if L.get("date") != TODAY or not L.get("index"):
        return None
    ix = {x["name"]: x for x in L["index"]}
    ks, kq = ix.get("코스피") or {}, ix.get("코스닥") or {}
    up, tot = L.get("up") or 0, L.get("total") or 0
    t = L.get("t") or NOW.strftime("%H:%M")
    talk = []
    talk.append(f"한국 {t}: 코스피 {ks.get('last', 0):,.0f}({sg(ks.get('chg'))}) · 코스닥 {sg(kq.get('chg'))} · 오른 종목 {round(up / tot * 100) if tot else 0}%"
                + (f" · 상한가 {L['limit_up']}" if L.get("limit_up") else ""))
    sec = [s for s in (L.get("sectors") or []) if s.get("n", 0) >= 5]
    if sec:
        hi = sorted(sec, key=lambda s: -s["r"])[:2]; lo = sorted(sec, key=lambda s: s["r"])[:2]
        talk.append("돈이 가는 곳: " + ", ".join(f"{s['name']} {sg(s['r'])}" for s in hi) + " / 약한 곳: " + ", ".join(f"{s['name']} {sg(s['r'])}" for s in lo))
    fut = {f["s"]: f for f in (U.get("fut") or [])} if U.get("date") == TODAY else {}
    us = []
    if fut.get("ES=F"):
        us.append(f"S&P500 선물 {sg(fut['ES=F'].get('chg'))}")
    if fut.get("NQ=F"):
        us.append(f"나스닥 선물 {sg(fut['NQ=F'].get('chg'))}")
    kk = [strip(x) for x in ((d.get("kakao") or {}).get("lines") or [])]
    usline = next((x for x in kk if x.startswith("미국")), "")
    if us or usline:
        talk.append(("미국: " + " · ".join(us) + (" · " if us and usline else "") + (usline.replace("미국(", "어제(") if usline else ""))[:140])
    lead = next((x for x in kk if x.startswith("주도")), "")
    if lead:
        talk.append(lead[:120])
    return {"t": t, "talk": talk[:4]}


def main():
    d = market_data()
    reg = regime_line()
    one = strip(d.get("one_liner"))[:90]
    kk = [strip(x) for x in ((d.get("kakao") or {}).get("lines") or [])] or [strip(x) for x in ((d.get("summary") or {}).get("three_lines") or [])]
    hh, mi = NOW.hour, NOW.minute
    live = intraday(d) if NOW.weekday() < 5 and (9 <= hh < 15 or (hh == 15 and mi <= 40)) else None
    if live:
        out = {"mode": "장중", "asof": f"{TODAY} {live['t']}", "label": f"{live['t']} 장중", "regime": reg, "one": one, "talk": live["talk"], "events": events(d)}
    else:
        close = NOW.weekday() < 5 and hh >= 15
        L = jl(os.path.join(X, "live_kr.json"), {}) or {}
        lab = "마감" if close and L.get("date") == TODAY else "아침"
        talk = list(kk[:3])
        if lab == "마감" and L.get("index"):
            ix = {x["name"]: x for x in L["index"]}
            ks = ix.get("코스피") or {}
            talk = [f"한국 마감: 코스피 {ks.get('last', 0):,.0f}({sg(ks.get('chg'))}) · 코스닥 {sg((ix.get('코스닥') or {}).get('chg'))} · 오른 종목 {round((L.get('up') or 0) / (L.get('total') or 1) * 100)}%"] + [x for x in kk if not x.startswith("한국")][:2]
        out = {"mode": lab, "asof": f"{TODAY} {NOW.strftime('%H:%M')}", "label": f"{d.get('date', TODAY)[5:].replace('-', '/')} {lab}", "regime": reg, "one": one, "talk": talk, "events": events(d)}
    out["at"] = NOW.strftime("%Y-%m-%d %H:%M")
    out["note"] = "참고용 · 사라·팔라는 뜻이 아니에요"
    os.makedirs(X, exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(out["label"], "·", len(out["talk"]), "줄")
    for x in out["talk"]:
        print(" ·", x)


if __name__ == "__main__":
    main()
