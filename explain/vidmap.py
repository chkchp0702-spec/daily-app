"""video-out 의 spots.json → 앱의 vidmap.js (window.VIDC: 「화면|제목키」 → 파일 이름).  사용: python vidmap.py <spots.json> <vid 폴더> <버전>"""
import json, os, sys
sp = json.load(open(sys.argv[1])); vd = sys.argv[2]; ver = sys.argv[3]
import re
def norm(t):
    t = re.sub(r"[\s\d·:%,.()\[\]~\-–—+/…?!「」『』()−▲▼△▽›‹]", "", t or "")
    return re.sub(r"(미국|한국|일본|중국|홍콩)시장은어느(국면|장분위기)인가", "", t).lower()[:24]
# 🗣 10/28 쉬운 말 → 옛 말 (앱 easy.js 의 TERMB 와 같게)
TERMB = [("큰손", "고래"), ("장 분위기판", "국면 신호판"), ("장 분위기", "국면"), ("시장 흐름", "나침반"), ("오를 확률", "시장확률"), ("자동 분석 전망", "두뇌 논지"), ("자동 분석", "두뇌"), ("기본 틀", "뼈대"), ("비용 뺀", "정직"),
         ("예측", "예고"), ("제자리", "횡보"), ("공격 포트", "킥 포트"), ("종목 찾기", "거르기"), ("컵 차트", "컵"), ("갭 상승", "갭"), ("조용히 사 모으기", "조용한 매집"), ("사 모으기", "매집"), ("흔들림 조절", "변동성 맞춤"), ("출렁임", "변동성"), ("맞힌 비율", "적중률"), ("사례", "표본"), ("하락폭", "낙폭")]
def back(t):
    t = t or ""
    for a, b in TERMB: t = t.replace(a, b)
    return t
m = {}
for nm, v in sp.items():         # 같은 키는 먼저 나온 것(카드 머리)을 씀
    if os.path.exists(f"{vd}/{nm}.mp4") and not (v["kind"] in ("tip", "td") and re.search(r"[\d%]", v["title"])):
        m.setdefault(v["key"].split("|")[0] + "|" + norm(v["title"]), nm)
        m.setdefault(v["key"].split("|")[0] + "|" + norm(back(v["title"])), nm)   # 🗣 10/28 쉬운 말을 끈 화면(옛 제목)에서도 찾게
m["_v"] = ver
out = "// 자동 생성(explain/vidmap.py) — 조이 설명 영상 목록: 「화면|제목키」 → vid/<파일>.mp4  (" + str(len(m) - 1) + "개)\nwindow.VIDC = " + json.dumps(m, ensure_ascii=False, indent=0) + ";\n"
open(f"{vd}/../vidmap.js", "w", encoding="utf8").write(out)
print(len(m) - 1, "항목")
