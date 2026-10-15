"""#7 풋콜 비율(CBOE) 검증 — 확률 보강 일지 10/15 13시 (Actions 에서 실행)
   자료 주소를 여러 곳 시험 → 받은 역사로 「지금과 같은 구간」 다음 날·5일 상승 비율 + 걸어가며 브라이어"""
import json, sys, os, io, datetime as dt, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
def fetch(u, t=30):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t) as r:
            b = r.read(); print("OK", r.status, len(b), u); return b
    except Exception as e:
        print("FAIL", u, str(e)[:120]); return None

out = {"src": {}, "mk": {}}
# 1) 옛 역사 CSV (CBOE)
series = {}
for nm in ("totalpc", "equitypc", "indexpc"):
    for u in (f"https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/{nm}.csv",
              f"https://www.cboe.com/publish/scheduledtask/mktdata/datahouse/{nm}.csv"):
        b = fetch(u)
        if not b: continue
        txt = b.decode("utf-8", "ignore"); lines = txt.splitlines()
        print(nm, "head:", lines[:4], "tail:", lines[-2:])
        hi = next((i for i, l in enumerate(lines) if l.upper().startswith("DATE")), None)
        if hi is None: continue
        df = pd.read_csv(io.StringIO("\n".join(lines[hi:])))
        df.columns = [c.strip().upper() for c in df.columns]
        dc = df.columns[0]; pc = [c for c in df.columns if "RATIO" in c or "P/C" in c][0]
        s = pd.Series(pd.to_numeric(df[pc], errors="coerce").values, index=pd.to_datetime(df[dc], errors="coerce")).dropna().sort_index()
        s = s[~s.index.duplicated()]
        series[nm] = s; out["src"][nm] = [u, str(s.index[0].date()), str(s.index[-1].date()), len(s)]
        break
# 2) 최근 일별 JSON (CBOE 시장 통계)
recent = {}
today = dt.date.today()
for k in range(1, 12):
    day = today - dt.timedelta(days=k)
    if day.weekday() >= 5: continue
    for u in (f"https://cdn.cboe.com/data/us/options/market_statistics/daily/{day}_daily_options",
              f"https://cdn.cboe.com/data/us/options/market_statistics/daily/{day}_daily_options.json"):
        b = fetch(u, 15)
        if b:
            try:
                j = json.loads(b); ratios = j.get("ratios") or j
                print(day, json.dumps(ratios, ensure_ascii=False)[:400]); recent[str(day)] = ratios
            except Exception as e: print("json?", e, b[:200])
            break
    if len(recent) >= 3: break
out["src"]["daily_json"] = list(recent.keys())
# 2b) 2019-10 뒤 빈 기간을 일별 JSON 으로 채움 (10/15 13시: 2019-11~2025 날짜 모두 200 확인)
from concurrent.futures import ThreadPoolExecutor
def one(day):
    u = f"https://cdn.cboe.com/data/us/options/market_statistics/daily/{day}_daily_options"
    for _ in range(2):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=20) as r:
                j = json.loads(r.read()); v = {x["name"]: x["value"] for x in j.get("ratios", [])}
                return day, float(v.get("TOTAL PUT/CALL RATIO", "nan")), float(v.get("EQUITY PUT/CALL RATIO", "nan")), float(v.get("INDEX PUT/CALL RATIO", "nan"))
        except Exception:
            pass
    return day, None, None, None
days = [d.date() for d in pd.bdate_range("2019-10-07", today - dt.timedelta(days=1))]
with ThreadPoolExecutor(16) as ex: got = [g for g in ex.map(one, days) if g[1] is not None]
print("일별 JSON 채움", len(got), "/", len(days))
if got:
    add = {"totalpc": {}, "equitypc": {}, "indexpc": {}}
    for day, t, e, i in got:
        add["totalpc"][pd.Timestamp(day)] = t; add["equitypc"][pd.Timestamp(day)] = e; add["indexpc"][pd.Timestamp(day)] = i
    for nm, dct in add.items():
        if nm in series:
            ss = pd.concat([series[nm], pd.Series(dct)]).sort_index(); series[nm] = ss[~ss.index.duplicated(keep="first")].dropna()
            print(nm, "합침", series[nm].index[0].date(), "→", series[nm].index[-1].date(), len(series[nm]), "지금 5일 평균", round(series[nm].iloc[-5:].mean(), 3))

# 3) 야후 기호 시험
for sym in ("^CPC", "^CPCE", "^PCCE", "^PCC"):
    b = fetch(f"https://query1.finance.yahoo.com/v8/finance/chart/{sym.replace('^','%5E')}?range=1y&interval=1d", 15)
    if b:
        try:
            r = json.loads(b)["chart"]["result"][0]; c = r["indicators"]["quote"][0]["close"]
            print(sym, "yahoo", len(c), c[-3:]); out["src"]["yahoo_" + sym] = len(c)
        except Exception as e: print(sym, "yahoo parse", str(e)[:80])

def wf_brier(d, cut, prior=150, start="2008-01-01"):
    y = d["y1"]; ok = y.notna() & cut.notna()
    known = y.where(ok).shift(1); base = known.expanding().mean()
    num = pd.Series(np.nan, index=d.index); den = pd.Series(np.nan, index=d.index)
    for lb in cut.dropna().unique():
        m = (cut == lb); ms = m.shift(1, fill_value=False)
        k = known.where(ms).fillna(0).cumsum(); n = (known.notna() & ms).astype(float).cumsum()
        num = num.where(~m, k); den = den.where(~m, n)
    p = (num.fillna(0) + prior * base) / (den.fillna(0) + prior)
    ev = ok & (d.index >= start) & base.notna()
    ix = d.index[ev]; mid = ix[len(ix) // 2]; res = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("2020~", ev & (d.index >= "2020-01-01")), ("최근2년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=730)))):
        res[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 4), round(float(((p[msk] - y[msk]) ** 2).mean()), 4)]
    return res

if series:
    H = prob.load_hist(sorted({c["ix"] for c in prob.MK.values()}))
    for nm, s in series.items():
        if nm == "indexpc": continue
        feats = {"rk": s.rolling(5).mean().rolling(252, min_periods=120).rank(pct=True)}
        print(nm, "지금 1년 백분위", round(float(feats["rk"].iloc[-1]), 3))
        for mk, cfg in prob.MK.items():
            d = prob.feats(H[cfg["ix"]]); d = d[(d.index >= s.index[0]) & (d.index <= s.index[-1] + pd.Timedelta(days=3))]
            lag = (lambda x: x.reindex(d.index).ffill(limit=3)) if mk == "US" else (lambda x: prob_x.align(x, d.index))
            for fn, x in feats.items():
                x = lag(x)
                E = [-0.01, 0.1, 0.3, 0.7, 0.9, 1.01]; L = ["낮음 10%(탐욕)", "낮은 편", "보통", "높은 편", "높음 10%(공포)"]
                cut = pd.cut(x, E, labels=L) if fn == "rk" else pd.qcut(x, 5, labels=L)
                mid = d.index[len(d) // 2]; tb = []
                for lb in L:
                    row = {"k": lb}
                    for half, msk in (("all", d.index == d.index), ("앞", d.index < mid), ("뒤", d.index >= mid)):
                        msk = pd.Series(msk, index=d.index)
                        m = prob.cond(d[msk], (cut == lb)[msk].fillna(False), lb)
                        b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
                        row[half] = None if not m else {"n": m["n"], "d1": round((m["p1"] - b1) * 100, 1), "d5": round(((m["p5"] or 0) - b5) * 100, 1)}
                    tb.append(row)
                R = {"table": tb, "brier": wf_brier(d, cut), "mid": str(mid.date())}
                out["mk"].setdefault(nm, {}).setdefault(mk, {})[fn] = R
                print("==", nm, mk, fn, "브라이어", json.dumps(R["brier"], ensure_ascii=False)); print("   표", json.dumps([[r["k"], r["앞"] and r["앞"]["d1"], r["뒤"] and r["뒤"]["d1"], r["all"] and r["all"]["n"]] for r in R["table"]], ensure_ascii=False))
json.dump(out, open("probe/pcr_bt.json", "w"), ensure_ascii=False, indent=1)
