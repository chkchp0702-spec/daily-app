"""시장 전체 투자자별 순매수 → 다음 지수 수익 (연기금·사모 등이 시장 타이밍 고래인가)
t일 마감 뒤 나온 수급 → t+1 종가에 산 셈 → h일 뒤. 수급 = 최근 n일 합의 1년 백분위. 상위 20% 날 vs 모든 날. 앞 2016~2021 / 뒤 2022~"""
import sys, numpy as np, pandas as pd
F = pd.read_csv(sys.argv[1], parse_dates=["date"]); I = pd.read_csv(sys.argv[2], parse_dates=["Date"]).set_index("Date")
NM = {"PENSION_FUND": "연기금", "PRIVATE_EQUITY_FUND": "사모", "MUTUAL_FUND": "투신", "INSURANCE_COMPANIES": "보험", "FINANCIAL_INVESTOR": "금융투자",
      "BANK": "은행", "FOREIGN": "외국인", "INDIVIDUAL": "개인", "ETC_CORPORATION": "기타법인", "INST": "기관 합계"}
for mk, ixc in (("KOSPI", "^KS11"), ("KOSDAQ", "^KQ11")):
    f = F[F.mk == mk].set_index("date").sort_index()
    px = I[ixc].dropna(); px = px[px.index.isin(f.index)]
    f = f.reindex(px.index)
    print(f"\n== {mk} {px.index[0].date()}~{px.index[-1].date()} ({len(px)}일) · 표 = 상위 20% 날의 h일 지수 수익 − 모든 날 평균 (%p)")
    for h in (5, 20):
        fwd = px.shift(-(1 + h)) / px.shift(-1) - 1
        line = []
        for k, nm in NM.items():
            for n in (5, 20):
                s = f[k].rolling(n).sum()
                pr = s.rolling(252, min_periods=200).rank(pct=True)
                res = []
                for a, b in (("2016-01-01", "2021-12-31"), ("2022-01-01", "2026-12-31")):
                    m = (px.index >= a) & (px.index <= b) & fwd.notna() & pr.notna()
                    top = fwd[m & (pr >= 0.8)].mean(); bot = fwd[m & (pr <= 0.2)].mean(); allm = fwd[m].mean()
                    res.append((top - allm) * 100); res.append((bot - allm) * 100)
                line.append((nm, n, res))
        print(f"  h={h}일:  이름(n일)   앞 상위 / 앞 하위 | 뒤 상위 / 뒤 하위")
        for nm, n, r in line:
            flag = "✅" if r[0] > 0.3 * h / 5 and r[2] > 0.3 * h / 5 else ("🔻" if r[0] < -0.3 * h / 5 and r[2] < -0.3 * h / 5 else "")
            print(f"    {nm}({n}일) {r[0]:+.2f} / {r[1]:+.2f} | {r[2]:+.2f} / {r[3]:+.2f} {flag}")
