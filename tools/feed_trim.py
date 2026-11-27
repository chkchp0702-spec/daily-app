"""🧠 11/27 두뇌용 피드 줄이기 — 서버 my_feed.json(약 1MB, 15분마다 바뀜)을 최근 36시간 글만 남겨 archive/mb/feeds/my_feed_recent.json 로
   (전체를 GitHub 에 매시간 올리면 저장소가 금방 불어나서)   사용: python3 tools/feed_trim.py <원본> <결과>"""
import json, sys, datetime as dt
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf-8"))
now = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None) + dt.timedelta(hours=9)
cut = (now - dt.timedelta(hours=36)).strftime("%Y-%m-%d %H:%M")
items = [x for x in d.get("items", []) if str(x.get("first") or x.get("at") or "") >= cut]
for x in items:
    if isinstance(x.get("text"), str) and len(x["text"]) > 1500: x["text"] = x["text"][:1500] + "…"
out = {"at": d.get("at"), "trim": f"최근 36시간 · {len(items)}/{len(d.get('items', []))}개 · 본문 1500자까지", "sources": d.get("sources"), "new": d.get("new"), "items": items}
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("feed_trim:", len(items), "개")
