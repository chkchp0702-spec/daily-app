"""🐳 한국 고래 그림자 장부 (10/28 사용자 「2번 진행하고 의미 있어지면 얘기해」)
규칙(🐳 아시아 고래 연구 2026-10-28 · 과거 2024~ 만 플러스였던 것을 오늘부터 실전으로만 채점):
  · 매일 장 마감 뒤: 그날 기준 코스피+코스닥 시총 상위 200, 20일 평균 거래대금 10억↑
  · 5거래일마다 「외국인 20일 순매수 금액 ÷ 시총」 상위 10% = 고래 바구니
  · 다음 거래일 종가에 산 셈 → 20거래일 뒤 종가. 비교 = 같은 날 같은 200종목 평균(아무 종목). 비용 왕복 0.45%
  · 돈은 안 넣음(그림자). 판정: 끝난 바구니 24개↑ 에서 비용 뺀 평균 > 0 이고 겹치지 않게 고른 t ≥ 2 → 「의미 있음」 텔레그램 한 번
    / 36개↑ 인데 평균 ≤ 0 → 「안 됨, 그만」 한 번
자료: 다음 금융 investor/days (외국인 순매수 수량·외국인 보유율·종가) · 네이버 시총 순위. 결과 archive/x/kr_whale.json"""
import json, os, re, time, math, urllib.request, urllib.parse, datetime as dt

P = "archive/x/kr_whale.json"
COST, HOLD, EVERY, TOPQ = 0.0045, 20, 5, 0.10
H = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
KST = dt.timezone(dt.timedelta(hours=9))


def get(u, ref):
    err = None
    for k in range(4):
        try:
            r = urllib.request.Request(u, headers={**H, "Referer": ref})
            return json.loads(urllib.request.urlopen(r, timeout=25).read().decode("utf-8"))
        except Exception as e:
            err = e; time.sleep(1.5 * (k + 1))
    raise err


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
    return out[:200]


def flows(cd):
    j = get(f"https://finance.daum.net/api/investor/days?symbolCode=A{cd}&page=1&perPage=25", f"https://finance.daum.net/quotes/A{cd}")
    rows = j.get("data") or []
    return [{"d": x["date"][:10], "c": x.get("tradePrice"), "val": x.get("accTradePrice") or 0, "f": x.get("foreignStraightPurchaseVolume") or 0,
             "own": x.get("foreignOwnShares"), "rate": x.get("foreignOwnSharesRate")} for x in rows]


def tg(msg):
    tok, chat = os.environ.get("TG_TOKEN"), os.environ.get("TG_CHAT")
    if not (tok and chat):
        print("텔레그램 비밀값 없음:", msg); return False
    try:
        data = urllib.parse.urlencode({"chat_id": chat, "text": msg}).encode()
        urllib.request.urlopen(f"https://api.telegram.org/bot{tok}/sendMessage", data=data, timeout=15).read(); return True
    except Exception as e:
        print("텔레그램 실패", e); return False


def summary(S):
    done = [b for b in S["batches"] if b.get("net") is not None]
    nets = [b["net"] for b in done]
    n = len(nets)
    if not n:
        return {"n": 0}
    mean = sum(nets) / n
    sub = nets[::HOLD // EVERY]                                   # 겹치지 않는 바구니만(20일 보유 · 5일마다 → 4개 중 1개)
    if len(sub) >= 3:
        m2 = sum(sub) / len(sub); sd = math.sqrt(sum((x - m2) ** 2 for x in sub) / (len(sub) - 1)) or 1e-9
        t = m2 / (sd / math.sqrt(len(sub)))
    else:
        t = None
    return {"n": n, "mean_net": round(mean * 100, 2), "win": round(sum(x > 0 for x in nets) / n * 100), "t": round(t, 2) if t is not None else None,
            "n_indep": len(sub), "first": done[0]["entry_date"], "last": done[-1]["exit_date"]}


def main():
    S = json.load(open(P, encoding="utf-8")) if os.path.exists(P) else {
        "v": 1, "start": None, "rule": __doc__.split("자료:")[0].strip(), "days": [], "batches": [], "notified": {}}
    uni = universe()
    names = {c: n for c, n, _, _ in uni}
    need = {c for c, *_ in uni}
    for b in S["batches"]:
        if b.get("net") is None:
            need |= set(b["uni"])
    data, bad = {}, 0
    for cd in sorted(need):
        try:
            data[cd] = flows(cd)
        except Exception as e:
            bad += 1; print("실패", cd, e)
        time.sleep(0.1)
    lasts = [r[0]["d"] for r in data.values() if r]
    if not lasts:
        print("자료 없음"); return
    today = max(set(lasts), key=lasts.count)
    now = dt.datetime.now(KST)
    if today != now.strftime("%Y-%m-%d") and os.environ.get("FORCE") != "1":
        print("오늘 자료 아님(휴장·아직 안 나옴)", today); return
    if today in S["days"]:
        print("이미 함", today); return
    close = {cd: r[0]["c"] for cd, r in data.items() if r and r[0]["d"] == today and r[0]["c"]}
    S["days"].append(today)
    S["start"] = S["start"] or today
    # ① 지난 신호 바구니: 오늘 종가로 들어감 ② 20거래일 지난 바구니: 오늘 종가로 채점
    for b in S["batches"]:
        if b.get("entry_date") is None and b["sig_date"] < today:
            b["entry_date"] = today; b["entry"] = {c: close.get(c) for c in b["uni"]}
        elif b.get("entry_date") and b.get("net") is None:
            b["held"] = b.get("held", 0) + 1
            if b["held"] >= HOLD:
                def r(c):
                    e, x = b["entry"].get(c), close.get(c)
                    return x / e - 1 if e and x else None
                rs = {c: r(c) for c in b["uni"]}
                top = [v for c, v in rs.items() if c in b["picks"] and v is not None]
                allr = [v for v in rs.values() if v is not None]
                if top and allr:
                    b["exit_date"] = today
                    b["top"] = round(sum(top) / len(top), 5); b["base"] = round(sum(allr) / len(allr), 5)
                    b["net"] = round(b["top"] - b["base"] - COST, 5)
                    b["best"] = sorted(((names.get(c, c), round(v * 100, 1)) for c, v in rs.items() if c in b["picks"] and v is not None), key=lambda x: -x[1])[:3]
    # ③ 5거래일마다 새 바구니
    if (len(S["days"]) - 1) % EVERY == 0:
        sig = {}
        for cd, *_ in uni:
            rows = [x for x in data.get(cd, []) if x["c"]]
            if len(rows) < 20 or rows[0]["d"] != today:
                continue
            r20 = rows[:20]
            liq = sum(x["val"] for x in r20) / 20
            own, rate = rows[0]["own"], rows[0]["rate"]
            if liq < 1e9 or not own or not rate or rate <= 0.0005:
                continue
            mcap = own / rate * rows[0]["c"]
            sig[cd] = sum(x["f"] * x["c"] for x in r20) / mcap
        if len(sig) >= 60:
            k = max(1, round(len(sig) * TOPQ))
            picks = [c for c, _ in sorted(sig.items(), key=lambda x: -x[1])[:k]]
            S["batches"].append({"sig_date": today, "uni": sorted(sig), "picks": picks, "pick_names": [names.get(c, c) for c in picks],
                                 "sig_top": round(sig[picks[0]] * 100, 2)})
    S["summary"] = sm = summary(S)
    S["updated"] = now.strftime("%Y-%m-%d %H:%M"); S["bad"] = bad
    # ④ 판정 → 텔레그램(한 번씩)
    if sm.get("n", 0) >= 24 and sm.get("t") is not None:
        if sm["mean_net"] > 0 and sm["t"] >= 2 and not S["notified"].get("good"):
            if tg(f"🐳 한국 고래 그림자 — 의미 있어졌어요\n외국인 20일 순매수 상위 10%(대형 200) 바구니 {sm['n']}개, 20일 초과수익 비용 뺀 평균 {sm['mean_net']:+.2f}% · 이긴 비율 {sm['win']}% · t {sm['t']} ({sm['first']}~{sm['last']})\n킥에 넣을지 정해 주세요."):
                S["notified"]["good"] = today
        elif sm["n"] >= 36 and sm["mean_net"] <= 0 and not S["notified"].get("bad"):
            if tg(f"🐳 한국 고래 그림자 — 안 됨\n바구니 {sm['n']}개, 비용 뺀 평균 {sm['mean_net']:+.2f}% · t {sm['t']}. 외국인 따라 사기는 실전에서 시장을 못 이겼어요. 그림자 장부를 멈춰도 돼요."):
                S["notified"]["bad"] = today
    json.dump(S, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(today, "바구니", len(S["batches"]), sm)


if __name__ == "__main__":
    main()
