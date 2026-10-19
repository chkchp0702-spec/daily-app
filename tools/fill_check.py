"""📦 전 종목 채우기 확인 — 매일 아침 06:07 KST (fillcheck.yml)
10/19 사용자 「웬만한 예약 작업은 깃허브로 넘겨서 사용량 줄이게」 → Claude 예약 작업 「전 종목 채우기 완료 확인」을 코드로 옮김.
- 숫자 3개: PDF(archive/x/pdf_index.json) · 뉴스(opdata n/) · 실적 추정치(opdata e/) ÷ 리포트 있는 종목(opdata idx.json 5번째 칸 = 1)
- 지난밤 작업(oppdf-all·opnews·opest·oppdf) 실패가 있으면 알림
- 완료 기준(PDF 98%↑ · 뉴스 90%↑ · 추정치 90%↑)을 처음 넘은 날 한 번만 자세히 알리고 archive/x/fill_check.json 에 done 표시
- 아직이면 조용히 숫자만 기록(사용자 요청: 「모든 작업이 끝나면 그때 자세히 알려줘」)
"""
import json, os, random, subprocess, urllib.request, datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "archive/x/fill_check.json"
APP = "https://chkchp0702-spec.github.io/daily-app/"
REPO = os.environ.get("GITHUB_REPOSITORY", "chkchp0702-spec/daily-app")
NOW = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None) + dt.timedelta(hours=9)
START = {"d": "2026-10-06", "pdf": 889, "news": 2500, "est": 20837, "all": 27226}   # 10/6 출발점


def sh(*a):
    return subprocess.run(a, capture_output=True, text=True, cwd=ROOT).stdout


def ntfy(title, msg, tags):
    if os.environ.get("DRY"):
        print("[알림 안 보냄 DRY]", title, "\n" + msg); return
    try:
        urllib.request.urlopen(urllib.request.Request("https://ntfy.sh/", data=json.dumps({
            "topic": "chkchp-ch-report", "title": title, "message": msg[:1500], "click": APP + "#home", "tags": tags}).encode(),
            headers={"Content-Type": "application/json"}), timeout=20).read()
    except Exception as e:
        print("알림 실패", e)


def runs(wf):
    tok = os.environ.get("GH_TOKEN")
    if not tok:
        return []
    try:
        r = urllib.request.urlopen(urllib.request.Request(f"https://api.github.com/repos/{REPO}/actions/workflows/{wf}/runs?per_page=3",
                                                          headers={"Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json"}), timeout=20)
        return json.loads(r.read()).get("workflow_runs", [])
    except Exception as e:
        print("runs 실패", wf, e)
        return []


def main():
    idx = json.loads(sh("git", "show", "origin/opdata:idx.json") or "[]")
    rep = [x for x in idx if len(x) > 4 and x[4] == 1]
    codes = [x[0] for x in rep]
    cov = [x[0] for x in rep if len(x) > 6 and x[6] != 0]          # 추정치가 있을 수 있는 종목(6번째 칸 0 = 워런트·우선주·초소형 등 대부분 추정치 자체가 없음)
    names = sh("git", "ls-tree", "-r", "--name-only", "origin/opdata", "n", "e").split()
    stem = lambda p: p.split("/", 1)[1].rsplit(".", 1)[0]
    N = {stem(p) for p in names if p.startswith("n/")}
    E = {stem(p) for p in names if p.startswith("e/")}
    pdf = json.loads((ROOT / "archive/x/pdf_index.json").read_text(encoding="utf-8"))
    pc = lambda S, L: round(100 * sum(1 for c in L if c in S) / max(1, len(L)), 1)
    # 뉴스 최근 30일 — n/ 표본 200개
    cut = (NOW - dt.timedelta(days=30)).strftime("%Y-%m-%d")
    smp = random.Random(NOW.strftime("%Y%m%d")).sample(sorted(N), min(200, len(N)))
    fresh = 0
    for c in smp:
        try:
            arr = json.loads(sh("git", "show", f"origin/opdata:n/{c}.json") or "[]")
            if any(str(a.get("date", ""))[:10] >= cut for a in arr if isinstance(a, dict)):
                fresh += 1
        except Exception:
            pass
    pdf6 = (NOW - dt.timedelta(days=6)).strftime("%Y-%m-%d")
    R = {"at": NOW.strftime("%Y-%m-%d %H:%M"), "rep": len(codes),
         "pdf": pc(pdf, codes), "pdf_n": sum(1 for c in codes if c in pdf),
         "pdf_fresh": round(100 * sum(1 for v in pdf.values() if str(v[0]) >= pdf6) / max(1, len(pdf)), 1),
         "news": pc(N, codes), "news_n": len(N), "news_30d": round(100 * fresh / max(1, len(smp)), 1),
         "est": pc(E, codes), "est_cov": pc(E, cov), "est_n": len(E), "cov": len(cov),
         "pdf_mb": round(sum(float(v[1]) for v in pdf.values() if len(v) > 1) / 1024, 1)}
    # 지난밤 작업
    bad = []
    for wf in ["oppdf-all.yml", "opnews.yml", "opest.yml", "oppdf.yml"]:
        for r in runs(wf)[:1]:
            if r.get("conclusion") not in ("success", None, "skipped"):
                bad.append(f"{wf} {r.get('conclusion')} ({r.get('created_at', '')[:16]})")
    R["bad"] = bad
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    hist = (old.get("hist") or [])[-29:] + [{k: R[k] for k in ("at", "pdf", "news", "news_30d", "est", "est_cov")}]
    R["hist"] = hist
    done = R["pdf"] >= 98 and R["news"] >= 90 and R["news_30d"] >= 90 and R["est_cov"] >= 90
    R["done"] = old.get("done") or (NOW.strftime("%Y-%m-%d") if done else None)
    line = f"PDF {R['pdf']}% · 뉴스 {R['news']}%(30일 안 {R['news_30d']}%) · 실적 {R['est_cov']}%(추정치 있을 종목) / {R['est']}%(전체)"
    print(line, "· 실패", bad or "없음", "· 완료" if done else "· 진행 중")
    if done and not old.get("done"):
        nights = (NOW.date() - dt.date.fromisoformat(START["d"])).days
        msg = (f"✅ 전 종목 채우기 끝 — PDF {R['pdf_n']:,}개 · 뉴스 {R['news_n']:,}개 · 실적 {R['est_n']:,}개 ({NOW.month}/{NOW.day} 기준)\n"
               f"· 10/6 출발 → 지금: PDF {START['pdf']:,} → {R['pdf_n']:,} · 뉴스 약 {START['news']:,} → {R['news_n']:,} · 실적 {START['est']:,} → {R['est_n']:,} ({nights}밤)\n"
               f"· 리포트 종목 {R['rep']:,}개 중 PDF {R['pdf']}% · 뉴스 {R['news']}%(표본 200개 중 30일 안 뉴스 {R['news_30d']}%) · 실적 추정치 {R['est_cov']}%"
               f" (워런트·우선주 같은 추정치 없는 종목까지 치면 {R['est']}%)\n"
               f"· PDF 총 {R['pdf_mb']:,}MB · 6일 안에 새로 만든 PDF {R['pdf_fresh']}%\n"
               f"· 앞으로: PDF 5일 한 바퀴 · 신호 종목 매일 · 뉴스·실적 매일 밤 — 앱 종목리포트 → 📄 PDF 바로 받기")
        ntfy("✅ 전 종목 채우기 끝", msg, ["white_check_mark"])
    elif bad:
        ntfy("📦 지난밤 전 종목 채우기 실패", line + "\n" + "\n".join("· " + b for b in bad), ["warning"])
    OUT.write_text(json.dumps(R, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
