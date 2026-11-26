"""11/26 14시 🌊 보정 점검: 실전 −2% 과소 예측(예측 15%·실제 32%, 25건 — 11/19~11/25 급락 주간)
  지금 화면 확률 = 걸어가기 로지스틱(raw) → 「과거 비슷한 확률 300일 실제 비율」 보정(calib k=300).
  질문: 이 보정이 걸어가기 역사에서 raw 보다 나은가? 특히 겁 많은 장(VIX ≥ 25)에서 낮춰 잡는가?
  미리 정한 비교 3가지: raw · 보정 k=300(지금, 그날 이전 걸어가기 예측만 씀) · 보정 k=300 최근 5년 안(1260일)만
  기본 특성 = 화면과 같은 틀(lrv5·lrv20·ar1·r5·lvix·dvix [+usa·usr 아시아 아침판] + hl5(HL_TG)) — cv·opt·gap 은 뺌
  바꾸는 조건: 앞·뒤·최근3년 실력 모두 지금(k=300)보다↑ (그 전엔 기록만)"""
import os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX"})
H = {}
for s in syms:
    x = yf.download(s, start="1995-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()), str(H[s].index[-1].date()), flush=True)
spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]


def causal_cal(P, y, k=300, win=None, lag=1):
    """각 날 i: i-lag 이전 걸어가기 예측·정답 중 |p − p_i| 가까운 k일의 실제 비율 (최소 3k 일 쌓인 뒤)"""
    pp = P.values; yy = y.values; out = np.full(len(pp), np.nan)
    for i in range(len(pp)):
        j = i - lag + 1
        lo = 0 if win is None else max(0, j - win)
        if j - lo < k * 3:
            continue
        a = pp[lo:j]; b = yy[lo:j]
        o = np.argpartition(np.abs(a - pp[i]), k)[:k]
        out[i] = b[o].mean()
    return pd.Series(out, index=P.index)


def sk(p, y, b):
    return round((1 - np.mean((p - y) ** 2) / np.mean((b - y) ** 2)) * 100, 1)


summ = []
for mk, cfg in prob.MK.items():
    px = H[cfg["ix"]]; c = px["Close"]; asia = mk != "US"
    if asia:
        d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
    else:
        d = prob_vol.frame(c, None, vix, False); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
    hl = np.log((px["High"] / px["Low"]).where(px["High"] > px["Low"]))
    d["hl5"] = np.log(hl.rolling(5, min_periods=3).mean() * 100 + 0.05)
    vx = prob_vol._align(vix, c.index) if asia else vix.reindex(c.index).ffill()
    for tg in prob_vol.TG:
        f = base0 + (["hl5"] if tg in prob_vol.HL_TG.get(mk, ()) else [])
        P, B = prob_vol.walk(d, f, tg)
        m = P.notna() & d[tg].reindex(P.index).notna()
        P, B = P[m], B[m]; y = d[tg].reindex(P.index)
        lag = 5 if tg == "dn5" else 1
        C = {"raw": P, "k300": causal_cal(P, y, 300, None, lag), "k300_5y": causal_cal(P, y, 300, 1260, lag)}
        ok = C["k300"].notna() & C["k300_5y"].notna()
        idx = P.index[ok]; yv = y[ok].values; bv = B[ok].values
        mid = idx[len(idx) // 2]; r3 = idx >= idx[-1] - pd.Timedelta(days=1096)
        st = (vx.reindex(idx) >= 25).values
        res = {}
        for nm, s in C.items():
            pv = s[ok].values
            res[nm] = {"앞": sk(pv[idx < mid], yv[idx < mid], bv[idx < mid]), "뒤": sk(pv[idx >= mid], yv[idx >= mid], bv[idx >= mid]),
                       "최근3년": sk(pv[r3], yv[r3], bv[r3]), "전체": sk(pv, yv, bv),
                       "겁장": sk(pv[st], yv[st], bv[st]) if st.sum() > 50 else None,
                       "겁장예측": round(pv[st].mean() * 100, 1) if st.sum() else None}
        real_st = round(yv[st].mean() * 100, 1) if st.sum() else None
        for nm, r in res.items():
            better = nm != "k300" and all(r[k] > res["k300"][k] for k in ("앞", "뒤", "최근3년"))
            line = (f"{mk} {tg} {nm:8s} 앞 {r['앞']} 뒤 {r['뒤']} 최근3년 {r['최근3년']} 전체 {r['전체']} | VIX≥25 {int(st.sum())}일 실력 {r['겁장']} "
                    f"예측 {r['겁장예측']}% 실제 {real_st}% | n {len(idx)} from {idx[0].date()} {'✅' if better else ''}")
            print(line, flush=True)
            if better:
                summ.append(line)
print("== 요약(지금 보정보다 앞·뒤·최근3년 모두 나은 것) ==")
for s in summ:
    print(s)
print("끝", len(summ))
