import yfinance as yf, shutil, os
d=yf.download(["^KS11","^KQ11"],start="2015-01-01",auto_adjust=False,progress=False)["Close"]
d.to_csv("out/mkt_index.csv"); print(d.tail(), len(d))
