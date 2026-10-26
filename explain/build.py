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
        "bond": "kid_piggy", "fund": "kid_piggy", "els": "kid_think"}

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
    return re.sub(r"[\s\d·:%,.()\[\]~\-–—+/…?!「」『』()−▲▼△▽›‹]", "", t or "").lower()[:24]


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


def split_lines(L, maxc=110, cap=10):
    """긴 문단은 문장(…요. / …다. / …죠.)으로 나누고, 그래도 길면 쉼표·점에서 한 번 더"""
    out = []
    for t in L:
        t = re.sub(r"\s+", " ", str(t)).strip()
        parts = re.split(r"(?<=[.!?。])\s+(?=\S)", t)
        for p in parts:
            while len(p) > maxc:
                cut = max(p.rfind(", ", 30, maxc), p.rfind(" · ", 30, maxc), p.rfind(" — ", 30, maxc), p.rfind(" ", 30, maxc))
                if cut < 30:
                    cut = maxc
                out.append(p[:cut].strip()); p = p[cut:].strip(" ,·—")
            if p:
                out.append(p)
    return [x for x in out if len(x) > 1][:cap]


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


def build(name):
    kind, key = name.split("_", 1)
    spot = None
    if kind == "c":
        scr, spot, _ = spot_videos()[name]
        lines = split_lines(spot["lines"])
        title = spot["title"][:22] or MORE_NAME.get(scr, scr)
        screens, key = [scr], scr
    else:
        lines = (T["SAY"] if kind == "t" else T["MORE"])[key]
        title = (NAME if kind == "t" else MORE_NAME)[key]
        screens = [k for k in VIDEOS[name] if os.path.exists(f"{CAP}/{k}.json")]
    pdir = f"{BUILD}/{name}"
    shutil.rmtree(pdir, ignore_errors=True)
    os.makedirs(f"{pdir}/assets")
    pose = POSE.get(key, "kid_thumb")
    for f in (f"{pose}.jpg", "kid_wave.jpg", "gsap-3.14.2.min.js"):
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
    caps_html, js = [], []
    js.append(f'tl.set("#layer{screens.index(scr[0])}", {{ y: {-stops[0][0] * S:.1f} }}, 0);')
    shown = screens[0]
    for i, s in enumerate(lines):
        st, d = starts[i], dur(s)
        if i == n - 1:
            d = round(total - st, 2)
        sz = " xs" if len(s) > 120 else " sm" if len(s) > 78 else ""
        caps_html.append(
            f'<p id="cap{i}" class="clip cap{sz}" data-start="{st}" data-duration="{d}" data-track-index="{3 + i}">'
            f'<span>{html.escape(s)}</span></p>')
        k = scr[i]
        lid = screens.index(k)
        if k != shown:
            js.append(f'tl.to("#layer{screens.index(shown)}", {{ opacity: 0, duration: 0.4 }}, {max(0, st - 0.4):.2f});')
            js.append(f'tl.fromTo("#layer{lid}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {max(0, st - 0.4):.2f});')
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

    doc = f"""<!doctype html>
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
  .layer {{ position: absolute; left: 0; top: 0; width: {PW}px; }}
  .shot {{ position: absolute; left: 0; top: 0; width: {PW}px; background-repeat: no-repeat; background-position: 0 0; }}
  .ring {{ position: absolute; }}
  .ring i {{ position: absolute; inset: 0; border: 5px solid #ff7a1a; border-radius: 18px; box-shadow: 0 0 0 9999px rgba(15,25,55,.22); }}
  #kid {{ position: absolute; left: 34px; top: 935px; width: 170px; height: 226px; border-radius: 28px; overflow: hidden;
         background: #f3e6d6 url("assets/{pose}.jpg") center / cover no-repeat; box-shadow: 0 14px 30px rgba(20,32,63,.22); }}
  #bub {{ position: absolute; left: 222px; right: 30px; top: 925px; height: 290px; border-radius: 30px; background: #fff;
         box-shadow: 0 14px 30px rgba(20,32,63,.14); }}
  #bub:before {{ content: ""; position: absolute; left: -16px; top: 70px; border: 16px solid transparent; border-right-color: #fff; border-left: 0; }}
  .cap {{ position: absolute; left: 248px; right: 54px; top: 950px; height: 240px; display: flex; align-items: center;
         font-size: 29px; font-weight: 700; line-height: 1.42; letter-spacing: -0.3px; word-break: keep-all; }}
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
  <div id="win" data-layout-allow-overflow>{layer_html}</div>
  <div id="kid"></div>
  <div id="bub"></div>
  {"".join(caps_html)}
  <div id="dots">{dots}</div>
</div>
<script>
  window.__timelines = window.__timelines || {{}};
  const tl = gsap.timeline({{ paused: true }});
  tl.fromTo("#phone, #win", {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }}, 0);
  tl.fromTo("#kid", {{ opacity: 0, scale: 0.8 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }}, 0.25);
  tl.fromTo("#bub", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, 0.45);
  {chr(10).join("  " + x for x in js)}
  window.__timelines["main"] = tl;
</script>
</body>
</html>
"""
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
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", f"{OUT}/{name}.mp4"], check=True)
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
    json.dump({nm: {"key": v[2], "title": v[1]["title"], "kind": v[1]["kind"], "n": len(v[1]["lines"])} for nm, v in SV.items()},
              open(f"{OUT}/spots.json", "w"), ensure_ascii=False, indent=0)
    names = [a for a in args if not a.startswith("--")] or (list(VIDEOS) + list(SV))
    names = [nm for nm in names if nm in SV or all(os.path.exists(f"{CAP}/{k}.json") for k in VIDEOS[nm])]
    if "--build-only" in args:
        for nm in names: print(build(nm))
        sys.exit()
    ok = [nm for nm in names if render(nm)]
    print("완료", len(ok), "/", len(names))
