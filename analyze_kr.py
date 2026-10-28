"""한국 고래(외국인·기관) 수급 신호 과거 검증.
입력: out/kr_flow.csv.gz (다음 금융 investor/days, 종목별 일별 외국인·기관 순매수 수량·외국인 보유율·종가)
규칙(미리보기 없이): t일 마감까지의 수급으로 순위 → t+1일 종가에 사서 H일 보유 → 같은 날 유니버스 평균(아무 종목) 대비 초과수익.
앞 기간(~2023-12) / 뒤 기간(2024-01~)으로 나눠, 둘 다 같은 방향이어야 「쓸 만함」."""
import sys, json, gzip
import numpy as np, pandas as pd

SRC = sys.argv[1] if len(sys.argv) > 1 else "out/kr_flow.csv.gz"
UNI = sys.argv[2] if len(sys.argv) > 2 else "out/kr_universe.json"
COST = 0.0045            # 왕복 비용(수수료+세금+미끄러짐)
SPLIT = "2024-01-01"

d = pd.read_csv(SRC, dtype={"code": str}, parse_dates=["date"]).drop_duplicates(["code", "date"])
uni = {c: (n, m) for c, n, m in json.load(open(UNI))}
d = d.sort_values(["code", "date"])
px = d.pivot(index="date", columns="code", values="close").sort_index()
def P(col): return d.pivot(index="date", columns="code", values=col).reindex(px.index)
vol, val, fnet, inet, fown, frate = (P(c) for c in ("vol", "val", "fnet", "inet", "fown", "frate"))
shares = (fown / frate.where(frate > 0.0005)).ffill()          # 상장주식수 ≈ 외국인 보유 주식 ÷ 보유율
mcap = (shares * px)
amtF, amtI = fnet * px, inet * px                               # 순매수 금액 ≈ 수량 × 종가
liq = val.rolling(20, min_periods=15).mean()

SIG = {
    "외국인 20일 순매수/시총": amtF.rolling(20).sum() / mcap,
    "기관 20일 순매수/시총": amtI.rolling(20).sum() / mcap,
    "외국인 5일 순매수/시총": amtF.rolling(5).sum() / mcap,
    "기관 5일 순매수/시총": amtI.rolling(5).sum() / mcap,
    "외국인 보유율 20일 변화": frate - frate.shift(20),
    "외국인 60일 순매수/시총": amtF.rolling(60).sum() / mcap,
}
r1 = SIG["외국인 20일 순매수/시총"].rank(axis=1, pct=True); r2 = SIG["기관 20일 순매수/시총"].rank(axis=1, pct=True)
SIG["쌍끌이(외국인+기관 20일)"] = (r1 + r2) / 2
# 20일 거래대금 대비(작은 종목에 덜 치우치게)
SIG["외국인 20일 순매수/거래대금"] = amtF.rolling(20).sum() / val.rolling(20).sum()

HOR = (5, 20, 60)
dates = px.index
reb = dates[60:-61:5]                                           # 5거래일마다 (끝 60일은 결과 없음)
fwd = {h: px.shift(-(1 + h)) / px.shift(-1) - 1 for h in HOR}   # t+1 종가 → t+1+h 종가
past20 = px / px.shift(20) - 1

large = set(mcap.iloc[-1].dropna().sort_values(ascending=False).index[:200])

def run(name, S, codes=None, top=0.9):
    rows = []
    for t in reb:
        s = S.loc[t]
        ok = s.notna() & (liq.loc[t] >= 1e9) & px.loc[t].notna()          # 20일 평균 거래대금 10억 이상
        if codes is not None: ok &= s.index.isin(codes)
        s = s[ok]
        if len(s) < 60: continue
        q = s.rank(pct=True)
        for h in HOR:
            f = fwd[h].loc[t, s.index]
            if f.notna().sum() < 50: continue
            base = f.mean()
            rows.append({"t": t, "h": h, "top": f[q >= top].mean() - base, "bot": f[q <= 1 - top].mean() - base,
                         "dec": [f[(q > k / 10) & (q <= (k + 1) / 10)].mean() - base for k in range(10)],
                         "pre": past20.loc[t, s.index][q >= top].mean() - past20.loc[t, s.index].mean(),
                         "n": int((q >= top).sum())})
    R = pd.DataFrame(rows)
    out = {"name": name}
    for per, m in (("앞", R.t < SPLIT), ("뒤", R.t >= SPLIT)):
        for h in HOR:
            x = R[m & (R.h == h)]
            step = max(1, h // 5)
            xs = x.iloc[::step]                                  # 겹치지 않게 골라 t 값
            tt = xs.top.mean() / (xs.top.std(ddof=1) / np.sqrt(len(xs))) if len(xs) > 3 else np.nan
            out[f"{per}{h}"] = {"top": round(x.top.mean() * 100, 2), "net": round((x.top.mean() - COST) * 100, 2),
                               "bot": round(x.bot.mean() * 100, 2), "win": round((x.top > 0).mean() * 100), "t": round(tt, 1),
                               "nreb": len(x), "pre": round(x.pre.mean() * 100, 1),
                               "dec": [round(np.nanmean([r[k] for r in x.dec]) * 100, 2) for k in range(10)]}
    return out

res = []
for nm, S in SIG.items():
    res.append(run(nm, S))
    res.append(run(nm + " · 대형 200", S, large))
first, last = px.index[60], px.index[-1]
meta = {"from": str(first.date()), "to": str(last.date()), "stocks": int(px.shape[1]), "split": SPLIT, "cost": COST}
json.dump({"meta": meta, "res": res}, open("out/kr_whale_bt.json", "w"), ensure_ascii=False, indent=0, default=str)
print(meta)
for r in res:
    print(f"{r['name'][:28]:28s} | " + " | ".join(f"{p}{h}: {r[p+str(h)]['top']:+.2f}({r[p+str(h)]['t']}) 순{r[p+str(h)]['net']:+.2f} 바닥{r[p+str(h)]['bot']:+.2f}" for p in ("앞", "뒤") for h in (20, 60)))
