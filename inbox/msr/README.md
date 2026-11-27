# 📮 받은편지함 (11/27~ · 저장소 차단 동안)

Claude 예약 작업이 결과를 여기에 놓으면 오라클 서버가 1분마다 확인해 가져감(자료 파일만 · 프로그램 파일은 안 받음).
- 채널: inbox/msr/ = 🧠 두뇌 · inbox/msr/_morning/ = 📰 아침 리포트 · inbox/msr/_bt/ = 🔁 백테스트 · inbox/msr/_misc/ = 그 밖 (채널마다 manifest.json 따로 — 남의 채널 파일은 건드리지 않기)
- manifest.json = {"id": 새 값, "files": [...], "jobs": [{"name": 서버에 있는 작업, "args": {"day"|"only": 값}}], "fcbase": [[...]]}
- 결과: https://168-110-49-71.sslip.io/inbox_status.json · inbox_status_morning.json · inbox_status_bt.json · inbox_status_misc.json · jobs_history.txt · joblog/<작업>.txt
- 재료는 archive/mb/ (앱 10분 실행이 서버에서 받음)
