"""
📝 제안서 — 상품별 「시장 분석」·「모의투자 계산서」 재료 (10/28 사용자)
  「브라질 국채에 굳이 (전체) 시장상황을 넣어야 하나 · 각각 좀 전문되게 — 브라질국채면 브라질 현재 시장상황·금리 추이·헤알화 전망이
   풍성하고 모의투자계산서도 있어야지 · 나머지 것들도 그에 맞게 다 업그레이드」
  proposal.py 가 만든 폼마다 붙임:
    form["mkt"] = {title, kpis[{label,value,sub,tone}], charts[{title,unit,labels,vals,color,ma?,ref?,kind?}], view[~임], outlook{title,cols,rows,src}}
    form["sim"] = 계산서 재료 (금액은 앱에서 넣으므로 「1원당」 비율과 시나리오만) — kind: bond · els · equity
  바깥 자료(브라질 중앙은행 Selic·물가·전망 설문 Focus, FRED 한국 금리)는 GitHub Actions 에서만 받아지고, 못 받으면 지난번 값(proposal.json 의 macro)을 씀
"""
import datetime as dt
import json
import math
import os
import urllib.parse
import urllib.request

PX = os.path.join("archive", "x", "port_px")
EPX = os.path.join("archive", "x", "els_px")


# ───────── 공통 ─────────
def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def series(path):
    """{n, d0, dd, c} → [(date, close)]"""
    j = jl(path)
    if not j or not j.get("c"):
        return []
    d = dt.date.fromisoformat(j["d0"])
    out = []
    for gap, c in zip(j["dd"], j["c"]):
        d = d + dt.timedelta(days=gap)
        if c is not None:
            out.append((d, float(c)))
    return out


def r(v, n=2):
    return None if v is None else round(float(v), n)


def sg(v, d=1, unit="%"):
    if v is None:
        return "–"
    return (f"{v:+.{d}f}" + unit).replace("-", "−")


def last_n(s, n=260):
    return s[-n:] if len(s) > n else s


def ma(vals, n):
    out, acc = [], 0.0
    for i, v in enumerate(vals):
        acc += v
        if i >= n:
            acc -= vals[i - n]
        out.append(acc / n if i >= n - 1 else None)
    return out


def chg(s, days):
    """days 거래일 전 대비 %"""
    if len(s) <= days:
        return None
    return (s[-1][1] / s[-1 - days][1] - 1) * 100


def chart_of(s, title, unit, color, n=260, with_ma=None, fmt_d=True):
    vals = [c for _, c in s]
    m = ma(vals, with_ma) if with_ma else None
    s2 = last_n(s, n)[::2] if n >= 200 else last_n(s, n)
    out = {"title": title, "unit": unit, "color": color, "labels": [d.isoformat() for d, _ in s2], "vals": [r(c, 4) for _, c in s2]}
    if m:
        mm = m[-len(last_n(s, n)):]
        out["ma"] = [r(x, 4) if x is not None else None for x in (mm[::2] if n >= 200 else mm)]
        out["mal"] = f"{with_ma}일 평균선"
    return out


def pct_rank(vals, v):
    if not vals:
        return None
    return round(sum(1 for x in vals if x <= v) / len(vals) * 100)


# ───────── 바깥 자료 (Actions 에서만) ─────────
def get(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (CH proposal)", "Accept": "application/json,text/csv,*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", "replace")


def sgs(code, years=3):
    """브라질 중앙은행 시계열 (SGS) → [(date, value)]"""
    a = (dt.date.today() - dt.timedelta(days=365 * years)).strftime("%d/%m/%Y")
    b = dt.date.today().strftime("%d/%m/%Y")
    j = json.loads(get(f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados?formato=json&dataInicial={a}&dataFinal={b}"))
    out = []
    for x in j:
        try:
            d = dt.datetime.strptime(x["data"], "%d/%m/%Y").date()
            out.append([d.isoformat(), float(str(x["valor"]).replace(",", "."))])
        except Exception:
            pass
    return out


def focus(indicator):
    """브라질 중앙은행 Focus 설문 (시장 전망 중간값) — 가장 최근 발표일의 연도별 중간값"""
    q = {"$top": "40", "$orderby": "Data desc", "$format": "json", "$select": "Indicador,Data,DataReferencia,Mediana,baseCalculo",
         "$filter": f"Indicador eq '{indicator}'"}
    url = "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?" + urllib.parse.urlencode(q, quote_via=urllib.parse.quote)
    v = json.loads(get(url)).get("value") or []
    v = [x for x in v if str(x.get("baseCalculo", 0)) in ("0", "None")] or v
    if not v:
        return None
    d0 = max(x["Data"] for x in v)
    out = {}
    for x in v:
        if x["Data"] == d0 and x.get("Mediana") is not None:
            out[str(x["DataReferencia"])] = float(x["Mediana"])
    return {"date": d0, "y": out}


def fred(sid):
    t = get(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}")
    out = []
    for line in t.strip().splitlines()[1:]:
        p = line.split(",")
        try:
            out.append([p[0], float(p[1])])
        except Exception:
            pass
    return out


def macro(old):
    """못 받으면 지난번 값 그대로 (old = 지난 proposal.json 의 macro)"""
    M = dict(old or {})
    jobs = {
        "selic": lambda: sgs(432, 3),          # Selic 목표금리 (% 연)
        "ipca12": lambda: sgs(13522, 3),       # IPCA 12개월 물가 (%)
        "f_selic": lambda: focus("Selic"),
        "f_fx": lambda: focus("Câmbio"),
        "f_ipca": lambda: focus("IPCA"),
        "kr10": lambda: fred("IRLTLT01KRM156N")[-120:],   # 한국 국채 10년 (월)
        "kr3m": lambda: fred("IR3TIB01KRM156N")[-120:],   # 한국 3개월 금리 (월, 기준금리 대용)
        "us_ff": lambda: fred("FEDFUNDS")[-60:],          # 미국 기준금리 (월)
        "us2": lambda: fred("DGS2")[-400:],               # 미국 2년 (일)
    }
    for k, f in jobs.items():
        try:
            v = f()
            if v:
                M[k] = v
                M.setdefault("_at", {})[k] = dt.date.today().isoformat()
        except Exception as e:
            print("바깥 자료 못 받음", k, str(e)[:80])
    return M


def last(xs):
    xs = [x for x in (xs or []) if x and x[1] is not None]
    return xs[-1] if xs else None


# ───────── 과거로 돌려 보기 (주식·연금 폼) ─────────
ASSET = {"spx": "SPY", "ndx": "QQQ", "k200": "KOSPI", "gold": "GLD", "cd": "BIL", "corp": "BIL"}


def backtest(alloc):
    w = {}
    for a in alloc:
        k = a["k"]
        sym = ASSET.get(k) or ("KOSPI" if k.startswith("sec") else None)
        if sym:
            w[sym] = w.get(sym, 0) + a["pct"] / 100
    tot = sum(w.values()) or 1
    w = {k: v / tot for k, v in w.items()}
    S = {k: dict(series(os.path.join(PX, k + ".json"))) for k in w}
    if not all(S.values()):
        return None
    start = max(min(s) for s in S.values())
    days = sorted(set().union(*[set(s) for s in S.values()]))
    days = [d for d in days if d >= start]
    lastp = {k: None for k in w}
    nav, val, hold, mon = [], 1.0, None, None
    for d in days:
        px = {}
        for k in w:
            if d in S[k]:
                lastp[k] = S[k][d]
            px[k] = lastp[k]
        if any(v is None for v in px.values()):
            continue
        if hold is None or d.month != mon:          # 매달 첫 거래일에 비중 맞춤
            if hold is not None:
                val = sum(hold[k] * px[k] for k in w)
            hold = {k: val * w[k] / px[k] for k in w}
            mon = d.month
        val = sum(hold[k] * px[k] for k in w)
        nav.append((d, val))
    if len(nav) < 260 * 3:
        return None
    vals = [v for _, v in nav]
    yrs = (nav[-1][0] - nav[0][0]).days / 365.25
    cagr = (vals[-1] / vals[0]) ** (1 / yrs) - 1
    peak, mdd = vals[0], 0
    for v in vals:
        peak = max(peak, v)
        mdd = min(mdd, v / peak - 1)
    r1 = sorted((vals[i] / vals[i - 252] - 1) for i in range(252, len(vals)))
    r5 = sorted((vals[i] / vals[i - 252 * 5]) ** (1 / 5) - 1 for i in range(252 * 5, len(vals)))
    q = lambda xs, p: xs[min(len(xs) - 1, max(0, int(len(xs) * p)))]
    rets = [math.log(vals[i] / vals[i - 1]) for i in range(1, len(vals))]
    vol = (sum(x * x for x in rets) / len(rets) - (sum(rets) / len(rets)) ** 2) ** 0.5 * math.sqrt(252)
    years = {}
    for d, v in nav:
        years.setdefault(d.year, [v, v])
        years[d.year][1] = v
    yr = []
    py = None
    for y in sorted(years):
        a, b = years[y]
        base = py if py else a
        yr.append([y, round((b / base - 1) * 100, 1)])
        py = b
    mon_s = [(d, v) for i, (d, v) in enumerate(nav) if i == len(nav) - 1 or nav[i + 1][0].month != d.month]
    return {"from": nav[0][0].isoformat(), "to": nav[-1][0].isoformat(), "yrs": round(yrs, 1), "cagr": r(cagr * 100, 1), "mdd": r(mdd * 100, 1), "vol": r(vol * 100, 1),
            "y1": {"p10": r(q(r1, .1) * 100, 1), "p50": r(q(r1, .5) * 100, 1), "p90": r(q(r1, .9) * 100, 1), "pos": round(sum(1 for x in r1 if x > 0) / len(r1) * 100)},
            "y5": {"p10": r(q(r5, .1) * 100, 1), "p50": r(q(r5, .5) * 100, 1), "p90": r(q(r5, .9) * 100, 1), "pos": round(sum(1 for x in r5 if x > 0) / len(r5) * 100)} if r5 else None,
            "years": yr[-12:], "growth": {"labels": [d.isoformat()[:7] for d, _ in mon_s], "vals": [r(v / vals[0], 4) for _, v in mon_s]},
            "w": {k: round(v * 100, 1) for k, v in w.items()}}


# ───────── 채권 계산서 재료 ─────────
def bond_price(cpn, freq, yrs, y):
    """액면 100, 연 cpn%, 연 freq 번, 남은 yrs 년, 수익률 y% 일 때 값"""
    n = max(1, round(yrs * freq))
    c = cpn / freq
    yy = y / 100 / freq
    return sum(c / (1 + yy) ** t for t in range(1, n + 1)) + 100 / (1 + yy) ** n


def mod_dur(cpn, freq, yrs, y):
    p0 = bond_price(cpn, freq, yrs, y)
    up, dn = bond_price(cpn, freq, yrs, y + 0.01), bond_price(cpn, freq, yrs, y - 0.01)
    return round((dn - up) / (2 * p0 * 0.0001), 2)


def years_to(mat, today):
    try:
        return max(0.1, (dt.date.fromisoformat(mat[:10]) - today).days / 365.25)
    except Exception:
        return None


# ═════════ 상품별 ═════════
def enrich(forms, P, old_macro):
    today = P.NOW.date()
    M = macro(old_macro)
    kospi = series(os.path.join(PX, "KOSPI.json"))
    spy = series(os.path.join(PX, "SPY.json"))
    qqq = series(os.path.join(PX, "QQQ.json"))
    gld = series(os.path.join(PX, "GLD.json"))
    fx_us = (P.PR.get("ust_hist") or {}).get("usdkrw") or []
    for f in forms:
        k = f["key"]
        try:
            if k in ("gl_stock", "pension", "dc", "irp"):
                f["mkt"] = mkt_global(P, spy, qqq, gld, fx_us, k)
                f["sim"] = sim_equity(f, k)
            elif k == "kr_stock":
                f["mkt"] = mkt_korea(P, kospi)
                f["sim"] = sim_equity(f, k)
            elif k == "ktb":
                f["mkt"] = mkt_ktb(P, M)
                f["sim"] = sim_ktb(f, today)
            elif k == "ust":
                f["mkt"] = mkt_ust(P, M, fx_us, today)
                f["sim"] = sim_ust(f, P, today)
            elif k == "brl":
                f["mkt"] = mkt_brl(P, M)
                f["sim"] = sim_brl(f, P, today)
            elif k == "els":
                f["mkt"] = mkt_els(f, P)
                f["sim"] = sim_els(f, P)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print("시장·계산서 실패", k, repr(e))
    return M


# ── 주식·연금 (미국 중심) ──
def mkt_global(P, spy, qqq, gld, fx, k):
    sv = [c for _, c in spy]
    m200 = ma(sv, 200)[-1]
    gap = (sv[-1] / m200 - 1) * 100 if m200 else None
    fx_l = fx[-1][1] if fx else None
    fx_1y = (fx[-1][1] / fx[0][1] - 1) * 100 if len(fx) > 2 else None
    kp = [
        {"label": "S&P500 (SPY)", "value": f"{sv[-1]:,.1f}", "sub": f"1년 {sg(chg(spy, 252))} · 200일선 {sg(gap)}", "tone": 1 if (gap or 0) > 0 else -1},
        {"label": "나스닥100 (QQQ)", "value": f"{qqq[-1][1]:,.1f}", "sub": f"1년 {sg(chg(qqq, 252))} · 1달 {sg(chg(qqq, 21))}", "tone": 1 if (chg(qqq, 21) or 0) > 0 else -1},
        {"label": "금 (GLD)", "value": f"{gld[-1][1]:,.1f}", "sub": f"1년 {sg(chg(gld, 252))} · 1달 {sg(chg(gld, 21))}", "tone": 1 if (chg(gld, 21) or 0) > 0 else -1},
        {"label": "달러·원", "value": f"{fx_l:,.1f}원" if fx_l else "–", "sub": f"1년 {sg(fx_1y)} · 환노출 ETF 원화 수익에 더해짐", "tone": 0},
    ]
    scen = P.SCEN or []
    view = [
        f"미국 S&P500이 200일 평균선보다 {sg(gap)} 위에 있음 → 큰 흐름은 상승 추세임 (이 선 아래로 3일 내려가면 현금을 늘리는 규칙)" if (gap or 0) > 0 else f"미국 S&P500이 200일 평균선보다 {sg(gap)} 아래임 → 조심 구간이라 현금을 늘린 상태임",
        f"나스닥100은 최근 1달 {sg(chg(qqq, 21))} — 기술주가 " + ("시장보다 강함" if (chg(qqq, 21) or 0) > (chg(spy, 21) or 0) else "시장보다 약해 흔들리는 중") + "임",
    ]
    lead = P.strip((P.D.get("leaders") or {}).get("short"))
    if lead:
        view.append("요즘 돈이 몰리는 곳: " + lead)
    if scen:
        top = max(scen, key=lambda s: s.get("pct") or 0)
        view.append(f"앞으로 가장 가능성 높게 보는 그림: 「{top.get('label')}」 {top.get('pct')}% (매일 아침 시황 리포트 기준)")
    if k in ("dc", "irp"):
        view.append("퇴직연금은 위험자산 70% 한도가 있어 같은 배분을 70%로 줄이고 나머지는 채권·현금성으로 채움")
    return {"title": "미국·글로벌 주식 시장 지금", "kpis": kp,
            "charts": [chart_of(spy, "S&P500 (SPY) · 1년과 200일 평균선", "", "#2f6fdf", 260, 200), chart_of(qqq, "나스닥100 (QQQ) · 1년", "", "#7b5cff", 260)],
            "view": view,
            "outlook": {"title": "앞으로 시나리오 (매일 아침 시황 리포트)", "cols": ["시나리오", "가능성", "근거"],
                        "rows": [[s.get("label"), f"{s.get('pct')}%", P.strip(((P.LEDGER.get('scenario_desc') or {}) if hasattr(P, 'LEDGER') else {}).get(s.get('code'), ""))] for s in scen if s.get("pct")],
                        "src": "시황 리포트 " + str(P.D.get("date") or "")} if scen else None}


def mkt_korea(P, kospi):
    v = [c for _, c in kospi]
    m200 = ma(v, 200)[-1]
    gap = (v[-1] / m200 - 1) * 100 if m200 else None
    hi52 = max(v[-252:])
    LK = P.LK or {}
    up, tot = LK.get("up"), LK.get("total")
    strong = [s.get("name") + f" {sg(s.get('r'))}" for s in (LK.get("strong") or [])[:3]]
    secs, rel = P.kr_sectors(5)
    kp = [
        {"label": "코스피", "value": f"{v[-1]:,.0f}", "sub": f"오늘 {sg(chg(kospi, 1), 2)} · 1년 {sg(chg(kospi, 252))}", "tone": 1 if (chg(kospi, 1) or 0) > 0 else -1},
        {"label": "200일 평균선과 거리", "value": sg(gap), "sub": "위면 상승 추세 · 아래면 회복 확인 전", "tone": 1 if (gap or 0) > 0 else -1},
        {"label": "52주 최고가 대비", "value": sg((v[-1] / hi52 - 1) * 100), "sub": f"최고 {hi52:,.0f}", "tone": 0},
        {"label": "오늘 오른 종목 비율", "value": f"{round(up / tot * 100)}%" if up and tot else "–", "sub": f"{up:,}개 / {tot:,}개" if up and tot else "", "tone": 1 if up and tot and up / tot > .5 else -1},
    ]
    view = [
        f"코스피는 200일 평균선보다 {sg(gap)} " + ("위 → 상승 추세가 살아 있음" if (gap or 0) > 0 else "아래 → 큰 흐름은 아직 회복 확인 전이라 나눠 사는 것이 안전함"),
        f"1달 {sg(chg(kospi, 21))} · 3달 {sg(chg(kospi, 63))} · 1년 {sg(chg(kospi, 252))} — 오르내림이 큰 구간임",
    ]
    if strong:
        view.append("오늘 강한 업종: " + " · ".join(strong))
    view.append("앱 확률 모델(종목마다 2년 일봉으로 계산)이 5일 뒤 오를 가능성을 높게 보는 업종: " + ", ".join(f"{s['name']} {s['p5']}%" for s in secs[:3]))
    return {"title": "한국 주식 시장 지금", "kpis": kp,
            "charts": [chart_of(kospi, "코스피 · 1년과 200일 평균선", "", "#e0533d", 260, 200)],
            "view": view,
            "outlook": {"title": "업종별 5일 뒤 오를 확률 (앱 확률 모델)", "cols": ["업종", "확률", "최근 5일", "대표 종목"],
                        "rows": [[f"{s['icon']} {s['name']}", f"{s['p5']}%", sg(s["r5"]), " · ".join(x["name"] for x in s["stocks"])] for s in secs],
                        "src": f"앱 확률 모델 · 신뢰도 {rel or '보통'} · 참고값"}}


def sim_equity(f, k):
    bt = backtest([a for a in f["alloc"] if a.get("pct")])
    if not bt:
        return None
    return {"kind": "equity", "bt": bt, "note": f"{bt['from'][:7]}~{bt['to'][:7]} 실제 지수로 이 비중을 매달 맞췄다면의 계산 · 달러 자산은 달러 기준 · 배당·수수료·세금 제외(보수적) · 국내 업종 칸은 코스피로 대신함",
            "contrib": {"pension": 600, "irp": 900}.get(k)}


# ── 국고채 ──
def mkt_ktb(P, M):
    ks = [b for b in (P.PR.get("krw") or []) if b.get("kind") == "국채" and b.get("buy") is not None]
    ks = sorted(ks, key=lambda b: (b.get("yrs") or 0) + (b.get("days") or 0) / 365)
    def near(y):
        c = sorted(ks, key=lambda b: abs((b.get("yrs") or 0) + (b.get("days") or 0) / 365 - y))
        return c[0] if c else None
    s3, s10, s30 = near(3), near(10), near(25)
    kr10 = M.get("kr10") or []
    kr3m = M.get("kr3m") or []
    kp = [
        {"label": "단기 국채 (약 3~5년)", "value": f"{s3['buy']:.2f}%" if s3 else "–", "sub": (s3 or {}).get("name", ""), "tone": 0},
        {"label": "10년 안팎 국고채", "value": f"{s10['buy']:.2f}%" if s10 else "–", "sub": (s10 or {}).get("name", ""), "tone": 0},
        {"label": "장기 국고채", "value": f"{s30['buy']:.2f}%" if s30 else "–", "sub": (s30 or {}).get("name", ""), "tone": 0},
        {"label": "금리가 더 오를 가능성", "value": f"{P.RATE_UP}%", "sub": "시황 리포트 시나리오 「금리 상승」", "tone": -1 if P.RATE_UP >= 45 else 0},
    ]
    if kr3m:
        kp[3:3] = []
    charts = [{"title": "지금 파는 국채 — 남은 기간별 매수 금리 (세전)", "unit": "%", "color": "#1f9fb5", "kind": "curve",
               "labels": [f"{(b.get('yrs') or 0) + (b.get('days') or 0) / 365:.1f}년" for b in ks], "vals": [b.get("buy") for b in ks],
               "x": [round((b.get("yrs") or 0) + (b.get("days") or 0) / 365, 2) for b in ks]}]
    if len(kr10) > 24:
        charts.append({"title": "한국 국채 10년 금리 · 10년 추이 (월)", "unit": "%", "color": "#2f6fdf", "labels": [x[0] for x in kr10], "vals": [x[1] for x in kr10]})
    slope = (s30["buy"] - s3["buy"]) if s3 and s30 else None
    view = [f"지금 국채 금리는 단기 {s3['buy']:.2f}% → 장기 {s30['buy']:.2f}% — 길게 빌려줄수록 이자를 {slope:+.2f}%p 더 줌".replace("+-", "−") if slope is not None else "국채 금리 곡선은 매일 바뀜"]
    if len(kr10) > 24:
        v = [x[1] for x in kr10]
        view.append(f"한국 10년 금리는 지난 10년 중 {pct_rank(v, v[-1])}% 위치(0%=가장 낮음) — " + ("높은 편이라 지금 사 두면 이자를 길게 받기 좋음" if pct_rank(v, v[-1]) >= 60 else "낮은 편이라 장기채보다 짧은 채권이 유리함"))
    view.append(f"시황 리포트는 「금리가 더 오르는 경우」 {P.RATE_UP}% · 「금리 안정·경기 둔화」 {P.RATE_DOWN}%로 봄 → " + ("당분간은 단기 위주로 담고 장기는 조금만" if P.RATE_UP >= 45 else "장기채를 늘려 금리 하락 때 값이 오르는 몫까지 노림"))
    view.append("표면금리가 낮은 옛 국고채는 이자(과세)는 적고 만기 차익(비과세)이 커서 금융소득종합과세가 걱정인 고객에게 특히 유리함")
    rows = [[b.get("name"), f"{(b.get('yrs') or 0) + (b.get('days') or 0) / 365:.1f}년", f"{b['buy']:.3f}%", f"{b['after']:.2f}%", f"{b['bank']:.2f}%"] for b in ks]
    return {"title": "한국 국채 시장 지금", "kpis": kp, "charts": charts, "view": view,
            "outlook": {"title": "지금 파는 국채 전체 (미래에셋증권)", "cols": ["종목", "남은 기간", "매수 금리", "세후", "예금 환산"], "rows": rows, "src": "미래에셋증권 " + str(P.PR.get("updated") or "")}}


def sim_ktb(f, today):
    picks = []
    for a in f["alloc"]:
        yrs = years_to(a.get("mat"), today)
        if not yrs or not a.get("px"):
            continue
        y = a.get("buy") or a.get("y")
        picks.append({"name": a["inst"], "slot": a["name"], "pct": a["pct"], "cur": "KRW", "p": a["px"] / 10000, "cpn": a.get("cpn") or 0, "freq": 2, "comp5": "국민주택" in a["inst"],
                      "yrs": round(yrs, 2), "y": y, "dur": mod_dur(a.get("cpn") or 0, 2, yrs, y or 4), "tax_int": 15.4, "mat": a.get("mat"),
                      "after": a.get("y"), "bank": a.get("bank")})
    return {"kind": "bond", "cur": "KRW", "picks": picks, "rate_moves": [-1, -0.5, 0, 0.5, 1],
            "note": "액면 10,000원당 지금 값으로 사서 만기까지 들고 있을 때 · 이자 15.4% 과세 · 만기 차익 비과세 · 이자 재투자 안 함 · 수수료 제외"}


# ── 미국채 ──
def mkt_ust(P, M, fx, today):
    ua = ((P.PR.get("ust_all") or {}).get("items")) or []
    pts = []
    for b in ua:
        yrs = years_to(b.get("mat"), today)
        if yrs and b.get("y") is not None and b.get("k") in ("Bill", "N", "B"):
            pts.append((yrs, b["y"]))
    pts.sort()
    def at(y):
        c = [p for p in pts if abs(p[0] - y) < max(0.4, y * 0.15)]
        return sum(p[1] for p in c) / len(c) if c else None
    y2, y10, y30, y3m = at(2), at(10), at(30), at(0.25)
    h = (P.PR.get("ust_hist") or {}).get("y10") or []
    hv = [x[1] for x in h]
    ff = last(M.get("us_ff"))
    fx_l = fx[-1][1] if fx else None
    fxv = [x[1] for x in fx]
    kp = [
        {"label": "미국 10년 국채금리", "value": f"{y10 or P.US10:.2f}%", "sub": f"1년 범위 {min(hv):.2f}~{max(hv):.2f}%" if hv else "", "tone": 0},
        {"label": "미국 2년 국채금리", "value": f"{y2:.2f}%" if y2 else "–", "sub": "기준금리 기대를 가장 잘 비춤", "tone": 0},
        {"label": "10년 − 2년 (장단기 차)", "value": f"{(y10 - y2) * 100:+.0f}bp".replace("+-", "−") if y10 and y2 else "–", "sub": "플러스 = 정상(길수록 이자 더 줌)", "tone": 0},
        {"label": "달러·원", "value": f"{fx_l:,.1f}원" if fx_l else "–", "sub": f"1년 범위 {min(fxv):,.0f}~{max(fxv):,.0f}원 · 지금 {pct_rank(fxv, fx_l)}% 위치" if fxv else "", "tone": 0},
    ]
    if ff:
        kp.insert(2, {"label": "미국 기준금리", "value": f"{ff[1]:.2f}%", "sub": f"{ff[0][:7]} 실효 연방기금금리 (FRED)", "tone": 0})
        kp = kp[:5]
    charts = [{"title": "미국 국채 금리 곡선 — 남은 기간별 (오늘)", "unit": "%", "color": "#2f6fdf", "kind": "curve",
               "labels": [f"{p[0]:.1f}년" for p in pts], "vals": [p[1] for p in pts], "x": [round(p[0], 2) for p in pts]}]
    if h:
        charts.append({"title": "미국 10년 국채금리 · 1년", "unit": "%", "color": "#2f6fdf", "labels": [x[0] for x in h], "vals": hv})
    if fx:
        charts.append({"title": "달러·원 환율 · 1년", "unit": "원", "color": "#7b5cff", "labels": [x[0] for x in fx], "vals": fxv})
    view = []
    if hv:
        view.append(f"미국 10년 금리 {hv[-1]:.2f}%는 지난 1년 중 {pct_rank(hv, hv[-1])}% 위치(0%=가장 낮음) — " + ("높은 편이라 지금 사면 높은 이자를 오래 묶어 둘 수 있음" if pct_rank(hv, hv[-1]) >= 60 else "낮은 편이라 길게 묶기보다 짧은 채권이 나음"))
    if y10 and y2:
        view.append(f"장단기 금리 차 {(y10 - y2) * 100:+.0f}bp — ".replace("+-", "−") + ("정상 곡선이라 긴 채권이 이자를 더 줌" if y10 > y2 else "역전 곡선이라 짧은 채권 이자가 오히려 높음 · 경기 둔화 신호로 읽힘"))
    if fxv:
        view.append(f"달러·원 {fx_l:,.0f}원은 1년 범위의 {pct_rank(fxv, fx_l)}% 위치 — " + ("달러가 비싼 편이라 나눠서 환전하는 것이 안전함" if pct_rank(fxv, fx_l) >= 70 else "달러가 싼 편이라 달러 자산을 늘리기 좋은 자리임" if pct_rank(fxv, fx_l) <= 30 else "중간 자리임"))
    view.append(f"시황 리포트는 「금리가 더 오르는 경우」 {P.RATE_UP}%로 봄 → 단기 위주로 담고, 금리가 더 오르면 장기를 나눠 늘리는 쪽이 안전함")
    return {"title": "미국 국채·환율 시장 지금", "kpis": kp, "charts": charts, "view": view,
            "outlook": {"title": "미래에셋 판매 미국채 (오늘)", "cols": ["종목", "만기", "표면금리", "달러 수익률"],
                        "rows": [[b.get("name"), b.get("mat"), f"{b.get('cpn')}%", f"{b.get('ytm'):.2f}%"] for b in ((P.PR.get('ust') or {}).get('items') or [])],
                        "src": "미래에셋증권 미국채 판매정보 " + str((P.PR.get("ust") or {}).get("date") or "")}}


def sim_ust(f, P, today):
    items = {b.get("name"): b for b in ((P.PR.get("ust") or {}).get("items") or [])}
    ua = {b.get("nm"): b for b in (((P.PR.get("ust_all") or {}).get("items")) or [])}
    picks = []
    for a in f["alloc"]:
        yrs = years_to(a.get("mat"), today)
        if not yrs:
            continue
        b = items.get(a["inst"], {})
        y = a.get("y")
        px = bond_price(a.get("cpn") or 0, 2, yrs, y)          # 수익률로 다시 구한 값 (액면 100)
        picks.append({"name": a["inst"], "slot": a["name"], "pct": a["pct"], "cur": "USD", "p": round(px / 100, 5), "cpn": a.get("cpn") or 0, "freq": 2,
                      "yrs": round(yrs, 2), "y": y, "dur": mod_dur(a.get("cpn") or 0, 2, yrs, y), "tax_int": 15.4, "mat": a.get("mat")})
    fx = (P.PR.get("ust_hist") or {}).get("usdkrw") or []
    return {"kind": "bond", "cur": "USD", "fx": fx[-1][1] if fx else P.FX, "picks": picks, "fx_moves": [-15, -7.5, 0, 7.5, 15], "rate_moves": [-1, -0.5, 0, 0.5, 1],
            "note": "지금 달러 수익률로 계산한 값에 사서 만기까지 · 이자 15.4% 과세 · 매매·환차익 비과세(개인) · 환율은 만기 때 기준 · 이자 재투자·수수료·환전 비용 제외"}


# ── 브라질 국채 ──
def mkt_brl(P, M):
    BL = P.BL or {}
    q = BL.get("q") or {}
    th = P.PR.get("td_hist") or {}
    fx = (P.PR.get("brl") or {}).get("fx") or []          # 원/헤알
    ub = (P.PR.get("brl") or {}).get("usdbrl") or []      # 헤알/달러
    anb = P.PR.get("anb") or []
    ntnb = sorted([a for a in anb if a.get("code") == "NTN-B"], key=lambda a: a["mat"])
    real = ntnb[len(ntnb) // 2]["r"] if ntnb else None
    selic = last(M.get("selic"))
    ipca = last(M.get("ipca12"))
    fxv = [x[1] for x in fx]
    kp = [
        {"label": "브라질 10년 국채금리", "value": f"{q.get('BR10Y', {}).get('v'):.2f}%" if q.get("BR10Y") else "–", "sub": f"하루 {q['BR10Y']['chg']:+.2f}%p".replace("+-", "−") if q.get("BR10Y") and q["BR10Y"].get("chg") is not None else "", "tone": 0},
        {"label": "Selic 기준금리", "value": f"{selic[1]:.2f}%" if selic else "–", "sub": f"{selic[0]} 브라질 중앙은행" if selic else "중앙은행 목표금리", "tone": 0},
        {"label": "물가 (IPCA 12개월)", "value": f"{ipca[1]:.2f}%" if ipca else "–", "sub": f"{ipca[0][:7]} 기준" if ipca else "", "tone": 0},
        {"label": "실질금리 (물가채 NTN-B)", "value": f"{real:.2f}%" if real else "–", "sub": "물가를 빼고도 받는 금리", "tone": 1},
        {"label": "원/헤알 환율", "value": f"{fxv[-1]:,.1f}원" if fxv else "–", "sub": f"1년 {sg((fxv[-1] / fxv[0] - 1) * 100)} · 1달 {sg((fxv[-1] / fxv[-22] - 1) * 100) if len(fxv) > 22 else '–'}", "tone": -1 if fxv and fxv[-1] < fxv[0] else 1},
        {"label": "헤알/달러", "value": f"{ub[-1][1]:.3f}" if ub else "–", "sub": f"1년 {sg((ub[-1][1] / ub[0][1] - 1) * 100)} (오르면 헤알 약세)" if len(ub) > 2 else "", "tone": 0},
    ]
    charts = []
    for nm, col in (("NTN-F 2037", "#22a06b"), ("LTN 2032", "#1f9fb5"), ("NTN-B 2060", "#7b5cff")):
        h = th.get(nm) or []
        if len(h) > 30:
            charts.append({"title": f"{nm} 금리 추이" + (" (물가채: 물가+α)" if "NTN-B" in nm else ""), "unit": "%", "color": col, "labels": [x[0] for x in h[-260:]], "vals": [x[1] for x in h[-260:]]})
            if len(charts) >= 2:
                break
    if fx:
        charts.insert(1, {"title": "원/헤알 환율 · 1년", "unit": "원", "color": "#e6a817", "labels": [x[0] for x in fx[-260:]], "vals": fxv[-260:]})
    f_s, f_fx, f_i = M.get("f_selic"), M.get("f_fx"), M.get("f_ipca")
    y0 = str(P.NOW.year)
    y1 = str(P.NOW.year + 1)
    out_rows = []
    if f_s and f_s.get("y"):
        out_rows.append(["Selic 기준금리", f"{selic[1]:.2f}%" if selic else "–", f"{f_s['y'].get(y0, float('nan')):.2f}%" if y0 in f_s["y"] else "–", f"{f_s['y'].get(y1):.2f}%" if y1 in f_s["y"] else "–"])
    if f_i and f_i.get("y"):
        out_rows.append(["물가 (IPCA)", f"{ipca[1]:.2f}%" if ipca else "–", f"{f_i['y'].get(y0):.2f}%" if y0 in f_i["y"] else "–", f"{f_i['y'].get(y1):.2f}%" if y1 in f_i["y"] else "–"])
    if f_fx and f_fx.get("y"):
        out_rows.append(["헤알/달러", f"{ub[-1][1]:.2f}" if ub else "–", f"{f_fx['y'].get(y0):.2f}" if y0 in f_fx["y"] else "–", f"{f_fx['y'].get(y1):.2f}" if y1 in f_fx["y"] else "–"])
        usdkrw = P.FX
        if usdkrw and y1 in f_fx["y"]:
            out_rows.append(["원/헤알 (달러·원 그대로 가정)", f"{fxv[-1]:.1f}원" if fxv else "–", f"{usdkrw / f_fx['y'][y0]:.1f}원" if y0 in f_fx["y"] else "–", f"{usdkrw / f_fx['y'][y1]:.1f}원"])
    view = []
    br10 = (q.get("BR10Y") or {}).get("v")
    if br10 and P.US10:
        view.append(f"브라질 10년 {br10:.1f}% vs 미국 10년 {P.US10:.1f}% — 금리 차 {br10 - P.US10:.1f}%p: 이 차이가 환율 하락을 견디는 「쿠션」임")
    if real:
        view.append(f"물가를 빼고도 연 {real:.1f}%를 주는 실질금리는 세계 주요국 중 최상위권 — 브라질 중앙은행이 물가를 잡으려 금리를 높게 유지 중이기 때문임")
    if selic and ipca:
        view.append(f"Selic {selic[1]:.2f}% − 물가 {ipca[1]:.2f}% = 실질 기준금리 {selic[1] - ipca[1]:.1f}%p — 금리를 내릴 여지가 크면 채권값이 오르는 몫이 생김")
    if fxv:
        vol = (sum((math.log(fxv[i] / fxv[i - 1])) ** 2 for i in range(1, len(fxv))) / max(1, len(fxv) - 1)) ** 0.5 * math.sqrt(252) * 100
        view.append(f"원/헤알은 1년 새 {min(fxv):,.0f}~{max(fxv):,.0f}원을 오갔고 1년 변동성은 약 {vol:.0f}% — 금리가 높아도 환율로 크게 잃을 수 있어 자산의 10~20% 안에서만 권함")
    if f_fx and y1 in (f_fx.get("y") or {}) and ub:
        d = (f_fx["y"][y1] / ub[-1][1] - 1) * 100
        view.append(f"시장 전망(Focus 설문 중간값)은 내년 말 헤알/달러 {f_fx['y'][y1]:.2f} — 지금보다 헤알이 {abs(d):.1f}% " + ("약해질" if d > 0 else "강해질") + " 것으로 봄")
    view.append("한-브라질 조세협약으로 개인의 이자·매매차익·환차익이 비과세 → 금융소득종합과세 대상 고객에게 특히 큰 장점임")
    return {"title": "브라질 금리·헤알화 시장 지금", "kpis": kp, "charts": charts[:3], "view": view,
            "outlook": {"title": "브라질 중앙은행 Focus 설문 — 시장 전망 중간값", "cols": ["항목", "지금", f"{y0}년 말", f"{y1}년 말"], "rows": out_rows,
                        "src": f"BCB Focus {f_fx.get('date') if f_fx else ''} · 원/헤알은 달러·원 {P.FX:,.0f}원 그대로 둔 단순 환산"} if out_rows else None,
            "curve": {"title": "NTN-F 만기별 금리 (ANBIMA)", "rows": [[a["mat"][:4], round(a["r"], 2)] for a in anb if a.get("code") == "NTN-F"]}}


def sim_brl(f, P, today):
    anb = P.PR.get("anb") or []
    BL = P.BL or {}
    fx = (P.PR.get("brl") or {}).get("fx") or []
    fxb = fx[-1][1] if fx else None
    picks = []
    for a in f["alloc"]:
        yrs = years_to(a.get("mat"), today)
        if not yrs:
            continue
        if a["k"] == "brlf":
            b = [x for x in anb if x.get("code") == "NTN-F" and x["mat"] == a.get("mat")]
            pu = b[0]["pu"] if b else None
            picks.append({"name": a["inst"], "slot": a["name"], "pct": a["pct"], "cur": "BRL", "p": round(pu / 1000, 5) if pu else None, "cpn": 10.0, "cpn_eff": 4.8809 * 2, "freq": 2,
                          "yrs": round(yrs, 2), "y": a.get("y"), "dur": mod_dur(10, 2, yrs, a.get("y") or 14), "tax_int": 0, "mat": a.get("mat"), "fx": fxb})
        else:
            u = [x for x in (BL.get("usd") or []) if x.get("name") == a["inst"]]
            u = u[0] if u else {}
            picks.append({"name": a["inst"], "slot": a["name"], "pct": a["pct"], "cur": "USD", "p": round((u.get("px") or 100) / 100, 5), "cpn": u.get("cpn") or 0, "freq": 2,
                          "yrs": round(yrs, 2), "y": a.get("y"), "dur": mod_dur(u.get("cpn") or 0, 2, yrs, a.get("y") or 6), "tax_int": 15.4, "mat": a.get("mat"), "fx": P.FX})
    return {"kind": "bond", "cur": "MIX", "picks": [p for p in picks if p.get("p")], "fx_moves": [-30, -15, 0, 10, 20],
            "note": "지금 값으로 사서 만기까지 · NTN-F는 연 10%(6개월마다 4.88%) 이자 · 헤알 국채 개인 비과세(조세협약) · 달러표시채 이자는 보수적으로 15.4% 과세 · 환율은 만기 때 기준(지금 대비) · 이자 재투자·수수료·환전 비용 제외"}


# ── ELS ──
EMAP = {"KOSPI200": "KS200", "S&P500": "GSPC", "Nikkei225": "N225", "NIKKEI225": "N225", "HSCEI": "HSCE", "EuroStoxx50": "STOXX50E", "EUROSTOXX50": "STOXX50E",
        "삼성전자": "005930_KS", "SK하이닉스": "000660_KS"}


def mkt_els(f, P):
    uas = []
    for a in f["alloc"]:
        for u in (a.get("ua") or "").split(","):
            u = u.strip()
            if u and u not in uas:
                uas.append(u)
    kp, charts, rows = [], [], []
    colors = ["#2f6fdf", "#e0533d", "#22a06b", "#7b5cff", "#e6a817"]
    norm = []
    for i, u in enumerate(uas):
        s = series(os.path.join(EPX, EMAP.get(u, u) + ".json"))
        if len(s) < 260:
            continue
        v = [c for _, c in s]
        hi = max(v[-252:])
        mdd3 = 0
        pk = v[-756]
        for x in v[-756:]:
            pk = max(pk, x)
            mdd3 = min(mdd3, x / pk - 1)
        kp.append({"label": u, "value": "1년 " + sg(chg(s, 252)), "sub": f"1달 {sg(chg(s, 21))} · 52주 고점 대비 {sg((v[-1] / hi - 1) * 100)}", "tone": 1 if (chg(s, 21) or 0) > 0 else -1})
        rows.append([u, sg(chg(s, 21)), sg(chg(s, 252)), sg((v[-1] / hi - 1) * 100), sg(mdd3 * 100, 0)])
        s1 = last_n(s, 253)
        norm.append({"name": u, "color": colors[i % 5], "vals": [r(c / s1[0][1] * 100, 2) for _, c in s1], "labels": [d.isoformat() for d, _ in s1]})
    if norm:
        charts.append({"title": "기초자산 1년 흐름 (1년 전 = 100)", "unit": "", "multi": norm, "labels": norm[0]["labels"], "vals": norm[0]["vals"], "color": norm[0]["color"]})
    st = (jl(os.path.join("archive", "x", "els_replay.json"), {}) or {})
    view = ["ELS 손익은 기초자산이 「얼마나 떨어지느냐」에 달림 — 지금 수준에서 KI(손실 기준선)까지 얼마나 여유가 있는지가 핵심임"]
    for a in f["alloc"]:
        if a.get("ki"):
            view.append(f"{a['ua']} 기준 손실 기준선 {a['ki']:g}% = 지금보다 {100 - a['ki']:g}% 넘게 떨어져야 손실 가능성이 생김")
    if rows:
        worst = min(rows, key=lambda x: float(x[4].replace('%', '').replace('−', '-')))
        view.append(f"최근 3년 가장 크게 빠졌던 것은 {worst[0]} ({worst[4]}) — 그래도 손실 기준선까지는 여유가 있었는지가 관건임")
    view.append(f"아래 과거 확률은 {st.get('from', '2006')[:4]}년부터 매일 같은 조건으로 가입했다고 치고 다시 돌려 본 결과임")
    return {"title": "ELS 기초자산 시장 지금", "kpis": kp[:6], "charts": charts, "view": view,
            "outlook": {"title": "기초자산 한눈에", "cols": ["기초자산", "1달", "1년", "52주 고점 대비", "3년 중 최대 하락"], "rows": rows, "src": "종가 · els_px"}}


def sim_els(f, P):
    st = jl(os.path.join("archive", "x", "els_replay.json"), {}) or {}
    picks = []
    for a in f["alloc"]:
        sid = (st.get("by_id") or {}).get(a.get("code"))
        h = (st.get("stats") or {}).get(sid) if sid else None
        steps = []
        desc = a.get("desc") or ""
        try:
            steps = [int(x) for x in desc.split(",")[0].split("(")[0].split("-") if x.strip().isdigit()]
        except Exception:
            steps = []
        picks.append({"name": a["inst"], "slot": a["name"], "pct": a["pct"], "cpn": a.get("y"), "ki": a.get("ki"), "steps": steps, "cyc": 6, "ua": a.get("ua"),
                      "pp": a["k"] == "elb", "hist": {"n": h.get("n"), "from": h.get("from"), "to": h.get("to"), "k": h.get("k"), "loss": h.get("loss"), "loss_avg": h.get("loss_avg"),
                                                     "loss_worst": h.get("loss_worst"), "ki_touch": h.get("ki_touch"), "mat_ok": h.get("mat_ok")} if h else None})
    return {"kind": "els", "picks": picks, "note": "조기상환되면 그때까지 연 이자를 기간만큼 받음(6개월 = 연 이자의 절반) · 과거 확률은 2006년부터 매일 같은 조건으로 가입했다고 치고 돌려 본 결과 · 세금(배당소득세 15.4%)·수수료 반영 전"}
