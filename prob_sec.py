"""
🎲 시장확률 2단계 — 섹터·종목 확률 (5개 시장) + 🐋 고래 원픽 (prob_sec.yml, 하루 4번)
  10/14 사용자 「각 시장 밑에 오르고 내릴 섹터 확률도, 그 안에 종목들 확률도」
              「고래의 오늘의 픽은 대체 기준이 뭐야? 차트·수급·흐름·뉴스로 고래 원픽을 고르는 게 낫지 않겠니?」

  ① 시장마다 시가총액 큰 250종목(미국은 고래 종목 더함)의 2년 일봉
  ② 종목-날짜 표 하나로 모은 로지스틱 회귀 (시장마다 따로)
       특성: 1·5·20·60일 수익 · 시장 대비 20일 · RSI · 50일선 거리 · 52주 고점 거리 · 거래량 5일/60일(수급 대용)
            · 업종 5일 수익 · 시장 지수 5일·20일
       목표: 내일 오름 · 5일 뒤 오름 · 5일 동안 시장보다 나음
       검증: 마지막 60거래일은 학습에서 빼고 AUC (0.5 = 동전)
  ③ 섹터 확률 = 속한 종목 확률의 시가총액 가중 평균
  ④ 🐋 고래 원픽: 고래가 들고 있는 후보(오늘의 10·큰 신규·평단 근처·어제 움직임·실적 앞) 중에서
       고래 25 + 차트 25 + 수급 15 + 흐름(확률 모델) 20 + 뉴스·실적 15 = 100점 → 1등
  → archive/x/prob_sec.json · archive/x/whale_pick.json · archive/x/whale_pick_log.json(채점)
  FAKE=1 python prob_sec.py  (야후 없이 가짜 자료로 계산만 시험)
"""
import datetime as dt
import glob
import json
import math
import os
import re
import time
import urllib.request
from collections import defaultdict

import numpy as np
import pandas as pd

from subsec import sub_of

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
FAKE = os.environ.get("FAKE") == "1"
OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/"
MSR = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/"
OUT = os.path.join("archive", "x", "prob_sec.json")
WOUT = os.path.join("archive", "x", "whale_pick.json")
WLOG = os.path.join("archive", "x", "whale_pick_log.json")
N_PER = int(os.environ.get("N_PER", "250"))
HOLD = 60

MK = {
    "KR": {"suf": (".KS", ".KQ"), "ix": "^KS11", "name": "한국", "flag": "🇰🇷"},
    "US": {"suf": None, "ix": "^GSPC", "name": "미국", "flag": "🇺🇸"},
    "JP": {"suf": (".T",), "ix": "^N225", "name": "일본", "flag": "🇯🇵"},
    "CN": {"suf": (".SS", ".SZ"), "ix": "000001.SS", "name": "중국", "flag": "🇨🇳"},
    "HK": {"suf": (".HK",), "ix": "^HSI", "name": "홍콩", "flag": "🇭🇰"},
}
FEATS = ["r1", "r5", "r20", "r60", "rel20", "rsi", "ma50d", "hi52", "vr", "sec5", "m5", "m20"]
TGTS = ["y1", "y5", "yr5"]


def get(url, timeout=60):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def r2(v, n=2):
    try:
        v = float(v)
    except Exception:
        return None
    return None if math.isnan(v) else round(v, n)


def mine(s, cfg):
    return ("." not in s and "^" not in s) if cfg["suf"] is None else s.endswith(cfg["suf"])


# ---------------- 자료 ----------------
def download(syms):
    """{sym: DataFrame(Close, Volume)} — 2년 일봉"""
    if FAKE:
        rng = np.random.default_rng(3)
        idx = pd.bdate_range(end=NOW.date(), periods=520)
        out = {}
        mkt = np.cumsum(rng.normal(0.0004, 0.01, len(idx)))
        for s in syms:
            b = rng.uniform(0.5, 1.5)
            r = b * np.diff(np.r_[0, mkt]) + rng.normal(0, 0.015, len(idx))
            out[s] = pd.DataFrame({"Close": 100 * np.exp(np.cumsum(r)), "Volume": rng.integers(1e5, 1e6, len(idx)).astype(float)}, index=idx)
        return out
    import yfinance as yf
    out = {}
    for i in range(0, len(syms), 200):
        part = syms[i:i + 200]
        try:
            df = yf.download(part, period="2y", interval="1d", group_by="ticker", auto_adjust=True, progress=False, threads=True)
        except Exception as e:
            print("받기 실패", i, e)
            continue
        for s in part:
            try:
                sub = df[s][["Close", "Volume"]].dropna(subset=["Close"])
                sub.index = pd.to_datetime(sub.index).tz_localize(None)
                if len(sub) > 150:
                    out[s] = sub[~sub.index.duplicated(keep="last")]
            except Exception:
                pass
        print("받음", min(i + 200, len(syms)), "/", len(syms), "→", len(out))
    return out


def rsi(c, n=14):
    d = c.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn.replace(0, np.nan))


def panel(H, ix, info):
    """종목-날짜 특성 표"""
    m = H[ix]["Close"]
    mr5, mr20 = m.pct_change(5), m.pct_change(20)
    mf5 = m.shift(-5) / m - 1
    rows = []
    for s, px in H.items():
        if s == ix or s not in info:
            continue
        c, v = px["Close"], px["Volume"].replace(0, np.nan)
        d = pd.DataFrame(index=c.index)
        d["s"] = s
        d["r1"] = c.pct_change()
        d["r5"] = c.pct_change(5)
        d["r20"] = c.pct_change(20)
        d["r60"] = c.pct_change(60)
        d["rsi"] = rsi(c) / 100
        d["ma50d"] = c / c.rolling(50).mean() - 1
        d["hi52"] = c / c.rolling(250, min_periods=120).max() - 1
        d["vr"] = np.log((v.rolling(5).mean() / v.rolling(60).mean()).clip(0.05, 20))
        d["m5"] = mr5.reindex(c.index)
        d["m20"] = mr20.reindex(c.index)
        d["rel20"] = d["r20"] - d["m20"]
        f5 = c.shift(-5) / c - 1
        d["y1"] = (c.shift(-1) > c).astype(float).where(c.shift(-1).notna())
        d["y5"] = (f5 > 0).astype(float).where(f5.notna())
        d["yr5"] = (f5 > mf5.reindex(c.index)).astype(float).where(f5.notna() & mf5.reindex(c.index).notna())
        d["sec"] = info[s]["sec"]
        d["cap"] = info[s]["cap"]
        rows.append(d)
    P = pd.concat(rows)
    P.index.name = "date"
    P = P.reset_index()
    # 업종 5일 수익 (같은 날 같은 업종 평균)
    P["sec5"] = P.groupby(["date", "sec"])["r5"].transform("mean")
    return P


# ---------------- 모델 ----------------
def logistic_fit(X, y, iters=20, l2=5.0):
    n, k = X.shape
    Xb = np.hstack([np.ones((n, 1)), X])
    w = np.zeros(k + 1)
    for _ in range(iters):
        p = 1 / (1 + np.exp(-np.clip(Xb @ w, -30, 30)))
        g = Xb.T @ (p - y) + l2 * np.r_[0, w[1:]]
        W = p * (1 - p)
        Hm = (Xb * W[:, None]).T @ Xb + l2 * np.diag(np.r_[0, np.ones(k)])
        try:
            w -= np.linalg.solve(Hm, g)
        except Exception:
            break
    return w


def pred(w, X):
    return 1 / (1 + np.exp(-np.clip(np.c_[np.ones(len(X)), X] @ w, -30, 30)))


def auc(y, s):
    o = np.argsort(s)
    r = np.empty(len(s)); r[o] = np.arange(1, len(s) + 1)
    npos = y.sum(); nneg = len(y) - npos
    if npos == 0 or nneg == 0:
        return None
    return float((r[y == 1].sum() - npos * (npos + 1) / 2) / (npos * nneg))


def fit_market(P):
    """시장 하나: 목표 3개 학습 → 마지막 날 종목별 확률"""
    P = P.copy()
    for f in FEATS:
        P[f] = P[f].replace([np.inf, -np.inf], np.nan)
    last_day = P["date"].max()
    cur = P[P["date"] == last_day].dropna(subset=FEATS)
    dates = np.sort(P["date"].unique())
    cut = dates[-(HOLD + 6)] if len(dates) > HOLD + 30 else dates[len(dates) // 2]
    # 이상치 자르기 + 표준화 (학습 구간 기준)
    tr_all = P.dropna(subset=FEATS)
    lo, hi = tr_all[FEATS].quantile(0.01), tr_all[FEATS].quantile(0.99)
    def X_of(D):
        X = D[FEATS].clip(lo, hi, axis=1)
        return X
    Xall = X_of(tr_all)
    mu, sd = Xall.mean(), Xall.std() + 1e-9
    out = {"n_rows": int(len(tr_all)), "last": str(pd.Timestamp(last_day).date()), "auc": {}, "base": {}}
    probs = pd.DataFrame(index=cur["s"].values)
    for t in TGTS:
        D = tr_all.dropna(subset=[t])
        tr, te = D[D["date"] < cut], D[(D["date"] >= cut)]
        Xs_tr = ((X_of(tr) - mu) / sd).values
        w = logistic_fit(Xs_tr, tr[t].values)
        a = auc(te[t].values, pred(w, ((X_of(te) - mu) / sd).values)) if len(te) > 200 else None
        w2 = logistic_fit(((X_of(D) - mu) / sd).values, D[t].values)
        raw = pred(w2, ((X_of(cur) - mu) / sd).values)
        # 검증 AUC 만큼만 믿기: 0.56↑ = 그대로, 0.50 이하 = 평소 쪽으로 80% 눌러 줌 (순위는 그대로)
        b = float(D[t].mean())
        k = 0.2 if a is None else min(1.0, max(0.2, (a - 0.5) / 0.06))
        lb = math.log(b / (1 - b))
        lr = np.log(np.clip(raw, 1e-4, 1 - 1e-4) / (1 - np.clip(raw, 1e-4, 1 - 1e-4)))
        probs[t] = 1 / (1 + np.exp(-(lb + k * (lr - lb))))
        out["auc"][t] = r2(a, 3)
        out["base"][t] = r2(b, 3)
        out.setdefault("k", {})[t] = r2(k, 2)
    return out, cur.set_index("s"), probs


# ---------------- 🐋 고래 원픽 ----------------
def whale_pool():
    ds = sorted(glob.glob(os.path.join("archive", "whale", "20*", "data.json")))
    if not ds:
        return {}, None
    d = json.load(open(ds[-1], encoding="utf-8"))
    sg = d.get("signals", {}) or {}
    pool = defaultdict(lambda: {"tags": [], "wscore": 0, "nh": 0})
    sc = sg.get("top10_score", {}) or {}
    for i, s in enumerate(sg.get("top10", []) or []):
        pool[s]["tags"].append(f"고래 TOP10 {i + 1}위"); pool[s]["wscore"] = max(pool[s]["wscore"], sc.get(s, 0))
    for s in sg.get("big", []) or []:
        pool[s]["tags"].append("큰 신규 포지션"); pool[s]["wscore"] = max(pool[s]["wscore"], 30)
    for s in sg.get("ins", []) or []:
        pool[s]["tags"].append("임원 매수"); pool[s]["wscore"] = max(pool[s]["wscore"], 25)
    for s in sg.get("near", []) or []:
        pool[s]["tags"].append("고래 평단 근처"); pool[s]["wscore"] = max(pool[s]["wscore"], 22)
    for s in sg.get("rebound", []) or []:
        pool[s]["tags"].append("반전 신호"); pool[s]["wscore"] = max(pool[s]["wscore"], 20)
    for s in sg.get("mov", []) or []:
        pool[s]["tags"].append("어제 고래 종목 큰 움직임"); pool[s]["wscore"] = max(pool[s]["wscore"], 15)
    for s in sg.get("earn1", []) or []:
        pool[s]["tags"].append("실적 임박"); pool[s]["wscore"] = max(pool[s]["wscore"], 15)
    for s, n, _ in d.get("hold", []) or []:
        pool[s]["nh"] = n
        if not pool[s]["tags"]:
            pool[s]["tags"].append(f"고래 {n}곳 보유"); pool[s]["wscore"] = max(pool[s]["wscore"], 10 + n)
    for s in sg.get("warn", []) or []:
        if s in pool:
            pool[s]["tags"].append("⚠ 고래 이탈"); pool[s]["wscore"] -= 15
    return dict(pool), {"date": os.path.basename(os.path.dirname(ds[-1])), "old_hero": sg.get("hero", "")}


def feed_hits(syms, names):
    """최근 3일 피드·두뇌 글에서 종목 언급 (제목) → {sym: [제목…]}"""
    items = []
    if not FAKE:
        for f in ("feeds/my_feed.json", "feeds/ai_found.json"):
            try:
                j = get(MSR + f, timeout=60)
                items += [(x.get("title") or "", x.get("first") or x.get("at") or "") for x in j.get("items", [])]
            except Exception as e:
                print("피드 실패", f, e)
    since = (NOW - dt.timedelta(days=3)).strftime("%Y-%m-%d")
    items = [t for t, a in items if a[:10] >= since]
    out = {}
    for s in syms:
        nm = names.get(s, "")
        keys = [s] if len(s) >= 3 else []
        ko = re.sub(r"\s*(ADR|보통주|우선주|클래스\s*\w)$", "", nm).strip()
        if len(ko) >= 2:
            keys.append(ko.split()[0])
        hits = []
        for t in items:
            for k in keys:
                if (k == s and re.search(r"(?<![A-Za-z])" + re.escape(k) + r"(?![A-Za-z])", t)) or (k != s and k in t):
                    hits.append(t); break
        if hits:
            out[s] = hits[:3]
    return out


def earnings(syms):
    """{sym: (날짜, 남은 날)} — 지난 7일 ~ 앞 14일"""
    out = {}
    if FAKE:
        return out
    try:
        import yfinance as yf
        for s in syms:
            try:
                cal = yf.Ticker(s).calendar
                ds = cal.get("Earnings Date") if isinstance(cal, dict) else None
                if ds:
                    d0 = pd.Timestamp(ds[0]).date()
                    dd = (d0 - NOW.date()).days
                    if -7 <= dd <= 14:
                        out[s] = (str(d0), dd)
            except Exception:
                pass
    except Exception as e:
        print("실적 일정 실패", e)
    return out


def whale_pick(H, cur, probs, mres, names):
    pool, meta = whale_pool()
    if not pool:
        return None
    syms = [s for s in pool if s in cur.index]
    news = feed_hits(syms, names)
    earn = earnings(syms)
    base5, baser5 = mres["base"]["y5"], mres["base"]["yr5"]
    rows = []
    for s in syms:
        c, w = cur.loc[s], pool[s]
        px = H[s]["Close"]
        # 고래 25: 고래 점수(0~60) + 보유 고래 수
        g_wh = max(0, min(25, w["wscore"] * 0.4 + min(5, w["nh"] * 0.5)))
        # 차트 25: 50일선 위·52주 고점 근처·20일 상대강도·RSI 과열 아님
        ma200 = px.rolling(200, min_periods=150).mean().iloc[-1]
        above200 = bool(px.iloc[-1] > ma200) if not math.isnan(ma200) else None
        ch = 0
        ch += 6 if c["ma50d"] > 0 else 0
        ch += 5 if above200 else 0
        ch += 7 * max(0, 1 + c["hi52"] / 0.25) if c["hi52"] > -0.25 else 0       # 고점 0% → 7점, −25% → 0점
        ch += 5 * max(0, min(1, (c["rel20"] + 0.05) / 0.15))                     # 시장 대비 20일 −5%→0, +10%→5
        ch += 2 if 0.40 <= c["rsi"] <= 0.70 else 0
        g_ch = min(25, ch)
        # 수급 15: 거래량 5일/60일 + 오른 날 거래량 우위
        vr = math.exp(c["vr"])
        v = H[s]["Volume"].tail(20); r_ = px.pct_change().tail(20)
        upv = float(v[r_ > 0].sum() / max(1.0, v.sum()))
        g_sd = min(15, 8 * max(0, min(1, (vr - 0.8) / 0.8)) + 7 * max(0, min(1, (upv - 0.4) / 0.3)))
        # 흐름 20: 확률 모델 (5일 시장보다 나음 + 5일 오름)
        pr5, p5 = float(probs.loc[s, "yr5"]), float(probs.loc[s, "y5"])
        g_fl = max(0, min(20, 10 + (pr5 - baser5) * 200 + (p5 - base5) * 100))
        # 뉴스·실적 15: 피드 언급 + 실적 (발표 후 반응이 좋으면 가점, 발표 전 3일 안이면 감점)
        g_nw = min(8, 4 * len(news.get(s, [])))
        e = earn.get(s)
        enote = ""
        if e:
            if e[1] < 0:
                d0 = pd.Timestamp(e[0])
                aft = px[px.index >= d0]
                bef = px[px.index < d0]
                if len(aft) and len(bef):
                    react = float(aft.iloc[-1] / bef.iloc[-1] - 1)
                    g_nw += 7 if react > 0.03 else 3 if react > 0 else -3
                    enote = f"{e[0][5:]} 실적 뒤 {react*100:+.1f}%"
            elif e[1] <= 3:
                g_nw -= 4; enote = f"{e[0][5:]} 실적 발표 앞 ({e[1]}일) — 발표 뒤 반응 확인이 원칙"
            else:
                enote = f"{e[0][5:]} 실적 예정"
        g_nw = max(-5, min(15, g_nw + 2))
        tot = g_wh + g_ch + g_sd + g_fl + g_nw
        why = []
        why.append("🐋 " + " · ".join(w["tags"][:2]) + (f" (고래 {w['nh']}곳)" if w["nh"] else ""))
        why.append(f"📈 50일선 {'위' if c['ma50d'] > 0 else '아래'} {c['ma50d']*100:+.0f}% · 52주 고점 {c['hi52']*100:+.0f}% · 시장 대비 20일 {c['rel20']*100:+.1f}%p" + (" · 200일선 위" if above200 else " · 200일선 아래" if above200 is False else ""))
        why.append(f"💧 거래량 5일/60일 {vr:.2f}배 · 20일 중 오른 날 거래량 {upv*100:.0f}%")
        why.append(f"🎲 5일 시장보다 나을 확률 {pr5*100:.0f}% (평소 {baser5*100:.0f}%) · 오를 확률 {p5*100:.0f}%")
        if news.get(s) or enote:
            why.append("📰 " + " · ".join(([f"피드 언급 {len(news.get(s, []))}건: {news[s][0][:40]}"] if news.get(s) else []) + ([enote] if enote else [])))
        rows.append({"s": s, "n": names.get(s, s), "tot": round(tot, 1), "parts": {"고래": round(g_wh, 1), "차트": round(g_ch, 1), "수급": round(g_sd, 1), "흐름": round(g_fl, 1), "뉴스·실적": round(g_nw, 1)},
                     "why": why, "p5": r2(p5, 3), "pr5": r2(pr5, 3), "last": r2(px.iloc[-1]), "r1": r2(c["r1"] * 100), "r20": r2(c["r20"] * 100), "news": news.get(s, [])})
    rows.sort(key=lambda x: -x["tot"])
    out = {"at": NOW.strftime("%Y-%m-%d %H:%M"), "whale_date": meta["date"], "old_hero": meta["old_hero"], "pick": rows[0] if rows else None,
           "rank": rows[:10], "n_pool": len(rows),
           "how": "고래가 들고 있는 후보 중에서 고래 25 + 차트 25 + 수급 15 + 흐름(확률 모델) 20 + 뉴스·실적 15 = 100점. 실적 발표 3일 안은 감점(발표 뒤 반응 확인), 고래 이탈은 감점."}
    # 채점 기록: 날짜별 원픽 · 고른 날 가격 · SPY
    try:
        lg = json.load(open(WLOG, encoding="utf-8")) if os.path.exists(WLOG) else {}
    except Exception:
        lg = {}
    d = NOW.strftime("%Y-%m-%d")
    if rows and d not in lg:
        spy = H.get("^GSPC")
        lg[d] = {"s": rows[0]["s"], "n": rows[0]["n"], "px": rows[0]["last"], "spx": r2(spy["Close"].iloc[-1]) if spy is not None else None, "tot": rows[0]["tot"], "old": meta["old_hero"]}
    # 성적: 지금 가격 vs 고른 날 · S&P 대비
    res = []
    for dd, x in sorted(lg.items()):
        if dd == d or x["s"] not in H:
            continue
        now = float(H[x["s"]]["Close"].iloc[-1]); sp = H.get("^GSPC")
        ret = (now / x["px"] - 1) * 100 if x.get("px") else None
        b = (float(sp["Close"].iloc[-1]) / x["spx"] - 1) * 100 if (sp is not None and x.get("spx")) else None
        res.append({"d": dd, "s": x["s"], "n": x.get("n"), "ret": r2(ret), "alpha": r2(ret - b) if (ret is not None and b is not None) else None})
    out["log"] = res[-10:]
    al = [x["alpha"] for x in res if x["alpha"] is not None]
    out["log_summ"] = {"n": len(al), "avg_alpha": r2(np.mean(al)) if al else None, "win": r2(np.mean([a > 0 for a in al]) * 100, 0) if al else None}
    json.dump(lg, open(WLOG, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return out


# ---------------- 실행 ----------------
# 🔁 업종 모멘텀 (🎲 #13b, 10/26) — 미국 섹터 ETF 1998~ 12개월(최근 1달 뺌) 상대강도 순위
#   probe/secetf_bt.py: 상위 2개 → 다음 5일 SPY 보다 나음 +2.0%p(1999~2013, n 1348) · +2.7%p(2013~, n 1348) · 최근 2년 +4.4%p
#                       최하위 1개 → −4.8%p · −2.5%p (n 674씩)  ·  20·60·120일 상대강도는 앞/뒤 엇갈려 ❌
ETF_SEC = {"XLK": ("semi", "soft", "hw"), "XLF": ("bank", "insure", "broker"), "XLE": ("energy",), "XLV": ("pharma", "bio", "medtech"),
           "XLY": ("retail", "auto", "leisure"), "XLP": ("food",), "XLI": ("defense", "transport", "machine", "biz"), "XLB": ("chem", "steel"), "XLU": ("util",)}
MOM_UP, MOM_DN = 0.06, -0.08   # 로그오즈 (측정값의 약 60% · ≈ +1.5%p / −2%p)


def sec_mom():
    """{앱 섹터 키: (로그오즈 기울기, 설명)} — 실패하면 빈 사전"""
    try:
        H = download(list(ETF_SEC) + ["SPY"])
        if "SPY" not in H:
            return {}
        C = pd.DataFrame({k: v["Close"] for k, v in H.items()}).dropna()
        if len(C) < 260:
            return {}
        r = C.shift(21).iloc[-1] / C.shift(250).iloc[-1] - 1
        rs = (r.drop("SPY") - r["SPY"]).sort_values(ascending=False)
        out = {}
        for i, (e, v) in enumerate(rs.items()):
            t = MOM_UP if i < 2 else MOM_DN if i == len(rs) - 1 else 0
            if t:
                lab = f"12개월 업종 {'강세' if t > 0 else '약세'} {i + 1}위/{len(rs)} ({e} {v * 100:+.0f}%p)"
                for k in ETF_SEC.get(e, ()):
                    out[k] = (t, lab)
        print("업종 모멘텀", {e: round(v * 100, 1) for e, v in rs.items()})
        return out
    except Exception as e:
        print("업종 모멘텀 실패", e)
        return {}


def main():
    t0 = time.time()
    if FAKE:
        sec = {}
        rng = np.random.default_rng(1)
        inds = [("Technology", "Semiconductors"), ("Financial Services", "Banks - Regional"), ("Energy", "Oil & Gas Integrated"), ("Healthcare", "Biotechnology"), ("Industrials", "Aerospace & Defense")]
        for mk, cfg in MK.items():
            for i in range(40):
                s = (f"T{mk}{i}" if cfg["suf"] is None else f"{1000 + i}{cfg['suf'][0]}")
                sec[s] = [*inds[i % 5], float(rng.uniform(1e9, 1e12))]
        for s in whale_pool()[0]:
            if "." not in s:
                sec[s] = ["Technology", "Semiconductors", 1e11]
        names = {s: s for s in sec}
    else:
        sec = get(OPD + "sec.json")
        names = {}
        try:
            names = {r[0]: r[1] for r in get(OPD + "idx.json", timeout=90)}
        except Exception as e:
            print("이름 실패", e)
    pool, _ = whale_pool()
    only = [x for x in os.environ.get("MKTS", "").upper().split(",") if x]
    res = {}
    whale = None
    for mk, cfg in MK.items():
        if only and mk not in only:
            continue
        try:
            cand = sorted([(s, v) for s, v in sec.items() if mine(s, cfg) and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1][2])[:N_PER]
            info = {}
            for s, v in cand:
                sb = sub_of(v[0], v[1])
                if sb:
                    info[s] = {"sec": sb[0], "icon": sb[1], "sname": sb[2], "cap": v[2]}
            if mk == "US":
                for s in pool:
                    if s not in info and s in sec and "." not in s:
                        v = sec[s]; sb = sub_of(v[0], v[1]) if isinstance(v, list) else None
                        if sb:
                            info[s] = {"sec": sb[0], "icon": sb[1], "sname": sb[2], "cap": v[2] or 0}
            H = download(list(info) + [cfg["ix"]] + (["^GSPC"] if mk != "US" else []))
            if cfg["ix"] not in H:
                print(mk, "지수 없음"); continue
            P = panel(H, cfg["ix"], info)
            mres, cur, probs = fit_market(P)
            # 📊 시장 폭 (최근 2년) — 50일선 위 비율 · 10일 상승 비율 · 쯔바이크 급반전 → 지수의 다음 날·5일 통계 (prob.py 가 씀)
            breadth = None
            try:
                g = P.groupby("date")
                bt = pd.DataFrame({"pct50": g["ma50d"].apply(lambda v: (v > 0).mean()), "adv": g["r1"].apply(lambda v: (v > 0).mean())})
                bt["adv10"] = bt["adv"].rolling(10).mean()
                ixc = H[cfg["ix"]]["Close"].reindex(bt.index).ffill()
                bt["y1"] = (ixc.shift(-1) > ixc).astype(float).where(ixc.shift(-1).notna())
                bt["y5"] = (ixc.shift(-5) > ixc).astype(float).where(ixc.shift(-5).notna())
                bt = bt.dropna(subset=["pct50", "adv10"])
                q = bt["pct50"].quantile([0.2, 0.4, 0.6, 0.8]).values
                edges = [-0.01, *q, 1.01]
                bk = pd.cut(bt["pct50"], edges, labels=False)
                cb = int(bk.iloc[-1])
                h = bt[(bk == cb)]
                thrust = bool(bt["adv10"].iloc[-10:].min() < 0.40 and bt["adv10"].iloc[-1] > 0.615)
                tbl = []
                for i in range(5):
                    hh = bt[bk == i]
                    tbl.append({"k": f"{max(0, edges[i]*100):.0f}~{min(100, edges[i+1]*100):.0f}%", "n": int(hh["y1"].notna().sum()), "p1": r2(hh["y1"].mean(), 3), "p5": r2(hh["y5"].mean(), 3), "now": i == cb})
                breadth = {"pct50": r2(bt["pct50"].iloc[-1] * 100, 1), "adv10": r2(bt["adv10"].iloc[-1] * 100, 1), "thrust": thrust,
                           "p1": r2(h["y1"].mean(), 3), "p5": r2(h["y5"].mean(), 3), "n": int(h["y1"].notna().sum()), "table": tbl,
                           "hist": [[str(i_.date()), r2(a * 100, 0)] for i_, a in bt["pct50"].iloc[-120:].items()]}
            except Exception as e:
                print(mk, "폭 실패", e)
            # 종목·섹터
            st = []
            for s in probs.index:
                c = cur.loc[s]
                st.append({"s": s, "n": names.get(s, s), "k": info[s]["sec"], "p1": r2(probs.loc[s, "y1"], 3), "p5": r2(probs.loc[s, "y5"], 3), "pr5": r2(probs.loc[s, "yr5"], 3),
                           "r1": r2(c["r1"] * 100), "r5": r2(c["r5"] * 100), "cap": info[s]["cap"]})
            mom = sec_mom() if mk == "US" else {}
            if mom:
                for x in st:
                    if x["k"] in mom and x["pr5"] is not None:
                        q = min(1 - 1e-4, max(1e-4, x["pr5"]))
                        x["pr5"] = r2(1 / (1 + math.exp(-(math.log(q / (1 - q)) + mom[x["k"]][0]))), 3)
            # 시장 방향 몫을 빼고(같은 날 모든 종목 평균과의 로그오즈 차이) 남는 「이 종목·섹터만의 기울기」 — 앱이 시장 카드 확률 위에 더함
            lg = lambda p: math.log(max(1e-4, min(1 - 1e-4, p)) / (1 - max(1e-4, min(1 - 1e-4, p))))
            for t in ("p1", "p5"):
                tw_ = sum(x["cap"] for x in st) or 1
                mlog = sum(lg(x[t]) * x["cap"] for x in st if x[t] is not None) / tw_
                for x in st:
                    x["d" + t[1:]] = r2(lg(x[t]) - mlog, 3) if x[t] is not None else None
            by = defaultdict(list)
            for x in st:
                by[x["k"]].append(x)
            secs = []
            for k, xs in by.items():
                if len(xs) < 3:
                    continue
                tw = sum(x["cap"] for x in xs) or 1
                wavg = lambda f: sum(x[f] * x["cap"] for x in xs if x[f] is not None) / tw
                xs.sort(key=lambda x: -(x["pr5"] or 0))
                i0 = info[xs[0]["s"]]
                secs.append({"k": k, "icon": i0["icon"], "name": i0["sname"], "n": len(xs), "p1": r2(wavg("p1"), 3), "p5": r2(wavg("p5"), 3), "pr5": r2(wavg("pr5"), 3),
                             "d1": r2(wavg("d1"), 3), "d5": r2(wavg("d5"), 3), "mom": (mom.get(k) or (0, None))[1],
                             "r5": r2(wavg("r5"), 2), "up5": sum(1 for x in xs if (x["p5"] or 0) > mres["base"]["y5"]),
                             "st": [{kk: x[kk] for kk in ("s", "n", "p1", "p5", "pr5", "d1", "d5", "r1", "r5")} for x in xs]})
            secs.sort(key=lambda x: -(x["d5"] or 0))
            a5 = mres["auc"].get("y5") or 0.5
            rel = "믿을 만" if a5 >= 0.56 else "약함" if a5 >= 0.52 else "동전 수준"
            res[mk] = {"name": cfg["name"], "flag": cfg["flag"], "n": len(st), "last": mres["last"], "auc": mres["auc"], "base": mres["base"], "k": mres.get("k"), "rel": rel, "rows": mres["n_rows"], "sectors": secs, "breadth": breadth}
            print(mk, "섹터", len(secs), "종목", len(st), "AUC", mres["auc"], "기저", mres["base"], f"{time.time()-t0:.0f}s")
            if mk == "US":
                try:
                    whale = whale_pick(H, cur, probs, mres, names)
                except Exception as e:
                    import traceback; traceback.print_exc(); print("고래 원픽 실패", e)
        except Exception as e:
            import traceback; traceback.print_exc(); print(mk, "실패", e)
    if not res:
        print("결과 없음"); return
    old = {}
    if only and os.path.exists(OUT):
        try:
            old = json.load(open(OUT, encoding="utf-8")).get("markets", {})
        except Exception:
            old = {}
    old.update(res)
    out = {"at": int(time.time() * 1000), "t": NOW.strftime("%m-%d %H:%M"), "markets": old,
           "note": "종목마다 2년 일봉으로 「내일 오름 · 5일 뒤 오름 · 5일 동안 시장보다 나음」을 로지스틱 회귀로 계산 · 섹터는 속한 종목의 시가총액 가중 평균 · AUC 는 마지막 60거래일(학습에서 뺀 구간) 검증, 0.5 = 동전. 검증이 약한 시장은 확률을 평소 쪽으로 눌러 보여 줌(순위는 그대로)."}
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    if whale:
        json.dump(whale, open(WOUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        p = whale["pick"]
        print("🐋 원픽", p["s"], p["tot"], p["parts"], "(옛 픽", whale["old_hero"], ")")
    print("끝", f"{time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
