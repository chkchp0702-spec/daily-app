"""💼 포트 설계기 · 🧲 닮은 날 자료 — 10/21 A10/21-1·2 (사용자 「다 좋다 다 진행해」)
   ① 포트 설계기: SPY·QQQ·GLD·BIL 배당 포함 수정종가(야후 auto_adjust) 2006~ → archive/x/port_px/<코드>.json (7일마다 · git 이 무거워지지 않게)
      앱이 휴대폰에서 💼 기본 규칙(200일선 국면 · 20일 변동성 맞춤 · 월 맞춤 · 회전 0.1%)을 그대로 돌림.
      check.json = 같은 자료·같은 규칙을 파이썬으로 돌린 값(앱 숫자 맞춤 검사용 · 실험실 market/lab/k1020_relief.json 「now」와 같은 규칙).
   ② 닮은 날: 코스피 지수(^KS11) 2000~ 종가 → archive/x/port_px/KOSPI.json (마지막 날이 바뀔 때만 새로 씀)
   파일 모양은 els_px 와 같음: {n, d0, dd:[날짜 간격(일)], c:[종가]}
   ③ 11/17 채권 (사용자 「포트 설계기에서 종목 추가뿐 아니라 미국채 브라질국채도 추가할수 있게」)
      · 미국채: IEF(7~10년)·TLT(20년+) 배당(이자) 포함 수정종가 — 달러
      · 브라질국채 BRBOND: 헤알 국채 값 ÷ 달러/헤알(BRL=X) = 달러 값(설계기 엔진이 달러 기준이라)
        헤알 국채 값 = IRF-M ETF(IRFM11.SA, 헤알 고정금리 국채 지수) 실제 값 · 그 ETF 가 없던 앞쪽은 Selic 기준금리(BCB SGS 432)로 매일 이자만 쌓은 근사(금리 변화로 값이 오르내린 것은 빠짐)
        index.json 의 BRBOND.src·splice 에 무엇을 썼는지 남김 → 앱이 그대로 보여 줌
   ④ 11/18 종목·ETF 섞기 (사용자 「포트 설계기에 개별종목이나 etf도 넣는 칸을 만들자」)
      · pool/<코드>.json — 자주 쓰는 종목·ETF(SEED) 를 7일마다 + 앱에서 고른 새 종목은 요청(ntfy 주제 REQ_TOPIC)을 15분마다 받아 바로
      · 값 = 야후 배당 포함 수정종가(auto_adjust) ÷ 그 나라 환율 → 달러 값(설계기 엔진이 달러 기준 · 세금 칸이 다시 원화로 바꿈)
      · pool/index.json: assets{코드: f·from·to·n·at·name·mkt·cur} · bad{코드: 이유} · seen(처리한 요청 id)
      · python port_px.py --req  = 요청만 처리(새 요청 없으면 야후를 안 부름)
   원칙: 숫자를 지어내지 않음 — 못 받으면 옛 파일 그대로."""
import datetime
import json
import math
import os
import sys

X = os.path.join("archive", "x")
D = os.path.join(X, "port_px")
DAYS = 7
ETF = ["SPY", "QQQ", "GLD", "BIL"]
BOND = ["IEF", "TLT"]
NAMES = {"IEF": "미국채 7~10년 (IEF)", "TLT": "미국채 20년+ (TLT)", "BRBOND": "브라질국채 (헤알 국채 · 달러 환산)", "USDKRW": "원/달러 환율", "SPY": "S&P500 (SPY)", "QQQ": "나스닥100 (QQQ)", "GLD": "금 (GLD)", "BIL": "현금·단기채 (BIL)", "KOSPI": "코스피"}
KST = datetime.timezone(datetime.timedelta(hours=9))


def now():
    return datetime.datetime.now(KST).strftime("%Y-%m-%d %H:%M")


def read_idx():
    try:
        return json.load(open(os.path.join(D, "index.json"), encoding="utf-8"))
    except Exception:
        return {"assets": {}}


def stale(idx, k, days):
    a = (idx.get("assets") or {}).get(k)
    if not a or "--force" in sys.argv:
        return True
    try:
        t = datetime.date.fromisoformat(a["at"][:10])
    except Exception:
        return True
    return (datetime.datetime.now(KST).date() - t).days >= days


def dl(tick, start, adjust):
    import yfinance as yf
    for _ in range(2):
        try:
            h = yf.download(tick, start=start, interval="1d", progress=False, auto_adjust=adjust, threads=False)
            c = h["Close"].dropna()
            if hasattr(c, "columns"):
                c = c.iloc[:, 0]
            if len(c) >= 500:
                return {d.strftime("%Y-%m-%d"): float(v) for d, v in c.items() if float(v) > 0}
        except Exception as e:
            print("✗", tick, e)
    return None


def write(k, P, sig):
    ds = sorted(P)
    d0 = datetime.date.fromisoformat(ds[0])
    prev, dd, cc = d0, [], []
    for d in ds:
        x = datetime.date.fromisoformat(d)
        dd.append((x - prev).days); prev = x
        v = float(("%." + str(sig) + "g") % P[d]); cc.append(int(v) if v.is_integer() else v)
    f = k + ".json"
    json.dump({"n": k, "d0": ds[0], "dd": dd, "c": cc}, open(os.path.join(D, f), "w", encoding="utf-8"), separators=(",", ":"))
    return {"f": f, "from": ds[0], "to": ds[-1], "n": len(ds), "at": now(), "name": NAMES.get(k, k)}


def load_file(k):
    j = json.load(open(os.path.join(D, k + ".json"), encoding="utf-8"))
    t = datetime.date.fromisoformat(j["d0"]); out = {}
    for g, c in zip(j["dd"], j["c"]):
        t = t + datetime.timedelta(days=g); out[t.isoformat()] = float(c)
    return out


# ── 파이썬 참조 엔진 (port_design.js 와 같은 규칙) ──
def engine(P, w, reg_on=True, vol_on=True, start="2008-07-01", tgt=15.0, floor=0.30, band=0.05, cost=0.001):
    """w = {SPY, QQQ, GLD, BIL} 비중(합 1). 국면 꺼짐(S&P 200일선 아래 3일 이어짐) → 주식 × 0.63/0.95, 덜어낸 몫 19%는 금 · 81%는 현금
       변동성 맞춤: 주식 × min(1, max(floor, 목표 ÷ 지난 20일 주식 묶음 실현 변동성)). 판단은 전날 종가 → 오늘부터.
       맞춤: 달이 바뀐 날 · 국면이 바뀐 날 · 주식 비중이 목표에서 5%p 넘게 벗어난 날. 비용 = 회전 × 0.1%."""
    days = sorted(set.intersection(*[set(P[k]) for k in ETF]))
    C = {k: [P[k][d] for d in days] for k in ETF}
    n = len(days)
    R = {k: [0.0] + [C[k][i] / C[k][i - 1] - 1 for i in range(1, n)] for k in ETF}
    spy = C["SPY"]
    # 200일선 · 3일 끈끈이
    raw, s = [], 0.0
    for i in range(n):
        s += spy[i]
        if i >= 200:
            s -= spy[i - 200]
        raw.append(spy[i] > s / 200 if i >= 199 else None)
    reg, cur, run = [], False, 0
    for v in raw:
        v = bool(v)
        if v != cur:
            run += 1
            if run >= 3:
                cur, run = v, 0
        else:
            run = 0
        reg.append(cur)
    eq = w["SPY"] + w["QQQ"]
    ws, wq = (w["SPY"] / eq, w["QQQ"] / eq) if eq > 0 else (0.5, 0.5)
    mix = [ws * R["SPY"][i] + wq * R["QQQ"][i] for i in range(n)]
    sc = []
    for i in range(n):
        if i < 20:
            sc.append(1.0); continue
        a = mix[i - 19:i + 1]; m = sum(a) / 20
        sd = math.sqrt(sum((x - m) ** 2 for x in a) / 19) * math.sqrt(252) * 100
        sc.append(min(1.0, max(floor, tgt / sd)) if sd > 0 else 1.0)
    f = 0.63 / 0.95

    def tg(i):
        on = reg[i] if reg_on else True
        b = dict(w)
        if not on:
            fr = (w["SPY"] + w["QQQ"]) * (1 - f)
            b = {"SPY": w["SPY"] * f, "QQQ": w["QQQ"] * f, "GLD": w["GLD"] + fr * 0.1875, "BIL": w["BIL"] + fr * 0.8125}
        k = sc[i] if vol_on else 1.0
        e = (b["SPY"] + b["QQQ"]) * k
        out = {"SPY": b["SPY"] * k, "QQQ": b["QQQ"] * k, "GLD": b["GLD"]}
        out["BIL"] = 1 - e - b["GLD"]
        return out
    i0 = next(i for i, d in enumerate(days) if d >= start)
    i0 = max(i0, 201)
    W, last_eq, nav, navs, turn = None, None, 1.0, [], 0.0
    for i in range(i0, n):
        if W is None:
            W = tg(i - 1); last_eq = W["SPY"] + W["QQQ"]
        r = sum(W[k] * R[k][i] for k in ETF)
        nw = {k: W[k] * (1 + R[k][i]) for k in ETF}; s_ = sum(nw.values()); W = {k: v / s_ for k, v in nw.items()}
        t = tg(i - 1)
        if days[i - 1][5:7] != days[i][5:7] or (reg_on and reg[i - 1] != reg[i - 2]) or abs(t["SPY"] + t["QQQ"] - last_eq) > band:
            tv = sum(abs(t[k] - W[k]) for k in ETF) / 2
            W = dict(t); last_eq = t["SPY"] + t["QQQ"]; r -= tv * cost; turn += tv
        nav *= 1 + r; navs.append(nav)
    yrs = (datetime.date.fromisoformat(days[-1]) - datetime.date.fromisoformat(days[i0])).days / 365.25
    pk, mdd = 0, 0
    for v in navs:
        pk = max(pk, v); mdd = min(mdd, v / pk - 1)
    return {"from": days[i0], "to": days[-1], "cagr": round((navs[-1] ** (1 / yrs) - 1) * 100, 2), "mdd": round(mdd * 100, 1), "end": round(navs[-1], 4)}


def check():
    try:
        P = {k: load_file(k) for k in ETF}
    except Exception as e:
        print("check 건너뜀", e); return
    base = {"SPY": .475, "QQQ": .475, "GLD": .05, "BIL": 0.0}
    out = {"at": now(), "rules": "💼 기본 규칙(실험실 k1020_relief 「now」와 같은 규칙) · 같은 자료로 앱(port_design.js)이 같은 숫자를 내야 함", "runs": []}
    for nm, w, rg, vl, st in [("기본 2008-07~", base, True, True, "2008-07-01"), ("변동성 끔 2008-07~", base, True, False, "2008-07-01"),
                              ("국면 끔 2008-07~", base, False, True, "2008-07-01"), ("기본 2007-06~", base, True, True, "2007-06-01"),
                              ("S&P 60 금 20 현금 20 · 둘 다 끔", {"SPY": .6, "QQQ": 0, "GLD": .2, "BIL": .2}, False, False, "2007-06-01")]:
        r = engine(P, w, rg, vl, st); r.update({"name": nm, "w": w, "reg": rg, "vol": vl}); out["runs"].append(r)
        print("check", nm, r)
    json.dump(out, open(os.path.join(D, "check.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


# ── 🧾 11/05 세금 계산용 (사용자 「달러로 사면 양도세·국내 ETF면 배당소득세·금융종합과세까지 뗀 실제 수익률」) ──
#   ① USDKRW.json: 원/달러 일봉(야후 KRW=X) 2006~ — 하루에 ±8% 넘게 튀는 잘못 찍힌 값은 버림
#   ② div.json: 해마다 분배금(배당) 수익률 % = (배당 포함 값 상승 ÷ 가격만 상승 − 1) — 수정종가(auto_adjust)와 그냥 종가로 계산
def fx_clean(P):
    out, prev = {}, None
    for d in sorted(P):
        v = P[d]
        if prev and abs(v / prev - 1) > 0.08:
            print("✗ USDKRW 튀는 값 버림", d, v); continue
        out[d] = v; prev = v
    return out


def div_years():
    out = {}
    for k in ETF + BOND:
        tr, pr = dl(k, "2006-01-01", True), dl(k, "2006-01-01", False)
        if not tr or not pr:
            if k in BOND:
                continue
            return None
        ds = sorted(set(tr) & set(pr)); ys = {}
        for d in ds:
            ys.setdefault(d[:4], []).append(d)
        prev_last, row = None, {}
        for y in sorted(ys):
            a, b = (prev_last or ys[y][0]), ys[y][-1]
            t, p = tr[b] / tr[a], pr[b] / pr[a]
            if p > 0:
                row[y] = round((t / p - 1) * 100, 3)
            prev_last = b
        out[k] = row
    return out


def sgs_daily(code, start="2006-01-01"):
    """브라질 중앙은행 SGS 일별 → {날짜: 값} · 한 번에 10년 넘게 못 받아 5년씩"""
    import urllib.request
    out, a = {}, datetime.date.fromisoformat(start)
    today = datetime.date.today()
    while a <= today:
        b = min(today, a + datetime.timedelta(days=365 * 5))
        u = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.%d/dados?formato=json&dataInicial=%s&dataFinal=%s" % (code, a.strftime("%d/%m/%Y"), b.strftime("%d/%m/%Y"))
        for _ in range(3):
            try:
                req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
                for x in json.loads(urllib.request.urlopen(req, timeout=40).read().decode("utf-8")):
                    d = datetime.datetime.strptime(x["data"], "%d/%m/%Y").date().isoformat()
                    out[d] = float(str(x["valor"]).replace(",", "."))
                break
            except Exception as e:
                print("✗ SGS", code, a, e)
        a = b + datetime.timedelta(days=1)
    return out


def despike(P, th, name):
    """하루만 튀었다 돌아오는 잘못 찍힌 값 버림 (앞뒤 날은 서로 가까운데 그날만 th 넘게 벌어짐)"""
    ds = sorted(P); out = dict(P); n = 0
    for i in range(1, len(ds) - 1):
        a, b, c = P[ds[i - 1]], P[ds[i]], P[ds[i + 1]]
        if abs(b / a - 1) > th and abs(c / a - 1) < th / 2:
            out.pop(ds[i], None); n += 1
    if n:
        print("✗", name, "하루만 튄 값", n, "개 버림")
    return out


def brazil(idx):
    """🇧🇷 브라질국채 달러 값 — 위 ③ 설명"""
    if not stale(idx, "BRBOND", DAYS) and (idx["assets"].get("BRBOND") or {}).get("v") == 2:   # v2 = 튄 값·계단 거른 판
        return False
    fx = dl("BRL=X", "2006-01-01", False)   # 1달러 = ? 헤알
    if not fx:
        print("✗ BRL=X 못 받음"); return False
    fx = despike(fx, 0.06, "BRL=X")
    F, prev = {}, None
    for d in sorted(fx):
        v = fx[d]
        if prev and abs(v / prev - 1) > 0.15:
            print("✗ BRL=X 튀는 값 버림", d, v); continue
        F[d] = v; prev = v
    sel = sgs_daily(432)
    etf = dl("IRFM11.SA", "2006-01-01", True)
    if etf and len(etf) < 500:
        etf = None
    R = {}
    if etf:
        etf = despike(etf, 0.06, "IRFM11")
        # 그래도 남은 하루 ±8% 넘는 계단(주식 병합 등 수정 안 된 값 — 11/17 2026-01-08 +53%)은 그날 움직임을 0 으로 · 국채 지수 ETF 는 하루에 그만큼 못 움직임
        ed, jumps = sorted(etf), []
        for i in range(1, len(ed)):
            r = etf[ed[i]] / etf[ed[i - 1]]
            if abs(r - 1) > 0.08:
                jumps.append(ed[i]); r = 1.0
            R[ed[i]] = r
        if jumps:
            print("✗ IRFM11 계단", jumps, "→ 그날 0")
    if not sel and not etf:
        print("✗ Selic·IRF-M 둘 다 못 받음"); return False
    sd = sorted(sel); e0 = min(etf) if etf else None
    idx_brl, P, si, rate, ei = 100.0, {}, 0, None, 0
    ed = sorted(etf) if etf else []
    for d in sorted(F):
        while si < len(sd) and sd[si] <= d:
            rate = sel[sd[si]]; si += 1
        if etf and d >= e0:
            while ei < len(ed) and ed[ei] <= d:   # 환율 없는 날의 ETF 움직임도 다음 날에 모아 넣음
                idx_brl *= R.get(ed[ei], 1.0); ei += 1
        elif rate is not None:
            if P:
                idx_brl *= (1 + rate / 100) ** (1 / 252)
        else:
            continue   # Selic 도 아직 없음
        P[d] = idx_brl / F[d]
    if len(P) < 500:
        print("✗ BRBOND 너무 짧음", len(P)); return False
    meta = write("BRBOND", P, 7)
    meta["src"] = ("IRF-M ETF(IRFM11.SA)" if etf else "") + (" + " if etf and sel else "") + ("Selic 기준금리 이자 근사(BCB SGS 432)" if sel and (not etf or e0 > min(P)) else "")
    meta["splice"] = e0 if etf and e0 > min(P) else None
    meta["fx"] = "BRL=X"; meta["v"] = 2; meta["brl_last"] = round(F[max(F)], 4)
    idx["assets"]["BRBOND"] = meta
    print("✓ BRBOND", len(P), meta["from"], "~", meta["to"], meta["src"], "splice", meta["splice"])
    return True


def tax_data(idx):
    ch = False
    if stale(idx, "USDKRW", 1):
        P = dl("KRW=X", "2006-01-01", False)
        if P:
            P = fx_clean(P); idx["assets"]["USDKRW"] = write("USDKRW", P, 6); idx["assets"]["USDKRW"]["last"] = round(P[max(P)], 2); ch = True; print("✓ USDKRW", len(P))
    try:
        have = json.load(open(os.path.join(D, "div.json"), encoding="utf-8")).get("y") or {}
    except Exception:
        have = {}
    if stale(idx, "DIV", DAYS) or any(k not in have for k in BOND):   # 11/17 채권 분배금이 아직 없으면 바로 다시

        Y = div_years()
        if Y:
            json.dump({"at": now(), "note": "해마다 분배금 수익률 % (배당 포함 값 ÷ 가격만 − 1)", "y": Y}, open(os.path.join(D, "div.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            idx["assets"]["DIV"] = {"f": "div.json", "at": now(), "name": "분배금 수익률(해마다)"}; ch = True; print("✓ div", {k: len(v) for k, v in Y.items()})
    return ch


# ── ④ 11/18 종목·ETF 섞기 ──
PD = os.path.join(D, "pool")
REQ_TOPIC = "chkchp-ch-pdzreq-k4r8"
SEED = [
    ("005930.KS", "삼성전자"), ("000660.KS", "SK하이닉스"), ("005380.KS", "현대차"), ("015760.KS", "한국전력"), ("373220.KS", "LG에너지솔루션"),
    ("207940.KS", "삼성바이오로직스"), ("035420.KS", "NAVER"), ("035720.KS", "카카오"), ("000270.KS", "기아"), ("105560.KS", "KB금융"),
    ("055550.KS", "신한지주"), ("012450.KS", "한화에어로스페이스"), ("329180.KS", "HD현대중공업"), ("042660.KS", "한화오션"), ("068270.KS", "셀트리온"),
    ("005490.KS", "POSCO홀딩스"),
    ("069500.KS", "KODEX 200"), ("102110.KS", "TIGER 200"), ("360750.KS", "TIGER 미국S&P500"), ("379800.KS", "KODEX 미국S&P500"), ("133690.KS", "TIGER 미국나스닥100"),
    ("458730.KS", "TIGER 미국배당다우존스"), ("446720.KS", "SOL 미국배당다우존스"), ("381180.KS", "TIGER 미국필라델피아반도체나스닥"), ("091160.KS", "KODEX 반도체"),
    ("305720.KS", "KODEX 2차전지산업"), ("132030.KS", "KODEX 골드선물(H)"), ("148070.KS", "KIWOOM 국고채10년"),
    ("NVDA", "엔비디아"), ("AAPL", "애플"), ("MSFT", "마이크로소프트"), ("AMZN", "아마존"), ("GOOGL", "알파벳"), ("META", "메타"), ("AVGO", "브로드컴"),
    ("TSLA", "테슬라"), ("AMD", "AMD"), ("MU", "마이크론"), ("INTC", "인텔"), ("PLTR", "팔란티어"), ("JPM", "JP모간"), ("LLY", "일라이 릴리"),
    ("COST", "코스트코"), ("NFLX", "넷플릭스"),
    ("VOO", "Vanguard S&P500 (VOO)"), ("SCHD", "미국 배당 SCHD"), ("JEPI", "JEPI 커버드콜"), ("JEPQ", "JEPQ 나스닥 커버드콜"), ("SOXX", "반도체 SOXX"),
    ("SMH", "반도체 SMH"), ("TQQQ", "나스닥 3배 TQQQ"), ("QLD", "나스닥 2배 QLD"), ("DIA", "다우 DIA"), ("IWM", "러셀2000 IWM"), ("VTI", "미국 전체 VTI"),
    ("VT", "세계 전체 VT"), ("VNQ", "미국 리츠 VNQ"), ("XLE", "에너지 XLE"), ("XLK", "기술 XLK"), ("ARKK", "ARK 혁신 ARKK"), ("IBIT", "비트코인 IBIT"),
    ("7203.T", "도요타자동차"), ("8035.T", "도쿄일렉트론"), ("6857.T", "어드밴테스트"), ("0700.HK", "텐센트"), ("9988.HK", "알리바바"), ("1810.HK", "샤오미"),
    ("^N225", "니케이225 지수"), ("^STOXX50E", "유로스탁스50 지수"), ("^HSCE", "항셍중국 지수"),
]
# 통화 → (환율 티커, 곱하기 여부) : 달러 값 = 현지 값 ÷ (1달러 = ? 현지) · 유로는 EURUSD(1유로 = ? 달러)라 곱함
CUR_FX = {"KRW": ("USDKRW", False), "JPY": ("JPY=X", False), "HKD": ("HKD=X", False), "CNY": ("CNY=X", False), "EUR": ("EURUSD=X", True)}
IDX_CUR = {"^KS200": "KRW", "^KS11": "KRW", "^KQ11": "KRW", "^N225": "JPY", "^HSCE": "HKD", "^HSI": "HKD", "^STOXX50E": "EUR"}


def cur_of(s):
    if s in IDX_CUR:
        return IDX_CUR[s]
    for suf, c in ((".KS", "KRW"), (".KQ", "KRW"), (".T", "JPY"), (".HK", "HKD"), (".SS", "CNY"), (".SZ", "CNY")):
        if s.endswith(suf):
            return c
    return "USD"


def mkt_of(s):
    return {"KRW": "KR", "JPY": "JP", "HKD": "HK", "CNY": "CN", "EUR": "EU"}.get(cur_of(s), "US")


def ok_sym(s):
    import re
    return bool(re.fullmatch(r"\^?[A-Z0-9][A-Z0-9.\-=]{0,14}", s or ""))


def pool_file(s):
    return s.replace("^", "_").replace("=", "_") + ".json"


def read_pool():
    try:
        j = json.load(open(os.path.join(PD, "index.json"), encoding="utf-8"))
        j.setdefault("assets", {}); j.setdefault("bad", {}); j.setdefault("seen", [])
        return j
    except Exception:
        return {"assets": {}, "bad": {}, "seen": []}


def save_pool(P):
    P["updated"] = now(); P["seen"] = P["seen"][-300:]
    json.dump(P, open(os.path.join(PD, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


def write_pool(s, P, name):
    ds = sorted(P); d0 = datetime.date.fromisoformat(ds[0]); prev, dd, cc = d0, [], []
    for d in ds:
        x = datetime.date.fromisoformat(d); dd.append((x - prev).days); prev = x
        v = float("%.6g" % P[d]); cc.append(int(v) if v.is_integer() else v)
    f = pool_file(s)
    json.dump({"n": name, "s": s, "d0": ds[0], "dd": dd, "c": cc}, open(os.path.join(PD, f), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return {"f": f, "from": ds[0], "to": ds[-1], "n": len(ds), "at": now(), "name": name, "mkt": mkt_of(s), "cur": cur_of(s)}


_FX = {}


def fx_series(cur):
    if cur in _FX:
        return _FX[cur]
    t, mul = CUR_FX[cur]
    if t == "USDKRW":
        try:
            F = load_file("USDKRW")
        except Exception:
            F = dl("KRW=X", "2006-01-01", False)
    else:
        F = dl(t, "2006-01-01", False)
    if F:
        F = despike(F, 0.08, t)
    _FX[cur] = (F, mul)
    return _FX[cur]


def to_usd(P, cur):
    """현지 통화 값 → 달러 값 · 그날 환율이 없으면 바로 앞 날 환율(휴장일 차이)"""
    if cur == "USD":
        return P
    F, mul = fx_series(cur)
    if not F:
        return None
    fd = sorted(F); out = {}; j = 0; last = None
    for d in sorted(P):
        while j < len(fd) and fd[j] <= d:
            last = F[fd[j]]; j += 1
        if last:
            out[d] = P[d] * last if mul else P[d] / last
    return out


def dl_any(tick, start="2006-01-01"):
    """dl 과 같지만 상장이 늦은 종목도(60거래일부터) · 배당 포함 수정종가"""
    import yfinance as yf
    for _ in range(2):
        try:
            h = yf.download(tick, start=start, interval="1d", progress=False, auto_adjust=True, threads=False)
            c = h["Close"].dropna()
            if hasattr(c, "columns"):
                c = c.iloc[:, 0]
            if len(c) >= 60:
                return {d.strftime("%Y-%m-%d"): float(v) for d, v in c.items() if float(v) > 0}
            return {}
        except Exception as e:
            print("✗", tick, e)
    return None


def pool_one(Pi, s, name):
    raw = dl_any(s)
    if raw is None:
        print("✗ 못 받음(다음에 다시)", s); return False
    if not raw:
        Pi["bad"][s] = "야후에 일봉이 없거나 60거래일보다 짧음"; Pi["assets"].pop(s, None); print("✗ 자료 없음", s); return True
    raw = despike(raw, 0.45, s)   # 하루만 45% 넘게 튀었다 돌아온 값(자료 오류) 버림
    cur = cur_of(s); U = to_usd(raw, cur)
    if not U:
        print("✗ 환율 없음", s, cur); return False
    Pi["assets"][s] = write_pool(s, U, name); Pi["bad"].pop(s, None); print("✓ pool", s, name, cur, len(U))
    return True


def ntfy_reqs(Pi):
    """앱에서 보낸 요청: 본문 「코드|이름」 (최근 24시간 · 처리한 id 는 seen 에)"""
    import urllib.request
    try:
        r = urllib.request.urlopen(urllib.request.Request("https://ntfy.sh/%s/json?poll=1&since=24h" % REQ_TOPIC, headers={"User-Agent": "ch-investing-pdz"}), timeout=30)
        lines = r.read().decode("utf-8", "ignore").splitlines()
    except Exception as x:
        print("ntfy 못 읽음", x); return []
    seen, out = set(Pi.get("seen") or []), []
    for ln in lines:
        try:
            m = json.loads(ln)
        except Exception:
            continue
        if m.get("event") != "message" or m.get("id") in seen:
            continue
        msg = str(m.get("message") or "").strip(); sym, _, nm = msg.partition("|")
        sym = sym.strip().upper(); nm = nm.strip()[:40] or sym
        out.append((m.get("id"), sym, nm))
    return out


def req_todo(Pi):
    reqs = ntfy_reqs(Pi); todo = []
    for mid, s, nm in reqs:
        Pi["seen"].append(mid)
        if not ok_sym(s):
            print("✗ 이상한 코드", s); continue
        a = Pi["assets"].get(s)
        if (a and not stale(Pi, s, 1)) or any(t[0] == s for t in todo):
            continue
        todo.append((s, nm))
    return reqs, todo


def pool(full):
    os.makedirs(PD, exist_ok=True)
    Pi = read_pool()
    reqs, todo = req_todo(Pi); ch = bool(reqs)
    for s, nm in todo[:25]:
        ch = pool_one(Pi, s, nm) or ch
    if full:
        names = dict(SEED)
        for s, a in list(Pi["assets"].items()):
            names.setdefault(s, a.get("name") or s)
        n = 0
        for s, nm in names.items():
            if not stale(Pi, s, DAYS) or s in Pi["bad"] and s not in dict(SEED):
                continue
            ch = pool_one(Pi, s, nm) or ch; n += 1
            if n >= 120:
                break
    if ch:
        save_pool(Pi)
    return ch


def main():
    os.makedirs(D, exist_ok=True)
    idx = read_idx(); idx.setdefault("assets", {}); ch = False
    for k in ETF + BOND:
        if not stale(idx, k, DAYS):
            continue
        P = dl(k, "2006-01-01", True)
        if P:
            idx["assets"][k] = write(k, P, 6); ch = True; print("✓", k, len(P))
    try:
        ch = brazil(idx) or ch
    except Exception as x:
        print("브라질국채 못 받음", x)
    try:
        ch = tax_data(idx) or ch
    except Exception as x:
        print("세금 자료 못 받음", x)
    # 코스피: 마지막 날이 바뀌었거나 그 날 값이 바뀌었을 때 (10/22 고침 — 장중 값이 낮 12시에 굳어 종가 −3.5% 가 안 들어갔음)
    P = dl("^KS11", "2000-01-01", False)
    if P:
        # 10/23: 야후 일봉이 하루 늦을 때 — 장 마감된 실시간 파일(live_kr.json)의 종가로 빈 날을 채움
        try:
            L = json.load(open(os.path.join(os.path.dirname(D), "live_kr.json"), encoding="utf-8"))
            ix = [x for x in (L.get("index") or []) if x.get("name") == "코스피"]
            if ix and ix[0].get("status") == "CLOSE" and ix[0].get("last") and L.get("date") and L["date"] not in P and L["date"] > max(P):
                P[L["date"]] = float(ix[0]["last"]); print("＋ KOSPI live_kr 종가로 채움", L["date"], ix[0]["last"])
            # 10/23: 야후가 전날(10/22)을 건너뛰는 일이 있음 → 오늘 실시간 등락률로 전날 종가를 되살려 채움(휴장일이면 값이 같아 넣지 않음)
            if ix and ix[0].get("chg") is not None and L.get("date") in P:
                pd = datetime.date.fromisoformat(L["date"]) - datetime.timedelta(days=1)
                while pd.weekday() >= 5: pd -= datetime.timedelta(days=1)
                pds = str(pd); before = [k for k in P if k < L["date"]]
                pv = float(ix[0]["last"]) / (1 + float(ix[0]["chg"]) / 100)
                if pds not in P and before and max(before) < pds and abs(pv / P[max(before)] - 1) > 0.0005:
                    P[pds] = round(pv, 2); print("＋ KOSPI 빠진 전날 채움", pds, round(pv, 2))
        except Exception as x:
            print("live_kr 못 읽음", x)
        last = max(P); old = (idx["assets"].get("KOSPI") or {})
        if old.get("to") != last or old.get("n") != len(P) or old.get("last") != round(P[last], 2) or "--force" in sys.argv:
            idx["assets"]["KOSPI"] = write("KOSPI", P, 7); idx["assets"]["KOSPI"]["last"] = round(P[last], 2); ch = True; print("✓ KOSPI", len(P), last)
    try:
        pool(True)
    except Exception as x:
        print("종목 pool 못 함", x)
    if ch:
        idx["updated"] = now()
        json.dump(idx, open(os.path.join(D, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        if any(k in idx["assets"] for k in ETF):
            check()
    else:
        print("port_px: 바뀐 것 없음")


if __name__ == "__main__":
    if "--check" in sys.argv:
        check()
    elif "--req-check" in sys.argv:   # 워크플로 첫 단계: 새 요청이 있나만 (야후·pip 없이)
        r, t = req_todo(read_pool()); print("새 요청", len(r), "받을 것", [x[0] for x in t])
        if os.environ.get("GITHUB_OUTPUT"):
            open(os.environ["GITHUB_OUTPUT"], "a").write("has=%d\n" % (1 if r else 0))
    elif "--req" in sys.argv:
        pool(False)
    else:
        main()
