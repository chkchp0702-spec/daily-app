"""🧲 국내 수급 (11/10 사용자 「국내 주식 수급 분석, 외국인·기관 집중 매수 종목 파악해서 그런 칸을」)
  · 코스피+코스닥 시총 상위 300 종목의 외국인·기관 순매수(하루·5일·20일, 금액)·연속 일수·외국인 보유율 변화
  · 시장 전체(코스피·코스닥) 외국인·기관·개인 하루 순매수 최근 20일
  · 사는 신호가 아님 — 10/28 「🐳 아시아 고래 연구」 10년 검증: 기관 따라 사기는 2021년 뒤 손해, 외국인은 약한 플러스.
    → 화면은 「누가 무엇을 사고 있나」(고객 대화·시황 재료)로만 보여 주고 그 사실을 같이 적음.
자료: 다음 금융 investor/days(종목·시장) · 네이버 시총 순위. 결과 archive/x/flow_kr.json (돈·AI 안 씀)"""
import json, os, re, sys, time, datetime as dt
from kr_whale import get

P = "archive/x/flow_kr.json"
KST = dt.timezone(dt.timedelta(hours=9))
NUNI = 300


def universe():
    out = []
    for mk in ("KOSPI", "KOSDAQ"):
        for pg in (1, 2, 3):
            j = get(f"https://m.stock.naver.com/api/stocks/marketValue/{mk}?page={pg}&pageSize=100", "https://m.stock.naver.com/")
            for s in j.get("stocks", []):
                cd, nm = s.get("itemCode", ""), s.get("stockName", "")
                if s.get("stockEndType") not in (None, "stock") or not re.fullmatch(r"\d{5}0", cd) or "스팩" in nm or "리츠" in nm:
                    continue
                mv = float(str(s.get("marketValue", "0")).replace(",", "") or 0)
                out.append((cd, nm, mk, mv))
    out.sort(key=lambda x: -x[3])
    return out[:NUNI]


def pick(row, *words, no=()):
    """필드 이름이 바뀌어도 찾게: words 가 모두 들어가고 no 는 안 들어간 첫 숫자 필드"""
    for k, v in row.items():
        lk = k.lower()
        if all(w in lk for w in words) and not any(x in lk for x in no) and isinstance(v, (int, float)):
            return v
    return None


def flows(cd):
    j = get(f"https://finance.daum.net/api/investor/days?symbolCode=A{cd}&page=1&perPage=25", f"https://finance.daum.net/quotes/A{cd}")
    rows = j.get("data") or []
    out = []
    for x in rows:
        out.append({"d": str(x.get("date", ""))[:10], "c": x.get("tradePrice"),
                    "f": pick(x, "foreign", "straightpurchasevolume", no=("cumul",)),
                    "i": pick(x, "institution", "straightpurchasevolume", no=("cumul",)),
                    "own": x.get("foreignOwnShares"), "rate": x.get("foreignOwnSharesRate")})
    return out, (sorted(rows[0].keys()) if rows else [])


def streak(vals):
    """가장 최근 날부터 같은 방향으로 이어진 날 수 (+사는 중 / −파는 중)"""
    if not vals or not vals[0]:
        return 0
    sg = 1 if vals[0] > 0 else -1
    n = 0
    for v in vals:
        if v and (v > 0) == (sg > 0):
            n += 1
        else:
            break
    return sg * n


def eok(x):
    return round(x / 1e8, 1)


def market():
    """시장 전체 투자자별 하루 순매수(억원) 최근 20일 — 필드 이름을 넓게 받아 둠"""
    M, keys = {}, {}
    for mk in ("KOSPI", "KOSDAQ"):
        try:
            j = get(f"https://finance.daum.net/api/investor/{mk}/days?page=1&perPage=25&details=true", "https://finance.daum.net/domestic/investors")
            rows = j.get("data") or []
            if rows:
                keys[mk] = {"top": sorted(rows[0].keys()), "details": sorted((rows[0].get("details") or {}).keys())}
            out = []
            for x in rows[:20]:
                det = x.get("details") or {}
                f = pick(x, "foreign", "straightpurchase", no=("cumul", "volume"))
                i = pick(x, "institution", "straightpurchase", no=("cumul", "volume"))
                p = pick(x, "individual", "straightpurchase", no=("cumul", "volume"))
                out.append({"d": str(x.get("date", ""))[:10], "f": f, "i": i, "p": p,
                            "det": {k: v for k, v in det.items() if isinstance(v, (int, float))}})
            M[mk] = out
        except Exception as e:
            print("시장 수급 실패", mk, e)
    return M, keys


def main():
    uni = universe()
    S, bad, kseen = [], 0, []
    for cd, nm, mk, mv in uni:
        try:
            rows, ks = flows(cd)
            kseen = kseen or ks
        except Exception as e:
            bad += 1; print("실패", cd, e); continue
        rows = [r for r in rows if r["c"]]
        if len(rows) < 6:
            continue
        r0 = rows[0]

        def amt(key, n):
            xs = rows[:n]
            if any(r[key] is None for r in xs):
                return None
            return eok(sum(r[key] * r["c"] for r in xs))

        mcap = None
        if r0.get("own") and r0.get("rate") and r0["rate"] > 0.0005:
            mcap = r0["own"] / r0["rate"] * r0["c"]
        o = {"c": cd, "n": nm, "m": "P" if mk == "KOSPI" else "Q", "d": r0["d"], "px": r0["c"],
             "mc": round(mcap / 1e8) if mcap else None,
             "r1": round((r0["c"] / rows[1]["c"] - 1) * 100, 1),
             "r5": round((r0["c"] / rows[5]["c"] - 1) * 100, 1),
             "r20": round((r0["c"] / rows[20]["c"] - 1) * 100, 1) if len(rows) > 20 else None,
             "f1": amt("f", 1), "f5": amt("f", 5), "f20": amt("f", min(20, len(rows))),
             "i1": amt("i", 1), "i5": amt("i", 5), "i20": amt("i", min(20, len(rows))),
             "fs": streak([r["f"] for r in rows]), "is": streak([r["i"] for r in rows]),
             "fr": round(r0["rate"] * 100, 2) if r0.get("rate") else None,
             "fr20": round((r0["rate"] - rows[min(20, len(rows) - 1)]["rate"]) * 100, 2) if r0.get("rate") and rows[min(20, len(rows) - 1)].get("rate") else None,
             "sf": [round(r["f"] * r["c"] / 1e8) if r["f"] is not None else 0 for r in rows[:20]][::-1],
             "si": [round(r["i"] * r["c"] / 1e8) if r["i"] is not None else 0 for r in rows[:20]][::-1]}
        S.append(o)
        time.sleep(0.08)
    if len(S) < 100:
        print("자료 부족 — 저장 안 함", len(S), "실패", bad); sys.exit(1)
    ds = [s["d"] for s in S]
    day = max(set(ds), key=ds.count)
    S = [s for s in S if s["d"] == day]
    for s in S:
        s.pop("d")
    M, mkeys = market()
    out = {"v": 1, "at": dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "day": day, "n": len(S), "bad": bad,
           "note": "금액 = 순매수 수량 × 그날 종가(억원, 어림) · 시총 상위 300 · 사는 신호 아님(10/28 10년 검증)",
           "mkt": M, "stocks": S, "keys": {"stock": kseen, "mkt": mkeys}}
    json.dump(out, open(P, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(day, "종목", len(S), "실패", bad, "기관 있음", sum(s["i1"] is not None for s in S))


if __name__ == "__main__":
    main()
