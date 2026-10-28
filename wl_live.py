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


# 미국에 상장된 한국 회사(10/28 사용자가 SKHY 를 담음) → 한국 본주 실시간 값·한국 뉴스도 같이
KR_TWIN = {"SKHY": ("000660", "SK하이닉스"), "SSNLF": ("005930", "삼성전자"), "PKX": ("005490", "POSCO홀딩스"), "KB": ("105560", "KB금융"),
           "SHG": ("055550", "신한지주"), "WF": ("316140", "우리금융지주"), "KEP": ("015760", "한국전력"), "LPL": ("034220", "LG디스플레이"), "SKM": ("017670", "SK텔레콤"), "KT": ("030200", "KT")}


def news_g(q):
    """구글 뉴스(한국어) 최근 3일 — 네이버가 비거나 오래됐을 때·미국 종목"""
    try:
        import email.utils
        import urllib.parse
        x = http("https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:3d") + "&hl=ko&gl=KR&ceid=KR:ko")
        out = []
        for it in re.findall(r"<item>(.*?)</item>", x, re.S)[:12]:
            t = re.sub(r"<!\[CDATA\[|\]\]>", "", (re.search(r"<title>(.*?)</title>", it, re.S) or [None, ""])[1]).strip()
            src = re.sub(r"<[^>]+>", "", (re.search(r"<source[^>]*>(.*?)</source>", it, re.S) or [None, ""])[1]).strip()
            if src and t.endswith(" - " + src):
                t = t[: -len(src) - 3]
            pd = (re.search(r"<pubDate>(.*?)</pubDate>", it) or [None, ""])[1]
            try:
                d = email.utils.parsedate_to_datetime(pd).astimezone(KST).strftime("%Y%m%d%H%M")
            except Exception:
                d = ""
            t = re.sub(r"&quot;|&#39;|&amp;", lambda m: {"&quot;": '"', "&#39;": "'", "&amp;": "&"}[m.group(0)], t)
            if t:
                out.append({"t": t[:80], "src": src, "d": d})
        out.sort(key=lambda n: n["d"], reverse=True)
        return out[:4]
    except Exception as e:
        print("구글뉴스 실패", q, e)
        return []


def fresh(nw, days=3):
    lim = (NOW - dt.timedelta(days=days)).strftime("%Y%m%d%H%M")
    return [n for n in nw if n.get("d", "") >= lim]


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
        if not nw or not o.get("nt") or o.get("nt", "") < (NOW - dt.timedelta(minutes=50)).strftime("%Y-%m-%d %H:%M"):   # 뉴스는 50분마다
            twin = KR_TWIN.get(code.upper())
            if re.fullmatch(r"\d{6}", code):
                nw = fresh(sorted(news_kr(code), key=lambda n: n["d"], reverse=True)) or news_g(nm)
            elif twin:
                nw = fresh(sorted(news_kr(twin[0]), key=lambda n: n["d"], reverse=True)) or news_g(twin[1])
            else:
                nw = fresh(news_us(q["s"])) or news_g(re.sub(r",?\s+(Inc\.?|Corporation|Corp\.?|Ltd\.?|plc|Holdings|Company|Co\.)$", "", nm).strip() or code)
            q["nt"] = NOW.strftime("%Y-%m-%d %H:%M")
        else:
            q["nt"] = o.get("nt")
        q["news"] = nw
        q["n"] = nm
        twin = KR_TWIN.get(code.upper())
        if twin:   # 한국 본주 지금 값
            k = quote(twin[0])
            if k:
                q["kr"] = {"c": twin[0], "n": twin[1], "p": k["p"], "chg": k["chg"], "t": k["t"]}
        out[code] = q
    fx = None
    for u in ("https://api.stock.naver.com/marketindex/exchange/FX_USDKRW", "https://m.stock.naver.com/front-api/marketIndex/productDetail?category=exchange&reutersCode=FX_USDKRW"):
        try:   # 💱 서울 외환시장(네이버) 먼저 — 야후 KRW=X 는 장중 값이 10원 넘게 어긋날 때가 있음
            j = json.loads(http(u))
            def find(o, keys):
                if isinstance(o, dict):
                    for k in keys:
                        if k in o and o[k] not in (None, ""):
                            return o[k]
                    for v in o.values():
                        r = find(v, keys)
                        if r is not None:
                            return r
                return None
            cp = find(j, ["closePrice", "nowValue"])
            fl = find(j, ["fluctuations", "compareToPreviousClosePrice"])
            ud = str(find(j, ["fluctuationsType", "compareToPreviousPrice"]) or "")
            p_ = float(str(cp).replace(",", "")) if cp is not None else None
            d_ = float(str(fl).replace(",", "")) if fl is not None else None
            if d_ is not None and d_ > 0 and ("FALL" in ud.upper() or "하락" in ud or "5" == ud):
                d_ = -d_
            if p_ and 900 < p_ < 2500:
                prev = p_ - d_ if d_ is not None else None
                fx = {"p": round(p_, 2), "prev": round(prev, 2) if prev else None, "chg": round((p_ / prev - 1) * 100, 2) if prev else None, "t": NOW.strftime("%Y-%m-%d %H:%M"), "src": "naver"}
                print("환율 네이버", fx, ud)
                break
        except Exception as e:
            print("네이버 환율 실패", u, e)
    try:   # 💱 원/달러 지금 값 (10/28 「원달러 환율 저거 아니야」 — 아침 09:25 값이 그대로 쓰이던 것)
        import yfinance as yf
        d = yf.Ticker("KRW=X").history(period="5d", interval="1d")["Close"].dropna()
        m = yf.Ticker("KRW=X").history(period="1d", interval="5m")["Close"].dropna()
        last = float(m.iloc[-1]) if len(m) else float(d.iloc[-1])
        # 전일 종가 = 오늘 이전 마지막 일봉
        dd = [(i.tz_convert(KST).date() if getattr(i, "tzinfo", None) else i.date(), float(v)) for i, v in d.items()]
        prev = [v for di, v in dd if di < NOW.date()]
        prev = prev[-1] if prev else None
        t = (m.index[-1].tz_convert(KST) if len(m) else NOW).strftime("%Y-%m-%d %H:%M")
        print("환율 야후", last, prev)
        if not fx and 900 < last < 2500:
            fx = {"p": round(last, 2), "prev": round(prev, 2) if prev else None, "chg": round((last / prev - 1) * 100, 2) if prev else None, "t": t}
    except Exception as e:
        print("환율 실패", e)
    json.dump({"at": NOW.strftime("%Y-%m-%d %H:%M"), "fx": fx, "q": out}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("관심종목", len(out), "/", len(S))


if __name__ == "__main__":
    main()
