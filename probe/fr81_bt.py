"""#81 외국인 현물 순매수(다음 금융 2,573일) 5·20일 합 꼬리 — 지금 「외국인 수급」 칸(20일 합 500일 백분위 5칸, w 0.9) 점검 · 확률 보강 11/6 12시 (Actions)
칸 앞/뒤 차이 + 걸어가며 사전 100 브라이어(평소·지수 5·20일 꼬리 위 겹침)."""
import json, sys, os, time, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

H_ = {"User-Agent": "Mozilla/5.0", "Referer": "https://finance.daum.net/"}
hist = {}
for pg in range(1, 120):
    try:
        req = urllib.request.Request(f"https://finance.daum.net/api/investor/KOSPI/days?page={pg}&perPage=30", headers=H_)
        j = json.loads(urllib.request.urlopen(req, timeout=20).read().decode("utf-8"))
    except Exception as e:
        print("page", pg, e); time.sleep(2); continue
    rows = j.get("data") or []
    for x in rows:
        v = x.get("foreignStraightPurchasePrice")
        if v is not None: hist[x["date"][:10]] = float(v) / 1e8
    if pg == 1: print("totalCount", j.get("totalCount"), "keys", list(rows[0].keys())[:12] if rows else None)
    if len(rows) < 30: break
    time.sleep(0.3)
fr = pd.Series(hist).sort_index(); fr.index = pd.to_datetime(fr.index)
print("외국인", len(fr), fr.index[0].date(), fr.index[-1].date(), "최근5", fr.iloc[-5:].round(0).tolist())

ix = prob.MK["KR"]["ix"]
H = prob.load_hist([ix])
d = prob.feats(H[ix]); d = d[d.index >= fr.index[0]].copy()
f = fr.reindex(d.index).fillna(0)
c5, c20 = f.rolling(5).sum(), f.rolling(20).sum()
F = {"c20_500": c20.rolling(500, min_periods=100).rank(pct=True), "c20_252": prob_x.rank252(c20), "c5_252": prob_x.rank252(c5)}
r5, r20 = prob_x.rank252(d["r5"]), prob_x.rank252(d["r20"])


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in lab.dropna().unique():
        fl = (lab == L); fm = fl.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~fl, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]; r = {"mid": str(mid.date()), "n": int(ev.sum())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근3년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1096)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab5(r):
    return pd.cut(r, [-0.01, 0.1, 0.3, 0.7, 0.9, 1.01], labels=["L10", "L30", "M", "H70", "H90"]).astype(object).where(r.notna())
def tail(r, nm):
    return pd.Series(np.where(r >= 0.9, nm + "h", np.where(r <= 0.1, nm + "l", "-")), index=r.index, dtype=object).where(r.notna())


ok = F["c20_500"].notna() & F["c5_252"].notna() & r5.notna() & r20.notna()
d = d[ok]; F = {k: v[ok] for k, v in F.items()}; r5, r20 = r5[ok], r20[ok]
mid = d.index[len(d) // 2]
out = {"n": len(d), "start": str(d.index[0].date()), "mid": str(mid.date()), "now": {k: round(float(v.iloc[-1]), 3) for k, v in F.items()},
       "base": {"y1": round(float(d["y1"].mean()), 3), "y5": round(float(d["y5"].mean()), 3)}, "칸": {}}
for fk in F:
    L = lab5(F[fk]); out["칸"][fk] = {}
    for lb in ["L10", "L30", "M", "H70", "H90"]:
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], (L == lb)[msk], lb)
            row[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        out["칸"][fk][lb] = row
oth = tail(r5, "r5") + "|" + tail(r20, "r20")
st = str(d.index[0] + pd.Timedelta(days=400))[:10]
for ycol, h in (("y1", 1), ("y5", 5)):
    P = {"평소": wf(d, oth, ycol, h)[1], "지금칸(20일500 5칸)": wf(d, lab5(F["c20_500"]), ycol, h)[0],
         "20일252 꼬리": wf(d, tail(F["c20_252"], "f"), ycol, h)[0], "5일 꼬리": wf(d, tail(F["c5_252"], "g"), ycol, h)[0],
         "지수꼬리": wf(d, oth, ycol, h)[0], "지수꼬리+지금칸": wf(d, oth + "|" + lab5(F["c20_500"]), ycol, h)[0],
         "지수꼬리+5일꼬리": wf(d, oth + "|" + tail(F["c5_252"], "g"), ycol, h)[0]}
    out[ycol] = score(d, ycol, P, st)
print(json.dumps(out, ensure_ascii=False, indent=1))
json.dump(out, open("probe/fr81_bt.json", "w"), ensure_ascii=False, indent=1)
