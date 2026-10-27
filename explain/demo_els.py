"""🎬 ELS 설계기 「직접 해 보는」 영상용 장면 찍기 (10/27 사용자: 설계 어떻게 하는지 + 과거 재생으로 확률 보여 주는 부분을 영상으로)
🛍 상품 → 🎯 ELS → 🎛 설계 를 열고, 실제로 칩을 누르고 막대를 밀고 KI 를 바꿔 가며 휴대폰 창 크기(390×504)로 찍는다.
결과: explain/cap/demo_els_dz/<n>.png + scenes.json  (build.py 의 demo 영상이 씀)"""
import json, os

VW, VH = 390, 504          # build.py 휴대폰 창(580×750)과 같은 비율
NAME = "demo_els_dz"
TITLE = "🎛 ELS 내 맘대로 설계기"   # 카드 머리 조이 제목(이 제목으로 영상이 붙음)

RECT = """(sel) => { const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!e) return null;
  const r = e.getBoundingClientRect(); return {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height)}; }"""
UNION = """(sels) => { let a = null; for (const s of sels) { const e = document.querySelector(s); if (!e) continue; const r = e.getBoundingClientRect();
  if (!a) a = {l: r.left, t: r.top, r: r.right, b: r.bottom}; else { a.l = Math.min(a.l, r.left); a.t = Math.min(a.t, r.top); a.r = Math.max(a.r, r.right); a.b = Math.max(a.b, r.bottom); } }
  return a && {x: Math.round(a.l), y: Math.round(a.t), w: Math.round(a.r - a.l), h: Math.round(a.b - a.t)}; }"""
SCROLL = """([sel, off]) => { document.documentElement.style.scrollBehavior = 'auto'; const e = document.querySelector(sel); if (!e) return; window.scrollTo({top: e.getBoundingClientRect().top + window.scrollY - off, behavior: 'instant'}); }"""
TEXT = """(sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\\s+/g, ' ').trim() : ''; }"""


def run(pg, clean, out_root):
    out = f"{out_root}/{NAME}"
    os.makedirs(out, exist_ok=True)
    pg.set_viewport_size({"width": VW, "height": VH})
    pg.evaluate("go('els')")
    pg.wait_for_timeout(7000)
    pg.evaluate("() => { for (const id of ['kidsplash','gdq']) { const e = document.getElementById(id); if (e) e.remove(); } }")
    pg.click('#pdseg button[data-k="design"]')
    pg.wait_for_selector("#elsdz .dz-big", timeout=60000)
    pg.wait_for_timeout(2500)
    pg.evaluate(clean)
    n = [0]
    sc = []

    def shot():
        n[0] += 1
        f = f"{n[0]}.png"
        pg.wait_for_timeout(900)
        pg.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
        pg.screenshot(path=f"{out}/{f}")
        return f

    def at(sel, off=70):
        pg.evaluate(SCROLL, [sel, off]); pg.wait_for_timeout(400)

    def center(sel):
        r = pg.evaluate(RECT, sel); return [r["x"] + r["w"] // 2, r["y"] + r["h"] // 2] if r else None

    def wait_calc():
        pg.wait_for_timeout(600)
        pg.wait_for_function("() => document.querySelector('#elsdz .dz-big') && !document.querySelector('#dzres .loading')", timeout=60000)
        pg.wait_for_timeout(900)

    # 0. 카드 머리
    at("#elsdz section.dz h3", 14)
    sc.append({"img": shot(), "ring": pg.evaluate(UNION, ["#elsdz section.dz h3", "#elsdz .dz-sub"]),
               "say": "🎛 설계 칸에서는 ELS 조건을 내 손으로 바꿔 보고, 과거라면 어떻게 끝났을지 확률로 바로 봐요."})
    # 1. 기초자산 칩 누르기 (나스닥100 → 가장 먼저 고른 것이 빠지고 새로 들어감)
    at("#elsdz .dz-sec", 14)
    tgt = '#elsdz [data-ua="NASDAQ100"]'
    before = shot(); tap = center(tgt)
    pg.evaluate(f"document.querySelector('{tgt}').click()")
    wait_calc(); pg.evaluate(SCROLL, ["#elsdz .dz-sec", 14]); pg.wait_for_timeout(300)
    sc.append({"img": before, "tap": tap, "post": shot(), "ring": pg.evaluate(RECT, "#elsdz .dz-sec"),
               "say": "① 기초자산을 눌러 골라요. 최대 3개, 여럿이면 그중 가장 못한 것 기준으로 따져요."})
    # 2. 첫 상환 막대 밀기 85 → 90
    at("#dzf", 150)
    before = shot()
    r = pg.evaluate(RECT, "#dzf")
    v0, v1 = 85, 90
    x0 = r["x"] + r["w"] * (v0 - 70) / 30; x1 = r["x"] + r["w"] * (v1 - 70) / 30
    pg.evaluate("() => { const f = document.getElementById('dzf'); f.value = 90; f.dispatchEvent(new Event('input')); f.dispatchEvent(new Event('change')); }")
    wait_calc(); pg.evaluate(SCROLL, ["#dzf", 150]); pg.wait_for_timeout(300)
    lad = pg.evaluate(TEXT, "#dzlad")
    sc.append({"img": before, "drag": [round(x0), r["y"] + r["h"] // 2, round(x1)], "post": shot(),
               "ring": pg.evaluate(UNION, ["#dzf", "#dzl", "#dzlad"]),
               "say": "② 막대를 밀면 상환 조건이 바뀌어요. 첫 상환을 90%로 올리면 → " + lad.replace("조건 ", "")})
    # 3. KI 바꾸기 45 → 35
    at('[data-dz="ki"]', 200)
    tgt = '[data-dz="ki"] button[data-v="35"]'
    before = shot(); tap = center(tgt)
    pg.evaluate(f"document.querySelector('{tgt}').click()")
    wait_calc(); pg.evaluate(SCROLL, ['[data-dz="ki"]', 200]); pg.wait_for_timeout(300)
    sc.append({"img": before, "tap": tap, "post": shot(), "ring": pg.evaluate(UNION, ['[data-dz="ki"]', '[data-dz="mat"]']),
               "say": "③ 낙인(KI)은 중간에 한 번이라도 이 아래로 가면 만기 손실이 되는 선이에요. 낮출수록 안전해요. ④ 만기는 1~3년."})
    # 4. 결과 — 과거 재생 확률
    at("#dzres", 60)
    big = pg.evaluate("() => [...document.querySelectorAll('#elsdz .dz-big > div')].map(d => [d.querySelector('small').textContent, d.querySelector('b').textContent])")
    ms = pg.evaluate(TEXT, "#elsdz .dz-ms")
    import re
    m = re.search(r"([\d,]+)번 가입", ms)
    cnt = m.group(1) if m else "수천"
    img = shot()
    sc.append({"img": img, "ring": pg.evaluate(RECT, "#elsdz .dz-big"),
               "say": f"바꾸는 순간 2006년부터 매 거래일 가입했다고 치고 {cnt}번을 휴대폰에서 바로 다시 계산해요."})
    sc.append({"img": img, "ring": pg.evaluate(RECT, "#elsdz .dz-big"),
               "say": "결과는 확률로 나와요: " + " · ".join(f"{a} {b}" for a, b in big) + "."})
    dl = pg.evaluate(RECT, "#elsdz .dz-dl")
    if dl:
        sc.append({"img": img, "ring": dl, "say": "조건을 바꾸기 전보다 좋아졌는지(초록) 나빠졌는지(빨강)도 %p로 바로 알려 줘요."})
    # 5. 🎬 과거 재생 줄
    band = pg.evaluate("""() => { const r = document.getElementById('dzres'); if (!r) return null; const c = [...r.children].find(x => /과거 재생/.test(x.textContent) && !x.classList.contains('dz-big')); if (!c) return null; c.id = c.id || 'dzband'; return '#' + c.id; }""")
    if band:
        at(band, 60)
        sc.append({"img": shot(), "ring": pg.evaluate(RECT, band),
                   "say": "🎬 과거 재생 줄에는 몇 년 몇 번 가입을 셌는지, 손실은 어느 해 가입분에서 났고 평균 얼마였는지, 어떤 기초자산이 발목을 잡았는지까지 나와요."})
    # 6. 가까운 실제 상품
    at("#dznear", 60)
    sc.append({"img": shot(), "ring": pg.evaluate(RECT, "#dznear"),
               "say": "🎯 아래엔 지금 청약 중인 실제 상품 중 이 조건과 가장 가까운 3개 — 연 수익률과 그 상품의 과거 재생 확률이 같이 나와요."})
    sc.append({"img": sc[-1]["img"], "ring": None,
               "say": "⚠️ 과거 계산일 뿐 미래를 보장하지 않고, 사라는 뜻도 아니에요. 조건끼리 견줘 보는 데 써요."})
    json.dump({"title": TITLE, "vw": VW, "vh": VH, "scenes": sc}, open(f"{out}/scenes.json", "w"), ensure_ascii=False, indent=1)
    return f"{NAME}: 장면 {len(sc)}"
