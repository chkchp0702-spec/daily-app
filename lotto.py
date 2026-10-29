#!/usr/bin/env python3
"""CH Investing — 🎱 로또 당첨 번호 모으기 (10/29 사용자: 「이제까지 우리나라 로또 당첨 번호 다 조사해서 조합 만들기」)
동행복권 공식 JSON(common.do?method=getLottoNumber&drwNo=N)을 1회부터 최신 회차까지 받아 archive/x/lotto.json 에 누적한다.
이미 받은 회차는 다시 안 받고, 새 회차만 이어 붙인다(매주 토요일 추첨 뒤). GitHub Actions 가 돌리고, 앱(lotto.js)은 이 파일만 읽는다.
저장 내용: 회차 · 날짜 · 번호 6 · 보너스 · 1등 당첨자 수 · 1등 1인당 당첨금 · 총 판매액 (사람들이 「얼마나 겹쳐 찍었나」 분석용)
"""
import json, os, sys, time, urllib.request

OUT = "archive/x/lotto.json"
API = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={}"
HDR = {"User-Agent": "Mozilla/5.0 (CH Investing lotto collector)", "Accept": "application/json"}


def get(n, tries=3):
    for t in range(tries):
        try:
            req = urllib.request.Request(API.format(n), headers=HDR)
            with urllib.request.urlopen(req, timeout=15) as r:
                j = json.loads(r.read().decode("utf-8"))
            if j.get("returnValue") == "success":
                return j
            if j.get("returnValue") == "fail":
                return None           # 아직 없는 회차
        except Exception as e:  # noqa
            time.sleep(1.5 * (t + 1))
    return "err"


def row(j):
    return {
        "n": j["drwNo"], "d": j["drwNoDate"],
        "w": [j["drwtNo1"], j["drwtNo2"], j["drwtNo3"], j["drwtNo4"], j["drwtNo5"], j["drwtNo6"]],
        "b": j["bnusNo"], "c1": j.get("firstPrzwnerCo", 0), "p1": j.get("firstWinamnt", 0), "sales": j.get("totSellamnt", 0),
    }


def main():
    data = {"updated": "", "draws": []}
    if os.path.exists(OUT):
        try:
            data = json.load(open(OUT, encoding="utf-8"))
        except Exception:
            pass
    have = {d["n"] for d in data["draws"]}
    n = (max(have) + 1) if have else 1
    added, miss = 0, 0
    while True:
        j = get(n)
        if j is None:
            miss += 1
            if miss >= 2:          # 두 회차 연속 없음 → 끝
                break
            n += 1
            continue
        if j == "err":
            print("err", n); break
        miss = 0
        data["draws"].append(row(j)); have.add(n); added += 1
        if added % 100 == 0:
            print("…", n, flush=True)
        n += 1
        time.sleep(0.12)
    data["draws"].sort(key=lambda x: x["n"])
    data["updated"] = time.strftime("%Y-%m-%d %H:%M", time.gmtime(time.time() + 9 * 3600))
    data["count"] = len(data["draws"])
    data["latest"] = data["draws"][-1]["n"] if data["draws"] else 0
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("lotto: +%d → %d회차 (최신 %s)" % (added, data["count"], data["latest"]))


if __name__ == "__main__":
    main()
