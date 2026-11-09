"""#87 한국 연말 배당락(폐장일 하루 전) 앞뒤 → 코스피 다음 날·5일 — 확률 보강 11/9 11시 (Actions)
폐장일(LTD) = 그해 12월 마지막 거래일 · 배당락일(EX) = LTD 하루 전(결산일 12/31, T+2).
상대 위치 r(LTD 기준 −6~+3)의 「다음 날 오름」·5일 오름 비율 vs 평소 · 해마다 1번이라 n 작음 → 2000~ 전체·앞/뒤(2013 기준)·
2023~(배당 절차 개편 뒤) 따로 · 걸어가며 브라이어(사전 100) 칸 곱하기."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob
from night_bt_lib import wf, score, one

cfg = prob.MK["KR"]
H = prob.load_hist([cfg["ix"]])
d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2000-01-01"].copy()
d = d[d["c"].notna()]
idx = d.index
yr = pd.Series(idx.year, index=idx)
ltd = {y: idx[(idx.year == y) & (idx.month == 12)].max() for y in sorted(set(idx.year)) if ((idx.year == y) & (idx.month == 12)).any()}
pos = pd.Series(np.nan, index=idx)
loc = {t: i for i, t in enumerate(idx)}
for y, t in ltd.items():
    if t.day < 26: continue          # 12월 자료가 끝까지 없는 해(올해) 뺌
    i = loc[t]
    for r in range(-6, 4):
        if 0 <= i + r < len(idx): pos.iloc[i + r] = r
res = {"n": len(d), "last": str(idx[-1].date()), "폐장일": {str(y): str(t.date()) for y, t in ltd.items()}}
base1 = d["y1"].mean(); base5 = d["y5"].mean()
def cell(msk):
    h = d[msk & d["y1"].notna()]; h5 = d[msk & d["y5"].notna()]
    if len(h) < 3: return None
    return [len(h), round(h["y1"].mean() * 100, 1), round(h["f1"].mean() * 100, 2), round(h5["y5"].mean() * 100, 1) if len(h5) else None]
T = {}
for r in range(-6, 4):
    m = pos == r
    T[f"r{r:+d}(내일=r{r+1:+d})"] = {"전체": cell(m), "앞~2012": cell(m & (idx < "2013-01-01")), "뒤2013~": cell(m & (idx >= "2013-01-01")),
                                   "2023~": cell(m & (idx >= "2023-01-01"))}
res["평소(다음날%,5일%)"] = [round(base1 * 100, 1), round(base5 * 100, 1)]
res["칸 [n, 다음날오름%, 다음날평균등락%, 5일오름%]"] = T
# 창: 「내일이 배당락일」(r=-2) · 「배당락~새해 첫날」 r -2..0 · 12월 마지막 주 r -6..-2
wins = {"내일=배당락(r-2)": pos == -2, "배당락 당일→폐장일(r-1)": pos == -1, "폐장일→새해첫날(r0)": pos == 0, "연말창 r-6~-3": pos.between(-6, -3)}
for nm, m in wins.items():
    res.setdefault("창", {})[nm] = {"전체": cell(m), "앞": cell(m & (idx < "2013-01-01")), "뒤": cell(m & (idx >= "2013-01-01"))}
st = str(idx[300].date())
P1 = {"평소": wf(d, one(d["c"], pos == -2, "x"), "y1", 1)[1]}
for nm, m in wins.items():
    P1[nm] = wf(d, one(d["c"], m, "x"), "y1", 1)[0]
res["걸어가기 다음날"] = score(d, "y1", P1, start=st)
P5 = {"평소": wf(d, one(d["c"], pos == -2, "x"), "y5", 5)[1], "r-2 5일": wf(d, one(d["c"], pos == -2, "x"), "y5", 5)[0],
      "r-6~-3 5일": wf(d, one(d["c"], pos.between(-6, -3), "x"), "y5", 5)[0]}
res["걸어가기 5일"] = score(d, "y5", P5, start=st)
print(json.dumps(res, ensure_ascii=False, indent=1))
