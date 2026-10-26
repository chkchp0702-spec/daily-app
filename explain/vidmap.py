"""video-out 의 spots.json → 앱의 vidmap.js (window.VIDC: 「화면|제목키」 → 파일 이름).  사용: python vidmap.py <spots.json> <vid 폴더> <버전>"""
import json, os, sys
sp = json.load(open(sys.argv[1])); vd = sys.argv[2]; ver = sys.argv[3]
m = {v["key"]: nm for nm, v in sp.items() if os.path.exists(f"{vd}/{nm}.mp4")}
m["_v"] = ver
out = "// 자동 생성(explain/vidmap.py) — 조이 설명 영상 목록: 「화면|제목키」 → vid/<파일>.mp4  (" + str(len(m) - 1) + "개)\nwindow.VIDC = " + json.dumps(m, ensure_ascii=False, indent=0) + ";\n"
open(f"{vd}/../vidmap.js", "w", encoding="utf8").write(out)
print(len(m) - 1, "항목")
