"""#104 외국인 순매수 연속 일수·반전 → 코스피 다음 날·5일 · 확률 보강 11/12 16시 (Actions)
옛 설명: #103b 낮은 꼬리만(기관 5일·개인 20일 ≤10%) + 간밤 S&P 칸 위 · 기관·개인(·연기금) 현물 순매수 5·20일 합 꼬리 → 코스피 다음 날·5일 · 확률 보강 11/12 12시 (Actions)
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



f = S["foreign"].reindex(d.index).fillna(0)
sg = np.sign(f.values); stv = np.zeros(len(sg))
for i in range(1, len(sg)):
    stv[i] = stv[i-1] + sg[i] if sg[i] != 0 and (stv[i-1] == 0 or np.sign(stv[i-1]) == sg[i]) else sg[i]
stv = pd.Series(stv, index=d.index); prev = stv.shift(1)
ok = r5.notna() & r20.notna() & prev.notna()
d = d[ok]; stv, prev, r5, r20, f = stv[ok], prev[ok], r5[ok], r20[ok], f[ok]
mid = d.index[len(d) // 2]
sl = pd.cut(stv, [-99, -8, -4, 3, 7, 99], labels=["S-8", "S-4", "M", "B4", "B8"]).astype(object)
rev = pd.Series(np.where((prev <= -5) & (stv > 0), "rb", np.where((prev >= 5) & (stv < 0), "rs", "-")), index=d.index, dtype=object)
c20 = f.rolling(20).sum(); big = f.abs() > f.abs().rolling(60, min_periods=20).quantile(0.9)
rev2 = pd.Series(np.where((c20.shift(1) < 0) & (f > 0) & big, "bb", np.where((c20.shift(1) > 0) & (f < 0) & big, "bs", "-")), index=d.index, dtype=object)
out = {"n": len(d), "start": str(d.index[0].date()), "mid": str(mid.date()), "now": {"streak": int(stv.iloc[-1]), "today_eok": round(float(f.iloc[-1]), 0)},
       "base": {"y1": round(float(d["y1"].mean()), 3), "y5": round(float(d["y5"].mean()), 3)}, "칸": {}}
def halves(lab, keys):
    res = {}
    for lb in keys:
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid), ("최근3년", d.index >= d.index[-1] - pd.Timedelta(days=1096))):
            c_ = prob.cond(d[msk], (lab == lb)[msk], lb)
            row[half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        res[lb] = row
    return res
out["칸"]["streak"] = halves(sl, ["S-8", "S-4", "M", "B4", "B8"])
out["칸"]["rev"] = halves(rev, ["rb", "rs"])
out["칸"]["rev2"] = halves(rev2, ["bb", "bs"])
oth = tail(r5, "r5") + "|" + tail(r20, "r20")
st = str(d.index[0] + pd.Timedelta(days=400))[:10]
sp = prob.load_hist(["^GSPC"])["^GSPC"]["Close"].astype(float).pct_change()
spl = pd.Series(np.where(sp.reindex(d.index) <= -0.01, "sd", np.where(sp.reindex(d.index) >= 0.01, "su", "s0")), index=d.index, dtype=object)
for ycol, h in (("y1", 1), ("y5", 5)):
    bl = oth + "|" + spl if ycol == "y1" else oth
    P = {"평소": wf(d, oth, ycol, h)[1], "기존": wf(d, bl, ycol, h)[0]}
    for nm, L in (("연속5칸", sl), ("반전", rev), ("큰반전", rev2)):
        P[nm + " 혼자"] = wf(d, L, ycol, h)[0]
        P["기존+" + nm] = wf(d, bl + "|" + L, ycol, h)[0]
    out[ycol] = score(d, ycol, P, st)
print(json.dumps(out, ensure_ascii=False, indent=1))
