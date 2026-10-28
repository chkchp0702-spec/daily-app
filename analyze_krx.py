"""KRX 종목별 투자자 상세(연기금·사모·투신·보험·금융투자·기타법인·외국인) 순매수 → 따라 산다면?
수익 = 시가총액 변화(주식 분할 영향 없음 · 유상증자는 조금 부풀 수 있음 → 하루 ±40% 넘는 시총 변화는 버림).
그때 기준 시총 상위 200 · 20일 평균 거래대금 10억↑ · t일 수급 → t+1 마감에 삼 → h일 뒤 · 5거래일마다 · 같은 200종목 평균 대비 · 비용 0.45%
앞 2016~2020 / 뒤 2021~ (둘 다 같은 방향이어야 쓸 만함)"""
import sys, json, numpy as np, pandas as pd
SRC = sys.argv[1]
COST, SPLIT = 0.0045, "2021-01-01"
d = pd.read_csv(SRC, dtype={"code": str}, parse_dates=["date"]).drop_duplicates(["code", "date"]).sort_values(["code", "date"])
mc = d.pivot(index="date", columns="code", values="mcap").sort_index()
val = d.pivot(index="date", columns="code", values="val").reindex(mc.index)
r1 = mc.pct_change(fill_method=None)
mc = mc.where(~(r1.abs() > 0.4))                        # 유상증자·합병 같은 튀는 날 버림
TYPES = ["연기금", "사모", "투신", "보험", "금융투자", "기타법인", "외국인", "개인"]
FL = {t: d.pivot(index="date", columns="code", values=t).reindex(mc.index) for t in TYPES}
FL["기관 합계"] = sum(FL[t] for t in ["연기금", "사모", "투신", "보험", "금융투자"]) + d.pivot(index="date", columns="code", values="은행").reindex(mc.index).fillna(0) + d.pivot(index="date", columns="code", values="기타금융").reindex(mc.index).fillna(0)
liq = val.rolling(20, min_periods=15).mean()
dates = mc.index
fwd = {h: mc.shift(-(1 + h)) / mc.shift(-1) - 1 for h in (1, 3, 5, 20, 60)}
rank_cap = mc.rank(axis=1, ascending=False)

def run(S, hs=(20, 60), step=5, top=0.9):
    reb = dates[60:-61:step] if max(hs) >= 20 else dates[60:-6:1]
    rows = []
    for t in reb:
        s = S.loc[t]
        ok = s.notna() & (rank_cap.loc[t] <= 200) & (liq.loc[t] >= 1e9)
        s = s[ok]
        if len(s) < 80: continue
        q = s.rank(pct=True)
        for h in hs:
            f = fwd[h].loc[t, s.index]
            if f.notna().sum() < 60: continue
            base = f.mean()
            rows.append((t, h, f[q >= top].mean() - base, f[q <= 1 - top].mean() - base))
    return pd.DataFrame(rows, columns=["t", "h", "top", "bot"])

def stat(R, h, per):
    x = R[(R.h == h) & ((R.t < SPLIT) if per == "앞" else (R.t >= SPLIT))]
    if not len(x): return None
    sub = x.iloc[::max(1, h // 5)] if h >= 5 else x.iloc[::h]
    t = sub.top.mean() / (sub.top.std(ddof=1) / np.sqrt(len(sub))) if len(sub) > 3 else np.nan
    return x.top.mean() * 100, t, x.bot.mean() * 100

out = []
print(f"자료 {dates[0].date()}~{dates[-1].date()} · 종목 {mc.shape[1]} · 앞 ~2020 / 뒤 2021~ · 상위 10% 초과수익(%) (t) · [하위 10%]")
for tp in TYPES + ["기관 합계"]:
    for n in (20, 5):
        S = FL[tp].rolling(n).sum() / mc
        R = run(S)
        line = {"type": tp, "n": n}
        txt = []
        for h in (20, 60):
            for per in ("앞", "뒤"):
                st = stat(R, h, per)
                if st: line[f"{per}{h}"] = [round(st[0], 2), round(st[1], 1), round(st[2], 2)]; txt.append(f"{per}{h}: {st[0]:+.2f}({st[1]:.1f})[{st[2]:+.2f}]")
        yr = R[R.h == 20].groupby(R.t.dt.year).top.mean() * 100
        line["years20"] = {int(k): round(v, 1) for k, v in yr.items()}
        ok = all(line.get(k, [0])[0] > 0.45 for k in ("앞20", "뒤20")) and all(line.get(k, [0, 0])[1] > 1.5 for k in ("앞20", "뒤20"))
        bad = all(line.get(k, [0])[0] < -0.3 for k in ("앞20", "뒤20"))
        line["verdict"] = "✅" if ok else ("🔻" if bad else "")
        out.append(line)
        print(f"{tp:6s}{n:2d}일 | " + " | ".join(txt) + f" {line['verdict']}  해마다20: " + " ".join(f"{k%100:02d}:{v:+.1f}" for k, v in line["years20"].items()))
# 연기금 하루 순매수 → 1·3·5일 (가격 압력·되돌림 확인)
print("\n연기금 하루 순매수 상위 10% → 다음 1·3·5일 초과(%)")
S = FL["연기금"] / mc
R = run(S, hs=(1, 3, 5), step=1)
for h in (1, 3, 5):
    for per in ("앞", "뒤"):
        st = stat(R, h, per)
        if st: print(f"  {h}일 {per}: {st[0]:+.3f} (t {st[1]:.1f}) 하위 {st[2]:+.3f}")
json.dump({"from": str(dates[0].date()), "to": str(dates[-1].date()), "stocks": int(mc.shape[1]), "res": out}, open("out/krx_whale_bt.json", "w"), ensure_ascii=False, indent=0)
