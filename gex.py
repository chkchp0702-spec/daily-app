"""📐 딜러 감마(GEX) 그림자 기록 (11/20 🎲 2-C) — 돈·AI 안 씀 · 화면엔 넣지 않음(12/1 까지 새 화면 동결)
   yfinance 로 SPY·^SPX 옵션 체인(전체 만기)을 받아
     행사가별 미결제 × 감마(블랙-숄즈, 무위험 금리 = 미 13주 ^IRX, 실패하면 4%) × 100 × 현재가² × 1%
   = 「현재가 1% 움직일 때 딜러가 사고팔아야 하는 금액(달러)」.
   부호 관례(SqueezeMetrics 식): 고객이 콜을 팔고 풋을 산다고 보고 딜러는 그 반대편 → 콜 감마 +, 풋 감마 −.
     net_gex > 0 이면 딜러가 「오르면 팔고 내리면 사는」 쪽(장이 잔잔해지기 쉬움), < 0 이면 반대(흔들림 키움).
     부호 가정이 틀릴 수 있어 콜·풋 크기(call_gex·put_gex)도 따로 남김 → 나중에 어느 부호든 다시 채점 가능.
   flip = 현재가를 ±20% 옮겨 가며 다시 잰 net 이 0 을 지나는 가격(현재가에 가장 가까운 것) · flip_dist = (현재가/flip − 1)%.
   archive/x/gex_hist.json {"rows":[...]} 에 (날짜·종목·slot) 하나씩 — slot: close(미국 마감 뒤)·mid(장중).
   60거래일 쌓이면 🌊 미국 ±1%·밤사이 갭 그림자 채점(prob_lab.md 「2-C」 참고)."""
import datetime as dt, json, math, os, sys
import numpy as np
import yfinance as yf

P = "archive/x/gex_hist.json"
SYMS = ("SPY", "^SPX")


def ncdf_pdf(x):
    return np.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)


def gamma(S, K, T, iv, r):
    d1 = (np.log(S / K) + (r + 0.5 * iv * iv) * T) / (iv * np.sqrt(T))
    return ncdf_pdf(d1) / (S * iv * np.sqrt(T))


def rate():
    try:
        v = float(yf.Ticker("^IRX").history(period="10d")["Close"].dropna().iloc[-1]) / 100
        return v if 0 <= v < 0.2 else 0.04
    except Exception:
        return 0.04


def chain(sym, now):
    t = yf.Ticker(sym)
    h = t.history(period="5d", interval="1d")["Close"].dropna()
    try:
        S = float(t.fast_info["last_price"])
    except Exception:
        S = float(h.iloc[-1])
    rows = []  # (K, T, iv, oi, is_call)
    exps = list(t.options or [])
    for e in exps:
        try:
            oc = t.option_chain(e)
        except Exception:
            continue
        T = (dt.datetime.strptime(e, "%Y-%m-%d").replace(hour=21) - now).total_seconds() / (365 * 86400)
        T = max(T, 1 / (365 * 24))
        for df, c in ((oc.calls, 1), (oc.puts, 0)):
            d = df[["strike", "impliedVolatility", "openInterest"]].dropna()
            d = d[(d.openInterest > 0) & (d.impliedVolatility > 0.01) & (d.impliedVolatility < 5)]
            for k, iv, oi in d.itertuples(index=False):
                rows.append((k, T, iv, oi, c))
    return S, len(exps), np.array(rows, dtype=float) if rows else None


def gex_at(S, a, r):
    g = gamma(S, a[:, 0], a[:, 1], a[:, 2], r) * a[:, 3] * 100 * S * S * 0.01
    c = g[a[:, 4] == 1].sum(); p = g[a[:, 4] == 0].sum()
    return c, p


def one(sym, now, r):
    S, nexp, a = chain(sym, now)
    if a is None or len(a) < 1000:   # ^SPX 는 야후 미결제가 비어 있는 날이 많음(11/20 179개) → 얇으면 버림
        raise RuntimeError(f"체인 비어 있음({0 if a is None else len(a)})")
    a = a[(a[:, 0] > S * 0.5) & (a[:, 0] < S * 1.5)]
    c, p = gex_at(S, a, r)
    grid = np.linspace(S * 0.8, S * 1.2, 161)
    net = np.array([np.subtract(*gex_at(x, a, r)) for x in grid])
    flip = None
    cross = np.where(np.sign(net[:-1]) != np.sign(net[1:]))[0]
    if len(cross):
        i = cross[np.argmin(np.abs(grid[cross] - S))]
        x0, x1, y0, y1 = grid[i], grid[i + 1], net[i], net[i + 1]
        flip = float(x0 - y0 * (x1 - x0) / (y1 - y0))
    return dict(sym=sym, spot=round(S, 2), n_exp=nexp, n_opt=int(len(a)),
                call_gex=round(c / 1e9, 3), put_gex=round(p / 1e9, 3), net_gex=round((c - p) / 1e9, 3),
                flip=round(flip, 2) if flip else None,
                flip_dist=round((S / flip - 1) * 100, 2) if flip else None)


def main():
    now = dt.datetime.utcnow()
    kst = now + dt.timedelta(hours=9)
    # 미국 장 날짜: KST 06~22시 실행 = 미국 장 닫힘 → 직전 미국 장 마감 값(close, 날짜 = KST 전날)
    #               KST 23~05시 = 미국 장중(mid, 날짜 = 뉴욕 그날) · 주말 실행은 금요일 값으로 덮어씀
    if 6 <= kst.hour < 23:
        slot, day = "close", (kst - dt.timedelta(days=1)).date()
    else:
        slot, day = "mid", (now - dt.timedelta(hours=5)).date()
    while day.weekday() >= 5:
        day -= dt.timedelta(days=1)
    r = rate()
    try:
        vix = round(float(yf.Ticker("^VIX").history(period="5d")["Close"].dropna().iloc[-1]), 2)
    except Exception:
        vix = None
    hist = json.load(open(P)) if os.path.exists(P) else {"rows": []}
    errs = []
    for s in SYMS:
        try:
            row = dict(date=str(day), slot=slot, ts=kst.strftime("%Y-%m-%d %H:%M"), r=round(r, 4), vix=vix, **one(s, now, r))
            hist["rows"] = [x for x in hist["rows"] if not (x["date"] == row["date"] and x["sym"] == s and x["slot"] == slot)] + [row]
            print(row, flush=True)
        except Exception as e:
            errs.append(f"{s}: {str(e)[:120]}"); print("실패", s, e, flush=True)
    hist["rows"].sort(key=lambda x: (x["date"], x["sym"], x["slot"]))
    hist["note"] = "📐 딜러 감마 그림자(화면 없음) — net=콜−풋(10억$, 1% 움직임당) · flip_dist=(현재가/flip−1)% · gex.py"
    hist["errors"] = errs
    hist["updated"] = kst.strftime("%Y-%m-%d %H:%M KST")
    json.dump(hist, open(P, "w"), ensure_ascii=False, indent=0)
    if len(errs) == len(SYMS):
        sys.exit(1)


if __name__ == "__main__":
    main()
