"""11/18 16시 🌊 흔들림 모델 보강 — prob_vol 기본 특성 위에 근거 하나씩 더해 걸어가기(앞·뒤·최근3년) 비교
  대상: 5개 시장 × big1·dn2·dn5 × 저녁판(간밤 미국 전)·아침판(간밤 S&P 반영)
  후보:
    hl5   자기 지수 5일 평균 고가·저가 폭(log(H/L)) — 종가만으론 안 보이는 장중 흔들림
    dd52  52주 고점 대비 낙폭(%)
    fx5   그 나라 통화 5일 변화(엔·원·위안 대 달러, 홍콩은 위안) — 일본·한국 급락에 엔고/원약
    dow   월요일·금요일(다음 거래일이 주말 건너뜀) 표시
    vxl   그 나라 쪽 변동성 지수(^JNIV 닛케이 VI · ^VXFXI 중국 ETF 변동성) 로그 — 받을 수 있을 때만
  붙이는 조건: 앞·뒤·최근3년 실력(1−브라이어/평소)이 모두 기본보다 높을 때"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

FX = {"KR": "KRW=X", "JP": "JPY=X", "CN": "CNY=X", "HK": "CNY=X"}
VXL = {"JP": "^JNIV", "CN": "^VXFXI", "HK": "^VXFXI"}
ixs = sorted({c["ix"] for c in prob.MK.values()})
syms = ixs + ["^GSPC", "^VIX"] + sorted(set(FX.values())) + sorted(set(VXL.values()))
df = yf.download(syms, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
H = {}
for s in syms:
    try:
        sub = df[s][["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
        sub.index = pd.to_datetime(sub.index).tz_localize(None)
        H[s] = sub[~sub.index.duplicated(keep="last")]
        print("자료", s, len(H[s]), str(H[s].index[0].date()) if len(H[s]) else "-", flush=True)
    except Exception as e:
        print("자료 없음", s, e)
for s in ixs:
    if s not in H or len(H[s]) < 3000:
        x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
        if isinstance(x.columns, pd.MultiIndex):
            x.columns = x.columns.get_level_values(0)
        x.index = pd.to_datetime(x.index).tz_localize(None)
        H[s] = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
        print("다시", s, len(H[s]))

spx = H["^GSPC"]["Close"].dropna(); vix = H["^VIX"]["Close"].dropna()
out = {}
for mk, cfg in prob.MK.items():
    px = H.get(cfg["ix"])
    if px is None or len(px) < 1500:
        continue
    asia = mk != "US"
    c = px["Close"].dropna()
    hl = np.log((px["High"] / px["Low"]).where(px["High"] > px["Low"]))
    extra = pd.DataFrame(index=c.index)
    extra["hl5"] = np.log(hl.reindex(c.index).rolling(5, min_periods=3).mean() * 100 + 0.05)
    extra["dd52"] = ((c / c.rolling(252, min_periods=120).max() - 1) * 100).clip(-60, 0)
    if mk in FX and FX[mk] in H:
        f = H[FX[mk]]["Close"].dropna()
        f = f[(f > 0)]
        extra["fx5"] = (prob_vol._align(np.log(f).diff(5) * 100, c.index)).clip(-10, 10)
    dw = pd.Series(c.index.dayofweek, index=c.index)
    extra["dow"] = ((dw == 0) | (dw == 4)).astype(float)
    if mk in VXL and VXL[mk] in H and len(H[VXL[mk]]) > 1500:
        v = H[VXL[mk]]["Close"].dropna(); v = v[v > 0]
        extra["vxl"] = np.log(prob_vol._align(v, c.index))
    modes = {"미국": None} if not asia else {"저녁판": "eve", "아침판": "mor"}
    R = {}
    for mn, mode in modes.items():
        if mode == "eve":
            d = prob_vol.frame(c, None, vix.shift(1), True)
            base = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        elif mode == "mor":
            d = prob_vol.frame(c, spx, vix, True)
            base = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
        else:
            d = prob_vol.frame(c, None, vix, False)
            base = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        for k in extra.columns:
            d[k] = extra[k]
        for tg in prob_vol.TG:
            res = {}
            # 같은 표본: 후보 특성이 있는 날만 비교 (vxl 은 짧아서 따로 기본을 다시 잼)
            for nm, f in [("기본", base)] + [("+" + k, base + [k]) for k in extra.columns]:
                dd = d.dropna(subset=[k for k in extra.columns if k != "vxl"]) if nm != "+vxl" else d.dropna(subset=["vxl"])
                if nm == "+vxl":
                    P0, B0 = prob_vol.walk(dd, base, tg); j0 = prob_vol.judge(dd, P0, B0, tg)
                    res["기본(vxl표본)"] = j0
                try:
                    P, B = prob_vol.walk(dd, f, tg)
                    res[nm] = prob_vol.judge(dd, P, B, tg)
                except Exception as e:
                    res[nm] = {"err": str(e)[:100]}
            b = res["기본"]
            for nm, j in res.items():
                if not j or "err" in j:
                    print(mk, mn, tg, nm, j, flush=True); continue
                ref = res["기본(vxl표본)"] if nm == "+vxl" else b
                better = nm.startswith("+") and ref and all(j[s]["skill"] > ref[s]["skill"] for s in ("앞", "뒤", "최근3년"))
                print(mk, mn, tg, f"{nm:12s}", "앞", j["앞"]["skill"], "뒤", j["뒤"]["skill"], "최근3년", j["최근3년"]["skill"], "전체", j["전체"]["skill"], "auc", j["auc"], "ok", j["ok"], "n", j["n"], "✅" if better else "", flush=True)
            R[f"{mn}_{tg}"] = {k: ({s: v[s] for s in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n")} if v and "err" not in v else v) for k, v in res.items()}
    out[mk] = R
json.dump(out, open("probe/volx_bt.json", "w"), ensure_ascii=False)
print("끝")
