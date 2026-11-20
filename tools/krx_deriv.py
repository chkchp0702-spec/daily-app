"""🔑 KRX 파생 이력 받기·이어 쌓기 (11/20 🎲 2-B — 비밀값 KRX_ID·KRX_PW, 값은 출력 안 함)
   archive/x/kr_fut_oi.csv  (date, oi_all, oi_front, vol_front, close_front) — 코스피200 선물(주간) 미결제약정
       KRX 원시 주소 MDCSTAT12501(pykrx 함수는 미결제 열을 버림 → 원시 응답 ACC_OPNINT_QTY 사용)
   archive/x/kr_opt_inv.csv (date, inv, net_val, bid_val, ask_val) — 코스피200 옵션 투자자별 거래(MDCSTAT13101, 시험 중:
       11/20 시험에서 표는 나왔지만 금융투자 행이 0 — 값이 맞는지 다음 회차 확인)
   이어받기: 각 csv 의 마지막 날 다음부터 · 처음엔 2010-01 부터(11/20 16시: 스레드 4개는 188일 뒤 막혀 → 한 줄씩·쉼·3일 연속 실패면 멈춤, 여러 번에 나눠 받음)."""
import datetime as dt, os, sys, csv, time
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
    try:
        o = stock.get_index_ohlcv(a, b, "1001")
        ds = [d.strftime("%Y%m%d") for d in pd.to_datetime(o.index)]
        if ds:
            return ds
    except Exception:
        pass
    # 지수 달력이 막히면 평일 전체(휴장일은 빈 응답 → 건너뜀)
    return [d.strftime("%Y%m%d") for d in pd.bdate_range(a, b)]


BUDGET = float(os.environ.get("BUDGET_MIN", "100")) * 60   # 한 번 실행 시간 상한(초)
GAP = float(os.environ.get("GAP_S", "0.8"))                  # 요청 사이 쉼(초)


def save(path, res, flat, cols):
    new = pd.DataFrame(res, columns=cols)
    old = pd.read_csv(path) if os.path.exists(path) else pd.DataFrame(columns=cols)
    key = cols[:2] if flat else ["date"]
    df = pd.concat([x for x in (old, new) if len(x)]) if len(old) or len(new) else new
    df = df.drop_duplicates(key, keep="last").sort_values(key)
    df.to_csv(path, index=False)
    return new, df


def run(path, fn, flat, cols, t0):
    """11/20 16시 고침: 스레드 4개로 몰아 받다 188일 뒤 KRX 가 막음(실패 3968) →
       한 줄씩·쉼 GAP 초·실패하면 30·60·120초 쉬고 다시 · 3일 연속 실패나 시간 상한이면 멈추고 저장
       (빈 날 없이 이어받기 — 마지막 성공일 다음부터)."""
    lt = last(path)
    a = (pd.Timestamp(lt) + pd.Timedelta(days=1)).strftime("%Y%m%d") if lt else START
    ds = days(a)
    print(path, "받을 날", len(ds), a, flush=True)
    res, streak, got, stop = [], 0, 0, ""
    for i, d in enumerate(ds):
        if time.time() - t0 > BUDGET:
            stop = "시간 상한"; break
        r, ok = None, False
        for w in (0, 30, 60, 120):
            if w:
                time.sleep(w)
            try:
                r = fn(d); ok = True; break
            except Exception as e:
                err = str(e)[:80]
        if not ok:
            streak += 1
            print("실패", d, err, flush=True)
            if streak >= 3:
                stop = "3일 연속 실패(" + d + ")"; break
            continue
        streak = 0
        if r:
            res.extend(r if flat else [r]); got += 1
        if got and got % 100 == 0:
            save(path, res, flat, cols); print("중간 저장", d, got, flush=True)
        time.sleep(GAP)
    new, df = save(path, res, flat, cols) if res else (pd.DataFrame(), pd.read_csv(path) if os.path.exists(path) else pd.DataFrame())
    print(path, "새 날", got, "전체", len(df), "멈춤:", stop or "끝까지", flush=True)
    if len(new):
        print(new.tail(4 if not flat else 11).to_string()[:1500], flush=True)
    return not stop


if __name__ == "__main__":
    which = sys.argv[1:] or ["fut", "opt"]
    t0, done = time.time(), True
    if "fut" in which:
        done = run(FO, fut, False, ["date", "oi_all", "oi_front", "vol_front", "close_front"], t0)
    # 옵션 투자자별은 값 확인 전 — 선물 미결제 이력을 다 받은 뒤에만(요청 아끼기)
    if "opt" in which and done:
        run(OP, opt, True, ["date", "inv", "net_val", "bid_val", "ask_val"], t0)
