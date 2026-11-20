"""🎲 11/20 14시 2-B 나머지 — 코스피200 선물 미결제·옵션 투자자별이 KRX 계정으로 받아지는지·속도 확인(비밀값 값은 출력 안 함)"""
import os, time, inspect, glob, re, json
import pykrx, pykrx.stock as s
print("KRX_ID 있음" if os.environ.get("KRX_ID") else "KRX_ID 없음", flush=True)
names = [n for n in dir(s) if re.search("fut|opt|deriv", n, re.I)]
print("함수:", names)
for n in names:
    try: print("==", n, inspect.signature(getattr(s, n)))
    except Exception as e: print(n, e)
root = os.path.dirname(pykrx.__file__)
codes = set()
for f in glob.glob(root + "/**/*.py", recursive=True):
    t = open(f, encoding="utf8").read()
    for m in re.finditer(r"(MDCSTAT\d+)", t):
        if "future" in f.lower() or "deriv" in t.lower()[:0] or True: codes.add((os.path.relpath(f, root), m.group(1)))
fut = sorted(c for c in codes if "fut" in c[0].lower() or "opt" in c[0].lower())
print("선물·옵션 bld:", fut)
out = {}
for n in names:
    continue
    f = getattr(s, n)
    for args in (("20241115",), ("20241115", "KRDRVFUK2I"), ("20100104", "KRDRVFUK2I")):
        t0 = time.time()
        try:
            d = f(*args)
            print("✓", n, args, round(time.time()-t0, 2), "s", d.shape, list(d.columns)[:20])
            print(d.head(3).to_string()[:800])
        except Exception as e:
            print("✗", n, args, str(e)[:200])
# 원시 KRX 주소 시험 — pykrx 내부 KrxWebIo
try:
    from pykrx.website.krx.krxio import KrxWebIo
    class Raw(KrxWebIo):
        def __init__(self, bld): super().__init__(); self._bld = bld
        @property
        def bld(self): return self._bld
        def fetch(self, **kw):
            r = self.read(**kw); return r if isinstance(r, dict) else r.json()
    tries = [("dbms/MDC/STAT/standard/MDCSTAT13101", dict(trdDd="20241115", prodId="KRDRVOPK2I", inqTpCd="1")),
             ("dbms/MDC/STAT/standard/MDCSTAT13102", dict(strtDd="20241101", endDd="20241115", prodId="KRDRVOPK2I", inqTpCd="2")),
             ("dbms/MDC/STAT/standard/MDCSTAT12501", dict(trdDd="20241115", prodId="KRDRVFUK2I", mktTpCd="T")),
             ("dbms/MDC/STAT/standard/MDCSTAT12502", dict(strtDd="20241101", endDd="20241115", prodId="KRDRVFUK2I", isuCd="", mktTpCd="T"))]
    for bld, kw in tries:
        try:
            j = Raw(bld).fetch(**kw)
            ks = list(j.keys()); v = j[ks[0]] if ks else None
            print("RAW", bld, ks, (v[:2] if isinstance(v, list) else str(v)[:300]), len(v) if isinstance(v, list) else '')
        except Exception as e:
            print("RAW ✗", bld, str(e)[:200])
except Exception as e:
    print("KrxWebIo 없음", e)
