import yaml, sys, os, types
y = yaml.safe_load(open("Cup/.github/workflows/scan.yaml"))
body = next(st["run"] for st in y["jobs"]["scan"]["steps"] if "cat > scan.py" in st.get("run", "")).split("<< 'PYTHON_EOF'\n", 1)[1].split("\nPYTHON_EOF", 1)[0]
body = body.replace('if __name__ == "__main__":', "if False:")
g = {"__name__": "scanmod"}; exec(compile(body, "scan.py", "exec"), g)
import yfinance as yf, pandas as pd
d = yf.download("AAPL", period="2y", auto_adjust=False, progress=False)
if isinstance(d.columns, pd.MultiIndex): d.columns = d.columns.get_level_values(0)
d = d.rename(columns=str.lower)
out = []
for fn in ("detect_cup", "detect_cup_nh", "detect_cup_any"):
    if fn not in g: continue
    why = []
    try:
        r = g[fn](d, "AAPL", "US", 5, 0, why=why)
    except TypeError:
        r = g[fn](d, "AAPL", "US", 5, 0); why = ["(why 미지원)"]
    out.append(f"## {fn}: {'검출 ' + str({k: r[0][k] for k in ('pivot','depth','weeks','hdepth','hdays','bo_date','dist') if k in r[0]}) if r else '미검출'}")
    out += [f"- {w}" for w in why]
open("probe/aapl_why.txt", "w").write("\n".join(map(str, out)))
print("\n".join(map(str, out)))
