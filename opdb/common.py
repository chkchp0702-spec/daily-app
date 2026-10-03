"""원페이지 DB 공통: 종목 목록, 파일 이름, 묶음(샤드) 번호."""
import json, os, re

MARKETS = ["US", "KR", "JP", "CN", "HK"]
# 미국 목록의 워런트·유닛·권리·우선주·채권형은 제외
JUNK = re.compile(r"(Warrant|\bUnits?\b|\bRights?\b|Preferred|Depositary Shares? Representing|%|Notes? due|Subordinated)", re.I)


def fnv(s: str) -> int:
    """FNV-1a 32bit — 앱(자바스크립트)과 똑같이 계산해서 가격 묶음 파일을 찾는다."""
    h = 0x811C9DC5
    for ch in s.encode("utf-8"):
        h ^= ch
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def shard(sym: str) -> str:
    return "%02x" % (fnv(sym) % 256)


def fname(sym: str) -> str:
    return re.sub(r"[^A-Za-z0-9.-]", "_", sym)


def universe(cup_dir: str):
    """컵차트가 매일 쓰는 종목 목록 → [(심볼, 이름, 시장)]"""
    out, seen = [], set()
    for m in MARKETS:
        p = os.path.join(cup_dir, "cache", f"universe_{m}.json")
        if not os.path.exists(p):
            continue
        for row in json.load(open(p, encoding="utf-8")).get("u", []):
            sym, name = row[0], (row[1] if len(row) > 1 else row[0])
            if m == "US" and JUNK.search(name or ""):
                continue
            if sym and sym not in seen:
                seen.add(sym)
                out.append((sym, name, m))
    return out
