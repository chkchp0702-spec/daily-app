"""🎬 조이 설명 영상 만들기 — capture.py 가 찍은 실제 앱 화면 + guide.js 설명 글로
HyperFrames 프로젝트를 만들고 렌더링한다. 결과: explain/out/<name>.mp4 (720×1280, 소리 없음)"""
import html, json, os, shutil, subprocess, sys
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


def dur(s):
    return round(min(7.5, max(2.8, 1.3 + len(s) * 0.075)), 2)


def build(name):
    kind, key = name.split("_", 1)
    lines = (T["SAY"] if kind == "t" else T["MORE"])[key]
    title = (NAME if kind == "t" else MORE_NAME)[key]
    cap = json.load(open(f"{CAP}/{name}.json"))
    pdir = f"{BUILD}/{name}"
    shutil.rmtree(pdir, ignore_errors=True)
    os.makedirs(f"{pdir}/assets")
    # 스크린샷: 780px 폭 → 영상 창 폭(500)에 맞게 줄여서 저장(파일 가볍게)
    im = Image.open(f"{CAP}/{name}.png").convert("RGB")
    ih = round(im.height * PW / im.width)
    im.resize((PW, ih), Image.LANCZOS).save(f"{pdir}/assets/screen.jpg", quality=90)
    pose = POSE.get(key, "kid_thumb")
    for f in (f"{pose}.jpg", "kid_wave.jpg", "gsap-3.14.2.min.js"):
        shutil.copy(f"{ROOT}/assets/{f}", f"{pdir}/assets/{f}")

    pageH = cap["h"]
    maxY = max(0.0, pageH - WH)
    cards = sorted([r for r in cap["rects"] if r["y"] < pageH - 40], key=lambda r: r["y"])
    n = len(lines)
    m = min(len(cards), n + 1)
    picks = []
    for i in range(n):
        if m == 0:
            picks.append(None)
        else:
            picks.append(cards[round(i * (m - 1) / max(n - 1, 1))])

    t0 = 0.9
    starts, t = [], t0
    for s in lines:
        starts.append(t); t += dur(s)
    total = round(t + 1.2, 2)

    caps_html, rings_html, js = [], [], []
    for i, s in enumerate(lines):
        st, d = starts[i], dur(s)
        if i == n - 1:
            d = round(total - st, 2)
        caps_html.append(
            f'<p id="cap{i}" class="clip cap" data-start="{st}" data-duration="{d}" data-track-index="{3 + i}">'
            f'{html.escape(s)}</p>')
        c = picks[i]
        y = 0.0 if c is None else min(maxY, max(0.0, c["y"] - 28))
        js.append(f'tl.to("#layer", {{ y: {-y * S:.1f}, duration: 0.8, ease: "power2.inOut" }}, {max(0, st - 0.35):.2f});')
        js.append(f'tl.fromTo("#cap{i} span", {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }}, {st + 0.05:.2f});')
        if c is not None:
            rx, ry, rw, rh = (c["x"] - 4) * S, (c["y"] - 4) * S, (c["w"] + 8) * S, min(c["h"] + 8, WH) * S
            rd = round(min(d, total - st) - 0.45, 2)
            rings_html.append(
                f'<div id="ring{i}" class="clip ring" data-start="{st + 0.45:.2f}" data-duration="{max(rd, 0.5)}" '
                f'data-track-index="{40 + i}" style="left:{rx:.0f}px;top:{ry:.0f}px;width:{rw:.0f}px;height:{rh:.0f}px">'
                f'<i></i></div>')
            js.append(f'tl.fromTo("#ring{i} i", {{ opacity: 0, scale: 1.06 }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }}, {st + 0.45:.2f});')
    # 문장 안 글자를 span 으로 감싸서 GSAP 은 자식만 움직이게(계약 5번)
    caps_html = [c.replace('">', '"><span>', 1).replace("</p>", "</span></p>") for c in caps_html]
    dots = "".join(f'<b id="dot{i}"></b>' for i in range(n))
    for i, st in enumerate(starts):
        js.append(f'tl.fromTo("#dot{i}", {{ backgroundColor: "#c9d3ea", scaleX: 1 }}, {{ backgroundColor: "#2f4ea8", scaleX: 2.2, duration: 0.3 }}, {st:.2f});')
        if i + 1 < n:
            js.append(f'tl.to("#dot{i}", {{ backgroundColor: "#8ea2d6", scaleX: 1, duration: 0.3 }}, {starts[i + 1]:.2f});')

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
  #ttl {{ font-size: 42px; font-weight: 900; letter-spacing: -1px; }}
  #ttl small {{ display: block; font-size: 21px; font-weight: 700; color: #5b6787; letter-spacing: 0; margin-top: 2px; }}
  #phone {{ position: absolute; left: {PX - 10}px; top: {PY - 10}px; width: {PW + 20}px; height: {PH + 20}px; border-radius: 46px;
           background: #14203f; box-shadow: 0 30px 60px rgba(20,32,63,.28); }}
  #win {{ position: absolute; left: {PX}px; top: {PY}px; width: {PW}px; height: {PH}px; border-radius: 34px; overflow: hidden; background: #fff; }}
  #layer {{ position: absolute; left: 0; top: 0; width: {PW}px; height: {ih}px; }}
  #shot {{ position: absolute; left: 0; top: 0; width: {PW}px; height: {ih}px; background: url("assets/screen.jpg") 0 0 / {PW}px {ih}px no-repeat; }}
  .ring {{ position: absolute; }}
  .ring i {{ position: absolute; inset: 0; border: 5px solid #ff7a1a; border-radius: 18px; box-shadow: 0 0 0 9999px rgba(15,25,55,.28); }}
  #kid {{ position: absolute; left: 34px; top: 935px; width: 170px; height: 226px; border-radius: 28px; overflow: hidden;
         background: #f3e6d6 url("assets/{pose}.jpg") center / cover no-repeat; box-shadow: 0 14px 30px rgba(20,32,63,.22); }}
  #bub {{ position: absolute; left: 222px; right: 30px; top: 925px; height: 290px; border-radius: 30px; background: #fff;
         box-shadow: 0 14px 30px rgba(20,32,63,.14); }}
  #bub:before {{ content: ""; position: absolute; left: -16px; top: 70px; border: 16px solid transparent; border-right-color: #fff; border-left: 0; }}
  .cap {{ position: absolute; left: 248px; right: 54px; top: 950px; height: 240px; display: flex; align-items: center;
         font-size: 29px; font-weight: 700; line-height: 1.42; letter-spacing: -0.3px; word-break: keep-all; }}
  .cap span {{ display: block; }}
  #dots {{ position: absolute; left: 0; right: 0; top: 1232px; display: flex; justify-content: center; gap: 12px; }}
  #dots b {{ width: 12px; height: 12px; border-radius: 6px; background: #c9d3ea; display: block; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="{W}" data-height="{H}">
  <div id="bg"></div>
  <div id="top"><div id="face"></div><div id="ttl">{html.escape(title)}<small>조이가 알려 주는 화면 안내</small></div></div>
  <div id="phone"></div>
  <div id="win" data-layout-allow-overflow><div id="layer"><div id="shot"></div>
    {"".join(rings_html)}
  </div></div>
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
  tl.fromTo("#layer", {{ y: 0 }}, {{ y: 0, duration: 0.01 }}, 0);
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
    names = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(CAP) if f.endswith(".json"))
    if names == ["--build-only"]:
        names = sorted(f[:-5] for f in os.listdir(CAP) if f.endswith(".json"))
        for nm in names: print(build(nm))
        sys.exit()
    ok = [nm for nm in names if os.path.exists(f"{CAP}/{nm}.png") and render(nm)]
    print("완료", len(ok), "/", len(names))
