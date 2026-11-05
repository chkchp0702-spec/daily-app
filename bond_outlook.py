"""
📄 채권 전망 보고서 — 🇰🇷 국채 · 🇺🇸 미국채 · 🇧🇷 브라질국채 (11/05 사용자)
  「상품 › 채권에서 국채·미국채·브라질국채를 고르면, 시황에 맞춘 전망 보고서를 매일 아침 미리 만들어 두고
    탭하면 바로 볼 수 있게 — 한 장짜리랑 PDF 풀버전 둘 다」

  재료(모두 이미 매일 아침 만들어지는 것 — AI·돈 없음):
    archive/x/proposal.json  — 매일 아침 시황 리포트(market: 한 줄·이야기·시나리오·일정) + 상품별 시장 분석(forms[ktb|ust|brl].mkt·sim·scen)
    archive/x/brl_live.json  — 브라질 달러표시 국채 실시간 수익률
  만드는 것: archive/x/bond_outlook/{ktb,ust,brl}.pdf (A4 풀버전 7쪽) · {key}.jpg (휴대폰 한 장 1080×1920) · index.json (앱 카드용 한 줄)
  사용: python bond_outlook.py [--html-only] [--force]   (렌더는 playwright 크롬)
"""
import datetime as dt
import json
import math
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "archive", "x", "bond_outlook")
KEYS = ["ktb", "ust", "brl"]
META = {
    "ktb": {"flag": "🇰🇷", "name": "국채", "full": "한국 국채", "color": "#1f9fb5", "cur": "KRW"},
    "ust": {"flag": "🇺🇸", "name": "미국채", "full": "미국 국채", "color": "#2f6fdf", "cur": "USD"},
    "brl": {"flag": "🇧🇷", "name": "브라질국채", "full": "브라질 국채", "color": "#22a06b", "cur": "BRL"},
}
UP, DN = "#d6453d", "#2f6fdf"   # 한국식: 오름 빨강 · 내림 파랑


def jl(p, d=None):
    try:
        return json.load(open(os.path.join(ROOT, p), encoding="utf-8"))
    except Exception:
        return d


def esc(s):
    return str("" if s is None else s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def f1(v, d=1):
    return "–" if v is None else ("%." + str(d) + "f") % v


def sg(v, d=1):
    if v is None:
        return "–"
    return ("+" if v > 0 else "−" if v < 0 else "") + ("%." + str(d) + "f") % abs(v)


def won(v):
    """원 → 「1억 2,340만원」"""
    v = int(round(v))
    neg = v < 0
    v = abs(v)
    e, m = divmod(v, 100000000)
    m = m // 10000
    s = (("%d억" % e) if e else "") + ((" %s만" % format(m, ",")) if m else "")
    return ("−" if neg else "") + (s.strip() or "0") + "원"


def rank(vals, v):
    vals = [x for x in vals if x is not None]
    if not vals or v is None:
        return None
    return round(100.0 * sum(1 for x in vals if x <= v) / len(vals))


def std(a):
    a = [x for x in a if x is not None]
    if len(a) < 3:
        return None
    m = sum(a) / len(a)
    return math.sqrt(sum((x - m) ** 2 for x in a) / (len(a) - 1))


def chart_by(form, word):
    for c in (form.get("mkt") or {}).get("charts") or []:
        if word in c.get("title", ""):
            return c
    return None


def despike(c, lim, win=4):
    """하루짜리 자료 튐(앞뒤와 동떨어진 값)을 지움 — 그림·변동폭이 이상치에 끌려가지 않게."""
    if not c or not c.get("vals"):
        return c
    v = list(c["vals"])
    out = []
    for i, x in enumerate(v):
        if x is None or i >= len(v) - 5:   # 최근 5개는 그대로(지금 값을 지우지 않게)
            out.append(x); continue
        w = sorted(y for y in v[max(0, i - win):i + win + 1] if y is not None)
        med = w[len(w) // 2]
        out.append(None if abs(x - med) > lim else x)
    d = dict(c); d["vals"] = out
    return d


def yearly_sigma(c, monthly=False):
    """1년 변동폭(표준편차) — 일봉이면 하루 변화 × √252, 월봉이면 12개월 변화."""
    v = [x for x in (c or {}).get("vals") or [] if x is not None]
    if len(v) < 20:
        return None
    if monthly:
        ch = [v[i] - v[i - 12] for i in range(12, len(v))]
        return std(ch)
    ch = [v[i] - v[i - 1] for i in range(1, len(v))]
    s = std(ch)
    return s * math.sqrt(252) if s else None


def fx_sigma_pct(c):
    v = [x for x in (c or {}).get("vals") or [] if x]
    if len(v) < 20:
        return None
    ch = [math.log(v[i] / v[i - 1]) for i in range(1, len(v))]
    s = std(ch)
    return s * math.sqrt(252) * 100 if s else None


# ───────── 그림 (SVG) ─────────
def svg_line(c, w=640, h=230, color="#2f6fdf", unit="%", d=2, mark=True, xlab=5):
    lab, val = c.get("labels") or [], c.get("vals") or []
    pts = [(i, v) for i, v in enumerate(val) if v is not None]
    if len(pts) < 2:
        return ""
    lo, hi = min(p[1] for p in pts), max(p[1] for p in pts)
    pad = (hi - lo) * 0.12 or 0.1
    lo, hi = lo - pad, hi + pad
    L, R, T, B = 52, 70, 14, 26
    X = lambda i: L + i / max(1, len(val) - 1) * (w - L - R)
    Y = lambda v: T + (1 - (v - lo) / (hi - lo)) * (h - T - B)
    s = '<svg viewBox="0 0 %d %d" class="ch">' % (w, h)
    for k in range(5):
        v = lo + (hi - lo) * k / 4
        y = Y(v)
        s += '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" class="gl"/><text x="%d" y="%.1f" class="tx" text-anchor="end">%s</text>' % (L, w - R, y, y, L - 6, y + 4, ("%." + str(d if unit == "%" else 0) + "f") % v)
    n = len(lab)
    for k in range(xlab):
        i = int(round(k * (n - 1) / max(1, xlab - 1)))
        t = str(lab[i])[:7].replace("-", ".") if lab else ""
        s += '<text x="%.1f" y="%d" class="tx" text-anchor="%s">%s</text>' % (X(i), h - 6, "start" if k == 0 else "end" if k == xlab - 1 else "middle", esc(t))
    path = " ".join(("M" if j == 0 else "L") + "%.1f,%.1f" % (X(i), Y(v)) for j, (i, v) in enumerate(pts))
    area = path + " L%.1f,%.1f L%.1f,%.1f Z" % (X(pts[-1][0]), h - B, X(pts[0][0]), h - B)
    s += '<path d="%s" fill="%s" opacity=".08"/>' % (area, color)
    s += '<path d="%s" fill="none" stroke="%s" stroke-width="2.4" stroke-linejoin="round"/>' % (path, color)
    if mark:
        i, v = pts[-1]
        mi = min(pts, key=lambda p: p[1])
        ma = max(pts, key=lambda p: p[1])
        for (pi, pv, tag, col) in ((ma[0], ma[1], "최고", UP), (mi[0], mi[1], "최저", DN)):
            s += '<circle cx="%.1f" cy="%.1f" r="3.5" fill="%s"/><text x="%.1f" y="%.1f" class="tm" fill="%s" text-anchor="middle">%s %s</text>' % (X(pi), Y(pv), col, X(pi), Y(pv) + (-8 if tag == "최고" else 16), col, tag, ("%." + str(d if unit == "%" else 0) + "f") % pv)
        s += '<circle cx="%.1f" cy="%.1f" r="6" fill="%s" stroke="#fff" stroke-width="2.5"/>' % (X(i), Y(v), color)
        s += '<text x="%.1f" y="%.1f" class="now" fill="%s" text-anchor="end">지금 %s</text>' % (X(i) - 10, Y(v) - 12, color, ("%." + str(d if unit == "%" else 1) + "f") % v + unit)
    return s + "</svg>"


def svg_curve(xs, ys, w=640, h=230, color="#2f6fdf", hl=None, xmax=None):
    pts = sorted([(x, y) for x, y in zip(xs, ys) if x is not None and y is not None])
    if len(pts) < 2:
        return ""
    xmax = xmax or max(p[0] for p in pts)
    lo, hi = min(p[1] for p in pts), max(p[1] for p in pts)
    pad = (hi - lo) * 0.18 or 0.2
    lo, hi = lo - pad, hi + pad
    L, R, T, B = 52, 20, 14, 30
    X = lambda x: L + math.log(1 + x) / math.log(1 + xmax) * (w - L - R)
    Y = lambda v: T + (1 - (v - lo) / (hi - lo)) * (h - T - B)
    s = '<svg viewBox="0 0 %d %d" class="ch">' % (w, h)
    for k in range(5):
        v = lo + (hi - lo) * k / 4
        s += '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" class="gl"/><text x="%d" y="%.1f" class="tx" text-anchor="end">%.2f</text>' % (L, w - R, Y(v), Y(v), L - 6, Y(v) + 4, v)
    for t in [1, 2, 3, 5, 10, 20, 30]:
        if t <= xmax * 1.02:
            s += '<line x1="%.1f" x2="%.1f" y1="%d" y2="%d" class="gl gv"/><text x="%.1f" y="%d" class="tx" text-anchor="middle">%d년</text>' % (X(t), X(t), T, h - B, X(t), h - 10, t)
    # 추세선: log(1+만기)에 2차 맞춤 (종목마다 들쭉날쭉한 점을 잇지 않음)
    Ls = [math.log(1 + x) for x, _ in pts]
    n = len(pts)
    if n >= 4 and max(Ls) - min(Ls) > 0.3:
        SS = [[sum(l ** (i + j) for l in Ls) for j in range(3)] for i in range(3)]
        TT = [sum(y * l ** i for l, (_, y) in zip(Ls, pts)) for i in range(3)]
        def det(m):
            return (m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]))
        D = det(SS)
        if abs(D) > 1e-9:
            co = []
            for k in range(3):
                m = [row[:] for row in SS]
                for r in range(3):
                    m[r][k] = TT[r]
                co.append(det(m) / D)
            x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
            line = []
            for t in range(41):
                x = x0 + (x1 - x0) * t / 40
                l = math.log(1 + x)
                line.append((x, max(lo, min(hi, co[0] + co[1] * l + co[2] * l * l))))
        else:
            line = pts
    else:
        line = pts
    s += '<path d="%s" fill="none" stroke="%s" stroke-width="2.2" opacity=".55"/>' % (" ".join(("M" if j == 0 else "L") + "%.1f,%.1f" % (X(x), Y(y)) for j, (x, y) in enumerate(line)), color)
    for x, y in pts:
        s += '<circle cx="%.1f" cy="%.1f" r="3.4" fill="%s" opacity=".75"/>' % (X(x), Y(y), color)
    for (x, y, t) in (hl or []):
        if x is None or y is None:
            continue
        s += '<circle cx="%.1f" cy="%.1f" r="8" fill="none" stroke="#e6a817" stroke-width="3"/><text x="%.1f" y="%.1f" class="tm" fill="#b7791f" text-anchor="middle">%s</text>' % (X(x), Y(y), X(x), Y(y) - 13, esc(t))
    return s + "</svg>"


def svg_scen_bars(groups, series, w=640, h=250):
    """groups = [(라벨, 색)], series = [(이름, [값…], 색)] — 1년 뒤 수익률 막대"""
    allv = [v for _, vs, _ in series for v in vs if v is not None] + [0]
    lo, hi = min(allv), max(allv)
    span = max(hi - lo, 1)
    lo, hi = lo - span * 0.15, hi + span * 0.18
    L, R, T, B = 46, 12, 18, 44
    Y = lambda v: T + (1 - (v - lo) / (hi - lo)) * (h - T - B)
    gw = (w - L - R) / len(groups)
    bw = min(34, gw * 0.8 / max(1, len(series)))
    s = '<svg viewBox="0 0 %d %d" class="ch">' % (w, h)
    s += '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="#9aa3b2" stroke-width="1.2"/>' % (L, w - R, Y(0), Y(0))
    for gi, (g, gc) in enumerate(groups):
        cx = L + gw * gi + gw / 2
        s += '<text x="%.1f" y="%d" class="tg" text-anchor="middle" fill="%s">%s</text>' % (cx, h - 22, gc, esc(g[0]))
        s += '<text x="%.1f" y="%d" class="tx" text-anchor="middle">%s</text>' % (cx, h - 6, esc(g[1]))
        x0 = cx - bw * len(series) / 2
        for si, (nm, vs, col) in enumerate(series):
            v = vs[gi]
            if v is None:
                continue
            x = x0 + si * bw
            y0, y1 = Y(max(v, 0)), Y(min(v, 0))
            s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="4" fill="%s"/>' % (x + 2, y0, bw - 4, max(1.5, y1 - y0), col)
            s += '<text x="%.1f" y="%.1f" class="tv" text-anchor="middle" fill="%s">%s</text>' % (x + bw / 2, (y0 - 5) if v >= 0 else (y1 + 13), UP if v >= 0 else DN, sg(v))
    return s + "</svg>"


def gauge(p, lo_txt="가장 낮음", hi_txt="가장 높음", color="#2f6fdf"):
    if p is None:
        return ""
    return ('<div class="gauge"><div class="gbar"><i style="left:%d%%;background:%s"></i></div>'
            '<div class="glab"><span>%s</span><b style="left:%d%%;color:%s">%d%% 높이</b><span>%s</span></div></div>') % (p, color, lo_txt, p, color, p, hi_txt)


# ───────── 계산 ─────────
def scen_moves(key, sig_y, sig_fx):
    """시황 리포트 세 시나리오 → 1년 금리 변화(%p)·환율 변화(%) 가정. σ = 지난 자료의 1년 변동폭."""
    sy = sig_y or 0.6
    sf = sig_fx or 8.0
    # (금리 배수, 환율 배수) — 환율은 「원화로 바꿀 때」 기준: + 면 외화 강세(투자자 이익)
    tbl = {
        "A": (0.6, {"ust": 0.4, "brl": -0.6}),
        "B": (0.15, {"ust": -0.25, "brl": 0.4}),
        "C": (-0.9, {"ust": 0.35, "brl": -0.8}),
    }
    out = {}
    for code, (my, mf) in tbl.items():
        out[code] = (round(my * sy, 2), round(mf.get(key, 0) * sf, 1) if key != "ktb" else 0.0)
    return out


def scen_code(label):
    return "A" if "오르" in label else "C" if ("식" in label or "둔화" in label or "침체" in label) else "B"


def ret1y(pick, dy, dfx, key):
    """1년 들고 있을 때 수익률(원화 기준, 세전 근사): 이자 − 듀레이션 × 금리 변화, 외화면 환율 변화 곱함."""
    y = pick.get("y") or 0
    if pick.get("cur") == "USD" and key == "brl":
        dyy = dy * 0.6   # 달러표시 브라질채는 헤알채보다 금리 변화가 작게 전달된다고 가정
    else:
        dyy = dy
    loc = y - (pick.get("dur") or 0) * dyy
    if pick.get("cur") == "KRW":
        return loc
    fx = dfx
    if key == "brl" and pick.get("cur") == "USD":
        fx = dfx * 0.35   # 달러 채권은 원/달러에 따름 — 헤알 충격의 일부만
    return ((1 + loc / 100) * (1 + fx / 100) - 1) * 100


def after_y(p):
    if p.get("after") is not None:
        return p["after"]
    y = p.get("y") or 0
    t = (p.get("tax_int") or 0) / 100
    cpn = p.get("cpn_eff") or p.get("cpn") or 0
    return y - cpn * t * (1 / max(p.get("p") or 1, 0.3))


def build(key, P, BL):
    form = next((f for f in P.get("forms", []) if f.get("key") == key), None)
    if not form:
        return None
    M = META[key]
    mk = form.get("mkt") or {}
    mkt = P.get("market") or {}
    picks = (form.get("sim") or {}).get("picks") or []
    if not picks:
        return None
    scen_rows = ((form.get("scen") or {}).get("rows")) or []
    # 금리 줄 · 환율 줄
    if key == "ktb":
        rc = chart_by(form, "10년")
        sig_y = yearly_sigma(rc, monthly=True)
        fc = None
    elif key == "ust":
        rc = chart_by(form, "10년")
        sig_y = yearly_sigma(rc)
        fc = chart_by(form, "환율")
    else:
        rc = chart_by(form, "NTN-F") or chart_by(form, "LTN")
        sig_y = yearly_sigma(rc)
        fc = chart_by(form, "환율")
    if key == "ust":
        rc = despike(rc, 0.6)   # 브라질은 실제로 크게 튀는 날이 있어 손대지 않음(변동폭만 위·아래 한도)
    sig_fx = fx_sigma_pct(fc) if fc else None
    cap = {"ktb": (0.3, 0.9), "ust": (0.4, 1.1), "brl": (0.8, 2.0)}[key]
    if sig_y is not None:
        sig_y = max(cap[0], min(cap[1], sig_y))   # 자료 튐(하루 이상치)에 가정이 끌려가지 않게
    if sig_fx is not None:
        sig_fx = max(4.0, min(18.0, sig_fx))
    rv = [v for v in (rc or {}).get("vals") or [] if v is not None]
    r_now = rv[-1] if rv else None
    r_pos = rank(rv, r_now)
    fv = [v for v in (fc or {}).get("vals") or [] if v]
    fx_now = fv[-1] if fv else None
    fx_pos = rank(fv, fx_now)
    moves = scen_moves(key, sig_y, sig_fx)
    # 시나리오별 1년 수익률 (원화)
    S = []
    for r in scen_rows:
        c = scen_code(r.get("label", ""))
        dy, dfx = moves[c]
        per = [ret1y(p, dy, dfx, key) for p in picks]
        port = sum(v * (p.get("pct") or 0) / 100 for v, p in zip(per, picks))
        S.append({"code": c, "label": r.get("label"), "pct": r.get("pct") or 0, "color": r.get("color") or "#888", "plain": r.get("plain"),
                  "impact": r.get("impact"), "why": r.get("why"), "dy": dy, "dfx": dfx, "per": per, "port": port})
    tot = sum(s["pct"] for s in S) or 1
    E = sum(s["port"] * s["pct"] for s in S) / tot
    Eper = [sum(s["per"][i] * s["pct"] for s in S) / tot for i in range(len(picks))]
    avg_y = sum((p.get("y") or 0) * (p.get("pct") or 0) for p in picks) / 100
    up = max([s["pct"] for s in S if s["code"] == "A"] or [0])
    down = max([s["pct"] for s in S if s["code"] == "C"] or [0])
    worst = min(S, key=lambda s: s["port"]) if S else None
    # 판정
    if r_pos is not None and r_pos >= 60 and E >= 0.7 * avg_y:
        verdict, vcol, vtag = "담기 좋은 자리", "#16a34a", "🟢"
    elif E >= 0:
        verdict, vcol, vtag = "나눠서 담기", "#d99a06", "🟡"
    else:
        verdict, vcol, vtag = "서두를 필요 없음", "#6b7280", "⚪"
    if key == "brl" and fx_pos is not None and fx_pos >= 80 and verdict == "담기 좋은 자리":
        verdict, vcol, vtag = "나눠서 담기", "#d99a06", "🟡"   # 헤알이 1년 중 비싼 자리면 한 번에 사지 않음
    if key == "brl":
        hp = next((p.get("pct") for p in picks if p.get("cur") == "BRL"), 70)
        stance = "헤알 국채 %d · 달러표시 %d — 환율 충격을 달러로 나눠 받음" % (hp, 100 - hp) + (" · 한 번에 말고 나눠 사기" if (fx_pos or 0) >= 60 or up >= 45 else "")
    elif up >= 45:
        stance = "단기 중심 · 장기는 금리가 더 오를 때 나눠 추가"
    elif up <= 25 and down >= 30:
        stance = "장기 비중 늘리기 · 금리가 내리면 값이 오르는 몫까지"
    else:
        stance = "단기·장기 나눠 담기 (바벨)"
    rname = {"ktb": "한국 10년 금리", "ust": "미국 10년 금리", "brl": "브라질 장기 금리"}[key]
    if key == "ktb" and (rc or {}).get("labels"):
        rname += "(%d월 평균)" % int(str(rc["labels"][-1])[5:7])   # FRED 월 자료 — 한두 달 늦게 나옴
    span = {"ktb": "지난 10년", "ust": "지난 1년", "brl": "지난 1년"}[key]
    lvl = "" if r_pos is None else ("높은 편" if r_pos >= 60 else "중간쯤" if r_pos >= 35 else "낮은 편")
    top = max(S, key=lambda s: s["pct"]) if S else None
    s1 = "%s %s는 %s 중 %d%% 높이로 %s임." % (rname, f1(r_now, 2) + "%", span, r_pos or 0, lvl) if r_pos is not None else "%s %s임." % (rname, f1(r_now, 2) + "%")
    if key == "brl":
        s2 = "원/헤알은 1년 범위의 %d%% 자리 — %s" % (fx_pos or 0, "헤알이 싼 편이라 들어가기 나쁘지 않지만, 시황이 「%s」 %d%%라 나눠 사는 게 좋음." % (top["label"], top["pct"]) if (fx_pos or 0) < 40 and top else "환율 부담이 있어 나눠 사는 게 좋음.")
    elif key == "ust":
        s2 = "달러·원은 1년 범위의 %d%% 자리(%s) · 시황이 「%s」 %d%%라 %s." % (fx_pos or 0, "달러가 싼 편" if (fx_pos or 50) < 40 else "달러가 비싼 편" if (fx_pos or 50) > 70 else "중간", top["label"] if top else "–", top["pct"] if top else 0,
            "짧은 채권부터 담고 긴 채권은 금리가 더 오를 때 나눠 추가하는 게 좋음" if up >= 45 else "긴 채권까지 고루 담아도 됨")
    else:
        s2 = "시황이 「%s」 %d%%라 %s." % (top["label"] if top else "–", top["pct"] if top else 0,
            "짧은 채권부터 담고 긴 채권은 금리가 더 오를 때 나눠 추가하는 게 좋음" if up >= 45 else "긴 채권을 늘려 이자를 길게 묶는 게 좋음" if "늘리기" in stance else "짧은 것과 긴 것을 섞어 담는 게 좋음")
    one = s1 + " " + s2
    # 1억 만기 모의
    inv = 100000000
    fx_moves = (form.get("sim") or {}).get("fx_moves") or ([-15, -5, 0, 5, 15] if key != "ktb" else [0])
    mat_rows = []
    for p in picks:
        a = inv * (p.get("pct") or 0) / 100
        yrs = p.get("yrs") or 1
        ay = after_y(p)
        mult = (1 + ay / 100) ** yrs
        mat_rows.append({"p": p, "amt": a, "yrs": yrs, "ay": ay, "mult": mult})
    def mat_total(fxm):
        t = 0
        for m in mat_rows:
            f = 1 + fxm / 100 if m["p"].get("cur") != "KRW" else 1
            t += m["amt"] * m["mult"] * f
        return t
    mat_fx = [(f, mat_total(f)) for f in fx_moves]
    be_fx = None
    if key != "ktb":
        lo_, hi_ = -95.0, 50.0
        for _ in range(60):
            mid = (lo_ + hi_) / 2
            if mat_total(mid) > inv:
                hi_ = mid
            else:
                lo_ = mid
        be_fx = round((lo_ + hi_) / 2, 1)
    wyrs = sum(m["yrs"] * m["p"].get("pct", 0) for m in mat_rows) / 100
    return {"key": key, "M": M, "form": form, "mk": mk, "mkt": mkt, "picks": picks, "S": S, "E": E, "Eper": Eper, "avg_y": avg_y,
            "up": up, "worst": worst, "verdict": verdict, "vcol": vcol, "vtag": vtag, "stance": stance, "one": one,
            "rc": rc, "fc": fc, "r_now": r_now, "r_pos": r_pos, "fx_now": fx_now, "fx_pos": fx_pos, "sig_y": sig_y, "sig_fx": sig_fx,
            "rname": rname, "span": span, "mat_rows": mat_rows, "mat_fx": mat_fx, "be_fx": be_fx, "wyrs": wyrs, "BL": BL, "P": P}


# ───────── HTML ─────────
CSS = """
@page{size:A4;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{margin:0;padding:0}
body{font-family:'Pretendard Variable',Pretendard,'Noto Sans CJK KR','Noto Sans KR','Malgun Gothic',sans-serif;color:#0f172a;background:#fff;font-size:13.5px;line-height:1.55;letter-spacing:-.2px}
.pg{width:210mm;height:297mm;padding:15mm 14mm 13mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
.pg:last-child{page-break-after:auto}
.hd{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--c);padding-bottom:7px;margin-bottom:14px}
.hd b{font-size:12px;color:var(--c);letter-spacing:.3px}.hd span{font-size:11px;color:#64748b}
h2{font-size:22px;margin:0 0 4px;letter-spacing:-.6px}h2 small{font-size:13px;color:#64748b;font-weight:600;margin-left:6px}
.lead{color:#475569;margin:0 0 14px;font-size:13.5px}
.in{transform-origin:top left}
.ft{position:absolute;left:14mm;right:14mm;bottom:8mm;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:5px}
.cover{background:linear-gradient(160deg,var(--c) 0%,#0f172a 105%);color:#fff;padding:16mm 15mm 14mm}
.cover .kick{font-size:13px;opacity:.85;letter-spacing:.5px}
.cover h1{font-size:42px;margin:10px 0 2px;letter-spacing:-1.5px;line-height:1.15}
.cover .dt{opacity:.8;font-size:14px}
.vbox{margin:16px 0 12px;background:rgba(255,255,255,.97);color:#0f172a;border-radius:20px;padding:20px 22px}
.vtag{display:inline-flex;align-items:center;gap:8px;font-size:24px;font-weight:800;padding:6px 16px;border-radius:999px;color:#fff}
.vone{font-size:16px;font-weight:600;margin:14px 0 4px;line-height:1.6}
.stance{display:inline-block;margin-top:8px;background:#f1f5f9;border-radius:10px;padding:6px 12px;font-weight:700;font-size:13.5px}
.big3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:6px}
.big3 div{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);border-radius:16px;padding:14px}
.big3 small{display:block;opacity:.8;font-size:11.5px}.big3 b{display:block;font-size:26px;letter-spacing:-.8px;margin:2px 0}.big3 em{font-style:normal;opacity:.8;font-size:11px}
.mk{margin-top:16px;background:rgba(255,255,255,.1);border-radius:16px;padding:14px 16px}
.mk b{font-size:12px;opacity:.85;display:block;margin-bottom:4px}.mk p{margin:2px 0;font-size:13.5px}
.cv2{display:grid;grid-template-columns:1.1fr 1fr;gap:12px;margin-top:14px}.cv2>div{background:rgba(255,255,255,.1);border-radius:16px;padding:14px 16px}
.cv2 b{display:block;font-size:12.5px;opacity:.9;margin-bottom:6px}.cv2 ul{margin:0;padding-left:18px}.cv2 li{font-size:12.5px;margin:4px 0;line-height:1.5}
.cvs{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12.5px}.cvs em{flex:1;font-style:normal}.cvs em small{opacity:.7}.cvs b{display:inline;font-size:15px;margin:0;opacity:1}
.cover .al{height:30px;margin:2px 0 0}.cover .al div{font-size:11.5px}
.toc{margin-top:14px;display:grid;grid-template-columns:repeat(2,1fr);gap:4px 16px;font-size:12px;opacity:.85}
.kp{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px}
.kp div{background:#f8fafc;border:1px solid #e8edf3;border-radius:14px;padding:10px 12px}
.kp small{display:block;color:#64748b;font-size:11px}.kp b{display:block;font-size:20px;letter-spacing:-.5px}.kp em{font-style:normal;font-size:10.5px;color:#64748b}
.kp .p{color:#16a34a}.kp .n{color:#d6453d}
.card{border:1px solid #e8edf3;border-radius:16px;padding:12px 14px;margin-bottom:11px;background:#fff}
.card h3{font-size:14.5px;margin:0 0 6px;display:flex;justify-content:space-between;align-items:baseline}.card h3 small{font-size:11px;color:#94a3b8;font-weight:500}
.ch{width:100%;height:auto;display:block}.ch .gl{stroke:#eef2f6;stroke-width:1}.ch .gv{stroke-dasharray:3 4}
.ch .tx{font-size:11px;fill:#94a3b8}.ch .tm{font-size:11px;font-weight:700}.ch .now{font-size:13px;font-weight:800}.ch .tv{font-size:12px;font-weight:800}.ch .tg{font-size:12.5px;font-weight:800}
ul.pt{margin:0;padding-left:0;list-style:none}ul.pt li{position:relative;padding:5px 0 5px 22px;border-bottom:1px dashed #eef2f6}ul.pt li:last-child{border-bottom:0}
ul.pt li:before{content:"";position:absolute;left:4px;top:12px;width:8px;height:8px;border-radius:50%;background:var(--c)}
.gauge{margin:6px 0 4px}.gbar{position:relative;height:10px;border-radius:99px;background:linear-gradient(90deg,#bfdbfe,#fef3c7,#fecaca)}
.gbar i{position:absolute;top:-4px;width:18px;height:18px;border-radius:50%;border:3px solid #fff;transform:translateX(-50%);box-shadow:0 1px 4px rgba(0,0,0,.25)}
.glab{position:relative;display:flex;justify-content:space-between;font-size:10.5px;color:#94a3b8;margin-top:6px;height:16px}.glab b{position:absolute;transform:translateX(-50%);font-size:12px;white-space:nowrap}
.sc{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:11px}
.sc>div{border-radius:14px;padding:11px 12px;border:1px solid #e8edf3;background:#fbfcfe}
.sc .pc{font-size:26px;font-weight:800;letter-spacing:-1px}.sc .lb{font-weight:800;font-size:13px;margin:0 0 4px}
.sc .pl{font-size:11.5px;color:#475569;margin:0 0 6px;min-height:34px}.sc .im{font-size:11.5px;background:#fff;border-radius:10px;padding:7px 9px;border:1px solid #eef2f6}
.sc .mv{font-size:11px;color:#64748b;margin-top:6px}
.pbar{height:7px;border-radius:9px;background:#eef2f6;overflow:hidden;margin:4px 0 8px}.pbar i{display:block;height:100%}
table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f1f5f9;color:#475569;font-weight:700;text-align:left;padding:7px 8px;font-size:11.5px}
td{padding:6px 8px;border-bottom:1px solid #f1f5f9}td.r,th.r{text-align:right}tr.hl td{background:#fffbeb;font-weight:700}
.heat td{text-align:center;font-weight:700;border:2px solid #fff;border-radius:6px;padding:8px 4px}.heat th{text-align:center}
.al{display:flex;height:34px;border-radius:12px;overflow:hidden;margin:6px 0 10px}.al div{display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12.5px}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.pk>div{border:1px solid #e8edf3;border-radius:14px;padding:11px 12px;border-top:4px solid var(--pc)}
.pk small{color:#64748b;font-size:11px;display:block}.pk b{display:block;font-size:13.5px;margin:2px 0}.pk .y{font-size:22px;font-weight:800;color:var(--pc);letter-spacing:-.6px}.pk em{font-style:normal;font-size:11px;color:#475569;display:block;margin-top:4px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.note{font-size:10.5px;color:#94a3b8;margin:4px 0 0}
.box{background:#f8fafc;border-radius:14px;padding:11px 14px;margin-bottom:11px}
.wt{display:flex;gap:10px;padding:6px 0;border-bottom:1px dashed #e2e8f0}.wt:last-child{border:0}.wt b{flex:none;width:86px;color:var(--c)}
.disc{font-size:10.5px;color:#64748b;background:#f8fafc;border-radius:12px;padding:10px 12px;line-height:1.6}
.mt{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.mt div{border-radius:12px;padding:9px 8px;text-align:center;background:#f8fafc;border:1px solid #e8edf3}
.mt small{display:block;font-size:10.5px;color:#64748b}.mt b{display:block;font-size:15px;letter-spacing:-.4px}.mt em{font-style:normal;font-size:10.5px}
"""


def page(R, n, total, title, sub, body, cls=""):
    M = R["M"]
    d = R["mkt"].get("date") or ""
    return ('<section class="pg %s"><div class="hd"><b>%s %s 전망 보고서</b><span>%s · %s</span></div>'
            '<div class="in"><h2>%s<small>%s</small></h2>%s</div><div class="ft"><span>참고용 · 투자 권유 아님 · 과거·가정 계산은 미래를 보장하지 않음</span><span>%d / %d</span></div></section>') % (
        cls, M["flag"], M["name"], esc(d), esc(R["mkt"].get("edition") or "아침판"), esc(title), esc(sub), body, n, total)


def kpi_html(R, n=6):
    out = []
    for k in (R["mk"].get("kpis") or [])[:n]:
        cls = "p" if k.get("tone") == 1 else "n" if k.get("tone") == -1 else ""
        out.append('<div><small>%s</small><b class="%s">%s</b><em>%s</em></div>' % (esc(k.get("label")), cls, esc(k.get("value")), esc(k.get("sub"))))
    return '<div class="kp">' + "".join(out) + "</div>"


def heat_color(v, ref):
    if v is None:
        return "#f1f5f9", "#475569"
    if v >= ref:
        a = min(1, (v - ref) / max(abs(ref), 4) + 0.25)
        return "rgba(22,163,74,%.2f)" % (0.12 + 0.5 * a), "#14532d"
    if v >= 0:
        return "rgba(234,179,8,.22)", "#713f12"
    a = min(1, -v / 15)
    return "rgba(214,69,61,%.2f)" % (0.15 + 0.55 * a), "#7f1d1d"


def html_full(R):
    M, form, mk, mkt, S = R["M"], R["form"], R["mk"], R["mkt"], R["S"]
    c = M["color"]
    key = R["key"]
    pages = []
    total = 7
    picks = R["picks"]
    PCOL = ["#3fb28f", "#2f6fdf", "#8b5cf6", "#e6a817"]
    # 1 표지
    big = [("%s" % R["rname"], f1(R["r_now"], 2) + "%", (R["span"] + " 중 %d%% 높이" % R["r_pos"]) if R["r_pos"] is not None else ""),
           ("고른 %d종 평균 금리" % len(picks), f1(R["avg_y"], 2) + "%", "현지 통화 기준 · 세전" if key != "ktb" else "세전 매수 금리"),
           ("시황 반영 1년 기대", sg(R["E"]) + "%", "세 시나리오 확률 가중 · 원화 기준")]
    cov = ('<section class="pg cover"><div class="kick">%s %s · 매일 아침 시황에 맞춘 전망</div><h1>%s 전망 보고서</h1><div class="dt">%s %s · 기준 %s</div>'
           '<div class="vbox"><span class="vtag" style="background:%s">%s %s</span><div class="vone">%s</div><span class="stance">📐 만기 전략 — %s</span></div>'
           '<div class="big3">%s</div><div class="mk"><b>☀️ 오늘 아침 시황 한 줄</b><p>%s</p>%s</div>'
           '<div class="cv2"><div><b>✅ 핵심 요약</b><ul>%s</ul></div><div><b>🎲 시황 세 그림 → 1년 뒤 (원화)</b>%s<b style="margin-top:12px">🧺 오늘 담는 법</b><div class="al">%s</div></div></div>'
           '%s<!--%s-->'
           '<div class="ft" style="color:rgba(255,255,255,.6);border-color:rgba(255,255,255,.2)"><span>참고용 · 투자 권유 아님</span><span>1 / %d</span></div></section>') % (
        M["flag"], M["full"], M["full"], esc(mkt.get("date")), esc(mkt.get("edition") or "아침판"), esc(mkt.get("asof") or ""),
        R["vcol"], R["vtag"], esc(R["verdict"]), esc(R["one"]), esc(R["stance"]),
        "".join('<div><small>%s</small><b>%s</b><em>%s</em></div>' % (esc(a), esc(b), esc(d)) for a, b, d in big),
        esc(mkt.get("one") or ""), ('<p style="opacity:.85;font-size:12.5px">%s</p>' % esc(mkt.get("story"))) if mkt.get("story") else "",
        "".join("<li>%s</li>" % esc(x) for x in (form.get("points") or [])[:4]),
        "".join('<div class="cvs"><span style="color:%s">●</span><em>%s <small>%d%%</small></em><b style="color:%s">%s%%</b></div>' % (s["color"], esc(s["label"]), s["pct"], "#fca5a5" if s["port"] < 0 else "#86efac", sg(s["port"])) for s in S) +
        '<div class="cvs" style="border-top:1px solid rgba(255,255,255,.25)"><span>Σ</span><em>확률 가중 기대</em><b>%s%%</b></div>' % sg(R["E"]),
        "".join('<div style="width:%d%%;background:%s">%s %d%%</div>' % (p.get("pct", 0), PCOL[i % 4], esc(p.get("slot", "").split(" (")[0].replace("달러표시 브라질 국채", "달러표시").replace("헤알 국채 NTN-F", "헤알 NTN-F")), p.get("pct", 0)) for i, p in enumerate(picks)),
        ('<div class="mk"><b>📅 이번에 볼 일정</b>%s</div>' % "".join('<p><b style="display:inline;opacity:1;font-size:13px">%s</b> · %s</p>' % (esc(x[0]), esc(x[1])) for x in (mkt.get("watch") or [])[:3])) if mkt.get("watch") else "",
        "환율이 바꾸는 것" if key != "ktb" else "금리가 움직이면 · 민감도", total)
    pages.append(cov.replace('class="pg cover"', 'class="pg cover" style="--c:%s"' % c))
    # 2 금리 위치
    rc = R["rc"] or {}
    b2 = kpi_html(R)
    b2 += '<div class="card"><h3>%s <small>%s</small></h3>%s%s</div>' % (esc(rc.get("title", R["rname"])), "출처: " + ("FRED·한국은행" if key == "ktb" else "미 재무부·야후" if key == "ust" else "ANBIMA·브라질 중앙은행"),
                                                                    svg_line(rc, h=290, color=c, unit="%"), gauge(R["r_pos"], color=c))
    b2 += '<div class="card"><h3>읽는 법 <small>숫자를 쉬운 말로</small></h3><ul class="pt">%s</ul></div>' % "".join("<li>%s</li>" % esc(v) for v in (mk.get("view") or [])[:5])
    pages.append(page(R, 2, total, "① 지금 금리는 어디쯤", "높을 때 사면 이자를 오래 묶어 둠", b2))
    # 3 곡선
    b3 = ""
    cv = None
    for ch in mk.get("charts") or []:
        if ch.get("kind") == "curve":
            cv = ch
    hl = [(p.get("yrs"), p.get("y"), p.get("slot", "").split(" ")[0]) for p in picks]
    if cv:
        b3 += '<div class="card"><h3>%s <small>점 = 지금 파는 채권 · 노란 동그라미 = 고른 것</small></h3>%s</div>' % (esc(cv["title"]), svg_curve(cv.get("x") or [], cv.get("vals") or [], h=290, color=c, hl=hl, xmax=max([x for x in cv.get("x") or [1]] + [p.get("yrs") or 0 for p in picks])))
    elif mk.get("curve"):
        rows = mk["curve"].get("rows") or []
        yrs0 = int((R["mkt"].get("date") or "2026")[:4])
        xs = [max(0.3, int(r[0]) - yrs0) for r in rows]
        b3 += '<div class="card"><h3>%s <small>만기 해 · 금리(%%)</small></h3>%s</div>' % (esc(mk["curve"].get("title")), svg_curve(xs, [r[1] for r in rows], h=220, color=c, hl=[(p.get("yrs"), p.get("y"), p.get("slot", "")[:6]) for p in picks if p.get("cur") == "BRL"]))
    if key == "ktb" and form.get("chart") and form["chart"].get("vals"):
        ch = form["chart"]
        b3 += '<div class="card"><h3>%s <small>세후 = 세금 뗀 뒤 실제 손에 쥐는 비율</small></h3>%s</div>' % (esc(ch.get("title")), svg_curve([float(str(l).replace("년", "")) if str(l).replace("년", "").replace(".", "").isdigit() else None for l in ch.get("labels") or []], ch.get("vals") or [], color="#16a34a"))
    st = R["stance"]
    b3 += '<div class="box"><b style="color:%s">📐 만기 전략 — %s</b><p style="margin:6px 0 0">%s</p></div>' % (
        c, esc(st), esc("시황 리포트가 「금리가 더 오르는 경우」를 %d%%로 봄. 금리가 오르면 만기가 긴 채권일수록 값이 크게 내려감(듀레이션). 그래서 %s. 만기까지 들고 가면 중간 값 변화와 상관없이 약속한 돈을 받음." % (R["up"], "지금은 짧은 쪽에 무게를 두고, 금리가 더 오르면 그때 긴 채권을 나눠 담는 편이 안전함" if R["up"] >= 45 else "긴 채권을 늘려 이자를 길게 묶고, 금리가 내리면 값이 오르는 몫까지 노릴 수 있음" if "늘리기" in st else "짧은 것과 긴 것을 섞어 어느 쪽으로 가도 크게 흔들리지 않게 함")))
    g3 = [((p.get("slot", "").split(" (")[0][:10], "만기 " + (p.get("mat") or "")[:7].replace("-", ".")), PCOL[i % 4]) for i, p in enumerate(picks)]
    b3 += '<div class="card"><h3>고른 채권별 — 금리 그대로일 때 vs 시황 반영 1년 기대 <small>원화 · %%</small></h3>%s<p class="note">회색 = 금리·환율이 그대로면 받는 이자(현지 통화) · 색 = 시황 세 그림을 확률대로 섞은 1년 기대(원화)</p></div>' % svg_scen_bars(
        g3, [("그대로", [p.get("y") for p in picks], "#cbd5e1"), ("시황 반영", R["Eper"], c)], h=200 if key == "brl" else 240)
    if mk.get("outlook") and key == "brl":
        o = mk["outlook"]
        b3 += '<div class="card"><h3>%s <small>%s</small></h3><table><tr>%s</tr>%s</table></div>' % (esc(o.get("title")), esc(o.get("src") or ""), "".join('<th%s>%s</th>' % (' class="r"' if i else "", esc(x)) for i, x in enumerate(o.get("cols") or [])),
                                                                                         "".join("<tr>%s</tr>" % "".join('<td%s>%s</td>' % (' class="r"' if i else "", esc(x)) for i, x in enumerate(r)) for r in o.get("rows") or []))
    pages.append(page(R, 3, total, "② 만기별 금리 · 어디가 좋나", "길게 빌려줄수록 이자를 얼마나 더 주나", b3))
    # 4 시나리오
    b4 = '<p class="lead">매일 아침 시황 리포트의 세 가지 그림을 그대로 가져와, 그림마다 1년 뒤 이 채권들이 어떻게 될지 셈한 것임.</p><div class="sc">'
    for s in S:
        mv = "금리 %s%%p" % sg(s["dy"], 2) + (" · 환율 %s%%" % sg(s["dfx"]) if key != "ktb" else "")
        b4 += ('<div><div class="lb" style="color:%s">%s</div><div class="pc" style="color:%s">%d%%</div><div class="pbar"><i style="width:%d%%;background:%s"></i></div>'
               '<p class="pl">%s</p><div class="im">💬 %s</div><div class="mv">가정 — %s · 1년 뒤 <b style="color:%s">%s%%</b></div></div>') % (
            s["color"], esc(s["label"]), s["color"], s["pct"], s["pct"], s["color"], esc(s.get("plain") or ""), esc(s.get("impact") or ""), mv, UP if s["port"] >= 0 else DN, sg(s["port"]))
    b4 += "</div>"
    groups = [((s["label"] or "")[:11], s["color"]), ] if False else [((s["label"].replace("경우", "").strip()[:12], "확률 %d%%" % s["pct"]), s["color"]) for s in S] + [(("확률 가중 기대", "세 그림 평균"), "#0f172a")]
    series = [(p.get("slot", ""), [s["per"][i] for s in S] + [R["Eper"][i]], PCOL[i % 4]) for i, p in enumerate(picks)]
    b4 += '<div class="card"><h3>그림마다 1년 뒤 수익률 (원화 기준, %%) <small>%s</small></h3>%s<p class="note">%s</p></div>' % (
        " · ".join('<span style="color:%s">■</span> %s' % (col, esc(nm)) for nm, _, col in series), svg_scen_bars(groups, series, h=290),
        esc("가정: 1년 금리 변화 = 지난 자료의 1년 변동폭(σ %s%%p)에 그림별 배수(오름 +0.6σ · AI +0.15σ · 식음 −0.9σ)" % f1(R["sig_y"], 2) + (" · 환율 1년 변동폭 σ %s%%" % f1(R["sig_fx"]) if R["sig_fx"] else "") + " · 1년 수익 ≈ 이자 − 듀레이션 × 금리 변화(세전)"))
    note = (form.get("scen") or {}).get("note")
    if note:
        b4 += '<div class="box"><b>🔄 시나리오가 바뀌는 조건</b><p style="margin:4px 0 0">%s</p></div>' % esc(note)
    gl = form.get("gloss") or []
    if gl:
        b4 += '<div class="card"><h3>📖 용어 풀이</h3><table>%s</table></div>' % "".join('<tr><td style="width:24%%;font-weight:800;color:%s">%s</td><td>%s</td></tr>' % (c, esc(a), esc(b)) for a, b in gl[:4])
    pages.append(page(R, 4, total, "③ 시황 시나리오 3가지", "확률은 매일 아침 시황 리포트 그대로", b4))
    # 5 환율 / 민감도
    if key != "ktb":
        fc = R["fc"] or {}
        fxname = "달러·원" if key == "ust" else "원/헤알"
        b5 = '<div class="card"><h3>%s <small>원화로 바꿀 때 값</small></h3>%s%s</div>' % (esc(fc.get("title", fxname)), svg_line(fc, h=270, color="#8b5cf6" if key == "ust" else "#e6a817", unit="원", d=1), gauge(R["fx_pos"], "외화 쌈", "외화 비쌈", "#8b5cf6"))
        dys = [-1.0, -0.5, 0.0, 0.5, 1.0]
        dfs = [-20, -10, -5, 0, 5, 10] if key == "brl" else [-10, -5, 0, 5, 10]
        ref = R["avg_y"] * 0.6
        rows = ""
        for dfx in dfs:
            cells = ""
            for dy in dys:
                v = sum(ret1y(p, dy, dfx, key) * (p.get("pct") or 0) / 100 for p in picks)
                bg, fg = heat_color(v, ref)
                cells += '<td style="background:%s;color:%s">%s%%</td>' % (bg, fg, sg(v))
            rows += '<tr><th>%s %s%%</th>%s</tr>' % ("외화 강세" if dfx > 0 else "외화 약세" if dfx < 0 else "그대로", sg(dfx, 0), cells)
        b5 += ('<div class="card"><h3>금리 × 환율 — 1년 뒤 원화 수익률 <small>고른 %d종 비중대로</small></h3><table class="heat"><tr><th></th>%s</tr>%s</table>'
               '<p class="note">가로 = 1년 동안 금리 변화(%%p) · 세로 = %s 변화 · 초록 = 이자 이상 · 노랑 = 조금 남음 · 빨강 = 원화로 손실</p></div>') % (
            len(picks), "".join("<th>금리 %s</th>" % sg(d_, 1) for d_ in dys), rows, fxname)
        be = R["be_fx"]
        if be is not None and R["fx_now"]:
            b5 += '<div class="box"><b style="color:%s">🛟 손익분기 환율</b><p style="margin:4px 0 0">모두 만기까지 들고 가면(평균 %.1f년) 받는 이자 덕분에 <b>%s가 지금보다 %s%% 떨어져도</b>(약 %s원) 원금은 지킴. 이자가 환율 하락을 견디는 「쿠션」임.</p></div>' % (
                c, R["wyrs"], fxname, f1(abs(be), 0), format(int(R["fx_now"] * (1 + be / 100)), ",") if key == "ust" else f1(R["fx_now"] * (1 + be / 100), 1))
        pages.append(page(R, 5, total, "④ 환율이 바꾸는 것", "외화 채권은 「이자 + 환율」 두 개가 합쳐져 원화 수익이 됨", b5))
    else:
        dys = [-1.0, -0.5, -0.25, 0.0, 0.25, 0.5, 1.0]
        rows = ""
        for p in picks:
            cells = ""
            for dy in dys:
                v = ret1y(p, dy, 0, key)
                bg, fg = heat_color(v, p.get("y", 3))
                cells += '<td style="background:%s;color:%s">%s%%</td>' % (bg, fg, sg(v))
            rows += '<tr><th style="text-align:left">%s<br><small style="font-weight:500;color:#64748b">%s · 듀레이션 %.1f</small></th>%s</tr>' % (esc(p.get("slot")), esc(p.get("name")), p.get("dur") or 0, cells)
        b5 = ('<div class="card"><h3>금리가 움직이면 — 1년 들고 있을 때 수익률 <small>세전 · 중간에 판다면</small></h3><table class="heat"><tr><th></th>%s</tr>%s</table>'
              '<p class="note">가로 = 1년 동안 금리 변화(%%p). 금리가 내리면 긴 채권일수록 값이 크게 올라 이자 + 차익을 같이 얻음 · 만기까지 들고 가면 이 표와 상관없이 약속한 돈을 받음</p></div>') % (
            "".join("<th>%s</th>" % sg(d_, 2) for d_ in dys), rows)
        b5 += '<div class="box"><b style="color:%s">💡 듀레이션 한 줄</b><p style="margin:4px 0 0">듀레이션 = 금리가 1%%p 움직일 때 채권값이 몇 %% 움직이는지. 장기(%.1f)는 단기(%.1f)보다 %.0f배 크게 흔들림 — 그래서 금리가 오를 것 같으면 짧게, 내릴 것 같으면 길게 가져감.</p></div>' % (
            c, picks[-1].get("dur") or 0, picks[0].get("dur") or 1, (picks[-1].get("dur") or 0) / max(0.1, picks[0].get("dur") or 1))
        kr = ((R["P"].get("macro") or {}).get("kr3m") or [])
        if kr:
            b5 += '<div class="card"><h3>한국 단기 금리(3개월) · 10년 추이 <small>기준금리 흐름을 비춤</small></h3>%s</div>' % svg_line({"labels": [x[0] for x in kr], "vals": [x[1] for x in kr]}, color="#8b5cf6", h=190)
        pages.append(page(R, 5, total, "④ 금리가 움직이면 · 민감도", "중간에 팔 때만 해당 — 만기 보유면 약속대로", b5))
    # 6 상품
    al = "".join('<div style="width:%d%%;background:%s">%s %d%%</div>' % (p.get("pct", 0), PCOL[i % 4], esc(p.get("slot", "").split(" (")[0]), p.get("pct", 0)) for i, p in enumerate(picks))
    pk = ""
    for i, (a, p) in enumerate(zip(form.get("alloc") or [], picks)):
        pk += '<div style="--pc:%s"><small>%s · %d%%</small><b>%s</b><div class="y">%s%%</div><em>%s</em></div>' % (PCOL[i % 4], esc(a.get("name")), a.get("pct", 0), esc(a.get("inst")), f1(a.get("y"), 2), esc(a.get("why")))
    b6 = '<div class="card"><h3>오늘 시황에 맞춘 담는 법 <small>%s</small></h3><div class="al">%s</div><div class="pk" style="grid-template-columns:repeat(%d,1fr)">%s</div></div>' % (esc(form.get("headline")), al, len(picks), pk)
    o = mk.get("outlook") if key != "brl" else form.get("table")
    if o and o.get("rows"):
        names = {p.get("name") for p in picks}
        rows = o["rows"][:14]
        b6 += '<div class="card"><h3>%s <small>%s</small></h3><table><tr>%s</tr>%s</table></div>' % (
            esc(o.get("title")), esc(o.get("src") or "미래에셋증권 판매정보"), "".join('<th%s>%s</th>' % (' class="r"' if i else "", esc(x)) for i, x in enumerate(o.get("cols") or [])),
            "".join('<tr%s>%s</tr>' % (' class="hl"' if any(str(n)[:10] in str(r[0]) or str(r[0])[:10] in str(n) for n in names) else "", "".join('<td%s>%s</td>' % (' class="r"' if i else "", esc(x)) for i, x in enumerate(r))) for r in rows))
    if key == "brl":
        usd = sorted([x for x in (R["BL"] or {}).get("usd") or [] if x.get("ytm")], key=lambda x: x.get("mat") or "")[:9]
        if usd:
            b6 += '<div class="card"><h3>달러표시 브라질 국채 <small>실시간 · 같은 만기 미국채보다 더 주는 금리</small></h3><table><tr><th>종목</th><th class="r">만기</th><th class="r">수익률</th><th class="r">미국채 +</th></tr>%s</table></div>' % "".join(
                '<tr><td>%s</td><td class="r">%s</td><td class="r">%s%%</td><td class="r">%s</td></tr>' % (esc(x.get("name")), esc(x.get("mat")), f1(x.get("ytm"), 2), ("+%.2f%%p" % x["sp"]) if x.get("sp") is not None else "–") for x in usd)
    pages.append(page(R, 6, total, "⑤ 지금 살 수 있는 상품", "미래에셋증권이 오늘 파는 것 중에서", b6))
    # 7 계산 · 일정 · 위험
    inv = 100000000
    b7 = '<div class="card"><h3>1억원을 이 비중대로 담고 모두 만기까지 들고 가면 <small>세후 · 이자 재투자 가정 · 평균 %.1f년</small></h3>' % R["wyrs"]
    if key == "ktb":
        tot = sum(m["amt"] * m["mult"] for m in R["mat_rows"])
        b7 += '<div class="mt" style="grid-template-columns:repeat(%d,1fr)">%s</div>' % (len(R["mat_rows"]) + 1, "".join(
            '<div><small>%s · %s</small><b>%s</b><em style="color:%s">%.1f년 · 세후 %s%%</em></div>' % (esc(m["p"].get("slot", "").split(" (")[0]), won(m["amt"]), won(m["amt"] * m["mult"]), UP, m["yrs"], f1(m["ay"], 2)) for m in R["mat_rows"]) +
            '<div style="background:#0f172a;color:#fff"><small style="color:#cbd5e1">합계</small><b>%s</b><em style="color:#86efac">원금 대비 %s%%</em></div>' % (won(tot), sg((tot / inv - 1) * 100)))
    else:
        b7 += '<div class="mt" style="grid-template-columns:repeat(%d,1fr)">%s</div>' % (len(R["mat_fx"]), "".join(
            '<div><small>만기 때 환율 %s%%</small><b>%s</b><em style="color:%s">%s%%</em></div>' % (sg(f, 0), won(t), UP if t >= inv else DN, sg((t / inv - 1) * 100)) for f, t in R["mat_fx"]))
    b7 += '<p class="note">%s</p></div>' % esc((form.get("sim") or {}).get("note") or "지금 값으로 사서 만기까지 · 수수료 제외")
    b7 += '<div class="card"><h3>💡 왜 이렇게 골랐나</h3><ul class="pt">%s</ul></div>' % "".join("<li>%s</li>" % esc(x) for x in (form.get("points") or [])[:5])
    w = mkt.get("watch") or []
    if w:
        b7 += '<div class="card"><h3>📅 이번에 볼 일정 <small>시황 리포트</small></h3>%s</div>' % "".join('<div class="wt"><b>%s</b><span>%s</span></div>' % (esc(a), esc(b)) for a, b in w[:5])
    b7 += '<div class="two"><div class="card"><h3>⚠️ 조심할 것</h3><ul class="pt">%s</ul></div><div class="card"><h3>🧭 들고 있는 동안</h3><ul class="pt">%s</ul></div></div>' % (
        "".join("<li>%s</li>" % esc(x) for x in form.get("risks") or []), "".join("<li>%s</li>" % esc(x) for x in (form.get("care") or [])[:4]))
    b7 += '<div class="disc">%s</div>' % "<br>".join("· " + esc(x) for x in (R["P"].get("notice") or []))
    pages.append(page(R, 7, total, "⑥ 1억원 넣으면 · 체크 일정", "숫자로 미리 보는 결과", b7))
    return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable.min.css"><style>%s</style></head><body style="--c:%s">%s</body></html>' % (CSS, c, "".join(pages))


CSS1 = """
*{box-sizing:border-box}html,body{margin:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:'Pretendard Variable',Pretendard,'Noto Sans CJK KR',sans-serif;color:#0f172a;background:#f3f6fa;letter-spacing:-.4px}
.top{background:linear-gradient(150deg,var(--c),#0f172a 110%);color:#fff;padding:52px 64px 112px}
.top .k{font-size:28px;opacity:.85}.top h1{font-size:70px;margin:6px 0 4px;letter-spacing:-2.5px}.top .d{font-size:28px;opacity:.75}
.wrap{padding:0 48px;margin-top:-84px}
.c{background:#fff;border-radius:36px;padding:28px 38px;margin-bottom:20px;box-shadow:0 6px 24px rgba(15,23,42,.06)}
.v{display:inline-block;font-size:44px;font-weight:800;color:#fff;border-radius:999px;padding:10px 32px}
.one{font-size:30px;font-weight:600;line-height:1.48;margin:16px 0 10px}
.st{display:inline-block;background:#f1f5f9;border-radius:16px;padding:10px 20px;font-size:27px;font-weight:700}
.k3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:20px}
.k3 div{background:#fff;border-radius:28px;padding:20px 24px;box-shadow:0 6px 24px rgba(15,23,42,.06)}
.k3 small{display:block;font-size:22px;color:#64748b}.k3 b{display:block;font-size:50px;letter-spacing:-1.5px;margin:2px 0}.k3 em{font-style:normal;font-size:20px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
h3{font-size:30px;margin:0 0 12px;display:flex;justify-content:space-between;align-items:baseline}h3 small{font-size:21px;color:#94a3b8;font-weight:500}
.ch{width:100%;height:auto;display:block}.ch .gl{stroke:#eef2f6}.ch .gv{stroke-dasharray:3 4}.ch .tx{font-size:11px;fill:#94a3b8}.ch .tm{font-size:11px;font-weight:700}.ch .now{font-size:13px;font-weight:800}.ch .tv{font-size:12px;font-weight:800}.ch .tg{font-size:12.5px;font-weight:800}
.sr{display:flex;align-items:center;gap:18px;padding:8px 0;border-bottom:2px dashed #eef2f6}.sr:last-child{border:0}
.sr .n{flex:1;font-size:26px;font-weight:700}.sr .n small{display:block;font-size:20px;color:#64748b;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:520px}
.sr .p{width:220px;height:16px;background:#eef2f6;border-radius:9px;overflow:hidden}.sr .p i{display:block;height:100%}
.sr .r{width:150px;text-align:right;font-size:32px;font-weight:800}
.al{display:flex;height:66px;border-radius:20px;overflow:hidden;margin:4px 0 14px}.al div{display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:800}
.pr{display:flex;justify-content:space-between;font-size:24px;padding:5px 0;border-bottom:1px solid #f1f5f9}.pr b{font-weight:700}.pr span{color:#64748b}.pr em{font-style:normal;font-weight:800}
.ft{position:absolute;bottom:26px;left:56px;right:56px;font-size:18px;color:#94a3b8;line-height:1.45}
"""


def html_one(R):
    M, form, mkt, S, picks = R["M"], R["form"], R["mkt"], R["S"], R["picks"]
    c = M["color"]
    key = R["key"]
    PCOL = ["#3fb28f", "#2f6fdf", "#8b5cf6", "#e6a817"]
    k3 = [(R["rname"], f1(R["r_now"], 2) + "%", (R["span"] + " 중 %d%% 높이" % R["r_pos"]) if R["r_pos"] is not None else ""),
          ("고른 채권 평균", f1(R["avg_y"], 2) + "%", "세전 · 현지 통화"),
          ("1년 기대 (시황 반영)", sg(R["E"]) + "%", "원화 · 확률 가중")]
    if key != "ktb" and R["be_fx"] is not None:
        k3[1] = ("환율 쿠션", "−%s%%" % f1(abs(R["be_fx"]), 0), "만기(평균 %.0f년)까지면 이만큼 빠져도 원금" % R["wyrs"])
    sr = "".join('<div class="sr"><div class="n" style="color:%s">%s<small>확률 %d%% · %s</small></div><div class="p"><i style="width:%d%%;background:%s"></i></div><div class="r" style="color:%s">%s%%</div></div>' % (
        s["color"], esc(s["label"]), s["pct"], esc(((s.get("impact") or "").split(" — ")[0].split(" · ")[0])[:26]), s["pct"], s["color"], UP if s["port"] >= 0 else DN, sg(s["port"])) for s in S)
    al = "".join('<div style="width:%d%%;background:%s">%s %d%%</div>' % (p.get("pct", 0), PCOL[i % 4], esc(p.get("slot", "").split(" (")[0].replace("달러표시 브라질 국채", "달러표시").replace("헤알 국채 NTN-F", "헤알 NTN-F")), p.get("pct", 0)) for i, p in enumerate(picks))
    pr = "".join('<div class="pr"><b>%s</b><span>%s</span><em style="color:%s">%s%%</em></div>' % (esc(a.get("inst")), esc((a.get("mat") or "")[:7].replace("-", ".") + " 만기"), PCOL[i % 4], f1(a.get("y"), 2)) for i, a in enumerate(form.get("alloc") or []))
    rc = R["rc"] or {}
    body = ('<div class="top"><div class="k">%s %s · 오늘의 전망</div><h1>%s 전망</h1><div class="d">%s %s</div></div><div class="wrap">'
            '<div class="c"><span class="v" style="background:%s">%s %s</span><div class="one">%s</div><span class="st">📐 %s</span></div>'
            '<div class="k3">%s</div>'
            '<div class="c"><h3>%s <small>%s</small></h3>%s</div>'
            '<div class="c"><h3>시황 시나리오 → 1년 뒤 <small>원화 기준 · 가정</small></h3>%s</div>'
            '<div class="c"><h3>이렇게 나눠 담음 <small>미래에셋 판매 채권 중</small></h3><div class="al">%s</div>%s</div></div>'
            '<div class="ft">참고용 · 투자 권유 아님 · 시나리오 수익은 가정 계산이며 미래를 보장하지 않음 · 금융투자상품은 예금자보호 대상이 아니며 원금 손실 가능 · %s 기준</div>') % (
        M["flag"], M["full"], M["full"], esc(mkt.get("date")), esc(mkt.get("edition") or "아침판"),
        R["vcol"], R["vtag"], esc(R["verdict"]), esc(R["one"]), esc(R["stance"]),
        "".join('<div><small>%s</small><b>%s</b><em>%s</em></div>' % (esc(a), esc(b), esc(d)) for a, b, d in k3),
        esc(rc.get("title", R["rname"]).split(" · ")[0]), esc(R["span"]), svg_line(rc, w=640, h=125, color=c, xlab=4),
        sr, al, pr, esc(mkt.get("asof") or mkt.get("date")))
    return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable.min.css"><style>%s</style></head><body style="--c:%s">%s</body></html>' % (CSS1, c, body)


async def render(jobs):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        exe = os.environ.get("CHROME")
        b = await p.chromium.launch(**({"executable_path": exe} if exe else {}))
        for kind, html, out in jobs:
            pg = await b.new_page(viewport={"width": 1080, "height": 1920} if kind == "one" else {"width": 794, "height": 1123}, device_scale_factor=1)
            await pg.set_content(html, wait_until="networkidle", timeout=60000)
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(400)
            if kind == "full":   # 넘치는 쪽은 그 쪽만 살짝 줄여 넣음(잘림 방지)
                await pg.evaluate("""() => { document.querySelectorAll('.pg').forEach(p => { const i = p.querySelector('.in'); if (!i) return;
                    const cs = getComputedStyle(p); const avail = p.getBoundingClientRect().bottom - parseFloat(cs.paddingBottom) - i.getBoundingClientRect().top - 8; const h = i.scrollHeight;
                    if (h > avail) { const z = Math.max(0.72, avail / h); i.style.transform = 'scale(' + z + ')'; i.style.width = (100 / z) + '%'; } }); }""")
            else:
                await pg.evaluate("""() => { const b = document.body, w = document.querySelector('.wrap'); if (!w) return; const lim = 1920 - 96; const r = w.getBoundingClientRect();
                    if (r.bottom > lim) { const z = Math.max(0.8, (lim - r.top) / r.height); w.style.transform = 'scale(' + z + ')'; w.style.transformOrigin = 'top center'; } }""")
            if kind == "one":
                await pg.screenshot(path=out, type="jpeg", quality=88, full_page=False)
            else:
                await pg.pdf(path=out, format="A4", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
            await pg.close()
        await b.close()


def main():
    P = jl("archive/x/proposal.json") or {}
    BL = jl("archive/x/brl_live.json") or {}
    mkt = P.get("market") or {}
    os.makedirs(OUT, exist_ok=True)
    idx_p = os.path.join(OUT, "index.json")
    old = jl("archive/x/bond_outlook/index.json") or {}
    stamp = (mkt.get("date") or "") + "|" + (mkt.get("edition") or "") + "|" + (P.get("at") or "")[:10]
    if "--force" not in sys.argv and old.get("stamp") == stamp and all(os.path.exists(os.path.join(OUT, k + ".pdf")) for k in KEYS):
        print("bond_outlook: 이미 오늘 것 있음 —", stamp)
        return
    jobs, items = [], {}
    for k in KEYS:
        try:
            R = build(k, P, BL)
        except Exception as e:
            print("bond_outlook:", k, "실패", repr(e))
            R = None
        if not R:
            continue
        hf, ho = html_full(R), html_one(R)
        open(os.path.join(OUT, k + ".html"), "w", encoding="utf-8").write(hf) if "--html-only" in sys.argv else None
        open(os.path.join(OUT, k + "_one.html"), "w", encoding="utf-8").write(ho) if "--html-only" in sys.argv else None
        jobs += [("full", hf, os.path.join(OUT, k + ".pdf")), ("one", ho, os.path.join(OUT, k + ".jpg"))]
        items[k] = {"title": "%s %s 전망" % (R["M"]["flag"], R["M"]["full"]), "verdict": R["verdict"], "tag": R["vtag"], "color": R["vcol"],
                    "one": R["one"], "stance": R["stance"], "E": round(R["E"], 2), "rate": R["r_now"], "pos": R["r_pos"]}
    if "--html-only" in sys.argv:
        print("html 만 씀"); return
    import asyncio
    asyncio.run(render(jobs))
    now = dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=9)
    json.dump({"at": now.strftime("%Y-%m-%d %H:%M"), "date": mkt.get("date"), "edition": mkt.get("edition") or "아침판", "stamp": stamp, "items": items},
              open(idx_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("bond_outlook: 만듦", list(items))


if __name__ == "__main__":
    main()
