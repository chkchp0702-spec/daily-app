"""
💬 의견함 — 앱에서 보낸 건의(휴대폰에서 암호화된 상태)(ntfy 비밀 주제)를 모아 archive/x/ideas.json 과 archive/fb/<id>/ 첨부로 저장.
  ntfy.sh 는 글을 12시간, 첨부를 3시간 보관하므로 매시간 가져온다 (feedback.yml + keeper).
  새 의견이 오면 텔레그램으로 알린다.
  python feedback.py
"""
import datetime as dt
import json
import os
import re
import urllib.parse
import urllib.request

KST = dt.timezone(dt.timedelta(hours=9))
TOPIC = "chkchp-ch-idea-x7m2q"
OUT = os.path.join("archive", "x", "ideas.json")
FB = os.path.join("archive", "fb")
UA = {"User-Agent": "ch-investing-feedback"}


def get(url, timeout=60, raw=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        b = r.read()
    return b if raw else b.decode("utf-8", errors="ignore")


def safe(name):
    name = os.path.basename(name or "file")
    name = re.sub(r"[^\w.\-가-힣 ()]", "_", name).strip() or "file"
    return name[:80]


def tg(text):
    tok, chat = os.environ.get("TG_TOKEN"), os.environ.get("TG_CHAT")
    if not tok or not chat:
        return
    try:
        data = urllib.parse.urlencode({"chat_id": chat, "text": text, "disable_web_page_preview": "true"}).encode()
        urllib.request.urlopen(urllib.request.Request(f"https://api.telegram.org/bot{tok}/sendMessage", data=data), timeout=20).read()
    except Exception as e:
        print("텔레그램 실패", e)


def main():
    try:
        db = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        db = {"items": [], "seen": []}
    seen = set(db.get("seen", []))
    by_id = {x["id"]: x for x in db["items"]}
    lines = get(f"https://ntfy.sh/{TOPIC}/json?poll=1&since=all").splitlines()
    new = []
    for ln in lines:
        try:
            m = json.loads(ln)
        except Exception:
            continue
        if m.get("event") != "message" or m.get("id") in seen:
            continue
        try:
            body = json.loads(m.get("message") or "{}")
        except Exception:
            body = {}
        iid = re.sub(r"[^\w]", "", str(body.get("id", "")))[:24]
        if not iid:
            seen.add(m["id"])
            continue
        it = by_id.get(iid)
        if it is None:
            it = {"id": iid, "t": dt.datetime.fromtimestamp(m.get("time", 0), KST).strftime("%Y-%m-%d %H:%M"), "files": [], "status": "접수"}
            by_id[iid] = it
            db["items"].append(it)
        # 내용은 휴대폰에서 암호화돼 온다 — 서버는 암호문 그대로 저장만 한다
        if body.get("kind") == "idea":
            for k in ("k", "iv", "ct"):
                it[k] = str(body.get(k, ""))[:20000]
            it["nfile"] = int(body.get("n", 0) or 0)
            new.append(it)
        elif body.get("kind") == "idea-file":
            att = m.get("attachment") or {}
            url = att.get("url")
            if url:
                try:
                    data = get(url, 120, raw=True)
                    d = os.path.join(FB, iid)
                    os.makedirs(d, exist_ok=True)
                    p = os.path.join(d, f"{int(body.get('i', len(it['files']) + 1))}.bin")
                    open(p, "wb").write(data)
                    it["files"] = [f for f in it["files"] if f["path"] != p.replace(os.sep, "/")] + [
                        {"path": p.replace(os.sep, "/"), "iv": body.get("iv"), "miv": body.get("miv"), "meta": body.get("meta"), "size": len(data)}]
                except Exception as e:
                    print("첨부 받기 실패", iid, e)
                    it["lost"] = it.get("lost", 0) + 1
        seen.add(m["id"])
    db["items"].sort(key=lambda x: x["t"], reverse=True)
    db["seen"] = sorted(seen)[-500:]
    db["updated"] = dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(db, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    for it in new:
        tg("💬 CH Investing 의견함에 새 의견이 들어왔어요" + (f" (첨부 {it.get('nfile')}개)" if it.get("nfile") else "") + "\n🔒 내용은 앱 의견함 → 운영자에서 볼 수 있어요")
    print(f"의견 {len(new)}건 새로 · 전체 {len(db['items'])}건")


if __name__ == "__main__":
    main()
