"""
앱 2차 업그레이드 서버 계산 (extras.py 끝에서 같은 프로세스로 실행 → 받은 가격(PX) 공유)
  users.json      관심종목·목표가·조용한 시간 (앱이 ntfy 'chkchp-ch-sync' 에 올린 것을 모아 둠)
  earn_cal.json   다가오는 실적 발표 (신호 종목 + 관심종목) · earn_cache.json 미국 종목 지난 실적일
  whale_plus.json 고래 매도 경보 · 확신도 · 내부자 매수
  wcup.json       주봉 컵 (큰 회사들)
  gap_plus.json   연속 갭
  accum_x.json    (보강) 매집 강도 · 거래대금 급감 · 목록에서 빠진 종목 · 연기금 · 13D/13G
  알림: 관심종목 신호(개인 주제) · 아침 요약(brief) · 단타 연속 손절
"""
import datetime as dt
import glob
import json
import os
import re
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

X = None          # extras 모듈 (main 에서 넣어 줌)
OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"
SYNC = "chkchp-ch-sync"
UA = {"User-Agent": "Mozilla/5.0 (CH-Investing app; github.com/chkchp0702-spec/daily-app)"}


def P(*a):
    print(*a, flush=True)


CACHE = None


def cached(kind, key, fn, days=1):
    """바깥 사이트 조회는 하루 한 번만 (collect 가 하루 9번 돌아서)"""
    global CACHE
    path = os.path.join(X.OUT, "cache_ext.json")
    if CACHE is None:
        CACHE = X.jl(path, {}) or {}
    box = CACHE.setdefault(kind, {})
    hit = box.get(key)
    cut = (dt.date.today() - dt.timedelta(days=days - 1)).isoformat()
    if hit and hit.get("d", "") >= cut:
        return hit.get("v")
    v = fn()
    box[key] = {"d": dt.date.today().isoformat(), "v": v}
    old = (dt.date.today() - dt.timedelta(days=10)).isoformat()
    for k in list(CACHE):
        CACHE[k] = {kk: vv for kk, vv in CACHE[k].items() if vv.get("d", "") >= old}
    json.dump(CACHE, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return v


def http(url, headers=None, timeout=25, data=None):
    h = dict(UA)
    h.update(headers or {})
    req = urllib.request.Request(url, headers=h, data=data)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="ignore")


def hjson(url, **kw):
    return json.loads(http(url, **kw))


def opfile(sym):
    return re.sub(r"[^A-Za-z0-9.-]", "_", sym)


def latest_json(cat, fname, d=None):
    ds = sorted(glob.glob(os.path.join(X.ARC, cat, "20*", fname)))
    return (X.jl(ds[-1], d) if ds else d), (os.path.basename(os.path.dirname(ds[-1])) if ds else None)


def kn(code):
    """비교용 키: 한국은 6자리, 나머지는 티커"""
    c = str(code or "")
    return c[:6] if re.fullmatch(r"\d{6}(\.K[SQ])?", c) else c


def yfs(code):
    """앱 코드 → 야후 심볼 (한국 6자리는 .KS)"""
    c = str(code or "")
    return c + ".KS" if re.fullmatch(r"\d{6}", c) else c


# ── 0. 사용자 관심종목 동기화 ─────────────────────────────────
def sync_users():
    """앱이 ntfy 에 올린 관심종목 (12시간 보관) → archive/x/users.json 에 누적"""
    path = os.path.join(X.OUT, "users.json")
    U = X.jl(path, {}) or {}
    try:
        txt = http(f"https://ntfy.sh/{SYNC}/json?poll=1&since=24h", timeout=30)
    except Exception as e:
        P("동기화 실패", e)
        return U
    n = 0
    for line in txt.splitlines():
        try:
            ev = json.loads(line)
            if ev.get("event") != "message":
                continue
            m = json.loads(ev.get("message") or "{}")
        except Exception:
            continue
        uid = str(m.get("uid") or "")
        if not re.fullmatch(r"[a-z0-9]{6,16}", uid):
            continue
        ts = int(ev.get("time") or 0)
        if uid in U and U[uid].get("ts", 0) >= ts:
            continue
        wl = []
        for it in (m.get("wl") or [])[:80]:
            if not isinstance(it, list) or not it:
                continue
            sym = str(it[0])[:20]
            if not re.fullmatch(r"[A-Za-z0-9.\-^=]{1,20}", sym):
                continue
            num = lambda v: float(v) if isinstance(v, (int, float)) and v > 0 else None
            wl.append([sym, str(it[1] if len(it) > 1 else sym)[:40], num(it[2] if len(it) > 2 else None),
                       num(it[3] if len(it) > 3 else None), num(it[4] if len(it) > 4 else None)])
        q = m.get("quiet")
        q = [int(q[0]) % 24, int(q[1]) % 24] if isinstance(q, list) and len(q) == 2 else None
        U[uid] = {"ts": ts, "wl": wl, "quiet": q, "brief": 1 if m.get("brief", 1) else 0, "seen": dt.date.today().isoformat()}
        n += 1
    # 60일 넘게 소식 없는 사용자 정리
    cut = (dt.date.today() - dt.timedelta(days=60)).isoformat()
    U = {k: v for k, v in U.items() if v.get("seen", "") >= cut}
    json.dump(U, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    P("관심종목 동기화", n, "명 갱신 · 전체", len(U))
    return U


def all_watch(U):
    out = {}
    for u in U.values():
        for it in u.get("wl") or []:
            out.setdefault(it[0], it[1])
    return out


# ── 1. 실적 일정 ─────────────────────────────────────────────
def signal_syms():
    """탭별 신호 종목 → {심볼: {"n": 이름, "why": set}}"""
    S = {}

    def add(code, name, why):
        s = yfs(code)
        if not s:
            return
        S.setdefault(s, {"n": name or s, "why": set()})["why"].add(why)
    cup, _ = latest_json("cup", "cards.json", {})
    for r in (cup or {}).get("ath", []) + (cup or {}).get("top", [])[:40]:
        add(r.get("code"), r.get("name"), "컵")
    gap, _ = latest_json("gap", "cards.json", {})
    for r in (gap or {}).get("top", [])[:40]:
        add(r.get("code"), r.get("name"), "갭")
    acc, _ = latest_json("accum", "list.json", [])
    for r in (acc or [])[:40]:
        add(r.get("code"), r.get("name"), "매집")
    wx = X.jl(os.path.join(X.OUT, "whale_x.json"), {}) or {}
    for c in (wx.get("consensus") or [])[:20] + (wx.get("cheap") or [])[:10]:
        add(c["t"], c["t"], "고래")
    return S


def earn_cal(U):
    S = signal_syms()
    for s, n in all_watch(U).items():
        S.setdefault(s, {"n": n, "why": set()})["why"].add("관심")
    syms = list(S)[:450]

    def one(s):
        for c in [s] + ([s[:6] + ".KQ"] if s.endswith(".KS") else []):
            try:
                return s, hjson(OPD + "e/" + opfile(c) + ".json", timeout=20)
            except Exception:
                continue
        return s, None
    with ThreadPoolExecutor(12) as ex:
        res = dict(ex.map(one, syms))
    today = dt.date.today()
    items = []
    for s, j in res.items():
        cal = (j or {}).get("cal") or {}
        for d in cal.get("earn") or []:
            try:
                dd = dt.date.fromisoformat(d[:10])
            except Exception:
                continue
            if -1 <= (dd - today).days <= 45:
                items.append({"s": s, "n": S[s]["n"], "d": dd.isoformat(), "why": sorted(S[s]["why"]), "kind": "실적"})
                break
        ex_ = cal.get("exdiv")
        if ex_:
            try:
                dd = dt.date.fromisoformat(ex_[:10])
                if 0 <= (dd - today).days <= 30:
                    items.append({"s": s, "n": S[s]["n"], "d": dd.isoformat(), "why": sorted(S[s]["why"]), "kind": "배당락"})
            except Exception:
                pass
    items.sort(key=lambda x: (x["d"], x["kind"]))
    X.js("earn_cal.json", {"updated": X.NOW.strftime("%Y-%m-%d %H:%M"), "items": items})
    P("실적 일정", len(items))


def earn_history():
    """미국 갭 후보의 지난 실적 발표일 (갭 유형 '실적 갭' 판정, 7일마다 갱신)"""
    path = os.path.join(X.OUT, "earn_cache.json")
    C = X.jl(path, {}) or {}
    D, T = C.get("d", {}), C.get("ts", {})
    gap, _ = latest_json("gap", "cards.json", {})
    perf = X.jl(os.path.join(X.OUT, "perf_gap.json"), {}) or {}
    codes = [r.get("code") for r in (gap or {}).get("top", [])] + [r.get("code") for r in (perf.get("signals") or [])[:150]]
    us = [c for c in dict.fromkeys(codes) if c and re.fullmatch(r"[A-Z][A-Z.\-]{0,6}", c)]
    todo = [c for c in us if T.get(c, "") < (dt.date.today() - dt.timedelta(days=7)).isoformat()][:70]
    if todo:
        import yfinance as yf
        for c in todo:
            try:
                df = yf.Ticker(c).get_earnings_dates(limit=12)
                if df is not None and len(df):
                    D[c] = sorted({i.strftime("%Y-%m-%d") for i in df.index if i.date() <= dt.date.today()})[-8:]
                T[c] = dt.date.today().isoformat()
                time.sleep(0.3)
            except Exception as e:
                T[c] = dt.date.today().isoformat()
                if "429" in str(e) or "Too Many" in str(e):
                    break
    json.dump({"d": D, "ts": T}, open(path, "w", encoding="utf-8"), separators=(",", ":"))
    P("실적 이력", len(D))


# ── 2. 고래 ─────────────────────────────────────────────────
def insider(tickers):
    """openinsider.com 최근 90일 내부자 '매수' (P) — 종목별"""
    out = {}
    for t in tickers[:40]:
        url = ("http://openinsider.com/screener?s=" + urllib.parse.quote(t) + "&fd=90&xp=1&xs=&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&grp=0"
               "&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=40&page=1")
        try:
            h = http(url, timeout=20)
        except Exception as e:
            P("내부자 실패", t, e)
            time.sleep(1)
            continue
        m = re.search(r'<table[^>]*class="tinytable"[^>]*>(.*?)</table>', h, re.S)
        if not m:
            out[t] = []
            continue
        tb = m.group(1)
        heads = [re.sub(r"<[^>]+>|&nbsp;", "", x).strip() for x in re.findall(r"<th[^>]*>(.*?)</th>", tb, re.S)]
        rows = []
        for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", tb, re.S):
            cells = [re.sub(r"<[^>]+>", "", c).replace("&nbsp;", " ").strip() for c in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
            if len(cells) < 8:
                continue
            r = dict(zip(heads, cells))
            if not str(r.get("Trade Type", "")).startswith("P"):
                continue
            val = re.sub(r"[^\d\-]", "", r.get("Value", "") or "0") or "0"
            rows.append({"d": (r.get("Trade Date") or "")[:10], "who": (r.get("Insider Name") or "")[:30], "title": (r.get("Title") or "")[:24],
                         "px": r.get("Price", ""), "val": int(val)})
        out[t] = rows[:8]
        time.sleep(0.6)
    return out


def whale_plus(U):
    base = os.path.join(X.SRC, "whale40", "data")
    hist = X.jl(os.path.join(base, "history.json"), {}) or {}
    prev = X.jl(os.path.join(base, "prev.json"), {}) or {}
    WH = (X.jl(os.path.join(X.OUT, "whale_holdings.json"), {}) or {}).get("m", {})
    pf = X.person_fund()
    res = {"updated": X.NOW.strftime("%Y-%m-%d %H:%M")}
    # ① 매도 경보: 이번 분기에 여러 고래가 '전부 판' 종목
    sells = {}
    if len(hist) >= 2:
        qs = sorted(hist, key=X.qend)
        H, Pq = hist[qs[-1]], hist[qs[-2]]
        watch = set(prev.get("inst", [])) | set(prev.get("ppl", []))
        for t, v in Pq.items():
            if t == "NONE":
                continue
            gone = [b for b in v.get("by", []) if b not in set((H.get(t) or {}).get("by", []))]
            gone = X.uniq_whales([b for b in gone if b in watch] if watch else gone, pf)
            if gone:
                sells[t] = set(gone)
        res["quarter"] = qs[-1]
    for nm, m in WH.items():               # 보유 내역에서 '정리'한 종목도 합치기
        for x in m.get("sold") or []:
            sells.setdefault(x["t"], set()).add(nm)
    reduce_ = {}
    for nm, m in WH.items():               # 크게 줄인 종목 (−30% 이상)
        for x in m.get("items") or []:
            if x.get("chg") == "down" and (x.get("d") or 0) <= -30:
                reduce_.setdefault(x["t"], []).append([nm, x["d"]])
    sl = []
    for t, by in sells.items():
        by = X.uniq_whales(sorted(by), pf)
        red = reduce_.get(t, [])
        if len(by) + len(red) >= 2:
            px = X.wpx(t)
            last = px[max(px)] if px else None
            sl.append({"t": t, "n": len(by), "by": by[:8], "red": len(red), "rby": [r[0] for r in red][:5], "last": X.r2(last)})
    sl.sort(key=lambda x: (-(x["n"] + x["red"] * 0.5), -x["n"]))
    res["sells"] = sl[:25]
    # ② 확신도: 비중 × (신규 1.0 / 추가 매수 증가율 / 축소는 마이너스)
    conv = {}
    for nm, m in WH.items():
        for x in m.get("items") or []:
            w = x.get("w") or 0
            ch, d = x.get("chg"), x.get("d") or 0
            if ch == "new":
                v, tag = w * 1.0, "신규"
            elif ch == "up":
                v, tag = w * min(1.0, d / 100), f"+{d:.0f}%"
            elif ch == "down":
                v, tag = -w * min(1.0, abs(d) / 100), f"{d:.0f}%"
            else:
                continue
            c = conv.setdefault(x["t"], {"t": x["t"], "nm": x.get("nm"), "sc": 0.0, "buy": 0, "sell": 0, "who": []})
            c["sc"] += v
            if v > 0:
                c["buy"] += 1
            else:
                c["sell"] += 1
            c["who"].append([nm, tag, X.r2(w, 1)])
    cl = [dict(c, sc=X.r2(c["sc"], 2), who=sorted(c["who"], key=lambda w: -(w[2] or 0))[:8]) for c in conv.values() if c["buy"] >= 1]
    cl.sort(key=lambda c: -c["sc"])
    res["conviction"] = cl[:25]
    # ③ 내부자 매수 (고래가 산 종목 + 관심종목 미국 주식)
    wx = X.jl(os.path.join(X.OUT, "whale_x.json"), {}) or {}
    ts = [c["t"] for c in (wx.get("consensus") or [])[:15]] + [c["t"] for c in (wx.get("cheap") or [])[:8]] + [c["t"] for c in cl[:10]]
    ts += [s for s in all_watch(U) if re.fullmatch(r"[A-Z][A-Z.\-]{0,6}", s)]
    ts = [t for t in dict.fromkeys(ts) if re.fullmatch(r"[A-Z][A-Z.\-]{0,6}", t)]
    ins = cached("ins", ",".join(sorted(ts)), lambda: insider(ts)) or {}
    res["insider"] = {t: v for t, v in ins.items() if v}
    res["insider_checked"] = len(ins)
    X.js("whale_plus.json", res)
    P("고래+", len(sl), len(cl), len(res["insider"]))


# ── 3. 주봉 컵 ───────────────────────────────────────────────
def wcup_one(df):
    import numpy as np
    H, L, C = df["High"].values, df["Low"].values, df["Close"].values
    n = len(C)
    if n < 40:
        return None
    lo_i = max(0, n - 66)
    if n - 7 <= lo_i:
        return None
    Li = lo_i + int(np.argmax(H[lo_i:n - 7]))
    left = H[Li]
    pre = L[max(0, Li - 30):Li]
    if len(pre) and left < 1.15 * pre.min():          # 컵 전에 오름세가 있어야
        return None
    Bi = Li + int(np.argmin(L[Li:n]))
    bottom = L[Bi]
    depth = 1 - bottom / left
    if not (0.12 <= depth <= 0.5) or Bi - Li < 3 or n - 1 - Bi < 3:
        return None
    Ri = Bi + int(np.argmax(H[Bi:n]))
    right = H[Ri]
    if right < left * 0.9:
        return None
    hw = n - 1 - Ri
    hlow = L[Ri:n].min()
    hdepth = 1 - hlow / right if hw >= 1 else 0.0
    if hw > 8 or hdepth > 0.15 or hlow < bottom + (left - bottom) * 0.5:
        return None
    pivot = max(left, right) if hw >= 1 else left
    last = C[-1]
    dist = (last / pivot - 1) * 100
    if not (-12 <= dist <= 5):
        return None
    weeks = n - 1 - Li
    if weeks < 7:
        return None
    score = 100 - abs(depth * 100 - 25) * 1.2 - hdepth * 100 * 1.5 - max(0, -dist) * 2 + min(10, (right / left - 0.9) * 100)
    return {"depth": round(depth * 100, 1), "weeks": int(weeks), "hw": int(hw), "hd": round(hdepth * 100, 1), "pivot": round(float(pivot), 4),
            "last": round(float(last), 4), "dist": round(float(dist), 2), "score": round(float(score), 1),
            "spark": [round(float(v), 4) for v in C[-60:]], "li": int(60 - (n - Li)) if n - Li <= 60 else 0}


def weekly_cup():
    path = os.path.join(X.OUT, "wcup.json")
    old = X.jl(path, {}) or {}
    if (old.get("updated") or "")[:10] == X.TODAY:
        return
    import yfinance as yf
    import pandas as pd
    try:
        sec = hjson(OPD + "sec.json", timeout=60)
        idx = hjson(OPD + "idx.json", timeout=60)
    except Exception as e:
        P("주봉컵 목록 실패", e)
        return
    mkt = {r[0]: r[2] for r in idx if len(r) > 2 and not (len(r) > 5 and r[5] == "E")}
    name = {r[0]: r[1] for r in idx}
    N = {"US": 450, "KR": 200, "JP": 120, "HK": 80, "CN": 80}
    uni = []
    for m, k in N.items():
        cand = [(s, v[2] or 0) for s, v in sec.items() if mkt.get(s) == m and isinstance(v, list) and len(v) > 2]
        cand.sort(key=lambda x: -x[1])
        uni += [s for s, _ in cand[:k]]
    out = []
    for i in range(0, len(uni), 120):
        part = uni[i:i + 120]
        try:
            df = yf.download(part, period="3y", interval="1wk", group_by="ticker", auto_adjust=False, progress=False, threads=True)
        except Exception as e:
            P("주봉 실패", e)
            continue
        for s in part:
            try:
                sub = (df[s] if isinstance(df.columns, pd.MultiIndex) else df)[["High", "Low", "Close"]].dropna()
                r = wcup_one(sub)
                if r:
                    v = sec.get(s) or ["", "", 0]
                    r.update({"s": s, "n": name.get(s, s), "mkt": mkt.get(s), "sector": v[1] or v[0], "cap": v[2]})
                    out.append(r)
            except Exception:
                continue
    out.sort(key=lambda r: -r["score"])
    X.js("wcup.json", {"updated": X.NOW.strftime("%Y-%m-%d %H:%M"), "n_scan": len(uni), "items": out[:60]})
    P("주봉 컵", len(out), "/", len(uni))


# ── 4. 연속 갭 ───────────────────────────────────────────────
def gap_plus():
    gap, day = latest_json("gap", "cards.json", {})
    cup, _ = latest_json("cup", "cards.json", {})
    codes = {}
    for r in (gap or {}).get("top", []) + (cup or {}).get("top", [])[:30]:
        codes[r["code"]] = r.get("name") or r["code"]
    syms = []
    for c in codes:
        y = X.ysym(c)
        syms += [y, y[:-3] + ".KQ"] if y.endswith(".KS") else [y]
    X.load_prices(syms)
    out = []
    for c, nm in codes.items():
        y = X.ysym(c)
        px = X.PX.get(y) if X.PX.get(y) is not None else X.PX.get(y[:-3] + ".KQ") if y.endswith(".KS") else None
        if px is None or "Open" not in px or len(px) < 25:
            continue
        t = px.iloc[-21:]
        gaps = []
        for i in range(1, len(t)):
            o, ph = float(t["Open"].iloc[i]), float(t["High"].iloc[i - 1])
            if ph > 0 and o > ph * 1.01:
                lowk = float(t["Low"].iloc[i])
                gaps.append({"d": t.index[i].strftime("%Y-%m-%d"), "g": X.r2((o / float(t["Close"].iloc[i - 1]) - 1) * 100), "held": lowk > ph})
        if len(gaps) >= 2:
            last = float(px["Close"].iloc[-1])
            out.append({"code": c, "name": nm, "n": len(gaps), "gaps": gaps[-4:], "r20": X.r2((last / float(t["Close"].iloc[0]) - 1) * 100),
                        "all_held": all(g["held"] for g in gaps)})
    out.sort(key=lambda x: (-x["n"], -(x["r20"] or 0)))
    X.js("gap_plus.json", {"updated": X.NOW.strftime("%Y-%m-%d %H:%M"), "date": day, "multi": out[:25]})
    P("연속 갭", len(out))


# ── 5. 조용한 매집 보강 ─────────────────────────────────────
def isin_kr(code):
    """한국 종목코드 → ISIN (KR7 + 코드 + 00 + 검증숫자)"""
    body = "KR7" + code + "00"
    digits = "".join(str(int(ch, 36)) for ch in body)
    tot = 0
    for i, ch in enumerate(reversed(digits)):
        d = int(ch)
        if i % 2 == 0:
            d *= 2
            d = d - 9 if d > 9 else d
        tot += d
    return body + str((10 - tot % 10) % 10)


def pension_flow(code):
    """연기금·프로그램 순매수 (다음 금융 → KRX 순서로 시도, 못 받으면 None)"""
    out = {}
    try:
        j = hjson(f"https://finance.daum.net/api/investor/days?symbolCode=A{code}&page=1&perPage=5",
                  headers={"Referer": f"https://finance.daum.net/quotes/A{code}", "Accept": "application/json"}, timeout=15)
        rows = j.get("data") if isinstance(j, dict) else j
        for row in rows or []:
            for k, v in row.items():
                kl = k.lower()
                if "pension" in kl and isinstance(v, (int, float)):
                    out["pen"] = out.get("pen", 0) + v
                if "program" in kl and isinstance(v, (int, float)):
                    out["prog"] = out.get("prog", 0) + v
        if out:
            out["src"] = "다음"
            return out
    except Exception:
        pass
    try:
        end = dt.date.today()
        start = end - dt.timedelta(days=9)
        data = urllib.parse.urlencode({"bld": "dbms/MDC/STAT/standard/MDCSTAT02303", "isuCd": isin_kr(code), "strtDd": start.strftime("%Y%m%d"),
                                       "endDd": end.strftime("%Y%m%d"), "askBid": "3", "trdVolVal": "2", "detailView": "1"}).encode()
        j = hjson("http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", data=data,
                  headers={"Referer": "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd", "Content-Type": "application/x-www-form-urlencoded"}, timeout=15)
        for row in j.get("output") or []:
            num = lambda s: float(str(s or "0").replace(",", "") or 0)
            if "연기금" in str(row.get("INVST_TP_NM", "")):
                out["pen"] = num(row.get("NETBID_TRDVAL"))
        if out:
            out["src"] = "KRX"
            return out
    except Exception:
        pass
    return None


SEC_MAP = None


def sec_13dg(ticker):
    """미국: 최근 60일 안에 이 회사에 대한 5% 이상 대량 보유 신고 (SC 13D·13G)"""
    global SEC_MAP
    try:
        if SEC_MAP is None:
            j = hjson("https://www.sec.gov/files/company_tickers.json", timeout=30)
            SEC_MAP = {v["ticker"].upper(): int(v["cik_str"]) for v in j.values()}
        cik = SEC_MAP.get(ticker.upper())
        if not cik:
            return None
        j = hjson(f"https://data.sec.gov/submissions/CIK{cik:010d}.json", timeout=20)
        r = j.get("filings", {}).get("recent", {})
        cut = (dt.date.today() - dt.timedelta(days=60)).isoformat()
        out = []
        for f, d, acc in zip(r.get("form", []), r.get("filingDate", []), r.get("accessionNumber", [])):
            if d < cut:
                break
            if re.match(r"^(SC 13[DG]|SCHEDULE 13[DG])", f):
                out.append({"f": f.replace("SCHEDULE", "SC"), "d": d,
                            "u": f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc.replace('-', '')}/{acc}-index.htm"})
        time.sleep(0.15)
        return out
    except Exception as e:
        P("13D/G 실패", ticker, e)
        return None


def accum_plus(U):
    path = os.path.join(X.OUT, "accum_x.json")
    A = X.jl(path, {}) or {}
    days = sorted(d for d in os.listdir(os.path.join(X.ARC, "accum")) if re.match(r"20\d\d-\d\d-\d\d$", d)) if os.path.isdir(os.path.join(X.ARC, "accum")) else []
    if not A or not days:
        return
    rows = {r["code"]: r for r in X.jl(os.path.join(X.ARC, "accum", days[-1], "list.json"), []) or []}
    prev = {r["code"]: r for r in X.jl(os.path.join(X.ARC, "accum", days[-2], "list.json"), []) or []} if len(days) >= 2 else {}
    for o in A.get("items") or []:
        r = rows.get(o["code"]) or {}
        y = X.ysym(o["code"])
        px = X.PX.get(y) if X.PX.get(y) is not None else X.PX.get(y[:-3] + ".KQ") if y.endswith(".KS") else None
        comp = {"매집점수": min(100, r.get("score") or 0)}
        if px is not None and len(px) > 60:
            rng = (px["High"] - px["Low"]) / px["Close"]
            contr = float(rng.iloc[-10:].mean() / max(1e-9, rng.iloc[-60:].mean()))
            o["contr"] = X.r2(contr)
            comp["변동성 축소"] = max(0, min(100, (1.3 - contr) / 0.7 * 100))
            if "Volume" in px:
                val = px["Close"] * px["Volume"]
                v5, v20 = float(val.iloc[-5:].mean()), float(val.iloc[-25:-5].mean())
                if v20 > 0:
                    o["v5"] = X.r2(v5 / v20)
                    o["dry"] = v5 / v20 < 0.5
        comp["거래량"] = min(100, (r.get("vol") or 0) / 3 * 100)
        if o.get("flow"):
            f5 = o["flow"][:5]
            F, Oo = sum(d["f"] for d in f5), sum(d["o"] for d in f5)
            comp["외국인·기관"] = 100 if F > 0 and Oo > 0 else 50 if F > 0 or Oo > 0 else 0
        w = {"매집점수": 0.4, "변동성 축소": 0.2, "거래량": 0.2, "외국인·기관": 0.2}
        tw = sum(w[k] for k in comp)
        o["power"] = round(sum(comp[k] * w[k] for k in comp) / tw)
        o["comp"] = {k: round(v) for k, v in comp.items()}
        if re.fullmatch(r"\d{6}(\.K[SQ])?", o["code"]) and (r.get("score") or 0) >= 60:
            pf = cached("pen", o["code"][:6], lambda: pension_flow(o["code"][:6]))
            if pf:
                o["pen"] = pf
        elif re.fullmatch(r"[A-Z][A-Z.\-]{0,6}", o["code"]):
            f = cached("dg", o["code"], lambda: sec_13dg(o["code"]))
            if f is not None:
                o["dg"] = f
    for s in all_watch(U):
        if re.fullmatch(r"[A-Z][A-Z.\-]{0,6}", s) and not any(o["code"] == s for o in A["items"]):
            f = cached("dg", s, lambda: sec_13dg(s))
            if f:
                A.setdefault("watch_dg", {})[s] = f
    A["dropped"] = [{"code": c, "name": p.get("name"), "score": p.get("score"), "mkt": p.get("mkt")} for c, p in prev.items() if c not in rows][:20]
    A["prev_day"] = days[-2] if len(days) >= 2 else None
    json.dump(A, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    P("매집+", len(A.get("items") or []), "빠짐", len(A["dropped"]))


# ── 6. 알림: 관심종목 · 아침 요약 · 단타 연속 손절 ─────────────
def user_topic(uid):
    return "chkchp-ch-u-" + uid


def today_hits():
    """오늘 각 탭에 뜬 신호 → {심볼(야후식): [설명, 탭]}"""
    hits = {}

    def add(code, txt, tab):
        hits.setdefault(kn(code), []).append([txt, tab])
    cup, cday = latest_json("cup", "cards.json", {})
    for r in (cup or {}).get("top", []) + (cup or {}).get("ath", []):
        if r.get("brk") and r.get("brkday") == cday:
            add(r["code"], "☕ 컵 돌파", "cup")
        elif r.get("dist") is not None and -3 <= r["dist"] < 0:
            add(r["code"], f"☕ 컵 돌파 임박 ({-r['dist']:.1f}% 남음)", "cup")
    gap, _ = latest_json("gap", "cards.json", {})
    for r in (gap or {}).get("top", []):
        if r.get("new"):
            add(r["code"], f"📈 새 갭 +{r.get('gap') or 0:.0f}%", "gap")
    ax = X.jl(os.path.join(X.OUT, "accum_x.json"), {}) or {}
    for o in ax.get("items") or []:
        if o.get("brk"):
            add(o["code"], "🤫 매집 박스 돌파", "accum")
    acc, aday = latest_json("accum", "list.json", [])
    for r in acc or []:
        if (r.get("days") or 0) == 1:
            add(r["code"], "🤫 조용한 매집 새로 포착", "accum")
    da, dday = latest_json("danta", "alerts.json", [])
    if dday == X.TODAY:
        for r in da or []:
            add(r["code"], f"⚡ 단타 알람 {r.get('time')} {r.get('type')}", "danta")
    wx = X.jl(os.path.join(X.OUT, "whale_x.json"), {}) or {}
    for c in (wx.get("consensus") or [])[:20]:
        add(c["t"], f"🐋 고래 {c['n']}명 새로 매수", "whale")
    return hits


def alerts2(U):
    hits = today_hits()
    # ① 관심종목 신호 → 사용자별 주제
    for uid, u in U.items():
        for it in u.get("wl") or []:
            s, nm = it[0], it[1]
            for txt, tab in hits.get(kn(s), []):
                X.push("u", f"⭐ {nm[:16]} — {txt}", "관심종목에 신호가 떴어요. 눌러서 확인.", tab, f"w:{uid}:{s}:{txt[:14]}:{X.TODAY}",
                       tags="star", syms=[[s, None]], quiet=tuple(u.get("quiet") or X.QUIET), full_topic=user_topic(uid), log=False)
    # ② 단타: 오늘 연속 손절 3번
    S = X.jl(os.path.join(X.OUT, "danta_stats.json"), {}) or {}
    t = S.get("today") or {}
    if t.get("d") == X.TODAY and (t.get("streak") or 0) >= 3:
        X.push("danta", f"🛑 단타 연속 손절 {t['streak']}번", f"오늘 가상 매매 {t.get('pnl', 0):+.1f}% · 오늘은 쉬어 가는 게 좋아요.", "danta", f"streak:{X.TODAY}:{t['streak']}", tags="stop_sign", quiet=None)
    # ③ 아침 요약 — 08:00 ~ 10:59 첫 실행 때 한 번
    h = dt.datetime.now(X.KST).hour
    if 8 <= h < 11:
        msg = brief_text(hits)
        if msg:
            X.push("brief", f"☀️ {dt.datetime.now(X.KST).strftime('%m/%d')} 아침 요약", msg, "market", f"brief:{X.TODAY}", tags="sunny", quiet=None)
            for uid, u in U.items():
                if not u.get("brief", 1):
                    continue
                mine = [f"⭐ {it[1][:12]}: " + ", ".join(x[0] for x in hits.get(kn(it[0]), [])[:2]) for it in u.get("wl") or [] if hits.get(kn(it[0]))]
                if mine:
                    X.push("u", "☀️ 내 관심종목 아침 요약", "\n".join(mine[:8]), "market", f"ubrief:{uid}:{X.TODAY}", tags="sunny",
                           quiet=None, full_topic=user_topic(uid), log=False)


def brief_text(hits):
    L = []
    cs = sorted(glob.glob(os.path.join(X.ARC, "sector", "20*", "compass.json")))
    if cs:
        C = X.jl(cs[-1], {}) or {}
        ms = C.get("markets") or {}
        L.append("🧭 " + " · ".join(f"{m['flag']}{m['regime'][:2]}" for k, m in ms.items()))
    md = sorted(d for d in glob.glob(os.path.join(X.ARC, "market", "20*", "data.json")))
    if md:
        d = X.jl(md[-1], {}) or {}
        if d.get("one_liner"):
            L.append("🌐 " + re.sub(r"<[^>]+>", "", d["one_liner"])[:110])
        for c in (d.get("checks") or [])[:2]:
            L.append("✅ " + re.sub(r"<[^>]+>", "", c)[:90])
    by = {}
    for s, xs in hits.items():
        for txt, tab in xs:
            by.setdefault(tab, 0)
            by[tab] += 1
    nm = {"cup": "☕ 컵", "gap": "📈 갭", "accum": "🤫 매집", "whale": "🐋 고래", "danta": "⚡ 단타"}
    if by:
        L.append("오늘 신호 " + " · ".join(f"{nm.get(k, k)} {v}" for k, v in by.items()))
    ec = X.jl(os.path.join(X.OUT, "earn_cal.json"), {}) or {}
    soon = [x for x in ec.get("items") or [] if x["kind"] == "실적" and x["d"] <= (dt.date.today() + dt.timedelta(days=2)).isoformat()]
    if soon:
        L.append("📅 실적: " + ", ".join(f"{x['n'][:10]}({x['d'][5:].replace('-', '/')})" for x in soon[:5]))
    return "\n".join(L)


def main(mod):
    global X
    X = mod
    U = {}
    for fn in (sync_users,):
        try:
            U = fn() or {}
        except Exception as e:
            P("실패 sync", e)
    for fn, args in ((earn_history, ()), (earn_cal, (U,)), (whale_plus, (U,)), (gap_plus, ()), (accum_plus, (U,)), (weekly_cup, ()), (alerts2, (U,))):
        try:
            fn(*args)
        except Exception:
            import traceback
            P("실패", fn.__name__)
            traceback.print_exc()
    P("plus ok")
