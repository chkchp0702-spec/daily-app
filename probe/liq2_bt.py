"""#52b (11/3 10시) 미국 5일 급감 — 주 단위 겹치지 않는 표본. 원본 #52 설명:
#52 연준 순유동성(WALCL − TGA − 역레포) 4·13주 변화 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 11/2 10시 (Actions)
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


wal = tga = rrp = None   # 11/2: FRED 는 Actions 에서 매번 시간 초과 → 연준 DDP 로 바로
if rrp is not None: rrp = rrp * 1000
if wal is None or tga is None or rrp is None:
    D = ddp()
    BAN = [r"week.?average", r"change", r"district", r"maturing", r"memo", r"face value", r"collateral"]
    for k in ("RESPPA_N.WW", "RESPPLLDT_N.WW", "RESPPLLR_N.WW", "RESPPLLDTXAW_N.WW", "RESPPAX_N.WW"):
        if k in D: print("이름", k, len(D[k][1]), D[k][0][:200])
    def byname(k):
        if k not in D: return None
        s = pd.Series({pd.Timestamp(a): pd.to_numeric(b, errors="coerce") for a, b in D[k][1]}).dropna().sort_index()
        print("고름(이름)", k, s.index[0].date(), s.index[-1].date(), len(s), float(s.iloc[-1])); return s
    wal = byname("RESPPA_N.WW"); tga = byname("RESPPLLDT_N.WW"); rrp = byname("RESPPLLR_N.WW")
    if wal is None: wal = pick(D, [r"total assets", r"wednesday"], BAN)
    if tga is None: tga = pick(D, [r"treasury,? general account", r"wednesday"], BAN)
    if rrp is None: rrp = pick(D, [r"reverse repurchase", r"wednesday"], BAN + [r"foreign"])
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



# ── #52b: 미국만, 주마다 하루(공표 뒤 첫 미국 거래일 = 금요일 근처) → 5일 뒤 방향 (겹치지 않음)
d = prob.feats(H["^GSPC"]); d = d[d.index >= "2004-01-01"].copy()
rs = prob_x.rank252(np.log(sp).diff(5)).reindex(d.index)
l4 = L4.reindex(d.index); l13 = L13.reindex(d.index)
pubd = pd.DatetimeIndex(sorted(set(pub(ch4).index)))
idx = sorted({d.index[d.index.searchsorted(t)] for t in pubd if d.index.searchsorted(t) < len(d)})
W = d.loc[idx].copy(); W["rs"] = rs.loc[idx]; W["l4"] = l4.loc[idx]; W["l13"] = l13.loc[idx]
W = W[W["y5"].notna() & W["l4"].notna() & W["l13"].notna() & W["rs"].notna() & (W.index >= "2006-01-01")]
print("주 표본", len(W), W.index[0].date(), W.index[-1].date(), "평소 y5", round(W.y5.mean(), 4))
mid = W.index[len(W) // 2]; print("가운데", mid.date())
rec = W.index >= W.index[-1] - pd.Timedelta(days=1826)
res = {"n": len(W), "mid": str(mid.date())}
for tag in ("l4", "l13"):
    for nm, f in (("급감≤10", W[tag] <= .1), ("급증≥90", W[tag] >= .9), ("하위20", W[tag] <= .2)):
        row = {}
        for half, m in (("앞", W.index < mid), ("뒤", W.index >= mid), ("최근5년", rec)):
            sub = W[m]; ff = f[m]
            row[half] = [int(ff.sum()), round((sub.y5[ff].mean() - sub.y5.mean()) * 100, 1) if ff.sum() else None]
        res[f"{tag} {nm}"] = row; print("칸", tag, nm, row)
# 시작 요일 흔들기: 공표 뒤 0~4 거래일 밀어서도 같은 쪽인지
for sh in range(5):
    ii = [d.index[min(d.index.searchsorted(t) + sh, len(d) - 1)] for t in pubd]
    V = d.loc[sorted(set(ii))].copy(); V["l4"] = l4.reindex(V.index); V = V[V.y5.notna() & V.l4.notna() & (V.index >= "2006-01-01")]
    md = V.index[len(V) // 2]; out_ = []
    for m in (V.index < md, V.index >= md):
        s = V[m]; ff = s.l4 <= .1; out_.append([int(ff.sum()), round((s.y5[ff].mean() - s.y5.mean()) * 100, 1)])
    print("밀기", sh, out_)
# 걸어가기(사전 20주 · 주 표본이라 작게, 그리고 100도) — 기존 = S&P 5일 꼬리 3칸
def wfw(y, lab, prior):
    known = y.shift(1); base = known.expanding().mean(); p = base.copy()
    for Lb in lab.dropna().unique():
        f = lab == Lb; fm = f.shift(1, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base
sl = pd.Series(np.where(W.rs >= .9, "sh", np.where(W.rs <= .1, "sl", "-")), index=W.index)
for tag in ("l4", "l13"):
    ll = pd.Series(np.where(W[tag] <= .1, "ll", "-"), index=W.index)
    for prior in (20, 50):
        P = {"평소": wfw(W.y5, sl, prior)[1], "기존": wfw(W.y5, sl, prior)[0], "기존+급감": wfw(W.y5, sl + "|" + ll, prior)[0], "급감만": wfw(W.y5, ll, prior)[0]}
        ev = W.index >= "2008-01-01"; md = W.index[ev][ev.sum() // 2]; r = {}
        for half, m in (("앞", ev & (W.index < md)), ("뒤", ev & (W.index >= md)), ("최근5년", ev & rec)):
            r[half] = {k: round(float(((p[m] - W.y5[m]) ** 2).mean()), 5) for k, p in P.items()}
        res[f"걸어가기 {tag} 사전{prior}"] = r; print("걸어가기", tag, prior, r)
# 교차 로지스틱
def logit_fit(X, y, l2=1.0, it=60):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w
X = np.c_[np.ones(len(W)), W.rs >= .9, W.rs <= .1, W.l4 <= .1, W.l13 <= .1].astype(float); y = W.y5.values
a, b = (W.index < mid), (W.index >= mid)
for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
    s = {}
    for k, cols in (("기존", [0, 1, 2]), ("+4주", [0, 1, 2, 3]), ("+13주", [0, 1, 2, 4])):
        w = logit_fit(X[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-X[te][:, cols] @ w)); s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
        if k != "기존": s[k + "계수"] = round(float(w[-1]), 3)
    res["교차 " + nm] = s; print("교차", nm, s)
print("지금 l4", round(float(L4.dropna().iloc[-1]), 3), "l13", round(float(L13.dropna().iloc[-1]), 3))
print("RESULT", json.dumps(res, ensure_ascii=False))
