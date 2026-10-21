"""💼 포트 설계기 · 🧲 닮은 날 자료 — 10/21 A10/21-1·2 (사용자 「다 좋다 다 진행해」)
   ① 포트 설계기: SPY·QQQ·GLD·BIL 배당 포함 수정종가(야후 auto_adjust) 2006~ → archive/x/port_px/<코드>.json (7일마다 · git 이 무거워지지 않게)
      앱이 휴대폰에서 💼 기본 규칙(200일선 국면 · 20일 변동성 맞춤 · 월 맞춤 · 회전 0.1%)을 그대로 돌림.
      check.json = 같은 자료·같은 규칙을 파이썬으로 돌린 값(앱 숫자 맞춤 검사용 · 실험실 market/lab/k1020_relief.json 「now」와 같은 규칙).
   ② 닮은 날: 코스피 지수(^KS11) 2000~ 종가 → archive/x/port_px/KOSPI.json (마지막 날이 바뀔 때만 새로 씀)
   파일 모양은 els_px 와 같음: {n, d0, dd:[날짜 간격(일)], c:[종가]}
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
NAMES = {"SPY": "S&P500 (SPY)", "QQQ": "나스닥100 (QQQ)", "GLD": "금 (GLD)", "BIL": "현금·단기채 (BIL)", "KOSPI": "코스피"}
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


def main():
    os.makedirs(D, exist_ok=True)
    idx = read_idx(); idx.setdefault("assets", {}); ch = False
    for k in ETF:
        if not stale(idx, k, DAYS):
            continue
        P = dl(k, "2006-01-01", True)
        if P:
            idx["assets"][k] = write(k, P, 6); ch = True; print("✓", k, len(P))
    # 코스피: 마지막 날이 바뀌었을 때만
    P = dl("^KS11", "2000-01-01", False)
    if P:
        last = max(P); old = (idx["assets"].get("KOSPI") or {})
        if old.get("to") != last or old.get("n") != len(P) or "--force" in sys.argv:
            idx["assets"]["KOSPI"] = write("KOSPI", P, 7); ch = True; print("✓ KOSPI", len(P), last)
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
    else:
        main()
