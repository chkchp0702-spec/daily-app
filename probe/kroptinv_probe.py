"""🎲 11/23 14시 — KRX 코스피200 옵션 투자자별(MDCSTAT13101/13102) 값이 0으로 나오는 원인 찾기: 인자 조합 격자 시험(비밀값 출력 안 함)"""
import os, itertools, json
from pykrx.website.krx.krxio import KrxWebIo
class Raw(KrxWebIo):
    def __init__(self, bld): super().__init__(); self._bld = bld
    @property
    def bld(self): return self._bld
    def fetch(self, **kw):
        r = self.read(**kw); return r if isinstance(r, dict) else r.json()
def nz(rows):
    s = 0
    for r in rows:
        for k, v in r.items():
            if k.endswith(("TRDVAL", "TRDVOL")):
                try: s += abs(float(str(v).replace(",", "")))
                except Exception: pass
    return s
D = "20241115"
prods = ["KRDRVOPK2I", "KR___OPK2I", "KR4201", "OPK2I", "K2I"]
base = []
for bld in ("MDCSTAT13101", "MDCSTAT13102"):
    for p, rg, pt in itertools.product(prods, ["T", "C", "P", ""], ["AMT", "QTY", ""]):
        kw = dict(inqTpCd="1" if bld.endswith("1") else "2", strtDd="20241111", endDd=D, trdDd=D,
                  prodId=p, isuCd=p, isuCd02=p, rghtTpCd=rg, prtType=pt, prtCheck="SU", juya="ALL", mktTpCd="T")
        kw = {k: v for k, v in kw.items() if v != ""}
        base.append((bld, kw))
# 기간 vs 하루만
hit = []
for bld, kw in base:
    try:
        j = Raw("dbms/MDC/STAT/standard/" + bld).fetch(**kw)
        rows = j.get("output") or j.get("OutBlock_1") or []
        s = nz(rows)
        tag = f"{bld} prod={kw.get('prodId')} rg={kw.get('rghtTpCd','-')} pt={kw.get('prtType','-')} n={len(rows)} sum={s:.0f}"
        print(tag, flush=True)
        if s > 0 and len(hit) < 6:
            hit.append(tag); print("  ★", json.dumps(rows[:3], ensure_ascii=False)[:900], flush=True)
    except Exception as e:
        print("✗", bld, kw.get("prodId"), str(e)[:100], flush=True)
print("값 있는 조합:", hit)
# 선물 투자자별도 같은 화면인지(비교용)
for p in ("KRDRVFUK2I", "KR___FUK2I"):
    try:
        j = Raw("dbms/MDC/STAT/standard/MDCSTAT13101").fetch(inqTpCd="1", strtDd=D, endDd=D, trdDd=D, prodId=p, isuCd=p, prtType="AMT", juya="ALL")
        rows = j.get("output", []); print("FUT", p, len(rows), nz(rows), json.dumps(rows[:2], ensure_ascii=False)[:500])
    except Exception as e: print("FUT ✗", p, str(e)[:100])
