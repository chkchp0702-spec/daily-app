#!/usr/bin/env bash
# 🧪 11/27 오라클 서버에 「실험 칸(lab)」 설치 — 연구 예약 작업(📈 수익률 전략 · 🌙 킥 밤 연구)이 쓰는 백테스트 실행기
#   Cloud Shell 에서 한 줄:  ssh -o StrictHostKeyChecking=no ubuntu@168.110.49.71 "curl -fsSL https://raw.githubusercontent.com/chkchp0702-spec/daily-app/main/ops/lab_install.sh | bash"
#   하는 일: ① 서버 안 저장소(origin.git)·파이썬 찾기 ② 실행 전용 사용자 msrlab(비밀 값 못 읽음) ③ ~/lab/lab_run.sh + 3분마다 예약 ④ 시험 1번
#   안전: src/lab/kMMDD_이름.py 만 · 한 번에 2개 · 30분 제한 · 비밀 값(환경 변수·secrets 파일) 못 봄 · 결과는 market/lab/ 만 올림
set -u
say(){ echo "$@"; }
say "🧪 실험 칸 설치 시작 ($(date '+%F %T'))"
ORIGIN=$(find /home /srv /opt /var -maxdepth 5 -type d -name 'origin.git' 2>/dev/null | head -1)
[ -n "$ORIGIN" ] || { say "❌ origin.git 못 찾음 — 이 화면 사진을 Claude 에게"; exit 1; }
BR=$(git -C "$ORIGIN" symbolic-ref --short HEAD 2>/dev/null || echo main)
say "✅ 저장소: $ORIGIN (가지 $BR)"
PY=""
for c in $(command -v python3) $(ls -d /home/*/*/venv*/bin/python3 /home/*/venv*/bin/python3 /opt/*/bin/python3 /home/*/.venv/bin/python3 2>/dev/null); do
  if "$c" -c 'import pandas, numpy, yfinance' 2>/dev/null; then PY="$c"; break; fi
done
[ -n "$PY" ] || { say "❌ pandas·yfinance 가 있는 파이썬을 못 찾음 — 이 화면 사진을 Claude 에게"; exit 1; }
say "✅ 파이썬: $PY"
id msrlab >/dev/null 2>&1 || sudo useradd -r -m -d /var/lib/msrlab -s /usr/sbin/nologin msrlab
RUNAS=msrlab
if ! sudo -u msrlab env -i HOME=/var/lib/msrlab PATH=/usr/bin:/bin "$PY" -c 'import pandas, numpy, yfinance' 2>/dev/null; then
  RUNAS=$(whoami); say "⚠ msrlab 사용자로는 패키지를 못 읽음 → $RUNAS 로 실행(환경 변수 비밀 값은 그래도 지움)"
else say "✅ 실행 전용 사용자: msrlab"; fi
mkdir -p ~/lab
cat > ~/lab/conf.sh <<C
ORIGIN="$ORIGIN"; BR="$BR"; PY="$PY"; RUNAS="$RUNAS"
C
cat > ~/lab/lab_run.sh <<'R'
#!/usr/bin/env bash
# 🧪 daily-app inbox/msr/_lab/manifest.json 을 3분마다 보고 새 id 면 실험 스크립트를 돌려 market/lab/ 결과를 서버 저장소에 올림
set -u
. ~/lab/conf.sh
exec 9>~/lab/.lock; flock -n 9 || exit 0
RAW=${LAB_RAW:-https://raw.githubusercontent.com/chkchp0702-spec/daily-app/main/inbox/msr/_lab}
M=$(curl -fsS --max-time 20 "$RAW/manifest.json?$(date +%s)") || { [ "${1:-}" = "--api" ] && M='{"id":"api"}' || exit 0; }
ID=$(printf '%s' "$M" | "$PY" -c 'import sys,json;print(json.load(sys.stdin).get("id",""))' 2>/dev/null)
[ -n "$ID" ] || exit 0
[ "$ID" = "$(cat ~/lab/last_id 2>/dev/null)" ] && [ "${1:-}" != "--api" ] && exit 0
T=$(mktemp -d); chmod 755 "$T"; trap 'sudo rm -rf "$T" 2>/dev/null || rm -rf "$T"' EXIT
git clone -q --depth 1 -b "$BR" "file://$ORIGIN" "$T/r" || exit 1
cd "$T/r"; mkdir -p market/lab
# 📘 실험 도우미 설명서(코드 아님): 공통 함수 이름·인자·설명 → market/lab/_api.md
"$PY" - <<'P' > market/lab/_api.md 2>/dev/null
import ast,glob,os
fs=["src/conc_bt.py","src/rules7.py","src/rules_bt.py","src/kick_sleeve.py","src/lab/k1028_qflow.py","src/lab/k1111_splitcore.py","src/lab/k1106_portexec2.py"]
print("# 🧪 실험 칸 도우미 설명서 (서버가 자동으로 만듦 · 코드가 아니라 함수 목록)\n")
if os.path.exists("src/lab/README.md"): print(open("src/lab/README.md").read()[:6000],"\n")
for f in fs:
    if not os.path.exists(f): continue
    t=ast.parse(open(f).read()); print(f"## {f}")
    for n in t.body:
        if isinstance(n,(ast.FunctionDef,)):
            a=ast.unparse(n.args); d=(ast.get_docstring(n) or "").split("\n")[0][:160]
            print(f"- def {n.name}({a})  {d}")
        elif isinstance(n,ast.Assign) and all(isinstance(x,ast.Name) and x.id.isupper() for x in n.targets):
            print(f"- {', '.join(x.id for x in n.targets)} = {ast.unparse(n.value)[:120]}")
    print()
print("## 지금 있는 실험 결과 파일"); [print("-",p) for p in sorted(glob.glob("market/lab/*.json"))[-60:]]
P
OUTS=(); CODE=0; RAN=()
if [ "${1:-}" != "--api" ]; then
  : > market/lab/_last_log.txt.new
  for S in $(printf '%s' "$M" | "$PY" -c 'import sys,json;[print(x) for x in (json.load(sys.stdin).get("scripts") or [])[:2]]'); do
    [[ "$S" =~ ^src/lab/k[0-9]{4}_[A-Za-z0-9_]{1,40}\.py$ ]] || { echo "거절: $S" >> market/lab/_last_log.txt.new; continue; }
    curl -fsS --max-time 30 -o "$S" "$RAW/$S?$(date +%s)" || { echo "못 받음: $S" >> market/lab/_last_log.txt.new; continue; }
    [ "$(stat -c %s "$S")" -lt 300000 ] || { echo "너무 큼: $S" >> market/lab/_last_log.txt.new; rm -f "$S"; continue; }
    RAN+=("$S")
  done
  for S in "${RAN[@]}"; do
    echo "=== $S $(date '+%F %T KST')" >> market/lab/_last_log.txt.new
    [ "$RUNAS" = "msrlab" ] && sudo chown -R msrlab "$T/r"
    if [ "$RUNAS" = "msrlab" ]; then
      sudo -u msrlab env -i HOME=/var/lib/msrlab PATH=/usr/bin:/bin PYTHONPATH="$T/r" timeout 1800 "$PY" "$S" >> market/lab/_last_log.txt.new 2>&1; c=$?
      sudo chown -R "$(whoami)" "$T/r"
    else
      env -i HOME="$T" PATH=/usr/bin:/bin PYTHONPATH="$T/r" timeout 1800 "$PY" "$S" >> market/lab/_last_log.txt.new 2>&1; c=$?
    fi
    echo "=== 끝 코드=$c" >> market/lab/_last_log.txt.new; [ $c -ne 0 ] && CODE=$c
  done
  tail -c 60000 market/lab/_last_log.txt.new > market/lab/_last_log.txt; rm -f market/lab/_last_log.txt.new
fi
# 올릴 것: market/lab/ 와 돌린 src/lab 스크립트만 (나중에 GitHub 와 합칠 때 그대로 쓰도록)
git add -A market/lab "${RAN[@]}" 2>/dev/null
mapfile -t OUTS < <(git diff --cached --name-only)
"$PY" - "$ID" "$CODE" "${OUTS[@]}" > inbox_status_lab.json <<'P'
import sys,json,datetime as d
k=d.datetime.now(d.timezone.utc)+d.timedelta(hours=9)
print(json.dumps({"id":sys.argv[1],"at":k.strftime("%Y-%m-%d %H:%M KST"),"code":int(sys.argv[2]),"outputs":sys.argv[3:]},ensure_ascii=False))
P
git add inbox_status_lab.json
git -c user.name=lab -c user.email=lab@localhost commit -q -m "🧪 lab $ID (코드 $CODE)" || true
for i in 1 2 3 4 5; do git push -q origin "HEAD:$BR" && break; git pull -q --rebase origin "$BR" || { git rebase --abort; sleep 5; }; done
[ "${1:-}" != "--api" ] && echo "$ID" > ~/lab/last_id
echo "lab $ID 끝 코드=$CODE 결과 ${#OUTS[@]}개"
R
chmod +x ~/lab/lab_run.sh
( crontab -l 2>/dev/null | grep -v 'lab/lab_run.sh'; echo "*/3 * * * * bash \$HOME/lab/lab_run.sh >> \$HOME/lab/lab.log 2>&1" ) | crontab -
say "✅ 3분마다 예약 걸림"
if bash ~/lab/lab_run.sh --api; then say "✅ 시험 실행 성공 — 도우미 설명서(market/lab/_api.md) 올림"; else say "⚠ 시험 실행 실패 — 이 화면 사진을 Claude 에게"; fi
say "🎉 설치 끝 · Claude 가 확인함 (이 창은 닫아도 됨)"
