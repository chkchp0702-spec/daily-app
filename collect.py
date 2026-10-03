"""
각 프로그램 레포(_src/*)에서 자료를 모아 archive/ 에 날짜별로 '누적' 저장하고
앱이 읽을 manifest.json 을 만든다.  (이미 있는 날짜 자료는 지우지 않음)

카테고리
  market  시황        market-strategy-report/reports/<날짜_구분>/*.pdf, kakao.txt   (비공개 레포)
  danta   단타        stock-screener/data/tracking.csv  → 날짜별 알람 목록
  whale   고래        whale40/report/<날짜>-mobile.html, <날짜>.pdf
  cup     컵차트      Cup/results/report_cup_<날짜>.pdf
  gap     갭차트      Gap/results/report_gap_<날짜>.pdf
  sector  관심섹터    stock-screener/briefing_data/daily/<날짜>.txt  (+ sector-watch, 비공개)
  accum   조용한 매집  Cup/results/list3_accum.csv  → 그날 날짜로 보관
"""
import csv, json, os, re, shutil, glob, datetime

SRC = "_src"
ARC = "archive"
KST = datetime.timezone(datetime.timedelta(hours=9))
DATE_RE = re.compile(r"(20\d\d-\d\d-\d\d)")


def src(*p):
    return os.path.join(SRC, *p)


def put(cat, day, name, from_path=None, text=None, overwrite=True):
    d = os.path.join(ARC, cat, day)
    os.makedirs(d, exist_ok=True)
    dst = os.path.join(d, name)
    if os.path.exists(dst) and not overwrite:
        return
    if from_path:
        shutil.copyfile(from_path, dst)
    else:
        with open(dst, "w", encoding="utf-8") as f:
            f.write(text)


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


# ---------- 시황 ----------
def market():
    for folder in glob.glob(src("market-strategy-report", "reports", "*")):
        day = os.path.basename(folder)
        if not DATE_RE.match(day):
            continue
        for f in os.listdir(folder):
            if f.endswith((".pdf", ".txt")):
                put("market", day, f, os.path.join(folder, f))


# ---------- 단타 ----------
def danta():
    path = src("stock-screener", "data", "tracking.csv")
    if not os.path.exists(path):
        return
    days = {}
    with open(path, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            t = r.get("시각", "")
            if len(t) < 13:
                continue
            day = f"{t[:4]}-{t[4:6]}-{t[6:8]}"
            days.setdefault(day, []).append({
                "time": f"{t[9:11]}:{t[11:13]}",
                "code": r.get("code", ""),
                "name": r.get("name", ""),
                "type": "알람" if (r.get("유형") or "").lower() in ("", "nan") else r.get("유형"),
                "price": num(r.get("알람가")),
                "chg": num(r.get("당일등락")),
                "m30": num(r.get("30분")),
                "high": num(r.get("최고")),
                "low": num(r.get("최저")),
                "now": num(r.get("현재")),
                "exit": re.sub(r"(?i)nan", "", r.get("청산알림") or "").strip(),
                "stop": num(r.get("손절")),
                "t1": num(r.get("목표1")),
                "t2": num(r.get("목표2")),
            })
    for day, rows in days.items():
        put("danta", day, "alerts.json", text=json.dumps(rows, ensure_ascii=False), overwrite=True)


# ---------- 고래 ----------
def whale():
    rep = src("whale40", "report")
    if not os.path.isdir(rep):
        return
    # 종목 상세 페이지(s/*.html)는 최신본 하나만 공유
    sdir = src("whale40", "docs", "s")
    if os.path.isdir(sdir):
        os.makedirs(os.path.join(ARC, "whale", "s"), exist_ok=True)
        for f in os.listdir(sdir):
            shutil.copyfile(os.path.join(sdir, f), os.path.join(ARC, "whale", "s", f))
    for f in os.listdir(rep):
        m = re.match(r"(20\d\d-\d\d-\d\d)(-mobile\.html|\.pdf)$", f)
        if not m:
            continue
        day = m.group(1)
        if f.endswith(".html"):
            html = open(os.path.join(rep, f), encoding="utf-8").read()
            html = html.replace('href="s/', 'href="../s/')
            html = html.replace("<head>", '<head><base target="_blank">', 1)
            put("whale", day, "report.html", text=html)
        else:
            put("whale", day, "report.pdf", os.path.join(rep, f))


# ---------- 컵 / 갭 ----------
def pdf_series(repo, prefix, cat):
    for f in glob.glob(src(repo, "results", f"{prefix}_*.pdf")):
        m = DATE_RE.search(os.path.basename(f))
        if m:
            put(cat, m.group(1), "report.pdf", f)


# ---------- 관심섹터 ----------
def sector():
    for f in glob.glob(src("stock-screener", "briefing_data", "daily", "*.txt")):
        m = DATE_RE.search(os.path.basename(f))
        if m:
            put("sector", m.group(1), "briefing.txt", f)
    for f in glob.glob(src("sector-watch", "reports", "20*.md")):
        day = DATE_RE.search(os.path.basename(f)).group(1)
        put("sector", day, "sector.md", f)
        png = src("sector-watch", "reports", f"heatmap_{day}.png")
        if os.path.exists(png):
            put("sector", day, "heatmap.png", png)


# ---------- 조용한 매집 ----------
def accum():
    path = src("Cup", "results", "list3_accum.csv")
    if not os.path.exists(path):
        return
    dates = sorted(DATE_RE.search(os.path.basename(p)).group(1)
                   for p in glob.glob(src("Cup", "results", "report_cup_*.pdf")))
    if not dates:
        return
    rows = []
    with open(path, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            rows.append({
                "code": r.get("코드", ""), "mkt": r.get("시장", ""), "name": r.get("종목명", ""),
                "price": num(r.get("현재가")), "vol": num(r.get("거래량배수")),
                "m1": num(r.get("한달가격%")), "score": num(r.get("매집점수")),
                "tag": r.get("판정", ""), "dist": r.get("분배의심") == "True",
                "rs": num(r.get("상대강도")), "days": num(r.get("매집일째")),
                "sector": r.get("섹터", ""), "hi52": num(r.get("52주고점대비%")),
            })
    rows.sort(key=lambda x: -(x["score"] or 0))
    put("accum", dates[-1], "list.json", text=json.dumps(rows, ensure_ascii=False), overwrite=True)


def manifest():
    cats = {}
    for cat in ["market", "danta", "whale", "cup", "gap", "sector", "accum", "onepager"]:
        base = os.path.join(ARC, cat)
        items = []
        if os.path.isdir(base):
            for day in sorted(os.listdir(base), reverse=True):
                p = os.path.join(base, day)
                if os.path.isdir(p) and DATE_RE.match(day):
                    items.append({"id": day, "files": sorted(os.listdir(p))})
        cats[cat] = items
    out = {"updated": datetime.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "cats": cats}
    with open("manifest.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)


if __name__ == "__main__":
    for fn in (market, danta, whale, sector, accum):
        try:
            fn()
        except Exception as e:
            print("skip", fn.__name__, e)
    for args in (("Cup", "report_cup", "cup"), ("Gap", "report_gap", "gap")):
        try:
            pdf_series(*args)
        except Exception as e:
            print("skip", args, e)
    manifest()
    print("ok")
