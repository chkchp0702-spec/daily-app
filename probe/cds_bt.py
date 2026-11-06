"""#78 한국 국가 CDS 5년물 — CNBC ts-api KR5Y-CDS 일봉 → 5·20일 변화 1년 백분위 꼬리 → 한국(·중·홍·일) 다음 날·5일 — 확률 보강 일지 11/6 10시 (Actions)
먼저 심볼 정체 확인(값 수준 · 다른 나라 -CDS 심볼 · 한국 5년 국채금리와 비교)."""
import json, sys, os, requests
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x
H_ = {"User-Agent": "Mozilla/5.0"}
def bars(s, a="20080101000000"):
    try:
        t = requests.get(f"https://ts-api.cnbc.com/harmony/app/bars/{s}/1D/{a}/20261107000000/adjusted/EST5EDT.json", headers=H_, timeout=30).json()
        pb = (t.get("barData") or {}).get("priceBars") or []
        return pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in pb if x.get("close")}).sort_index()
    except Exception as e:
        print("err", s, e); return pd.Series(dtype=float)
for s in ["KR5Y-CDS", "KR10Y-CDS", "JP5Y-CDS", "CN5Y-CDS", "US5Y-CDS", "DE5Y-CDS", "KR5Y", "KR10Y", "KR5YCDS-", ".KR5YCDS"]:
    x = bars(s)
    print("sym", s, len(x), (str(x.index[0].date()), x.iloc[0], str(x.index[-1].date()), x.iloc[-1], round(float(x.tail(250).min()), 3), round(float(x.tail(250).max()), 3)) if len(x) else None)
cds = bars("KR5Y-CDS"); y5 = bars("KR5Y")
if len(cds) and len(y5):
    j = pd.concat([cds, y5], axis=1).dropna(); print("KR5Y-CDS vs KR5Y 상관(수준)", round(float(j.corr().iloc[0, 1]), 3), "차이 평균", round(float((j.iloc[:, 0] - j.iloc[:, 1]).abs().mean()), 3))
cds = cds[cds > 0]
F = {"5일": cds.diff(5), "20일": cds.diff(20)}
def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; ok = y.notna(); known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    ev = ok & (d.index >= "2012-01-01") & base.notna() & lab.notna()
    if ev.sum() < 50: return None
    mid = d.index[ev][len(d.index[ev]) // 2]; r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5)]
    return r
syms = sorted({prob.MK[m]["ix"] for m in ("KR", "JP", "CN", "HK")} | {"^GSPC"})
H = prob.load_hist(syms)
sp5 = np.log(H["^GSPC"]["Close"].dropna()).diff(5)
out = {}
for mk in ("KR", "JP", "CN", "HK"):
    d = prob.feats(H[prob.MK[mk]["ix"]]); d = d[d.index >= "2010-01-01"].copy(); R = {}
    sprk = prob_x.align(prob_x.rank252(sp5), d.index)
    for fn, s in F.items():
        rk = prob_x.align(prob_x.rank252(s.dropna()), d.index)
        tail = pd.cut(rk, [-0.01, .1, .9, 1.01], labels=["≤10", "mid", "≥90"]).astype(object).where(lambda x: x != "mid")
        mid = d.index[len(d) // 2]; rows = {}
        for L in ["≤10", "≥90"]:
            f = (tail == L).fillna(False); row = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], L); b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
                row[half] = None if not c_ else [c_["n"], round((c_["p1"] - b1) * 100, 1), round(((c_["p5"] or 0) - b5) * 100, 1)]
            rows[L] = row
        sptail = pd.cut(sprk, [-0.01, .1, .9, 1.01], labels=["S≤10", "Smid", "S≥90"]).astype(str)
        both = (tail.astype(str) + "|" + sptail).where(tail.notna())
        spl = sptail.where(tail.notna())   # 같은 날들에 S&P 꼬리 칸만 썼을 때
        ov = int(((tail == "≥90") & (sptail == "S≤10")).sum())
        R[fn] = {"cur_rank": round(float(rk.dropna().iloc[-1]), 3), "칸(n,다음날%p,5일%p)": rows, "CDS급등∩S&P급락": ov,
                 "브라이어_꼬리_y1": wf(d, tail, "y1", 1), "브라이어_꼬리_y5": wf(d, tail, "y5", 5),
                 "같은날_S&P칸만_y1": wf(d, spl, "y1", 1), "S&P칸×CDS_y1": wf(d, both, "y1", 1),
                 "같은날_S&P칸만_y5": wf(d, spl, "y5", 5), "S&P칸×CDS_y5": wf(d, both, "y5", 5)}
        print(mk, fn, json.dumps(R[fn], ensure_ascii=False))
    out[mk] = R
out["now"] = {"date": str(cds.index[-1].date()), "cds": float(cds.iloc[-1]), "5일": float(F["5일"].iloc[-1]), "20일": float(F["20일"].iloc[-1])}
print("now", out["now"])
json.dump(out, open("probe/cds_bt.json", "w"), ensure_ascii=False, indent=1)
