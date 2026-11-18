"""📦 JS 한 파일로 합치기 (🎨 11/04 우와 ㉙ — 사용자 「JS 64개 → 1개」)
   index.html 의 <!-- 📦JS --> … <!-- 📦/JS --> 사이에 있는 <script defer src="x.js?v=N"></script> 줄들을 순서대로 이어 붙여
   app.b01.js, app.b02.js … (약 320KB 조각 · 11/18부터. 그 전엔 app.bundle.js 한 파일)를 만들고, index.html 에는 조각마다 <script defer src="app.bNN.js?v=해시"> 한 줄씩 남긴다(원본 목록은 그 아래 <!--📦list … 📦list--> 주석 안에 보존).
   · 새 파일을 넣을 땐: 📦list 주석 안에 <script defer src="새파일.js?v=1"></script> 줄을 넣고 python3 tools/bundle.py (GitHub Actions bundle.yml 이 push 때마다 자동으로도 돌림)
   · 파일 하나라도 문법 오류면 합치지 않고 실패(exit 1) → 옛 묶음이 그대로 남으니 Actions 실패 알림을 보고 고칠 것
   · 각 파일은 그대로 이어 붙임(함수로 감싸지 않음 — views.js 처럼 전역 var/function 을 쓰는 파일이 있어서). 파일 사이엔 ';' 한 줄.
   사용: python3 tools/bundle.py [--check]   (--check 는 바뀌어야 하는지만 보고 exit 3)
"""
import hashlib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(ROOT, "index.html")
OUT = "app.bundle.js"
S, E = "<!-- 📦JS -->", "<!-- 📦/JS -->"
LS, LE = "<!--📦list", "📦list-->"
CHUNK = re.compile(r"^app\.b\d+\.js$")
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
    files = [m.group(1) for m in TAG.finditer(listing) if m.group(1) != OUT and not CHUNK.match(m.group(1))]
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
        parts.append("/* ======== " + f + " ======== */\n" + src.rstrip() + "\n;\n__bk(%d);\n" % len(parts))   # 🛡 11/18 파일마다 끝 표식 → 중간 파일이 시작하다 멈추면 early.js 가 다음 파일부터 이어서 실행
    if bad:
        print("합치지 않음 — 고칠 것:\n  " + "\n  ".join(bad)); sys.exit(1)
    # 📦 11/18 냉정 분석 6차 #14 「무게」 — 한 파일(2.6MB · 압축 830KB)이면 .js 하나만 고쳐도 모든 휴대폰이 전부 다시 받음(하루 여러 번 올리는 날은 그때마다).
    #    → 목록 순서 그대로 약 320KB 씩 잘라 app.b01.js, app.b02.js … 로 나눔. 고친 파일이 든 조각만 주소(?v=해시)가 바뀌어 그 조각만 다시 받음.
    #    defer 스크립트는 적힌 순서대로 실행되므로 한 파일로 합친 것과 동작이 같음. 조각 저장은 sw.js 의 ch-bundle(버전이 올라가도 안 지움).
    CH = 320 * 1024
    groups, cur, size = [], [], 0
    for f, part in zip(files, parts):
        cur.append((f, part)); size += len(part.encode("utf-8"))
        if size >= CH:
            groups.append(cur); cur, size = [], 0
    if cur:
        groups.append(cur)
    outs, tags, total = [], [], 0
    idx = 0
    for n, g in enumerate(groups, 1):
        name = "app.b%02d.js" % n
        guard = 'if(typeof __bs!=="function"){window.__bs=window.__bk=window.__be=function(){};}\n'   # early.js 가 옛 저장본이어도 안 깨지게
        body = ("/* 📦 %s — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 %d/%d (%s … %s). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */\n" % (name, n, len(groups), g[0][0], g[-1][0])
                + guard + "__bs(%d,%d,%s);\n" % (n, idx, json.dumps([x[0] for x in g])) + "".join(x[1] for x in g) + "__be(%d);\n" % n)
        idx += len(g)
        h = hashlib.sha1(body.encode("utf-8")).hexdigest()[:10]
        outs.append((name, body)); tags.append('<script defer src="%s?v=%s"></script>' % (name, h)); total += len(body.encode("utf-8"))
    new_block = ("\n<!-- 📦 JS 묶음 (tools/bundle.py) — 아래 📦list 주석 안 목록 순서대로 합쳐 약 320KB 씩 나눈 조각들. 새 .js 는 목록에 줄을 넣고 python3 tools/bundle.py (push 때 Actions 가 자동으로도 돌림) -->\n"
                 + "\n".join(tags) + "\n" + LS + "\n" + listing.strip("\n").replace("<!--", "<!·").replace("-->", "·>") + "\n" + LE + "\n")   # 목록 안 주석은 <!· ·> 로 바꿔 바깥 주석이 안 닫히게
    new_html = html[:a + len(S)] + new_block + html[b:]
    def rd(name):
        q = os.path.join(ROOT, name)
        return open(q, encoding="utf-8").read() if os.path.exists(q) else ""
    stale = [x for x in os.listdir(ROOT) if (CHUNK.match(x) and x not in [o[0] for o in outs]) or x == OUT]
    changed = (new_html != html) or any(rd(nm) != body for nm, body in outs) or bool(stale)
    if check:
        print("바뀜" if changed else "그대로"); sys.exit(3 if changed else 0)
    if changed:
        for nm, body in outs:
            if rd(nm) != body:
                open(os.path.join(ROOT, nm), "w", encoding="utf-8").write(body)
        for x in stale:   # 줄어든 조각 · 예전 한 파일(app.bundle.js)은 지움
            os.remove(os.path.join(ROOT, x))
        open(IDX, "w", encoding="utf-8").write(new_html)
    print("조각 %d개: %d개 파일 · %d KB%s" % (len(outs), len(files), total // 1024, "" if changed else " (그대로)"))


if __name__ == "__main__":
    main()
