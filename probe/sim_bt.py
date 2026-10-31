"""#46 계절(11~4월 vs 5~10월, 「Sell in May / 할로윈」) 검증 — 확률 보강 일지 10/31 12시 (Actions 에서 실행)
칸 = 다음 날(창 시작일)의 달이 11~4월(W)인지 5~10월(S)인지. 다음 날·5일.
  H 반년만  M 달(12칸)  A 지금 ⑥(모멘텀|요일|T)  AH ⑥ + 반년
걸어가며(앞 자료만) 칸 확률 = (칸 오른 수 + 100·기저)/(칸 n + 100) → 브라이어 앞/뒤(가운데)/최근5년, 2006~."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob

syms = sorted({c["ix"] for c in prob.MK.values()})
H = prob.load_hist(syms)
PRIOR = 100


def wf2(d, ycol, lag, kA, kT, useT):
    y = d[ycol]; known = y.shift(lag); base = known.expanding().mean()
    mA = kA.shift(lag).values; mT = kT.shift(lag).values
    qv = np.where(useT, kT.values, kA.values)
    kv = known.values; bv = base.values
    p = np.full(len(d), np.nan); cy = {}; cn = {}
    for i in range(len(d)):
        if not np.isnan(kv[i]):
            for k0 in (mA[i], mT[i]):
                if isinstance(k0, str):
                    cy[k0] = cy.get(k0, 0.0) + kv[i]; cn[k0] = cn.get(k0, 0.0) + 1
        b = bv[i]
        p[i] = b if np.isnan(b) else (cy.get(qv[i], 0.0) + PRIOR * b) / (cn.get(qv[i], 0.0) + PRIOR)
    return pd.Series(p, index=d.index), base


def brier(d, ycol, p, base):
    y = d[ycol]; ok = y.notna() & base.notna() & p.notna() & (d.index >= "2006-01-01")
    idx = d.index[ok]; mid = idx[len(idx) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid)), ("최근5년", ok & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5)]
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2000-01-01"].copy()
    ms = np.sign(d["mom"]).map({1.0: "+", -1.0: "-"}).fillna("0")
    nxt = pd.DatetimeIndex(list(d.index[1:]) + [d.index[-1] + pd.offsets.BDay(1)])
    dn = pd.Series(nxt.dayofweek, index=d.index)
    mo = pd.Series(nxt.month, index=d.index)
    half = mo.map(lambda m: "W" if m in (11, 12, 1, 2, 3, 4) else "S")
    tom_n = d["tom"].shift(-1); tom_n.iloc[-1] = 0; tom_n = tom_n.astype(int)
    useT = (tom_n == 1).values
    noT = np.zeros(len(d), bool)
    R = {"n_days": len(d)}
    mid = d.index[len(d) // 2]
    for nm, f in (("11~4월", half == "W"), ("5~10월", half == "S"), ("11월", mo == 11)):
        row = {}
        for hh, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
            row[hh] = None if not c_ else {"n": c_["n"], "d1": round((c_["p1"] - b1) * 100, 1), "d5": round(((c_["p5"] or 0) - b5) * 100, 1)}
        R[nm] = row
        print(mk, nm, json.dumps(row, ensure_ascii=False))
    V = {
        "H 반년만": (half.astype(object), False),
        "M 달12칸": (mo.astype(str).astype(object), False),
        "A 지금⑥": ((ms + "|" + dn.astype(str)).astype(object), True),
        "AH ⑥+반년": ((ms + "|" + dn.astype(str) + "|" + half).astype(object), True),
        "MH 모멘텀+반년": ((ms + "|" + half).astype(object), False),
    }
    res = {}
    for ycol, lag in (("y1", 1), ("y5", 5)):
        for vn, (kA, t) in V.items():
            kT = pd.Series(np.where(tom_n == 1, kA + "|T", None), index=d.index, dtype=object)
            p, base = wf2(d, ycol, lag, kA, kT, useT if t else noT)
            res[f"{ycol} {vn}"] = brier(d, ycol, p, base)
            print(mk, ycol, vn, res[f"{ycol} {vn}"])
    R["brier"] = res
    out[mk] = R
json.dump(out, open("probe/sim_bt.json", "w"), ensure_ascii=False, indent=1)
print("저장 probe/sim_bt.json")
