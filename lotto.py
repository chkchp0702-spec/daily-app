#!/usr/bin/env python3
"""CH Investing — 🎱 로또 당첨 번호 모으기 (10/29 사용자: 「이제까지 우리나라 로또 당첨 번호 다 조사해서 조합 만들기」)
① 1순위: 공개 정리본(smok95/lotto · 매주 토요일 21시 갱신 · 1회부터 전체, 등수별 당첨자·당첨금·판매액·1등 자동/수동 수까지)
② 2순위: 동행복권 공식 JSON(common.do?method=getLottoNumber&drwNo=N) — ①에 없는 최신 회차만 보충 (해외 IP 차단 때는 그냥 건너뜀)
→ archive/x/lotto.json. 앱(lotto.js)은 이 파일만 읽음. 「겹침 배수」(사람들이 얼마나 같은 조합을 찍었나) 계산용으로 판매액·1등 인원·수동 인원이 핵심.
"""
import json, os, time, urllib.request

OUT = "archive/x/lotto.json"
SRC = "https://raw.githubusercontent.com/smok95/lotto/master/results/all.json"
API = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={}"
HDR = {"User-Agent": "Mozilla/5.0 (CH Investing lotto collector)", "Accept": "application/json"}


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def from_public(x):
    dv = x.get("divisions") or []
    def g(i, k):
        try:
            return int((dv[i] or {}).get(k, 0) or 0)
        except Exception:
            return 0
    wc = x.get("winners_combination") or {}
    return {"n": x["draw_no"], "d": x["date"][:10], "w": sorted(x["numbers"]), "b": x["bonus_no"],
            "c1": g(0, "winners"), "p1": g(0, "prize"), "c2": g(1, "winners"), "p2": g(1, "prize"), "c3": g(2, "winners"), "p3": g(2, "prize"),
            "c4": g(3, "winners"), "c5": g(4, "winners"), "sales": int(x.get("total_sales_amount") or 0),
            "auto": wc.get("auto"), "semi": wc.get("semi_auto"), "manual": wc.get("manual")}


def from_official(j):
    return {"n": j["drwNo"], "d": j["drwNoDate"], "w": sorted([j["drwtNo%d" % i] for i in range(1, 7)]), "b": j["bnusNo"],
            "c1": j.get("firstPrzwnerCo", 0), "p1": j.get("firstWinamnt", 0), "sales": j.get("totSellamnt", 0)}


def main():
    data = {"updated": "", "draws": []}
    if os.path.exists(OUT):
        try:
            data = json.load(open(OUT, encoding="utf-8"))
        except Exception:
            pass
    by = {d["n"]: d for d in data["draws"]}
    # ① 공개 정리본 전체 (있는 회차는 더 자세한 쪽으로 덮어씀)
    try:
        pub = fetch(SRC)
        for x in pub:
            try:
                r = from_public(x)
                if r["n"] not in by or "c2" not in by[r["n"]]:
                    by[r["n"]] = r
            except Exception:
                pass
        print("public:", len(pub))
    except Exception as ex:
        print("public fail:", ex)
    # ② 공식 API로 최신 회차 보충 (막히면 건너뜀)
    n = (max(by) + 1) if by else 1
    miss = 0
    while miss < 2 and n < 5000:
        try:
            j = fetch(API.format(n), 15)
        except Exception as ex:
            print("official stop:", n, ex); break
        if j.get("returnValue") != "success":
            miss += 1; n += 1; continue
        by[n] = from_official(j); miss = 0; n += 1; time.sleep(0.2)
    data["draws"] = [by[k] for k in sorted(by)]
    data["updated"] = time.strftime("%Y-%m-%d %H:%M", time.gmtime(time.time() + 9 * 3600))
    data["count"] = len(data["draws"])
    data["latest"] = data["draws"][-1]["n"] if data["draws"] else 0
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("lotto: %d회차 (최신 %s)" % (data["count"], data["latest"]))


if __name__ == "__main__":
    main()
