"""#94 한국 프로그램 비차익 순매수 5·20일 합 꼬리(1년 백분위 ≥90·≤10) → 코스피 다음 날·5일 — 확률 보강 일지 11/14 12시 (Actions)
자료 길: 네이버 PC finance.naver.com/sise/programDealTrendDay.naver (코스피 일별 차익·비차익·전체 매수/매도/순매수, 억원) — 쪽 넘기며 끝까지.
막히면 다른 주소 상태만 찍는다."""
import json, sys, os, time, io, re
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36", "Referer": "https://finance.naver.com/sise/sise_program.naver"}
res = {"주소": "https://stock.naver.com/api/domestic/market/trendProgram?tradeType=KRX&krxMarketType=KOSPI&bizdate=YYYYMMDD&startIdx=&pageSize=&periodType=DAY (네이버 새 화면 sise_program.naver → JS 에서 찾음 · 옛 programDealTrendDay 는 410)"}
U = "https://stock.naver.com/api/domestic/market/trendProgram"
H2 = {"User-Agent": UA["User-Agent"], "Referer": "https://stock.naver.com/market/stock/kr/trend/program"}
def lst(j):
    if isinstance(j, list): return j
    for k in ("data", "list", "items", "result", "contents", "trendProgramList"):
        if isinstance(j, dict) and isinstance(j.get(k), list): return j[k]
    if isinstance(j, dict):
        for v in j.values():
            if isinstance(v, list) and v and isinstance(v[0], dict): return v
    return []
allr = []; ps = 100; bd = "20261113"; seen = set()
for i in range(120):          # startIdx 는 100 뒤 빈 쪽 → bizdate 를 거꾸로 옮기며 받기
    try:
        r = requests.get(U, params={"tradeType": "KRX", "krxMarketType": "KOSPI", "bizdate": bd, "startIdx": 0, "pageSize": ps, "periodType": "DAY"}, headers=H2, timeout=20)
        j = r.json()
    except Exception as e:
        print("err", i, str(e)[:100]); break
    L = [x for x in lst(j) if x.get("bizdate") not in seen]
    if i == 0: print("top", str(j)[:400], flush=True)
    if not L: print("끝", i, bd); break
    for x in L: seen.add(x["bizdate"])
    allr += L
    bd = (pd.to_datetime(min(x["bizdate"] for x in L)) - pd.Timedelta(days=1)).strftime("%Y%m%d")
    if i % 10 == 0: print(i, len(allr), bd, flush=True)
    time.sleep(0.15)
print("rows", len(allr), flush=True)
if not allr:
    json.dump(res, open("probe/prog94_bt.json", "w"), ensure_ascii=False, indent=1); sys.exit(0)
k0 = list(allr[0].keys()); print("keys", k0)
dk = next(k for k in k0 if "date" in k.lower())
num = lambda v: float(str(v).replace(",", "").replace("+", "")) if v not in (None, "", "-") else np.nan
nk = [k for k in k0 if k.startswith("biDiff")]
print("nonarb keys", nk)
pick = next((k for k in nk if any(w in k.lower() for w in ("net", "pure", "straight", "total"))), None)
if pick is None:
    bk = next(k for k in nk if "buy" in k.lower() or "bid" in k.lower()); sk = next(k for k in nk if "sell" in k.lower() or "ask" in k.lower())
    na = pd.Series({pd.to_datetime(str(x[dk])[:10].replace(".", "-") if "-" in str(x[dk]) or "." in str(x[dk]) else str(x[dk])[:8]): num(x[bk]) - num(x[sk]) for x in allr})
    res["열"] = f"{bk}-{sk}"
else:
    na = pd.Series({pd.to_datetime(str(x[dk])[:10].replace(".", "-") if "-" in str(x[dk]) or "." in str(x[dk]) else str(x[dk])[:8]): num(x[pick]) for x in allr})
    res["열"] = pick
na = na.sort_index(); na = na[~na.index.duplicated()]
res["rows"] = len(na); res["first"] = str(na.index[0].date()); res["last"] = str(na.index[-1].date()); res["샘플"] = allr[0]
na.to_csv("probe/prog94_raw.csv")
P = pd.DataFrame({0: na})
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
d = prob.feats(H["^KS11"]); d = d[d.index >= na.index[0]].copy(); idx = d.index
nar = na.reindex(idx)                       # 그날 장 끝난 뒤 값 → 다음 날 예측
# 크기 맞추기: 시가총액 커짐 → 1년 백분위로
F = {}
for k in (1, 5, 20):
    F[k] = prob_x.rank252(nar.rolling(k, min_periods=k).sum())
rk = prob_x.rank252(np.log(ks).diff(5)).reindex(idx)
rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), idx)
v = rk.notna() & rs.notna() & F[20].notna()
dd = d[v].copy(); rk, rs = rk[v], rs[v]; F = {k: x[v] for k, x in F.items()}
mid = dd.index[len(dd) // 2]; r5m = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
res.update({"n": len(dd), "mid": str(mid.date()), "지금": {f"{k}일 순위": round(float(F[k].iloc[-1]), 3) for k in F},
            "지금 비차익 최근5일(억)": [float(x) for x in nar.dropna().iloc[-5:]]})
cells = {}
for k in (1, 5, 20):
    for side, f in (("≥90", F[k] >= .9), ("≤10", F[k] <= .1)):
        nm = f"{k}일{side}"; cells[nm] = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5m)):
            c_ = prob.cond(dd[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1),
                                                    round((c_["p5"] - dd.loc[msk, "y5"].mean()) * 100, 1) if c_["p5"] is not None else None]
res["칸(n,다음날%p,5일%p)"] = cells
# 겹침: 코스피 5일 꼬리·S&P 5일 꼬리와 같은 날
res["겹침"] = {f"{k}일{s}": [int(f.sum()), int((f & ((rk >= .9) | (rk <= .1))).sum())] for k in (5, 20) for s, f in (("≥90", F[k] >= .9), ("≤10", F[k] <= .1))}
base = lab(rk, "kh", "kl") + "|" + lab(rs, "sh", "sl")
st = str(dd.index[300].date())
for ycol, h in (("y1", 1), ("y5", 5)):
    pb = wf(dd, base, ycol, h)[0]; Ps = {"기존": pb}
    for k in (1, 5, 20):
        Ps[f"+{k}일"] = wf(dd, base + "|" + lab(F[k], "ph", "pl"), ycol, h)[0]
    res["걸어가기 " + ycol] = score(dd, ycol, Ps, start=st)
    # 교차 로지스틱
    y = dd[ycol]; m = y.notna(); ix = dd.index[m]; mi = ix[len(ix) // 2]; yy = y[m].values.astype(float)
    a, b_ = ix < mi, ix >= mi; R = {}
    for k in (1, 5, 20):
        D = pd.DataFrame({"c": 1.0, "kh": rk >= .9, "kl": rk <= .1, "sh": rs >= .9, "sl": rs <= .1, "ph": F[k] >= .9, "pl": F[k] <= .1}, index=dd.index).astype(float)
        Xa = D[m].values
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            o = {}
            for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("+", [0, 1, 2, 3, 4, 5, 6])):
                w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
                o[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
                if kk == "+": o["계수(ph,pl)"] = [round(float(w_[5]), 3), round(float(w_[6]), 3)]
            R[f"{k}일 {nm}"] = o
    res["교차 " + ycol] = R
print(json.dumps(res, ensure_ascii=False, indent=1))
json.dump(res, open("probe/prog94_bt.json", "w"), ensure_ascii=False, indent=1)
