"""
묶음별 결과(parts/*)를 opdata 폴더에 합치고 검색 목록(idx.json)을 만든다.
  python opdb/merge_static.py --dest opdata --parts parts
"""
import argparse, glob, json, os, shutil, sys

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
sys.path.insert(0, os.path.dirname(__file__))
from common import universe  # noqa: E402
from onepager.resolver import ALIASES  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", required=True)
    ap.add_argument("--parts", default="")
    a = ap.parse_args()
    os.makedirs(os.path.join(a.dest, "s"), exist_ok=True)
    os.makedirs(os.path.join(a.dest, "d"), exist_ok=True)
    mpath = os.path.join(a.dest, "meta.json")
    meta = json.load(open(mpath)) if os.path.exists(mpath) else {}

    if a.parts:
        for f in glob.glob(os.path.join(a.parts, "**", "s", "*.html"), recursive=True):
            shutil.copyfile(f, os.path.join(a.dest, "s", os.path.basename(f)))
        for f in glob.glob(os.path.join(a.parts, "**", "d", "*.json"), recursive=True):
            shutil.copyfile(f, os.path.join(a.dest, "d", os.path.basename(f)))
        os.makedirs(os.path.join(a.dest, "e"), exist_ok=True)
        for f in glob.glob(os.path.join(a.parts, "**", "e", "*.json"), recursive=True):
            shutil.copyfile(f, os.path.join(a.dest, "e", os.path.basename(f)))
        for f in glob.glob(os.path.join(a.parts, "**", "meta_*.json"), recursive=True):
            for k, v in json.load(open(f)).items():
                # 실패 기록이 예전 성공본을 덮지 않게
                if len(v) > 4 and k in meta and len(meta[k]) <= 4:
                    continue
                meta[k] = v
        css = glob.glob(os.path.join(a.parts, "**", "op.css"), recursive=True)
        if css:
            shutil.copyfile(css[0], os.path.join(a.dest, "op.css"))
    json.dump(meta, open(mpath, "w"), ensure_ascii=False, separators=(",", ":"))

    alias = {}
    for k, (sym, disp, _m) in ALIASES.items():
        alias.setdefault(sym, set()).update([k, disp])
    npath = os.path.join(a.dest, "names_ko.json")
    names_ko = json.load(open(npath, encoding="utf-8")) if os.path.exists(npath) else {}
    tpath = os.path.join(a.dest, "names_tr.json")
    names_tr = json.load(open(tpath, encoding="utf-8")) if os.path.exists(tpath) else {}
    is_ko = lambda t: any("\uac00" <= ch <= "\ud7a3" for ch in (t or ""))
    idx = []
    for sym, name, mkt in universe(os.path.join("_src", "Cup")):
        m = meta.get(sym)
        built = 1 if (m and len(m) <= 4) else 0
        disp = m[0] if built else name
        alts = set(alias.get(sym, set()))
        ko = names_ko.get(sym)
        if ko and mkt != "KR":
            alts.add(ko)
            if not is_ko(disp):
                alts.add(disp)
                disp = ko
        elif names_tr.get(sym) and mkt != "KR":
            alts.add(names_tr[sym])          # 번역 이름은 검색용 별칭으로만
        if m and m[3]:
            alts.add(m[3])
        if name != disp:
            alts.add(name)
        code = sym.split(".")[0]
        if code != sym:
            alts.add(code)
            if code.isdigit() and code.lstrip("0") != code:
                alts.add(code.lstrip("0"))     # 0700 → 700
        idx.append([sym, disp, mkt, " ".join(sorted(alts)), built])
    json.dump(idx, open(os.path.join(a.dest, "idx.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print("종목", len(idx), "준비됨", sum(r[4] for r in idx))


if __name__ == "__main__":
    main()
