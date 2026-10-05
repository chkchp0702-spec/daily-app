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
                sub = sub[[c for c in ("Open", "Close", "High", "Low", "Volume") if c in sub.columns]].dropna(subset=["Close"])
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
    out["path"] = [r2((float(v) / p0 - 1) * 100, 1) for v in closes.values[:61]]      # 신호 뒤 60거래일 경로(%)
    for k in ("depth", "weeks", "handle", "rs", "gap", "vol", "boxw", "days"):
        if s.get(k) is not None and k not in out:
            out["f_" + k] = s.get(k)
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
    o = {"pivot": pv, "brk": bool(len(hit)), "brkd": hit.index[0].strftime("%Y-%m-%d") if len(hit) else ""}
    if len(hit):
        # 돌파 후 추적: 며칠째 · 돌파선 대비 최고 · 실패(종가가 돌파선 -8% 아래) / 성공(+20%)
        post = after[after.index >= hit.index[0]]
        mx = float(post["High"].max())
        fail = post[post["Close"] < pv * 0.92]
        o.update({"bdays": int(len(post) - 1), "bmax": r2((mx / pv - 1) * 100), "bnow": r2((float(post["Close"].iloc[-1]) / pv - 1) * 100),
                  "bst": "실패" if len(fail) else "성공" if mx >= pv * 1.2 else "진행",
                  "bfd": fail.index[0].strftime("%Y-%m-%d") if len(fail) else ""})
        full = PX.get(ysym(s["code"])) if PX.get(ysym(s["code"])) is not None else PX.get(ysym(s["code"])[:-3] + ".KQ") if ysym(s["code"]).endswith(".KS") else None
        if full is not None:
            i = list(full.index).index(hit.index[0]) if hit.index[0] in full.index else None
            if i is not None:
                w = full["Close"].iloc[max(0, i - 30): i + 31]
                o["bpath"] = [r2((float(v) / pv - 1) * 100, 1) for v in w.values]
                o["bpi"] = int(min(30, i))                                 # 돌파일 위치
    return o


def gap_extra(s, after, p0):
    lvl = s.get("boxhi")
    gd = s.get("gday") or s["d0"]
    import pandas as pd
    px = after[after.index >= pd.Timestamp(gd)]
    if not lvl or not len(px):
        return {}
    filled = px[px["Low"] <= lvl]
    full = PX.get(ysym(s["code"])) if PX.get(ysym(s["code"])) is not None else PX.get(ysym(s["code"])[:-3] + ".KQ") if ysym(s["code"]).endswith(".KS") else None
    pre = None
    if full is not None:
        b = full[full.index < pd.Timestamp(gd)]["Close"]
        if len(b) > 21:
            pre = (float(b.iloc[-1]) / float(b.iloc[-21]) - 1) * 100
    gt = gap_type(s, pre)
    return {"gday": gd, "gap": s.get("gap"), "vol": s.get("vol"), "fill_lvl": lvl, "filled": bool(len(filled)), "pre20": r2(pre), "gtype": gt,
            "filld": filled.index[0].strftime("%Y-%m-%d") if len(filled) else "",
            "fill_days": int((px.index < filled.index[0]).sum()) if len(filled) else None}


EARN = {}      # 미국 종목 실적 발표일 (갭 유형 '실적 갭' 판정용) — plus.py 가 채움


def gap_type(s, pre):
    """갭 유형: 실적 갭 / 돌파 갭(긴 횡보 뒤) / 소진 의심(이미 많이 오른 뒤) / 진행 갭"""
    gd = s.get("gday") or s.get("d0")
    for d in EARN.get(s.get("code"), []):
        try:
            if 0 <= (dt.date.fromisoformat(gd) - dt.date.fromisoformat(d)).days <= 3:
                return "실적 갭"
        except Exception:
            pass
    if pre is not None and pre >= 25:
        return "소진 의심"
    if (s.get("boxw") or 0) >= 4 and (pre is None or pre < 15):
        return "돌파 갭"
    return "진행 갭"


def accum_extra(s, after, p0):
    """매집 신호 뒤 박스(신호 전 20일 고점) 돌파 여부"""
    import pandas as pd
    full = PX.get(ysym(s["code"])) if PX.get(ysym(s["code"])) is not None else PX.get(ysym(s["code"])[:-3] + ".KQ") if ysym(s["code"]).endswith(".KS") else None
    if full is None:
        return {}
    before = full[full.index < pd.Timestamp(s["d0"])]
    if len(before) < 20:
        return {}
    box = float(before["High"].iloc[-20:].max())
    hit = after[after["High"] > box]
    return {"box": r2(box, 4), "abrk": bool(len(hit)), "abd": int((after.index < hit.index[0]).sum()) if len(hit) else None, "mdays": s.get("days")}


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
    if cat == "gap":
        # 갭 유형별 성적
        bt = {}
        for r in rows:
            if r.get("gtype"):
                bt.setdefault(r["gtype"], []).append(r)
        res["by_type"] = {k: dict(stats(v)["all"], fill=r2(sum(1 for r in v if r.get("filled")) / len(v) * 100, 0)) for k, v in bt.items()}
        # 갭 메움 확률표: 갭 크기 × 거래량
        def gb(r):
            g = r.get("gap") or 0
            return "갭 5% 미만" if g < 5 else "갭 5~10%" if g < 10 else "갭 10% 이상"
        def vb(r):
            return "거래량 3배 미만" if (r.get("vol") or 0) < 3 else "거래량 3배 이상"
        tbl = {}
        for r in g:
            tbl.setdefault(gb(r) + "|" + vb(r), []).append(r)
        def rate(v, n):
            v = [r for r in v if r["days"] >= n]
            return (r2(sum(1 for r in v if r["filled"] and r["fill_days"] is not None and r["fill_days"] <= n) / len(v) * 100, 0), len(v)) if v else (None, 0)
        res["fill_tbl"] = {k: {"n": len(v), "f5": rate(v, 5)[0], "f20": rate(v, 20)[0], "n5": rate(v, 5)[1]} for k, v in tbl.items()}
    if cat == "accum":
        bd = {}
        for r in rows:
            m = r.get("mdays") or 1
            k = "1~2일째" if m <= 2 else "3~5일째" if m <= 5 else "6~10일째" if m <= 10 else "11일째 이상"
            bd.setdefault(k, []).append(r)
        res["by_days"] = {k: dict(stats(v)["all"], brk=r2(sum(1 for r in v if r.get("abrk")) / len(v) * 100, 0)) for k, v in bd.items()}
        a = [r for r in rows if "abrk" in r]
        res["brk"] = {"n": len(a), "rate": r2(sum(1 for r in a if r["abrk"]) / len(a) * 100, 0) if a else None}
    if cat == "cup":
        c = [r for r in rows if "brk" in r]
        res["brk"] = {"n": len(c), "rate": r2(sum(1 for r in c if r["brk"]) / len(c) * 100, 0) if c else None}
        b = [r for r in c if r.get("bst")]
        res["post"] = {k: sum(1 for r in b if r["bst"] == k) for k in ("진행", "성공", "실패")}
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
                         "pnl": r2(pnl), "slot": "09시" if hh <= 9 else "10시" if hh == 10 else "11~12시" if hh <= 12 else "13시 이후",
                         "chg": r.get("chg"), "wd": "월화수목금토일"[dt.date.fromisoformat(d).weekday()]})
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
    pat = fail_patterns(rows)
    # 그날 코스닥 등락별 성적 (「오늘 같은 장」 승률)
    by_m, kq = {}, {}
    try:
        load_prices(["^KQ11"], period="6mo")
        k = PX.get("^KQ11")
        if k is not None:
            ch = k["Close"].pct_change() * 100
            kq = {d.strftime("%Y-%m-%d"): r2(v) for d, v in ch.dropna().items()}
    except Exception as e:
        print("코스닥 실패", e)
    def mb(v):
        return None if v is None else "코스닥 −1% 아래" if v < -1 else "코스닥 −1~0%" if v < 0 else "코스닥 0~+1%" if v < 1 else "코스닥 +1% 위"
    for r in rows:
        b = mb(kq.get(r["d"]))
        if b:
            r["kq"] = kq.get(r["d"])
            by_m.setdefault(b, []).append(r)
    mkt_order = ["코스닥 −1% 아래", "코스닥 −1~0%", "코스닥 0~+1%", "코스닥 +1% 위"]
    # 알람 되감기: 그날 1분 스냅샷(stock-screener data/days)에서 알람 전 30분 ~ 뒤 90분
    replay = {}
    try:
        import pandas as pd
        for f in glob.glob(os.path.join(SRC, "stock-screener", "data", "days", "*.csv.gz")):
            day = os.path.basename(f)[:8]
            dd = f"{day[:4]}-{day[4:6]}-{day[6:8]}"
            todays = [r for r in rows if r["d"] == dd]
            if not todays:
                continue
            m = pd.read_csv(f, dtype={"code": str, "t": str}, usecols=["t", "code", "종가"])
            for r in todays:
                sub = m[m["code"] == r["code"]].copy()
                if not len(sub):
                    continue
                sub["mi"] = sub["t"].str[:2].astype(int) * 60 + sub["t"].str[2:4].astype(int)
                at = int((r["time"] or "00:00")[:2]) * 60 + int((r["time"] or "00:00")[3:5])
                w = sub[(sub["mi"] >= at - 30) & (sub["mi"] <= at + 90)].drop_duplicates("mi")
                if len(w) >= 5:
                    replay[f'{r["d"]}|{r["time"]}|{r["code"]}'] = {"t0": at, "p": r["price"], "s": [[int(a - at), float(b)] for a, b in zip(w["mi"], w["종가"])],
                                                                   "stop": r.get("stp"), "t1": r.get("t1p")}
    except Exception as e:
        print("되감기 실패", e)
    best = {}
    for t, rs in by_t.items():
        best[t] = [dict(code=x["code"], name=x["name"], d=x["d"], time=x["time"], pnl=x["pnl"], hi=x["hi"], lo=x["lo"], now=x["now"]) for x in sorted(rs, key=lambda x: -(x["pnl"] or -99))[:3]]
    # 오늘 연속 손절 (가상 매매 기준, 시간 순)
    today = sorted([r for r in rows if r["d"] == max(r["d"] for r in rows)], key=lambda r: r["time"] or "")
    streak = 0
    for r in today:
        streak = streak + 1 if r["hits"] else 0
    day_pnl = r2(sum(r["pnl"] or 0 for r in today))
    js("danta_stats.json", {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "all": blk(rows),
                            "by_type": {k: blk(v) for k, v in sorted(by_t.items(), key=lambda x: -len(x[1]))},
                            "by_slot": {k: blk(by_h[k]) for k in order if k in by_h}, "quality": qual,
                            "patterns": pat, "by_mkt": {k: blk(by_m[k]) for k in mkt_order if k in by_m}, "kq": kq, "replay": replay, "best": best,
                            "today": {"d": today[0]["d"] if today else None, "n": len(today), "streak": streak, "pnl": day_pnl,
                                                       "stops": sum(1 for r in today if r["hits"])},
                            "equity": eq, "journal": sorted(rows, key=lambda r: (r["d"], r["time"] or ""), reverse=True)[:200]})
    print("단타", len(rows), flush=True)


def fail_patterns(rows):
    """손절 난 알람 vs 나머지 — 어떤 조건에서 손절이 많았나 (문장으로)"""
    loss = [r for r in rows if r["hits"]]
    rest = [r for r in rows if not r["hits"]]
    if len(loss) < 5 or len(rest) < 5:
        return {"n": len(loss), "lines": []}
    out = []
    avg = lambda v: sum(v) / len(v) if v else None
    lc, rc = avg([r["chg"] for r in loss if r.get("chg") is not None]), avg([r["chg"] for r in rest if r.get("chg") is not None])
    if lc is not None and rc is not None and abs(lc - rc) >= 1:
        out.append({"k": "당일 등락", "t": f"손절 난 알람은 알람 때 이미 평균 {lc:+.1f}% 올라 있었어요 (나머지 {rc:+.1f}%)." + (" 많이 오른 뒤 알람은 조심." if lc > rc else " 덜 오른 상태 알람이 오히려 약했어요.")})
    def share(key):
        res = []
        keys = sorted({r[key] for r in rows})
        for k in keys:
            n_all = sum(1 for r in rows if r[key] == k)
            n_l = sum(1 for r in loss if r[key] == k)
            if n_all >= 4:
                res.append((k, n_l / n_all * 100, n_all))
        return sorted(res, key=lambda x: -x[1])
    base = len(loss) / len(rows) * 100
    for key, nm in (("slot", "시간대"), ("type", "유형"), ("wd", "요일")):
        sh = share(key)
        if sh and sh[0][1] >= base + 10:
            k, v, n = sh[0]
            out.append({"k": nm, "t": f"{nm} '{k}' 알람의 손절 비율이 {v:.0f}%로 가장 높아요 (전체 {base:.0f}%, {n}건)."})
        if sh and len(sh) > 1 and sh[-1][1] <= base - 10:
            k, v, n = sh[-1]
            out.append({"k": nm, "t": f"반대로 '{k}'는 손절 비율 {v:.0f}%로 가장 낮아요 ({n}건)."})
    return {"n": len(loss), "base": r2(base, 0), "lines": out[:6]}


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


def whale_holdings():
    """유명 펀드·유명인별 보유 종목 (13F 최신 분기) → whale_holdings.json"""
    base = os.path.join(SRC, "whale40", "data")
    rk = jl(os.path.join(base, "ranking.json"), {}) or {}
    secmap = jl(os.path.join(base, "sectors.json"), {}) or {}
    names = {}
    try:
        with urllib.request.urlopen("https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/names_ko.json", timeout=40) as r:
            names = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print("names_ko 실패", e)
    cache = os.path.join(base, "cache", "13f")

    def load(fid):
        return jl(os.path.join(cache, fid + ".json"), None)

    def prev_fid(fid):
        m = re.match(r"^\d+-(.*)-q(\d)-(\d{4})$", fid or "")
        if not m:
            return None
        slug, qn, yr = m.group(1), int(m.group(2)), int(m.group(3))
        pq, py = (qn - 1, yr) if qn > 1 else (4, yr - 1)
        c = glob.glob(os.path.join(cache, f"*-{slug}-q{pq}-{py}.json"))
        return os.path.basename(sorted(c)[-1])[:-5] if c else None

    out = {}
    for grp in ("institutions", "people"):
        for m in rk.get(grp) or []:
            cur = load(m.get("fid"))
            if not cur:
                continue
            agg = {}
            for h in cur:
                t = (h.get("sym") or "").strip()
                if not t or t == "NONE":
                    continue
                a = agg.setdefault(t, {"v": 0.0, "sh": 0.0, "is": h.get("issuer", "")})
                a["v"] += h.get("value") or 0
                a["sh"] += h.get("shares") or 0
            pf_ = prev_fid(m.get("fid"))
            prev = {}
            for h in (load(pf_) or []) if pf_ else []:
                t = (h.get("sym") or "").strip()
                if t and t != "NONE":
                    prev[t] = prev.get(t, 0) + (h.get("shares") or 0)
            tot = sum(a["v"] for a in agg.values()) or 1
            items = []
            for t, a in sorted(agg.items(), key=lambda kv: -kv[1]["v"])[:30]:
                ps = prev.get(t)
                if not pf_:
                    chg, d = "", None
                elif not ps:
                    chg, d = "new", None
                else:
                    d = (a["sh"] / ps - 1) * 100
                    chg = "up" if d > 2 else "down" if d < -2 else "same"
                px = wpx(t)
                qe = at(px, qend(m["quarter"]), after=False)[1] if (px and m.get("quarter")) else None
                last = px[max(px)] if px else None
                items.append({"t": t, "nm": names.get(t) or a["is"].title()[:28], "v": r2(a["v"] * 1000, 0), "w": r2(a["v"] / tot * 100),
                              "chg": chg, "d": r2(d, 1) if d is not None else None,
                              "r": r2((last / qe - 1) * 100) if (qe and last) else None, "sec": secmap.get(t, "기타")})
            sold = [t for t in prev if t not in agg]
            sold.sort(key=lambda t: -(prev[t] or 0))
            sec = {}
            for t, a in agg.items():
                k = secmap.get(t, "기타")
                sec[k] = sec.get(k, 0) + a["v"] / tot * 100
            out[m["name"]] = {"g": "inst" if grp == "institutions" else "ppl", "rank": m.get("rank"), "ret1y": m.get("ret_1y"),
                              "ret1d": m.get("ret_1d"), "q": m.get("quarter"), "filed": m.get("filed"), "n": len(agg),
                              "val": r2(tot * 1000, 0), "items": items, "sold": [{"t": t, "nm": names.get(t, t)} for t in sold[:15]],
                              "n_new": sum(1 for x in items if x["chg"] == "new"),
                              "sec": [[k, r2(v, 1)] for k, v in sorted(sec.items(), key=lambda kv: -kv[1])[:8]]}
    js("whale_holdings.json", {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "m": out})
    print("고래 보유", len(out), flush=True)


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


QUIET = (23, 7)    # 공용 알림은 밤 11시 ~ 아침 7시에 소리 없이 (priority 2)
LOG_P = os.path.join(OUT, "push_log.json")


def quiet_now(q=QUIET):
    h = dt.datetime.now(KST).hour
    a, b = q
    return (a <= h or h < b) if a > b else (a <= h < b)


def log_push(topic, title, msg, tab, syms=None):
    lg = jl(LOG_P, []) or []
    lg.insert(0, {"t": dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "topic": topic, "title": title, "msg": msg[:300], "tab": tab,
                  "syms": syms or [], "lv": level_of(topic, title)})
    json.dump(lg[:300], open(LOG_P, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


LEVEL = {"hi": ("🔴", 4), "mid": ("🟡", 3), "lo": ("⚪", 2)}


def level_of(topic, title):
    """중요도: 🔴 지금 봐야 함 / 🟡 오늘 중 / ⚪ 참고"""
    t = title
    if any(k in t for k in ("돌파 ", "돌파 1", "목표가 도달", "손절가 도달", "연속 손절", "국면 변화", "매도 경보")) and "임박" not in t:
        return "hi"
    if topic in ("brief", "whale") or "요약" in t or "성적" in t:
        return "lo"
    return "mid"


def push(topic, title, msg, tab, key, tags="chart_with_upwards_trend", syms=None, quiet=QUIET, full_topic=None, log=True, level=None):
    sent = jl(SENT_P, {}) or {}
    if key in sent:
        return
    lv = level or level_of(topic, title)
    title = LEVEL[lv][0] + " " + title
    body = {"topic": full_topic or TOPIC + topic, "title": title, "message": msg, "tags": [tags], "click": APP + "#" + tab, "priority": LEVEL[lv][1]}
    if quiet and quiet_now(quiet):
        body["priority"] = 2
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
    if log:
        log_push(topic, title, msg, tab, syms)
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
            push("cup", f"☕ 컵 돌파 임박 {len(near)}종목", ", ".join(f"{r['name'][:14]} ({r['dist']:+.1f}%)" for r in near[:6]), "cup", f"cupnear:{day}", syms=[[r["code"], r.get("price")] for r in near[:6]])
        if brk:
            push("cup", f"☕ 컵 돌파 {len(brk)}종목", ", ".join(r["name"][:14] for r in brk[:8]), "cup", f"cupbrk:{day}", syms=[[r["code"], r.get("price")] for r in brk[:8]])
    # 갭: 새로 나온 갭 돌파
    ds = sorted(glob.glob(os.path.join(ARC, "gap", "20*", "cards.json")))
    if ds:
        day = os.path.basename(os.path.dirname(ds[-1]))
        new = [r for r in (jl(ds[-1], {}).get("top") or []) if r.get("new")]
        if new:
            push("gap", f"📈 새 갭 돌파 {len(new)}종목", ", ".join(f"{r['name'][:14]} 갭 {r.get('gap', 0):.0f}%" for r in new[:6]), "gap", f"gapnew:{day}", syms=[[r["code"], r.get("price")] for r in new[:6]])
    # 매집: 박스 상단 돌파
    ax = jl(os.path.join(OUT, "accum_x.json"), {}) or {}
    names = {}
    ds = sorted(glob.glob(os.path.join(ARC, "accum", "20*", "list.json")))
    if ds:
        names = {r["code"]: r.get("name", r["code"]) for r in jl(ds[-1], []) or []}
    b = [x for x in ax.get("items") or [] if x.get("brk")]
    if b:
        push("accum", f"🤫 매집 종목 돌파 {len(b)}", ", ".join(names.get(x["code"], x["code"])[:14] for x in b[:6]), "accum", f"accbrk:{ax.get('date')}:" + ",".join(sorted(x["code"] for x in b)), syms=[[x["code"], x.get("last")] for x in b[:6]])
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
            push("whale", "🐋 오늘의 고래 픽 변경", f"{h0 or '-'} → {h1}", "whale", f"hero:{os.path.basename(os.path.dirname(ds[-1]))}", syms=[[h1, None]])
    # 미국 장 전 갭
    pm = jl(os.path.join(OUT, "premarket.json"), {}) or {}
    big = [x for x in pm.get("items") or [] if abs(x["gap"]) >= 4]
    if big and pm.get("updated", "")[:10] == TODAY:
        push("gap", f"🌅 미국 장 전 갭 {len(big)}종목", ", ".join(f"{x['s']} {x['gap']:+.1f}%" for x in big[:8]), "gap", f"pre:{TODAY}", syms=[[x["s"], x["pre"]] for x in big[:8]])
    # 단타: 장중 알람 묶음 (실시간 알람은 텔레그램 봇이 따로 보냄)
    ds = sorted(glob.glob(os.path.join(ARC, "danta", "20*", "alerts.json")))
    if ds:
        day = os.path.basename(os.path.dirname(ds[-1]))
        rows = jl(ds[-1], []) or []
        if day == TODAY and rows:
            push("danta", f"⚡ 오늘 단타 알람 {len(rows)}건 (시험 중)", ", ".join(f"{r['time']} {r['name']}" for r in rows[-8:]), "danta", f"danta:{day}:{len(rows)}", syms=[[r["code"], r.get("price")] for r in rows[-8:]], quiet=None)


def run(fn, *a):
    try:
        fn(*a)
    except Exception:
        print("실패", fn.__name__)
        traceback.print_exc()


if __name__ == "__main__":
    import urllib.parse  # noqa: F401
    EARN.update((jl(os.path.join(OUT, "earn_cache.json"), {}) or {}).get("d", {}))
    run(perf, "cup", "cards.json", ["top", "ath"], cup_extra)
    run(perf, "gap", "cards.json", ["top"], gap_extra)
    run(perf, "accum", "list.json", [], accum_extra)
    run(danta)
    run(whale)
    run(whale_holdings)
    run(accum)
    run(premarket)
    run(market_chips)
    run(alerts)
    try:
        import plus
        plus.main(sys.modules[__name__])
    except Exception:
        traceback.print_exc()
    print("extras ok")
