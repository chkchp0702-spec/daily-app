"""
🔭 11/11 하락장 관찰 목록(A11/11-2 · 사용자 「둘 다 진행」)
코스피가 🐻 하락장(현금 100% · 새로 사지 않기)인 동안 신호 탭(☕ 컵 · 📈 갭 · ⚡ 단타 · 🤫 매집)에 뜬
🇰🇷 한국 종목을 종목별로 모아 archive/x/bear_watch.json 에 적는다 → 앱(ux1111.js)은 그리기만.
수익률은 계산하지 않는다(종목별 성적은 그 종목 화면 🧵) · 매수 권유 아님.
판정이 풀리면 마지막 목록을 그대로 두고 ended 날짜만 적는다(앱은 14일 동안 「쌓인 신호 n개」 한 줄).
"""
import datetime, glob, json, os, re, urllib.request

ARC = "archive"
OUT = os.path.join(ARC, "x", "bear_watch.json")
KST = datetime.timezone(datetime.timedelta(hours=9))
BEAR_LOCAL = "_src/market-strategy-report/market/bear.json"
BEAR_RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bear.json"
KR = re.compile(r"^\d{6}(\.K[SQ])?$")


def load_bear():
    try:
        if os.path.exists(BEAR_LOCAL):
            return json.load(open(BEAR_LOCAL, encoding="utf-8"))
        with urllib.request.urlopen(BEAR_RAW, timeout=20) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as ex:
        print("bear.json 못 읽음:", ex)
        return None


def walk(o, f):
    if isinstance(o, dict):
        f(o)
        for v in o.values():
            walk(v, f)
    elif isinstance(o, list):
        for v in o:
            walk(v, f)


def day_rows(day):
    """그날 신호 탭에 뜬 한국 종목 → {code6: (name, label)}"""
    got = {}

    def add(code, name, label):
        c = str(code)[:6]
        if c not in got:
            got[c] = [name or c, []]
        if label not in got[c][1]:
            got[c][1].append(label)

    for cat, fn in (("cup", "cards.json"), ("gap", "cards.json"), ("accum", "list.json")):
        p = os.path.join(ARC, cat, day, fn)
        if not os.path.exists(p):
            continue
        try:
            d = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue

        def f(x, cat=cat):
            code = str(x.get("code") or "")
            if x.get("mkt") == "KR" or (not x.get("mkt") and KR.match(code)):
                if not KR.match(code):
                    return
                lab = {"cup": "☕ 컵 돌파" if x.get("brk") else "☕ 컵", "gap": "📈 갭", "accum": "🤫 매집"}[cat]
                add(code, str(x.get("name") or "").strip(), lab)
        walk(d, f)
    p = os.path.join(ARC, "danta", day, "alerts.json")
    if os.path.exists(p):
        try:
            for x in json.load(open(p, encoding="utf-8")) or []:
                code = str(x.get("code") or "")
                if KR.match(code):
                    add(code, x.get("name"), "⚡ 단타")
        except Exception:
            pass
    return got


def main():
    now = datetime.datetime.now(KST)
    B = load_bear()
    prev = {}
    if os.path.exists(OUT):
        try:
            prev = json.load(open(OUT, encoding="utf-8"))
        except Exception:
            prev = {}
    k = None
    if B:
        k = next((m for m in B.get("markets", []) if m.get("key") == "kospi"), None)
    if not k:
        print("코스피 판정 없음 — 그대로 둠")
        return
    bear = k.get("state") == "🐻"
    if not bear:
        if prev.get("state") == "🐻" and not prev.get("ended"):
            prev.update({"state": k.get("state"), "ended": now.strftime("%Y-%m-%d"), "at": now.strftime("%Y-%m-%d %H:%M")})
            json.dump(prev, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            print("판정 풀림 — 목록 고정", prev.get("n"))
        return
    start = ((k.get("rebounds") or {}).get("from")) or prev.get("from") or k.get("since")
    days = sorted({os.path.basename(x) for c in ("cup", "gap", "danta", "accum") for x in glob.glob(os.path.join(ARC, c, "20??-??-??"))})
    days = [d for d in days if d >= start]
    S = {}
    for d in days:
        for c, (name, labs) in day_rows(d).items():
            s = S.setdefault(c, {"c": c, "n": name, "first": d, "last": d, "days": 0, "s": []})
            s["last"] = d
            s["days"] += 1
            if name and (s["n"] == c):
                s["n"] = name
            for l in labs:
                if l not in s["s"]:
                    s["s"].append(l)
    for s in S.values():   # 「컵 돌파」가 있으면 「컵」은 겹치니 뺌
        if "☕ 컵 돌파" in s["s"]:
            s["s"] = [l for l in s["s"] if l != "☕ 컵"]
    rows = sorted(S.values(), key=lambda x: (x["last"], x["first"]), reverse=True)
    last = days[-1] if days else None
    out = {
        "at": now.strftime("%Y-%m-%d %H:%M"), "state": "🐻", "from": start, "rec_from": days[0] if days else None,
        "last_day": last, "n": len(rows), "new_last": sum(1 for r in rows if r["first"] == last),
        "on_last": sum(1 for r in rows if r["last"] == last), "ended": None, "rows": rows,
        "note": "코스피 🐻 동안 신호 탭에 뜬 한국 종목 · 기록만(사지 않음) · 수익률 계산 없음",
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("bear_watch", out["n"], "종목 ·", out["rec_from"], "→", last, "· 마지막 날", out["on_last"], "(새", out["new_last"], ")")


if __name__ == "__main__":
    main()
