"""#45 요일 효과(월·금) 검증 — 확률 보강 일지 10/31 11시 (Actions 에서 실행)
⑥ 은 칸 = 모멘텀 부호 × 내일 요일 × (내일 월말월초). 요일 몫이 실제로 맞히는 힘을 더하는지:
  A 지금 ⑥(모멘텀|요일|T)  B 요일 뺌(모멘텀|T)  C 월·금만 따로(모멘텀|월/금/그외|T)  D 요일만(모멘텀 없음)
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
    tom_n = d["tom"].shift(-1); tom_n.iloc[-1] = 0; tom_n = tom_n.astype(int)
    useT = (tom_n == 1).values
    R = {"n_days": len(d)}
    mid = d.index[len(d) // 2]
    for nm, f in (("내일=월요일", dn == 0), ("내일=금요일", dn == 4), ("내일=월요일·모멘텀−", (dn == 0) & (ms == "-")), ("내일=금요일·모멘텀+", (dn == 4) & (ms == "+"))):
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
            row[half] = None if not c_ else {"n": c_["n"], "d1": round((c_["p1"] - b1) * 100, 1), "d5": round(((c_["p5"] or 0) - b5) * 100, 1)}
        R[nm] = row
        print(mk, nm, json.dumps(row, ensure_ascii=False))
    dstr = dn.astype(str)
    mf = dn.map(lambda x: "M" if x == 0 else "F" if x == 4 else "x")
    V = {
        "A 지금⑥(모멘텀|요일)": ms + "|" + dstr,
        "B 요일뺌(모멘텀)": ms.astype(object),
        "C 월·금만(모멘텀|월금)": ms + "|" + mf,
        "D 요일만": dstr.astype(object),
    }
    res = {}
    for ycol, lag in (("y1", 1), ("y5", 5)):
        for vn, kA in V.items():
            kA = kA.astype(object)
            kT = pd.Series(np.where(tom_n == 1, kA + "|T", None), index=d.index, dtype=object)
            p, base = wf2(d, ycol, lag, kA, kT, useT)
            res[f"{ycol} {vn}"] = brier(d, ycol, p, base)
            print(mk, ycol, vn, res[f"{ycol} {vn}"])
    R["brier"] = res
    out[mk] = R
json.dump(out, open("probe/dow_bt.json", "w"), ensure_ascii=False, indent=1)
print("저장 probe/dow_bt.json")
