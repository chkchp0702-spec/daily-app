"""
🌊 흔들림·급락 위험 확률 + 🎯 자신 있는 날 — 11/18 사용자 「맨날 소득이 없냐 · 발상의 전환」
  「내일 오를까」는 거의 동전(상한 53~56%) → 방향 대신 미리 맞히기 쉬운 「얼마나 흔들릴까」를 확률로.
  목표 (그 시장 마지막 종가 기준 다음 거래일·5거래일):
    big1  내일 하루 ±1% 넘게 움직일 확률 (흔들림)
    dn2   내일 −2% 넘게 빠질 확률 (급락)
    dn5   일주일(5거래일) 뒤 −3% 넘게 빠져 있을 확률
  특성: 자기 5·20일 실현 변동성(로그) · 오늘 등락 크기 · 5일 수익 · VIX(로그) · VIX 5일 변화
        아시아 「아침판」은 + 간밤 S&P 등락(크기·부호) — 아시아 장 열리기 전에 이미 아는 정보
  검증(매 실행마다 다시): 2006~ 해마다 그 전 자료만으로 다시 맞춰 다음 해를 맞히는 걸어가기 →
        브라이어를 「그때까지의 평소 비율」과 비교한 실력 점수(1 − 모델/평소), 앞·뒤 절반 + 최근 3년, AUC.
        앞·뒤 절반 모두 평소보다 낫고 전체 실력 ≥ 2% 일 때만 「검증 통과」로 화면에 숫자를 냄(아니면 평소 비율).
  🎯 자신 있는 날: 같은 걸어가기로 「아침판 방향 확률」(간밤 S&P + 자기 등락 로지스틱)이 60% 넘거나 40% 아래인 날만
        모아 실제 적중률 — 매일 반반인 날까지 다 맞히려 하지 말고, 근거가 강한 날만 말하기.
  prob.py main() 이 run(H) 을 불러 prob.json 의 "vol" 에 넣음. 실패해도 나머지 확률엔 영향 없음.
"""
import math

import numpy as np
import pandas as pd

TG = {"big1": "내일 ±1% 넘게 움직일 확률", "dn2": "내일 −2% 넘게 빠질 확률", "dn5": "일주일 뒤 −3% 넘게 빠져 있을 확률"}
START = 2006


def _r(v, n=3):
    return None if v is None or (isinstance(v, float) and not math.isfinite(v)) else round(float(v), n)


def _fit(X, y, l2=2.0, it=30):
    n, k = X.shape
    Xb = np.c_[np.ones(n), X]
    w = np.zeros(k + 1)
    for _ in range(it):
        p = 1 / (1 + np.exp(-np.clip(Xb @ w, -30, 30)))
        g = Xb.T @ (p - y) + l2 * np.r_[0, w[1:]]
        Hm = (Xb * (p * (1 - p))[:, None]).T @ Xb + l2 * np.diag(np.r_[0, np.ones(k)])
        try:
            w -= np.linalg.solve(Hm, g)
        except Exception:
            break
    return w


def _pred(w, X):
    return 1 / (1 + np.exp(-np.clip(np.c_[np.ones(len(X)), X] @ w, -30, 30)))


def _auc(y, s):
    y = np.asarray(y); s = np.asarray(s)
    o = np.argsort(s); r = np.empty(len(s)); r[o] = np.arange(1, len(s) + 1)
    npos = y.sum(); nneg = len(y) - npos
    if npos == 0 or nneg == 0:
        return None
    return float((r[y == 1].sum() - npos * (npos + 1) / 2) / (npos * nneg))


def _align(s, idx):
    u = s[~s.index.duplicated(keep="last")].sort_index()
    return u.reindex(u.index.union(idx)).ffill().reindex(idx)


def frame(c, sp=None, vix=None, asia=True):
    """지수 종가 c → 특성·목표 표. sp·vix = 미국 종가(아시아면 미국 날짜 t → 아시아 날짜 t 에: 아시아 t+1 장 전에 아는 값)"""
    c = c.astype(float)
    r = c.pct_change()
    d = pd.DataFrame(index=c.index)
    d["lrv5"] = np.log(r.rolling(5).std() * 100 + 0.05)
    d["lrv20"] = np.log(r.rolling(20).std() * 100 + 0.05)
    d["ar1"] = np.log(r.abs() * 100 + 0.1)
    d["r5"] = (c.pct_change(5) * 100).clip(-15, 15)
    if vix is not None:
        v = _align(vix, c.index) if asia else vix.reindex(c.index).ffill()
        d["lvix"] = np.log(v)
        d["dvix"] = (np.log(v) - np.log(v.shift(5))).clip(-1, 1)
    if sp is not None and asia:
        spr = _align(sp.pct_change() * 100, c.index)
        d["usa"] = np.log(spr.abs() + 0.1)          # 간밤 S&P 크기
        d["usr"] = spr.clip(-6, 6)                    # 간밤 S&P 부호 (급락 쪽)
    f1 = c.shift(-1) / c - 1
    f5 = c.shift(-5) / c - 1
    d["big1"] = (f1.abs() > 0.01).astype(float).where(f1.notna())
    d["dn2"] = (f1 < -0.02).astype(float).where(f1.notna())
    d["dn5"] = (f5 < -0.03).astype(float).where(f5.notna())
    d["y1"] = (f1 > 0).astype(float).where(f1.notna())
    return d


def walk(d, feats, tgt, start=START):
    """해마다 그 전 자료로 맞춰 다음 해를 맞힘 → (예측, 평소) 시리즈"""
    D = d.dropna(subset=feats)
    P = pd.Series(np.nan, index=D.index); B = pd.Series(np.nan, index=D.index)
    years = sorted({x for x in D.index.year if x >= start})
    for yr in years:
        # 5일 목표는 학습 끝 5일 겹침을 피함
        tr = D[(D.index.year < yr)].dropna(subset=[tgt])
        if tgt == "dn5":
            tr = tr.iloc[:-5]
        te = D[D.index.year == yr]
        if len(tr) < 750 or not len(te):
            continue
        X = tr[feats].values; mu, sd = X.mean(0), X.std(0) + 1e-9
        w = _fit((X - mu) / sd, tr[tgt].values)
        P.loc[te.index] = _pred(w, (te[feats].values - mu) / sd)
        B.loc[te.index] = float(tr[tgt].mean())
    return P, B


def judge(d, P, B, tgt):
    m = P.notna() & d[tgt].reindex(P.index).notna()
    if m.sum() < 500:
        return None
    y = d[tgt].reindex(P.index)[m].values; p = P[m].values; b = B[m].values; idx = P.index[m]
    mid = idx[len(idx) // 2]
    out = {"n": int(m.sum()), "from": str(idx[0].date()), "mid": str(mid.date())}
    for nm, k in (("앞", idx < mid), ("뒤", idx >= mid), ("최근3년", idx >= idx[-1] - pd.Timedelta(days=1096)), ("전체", np.ones(len(idx), bool))):
        bm, bb = float(np.mean((p[k] - y[k]) ** 2)), float(np.mean((b[k] - y[k]) ** 2))
        out[nm] = {"brier": _r(bm, 5), "base": _r(bb, 5), "skill": _r((1 - bm / bb) * 100, 1)}
    out["auc"] = _r(_auc(y, p), 3)
    out["rate"] = _r(float(y.mean()) * 100, 1)
    # 확률 높은 날 / 낮은 날 실제 비율 (보정 확인용 5분위)
    q = pd.qcut(pd.Series(p), 5, labels=False, duplicates="drop").values
    out["bins"] = [{"pred": _r(p[q == i].mean() * 100, 1), "real": _r(y[q == i].mean() * 100, 1), "n": int((q == i).sum())} for i in range(int(np.nanmax(q)) + 1)]
    out["ok"] = bool(out["앞"]["skill"] > 0 and out["뒤"]["skill"] > 0 and out["전체"]["skill"] >= 2)
    return out


def now_prob(d, feats, tgt):
    D = d.dropna(subset=feats)
    tr = D.dropna(subset=[tgt])
    if len(tr) < 750 or not len(D):
        return None, None
    X = tr[feats].values; mu, sd = X.mean(0), X.std(0) + 1e-9
    w = _fit((X - mu) / sd, tr[tgt].values)
    last = D.iloc[[-1]]
    return float(_pred(w, (last[feats].values - mu) / sd)[0]), str(last.index[0].date())


def calib(P, y, p_now, k=300):
    """보정: 걸어가기에서 지금과 가장 비슷한 확률이 나왔던 k일의 실제 비율 (로지스틱이 극단에서 부풀리는 것 막기)"""
    m = P.notna() & y.reindex(P.index).notna()
    if p_now is None or m.sum() < k * 3:
        return None, 0, None
    pp = P[m].values; yy = y.reindex(P.index)[m].values
    o = np.argsort(np.abs(pp - p_now))[:k]
    return float(yy[o].mean()), int(k), (float(pp[o].min()), float(pp[o].max()))


def conf(d, feats, lo=0.4, hi=0.6):
    """🎯 자신 있는 날: 방향 확률 걸어가기에서 60%↑·40%↓ 날만 적중률"""
    P, B = walk(d, feats, "y1")
    p_now, at = now_prob(d, feats, "y1")
    m = P.notna() & d["y1"].reindex(P.index).notna()
    if m.sum() < 500:
        return None
    y = d["y1"].reindex(P.index)[m].values; p = P[m].values; idx = P.index[m]
    mid = idx[len(idx) // 2]
    out = {"n": int(m.sum()), "from": str(idx[0].date()), "p": _r(p_now, 3), "at": at}
    for nm, k in (("앞", idx < mid), ("뒤", idx >= mid), ("최근3년", idx >= idx[-1] - pd.Timedelta(days=1096)), ("전체", np.ones(len(idx), bool))):
        sel = k & ((p >= hi) | (p <= lo))
        hit_all = float(np.mean((p[k] >= 0.5) == (y[k] == 1)))
        out[nm] = {"all_hit": _r(hit_all * 100, 1), "sel_share": _r(sel.sum() / max(1, k.sum()) * 100, 1), "sel_n": int(sel.sum()),
                   "sel_hit": _r(float(np.mean((p[sel] >= 0.5) == (y[sel] == 1))) * 100, 1) if sel.sum() else None,
                   "up_hit": _r(float(y[k & (p >= hi)].mean()) * 100, 1) if (k & (p >= hi)).sum() else None,
                   "dn_hit": _r(float(1 - y[k & (p <= lo)].mean()) * 100, 1) if (k & (p <= lo)).sum() else None}
    return out


# 🎯 11/18 14시 「자신 있는 날 넓히기」(probe/conf_bt.py · run 44242154353 · 2000~ 걸어가기, EWY 이 있는 날만 같은 표본):
#   한국에 etfx = 간밤 미국 상장 한국 ETF(EWY) 그날 등락 − 코스피 그날 등락(한국 마감 뒤 더 움직인 몫) 더함 →
#   골라진 날 비율·적중 앞 39.5%·68.6 → 40.0%·69.0 · 뒤 35.4%·73.0 → 37.0%·74.4 · 최근3년 36.1%·70.3 → 41.2%·72.3 · 방향 브라이어 0.2302→0.2290 ✅
#   일본(EWJ)은 고른 날 늘지만 적중 앞 77.3→76.2·최근3년 75.6→73.2 ❌ · 홍콩(EWH) 뒤 고른 날 38.9→38.5 ❌ · 자기 등락 부호(r1) ❌ · 기준 58/42·62/38 은 비율↔적중 맞바꿈일 뿐 ❌
CONF_ETF = {"KR": "EWY", "CN": "ASHR"}
# 🎯 11/25 10시 「자신 있는 날 넓히기 4」(probe/cnconf_bt.py · run 45523407288 · ASHR 있는 날 2014~, 걸어가기 2018~ n 2089 같은 표본):
#   중국에 etfx = 미국 상장 A주 ETF(ASHR) 그날 등락 − 상해 그날 등락(상해 마감 뒤 미국 시간까지 더 움직인 몫, 다음 날 등락과 상관 0.135) →
#   골라진 날 비율·적중 앞 34.6%·62.0 → 34.9%·62.1 · 뒤 20.8%·62.2 → 22.8%·65.1 · 최근3년 20.0%·57.4 → 22.2%·60.5 · 방향 브라이어 0.2450→0.2433 ✅
#   ❌ 항셍−상해 그날 차(hsx, 뒤 적중 62.2→61.4) · ASHR 수준판(ashg, 앞 비율 34.6→34.4 — 브라이어는 0.2430 로 더 낫지만 미리 정한 조건 미달)
# 🎯 11/19 16시 「자신 있는 날 넓히기 2」(probe/nkd_bt.py · run 44477318026 · 2008~ 해마다 걸어가기, 같은 표본 n 4613):
#   일본에 nkg = log(CME 닛케이 선물 NKD=F 종가 / 닛케이 종가) 의 20일 평균 대비 벌어짐(도쿄 마감 뒤 선물이 더 움직인 몫 · 엔 지수 그대로라 EWJ 의 환율 잡음 없음) →
#   골라진 날 비율·적중 앞 56.0%·74.5 → 69.2%·77.3 · 뒤 54.8%·75.8 → 69.1%·80.3 · 최근3년 51.8%·75.7 → 75.3%·78.9 · 방향 브라이어 0.2124→0.1871 ✅
#   등락판(nkx = 선물 그날 등락 − 닛케이 그날 등락)은 최근3년 적중 75.7→72.0 ❌ · ES 마감 뒤(esx) 4개 시장 모두 거의 그대로 ❌ · 한국·중국·홍콩에 nkx ❌(브라이어 그대로·최근3년 적중↓)
# 🎯 11/23 10시 「자신 있는 날 넓히기 3」(probe/etflv_bt.py · run 45093104139 · 2008~ 해마다 걸어가기, 같은 표본 n 4650):
#   일본 nkg 와 같은 「수준판」 = log(미국 상장 ETF 종가 / 그 나라 지수 종가) 의 20일 평균 대비 벌어짐 (미리 정한 후보 5개)
#   한국 +ewg(EWY, etfx 에 더함): 골라진 날 비율·적중 앞 38.2%·69.0 → 42.5%·69.9 · 뒤 41.0%·73.7 → 44.2%·75.3 · 최근3년 43.5%·72.3 → 48.2%·74.7 · 브라이어 0.2295→0.2267 ✅
#   홍콩 +fxg(FXI = 미 상장 중국 대형주): 앞 45.0%·72.2 → 46.1%·72.6 · 뒤 40.9%·65.2 → 43.3%·68.5 · 최근3년 34.3%·64.0 → 37.0%·67.4 · 브라이어 0.2344→0.2293 ✅
#   (한국 ewg 로 etfx 바꾸기·홍콩 EWH 수준판도 통과했지만 더 약해 하나만) · 중국 +FXI 수준판 앞 적중 65.7→65.4 ❌
CONF_NKG = {"JP": "NKD=F", "KR": "EWY", "HK": "FXI"}
CONF_LBL = {"EWY": "미국 상장 ETF가 마감 뒤 더 움직인 몫", "NKD=F": "CME 닛케이 선물이 도쿄 마감 뒤 더 움직인 몫",
            "FXI": "미국 상장 중국 대형주 ETF가 홍콩 마감 뒤 더 벌어진 몫",
            "ASHR": "미국 상장 중국 A주 ETF가 상해 마감 뒤 더 움직인 몫"}

# 🌊 11/18 16시 「흔들림 모델 보강」(probe/volx_bt.py · run 44256638039 · 2006~ 해마다 걸어가기, 같은 표본):
#   hl5 = 자기 지수 5일 평균 고가·저가 폭 log(H/L) — 종가만으론 안 보이는 장중 흔들림.
#   앞·뒤·최근3년 실력이 한 판(저녁·아침)에서 모두 오르고 다른 판에서도 안 나빠진 곳만:
#   한국 ±1% 저녁 15.6/10.3/11.2 → 16.7/12.3/14.5 · 아침 16.4/11.3/12.4 → 17.3/13.3/15.6 · 한국 5일 −3% 아침 4.9/2.9/3.7 → 5.1/3.3/5.2
#   일본 −2% 저녁 2.7/2.8/0.4 → 2.9/3.1/0.9 · 중국 ±1% 아침 7.9/14.7/10.9 → 9.7/17.0/15.0 · 중국 −2% 아침 7.2/7.5/3.7 → 8.0/10.0/7.7
#   홍콩 −2% 아침 20.8/2.9/−3.1 → 21.0/3.2/−3.0 · 미국 ±1% 18.4/20.1/11.1 → 18.7/21.0/12.5 · −2% 4.7/5.4/4.1 → 5.9/6.0/4.7 · 5일 −3% 6.6/3.2/5.2 → 6.7/3.9/6.8
#   ❌ 한국 −2%(앞 13.0→12.6) · 일본·홍콩 ±1%(앞 같음) · 일본 5일(여전히 미달 — 저녁 0.5/1.1/−2.0) · 52주 낙폭·통화 5일·월/금 표시는 거의 다 ❌ · 닛케이 VI(^JNIV)·^VXFXI 야후 자료 없음
HL_TG = {"KR": {"big1", "dn5"}, "JP": {"dn2"}, "CN": {"big1", "dn2"}, "HK": {"dn2"}, "US": {"big1", "dn2", "dn5"}}

# 🌊 11/19 14시 「달력 근거」(probe/calvol_bt.py · run 44463114061 · 2006~ 해마다 걸어가기, 같은 표본):
#   gap = 내일 거래일까지 달력 일수(로그) — 연휴 앞에서는 「내일 −2%」 위험이 큼(쉬는 동안 쌓인 소식을 한 번에 반영).
#   한국 −2% 저녁 8.1/7.8/4.6 → 8.6/8.1/5.2 · 아침 17.3/10.3/10.6 → 18.2/10.9/11.6 (앞/뒤/최근3년 실력 %, 두 판 모두 세 칸↑) ✅
#   일본 −2% 아침 18.6/11.8/17.2 → 19.1/12.8/17.4 · 저녁 2.9/3.0/0.8 → 3.1/3.3/0.6(앞·뒤↑) ✅
#   ❌ 붙이지 않음: 만기일(opx) 중국 −2% +0.1~0.2 · 월말·월초(me) 일본 ±1% +0.1 — 세 칸↑이지만 108번 시험 중 너무 작아 우연과 구별 안 됨 ·
#      gap 홍콩·중국·미국·5일 목표 최근3년↓ · VIX 하루 변화(dvix1) 미국 −2% 앞 그대로
GAP_TG = {"KR": {"dn2"}, "JP": {"dn2"}}

# 🌊 11/20 10시 「옵션 꼬리 가격」 2-A(probe/skewvol_bt.py · run 44651400589 · 2006~ 해마다 걸어가기, 자료마다 같은 표본):
#   후보 3자료 × 3형태(수준·1년 백분위·5일 변화) × 5시장·3목표·저녁/아침판 = 243번 시험 → 「앞·뒤·최근3년 모두↑ + 최근3년>0」 12개.
#   우연(243번 중 5%)과 구별하려고 그중 세 칸 모두 +0.3 넘고 다른 판에서도 안 나빠진 것만 붙임:
#   v9  = log(VIX9D/VIX) 수준 — 미국 ±1% 15.6~: 26.2/13.7/10.4 → 26.9/14.7/11.1 (AUC 0.786→0.793, 백분위판도 통과)
#   skew= log(CBOE SKEW) 수준 — 한국 5일 −3% 저녁 11.6/4.2/3.4 → 12.5/4.7/4.3 · 아침 13.0/5.7/3.7 → 13.9/6.0/4.0
#   ❌ 작아서 안 붙임: 미국 −2% +풋콜(+0.2~0.6) · 한국 −2% +SKEW·풋콜 백분위(한 칸 +0.1~0.2 또는 다른 판 최근3년↓) · 일본 −2% +v9(아침판 뒤·최근3년↓) · 홍콩·중국 전부
OPT_TG = {"US": {"big1": "v9"}, "KR": {"dn5": "skew"}}
OPT_LBL = {"v9": "9일 공포 ÷ 30일 공포(VIX9D/VIX)", "skew": "옵션 꼬리 급락 값(CBOE SKEW)"}

# 🌊 11/24 12시 「그 나라 자기 변동성 지수」(probe/cvix_bt.py · run 45317476778 · 해마다 걸어가기, 자료 있는 날만 같은 표본):
#   11/18 volx_bt 땐 야후에 ^JNIV·^VXFXI 가 없어 못 봄 → CNBC ts-api 로 VKOSPI(.KSVKOSPI 2009~)·닛케이 VI(.JNIV 2003~)·VHSI(.VHSI 2010~).
#   날짜 확인: 하루 변화 vs 지수 등락 상관 같은 날 −0.51/−0.57/−0.52 · 다음 날 0.00/0.05/0.00(앞날 정보 없음).
#   미리 정한 3형태(수준 log·1년 백분위·5일 변화) × 3시장 × 3목표 × 저녁/아침판 = 54번 → 한 판 세 칸 모두 +0.3↑·최근3년>0·다른 판 앞·뒤 안 나빠짐:
#   cv = log(수준) — 한국 ±1% 저녁 13.5/13.7/16.9 → 13.9/15.5/20.2 · 아침 14.2/14.9/18.5 → 14.6/16.3/21.1
#                    한국 −2% 저녁 15.5/3.5/3.0 → 15.9/7.9/9.3 (AUC 0.776→0.839) · 아침 8.6/6.7/6.9 → 8.6/14.0/17.6
#                    일본 ±1% 저녁 8.8/6.9/4.3 → 9.4/8.3/4.8 · 아침 12.3/9.7/4.8 → 12.7/11.2/5.5
#                    홍콩 ±1% 저녁 3.0/2.7/−3.1 → 3.7/5.7/1.4 · 아침 3.2/2.8/−2.7 → 3.9/5.7/1.7 (최근3년 마이너스 → 플러스)
#   ❌ 홍콩 −2%(저녁 +0.2/+0.6/+1.4 · 아침 앞↓) · 한국·일본 −2% 5일 변화(아침만 +0.1~1.5) · 5일 −3% 모두 · 백분위판 모두
#   그날 값이 없으면(지수 사이트 늦음) 그 목표는 이 근거 없이 계산(묵은 값 안 씀).
CV_TG = {"KR": {"big1", "dn2"}, "JP": {"big1"}, "HK": {"big1"}}
CV_LBL = {"KR": "한국 공포지수 VKOSPI", "JP": "닛케이 변동성 지수", "HK": "항셍 변동성 지수 VHSI"}


def _opt(H, kind, idx, bd, asia, morning):
    """미국 옵션 꼬리 자료 → 지수 날짜에 맞춤(아시아 아침판 = 그날 밤 값 · 저녁판 = 하루 전 값)"""
    vix = H.get("^VIX", pd.DataFrame()).get("Close")
    if kind == "v9":
        a = H.get("^VIX9D", pd.DataFrame()).get("Close")
        if a is None or vix is None:
            return None
        s = np.log(a / vix.reindex(a.index))
    else:
        a = H.get("^SKEW", pd.DataFrame()).get("Close")
        if a is None:
            return None
        s = np.log(a.where(a > 0))
    s = s.dropna(); s = s[s.index <= bd]
    if len(s) < 1500:
        return None
    if asia:
        return _align(s if morning else s.shift(1), idx)
    return s.reindex(idx).ffill()


def _gap(idx, mk):
    """그날 → 다음 거래일 달력 일수(로그). 과거 = 지수 날짜 · 마지막 날 = holidays 거래소 달력(없으면 None)"""
    import datetime as _dt
    import holidays as _HL
    i = pd.Series(idx, index=idx)
    g = (i.shift(-1) - i).dt.days.astype(float)
    yrs = range(idx[-1].year, idx[-1].year + 2)
    cal = _HL.country_holidays(mk, years=yrs)
    for y in yrs:
        for md in (((12, 31), (1, 2), (1, 3)) if mk == "JP" else ((12, 31),)):
            cal[_dt.date(y, *md)] = "연말"
    t1 = idx[-1] + pd.Timedelta(days=1)
    while t1.weekday() >= 5 or t1.date() in cal:
        t1 += pd.Timedelta(days=1)
    g.iloc[-1] = float((t1 - idx[-1]).days)
    return np.log(g)


def _hl5(px, idx):
    if not {"High", "Low"} <= set(px.columns):
        return None
    hl = np.log((px["High"] / px["Low"]).where(px["High"] > px["Low"]))
    s = np.log(hl.reindex(idx).rolling(5, min_periods=3).mean() * 100 + 0.05)
    return s if s.notna().sum() > 1500 else None


def run(H, MK, base_dates=None):
    """H: {sym: DataFrame(Close…)} · MK: prob.MK · base_dates: {mk: "YYYY-MM-DD"} 앱 확률의 기준일(그 시장 마지막 확정 종가)
    아시아 「아침판」 = 기준일 같은 날짜의 미국 종가(그날 밤 미국)가 이미 있을 때 · 아니면 「저녁판」"""
    spx = H.get("^GSPC", pd.DataFrame()).get("Close")
    vix = H.get("^VIX", pd.DataFrame()).get("Close")
    out = {}
    for mk, cfg in MK.items():
        px = H.get(cfg["ix"])
        if px is None or len(px) < 1500:
            continue
        asia = mk != "US"
        bd = pd.Timestamp((base_dates or {}).get(mk) or px.index[-1])
        c_ = px["Close"].dropna(); c_ = c_[c_.index <= bd]            # 장중 미완성 봉은 빼고 기준일까지만
        sp = vix_ = None
        if spx is not None:
            sp = spx.dropna(); sp = sp[sp.index <= (bd if asia else bd)]
        if vix is not None:
            vix_ = vix.dropna(); vix_ = vix_[vix_.index <= bd]
        try:
            d = frame(c_, sp if asia else None, vix_, asia)
        except Exception as e:
            out[mk] = {"err": str(e)[:120]}
            continue
        base_f = ["lrv5", "lrv20", "ar1", "r5"] + (["lvix", "dvix"] if vix_ is not None else [])
        # 아시아: 간밤 미국이 이미 나왔으면 「아침판」(간밤 S&P 포함), 아니면 「저녁판」(간밤 미국 모름 → VIX 도 하루 전 값)
        morning = bool(asia and sp is not None and len(sp) and sp.index[-1] >= bd)
        if asia and not morning and vix_ is not None:
            d2 = frame(c_, None, vix_.shift(1), True)
            dd, ff = d2, base_f
        else:
            dd, ff = d, base_f + (["usa", "usr"] if asia and sp is not None else [])
        R = {"mode": "아침판(간밤 미국 반영)" if morning else ("저녁판(간밤 미국 전)" if asia else "미국"), "t": {}}
        hl5 = None
        try:
            hl5 = _hl5(px[px.index <= bd], dd.index)
        except Exception:
            hl5 = None
        if hl5 is not None:
            dd = dd.copy(); dd["hl5"] = hl5
        gap = None
        if mk in GAP_TG:
            try:
                gap = _gap(dd.index, mk)
                dd = dd.copy(); dd["gap"] = gap
            except Exception:
                gap = None
        opk = {}
        for tg_, kind in OPT_TG.get(mk, {}).items():
            try:
                o_ = _opt(H, kind, dd.index, bd, asia, morning)
                if o_ is not None and pd.notna(o_.iloc[-1]):
                    dd = dd.copy(); dd["opt_" + kind] = o_; opk[tg_] = kind
            except Exception:
                pass
        cvk = False
        if mk in CV_TG:
            try:
                cs = H.get("cv:" + mk)
                if cs is not None and len(cs.dropna()) > 1500:
                    cv_ = np.log(cs[~cs.index.duplicated(keep="last")].where(cs > 0)).reindex(dd.index)   # 같은 날 값만(ffill 안 함)
                    if pd.notna(cv_.iloc[-1]):
                        dd = dd.copy(); dd["cv"] = cv_; cvk = True
            except Exception:
                cvk = False
        for tg in TG:
            try:
                f_ = ff + (["hl5"] if hl5 is not None and tg in HL_TG.get(mk, ()) else []) + (["gap"] if gap is not None and tg in GAP_TG.get(mk, ()) else []) \
                    + (["opt_" + opk[tg]] if tg in opk else []) + (["cv"] if cvk and tg in CV_TG.get(mk, ()) else [])
                P, B = walk(dd, f_, tg)
                j = judge(dd, P, B, tg)
                p_now, at = now_prob(dd, f_, tg)
                pc, kn, rg = calib(P, dd[tg], p_now)
                base_now = float(dd[tg].dropna().iloc[-2520:].mean())     # 최근 10년 평소 비율
                R["t"][tg] = {"name": TG[tg], "p": _r(pc if pc is not None else p_now, 3), "raw": _r(p_now, 3), "k": kn,
                              "rng": [_r(rg[0], 3), _r(rg[1], 3)] if rg else None, "base": _r(base_now, 3), "at": at, "ok": bool(j and j["ok"]), "val": j,
                              "hl5": "hl5" in f_, "opt": OPT_LBL.get(opk.get(tg)), "cv": CV_LBL.get(mk) if "cv" in f_ else None, "gap": ("gap" in f_) and int(round(float(np.exp(gap.iloc[-1])))) or None}
            except Exception as e:
                R["t"][tg] = {"name": TG[tg], "err": str(e)[:160]}
        if asia and sp is not None and morning:
            try:
                cf_ = ["usr", "ar1", "r5"] + (["lvix"] if vix_ is not None else [])
                ex_ = None
                miss = []                                       # 🔍 11/25: 근거가 빠지면 왜 빠졌는지 남김(화면엔 안 씀)
                es_ = CONF_ETF.get(mk)
                et = H.get(es_ or "", pd.DataFrame()).get("Close")
                if es_ and (et is None or len(et.dropna()) <= 1500):
                    miss.append(f"{es_} 자료 {0 if et is None else len(et.dropna())}줄")
                if et is not None and len(et.dropna()) > 1500:
                    e_ = et.dropna(); e_ = e_[e_.index <= bd]
                    if len(e_) and e_.index[-1] >= bd:          # 기준일 밤 ETF 종가가 있어야(아침판)
                        d["etfx"] = (_align(e_.pct_change() * 100, c_.index) - c_.pct_change() * 100).clip(-8, 8)
                        cf_ = cf_ + ["etfx"]; ex_ = CONF_ETF[mk]
                    else:
                        miss.append(f"{es_} 마지막 {str(e_.index[-1].date()) if len(e_) else '-'} < 기준일 {str(bd.date())}")
                nks = CONF_NKG.get(mk)
                nk = H.get(nks or "", pd.DataFrame()).get("Close")
                if nks and nks != es_ and (nk is None or len(nk.dropna()) <= 1500):
                    miss.append(f"{nks} 자료 {0 if nk is None else len(nk.dropna())}줄")
                if nk is not None and len(nk.dropna()) > 1500:
                    n_ = nk.dropna(); n_ = n_[n_.index <= bd]
                    if len(n_) and n_.index[-1] >= bd:          # 기준일 밤(미국 날짜) 선물 종가가 있어야(아침판)
                        g_ = np.log(_align(n_, c_.index) / c_)
                        d["nkg"] = ((g_ - g_.rolling(20).mean().shift(1)) * 100).clip(-8, 8)
                        cf_ = cf_ + ["nkg"]; ex_ = ex_ or nks          # 한국은 EWY 하나로 두 근거(등락판 etfx + 수준판)
                    elif nks != es_:
                        miss.append(f"{nks} 마지막 {str(n_.index[-1].date()) if len(n_) else '-'} < 기준일 {str(bd.date())}")
                R["conf"] = conf(d, cf_)
                if R["conf"] is not None:
                    R["conf"]["etf"] = ex_
                    R["conf"]["etl"] = CONF_LBL.get(ex_) if ex_ else None
                    if miss:
                        R["conf"]["miss"] = miss
                        print("🎯 근거 빠짐", mk, miss)
            except Exception as e:
                R["conf"] = {"err": str(e)[:160]}
        out[mk] = R
    return out


if __name__ == "__main__":
    import json, os, sys
    sys.path.insert(0, os.getcwd())
    import prob
    syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX"})
    H = prob.load_hist(syms)
    res = run(H, prob.MK)
    print(json.dumps(res, ensure_ascii=False)[:6000])
