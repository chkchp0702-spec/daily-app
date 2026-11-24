"""🗣 말 맞춤 검사기 (11/24 냉정 분석 7차 ④ — 사용자 「통일성 있게 다 같은 말을 하게」)

원본 say.json(market-strategy-report src/say.py)과 다른 글(아침판 morning.json · 고객 질문 답 qa.json · 오늘 한 장 pbbrief.json)이 같은 말을 하는지 기계로 맞춰 봄.
  ① 원본이 계기판보다 늦지 않았나                      ② 「○○일선 6,020」 같은 선 숫자가 원본과 다른가(0.15% 넘게)
  ③ 미국 주식 몫을 옛말(현금 26 유지·50.4% 그대로·주식 0%)로 쓰고 있나   ④ 거리를 반대 방향으로 썼나(「200일선 −1.5%」)
  ⑤ 문장이 중간에 끊겼나(「…쫓지 말고, 美 200일선」)       ⑥ 주식 몫 옆에 「🟢 정상」 딱지가 붙었나
사용: python3 tools/say_check.py <market-strategy-report 경로> [결과.json]      (live.yml 이 10분마다 · health.py 가 결과를 건강검진에 올림)
규칙·화면을 바꾸지 않음 — 찾아서 적기만 함. 고치는 건 「자가 업그레이드」가 problems 를 보고.
"""
import datetime as dt
import json
import os
import re
import sys

KST = dt.timezone(dt.timedelta(hours=9))
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MSR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(APP, "archive", "m")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(APP, "archive", "x", "say_check.json")

MK = [("kospi", r"코스피"), ("kosdaq", r"코스닥"), ("nasdaq", r"나스닥"), ("sp500", r"S&P\s?500|S&P|美|미국|해외")]
LINE = {"20": "m20", "50": "m50", "200": "m200"}
TOL = 0.15   # % — 반올림 차이는 봐줌
FAR = 4.0    # % — 이보다 멀면 다른 날·다른 지수 얘기로 보고 안 셈


def jread(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def texts():
    """(어디, 글) 목록 — 사람이 읽는 문장만"""
    out = []
    mo = jread(os.path.join(MSR, "market", "morning.json"), {}) or {}
    for c in mo.get("cards") or []:
        out.append(("아침판 카드 「" + str(c.get("k")) + "」", " ".join(str(c.get(x) or "") for x in ("t", "s"))))
    for t in mo.get("triggers") or []:
        out.append(("아침판 오늘 장 준비", " → ".join(str(t.get(x) or "") for x in ("signal", "claim", "dist"))))
    for a in ((mo.get("actions") or {}).get("hold") or []) + ((mo.get("actions") or {}).get("down") or []) + ((mo.get("actions") or {}).get("up") or []):
        out.append(("아침판 할 일 「" + str(a.get("name")) + "」", " ".join(str(a.get(x) or "") for x in ("why", "cond", "chg"))))
    qa = jread(os.path.join(MSR, "market", "qa.json"), {}) or {}
    for it in qa.get("items") or []:
        out.append(("고객 질문 답 「" + str(it.get("q"))[:24] + "」", str(it.get("a") or "") + " " + " ".join(str(p.get("t") or "") for p in (it.get("pts") or []))))
    pb = jread(os.path.join(APP, "archive", "x", "pbbrief.json"), {}) or {}
    if pb.get("one"):
        out.append(("오늘 한 장 한 줄", str(pb["one"])))
    for x in ((pb.get("advice") or {}).get("plan") or []):
        out.append(("오늘 한 장 조언", str(x)))
    return out, {"morning": mo.get("at"), "qa": qa.get("at"), "pbbrief": pb.get("at") or pb.get("asof")}


def sentences(t):
    return [s for s in re.split(r"(?<=[.!?。])\s+|\s[·｜/]\s|\s—\s", t) if s.strip()]


def main():
    S = jread(os.path.join(MSR, "market", "say.json"))
    B = jread(os.path.join(MSR, "market", "bear.json"), {}) or {}
    probs = []

    def add(k, where, text, want):
        probs.append({"k": k, "where": where, "text": text.strip()[:140], "want": want})

    if not S or not S.get("markets"):
        add("원본 없음", "market/say.json", "", "src/say.py 가 돌았는지 확인")
        S = {"markets": [], "facts": {}}
    elif B.get("at") and S.get("bear_at") and S["bear_at"] < B["at"]:
        add("원본이 늦음", "market/say.json", f"say {S.get('bear_at')} < bear {B.get('at')}", "bear_gate 뒤에 src.say 가 도는지 확인")
    F = S.get("facts") or {}
    us = next((m for m in S.get("markets") or [] if m.get("key") == "us"), {})
    T, ats = texts()
    for where, t in T:
        for s in sentences(t):
            # ② 선 숫자
            for m in re.finditer(r"(20|50|200)일선\s*\(?\s*([\d,]+(?:\.\d+)?)", s):
                val = float(m.group(2).replace(",", ""))
                if val < 100:   # 「200일선 3일」 같은 날짜 수
                    continue
                before = s[:m.start()]
                key = None
                pos = -1
                for k, pat in MK:
                    for mm in re.finditer(pat, before):
                        if mm.start() > pos:
                            pos, key = mm.start(), k
                cands = [key] if key else [k for k, _ in MK]
                best = None
                for k in cands:
                    ref = (F.get(k) or {}).get(LINE[m.group(1)])
                    if ref:
                        d = abs(val / ref - 1) * 100
                        if best is None or d < best[0]:
                            best = (d, k, ref)
                if best and TOL < best[0] < FAR:
                    add("선 숫자 다름", where, s, f"{best[1]} {m.group(1)}일선 {best[2]:,.0f} (원본)")
            # ③ 미국 주식 몫 옛말
            if us.get("stage") in ("down_half", "down_all"):
                if re.search(r"현금 26[^0-9%]{0,6}(유지|그대로)|50\.4\s?%?[^.]{0,12}(유지|그대로)", s) and not re.search(r"→|에서|줄였|바뀌", s):
                    add("미국 옛말", where, s, "미국(포트) " + str(us.get("share_txt")) + " · " + str(us.get("cond")))
                if re.search(r"(S&P\s?500|나스닥|미국)[^/]{0,14}주식 0%", s) and us.get("share") not in (0, None):
                    add("미국 옛말", where, s, "미국(포트) " + str(us.get("share_txt")))
            # ④ 거리 방향
            if re.search(r"(일선|평균선)\s*[−\-]\d+(?:\.\d+)?%", s):
                add("거리 방향", where, s, "「+n% 남음」 한 방향 (RULES.md 말 사전)")
            # ⑥ 색 딱지
            if re.search(r"🟢\s*정상[^.]{0,30}(현금|절반|0%)|(현금|절반|주식 0%)[^.]{0,30}🟢\s*정상", s):
                add("색 딱지", where, s, "낙폭은 숫자로만 · 주식 몫 옆에 🟢 정상 금지")
        # ⑤ 끊긴 문장
        tail = t.strip().split(" ｜ ")[-1].strip()
        if re.search(r"(말고|하고|이고|,|·|—|및|와|과|의|을|를|은|는|에|로|美|日|中)$|[美日中]\s?\d+일선$|[,]\s*\S{1,8}$", tail) and len(tail) > 12 and not re.search(r"[.!?요음임함다)」%]$", tail):
            add("끊긴 문장", where, tail, "마디 끝에서 자르기(pbbrief.py clip)")
    out = {"at": dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "ok": not probs, "n": len(probs), "problems": probs[:40], "checked": len(T), "src": ats,
           "say": {"at": S.get("at"), "word": S.get("word"), "markets": [{k: m.get(k) for k in ("key", "share_txt", "line", "dist")} for m in S.get("markets") or []]},
           "note": "원본 say.json 과 아침판·고객 질문 답·오늘 한 장 글을 맞춰 본 결과 · 찾기만 함"}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    old = jread(OUT, {}) or {}
    if {k: v for k, v in old.items() if k != "at"} != {k: v for k, v in out.items() if k != "at"}:   # 내용이 같으면 안 씀(커밋이 안 생기게)
        json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("🗣 말 맞춤:", "문제 없음" if not probs else f"{len(probs)}건", "· 글", len(T), "개")
    for p in probs[:12]:
        print("  ·", p["k"], "|", p["where"], "|", p["text"][:70], "→", p["want"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
