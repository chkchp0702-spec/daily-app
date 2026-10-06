"""나침반 지수만 새로 받아 compass.json 에 덮어쓰기 (전 종목 가격을 다시 받지 않고 지수 차트만 빠르게)
  python opdb/compass_ix.py --dest opdata
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compass import index_block, LOGX

ap = argparse.ArgumentParser(); ap.add_argument("--dest", required=True); a = ap.parse_args()
p = os.path.join(a.dest, "compass.json")
C = json.load(open(p, encoding="utf-8"))
for k, m in C.get("markets", {}).items():
    ix = index_block(k)
    if ix:
        old = {x["sym"]: x for x in m.get("index", [])}
        got = {x["sym"] for x in ix}
        m["index"] = ix + [x for x in m.get("index", []) if x["sym"] not in got and "ohlc" in x]   # 이번에 못 받은 지수는 예전 것 유지
        print(k, [(x["sym"], len(x.get("ohlc") or [])) for x in ix], "(전:", list(old), ")")
json.dump(C, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
open(os.path.join(a.dest, "ix_log.txt"), "w", encoding="utf-8").write("\n".join(LOGX) + "\n")
