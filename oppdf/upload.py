"""
📄 만든 PDF를 릴리스(pdf-00 ~ pdf-47)에 올리고 목록 조각(--part)을 쓴다 → merge 로 archive/x/pdf_index.json
  릴리스 번호 = 종목 파일 이름 글자 코드 합 % 48. 릴리스 하나에 파일 1,000개 한도라 48칸(약 570개씩).
  목록에는 [날짜, KB, 릴리스] 를 적어 앱이 그 릴리스에서 받는다 (옛 16칸 파일도 그대로 동작).
"""
import argparse, datetime as dt, glob, json, os, subprocess, time

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


def run(*a):
    r = subprocess.run(list(a), capture_output=True, text=True)
    return r.returncode == 0, (r.stderr or "") + (r.stdout or "")


LIMITED = ("rate limit", "secondary", "scraping", "abuse", "403", "429", "too many")


def assets(t, repo):
    """릴리스에 실제로 올라가 있는 파일 {이름: 바이트} (REST, 100개씩 넘겨 받기)"""
    ok, rid = run("gh", "api", f"repos/{repo}/releases/tags/{t}", "-q", ".id")
    got = {}
    if not ok:
        return got
    ok, out = run("gh", "api", "--paginate", f"repos/{repo}/releases/{rid.strip().splitlines()[-1]}/assets?per_page=100",
                  "-q", '.[] | "\\(.name)\\t\\(.size)"')
    for line in out.splitlines():
        if "\t" in line:
            n, sz = line.rsplit("\t", 1)
            if sz.strip().isdigit():
                got[n.strip()] = int(sz)
    return got


def main(a):
    res = json.load(open(os.path.join(a.dir, "_result.json"), encoding="utf-8"))
    files = sorted(glob.glob(os.path.join(a.dir, "*.pdf")))
    groups = {}
    for f in files:
        groups.setdefault(tag(os.path.basename(f)[:-4]), []).append(f)
    deadline = time.time() + a.max_min * 60
    # GitHub 가 한꺼번에 많이 올리면 막는다(secondary rate limit) → 20개씩 천천히, 막히면 쉬었다가 다시
    # (예전엔 묶음 하나만 실패해도 그 칸 전체를 목록에서 빼서, 만든 PDF의 3/4 가까이가 버려졌다)
    pending = []
    for t, fs in sorted(groups.items()):
        if not sh("gh", "release", "view", t, "-R", a.repo):
            sh("gh", "release", "create", t, "-R", a.repo, "--title", "종목리포트 PDF " + t, "--notes",
               "앱(CH Investing) 종목리포트 PDF 보관함 — 자동 생성. 지우지 마세요.", "--prerelease", check=True)
        for i in range(0, len(fs), 20):
            pending.append((t, fs[i:i + 20]))
    wait, limited = 60, 0
    while pending and time.time() < deadline:
        t, fs = pending.pop(0)
        ok, err = run("gh", "release", "upload", t, *fs, "-R", a.repo, "--clobber")
        if ok:
            wait = 60
            time.sleep(1.5)
            continue
        pending.append((t, fs))                       # 뒤로 미뤄 다시
        if any(k in err.lower() for k in LIMITED):
            limited += 1
            print(f"막힘({limited}) · {wait}초 쉼 · 남은 묶음 {len(pending)}", flush=True)
            time.sleep(min(wait, max(0, deadline - time.time())))
            wait = min(wait * 2, 600)
        else:
            print("실패:", t, err[-200:].replace("\n", " "), flush=True)
            time.sleep(5)
    if pending:
        print(f"시간 다 됨 — 못 올린 묶음 {len(pending)}개 (다음 밤에 다시)")
    # 실제로 올라간 파일만 목록에 (크기까지 같아야 오늘 것으로 인정)
    up = {}
    for t in sorted(groups):
        for n_, sz in assets(t, a.repo).items():
            up[n_] = sz
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
        if b in fn2sym and up.get(b + ".pdf") == os.path.getsize(f):
            idx[fn2sym[b]] = [today, round(os.path.getsize(f) / 1024), tag(b)]
            n += 1
    out = a.part or IDX
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    json.dump(idx, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"만든 PDF {len(files)}개 · 올림 {n}개 · 목록 {len(idx)}개 · 막힘 {limited}번")


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
    ap.add_argument("--max-min", type=float, default=120, help="올리기에 쓸 최대 시간(분) — 막히면 이 안에서 쉬었다가 다시")
    main(ap.parse_args())
