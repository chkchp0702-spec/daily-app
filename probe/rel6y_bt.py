"""11/19 🔢 상대 확률 — 단순 규칙을 긴 이력(6년)으로 다시 재기.
11/18 relx_bt 는 2년 자료라 날 136~250일뿐 → 단순 규칙(맞출 것 없음)을 6년 일봉으로, 5일 간격(겹침 없음) 같은 날 AUC(yr5 = 다음 5일 시장보다 나음).
앞(2020-11~2023-10) / 뒤(2023-11~) / 최근 2년. 주의: 종목은 지금 시가총액 상위 250 → 과거 승자 쏠림(생존 편향)이 모멘텀·52주 고점에 유리하게 작용 → 뒤 기간을 더 믿음.
규칙: F 52주 고점 근접(hi52) · E 60일 모멘텀 · M 12−1개월 모멘텀 · S 업종 60일 모멘텀 · L 낮은 변동성(−20일 변동성) · C 반전(−r5) · G 반전(−rel20)"""
import json, os, sys, time
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob_sec as S
from subsec import sub_of

def dl(syms, period="6y"):
    import yfinance as yf
    out = {}
    for i in range(0, len(syms), 200):
        part = syms[i:i + 200]
        try:
            df = yf.download(part, period=period, interval="1d", group_by="ticker", auto_adjust=True, progress=False, threads=True)
        except Exception as e:
            print("받기 실패", e); continue
        for s in part:
            try:
                sub = df[s][["Close"]].dropna()
                sub.index = pd.to_datetime(sub.index).tz_localize(None)
                if len(sub) > 300: out[s] = sub[~sub.index.duplicated(keep="last")]
            except Exception:
                pass
    return out

def run_mk(mk, cfg, sec):
    cand = sorted([(s, v) for s, v in sec.items() if S.mine(s, cfg) and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1][2])[:S.N_PER]
    info = {}
    for s, v in cand:
        sb = sub_of(v[0], v[1])
        if sb: info[s] = sb[0]
    H = dl(list(info) + [cfg["ix"]])
    m = H[cfg["ix"]]["Close"]; mf5 = m.shift(-5) / m - 1
    rows = []
    for s, px in H.items():
        if s == cfg["ix"] or s not in info: continue
        c = px["Close"]; d = pd.DataFrame(index=c.index); d["s"] = s; d["sec"] = info[s]
        d["r5"] = c.pct_change(5); d["r20"] = c.pct_change(20); d["r60"] = c.pct_change(60)
        d["hi52"] = c / c.rolling(250, min_periods=200).max() - 1
        d["mom121"] = c.shift(21) / c.shift(252) - 1
        d["vol20"] = c.pct_change().rolling(20).std()
        d["rel20"] = d["r20"] - (m.pct_change(20)).reindex(c.index)
        f5 = c.shift(-5) / c - 1; mm = mf5.reindex(c.index)
        d["yr5"] = (f5 > mm).astype(float).where(f5.notna() & mm.notna())
        rows.append(d)
    P = pd.concat(rows); P.index.name = "date"; P = P.reset_index()
    P["sec60"] = P.groupby(["date", "sec"])["r60"].transform("mean")
    dates = np.sort(P["date"].unique()); dates = dates[260:]          # 52주 계산 뒤부터
    samp = set(dates[::5])
    Q = P[P["date"].isin(samp)].dropna(subset=["yr5"])
    cut = pd.Timestamp("2023-11-01"); rc = pd.Timestamp(dates[-1]) - pd.Timedelta(days=730)
    R = {"종목": len(info), "받음": len(H) - 1, "날": len(samp), "처음": str(pd.Timestamp(dates[0]).date())}
    for k, col, sg in (("F 52주고점", "hi52", 1), ("E 60일", "r60", 1), ("M 12-1개월", "mom121", 1), ("S 업종60일", "sec60", 1),
                       ("L 낮은변동성", "vol20", -1), ("C 반전-r5", "r5", -1), ("G 반전-rel20", "rel20", -1)):
        a = []
        for d, g in Q.groupby("date"):
            g = g.dropna(subset=[col])
            if len(g) < 30 or g[col].nunique() < 5: continue
            v = S.auc(g["yr5"].values, sg * g[col].values)
            if v is not None: a.append((pd.Timestamp(d), v))
        a = pd.Series(dict(a))
        if not len(a): continue
        f, b, r = a[a.index < cut], a[a.index >= cut], a[a.index >= rc]
        t = lambda x: round(float((x.mean() - 0.5) / (x.std() + 1e-9) * np.sqrt(len(x))), 1)
        R[k] = {"앞": round(float(f.mean()), 4), "뒤": round(float(b.mean()), 4), "최근2년": round(float(r.mean()), 4),
                "n앞": len(f), "n뒤": len(b), "t뒤": t(b), "t앞": t(f)}
    return R

sec = S.get(S.OPD + "sec.json")
out = {}
for mk, cfg in S.MK.items():
    t0 = time.time()
    try:
        out[mk] = run_mk(mk, cfg, sec); print("RES", mk, f"{time.time()-t0:.0f}s", json.dumps(out[mk], ensure_ascii=False), flush=True)
    except Exception as e:
        import traceback; traceback.print_exc(); print(mk, "ERR", e)
json.dump(out, open("probe/rel6y_bt.json", "w"), ensure_ascii=False)
