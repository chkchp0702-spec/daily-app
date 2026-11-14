"""#109 외국인 코스피200 선물 순매수(억원) 1·5·20일 합 꼬리(1년 백분위 ≥90·≤10) → 코스피 다음 날·5일 — 확률 보강 일지 11/14 16시 (Actions)
자료 길: m.stock.naver.com/api/index/FUT/trend?bizdate=YYYYMMDD (11/14 확인: bizdate 파라미터로 그날 값이 나옴)."""
import json, sys, os, time
from concurrent.futures import ThreadPoolExecutor
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
H0 = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"}
res = {"주소": "https://m.stock.naver.com/api/index/FUT/trend?bizdate=YYYYMMDD"}
import prob, prob_x
from night_bt_lib import wf, score, lab, logit_fit
H = prob.load_hist(["^KS11", "^GSPC"])
import yfinance as yf
for s_ in ("^KS11", "^GSPC"):
    for _ in range(3):
        if s_ in H and len(H[s_]) > 3000: break
        time.sleep(3); o = yf.download(s_, start="2000-01-01", interval="1d", auto_adjust=False, progress=False, threads=False)
        if isinstance(o.columns, pd.MultiIndex): o.columns = o.columns.get_level_values(0)
        if len(o): o = o[["Open", "Close"]].dropna(subset=["Close"]); o.index = pd.to_datetime(o.index).tz_localize(None); H[s_] = o
ks = H["^KS11"]["Close"].dropna(); sp = H["^GSPC"]["Close"].dropna()
days = [d for d in ks.index if d >= pd.Timestamp("2008-01-01")]
num = lambda v: float(str(v).replace(",", "").replace("+", ""))
def one(d):
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
    rows = [r for r in ex.map(one, days) if r]
print("rows", len(rows), "of", len(days), flush=True)
raw = pd.DataFrame(rows, columns=["d", "f", "i", "p"]).set_index("d").sort_index()
raw.to_csv("probe/ffut109_raw.csv")
res.update({"rows": len(raw), "first": str(raw.index[0].date()), "last": str(raw.index[-1].date())})
# 빈칸 확인: 연도별 개수
res["연도별"] = {str(k): int(v) for k, v in raw.groupby(raw.index.year).size().items()}
d = prob.feats(H["^KS11"]); d = d[d.index >= raw.index[0]].copy(); idx = d.index
out = {}
for who in ("f", "i"):
    s = raw[who].reindex(idx)
    F = {k: prob_x.rank252(s.rolling(k, min_periods=k).sum()) for k in (1, 5, 20)}
    rk = prob_x.rank252(np.log(ks).diff(5)).reindex(idx)
    rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), idx)
    v = rk.notna() & rs.notna() & F[20].notna()
    dd = d[v].copy(); rk2, rs2 = rk[v], rs[v]; F = {k: x[v] for k, x in F.items()}
    mid = dd.index[len(dd) // 2]; r5m = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
    R = {"n": len(dd), "mid": str(mid.date()), "지금": {f"{k}일 순위": round(float(F[k].iloc[-1]), 3) for k in F},
         "최근5일(억)": [float(x) for x in s.dropna().iloc[-5:]]}
    cells = {}
    for k in (1, 5, 20):
        for side, f in (("≥90", F[k] >= .9), ("≤10", F[k] <= .1)):
            nm = f"{k}일{side}"; cells[nm] = {}
            for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5m)):
                c_ = prob.cond(dd[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1),
                                                        round((c_["p5"] - dd.loc[msk, "y5"].mean()) * 100, 1) if c_["p5"] is not None else None]
    R["칸(n,다음날%p,5일%p)"] = cells
    R["겹침(코스피5일꼬리)"] = {f"{k}일{s_}": [int(f.sum()), int((f & ((rk2 >= .9) | (rk2 <= .1))).sum())] for k in (1, 5, 20) for s_, f in (("≥90", F[k] >= .9), ("≤10", F[k] <= .1))}
    base = lab(rk2, "kh", "kl") + "|" + lab(rs2, "sh", "sl")
    st = str(dd.index[300].date())
    for ycol, h in (("y1", 1), ("y5", 5)):
        Ps = {"기존": wf(dd, base, ycol, h)[0]}
        for k in (1, 5, 20):
            Ps[f"+{k}일"] = wf(dd, base + "|" + lab(F[k], "ph", "pl"), ycol, h)[0]
        R["걸어가기 " + ycol] = score(dd, ycol, Ps, start=st)
        y = dd[ycol]; m = y.notna(); ix = dd.index[m]; mi = ix[len(ix) // 2]; yy = y[m].values.astype(float)
        a, b_ = ix < mi, ix >= mi; X = {}
        for k in (1, 5, 20):
            D = pd.DataFrame({"c": 1.0, "kh": rk2 >= .9, "kl": rk2 <= .1, "sh": rs2 >= .9, "sl": rs2 <= .1, "ph": F[k] >= .9, "pl": F[k] <= .1}, index=dd.index).astype(float)
            Xa = D[m].values
            for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
                o = {}
                for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("+", [0, 1, 2, 3, 4, 5, 6])):
                    w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
                    o[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
                    if kk == "+": o["계수(ph,pl)"] = [round(float(w_[5]), 3), round(float(w_[6]), 3)]
                X[f"{k}일 {nm}"] = o
        R["교차 " + ycol] = X
    out[{"f": "외국인", "i": "기관"}[who]] = R
res["결과"] = out
print(json.dumps(res, ensure_ascii=False, indent=1))
json.dump(res, open("probe/ffut109_bt.json", "w"), ensure_ascii=False, indent=1)
