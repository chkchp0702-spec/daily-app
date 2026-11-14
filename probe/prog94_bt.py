"""#94 한국 프로그램 비차익 순매수 5·20일 합 꼬리(1년 백분위 ≥90·≤10) → 코스피 다음 날·5일 — 확률 보강 일지 11/14 12시 (Actions)
자료 길: 네이버 PC finance.naver.com/sise/programDealTrendDay.naver (코스피 일별 차익·비차익·전체 매수/매도/순매수, 억원) — 쪽 넘기며 끝까지.
막히면 다른 주소 상태만 찍는다."""
import json, sys, os, time, io, re
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36", "Referer": "https://finance.naver.com/sise/sise_program.naver"}
res = {"주소": {}}
for nm, u in (("naver_pc", "https://finance.naver.com/sise/programDealTrendDay.naver?bizdate=20261113&sosok=&page=1"),
              ("naver_pc_time", "https://finance.naver.com/sise/programDealTrendTime.naver?bizdate=20261113&sosok=&page=1"),
              ("daum_program", "https://finance.daum.net/api/market_index/program_trading?market=KOSPI&page=1&perPage=10"),
              ("naver_m", "https://m.stock.naver.com/api/index/KOSPI/program")):
    try:
        r = requests.get(u, headers=UA, timeout=15); res["주소"][nm] = [r.status_code, len(r.content)]
    except Exception as e:
        res["주소"][nm] = str(e)[:80]
print(res["주소"], flush=True)

rows = {}; first = None
for pg in range(1, 700):
    try:
        r = requests.get(f"https://finance.naver.com/sise/programDealTrendDay.naver?bizdate=20261114&sosok=&page={pg}", headers=UA, timeout=15)
        html = r.content.decode("euc-kr", "replace")
        tb = pd.read_html(io.StringIO(html))
    except Exception as e:
        print("page", pg, "err", str(e)[:80]); break
    t = max(tb, key=len); new = 0
    for _, row in t.iterrows():
        v = [str(x) for x in row.values]
        if not re.match(r"^\d{2}\.\d{2}\.\d{2}$", v[0]): continue
        if first is None: first = v; print("sample", v)
        dt = pd.to_datetime("20" + v[0], format="%Y.%m.%d")
        if dt in rows: continue
        nums = [float(str(x).replace(",", "")) if str(x) not in ("nan", "") else np.nan for x in v[1:]]
        rows[dt] = nums; new += 1
    if new == 0: print("stop at page", pg); break
    if pg % 50 == 0: print(pg, len(rows), min(rows).date(), flush=True)
    time.sleep(0.12)
res["rows"] = len(rows)
if len(rows) < 300:
    print(json.dumps(res, ensure_ascii=False)); json.dump(res, open("probe/prog94_bt.json", "w"), ensure_ascii=False, indent=1); sys.exit(0)
P = pd.DataFrame.from_dict(rows, orient="index").sort_index()
res["열수"] = P.shape[1]; res["샘플"] = first; res["first"] = str(P.index[0].date()); res["last"] = str(P.index[-1].date())
# 열: 차익(매수,매도,순매수) 비차익(매수,매도,순매수) 전체(매수,매도,순매수) — 순매수 = 매수−매도 로 확인
na = P[5] if P.shape[1] >= 9 else P.iloc[:, 5]
res["확인 비차익 순=매수−매도 비율"] = round(float(((P[3] - P[4] - P[5]).abs() < 2).mean()), 3)
P.to_csv("probe/prog94_raw.csv")

import prob, prob_x
from night_bt_lib import wf, score, lab, logit_fit
H = prob.load_hist(["^KS11", "^GSPC"])
import yfinance as yf
for s_ in ("^KS11", "^GSPC"):
    for _ in range(3):
        if s_ in H and len(H[s_]) > 3000: break
        time.sleep(3); o = yf.download(s_, start="2000-01-01", interval="1d", auto_adjust=False, progress=False, threads=False)
        if isinstance(o.columns, pd.MultiIndex): o.columns = o.columns.get_level_values(0)
        if len(o): o = o[["Open", "Close"]].dropna(subset=["Close"]); o.index = pd.to_datetime(o.index).tz_localize(None); H[s_] = o
ks = H["^KS11"]["Close"].dropna(); sp = H["^GSPC"]["Close"].dropna()
d = prob.feats(H["^KS11"]); d = d[d.index >= P.index[0]].copy(); idx = d.index
nar = na.reindex(idx)                       # 그날 장 끝난 뒤 값 → 다음 날 예측
# 크기 맞추기: 시가총액 커짐 → 1년 백분위로
F = {}
for k in (1, 5, 20):
    F[k] = prob_x.rank252(nar.rolling(k, min_periods=k).sum())
rk = prob_x.rank252(np.log(ks).diff(5)).reindex(idx)
rs = prob_x.align(prob_x.rank252(np.log(sp).diff(5)), idx)
v = rk.notna() & rs.notna() & F[20].notna()
dd = d[v].copy(); rk, rs = rk[v], rs[v]; F = {k: x[v] for k, x in F.items()}
mid = dd.index[len(dd) // 2]; r5m = dd.index >= dd.index[-1] - pd.Timedelta(days=1826)
res.update({"n": len(dd), "mid": str(mid.date()), "지금": {f"{k}일 순위": round(float(F[k].iloc[-1]), 3) for k in F},
            "지금 비차익 최근5일(억)": [float(x) for x in nar.dropna().iloc[-5:]]})
cells = {}
for k in (1, 5, 20):
    for side, f in (("≥90", F[k] >= .9), ("≤10", F[k] <= .1)):
        nm = f"{k}일{side}"; cells[nm] = {}
        for half, msk in (("앞", dd.index < mid), ("뒤", dd.index >= mid), ("최근5년", r5m)):
            c_ = prob.cond(dd[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - dd.loc[msk, "y1"].mean()) * 100, 1),
                                                    round((c_["p5"] - dd.loc[msk, "y5"].mean()) * 100, 1) if c_["p5"] is not None else None]
res["칸(n,다음날%p,5일%p)"] = cells
# 겹침: 코스피 5일 꼬리·S&P 5일 꼬리와 같은 날
res["겹침"] = {f"{k}일{s}": [int(f.sum()), int((f & ((rk >= .9) | (rk <= .1))).sum())] for k in (5, 20) for s, f in (("≥90", F[k] >= .9), ("≤10", F[k] <= .1))}
base = lab(rk, "kh", "kl") + "|" + lab(rs, "sh", "sl")
st = str(dd.index[300].date())
for ycol, h in (("y1", 1), ("y5", 5)):
    pb = wf(dd, base, ycol, h)[0]; Ps = {"기존": pb}
    for k in (1, 5, 20):
        Ps[f"+{k}일"] = wf(dd, base + "|" + lab(F[k], "ph", "pl"), ycol, h)[0]
    res["걸어가기 " + ycol] = score(dd, ycol, Ps, start=st)
    # 교차 로지스틱
    y = dd[ycol]; m = y.notna(); ix = dd.index[m]; mi = ix[len(ix) // 2]; yy = y[m].values.astype(float)
    a, b_ = ix < mi, ix >= mi; R = {}
    for k in (1, 5, 20):
        D = pd.DataFrame({"c": 1.0, "kh": rk >= .9, "kl": rk <= .1, "sh": rs >= .9, "sl": rs <= .1, "ph": F[k] >= .9, "pl": F[k] <= .1}, index=dd.index).astype(float)
        Xa = D[m].values
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            o = {}
            for kk, cols in (("기존", [0, 1, 2, 3, 4]), ("+", [0, 1, 2, 3, 4, 5, 6])):
                w_ = logit_fit(Xa[tr][:, cols], yy[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w_))
                o[kk] = round(float(((p - yy[te]) ** 2).mean()), 5)
                if kk == "+": o["계수(ph,pl)"] = [round(float(w_[5]), 3), round(float(w_[6]), 3)]
            R[f"{k}일 {nm}"] = o
    res["교차 " + ycol] = R
print(json.dumps(res, ensure_ascii=False, indent=1))
json.dump(res, open("probe/prog94_bt.json", "w"), ensure_ascii=False, indent=1)
