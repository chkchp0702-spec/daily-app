"""
🎲 시장확률 — 내일·일주일 뒤 시장이 오를 확률 (prob.yml, 매시간)
  10/14 사용자 「다 합쳐서 확률로 만들어서 나침반 옆에 '시장확률' — 누르면 설명·방법들 · 다섯 개 시장 다」
  10가지 방법을 각각 「내일 오를 확률 p1 · 5일 뒤 오를 확률 p5」로 내고, 로그오즈 평균으로 합친 뒤 과신을 줄이려 0.5 쪽으로 눌러 준다.
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
EXTRA = ["^VIX", "ES=F"]
# 2026 FOMC 결정일 (둘째 날) — 연준 공개 일정. 그 밖의 이벤트는 prob_events.json 에서
FOMC_2026 = ["2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17", "2026-07-29", "2026-09-16", "2026-10-28", "2026-12-09"]
SHRINK = 0.6          # 결합 로그오즈에 곱해 과신을 줄임 (100건 넘게 채점되면 보정표로 바꿀 것)
MIN_N = 30            # 조건부 통계 최소 표본


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
    return out


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


def is_open_now(cfg):
    from zoneinfo import ZoneInfo
    loc = NOW.astimezone(ZoneInfo(cfg["tz"]))
    hm = loc.hour * 100 + loc.minute
    return loc.weekday() < 5 and cfg["open"] <= hm < cfg["close"], loc


# ---------------- 시장 하나 ----------------
def market(mk, H, brain, events):
    cfg = MK[mk]
    px = H.get(cfg["ix"])
    if px is None or len(px) < 600:
        return None
    d = feats(px)
    last = d.iloc[-1]
    today = d.index[-1]
    open_now, loc = is_open_now(cfg)
    # 예측 기준일: 마지막 봉이 오늘이고 장중이면 「오늘 종가 기준 내일」을 아직 못 세움 → 마지막 마감 봉 기준으로 「다음 거래일」
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
        # 아시아 날짜 t 의 결과 ← 미국 t−1 종가 등락 (미국이 먼저 마감)
        us_prev = us.reindex(d.index, method="ffill").shift(1)   # 그 날 아침에 알 수 있던 마지막 미국 등락
        cur_us = float(us.dropna().iloc[-1]) if len(us.dropna()) else 0.0
        us_d = us.dropna().index[-1].strftime("%m/%d")
        def bk(v):
            return -2 if v < -0.01 else -1 if v < -0.003 else 0 if v <= 0.003 else 1 if v <= 0.01 else 2
        bks = us_prev.apply(lambda v: bk(v) if not np.isnan(v) else np.nan)
        m = cond(d, bks == bk(cur_us), "미국 직전 " + f"{cur_us*100:+.1f}%")
        if m:
            M.append({"k": "lead", "ic": "🛰️", "name": "선행 시장", "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": 0.9,
                      "ev": f"미국 S&P 직전 장({us_d}) {cur_us*100:+.2f}% · 비슷한 미국 등락 뒤 {cfg['ixn']} {m['n']}번 → 다음 날 {m['p1']*100:.0f}% · 5일 {m['p5']*100:.0f}%"})
    elif cfg["lead"] == "fut":
        es = H.get("ES=F")
        g = None
        if es is not None and len(es) > 2 and not FAKE:
            e = es["Close"].dropna()
            g = float(e.iloc[-1] / e.iloc[-2] - 1)
        elif FAKE:
            g = 0.002
        if g is not None:
            def gb(v):
                return -2 if v < -0.01 else -1 if v < -0.003 else 0 if v <= 0.003 else 1 if v <= 0.01 else 2
            # 과거: 시가 갭 g 였던 날의 「종가 > 전일 종가」 비율 — 갭이 그날 방향을 얼마나 말해 주나
            dd = d.copy(); dd["y0"] = (dd["c"] > dd["c"].shift(1)).astype(float); dd["gb"] = dd["gap"].apply(lambda v: gb(v) if not np.isnan(v) else np.nan)
            h = dd[(dd["gb"] == gb(g)) & dd["gap"].notna()]
            m5 = cond(d, dd["gb"] == gb(g), "갭")
            if len(h) >= MIN_N:
                p_today = float(h["y0"].mean())
                M.append({"k": "lead", "ic": "🛰️", "name": "선행 시장", "p1": p_today, "p5": m5["p5"] if m5 else None, "n": int(len(h)), "w": 0.9,
                          "ev": f"S&P 선물 {g*100:+.2f}% → 비슷한 시가 갭이었던 {len(h)}일 중 종가가 전일보다 높게 끝난 비율 {p_today*100:.0f}%" + (f" · 5일 {m5['p5']*100:.0f}%" if m5 else "")})
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
    mask = (np.sign(d["mom"]) == np.sign(last["mom"])) & (d["dow"] == (nxt.dayofweek)) if ms else (d["dow"] == nxt.dayofweek)
    tom = bool(last["tom"]) or (nxt.day <= 3)
    if tom:
        mask = mask & (d["tom"] == 1)
    lab = ("12-1개월 모멘텀 " + ("+" if last["mom"] > 0 else "−") + " · " if ms else "") + "다음 날 " + "월화수목금토일"[nxt.dayofweek] + "요일" + (" · 월말월초" if tom else "")
    m = cond(d, mask, lab)
    if m and m["n"] >= MIN_N:
        M.append({"k": "season", "ic": "📅", "name": "모멘텀·계절성", "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": 0.5,
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
    # ⑨ 로지스틱 앙상블
    cols = ["streak", "r5", "r20", "mom", "ma200", "ma50s", "rvp", "rsi", "tom"]
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
            x_now = (d[cols].iloc[-1].values.astype(float) - mu) / sd
            x_now = np.nan_to_num(x_now)
            res[tgt] = (float(sigm(float(np.r_[1, x_now] @ w2))), a)
        ml = res
        M.append({"k": "ml", "ic": "🤖", "name": "로지스틱 앙상블", "p1": res["y1"][0], "p5": res["y5"][0], "n": int(len(D)), "w": 0.8,
                  "ev": f"특성 9개(연속일수·5일·20일·모멘텀·200일선·50일선·변동성·RSI·월말) · {len(D):,}일 학습 · 최근 1년 검증 AUC 내일 {res['y1'][1]:.2f} · 5일 {res['y5'][1]:.2f} (0.5 = 동전, 0.55 넘으면 쓸 만)"})

    # ⑩ 결합
    def combine(key):
        num = den = 0.0
        for x in M:
            p = x.get(key)
            if p is None or not x.get("w"):
                continue
            num += x["w"] * logit(p); den += x["w"]
        if not den:
            return 0.5
        return sigm(SHRINK * num / den)
    p1, p5 = combine("p1"), combine("p5")
    vol = next((x for x in M if x["k"] == "vol"), None)
    s1 = (vol["sig1"] if vol else float(last["r"].std() if False else d["r"].tail(20).std() * 100)) * widen
    s5 = (vol["sig5"] if vol else s1 * math.sqrt(5))
    base = next((x for x in M if x["k"] == "base"), None)
    m1 = 0.0; m5 = base["q5"][2] if base and base.get("q5") and base["q5"][2] is not None else 0.0
    band1 = [r2(m1 - s1), r2(m1 + s1)]
    band5 = [r2(m5 - s5), r2(m5 + s5)]
    tone1 = "오를 쪽" if p1 >= 0.57 else "내릴 쪽" if p1 <= 0.43 else "반반"
    tone5 = "오를 쪽" if p5 >= 0.58 else "내릴 쪽" if p5 <= 0.42 else "반반"
    ixn = cfg["ixn"]
    state = f"{ixn} {last['c']:,.2f} ({last['r']*100:+.2f}%, {base_date[5:]}) · {streak_bucket(last['streak'])} · 5일 {last['r5']*100:+.1f}% · 20일 {last['r20']*100:+.1f}% · RSI {rsi:.0f}"
    for x in M:
        for k in ("p1", "p5"):
            x[k] = r2(x[k], 3)
        x.pop("sig1", None); x.pop("sig5", None); x.pop("q5", None)
    return {"mk": mk, "name": cfg["name"], "flag": cfg["flag"], "ixn": ixn, "base_date": base_date, "open_now": open_now,
            "last": r2(last["c"]), "chg": r2(last["r"] * 100), "p1": r2(p1, 3), "p5": r2(p5, 3), "tone1": tone1, "tone5": tone5,
            "band1": band1, "band5": band5, "m5": r2(m5), "widen": widen, "state": state, "methods": M,
            "next_day": nxt.strftime("%Y-%m-%d"), "n_hist": int(len(d))}


# ---------------- 채점 ----------------
def score(hist, H, res):
    """지난 예측을 실제 결과로 채점. hist = {"rows":[{d, mk, base_date, p1, p5, c0, c1?, c5?, r1?, r5?, hit1?, hit5?}]}"""
    rows = hist.get("rows", [])
    seen = {(x["mk"], x["base_date"]) for x in rows}
    for mk, r in res.items():
        if r.get("open_now"):
            continue                                   # 장중엔 종가가 안 정해졌으니 기록하지 않음 (마감 뒤 첫 실행이 기록)
        if (mk, r["base_date"]) not in seen:
            rows.append({"mk": mk, "base_date": r["base_date"], "made": NOW.strftime("%Y-%m-%d %H:%M"), "p1": r["p1"], "p5": r["p5"], "c0": r["last"]})
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
    for mk in MK:
        rs = [x for x in rows if x["mk"] == mk]
        sc[mk] = {"d1": summ(rs, "p1"), "d5": summ(rs, "p5"), "recent": [{"d": x["base_date"], "p1": x["p1"], "r1": x.get("r1"), "p5": x["p5"], "r5": x.get("r5")} for x in rs[-7:]]}
    return sc


def main():
    syms = sorted({c["ix"] for c in MK.values()} | set(EXTRA))
    H = load_hist(syms)
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
    res = {}
    for mk in MK:
        try:
            r = market(mk, H, brain, events)
            if r:
                res[mk] = r
        except Exception as e:
            import traceback; traceback.print_exc()
            print(mk, "실패", e)
    hist = {}
    try:
        hist = json.load(open(HIST, encoding="utf-8")) if os.path.exists(HIST) else {}
    except Exception:
        hist = {}
    sc = score(hist, H, res) if res else {}
    out = {"at": int(time.time() * 1000), "t": NOW.strftime("%H:%M"), "date": NOW.strftime("%Y-%m-%d"), "markets": res, "score": sc, "shrink": SHRINK,
           "how": [
               ["📚 기저율", "지금과 같은 상태(연속 하락·상승 일수, 5일 수익률 부호)였던 2000년 이후의 날들이 그 다음 날·5일 뒤 어떻게 됐는지 그대로 셈"],
               ["📈 추세 국면", "200일선 위/아래 · 50일선 기울기로 4가지 국면을 나눠 각 국면의 과거 결과"],
               ["🌊 변동성", "20일 실현 변동성의 2년 백분위(미국은 VIX)로 국면을 나눈 과거 결과 + 68% 예상 폭(±1σ)"],
               ["🛰️ 선행 시장", "아시아는 직전 미국 S&P 등락이 비슷했던 날의 결과 · 미국은 선물이 가리키는 시가 갭이 비슷했던 날의 종가 방향"],
               ["🔁 과매도·과매수", "RSI(14) 30 아래·70 위, 5일 ±3% 넘는 극단일 때만 되돌림 통계 (수급 자료의 대용)"],
               ["📅 모멘텀·계절성", "12-1개월 모멘텀 부호 · 다음 날 요일 · 월말월초 효과"],
               ["📣 이벤트", "FOMC·CPI 같은 큰 이벤트가 일주일 안이면 방향은 안 건드리고 예상 폭만 넓힘"],
               ["🧠 두뇌 국면", "🧠 시황 두뇌의 위험 선호/중립/회피 판단 → ±4%p 작은 기울기"],
               ["🤖 로지스틱 앙상블", "위 특성 9개로 학습한 로지스틱 회귀 · 최근 1년은 학습에서 빼고 검증(AUC 공개)"],
               ["⚖️ 결합·보정", "방법마다 확률을 로그오즈로 바꿔 가중 평균 → ×0.6 으로 0.5 쪽에 눌러 과신을 줄임 → 지난 예측을 브라이어 점수로 채점(0 완벽 · 0.25 동전)"]],
           "note": "내일 방향을 맞힐 확률의 상한은 대략 53~56%예요. 그래서 맞히기가 아니라 「확률 분포를 그리고 보정하기」가 목표 — 사라는 뜻도, 팔라는 뜻도 아니에요."}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(hist, open(HIST, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    for mk, r in res.items():
        print(mk, r["base_date"], "p1", r["p1"], "p5", r["p5"], r["band1"], r["band5"], [(x["k"], x["p1"], x["n"]) for x in r["methods"]])
    print("채점", json.dumps(sc.get("all"), ensure_ascii=False))


if __name__ == "__main__":
    main()
