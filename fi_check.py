import sys, numpy as np, pandas as pd
F = pd.read_csv("/tmp/claude-0/mkt_flow.csv", parse_dates=["date"]); I = pd.read_csv("/tmp/claude-0/mkt_index.csv", parse_dates=["Date"]).set_index("Date")
for mk, ixc in (("KOSPI", "^KS11"), ("KOSDAQ", "^KQ11")):
    f = F[F.mk == mk].set_index("date").sort_index(); px = I[ixc].dropna(); px = px[px.index.isin(f.index)]; f = f.reindex(px.index)
    fwd = px.shift(-21) / px.shift(-1) - 1
    s = f["FINANCIAL_INVESTOR"].rolling(20).sum(); pr = s.rolling(252, min_periods=200).rank(pct=True)
    mom = (px / px.shift(20) - 1).rolling(252, min_periods=200).rank(pct=True)
    d = pd.DataFrame({"fwd": fwd, "pr": pr, "mom": mom}).dropna()
    print(f"\n== {mk}: 금융투자 20일 순매수 vs 20일 지수 모멘텀  (상관 {d.pr.corr(d.mom):.2f})")
    allm = d.fwd.mean()
    for nm, m in (("금융투자 상위20%", d.pr >= .8), ("금융투자 하위20%", d.pr <= .2), ("모멘텀 상위20%", d.mom >= .8), ("모멘텀 하위20%", d.mom <= .2),
                  ("금융투자 상위 & 모멘텀 상위 아님", (d.pr >= .8) & (d.mom < .8)), ("금융투자 하위 & 모멘텀 하위 아님", (d.pr <= .2) & (d.mom > .2))):
        x = d[m]; xs = x.iloc[::20]
        t = (xs.fwd.mean() - allm) / (d.fwd.iloc[::20].std() / np.sqrt(len(xs))) if len(xs) > 2 else np.nan
        print(f"  {nm:28s} n={len(x):4d}  20일 {x.fwd.mean()*100:+.2f}% (평균 {allm*100:+.2f}%, 차 {(x.fwd.mean()-allm)*100:+.2f}%p, t≈{t:.1f})  해마다 차:",
              " ".join(f"{y}:{(g.fwd.mean()-allm)*100:+.1f}" for y, g in x.groupby(x.index.year) if len(g) > 10))
    # 회귀: fwd ~ pr + mom
    X = np.column_stack([np.ones(len(d)), d.pr - .5, d.mom - .5]); b = np.linalg.lstsq(X, d.fwd.values, rcond=None)[0]
    print(f"  회귀(백분위 0→1 기울기): 금융투자 {b[1]*100:+.2f}%p · 모멘텀 {b[2]*100:+.2f}%p")
