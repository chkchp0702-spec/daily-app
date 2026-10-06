"""
📄 만든 PDF를 릴리스(pdf-00 ~ pdf-47)에 올리고 목록 조각(--part)을 쓴다 → merge 로 archive/x/pdf_index.json
  릴리스 번호 = 종목 파일 이름 글자 코드 합 % 48. 릴리스 하나에 파일 1,000개 한도라 48칸(약 570개씩).
  목록에는 [날짜, KB, 릴리스] 를 적어 앱이 그 릴리스에서 받는다 (옛 16칸 파일도 그대로 동작).
"""
import argparse, datetime as dt, glob, json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(ROOT, "archive", "x", "pdf_index.json")
KST = dt.timezone(dt.timedelta(hours=9))
NB = 48


def tag(fn):
    return "pdf-%02d" % (sum(ord(c) for c in fn) % NB)


def sh(*a, check=False):
    r = subprocess.run(list(a), capture_output=True, text=True)
    if check and r.returncode:
        print("실패:", " ".join(a[:4]), r.stderr[-300:])
    return r.returncode == 0


def main(a):
    res = json.load(open(os.path.join(a.dir, "_result.json"), encoding="utf-8"))
    files = sorted(glob.glob(os.path.join(a.dir, "*.pdf")))
    groups = {}
    for f in files:
        groups.setdefault(tag(os.path.basename(f)[:-4]), []).append(f)
    ok_tags = set()
    for t, fs in sorted(groups.items()):
        if not sh("gh", "release", "view", t, "-R", a.repo):
            sh("gh", "release", "create", t, "-R", a.repo, "--title", "종목리포트 PDF " + t, "--notes",
               "앱(CH Investing) 종목리포트 PDF 보관함 — 자동 생성. 지우지 마세요.", "--prerelease", check=True)
        done = True
        for i in range(0, len(fs), 40):                  # 40개씩 나눠 올림
            done &= sh("gh", "release", "upload", t, *fs[i:i + 40], "-R", a.repo, "--clobber", check=True)
        if done:
            ok_tags.add(t)
    idx = {}
    if not a.part:
        try:
            idx = json.load(open(IDX, encoding="utf-8"))
        except Exception:
            pass
    today = dt.datetime.now(KST).strftime("%Y-%m-%d")
    fn2sym = {}
    for s in res.get("done", {}):
        fn2sym[__import__("re").sub(r"[^A-Za-z0-9.-]", "_", s)] = s
    n = 0
    for f in files:
        b = os.path.basename(f)[:-4]
        if tag(b) in ok_tags and b in fn2sym:
            idx[fn2sym[b]] = [today, round(os.path.getsize(f) / 1024), tag(b)]
            n += 1
    out = a.part or IDX
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    json.dump(idx, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"올림 {n}개 · 목록 {len(idx)}개")


def merge(parts):
    idx = {}
    try:
        idx = json.load(open(IDX, encoding="utf-8"))
    except Exception:
        pass
    n = 0
    for p in parts:
        try:
            d = json.load(open(p, encoding="utf-8")); idx.update(d); n += len(d)
        except Exception as e:
            print("조각 실패", p, e)
    json.dump(idx, open(IDX, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"합침 {n}개 · 목록 {len(idx)}개")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "merge":
        merge(sys.argv[2:]); sys.exit(0)
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--repo", required=True)
    ap.add_argument("--part", default="", help="목록 조각 파일 (여러 서버가 나눠 돌 때)")
    main(ap.parse_args())
