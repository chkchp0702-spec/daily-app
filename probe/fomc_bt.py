# 🎲 #5 이벤트: FOMC 결정일 앞뒤 (Lucca & Moench 2015 「FOMC 전 상승」) — 5개 시장 걸어가며 검증
import json, re, sys, os, requests
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
UA = {"User-Agent": "Mozilla/5.0"}
MON = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], 1)}
MON.update({m[:3]: i for m, i in list(MON.items())})
D = set()
for y in range(2003, 2021):
    try:
        t = requests.get(f"https://www.federalreserve.gov/monetarypolicy/fomchistorical{y}.htm", headers=UA, timeout=30).text
    except Exception as e:
        print("hist", y, e); continue
    t = re.sub(r"<[^>]+>", " ", t)
    k = 0
    for m in re.finditer(r"([A-Z][a-z]+)\s+(\d{1,2})(?:\s*-\s*(?:([A-Z][a-z]+)\s+)?(\d{1,2}))?\s+Meeting\s*-\s*(\d{4})", t):
        m1, d1, m2, d2, yy = m.groups()
        if m1 not in MON: continue
        mm = MON.get(m2 or m1); dd = int(d2 or d1)
        D.add(pd.Timestamp(int(yy), mm, dd)); k += 1
    print("hist", y, k)
t = requests.get("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", headers=UA, timeout=30).text
for blk in re.split(r'<div class="panel panel-default', t)[1:]:
    yy = re.search(r"(\d{4}) FOMC Meetings", blk)
    if not yy: continue
    yy = int(yy.group(1))
    for row in re.finditer(r'fomc-meeting__month[^>]*>\s*<strong>([^<]+)</strong>.*?fomc-meeting__date[^>]*>([^<]+)<', blk, re.S):
        mo, da = row.group(1).strip(), row.group(2).strip()
        if "unscheduled" in da.lower() or "notation" in da.lower(): continue
        mo2 = mo.split("/")[-1][:3]; dd = re.findall(r"\d{1,2}", da)
        if mo2 in MON and dd:
            D.add(pd.Timestamp(yy, MON[mo2], int(dd[-1])))
F = sorted(x for x in D if x.year >= 2003)
print("FOMC", len(F), "per year", pd.Series([x.year for x in F]).value_counts().sort_index().to_dict())
print("최근", [str(x.date()) for x in F[-10:]])
import yfinance as yf, prob
from probe_wf import wf
out = {"fomc": [str(x.date()) for x in F]}
Fi = pd.DatetimeIndex(F)
for mk, cfg in prob.MK.items():
    px = yf.download(cfg["ix"], start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(px.columns, pd.MultiIndex): px.columns = px.columns.get_level_values(0)
    px.index = pd.to_datetime(px.index).tz_localize(None); px = px[["Open", "Close"]].dropna()
    d = prob.feats(px); ix = d.index
    nxt = pd.Series(list(ix[1:]) + [ix[-1] + pd.offsets.BDay(1)], index=ix)   # 다음 거래일
    # 결정 시각: 미국 14:00 ET 같은 날 / 아시아 현지 다음 날 새벽 → 아시아는 날짜 D 장중(발표 전) · D 다음 거래일(반응)
    fset = set(Fi)
    first_after = pd.Series([ix[ix > f][0] if (ix > f).any() else pd.NaT for f in Fi], index=Fi)
    react = set(first_after.dropna())
    L = {}
    if mk == "US":
        L["전날→결정일"] = nxt.isin(fset)                       # y1 = 결정일 하루 수익
        L["결정일→다음날"] = pd.Series(ix.isin(fset), index=ix)
    else:
        L["전날→D장(발표 전)"] = nxt.isin(fset)
        L["D→반응일"] = nxt.isin(react)
    # 5일: 앞으로 5거래일 안에 결정일(아시아는 반응일) 들어 있음
    tgt = fset if mk == "US" else react
    pos = pd.Series(np.arange(len(ix)), index=ix); tp = sorted(pos[pos.index.isin(tgt)].values)
    w5 = np.zeros(len(ix), bool)
    for p in tp: w5[max(0, p - 5):p] = True
    L["5일안"] = pd.Series(w5, index=ix)
    o = {}
    for nm, msk in L.items():
        lab = pd.Series(np.where(msk.values, "FOMC", "그외"), index=ix)
        for yc in ("y1", "y5"):
            if nm == "5일안" and yc == "y1": continue
            if nm != "5일안" and yc == "y5": continue
            r = wf(d, lab, yc)
            o[f"{nm}|{yc}"] = r
            if r:
                g = all(r[k]["브라이어"][1] < r[k]["브라이어"][0] for k in ("앞", "뒤", "최근2년"))
                print("RES", "✅" if g else "  ", mk, nm, yc, json.dumps({k: v for k, v in r.items() if k != "mid"}, ensure_ascii=False))
    out[mk] = o
json.dump(out, open("probe/fomc_bt.json", "w"), ensure_ascii=False, indent=1)
