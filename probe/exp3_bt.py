"""#54 (11/2 14시) 나라지표 월별 수출 전년비 → 발표 첫 거래일 코스피 다음 날·5일. 관세청 게시판은 2026-03~ 뿐(열흘 글 16개)이라 월별로.
iframe: https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd=<코드>&idx_cd=1066&freq=M&period=시작:끝"""
import re, html, urllib.request, urllib.parse
import numpy as np, pandas as pd, yfinance as yf
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, data=None, t=60):
    if data is not None: data = urllib.parse.urlencode(data).encode()
    return urllib.request.urlopen(urllib.request.Request(u, data=data, headers=H_), timeout=t).read().decode("utf-8", "ignore")
def txt(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(t)))
B = "https://www.index.go.kr"
t = get(B + "/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066")
codes = sorted(set(re.findall(r"(106\d{3,4})", t)))
print("stts 후보", codes[:20])
for m in list(re.finditer(r"sttsCd\s*=", t))[:3]: print("…", t[m.start():m.start()+120].replace("\n", " "))
tab = None
for c in codes[:8]:
    for per in ["199501:202610", "200001:202610", ""]:
        u = B + f"/unity/potal/eNara/sub/showStblGams3.do?stts_cd={c}&idx_cd=1066&freq=M&period={per}"
        try: s = get(u)
        except Exception as e: print(c, per, "실패", e); continue
        ths = re.findall(r"(?:19|20)\d\d\.?\s?\d\d", txt(s))
        print(c, per, "길이", len(s), "날짜칸", len(ths), ths[:3], ths[-3:])
        if len(ths) > 100 and tab is None: tab = (c, per, s)
    if tab: break
if not tab: print("표 못 얻음"); raise SystemExit
c, per, s = tab
rows = re.findall(r"<tr.*?</tr>", s, re.S)
print("행", len(rows))
for r in rows[:6]: print("행:", txt(r)[:400])
# 행이 항목별(가로 = 기간)인 꼴 가정: 머리 행에서 기간, 「수출」+「증감률」 행에서 값
head = None; val = None
for r in rows:
    cells = [txt(x).strip() for x in re.findall(r"<t[hd][^>]*>.*?</t[hd]>", r, re.S)]
    if head is None and sum(bool(re.match(r"(19|20)\d\d", x)) for x in cells) > 50: head = cells
    lab = " ".join(cells[:3])
    if val is None and "수출" in lab and ("증감" in lab or "%" in lab or "률" in lab): val = cells; print("값 행 이름", lab)
if head is None or val is None:
    print("가로꼴 아님 — 머리", head and head[:5], "값", val and val[:5]); raise SystemExit
k = len(head) - len(val)
ser = {}
for h, v in zip(head[max(k,0):], val[max(-k,0):]):
    m = re.match(r"((?:19|20)\d\d)\.?\s?(\d\d)", h)
    try: ser[(int(m.group(1)), int(m.group(2)))] = float(v.replace(",", ""))
    except Exception: pass
print("월 수", len(ser), list(ser.items())[:2], list(ser.items())[-3:])
px = yf.download("^KS11", start="1996-01-01", progress=False, auto_adjust=True)["Close"].squeeze().dropna()
r1 = (px.shift(-1) / px - 1); r5 = (px.shift(-5) / px - 1)
ev = []
for (y, mth), v in sorted(ser.items()):
    ny, nm = (y + 1, 1) if mth == 12 else (y, mth + 1)
    d0 = pd.Timestamp(ny, nm, 1); idx = px.index[px.index >= d0]
    if len(idx) == 0 or (idx[0] - d0).days > 6: continue
    d = idx[0]
    if pd.isna(r1.get(d)) : continue
    ev.append((d, v, r1[d] > 0, (r5[d] > 0) if not pd.isna(r5.get(d)) else np.nan))
E = pd.DataFrame(ev, columns=["d", "yoy", "u1", "u5"]).set_index("d")
E["chg"] = E["yoy"].diff(3)
print("발표일 표본", len(E), E.index[0].date(), E.index[-1].date())
base1 = (r1.dropna() > 0).mean(); base5 = (r5.dropna() > 0).mean()
print(f"평소 다음 날 {base1:.3f} · 5일 {base5:.3f} · 발표일 전체 다음 날 {E.u1.mean():.3f} · 5일 {E.u5.mean():.3f}")
mid = E.index[len(E)//2]
for col in ["yoy", "chg"]:
    x = E[col]; q = x.expanding(36).rank(pct=True)
    for nm, msk in [("상위30%", q >= 0.7), ("하위30%", q <= 0.3), ("플러스", x > 0) if col == "yoy" else ("가속", x > 0)]:
        for hz in ["u1", "u5"]:
            a = E[msk & (E.index < mid)][hz].dropna(); b = E[msk & (E.index >= mid)][hz].dropna()
            ra = E[(E.index < mid)][hz].mean(); rb = E[(E.index >= mid)][hz].mean()
            print(f"{col} {nm} {hz}: 앞 n{len(a)} {a.mean():.3f}(발표일 평균 {ra:.3f}, 차 {100*(a.mean()-ra):+.1f}%p) · 뒤 n{len(b)} {b.mean():.3f}(평균 {rb:.3f}, 차 {100*(b.mean()-rb):+.1f}%p)")
print("지금", E.tail(3))
