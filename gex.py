"""📐 딜러 감마(GEX) 그림자 기록 (11/20 🎲 2-C) — 돈·AI 안 씀 · 화면엔 넣지 않음(12/1 까지 새 화면 동결)
   yfinance 로 SPY·^SPX 옵션 체인(전체 만기)을 받아
     행사가별 미결제 × 감마(블랙-숄즈, 무위험 금리 = 미 13주 ^IRX, 실패하면 4%) × 100 × 현재가² × 1%
   = 「현재가 1% 움직일 때 딜러가 사고팔아야 하는 금액(달러)」.
   부호 관례(SqueezeMetrics 식): 고객이 콜을 팔고 풋을 산다고 보고 딜러는 그 반대편 → 콜 감마 +, 풋 감마 −.
     net_gex > 0 이면 딜러가 「오르면 팔고 내리면 사는」 쪽(장이 잔잔해지기 쉬움), < 0 이면 반대(흔들림 키움).
     부호 가정이 틀릴 수 있어 콜·풋 크기(call_gex·put_gex)도 따로 남김 → 나중에 어느 부호든 다시 채점 가능.
   flip = 현재가를 ±20% 옮겨 가며 다시 잰 net 이 0 을 지나는 가격(현재가에 가장 가까운 것) · flip_dist = (현재가/flip − 1)%.
   archive/x/gex_hist.json {"rows":[...]} 에 (날짜·종목·slot) 하나씩 — slot: close(미국 마감 뒤)·mid(장중).
   60거래일 쌓이면 🌊 미국 ±1%·밤사이 갭 그림자 채점(prob_lab.md 「2-C」 참고).
   11/24 (사용자 「옵션 포지션 변화가 시황 두뇌에 반영되고 있나 → 진행해」): 채점은 그대로 그림자, **해설 재료로는 지금부터 씀**.
     · slot 을 실제 실행 시각으로: am(뉴욕 09:30~12:30)·pm(12:30~16:00)·close(마감 뒤) — 예약이 몇 시간씩 밀려 mid 가 한 번도 안 잡혔음
     · 풋 거래 비중(풋 거래량 ÷ 풋+콜 거래량): 전체 만기 put_share · 가장 가까운 만기 put_share0(장중엔 당일 만기)
     · archive/x/gex.json = 두뇌·아침 시황이 읽는 요약 한 장(line·read·오전→오후 풋 비중). 방향 신호가 아니라 「왜 크게 움직였나」 설명용."""
import datetime as dt, json, math, os, sys
import numpy as np
import yfinance as yf

P = "archive/x/gex_hist.json"
PS = "archive/x/gex.json"
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
    vol = {}   # 만기 → [콜 거래량, 풋 거래량]
    exps = list(t.options or [])
    for e in exps:
        try:
            oc = t.option_chain(e)
        except Exception:
            continue
        T = (dt.datetime.strptime(e, "%Y-%m-%d").replace(hour=21) - now).total_seconds() / (365 * 86400)
        T = max(T, 1 / (365 * 24))
        for df, c in ((oc.calls, 1), (oc.puts, 0)):
            try:
                v = float(df["volume"].fillna(0).sum())
                vol.setdefault(e, [0.0, 0.0])[0 if c else 1] += v
            except Exception:
                pass
            d = df[["strike", "impliedVolatility", "openInterest"]].dropna()
            d = d[(d.openInterest > 0) & (d.impliedVolatility > 0.01) & (d.impliedVolatility < 5)]
            for k, iv, oi in d.itertuples(index=False):
                rows.append((k, T, iv, oi, c))
    return S, len(exps), (np.array(rows, dtype=float) if rows else None), vol


def put_share(vol):
    """풋 거래 비중 % — 전체 만기 · 가장 가까운 만기(장중엔 당일 만기). 거래량이 너무 적으면 None."""
    out = {}
    try:
        c = sum(v[0] for v in vol.values()); p = sum(v[1] for v in vol.values())
        if c + p >= 10000:
            out["put_share"] = round(100 * p / (c + p), 1); out["opt_vol"] = int(c + p)
        if vol:
            e0 = min(vol)
            c0, p0 = vol[e0]
            if c0 + p0 >= 5000:
                out["put_share0"] = round(100 * p0 / (c0 + p0), 1); out["exp0"] = e0; out["opt_vol0"] = int(c0 + p0)
    except Exception:
        pass
    return out


def gex_at(S, a, r):
    g = gamma(S, a[:, 0], a[:, 1], a[:, 2], r) * a[:, 3] * 100 * S * S * 0.01
    c = g[a[:, 4] == 1].sum(); p = g[a[:, 4] == 0].sum()
    return c, p


def one(sym, now, r):
    S, nexp, a, vol = chain(sym, now)
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
                flip_dist=round((S / flip - 1) * 100, 2) if flip else None, **put_share(vol))


def slot_of(now):
    """실제 실행 시각(UTC) → (slot, 미국 장 날짜). 뉴욕 = UTC−5 로 봄(서머타임 땐 1시간 어긋남 — 경계만 조금 흐려짐)."""
    ny = now - dt.timedelta(hours=5)
    m = ny.hour * 60 + ny.minute
    day = ny.date()
    if ny.weekday() < 5 and 9 * 60 + 30 <= m < 16 * 60:
        return ("am" if m < 12 * 60 + 30 else "pm"), day
    if m < 9 * 60 + 30:
        day -= dt.timedelta(days=1)
    while day.weekday() >= 5:
        day -= dt.timedelta(days=1)
    return "close", day


def _eok(x):
    """10억$ → 「95억$」「1,230억$」"""
    return f"{abs(x) * 10:,.0f}억$"


def summary(rows, spx=None, kst=""):
    """두뇌·아침 시황이 읽는 한 장 — SPY 만 씀(^SPX 는 야후 미결제가 자주 비어 부호가 엉뚱하게 나옴)."""
    r = sorted([x for x in rows if x.get("sym") == "SPY"], key=lambda x: x.get("ts", ""))
    if not r:
        return None
    cur = r[-1]
    net, flip, S = cur["net_gex"], cur.get("flip"), cur["spot"]
    neg = net < 0
    out = dict(updated=kst, date=cur["date"], slot=cur["slot"], ts=cur.get("ts"), sym="SPY", spot=S,
               net_gex=net, sign="neg" if neg else "pos", call_gex=cur["call_gex"], put_gex=cur["put_gex"],
               flip=flip, flip_dist=cur.get("flip_dist"))
    k = None
    if spx and S:
        k = spx / S
        out["spx"] = round(spx, 1)
    head = f"📐 딜러 감마 {'음(−)' if neg else '양(+)'} {_eok(net)}/1%(SPY 어림)"
    parts = [head]
    if flip:
        up = (flip / S - 1) * 100          # 전환선까지 가야 하는 거리(+ = 위)
        out["flip_up"] = round(up, 1)
        fs = f"SPY {flip:,.0f}"
        if k:
            out["flip_spx"] = int(round(flip * k, -1)); fs += f"(S&P500 약 {out['flip_spx']:,})"
        parts.append(f"전환선 {fs} — 지금보다 {abs(up):.1f}% {'위' if up > 0 else '아래'}")
    parts.append("음(−) 구간: 딜러가 오르면 따라 사고 내리면 따라 팔아 오를 때도 내릴 때도 폭이 커지기 쉬움" if neg
                 else "양(+) 구간: 딜러가 오르면 팔고 내리면 사서 움직임이 잦아들기 쉬움")
    # 직전 마감 값과 비교
    pc = [x for x in r if x["slot"] == "close" and x["date"] < cur["date"]]
    if pc:
        p = pc[-1]
        out["prev"] = dict(date=p["date"], net_gex=p["net_gex"], flip_dist=p.get("flip_dist"), sign="neg" if p["net_gex"] < 0 else "pos")
        if (p["net_gex"] < 0) != neg:
            parts.append(f"⚠️ {p['date'][5:].replace('-', '/')} {'음(−)' if p['net_gex'] < 0 else '양(+)'} → {'음(−)' if neg else '양(+)'}으로 바뀜")
        elif abs(p["net_gex"]) > 0:
            ch = abs(net) / abs(p["net_gex"]) - 1
            if abs(ch) >= 0.25:
                parts.append(f"{p['date'][5:].replace('-', '/')}보다 {'음(−)' if neg else '양(+)'} 크기 {abs(ch) * 100:.0f}% {'커짐' if ch > 0 else '줄어듦'}")
    # 같은 날 오전 → 오후 풋 거래 비중
    day = {x["slot"]: x for x in r if x["date"] == cur["date"]}
    ps = {s: dict(all=day[s].get("put_share"), near=day[s].get("put_share0"), exp=day[s].get("exp0"), ts=day[s].get("ts"))
          for s in ("am", "pm", "close") if s in day and (day[s].get("put_share") is not None or day[s].get("put_share0") is not None)}
    if ps:
        out["put_share"] = ps
    a, b = ps.get("am"), ps.get("pm")
    if a and b:
        key = "near" if (a.get("near") is not None and b.get("near") is not None) else "all"
        if a.get(key) is not None and b.get(key) is not None:
            d = b[key] - a[key]
            out["put_shift"] = round(d, 1)
            lab = "당일 만기 " if key == "near" else ""
            if abs(d) >= 8:
                parts.append(f"SPY {lab}풋 거래 비중 오전 {a[key]:.0f}% → 오후 {b[key]:.0f}%({'오후에 하락 방어·차익 실현 쪽이 늘어남' if d > 0 else '오후에 상승 쪽 거래가 늘어남'})")
    elif ps:
        s0 = "pm" if "pm" in ps else ("am" if "am" in ps else "close")
        v = ps[s0].get("all")
        if v is not None:
            parts.append(f"SPY 풋 거래 비중 {v:.0f}%({ {'am': '오전', 'pm': '오후', 'close': '마감'}[s0] })")
    out["line"] = " · ".join(parts)
    out["read"] = [
        "방향 신호가 아님 — 「왜 이렇게 크게 움직였나·오늘 얼마나 흔들릴 수 있나」를 설명하는 재료(11/20 총점검: 수급·옵션은 방향 못 맞힘 · 흔들림엔 쓸모)",
        "음(−) 감마 = 급락도 급반등도 커짐. 큰 반등이 나왔다고 추세가 돌아섰다고 읽지 않음 — 전환선 위로 올라서야 흔들림이 잦아드는 구간",
        "오전보다 오후 풋 비중이 크게 늘면 = 오른 뒤 하락 방어·차익 실현이 붙었다는 뜻(상승이 주춤해지기 쉬움)",
        "야후 SPY 옵션 체인으로 직접 어림한 값 — 유료 자료(전환선·금액)와 숫자가 다름. 부호·방향·며칠 사이 변화만 믿고 금액은 어림으로 말함",
        "채점은 아직 그림자(60거래일 뒤 🌊 미국 ±1%·밤사이 갭) — 확률·비중·규칙은 이 값으로 바꾸지 않음",
    ]
    return out


def main():
    now = dt.datetime.utcnow()
    kst = now + dt.timedelta(hours=9)
    # 실제 실행 시각으로 slot 을 정함(11/24) — am·pm = 미국 장중, close = 마감 뒤(다음 개장 전까지 · 주말 실행은 금요일 값으로 덮어씀)
    slot, day = slot_of(now)
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
    try:   # 두뇌·아침 시황용 요약 한 장 — 실패해도 기록은 남김
        try:
            spx = float(yf.Ticker("^GSPC").fast_info["last_price"])
        except Exception:
            spx = None
        sm = summary(hist["rows"], spx, kst.strftime("%Y-%m-%d %H:%M KST"))
        if sm:
            json.dump(sm, open(PS, "w"), ensure_ascii=False, indent=1)
            print(sm["line"], flush=True)
    except Exception as e:
        print("요약 실패", e, flush=True)
    if len(errs) == len(SYMS):
        sys.exit(1)


if __name__ == "__main__":
    main()
