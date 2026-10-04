"""
나침반: 5개 시장(미국·한국·일본·중국·홍콩)의 하루 흐름
  - 상승/하락/보합 종목 수 (오늘 + 최근 40거래일)
  - 대표 지수 흐름 + 20·60일선 → 상승장/하락장/횡보장
  - 52주 신고가·신저가 종목 수
  - 섹터(11개)·업종별 등락 + 대표 종목
build_prices.py 가 받은 일봉(종가 Series)을 그대로 받아 계산한다 → <dest>/compass.json
"""
import datetime as dt
import glob
import json
import os
from collections import defaultdict

MKT_NAME = {"US": "미국", "KR": "한국", "JP": "일본", "CN": "중국", "HK": "홍콩"}
MKT_FLAG = {"US": "🇺🇸", "KR": "🇰🇷", "JP": "🇯🇵", "CN": "🇨🇳", "HK": "🇭🇰"}
INDEX = {
    "US": [("^GSPC", "S&P 500"), ("^IXIC", "나스닥")],
    "KR": [("^KS11", "코스피"), ("^KQ11", "코스닥")],
    "JP": [("^N225", "닛케이 225")],
    "CN": [("000001.SS", "상해종합"), ("399001.SZ", "선전성분")],
    "HK": [("^HSI", "항셍")],
}
SECTOR_KO = {
    "Technology": ("💻", "IT·기술"), "Financial Services": ("🏦", "금융"), "Healthcare": ("💊", "헬스케어"),
    "Consumer Cyclical": ("🛍️", "경기소비재"), "Consumer Defensive": ("🛒", "필수소비재"), "Industrials": ("🏭", "산업재"),
    "Communication Services": ("📡", "통신·미디어"), "Energy": ("🛢️", "에너지"), "Basic Materials": ("⛏️", "소재"),
    "Utilities": ("⚡", "유틸리티"), "Real Estate": ("🏢", "부동산"),
}
EPS = 0.0005   # ±0.05% 이내는 보합


def _r(v, d=2):
    return None if v is None or v != v else round(float(v), d)


def load_meta(dest):
    """d/*.json → {심볼: (섹터, 업종(한글), 시가총액)} — 무거우니 sec.json 으로 캐시"""
    cache = os.path.join(dest, "sec.json")
    files = glob.glob(os.path.join(dest, "d", "*.json"))
    if os.path.exists(cache) and len(files) < 100:
        return json.load(open(cache, encoding="utf-8"))
    out = {}
    for f in files:
        try:
            r = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        sym = r.get("ticker", {}).get("symbol")
        if not sym:
            continue
        ind = (r.get("industry_ko") or r.get("industry") or "").strip()
        out[sym] = [r.get("sector") or "", ind, r.get("market_cap") or 0]
    if out:
        json.dump(out, open(cache, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return out


def load_names(dest):
    p = os.path.join(dest, "idx.json")
    if not os.path.exists(p):
        return {}
    return {r[0]: r[1] for r in json.load(open(p, encoding="utf-8"))}


def regime(closes):
    """지수 종가 리스트(1년) → (국면, 이유, ma20 리스트, ma60 마지막)"""
    import pandas as pd
    s = pd.Series(closes)
    ma20 = s.rolling(20).mean()
    ma60 = s.rolling(60).mean()
    c, m20, m60 = s.iloc[-1], ma20.iloc[-1], ma60.iloc[-1]
    slope = (ma20.iloc[-1] / ma20.iloc[-11] - 1) * 100 if len(s) > 31 else 0
    if m60 != m60:
        return "횡보장", "데이터가 짧아 판단 보류", ma20, None, slope
    above20, above60 = c > m20, c > m60
    if above20 and m20 > m60 and slope > 0.3:
        lab, why = "상승장", "지수가 20일선·60일선 위, 20일선이 오르는 중"
    elif (not above20) and m20 < m60 and slope < -0.3:
        lab, why = "하락장", "지수가 20일선·60일선 아래, 20일선이 내려가는 중"
    else:
        lab = "횡보장"
        if above60 and not above20:
            why = "60일선 위에서 숨 고르기 (20일선 아래)"
        elif above20 and not above60:
            why = "20일선은 회복, 60일선은 아직 아래"
        elif above20:
            why = "선들 위에 있지만 20일선 기울기가 평평"
        else:
            why = "선들 아래지만 하락 기울기가 완만"
    return lab, why, ma20, m60, slope


def index_block(mkt):
    import yfinance as yf
    out = []
    syms = [s for s, _ in INDEX[mkt]]
    try:
        df = yf.download(syms, period="1y", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
    except Exception as e:
        print("지수 실패", mkt, e, flush=True)
        return out
    import pandas as pd
    for s, nm in INDEX[mkt]:
        try:
            c = (df[s]["Close"] if isinstance(df.columns, pd.MultiIndex) else df["Close"]).dropna()
        except Exception:
            continue
        if len(c) < 25:
            continue
        lab, why, ma20, m60, slope = regime(list(c.values))
        tail = c.iloc[-60:]
        m20t = ma20.iloc[-60:]
        out.append({
            "sym": s, "name": nm, "date": c.index[-1].strftime("%Y-%m-%d"), "last": _r(c.iloc[-1]),
            "chg1": _r((c.iloc[-1] / c.iloc[-2] - 1) * 100), "chg5": _r((c.iloc[-1] / c.iloc[-6] - 1) * 100),
            "chg20": _r((c.iloc[-1] / c.iloc[-21] - 1) * 100),
            "chgYtd": _r((c.iloc[-1] / c[c.index.year < c.index[-1].year].iloc[-1] - 1) * 100) if (c.index.year < c.index[-1].year).any() else None,
            "hi52": _r(c.max()), "lo52": _r(c.min()),
            "dates": [d.strftime("%m/%d") for d in tail.index], "close": [_r(v) for v in tail.values],
            "ma20": [_r(v) for v in m20t.values], "ma60": _r(m60), "slope20": _r(slope),
            "regime": lab, "why": why,
        })
    return out


def build(daily, hl, mkt_of, dest):
    """daily: {심볼: pandas Series(최근 ~70일 종가)}, hl: {심볼: 1(52주 신고가)/-1(신저가)/0}"""
    import pandas as pd
    meta = load_meta(dest)
    names = load_names(dest)
    res = {"updated": dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
           "date": (dt.datetime.utcnow() + dt.timedelta(hours=9)).strftime("%Y-%m-%d"), "markets": {}}
    by_m = defaultdict(list)
    for s in daily:
        if s in mkt_of:
            by_m[mkt_of[s]].append(s)
    for mkt in ["US", "KR", "JP", "CN", "HK"]:
        syms = by_m.get(mkt, [])
        if len(syms) < 50:
            continue
        df = pd.DataFrame({s: daily[s] for s in syms})
        df.index = pd.to_datetime(df.index).normalize()
        df = df.groupby(level=0).last().sort_index()
        cnt = df.notna().sum(axis=1)
        df = df[cnt >= max(30, 0.3 * len(syms))]          # 거래일만
        if len(df) < 3:
            continue
        ret = df.pct_change(fill_method=None)
        last_day = df.index[-1]
        hist = []
        for d in ret.index[1:][-40:]:
            r = ret.loc[d].dropna()
            hist.append([d.strftime("%m/%d"), int((r > EPS).sum()), int((r < -EPS).sum()), int(((r >= -EPS) & (r <= EPS)).sum())])
        r1 = ret.iloc[-1]

        def nret(n):
            if len(df) <= n:
                return pd.Series(dtype=float)
            return (df.iloc[-1] / df.iloc[-1 - n] - 1)
        r5, r20 = nret(5), nret(20)
        today = r1.dropna()
        up, dn = int((today > EPS).sum()), int((today < -EPS).sum())
        flat = int(len(today) - up - dn)
        lim_up = int((today >= 0.295).sum()) if mkt == "KR" else int((today >= 0.095).sum()) if mkt == "CN" else None
        highs = sum(1 for s in today.index if hl.get(s) == 1)
        lows = sum(1 for s in today.index if hl.get(s) == -1)

        # 종목별 정보
        rows = []
        import re as _re
        for s in today.index:
            m = meta.get(s) or ["", "", 0]
            if mkt == "KR" and _re.search(r"우[A-Z]?$|우\(.*\)$", names.get(s, "")):
                continue                                   # 우선주는 대표 종목에서 빼기
            rows.append({"s": s, "n": names.get(s, s), "sec": m[0], "ind": m[1], "cap": m[2] or 0,
                         "r1": float(today[s]), "r5": float(r5.get(s)) if s in r5 and r5.get(s) == r5.get(s) else None,
                         "r20": float(r20.get(s)) if s in r20 and r20.get(s) == r20.get(s) else None})

        def wavg(items, k):
            vals = [(x[k], x["cap"]) for x in items if x[k] is not None]
            if not vals:
                return None
            tw = sum(max(c, 0) for _, c in vals)
            if tw > 0:
                return sum(v * max(c, 0) for v, c in vals) / tw * 100
            vs = sorted(v for v, _ in vals)
            return vs[len(vs) // 2] * 100

        def stock(x):
            return {"s": x["s"], "n": x["n"], "r1": _r(x["r1"] * 100), "r5": _r((x["r5"] or 0) * 100) if x["r5"] is not None else None}

        sec = defaultdict(list)
        for x in rows:
            if x["sec"] in SECTOR_KO:
                sec[x["sec"]].append(x)
        sectors = []
        for k, items in sec.items():
            if len(items) < 5:
                continue
            big = sorted(items, key=lambda x: -x["cap"])
            movers = sorted([x for x in big[: max(10, len(big) // 5)]], key=lambda x: -x["r1"])
            sectors.append({"k": k, "icon": SECTOR_KO[k][0], "name": SECTOR_KO[k][1], "n": len(items),
                            "up": sum(1 for x in items if x["r1"] > EPS), "down": sum(1 for x in items if x["r1"] < -EPS),
                            "r1": _r(wavg(items, "r1")), "r5": _r(wavg(items, "r5")), "r20": _r(wavg(items, "r20")),
                            "big": [stock(x) for x in big[:3]], "hot": [stock(x) for x in movers[:3]]})
        sectors.sort(key=lambda x: -(x["r1"] or -999))

        ind = defaultdict(list)
        for x in rows:
            if x["ind"]:
                ind[x["ind"]].append(x)
        inds = []
        for k, items in ind.items():
            if len(items) < 5:
                continue
            capsum = sum(x["cap"] for x in items)
            big = sorted(items, key=lambda x: -x["cap"])
            # 업종을 끌어올린 종목: 시가총액 × 등락
            contrib = sorted(items, key=lambda x: -(x["cap"] * x["r1"]))
            inds.append({"name": k, "n": len(items), "cap": capsum,
                         "up": sum(1 for x in items if x["r1"] > EPS), "down": sum(1 for x in items if x["r1"] < -EPS),
                         "r1": _r(wavg(items, "r1")), "r5": _r(wavg(items, "r5")),
                         "lead": [stock(x) for x in contrib[:3]], "big": [stock(x) for x in big[:2]]})
        # 너무 작은 업종 제외: 시가총액 상위 60% 업종 중에서 고르기
        inds.sort(key=lambda x: -x["cap"])
        pool = inds[: max(15, int(len(inds) * 0.6))]
        strong = sorted([x for x in pool if x["r1"] is not None], key=lambda x: -x["r1"])
        for x in strong:
            x.pop("cap", None)

        caps = sorted([x["cap"] for x in rows if x["cap"]], reverse=True)
        cut = caps[min(len(caps) - 1, max(30, len(caps) // 5))] if caps else 0
        large = [x for x in rows if x["cap"] >= cut and x["cap"]]
        leaders = sorted(large, key=lambda x: -x["r1"])[:8]
        laggards = sorted(large, key=lambda x: x["r1"])[:5]
        top_cap = sorted(rows, key=lambda x: -x["cap"])[:10]

        idx = index_block(mkt)
        reg = idx[0]["regime"] if idx else "횡보장"
        # 등락 비율로 보정 설명
        up10 = [h[1] / max(1, h[1] + h[2]) for h in hist[-10:]]
        breadth10 = round(sum(up10) / len(up10) * 100) if up10 else None
        mk = {
            "name": MKT_NAME[mkt], "flag": MKT_FLAG[mkt], "date": last_day.strftime("%Y-%m-%d"),
            "total": len(today), "up": up, "down": dn, "flat": flat, "limit_up": lim_up,
            "highs": highs, "lows": lows, "breadth_hist": hist, "breadth10": breadth10,
            "index": idx, "regime": reg,
            "median1": _r(float(today.median()) * 100),
            "sectors": sectors, "strong": strong[:8], "weak": list(reversed(strong[-5:])) if len(strong) > 8 else [],
            "leaders": [stock(x) for x in leaders], "laggards": [stock(x) for x in laggards],
            "top_cap": [stock(x) for x in top_cap],
        }
        # 52주 신고가 종목 (시가총액 큰 순) + 신고가가 많이 나온 업종
        hi_rows = sorted([x for x in rows if hl.get(x["s"]) == 1], key=lambda x: -x["cap"])
        mk["high_list"] = [stock(x) for x in hi_rows[:15]]
        hic = defaultdict(int)
        for x in hi_rows:
            if x["ind"]:
                hic[x["ind"]] += 1
        mk["high_inds"] = sorted(hic.items(), key=lambda kv: -kv[1])[:8]
        mk["fg"] = fear_greed(mk, mkt)
        mk["summary"] = summary(mk)
        res["markets"][mkt] = mk
        print("나침반", mkt, mk["date"], f"상승 {up} 하락 {dn}", reg, flush=True)
    json.dump(res, open(os.path.join(dest, "compass.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return res


def _vix():
    try:
        import yfinance as yf
        c = yf.download("^VIX", period="1mo", interval="1d", progress=False)["Close"].dropna()
        return float(c.iloc[-1].iloc[0] if hasattr(c.iloc[-1], "iloc") else c.iloc[-1])
    except Exception:
        return None


def fear_greed(m, mkt):
    """0(극단적 공포) ~ 100(극단적 탐욕): 등락 비율·신고가 비율·지수와 20일선 거리·20일 수익률 (+미국은 VIX)"""
    clamp = lambda v: max(0.0, min(100.0, v))
    parts = []
    if m.get("breadth10") is not None:
        parts.append(("최근 10일 상승 종목 비율", clamp((m["breadth10"] - 35) / 30 * 100), f"{m['breadth10']}%"))
    h, l = m.get("highs") or 0, m.get("lows") or 0
    if h + l >= 10:
        parts.append(("52주 신고가 vs 신저가", clamp(h / (h + l) * 100), f"{h} : {l}"))
    ix = (m.get("index") or [None])[0]
    if ix and ix.get("ma20") and ix["ma20"][-1]:
        gap = (ix["last"] / ix["ma20"][-1] - 1) * 100
        parts.append(("지수와 20일선 거리", clamp((gap + 5) / 10 * 100), f"{gap:+.1f}%"))
    if ix and ix.get("chg20") is not None:
        parts.append(("지수 20일 수익률", clamp((ix["chg20"] + 10) / 20 * 100), f"{ix['chg20']:+.1f}%"))
    if mkt == "US":
        v = _vix()
        if v:
            parts.append(("VIX(변동성)", clamp((35 - v) / 23 * 100), f"{v:.1f}"))
    if not parts:
        return None
    sc = round(sum(p[1] for p in parts) / len(parts))
    lab = "극단적 공포" if sc < 20 else "공포" if sc < 40 else "중립" if sc < 60 else "탐욕" if sc < 80 else "극단적 탐욕"
    return {"score": sc, "label": lab, "parts": [[p[0], round(p[1]), p[2]] for p in parts]}


def summary(m):
    """한 줄 해석"""
    up, dn = m["up"], m["down"]
    tot = max(1, up + dn)
    ratio = up / tot
    if ratio >= 0.65:
        mood = "오른 종목이 압도적으로 많은 날"
    elif ratio >= 0.55:
        mood = "오른 종목이 더 많은 날"
    elif ratio > 0.45:
        mood = "오른 종목과 내린 종목이 비슷한 날"
    elif ratio > 0.35:
        mood = "내린 종목이 더 많은 날"
    else:
        mood = "내린 종목이 압도적으로 많은 날"
    idx = m["index"][0] if m["index"] else None
    parts = [mood]
    if idx and idx.get("chg1") is not None:
        # 지수와 종목 수가 엇갈리면 짚어주기
        if idx["chg1"] > 0.3 and ratio < 0.45:
            parts.append(f"{idx['name']}는 {idx['chg1']:+.1f}% 올랐지만 대형주 위주 (중소형은 약세)")
        elif idx["chg1"] < -0.3 and ratio > 0.55:
            parts.append(f"{idx['name']}는 {idx['chg1']:+.1f}% 내렸지만 중소형주는 선방")
        else:
            parts.append(f"{idx['name']} {idx['chg1']:+.1f}%")
    s = m["sectors"]
    if s:
        best = [x["name"] for x in s[:2] if (x["r1"] or 0) > 0]
        worst = [x["name"] for x in s[-2:] if (x["r1"] or 0) < 0]
        if best:
            parts.append("·".join(best) + " 강세")
        if worst:
            parts.append("·".join(reversed(worst)) + " 약세")
    return ", ".join(parts) + "."
