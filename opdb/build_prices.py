"""
전 종목 가격·1년 차트를 묶음으로 받아 p/<xx>.json (256개 파일)로 저장.
  python opdb/build_prices.py --dest <opdata 폴더>
각 종목: [마지막날짜, 종가, 전일종가, 1년최고, 1년최저, 첫날짜, [주간 종가...]]
q/<xx>.json (10/14 🙋 내 포트용): 종목 → [첫날짜, [첫날부터 며칠째...], [일봉 종가...]] 최근 60거래일 — 앱이 「내가 직접 넣은 종목」 날짜별 성적을 계산
"""
import argparse, json, os, sys, time
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
from common import universe, shard  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", required=True)
    ap.add_argument("--batch", type=int, default=200)
    a = ap.parse_args()
    import yfinance as yf
    import pandas as pd

    uni = universe(os.path.join("_src", "Cup"))
    syms = [s for s, _, _ in uni]
    mkt_of = {s: m for s, _, m in uni}
    daily, hl, hlh, px = {}, {}, {}, {}  # px: 🔎 아침 거르기용 일봉(종가·고가·저가·거래량)  # 나침반용: 최근 일봉, 52주 신고가/신저가, 최근 40일 신고가·신저가 기록
    ep = os.path.join(a.dest, "etf_list.json")
    if os.path.exists(ep):                       # ETF 도 같이
        have = set(syms)
        syms += [r[0] for r in json.load(open(ep, encoding="utf-8")) if r[0] not in have]
    print("종목", len(syms), flush=True)
    shards = defaultdict(dict)
    qsh = defaultdict(dict)       # 🙋 내 포트용 최근 60일 일봉 (p 와 따로 둬서 목록 화면 그림(p)은 가볍게)
    qdir = os.path.join(a.dest, "q")
    os.makedirs(qdir, exist_ok=True)
    for f in os.listdir(qdir):
        if f.endswith(".json") and not f.startswith("_"):
            try:
                qsh[f[:-5]] = json.load(open(os.path.join(qdir, f)))
            except Exception:
                pass
    # 기존 값 유지 (이번에 못 받은 종목은 예전 값 그대로)
    pdir = os.path.join(a.dest, "p")
    os.makedirs(pdir, exist_ok=True)
    for f in os.listdir(pdir):
        if f.endswith(".json"):
            shards[f[:-5]] = json.load(open(os.path.join(pdir, f)))
    # 🧭 11/18 사용자 「섹터 자료 지연 당장 해결」 — 야후가 한국 밤~새벽(미국 장 시간, 17~22시 UTC)에는 아시아 종목의 「마지막 마감 봉」을 빼고 주는 날이 있음.
    #   11/17 16:20 작업은 한국 11/17 마감까지 받았는데, 그 뒤 새벽 작업 둘(02:23·06:06)이 11/16 까지만 받아 덮어써서 아침 내내 한국·일본·중국·홍콩 섹터가 하루 전 것이었음.
    #   → 지난 실행이 저장해 둔 일봉(q/)에 「이번에 받은 것보다 뒤 날짜」가 있고, 그 날짜가 「마감 뒤에 받은 것」으로 확인된 날(q/_fin.json)이면 그 봉을 이어 붙여 뒤로 가지 않게 한다.
    #   (장중에 받은 봉은 _fin 에 안 올라가므로 이어 붙이지 않음 — 반쪽 숫자가 마감 값처럼 남지 않게)
    finp = os.path.join(qdir, "_fin.json")
    try:
        FIN = json.load(open(finp))
    except Exception:
        FIN = {}
    def mk_of(s):
        if s in mkt_of:
            return mkt_of[s]
        u = s.upper()
        return "KR" if u.endswith((".KS", ".KQ")) else "JP" if u.endswith(".T") else "CN" if u.endswith((".SS", ".SZ")) else "HK" if u.endswith(".HK") else "US"
    def carry(s, c):
        old = qsh.get(shard(s), {}).get(s)
        fin = FIN.get(mk_of(s))
        if not old or not fin or len(old) < 3:
            return c
        try:
            d0 = pd.Timestamp(old[0]); last = c.index[-1]
            tz = getattr(last, "tz", None)
            add = {}
            for off, v in zip(old[1], old[2]):
                d = d0 + pd.Timedelta(days=int(off))
                if d.strftime("%Y-%m-%d") > last.strftime("%Y-%m-%d") and d.strftime("%Y-%m-%d") <= fin:
                    add[d.tz_localize(tz) if tz is not None else d] = float(v)
            if not add:
                return c
            return pd.concat([c, pd.Series(add, dtype=c.dtype)]).sort_index()
        except Exception:
            return c
    carried = defaultdict(int)
    lastday = defaultdict(lambda: defaultdict(int))   # 시장 → 마지막 봉 날짜 → 종목 수 (이번에 받은 그대로)
    got = 0
    t0 = time.time()
    for i in range(0, len(syms), a.batch):
        part = syms[i:i + a.batch]
        for attempt in range(3):
            try:
                df = yf.download(part, period="1y", interval="1d", group_by="ticker",
                                 auto_adjust=False, threads=True, progress=False)
                break
            except Exception as e:
                print("재시도", e, flush=True)
                time.sleep(20)
        else:
            continue
        for s in part:
            try:
                c = (df[s]["Close"] if isinstance(df.columns, pd.MultiIndex) else df["Close"]).dropna()
            except Exception:
                continue
            if len(c) < 2:
                continue
            lastday[mk_of(s)][c.index[-1].strftime("%Y-%m-%d")] += 1
            n0 = len(c); c = carry(s, c)
            if len(c) > n0:
                carried[mk_of(s)] += 1
            w = c.resample("W-FRI").last().dropna()
            if s in mkt_of:
                daily[s] = c.iloc[-260:]          # 나침반 섹터 히트맵(1주~12개월)까지 쓰려고 1년치
                try:
                    g = df[s] if isinstance(df.columns, pd.MultiIndex) else df
                    px[s] = pd.DataFrame({"c": c, "h": g["High"].reindex(c.index), "l": g["Low"].reindex(c.index),
                                          "v": g["Volume"].reindex(c.index)}).iloc[-260:].astype("float32")
                    px[s]["h"] = px[s]["h"].fillna(px[s]["c"]); px[s]["l"] = px[s]["l"].fillna(px[s]["c"])
                except Exception:
                    pass
                if len(c) > 200:
                    last = float(c.iloc[-1])
                    hl[s] = 1 if last >= float(c.max()) * 0.999 else -1 if last <= float(c.min()) * 1.001 else 0
                    mx, mn = c.rolling(252, min_periods=200).max(), c.rolling(252, min_periods=200).min()
                    f = ((c >= mx * 0.999).astype(int) - (c <= mn * 1.001).astype(int)).iloc[-40:]
                    hlh[s] = f[f != 0]
            shards[shard(s)][s] = [
                c.index[-1].strftime("%Y-%m-%d"), round(float(c.iloc[-1]), 4), round(float(c.iloc[-2]), 4),
                round(float(c.max()), 4), round(float(c.min()), 4), c.index[0].strftime("%Y-%m-%d"),
                [round(float(v), 4) for v in w.values][-53:],
            ]
            try:
                dl = c.iloc[-60:]
                d0 = dl.index[0]
                qsh[shard(s)][s] = [d0.strftime("%Y-%m-%d"), [int((x - d0).days) for x in dl.index], [round(float(v), 4) for v in dl.values]]
            except Exception:
                pass
            got += 1
        print(f"  {min(i + a.batch, len(syms))}/{len(syms)} 받음 {got} ({time.time() - t0:.0f}s)", flush=True)
    for k, v in shards.items():
        json.dump(v, open(os.path.join(pdir, k + ".json"), "w"), separators=(",", ":"))
    for k, v in qsh.items():
        if k == "_fin":
            continue
        json.dump(v, open(os.path.join(qdir, k + ".json"), "w"), separators=(",", ":"))
    # 이번에 받은 마지막 봉이 「마감 뒤」인 시장만 그 날짜를 확정으로 적어 둠(다음 실행의 이어 붙이기 기준)
    try:
        from compass import _live
        for m, cnt in lastday.items():
            d = max(cnt, key=lambda k: cnt[k])            # 그 시장 종목 대부분의 마지막 날짜
            if not _live(m, pd.Timestamp(d)) and d > FIN.get(m, ""):
                FIN[m] = d
        json.dump(FIN, open(finp, "w"))
        print("마감 확정일", FIN, "· 이어 붙인 종목", dict(carried), flush=True)
    except Exception as e:
        print("마감 확정일 기록 실패", e, flush=True)
    # 원화 환율 (1단위 = 몇 원)
    fx = {"KRW": 1.0}
    try:
        f = yf.download(["KRW=X", "CNYKRW=X", "JPYKRW=X", "HKDKRW=X"], period="10d", interval="1d", group_by="ticker", progress=False)
        for tk, cur in (("KRW=X", "USD"), ("CNYKRW=X", "CNY"), ("JPYKRW=X", "JPY"), ("HKDKRW=X", "HKD")):
            c = f[tk]["Close"].dropna()
            if len(c):
                fx[cur] = round(float(c.iloc[-1]), 4)
        fx["date"] = str(c.index[-1].date())
    except Exception as e:
        print("환율 실패", e)
    if len(fx) > 2:
        json.dump(fx, open(os.path.join(pdir, "fx.json"), "w"))
    print("환율", fx)
    print("끝", got, flush=True)
    try:
        from compass import build as compass_build
        compass_build(daily, hl, mkt_of, a.dest, hlh)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("나침반 실패", e, flush=True)
    try:
        from screens import build as screens_build
        screens_build(px, mkt_of, a.dest, fx=fx, whale_src=os.path.join("_src", "whale40"))
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("아침 거르기 실패", e, flush=True)
    try:
        from screens import screen_px
        screen_px(px, a.dest)
    except Exception as e:
        print("거르기 지도 종가 실패", e, flush=True)


if __name__ == "__main__":
    main()
