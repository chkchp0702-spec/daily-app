"""
👁 눈 검사 — 스캐너(컵·갭)가 1차로 고른 종목의 차트를 그림으로 그려 사람(Claude) 눈으로 보고,
   컵 모양이 아닌 것 · 갭 상승으로 안 보이는 것을 뺀다.  (매일 아침 예약 작업이 돌린다)

  python eye/eye.py render            → 컵·갭 결과를 받아 /tmp/eye/<mode>_NN.png 타일 그림 + /tmp/eye/<mode>_index.json
  python eye/eye.py apply cup  drop.json   → archive/x/eye_cup.json 저장 (drop.json = {"코드": "짧은 이유", ...})
  python eye/eye.py apply gap  drop.json   → archive/x/eye_gap.json 저장
  python eye/eye.py status            → 오늘 눈 검사 파일 상태

  그림 한 장 = 종목 20개(4×5). 각 칸: 번호 · 종목명 · 코드 · 스캐너 점수.
    컵: 종가 선, 노란 점선 = 매수 기준가(피봇), L/B/R = 왼쪽 고점·바닥·오른쪽, 초록 ▲ = 돌파일
    갭: 종가 선, 회색 상자 = 갭 전 횡보 박스, 초록 ▲ = 갭 난 날
"""
import csv
import glob
import json
import os
import re
import subprocess
import sys
import datetime as dt

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.environ.get("EYE_OUT", "/tmp/eye")
SRC = {"cup": ("https://github.com/chkchp0702-spec/Cup", "report_cup"), "gap": ("https://github.com/chkchp0702-spec/Gap", "report_gap")}
KST = dt.timezone(dt.timedelta(hours=9))
COLS, ROWS, CW, CH = 4, 5, 330, 215


def font(sz, bold=False):
    for p in ("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
              "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, sz)
            except Exception:
                pass
    return ImageFont.load_default()


def fetch(mode):
    """컵/갭 저장소의 results/ 만 받아온다 (얕은 clone). 이미 있으면 pull."""
    url, _ = SRC[mode]
    d = os.path.join(OUT, "src_" + mode)
    if os.path.isdir(os.path.join(d, ".git")):
        subprocess.run(["git", "-C", d, "pull", "-q", "--ff-only"], check=False)
    else:
        os.makedirs(OUT, exist_ok=True)
        subprocess.run(["git", "clone", "-q", "--depth", "1", url, d], check=True)
    return d


def scan_date(d, prefix):
    fs = sorted(glob.glob(os.path.join(d, "results", prefix + "_*.pdf")))
    m = re.search(r"(\d{4}-\d{2}-\d{2})", fs[-1]) if fs else None
    return m.group(1) if m else None


def rows(path):
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def draw_cup(im, x0, y0, ch):
    c = ch["c"]
    n = len(c)
    pad, W, H = 8, CW - 16, CH - 58
    lo, hi = min(c), max(c)
    hi = max(hi, ch.get("piv") or hi)
    if hi <= lo:
        return
    X = lambda i: x0 + pad + i / max(n - 1, 1) * W
    Y = lambda v: y0 + 40 + (1 - (v - lo) / (hi - lo)) * H
    d = ImageDraw.Draw(im)
    pts = [(X(i), Y(v)) for i, v in enumerate(c)]
    d.line(pts, fill=(30, 60, 140), width=2)
    if ch.get("piv"):
        y = Y(ch["piv"])
        for xx in range(int(x0 + pad), int(x0 + pad + W), 8):
            d.line([(xx, y), (xx + 4, y)], fill=(220, 160, 20), width=1)
    for k, lab, col in (("li", "L", (200, 40, 40)), ("bi", "B", (40, 40, 200)), ("ri", "R", (30, 140, 60))):
        i = ch.get(k)
        if i is not None and 0 <= i < n:
            d.ellipse([X(i) - 4, Y(c[i]) - 4, X(i) + 4, Y(c[i]) + 4], fill=col)
            d.text((X(i) - 3, Y(c[i]) + 6 if k == "bi" else Y(c[i]) - 18), lab, fill=col, font=font(11, True))
    if ch.get("bo") is not None and 0 <= ch["bo"] < n:
        i = ch["bo"]
        d.polygon([(X(i), Y(c[i]) + 4), (X(i) - 5, Y(c[i]) + 13), (X(i) + 5, Y(c[i]) + 13)], fill=(30, 160, 60))
    if ch.get("he") is not None and ch.get("ri") is not None and ch["he"] > ch["ri"]:
        d.rectangle([X(ch["ri"]), y0 + 40, X(min(ch["he"], n - 1)), y0 + 40 + H], outline=(230, 190, 60), width=1)


def draw_gap(im, x0, y0, ch):
    c = ch["c"]
    n = len(c)
    pad, W, H = 8, CW - 16, CH - 58
    lo, hi = min(c), max(c)
    lo, hi = min(lo, ch.get("blo") or lo), max(hi, ch.get("bhi") or hi)
    if hi <= lo:
        return
    X = lambda i: x0 + pad + i / max(n - 1, 1) * W
    Y = lambda v: y0 + 40 + (1 - (v - lo) / (hi - lo)) * H
    d = ImageDraw.Draw(im)
    if ch.get("bs") is not None and ch.get("be") is not None:
        d.rectangle([X(ch["bs"]), Y(ch["bhi"]), X(ch["be"]), Y(ch["blo"])], fill=(228, 228, 232), outline=(170, 170, 180))
    d.line([(X(i), Y(v)) for i, v in enumerate(c)], fill=(30, 60, 140), width=2)
    if ch.get("bhi"):
        y = Y(ch["bhi"])
        for xx in range(int(x0 + pad), int(x0 + pad + W), 8):
            d.line([(xx, y), (xx + 4, y)], fill=(220, 160, 20), width=1)
    g = ch.get("gap")
    if g is not None and 0 < g < n:
        d.polygon([(X(g), Y(c[g]) + 4), (X(g) - 5, Y(c[g]) + 13), (X(g) + 5, Y(c[g]) + 13)], fill=(30, 160, 60))
        d.line([(X(g - 1), Y(c[g - 1])), (X(g), Y(c[g]))], fill=(230, 60, 60), width=3)


def render(mode):
    d = fetch(mode)
    prefix = SRC[mode][1]
    day = scan_date(d, prefix)
    lst = rows(os.path.join(d, "results", f"list1_{mode}.csv"))
    try:
        charts = json.load(open(os.path.join(d, "results", f"charts_{mode}.json"), encoding="utf-8"))
    except Exception:
        charts = {}
    os.makedirs(OUT, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, f"{mode}_*.png")):
        os.remove(f)
    items = []
    for r in lst:
        code = str(r.get("코드", ""))
        if code in charts:
            items.append((code, r))
    index, page = [], 0
    for s in range(0, len(items), COLS * ROWS):
        chunk = items[s:s + COLS * ROWS]
        page += 1
        im = Image.new("RGB", (COLS * CW, ROWS * CH + 30), (250, 250, 252))
        dr = ImageDraw.Draw(im)
        dr.text((10, 6), f"{'컵' if mode == 'cup' else '갭'} 눈 검사 · {day} · {page}쪽 · #{s + 1}~#{s + len(chunk)}", fill=(60, 60, 70), font=font(15, True))
        for k, (code, r) in enumerate(chunk):
            x0, y0 = (k % COLS) * CW, 30 + (k // COLS) * CH
            dr.rectangle([x0 + 2, y0 + 2, x0 + CW - 2, y0 + CH - 2], outline=(200, 200, 210), fill=(255, 255, 255))
            num = s + k + 1
            name = (r.get("종목명") or code)[:14]
            sc = r.get("모양점수", "")
            extra = (r.get("패턴", "") if mode == "cup" else f"갭 {r.get('갭크기%', '')}% · 박스 {r.get('횡보주', '')}주")
            dr.text((x0 + 8, y0 + 6), f"#{num}", fill=(200, 40, 40), font=font(15, True))
            dr.text((x0 + 48, y0 + 7), f"{name}  {code}", fill=(30, 30, 40), font=font(13, True))
            dr.text((x0 + 8, y0 + 24), f"모양 {sc} · {extra}", fill=(110, 110, 120), font=font(11))
            (draw_cup if mode == "cup" else draw_gap)(im, x0, y0, charts[code])
            index.append({"n": num, "code": code, "name": r.get("종목명", ""), "mkt": r.get("시장", ""), "page": page, "shape": sc})
        im.save(os.path.join(OUT, f"{mode}_{page:02d}.png"), optimize=True)
    json.dump({"mode": mode, "scan_date": day, "n": len(items), "pages": page, "items": index},
              open(os.path.join(OUT, f"{mode}_index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"{mode}: 스캔일 {day} · 1차 {len(lst)}종목 · 그림 {page}장 ({len(items)}종목) → {OUT}/{mode}_NN.png")


def apply(mode, drop_path):
    idx = json.load(open(os.path.join(OUT, f"{mode}_index.json"), encoding="utf-8"))
    if not idx["items"]:
        print(f"{mode}: 차트 자료가 없어 눈 검사를 건너뜀 (eye 파일 안 씀)")
        return
    drop = json.load(open(drop_path, encoding="utf-8")) if os.path.exists(drop_path) else {}
    drop = {str(k): str(v) for k, v in drop.items()}
    codes = [x["code"] for x in idx["items"]]
    keep = [c for c in codes if c not in drop]
    out = {"mode": mode, "scan_date": idx["scan_date"], "checked": dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"),
           "n_in": len(codes), "n_keep": len(keep), "keep": keep,
           "drop": {c: drop[c] for c in codes if c in drop},
           "names": {x["code"]: x["name"] for x in idx["items"]}}
    p = os.path.join(ROOT, "archive", "x", f"eye_{mode}.json")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{mode}: 1차 {len(codes)} → 눈 검사 뒤 {len(keep)}종목 ({len(out['drop'])}개 뺌) → {p}")


def status():
    for m in ("cup", "gap"):
        p = os.path.join(ROOT, "archive", "x", f"eye_{m}.json")
        if os.path.exists(p):
            j = json.load(open(p, encoding="utf-8"))
            print(m, j["scan_date"], j["checked"], f"{j['n_in']} → {j['n_keep']}")
        else:
            print(m, "없음")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    if cmd == "render":
        for m in (sys.argv[2:] or ["cup", "gap"]):
            try:
                render(m)
            except Exception as e:
                print(m, "render 실패:", e)
    elif cmd == "apply":
        apply(sys.argv[2], sys.argv[3])
    else:
        status()
