"""11/24 14시 🌊 2-B 마지막: 코스피200 옵션 외국인 순매수(KRX 계정 archive/x/kr_opt_inv.csv, 2010~) → 한국 흔들림·급락 위험
  결과 보기 전에 정한 후보(11/23 14시 기록대로): 외국인 풋 순매수 금액 fp · 외국인 (풋−콜) 순매수 금액 fpc
  형태 3개: 수준(부호 log: sign·log1p(|x|/1억)) · 1년 백분위 · 5일 합(부호 log)  → 6특성 × 3목표 × 저녁/아침판 = 36번
  시점: 투자자별 확정은 장 마감 뒤 → 저녁판 = 하루 전 값 · 아침판 = 그날 값
  기본 = 지금 화면 특성(hl5·gap·opt skew·cv VKOSPI 포함) · 같은 표본(옵션 자료 있는 날만)
  붙이는 조건: 한 판 앞·뒤·최근3년 모두↑ + 최근3년>0 + 세 칸 모두 +0.3 이상 + 다른 판 앞·뒤 안 나빠짐 · 방향 확률엔 안 붙임"""
import json, os, sys, urllib.request
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd, yfinance as yf
import prob_vol

O = pd.read_csv("archive/x/kr_opt_inv.csv", parse_dates=["date"])
O = O[O["inv"] == "외국인"].drop_duplicates(["date", "cp"], keep="last")
W = O.pivot(index="date", columns="cp", values="net_val").sort_index()
print("옵션 외국인", W.index.min().date(), "~", W.index.max().date(), "n", len(W), "0인 날", int(((W["C"] == 0) & (W["P"] == 0)).sum()), flush=True)
W = W[~((W["C"] == 0) & (W["P"] == 0))]
slog = lambda x: np.sign(x) * np.log1p(np.abs(x) / 1e8)
raw = {"fp": W["P"], "fpc": W["P"] - W["C"]}
F = {}
for k, s in raw.items():
    F[k + "_lv"] = slog(s)
    F[k + "_pc"] = s.rolling(252, min_periods=200).rank(pct=True)
    F[k + "_s5"] = slog(s.rolling(5).sum())

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
end = (pd.Timestamp.today() + pd.Timedelta(days=2)).strftime("%Y%m%d")
cvs = None
try:
    u = f"https://ts-api.cnbc.com/harmony/app/bars/.KSVKOSPI/1D/20030101000000/{end}000000/adjusted/EST5EDT.json"
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40) as r:
        bars = json.loads(r.read().decode("utf-8")).get("barData", {}).get("priceBars", [])
    cvs = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
    cvs = cvs[~cvs.index.duplicated(keep="last")]; cvs = cvs[cvs > 0]
    print("VKOSPI", len(cvs), flush=True)
except Exception as e:
    print("VKOSPI 실패", e, flush=True)

H = {}
for s in ("^KS11", "^GSPC", "^VIX", "^VIX9D", "^SKEW"):
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"]); H[s] = x[~x.index.duplicated(keep="last")]
    print(s, len(H[s]), flush=True)
spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
px = H["^KS11"]; c = px["Close"]; idx = c.index; bd = idx[-1]
hl5 = prob_vol._hl5(px, idx)
i_ = pd.Series(idx, index=idx); gap = np.log((i_.shift(-1) - i_).dt.days.astype(float))
# 날짜 확인: 외국인 (풋−콜) 과 그날·다음 날 등락 상관
rr = c.pct_change()
fx = F["fpc_lv"].reindex(idx)
print(f"날짜 확인 fpc: 같은 날 등락 상관 {fx.corr(rr):.2f} · 다음 날 {fx.corr(rr.shift(-1)):.2f} · |다음 날| {fx.corr(rr.shift(-1).abs()):.2f}", flush=True)

out = {}; summary = []; ntest = 0; mk = "KR"
for mn in ("저녁판", "아침판"):
    morning = mn == "아침판"
    if not morning:
        d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
    else:
        d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
    d["hl5"] = hl5; d["gap"] = gap
    for tg_, kind in prob_vol.OPT_TG.get(mk, {}).items():
        o_ = prob_vol._opt(H, kind, idx, bd, True, morning)
        if o_ is not None: d["opt_" + kind] = o_
    if cvs is not None: d["cv"] = np.log(cvs).reindex(d.index)
    for k, f in F.items():
        f = f.reindex(d.index)
        d[k] = f if morning else f.shift(1)
    for tg in prob_vol.TG:
        base = base0 + (["hl5"] if tg in prob_vol.HL_TG.get(mk, ()) else []) + (["gap"] if tg in prob_vol.GAP_TG.get(mk, ()) else []) \
            + (["opt_" + prob_vol.OPT_TG[mk][tg]] if tg in prob_vol.OPT_TG.get(mk, {}) and ("opt_" + prob_vol.OPT_TG[mk][tg]) in d else []) \
            + (["cv"] if cvs is not None and tg in prob_vol.CV_TG.get(mk, ()) else [])
        dd = d.dropna(subset=base + list(F))
        res = {}
        P, B = prob_vol.walk(dd, base, tg, start=2011); res["기본"] = prob_vol.judge(dd, P, B, tg)
        for k in F:
            ntest += 1
            P, B = prob_vol.walk(dd, base + [k], tg, start=2011); res["+" + k] = prob_vol.judge(dd, P, B, tg)
        b = res["기본"]
        if not b: print(mn, tg, "표본 부족", flush=True); continue
        for nm, j in res.items():
            if not j: continue
            better = nm != "기본" and all(j[s]["skill"] > b[s]["skill"] for s in ("앞", "뒤", "최근3년")) and j["최근3년"]["skill"] > 0
            big = better and all(j[s]["skill"] - b[s]["skill"] >= 0.3 for s in ("앞", "뒤", "최근3년"))
            line = f"KR {mn} {tg} {nm:8s} 앞 {j['앞']['skill']} 뒤 {j['뒤']['skill']} 최근3년 {j['최근3년']['skill']} 전체 {j['전체']['skill']} auc {j['auc']} n {j['n']} from {j['from']} {'✅' if better else ''}{'+0.3' if big else ''}"
            print(line, flush=True)
            if better: summary.append(line + f" (기본 {b['앞']['skill']}/{b['뒤']['skill']}/{b['최근3년']['skill']} auc {b['auc']})")
        out[f"{mn}_{tg}"] = {k: ({s: v[s] for s in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n", "from")} if v else v) for k, v in res.items()}
json.dump(out, open("probe/kroptinv_bt.json", "w"), ensure_ascii=False)
print("==== 시험 수", ntest)
print("==== 세 칸 모두 오른 것(최근3년>0)")
for s in summary: print(s)
print("끝")
