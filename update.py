import json, datetime
now = datetime.datetime.utcnow() + datetime.timedelta(hours=9)
data = {
    "updated": now.strftime("%Y-%m-%d %H:%M"),
    "message": f"{now.month}월 {now.day}일 자료입니다"
}
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)
