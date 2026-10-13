"""
🧭 국면 신호판 — 시장별 (🇺🇸 미국 · 🇰🇷 한국 · 🇯🇵 일본 · 🇨🇳 중국 · 🇭🇰 홍콩)  (10/13 사용자: "원래대로 총 5개 시장 다 진행하고 시장별 탭 만들어")
  regime.py(미·한 합본)와 같은 규칙·같은 점수 방식인데, 시장마다
    ① 그 나라 경기 신호만 (없으면 그 나라 경기를 가장 크게 움직이는 쪽 — 홍콩 = 중국 경기 + 미국 금리(달러 페그))
    ② 그 나라 주가 흐름 신호만
    ③ 무게와 과거 성적도 그 시장 지수 하나로만 다시 계산
  결과 → archive/x/regime_mk.json  (regime.py 다음에 돌림: 외국인 순매수는 regime.json 에서 그대로 가져옴)
  ※ 💼 포트 현금 규칙(market-strategy-report rules7)은 아직 regime.json(미·한 합본)을 씀 — 이 파일은 화면용.
"""
import json
import os

import numpy as np
import pandas as pd

import regime as RG

OUT = os.path.join("archive", "x", "regime_mk.json")
COMB = os.path.join("archive", "x", "regime.json")
ERR = RG.ERR
r_, daily, tri, log = RG.r_, RG.daily, RG.tri, RG.log

MK = {  # 코드: (이름, 국기, 지수, 지수 이름)
    "US": ("미국", "🇺🇸", "^GSPC", "S&P500"),
    "KR": ("한국", "🇰🇷", "^KS11", "코스피"),
    "JP": ("일본", "🇯🇵", "^N225", "닛케이225"),
    "CN": ("중국", "🇨🇳", "000001.SS", "상하이종합"),
    "HK": ("홍콩", "🇭🇰", "^HSI", "항셍"),
}
ORDER_MK = ["US", "KR", "JP", "CN", "HK"]


def load():
    D = {}
    fr = {"t10y3m": "T10Y3M", "baa": "BAA10Y", "hy": "BAMLH0A0HYM2", "nfci": "NFCI", "claims": "IC4WSA", "sahm": "SAHMREALTIME", "permit": "PERMIT",
          "ex_KR": "XTEXVA01KRM667S", "ex_JP": "XTEXVA01JPM667S", "ex_CN": "XTEXVA01CNM667S"}
    for c in ("KR", "JP", "CN"):
        fr[f"l_{c}"] = f"IRLTLT01{c}M156N"     # 10년 국채 (월)
        fr[f"s_{c}"] = f"IR3TIB01{c}M156N"     # 3개월 금리 (월)
    for k, sid in fr.items():
        try:
            D[k] = RG.fred(sid)
        except Exception as e:
            ERR.append(f"FRED {sid}: {e}")
    for k, a in (("cli_US", "USA"), ("cli_KR", "KOR"), ("cli_CN", "CHN"), ("cli_JP", "JPN")):
        try:
            D[k] = RG.oecd_cli(a)
        except Exception as e:
            ERR.append(f"OECD {a}: {e}")
    try:
        D["Y"] = RG.yahoo(["^GSPC", "^KS11", "^N225", "000001.SS", "^HSI", "^SOX", "^DJT", "^RUT", "^VIX", "XLY", "XLP", "MU",
                           "KRW=X", "JPY=X", "CNY=X", "HG=F"])
    except Exception as e:
        ERR.append(f"yahoo: {e}")
        D["Y"] = {}
    return D


# =============================================================== 신호 만들기 (시장 공통 부품)
def s_yc(raw, cal, lag, name, src, short_name):
    s = daily(raw, cal, lag)
    inv = s < 0
    last_inv = pd.Series(np.where(inv, s.index.values, np.datetime64("NaT", "ns")), index=s.index).ffill()
    days = (s.index.to_series() - last_inv).dt.days
    st = pd.Series(1.0, index=s.index)
    st[(days <= 365)] = 0.0
    st[(days <= 180) | inv] = -1.0
    st[s.isna()] = np.nan
    v, dl = s.dropna().iloc[-1], days.iloc[-1]
    mean = (f"역전 중 ({v:+.2f}%p)" if v < 0 else f"역전이 {int(dl)}일 전에 풀림 — 침체 전 가장 위험했던 구간" if dl == dl and dl <= 180 else
            f"역전 해제 뒤 {int(dl)}일" if dl == dl and dl <= 365 else f"정상 ({v:+.2f}%p) · 1년 넘게 역전 없음")
    return st, dict(name=name, val=f"{v:+.2f}%p", mean=mean + f" — {short_name}", lead="6~18개월",
                    rule="역전 중·해제 뒤 6개월 = 경고 · 해제 뒤 1년 = 중립 · 1년 넘게 정상 = 좋음", src=src, hist=[r_(x) for x in raw.iloc[-60:]])


def s_credit(D, cal, world):
    s = daily(D["baa"], cal, 1)
    ch = s - s.shift(63)
    pct = s.rolling(756, min_periods=252).rank(pct=True)
    st = tri((ch <= 0.05) & (pct <= 0.5), (ch >= 0.4) | (pct >= 0.85), s)
    nm = "미국 신용 스프레드 (세계 돈줄)" if world else "신용 스프레드 (회사채−국채)"
    mn = f"3년 중 {pct.iloc[-1]*100:.0f}% 위치, 석 달 {ch.iloc[-1]:+.2f}%p — " + ("미국 채권시장이 겁먹으면 전 세계 위험자산에서 돈이 빠져요" if world else "채권시장이 주식보다 먼저 겁을 먹어요")
    return st, dict(name=nm, val=f"{s.iloc[-1]:.2f}%p ({ch.iloc[-1]:+.2f})", mean=mn, lead="1~6개월",
                    rule="석 달 +0.4%p 또는 3년 상위 15% = 경고 · 안정·하위 절반 = 좋음", src="FRED BAA10Y", hist=[r_(x) for x in D["baa"].iloc[-120:]])


def s_cli(D, cal, c, label):
    x = D[f"cli_{c}"]
    d3 = x - x.shift(3)
    p = tri(((x >= 100) & (d3 > 0)) | (d3 > 0.3), ((x < 100) & (d3 < 0)) | (d3 < -0.3), x)
    return daily(p, cal, 45), dict(name=f"경기선행지수 OECD ({label})", val=f"{x.iloc[-1]:.1f} ({x.index[-1].strftime('%m')}월 · 3개월 {d3.iloc[-1]:+.1f})",
                                   mean="100 = 장기 평균. 100 위에서 오르면 확장, 100 아래서 내리면 수축", lead="6~9개월",
                                   rule="100 위·상승 또는 3개월 +0.3 = 좋음 · 100 아래·하락 또는 −0.3 = 경고", src="OECD CLI", hist=[r_(v, 1) for v in x.iloc[-36:]])


def s_exports(D, cal, c, label):
    raw = D[f"ex_{c}"]
    yoy = (raw / raw.shift(12) - 1) * 100
    st = tri(daily(yoy, cal, 30) > 5, daily(yoy, cal, 30) < 0, daily(yoy, cal, 30))
    return st, dict(name=f"{label} 수출 증가율", val=f"{yoy.iloc[-1]:+.1f}% ({raw.index[-1].strftime('%m')}월)", mean="수출은 기업 이익과 거의 같은 그림 (1년 전 대비)",
                    lead="3~6개월", rule="마이너스 = 경고 · +5% 이상 = 좋음", src=f"FRED XTEXVA01{c}M667S", hist=[r_(v, 1) for v in yoy.iloc[-36:]])


def s_trend(Y, cal, tk, label):
    x = Y[tk].reindex(cal).ffill()
    ma = x.rolling(200).mean()
    st = tri(x > ma, x < ma, ma)
    gp = (x.iloc[-1] / ma.iloc[-1] - 1) * 100
    return st, dict(name=f"{label} 200일선", val=f"{gp:+.1f}%", mean="큰 하락장은 예외 없이 200일선 아래서 일어났어요", lead="추세 확인",
                    rule="200일선 위 = 좋음 · 아래 = 경고", src=f"야후 {tk}", hist=[r_(v, 0) for v in Y[tk].iloc[-60:]])


def s_mom(Y, cal, tk, label):
    """6개월 수익률 + 52주 고점에서 얼마나 떨어졌나"""
    x = Y[tk].reindex(cal).ffill()
    m126 = x / x.shift(126) - 1
    dd = x / x.rolling(252).max() - 1
    st = tri((m126 > 0) & (dd > -0.1), (dd <= -0.2) | ((m126 < 0) & (dd < -0.15)), x.shift(252))   # 10/13: 고점 −20% 넘게 빠지면 6개월 수익과 상관없이 경고 (약세장 정의)
    return st, dict(name=f"{label} 6개월 흐름·고점 거리", val=f"6개월 {m126.iloc[-1]*100:+.0f}% · 고점 {dd.iloc[-1]*100:.0f}%",
                    mean="반년 동안 오르고 고점 가까이면 힘이 살아 있음 · 고점에서 20% 넘게 빠졌으면(약세장) 또는 반년 내리고 15% 넘게 멀면 경고", lead="1~3개월",
                    rule="6개월 +·고점 −10% 안 = 좋음 · 고점 −20% 밖, 또는 6개월 −·고점 −15% 밖 = 경고", src=f"야후 {tk}")


def s_fx(Y, cal, tk, label, weak_good):
    """weak_good=True: 그 나라 돈이 약할 때(환율 ↑) 주가에 좋음 (일본 = 수출 대기업). False: 돈이 약하면 외국인 돈이 빠져 나쁨"""
    x = Y[tk].reindex(cal).ffill()
    ma, m63 = x.rolling(200).mean(), x / x.shift(63) - 1
    up, dn = (x > ma) & (m63 > 0.02), (x < ma) & (m63 < -0.02)
    st = tri(up, dn, ma) if weak_good else tri(dn | (x < ma), up, ma)
    dirn = "약세" if x.iloc[-1] > ma.iloc[-1] else "강세"
    return st, dict(name=f"{label} 환율 (달러 대비)", val=f"{x.iloc[-1]:,.2f} · 석 달 {m63.iloc[-1]*100:+.1f}%", mean=f"200일 평균보다 {label} {dirn} — " +
                    ("엔이 약하면 수출 대기업 이익이 커져 닛케이에 좋았어요" if weak_good else f"{label}가 약해지면 외국인 돈이 빠져나가는 경우가 많았어요"),
                    lead="1~3개월", rule=("달러 대비 약세 흐름 = 좋음 · 강세 흐름 = 경고" if weak_good else "강세·평균 아래 = 좋음 · 약세 흐름(석 달 +2%↑) = 경고"),
                    src=f"야후 {tk}", hist=[r_(v, 2) for v in Y[tk].iloc[-60:]])


def s_semi(Y, cal, extra=""):
    x = Y["^SOX"].reindex(cal).ffill()
    ma, m63 = x.rolling(200).mean(), x / x.shift(63) - 1
    st = tri((x > ma) & (m63 > 0), (x < ma) & (m63 < 0), ma)
    return st, dict(name="반도체 사이클 (미국 SOX)", val=f"석 달 {m63.iloc[-1]*100:+.0f}%", mean=f"200일선 {'위' if x.iloc[-1] > ma.iloc[-1] else '아래'}" + extra,
                    lead="1~6개월", rule="200일선 위·석 달 상승 = 좋음 · 아래·하락 = 경고", src="야후 ^SOX")


def s_copper(Y, cal):
    x = Y["HG=F"].reindex(cal).ffill()
    ma, m63 = x.rolling(200).mean(), x / x.shift(63) - 1
    st = tri((x > ma) & (m63 > 0), (x < ma) & (m63 < 0), ma)
    return st, dict(name="구리 값 (닥터 코퍼)", val=f"석 달 {m63.iloc[-1]*100:+.0f}%", mean="중국이 세계 구리의 절반을 써요 — 구리가 오르면 중국 공장·건설이 돈다는 뜻",
                    lead="1~6개월", rule="200일선 위·석 달 상승 = 좋음 · 아래·하락 = 경고", src="야후 HG=F")


def s_vix(Y, cal):
    v = Y["^VIX"].reindex(cal).ffill()
    st = tri((v < 18) | (v >= 40), (v > 28) & (v < 40), v)
    vv = v.iloc[-1]
    return st, dict(name="공포지수 VIX (세계)", val=f"{vv:.1f}", mean=("공포 극단 — 역발상 좋음" if vv >= 40 else "불안 구간" if vv > 28 else "차분함" if vv < 18 else "보통"),
                    lead="1~3개월", rule="18 미만 또는 40 이상(역발상) = 좋음 · 28~40 = 경고", src="야후 ^VIX", hist=[r_(x, 1) for x in Y["^VIX"].iloc[-60:]])


def build(mk, D, cal):
    """시장 하나 → {id: (상태, 설명, 그룹)}  (과거 자료 있는 것만)"""
    Y, out = D.get("Y", {}), {}

    def add(k, g, f, *a):
        try:
            st, meta = f(*a)
            out[k] = (st, meta, g)
        except Exception as e:
            ERR.append(f"{mk} {k}: {e!r}"[:200])
    nm, fl, tk, inm = MK[mk]
    # ---------- 경기 사이클
    if mk == "US":
        R = RG.rules({k: D[k] for k in ("t10y3m", "baa", "hy", "nfci", "claims", "sahm", "permit") if k in D} | {"Y": {}}, cal)
        for k, (st, meta) in R.items():
            out[k] = (st, meta, "cycle")
        if "cli_US" in D:
            add("cli", "cycle", s_cli, D, cal, "US", "미국")
    else:
        c = "CN" if mk == "HK" else mk
        if f"cli_{c}" in D:
            add("cli", "cycle", s_cli, D, cal, c, MK[c][0])
        if f"ex_{c}" in D:
            add("exports", "cycle", s_exports, D, cal, c, MK[c][0])
        if mk == "HK":   # 홍콩달러는 미국 달러에 묶여 있어 금리도 미국을 따라감
            if "t10y3m" in D:
                add("yc", "cycle", s_yc, D["t10y3m"], cal, 1, "미국 장단기 금리차 (홍콩 금리 = 미국 금리)", "FRED T10Y3M", "홍콩달러는 미국 달러에 묶여 있어요")
        elif f"l_{c}" in D and f"s_{c}" in D:
            sp = (D[f"l_{c}"] - D[f"s_{c}"]).dropna()
            if len(sp) > 60:
                add("yc", "cycle", s_yc, sp, cal, 30, f"{nm} 장단기 금리차 (10년−3개월)", f"FRED IRLTLT01{c}·IR3TIB01{c}", "그 나라 은행이 돈을 빌려주기 좋은지")
        if "baa" in D:
            add("credit", "cycle", s_credit, D, cal, True)
    # ---------- 시장 타이밍
    if tk in Y:
        add("trend", "timing", s_trend, Y, cal, tk, inm)
        add("mom", "timing", s_mom, Y, cal, tk, inm)
    if mk == "US":
        R = RG.rules({"Y": Y}, cal)
        for k in ("cycdef", "inner", "semi"):
            if k in R:
                out[k] = (R[k][0], R[k][1], "timing")
    if mk == "KR":
        if "KRW=X" in Y:
            add("fx", "timing", s_fx, Y, cal, "KRW=X", "원화", False)
        if "^SOX" in Y:
            add("semi", "timing", s_semi, Y, cal, " — 코스피 이익의 절반이 반도체")
    if mk == "JP":
        if "JPY=X" in Y:
            add("fx", "timing", s_fx, Y, cal, "JPY=X", "엔화", True)
        if "^SOX" in Y:
            add("semi", "timing", s_semi, Y, cal, " — 도쿄일렉트론·어드밴테스트 같은 장비주가 닛케이를 끌어요")
    if mk in ("CN", "HK"):
        if "CNY=X" in Y:
            add("fx", "timing", s_fx, Y, cal, "CNY=X", "위안화", False)
        if "HG=F" in Y:
            add("copper", "timing", s_copper, Y, cal)
    if "^VIX" in Y:
        add("vix", "timing", s_vix, Y, cal)
    return out


# =============================================================== 오늘만 보는 신호 (시장 폭 · 외국인)
def live(mk, comp, comb):
    nm, fl = MK[mk][0], MK[mk][1]
    out = {}
    m = comp.get(mk) or {}
    p = m.get("b200")
    if p is not None:
        out["b200"] = (1 if p > 55 else (-1 if p < 40 else 0), dict(name=f"200일선 위 종목 비율 ({nm})", val=f"{p:.0f}%",
                       mean="지수만 오르고 이 비율이 떨어지면 속으로는 약세. 20% 아래는 바닥권(역발상 자리), 85% 위는 과열" + (" — 지금 바닥권" if p < 20 else ""),
                       lead="1~3개월", rule="55% 위 = 좋음 · 40% 아래 = 경고", src="CH 나침반 전 종목 가격",
                       hist=[x[1] for x in m.get("b200_hist") or []][-40:]))
    bh = m.get("breadth_hist")
    if bh and len(bh) >= 15:
        ratio = [u / (u + d) if (u + d) else 0.5 for _, u, d, *_ in bh]
        ema = []
        for x in ratio:
            ema.append(x if not ema else ema[-1] + 2 / 11 * (x - ema[-1]))
        fired = None
        for i in range(len(ema) - 1, max(9, len(ema) - 31), -1):
            if ema[i] >= 0.615 and min(ema[i - 10:i]) <= 0.40:
                fired = bh[i][0]
                break
        out["thrust"] = (1 if fired else 0, dict(name="브레드 스러스트 (즈바이크)", val=f"{ema[-1]*100:.0f}%" + (f" · 발동 {fired}" if fired else ""),
                         mean="발동!" if fired else "발동 없음 — 10일 상승 종목 비율이 40%→61.5%로 열흘 안에 뛰면 발동(드문 강세 신호)",
                         lead="상승 국면 진입 확인", rule="최근 30일 안 발동 = 좋음 · 평소 = 중립(점수 영향 없음)", src="CH 나침반 등락 종목 수"))
    hh = m.get("hl_hist") or []
    if len(hh) >= 10:
        net10 = sum(h - l for _, h, l in hh[-10:])
        out["hl"] = (1 if net10 > 0 else -1, dict(name=f"신고가 − 신저가 (10일 합, {nm})", val=f"{net10:+d}",
                     mean=f"오늘 신고가 {m.get('highs')} · 신저가 {m.get('lows')} — 지수가 높은데 신저가가 더 많으면 천장 경고",
                     lead="1~3개월", rule="신고가 우세 = 좋음 · 신저가 우세 = 경고", src="CH 나침반"))
    if mk == "KR":
        f = next((s for s in (comb.get("sig") or []) if s.get("id") == "foreign" and s.get("st") is not None), None)
        if f:
            out["foreign"] = (f["st"], {k: v for k, v in f.items() if k not in ("id", "grp", "st", "w", "bt")})
    return out


# =============================================================== 무게·과거 성적 (그 시장 지수 하나로)
def backtest(R, x, cal):
    x = x.reindex(cal).ffill()
    fw = {}
    for h in (63, 126):
        fw[h] = (x.shift(-h) / x - 1) * 100
        lo = x[::-1].rolling(h, min_periods=h // 2).min()[::-1]
        fw[("dd", h)] = (lo / x - 1) * 100
    wk = cal[(cal >= pd.Timestamp(RG.BT_START)) & x.reindex(cal).notna().values]
    wk = pd.DatetimeIndex(pd.Series(wk, index=wk).resample("W-FRI").last().dropna().values)
    stats, W = {}, {}
    for k, (st, _, g) in R.items():
        h = 126 if g == "cycle" else 63
        s = st.reindex(wk)
        if s.notna().sum() < 150:
            continue
        res = {}
        for v in (1.0, -1.0):
            sel = s[s == v].index
            f = fw[h].reindex(sel).dropna()
            d = fw[("dd", h)].reindex(sel).dropna()
            res[v] = (len(sel), f.mean() if len(f) >= 15 else None, (f > 0).mean() * 100 if len(f) >= 15 else None, (d <= -10).mean() * 100 if len(d) >= 15 else None)
        if res[1.0][3] is None or res[-1.0][3] is None:
            continue
        risk = res[-1.0][3] - res[1.0][3]
        w = max(0.0, min(2.0, round(risk / 15 * 2) / 2))
        W[k] = w
        stats[k] = {"h": "6개월" if h == 126 else "3개월", "since": str(s.dropna().index[0].date())[:4],
                    "pos": [int(res[1.0][0]), r_(res[1.0][1], 1), r_(res[1.0][2], 0), r_(res[1.0][3], 0)],
                    "neg": [int(res[-1.0][0]), r_(res[-1.0][1], 1), r_(res[-1.0][2], 0), r_(res[-1.0][3], 0)],
                    "risk": round(risk, 0), "w": w, "one": True}
    return stats, W, fw, wk


def composite(R, W, keys, idx):
    num = den = None
    for k in keys:
        if W.get(k, 0) <= 0:
            continue
        s = R[k][0].reindex(idx)
        a, b = (s * W[k]).fillna(0), s.notna().astype(float) * W[k]
        num = a if num is None else num + a
        den = b if den is None else den + b
    return None if num is None else num / den.where(den > 0) * 100


def bucket_table(score, fw, wk, h):
    sc = score.reindex(wk)
    rows = []
    for lo, hi, lab in RG.BUCKETS:
        sel = sc[(sc >= lo) & (sc < hi)].index
        row = {"lab": lab, "n": int(len(sel))}
        if len(sel) >= 8:
            f, d = fw[h].reindex(sel).dropna(), fw[("dd", h)].reindex(sel).dropna()
            row["mk"] = [r_(f.mean(), 1), r_((f > 0).mean() * 100, 0), r_(d.median(), 1), r_((d <= -10).mean() * 100, 0)]
        rows.append(row)
    return rows


def one(mk, D, cal, comp, comb, prev):
    nm, fl, tk, inm = MK[mk]
    Y = D.get("Y", {})
    if tk not in Y:
        ERR.append(f"{mk}: 지수 {tk} 없음")
        return None
    R = build(mk, D, cal)
    stats, W, fw, wk = backtest(R, Y[tk], cal)
    for g in ("cycle", "timing"):                     # 한 묶음이 통째로 안 맞으면 같은 무게로 (점수가 비지 않게)
        bk = [k for k in R if R[k][2] == g and k in stats]
        if bk and not any(W.get(k, 0) > 0 for k in bk):
            for k in bk:
                W[k] = 1.0
                stats[k]["w"] = 1.0
    ck, tk_ = [k for k in R if R[k][2] == "cycle"], [k for k in R if R[k][2] == "timing"]
    cs, ts = composite(R, W, ck, cal), composite(R, W, tk_, cal)
    tables = {"cycle": bucket_table(cs, fw, wk, 126) if cs is not None else [], "timing": bucket_table(ts, fw, wk, 63) if ts is not None else []}
    w2 = wk[wk >= wk[-1] - pd.Timedelta(days=730)]
    hist = [[d.strftime("%Y-%m-%d"), r_(cs.get(d), 0) if cs is not None else None, r_(ts.get(d), 0) if ts is not None else None] for d in w2]
    qs = {}
    if cs is not None and ts is not None:
        cw, tw = cs.reindex(wk), ts.reindex(wk)
        for d in wk:
            c_, t_ = cw.get(d), tw.get(d)
            if c_ == c_ and t_ == t_ and c_ is not None and t_ is not None:
                qs.setdefault(RG.quad(c_, t_)[0], []).append(d)
    qt = {}
    for q, ds in qs.items():
        ix = pd.DatetimeIndex(ds)
        f, d = fw[63].reindex(ix).dropna(), fw[("dd", 63)].reindex(ix).dropna()
        qt[q] = {"n": len(ds), "mk": [r_(f.mean(), 1), r_((f > 0).mean() * 100, 0), r_(d.median(), 1), r_((d <= -10).mean() * 100, 0)]}
    L = live(mk, comp, comb)
    sig = []
    for k, (st, meta, g) in R.items():
        v = st.dropna()
        sig.append(dict(id=k, grp=g, st=int(v.iloc[-1]) if len(v) else None, w=W.get(k, 1.0) if k in stats else 1.0, bt=stats.get(k), **meta))
    for k, (s_now, meta) in L.items():
        sig.append(dict(id=k, grp="timing", st=s_now, w=1.0, bt=None, **meta))
    sig.sort(key=lambda s: (s["grp"] != "cycle",))

    def score(g):
        a = [s for s in sig if s["grp"] == g and s["st"] is not None and s["w"] > 0 and not (s["id"] == "thrust" and s["st"] == 0)]
        den = sum(s["w"] for s in a)
        return round(sum(s["w"] * s["st"] for s in a) / den * 100) if den else None
    sc, stt = score("cycle"), score("timing")
    label, verdict = RG.quad(sc, stt)

    def look(rows, v):
        for row in rows or []:
            lo, hi = next((a, b) for a, b, l in RG.BUCKETS if l == row["lab"])
            if v is not None and lo <= v < hi:
                return row
        return None
    pv = (prev.get("markets") or {}).get(mk) or {}
    pm = {s["id"]: s.get("st") for s in (pv.get("sig") or [])}
    changes = [{"id": s["id"], "name": s["name"], "from": pm.get(s["id"]), "to": s["st"]} for s in sig
               if pm.get(s["id"]) is not None and s["st"] is not None and pm[s["id"]] != s["st"]]
    dh = [h for h in (pv.get("daily") or []) if h[0] != RG.TODAY and len(h) == 3] + [[RG.TODAY, sc, stt]]
    log(f"{fl} {nm} · 경기 {sc} · 시장 {stt} · {label} · 신호 {len(sig)}")
    for k, s in stats.items():
        log(f"    {k:8s} w={s['w']} {s['h']} 좋음 {s['pos']} 경고 {s['neg']} 위험차 {s['risk']}")
    return {"mk": mk, "name": nm, "flag": fl, "index": inm, "cycle": sc, "timing": stt, "label": label, "verdict": verdict,
            "quad_stats": qt.get(label), "now_cycle": look(tables["cycle"], sc), "now_timing": look(tables["timing"], stt),
            "tables": tables, "quad_all": qt, "sig": sig, "changes": changes, "hist": hist, "daily": dh[-120:],
            "n_green": sum(1 for s in sig if s["st"] == 1), "n_red": sum(1 for s in sig if s["st"] == -1), "n_total": sum(1 for s in sig if s["st"] is not None),
            "updated": RG.NOW.strftime("%Y-%m-%d %H:%M"),
            "bt_note": f"{RG.BT_START[:4]}년 이후 매주 표본 · {inm} 하나로 계산 · 발표 지연 반영 · 무게 = 경고일 때 −10% 넘게 빠진 비율이 좋음일 때보다 얼마나 높았나 (같은 기간에서 정해 미래엔 덜 맞을 수 있음)"}


def main():
    prev, comb, comp = {}, {}, {}
    for p_, tgt in ((OUT, "prev"), (COMB, "comb")):
        try:
            v = json.load(open(p_, encoding="utf-8"))
            prev, comb = (v, comb) if tgt == "prev" else (prev, v)
        except Exception:
            pass
    try:
        comp = json.loads(RG.http(RG.OPD + "compass.json", 60, ua=RG.NH)).get("markets") or {}
    except Exception as e:
        ERR.append(f"compass.json: {e}")
    D = load()
    Y = D.get("Y", {})
    cal = Y["^GSPC"].index if "^GSPC" in Y else pd.bdate_range("1995-01-01", RG.NOW.date())
    cal = cal[cal >= pd.Timestamp("1995-01-01")]
    out = {"v": 1, "updated": RG.NOW.strftime("%Y-%m-%d %H:%M"), "order": ORDER_MK, "markets": {}}
    for mk in ORDER_MK:
        try:
            r = one(mk, D, cal, comp, comb, prev)
            if r:
                out["markets"][mk] = r
        except Exception as e:
            ERR.append(f"{mk} 전체: {e!r}"[:200])
            if mk in (prev.get("markets") or {}):
                out["markets"][mk] = {**prev["markets"][mk], "stale": True}
    out["errors"] = ERR[:30]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), default=lambda o: None)
    for e in ERR:
        log("  !", e)


if __name__ == "__main__":
    main()
