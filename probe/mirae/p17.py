import requests, json, collections
OUT = "probe/mirae/out"
B = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/debt/mspd/mspd_table_3_market"
j = requests.get(B + "?sort=-record_date&page[size]=1", timeout=60).json(); rd = j["data"][0]["record_date"]
rows = []; p = 1
while True:
    j = requests.get(B + f"?filter=record_date:eq:{rd}&page[size]=1000&page[number]={p}", timeout=60).json()
    rows += j["data"]
    if p >= j["meta"]["total-pages"]: break
    p += 1
c = collections.Counter((r["security_type_desc"], r["security_class1_desc"]) for r in rows)
samp = {}
for r in rows: samp.setdefault(r["security_class1_desc"], []).append(r)
json.dump({"rd": rd, "n": len(rows), "classes": [[list(k), v] for k, v in c.items()], "samp": {k: v[:3] for k, v in samp.items()}}, open(f"{OUT}/p17.json", "w"), indent=1)
json.dump(rows, open(f"{OUT}/mspd_all.json", "w"))
