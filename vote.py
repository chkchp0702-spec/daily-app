"""
🎯 아침 1탭 예측 게임 모으기 (10/31 사용자 「C 1번 진행」)
  앱에서 「코스피 오를까?」 한 번 누르면 ntfy 공개 주제(chkchp-ch-vote)로 {d: 기기 번호(난수), day: 맞힐 날, p: +1/-1, nm: 별명} 이 감.
  여기서 모아 archive/x/vote.json 에 날마다 쌓고, 장이 끝난 날은 코스피로 채점 → 주간 순위 · 조이(앱 확률) vs 사람.
  · 그날 09:00(한국) 뒤에 들어온 표는 버림 (장 시작 뒤엔 못 바꿈)
  · 조이의 답 = 그날 아침 앱 확률(prob.json 한국 p1) 50% 이상이면 오름
  · 이름·관심종목은 안 받음 — 별명은 게임 카드에서 따로 정함(비우면 PB-xxxx · 공개 순위에 보이므로 실명 대신 별명)
  python vote.py
"""
import datetime as dt
import json
import os
import urllib.request

TOPIC = "chkchp-ch-vote"
X = os.path.join("archive", "x")
OUT = os.path.join(X, "vote.json")
KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
TODAY = NOW.date().isoformat()


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def kospi_closes():
    """port_px 코스피 종가 → {날짜: 종가}"""
    ix = jl(os.path.join(X, "port_px", "index.json"), {}) or {}
    a = (ix.get("assets") or {}).get("KOSPI")
    if not a:
        return {}
    j = jl(os.path.join(X, "port_px", a["f"]), {}) or {}
    try:
        d0 = dt.date.fromisoformat(j["d0"])
        dd = json.loads(j["dd"]) if isinstance(j["dd"], str) else j["dd"]
        cc = json.loads(j["c"]) if isinstance(j["c"], str) else j["c"]
    except Exception:
        return {}
    out, d = {}, d0
    for i, (g, c) in enumerate(zip(dd, cc)):
        d = d + dt.timedelta(days=int(g)) if i else d0
        out[d.isoformat()] = float(c)
    return out


def result_of(day, K, L):
    """그날 코스피 등락(%) — 실시간 마감(live_kr) 먼저, 없으면 종가 기록"""
    if L.get("date") == day and str(L.get("t") or "") >= "15:30":
        k = next((x for x in L.get("index") or [] if x.get("name") == "코스피"), None)
        if k and k.get("chg") is not None:
            return float(k["chg"])
    if day in K:
        prev = [d for d in K if d < day]
        if prev:
            p = K[max(prev)]
            return round((K[day] / p - 1) * 100, 2)
    return None


def main():
    V = jl(OUT, {}) or {}
    days = V.setdefault("days", {})
    raw_votes = V.setdefault("raw", {})          # {day: {기기: [p, 별명, "HH:MM"]}}
    seen = set(V.get("seen") or [])
    try:
        req = urllib.request.Request(f"https://ntfy.sh/{TOPIC}/json?poll=1&since=14h", headers={"User-Agent": "ch-investing-vote"})
        raw = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", errors="ignore")
    except Exception as e:
        print("ntfy 실패", e)
        raw = ""
    n = 0
    for line in raw.splitlines():
        try:
            m = json.loads(line)
            if m.get("event") != "message" or m.get("id") in seen:
                continue
            seen.add(m.get("id"))
            b = json.loads(m.get("message") or "{}")
            dev, day, p = str(b.get("d") or "")[:12], str(b.get("day") or "")[:10], int(b.get("p") or 0)
            nm = str(b.get("nm") or "").strip()[:16]
            dt.date.fromisoformat(day)                  # 날짜가 이상하면 여기서 걸러짐
            if not dev or p not in (1, -1):
                continue
            at = dt.datetime.fromtimestamp(int(m.get("time") or 0), KST)
            if at >= dt.datetime.fromisoformat(day + "T09:00:00+09:00"):   # 장 시작 뒤 표는 버림
                continue
            raw_votes.setdefault(day, {})[dev] = [p, nm, at.strftime("%H:%M")]
            n += 1
        except Exception:
            continue
    # 조이(앱 확률)의 답 — 그날 장 시작 전까지 마지막으로 본 값
    P = jl(os.path.join(X, "prob.json"), {}) or {}
    kr = (P.get("markets") or {}).get("KR") or {}
    nd = kr.get("next_day")
    if nd and kr.get("p1") is not None and NOW < dt.datetime.fromisoformat(nd + "T09:00:00+09:00"):
        dd = days.setdefault(nd, {})
        dd["joey_p"] = round(float(kr["p1"]) * 100)
        dd["joey"] = 1 if kr["p1"] >= 0.5 else -1
    # 집계 + 채점
    K = kospi_closes()
    L = jl(os.path.join(X, "live_kr.json"), {}) or {}
    for day, vs in raw_votes.items():
        dd = days.setdefault(day, {})
        dd["up"] = sum(1 for v in vs.values() if v[0] > 0)
        dd["dn"] = sum(1 for v in vs.values() if v[0] < 0)
    for day, dd in days.items():
        if dd.get("res") is None and day <= TODAY:
            r = result_of(day, K, L)
            if r is not None:
                dd["chg"] = r
                dd["res"] = 1 if r > 0 else -1 if r < 0 else 0
    # 순위 — 이번 주(월~일) · 전체
    wk0 = (NOW.date() - dt.timedelta(days=NOW.weekday())).isoformat()

    def board(since):
        S = {}
        for day, vs in raw_votes.items():
            res = (days.get(day) or {}).get("res")
            if day < since or res is None or res == 0:
                continue
            for dev, v in vs.items():
                s = S.setdefault(dev, {"id": dev[:4], "nm": v[1] or "PB-" + dev[:4], "w": 0, "n": 0})
                s["n"] += 1
                s["w"] += 1 if v[0] == res else 0
                if v[1]:
                    s["nm"] = v[1]
        rows = sorted(S.values(), key=lambda s: (-s["w"], s["n"], s["nm"]))
        return rows[:20]

    def joey(since):
        w = n = 0
        for day, dd in days.items():
            if day >= since and dd.get("res") not in (None, 0) and dd.get("joey"):
                n += 1
                w += 1 if dd["joey"] == dd["res"] else 0
        return {"w": w, "n": n}

    def people(since):
        w = n = 0
        for day, vs in raw_votes.items():
            res = (days.get(day) or {}).get("res")
            if day >= since and res not in (None, 0):
                for v in vs.values():
                    n += 1
                    w += 1 if v[0] == res else 0
        return {"w": w, "n": n}

    V["week"] = {"from": wk0, "rows": board(wk0), "joey": joey(wk0), "people": people(wk0)}
    V["all"] = {"rows": board("2000-01-01")[:10], "joey": joey("2000-01-01"), "people": people("2000-01-01")}
    # 120일 넘은 날은 지움
    cut = (NOW.date() - dt.timedelta(days=120)).isoformat()
    V["days"] = {k: v for k, v in days.items() if k >= cut}
    V["raw"] = {k: v for k, v in raw_votes.items() if k >= cut}
    V["seen"] = sorted(seen)[-3000:]
    V["at"] = NOW.strftime("%Y-%m-%d %H:%M")
    os.makedirs(X, exist_ok=True)
    json.dump(V, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("표", n, "· 날", len(V["days"]), "· 이번 주", len(V["week"]["rows"]), "명")


if __name__ == "__main__":
    main()
