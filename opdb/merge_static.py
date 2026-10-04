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
    # 검색 순위용 '유명도': 시가총액(원화) 자릿수 0~9 (sec.json·fx.json 있을 때)
    import math
    sec = json.load(open(os.path.join(a.dest, "sec.json"), encoding="utf-8")) if os.path.exists(os.path.join(a.dest, "sec.json")) else {}
    fxp = os.path.join(a.dest, "p", "fx.json")
    fxr = json.load(open(fxp)) if os.path.exists(fxp) else {}
    CUR = {"US": "USD", "JP": "JPY", "CN": "CNY", "HK": "HKD", "KR": "KRW"}
    def tier(sym, mkt):
        cap = (sec.get(sym) or [0, 0, 0])[2] or 0
        won = cap * (fxr.get(CUR.get(mkt, "KRW")) or 1)
        return max(0, min(9, int(math.log10(won)) - 9)) if won > 0 else 0
    # 사람들이 흔히 부르는 다른 이름 (검색 별칭)
    EXTRA = {"1211.HK": "비야디 비와이디 BYD", "002594.SZ": "비야디 비와이디 BYD", "9983.T": "유니클로", "TSM": "TSMC 대만반도체 티에스엠씨",
             "GOOGL": "구글", "GOOG": "구글", "META": "페이스북", "BRK-B": "버크셔 해서웨이 버크셔", "7203.T": "토요타 도요타",
             "0700.HK": "텐센트 위챗", "9988.HK": "알리바바", "BABA": "알리바바", "NVO": "노보노디스크 위고비", "LLY": "일라이릴리 릴리",
             "ASML": "에이에스엠엘", "AVGO": "브로드컴", "AMD": "에이엠디", "TSLA": "테슬라", "PLTR": "팔란티어", "MSTR": "마이크로스트래티지 스트래티지",
             "1810.HK": "샤오미", "3690.HK": "메이퇀 메이투안", "9618.HK": "징둥 JD", "PDD": "핀둬둬 테무", "6758.T": "소니", "7974.T": "닌텐도",
             "8035.T": "도쿄일렉트론", "9984.T": "소프트뱅크", "6861.T": "키엔스", "300750.SZ": "CATL 닝더스다이", "600519.SS": "마오타이 구이저우마오타이"}
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
        if sym in EXTRA:
            alts.update(EXTRA[sym].split())
        idx.append([sym, disp, mkt, " ".join(sorted(alts)), built, "", tier(sym, mkt)])
    # ETF (etf_meta.json: {심볼: [이름, 시장, 날짜, 영문이름]})
    epath = os.path.join(a.dest, "etf_meta.json")
    emeta = json.load(open(epath, encoding="utf-8")) if os.path.exists(epath) else {}
    elist = os.path.join(a.dest, "etf_list.json")
    have = {r[0] for r in idx}
    for sym, name, mkt in (json.load(open(elist, encoding="utf-8")) if os.path.exists(elist) else []):
        if sym in have:
            continue
        m = emeta.get(sym)
        disp = (m[0] if m else name) or sym
        alts = {name, "ETF", sym.split(".")[0]}
        if m and m[3]:
            alts.add(m[3])
        alts.discard(disp)
        idx.append([sym, disp, mkt, " ".join(sorted(a for a in alts if a)), 1 if m else 0, "E", 0])
        have.add(sym)
    json.dump(idx, open(os.path.join(a.dest, "idx.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print("종목", len(idx), "준비됨", sum(r[4] for r in idx), "ETF", sum(1 for r in idx if len(r) > 5 and r[5] == "E"))


if __name__ == "__main__":
    main()
