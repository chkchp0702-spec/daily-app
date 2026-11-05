"""🪞 11/05 D15 「자료 한 곳으로」 — market-strategy-report 의 앱용 JSON 을 daily-app/archive/m/ 로 복사
   앱은 raw.githubusercontent.com 에서 먼저 받고, 막히면(회사망·해외망) 같은 주소(github.io)의 archive/m/ 에서 받음(early.js).
   · 대상: market/*.json · brain/state.json · feeds/*.json · ledger/ledger.json (600KB 넘는 백테스트 파일은 뺌)
   · 내용이 같으면 안 씀(커밋이 생기지 않게)
   사용: python3 tools/mirror.py <msr 클론 경로> archive/m
"""
import glob
import os
import shutil
import sys

SRC, DST = sys.argv[1], sys.argv[2]
PAT = ["market/*.json", "brain/state.json", "feeds/*.json", "ledger/ledger.json"]
MAX = 600 * 1024
n = 0
keep = set()
for p in PAT:
    for f in glob.glob(os.path.join(SRC, p)):
        if os.path.getsize(f) > MAX:
            continue
        rel = os.path.relpath(f, SRC)
        out = os.path.join(DST, rel)
        keep.add(os.path.normpath(out))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        if os.path.exists(out) and open(out, "rb").read() == open(f, "rb").read():
            continue
        shutil.copyfile(f, out)
        n += 1
# 원본에서 사라진 파일은 지움
for f in glob.glob(os.path.join(DST, "**", "*.json"), recursive=True):
    if os.path.normpath(f) not in keep:
        os.remove(f)
print("mirror:", n, "개 바뀜 ·", len(keep), "개 유지")
