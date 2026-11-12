"""#103c 개인 20일 순매도 극단(≤10%) → 코스피 5일 · 5일 간격·지수 20일 급등 겹침 뺀 칸 · 확률 보강 11/12 14시 (Actions)
옛 #103b 낮은 꼬리만(기관 5일·개인 20일 ≤10%) + 간밤 S&P 칸 위 · 기관·개인(·연기금) 현물 순매수 5·20일 합 꼬리 → 코스피 다음 날·5일 · 확률 보강 11/12 12시 (Actions)
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


ok = r5.notna() & r20.notna() & F["individual_20"].notna()
d = d[ok]; r5, r20 = r5[ok], r20[ok]; g = F["individual_20"][ok]
mid = d.index[len(d) // 2]
low = g <= 0.1; hot = r20 >= 0.9
out = {"n": len(d), "start": str(d.index[0].date()), "mid": str(mid.date()), "now_ind20": round(float(g.iloc[-1]), 3),
       "base_y5": round(float(d["y5"].mean()), 3), "개인저": int(low.sum()), "겹침(지수20급등)": int((low & hot).sum())}
def cell(mask, sub):
    row = {}
    for half, hm in (("앞", d.index < mid), ("뒤", d.index >= mid), ("최근3년", d.index >= d.index[-1] - pd.Timedelta(days=1096))):
        m = hm & sub
        y = d.loc[m, "y5"]; t = y[low[m]].dropna(); b = y.dropna()
        row[half] = [int(len(t)), round((t.mean() - b.mean()) * 100, 1) if len(t) else None]
    return row
out["전체"] = cell(low, pd.Series(True, index=d.index))
out["급등겹침뺌"] = cell(low, ~hot)
out["지수20 중간(0.3~0.7)안"] = cell(low, (r20 > 0.3) & (r20 < 0.7))
# 5일 간격
sp = {}
for off in range(5):
    idx = d.index[off::5]; dd = d.loc[idx]; ll = low.loc[idx]; hh = hot.loc[idx]
    r = {}
    for half, hm in (("앞", idx < mid), ("뒤", idx >= mid)):
        y = dd.loc[hm, "y5"].dropna(); t = y[ll[hm].reindex(y.index)]; t2 = y[(ll & ~hh)[hm].reindex(y.index)]
        r[half] = [int(len(t)), round((t.mean() - y.mean()) * 100, 1), int(len(t2)), round((t2.mean() - y.mean()) * 100, 1)]
    sp[off] = r
out["5일간격(전체n,차,겹침뺀n,차)"] = sp
# 사건 솎기: 칸 들어간 첫날만
first = low & ~low.shift(1, fill_value=False)
out["첫날만"] = cell(first, pd.Series(True, index=d.index)) if False else None
fr = {}
for half, hm in (("앞", d.index < mid), ("뒤", d.index >= mid)):
    y = d.loc[hm, "y5"].dropna(); t = y[first[hm].reindex(y.index)]
    fr[half] = [int(len(t)), round((t.mean() - y.mean()) * 100, 1)]
out["첫날만"] = fr
# 걸어가기: 기존 지수꼬리 vs +개인저 (겹침 뺀 개인저 포함)
oth = tail(r5, "r5") + "|" + tail(r20, "r20")
st = str(d.index[0] + pd.Timedelta(days=400))[:10]
lw = pd.Series(np.where(low, "x", "-"), index=d.index, dtype=object)
lw2 = pd.Series(np.where(low & ~hot, "x", "-"), index=d.index, dtype=object)
P = {"평소": wf(d, oth, "y5", 5)[1], "기존": wf(d, oth, "y5", 5)[0], "기존+개인저": wf(d, oth + "|" + lw, "y5", 5)[0], "기존+개인저(급등아닐때)": wf(d, oth + "|" + lw2, "y5", 5)[0]}
out["y5"] = score(d, "y5", P, st)
# 교차 로지스틱(5일 간격, 앞→뒤·뒤→앞): 지수 r5·r20 순위 + 개인저 더미
def lr(X, y, Xt):
    X = np.c_[np.ones(len(X)), X]; Xt = np.c_[np.ones(len(Xt)), Xt]; w = np.zeros(X.shape[1])
    for _ in range(50):
        p = 1 / (1 + np.exp(-X @ w)); W = p * (1 - p) + 1e-9
        w += np.linalg.solve(X.T @ (X * W[:, None]) + 1e-3 * np.eye(len(w)), X.T @ (y - p))
    return 1 / (1 + np.exp(-Xt @ w))
idx = d.index[0::5]; dd = d.loc[idx]; m = dd["y5"].notna()
dd = dd[m]; i2 = dd.index
X0 = np.c_[r5.loc[i2], r20.loc[i2], (r5.loc[i2] <= .1), (r20.loc[i2] >= .9)].astype(float); X1 = np.c_[X0, low.loc[i2].astype(float)]
y = dd["y5"].values.astype(float); A = i2 < mid; B = ~A
cx = {}
for nm, tr, te in (("앞→뒤", A, B), ("뒤→앞", B, A)):
    cx[nm] = [round(float(((lr(X0[tr], y[tr], X0[te]) - y[te]) ** 2).mean()), 5), round(float(((lr(X1[tr], y[tr], X1[te]) - y[te]) ** 2).mean()), 5)]
out["교차(기존,+개인저)"] = cx
print(json.dumps(out, ensure_ascii=False, indent=1))
