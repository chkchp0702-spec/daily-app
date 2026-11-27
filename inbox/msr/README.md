# 🧠 두뇌 받은편지함 (11/27~ · 저장소 차단 동안)

시황 두뇌가 결과를 여기에 놓으면 오라클 서버가 5분마다 manifest.json 을 보고 가져가 반영함.
- manifest.json = {"id": "YYYYMMDD-HHMM", "files": ["brain/state.json", ...]} — id 가 바뀌어야 가져감
- 서버가 받는 파일: brain/** · feeds/hot.json · feeds/ai_found.json · market/kick_cands.json · market/qa.json (그 밖은 무시 · 파일만, 프로그램 실행 없음)
- 반영 결과: https://168-110-49-71.sslip.io/inbox_status.json
- 두뇌 재료는 archive/mb/ (장중 10분마다 서버에서 받음)
