"""
원페이지 종목 리포트 만들기
  python onepager_batch.py --auto            그날 단타 알람 + 조용한 매집 상위 종목 자동 생성
  python onepager_batch.py --query 삼성전자   한 종목 직접 생성
결과: archive/onepager/<날짜>/<종목명>_<코드>.html  → manifest.json 갱신
"""
import argparse, datetime, glob, json, os, re, subprocess, sys

KST = datetime.timezone(datetime.timedelta(hours=9))
TODAY = datetime.datetime.now(KST).strftime("%Y-%m-%d")
OP = os.path.join("_src", "stock-onepager")
MAX_AUTO = 12


def safe(s):
    return re.sub(r"[^\w가-힣.-]+", "_", s).strip("_")[:60] or "종목"


def done_recently(code, days=7):
    """최근 N일 안에 이미 만든 종목이면 건너뜀"""
    cut = (datetime.datetime.now(KST) - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    for d in glob.glob(os.path.join("archive", "onepager", "20*")):
        if os.path.basename(d) >= cut and glob.glob(os.path.join(d, f"*_{safe(code)}.html")):
            return True
    return False


def make(query, name=None, code=None):
    out_dir = os.path.join("archive", "onepager", TODAY)
    os.makedirs(out_dir, exist_ok=True)
    tmp = os.path.abspath(os.path.join(out_dir, "_tmp.html"))
    try:
        r = subprocess.run([sys.executable, "-m", "onepager", query, "-o", tmp],
                           cwd=OP, capture_output=True, text=True, timeout=180)
    except subprocess.TimeoutExpired:
        print("시간 초과:", query)
        return None
    if r.returncode != 0 or not os.path.exists(tmp):
        print("실패:", query, r.stderr[-300:])
        return None
    html = open(tmp, encoding="utf-8").read()
    os.remove(tmp)
    if not name:
        m = re.search(r"<title>(.*?)</title>", html, re.S)
        name = (m.group(1) if m else query).split("·")[0].split("|")[0].strip() or query
    fname = f"{safe(name)}_{safe(code or query)}.html"
    with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
        f.write(html)
    print("완료:", fname)
    return fname


def latest(cat, fname):
    paths = sorted(glob.glob(os.path.join("archive", cat, "20*", fname)))
    return json.load(open(paths[-1], encoding="utf-8")) if paths else []


def auto():
    picks, seen = [], set()
    for r in latest("danta", "alerts.json"):
        picks.append((r["code"], r["name"]))
    for r in latest("accum", "list.json")[:6]:
        picks.append((r["code"], r["name"]))
    n = 0
    for code, name in picks:
        if code in seen or done_recently(code):
            continue
        seen.add(code)
        if make(code, name, code):
            n += 1
        if n >= MAX_AUTO:
            break


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--auto", action="store_true")
    ap.add_argument("--query")
    a = ap.parse_args()
    result = None
    if a.query:
        result = make(a.query.strip())
    if a.auto:
        auto()
    import collect
    collect.manifest()
    if a.query:
        with open("onepager_result.txt", "w", encoding="utf-8") as f:
            f.write(f"{TODAY}/{result}" if result else "")
