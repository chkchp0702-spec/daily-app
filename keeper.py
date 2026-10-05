"""
⏰ 지킴이 — GitHub 예약 실행(schedule)이 자주 빠지거나 몇 시간 늦어서, 하루를 4교대로 나눠
   한 번 켜지면 그 교대 시간(약 6시간) 동안 깨어 있으면서 정해진 시각에 워크플로를 직접 돌린다.
   - 같은 워크플로가 최근 N분 안에 이미 돌았으면(원래 예약이 제때 돈 경우) 건너뛴다.
   - 같은 교대의 지킴이가 이미 돌고 있으면 바로 끝낸다.
   python keeper.py            (keeper.yml)
"""
import datetime as dt
import json
import os
import sys
import time
import urllib.request

KST = dt.timezone(dt.timedelta(hours=9))
REPO = os.environ.get("GITHUB_REPOSITORY", "chkchp0702-spec/daily-app")
TOKEN = os.environ.get("GH_TOKEN", "")
RUN_ID = os.environ.get("GITHUB_RUN_ID", "")
API = "https://api.github.com/repos/" + REPO

# (KST 시각, 워크플로, 평일만?, 입력, 최근 몇 분 안에 돌았으면 건너뛰기)
JOBS = [("05:47", "opprice.yml", False, None, 120), ("06:27", "opprice.yml", False, None, 120),
        ("07:23", "collect.yml", False, None, 12), ("07:40", "collect.yml", False, None, 12), ("07:50", "regime.yml", False, None, 60),
        ("08:05", "collect.yml", False, None, 12), ("08:35", "collect.yml", False, None, 12), ("09:25", "collect.yml", False, None, 12),
        ("09:43", "collect.yml", False, None, 12), ("15:13", "collect.yml", False, None, 12), ("16:33", "collect.yml", False, None, 12),
        ("16:20", "opprice.yml", True, None, 60), ("17:10", "regime.yml", True, None, 60), ("21:53", "collect.yml", False, None, 12),
        ("20:17", "watch.yml", False, None, 20)]
JOBS += [(f"{h:02d}:{m:02d}", "live.yml", True, None, 10) for h in range(9, 18) for m in (5, 35)]
JOBS += [(f"{h:02d}:35", "watch.yml", True, None, 20) for h in range(9, 16)]
JOBS += [(f"{h:02d}:47", "watch.yml", True, None, 20) for h in (22, 23, 0, 1, 2, 3, 4, 5)]
# 교대: [시작, 끝) KST 시
SHIFTS = [(5, 11), (11, 17), (17, 23), (23, 29)]


def api(path, method="GET", body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": "Bearer " + TOKEN, "Accept": "application/vnd.github+json", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        t = r.read()
    return json.loads(t) if t else {}


def log(*a):
    print(dt.datetime.now(KST).strftime("%H:%M:%S"), *a, flush=True)


def recent(wf, minutes):
    try:
        runs = api(f"/actions/workflows/{wf}/runs?per_page=3").get("workflow_runs", [])
    except Exception as e:
        log("조회 실패", wf, e)
        return False
    now = dt.datetime.now(dt.timezone.utc)
    for r in runs:
        t = dt.datetime.fromisoformat(r["created_at"].replace("Z", "+00:00"))
        if (now - t).total_seconds() < minutes * 60:
            return True
    return False


def other_keeper(shift_start):
    """같은 교대의 다른 지킴이가 이미 돌고 있나"""
    try:
        runs = api("/actions/workflows/keeper.yml/runs?status=in_progress&per_page=10").get("workflow_runs", [])
    except Exception:
        return False
    for r in runs:
        if str(r["id"]) == RUN_ID:
            continue
        t = dt.datetime.fromisoformat(r["created_at"].replace("Z", "+00:00")).astimezone(KST)
        h = t.hour + (24 if t.hour < 5 else 0)
        if shift_start <= h < shift_start + 6:
            return True
    return False


def main():
    now = dt.datetime.now(KST)
    h = now.hour + (24 if now.hour < 5 else 0)
    sh = next(((a, b) for a, b in SHIFTS if a <= h < b), None)
    if not sh:
        log("교대 시간 아님")
        return
    if other_keeper(sh[0]):
        log("같은 교대 지킴이가 이미 돌고 있음 — 끝")
        return
    base = (now - dt.timedelta(days=1 if now.hour < 5 else 0)).replace(hour=0, minute=0, second=0, microsecond=0)
    todo = []
    for hm, wf, wk, inp, skip in JOBS:
        hh, mm = map(int, hm.split(":"))
        hx = hh + (24 if hh < 5 else 0)
        if not (sh[0] <= hx < sh[1]):
            continue
        at = base + dt.timedelta(hours=hx, minutes=mm)
        if wk and at.weekday() >= 5:
            continue
        if at < now - dt.timedelta(minutes=20):        # 20분 넘게 지난 건 건너뜀 (늦게 켜진 경우)
            continue
        todo.append((at, wf, inp, skip))
    todo.sort()
    log(f"교대 {sh[0]}~{sh[1]}시 · 할 일 {len(todo)}개")
    end = base + dt.timedelta(hours=sh[1])
    for at, wf, inp, skip in todo:
        wait = (at - dt.datetime.now(KST)).total_seconds()
        if wait > 0:
            if dt.datetime.now(KST) + dt.timedelta(seconds=wait) > end + dt.timedelta(minutes=5):
                break
            time.sleep(wait)
        if recent(wf, skip):
            log("이미 돌았음 ·", at.strftime("%H:%M"), wf)
            continue
        try:
            api(f"/actions/workflows/{wf}/dispatches", "POST", {"ref": "main", **({"inputs": inp} if inp else {})})
            log("실행 ·", at.strftime("%H:%M"), wf)
        except Exception as e:
            log("실행 실패", wf, e)
    log("교대 끝")


if __name__ == "__main__":
    main()
