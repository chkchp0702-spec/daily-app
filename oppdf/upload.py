"""
📄 만든 PDF를 릴리스(pdf-00 ~ pdf-15)에 올리고 archive/x/pdf_index.json 갱신
  릴리스 번호 = 종목 파일 이름 글자 코드 합 % 16 (앱 index.html pdfTag() 와 같은 규칙)
"""
import argparse, datetime as dt, glob, json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(ROOT, "archive", "x", "pdf_index.json")
KST = dt.timezone(dt.timedelta(hours=9))
NB = 16


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
            idx[fn2sym[b]] = [today, round(os.path.getsize(f) / 1024)]
            n += 1
    os.makedirs(os.path.dirname(IDX), exist_ok=True)
    json.dump(idx, open(IDX, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"올림 {n}개 · 목록 {len(idx)}개")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--repo", required=True)
    main(ap.parse_args())
