"""#54 이어서 (11/2 14시) — 관세청 게시판 쪽 넘기며 수출입 현황 글 모으기 · 나라지표 iframe/엑셀 주소 보기"""
import re, html, json, urllib.request, urllib.parse, time
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, data=None, t=40):
    if data is not None: data = urllib.parse.urlencode(data).encode()
    return urllib.request.urlopen(urllib.request.Request(u, data=data, headers=H_), timeout=t).read().decode("utf-8", "ignore")
def txt(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(t)))
B = "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?mi=2891&bbsId=1362&currPage=%d"
t = get(B % 1)
i = t.find("수출입 현황")
print("1쪽 수출입 현황 주변 HTML:", t[max(0, i-900): i+200].replace("\n", " "))
print("총 쪽?", re.findall(r"currPage=(\d+)", t)[-5:], re.findall(r"총\s*[\d,]+\s*건", txt(t))[:2])
posts = []
for p in range(1, 61):
    try: t = get(B % p)
    except Exception as e: print("쪽", p, "실패", e); break
    rows = re.findall(r"<tr.*?</tr>", t, re.S)
    got = 0
    for r in rows:
        s = txt(r)
        if "수출" not in s: continue
        sn = re.findall(r"nttSn[=\"',:\s]*(\d+)", r) or re.findall(r"fn_\w+\(\s*'?(\d+)", r)
        d = re.findall(r"20\d\d[.-]\d\d[.-]\d\d", s)
        posts.append((s[:90], sn[:1], d[:1])); got += 1
    if got == 0 and p > 3: print("쪽", p, "수출 글 0 → 멈춤"); break
    time.sleep(0.3)
print("모은 글", len(posts))
for x in posts[:8] + posts[-8:]: print(x)
ten = [x for x in posts if re.search(r"1일\s*~", x[0])]
print("열흘·스무날 글", len(ten), "가장 옛날", ten[-1] if ten else None)
# 본문 하나 보기
if posts and posts[0][1]:
    for u in ["https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?mi=2891&bbsId=1362&nttSn=%s" % posts[0][1][0]]:
        try:
            b = txt(get(u)); i = b.find("수출")
            print("본문:", b[i-100:i+900])
        except Exception as e: print("본문 실패", e)
# 나라지표 iframe / 엑셀
t = get("https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066")
for k in ["showStblGams", "IntgrIdxExcelDown", "iframe", "stts_cd", "statsCd"]:
    for m in list(re.finditer(k, t))[:2]:
        print("[", k, "]", t[max(0, m.start()-200): m.start()+300].replace("\n", " "))
