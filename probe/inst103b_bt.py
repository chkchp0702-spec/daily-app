"""#103b 낮은 꼬리만(기관 5일·개인 20일 ≤10%) + 간밤 S&P 칸 위 · 기관·개인(·연기금) 현물 순매수 5·20일 합 꼬리 → 코스피 다음 날·5일 · 확률 보강 11/12 12시 (Actions)
다음 금융 investor/KOSPI/days 의 다른 투자자 칸. 칸 앞/뒤 차이 + 걸어가며 사전 100 브라이어(지수 5·20일 꼬리 위 겹침) + 외국인과 겹침."""
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
    if pg == 1 and rows: print("totalCount", j.get("totalCount"), "row0", json.dumps(rows[0], ensure_ascii=False)[:1500])
    for x in rows:
        for k, v in x.items():
            if k.endswith("StraightPurchasePrice") and v is not None:
                hist.setdefault(k.replace("StraightPurchasePrice", ""), {})[x["date"][:10]] = float(v) / 1e8
    if len(rows) < 30: break
    time.sleep(0.3)
ix = prob.MK["KR"]["ix"]
H = prob.load_hist([ix])
S = {k: pd.Series(v).sort_index() for k, v in hist.items()}
for k in S: S[k].index = pd.to_datetime(S[k].index); print(k, len(S[k]), S[k].index[0].date(), "최근5", S[k].iloc[-5:].round(0).tolist())
st0 = max(v.index[0] for v in S.values())
d = prob.feats(H[ix]); d = d[d.index >= st0].copy()
F = {}
for k, v in S.items():
    f = v.reindex(d.index).fillna(0)
    F[k + "_5"] = prob_x.rank252(f.rolling(5).sum()); F[k + "_20"] = prob_x.rank252(f.rolling(20).sum())
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


ok = r5.notna() & r20.notna()
for v in F.values(): ok &= v.notna()
d = d[ok]; F = {k: v[ok] for k, v in F.items()}; r5, r20 = r5[ok], r20[ok]
mid = d.index[len(d) // 2]
out = {"n": len(d), "start": str(d.index[0].date()), "mid": str(mid.date()), "now": {k: round(float(v.iloc[-1]), 3) for k, v in F.items()},
       "base": {"y1": round(float(d["y1"].mean()), 3), "y5": round(float(d["y5"].mean()), 3)}, "칸": {}}
for fk in []:
    L = lab5(F[fk]); out["칸"][fk] = {}
    for lb in ["L10", "L30", "M", "H70", "H90"]:
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], (L == lb)[msk], lb)
            row[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        out["칸"][fk][lb] = row
oth = tail(r5, "r5") + "|" + tail(r20, "r20")
st = str(d.index[0] + pd.Timedelta(days=400))[:10]
sp = prob.load_hist(["^GSPC"])["^GSPC"]["Close"].astype(float).pct_change()
spl = pd.Series(np.where(sp.reindex(d.index) <= -0.01, "sd", np.where(sp.reindex(d.index) >= 0.01, "su", "s0")), index=d.index, dtype=object)
def low(r, nm):
    return pd.Series(np.where(r <= 0.1, nm, "-"), index=r.index, dtype=object).where(r.notna())
both = (F["institution_5"] <= 0.1) & (F["individual_20"] <= 0.1)
print("겹침 기관5저·개인20저", int(both.sum()), "기관5저", int((F["institution_5"] <= 0.1).sum()), "개인20저", int((F["individual_20"] <= 0.1).sum()),
      "기관5저 중 지수5일 하위10", int(((F["institution_5"] <= 0.1) & (r5 <= 0.1)).sum()), "개인20저 중 지수20일 상위10", int(((F["individual_20"] <= 0.1) & (r20 >= 0.9)).sum()))
for ycol, h in (("y1", 1), ("y5", 5)):
    base_lab = oth + "|" + spl if ycol == "y1" else oth
    P = {"평소": wf(d, oth, ycol, h)[1], "기존(지수꼬리+간밤S&P)": wf(d, base_lab, ycol, h)[0]}
    for fk, nm in (("institution_5", "기관5저"), ("individual_20", "개인20저")):
        P[nm + " 혼자"] = wf(d, low(F[fk], "x"), ycol, h)[0]
        P["기존+" + nm] = wf(d, base_lab + "|" + low(F[fk], "x"), ycol, h)[0]
    out[ycol] = score(d, ycol, P, st)
# 간밤 S&P 칸 안에서 기관5저 다음 날
out["칸안"] = {}
for fk in ("institution_5", "individual_20"):
    for sl in ("sd", "s0", "su"):
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            mm = msk & (spl == sl)
            c_ = prob.cond(d[mm], (F[fk] <= 0.1)[mm], sl)
            row[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[mm, "y1"].mean()) * 100, 1)]
        out["칸안"][fk + sl] = row
print(json.dumps({k: out[k] for k in ("y1", "y5", "칸안")}, ensure_ascii=False))
raise SystemExit
for ycol, h in (("y1", 1), ("y5", 5)):
    P = {"평소": wf(d, oth, ycol, h)[1], "지수꼬리": wf(d, oth, ycol, h)[0]}
    for fk in F:
        P[fk + " 꼬리"] = wf(d, tail(F[fk], "g"), ycol, h)[0]
        P["지수꼬리+" + fk] = wf(d, oth + "|" + tail(F[fk], "g"), ycol, h)[0]
    out[ycol] = score(d, ycol, P, st)
# 꼬리 칸 앞/뒤 (≥90·≤10)
out["꼬리"] = {}
for fk in F:
    for side, m in (("h", F[fk] >= 0.9), ("l", F[fk] <= 0.1)):
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], m[msk], side)
            row[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        out["꼬리"][fk + side] = row
# 외국인과 상관
out["corr"] = pd.DataFrame(F).corr().round(2).to_dict()
print(json.dumps(out, ensure_ascii=False, indent=1))
