import yfinance as yf, pandas as pd
S = ["^GSPC", "XLY", "XLP", "HYG", "LQD", "TLT", "GC=F", "^VIX", "^VIX3M", "^KS11", "^N225"]
df = yf.download(S, start="2026-10-08", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
out = []
for s in S:
    c = df[s]["Close"].dropna(); out.append(f"{s}: " + " · ".join(f"{i.date()} {v:.2f}" for i, v in c.tail(4).items()))
x = pd.Series({s: df[s]["Close"].dropna() for s in ["XLY", "XLP"]})
open("probe/bars.txt", "w").write("\n".join(out)); print("\n".join(out))
