"""
🎲 시장확률 — 내일·일주일 뒤 시장이 오를 확률 (prob.yml, 매시간)
  10/14 사용자 「다 합쳐서 확률로 만들어서 나침반 옆에 '시장확률' — 누르면 설명·방법들 · 다섯 개 시장 다」
  방법마다 「내일 오를 확률 p1 · 5일 뒤 오를 확률 p5」를 내고, 경험적 베이즈 + 유효 독립 개수로 합친다 (10/14 밤 — 심리·자금·일정·폭·수급 지표는 prob_x.py).
  지난 예측은 실제 결과로 채점(브라이어 점수·적중률·보정표) → archive/x/prob.json, prob_hist.json
    ① 기저율      지금과 같은 상태(연속 하락/상승 일수 · 5일 수익률)였던 과거 날들의 다음 날·5일 결과
    ② 추세 국면   200일선 위/아래 · 50일선 기울기 국면별 과거 결과
    ③ 변동성      실현 변동성 백분위(미국은 VIX)별 과거 결과 + 68% 예상 폭
    ④ 선행 시장   아시아 = 직전 미국 S&P 등락 · 미국 = 선물이 가리키는 갭 → 과거 같은 때의 결과
    ⑤ 과매도·과매수  RSI(14)·5일 수익률 극단 → 되돌림 확률 (수급 대용)
    ⑥ 모멘텀·계절성  12-1개월 모멘텀 부호 · 요일 · 월말월초
    ⑦ 이벤트      FOMC·CPI 등 큰 이벤트 날은 방향 기울기 없이 폭만 넓힘
    ⑧ 두뇌 국면   🧠 시황 두뇌의 regime(위험 선호/중립/회피) → 작은 기울기
    ⑨ 로지스틱 앙상블  ①~⑥ 특성으로 학습한 로지스틱 회귀(워크포워드 검증 AUC 공개)
    ⑩ 결합·보정   로그오즈 평균 + 0.5 쪽 수축 + 지난 예측 채점
  python prob.py            FAKE=1 python prob.py (야후 없이 가짜 자료로 계산만 시험)
"""
import datetime as dt
import json
import math
import os
import time
import urllib.request

import numpy as np
import pandas as pd

import prob_x

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
FAKE = os.environ.get("FAKE") == "1"
OUT = os.path.join("archive", "x", "prob.json")
HIST = os.path.join("archive", "x", "prob_hist.json")
MSR = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/"
EV_FILE = os.path.join("archive", "x", "prob_events.json")   # 두뇌가 채울 수 있는 이벤트 목록 [{"d":"2026-10-14","t":"미 9월 CPI","mk":["US","KR"]}]

MK = {
    "KR": {"ix": "^KS11", "name": "한국", "flag": "🇰🇷", "ixn": "코스피", "tz": "Asia/Seoul", "open": 900, "close": 1530, "lead": "US_prev", "iv": None},
    "JP": {"ix": "^N225", "name": "일본", "flag": "🇯🇵", "ixn": "닛케이225", "tz": "Asia/Tokyo", "open": 900, "close": 1530, "lead": "US_prev", "iv": None},
    "CN": {"ix": "000001.SS", "name": "중국", "flag": "🇨🇳", "ixn": "상해종합", "tz": "Asia/Shanghai", "open": 930, "close": 1500, "lead": "US_prev", "iv": None},
    "HK": {"ix": "^HSI", "name": "홍콩", "flag": "🇭🇰", "ixn": "항셍", "tz": "Asia/Hong_Kong", "open": 930, "close": 1610, "lead": "US_prev", "iv": None},
    "US": {"ix": "^GSPC", "name": "미국", "flag": "🇺🇸", "ixn": "S&P500", "tz": "America/New_York", "open": 930, "close": 1600, "lead": "fut", "iv": "^VIX"},
}
# 10/15 11시 #4: 미국 상장 국가 ETF — 아시아 마감 뒤 미국 장에서 그 나라 주식이 더 움직인 몫(ETF 등락 − 그날 지수 등락)
#   검증(probe_tmp · 2012~ 약 3,500일, 2019-05 기준 앞/뒤 절반 · 닻 칸 확률에 로그오즈 0.16×초과%p, ±0.3 상한):
#   브라이어 한국(EWY) 0.2253→0.2214 · 0.2308→0.2262 (최근 2년 0.2316→0.2271) / 일본(EWJ) 0.2091→0.2056 · 0.2202→0.2177
#   / 홍콩(EWH) 0.2384→0.2359 · 0.2341→0.2306 — 세 시장 모두 두 기간·최근 2년 같은 쪽. 중국(FXI)은 최근 2년 나빠져 뺌.
#   EWY 초과 +0.5%↑ 뒤 코스피 오름 69~71% · −0.5%↓ 뒤 31~39% (평소 52~56%)
ETF_X = {"KR": "EWY", "JP": "EWJ", "HK": "EWH"}
ETF_B = 0.16
ETF_CAP = 0.3
# 🌅 10/24 #15 「먼저 열린 아시아」: 중국·홍콩 개장(09:30 = 한국·일본 10:30) 전에 한국·일본이 1시간 넘게 거래한 등락에서
#   간밤 미국+선물이 이미 설명한 몫(0.79배)을 뺀 나머지로 중국·홍콩 닻을 기울임.
#   검증(probe/early_bt.py · 야후 60분봉 2023-10~ 약 500일, 2025-08 기준 앞/뒤 절반): 로짓 브라이어
#   중국 0.2435→0.2282 · 0.2499→0.2363 / 홍콩 0.2335→0.2267 · 0.2441→0.2388 (두 기간 모두 개선)
#   나머지 +0.3%↑ 뒤 상해 오름 71%·66% (평소 57%·54%) · −0.3%↓ 뒤 49%·40% / 항셍 59%·65% vs 51%·50% · 45%·38%
#   계수는 두 기간 적합값(중국 0.34~0.51 · 홍콩 0.20~0.29 /1%p)보다 낮게, 로그오즈 ±0.3 상한
EARLY_B = {"CN": 0.3, "HK": 0.2}
EARLY_BETA = 0.79
EARLY_CAP = 0.3
# 🗾 10/27 #12 「CME 닛케이 선물(NKD=F) 마감 뒤 등락」: 그 나라 지수 마감(15:30) → 개장 직전 NKD 등락 중
#   간밤 미국+선물이 이미 설명한 몫(0.9배)을 뺀 나머지로 일본·한국 닻을 기울임.
#   검증(probe/gap_bt.py · 야후 60분봉 2024-06~ 약 500일, 앞/뒤 절반 · 닻 = 간밤 미국+선물+국가 ETF 로짓):
#   일본 브라이어 0.2120→0.1703 · 0.2076→0.1712 (1.0/1%p, ±1.0 상한) · 나머지 +0.3%↑ 뒤 닛케이 오름 74%·87% vs 평소 54% · −0.3%↓ 30%·28%
#   한국 0.2166→0.2106 · 0.2132→0.2122 (0.5/1%p, ±0.3 상한 — 칸 비율이 앞 기간 거의 같아 작게) · 시가 갭 설명력 R² 일본 0.45→0.80 · 한국 0.42→0.62
#   계수는 두 기간 적합값(일본 1.6~2.0 · 한국 0.46~0.71 /1%p)보다 낮게. 원달러·엔달러(KRW=X·JPY=X)는 브라이어 엇갈려 뺌
NKD_B = {"JP": 1.0, "KR": 0.5}
NKD_CAP = {"JP": 1.0, "KR": 0.3}
NKD_BETA = 0.9
# 🔌 10/29 12시 #25 「미 반도체 초과 등락」: 아시아 마감 뒤 미국 장에서 필라델피아 반도체(^SOX) 등락 − S&P 등락 → 한국 닻을 조금 기울임
#   검증(probe/sox_bt.py · 야후 2001~ 6,163일, 2013-11 기준 앞/뒤 · 닻 = 간밤 S&P + EWY 초과 로지스틱 위에 더함):
#   교차 브라이어 0.22671→0.22591 · 0.23588→0.23537 / 해마다 다시 맞춰 걸어가기 2008~ 앞 0.23167 그대로 · 뒤 0.22293→0.22187 · 최근5년 0.21869→0.21703
#   S&P·EWY 로 설명 못 한 몫 −1%p↓ 뒤 코스피 오름 51.3%·46.7%(평소 54.1·54.2, n 674·482) · +1%p↑ 뒤 55.3·59.0%
#   적합 계수 0.069~0.084 /1%p 보다 낮게 0.06, 로그오즈 ±0.2 상한. 일본은 두 기간 엇갈림(➖ · CME 닛케이 선물 닻이 같은 시간대를 덮음) · 홍콩 ❌
SOX_B = {"KR": 0.06}
SOX_CAP = 0.2
EXTRA = ["^VIX", "ES=F", "^SOX"] + list(ETF_X.values()) + prob_x.XSYMS
# 2026 FOMC 결정일 (둘째 날) — 연준 공개 일정. 그 밖의 이벤트는 prob_events.json 에서
FOMC_2026 = ["2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17", "2026-07-29", "2026-09-16", "2026-10-28", "2026-12-09",
             # 10/23 #5: 연준 fomccalendars.htm 에서 읽은 2027 일정 (probe/fomc_bt.py)
             "2027-01-27", "2027-03-17", "2027-04-28", "2027-06-09", "2027-07-28", "2027-09-15", "2027-10-27", "2027-12-08"]
SHRINK = 0.6          # (옛 방식 — 기록용) 10/14 밤부터는 아래 경험적 베이즈 + 유효 독립 개수로 결합
N0 = 150              # 경험적 베이즈: 표본 n 인 방법의 기울기를 n/(n+N0) 만큼만 믿음
RHO = 0.6             # 방법끼리 평균 상관 (같은 가격에서 나온 지표라 꽤 겹침) → 유효 독립 개수 m/(1+(m−1)ρ)
CAP = 0.45            # 결합 로그오즈 기울기 상한 (±약 11%p)
MIN_N = 30            # 조건부 통계 최소 표본
# 🧭 10/15 「닻」: 그날 확률을 실제로 크게 움직이는 「이미 아는 정보」(간밤 미국 · 미국 선물 갭 · 장중 등락)는 여러 의견 중 하나로 평균 내지 않고 출발점으로 씀
LEAD_E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]   # 9칸
LEAD_PRIOR = 20       # 칸 비율을 평소 쪽으로 당기는 세기(베타 사전 20일치) — 검증에서 쓴 값
POST_OK = {"KR", "JP", "CN", "HK"}   # #3 마감 뒤 선물 더하기 — 검증 통과 시장
LEAD_HIT = {"KR": "53.5→61.8%", "JP": "51.7→65.1%", "CN": "51.8→56.7%", "HK": "50.0→59.6%", "US": "54.3→63.7%"}
OTHERS_CAP = 0.2      # 닻 위에 나머지 방법들이 더할 수 있는 로그오즈 (±약 5%p)
AUTO_W = {}
ERRS = []


def get(url, timeout=30):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def logit(p):
    p = min(max(p, 0.02), 0.98)
    return math.log(p / (1 - p))


def sigm(x):
    return 1 / (1 + math.exp(-x))


def r2(v, n=2):
    return None if v is None or (isinstance(v, float) and math.isnan(v)) else round(float(v), n)


# ---------------- 자료 ----------------
def load_hist(syms):
    if FAKE:
        rng = np.random.default_rng(7)
        idx = pd.bdate_range("2001-01-01", NOW.date())
        out = {}
        for s in syms:
            r = rng.normal(0.0003, 0.012, len(idx))
            c = 1000 * np.exp(np.cumsum(r))
            o = c * (1 + rng.normal(0, 0.004, len(idx)))
            out[s] = pd.DataFrame({"Open": o, "Close": c}, index=idx)
        out["^VIX"] = pd.DataFrame({"Open": 18 + rng.normal(0, 3, len(idx)), "Close": 18 + rng.normal(0, 3, len(idx))}, index=idx).clip(9, 80)
        return out
    import yfinance as yf
    df = yf.download(syms, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
    out = {}
    for s in syms:
        try:
            sub = df[s][["Open", "Close"]].dropna(subset=["Close"])
            sub.index = pd.to_datetime(sub.index).tz_localize(None)
            out[s] = sub[~sub.index.duplicated(keep="last")]
        except Exception as e:
            print("자료 없음", s, e)
    # 10/15: 여러 종목을 한 번에 받으면 가끔 한 지수(^KS11 등)가 통째로 빠짐 → 시장 지수는 하나씩 한 번 더
    for s in {c["ix"] for c in MK.values()}:
        if s not in out or len(out[s]) < 600:
            try:
                one = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
                if isinstance(one.columns, pd.MultiIndex):
                    one.columns = one.columns.get_level_values(0)
                one = one[["Open", "Close"]].dropna(subset=["Close"])
                one.index = pd.to_datetime(one.index).tz_localize(None)
                out[s] = one[~one.index.duplicated(keep="last")]
                print("다시 받음", s, len(out[s]))
            except Exception as e:
                print("다시 받기 실패", s, e)
    return out


# 📅 10/15 사용자: "한국장은 오늘이 15일인데 15일 확률을 얘기해야지" — 야후 일봉이 아시아 지수의 어제 봉을
#   늦게(몇 시간~반나절) 올려서 10/15 아침에도 10/13 마감 기준 「10/14」 확률이 떴음.
#   → 장중 나침반(live_*.json: 한국 = 네이버, 나머지 = 야후 장중)이 이미 가진 마감 값으로 빠진 마지막 봉을 채움
LIVE_IX = {"KR": ("kr", "코스피"), "JP": ("jp", "닛케이 225"), "CN": ("cn", "상해종합"), "HK": ("hk", "항셍"), "US": ("us", "S&P500")}
PATCHED = {}

def patch_live(H):
    from zoneinfo import ZoneInfo
    for mk, (f, nm) in LIVE_IX.items():
        cfg, px = MK[mk], H.get(MK[mk]["ix"])
        if px is None or not len(px):
            continue
        try:
            j = json.load(open(os.path.join("archive", "x", f"live_{f}.json"), encoding="utf-8"))
        except Exception:
            continue
        ix = next((x for x in j.get("index") or [] if x.get("name") == nm and x.get("last")), None)
        if not ix:
            continue
        d = ix.get("date") or j.get("sess") or j.get("date")      # 한국은 index 에 date 가 없음 → 파일 date
        if not d:
            continue
        loc = NOW.astimezone(ZoneInfo(cfg["tz"]))
        ld, hm = loc.strftime("%Y-%m-%d"), loc.hour * 100 + loc.minute
        closed = d < ld or (d == ld and hm >= cfg["close"] + 10) or (mk == "KR" and ix.get("status") == "CLOSE" and d == ld and hm >= cfg["close"])
        done = px[px.index < pd.Timestamp(ld)]                     # 10/15: 오늘 장중 봉은 빼고 「마감된 마지막 봉」과 비교
        if not len(done):
            continue
        last_bar = done.index[-1].strftime("%Y-%m-%d")
        if not closed and d == ld and ix.get("chg") is not None:
            # 10/15 09시: 장중엔 야후가 오늘 장중 봉은 주면서 어제 봉은 아직 없는 날이 있음(→ 그저께 기준으로 계산됨)
            #   live 의 「지금 값 ÷ (1+등락률)」 = 어제 종가 → 빠진 어제 봉을 채움 (오늘 장중 봉은 그대로 두고 prob 이 장중 닻으로 씀)
            pc = float(ix["last"]) / (1 + float(ix["chg"]) / 100)
            pd_ = (pd.Timestamp(d) - pd.offsets.BDay(1))
            bars = set(px.index.strftime("%Y-%m-%d"))
            if pd_.strftime("%Y-%m-%d") not in bars and pd_ > px[px.index < pd.Timestamp(d)].index[-1]:
                H[cfg["ix"]] = pd.concat([px, pd.DataFrame({"Open": [pc], "Close": [pc]}, index=[pd_])]).sort_index()
                PATCHED[mk] = pd_.strftime("%Y-%m-%d")
                print(f"📅 {mk} 장중 — 빠진 어제 봉 채움: {pd_.date()} {pc:.2f} (live 지금 {ix['last']} · {ix['chg']:+.2f}%)")
            continue
        if d <= last_bar or not closed or pd.Timestamp(d).dayofweek >= 5 or d in set(px.index.strftime("%Y-%m-%d")):
            continue
        c = float(ix["last"])
        row = pd.DataFrame({"Open": [c], "Close": [c]}, index=[pd.Timestamp(d)])   # 시가는 모름 → 종가로 (갭 특성 하루치만 0)
        H[cfg["ix"]] = pd.concat([px, row]).sort_index()
        PATCHED[mk] = d
        print(f"📅 {mk} 마지막 봉 채움: {last_bar} → {d} {c} (live_{f}.json)")


def feats(px):
    """지수 일봉 → 특성 표"""
    c = px["Close"].astype(float)
    d = pd.DataFrame(index=px.index)
    d["c"] = c
    d["r"] = c.pct_change()
    d["r5"] = c.pct_change(5)
    d["r20"] = c.pct_change(20)
    d["mom"] = c.shift(21) / c.shift(252) - 1                       # 12-1개월 모멘텀
    d["ma200"] = (c > c.rolling(200).mean()).astype(float)
    ma50 = c.rolling(50).mean()
    d["ma50s"] = (ma50 > ma50.shift(10)).astype(float)
    d["rv"] = d["r"].rolling(20).std() * math.sqrt(252) * 100
    d["rvp"] = d["rv"].rolling(500, min_periods=120).rank(pct=True)
    delta = c.diff()
    up = delta.clip(lower=0).ewm(alpha=1 / 14, adjust=False).mean()
    dn = (-delta.clip(upper=0)).ewm(alpha=1 / 14, adjust=False).mean()
    d["rsi"] = 100 - 100 / (1 + up / dn.replace(0, np.nan))
    # 연속 일수 (+n 연속 상승, −n 연속 하락)
    s = np.sign(d["r"].fillna(0).values)
    st = np.zeros(len(s))
    for i in range(1, len(s)):
        st[i] = st[i - 1] + s[i] if s[i] != 0 and (st[i - 1] == 0 or np.sign(st[i - 1]) == s[i]) else s[i]
    d["streak"] = st
    d["gap"] = px["Open"].astype(float) / c.shift(1) - 1                 # 시가 갭
    d["dow"] = d.index.dayofweek
    m = d.index.to_period("M")
    pos = d.groupby(m).cumcount()
    nx = d.index + pd.offsets.BDay(1)
    d["tom"] = ((pos.values <= 2) | (nx.month != d.index.month)).astype(float)   # 월초 3일 + 월말 마지막 날
    # 목표: 다음 날 · 5일 뒤
    d["y1"] = (c.shift(-1) > c).astype(float).where(c.shift(-1).notna())
    d["y5"] = (c.shift(-5) > c).astype(float).where(c.shift(-5).notna())
    d["f1"] = c.shift(-1) / c - 1
    d["f5"] = c.shift(-5) / c - 1
    return d


def cond(d, mask, label):
    """조건에 맞는 과거 날들의 결과 → (p1, p5, n, 중앙값1, 중앙값5, 분위)"""
    h = d[mask & d["y1"].notna()]
    h5 = d[mask & d["y5"].notna()]
    n = int(len(h))
    if n < 5:
        return None
    q = h5["f5"].quantile([0.05, 0.25, 0.5, 0.75, 0.95]).values * 100 if len(h5) >= 5 else [None] * 5
    return {"p1": float(h["y1"].mean()), "p5": float(h5["y5"].mean()) if len(h5) else None, "n": n,
            "m1": float(h["f1"].median() * 100), "m5": float(h5["f5"].median() * 100) if len(h5) else None,
            "q5": [r2(x) for x in q], "label": label}


def streak_bucket(v):
    v = int(v)
    if v <= -5: return "5일↑ 연속 하락"
    if v <= -3: return "3~4일 연속 하락"
    if v < 0: return "1~2일 하락"
    if v >= 5: return "5일↑ 연속 상승"
    if v >= 3: return "3~4일 연속 상승"
    return "1~2일 상승"


def sb_mask(d, v):
    v = int(v)
    if v <= -5: return d["streak"] <= -5
    if v <= -3: return (d["streak"] <= -3) & (d["streak"] >= -4)
    if v < 0: return (d["streak"] < 0) & (d["streak"] >= -2)
    if v >= 5: return d["streak"] >= 5
    if v >= 3: return (d["streak"] >= 3) & (d["streak"] <= 4)
    return (d["streak"] > 0) & (d["streak"] <= 2)


def logistic_fit(X, y, iters=25, l2=1.0):
    """numpy 로지스틱 회귀 (뉴턴법, L2)"""
    n, k = X.shape
    Xb = np.hstack([np.ones((n, 1)), X])
    w = np.zeros(k + 1)
    for _ in range(iters):
        p = 1 / (1 + np.exp(-Xb @ w))
        g = Xb.T @ (p - y) + l2 * np.r_[0, w[1:]]
        W = p * (1 - p)
        H = (Xb * W[:, None]).T @ Xb + l2 * np.diag(np.r_[0, np.ones(k)])
        try:
            w -= np.linalg.solve(H, g)
        except Exception:
            break
    return w


def auc(y, s):
    o = np.argsort(s)
    r = np.empty(len(s)); r[o] = np.arange(1, len(s) + 1)
    npos = y.sum(); nneg = len(y) - npos
    if npos == 0 or nneg == 0:
        return None
    return float((r[y == 1].sum() - npos * (npos + 1) / 2) / (npos * nneg))


def asia_early(mk, loc_mk):
    """🌅 #15: 중국·홍콩 개장 전, 한국·일본이 연 지 60분 넘었으면 두 지수의 지금 등락 평균(live_*.json). 아니면 None."""
    from zoneinfo import ZoneInfo
    if FAKE:
        return None
    vals, names = [], []
    for k in ("KR", "JP"):
        try:
            cfg = MK[k]; loc = NOW.astimezone(ZoneInfo(cfg["tz"]))
            hm = loc.hour * 60 + loc.minute; op = cfg["open"] // 100 * 60 + cfg["open"] % 100
            cl = cfg["close"] // 100 * 60 + cfg["close"] % 100
            if loc.weekday() >= 5 or not (op + 60 <= hm < cl) or loc.strftime("%Y-%m-%d") != loc_mk.strftime("%Y-%m-%d"):
                continue
            f_, nm_ = LIVE_IX[k]
            j = json.load(open(os.path.join("archive", "x", f"live_{f_}.json"), encoding="utf-8"))
            d = j.get("sess") or j.get("date")
            ix = next((x for x in j.get("index") or [] if x.get("name") == nm_ and x.get("chg") is not None), None)
            t = str(j.get("t") or "")
            if not ix or d != loc.strftime("%Y-%m-%d") or ix.get("status") == "CLOSE":
                continue
            if len(t) >= 5 and ":" in t:                    # 30분 넘게 묵은 값은 안 씀 (한국 시각 HH:MM)
                kst = NOW.astimezone(ZoneInfo("Asia/Seoul")); tm = int(t[:2]) * 60 + int(t[3:5])
                if abs(kst.hour * 60 + kst.minute - tm) > 30:
                    continue
            vals.append(float(ix["chg"]) / 100); names.append(cfg["ixn"])
        except Exception as ex:
            print("먼저 열린 아시아 읽기 실패", k, ex)
    if not vals:
        return None
    return sum(vals) / len(vals), "·".join(names)


def is_open_now(cfg):
    from zoneinfo import ZoneInfo
    loc = NOW.astimezone(ZoneInfo(cfg["tz"]))
    hm = loc.hour * 100 + loc.minute
    return loc.weekday() < 5 and cfg["open"] <= hm < cfg["close"], loc


# ⏱️ 10/15 장중 닻 실측 보정 (probe/intra_bt.py · 야후 60분봉 약 730일): 장 시작 뒤 경과 분 → 「남은 흔들림 ÷ 하루 흔들림²」
#   무작위 걸음(남은 시간 비율)은 한국·일본·홍콩에서 너무 소심했음 — 하루 흔들림의 큰 몫이 시가 갭이라 장중 남은 흔들림이 훨씬 작음
#   (코스피 1시간 뒤 실측 0.40 vs 시간 비율 0.85). 앞 1년→뒤 1년 · 뒤→앞 둘 다 브라이어 개선(한국 0.095→0.085 · 0.099→0.090,
#   일본 0.092→0.082 · 0.096→0.087, 홍콩 0.088→0.080 · 0.101→0.096). 중국·미국은 개선 없음(섞임) → 무작위 걸음 그대로.
INTRA_VH = {"KR": {60: 0.398, 120: 0.27, 180: 0.18, 240: 0.138, 300: 0.091, 360: 0.033},
            "JP": {60: 0.274, 120: 0.205, 180: 0.176, 240: 0.106, 300: 0.063, 360: 0.018},
            "HK": {60: 0.346, 120: 0.239, 180: 0.216, 240: 0.16, 300: 0.085, 360: 0.024}}

def intra_var(mk, el, tot, rem):
    t = INTRA_VH.get(mk)
    if not t:
        return rem
    pts = [(0, 1.0)] + sorted(t.items()) + [(tot, 0.003)]   # 개장 직후는 보수적으로 1.0 에서 출발(실측 없는 구간)
    for (a, va), (b, vb) in zip(pts, pts[1:]):
        if a <= el <= b:
            return max(0.003, va + (vb - va) * (el - a) / (b - a or 1))
    return max(0.003, rem)


# ---------------- 시장 하나 ----------------
_ES30 = {}
def es_post(day):
    """미국 날짜 day 의 뉴욕 16:00 뒤 ~ 지금 S&P 선물(ES=F 30분봉) 등락. 실패하면 None."""
    if FAKE:
        return 0.001
    try:
        import yfinance as yf
        from zoneinfo import ZoneInfo
        ny = ZoneInfo("America/New_York")
        if "ic" not in _ES30:
            ib = yf.download("ES=F", period="5d", interval="30m", progress=False, auto_adjust=False)
            ic = ib["Close"].dropna()
            ic = ic.iloc[:, 0] if hasattr(ic, "columns") else ic
            ic.index = pd.to_datetime(ic.index).tz_convert(ny)
            _ES30["ic"] = ic
        ic = _ES30["ic"]
        cut = pd.Timestamp(day.strftime("%Y-%m-%d") + " 16:00", tz=ny)
        before, after = ic[ic.index < cut], ic[ic.index >= cut]
        if len(before) and len(after) and (cut - before.index[-1]) <= pd.Timedelta(hours=1):
            return float(after.iloc[-1] / before.iloc[-1] - 1)
    except Exception as ex:
        print("선물 마감 뒤 실패", ex)
    return None


_NKD = {}
def nkd_post(mk, day):
    """🗾 #12: 시장 mk 의 마지막 마감일 day 15:30(현지) → 지금 CME 닛케이 선물(NKD=F 60분봉) 등락. 실패하면 None."""
    if FAKE:
        return None
    try:
        import yfinance as yf
        if "s" not in _NKD:
            b = yf.download("NKD=F", period="5d", interval="60m", progress=False, auto_adjust=False)["Close"].dropna()
            b = b.iloc[:, 0] if hasattr(b, "columns") else b
            i = pd.to_datetime(b.index); b.index = (i.tz_localize("UTC") if i.tz is None else i).tz_convert("UTC")
            _NKD["s"] = b.sort_index()
        s = _NKD["s"]; hr = pd.Timedelta(minutes=60)
        cut = pd.Timestamp(day.strftime("%Y-%m-%d") + " 15:30", tz=MK[mk]["tz"]).tz_convert("UTC")
        q = s[s.index + hr <= cut]
        now = pd.Timestamp(NOW).tz_convert("UTC")
        if not len(q) or cut - (q.index[-1] + hr) > pd.Timedelta(hours=3) or s.index[-1] <= q.index[-1] or now - s.index[-1] > pd.Timedelta(hours=3):
            return None
        return float(s.iloc[-1] / q.iloc[-1] - 1)
    except Exception as ex:
        print("닛케이 선물 실패", ex)
    return None


def market(mk, H, brain, events, G=None, ext=None, breadth=None):
    cfg = MK[mk]
    px = H.get(cfg["ix"])
    if px is None or len(px) < 600:
        ERRS.append(f"{mk}: 지수 일봉 부족 — {cfg['ix']} {0 if px is None else len(px)}개 (야후 응답 문제)")
        return None
    open_now, loc = is_open_now(cfg)
    # 예측 기준일: 마지막 봉이 오늘이고 장중이면 「오늘 종가 기준 내일」을 아직 못 세움 → 그 봉(장중 값)을 떼고 어제 마감 기준으로 「오늘」
    #   10/15: 뗀 장중 값은 버리지 않고 「장중 닻」으로 씀 — 지금 +x% 이고 남은 시간이 이만큼이면 종가가 어제보다 높을 확률
    partial = None
    if open_now and len(px) and px.index[-1].strftime("%Y-%m-%d") == loc.strftime("%Y-%m-%d"):
        partial = float(px["Close"].iloc[-1]); px = px.iloc[:-1]
    if open_now and partial is None and mk in LIVE_IX and not FAKE:
        # 10/15: 야후가 오늘 장중 봉을 안 줄 때가 많음 → 장중 나침반 live_*.json(한국 네이버·나머지 야후 장중, 10분마다)의 지금 값
        try:
            f_, nm_ = LIVE_IX[mk]
            j_ = json.load(open(os.path.join("archive", "x", f"live_{f_}.json"), encoding="utf-8"))
            ix_ = next((x for x in j_.get("index") or [] if x.get("name") == nm_ and x.get("last")), None)
            if ix_ and (ix_.get("date") or j_.get("sess") or j_.get("date")) == loc.strftime("%Y-%m-%d"):
                partial = float(ix_["last"])
                print(f"⏱️ {mk} 장중 값(live {j_.get('t')}): {partial} ({ix_.get('chg')}%)")
        except Exception as ex:
            print("장중 live 실패", mk, ex)
    d = feats(px)
    last = d.iloc[-1]
    today = d.index[-1]
    base_date = today.strftime("%Y-%m-%d")
    M = []   # 방법들

    # ① 기저율
    m = cond(d, sb_mask(d, last["streak"]) & (np.sign(d["r5"]) == np.sign(last["r5"])), streak_bucket(last["streak"]) + (" · 5일 수익 " + ("+" if last["r5"] > 0 else "−")))
    if not m or m["n"] < MIN_N:
        m = cond(d, sb_mask(d, last["streak"]), streak_bucket(last["streak"]))
    if m:
        M.append({"k": "base", "ic": "📚", "name": "기저율", "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": 1.0,
                  "ev": f"지금 상태 = {m['label']} · 2000년 이후 같은 날 {m['n']}번 → 다음 날 상승 {m['p1']*100:.0f}% · 5일 뒤 상승 {m['p5']*100:.0f}% (5일 중앙값 {m['m5']:+.1f}%)",
                  "q5": m["q5"]})
    # ② 추세 국면
    lab = ("200일선 위" if last["ma200"] else "200일선 아래") + " · 50일선 " + ("오름" if last["ma50s"] else "내림")
    m = cond(d, (d["ma200"] == last["ma200"]) & (d["ma50s"] == last["ma50s"]), lab)
    if m:
        M.append({"k": "trend", "ic": "📈", "name": "추세 국면", "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": 0.8,
                  "ev": f"{lab} 국면 {m['n']}일 → 다음 날 {m['p1']*100:.0f}% · 5일 {m['p5']*100:.0f}%"})
    # ③ 변동성 (+ 미국 VIX)
    rvp = last["rvp"]
    if not np.isnan(rvp):
        b = "높음(상위 20%)" if rvp >= 0.8 else "낮음(하위 20%)" if rvp <= 0.2 else "보통"
        mask = d["rvp"] >= 0.8 if rvp >= 0.8 else d["rvp"] <= 0.2 if rvp <= 0.2 else (d["rvp"] > 0.2) & (d["rvp"] < 0.8)
        m = cond(d, mask, "변동성 " + b)
        sig_d = float(last["rv"]) / math.sqrt(252)
        src = f"실현 변동성 연 {last['rv']:.0f}%"
        if cfg["iv"] and cfg["iv"] in H and len(H[cfg["iv"]]):
            iv = float(H[cfg["iv"]]["Close"].iloc[-1])
            sig_d = iv / math.sqrt(252)
            src = f"VIX {iv:.1f} (실현 {last['rv']:.0f}%)"
        if m:
            M.append({"k": "vol", "ic": "🌊", "name": "변동성", "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": 0.7,
                      "ev": f"{src} · 변동성 {b} 국면 {m['n']}일 → 다음 날 {m['p1']*100:.0f}% · 5일 {m['p5']*100:.0f}%", "sig1": sig_d, "sig5": sig_d * math.sqrt(5)})
    # ④ 선행 시장
    sp = H.get("^GSPC")
    if cfg["lead"] == "US_prev" and sp is not None:
        us = sp["Close"].pct_change()
        # 10/15 고침: 아시아 행 t 의 y1 = (아시아 t+1 > t). 그 사이에 열리는 건 「미국 날짜 t」 장(아시아 t 마감 뒤 · t+1 개장 전).
        #   예전엔 .shift(1) 로 미국 t−1(이미 아시아 t 종가에 반영된 것)을 써서 동전 던지기가 됐음.
        #   검증(probe/lead_bt.json, 2012~ 걸어가며): 코스피 적중 53.5→61.8% · 닛케이 51.7→65.1% · 항셍 50.0→59.6% · 상해 51.8→56.7%
        us_t = us.reindex(d.index)                                # 미국 휴장인 날은 비움
        cur_us = float(us.dropna().iloc[-1]) if len(us.dropna()) else 0.0
        us_last = us.dropna().index[-1] if len(us.dropna()) else None
        us_d = us_last.strftime("%m/%d") if us_last is not None else ""
        fresh = us_last is not None and us_last >= today          # 아시아 마지막 마감 뒤에 열린 미국 장이 있어야 「간밤 정보」
        bks = pd.Series(np.digitize(us_t.values, LEAD_E9), index=d.index).where(us_t.notna())
        # 10/15 10시 #3: 미국 마감(뉴욕 16:00) 뒤 ~ 아시아 개장 전 선물 등락을 더해 칸을 고름 (「간밤 미국 + 그 뒤 선물」 = 개장 전 아는 전부)
        #   검증(probe/post_bt.py · ES 60분봉 2년 약 550일 · 이 코드와 같은 「2012~ 일봉 칸 + 합친 값」 · 앞/뒤 절반 모두 브라이어 개선):
        #   한국 0.218→0.212 · 0.224→0.211 / 일본 0.214→0.207 · 0.224→0.208 / 홍콩 0.233→0.229 · 0.248→0.243 / 중국 0.240→0.239 · 0.249→0.246(작음)
        #   선물 +0.2%↑ 뒤 코스피 오름 70%(83일) · −0.2%↓ 뒤 38%(73일) (평소 59%) — 앞/뒤 기간 모두 같은 쪽
        post = es_post(us_last) if (fresh and not open_now and mk in POST_OK) else None
        cur_s = cur_us + (post or 0.0)
        m = cond(d, bks == int(np.digitize([cur_s], LEAD_E9)[0]), "미국 간밤 " + f"{cur_s*100:+.1f}%") if fresh else None
        if m:
            pa = (m["p1"] * m["n"] + LEAD_PRIOR * float(d["y1"].mean())) / (m["n"] + LEAD_PRIOR)
            pt = f" + 마감 뒤 선물 {post*100:+.2f}% = {cur_s*100:+.2f}%" if post is not None else ""
            # #4 국가 ETF 초과 등락(아시아 마감 뒤 미국 장에서 더 움직인 몫)으로 닻을 조금 기울임
            etf, et = ETF_X.get(mk), ""
            try:
                if etf and H.get(etf) is not None and len(px) > 2:
                    er = H[etf]["Close"].pct_change().dropna()
                    if len(er) and er.index[-1] == us_last:
                        ex_ = float(er.iloc[-1]) - float(px["Close"].iloc[-1] / px["Close"].iloc[-2] - 1)
                        adj = max(-ETF_CAP, min(ETF_CAP, ETF_B * ex_ * 100))
                        pa0 = pa; pa = sigm(logit(pa) + adj)
                        et = f" · 🇺🇸 {etf}(미국 상장 ETF)가 {cfg['ixn']} 마감 뒤 {ex_*100:+.2f}%p 더 움직임 → 닻 {pa0*100:.0f}→{pa*100:.0f}%(2012~ 검증)"
            except Exception as ex:
                print("국가 ETF 실패", mk, ex)
            pt += et
            try:
                sxh = H.get("^SOX")
                if mk in SOX_B and sxh is not None and len(sxh) > 2:
                    sr_ = sxh["Close"].pct_change().dropna()
                    if len(sr_) and sr_.index[-1] == us_last:
                        sx_ = float(sr_.iloc[-1]) - cur_us
                        adj = max(-SOX_CAP, min(SOX_CAP, SOX_B[mk] * sx_ * 100))
                        pa0 = pa; pa = sigm(logit(pa) + adj)
                        pt += f" · 🔌 미 반도체(SOX)가 S&P보다 {sx_*100:+.2f}%p → 닻 {pa0*100:.0f}→{pa*100:.0f}%(2001~ 검증)"
            except Exception as ex:
                print("반도체 닻 실패", mk, ex)
            try:
                nk = nkd_post(mk, today) if (mk in NKD_B and not open_now and post is not None) else None
                if nk is not None:
                    res_ = nk - NKD_BETA * cur_s
                    adj = max(-NKD_CAP[mk], min(NKD_CAP[mk], NKD_B[mk] * res_ * 100))
                    pa0 = pa; pa = sigm(logit(pa) + adj)
                    pt += f" · 🗾 닛케이 선물(CME) {cfg['ixn']} 마감 뒤 {nk*100:+.2f}%(간밤 미국이 설명한 몫 빼면 {res_*100:+.2f}%p) → 닻 {pa0*100:.0f}→{pa*100:.0f}%(60분봉 2년 검증)"
            except Exception as ex:
                print("닛케이 선물 닻 실패", mk, ex)
            try:
                ea = asia_early(mk, loc) if (mk in EARLY_B and not open_now and post is not None) else None
                if ea is not None:
                    res_ = ea[0] - EARLY_BETA * cur_s
                    adj = max(-EARLY_CAP, min(EARLY_CAP, EARLY_B[mk] * res_ * 100))
                    pa0 = pa; pa = sigm(logit(pa) + adj)
                    pt += f" · 🌅 먼저 열린 {ea[1]} {ea[0]*100:+.2f}%(간밤 미국이 설명한 몫 빼면 {res_*100:+.2f}%p) → 닻 {pa0*100:.0f}→{pa*100:.0f}%(60분봉 2년 검증)"
            except Exception as ex:
                print("먼저 열린 아시아 실패", mk, ex)
            M.append({"k": "lead", "ic": "🛰️", "name": "선행 시장 (간밤 미국" + (" + 선물" if post is not None else "") + ")", "p1": pa, "p5": m["p5"], "n": m["n"], "w": 0.9, "anchor": 1,
                      "ev": f"간밤 미국 S&P({us_d}) {cur_us*100:+.2f}%{pt} · 비슷한 간밤 뒤 {cfg['ixn']} {m['n']}번 → 다음 날 오름 {m['p1']*100:.0f}% · 5일 {m['p5']*100:.0f}% — 🧭 오늘 확률의 닻(2012~ 검증 적중 " + LEAD_HIT.get(mk, "") + ")"})
    elif cfg["lead"] == "fut":
        es = H.get("ES=F")
        g = None
        if es is not None and len(es) > 2 and not FAKE:
            # 10/15: 일봉 날짜 표시가 세션과 어긋나서(저녁에도 어제 날짜) → 30분봉으로 「미국 마지막 마감(뉴욕 16:00) 뒤 선물 등락」을 잰다
            try:
                import yfinance as yf
                from zoneinfo import ZoneInfo
                ny = ZoneInfo("America/New_York")
                ib = yf.download("ES=F", period="5d", interval="30m", progress=False, auto_adjust=False)
                ic = ib["Close"].dropna()
                ic = ic.iloc[:, 0] if hasattr(ic, "columns") else ic
                ic.index = pd.to_datetime(ic.index).tz_convert(ny)
                cut = pd.Timestamp(today.strftime("%Y-%m-%d") + " 16:00", tz=ny)
                before, after = ic[ic.index < cut], ic[ic.index >= cut]
                if len(before) and len(after) and not open_now:
                    g = float(after.iloc[-1] / before.iloc[-1] - 1)
                    print(f"🛰️ 선물 {mk}: {today.date()} 16:00 뒤 {g*100:+.2f}% (30분봉 {after.index[-1]})")
            except Exception as ex:
                print("선물 30분봉 실패", ex)
        elif FAKE:
            g = 0.002
        if g is not None:
            def gb(v):
                return int(np.digitize([v], LEAD_E9)[0])
            # 과거: 시가 갭 g 였던 날의 「종가 > 전일 종가」 비율 — 갭이 그날 방향을 얼마나 말해 주나 (검증 2012~ 적중 54.3→63.7%)
            dd = d.copy(); dd["y0"] = (dd["c"] > dd["c"].shift(1)).astype(float)
            gp = dd["gap"].where(dd["gap"].abs() > 1e-6)              # 옛 야후 자료의 시가=전일 종가 날은 뺌
            dd["gb"] = pd.Series(np.digitize(gp.fillna(0).values, LEAD_E9), index=dd.index).where(gp.notna())
            h = dd[(dd["gb"] == gb(g)) & dd["gb"].notna()]
            m5 = cond(d, dd["gb"] == gb(g), "갭")
            if len(h) >= MIN_N:
                p_today = (float(h["y0"].sum()) + LEAD_PRIOR * float(dd["y0"].mean())) / (len(h) + LEAD_PRIOR)
                M.append({"k": "lead", "ic": "🛰️", "name": "선행 시장 (선물)", "p1": p_today, "p5": m5["p5"] if m5 else None, "n": int(len(h)), "w": 0.9, "anchor": 1,
                          "ev": f"S&P 선물 {g*100:+.2f}% → 비슷한 시가 갭이었던 {len(h)}일 중 종가가 전일보다 높게 끝난 비율 {float(h['y0'].mean())*100:.0f}%" + (f" · 5일 {m5['p5']*100:.0f}%" if m5 else "") + " — 🧭 오늘 확률의 닻(2012~ 검증 적중 " + LEAD_HIT.get(mk, "") + ")"})
    # ⑤ 과매도·과매수
    rsi = float(last["rsi"]) if not np.isnan(last["rsi"]) else 50
    if rsi <= 30 or rsi >= 70 or abs(last["r5"]) >= 0.03:
        if rsi <= 30: mask, lab = d["rsi"] <= 30, f"RSI {rsi:.0f} 과매도"
        elif rsi >= 70: mask, lab = d["rsi"] >= 70, f"RSI {rsi:.0f} 과매수"
        elif last["r5"] <= -0.03: mask, lab = d["r5"] <= -0.03, f"5일 {last['r5']*100:+.1f}% 급락"
        else: mask, lab = d["r5"] >= 0.03, f"5일 {last['r5']*100:+.1f}% 급등"
        m = cond(d, mask, lab)
        if m:
            M.append({"k": "ob", "ic": "🔁", "name": "과매도·과매수", "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": 0.8,
                      "ev": f"{lab} · 같은 극단 {m['n']}번 → 다음 날 {m['p1']*100:.0f}% · 5일 {m['p5']*100:.0f}% (되돌림 통계, 외국인 수급 자료는 아직 안 씀)"})
    else:
        M.append({"k": "ob", "ic": "🔁", "name": "과매도·과매수", "p1": None, "p5": None, "n": 0, "w": 0,
                  "ev": f"RSI {rsi:.0f} · 5일 {last['r5']*100:+.1f}% — 극단 아님, 이번엔 기울기 없음"})
    # ⑥ 모멘텀·계절성
    nxt = today + pd.offsets.BDay(1)
    ms = ~np.isnan(last["mom"])
    # 10/31 10시 고침(#44 · probe/tom_bt.py): y1 은 「내일」 등락이므로 칸도 내일의 요일·월말월초로 고른다.
    #   전에는 행 t 자신의 요일·tom 으로 골라 하루 어긋나 있었음 → 걸어가며 브라이어(2006~, 2016-05 앞/뒤·최근5년)
    #   고친 칸이 옛 칸보다 중국 세 기간·홍콩 세 기간·한국·미국 뒤/최근5년 좋아짐. 기저 대비 세 기간 모두 좋아진 곳은 중국뿐
    #   (0.24884→0.24706 · 0.24939→0.24742 · 0.24979→0.2486, 내일 월말월초 칸 +4.5·+5.9%p) → 중국 w 0.5, 나머지 작게.
    dow_n = d["dow"].shift(-1); tom_n = d["tom"].shift(-1)
    mask = (np.sign(d["mom"]) == np.sign(last["mom"])) & (dow_n == nxt.dayofweek) if ms else (dow_n == nxt.dayofweek)
    tom = (nxt + pd.offsets.BDay(1)).month != nxt.month or len(pd.bdate_range(nxt.replace(day=1), nxt)) <= 3
    if tom:
        mask = mask & (tom_n == 1)
    lab = ("12-1개월 모멘텀 " + ("+" if last["mom"] > 0 else "−") + " · " if ms else "") + "다음 날 " + "월화수목금토일"[nxt.dayofweek] + "요일" + (" · 월말월초" if tom else "")
    m = cond(d, mask, lab)
    if m and m["n"] >= MIN_N:
        M.append({"k": "season", "ic": "📅", "name": "모멘텀·계절성", "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": {"CN": 0.5, "KR": 0.3, "US": 0.3}.get(mk, 0.15),
                  "ev": f"{lab} · {m['n']}일 → 다음 날 {m['p1']*100:.0f}% · 5일 {m['p5']*100:.0f}%"})
    # ⑦ 이벤트
    ev_days = [e for e in events if mk in e.get("mk", ["US", "KR", "JP", "CN", "HK"]) and 0 <= (pd.Timestamp(e["d"]) - today).days <= 7]
    for f in FOMC_2026:
        if 0 <= (pd.Timestamp(f) - today).days <= 7:
            ev_days.append({"d": f, "t": "FOMC"})
    ev_days = sorted({(e["d"], e["t"]) for e in ev_days})
    widen = 1.0
    if ev_days:
        widen = 1.3 if any((pd.Timestamp(x[0]) - today).days <= 1 for x in ev_days) else 1.15
    M.append({"k": "event", "ic": "📣", "name": "이벤트", "p1": None, "p5": None, "n": 0, "w": 0, "widen": widen,
              "ev": ("일주일 안 이벤트: " + " · ".join(x[1] + " " + x[0][5:] for x in ev_days) + f" → 방향은 안 건드리고 예상 폭 ×{widen}") if ev_days else "일주일 안 등록된 큰 이벤트 없음 (FOMC 일정 + 두뇌 이벤트 파일)"})
    # ⑧ 두뇌 국면
    reg = brain.get("regime", "") if brain else ""
    tilt, why = 0.0, "두뇌 국면 자료 없음"
    if reg:
        part = reg
        if mk == "KR" and "국내" in reg: part = reg.split("/")[0]
        elif mk == "US" and "미국" in reg: part = reg.split("/")[-1]
        tilt = -0.04 if "회피" in part else 0.04 if "선호" in part else 0.0
        why = f"🧠 두뇌 regime 「{reg}」 → {'−' if tilt < 0 else '+' if tilt > 0 else '±'}{abs(tilt)*100:.0f}%p 기울기 ({brain.get('last_review','')[-5:]} 검토)"
    M.append({"k": "brain", "ic": "🧠", "name": "두뇌 국면", "p1": 0.5 + tilt, "p5": 0.5 + tilt * 1.5, "n": 0, "w": 0.4 if tilt else 0, "ev": why})
    # ⑪~ 심리·위험선호·자금·일정·폭 (prob_x)
    research = {}
    if G is not None:
        try:
            MX, research = prob_x.methods(mk, d, H, G, ext or {}, cond, (breadth or {}).get(mk))
            M.extend(MX)
        except Exception as e:
            import traceback; traceback.print_exc(); print(mk, "보강 지표 실패", e); ERRS.append(f"{mk} 보강: " + traceback.format_exc()[-600:])
    GRP = {"base": "가격", "trend": "가격", "ob": "가격", "vol": "심리", "lead": "선행", "season": "일정", "event": "일정", "brain": "판단", "ml": "모델"}
    for x in M:
        x.setdefault("grp", GRP.get(x["k"], "기타"))
    # ⑨ 로지스틱 앙상블 (심리·크레딧·VIX 기간구조 특성까지)
    cols = ["streak", "r5", "r20", "mom", "ma200", "ma50s", "rvp", "rsi", "tom"]
    if G is not None:
        al = (lambda s_: s_.reindex(d.index)) if mk == "US" else (lambda s_: prob_x.align(s_, d.index))
        for gc in ("senti", "vterm", "credit20", "riskon20"):
            if gc in G:
                d["g_" + gc] = al(G[gc])
                cols.append("g_" + gc)
    D = d.dropna(subset=cols + ["y1", "y5"])
    ml = None
    if len(D) > 1500:
        X = D[cols].values.astype(float)
        mu, sd = X.mean(0), X.std(0) + 1e-9
        Xs = (X - mu) / sd
        cut = len(D) - 250
        res = {}
        for tgt in ["y1", "y5"]:
            y = D[tgt].values.astype(float)
            w = logistic_fit(Xs[:cut], y[:cut])
            s = 1 / (1 + np.exp(-(np.c_[np.ones(len(D) - cut), Xs[cut:]] @ w)))
            a = auc(y[cut:], s)
            w2 = logistic_fit(Xs, y)
            x_now = (d[cols].ffill().iloc[-1].values.astype(float) - mu) / sd
            x_now = np.nan_to_num(x_now)
            res[tgt] = (float(sigm(float(np.r_[1, x_now] @ w2))), a)
        ml = res
        M.append({"k": "ml", "ic": "🤖", "name": "로지스틱 앙상블", "grp": "모델", "p1": res["y1"][0], "p5": res["y5"][0], "n": int(len(D)), "w": 0.8,
                  "auc_p1": res["y1"][1], "auc_p5": res["y5"][1],
                  "ev": f"특성 {len(cols)}개(연속일수·5일·20일·모멘텀·200일선·50일선·변동성·RSI·월말" + (" + 심리 종합·VIX 기간구조·크레딧·위험선호" if len(cols) > 9 else "") + f") · {len(D):,}일 학습 · 최근 1년 검증 AUC 내일 {res['y1'][1]:.2f} · 5일 {res['y5'][1]:.2f} (0.5 = 동전, 0.55 넘으면 쓸 만)"})

    # ⑩ 결합
    PB = {"p1": float(d["y1"].mean()), "p5": float(d["y5"].mean())}
    AW = (AUTO_W or {}).get(mk, {})
    def combine(key):
        """10/14 밤 — 논리적으로 확률을 「높이는」 결합 (부풀리기 아님)
           ① 방법마다 평소와의 로그오즈 차이 dev 를 표본 크기만큼만 믿음: dev × n/(n+N0)  (경험적 베이즈)
           ② 가중 평균 dev 에 「유효 독립 개수」 m/(1+(m−1)ρ) 를 곱함 — 서로 다른 근거가 같은 쪽을 가리키면 확률이 실제로 올라감
              (평균만 내면 근거가 늘어도 확률이 안 움직이고, 그냥 더하면 겹치는 근거를 두 번 셈 — 그 사이)
           ③ 채점 60건 넘은 방법은 브라이어 점수로 가중치 자동 조정 · ④ 상한 ±CAP"""
        b = logit(PB[key])
        num = den = 0.0
        m = 0
        anc = ANCHOR.get(key)
        for x in M:
            p = x.get(key)
            if p is None or not x.get("w"):
                continue
            if anc is not None and x.get("anchor"):
                continue
            n = x.get("n") or 0
            eb = n / (n + N0) if n else (0.5 if x["k"] in ("ml", "brain") else 0)
            if x["k"] == "ml":
                eb = max(0.2, min(1.0, ((x.get("auc_" + key) or 0.5) - 0.5) / 0.06))
            w = x["w"] * AW.get(x["k"], 1.0)
            x["eb"] = round(eb, 2); x["w_eff"] = round(w, 2)
            num += w * eb * (logit(p) - b); den += w
            m += 1
        if not den:
            return PB[key]
        meff = m / (1 + (m - 1) * RHO)
        if anc is not None:                                   # 닻 + 나머지 방법의 작은 기울기
            dev = max(-OTHERS_CAP, min(OTHERS_CAP, num / den * meff)) if den else 0.0
            INFO[key] = {"m": m, "meff": round(meff, 2), "dev": round(dev, 3), "anchor": anc["k"], "p_anchor": round(anc["p"], 3)}
            return sigm(logit(anc["p"]) + dev)
        dev = max(-CAP, min(CAP, num / den * meff))
        INFO[key] = {"m": m, "meff": round(meff, 2), "dev": round(dev, 3)}
        return sigm(b + dev)
    INFO = {}
    ANCHOR = {}
    INTRA_CHG = [None]
    IC = [None]
    # 🧭 닻 고르기 (내일=오늘 장 확률 p1 에만): ① 장중이면 지금 등락 + 남은 시간 ② 아니면 간밤 미국 / 선물 갭
    if partial is not None:
        from statistics import NormalDist
        sig_d = float(d["r"].tail(20).std()) or 0.01
        # 🌪️ 10/19 코스피 −1.79%(10:18)에 「12% · 거의 확실히 내린다」 → 10:23 +0.54% 전환. 20일 표준편차(2.6%)가 이번 주 같은 폭풍(하루 ±5~8%)엔 너무 작았음
        #   → 최근 5일 흔들림(RMS)과 반반 섞되 20일 값 밑으로는 안 내림 (미검증 — 주간 연구에서 60분봉으로 확인할 것)
        rms5 = float((d["r"].tail(5) ** 2).mean() ** 0.5)
        sig_d = max(sig_d, ((sig_d ** 2 + rms5 ** 2) / 2) ** 0.5)
        tot = (cfg["close"] // 100 * 60 + cfg["close"] % 100) - (cfg["open"] // 100 * 60 + cfg["open"] % 100)
        el = (loc.hour * 60 + loc.minute) - (cfg["open"] // 100 * 60 + cfg["open"] % 100)
        rem = max(0.02, 1 - el / tot)
        chg = math.log(partial / float(last["c"]))
        vr = intra_var(mk, el, tot, rem)
        pi = NormalDist().cdf(chg / (sig_d * math.sqrt(vr)))
        pi = min(0.99, max(0.01, pi))
        M.insert(0, {"k": "intra", "ic": "⏱️", "name": "장중 닻", "p1": pi, "p5": None, "n": 0, "w": 0, "anchor": 1,
                     "ev": f"지금 {cfg['ixn']} {(partial / float(last['c']) - 1) * 100:+.2f}% · 장 남은 시간 {rem * 100:.0f}% · 남은 흔들림 {vr * 100:.0f}% · 하루 흔들림 {sig_d * 100:.1f}% → 종가가 어제보다 높을 확률 {pi * 100:.0f}% ({'시각별 실측 보정 · 60분봉 2년' if mk in INTRA_VH else '무작위 걸음 근사'})"})
        ANCHOR["p1"] = {"k": "intra", "p": pi}
        INTRA_CHG[0] = round((partial / float(last["c"]) - 1) * 100, 2)
        # 📱 앱이 장중 나침반(10분마다)의 지금 등락으로 같은 식을 다시 계산하도록 재료를 넘김 (prob 은 매시간이라 그 사이 반전을 못 따라감)
        IC[0] = {"sig": round(sig_d, 5), "vh": sorted(INTRA_VH[mk].items()) if mk in INTRA_VH else None, "tz": cfg["tz"],
                 "open": cfg["open"], "close": cfg["close"], "prev": float(last["c"]), "pi": pi}
    else:
        la = next((x for x in M if x["k"] == "lead" and x.get("anchor") and x.get("p1") is not None), None)
        if la:
            ANCHOR["p1"] = {"k": "lead", "p": la["p1"]}
    p1, p5 = combine("p1"), combine("p5")
    vol = next((x for x in M if x["k"] == "vol"), None)
    s1 = (vol["sig1"] if vol else float(last["r"].std() if False else d["r"].tail(20).std() * 100)) * widen
    s5 = (vol["sig5"] if vol else s1 * math.sqrt(5))
    base = next((x for x in M if x["k"] == "base"), None)
    m1 = 0.0; m5 = base["q5"][2] if base and base.get("q5") and base["q5"][2] is not None else 0.0
    band1 = [r2(m1 - s1), r2(m1 + s1)]
    band5 = [r2(m5 - s5), r2(m5 + s5)]
    # 10/14 사용자 「50% 언저리에서 노는 게 볼품없다」 → 평소(기저율) 대비 차이 · 방법 찬반 · 큰 움직임 확률(꼬리)을 같이 보여 줌
    pb1, pb5 = float(d["y1"].mean()), float(d["y5"].mean())
    votes = {"up": 0, "down": 0, "flat": 0}
    for x in M:
        if x.get("p1") is None or not x.get("w"):
            continue
        dv = x["p1"] - pb1
        votes["up" if dv > 0.005 else "down" if dv < -0.005 else "flat"] += 1
    e1 = p1 - pb1
    nv = votes["up"] + votes["down"] + votes["flat"]
    agree = (votes["up"] if e1 >= 0 else votes["down"]) / nv if nv else 0
    strength = "강" if abs(e1) >= 0.04 and agree >= 0.7 else "보통" if abs(e1) >= 0.02 and agree >= 0.6 else "약"
    if ANCHOR.get("p1"):   # 🧭 닻이 있으면 세기는 닻이 얼마나 기울었나로 (검증: 60%↑·40%↓ 날 적중 67~79%)
        strength = "강" if abs(e1) >= 0.12 else "보통" if abs(e1) >= 0.06 else "약"
    from statistics import NormalDist
    N = NormalDist()
    def tails(p, sig, sig_n, pb, th):
        """정규 근사: 평균 = σ·Φ⁻¹(p) · 지금 σ(현재 변동성) vs 평소 σ(20일 변동성 중앙값)"""
        mu, mu_n = sig * N.inv_cdf(min(max(p, .01), .99)), sig_n * N.inv_cdf(min(max(pb, .01), .99))
        up = 1 - N.cdf((th - mu) / sig); dn = N.cdf((-th - mu) / sig)
        upn = 1 - N.cdf((th - mu_n) / sig_n); dnn = N.cdf((-th - mu_n) / sig_n)
        return [r2(up, 3), r2(upn, 3)], [r2(dn, 3), r2(dnn, 3)]
    sn1 = float(d["r"].rolling(20).std().median() * 100)
    th1 = 1.0 if sn1 < 1.3 else 1.5
    th5 = 3.0 if sn1 < 1.3 else 4.0
    u1, d1_ = tails(p1, s1, sn1, pb1, th1)
    u5, d5_ = tails(p5, s5, sn1 * math.sqrt(5), pb5, th5)
    tail = [{"k": f"내일 +{th1:g}% 넘게 오름", "now": u1[0], "norm": u1[1]}, {"k": f"내일 −{th1:g}% 넘게 내림", "now": d1_[0], "norm": d1_[1]},
            {"k": f"일주일 +{th5:g}% 넘게 오름", "now": u5[0], "norm": u5[1]}, {"k": f"일주일 −{th5:g}% 넘게 내림", "now": d5_[0], "norm": d5_[1]}]
    tone1 = "오를 쪽" if p1 >= 0.57 else "내릴 쪽" if p1 <= 0.43 else "반반"
    tone5 = "오를 쪽" if p5 >= 0.58 else "내릴 쪽" if p5 <= 0.42 else "반반"
    ixn = cfg["ixn"]
    state = f"{ixn} {last['c']:,.2f} ({last['r']*100:+.2f}%, {base_date[5:]}) · {streak_bucket(last['streak'])} · 5일 {last['r5']*100:+.1f}% · 20일 {last['r20']*100:+.1f}% · RSI {rsi:.0f}"
    for x in M:
        for k in ("p1", "p5"):
            x[k] = r2(x[k], 3)
        x.pop("sig1", None); x.pop("sig5", None); x.pop("q5", None); x.pop("auc_p1", None); x.pop("auc_p5", None)
    if IC[0]:
        IC[0]["dev"] = round(logit(min(0.99, max(0.01, p1))) - logit(IC[0].pop("pi")), 4)
    return {"mk": mk, "name": cfg["name"], "flag": cfg["flag"], "ixn": ixn, "base_date": base_date, "open_now": open_now, "filled": PATCHED.get(mk), "intra_chg": INTRA_CHG[0], "ic": IC[0],
            "last": r2(last["c"]), "chg": r2(last["r"] * 100), "p1": r2(p1, 3), "p5": r2(p5, 3), "tone1": tone1, "tone5": tone5,
            "band1": band1, "band5": band5, "m5": r2(m5), "widen": widen, "state": state, "methods": M,
            "next_day": nxt.strftime("%Y-%m-%d"), "n_hist": int(len(d)),
            "pb1": r2(pb1, 3), "pb5": r2(pb5, 3), "e1": r2((p1 - pb1) * 100, 1), "e5": r2((p5 - pb5) * 100, 1),
            "votes": votes, "agree": r2(agree * 100, 0), "strength": strength, "tail": tail, "sig_now": r2(s1), "sig_norm": r2(sn1),
            "comb": INFO, "research": research}


# ---------------- 채점 ----------------
def score(hist, H, res):
    """지난 예측을 실제 결과로 채점. hist = {"rows":[{d, mk, base_date, p1, p5, c0, c1?, c5?, r1?, r5?, hit1?, hit5?}]}"""
    rows = hist.get("rows", [])
    seen = {(x["mk"], x["base_date"]) for x in rows}
    for mk, r in res.items():
        if r.get("open_now"):
            continue                                   # 장중엔 종가가 안 정해졌으니 기록하지 않음 (마감 뒤 첫 실행이 기록)
        if (mk, r["base_date"]) not in seen:
            rows.append({"mk": mk, "base_date": r["base_date"], "made": NOW.strftime("%Y-%m-%d %H:%M"), "p1": r["p1"], "p5": r["p5"], "c0": r["last"],
                         "mp": {x["k"]: [x["p1"], x["p5"]] for x in r["methods"] if x.get("p1") is not None and x.get("w")}})
    for x in rows:
        px = H.get(MK[x["mk"]]["ix"])
        if px is None:
            continue
        c = px["Close"]
        after = c[c.index > pd.Timestamp(x["base_date"])]
        if x.get("r1") is None and len(after) >= 1:
            x["r1"] = r2((float(after.iloc[0]) / x["c0"] - 1) * 100); x["hit1"] = int((x["r1"] > 0) == (x["p1"] >= 0.5)); x["y1"] = int(x["r1"] > 0)
        if x.get("r5") is None and len(after) >= 5:
            x["r5"] = r2((float(after.iloc[4]) / x["c0"] - 1) * 100); x["hit5"] = int((x["r5"] > 0) == (x["p5"] >= 0.5)); x["y5"] = int(x["r5"] > 0)
    rows = rows[-2000:]
    hist["rows"] = rows
    hist["at"] = NOW.strftime("%Y-%m-%d %H:%M")
    # 요약 (시장별 + 전체)
    def summ(rs, k):
        done = [x for x in rs if x.get("r" + k[-1]) is not None]
        if not done:
            return {"n": 0}
        p = np.array([x["p" + k[-1]] for x in done]); y = np.array([x["y" + k[-1]] for x in done])
        brier = float(np.mean((p - y) ** 2))
        hit = float(np.mean([x["hit" + k[-1]] for x in done]))
        bk = []
        for lo, hi, lab in [(0, 0.45, "내릴 쪽"), (0.45, 0.55, "반반"), (0.55, 1.01, "오를 쪽")]:
            m = (p >= lo) & (p < hi)
            if m.sum():
                bk.append({"k": lab, "n": int(m.sum()), "pred": r2(p[m].mean() * 100, 0), "real": r2(y[m].mean() * 100, 0)})
        return {"n": len(done), "brier": r2(brier, 3), "hit": r2(hit * 100, 0), "buckets": bk}
    sc = {"all": {"d1": summ(rows, "p1"), "d5": summ(rows, "p5")}}
    # 방법별 브라이어 (내일) — 60건 넘으면 다음 실행부터 가중치에 반영 (prob_hist.json auto_w)
    mb = {}
    for x in rows:
        if x.get("y1") is None:
            continue
        for k, v in (x.get("mp") or {}).items():
            if v and v[0] is not None:
                mb.setdefault(k, []).append((v[0] - x["y1"]) ** 2)
    base_b = sc["all"]["d1"].get("brier")
    sc["methods"] = {k: {"n": len(v), "brier": r2(np.mean(v), 3)} for k, v in mb.items()}
    hist["auto_w"] = {}
    if base_b:
        for mk in MK:
            hist["auto_w"][mk] = {k: r2(min(2.0, max(0.3, 1 + 20 * (base_b - np.mean(v)))), 2) for k, v in mb.items() if len(v) >= 60}
    for mk in MK:
        rs = [x for x in rows if x["mk"] == mk]
        sc[mk] = {"d1": summ(rs, "p1"), "d5": summ(rs, "p5"), "recent": [{"d": x["base_date"], "p1": x["p1"], "r1": x.get("r1"), "p5": x["p5"], "r5": x.get("r5")} for x in rs[-7:]]}
    return sc


def main():
    syms = sorted({c["ix"] for c in MK.values()} | set(EXTRA))
    H = load_hist(syms)
    if not FAKE:
        try:
            patch_live(H)
        except Exception as e:
            print("마지막 봉 채우기 실패", e)
        for k_ in list(H):                                   # 안전망: 같은 날짜가 두 번 있으면 야후 원래 봉을 남김
            try:
                if H[k_] is not None and H[k_].index.duplicated().any():
                    H[k_] = H[k_][~H[k_].index.duplicated(keep="first")]
            except Exception:
                pass
    brain, events = {}, []
    if not FAKE:
        try:
            brain = get(MSR + "brain/state.json")
        except Exception as e:
            print("두뇌 실패", e)
    try:
        events = json.load(open(EV_FILE, encoding="utf-8")).get("events", []) if os.path.exists(EV_FILE) else []
    except Exception:
        events = []
    ext = prob_x.load_ext(FAKE)
    try:
        fr = prob_x.load_foreign(FAKE)
        if len(fr):
            ext["foreign"] = fr
    except Exception as e:
        print("외국인 수급 실패", e)
    G = None
    try:
        G = prob_x.build_global(H)
        print("심리 종합(미국) 지금", round(float(G["senti"].dropna().iloc[-1]), 1), "· 시작", G["senti"].dropna().index[0].date())
    except Exception as e:
        import traceback; traceback.print_exc(); print("심리 종합 실패", e)
    breadth = {}
    try:
        breadth = {k: v.get("breadth") for k, v in json.load(open(os.path.join("archive", "x", "prob_sec.json"), encoding="utf-8")).get("markets", {}).items()}
    except Exception as e:
        print("폭 자료 없음", e)
    global AUTO_W
    try:
        AUTO_W = json.load(open(HIST, encoding="utf-8")).get("auto_w", {})
    except Exception:
        AUTO_W = {}
    res = {}
    for mk in MK:
        try:
            r = market(mk, H, brain, events, G, ext, breadth)
            if r:
                res[mk] = r
        except Exception as e:
            import traceback; traceback.print_exc()
            print(mk, "실패", e)
            ERRS.append(f"{mk}: " + traceback.format_exc()[-600:])     # 10/15: Actions 로그를 못 볼 때가 있어 결과 파일에 남김
    hist = {}
    try:
        hist = json.load(open(HIST, encoding="utf-8")) if os.path.exists(HIST) else {}
    except Exception:
        hist = {}
    sc = score(hist, H, res) if res else {}
    out = {"at": int(time.time() * 1000), "t": NOW.strftime("%H:%M"), "date": NOW.strftime("%Y-%m-%d"), "markets": res, "score": sc, "shrink": SHRINK,
           "how": [
               ["가격", "📚 기저율", "지금과 같은 상태(연속 하락·상승 일수, 5일 수익률 부호)였던 2000년 이후의 날들이 다음 날·5일 뒤 어떻게 됐는지 그대로 셈. 가장 단순하고 가장 과소평가된 방법"],
               ["가격", "📈 추세 국면", "200일선 위/아래 × 50일선 기울기 4개 국면. 상승 국면에선 오른 날 비율이 높고 하락 국면에선 낮다는 오래된 사실"],
               ["가격", "🔁 과매도·과매수", "RSI(14) 30↓·70↑, 5일 ±3% 극단일 때만 — 짧은 기간의 과한 움직임은 되돌아가는 경향(단기 반전)"],
               ["심리", "🌊 변동성", "20일 실현 변동성 백분위(미국은 VIX)별 결과 + 68% 예상 폭. 변동성이 높을 땐 방향보다 폭이 커짐"],
               ["심리", "😱 심리 종합(우리 공포·탐욕)", "CNN 공포·탐욕과 같은 뼈대를 공개 시세로 매일 다시 계산(2007년~): ① 지수/125일선 ② VIX/50일 평균(반대) ③ VIX/VIX3M(반대) ④ 하이일드/투자등급 채권 20일 ⑤ 주식−국채 20일 ⑥ 경기소비/필수소비 20일 ⑦ 주식/금 20일 → 각각 1년 백분위 평균. 아시아는 「미국 7개 항목 평균」 반 + 「자기 지수 모멘텀·변동성·자국 통화(+한국 코스닥/코스피) 평균」 반. 극공포 구간 뒤 수익이 좋고 극탐욕 뒤는 평범하다는 「역발상」이 오래 확인된 성질"],
               ["심리", "🌡️ VIX 기간구조", "VIX ÷ VIX3M. 보통은 1 아래(먼 미래가 더 불확실). 1을 넘는 역전 = 지금 당장의 공포가 극단 → 역사적으로 그 뒤 1~4주 수익이 플러스 쪽으로 쏠림. 아시아에는 다음 날 옮겨 붙음"],
               ["심리", "🧊 VIX 수준", "아시아 시장에 미국 공포 수준을 그대로 적용 (미국 마감 뒤 아시아 장이 열리므로 미리 아는 정보)"],
               ["심리", "🎢 위험선호", "미국 경기소비/필수소비, 한국 코스닥/코스피 20일 — 돈이 공격적인 쪽으로 가는지 방어 쪽으로 가는지. 지수보다 먼저 꺾이는 경우가 많음"],
               ["심리", "🪙 크립토 공포·탐욕", "alternative.me 지수(2018년~) — 개인 투자자 위험선호가 가장 먼저 드러나는 곳"],
               ["심리", "📰 CNN 공포·탐욕", "원본 CNN 지수 — 받아지는 날만 (막히면 우리 심리 종합이 대신함)"],
               ["자금", "💳 크레딧", "하이일드(HYG)/투자등급(LQD) 채권 20일 — 회사채 시장이 주식보다 먼저 위험을 알아챔. 급히 나빠지면 주식 약세 확률↑"],
               ["자금", "💱 환율", "한국 원/달러 · 일본 엔/달러 · 중국·홍콩 위안/달러 · 미국 달러 인덱스 5일 — 달러 강세는 외국인 자금이 빠지는 쪽"],
               ["선행", "⏱️ 장중 닻", "장이 열려 있으면 「지금 등락 ÷ (하루 흔들림 × √남은 흔들림)」 → 종가가 어제보다 높을 확률. 남은 흔들림은 한국·일본·홍콩만 60분봉 2년 실측(시가 갭이 하루 흔들림의 큰 몫이라 장중엔 생각보다 덜 흔들림 · 두 기간 모두 브라이어 개선), 중국·미국은 남은 시간 비율 그대로"],
               ["선행", "🛰️ 선행 시장", "아시아 = 직전 미국 S&P 등락 + 미국 마감(뉴욕 16:00) 뒤 개장 전까지 S&P 선물 등락(10/15 더함 · 60분봉 2년 두 기간 모두 브라이어 개선)이 비슷했던 날의 결과. 한국·일본·홍콩은 미국 상장 국가 ETF(EWY·EWJ·EWH)가 그 나라 지수 마감 뒤 더 움직인 몫으로 조금 더 기울임(10/15 · 2012~ 두 기간·최근 2년 모두 브라이어 개선, 로그오즈 ±0.3 상한) · 한국은 미 반도체 지수(SOX)가 S&P보다 더 움직인 몫으로도 조금 기울임(10/29 · 2001~ 두 기간 교차·최근 5년 브라이어 개선, ±0.2 상한) · 일본·한국은 그 나라 마감 뒤 CME 닛케이 선물(NKD=F) 등락 중 간밤 미국이 설명 못 한 몫으로도 기울임(10/27 · 60분봉 2년 두 기간 모두 브라이어 개선 — 일본 0.21→0.17, 한국은 작게 · 일본 ±1.0·한국 ±0.3 상한) · 중국·홍콩은 개장(한국 10:30) 전 먼저 1시간 넘게 거래한 코스피·닛케이 등락 중 간밤 미국이 설명 못 한 몫으로도 기울임(10/24 · 60분봉 2년 두 기간 모두 브라이어 개선, ±0.3 상한) · 미국 = 선물이 가리키는 시가 갭이 비슷했던 날의 종가 방향"],
               ["심리", "🏛️ 채권 대 주식 공포(한국·일본)", "채권 변동성(MOVE)의 1년 백분위에서 VIX 의 1년 백분위를 뺀 값이 1년 중 상위·하위 10% 꼬리일 때만 — 2002년 이후 「주식만 겁먹은」 하위 10% 다음 날 코스피 오른 비율이 평소보다 −9.2·−5.0%p(앞/뒤 기간), 닛케이 −8.3·−8.3%p · 「채권만 불안」 상위 10%는 닛케이 +7.6·+5.4%p · 걸어가며 브라이어 앞/뒤·최근 5년 모두 개선(10/28). 다음 날만 · MOVE 수준·5일 변화, 중국·홍콩·미국은 개선 없어 안 씀"],
               ["자금", "💵 달러지수 급변(홍콩·한국·중국)", "달러지수(DX-Y.NYB) 5일 변화가 1년 중 상위·하위 10% 꼬리일 때만 — 2000년 이후 달러 급등 다음 날 항셍 오른 비율이 평소보다 −9.8·−10.6%p(앞/뒤 기간), 코스피 −4.2·−10.4%p, 상해 −6.3·−3.2%p · 달러 급락은 반대(+2~6%p) · 걸어가며 브라이어 앞/뒤·최근 5년 모두 개선(10/29). 홍콩은 일주일도, 한국·중국은 다음 날만 · 일본·미국과 20일 변화는 개선 없거나 겹쳐 안 씀"],
               ["심리", "🏛️ 채권 변동성 급등(한국)", "MOVE(미국 채권 변동성) 5일 변화가 1년 중 상위 10%로 급등한 다음 날만 — 2002년 이후 코스피 다음 날 오른 비율이 평소보다 −5.4·−6.4%p(앞/뒤 기간, n 294·338) · 걸어가며 브라이어 앞/뒤·최근 5년 모두 개선(10/29). 일주일·급락 쪽·다른 시장은 개선 없어 안 씀"],
               ["자금", "🟤 구리/금 비율(한국·일본)", "구리(경기 금속) ÷ 금(안전자산) 5일 변화의 1년 백분위가 상위·하위 10% 꼬리일 때만 — 2001년 이후 상위 10% 다음 날 코스피 오른 비율이 평소보다 +8.9·+5.3%p(앞/뒤 기간), 닛케이 +5.2·+5.1%p · 걸어가며 브라이어 앞/뒤·최근 5년 모두 개선(10/28). 다음 날만 · 중국·홍콩·미국은 개선 없어 안 씀"],
               ["자금", "🌏 신흥국 달러채 약세(한국 다음 날)", "신흥국 달러채(EMB) − 미 국채(IEF) 5일 변화가 1년 중 하위 10%(신흥국 채권에서 돈이 급히 빠짐)일 때만 — 2008년 이후 코스피 다음 날 오른 비율이 평소보다 −10.5·−16.0%p(앞/뒤 기간, n 212·239) · 크레딧·달러·S&P 꼬리 위에서도 걸어가며 브라이어 앞/뒤·최근 5년·교차 모두 개선(10/30). 크레딧과 겹쳐 무게 작게(0.4) · 5일 뒤·일본·중국·홍콩·미국은 안 씀"],
               ["자금", "🥇 금/은 비율(미국 일주일)", "금(안전자산) ÷ 은(경기 금속) 5일 변화의 1년 백분위가 상위 10%(위험 회피 급등)일 때만 — 2000년 이후 S&P 5일 뒤 오른 비율이 평소보다 +2.1·+4.4%p(앞/뒤 기간, n 351·355) · 걸어가며 브라이어 앞/뒤·최근 5년 개선(10/29). 다른 꼬리와 겹쳐 무게 작게(0.3) · 다음 날·아시아는 안 씀"],
               ["심리", "🌙 밤 수익률(일본 일주일)", "닛케이 최근 5일 「밤 사이」 수익률(시가÷전날 종가) 합이 1년 중 상위 10%일 때만 — 2000년 이후 닛케이 5일 뒤 오른 비율이 평소보다 +5.3·+6.3%p(앞/뒤 기간, n 363·308) · 교차 검증 두 방향·최근 5년 브라이어 개선, 다만 걸어가며 앞 기간은 나빠져 무게 작게(0.3)(10/30). 다음 날·다른 시장은 개선 없어 안 씀"],
               ["심리", "🌗 밤 내리고 낮 오름(일본 내일)", "닛케이가 밤 사이(시가÷전날 종가) 1년 하위 30%로 빠졌다가 장중(종가÷시가) 상위 30%로 되찾은 날만 — 2000년 이후 다음 날 오른 비율이 평소보다 −4.9·−4.1%p(앞/뒤 기간, n 244·254) · 기존 칸 위 걸어가며 세 기간·교차 두 방향 브라이어 개선 · 낮 등락이 하루 등락과 겹쳐 무게 0.5(10/31). 반대 경우·5일·다른 시장은 개선 없어 안 씀"],
               ["흐름", "🔀 일본 혼자 약함(일본 내일)", "닛케이 5일 등락이 S&P 5일(간밤 미국 하루 뺀 같은 기간)보다 뒤처진 정도가 1년 중 하위 10%일 때만 — 2000년 이후 다음 날 오른 비율이 평소보다 +8.8·+4.1%p(앞/뒤 기간, n 297·336) · 기존 칸 위에 더해 세 기간·교차 두 방향 브라이어 개선 · 최근 5년은 +1.6%p로 작아져 무게 0.5(10/31). 5일·다른 아시아 시장은 개선 없어 안 씀"],
               ["자금", "📐 장단기 금리차(한국)", "미 10년 − 3개월 국채 금리차 구간(역전·평평·보통·가파름). 2000년 이후 「보통(0.5~1.5%p)」 구간 뒤 코스피 다음 날 오른 비율이 평소보다 약 2%p 높고 「가파름」 구간은 낮았음 — 앞/뒤 기간·최근 2년 모두 브라이어 개선(10/15). 일본·중국·홍콩·미국은 개선이 없어 안 씀"],
               ["자금", "🏦 투자자예탁금 급감(한국 일주일)", "금투협 투자자예탁금(증권사에 맡긴 개인 대기자금)이 20일 동안 1년 중 하위 10%만큼 줄었을 때만 켜짐(발표가 다음 날이라 하루 늦춰 씀). 2005년 이후 그런 날 뒤 코스피 5일 뒤 오른 비율이 평소보다 앞 기간 8%p·뒤 기간 4%p 낮았고 최근 2년도 5%p 낮음 — 세 기간 모두 브라이어 개선(10/22). 신용잔고·반대매매·미수금은 개선이 없어 안 씀"],
               ["심리", "🧮 풋콜 극공포(미국 일주일)", "CBOE 전체 풋콜 비율 5일 평균이 1년 중 상위 10%(옵션 시장 극공포)일 때만 켜짐. 2006년 이후 그런 날 뒤 S&P 5일 뒤 오른 비율 66%(평소 58~61%) — 앞/뒤 기간·최근 2년 모두 브라이어 개선(10/19). 다음 날 쪽은 약하고, 다른 시장·탐욕 쪽·전체 구간 나눔은 개선이 없어 안 씀"],
               ["폭·수급", "🌏 외국인 수급(한국)", "다음 금융 투자자별 매매(일별) — 외국인 20일 누적 순매수가 최근 2년 중 어디쯤인지(백분위) + 연속 순매도·순매수 일수. 한국은 외국인 20일 누적이 돌아서는 때가 코스피 전환과 거의 같음. 매도 극단은 대개 매도가 다 나온 뒤"],
               ["폭·수급", "📊 시장 폭", "시총 상위 250종목 중 50일선 위 비율·10일 상승 비율(최근 2년) — 지수보다 종목 폭이 먼저 돎. 10일 상승 비율이 40%↓에서 61.5%↑로 급반전하면 쯔바이크 신호"],
               ["일정", "📅 모멘텀·계절성", "12-1개월 모멘텀 부호 × 다음 날 요일 × 다음 날이 월말월초(그달 마지막 날·첫 3거래일)인지. 10/31 고침: 전에는 오늘의 요일·월말월초로 칸을 골라 하루 어긋나 있었음. 고친 뒤 걸어가며 브라이어가 중국은 2006년 이후 앞/뒤·최근 5년 모두 좋아짐(월초 다음 날 +4.5·+5.9%p) → 중국 w 0.5, 한국·미국 0.3, 일본·홍콩 0.15"],
               ["일정", "🗓️ 옵션 만기 주간", "미국 셋째 금 · 한국 둘째 목 · 일본 둘째 금 · 홍콩 월말 전날 · 중국 넷째 수 — 만기 주간은 수익 분포가 다름"],
               ["일정", "⚖️ 월말 리밸런싱(미국·일본 다음 날)", "그달 남은 거래일 1~4일일 때만 켜짐. 연기금은 월말에 주식·채권 비중을 되맞추므로, 그달 주식이 채권보다 많이 오르면(미국 S&P − 국채 TLT +1%p↑) 월말에 팔고 덜 오르면 삼. 2002년 이후 월말 창 약 900일, 2017년 앞/뒤 두 기간 모두 −1%p↓ 뒤 다음 날 오름 +7~13%p · +3%p↑ 뒤 −5~−9%p, 걸어가며 브라이어 두 기간·최근 3년 개선(Etula 외 「Dash for Cash」). 일본은 닛케이 그달 누적만으로 작게(w 0.3). 한국·중국·홍콩은 검증 통과 못 해 안 씀"],
               ["일정", "🎌 휴일 앞뒤(중국·홍콩·일본·미국 다음 날)", "내일이 휴일 앞날이거나 휴일 뒤 첫날일 때만 켜짐(앞으로 날짜는 거래소 달력). 연휴 앞에는 팔기보다 들고 가려는 쪽이 많아 오르는 날이 잦다는 휴일 전날 효과(Ariel 1990). 2000년 이후 2016년 앞/뒤 두 기간 모두 같은 쪽 · 걸어가며 브라이어 개선: 중국 휴일 앞날 +10·+7%p · 휴일 뒤 첫날 +6·+9%p, 홍콩 휴일 앞날 +5·+8%p, 일본 휴일 뒤 첫날 +10·+3%p. 미국 휴일 앞날은 앞 기간 +2%p뿐이라 작게(w 0.3). 한국은 두 기간 브라이어가 나빠져 안 씀"],
               ["일정", "📣 이벤트", "FOMC·CPI·실적 등이 일주일 안이면 방향은 안 건드리고 예상 폭만 넓힘"],
               ["섹터", "🔁 업종 모멘텀(미국 섹터)", "미국 섹터 ETF 9개(XLK·XLE 등)의 12개월(최근 1달 뺌) 수익 − S&P500 순위. 1999년 이후 5일씩 끊어 본 결과, 상위 2개 업종은 다음 5일 S&P500 보다 나을 확률이 평소보다 +2.0%p(1999~2013)·+2.7%p(2013~), 꼴찌 업종은 −4.8·−2.5%p. 미국 섹터 카드의 「시장보다 나을 확률」에만 작게(측정값의 약 60%) 더함 — 20·60·120일 상대강도는 두 기간이 엇갈려 쓰지 않음"],
               ["종목", "🧾 실적 반응일(미국 종목)", "실적 발표 뒤 첫 반응일 종가에서 시장 대비 크게 오른 종목은 다음 5일도 시장보다 나을 확률이 높고, 크게 내린 종목은 낮음(실적 발표 뒤 흐름 PEAD). 미국 220종목 2018~ 6,198건: 반응 +4.5%↑ → +3.9·+1.7%p, −3.9%↓ → −5.3·−3.6%p(앞/뒤 기간). 반응일 하루만 「내일·시장보다 나을 확률」에 작게(5%p 반응당 로그오즈 0.05~0.06) 더함 — EPS 놀람% 자체는 두 기간 엇갈려 안 씀"],
               ["판단", "🧠 두뇌 국면", "🧠 시황 두뇌의 위험 선호/중립/회피 판단 → 작은 기울기"],
               ["모델", "🤖 로지스틱 앙상블", "위 가격·심리·크레딧·위험선호 특성을 한꺼번에 넣은 로지스틱 회귀 · 최근 1년은 학습에서 빼고 검증(AUC) → AUC 만큼만 믿음"],
               ["결합", "⚖️ 결합 — 논리적으로 확률을 높이는 법", "① 방법마다 「평소와의 차이」를 표본 크기만큼만 믿음: n/(n+150) (표본 30개짜리 극단 통계가 혼자 흔들지 못하게) ② 가중 평균에 유효 독립 개수 m/(1+(m−1)×0.6)을 곱함 — 서로 다른 근거(가격·심리·자금·일정)가 같은 쪽을 가리키면 확률이 실제로 올라가고, 엇갈리면 서로 지움. 평균만 내면 근거가 아무리 늘어도 확률이 안 움직이고, 그냥 더하면 겹치는 근거를 두 번 셈 — 그 사이 ③ 채점 60건 넘은 방법은 브라이어 점수로 가중치 자동 조정(잘 맞힌 방법 ×최대 2, 못 맞힌 방법 ×0.3) ④ 한쪽으로 ±11%p 넘지 않게 상한"]],
           "senti_how": "심리지표 연구 — 공포·탐욕 계열 지표는 「극단에서만」 쓸모가 있다는 게 공통 결론이에요(중간 구간은 거의 동전). 극공포는 대개 매도가 다 나온 뒤라 그 뒤 1~4주 수익이 평소보다 좋고, 극탐욕은 하락 신호라기보다 「추가 수익이 평범해지는」 신호. 그래서 아래 표에서 지금 구간과 양 끝 구간의 차이를 보세요. 표는 이 앱이 2007년 이후 매일 다시 계산한 결과예요(미리 정한 숫자가 아님).",
           "note": "내일 방향을 맞힐 확률의 상한은 대략 53~56%예요. 그래서 맞히기가 아니라 「확률 분포를 그리고 보정하기」가 목표 — 사라는 뜻도, 팔라는 뜻도 아니에요."}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    if ERRS:
        out["errors"] = ERRS[-10:]
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(hist, open(HIST, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    for mk, r in res.items():
        print(mk, r["base_date"], "p1", r["p1"], "p5", r["p5"], r["band1"], r["band5"], [(x["k"], x["p1"], x["n"]) for x in r["methods"]])
    print("채점", json.dumps(sc.get("all"), ensure_ascii=False))


if __name__ == "__main__":
    main()
