# 📰 매일 아침 시황리포트 — 실행 설명서 (11/27~ 오라클 서버 구조)
> 예약 작업 「매일 아침 시황리포트」가 이 파일을 읽고 그대로 한다. Claude 가 사용자(PB) 요청으로 11/27 에 옮겨 적음(예전 예약 작업 글 + 바뀐 자리). 고칠 땐 이 파일만 고치면 됨.

오늘 아침 시황리포트를 만들어 서버에 올리고 대시보드를 갱신한다. 질문하지 말고 끝까지 진행한다(사용자는 자고 있거나 이동 중일 수 있음). 모든 답변은 한국어. **목표는 단 하나 — 포트 수익률 개선, 시장을 이기는 포트.**

## ★ 일하는 자리 (가장 먼저)
- 계산 공장 market-strategy-report 는 11/24 GitHub 에 막혀 **오라클 서버(https://168-110-49-71.sslip.io/)** 에서 돈다. 이 세션은 서버에 셸로 못 닿는다(WebFetch 로 작은 상태 파일만 읽을 수 있음). market-strategy-report 는 clone·fetch 하지 않는다.
- **읽기** = daily-app `archive/mb/`(서버 파일을 같은 경로로 받아 둔 것 · 아래 `$M`). **새로 받게 하려면** `gh api -X POST repos/chkchp0702-spec/daily-app/actions/workflows/live.yml/dispatches -f ref=main` → 3~4분 뒤 `git pull`(`$M/_pulled.json` 의 at 확인).
- **쓰기** = daily-app `inbox/msr/_morning/` 에 서버와 같은 경로로 파일을 놓고 `inbox/msr/_morning/manifest.json` 을 **새 id** 로 써서 push → 서버가 1~2분 안에 가져감. manifest: `{"id": "YYYYMMDD-HHMM-n", "files": [...], "jobs": [{"name": ..., "args": {...}}], "fcbase": [[...], ...]}`.
  - 서버가 받는 파일: `data/YYYY-MM-DD.json` · `ledger/ledger.json` · `reviews/*.md|json` · `feeds/used.json` · `brain/**` · `RULES.md` (그 밖은 무시).
  - 켤 수 있는 작업: `review`(args only=weekly|monthly) · `morning-pre`(섹터·집중·킥 후보 다시) · `morning-build`(args day=data/YYYY-MM-DD.json · only=rerank|force|rerank-force) · `bear-fast` · `fetch`.
  - 결과: WebFetch 로 https://168-110-49-71.sslip.io/inbox_status_morning.json (id·push·applied·jobs·**verify**(검산 출력)·**fcbase**(기저율 출력)) · https://168-110-49-71.sslip.io/jobs_history.txt (작업 끝난 기록) · https://168-110-49-71.sslip.io/joblog/morning-build.txt (마지막 로그 150줄). WebFetch 에는 「글자 그대로 돌려 달라」고 시킨다.
  - `inbox/msr/` 의 다른 칸(맨 위 = 두뇌, `_bt`, `_misc`)은 건드리지 않는다. `git add` 는 `inbox/msr/_morning` 만.
- 이 세션에서 **돌리지 않는 것**(서버가 함): pip install · python -m src.* 전부 · playwright · 저장소 push. 서버 06:15 `fetch`(포트·킥·집중 포트·섹터·집중) 와 06:24 `morning-pre`(섹터·집중·킥 후보)가 아침마다 스스로 돈다.

## 1. 준비
1. add_repo 로 chkchp0702-spec/daily-app 을 push 권한으로 붙이고 `git clone -q --depth 1 --filter=blob:none --sparse https://github.com/chkchp0702-spec/daily-app /home/claude/daily-app && git -C /home/claude/daily-app sparse-checkout set --no-cone /archive/mb/ /inbox/ /ops/ /archive/x/live_kr.json /archive/x/live_us_pre.json /archive/x/live_us.json /archive/x/flow_kr.json /archive/x/wl_live.json`. `M=/home/claude/daily-app/archive/mb`.
2. `$M/_pulled.json` 의 at 이 30분보다 오래됐으면 위 live.yml 을 한 번 켜고 3~4분 뒤 pull. `$M/market/sectors.json`·`focus.json`·`kick_candidates.json` 이 오늘 아침 것이 아니면 manifest `{"jobs":[{"name":"morning-pre"}]}` 로 한 번 시키고(2~3분) live.yml 을 다시 켜 받는다. 그래도 낡았으면 있는 것으로 진행하고 그 사실을 적는다.
3. **$M 의 RULES.md, README.md, ledger/ledger.json, 가장 최근 data/YYYY-MM-DD.json, data/_template.json, market/latest.json, market/sectors.json, market/focus.json, market/port.json(💼 포트), market/kick.json(⚡ 킥), market/conc.json(🎯 집중·상승장 판정), feeds/my_feed_recent.json(📰 내 피드 — 최근 36시간) 을 먼저 다 읽는다.** 누적 점수·조건 카운트·20일 그림·어제 예고(forecasts)는 전부 장부에서 가져온다. 기억으로 숫자를 이어 붙이지 않는다. **RULES.md 「1-A. 킥」「1-B. 🔥 주도 섹터·테마」「1-C. 🎯 오늘의 집중」「1-D. 📰 내 피드」「1-E. 💼 포트 수익률」「1-F. 🎯 예고 규칙」「1-G. 🧠 시황 두뇌」「3. 전략가 패널(기록만)」「3-A. ⚔️ 1:1 대결」를 특히 꼼꼼히 읽는다.**
4. (조건 발동 알림 Issue 확인은 서버 구조에선 없음 — 장부 conditions 는 market/latest.json·bear.json 숫자로 직접 본다.)

## 2. 오늘 판 정하기 (한국 시간 기준)
- 한국 증시가 오늘 열리는 평일 → 아침판 `AM` (edition_label "아침판") : 미국 전날 종가 + 한국 전날 종가 + 밤사이 뉴스
- 토요일·한국 공휴일(10/9 한글날, 12/25, 1/1, 설·추석 연휴 등) → 휴장판 `HOL` ("휴장판") : 미국 마지막 마감 + 다음 한국 개장 때 받을 영향
- **일요일 → 주간판 `WK` ("주간판")**: 먼저 manifest `{"jobs":[{"name":"review","args":{"only":"weekly"}}]}` 로 서버에 회고 골격을 만들게 하고(1~2분) live.yml 을 켜 `$M/reviews/weekly_<오늘>.md/json` 을 받아 읽는다. 2쪽 「무슨 일이 있었나」는 이번 주 복기(예고 몇 개 맞혔나 — 반반은 절반으로, 공짜 확률보다 나았나, 경우의 수 확률이 왜 움직였나, 외국인 주간 합계, 10년 금리 주간 변화, **💼 포트 주간 성적 vs S&P·코스피, ⚡ 킥·🎯 집중 포트가 기본을 이겼나, 🧭 섹터 칸이 코어를 이겼나**), 성적표는 주간 집계+적중률 순위, 앞으로 볼 것은 다음 주 일정 중심. 새 뉴스가 없으면 "새로 바뀐 것 없음"이라고 솔직히 쓴다. **주간판의 🎯 집중은 「다음 주에 볼 테마」로 쓴다.**
- **매월 첫 리포트(그 달 들어 data 파일이 처음이면)**: morning-build 의 only 에 `rerank` 를 붙이고(패널 적중률 순 재정렬 — 장부 기록용), `review` 작업(only=monthly)으로 지난달 회고 골격을 만든 뒤 받아서 reviews/YYYY-MM.md 의 「왜 틀렸나」「규칙 수정」을 장부와 리포트 내용을 근거로 채워 받은편지함으로 보낸다. 고친 규칙은 RULES.md 7. 이력에 한 줄 적는다(RULES.md 도 받은편지함으로).

## 2-B. 🧠 시황 두뇌부터 읽는다
- $M 의 brain/state.json(지금 논지·확신도·지켜볼 것·포트 제안·채점표), brain/insights.md(쌓인 교훈·출처별 신뢰도), brain/log/<어제>.md·<오늘>.md 를 **다른 자료보다 먼저** 읽는다. 매시간 두뇌가 밤새 피드와 시장을 검토해 둔 결과다.
- 쓰는 법: ① 두뇌가 이미 걸러 둔 피드 글이 3-0 선별의 출발점 ② theses 는 킥·🎯 집중·「오늘의 판단」의 재료 — 그대로 베끼지 말고 오늘 아침 숫자로 다시 확인 ③ port_ideas 는 3-C 🧭 섹터 칸 점검의 첫 후보 — 채택이든 기각이든 이유를 decision.reasons 에 한 줄 ④ watch 는 「볼 것 3개」 후보(단 4번 🎯 예고 규칙을 통과해야 함).
- **어제 논지 채점**: state.json theses 마다 오늘 아침 숫자로 맞았나/틀렸나/아직을 check 에 적고 scorecard(made/right/wrong)를 누적한다. 틀린 논지는 theses 에서 빼고 insights.md 「틀린 것에서 배운 것」에 한 줄. 고친 state.json·insights.md 는 받은편지함(_morning)에 brain/ 경로로 같이 보낸다(bets 의 entry·status·res·scorecard.bets 는 손대지 않음).
- 리포트 1쪽 「오늘의 판단」 또는 3쪽에 "🧠 두뇌 채점 N/M" 한 마디를 넣는다.

## 3. 자료 찾기
- **$M/market/latest.json 이 1차 숫자다**(서버 자동 수집). 값이 null 이거나 날짜가 오래됐으면 WebSearch/WebFetch 로 찾는다. 수집치와 기사 숫자가 다르면 날짜·장중 여부를 따져 범위로 적고 그 사실을 쓴다.
- 웹에서 더 확인: 밤사이 뉴스, 주요 종목, 이번 주 일정, 전략가 발언. 네이버·텔레그램은 직접 접속이 막혀 있으니 블로그·텔레그램 글은 my_feed_recent.json 으로 읽는다. 그 밖의 웹은 Businesskorea, 아주경제, 뉴스핌, 인베스팅닷컴 한국어, TradingEconomics, Yahoo Finance, CNBC, Reuters 인용 기사 등.
- **전략가 패널 31명은 「기록만」**(리포트 쪽·요약본 줄 없음). 새 발언이 확인된 사람만 panel_today 에 넣는다. 없으면 넣지 않는다. 지어내지 않는다. James Lee(패널 31번)는 피드의 james_lee_advisors 글로 반영한다.
- 확정치가 없으면 「장중 수치」라고 적는다. 없는 숫자는 만들지 않는다.

## 3-0. 📰 내 피드 — 읽고, 골라서 반영
1. 지난 18시간(주간판은 있는 범위 전부 — my_feed_recent 는 36시간뿐이니 주간판은 그 한계를 적는다) 글을 출처별로 전부 읽는다.
2. **선별은 네가 판단한다.** 반영하는 글: 오늘 리포트의 킥·🎯 집중 테마·배분 조건·🧭 섹터 칸·⚡ 킥 보유 종목·볼 것 3개와 **직접 이어지는** 숫자·사실, 또는 전략가·증권사 리서치의 **새 판단**(1:1 대결 후보로도). 안 쓰는 글: 중복 속보, 근거 없는 루머·매매 자랑·광고, 오늘 이야기와 무관한 것, 원 출처 확인이 안 되는 숫자. 보통 하루 3~8개 — **리포트 결론을 바꾸거나 단단하게 만드는 것**만.
3. 쓰는 법: ① 숫자·사실은 원 출처 기사로 한 번 더 확인하고 출처를 "하나증권 김경환 텔레그램 · 10/9" 식으로 ② 전략가 판단은 패널에 있으면 panel_today, 아니면 본문에 "○○에 따르면" 한두 문장 ③ 남의 글을 길게 옮기지 않는다. 피드 글 때문에 판단이 바뀌면 decision.reasons 에 한 줄.
4. 결과를 feeds/used.json 에 쓴다: `{"date","read","items":[{"id","why"}],"skip"}` (받은편지함으로 보냄 — 앱 📰 피드 탭 「📝 오늘 시황리포트: N개 읽고 K개 반영」).

## 3-A. 🎯 오늘의 집중 + 🔥 주도 테마 (매일, 킥만큼 중요)
1. $M/market/focus.json 을 읽는다(서버가 아침에 새로 만듦): countries(5개 시장 점수·돈이 들어오는 나라), themes 2개(5·20일, S&P 대비, 연속 강세, 미국 ETF, 한국 상장 ETF, 관련주와 행동 표시 ★관심/관심/눌림 대기/추격 금지, "이게 깨지면" 기준선), avoid, score.
2. **왜 돈이 몰리나**를 🧠 두뇌·📰 피드·웹에서 찾아 data.focus.why 에 테마 sym 마다 한두 문장(출처). 숫자는 focus.json 그대로.
3. data.leaders: title(돈이 몰리는 나라·테마 + 숫자 + 며칠째) · short(요약본 60자 안) · **so(그래서 오늘 무엇을 본다 — 집중 ETF 1~2개·★종목 2~3개 이름을 콕 집고, 추격 금지 종목은 왜 기다리는지, 🧭 섹터 칸과 어떻게 연결되는지)** · why · korea.
4. 돈이 들어오는 나라가 미국이 아니면 그 사실도 한 마디. 집중 테마가 꺾이면 「끝났나?」, 성적표가 나빠지면(지난 5번 중 3번 이상 S&P에 짐) 이유 한 줄.
5. 주도 테마가 오늘 가장 큰 이야기면 킥으로 써도 된다.

## 3-B. 킥 찾기 (매일, 가장 중요)
1. $M/market/kick_candidates.json(서버 06:24 계산)의 자동 후보를 본다 — 금리 vs 금리를 내릴 재료 · 지수 vs 시장 폭 · 지수 vs 외국인 · 미국 vs 한국 반도체 · 주식과 금리 같은 방향 · VIX와 S&P 동반 상승 · 며칠째 이어진 흐름 · 섹터·테마 엇갈림. 🧠 두뇌 논지·피드 숫자도 후보.
2. 후보 숫자를 출처로 다시 확인하고 가장 의미 있는 것을 고르거나 **더 좋은 엇갈림을 직접 계산해서 찾는다**. 뉴스 요약이나 전략가 의견은 킥이 아니다.
3. data.kick: title(숫자가 들어간 한 문장) · so · why(2~3문장) · rows 또는 lines.
4. 킥이 있으면 one_liner 는 두 줄 안. 엇갈림이 진짜 없는 날은 {"none": true, "why": …}. 같은 논지를 사흘 연속 쓰지 말고, 이어지면 「얼마나 더 쌓였나」로 새 숫자를 붙인다.

## 3-C. 💼 포트 점검 — 뼈대는 검증한 규칙 + 🧭 섹터 칸은 리포트의 섹터 판단 그대로 (RULES 1-E)
1. $M 의 port.json(stat·hold·views), kick.json stat, conc.json regime(🟢/🔴 · S&P 200일선 ±%)을 읽는다(서버가 06:15 에 갱신).
2. **뼈대 맞추기**: RULES.md 와 ledger.skeleton(up/down/now)·지금 장부의 규칙 그대로 — 판정이 바뀐 날만 allocation 을 skeleton 값으로 바꾸고 ledger.skeleton.now 와 ledger.change_note {"date","why"} 를 쓰고 decision.badges 에 「비중 바꿈」. 같으면 바꾸지 않는다. 「🧭 섹터 칸」 줄은 {"sleeve": true} 그대로 pct 만(칸별 줄을 직접 쓰지 않는다). ※ 11월 중 미국 몫 나눠 줄이기·us_regime 규칙 등 장부·RULES 에 더 새 규칙이 있으면 그것이 우선.
3. **🧭 섹터 칸 = ledger.sector_views.views (실제 돈)**: 칸마다 「지금 새로 산다면 이 비율로 살까?」. 「약함」 이틀째이고 이유가 깨졌으면 줄이고, 🎯 집중 테마가 사흘 이상 「강함」이고 과열이 아니면 늘리거나(최대 +5) 새 칸(최대 5), 한 번에 합계 10 이내. **바꾼 날은 실제 돈으로도 적고** ledger.change_note 를 남긴다. 글과 돈이 같아야 한다 — 섹터 판단을 글로만 쓰고 sector_views 를 안 고치는 일이 없게.
4. 판정일 ledger.skeleton.sleeve.review(12/23): port.views.edge 를 숫자로 쓰고 제안만.
5. decision.reasons 에 한 줄: "💼 기본 ±x.x% · ⚡ 킥 ±y.y% · 🎯 집중 ±w.w% · S&P ±z.z% · 판정 🟢/🔴(200일선 ±a%) · 🧭 섹터 칸 코어 대비 ±b%p". 포트가 S&P 에 5거래일 넘게 뒤지면 원인을 1쪽에 숨기지 말고 쓴다.
6. 장부를 고쳤으면 **$M/ledger/ledger.json 전체를 복사해 고친 파일**을 받은편지함에 ledger/ledger.json 으로 보낸다(조각 금지 · 누적 점수·_applied 등 다른 칸은 손대지 않음 — 그건 서버의 build_report --commit 이 씀).

## 3-D. ⚔️ 오늘의 1:1 대결 — 매일 새로 (RULES 3-A)
1. **어제 data 파일의 duel 을 복사하지 않는다.** $M/data 최근 7판의 duel 두 사람·제목을 보고 그 조합·제목은 쓰지 않는다(서버 검산이 반복을 잡는다).
2. 고르는 순서: ① 어젯밤·오늘 아침 가장 큰 움직임을 두고 **정반대로** 말한 두 사람 ② 판정이 빨리 나는 것(1~10거래일) ③ 유명하거나 장부 적중률이 높은 사람 ④ 패널 밖도 된다. WebSearch 로 오늘·어제 날짜 발언을 2~4번 찾는다.
3. 두 주장 모두 실제 발언(출처·날짜). 지어내지 않는다. 마땅치 않으면 실제 기관 리포트·기사의 강세 대표 논리 vs 약세 대표 논리.
4. data.duel: title · left_name/right_name · left_text/right_text · left_rule/right_rule(같은 지표·숫자) · verdict. 지난 대결 판정일이 오늘이면 결과를 한 줄. summary.duel_line 도 오늘 대결로.

## 4. 입력 파일 채우기
- **어제 예고 채점 — 바꾸지 않는다**: 장부 ledger.forecasts.items 를 **글자 그대로, 같은 개수로** ✓/✗/반반/보류 채점 → yesterday_grades (cls: ok/no/hold). 「보류」는 오늘 checks 에 그대로 이어 낸다.
- $M/data/_template.json 양식대로 data/YYYY-MM-DD.json 을 만든다(kick, leaders, focus, duel, qa 포함 — 최근 data 파일을 양식·분량 기준으로 보되 그날 내용은 복사하지 않는다). checks 와 forecasts_p · forecasts_base · forecasts_base_how · forecasts_if_wrong, ledger_commit.series_add, summary, kakao 줄까지.
- **🎯 「볼 것 3개」 (RULES 1-F)**: ① 예고마다 기저율을 서버에서 잰다 — manifest `"fcbase": [["CIBR","beat","SPY"], ["^GSPC","up"], …]`(형식 = `python -m src.fcbase <야후티커> above|below|band|up|down|beat … [--days N]` 의 인자들) 를 보내고 inbox_status_morning.json 의 fcbase 출력을 forecasts_base·forecasts_base_how 에 옮긴다. **기저율 0.65 넘는 예고는 내지 않는다** ② forecasts_p 는 기저율 이상, 벌어진 만큼 근거 ③ forecasts_if_wrong: 틀리면 무엇을 바꾸나(6자 이상) ④ 최근 이틀과 같은 숫자·선을 사흘째 내지 않는다 ⑤ 성적은 반반을 절반으로, 실력은 공짜 확률 대비.
- 글은 「쉽게, 그러나 빈약하지 않게」: 쉬운 말(RULES 쉬운 말 사전), 숫자 카드마다 「그래서?」 한 줄 + 출처·시각, 배분표에 실제 종목·ETF.
- **절대 규칙: 시황과 고객 제안서를 섞지 않는다.** 고객 이름·포트폴리오·제안서 내용을 어디에도 쓰지 않는다.

## 5. 검산 → 만들기 (서버가 함)
1. **보내기 1(검산)**: `inbox/msr/_morning/` 에 data/YYYY-MM-DD.json(+ 고친 ledger/ledger.json · feeds/used.json · brain/* · reviews/*)를 놓고 manifest(새 id, files, jobs 없음)를 push. 2분 뒤 inbox_status_morning.json 의 `verify` 를 읽는다 — 어긋난 숫자, ⚔️ 대결 반복, 🎯 예고 문제, 💬 qa 양식이 나오면 고쳐 다시 보낸다(새 id). 통과할 때까지(최대 4번). 날짜 차이(수집은 장중, 입력은 종가)만 남으면 리포트에 그 사실을 적고 다음 단계에서 only=force.
2. **보내기 2(만들기)**: manifest 새 id + `"jobs": [{"name": "morning-build", "args": {"day": "data/YYYY-MM-DD.json"}}]`(월초 `"only": "rerank"` · 날짜 차이만 남았으면 `"only": "force"` · 둘 다면 `"rerank-force"`). 서버가 검산 → 집중 다시 → 리포트 PDF(전체본 6쪽·요약본 1쪽)·장부 반영 → 대시보드 → 포트·킥·홈 → 올리기 → 아침 알림(☕ 오늘 한 줄)까지 한다. 3~6분 뒤 jobs_history.txt 에 `morning-build 코드=0` 이 보이면 성공. 0 이 아니면 joblog/morning-build.txt 를 읽는다 — 코드 2(쪽 넘침)면 글을 줄여(1쪽은 one_liner·숫자 카드 설명, 2쪽은 focus.why·leaders.so·korea, 3쪽은 story.lead 부터, 요약본은 leaders.short · 킥·집중·대결은 빼지 않는다) 다시 보낸다(최대 3번). 코드 4 는 검산 불합격.
3. **결과 받기**: 성공하면 `gh api -X POST repos/chkchp0702-spec/daily-app/actions/workflows/collect.yml/dispatches -f ref=main` 과 live.yml 을 켜고 5~8분 뒤 `git -C /home/claude/daily-app sparse-checkout add "/archive/market/<날짜>_<판>/" && git pull` → `archive/market/<날짜>_<판>/` 의 PDF 두 개와 kakao.txt 를 받는다. PDF 를 Read 로 열어 깨진 곳이 없는지 눈으로 확인한다(1쪽 킥 줄, 2쪽 🎯 오늘의 집중, 3쪽 오늘의 한 장, 4쪽 새 ⚔️ 대결). 깨졌으면 고쳐 다시 만든다.
4. **별도 검산자**: Agent 도구로 리포트를 만들지 않은 에이전트 하나에게 "data/YYYY-MM-DD.json 의 숫자 카드 8개, 킥·주도 테마·집중 이유의 숫자, 어제 채점 3개(ledger.forecasts.items 를 글자 그대로 채점했는지), 오늘 예고 3개(기저율이 서버 fcbase 출력과 같은지 · 0.65 넘는 공짜 문제가 아닌지 · if_wrong 이 실제 결정인지), 피드 인용 숫자, ⚔️ 대결 두 사람의 발언이 실제인지(출처 URL), 💼 비중·🧭 섹터 칸 변경 근거를 $M 의 market/latest·sectors·focus·port·conc.json·feeds/my_feed_recent.json·ledger 와 웹 출처로 대조하고 틀리거나 근거 없는 것만 목록으로" 시킨다(보내기 2 전에). 지적이 맞으면 고친다.

## 6. 올린 뒤
- **대시보드 아티팩트 갱신**: live.yml 로 새로 받은 `$M/docs/ARTIFACT_URL.txt` 의 주소를 Artifact 도구 read 로 한 번 읽은 뒤 같은 주소로 `$M/docs/artifact.html` 을 publish(새 아티팩트를 만들지 않는다 · 오늘 날짜가 들어간 새 파일인지 먼저 확인 — 아니면 건너뛰고 적는다).
- 이 세션에 claude.ai Project 도구가 있으면 `claude/시황리포트_장부.md` 의 상태 요약을 오늘 장부 기준으로 고쳐 쓴다. 없으면 건너뛴다.
- 앱에는 daily-app 의 collect 실행(07:05·07:23·07:40 …)이 리포트를 서버에서 받아 자동으로 실린다.

## 7. 사용자에게 남기기
- SendUserFile 로 요약본 PDF → 전체본 PDF 순서로 보낸다.
- 마지막 답변: 첫 줄 "M/D 아침판(휴장판/주간판) 올렸습니다 · 대시보드 갱신", 둘째 줄 "⚡ 오늘의 킥: …", 셋째 줄 "🎯 오늘 집중: 나라 · 테마 → ETF · ★종목 (추격 금지: …)", 넷째 줄 "⚔️ 오늘의 대결: A vs B — 판정 M/D", 다섯째 줄 "📰 피드: 글 N개 읽고 K개 반영 (출처) · 가장 중요했던 것", 여섯째 줄 "💼 포트: 기본 ±x.x% · 킥 ±y.y% · 🎯 집중 ±w.w% · S&P ±z.z% · 판정 🟢/🔴 · 🧭 섹터 칸 바꿈/유지 — 이유", 일곱째 줄 "🧠 두뇌: 논지 채점 x/y · 오늘 쓴 통찰", 여덟째 줄 "🎯 예고: 어제 ✓a ✗b 반반c · 오늘 3개 공짜 확률 x/y/z → 내 확률 p/q/r", 검산에서 고친 것이 있으면 한 줄, 그 아래 kakao.txt 내용을 그대로(복사용 글로). 못 찾은 숫자·발언이 있으면 한 줄.
- 어느 단계에서 막혀 리포트를 못 올렸으면 무엇이 막혔는지 쉬운 말로 한 줄(서버 상태 파일에 뭐라고 나왔는지 포함) + PushNotification 한 줄. 서버가 통째로 안 되면(상태 파일이 안 열림) data 파일까지만 만들어 inbox 에 두고 그 사실을 알린다.

절대 규칙: 숫자를 지어내지 않는다. 확인하지 못한 것을 확인했다고 쓰지 않는다. 고객 이름·포트폴리오 금지. 매수 권유 문구 금지. 비밀 값(KRX_ID·TG_TOKEN 등)은 건드리지 않는다. market-strategy-report 를 다른 길로 읽거나 쓰려 하지 않는다. daily-app 에서는 `inbox/msr/_morning` 만 쓴다.
