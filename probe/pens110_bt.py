"""#110 연기금 현물 순매수 1·5·20일 합 꼬리(1년 백분위 ≥90·≤10) → 코스피 다음 날·5일 — 확률 보강 일지 11/16 (Actions)
자료 길 찾기: ① 옛 네이버 investorDealTrendDay(HTML, 연기금등 칸) ② stock.naver.com/api/domestic/market/trendInvestor 계열 ③ 다음 investor ④ m.stock.naver.com/api/index/KOSPI/trend."""
import json, sys, os, time, io, re
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36"
res = {"시험": {}}
def tryget(nm, url, params=None, ref=None, enc=None):
    try:
        r = requests.get(url, params=params, headers={"User-Agent": UA, "Referer": ref or url}, timeout=20)
        if enc: r.encoding = enc
        t = r.text
        res["시험"][nm] = [r.status_code, t[:300]]
        print("##", nm, r.status_code, t[:600].replace("\n", " "), flush=True)
        return r
    except Exception as e:
        res["시험"][nm] = ["err", str(e)[:150]]; print("##", nm, "err", e, flush=True)
BD = "20261113"
num = lambda v: float(str(v).replace(",", "").replace("+", "")) if v not in (None, "", "-") else np.nan
# --- 이력: 다음 investor/KOSPI/days?details=true (11/16 찾음 · details 안 연기금 칸) ---
rows = {}; allk = None
for pg in range(1, 140):
    try:
        r = requests.get("https://finance.daum.net/api/investor/KOSPI/days", params={"page": pg, "perPage": 30, "details": "true"},
                         headers={"User-Agent": UA, "Referer": "https://finance.daum.net/domestic/investors"}, timeout=20)
        j = r.json()
    except Exception as e:
        print("page", pg, e); time.sleep(2); continue
    L = j.get("data") or []
    if pg == 1 and L: print("totalCount", j.get("totalCount"), "row0", json.dumps(L[0], ensure_ascii=False)[:1200]); res["row0"] = L[0]; res["totalCount"] = j.get("totalCount")
    for x in L:
        dt = x.get("details") or {}
        if allk is None and dt: allk = list(dt.keys()); print("details keys", allk)
        pk = next((k for k in dt if "PENSION" in k.upper()), None)
        if pk and dt[pk] is not None: rows[x["date"][:10]] = float(dt[pk]) / 1e8
    if len(L) < 30: break
    time.sleep(0.25)
na = pd.Series(rows).sort_index() if rows else None
if na is not None: na.index = pd.to_datetime(na.index); res["자료"] = "https://finance.daum.net/api/investor/KOSPI/days?page=&perPage=30&details=true → details.PENSION* (억원)"
print("pension rows", 0 if na is None else len(na))
if na is None or len(na) < 500:
    print("이력 없음 → 끝"); json.dump(res, open("probe/pens110_bt.json", "w"), ensure_ascii=False, indent=1); sys.exit(0)
na = na[~na.index.duplicated()]
res["rows"] = len(na); res["first"] = str(na.index[0].date()); res["last"] = str(na.index[-1].date())
na.to_csv("probe/pens110_raw.csv")
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
            "지금 연기금 최근5일": [float(x) for x in nar.dropna().iloc[-5:]]})
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
json.dump(res, open("probe/pens110_bt.json", "w"), ensure_ascii=False, indent=1)
