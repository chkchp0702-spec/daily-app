import json, time, sys, os, subprocess
sys.path.insert(0, "opdb")
subprocess.run("git clone -q --depth 1 https://github.com/chkchp0702-spec/Cup _src/Cup", shell=True)
import build_desc as B
out = {}
for code in ("445680", "005930", "000250"):
    for fn in ("kr_desc_naver", "kr_desc"):
        t0 = time.time()
        try:
            r = getattr(B, fn)(code)
        except Exception as e:
            r = "ERR " + repr(e)[:300]
        out[f"{fn}:{code}"] = [round(time.time() - t0, 1), r[:400]]
try:
    raw = B.get("https://finance.naver.com/item/main.naver?code=445680", B.H_D)
    i = raw.find("summary_info"); out["raw"] = [len(raw), raw[max(0, i - 200): i + 1500]]
except Exception as e:
    out["raw"] = repr(e)
json.dump(out, open("probe_out.json", "w"), ensure_ascii=False, indent=1)
print(out)
