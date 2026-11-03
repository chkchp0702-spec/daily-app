"""#57 반도체 수출 자료 찾기 2 (임시) — 지표누리 A0002 반도체 산업 동향."""
import re, html, urllib.request
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, t=40):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=H_), timeout=t); return r.status, r.read().decode("utf-8", "ignore")
    except Exception as e: return str(e)[:80], ""
def txt(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(t))).strip()
for ic in ["A0002", "A0003"]:
    st, s = get(f"https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd={ic}")
    print("==", ic, st, len(s))
    print("  stts:", sorted(set(re.findall(r"stts_cd[=\"':\s]+([A-Z0-9]+)", s))))
    print("  src:", sorted(set(re.findall(r"(showStbl\w+\.do[^\"'\s<>]*)", s)))[:10])
    for m in re.finditer(r"수출", s):
        print("   ·", txt(s[max(0, m.start()-120): m.end()+120])[:200])
    import itertools
cands = []
for ic in ["A0002"]:
    for k in range(1, 7):
        sc = f"{ic}0{k}"
        for fq in ["M", "Q", "Y"]:
            u = f"https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd={sc}&idx_cd={ic}&freq={fq}&period=199001:202612"
            st, s = get(u); rows = re.findall(r"<tr.*?</tr>", s, re.S)
            if rows:
                labs = [txt(r)[:90] for r in rows][:10]
                print("##", sc, fq, st, len(s), "행", len(rows)); [print("    ", l) for l in labs]
                hdr = re.findall(r"((?:19|20)\d\d\.?\s?\d\d월?)", s); print("    기간", hdr[:2], hdr[-2:], len(hdr))
                break
