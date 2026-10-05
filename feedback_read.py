"""
💬 의견함 읽기 (운영자·Claude 용) — 암호화된 의견을 풀어서 보여준다.
  FB_PASS='비밀번호' python3 feedback_read.py            → 목록 출력
  FB_PASS='...' python3 feedback_read.py --out /tmp/ideas → 첨부까지 풀어서 폴더에 저장
  상태 바꾸기: FB_PASS=... python3 feedback_read.py --status <id> 반영함 "무엇을 고쳤나"   (메모는 암호화)
"""
import base64
import json
import os
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = os.path.dirname(os.path.abspath(__file__))
IDEAS = os.path.join(ROOT, "archive", "x", "ideas.json")
KEY = os.path.join(ROOT, "archive", "x", "fb_key.json")
ub = base64.b64decode


def private_key(pw):
    kf = json.load(open(KEY))
    dk = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=ub(kf["salt"]), iterations=kf["iter"]).derive(pw.encode())
    return serialization.load_der_private_key(AESGCM(dk).decrypt(ub(kf["iv"]), ub(kf["ct"]), None), None)


def main():
    a = sys.argv[1:]
    db = json.load(open(IDEAS, encoding="utf-8"))
    if a[:1] == ["--status"]:
        iid, st = a[1], a[2]
        note = a[3] if len(a) > 3 else ""
        for x in db["items"]:
            if x["id"] == iid:
                x["status"] = st
                x.pop("note", None)
                if note:      # 메모도 그 의견의 열쇠로 암호화 (운영자만 보임)
                    pk = private_key(os.environ["FB_PASS"])
                    raw = pk.decrypt(ub(x["k"]), padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
                    niv = os.urandom(12)
                    x["niv"] = base64.b64encode(niv).decode()
                    x["nct"] = base64.b64encode(AESGCM(raw).encrypt(niv, note.encode(), None)).decode()
        json.dump(db, open(IDEAS, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
        print("상태 바꿈", iid, st)
        return
    pk = private_key(os.environ["FB_PASS"])
    out = a[a.index("--out") + 1] if "--out" in a else None
    for x in db["items"]:
        try:
            raw = pk.decrypt(ub(x["k"]), padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
            K = AESGCM(raw)
            body = json.loads(K.decrypt(ub(x["iv"]), ub(x["ct"]), None))
        except Exception as e:
            print(f"[{x['id']}] 열기 실패 {e}")
            continue
        print(f"\n[{x['id']}] {body.get('t') or x['t']} · {body.get('name') or '이름 없음'} · 상태 {x.get('status')}")
        print(body.get("text", ""))
        for f in x.get("files", []):
            try:
                meta = json.loads(K.decrypt(ub(f["miv"]), ub(f["meta"]), None))
                data = K.decrypt(ub(f["iv"]), open(os.path.join(ROOT, f["path"]), "rb").read(), None)
                print(f"  📎 {meta.get('name')} ({meta.get('type')}, {len(data)//1024}KB)")
                if out:
                    d = os.path.join(out, x["id"])
                    os.makedirs(d, exist_ok=True)
                    open(os.path.join(d, os.path.basename(meta.get("name") or "file")), "wb").write(data)
            except Exception as e:
                print("  📎 첨부 열기 실패", e)


if __name__ == "__main__":
    main()
