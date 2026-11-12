"""🔑 KRX 지수 PER·PBR·배당수익률 (11/12 사용자 KRX 계정 — 비밀값 KRX_ID·KRX_PW 는 이 저장소에만 있음)
   pykrx get_index_fundamental → archive/x/kr_fund.csv (date, idx, close, per, pbr, div) · 시황리포트 저장소 alt_fetch 가 받아 감"""
import datetime as dt
import os
import sys

import pandas as pd

print("KRX_ID 있음" if os.environ.get("KRX_ID") else "KRX_ID 없음")
from pykrx import stock

fr = []
for nm, tk in (("kospi", "1001"), ("kosdaq", "2001")):
    parts = []
    for y0 in range(2000, dt.date.today().year + 1, 4):
        a, b = f"{y0}0101", min(dt.date(y0 + 3, 12, 31), dt.date.today()).strftime("%Y%m%d")
        try:
            d = stock.get_index_fundamental(a, b, tk)
            print(nm, a, b, len(d), list(d.columns)[:6])
            if len(d): parts.append(d)
        except Exception as e:
            print(nm, a, b, "실패", str(e)[:200])
    if not parts: continue
    d = pd.concat(parts); d = d[~d.index.duplicated()]
    d = d.reset_index(); d.columns = [str(c) for c in d.columns]
    m = {d.columns[0]: "date"}
    for c in d.columns:
        if "종가" in c: m[c] = "close"
        elif "PER" in c.upper(): m[c] = "per"
        elif "PBR" in c.upper(): m[c] = "pbr"
        elif "배당" in c or "DIV" in c.upper(): m[c] = "div"
    d = d.rename(columns=m); d["idx"] = nm; fr.append(d[[c for c in ("date", "idx", "close", "per", "pbr", "div") if c in d.columns]])
if not fr:
    print("받은 것 없음"); sys.exit(1)
df = pd.concat(fr); df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
os.makedirs("archive/x", exist_ok=True); df.to_csv("archive/x/kr_fund.csv", index=False)
print(df.groupby("idx").agg(first=("date", "min"), last=("date", "max"), n=("date", "size")))
print(df.tail(3).to_string())
