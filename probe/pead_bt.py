"""#11 실적 발표 뒤 흐름(PEAD) 검증 — 확률 보강 일지 10/28 13시 (Actions 에서 실행)
Bernard & Thomas(1989) 등: 실적 놀람(서프라이즈)·발표 반응이 큰 종목은 그 뒤 며칠~몇 주 같은 쪽으로 더 간다.
대상: 미국 시가총액 큰 종목(opdata sec.json) · 야후 get_earnings_dates(EPS 예상·실제·놀람%)
반응일 d0 = 발표일과 다음 거래일 중 시장 대비 더 크게 움직인 날 · 진입 = d0+j 종가(j=0..4)
목표 yr5 = 다음 5거래일 종목 > S&P · y1 = 다음 날 오름
① 놀람%·반응(초과수익) 구간별 yr5 비율 vs 평소(모든 종목-날) — 앞/뒤 절반
② 일반 모델(1·5·20일 수익·시장 대비 20일 로지스틱, prob_sec 비슷) 위에 놀람/반응을 더하면 브라이어가 좋아지나 — 두 기간 교차"""
import json, sys, os, time
import numpy as np, pandas as pd
import yfinance as yf

sys.path.insert(0, os.getcwd())
import prob_sec as ps

N = int(os.environ.get("N", "220"))
sec = ps.get(ps.OPD + "sec.json")
cand = sorted([(s, v) for s, v in sec.items() if "." not in s and "^" not in s and isinstance(v, list) and len(v) > 2 and v[2]], key=lambda x: -x[1][2])[:N]
syms = [s for s, _ in cand]
print("종목", len(syms))
raw = yf.download(syms + ["^GSPC"], period="8y", auto_adjust=True, progress=False, threads=True)["Close"]
m = raw["^GSPC"].dropna()
C = raw.drop(columns=["^GSPC"]).reindex(m.index)
idx = m.index

# ---- 실적 일정 ----
E = []
t0 = time.time()
for i, s in enumerate(syms):
    try:
        ed = yf.Ticker(s).get_earnings_dates(limit=32)
        if ed is None or len(ed) == 0:
            continue
        ed = ed.dropna(subset=["Reported EPS"])
        for ts, r in ed.iterrows():
            E.append((s, pd.Timestamp(ts).tz_localize(None) if pd.Timestamp(ts).tzinfo else pd.Timestamp(ts), r.get("Surprise(%)"), r.get("EPS Estimate"), r.get("Reported EPS")))
    except Exception as e:
        if i < 5:
            print("실적 실패", s, e)
    if i % 50 == 0:
        print("실적", i, len(E), f"{time.time()-t0:.0f}s")
print("실적 행", len(E))

# ---- 종목-날 표 ----
rows = []
for s in syms:
    if s not in C or C[s].notna().sum() < 300:
        continue
    c = C[s]
    d = pd.DataFrame(index=idx)
    d["s"] = s
    d["r1"] = c.pct_change(); d["r5"] = c.pct_change(5); d["r20"] = c.pct_change(20)
    d["rel20"] = d["r20"] - m.pct_change(20)
    f5 = c.shift(-5) / c; mf5 = m.shift(-5) / m
    d["yr5"] = (f5 > mf5).astype(float).where(f5.notna())
    d["y1"] = (c.shift(-1) > c).astype(float).where(c.shift(-1).notna())
    d["ex1"] = c.pct_change() - m.pct_change()
    rows.append(d)
P = pd.concat(rows); P.index.name = "date"; P = P.reset_index()
P = P.dropna(subset=["r1", "r5", "r20", "rel20"])
print("종목-날", len(P))
pos = {d: i for i, d in enumerate(idx)}
key = P.set_index(["s", "date"])

ev = []
for s, ts, sur, est, rep in E:
    if s not in C:
        continue
    k = idx.searchsorted(ts.normalize())
    if k >= len(idx) - 1:
        continue
    cands = [k, k + 1]
    ex = C[s].pct_change() - m.pct_change()
    a = [abs(ex.iloc[j]) if j < len(idx) and pd.notna(ex.iloc[j]) else -1 for j in cands]
    d0 = cands[int(np.argmax(a))]
    try:
        sur = float(sur)
    except Exception:
        sur = np.nan
    ear = float(ex.iloc[d0]) if pd.notna(ex.iloc[d0]) else np.nan
    # EPS 차이 ÷ |예상| 직접 (놀람% 비었을 때)
    if not np.isfinite(sur):
        try:
            sur = (float(rep) - float(est)) / max(abs(float(est)), 0.01) * 100
        except Exception:
            pass
    for j in range(5):
        if d0 + j >= len(idx):
            break
        ev.append((s, idx[d0 + j], j, sur, ear))
EV = pd.DataFrame(ev, columns=["s", "date", "j", "sur", "ear"]).drop_duplicates(["s", "date"])
EV = EV.merge(P, on=["s", "date"], how="inner")
print("사건 행", len(EV), "j=0", int((EV.j == 0).sum()), "기간", EV.date.min(), EV.date.max())

out = {"n_syms": len(syms), "n_earn": len(E), "n_ev": int((EV.j == 0).sum())}
cut = EV.loc[EV.j == 0, "date"].median()
out["cut"] = str(pd.Timestamp(cut).date())
Pp = P[P.date >= EV.date.min()]
base = {"앞": float(Pp[Pp.date < cut]["yr5"].mean()), "뒤": float(Pp[Pp.date >= cut]["yr5"].mean())}
base1 = {"앞": float(Pp[Pp.date < cut]["y1"].mean()), "뒤": float(Pp[Pp.date >= cut]["y1"].mean())}
out["base"] = base; out["base1"] = base1
print("평소 yr5", base, "y1", base1)


def tbl(col, qs, jset):
    res = []
    D = EV[EV.j.isin(jset)].dropna(subset=[col, "yr5"])
    edges = D[col].quantile(qs).values
    edges = [-np.inf, *edges, np.inf]
    for i in range(len(edges) - 1):
        h = D[(D[col] > edges[i]) & (D[col] <= edges[i + 1])]
        r = {"칸": f"{edges[i]:.3g}~{edges[i+1]:.3g}"}
        for nm, hh in (("앞", h[h.date < cut]), ("뒤", h[h.date >= cut])):
            r[nm] = [int(len(hh)), round((hh["yr5"].mean() - base[nm]) * 100, 1), round((hh["y1"].mean() - base1[nm]) * 100, 1)]
        res.append(r)
    return res


for col in ("sur", "ear"):
    for jn, js in (("j0", [0]), ("j1-4", [1, 2, 3, 4])):
        t = tbl(col, [0.2, 0.4, 0.6, 0.8], js)
        out[f"{col}_{jn}"] = t
        print(f"\n== {col} {jn} (칸 · 앞 [n, yr5 %p, y1 %p] · 뒤)")
        for r in t:
            print(r)


# ---- ② 일반 모델 위에 더하기 ----
F = ["r1", "r5", "r20", "rel20"]
lo, hi = P[F].quantile(0.01), P[F].quantile(0.99)
def Z(D, mu, sd):
    return ((D[F].clip(lo, hi, axis=1) - mu) / sd).values
res2 = {}
for tgt in ("yr5", "y1"):
    for nm, (trm, tem) in {"앞→뒤": (P.date < cut, P.date >= cut), "뒤→앞": (P.date >= cut, P.date < cut)}.items():
        tr = P[trm].dropna(subset=[tgt]).sample(frac=1.0, random_state=1)
        tr = tr.iloc[:400000]
        mu, sd = tr[F].clip(lo, hi, axis=1).mean(), tr[F].clip(lo, hi, axis=1).std() + 1e-9
        w = ps.logistic_fit(Z(tr, mu, sd), tr[tgt].values)
        for jn, js in (("j0", [0]), ("j0-4", [0, 1, 2, 3, 4])):
            Etr = EV[EV.j.isin(js) & (EV.date < cut if nm == "앞→뒤" else EV.date >= cut)].dropna(subset=[tgt])
            Ete = EV[EV.j.isin(js) & (EV.date >= cut if nm == "앞→뒤" else EV.date < cut)].dropna(subset=[tgt])
            for fe in ("sur", "ear", "both"):
                cols = ["sur", "ear"] if fe == "both" else [fe]
                A = Etr.dropna(subset=cols); B = Ete.dropna(subset=cols)
                if len(A) < 200 or len(B) < 200:
                    continue
                pa = ps.pred(w, Z(A, mu, sd)); pb = ps.pred(w, Z(B, mu, sd))
                # 놀람% 는 ±100 에서 자르고 부호·크기 그대로 · 반응은 ±15%
                def feat(D):
                    X = []
                    if "sur" in cols: X.append(np.clip(D["sur"].values, -50, 50) / 20)
                    if "ear" in cols: X.append(np.clip(D["ear"].values, -0.15, 0.15) / 0.05)
                    return np.c_[X].T
                la = np.log(pa / (1 - pa)); lb = np.log(pb / (1 - pb))
                Xa = np.c_[la, feat(A)]
                wb = ps.logistic_fit(Xa, A[tgt].values, l2=20.0)
                pb2 = ps.pred(wb, np.c_[lb, feat(B)])
                b0 = float(np.mean((pb - B[tgt].values) ** 2)); b1 = float(np.mean((pb2 - B[tgt].values) ** 2))
                # 일반 모델 없이 평소만
                bb = float(np.mean((A[tgt].mean() - B[tgt].values) ** 2))
                kk = f"{tgt} {nm} {jn} {fe}"
                res2[kk] = {"n": [len(A), len(B)], "brier_gen": round(b0, 5), "brier_add": round(b1, 5), "brier_base": round(bb, 5), "w": [round(x, 3) for x in wb]}
                print(kk, res2[kk])
out["add"] = res2
os.makedirs("probe", exist_ok=True)
json.dump(out, open("probe/pead_bt.json", "w"), ensure_ascii=False, indent=1, default=str)
print("끝")
