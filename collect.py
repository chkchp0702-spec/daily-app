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
        dj = src("market-strategy-report", "data", day[:10] + ".json")
        if os.path.exists(dj):
            put("market", day, "data.json", dj)
    # 장부는 최신본 하나 (앱 차트용)
    led = src("market-strategy-report", "ledger", "ledger.json")
    if os.path.exists(led):
        os.makedirs(os.path.join(ARC, "market"), exist_ok=True)
        shutil.copyfile(led, os.path.join(ARC, "market", "ledger.json"))


    # 주간·월간 회고 (reviews/weekly_YYYY-MM-DD.md, reviews/YYYY-MM.md)
    for f in glob.glob(src("market-strategy-report", "reviews", "*.md")):
        b = os.path.basename(f)
        m = re.match(r"weekly_(20\d\d-\d\d-\d\d)\.md$", b)
        if m:
            put("market", m.group(1) + "_WEEK", "review.md", f)
            continue
        m = re.match(r"(20\d\d-\d\d)\.md$", b)
        if m:
            put("market", m.group(1) + "-01_MONTH", "review.md", f)


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
    summ = []
    for day in sorted(days):
        rows = days[day]
        nowv = [r["now"] for r in rows if r["now"] is not None]
        hiv = [r["high"] for r in rows if r["high"] is not None]
        lov = [r["low"] for r in rows if r["low"] is not None]
        types = {}
        for r in rows:
            types[r["type"]] = types.get(r["type"], 0) + 1
        summ.append({"d": day, "n": len(rows),
                     "now": round(sum(nowv) / len(nowv), 2) if nowv else None,
                     "hi": round(sum(hiv) / len(hiv), 2) if hiv else None,
                     "lo": round(sum(lov) / len(lov), 2) if lov else None,
                     "win": sum(1 for v in nowv if v > 0), "types": types})
    os.makedirs(os.path.join(ARC, "danta"), exist_ok=True)
    with open(os.path.join(ARC, "danta", "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summ, f, ensure_ascii=False)


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
    sec = {}
    sp = src("whale40", "data", "sectors.json")
    if os.path.exists(sp):
        sec = json.load(open(sp, encoding="utf-8"))
    for f in glob.glob(src("whale40", "data", "days", "20*.json")):
        day = DATE_RE.search(os.path.basename(f)).group(1)
        d = json.load(open(f, encoding="utf-8"))
        hold = sorted(d.get("hold", {}).items(), key=lambda x: -x[1])[:25]
        out = {"signals": d.get("signals", {}), "inst": d.get("inst", {}), "ppl": d.get("ppl", {}),
               "hold": [[k, v, sec.get(k, "기타")] for k, v in hold]}
        put("whale", day, "data.json", text=json.dumps(out, ensure_ascii=False))
    os.makedirs(os.path.join(ARC, "whale"), exist_ok=True)
    for name in ("index.json", "ranking.json", "backtest.json", "hero_log.json"):
        p = src("whale40", "data", name)
        if os.path.exists(p):
            shutil.copyfile(p, os.path.join(ARC, "whale", name))


# ---------- 컵 / 갭 ----------
def pdf_series(repo, prefix, cat):
    for f in glob.glob(src(repo, "results", f"{prefix}_*.pdf")):
        m = DATE_RE.search(os.path.basename(f))
        if m:
            put(cat, m.group(1), "report.pdf", f)


def _rows(path):
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def _latest(repo, prefix):
    ds = sorted(DATE_RE.search(os.path.basename(p)).group(1)
                for p in glob.glob(src(repo, "results", f"{prefix}_*.pdf")))
    return ds[-1] if ds else None


def _tf(v):
    return str(v).strip().lower() == "true"


def cup_cards():
    day = _latest("Cup", "report_cup")
    if not day:
        return
    R = lambda n: _rows(src("Cup", "results", n))
    def card(r, tag=""):
        return {"name": r.get("종목명", ""), "code": r.get("코드", ""), "mkt": r.get("시장", ""),
                "sector": r.get("섹터", ""), "shape": r.get("모양", "") or r.get("패턴", ""),
                "price": num(r.get("현재가")), "pivot": num(r.get("매수기준가")), "dist": num(r.get("기준가까지%")),
                "depth": num(r.get("컵깊이%")), "weeks": num(r.get("컵기간주")), "handle": num(r.get("손잡이%")),
                "rs": num(r.get("상대강도")), "score": num(r.get("컵점수")), "acc": num(r.get("매집강도")),
                "brk": _tf(r.get("돌파")), "brkday": r.get("돌파일", ""), "ath": num(r.get("현재가_최고가대비%")),
                "point": r.get("투자포인트", ""), "streak": num(r.get("연속일")), "new": _tf(r.get("NEW")), "tag": tag}
    ath = [card(r, "사상최고가 돌파") for r in R("list0_ath_breakout.csv")]
    allc = R("list1_cup.csv")
    by_mkt, by_sec = {}, {}
    for r in allc:
        by_mkt[r.get("시장", "")] = by_mkt.get(r.get("시장", ""), 0) + 1
        s_ = r.get("섹터", "") or "미분류"
        by_sec[s_] = by_sec.get(s_, 0) + 1
    allc.sort(key=lambda r: -(num(r.get("컵점수")) or 0))
    seen = {c["code"] for c in ath}
    top = [card(r) for r in allc if r.get("코드") not in seen][:60]
    out = {"ath": ath, "top": top, "total": len(allc), "by_mkt": by_mkt,
           "by_sec": sorted(by_sec.items(), key=lambda x: -x[1])[:10]}
    put("cup", day, "cards.json", text=json.dumps(out, ensure_ascii=False))


def gap_cards():
    day = _latest("Gap", "report_gap")
    if not day:
        return
    allg = _rows(src("Gap", "results", "list1_gap.csv"))
    def card(r):
        return {"name": r.get("종목명", ""), "code": r.get("코드", ""), "mkt": r.get("시장", ""),
                "sector": r.get("섹터", ""), "price": num(r.get("현재가")), "gday": r.get("갭일", ""),
                "after": num(r.get("갭후일수")), "gap": num(r.get("갭크기%")), "vol": num(r.get("거래량배수")),
                "gopen": num(r.get("갭시가")), "glow": num(r.get("갭저가")),
                "boxhi": num(r.get("박스고점")), "boxlo": num(r.get("박스저점")), "boxw": num(r.get("횡보주")),
                "hold": _tf(r.get("갭유지")), "full": _tf(r.get("완전돌파")), "fresh": _tf(r.get("막돌파")),
                "ath": num(r.get("최고가대비%")), "rs": num(r.get("상대강도")), "score": num(r.get("갭점수")),
                "point": r.get("투자포인트", ""), "streak": num(r.get("연속일")), "new": _tf(r.get("NEW"))}
    by_mkt, by_sec = {}, {}
    for r in allg:
        by_mkt[r.get("시장", "")] = by_mkt.get(r.get("시장", ""), 0) + 1
        s_ = r.get("섹터", "") or "미분류"
        by_sec[s_] = by_sec.get(s_, 0) + 1
    allg.sort(key=lambda r: -(num(r.get("갭점수")) or 0))
    out = {"top": [card(r) for r in allg[:60]], "total": len(allg), "by_mkt": by_mkt,
           "by_sec": sorted(by_sec.items(), key=lambda x: -x[1])[:10]}
    put("gap", day, "cards.json", text=json.dumps(out, ensure_ascii=False))


# ---------- 관심섹터 ----------
def sector():
    for f in glob.glob(src("stock-screener", "briefing_data", "daily", "*.txt")):
        m = DATE_RE.search(os.path.basename(f))
        if m:
            put("sector", m.group(1), "briefing.txt", f)
    lj = src("stock-screener", "briefing_data", "daily", "latest.json")
    if os.path.exists(lj):
        d = json.load(open(lj, encoding="utf-8"))
        if DATE_RE.match(d.get("date", "")):
            put("sector", d["date"], "top.json", lj)
    for f in glob.glob(src("sector-watch", "reports", "returns_20*.csv")):
        day = DATE_RE.search(os.path.basename(f)).group(1)
        put("sector", day, "returns.csv", f)
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
    for fn in (market, danta, whale, sector, accum, cup_cards, gap_cards):
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
