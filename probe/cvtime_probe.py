"""11/25 16시: 🌊 그 나라 변동성 지수(VKOSPI·닛케이 VI·VHSI) 아침판 빠짐 원인 — CNBC 일봉 날짜 이름·나오는 시각 확인."""
import json, urllib.request, datetime as dt
import pandas as pd, numpy as np, yfinance as yf
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
print("지금 UTC", dt.datetime.utcnow())
def bars(sym, start="20240101", tf="1D"):
    end = (pd.Timestamp.today() + pd.Timedelta(days=2)).strftime("%Y%m%d")
    u = f"https://ts-api.cnbc.com/harmony/app/bars/{sym}/{tf}/{start}000000/{end}000000/adjusted/EST5EDT.json"
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30) as r:
        return json.loads(r.read().decode()).get("barData", {}).get("priceBars", [])
idx = {".KSVKOSPI": "^KS11", ".JNIV": "^N225", ".VHSI": "^HSI"}
for s, ix in idx.items():
    b = bars(s)
    print("\n==", s, len(b))
    for x in b[-6:]:
        print({k: x.get(k) for k in ("tradeTime", "tradeTimeinMills", "open", "close", "volume")})
    v = pd.Series({pd.Timestamp(x["tradeTime"][:8]): float(x["close"]) for x in b if x.get("close")}).sort_index()
    v = v[~v.index.duplicated(keep="last")]
    c = yf.download(ix, start="2024-01-01", progress=False, auto_adjust=False)["Close"].squeeze()
    r = np.log(c).diff(); dv = np.log(v).diff().reindex(r.index)
    for sh in (-1, 0, 1):
        print(f"  지수 등락 vs 변동성 변화 shift {sh}: {r.corr(dv.shift(sh)):.3f}")
    print("  지수 마지막 5:", [str(d.date()) for d in c.index[-5:]], " 변동성 마지막 5:", [str(d.date()) for d in v.index[-5:]])
    try:
        bi = bars(s, (pd.Timestamp.today() - pd.Timedelta(days=4)).strftime("%Y%m%d"), "5M")
        print("  5분봉 처음·끝:", bi[0].get("tradeTime") if bi else None, bi[-1].get("tradeTime") if bi else None, len(bi))
        days = sorted({x["tradeTime"][:8] for x in bi}); print("  5분봉 날짜:", days)
        for d in days: 
            t = [x["tradeTime"] for x in bi if x["tradeTime"][:8] == d]; print("   ", d, t[0], "~", t[-1])
    except Exception as e:
        print("  5분봉 실패", e)
