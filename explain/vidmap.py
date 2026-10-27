"""video-out 의 spots.json → 앱의 vidmap.js (window.VIDC: 「화면|제목키」 → 파일 이름).  사용: python vidmap.py <spots.json> <vid 폴더> <버전>"""
import json, os, sys
sp = json.load(open(sys.argv[1])); vd = sys.argv[2]; ver = sys.argv[3]
import re
def norm(t):
    t = re.sub(r"[\s\d·:%,.()\[\]~\-–—+/…?!「」『』()−▲▼△▽›‹]", "", t or "")
    return re.sub(r"(미국|한국|일본|중국|홍콩)시장은어느국면인가", "", t).lower()[:24]
m = {}
for nm, v in sp.items():         # 같은 키는 먼저 나온 것(카드 머리)을 씀
    if os.path.exists(f"{vd}/{nm}.mp4") and not (v["kind"] in ("tip", "td") and re.search(r"[\d%]", v["title"])):
        m.setdefault(v["key"].split("|")[0] + "|" + norm(v["title"]), nm)
m["_v"] = ver
out = "// 자동 생성(explain/vidmap.py) — 조이 설명 영상 목록: 「화면|제목키」 → vid/<파일>.mp4  (" + str(len(m) - 1) + "개)\nwindow.VIDC = " + json.dumps(m, ensure_ascii=False, indent=0) + ";\n"
open(f"{vd}/../vidmap.js", "w", encoding="utf8").write(out)
print(len(m) - 1, "항목")
