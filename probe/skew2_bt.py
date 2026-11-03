"""#58b SKEW 다시 — 확률 보강 일지 11/3 13시 (Actions)
#58 ➖: (A) 중국 SKEW 수준 ≥90 다음 날 — 교차 좋아짐·걸어가기 뒤 나빠짐 → 사건 솎기·덧셈형(칸 곱하지 않고 로짓 더하기)·교차.
(B) 홍콩 SKEW 5일 급락(≤10) 5일 — 걸어가기 좋아짐·교차 앞→뒤 나빠짐 → 5일 간격 표본(시작점 5개)·사건 솎기·5일 간격 걸어가기·교차."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, lab, one, logit_fit

H = prob.load_hist(sorted({prob.MK["CN"]["ix"], prob.MK["HK"]["ix"], "^SKEW", "^VIX", "^GSPC"}))
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
sk, vx, sp = cs("^SKEW"), cs("^VIX"), cs("^GSPC")
lo = lambda p: np.log(p / (1 - p))
out = {"skew_last": [str(sk.index[-1].date()), round(float(sk.iloc[-1]), 1)]}


def thin(f):
    th = f.copy(); last = -99
    for i in range(len(f)):
        if f.iloc[i]:
            if i - last < 5: th.iloc[i] = False
            else: last = i
    return th


def prep(mk):
    d = prob.feats(H[prob.MK[mk]["ix"]]); d = d[d.index >= "2000-01-01"].copy()
    rv = prob_x.align(prob_x.rank252(vx), d.index); rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), d.index)
    return d, rv, rs


# (A) 중국 수준 ≥90 다음 날
d, rv, rs = prep("CN")
rg = prob_x.align(prob_x.rank252(sk), d.index)
v = rv.notna() & rs.notna() & rg.notna()
dd = d[v].copy(); rv, rs, rg = rv[v], rs[v], rg[v]
fh = rg >= .9; fe = fh & ~fh.shift(1, fill_value=False)  # 꼬리 첫날
th = thin(fh)
mid = dd.index[len(dd) // 2]; r5 = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
cells = {}
for nm, f in (("≥90 전체", fh), ("첫날", fe), ("솎음(5일 안 뺌)", th)):
    cells[nm] = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5)):
        c_ = prob.cond(dd[msk], f[msk], nm)
        cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1)]
base = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
st = str(dd.index[400].date())
pb = wf(dd, base, "y1", 1)[0]
A = {"n": len(dd), "mid": str(mid.date()), "cur_rank": round(float(rg.iloc[-1]), 3), "칸(n,y1차)": cells,
     "겹침": {"≥90일": int(fh.sum()), "그중 VIX≥90": int((fh & (rv >= .9)).sum()), "그중 S&P5≤10": int((fh & (rs <= .1)).sum())}}
A["걸어가기 칸곱"] = score(dd, "y1", {"기존": pb, "+높음": wf(dd, base + "|" + one(rg, fh, "g"), "y1", 1)[0],
                                     "+솎음": wf(dd, base + "|" + one(rg, th, "g"), "y1", 1)[0]}, start=st)
y = dd["y1"]; known = y.shift(1); bse = known.expanding().mean()
for tag, f in (("전체", fh), ("솎음", th)):
    fk = f.shift(1, fill_value=False)
    k = known.where(fk).fillna(0).cumsum(); n_ = (known.notna() & fk).astype(float).cumsum()
    pl = (k + 100 * bse) / (n_ + 100)
    for w in (0.3, 0.5, 1.0):
        pa = pb.copy(); m = f & pb.notna() & pl.notna()
        pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m])))))
        A.setdefault("덧셈형", {})[f"{tag} w{w}"] = score(dd, "y1", {"기존": pb, "+높음": pa}, start=st)
D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "g": fh, "t": th}, index=dd.index).astype(float)
m = y.notna(); idx = dd.index[m]; mi = idx[len(idx) // 2]; yy = y[m].values.astype(float); Xa = D[m].values; a, b_ = idx < mi, idx >= mi
R = {}
for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
    s_ = {}
    for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("+높음", [0, 1, 2, 3, 4, 5]), ("+솎음", [0, 1, 2, 3, 4, 6])):
        w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
        s_[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
        if kk != "기존": s_[kk + "계수"] = round(float(w_[5]), 3)
    R[nm] = s_
A["교차"] = R
out["CN 수준≥90 다음날"] = A
print("A", json.dumps(A, ensure_ascii=False))

# (B) 홍콩 5일 급락(≤10) 5일
d, rv, rs = prep("HK")
rg = prob_x.align(prob_x.rank252(np.log(sk).diff(5)), d.index)
v = rv.notna() & rs.notna() & rg.notna()
dd = d[v].copy(); rv, rs, rg = rv[v], rs[v], rg[v]
fl = rg <= .1; th = thin(fl); pos = np.arange(len(dd)); y5 = dd["y5"]
mid = dd.index[len(dd) // 2]
cells = {}
def cell(f, name):
    r = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid)):
        mm = msk & y5.notna(); b0 = y5[mm].mean(); s = y5[mm & f]
        r[half] = [int(len(s)), round((s.mean() - b0) * 100, 1) if len(s) else None]
    cells[name] = r
cell(fl, "전체(겹침)"); cell(th, "사건 솎기(4일 안 뺌)")
for k in range(5):
    cell(fl & pd.Series(pos % 5 == k, index=dd.index), f"5일 간격 시작{k}")
oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl"); eg = one(rg, fl, "g")
P = {"평소": wf(dd, eg, "y5", 5)[1], "기존": wf(dd, oth, "y5", 5)[0], "기존+급락": wf(dd, oth + "|" + eg, "y5", 5)[0]}
st = dd.index[min(400, len(dd) - 1)]
wfr = {}
for k in range(5):
    ev = y5.notna() & (dd.index >= st) & pd.Series(pos % 5 == k, index=dd.index)
    for p in P.values(): ev &= p.notna()
    mi = dd.index[ev][len(dd.index[ev]) // 2]
    rr = {}
    for nm, msk in (("앞", ev & (dd.index < mi)), ("뒤", ev & (dd.index >= mi)), ("최근5년", ev & (dd.index >= dd.index[-1] - pd.Timedelta(days=1826)))):
        rr[nm] = {kk: round(float(((p[msk] - y5[msk]) ** 2).mean()), 5) for kk, p in P.items()}
    wfr[f"시작{k}"] = rr
avg = {nm: {kk: round(float(np.mean([wfr[f"시작{k}"][nm][kk] for k in range(5)])), 5) for kk in P} for nm in ("앞", "뒤", "최근5년")}
D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "g": fl}, index=dd.index).astype(float)
cx = {"앞→뒤": {"기존": [], "기존+급락": [], "계수": []}, "뒤→앞": {"기존": [], "기존+급락": [], "계수": []}}
for k in range(5):
    m = y5.notna() & pd.Series(pos % 5 == k, index=dd.index); idx = dd.index[m]; mi = idx[len(idx) // 2]
    yv = y5[m].values.astype(float); X = D[m].values; a, b_ = idx < mi, idx >= mi
    for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
        for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("기존+급락", [0, 1, 2, 3, 4, 5])):
            w = logit_fit(X[tr][:, cols], yv[tr]); p = 1 / (1 + np.exp(-X[te][:, cols] @ w))
            cx[nm][kk].append(float(((p - yv[te]) ** 2).mean()))
            if kk != "기존": cx[nm]["계수"].append(round(float(w[5]), 3))
for nm in cx:
    for kk in ("기존", "기존+급락"): cx[nm][kk] = round(float(np.mean(cx[nm][kk])), 5)
B = {"n": len(dd), "mid": str(mid.date()), "사건": int(fl.sum()), "솎은 사건": int(th.sum()), "cur_rank": round(float(rg.iloc[-1]), 3),
     "칸(n,y5차%p)": cells, "걸어가기 5일간격 평균": avg, "걸어가기 시작별": wfr, "교차(5개 평균)": cx}
out["HK 5일급락 5일"] = B
print("B", json.dumps(B, ensure_ascii=False))
json.dump(out, open("probe/skew2_bt.json", "w"), ensure_ascii=False, indent=1)
