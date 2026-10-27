"""🎬 조이 설명 영상용 실제 앱 화면 찍기 — 휴대폰 크기(390px, 2배)로 각 화면을 열고
긴 세로 스크린샷 + 카드 위치 + 조이가 있는 자리(카드 머리·접기 ⓘ·「ⓘ 설명」·「ⓘ …」 접는 칸)의 설명 글을
explain/cap/<key>.png / .json 에 저장."""
import json, os, re, sys, time
from playwright.sync_api import sync_playwright

APP = os.environ.get("APP_URL", "https://chkchp0702-spec.github.io/daily-app/")
OUT = "explain/cap"
os.makedirs(OUT, exist_ok=True)
TARGETS = ["home", "market", "sector", "prob", "port", "score", "whale", "cup", "gap", "screen", "sigmore",
           "bond", "fund", "els", "feed",
           # 10/27 사용자 「조이 사진 있는 곳은 다」 — 나머지 탭 + 종목리포트(onepager) + 고래 운용사 시트(mgr)
           "accum", "danta", "onepager", "alarm", "idea", "mgr"]

# 오늘 탭의 조이 그림 자리(날씨판 꼬마·세 컷 만화·배지·첫 인사) — 앱 글이 없어서 여기서 씀(today.js 머리 설명 그대로)
HOME_X = [
    ("#tdhero", "🌤 오늘 날씨판", [
        "맨 위 날씨판은 오늘 시장을 날씨로 보여 줘요.",
        "크게 오르면 ☀️ 맑음, 조금 오르면 🌤, 제자리면 ☁️ 흐림, 내리면 🌧 비, 크게 내리면 ⛈ 폭풍이에요. 제 표정도 같이 바뀌어요.",
        "큰 숫자는 지금 가장 중요한 숫자 하나예요. 아침엔 밤사이 미국, 장중엔 지금 코스피, 저녁엔 오늘 마감, 밤엔 미국 선물이에요.",
        "아래 작은 칸은 S&P500·내 포트, 동그란 칩은 오늘의 배지예요.",
        "날씨판을 누르면 시장 탭으로 가요. 카드를 길게 누르면 제가 한 줄씩 요약해 줘요!"]),
    ("#hmpanic, .tz-comic", "🎞 그날 팔았다면?", [
        "크게 떨어진 날엔, 2000년 이후 같은 급락일들을 되짚은 세 컷 만화가 떠요.",
        "① 깜짝 놀라 팔고 싶어지는 순간이에요.",
        "② 그날 팔았다가 시간이 지나 돌아왔다면, 놓친 몫이 얼마였는지 보여 줘요.",
        "③ 반대로 그날 더 샀다면 120거래일 뒤 평균이 어땠는지예요.",
        "숫자 표는 「숫자로 자세히」에 있어요. 과거 평균일 뿐, 앞으로를 약속하지는 않아요."]),
    (".tz-bdg", "🏆 오늘의 배지", [
        "날씨판 아래 동그란 칩이 오늘의 배지예요.",
        "어제 S&P500을 이겼는지, 예고가 맞았는지, 시장 절반 넘게 앞섰는지, 며칠 연속 왔는지에 따라 받아요.",
        "배지를 누르면 왜 받았는지 알려 줘요."]),
    ("#tdhero", "👋 조이 인사", [
        "안녕하세요! 저는 어플 안내자 조이(Joey)예요.",
        "어려운 투자 이야기, 제가 쉽게 알려 줄게요.",
        "제 얼굴이 보이는 곳은 어디든 눌러 보세요. 그 자리를 영상으로 설명해 줘요!"]),
]
XRECT = """(sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect();
  return {y: Math.round(r.top + scrollY), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width)}; }"""
MAXH = 9000  # 한 화면에서 찍는 최대 높이(css px)

CLEAN = """() => {
  for (const id of ['kidsplash','gdq','netbar','backbtn']) { const e = document.getElementById(id); if (e) e.remove(); }
  document.querySelectorAll('.toast,.vtip,.tt-x').forEach(e => e.remove());
  document.querySelectorAll('.tt-on').forEach(e => e.classList.remove('tt-on'));
  // 비밀번호 칸이 있는 카드(사모 라인업 등)는 영상에 넣지 않음
  document.querySelectorAll('input[type=password]').forEach(i => { const c = i.closest('section.card, .card, .fold, details') || i.parentElement; if (c) c.style.setProperty('display', 'none', 'important'); });
  for (const e of document.querySelectorAll('body *')) {
    const p = getComputedStyle(e).position;
    if (p === 'fixed') e.style.setProperty('display', 'none', 'important');
    else if (p === 'sticky') e.style.setProperty('position', 'static', 'important');
  }
}"""

RECTS = """() => {
  const sel = 'section.card, .card, .fold, details, section.hero';
  const all = [...document.querySelectorAll(sel)].filter(e => {
    const r = e.getBoundingClientRect(); return r.height > 70 && r.width > 200;
  });
  const top = all.filter(e => !all.some(o => o !== e && o.contains(e)));
  const sy = window.scrollY;
  return top.map(e => { const r = e.getBoundingClientRect();
    const h = e.querySelector('h1,h2,h3,summary,.fold-h');
    return {y: Math.round(r.top + sy), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width),
            t: (h ? h.textContent : e.textContent).trim().slice(0, 40)}; })
    .filter(r => r.y + r.h > 0);
}"""

# 조이가 있는 자리 목록: [{kind, idx, title, y, h, x, w}]  (텍스트는 하나씩 눌러서 읽음)
SPOTS = """() => {
  const sy = window.scrollY, out = [];
  const box = e => { const r = e.getBoundingClientRect(); return {y: Math.round(r.top + sy), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width)}; };
  const card = e => e.closest('.fold') || e.closest('section.card') || e.closest('.card') || e.closest('details') || e.parentElement;
  const clean = t => (t || '').replace(/ⓘ|▴|▾|▸|▼|▲|접기|펼치기|눌러서 열고 닫기|조이 설명/g, '').replace(/\\s+/g, ' ').trim();
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('input[type=password]') && !card(e).querySelector('input[type=password]'); };
  document.querySelectorAll(':is(#main,#sheet) h3.tt-h, :is(#main,#sheet) .mk-lab.tt-h').forEach((h, i) => { if (!vis(h)) return;
    const c = h.cloneNode(true); c.querySelectorAll('.mut,button,select,input,.fchev,.tt-i,a.btn,.gd-b,.gd-i').forEach(x => x.remove());
    out.push({kind: 'card', sel: ':is(#main,#sheet) h3.tt-h, :is(#main,#sheet) .mk-lab.tt-h', idx: i, title: clean(c.textContent), ...box(card(h))}); });
  document.querySelectorAll(':is(#main,#sheet) .fold-h .tt-i').forEach((b, i) => { if (!vis(b)) return;
    const h = b.closest('.fold-h'), c = h.cloneNode(true); c.querySelectorAll('.mut,button,select,input,.fchev,.tt-i,.gd-b,.gd-i').forEach(x => x.remove());
    out.push({kind: 'fold', sel: ':is(#main,#sheet) .fold-h .tt-i', idx: i, title: clean(c.textContent), ...box(card(h))}); });
  document.querySelectorAll(':is(#main,#sheet) .nt-b').forEach((b, i) => { if (!vis(b)) return;
    out.push({kind: 'note', sel: ':is(#main,#sheet) .nt-b', idx: i, title: clean((card(b).querySelector('h3,.fold-h,.mk-lab,summary') || {}).textContent) || '설명', ...box(card(b))}); });
  document.querySelectorAll(':is(#main,#sheet) summary').forEach((s, i) => { if (!vis(s) || !s.querySelector('.gd-i')) return;
    out.push({kind: 'sum', sel: ':is(#main,#sheet) summary', idx: i, title: clean(s.textContent), ...box(s.parentElement)}); });
  // ① 풍선 도움말 칩(data-tip, 그래프 밖) · ② 회색 설명 줄(.td-n)
  document.querySelectorAll(':is(#main,#sheet) [data-tip]').forEach((x, i) => { if (!vis(x) || x.closest('svg') || !x.getAttribute('data-tip') || x.closest('a,input,select,textarea,[data-goto],[data-op]')) return;
    const lab = clean(x.textContent); const c = card(x);
    out.push({kind: 'tip', sel: ':is(#main,#sheet) [data-tip]', idx: i, title: lab && lab.length <= 30 ? lab : clean((c.querySelector('h3,.fold-h,.mk-lab,summary') || {}).textContent) || '설명', ...box(c)}); });
  document.querySelectorAll(':is(#main,#sheet) .td-n').forEach((x, i) => { if (!vis(x) || document.documentElement.classList.contains('td-off')) return;
    const c = card(x);
    out.push({kind: 'td', sel: ':is(#main,#sheet) .td-n', idx: i, title: clean((c.querySelector('h3,.fold-h,.mk-lab,summary') || {}).textContent) || '설명', ...box(c)}); });
  return out;
}"""

# 하나를 눌러 조이 말풍선(#gdq)의 글을 읽고 닫음
READ = """([sel, idx, kind]) => new Promise(res => {
  const el = document.querySelectorAll(sel)[idx]; if (!el) return res(null);
  const tgt = kind === 'card' ? (el.querySelector('.gd-b') || el) : el;
  tgt.scrollIntoView({block: 'center'});
  tgt.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
  setTimeout(() => {
    const q = document.getElementById('gdq'); if (!q) return res(null);
    const t = q.querySelector('.gd-t'), L = [...q.querySelectorAll('.gd-l')].map(p => p.textContent.trim()).filter(Boolean);
    const go = [...q.querySelectorAll('[data-goto]')].map(b => b.textContent.trim());
    q.remove();
    document.querySelectorAll('.tt-x').forEach(e => e.remove()); document.querySelectorAll('.tt-on').forEach(e => e.classList.remove('tt-on'));
    res({title: t ? t.textContent.trim() : '', lines: L, go});
  }, 700);
})"""

only = sys.argv[1:]
log = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, color_scheme="light")
    pg.goto(APP + "?t=" + str(int(time.time())), wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_timeout(12000)
    for key in TARGETS:
        name = key
        if only and name not in only:
            continue
        try:
            pg.set_viewport_size({"width": 390, "height": 844})
            if key == "onepager":       # 종목리포트: 고래 TOP 10 첫 종목을 엶
                pg.evaluate("go('whale')"); pg.wait_for_timeout(6000)
                code = pg.evaluate("(document.querySelector('[data-op]') || {getAttribute: () => '005930'}).getAttribute('data-op')")
                pg.evaluate(f"openOP({json.dumps(code)})")
            elif key == "mgr":          # 고래 운용사 보유 종목 시트
                pg.evaluate("go('whale')"); pg.wait_for_timeout(6000)
                nm = pg.evaluate("(document.querySelector('[data-mgr]') || {getAttribute: () => ''}).getAttribute('data-mgr')")
                if nm: pg.evaluate(f"openMgr({json.dumps(nm)})")
            else:
                pg.evaluate(f"go('{key}')")
            pg.wait_for_timeout(7000)
            pg.evaluate("() => { for (const id of ['kidsplash','gdq']) { const e = document.getElementById(id); if (e) e.remove(); } }")
            if key == "mgr":            # 시트를 화면 그대로 찍도록 펼침
                pg.evaluate("() => { const s = document.getElementById('sheet'); if (!s) return; s.style.cssText += ';position:static!important;overflow:visible!important;height:auto!important;animation:none!important';"
                            " const m = document.getElementById('main'); if (m) m.style.display = 'none'; const h = document.querySelector('header'); if (h) h.style.display = 'none'; }")
            # 접힌 칸(.fold · details)을 다 펼쳐서 안쪽 조이 자리까지
            pg.evaluate("() => { document.querySelectorAll(':is(#main,#sheet) .fold:not(.open)').forEach(f => f.classList.add('open')); document.querySelectorAll(':is(#main,#sheet) details:not([open])').forEach(d => { d.open = true; }); }")
            pg.wait_for_timeout(2500)
            spots = pg.evaluate(SPOTS)
            # 같은 화면에 같은 제목은 하나만(표 줄마다 같은 칩 등)
            seen = set(); spots = [x for x in spots if not (x["title"] in seen or seen.add(x["title"]))]
            # 풍선 칩·회색 줄 중 제목에 숫자·%가 있는 것은 오늘 자료(종목 점수·등락)이지 설명이 아님 → 뺌
            spots = [x for x in spots if not (x["kind"] in ("tip", "td") and re.search(r"[\d%]", x["title"]))]
            for s in spots:
                try:
                    r = pg.evaluate(READ, [s["sel"], s["idx"], s["kind"]])
                except Exception as ex:
                    r = None; s["err"] = str(ex)[:120]
                if r and r["lines"]:
                    s["lines"] = r["lines"]; s["go"] = r["go"]
                    if r["title"]: s["title"] = r["title"]
                else:
                    s["lines"] = []
            spots = [s for s in spots if s["lines"]]
            pg.evaluate("window.scrollTo(0,0)")
            if key == "home":
                for sel, title, lines in HOME_X:
                    r = None
                    for one in sel.split(", "):
                        r = r or pg.evaluate(XRECT, one)
                    spots.append({"kind": "x", "title": title, "lines": lines, **(r or {"y": 0, "h": 400, "x": 14, "w": 362})})
            if key != "mgr":
                pg.evaluate("() => { const e = document.getElementById('sheet'); if (e) e.remove(); }")
            pg.evaluate(CLEAN)
            pg.wait_for_timeout(600)
            H = pg.evaluate("document.documentElement.scrollHeight")
            h = min(MAXH, H)
            rects = pg.evaluate(RECTS)
            pg.screenshot(path=f"{OUT}/{name}.png", full_page=True, clip={"x": 0, "y": 0, "width": 390, "height": h})
            json.dump({"key": key, "h": h, "rects": rects, "spots": spots}, open(f"{OUT}/{name}.json", "w"), ensure_ascii=False)
            log.append(f"{name}: {h}px, 카드 {len(rects)}, 조이 자리 {len(spots)}")
        except Exception as e:
            log.append(f"{name}: 오류 {str(e)[:200]}")
        pg.goto(APP + "?t=" + str(int(time.time())), wait_until="domcontentloaded", timeout=90000)
        pg.wait_for_timeout(9000)
    # 🎬 10/27 ELS 설계기 「직접 해 보는」 영상 장면 (demo_els.py)
    if not only or "els" in only:
        try:
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            import demo_els
            log.append(demo_els.run(pg, CLEAN, OUT))
        except Exception as e:
            log.append(f"demo_els: 오류 {str(e)[:200]}")
    b.close()
open(f"{OUT}/log.txt", "w").write("\n".join(log))
print("\n".join(log))
