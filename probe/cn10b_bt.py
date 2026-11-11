"""#101 중국 국채 10년(CNBC CN10Y-CN) 5·20일 급변 꼬리 → 5개 시장 — 확률 보강 11/11 16시 (Actions, kr10_bt.py 틀)
5·20일 변화(%p 수준차)의 1년 백분위 ≥90%(금리 급등)·≤10%(급락) 한쪽씩 칸. 서울 날짜 값 → 같은 날 행(다음 날 예측).
겹침: 미 10년(^TNX)·S&P 5일 꼬리 칸 위 + 교차 로지스틱. 하루 늦춘(lag1) 판도 같이 — 날짜 어긋남 점검."""
import json, sys, os, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

def cnbc(sym, start="20000101"):
    end = (pd.Timestamp.today() + pd.Timedelta(days=2)).strftime("%Y%m%d")
    u = f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/1D/{start}000000/{end}000000/adjusted/EST5EDT.json"
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"})
    with urllib.request.urlopen(req, timeout=40) as r:
        bars = json.loads(r.read().decode("utf-8")).get("barData", {}).get("priceBars", [])
    v = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in bars if x.get("close")}, dtype=float).sort_index()
    return v[~v.index.duplicated(keep="last")]


cn = cnbc("CN10Y-CN"); print("CN10Y", len(cn), cn.index[0].date(), cn.index[-1].date())
H = prob.load_hist(["^GSPC", "^TNX"])
sp = H["^GSPC"]["Close"].dropna(); tn = H["^TNX"]["Close"].dropna()
d = prob.feats(H["^GSPC"]); d = d[d.index >= "2003-01-01"].copy()
A = lambda s: prob_x.rank252(s).reindex(d.index).ffill()
rg = A(cn.diff(5)); rv = A(tn.diff(5)); rs = A(np.log(sp).diff(5))
f = (rg <= 0.1).fillna(False)
mid = d.index[len(d)//2]; base = d["y5"]
print("mid", mid.date(), "cur_rank", round(float(rg.iloc[-1]), 3))
for st in range(5):
    idx = d.index[st::5]; dd = d.loc[idx]; ff = f.loc[idx]
    r = []
    for msk in (dd.index < mid, dd.index >= mid):
        y = dd.loc[msk, "y5"].dropna(); fy = ff.loc[y.index]
        r.append([int(fy.sum()), round((y[fy].mean() - y.mean()) * 100, 1)])
    print("간격 시작", st, r)
# 사건 솎기: 꼬리 첫날만(앞 5일 안에 꼬리 없었던 날)
first = f & ~f.shift(1, fill_value=False).rolling(5, min_periods=1).max().astype(bool)
for nm, ff in (("첫날", first), ("꼬리&S&P5일≤10 아님", f & ~(rs <= 0.1).fillna(False)), ("꼬리&미10년≤10 아님", f & ~(rv <= 0.1).fillna(False))):
    r = []
    for msk in (d.index < mid, d.index >= mid):
        y = d.loc[msk, "y5"].dropna(); fy = ff.loc[y.index]
        r.append([int(fy.sum()), round((y[fy].mean() - y.mean()) * 100, 1)])
    print(nm, r)
# 해마다 같은 쪽인지
yr = {}
for Y in range(2003, 2027):
    m = (d.index.year == Y); y = d.loc[m, "y5"].dropna(); fy = f.loc[y.index]
    if fy.sum() >= 5: yr[Y] = round((y[fy].mean() - y.mean()) * 100, 1)
print("해마다", yr, "음수 해", sum(v < 0 for v in yr.values()), "/", len(yr))
