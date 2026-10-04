"""
전 종목 가격·1년 차트를 묶음으로 받아 p/<xx>.json (256개 파일)로 저장.
  python opdb/build_prices.py --dest <opdata 폴더>
각 종목: [마지막날짜, 종가, 전일종가, 1년최고, 1년최저, 첫날짜, [주간 종가...]]
"""
import argparse, json, os, sys, time
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
from common import universe, shard  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", required=True)
    ap.add_argument("--batch", type=int, default=200)
    a = ap.parse_args()
    import yfinance as yf
    import pandas as pd

    syms = [s for s, _, _ in universe(os.path.join("_src", "Cup"))]
    print("종목", len(syms), flush=True)
    shards = defaultdict(dict)
    # 기존 값 유지 (이번에 못 받은 종목은 예전 값 그대로)
    pdir = os.path.join(a.dest, "p")
    os.makedirs(pdir, exist_ok=True)
    for f in os.listdir(pdir):
        if f.endswith(".json"):
            shards[f[:-5]] = json.load(open(os.path.join(pdir, f)))
    got = 0
    t0 = time.time()
    for i in range(0, len(syms), a.batch):
        part = syms[i:i + a.batch]
        for attempt in range(3):
            try:
                df = yf.download(part, period="1y", interval="1d", group_by="ticker",
                                 auto_adjust=False, threads=True, progress=False)
                break
            except Exception as e:
                print("재시도", e, flush=True)
                time.sleep(20)
        else:
            continue
        for s in part:
            try:
                c = (df[s]["Close"] if isinstance(df.columns, pd.MultiIndex) else df["Close"]).dropna()
            except Exception:
                continue
            if len(c) < 2:
                continue
            w = c.resample("W-FRI").last().dropna()
            shards[shard(s)][s] = [
                c.index[-1].strftime("%Y-%m-%d"), round(float(c.iloc[-1]), 4), round(float(c.iloc[-2]), 4),
                round(float(c.max()), 4), round(float(c.min()), 4), c.index[0].strftime("%Y-%m-%d"),
                [round(float(v), 4) for v in w.values][-53:],
            ]
            got += 1
        print(f"  {min(i + a.batch, len(syms))}/{len(syms)} 받음 {got} ({time.time() - t0:.0f}s)", flush=True)
    for k, v in shards.items():
        json.dump(v, open(os.path.join(pdir, k + ".json"), "w"), separators=(",", ":"))
    # 원화 환율 (1단위 = 몇 원)
    fx = {"KRW": 1.0}
    try:
        f = yf.download(["KRW=X", "CNYKRW=X", "JPYKRW=X", "HKDKRW=X"], period="10d", interval="1d", group_by="ticker", progress=False)
        for tk, cur in (("KRW=X", "USD"), ("CNYKRW=X", "CNY"), ("JPYKRW=X", "JPY"), ("HKDKRW=X", "HKD")):
            c = f[tk]["Close"].dropna()
            if len(c):
                fx[cur] = round(float(c.iloc[-1]), 4)
        fx["date"] = str(c.index[-1].date())
    except Exception as e:
        print("환율 실패", e)
    if len(fx) > 2:
        json.dump(fx, open(os.path.join(pdir, "fx.json"), "w"))
    print("환율", fx)
    print("끝", got, flush=True)


if __name__ == "__main__":
    main()
