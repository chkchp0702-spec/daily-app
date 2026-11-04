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
OUT = os.path.join("archive", "x", "usage.json")       # 🔒 11/04: 운영자 공개키로 잠근 사본(휴대폰에서 운영자 비밀번호로만 열림)
STATE = os.path.join("archive", "x", "usage.state")    # 🔒 서버가 다음 번에 이어 쓰는 원본 — 비밀값(USAGE_KEY 또는 TG_TOKEN)에서 만든 열쇠로 잠금
#   사용자 11/04 「물론 나만 볼 수 있는 거겠지?」 → 저장소(공개)에 평문을 남기지 않음.


def _key():
    import hashlib
    sec = os.environ.get("USAGE_KEY") or os.environ.get("TG_TOKEN") or ""
    return hashlib.sha256(("ch-usage-v1|" + sec).encode()).digest() if sec else None


def _pub():
    import re
    src = open("plus7.js", encoding="utf-8").read()
    m = re.search(r'var PUB = "([A-Za-z0-9+/=]+)"', src)
    from cryptography.hazmat.primitives import serialization
    return serialization.load_der_public_key(base64.b64decode(m.group(1)))


def load_state():
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    k = _key()
    if os.path.exists(STATE) and k:
        j = json.load(open(STATE, encoding="utf-8"))
        return json.loads(AESGCM(k).decrypt(base64.b64decode(j["iv"]), base64.b64decode(j["ct"]), None))
    try:   # 처음 한 번: 예전 평문 usage.json 을 옮겨 옴
        U = json.load(open(OUT, encoding="utf-8"))
        if "days" in U:
            return U
    except Exception:
        pass
    return {"days": {}}


def save_state(U):
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives import hashes
    raw = json.dumps(U, ensure_ascii=False, separators=(",", ":")).encode()
    k = _key()
    if not k:
        print("⚠️ USAGE_KEY/TG_TOKEN 비밀값이 없어 저장 안 함(평문을 공개 저장소에 남기지 않음)"); return False
    iv = os.urandom(12)
    json.dump({"v": 1, "iv": base64.b64encode(iv).decode(), "ct": base64.b64encode(AESGCM(k).encrypt(iv, raw, None)).decode()}, open(STATE, "w"))
    # 휴대폰용: seen(신호 번호)은 빼고 — AES 열쇠를 운영자 RSA 공개키로 잠금 (plus7.js 의견함과 같은 방식)
    V = {k_: v_ for k_, v_ in U.items() if k_ != "seen"}
    ak = AESGCM.generate_key(bit_length=256); iv2 = os.urandom(12)
    wk = _pub().encrypt(ak, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
    ct = AESGCM(ak).encrypt(iv2, json.dumps(V, ensure_ascii=False, separators=(",", ":")).encode(), None)
    json.dump({"v": 2, "lock": "운영자 전용", "at": U.get("at"), "k": base64.b64encode(wk).decode(), "iv": base64.b64encode(iv2).decode(), "ct": base64.b64encode(ct).decode()}, open(OUT, "w"))
    return True
KST = dt.timezone(dt.timedelta(hours=9))


def main():
    try:
        U = load_state()
    except Exception as e:   # 열쇠가 바뀌었거나 파일이 깨짐 → 덮어쓰지 않고 멈춤(기록 보존) · 다른 단계(vote·push)는 계속
        print("⚠️ 사용 현황 원본을 못 열어 이번엔 건너뜀:", e); return
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
    cut = (dt.datetime.now(KST) - dt.timedelta(days=90)).strftime("%Y-%m-%d")
    for k in [k for k in days if k < cut]:
        del days[k]
    U["seen"] = sorted(seen)[-3000:]
    U["at"] = dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    save_state(U)
    print("새 신호", n, "· 날짜", len(days))


if __name__ == "__main__":
    main()
