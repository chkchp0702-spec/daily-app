"""
📝 제안서 기본폼 — 매일 아침 시황이 나오면 그에 맞춘 투자제안서 9종을 미리 만들어 둔다 (10/28 사용자)
  「매일 아침 시황이 나오면 그거에 맞게 주식(국내만, 해외도) 포트 제안서, 개인연금, dc, irp, 국고채, 미국채, 브라질국채, els
   각 투자제안서를 미리 만들어 기본폼을 만들어 놓으면 더 사용량이 줄겠지」
  · AI(API) 안 씀 — 시황리포트·포트·상품 자료를 규칙으로 조립만 함 → 돈 0원
  · 앱 📝 제안서 탭이 이 파일을 읽어 고객 이름·제안자·소속·상품·금액만 넣으면 한 장(전송용)·풀버전 PDF·PPT 를 휴대폰에서 바로 만듦
  · 문장은 PPT 체(~임) · 중학생도 읽히게 · 사라는 뜻 아님(참고용) 고지 포함
  읽는 것: archive/market/*_AM/data.json(아침 시황) · archive/x/pbbrief.json(장중 매시간) · archive/x/products.json(채권·ELS)
           archive/x/brl_live.json · archive/x/live_kr.json · archive/x/live_us.json · archive/x/prob_sec.json
           market-strategy-report/market/port.json·conc.json (_src 에 있으면 그것, 없으면 GitHub 원본)
  쓰는 것: archive/x/proposal.json
  python proposal.py
"""
import datetime as dt
import glob
import json
import os
import re
import urllib.request

KST = dt.timezone(dt.timedelta(hours=9))
NOW = dt.datetime.now(KST)
X = os.path.join("archive", "x")
OUT = os.path.join(X, "proposal.json")
RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/"


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def remote(name):
    """포트 자료: collect 잡은 _src 에 받아 둔 것을, 아니면 GitHub 원본을"""
    for p in (os.path.join("_src", "market-strategy-report", "market", name),):
        if os.path.exists(p):
            return jl(p, {}) or {}
    try:
        with urllib.request.urlopen(RAW + name, timeout=20) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print("못 받음", name, e)
        return {}


def strip(t):
    t = re.sub(r"<[^>]+>", "", str(t or "")).replace("&nbsp;", " ").replace("\n", " ")
    return re.sub(r"\s+", " ", t).strip()


def r1(v, d=1):
    return None if v is None else round(float(v), d)


def sg(v, d=1):
    if v is None:
        return "–"
    s = f"{v:+.{d}f}%"
    return s.replace("-", "−")


def comma(v, d=0):
    if v is None:
        return "–"
    return f"{v:,.{d}f}"


def md(d):
    d = str(d or "")
    return f"{int(d[5:7])}/{int(d[8:10])}" if len(d) >= 10 else d


# ───────── 공통 재료 ─────────
def morning():
    ms = sorted(glob.glob(os.path.join("archive", "market", "20*_AM", "data.json")))
    return (jl(ms[-1], {}) if ms else {}) or {}


D = morning()
PB = jl(os.path.join(X, "pbbrief.json"), {}) or {}
PR = jl(os.path.join(X, "products.json"), {}) or {}
BL = jl(os.path.join(X, "brl_live.json"), {}) or {}
LK = jl(os.path.join(X, "live_kr.json"), {}) or {}
LU = jl(os.path.join(X, "live_us.json"), {}) or {}
PS = jl(os.path.join(X, "prob_sec.json"), {}) or {}
PORT = remote("port.json")
CONC = remote("conc.json")
LEDGER = jl(os.path.join(X, "..", "market", "ledger.json"), {}) or {}

REG = CONC.get("regime") or {}
US_UP = bool(REG.get("up", True))           # 🟢 S&P500 200일선 위(3일 확인)
KR_UP = bool(REG.get("kospi_up", False))    # 코스피 200일선 위
SPX_GAP = REG.get("gap")
KR_GAP = REG.get("kospi_gap")

SCEN = LEDGER.get("scenarios") or []
SC = {s.get("code"): s.get("pct", 0) for s in SCEN}
RATE_UP = SC.get("A", 0)                    # 금리가 더 오르는 경우
RATE_DOWN = SC.get("C", 0) + SC.get("B", 0)  # 경기 둔화 + 금리 안정 → 금리 하락 쪽

FX = (BL.get("q") or {}).get("KRW=", {}).get("v") or (PR.get("ust") or {}).get("fx") or PORT.get("fx")
US10 = (BL.get("q") or {}).get("US10Y", {}).get("v") or (PR.get("ust") or {}).get("y10")
BR10 = (BL.get("q") or {}).get("BR10Y", {}).get("v")
USDBRL = (BL.get("q") or {}).get("BRL=", {}).get("v")

# 한국 상장 상품 (앱·리포트가 이미 쓰는 것만 — 이름이 확실한 것)
I = {
    "spx": {"code": "360750", "name": "TIGER 미국S&P500", "us": "SPY"},
    "ndx": {"code": "133690", "name": "TIGER 미국나스닥100", "us": "QQQ"},
    "k200": {"code": "102110", "name": "TIGER 200", "us": None},
    "gold": {"code": "0072R0", "name": "TIGER KRX금현물", "us": "GLD"},
    "cd": {"code": "499660", "name": "TIGER CD금리투자KIS(합성)", "us": "SGOV"},
    "corp": {"code": "438330", "name": "TIGER 우량회사채액티브", "us": None},
}
C = {"spx": "#2f6fdf", "ndx": "#7b5cff", "k200": "#e0533d", "gold": "#e6a817", "cd": "#3fb28f", "corp": "#1f9fb5",
     "s1": "#f08a3c", "s2": "#c9568f", "s3": "#4f8fbf", "short": "#3fb28f", "mid": "#2f6fdf", "long": "#7b5cff"}


def slot(key, pct, name, why, kind="위험", color=None, inst=None):
    i = I.get(key, {}) if inst is None else inst
    return {"k": key, "pct": round(pct, 1), "name": name, "code": i.get("code"), "inst": i.get("name"), "us": i.get("us"),
            "why": why, "kind": kind, "color": color or C.get(key, "#8899aa")}


def norm(al, total=100, step=0.5):
    """비중을 step 단위로 반올림하고 합이 total 이 되게 (가장 큰 칸이 차이를 받음)"""
    for a in al:
        a["pct"] = round(round(a["pct"] / step) * step, 1)
    diff = round(total - sum(a["pct"] for a in al), 1)
    if al and diff:
        big = max(al, key=lambda a: a["pct"])
        big["pct"] = round(big["pct"] + diff, 1)
    for a in al:
        if a["pct"] == int(a["pct"]):
            a["pct"] = int(a["pct"])
    return al


def live_idx():
    out = []
    for L in (LK, LU):
        for x in (L.get("index") or [])[:2]:
            out.append({"n": x.get("name"), "v": x.get("last"), "c": x.get("chg"), "d": L.get("date") if L is LK else x.get("date")})
    return out


def market_block():
    kp = []
    for x in live_idx():
        kp.append({"label": x["n"], "value": comma(x["v"], 2 if (x["v"] or 0) < 1000 else 0), "chg": r1(x["c"], 2), "asof": md(x.get("d"))})
    if FX:
        kp.append({"label": "달러·원", "value": comma(FX, 1), "chg": r1(((BL.get("q") or {}).get("KRW=", {}).get("chg") or 0) / FX * 100, 2) if FX else None, "asof": ""})
    if US10:
        kp.append({"label": "미국 10년 금리", "value": f"{US10:.2f}%", "chg": None, "asof": ""})
    adv = PB.get("advice") or {}
    scen = [{"code": s.get("code"), "label": s.get("label"), "pct": s.get("pct"), "color": s.get("color")} for s in SCEN if s.get("pct")]
    lead = strip((D.get("leaders") or {}).get("short"))
    one = strip(D.get("one_liner")) or strip(PB.get("one"))
    watch = [[strip(a), strip(b)] for a, b in (adv.get("watch") or [])][:3]
    if not watch:
        watch = [[strip(s.get("when")), strip(s.get("what"))] for s in (D.get("schedule") or [])[:3]]
    us_line = f"🇺🇸 미국: S&P500이 200일 평균선 {'위' if US_UP else '아래'}" + (f"({sg(SPX_GAP)})" if SPX_GAP is not None else "") + f" → {'상승 추세 유지' if US_UP else '조심 구간'}임"
    kr_line = f"🇰🇷 한국: 코스피가 200일 평균선 {'위' if KR_UP else '아래'}" + (f"({sg(KR_GAP)})" if KR_GAP is not None else "") + f" → {'상승 추세' if KR_UP else '아직 회복 확인 전'}임"
    return {
        "date": D.get("date"), "edition": D.get("edition_label"), "asof": PB.get("asof") or "",
        "one": one, "talk": [strip(t) for t in (PB.get("talk") or [])][:3],
        "kpis": kp, "us_up": US_UP, "kr_up": KR_UP, "spx_gap": SPX_GAP, "kr_gap": KR_GAP,
        "trend": [us_line, kr_line],
        "lead": lead, "scen": scen, "watch": watch,
        "story": strip((D.get("story") or {}).get("title")),
        "decision": strip((D.get("summary") or {}).get("decision_line")),
    }


# ───────── 1. 주식 — 국내만 ─────────
def kr_sectors(n=3):
    kr = ((PS.get("markets") or {}).get("KR") or {})
    secs = sorted(kr.get("sectors") or [], key=lambda s: -(s.get("p5") or 0))
    out = []
    for s in secs[:n]:
        st = sorted((s.get("st") or [])[:6], key=lambda x: -(x.get("p5") or 0))[:2]
        out.append({"name": s.get("name"), "icon": s.get("icon"), "p5": int(round((s.get("p5") or 0) * 100)), "r5": r1(s.get("r5")),
                    "stocks": [{"code": x["s"].split(".")[0], "name": x["n"], "p5": int(round((x.get("p5") or 0) * 100)), "r5": r1(x.get("r5"))} for x in st]})
    return out, kr.get("rel")


def f_kr_stock():
    secs, rel = kr_sectors(3)
    core, each, cash = (55, 10, 15) if KR_UP else (35, 8, 41)
    al = [slot("k200", core, "코스피200 코어", "한국 대표 200개 기업을 한 번에 — 삼성전자·SK하이닉스 등 반도체 대형주가 이미 크게 들어 있음")]
    cols = ["s1", "s2", "s3"]
    for i, s in enumerate(secs):
        nm = " · ".join(x["name"] for x in s["stocks"])
        al.append({"k": "sec%d" % i, "pct": each, "name": f"{s['icon']} {s['name']}", "code": " · ".join(x["code"] for x in s["stocks"]), "inst": nm, "us": None,
                   "why": f"5일 뒤 오를 확률 {s['p5']}% (앱 확률 모델 상위) · 최근 5일 {sg(s['r5'])} — 종목은 반씩 나눠 담음", "kind": "위험", "color": C[cols[i]]})
    al.append(slot("cd", cash, "현금성 (대기 자금)", "하루만 맡겨도 CD금리만큼 이자가 붙는 ETF — 떨어질 때 나눠 사기 위한 총알", "안전"))
    norm(al)
    lines = [
        f"코스피가 200일 평균선 {'위' if KR_UP else '아래'}" + (f"({sg(KR_GAP)})" if KR_GAP is not None else "") + f"라 주식 {100 - cash}% · 대기 자금 {cash}%로 제안임",
        "코어는 지수 ETF 하나로 — 개별 종목을 많이 고를 필요 없이 한국 시장 전체를 담음",
        f"업종은 앱 확률 모델 상위 3개({', '.join(s['name'] for s in secs)})를 조금씩 — 한 업종에 몰지 않음",
    ]
    if not KR_UP:
        lines.append("한 번에 다 사지 말고 3번(오늘·2주 뒤·한 달 뒤)에 나눠 담는 것을 권함")
    return {
        "key": "kr_stock", "icon": "📈", "title": "국내 주식 포트폴리오", "short": "국내 주식", "color": "#e0533d",
        "sub": "한국 상장 지수 ETF + 확률 상위 업종 + 대기 자금",
        "fit": "국내 주식만 원하시는 고객 · 해외 투자가 부담스러운 고객",
        "headline": f"코스피200 코어 {al[0]['pct']:g}% + 상위 업종 {each * len(secs)}% + 대기 자금 {cash}% 제안임",
        "points": lines, "alloc": al,
        "table": {"title": "업종별 담을 종목", "cols": ["업종", "종목", "5일 뒤 오를 확률", "최근 5일"],
                  "rows": [[s["icon"] + " " + s["name"], x["name"] + " (" + x["code"] + ")", f"{x['p5']}%", sg(x["r5"])] for s in secs for x in s["stocks"]]},
        "chart": {"type": "bar", "title": "업종별 5일 뒤 오를 확률 (앱 확률 모델)", "unit": "%",
                  "labels": [s["name"] for s in secs], "vals": [s["p5"] for s in secs], "ref": 50, "refl": "동전 던지기 50%"},
        "split": None if KR_UP else [40, 30, 30],
        "risks": ["주식은 원금 손실이 날 수 있음 — 지수가 20~30% 빠지는 해도 있음",
                  f"업종 확률은 과거 2년 패턴으로 계산한 참고값임 (신뢰도: {rel or '보통'}) — 맞는다는 보장 없음",
                  "개별 종목은 지수보다 더 크게 오르내림"],
        "tags": ["한국 상장", "지수 코어", "분할 매수" if not KR_UP else "추세 유지"],
    }


# ───────── 2. 주식 — 국내 + 해외 ─────────
def base_now():
    now = ((PORT.get("rule") or {}).get("now")) or {h["name"]: h["pct"] for h in (PORT.get("hold") or [])}
    spx = now.get("S&P500 코어", 47.5)
    ndx = now.get("나스닥100 코어", 47.5)
    gold = now.get("금", 5.0)
    cash = now.get("현금·단기채", 0.0)
    return spx, ndx, gold, cash


def views():
    rows = sorted(((PORT.get("views") or {}).get("rows") or []), key=lambda r: -(r.get("pct") or 0))
    return [{"name": r.get("name"), "pct": r.get("pct"), "t": ", ".join(r.get("t") or [])} for r in rows[:4]]


def gl_alloc():
    spx, ndx, gold, cash = base_now()
    kr = 20 if KR_UP else 10
    spx2, ndx2 = spx - kr / 2, ndx - kr / 2
    al = [slot("spx", spx2, "미국 S&P500", "미국 대표 500개 기업 — 포트의 뼈대"),
          slot("ndx", ndx2, "미국 나스닥100", "애플·엔비디아·마이크로소프트 같은 기술 성장주"),
          slot("k200", kr, "한국 코스피200", "한국 대표 200개 기업 — " + ("추세가 살아 있어 비중을 늘림" if KR_UP else "추세 회복 전이라 조금만")),
          slot("gold", gold, "금", "주식이 크게 빠질 때 버팀목이 되는 보험")]
    if cash:
        al.append(slot("cd", cash, "현금·단기채", "시장이 조심 구간이라 쉬어 가는 돈", "안전"))
    return norm([a for a in al if a["pct"] > 0])


def f_gl_stock():
    al = gl_alloc()
    spx, ndx, gold, cash = base_now()
    vw = views()
    eq = sum(a["pct"] for a in al if a["k"] in ("spx", "ndx", "k200"))
    return {
        "key": "gl_stock", "icon": "🌏", "title": "국내 + 해외 주식 포트폴리오", "short": "국내+해외 주식", "color": "#2f6fdf",
        "sub": "미국 S&P500·나스닥100 코어 + 한국 + 금 — 매일 아침 시황 배분표 기준",
        "fit": "한국·미국에 고루 나눠 투자하고 싶은 고객 · 장기 자산 증식",
        "headline": f"미국 {round(al[0]['pct'] + al[1]['pct'])}% · 한국 {al[2]['pct']:g}% · 금 {gold:g}%" + (f" · 현금 {cash:g}%" if cash else "") + " 제안임",
        "points": [
            f"미국 S&P500이 200일 평균선 {'위' if US_UP else '아래'}라 " + ("주식을 꽉 채우는 「상승장 뼈대」임" if US_UP else "현금을 늘린 「조심 뼈대」임"),
            "미국 두 지수(S&P500·나스닥100)를 반씩 — 한 나라 한 업종에 몰리지 않게 함",
            f"한국은 {'추세가 살아 있어' if KR_UP else '추세 회복 전이라'} {al[2]['pct']:g}%만 · 금 {gold:g}%로 큰 하락에 대비함",
            "전부 한국 증시에 상장된 ETF라 원화로 바로 사고팔 수 있음",
        ],
        "alloc": al,
        "table": {"title": "요즘 돈이 몰리는 곳 (참고 · 배분 밖)", "cols": ["테마", "앱 의견 비중", "대표 종목·ETF"],
                  "rows": [[v["name"], f"{v['pct']}%", v["t"]] for v in vw]},
        "chart": {"type": "donut"},
        "risks": ["해외 ETF는 환율이 오르내리면 원화 수익도 같이 변함 (원화가 강해지면 손해)",
                  "주식 비중 " + f"{eq:g}%" + "는 공격적인 편임 — 1년에 −20% 이상도 가능",
                  "배분은 매일 시황 규칙으로 바뀔 수 있음 (S&P500 200일선 아래 3일이면 현금 확대)"],
        "tags": ["시황 배분표", "한국 상장 ETF", "🟢 상승장" if US_UP else "🔴 조심"],
    }


# ───────── 3. 개인연금 (연금저축) ─────────
def f_pension():
    al = gl_alloc()
    return {
        "key": "pension", "icon": "🌱", "title": "개인연금(연금저축) 포트폴리오", "short": "개인연금", "color": "#3fb28f",
        "sub": "세액공제 받으며 국내 상장 ETF로 미국·한국·금에 나눠 투자",
        "fit": "노후 준비 + 연말정산 절세를 같이 원하는 고객",
        "headline": "연금저축 계좌로 같은 배분을 — 세금은 줄이고 수익은 길게 굴리는 제안임",
        "points": [
            "연금저축은 위험자산 한도가 없어 주식형 ETF로 100% 가능함 (레버리지·인버스는 안 됨)",
            "해외 주식을 직접은 못 사서 한국에 상장된 미국 지수 ETF로 담음",
            "운용 중 생긴 수익엔 세금이 안 붙고, 나중에 연금으로 받을 때 낮은 세율(3.3~5.5%)만 냄",
            "매년 넣은 돈 600만원까지 세액공제 — 바로 아래 계산 참고",
        ],
        "alloc": al,
        "tax": {"kind": "pension", "limit": 600, "rates": [[16.5, "총급여 5,500만원 이하"], [13.2, "총급여 5,500만원 초과"]],
                "note": "연금저축 600만 + IRP 합쳐 연 900만원까지 · 2026년 현행 세법 기준(바뀔 수 있음)"},
        "chart": {"type": "donut"},
        "risks": ["55세 이후·가입 5년 이상이어야 연금으로 받을 수 있음",
                  "중간에 깨면 공제받은 세금을 기타소득세(16.5%)로 다시 냄",
                  "ETF는 원금 손실이 날 수 있음"],
        "tags": ["세액공제", "과세이연", "국내 상장 ETF"],
    }


# ───────── 4·5. 퇴직연금 DC · IRP (위험자산 70% 한도) ─────────
def retire_alloc():
    risky = [a for a in gl_alloc() if a["kind"] == "위험"]
    tot = sum(a["pct"] for a in risky) or 1
    cap = 70 if US_UP else 55
    out = []
    for a in risky:
        b = dict(a)
        b["pct"] = round(a["pct"] * min(1, cap / tot), 1)
        out.append(b)
    norm(out, min(cap, tot))
    safe = 100 - sum(a["pct"] for a in out)
    out.append(slot("corp", safe / 2, "우량 회사채", "신용 좋은 회사채에 나눠 투자 — 예금보다 조금 높은 이자", "안전"))
    out.append(slot("cd", safe / 2, "CD금리 (현금성)", "매일 이자가 붙는 현금성 ETF — 언제든 갈아탈 수 있음", "안전"))
    return norm(out), cap


def f_dc():
    al, cap = retire_alloc()
    risky = sum(a["pct"] for a in al if a["kind"] == "위험")
    return {
        "key": "dc", "icon": "🏢", "title": "퇴직연금 DC형 포트폴리오", "short": "DC", "color": "#4f8fbf",
        "sub": "회사가 넣어 준 퇴직금을 내가 굴리는 계좌 — 위험자산 70% 한도 안에서",
        "fit": "DC형 퇴직연금 가입 직장인 · 예금에만 넣어 두고 계신 분",
        "headline": f"위험자산 {risky:g}% · 안전자산 {100 - risky:g}% — 한도(70%) 안에서 시황 배분을 그대로 줄여 담는 제안임",
        "points": [
            "DC형은 운용 결과가 내 퇴직금이 됨 — 예금만 두면 물가를 못 따라갈 수 있음",
            "법으로 주식형(위험자산)은 70%까지 · 나머지 30%는 채권·현금성(안전자산)으로 채움",
            ("미국 시장이 상승 추세라 한도(70%)까지 채움" if US_UP else f"미국 시장이 조심 구간이라 위험자산을 {cap}%로 낮춤"),
            "회사가 넣는 돈과 별개로 내가 더 넣으면 IRP처럼 세액공제됨",
        ],
        "alloc": al,
        "chart": {"type": "donut", "split": True},
        "risks": ["원리금 보장 상품이 아님 — 손실이 나면 퇴직금이 줄어듦",
                  "위험자산 70% 한도는 매수할 때 기준 — 주가가 오르면 넘을 수 있어 1년에 한 번 맞춰 줌",
                  "퇴직 전 중도 인출은 무주택 주택 구입 등 법정 사유만 가능"],
        "tags": ["위험 70% 한도", "안전 30%", "연 1회 리밸런싱"],
    }


def f_irp():
    al, cap = retire_alloc()
    risky = sum(a["pct"] for a in al if a["kind"] == "위험")
    return {
        "key": "irp", "icon": "🛡️", "title": "IRP(개인형 퇴직연금) 포트폴리오", "short": "IRP", "color": "#7b5cff",
        "sub": "연 900만원까지 세액공제 · 위험자산 70% 한도",
        "fit": "연말정산 절세 + 퇴직금 운용이 필요한 고객 · 연금저축 600만원을 이미 채운 고객",
        "headline": f"IRP로 위험 {risky:g}% · 안전 {100 - risky:g}% — 세액공제 최대 148.5만원(연 900만 납입 시)과 함께 굴리는 제안임",
        "points": [
            "연금저축과 합쳐 연 900만원까지 세액공제 — 연금저축 600만 + IRP 300만 조합이 흔함",
            "퇴직금을 IRP로 받으면 퇴직소득세를 바로 안 내고 연금으로 받을 때 30~40% 덜 냄",
            "주식형은 70%까지 · 나머지는 채권·현금성 · 예금·ELB 같은 원리금보장 상품도 안전 칸에 넣을 수 있음",
            ("미국 상승 추세라 한도까지 채움" if US_UP else f"미국 조심 구간이라 위험자산 {cap}%로 낮춤"),
        ],
        "alloc": al,
        "tax": {"kind": "irp", "limit": 900, "rates": [[16.5, "총급여 5,500만원 이하"], [13.2, "총급여 5,500만원 초과"]],
                "note": "연금저축과 합산 연 900만원 · 2026년 현행 세법 기준(바뀔 수 있음)"},
        "chart": {"type": "donut", "split": True},
        "risks": ["55세 전 해지하면 세액공제 받은 금액에 16.5% 기타소득세",
                  "IRP는 일부만 찾을 수 없어(법정 사유 제외) 급한 돈은 넣지 않는 것이 좋음",
                  "ETF·채권형은 원금 손실이 날 수 있음"],
        "tags": ["세액공제 900만", "위험 70% 한도", "퇴직금 이전"],
    }


# ───────── 6. 국고채 ─────────
def bond_mix():
    """금리 시나리오 → 단기·중기·장기 비중"""
    if RATE_DOWN >= 50:
        return 20, 30, 50, "금리가 내려갈 가능성이 크다고 보여 장기채(값이 더 크게 오름) 비중을 높임"
    if RATE_UP >= 45:
        return 50, 30, 20, f"시황리포트가 「금리가 더 오르는 경우」를 {RATE_UP}%로 가장 높게 봐서 단기 위주로 안전하게 감"
    return 35, 35, 30, "금리 방향이 반반이라 단기·중기·장기를 고르게 나눔"


def f_ktb():
    ks = [b for b in (PR.get("krw") or []) if b.get("kind") == "국채" and b.get("after") is not None]
    def best(lo, hi):
        c = [b for b in ks if lo <= (b.get("yrs") or 0) + (b.get("days") or 0) / 365 < hi]
        return max(c, key=lambda b: b.get("after") or 0) if c else None
    picks = [("short", "단기 (5년 안)", best(0, 5.01)), ("mid", "중기 (5~15년)", best(5.01, 15)), ("long", "장기 (15년 넘게)", best(15, 99))]
    s, m, l = bond_mix()[:3]
    why = bond_mix()[3]
    pcts = {"short": s, "mid": m, "long": l}
    al, rows = [], []
    for k, lab, b in picks:
        if not b:
            continue
        yrs = (b.get("yrs") or 0) + (b.get("days") or 0) / 365
        al.append({"k": k, "pct": pcts[k], "name": lab, "code": b.get("code"), "inst": b.get("name"), "us": None,
                   "why": f"세후 {b['after']:.2f}% (은행 예금으로 치면 {b['bank']:.2f}%) · 만기 {b['mat']}", "kind": "안전", "color": C[k],
                   "y": b.get("after"), "bank": b.get("bank"), "buy": b.get("buy"), "px": b.get("px"), "mat": b.get("mat"), "yrs": round(yrs, 1), "cpn": b.get("cpn")})
        rows.append([lab, b.get("name"), f"{b['buy']:.3f}%", f"{b['after']:.2f}%", f"{b['bank']:.2f}%", b.get("mat"), f"{comma(b.get('px'))}원"])
    tot = sum(a["pct"] for a in al) or 1
    for a in al:
        a["pct"] = a["pct"] * 100 / tot
    norm(al)
    avg = sum(a["pct"] * (a.get("y") or 0) for a in al) / 100 if al else None
    avgb = sum(a["pct"] * (a.get("bank") or 0) for a in al) / 100 if al else None
    curve = sorted(ks, key=lambda b: (b.get("yrs") or 0) + (b.get("days") or 0) / 365)
    return {
        "key": "ktb", "icon": "🏛️", "title": "국고채 투자 제안", "short": "국고채", "color": "#1f9fb5",
        "sub": "대한민국 정부가 갚는 가장 안전한 채권 — 세후 수익률 높은 것으로",
        "fit": "예금보다 높은 이자 + 원금 안정성을 원하는 고객 · 금융소득종합과세 대상 고객",
        "headline": (f"국고채 3개로 나눠 평균 세후 {avg:.2f}%(예금 환산 {avgb:.2f}%) 제안임" if avg else "국고채 제안임"),
        "points": [
            why,
            "표면금리가 낮은 옛날 국고채는 싸게 사서 만기에 액면을 받는 차익이 비과세 → 세후 수익률이 높음",
            "중간에 팔 수도 있음 — 금리가 내리면 값이 올라 이자 + 차익을 같이 얻음",
            f"미래에셋증권이 지금 파는 국고채 {len(ks)}개 중 기간별 세후 1등만 골랐음",
        ],
        "alloc": al,
        "avg": r1(avg, 2), "avg_bank": r1(avgb, 2),
        "table": {"title": "고른 국고채", "cols": ["구분", "종목", "매수 금리", "세후", "예금 환산", "만기", "단가(1만원당)"], "rows": rows},
        "chart": {"type": "bar", "title": "남은 기간별 세후 수익률 (지금 파는 국고채)", "unit": "%",
                  "labels": [f"{(b.get('yrs') or 0)}년" for b in curve], "vals": [b.get("after") for b in curve],
                  "hl": [b.get("name") in [a["inst"] for a in al] for b in curve]},
        "risks": ["만기 전에 팔면 그날 금리에 따라 이익·손실이 날 수 있음 (금리가 오르면 값이 내림)",
                  "장기채일수록 금리 변화에 값이 크게 움직임",
                  "예금자보호 대상은 아니지만 정부가 원리금을 갚음"],
        "tags": ["정부 보증", "분리과세 X · 차익 비과세", "기간 분산"],
    }


# ───────── 7. 미국채 ─────────
def f_ust():
    u = PR.get("ust") or {}
    it = sorted(u.get("items") or [], key=lambda b: b.get("mat") or "")
    def yrs(b):
        try:
            return (dt.date.fromisoformat(b["mat"]) - NOW.date()).days / 365.25
        except Exception:
            return 0
    def best(lo, hi):
        c = [b for b in it if lo <= yrs(b) < hi]
        return max(c, key=lambda b: b.get("ytm") or 0) if c else None
    s, m, l, why = bond_mix()
    picks = [("short", "단기 (3년 안)", best(0, 3), s), ("mid", "중기 (3~12년)", best(3, 12), m), ("long", "장기 (12년 넘게)", best(12, 99), l)]
    al, rows = [], []
    for k, lab, b, p in picks:
        if not b:
            continue
        al.append({"k": k, "pct": p, "name": lab, "code": None, "inst": b.get("name"), "us": None,
                   "why": f"달러 기준 연 {b['ytm']:.2f}% · 표면금리 {b['cpn']}% · 만기 {b['mat']}", "kind": "안전", "color": C[k],
                   "y": b.get("ytm"), "mat": b.get("mat"), "cpn": b.get("cpn"), "yrs": round(yrs(b), 1)})
        rows.append([lab, b.get("name"), f"{b['cpn']}%", f"{b['ytm']:.2f}%", b.get("mat"), f"{yrs(b):.1f}년"])
    tot = sum(a["pct"] for a in al) or 1
    for a in al:
        a["pct"] = a["pct"] * 100 / tot
    norm(al)
    avg = sum(a["pct"] * (a.get("y") or 0) for a in al) / 100 if al else None
    h = (PR.get("ust_hist") or {})
    y10 = (h.get("y10") or [])[-260:]
    fxh = (h.get("usdkrw") or [])[-260:]
    return {
        "key": "ust", "icon": "💵", "title": "미국 국채 투자 제안", "short": "미국채", "color": "#2f6fdf",
        "sub": "세계에서 가장 안전한 달러 자산 — 이자 + 환율 두 가지로 수익",
        "fit": "달러 자산을 늘리고 싶은 고객 · 원화 약세(환율 상승)에 대비하려는 고객",
        "headline": (f"미국채 {len(al)}개로 나눠 달러 기준 평균 연 {avg:.2f}% 제안임" if avg else "미국채 제안임"),
        "points": [
            why,
            f"지금 미국 10년 금리 {US10:.2f}% · 달러 {comma(FX, 1)}원" if US10 and FX else "미국 금리·환율은 매일 바뀜",
            "표면금리가 낮은 채권은 싸게 사서 만기 차익이 커 세금이 유리함 (차익·환차익 비과세, 이자만 15.4%)",
            "원화가 약해지면(환율 상승) 환차익이 더해지는 「보험」 역할을 함",
        ],
        "alloc": al,
        "avg": r1(avg, 2), "fx": r1(FX, 1),
        "table": {"title": "고른 미국채 (미래에셋 판매정보 " + md(u.get("date")) + ")", "cols": ["구분", "종목", "표면금리", "달러 수익률", "만기", "남은 기간"], "rows": rows},
        "chart": {"type": "line", "title": "미국 10년 국채금리 · 1년", "unit": "%", "labels": [x[0] for x in y10], "vals": [x[1] for x in y10],
                  "chart2": {"title": "달러·원 환율 · 1년", "unit": "원", "labels": [x[0] for x in fxh], "vals": [x[1] for x in fxh]}},
        "risks": ["환율이 내리면(원화 강세) 원화로 바꿀 때 손해가 날 수 있음",
                  "만기 전에 팔면 금리에 따라 값이 오르내림",
                  "장외 거래라 최소 금액·매매 시간이 정해져 있음"],
        "tags": ["달러 자산", "AA+ 국가", "환차익 비과세"],
    }


# ───────── 8. 브라질 국채 ─────────
def f_brl():
    anb = PR.get("anb") or []
    ntnf = sorted([a for a in anb if a.get("code") == "NTN-F"], key=lambda a: a.get("mat"))
    pick = None
    for a in ntnf:     # 5~9년 사이 가장 높은 금리 (미래에셋이 흔히 파는 구간)
        y = int(a["mat"][:4]) - NOW.year
        if 4 <= y <= 9 and (pick is None or a["r"] > pick["r"]):
            pick = a
    pick = pick or (ntnf[len(ntnf) // 2] if ntnf else None)
    usd = sorted(BL.get("usd") or [], key=lambda b: -(b.get("ytm") or 0))
    upk = None
    for b in sorted(BL.get("usd") or [], key=lambda b: b.get("mat") or ""):
        y = int(b["mat"][:4]) - NOW.year
        if 3 <= y <= 12:
            upk = b if upk is None or b["ytm"] > upk["ytm"] else upk
    upk = upk or (usd[0] if usd else None)
    al = []
    if pick:
        al.append({"k": "brlf", "pct": 70, "name": "헤알 국채 NTN-F", "code": None, "inst": f"NTN-F {pick['mat'][:4]}년 1월 만기 (연 10% 이표)", "us": None,
                   "why": f"헤알 기준 연 {pick['r']:.2f}% · 개인 이자·차익·환차익 비과세(한-브라질 조세협약)", "kind": "위험", "color": "#22a06b", "y": r1(pick["r"], 2), "mat": pick["mat"]})
    if upk:
        al.append({"k": "brlu", "pct": 30, "name": "달러표시 브라질 국채", "code": upk.get("isin"), "inst": upk.get("name"), "us": None,
                   "why": f"달러 기준 연 {upk['ytm']:.2f}% · 헤알 환율 걱정 없이 달러로 받음 (세금은 창구 확인)", "kind": "위험", "color": "#e6a817", "y": r1(upk["ytm"], 2), "mat": upk.get("mat")})
    tot = sum(a["pct"] for a in al) or 1
    for a in al:
        a["pct"] = a["pct"] * 100 / tot
    norm(al)
    fx = (PR.get("brl") or {}).get("fx") or []
    fx = fx[-260:]
    f1 = fx[0][1] if fx else None
    fN = fx[-1][1] if fx else None
    ntn_rows = [["NTN-F " + a["mat"][:4], "연 10% · 6개월마다", f"{a['r']:.2f}%", a["mat"]] for a in ntnf]
    return {
        "key": "brl", "icon": "💱", "title": "브라질 국채 투자 제안", "short": "브라질국채", "color": "#22a06b",
        "sub": "높은 이자(연 14~15%) + 개인 비과세 — 대신 환율이 크게 움직임",
        "fit": "금융소득종합과세가 부담인 자산가 · 높은 이자를 원하고 환율 변동을 견딜 수 있는 고객",
        "headline": (f"헤알 국채(연 {pick['r']:.1f}%) {al[0]['pct']:g}% + 달러표시({upk['ytm']:.1f}%) {al[-1]['pct']:g}% — 전체 자산의 10~20% 안에서 제안임" if pick and upk else "브라질 국채 제안임"),
        "points": [
            f"브라질 10년 금리 {BR10:.2f}% — 한국·미국보다 3배 가까이 높은 이자" if BR10 else "브라질 금리는 한국·미국보다 훨씬 높음",
            "한-브라질 조세협약으로 개인은 이자·매매차익·환차익 모두 비과세 → 금융소득종합과세에 안 잡힘",
            f"다만 헤알 환율이 1년 새 {sg((fN / f1 - 1) * 100) if f1 and fN else '크게'} 움직였음 — 환율이 이자를 까먹을 수 있어 일부를 달러표시로 섞음",
            "6개월마다 이자가 나와 생활비 계좌로 쓰기 좋음",
        ],
        "alloc": al,
        "fx": r1(fN, 2), "usdbrl": r1(USDBRL, 4),
        "table": {"title": "헤알 국채 NTN-F 금리 (ANBIMA " + md(pick["asof"] if pick else "") + ")", "cols": ["종목", "이자", "금리", "만기"], "rows": ntn_rows},
        "chart": {"type": "line", "title": "헤알·원 환율 · 1년 (원/헤알 100단위)", "unit": "원", "labels": [x[0] for x in fx], "vals": [x[1] for x in fx]},
        "risks": ["투기등급(BB) 국가 — 신용 위험이 선진국보다 큼",
                  "헤알 환율이 20~30% 빠진 해도 있음 → 원화 기준 원금 손실 가능",
                  "조세협약·세법이 바뀌면 비과세가 달라질 수 있음 · 달러표시채 세금은 창구 확인"],
        "tags": ["비과세(개인)", "고금리", "환율 위험 큼"],
    }


# ───────── 9. ELS ─────────
INDEX_UA = {"KOSPI200", "S&P500", "EuroStoxx50", "Nikkei225", "HSCEI"}


def f_els():
    E = [e for e in (PR.get("els") or []) if e.get("cpn") is not None]
    elb = sorted([e for e in E if e.get("t") == "ELB" or (e.get("pp") or 0) >= 100], key=lambda e: -(e.get("cpn") or 0))
    idx = [e for e in E if e.get("t") == "ELS" and all(u.strip() in INDEX_UA for u in (e.get("ua") or "").split(","))]
    idx = sorted(idx, key=lambda e: (-(e.get("cpn") or 0) / max(1, (e.get("ki") or 50)) * 40, ))
    idx_safe = sorted(idx, key=lambda e: ((e.get("ki") or 100), -(e.get("cpn") or 0)))
    stk = sorted([e for e in E if e.get("t") == "ELS" and e not in idx], key=lambda e: -(e.get("cpn") or 0))
    picks = []
    if elb:
        picks.append(("elb", "원금지급형 ELB", elb[0], 40, "#3fb28f", "원금을 지키면서 조건이 맞으면 높은 이자"))
    used = set()
    for e in idx_safe[:1] + sorted(idx, key=lambda e: -(e.get("cpn") or 0))[:2]:
        if e["isin"] in used:
            continue
        used.add(e["isin"])
        picks.append(("idx%d" % len(used), "지수형 ELS", e, 0, "#2f6fdf" if len(used) == 1 else "#7b5cff", "개별 회사가 아닌 나라 대표 지수에 걸어 상대적으로 안정적"))
        if len(used) >= 2:
            break
    left = 100 - sum(p[3] for p in picks)
    ni = sum(1 for p in picks if p[0].startswith("idx")) or 1
    picks = [(a, b, c, (left / ni if a.startswith("idx") else d), e, f) for a, b, c, d, e, f in picks]
    al = []
    for k, lab, e, p, col, why in picks:
        ki = e.get("ki")
        al.append({"k": k, "pct": round(p, 1), "name": lab, "code": e.get("isin"), "inst": e.get("n"), "us": None,
                   "why": f"연 {e['cpn']:g}% · 기초자산 {e.get('ua')} · " + (f"손실 기준선(KI) {ki:g}%" if ki else "원금 지급형") + f" · 청약 마감 {md(e.get('e'))}",
                   "kind": "안전" if k == "elb" else "위험", "color": col, "y": e.get("cpn"), "ua": e.get("ua"), "ki": ki, "desc": strip(e.get("desc")), "mat": e.get("mat"), "cyc": e.get("cyc"), "end": e.get("e")})
    norm(al)
    rows = [[e.get("n"), e.get("ua"), f"{e['cpn']:g}%", (f"{e['ki']:g}%" if e.get("ki") else "원금지급"), strip(e.get("desc"))[:30], md(e.get("e"))] for e in sorted(E, key=lambda e: -(e.get("cpn") or 0))]
    avg = sum(a["pct"] * (a.get("y") or 0) for a in al) / 100 if al else None
    stk_line = (f"종목형(예: {stk[0].get('ua')}, 연 {stk[0]['cpn']:g}%)은 이자가 높은 만큼 손실 위험도 커서 이번 제안에선 뺐음") if stk else "종목형 ELS는 이번 제안에서 뺐음"
    return {
        "key": "els", "icon": "🎯", "title": "ELS · ELB 투자 제안", "short": "ELS", "color": "#f08a3c",
        "sub": "지금 청약 중인 상품 중 — 원금지급형 + 지수형으로 나눠 담기",
        "fit": "예금보다 높은 이자를 원하고 3년 정도 묶어 둘 수 있는 고객",
        "headline": (f"ELB {al[0]['pct']:g}% + 지수형 ELS {100 - al[0]['pct']:g}% · 조건 충족 시 평균 연 {avg:.1f}% 제안임" if al and al[0]["k"] == "elb" and avg else "ELS 제안임"),
        "points": [
            "ELS는 「주가가 많이 안 떨어지면 약속한 이자를 주는」 상품 — 6개월마다 조건을 봄",
            "원금지급형 ELB를 섞어 원금 손실 가능성을 낮춤",
            "지수형(코스피200·S&P500 등)은 개별 회사보다 덜 흔들림",
            stk_line,
        ],
        "alloc": al,
        "avg": r1(avg, 2),
        "table": {"title": f"지금 청약 중인 ELS·ELB {len(E)}개 (이자 높은 순)", "cols": ["상품", "기초자산", "연 이자", "손실 기준선", "구조", "마감"], "rows": rows},
        "chart": {"type": "bar", "title": "지금 청약 중인 상품 연 이자", "unit": "%", "labels": [e.get("n", "").replace("미래에셋증권", "").strip("()") for e in sorted(E, key=lambda e: -(e.get("cpn") or 0))],
                  "vals": [e.get("cpn") for e in sorted(E, key=lambda e: -(e.get("cpn") or 0))], "hl": [e.get("n") in [a["inst"] for a in al] for e in sorted(E, key=lambda e: -(e.get("cpn") or 0))]},
        "risks": ["ELS는 원금 보장이 안 됨 — 기초자산이 손실 기준선(KI) 아래로 떨어지고 만기에 회복 못 하면 크게 손실",
                  "6개월마다 조건이 안 맞으면 다음으로 미뤄지고, 최대 3년 묶일 수 있음",
                  "예금자보호 대상 아님 · 발행사(증권사) 신용 위험이 있음"],
        "tags": ["청약 마감 " + md(al[0]["end"]) if al else "청약 중", "원금지급형 섞음", "지수형"],
    }


def main():
    forms = []
    for f in (f_kr_stock, f_gl_stock, f_pension, f_dc, f_irp, f_ktb, f_ust, f_brl, f_els):
        try:
            x = f()
            if x and x.get("alloc"):
                forms.append(x)
        except Exception as e:
            print("기본폼 실패", f.__name__, repr(e))
    out = {
        "at": NOW.strftime("%Y-%m-%d %H:%M"),
        "basis": f"{md(D.get('date'))} 아침 시황 · 상품 {str(PR.get('updated') or '')[5:16].replace('-', '/')} · 시세 {PB.get('label') or ''}",
        "market": market_block(),
        "forms": forms,
        "notice": ["본 자료는 투자 권유를 위한 참고 자료이며, 투자 결과에 대한 책임은 투자자 본인에게 있음",
                   "금융투자상품은 예금자보호법에 따라 보호되지 않으며 원금 손실이 발생할 수 있음",
                   "과거 수익률·확률은 미래 수익을 보장하지 않음 · 세제는 현행 기준이며 바뀔 수 있음",
                   "가입 전 상품설명서·투자설명서를 반드시 읽어 보시기 바람"],
        "note": "AI 없이 시황·포트·상품 자료를 규칙으로 조립 · 매일 아침 + 장중 갱신",
    }
    os.makedirs(X, exist_ok=True)
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, OUT)
    print("제안서 기본폼", len(forms), "종 →", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
