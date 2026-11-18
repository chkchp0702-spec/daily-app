"""11/18 발상의 전환 — 🔢 섹터·종목 「시장보다 나을 확률」(yr5) 다시 평가.
지금 방식: 마지막 66일 한 번 떼어 섞어서 AUC → 0.446~0.474(동전보다 못함). 여기서는
 ① 특성별 날마다 횡단면 순위상관(IC) — 앞/뒤 절반 부호가 같은지
 ② 달마다 다시 맞춰 다음 달을 맞히는 걸어가기 · 「같은 날 안에서」 AUC 평균 (시장 방향 빼고 순위만)
    A 지금 특성 그대로 · B 날마다 순위로 바꾼 특성(시장 공통 m5·m20 뺌) · C 단순 반전(−r5) · D 단순 반전(−r1) · E 모멘텀(r60)"""
import json, os, sys, time
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob_sec as S
from subsec import sub_of

XF = [f for f in S.FEATS if f not in ("m5", "m20")]

def day_auc(df, col, tgt="yr5"):
    out = []
    for d, g in df.groupby("date"):
        g = g.dropna(subset=[col, tgt])
        if len(g) < 30: continue
        a = S.auc(g[tgt].values, g[col].values)
        if a is not None: out.append((d, a))
    return pd.Series(dict(out))

def run_mk(mk, cfg, sec):
    cand = sorted([(s, v) for s, v in sec.items() if S.mine(s, cfg) and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1][2])[:S.N_PER]
    info = {}
    for s, v in cand:
        sb = sub_of(v[0], v[1])
        if sb: info[s] = {"sec": sb[0], "icon": sb[1], "sname": sb[2], "cap": v[2]}
    H = S.download(list(info) + [cfg["ix"]])
    P = S.panel(H, cfg["ix"], info)
    for f in S.FEATS: P[f] = P[f].replace([np.inf, -np.inf], np.nan)
    P = P.dropna(subset=XF + ["m5"])
    # 날마다 순위 특성
    for f in XF: P["k_" + f] = P.groupby("date")[f].rank(pct=True) - 0.5
    dates = np.sort(P["date"].unique()); mid = dates[len(dates) // 2]
    R = {"n_rows": int(len(P)), "days": int(len(dates))}
    # ① IC (스피어만 = 순위 특성과 yr5 의 상관)
    ic = {}
    for f in XF:
        s = P.dropna(subset=["yr5"]).groupby("date").apply(lambda g: g["k_" + f].corr(g["yr5"]) if len(g) > 30 else np.nan).dropna()
        ic[f] = [round(float(s[s.index < mid].mean()), 4), round(float(s[s.index >= mid].mean()), 4), round(float(s.mean() / (s.std() + 1e-9) * np.sqrt(len(s) / 5)), 2)]
    R["IC(앞,뒤,t값≈겹침보정)"] = ic
    # ② 걸어가기 (달마다)
    months = pd.Series(pd.to_datetime(dates)).dt.to_period("M").unique()
    preds = {k: [] for k in ("A", "B")}
    D = P.dropna(subset=["yr5"])
    for m in months[6:]:
        st = m.to_timestamp(); en = (m + 1).to_timestamp()
        trd = [d for d in dates if d < st]
        if len(trd) < 120: continue
        cut = trd[-6]
        tr = D[D["date"] <= cut]; te = P[(P["date"] >= st) & (P["date"] < en)]
        if not len(te): continue
        for k, cols in (("A", S.FEATS), ("B", ["k_" + f for f in XF])):
            X = tr[cols].values; mu, sd = X.mean(0), X.std(0) + 1e-9
            w = S.logistic_fit((X - mu) / sd, tr["yr5"].values)
            q = te[["date", "s", "yr5"]].copy(); q["p"] = S.pred(w, (te[cols].values - mu) / sd); preds[k].append(q)
    W = {}
    for k, L in preds.items():
        if not L: continue
        Q = pd.concat(L); a = day_auc(Q, "p")
        W[k] = [round(float(a[a.index < mid].mean()), 4), round(float(a[a.index >= mid].mean()), 4), round(float(a.mean()), 4), int(len(a))]
    Q0 = D[D["date"] >= pd.Timestamp(months[6].to_timestamp())].copy()
    for k, col, sgn in (("C 반전(−r5)", "r5", -1), ("D 반전(−r1)", "r1", -1), ("E 모멘텀(r60)", "r60", 1), ("F 52주고점(hi52)", "hi52", 1), ("G 반전(−rel20)", "rel20", -1)):
        Q0["p"] = sgn * Q0[col]; a = day_auc(Q0, "p")
        W[k] = [round(float(a[a.index < mid].mean()), 4), round(float(a[a.index >= mid].mean()), 4), round(float(a.mean()), 4), int(len(a))]
    R["걸어가기 같은날AUC(앞,뒤,전체,날수)"] = W
    return R

sec = S.get(S.OPD + "sec.json")
out = {}
for mk, cfg in S.MK.items():
    t0 = time.time()
    try:
        out[mk] = run_mk(mk, cfg, sec); print(mk, f"{time.time()-t0:.0f}s", json.dumps(out[mk], ensure_ascii=False))
    except Exception as e:
        import traceback; traceback.print_exc(); print(mk, "ERR", e)
json.dump(out, open("probe/relx_bt.json", "w"), ensure_ascii=False)
