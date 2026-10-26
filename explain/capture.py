"""🎬 조이 설명 영상용 실제 앱 화면 찍기 — 휴대폰 크기(390px, 2배)로 각 화면을 열고
긴 세로 스크린샷 + 카드 위치를 explain/cap/<key>.png / .json 에 저장."""
import json, os, sys, time
from playwright.sync_api import sync_playwright

APP = "https://chkchp0702-spec.github.io/daily-app/"
OUT = "explain/cap"
os.makedirs(OUT, exist_ok=True)
# 영상 이름 → 열 화면(go 키)
TARGETS = {
    "t_home": "home", "t_mkt": "market", "t_inv": "port", "t_sig": "whale", "t_prod": "bond", "t_feed": "feed",
    "m_home": "home", "m_market": "market", "m_sector": "sector", "m_prob": "prob", "m_port": "port", "m_score": "score",
    "m_whale": "whale", "m_cup": "cup", "m_gap": "gap", "m_screen": "screen", "m_sigmore": "sigmore",
    "m_bond": "bond", "m_fund": "fund", "m_els": "els", "m_feed": "feed",
}
MAXH = 4200  # 한 화면에서 찍는 최대 높이(css px)

CLEAN = """() => {
  for (const id of ['kidsplash','gdq','netbar','backbtn','sheet']) { const e = document.getElementById(id); if (e) e.remove(); }
  document.querySelectorAll('.toast,.vtip').forEach(e => e.remove());
  for (const e of document.querySelectorAll('body *')) {
    const p = getComputedStyle(e).position;
    if (p === 'fixed') e.style.setProperty('display', 'none', 'important');
    else if (p === 'sticky') e.style.setProperty('position', 'static', 'important');
  }
}"""

RECTS = """(y0) => {
  const sel = 'section.card, .card, .fold, details, section.hero';
  const all = [...document.querySelectorAll(sel)].filter(e => {
    const r = e.getBoundingClientRect(); return r.height > 70 && r.width > 200;
  });
  const top = all.filter(e => !all.some(o => o !== e && o.contains(e)));
  const sy = window.scrollY;
  return top.map(e => { const r = e.getBoundingClientRect();
    const h = e.querySelector('h1,h2,h3,summary,.fold-h');
    return {y: Math.round(r.top + sy - y0), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width),
            t: (h ? h.textContent : e.textContent).trim().slice(0, 40)}; })
    .filter(r => r.y + r.h > 0);
}"""

only = sys.argv[1:]
log = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, color_scheme="light")
    pg.goto(APP + "?t=" + str(int(time.time())), wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_timeout(12000)
    for name, key in TARGETS.items():
        if only and name not in only:
            continue
        try:
            pg.set_viewport_size({"width": 390, "height": 844})
            pg.evaluate(f"go('{key}')")
            pg.wait_for_timeout(7000)
            pg.evaluate(CLEAN)
            pg.wait_for_timeout(600)
            y0 = 0
            H = pg.evaluate("document.documentElement.scrollHeight")
            h = min(MAXH, H - y0)
            rects = pg.evaluate(RECTS, y0)
            pg.screenshot(path=f"{OUT}/{name}.png", full_page=True, clip={"x": 0, "y": y0, "width": 390, "height": h})
            json.dump({"key": key, "h": h, "rects": rects}, open(f"{OUT}/{name}.json", "w"), ensure_ascii=False)
            log.append(f"{name}: {h}px, 카드 {len(rects)}")
        except Exception as e:
            log.append(f"{name}: 오류 {str(e)[:200]}")
        pg.goto(APP + "?t=" + str(int(time.time())), wait_until="domcontentloaded", timeout=90000)
        pg.wait_for_timeout(9000)
    b.close()
open(f"{OUT}/log.txt", "w").write("\n".join(log))
print("\n".join(log))
