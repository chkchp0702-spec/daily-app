"""KRX(로그인) 종목별 투자자 상세 순매수 금액 + 시총·종가, 2016-01 ~ 오늘.
종목 = 해마다 1월 첫 거래일 기준 시총 상위 250(코스피+코스닥)의 합집합 — 상장폐지 종목도 들어가게(생존 편향 줄임)"""
import os, sys, time, json, csv, datetime as dt
from pykrx import stock
SH, NS = int(os.environ.get("SHARD", "0")), int(os.environ.get("NSHARD", "1"))
today = dt.date.today().strftime("%Y%m%d")
years = list(range(2016, dt.date.today().year + 1))
def retry(f, *a, **k):
    for i in range(4):
        try:
            return f(*a, **k)
        except Exception as e:
            err = e; time.sleep(3 * (i + 1))
    raise err
uni_path = "uni.json"
if not os.path.exists(uni_path):
    U = {}
    for y in years:
        d = retry(stock.get_nearest_business_day_in_a_week, f"{y}0105")
        caps = []
        for mk in ("KOSPI", "KOSDAQ"):
            c = retry(stock.get_market_cap, d, market=mk)
            caps.append(c)
        import pandas as pd
        c = pd.concat(caps); c = c[c.index.str.match(r"^\d{5}0$")].sort_values("시가총액", ascending=False).head(250)
        for t in c.index: U.setdefault(t, y)
        print(y, d, len(U)); sys.stdout.flush()
    json.dump(U, open(uni_path, "w"))
U = json.load(open(uni_path))
codes = sorted(U)[SH::NS][:int(os.environ.get("LIMIT", "100000"))]
os.makedirs("out", exist_ok=True)
if SH == 0: json.dump(U, open("out/krx_universe.json", "w"))
f = open(f"out/krx_flow_{SH}.csv", "w", newline=""); w = csv.writer(f)
COLS = ["금융투자", "보험", "투신", "사모", "은행", "기타금융", "연기금", "기타법인", "개인", "외국인", "기타외국인"]
w.writerow(["code", "date", "close", "mcap", "val"] + COLS)
t0 = time.time(); bad = 0
for i, cd in enumerate(codes):
    try:
        for y in years:
            a, b = f"{y}0101", min(f"{y}1231", today)
            fl = retry(stock.get_market_trading_value_by_date, a, b, cd, detail=True)
            if fl is None or not len(fl): continue
            mc = retry(stock.get_market_cap_by_date, a, b, cd)
            j = fl.join(mc[["종가", "시가총액", "거래대금"]] if "종가" in mc.columns else mc, how="left")
            for d, r in j.iterrows():
                w.writerow([cd, d.strftime("%Y-%m-%d"), r.get("종가"), r.get("시가총액"), r.get("거래대금")] + [r.get(c) for c in COLS])
            time.sleep(0.2)
    except Exception as e:
        bad += 1; print("fail", cd, e)
    f.flush()
    open(f"out/fetch_log_{SH}.txt", "w").write(f"{i+1}/{len(codes)} bad {bad} secs {round(time.time()-t0)}\n")
    if i % 10 == 0: print(i, cd, round(time.time() - t0)); sys.stdout.flush()
f.close()
