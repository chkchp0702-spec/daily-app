"""#109b 외국인 코스피200 선물 「하루 대량 순매도(1년 하위 10%)」 → 코스피 다음 날(·5일) — 확률 보강 일지 11/15 10시 (Actions)
#109 ➖: 칸·교차는 통과, 칸 곱하기 걸어가기는 나빠짐 → #37·#51 처럼 덧셈형 걸어가기 · 사건 솎기 · 간밤 S&P 연속값 넣은 교차 로지스틱.
자료: m.stock.naver.com/api/index/FUT/trend?bizdate=YYYYMMDD (2008~) — 받은 이력은 archive/x/ffut_hist.json 에 합쳐 둔다(실시간 1년 백분위용)."""
import json, sys, os, time
from concurrent.futures import ThreadPoolExecutor
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, lab, one, logit_fit
H0 = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
H = prob.load_hist(["^KS11", "^GSPC"])
import yfinance as yf
for s_ in ("^KS11", "^GSPC"):
    for _ in range(3):
        if s_ in H and len(H[s_]) > 3000: break
        time.sleep(3); o = yf.download(s_, start="2000-01-01", interval="1d", auto_adjust=False, progress=False, threads=False)
        if isinstance(o.columns, pd.MultiIndex): o.columns = o.columns.get_level_values(0)
        if len(o): o = o[["Open", "Close"]].dropna(subset=["Close"]); o.index = pd.to_datetime(o.index).tz_localize(None); H[s_] = o
ks = H["^KS11"]["Close"].dropna(); sp = H["^GSPC"]["Close"].dropna(); sp = sp[sp > 0]
days = [x for x in ks.index if x >= pd.Timestamp("2008-01-01")]
num = lambda v: float(str(v).replace(",", "").replace("+", ""))
def get(d):
    bd = d.strftime("%Y%m%d")
    for t in range(3):
        try:
            j = requests.get("https://m.stock.naver.com/api/index/FUT/trend", params={"bizdate": bd}, headers=H0, timeout=15).json()
            if j.get("bizdate") != bd: return None
            return d, num(j["foreignValue"]), num(j["institutionalValue"]), num(j["personalValue"])
        except Exception:
            time.sleep(1 + t)
    return None
with ThreadPoolExecutor(8) as ex:
    rows = [r for r in ex.map(get, days) if r]
raw = pd.DataFrame(rows, columns=["d", "f", "i", "p"]).set_index("d").sort_index()
print("rows", len(raw), "of", len(days), raw.index[0].date(), raw.index[-1].date(), flush=True)
# 이력 채우기 (prob_x._save_ffut 과 같은 꼴, 마지막 2000일)
FF = "archive/x/ffut_hist.json"
h = json.load(open(FF, encoding="utf-8")) if os.path.exists(FF) else {}
for dt, r in raw.iterrows():
    h.setdefault(str(dt.date()), {"f": r["f"], "p": r["p"], "i": r["i"]})
json.dump(dict(sorted(h.items())[-2000:]), open(FF, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

d = prob.feats(H["^KS11"]); d = d[d.index >= raw.index[0]].copy(); idx = d.index
s = raw["f"].reindex(idx)
r1 = prob_x.rank252(s.dropna()).reindex(idx)
rk = prob_x.rank252(np.log(ks).diff(5)).reindex(idx)
rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), idx)
r1s = prob_x.align(prob_x.rank252(np.log(sp).diff(1)), idx)
sp1 = prob_x.align(np.log(sp).diff(1), idx)
v = r1.notna() & rk.notna() & rs.notna() & r1s.notna()
dd = d[v].copy(); r1, rk, rs, r1s, sp1 = r1[v], rk[v], rs[v], r1s[v], sp1[v]
fl = r1 <= .1
fe = fl & ~(fl.shift(1, fill_value=False) | fl.shift(2, fill_value=False) | fl.shift(3, fill_value=False) | fl.shift(4, fill_value=False))
mid = dd.index[len(dd) // 2]; r5m = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
res = {"n": len(dd), "mid": str(mid.date()), "last": str(dd.index[-1].date()), "지금 순위": round(float(r1.iloc[-1]), 3),
       "최근5일(억)": [float(x) for x in s.dropna().iloc[-5:]],
       "겹침": {"순매도일": int(fl.sum()), "첫날": int(fe.sum()), "그중 간밤S&P 하위1/3": int((fl & (r1s <= 1/3)).sum()), "그중 코스피5≤10": int((fl & (rk <= .1)).sum())}}
cells = {}
for nm, f in (("전체", fl), ("첫날(솎음)", fe), ("간밤S&P 하위1/3 아닌 날", fl & (r1s > 1/3))):
    cells[nm] = {}
    for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5m)):
        c_ = prob.cond(dd[msk], f[msk], nm)
        cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1),
                                                round((c_["p5"] - dd.loc[msk, "y5"].mean()) * 100, 1) if c_["p5"] is not None else None]
res["칸(n,다음날%p,5일%p)"] = cells
q3 = pd.Series(np.select([r1s >= 2/3, r1s >= 1/3], ["n3", "n2"], "n1"), index=dd.index, dtype=object)
base = lab(rk, "kh", "kl") + "|" + lab(rs, "sh", "sl") + "|" + q3
st = str(dd.index[300].date())
lo = lambda p: np.log(p / (1 - p))
for ycol, h_ in (("y1", 1), ("y5", 5)):
    pb = wf(dd, base, ycol, h_)[0]
    y = dd[ycol]; known = y.shift(h_); bse = known.expanding().mean()
    R = {"칸곱하기": score(dd, ycol, {"기존": pb, "+순매도": wf(dd, base + "|" + one(r1, fl, "l"), ycol, h_)[0]}, start=st)}
    for tag, f in (("전체", fl), ("첫날", fe)):
        fk = f.shift(h_, fill_value=False)
        k = known.where(fk).fillna(0).cumsum(); n_ = (known.notna() & fk).astype(float).cumsum()
        pl = (k + 100 * bse) / (n_ + 100)
        for w in (0.3, 0.5, 1.0):
            pa = pb.copy(); m = f & pb.notna() & pl.notna()
            pa[m] = 1 / (1 + np.exp(-(lo(pb[m]) + w * (lo(pl[m]) - lo(bse[m])))))
            R[f"덧셈 {tag} w{w}"] = score(dd, ycol, {"기존": pb, "+": pa}, start=st)
            if ycol == "y5" and w == 0.5:   # 5일 간격(겹치지 않는) 날만 채점, 시작점 5개
                R[f"5일간격 {tag}"] = {str(o): score(dd.iloc[o::5], ycol, {"기존": pb.iloc[o::5], "+": pa.iloc[o::5]}, start=st) for o in range(5)}
    D = pd.DataFrame({"c": 1.0, "kh": rk >= .9, "kl": rk <= .1, "sh": rs >= .9, "sl": rs <= .1, "s1": (sp1 / sp1.std()).clip(-4, 4), "l": fl, "e": fe}, index=dd.index).astype(float)
    m = y.notna(); ix = dd.index[m]; mi = ix[len(ix) // 2]; yy = y[m].values.astype(float); Xa = D[m].values; a, b_ = ix < mi, ix >= mi
    X = {}
    for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
        o = {}
        for kk, cols in (("기존", [0, 1, 2, 3, 4, 5]), ("+순매도", [0, 1, 2, 3, 4, 5, 6]), ("+첫날", [0, 1, 2, 3, 4, 5, 7])):
            w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
            o[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
            if kk != "기존": o[kk + " 계수"] = round(float(w_[6]), 3)
        X[nm] = o
    R["교차(간밤 S&P 연속값 포함)"] = X
    res["검사 " + ycol] = R
print(json.dumps(res, ensure_ascii=False, indent=1))
json.dump(res, open("probe/ffut109b_bt.json", "w"), ensure_ascii=False, indent=1)
