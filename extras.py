"""
앱 부가 자료 (collect 다음에 실행) → archive/x/*.json
  perf_cup / perf_gap / perf_accum : 신호 성적표 (5·20·60거래일 수익률, 승률, 돌파·갭메움)
  danta_stats   : 단타 알람 성적 (유형·시간대별 승률, 목표/손절 도달, 가상 매매 일지)
  whale_x       : 고래 합의 매수, 고래 기준가 vs 현재가, 따라하기 수익곡선, 고래별 분기 타임라인
  accum_x       : 조용한 매집 돌파 여부, 한국 종목 외국인·기관 순매수
  premarket     : 미국 장 전 갭 후보 (관심 목록)
  market_x      : 시황 리포트에 나온 종목 칩
그리고 새 소식은 ntfy 푸시 (알림 탭에서 구독) + 텔레그램(비밀값 TG_TOKEN/TG_CHAT 있을 때만)
  python extras.py
"""
import datetime as dt
import glob
import json
import os
import re
import sys
import time
import traceback
import urllib.request

ARC = "archive"
OUT = os.path.join(ARC, "x")
SRC = "_src"
KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
TODAY = NOW.strftime("%Y-%m-%d")
APP = "https://chkchp0702-spec.github.io/daily-app/"
TOPIC = "chkchp-ch-"            # ntfy 주제 앞부분 (알림 탭과 같아야 함)
os.makedirs(OUT, exist_ok=True)


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def js(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def r2(v, d=2):
    return None if v is None or v != v else round(float(v), d)


# ── 가격 (야후 일봉, 묶음) ────────────────────────────────────
PX = {}


def load_prices(syms, period="1y"):
    import yfinance as yf
    import pandas as pd
    syms = [s for s in dict.fromkeys(syms) if s and s not in PX]
    for i in range(0, len(syms), 150):
        part = syms[i:i + 150]
        try:
            df = yf.download(part, period=period, interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
        except Exception as e:
            print("가격 실패", e, flush=True)
            continue
        for s in part:
            try:
                sub = df[s] if isinstance(df.columns, pd.MultiIndex) else df
                sub = sub[["Close", "High", "Low"]].dropna()
                if len(sub):
                    sub.index = pd.to_datetime(sub.index).tz_localize(None).normalize()
                    PX[s] = sub
            except Exception:
                pass
    return PX


def ysym(code, mkt=""):
    c = str(code or "").strip()
    if re.fullmatch(r"\d{6}", c):
        return c + ".KS"          # 코스닥이면 아래에서 .KQ 로 다시 시도
    return c


# ── 1. 신호 성적표 ───────────────────────────────────────────
HORIZONS = [5, 20, 60]


def signals_from(cat, fname, lists):
    """날짜별 목록에서 '처음 나타난 날'을 신호로 (10일 넘게 빠졌다가 다시 나오면 새 신호)"""
    days = sorted(d for d in os.listdir(os.path.join(ARC, cat)) if re.match(r"20\d\d-\d\d-\d\d$", d))
    last_seen, sig = {}, []
    for d in days:
        j = jl(os.path.join(ARC, cat, d, fname))
        if j is None:
            continue
        rows = []
        if isinstance(j, list):
            rows = j
        else:
            for k in lists:
                rows += j.get(k) or []
        seen_today = set()
        for r in rows:
            c = r.get("code")
            if not c or c in seen_today:
                continue
            seen_today.add(c)
            prev = last_seen.get(c)
            if prev is None or (dt.date.fromisoformat(d) - dt.date.fromisoformat(prev)).days > 10:
                sig.append(dict(r, d0=d))
            last_seen[c] = d
    return sig, days


def perf_one(s, extra=None):
    import pandas as pd
    sym = ysym(s["code"])
    px = PX.get(sym)
    if px is None and sym.endswith(".KS"):
        px = PX.get(sym[:-3] + ".KQ")
    if px is None or not len(px):
        return None
    d0 = pd.Timestamp(s["d0"])
    after = px[px.index >= d0]
    if not len(after):
        return None
    c0 = float(after["Close"].iloc[0])
    p0 = s.get("price") or c0
    if not p0 or abs(p0 / c0 - 1) > 0.3:      # 카드 가격이 이상하면(단위·분할) 그날 종가로
        p0 = c0
    closes = after["Close"]
    out = {"code": s["code"], "name": s.get("name", ""), "mkt": s.get("mkt", ""), "sector": s.get("sector", ""),
           "d0": s["d0"], "p0": r2(p0, 4), "score": s.get("score"), "days": int(len(after) - 1),
           "now": r2((float(closes.iloc[-1]) / p0 - 1) * 100),
           "maxup": r2((float(after["High"].max()) / p0 - 1) * 100), "maxdd": r2((float(after["Low"].min()) / p0 - 1) * 100)}
    for h in HORIZONS:
        out[f"r{h}"] = r2((float(closes.iloc[h]) / p0 - 1) * 100) if len(closes) > h else None
    if extra:
        out.update(extra(s, after, p0) or {})
    return out


def stats(rows):
    def blk(rs):
        o = {"n": len(rs)}
        for k in ["r5", "r20", "r60", "now"]:
            v = [r[k] for r in rs if r.get(k) is not None]
            o[k] = {"n": len(v), "win": r2(sum(1 for x in v if x > 0) / len(v) * 100, 0) if v else None,
                    "avg": r2(sum(v) / len(v)) if v else None,
                    "med": r2(sorted(v)[len(v) // 2]) if v else None}
        return o
    by_m = {}
    for r in rows:
        by_m.setdefault(r["mkt"] or "?", []).append(r)
    by_s = {}
    for r in rows:
        sc = r.get("score") or 0
        b = "90점 이상" if sc >= 90 else "80~89점" if sc >= 80 else "80점 미만"
        by_s.setdefault(b, []).append(r)
    return {"all": blk(rows), "by_mkt": {k: blk(v) for k, v in by_m.items()},
            "by_score": {k: blk(by_s[k]) for k in ["90점 이상", "80~89점", "80점 미만"] if k in by_s}}


def cup_extra(s, after, p0):
    pv = s.get("pivot")
    if not pv:
        return {}
    hit = after[after["High"] >= pv]
    return {"pivot": pv, "brk": bool(len(hit)), "brkd": hit.index[0].strftime("%Y-%m-%d") if len(hit) else ""}


def gap_extra(s, after, p0):
    lvl = s.get("boxhi")
    gd = s.get("gday") or s["d0"]
    import pandas as pd
    px = after[after.index >= pd.Timestamp(gd)]
    if not lvl or not len(px):
        return {}
    filled = px[px["Low"] <= lvl]
    return {"gday": gd, "gap": s.get("gap"), "vol": s.get("vol"), "fill_lvl": lvl, "filled": bool(len(filled)),
            "filld": filled.index[0].strftime("%Y-%m-%d") if len(filled) else "",
            "fill_days": int((px.index < filled.index[0]).sum()) if len(filled) else None}


def perf(cat, fname, lists, extra=None):
    sig, days = signals_from(cat, fname, lists)
    if not sig:
        return None
    syms = []
    for s in sig:
        y = ysym(s["code"])
        syms.append(y)
        if y.endswith(".KS"):
            syms.append(y[:-3] + ".KQ")
    load_prices(syms)
    rows = [x for x in (perf_one(s, extra) for s in sig) if x and x["now"] is not None and abs(x["now"]) < 300 and (x["maxup"] or 0) < 1000]
    rows.sort(key=lambda r: r["d0"], reverse=True)
    res = {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "first": days[0], "days": len(days), "stats": stats(rows), "signals": rows[:300]}
    if cat == "gap":
        g = [r for r in rows if "filled" in r]
        def fr(n):
            v = [r for r in g if r["days"] >= n]
            return r2(sum(1 for r in v if r["filled"] and r["fill_days"] is not None and r["fill_days"] <= n) / len(v) * 100, 0) if v else None
        res["fill"] = {"n": len(g), "f5": fr(5), "f20": fr(20), "now": r2(sum(1 for r in g if r["filled"]) / len(g) * 100, 0) if g else None,
                       "held_ret": r2(sum(r["now"] for r in g if not r["filled"]) / max(1, sum(1 for r in g if not r["filled"]))),
                       "fill_ret": r2(sum(r["now"] for r in g if r["filled"]) / max(1, sum(1 for r in g if r["filled"])))}
    if cat == "cup":
        c = [r for r in rows if "brk" in r]
        res["brk"] = {"n": len(c), "rate": r2(sum(1 for r in c if r["brk"]) / len(c) * 100, 0) if c else None}
    js(f"perf_{cat}.json", res)
    print("성적표", cat, len(rows), flush=True)
    return res


# ── 2. 단타 ──────────────────────────────────────────────────
def danta():
    rows = []
    for f in sorted(glob.glob(os.path.join(ARC, "danta", "20*", "alerts.json"))):
        d = os.path.basename(os.path.dirname(f))
        for r in jl(f, []) or []:
            p = r.get("price")
            if not p:
                continue
            t1 = (r["t1"] / p - 1) * 100 if r.get("t1") else None
            st = (r["stop"] / p - 1) * 100 if r.get("stop") else None
            hi, lo, now = r.get("high"), r.get("low"), r.get("now")
            hit1 = t1 is not None and hi is not None and hi >= t1
            hits = st is not None and lo is not None and lo <= st
            # 가상 매매: 손절 먼저(보수적) → 목표1 → 아니면 현재(마감)
            pnl = st if hits else (t1 if hit1 else now)
            hh = int((r.get("time") or "00:00")[:2])
            rows.append({"d": d, "time": r.get("time"), "code": r.get("code"), "name": r.get("name"), "type": r.get("type") or "알람",
                         "price": p, "hi": hi, "lo": lo, "now": now, "t1p": r2(t1), "stp": r2(st), "hit1": hit1, "hits": hits,
                         "pnl": r2(pnl), "slot": "09시" if hh <= 9 else "10시" if hh == 10 else "11~12시" if hh <= 12 else "13시 이후"})
    if not rows:
        return

    def blk(rs):
        v = [r["now"] for r in rs if r["now"] is not None]
        p = [r["pnl"] for r in rs if r["pnl"] is not None]
        return {"n": len(rs), "win": r2(sum(1 for x in v if x > 0) / len(v) * 100, 0) if v else None,
                "avg": r2(sum(v) / len(v)) if v else None, "hit1": r2(sum(1 for r in rs if r["hit1"]) / len(rs) * 100, 0),
                "hits": r2(sum(1 for r in rs if r["hits"]) / len(rs) * 100, 0), "pnl": r2(sum(p) / len(p)) if p else None,
                "hi": r2(sum(r["hi"] for r in rs if r["hi"] is not None) / max(1, sum(1 for r in rs if r["hi"] is not None)))}
    by_t, by_h, by_th = {}, {}, {}
    for r in rows:
        by_t.setdefault(r["type"], []).append(r)
        by_h.setdefault(r["slot"], []).append(r)
        by_th.setdefault(r["type"] + "|" + r["slot"], []).append(r)
    # 품질 점수: 같은 유형·시간대의 과거 승률(표본 적으면 유형 전체와 섞기)
    qual = {}
    for k, rs in by_th.items():
        t = k.split("|")[0]
        base = blk(by_t[t])
        b = blk(rs)
        w = min(1.0, len(rs) / 15)
        win = (b["win"] or 0) * w + (base["win"] or 0) * (1 - w)
        pnl = (b["pnl"] or 0) * w + (base["pnl"] or 0) * (1 - w)
        qual[k] = {"n": len(rs), "win": r2(win, 0), "pnl": r2(pnl), "grade": "A" if win >= 55 and pnl > 0 else "B" if win >= 45 else "C"}
    eq, cum = [], 0.0
    by_d = {}
    for r in rows:
        by_d.setdefault(r["d"], []).append(r["pnl"] or 0)
    for d in sorted(by_d):
        day = sum(by_d[d]) / len(by_d[d])
        cum += day
        eq.append([d[5:].replace("-", "/"), r2(day), r2(cum)])
    order = ["09시", "10시", "11~12시", "13시 이후"]
    js("danta_stats.json", {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "all": blk(rows),
                            "by_type": {k: blk(v) for k, v in sorted(by_t.items(), key=lambda x: -len(x[1]))},
                            "by_slot": {k: blk(by_h[k]) for k in order if k in by_h}, "quality": qual,
                            "equity": eq, "journal": sorted(rows, key=lambda r: (r["d"], r["time"] or ""), reverse=True)[:200]})
    print("단타", len(rows), flush=True)


# ── 3. 고래 ──────────────────────────────────────────────────
def qend(q):
    n, y = q.split()
    m = {"Q1": 3, "Q2": 6, "Q3": 9, "Q4": 12}[n]
    d = {3: 31, 6: 30, 9: 30, 12: 31}[m]
    return dt.date(int(y), m, d)


def wpx(t):
    j = jl(os.path.join(SRC, "whale40", "data", "cache", "px", t + ".json"))
    return (j or {}).get("px") or {}


def at(px, d, after=True):
    """d 이후(또는 이전) 첫 거래일 가격"""
    ks = sorted(px)
    if not ks:
        return None, None
    ds = d.isoformat()
    if after:
        for k in ks:
            if k >= ds:
                return k, px[k]
        return None, None
    for k in reversed(ks):
        if k <= ds:
            return k, px[k]
    return None, None


def person_fund():
    """whale40.py 의 (사람, 펀드) 짝 → 같은 고래를 두 번 세지 않게"""
    try:
        txt = open(os.path.join(SRC, "whale40", "whale40.py"), encoding="utf-8").read()
        return dict(re.findall(r'\("([가-힣 ]+)",\s*"([^"]+)"\)', txt))
    except Exception:
        return {}


def uniq_whales(names, pf):
    funds = set(names)
    return [n for n in names if not (n in pf and pf[n] in funds)]


def whale():
    base = os.path.join(SRC, "whale40", "data")
    pf = person_fund()
    hist = jl(os.path.join(base, "history.json"), {}) or {}
    sig = jl(os.path.join(base, "signals.json"), {}) or {}
    prev = jl(os.path.join(base, "prev.json"), {}) or {}
    if not hist:
        return
    qs = sorted(hist, key=qend)
    q, qp = qs[-1], qs[-2]
    H, P = hist[q], hist[qp]
    watch = set(prev.get("inst", [])) | set(prev.get("ppl", []))
    # ① 합의 매수: 이번 분기에 새로 담은 고래 수
    cons = []
    for t, v in H.items():
        new = [b for b in v.get("by", []) if b not in set((P.get(t) or {}).get("by", []))]
        new_w = uniq_whales([b for b in new if b in watch] if watch else new, pf)
        if len(new_w) >= 2:
            px = wpx(t)
            qe = at(px, qend(q), after=False)[1] if px else None
            last = px[max(px)] if px else None
            cons.append({"t": t, "n": len(new_w), "by": new_w[:8], "h": v.get("h"), "qe": r2(qe), "last": r2(last),
                         "vs": r2((last / qe - 1) * 100) if (qe and last) else None})
    cons.sort(key=lambda x: (-x["n"], -(x["h"] or 0)))
    # ② 고래 기준가(분기말 평가가격) 대비 지금 — 합의 매수·큰 신규 종목 중 아직 싸게 살 수 있는 것
    big = []
    for t, v in (sig.get(q) or {}).items():
        px = wpx(t)
        qe = at(px, qend(q), after=False)[1] if px else None
        last = px[max(px)] if px else None
        big.append({"t": t, "n": v.get("n"), "by": uniq_whales(v.get("by", []), pf)[:5], "w": max(v.get("w") or [0]), "qe": r2(qe), "last": r2(last),
                    "vs": r2((last / qe - 1) * 100) if (qe and last) else None})
    big.sort(key=lambda x: -(x["w"] or 0))
    cheap = sorted([c for c in cons + [dict(b, h=None) for b in big] if c["vs"] is not None and -30 < c["vs"] < 0 and (c.get("n") or 0) >= 2], key=lambda c: (-(c.get("n") or 0), c["vs"]))
    seen = set()
    cheap = [c for c in cheap if not (c["t"] in seen or seen.add(c["t"]))][:15]

    # ③ 따라하기 수익곡선: 각 분기 '큰 신규 포지션'을 공시일(분기말+46일)에 같은 비중으로 사서 다음 공시일까지 보유
    spy = wpx("SPY")
    qq = sorted(sig, key=qend)
    curve, port, bench = [], 100.0, 100.0
    legs = []
    for i, qn in enumerate(qq):
        start = qend(qn) + dt.timedelta(days=46)
        end = qend(qq[i + 1]) + dt.timedelta(days=46) if i + 1 < len(qq) else NOW.date()
        if start >= NOW.date():
            continue
        rets = []
        for t in sig[qn]:
            px = wpx(t)
            d0, p0 = at(px, start)
            d1, p1 = at(px, end, after=False)
            if p0 and p1 and d1 and d0 and d1 > d0:
                rets.append(p1 / p0 - 1)
        b0 = at(spy, start)[1]
        b1 = at(spy, end, after=False)[1]
        if not rets or not (b0 and b1):
            continue
        r = sum(rets) / len(rets)
        rb = b1 / b0 - 1
        if not curve:
            curve.append([start.isoformat(), 100.0, 100.0])
        port *= 1 + r
        bench *= 1 + rb
        curve.append([end.isoformat(), r2(port, 1), r2(bench, 1)])
        legs.append({"q": qn, "from": start.isoformat(), "to": end.isoformat(), "n": len(rets), "ret": r2(r * 100), "spy": r2(rb * 100),
                     "win": r2(sum(1 for x in rets if x > 0) / len(rets) * 100, 0)})
    # ⑤ 고래별 분기 타임라인 (최근 4분기 새로 담은 것 / 정리한 것)
    tl = {}
    names = list(prev.get("inst", [])) + list(prev.get("ppl", []))
    for m in names:
        rows = []
        for i in range(max(1, len(qs) - 4), len(qs)):
            a, b = hist[qs[i]], hist[qs[i - 1]]
            now_set = {t for t, v in a.items() if m in v.get("by", []) and t != "NONE"}
            prev_set = {t for t, v in b.items() if m in v.get("by", []) and t != "NONE"}
            add = sorted(now_set - prev_set, key=lambda t: -(a[t].get("v") or 0))
            drop = sorted(prev_set - now_set, key=lambda t: -(b[t].get("v") or 0))
            rows.append({"q": qs[i], "n": len(now_set), "add": add[:20], "drop": drop[:20], "na": len(add), "nd": len(drop)})
        tl[m] = list(reversed(rows))
    js("whale_x.json", {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "quarter": q, "prev_q": qp, "consensus": cons[:30], "cheap": cheap,
                        "big": big[:30], "follow": {"curve": curve, "legs": legs}, "timeline": tl,
                        "groups": {"inst": prev.get("inst", []), "ppl": prev.get("ppl", [])}})
    print("고래", q, len(cons), len(curve), flush=True)


# ── 4. 조용한 매집: 돌파 + (한국) 외국인·기관 ───────────────────
def naver_flow(code):
    url = f"https://m.stock.naver.com/api/stock/{code}/integration"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"})
    with urllib.request.urlopen(req, timeout=15) as r:
        j = json.loads(r.read().decode("utf-8"))
    num = lambda s: float(str(s or "0").replace(",", "").replace("+", "") or 0)
    rows = j.get("dealTrendInfos") or []
    return [{"d": x.get("bizdate"), "f": num(x.get("foreignerPureBuyQuant")), "o": num(x.get("organPureBuyQuant")),
             "i": num(x.get("individualPureBuyQuant")), "fr": x.get("foreignerHoldRatio")} for x in rows[:10]]


def accum():
    days = sorted(d for d in os.listdir(os.path.join(ARC, "accum")) if re.match(r"20\d\d-\d\d-\d\d$", d)) if os.path.isdir(os.path.join(ARC, "accum")) else []
    if not days:
        return
    cal = {}
    for d in days[-30:]:
        for r in jl(os.path.join(ARC, "accum", d, "list.json"), []) or []:
            cal.setdefault(r["code"], {"name": r.get("name"), "mkt": r.get("mkt"), "days": {}})["days"][d] = r.get("score")
    latest = jl(os.path.join(ARC, "accum", days[-1], "list.json"), []) or []
    syms = []
    for r in latest:
        y = ysym(r["code"])
        syms += [y, y[:-3] + ".KQ"] if y.endswith(".KS") else [y]
    load_prices(syms)
    out = []
    for r in latest:
        y = ysym(r["code"])
        px = PX.get(y) if PX.get(y) is not None else PX.get(y[:-3] + ".KQ") if y.endswith(".KS") else None
        o = {"code": r["code"]}
        if px is not None and len(px) > 25:
            prior = px.iloc[-21:-1]
            box_hi = float(prior["High"].max())
            box_lo = float(prior["Low"].min())
            last = float(px["Close"].iloc[-1])
            o.update({"box_hi": r2(box_hi, 4), "box_lo": r2(box_lo, 4), "last": r2(last, 4), "brk": last > box_hi,
                      "to_brk": r2((box_hi / last - 1) * 100), "spark": [r2(v, 4) for v in px["Close"].iloc[-60:].values]})
        if r.get("mkt") == "KR" or re.fullmatch(r"\d{6}(\.K[SQ])?", r["code"]):
            try:
                o["flow"] = naver_flow(r["code"][:6])
                time.sleep(0.4)
            except Exception as e:
                print("수급 실패", r["code"], e)
        out.append(o)
    sec = {}
    for r in latest:
        sec[r.get("sector") or "미분류"] = sec.get(r.get("sector") or "미분류", 0) + 1
    js("accum_x.json", {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "date": days[-1], "items": out, "calendar": cal,
                        "days": days[-30:], "sectors": sorted(sec.items(), key=lambda x: -x[1])})
    print("매집", len(out), flush=True)


# ── 5. 미국 장 전 갭 후보 ─────────────────────────────────────
def premarket():
    et = dt.datetime.now(dt.timezone(dt.timedelta(hours=-4)))
    if not (4 <= et.hour < 10 and et.weekday() < 5):
        return
    import yfinance as yf
    import pandas as pd
    watch = {}
    def add(code, name, why):
        if code and re.fullmatch(r"[A-Z][A-Z.\-]{0,6}", code):
            watch.setdefault(code, {"name": name, "why": set()})["why"].add(why)
    for cat, fn, keys, why in (("cup", "cards.json", ["top", "ath"], "컵"), ("gap", "cards.json", ["top"], "갭")):
        ds = sorted(glob.glob(os.path.join(ARC, cat, "20*", fn)))
        if ds:
            j = jl(ds[-1], {})
            for k in keys:
                for r in j.get(k) or []:
                    add(r.get("code"), r.get("name"), why)
    ds = sorted(glob.glob(os.path.join(ARC, "accum", "20*", "list.json")))
    for r in (jl(ds[-1], []) if ds else []):
        add(r.get("code"), r.get("name"), "매집")
    wx = jl(os.path.join(OUT, "whale_x.json"), {}) or {}
    for c in (wx.get("consensus") or [])[:20]:
        add(c["t"], c["t"], "고래")
    cs = sorted(glob.glob(os.path.join(ARC, "sector", "20*", "compass.json")))
    comp = (jl(cs[-1], {}) if cs else {}) or {}
    for s in ((comp.get("markets") or {}).get("US") or {}).get("top_cap", []):
        add(s["s"], s["n"], "대형주")
    syms = list(watch)
    if not syms:
        return
    out = []
    for i in range(0, len(syms), 100):
        part = syms[i:i + 100]
        try:
            df = yf.download(part, period="5d", interval="5m", prepost=True, group_by="ticker", progress=False, threads=True)
        except Exception as e:
            print("프리마켓 실패", e)
            continue
        for s in part:
            try:
                sub = (df[s] if isinstance(df.columns, pd.MultiIndex) else df)["Close"].dropna()
                idx = sub.index.tz_convert("America/New_York")
                today = idx[-1].date()
                reg_prev = sub[(idx.date < today) & (idx.time >= dt.time(9, 30)) & (idx.time < dt.time(16, 0))]
                pre = sub[(idx.date == today) & (idx.time < dt.time(9, 30))]
                if not len(reg_prev) or not len(pre):
                    continue
                pc, pp = float(reg_prev.iloc[-1]), float(pre.iloc[-1])
                g = (pp / pc - 1) * 100
                if abs(g) >= 2:
                    out.append({"s": s, "n": watch[s]["name"], "why": sorted(watch[s]["why"]), "prev": r2(pc), "pre": r2(pp), "gap": r2(g)})
            except Exception:
                continue
    out.sort(key=lambda x: -abs(x["gap"]))
    js("premarket.json", {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "et": et.strftime("%m/%d %H:%M"), "n_watch": len(syms), "items": out[:40]})
    print("프리마켓", len(out), flush=True)


# ── 6. 시황 리포트에 나온 종목 ─────────────────────────────────
STOP_KO = {"나스닥", "다우존스", "코스피", "코스닥", "연준", "골드만", "모건스탠리", "블룸버그", "로이터", "트럼프", "중국", "미국", "일본", "홍콩", "한국은행", "원달러"}
STOP_EN = {"CEO", "GDP", "CPI", "PPI", "FOMC", "ETF", "USD", "KRW", "AI", "PER", "EPS", "IPO", "PCE", "ISM", "PMI", "YTD", "ATH", "VIX", "FED", "THE", "AND",
           "FOR", "BLS", "CME", "CNBC", "WTI", "ECB", "BOJ", "BOK", "SEC", "IMF", "OPEC", "HBM", "DRAM", "NAND", "TV", "AM", "PM", "WK", "HOL", "KST", "ET", "US",
           "EU", "UK", "JP", "CN", "HK", "KR", "OK", "VS", "Q1", "Q2", "Q3", "Q4", "AMP", "NOT", "ALL", "NEW", "ONE", "TWO", "SO", "IT", "ON", "BE", "AT", "GO"}


def market_chips():
    idx = None
    try:
        with urllib.request.urlopen("https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/idx.json", timeout=40) as r:
            idx = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print("idx 실패", e)
        return
    # 이름 → 심볼 (두 글자 이상 한글 이름, 흔한 단어 제외)
    kr = {}
    for r in idx:
        if len(r) > 5 and r[5] == "E":
            continue
        nm = r[1]
        if r[2] == "KR" and len(nm) >= 3:
            kr[nm] = r[0]
        if r[2] != "KR" and re.fullmatch(r"[가-힣]{3,}", nm or "") and nm not in STOP_KO:
            kr.setdefault(nm, r[0])
    kr["하이닉스"] = "000660.KS"
    # 영문 티커는 시가총액 200억 달러 이상만 (짧은 영어 단어와 헷갈리지 않게)
    us = set()
    try:
        with urllib.request.urlopen("https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/sec.json", timeout=40) as r:
            sec = json.loads(r.read().decode("utf-8"))
        us = {k for k, v in sec.items() if "." not in k and (v[2] or 0) >= 2e10}
    except Exception as e:
        print("sec 실패", e)
    pat = re.compile("(?<![가-힣A-Za-z])(" + "|".join(re.escape(n) for n in sorted(kr, key=len, reverse=True)) + ")")
    out = {}
    for d in sorted(os.listdir(os.path.join(ARC, "market")))[-40:]:
        folder = os.path.join(ARC, "market", d)
        if not os.path.isdir(folder):
            continue
        txt = ""
        for f in os.listdir(folder):
            if f.endswith((".txt", ".md")):
                txt += open(os.path.join(folder, f), encoding="utf-8", errors="ignore").read() + "\n"
            if f == "data.json":
                def walk(o):
                    if isinstance(o, str):
                        return [o]
                    if isinstance(o, dict):
                        return sum((walk(v) for v in o.values()), []) + [k for k in o if isinstance(k, str)]
                    if isinstance(o, list):
                        return sum((walk(v) for v in o), [])
                    return []
                txt += "\n".join(walk(jl(os.path.join(folder, f), {}) or {}))
        txt = re.sub(r"<[^>]+>", " ", txt)
        if not txt:
            continue
        cnt = {}
        for m in pat.finditer(txt):
            sym = kr[m.group(1)]
            nm = m.group(1) if m.group(1) != "하이닉스" else "SK하이닉스"
            cnt[sym] = (nm, cnt.get(sym, ("", 0))[1] + 1)
        for m in re.finditer(r"(?<![A-Za-z$])\$?([A-Z]{2,5})(?![A-Za-z])", txt):
            t = m.group(1)
            if t in us and t not in STOP_EN and (len(t) >= 3 or t in {"MU", "GE", "GM", "MA", "HD", "KO", "PG", "BA", "MS"}):
                cnt[t] = (t, cnt.get(t, ("", 0))[1] + 1)
        names = {r[0]: r[1] for r in idx}
        out[d] = [[s, names.get(s, n), c] for s, (n, c) in sorted(cnt.items(), key=lambda x: -x[1][1])[:24]]
    js("market_x.json", {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "chips": out})
    print("시황 종목", len(out), flush=True)


# ── 7. 알림 (ntfy 무료 푸시 + 텔레그램 선택) ────────────────────
SENT_P = os.path.join(OUT, "sent.json")


def push(topic, title, msg, tab, key, tags="chart_with_upwards_trend"):
    sent = jl(SENT_P, {}) or {}
    if key in sent:
        return
    body = {"topic": TOPIC + topic, "title": title, "message": msg, "tags": [tags], "click": APP + "#" + tab}
    try:
        req = urllib.request.Request("https://ntfy.sh/", data=json.dumps(body).encode("utf-8"), headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=15).read()
    except Exception as e:
        print("ntfy 실패", e)
        return
    tok, chat = os.environ.get("TG_TOKEN"), os.environ.get("TG_CHAT")
    if tok and chat:
        try:
            data = urllib.parse.urlencode({"chat_id": chat, "text": f"{title}\n{msg}\n{APP}#{tab}"}).encode()
            urllib.request.urlopen(f"https://api.telegram.org/bot{tok}/sendMessage", data=data, timeout=15).read()
        except Exception as e:
            print("텔레그램 실패", e)
    sent[key] = TODAY
    # 30일 지난 기록은 지우기
    cut = (NOW - dt.timedelta(days=30)).strftime("%Y-%m-%d")
    sent = {k: v for k, v in sent.items() if v >= cut}
    json.dump(sent, open(SENT_P, "w", encoding="utf-8"), ensure_ascii=False)


def alerts():
    import urllib.parse  # noqa: F401  (push 에서 사용)
    first_run = not os.path.exists(SENT_P)
    if first_run:
        json.dump({}, open(SENT_P, "w"))
    # 컵: 돌파 임박(피벗까지 2% 이내) · 오늘 돌파
    ds = sorted(glob.glob(os.path.join(ARC, "cup", "20*", "cards.json")))
    if ds:
        day = os.path.basename(os.path.dirname(ds[-1]))
        j = jl(ds[-1], {})
        near = [r for r in j.get("top") or [] if r.get("dist") is not None and -2 <= r["dist"] < 0 and not r.get("brk")]
        brk = [r for r in j.get("top") or [] if r.get("brk") and r.get("brkday") == day]
        if near:
            push("cup", f"☕ 컵 돌파 임박 {len(near)}종목", ", ".join(f"{r['name'][:14]} ({r['dist']:+.1f}%)" for r in near[:6]), "cup", f"cupnear:{day}")
        if brk:
            push("cup", f"☕ 컵 돌파 {len(brk)}종목", ", ".join(r["name"][:14] for r in brk[:8]), "cup", f"cupbrk:{day}")
    # 갭: 새로 나온 갭 돌파
    ds = sorted(glob.glob(os.path.join(ARC, "gap", "20*", "cards.json")))
    if ds:
        day = os.path.basename(os.path.dirname(ds[-1]))
        new = [r for r in (jl(ds[-1], {}).get("top") or []) if r.get("new")]
        if new:
            push("gap", f"📈 새 갭 돌파 {len(new)}종목", ", ".join(f"{r['name'][:14]} 갭 {r.get('gap', 0):.0f}%" for r in new[:6]), "gap", f"gapnew:{day}")
    # 매집: 박스 상단 돌파
    ax = jl(os.path.join(OUT, "accum_x.json"), {}) or {}
    names = {}
    ds = sorted(glob.glob(os.path.join(ARC, "accum", "20*", "list.json")))
    if ds:
        names = {r["code"]: r.get("name", r["code"]) for r in jl(ds[-1], []) or []}
    b = [x for x in ax.get("items") or [] if x.get("brk")]
    if b:
        push("accum", f"🤫 매집 종목 돌파 {len(b)}", ", ".join(names.get(x["code"], x["code"])[:14] for x in b[:6]), "accum", f"accbrk:{ax.get('date')}:" + ",".join(sorted(x["code"] for x in b)))
    # 나침반: 국면이 바뀐 시장
    ds = sorted(glob.glob(os.path.join(ARC, "sector", "20*", "compass.json")))
    if len(ds) >= 2:
        a, bb = jl(ds[-2], {}) or {}, jl(ds[-1], {}) or {}
        for k, m in (bb.get("markets") or {}).items():
            pm = (a.get("markets") or {}).get(k)
            if pm and pm.get("regime") != m.get("regime"):
                push("compass", f"🧭 {m['flag']} {m['name']} 국면 변화", f"{pm['regime']} → {m['regime']} · {m.get('summary', '')[:120]}", "sector", f"reg:{k}:{m['date']}")
    # 고래: 새 히어로
    ds = sorted(glob.glob(os.path.join(ARC, "whale", "20*", "data.json")))
    if len(ds) >= 2:
        h0 = ((jl(ds[-2], {}) or {}).get("signals") or {}).get("hero")
        h1 = ((jl(ds[-1], {}) or {}).get("signals") or {}).get("hero")
        if h1 and h1 != h0:
            push("whale", "🐋 오늘의 고래 픽 변경", f"{h0 or '-'} → {h1}", "whale", f"hero:{os.path.basename(os.path.dirname(ds[-1]))}")
    # 미국 장 전 갭
    pm = jl(os.path.join(OUT, "premarket.json"), {}) or {}
    big = [x for x in pm.get("items") or [] if abs(x["gap"]) >= 4]
    if big and pm.get("updated", "")[:10] == TODAY:
        push("gap", f"🌅 미국 장 전 갭 {len(big)}종목", ", ".join(f"{x['s']} {x['gap']:+.1f}%" for x in big[:8]), "gap", f"pre:{TODAY}")
    # 단타: 장중 알람 묶음 (실시간 알람은 텔레그램 봇이 따로 보냄)
    ds = sorted(glob.glob(os.path.join(ARC, "danta", "20*", "alerts.json")))
    if ds:
        day = os.path.basename(os.path.dirname(ds[-1]))
        rows = jl(ds[-1], []) or []
        if day == TODAY and rows:
            push("danta", f"⚡ 오늘 단타 알람 {len(rows)}건 (시험 중)", ", ".join(f"{r['time']} {r['name']}" for r in rows[-8:]), "danta", f"danta:{day}:{len(rows)}")


def run(fn, *a):
    try:
        fn(*a)
    except Exception:
        print("실패", fn.__name__)
        traceback.print_exc()


if __name__ == "__main__":
    import urllib.parse  # noqa: F401
    run(perf, "cup", "cards.json", ["top", "ath"], cup_extra)
    run(perf, "gap", "cards.json", ["top"], gap_extra)
    run(perf, "accum", "list.json", [])
    run(danta)
    run(whale)
    run(accum)
    run(premarket)
    run(market_chips)
    run(alerts)
    print("extras ok")
