"""#63 남향 자금(港股通 본토→홍콩 순매수) 일별 이력 찾기 — 공개 주소 여러 곳 시험 → probe/sb.csv"""
import json, requests, pandas as pd
UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://data.eastmoney.com/"}
got = {}
# 1) 동방재부 datacenter RPT_MUTUAL_DEAL_HISTORY (006 남향 합계 · 002 沪 · 004 深)
for mt in ("006", "002", "004"):
    rows = []
    for pg in range(1, 40):
        u = ("https://datacenter-web.eastmoney.com/api/data/v1/get?reportName=RPT_MUTUAL_DEAL_HISTORY&columns=ALL"
             f"&filter=(MUTUAL_TYPE%3D%22{mt}%22)&sortColumns=TRADE_DATE&sortTypes=-1&pageSize=500&pageNumber={pg}&source=WEB&client=WEB")
        try:
            r = requests.get(u, headers=UA, timeout=20); j = r.json()
        except Exception as e:
            print("DC", mt, pg, "ERR", repr(e)[:120]); break
        res = j.get("result") or {}
        dat = res.get("data") or []
        if pg == 1: print("DC", mt, r.status_code, "pages", res.get("pages"), "keys", list(dat[0].keys())[:25] if dat else j.get("message"))
        if not dat: break
        rows += dat
        if pg >= (res.get("pages") or 1): break
    if rows:
        df = pd.DataFrame(rows); print("DC", mt, len(df), df["TRADE_DATE"].min(), df["TRADE_DATE"].max())
        print(df.head(3).to_string()[:1500]); got["dc" + mt] = df
# 2) push2his kamt.kline
for host in ("push2his.eastmoney.com", "push2.eastmoney.com"):
    u = f"https://{host}/api/qt/kamt.kline/get?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f55,f56&klt=101&lmt=5000"
    try:
        r = requests.get(u, headers=UA, timeout=20); j = r.json().get("data") or {}
        print("KAMT", host, r.status_code, {k: (len(v) if isinstance(v, list) else v) for k, v in j.items()})
        for k in ("n2s", "sh2hk", "sz2hk"):
            if j.get(k): print(k, j[k][:2], j[k][-2:]); got.setdefault("kamt_" + k, j[k])
    except Exception as e:
        print("KAMT", host, "ERR", repr(e)[:120])
# 3) HKEX 일별 js (예시 하루)
try:
    r = requests.get("https://www.hkex.com.hk/eng/csm/DailyStat/data_tab_daily_20261030e.js", headers={"User-Agent": "Mozilla/5.0"}, timeout=20)
    print("HKEX", r.status_code, r.text[:300].replace("\n", " "))
except Exception as e:
    print("HKEX ERR", repr(e)[:120])
# 저장: datacenter 006 우선, 없으면 002+004 합, 없으면 kamt n2s
out = None
if "dc006" in got:
    df = got["dc006"]
elif "dc002" in got and "dc004" in got:
    df = pd.concat([got["dc002"], got["dc004"]])
else:
    df = None
if df is not None:
    col = next((c for c in ("NET_DEAL_AMT", "FUND_INFLOW", "NET_BUY_AMT") if c in df.columns and df[c].notna().sum() > 100), None)
    print("col", col, {c: int(df[c].notna().sum()) for c in df.columns if "AMT" in c or "INFLOW" in c})
    if col:
        s = df.assign(d=pd.to_datetime(df["TRADE_DATE"]).dt.normalize()).groupby("d")[col].sum(min_count=1).dropna()
        out = s
elif "kamt_n2s" in got:
    rr = [x.split(",") for x in got["kamt_n2s"]]
    out = pd.Series({pd.Timestamp(a[0]): float(a[1]) for a in rr if a[1] not in ("-", "")})
if out is not None:
    out = out.sort_index(); out.rename("net").to_csv("probe/sb.csv"); print("SAVED", len(out), out.index[0].date(), out.index[-1].date(), out.tail(5).to_dict())
else:
    print("NOTHING")
