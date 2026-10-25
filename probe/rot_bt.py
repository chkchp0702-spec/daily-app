"""#13 업종 순환 검증 — 섹터 상대강도(섹터 20·60일 − 시장) 와 그 반전(섹터 5일 − 섹터 20일 상대)이
종목 확률 모델(prob_sec)의 맞히는 힘(AUC)을 앞/뒤 두 기간 모두 높이나 + 섹터 단위 조건부 비율.
python probe/rot_bt.py  (Actions 에서, 야후 필요)"""
import os, sys, json
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import prob_sec as S
from subsec import sub_of

NEW = ["srel20", "srel60", "srev"]

def add(P):
    g = P.groupby(["date", "sec"])
    P["sec20"] = g["r20"].transform("mean"); P["sec60"] = g["r60"].transform("mean")
    P["m60"] = P.groupby("date")["r60"].transform("mean")
    P["srel20"] = P["sec20"] - P["m20"]
    P["srel60"] = P["sec60"] - P["m60"]
    P["srev"] = (P["sec5"] - P["m5"]) - P["srel20"] / 4
    return P

def evalw(D, feats, t, a0, a1, b1):
    tr = D[D["date"] < a0]; te = D[(D["date"] >= a1) & (D["date"] < b1)]
    lo, hi = tr[feats].quantile(0.01), tr[feats].quantile(0.99)
    X = lambda d: d[feats].clip(lo, hi, axis=1)
    mu, sd = X(tr).mean(), X(tr).std() + 1e-9
    w = S.logistic_fit(((X(tr) - mu) / sd).values, tr[t].values)
    p = S.pred(w, ((X(te) - mu) / sd).values)
    y = te[t].values
    return S.auc(y, p), float(np.mean((p - y) ** 2)), len(te)

def main():
    sec = S.get(S.OPD + "sec.json")
    out = {}
    for mk, cfg in S.MK.items():
        try:
            cand = sorted([(s, v) for s, v in sec.items() if S.mine(s, cfg) and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1][2])[:S.N_PER]
            info = {}
            for s, v in cand:
                sb = sub_of(v[0], v[1])
                if sb: info[s] = {"sec": sb[0], "cap": v[2]}
            H = S.download(list(info) + [cfg["ix"]])
            P = add(S.panel(H, cfg["ix"], info))
            F0 = S.FEATS; F1 = S.FEATS + NEW
            for f in F1: P[f] = P[f].replace([np.inf, -np.inf], np.nan)
            P = P.dropna(subset=F1)
            dates = np.sort(P["date"].unique()); n = len(dates)
            qa, qm, qb = dates[int(n * .5)], dates[int(n * .75)], dates[n - 6]
            r = {}
            for t in S.TGTS:
                D = P.dropna(subset=[t])
                gap = lambda d: dates[max(0, list(dates).index(d) - 6)]
                A0 = evalw(D, F0, t, gap(qa), qa, qm); A1 = evalw(D, F1, t, gap(qa), qa, qm)
                B0 = evalw(D, F0, t, gap(qm), qm, qb); B1 = evalw(D, F1, t, gap(qm), qm, qb)
                r[t] = {"앞": [round(A0[0], 4), round(A1[0], 4), round(A0[1], 5), round(A1[1], 5), A0[2]],
                        "뒤": [round(B0[0], 4), round(B1[0], 4), round(B0[1], 5), round(B1[1], 5), B0[2]]}
            # 섹터 단위: 섹터-날짜 표, srel20 상위/하위 20% → 다음 5일 시장보다 나은 비율
            sd_ = P.groupby(["date", "sec"]).agg(srel20=("srel20", "first"), srev=("srev", "first"), yr=("yr5", "mean")).reset_index().dropna()
            sd_["win"] = (sd_["yr"] > 0.5).astype(float)
            half = dates[int(n * .5)]
            sr = {}
            for f in ["srel20", "srev"]:
                q = sd_[f].quantile([.2, .8]).values
                for nm, m in (("상위20%", sd_[f] >= q[1]), ("하위20%", sd_[f] <= q[0])):
                    a = sd_[m & (sd_["date"] < half)]; b = sd_[m & (sd_["date"] >= half)]
                    sr[f + nm] = [len(a), round(a["win"].mean() * 100, 1), len(b), round(b["win"].mean() * 100, 1)]
                sr["평소"] = [round(sd_[sd_["date"] < half]["win"].mean() * 100, 1), round(sd_[sd_["date"] >= half]["win"].mean() * 100, 1)]
            out[mk] = {"rows": len(P), "days": n, "auc": r, "sector": sr}
            print(mk, json.dumps(out[mk], ensure_ascii=False), flush=True)
        except Exception as e:
            print(mk, "실패", repr(e), flush=True)
    print("RESULT", json.dumps(out, ensure_ascii=False))

main()
