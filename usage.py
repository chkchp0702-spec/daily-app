"""
📈 사용 현황 모으기 (10/28) — 앱이 열릴 때 보내는 익명 신호(ntfy 공개 주제 chkchp-ch-open)를 모아 archive/x/usage.json 에 날짜별로 쌓는다.
  신호 = {d: 기기 번호(난수), day: 날짜, tab: 처음 연 화면, v: 앱 버전, t: 시각}. 이름·관심종목 없음.
  ntfy 는 12시간만 보관 → feedback.yml(2시간마다)에서 같이 돈다. 90일 넘은 날짜는 지움.
  python usage.py
"""
import base64
import datetime as dt
import json
import os
import urllib.request

TOPIC = "chkchp-ch-open"
OUT = os.path.join("archive", "x", "usage.json")
KST = dt.timezone(dt.timedelta(hours=9))       # 🔒 11/04: 운영자 공개키로 잠근 사본(휴대폰에서 운영자 비밀번호로만 열림)
#   사용자 11/04 「물론 나만 볼 수 있는 거겠지?」 → 저장소(공개)에 평문을 남기지 않음.
#   🔒 11/04 v3: 서버 비밀값 없이 — 매번 「이번에 새로 모은 몫」만 운영자 공개키로 잠가 parts 에 덧붙임(서버는 못 열고, 휴대폰이 열어서 더함).
#   seen(ntfy 신호 번호)·날짜 목록만 평문. 35일 넘은 몫은 지움(화면은 14일만 씀).


def _pub():
    import re
    src = open("plus7.js", encoding="utf-8").read()
    m = re.search(r'var PUB = "([A-Za-z0-9+/=]+)"', src)
    from cryptography.hazmat.primitives import serialization
    return serialization.load_der_public_key(base64.b64decode(m.group(1)))


def clean(s):
    """🩹 11/18 짝 없는 서로게이트(이모지 반쪽) 지우기 — 휴대폰이 단추 글자를 UTF-16 길이로 자르다 이모지를 반으로 자르면
    json.loads 는 받아 주지만 UTF-8 로 못 바꿔 seal()·usage_pub 저장이 통째로 죽었음(11/17 16:12~11/18 10:12 8번 연속)."""
    return "".join(ch for ch in str(s) if not "\ud800" <= ch <= "\udfff")


def seal(obj):
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives import hashes
    ak = AESGCM.generate_key(bit_length=256); iv = os.urandom(12)
    wk = _pub().encrypt(ak, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
    ct = AESGCM(ak).encrypt(iv, json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8", "replace"), None)   # 🩹 그래도 남은 반쪽 글자는 ? 로
    return {"k": base64.b64encode(wk).decode(), "iv": base64.b64encode(iv).decode(), "ct": base64.b64encode(ct).decode()}


def main():
    try:
        J = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        J = {}
    parts = J.get("parts") or []
    if "days" in J:   # 처음 한 번: 예전 평문을 통째로 잠가 첫 몫으로
        parts.append(dict(seal({"days": J["days"]}), days=sorted(J["days"]), at=J.get("at")))
    seen = set(J.get("seen") or [])
    ERR = []
    U = {"days": {}}
    days = U["days"]
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
            if b.get("k") == "err":   # 🛡 11/18 실제 휴대폰 오류 (early.js chErr) → archive/x/errors.json (공개 · 기기 번호 없음 · 앱에서 이미 따옴표 속 글자·숫자 지움)
                ERR.append((day, b)); seen.add(mid); n += 1
                continue
            D = days.setdefault(day, {"dev": {}, "tabs": {}, "opens": 0, "ver": {}})
            if b.get("k") == "tap":   # 🎯 11/04 누른 것·본 화면 (사용자 「어디를 제일 많이 봤니」)
                T = D.setdefault("taps", {}); V = D.setdefault("views", {}); W = D.setdefault("tapdev", {})
                for k_, c_ in list((b.get("taps") or {}).items())[:60]:
                    k_ = clean(k_)[:28]; c_ = max(0, min(int(c_ or 0), 200))
                    T[k_] = T.get(k_, 0) + c_; W.setdefault(k_, {})[d] = 1
                for k_, c_ in list((b.get("views") or {}).items())[:30]:
                    k_ = clean(k_)[:14]; c_ = max(0, min(int(c_ or 0), 200)); V[k_] = V.get(k_, 0) + c_
                if len(T) > 400:
                    for k_ in sorted(T, key=lambda x: T[x])[:len(T) - 400]: T.pop(k_, None); W.pop(k_, None)
                seen.add(mid); n += 1
                continue
            D["dev"][d] = D["dev"].get(d, 0) + 1
            tab = clean(b.get("tab") or "home")[:12]
            D["tabs"][tab] = D["tabs"].get(tab, 0) + 1
            v = str(b.get("v") or "")[:12]
            if v:
                D["ver"][v] = D["ver"].get(v, 0) + 1
            D["opens"] += 1
            seen.add(mid); n += 1
        except Exception:
            continue
    at = dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M")
    if n:
        parts.append(dict(seal(U), days=sorted(days), at=at))
    cut = (dt.datetime.now(KST) - dt.timedelta(days=35)).strftime("%Y-%m-%d")
    parts = [p for p in parts if not p.get("days") or max(p["days"]) >= cut]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"v": 3, "lock": "운영자 전용 — 휴대폰에서 운영자 비밀번호로만 열림", "at": at, "seen": sorted(seen)[-3000:], "parts": parts}, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    # 📊 11/10 #11 화면별 횟수만 공개 집계 (사용자 「모든 걸 허락」) — 기기 번호·이름·관심종목 없음. 날짜별 「몇 명이 열었나(수만)·어느 화면을 몇 번 봤나·무엇을 몇 번 눌렀나」
    #    → 쓰지 않는 화면을 숫자로 가려 정리하기 위해. 잠근 원본(usage.json)은 그대로.
    PP = os.path.join(os.path.dirname(OUT), "usage_pub.json")
    try:
        PU = json.load(open(PP, encoding="utf-8"))
    except Exception:
        PU = {"days": {}}
    for day, D in days.items():
        Q = PU["days"].setdefault(day, {"opens": 0, "dev": 0, "tabs": {}, "views": {}, "taps": {}, "tapdev": {}})
        Q["opens"] += D.get("opens", 0)
        Q.setdefault("_dev", [])
        for d in D.get("dev", {}):          # 같은 날 여러 번 모아도 기기 수가 겹치지 않게 — 기기 번호 대신 짧은 해시만 하루 동안
            import hashlib
            h = hashlib.sha1((day + d).encode()).hexdigest()[:6]
            if h not in Q["_dev"]:
                Q["_dev"].append(h)
        Q["dev"] = len(Q["_dev"])
        for src, key in (("tabs", "tabs"), ("views", "views"), ("taps", "taps")):
            for k, c in (D.get(src) or {}).items():
                Q[key][k] = Q[key].get(k, 0) + c
        for k, devs in (D.get("tapdev") or {}).items():
            Q["tapdev"][k] = Q["tapdev"].get(k, 0) + len(devs)
    # 📈 11/18 재방문 (냉정 분석 6차 #4 · 사용자 「진행해」) — 「어제 온 사람이 오늘 또 왔나」를 세기 위해 주 단위로 바뀌는 익명 번호를 씀.
    #    번호 = sha1(그 주 월요일 + 기기 난수) 앞 8자 → 주가 바뀌면 번호도 바뀌어 주를 넘어 한 사람을 따라갈 수 없음. 이름·기기 정보 없음.
    #    weeks[월요일] = {dev: 그 주에 온 기기 수, d2: 2일 이상, d3: 3일 이상, _h: {번호: 온 날(월=0…일=6) 글자들}}
    import hashlib as _hl
    WK = PU.setdefault("weeks", {})
    for day, D in days.items():
        try:
            d0 = dt.date.fromisoformat(day)
        except Exception:
            continue
        mon = (d0 - dt.timedelta(days=d0.weekday())).isoformat()
        Wk = WK.setdefault(mon, {"dev": 0, "d2": 0, "d3": 0, "_h": {}})
        for d in D.get("dev", {}):
            h = _hl.sha1((mon + "|" + d).encode()).hexdigest()[:8]
            cur = Wk["_h"].get(h, "")
            w = str(d0.weekday())
            if w not in cur:
                Wk["_h"][h] = "".join(sorted(cur + w))
    for mon, Wk in WK.items():
        v = list((Wk.get("_h") or {}).values())
        Wk["dev"] = len(v); Wk["d2"] = sum(1 for x in v if len(x) >= 2); Wk["d3"] = sum(1 for x in v if len(x) >= 3)
    cutw = (dt.datetime.now(KST) - dt.timedelta(days=70)).strftime("%Y-%m-%d")
    PU["weeks"] = {k: v for k, v in WK.items() if k >= cutw}
    cut2 = (dt.datetime.now(KST) - dt.timedelta(days=35)).strftime("%Y-%m-%d")
    PU["days"] = {k: v for k, v in PU["days"].items() if k >= cut2}
    PU["at"] = at
    PU["note"] = "화면별·누른 것별 횟수만 (기기 번호·이름 없음) · tabs = 처음 연 화면 · views = 본 화면 · taps = 누른 것 · tapdev = 그걸 누른 사람 수(대략) · 11/10부터 · weeks = 주별 재방문(dev 온 기기 · d2 2일 이상 · d3 3일 이상 · 번호는 주마다 바뀜) · 11/18부터"
    json.dump(PU, open(PP, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    errors(ERR, at)
    print("새 신호", n, "· 몫", len(parts), "· 오류 묶음", len(ERR))


def errors(ERR, at):
    """🛡 11/18 휴대폰 오류 모음 — days[날짜][종류|글|파일] = {n 횟수, dev 기기 수(대략), v 버전들, t 화면들, last}. 14일 보관.
       🩺 health.py 가 오늘·어제 것을 「실사용 오류」로 셈 → 자가 업그레이드가 고침."""
    import hashlib
    EP = os.path.join("archive", "x", "errors.json")
    try:
        E = json.load(open(EP, encoding="utf-8"))
    except Exception:
        E = {"days": {}}
    for day, b in ERR:
        Dd = E["days"].setdefault(day, {})
        h = hashlib.sha1((day + str(b.get("d") or "")).encode()).hexdigest()[:6]
        for e in (b.get("e") or [])[:12]:
            if not isinstance(e, dict):
                continue
            k = clean(str(e.get("k") or "js"))[:8] + "|" + clean(str(e.get("m") or ""))[:150] + "|" + clean(str(e.get("s") or ""))[:60]
            R = Dd.setdefault(k, {"n": 0, "dev": [], "v": {}, "t": {}, "last": ""})
            R["n"] += max(1, min(int(e.get("n") or 1), 500))
            if h not in R["dev"]:
                R["dev"].append(h)
            v = clean(str(b.get("v") or ""))[:12]
            if v:
                R["v"][v] = R["v"].get(v, 0) + 1
            t = clean(str(e.get("t") or ""))[:12]
            if t:
                R["t"][t] = R["t"].get(t, 0) + 1
            R["last"] = at
        if len(Dd) > 200:
            for k in sorted(Dd, key=lambda x: Dd[x]["n"])[:len(Dd) - 200]:
                Dd.pop(k, None)
    cut = (dt.datetime.now(KST) - dt.timedelta(days=14)).strftime("%Y-%m-%d")
    E["days"] = {k: v for k, v in E["days"].items() if k >= cut}
    E["at"] = at
    E["note"] = "휴대폰에서 난 자바스크립트 오류(early.js) · 키 = 종류|글|파일 · 종류 js 오류 · promise 처리 안 된 실패 · net 인터넷 · load 묶음 파일 시작 오류(스스로 이어 실행함) · render 화면 그리기 · stuck 30초 넘게 불러오는 중 · boot 목록 못 받음 · dev = 기기 수(날마다 바뀌는 짧은 해시) · 11/18부터"
    os.makedirs(os.path.dirname(EP), exist_ok=True)
    json.dump(E, open(EP, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    main()
