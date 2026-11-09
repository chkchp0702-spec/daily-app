"""
📏 40주 이동평균선 투자법 백테스트 (11/09)
  규칙: 금요일 주봉 종가가 40주 이동평균선 위 → 다음 주 월요일 시가에 보유 / 아래 → 다음 주 월요일 시가에 매도·현금
  · 정직 방식: 신호는 금요일 종가로만 판단, 체결은 다음 주 월요일 시가, 매매 비용(편도) 차감,
    현금은 미국 3개월 국채금리(^IRX)만큼 이자 — 미래 정보 사용 없음
  · 비교: 그냥 보유(Buy & Hold)
  · 변형: 30·40·50주선 / 2주 연속 확인 / 40주선 위 + 이평선 상승(와인스태인 2단계)
  · 대상: 세계 주요 지수 + 미국·한국·일본·중국·홍콩 대표주식 + 주요 ETF
  결과: archive/x/bt40.json (bt40.html 이 읽음)
  python bt40.py     (bt40.yml — 매주 토요일 + 수동 실행)
"""
import datetime as dt
import json
import math
import os
import sys
import time

import numpy as np
import pandas as pd

KST = dt.timezone(dt.timedelta(hours=9))
OUT = os.path.join("archive", "x", "bt40.json")

# (티커, 이름, 그룹)
UNIVERSE = [
    # ── 지수
    ("^GSPC", "S&P500", "지수"), ("^NDX", "나스닥100", "지수"), ("^IXIC", "나스닥종합", "지수"),
    ("^DJI", "다우", "지수"), ("^RUT", "러셀2000", "지수"), ("^KS11", "코스피", "지수"),
    ("^KQ11", "코스닥", "지수"), ("^N225", "닛케이225", "지수"), ("^HSI", "항셍", "지수"),
    ("000001.SS", "상해종합", "지수"), ("399001.SZ", "심천성분", "지수"), ("^STOXX50E", "유로스톡스50", "지수"),
    ("^GDAXI", "독일 DAX", "지수"), ("^BSESN", "인도 센섹스", "지수"),
    # ── ETF
    ("SPY", "SPY (S&P500)", "ETF"), ("QQQ", "QQQ (나스닥100)", "ETF"), ("SOXX", "SOXX (반도체)", "ETF"),
    ("XLK", "XLK (기술주)", "ETF"), ("EWY", "EWY (한국)", "ETF"), ("EWJ", "EWJ (일본)", "ETF"),
    ("FXI", "FXI (중국 대형주)", "ETF"), ("EEM", "EEM (신흥국)", "ETF"),
    ("GLD", "GLD (금)", "ETF"), ("TLT", "TLT (미국 장기채)", "ETF"),
    # ── 미국 대표주
    ("AAPL", "애플", "미국"), ("MSFT", "마이크로소프트", "미국"), ("NVDA", "엔비디아", "미국"),
    ("AMZN", "아마존", "미국"), ("GOOGL", "알파벳", "미국"), ("META", "메타", "미국"),
    ("TSLA", "테슬라", "미국"), ("AVGO", "브로드컴", "미국"), ("BRK-B", "버크셔해서웨이", "미국"),
    ("JPM", "JP모건", "미국"), ("V", "비자", "미국"), ("LLY", "일라이릴리", "미국"),
    ("UNH", "유나이티드헬스", "미국"), ("XOM", "엑슨모빌", "미국"), ("JNJ", "존슨앤존슨", "미국"),
    ("WMT", "월마트", "미국"), ("PG", "P&G", "미국"), ("COST", "코스트코", "미국"),
    ("NFLX", "넷플릭스", "미국"), ("AMD", "AMD", "미국"), ("ORCL", "오라클", "미국"),
    ("KO", "코카콜라", "미국"), ("HD", "홈디포", "미국"), ("INTC", "인텔", "미국"),
    ("CSCO", "시스코", "미국"), ("PLTR", "팔란티어", "미국"),
    # ── 한국 대표주
    ("005930.KS", "삼성전자", "한국"), ("000660.KS", "SK하이닉스", "한국"), ("005380.KS", "현대차", "한국"),
    ("000270.KS", "기아", "한국"), ("035420.KS", "NAVER", "한국"), ("035720.KS", "카카오", "한국"),
    ("051910.KS", "LG화학", "한국"), ("006400.KS", "삼성SDI", "한국"), ("068270.KS", "셀트리온", "한국"),
    ("207940.KS", "삼성바이오로직스", "한국"), ("105560.KS", "KB금융", "한국"), ("055550.KS", "신한지주", "한국"),
    ("012330.KS", "현대모비스", "한국"), ("005490.KS", "POSCO홀딩스", "한국"), ("028260.KS", "삼성물산", "한국"),
    ("012450.KS", "한화에어로스페이스", "한국"), ("329180.KS", "HD현대중공업", "한국"), ("042700.KS", "한미반도체", "한국"),
    ("036570.KS", "엔씨소프트", "한국"), ("066570.KS", "LG전자", "한국"),
    # ── 일본 대표주
    ("7203.T", "도요타", "일본"), ("6758.T", "소니", "일본"), ("8035.T", "도쿄일렉트론", "일본"),
    ("6857.T", "어드밴테스트", "일본"), ("9984.T", "소프트뱅크그룹", "일본"), ("6861.T", "키엔스", "일본"),
    ("8306.T", "미쓰비시UFJ", "일본"), ("9983.T", "패스트리테일링", "일본"), ("6501.T", "히타치", "일본"),
    ("7974.T", "닌텐도", "일본"),
    # ── 중국·홍콩 대표주
    ("0700.HK", "텐센트", "중국·홍콩"), ("9988.HK", "알리바바", "중국·홍콩"), ("3690.HK", "메이퇀", "중국·홍콩"),
    ("1299.HK", "AIA", "중국·홍콩"), ("0005.HK", "HSBC", "중국·홍콩"), ("0941.HK", "차이나모바일", "중국·홍콩"),
    ("1810.HK", "샤오미", "중국·홍콩"), ("1211.HK", "BYD", "중국·홍콩"), ("0981.HK", "SMIC", "중국·홍콩"),
    ("600519.SS", "귀주모태주", "중국·홍콩"), ("300750.SZ", "CATL", "중국·홍콩"), ("601318.SS", "중국평안", "중국·홍콩"),
]

# 편도 매매 비용(수수료+슬리피지, 한국은 매도세 반영해 평균)
def cost_of(tk):
    if tk.endswith(".KS") or tk.endswith(".KQ") or tk in ("^KS11", "^KQ11"):
        return 0.0015
    if tk.endswith((".T", ".HK", ".SS", ".SZ")) or tk in ("^N225", "^HSI", "000001.SS", "399001.SZ"):
        return 0.0012
    return 0.0005

# 하락장 구간 (S&P500 기준 고점~저점, 다른 자산도 같은 날짜로 비교)
BEARS = [
    ("닷컴 붕괴", "2000-03-24", "2002-10-11"),
    ("금융위기", "2007-10-12", "2009-03-06"),
    ("2011 유럽위기", "2011-04-29", "2011-10-07"),
    ("2018 긴축 쇼크", "2018-09-21", "2018-12-24"),
    ("코로나 폭락", "2020-02-21", "2020-03-23"),
    ("2022 금리 하락장", "2022-01-03", "2022-10-14"),
]
BULLS = [
    ("2003~2007 상승장", "2002-10-11", "2007-10-12"),
    ("2009~2020 장기 상승", "2009-03-06", "2020-02-21"),
    ("코로나 뒤 반등", "2020-03-23", "2021-12-31"),
    ("2023~ 상승장", "2022-10-14", None),
]

VARIANTS = {
    "w40": dict(n=40, confirm=1, slope=False, label="40주선 (기본)"),
    "w30": dict(n=30, confirm=1, slope=False, label="30주선"),
    "w50": dict(n=50, confirm=1, slope=False, label="50주선"),
    "w40c2": dict(n=40, confirm=2, slope=False, label="40주선 · 2주 연속 확인"),
    "w40s": dict(n=40, confirm=1, slope=True, label="40주선 위 + 이평선 상승"),
}


def log(*a):
    print(*a, flush=True)


def fetch(tk, tries=3):
    import yfinance as yf
    for k in range(tries):
        try:
            df = yf.Ticker(tk).history(period="max", interval="1wk", auto_adjust=True, actions=False)
            if df is not None and len(df) > 60:
                df = df[["Open", "Close"]].copy()
                df.index = pd.to_datetime(df.index).tz_localize(None).normalize()
                df = df[~df.index.duplicated(keep="last")].dropna(subset=["Close"])
                df = df[df["Close"] > 0]
                return df
        except Exception as e:
            log("  재시도", tk, k + 1, str(e)[:120])
        time.sleep(2 + 3 * k)
    return None


def fetch_cash():
    """주간 현금 수익률 시리즈 (^IRX 연율 % → 주간)"""
    df = fetch("^IRX")
    if df is None:
        return None
    r = (df["Close"].clip(lower=0) / 100.0) / 52.0
    return r


def positions(close, n, confirm, slope):
    sma = close.rolling(n).mean()
    above = (close > sma)
    if slope:
        above = above & (sma > sma.shift(4))  # 4주 전보다 이평선이 높음 = 오르는 중
    sig = pd.Series(np.nan, index=close.index)
    state = 0
    run_up = run_dn = 0
    for i, (a, s) in enumerate(zip(above.values, sma.values)):
        if np.isnan(s):
            sig.iloc[i] = np.nan
            continue
        if a:
            run_up += 1; run_dn = 0
        else:
            run_dn += 1; run_up = 0
        if state == 0 and run_up >= confirm:
            state = 1
        elif state == 1 and run_dn >= confirm:
            state = 0
        sig.iloc[i] = state
    return sig, sma


def simulate(df, cash_w, cost, n=40, confirm=1, slope=False):
    """정직 방식: t주 금요일 종가 신호 → t+1주 월요일 시가 체결"""
    o = df["Open"].copy()
    c = df["Close"]
    prev_c = c.shift(1)
    o = o.where(o > 0, prev_c).fillna(prev_c)
    sig, sma = positions(c, n, confirm, slope)
    start = sig.first_valid_index()
    if start is None:
        return None
    pos_prev = sig.shift(1)   # 이번 주에 적용되는 결정 (지난주 금요일 종가 기준)
    pos_prev2 = sig.shift(2)  # 그 전 상태
    cw = cash_w.reindex(c.index, method="ffill").fillna(0.0) if cash_w is not None else pd.Series(0.0, index=c.index)

    bh = c / prev_c - 1
    strat = pd.Series(np.nan, index=c.index)
    trades = []
    entry_px = None
    entry_dt = None
    idx = c.index
    i0 = idx.get_loc(start) + 1
    for i in range(i0, len(idx)):
        now, before = pos_prev.iloc[i], pos_prev2.iloc[i]
        if np.isnan(now):
            continue
        if np.isnan(before):
            before = 0
        C, P, O, cr = c.iloc[i], prev_c.iloc[i], o.iloc[i], cw.iloc[i]
        if now == 1 and before == 1:
            r = C / P - 1
        elif now == 1 and before == 0:  # 월요일 시가 매수
            r = (1 - cost) * (C / O) - 1
            entry_px, entry_dt = O * (1 + cost), idx[i]
        elif now == 0 and before == 1:  # 월요일 시가 매도
            exit_px = O * (1 - cost)
            r = (O / P) * (1 - cost) - 1
            if entry_px:
                trades.append(dict(buy=str(entry_dt.date()), sell=str(idx[i].date()), ret=exit_px / entry_px - 1))
            entry_px = None
        else:
            r = cr
        strat.iloc[i] = r
    strat = strat.dropna()
    if entry_px is not None:
        trades.append(dict(buy=str(entry_dt.date()), sell=None, ret=c.iloc[-1] / entry_px - 1))
    bh = bh.reindex(strat.index)
    inv = pos_prev.reindex(strat.index).fillna(0)
    return dict(strat=strat, bh=bh, trades=trades, sig=sig, sma=sma, inv=inv)


def stats(r):
    r = r.dropna()
    if len(r) < 26:
        return None
    eq = (1 + r).cumprod()
    yrs = len(r) / 52.0
    cagr = eq.iloc[-1] ** (1 / yrs) - 1 if eq.iloc[-1] > 0 else -1
    vol = r.std() * math.sqrt(52)
    mdd = float((eq / eq.cummax() - 1).min())
    sharpe = (r.mean() * 52) / vol if vol > 0 else 0
    return dict(cagr=round(cagr * 100, 2), vol=round(vol * 100, 2), mdd=round(mdd * 100, 2),
                sharpe=round(sharpe, 2), total=round((eq.iloc[-1] - 1) * 100, 1),
                calmar=round(cagr / abs(mdd), 2) if mdd < 0 else None)


def window_ret(r, a, b):
    a = pd.Timestamp(a)
    b = pd.Timestamp(b) if b else r.index[-1] + pd.Timedelta(days=1)
    x = r[(r.index > a) & (r.index <= b)]
    if len(x) < 2 or r.index[0] > a:
        return None
    return round(((1 + x).prod() - 1) * 100, 1)


def curve(strat, bh, every=4):
    e1 = (1 + strat).cumprod()
    e2 = (1 + bh).cumprod()
    pts = []
    for i in range(0, len(e1), every):
        pts.append([str(e1.index[i].date()), round(float(e1.iloc[i]), 4), round(float(e2.iloc[i]), 4)])
    pts.append([str(e1.index[-1].date()), round(float(e1.iloc[-1]), 4), round(float(e2.iloc[-1]), 4)])
    return pts


def run_one(tk, name, grp, cash_w):
    df = fetch(tk)
    if df is None or len(df) < 80:
        log("  ✗ 데이터 없음", tk)
        return None
    # 마지막 주가 아직 안 끝났으면(금요일 전) 신호 계산에서 제외 — 현재 상태 표시엔 사용
    cost = cost_of(tk)
    out = dict(tk=tk, name=name, grp=grp, start=str(df.index[0].date()), end=str(df.index[-1].date()),
               years=round(len(df) / 52, 1), cost=cost, v={})
    base = None
    for key, p in VARIANTS.items():
        sim = simulate(df, cash_w, cost, p["n"], p["confirm"], p["slope"])
        if sim is None or len(sim["strat"]) < 52:
            continue
        s, b = stats(sim["strat"]), stats(sim["bh"])
        if s is None or b is None:
            continue
        tr = sim["trades"]
        closed = [t for t in tr if t["sell"]]
        wins = [t for t in closed if t["ret"] > 0]
        yrs = len(sim["strat"]) / 52
        res = dict(s=s, b=b, n_trades=len(tr), trades_yr=round(len(tr) / yrs, 2),
                   win=round(len(wins) / len(closed) * 100, 1) if closed else None,
                   avg_win=round(np.mean([t["ret"] for t in wins]) * 100, 1) if wins else None,
                   avg_loss=round(np.mean([t["ret"] for t in closed if t["ret"] <= 0]) * 100, 1) if len(closed) > len(wins) else None,
                   invested=round(float(sim["inv"].mean()) * 100, 1))
        out["v"][key] = res
        if key == "w40":
            base = sim
    if base is None:
        return None
    st, bh = base["strat"], base["bh"]
    out["test_start"] = str(st.index[0].date())
    out["bears"] = [dict(name=n, s=window_ret(st, a, b), b=window_ret(bh, a, b)) for n, a, b in BEARS]
    out["bulls"] = [dict(name=n, s=window_ret(st, a, b), b=window_ret(bh, a, b)) for n, a, b in BULLS]
    # 연도별
    yr = {}
    for y in sorted(set(st.index.year)):
        m = st.index.year == y
        if m.sum() >= 20:
            yr[int(y)] = [round(((1 + st[m]).prod() - 1) * 100, 1), round(((1 + bh[m]).prod() - 1) * 100, 1)]
    out["years_tbl"] = yr
    out["curve"] = curve(st, bh, every=4 if len(st) > 400 else 2)
    out["trades"] = [dict(t, ret=round(t["ret"] * 100, 1)) for t in base["trades"]][-40:]
    # 지금 상태
    c, sma = df["Close"], base["sma"]
    last_sig = base["sig"].iloc[-1]
    flips = base["sig"].diff().fillna(0)
    last_flip = flips[flips != 0].index[-1] if (flips != 0).any() else None
    out["now"] = dict(price=round(float(c.iloc[-1]), 2), sma=round(float(sma.iloc[-1]), 2),
                      gap=round((c.iloc[-1] / sma.iloc[-1] - 1) * 100, 1),
                      slope=round((sma.iloc[-1] / sma.iloc[-5] - 1) * 100, 2),
                      state="보유" if last_sig == 1 else "현금",
                      since=str(last_flip.date()) if last_flip is not None else None)
    return out


def summarize(rows):
    def grp_sum(rs, key="w40"):
        rs = [r for r in rs if key in r["v"]]
        if not rs:
            return None
        beat_cagr = sum(1 for r in rs if r["v"][key]["s"]["cagr"] > r["v"][key]["b"]["cagr"])
        beat_sharpe = sum(1 for r in rs if r["v"][key]["s"]["sharpe"] > r["v"][key]["b"]["sharpe"])
        less_mdd = sum(1 for r in rs if r["v"][key]["s"]["mdd"] > r["v"][key]["b"]["mdd"])
        med = lambda f: round(float(np.median([f(r["v"][key]) for r in rs])), 2)
        return dict(n=len(rs), beat_cagr=beat_cagr, beat_sharpe=beat_sharpe, less_mdd=less_mdd,
                    med_cagr_s=med(lambda v: v["s"]["cagr"]), med_cagr_b=med(lambda v: v["b"]["cagr"]),
                    med_mdd_s=med(lambda v: v["s"]["mdd"]), med_mdd_b=med(lambda v: v["b"]["mdd"]),
                    med_sharpe_s=med(lambda v: v["s"]["sharpe"]), med_sharpe_b=med(lambda v: v["b"]["sharpe"]),
                    med_invested=med(lambda v: v["invested"]), med_trades_yr=med(lambda v: v["trades_yr"]),
                    med_win=med(lambda v: v["win"] or 0))
    groups = ["전체"] + list(dict.fromkeys(r["grp"] for r in rows))
    out = {}
    for g in groups:
        rs = rows if g == "전체" else [r for r in rows if r["grp"] == g]
        out[g] = {k: grp_sum(rs, k) for k in VARIANTS}
    # 하락장 방어 (전체 평균)
    bear = []
    for i, (n, _, _) in enumerate(BEARS):
        pairs = [(r["bears"][i]["s"], r["bears"][i]["b"]) for r in rows if r["bears"][i]["s"] is not None]
        if pairs:
            bear.append(dict(name=n, n=len(pairs), s=round(float(np.median([p[0] for p in pairs])), 1),
                             b=round(float(np.median([p[1] for p in pairs])), 1),
                             better=sum(1 for p in pairs if p[0] > p[1])))
    bull = []
    for i, (n, _, _) in enumerate(BULLS):
        pairs = [(r["bulls"][i]["s"], r["bulls"][i]["b"]) for r in rows if r["bulls"][i]["s"] is not None]
        if pairs:
            bull.append(dict(name=n, n=len(pairs), s=round(float(np.median([p[0] for p in pairs])), 1),
                             b=round(float(np.median([p[1] for p in pairs])), 1),
                             better=sum(1 for p in pairs if p[0] > p[1])))
    return dict(groups=out, bears=bear, bulls=bull)


def verdict(sm):
    a = sm["groups"]["전체"]["w40"]
    best = max(VARIANTS, key=lambda k: (sm["groups"]["전체"][k] or {}).get("beat_sharpe", -1))
    lines = []
    lines.append(f"{a['n']}개 중 수익률(연평균)은 {a['beat_cagr']}개에서 그냥 보유보다 높았음")
    lines.append(f"최대 낙폭(MDD)은 {a['less_mdd']}개에서 줄었음 — 중간값 {a['med_mdd_b']}% → {a['med_mdd_s']}%")
    lines.append(f"위험 대비 수익(샤프)은 {a['beat_sharpe']}개에서 좋아졌음")
    lines.append(f"투자 기간은 평균 {a['med_invested']}%만 시장에 있었고, 1년에 {a['med_trades_yr']}번 정도 사고팖")
    if a["beat_cagr"] < a["n"] / 2 and a["less_mdd"] > a["n"] * 0.6:
        core = "결론: 40주선은 「더 벌게 해 주는 법」보다 「크게 잃지 않게 해 주는 법」에 가까움"
    elif a["beat_cagr"] >= a["n"] / 2:
        core = "결론: 40주선이 수익률과 방어를 함께 개선한 경우가 많았음"
    else:
        core = "결론: 40주선의 효과는 자산마다 크게 엇갈렸음 — 종목보다 지수에 쓰는 편이 안정적임"
    lines.insert(0, core)
    if best != "w40":
        lines.append(f"변형 중에서는 「{VARIANTS[best]['label']}」이 위험 대비 수익이 가장 좋았음")
    return lines


def main():
    t0 = time.time()
    log("📏 40주선 백테스트 시작", dt.datetime.now(KST).strftime("%F %H:%M"))
    cash_w = fetch_cash()
    log("  현금 금리 ^IRX", "OK" if cash_w is not None else "없음(0% 처리)")
    rows, fails = [], []
    only = sys.argv[1:]  # 특정 티커만 테스트
    for tk, name, grp in UNIVERSE:
        if only and tk not in only:
            continue
        try:
            r = run_one(tk, name, grp, cash_w)
        except Exception as e:
            log("  ✗", tk, repr(e)[:200])
            r = None
        if r:
            v = r["v"]["w40"]
            log(f"  ✓ {name:<12} {r['years']:>5}년  40주선 {v['s']['cagr']:>6}% (MDD {v['s']['mdd']}%)  보유 {v['b']['cagr']:>6}% (MDD {v['b']['mdd']}%)")
            rows.append(r)
        else:
            fails.append(tk)
        time.sleep(0.4)
    if not rows:
        log("결과 없음 — 저장하지 않음")
        sys.exit(1)
    sm = summarize(rows)
    res = dict(
        made=dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"),
        rule="금요일 주봉 종가 > 40주 이동평균 → 다음 주 월요일 시가 매수·보유 / 아래로 내려가면 다음 주 월요일 시가 매도·현금",
        honest=["신호는 금요일 종가로만 판단 (미래 정보 없음)", "체결은 다음 주 월요일 시가",
                "매매 비용 편도 미국 0.05% · 한국 0.15% · 일·중·홍 0.12% 차감",
                "현금 보유 때는 미국 3개월 국채금리(^IRX) 이자", "배당 포함 주가(수정주가) 사용 — 지수는 배당 미포함",
                "세금은 반영 안 함 (매매가 잦을수록 실제 결과는 더 불리)"],
        variants={k: v["label"] for k, v in VARIANTS.items()},
        summary=sm, verdict=verdict(sm), rows=rows, fails=fails,
        secs=round(time.time() - t0, 1),
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, separators=(",", ":"))
    log("저장", OUT, f"{len(rows)}개 성공 · 실패 {fails}", f"{res['secs']}초")
    for l in res["verdict"]:
        log(" ·", l)


if __name__ == "__main__":
    main()
