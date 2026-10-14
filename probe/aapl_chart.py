import yfinance as yf, pandas as pd, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
d = yf.download("AAPL", period="2y", auto_adjust=False, progress=False)
if isinstance(d.columns, pd.MultiIndex): d.columns = d.columns.get_level_values(0)
c = d["Close"]; v = d["Volume"]
fig, (a, b) = plt.subplots(2, 1, figsize=(12, 7), gridspec_kw={"height_ratios": [4, 1]}, sharex=True)
a.plot(c.index, c, color="#1f4e9c", lw=1.4); a.plot(c.index, c.rolling(50).mean(), color="#e08a00", lw=1, label="50d")
a.plot(c.index, c.rolling(200).mean(), color="#999", lw=1, label="200d"); a.legend(); a.grid(alpha=.3)
a.set_title(f"AAPL 2y daily · last {c.iloc[-1]:.2f} ({c.index[-1].date()}) · 52w high {c.tail(252).max():.2f}")
b.bar(v.index, v, color="#888", width=1); b.grid(alpha=.3)
plt.tight_layout(); plt.savefig("probe/aapl.png", dpi=90)
w = c.resample("W-FRI").last().tail(60)
open("probe/aapl_weekly.txt", "w").write("\n".join(f"{i.date()} {x:.2f}" for i, x in w.items()))
