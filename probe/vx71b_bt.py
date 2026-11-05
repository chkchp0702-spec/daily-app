"""#71b 일본 닛케이 VI − VIX 백분위 다시 — 확률 보강 11/5 12시 (Actions)
② 일주일: d = 닛케이 VI 1년 백분위 − VIX 1년 백분위 를 칸(하위30·가운데·상위30 / 하위10 한쪽)으로 · prob.cond 와 같은 「칸」 방식
   기존 칸(자기 5일·S&P 5일 꼬리) 위 걸어가며 사전 100 브라이어(앞/뒤·최근5년) + 5일 간격 시작점 5개 + 교차 로지스틱
① 다음 날: CME 닛케이 선물(NKD=F 일봉, 미국 날짜 t 종가 ÷ 닛케이 P 종가) 닻 위에서도 d 가 남는지 — 교차 + 걸어가기(2012~)"""
import json, sys, os, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
u = "https://ts-api.cnbc.com/harmony/app/bars/.JNIV/1D/20030101000000/20261107000000/adjusted/EST5EDT.json"
bars = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode()).get("barData", {}).get("priceBars", [])
jv = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
jv = jv[~jv.index.duplicated(keep="last")]; jv = jv[jv > 0]
print("JNIV", len(jv), jv.index[0].date(), jv.index[-1].date(), round(float(jv.iloc[-1]), 2))

H = prob.load_hist(["^N225", "^GSPC", "^VIX", "NKD=F", "EWJ", "^SOX"])
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
n225, sp, vix, nkd, ewj, sox = (cs(s) for s in ["^N225", "^GSPC", "^VIX", "NKD=F", "EWJ", "^SOX"])
print("NKD", len(nkd), nkd.index[0].date())
d = prob.feats(H["^N225"]); d = d[d.index >= "2004-01-01"].copy()
R1 = prob_x.rank252
jvp = R1(jv).reindex(d.index).ffill(limit=3)            # 일본 날짜 t 종가 무렵 값
vxp = prob_x.align(R1(vix), d.index)                    # 미국 날짜 t (일본 t 마감 뒤) → 일본 t+1 전에 앎
dd = jvp - vxp
rd = R1(dd)                                             # d 의 1년 순위
rs = prob_x.align(R1(np.log(sp).diff(5)), d.index); rself = R1(np.log(d["c"]).diff(5))


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2006-01-01", every=None, off=0):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    if every:
        pos = np.arange(len(d)); ev &= pd.Series((pos % every) == off, index=d.index)
    idx = d.index[ev]; mid = idx[len(idx) // 2]; r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab(r, hi, lo, q=0.9):
    return pd.Series(np.where(r >= q, hi, np.where(r <= 1 - q, lo, "-")), index=r.index, dtype=object).where(r.notna())


oth = lab(rself, "ah", "al") + "|" + lab(rs, "sh", "sl")
d3 = lab(rd, "dh", "dl", 0.7); dlo = pd.Series(np.where(rd <= 0.1, "dl", "-"), index=d.index, dtype=object).where(rd.notna())
draw3 = pd.Series(np.where(dd <= -0.3, "dl", np.where(dd >= 0.3, "dh", "-")), index=d.index, dtype=object).where(dd.notna())
out = {"cur": {"D": str(d.index[-1].date()), "jvp": round(float(jvp.iloc[-1]), 3), "vxp": round(float(vxp.iloc[-1]), 3), "d": round(float(dd.iloc[-1]), 3), "rd": round(float(rd.iloc[-1]), 3)}}
mid = d.index[d.index >= "2006-01-01"][len(d.index[d.index >= "2006-01-01"]) // 2]
cells = {}
for nm, f in (("rd≤30", rd <= 0.3), ("rd≥70", rd >= 0.7), ("rd≤10", rd <= 0.1), ("d≤−0.3", dd <= -0.3), ("d≥+0.3", dd >= 0.3)):
    f = f.fillna(False) & (d.index >= "2006-01-01"); cells[nm] = {}
    for half, msk in (("앞", (d.index < mid)), ("뒤", (d.index >= mid))):
        c_ = prob.cond(d[msk], f[msk], nm); base = d.loc[msk & (d.index >= "2006-01-01")]
        cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - base["y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - base["y5"].mean()) * 100, 1)]
    # 5일 간격 시작점별 5일 칸 차이
    sp5 = []
    for off in range(5):
        pos = np.arange(len(d)); m5 = pd.Series((pos % 5) == off, index=d.index)
        a = d[m5 & f & (d.index < mid)]["y5"].dropna(); b = d[m5 & f & (d.index >= mid)]["y5"].dropna()
        ba = d[m5 & (d.index < mid) & (d.index >= "2006-01-01")]["y5"].dropna().mean(); bb = d[m5 & (d.index >= mid)]["y5"].dropna().mean()
        sp5.append([len(a), round((a.mean() - ba) * 100, 1), len(b), round((b.mean() - bb) * 100, 1)])
    cells[nm]["5일간격"] = sp5
out["mid"] = str(mid.date()); out["칸(n,y1차,y5차)"] = cells
for ycol, h in (("y5", 5), ("y1", 1)):
    P = {"평소": wf(d, d3, ycol, h)[1], "기존": wf(d, oth, ycol, h)[0], "기존+rd3": wf(d, oth + "|" + d3, ycol, h)[0],
         "기존+rd10": wf(d, oth + "|" + dlo, ycol, h)[0], "기존+d3": wf(d, oth + "|" + draw3, ycol, h)[0]}
    # 덧셈형: 기존 칸 확률 + w·(d칸 확률 − 평소) (로그오즈)
    lg = lambda p: np.log(p / (1 - p))
    for w in (0.3, 0.5):
        P[f"덧셈 rd3 w{w}"] = 1 / (1 + np.exp(-(lg(P["기존"]) + w * (lg(wf(d, d3, ycol, h)[0]) - lg(P["평소"])))))
    out[ycol] = {"전체": score(d, ycol, P)}
    if ycol == "y5":
        out[ycol]["5일간격"] = [score(d, ycol, P, every=5, off=o) for o in range(5)]
    print(ycol, json.dumps(out[ycol], ensure_ascii=False))


def fit(X, y, l2=1.0, it=30):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        Hh = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)]); w -= np.linalg.solve(Hh, g)
    return w
def pr(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
def brier(p, y): return round(float(np.mean((np.asarray(p) - np.asarray(y)) ** 2)), 5)

# 교차 로지스틱(5일, 칸 더미) — 5일 간격 시작점 0
D = pd.DataFrame({"ah": rself >= .9, "al": rself <= .1, "sh": rs >= .9, "sl": rs <= .1, "dl": rd <= .3, "dh": rd >= .7}, index=d.index).astype(float)
ok = rself.notna() & rs.notna() & rd.notna() & d["y5"].notna() & (d.index >= "2006-01-01")
X5 = {}
for every in (1, 5):
    m = ok & pd.Series((np.arange(len(d)) % every) == 0, index=d.index); idx = d.index[m]; md = idx[len(idx) // 2]
    y = d.loc[m, "y5"].values; Xa = D[m]; a, b = idx < md, idx >= md; s = {}
    for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
        w0 = fit(Xa[tr][["ah", "al", "sh", "sl"]].values, y[tr]); w1 = fit(Xa[tr].values, y[tr])
        s[nm] = [brier(pr(w0, Xa[te][["ah", "al", "sh", "sl"]].values), y[te]), brier(pr(w1, Xa[te].values), y[te]), [round(float(v), 3) for v in w1[-2:]]]
    X5[f"간격{every}"] = s
out["교차5일(기존,+d칸,계수 dl·dh)"] = X5
print("교차", json.dumps(X5, ensure_ascii=False))

# ① 다음 날: NKD 닻 위
spr = sp.pct_change(); sxr = sox.pct_change(); E = ewj.pct_change(); ar = n225.pct_change(); usd = spr.dropna().index; days = n225.index
jvp2 = R1(jv); vixp2 = R1(vix); rows = []
for i in range(2, len(days) - 1):
    Dd, P = days[i], days[i - 1]; j = usd.searchsorted(Dd) - 1
    if j < 0: continue
    t = usd[j]
    if t < P or any(t not in s_.index or pd.isna(s_[t]) for s_ in (sxr, E, vixp2)) or t not in nkd.index: continue
    k = jvp2.index.searchsorted(P, side="right") - 1
    if k < 0 or pd.isna(jvp2.iloc[k]) or (P - jvp2.index[k]).days > 6: continue
    rows.append((Dd, float(spr[t]), float(E[t] - ar[P]), float(sxr[t] - spr[t]), float(np.log(nkd[t] / n225[P])), float(jvp2.iloc[k] - vixp2[t]), int(n225[Dd] > n225[P])))
Rr = pd.DataFrame(rows, columns=["D", "us", "etfx", "sx", "nk", "d", "y"]).set_index("D")
for c in ["us", "etfx", "sx", "nk"]: Rr[c] = Rr[c].clip(-0.08, 0.08) * 100
SETS = {"닻": ["us", "etfx", "sx"], "닻+nk": ["us", "etfx", "sx", "nk"], "닻+nk+d": ["us", "etfx", "sx", "nk", "d"], "nk": ["nk"], "nk+d": ["nk", "d"]}
mid1 = Rr.index[len(Rr) // 2]; A_, B_ = Rr[Rr.index < mid1], Rr[Rr.index >= mid1]; r1 = {"n": len(Rr), "from": str(Rr.index[0].date()), "mid": str(mid1.date()),
                                                                                          "corr_nk_us": round(float(Rr["nk"].corr(Rr["us"])), 3), "corr_d_nk": round(float(Rr["d"].corr(Rr["nk"])), 3)}
for nm, (tr, te) in {"앞→뒤": (A_, B_), "뒤→앞": (B_, A_)}.items():
    q = {}
    for labl, cols in SETS.items():
        w = fit(tr[cols].values, tr["y"].values); q[labl] = brier(pr(w, te[cols].values), te["y"])
        if labl.endswith("+d"): q[labl + "_계수d"] = round(float(w[-1]), 3)
    r1[nm] = q
wfp = {k: [] for k in SETS}; ys = []
for yr in range(2012, Rr.index[-1].year + 1):
    tr = Rr[Rr.index < f"{yr}-01-01"]; te = Rr[(Rr.index >= f"{yr}-01-01") & (Rr.index < f"{yr + 1}-01-01")]
    if not len(te): continue
    ys.append(te["y"].values)
    for labl, cols in SETS.items(): wfp[labl].append(pr(fit(tr[cols].values, tr["y"].values), te[cols].values))
yy = np.concatenate(ys); W = {k: np.concatenate(v) for k, v in wfp.items()}; n = len(yy); h_ = n // 2
r1["걸어가기"] = {seg: {k: brier(v[sl], yy[sl]) for k, v in W.items()} for seg, sl in (("2012~앞", slice(0, h_)), ("뒤", slice(h_, n)), ("최근5년", slice(n - 1250, n)))}
out["다음날_NKD닻"] = r1
print("NKD", json.dumps(r1, ensure_ascii=False))
print("지금", json.dumps(out["cur"], ensure_ascii=False))
json.dump(out, open("probe/vx71b_bt.json", "w"), ensure_ascii=False, indent=1)
