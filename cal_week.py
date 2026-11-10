"""📅 이번 주 달력 (11/10 냉정 분석 3차 #9 — 인베스팅닷컴식)
  ① 경제 지표: 이번 주 미국·한국·중국·일본 중요(High) 일정 — faireconomy 주간 달력(공개 JSON) → 한국 시각·한글 이름
  ② 실적: 앞으로 7일 미국 대형주(시총 1,000억 달러↑) + 앱 포트 종목 + ⭐ 관심종목 — 나스닥 실적 달력
  ③ 앱이 이미 가진 것: 시황리포트 schedule · earn_cal.json(신호·관심 종목 실적)
  → archive/x/cal_week.json  (돈·AI 안 씀 · cal.yml 하루 2번)
"""
import datetime as dt
import json
import os
import re
import urllib.request

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
OUT = os.path.join("archive", "x", "cal_week.json")
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "Accept": "application/json, text/plain, */*"}
MSR = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/"

KO = [  # 영어 지표 이름 → 쉬운 한글 (앞에서부터 먼저 맞는 것)
    (r"Core CPI", "근원 소비자물가(CPI)"), (r"CPI", "소비자물가(CPI)"), (r"Core PPI", "근원 생산자물가(PPI)"), (r"PPI", "생산자물가(PPI)"),
    (r"Core PCE", "근원 PCE 물가"), (r"PCE", "PCE 물가"), (r"Non-Farm|Nonfarm", "비농업 고용"), (r"Unemployment Rate", "실업률"),
    (r"Unemployment Claims|Jobless", "주간 실업수당 청구"), (r"ADP", "ADP 민간 고용"), (r"JOLTS", "구인 건수(JOLTS)"),
    (r"FOMC.*(Minutes)", "FOMC 회의록"), (r"FOMC|Federal Funds Rate", "FOMC 금리 결정"), (r"Fed Chair|Powell", "연준 의장 연설"),
    (r"Retail Sales", "소매판매"), (r"ISM Manufacturing", "ISM 제조업 지수"), (r"ISM Services|ISM Non-Manufacturing", "ISM 서비스업 지수"),
    (r"Flash Manufacturing PMI", "제조업 PMI(예비)"), (r"Flash Services PMI", "서비스업 PMI(예비)"), (r"Manufacturing PMI", "제조업 PMI"),
    (r"Advance GDP|Prelim GDP|Final GDP|GDP", "GDP 성장률"), (r"Consumer Sentiment|UoM", "미시간대 소비심리"), (r"CB Consumer Confidence", "소비자신뢰지수"),
    (r"Durable Goods", "내구재 주문"), (r"Housing Starts", "주택 착공"), (r"Existing Home Sales", "기존 주택 판매"), (r"New Home Sales", "신규 주택 판매"),
    (r"Trade Balance", "무역수지"), (r"Industrial Production", "산업생산"), (r"BOJ|Monetary Policy Statement", "일본은행 금리 결정"),
    (r"Treasury.*Auction|Bond Auction", "국채 입찰"), (r"Industrial Production", "산업생산"), (r"Bank Holiday", "휴장"),
]
CC = {"USD": "🇺🇸", "KRW": "🇰🇷", "CNY": "🇨🇳", "JPY": "🇯🇵", "EUR": "🇪🇺"}
MEGA = {"NVDA", "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "META", "TSLA", "AVGO", "TSM", "BRK.B", "JPM", "WMT", "LLY", "V", "ORCL", "MA", "NFLX",
        "XOM", "COST", "PLTR", "AMD", "HD", "PG", "JNJ", "BAC", "ABBV", "CRM", "KO", "ASML", "CSCO", "MU", "ARM", "BABA", "PDD", "SNOW", "CRWV", "ADBE", "INTC", "QCOM", "AMAT", "LRCX", "TXN"}


def http(u, t=30):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t) as r:
        return r.read().decode("utf-8", errors="ignore")


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def ko(t):
    for pat, k in KO:
        if re.search(pat, t, re.I):
            m = re.search(r"\b(m/m|y/y|q/q)\b", t)
            return k + ({"m/m": " (전월비)", "y/y": " (전년비)", "q/q": " (전분기비)"}.get(m.group(1), "") if m else "")
    return t


def econ():
    out = []
    try:
        J = json.loads(http("https://nfs.faireconomy.media/ff_calendar_thisweek.json"))
    except Exception as e:
        print("경제 달력 실패", e); return out
    for x in J:
        cur, imp = x.get("country"), x.get("impact")
        if cur not in CC or imp not in ("High",) and not (cur in ("KRW", "CNY") and imp == "Medium"):
            continue
        try:
            t = dt.datetime.fromisoformat(x["date"]).astimezone(KST)
        except Exception:
            continue
        nm = x.get("title") or ""
        out.append({"d": t.strftime("%Y-%m-%d"), "t": t.strftime("%H:%M") if t.strftime("%H:%M") != "00:00" else "", "f": CC[cur], "n": ko(nm), "en": nm,
                    "fc": x.get("forecast") or "", "pv": x.get("previous") or "", "imp": imp})
    return sorted(out, key=lambda e: (e["d"], e["t"] or "99"))


def earnings(watch):
    out, seen = [], set()
    for k in range(0, 8):
        d = (NOW + dt.timedelta(days=k)).date()
        if d.weekday() >= 5:
            continue
        try:
            J = json.loads(http(f"https://api.nasdaq.com/api/calendar/earnings?date={d.isoformat()}"))
            rows = ((J.get("data") or {}).get("rows")) or []
        except Exception as e:
            print("실적 달력 실패", d, e); continue
        for r in rows:
            s = (r.get("symbol") or "").upper()
            try:
                mc = float(re.sub(r"[^\d.]", "", r.get("marketCap") or "") or 0)
            except Exception:
                mc = 0
            if s in seen or not (s in MEGA or s in watch or mc >= 1e11):
                continue
            seen.add(s)
            tm = {"time-pre-market": "장 전", "time-after-hours": "장 뒤"}.get(r.get("time") or "", "")
            # 미국 장 뒤 실적 → 한국은 다음 날 아침에 반영
            out.append({"d": d.isoformat(), "s": s, "n": (r.get("name") or s)[:30], "tm": tm, "mc": round(mc / 1e9), "w": s in watch,
                        "eps": r.get("epsForecast") or ""})
    return out


def main():
    U = jl(os.path.join("archive", "x", "users.json"), {}) or {}
    watch = {str(it[0]).upper() for u in U.values() for it in (u.get("wl") or []) if not re.fullmatch(r"\d{6}.*", str(it[0]))}
    try:
        P = json.loads(http(MSR + "market/port.json"))
        for h in P.get("hold") or []:
            for c in h.get("check") or []:
                if c.get("t") and re.fullmatch(r"[A-Z.]{1,6}", c["t"]):
                    watch.add(c["t"])
    except Exception as e:
        print("포트 종목 실패", e)
    ec, er = econ(), earnings(watch)
    old = jl(OUT, {}) or {}
    if not ec and old.get("econ"):          # 한 번 실패하면 지난 것 유지(이번 주 것만)
        mon = (NOW - dt.timedelta(days=NOW.weekday())).strftime("%Y-%m-%d")
        ec = [e for e in old["econ"] if e["d"] >= mon]
    if not er and old.get("earn"):
        er = [e for e in old["earn"] if e["d"] >= NOW.strftime("%Y-%m-%d")]
    json.dump({"at": NOW.strftime("%Y-%m-%d %H:%M"), "econ": ec, "earn": er,
               "note": "경제 지표 시각은 한국 시각 · 미국 장 뒤 실적은 한국 다음 날 아침에 반영 · 자료: faireconomy 주간 달력 · 나스닥 실적 달력"},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("경제", len(ec), "실적", len(er))


if __name__ == "__main__":
    main()
