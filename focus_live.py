"""🎯 오늘의 집중 — 장중 추적 (10분마다, live.yml)
  아침에 고른 집중 테마의 ETF·종목 지금 값 → archive/x/focus_live.json
  · 컵 기준가·갭 시가를 위로 뚫으면 「✅ 기준가 돌파」, 20일선 아래로 내려가면 「⚠️ 20일선 이탈」
  · 알림: ntfy chkchp-ch-focus (앱 알림 탭에서 구독) + 텔레그램(있으면). 같은 종목·같은 일은 하루 한 번.
  한국: 네이버 모바일 API · 미국: 텐센트 시세 (둘 다 장중 실시간에 가까움)
"""
import datetime as dt
import json
import os
import re
import urllib.parse
import urllib.request

KST = dt.timezone(dt.timedelta(hours=9))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "archive", "x", "focus_live.json")
FOCUS = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/focus.json"
APP = "https://chkchp0702-spec.github.io/daily-app/"
UA = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}


def get(url, enc="utf-8"):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
        return r.read().decode(enc, "ignore")


def num(v):
    try:
        return float(str(v).replace(",", "").replace("+", "").replace("%", ""))
    except Exception:
        return None


def kr_px(code):
    j = json.loads(get(f"https://m.stock.naver.com/api/stock/{code.split('.')[0]}/basic"))
    return num(j.get("closePriceRaw") or j.get("closePrice")), num(j.get("fluctuationsRatio")), j.get("marketStatus")


def us_px(syms):
    out = {}
    q = ",".join("us" + s.replace("-", ".") for s in syms if re.match(r"^[A-Z.\-]+$", s))
    if not q:
        return out
    txt = get("https://qt.gtimg.cn/q=" + q, enc="gbk")
    for m in re.finditer(r'v_us([A-Z.]+)="([^"]*)"', txt):
        f = m.group(2).split("~")
        if len(f) > 32:
            out[m.group(1).replace(".", "-")] = (num(f[3]), num(f[32]), f[30] if len(f) > 30 else "")
    return out


def push(title, msg, key, sent):
    if key in sent:
        return
    body = {"topic": "chkchp-ch-focus", "title": title, "message": msg, "tags": ["dart"], "click": APP + "#market", "priority": 4}
    try:
        urllib.request.urlopen(urllib.request.Request("https://ntfy.sh/", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}), timeout=15).read()
    except Exception as e:
        print("ntfy 실패", e)
    tok, chat = os.environ.get("TG_TOKEN"), os.environ.get("TG_CHAT")
    if tok and chat:
        try:
            urllib.request.urlopen(f"https://api.telegram.org/bot{tok}/sendMessage",
                                   data=urllib.parse.urlencode({"chat_id": chat, "text": f"{title}\n{msg}\n{APP}#market"}).encode(), timeout=15).read()
        except Exception as e:
            print("텔레그램 실패", e)
    sent[key] = 1


def main():
    now = dt.datetime.now(KST)
    today = now.strftime("%Y-%m-%d")
    F = json.loads(get(FOCUS))
    try:
        prev = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        prev = {}
    if prev.get("date") != today:
        prev = {"date": today, "px": {}, "alerts": [], "sent": {}}
    items = []
    for t in F.get("themes", []):
        items.append({"t": t["sym"], "name": t["sym"] + " (" + t["name"] + ")", "mkt": "US", "ma5": t.get("ma5"), "ma20": t.get("ma20"), "theme": t["name"], "etf": 1})
        for x in t.get("etf_kr", [])[:2]:
            items.append({"t": x["t"], "name": x["name"], "mkt": "KR", "theme": t["name"], "etf": 1})
        for x in t.get("us", []) + t.get("kr", []):
            items.append({**{k: x.get(k) for k in ("t", "name", "mkt", "ma5", "ma20", "pos")}, "theme": t["name"]})
    usq = {}
    try:
        usq = us_px([i["t"] for i in items if i["mkt"] == "US"])
    except Exception as e:
        print("미국 시세 실패", e)
    px = prev.get("px", {})
    for i in items:
        try:
            p, r, st = kr_px(i["t"]) if i["mkt"] == "KR" else usq.get(i["t"], (None, None, ""))
        except Exception as e:
            print("시세 실패", i["t"], e)
            continue
        if p is None:
            continue
        old = px.get(i["t"], {})
        lv = (i.get("pos") or {}).get("lv") if (i.get("pos") or {}).get("k") in ("컵 기준가", "갭 시가") else None
        cur = {"p": p, "r": r, "at": now.strftime("%H:%M"), "lv": lv, "ma20": i.get("ma20"), "ma5": i.get("ma5")}
        if lv:
            cur["d"] = round((p / lv - 1) * 100, 2)
            was = old.get("p")
            if was is not None and was < lv <= p:
                a = {"t": i["t"], "name": i["name"], "k": "돌파", "msg": f"{i['pos']['k']} {lv:,.2f} 돌파 · 지금 {p:,.2f} ({r:+.1f}%)", "at": cur["at"], "theme": i["theme"]}
                prev["alerts"].append(a)
                push(f"🎯✅ {i['name']} 기준가 돌파", f"{i['theme']} · {a['msg']}", f"{today}:{i['t']}:up", prev["sent"])
        m20 = i.get("ma20")
        if m20:
            was = old.get("p")
            if was is not None and was >= m20 > p:
                a = {"t": i["t"], "name": i["name"], "k": "이탈", "msg": f"20일선 {m20:,.2f} 아래로 · 지금 {p:,.2f} ({r:+.1f}%)", "at": cur["at"], "theme": i["theme"]}
                prev["alerts"].append(a)
                push(f"🎯⚠️ {i['name']} 20일선 이탈", f"{i['theme']} · {a['msg']}", f"{today}:{i['t']}:dn", prev["sent"])
        px[i["t"]] = cur
    prev["px"] = px
    prev["at"] = now.strftime("%H:%M")
    prev["alerts"] = prev["alerts"][-30:]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(prev, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"집중 장중 {len(px)}종목 · 알림 {len(prev['alerts'])}")


if __name__ == "__main__":
    main()
