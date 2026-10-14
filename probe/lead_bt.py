"""🎲 10/15 검증: 선행 시장 고치기 — 옛(미국 t−1, 이미 반영된 것) vs 새(미국 t, 간밤) · 미국은 선물 갭을 닻으로.
걸어가며(walk-forward) 그날 이전 자료로만 확률을 만들고 2012~ 브라이어·로그손실·적중률·확률 폭을 잰다."""
import json, math, sys
import numpy as np, pandas as pd, yfinance as yf

SY = {"KR": "^KS11", "JP": "^N225", "CN": "000001.SS", "HK": "^HSI", "US": "^GSPC"}
df = yf.download(list(SY.values()), start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
def px(s):
    x = df[s][["Open", "Close"]].dropna(subset=["Close"]); x.index = pd.to_datetime(x.index).tz_localize(None); return x[~x.index.duplicated(keep="last")]
P = {k: px(v) for k, v in SY.items()}
us = P["US"]["Close"].pct_change()
def bk(v, edges):
    return np.digitize(v, edges)
E5 = [-0.01, -0.003, 0.003, 0.01]                       # 지금 쓰는 5칸
E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]   # 촘촘한 9칸
def wf(feat, y, edges, start="2012-01-01", prior=20):
    """그날 이전 자료로만 같은 칸의 상승 비율(베타 사전 = 전체 평균 · 강도 prior)"""
    b = pd.Series(bk(feat.values, edges), index=feat.index).where(feat.notna())
    out = pd.Series(np.nan, index=y.index)
    cnt, up = {}, {}
    tot_n = tot_u = 0
    for t in y.index:
        f = b.get(t)
        if t >= pd.Timestamp(start) and not (f is None or np.isnan(f)) and tot_n > 500:
            base = tot_u / tot_n
            n, u = cnt.get(f, 0), up.get(f, 0)
            out[t] = (u + prior * base) / (n + prior)
        yy = y.get(t)
        if yy is not None and not np.isnan(yy) and not (f is None or np.isnan(f)):
            cnt[f] = cnt.get(f, 0) + 1; up[f] = up.get(f, 0) + yy; tot_n += 1; tot_u += yy
    return out
def base_wf(y, start="2012-01-01"):
    e = y.expanding().mean().shift(1); return e.where(y.index >= pd.Timestamp(start))
def sc(p, y):
    m = p.notna() & y.notna(); p, y = p[m].clip(0.01, 0.99), y[m]
    return {"n": int(m.sum()), "brier": round(float(((p - y) ** 2).mean()), 4), "logloss": round(float(-(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()), 4),
            "hit": round(float(((p >= 0.5) == (y == 1)).mean() * 100), 1), "spread": round(float((p - 0.5).abs().mean() * 100), 1),
            "p_ge60_or_le40": round(float(((p >= 0.6) | (p <= 0.4)).mean() * 100), 1),
            "hit_when_confident": round(float((((p >= 0.6) & (y == 1)) | ((p <= 0.4) & (y == 0))).sum() / max(1, ((p >= 0.6) | (p <= 0.4)).sum()) * 100), 1)}
R = {}
for mk in ["KR", "JP", "CN", "HK"]:
    c = P[mk]["Close"]; y1 = (c.shift(-1) > c).astype(float).where(c.shift(-1).notna())
    usr = us.reindex(c.index, method="ffill")
    old = usr.shift(1)                       # 지금 코드: 미국 t−1 (아시아 t 마감에 이미 반영)
    new = us.reindex(c.index)                # 새: 미국 t (아시아 t 마감 뒤 · t+1 개장 전) — 미국 휴장이면 비움
    R[mk] = {"base": sc(base_wf(y1), y1), "old5": sc(wf(old, y1, E5), y1), "new5": sc(wf(new, y1, E5), y1), "new9": sc(wf(new, y1, E9), y1)}
    # 지금(10/14 미국 −1.11%) 같은 칸의 새 확률
    b9 = bk([us.dropna().iloc[-1]], E9)[0]; nb = pd.Series(bk(new.values, E9), index=new.index).where(new.notna())
    h = y1[(nb == b9) & y1.notna()]; R[mk]["now_new9"] = {"us": round(float(us.dropna().iloc[-1]) * 100, 2), "n": int(len(h)), "p": round(float(h.mean()), 3)}
# 미국: 시가 갭(선물로 미리 앎) 닻
c, o = P["US"]["Close"], P["US"]["Open"]
y0 = (c > c.shift(1)).astype(float).where(c.shift(1).notna())
gap = (o / c.shift(1) - 1)
gap = gap.where(gap.abs() > 1e-6)           # 예전 야후 자료는 시가=전일 종가인 날이 많음 → 빼기
R["US"] = {"base": sc(base_wf(y0), y0), "gap5": sc(wf(gap, y0, E5), y0), "gap9": sc(wf(gap, y0, E9), y0), "gap_n": int(gap.notna().sum()), "gap_from": str(gap.dropna().index[0].date())}
json.dump(R, open("probe/lead_bt.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
