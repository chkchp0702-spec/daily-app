"""#56 (11/2 16시) 나라지표 표 106601 의 수입 증감률·무역수지 → 발표 첫 거래일 코스피 다음 날·5일.
iframe: https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd=106601&idx_cd=1066&freq=M&period=199501:202610"""
import re, html, urllib.request
import numpy as np, pandas as pd, yfinance as yf
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, t=60): return urllib.request.urlopen(urllib.request.Request(u, headers=H_), timeout=t).read().decode("utf-8", "ignore")
def txt(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(t))).strip()
s = get("https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd=106601&idx_cd=1066&freq=M&period=199501:202610")
rows = re.findall(r"<tr.*?</tr>", s, re.S)
head = None; tab = {}
for r in rows:
    cells = [txt(x) for x in re.findall(r"<t[hd][^>]*>.*?</t[hd]>", r, re.S)]
    if head is None and sum(bool(re.match(r"(19|20)\d\d", x)) for x in cells) > 50: head = cells; continue
    if head and len(cells) > 50:
        lab = " ".join(c for c in cells[:len(cells)-len([h for h in head if re.match(r'(19|20)\d\d', h)])] )
        print("행:", lab[:60], "| 값 끝", cells[-3:]); tab[lab] = cells
hd = [h for h in head if re.match(r"(19|20)\d\d", h)]
def ser(cells):
    v = cells[-len(hd):]; out = {}
    for h, x in zip(hd, v):
        m = re.match(r"((?:19|20)\d\d)\.?\s?(\d\d)", h)
        try: out[pd.Timestamp(int(m.group(1)), int(m.group(2)), 1)] = float(x.replace(",", ""))
        except Exception: pass
    return pd.Series(out).sort_index()
labs = list(tab)
def pick(*keys, excl=()):
    for l in labs:
        if all(k in l for k in keys) and not any(e in l for e in excl): return ser(tab[l]), l
    return None, None
imp_y, l1 = pick("수입", "증감"); imp_a, l2 = pick("수입", excl=("증감",)); exp_a, l3 = pick("수출", excl=("증감",)); bal, l4 = pick("수지")
print("고른 행:", l1, "|", l2, "|", l3, "|", l4)
if bal is None and imp_a is not None and exp_a is not None: bal = exp_a - imp_a; print("무역수지 = 수출−수입 금액")
if imp_y is None and imp_a is not None: imp_y = (imp_a / imp_a.shift(12) - 1) * 100; print("수입 증감률 = 금액 12개월 전 대비")
F = pd.DataFrame({"impy": imp_y, "bal": bal})
F["imp3"] = F["impy"].diff(3)                      # 수입 증감률 3개월 변화
F["bal12"] = F["bal"].rolling(12).sum()            # 12개월 누적 수지
F["balchg"] = F["bal12"].diff(3)                   # 누적 수지 3개월 변화
F["spread"] = (exp_a / exp_a.shift(12) - 1) * 100 - F["impy"] if exp_a is not None else np.nan  # 수출−수입 증감률 차
print("월 수", F.dropna(how="all").shape, F.tail(3).round(1).to_string())
px = yf.download("^KS11", start="1996-01-01", progress=False, auto_adjust=True)["Close"].squeeze().dropna()
r1 = px.shift(-1) / px - 1; r5 = px.shift(-5) / px - 1
ev = []
for m0, row in F.iterrows():
    d0 = m0 + pd.offsets.MonthBegin(1); idx = px.index[px.index >= d0]
    if len(idx) == 0 or (idx[0] - d0).days > 6 or pd.isna(r1.get(idx[0])): continue
    d = idx[0]; ev.append(dict(d=d, u1=float(r1[d] > 0), u5=float(r5[d] > 0) if not pd.isna(r5.get(d)) else np.nan, **row.to_dict()))
E = pd.DataFrame(ev).set_index("d"); mid = E.index[len(E) // 2]
print(f"발표일 {len(E)} {E.index[0].date()}~{E.index[-1].date()} · 기준 {mid.date()} · 평소 다음 날 {(r1.dropna()>0).mean():.3f} 5일 {(r5.dropna()>0).mean():.3f} · 발표일 다음 날 {E.u1.mean():.3f} 5일 {E.u5.mean():.3f}")
def wf(msk, hz, N0=100):
    """걸어가며 브라이어: 사전 = 지금까지 발표일 평균, 칸 날만 n/(n+N0) 로 당김."""
    y = E[hz].values; m = msk.values; b0 = []; b1 = []
    for i in range(36, len(E)):
        if np.isnan(y[i]): continue
        past = y[:i - (5 if hz == 'u5' else 1)]; pm = m[:i - (5 if hz == 'u5' else 1)]
        past_ok = ~np.isnan(past); p0 = past[past_ok].mean()
        p = p0
        if m[i]:
            c = past[past_ok & pm]; n = len(c)
            if n: p = p0 + n / (n + N0) * (c.mean() - p0)
        b0.append((p0 - y[i]) ** 2); b1.append((p - y[i]) ** 2)
    b0 = np.array(b0); b1 = np.array(b1); h = len(b0) // 2
    return f"브라이어 앞 {b0[:h].mean():.5f}→{b1[:h].mean():.5f} 뒤 {b0[h:].mean():.5f}→{b1[h:].mean():.5f}"
for col in ["impy", "imp3", "bal12", "balchg", "spread"]:
    x = E[col]
    if x.notna().sum() < 100: print(col, "자료 부족"); continue
    q = x.expanding(36).rank(pct=True)
    for nm, msk in [("상위30%", q >= 0.7), ("하위30%", q <= 0.3), ("양수", x > 0), ("음수", x < 0)]:
        for hz in ["u1", "u5"]:
            a = E[msk & (E.index < mid)][hz].dropna(); b = E[msk & (E.index >= mid)][hz].dropna()
            ra = E[E.index < mid][hz].mean(); rb = E[E.index >= mid][hz].mean()
            same = "같은쪽" if (a.mean() - ra) * (b.mean() - rb) > 0 else "엇갈림"
            print(f"{col} {nm} {hz}: 앞 n{len(a)} {100*(a.mean()-ra):+.1f}%p · 뒤 n{len(b)} {100*(b.mean()-rb):+.1f}%p · {same} · {wf(msk.fillna(False), hz)}")
print("지금", E.tail(2)[["impy", "imp3", "bal12", "balchg", "spread"]].round(1).to_string())
