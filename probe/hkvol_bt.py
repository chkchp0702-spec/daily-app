"""11/19 12시 🌊 흔들림 보강 — 「최근 3년 실력이 평소보다 못한」 홍콩 3목표 · 일본 일주일 −3%
  지금 화면(prob.json vol): 홍콩 ±1% 최근3년 −3.0 · −2% −2.5 · 5일 −0.5 / 일본 5일 −2.4 (앞·뒤는 + 라서 ok=true)
  후보(prob_vol 기본 특성 + 지금 붙은 hl5 위에 하나씩):
    rate   그 목표 사건의 최근 250일 실제 비율(그날까지 아는 값) — 국면(평소 수준) 이동을 따라잡기
    win10  같은 특성, 학습을 최근 10년으로만(오래된 국면 덜 반영)
    cnrv   본토(상해) 20일 실현 변동성(로그) — 홍콩만 · 같은 날 15:00 마감이라 홍콩 마감 전에 앎
    etfa   아침판만: 미국 상장 국가 ETF(EWH·EWJ) 간밤 등락 크기(로그) · etfx 지수 대비 초과(부호)
  붙이는 조건: 앞·뒤·최근3년 실력이 모두 지금(기본)보다 높을 때 + 최근3년 실력 > 0"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

TGT = {"HK": ["big1", "dn2", "dn5"], "JP": ["dn5"]}
ETF = {"HK": "EWH", "JP": "EWJ"}
cn_ix = prob.MK["CN"]["ix"]
syms = [prob.MK["HK"]["ix"], prob.MK["JP"]["ix"], cn_ix, "^GSPC", "^VIX", "EWH", "EWJ"]
H = {}
for s in syms:
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()) if len(H[s]) else "-", flush=True)


def walk_win(d, feats, tgt, yrs=10):
    D = d.dropna(subset=feats)
    P = pd.Series(np.nan, index=D.index); B = pd.Series(np.nan, index=D.index)
    for yr in sorted({x for x in D.index.year if x >= prob_vol.START}):
        tr = D[(D.index.year < yr) & (D.index.year >= yr - yrs)].dropna(subset=[tgt])
        if tgt == "dn5":
            tr = tr.iloc[:-5]
        te = D[D.index.year == yr]
        if len(tr) < 750 or not len(te):
            continue
        X = tr[feats].values; mu, sd = X.mean(0), X.std(0) + 1e-9
        w = prob_vol._fit((X - mu) / sd, tr[tgt].values)
        P.loc[te.index] = prob_vol._pred(w, (te[feats].values - mu) / sd)
        # 평소 비율은 똑같이 그때까지 전체(비교 기준을 바꾸지 않음)
        B.loc[te.index] = float(D[D.index.year < yr][tgt].dropna().mean())
    return P, B


spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
out = {}
for mk, tgs in TGT.items():
    px = H[prob.MK[mk]["ix"]]; c = px["Close"]
    r = c.pct_change()
    ext = pd.DataFrame(index=c.index)
    hl = np.log((px["High"] / px["Low"]).where(px["High"] > px["Low"]))
    ext["hl5"] = np.log(hl.rolling(5, min_periods=3).mean() * 100 + 0.05)
    ev = {"big1": (r.abs() > 0.01), "dn2": (r < -0.02), "dn5": (c.pct_change(5) < -0.03)}
    for tg in tgs:
        ext["rate_" + tg] = ev[tg].astype(float).where(r.notna()).rolling(250, min_periods=200).mean()
    if mk == "HK":
        cc = H[cn_ix]["Close"]
        ext["cnrv"] = np.log(prob_vol._align(cc.pct_change().rolling(20).std() * 100, c.index) + 0.05)
    e = H[ETF[mk]]["Close"]
    er = prob_vol._align(e.pct_change() * 100, c.index)
    ext["etfa"] = np.log(er.abs() + 0.1)
    ext["etfx"] = (er - r * 100).clip(-8, 8)
    R = {}
    for mn in ("저녁판", "아침판"):
        if mn == "저녁판":
            d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        else:
            d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
        for k in ext.columns:
            d[k] = ext[k]
        for tg in tgs:
            base = base0 + (["hl5"] if tg in prob_vol.HL_TG.get(mk, ()) else [])
            cands = [("+rate", base + ["rate_" + tg], "e"), ("win10", base, "w")]
            if mk == "HK":
                cands.append(("+cnrv", base + ["cnrv"], "e"))
            if mn == "아침판":
                cands += [("+etfa", base + ["etfa"], "e"), ("+etfx", base + ["etfx"], "e")]
            need = sorted({x for _, fl, _ in cands for x in fl} | set(base))
            dd = d.dropna(subset=need)
            res = {}
            P, B = prob_vol.walk(dd, base, tg); res["기본"] = prob_vol.judge(dd, P, B, tg)
            for nm, f, how in cands:
                try:
                    P, B = (prob_vol.walk(dd, f, tg) if how == "e" else walk_win(dd, f, tg))
                    res[nm] = prob_vol.judge(dd, P, B, tg)
                except Exception as ex:
                    res[nm] = {"err": str(ex)[:100]}
            b = res["기본"]
            for nm, j in res.items():
                if not j or "err" in j:
                    print(mk, mn, tg, nm, j, flush=True); continue
                better = nm != "기본" and all(j[s]["skill"] > b[s]["skill"] for s in ("앞", "뒤", "최근3년")) and j["최근3년"]["skill"] > 0
                print(mk, mn, tg, f"{nm:7s}", "앞", j["앞"]["skill"], "뒤", j["뒤"]["skill"], "최근3년", j["최근3년"]["skill"], "전체", j["전체"]["skill"], "auc", j["auc"], "n", j["n"], "✅" if better else "", flush=True)
            R[f"{mn}_{tg}"] = {k: ({s: v[s] for s in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n")} if v and "err" not in v else v) for k, v in res.items()}
    out[mk] = R
json.dump(out, open("probe/hkvol_bt.json", "w"), ensure_ascii=False)
print("끝")
