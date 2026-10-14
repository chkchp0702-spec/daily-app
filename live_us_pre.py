"""
🌙 미국 개장 전 나침반 — 미국 정규장(뉴욕 09:30~16:00)이 닫혀 있는 동안 (uspre.yml, 10분마다)
  10/14 사용자 「미국장이 개장 전일 때 선물과 아시아·다른 나라에서 거래된 정보·섹터·종목 가격을 가져와
               낮에도 이 시간에도 미국장의 현재 나침반을 볼 수 있도록」
  ① 미 지수 선물(S&P·나스닥·다우·러셀) → 선물로 본 예상 개장
  ② 금리·달러·유가·금·비트코인 (밤낮 거래되는 것)
  ③ 지금 열린/방금 닫힌 세계 증시 (아시아·유럽)
  ④ 미국 섹터의 「해외 거울」 — 같은 업종 해외 대장주가 오늘 어떻게 움직였나 (반도체 = TSMC·도쿄일렉·하닉·ASML …)
  ⑤ 미국 종목 시간외 가격 (애프터 → 프리마켓, 시가총액 큰 300종목) — 섹터별·많이 오른/내린 종목
  → archive/x/live_us_pre.json
  python live_us_pre.py          (정규장 시간이면 바로 끝)
  FORCE=1 python live_us_pre.py  (정규장이어도 돌림)
"""
import datetime as dt
import json
import os
import statistics
import time
import urllib.request
from collections import defaultdict
from zoneinfo import ZoneInfo

from subsec import sub_of

KST = dt.timezone(dt.timedelta(hours=9))
NYZ = ZoneInfo("America/New_York")
NOW = dt.datetime.now(KST)
NY = NOW.astimezone(NYZ)
FORCE = os.environ.get("FORCE") == "1"
OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"
OUT = os.path.join("archive", "x", "live_us_pre.json")
N_EXT = 300
EPS = 0.05

FUT = [("ES=F", "S&P500 선물", "^GSPC"), ("NQ=F", "나스닥100 선물", "^NDX"), ("YM=F", "다우 선물", "^DJI"), ("RTY=F", "러셀2000 선물", "^RUT")]
MACRO = [("ZN=F", "미 10년물 국채 선물", "가격↑ = 금리↓"), ("DX-Y.NYB", "달러 인덱스", ""), ("KRW=X", "원/달러", ""), ("JPY=X", "엔/달러", ""),
         ("BZ=F", "브렌트유", ""), ("CL=F", "WTI", ""), ("GC=F", "금", ""), ("HG=F", "구리", ""), ("BTC-USD", "비트코인", "")]
# 세계 증시: (티커, 이름, 국기, 현지 시간대, 개장, 마감)
WORLD = [("^KS11", "코스피", "🇰🇷", "Asia/Seoul", 900, 1530), ("^N225", "닛케이225", "🇯🇵", "Asia/Tokyo", 900, 1530),
         ("^TWII", "대만 가권", "🇹🇼", "Asia/Taipei", 900, 1330), ("^HSI", "항셍", "🇭🇰", "Asia/Hong_Kong", 930, 1610),
         ("000001.SS", "상해종합", "🇨🇳", "Asia/Shanghai", 930, 1500), ("^AXJO", "호주 ASX200", "🇦🇺", "Australia/Sydney", 1000, 1600),
         ("^NSEI", "인도 니프티", "🇮🇳", "Asia/Kolkata", 915, 1530), ("^STOXX50E", "유로스톡스50", "🇪🇺", "Europe/Berlin", 900, 1730),
         ("^GDAXI", "독일 DAX", "🇩🇪", "Europe/Berlin", 900, 1730), ("^FTSE", "영국 FTSE", "🇬🇧", "Europe/London", 800, 1630)]
# 미국 섹터의 해외 거울 (미국 ETF, 아이콘, 이름, [(티커, 이름)])
MIRROR = [
    ("SOXX", "🔌", "반도체", [("2330.TW", "TSMC"), ("8035.T", "도쿄일렉트론"), ("6857.T", "어드밴테스트"), ("000660.KS", "SK하이닉스"), ("005930.KS", "삼성전자"), ("ASML.AS", "ASML")]),
    ("AI서버", "🖥️", "AI 서버·부품", [("2317.TW", "폭스콘"), ("2382.TW", "콴타"), ("3231.TW", "위스트론"), ("6981.T", "무라타")]),
    ("IGV", "☁️", "소프트웨어·인터넷", [("SAP.DE", "SAP"), ("0700.HK", "텐센트"), ("9988.HK", "알리바바"), ("9984.T", "소프트뱅크G")]),
    ("XLE", "🛢️", "에너지", [("SHEL.L", "셸"), ("BP.L", "BP"), ("TTE.PA", "토탈에너지"), ("0883.HK", "CNOOC")]),
    ("XLF", "🏦", "금융", [("HSBA.L", "HSBC"), ("BNP.PA", "BNP파리바"), ("UBSG.SW", "UBS"), ("8306.T", "미쓰비시UFJ")]),
    ("CARZ", "🚗", "자동차·EV", [("7203.T", "토요타"), ("1211.HK", "BYD"), ("VOW3.DE", "폭스바겐"), ("005380.KS", "현대차")]),
    ("XLV", "💊", "헬스케어", [("NOVO-B.CO", "노보노디스크"), ("AZN.L", "아스트라제네카"), ("ROG.SW", "로슈"), ("4502.T", "다케다")]),
    ("XLI", "🏭", "산업재·방산", [("SIE.DE", "지멘스"), ("AIR.PA", "에어버스"), ("RHM.DE", "라인메탈"), ("6501.T", "히타치")]),
    ("XLB", "⛏️", "소재·원자재", [("BHP.AX", "BHP"), ("RIO.L", "리오틴토"), ("GLEN.L", "글렌코어")]),
    ("XLY", "🛍️", "소비재·명품", [("MC.PA", "LVMH"), ("NESN.SW", "네슬레"), ("9983.T", "패스트리테일링")]),
]
TZ_OF = {".T": "Asia/Tokyo", ".TW": "Asia/Taipei", ".KS": "Asia/Seoul", ".HK": "Asia/Hong_Kong", ".AX": "Australia/Sydney",
         ".L": "Europe/London", ".DE": "Europe/Berlin", ".PA": "Europe/Paris", ".AS": "Europe/Amsterdam", ".SW": "Europe/Zurich", ".CO": "Europe/Copenhagen"}


def get(url, timeout=60):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def us_regular_open():
    hm = NY.hour * 100 + NY.minute
    return NY.weekday() < 5 and 930 <= hm < 1600


def phase():
    """지금 미국 시간외 구간 이름"""
    hm, wd = NY.hour * 100 + NY.minute, NY.weekday()
    if wd < 5 and 400 <= hm < 930:
        return "pre", "프리마켓 (뉴욕 04:00~09:30)"
    if wd < 5 and 1600 <= hm < 2000:
        return "after", "애프터마켓 (뉴욕 16:00~20:00)"
    return "night", "미국 주식 쉬는 시간 — 선물·해외 시장으로 봄"


def daily(syms):
    import yfinance as yf
    df = yf.download(syms, period="10d", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
    out = {}
    for s in syms:
        try:
            sub = df[s]["Close"].dropna()
            if len(sub) < 2:
                continue
            out[s] = {"last": float(sub.iloc[-1]), "prev": float(sub.iloc[-2]), "date": sub.index[-1].strftime("%Y-%m-%d")}
        except Exception:
            continue
    return out


def tz_today(tz):
    return NOW.astimezone(ZoneInfo(tz)).strftime("%Y-%m-%d")


def state_of(tz, op, cl, date):
    """그 시장이 지금 열렸나 / 오늘 마감 / 전일"""
    loc = NOW.astimezone(ZoneInfo(tz))
    hm = loc.hour * 100 + loc.minute
    if date != loc.strftime("%Y-%m-%d"):
        return "prev"                       # 오늘 아직 안 열림(또는 휴장) — 숫자는 지난 장
    if loc.weekday() < 5 and op <= hm < cl + 10:
        return "live"
    return "done"


def r2(v, n=2):
    return None if v is None else round(v, n)


def ext_hours(sec, names):
    """미국 시가총액 큰 종목의 시간외 가격 (마지막 정규장 종가 대비)"""
    import yfinance as yf
    cand = sorted([(s, v) for s, v in sec.items() if "." not in s and "^" not in s and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1][2])[:N_EXT]
    syms = [s for s, _ in cand]
    df = yf.download(syms, period="5d", interval="15m", prepost=True, group_by="ticker", auto_adjust=False, progress=False, threads=True)
    try:
        df.index = df.index.tz_convert(NYZ)
    except Exception:
        df.index = df.index.tz_localize("UTC").tz_convert(NYZ)
    rows = []
    for s, v in cand:
        try:
            sub = df[s][["Close", "Volume"]].dropna(subset=["Close"])
            if sub.empty:
                continue
            hm = sub.index.hour * 100 + sub.index.minute
            reg = sub[(hm >= 930) & (hm < 1600)]
            if reg.empty:
                continue
            base_t, base = reg.index[-1], float(reg["Close"].iloc[-1])
            ext = sub[sub.index > base_t]
            if ext.empty:
                continue                     # 정규장 뒤 거래 없음
            last_t, last = ext.index[-1], float(ext["Close"].iloc[-1])
            if (NY - last_t.to_pydatetime()).total_seconds() > 30 * 3600:
                continue                     # 너무 오래된 시간외 가격
            rows.append({"c": s, "n": names.get(s, s), "p": round(last, 2), "base": round(base, 2), "r": (last / base - 1) * 100,
                         "v": float(ext["Volume"].sum() or 0) * last, "cap": v[2] or 0, "sec": v[0], "ind": v[1],
                         "lt": last_t.strftime("%m-%d %H:%M"), "pre": last_t.date() > base_t.date()})
        except Exception:
            continue
    if not rows:
        return None
    up = sum(1 for x in rows if x["r"] > EPS)
    dn = sum(1 for x in rows if x["r"] < -EPS)
    st = lambda x: {"s": x["c"], "n": x["n"], "r": round(x["r"], 2), "p": x["p"]}
    by_s, SUBI = defaultdict(list), {}
    for x in rows:
        k = sub_of(x["sec"], x["ind"])
        if k:
            by_s[k[0]].append(x); SUBI[k[0]] = k
    sectors = []
    for k, items in by_s.items():
        if len(items) >= 3:
            tw = sum(x["cap"] for x in items) or 1
            big = sorted(items, key=lambda x: -x["cap"])
            sectors.append({"k": k, "icon": SUBI[k][1], "name": SUBI[k][2], "n": len(items), "r": round(sum(x["r"] * x["cap"] for x in items) / tw, 2),
                            "up": sum(1 for x in items if x["r"] > EPS), "down": sum(1 for x in items if x["r"] < -EPS), "big": [st(x) for x in big[:3]]})
    sectors.sort(key=lambda x: -x["r"])
    pre_n = sum(1 for x in rows if x["pre"])
    big = sorted(rows, key=lambda x: -x["cap"])[:16]
    return {"n": len(rows), "cand": len(cand), "up": up, "down": dn, "flat": len(rows) - up - dn,
            "median": round(statistics.median(x["r"] for x in rows), 2), "pre_n": pre_n,
            "last": max(x["lt"] for x in rows), "sectors": sectors,
            "gain": [st(x) for x in sorted(rows, key=lambda x: -x["r"])[:8]],
            "loss": [st(x) for x in sorted(rows, key=lambda x: x["r"])[:8]],
            "big": [st(x) for x in big],
            "value": [dict(st(x), v=round(x["v"] / 1e6)) for x in sorted(rows, key=lambda x: -x["v"])[:10]]}


def main():
    if not FORCE and us_regular_open():
        print("미국 정규장 — 🌙 개장 전 나침반은 쉼 (⚡ live_us.json 이 맡음)")
        return
    ph, ph_lab = phase()
    syms = [f[0] for f in FUT] + [f[2] for f in FUT] + [m[0] for m in MACRO] + [w[0] for w in WORLD] + [s for m in MIRROR for s, _ in m[3]]
    D = daily(list(dict.fromkeys(syms)))
    fut = []
    for s, nm, ix in FUT:
        d, b = D.get(s), D.get(ix)
        if not d:
            continue
        chg = (d["last"] / d["prev"] - 1) * 100
        x = {"s": s, "name": nm, "last": r2(d["last"]), "chg": r2(chg), "date": d["date"]}
        if b:
            x["ix_close"], x["est"] = r2(b["last"]), r2(b["last"] * (1 + chg / 100))   # 현물 종가 × 선물 등락 = 대략의 예상 개장
        fut.append(x)
    macro = []
    for s, nm, hint in MACRO:
        d = D.get(s)
        if d:
            macro.append({"s": s, "name": nm, "last": r2(d["last"], 3), "chg": r2((d["last"] / d["prev"] - 1) * 100), "date": d["date"], "hint": hint})
    world = []
    for s, nm, fl, tz, op, cl in WORLD:
        d = D.get(s)
        if d:
            world.append({"s": s, "name": nm, "flag": fl, "last": r2(d["last"]), "chg": r2((d["last"] / d["prev"] - 1) * 100), "date": d["date"],
                          "st": state_of(tz, op, cl, d["date"])})
    mirror = []
    for etf, ic, nm, lst in MIRROR:
        its = []
        for s, n in lst:
            d = D.get(s)
            if not d:
                continue
            tz = next((v for k, v in TZ_OF.items() if s.endswith(k)), "Asia/Seoul")
            its.append({"s": s, "n": n, "r": r2((d["last"] / d["prev"] - 1) * 100), "p": r2(d["last"]), "today": d["date"] == tz_today(tz)})
        if its:
            tod = [x["r"] for x in its if x["today"]]
            mirror.append({"etf": etf, "icon": ic, "name": nm, "r": r2(statistics.mean(tod)) if tod else None,
                           "r_all": r2(statistics.mean(x["r"] for x in its)), "n_today": len(tod), "items": its})
    mirror.sort(key=lambda x: -(x["r"] if x["r"] is not None else x["r_all"] - 100))
    ext = None
    try:
        sec = get(OPD + "sec.json")
        names = {}
        try:
            names = {r[0]: r[1] for r in get(OPD + "idx.json", timeout=90)}
        except Exception as e:
            print("이름 실패", e)
        ext = ext_hours(sec, names)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("시간외 실패", e)
    # 한 줄 판정 — 선물 S&P·나스닥 평균
    fc = [f["chg"] for f in fut[:2] if f.get("chg") is not None]
    avg = statistics.mean(fc) if fc else 0
    tone = "강세 출발 예상" if avg >= 0.5 else "약세 출발 예상" if avg <= -0.5 else "보합 출발 예상"
    out = {"at": int(time.time() * 1000), "t": NOW.strftime("%H:%M"), "date": NOW.strftime("%Y-%m-%d"), "ny": NY.strftime("%m-%d %H:%M"),
           "phase": ph, "phase_lab": ph_lab, "tone": tone, "tone_chg": r2(avg), "fut": fut, "macro": macro, "world": world,
           "mirror": mirror, "ext": ext,
           "note": "야후 시세(선물·해외 약 10~15분 늦음). 예상 개장 = 현물 종가 × 선물 등락 — 대략치. 해외 거울은 같은 업종 해외 대장주의 오늘 등락(아직 안 열린 시장은 지난 장)."}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("🌙 개장 전 나침반", out["t"], ph, tone, "선물", [(f["name"], f["chg"]) for f in fut], "시간외", ext and ext["n"])


if __name__ == "__main__":
    main()
