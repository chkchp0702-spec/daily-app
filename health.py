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
DA = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/main/"
OUT = Path(os.environ.get("HEALTH_OUT", "archive/x/health.json"))
TABS = ["home", "market", "port", "score", "whale", "cup", "gap", "sector", "accum", "onepager", "danta", "alarm", "idea", "feed"]
SHOTS = Path(os.environ.get("HEALTH_SHOTS", "shots"))      # 🩺 10/29 탭마다 첫 두 화면 사진 → health-shots 브랜치 (자가 업그레이드가 눈으로 봄)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools"))
import deep_check as DC   # noqa: E402


def all_tabs():
    """🩺 10/29: 아래 탭 묶음(nav2.js GROUPS)의 모든 탭 + 숨은 탭 — 새 탭이 생기면 자동으로 검사 (전엔 14개만 봐서 상품·제안서·운세·확률·거르기는 검사 밖이었음)"""
    try:
        here = os.path.dirname(os.path.abspath(__file__))
        g = open(os.path.join(here, "nav2.js"), encoding="utf-8").read().split("var GROUPS", 1)[1].split("];", 1)[0]
        ts = [t for arr in re.findall(r"tabs:\s*\[([^\]]*)\]", g) for t in re.findall(r'"(\w+)"', arr)]
    except Exception:
        ts = []
    out = []
    for t in ts + TABS:
        if t not in out: out.append(t)
    return out


LOCAL = os.environ.get("HEALTH_LOCAL")   # 🩺 10/29 인터넷이 막힌 작업 환경(자가 업그레이드 세션)에서도 같은 검진: 옆에 clone 한 저장소 파일로
_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOTS = {MSR: os.path.join(os.path.dirname(_HERE), "market-strategy-report") + "/", SS: os.path.join(os.path.dirname(_HERE), "stock-screener") + "/", DA: _HERE + "/", APP: _HERE + "/"}


def local_path(url):
    for pre, root in _ROOTS.items():
        if url.startswith(pre):
            f = root + (url[len(pre):].split("?")[0].split("#")[0] or "index.html")
            return f if os.path.isfile(f) else None
    return False


def web(url, t=40):
    if LOCAL:
        f = local_path(url)
        return open(f, encoding="utf-8", errors="ignore").read() if f else None
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "ch-health"}), timeout=t) as r:
            return r.read().decode("utf-8", "ignore")
    except Exception as e:
        return None


def age_h(s):
    """'2026-10-10 15:44' 또는 ISO → 몇 시간 전"""
    if not s:
        return None
    if isinstance(s, (int, float)):   # 밀리초(JS Date.now) 시각
        return round((NOW.timestamp() - s / 1000) / 3600, 1)
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
    # 10/24: 시세 수집(fetch.yml)은 주말엔 하루 한 번(06:15 KST)뿐 → 토·일 포트·킥·홈·성적표·동종주는 27시간까지 정상 (10/24 토 16:25 「7.6시간째」 5개 가짜 경보)
    mk = 3 if not weekend else 27
    for name, url, key, lim in [
        ("💼 포트", MSR + "market/port.json", "at", mk), ("⚡ 킥", MSR + "market/kick.json", "at", mk), ("🏠 홈", MSR + "market/home.json", "at", mk),
        ("📊 성적표", MSR + "market/scores.json", "at", mk), ("🌏 동종주", MSR + "market/peers.json", "at", mk), ("🎯 집중", MSR + "market/focus.json", "built_kst", 30 if not weekend else 80),
        ("📰 피드", MSR + "feeds/my_feed.json", "at", 1.5), ("🧠 두뇌", MSR + "brain/state.json", "last_review", 3),
        ("🧪 단타 학습", SS + "data/learned.json", "at", 30 if not weekend else 80), ("📱 앱 목록", APP + "manifest.json", "updated", 30),
        ("🎲 시장확률", DA + "archive/x/prob.json", "at", 2), ("🧭 섹터·종목 확률", DA + "archive/x/prob_sec.json", "at", 12 if not weekend else 80)]:
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
    # 버전 짝 검사: index.html APPV·sw.js VER·version.txt 가 다르면 휴대폰에 새 버전이 안 들어감 (10/12 b~e 사고)
    try:
        here = os.path.dirname(os.path.abspath(__file__))
        apv = re.search(r'var APPV = "(\w+)"', open(os.path.join(here, "index.html"), encoding="utf-8").read()).group(1)
        swv = re.search(r'var VER = "(\w+)"', open(os.path.join(here, "sw.js"), encoding="utf-8").read()).group(1)
        vt = open(os.path.join(here, "version.txt"), encoding="utf-8").read().strip()
        if not (apv == swv == vt): probs.append(f"버전 짝 안 맞음: index {apv} · sw {swv} · version.txt {vt} → 휴대폰에 새 버전이 안 들어감")
    except Exception as ex:
        probs.append(f"버전 짝 검사 실패: {ex}")
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, service_workers="block")
        ctx.add_init_script("try{localStorage.setItem('userName','건강검진')}catch(e){}")
        ctx.route(re.compile(r"https://ntfy\.sh/.*"), lambda r: r.abort())
        if LOCAL:
            def _lr(r):
                f = local_path(r.request.url.replace("refs/heads/main", "main"))
                if f is False: return r.fulfill(status=404, body="")
                return r.fulfill(path=f) if f else r.fulfill(status=404, body="")
            ctx.route("**/*", _lr)      # 검사 중 알림·사용 기록 안 보냄
        retried = []
        tabs = all_tabs(); texts, lints = {}, {}
        alltabs = list(tabs)
        if os.environ.get("HEALTH_TABS"): tabs = [t for t in tabs if t in os.environ["HEALTH_TABS"].split(",")]   # 시험할 때만: 몇 탭만
        SHOTS.mkdir(exist_ok=True)
        try: kn = list((json.loads(web(MSR + "market/kick.json") or "{}").get("src_names") or {}).keys())
        except Exception: kn = []
        ids = sorted(set(kn) | {"nh52", "pead", "dip", "trend", "cust", "ins", "earn", "maxcut", "frog", "agree", "nonews", "pbskip", "krgap", "cup_eye", "lead", "focus"})
        for tab in tabs:
            pg = ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e, L=errs: L.append(str(e)[:160]))
            pg.on("dialog", lambda d: d.dismiss())
            t0 = time.time()
            try:
                try:
                    pg.goto(APP + "#" + tab, wait_until="domcontentloaded", timeout=45000)
                    pg.wait_for_function("(()=>{var m=document.getElementById('main');return m&&!m.querySelector('.loading')&&(m.innerText||'').length>40})()", timeout=30000)
                except Exception:
                    # 10/21: 한 번 시간초과(10/19·10/21 #whale — 배포·네트워크 순간 끊김)는 새로 열어 한 번만 더 봄. 두 번 다 안 열리면 문제로 셈
                    t0 = time.time()
                    pg.goto(APP + "?r=" + str(int(t0)) + "#" + tab, wait_until="domcontentloaded", timeout=45000)
                    pg.wait_for_function("(()=>{var m=document.getElementById('main');return m&&!m.querySelector('.loading')&&(m.innerText||'').length>40})()", timeout=30000)
                    retried.append(tab)
                first = round(time.time() - t0, 1)
                pg.wait_for_timeout(4000)
                info = pg.evaluate("""() => {
                  const m = document.getElementById('main'), t = m ? m.innerText : '';
                  return {cards: document.querySelectorAll('#main .card').length, len: t.length,
                          bad: (t.match(/못 불러왔|아직 안 올라왔|자료 준비 중|undefined|NaN%/g) || []).slice(0, 4),
                          loading: document.querySelectorAll('#main .loading').length};
                }""")
                # 🩺 10/29 내용 검사 · 화면 글 · 사진
                texts[tab] = pg.evaluate("(document.getElementById('main')||{}).innerText||''")
                lints[tab] = pg.evaluate(DC.LINT_JS, {"ids": ids, "bad": DC.BAD_WORDS, "glitch": DC.GLITCH, "tabs": alltabs, "en": tab in ("feed", "onepager", "market", "sector")})
                for x in DC.lint_probs(tab, lints[tab]):
                    if not (info["bad"] and "화면에" in x): probs.append(x)
                if tab == "home":   # 🧒 인사 화면(5초)이 안 사라지면 앱을 못 씀
                    pg.wait_for_timeout(3500)
                    if pg.evaluate("(()=>{var s=document.getElementById('kidsplash');return !!(s&&s.isConnected&&getComputedStyle(s).opacity>0.1)})()"):
                        probs.append("#home 🧒 인사 화면이 7초 넘게 안 사라짐")
                pg.evaluate("(()=>{var s=document.getElementById('kidsplash');if(s)s.remove()})()")
                try:
                    # 휴대폰에서 보는 그대로 첫 화면·두 번째 화면 (전체 캡처는 아래 고정 메뉴가 가운데 찍힘)
                    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(300)
                    pg.screenshot(path=str(SHOTS / f"{tab}_1.jpg"), type="jpeg", quality=55)
                    pg.evaluate("window.scrollTo(0,780)"); pg.wait_for_timeout(500)
                    pg.screenshot(path=str(SHOTS / f"{tab}_2.jpg"), type="jpeg", quality=55)
                except Exception:
                    pass
            except Exception as e:
                first, info = None, {"cards": 0, "len": 0, "bad": ["열기 실패: " + str(e)[:80]], "loading": 0}
            r = {"tab": tab, "s": first, **info, "errs": errs[:3]}
            print("  탭", tab, first, flush=True)
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
        # 🔗 누르면 제 화면으로 가나 (10/10: 클릭이 엉뚱한 곳으로 가로채이던 사고 뒤 추가)
        # 10/21: 홈 첫 화면 정리(673f9cd 「🧹 홈 더 줄임」)로 킥·성적표·종목 칸 모양이 바뀜 → 새 칸으로
        for start, sel, want in [("home", '#hmbody [data-goto="port~pokick"]', ("port", "pokick")), ("home", '#hmbody a[data-goto="score"]', ("score", None)),
                                 ("home", '#hmbody [data-op]', ("onepager", None)), ("score", '.sc-c[data-goto="market~mkfo"] .sc-h b', ("market", "mkfo")),
                                 ("home", '#bnav button[data-g="sig"]', (("whale", "cup", "gap", "screen", "sigmore", "accum", "danta"), None)), ("market", '#tabs .tab[data-k="sector"]', ("sector", None)), ("home", '.hm-big [data-goto="port~poconc"]', ("port", "poconc"))]:
            pg = ctx.new_page(); pg.on("dialog", lambda d: d.dismiss())
            try:
                pg.goto(APP + "?h=" + str(int(time.time())) + "#" + start, wait_until="domcontentloaded", timeout=45000)
                pg.wait_for_selector(sel, timeout=20000); pg.wait_for_timeout(800)
                pg.click(sel)
                # 10/19: 다른 탭 카드는 smooth.js 가 「창」(#peek iframe ?embed=1)으로 엶(10/15 사용자 「매끄럽게 열고 닫기」) — 창 속 화면도 정답으로 봄
                JS = """(w)=>{var pk=document.getElementById('peek');
                  if(pk){var f=pk.querySelector('iframe');try{var fw=f.contentWindow;return ['창:'+(fw.cur||''), w?!!fw.document.getElementById(w):true];}catch(e){return ['창?',false];}}
                  return [window.cur, w?!!document.getElementById(w):true];}"""
                for _ in range(16):
                    pg.wait_for_timeout(500); got = pg.evaluate(JS, want[1])
                    g0 = str(got[0]).replace("창:", "")
                    ok = (g0 in want[0] if isinstance(want[0], tuple) else g0 == want[0]) and got[1]
                    if ok: break
            except Exception as e:
                got, ok = [str(e)[:60]], False
            wn = "/".join(want[0]) if isinstance(want[0], tuple) else want[0]   # 묶음 버튼은 그 묶음에서 마지막에 본 탭으로 감(의도)
            res.append({"tab": "클릭 " + start + " → " + wn, "ok": ok, "got": got})
            if not ok:
                probs.append(f"클릭 연동 실패: #{start} 「{sel}」 → {wn} 기대, 실제 {got}")
            pg.close()
        # 🩺 10/29 ③ 모든 탭 버튼 다 눌러 보기
        sw = []
        for tab in tabs:
            pg = ctx.new_page(); pg.on("dialog", lambda d: d.dismiss())
            try:
                print("  버튼 점검", tab, flush=True)
                r = DC.sweep(pg, APP + "?s=" + str(int(time.time())) + "#" + tab, tab)
                sw.append(r); probs += DC.sweep_probs(r)
            except Exception as e:
                sw.append({"tab": tab, "fail": str(e)[:80]})
            pg.close()
        res.append({"tab": "버튼 다 눌러 보기", "sweep": sw, "buttons": sum(x.get("buttons", 0) for x in sw)})
        b.close()
    probs += anchor_check(lints)
    # 🩺 10/29 ② 화면 숫자 ↔ 원래 자료
    src = {}
    for k, u in (("home", MSR + "market/home.json"), ("port", MSR + "market/port.json"), ("kick", MSR + "market/kick.json"), ("live_kr", DA + "archive/x/live_kr.json")):
        try: src[k] = json.loads(web(u) or "null")
        except Exception: src[k] = None
    fok, fp = DC.facts(texts, src, NOW)
    probs += fp
    res.append({"tab": "숫자 맞추기", "ok": fok, "bad": fp})
    res.append({"tab": "내용 검사", "lint": {t: {k: v for k, v in L.items() if k not in ("ids_here", "anchors")} for t, L in lints.items()}})
    if retried: res.append({"tab": "재시도로 열림", "tabs": retried})
    return res, probs


def anchor_check(lints):
    """🩺 10/29 다른 탭 카드로 가는 단추(data-goto="port~pokick")를 앱 자신의 방식으로 눌러 그 칸이 실제로 열리나 (창·탭 어느 쪽이든)"""
    from playwright.sync_api import sync_playwright
    gs = sorted({g for L in lints.values() for g in L.get("anchors", []) if "~" in g})[:20]
    probs = []
    if not gs: return probs
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        ctx.route(re.compile(r"https://ntfy\.sh/.*"), lambda r: r.abort())
        if LOCAL:
            ctx.route("**/*", lambda r: (lambda f: r.fulfill(status=404, body="") if not f else r.fulfill(path=f))(local_path(r.request.url.replace("refs/heads/main", "main"))))
        for g in gs:
            k, a = g.split("~", 1)
            pg = ctx.new_page(); pg.on("dialog", lambda d: d.dismiss())
            try:
                pg.goto(APP + "?a=" + str(int(time.time())) + "#home", wait_until="domcontentloaded", timeout=45000); pg.wait_for_timeout(2500)
                pg.evaluate("(g)=>{var s=document.getElementById('kidsplash');if(s)s.remove();var x=document.createElement('button');x.setAttribute('data-goto',g);x.textContent='검사';(document.getElementById('main')||document.body).appendChild(x);x.click();}", g)
                ok = False
                for _ in range(12):
                    pg.wait_for_timeout(500)
                    ok = pg.evaluate("""(a)=>{if(document.getElementById(a))return true;var pk=document.getElementById('peek'),f=pk&&pk.querySelector('iframe');try{return !!(f&&f.contentWindow.document.getElementById(a));}catch(e){return false;}}""", a)
                    if ok: break
                if not ok: probs.append(f"단추 「{g}」 눌러도 #{k} 「{a}」 칸이 안 열림")
            except Exception as e:
                probs.append(f"단추 「{g}」 검사 실패: {str(e)[:60]}")
            pg.close()
        b.close()
    return probs


def job_checks():
    """⚙️ 자동 작업이 조용히 실패하고 있지 않나 (10/10: 종목 사진 작업이 4일째 「실패」였는데 아무도 몰랐음)"""
    out, probs = [], []
    tok = os.environ.get("GH_TOKEN", "")
    H = {"User-Agent": "ch-health", "Accept": "application/vnd.github+json", **({"Authorization": "Bearer " + tok} if tok else {})}
    def api(path):
        with urllib.request.urlopen(urllib.request.Request("https://api.github.com/repos/chkchp0702-spec/" + path, headers=H), timeout=30) as r:
            return json.loads(r.read().decode())
    for repo in ("daily-app", "market-strategy-report", "stock-screener", "Cup", "Gap", "whale40"):
        try:
            wfs = [w for w in api(f"{repo}/actions/workflows?per_page=100")["workflows"] if w.get("state") == "active"]
        except Exception:
            probs.append(f"{repo} 작업 목록을 못 읽음"); continue
        for w in wfs:                                            # 작업마다 마지막으로 끝난 실행 1개 (자주 도는 작업에 묻히지 않게)
            try:
                rs = api(f"{repo}/actions/workflows/{w['id']}/runs?status=completed&per_page=1")["workflow_runs"]
            except Exception:
                continue
            if not rs:
                continue
            x = rs[0]
            bad = x.get("conclusion") not in ("success", "skipped", "cancelled", "neutral")
            out.append({"repo": repo, "job": w["name"], "ok": not bad, "when": x["created_at"][:16]})
            if bad:
                probs.append(f"작업 실패: {repo}/{w['name']} ({x['created_at'][5:16]} {x.get('conclusion')})")
    return out, probs


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
    jobs, p3 = job_checks() if not LOCAL else ([], [])
    probs = p1 + p2 + p3
    fixed = week_fixed()
    out = {"at": NOW.strftime("%Y-%m-%d %H:%M"), "ok": not probs, "problems": probs, "data": data, "app": app, "jobs": jobs, "week_fixed": fixed,
           "note": "매일 16:30 자동 검사. 「자가 업그레이드」(16:47)가 problems 를 먼저 고친다."}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({"ok": out["ok"], "problems": probs}, ensure_ascii=False, indent=1))
    if LOCAL: return
    sunday = NOW.weekday() == 6
    urgent = [x for x in probs if re.search(r"오류|실패|깨짐|못 받음", x)]   # 작업 실패도 바로 알림
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
