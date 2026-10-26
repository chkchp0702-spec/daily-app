# #13b 미국 섹터 ETF 1998~ 「강한 업종 계속?」 — 5일마다 겹치지 않게
# 섹터 상대강도(20·60·120·250일 수익 − SPY) 순위 → 다음 5일 그 섹터가 SPY 보다 나음 비율
import yfinance as yf, pandas as pd, numpy as np, json
S = ["XLK","XLF","XLE","XLV","XLY","XLP","XLI","XLB","XLU"]
d = yf.download(S + ["SPY"], start="1998-12-01", auto_adjust=True, progress=False)["Close"].dropna()
print("rows", len(d), d.index[0].date(), d.index[-1].date())
idx = d.index[260::5]  # 겹치지 않는 5일 간격
fwd = (d.shift(-5) / d - 1)
ex_f = fwd[S].sub(fwd["SPY"], axis=0)
out = {}
mid = idx[len(idx)//2]
for L in (20, 60, 120, 250):
    rs = (d / d.shift(L) - 1)[S].sub((d["SPY"] / d["SPY"].shift(L) - 1), axis=0)
    rk = rs.rank(axis=1, ascending=False)  # 1 = 가장 강함
    rows = []
    for t in idx:
        if np.isnan(ex_f.loc[t]).all(): continue
        for s in S:
            rows.append((t, int(rk.loc[t, s]), float(ex_f.loc[t, s] > 0), float(ex_f.loc[t, s])))
    R = pd.DataFrame(rows, columns=["t", "rk", "y", "ex"])
    res = {}
    for nm, m in (("앞", R.t < mid), ("뒤", R.t >= mid), ("최근5년", R.t >= R.t.max() - pd.Timedelta(days=1826)), ("최근2년", R.t >= R.t.max() - pd.Timedelta(days=730))):
        X = R[m]; base = X.y.mean()
        top = X[X.rk <= 2]; bot = X[X.rk >= 8]
        res[nm] = {"평소": round(base*100,1), "상위2(n,%,차이)": [len(top), round(top.y.mean()*100,1), round((top.y.mean()-base)*100,1), round(top.ex.mean()*100,3)],
                   "하위2(n,%,차이)": [len(bot), round(bot.y.mean()*100,1), round((bot.y.mean()-base)*100,1), round(bot.ex.mean()*100,3)],
                   "상위-하위 초과%": round((top.ex.mean()-bot.ex.mean())*100,3)}
    out[f"{L}일"] = res
    # 지금 순위
    out[f"{L}일"]["지금"] = {s: int(rk.iloc[-1][s]) for s in S}
out["mid"] = str(mid.date())
print(json.dumps(out, ensure_ascii=False, indent=1))
