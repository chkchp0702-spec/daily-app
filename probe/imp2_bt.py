"""#56b (11/2 17시) 수입 증감률 상위30%(급증) → 코스피 5일 — 기존 칸(⑥ 자기 5일 모멘텀 · S&P 5일 꼬리) 위 겹침 · 월 전체로 넓힌 표본.
자료: e-나라지표 표 106601 iframe (수입 증감률 1995-01~)."""
import re, html, urllib.request
import numpy as np, pandas as pd, yfinance as yf
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, t=60): return urllib.request.urlopen(urllib.request.Request(u, headers=H_), timeout=t).read().decode("utf-8", "ignore")
def txt(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(t))).strip()
s = get("https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd=106601&idx_cd=1066&freq=M&period=199501:202610")
rows = re.findall(r"<tr.*?</tr>", s, re.S); head = None; tab = {}
for r in rows:
    cells = [txt(x) for x in re.findall(r"<t[hd][^>]*>.*?</t[hd]>", r, re.S)]
    if head is None and sum(bool(re.match(r"(19|20)\d\d", x)) for x in cells) > 50: head = cells; continue
    if head and len(cells) > 50:
        nh = len([h for h in head if re.match(r'(19|20)\d\d', h)]); tab[" ".join(cells[:len(cells) - nh])] = cells
hd = [h for h in head if re.match(r"(19|20)\d\d", h)]
def ser(cells):
    out = {}
    for h, x in zip(hd, cells[-len(hd):]):
        m = re.match(r"((?:19|20)\d\d)\.?\s?(\d\d)", h)
        try: out[pd.Timestamp(int(m.group(1)), int(m.group(2)), 1)] = float(x.replace(",", ""))
        except Exception: pass
    return pd.Series(out).sort_index()
lab = next(l for l in tab if "수입" in l and "증감" in l); impy = ser(tab[lab]); print("행:", lab, len(impy), impy.tail(3).to_dict())
q = impy.expanding(36).rank(pct=True)                # 그 달까지 알려진 값 기준 순위
px = yf.download("^KS11", start="1996-01-01", progress=False, auto_adjust=True)["Close"].squeeze().dropna()
sp = yf.download("^GSPC", start="1995-01-01", progress=False, auto_adjust=True)["Close"].squeeze().dropna()
r5f = px.shift(-5) / px - 1; r1f = px.shift(-1) / px - 1
own5 = px / px.shift(5) - 1
sp5 = (sp / sp.shift(5) - 1); sp5q = sp5.rolling(250, min_periods=200).rank(pct=True)
sp5q = sp5q.shift(1).reindex(px.index, method="ffill")   # 미국 하루 늦게(아시아 시각)
D = pd.DataFrame({"u5": (r5f > 0).astype(float).where(r5f.notna()), "u1": (r1f > 0).astype(float).where(r1f.notna()),
                  "o5": own5, "s5q": sp5q})
# 발표 = 다음 달 첫 거래일 → 그날부터 다음 발표 전날까지 그 달 값
rel = {}
for m0 in q.index:
    d0 = m0 + pd.offsets.MonthBegin(1); idx = px.index[px.index >= d0]
    if len(idx) and (idx[0] - d0).days <= 6: rel[idx[0]] = q[m0]
R = pd.Series(rel).sort_index(); D["iq"] = R.reindex(D.index).ffill(limit=25)
D["first"] = D.index.isin(R.index)
D = D.dropna(subset=["o5", "s5q", "iq"])
o5q = D["o5"].rolling(250, min_periods=200).rank(pct=True)
D["base"] = np.where(o5q >= 0.7, "o+", np.where(o5q <= 0.3, "o-", "o0"))
D["base"] = D["base"] + np.where(D["s5q"] >= 0.9, "s+", np.where(D["s5q"] <= 0.1, "s-", "s0"))
D["hi"] = D["iq"] >= 0.7
mid = pd.Timestamp("2011-11-01")
def cell_stats(S, hz, tag):
    for nm, msk in [("상위30%", S.hi), ("하위30%", S.iq <= 0.3)]:
        a = S[msk & (S.index < mid)][hz].dropna(); b = S[msk & (S.index >= mid)][hz].dropna()
        ra = S[S.index < mid][hz].mean(); rb = S[S.index >= mid][hz].mean()
        print(f"[{tag}] {nm} {hz}: 앞 n{len(a)} {100*(a.mean()-ra):+.1f}%p · 뒤 n{len(b)} {100*(b.mean()-rb):+.1f}%p")
def walk(S, hz, N0=100, gap=5):
    """기존 칸(base) 위에 hi 칸 덧셈형: p = p_base + n/(n+N0)*(hi 날 잔차 평균)."""
    y = S[hz].values; base = S["base"].values; hi = S["hi"].values; out = {"b0": [], "b1": [], "d": []}
    for i in range(500, len(S)):
        if np.isnan(y[i]): continue
        j = i - gap; py = y[:j]; ok = ~np.isnan(py); p0 = py[ok].mean()
        cb = ok & (base[:j] == base[i]); nb = cb.sum(); pb = p0 + nb / (nb + N0) * (py[cb].mean() - p0) if nb else p0
        p = pb
        if hi[i]:
            # 잔차 = 과거 hi 날의 결과 − 그날의 base 확률(근사: 그 칸 평균)
            m = ok & hi[:j]
            if m.sum():
                bm = pd.Series(py[ok]).groupby(base[:j][ok]).mean().to_dict()
                res = py[m] - np.array([bm.get(k, p0) for k in base[:j][m]]); n = m.sum()
                p = pb + n / (n + N0) * res.mean()
        out["b0"].append((pb - y[i]) ** 2); out["b1"].append((p - y[i]) ** 2); out["d"].append(S.index[i])
    d = pd.Series(out["d"]); b0 = np.array(out["b0"]); b1 = np.array(out["b1"])
    def seg(m): return f"{b0[m].mean():.5f}→{b1[m].mean():.5f}"
    a = (d < mid).values; c = (d >= pd.Timestamp("2021-11-01")).values
    return f"걸어가기 앞 {seg(a)} 뒤 {seg(~a)} 최근5년 {seg(c)}"
def cross(S, hz):
    from sklearn.linear_model import LogisticRegression
    X0 = pd.get_dummies(S["base"]).astype(float); X1 = X0.copy(); X1["hi"] = S["hi"].astype(float)
    y = S[hz]; ok = y.notna(); A = ok & (S.index < mid); B = ok & (S.index >= mid); res = []
    for tr, te in [(A, B), (B, A)]:
        bs = []
        for X in (X0, X1):
            m = LogisticRegression(C=1.0, max_iter=500).fit(X[tr], y[tr]); p = m.predict_proba(X[te])[:, 1]
            bs.append(((p - y[te]) ** 2).mean())
        res.append(f"{bs[0]:.5f}→{bs[1]:.5f}")
    return "교차 앞→뒤 " + res[0] + " · 뒤→앞 " + res[1]
print(f"날 수 {len(D)} {D.index[0].date()}~{D.index[-1].date()} · 기준 {mid.date()}")
F1 = D[D["first"]]
for tag, S in [("발표일만", F1), ("월 전체 5일 간격", D.iloc[::5]), ("월 전체 모든 날", D)]:
    for hz in ["u5", "u1"]:
        cell_stats(S, hz, tag)
        gap = 5 if hz == "u5" else 1
        if tag == "발표일만": gap = 1
        try: print(f"   {tag} {hz} · {walk(S, hz, gap=gap)} · {cross(S, hz)}")
        except Exception as e: print("   오류", e)
for k in range(5):
    S = D.iloc[k::5]; cell_stats(S, "u5", f"시작점{k}")
print("지금", D.tail(3)[["iq", "base", "hi"]].to_string())
