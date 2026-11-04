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


def seal(obj):
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives import hashes
    ak = AESGCM.generate_key(bit_length=256); iv = os.urandom(12)
    wk = _pub().encrypt(ak, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
    ct = AESGCM(ak).encrypt(iv, json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode(), None)
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
            D = days.setdefault(day, {"dev": {}, "tabs": {}, "opens": 0, "ver": {}})
            if b.get("k") == "tap":   # 🎯 11/04 누른 것·본 화면 (사용자 「어디를 제일 많이 봤니」)
                T = D.setdefault("taps", {}); V = D.setdefault("views", {}); W = D.setdefault("tapdev", {})
                for k_, c_ in list((b.get("taps") or {}).items())[:60]:
                    k_ = str(k_)[:28]; c_ = max(0, min(int(c_ or 0), 200))
                    T[k_] = T.get(k_, 0) + c_; W.setdefault(k_, {})[d] = 1
                for k_, c_ in list((b.get("views") or {}).items())[:30]:
                    k_ = str(k_)[:14]; c_ = max(0, min(int(c_ or 0), 200)); V[k_] = V.get(k_, 0) + c_
                if len(T) > 400:
                    for k_ in sorted(T, key=lambda x: T[x])[:len(T) - 400]: T.pop(k_, None); W.pop(k_, None)
                seen.add(mid); n += 1
                continue
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
    at = dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M")
    if n:
        parts.append(dict(seal(U), days=sorted(days), at=at))
    cut = (dt.datetime.now(KST) - dt.timedelta(days=35)).strftime("%Y-%m-%d")
    parts = [p for p in parts if not p.get("days") or max(p["days"]) >= cut]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"v": 3, "lock": "운영자 전용 — 휴대폰에서 운영자 비밀번호로만 열림", "at": at, "seen": sorted(seen)[-3000:], "parts": parts}, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print("새 신호", n, "· 몫", len(parts))


if __name__ == "__main__":
    main()
