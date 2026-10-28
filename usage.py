"""
📈 사용 현황 모으기 (10/28) — 앱이 열릴 때 보내는 익명 신호(ntfy 공개 주제 chkchp-ch-open)를 모아 archive/x/usage.json 에 날짜별로 쌓는다.
  신호 = {d: 기기 번호(난수), day: 날짜, tab: 처음 연 화면, v: 앱 버전, t: 시각}. 이름·관심종목 없음.
  ntfy 는 12시간만 보관 → feedback.yml(2시간마다)에서 같이 돈다. 90일 넘은 날짜는 지움.
  python usage.py
"""
import datetime as dt
import json
import os
import urllib.request

TOPIC = "chkchp-ch-open"
OUT = os.path.join("archive", "x", "usage.json")
KST = dt.timezone(dt.timedelta(hours=9))


def main():
    try:
        U = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        U = {"days": {}}
    days = U.setdefault("days", {})
    seen = set(U.get("seen") or [])
    try:
        req = urllib.request.Request(f"https://ntfy.sh/{TOPIC}/json?poll=1&since=14h", headers={"User-Agent": "ch-investing-usage"})
        raw = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", errors="ignore")
    except Exception as e:
        print("ntfy 실패", e)
        raw = ""
    n = 0
    for line in raw.splitlines():
        try:
            m = json.loads(line)
            if m.get("event") != "message":
                continue
            mid = m.get("id")
            if mid in seen:
                continue
            b = json.loads(m.get("message") or "{}")
            d, day = str(b.get("d") or "")[:12], str(b.get("day") or "")[:10]
            if not d or len(day) != 10:
                continue
            D = days.setdefault(day, {"dev": {}, "tabs": {}, "opens": 0, "ver": {}})
            D["dev"][d] = D["dev"].get(d, 0) + 1
            tab = str(b.get("tab") or "home")[:12]
            D["tabs"][tab] = D["tabs"].get(tab, 0) + 1
            v = str(b.get("v") or "")[:12]
            if v:
                D["ver"][v] = D["ver"].get(v, 0) + 1
            D["opens"] += 1
            seen.add(mid); n += 1
        except Exception:
            continue
    cut = (dt.datetime.now(KST) - dt.timedelta(days=90)).strftime("%Y-%m-%d")
    for k in [k for k in days if k < cut]:
        del days[k]
    U["seen"] = sorted(seen)[-3000:]
    U["at"] = dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(U, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("새 신호", n, "· 날짜", len(days))


if __name__ == "__main__":
    main()
