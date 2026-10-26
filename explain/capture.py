"""🎬 조이 설명 영상용 실제 앱 화면 찍기 — 휴대폰 크기(390px, 2배)로 각 화면을 열고
긴 세로 스크린샷 + 카드 위치 + 조이가 있는 자리(카드 머리·접기 ⓘ·「ⓘ 설명」·「ⓘ …」 접는 칸)의 설명 글을
explain/cap/<key>.png / .json 에 저장."""
import json, os, sys, time
from playwright.sync_api import sync_playwright

APP = "https://chkchp0702-spec.github.io/daily-app/"
OUT = "explain/cap"
os.makedirs(OUT, exist_ok=True)
TARGETS = ["home", "market", "sector", "prob", "port", "score", "whale", "cup", "gap", "screen", "sigmore",
           "bond", "fund", "els", "feed"]
MAXH = 4200  # 한 화면에서 찍는 최대 높이(css px)

CLEAN = """() => {
  for (const id of ['kidsplash','gdq','netbar','backbtn','sheet']) { const e = document.getElementById(id); if (e) e.remove(); }
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
  document.querySelectorAll('#main h3.tt-h, #main .mk-lab.tt-h').forEach((h, i) => { if (!vis(h)) return;
    const c = h.cloneNode(true); c.querySelectorAll('.mut,button,select,input,.fchev,.tt-i,a.btn,.gd-b,.gd-i').forEach(x => x.remove());
    out.push({kind: 'card', sel: `#main h3.tt-h, #main .mk-lab.tt-h`, idx: i, title: clean(c.textContent), ...box(card(h))}); });
  document.querySelectorAll('#main .fold-h .tt-i').forEach((b, i) => { if (!vis(b)) return;
    const h = b.closest('.fold-h'), c = h.cloneNode(true); c.querySelectorAll('.mut,button,select,input,.fchev,.tt-i,.gd-b,.gd-i').forEach(x => x.remove());
    out.push({kind: 'fold', sel: '#main .fold-h .tt-i', idx: i, title: clean(c.textContent), ...box(card(h))}); });
  document.querySelectorAll('#main .nt-b').forEach((b, i) => { if (!vis(b)) return;
    out.push({kind: 'note', sel: '#main .nt-b', idx: i, title: clean((card(b).querySelector('h3,.fold-h,.mk-lab,summary') || {}).textContent) || '설명', ...box(card(b))}); });
  document.querySelectorAll('#main summary').forEach((s, i) => { if (!vis(s) || !s.querySelector('.gd-i')) return;
    out.push({kind: 'sum', sel: '#main summary', idx: i, title: clean(s.textContent), ...box(s.parentElement)}); });
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
    if (kind === 'sum' && el.parentElement.open) el.parentElement.open = false;
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
            pg.evaluate(f"go('{key}')")
            pg.wait_for_timeout(7000)
            pg.evaluate("() => { for (const id of ['kidsplash','gdq']) { const e = document.getElementById(id); if (e) e.remove(); } }")
            spots = pg.evaluate(SPOTS)
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
    b.close()
open(f"{OUT}/log.txt", "w").write("\n".join(log))
print("\n".join(log))
