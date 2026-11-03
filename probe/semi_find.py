"""#57 반도체 수출 찾기 3 (임시) — 월별 표 있는지."""
import re, html, urllib.request
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, t=40):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=H_), timeout=t); return r.status, r.read().decode("utf-8", "ignore")
    except Exception as e: return str(e)[:80], ""
def txt(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(t))).strip()
st, s = get("https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=A0002")
for m in re.finditer(r"반도체 수출 현황|freq|stblGams|selectFreq|주기", s):
    print("RAW:", re.sub(r"\s+", " ", s[max(0, m.start()-250): m.end()+150])[:400])
for sc in ["A000201", "A000202", "A000203", "A000204"]:
    for fq, per in [("M", "200001:202610"), ("M", "2000.01:2026.10"), ("Q", "200001:202604"), ("H", "200001:202602")]:
        u = f"https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd={sc}&idx_cd=A0002&freq={fq}&period={per}"
        st, s2 = get(u); rows = re.findall(r"<tr.*?</tr>", s2, re.S)
        print("##", sc, fq, per, st, len(s2), "행", len(rows), [txt(r)[:70] for r in rows][:4])
