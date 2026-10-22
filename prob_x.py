"""
🎲 시장확률 보강 — 심리·위험선호·자금·일정 지표 (prob.py 가 불러 씀)
  10/14 사용자 「적용할 수 있는 거 적용할 수 있는 시장에 다 · 심리지표 연구도 하고 다 붙이고 · 확률을 논리적으로 높이고 · 설명 칸도 확실하게」

  모든 지표는 같은 방식으로 확률이 된다: 「지금과 같은 구간이었던 과거 날들의 다음 날·5일 뒤 상승 비율」
  → 표본이 적을수록 평소 쪽으로 눌러(경험적 베이즈) 결합.

  😱 심리 종합(우리 공포·탐욕 0~100)  — CNN 공포·탐욕 지수와 같은 뼈대를 공개 시세로 다시 만듦 (2007년~ 매일 계산 가능 → 통계를 낼 수 있음)
       ① 모멘텀: 지수 / 125일선            ② 변동성: VIX / VIX 50일 평균 (반대)
       ③ VIX 기간구조: VIX / VIX3M (반대)    ④ 정크본드 수요: HYG/LQD 20일 변화
       ⑤ 안전자산 수요: 주식 20일 − 국채(TLT) 20일   ⑥ 위험선호: 경기소비(XLY) / 필수소비(XLP) 20일
       ⑦ 주식 대 금: S&P / 금 20일
       각 항목을 지난 1년(252일) 안 백분위로 바꿔 평균 → 0 극공포 · 100 극탐욕
       시장별: 미국 = 위 7개 · 아시아 = 위 7개(미국 마감 기준) + 자기 지수 모멘텀·변동성 + (한국) 코스닥/코스피 · 원달러
  🌡️ VIX 기간구조 · 💳 크레딧 · 🎢 위험선호 · 💱 환율 · 🗓️ 옵션 만기 주간 · 🪙 크립토 공포·탐욕 · 📰 CNN 공포·탐욕 · 📊 시장 폭(prob_sec)
"""
import datetime as dt
import json
import math
import urllib.request

import numpy as np
import pandas as pd

XSYMS = ["^VIX3M", "HYG", "LQD", "TLT", "XLY", "XLP", "GC=F", "DX-Y.NYB", "^KQ11", "KRW=X", "JPY=X", "CNY=X", "^TNX", "^IRX"]
FX = {"KR": ("KRW=X", "원/달러"), "JP": ("JPY=X", "엔/달러"), "CN": ("CNY=X", "위안/달러"), "HK": ("CNY=X", "위안/달러"), "US": ("DX-Y.NYB", "달러 인덱스")}


def _get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                                               "Accept": "application/json", "Referer": "https://edition.cnn.com/"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def load_ext(fake=False):
    """밖에서 받는 심리 지수 (실패하면 빈 것)"""
    out = {}
    if fake:
        return out
    try:
        j = _get("https://api.alternative.me/fng/?limit=0&format=json")
        s = pd.Series({pd.Timestamp(int(x["timestamp"]), unit="s").normalize(): float(x["value"]) for x in j["data"]}).sort_index()
        out["crypto"] = s
        print("크립토 공포·탐욕", len(s), s.index[0].date(), "→", s.index[-1].date())
    except Exception as e:
        print("크립토 공포·탐욕 실패", e)
    try:
        j = _get("https://production.dataviz.cnn.io/index/fearandgreed/graphdata/2021-01-01")
        hist = j.get("fear_and_greed_historical", {}).get("data", [])
        s = pd.Series({pd.Timestamp(int(x["x"]), unit="ms").normalize(): float(x["y"]) for x in hist}).sort_index()
        s = s[~s.index.duplicated(keep="last")]
        if len(s) > 100:
            out["cnn"] = s
            print("CNN 공포·탐욕", len(s), s.index[0].date(), "→", s.index[-1].date(), "지금", s.iloc[-1])
    except Exception as e:
        print("CNN 공포·탐욕 실패", e)
    try:
        kd = load_kofia()
        if len(kd) > 1000:
            out["kofia"] = kd
    except Exception as e:
        print("금투협 증시자금 실패", e)
    try:
        pc = load_pcr()
        if len(pc) > 600:
            out["pcr"] = pc
    except Exception as e:
        print("풋콜 비율 실패", e)
    return out


def load_kofia():
    """금투협 freesis 증시자금추이 일별 (10/22 #9 · probe/credit_bt.py) — 투자자예탁금·미수금·반대매매(억원)
       POST https://freesis.kofia.or.kr/meta/getMetaDataList.do  OBJ_NM STATSCU0100000060BO (1998~ 매일, 다음 날 발표)"""
    body = json.dumps({"dmSearch": {"tmpV40": "100000000", "tmpV41": "1", "tmpV1": "D", "tmpV45": "19980101",
                                    "tmpV46": dt.date.today().strftime("%Y%m%d"), "OBJ_NM": "STATSCU0100000060BO"}}).encode()
    req = urllib.request.Request("https://freesis.kofia.or.kr/meta/getMetaDataList.do", data=body, method="POST",
                                 headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                                          "Content-Type": "application/json; charset=UTF-8", "Referer": "https://freesis.kofia.or.kr/"})
    with urllib.request.urlopen(req, timeout=40) as r:
        j = json.loads(r.read().decode("utf-8"))
    x = pd.DataFrame(j["ds1"])
    x.index = pd.to_datetime(x.pop("TMPV1"))
    x = x.sort_index().apply(pd.to_numeric, errors="coerce")
    k = pd.DataFrame({"dep": x["TMPV2"], "misu": x["TMPV5"], "bandae": x["TMPV6"], "bdr": x["TMPV7"]}).replace(0, np.nan)
    print("금투협 증시자금", len(k), k.index[0].date(), "→", k.index[-1].date(), "예탁금", k["dep"].iloc[-1])
    return k


PCR_FILE = "archive/x/pcr_total.csv"


def load_pcr():
    """CBOE 전체 풋콜 비율 일별 (10/19 #7b · probe/pcr_tail_bt.py)
       처음 한 번: 옛 CSV cdn.cboe.com/resources/options/volume_and_call_put_ratios/totalpc.csv (2006-11~2019-10)
       + 일별 JSON cdn.cboe.com/data/us/options/market_statistics/daily/YYYY-MM-DD_daily_options 로 빈 기간 채움 → archive/x/pcr_total.csv
       그다음부터는 마지막 날 뒤 날짜만 일별 JSON 으로 붙임"""
    import os, io, datetime as dt
    from concurrent.futures import ThreadPoolExecutor
    s = pd.Series(dtype=float)
    if os.path.exists(PCR_FILE):
        try:
            s = pd.read_csv(PCR_FILE, index_col=0, parse_dates=True).iloc[:, 0].dropna()
        except Exception:
            s = pd.Series(dtype=float)
    UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
    if len(s) < 1000:
        b = urllib.request.urlopen(urllib.request.Request("https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/totalpc.csv", headers=UA), timeout=30).read()
        lines = b.decode("utf-8", "ignore").splitlines()
        hi = next(i for i, l in enumerate(lines) if l.upper().startswith("DATE"))
        df = pd.read_csv(io.StringIO("\n".join(lines[hi:])))
        df.columns = [c.strip().upper() for c in df.columns]
        s = pd.Series(pd.to_numeric(df["P/C RATIO"], errors="coerce").values, index=pd.to_datetime(df["DATE"], errors="coerce")).dropna()
        s = s[~s.index.duplicated()].sort_index()
    start = s.index[-1].date() + dt.timedelta(days=1)
    days = [d.date() for d in pd.bdate_range(start, dt.date.today() - dt.timedelta(days=1))]

    def one(day):
        try:
            u = f"https://cdn.cboe.com/data/us/options/market_statistics/daily/{day}_daily_options"
            j = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=20).read())
            v = {x["name"]: x["value"] for x in j.get("ratios", [])}
            return pd.Timestamp(day), float(v["TOTAL PUT/CALL RATIO"])
        except Exception:
            return None
    if days:
        with ThreadPoolExecutor(16) as ex:
            got = [g for g in ex.map(one, days) if g]
        if got:
            s = pd.concat([s, pd.Series(dict(got))]).sort_index()
            s = s[~s.index.duplicated(keep="first")]
    s.rename("pcr").to_csv(PCR_FILE)
    print("CBOE 전체 풋콜", len(s), s.index[0].date(), "→", s.index[-1].date(), "지금", s.iloc[-1])
    return s


FR_FILE = "archive/x/foreign_hist.json"


def load_foreign(fake=False, pages=40):
    """코스피 외국인 순매수(억원) 일별 — 다음 금융 API (finance.daum.net/api/investor/KOSPI/days, 2026-10-14 찾음)
       네이버 옛 일별 페이지(410)·KRX(로그인 필요)는 막힘. 처음엔 여러 쪽을 받아 2~3년치, 그다음부터는 앞 1~2쪽만 → archive/x/foreign_hist.json"""
    import os
    hist = {}
    try:
        hist = json.load(open(FR_FILE, encoding="utf-8")) if os.path.exists(FR_FILE) else {}
    except Exception:
        hist = {}
    if fake:
        return pd.Series(dtype=float)
    need = 2 if len(hist) > 400 else pages
    got = 0
    H = {"User-Agent": "Mozilla/5.0", "Referer": "https://finance.daum.net/"}
    for pg in range(1, need + 1):
        try:
            req = urllib.request.Request(f"https://finance.daum.net/api/investor/KOSPI/days?page={pg}&perPage=30", headers=H)
            j = json.loads(urllib.request.urlopen(req, timeout=20).read().decode("utf-8"))
            rows = j.get("data") or []
            for x in rows:
                v = x.get("foreignStraightPurchasePrice")
                if v is not None:
                    hist[x["date"][:10]] = round(float(v) / 1e8, 1)      # 원 → 억원
                    got += 1
            if len(rows) < 30:
                break
        except Exception as e:
            print("외국인 수급(다음) 실패", pg, e)
            break
    if got == 0:                                                       # 다음이 막히면 네이버 오늘 값이라도
        try:
            req = urllib.request.Request("https://m.stock.naver.com/api/index/KOSPI/trend", headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"})
            j = json.loads(urllib.request.urlopen(req, timeout=20).read().decode("utf-8"))
            d = j["bizdate"]
            hist[f"{d[:4]}-{d[4:6]}-{d[6:]}"] = float(str(j["foreignValue"]).replace(",", "").replace("+", ""))
        except Exception as e:
            print("외국인 오늘(네이버) 실패", e)
    try:
        json.dump(dict(sorted(hist.items())[-1500:]), open(FR_FILE, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    except Exception:
        pass
    print("외국인 수급", len(hist), "일 (이번에 받음", got, ")")
    if not hist:
        return pd.Series(dtype=float)
    return pd.Series({pd.Timestamp(k): v for k, v in hist.items()}).sort_index()


def _c(H, s):
    x = H.get(s)
    return None if x is None or not len(x) else x["Close"].astype(float)


def rank252(x):
    return x.rolling(252, min_periods=120).rank(pct=True)


def build_global(H):
    """미국 달력의 심리·위험 지표 표"""
    sp, vix, v3 = _c(H, "^GSPC"), _c(H, "^VIX"), _c(H, "^VIX3M")
    G = pd.DataFrame(index=sp.index)
    comp = {}
    comp["모멘텀"] = sp / sp.rolling(125).mean() - 1
    if vix is not None:
        v = vix.reindex(G.index).ffill()
        comp["변동성(반대)"] = -(v / v.rolling(50).mean() - 1)
        G["vix"] = v
    if vix is not None and v3 is not None:
        G["vterm"] = (vix / v3).reindex(G.index).ffill()
        comp["VIX 기간구조(반대)"] = -G["vterm"]
    hy, lq = _c(H, "HYG"), _c(H, "LQD")
    if hy is not None and lq is not None:
        r = (hy / lq).reindex(G.index).ffill()
        G["credit20"] = r.pct_change(20)
        comp["정크본드 수요"] = G["credit20"]
    tlt = _c(H, "TLT")
    if tlt is not None:
        comp["안전자산 수요(반대)"] = sp.pct_change(20) - tlt.reindex(G.index).ffill().pct_change(20)
    xy, xp = _c(H, "XLY"), _c(H, "XLP")
    if xy is not None and xp is not None:
        G["riskon20"] = (xy / xp).reindex(G.index).ffill().pct_change(20)
        comp["위험선호(경기/필수소비)"] = G["riskon20"]
    gd = _c(H, "GC=F")
    if gd is not None:
        comp["주식 대 금"] = (sp / gd.reindex(G.index).ffill()).pct_change(20)
    dx = _c(H, "DX-Y.NYB")
    if dx is not None:
        G["dxy5"] = dx.reindex(G.index).ffill().pct_change(5)
    # 10/15 09시: 야후가 S&P 는 어제 봉을 줬는데 XLY·XLP·HYG·LQD·TLT 는 아직 그저께에 멈춘 때가 있음 → ffill 로 섞이면 항목이 실행마다 크게 흔들림(29↔41)
    #   → 모든 입력에 봉이 있는 마지막 날까지만 계산(그 뒤는 비움). 화면엔 이 기준일을 보여 줌.
    lasts = [x.dropna().index[-1] for x in (sp, vix, v3, hy, lq, tlt, xy, xp, gd) if x is not None and len(x.dropna())]
    if lasts:
        common = min(lasts)
        comp = {k: v.where(v.index <= common) for k, v in comp.items()}
        G.attrs["asof"] = str(common.date())
    P = pd.DataFrame({k: rank252(v) for k, v in comp.items()})
    # 항목 평균을 다시 1년 백분위로 — 평균만 내면 가운데로 몰려 극단이 거의 안 나옴(극공포·극탐욕 표본이 몇 개뿐)
    G["senti_raw"] = P.mean(axis=1, skipna=True).where(P.notna().sum(axis=1) >= 4)
    G["senti"] = rank252(G["senti_raw"]) * 100
    for k in P.columns:
        G["c_" + k] = P[k] * 100
    return G


def align(s, idx):
    """미국 날짜 t 의 값 → 아시아 날짜 t 에 (아시아 t+1 장 전에 아는 정보) · 같은 달력이면 그대로"""
    u = s[~s.index.duplicated(keep="last")].sort_index()
    return u.reindex(u.index.union(idx)).ffill().reindex(idx)


def expiry_dates(mk, start, end):
    """시장별 월간 옵션 만기일 (휴장 보정 없음)"""
    out = []
    for p in pd.period_range(start, end, freq="M"):
        y, m = p.year, p.month
        days = pd.date_range(f"{y}-{m:02d}-01", periods=p.days_in_month, freq="D")
        wk = days[days.dayofweek < 5]
        if mk == "US":
            d = days[days.dayofweek == 4][2]          # 셋째 금요일
        elif mk == "KR":
            d = days[days.dayofweek == 3][1]          # 둘째 목요일
        elif mk == "JP":
            d = days[days.dayofweek == 4][1]          # 둘째 금요일
        elif mk == "HK":
            d = wk[-2]                                # 마지막 전 영업일
        else:
            d = days[days.dayofweek == 2][3]          # 넷째 수요일
        out.append(d)
    return pd.DatetimeIndex(out)


def bucket_stats(d, x, edges, labels, cur, cond):
    """x 를 구간으로 나눠 지금 구간의 조건부 통계 + 전체 구간 표"""
    if cur is None or (isinstance(cur, float) and math.isnan(cur)):
        return None, []
    cut = pd.cut(x, edges, labels=labels)
    cb = pd.cut(pd.Series([cur]), edges, labels=labels).iloc[0]
    table = []
    for lb in labels:
        m = cond(d, (cut == lb).reindex(d.index).fillna(False), lb)
        if m:
            table.append({"k": lb, "n": m["n"], "p1": round(m["p1"], 3), "p5": round(m["p5"], 3) if m["p5"] is not None else None,
                          "m5": round(m["m5"], 2) if m["m5"] is not None else None, "now": lb == cb})
    m = cond(d, (cut == cb).reindex(d.index).fillna(False), str(cb))
    return m, table


def methods(mk, d, H, G, ext, cond, sec_breadth=None):
    """보강 방법들 → (방법 리스트, 심리 연구 dict)"""
    idx = d.index
    M = []
    us = mk == "US"
    lag = (lambda s: s.reindex(idx)) if us else (lambda s: align(s, idx))
    research = {}

    def add(k, ic, name, grp, m, w, ev, extra=None):
        if not m or m["n"] < 30:
            M.append({"k": k, "ic": ic, "name": name, "grp": grp, "p1": None, "p5": None, "n": m["n"] if m else 0, "w": 0, "ev": ev + " — 표본 부족, 이번엔 기울기 없음"})
            return
        x = {"k": k, "ic": ic, "name": name, "grp": grp, "p1": m["p1"], "p5": m["p5"], "n": m["n"], "w": w,
             "ev": ev + f" → 같은 구간 {m['n']:,}일: 다음 날 {m['p1']*100:.0f}% · 5일 {m['p5']*100:.0f}% (5일 중앙값 {m['m5']:+.1f}%)"}
        if extra:
            x.update(extra)
        M.append(x)

    # 😱 심리 종합 — 시장별
    S = lag(G["senti"])
    comps = {c[2:]: lag(G[c]) for c in G.columns if c.startswith("c_")}
    c = d["c"]
    loc = {"자기 지수 모멘텀": rank252(c / c.rolling(125).mean() - 1) * 100, "자기 지수 변동성(반대)": (1 - d["rvp"]) * 100,
           # 10/15 점검: CNN 지수의 「신고가 vs 신저가」 몫 — 지수가 52주 고점에서 얼마나 빠졌나(1년 백분위)
           "자기 지수 52주 고점 대비": rank252(c / c.rolling(252, min_periods=120).max() - 1) * 100}
    # 10/15 점검: 「코스닥/코스피」는 대형주 폭락 때 코스닥이 덜 빠져 극탐욕(98)으로 읽혀 한국 공포를 가렸음 → 뺌
    if not us:
        fx = _c(H, FX[mk][0])
        if fx is not None:
            if mk == "JP":   # 10/15 점검: 엔은 안전자산 — 엔 강세(엔/달러↓) = 공포, 엔 약세 = 위험선호. 예전엔 거꾸로라 닛케이 최고치 근처에서 극공포(9)
                loc[FX[mk][1] + "(엔 약세 = 탐욕 · 엔은 안전자산)"] = rank252(fx.reindex(idx).ffill().pct_change(20)) * 100
            else:
                loc[FX[mk][1] + "(반대 · 자국 통화 강세 = 탐욕)"] = rank252(-fx.reindex(idx).ffill().pct_change(20)) * 100
        gm = pd.DataFrame(comps).mean(axis=1, skipna=True)          # 미국 7개 항목 평균
        lm = pd.DataFrame(loc).mean(axis=1, skipna=True)            # 자기 시장 항목 평균
        comps.update(loc)
        S = rank252(gm / 3 + lm.reindex(gm.index) * 2 / 3) * 100     # 10/15 점검: 미국 1/3 · 자기 시장 2/3 (반반이면 한국 −17% 폭락이 미국 심리에 묻힘)
    cur = S.dropna().iloc[-1] if S.notna().any() else None        # 10/15: 기준일(모든 자료가 있는 날)의 값
    # 10/15 사용자 「공포지수 이게 맞니?」 — 큰 숫자가 어떻게 나왔는지(항목 평균 → 1년 백분위)와 CNN 원본을 화면에 같이
    def _l(x):
        try: v = float(x.dropna().iloc[-1]); return None if math.isnan(v) else round(v, 0)
        except Exception: return None
    how = {"avg": _l(pd.DataFrame(comps).mean(axis=1, skipna=True)), "asof": G.attrs.get("asof")}
    if not us:
        how.update({"us": _l(gm), "loc": _l(lm)})
    if "cnn" in ext and len(ext["cnn"]):
        how.update({"cnn": round(float(ext["cnn"].iloc[-1]), 0), "cnn_d": str(ext["cnn"].index[-1].date())})
    edges = [-1, 20, 40, 60, 80, 101]
    labs = ["극공포(0~20)", "공포(20~40)", "중립(40~60)", "탐욕(60~80)", "극탐욕(80~100)"]
    m, table = bucket_stats(d, S, edges, labs, cur, cond)
    parts = [{"k": k, "v": round(float(v.dropna().iloc[-1]), 0)} for k, v in comps.items() if v.notna().any()]
    research["senti"] = {"now": round(float(cur), 1) if cur is not None and not math.isnan(cur) else None, "table": table, "parts": parts, "how": how,
                         "since": str(S.dropna().index[0].date()) if S.notna().any() else None}
    if cur is not None and not math.isnan(cur):
        add("senti", "😱", "심리 종합", "심리", m, 1.0, f"우리 공포·탐욕 {cur:.0f}점" + (f" ({m['label']})" if m else "") + f" · 항목 {len(parts)}개 평균")
    # 🌡️ VIX 기간구조 (모든 시장 — 미국 공포가 다음 날 아시아로 옮겨감)
    if "vterm" in G:
        vt = lag(G["vterm"]); cv = vt.iloc[-1]
        m, tb = bucket_stats(d, vt, [0, 0.85, 0.95, 1.0, 1.1, 9], ["평온(<0.85)", "보통(0.85~0.95)", "긴장(0.95~1.0)", "역전(1.0~1.1)", "공황(>1.1)"], cv, cond)
        research["vterm"] = tb
        add("vterm", "🌡️", "VIX 기간구조", "심리", m, 0.8, f"VIX ÷ VIX3M = {cv:.2f} (1 넘으면 단기 공포가 장기보다 큼 = 역전)")
    # 🌡️ VIX 수준 (미국 외 시장)
    if not us and "vix" in G:
        vx = lag(G["vix"]); cv = vx.iloc[-1]
        m, _ = bucket_stats(d, vx, [0, 13, 17, 22, 30, 200], ["13 아래", "13~17", "17~22", "22~30", "30 넘음"], cv, cond)
        add("vixlv", "🧊", "VIX 수준", "심리", m, 0.5, f"VIX {cv:.1f}")
    # 💳 크레딧
    if "credit20" in G:
        cr = lag(G["credit20"]); cv = cr.iloc[-1]
        m, _ = bucket_stats(d, cr, [-9, -0.02, -0.005, 0.005, 0.02, 9], ["급히 나빠짐(−2%↓)", "나빠짐", "그대로", "좋아짐", "급히 좋아짐(+2%↑)"], cv, cond)
        add("credit", "💳", "크레딧(정크본드 수요)", "자금", m, 0.8, f"하이일드/투자등급 채권 20일 {cv*100:+.1f}% — 회사채 시장이 주식보다 먼저 위험을 알아챔")
    # 🎢 위험선호
    if mk == "KR" and "코스닥/코스피(개인 위험선호)" in loc:
        rr = (_c(H, "^KQ11").reindex(idx).ffill() / c).pct_change(20); cv = rr.iloc[-1]
        m, _ = bucket_stats(d, rr, [-9, -0.05, -0.015, 0.015, 0.05, 9], ["코스닥 크게 약함", "약함", "비슷", "강함", "코스닥 크게 강함"], cv, cond)
        add("riskon", "🎢", "위험선호(코스닥/코스피)", "심리", m, 0.6, f"코스닥 ÷ 코스피 20일 {cv*100:+.1f}%")
    elif "riskon20" in G:
        rr = lag(G["riskon20"]); cv = rr.iloc[-1]
        m, _ = bucket_stats(d, rr, [-9, -0.04, -0.01, 0.01, 0.04, 9], ["방어로 크게 이동", "방어 쪽", "비슷", "공격 쪽", "공격으로 크게 이동"], cv, cond)
        add("riskon", "🎢", "위험선호(경기/필수소비)", "심리", m, 0.6, f"미국 경기소비 ÷ 필수소비 20일 {cv*100:+.1f}%")
    # 💱 환율
    fxs, fxn = FX[mk]
    fx = _c(H, fxs)
    if fx is not None:
        f5 = (fx.reindex(idx).ffill() if not us else fx.reindex(idx).ffill()).pct_change(5)
        cv = f5.iloc[-1]
        m, _ = bucket_stats(d, f5, [-9, -0.015, -0.004, 0.004, 0.015, 9], ["달러 크게 약세", "달러 약세", "그대로", "달러 강세", "달러 크게 강세"], cv, cond)
        add("fx", "💱", "환율(" + fxn + ")", "자금", m, 0.6, f"{fxn} 5일 {cv*100:+.2f}% — 달러 강세는 외국인 자금이 빠지는 쪽")
    # 📐 장단기 금리차 (10/15 12시 #6 · probe/curve_bt.py) — 미 10년(^TNX) − 3개월(^IRX), 한국만
    #   검증(2000~, 2013-04 기준 앞/뒤): 「보통(0.5~1.5)」 구간 뒤 코스피 다음 날 +2.2%p · +2.0%p (n 1,501) · 「가파름(>1.5)」 −0.8 · −3.5%p
    #   걸어가며(그날 이전 자료만) 브라이어 0.2500→0.2498 · 0.2479→0.2471 · 최근 2년 0.2451→0.2423 — 세 기간 모두 개선
    #   일본·중국·미국은 브라이어 개선 없음 ❌ · 홍콩은 뒤 기간 나빠짐 ➖ · 60일 변화(가팔라짐/평평해짐)는 5개 시장 모두 ❌
    tn, ir = _c(H, "^TNX"), _c(H, "^IRX")
    if mk == "KR" and tn is not None and ir is not None:
        spd = (tn - ir).dropna()
        if len(spd) > 500:
            cs = align(spd, idx); cv = cs.iloc[-1]
            m, tb = bucket_stats(d, cs, [-9, 0, 0.5, 1.5, 9], ["역전(<0)", "평평(0~0.5)", "보통(0.5~1.5)", "가파름(>1.5)"], cv, cond)
            research["curve"] = tb
            add("curve", "📐", "장단기 금리차", "자금", m, 0.4, f"미 10년 − 3개월 금리 {cv:+.2f}%p ({spd.index[-1].strftime('%m/%d')})")
    # 🧮 풋콜 꼬리 (10/19 #7b · probe/pcr_tail_bt.py) — CBOE 전체 풋콜 5일 평균의 1년 백분위 ≥ 90%(극공포) 날만, 미국 「일주일」만
    #   검증(2006-11~2026-10, 걸어가며 사전 150, 평가 기간 앞/뒤 절반): S&P 5일 뒤 오름 65.8% vs 평소 57.8% (n 281) · 66.0% vs 61.0% (n 306) · 최근 2년 69.1% vs 57.7% (n 55)
    #   브라이어(5일) 0.2456→0.2450 · 0.2389→0.2384 · 최근 2년 0.2444→0.2437 — 세 기간 모두 개선 · 다음 날은 +3.4·+1.7%p 로 약해 안 씀
    #   한국·일본·중국·홍콩 꼬리, 주식 풋콜, 70% 꼬리, 탐욕 꼬리는 두 기간 엇갈리거나 브라이어 개선 없음 ❌ (10/15 전체 5칸도 ❌)
    pc = ext.get("pcr")
    if us and pc is not None and len(pc) > 600:
        rk = pc.rolling(5).mean().rolling(252, min_periods=120).rank(pct=True)
        x = rk.reindex(idx).ffill(limit=3); cv = x.iloc[-1]
        research["pcr"] = {"d": str(pc.index[-1].date()), "v": round(float(pc.iloc[-1]), 2), "rk": None if pd.isna(cv) else round(float(cv), 3)}
        if not pd.isna(cv) and cv >= 0.9:
            m = cond(d, (x >= 0.9).fillna(False), "풋콜 극공포(1년 상위 10%)")
            add("pcr", "🧮", "풋콜 극공포", "심리", m, 0.5, f"CBOE 전체 풋콜 5일 평균 1년 백분위 {cv*100:.0f}% — 옵션 시장 극공포 뒤 일주일은 평소보다 잘 오름(다음 날엔 안 씀)")
            if M and M[-1]["k"] == "pcr":
                M[-1]["p1"] = None
    # 🏦 투자자예탁금 급감 (10/22 #9 · probe/credit_bt.py) — 금투협 freesis 예탁금 20일 변화의 1년 백분위 ≤ 10% 날만, 한국 「일주일」만
    #   발표가 다음 날이라 하루 늦춰 씀. 검증(2005~, 걸어가며 사전 150, 평가 기간 앞/뒤 절반): 코스피 5일 뒤 오름 −8.0%p (n 256) · −3.7%p (n 288) · 최근 2년 −5.3%p (n 64)
    #   브라이어(5일) 0.24572→0.24507 · 0.24685→0.24678 · 최근 2년 0.24214→0.24171 — 세 기간 모두 개선 · 다음 날은 브라이어 엇갈려 안 씀
    #   신용잔고(20일·5일 변화·250일 평균 대비·예탁금 대비)·반대매매 비중·금액·미수금은 앞/뒤 엇갈리거나 브라이어 개선 없음 ❌
    #   「신용 급감·반대매매 많음 + 5일 −3%」 뒤 다음 날 +5~9%p 는 기간마다 n 51~123 · 최근 2년 반대 → ➖ 안 붙임
    kd = ext.get("kofia")
    if mk == "KR" and kd is not None and len(kd) > 1000:
        k_ = kd.reindex(kd.index.union(idx)).ffill().reindex(idx).shift(1)
        dch = k_["dep"].pct_change(20)
        rk = dch.rolling(252, min_periods=120).rank(pct=True); cv = rk.iloc[-1]
        research["kofia"] = {"d": str(kd.index[-1].date()), "dep": round(float(kd["dep"].iloc[-1]) / 10000, 1),
                             "ch20": None if pd.isna(dch.iloc[-1]) else round(float(dch.iloc[-1]) * 100, 1),
                             "rk": None if pd.isna(cv) else round(float(cv), 3),
                             "bdr5": round(float(kd["bdr"].iloc[-5:].mean()), 1) if kd["bdr"].notna().any() else None}
        if not pd.isna(cv) and cv <= 0.1:
            m = cond(d, (rk <= 0.1).fillna(False), "예탁금 급감(1년 하위 10%)")
            add("kofia", "🏦", "투자자예탁금 급감", "자금", m, 0.5, f"투자자예탁금 20일 {dch.iloc[-1]*100:+.1f}% (1년 백분위 {cv*100:.0f}%) — 개인 대기자금이 빠르게 빠질 때 코스피 일주일이 평소보다 약했음(다음 날엔 안 씀)")
            if M and M[-1]["k"] == "kofia":
                M[-1]["p1"] = None
    # 🌏 외국인 수급 (한국) — 20일 누적 순매수의 2년 백분위 + 연속 순매도 일수
    fr = ext.get("foreign")
    if mk == "KR" and fr is not None and 0 < len(fr) <= 120:
        c5 = fr.iloc[-5:].sum()
        sgv = np.sign(fr.values); k_ = 0
        for v in sgv[::-1]:
            if v == sgv[-1]: k_ += 1
            else: break
        M.append({"k": "foreign", "ic": "🌏", "name": "외국인 수급", "grp": "폭·수급", "p1": None, "p5": None, "n": len(fr), "w": 0,
                  "ev": f"외국인 최근 5일 {c5/10000:+.2f}조 · {'연속 순매도' if sgv[-1] < 0 else '연속 순매수'} {k_}일 — 자료 {len(fr)}일 (120일 넘으면 확률에 들어가요)"})
    if mk == "KR" and fr is not None and len(fr) > 120:
        f = fr.reindex(idx).fillna(0) if True else fr
        f = f[f.index >= fr.index[0]]
        c20 = f.rolling(20).sum()
        rk = c20.rolling(500, min_periods=100).rank(pct=True)
        sgn = np.sign(f.values); stv = np.zeros(len(sgn))
        for i in range(1, len(sgn)):
            stv[i] = stv[i - 1] + sgn[i] if sgn[i] != 0 and (stv[i - 1] == 0 or np.sign(stv[i - 1]) == sgn[i]) else sgn[i]
        dd_ = d.loc[f.index]
        cv = rk.iloc[-1]; streak = int(stv[-1])
        m, tb = bucket_stats(dd_, rk, [-0.01, 0.1, 0.3, 0.7, 0.9, 1.01], ["매도 극단(하위 10%)", "매도 우위", "보통", "매수 우위", "매수 극단(상위 10%)"], cv, cond)
        research["foreign"] = tb
        add("foreign", "🌏", "외국인 수급", "폭·수급", m, 0.9,
            f"외국인 20일 누적 {c20.iloc[-1]/10000:+.1f}조 (최근 {len(f)}일 중 {cv*100:.0f}% 위치) · {'연속 순매도' if streak < 0 else '연속 순매수'} {abs(streak)}일")
    # 🗓️ 옵션 만기 주간
    ex = expiry_dates(mk, idx[0], idx[-1] + pd.Timedelta(days=40))
    nxt = pd.Series(ex.searchsorted(idx), index=idx)
    ex_ar = np.r_[ex.values, np.datetime64("2100-01-01")]
    dleft = pd.Series((ex_ar[nxt.values] - idx.values) / np.timedelta64(1, "D"), index=idx)
    inwk = (dleft > 0) & (dleft <= 7)
    cv = bool(inwk.iloc[-1])
    m = cond(d, inwk == cv, "만기 주간" if cv else "만기 주간 아님")
    nd = ex[ex > idx[-1]][0] if (ex > idx[-1]).any() else None
    add("expiry", "🗓️", "옵션 만기 주간", "일정", m, 0.4, f"다음 만기 {nd.strftime('%m/%d') if nd is not None else '-'} ({'일주일 안' if cv else '일주일 밖'})")
    # 🪙 크립토 공포·탐욕 (2018년~)
    if "crypto" in ext:
        cs = align(ext["crypto"], idx); cv = cs.iloc[-1]
        m, tb = bucket_stats(d, cs, [-1, 25, 45, 55, 75, 101], ["극공포", "공포", "중립", "탐욕", "극탐욕"], cv, cond)
        research["crypto"] = tb
        add("crypto", "🪙", "크립토 공포·탐욕", "심리", m, 0.4, f"alternative.me {cv:.0f}점 — 개인 위험선호가 가장 먼저 드러나는 곳 (2018년~)")
    # 📰 CNN 공포·탐욕
    if "cnn" in ext:
        cs = lag(ext["cnn"]) if us else align(ext["cnn"], idx); cv = cs.iloc[-1]
        m, tb = bucket_stats(d, cs, [-1, 25, 45, 55, 75, 101], ["극공포", "공포", "중립", "탐욕", "극탐욕"], cv, cond)
        research["cnn"] = tb
        add("cnn", "📰", "CNN 공포·탐욕", "심리", m, 0.6, f"CNN {cv:.0f}점 (원본 지수, {ext['cnn'].index[0].year}년~)")
    # 📊 시장 폭 (prob_sec — 시총 상위 250종목 2년)
    if sec_breadth and sec_breadth.get("p1") is not None:
        b = sec_breadth
        M.append({"k": "breadth", "ic": "📊", "name": "시장 폭", "grp": "폭·수급", "p1": b["p1"], "p5": b["p5"], "n": b["n"], "w": 0.6,
                  "ev": f"50일선 위 종목 {b['pct50']:.0f}% · 10일 상승 비율 {b['adv10']:.0f}%" + (" · ⚡ 폭 급반전(쯔바이크 신호)" if b.get("thrust") else "") +
                        f" → 같은 구간 {b['n']}일(최근 2년): 다음 날 {b['p1']*100:.0f}% · 5일 {b['p5']*100:.0f}%"})
    return M, research
