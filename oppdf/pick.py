"""
📄 오늘 PDF로 미리 만들 종목 고르기
  1) 신호 종목 (매일): 컵·갭(최근 리포트 카드), 조용한 매집, 단타(최근 5일 알람), 고래 주요 보유, 시황 리포트에 나온 종목
  2) 열어본 종목 (신청): 앱에서 미리 만든 PDF가 없는 종목을 열면 ntfy chkchp-ch-pdfreq 로 신청이 온다
  3) 큰 회사 (돌아가며): 나라별 시가총액 상위 TOP_N — 3일에 한 번씩 돌아가며 새로 만듦
  리포트가 아직 없는 종목(opdata/s/<파일>.html 없음)은 뺀다.

  python oppdf/pick.py --opdata <opdata 체크아웃> --out syms.txt [--mode daily|request]
"""
import argparse, datetime as dt, glob, json, os, re, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARC = os.path.join(ROOT, "archive")
KST = dt.timezone(dt.timedelta(hours=9))
TOP_N = 400
fname = lambda s: re.sub(r"[^A-Za-z0-9.-]", "_", s)


def jl(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def latest(cat, name, n=1):
    fs = sorted(glob.glob(os.path.join(ARC, cat, "20*", name)))
    return [jl(f) for f in fs[-n:]]


def requests_(hours=26):
    out = []
    try:
        with urllib.request.urlopen(f"https://ntfy.sh/chkchp-ch-pdfreq/json?poll=1&since={hours}h", timeout=30) as r:
            for line in r.read().decode("utf-8").splitlines():
                try:
                    m = json.loads(line)
                    if m.get("event") == "message":
                        out += [s.strip() for s in m.get("message", "").split(",") if s.strip()]
                except Exception:
                    pass
    except Exception as e:
        print("신청 읽기 실패", e)
    return out


def main(a):
    idx = jl(os.path.join(a.opdata, "idx.json"), []) or []
    syms = {r[0] for r in idx}
    by6 = {}
    for r in idx:                                   # 한국 6자리 → 005930.KS / .KQ
        m = re.match(r"^(\d{6})\.K[SQ]$", r[0])
        if m:
            by6[m.group(1)] = r[0]

    def norm(c):
        c = str(c or "").strip()
        if c in syms:
            return c
        if re.match(r"^\d{6}$", c):
            return by6.get(c)
        return None

    built = lambda s: os.path.exists(os.path.join(a.opdata, "s", fname(s) + ".html"))
    want = []

    def add(c, why):
        s = norm(c)
        if s and built(s) and s not in [w[0] for w in want]:
            want.append((s, why))

    if a.mode in ("daily", "request"):
        for s in requests_(26 if a.mode == "daily" else 3):
            add(s, "신청")
    if a.mode == "daily":
        for d in latest("cup", "cards.json"):
            for c in ((d or {}).get("ath") or []) + ((d or {}).get("top") or []):
                add(c.get("code"), "컵")
        for d in latest("gap", "cards.json"):
            for c in (d or {}).get("top") or []:
                add(c.get("code"), "갭")
        for d in latest("accum", "list.json"):
            for c in (d or [])[:40]:
                add(c.get("code"), "매집")
        for d in latest("danta", "alerts.json", 5):
            for c in d or []:
                add(c.get("code"), "단타")
        mx = jl(os.path.join(ARC, "x", "market_x.json"), {}) or {}
        ch = mx.get("chips") or {}
        for k in sorted(ch)[-3:]:
            for c in ch[k]:
                add(c[0], "시황")
        wh = jl(os.path.join(ARC, "x", "whale_x.json"), {}) or {}
        for c in (wh.get("consensus") or wh.get("top") or [])[:40]:
            add(c.get("t") or c.get("code") or c.get("sym") if isinstance(c, dict) else c, "고래")
        # 큰 회사: 나라별 시총 상위 TOP_N 중 오늘 차례(3일에 한 번)
        sec = jl(os.path.join(a.opdata, "sec.json"), {}) or {}
        mk = lambda s: ("KR" if s.endswith((".KS", ".KQ")) else "JP" if s.endswith(".T") else "HK" if s.endswith(".HK")
                        else "CN" if s.endswith((".SS", ".SZ")) else "US" if "." not in s else None)
        groups = {}
        for s, v in sec.items():
            if isinstance(v, list) and len(v) > 2 and v[2] and mk(s):
                groups.setdefault(mk(s), []).append((v[2], s))
        turn = dt.datetime.now(KST).toordinal() % 3
        for g, L in groups.items():
            L.sort(reverse=True)
            for i, (_, s) in enumerate(L[:TOP_N]):
                if i % 3 == turn or i < 30:          # 가장 큰 30개는 매일
                    add(s, "큰 회사")
    with open(a.out, "w", encoding="utf-8") as f:
        f.write("\n".join(s for s, _ in want))
    from collections import Counter
    print(len(want), "종목", dict(Counter(w for _, w in want)))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--opdata", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--mode", default="daily", choices=["daily", "request"])
    main(ap.parse_args())
