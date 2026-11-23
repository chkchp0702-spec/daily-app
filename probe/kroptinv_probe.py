"""🎲 11/23 14시 — KRX 코스피200 옵션 투자자별(MDCSTAT13101) 0 값 원인: 1차 격자에서 isuCd='KR___OPK2I' 이면 값 나옴 → 2차: 하루/기간·콜풋 나누는 인자 찾기(비밀값 출력 안 함)"""
import json
from pykrx.website.krx.krxio import KrxWebIo
class Raw(KrxWebIo):
    def __init__(self, bld): super().__init__(); self._bld = bld
    @property
    def bld(self): return self._bld
    def fetch(self, **kw):
        r = self.read(**kw); return r if isinstance(r, dict) else r.json()
def tab(rows):
    return {r.get("INVST_TP_NM"): round(float(str(r.get("NETBID_TRDVAL", "0")).replace(",", "")) / 1e8, 1) for r in rows}
def go(tag, **kw):
    try:
        rows = Raw("dbms/MDC/STAT/standard/MDCSTAT13101").fetch(inqTpCd="1", prtType="AMT", juya="ALL", **kw).get("output", [])
        t = tab(rows); print(tag, "외국인", t.get("외국인"), "개인", t.get("개인"), "합계", t.get("합계"), "| n", len(rows), flush=True)
        return t
    except Exception as e:
        print("✗", tag, str(e)[:100], flush=True)
I = "KR___OPK2I"
go("하루 11/15 isuCd만", strtDd="20241115", endDd="20241115", isuCd=I)
go("하루 11/14 isuCd만", strtDd="20241114", endDd="20241114", isuCd=I)
go("기간 11/11~15", strtDd="20241111", endDd="20241115", isuCd=I)
go("하루 trdDd만", trdDd="20241115", isuCd=I)
go("isuCd02만", strtDd="20241115", endDd="20241115", isuCd02=I)
for k in ("rghtTpCd", "optTpCd", "cpTpCd", "isuOpt", "rghtTp", "optnTpCd", "callPutTpCd", "rgtTpCd", "rght_tp_cd"):
    for v in ("C", "P", "CALL", "PUT", "1", "2"):
        go(f"{k}={v}", strtDd="20241115", endDd="20241115", isuCd=I, **{k: v})
for c in ("KR___OPK2C", "KR___OPK2P", "KR__COPK2I", "KR__POPK2I", "KR___OPKQI", "KR___FUK2I", "KR___OPMKI", "KR___OPWKI"):
    go("isuCd=" + c, strtDd="20241115", endDd="20241115", isuCd=c)
go("2010-01-04", strtDd="20100104", endDd="20100104", isuCd=I)
go("2026-11-20", strtDd="20261120", endDd="20261120", isuCd=I)
