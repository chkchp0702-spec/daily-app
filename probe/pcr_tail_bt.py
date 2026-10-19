"""#7b 풋콜 「꼬리만」 검증 — 확률 보강 일지 10/19 16시 (Actions 에서 실행)
   전체 5칸은 ❌(10/15) → 1년 백분위 꼬리(≥70%·≥90%·≤30%·≤10%) 날만 조건부 확률, 나머지 날은 평소 그대로 = 실제 붙일 모양으로 걸어가며 브라이어"""
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


def wf_tail(d, tail, ycol, prior=150, start="2008-01-01"):
    """꼬리 날만 그 칸의 과거 비율(경험적 베이즈 수축), 나머지는 평소 — 그날 이전 자료만"""
    y = d[ycol]; ok = y.notna() & tail.notna()
    h = 1 if ycol == "y1" else 5
    known = y.where(ok).shift(h); base = known.expanding().mean()
    t = tail.fillna(False).astype(bool); ts = t.shift(h, fill_value=False).astype(bool)
    k = known.where(ts).fillna(0).cumsum(); n = (known.notna() & ts).astype(float).cumsum()
    pt = (k + prior * base) / (n + prior)
    p = base.where(~t, pt)
    ev = ok & (d.index >= start) & base.notna()
    ix = d.index[ev]; mid = ix[len(ix) // 2]; res = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근2년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=730)))):
        mt = msk & t
        res[nm] = {"전체": [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5)],
                   "꼬리날": int(mt.sum()), "꼬리 오름": round(float(y[mt].mean()) * 100, 1) if mt.sum() else None, "평소": round(float(y[msk].mean()) * 100, 1)}
    return res

for nm, s in series.items():
    s.to_csv(f"probe/pcr_{nm}.csv")
out["tail"] = {}
if series:
    H = prob.load_hist(sorted({c["ix"] for c in prob.MK.values()}))
    for nm in ("equitypc", "totalpc"):
        s = series.get(nm)
        if s is None: continue
        rk = s.rolling(5).mean().rolling(252, min_periods=120).rank(pct=True)
        print(nm, "지금 1년 백분위", round(float(rk.iloc[-1]), 3), rk.index[-1].date())
        out["now_" + nm] = [str(rk.index[-1].date()), round(float(rk.iloc[-1]), 3)]
        for mk, cfg in prob.MK.items():
            d = prob.feats(H[cfg["ix"]]); d = d[(d.index >= s.index[0]) & (d.index <= s.index[-1] + pd.Timedelta(days=3))]
            x = rk.reindex(d.index).ffill(limit=3) if mk == "US" else prob_x.align(rk, d.index)
            for tn, tl in (("공포≥90", x >= 0.9), ("공포≥70", x >= 0.7), ("탐욕≤30", x <= 0.3), ("탐욕≤10", x <= 0.1)):
                tl = tl.where(x.notna())
                for yc in ("y1", "y5"):
                    R = wf_tail(d, tl, yc)
                    out["tail"].setdefault(nm, {}).setdefault(mk, {}).setdefault(tn, {})[yc] = R
                    print("==", nm, mk, tn, yc, json.dumps({k: v for k, v in R.items() if k != "mid"}, ensure_ascii=False))
json.dump(out, open("probe/pcr_tail_bt.json", "w"), ensure_ascii=False, indent=1)
