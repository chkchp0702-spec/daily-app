"""
🔁 11/28 닮은 장 참고 기록 — 과창판50·창업판 (사용자 「닮은장 참고기록에 과창판이랑 창업판은 왜 없는겨?」)
서버(market-strategy-report src/analog_bt.py)는 지수 9개만 「닮았던 때 12번」을 계산함 — 과창판·창업판은 11/22 표시용으로 나중에 붙어서 빠짐.
서버 프로그램은 여기서 못 고치니, 같은 방법(설명은 analog.json 의 rules 글)을 앱 쪽에서 하루 한 번 따로 돌림 → archive/x/analog_cn.json
  · 닮았다 = 여섯 숫자(고점 전 2년 급등 · 고점 대비 · 고점 뒤 일수 · 200일선 대비 · 5년 평균선 대비 · 60일 출렁임)의 표준화 거리 · 가중 ①②⑤ 1.5
  · 찾는 곳: 지수 9개 + 나스닥100 + SOX + 과창판50 + 창업판 · 그 뒤 1년 이상 남은 날 · 같은 지수에선 1년 넘게 떨어진 때만 · 지수마다 가장 닮은 12번
  · 그날부터 2년(없으면 1년) 방식 11개 — 현금 연 2% · 바꿀 때 0.1% · 그날 종가 신호 → 다음 날
판정(주식 몫·다음 조건)은 서버 analog_pick.json 것을 그대로 붙임 — 여기서 새로 판정하지 않음 · 참고 기록 · 매수·매도 추천 아님.
시세: 야후(yfinance) — 과창판50·창업판 지금 값은 텐센트로 덧댐(실제 지수). 돈·AI 안 씀 · 하루 1번.
"""
import datetime, json, math, os, statistics, sys, urllib.request

OUT = "archive/x/analog_cn.json"
PICK = "archive/mb/market/analog_pick.json"
KST = datetime.timezone(datetime.timedelta(hours=9))
POOL = [("kospi", "^KS11", "코스피", "kr"), ("kosdaq", "^KQ11", "코스닥", "kr"), ("nikkei", "^N225", "닛케이225", "jp"),
        ("shanghai", "000001.SS", "상해종합", "cn"), ("shenzhen", "399001.SZ", "심천성분", "cn"), ("hsi", "^HSI", "항셍", "hk"),
        ("hscei", "^HSCE", "항셍 H주", "hk"), ("sp500", "^GSPC", "S&P500", "us"), ("nasdaq", "^IXIC", "나스닥", "us"),
        ("ndx", "^NDX", "나스닥100", "us"), ("sox", "^SOX", "미국 반도체", "us"),
        ("star50", "000688.SS", "과창판50", "cn"), ("chinext", "399006.SZ", "창업판", "cn")]
TARGET = ["star50", "chinext"]
TENCENT = {"star50": "sh000688", "chinext": "sz399006"}   # 야후엔 두 지수가 없음(11/28 확인) → 텐센트 실제 지수
W = [1.5, 1.5, 1, 1, 1.5, 1]
NAMES = {"lump": "지금 다 삼", "cash": "계속 현금", "dca6": "6개월 나눠 사기", "dca12": "12개월 나눠 사기", "dip": "더 빠질 때마다 3분의 1씩(−10·−20·−30%)",
         "half200": "절반 지금 + 절반은 200일선 회복 때", "half5020": "절반 지금 + 4분의 1은 50일선 회복 때 + 4분의 1은 200일선 회복 때",
         "third": "3분의 1씩(지금 · 50일선 위 · 200일선 위)", "ma10": "10개월선 위면 주식 · 아래면 현금", "a200": "200일선 위면 주식 · 아래면 현금", "a50": "50일선 위면 주식 · 아래면 현금"}


def tencent(code, first="2009-01-01"):
    """텐센트 일봉 — 한 번에 많이 달라면 501 이 와서, 2년씩 잘라 받음"""
    out, y0, y1 = {}, int(first[:4]), datetime.date.today().year
    for y in range(y0, y1 + 1, 2):
        u = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=%s,day,%d-01-01,%d-12-31,640,qfq" % (code, y, y + 1)
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://gu.qq.com/"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                j = json.loads(r.read().decode("utf-8"))
        except Exception:
            continue
        d = (j.get("data") or {}).get(code) or {}
        for x in d.get("day") or d.get("qfqday") or []:
            try:
                c = float(x[2])
                if c > 0: out[str(x[0])[:10]] = c
            except Exception:
                pass
    return sorted(out.items())


def yahoo(sym):
    import yfinance as yf
    df = yf.download(sym, period="max", interval="1d", auto_adjust=False, progress=False, threads=False)
    if df is None or not len(df): return []
    c = df["Close"]
    if hasattr(c, "columns"): c = c.iloc[:, 0]
    c = c.dropna()
    return [(i.strftime("%Y-%m-%d"), float(v)) for i, v in c.items() if v > 0]


def merge(a, b):   # b(텐센트)가 있는 날은 b 값으로 — 야후 중국 지수가 비거나 늦을 때 대비
    d = dict(a); d.update(dict(b)); return sorted(d.items())


def feats(v):
    """날마다 여섯 숫자 (자료가 모자라면 None)"""
    n = len(v); F = [None] * n
    pre = [0.0]
    for x in v: pre.append(pre[-1] + x)
    ma = lambda i, k: (pre[i + 1] - pre[i + 1 - k]) / k if i + 1 >= k else None
    lr = [0.0] + [math.log(v[i] / v[i - 1]) for i in range(1, n)]
    for i in range(1250, n):
        w = v[i - 249:i + 1]; hi = max(w); hj = i - 249 + max(j for j, x in enumerate(w) if x == hi)
        base = v[i - 504] if i >= 504 else None
        if not base: continue
        m200, m5 = ma(i, 200), ma(i, 1250)
        r60 = lr[i - 59:i + 1]; sd = statistics.pstdev(r60) * math.sqrt(252) * 100
        F[i] = [(hi / base - 1) * 100, (v[i] / hi - 1) * 100, i - hj, (v[i] / m200 - 1) * 100, (v[i] / m5 - 1) * 100, sd]
    return F


def sim(v, i0, k, end):
    """i0 그날 종가부터 end 까지 · 하루 단위 · 현금 연 2% · 바꿀 때 0.1% · 신호는 그날 종가 → 다음 날 비중"""
    pre = [0.0]
    for x in v[:end + 1]: pre.append(pre[-1] + x)
    ma = lambda i, n: (pre[i + 1] - pre[i + 1 - n]) / n if i + 1 >= n else None
    rc = 1.02 ** (1 / 252) - 1
    val, w, eq, mdd, pk = 1.0, None, [], 0.0, 1.0
    p0 = v[i0]; got = {"l50": False, "l200": False}; dips = set()
    def target(i):
        d = i - i0; px = v[i]
        if k == "lump": return 1.0
        if k == "cash": return 0.0
        if k == "dca6": return min(1.0, (d // 21 + 1) / 6)
        if k == "dca12": return min(1.0, (d // 21 + 1) / 12)
        if k == "dip":
            for t in (-10, -20, -30):
                if (px / p0 - 1) * 100 <= t: dips.add(t)
            return min(1.0, (1 + len(dips)) / 3) if d else 1 / 3
        m50, m200 = ma(i, 50), ma(i, 200)
        if m50 and px > m50: got["l50"] = True
        if m200 and px > m200: got["l200"] = True
        if k == "half200": return 0.5 + (0.5 if got["l200"] else 0)
        if k == "half5020": return 0.5 + (0.25 if got["l50"] else 0) + (0.25 if got["l200"] else 0)
        if k == "third": return 1 / 3 + (1 / 3 if got["l50"] else 0) + (1 / 3 if got["l200"] else 0)
        if k == "a200": return 1.0 if m200 and px > m200 else 0.0
        if k == "a50": return 1.0 if m50 and px > m50 else 0.0
        if k == "ma10": m = ma(i, 210); return 1.0 if m and px > m else 0.0
        return 1.0
    w = target(i0); val *= 1 - 0.001 * w
    for i in range(i0 + 1, end + 1):
        r = v[i] / v[i - 1] - 1
        val *= 1 + w * r + (1 - w) * rc
        pk = max(pk, val); mdd = min(mdd, val / pk - 1)
        nw = target(i)
        if abs(nw - w) > 1e-9: val *= 1 - 0.001 * abs(nw - w); w = nw
    return (val - 1) * 100, mdd * 100


def med(a): return round(statistics.median(a), 1) if a else None


def main():
    pick = {}
    try:
        pick = {m["key"]: m for m in json.load(open(PICK, encoding="utf-8"))["markets"]}
    except Exception as ex:
        print("analog_pick 못 읽음:", ex)
    S, bad = {}, []
    for key, sym, nm, nat in POOL:
        try:
            try: r = yahoo(sym)
            except Exception: r = []
            if key in TENCENT:
                try: r = merge(r, tencent(TENCENT[key]))
                except Exception as ex: bad.append("%s 텐센트: %s" % (nm, str(ex)[:60]))
            if len(r) < 1300: raise ValueError("일봉 %d개뿐" % len(r))
            S[key] = {"name": nm, "nat": nat, "d": [a for a, _ in r], "v": [b for _, b in r]}
        except Exception as ex:
            bad.append("%s: %s" % (nm, str(ex)[:80]))
    for key in S: S[key]["F"] = feats(S[key]["v"])
    # 표준화 (모든 지수·모든 날을 한데 모아)
    allf = [f for s in S.values() for f in s["F"] if f]
    if len(allf) < 1000: print("자료 부족", bad); sys.exit(0)
    mu = [statistics.mean(f[j] for f in allf) for j in range(6)]
    sd = [statistics.pstdev(f[j] for f in allf) or 1 for j in range(6)]
    out = []
    for tk in TARGET:
        if tk not in S or not S[tk]["F"][-1]: bad.append(tk + ": 지금 숫자 없음"); continue
        T = S[tk]; now = T["F"][-1]; z0 = [(now[j] - mu[j]) / sd[j] for j in range(6)]
        cands = []
        for key, s in S.items():
            n = len(s["v"])
            for i, f in enumerate(s["F"]):
                if not f or i + 252 >= n: continue
                if key == tk and (datetime.date.fromisoformat(T["d"][-1]) - datetime.date.fromisoformat(s["d"][i])).days < 400: continue
                dist = math.sqrt(sum(W[j] * ((f[j] - mu[j]) / sd[j] - z0[j]) ** 2 for j in range(6)) / sum(W))
                cands.append((dist, key, i))
        cands.sort()
        picked = []
        for dist, key, i in cands:
            dd = datetime.date.fromisoformat(S[key]["d"][i])
            if any(k2 == key and abs((dd - datetime.date.fromisoformat(S[k2]["d"][i2])).days) < 365 for _, k2, i2 in picked): continue
            picked.append((dist, key, i))
            if len(picked) >= 12: break
        eps, R = [], {k: [] for k in NAMES}
        for dist, key, i in picked:
            s = S[key]; v = s["v"]; n = len(v); end = min(n - 1, i + 504); e1 = min(n - 1, i + 252)
            fw = v[i:end + 1]; lo = min(fw); lj = fw.index(lo)
            ep = {"mk": key, "name": s["name"], "nat": s["nat"], "date": s["d"][i], "dist": round(dist, 2),
                  "run": round(s["F"][i][0]), "dd": round(s["F"][i][1], 1), "since": s["F"][i][2], "g200": round(s["F"][i][3], 1), "g5": round(s["F"][i][4]),
                  "more": round((lo / v[i] - 1) * 100, 1), "to_low": lj, "y1": round((v[e1] / v[i] - 1) * 100, 1),
                  "y2": round((v[end] / v[i] - 1) * 100, 1) if end >= i + 500 else None,
                  "path": [round((v[min(n - 1, i + 21 * m)] / v[i] - 1) * 100, 1) for m in range(25) if i + 21 * m < n]}
            eps.append(ep)
            for k in NAMES:
                r2, md = sim(v, i, k, end); r1, _ = sim(v, i, k, e1)
                R[k].append((r1, r2 if end >= i + 500 else None, md))
        n = len(eps)
        cash2 = [x[1] for x in R["cash"]]
        rules = []
        for k, L in R.items():
            y2 = [x[1] if x[1] is not None else x[0] for x in L]
            rules.append({"k": k, "name": NAMES[k], "n": n, "n2": sum(1 for x in L if x[1] is not None),
                          "y1_med": med([x[0] for x in L]), "y2_med": med(y2), "y2_worst": round(min(y2), 1), "mdd_worst": round(min(x[2] for x in L), 1),
                          "beat_cash": sum(1 for a, c in zip(y2, R["cash"]) if a > (c[1] if c[1] is not None else c[0])),
                          "beat_lump": sum(1 for a, c in zip(y2, R["lump"]) if a > (c[1] if c[1] is not None else c[0]))})
        rules.sort(key=lambda r: -(r["y2_med"] or -999))
        mo = [e["more"] for e in eps]
        f = T["F"][-1]
        m = {"key": tk, "name": T["name"], "nat": T["nat"], "asof": T["d"][-1],
             "now": {"run": round(f[0]), "dd": round(f[1], 1), "since": f[2], "g200": round(f[3], 1), "g5": round(f[4]), "vol": round(f[5])},
             "episodes": eps, "rules": rules,
             "fwd": {"more_med": med(mo), "more10": sum(1 for x in mo if x <= -10), "more20": sum(1 for x in mo if x <= -20),
                     "to_low_med": int(statistics.median([e["to_low"] for e in eps])) if eps else 0,
                     "y1_up": sum(1 for e in eps if e["y1"] > 0), "y2_up": sum(1 for e in eps if (e["y2"] or e["y1"]) > 0), "n": n},
             "first": T["d"][0], "app": True}
        if tk in pick: m["pick"] = pick[tk]
        out.append(m)
        print("🔁 %s 닮은 때 %d번:" % (T["name"], n), [(e["name"], e["date"][:7], e["dist"]) for e in eps][:12])
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"at": datetime.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "src": "야후 일봉(+텐센트 실제 지수) · 앱 계산(analog_cn.py) · 서버 방식 그대로", "markets": out, "bad": bad},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("끝 · 못 받음:", bad)


if __name__ == "__main__":
    main()
