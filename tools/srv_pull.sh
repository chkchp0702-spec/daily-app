#!/usr/bin/env bash
# 🚚 11/27 플랜 B — market-strategy-report 를 GitHub 에서 clone 하던 자리를 오라클 서버에서 받아 오는 것으로 바꿈
#   서버(https://168-110-49-71.sslip.io/) 는 같은 계산 공장이 같은 경로로 파일을 내보냄 (목록 기능은 없음 → 받을 파일 이름을 여기서 만듦)
#   사용:  bash tools/srv_pull.sh mirror  <대상 폴더>   → market·brain·feeds·ledger 의 앱용 JSON (이름은 archive/m 에 있던 것 기준)
#          bash tools/srv_pull.sh collect <대상 폴더>   → 최근 12일 리포트 PDF·kakao.txt·data/날짜.json · history.csv · ledger · 회고 md
#   서버에서 못 받은 파일은 archive/m 의 예전 사본으로 채움(mirror) — 사본이 지워지지 않게
#   GitHub 저장소가 다시 열리면 workflow 에서 이 줄을 원래 git clone 으로 되돌리면 됨
set -u
MODE="${1:?mirror|collect}"; OUT="${2:?대상 폴더}"
SRV="${MSR_SRV:-https://168-110-49-71.sslip.io}"
mkdir -p "$OUT"
ok=0; miss=0
get(){   # get <경로>  → 성공 0
  local rel="$1" dst="$OUT/$1"
  mkdir -p "$(dirname "$dst")"
  if curl -sf --max-time 30 -o "$dst.part" "$SRV/$rel?$(date +%s)"; then mv "$dst.part" "$dst"; ok=$((ok+1)); return 0; fi
  rm -f "$dst.part"; miss=$((miss+1)); return 1
}
if [ "$MODE" = "mirror" ]; then
  # 서버 쪽 새 파일도 받도록 이름 목록 = archive/m 에 있던 것 + 꼭 필요한 것
  { cd archive/m 2>/dev/null && find market brain feeds ledger -name '*.json' 2>/dev/null; cd - >/dev/null 2>&1; echo brain/state.json; echo ledger/ledger.json; echo market/say.json; } | sort -u | while read -r rel; do
    [ -n "$rel" ] || continue
    get "$rel" || { [ -f "archive/m/$rel" ] && mkdir -p "$(dirname "$OUT/$rel")" && cp "archive/m/$rel" "$OUT/$rel"; }
  done
  echo "srv_pull mirror: $(find "$OUT" -name '*.json' | wc -l) 개 준비"
  # 서버가 통째로 안 되면 실패로 알림(사본은 그대로 둠)
  curl -sf --max-time 20 -o /dev/null "$SRV/market/bear.json" || { echo "⚠ 서버 응답 없음 — 사본 유지"; exit 3; }
elif [ "$MODE" = "collect" ]; then
  for i in $(seq 0 11); do
    d=$(TZ=Asia/Seoul date -d "-$i day" +%F); u=${d//-/_}
    for s in AM HOL WK PM; do
      dir="reports/${d}_$s"
      if get "$dir/Market_Strategy_Summary_${u}_$s.pdf"; then
        get "$dir/Market_Strategy_Report_${u}_$s.pdf"; get "$dir/kakao.txt"
      else rmdir "$OUT/$dir" 2>/dev/null; fi
    done
    get "data/$d.json" >/dev/null || true
    get "reviews/weekly_$d.md" >/dev/null || true
  done
  for m in $(TZ=Asia/Seoul date +%Y-%m) $(TZ=Asia/Seoul date -d "-1 month" +%Y-%m); do get "reviews/$m.md" >/dev/null || true; done
  get market/history.csv; get ledger/ledger.json
  echo "srv_pull collect: $ok 개 받음"
fi
exit 0
