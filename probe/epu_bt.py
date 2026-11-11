"""#98 미국 일별 경제정책 불확실성(EPU 뉴스 지수) 7일 평균 수준·5·20일 변화 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 11/11 12시 (Actions)
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


def model(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in lab.dropna().unique():
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def brier(d, ycol, ps, start):
    y = d[ycol]; ok = y.notna() & (d.index >= start)
    for p in ps: ok &= p.notna()
    idx = d.index[ok]; mid = idx[len(idx) // 2]; r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid)), ("최근5년", ok & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for p in ps]
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2008-01-01"].copy()
    al = (lambda s: prob_x.align(s, d.index)) if mk != "US" else (lambda s: s.reindex(d.index).ffill())
    vb = al(vtb)
    R = {}
    for nm, rks in RK.items():
        rk = al(rks)
        ok = rk.notna() & vb.notna()
        idx = d.index[ok]; mid = idx[len(idx) // 2]
        R[nm] = {"cur": round(float(rk.dropna().iloc[-1]), 3), "mid": str(mid.date())}
        for L, f in (("≥90", rk >= 0.9), ("≤10", rk <= 0.1)):
            f = f.fillna(False) & ok
            row = {}
            for half, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid))):
                c_ = prob.cond(d[msk], f[msk], L)
                b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
                row[half] = None if not c_ else [c_["n"], round((c_["p1"] - b1) * 100, 1), round(((c_["p5"] or 0) - b5) * 100, 1)]
            lab = pd.Series(np.where(f, L, None), index=d.index, dtype=object).where(ok)
            labv = vb.where(ok).astype(object)
            labc = (labv + "|" + np.where(f, "T", "-")).where(ok)
            res = {"칸": row}
            for ycol, h in (("y1", 1), ("y5", 5)):
                pA, base = model(d, lab, ycol, h); pV, _ = model(d, labv, ycol, h); pC, _ = model(d, labc, ycol, h)
                res[ycol] = brier(d, ycol, [base, pA, pV, pC], "2010-01-01")
            res["겹침_vterm역전"] = [int((f & vb.isin(["d", "e"])).sum()), int(f.sum())]
            R[nm][L] = res
            print(mk, nm, L, json.dumps(res, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/epu_bt.json", "w"), ensure_ascii=False, indent=1)
