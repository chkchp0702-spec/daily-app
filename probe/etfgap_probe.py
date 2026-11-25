# 🔍 11/25 12시: 장중 prob 실행에서 🎯 ETF 근거(EWY·FXI·ASHR) 빠짐 원인 — load_hist 와 같은 방식으로 받아 마지막 줄 보기
import sys, os
sys.path.insert(0, os.getcwd())
import pandas as pd, prob
syms = sorted({c["ix"] for c in prob.MK.values()} | set(prob.EXTRA))
import yfinance as yf
df = yf.download(syms, start="2000-01-01", interval="1d", group_by="ticker", auto_adjust=False, progress=False, threads=True)
for s in ["EWY", "FXI", "ASHR", "NKD=F", "^GSPC", "^KS11", "^HSI", "000001.SS", "EWJ", "EWH", "KWEB"]:
    try:
        sub = df[s][["Open", "Close"]]
        print("==", s, "rows", len(sub), "nonnull", int(sub["Close"].notna().sum()))
        print(sub.tail(4).to_string())
    except Exception as e:
        print("==", s, "없음", e)
H = prob.load_hist(syms)
try:
    prob.patch_live(H)
except Exception as e:
    print("patch_live 실패", e)
for s in ["EWY", "FXI", "ASHR", "NKD=F", "^GSPC"]:
    h = H.get(s)
    print("H", s, None if h is None else (len(h), str(h.index[-1].date()), str(h.index[0].date())))
for s in ["EWY", "FXI", "ASHR"]:
    one = yf.download(s, period="10d", interval="1d", auto_adjust=False, progress=False)
    print("single", s); print(one.tail(3).to_string())
