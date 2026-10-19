"""🎬 ELS 과거 재생 — 10/19 A10/19-1 (사용자 「다 적용해」)
   지금 청약 중인 ELS·ELB(미래에셋 products.json els + 전체 증권사 els_all.json)의 조건(배리어 줄·평가 주기·KI·기초자산)을
   기초자산 일봉(야후) 위에서 「2006년부터 매 거래일 가입한 셈」으로 돌려, 몇 번째 평가에서 끝났는지·손실로 끝난 비율을 셈.
   → archive/x/els_replay.json  {stats: {조건키: …}, by_id: {isin 또는 els_all id: 조건키}}
   원칙: 숫자는 지어내지 않음 — 기초자산 일봉이 모두 있는 가입일만, 만기까지 결과가 난 가입일만(n 표시). 월지급·리자드 등 변형은 기본 스텝다운 기준.
   같은 조건은 한 번만 계산(조건키). 사용 안 하는 기초자산(개별주 이름 사전에 없음)은 띠 없음."""
import datetime
import json
import os
import re
import sys

import numpy as np

X = os.path.join("archive", "x")
OUT = os.path.join(X, "els_replay.json")
FROM = "2006-01-01"

# 이름 → (조건키 이름, 야후 코드)  — products.js uaKey 의 UAN 과 같은 이름
UAN = [(r"코스피\s*200|KOSPI\s*200", "KOSPI200", "^KS200"), (r"S&P\s*500", "S&P500", "^GSPC"), (r"유로\s*스탁스\s*50|EURO\s*STOXX\s*50", "EUROSTOXX50", "^STOXX50E"),
       (r"니(케|께)이\s*225|NIKKEI\s*225", "NIKKEI225", "^N225"), (r"항셍\s*중국(\s*기업)?|HSCEI|H-?지수", "HSCEI", "^HSCE"), (r"항셍\s*(지수)?$|HSI$", "HSI", "^HSI"),
       (r"나스닥\s*100|NASDAQ\s*100", "NASDAQ100", "^NDX"), (r"삼성전자", "삼성전자", "005930.KS"), (r"SK\s*하이닉스", "SK하이닉스", "000660.KS"),
       (r"테슬라|Tesla", "테슬라", "TSLA"), (r"마이크론|Micron", "마이크론", "MU"), (r"팔란티어|Palantir", "팔란티어", "PLTR"), (r"엔비디아|NVIDIA", "엔비디아", "NVDA"),
       (r"애플|Apple", "애플", "AAPL"), (r"아마존|Amazon", "아마존", "AMZN"), (r"마이크로소프트|Microsoft", "마이크로소프트", "MSFT"), (r"알파벳|Alphabet|구글", "알파벳", "GOOGL"),
       (r"메타\s*플랫폼|Meta\s*Platforms", "메타", "META"), (r"브로드컴|Broadcom", "브로드컴", "AVGO"), (r"어드밴스드\s*마이크로|Advanced\s*Micro|\bAMD\b", "AMD", "AMD"),
       (r"TSMC|Taiwan\s*Semiconductor", "TSMC", "TSM"), (r"코인베이스|Coinbase", "코인베이스", "COIN"), (r"넷플릭스|Netflix", "넷플릭스", "NFLX"), (r"일라이\s*릴리|Eli\s*Lilly", "일라이릴리", "LLY"),
       (r"현대차|현대자동차", "현대차", "005380.KS"), (r"기아", "기아", "000270.KS"), (r"NAVER|네이버", "네이버", "035420.KS"), (r"카카오(?!뱅크)", "카카오", "035720.KS"),
       (r"LG\s*에너지솔루션", "LG에너지솔루션", "373220.KS"), (r"삼성SDI", "삼성SDI", "006400.KS"), (r"셀트리온", "셀트리온", "068270.KS"), (r"POSCO\s*홀딩스|포스코홀딩스", "포스코홀딩스", "005490.KS"),
       (r"한국전력", "한국전력", "015760.KS"), (r"KB\s*금융", "KB금융", "105560.KS"), (r"신한지주", "신한지주", "055550.KS"), (r"삼성바이오로직스", "삼성바이오로직스", "207940.KS"),
       (r"LG전자", "LG전자", "066570.KS"), (r"현대모비스", "현대모비스", "012330.KS"), (r"삼성전기", "삼성전기", "009150.KS"), (r"인텔|Intel", "인텔", "INTC"), (r"ARM\s*Holdings|\bARM\b", "ARM", "ARM")]
TICK = {n: t for _, n, t in UAN}
ALT = {"KOSPI200": ["069500.KS"], "HSCEI": ["2828.HK"], "EUROSTOXX50": ["FEZ"], "NIKKEI225": ["1321.T"], "S&P500": ["SPY"], "NASDAQ100": ["QQQ"]}   # 10/19: ^KS200 이 야후에서 빈 값 → KODEX 200 (같은 지수 · 분배금 빠진 종가라 거의 같음)


def ua_keys(s):
    """기초자산 글 → 이름 목록. 모르는 이름이 하나라도 있으면 None(재생 안 함)."""
    t = str(s or "")
    if not t.strip() or len(t) > 200:
        return None
    out = []
    for pat, name, _ in UAN:
        if re.search(pat, t, re.I):
            out.append(name)
            t = re.sub(pat, " ", t, flags=re.I)
    rest = re.sub(r"\([^)]*\)|\[[^\]]*\]|지수|보통주|우선주|Index|Inc\.?|Co\.|Ltd\.?|Corp(oration)?\.?|Technolog(y|ies)|Platforms|Holdings|Class\s*[A-Z]?|테크놀로지|테크놀러지|테크|[,/·&\s]|및|의|\d", "", t, flags=re.I)
    if rest.strip() or not out:
        return None
    return sorted(set(out))


def add_months(d, m):
    y, mo = d.year + (d.month - 1 + m) // 12, (d.month - 1 + m) % 12 + 1
    last = [31, 29 if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1]
    return datetime.date(y, mo, min(d.day, last))


def months_between(a, b):
    return (b.year - a.year) * 12 + (b.month - a.month) + (1 if b.day - a.day >= 15 else -1 if a.day - b.day >= 15 else 0)


def cond(x, src):
    """상품 한 줄 → (조건키, 기초자산 이름들, bars, cyc, ki, pp) 또는 None"""
    ks = ua_keys(x.get("ua"))
    if not ks:
        return None
    if src == "mirae":
        bars = [float(b) for b in re.findall(r"\d+(?:\.\d+)?", str(x.get("desc") or "").split(",")[0].split("(")[0]) if 1 < float(b) <= 150]
        cyc = int(re.sub(r"\D", "", str(x.get("cyc") or "")) or 0)
        mt = re.match(r"(\d+)년(?:(\d+)개월)?", str(x.get("mat") or ""))
        total = int(mt.group(1)) * 12 + int(mt.group(2) or 0) if mt else 0
        pp = (x.get("pp") or 0) >= 100
    else:
        bars = [float(b) for b in (x.get("bars") or []) if 1 < float(b) <= 150]
        cyc = x.get("cyc") or 0
        try:
            total = months_between(datetime.date.fromisoformat(x["s"]), datetime.date.fromisoformat(x["mat"]))
        except Exception:
            total = 0
        pp = bool(x.get("nolos")) or x.get("kind") == "ELB"
    if not bars or len(bars) > 36:
        return None
    if not cyc and total:
        cyc = round(total / len(bars))
    if cyc not in (1, 2, 3, 4, 6, 12):
        return None
    ki = x.get("ki")
    ki = float(ki) if ki not in (None, "", 0, "0") and 1 < float(ki) < 100 else None
    key = "+".join(ks) + "|" + "-".join(str(int(b)) if float(b).is_integer() else str(b) for b in bars) + "|" + str(cyc) + "|" + (str(int(ki)) if ki else "none") + ("|pp" if pp else "")
    return key, ks, bars, cyc, ki, pp


def load_prices(names):
    import yfinance as yf
    P = {}
    for n in names:
        c = None
        for t in [TICK[n]] + ALT.get(n, []):            # 야후 지수 코드가 비면 같은 지수를 따라가는 ETF 로
            try:
                h = yf.download(t, start=FROM, interval="1d", progress=False, auto_adjust=False, threads=False)
                c = h["Close"].dropna()
                if hasattr(c, "columns"):
                    c = c.iloc[:, 0]
            except Exception as e:
                print("✗", n, t, e); c = None
            if c is not None and len(c) >= 500:
                break
        try:
            if c is None:
                continue
            if len(c) < 500:
                print("✗ 짧음", n, len(c)); continue
            P[n] = {d.strftime("%Y-%m-%d"): float(v) for d, v in c.items() if float(v) > 0}
            print("✓", n, len(P[n]), min(P[n]), max(P[n]))
        except Exception as e:
            print("✗", n, e)
    return P


def replay(P, ks, bars, cyc, ki, pp):
    """조건 하나를 공통 거래일 위에서 재생. 반환: 통계 dict 또는 None"""
    common = sorted(set.intersection(*[set(P[k]) for k in ks]))
    if len(common) < 500:
        return None
    dates = np.array(common, dtype="datetime64[D]")
    C = np.array([[P[k][d] for d in common] for k in ks])          # (m, T)
    T, n = len(common), len(bars)
    last = datetime.date.fromisoformat(common[-1])
    S = [s for s in range(T) if add_months(datetime.date.fromisoformat(common[s]), cyc * n) <= last]
    if len(S) < 200:
        return None
    S = np.array(S)
    base = C[:, S]                                                # (m, S)
    pos = []                                                      # 평가일 위치 (n, S)
    for k in range(1, n + 1):
        ev = np.array([add_months(datetime.date.fromisoformat(common[s]), cyc * k).isoformat() for s in S], dtype="datetime64[D]")
        p = np.searchsorted(dates, ev)                            # 그 날 또는 다음 거래일
        pos.append(np.minimum(p, T - 1))
    pos = np.array(pos)
    ratio = np.array([C[:, pos[k]] / base for k in range(n)])      # (n, m, S)
    worst = ratio.min(axis=1)                                     # (n, S)
    done = np.full(len(S), -1)                                    # 몇 번째 평가에서 끝났나 (0-based), -1 = 만기 미달
    for k in range(n):
        ok = (done < 0) & (worst[k] >= bars[k] / 100.0)
        done[ok] = k
    # KI: 만기까지 간 가입일만 경로 최저(worst-of 일별) 계산
    ki_touch = np.zeros(len(S), dtype=bool)
    if ki is not None:
        for j in np.where(done < 0)[0]:
            s, e = S[j], pos[n - 1][j]
            seg = C[:, s:e + 1] / base[:, j][:, None]
            ki_touch[j] = seg.min() < ki / 100.0
    fail = done < 0
    if pp:
        loss_mask = np.zeros(len(S), dtype=bool)
    elif ki is not None:
        loss_mask = fail & ki_touch                               # KI 안 닿았으면 만기 원금+이자
    else:
        loss_mask = fail
    loss_ret = (worst[n - 1][loss_mask] - 1) * 100
    cum = [round(float(((done >= 0) & (done <= k)).sum()) / len(S) * 100, 1) for k in range(n)]   # k번째 평가까지 끝난 비율(누적)
    out = {"n": int(len(S)), "from": common[int(S[0])][:7], "to": common[int(S[-1])][:7], "k": cum, "cyc": cyc,
           "mat_ok": round(float(((fail) & ~loss_mask).sum()) / len(S) * 100, 1),
           "loss": round(float(loss_mask.sum()) / len(S) * 100, 1),
           "loss_avg": round(float(loss_ret.mean()), 1) if len(loss_ret) else None,
           "loss_worst": round(float(loss_ret.min()), 1) if len(loss_ret) else None}
    if ki is not None:
        out["ki_touch"] = round(float(ki_touch.sum()) / len(S) * 100, 1)
    yrs = {}
    for j in np.where(loss_mask)[0]:
        y = common[int(S[j])][:4]; yrs[y] = yrs.get(y, 0) + 1
    out["loss_yrs"] = [y for y, _ in sorted(yrs.items(), key=lambda t: -t[1])[:4]]
    if len(ks) > 1:                                               # 1차 평가에서 못 끝난 가입일 중 「가장 못한 기초자산」 빈도
        f1 = np.where(worst[0] < bars[0] / 100.0)[0]
        if len(f1):
            am = ratio[0][:, f1].argmin(axis=0)
            out["worst"] = {ks[i]: round(float((am == i).sum()) / len(f1) * 100) for i in range(len(ks)) if (am == i).sum()}
    return out


def main():
    items = []
    try:
        pj = json.load(open(os.path.join(X, "products.json"), encoding="utf-8"))
        for x in (pj.get("els") or []) + (pj.get("els_done") or []):
            if x.get("isin"):
                items.append((x["isin"], x, "mirae"))
    except Exception as e:
        print("products.json", e)
    try:
        ej = json.load(open(os.path.join(X, "els_all.json"), encoding="utf-8"))
        today = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=9)
        for x in ej.get("items") or []:
            if x.get("id") and (x.get("e") or "9999") >= (today - datetime.timedelta(days=45)).strftime("%Y-%m-%d"):
                items.append((x["id"], x, "dart"))
    except Exception as e:
        print("els_all.json", e)
    conds, by_id = {}, {}
    for i, x, src in items:
        c = cond(x, src)
        if c:
            conds[c[0]] = c; by_id[i] = c[0]
    names = sorted({k for c in conds.values() for k in c[1]})
    print("상품", len(items), "재생 조건", len(conds), "기초자산", names)
    P = load_prices(names) if "--fake" not in sys.argv else fake_prices(names)
    old = {}
    try:
        old = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        pass
    stats = {}
    for key, (k_, ks, bars, cyc, ki, pp) in conds.items():
        if not all(k in P for k in ks):
            if key in (old.get("stats") or {}):
                stats[key] = old["stats"][key]
            continue
        try:
            r = replay(P, ks, bars, cyc, ki, pp)
        except Exception as e:
            print("✗ 재생", key, e); r = None
        if r:
            stats[key] = r
    R = {"updated": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=9)).strftime("%Y-%m-%d %H:%M"), "from": FROM,
         "idx": {n: [min(P[n]), max(P[n])] for n in P}, "stats": stats, "by_id": {i: k for i, k in by_id.items() if k in stats}}
    if not stats and old.get("stats"):
        print("재생 결과 없음 — 옛 파일 유지"); return
    json.dump(R, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("✓ els_replay", len(stats), "조건 ·", len(R["by_id"]), "상품")


def fake_prices(names):
    """이 환경(야후 막힘)에서 화면 확인용 가짜 값 — 실제 배포에선 안 씀"""
    rng = np.random.default_rng(1)
    P = {}
    d0 = datetime.date(2006, 1, 2)
    days = [d0 + datetime.timedelta(days=i) for i in range(int(365.25 * 20.8))]
    days = [d for d in days if d.weekday() < 5]
    for n in names:
        v = 100 * np.exp(np.cumsum(rng.normal(0.0002, 0.013, len(days))))
        P[n] = {d.isoformat(): float(x) for d, x in zip(days, v)}
    return P


if __name__ == "__main__":
    main()
