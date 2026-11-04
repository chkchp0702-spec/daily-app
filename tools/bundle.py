"""📦 JS 한 파일로 합치기 (🎨 11/04 우와 ㉙ — 사용자 「JS 64개 → 1개」)
   index.html 의 <!-- 📦JS --> … <!-- 📦/JS --> 사이에 있는 <script defer src="x.js?v=N"></script> 줄들을 순서대로 이어 붙여
   app.bundle.js 를 만들고, index.html 에는 <script defer src="app.bundle.js?v=해시"> 한 줄만 남긴다(원본 목록은 그 아래 <!--📦list … 📦list--> 주석 안에 보존).
   · 새 파일을 넣을 땐: 📦list 주석 안에 <script defer src="새파일.js?v=1"></script> 줄을 넣고 python3 tools/bundle.py (GitHub Actions bundle.yml 이 push 때마다 자동으로도 돌림)
   · 파일 하나라도 문법 오류면 합치지 않고 실패(exit 1) → 옛 묶음이 그대로 남으니 Actions 실패 알림을 보고 고칠 것
   · 각 파일은 그대로 이어 붙임(함수로 감싸지 않음 — views.js 처럼 전역 var/function 을 쓰는 파일이 있어서). 파일 사이엔 ';' 한 줄.
   사용: python3 tools/bundle.py [--check]   (--check 는 바뀌어야 하는지만 보고 exit 3)
"""
import hashlib
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(ROOT, "index.html")
OUT = "app.bundle.js"
S, E = "<!-- 📦JS -->", "<!-- 📦/JS -->"
LS, LE = "<!--📦list", "📦list-->"
TAG = re.compile(r'<script\s+defer\s+src="([^"?]+\.js)(\?v=[^"]*)?"\s*></script>')


def main():
    check = "--check" in sys.argv
    html = open(IDX, encoding="utf-8").read()
    a, b = html.find(S), html.find(E)
    if a < 0 or b < 0:
        print("index.html 에 📦JS 표식이 없음"); sys.exit(2)
    block = html[a + len(S):b]
    # 원본 목록: 주석 안에 있으면 그것, 아니면 블록 전체
    la, lb = block.find(LS), block.find(LE)
    listing = block[la + len(LS):lb] if la >= 0 and lb > la else block
    files = [m.group(1) for m in TAG.finditer(listing) if m.group(1) != OUT]
    if not files:
        print("목록이 비어 있음"); sys.exit(2)
    parts, bad = [], []
    for f in files:
        p = os.path.join(ROOT, f)
        if not os.path.exists(p):
            bad.append(f + " (없음)"); continue
        r = subprocess.run(["node", "-e", "require('vm').createScript(require('fs').readFileSync(process.argv[1],'utf8'),{filename:process.argv[1]})", p], capture_output=True, text=True)
        if r.returncode:
            bad.append(f + " (문법 오류) " + (r.stderr.strip().splitlines() or [""])[-1][:160]); continue
        src = open(p, encoding="utf-8").read()
        parts.append("/* ======== " + f + " ======== */\n" + src.rstrip() + "\n;\n")
    if bad:
        print("합치지 않음 — 고칠 것:\n  " + "\n  ".join(bad)); sys.exit(1)
    body = "/* 📦 app.bundle.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 파일. 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */\n" + "".join(parts)
    h = hashlib.sha1(body.encode("utf-8")).hexdigest()[:10]
    tag = '<script defer src="%s?v=%s"></script>' % (OUT, h)
    new_block = ("\n<!-- 📦 JS 묶음 (tools/bundle.py) — 아래 📦list 주석 안 목록 순서대로 합친 한 파일. 새 .js 는 목록에 줄을 넣고 python3 tools/bundle.py (push 때 Actions 가 자동으로도 돌림) -->\n"
                 + tag + "\n" + LS + "\n" + listing.strip("\n").replace("<!--", "<!·").replace("-->", "·>") + "\n" + LE + "\n")   # 목록 안 주석은 <!· ·> 로 바꿔 바깥 주석이 안 닫히게
    new_html = html[:a + len(S)] + new_block + html[b:]
    cur = open(os.path.join(ROOT, OUT), encoding="utf-8").read() if os.path.exists(os.path.join(ROOT, OUT)) else ""
    changed = (cur != body) or (new_html != html)
    if check:
        print("바뀜" if changed else "그대로"); sys.exit(3 if changed else 0)
    if changed:
        open(os.path.join(ROOT, OUT), "w", encoding="utf-8").write(body)
        open(IDX, "w", encoding="utf-8").write(new_html)
    print("%s: %d개 파일 · %d KB · v=%s%s" % (OUT, len(files), len(body.encode("utf-8")) // 1024, h, "" if changed else " (그대로)"))


if __name__ == "__main__":
    main()
