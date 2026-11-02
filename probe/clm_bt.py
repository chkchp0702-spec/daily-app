"""#53 미 신규 실업수당 청구(주정부 최초 청구, 계절조정 안 된 값) 4주 평균 1년 전 대비 변화 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 11/2 11시 (Actions)
자료: 노동부 ETA 539 https://oui.doleta.gov/unemploy/csv/ar539.csv (주별·주정부별, 1971~) → 전국 합계. 토요일 주말 값 → 다음 목요일 공표 → 금요일(+6일) 미국 날짜부터 사용.
특성 L4 = log(4주 평균) − log(52주 전 4주 평균) (계절 없앰) · L13 = L4 의 13주 변화(가속). 1년 백분위 ≥90(청구 급증=경기 나빠짐)·≤10 꼬리. 걸어가며 사전 100 브라이어 앞/뒤·최근5년 + 달러·S&P 5일 꼬리 위 + 교차 로지스틱."""
import json, sys, os, io, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x


def get(u, t=60):
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
    return urllib.request.urlopen(req, timeout=t).read()


ic = None
for u in ("https://oui.doleta.gov/unemploy/csv/ar539.csv", "http://oui.doleta.gov/unemploy/csv/ar539.csv"):
    try:
        raw = get(u); df = pd.read_csv(io.BytesIO(raw), low_memory=False)
        print("ETA539", u, len(raw), list(df.columns)[:30]); print(df.tail(3).to_string())
        df["d"] = pd.to_datetime(df["rptdate"], errors="coerce"); df["c3"] = pd.to_numeric(df["c3"], errors="coerce")
        ic = df.dropna(subset=["d"]).groupby("d")["c3"].sum().sort_index()
        cnt = df.dropna(subset=["d"]).groupby("d")["st"].nunique()
        ic = ic[cnt.reindex(ic.index) >= 50]
        print("전국 최초 청구(NSA) 최근", [(str(a.date()), int(b)) for a, b in ic.tail(6).items()], ic.index[0].date(), len(ic))
        break
    except Exception as e:
        print("실패", u, repr(e)[:200])
if ic is None:
    for u in ("https://fred.stlouisfed.org/graph/fredgraph.csv?id=ICNSA",):
        try:
            df = pd.read_csv(io.StringIO(get(u, 25).decode())); ic = pd.to_numeric(df.iloc[:, 1], errors="coerce"); ic.index = pd.to_datetime(df.iloc[:, 0]); ic = ic.dropna(); print("FRED ICNSA", len(ic))
        except Exception as e:
            print("FRED 실패", e)
if ic is None:
    print("자료 못 구함 — 끝"); sys.exit(0)
ma = ic.rolling(4).mean()
ch4 = np.log(ma) - np.log(ma.shift(52)); ch13 = ch4 - ch4.shift(13)
print("4주평균 1년 대비(%)", [(str(a.date()), round(float(b) * 100, 1)) for a, b in ch4.dropna().tail(5).items()])
pub = lambda s: pd.Series(s.values, index=s.index + pd.Timedelta(days=6))   # 공표 시차(목요일 공표 → 금요일부터)

syms = sorted({c["ix"] for c in prob.MK.values()} | {"DX-Y.NYB", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
dx, sp = cs("DX-Y.NYB"), cs("^GSPC")
usd = sp.index
L4 = prob_x.rank252(pub(ch4).reindex(pub(ch4).index.union(usd)).ffill().reindex(usd))
L13 = prob_x.rank252(pub(ch13).reindex(pub(ch13).index.union(usd)).ffill().reindex(usd))
print("지금 백분위 4주", round(float(L4.dropna().iloc[-1]), 3), "13주", round(float(L13.dropna().iloc[-1]), 3), L4.dropna().index[-1].date())


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]; known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for Lb in [x for x in lab.dropna().unique()]:
        f = (lab == Lb); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2006-01-01"):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())
def one(r, c_, nm):
    return pd.Series(np.where(c_, nm, "-"), index=r.index, dtype=object).where(r.notna())


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2004-01-01"].copy()
    A = (lambda s: prob_x.align(s, d.index)) if mk != "US" else (lambda s: s.reindex(d.index).ffill())
    rd = A(prob_x.rank252(np.log(dx).diff(5))); rs = A(prob_x.rank252(np.log(sp).diff(5)))
    oth = lab(rd, "dh", "dl") + "|" + lab(rs, "sh", "sl")
    mid = d.index[len(d) // 2]
    r = {"mid": str(mid.date())}
    for tag, Lx in (("4주", A(L4)), ("13주", A(L13))):
        cells = {}
        for nm, f in (("≥90(청구 급증)", (Lx >= 0.9).fillna(False)), ("≤10(청구 급감)", (Lx <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                wks = int(pd.Series(d.index[msk & f.values]).dt.to_period("W").nunique())
                cells[nm][half] = None if not c_ else [c_["n"], wks, round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        q5 = pd.cut(Lx, [-0.01, .2, .4, .6, .8, 1.01], labels=["q1", "q2", "q3", "q4", "q5"]).astype(object).where(Lx.notna())
        hi, lo, both = one(Lx, Lx >= .9, "lh"), one(Lx, Lx <= .1, "ll"), lab(Lx, "lh", "ll")
        rr = {"cur": None if pd.isna(Lx.iloc[-1]) else round(float(Lx.iloc[-1]), 3), "칸(n,주수,y1차,y5차)": cells}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, both, ycol, h)[1], "급증": wf(d, hi, ycol, h)[0], "급감": wf(d, lo, ycol, h)[0], "양쪽": wf(d, both, ycol, h)[0], "5칸": wf(d, q5, ycol, h)[0],
                 "기존(달러·S&P)": wf(d, oth, ycol, h)[0], "기존+급증": wf(d, oth + "|" + hi, ycol, h)[0], "기존+급감": wf(d, oth + "|" + lo, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + both, ycol, h)[0]}
            rr[ycol] = score(d, ycol, P)
        r[tag] = rr
    print(mk, json.dumps(r, ensure_ascii=False))
    out[mk] = r


def logit_fit(X, y, l2=1.0, it=100):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w
X_out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2004-01-01"].copy()
    A = (lambda s: prob_x.align(s, d.index)) if mk != "US" else (lambda s: s.reindex(d.index).ffill())
    rd = A(prob_x.rank252(np.log(dx).diff(5))); rs = A(prob_x.rank252(np.log(sp).diff(5))); l4 = A(L4); l13 = A(L13)
    D = pd.DataFrame({"c": 1.0, "dh": rd >= .9, "dl": rd <= .1, "sh": rs >= .9, "sl": rs <= .1, "l4h": l4 >= .9, "l4l": l4 <= .1, "l13h": l13 >= .9, "l13l": l13 <= .1}, index=d.index).astype(float)
    ok = rd.notna() & rs.notna() & l4.notna() & l13.notna() & (d.index >= "2006-01-01")
    Rr = {}
    for ycol in ("y1", "y5"):
        m = ok & d[ycol].notna(); idx = d.index[m]; mid = idx[len(idx) // 2]
        y = d.loc[m, ycol].values.astype(float); Xa = D[m].values
        a, b_ = idx < mid, idx >= mid
        r = {}
        for nm, tr, te in (("앞→뒤", a, b_), ("뒤→앞", b_, a)):
            s = {}
            for k, cols in (("기존", [0, 1, 2, 3, 4]), ("+4주", [0, 1, 2, 3, 4, 5, 6]), ("+13주", [0, 1, 2, 3, 4, 7, 8])):
                w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                if k != "기존": s[k + "계수"] = [round(float(v), 3) for v in w[-2:]]
            r[nm] = s
        Rr[ycol] = r
    print("교차", mk, json.dumps(Rr, ensure_ascii=False)); X_out[mk] = Rr
