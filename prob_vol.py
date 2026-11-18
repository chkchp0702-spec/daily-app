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


def conf(d, feats, lo=0.4, hi=0.6):
    """🎯 자신 있는 날: 방향 확률 걸어가기에서 60%↑·40%↓ 날만 적중률"""
    P, B = walk(d, feats, "y1")
    m = P.notna() & d["y1"].reindex(P.index).notna()
    if m.sum() < 500:
        return None
    y = d["y1"].reindex(P.index)[m].values; p = P[m].values; idx = P.index[m]
    mid = idx[len(idx) // 2]
    out = {"n": int(m.sum()), "from": str(idx[0].date())}
    for nm, k in (("앞", idx < mid), ("뒤", idx >= mid), ("최근3년", idx >= idx[-1] - pd.Timedelta(days=1096)), ("전체", np.ones(len(idx), bool))):
        sel = k & ((p >= hi) | (p <= lo))
        hit_all = float(np.mean((p[k] >= 0.5) == (y[k] == 1)))
        out[nm] = {"all_hit": _r(hit_all * 100, 1), "sel_share": _r(sel.sum() / max(1, k.sum()) * 100, 1), "sel_n": int(sel.sum()),
                   "sel_hit": _r(float(np.mean((p[sel] >= 0.5) == (y[sel] == 1))) * 100, 1) if sel.sum() else None,
                   "up_hit": _r(float(y[k & (p >= hi)].mean()) * 100, 1) if (k & (p >= hi)).sum() else None,
                   "dn_hit": _r(float(1 - y[k & (p <= lo)].mean()) * 100, 1) if (k & (p <= lo)).sum() else None}
    return out


def run(H, MK, fresh_us=None):
    """H: {sym: DataFrame(Close…)} · MK: prob.MK · fresh_us: {mk: True} 간밤 미국 마감이 그 시장 마지막 봉 뒤에 나왔는지"""
    sp = H.get("^GSPC", pd.DataFrame()).get("Close")
    vix = H.get("^VIX", pd.DataFrame()).get("Close")
    out = {}
    for mk, cfg in MK.items():
        px = H.get(cfg["ix"])
        if px is None or len(px) < 1500:
            continue
        asia = mk != "US"
        try:
            d = frame(px["Close"].dropna(), sp if asia else None, vix, asia)
        except Exception as e:
            out[mk] = {"err": str(e)[:120]}
            continue
        base_f = ["lrv5", "lrv20", "ar1", "r5"] + (["lvix", "dvix"] if vix is not None else [])
        # 아시아: 간밤 미국이 이미 나왔으면 「아침판」(간밤 S&P 포함), 아니면 「저녁판」(간밤 미국 모름 → VIX 도 하루 전 값)
        morning = bool(asia and (fresh_us or {}).get(mk) and sp is not None)
        if asia and not morning and vix is not None:
            d2 = frame(px["Close"].dropna(), None, vix.shift(1), True)
            dd, ff = d2, base_f
        else:
            dd, ff = d, base_f + (["usa", "usr"] if asia and sp is not None else [])
        R = {"mode": "아침판(간밤 미국 반영)" if morning else ("저녁판(간밤 미국 전)" if asia else "미국"), "t": {}}
        for tg in TG:
            try:
                P, B = walk(dd, ff, tg)
                j = judge(dd, P, B, tg)
                p_now, at = now_prob(dd, ff, tg)
                base_now = float(dd[tg].dropna().iloc[-2520:].mean())     # 최근 10년 평소 비율
                R["t"][tg] = {"name": TG[tg], "p": _r(p_now, 3), "base": _r(base_now, 3), "at": at, "ok": bool(j and j["ok"]), "val": j}
            except Exception as e:
                R["t"][tg] = {"name": TG[tg], "err": str(e)[:160]}
        if asia and sp is not None:
            try:
                R["conf"] = conf(d, ["usr", "ar1", "r5"] + (["lvix"] if vix is not None else []))
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
    res = run(H, prob.MK, {m: True for m in prob.MK})
    print(json.dumps(res, ensure_ascii=False)[:6000])
