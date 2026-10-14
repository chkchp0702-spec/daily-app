"""
🔎 아침 거르기 — 전 종목(약 2만 7천)을 매일 아침 네 가지 거름망으로 (10/14 사용자: "2번 빼고 다 만들자")
  1 quiet  조용히 돈 들어오는 종목: 최근 20일 가격 폭이 그 앞 20일보다 좁아졌는데, 최근 10일 중 3일 이상 거래대금이 평소(그 앞 20일 평균)의 1.5배
  3 lead   섹터 1등주: 시장마다 최근 20일 시장보다 가장 강한 세부 섹터 3개 → 그 안에서 52주 고점 5% 안 + 20일선 위
  4 hush   조용한 신고가: 52주 신고가인데 거래대금은 50일 평균의 1.5배가 안 됨 (아직 사람들이 몰리지 않음)
  5 triple 고래 + 임원 + 차트: 13F 고래 신규 편입 + 최근 90일 임원 공개시장 매수 + 50일선 위 (미국)
build_prices.py 가 받은 일봉(종가·고가·저가·거래량)을 그대로 받아 → <dest>/screens.json
사는 추천이 아니라 「살펴볼 후보」 목록이다.
"""
import datetime as dt
import glob
import json
import os
import re
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from subsec import sub_of  # noqa: E402

CUR = {"US": "USD", "KR": "KRW", "JP": "JPY", "CN": "CNY", "HK": "HKD"}
MIN_TV = 1.0e9          # 최근 20일 평균 거래대금 10억 원 이상만 (너무 작은 종목은 빼기)
PER_MKT = 8             # 시장마다 최대 몇 개
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0 Safari/537.36"}


def _r(v, d=1):
    return None if v is None or v != v else round(float(v), d)


def _junk(name, ind, mkt):
    if re.search(r"스팩|Shell|셸|기업인수목적", ind or "") or re.search(r"Acquisition|애퀴지션|스팩|기업인수목적", name or ""):
        return True
    if mkt == "KR" and re.search(r"우[A-Z]?$|우\(.*\)$", name or ""):
        return True
    return False


def whale_new(src):
    """13F 고래 신규 편입 종목 → {심볼: [고래 이름...]}"""
    out = defaultdict(list)
    if not src or not os.path.isdir(src):
        return out
    days = sorted(glob.glob(os.path.join(src, "data", "days", "20*.json")))
    if days:
        try:
            d = json.load(open(days[-1], encoding="utf-8"))
            for who, v in (d.get("detail") or {}).items():
                for s in v.get("new", []) or []:
                    out[s].append(who)
        except Exception as e:
            print("고래 일자료 실패", e, flush=True)
    try:
        sig = json.load(open(os.path.join(src, "data", "signals.json"), encoding="utf-8"))
        qs = sorted(sig, key=lambda q: (q.split()[-1], q.split()[0]))[-2:]     # 최근 두 분기 큰 신규
        for q in qs:
            for s, v in sig[q].items():
                for who in v.get("by", []):
                    if who not in out[s]:
                        out[s].append(who)
    except Exception as e:
        print("고래 신규 실패", e, flush=True)
    return out


def insider_buys(days=90, min_k=50):
    """OpenInsider 최근 90일 임원 공개시장 매수 → {심볼: {"n": 건수, "v": 금액, "last": 날짜, "who": 이름}}"""
    import urllib.request
    url = ("http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=0&fdr=&td=0&tdr="
           f"&fdlyl=&fdlyh=&daysago={days}&xp=1&vl={min_k}&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999"
           "&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=2000&page=1")
    txt = ""
    for u in (url, url.replace("http://", "https://")):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r:
                txt = r.read().decode("utf-8", "ignore")
            if "tinytable" in txt:
                break
        except Exception as e:
            print("임원 매수 받기 실패", u[:30], e, flush=True)
    out = {}
    tbl = re.search(r'<table class="tinytable">(.*?)</table>', txt, re.S)
    if not tbl:
        return None
    for tr in re.findall(r"<tr>(.*?)</tr>", tbl.group(1), re.S)[1:]:
        c = [re.sub(r"<[^>]+>", "", x).strip() for x in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
        if len(c) < 13 or not c[7].startswith("P"):
            continue
        sym = c[3].upper().replace(".", "-")
        try:
            v = abs(float(re.sub(r"[^\d.]", "", c[12]) or 0))
        except ValueError:
            v = 0
        o = out.setdefault(sym, {"n": 0, "v": 0.0, "last": "", "who": ""})
        o["n"] += 1
        o["v"] += v
        if c[2][:10] > o["last"]:
            o["last"], o["who"] = c[2][:10], (c[5] + " (" + c[6][:12] + ")")
    return out


def insider_yahoo(syms, days=90, min_v=50_000):
    """OpenInsider 를 못 받으면: 후보 몇십 종목만 야후 내부자 거래로 (공개시장 매수 Purchase 만)"""
    import yfinance as yf
    import pandas as pd
    out, cut = {}, pd.Timestamp.now() - pd.Timedelta(days=days)
    import time
    st = {"ok": 0, "fail": 0}
    for s in syms:
        df = None
        for k in range(3):                          # 전 종목을 받은 직후라 야후가 잠깐 막을 수 있음 → 쉬었다 다시
            try:
                df = yf.Ticker(s).insider_transactions
                if df is not None:
                    break
                time.sleep(3 * (k + 1))
            except Exception as e:
                print("내부자 재시도", s, str(e)[:80], flush=True)
                time.sleep(5 * (k + 1))
        if df is None:
            st["fail"] += 1
            continue
        st["ok"] += 1
        if not len(df):
            continue
        for _, r in df.iterrows():
            txt = str(r.get("Text") or "") + " " + str(r.get("Transaction") or "")
            if "Purchase" not in txt:
                continue
            d = pd.to_datetime(r.get("Start Date"), errors="coerce")
            v = float(r.get("Value") or 0) if r.get("Value") == r.get("Value") else 0.0
            if d is pd.NaT or d != d or d < cut or v < min_v:
                continue
            o = out.setdefault(s.replace(".", "-"), {"n": 0, "v": 0.0, "last": "", "who": ""})
            o["n"] += 1; o["v"] += v
            ds = d.strftime("%Y-%m-%d")
            if ds > o["last"]:
                o["last"], o["who"] = ds, f"{str(r.get('Insider') or '').title()} ({str(r.get('Position') or '')[:12]})"
    print("야후 내부자", st, "매수", len(out), flush=True)
    insider_yahoo.st = st
    return out


def build(px, mkt_of, dest, fx=None, whale_src=None, meta=None, names=None):
    """px: {심볼: pandas DataFrame(c,h,l,v) 최근 1년 일봉}"""
    import pandas as pd
    if meta is None:
        from compass import load_meta, load_names
        meta, names = load_meta(dest), load_names(dest)
    names = names or {}
    fx = fx or {}
    now = dt.datetime.utcnow() + dt.timedelta(hours=9)
    res = {"updated": now.strftime("%Y-%m-%d %H:%M"), "date": now.strftime("%Y-%m-%d"), "n": 0,
           "quiet": [], "lead": [], "lead_sec": {}, "hush": [], "triple": [], "notes": {}}
    by_m = defaultdict(list)
    for s, f in px.items():
        if s in mkt_of:
            by_m[mkt_of[s]].append(s)
    W = whale_new(whale_src)
    old = {}
    try:
        old = json.load(open(os.path.join(dest, "screens.json"), encoding="utf-8"))
    except Exception:
        pass
    # ⑤ 임원 매수 확인은 따로 (python opdb/screens.py --triple) — 전 종목을 받은 직후엔 야후가 내부자 표를 비워 보냄
    res["triple"] = old.get("triple", []); res["notes"]["triple"] = old.get("notes", {}).get("triple", "임원 매수 확인 전")
    res["tri_date"] = old.get("tri_date", "")
    for mkt in ["US", "KR", "JP", "CN", "HK"]:
        syms = by_m.get(mkt, [])
        if len(syms) < 50:
            continue
        rate = fx.get(CUR[mkt], 1.0) or 1.0
        last_all = max(px[s].index[-1] for s in syms)
        rows = []
        for s in syms:
            f = px[s]
            if len(f) < 60 or (last_all - f.index[-1]).days > 4:
                continue
            m = meta.get(s) or ["", "", 0]
            nm = names.get(s, s)
            if not m[0] or _junk(nm, m[1], mkt):          # 섹터 정보 없는 것(ETF·펀드 등)은 빼기
                continue
            c, h, l, v = f["c"], f["h"], f["l"], f["v"].fillna(0)
            tv = c * v * rate                              # 거래대금 (원)
            tv20 = float(tv.iloc[-20:].mean())
            if tv20 < MIN_TV or float(c.iloc[-1]) <= 0:
                continue
            last = float(c.iloc[-1])
            ma20, ma50 = float(c.iloc[-20:].mean()), float(c.iloc[-50:].mean())
            hi52 = float(c.iloc[-252:].max())
            r20 = last / float(c.iloc[-21]) - 1
            r1 = last / float(c.iloc[-2]) - 1
            rows.append({"s": s, "n": nm, "m": mkt, "sec": m[0], "ind": m[1], "cap": m[2] or 0, "c": last,
                         "r1": r1, "r20": r20, "ma20": ma20, "ma50": ma50, "hi52": hi52, "tv20": tv20,
                         "c_": c, "h_": h, "l_": l, "tv_": tv})
        res["n"] += len(rows)
        if not rows:
            continue
        med20 = sorted(x["r20"] for x in rows)[len(rows) // 2]

        def item(x, **k):
            sub = sub_of(x["sec"], x["ind"])
            d = {"s": x["s"], "n": x["n"], "m": mkt, "sub": (sub[1] + " " + sub[2]) if sub else (x["ind"] or ""),
                 "c": _r(x["c"], 4), "r1": _r(x["r1"] * 100), "r20": _r(x["r20"] * 100),
                 "hi": _r((x["c"] / x["hi52"] - 1) * 100), "tv": _r(x["tv20"] / 1e8, 0)}
            d.update(k)
            return d

        # ① 조용히 돈 들어오는 종목
        q = []
        for x in rows:
            c, h, l, tv = x["c_"], x["h_"], x["l_"], x["tv_"]
            if len(c) < 45:
                continue
            rng_now = (float(h.iloc[-20:].max()) - float(l.iloc[-20:].min())) / x["c"]
            rng_bef = (float(h.iloc[-40:-20].max()) - float(l.iloc[-40:-20].min())) / float(c.iloc[-21])
            base = float(tv.iloc[-30:-10].mean())
            if base <= 0 or rng_bef <= 0:
                continue
            hot = int((tv.iloc[-10:] >= base * 1.5).sum())
            shrink = rng_now / rng_bef
            r10 = x["c"] / float(c.iloc[-11]) - 1
            if hot >= 3 and shrink < 0.8 and rng_now <= 0.25 and -0.05 <= r10 <= 0.10 and x["c"] >= x["ma50"]:
                q.append(item(x, hot=hot, shrink=_r(shrink * 100, 0), rng=_r(rng_now * 100), tvx=_r(float(tv.iloc[-10:].mean()) / base, 2)))
        q.sort(key=lambda d: (-d["hot"], d["shrink"]))
        res["quiet"] += q[:PER_MKT]

        # ③ 섹터 1등주 — 20일 상대강도(시장 중간값 대비) 상위 세부 섹터 3개
        grp = defaultdict(list)
        for x in rows:
            sub = sub_of(x["sec"], x["ind"])
            if sub:
                grp[sub[0]].append((x, sub))
        secs = []
        for k, it in grp.items():
            if len(it) < 8:
                continue
            rr = sorted(x["r20"] for x, _ in it)
            secs.append((rr[len(rr) // 2] - med20, k, it))
        secs.sort(key=lambda t: -t[0])
        top = secs[:3]
        res["lead_sec"][mkt] = [{"k": k, "name": it[0][1][1] + " " + it[0][1][2], "rs": _r(rs * 100), "n": len(it)} for rs, k, it in top]
        ld = []
        for rs, k, it in top:
            for x, sub in it:
                if len(x["c_"]) >= 200 and x["c"] >= x["hi52"] * 0.95 and x["c"] > x["ma20"]:
                    ld.append(item(x, rs=_r(rs * 100)))
        ld.sort(key=lambda d: -(d["r20"] or 0))
        res["lead"] += ld[:PER_MKT]

        # ④ 조용한 신고가 — 52주 신고가 + 거래대금은 아직 조용 + 큰 종목(사람들이 다 아는) 제외
        caps = sorted((x["cap"] for x in rows if x["cap"]), reverse=True)
        big_cut = caps[min(len(caps) - 1, 50)] if len(caps) > 60 else float("inf")
        hu = []
        for x in rows:
            tv = x["tv_"]
            if len(tv) < 200 or x["c"] < x["hi52"] * 0.999:
                continue
            a50 = float(tv.iloc[-51:-1].mean())
            if a50 <= 0:
                continue
            t1, t5 = float(tv.iloc[-1]) / a50, float(tv.iloc[-5:].mean()) / a50
            if x["c"] > float(x["c_"].iloc[-60:-3].max()) * 1.001 and t1 < 1.5 and t5 < 1.5 and (x["cap"] or 0) < big_cut and x["r1"] < 0.08:
                hu.append(item(x, t1=_r(t1, 2), t5=_r(t5, 2)))
        hu.sort(key=lambda d: d["t5"])
        res["hush"] += hu[:PER_MKT]

        # ⑤ 고래 + 50일선 위 후보 (미국) — 임원 매수는 --triple 단계에서
        if mkt == "US" and W:
            res["tri_cand"] = [item(x, wh=(W.get(x["s"]) or W.get(x["s"].replace(".", "-")))[:3], ma50=_r((x["c"] / x["ma50"] - 1) * 100))
                               for x in rows if (x["s"] in W or x["s"].replace(".", "-") in W) and x["c"] > x["ma50"]]
            res["tri_n"] = len(W)
    for k in ("quiet", "lead", "hush"):
        res["notes"][k] = f"{len(res[k])}개"
    json.dump(res, open(os.path.join(dest, "screens.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("아침 거르기", {k: len(res[k]) for k in ("quiet", "lead", "hush", "triple")}, "대상", res["n"], flush=True)
    return res


def triple(dest):
    """⑤ 고래 신규 + 50일선 위 후보(tri_cand) 중 최근 90일 임원 공개시장 매수가 있는 종목 → screens.json 의 triple"""
    p = os.path.join(dest, "screens.json")
    res = json.load(open(p, encoding="utf-8"))
    cand = res.get("tri_cand") or []
    if not cand:
        print("⑤ 후보 없음", flush=True); return
    INS, src = insider_buys(), "OpenInsider"
    if INS is None:
        INS = insider_yahoo([c["s"] for c in cand]); src = "야후"
        st = getattr(insider_yahoo, "st", {})
        res["diag"] = {"ins": st, "cand": len(cand), "buys": len(INS)}
        if st.get("ok", 0) < max(1, len(cand) // 2):
            res["notes"]["triple"] = (res["notes"].get("triple", "") .split(" · 오늘")[0] + " · 오늘은 임원 매수 자료를 못 받아 지난번 목록").strip(" ·")
            json.dump(res, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":")); return
    tr = []
    for c in cand:
        ins = INS.get(c["s"].replace(".", "-"))
        if ins:
            d = dict(c); d.update(ins_n=ins["n"], ins_v=_r(ins["v"] / 1e6, 2), ins_last=ins["last"], ins_who=ins["who"]); tr.append(d)
    tr.sort(key=lambda d: -(d["ins_v"] or 0))
    res["triple"] = tr[:15]; res["tri_date"] = res.get("date", "")
    res["notes"]["triple"] = f"고래 신규 {res.get('tri_n', '?')}종목 → 50일선 위 {len(cand)}종목 → 최근 90일 임원 매수(5만 달러 이상, {src}) {len(tr)}종목"
    json.dump(res, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("⑤ 고래+임원+차트", len(tr), flush=True)


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("--dest", required=True); ap.add_argument("--triple", action="store_true")
    a = ap.parse_args()
    if a.triple:
        triple(a.dest)
