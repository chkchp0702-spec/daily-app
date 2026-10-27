"""🎬 조이 설명 영상 만들기 — capture.py 가 찍은 실제 앱 화면 + guide.js 설명 글로
HyperFrames 프로젝트를 만들고 렌더링한다. 결과: explain/out/<name>.mp4 (720×1280, 소리 없음)"""
import html, json, os, re, shutil, subprocess, sys
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
CAP, BUILD, OUT = f"{ROOT}/cap", f"{ROOT}/build", f"{ROOT}/out"
os.makedirs(OUT, exist_ok=True)
T = json.load(open(f"{ROOT}/texts.json"))
NAME = {"home": "🏠 오늘", "mkt": "🌐 시장", "inv": "💼 포트", "sig": "🎯 신호", "prod": "🛍️ 상품", "feed": "📰 피드"}
MORE_NAME = {"home": "🏠 오늘", "market": "🌐 시황", "sector": "🧭 나침반", "prob": "🎲 시장확률", "port": "💼 포트",
             "score": "📊 성적표", "whale": "🐋 고래", "cup": "☕ 컵", "gap": "📈 갭", "screen": "🔎 거르기",
             "sigmore": "🗂 더 보기", "bond": "🏦 채권", "fund": "📦 펀드", "els": "🎯 ELS", "feed": "📰 피드"}
POSE = {"home": "kid_thumb", "mkt": "kid_globe", "inv": "kid_piggy", "sig": "kid_detect", "prod": "kid_piggy", "feed": "kid_wave",
        "market": "kid_globe", "sector": "kid_globe", "prob": "kid_think", "port": "kid_piggy", "score": "kid_joy",
        "whale": "kid_detect", "cup": "kid_detect", "gap": "kid_detect", "screen": "kid_detect", "sigmore": "kid_detect",
        "bond": "kid_piggy", "fund": "kid_piggy", "els": "kid_think",
        "accum": "kid_detect", "danta": "kid_detect", "onepager": "kid_detect", "alarm": "kid_wave", "idea": "kid_think", "mgr": "kid_detect"}

W, H = 720, 1280
PX, PY, PW, PH = 70, 150, 580, 750          # 휴대폰 창
S = PW / 390                                  # css px → 영상 px
WH = PH / S                                   # 창에 보이는 css 높이


VIDEOS = {"t_home": ["home"], "t_mkt": ["market", "sector", "prob"], "t_inv": ["port", "score"],
          "t_sig": ["whale", "cup", "gap"], "t_prod": ["bond", "fund", "els"], "t_feed": ["feed"]}
for _k in MORE_NAME:
    VIDEOS["m_" + _k] = [_k]
MARK = {"market": "🌐", "sector": "🧭", "prob": "🎲", "port": "💼", "score": "📊", "whale": "🐋", "cup": "☕",
        "gap": "📈", "bond": "🏦", "fund": "📦", "els": "🎯"}


def norm(t):
    """guide.js 의 vkey() 와 똑같이: 공백·숫자·기호를 빼고 소문자 24자"""
    t = re.sub(r"[\s\d·:%,.()\[\]~\-–—+/…?!「」『』()−▲▼△▽›‹]", "", t or "")
    t = re.sub(r"(미국|한국|일본|중국|홍콩)시장은어느국면인가", "", t)      # 고른 나라에 따라 바뀌는 부제(10/27)
    return t.lower()[:24]


# 10/27 사용자 「한국 고르고 눌렀는데 미국 시장은~ 이라고 설명」 — 찍을 때 고른 나라·시각이 글에 박히는 줄은 어느 때나 맞는 글로
LINE_FIX = [
    (r"^(미국|한국|일본|중국|홍콩) 시장은 어느 국면인가$", "나라 칩(미국·한국·일본·중국·홍콩)을 누르면 그 나라 시장이 지금 어느 국면인지 보여 줘요."),
    (r"한국시각 \d{1,2}:\d{2} 기준 · ", ""),
    (r"열린 시장은 \d{1,2}:\d{2} 지금 등락으로", "열린 시장은 지금 등락으로"),
]


def fix_line(t):
    for a, b in LINE_FIX:
        t = re.sub(a, b, t)
    return t.strip()


def spot_videos():
    """cap/<screen>.json 의 spots → {name: (screen, spot)} · 같은 화면에 같은 제목이 둘이면 앞 것만"""
    out, seen = {}, set()
    for scr in sorted(os.listdir(CAP)):
        if not scr.endswith(".json"):
            continue
        k = scr[:-5]
        for sp in json.load(open(f"{CAP}/{scr}")).get("spots", []):
            key = k + "|" + norm(sp["title"])
            if key in seen or not sp.get("lines"):
                continue
            seen.add(key)
            out[f"c_{k}_{len([x for x in out if x.startswith('c_' + k + '_')]) + 1}"] = (k, sp, key)
    return out


def split_lines(L, maxc=44, cap=18):
    """긴 문단은 문장(…요. / …다. / …죠.)으로 나누고, 44자가 넘으면 쉼표·가운뎃점·→ 에서 한 번 더(한 화면에 한 가지).
    괄호 안은 자르지 않고, 남는 꼬리가 10자 이하면 앞에 붙여 둠"""
    out = []
    for t in L:
        t = fix_line(re.sub(r"\s+", " ", str(t)).strip())
        parts = re.split(r"(?<=[.!?。])\s+(?=\S)", t)
        for p in parts:
            while len(p) > maxc + 10:
                cut = max(p.rfind(", ", 12, maxc), p.rfind(" · ", 12, maxc), p.rfind(" — ", 12, maxc), p.rfind(" → ", 12, maxc))
                if cut < 12:
                    cut = p.rfind(" ", 12, maxc)
                if cut < 12:
                    cut = maxc
                op = max(p.rfind("(", 0, cut), p.rfind("（", 0, cut))
                if op > p.rfind(")", 0, cut):                  # 괄호 안: 닫는 괄호 뒤(가까우면) 또는 괄호 앞에서
                    cl = p.find(")", cut)
                    if 0 <= cl <= maxc + 26 and len(p) - cl > 10:
                        cut = cl + 1
                    elif cl < 0 or len(p) - cl <= 10:
                        cut = len(p) if len(p) <= maxc + 30 else (op if op >= 12 else cut)
                    elif op >= 12:
                        cut = op
                head = p[:cut].rstrip(" ,·—→")
                if p[cut:].lstrip().startswith("→"):            # 화살표는 다음 줄 머리로
                    head = p[:cut].rstrip()
                out.append(head.strip()); p = p[cut:].strip(" ,·—")
            if p:
                out.append(p)
    return [x for x in out if len(x) > 1][:cap]


# ── 10/27 연출 보강 (HyperFrames 설명 영상 규칙): ① 동그라미 친 곳으로 확대 ② 핵심 숫자 올라가기 ③ 자막 짧게(split_lines 44자) ④ 효과음
SFX = ("pop.mp3", "click-soft.mp3", "whoosh-short.mp3")   # HyperFrames 내장(Pixabay 라이선스, 출처 표기 없이 무료)
NUM_RE = re.compile(r"(?<![\d/:.,])([+−-]?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(%p|%|배|곳|번|개|점|거래일|일|만|억|명|건|종목|년)")


def numify(i, text, st, js):
    """자막 속 첫 핵심 숫자 하나를 굵게 + 0부터 올라가게. 연도(19xx·20xx년)·1 이하는 그대로"""
    esc = html.escape(text)
    for m in NUM_RE.finditer(esc):
        sign, whole, dec, unit = m.group(1), m.group(2), m.group(3) or "", m.group(4)
        v = float(whole.replace(",", "") + dec)
        if (unit == "년" and 1900 <= v <= 2100) or v < 2:
            continue
        nd = len(dec) - 1 if dec else 0
        start = sign + ("0." + "0" * nd if nd else "0") + unit
        b = f'<b class="num" id="n{i}">{start}</b>'
        js.append(f'(function(){{ const o = {{ v: 0 }}, e = document.getElementById("n{i}"); '
                  f'tl.fromTo(o, {{ v: 0 }}, {{ v: {v}, duration: 0.9, ease: "power2.out", onUpdate: () => {{ '
                  f'e.textContent = "{sign}" + o.v.toLocaleString("en-US", {{ minimumFractionDigits: {nd}, maximumFractionDigits: {nd}, useGrouping: {str("," in whole).lower()} }}) + "{unit}"; }} }}, {st + 0.35:.2f}); }})();')
        return esc[:m.start()] + b + esc[m.end():]
    return esc


def zoom_js(js, cx, cy, rw, rh, t_in, t_out):
    """동그라미 친 곳으로 카메라가 다가감 → 그 문장 끝에 원래대로.
    작은 곳은 꽉 차게(최대 1.5배), 화면 폭 카드는 1.18배로 카드 윗부분(제목·첫 숫자)부터 크게"""
    if t_out - t_in < 1.2:
        return False
    fit = min(PW * 0.92 / max(rw, 1), PH * 0.72 / max(rh, 1), 1.5)
    z = max(fit, 1.18)
    if fit < 1.18:                                   # 큰 카드: 카드 위쪽이 창 위에 오게
        cy = min(cy, (cy - rh / 2) + PH / (2 * z) - 10)
    x = min(0.0, max(PW - PW * z, PW / 2 - cx * z))
    y = min(0.0, max(PH - PH * z, PH / 2 - cy * z))
    js.append(f'tl.to("#cam", {{ scale: {z:.3f}, x: {x:.1f}, y: {y:.1f}, duration: 0.7, ease: "power2.inOut" }}, {t_in:.2f});')
    js.append(f'tl.to("#cam", {{ scale: 1, x: 0, y: 0, duration: 0.5, ease: "power2.inOut" }}, {t_out:.2f});')
    return True


def zoom_groups(js, zq):
    """같은 카드를 잇달아 설명하면 한 번만 다가가서 그대로 있다가 다른 곳으로 갈 때 물러남(문장마다 들락날락 안 함)"""
    i = 0
    while i < len(zq):
        if zq[i][0] is None:
            i += 1; continue
        j = i
        while j + 1 < len(zq) and zq[j + 1][0] == zq[i][0]:
            j += 1
        _, cx, cy, rw, rh, st, _d = zq[i]
        end = zq[j][5] + zq[j][6]
        zoom_js(js, cx, cy, rw, rh, st + 0.85, end - 0.6)
        i = j + 1


def sfx_html(hits, total):
    """hits = [(초, 파일, 크기)] → <audio> 들. 0.25초 안에 겹치면 뒤 것 뺌, 같은 소리 두 번 연달아면 다른 테이크로"""
    out, last = [], -9
    for k, (t, f, vol) in enumerate(sorted(hits)):
        if t - last < 0.25 or t > total - 0.3:
            continue
        last = t
        out.append(f'<audio id="sx{k}" class="clip" data-start="{t:.2f}" data-track-index="{80 + k}" data-volume="{vol}" src="assets/{f}"></audio>')
    return "".join(out)


def dur(s):
    return round(min(9.0, max(2.8, 1.3 + len(s) * 0.07)), 2)


def stops_for(cap, n):
    """한 화면에서 n 문장 동안 멈출 자리(css y)와 강조할 카드. 카드가 모자라면 고르게 내려감"""
    pageH = cap["h"]
    maxY = max(0.0, pageH - WH)
    cards, last = [], -1e9
    for r in sorted(cap["rects"], key=lambda r: r["y"]):
        if r["y"] < pageH - 60 and r["y"] - last >= WH * 0.45:
            cards.append(r); last = r["y"]
    out = []
    for i in range(n):
        if i < len(cards):
            c = cards[i]; out.append((min(maxY, max(0.0, c["y"] - 28)), c))
        else:
            # 카드가 더 없으면 화면 아래까지 고르게 내려가고, 끝에 닿으면 위로 되돌아옴(빈 회색 칸을 보여 주지 않음)
            base = out[-1][0] if out else 0.0
            nxt = base + WH * 0.6
            out.append((nxt if nxt <= maxY else 0.0, None))
    return out


def page(title, pose, layer_html, caps_html, dots, js, total, audio=""):
    """영상 한 편의 HyperFrames 문서(배경·휴대폰 창·조이·말풍선 자막·점)"""
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<script src="assets/gsap-3.14.2.min.js"></script>
<style>
  @font-face {{ font-family: "KR"; font-weight: 700; src: local("Noto Sans CJK KR Bold"), local("NotoSansCJKkr-Bold"); }}
  @font-face {{ font-family: "KR"; font-weight: 900; src: local("Noto Sans CJK KR Black"), local("NotoSansCJKkr-Black"); }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #eef1f8; }}
  body {{ font-family: "KR", sans-serif; color: #14203f; }}
  #root {{ position: absolute; inset: 0; overflow: hidden; }}
  #bg {{ position: absolute; inset: 0; background: linear-gradient(180deg, #e9eefb 0%, #f5f2ea 100%); }}
  #top {{ position: absolute; left: 40px; right: 40px; top: 40px; height: 84px; display: flex; align-items: center; gap: 18px; }}
  #face {{ width: 76px; height: 76px; border-radius: 50%; background: #f3e6d6 url("assets/kid_wave.jpg") center 22% / 140% no-repeat;
          border: 3px solid #fff; box-shadow: 0 6px 18px rgba(20,32,63,.18); flex: none; }}
  #ttl {{ font-size: {42 if len(title) <= 9 else 34 if len(title) <= 14 else 27}px; font-weight: 900; letter-spacing: -1px; }}
  #ttl small {{ display: block; font-size: 21px; font-weight: 700; color: #5b6787; letter-spacing: 0; margin-top: 2px; }}
  #phone {{ position: absolute; left: {PX - 10}px; top: {PY - 10}px; width: {PW + 20}px; height: {PH + 20}px; border-radius: 46px;
           background: #14203f; box-shadow: 0 30px 60px rgba(20,32,63,.28); }}
  #win {{ position: absolute; left: {PX}px; top: {PY}px; width: {PW}px; height: {PH}px; border-radius: 34px; overflow: hidden; background: #fff; }}
  #cam {{ position: absolute; left: 0; top: 0; width: {PW}px; height: {PH}px; }}
  .layer {{ position: absolute; left: 0; top: 0; width: {PW}px; }}
  .num {{ color: #e8590c; font-weight: 900; font-size: 1.18em; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }}
  .shot {{ position: absolute; left: 0; top: 0; width: {PW}px; background-repeat: no-repeat; background-position: 0 0; }}
  .ring {{ position: absolute; }}
  .tap {{ position: absolute; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; background: rgba(255,122,26,.30);
          border: 5px solid #ff7a1a; box-shadow: 0 6px 16px rgba(20,32,63,.25); opacity: 0; }}
  .ring i {{ position: absolute; inset: 0; border: 5px solid #ff7a1a; border-radius: 18px; box-shadow: 0 0 0 9999px rgba(15,25,55,.22); }}
  #kid {{ position: absolute; left: 34px; top: 935px; width: 170px; height: 226px; border-radius: 28px; overflow: hidden;
         background: #f3e6d6 url("assets/{pose}.jpg") center / cover no-repeat; box-shadow: 0 14px 30px rgba(20,32,63,.22); }}
  #bub {{ position: absolute; left: 222px; right: 30px; top: 925px; height: 290px; border-radius: 30px; background: #fff;
         box-shadow: 0 14px 30px rgba(20,32,63,.14); }}
  #bub:before {{ content: ""; position: absolute; left: -16px; top: 70px; border: 16px solid transparent; border-right-color: #fff; border-left: 0; }}
  .cap {{ position: absolute; left: 248px; right: 54px; top: 950px; height: 240px; display: flex; align-items: center;
         font-size: 31px; font-weight: 700; line-height: 1.42; letter-spacing: -0.3px; word-break: keep-all; }}
  .cap span {{ display: block; }}
  .cap.sm {{ font-size: 24px; }} .cap.xs {{ font-size: 20px; line-height: 1.38; }}
  #dots {{ position: absolute; left: 0; right: 0; top: 1232px; display: flex; justify-content: center; gap: 12px; }}
  #dots b {{ width: 12px; height: 12px; border-radius: 6px; background: #c9d3ea; display: block; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="{W}" data-height="{H}">
  <div id="bg"></div>
  <div id="top"><div id="face"></div><div id="ttl">{html.escape(title)}<small>조이가 알려 주는 화면 안내</small></div></div>
  <div id="phone"></div>
  <div id="win" data-layout-allow-overflow><div id="cam">{layer_html}</div></div>
  <div id="kid"></div>
  <div id="bub"></div>
  {"".join(caps_html)}
  <div id="dots">{dots}</div>
  {audio}
</div>
<script>
  window.__timelines = window.__timelines || {{}};
  const tl = gsap.timeline({{ paused: true }});
  tl.set("#cam", {{ transformOrigin: "0 0" }}, 0);
  tl.fromTo("#phone, #win", {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }}, 0);
  tl.fromTo("#kid", {{ opacity: 0, scale: 0.8 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }}, 0.25);
  tl.fromTo("#bub", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, 0.45);
  {chr(10).join("  " + x for x in js)}
  window.__timelines["main"] = tl;
</script>
</body>
</html>
"""


# 🎬 10/27 「직접 해 보는」 영상: capture 때 실제로 누르고 민 장면들(cap/<폴더>/scenes.json) → 손가락 표시 + 바뀐 화면
DEMOS = {"d_els_dz": ("els", "demo_els_dz")}


def demo_spots():
    out = {}
    for nm, (scr, fd) in DEMOS.items():
        f = f"{CAP}/{fd}/scenes.json"
        if os.path.exists(f):
            d = json.load(open(f))
            out[nm] = {"key": scr + "|" + norm(d["title"]), "title": d["title"], "kind": "demo", "n": len(d["scenes"])}
    return out


def build_demo(name):
    scr, fd = DEMOS[name]
    D = json.load(open(f"{CAP}/{fd}/scenes.json"))
    sc = D["scenes"]
    sx = PW / D["vw"]
    pdir = f"{BUILD}/{name}"
    shutil.rmtree(pdir, ignore_errors=True)
    os.makedirs(f"{pdir}/assets")
    pose = POSE.get(scr, "kid_thumb")
    for f in (f"{pose}.jpg", "kid_wave.jpg", "gsap-3.14.2.min.js") + SFX:
        shutil.copy(f"{ROOT}/assets/{f}", f"{pdir}/assets/{f}")
    imgs = []
    for s in sc:
        for k in ("img", "post"):
            if s.get(k) and s[k] not in imgs:
                imgs.append(s[k])
    for f in imgs:
        Image.open(f"{CAP}/{fd}/{f}").convert("RGB").resize((PW, PH), Image.LANCZOS).save(f"{pdir}/assets/s{f[:-4]}.jpg", quality=88)
    lid = {f: j for j, f in enumerate(imgs)}
    js, caps_html, rings, taps, hits = [], [], [], [], []
    t, shown, starts = 0.9, lid[sc[0]["img"]], []
    total_n = len(sc)

    def show(j, at):
        nonlocal shown
        if j == shown:
            return
        js.append(f'tl.to("#layer{shown}", {{ opacity: 0, duration: 0.35 }}, {at:.2f});')
        js.append(f'tl.fromTo("#layer{j}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.35 }}, {at:.2f});')
        shown = j
    for i, s in enumerate(sc):
        act = 1.5 if (s.get("tap") or s.get("drag")) else 0.0
        d = round(dur(s["say"]) + act, 2)
        st = t; starts.append(st)
        if i == total_n - 1:
            d = round(d + 1.2, 2)
        show(lid[s["img"]], max(0, st - 0.35))
        sz = " xs" if len(s["say"]) > 120 else " sm" if len(s["say"]) > 78 else ""
        caps_html.append(f'<p id="cap{i}" class="clip cap{sz}" data-start="{st}" data-duration="{d}" data-track-index="{3 + i}"><span>{numify(i, s["say"], st, js)}</span></p>')
        js.append(f'tl.fromTo("#cap{i} span", {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }}, {st + 0.05:.2f});')
        ring_at = st + 0.45
        if s.get("tap"):
            x, y = s["tap"][0] * sx, s["tap"][1] * sx
            taps.append(f'<div id="tap{i}" class="tap" style="left:{x:.0f}px;top:{y:.0f}px"></div>')
            js.append(f'tl.fromTo("#tap{i}", {{ opacity: 0, scale: 1.6 }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }}, {st + 0.5:.2f});')
            js.append(f'tl.to("#tap{i}", {{ scale: 0.75, duration: 0.15, yoyo: true, repeat: 1 }}, {st + 0.95:.2f});')
            hits.append((st + 0.98, "click-soft.mp3", 0.5))
            js.append(f'tl.to("#tap{i}", {{ opacity: 0, duration: 0.3 }}, {st + 1.6:.2f});')
            if s.get("post"):
                show(lid[s["post"]], st + 1.15)
            ring_at = st + 1.6
        elif s.get("drag"):
            x0, y, x1 = s["drag"][0] * sx, s["drag"][1] * sx, s["drag"][2] * sx
            taps.append(f'<div id="tap{i}" class="tap" style="left:{x0:.0f}px;top:{y:.0f}px"></div>')
            js.append(f'tl.fromTo("#tap{i}", {{ opacity: 0, x: 0 }}, {{ opacity: 1, duration: 0.3 }}, {st + 0.4:.2f});')
            js.append(f'tl.to("#tap{i}", {{ x: {x1 - x0:.0f}, duration: 0.8, ease: "power1.inOut" }}, {st + 0.75:.2f});')
            hits.append((st + 0.78, "click-soft.mp3", 0.4))
            js.append(f'tl.to("#tap{i}", {{ opacity: 0, duration: 0.3 }}, {st + 1.75:.2f});')
            if s.get("post"):
                show(lid[s["post"]], st + 1.4)
            ring_at = st + 1.75
        c = s.get("ring")
        if c:
            rx, ry, rw, rh = (c["x"] - 5) * sx, (c["y"] - 5) * sx, (c["w"] + 10) * sx, (c["h"] + 10) * sx
            rings.append(f'<div id="ring{i}" class="clip ring" data-start="{ring_at:.2f}" data-duration="{max(st + d - ring_at - 0.1, 0.5):.2f}" data-track-index="{40 + i}" '
                         f'style="left:{rx:.0f}px;top:{ry:.0f}px;width:{rw:.0f}px;height:{rh:.0f}px"><i></i></div>')
            js.append(f'tl.fromTo("#ring{i} i", {{ opacity: 0, scale: 1.06 }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }}, {ring_at:.2f});')
            hits.append((ring_at + 0.03, "pop.mp3", 0.45))
            zoom_js(js, rx + rw / 2, ry + rh / 2, rw, rh, ring_at + 0.4, st + d - 0.6)
        t = st + d
    total = round(t + 0.3, 2)
    for i, st in enumerate(starts):
        js.append(f'tl.fromTo("#dot{i}", {{ backgroundColor: "#c9d3ea", scaleX: 1 }}, {{ backgroundColor: "#2f4ea8", scaleX: 2.2, duration: 0.3 }}, {st:.2f});')
        if i + 1 < len(starts):
            js.append(f'tl.to("#dot{i}", {{ backgroundColor: "#8ea2d6", scaleX: 1, duration: 0.3 }}, {starts[i + 1]:.2f});')
    first = lid[sc[0]["img"]]
    layer_html = "".join(f'<div id="layer{j}" class="layer" style="height:{PH}px;opacity:{1 if j == first else 0}">'
                         f'<div class="shot" style="height:{PH}px;background-image:url(assets/s{f[:-4]}.jpg);background-size:{PW}px {PH}px"></div></div>'
                         for j, f in enumerate(imgs)) + "".join(rings) + "".join(taps)
    dots = "".join(f'<b id="dot{i}"></b>' for i in range(total_n))
    title = D["title"][:22]
    doc = page(title, pose, layer_html, caps_html, dots, js, total, sfx_html(hits, total))
    open(f"{pdir}/index.html", "w").write(doc)
    return pdir, total


def build(name):
    if name.startswith("d_"):
        return build_demo(name)
    kind, key = name.split("_", 1)
    spot = None
    if kind == "c":
        scr, spot, _ = spot_videos()[name]
        lines = split_lines(spot["lines"])
        title = spot["title"][:22] or MORE_NAME.get(scr, scr)
        screens, key = [scr], scr
    else:
        lines = split_lines((T["SAY"] if kind == "t" else T["MORE"])[key])
        title = (NAME if kind == "t" else MORE_NAME)[key]
        screens = [k for k in VIDEOS[name] if os.path.exists(f"{CAP}/{k}.json")]
    pdir = f"{BUILD}/{name}"
    shutil.rmtree(pdir, ignore_errors=True)
    os.makedirs(f"{pdir}/assets")
    pose = POSE.get(key, "kid_thumb")
    if spot is not None and spot.get("kind") == "x":      # 오늘 탭 조이 그림 자리: 그 자리 표정
        pose = "kid_wave" if "인사" in title else "kid_joy" if "배지" in title else "kid_umb" if "팔았다면" in title else "kid_thumb"
    for f in (f"{pose}.jpg", "kid_wave.jpg", "gsap-3.14.2.min.js") + SFX:
        shutil.copy(f"{ROOT}/assets/{f}", f"{pdir}/assets/{f}")
    caps, ih = {}, {}
    for k in screens:
        caps[k] = json.load(open(f"{CAP}/{k}.json"))
        im = Image.open(f"{CAP}/{k}.png").convert("RGB")
        ih[k] = round(im.height * PW / im.width)
        im.resize((PW, ih[k]), Image.LANCZOS).save(f"{pdir}/assets/{k}.jpg", quality=88)

    # 문장 → 화면 (문장 속 표시 글자로, 없으면 앞 화면 그대로)
    n = len(lines)
    scr, curk = [], screens[0]
    for s in lines:
        for k in screens:
            if MARK.get(k) and MARK[k] in s:
                curk = k; break
        scr.append(curk)
    stops = {}
    if spot is not None:
        pageH = caps[screens[0]]["h"]; maxY = max(0.0, pageH - WH)
        y0 = min(maxY, max(0.0, spot["y"] - 24)); y1 = min(maxY, max(y0, spot["y"] + spot["h"] - WH + 24))
        for i in range(n):                      # 카드가 창보다 크면 문장마다 조금씩 내려감
            stops[i] = (y0 + (y1 - y0) * (i / max(n - 1, 1)), spot)
    else:
      for k in screens:
        idx = [i for i in range(n) if scr[i] == k]
        for i, st in zip(idx, stops_for(caps[k], len(idx))):
            stops[i] = st

    t0 = 0.9
    starts, t = [], t0
    for s in lines:
        starts.append(t); t += dur(s)
    total = round(t + 1.2, 2)

    layers = {k: [] for k in screens}
    caps_html, js, hits, zq = [], [], [], []
    js.append(f'tl.set("#layer{screens.index(scr[0])}", {{ y: {-stops[0][0] * S:.1f} }}, 0);')
    shown = screens[0]
    for i, s in enumerate(lines):
        st, d = starts[i], dur(s)
        if i == n - 1:
            d = round(total - st, 2)
        sz = " xs" if len(s) > 120 else " sm" if len(s) > 78 else ""
        caps_html.append(
            f'<p id="cap{i}" class="clip cap{sz}" data-start="{st}" data-duration="{d}" data-track-index="{3 + i}">'
            f'<span>{numify(i, s, st, js)}</span></p>')
        k = scr[i]
        lid = screens.index(k)
        if k != shown:
            js.append(f'tl.to("#layer{screens.index(shown)}", {{ opacity: 0, duration: 0.4 }}, {max(0, st - 0.4):.2f});')
            js.append(f'tl.fromTo("#layer{lid}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {max(0, st - 0.4):.2f});')
            hits.append((max(0.0, st - 0.4), "whoosh-short.mp3", 0.35))
            shown = k
        y, c = stops[i]
        js.append(f'tl.to("#layer{lid}", {{ y: {-y * S:.1f}, duration: 0.8, ease: "power2.inOut" }}, {max(0, st - 0.35):.2f});')
        js.append(f'tl.fromTo("#cap{i} span", {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }}, {st + 0.05:.2f});')
        if c is not None:
            rx, ry, rw, rh = (c["x"] - 4) * S, (c["y"] - 4) * S, (c["w"] + 8) * S, (c["h"] + 8 if spot is not None else min(c["h"] + 8, WH)) * S
            rd = round(d - 0.45, 2)
            layers[k].append(
                f'<div id="ring{i}" class="clip ring" data-start="{st + 0.45:.2f}" data-duration="{max(rd, 0.5)}" '
                f'data-track-index="{40 + i}" style="left:{rx:.0f}px;top:{ry:.0f}px;width:{rw:.0f}px;height:{rh:.0f}px">'
                f'<i></i></div>')
            js.append(f'tl.fromTo("#ring{i} i", {{ opacity: 0, scale: 1.06 }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }}, {st + 0.45:.2f});')
            if not zq or zq[-1][0] != id(c):          # 새 카드에 동그라미 칠 때만 「톡」
                hits.append((st + 0.48, "pop.mp3", 0.45))
            zq.append((id(c), rx + rw / 2, ry + rh / 2 - y * S, rw, rh, st, d))
        else:
            zq.append((None,))
    zoom_groups(js, zq)
    dots = "".join(f'<b id="dot{i}"></b>' for i in range(n))
    for i, st in enumerate(starts):
        js.append(f'tl.fromTo("#dot{i}", {{ backgroundColor: "#c9d3ea", scaleX: 1 }}, {{ backgroundColor: "#2f4ea8", scaleX: 2.2, duration: 0.3 }}, {st:.2f});')
        if i + 1 < n:
            js.append(f'tl.to("#dot{i}", {{ backgroundColor: "#8ea2d6", scaleX: 1, duration: 0.3 }}, {starts[i + 1]:.2f});')
    first = screens.index(scr[0])
    layer_html = "".join(
        f'<div id="layer{j}" class="layer" style="height:{ih[k]}px;opacity:{1 if j == first else 0}">'
        f'<div class="shot" style="height:{ih[k]}px;background-image:url(assets/{k}.jpg);background-size:{PW}px {ih[k]}px"></div>'
        f'{"".join(layers[k])}</div>' for j, k in enumerate(screens))

    doc = page(title, pose, layer_html, caps_html, dots, js, total, sfx_html(hits, total))
    open(f"{pdir}/index.html", "w").write(doc)
    return pdir, total


def render(name):
    pdir, total = build(name)
    raw = f"{pdir}/raw.mp4"
    r = subprocess.run(["npx", "--yes", "hyperframes@latest", "render", "--quality", "looks", "--output", raw],
                       cwd=pdir, capture_output=True, text=True)
    open(f"{OUT}/{name}.log", "w").write(r.stdout[-4000:] + r.stderr[-4000:])
    if not os.path.exists(raw):
        print(name, "렌더 실패"); return False
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-crf", "27", "-preset", "slow",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "64k", "-ac", "1", f"{OUT}/{name}.mp4"], check=True)
    # 눈 검사용 장면 모음(5장)
    n = 5
    sel = "+".join(f"eq(n\\,{int((k + 0.5) * total * 30 / n)})" for k in range(n))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{OUT}/{name}.mp4", "-vf",
                    f"select='{sel}',scale=240:-1,tile={n}x1", "-frames:v", "1", f"{OUT}/{name}_sheet.jpg"])
    print(name, total, "s", os.path.getsize(f"{OUT}/{name}.mp4") // 1024, "KB")
    return True


if __name__ == "__main__":
    args = sys.argv[1:]
    SV = spot_videos()
    SPJ = {nm: {"key": v[2], "title": v[1]["title"], "kind": v[1]["kind"], "n": len(v[1]["lines"])} for nm, v in SV.items()}
    DS = demo_spots(); SPJ.update(DS)
    json.dump(SPJ, open(f"{OUT}/spots.json", "w"), ensure_ascii=False, indent=0)
    names = [a for a in args if not a.startswith("--")] or (list(VIDEOS) + list(SV) + list(DS))
    names = [nm for nm in names if nm in SV or nm in DS or all(os.path.exists(f"{CAP}/{k}.json") for k in VIDEOS[nm])]
    if "--build-only" in args:
        for nm in names: print(build(nm))
        sys.exit()
    ok = [nm for nm in names if render(nm)]
    print("완료", len(ok), "/", len(names))
