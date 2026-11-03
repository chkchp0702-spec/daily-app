"""#57 반도체 수출 자료 찾기 (임시)."""
import re, html, urllib.request, urllib.parse
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, t=40, data=None):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=H_, data=data), timeout=t); return r.status, r.read().decode("utf-8", "ignore")
    except Exception as e: return str(e)[:80], ""
def txt(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(t))).strip()
kw = urllib.parse.quote("반도체 수출")
for u in ["https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066",
          f"https://www.index.go.kr/unity/potal/search/search.do?query={kw}",
          f"https://www.index.go.kr/unity/potal/search/totalSearch.do?searchWord={kw}",
          f"https://www.index.go.kr/unity/potal/search/search.do?searchKeyword={kw}",
          "https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1155",
          "https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1342",
          "https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=2808",
          "https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1236"]:
    st, s = get(u); t = re.search(r"<title>(.*?)</title>", s, re.S)
    print("\n==", st, u, "|", txt(t.group(1)) if t else "", len(s))
    for m in set(re.findall(r"stts_cd=(\d+)", s)): print("  stts_cd", m)
    for m in re.finditer(r"반도체", s):
        seg = s[max(0, m.start()-300): m.end()+200]
        ids = re.findall(r"idx_cd[=\"':\s]+(\d{3,5})", seg)
        print("  반도체 →", ids[:5], txt(seg)[:160]); 
        if len(ids) > 30: break
# 1066 의 다른 stts_cd 표 머리 보기
for sc in ["106601", "106602", "106603", "106604", "106605", "106606"]:
    st, s = get(f"https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd={sc}&idx_cd=1066&freq=M&period=202401:202610")
    labs = [txt(r)[:60] for r in re.findall(r"<tr.*?</tr>", s, re.S)][:12]
    print("\n## 1066", sc, st, len(s), labs)
# 산업부 ICT 수출 (idx 후보)
for ic in ["1155", "1342", "2808", "1236", "1158", "1340", "1341"]:
    st, s = get(f"https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd={ic}01&idx_cd={ic}&freq=M&period=202401:202610")
    labs = [txt(r)[:50] for r in re.findall(r"<tr.*?</tr>", s, re.S)][:8]
    print("## idx", ic, st, len(s), labs)
