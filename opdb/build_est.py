"""
애널리스트 추정치만 받기 (매출·EPS 올해/내년, 5년 성장률) → out/e/<심볼>.json
  python opdb/build_est.py --shard 3 --of 20 --out out --dest-d opdata/d
야후 호출 3번/종목. 원본 데이터(d/)에 있는 종목만, 마지막 실적 연도로 연도 이름을 정한다.
"""
import argparse, glob, json, os, signal, sys, time

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
sys.path.insert(0, os.path.dirname(__file__))
from common import fnv, fname  # noqa: E402
from onepager import data as D  # noqa: E402

START = time.time()
BUDGET = 5 * 3600


def _alarm(*_):
    raise TimeoutError()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shard", type=int, required=True)
    ap.add_argument("--of", type=int, required=True)
    ap.add_argument("--out", default="out")
    ap.add_argument("--meta", default="meta.json")
    a = ap.parse_args()
    import yfinance as yf
    meta = json.load(open(a.meta)) if os.path.exists(a.meta) else {}
    lastfy = json.load(open("lastfy.json")) if os.path.exists("lastfy.json") else {}
    syms = [s for s, v in meta.items() if len(v) <= 4 and fnv(s) % a.of == a.shard]
    print(f"shard {a.shard}: {len(syms)}개", flush=True)
    os.makedirs(os.path.join(a.out, "e"), exist_ok=True)
    signal.signal(signal.SIGALRM, _alarm)
    ok = has = 0
    for i, s in enumerate(syms):
        if time.time() - START > BUDGET:
            break
        try:
            signal.alarm(40)
            t = yf.Ticker(s)
            est, ltg = D.fetch_estimates(t, lastfy.get(s))
            cal = D.fetch_calendar(t)
            signal.alarm(0)
            json.dump({"estimates": est, "ltg": ltg, "cal": cal}, open(os.path.join(a.out, "e", fname(s) + ".json"), "w"), ensure_ascii=False)
            ok += 1
            has += 1 if est else 0
        except Exception as e:
            signal.alarm(0)
            if "Too Many" in str(e) or "429" in str(e):
                time.sleep(60)
        if i % 200 == 0:
            print(f"  {i}/{len(syms)} 저장 {ok} 추정치있음 {has} ({time.time() - START:.0f}s)", flush=True)
    print("끝", ok, has)


if __name__ == "__main__":
    main()
