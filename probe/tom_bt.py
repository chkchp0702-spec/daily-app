"""#44 월초 효과 검증 + ⑥ 모멘텀·계절성 칸의 「하루 어긋남」 점검 — 확률 보강 일지 10/31 10시 (Actions 에서 실행)
⑥ 은 행 t 의 요일·월말월초(d.dow, d.tom)로 칸을 고르는데, 맞히려는 것은 y1 = t+1 의 등락.
  지금(cur): 칸 = 오늘(t) 요일 == 내일 요일 · 오늘 tom   → 실제로는 「내일과 같은 요일인 날의 그 다음 날」을 세는 셈
  고침(fix): 칸 = 내일(t+1) 요일 · 내일 tom(월말 마지막 날 + 월초 3일)
걸어가며(앞 자료만) 칸 확률 = (칸 안 오른 수 + 100·기저)/(칸 n + 100) → 브라이어 앞/뒤/최근5년."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob

syms = sorted({c["ix"] for c in prob.MK.values()})
H = prob.load_hist(syms)
PRIOR = 100


def wf_cells(d, ycol, key, lag):
    """key: 행마다 칸 이름(문자열, None=칸 없음 → 기저). 행 t 의 결과는 t+lag 에 알려짐."""
    y = d[ycol]
    known = y.shift(lag)                       # t 시점까지 결과가 알려진 행의 y (lag 일 전 행)
    kkey = key.shift(lag)
    base = known.expanding().mean()
    df = pd.DataFrame({"k": kkey, "y": known})
    df["one"] = df["y"].notna().astype(float)
    df["yy"] = df["y"].fillna(0)
    ks = df.groupby("k", dropna=True)[["yy", "one"]].cumsum()   # kkey 별 누적 (해당 행 포함 = 알려진 것)
    df["cy"] = ks["yy"]; df["cn"] = ks["one"]
    # 행 t 에서 칸 key[t] 의 누적: kkey 가 key[t] 인 마지막 행까지 → 칸별로 ffill
    out = pd.Series(np.nan, index=d.index)
    cy = {}; cn = {}
    kv = kkey.values; yv = df["yy"].values; ov = df["one"].values; keyv = key.values; bv = base.values
    for i in range(len(d)):
        k0 = kv[i]
        if isinstance(k0, str):
            cy[k0] = cy.get(k0, 0.0) + yv[i]; cn[k0] = cn.get(k0, 0.0) + ov[i]
        k1 = keyv[i]
        b = bv[i]
        if isinstance(k1, str) and not np.isnan(b):
            out.iloc[i] = (cy.get(k1, 0.0) + PRIOR * b) / (cn.get(k1, 0.0) + PRIOR)
        else:
            out.iloc[i] = b
    return out, base


def brier(d, ycol, p, base, flag):
    y = d[ycol]; ok = y.notna() & base.notna() & p.notna() & (d.index >= "2006-01-01")
    idx = d.index[ok]; mid = idx[len(idx) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ok & (d.index < mid)), ("뒤", ok & (d.index >= mid)), ("최근5년", ok & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = [round(float(((base[msk] - y[msk]) ** 2).mean()), 5), round(float(((p[msk] - y[msk]) ** 2).mean()), 5), int((msk & flag).sum())]
    return r


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]])
    d = d[d.index >= "2000-01-01"].copy()
    ms = np.sign(d["mom"]).map({1.0: "+", -1.0: "-"}).fillna("0")
    dow_t = d["dow"].astype(int).astype(str)
    # 내일(t+1)의 요일·tom — 이력 마지막 행은 달력으로
    nxt_idx = list(d.index[1:]) + [d.index[-1] + pd.offsets.BDay(1)]
    nxt = pd.DatetimeIndex(nxt_idx)
    dow_n = pd.Series(nxt.dayofweek.astype(str), index=d.index)
    tom_n = d["tom"].shift(-1)
    tom_n.iloc[-1] = float(nxt[-1].day <= 3)
    tom_n = tom_n.astype(int)
    tom_t = d["tom"].astype(int)
    R = {"n_days": len(d), "base1": round(d["y1"].mean() * 100, 1), "base5": round(d["y5"].mean() * 100, 1)}
    # 칸 차이 (고친 정의: 내일이 월말월초)
    mid = d.index[len(d) // 2]
    for nm, f in (("내일=월말월초", tom_n == 1), ("내일=월초 3일만", (tom_n == 1) & (pd.Series(nxt.day, index=d.index) <= 10)),
                  ("오늘=월말월초(지금 ⑥ 정의)", tom_t == 1)):
        row = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
            c_ = prob.cond(d[msk], f[msk], nm)
            b1 = d.loc[msk, "y1"].mean(); b5 = d.loc[msk, "y5"].mean()
            row[half] = None if not c_ else {"n": c_["n"], "d1": round((c_["p1"] - b1) * 100, 1), "d5": round(((c_["p5"] or 0) - b5) * 100, 1)}
        R[nm] = row
        print(mk, nm, json.dumps(row, ensure_ascii=False))
    # 걸어가며 브라이어: 변형별 칸
    var = {
        "cur ⑥(오늘 요일·오늘 tom)": pd.Series(np.where(tom_n == 1, ms + "|" + dow_n + "|T", ms + "|" + dow_n), index=d.index),
        "fix ⑥(내일 요일·내일 tom)": None,
        "tom만(내일)": pd.Series(np.where(tom_n == 1, "T", None), index=d.index, dtype=object),
        "요일만(내일)": dow_n.astype(object),
    }
    # cur: 예측 칸 key 는 「내일 요일·오늘이나 내일 tom」이지만 칸 구성원은 행 t 의 dow·tom → 구성원 key 를 따로
    # 구현: 구성원 key(행 t 가 속한 칸) 와 질의 key(행 t 에서 찾는 칸) 를 나눠야 함 → 두 key 버전
    res = {}
    for ycol, lag in (("y1", 1), ("y5", 5)):
        for vn in var:
            if vn.startswith("cur"):
                q_tom = ((tom_t == 1) | (pd.Series(nxt.day, index=d.index) <= 3))
                qkey = pd.Series(np.where(q_tom, ms + "|" + dow_n + "|T", ms + "|" + dow_n), index=d.index, dtype=object)
                mkey_T = ms + "|" + dow_t + "|T"      # 행 t 가 tom 이면 T 칸에도 속함
                mkey = ms + "|" + dow_t
                # 두 칸(전체·T) 누적을 각각 구해 질의 칸에 맞춰 고름
                p = pd.Series(np.nan, index=d.index)
                y = d[ycol]; known = y.shift(lag); base = known.expanding().mean()
                mA = mkey.shift(lag).values; mT = pd.Series(np.where(tom_t == 1, mkey_T, None), index=d.index).shift(lag).values
                kv = known.values; qv = qkey.values; bv = base.values
                cy = {}; cn = {}
                for i in range(len(d)):
                    if not np.isnan(kv[i]):
                        for k0 in (mA[i], mT[i]):
                            if isinstance(k0, str):
                                cy[k0] = cy.get(k0, 0.0) + kv[i]; cn[k0] = cn.get(k0, 0.0) + 1
                    b = bv[i]
                    p.iloc[i] = b if np.isnan(b) else (cy.get(qv[i], 0.0) + PRIOR * b) / (cn.get(qv[i], 0.0) + PRIOR)
                flag = q_tom
            elif vn.startswith("fix"):
                # 구성원 = 행 t 의 「내일」 속성 (y 가 내일 등락이므로 같은 key)
                kA = ms + "|" + dow_n
                kT = pd.Series(np.where(tom_n == 1, ms + "|" + dow_n + "|T", None), index=d.index, dtype=object)
                p = pd.Series(np.nan, index=d.index)
                y = d[ycol]; known = y.shift(lag); base = known.expanding().mean()
                mA = kA.shift(lag).values; mT = kT.shift(lag).values
                qv = np.where(tom_n == 1, kT.values, kA.values)
                kv = known.values; bv = base.values
                cy = {}; cn = {}
                for i in range(len(d)):
                    if not np.isnan(kv[i]):
                        for k0 in (mA[i], mT[i]):
                            if isinstance(k0, str):
                                cy[k0] = cy.get(k0, 0.0) + kv[i]; cn[k0] = cn.get(k0, 0.0) + 1
                    b = bv[i]
                    p.iloc[i] = b if np.isnan(b) else (cy.get(qv[i], 0.0) + PRIOR * b) / (cn.get(qv[i], 0.0) + PRIOR)
                flag = tom_n == 1
            else:
                p, base = wf_cells(d, ycol, var[vn], lag)
                flag = tom_n == 1 if "tom" in vn else (d.index == d.index)
            res[f"{ycol} {vn}"] = brier(d, ycol, p, base, flag)
            print(mk, ycol, vn, res[f"{ycol} {vn}"])
    R["brier"] = res
    R["now"] = {"last": str(d.index[-1].date()), "next": str(nxt[-1].date()), "next_tom": int(tom_n.iloc[-1]), "mom": ms.iloc[-1]}
    out[mk] = R
json.dump(out, open("probe/tom_bt.json", "w"), ensure_ascii=False, indent=1)
print("저장 probe/tom_bt.json")
