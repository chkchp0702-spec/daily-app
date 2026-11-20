"""🔑 KRX 파생 이력 받기·이어 쌓기 (11/20 🎲 2-B — 비밀값 KRX_ID·KRX_PW, 값은 출력 안 함)
   archive/x/kr_fut_oi.csv  (date, oi_all, oi_front, vol_front, close_front) — 코스피200 선물(주간) 미결제약정
       KRX 원시 주소 MDCSTAT12501(pykrx 함수는 미결제 열을 버림 → 원시 응답 ACC_OPNINT_QTY 사용)
   archive/x/kr_opt_inv.csv (date, inv, net_val, bid_val, ask_val) — 코스피200 옵션 투자자별 거래(MDCSTAT13101, 시험 중:
       11/20 시험에서 표는 나왔지만 금융투자 행이 0 — 값이 맞는지 다음 회차 확인)
   이어받기: 각 csv 의 마지막 날 다음부터 · 처음엔 2010-01 부터(시간 오래 — 스레드 4개)."""
import datetime as dt, os, sys, csv
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
from pykrx import stock
from pykrx.website.krx.krxio import KrxWebIo


class Raw(KrxWebIo):
    def __init__(self, bld):
        super().__init__(); self._bld = bld

    @property
    def bld(self):
        return self._bld

    def fetch(self, **kw):
        r = self.read(**kw)
        return r if isinstance(r, dict) else r.json()


def num(x):
    try:
        return float(str(x).replace(",", ""))
    except Exception:
        return 0.0


FO, OP = "archive/x/kr_fut_oi.csv", "archive/x/kr_opt_inv.csv"
START = os.environ.get("START", "20100101")


def last(p):
    if not os.path.exists(p):
        return None
    d = pd.read_csv(p)
    return d["date"].max() if len(d) else None


def fut(day):
    j = Raw("dbms/MDC/STAT/standard/MDCSTAT12501").fetch(trdDd=day, prodId="KRDRVFUK2I", mktTpCd="T")
    rows = [r for r in j.get("output", []) if "주간" in r.get("ISU_NM", "") or "야간" not in r.get("ISU_NM", "")]
    if not rows:
        return None
    oi = [num(r.get("ACC_OPNINT_QTY")) for r in rows]
    f = rows[0]
    return dict(date=f"{day[:4]}-{day[4:6]}-{day[6:]}", oi_all=sum(oi), oi_front=oi[0],
                vol_front=num(f.get("ACC_TRDVOL")), close_front=num(f.get("TDD_CLSPRC")))


def opt(day):
    j = Raw("dbms/MDC/STAT/standard/MDCSTAT13101").fetch(trdDd=day, prodId="KRDRVOPK2I", inqTpCd="1")
    out = []
    for r in j.get("output", []):
        out.append(dict(date=f"{day[:4]}-{day[4:6]}-{day[6:]}", inv=r.get("INVST_TP_NM", ""),
                        net_val=num(r.get("NETBID_TRDVAL")), bid_val=num(r.get("ACC_BID_TRDVAL")), ask_val=num(r.get("ACC_ASK_TRDVAL"))))
    return out


def days(a):
    b = dt.date.today().strftime("%Y%m%d")
    o = stock.get_index_ohlcv(a, b, "1001")
    return [d.strftime("%Y%m%d") for d in pd.to_datetime(o.index)]


def run(path, fn, flat, cols):
    lt = last(path)
    a = (pd.Timestamp(lt) + pd.Timedelta(days=1)).strftime("%Y%m%d") if lt else START
    ds = days(a)
    print(path, "받을 날", len(ds), a, flush=True)
    if not ds:
        return
    res, bad = [], 0
    def safe(d):
        try:
            return fn(d)
        except Exception as e:
            return ("ERR", str(e)[:80])
    with ThreadPoolExecutor(4) as ex:
        for r in ex.map(safe, ds):
            if isinstance(r, tuple):
                bad += 1; continue
            if r is None:
                continue
            res.extend(r if flat else [r])
    new = pd.DataFrame(res, columns=cols)
    old = pd.read_csv(path) if os.path.exists(path) else pd.DataFrame(columns=cols)
    df = pd.concat([old, new]).drop_duplicates(cols[:2] if flat else ["date"], keep="last").sort_values(cols[:2] if flat else ["date"])
    df.to_csv(path, index=False)
    print(path, "새", len(new), "실패", bad, "전체", len(df), flush=True)
    if len(new):
        print(new.tail(4 if not flat else 11).to_string()[:1500], flush=True)


if __name__ == "__main__":
    which = sys.argv[1:] or ["fut", "opt"]
    if "fut" in which:
        run(FO, fut, False, ["date", "oi_all", "oi_front", "vol_front", "close_front"])
    if "opt" in which:
        run(OP, opt, True, ["date", "inv", "net_val", "bid_val", "ask_val"])
