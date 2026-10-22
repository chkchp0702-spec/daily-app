"""임시: #9 신용잔고·반대매매 자료 찾기 + 검증 (Actions)"""
import json, re, sys, os, time, requests
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
def tryget(nm, url, **kw):
    try:
        r = (requests.post if "json" in kw or "data" in kw else requests.get)(url, headers={**UA, **kw.pop("h", {})}, timeout=20, **kw)
        print("TRY", nm, r.status_code, len(r.content), repr(r.text[:300]).replace("\\n", " "))
        return r
    except Exception as e:
        print("TRY", nm, "ERR", e); return None
# --- 다른 주소 시험 ---
for obj in ("STATSCU0100000060BO", "STATSCU0100000070BO", "STATSCU0100000080BO"):
    tryget("freesis " + obj, "https://freesis.kofia.or.kr/meta/getMetaDataList.do",
           json={"dmSearch": {"tmpV40": "100000000", "tmpV41": "1", "tmpV1": "D", "tmpV45": "20261001", "tmpV46": "20261021", "OBJ_NM": obj}},
           h={"Content-Type": "application/json; charset=UTF-8", "Referer": "https://freesis.kofia.or.kr/"})
tryget("daum deposit", "https://finance.daum.net/api/market_index/deposit?page=1&perPage=10", h={"Referer": "https://finance.daum.net/"})
tryget("naver m deposit", "https://m.stock.naver.com/api/index/KOSPI/deposit")
# --- 네이버 증시자금동향 (고객예탁금·신용잔고) ---
rows = []; seen = set()
for pg in range(1, 900):
    try:
        r = requests.get(f"https://finance.naver.com/sise/sise_deposit.naver?page={pg}", headers=UA, timeout=20)
    except Exception as e:
        print("page", pg, e); time.sleep(1); continue
    t = r.content.decode("euc-kr", "ignore")
    if pg == 1: print("NAVER p1", r.status_code, re.sub(r"\s+", " ", re.sub("<[^>]+>", " ", t))[:900])
    new = 0
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
        tds = [re.sub(r"\s+", "", re.sub("<[^>]+>", "", x)) for x in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
        if tds and re.fullmatch(r"\d\d\.\d\d\.\d\d", tds[0]) and tds[0] not in seen:
            seen.add(tds[0]); rows.append(tds); new += 1
    if new == 0: print("끝 page", pg); break
    time.sleep(0.05)
print("행", len(rows), rows[:2], rows[-1:] if rows else None)
def num(x):
    x = x.replace(",", "")
    try: return float(x)
    except: return np.nan
df = pd.DataFrame({"date": pd.to_datetime(["20" + r[0] for r in rows], format="%Y.%m.%d"),
                   "dep": [num(r[1]) for r in rows], "cr": [num(r[3]) if len(r) > 3 else np.nan for r in rows]}).set_index("date").sort_index()
os.makedirs("probe", exist_ok=True); df.to_csv("probe/credit_naver.csv")
print(df.head(3)); print(df.tail(5)); print("신용잔고 있는 날", int(df.cr.notna().sum()))
if df.cr.notna().sum() < 800: sys.exit(0)
# --- 검증 ---
import yfinance as yf, prob
def wf(d, lab, ycol, prior=150, start="2005-01-01"):
    y = d[ycol]; h = 1 if ycol == "y1" else 5
    ok = y.notna(); known = y.where(ok).shift(h); base = known.expanding().mean(); p = base.copy()
    labs = [l for l in lab.dropna().unique()]
    for L in labs:
        t = (lab == L); ts = t.shift(h, fill_value=False).astype(bool)
        k = known.where(ts).fillna(0).cumsum(); n = (known.notna() & ts).astype(float).cumsum()
        p = p.where(~t, (k + prior * base) / (n + prior))
    ev = ok & (d.index >= start) & base.notna() & lab.notna(); ix = d.index[ev]
    if len(ix) < 300: return None
    mid = ix[len(ix) // 2]; res = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근2년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=730)))):
        cells = {}
        for L in labs:
            mt = msk & (lab == L)
            if mt.sum(): cells[str(L)] = [int(mt.sum()), round(float(y[mt].mean() - y[msk].mean()) * 100, 1)]
        res[nm] = {"브라이어": [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5)],
                   "평소": round(float(y[msk].mean()) * 100, 1), "칸(n,차이%p)": cells}
    return res
px = yf.download("^KS11", start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
if isinstance(px.columns, pd.MultiIndex): px.columns = px.columns.get_level_values(0)
px.index = pd.to_datetime(px.index).tz_localize(None); px = px[["Open", "Close"]].dropna()
d = prob.feats(px)
# 발표가 다음 날 → 하루 더 늦춰 씀 (그날 종가에 알 수 있던 값만)
c = df.reindex(d.index, method="ffill").shift(1)
cr, dep = c["cr"], c["dep"]
F = {"신용20일변화": cr.pct_change(20), "신용5일변화": cr.pct_change(5), "신용/250일평균": cr / cr.rolling(250, min_periods=150).mean(),
     "신용/예탁금": cr / dep, "예탁금20일변화": dep.pct_change(20)}
out = {"now": {}}
for nm, f in F.items():
    rk = f.rolling(252, min_periods=120).rank(pct=True)
    out["now"][nm] = [round(float(f.iloc[-1]), 4), round(float(rk.iloc[-1]), 3)]
    labs = {"5칸": pd.cut(rk, [-0.01, .2, .4, .6, .8, 1.01], labels=["매우낮음", "낮음", "보통", "높음", "매우높음"]).astype(object).where(rk.notna()),
            "위꼬리≥90": pd.Series(np.where(rk >= .9, "위꼬리", "그외"), index=d.index).where(rk.notna()),
            "아래꼬리≤10": pd.Series(np.where(rk <= .1, "아래꼬리", "그외"), index=d.index).where(rk.notna())}
    if nm == "신용5일변화":
        labs["급감+5일↓3%(반대매매)"] = pd.Series(np.where((rk <= .1) & (d["r5"] < -.03), "반대매매", "그외"), index=d.index).where(rk.notna())
    for ln, lab in labs.items():
        for yc in ("y1", "y5"):
            r = wf(d, lab, yc); out.setdefault(nm, {}).setdefault(ln, {})[yc] = r
            if r:
                g = all(r[k]["브라이어"][1] < r[k]["브라이어"][0] for k in ("앞", "뒤", "최근2년"))
                print("RES", "✅" if g else "  ", nm, ln, yc, json.dumps({k: v for k, v in r.items() if k != "mid"}, ensure_ascii=False))
print("NOW", json.dumps(out["now"], ensure_ascii=False))
json.dump(out, open("probe/credit_bt.json", "w"), ensure_ascii=False, indent=1)
