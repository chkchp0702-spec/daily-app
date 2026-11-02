"""#47 미국 11월만(달 칸) 5일 다시 — 확률 보강 일지 11/2 09시 (Actions 에서 실행)
#46 에서 12칸 중 골라낸 칸이라 다중 검정 주의: 5일 간격(겹치지 않는) 표본 시작점 5개 · 해마다 11월 − 그해 평소 · 12달 모두 같은 기준으로 몇 개가 통과하나 · ⑥ 위 걸어가기
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
    tom_n = d["tom"].shift(-1); tom_n.iloc[-1] = 0; tom_n = tom_n.astype(int)
    useT = (tom_n == 1).values
    mid = d.index[len(d) // 2]
    y5 = d["y5"]; ok = y5.notna()
    R = {"n_days": len(d), "mid": str(mid.date())}
    # 1) 5일 간격 표본: 달마다 (그달 − 그 표본 나머지) 앞/뒤, 시작점 5개
    pos = np.arange(len(d))
    mon = {}
    for m in range(1, 13):
        rows = []
        for o in range(5):
            s = ok & (pos % 5 == o)
            r = []
            for msk in (d.index < mid, d.index >= mid):
                a = s & msk & (mo == m); b = s & msk & (mo != m)
                r.append([int(a.sum()), round((y5[a].mean() - y5[b].mean()) * 100, 1)])
            rows.append(r)
        fr = np.mean([x[0][1] for x in rows]); bk = np.mean([x[1][1] for x in rows])
        same = sum(1 for x in rows if np.sign(x[0][1]) == np.sign(x[1][1]) and min(abs(x[0][1]), abs(x[1][1])) >= 2)
        mon[m] = {"앞": round(fr, 1), "뒤": round(bk, 1), "n앞": rows[0][0][0], "n뒤": rows[0][1][0], "시작점통과": same, "시작점별": rows}
    R["5일간격"] = mon
    passm = [m for m, v in mon.items() if np.sign(v["앞"]) == np.sign(v["뒤"]) and min(abs(v["앞"]), abs(v["뒤"])) >= 2]
    R["통과달"] = [int(x) for x in passm]
    print(mk, "5일간격 달별(앞,뒤,시작점통과):", {m: (v["앞"], v["뒤"], v["시작점통과"]) for m, v in mon.items()})
    print(mk, "통과한 달:", passm)
    # 2) 해마다 11월 5일 오름 비율 − 그해 평소
    yr = pd.Series(d.index.year, index=d.index)
    per = {}
    for Y in sorted(set(yr)):
        a = ok & (yr == Y) & (mo == 11); b = ok & (yr == Y) & (mo != 11)
        if a.sum() >= 10 and b.sum() >= 50:
            per[int(Y)] = round((y5[a].mean() - y5[b].mean()) * 100, 1)
    ys = sorted(per); h = len(ys) // 2
    R["해마다11월"] = per
    R["해마다_양수"] = {"앞": [sum(per[y] > 0 for y in ys[:h]), h], "뒤": [sum(per[y] > 0 for y in ys[h:]), len(ys) - h]}
    print(mk, "해마다 11월−평소:", per, R["해마다_양수"])
    # 3) 걸어가기: ⑥ vs ⑥+11월 · 11월 표시만 · 5일 간격 날만 채점도
    V = {
        "A 지금⑥": (ms + "|" + dn.astype(str)).astype(object),
        "AN ⑥+11월": (ms + "|" + dn.astype(str) + "|" + np.where(mo == 11, "N", "o")).astype(object),
        "N 11월만": pd.Series(np.where(mo == 11, "N", "o"), index=d.index, dtype=object),
    }
    res = {}
    for ycol, lag in (("y1", 1), ("y5", 5)):
        for vn, kA in V.items():
            kT = pd.Series(np.where(tom_n == 1, kA + "|T", None), index=d.index, dtype=object)
            p, base = wf2(d, ycol, lag, kA, kT, useT if vn != "N 11월만" else np.zeros(len(d), bool))
            res[f"{ycol} {vn}"] = brier(d, ycol, p, base)
            if ycol == "y5":
                dd = d[pos % 5 == 0]
                res[f"y5간격 {vn}"] = brier(dd, ycol, p[pos % 5 == 0], base[pos % 5 == 0])
    for k, v in res.items():
        print(mk, k, v)
    R["brier"] = res
    out[mk] = R
json.dump(out, open("probe/nov_bt.json", "w"), ensure_ascii=False, indent=1, default=float)
print("저장 probe/nov_bt.json")
