"""#112 MSCI 분기 리밸런싱 날(2·5·8·11월 마지막 거래일 종가) 앞뒤 → 5개 시장 다음 날·5일 — 확률 보강 11/16 14시 (Actions)
r = 그달 마지막 거래일(MSCI 반영일, 각 시장 자기 달력) 기준 상대 위치. 행 t 의 y1 = t+1 등락이므로 「내일=반영일」은 r=-1 행.
반영일은 이미 ⑥ 의 「월말월초」 칸 안에 들어 있으므로, 질문은 「2·5·8·11월 월말이 다른 달 월말과 다른가」.
비교: 평소 · 월말월초만(T) · 월말월초 + MSCI 칸 따로(M) — 걸어가며 브라이어(사전 100) 앞/뒤·최근5년. 반기(5·11월)·분기(2·8월) 따로."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob
from night_bt_lib import wf, score, one

OUT = {}
for mk in ["KR", "JP", "CN", "HK", "US"]:
    cfg = prob.MK[mk]
    H = prob.load_hist([cfg["ix"]])
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2000-01-01"].copy(); d = d[d["c"].notna()]
    idx = d.index; loc = {t: i for i, t in enumerate(idx)}
    ym = pd.Series(idx.year * 100 + idx.month, index=idx)
    last = ym.groupby(ym).apply(lambda s: s.index.max())
    pos = pd.Series(np.nan, index=idx); kind = pd.Series("", index=idx, dtype=object)
    for k, t in last.items():
        m = k % 100
        if m not in (2, 5, 8, 11): continue
        if t == idx[-1]: continue
        i = loc[t]
        for r in range(-5, 4):
            if 0 <= i + r < len(idx): pos.iloc[i + r] = r; kind.iloc[i + r] = "반기" if m in (5, 11) else "분기"
    # 내일 월말월초 (⑥ 고친 정의)
    tom_n = d["tom"].shift(-1).fillna(0).astype(int)
    base1, base5 = d["y1"].mean(), d["y5"].mean()
    def cell(msk):
        h = d[msk & d["y1"].notna()]; h5 = d[msk & d["y5"].notna()]
        if len(h) < 3: return None
        return [len(h), round(h["y1"].mean() * 100, 1), round(h["f1"].mean() * 100, 2) if "f1" in h else None, round(h5["y5"].mean() * 100, 1) if len(h5) else None]
    mid = "2013-06-01"
    R = {"n": len(d), "평소(다음날%,5일%)": [round(base1 * 100, 1), round(base5 * 100, 1)], "칸 [n, 다음날오름%, 다음날평균%, 5일오름%]": {}}
    for r in range(-5, 4):
        m = pos == r
        R["칸 [n, 다음날오름%, 다음날평균%, 5일오름%]"][f"r{r:+d}(내일=r{r+1:+d})"] = {"전체": cell(m), "앞": cell(m & (idx < mid)), "뒤": cell(m & (idx >= mid)),
                                                                          "반기": cell(m & (kind == "반기")), "분기": cell(m & (kind == "분기"))}
    oth = (tom_n == 1) & pos.isna()
    R["다른 달 월말월초(내일)"] = {"전체": cell(oth), "앞": cell(oth & (idx < mid)), "뒤": cell(oth & (idx >= mid))}
    # 걸어가기: T(내일 월말월초) 위에 M(내일=반영일 r-1) · A(내일=반영 다음 날 r0) · 5일창(r-5)
    labT = pd.Series(np.where(tom_n == 1, "T", "-"), index=idx, dtype=object)
    def lab2(extra, nm):
        return pd.Series(np.where(extra, nm, labT.values), index=idx, dtype=object)
    st = str(idx[300].date())
    pT, base = wf(d, labT, "y1", 1)
    P1 = {"평소": base, "T만": pT,
          "T+내일반영일": wf(d, lab2(pos == -1, "M"), "y1", 1)[0],
          "T+반영다음날": wf(d, lab2(pos == 0, "A"), "y1", 1)[0],
          "T+둘다": wf(d, pd.Series(np.where(pos == -1, "M", np.where(pos == 0, "A", labT.values)), index=idx, dtype=object), "y1", 1)[0],
          "T+반기반영일만": wf(d, lab2((pos == -1) & (kind == "반기"), "M"), "y1", 1)[0]}
    R["걸어가기 다음날"] = score(d, "y1", P1, start=st)
    msk = (pos == -1) | (pos == 0)
    R["걸어가기 다음날(사건날만)"] = score(d[msk], "y1", {k: v[msk] for k, v in P1.items()}, start=st)
    p5T, b5 = wf(d, one(d["c"], pos == -5, "x").where(pos == -5, "-").fillna("-"), "y5", 5)
    P5 = {"평소": b5, "r-5(5일 안 반영일)": p5T, "r-1..r0 5일": wf(d, one(d["c"], pos.between(-1, 0), "x").fillna("-"), "y5", 5)[0]}
    R["걸어가기 5일"] = score(d, "y5", P5, start=st)
    OUT[mk] = R
    print(mk, json.dumps({k: R[k] for k in ("평소(다음날%,5일%)", "걸어가기 다음날")}, ensure_ascii=False))
json.dump(OUT, open("probe/msci112_bt.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(OUT, ensure_ascii=False, indent=1))
