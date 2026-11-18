"""11/18 발상의 전환 — 🌊 흔들림·급락 위험 확률 + 🎯 자신 있는 날 검증 (prob_vol.run 그대로, 아침판·저녁판 둘 다)"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import prob, prob_vol
syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX"})
H = prob.load_hist(syms)
out = {}
for nm, fr in (("지금", None),):
    res = prob_vol.run(H, prob.MK, fr); out[nm] = res
    for mk, R in res.items():
        for tg, t in R.get("t", {}).items():
            v = t.get("val") or {}
            print(nm, mk, tg, "ok" if t.get("ok") else "--", "rate", v.get("rate"), "auc", v.get("auc"),
                  "skill 앞/뒤/최근3년/전체", [v.get(k, {}).get("skill") for k in ("앞", "뒤", "최근3년", "전체")], "now", t.get("p"), "base", t.get("base"), t.get("err", ""))
            print("   bins", v.get("bins"))
        if R.get("conf"):
            print(nm, mk, "CONF", json.dumps(R["conf"], ensure_ascii=False))
json.dump(out, open("probe/volrisk_bt.json", "w"), ensure_ascii=False)
