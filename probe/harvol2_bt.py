"""11/27 10시 🌊 확인 시험: harvol_bt(기본 = 단순 특성)에서 통과한 9개를 「화면 그대로 특성」(hl5·gap·옵션 꼬리·나라 변동성 지수 포함) 위에서 다시
  prob_vol.run() 을 그대로 돌리고, frame 에 h 특성을 더해 walk 특성 끝에 붙인 판과 val(앞·뒤·최근3년)을 비교
  나라 변동성 지수: 한국 = 늘 전날 값(실전과 같음) · 일본·홍콩 = 아침판 그날 값 / 저녁판 전날 값
  아시아 아침판 기준일 = 2026-11-24(그날 밤 S&P 있음) · 저녁판 = 2026-11-26(추수감사절 — S&P 없음)
  판정(미리 정함): 앞·뒤·최근3년 실력 모두 기본보다↑ + 최근3년 > 0 → 붙임"""
import os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import prob, prob_vol, prob_x


def own(c):
    r = c.astype(float).pct_change()
    dn = r.clip(upper=0)
    return {"lrv60": np.log(r.rolling(60).std() * 100 + 0.05),
            "ldsv20": np.log(np.sqrt((dn ** 2).rolling(20).mean()) * 100 + 0.05),
            "dsr20": (dn ** 2).rolling(20).sum() / (r ** 2).rolling(20).sum()}


syms = sorted({c["ix"] for c in prob.MK.values()} | set(prob.EXTRA))
H = prob.load_hist(syms)
CV = {}
for _mk, _fn in (("KR", prob_x.vkospi_daily), ("JP", prob_x.jniv_daily), ("HK", prob_x.vhsi_daily)):
    try:
        s = _fn()
        if s is not None:
            CV[_mk] = s
    except Exception as e:
        print("cv 실패", _mk, e)

F0, W0 = prob_vol.frame, prob_vol.walk
STATE = {"f": None}


def frame2(c, *a, **k):
    d = F0(c, *a, **k)
    if STATE["f"]:
        d["hx"] = own(c)[STATE["f"]]
    return d


def walk2(d, feats, tgt, *a, **k):
    if STATE["f"] and "hx" in d.columns and "hx" not in feats:
        feats = list(feats) + ["hx"]
    return W0(d, feats, tgt, *a, **k)


prob_vol.frame = frame2; prob_vol.walk = walk2
JOBS = [("KR", "lrv60"), ("JP", "ldsv20"), ("JP", "dsr20"), ("CN", "lrv60"), ("US", "ldsv20"), ("US", "dsr20")]
passed = []
for mk, fn in JOBS:
    modes = [("미국", None)] if mk == "US" else [("아침판", "2026-11-24"), ("저녁판", "2026-11-26")]
    for mn, bd in modes:
        H2 = dict(H)
        if mk in CV:
            s = CV[mk]
            cut = pd.Timestamp(bd) if (mk == "KR" or mn == "저녁판") else pd.Timestamp(bd) + pd.Timedelta(days=1)
            H2["cv:" + mk] = s[s.index < cut]
        res = {}
        for lab, f in (("기본", None), ("+" + fn, fn)):
            STATE["f"] = f
            o = prob_vol.run(H2, {mk: prob.MK[mk]}, {mk: bd} if bd else None)
            res[lab] = o.get(mk, {})
        print(mk, mn, fn, "mode", res["기본"].get("mode"), flush=True)
        for tg in prob_vol.TG:
            b = (res["기본"].get("t", {}).get(tg) or {}); j = (res["+" + fn].get("t", {}).get(tg) or {})
            bv, jv = b.get("val"), j.get("val")
            if not bv or not jv:
                print("  ", tg, "val 없음", b.get("err"), j.get("err")); continue
            ok = all(jv[x]["skill"] > bv[x]["skill"] for x in ("앞", "뒤", "최근3년")) and jv["최근3년"]["skill"] > 0
            ln = (f"  {tg} 기본 {bv['앞']['skill']}/{bv['뒤']['skill']}/{bv['최근3년']['skill']} auc {bv['auc']} → +{fn} "
                  f"{jv['앞']['skill']}/{jv['뒤']['skill']}/{jv['최근3년']['skill']} auc {jv['auc']} n {jv['n']} from {jv['from']} "
                  f"cv {b.get('cv')} opt {b.get('opt')} hl5 {b.get('hl5')} {'✅' if ok else ''}")
            print(ln, flush=True)
            if ok:
                passed.append(f"{mk} {mn} {fn}{ln}")
print("==== 통과")
for p in passed:
    print(p)
print("끝")
