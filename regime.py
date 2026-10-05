"""
🧭 국면 신호판 v2 — 점수 두 개
  · 경기 사이클 (6~18개월 뒤): 금리차·신용·금융여건·고용·주택·경기선행지수·한국 수출
  · 시장 타이밍 (1~3개월 뒤):  지수 추세·시장 폭·브레드 스러스트·신고가/신저가·경기민감/방어·시장 속살·반도체·VIX·외국인
  같은 규칙으로 2000년 이후를 다시 계산해(백테스트) 지표별 가중치를 정하고,
  "지금 같은 점수일 때 과거엔 어땠나"를 함께 archive/x/regime.json 에 쓴다.
  python regime.py     (regime.yml, 하루 두 번)
"""
import datetime as dt
import io
import json
import math
import os
import urllib.request

import numpy as np
import pandas as pd

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
TODAY = NOW.strftime("%Y-%m-%d")
OUT = os.path.join("archive", "x", "regime.json")
OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"
CURL = {"User-Agent": "curl/8.5.0"}
NH = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
BT_START = "2000-01-01"
ERR = []


def log(*a):
    print(*a, flush=True)


def http(url, timeout=60, ua=None, raw=False):
    for k in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=ua or CURL), timeout=timeout) as r:
                b = r.read()
            return b if raw else b.decode("utf-8", errors="ignore")
        except Exception:
            if k == 2:
                raise


def r_(v, n=2):
    return None if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))) else round(float(v), n)


# =============================================================== 자료
def fred(series):
    df = pd.read_csv(io.StringIO(http(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}")))
    df.columns = ["date", "v"]
    df["v"] = pd.to_numeric(df["v"], errors="coerce")
    s = df.dropna().set_index("date")["v"]
    s.index = pd.to_datetime(s.index)
    return s


def oecd_cli(area):
    u = (f"https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI,4.1/{area}.M.LI...AA...H"
         f"?startPeriod=1998-01&dimensionAtObservation=AllDimensions&format=csvfilewithlabels")
    df = pd.read_csv(io.StringIO(http(u, 90)))
    df = df[["TIME_PERIOD", "OBS_VALUE"]].dropna()
    s = pd.Series(df["OBS_VALUE"].astype(float).values, index=pd.to_datetime(df["TIME_PERIOD"])).sort_index()
    return s


def yahoo(tickers):
    import yfinance as yf
    df = yf.download(tickers, period="max", interval="1d", auto_adjust=False, progress=False, group_by="ticker", threads=True)
    out = {}
    for t in tickers:
        try:
            s = (df[t]["Close"] if isinstance(df.columns, pd.MultiIndex) else df["Close"]).dropna()
            s.index = pd.to_datetime(s.index).tz_localize(None)
            if len(s) > 250:
                out[t] = s
        except Exception:
            pass
    return out


def load():
    D = {}
    for k, sid in (("t10y3m", "T10Y3M"), ("baa", "BAA10Y"), ("hy", "BAMLH0A0HYM2"), ("nfci", "NFCI"), ("claims", "IC4WSA"),
                   ("sahm", "SAHMREALTIME"), ("permit", "PERMIT"), ("krx", "XTEXVA01KRM667S")):
        try:
            D[k] = fred(sid)
        except Exception as e:
            ERR.append(f"FRED {sid}: {e}")
    for k, a in (("cli_us", "USA"), ("cli_kr", "KOR"), ("cli_cn", "CHN"), ("cli_jp", "JPN")):
        try:
            D[k] = oecd_cli(a)
        except Exception as e:
            ERR.append(f"OECD {a}: {e}")
    try:
        D["Y"] = yahoo(["^GSPC", "^KS11", "^SOX", "^DJT", "^RUT", "^VIX", "XLY", "XLP", "^N225", "000001.SS", "^HSI", "MU"])
    except Exception as e:
        ERR.append(f"yahoo: {e}")
        D["Y"] = {}
    return D


# =============================================================== 규칙 (백테스트·오늘 공통)
def daily(s, cal, lag):
    """발표 지연(lag 일)을 반영해 거래일 달력에 펼친다."""
    s = s.copy()
    s.index = s.index + pd.Timedelta(days=lag)
    return s.reindex(s.index.union(cal)).ffill().reindex(cal)


def tri(cond_pos, cond_neg, base):
    out = pd.Series(0.0, index=base.index)
    out[cond_pos.reindex(base.index).fillna(False)] = 1.0
    out[cond_neg.reindex(base.index).fillna(False)] = -1.0
    out[base.isna()] = np.nan
    return out


def rules(D, cal):
    """id → (상태 시리즈, 오늘 설명 dict). 상태: +1 좋음 · 0 중립 · −1 경고 · NaN 자료 없음"""
    R = {}
    Y = D.get("Y", {})
    # ---------- 경기 사이클
    if "t10y3m" in D:
        s = daily(D["t10y3m"], cal, 1)
        inv = s < 0
        last_inv = pd.Series(np.where(inv, s.index.values, np.datetime64("NaT", "ns")), index=s.index).ffill()
        days = (s.index.to_series() - last_inv).dt.days
        st = pd.Series(1.0, index=s.index)
        st[(days <= 365)] = 0.0
        st[(days <= 180) | inv] = -1.0
        st[s.isna()] = np.nan
        v, dl = s.iloc[-1], days.iloc[-1]
        mean = (f"역전 중 ({v:+.2f}%p)" if v < 0 else
                f"역전이 {int(dl)}일 전에 풀림 — 역사상 가장 위험한 구간 (2000·2007년 천장이 여기)" if dl == dl and dl <= 180 else
                f"역전 해제 뒤 {int(dl)}일. 침체는 해제 뒤 6~18개월 안에 왔음" if dl == dl and dl <= 365 else f"정상 ({v:+.2f}%p) · 1년 넘게 역전 없음")
        R["yc"] = (st, dict(name="장단기 금리차 (10년−3개월)", val=f"{v:+.2f}%p", mean=mean, lead="6~18개월",
                            rule="역전 중·역전 해제 뒤 6개월 = 경고 · 해제 뒤 1년 = 중립 · 1년 넘게 정상 = 좋음", src="FRED T10Y3M",
                            hist=[r_(x) for x in D["t10y3m"].iloc[-120:]]))
    if "baa" in D:
        s = daily(D["baa"], cal, 1)
        ch = s - s.shift(63)
        pct = s.rolling(756, min_periods=252).rank(pct=True)
        st = tri((ch <= 0.05) & (pct <= 0.5), (ch >= 0.4) | (pct >= 0.85), s)
        hy = D.get("hy")
        hyt = f" · 정크본드(HY) {hy.iloc[-1]:.2f}%p, 한 달 {hy.iloc[-1] - hy.iloc[-22]:+.2f}" if hy is not None and len(hy) > 22 else ""
        R["credit"] = (st, dict(name="신용 스프레드 (회사채−국채)", val=f"{s.iloc[-1]:.2f}%p ({ch.iloc[-1]:+.2f})",
                                mean=f"3년 중 {pct.iloc[-1]*100:.0f}% 위치, 석 달 {ch.iloc[-1]:+.2f}%p" + hyt + " — 채권시장이 주식보다 먼저 겁을 먹어요",
                                lead="1~6개월", rule="석 달 +0.4%p 또는 3년 상위 15% = 경고 · 안정·하위 절반 = 좋음", src="FRED BAA10Y·BAMLH0A0HYM2",
                                hist=[r_(x) for x in D["baa"].iloc[-120:]]))
    if "nfci" in D:
        s = daily(D["nfci"], cal, 5)
        ch = s - s.shift(63)
        st = tri((s < -0.3) & (ch <= 0.1), (s > 0) | (ch > 0.3), s)
        R["nfci"] = (st, dict(name="금융여건지수 (시카고 연은)", val=f"{s.iloc[-1]:+.2f}", mean="0 위 = 돈줄이 조여짐 · −0.3 아래 = 돈 구하기 쉬움" + f" (석 달 {ch.iloc[-1]:+.2f})",
                              lead="2~4개월", rule="0 위 또는 석 달 +0.3 = 경고 · −0.3 아래·안정 = 좋음", src="FRED NFCI"))
    if "claims" in D:
        raw = D["claims"]
        up = (raw / raw.rolling(52, min_periods=26).min() - 1) * 100
        s = daily(up, cal, 5)
        st = tri(s < 8, s >= 20, s)
        R["claims"] = (st, dict(name="신규 실업수당 청구 (4주 평균)", val=f"{raw.iloc[-1]/1000:.0f}천 명", mean=f"1년 저점보다 {up.iloc[-1]:+.0f}% — 실업률보다 2~3개월 먼저 꺾이는 지표",
                                lead="2~6개월", rule="1년 저점 대비 +20% = 경고 · +8% 미만 = 좋음", src="FRED IC4WSA", hist=[r_(x / 1000, 0) for x in raw.iloc[-60:]]))
    if "sahm" in D:
        s = daily(D["sahm"], cal, 35)
        st = tri(s < 0.3, s >= 0.5, s)
        R["sahm"] = (st, dict(name="샴 룰 (실업률 상승폭)", val=f"{D['sahm'].iloc[-1]:.2f}", mean="0.5 이상이면 침체 진입 신호 (실업률이 1년 저점보다 0.5%p 이상 오름)",
                              lead="침체 확인", rule="0.5 이상 = 경고 · 0.3 미만 = 좋음", src="FRED SAHMREALTIME"))
    if "permit" in D:
        yoy = (D["permit"] / D["permit"].shift(12) - 1) * 100
        s = daily(yoy, cal, 20)
        st = tri(s > 5, s < -10, s)
        R["permit"] = (st, dict(name="건축 허가 (미국)", val=f"{D['permit'].iloc[-1]/1000:.2f}M ({yoy.iloc[-1]:+.0f}%)", mean="주택은 경기에서 가장 먼저 꺾여요 (1년 전 대비)",
                                lead="12~18개월", rule="전년 대비 −10% = 경고 · +5% = 좋음", src="FRED PERMIT"))
    clis = [(k, n, f) for k, n, f in (("cli_us", "미국", "🇺🇸"), ("cli_kr", "한국", "🇰🇷"), ("cli_cn", "중국", "🇨🇳"), ("cli_jp", "일본", "🇯🇵")) if k in D]
    if any(k in ("cli_us", "cli_kr") for k, _, _ in clis):
        parts, rows = {}, []
        for k, nm, fl in clis:
            c = D[k]
            d3 = c - c.shift(3)
            p = tri(((c >= 100) & (d3 > 0)) | (d3 > 0.3), ((c < 100) & (d3 < 0)) | (d3 < -0.3), c)
            parts[k] = daily(p, cal, 45)
            rows.append({"flag": fl, "name": nm, "v": round(float(c.iloc[-1]), 1), "u": "", "st": int(p.iloc[-1]),
                         "note": f"{c.index[-1].strftime('%m')}월 · 3개월 {d3.iloc[-1]:+.1f}"})
        a, b = parts.get("cli_us"), parts.get("cli_kr")
        st = (a + b) / 2 if a is not None and b is not None else (a if a is not None else b)
        st = st.apply(lambda x: np.nan if x != x else (1.0 if x >= 0.75 else (-1.0 if x <= -0.75 else 0.0)))
        R["cli"] = (st, dict(name="경기선행지수 (OECD)", val=" · ".join(f"{x['flag']} {x['v']}" for x in rows),
                             mean="100 = 장기 평균. 100 위에서 오르면 확장, 100 아래서 내리면 수축", lead="6~9개월",
                             rule="미국·한국 둘 다 확장 = 좋음 · 둘 다 수축 = 경고", src="OECD CLI", rows=rows))
    if "krx" in D:
        yoy = (D["krx"] / D["krx"].shift(12) - 1) * 100
        s = daily(yoy, cal, 30)
        st = tri(s > 5, s < 0, s)
        R["krx"] = (st, dict(name="한국 수출 증가율", val=f"{yoy.iloc[-1]:+.1f}% ({D['krx'].index[-1].strftime('%m')}월)", mean="코스피 이익과 거의 같은 그림 (1년 전 대비)",
                             lead="3~6개월", rule="마이너스 = 경고 · +5% 이상 = 좋음", src="FRED XTEXVA01KRM667S", hist=[r_(x, 1) for x in yoy.iloc[-36:]]))
    # ---------- 시장 타이밍
    if "^GSPC" in Y and "^KS11" in Y:
        g, k = Y["^GSPC"].reindex(cal).ffill(), Y["^KS11"].reindex(cal).ffill()
        ga, ka = g > g.rolling(200).mean(), k > k.rolling(200).mean()
        st = tri(ga & ka, (~ga) & (~ka), g.rolling(200).mean() + k.rolling(200).mean())
        rows = []
        for tk, fl, nm in (("^GSPC", "🇺🇸", "미국"), ("^KS11", "🇰🇷", "한국"), ("^N225", "🇯🇵", "일본"), ("000001.SS", "🇨🇳", "중국"), ("^HSI", "🇭🇰", "홍콩")):
            x = Y.get(tk)
            if x is not None and len(x) > 200:
                gp = (x.iloc[-1] / x.iloc[-200:].mean() - 1) * 100
                rows.append({"flag": fl, "name": nm, "gap": round(float(gp), 1), "st": 1 if gp > 0 else -1})
        R["trend"] = (st, dict(name="지수 200일선 (미국·한국)", val=f"{sum(1 for x in rows if x['st'] == 1)}/{len(rows)} 나라 위", mean="큰 하락장은 예외 없이 200일선 아래서 일어났어요",
                               lead="추세 확인", rule="미국·한국 둘 다 위 = 좋음 · 둘 다 아래 = 경고", src="야후", rows=rows))
    if "XLY" in Y and "XLP" in Y:
        ratio = (Y["XLY"] / Y["XLP"]).dropna().reindex(cal).ffill()
        ma = ratio.rolling(100).mean()
        st = tri((ratio > ma) & (ma.diff(20) > 0), (ratio < ma) & (ma.diff(20) < 0), ma)
        R["cycdef"] = (st, dict(name="경기민감주 ÷ 방어주", val=f"{(ratio.iloc[-1]/ma.iloc[-1]-1)*100:+.1f}%", mean="임의소비재(XLY) ÷ 필수소비재(XLP)의 100일 평균 대비 — 돈이 위험을 좋아하는지",
                               lead="1~3개월", rule="평균 위·평균 상승 = 좋음 · 평균 아래·하락 = 경고", src="야후 XLY·XLP"))
    if all(t in Y for t in ("^GSPC", "^SOX", "^DJT", "^RUT")):
        g = Y["^GSPC"].reindex(cal).ffill()
        cnt, parts = None, []
        for tk, nm in (("^SOX", "반도체"), ("^DJT", "운송"), ("^RUT", "소형주")):
            x = Y[tk].reindex(cal).ffill()
            rel = (x / x.shift(42) - 1) - (g / g.shift(42) - 1)
            cnt = (rel > 0).astype(float) if cnt is None else cnt + (rel > 0).astype(float)
            parts.append(f"{nm} {rel.iloc[-1]*100:+.1f}%")
        st = tri(cnt == 3, cnt == 0, g.shift(42))
        R["inner"] = (st, dict(name="시장 속살 (반도체·운송·소형주)", val=f"{int(cnt.iloc[-1])}/3 앞섬", mean=" · ".join(parts) + " (S&P 대비 60일) — 셋 다 뒤처지면 속으로는 이미 약세",
                               lead="1~3개월", rule="셋 다 앞섬 = 좋음 · 셋 다 뒤처짐 = 경고", src="야후"))
    if "^SOX" in Y:
        x = Y["^SOX"].reindex(cal).ffill()
        ma, m63 = x.rolling(200).mean(), x / x.shift(63) - 1
        st = tri((x > ma) & (m63 > 0), (x < ma) & (m63 < 0), ma)
        mu = Y.get("MU")
        mut = f" · 마이크론 석 달 {(mu.iloc[-1]/mu.iloc[-64]-1)*100:+.0f}%" if mu is not None and len(mu) > 64 else ""
        R["semi"] = (st, dict(name="반도체 사이클 (SOX)", val=f"석 달 {m63.iloc[-1]*100:+.0f}%", mean=f"200일선 {'위' if x.iloc[-1] > ma.iloc[-1] else '아래'}" + mut + " — 코스피 이익의 절반이 반도체",
                              lead="1~6개월", rule="200일선 위·석 달 상승 = 좋음 · 아래·하락 = 경고", src="야후 ^SOX·MU"))
    if "^VIX" in Y:
        v = Y["^VIX"].reindex(cal).ffill()
        st = tri((v < 18) | (v >= 40), (v > 28) & (v < 40), v)
        vv = v.iloc[-1]
        R["vix"] = (st, dict(name="공포지수 VIX", val=f"{vv:.1f}", mean=("공포 극단 — 40 넘은 뒤 1년은 거의 늘 플러스(역발상 좋음)" if vv >= 40 else "불안 구간" if vv > 28 else "차분함" if vv < 18 else "보통"),
                             lead="1~3개월", rule="18 미만 또는 40 이상(역발상) = 좋음 · 28~40 = 경고", src="야후 ^VIX", hist=[r_(x, 1) for x in Y["^VIX"].iloc[-60:]]))
    return R


# =============================================================== 백테스트
def backtest(R, Y, cal, GROUP):
    """주 단위 표본. 2000년 이후 확인해 보니 이 지표들은 '평균 수익'보다 '크게 빠질 위험'을 훨씬 잘 가른다
    (경고 구간엔 바닥 뒤 반등도 섞여 평균은 비슷하지만, −10% 넘게 빠질 확률은 2~4배).
    그래서 무게 = 경고일 때와 좋음일 때 '−10% 넘게 빠진 비율' 차이 (미국·한국 평균)."""
    fw = {}
    for tk in ("^GSPC", "^KS11"):
        x = Y[tk].reindex(cal).ffill()
        for h in (63, 126):
            fw[(tk, h)] = (x.shift(-h) / x - 1) * 100
            lo = x[::-1].rolling(h, min_periods=h // 2).min()[::-1]
            fw[(tk, "dd", h)] = (lo / x - 1) * 100
        fw[(tk, "dd")] = fw[(tk, "dd", 126)]
    wk = cal[(cal >= pd.Timestamp(BT_START))]
    wk = pd.DatetimeIndex(pd.Series(wk, index=wk).resample("W-FRI").last().dropna().values)
    stats, W = {}, {}
    for k, (st, _) in R.items():
        h = 126 if GROUP[k] == "cycle" else 63
        s = st.reindex(wk)
        if s.notna().sum() < 150:
            continue
        res = {}
        for v in (1.0, -1.0):
            sel = s[s == v].index
            rr, pp, dd = [], [], []
            for tk in ("^GSPC", "^KS11"):
                f = fw[(tk, h)].reindex(sel).dropna()
                d = fw[(tk, "dd", h)].reindex(sel).dropna()
                if len(f) >= 15:
                    rr.append(f.mean()); pp.append((f > 0).mean() * 100); dd.append((d <= -10).mean() * 100)
            res[v] = (len(sel), np.mean(rr) if rr else None, np.mean(pp) if pp else None, np.mean(dd) if dd else None)
        if res[1.0][3] is None or res[-1.0][3] is None:
            continue
        risk = res[-1.0][3] - res[1.0][3]                 # 경고일 때 더 자주 크게 빠졌나 (%p)
        w = max(0.0, min(2.0, round(risk / 15 * 2) / 2))
        W[k] = w
        stats[k] = {"h": "6개월" if h == 126 else "3개월", "since": str(s.dropna().index[0].date())[:4],
                    "pos": [int(res[1.0][0]), r_(res[1.0][1], 1), r_(res[1.0][2], 0), r_(res[1.0][3], 0)],
                    "neg": [int(res[-1.0][0]), r_(res[-1.0][1], 1), r_(res[-1.0][2], 0), r_(res[-1.0][3], 0)],
                    "risk": round(risk, 0), "w": w}
    # 진단: 상태별 3·6개월 수익·하락 위험 (로그로만)
    try:
        for k, (st, _) in R.items():
            s_ = st.reindex(wk)
            line = []
            for h in (63, 126):
                for tk in ("^GSPC", "^KS11"):
                    f = fw[(tk, h)].reindex(wk)
                    dd = fw[(tk, "dd")].reindex(wk)
                    parts = []
                    for v in (1.0, 0.0, -1.0):
                        sel = (s_ == v) & f.notna()
                        if sel.sum() < 15:
                            parts.append("  -   ")
                            continue
                        parts.append(f"{f[sel].mean():+5.1f}/{(dd[sel] <= -10).mean()*100:3.0f}%")
                    line.append(f"{tk[1:3]}{h}:" + " ".join(parts))
            log(f"  DIAG {k:7s} " + " | ".join(line))
    except Exception as e_:
        log("diag fail", e_)
    return stats, W, fw, wk


def composite(R, W, keys, idx):
    if not any(W.get(k, 0) > 0 for k in keys if k in R):      # 전부 안 맞았으면 같은 무게로
        W = {**W, **{k: 1.0 for k in keys if k in R}}
    num, den = None, None
    for k in keys:
        if k not in R or W.get(k, 0) <= 0:
            continue
        s = R[k][0].reindex(idx)
        a = (s * W[k]).fillna(0)
        b = s.notna().astype(float) * W[k]
        num = a if num is None else num + a
        den = b if den is None else den + b
    if num is None:
        return None
    return (num / den.where(den > 0) * 100)


BUCKETS = [(-101, -35, "−35 아래"), (-35, -10, "−35~−10"), (-10, 10, "−10~+10"), (10, 35, "+10~+35"), (35, 101, "+35 위")]


def bucket_table(score, fw, wk, h):
    sc = score.reindex(wk)
    rows = []
    for lo, hi, lab in BUCKETS:
        sel = sc[(sc >= lo) & (sc < hi)].index
        if len(sel) < 8:
            rows.append({"lab": lab, "n": int(len(sel))})
            continue
        row = {"lab": lab, "n": int(len(sel))}
        for tk, nm in (("^GSPC", "us"), ("^KS11", "kr")):
            f = fw[(tk, h)].reindex(sel).dropna()
            d = fw[(tk, "dd", h)].reindex(sel).dropna()
            row[nm] = [r_(f.mean(), 1), r_((f > 0).mean() * 100, 0), r_(d.median(), 1), r_((d <= -10).mean() * 100, 0)]
        rows.append(row)
    return rows


# =============================================================== 오늘만 보는 신호 (과거 자료 없음)
def live_only(prev):
    out = {}
    comp = {}
    try:
        comp = json.loads(http(OPD + "compass.json", 60, ua=NH)).get("markets") or {}
    except Exception as e:
        ERR.append(f"compass.json: {e}")
    # 200일선 위 종목 비율
    rows = []
    for k, fl, nm in (("US", "🇺🇸", "미국"), ("KR", "🇰🇷", "한국"), ("JP", "🇯🇵", "일본"), ("CN", "🇨🇳", "중국"), ("HK", "🇭🇰", "홍콩")):
        p = (comp.get(k) or {}).get("b200")
        if p is None:
            continue
        rows.append({"flag": fl, "name": nm, "v": round(p), "st": 1 if p > 55 else (-1 if p < 40 else 0),
                     "note": "과열권" if p > 85 else ("바닥권 — 역발상 매수 자리" if p < 20 else ""),
                     "hist": [x[1] for x in (comp.get(k) or {}).get("b200_hist") or []][-40:]})
    us = next((x for x in rows if x["name"] == "미국"), None)
    kr = next((x for x in rows if x["name"] == "한국"), None)
    if us and kr:
        st = 1 if us["st"] == 1 and kr["st"] == 1 else (-1 if us["st"] == -1 and kr["st"] == -1 else 0)
        note = ""
        if kr["v"] < 35:
            note = f" 한국은 지수에 비해 오르는 종목이 적어요 — 대형주 몇 개가 끄는 좁은 장"
        out["b200"] = (st, dict(name="200일선 위 종목 비율", val=f"미국 {us['v']}% · 한국 {kr['v']}%",
                                mean="지수만 오르고 이 비율이 떨어지면 속으로는 약세. 20% 아래는 바닥권, 85% 위는 과열." + note,
                                lead="1~3개월", rule="미국·한국 둘 다 55% 위 = 좋음 · 둘 다 40% 아래 = 경고", src="CH 나침반 전 종목 가격", rows=rows))
    # 브레드 스러스트
    rows, fired_any = [], False
    for k, fl, nm in (("US", "🇺🇸", "미국"), ("KR", "🇰🇷", "한국"), ("JP", "🇯🇵", "일본")):
        bh = (comp.get(k) or {}).get("breadth_hist")
        if not bh or len(bh) < 15:
            continue
        ratio = [u / (u + d) if (u + d) else 0.5 for _, u, d, *_ in bh]
        ema = []
        for x in ratio:
            ema.append(x if not ema else ema[-1] + 2 / 11 * (x - ema[-1]))
        fired = None
        for i in range(len(ema) - 1, max(9, len(ema) - 31), -1):
            if ema[i] >= 0.615 and min(ema[i - 10:i]) <= 0.40:
                fired = bh[i][0]
                break
        fired_any = fired_any or (fired is not None and k in ("US", "KR"))
        rows.append({"flag": fl, "name": nm, "v": round(ema[-1] * 100), "st": 1 if fired else 0, "fired": fired})
    if rows:
        out["thrust"] = (1 if fired_any else 0, dict(name="브레드 스러스트 (즈바이크)", val=f"미국 {rows[0]['v']}%",
                                                     mean="발동!" if fired_any else "발동 없음 — 10일 상승 종목 비율이 40%→61.5%로 열흘 안에 뛰면 발동. 1945년 이후 발동 뒤 1년 수익은 전부 플러스",
                                                     lead="상승 국면 진입 확인", rule="최근 30일 안 발동 = 좋음 · 평소 = 중립(점수 영향 없음)", src="CH 나침반 등락 종목 수", rows=rows))
    # 신고가 vs 신저가 (시장 폭 괴리)
    rows, sts = [], []
    for k, fl, nm in (("US", "🇺🇸", "미국"), ("KR", "🇰🇷", "한국")):
        m = comp.get(k) or {}
        hh = m.get("hl_hist") or []
        if len(hh) < 10:
            continue
        net10 = sum(h - l for _, h, l in hh[-10:])
        st_ = 1 if net10 > 0 else -1
        sts.append(st_)
        rows.append({"flag": fl, "name": nm, "v": net10, "u": "", "st": st_, "note": f"오늘 신고가 {m.get('highs')} · 신저가 {m.get('lows')}"})
    if sts:
        st = 1 if all(x == 1 for x in sts) else (-1 if all(x == -1 for x in sts) else 0)
        out["hl"] = (st, dict(name="신고가 − 신저가 (10일 합)", val=" · ".join(f"{x['flag']} {x['v']:+d}" for x in rows),
                              mean="지수가 높은데 신저가가 더 많으면 천장 경고 (1929·2000·2007년 모두 몇 달 앞서 나옴)",
                              lead="1~3개월", rule="미국·한국 둘 다 신고가 우세 = 좋음 · 둘 다 신저가 우세 = 경고", src="CH 나침반", rows=rows))
    # 외국인 코스피 20일 누적 (매일 쌓기)
    try:
        hist = {d: v for d, v in (prev.get("fr_hist") or [])}
        if len(hist) < 3:
            try:
                L = json.loads(http("https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/ledger/ledger.json", 40, ua=NH))
                for x in (L.get("series") or {}).get("foreign_kospi", []):
                    hist.setdefault(x["date"], float(x["value"]))
            except Exception as e:
                ERR.append(f"ledger 외국인: {e}")
        j = json.loads(http("https://m.stock.naver.com/api/index/KOSPI/trend", 30, ua=NH))
        d = j["bizdate"]
        hist[f"{d[:4]}-{d[4:6]}-{d[6:]}"] = float(str(j["foreignValue"]).replace(",", "").replace("+", ""))
        fh = sorted(hist.items())[-60:]
        out["_fr_hist"] = fh
        last20 = fh[-20:]
        c20, c5, nd = sum(v for _, v in last20), sum(v for _, v in fh[-5:]), len(last20)
        ss = ""
        try:
            jj = json.loads(http("https://m.stock.naver.com/api/stock/005930/integration", 30, ua=NH))
            rate = next((t["value"] for t in jj.get("totalInfos", []) if t.get("code") == "foreignRate"), None)
            if rate:
                ss = f" · 삼성전자 외국인 보유율 {rate}"
        except Exception:
            pass
        out["foreign"] = (1 if c20 > 0 else -1, dict(name="외국인 코스피 순매수 (20일 누적)", val=f"{c20/10000:+.2f}조" + ("" if nd >= 20 else f" ({nd}일치)"),
                                                    mean=f"최근 5일 {c5/10000:+.2f}조{ss}. 20일 누적이 돌아서는 시점이 코스피 전환과 거의 같아요" + ("" if nd >= 20 else f" — 아직 {nd}일치(매일 쌓는 중)"),
                                                    lead="동행 (한국에서 가장 믿을 만함)", rule="20일 누적 플러스 = 좋음 · 마이너스 = 경고", src="네이버 증권 · 시황리포트 장부",
                                                    hist=[r_(v / 10000, 2) for _, v in fh[-30:]]))
    except Exception as e:
        ERR.append(f"외국인: {e}")
    return out


# =============================================================== 종합
GROUP = {"yc": "cycle", "credit": "cycle", "nfci": "cycle", "claims": "cycle", "sahm": "cycle", "permit": "cycle", "cli": "cycle", "krx": "cycle",
         "trend": "timing", "b200": "timing", "thrust": "timing", "hl": "timing", "cycdef": "timing", "inner": "timing", "semi": "timing", "vix": "timing", "foreign": "timing"}
ORDER = ["yc", "credit", "nfci", "claims", "sahm", "permit", "cli", "krx", "trend", "b200", "thrust", "hl", "cycdef", "inner", "semi", "vix", "foreign"]


def quad(c, t):
    if c is None or t is None:
        return "엇갈림", "자료가 부족해요"
    if c >= 10 and t >= 10:
        return "상승 국면", "경기도 시장 흐름도 위 — 크게 빠질 위험이 가장 낮았던 조합. 비중 유지·확대 구간"
    if c >= 10 and t <= -10:
        return "경기 속 조정", "경기는 괜찮은데 시장이 흔들려요 — 흔들림은 크지만 경기가 받쳐 주면 조정으로 끝난 경우가 많아요"
    if c <= -10 and t >= 10:
        return "후반부 · 천장 조심", "시장은 아직 강하지만 경기 지표가 먼저 꺾이는 중 — 오르더라도 크게 빠질 위험이 커지는 구간"
    if c <= -10 and t <= -10:
        return "하락 국면", "경기와 시장이 함께 나빠져요 — 크게 빠질 위험이 가장 높았던 조합. 현금·방어 비중 늘릴 구간"
    if t >= 10:
        return "시장 우위", "경기는 중립, 시장 흐름은 위 — 추세를 따라가되 경기 지표를 지켜볼 구간"
    if t <= -10:
        return "시장 약세", "경기는 중립인데 시장 흐름이 약해요 — 서두르지 말고 확인 후"
    if c >= 10:
        return "경기 우위", "시장은 방향을 못 정했지만 경기는 받쳐줘요"
    if c <= -10:
        return "경기 약세", "시장은 아직 버티지만 경기 쪽이 약해지는 중"
    return "엇갈림", "지표들이 서로 다른 말을 해요 — 추세보다 종목"


def main():
    prev = {}
    try:
        prev = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        pass
    D = load()
    Y = D.get("Y", {})
    cal = Y["^GSPC"].index if "^GSPC" in Y else pd.bdate_range("1995-01-01", NOW.date())
    cal = cal[cal >= pd.Timestamp("1995-01-01")]
    R = rules(D, cal)
    stats, W, fw, wk = backtest(R, Y, cal, GROUP) if "^GSPC" in Y and "^KS11" in Y else ({}, {}, {}, None)
    cyc_keys = [k for k in ORDER if GROUP[k] == "cycle"]
    tim_keys = [k for k in ORDER if GROUP[k] == "timing"]
    for keys in (cyc_keys, tim_keys):                    # 한 묶음이 통째로 안 맞았으면 같은 무게로 (점수가 비지 않게)
        bk = [k for k in keys if k in stats]
        if bk and not any(W.get(k, 0) > 0 for k in bk):
            for k in bk:
                W[k] = 1.0
                stats[k]["w"] = 1.0
    # 과거 점수 (백테스트 된 지표만)
    hist, tables = [], {}
    if wk is not None:
        cs, ts = composite(R, W, cyc_keys, cal), composite(R, W, tim_keys, cal)
        tables = {"cycle": bucket_table(cs, fw, wk, 126) if cs is not None else [], "timing": bucket_table(ts, fw, wk, 63) if ts is not None else []}
        w2 = wk[wk >= wk[-1] - pd.Timedelta(days=730)]
        hist = [[d.strftime("%Y-%m-%d"), r_(cs.get(d), 0) if cs is not None else None, r_(ts.get(d), 0) if ts is not None else None] for d in w2]
        # 사분면별 과거 성적
        qs = {}
        cw = cs.reindex(wk) if cs is not None else pd.Series(np.nan, index=wk)
        tw = ts.reindex(wk) if ts is not None else pd.Series(np.nan, index=wk)
        for d in wk:
            c_, t_ = cw.get(d), tw.get(d)
            if c_ != c_ or t_ != t_ or c_ is None or t_ is None:
                continue
            q = quad(c_, t_)[0]
            qs.setdefault(q, []).append(d)
        tables["quad"] = {}
        for q, ds in qs.items():
            ix = pd.DatetimeIndex(ds)
            tables["quad"][q] = {"n": len(ds), **{nm: [r_(fw[(tk, 63)].reindex(ix).dropna().mean(), 1), r_((fw[(tk, 63)].reindex(ix).dropna() > 0).mean() * 100, 0),
                                                      r_(fw[(tk, "dd", 63)].reindex(ix).dropna().median(), 1), r_((fw[(tk, "dd", 63)].reindex(ix).dropna() <= -10).mean() * 100, 0)] for tk, nm in (("^GSPC", "us"), ("^KS11", "kr"))}}
    # 오늘
    L = live_only(prev)
    sig = []
    for k in ORDER:
        if k in R:
            st, meta = R[k]
            v = st.dropna()
            s_now = int(v.iloc[-1]) if len(v) else None
        elif k in L:
            s_now, meta = L[k]
        else:
            continue
        w = W.get(k, 1.0) if k in stats else 1.0
        sig.append(dict(id=k, grp=GROUP[k], st=s_now, w=w, bt=stats.get(k), **meta))
    for k in [x for x in ORDER if x not in [s["id"] for s in sig]]:
        sig.append(dict(id=k, grp=GROUP[k], st=None, w=0, name={"b200": "200일선 위 종목 비율", "thrust": "브레드 스러스트", "hl": "신고가 − 신저가", "foreign": "외국인 코스피 순매수"}.get(k, k),
                        val="자료 없음", mean="오늘은 못 받았어요"))

    def score(keys):
        a = [s for s in sig if s["id"] in keys and s["st"] is not None and s["w"] > 0 and not (s["id"] == "thrust" and s["st"] == 0)]
        den = sum(s["w"] for s in a)
        return round(sum(s["w"] * s["st"] for s in a) / den * 100) if den else None
    sc, stt = score(cyc_keys), score(tim_keys)
    label, verdict = quad(sc, stt)

    def look(rows, v):
        for row in rows or []:
            lo, hi = next((a, b) for a, b, l in BUCKETS if l == row["lab"])
            if v is not None and lo <= v < hi:
                return row
        return None
    now_c, now_t = look(tables.get("cycle"), sc), look(tables.get("timing"), stt)
    pm = {s["id"]: s.get("st") for s in (prev.get("sig") or [])}
    changes = [{"id": s["id"], "name": s["name"], "from": pm.get(s["id"]), "to": s["st"]} for s in sig
               if pm.get(s["id"]) is not None and s["st"] is not None and pm[s["id"]] != s["st"]]
    daily_hist = [h for h in (prev.get("daily") or []) if h[0] != TODAY and len(h) == 3] + [[TODAY, sc, stt]]
    out = {"v": 2, "updated": NOW.strftime("%Y-%m-%d %H:%M"), "cycle": sc, "timing": stt, "label": label, "verdict": verdict,
           "quad_stats": (tables.get("quad") or {}).get(label), "now_cycle": now_c, "now_timing": now_t,
           "tables": {k: v for k, v in tables.items() if k != "quad"}, "quad_all": tables.get("quad"),
           "sig": sig, "changes": changes, "hist": hist, "daily": daily_hist[-120:],
           "fr_hist": L.get("_fr_hist") or prev.get("fr_hist") or [], "errors": ERR[:20],
           "n_green": sum(1 for s in sig if s["st"] == 1), "n_red": sum(1 for s in sig if s["st"] == -1), "n_total": sum(1 for s in sig if s["st"] is not None),
           "bt_note": f"{BT_START[:4]}년 이후 매주 표본 · 발표 지연 반영 · 무게는 경고일 때 −10% 넘게 빠진 비율이 좋음일 때보다 얼마나 높았나로 정함 (같은 기간에서 정한 값이라 미래엔 덜 맞을 수 있음)"}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), default=lambda o: None)
    log(f"국면 v2 · 경기 {sc} · 시장 {stt} · {label} · 오류 {len(ERR)}")
    for k, s in stats.items():
        log(f"  {k:8s} w={s['w']} {s['h']} 좋음 {s['pos']} 경고 {s['neg']} 위험차 {s['risk']}")
    for e in ERR:
        log("  !", e)


if __name__ == "__main__":
    main()
