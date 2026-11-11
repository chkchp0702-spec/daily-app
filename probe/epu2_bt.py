"""#98b 미국 일별 경제정책 불확실성(EPU 뉴스 지수) 7일 평균 수준·5·20일 변화 꼬리 → 5개 시장 다음 날·5일 — 5일 간격 표본 다시 — 11/11 12시 (Actions)
자료: policyuncertainty.com All_Daily_Policy_Data.csv → 막히면 FRED USEPUINDXD (fredgraph·alfred) 순서로 시험.
공표 시차: 날짜 t 값은 하루 늦게 쓴다(t+1 미국 날짜 값처럼). 칸: 1년 순위 ≥90·≤10.
브라이어(걸어가며, 사전 100): [평소, 칸만, 🌡️VIX÷VIX3M 5칸, 5칸×EPU 꼬리]."""
import json, sys, os, io
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd())
import prob, prob_x

UA = {"User-Agent": "Mozilla/5.0"}
epu = None
for u in ["https://www.policyuncertainty.com/media/All_Daily_Policy_Data.csv",
          "http://www.policyuncertainty.com/media/All_Daily_Policy_Data.csv",
          "https://fred.stlouisfed.org/graph/fredgraph.csv?id=USEPUINDXD",
          "https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=USEPUINDXD"]:
    try:
        r = requests.get(u, headers=UA, timeout=40)
        print("TRY", u, r.status_code, len(r.content))
        if r.status_code != 200 or len(r.content) < 1000: continue
        t = pd.read_csv(io.StringIO(r.text))
        print(t.head(2).to_string(), "\n", t.tail(2).to_string())
        if "day" in t.columns:
            idx = pd.to_datetime(dict(year=t["year"], month=t["month"], day=t["day"]))
            col = [c for c in t.columns if "daily" in c.lower() or "policy" in c.lower()][0]
            epu = pd.Series(pd.to_numeric(t[col], errors="coerce").values, index=idx)
        else:
            epu = pd.Series(pd.to_numeric(t.iloc[:, 1], errors="coerce").values, index=pd.to_datetime(t.iloc[:, 0]))
        epu = epu.dropna().sort_index(); print("SRC", u); break
    except Exception as e:
        print("FAIL", u, repr(e)[:200])
if epu is None: sys.exit("EPU 자료 없음")
print("EPU", epu.index[0].date(), epu.index[-1].date(), len(epu), float(epu.iloc[-1]))

m7 = np.log(epu.rolling(7, min_periods=5).mean())        # 달력 7일 평균(주말 포함)
bd = pd.bdate_range(m7.index[0], m7.index[-1])
m7 = m7.reindex(bd).ffill().shift(1).dropna()            # 하루 늦게
lvl, ch5, ch20 = m7, m7 - m7.shift(5), m7 - m7.shift(20)

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^VIX", "^VIX3M", "^GSPC"})
H = prob.load_hist(syms)
c = lambda s: H[s]["Close"].dropna()
v, v3 = c("^VIX"), c("^VIX3M")
vt = (v / v3.reindex(v.index).ffill()).dropna()
vtb = pd.cut(vt, [0, 0.85, 0.95, 1.0, 1.1, 9], labels=["a", "b", "c", "d", "e"]).astype(object)
RK = {k: prob_x.rank252(s.dropna()) for k, s in (("lvl", lvl), ("ch5", ch5), ("ch20", ch20))}
print("now", {k: round(float(s.dropna().iloc[-1]), 3) for k, s in RK.items()}, "epu7", round(float(np.exp(lvl.iloc[-1])), 1))
print("corr rank lvl vs VIX rank", round(float(pd.concat([RK["lvl"], prob_x.rank252(v)], axis=1).dropna().corr().iloc[0, 1]), 2),
      "ch5 vs VIX 5d", round(float(pd.concat([RK["ch5"], prob_x.rank252(np.log(v) - np.log(v).shift(5))], axis=1).dropna().corr().iloc[0, 1]), 2))



out = {}
CASES = [("KR", "ch5", ">="), ("KR", "lvl", "<="), ("CN", "lvl", "<="), ("JP", "ch20", ">=")]
for mk, nm, op in CASES:
    cfg = prob.MK[mk]
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2008-01-01"].copy()
    rk = prob_x.align(RK[nm], d.index)
    vb = prob_x.align(vtb, d.index)
    ok = rk.notna() & vb.notna() & d["y5"].notna()
    f = ((rk >= 0.9) if op == ">=" else (rk <= 0.1)).fillna(False) & ok
    idx = d.index[ok]; mid = idx[len(idx) // 2]
    first = f & ~f.shift(1, fill_value=False)
    R = {"cur": round(float(rk.dropna().iloc[-1]), 3), "mid": str(mid.date())}
    for half, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid)), ("최근5년", ok & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        b5 = d.loc[msk, "y5"].mean()
        pos = np.arange(len(d))
        sp = []
        for s0 in range(5):
            m2 = msk & (pd.Series(pos % 5 == s0, index=d.index))
            ff = f & m2
            sp.append([int(ff.sum()), round((d.loc[ff, "y5"].mean() - d.loc[m2, "y5"].mean()) * 100, 1)])
        ft = first & msk
        R[half] = {"all": [int((f & msk).sum()), round((d.loc[f & msk, "y5"].mean() - b5) * 100, 1)],
                   "5일간격": sp, "첫날만": [int(ft.sum()), round((d.loc[ft, "y5"].mean() - b5) * 100, 1)],
                   "사건수": int(ft.sum())}
    # 5일 간격 교차 로지스틱(VIX3M 5칸 더미 + 꼬리) 앞→뒤·뒤→앞 브라이어
    X = pd.get_dummies(vb.where(ok)).astype(float); X["T"] = f.astype(float)
    y = d["y5"]
    def fit(Xa, ya, l2=1.0):
        w = np.zeros(Xa.shape[1] + 1); A = np.c_[np.ones(len(Xa)), Xa]
        for _ in range(300):
            p = 1 / (1 + np.exp(-A @ w)); g = A.T @ (p - ya) / len(ya) + l2 * np.r_[0, w[1:]] / len(ya)
            Hm = (A.T * (p * (1 - p))) @ A / len(ya) + l2 * np.eye(len(w)) / len(ya)
            w -= np.linalg.solve(Hm, g)
        return w
    pos = pd.Series(np.arange(len(d)) % 5 == 0, index=d.index)
    cx = {}
    for a, b, nmx in (("앞", "뒤", "앞→뒤"), ("뒤", "앞", "뒤→앞")):
        ma = ok & pos & ((d.index < mid) if a == "앞" else (d.index >= mid)); mb = ok & pos & ((d.index < mid) if b == "앞" else (d.index >= mid))
        res = []
        for cols in (list(X.columns[:-1]), list(X.columns)):
            w = fit(X.loc[ma, cols].values, y[ma].values)
            pb = 1 / (1 + np.exp(-(np.c_[np.ones(mb.sum()), X.loc[mb, cols].values] @ w)))
            res.append(round(float(((pb - y[mb].values) ** 2).mean()), 5))
        res.append(round(float(w[-1]), 3))
        cx[nmx] = res
    R["교차(VIX3M만, +꼬리, 꼬리계수)"] = cx
    out[f"{mk}_{nm}{op}"] = R
    print(mk, nm, op, json.dumps(R, ensure_ascii=False))
json.dump(out, open("probe/epu2_bt.json", "w"), ensure_ascii=False, indent=1)
