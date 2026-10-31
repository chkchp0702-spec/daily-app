"""
👔 PB 한 장 — 장중 매시간 갱신 (10/28 사용자 「1·2번 내용은 장중 한 시간마다 갱신 · 알람은 그대로 두 번」)
  아침(장 전)엔 시황리포트의 고객용 5줄(kakao.lines), 장중(09~15:30)엔 실시간 자료로 다시 씀 → archive/x/pbbrief.json
  앱: 🏠 「👔 PB 한 장」 카드 + 📨 고객에게 보내기 「지금 시장 한 장」 이 이걸 읽음. 알림(푸시)은 아침 한 번만(plus.py).
  python pbbrief.py
"""
import datetime as dt
import glob
import json
import os
import re

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
TODAY = NOW.strftime("%Y-%m-%d")
X = os.path.join("archive", "x")
OUT = os.path.join(X, "pbbrief.json")


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def strip(t):
    return re.sub(r"<[^>]+>", "", str(t or "")).replace("&nbsp;", " ").replace("\n", " ").strip()


def sg(v, d=1):
    if v is None:
        return "–"
    return f"{v:+.{d}f}%".replace("+-", "−").replace("-", "−")


def market_data():
    md = sorted(glob.glob(os.path.join("archive", "market", "20*", "data.json")))
    return (jl(md[-1], {}) if md else {}) or {}


def regime_line():
    cs = sorted(glob.glob(os.path.join("archive", "sector", "20*", "compass.json")))
    if not cs:
        return ""
    C = jl(cs[-1], {}) or {}
    ms = C.get("markets") or {}
    return " · ".join(f"{m['flag']}{m['regime'][:2]}" for k, m in ms.items())


WDK = ["월", "화", "수", "목", "금", "토", "일"]


def md_past(txt):
    """「10/30 (금)」·「11/2~11/3」 같은 앞머리 날짜가 오늘보다 지났으면 True (10/31 A3: 주말에 금요일 일정이 남던 것)"""
    m = re.search(r"(\d{1,2})/(\d{1,2})(?:\s*~\s*(\d{1,2})/(\d{1,2}))?", txt or "")
    if not m:
        return False
    mo, da = (int(m.group(3)), int(m.group(4))) if m.group(3) else (int(m.group(1)), int(m.group(2)))
    y = NOW.year + (1 if NOW.month == 12 and mo == 1 else 0)
    try:
        return dt.date(y, mo, da) < NOW.date()
    except ValueError:
        return False


def ko_name(sym, raw, ko=""):
    """🔤 10/31 A6: 「CHUGIN FINANCI, Arthur J. Gall」처럼 잘린 영어 이름 대신 한글 이름 + 티커 (미국 종목은 늘 티커 같이)"""
    sn = jl(os.path.join(X, "sig_names.json"), {}) or {}
    tk = str(sym or "").replace(".T", "").replace(".HK", "")
    ko = ko or sn.get(sym)
    if ko:
        return f"{ko}({tk})"
    return tk or re.split(r",| Inc\b| Corp\b", str(raw or ""))[0].strip()[:12]


def events(d, weekend=False):
    ev = []
    if not weekend:
        for sc in (d.get("schedule") or [])[:1]:
            w = strip(sc.get("what"))[:70]
            if w and not md_past(strip(sc.get("when"))):
                ev.append(w)
    ec = jl(os.path.join(X, "earn_cal.json"), {}) or {}
    upto = NOW.date() + dt.timedelta(days=4 if weekend else 1)
    soon = [x for x in ec.get("items") or [] if x.get("kind") == "실적" and NOW.date().isoformat() <= x.get("d", "") <= upto.isoformat()]
    # 한글 이름이 있는(앱이 아는) 종목 먼저
    sn = jl(os.path.join(X, "sig_names.json"), {}) or {}
    soon.sort(key=lambda x: (x.get("d", ""), not (x.get("ko") or x.get("s") in sn)))
    if soon:
        nm = [ko_name(x.get("s"), x.get("n"), x.get("ko") or "") for x in soon[:3]]
        lab = "실적" if not weekend else "다음 주 실적"
        ev.append(lab + " " + " · ".join(n for n in nm if n))
    return ev


def closed_view(d):
    """🗓 10/31 A3: 주말·휴장엔 「10/30 아침」 대신 5개 시장 마지막 마감으로 다시 씀"""
    U = jl(os.path.join(X, "live_us.json"), {}) or {}
    L = jl(os.path.join(X, "live_kr.json"), {}) or {}
    rows, talk, moves = [], [], []
    def ix(J, n):
        return next((x for x in (J.get("index") or []) if x.get("name") == n), {}) or {}
    def us_day(J):   # live_us 날짜는 한국 시각 → 미국 날짜는 하루 전(새벽 마감)
        try:
            t = dt.date.fromisoformat(J.get("date"))
            if (J.get("t") or "12:00") < "12:00":
                t -= dt.timedelta(days=1)
            return t
        except Exception:
            return None
    ud = us_day(U)
    sp, nq = ix(U, "S&P500"), ix(U, "나스닥")
    if sp.get("chg") is not None:
        tot = U.get("total") or 0
        talk.append(f"미국({WDK[ud.weekday()] if ud else ''}) 마감: S&P500 {sp.get('last', 0):,.0f}({sg(sp.get('chg'))}) · 나스닥 {sg(nq.get('chg'))}"
                    + (f" · S&P 종목 {U.get('up')}/{tot} 상승" if tot else ""))
        moves.append(("미국", sp.get("chg")))
    ks, kq = ix(L, "코스피"), ix(L, "코스닥")
    if ks.get("chg") is not None:
        try:
            kd = dt.date.fromisoformat(L.get("date"))
        except Exception:
            kd = None
        tot = L.get("total") or 0
        talk.append(f"한국({WDK[kd.weekday()] if kd else ''}) 마감: 코스피 {ks.get('last', 0):,.0f}({sg(ks.get('chg'))}) · 코스닥 {sg(kq.get('chg'))}"
                    + (f" · 오른 종목 {round((L.get('up') or 0) / tot * 100)}%" if tot else ""))
        moves.append(("한국", ks.get("chg")))
    asia = []
    for f, n, lab in (("live_jp.json", "닛케이 225", "일본"), ("live_cn.json", "상해종합", "중국"), ("live_hk.json", "항셍", "홍콩")):
        J = jl(os.path.join(X, f), {}) or {}
        v = ix(J, n).get("chg")
        if v is not None:
            asia.append(f"{lab} {sg(v)}")
            moves.append((lab, v))
    if asia:
        talk.append("아시아 마감: " + " · ".join(asia))
    dn = [m for m in moves if m[1] is not None and m[1] < 0]
    up = [m for m in moves if m[1] is not None and m[1] > 0]
    if moves and len(dn) >= 4:
        one = f"마지막 장 5개 시장 중 {len(dn)}곳 하락" + (f" — {'·'.join(m[0] for m in up)}만 올랐어요." if up else " — 모두 내렸어요.")
    elif moves and len(up) >= 4:
        one = f"마지막 장 5개 시장 중 {len(up)}곳 상승" + (f" — {'·'.join(m[0] for m in dn)}만 내렸어요." if dn else " — 모두 올랐어요.")
    elif moves:
        one = "마지막 장은 시장마다 엇갈렸어요 — " + " · ".join(f"{m[0]} {sg(m[1])}" for m in moves[:5])
    else:
        one = strip(d.get("one_liner"))[:90]
    base = ud or NOW.date()
    lab = f"주말판 · {base.month}/{base.day}({WDK[base.weekday()]}) 마감 기준" if NOW.weekday() >= 5 else f"휴장 · {base.month}/{base.day} 마감 기준"
    return {"label": lab, "one": one, "talk": talk[:4]}


def intraday(d):
    """장중판: 실시간 한국(live_kr) + 미국 선물(live_us_pre) + 두뇌 한 줄"""
    L = jl(os.path.join(X, "live_kr.json"), {}) or {}
    U = jl(os.path.join(X, "live_us_pre.json"), {}) or {}
    if L.get("date") != TODAY or not L.get("index"):
        return None
    ix = {x["name"]: x for x in L["index"]}
    ks, kq = ix.get("코스피") or {}, ix.get("코스닥") or {}
    up, tot = L.get("up") or 0, L.get("total") or 0
    t = L.get("t") or NOW.strftime("%H:%M")
    talk = []
    talk.append(f"한국 {t}: 코스피 {ks.get('last', 0):,.0f}({sg(ks.get('chg'))}) · 코스닥 {sg(kq.get('chg'))} · 오른 종목 {round(up / tot * 100) if tot else 0}%"
                + (f" · 상한가 {L['limit_up']}" if L.get("limit_up") else ""))
    sec = [s for s in (L.get("sectors") or []) if s.get("n", 0) >= 5]
    if sec:
        hi = sorted(sec, key=lambda s: -s["r"])[:2]; lo = sorted(sec, key=lambda s: s["r"])[:2]
        talk.append("돈이 가는 곳: " + ", ".join(f"{s['name']} {sg(s['r'])}" for s in hi) + " / 약한 곳: " + ", ".join(f"{s['name']} {sg(s['r'])}" for s in lo))
    fut = {f["s"]: f for f in (U.get("fut") or [])} if U.get("date") == TODAY else {}
    us = []
    if fut.get("ES=F"):
        us.append(f"S&P500 선물 {sg(fut['ES=F'].get('chg'))}")
    if fut.get("NQ=F"):
        us.append(f"나스닥 선물 {sg(fut['NQ=F'].get('chg'))}")
    kk = [strip(x) for x in ((d.get("kakao") or {}).get("lines") or [])]
    usline = next((x for x in kk if x.startswith("미국")), "")
    if us or usline:
        talk.append(("미국: " + " · ".join(us) + (" · " if us and usline else "") + (usline.replace("미국(", "어제(") if usline else ""))[:140])
    lead = next((x for x in kk if x.startswith("주도")), "")
    if lead:
        talk.append(lead[:120])
    return {"t": t, "talk": talk[:4]}


JARGON = [("FOMC", "FOMC(미국 금리 결정)"), ("PCE", "PCE(물가)"), ("GDP", "GDP(성장률)"), ("보안 CIBR", "사이버보안"), ("유틸리티 XLU", "전력·유틸리티"), ("CIBR", "사이버보안"), ("XLU", "전력·유틸리티"), ("XLE", "에너지")]


def plain(t):
    for a, b in JARGON:
        if b not in t:
            t = t.replace(a, b)
    return t


def ga(word):   # 받침 따라 이/가
    if not word:
        return word
    ch = word[-1]
    return word + ("이" if "가" <= ch <= "힣" and (ord(ch) - 0xAC00) % 28 else "가")


def num(v, d=0):
    return f"{v:+.{d}f}".replace("-", "−")


def kospi_month():
    """최근 약 한 달(21거래일) 코스피 등락 %"""
    try:
        ix = jl(os.path.join(X, "port_px", "index.json"), {}) or {}
        a = (ix.get("assets") or {}).get("KOSPI")
        j = jl(os.path.join(X, "port_px", a["f"]), {}) if a else None
        c = [float(v) for v in (j or {}).get("c") or []]
        if len(c) > 22:
            return (c[-1] / c[-22] - 1) * 100
    except Exception:
        pass
    return None


def advice(d):
    """📌 PB 코멘트 — 「그래서 앞으로」 (10/28 사용자: 「현재 시장은 잘 보여줬는데 그러니 앞으로 이걸 보자 — PB가 고객에게 조언하듯」)
       숫자에서 문장을 고르는 규칙 기반 — 지어내지 않고 앱 자료(실시간·시황리포트·국면)만 씀.
       돌려줌: {"read": 지금 해석, "watch": [[언제, 무엇]], "plan": 대응 한두 줄}"""
    L = jl(os.path.join(X, "live_kr.json"), {}) or {}
    live = L.get("date") == TODAY and L.get("index")
    ix = {x["name"]: x for x in (L.get("index") or [])} if live else {}
    k = (ix.get("코스피") or {}).get("chg")
    m1 = kospi_month()
    up = round((L.get("up") or 0) / (L.get("total") or 1) * 100) if live else None
    sec = sorted([x for x in (L.get("sectors") or []) if x.get("n", 0) >= 5], key=lambda x: -x["r"]) if live else []
    lead = "·".join(re.sub(r"\(.*?\)", "", x["name"]).split("·")[0] for x in sec[:2])
    # ① 지금 해석
    read = ""
    if k is not None:
        big = abs(k) >= 2
        if k >= 2 and m1 is not None and m1 <= -8:
            read = f"한 달 새 {abs(m1):.0f}% 빠졌던 코스피가 오늘 {num(k, 1)}% 크게 되돌렸어요" + (f" — {ga(lead)} 앞장선 반등이에요" if lead else "") + ". 다만 하루 반등만으로 하락 추세가 끝났다고 보긴 일러요."
        elif k >= 2:
            read = f"코스피가 {num(k, 1)}% 강하게 오르는 날이에요" + (f" — {lead} 중심" if lead else "") + (f", 종목 {up}%가 올라 고르게 오르고 있어요." if up and up >= 60 else ", 다만 오르는 종목은 일부에 몰려 있어요.")
        elif k <= -2 and m1 is not None and m1 <= -8:
            read = f"한 달 새 {abs(m1):.0f}% 빠진 데 이어 오늘도 {num(k, 1)}% 밀리고 있어요. 공포가 커지는 구간이라 서둘러 팔기보다 비중과 현금을 점검할 때예요."
        elif k <= -2:
            read = f"코스피가 {num(k, 1)}% 크게 밀리는 날이에요. 하루 급락은 흔히 되돌림이 나와요 — 급하게 따라 팔 필요는 없어요."
        elif abs(k) < 0.7:
            read = f"코스피는 {num(k, 1)}%로 큰 방향 없이 쉬어 가는 날이에요" + (f" — 그 안에서 {ga(lead)} 강해요." if lead else ".")
        else:
            read = f"코스피 {k:+.1f}%" + (f", {lead}가 이끌고 있어요." if lead else ".") + (f" 최근 한 달은 {m1:+.0f}%예요." if m1 is not None else "")
    else:
        read = strip(d.get("one_liner"))[:120]
    # ② 앞으로 볼 것 — 시황리포트 일정(오늘·다음)
    watch = []
    td = f"{NOW.month}/{NOW.day}"
    for sc in (d.get("schedule") or [])[:4]:
        what, when = strip(sc.get("what")), strip(sc.get("when"))
        if not what:
            continue
        w0 = when.split(" ")[0]
        if w0 == td:
            when = "오늘"
            # 이미 지난 오늘 일정(「09시 …」·「09:00」)은 빼기 (10/28 하이닉스 한 장에 지난 실적 일정이 남던 것)
            hm = re.search(r"(\d{1,2})(?:시|:\d{2})", sc.get("when", "") + " " + what)
            if hm and int(hm.group(1)) < NOW.hour:
                continue
        watch.append([when[:12], plain(what)[:60]])
    # ③ 대응 — 국면(S&P 200일선)과 리포트 결정 · 주도 섹터
    al = d.get("allocation_seen") or []
    seen = strip(al[0].get("seen")) if al else ""
    badge = strip(((d.get("decision") or {}).get("badges") or [""])[0])
    green = "🟢" in badge or "+" in seen.split("200일선")[-1][:8] if seen else "🟢" in badge
    plan = []
    if green:
        plan.append("큰 그림은 아직 상승 추세예요(미국 S&P500이 200일 평균 위). 자산배분은 주식 비중을 그대로 두는 게 원칙이에요.")
    else:
        plan.append("큰 그림이 약해졌어요(미국 S&P500이 200일 평균 아래). 주식 비중을 줄이고 금·현금을 늘리는 쪽이 원칙이에요.")
    if k is not None and k >= 2:
        plan.append("오늘처럼 크게 오른 날엔 한 번에 사기보다 2~3번에 나눠 담는 게 좋아요.")
    elif k is not None and k <= -2:
        plan.append("크게 빠진 날 한꺼번에 파는 건 피하고, 미리 정한 비중을 넘는 부분만 정리해요.")
    ls_ = strip((d.get("leaders") or {}).get("short"))
    if ls_:
        plan.append("요즘 돈이 몰리는 곳은 " + plain(ls_.split(" — ")[0])[:60] + " — 쫓아 사기보다 쉬어 갈 때 나눠 담는 쪽이에요.")
    return {"read": plain(read), "watch": watch[:3], "plan": plan[:3]}


def main():
    d = market_data()
    reg = regime_line()
    one = strip(d.get("one_liner"))[:90]
    kk = [strip(x) for x in ((d.get("kakao") or {}).get("lines") or [])] or [strip(x) for x in ((d.get("summary") or {}).get("three_lines") or [])]
    hh, mi = NOW.hour, NOW.minute
    live = intraday(d) if NOW.weekday() < 5 and (9 <= hh < 15 or (hh == 15 and mi <= 40)) else None
    if live:
        # 🩺 10/29 장중엔 아침 한 줄의 코스피 숫자는 어제 것 — 「어제」를 붙여 오늘 숫자로 안 보이게
        one = " ".join(("어제 " + x if re.match(r"코스피|코스닥", x) else x) for x in re.split(r"(?<=[.!?])\s+", one) if x)
        out = {"mode": "장중", "asof": f"{TODAY} {live['t']}", "label": f"{live['t']} 장중", "regime": reg, "one": one, "talk": live["talk"], "events": events(d)}
    elif NOW.weekday() >= 5 or (d.get("date") and d.get("date") < TODAY and not (NOW.weekday() < 5 and hh < 9)):
        cv = closed_view(d)
        out = {"mode": "주말" if NOW.weekday() >= 5 else "휴장", "asof": f"{TODAY} {NOW.strftime('%H:%M')}", "label": cv["label"], "regime": reg, "one": cv["one"], "talk": cv["talk"], "events": events(d, weekend=True)}
    else:
        close = NOW.weekday() < 5 and hh >= 15
        L = jl(os.path.join(X, "live_kr.json"), {}) or {}
        lab = "마감" if close and L.get("date") == TODAY else "아침"
        talk = list(kk[:3])
        if lab == "마감" and L.get("index"):
            ix = {x["name"]: x for x in L["index"]}
            ks = ix.get("코스피") or {}
            talk = [f"한국 마감: 코스피 {ks.get('last', 0):,.0f}({sg(ks.get('chg'))}) · 코스닥 {sg((ix.get('코스닥') or {}).get('chg'))} · 오른 종목 {round((L.get('up') or 0) / (L.get('total') or 1) * 100)}%"] + [x for x in kk if not x.startswith("한국")][:2]
        if lab == "마감" and L.get("index"):
            # 🩺 10/29 아침 한 줄(어제 「코스피 6,012(+6.6%)」)이 오늘 마감 −1.2% 옆에 그대로 나와 오늘 숫자처럼 보이던 것 → 코스피·코스닥 문장은 오늘 마감으로 바꿈
            keep = [x for x in re.split(r"(?<=[.!?])\s+", one) if x and not re.search(r"코스피|코스닥", x)]
            one = (f"코스피 {ks.get('last', 0):,.0f}({sg(ks.get('chg'))}) 마감. " + " ".join(keep)).strip()[:110]
        out = {"mode": lab, "asof": f"{TODAY} {NOW.strftime('%H:%M')}", "label": f"{d.get('date', TODAY)[5:].replace('-', '/')} {lab}", "regime": reg, "one": one, "talk": talk, "events": events(d)}
    try:
        out["advice"] = advice(d)
        out["advice"]["watch"] = [w for w in out["advice"].get("watch") or [] if not md_past(w[0])]
        if out["mode"] in ("주말", "휴장"):
            out["advice"]["read"] = out["one"]
    except Exception as e:
        print("코멘트 실패", e)
    out["at"] = NOW.strftime("%Y-%m-%d %H:%M")
    out["note"] = "참고용 · 사라·팔라는 뜻이 아니에요"
    os.makedirs(X, exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(out["label"], "·", len(out["talk"]), "줄")
    for x in out["talk"]:
        print(" ·", x)


if __name__ == "__main__":
    main()
