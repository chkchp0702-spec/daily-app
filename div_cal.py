"""
💰 배당비교 자료 — 종목·ETF마다 최근 3년 배당 기록(배당락일, 1주당 금액) → archive/x/dv/<샤드>.json
  (11/10 사용자: 「포트·성적표 옆 배당비교 — 비슷한 상품 배당 비교 · 백만원 기준 · 언제 주는지」 · 돈·AI 안 씀)

  python div_cal.py --list  --opdata opdata --out syms.json          → 배당 있는 종목·ETF 목록
  python div_cal.py --fetch --syms syms.json --shard 3 --of 8 --out part   → part/dv_3.json (야후 1번/종목)
  python div_cal.py --merge --parts parts --dest archive/x/dv              → 256개 샤드(앱 opShard 와 같은 번호)에 합치기

앱(divc.js)이 기록으로 주기(월·분기·반기·연)·배당 달·다음 배당 예상·최근 1년 배당률을 계산함.
이번에 못 받은 종목은 지난 기록을 그대로 둠(지우지 않음).
"""
import argparse, datetime as dt, glob, json, os, signal, sys, time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "opdb"))
from common import fnv, shard  # noqa: E402

START = time.time()
BUDGET = 70 * 60
YEARS = 3.2


def _alarm(*_):
    raise TimeoutError()


def do_list(a):
    out = []
    for f in glob.glob(os.path.join(a.opdata, "d", "*.json")):            # 주식
        try:
            r = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        y = r.get("dividend_yield")
        sym = (r.get("ticker") or {}).get("symbol") if isinstance(r.get("ticker"), dict) else None
        sym = sym or os.path.basename(f)[:-5]
        if y and y > 0:
            out.append(sym)
    for f in glob.glob(os.path.join(a.opdata, "x", "*.json")):            # ETF — 배당률이 비어 있어도 한국 ETF는 넣음(분배 자료가 빠진 경우가 많음)
        try:
            r = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        sym = r.get("sym") or os.path.basename(f)[:-5]
        y = r.get("div_yield")
        if (y and y > 0) or (y is None and r.get("mkt") == "KR"):
            out.append(sym)
    out = sorted(set(out))
    json.dump(out, open(a.out, "w"), separators=(",", ":"))
    print("배당 후보", len(out))


def do_fetch(a):
    import yfinance as yf
    syms = [s for s in json.load(open(a.syms)) if fnv(s) % a.of == a.shard]
    print(f"shard {a.shard}: {len(syms)}개", flush=True)
    cut = dt.datetime.utcnow() - dt.timedelta(days=int(365 * YEARS))
    res, ok, none_ = {}, 0, 0
    signal.signal(signal.SIGALRM, _alarm)
    for i, s in enumerate(syms):
        if time.time() - START > BUDGET:
            print("시간 다 씀", i, flush=True)
            break
        try:
            signal.alarm(25)
            ser = yf.Ticker(s).dividends
            signal.alarm(0)
        except Exception:
            signal.alarm(0)
            continue
        h = []
        try:
            for ts, v in ser.items():
                d = ts.to_pydatetime().replace(tzinfo=None)
                if d >= cut and v == v and v > 0:
                    h.append([d.strftime("%Y-%m-%d"), float("%.6g" % float(v))])
        except Exception:
            continue
        res[s] = {"h": h}          # 빈 기록도 남김 = 「최근 3년 배당 없음」
        if h:
            ok += 1
        else:
            none_ += 1
        if i % 200 == 0:
            print(i, s, len(h), flush=True)
    os.makedirs(a.out, exist_ok=True)
    json.dump(res, open(os.path.join(a.out, f"dv_{a.shard}.json"), "w"), separators=(",", ":"))
    print(f"받음 {ok} · 기록 없음 {none_} · 전체 {len(syms)}")


def do_merge(a):
    new = {}
    for f in glob.glob(os.path.join(a.parts, "**", "dv_*.json"), recursive=True):
        new.update(json.load(open(f)))
    os.makedirs(a.dest, exist_ok=True)
    groups = {}
    for s, v in new.items():
        groups.setdefault(shard(s), {})[s] = v
    today = (dt.datetime.utcnow() + dt.timedelta(hours=9)).strftime("%Y-%m-%d")
    total = 0
    for i in range(256):
        k = "%02x" % i
        p = os.path.join(a.dest, k + ".json")
        old = {}
        if os.path.exists(p):
            try:
                old = json.load(open(p))
            except Exception:
                old = {}
        g = groups.get(k, {})
        for s, v in g.items():
            if not v.get("h") and (old.get(s) or {}).get("h"):   # 이번엔 비었는데 예전엔 있었으면 — 야후 일시 오류일 수 있어 예전 것 유지
                continue
            v["u"] = today
            old[s] = v
        total += len(old)
        json.dump(old, open(p, "w"), separators=(",", ":"), sort_keys=True)
    json.dump({"date": today, "n": total, "got": len(new)}, open(os.path.join(a.dest, "meta.json"), "w"))
    print("합침", len(new), "→ 전체", total)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--fetch", action="store_true")
    ap.add_argument("--merge", action="store_true")
    ap.add_argument("--opdata", default="opdata")
    ap.add_argument("--syms", default="syms.json")
    ap.add_argument("--shard", type=int, default=0)
    ap.add_argument("--of", type=int, default=8)
    ap.add_argument("--out", default="part")
    ap.add_argument("--parts", default="parts")
    ap.add_argument("--dest", default="archive/x/dv")
    a = ap.parse_args()
    if a.list:
        if a.out == "part":
            a.out = "syms.json"
        do_list(a)
    elif a.fetch:
        do_fetch(a)
    elif a.merge:
        do_merge(a)


if __name__ == "__main__":
    main()
