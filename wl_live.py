"""
⭐ 관심종목 실시간 시세·뉴스 (10/28 사용자 「주가랑 뉴스가 다 어제꺼야 — 해결해」)
  앱 사용자들의 ⭐ 관심종목(ntfy chkchp-ch-sync 최근 2일 + archive/x/users.json)을 모아
  10분마다(live.yml) 지금 가격·전일 종가·오늘 등락·최근 뉴스 3개를 archive/x/wl_live.json 에 씀.
  앱의 「📨 고객에게 → 관심종목 포함」 종목 한 장이 이걸 먼저 씀(없으면 어제 종가로, 날짜를 밝힘).
  python wl_live.py
"""
import datetime as dt
import json
import os
import re
import urllib.request

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
X = os.path.join("archive", "x")
OUT = os.path.join(X, "wl_live.json")
UA = {"User-Agent": "Mozilla/5.0 (ch-investing wl_live)"}


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def http(url, timeout=20):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read().decode("utf-8", errors="ignore")


def symbols():
    S = {}
    U = jl(os.path.join(X, "users.json"), {}) or {}
    for u in U.values():
        for it in u.get("wl") or []:
            S[str(it[0])] = str(it[1] if len(it) > 1 else it[0])
    try:   # 막 담은 종목(아직 users.json 에 없는 것)
        for line in http("https://ntfy.sh/chkchp-ch-sync/json?poll=1&since=48h", 30).splitlines():
            try:
                ev = json.loads(line)
                if ev.get("event") != "message":
                    continue
                m = json.loads(ev.get("message") or "{}")
                for it in (m.get("wl") or [])[:80]:
                    if isinstance(it, list) and it and re.fullmatch(r"[A-Za-z0-9.\-^=]{1,20}", str(it[0])):
                        S[str(it[0])] = str(it[1] if len(it) > 1 else it[0])[:40]
            except Exception:
                continue
    except Exception as e:
        print("ntfy 실패", e)
    return S


def yf_sym(code):
    return [code + ".KS", code + ".KQ"] if re.fullmatch(r"\d{6}", code) else [code]


def quote(code):
    import yfinance as yf
    for s in yf_sym(code):
        try:
            h = yf.Ticker(s).history(period="5d", interval="1d", auto_adjust=False)
            if h is None or h.empty:
                continue
            c = h["Close"].dropna()
            if c.empty:
                continue
            last, prev = float(c.iloc[-1]), float(c.iloc[-2]) if len(c) > 1 else None
            d = c.index[-1]
            try:   # 장중이면 1분봉 마지막 값으로
                m = yf.Ticker(s).history(period="1d", interval="2m", auto_adjust=False)
                if m is not None and not m.empty and m.index[-1].date() >= d.date():
                    last = float(m["Close"].dropna().iloc[-1]); d = m.index[-1]
                    if m.index[-1].date() > c.index[-1].date():
                        prev = float(c.iloc[-1])
            except Exception:
                pass
            dk = d.tz_convert(KST) if getattr(d, "tzinfo", None) else d
            return {"s": s, "p": round(last, 4), "prev": round(prev, 4) if prev else None, "chg": round((last / prev - 1) * 100, 2) if prev else None,
                    "t": dk.strftime("%Y-%m-%d %H:%M")}
        except Exception as e:
            print("시세 실패", s, e)
    return None


def news_kr(code):
    try:
        j = json.loads(http(f"https://m.stock.naver.com/api/news/stock/{code}?pageSize=5&page=1"))
        out = []
        for grp in j if isinstance(j, list) else []:
            for it in grp.get("items") or []:
                t = re.sub(r"<[^>]+>|&[a-z]+;", "", it.get("title") or "").strip()
                if t:
                    out.append({"t": t[:80], "src": it.get("officeName") or "", "d": str(it.get("datetime") or "")[:12]})
        return out[:4]
    except Exception as e:
        print("뉴스 실패", code, e)
        return []


def news_us(sym):
    try:
        import yfinance as yf
        out = []
        for n in (yf.Ticker(sym).news or [])[:6]:
            c = n.get("content") or n
            t = c.get("title") or ""
            pub = (c.get("provider") or {}).get("displayName") if isinstance(c.get("provider"), dict) else c.get("publisher") or ""
            d = c.get("pubDate") or c.get("providerPublishTime") or ""
            if isinstance(d, (int, float)):
                d = dt.datetime.fromtimestamp(d, KST).strftime("%Y%m%d%H%M")
            else:
                d = re.sub(r"\D", "", str(d))[:12]
            if t:
                out.append({"t": t[:90], "src": pub or "", "d": d})
        return out[:4]
    except Exception as e:
        print("뉴스 실패", sym, e)
        return []


def main():
    S = symbols()
    old = jl(OUT, {}) or {}
    Q = old.get("q") or {}
    out = {}
    for code, nm in list(S.items())[:120]:
        q = quote(code)
        if not q:
            continue
        o = Q.get(code) or {}
        nw = o.get("news") or []
        if not o.get("nt") or o.get("nt", "") < (NOW - dt.timedelta(minutes=50)).strftime("%Y-%m-%d %H:%M"):   # 뉴스는 50분마다
            nw = news_kr(code) if re.fullmatch(r"\d{6}", code) else news_us(q["s"])
            q["nt"] = NOW.strftime("%Y-%m-%d %H:%M")
        else:
            q["nt"] = o.get("nt")
        q["news"] = nw
        q["n"] = nm
        out[code] = q
    json.dump({"at": NOW.strftime("%Y-%m-%d %H:%M"), "q": out}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("관심종목", len(out), "/", len(S))


if __name__ == "__main__":
    main()
