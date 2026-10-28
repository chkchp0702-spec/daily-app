"""한국 고래(외국인·기관) 과거 수급 받기 — 다음 금융 investor/days (약 4.7년) · 종목 = 지금 시총 상위(코스피 450·코스닥 350)"""
import json, urllib.request, time, gzip, csv, sys, re, os
SH, NS = int(os.environ.get("SHARD", "0")), int(os.environ.get("NSHARD", "1"))
H = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
def get(u, ref):
    for k in range(4):
        try:
            r = urllib.request.Request(u, headers={**H, "Referer": ref}); return json.loads(urllib.request.urlopen(r, timeout=25).read().decode("utf-8"))
        except Exception as e:
            time.sleep(1.5 * (k + 1)); err = e
    raise err
uni = []
for mk, n in (("KOSPI", 450), ("KOSDAQ", 350)):
    got = []
    for pg in range(1, 12):
        j = get(f"https://m.stock.naver.com/api/stocks/marketValue/{mk}?page={pg}&pageSize=100", "https://m.stock.naver.com/")
        for s in j.get("stocks", []):
            nm, cd = s.get("stockName", ""), s.get("itemCode", "")
            if s.get("stockEndType") not in (None, "stock"): continue
            if not re.fullmatch(r"\d{5}0", cd) or "스팩" in nm or "리츠" in nm: continue
            got.append((cd, nm, mk))
        if len(got) >= n: break
    uni += got[:n]
print("universe", len(uni)); json.dump(uni, open("out/kr_universe.json", "w"), ensure_ascii=False)
uni_all = uni; uni = uni[SH::NS]
f = open(f"out/kr_flow_{SH}.csv", "w", newline=""); w = csv.writer(f)
w.writerow(["code", "date", "close", "vol", "val", "fnet", "inet", "fown", "frate"])
t0 = time.time(); bad = 0
for i, (cd, nm, mk) in enumerate(uni):
    ref = f"https://finance.daum.net/quotes/A{cd}"
    try:
        for pg in range(1, 14):
            j = get(f"https://finance.daum.net/api/investor/days?symbolCode=A{cd}&page={pg}&perPage=100", ref)
            rows = j.get("data") or []
            for x in rows:
                w.writerow([cd, x["date"][:10], x.get("tradePrice"), x.get("accTradeVolume"), x.get("accTradePrice"),
                            x.get("foreignStraightPurchaseVolume"), x.get("institutionStraightPurchaseVolume"), x.get("foreignOwnShares"), x.get("foreignOwnSharesRate")])
            if len(rows) < 100 or pg >= (j.get("totalPages") or 99): break
            time.sleep(0.12)
    except Exception as e:
        bad += 1; print("fail", cd, e)
    f.flush()
    if i % 10 == 0: print(i, cd, nm, round(time.time() - t0), "s"); sys.stdout.flush()
    open(f"out/fetch_log_{SH}.txt", "w").write(f"{i+1}/{len(uni)} bad {bad} secs {round(time.time()-t0)}\n")
f.close(); print("done bad", bad, round(time.time() - t0), "s")

