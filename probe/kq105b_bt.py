"""#105b 「코스닥 20일 되돌림」(코스닥÷코스피 20일 로그 변화 1년 백분위 ≤10%) → 코스피 다음 날 — 확률 보강 일지 11/14 10시 (Actions)
#105 ➖: 교차 로지스틱만 좋아지고 칸 곱하기는 나빠짐 → #37·#51 처럼 덧셈형 걸어가기 · 사건 솎기 · 5일 간격 표본으로 다시.
주의: 앱엔 이미 🎢 위험선호(코스닥/코스피 20일 %, 5칸, w 0.6)가 있음 → 그 5칸까지 넣은 기존 위에서도 남는지 본다."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, lab, one, logit_fit

H = prob.load_hist(["^KS11", "^KQ11", "^GSPC"])
import time, yfinance as yf
for s_ in ("^KQ11", "^GSPC", "^KS11"):          # 11/14: yfinance 캐시 「database is locked」로 한 종목 빠짐 → 하나씩 다시
    for _ in range(3):
        if s_ in H and len(H[s_]) > 3000: break
        time.sleep(3); one_ = yf.download(s_, start="2000-01-01", interval="1d", auto_adjust=False, progress=False, threads=False)
        if isinstance(one_.columns, pd.MultiIndex): one_.columns = one_.columns.get_level_values(0)
        if len(one_):
            one_ = one_[["Open", "Close"]].dropna(subset=["Close"]); one_.index = pd.to_datetime(one_.index).tz_localize(None); H[s_] = one_
    print(s_, len(H.get(s_, [])))
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
ks, kq, sp = cs("^KS11"), cs("^KQ11"), cs("^GSPC")
b = pd.concat([kq, ks], axis=1, keys=["q", "s"]).dropna(); sprd = np.log(b["q"] / b["s"])
d = prob.feats(H["^KS11"]); d = d[d.index >= "2000-01-01"].copy()
idx = d.index
rk = prob_x.rank252(np.log(ks).diff(20)).reindex(idx)
rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), idx)
re_ = prob_x.rank252(sprd.diff(20)).reindex(idx)
rr = (kq.reindex(idx).ffill() / d["c"]).pct_change(20)      # 앱 🎢 위험선호와 같은 값
v = rk.notna() & rs.notna() & re_.notna() & rr.notna()
dd = d[v].copy(); rk, rs, re_, rr = rk[v], rs[v], re_[v], rr[v]
rb = pd.Series(np.select([rr <= -0.05, rr <= -0.015, rr < 0.015, rr < 0.05], ["r1", "r2", "r3", "r4"], "r5"), index=dd.index, dtype=object)
fl = (re_ <= .1)
fe = fl & ~(fl.shift(1, fill_value=False) | fl.shift(2, fill_value=False) | fl.shift(3, fill_value=False) | fl.shift(4, fill_value=False))
mid = dd.index[len(dd) // 2]; r5m = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
res = {"n": len(dd), "first": str(dd.index[0].date()), "last": str(dd.index[-1].date()), "mid": str(mid.date()),
       "cur_rank": round(float(re_.iloc[-1]), 3), "cur_rr%": round(float(rr.iloc[-1]) * 100, 2), "cur_rb": rb.iloc[-1]}
cells = {}
for nm, f in (("되돌림 전체", fl), ("첫날(솎음)", fe), ("되돌림&🎢크게약함 아님", fl & (rb != "r1"))):
    cells[nm] = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5m)):
        c_ = prob.cond(dd[msk], f[msk], nm)
        cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1)]
res["칸(n,y1차%p)"] = cells
res["겹침"] = {"되돌림일": int(fl.sum()), "첫날": int(fe.sum()), **{f"🎢{k}": int((fl & (rb == k)).sum()) for k in ("r1", "r2", "r3", "r4", "r5")}}
# 5일 간격 표본(시작점 5개) — 다음 날 칸 차이
sp5 = {}
for s0 in range(5):
    sub = dd.iloc[s0::5]; m2 = sub.index[len(sub) // 2]; o = []
    for msk in (sub.index < m2, sub.index >= m2):
        f = fl.reindex(sub.index)[msk]; y = sub.loc[msk, "y1"]
        o.append([int(f.sum()), round((y[f].mean() - y.mean()) * 100, 1)])
    sp5[f"시작{s0}"] = o
res["5일 간격(앞,뒤 [n,차])"] = sp5
st = str(dd.index[400].date()); lo = lambda p: np.log(p / (1 - p))
y = dd["y1"]; known = y.shift(1); bse = known.expanding().mean()
def addw(pb, f, w):
    fk = f.shift(1, fill_value=False)
    k = known.where(fk).fillna(0).cumsum(); n_ = (known.notna() & fk).astype(float).cumsum()
    pl = (k + 100 * bse) / (n_ + 100)
    pa = pb.copy(); m = f & pb.notna() & pl.notna()
    pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m])))))
    return pa
bases = {"A 코스피20·S&P5": lab(rk, "kh", "kl") + "|" + lab(rs, "sh", "sl"),
         "B A+🎢5칸(앱)": lab(rk, "kh", "kl") + "|" + lab(rs, "sh", "sl") + "|" + rb,
         "C 🎢5칸만": rb}
for tag, base in bases.items():
    pb = wf(dd, base, "y1", 1)[0]; P = {"기존": pb}
    for w in (0.3, 0.5, 1.0):
        P[f"+되돌림 w{w}"] = addw(pb, fl, w)
    P["+첫날 w0.5"] = addw(pb, fe, 0.5)
    res["덧셈형 " + tag] = score(dd, "y1", P, start=st)
# 교차 로지스틱: 기존(코스피20 꼬리·S&P5 꼬리·🎢5칸 더미) + 되돌림
D = pd.DataFrame({"c": 1.0, "kh": rk >= .9, "kl": rk <= .1, "sh": rs >= .9, "sl": rs <= .1,
                  "r1": rb == "r1", "r2": rb == "r2", "r4": rb == "r4", "r5": rb == "r5", "e": fl, "e1": fe}, index=dd.index).astype(float)
m = y.notna(); ix = dd.index[m]; mi = ix[len(ix) // 2]; yy = y[m].values.astype(float); Xa = D[m].values; a, b_ = ix < mi, ix >= mi
R = {}
for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
    s_ = {}
    for kk, cols in (("기존", list(range(9))), ("+되돌림", list(range(9)) + [9]), ("+첫날", list(range(9)) + [10])):
        w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
        s_[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
        if kk != "기존": s_[kk + "계수"] = round(float(w_[9]), 3)
    R[nm] = s_
res["교차(🎢5칸 포함)"] = R
print(json.dumps(res, ensure_ascii=False, indent=1))
json.dump(res, open("probe/kq105b_bt.json", "w"), ensure_ascii=False, indent=1)
