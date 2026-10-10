"""🩺 앱 건강검진 (10/10 앱 업그레이드 ⑩) — 매일 16:30 · 일요일 아침엔 「이번 주 고친 것」 알림
  1) 실제 앱(GitHub Pages)을 휴대폰 크기 브라우저로 열어 탭마다: 오류(자바스크립트), 뜨는 데 걸린 시간, 카드 수, 「못 불러왔어요」 같은 빈 화면
  2) 자료 신선도: 포트·킥·홈·성적표·동종주·집중·피드·단타 학습·앱 목록의 마지막 갱신 시각 · 0개인 피드 출처
  → archive/x/health.json (매일 저녁 「자가 업그레이드」가 읽고 고친다)
  · 문제가 있으면 바로, 일요일엔 늘 ntfy chkchp-ch-report 로 한 번
"""
from __future__ import annotations
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
APP = "https://chkchp0702-spec.github.io/daily-app/"
MSR = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/"
SS = "https://raw.githubusercontent.com/chkchp0702-spec/stock-screener/main/"
OUT = Path("archive/x/health.json")
TABS = ["home", "market", "port", "score", "whale", "cup", "gap", "sector", "accum", "onepager", "danta", "alarm", "idea", "feed"]


def web(url, t=40):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "ch-health"}), timeout=t) as r:
            return r.read().decode("utf-8", "ignore")
    except Exception as e:
        return None


def age_h(s):
    """'2026-10-10 15:44' 또는 ISO → 몇 시간 전"""
    if not s:
        return None
    s = str(s).replace("T", " ")[:16]
    try:
        t = dt.datetime.strptime(s, "%Y-%m-%d %H:%M").replace(tzinfo=KST)
        return round((NOW - t).total_seconds() / 3600, 1)
    except Exception:
        return None


def data_checks():
    out, probs = [], []
    # (이름, 주소, 시각 칸, 허용 시간) — 주말·휴장엔 자연히 늘어나는 것은 넉넉히
    weekend = NOW.weekday() >= 5
    for name, url, key, lim in [
        ("💼 포트", MSR + "market/port.json", "at", 3), ("⚡ 킥", MSR + "market/kick.json", "at", 3), ("🏠 홈", MSR + "market/home.json", "at", 3),
        ("📊 성적표", MSR + "market/scores.json", "at", 3), ("🌏 동종주", MSR + "market/peers.json", "at", 3), ("🎯 집중", MSR + "market/focus.json", "built_kst", 30 if not weekend else 80),
        ("📰 피드", MSR + "feeds/my_feed.json", "at", 1.5), ("🧠 두뇌", MSR + "brain/state.json", "last_review", 3),
        ("🧪 단타 학습", SS + "data/learned.json", "at", 30 if not weekend else 80), ("📱 앱 목록", APP + "manifest.json", "updated", 30)]:
        txt = web(url + ("?" + str(int(time.time())) if url.startswith(APP) else ""))
        if not txt:
            out.append({"name": name, "ok": False, "why": "못 받음"}); probs.append(f"{name} 자료를 못 받음"); continue
        try:
            j = json.loads(txt)
        except Exception:
            out.append({"name": name, "ok": False, "why": "깨진 JSON"}); probs.append(f"{name} 자료가 깨짐"); continue
        a = age_h(j.get(key))
        ok = a is not None and a <= lim
        out.append({"name": name, "ok": ok, "age_h": a, "lim": lim})
        if not ok:
            probs.append(f"{name} {a}시간째 안 바뀜(기준 {lim}시간)")
        if name == "📰 피드":
            zero = [s["name"] for s in j.get("sources", []) if (not s.get("ok") or not s.get("n")) and s.get("id") != "sunstudy1111"]
            if zero:
                probs.append("피드 0개·실패: " + ", ".join(zero[:6]))
                out[-1]["zero"] = zero
        if name == "💼 포트" and j.get("miss"):
            probs.append("포트 시세 없음: " + ", ".join(j["miss"][:6]))
    return out, probs


def app_checks():
    from playwright.sync_api import sync_playwright
    res, probs = [], []
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        ctx.add_init_script("try{localStorage.setItem('userName','건강검진')}catch(e){}")
        ctx.route(re.compile(r"https://ntfy\.sh/.*"), lambda r: r.abort())      # 검사 중 알림·사용 기록 안 보냄
        for tab in TABS:
            pg = ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e, L=errs: L.append(str(e)[:160]))
            pg.on("dialog", lambda d: d.dismiss())
            t0 = time.time()
            try:
                pg.goto(APP + "#" + tab, wait_until="domcontentloaded", timeout=45000)
                pg.wait_for_selector("#main .card, #main .empty", timeout=30000)
                first = round(time.time() - t0, 1)
                pg.wait_for_timeout(4000)
                info = pg.evaluate("""() => {
                  const m = document.getElementById('main'), t = m ? m.innerText : '';
                  return {cards: document.querySelectorAll('#main .card').length, len: t.length,
                          bad: (t.match(/못 불러왔|아직 안 올라왔|자료 준비 중|undefined|NaN%/g) || []).slice(0, 4),
                          loading: document.querySelectorAll('#main .loading').length};
                }""")
            except Exception as e:
                first, info = None, {"cards": 0, "len": 0, "bad": ["열기 실패: " + str(e)[:80]], "loading": 0}
            r = {"tab": tab, "s": first, **info, "errs": errs[:3]}
            res.append(r)
            if errs:
                probs.append(f"#{tab} 오류: {errs[0][:80]}")
            if info["bad"]:
                probs.append(f"#{tab} 화면에 「{info['bad'][0]}」")
            if first is None or first > 8:
                probs.append(f"#{tab} 느림 ({first}초)")
            if info["loading"] > 0:
                probs.append(f"#{tab} 4초 뒤에도 「불러오는 중」 {info['loading']}곳")
            pg.close()
        b.close()
    return res, probs


def week_fixed():
    txt = web(MSR + "brain/upgrades.md") or ""
    cut = NOW - dt.timedelta(days=7)
    rows = []
    for l in txt.splitlines():
        m = re.match(r"\|\s*(\d{1,2})/(\d{1,2})\s*\|\s*([^|]+)\|", l)
        if not m:
            continue
        try:
            d = dt.datetime(NOW.year, int(m.group(1)), int(m.group(2)), tzinfo=KST)
        except Exception:
            continue
        if d >= cut:
            rows.append(f"{m.group(1)}/{m.group(2)} {m.group(3).strip()[:60]}")
    return rows


def main():
    data, p1 = data_checks()
    try:
        app, p2 = app_checks()
    except Exception as e:
        app, p2 = [], [f"브라우저 검사 실패: {str(e)[:100]}"]
    probs = p1 + p2
    fixed = week_fixed()
    out = {"at": NOW.strftime("%Y-%m-%d %H:%M"), "ok": not probs, "problems": probs, "data": data, "app": app, "week_fixed": fixed,
           "note": "매일 16:30 자동 검사. 「자가 업그레이드」(16:47)가 problems 를 먼저 고친다."}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({"ok": out["ok"], "problems": probs}, ensure_ascii=False, indent=1))
    sunday = NOW.weekday() == 6
    urgent = [x for x in probs if re.search(r"오류|실패|깨짐|못 받음", x)]
    if urgent or sunday:                     # 평소엔 급한 것만, 일요일엔 늘 (이번 주 고친 것 포함)
        title = "🩺 앱 건강검진 — " + ("문제 없음" if not probs else f"고칠 것 {len(probs)}개")
        msg = ("\n".join("· " + x for x in probs[:5]) if probs else "모든 탭·자료 정상") + \
              (("\n\n🔧 이번 주 고친 것\n" + "\n".join("· " + x for x in fixed[-5:])) if sunday and fixed else "")
        try:
            urllib.request.urlopen(urllib.request.Request("https://ntfy.sh/", data=json.dumps({
                "topic": "chkchp-ch-report", "title": title, "message": msg[:900], "click": APP + "#score", "tags": ["stethoscope"]}).encode(),
                headers={"Content-Type": "application/json"}), timeout=15).read()
        except Exception as e:
            print("알림 실패", e)


if __name__ == "__main__":
    main()
