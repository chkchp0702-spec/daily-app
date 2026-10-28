import sys, json, numpy as np, pandas as pd
exec(open("analyze_kr.py").read().split("HOR = (5, 20, 60)")[0].replace('SRC = sys.argv[1] if len(sys.argv) > 1 else "out/kr_flow.csv.gz"','SRC="/tmp/claude-0/lo/kr_flow.csv.gz"').replace('UNI = sys.argv[2] if len(sys.argv) > 2 else "out/kr_universe.json"','UNI="/tmp/claude-0/lo/kr_universe.json"'))
dates = px.index; reb = dates[60:-21:20]
fwd = px.shift(-21) / px.shift(-1) - 1
large = set(mcap.iloc[-1].dropna().sort_values(ascending=False).index[:200])
for nm in ["외국인 20일 순매수/시총", "기관 20일 순매수/시총", "외국인 보유율 20일 변화"]:
  for lab, codes in (("전체", None), ("대형200", large)):
    S = SIG[nm]; rows = []; contrib = {}
    for t in reb:
        s = S.loc[t]; ok = s.notna() & (liq.loc[t] >= 1e9)
        if codes is not None: ok &= s.index.isin(codes)
        s = s[ok]; q = s.rank(pct=True); f = fwd.loc[t, s.index]; base = f.mean()
        top = f[q >= .9]; rows.append((t.year, top.mean() - base, f[q <= .1].mean() - base, (q >= .9).sum()))
        for c, v in (top - base).items(): contrib[c] = contrib.get(c, 0) + v
    R = pd.DataFrame(rows, columns=["y", "top", "bot", "n"])
    g = R.groupby("y").agg(top=("top", "mean"), spread=("top", "mean"), k=("top", "size"))
    g["spread"] = R.groupby("y").apply(lambda x: (x.top - x.bot).mean())
    print(nm, lab, "| 해마다 20일 초과(상위10%) / 상위-하위:", " ".join(f"{y}:{r.top*100:+.1f}/{r.spread*100:+.1f}" for y, r in g.iterrows()))
    tot = sum(contrib.values()); best = sorted(contrib.items(), key=lambda x: -x[1])[:5]
    print("   기여 상위 5:", ", ".join(f"{uni.get(c,(c,))[0]} {v/tot*100:.0f}%" for c, v in best), f"(합계 {sum(v for _,v in best)/tot*100:.0f}%)")
