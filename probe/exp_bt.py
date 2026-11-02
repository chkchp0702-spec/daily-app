"""#54 한국 수출 증가율(전년 같은 달 대비) → 5개 시장 다음 날·5일 — 확률 보강 일지 11/2 13시 (Actions)
자료: e-나라지표 수출입 동향 https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066 (산업부·관세청 월별, 1995~) 페이지 안 jsondata.
공표 시차: M월 값은 M+1월 1일 발표 → M+1월 1일(첫 거래일)부터 사용. 열흘 잠정치는 관세청 게시판(customs.go.kr bbsId=1362) 본문뿐이라 이번엔 월별로.
특성 Y = 수출 전년 대비(%) · A = Y 의 3개월 변화(가속). 1년(12개월) 아닌 전 기간 걸어가는 백분위로 ≥80·≤20 꼬리 → 기존(달러·S&P 5일 꼬리) 위 브라이어 앞/뒤·최근5년 + 교차."""
import json, sys, os, re, html, urllib.request
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x
H_ = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u, t=60):
    return urllib.request.urlopen(urllib.request.Request(u, headers=H_), timeout=t).read().decode("utf-8", "ignore")

# 관세청 게시판 열흘 자료 제목 (다음 시간용)
try:
    t = get("https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?mi=2891&bbsId=1362&currPage=2")
    s = re.sub(r"<[^>]+>", " ", t); s = re.sub(r"\s+", " ", s)
    print("관세청 게시판 2쪽:", re.findall(r".{0,20}수출입 현황.{0,40}", s)[:12])
    print("링크 예:", re.findall(r"selectNttInfo\.do[^\"'\s]*", t)[:3], re.findall(r"fn_\w+\([^)]*\)", t)[:5])
except Exception as e:
    print("게시판 실패", e)

t = get("https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066")
for m in list(re.finditer(r"jsondata", t))[:6]:
    print("…", t[max(0, m.start() - 150): m.start() + 400].replace("\n", " "))
cands = re.findall(r"(\[\s*\{.*?\}\s*\])", html.unescape(t), re.S)
print("JSON 배열 후보", len(cands), [len(c) for c in cands][:10])
rows = None
for c in sorted(cands, key=len, reverse=True)[:5]:
    try:
        j = json.loads(c); print("키", list(j[0].keys())[:20], "행", len(j)); print(json.dumps(j[:3], ensure_ascii=False)[:800]); rows = rows or j
    except Exception as e:
        print("parse 실패", repr(e)[:80], c[:200])
# 표 HTML 로 들어있으면
tabs = re.findall(r"<table.*?</table>", t, re.S)
print("표", len(tabs))
for tb in tabs[:3]:
    s = re.sub(r"<[^>]+>", "|", tb); s = re.sub(r"\|\s*\|+", "|", re.sub(r"\s+", " ", s)); print("표:", s[:1200])
print("끝(구조 확인용)")
