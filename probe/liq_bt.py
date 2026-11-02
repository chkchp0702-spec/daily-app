"""#52 연준 순유동성(WALCL − TGA − 역레포) 4·13주 변화 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 11/2 10시 (Actions)
FRED 주간(수요일 값, 목요일 16:30 ET 공표) → 공표 시차 지켜 수요일+2일(금요일) 미국 날짜부터 사용 → 아시아는 prob_x.align.
변화 = (순유동성 − 4주 전)/WALCL. 1년(252 미국 거래일) 백분위 ≥90·≤10 꼬리 + 5칸. 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: 달러지수·S&P 5일 꼬리 칸 위 + 교차 로지스틱. 주간 값이라 같은 칸이 며칠씩 이어짐 → 「서로 다른 주 수」도 같이 봄."""
import json, sys, os, io, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x


import re, zipfile
def get(u, t=25):
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
    return urllib.request.urlopen(req, timeout=t).read()


def fred(i):
    for u in (f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={i}", f"https://alfred.stlouisfed.org/graph/alfredgraph.csv?id={i}"):
        try:
            df = pd.read_csv(io.StringIO(get(u, 20).decode()))
            s = pd.to_numeric(df.iloc[:, 1], errors="coerce"); s.index = pd.to_datetime(df.iloc[:, 0])
            s = s.dropna(); print("FRED", i, u, s.index[0].date(), s.index[-1].date(), len(s)); return s
        except Exception as e:
            print("FRED 실패", i, u, e)
    return None


def ddp():
    """연준 Data Download Program H.4.1 통째 zip → 설명으로 계열 고르기"""
    for u in ("https://www.federalreserve.gov/datadownload/Output.aspx?rel=H41&filetype=zip",):
        try:
            z = zipfile.ZipFile(io.BytesIO(get(u, 90))); print("DDP zip", z.namelist())
        except Exception as e:
            print("DDP 실패", u, e); continue
        x = "".join(z.read(n).decode("utf-8", "ignore") for n in z.namelist() if "data" in n.lower() and n.endswith(".xml"))
        out = {}
        for m in re.finditer(r"<kf:Series(.*?)</kf:Series>", x, re.S):
            blk = m.group(1); nm = re.search(r'SERIES_NAME="([^"]+)"', blk)
            if not nm: continue
            desc = " / ".join(re.findall(r"<common:AnnotationText[^>]*>(.*?)</common:AnnotationText>", blk, re.S))[:300]
            obs = re.findall(r'TIME_PERIOD="([^"]+)"\s+OBS_VALUE="([^"]+)"', blk) or [(b, a) for a, b in re.findall(r'OBS_VALUE="([^"]+)"\s+TIME_PERIOD="([^"]+)"', blk)]
            out[nm.group(1)] = (desc, obs)
        print("DDP 계열 수", len(out))
        return out
    return {}


def pick(D, must, ban=()):
    c = [(k, v) for k, v in D.items() if all(re.search(p, v[0], re.I) for p in must) and not any(re.search(p, v[0], re.I) for p in ban) and k.endswith(".WW") or False]
    c = [(k, v) for k, v in D.items() if all(re.search(p, v[0], re.I) for p in must) and not any(re.search(p, v[0], re.I) for p in ban)]
    for k, v in c[:8]: print("  후보", k, len(v[1]), v[0][:160])
    if not c: return None
    k, v = max(c, key=lambda kv: len(kv[1][1]))
    s = pd.Series({pd.Timestamp(a): pd.to_numeric(b, errors="coerce") for a, b in v[1]}).dropna().sort_index()
    print("고름", k, s.index[0].date(), s.index[-1].date(), len(s), float(s.iloc[-1])); return s


wal = fred("WALCL"); tga = fred("WDTGAL"); rrp = fred("RRPONTSYD")
if rrp is not None: rrp = rrp * 1000
if wal is None or tga is None or rrp is None:
    D = ddp()
    if wal is None: wal = pick(D, [r"total assets", r"wednesday"], [r"week.?average", r"change"])
    if tga is None: tga = pick(D, [r"treasury,? general account|general account", r"wednesday"], [r"week.?average", r"change"])
    if rrp is None: rrp = pick(D, [r"reverse repurchase", r"wednesday"], [r"week.?average", r"change", r"foreign"])
if wal is None or tga is None or rrp is None:
    print("자료 못 구함 — 끝"); sys.exit(0)
wk = wal.index
T = tga.reindex(tga.index.union(wk)).ffill().reindex(wk)
R = rrp.reindex(rrp.index.union(wk)).ffill().reindex(wk).fillna(0)   # 십억 → 백만
net = wal - T - R
print("순유동성(조$) 최근", [(str(a.date()), round(b / 1e6, 3)) for a, b in net.tail(5).items()])
ch4 = (net - net.shift(4)) / wal; ch13 = (net - net.shift(13)) / wal
pub = lambda s: pd.Series(s.values, index=s.index + pd.Timedelta(days=2))   # 공표 시차

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
        for nm, f in (("≥90(유동성 급증)", (Lx >= 0.9).fillna(False)), ("≤10(유동성 급감)", (Lx <= 0.1).fillna(False))):
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
