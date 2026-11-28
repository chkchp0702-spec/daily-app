"""
📏 11/28 실제 지수 값 (사용자 「다른 곳 시세라도 가져와」)
오라클 서버 계기판(bear.json)의 과창판50 값이 실제 지수와 달랐음(11/27 서버 1,446 · 실제 1,346) — 서버 프로그램은 여기서 못 고치니,
앱이 중국·홍콩 지수의 「실제 지수」 일봉을 텐센트 시세에서 따로 받아 종가·20·50·200일선·60일 저점을 계산해 둔다.
→ archive/x/live_ix.json  (앱 ux1124.js 가 🔦 바닥 점검표의 「선까지 거리·저점 지킨 날」을 이 값으로 그림 · 판정·주식 몫은 그대로 서버 것)
돈·AI 안 씀 · 하루 몇 번 호출 · 비밀 값 없음.
"""
import datetime, json, os, urllib.request

OUT = "archive/x/live_ix.json"
KST = datetime.timezone(datetime.timedelta(hours=9))
IX = {"shanghai": ("sh000001", "상해종합"), "shenzhen": ("sz399001", "심천성분"), "star50": ("sh000688", "과창판50"),
      "chinext": ("sz399006", "창업판"), "hsi": ("hkHSI", "항셍"), "hscei": ("hkHSCEI", "항셍 H주"), "hstech": ("hkHSTECH", "항셍테크")}
URL = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=%s,day,,,320,qfq"


def rows(code):
    req = urllib.request.Request(URL % code, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://gu.qq.com/"})
    with urllib.request.urlopen(req, timeout=25) as r:
        j = json.loads(r.read().decode("utf-8"))
    d = (j.get("data") or {}).get(code) or {}
    k = d.get("day") or d.get("qfqday") or []
    out = []
    for x in k:
        try:
            c = float(x[2])
            if c > 0:
                out.append((str(x[0])[:10], c))
        except Exception:
            pass
    return out


def ma(v, n):
    return round(sum(v[-n:]) / n, 2) if len(v) >= n else None


def one(code, name):
    r = rows(code)
    if len(r) < 60:
        raise ValueError("일봉 %d개뿐" % len(r))
    ds = [a for a, _ in r]; v = [b for _, b in r]
    w = v[-60:]; lo = min(w); li = len(v) - 60 + max(i for i, x in enumerate(w) if x == lo)   # 60일 종가 저점(같은 값이면 나중 날)
    hi = max(v[-250:])
    return {"name": name, "code": code, "asof": ds[-1], "close": round(v[-1], 2), "prev": round(v[-2], 2),
            "chg": round((v[-1] / v[-2] - 1) * 100, 2), "m20": ma(v, 20), "m50": ma(v, 50), "m200": ma(v, 200),
            "low60": {"v": round(lo, 2), "d": ds[li], "days": len(v) - 1 - li}, "hi250": round(hi, 2), "dd": round((v[-1] / hi - 1) * 100, 1), "n": len(v)}


def main():
    old = {}
    try:
        old = json.load(open(OUT, encoding="utf-8")).get("ix") or {}
    except Exception:
        pass
    ix, bad = {}, []
    for key, (code, name) in IX.items():
        try:
            ix[key] = one(code, name)
        except Exception as ex:
            bad.append("%s: %s" % (name, str(ex)[:80]))
            if key in old:
                ix[key] = old[key]          # 못 받으면 지난 값 그대로(asof 가 낡으면 앱이 안 씀)
    if not ix:
        print("📏 실제 지수 — 하나도 못 받음:", bad); return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"at": datetime.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "src": "텐센트 시세 · 실제 지수 일봉", "ix": ix, "bad": bad},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("📏 실제 지수 %d개" % len(ix), {k: (x["close"], x["asof"]) for k, x in ix.items()}, "못 받음:", bad)


if __name__ == "__main__":
    main()
