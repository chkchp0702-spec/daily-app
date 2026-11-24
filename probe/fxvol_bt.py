"""11/24 16시 🌊 흔들림 보강 — ok=false 인 일본 「일주일 −3%」(+ 최근3년 마이너스인 홍콩 5일) 에 환율 흔들림
  근거: 엔 급등(2024-08 엔 캐리 청산 등) 뒤 닛케이 급락 · 홍콩은 위안/달러(prob_x.FX 와 같은 짝)
  결과 보기 전에 정한 형태 3개(지금 화면 특성 = 기본 + hl5·gap·opt·cv 위에 하나씩):
    fx_d5  log(환율) 5일 변화 · fx_a5  |5일 변화| · fx_rv  log(20일 실현 변동성)
  시점: 야후 환율 일봉 t 는 유럽·미국 시간에 닫힘 → 저녁판(아시아 t 마감 직후)은 t−1 값, 아침판은 t 값
  대상: JP·HK × dn5 × 저녁/아침판 = 12번(참고로 dn2 도 같이 보되 판정은 dn5 만)
  붙이는 조건(전과 같음): 한 판에서 앞·뒤·최근3년 실력 모두 기본보다↑ + 최근3년 > 0 + 세 칸 모두 +0.3 이상 + 다른 판 앞·뒤 안 나빠짐"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

FXS = {"JP": "JPY=X", "HK": "CNY=X"}
syms = sorted({prob.MK[m]["ix"] for m in FXS} | {"^GSPC", "^VIX", "^VIX9D", "^SKEW"} | set(FXS.values()))
H = {}
for s in syms:
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()), "~", str(H[s].index[-1].date()), flush=True)

spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
out = {}; summary = []; ntest = 0
for mk, fs in FXS.items():
    cfg = prob.MK[mk]
    px = H[cfg["ix"]]; c = px["Close"]; idx = c.index; bd = idx[-1]
    fx = H[fs]["Close"]; fx = fx[(fx > 0)]
    lf = np.log(fx)
    raw = {"fx_d5": (lf - lf.shift(5)).clip(-0.2, 0.2), "fx_rv": np.log(lf.diff().rolling(20, min_periods=15).std() + 1e-5)}
    raw["fx_a5"] = raw["fx_d5"].abs()
    rr = c.pct_change(); dfx = lf.diff().reindex(idx)
    print(f"날짜 확인 {mk}: 환율 하루 변화 vs 지수 같은 날 {dfx.corr(rr):.2f} · 다음 날 {dfx.corr(rr.shift(-1)):.2f} · 전날 {dfx.corr(rr.shift(1)):.2f}", flush=True)
    hl5 = prob_vol._hl5(px, idx)
    gap = None
    if mk in prob_vol.GAP_TG:
        i_ = pd.Series(idx, index=idx); gap = np.log((i_.shift(-1) - i_).dt.days.astype(float))
    R = {}
    for mn in ("저녁판", "아침판"):
        morning = mn == "아침판"
        if not morning:
            d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
            F = {k: v.shift(1).reindex(idx, method="ffill", limit=3) for k, v in raw.items()}
        else:
            d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
            F = {k: v.reindex(idx, method="ffill", limit=3) for k, v in raw.items()}
        if hl5 is not None: d["hl5"] = hl5
        if gap is not None: d["gap"] = gap
        for tg_, kind in prob_vol.OPT_TG.get(mk, {}).items():
            o_ = prob_vol._opt(H, kind, idx, bd, True, morning)
            if o_ is not None: d["opt_" + kind] = o_
        for k, f in F.items():
            d[k] = f
        for tg in ("dn5", "dn2"):
            base = base0 + (["hl5"] if hl5 is not None and tg in prob_vol.HL_TG.get(mk, ()) else []) \
                + (["gap"] if gap is not None and tg in prob_vol.GAP_TG.get(mk, ()) else []) \
                + (["opt_" + prob_vol.OPT_TG[mk][tg]] if tg in prob_vol.OPT_TG.get(mk, {}) and ("opt_" + prob_vol.OPT_TG[mk][tg]) in d else [])
            dd = d.dropna(subset=base + list(F))
            res = {}
            P, B = prob_vol.walk(dd, base, tg); res["기본"] = prob_vol.judge(dd, P, B, tg)
            for k in F:
                if tg == "dn5": ntest += 1
                P, B = prob_vol.walk(dd, base + [k], tg); res["+" + k] = prob_vol.judge(dd, P, B, tg)
            b = res["기본"]
            if not b:
                print(mk, mn, tg, "표본 부족", flush=True); continue
            for nm, j in res.items():
                if not j:
                    continue
                better = nm != "기본" and all(j[s]["skill"] > b[s]["skill"] for s in ("앞", "뒤", "최근3년")) and j["최근3년"]["skill"] > 0
                big = better and all(j[s]["skill"] - b[s]["skill"] >= 0.3 for s in ("앞", "뒤", "최근3년"))
                line = f"{mk} {mn} {tg} {nm:7s} 앞 {j['앞']['skill']} 뒤 {j['뒤']['skill']} 최근3년 {j['최근3년']['skill']} 전체 {j['전체']['skill']} auc {j['auc']} n {j['n']} from {j['from']} {'✅' if better else ''}{'+0.3' if big else ''}"
                print(line, flush=True)
                if better:
                    summary.append(line + f" (기본 {b['앞']['skill']}/{b['뒤']['skill']}/{b['최근3년']['skill']} auc {b['auc']})")
            R[f"{mn}_{tg}"] = {k: ({s: v[s] for s in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n", "from")} if v else v) for k, v in res.items()}
    out[mk] = R
json.dump(out, open("probe/fxvol_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수(dn5)", ntest)
print("==== 세 칸 모두 오른 것(최근3년>0)")
for s in summary:
    print(s)
print("끝")
