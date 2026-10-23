"""🧬 DNA 쌍둥이 — 10/23 A10/23-2 (사용자 「1,2,3 다 진행」)
   종목 화면 DNA 레이더의 다섯 축(성장·수익성·싸다·주가 힘·전문가)을 전 종목에 대해 같은 규칙으로 계산해 opdata/dna.json 하나로 냄.
   앱은 이 파일을 받아 「숫자가 가장 닮은 종목 5개(업종 무관)」를 휴대폰에서 찾음.

   규칙 (plus5.js extraCard 와 같은 식 · 「신호」 축은 앱 신호 수라 닮음 계산에서 뺌)
   · 성장   = 최근 연 매출 증가율 g → clamp((g+10)/50*100)
   · 수익성 = 최근 연 영업이익률 om → clamp(om/30*100)
   · 싸다   = PER(업종 중앙값 대비) → clamp(50+(업종PER−PER)/업종PER*60) · 업종 없으면 clamp(100−PER*2)
              PER 은 리포트(d/) 만든 날 값 × (오늘 종가 ÷ 그날 종가) 로 오늘 값에 맞춤 (d/ 는 30일마다 새로 만듦)
   · 주가 힘 = 1년 범위 안 위치 (p/ 오늘 종가 · 1년 고가·저가)
   · 전문가 = 애널리스트 평균 목표가까지 up → clamp((up+10)/40*100)
   · 덩치 단계 = log10(시가총액 달러)*2 를 내림(약 3.2배마다 한 단계) — 앱은 ±1 단계 안에서만 찾음(애플 쌍둥이가 홍콩 소형주가 되지 않게)
     달러 환산은 대략 환율(KRW 1400 · JPY 150 · CNY 7.2 · HKD 7.8)로 — 단계를 나눌 때만 씀
   다섯 축이 다 있는 종목만(재무·PER·가격·목표가) · 시총 1억 달러 미만은 뺌.

   사용: python opdb/dna.py --dest opdata
"""
import argparse
import glob
import json
import math
import os
import sys
import time

FX = {"USD": 1.0, "KRW": 1400.0, "JPY": 150.0, "CNY": 7.2, "HKD": 7.8}


def clamp(v):
    return max(0.0, min(100.0, v))


def fnv(s):
    h = 0x811c9dc5
    for b in s.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xffffffff
    return h


def shard(sym):
    return "%02x" % (fnv(sym) % 256)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", default="opdata")
    a = ap.parse_args()
    D = a.dest
    t0 = time.time()
    IV = json.load(open(os.path.join(D, "ind_val.json"), encoding="utf-8"))
    P = {}
    for f in glob.glob(os.path.join(D, "p", "*.json")):
        try:
            P.update(json.load(open(f, encoding="utf-8")))
        except Exception:
            pass
    rows, skip = [], {"재무": 0, "가격": 0, "PER": 0, "목표가": 0, "작음": 0, "오류": 0}
    asof = {}
    for f in glob.glob(os.path.join(D, "d", "*.json")):
        try:
            d = json.load(open(f, encoding="utf-8"))
        except Exception:
            skip["오류"] += 1
            continue
        sym = (d.get("ticker") or {}).get("symbol") or os.path.basename(f)[:-5]
        p = P.get(sym)
        if not p or not p[1] or not (p[3] and p[4]) or p[3] <= p[4]:
            skip["가격"] += 1
            continue
        last = float(p[1])
        fin = [x for x in (d.get("financials") or []) if x.get("revenue")]
        if len(fin) < 2 or fin[-1].get("operating_income") is None or not fin[-2]["revenue"]:
            skip["재무"] += 1
            continue
        g = (fin[-1]["revenue"] / fin[-2]["revenue"] - 1) * 100
        om = fin[-1]["operating_income"] / fin[-1]["revenue"] * 100
        pe = d.get("pe")
        px0 = d.get("price")
        if not pe or pe <= 0 or not px0:
            skip["PER"] += 1
            continue
        pe_now = pe * last / px0
        iv = IV.get(d.get("industry_ko") or "") or IV.get(d.get("industry") or "")
        val = clamp(50 + (iv["pe"] - pe_now) / iv["pe"] * 60) if iv and iv.get("pe") else clamp(100 - pe_now * 2)
        an = d.get("analyst") or {}
        tm = an.get("target_mean")
        if not tm or not an.get("n_analysts"):
            skip["목표가"] += 1
            continue
        up = (tm / last - 1) * 100
        pos = (last - p[4]) / (p[3] - p[4]) * 100
        mc = d.get("market_cap")
        fx = FX.get(d.get("currency") or "USD")
        if not mc or not fx:
            skip["작음"] += 1
            continue
        mcu = mc * last / px0 / fx
        if mcu < 1e8:
            skip["작음"] += 1
            continue
        tier = int(math.floor(math.log10(mcu) * 2))
        sc = [round(clamp((g + 10) / 50 * 100)), round(clamp(om / 30 * 100)), round(val), round(clamp(pos)), round(clamp((up + 10) / 40 * 100))]
        nm = (d.get("ticker") or {}).get("name") or ""
        rows.append([sym, sc[0], sc[1], sc[2], sc[3], sc[4], tier, (d.get("industry_ko") or "")[:14], nm[:24], round(pe_now, 1), float("%.3g" % mcu)])
        asof[d.get("as_of") or ""] = asof.get(d.get("as_of") or "", 0) + 1
    rows.sort(key=lambda r: r[0])
    out = {"updated": time.strftime("%Y-%m-%d %H:%M", time.gmtime(time.time() + 9 * 3600)),
           "axes": ["성장", "수익성", "싸다", "주가 힘", "전문가"], "cols": ["sym", "g", "om", "val", "pos", "up", "tier", "ind", "name", "pe", "mcap_usd"],
           "rule": "plus5.js DNA 레이더와 같은 식 · PER·시총은 오늘 종가로 맞춤 · 덩치 단계 = log10(시총 달러)×2 내림 · 다섯 축이 다 있고 시총 1억 달러 넘는 종목만",
           "n": len(rows), "skip": skip, "asof": dict(sorted(asof.items())[-5:]), "rows": rows}
    json.dump(out, open(os.path.join(D, "dna.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("✓ dna", len(rows), "종목 ·", skip, "·", round(time.time() - t0, 1), "초")
    return 0


if __name__ == "__main__":
    sys.exit(main())
