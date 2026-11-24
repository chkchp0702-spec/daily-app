"""11/24 12시 🌊 흔들림 보강 — 그 나라 자기 변동성 지수(CNBC ts-api) → 한국·일본·홍콩 3목표 × 저녁/아침판
  11/18 volx_bt 에선 야후에 ^JNIV·^VXFXI 가 없어 「그 나라 변동성 지수」를 제대로 못 봄 → CNBC 로 다시.
  자료: 한국 .KSVKOSPI(2009-04~) · 일본 .JNIV(2003-01~) · 홍콩 .VHSI(2010-07~)
  결과 보기 전에 정한 형태 3개(지금 화면 특성 = 기본 + hl5·gap·opt 위에 하나씩):
    cv_lv  log(수준) · cv_pc  1년 백분위 · cv_d5  5일 변화(log)
  시점: 아시아 변동성 지수는 그 나라 장 마감과 함께 정해짐 → 날짜 t 값은 저녁판(t 마감 직후)·아침판 모두 씀
  붙이는 조건(전과 같음): 한 판에서 앞·뒤·최근3년 실력 모두 기본보다↑ + 최근3년 > 0 + 세 칸 모두 +0.3 이상 + 다른 판 앞·뒤 안 나빠짐"""
import json, os, sys, urllib.request
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

CV = {"KR": ".KSVKOSPI", "JP": ".JNIV", "HK": ".VHSI"}
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
end = (pd.Timestamp.today() + pd.Timedelta(days=2)).strftime("%Y%m%d")
CVS = {}
for mk, sym in CV.items():
    try:
        u = f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/1D/20030101000000/{end}000000/adjusted/EST5EDT.json"
        with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40) as r:
            bars = json.loads(r.read().decode("utf-8")).get("barData", {}).get("priceBars", [])
        v = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
        v = v[~v.index.duplicated(keep="last")]; v = v[v > 0]
        CVS[mk] = v
        print("변동성 지수", mk, sym, len(v), str(v.index[0].date()), "~", str(v.index[-1].date()), v.iloc[-1], flush=True)
    except Exception as e:
        print("변동성 지수 실패", mk, sym, e, flush=True)

syms = sorted({prob.MK[m]["ix"] for m in CV} | {"^GSPC", "^VIX", "^VIX9D", "^SKEW"})
H = {}
for s in syms:
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()), flush=True)

spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
out = {}; summary = []; ntest = 0
for mk in CV:
    if mk not in CVS:
        continue
    cfg = prob.MK[mk]
    px = H[cfg["ix"]]; c = px["Close"]; idx = c.index; bd = idx[-1]
    cv = CVS[mk].reindex(idx)                               # 같은 날 값만(빈 날은 비움 — ffill 안 함)
    # 날짜 확인: 변동성 지수 하루 변화와 지수 등락 상관(같은 날 강한 음수 · 다음 날 ≈0 이어야 함)
    dcv = np.log(cv).diff(); rr = c.pct_change()
    print(f"날짜 확인 {mk}: 같은 날 상관 {dcv.corr(rr):.2f} · 다음 날 {dcv.corr(rr.shift(-1)):.2f} · 전날 {dcv.corr(rr.shift(1)):.2f}", flush=True)
    lc = np.log(cv)
    F = {"cv_lv": lc, "cv_pc": lc.rolling(252, min_periods=200).rank(pct=True), "cv_d5": (lc - lc.shift(5)).clip(-1, 1)}
    hl5 = prob_vol._hl5(px, idx)
    gap = None
    if mk in prob_vol.GAP_TG:
        i_ = pd.Series(idx, index=idx); gap = np.log((i_.shift(-1) - i_).dt.days.astype(float))
    R = {}
    for mn in ("저녁판", "아침판"):
        morning = mn == "아침판"
        if not morning:
            d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        else:
            d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
        if hl5 is not None: d["hl5"] = hl5
        if gap is not None: d["gap"] = gap
        for tg_, kind in prob_vol.OPT_TG.get(mk, {}).items():
            o_ = prob_vol._opt(H, kind, idx, bd, True, morning)
            if o_ is not None: d["opt_" + kind] = o_
        for k, f in F.items():
            d[k] = f
        for tg in prob_vol.TG:
            base = base0 + (["hl5"] if hl5 is not None and tg in prob_vol.HL_TG.get(mk, ()) else []) \
                + (["gap"] if gap is not None and tg in prob_vol.GAP_TG.get(mk, ()) else []) \
                + (["opt_" + prob_vol.OPT_TG[mk][tg]] if tg in prob_vol.OPT_TG.get(mk, {}) and ("opt_" + prob_vol.OPT_TG[mk][tg]) in d else [])
            dd = d.dropna(subset=base + list(F))
            res = {}
            P, B = prob_vol.walk(dd, base, tg); res["기본"] = prob_vol.judge(dd, P, B, tg)
            for k in F:
                ntest += 1
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
json.dump(out, open("probe/cvix_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수", ntest)
print("==== 세 칸 모두 오른 것(최근3년>0)")
for s in summary:
    print(s)
print("끝")
