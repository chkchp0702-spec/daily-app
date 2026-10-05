"""
🧭 국면 신호판 — 시장이 상승 국면으로 가는지 하락 국면으로 가는지 알려주는 선행지표 묶음
  FRED(미국 금리·신용·고용·경기) + 야후(지수·변동성·원자재) + opdata(시장 폭) + 네이버(외국인) 를
  매일 모아 신호마다 🟢/⚪/🔴 를 매기고 종합 점수(-100~100)와 60일 흐름을 archive/x/regime.json 에 쓴다.
  python regime.py            (GitHub Actions regime.yml 에서 하루 두 번)
"""
import datetime as dt
import io
import json
import math
import os
import re
import urllib.request

import pandas as pd

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
TODAY = NOW.strftime("%Y-%m-%d")
OUT = os.path.join("archive", "x", "regime.json")
OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"
UA = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"}
MK = [("US", "🇺🇸", "미국", "^GSPC", ".US"), ("KR", "🇰🇷", "한국", "^KS11", ".K"), ("JP", "🇯🇵", "일본", "^N225", ".T"),
      ("CN", "🇨🇳", "중국", "000001.SS", ".S"), ("HK", "🇭🇰", "홍콩", "^HSI", ".HK")]
SIG = []        # 신호 목록
ERR = []


def log(*a):
    print(*a, flush=True)


def http(url, timeout=40, enc="utf-8"):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read().decode(enc, errors="ignore")


def fred(series, days=800):
    """FRED 시계열 → pandas Series (날짜 index, float). 열쇠 없이 CSV 로 받는다."""
    t = http(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}")
    df = pd.read_csv(io.StringIO(t))
    df.columns = ["date", "v"]
    df["v"] = pd.to_numeric(df["v"], errors="coerce")
    s = df.dropna().set_index("date")["v"]
    s.index = pd.to_datetime(s.index)
    return s[s.index >= pd.Timestamp.now() - pd.Timedelta(days=days)]


def yh(tickers, period="2y"):
    import yfinance as yf
    df = yf.download(tickers, period=period, interval="1d", auto_adjust=False, progress=False, group_by="ticker", threads=True)
    out = {}
    for t in tickers:
        try:
            s = (df[t]["Close"] if isinstance(df.columns, pd.MultiIndex) else df["Close"]).dropna()
            if len(s) > 20:
                out[t] = s
        except Exception:
            pass
    return out


def r(v, n=2):
    return None if v is None or (isinstance(v, float) and math.isnan(v)) else round(float(v), n)


def add(id_, grp, name, status, val, mean, w=1, lead="", rule="", src="", extra=None):
    """status: +1 좋음 / 0 중립 / -1 나쁨 / None 자료 없음"""
    SIG.append(dict(id=id_, grp=grp, name=name, st=status, val=val, mean=mean, w=w, lead=lead, rule=rule, src=src, **(extra or {})))


def fail(id_, grp, name, e, w=1):
    ERR.append(f"{id_}: {e}")
    add(id_, grp, name, None, "자료 없음", "오늘은 못 받았어요", w)


# ============================================================ 돈·금리
def sig_rates():
    # 1. 장단기 금리차 10년-3개월
    try:
        s = fred("T10Y3M")
        v = float(s.iloc[-1])
        inv = s < 0
        last_inv = s[inv].index[-1] if inv.any() else None
        days_since = (s.index[-1] - last_inv).days if last_inv is not None else None
        if v < 0:
            st, mean = -1, f"역전 중 ({v:+.2f}%p). 역전 자체보다 '풀리는 순간'이 더 위험"
        elif days_since is not None and days_since <= 180:
            st, mean = -1, f"역전이 {days_since}일 전에 풀림 — 역사상 가장 위험한 구간 (2000·2007년 천장이 여기)"
        elif days_since is not None and days_since <= 365:
            st, mean = 0, f"역전 해제 뒤 {days_since}일. 침체는 해제 뒤 6~18개월 안에 왔음"
        else:
            st, mean = 1, f"정상 ({v:+.2f}%p). 1년 넘게 역전 없음"
        add("yc", "money", "장단기 금리차 (10년−3개월)", st, f"{v:+.2f}%p", mean, w=2, lead="6~18개월",
            rule="역전 → 경고 · 역전 해제 뒤 6개월 = 🔴 · 1년 넘게 정상 = 🟢", src="FRED T10Y3M",
            extra={"hist": [r(x) for x in s.iloc[-120:].tolist()]})
    except Exception as e:
        fail("yc", "money", "장단기 금리차", e, 2)
    # 2. 하이일드 스프레드
    try:
        s = fred("BAMLH0A0HYM2")
        v, m1 = float(s.iloc[-1]), float(s.iloc[-1] - s.iloc[-22]) if len(s) > 22 else 0.0
        if v >= 5.0 or m1 >= 0.75:
            st, mean = -1, f"정크본드 금리차 {v:.2f}%p, 한 달 새 {m1:+.2f}%p — 채권시장이 겁먹기 시작"
        elif v < 4.0 and m1 < 0.5:
            st, mean = 1, f"{v:.2f}%p 로 낮고 안정 — 돈이 위험을 안 피함"
        else:
            st, mean = 0, f"{v:.2f}%p (한 달 {m1:+.2f}%p) — 보통"
        add("hy", "money", "하이일드 스프레드", st, f"{v:.2f}%p", mean, w=2, lead="1~3개월",
            rule="5%p 이상 또는 한 달 +0.75%p = 🔴 · 4%p 미만·안정 = 🟢", src="FRED BAMLH0A0HYM2",
            extra={"hist": [r(x) for x in s.iloc[-120:].tolist()]})
    except Exception as e:
        fail("hy", "money", "하이일드 스프레드", e, 2)
    # 3. 금융여건 NFCI
    try:
        s = fred("NFCI")
        v = float(s.iloc[-1])
        st = 1 if v < -0.3 else (-1 if v > 0 else 0)
        mean = {1: "돈 구하기 쉬운 상태 (0보다 많이 낮음)", 0: "보통", -1: "돈줄이 조여지는 중 (0 위) — 몇 달 뒤 경기 둔화"}[st]
        add("nfci", "money", "금융여건지수 (시카고 연은)", st, f"{v:+.2f}", mean, lead="2~4개월", rule="0 위 = 🔴 · −0.3 아래 = 🟢", src="FRED NFCI")
    except Exception as e:
        fail("nfci", "money", "금융여건지수", e)
    # 4. 2년물 vs 기준금리
    try:
        s2, ff = fred("DGS2"), fred("DFF")
        d = float(s2.iloc[-1] - ff.iloc[-1])
        if d > 0.25:
            st, mean = -1, f"2년물이 기준금리보다 {d:+.2f}%p 위 — 시장은 '더 올린다'고 봄"
        elif d < -0.75:
            st, mean = 0, f"2년물이 기준금리보다 {abs(d):.2f}%p 아래 — 인하 기대와 경기 걱정이 섞임"
        else:
            st, mean = 1, f"기준금리와 비슷 ({d:+.2f}%p) — 금리 쪽 압박 없음"
        add("ff2", "money", "2년물 − 기준금리", st, f"{d:+.2f}%p", mean, lead="3~6개월", rule="+0.25 위 = 🔴 · −0.75~+0.25 = 🟢", src="FRED DGS2·DFF")
    except Exception as e:
        fail("ff2", "money", "2년물 − 기준금리", e)
    # 5. 실질금리 60일 변화
    try:
        s = fred("DFII10")
        v, ch = float(s.iloc[-1]), float(s.iloc[-1] - s.iloc[-42])
        st = -1 if ch > 0.5 else (1 if ch < -0.3 else 0)
        mean = {-1: f"두 달 새 {ch:+.2f}%p 급등 — 성장주·기술주에 역풍", 0: f"두 달 {ch:+.2f}%p — 큰 변화 없음", 1: f"두 달 {ch:+.2f}%p 하락 — 주식 밸류에 숨통"}[st]
        add("real", "money", "실질금리 (10년 물가연동)", st, f"{v:.2f}% ({ch:+.2f})", mean, lead="동행~1개월", rule="두 달 +0.5%p = 🔴 · −0.3%p = 🟢", src="FRED DFII10")
    except Exception as e:
        fail("real", "money", "실질금리", e)


# ============================================================ 실물
def sig_real():
    try:
        s = fred("IC4WSA")
        v, lo = float(s.iloc[-1]), float(s.iloc[-52:].min())
        up = (v / lo - 1) * 100
        st = -1 if up >= 20 else (1 if up < 8 else 0)
        mean = {-1: f"1년 저점보다 {up:.0f}% 늘어남 — 실업률보다 2~3개월 먼저 꺾이는 지표", 0: f"저점 대비 +{up:.0f}% — 지켜볼 구간", 1: f"저점 근처(+{up:.0f}%) — 고용 탄탄"}[st]
        add("claims", "real", "신규 실업수당 청구 (4주 평균)", st, f"{v/1000:.0f}천 명", mean, w=2, lead="2~3개월", rule="1년 저점 대비 +20% = 🔴 · +8% 미만 = 🟢", src="FRED IC4WSA",
            extra={"hist": [r(x / 1000, 0) for x in s.iloc[-60:].tolist()]})
    except Exception as e:
        fail("claims", "real", "신규 실업수당 청구", e, 2)
    try:
        s = fred("PERMIT", 1200)
        v, yoy = float(s.iloc[-1]), (float(s.iloc[-1]) / float(s.iloc[-13]) - 1) * 100
        st = 1 if yoy > 5 else (-1 if yoy < -10 else 0)
        mean = {1: f"1년 전보다 {yoy:+.0f}% — 주택이 경기를 끌어올리는 중", 0: f"1년 전 대비 {yoy:+.0f}% — 보통", -1: f"1년 전보다 {yoy:+.0f}% — 주택이 가장 먼저 꺾이는 중 (침체 12~18개월 선행)"}[st]
        add("permit", "real", "건축 허가 (미국)", st, f"{v/1000:.2f}M ({yoy:+.0f}%)", mean, lead="12~18개월", rule="전년 대비 −10% = 🔴 · +5% = 🟢", src="FRED PERMIT")
    except Exception as e:
        fail("permit", "real", "건축 허가", e)
    try:
        s = fred("SAHMREALTIME", 1200)
        v = float(s.iloc[-1])
        st = -1 if v >= 0.5 else (0 if v >= 0.3 else 1)
        mean = {-1: f"{v:.2f} — 샴 룰 발동 (실업률이 저점보다 0.5%p 이상 올라옴)", 0: f"{v:.2f} — 발동(0.5) 가까이 접근", 1: f"{v:.2f} — 고용 둔화 신호 없음"}[st]
        add("sahm", "real", "샴 룰 (실업률 상승폭)", st, f"{v:.2f}", mean, w=2, lead="동행 (침체 확인)", rule="0.5 이상 = 🔴 · 0.3 미만 = 🟢", src="FRED SAHMREALTIME")
    except Exception as e:
        fail("sahm", "real", "샴 룰", e, 2)
    try:
        s = fred("USSLIND", 1200)
        v = float(s.iloc[-1])
        st = 1 if v > 1.0 else (-1 if v < 0 else 0)
        mean = {1: f"{v:+.2f} — 6개월 뒤 경기도 좋을 거라는 뜻", 0: f"{v:+.2f} — 미지근", -1: f"{v:+.2f} — 선행지수가 마이너스, 침체 신호"}[st]
        add("lei", "real", "경기선행지수 (필라델피아 연은)", st, f"{v:+.2f}", mean, w=2, lead="6개월", rule="0 아래 = 🔴 · +1.0 위 = 🟢", src="FRED USSLIND")
    except Exception as e:
        fail("lei", "real", "경기선행지수", e, 2)
    try:
        s = fred("XTEXVA01KRM667S", 1200)
        v, yoy = float(s.iloc[-1]), (float(s.iloc[-1]) / float(s.iloc[-13]) - 1) * 100
        mon = s.index[-1].strftime("%m월")
        st = 1 if yoy > 5 else (-1 if yoy < 0 else 0)
        mean = {1: f"{mon} 수출 1년 전보다 {yoy:+.0f}% — 코스피 이익과 같은 그림", 0: f"{mon} 수출 {yoy:+.0f}% — 보통", -1: f"{mon} 수출 {yoy:+.0f}% 감소 — 코스피엔 가장 중요한 경고"}[st]
        add("krx", "real", "한국 수출 증가율", st, f"{yoy:+.1f}% ({mon})", mean, w=2, lead="3~6개월 (발표 1~2개월 늦음)", rule="전년 대비 마이너스 = 🔴 · +5% = 🟢", src="FRED XTEXVA01KRM667S")
    except Exception as e:
        fail("krx", "real", "한국 수출 증가율", e, 2)


# ============================================================ 시장 속
def sig_market(Y, OPX):
    # 지수 200일선 (5개국)
    try:
        rows = []
        for k, flag, nm, tk, _ in MK:
            s = Y.get(tk)
            if s is None or len(s) < 200:
                rows.append({"m": k, "flag": flag, "name": nm, "st": None})
                continue
            ma = float(s.iloc[-200:].mean())
            gap = (float(s.iloc[-1]) / ma - 1) * 100
            rows.append({"m": k, "flag": flag, "name": nm, "st": 1 if gap > 0 else -1, "gap": r(gap, 1)})
        us = next((x for x in rows if x["m"] == "US"), {}).get("st")
        kr = next((x for x in rows if x["m"] == "KR"), {}).get("st")
        above = sum(1 for x in rows if x["st"] == 1)
        st = 1 if us == 1 and kr == 1 else (-1 if us == -1 and kr == -1 else 0)
        add("trend", "market", "지수 200일선", st, f"{above}/5 나라 위", f"미국 {'위' if us == 1 else '아래'} · 한국 {'위' if kr == 1 else '아래'}. 큰 하락장은 예외 없이 200일선 아래서 일어났어요",
            lead="추세 확인", rule="미국·한국 둘 다 위 = 🟢 · 둘 다 아래 = 🔴", src="야후", extra={"rows": rows})
    except Exception as e:
        fail("trend", "market", "지수 200일선", e)
    # 시장 폭: 200일선 위 종목 비율 (opdata 가격)
    try:
        rows = []
        for k, flag, nm, _, _ in MK:
            p = OPX.get("b200", {}).get(k)
            if p is None:
                rows.append({"m": k, "flag": flag, "name": nm, "st": None})
                continue
            rows.append({"m": k, "flag": flag, "name": nm, "v": r(p, 0), "st": 1 if p > 55 else (-1 if p < 40 else 0),
                         "note": "과열권" if p > 85 else ("바닥권 — 역발상 매수 자리" if p < 20 else ""),
                         "hist": [x[1] for x in (OPX.get("b200h", {}).get(k) or [])][-40:]})
        us = next((x for x in rows if x["m"] == "US"), {}).get("v")
        kr = next((x for x in rows if x["m"] == "KR"), {}).get("v")
        sts = [x["st"] for x in rows if x["m"] in ("US", "KR") and x["st"] is not None]
        st = 1 if sts and all(x == 1 for x in sts) else (-1 if sts and all(x == -1 for x in sts) else 0)
        add("b200", "market", "200일선 위 종목 비율", st, f"미국 {us if us is not None else '–'}% · 한국 {kr if kr is not None else '–'}%",
            "지수만 오르고 이 비율이 떨어지면 속으로는 약세. 20% 아래는 바닥권, 85% 위는 과열", lead="1~3개월", rule="55% 위 = 🟢 · 40% 아래 = 🔴", src="opdata 전 종목 가격", extra={"rows": rows})
    except Exception as e:
        fail("b200", "market", "200일선 위 종목 비율", e)
    # 브레드 스러스트 (Zweig) — 10일 EMA(상승/(상승+하락))
    try:
        rows, fired_any = [], False
        for k, flag, nm, _, _ in MK:
            bh = OPX.get("bh", {}).get(k)
            if not bh or len(bh) < 15:
                rows.append({"m": k, "flag": flag, "name": nm, "st": None})
                continue
            ratio = [u / (u + d) if (u + d) else 0.5 for _, u, d, _ in bh]
            ema, a = [], 2 / 11
            for x in ratio:
                ema.append(x if not ema else ema[-1] + a * (x - ema[-1]))
            fired = None
            for i in range(len(ema) - 1, 9, -1):
                if ema[i] >= 0.615 and min(ema[i - 10:i]) <= 0.40:
                    fired = bh[i][0]
                    break
            recent = fired is not None and i >= len(ema) - 30
            fired_any = fired_any or (recent and k in ("US", "KR"))
            rows.append({"m": k, "flag": flag, "name": nm, "v": r(ema[-1] * 100, 0), "st": 1 if recent else 0, "fired": fired if recent else None})
        us = next((x for x in rows if x["m"] == "US"), {})
        add("thrust", "market", "브레드 스러스트 (즈바이크)", 1 if fired_any else 0, f"미국 10일 상승비율 {us.get('v', '–')}%",
            "발동(최근 30일)" if fired_any else "발동 없음. 10일 상승 종목 비율이 40%→61.5%로 열흘 안에 뛰면 발동 — 1945년 이후 발동 뒤 1년 수익이 전부 플러스",
            w=2, lead="상승 국면 진입 확인", rule="발동 = 🟢(강) · 평소 = ⚪", src="opdata 등락 종목 수", extra={"rows": rows})
    except Exception as e:
        fail("thrust", "market", "브레드 스러스트", e, 2)
    # 시장 내부: 반도체·운송·소형주 vs S&P 60일 상대
    try:
        sp = Y["^GSPC"]
        parts = []
        for tk, nm in (("^SOX", "반도체"), ("^DJT", "운송"), ("^RUT", "소형주")):
            s = Y.get(tk)
            if s is None:
                continue
            j = s.index.intersection(sp.index)
            rel = (float(s[j].iloc[-1]) / float(s[j].iloc[-42]) - 1) - (float(sp[j].iloc[-1]) / float(sp[j].iloc[-42]) - 1)
            parts.append((nm, rel * 100))
        pos = sum(1 for _, x in parts if x > 0)
        st = 1 if pos == len(parts) and parts else (-1 if pos == 0 and parts else 0)
        txt = " · ".join(f"{n} {x:+.1f}%" for n, x in parts)
        add("inner", "market", "시장 속살 (반도체·운송·소형주 vs S&P)", st, f"{pos}/{len(parts)} 앞섬", txt + " — 셋 다 뒤처지면 '속으로는 이미 약세'", lead="1~3개월", rule="셋 다 S&P보다 앞섬 = 🟢 · 셋 다 뒤처짐 = 🔴 (60일)", src="야후")
    except Exception as e:
        fail("inner", "market", "시장 속살", e)
    try:
        cg = (Y["HG=F"] / Y["GC=F"]).dropna()
        ch = (float(cg.iloc[-1]) / float(cg.iloc[-42]) - 1) * 100
        st = 1 if ch > 5 else (-1 if ch < -5 else 0)
        add("cugold", "market", "구리/금 비율", st, f"{ch:+.1f}% (60일)", {1: "경기 기대가 살아나는 중", 0: "뚜렷한 방향 없음", -1: "안전자산 쏠림 — 경기 걱정"}[st], lead="참고", rule="60일 +5% = 🟢 · −5% = 🔴", src="야후")
    except Exception as e:
        fail("cugold", "market", "구리/금 비율", e)
    try:
        kq = (Y["^KQ11"] / Y["^KS11"]).dropna()
        ch = (float(kq.iloc[-1]) / float(kq.iloc[-42]) - 1) * 100
        st = 1 if ch > 3 else (-1 if ch < -5 else 0)
        add("kq", "market", "코스닥/코스피 비율", st, f"{ch:+.1f}% (60일)", {1: "개인 위험선호 살아 있음", 0: "보통", -1: "코스닥이 뒤처짐 — 유동성 장세 식는 중"}[st], lead="참고", rule="60일 +3% = 🟢 · −5% = 🔴", src="야후")
    except Exception as e:
        fail("kq", "market", "코스닥/코스피 비율", e)


# ============================================================ 심리·수급
def sig_flow(Y, prev):
    try:
        s = Y["^VIX"]
        v = float(s.iloc[-1])
        if v >= 40:
            st, mean = 0, f"{v:.0f} — 공포 극단. 1990년 이후 40 넘은 뒤 1년 수익은 거의 전부 플러스(역발상 🟢)"
        elif v > 28:
            st, mean = -1, f"{v:.0f} — 불안 구간"
        elif v < 18:
            st, mean = 1, f"{v:.0f} — 차분함"
        else:
            st, mean = 0, f"{v:.0f} — 보통"
        mv = Y.get("^MOVE")
        mtxt = f" · 채권 변동성(MOVE) {float(mv.iloc[-1]):.0f}" if mv is not None else ""
        add("vix", "flow", "공포지수 VIX", st, f"{v:.1f}", mean + mtxt, lead="바닥 확인", rule="18 미만 = 🟢 · 28 위 = 🔴 · 40 위 = 역발상 바닥", src="야후 ^VIX·^MOVE",
            extra={"hist": [r(x, 1) for x in s.iloc[-60:].tolist()]})
    except Exception as e:
        fail("vix", "flow", "공포지수 VIX", e)
    # 외국인 코스피 20일 누적 (네이버)
    try:
        vals = naver_foreign(30)
        c20 = sum(v for _, v in vals[:20])
        c5 = sum(v for _, v in vals[:5])
        st = 1 if c20 > 0 else -1
        add("foreign", "flow", "외국인 코스피 순매수 (20일 누적)", st, f"{c20/10000:+.1f}조", f"최근 5일 {c5/10000:+.2f}조. 20일 누적이 돌아서는 시점이 지수 전환과 거의 같아요",
            w=2, lead="동행 (가장 믿을 만함)", rule="20일 누적 플러스 = 🟢 · 마이너스 = 🔴", src="네이버 금융 투자자별 매매동향",
            extra={"hist": [r(v / 10000, 2) for _, v in reversed(vals[:30])]})
    except Exception as e:
        fail("foreign", "flow", "외국인 코스피 순매수", e, 2)
    # 삼성전자 외국인 보유율 (추이 저장)
    try:
        rate = naver_frgn_rate("005930")
        hist = (prev.get("ss_hist") or [])
        if not hist or hist[-1][0] != TODAY:
            hist = [h for h in hist if h[0] != TODAY] + [[TODAY, rate]]
        hist = hist[-60:]
        base = next((h[1] for h in hist if (dt.date.fromisoformat(TODAY) - dt.date.fromisoformat(h[0])).days >= 20), None)
        if base is None:
            st, mean = 0, f"{rate:.2f}% — 추이는 20일 뒤부터 (오늘부터 기록 시작)"
        else:
            ch = rate - base
            st = 1 if ch > 0.1 else (-1 if ch < -0.1 else 0)
            mean = {1: f"20일 전보다 {ch:+.2f}%p — 외국인이 대장주를 사 모으는 중", 0: f"20일 전 대비 {ch:+.2f}%p — 변화 없음", -1: f"20일 전보다 {ch:+.2f}%p — 대장주에서 외국인 이탈"}[st]
        add("ssfor", "flow", "삼성전자 외국인 보유율", st, f"{rate:.2f}%", mean, lead="동행~선행", rule="20일간 +0.1%p = 🟢 · −0.1%p = 🔴", src="네이버 금융", extra={"ss_hist": hist})
    except Exception as e:
        fail("ssfor", "flow", "삼성전자 외국인 보유율", e)
    try:
        krw, jpy, dxy = Y["KRW=X"], Y.get("JPY=X"), Y.get("DX-Y.NYB")
        ch = (float(krw.iloc[-1]) / float(krw.iloc[-15]) - 1) * 100
        st = 1 if ch < -1 else (-1 if ch > 1 else 0)
        parts = [f"원/달러 {float(krw.iloc[-1]):,.0f} ({ch:+.1f}%)"]
        if dxy is not None:
            parts.append(f"달러지수 {float(dxy.iloc[-1]):.1f} ({(float(dxy.iloc[-1]) / float(dxy.iloc[-15]) - 1) * 100:+.1f}%)")
        if jpy is not None:
            parts.append(f"엔/달러 {float(jpy.iloc[-1]):.0f} ({(float(jpy.iloc[-1]) / float(jpy.iloc[-15]) - 1) * 100:+.1f}%)")
        add("fx", "flow", "환율 (3주 변화)", st, f"{ch:+.1f}%", " · ".join(parts) + {1: " — 원화 강세 = 외국인 유입 신호", 0: "", -1: " — 원화 약세 = 외국인 이탈·달러 강세 역풍"}[st],
            lead="동행", rule="원/달러 3주 −1% = 🟢 · +1% = 🔴", src="야후")
    except Exception as e:
        fail("fx", "flow", "환율", e)


def naver_foreign(n=30):
    """코스피 투자자별 일별 매매동향에서 외국인 순매수(억원) 최근 n일. [(날짜, 억원)] 최신순."""
    out = []
    biz = NOW.strftime("%Y%m%d")
    for page in range(3):
        url = f"https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate={biz}&sosok=01&page={page + 1}"
        t = http(url, enc="cp949")
        for row in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
            cells = [re.sub(r"<[^>]+>", "", c).strip().replace(",", "") for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)]
            if len(cells) >= 3 and re.match(r"\d{2}\.\d{2}\.\d{2}", cells[0]):
                try:
                    out.append((cells[0], float(cells[2])))
                except ValueError:
                    pass
        if len(out) >= n:
            break
    if len(out) < 10:
        raise RuntimeError(f"행 {len(out)}개뿐")
    return out[:n]


def naver_frgn_rate(code):
    t = http(f"https://finance.naver.com/item/main.naver?code={code}", enc="cp949")
    m = re.search(r"외국인소진율.*?<em[^>]*>\s*([\d.]+)%", t, re.S) or re.search(r"외국인소진율.*?([\d]{1,2}\.[\d]{2})%", t, re.S)
    if not m:
        raise RuntimeError("소진율 못 찾음")
    return float(m.group(1))


# ============================================================ opdata: 시장 폭
def opdata_breadth():
    """compass.json(opprice.yml 이 하루 두 번 만듦)에서 등락 종목 수 기록과 200일선 위 비율을 읽는다."""
    out = {"b200": {}, "bh": {}, "b200h": {}}
    try:
        comp = json.loads(http(OPD + "compass.json", 60))
        for k, m in (comp.get("markets") or {}).items():
            if m.get("breadth_hist"):
                out["bh"][k] = m["breadth_hist"]
            if m.get("b200") is not None:
                out["b200"][k] = m["b200"]
                out["b200h"][k] = m.get("b200_hist") or []
    except Exception as e:
        ERR.append(f"compass.json: {e}")
    return out


# ============================================================ 종합
def main():
    prev = {}
    try:
        prev = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        pass
    sig_rates()
    sig_real()
    Y = {}
    try:
        Y = yh(["^GSPC", "^KS11", "^N225", "000001.SS", "^HSI", "^SOX", "^DJT", "^RUT", "^VIX", "^MOVE", "HG=F", "GC=F", "^KQ11", "KRW=X", "JPY=X", "DX-Y.NYB"])
    except Exception as e:
        ERR.append(f"yahoo: {e}")
    OPX = opdata_breadth()
    sig_market(Y, OPX)
    sig_flow(Y, prev)

    avail = [s for s in SIG if s["st"] is not None]
    wsum = sum(s["w"] for s in avail) or 1
    score = round(sum(s["w"] * s["st"] for s in avail) / wsum * 100)
    n_g = sum(1 for s in avail if s["st"] == 1)
    n_r = sum(1 for s in avail if s["st"] == -1)
    if score >= 35:
        label, verdict = "상승 우세", "돈·경기·시장 속이 대체로 같은 방향(위)을 가리켜요"
    elif score <= -35:
        label, verdict = "하락 경고", "여러 선행지표가 동시에 나빠지고 있어요 — 비중을 줄일 구간"
    elif score <= -15:
        label, verdict = "조심", "경고등이 늘고 있어요. 다음 몇 개가 더 빨개지면 하락 국면"
    elif score >= 15:
        label, verdict = "온건한 상승", "좋은 신호가 더 많지만 엇갈리는 것도 있어요"
    else:
        label, verdict = "엇갈림", "지표들이 서로 다른 말을 해요 — 추세보다 종목"
    # A등급 동시 경고
    a_red = [s["name"] for s in SIG if s["id"] in ("yc", "hy", "b200") and s["st"] == -1]
    if len(a_red) >= 2:
        verdict = "⚠️ 가장 믿을 만한 신호 " + "·".join(a_red) + " 가 함께 경고 중 — 역사상 이 조합은 거의 틀리지 않았어요. " + verdict
    # 어제와 달라진 것
    pm = {s["id"]: s.get("st") for s in (prev.get("sig") or [])}
    changes = [{"id": s["id"], "name": s["name"], "from": pm.get(s["id"]), "to": s["st"]} for s in SIG
               if s["id"] in pm and pm.get(s["id"]) is not None and s["st"] is not None and pm[s["id"]] != s["st"]]
    hist = [h for h in (prev.get("hist") or []) if h[0] != TODAY] + [[TODAY, score, n_g, n_r]]
    ss_hist = next((s.get("ss_hist") for s in SIG if s["id"] == "ssfor" and s.get("ss_hist")), prev.get("ss_hist"))
    out = {"updated": NOW.strftime("%Y-%m-%d %H:%M"), "score": score, "label": label, "verdict": verdict, "n_green": n_g, "n_red": n_r,
           "n_total": len(avail), "sig": [{k: v for k, v in s.items() if k != "ss_hist"} for s in SIG], "changes": changes, "hist": hist[-90:],
           "ss_hist": ss_hist, "errors": ERR[:20],
           "groups": [["money", "💰 돈·금리"], ["real", "🏭 실물 경기"], ["market", "📊 시장 속"], ["flow", "🧠 심리·수급"]]}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    log(f"국면 신호판 {score:+d} {label} · 🟢{n_g} 🔴{n_r} / {len(avail)} · 오류 {len(ERR)}")
    for e in ERR:
        log("  !", e)


if __name__ == "__main__":
    main()
