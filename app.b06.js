/* 📦 app.b06.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 6/7 (vidmap.js … ux1105c.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
/* ======== vidmap.js ======== */
// 자동 생성(explain/vidmap.py) — 조이 설명 영상 목록: 「화면|제목키」 → vid/<파일>.mp4  (61개 · 10/28 쉬운 말 다시 찍음 + 이번에 안 찍힌 옛 영상 유지)
window.VIDC = {
"home|☀️오늘한장": "c_home_1",
"home|🌤오늘날씨판": "c_home_2",
"home|🎞그날팔았다면": "c_home_3",
"home|🏆오늘의배지": "c_home_4",
"home|👋조이인사": "c_home_5",
"market|✅오늘할일": "c_market_1",
"prob|🎲다음장오를확률": "c_prob_1",
"prob|🎲다음장시장확률": "c_prob_1",
"port|🏁시장곳과비교": "c_port_1",
"port|🗣목소리경주": "c_port_2",
"port|🎯집중포트": "c_port_3",
"port|📋지금이렇게담으면돼요": "c_port_4",
"port|🔁비중바뀐날": "c_port_5",
"port|🌏미국강세섹터×해외동종주": "c_port_6",
"port|🧩어느칸이벌고잃었나": "c_port_7",
"port|📅날짜별성적": "c_port_8",
"port|포트개뭐가달라요": "c_port_9",
"port|🎯집중포트오르는시장이면벌때번다검증한규칙그대로": "c_port_10",
"score|🧪포트규칙검증": "c_score_1",
"score|📊성적표안내": "c_score_2",
"cup|🎯돌파임박": "c_cup_1",
"cup|이화면은☕컵모양차트를찾는화면": "c_cup_2",
"gap|이화면은📈갭상승돌파를찾는화면": "c_gap_1",
"gap|이화면은📈갭돌파를찾는화면": "c_gap_1",
"whale|오늘의큰손top": "c_whale_1",
"whale|오늘의고래top": "c_whale_1",
"whale|이화면은🐋유명펀드투자자의보유종목을보는화면": "c_whale_2",
"bond|🇰🇷국고채국민주택채권": "c_bond_1",
"bond|🏦채권안내": "c_bond_2",
"els|🎯els원금비보장": "c_els_1",
"els|🛡️elb원금지급형": "c_els_2",
"els|🎯els안내": "c_els_3",
"els|📘els구조빨리읽기": "c_els_4",
"feed|📰피드안내": "c_feed_1",
"fund|📦펀드안내": "c_fund_1",
"screen|🔎종목찾기안내": "c_screen_1",
"screen|🔎거르기안내": "c_screen_1",
"sigmore|🧠자동분석전망": "c_sigmore_1",
"sigmore|🧠두뇌논지": "c_sigmore_1",
"sigmore|📂신호상세": "c_sigmore_2",
"els|🎛els내맘대로설계기": "d_els_dz",
"accum|🚀박스돌파": "c_accum_1",
"accum|거래량이상종목": "c_accum_2",
"accum|이화면은🤫거래량이상종목참고용": "c_accum_3",
"alarm|안내": "c_alarm_1",
"danta|📺오늘알람실시간전광판": "c_danta_1",
"danta|날짜별성적": "c_danta_2",
"danta|이화면은⚡단타당일급등신호알람을모은화면": "c_danta_3",
"danta|품질c": "c_danta_4",
"idea|✍️의견남기기": "c_idea_1",
"mgr|어디에돈을넣었나": "c_mgr_1",
"mgr|보유종목top": "c_mgr_2",
"mgr|이번분기에판종목": "c_mgr_3",
"onepager|🐇🐢누가먼저말했나": "c_onepager_1",
"onepager|🧵이종목앱성적표": "c_onepager_2",
"onepager|안내": "c_onepager_3",
"_v": "6",
"sector|🧭국면신호판": "c_sector_1",
"sector|⚡장중나침반": "c_sector_2",
"prob|🧭섹터종목확률": "c_prob_2",
"sector|🌍간밤글로벌": "c_sector_3",
"sector|전일섹터등락": "c_sector_4"
};
;
/* ======== guide.js ======== */
/* 🧒 꼬마 안내원 (10/22 사용자: 둘째 아들을 닮은 3D 캐릭터로 앱 각 카테고리 설명 — Kling 영상 대신 비용 0원 안내 카드)
   · 머리 「CH Investing」 옆 작은 얼굴 버튼 하나 → 누르면 지금 보고 있는 묶음(오늘·시장·포트·신호·상품·피드)을 말풍선으로 설명
   · 처음 보는 묶음에선 얼굴 버튼에 작은 링이 한 번만 반짝 — 한 번 열면 조용히
   · 앱을 처음 연 사람에게만 인사 카드 한 번 (다시 안 뜸)
   · 대사는 아래 SAY 만 고치면 됨 (화면이 바뀌어도 다시 찍을 필요 없음) */
(function(){
  var IMG = "img/guide.jpg?v=1", BODY = "img/guide_body.jpg?v=1";
  // 🎨 10/22 Canva 로 만든 꼬마 자세 (나머지 묶음·자세히는 기본 그림) — 사용자 「일단 지금 있는 것만」
  var POSE = {intro: "img/kid_wave.jpg?v=1", home: "img/kid_thumb.jpg?v=1", mkt: "img/kid_globe.jpg?v=1", inv: "img/kid_piggy.jpg?v=1", prod: "img/kid_gift.jpg?v=1", sig: "img/kid_detect.jpg?v=1", feed: "img/kid_tablet.jpg?v=1"};  // 10/25 신호 = 돋보기 조이
  // 10/23 사용자 「꼬마 여러 표정을 적재적소에」 — 조이(Joey) 표정: 기쁨(kid_joy) · 우산(kid_umb, 조심·내림) · 엄지(kid_thumb) · 손인사(kid_wave) · 지구본(kid_globe) · 저금통(kid_piggy) · 놀람(guide_src)
  var FACE = {joy: "img/kid_joy.jpg?v=1", umb: "img/kid_umb.jpg?v=1", thumb: "img/kid_thumb.jpg?v=1", wow: "img/guide_src.jpg?v=1", think: "img/kid_think.jpg?v=1", detect: "img/kid_detect.jpg?v=1", night: "img/kid_night.jpg?v=1", worry: "img/kid_worry.jpg?v=1", tablet: "img/kid_tablet.jpg?v=1", gift: "img/kid_gift.jpg?v=1"};  // 11/03 +선물(kid_gift) · 11/02 +걱정(kid_worry)·태블릿(kid_tablet)  // 10/26 +졸린 밤(kid_night)  // 10/24 +생각(kid_think) · 10/25 +돋보기(kid_detect)
  function faceFor(L){ var t = (L || []).join(" ");     // 말 내용으로 표정 고르기
    if (/급락|폭락|큰 손실|폭풍/.test(t)) return FACE.worry;
    if (/⚠️|주의|조심|못 미|미달|아직 검증|무리|이르|손실|내림|빠진|급락/.test(t)) return FACE.umb;
    if (/🎁|새 기능|새로 나|업데이트|배지/.test(t)) return FACE.gift;
    if (/🏆|이김|적중|확인됨|✅|앞섬/.test(t)) return FACE.joy;
    if (/추정|검증 중|확률/.test(t)) return FACE.think;
    return null; }
  var MKPOSE = {prob: FACE.think, cup: FACE.detect, gap: FACE.detect, screen: FACE.detect, feed: FACE.tablet};                      // 자세히 묶음별 자세 (확률 = 생각하는 조이)
  var GRP = {home: "home", market: "mkt", sector: "mkt", prob: "mkt", flow: "mkt", port: "inv", divc: "inv", score: "inv",
             whale: "sig", cup: "sig", gap: "sig", screen: "sig", sigmore: "sig", accum: "sig", danta: "sig",
             bond: "prod", fund: "prod", els: "prod", feed: "feed", prop: "prop", luck: "luck", saju: "luck", tarot: "luck", lotto: "luck"};
  var NAME = {intro: "👋 인사", home: "🏠 오늘", mkt: "🌐 시장", inv: "💼 포트", sig: "🎯 신호", prod: "🛍️ 상품", prop: "📝 제안서", feed: "📰 피드", luck: "🔮 운세"};
  var SAY = {
    intro: ["안녕하세요! 저는 어플 안내자 조이(Joey)예요.", "어려운 투자 이야기, 제가 쉽게 알려 줄게요.", "궁금할 땐 위에 있는 제 얼굴을 눌러 주세요!"],
    home: ["여기는 「오늘」이에요.", "오늘 꼭 알아야 할 것만 한 장에 모았어요.", "카드를 누르면 그 탭으로 바로 가요.", "맨 위 동그라미를 누르면 오늘 이야기를 한 장씩 보여 줘요 — 마지막 장에서 그 탭으로 바로 가요.", "✨ 옆으로 넘기는 「오늘의 발견」엔 탭마다 가장 놀라운 숫자가 있어요.", "👀 다시 오면 그사이 바뀐 것부터 보여 줘요.", "🎯 아침마다 「코스피 오를까?」 한 번 눌러 동료랑 맞혀 봐요!", "바쁠 땐 여기만 봐도 돼요!"],
    mkt: ["「시장」에서는 어느 나라, 어느 업종으로 돈이 몰리는지 봐요.", "🌐 시황은 매일 아침 시황 리포트예요.", "🧭 나침반은 한국·미국·일본·중국·홍콩을 한눈에 보여 줘요.", "🎲 시장확률은 오늘 장이 오를 확률이에요!"],
    inv: ["「포트」는 시황 리포트대로 투자했다면 얼마 벌었을지 보여 줘요.", "뭘 얼마나 사야 하는지도 바로 보여요.", "💰 배당비교는 비슷한 종목·ETF를 몇 개 넣으면 배당을 나란히 보여 줘요 — 100만원이면 1년에 얼마, 언제 들어오는지까지요.", "📊 성적표에서는 우리 신호들이 잘 맞았는지 매일 채점해요.", "시장보다 잘했는지 늘 정직하게 비교해요!"],
    sig: ["「신호」에는 차트와 큰손이 보내는 신호가 모여요.", "🐋 고래는 큰 펀드가 새로 산 종목이에요.", "☕ 컵은 컵 모양 차트, 📈 갭은 힘차게 뛰어오른 종목이에요.", "성적이 확인된 신호만 포트에 들어가요!"],
    prod: ["「상품」에서는 채권, 펀드, ELS를 한곳에서 비교해요.", "🏦 채권은 만기 순서로도 볼 수 있어요.", "하루 세 번 새 정보로 바뀌어요!"],
    feed: ["「피드」는 매일 읽는 블로그와 텔레그램 글을 모아 둔 곳이에요.", "주요 뉴스도 15분마다 들어와요.", "중요한 글은 시황 리포트에도 들어가요!"],
    luck: ["「운세」는 생일만 넣으면 되는 곳이에요.", "🔮 오늘의 운세는 오늘 점수랑 행운의 색을 알려 줘요.", "📜 사주 리포트는 나를 읽는 긴 리포트예요. PDF로도 받아요!", "생일은 이 휴대폰에만 저장돼요!"],
    prop: ["「제안서」는 고객에게 줄 투자 제안서를 만드는 곳이에요.", "매일 아침 시황에 맞춰 9가지 기본폼이 미리 만들어져 있어요.", "상품을 고르고 금액만 넣으면 한 장 그림·PDF·PPT가 바로 나와요.", "📲 「고객에게 보여 주기」를 누르면 휴대폰을 고객에게 건네서 큰 글씨로 보여 줄 수 있어요.", "카드 제목 옆 제 얼굴을 누르면 칸마다 자세히 알려 줘요!"]
  };
  // ⓘ 자세히 (10/22 사용자: 「작은 i 설명칸에도 캐릭터 얼굴 탭 — 확률은 이렇게 계산된다, 아직 그대로 따라하긴 무리, 컵은 매일 몇 종목 돌린다, 포트는 과거로 돌려 볼 수 있다, ELS는 직접 짜고 과거 확률도 본다 … 싹 다」)
  //   숫자는 바뀌기 쉬운 것(오늘 성적)은 넣지 않고, 방법·규모·한계만. 오늘 성적은 「📊 성적표」로 보냄
  var MORE = {
    home: ["「오늘」은 앱 전체에서 오늘 꼭 볼 것만 뽑은 한 장이에요.", "포트 성적, 킥이 사고판 것, 오늘 집중할 곳, 알람, 두뇌 생각, 성적표가 한 줄씩 있어요.", "카드를 누르면 그 탭의 자세한 화면으로 바로 가요.", "매시간 새로 계산해요. 장중엔 한국 시장 숫자가 10분마다 바뀌어요."],
    market: ["🌐 시황은 매일 아침 7시 20분쯤 만드는 시장 전략 리포트예요.", "미국·한국 전날 종가, 밤사이 뉴스, 전략가 의견, 매일 읽는 블로그·텔레그램 글을 다 읽고 써요.", "「어느 나라·어느 업종으로 돈이 몰리나 → 수혜 종목·ETF → 오늘 여기 집중」 순서예요.", "리포트가 한 예고는 다음 날 맞았는지 스스로 채점해요(확률로 적고 브라이어 점수로 쌓아요).", "⚠️ 리포트는 판단을 돕는 자료예요. 매수 추천이 아니에요."],
    sector: ["🧭 나침반은 한국·미국·일본·중국·홍콩 5개 시장을 한 화면에 모은 거예요.", "오른 종목 수와 내린 종목 수, 지수 흐름, 강한 업종과 약한 업종을 보여 줘요.", "장중엔 10분마다 새 숫자로 바뀌어요.", "미국 장이 열리기 전엔 미국 지수 선물과 아시아·유럽 시장으로 미국을 미리 짐작해요."],
    divc: ["💰 배당비교는 비슷한 종목·ETF의 배당을 나란히 보여 줘요. 먼저 몇 개 비교할지 고르고, 칸마다 이름을 넣은 뒤 「비교하기」를 눌러요.", "100만원 넣으면 1년에 얼마 받는지, 한 번에 얼마인지, 몇 월에 들어오는지 그림으로 보여 줘요.", "배당이 많다고 꼭 수익이 큰 건 아니에요 — 「주가+배당 1년」 줄도 같이 봐요!"],
    flow: ["🧲 수급은 국내 주식을 누가 사고 있는지 보여 줘요. 외국인과 기관이 하루·5일·20일 동안 많이 산 종목 순서예요.", "「덩치 대비」를 누르면 회사 크기에 비해 큰돈이 들어온 순서로 바뀌어요. 종목을 누르면 종목리포트가 열려요.", "꼭 기억하세요 — 많이 샀다고 꼭 오르진 않아요. 10년을 돌려 보니 기관이 많이 산 종목은 오히려 덜 올랐어요. 고객과 이야기할 재료로만 써요."],
    prob: ["🎲 시장확률은 내일과 일주일 뒤 시장이 오를 확률이에요.", "계산법: 평소 오르는 비율(기저율)에서 출발해요. 추세·변동성·심리(공포·탐욕)·자금(크레딧·환율)·시장 폭·외국인 수급·옵션 만기·전날 미국장 같은 근거 20가지 정도를 하나씩 더해요.", "근거끼리 비슷한 말을 하는 경우가 많아서, 근거가 많아도 「서로 다른 근거 2개 정도」 몫만 믿어요.", "과거에 잘 맞힌 방법은 가중치를 올리고, 못 맞힌 방법은 내려요(매일 자동 채점).", "그래서 숫자가 50% 근처에 자주 머물러요. 억지로 부풀리지 않으려는 거예요.", "⚠️ 실전 방향 성적이 20건 넘게 쌓이고 55%를 넘기 전까진 「약간 ○○ 쪽」까지만 말해요. 아직 그대로 따라 사고팔긴 무리예요."],
    port: ["💼 포트는 「시황 리포트 배분표대로 투자했다면」을 매일 계산해요.", "💼 기본 = 뼈대(S&P500 반 + 나스닥 반, 시장이 200일선 아래면 현금·금을 늘림) · ⚡ 킥 = 기본에 확인된 신호(고래·컵·갭) 조금 · 🎯 집중 = 오르는 시장에 몰아서.", "시작일은 10/2가 기본이고, 날짜를 바꿔 다른 날부터 볼 수도 있어요.", "🎛 포트 설계기에서는 비중을 손가락으로 밀면 2008년부터 다시 굴려서 연 수익·최대 낙폭·최악의 해를 바로 보여 줘요.", "「정직」 숫자는 다음 날 진입·사고팔 때 비용까지 뺀 값이에요.", "⚠️ 실전 기록은 10/2부터라 아직 몇 주뿐이에요. 그대로 따라 하기엔 이르니, 위의 S&P500 비교 숫자와 성적표를 꼭 같이 보세요."],
    score: ["📊 성적표는 앱이 한 말이 맞았는지 한곳에서 채점하는 곳이에요.", "시황 예고, 두뇌 생각, 킥 신호, 단타 알람, 해외 상품까지 다 매겨요.", "🧪 포트 규칙 검증은 규칙을 2008~2016년에서 고르고 2017년부터 시험한 결과예요.", "🧾 시도 장부는 지금까지 시험한 규칙 조합 수예요. 많이 시험할수록 1등은 운으로도 좋아 보여서, 과거 숫자는 절반쯤 깎아서 봐요."],
    whale: ["🐋 고래는 미국 큰 펀드와 유명 투자자예요.", "SEC 13F 공시로 수익률 좋은 기관 20곳 + 유명 투자자 20곳, 모두 40곳을 매일 골라요(1년 복제 수익률 순위).", "그 40곳이 새로 사거나 크게 늘린 종목을 알려 줘요.", "🐋 원픽은 고래·차트·수급·흐름·뉴스를 100점으로 매겨 하나 뽑은 거예요.", "⚠️ 13F는 분기가 끝나고 45일 뒤에 공개돼요. 고래가 실제로 산 날보다 늦게 알게 돼요."],
    cup: ["☕ 컵은 컵 모양(U자로 내렸다 회복) + 손잡이(살짝 쉬었다 가기) 차트예요.", "한국·미국·일본·중국·홍콩 약 2만 종목을 매일 다 훑어요.", "컵 깊이, 기간, 손잡이 거래량 감소, 사상최고가와의 거리, 주가 강도 같은 조건을 모두 통과한 것만 남겨요.", "봇이 눈으로 한 번 더 걸러요(👁 눈 검사).", "⚠️ 컵이 보인다고 다 오르진 않아요. 손잡이를 「돌파」한 뒤가 중요하고, 성적표의 정직 숫자를 같이 보세요."],
    gap: ["📈 갭은 전날 종가보다 훌쩍 높게 시작해서 그 자리를 지키는 종목이에요.", "컵과 같은 5개 시장 약 2만 종목을 매일 훑어요.", "갭 직전에 평평하게 쉬던 박스, 신고가 돌파, 갭을 메우지 않고 지키는지로 모양 점수를 매겨요.", "우리 기록에선 4~8% 갭이 그보다 큰 갭보다 나았어요.", "⚠️ 비용과 다음 날 진입까지 뺀 「정직」 숫자가 기준(손익비 1.5)에 못 미치면 ⚠ 표시가 붙어요. 그땐 참고로만 보세요."],
    screen: ["🔎 아침 거르기는 약 2만 7천 종목 중 하루 거래대금 10억 원 넘는 약 1만 2천 종목을 매일 아침 걸러요.", "거름망 네 개: 🤫 조용한 돈 유입 · 🏆 섹터 1등주 · 🌱 조용한 신고가 · 🐋 고래+임원 매수+차트(미국).", "👁 「볼 만함」을 눌러 두면, 다음 날 내 눈이 거름망보다 나았는지 채점해 줘요.", "⚠️ 살펴볼 후보일 뿐, 사라는 뜻이 아니에요."],
    sigmore: ["🗂 더 보기는 있으면 좋은 자세한 자료를 모은 곳이에요.", "예고 채점, 두뇌 논지, 고래·컵·갭 상세, 단타 통계가 있어요.", "🤫 매집·⚡ 단타는 화면 대신 알림으로만 받아요. 단타는 아직 성적이 마이너스라 대부분 기록만 해요."],
    bond: ["🏦 채권은 미래에셋증권이 지금 파는 국고채·미국채·브라질국채·공사채·회사채예요.", "세금 뗀 뒤 수익률 순으로 보여 주고, 만기 순서로도 정렬할 수 있어요.", "하루 세 번 새 정보로 바뀌어요."],
    fund: ["📦 펀드는 미래에셋이 파는 공모펀드 약 1,800개예요.", "사모펀드(재간접) 수익률 순위, 전체 순위, 유형별로 볼 수 있어요.", "⚠️ 과거 수익률은 앞으로를 보장하지 않아요. 보수(수수료)도 같이 보세요."],
    els: ["🎯 ELS는 지금 청약 중인 ELS·ELB의 연 수익률·기초자산·구조·마감일을 모은 거예요.", "🎬 과거 재생: 이 조건으로 2006년부터 매일 가입했다면 몇 번이 일찍 끝나고 몇 번이 손실이었는지 보여 줘요.", "🎛 설계: 배리어·낙인·기초자산을 손가락으로 밀어 내 ELS를 직접 짜 보고, 과거 확률이 바로 바뀌어요.", "타사 비교, 📌 담아 두기(들고 있는 ELS가 지금 어디쯤인지)도 있어요.", "⚠️ 과거 계산이에요. 미래를 보장하지 않아요."],
    prop: ["📝 제안서 기본폼 9종: 국내 주식 · 국내+해외 주식 · 개인연금 · DC · IRP · 국고채 · 미국채 · 브라질국채 · ELS.", "주식·연금은 매일 아침 시황 배분표(미국 S&P500 200일선 규칙)를, 퇴직연금은 위험자산 70% 한도를 따라요.", "채권·ELS는 미래에셋이 지금 파는 상품 중 기간별 세후 1등, 원금지급형+지수형으로 골라요.", "🎚 위험 정도: 안전은 위험자산 절반을 현금성으로, 적극은 안전자산 절반을 위험자산으로 옮겨요. 과거 계산도 그 단계로 다시 해요.", "📲 고객에게 보여 주기: 상담 자리에서 휴대폰을 건네면 고객이 금액·위험 정도를 직접 눌러 보며 큰 글씨 카드를 넘겨 봐요. ✕ 두 번이면 닫혀요.", "🔗 동료 PB에게 세팅 링크를 보낼 수 있어요. 고객 이름은 안 담겨요.", "📱 한 장은 카톡용 그림, 📄 PDF는 표지부터 유의사항까지, 📊 PPT는 맑은 고딕에 차트를 PPT에서 고칠 수 있어요.", "⚖️ 모든 출력물 끝에 위험고지가 들어가고, 심의필 번호를 넣으면 같이 찍혀요.", "⚠️ 참고 자료예요. 고객에게 드리기 전 숫자와 상품 조건을 한 번 더 확인해 주세요."],
    luck: ["🔮 오늘의 운세는 그날의 기운(일진)과 태어난 사주를 비교해서 점수를 매겨요.", "일 · 돈 · 사람 · 몸 네 가지와 행운의 색 · 숫자 · 방향 · 좋은 시간을 알려 줘요.", "이번 주 막대를 누르면 다른 날 운세도 볼 수 있어요. 가족 · 고객을 여러 명 넣어 두면 「모두의 오늘」로 한눈에 봐요.", "인터넷 · API 없이 휴대폰 안에서 계산해요. 생일은 이 휴대폰에만 저장돼요.", "⚠️ 재미로 보는 참고예요. 투자 판단의 근거가 아니에요."],
    lotto: ["🎱 로또는 1회부터 지금까지 모든 당첨 번호를 분석해요.", "솔직히 말하면, 어떤 번호든 1등 확률은 똑같아요. 과거 번호로 다음 번호는 못 맞혀요.", "대신 1~3등은 당첨자끼리 나누니까, 남들이 덜 찍는 조합이면 혼자 받을 수 있어요. 3·4등 당첨자 수로 사람들이 좋아하는 번호를 재서 덜 겹치는 조합을 만들어요.", "검증해 보니 덜 겹친다고 본 쪽이 1등을 탔을 때 평균 약 25% 더 받았어요.", "⚠️ 로또는 기대 수익이 마이너스인 놀이예요. 즐길 만큼만!"],
    tarot: ["🃏 타로는 질문을 적고 카드를 고르면, 그 질문에 맞춰 풀어 줘요.", "질문을 읽어서 투자 · 돈 · 연애 · 결혼 · 직장 · 사업 · 시험 · 건강 · 관계 · 이사 중 어떤 주제인지, 「해도 될까 · 언제 · 어떻게 · A냐 B냐」 중 무엇을 묻는지 알아내요.", "78장 카드마다 주제별 해석을 미리 써 둬서 인터넷 · API 비용 없이 바로 풀어요.", "더 깊게 보고 싶으면 「AI에 붙여 심화 해석 듣기」로 복사해 Claude · ChatGPT · Gemini 등 쓰는 AI에 붙여 넣어요. 해석 기준과 답 형식이 들어 있어 어느 AI든 비슷하게 풀어요.", "⚠️ 재미와 자기 성찰용이에요. 투자 판단의 근거가 아니에요."],
    saju: ["📜 사주 리포트는 예전 「나를 읽는 리포트」 모양 그대로예요.", "8글자 · 숨은 글자 · 관계도 · 간판 · 가장 필요한 기운 · 특별한 표시 · 다섯 기운 · 재물 · 10년 대운 · 연도별 · 올해 월별 · 배우자 · 별자리 · 생활 · 정리까지.", "만세력(절기 · 음력 · 윤달), 서머타임, 태어난 곳 경도까지 천문 계산식으로 직접 계산해요.", "📄 PDF로 저장해서 보낼 수 있어요. 더 깊은 글은 「AI에 붙여 심화판 받기」로 복사해 쓰는 AI 채팅에 붙여 넣으면 돼요(API 비용 없음).", "⚠️ 전통 이론에 따른 해석이고, 과학적 예측이 아니에요."],
    feed: ["📰 피드는 매일 읽는 블로그·텔레그램 글과 주요 뉴스를 한곳에 모았어요.", "15분마다 새 글을 가져와요.", "📣 채널 성적표: 채널이 이름을 부른 종목을 5일·20일 뒤 채점해서, 어느 채널 말이 잘 맞는지 보여 줘요.", "중요한 글은 다음 날 시황 리포트 재료로 들어가요."]
  };
  var MORE_ALIAS = {accum: "sigmore", danta: "sigmore"};
  // 10/26 사용자 「조이를 탭하면 그 화면과 기능을 영상으로 설명」 — 실제 앱 화면을 찍어 HyperFrames 로 만든 세로 영상(소리 없음, 자막)
  //   t_<탭> = 탭 설명 · m_<자세히> = ⓘ 자세히. 영상이 없으면 지금처럼 글 말풍선
  var VID = {t_home: 1, t_mkt: 1, t_inv: 1, t_sig: 1, t_prod: 1, t_feed: 1, m_home: 1, m_market: 1, m_sector: 1, m_prob: 1, m_port: 1, m_score: 1,
             m_whale: 1, m_cup: 1, m_gap: 1, m_screen: 1, m_sigmore: 1, m_bond: 1, m_fund: 1, m_els: 1, m_feed: 1};
  var VIDV = "6";
  function vidOf(g, mk){ var k = mk ? "m_" + mk : "t_" + g; return VID[k] ? "vid/" + k + ".mp4?v=" + VIDV : ""; }
  // 10/26 사용자 「조이가 있는 모든 곳에 설명 영상」 — 카드 머리·접기 ⓘ·「ⓘ 설명」·「ⓘ …」 접는 칸: vidmap.js(window.VIDC, 자동 생성)에 「화면|제목」 → 파일
  function vkey(t){ return String(t || "").replace(/[\s\d·:%,.()\[\]~\-–—+/…?!「」『』()−▲▼△▽›‹]/g, "").replace(/(미국|한국|일본|중국|홍콩)시장은어느(국면|장분위기)인가/g, "").toLowerCase().slice(0, 24); }   // 10/27 고른 나라에 따라 바뀌는 부제는 빼고
  // 10/27 사용자 「조이 사진 있는 곳은 다」 — ① 이 화면에서 같은 제목 ② 다른 화면(시트·종목리포트 등)에서 같은 제목 ③ 없으면 이 화면 설명 영상(글 먼저, ▶ 로 보기)
  function vid1(title){ var m = window.VIDC; if (!m) return ""; var vk = vkey(title); if (!vk || vk === "설명") return "";   // 10/27: 제목 없는 회색 설명 줄(「설명」)이 엉뚱한 카드 영상(펀드 화면에서 ELS 설계 영상)에 붙던 것 → 화면 소개 영상으로
    var k = ((typeof cur !== "undefined" && cur) || "") + "|" + vk, f = m[k];
    if (!f && vk) for (var x in m) if (x.slice(x.indexOf("|") + 1) === vk){ f = m[x]; break; }
    return f ? "vid/" + f + ".mp4?v=" + (m._v || VIDV) : ""; }
  // 🗣 10/28 쉬운 말: 제목 그대로(새로 찍은 영상) → 바꾸기 전 글(easyBack) → 낱말 되돌림(easyBackTerms) 순서로 찾음
  function vidFor(title){ var r = vid1(title); if (r) return r;
    var b = window.easyBack ? easyBack(title) : title; if (b !== title && (r = vid1(b))) return r;
    return window.easyBackTerms ? vid1(easyBackTerms(b)) : ""; }
  function vidScreen(){ var c = (typeof cur !== "undefined" && cur) || "", k = VID["m_" + (MORE_ALIAS[c] || c)] ? "m_" + (MORE_ALIAS[c] || c) : "t_" + curGrp(); return VID[k] ? "vid/" + k + ".mp4?v=" + VIDV : ""; }
  function vidHtml(vs, wait){ return vs ? '<div class="gd-vw"><video class="gd-v" src="' + vs + '" muted playsinline preload="metadata" controls disablepictureinpicture></video></div>' : ""; }   // 🎨 11/04: 자동 재생 안 함(56MB) — ▶ 누를 때만
  var MORE_NAME = {home: "🏠 오늘", market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", port: "💼 포트", score: "📊 성적표", whale: "🐋 고래", cup: "☕ 컵", gap: "📈 갭", screen: "🔎 거르기", sigmore: "🗂 더 보기", bond: "🏦 채권", fund: "📦 펀드", els: "🎯 ELS", feed: "📰 피드", luck: "🔮 오늘의 운세", saju: "📜 사주 리포트", tarot: "🃏 타로", lotto: "🎱 로또"};
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function seen(){ return ls("gd_seen") || {}; }
  function mark(g){ var s = seen(); s[g] = 1; ls("gd_seen", s); }
  function curGrp(){ var k = (typeof cur !== "undefined" && cur) || (window.store && store.tab) || "home"; return GRP[k] || "home"; }

  var css = document.createElement("style");
  css.textContent =
    "#gdbtn{width:28px;height:28px;padding:0;margin:0 0 0 8px;border:1.5px solid var(--line);border-radius:50%;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat;cursor:pointer;position:relative;flex:none;vertical-align:middle}" +
    "#gdbtn.new:after{content:'';position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--acc);animation:gdring 1.6s ease-out 3}" +
    "@keyframes gdring{0%{opacity:.9;transform:scale(.85)}100%{opacity:0;transform:scale(1.35)}}" +
    "#gdq{position:fixed;inset:0;z-index:9998;background:rgba(5,8,14,.55);display:flex;align-items:flex-end;justify-content:center;animation:gdfade .2s ease}" +
    "@keyframes gdfade{from{opacity:0}to{opacity:1}}" +
    "#gdq .gd-sh{width:100%;max-width:560px;background:var(--panel);border:1px solid var(--line);border-bottom:0;border-radius:22px 22px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 14px);animation:gdup .28s cubic-bezier(.2,.8,.2,1)}" +
    "@keyframes gdup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}" +
    "#gdq .gd-row{display:flex;gap:12px;align-items:flex-end}" +
    "#gdq .gd-kid{width:104px;height:170px;flex:none;border-radius:16px;background:#f3e6d6 url(" + BODY + ") center top/cover no-repeat;animation:gdhop 2.4s ease-in-out infinite}" +
    "@keyframes gdhop{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}" +
    "#gdq .gd-bub{flex:1;min-height:150px;background:var(--panel2);border:1px solid var(--line);border-radius:16px 16px 16px 4px;padding:12px 14px;font-size:15px;line-height:1.55;color:var(--text)}" +
    "#gdq .gd-t{font-size:12.5px;color:var(--sub);margin-bottom:6px}" +
    "#gdq .gd-l{opacity:0;transform:translateY(4px);transition:opacity .35s,transform .35s;margin:0 0 5px}" +
    "#gdq .gd-l.on{opacity:1;transform:none}" +
    "#gdq .gd-ft{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;align-items:center}" +
    "#gdq .gd-ft button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    "#gdq .gd-ft button.on{color:var(--text);border-color:var(--acc)}" +
    "#gdq .gd-x{margin-left:auto;color:var(--text)!important}" +
    "#gdq .gd-vw{display:flex;justify-content:center}" +
    ".tz-kid,.tz-pk{cursor:pointer;-webkit-tap-highlight-color:transparent}.tz-kid:active,.tz-pk:active{transform:scale(.96)}#gdq .gd-txt .gd-kid{cursor:pointer}" +
    "#gdq .gd-v{display:block;height:min(66vh,820px);max-width:100%;aspect-ratio:9/16;border-radius:16px;background:#e9eefb;object-fit:contain}" +
    "#gdq .gd-hasv .gd-row{display:none}#gdq .gd-hasv.gd-txt .gd-row{display:flex}#gdq .gd-hasv.gd-txt .gd-vw{display:none}" +
    "#gdq .gd-more .gd-bub{max-height:52vh;overflow-y:auto;font-size:14.5px}#gdq .gd-more .gd-kid{width:84px;height:138px}" +
    "#main > .hero.gd-on h1:after{content:'';display:inline-block;width:28px;height:28px;margin-left:6px;vertical-align:-3px;border-radius:50%;border:1.5px solid var(--line);background:#f3e6d6 url(" + IMG + ") center/cover no-repeat}" +
    ".gd-i{display:inline-block;width:15px;height:15px;border-radius:50%;vertical-align:-2px;margin:0 1px;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat;box-shadow:0 0 0 1px var(--line);font-style:normal}" +
    // 10/22 사용자 「작은 꼬마 잘 안 눌러져」 — 카드 머리 꼬마는 진짜 요소(.gd-b)로 크게(26px) + 보이지 않는 누르는 칸을 사방 12px 넓힘
    "h3.tt-h:after,.mk-lab.tt-h:after,h3.tt-h.tt-on:after,.mk-lab.tt-h.tt-on:after{content:none!important;display:none!important}" +
    ".gd-b{display:inline-block;flex:none;width:26px;height:26px;margin-left:6px;border-radius:50%;vertical-align:-6px;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat;box-shadow:0 0 0 1.5px var(--line);position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".gd-b:after,.gd-i:after{content:'';position:absolute;inset:-12px;border-radius:50%}" +
    ".gd-i{position:relative;width:18px!important;height:18px!important;vertical-align:-4px!important}" +
    ".gd-b:active,.gd-i:active{transform:scale(.9)}" +
    ":root:not(.td-off) .td-n::before{content:''!important;width:14px;height:14px;top:3px!important;border-radius:50%;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat}" +
    "@media (prefers-reduced-motion:reduce){#gdq .gd-kid,#gdbtn.new:after{animation:none}}";
  document.head.appendChild(css);

  var timer = null;
  function open(g){
    close();
    var q = document.createElement("div"); q.id = "gdq";
    var mk = g.indexOf("more:") === 0 ? g.slice(5) : null; if (mk) mk = MORE_ALIAS[mk] || mk;
    var L = mk ? (MORE[mk] || SAY.home) : (SAY[g] || SAY.home);
    var pz = POSE[g] || (mk && (MKPOSE[mk] || faceFor((MORE[MORE_ALIAS[mk] || mk] || []).slice(-1)) || POSE[GRP[mk] || ""]));
    var vs = vidOf(g, mk) || (g === "intro" ? vidFor("👋 조이 인사") : "") || vidOf(curGrp()); var fb = "";
    q.innerHTML = '<div class="gd-sh' + (mk ? ' gd-more' : '') + (vs ? ' gd-hasv' : '') + '" role="dialog" aria-label="안내자 조이">' +
      (vs ? '<div class="gd-vw"><video class="gd-v" src="' + vs + '" muted playsinline preload="metadata" controls disablepictureinpicture></video></div>' : '') +
      '<div class="gd-row"><div class="gd-kid" aria-hidden="true"' + (pz ? ' style="background-image:url(' + pz + ')"' : '') + '></div><div class="gd-bub"><div class="gd-t">' + (mk ? (MORE_NAME[mk] || "") + ' 자세히' : NAME[g] + ' 설명') + '</div>' +
      L.map(function(s){ return '<p class="gd-l">' + s + '</p>'; }).join("") + '</div></div><div class="gd-ft">' +
      (mk ? '' : ["home", "mkt", "inv", "sig", "prod", "feed"].map(function(k){ return '<button data-g="' + k + '"' + (k === g ? ' class="on"' : '') + '>' + NAME[k] + '</button>'; }).join("")) +
      (vs ? '<button class="gd-tx">📝 글로 보기</button>' : fb ? '<button class="gd-tx">▶ 이 화면 영상</button>' : '') + '<button class="gd-x">닫기</button></div></div>';
    document.body.appendChild(q);
    var ps = q.querySelectorAll(".gd-l"), i = 0;
    function next(){ if (i < ps.length) ps[i++].classList.add("on"); if (i >= ps.length) { clearInterval(timer); timer = null; } }
    var sh = q.querySelector(".gd-sh"), vv = q.querySelector(".gd-v");
    if (vv && fb){ vv.onerror = function(){ var t = q.querySelector(".gd-tx"); if (t) t.remove(); sh.classList.remove("gd-hasv", "gd-txt"); }; }
    else if (vv){ var pp = vv.play && vv.play(); if (pp && pp.catch) pp.catch(function(){}); vv.onerror = function(){ sh.classList.remove("gd-hasv"); var t = q.querySelector(".gd-tx"); if (t) t.remove(); }; }
    if (!vs) { next(); timer = setInterval(next, mk ? 750 : 1100); }
    q.onclick = function(e){
      var b = e.target.closest && e.target.closest("button");
      if (e.target === q || (b && b.classList.contains("gd-x"))) return close();
      if (b && b.dataset.g) return open(b.dataset.g);
      if (vv && e.target.closest && e.target.closest(".gd-kid") && sh.classList.contains("gd-txt")){ b = q.querySelector(".gd-tx"); }   // 말풍선 옆 조이 그림 → 영상으로
      if (b && b.classList.contains("gd-tx")){                                   // 영상 ↔ 글
        var toTxt = sh.classList.toggle("gd-txt"); b.textContent = toTxt ? "▶ 영상으로 보기" : "📝 글로 보기";
        if (toTxt){ if (vv) vv.pause(); while (i < ps.length) next(); } else if (vv){ var p2 = vv.play(); if (p2 && p2.catch) p2.catch(function(){}); }
        return;
      }
      if (timer) { while (i < ps.length) next(); }      // 말풍선을 누르면 남은 줄을 한 번에
    };
    if (g !== "intro" && !mk) { mark(g); var bt = document.getElementById("gdbtn"); if (bt) bt.classList.remove("new"); }
  }
  function close(){ if (timer) { clearInterval(timer); timer = null; } var q = document.getElementById("gdq"); if (q) { var v = q.querySelector("video"); if (v) { try { v.pause(); v.removeAttribute("src"); v.load(); } catch(x) {} } q.remove(); } }
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") close(); });
  // ── 10/22 사용자 「세세한 곳들도 다 꼬마 설명으로」 — 앱 곳곳의 ⓘ(카드 머리·회색 설명 줄·「ⓘ 설명」·정직 칩 같은 풍선 도움말·「ⓘ 이 화면은?」)
  //    → 글자 ⓘ 는 꼬마 얼굴로 바꾸고, 누르면 그 설명을 꼬마 말풍선으로. 그래프 위 점 도움말(svg)은 손가락으로 훑는 것이라 그대로 둠
  function esc(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function plain(h){ var d = document.createElement("div"); d.innerHTML = String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n"); return d.textContent || ""; }
  function paras(t){ return String(t || "").replace(/ⓘ/g, "").split(/\n+/).map(function(x){ return x.replace(/\s+/g, " ").trim(); }).filter(function(x){ return x; }); }
  function say(title, L, foot, face){
    if (!L || !L.length) return;
    close();
    var q = document.createElement("div"); q.id = "gdq";
    var vs = vidFor(title), fb = vs ? "" : vidScreen();
    q.innerHTML = '<div class="gd-sh gd-more' + (vs || fb ? ' gd-hasv' : '') + (fb ? ' gd-txt' : '') + '" role="dialog" aria-label="안내자 조이">' + vidHtml(vs || fb, !!fb) + '<div class="gd-row"><div class="gd-kid" aria-hidden="true" style="background-image:url(' + (face || faceFor(L) || BODY) + ')"></div><div class="gd-bub"><div class="gd-t">' + esc(title || "설명") + '</div>' +
      L.slice(0, 14).map(function(x){ return '<p class="gd-l">' + esc(x) + '</p>'; }).join("") + '</div></div><div class="gd-ft">' + (foot || "") + (vs ? '<button class="gd-tx">📝 글로 보기</button>' : fb ? '<button class="gd-tx">▶ 이 화면 영상</button>' : '') + '<button class="gd-x">닫기</button></div></div>';
    document.body.appendChild(q);
    var ps = q.querySelectorAll(".gd-l"), i = 0;
    function next(){ if (i < ps.length) ps[i++].classList.add("on"); if (i >= ps.length) { clearInterval(timer); timer = null; } }
    var sh = q.querySelector(".gd-sh"), vv = q.querySelector(".gd-v");
    if (vv && fb){ vv.onerror = function(){ var t = q.querySelector(".gd-tx"); if (t) t.remove(); sh.classList.remove("gd-hasv", "gd-txt"); }; }
    else if (vv){ var pp = vv.play && vv.play(); if (pp && pp.catch) pp.catch(function(){}); vv.onerror = function(){ sh.classList.remove("gd-hasv"); var t = q.querySelector(".gd-tx"); if (t) t.remove(); if (!timer && i < ps.length){ next(); timer = setInterval(next, 450); } }; }
    if (!vs) { next(); timer = setInterval(next, 450); }
    q.onclick = function(e){
      var b = e.target.closest && e.target.closest("button");
      if (vv && e.target.closest && e.target.closest(".gd-kid") && sh.classList.contains("gd-txt")){ b = q.querySelector(".gd-tx"); }   // 말풍선 옆 조이 그림 → 영상으로
      if (b && b.dataset.goto){ setTimeout(close, 0); return; }          // 「관련 화면」 → 앱의 원래 이동 처리에 맡김
      if (e.target === q || (b && b.classList.contains("gd-x"))) return close();
      if (b && b.classList.contains("gd-tx")){                                   // 영상 ↔ 글
        var toTxt = sh.classList.toggle("gd-txt"); b.textContent = toTxt ? "▶ 영상으로 보기" : "📝 글로 보기";
        if (toTxt){ if (vv) vv.pause(); while (i < ps.length) next(); } else if (vv){ var p2 = vv.play(); if (p2 && p2.catch) p2.catch(function(){}); }
        return;
      }
      if (timer) { while (i < ps.length) next(); }
    };
  }
  window.gdSay = say;
  // 10/27 사용자 「조이 사진 있는 곳은 다 탭하면 영상」 — 오늘 탭 날씨판 꼬마(.tz-kid) · 세 컷 만화 꼬마(.tz-pk) · 첫 화면 꼬마(#kidsplash)
  var KIDX = {
    hero: ["🌤 오늘 날씨판", ["맨 위 날씨판은 오늘 시장을 날씨로 보여 줘요.", "크게 오르면 ☀️ 맑음, 조금 오르면 🌤, 제자리면 ☁️ 흐림, 내리면 🌧 비, 크게 내리면 ⛈ 폭풍이에요.", "큰 숫자는 지금 가장 중요한 숫자 하나예요.", "날씨판을 누르면 시장 탭으로 가요. 카드를 길게 누르면 제가 한 줄씩 요약해 줘요!"]],
    comic: ["🎞 그날 팔았다면?", ["2000년 이후 같은 급락일들을 되짚은 세 컷 만화예요.", "① 깜짝 놀라 팔고 싶어지는 순간 · ② 그날 팔았다면 놓친 몫 · ③ 반대로 더 샀다면 120거래일 뒤 평균.", "과거 평균일 뿐, 앞으로를 약속하지는 않아요."]]
  };
  window.addEventListener("click", function(ev){
    var t = ev.target; if (!t.closest || t.closest("#gdq")) return;
    var k = t.closest(".tz-kid") ? "hero" : t.closest(".tz-pk") ? "comic" : null; if (!k) return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    say(KIDX[k][0], KIDX[k][1], "", k === "comic" ? "img/guide_src.jpg?v=1" : null);
  }, true);
  (function(){ var sp = document.getElementById("kidsplash"); if (!sp) return;
    sp.addEventListener("click", function(){ setTimeout(function(){ if (!document.getElementById("gdq")) { ls("gd_intro", 1); open("intro"); } }, 480); }); })();
  function titleOf(el){
    var c = el.closest && (el.closest(".fold") || el.closest("section.card") || el.closest(".card"));
    var h = c && c.querySelector("h3, .fold-h, .mk-lab, summary");
    var t = h ? (h.innerText || h.textContent || "") : "";
    return t.replace(/ⓘ|▴|▾|▸|▼|▲|접기|펼치기/g, "").replace(/\s+/g, " ").trim().slice(0, 40) || ((MORE_NAME[(typeof cur !== "undefined" && cur) || ""] || "") + " 안내").trim() || "설명";
  }
  function inGuide(t){ return t.closest && t.closest("#gdq"); }
  // ① 풍선 도움말(data-tip) — 그래프(svg) 밖의 칩·줄만
  function tipEl(t){ var x = t.closest && t.closest("[data-tip]"); return x && !x.closest("svg") && !inGuide(x) && x.getAttribute("data-tip") ? x : null; }
  window.addEventListener("pointerdown", function(ev){ if (tipEl(ev.target)) ev.stopImmediatePropagation(); }, true);
  window.addEventListener("click", function(ev){
    var t = ev.target; if (!t.closest || inGuide(t)) return;
    var x = tipEl(t);
    if (x && !t.closest("a,input,select,textarea,[data-goto],[data-op]")){
      ev.stopImmediatePropagation(); ev.preventDefault();
      var lab = (x.innerText || x.textContent || "").replace(/ⓘ/g, "").replace(/\s+/g, " ").trim();
      return say(lab && lab.length <= 30 ? lab : titleOf(x), paras(plain(x.getAttribute("data-tip"))));
    }
    // ② 회색 설명 줄(ⓘ 첫 마디…) — 펼치는 대신 꼬마가 읽어 줌
    var n = t.closest(".td-n");
    if (n && !document.documentElement.classList.contains("td-off") && !t.closest("a,button")){
      ev.stopImmediatePropagation(); return say(titleOf(n), paras(n.innerText || n.textContent));
    }
    // ③ 「ⓘ 설명」 단추(나침반)
    var nb = t.closest(".nt-b");
    if (nb){ var nt = nb.nextElementSibling; ev.stopImmediatePropagation(); return say(titleOf(nb), paras(nt ? (nt.innerText || nt.textContent) : "")); }
    // ④ 「ⓘ 이 화면은? / 포트 4개, 뭐가 달라요?」 같은 접는 칸
    var sm = t.closest("summary");
    if (sm && sm.querySelector(".gd-i") && !t.closest("a,button")){
      var d = sm.parentNode; ev.preventDefault(); ev.stopImmediatePropagation();
      var body = [].filter.call(d.children, function(c){ return c !== sm; }).map(function(c){ return c.innerText || c.textContent; }).join("\n");
      return say((sm.innerText || sm.textContent).replace(/ⓘ|눌러서 열고 닫기/g, "").replace(/\s+/g, " ").trim(), paras(body));
    }
    // ⑤ 카드 머리 ⓘ(nav2 의 「이 카드는」 칸) — 칸이 만들어지면 그 내용을 꼬마 말풍선으로 옮기고 칸은 닫음
    var hh = t.closest("h3.tt-h, .mk-lab.tt-h") || (t.closest(".tt-i") && t.closest(".fold-h"));
    if (hh && !t.closest("a,input,select,label,textarea,[data-op],[data-goto]") && (t.closest(".tt-i") || !t.closest("button"))){
      setTimeout(function(){
        var bx = hh.nextElementSibling; if (!bx || !bx.classList.contains("tt-x")) return;
        bx.hidden = true; hh.classList.remove("tt-on");
        var L = [], w = bx.querySelector(".ttx-what"), em = bx.querySelector(".ttx-h em");
        if (em && em.textContent.trim()) L.push(em.textContent.trim());
        if (w && w.textContent.trim() && (!em || w.textContent.trim() !== em.textContent.trim())) L.push(w.textContent.trim());
        [].forEach.call(bx.querySelectorAll(".ttx-n > :not(small)"), function(p){ L = L.concat(paras(p.innerText || p.textContent)); });
        var go = [].map.call(bx.querySelectorAll(".ttx-l"), function(b){ return '<button data-goto="' + esc(b.dataset.goto) + '">' + esc(b.textContent) + '</button>'; }).join("");
        var b0 = bx.querySelector(".ttx-h b");
        say((b0 && b0.textContent.trim()) || titleOf(hh), L, go);
      }, 0);
    }
  }, true);
  // 글자 ⓘ → 꼬마 얼굴 (새로 그려질 때마다 · 잠깐 모았다가 한 번에)
  var swT = null;
  function swap(){
    swT = null;
    [].forEach.call(document.querySelectorAll("h3.tt-h, .mk-lab.tt-h"), function(h){
      if (h.querySelector(":scope > .gd-b")) return;
      var b = document.createElement("i"); b.className = "gd-b"; b.setAttribute("aria-label", "조이 설명"); h.appendChild(b);
    });
    [document.getElementById("main"), document.getElementById("sheet")].forEach(function(root){
      if (!root) return;
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: function(x){ var p = x.parentNode;
        return p && !/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/.test(p.nodeName) && x.nodeValue.indexOf("ⓘ") >= 0 && !(p.closest && (p.closest("svg") || p.closest("#gdq"))) ? 1 : 3; }}), L = [], x;
      while ((x = w.nextNode())) L.push(x);
      L.forEach(function(tn){
        var parts = tn.nodeValue.split("ⓘ"), f = document.createDocumentFragment();
        parts.forEach(function(s, k){ if (k){ var i = document.createElement("i"); i.className = "gd-i"; i.setAttribute("aria-label", "조이 설명"); f.appendChild(i); } if (s) f.appendChild(document.createTextNode(s)); });
        tn.parentNode.replaceChild(f, tn);
      });
    });
  }
  new MutationObserver(function(){ if (!swT) swT = setTimeout(swap, 250); }).observe(document.documentElement, {childList: true, subtree: true, characterData: true});

  // 탭 머리(제목·꼬마 얼굴)를 누르면 소개 글 대신 바로 꼬마 설명 (nav2 의 소개 글 펼치기보다 먼저 잡음)
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest("#main > .hero.gd-on"); if (!h || ev.target.closest("button,a")) return;
    var k = (typeof cur !== "undefined" && cur) || ""; if (!(MORE[k] || MORE_ALIAS[k])) return;
    ev.stopImmediatePropagation(); ev.stopPropagation(); open("more:" + k);
  }, true);

  function addBtn(){
    var brand = document.querySelector("header .top .brand"); if (!brand) return;
    var b = document.getElementById("gdbtn");
    if (!b){
      b = document.createElement("button"); b.id = "gdbtn"; b.setAttribute("aria-label", "안내자 조이 — 이 화면 설명");
      b.onclick = function(e){ e.stopPropagation(); open(curGrp()); };
      brand.parentNode.insertBefore(b, brand.nextSibling);
    }
    b.classList.toggle("new", !seen()[curGrp()]);
    // 10/22 사용자 「i 를 꼬마 얼굴로, 누르면 바로 꼬마 설명」 — 설명이 있는 탭은 머리에 표시만 달아 둠
    var h = document.querySelector("#main > .hero"), k = (typeof cur !== "undefined" && cur) || "";
    if (h) h.classList.toggle("gd-on", !!(MORE[k] || MORE_ALIAS[k]));
  }
  // 탭을 옮길 때마다 링 상태만 다시 (go 를 감쌈)
  function hook(){
    if (typeof window.go !== "function" || window.go.__gd) return;
    var g0 = window.go;
    window.go = function(){ var r = g0.apply(this, arguments); try { addBtn(); } catch(x) {} return r; };
    window.go.__gd = 1;
  }
  function init(){
    addBtn(); hook();
    if (!ls("gd_intro") && !/[?&]embed=1/.test(location.search)) setTimeout(function(){ if (document.getElementById("gdq") || ls("gd_intro") || document.getElementById("wowob")) return; ls("gd_intro", 1); open("intro"); }, 2900);   // 🎨 11/04: wow.js 3장 안내가 대신   // 인사 화면(2초) 뒤
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  setTimeout(function(){ addBtn(); hook(); }, 900);
  window.gdOpen = open;
})();
;
/* ======== easy.js ======== */
/* 🗣 쉬운 말 (10/28 사용자 「여전히 어렵고 복잡하다는 말을 많이 들어」 → 「쉬운 말로 바꾸는 건 하고」 → 「쉬운 말 전체로」)
   만든 사람 말(킥·고래·국면·나침반·두뇌·뼈대·정직 계산·매집·표본·손익비…)을 처음 보는 사람도 아는 말로.
   적용: ① 앱 화면 글자·풍선 도움말 ② 그림으로 그리는 장(오늘 한 장·고객 한 장 캔버스) ③ 휴대폰 푸시 알림(sw.js 가 이 파일을 불러 씀) ④ 조이 말풍선·용어 풀이.
   조사(이/가·은/는·을/를·과/와·으로/로·이에요/예요)는 바뀐 말 받침에 맞춰 고침. 낱말 앞뒤가 다른 한글이면 안 바꿈(킥오프 등).
   끄기(원복): localStorage easy = "off" (화면·그림) · 코드째 원복은 index.html 의 easy.js 줄과 sw.js 의 importScripts 줄 빼기.
   조이 영상 찾기(guide.js vidFor)는 제목 그대로 → easyBack(바꾼 글→원래 글) → easyBackTerms(낱말 되돌림) 순서. */
(function(G){
  var R = [
    // [원래 말(정규식), 쉬운 말, 앞 경계 검사, 바로 뒤에 오면 안 바꾸는 것]
    ["공격\\(킥\\) 포트", "공격 포트"], ["킥 포트", "공격 포트"], ["공격\\(킥\\)", "공격"], ["킥 슬리브", "공격 몫"], ["슬리브", "몫"],
    ["킥", "공격", 1],
    ["시장확률", "오를 확률"],
    ["국면 신호판", "장 분위기판"], ["국면", "장 분위기", 1],
    ["나침반", "시장 흐름", 1],
    ["고래들", "큰손들", 1], ["고래", "큰손", 1],
    ["두뇌 논지", "자동 분석 전망"], ["두뇌", "자동 분석", 1], ["논지", "전망", 1],
    ["정직 계산", "비용 뺀 계산"], ["정직 성적", "비용 뺀 성적"], ["정직 방식", "비용 뺀 방식"], ["정직 숫자", "비용 뺀 숫자"], ["정직", "비용 뺀", 1],
    ["예고 채점", "예측 채점"], ["예고", "예측", 1],
    ["뼈대", "기본 틀", 1],
    ["변동성 맞춤", "흔들림 조절"], ["변동성", "출렁임", 1],
    ["횡보", "제자리", 1],
    ["아웃퍼폼", "시장보다 나음"], ["언더퍼폼", "시장보다 못함"], ["익스포저", "비중", 1], ["모멘텀", "오름세", 1],
    ["거르기", "종목 찾기", 1],
    ["조용한 매집", "조용히 사 모으기"], ["매집", "사 모으기", 1],
    ["표본", "사례", 1],
    ["손익비", "번 돈÷잃은 돈", 1],
    ["적중률", "맞힌 비율", 1],
    ["최대 낙폭", "가장 크게 빠진 폭"], ["낙폭", "하락폭", 1],
    ["코어", "기본", 1],
    ["컵앤핸들", "컵 모양 차트"], ["핸들", "손잡이", 1], ["피벗", "돌파 기준점", 1],
    ["알파", "시장보다 더 번 몫", 1],
    ["헤지", "손실 막기", 1],
    ["샤프", "위험 대비 수익", 1],
    // 🎨 11/04 용어 2차 (사용자 「초보자도 쉽게」)
    ["거름망", "골라낸 종목", 1], ["돌파 임박", "곧 뚫을 듯"], ["횡보장", "옆으로 가는 장"], ["베리어", "기준선", 1], ["배리어", "기준선", 1],
    ["낙인", "손실 시작선", 1], ["리밸런싱", "비중 다시 맞추기", 1], ["드로다운", "고점 대비 하락", 1], ["밸류에이션", "값이 싼지 비싼지", 1],
    ["컨센서스", "전문가 평균 예상", 1], ["리스크", "위험", 1, "온|오프"], ["스프레드", "금리 차이", 1], ["듀레이션", "금리 민감도", 1],
    ["200일 평균선", "장기 평균선"], ["200일 평균", "장기 평균"], ["200일선", "장기 평균선"],   // 🔰 11/05
    ["컵", "컵 차트", 1, " ?차트| ?모양|앤"],
    ["갭", "갭 상승", 1, " ?상승| ?메|\\)"]
  ];
  var EXACT = {"☕ 컵": "☕ 컵 차트", "📈 갭": "📈 갭 상승"};
  var PART = "(이에요|예요|으로|로|이|가|은|는|을|를|과|와)?";
  function jong(w){ var c = w.charCodeAt(w.length - 1) - 0xAC00; if (c < 0 || c > 11171) return -1; return c % 28; }   // 0 = 받침 없음, 8 = ㄹ
  function fix(w, p){
    if (!p) return w; var j = jong(w); if (j < 0) return w + p; var has = j > 0;
    switch (p){
      case "이": case "가": return w + (has ? "이" : "가");
      case "은": case "는": return w + (has ? "은" : "는");
      case "을": case "를": return w + (has ? "을" : "를");
      case "과": case "와": return w + (has ? "과" : "와");
      case "으로": case "로": return w + (has && j !== 8 ? "으로" : "로");
      case "이에요": case "예요": return w + (has ? "이에요" : "예요");
    }
    return w + p;
  }
  var RX = R.map(function(r){ return {re: new RegExp((r[2] ? "(^|[^가-힣A-Za-z])" : "()") + r[0] + (r[3] ? "(?!" + r[3] + ")" : "") + PART + "(?![가-힣])", "g"), to: r[1]}; });
  var TEST = new RegExp(R.map(function(r){ return r[0]; }).join("|"));
  function conv(v){
    if (v == null) return v; var s = String(v), t = s.trim();
    if (EXACT[t]) return s.replace(t, EXACT[t]);
    if (!TEST.test(s)) return s;
    RX.forEach(function(x){ s = s.replace(x.re, function(m, pre, p){ return pre + fix(x.to, p); }); });
    return s;
  }
  var TERMB = [["큰손", "고래"], ["장 분위기판", "국면 신호판"], ["장 분위기", "국면"], ["시장 흐름", "나침반"], ["오를 확률", "시장확률"], ["자동 분석 전망", "두뇌 논지"], ["자동 분석", "두뇌"], ["기본 틀", "뼈대"], ["비용 뺀", "정직"],
    ["예측", "예고"], ["제자리", "횡보"], ["공격 포트", "킥 포트"], ["종목 찾기", "거르기"], ["컵 차트", "컵"], ["갭 상승", "갭"], ["조용히 사 모으기", "조용한 매집"], ["사 모으기", "매집"], ["흔들림 조절", "변동성 맞춤"], ["출렁임", "변동성"], ["맞힌 비율", "적중률"], ["사례", "표본"], ["하락폭", "낙폭"]];
  G.easyText = conv;
  G.easyBackTerms = function(str){ var o = String(str || ""); TERMB.forEach(function(t){ o = o.split(t[0]).join(t[1]); }); return o; };   // 낱말 단위 되돌리기(영상 못 찾았을 때만)

  if (typeof document === "undefined") return;                          // ↓ 여기부터는 앱 화면(서비스 워커는 위 conv 만 씀)
  try { if (localStorage.getItem("easy") === "off"){ G.easyText = function(v){ return v; }; return; } } catch(x) {}

  // ② 그림으로 그리는 장(캔버스) — 재는 글자와 그리는 글자가 같아야 줄바꿈이 맞음
  try {
    var P = CanvasRenderingContext2D.prototype;
    ["fillText", "strokeText", "measureText"].forEach(function(k){ var f = P[k]; if (!f || f._ez) return;
      var g = function(t){ var a = [].slice.call(arguments); a[0] = conv(t); return f.apply(this, a); }; g._ez = 1; P[k] = g; });
  } catch(x) {}

  var BACK = new Map();
  G.easyBack = function(str){
    if (!str) return str; var o = String(str);
    BACK.forEach(function(orig, easy){ if (o.indexOf(easy) >= 0) o = o.split(easy).join(orig); });
    return o;
  };
  var SKIP = "script,style,svg,textarea,input,select,code,pre,[contenteditable],.ez-no";
  function doNode(n){
    var v = n.nodeValue; if (!v) return;
    var p = n.parentElement; if (!p || p.closest(SKIP)) return;
    var o = conv(v);
    if (o !== v){ var e1 = o.trim(), o1 = v.trim(); if (e1 && e1 !== o1 && BACK.size < 4000) BACK.set(e1, o1); n.nodeValue = o; }
  }
  function walk(root){
    if (!root) return;
    if (root.nodeType === 3) return doNode(root);
    if (root.nodeType !== 1 || (root.closest && root.closest(SKIP))) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), a = [], x; while ((x = w.nextNode())) a.push(x); a.forEach(doNode);
  }
  // 풍선 도움말(data-tip)·누르면 뜨는 제목(title)·입력 칸 안내(placeholder)
  var ATTR = ["data-tip", "title", "placeholder"];
  function doAttr(el){ if (!el || el.nodeType !== 1 || (el.closest && el.closest("svg"))) return; ATTR.forEach(function(a){ var v = el.getAttribute(a); if (v){ var o = conv(v); if (o !== v){ var e1 = o.trim(), o1 = v.trim(); if (BACK.size < 4000) BACK.set(e1, o1); el.setAttribute(a, o); } } }); }
  function walkAttr(root){ if (!root || root.nodeType !== 1) return; doAttr(root); [].forEach.call(root.querySelectorAll("[data-tip],[title],[placeholder]"), doAttr); }
  var q = [], sch = false;
  function flush(){ sch = false; var a = q; q = []; a.forEach(function(n){ walk(n); walkAttr(n); }); }
  new MutationObserver(function(ms){
    ms.forEach(function(m){ if (m.type === "childList") [].forEach.call(m.addedNodes, function(n){ q.push(n); }); else q.push(m.target); });
    if (!sch && q.length){ sch = true; (window.requestAnimationFrame || setTimeout)(flush); }
  }).observe(document.documentElement, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR});
  walk(document.body); walkAttr(document.body);
})(typeof window !== "undefined" ? window : self);
;
/* ======== habit.js ======== */
/* CH Investing — 🏠 다시 오게 하는 홈 (10/31 사용자: 「A·B 다 진행 · C는 3·4 빼고 다」)
   B8 홈을 화면 1.5장쯤으로 — 긴 카드는 핵심 한 줄만, 나머지는 「펼치기」
   C1 🎯 아침 1탭 예측 — 「코스피 오를까?」 한 번 누르고, 3시 반에 결과 · 주간 순위 · 조이 vs 사람 (vote.py 가 모아 채점)
   C2 📛 앱 아이콘 숫자 — 홈을 보면 0으로 (숫자는 알림이 올 때 sw.js 가 올림)
   C5 🔮 운세 → 시장 다리 — 생일이 저장된 사람은 홈에 「오늘 투자운 N점」 칩 · 운세 화면엔 진짜 시장 날씨(mktWeather)
   C6 ⚡ 장중 「지금 바뀐 것」 — 한국 장중에만 3줄(30분 전과 비교 · 강한 업종 · 돈이 몰린 종목 · 환율), 5분마다 갈아끼움
   C7 📨 이번 주 한 장 — 금요일 장 끝~일요일 홈 카드 · 누르면 고객에게 보낼 주간 요약 그림 (금 16시 알림: plus.py week1)
   C8 👀 다시 오면 「마지막으로 본 뒤 바뀐 것」만 먼저 — 날씨판 바로 아래 */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var VOTE_TOPIC = "chkchp-ch-vote";
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function hm(){ return kst().toISOString().slice(11, 16); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 300000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function q5(){ return "?" + Math.floor(Date.now() / 300000); }
  var WDK = ["일", "월", "화", "수", "목", "금", "토"];
  function wd(d){ return WDK[new Date(d + "T00:00:00Z").getUTCDay()]; }
  function onHome(){ return (typeof cur !== "undefined" && cur === "home") && document.getElementById("hmbody"); }
  function toast(m){ if (window.P && P.toast) return P.toast(m); var d = document.createElement("div"); d.className = "ch-toast"; d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function dev(){ var d = null; try { d = localStorage.getItem("us_dev"); } catch(x) {} if (!d){ d = Math.random().toString(36).slice(2, 10); try { localStorage.setItem("us_dev", d); } catch(x) {} } return d; }

  /* ───────── 🌤 시장 날씨 (운세 화면 · 다른 곳에서 같이 씀) ───────── */
  function wxOf(r){ return r == null ? ["☁️", "흐림"] : r >= 1.5 ? ["☀️", "맑음"] : r >= 0.3 ? ["🌤", "구름 조금"] : r > -0.3 ? ["☁️", "흐림"] : r > -1.5 ? ["🌧", "비"] : ["⛈", "폭풍"]; }
  window.mktWeather = function(){
    return Promise.all([gj("archive/x/live_kr.json" + q5()), gj(RAWM + "home.json" + q5())]).then(function(r){
      var L = r[0] || {}, H = r[1] || {}, P = H.port || {};
      var k = (L.index || []).filter(function(x){ return x.name === "코스피"; })[0];
      var liveToday = L.date === today() && k;
      var big = liveToday ? k.chg : P.d1_spy != null ? P.d1_spy : k ? k.chg : null, w = wxOf(big);
      var parts = [];
      if (k) parts.push("코스피 " + sg(k.chg) + (liveToday ? (L.t && L.t < "15:30" ? " (" + L.t + ")" : " 마감") : " (" + wd(L.date) + ")"));
      if (P.d1_spy != null) parts.push("S&P " + sg(P.d1_spy) + " (" + wd(P.d1_date) + ")");
      return {ic: w[0], w: w[1], line: parts.join(" · ") + " — 눌러서 홈으로"};
    });
  };

  /* ───────── B8 홈 접기 ───────── */
  var OPEN = {};   // 이번에 펼친 카드 (매시간 다시 그려져도 펼친 채로)
  function foldBtn(key, lab){ return '<button type="button" class="hf-b" data-hf="' + key + '" data-lab="' + lab + '">' + (OPEN[key] ? "접기 ▴" : lab + " ▾") + '</button>'; }
  function foldOne(card, key, parts, lab, where){
    if (!card) return;
    // 다른 화면 js 가 카드 안에 늦게 붙이는 칸(경주 그림 등)도 잡도록 매번 다시 표시
    parts.forEach(function(sel){ [].forEach.call(card.querySelectorAll(sel + ":not(.hf-x)"), function(x){ x.classList.add("hf-x"); }); });
    if (card.getAttribute("data-hfk")) return;
    if (!card.querySelector(".hf-x")) return;
    card.setAttribute("data-hfk", key); card.classList.add("hf-c"); if (OPEN[key]) card.classList.add("hf-open");
    var at = where ? card.querySelector(where) : null;
    var w = document.createElement("div"); w.className = "hf-row"; w.innerHTML = foldBtn(key, lab);
    if (at && at.parentNode === card) at.insertAdjacentElement("afterend", w); else card.appendChild(w);
  }
  function fold(){
    var b = document.getElementById("hmbody"); if (!b) return;
    // ☀️ 오늘 한 장 — 나라별 한 줄만 · 할 말·일정·보내기는 펼치면 (보내기는 왼쪽 아래 📨 단추에도 있음)
    foldOne(document.getElementById("pbcard"), "pb", [".pb-talk", ".pb-ev", ".pb-ft"], "3줄 요약·일정 보기", ".pb-reg");
    // 💼 내 포트 — 숫자 세 개 + 할 일만 · 경주 그림은 펼치면
    [].forEach.call(b.querySelectorAll("section.card"), function(c){
      var t = (c.querySelector(".hm-h b") || {}).textContent || "";
      if (/내 포트/.test(t)) foldOne(c, "port", [".tz-race", ".hm-sp"], "10/2부터 경주 보기", ".hm-l");
      else if (/이번 주 복기/.test(t)){ if (document.getElementById("wk1")) c.classList.add("hf-gone"); else foldOne(c, "week", [".hm-wn", ".hm-l"], "자세히", ".hm-big"); }   // 주말엔 📨 이번 주 한 장 카드에 합침
      else if (c.classList.contains("hm-chg")) foldOne(c, "chg", [".hm-chi:nth-of-type(n+4)"], "더 보기", null);
    });
    var hint = b.querySelector(".tz-hint"); if (hint) hint.classList.add("hf-gone");
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-hf]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var c = t.closest(".hf-c"), k = t.dataset.hf; if (!c) return;
    OPEN[k] = !OPEN[k]; c.classList.toggle("hf-open", OPEN[k]); t.textContent = OPEN[k] ? "접기 ▴" : (t.getAttribute("data-lab") || "펼치기") + " ▾";
  }, true);

  /* ───────── C8 👀 마지막으로 본 뒤 바뀐 것 ───────── */
  var SEEN_K = "hb_seen", SINCE = null;   // SINCE = 이번 방문에 보여 줄 「바뀐 것」(30분 유지)
  function snapOf(H){
    var P = (H && H.port) || {}, mk = window.M && M.cats && M.cats.market && M.cats.market[0];
    return {at: Date.now(), base: P.base, kick: P.kick, conc: P.conc, asof: P.asof, mkt: mk ? mk.id : "",
      focus: ((H && H.focus) || []).map(function(f){ return f.name; }), ev: ((H && H.kick && H.kick.events) || []).map(function(x){ return x.k + ":" + x.name; }),
      chg: ((H && H.chg && H.chg.items) || []).map(function(x){ return x.t; })};
  }
  function ago(t){ var m = Math.round((Date.now() - t) / 60000); if (m < 60) return m + "분 전"; var h = Math.round(m / 60); if (h < 24) return h + "시간 전"; return Math.round(h / 24) + "일 전"; }
  function diffs(H, old){
    var now = snapOf(H), out = [];
    if (!old) return out;
    var mk = window.M && M.cats && M.cats.market && M.cats.market[0];
    if (now.mkt && old.mkt && now.mkt !== old.mkt) out.push({ic: "🌐", t: "새 시황 나옴", s: dateLab(now.mkt), go: "market"});
    if (now.asof && old.asof && now.asof !== old.asof && now.base != null && old.base != null)
      out.push({ic: "💼", t: "내 포트(기본) " + sg(old.base) + " → " + sg(now.base), s: md(now.asof) + " 미국 종가 반영", go: "port~pohero"});
    var nf = now.focus.filter(function(f){ return old.focus.indexOf(f) < 0; });
    if (nf.length) out.push({ic: "🎯", t: "새 집중 테마: " + nf.join(" · "), go: "market~mkfo"});
    var ne = now.ev.filter(function(f){ return old.ev.indexOf(f) < 0; });
    if (ne.length) out.push({ic: "⚡", t: "공격 할 일: " + ne.map(function(x){ return x.replace(":", " "); }).join(" · "), go: "port~pokick"});
    ((H && H.chg && H.chg.items) || []).forEach(function(x){
      if (old.chg.indexOf(x.t) >= 0 || /시황 나옴/.test(x.t) && out.some(function(o){ return o.ic === "🌐"; })) return;
      out.push({ic: x.ic, t: x.lab ? x.lab + (x.a ? " " + x.a + " → " + x.b : "") + (x.note ? " (" + x.note + ")" : "") : x.t, s: x.sub || "", go: x.go || "home"}); });
    return out.slice(0, 4);
    function dateLab(id){ var d = id.slice(0, 10); return md(d) + "(" + wd(d) + ") " + ({AM: "오전", PM: "오후", HOL: "휴장"}[id.slice(11)] || ""); }
  }
  function sinceCard(H){
    var b = document.getElementById("hmbody"); if (!b || !H) return;
    var old = ls(SEEN_K);
    if (!SINCE || Date.now() - SINCE.made > 30 * 60e3){
      // 3시간 넘게 지나 다시 온 사람에게만 — 방금 본 사람에겐 같은 걸 또 보여 주지 않음
      SINCE = {made: Date.now(), from: old && old.at, items: old && Date.now() - old.at > 3 * 3600e3 ? diffs(H, old) : []};
      ls(SEEN_K, snapOf(H));
    }
    var ex = document.getElementById("hbsince");
    if (!SINCE.items.length){ if (ex) ex.remove(); return; }
    var h = '<div class="hm-h"><span class="hm-i">👀</span><div><b>마지막으로 본 뒤 바뀐 것</b><small>' + ago(SINCE.from) + '에 봄 · ' + SINCE.items.length + '가지</small></div></div>' +
      SINCE.items.map(function(x){ return '<div class="hb-si" data-goto="' + e(x.go) + '"><span>' + e(x.ic) + '</span><div><b>' + e(x.t) + '</b>' + (x.s ? '<small>' + e(x.s) + '</small>' : '') + '</div><i>›</i></div>'; }).join("");
    if (!ex){ ex = document.createElement("section"); ex.id = "hbsince"; ex.className = "card hb-since"; }
    if (ex.getAttribute("data-sig") !== String(SINCE.made)){ ex.innerHTML = h; ex.setAttribute("data-sig", String(SINCE.made)); }
    var hero = document.getElementById("tdhero");
    if (hero && ex.previousElementSibling !== hero) hero.insertAdjacentElement("afterend", ex);
    else if (!hero && ex.parentNode !== b) b.insertBefore(ex, b.firstChild);
    // 같은 내용인 서버 「바뀐 것」 카드는 숨김 (겹치지 않게)
    var dup = b.querySelector(".hm-chg"); if (dup) dup.classList.add("hf-gone");
  }

  /* ───────── C2 📛 아이콘 숫자 지우기 ───────── */
  function clearBadge(){
    try { if (navigator.clearAppBadge) navigator.clearAppBadge().catch(function(){}); } catch(x) {}
    try { if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({t: "badge", n: 0}); } catch(x) {}
  }

  /* ───────── C5 🔮 오늘 투자운 칩 ───────── */
  function luckChip(){
    var hero = document.getElementById("tdhero"); if (!hero || hero.querySelector(".hb-luck")) return;
    var ppl = ls("sj_people"); if (!ppl || !ppl.length) return;
    (window.needMod ? needMod("luck") : Promise.resolve()).then(function(){
      var L = window.luckToday && luckToday(); if (!L || L.inv == null || !document.getElementById("tdhero") || hero.querySelector(".hb-luck")) return;
      var a = document.createElement("button"); a.type = "button"; a.className = "hb-luck";
      a.innerHTML = '🔮 ' + e(L.name) + ' 님 오늘 투자운 <b>' + L.inv + '점</b> ›';
      a.onclick = function(ev){ ev.stopPropagation(); go("luck"); };
      var say = hero.querySelector(".tz-say"); if (say) say.insertAdjacentElement("afterend", a); else hero.appendChild(a);
    });
  }

  /* ───────── C6 ⚡ 장중 지금 바뀐 것 ───────── */
  var LIVE_T = 0;
  function liveStrip(){
    var b = document.getElementById("hmbody"); if (!b) return;
    var d = kst(), m = d.getUTCHours() * 60 + d.getUTCMinutes(), wk = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    var ex = document.getElementById("hblive");
    if (wk || m < 9 * 60 || m > 15 * 60 + 40){ if (ex) ex.remove(); return; }
    Promise.all([gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/wl_live.json" + q5(), 120000)]).then(function(r){
      var L = r[0], W = r[1]; if (!L || L.date !== today() || !onHome()) return;
      var ix = {}; (L.index || []).forEach(function(x){ ix[x.name] = x; });
      var ks = ix["코스피"], sn = L.snaps || [], rows = [];
      if (ks && sn.length >= 4){   // 30분 전(스냅 3칸 전)과 비교
        var p = sn[Math.max(0, sn.length - 4)], dlt = ks.chg - (+p[3]);
        rows.push('<b>📈 코스피 ' + sg(ks.chg) + '</b> <span class="mut">30분 전 ' + sg(+p[3]) + ' → ' + (Math.abs(dlt) < 0.15 ? "제자리" : dlt > 0 ? '<span class="up">올라오는 중</span>' : '<span class="dn">밀리는 중</span>') + '</span>');
      }
      var st = (L.strong || []).filter(function(s){ return s.n >= 5; }).slice(0, 2);
      if (st.length) rows.push('<b>🔥 강한 업종</b> ' + st.map(function(s){ return e(s.name.replace(/\(.*?\)/g, "")) + ' <span class="' + cls(s.r) + '">' + sg(s.r) + '</span>'; }).join(" · "));
      var v = (L.value || []).slice(0, 3);
      if (v.length) rows.push('<b>💰 돈이 몰린 종목</b> ' + v.map(function(s){ return '<a data-op="' + e(s.s) + '">' + e(s.n) + '</a> <span class="' + cls(s.r) + '">' + sg(s.r) + '</span>'; }).join(" · "));
      var fx = W && W.fx; if (fx && fx.p && String(fx.t || "").slice(0, 10) === today()){ var dw = fx.prev ? fx.p - fx.prev : null; rows.push('<b>💱 원/달러</b> ' + (Math.round(fx.p * 10) / 10).toLocaleString() + '원' + (dw != null ? ' <span class="' + cls(dw) + '">' + (dw > 0 ? "▲" : dw < 0 ? "▼" : "") + Math.abs(dw).toFixed(1) + '원</span>' : '')); }
      if (!rows.length) return;
      ex = ex || document.getElementById("hblive");   // 🎨 11/04: 동시에 두 번 불리면 카드가 둘 생기던 것
      if (!ex){ ex = document.createElement("section"); ex.id = "hblive"; ex.className = "card hb-live"; }
      ex.innerHTML = '<div class="hb-lh"><b>⚡ 지금 바뀐 것</b><span class="mut">' + e(L.t || "") + ' 기준 · 10분마다</span></div>' + rows.map(function(x){ return '<div class="hb-lr">' + x + '</div>'; }).join("");
      var after = document.getElementById("hbsince") || document.getElementById("tdhero");
      if (after){ if (ex.previousElementSibling !== after) after.insertAdjacentElement("afterend", ex); }
      else if (ex.parentNode !== b) b.insertBefore(ex, b.firstChild);
    });
  }

  /* ───────── C1 🎯 아침 1탭 예측 ───────── */
  var VK = "hb_vote";   // {day: p}
  function myVotes(){ return ls(VK) || {}; }
  function nick(){ var n = ls("hb_nick"); return n || ""; }   // 🔍 11/05 B7: 자동 별명(PB-xxxx) 없앰 — 비우면 순위에서 빠짐
  function target(PB, L){
    var kr = PB && PB.markets && PB.markets.KR, nd = kr && kr.next_day, td = today(), m = hm(), wk = [0, 6].indexOf(kst().getUTCDay()) >= 0;
    var session = !wk && m >= "09:00" && m < "15:30" && L && L.date === td;
    if (session) return {day: td, open: false, session: true};
    if (nd && (nd > td || (nd === td && m < "09:00"))) return {day: nd, open: true};
    if (!wk && m < "09:00") return {day: td, open: true};
    return {day: nd || td, open: false};
  }
  function dayLab(d){ var td = today(); if (d === td) return "오늘"; var dd = Math.round((Date.parse(d) - Date.parse(td)) / 864e5); return dd === 1 ? "내일" : wd(d) + "요일(" + md(d) + ")"; }
  function sendVote(day, p){
    var V = myVotes(); V[day] = p; var keep = {}; Object.keys(V).sort().slice(-60).forEach(function(k){ keep[k] = V[k]; }); ls(VK, keep);
    try { fetch("https://ntfy.sh/" + VOTE_TOPIC, {method: "POST", body: JSON.stringify({d: dev(), day: day, p: p, nm: nick()}), headers: {"Title": "vote"}, keepalive: true}).catch(function(){}); } catch(x) {}
  }
  function myRecord(VJ, L){
    var V = myVotes(), w = 0, n = 0, run = 0, last = null;
    Object.keys(V).sort().forEach(function(d){
      var r = resOf(d, VJ, L); if (r == null || r === 0) return;
      n++; var ok = V[d] === r; if (ok) w++; run = ok ? (run > 0 ? run + 1 : 1) : 0; last = {d: d, ok: ok};
    });
    return {w: w, n: n, run: run, last: last};
  }
  function resOf(d, VJ, L){
    var x = VJ && VJ.days && VJ.days[d]; if (x && x.res != null) return x.res;
    if (L && L.date === d && String(L.t || "") >= "15:30"){ var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0]; if (k) return k.chg > 0 ? 1 : k.chg < 0 ? -1 : 0; }
    return null;
  }
  function chgOf(d, VJ, L){ var x = VJ && VJ.days && VJ.days[d]; if (x && x.chg != null) return x.chg; if (L && L.date === d){ var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0]; if (k) return k.chg; } return null; }
  function voteCard(){
    var b = document.getElementById("hmbody"); if (!b) return;
    Promise.all([gj("archive/x/prob.json" + q5()), gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/vote.json" + q5())]).then(function(r){
      var PB = r[0], L = r[1], VJ = r[2] || {}; if (!onHome()) return;
      var T = target(PB, L), V = myVotes(), mine = V[T.day], dx = (VJ.days || {})[T.day] || {}, kr = PB && PB.markets && PB.markets.KR;
      var joeyP = dx.joey_p != null ? dx.joey_p : kr && kr.next_day === T.day && kr.p1 != null ? Math.round(kr.p1 * 100) : null;
      var joey = joeyP == null ? "" : joeyP >= 50 ? "📈 오른다" : "📉 내린다";
      var rec = myRecord(VJ, L), h = '';
      // 어제(가장 최근) 결과 먼저
      var prev = Object.keys(V).filter(function(d){ return d < T.day || (d === T.day && !T.open && !T.session); }).sort().pop();
      if (prev){ var pr = resOf(prev, VJ, L), pc = chgOf(prev, VJ, L);
        if (pr != null && pr !== 0) h += '<div class="hv-res ' + (V[prev] === pr ? "ok" : "no") + '">' + (V[prev] === pr ? "✅ 맞혔어요!" : "❌ 아쉬워요") + ' <span>' + md(prev) + ' 코스피 ' + sg(pc) + ' · 내 답 ' + (V[prev] > 0 ? "📈" : "📉") + '</span></div>'; }
      if (T.session){
        var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0], my = V[T.day];
        h += '<div class="hv-q">오늘 코스피, 3시 반에 결과</div>' + (my && k ? '<div class="hv-now">내 답 ' + (my > 0 ? "📈 오른다" : "📉 내린다") + ' · 지금 코스피 <b class="' + cls(k.chg) + '">' + sg(k.chg) + '</b> → ' + ((my > 0) === (k.chg > 0) ? '<b class="ok">맞는 중</b>' : '<b class="no">틀리는 중</b>') + '</div>' : '<div class="hv-now mut">오늘은 투표가 끝났어요 (9시 전까지) · 내일 아침에 참여해 보세요</div>');
      } else if (T.open){
        h += '<div class="hv-q">' + dayLab(T.day) + ' 코스피, 오를까요? <small>' + (T.day === today() ? "9시 전까지" : dayLab(T.day) + " 9시 전까지") + ' · 바꿀 수 있어요</small></div>' +
          '<div class="hv-bt"><button type="button" data-hv="1" class="' + (mine === 1 ? "on" : "") + '">📈 오른다</button><button type="button" data-hv="-1" class="' + (mine === -1 ? "on" : "") + '">📉 내린다</button></div>';
        var tot = (dx.up || 0) + (dx.dn || 0);
        h += '<div class="hv-sub">' + (joey ? '🧒 조이는 <b>' + joey + '</b>' + (joeyP != null ? ' (오를 확률 ' + joeyP + '%)' : '') : '') + (tot ? ' · 동료 ' + tot + '명 중 📈 ' + Math.round((dx.up || 0) / tot * 100) + '%' : '') + '</div>';
      } else {
        h += '<div class="hv-q">다음 투표는 ' + dayLab(T.day) + ' 아침에 열려요</div>';
      }
      // 기록 · 조이 vs 사람 · 주간 순위
      var Wk = VJ.week || {}, rows = Wk.rows || [], me = dev().slice(0, 4), jw = Wk.joey || {}, pw = Wk.people || {};
      var foot = [];
      if (rec.n) foot.push('내 기록 <b>' + rec.w + '/' + rec.n + '</b>' + (rec.run >= 2 ? ' · 🔥 ' + rec.run + '연속' : ''));
      if (jw.n) foot.push('이번 주 🧒 조이 ' + jw.w + '/' + jw.n + ' vs 👥 사람 ' + (pw.n ? Math.round(pw.w / pw.n * 100) + '%' : '–'));
      var rank = rows.length ? '<div class="hv-rk"><small>🏆 이번 주 순위 (' + md(Wk.from) + '~)</small>' + rows.slice(0, 3).map(function(x, i){ return '<div class="' + (x.id === me ? "me" : "") + '"><span>' + ["🥇", "🥈", "🥉"][i] + '</span><b>' + e(x.nm) + '</b><span>' + x.w + '/' + x.n + '</span></div>'; }).join("") +
        (rows.slice(3).some(function(x){ return x.id === me; }) ? '<div class="me"><span>' + (rows.map(function(x){ return x.id; }).indexOf(me) + 1) + '위</span><b>나</b><span></span></div>' : '') + '</div>' : '';
      var html = '<div class="hm-h"><span class="hm-i">🎯</span><div><b>1탭 예측</b><small>동료 PB와 맞히기 · 재미로</small></div><button type="button" class="hv-nk" data-hvnk="1">' + (nick() ? '별명 ' + e(nick()) + ' ✏️' : '✏️ 별명 정하기') + '</button></div>' + h +
        (foot.length ? '<div class="hv-ft">' + foot.join(" · ") + '</div>' : '') + rank;
      var ex = document.getElementById("hbvote");
      if (!ex){ ex = document.createElement("section"); ex.id = "hbvote"; ex.className = "card hb-vote"; }
      if (ex.getAttribute("data-h") !== html){ ex.innerHTML = html; ex.setAttribute("data-h", html); }
      var pl = b.querySelector("section.card.pl");   // 오늘 한 줄 다음
      if (pl){ if (ex.previousElementSibling !== pl) pl.insertAdjacentElement("afterend", ex); }
      else if (ex.parentNode !== b) b.appendChild(ex);
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-hv],[data-hvnk]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    if (t.dataset.hvnk){
      var n = prompt("순위에 보일 별명 (실명 말고 별명 · 10자 이내)", ls("hb_nick") || "");
      if (n != null){ n = n.trim().slice(0, 10); ls("hb_nick", n || null); var ex0 = document.getElementById("hbvote"); if (ex0) ex0.removeAttribute("data-h"); voteCard(); }
      return;
    }
    // 🔍 11/05 B7 「순위에 PB-xxxx 같은 자동 별명 말고」 — 첫 투표 때 별명을 먼저 정함(비우면 「익명」으로 순위에선 빠짐)
    if (!ls("hb_nick") && !ls("hb_nick_ask")){ ls("hb_nick_ask", 1); var n0 = prompt("이번 주 순위에 보일 별명을 정해 주세요 (실명 말고 · 10자 이내)\n비우면 순위에 안 나와요", ""); if (n0 && n0.trim()) ls("hb_nick", n0.trim().slice(0, 10)); }
    Promise.all([gj("archive/x/prob.json" + q5()), gj("archive/x/live_kr.json" + q5(), 120000)]).then(function(r){
      var T = target(r[0], r[1]); if (!T.open){ toast("지금은 투표 시간이 아니에요"); return; }
      sendVote(T.day, +t.dataset.hv); toast((+t.dataset.hv > 0 ? "📈 오른다" : "📉 내린다") + " — " + dayLab(T.day) + " 3시 반에 채점해요");
      try { if (navigator.vibrate) navigator.vibrate(12); } catch(x) {}
      var ex = document.getElementById("hbvote"); if (ex) ex.removeAttribute("data-h"); voteCard();
    });
  }, true);

  /* ───────── C7 📨 이번 주 한 장 ───────── */
  function weekWin(){ var d = kst(), w = d.getUTCDay(), m = d.getUTCHours() * 60 + d.getUTCMinutes(); return (w === 5 && m >= 15 * 60 + 30) || w === 6 || w === 0; }
  function weekCard(){
    var b = document.getElementById("hmbody"); if (!b) return;
    var ex = document.getElementById("wk1");
    if (!weekWin()){ if (ex) ex.remove(); return; }
    if (!ex){
      ex = document.createElement("section"); ex.id = "wk1"; ex.className = "card hb-wk";
      ex.innerHTML = '<div class="hb-wkb"><span>📨</span><div><b>이번 주 한 장</b><small>5개 시장 한 주 · 강했던·약했던 업종 · 다음 주 일정 — 고객에게 바로 보내기</small></div><i>›</i></div><div class="hb-wkp" id="wk1p"></div>';
      ex.onclick = function(ev){ if (ev.target.closest("[data-goto]")) return; weekSend(); };
    }
    // 이번 주 내 포트 한 줄 (홈 「이번 주 복기」 카드를 여기로 합침)
    var Wk = H0 && H0.week, pp = document.getElementById("wk1p");
    if (pp && Wk && Wk.days && !pp.innerHTML){
      var it = [["기본", Wk.base], ["공격", Wk.kick], ["집중", Wk.conc]].filter(function(x){ return x[1] != null; });
      pp.innerHTML = '<span data-goto="port">💼 이번 주 내 포트 ' + it.map(function(x){ return x[0] + ' <b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b>'; }).join(" · ") + ' <span class="mut">vs S&amp;P ' + sg(Wk.spy) + '</span> ›</span>';
    }
    var v = document.getElementById("hbvote") || b.querySelector("section.card.pl");
    if (v){ if (ex.previousElementSibling !== v) v.insertAdjacentElement("afterend", ex); } else if (ex.parentNode !== b) b.appendChild(ex);
  }
  function weekSpec(){
    var it = window.M && M.cats && M.cats.sector && M.cats.sector[0];
    return Promise.all([it ? gj("archive/sector/" + it.id + "/compass.json") : null, window.__pbbrief ? __pbbrief() : gj("archive/x/pbbrief.json" + q5())]).then(function(r){
      var C = r[0], PB = r[1] || {}; if (!C || !C.markets) return null;
      var MK = [["KR", "🇰🇷", "코스피"], ["US", "🇺🇸", "S&P500"], ["JP", "🇯🇵", "닛케이"], ["CN", "🇨🇳", "상해"], ["HK", "🇭🇰", "항셍"]], world = [], lastD = "";
      MK.forEach(function(k){ var m = C.markets[k[0]], ix = m && (m.index || [])[0]; if (ix && ix.chg5 != null){ world.push({f: k[1], n: k[2], v: ix.chg5, s: md(ix.date) + "까지"}); if (ix.date > lastD) lastD = ix.date; } });
      var secs = [];
      ["KR", "US"].forEach(function(k){ var m = C.markets[k]; ((m && m.sectors) || []).forEach(function(s){ if (s.r5 != null && (s.n || 0) >= 5) secs.push({n: (k === "KR" ? "🇰🇷 " : "🇺🇸 ") + (s.pn || s.name).replace(/\(.*?\)/g, ""), v: s.r5}); }); });
      secs.sort(function(a, b){ return b.v - a.v; });
      var bars = secs.length >= 6 ? secs.slice(0, 3).concat(secs.slice(-3)) : secs;
      var up = world.filter(function(w){ return w.v > 0; }), best = world.slice().sort(function(a, b){ return b.v - a.v; })[0], worst = world.slice().sort(function(a, b){ return a.v - b.v; })[0];
      var one = world.length ? "이번 주 5개 시장 중 " + up.length + "곳 상승 — 가장 강한 곳 " + best.n + " " + sg(best.v) + ", 가장 약한 곳 " + worst.n + " " + sg(worst.v) + "." : "";
      var watch = ((PB.advice && PB.advice.watch) || []).map(function(w){ return {n: w[1], v: w[0], vc: "#5d667a"}; });
      var plan = ((PB.advice && PB.advice.plan) || [])[0] || "";
      var wkFrom = new Date(Date.parse((lastD || today()) + "T00:00:00Z") - 4 * 864e5).toISOString().slice(0, 10);
      return {kind: "screen", scene: "city_" + (up.length >= 3 ? "up" : up.length <= 1 ? "down" : "flat"), mood: up.length >= 3 ? "up" : up.length <= 1 ? "down" : "flat",
        title: "이번 주 한 장", sub: md(wkFrom) + " ~ " + md(lastD) + " · 5개 시장 한 주 흐름",
        blocks: [["world", world], ["note", {h: "📌 한 주 정리", t: one, tone: "dark", max: 3}], ["bars", bars.length ? {title: "한 주 강했던 업종 · 약했던 업종 (5일)", items: bars} : null],
          ["list", watch.length ? {title: "📅 다음 주 볼 일정", items: watch, rank: false} : null], ["note", plan ? {h: "🧭 자산배분 원칙", t: plan, tone: "info", max: 3} : null]],
        note: "주간 등락은 각 시장 마지막 5거래일 기준"};
    });
  }
  function weekSend(){
    var O = window.__onepage; if (!O || !O.draw || !O.ready){ toast("잠시 뒤 다시 눌러 주세요"); return; }
    toast("이번 주 한 장 만드는 중…");
    weekSpec().then(function(C){
      if (!C){ toast("자료를 못 가져왔어요"); return; }
      var nm = ""; try { nm = localStorage.getItem("pbname") || ""; } catch(x) {}
      var c = O.draw(C, nm);
      c.toBlob(function(b){ if (!b){ toast("만들지 못했어요"); return; }
        O.ready([new File([b], "이번주_한장_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"})], "이번 주 한 장"); }, "image/png");
    }).catch(function(x){ console.warn(x); toast("만들지 못했어요"); });
  }
  window.__weekSend = weekSend;

  /* ───────── 붙이기 ───────── */
  var H0 = null;
  function loadH(){ return gj(RAWM + "home.json" + q5()).then(function(H){ if (H) H0 = H; return H0; }); }
  function apply(){
    if (!onHome()) return;
    try { fold(); } catch(x) { console.warn("fold", x); }
    try { weekCard(); } catch(x) {}
    try { luckChip(); } catch(x) {}
    loadH().then(function(H){ if (onHome()){ try { sinceCard(H); } catch(x) { console.warn("since", x); } try { weekCard(); } catch(x) {} } });
    voteCard();
    if (Date.now() - LIVE_T > 60000){ LIVE_T = Date.now(); liveStrip(); }
    if (!document.hidden) clearBadge();
  }
  var T = 0;
  function soon(){ if (T) return; T = setTimeout(function(){ T = 0; apply(); }, 150); }
  try { new MutationObserver(function(ms){
    for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && (t.closest("#hbvote") || t.closest("#hblive") || t.closest("#hbsince") || t.closest("#wk1"))) continue; soon(); return; }
  }).observe(document.getElementById("main") || document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (onHome() && !document.hidden){ LIVE_T = 0; apply(); } }, 5 * 60e3);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden && onHome()){ LIVE_T = 0; apply(); } });

  var css = document.createElement("style");
  css.textContent =
    ".hf-c .hf-x{display:none!important}.hf-c.hf-open .hf-x{display:block!important}.hf-c.hf-open .tz-race.hf-x,.hf-c.hf-open .hm-sp.hf-x{display:block!important}.hf-gone{display:none!important}" +
    ".hf-row{margin:6px 0 0}.hf-b{font:inherit;font-size:13px;font-weight:700;color:var(--sub);background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:6px 12px;cursor:pointer}" +
    ".hb-since .hb-si{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line);cursor:pointer}.hb-since .hb-si:first-of-type{border-top:0}.hb-si>span{font-size:20px;flex:none;width:28px;text-align:center}.hb-si div{flex:1;min-width:0}.hb-si b{display:block;font-size:15px;line-height:1.4}.hb-si small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hb-si i{font-style:normal;color:var(--sub)}" +
    ".hb-since{box-shadow:0 0 0 2px rgba(57,135,229,.45)}" +
    ".hb-live .hb-lh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}.hb-live .hb-lh b{font-size:15.5px}.hb-live .hb-lh span{font-size:12px}.hb-lr{font-size:14px;line-height:1.5;padding:5px 0;border-top:1px solid var(--line)}.hb-lr:first-of-type{border-top:0}.hb-lr b{margin-right:4px}.hb-lr a{color:inherit;text-decoration:underline;text-decoration-color:var(--line)}" +
    ".hb-luck{display:inline-flex;align-items:center;gap:4px;margin:8px 0 0;font:inherit;font-size:13px;font-weight:700;color:#1d2433;background:rgba(255,255,255,.88);border:0;border-radius:999px;padding:6px 12px;cursor:pointer}.hb-luck b{color:#7b4dff}" +
    ".hb-vote .hm-h{position:relative}.hv-nk{margin-left:auto;font:inherit;font-size:12px;color:var(--sub);background:none;border:1px solid var(--line);border-radius:999px;padding:4px 9px;white-space:nowrap}" +
    ".hv-q{font-size:16.5px;font-weight:800;margin:6px 0 8px}.hv-q small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px}" +
    ".hv-bt{display:flex;gap:8px}.hv-bt button{flex:1;font:inherit;font-size:17px;font-weight:800;padding:14px 0;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}.hv-bt button.on{border-color:#3987e5;background:rgba(57,135,229,.14)}.hv-bt button:active{transform:scale(.97)}" +
    ".hv-sub{font-size:13px;color:var(--sub);margin-top:8px}.hv-now{font-size:14.5px;line-height:1.5}.hv-now .ok,.hv-res.ok{color:#2f9e44}.hv-now .no,.hv-res.no{color:#d6453d}" +
    ".hv-res{font-size:15px;font-weight:800;margin:4px 0 6px}.hv-res span{font-size:13px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".hv-ft{font-size:13px;color:var(--sub);margin-top:10px;padding-top:8px;border-top:1px solid var(--line)}" +
    ".hv-rk{margin-top:8px}.hv-rk small{display:block;font-size:12px;color:var(--sub);margin-bottom:4px}.hv-rk div{display:flex;gap:8px;align-items:center;font-size:14px;padding:3px 0}.hv-rk div b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hv-rk div.me b{color:#3987e5}" +
    ".hb-wk{cursor:pointer;background:linear-gradient(135deg,rgba(57,135,229,.14),rgba(124,156,255,.08))!important}.hb-wkb{display:flex;align-items:center;gap:12px}.hb-wkb>span{font-size:28px}.hb-wkb div{flex:1;min-width:0}.hb-wkb b{display:block;font-size:16.5px}.hb-wkb small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.4}.hb-wkb i{font-style:normal;font-size:20px;color:var(--sub)}.hb-wkp{font-size:13.5px;margin-top:10px;padding-top:9px;border-top:1px solid var(--line)}.hb-wkp:empty{display:none}";
  document.head.appendChild(css);
})();
;
/* ======== home2.js ======== */
/* CH Investing — 🏠 오늘 v2 시안 (10/31 사용자: 「오늘 카테고리 임팩트가 약해 — 우와 소리 나고, 오늘이 좋아서 다른 카테고리도 열어 보게」)
   10/31 13:00 「싹 바꿔서 적용」 → 모든 사람 기본으로 켬 · 예전 홈으로 돌아가기: 주소 끝에 ?home2=0 (다시 켜기 ?home2=1)
   ① 📍 스토리 링 — 맨 위 동그라미 8개(밤사이 미국 · 한국 · 돈 몰리는 곳 · 큰손 · 차트 신호 · 상품 · 내 포트 · 운세).
      오늘 안 본 건 무지개 테두리. 누르면 꽉 찬 화면 스토리(넘기기·자동 6초) → 마지막에 「○○ 탭에서 자세히」
   ② 🌏 5개 시장 타일 — 큰 숫자 + 5일 흐름 · 누르면 나침반
   ③ ✨ 오늘의 발견 — 옆으로 넘기는 큰 카드: 카테고리마다 가장 눈에 띄는 숫자 하나(큰손이 함께 산 종목 · 컵 돌파 임박 · 브라질 국채 · ELS · 펀드 1위 · 제안서 · 피드 · 운세)
   ④ 🗺 업종 지도 — 한국(장중·마감) 또는 미국 업종을 넓이·색으로 한눈에
   나머지(오늘 한 줄 · 1탭 예측 · 내 포트 · 바뀐 것)는 그대로 아래에. 숫자는 전부 앱이 이미 받는 자료 그대로 — 지어내지 않음 */
(function(){
  var ON_K = "home2";
  try { var qm = /[?&]home2=(\d)/.exec(location.search); if (qm) localStorage.setItem(ON_K, qm[1]); } catch(x) {}
  function on(){ try { return localStorage.getItem(ON_K) !== "0"; } catch(x) { return true; } }   // 10/31 13:00 사용자 「이렇게 싹 바꿔서 적용」 → 모두 기본으로 켬 (예전 홈은 ?home2=0)
  window.home2On = on;
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  var WDK = ["일", "월", "화", "수", "목", "금", "토"];
  function wd(d){ return d ? WDK[new Date(String(d).slice(0, 10) + "T00:00:00Z").getUTCDay()] : ""; }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var k = d == null ? 1 : d, a = Math.abs(+v).toFixed(k); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }   // 🎨 11/04: 「−0.0%」 안 나오게
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function q5(){ return "?" + Math.floor(Date.now() / 300000); }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 300000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0] : null; }
  function arc(cat, name){ var it = latest(cat); return it && (it.files || []).indexOf(name) >= 0 ? gj("archive/" + cat + "/" + it.id + "/" + name) : Promise.resolve(null); }
  function short(n){ var t = String(n || "").replace(/\s+(Common Stock|Ordinary Shares|Class [A-Z]).*$/i, "").replace(/\s+-\s.*$/, ""); return t.replace(/,?\s*(Inc\.?|Corporation|Corp\.?|Ltd\.?|Holdings|plc)$/i, "").trim(); }
  function nm(code, name){ var m = window.SIGNM || {}; return m[code] || (name && /[가-힣]/.test(name) ? name : short(name)) || code; }
  function nmT(code, name){ var k = nm(code, name); return k === code ? code : k; }
  function goTab(t){ var p = String(t).split("~"); if (window.goTo) goTo(p[0], p[1]); else go(p[0]); }
  function heatBg(v, a){ var x = Math.min(1, Math.abs(v || 0) / 3); a = a == null ? 1 : a; return v > 0 ? "rgba(214,69,61," + (0.18 + x * 0.72) * a + ")" : v < 0 ? "rgba(47,111,221," + (0.18 + x * 0.72) * a + ")" : "rgba(140,148,168," + 0.35 * a + ")"; }
  var JOEY = {joy: "img/kid_joy.jpg?v=1", umb: "img/kid_umb.jpg?v=1", thumb: "img/kid_thumb.jpg?v=1", globe: "img/kid_globe.jpg?v=1", piggy: "img/kid_piggy.jpg?v=1", detect: "img/kid_detect.jpg?v=1", wow: "img/guide_src.jpg?v=1", think: "img/kid_think.jpg?v=1", wave: "img/kid_wave.jpg?v=1", night: "img/kid_night.jpg?v=1"};

  /* ───────── 자료 한 번에 ───────── */
  var D = null, DT = 0;
  function load(){
    if (D && Date.now() - DT < 120000) return Promise.resolve(D);
    var sec = latest("sector");
    return Promise.all([
      gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/live_us.json" + q5(), 120000), gj("archive/x/live_jp.json" + q5(), 120000),
      gj("archive/x/live_cn.json" + q5(), 120000), gj("archive/x/live_hk.json" + q5(), 120000),
      gj(RAWM + "market/home.json" + q5()), sec ? gj("archive/sector/" + sec.id + "/compass.json") : null,
      gj("archive/x/whale_pick.json" + q5()), gj("archive/x/whale_x.json" + q5()), arc("cup", "cards.json"), arc("gap", "cards.json"),
      gj("archive/x/products.json" + q5(), 600000), gj("archive/x/prob.json" + q5()), gj(RAWM + "feeds/hot.json" + q5()), gj("archive/x/pbbrief.json" + q5(), 300000),   // 🎨 11/04: 오늘 한 줄(pbbrief)
      window.SIGNMP || null, gj(RAWM + "market/bear.json" + q5()), gj(RAWM + "market/bubble.json" + q5())   // 🐻 11/09 하락장 계기판 · 🫧 11/10 버블 경보판
    ]).then(function(r){
      D = {kr: r[0], us: r[1], jp: r[2], cn: r[3], hk: r[4], H: r[5] || {}, C: r[6], wp: r[7], wx: r[8], cup: r[9], gap: r[10], pd: r[11], pb: r[12], hot: r[13], brief: r[14], bear: r[16], bub: r[17]};
      DT = Date.now(); return D;
    });
  }
  function ix(J, n){ return J ? ((J.index || []).filter(function(x){ return x.name === n; })[0] || null) : null; }
  function liveNow(J){ return J && J.date === today() && J.t && J.t < "15:31"; }

  /* ───────── 이야기(스토리) 만들기 — 장면마다 {bg, joey, title, sub, html, cta:[탭, 글]} ───────── */
  function seenKey(id){ return "h2_seen_" + id; }
  function seen(id){ return ls(seenKey(id)) === today(); }
  function markSeen(id){ ls(seenKey(id), today()); }
  function bigNum(v, unit){ return '<div class="s2-big ' + cls(v) + '">' + sg(v) + (unit ? '<small>' + unit + '</small>' : '') + '</div>'; }
  function bars(rows){   // [{n, v, s}]
    var mx = Math.max.apply(null, rows.map(function(r){ return Math.abs(r.v); }).concat([0.5]));
    return '<div class="s2-bars">' + rows.map(function(r){ var w = Math.abs(r.v) / mx * 46;
      return '<div class="s2-br"><span class="n">' + e(r.n) + (r.s ? '<small>' + e(r.s) + '</small>' : '') + '</span><span class="t"><i class="z"></i><i class="b ' + (r.v >= 0 ? "u" : "d") + '" style="' + (r.v >= 0 ? "left:50%" : "right:50%") + ';width:' + w.toFixed(1) + '%"></i></span><b class="' + cls(r.v) + '">' + sg(r.v) + '</b></div>'; }).join("") + '</div>'; }
  function stories(d){
    var S = [], H = d.H || {}, P = H.port || {};
    // 🌙 밤사이 미국
    var sp = ix(d.us, "S&P500"), nq = ix(d.us, "나스닥");
    if (sp){
      var usd = d.us.t && d.us.t < "12:00" ? new Date(Date.parse(d.us.date + "T00:00:00Z") - 864e5).toISOString().slice(0, 10) : d.us.date;
      var secs = (d.us.sectors || []).filter(function(s){ return s.n >= 5; }).slice().sort(function(a, b){ return b.r - a.r; });
      var big = (d.us.value || []).slice(0, 3);
      S.push({id: "us", ic: "🇺🇸", lab: "밤사이 미국", grad: ["#1b2a52", "#3b5bdb"], slides: [
        {joey: sp.chg >= 0 ? JOEY.joy : JOEY.umb, title: "밤사이 미국 " + md(usd) + "(" + wd(usd) + ")", html: '<div class="s2-k">S&amp;P500</div>' + bigNum(sp.chg) + '<div class="s2-row"><span>나스닥 <b class="' + cls(nq && nq.chg) + '">' + sg(nq && nq.chg) + '</b></span><span>오른 종목 <b>' + (d.us.up || 0) + '</b>/' + (d.us.total || 0) + '</span></div>' +
          '<div class="s2-gauge"><i style="width:' + Math.round((d.us.up || 0) / Math.max(1, d.us.total || 1) * 100) + '%"></i></div><p class="s2-p">' + (sp.chg <= -1.5 ? "크게 흔들린 밤이에요. 하루 급락은 흔히 되돌림이 나와요." : sp.chg >= 1.5 ? "시원하게 오른 밤이에요." : "큰 방향 없이 지나간 밤이에요.") + '</p>'},
        secs.length ? {joey: JOEY.globe, title: "미국에서 돈이 간 곳 · 빠진 곳", html: bars(secs.slice(0, 3).concat(secs.slice(-3)).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, ""), v: s.r}; }))} : null,
        big.length ? {joey: JOEY.detect, title: "거래가 가장 몰린 종목", html: '<div class="s2-list">' + big.map(function(x, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(x.n) + '<small>' + e(x.s) + '</small></b><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></div>'; }).join("") + '</div>'} : null
      ].filter(Boolean), cta: ["sector", "🧭 시장 흐름에서 5개 시장 보기"]});
    }
    // 🇰🇷 한국
    var ks = ix(d.kr, "코스피"), kq = ix(d.kr, "코스닥");
    if (ks){
      var live = liveNow(d.kr), ksec = (d.kr.sectors || []).filter(function(s){ return s.n >= 5; }).slice().sort(function(a, b){ return b.r - a.r; });
      var ups = d.kr.total ? Math.round((d.kr.up || 0) / d.kr.total * 100) : null;
      S.push({id: "kr", ic: "🇰🇷", lab: live ? "지금 한국" : "한국 마감", grad: ["#4a1c2a", "#d6453d"], slides: [
        {joey: ks.chg >= 0 ? JOEY.joy : JOEY.umb, title: (live ? "지금 코스피 · " + d.kr.t : "코스피 " + md(d.kr.date) + "(" + wd(d.kr.date) + ") 마감"), html: '<div class="s2-k">코스피 ' + Math.round(ks.last || 0).toLocaleString() + '</div>' + bigNum(ks.chg) +
          '<div class="s2-row"><span>코스닥 <b class="' + cls(kq && kq.chg) + '">' + sg(kq && kq.chg) + '</b></span><span>오른 종목 <b>' + (ups == null ? "–" : ups + "%") + '</b></span></div><div class="s2-gauge"><i style="width:' + (ups || 0) + '%"></i></div>'},
        ksec.length ? {joey: JOEY.globe, title: "업종 1등 · 꼴등", html: bars(ksec.slice(0, 3).concat(ksec.slice(-3)).map(function(s){ return {n: (s.icon || "") + " " + s.name.replace(/\(.*?\)/g, ""), v: s.r}; }))} : null,
        (d.kr.value || []).length ? {joey: JOEY.detect, title: "돈이 가장 몰린 종목", html: '<div class="s2-list">' + d.kr.value.slice(0, 4).map(function(x, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(x.n) + '<small>거래 ' + Math.round(x.v || 0).toLocaleString() + '억</small></b><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></div>'; }).join("") + '</div>'} : null
      ].filter(Boolean), cta: ["market", "🌐 시황에서 오늘 전략 보기"]});
    }
    // 🔥 돈 몰리는 곳 (집중 테마)
    var F = H.focus || [];
    if (F.length) S.push({id: "focus", ic: "🔥", lab: "돈 몰리는 곳", grad: ["#4a2a10", "#f08c00"], slides: F.slice(0, 3).map(function(t){
      return {joey: JOEY.thumb, title: "돈이 몰리는 테마", html: '<div class="s2-k">' + e(t.stage || "") + '</div><div class="s2-big2">' + e(t.name) + '</div><div class="s2-row"><span>5일 <b class="' + cls(t.r5) + '">' + sg(t.r5) + '</b></span><span>S&amp;P보다 20일 <b class="' + cls(t.rs20) + '">' + sg(t.rs20) + '</b></span></div>' +
        ((t.stars || []).length ? '<div class="s2-chips">' + t.stars.slice(0, 3).map(function(s){ return '<span>★ ' + e(s.name) + ' <small>' + e(s.t) + '</small></span>'; }).join("") + '</div>' : '') + (t.do ? '<p class="s2-p">' + e(t.do) + '</p>' : '')}; }), cta: ["market~mkfo", "🎯 오늘 집중 자세히"]});
    // 🐋 큰손
    var pk = d.wp && d.wp.pick, cons = (d.wx && d.wx.consensus) || [];
    if (pk || cons.length) S.push({id: "whale", ic: "🐋", lab: "큰손", grad: ["#0b3b3a", "#12b886"], slides: [
      pk ? {joey: JOEY.detect, title: "오늘의 큰손 픽", html: '<div class="s2-k">고래 점수 ' + Math.round(pk.tot) + '점</div><div class="s2-big2">' + e(pk.n) + ' <small>' + e(pk.s) + '</small></div><div class="s2-row"><span>20일 <b class="' + cls(pk.r20) + '">' + sg(pk.r20) + '</b></span><span>어제 <b class="' + cls(pk.r1) + '">' + sg(pk.r1) + '</b></span></div><ul class="s2-ul">' + (pk.why || []).slice(0, 3).map(function(w){ return '<li>' + e(w) + '</li>'; }).join("") + '</ul>'} : null,
      cons.length ? {joey: JOEY.wow, title: "유명 투자자들이 함께 산 종목", html: '<div class="s2-list">' + cons.slice(0, 3).map(function(c, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(c.t)) + ' <em>' + e(c.t) + '</em><small>' + e((c.by || []).slice(0, 3).join(" · ")) + (c.n > 3 ? " 외 " + (c.n - 3) : "") + '</small></b><span>' + c.n + '명</span></div>'; }).join("") + '</div><p class="s2-p">' + e(d.wx.quarter || "") + ' 공시 기준 · 지금 가격은 그때보다 ' + sg(cons[0].vs) + '</p>'} : null
    ].filter(Boolean), cta: ["whale", "🐋 고래 탭에서 40명 보기"]});
    // ☕📈 차트 신호
    var cupT = d.cup && d.cup.top || [], gapT = d.gap && d.gap.top || [];
    var near = cupT.filter(function(c){ return c.dist != null && c.dist > -5 && c.dist <= 3; }).sort(function(a, b){ return (b.brk ? 1 : 0) - (a.brk ? 1 : 0) || Math.abs(a.dist) - Math.abs(b.dist); });
    if (cupT.length || gapT.length) S.push({id: "chart", ic: "☕", lab: "차트 신호", grad: ["#3d2a10", "#e8a33d"], slides: [
      cupT.length ? {joey: JOEY.detect, title: "컵 모양 — 막 돌파했거나 곧 돌파", html: '<div class="s2-k">후보 ' + (d.cup.total || cupT.length) + '개 중 ' + near.length + '개</div><div class="s2-list">' + (near.length ? near : cupT).slice(0, 4).map(function(c, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(c.code, c.name)) + ' <em>' + e(String(c.code).replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "")) + '</em><small>' + e(c.sector && c.sector !== "미분류" ? c.sector : c.mkt) + ' · ' + (c.shape || "") + ' 컵 · 깊이 ' + Math.round(c.depth || 0) + '%</small></b><span class="' + (c.brk ? "up" : "") + '">' + (c.brk ? "🚀 돌파" : "−" + Math.abs(c.dist).toFixed(1) + "%") + '</span></div>'; }).join("") + '</div><p class="s2-p">숫자 = 돌파 가격(피벗)까지 남은 거리</p>'} : null,
      gapT.length ? {joey: JOEY.wow, title: "힘차게 뛰어오른 갭", html: '<div class="s2-list">' + gapT.slice(0, 4).map(function(g, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(g.code, g.name)) + ' <em>' + e(String(g.code).replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "")) + '</em><small>' + md(g.gday) + ' 갭 · 그 뒤 ' + sg(g.after, 0) + ' · ' + (g.hold ? "갭 지키는 중" : "갭 메움") + '</small></b><span class="up">+' + (+g.gap).toFixed(1) + '%</span></div>'; }).join("") + '</div>'} : null
    ].filter(Boolean), cta: ["cup", "☕ 컵 탭에서 차트 보기"]});
    // 🛍️ 상품
    var pd = d.pd || {}, slides = [];
    var brl = (pd.anb || []).slice().sort(function(a, b){ return (b.r || 0) - (a.r || 0); })[0];
    var kb = (pd.krw || []).slice().sort(function(a, b){ return (b.after || 0) - (a.after || 0); })[0];
    var el = (pd.els || []).filter(function(x){ return !x.e || x.e >= today(); }).sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    var fd = (pd.funds || []).filter(function(f){ return f.m1 != null && f.m1 < 50 && f.buy !== "1"; }).sort(function(a, b){ return b.m1 - a.m1; });
    if (brl || kb) slides.push({joey: JOEY.piggy, title: "지금 살 수 있는 채권", html: (brl ? '<div class="s2-k">🇧🇷 브라질 국채 ' + e(brl.code) + ' · ' + String(brl.mat).slice(0, 4) + '년 만기</div><div class="s2-big up">연 ' + (+brl.r).toFixed(1) + '%</div>' : '') + (kb ? '<div class="s2-row"><span>🇰🇷 원화 채권 세후 최고 <b>' + (+kb.after).toFixed(2) + '%</b></span></div><p class="s2-p">' + e(kb.btype || kb.kind || "") + ' · ' + String(kb.mat).slice(0, 4) + '년 만기 · ' + e(kb.risk || "") + '</p>' : '') + '<p class="s2-p mut">브라질 국채는 헤알화 환율에 따라 원화 수익이 크게 달라져요</p>'});
    if (el.length) slides.push({joey: JOEY.thumb, title: "지금 청약 중인 ELS·ELB", html: '<div class="s2-k">' + el.length + '개 청약 중</div><div class="s2-big up">연 ' + (+el[0].cpn).toFixed(1) + '%</div><p class="s2-p">' + e(el[0].n) + ' · ' + e(el[0].ua || "") + '</p><div class="s2-row"><span>' + (el[0].loss ? "원금 손실 가능" : "원금 지급형") + '</span><span>마감 <b>' + md(el[0].e) + '</b></span></div>'});
    if (fd.length) slides.push({joey: JOEY.joy, title: "한 달 수익률 1등 펀드", html: '<div class="s2-big2">' + e(fd[0].n.replace(/\[.*?\]/g, "").slice(0, 26)) + '</div><div class="s2-big up">' + sg(fd[0].m1) + '<small>1개월</small></div><p class="s2-p">' + e(fd[0].co) + ' · ' + e(fd[0].st || fd[0].t || "") + ' · 1년 ' + sg(fd[0].y1) + '</p>'});
    if (slides.length) S.push({id: "prod", ic: "🛍️", lab: "상품", grad: ["#10304a", "#1c7ed6"], slides: slides, cta: ["bond", "🏦 상품 탭에서 비교하기"]});
    // 💼 내 포트
    if (P.base != null) S.push({id: "port", ic: "💼", lab: "내 포트", grad: ["#3a3010", "#e9c46a"], slides: [{joey: P.conc > P.spy ? JOEY.joy : JOEY.piggy, title: md(P.start) + "부터 내 포트 vs S&P500",
      html: bars([{n: "🎯 집중", v: P.conc}, {n: "⚡ 공격", v: P.kick}, {n: "💼 기본", v: P.base}, {n: "🇺🇸 S&P500", v: P.spy}].filter(function(x){ return x.v != null; }).sort(function(a, b){ return b.v - a.v; })) +
        '<p class="s2-p">' + (P.d1 != null ? md(P.d1_date) + " 하루 기본 " + sg(P.d1) + " · S&P " + sg(P.d1_spy) + ". " : "") + '세계 지수 ' + P.n_bench + '곳 중 ' + P.beat_kick + '곳을 앞섰어요.</p>'}], cta: ["port", "💼 포트에서 담을 비중 보기"]});
    // 🔮 운세 (생일 저장된 사람)
    var L = window.luckToday && luckToday();
    if (L && L.inv != null) S.push({id: "luck", ic: "🔮", lab: "운세", grad: ["#2b1747", "#9c6ade"], slides: [{joey: JOEY.wave, title: e(L.name) + " 님 오늘", html: '<div class="s2-k">오늘 점수 ' + L.sc + '점</div><div class="s2-big2">📈 투자운 ' + L.inv + '점</div>' + (L.word ? '<p class="s2-p">「' + e(L.word) + '」</p>' : '') + '<p class="s2-p mut">재미로 보는 참고예요 — 투자 판단의 근거가 아니에요</p>'}], cta: ["luck", "🔮 오늘의 운세 전부 보기"]});
    return S;
  }

  /* ───────── ① 스토리 링 ───────── */
  function ringsHtml(S){
    return '<div class="h2-rings" id="h2rings">' + S.map(function(s, i){ return '<button type="button" class="h2-ring' + (seen(s.id) ? " seen" : "") + '" data-st="' + i + '"><span class="o"><span class="i">' + s.ic + '</span></span><small>' + e(s.lab) + '</small></button>'; }).join("") + '</div>';
  }
  /* ───────── 스토리 보기 ───────── */
  var SV = null;
  function openStory(S, si){
    closeStory();
    var box = document.createElement("div"); box.id = "h2sv"; document.body.appendChild(box);
    SV = {S: S, si: si, k: 0, t: 0, box: box, paused: false};
    document.documentElement.classList.add("h2-lock");
    box.addEventListener("click", function(ev){
      var t = ev.target;
      if (t.closest("[data-x]")){ closeStory(); return; }
      var c = t.closest("[data-cta]"); if (c){ var tab = c.getAttribute("data-cta"); closeStory(); goTab(tab); return; }
      var w = box.clientWidth; if (ev.clientX < w * 0.3) step(-1); else step(1);
    });
    var y0 = null;
    box.addEventListener("touchstart", function(ev){ y0 = ev.touches[0].clientY; SV && (SV.paused = true); }, {passive: true});
    box.addEventListener("touchend", function(ev){ if (SV) SV.paused = false; if (y0 != null && ev.changedTouches[0].clientY - y0 > 90) closeStory(); y0 = null; }, {passive: true});
    draw();
  }
  function closeStory(){ if (!SV) return; clearInterval(SV.t); SV.box.remove(); SV = null; document.documentElement.classList.remove("h2-lock"); var r = document.getElementById("h2rings"); if (r) paintRings(); }
  function paintRings(){ [].forEach.call(document.querySelectorAll(".h2-ring"), function(b){ var s = (CUR_S || [])[+b.dataset.st]; if (s) b.classList.toggle("seen", seen(s.id)); }); }
  function step(dlt){
    if (!SV) return; var st = SV.S[SV.si];
    SV.k += dlt;
    if (SV.k < 0){ if (SV.si > 0){ SV.si--; SV.k = SV.S[SV.si].slides.length - 1; } else SV.k = 0; }
    else if (SV.k >= st.slides.length){ if (SV.si < SV.S.length - 1){ SV.si++; SV.k = 0; } else { closeStory(); return; } }
    draw();
  }
  function draw(){
    var st = SV.S[SV.si], sl = st.slides[SV.k]; markSeen(st.id);
    var last = SV.k === st.slides.length - 1;
    SV.box.style.background = "linear-gradient(160deg," + st.grad[0] + "," + st.grad[1] + ")";
    SV.box.innerHTML = '<div class="sv-bars">' + st.slides.map(function(_, i){ return '<i class="' + (i < SV.k ? "done" : i === SV.k ? "now" : "") + '"><b></b></i>'; }).join("") + '</div>' +
      '<div class="sv-top"><span class="sv-ic">' + st.ic + '</span><div><b>' + st.ic + ' ' + e(st.lab) + '</b><small>' + (SV.si + 1) + ' / ' + SV.S.length + ' 이야기</small></div><button type="button" data-x="1" aria-label="닫기">✕</button></div>' +
      '<div class="sv-body"><img class="sv-hero" src="' + sl.joey + '" alt=""><h2>' + sl.title + '</h2>' + sl.html + '</div>' +
      '<div class="sv-foot"><button type="button" class="sv-cta' + (last ? " hot" : "") + '" data-cta="' + e(st.cta[0]) + '">' + e(st.cta[1]) + ' ›</button><small>화면 오른쪽 = 다음 · 왼쪽 = 이전 · 아래로 밀면 닫기</small></div>';
    clearInterval(SV.t);
    var t0 = Date.now(), dur = 6500, bar = SV.box.querySelector(".sv-bars i.now b");
    SV.t = setInterval(function(){
      if (!SV) return; if (SV.paused){ t0 += 100; return; }
      var p = Math.min(1, (Date.now() - t0) / dur); if (bar) bar.style.width = (p * 100) + "%";
      if (p >= 1){ clearInterval(SV.t); step(1); }
    }, 100);
  }

  /* ───────── ⑰ 오늘의 숫자 — 그날 제일 중요한 숫자 하나 + 한 줄 이유 (🎨 11/04 사용자 「오늘 한 줄을 맨 위 큰 글씨로」) ─────────
     한국 장중 = 코스피 지금 · 장 끝난 뒤 = 코스피 마감 · 아침 9시 전 = 밤사이 S&P500. 오를 확률이 70% 넘거나 30% 아래면 그게 더 눈에 띄니 그걸로. 한 줄은 pbbrief(오늘 한 장)의 one 그대로 */
  /* 🔍 11/05 A1 「홈 첫 줄은 결론 한 문장」 — 확률 하나로 겁주지 않게: 오늘 할 일(지키기·지켜보기·담기) + 숫자 2개, 확률은 작게(극단값이면 꼬리표) */
  function numHtml(d){
    var ks = ix(d.kr, "코스피"), sp = ix(d.us, "S&P500"), h = kst().getUTCHours() + kst().getUTCMinutes() / 60, wk = [0, 6].indexOf(kst().getUTCDay()) < 0;
    var pk = d.pb && d.pb.markets && d.pb.markets.KR, p1 = pk && pk.p1 != null ? Math.round(pk.p1 * 100) : null;
    try { var lv_ = pk && window.probLive && probLive(pk, d.kr, d.pb); if (lv_ && lv_.p1 != null) p1 = Math.round(lv_.p1 * 100); } catch(x) {}
    var kLive = ks && wk && h >= 8.9 && h < 15.6 && liveNow(d.kr);
    var kv = ks ? +ks.chg : null, sv = sp ? +sp.chg : null;
    var fut = null; try { var tk = (d.brief && d.brief.talk) || []; tk.forEach(function(t){ var m = /S&P500 선물 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t); if (m) fut = +m[1].replace("−", "-"); }); } catch(x) {}
    // 오늘의 결론 — 한국 하락이 크거나 확률이 낮으면 「지키는 날」, 반대면 「담는 날」, 그 밖엔 「지켜보는 날」
    var px_ = p1 != null && (p1 <= 15 || p1 >= 85);   // 🎲 11/10 #2: 극단 확률은 판정에도 화면에도 안 씀 (−45% 하락장 다음 날 「99%」)
    var down = (kv != null && kv <= -1.5) || (p1 != null && !px_ && p1 <= 30), up = (kv != null && kv >= 1.5) || (p1 != null && !px_ && p1 >= 70);
    var V = down && !up ? {ic: "🛡", t: "오늘은 지키는 날", c: "dn", s: "서둘러 팔기보다 비중·현금 점검"} : up && !down ? {ic: "🚀", t: "오늘은 담는 날", c: "up", s: "계획한 분할 매수를 진행할 때"} : {ic: "👀", t: "오늘은 지켜보는 날", c: "", s: "큰 결정은 미루고 흐름 확인"};
    if (down && fut != null && fut >= 0.8) V.s = "미국 선물 " + sg(fut) + " — 반등 기대도 있음 · 추격 매도 금지";
    /* 🐻 11/09 「쉬운 화면은 🔴 조심하는 장인데 여기는 🚀 담는 날?」 — 하루 등락·확률보다 하락장 계기판(종가 판정)이 먼저.
       🐻 하락장: 바닥 신호 0~1개면 절대 「담는 날」 아님(오늘 반등 = 현금 맞출 기회) · 2개↑면 「조금 담는 날」(신호마다 1/3씩)
       🟡 조정: 「담는 날」 → 「지켜보는 날」로 낮춤 */
    var BM = {}; ((d.bear && d.bear.markets) || []).forEach(function(m){ BM[m.key] = m; });
    var bw = [BM.kospi, BM.sp500].filter(function(m){ return m && m.state === "🐻"; })[0], yw = [BM.kospi, BM.sp500].filter(function(m){ return m && m.state === "🟡"; })[0];
    if (bw){
      var bn = bw.n || 0, nm = bw.name + " 하락장(고점 " + sg(bw.dd) + ")";
      if (bn >= 2) V = {ic: "🌱", t: "오늘은 조금 담는 날", c: "", s: nm + " · 바닥 신호 " + bn + "/4 — 현금 " + bw.cash + "%는 남기고 나눠서만"};
      else V = {ic: "🛡", t: "오늘은 지키는 날", c: "dn", s: nm + " · 바닥 신호 " + bn + "/4 — " + (up ? "오늘 반등은 현금 " + bw.cash + "% 맞출 기회 · 새로 사기는 신호 2개부터" : "현금 " + bw.cash + "%까지 · 투매는 금지")};
    } else if (yw && V.c === "up"){
      V = {ic: "👀", t: "오늘은 지켜보는 날", c: "", s: yw.name + " 조정(고점 " + sg(yw.dd) + ") · 오늘 강해도 추격 말고 계획대로 나눠서"};
    }
    var one = d.brief && d.brief.one ? String(d.brief.one).split(" ｜ ").pop() : "";   // 🧭 11/10 앞 절반(하락장 판정)은 바로 위 「오늘의 결론」과 같은 말
    var nums = [];
    if (ks) nums.push({l: "🇰🇷 코스피" + (kLive ? " 지금" : " " + md(d.kr.date)), v: kv});
    if (fut != null && kLive) nums.push({l: "🇺🇸 S&P 선물", v: fut}); else if (sp) nums.push({l: "🇺🇸 S&P500", v: sv});
    var pr = p1 == null ? "" : px_ ? '<span class="h2-np x" data-goto="prob">🎲 오늘은 확률이 극단으로 튀는 날 — 숫자는 참고하지 않아요 ›</span>' : '<span class="h2-np" data-goto="prob">🎲 ' + (pk && pk.open_now ? "오늘" : "다음 장") + ' 오를 확률 <b>' + p1 + '%</b></span>';
    return '<section class="card h2-num wow-big no-clp" data-xc="1" data-cz="done" data-goto="sector"><div class="h2-vd ' + V.c + '"><span>' + V.ic + '</span><b>' + V.t + '</b></div>' +
      '<div class="h2-vs">' + e(V.s) + '</div><div data-vd></div>' + (one ? '<p>' + e(one) + '</p>' : '') +
      '<div class="h2-nn">' + nums.map(function(n){ return '<div><small>' + e(n.l) + '</small><b class="' + cls(n.v) + '">' + sg(n.v) + '</b></div>'; }).join("") + '</div>' + pr + '<div data-flow></div></section>';
  }
  /* ⑳ 하루 흐름 작은 선 — live_*.json 의 snaps([시각, 오른 수, 내린 수, 지수 등락, …]) */
  function spark(J){
    var S = J && J.snaps; if (!S || S.length < 3) return "";
    var v = S.map(function(s){ return +s[3]; }).filter(function(x){ return !isNaN(x); }); if (v.length < 3) return "";
    var mn = Math.min.apply(null, v.concat([0])), mx = Math.max.apply(null, v.concat([0])), rg = (mx - mn) || 1, W = 100, H = 28;
    var pts = v.map(function(x, i){ return (i / (v.length - 1) * W).toFixed(1) + "," + (H - 2 - (x - mn) / rg * (H - 4)).toFixed(1); }).join(" ");
    var zero = (H - 2 - (0 - mn) / rg * (H - 4)).toFixed(1);
    return '<svg class="h2-sp" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="' + zero + '" x2="100" y2="' + zero + '"/><polyline points="' + pts + '"/></svg>';
  }

  /* ───────── ② 5개 시장 타일 ───────── */
  function worldHtml(d){
    var C = d.C && d.C.markets || {};
    var MK = [["KR", "🇰🇷", "코스피", d.kr, "코스피"], ["US", "🇺🇸", "S&P500", d.us, "S&P500"], ["JP", "🇯🇵", "닛케이", d.jp, "닛케이 225"], ["CN", "🇨🇳", "상해", d.cn, "상해종합"], ["HK", "🇭🇰", "항셍", d.hk, "항셍"]];
    var t = MK.map(function(m){ var x = ix(m[3], m[4]), c = C[m[0]], c5 = c && (c.index || [])[0] && c.index[0].chg5; if (!x) return "";
      var lv = liveNow(m[3]) && m[0] !== "US";
      return '<button type="button" class="h2-w' + (m[0] === "KR" || m[0] === "US" ? " big" : "") + '" data-goto="sector" style="background:' + heatBg(x.chg) + '"><span class="f">' + m[1] + '</span><small>' + m[2] + '</small><b>' + sg(x.chg) + '</b><em>' + (lv ? "● " + e(m[3].t) : wd(m[0] === "US" && m[3].t < "12:00" ? new Date(Date.parse(m[3].date + "T00:00:00Z") - 864e5).toISOString() : m[3].date) + " 마감") + '</em>' + (c5 != null ? '<em>5일 ' + sg(c5) + '</em>' : '') + (lv ? spark(m[3]) : '') + '</button>'; }).join("");
    return '<section class="card h2-world"><div class="h2-hd"><b>🌏 5개 시장 지금</b><span class="mut">누르면 시장 흐름 ›</span></div><div class="h2-wg">' + t + '</div></section>';
  }

  /* ───────── ③ 오늘의 발견 ───────── */
  function discHtml(d){
    var C = [], pk = d.wp && d.wp.pick, cons = (d.wx && d.wx.consensus) || [], cupT = d.cup && d.cup.top || [], gapT = d.gap && d.gap.top || [], pd = d.pd || {};
    if (cons.length) C.push({tab: "whale", c: ["#0b3b3a", "#12b886"], ic: "🐋", k: "유명 투자자 " + cons[0].n + "명이 함께 산", big: nm(cons[0].t), sub: cons[0].t + " · " + (cons[0].by || []).slice(0, 2).join(" · ") + " 등", go: "큰손 40명 보기"});
    if (pk) C.push({tab: "whale", c: ["#083344", "#0ca678"], ic: "🐳", k: "오늘의 큰손 픽 · " + Math.round(pk.tot) + "점", big: pk.n, sub: pk.s + " · 20일 " + sg(pk.r20), go: "왜 골랐나"});
    var near = cupT.filter(function(c){ return c.dist != null && c.dist > -5 && c.dist <= 3; }).sort(function(a, b){ return Math.abs(a.dist) - Math.abs(b.dist); });
    if (cupT.length){ var c0 = near[0] || cupT[0]; C.push({tab: "cup", c: ["#3d2a10", "#e8a33d"], ic: "☕", k: "컵 모양 " + (d.cup.total || cupT.length) + "개 중 " + (c0.brk ? "막 돌파" : "돌파 가장 가까운"), big: nm(c0.code, c0.name), sub: String(c0.code).replace(/\.(KS|KQ|T|HK)$/, "") + " · " + (c0.brk ? "돌파 가격 넘음 🚀" : "돌파까지 " + Math.abs(c0.dist).toFixed(1) + "%"), go: "차트 보기"}); }
    if (gapT.length) C.push({tab: "gap", c: ["#2b1747", "#9c6ade"], ic: "📈", k: "갭 점수 1위", big: nm(gapT[0].code, gapT[0].name), sub: String(gapT[0].code).replace(/\.(KS|KQ|T|HK)$/, "") + " · 갭 +" + (+gapT[0].gap).toFixed(1) + "% · " + md(gapT[0].gday), go: "갭 보기"});
    var brl = (pd.anb || []).slice().sort(function(a, b){ return (b.r || 0) - (a.r || 0); })[0];
    if (brl) C.push({tab: "bond", c: ["#0b3d1f", "#2f9e44"], ic: "🇧🇷", k: "브라질 국채 지금 금리", big: "연 " + (+brl.r).toFixed(1) + "%", sub: brl.code + " · " + brl.mat.slice(0, 4) + "년 만기 · 헤알화 환율 따라 달라져요", go: "채권 비교"});
    var el = (pd.els || []).filter(function(x){ return !x.e || x.e >= today(); }).sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    if (el.length){ var dd = el[0].e ? Math.round((Date.parse(el[0].e) - Date.parse(today())) / 864e5) : null; C.push({tab: "els", c: ["#4a2a10", "#f08c00"], ic: "🎯", k: "청약 중 ELS·ELB " + el.length + "개 중 최고", big: "연 " + (+el[0].cpn).toFixed(1) + "%", sub: (el[0].ua || "") + (dd != null ? " · 마감 " + (dd <= 0 ? "오늘" : "D-" + dd) : ""), go: "ELS 보기"}); }
    var fd = (pd.funds || []).filter(function(f){ return f.m1 != null && f.m1 < 50 && f.buy !== "1"; }).sort(function(a, b){ return b.m1 - a.m1; });
    if (fd.length) C.push({tab: "fund", c: ["#1b2a52", "#3b5bdb"], ic: "📦", k: "펀드 1,800개 중 한 달 1등", big: sg(fd[0].m1), sub: fd[0].n.replace(/\[.*?\]/g, "").slice(0, 24), go: "펀드 순위"});
    C.push({tab: "prop", c: ["#18263f", "#4c6ef5"], ic: "📝", k: "오늘 시황에 맞춘 제안서", big: "9종 준비", sub: "고객 이름·금액만 넣으면 한 장·PDF·PPT", go: "제안서 만들기"});
    var hot = d.hot && d.hot.items ? Object.keys(d.hot.items).map(function(k){ return d.hot.items[k]; }).filter(function(x){ return x.lv === 1; }).sort(function(a, b){ return a.at < b.at ? 1 : -1; }) : [];
    if (hot.length) C.push({tab: "feed", c: ["#3a1d1d", "#e03131"], ic: "📰", k: "피드 🔴 핵심 · " + md(hot[0].at), big: hot[0].why.split(/ — |—/)[0].slice(0, 28), sub: (hot[0].why.split(/ — |—/)[1] || "").slice(0, 40), go: "피드 보기"});
    var L = window.luckToday && luckToday();
    if (L && L.inv != null) C.push({tab: "luck", c: ["#2b1747", "#c2255c"], ic: "🔮", k: L ? L.name + " 님 오늘 투자운" : "오늘의 운세 · 타로", big: L && L.inv != null ? L.inv + "점" : "생일만 넣으면", sub: L ? "재미로 보는 오늘 기운" : "점수 · 행운의 색 · 투자운까지", go: "운세 보기"});
    return '<section class="h2-disc"><div class="h2-hd"><b>✨ 오늘의 발견</b><span class="mut">옆으로 넘겨 보세요 · ' + C.length + '가지</span></div><div class="h2-dc" id="h2dc">' + C.map(function(x){
      return '<button type="button" class="h2-d" data-goto="' + x.tab + '" style="background:linear-gradient(150deg,' + x.c[0] + ',' + x.c[1] + ')"><span class="ic">' + x.ic + '</span><small>' + e(x.k) + '</small><b>' + e(x.big) + '</b><em>' + e(x.sub) + '</em><span class="go">' + e(x.go) + ' ›</span></button>'; }).join("") + '</div></section>';
  }

  /* ───────── ④ 업종 지도 (넓이 = 종목 수 · 색 = 오늘 등락) ───────── */
  function squarify(items, x, y, w, h){
    var out = [], tot = items.reduce(function(a, b){ return a + b.w; }, 0), rest = items.slice();
    function worst(row, s){ var sum = row.reduce(function(a, b){ return a + b.a; }, 0), mx = Math.max.apply(null, row.map(function(r){ return r.a; })), mn = Math.min.apply(null, row.map(function(r){ return r.a; })); return Math.max(s * s * mx / (sum * sum), sum * sum / (s * s * mn)); }
    rest.forEach(function(it){ it.a = it.w / tot * w * h; });
    while (rest.length){
      var s = Math.min(w, h), row = [rest[0]], i = 1;
      while (i < rest.length && worst(row.concat([rest[i]]), s) <= worst(row, s)){ row.push(rest[i]); i++; }
      var sum = row.reduce(function(a, b){ return a + b.a; }, 0);
      if (w >= h){ var cw = sum / h, yy = y; row.forEach(function(r){ var rh = r.a / cw; out.push({it: r, x: x, y: yy, w: cw, h: rh}); yy += rh; }); x += cw; w -= cw; }
      else { var ch = sum / w, xx = x; row.forEach(function(r){ var rw = r.a / ch; out.push({it: r, x: xx, y: y, w: rw, h: ch}); xx += rw; }); y += ch; h -= ch; }
      rest = rest.slice(row.length);
    }
    return out;
  }
  /* 🗺 11/05 사용자 「깔끔하게 쫌」 — 칸이 15개라 글자가 잘리고 겹쳤음 → 큰 업종 9개 + 「그 밖」 한 칸 · 칸 안 그림 없앰 ·
     글자 크기는 칸의 실제 크기에 맞춰(fitMap) — 좁으면 이름은 빼고 숫자만, 아주 작으면 둘 다 뺌(누르면 보임) */
  function mapHtml(d){
    var useKr = d.kr && d.kr.sectors && (liveNow(d.kr) || !(d.us && d.us.sectors) || (kst().getUTCHours() >= 9 && kst().getUTCHours() < 22 && [0, 6].indexOf(kst().getUTCDay()) < 0));
    var J = useKr ? d.kr : d.us; if (!J || !J.sectors) return "";
    var all = J.sectors.filter(function(s){ return s.n >= 5; }).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, "").split(/[·\/]/)[0].trim(), ic: s.icon || "", v: s.r, w: Math.pow(s.n, 0.6), cnt: s.n, big: (s.big || []).slice(0, 3), up: s.up, down: s.down}; }).sort(function(a, b){ return b.w - a.w; });
    if (all.length < 6) return "";
    var it = all.slice(0, 12);   // 종목 수가 많은 큰 업종 12개만 (작은 업종은 시장 흐름 탭에)
    var W = 100, Hh = 78, R = squarify(it, 0, 0, W, Hh);
    var cells = R.map(function(r, k){
      return '<div class="h2-tm" data-k="' + k + '" style="left:' + r.x.toFixed(2) + '%;top:' + (r.y / Hh * 100).toFixed(2) + '%;width:' + r.w.toFixed(2) + '%;height:' + (r.h / Hh * 100).toFixed(2) + '%;background:' + heatBg(r.it.v) + '"><span>' + e(r.it.n) + '</span><b>' + sg(r.it.v) + '</b></div>'; }).join("");
    var when = useKr ? (liveNow(d.kr) ? "지금 " + d.kr.t : md(d.kr.date) + " 마감") : "미국 " + (d.us.t && d.us.t < "12:00" ? md(new Date(Date.parse(d.us.date + "T00:00:00Z") - 864e5).toISOString()) : md(d.us.date)) + " 마감";
    MAPIT = R.map(function(r){ return r.it; });
    return '<section class="card h2-map"><div class="h2-hd h2-mh" data-goto="sector"><b>' + (useKr ? "🇰🇷 한국" : "🇺🇸 미국") + ' 업종 지도</b><span class="mut">' + e(when) + ' · 큰 업종 ' + it.length + '개 · 칸을 누르면 대표 종목</span></div><div class="h2-tmw" data-nofs>' + cells + '</div><div class="h2-pick" id="h2pick"></div><div class="h2-lg" data-nofs><span class="dn">■ 내림</span><span class="up">오름 ■</span></div></section>';
  }
  function fitMap(){
    [].forEach.call(document.querySelectorAll(".h2-tm"), function(c){
      var w = c.clientWidth, h = c.clientHeight, sp = c.querySelector("span"), b = c.querySelector("b"); if (!w || !sp || !b) return;
      var vl = (b.textContent || "").length, nl = Math.max(2, (sp.textContent || "").length);
      var vf = Math.max(10, Math.min(20, h / 2.6, (w - 12) / (vl * 0.7))), nf = Math.max(10, Math.min(14, h / 4, (w - 8) / (nl * 0.95)));
      b.style.setProperty("font-size", vf.toFixed(1) + "px", "important"); sp.style.setProperty("font-size", nf.toFixed(1) + "px", "important");
      sp.style.display = (w >= 54 && h >= 46) ? "" : "none";
      b.style.display = (w >= 36 && h >= 22) ? "" : "none";
      b.dataset.wfs = sp.dataset.wfs = "1"; b.dataset.f13 = sp.dataset.f13 = "1";
    });
  }
  window.addEventListener("resize", function(){ setTimeout(fitMap, 100); });
  function mapPick(k){   // ⑲ 🎨 11/04 업종 칸 터치 → 대표 종목 3개 (사용자 「지금은 보기만 함」)
    var it = MAPIT[k], box = document.getElementById("h2pick"); if (!it || !box) return;
    [].forEach.call(document.querySelectorAll(".h2-tm.on"), function(x){ x.classList.remove("on"); });
    if (box.dataset.k === String(k)){ box.innerHTML = ""; box.dataset.k = ""; return; }
    var t = document.querySelector('.h2-tm[data-k="' + k + '"]'); if (t) t.classList.add("on");
    box.dataset.k = String(k);
    box.innerHTML = '<div class="h2-ph"><b>' + e(it.ic + " " + it.n) + ' <span class="' + cls(it.v) + '">' + sg(it.v) + '</span></b><small>' + (it.rest ? '' : '오른 ' + (it.up || 0) + ' · 내린 ' + (it.down || 0)) + '</small></div>' + (it.rest ? '<p class="note" style="margin:0 0 6px">' + e(it.rest.join(" · ")) + '</p>' : '') +
      (it.big.length ? it.big.map(function(x){ return '<button type="button" class="h2-pr" data-op="' + e(x.s) + '"><b>' + e(x.n) + '</b><em>' + e(String(x.s).replace(/\.(KS|KQ)$/, "")) + '</em><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></button>'; }).join("") : '<p class="note">대표 종목 자료가 없어요.</p>');
  }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest(".h2-tm[data-k]"); if (!t || !t.closest("#h2map")) return; ev.stopPropagation(); ev.preventDefault(); mapPick(+t.dataset.k); }, true);
  /* ㉑ 고객에게 보낼 한 장 미리보기 — 홈에서 바로 「보내기」 (onepage.js 의 고르기 창을 엶) */
  /* 🔍 11/05 A3 「한 장」 3개(고객에게 보낼 한 장 · ☀️ 오늘 한 장 · 📨 이번 주 한 장)를 카드 하나로 — 위 탭 3칸 */
  var CLT = "c";
  function clientHtml(d){
    var b = d.brief; if (!b || !b.one) return "";
    var tk = (b.talk || []).slice(0, 2), A = b.advice || {};
    var fri = (function(){ var k = kst(), w = k.getUTCDay(), hh = k.getUTCHours(); return (w === 5 && hh >= 15) || w === 6 || w === 0; })();
    var pane = {
      c: '<div class="h2-clp"><div class="h2-clt">' + e(b.one) + '</div>' + (tk.length ? '<ul>' + tk.map(function(x){ return '<li>' + e(x) + '</li>'; }).join("") + '</ul>' : '') + (A.read ? '<p>' + e(A.read) + '</p>' : '') + '</div>' +
         '<button type="button" class="h2-clb" data-clgo="op">📨 카톡으로 보내기 — 한 장 고르기</button>',
      p: '<div class="h2-clp">' + (b.regime ? '<div class="h2-clr">' + e(b.regime) + '</div>' : '') + '<ul>' + (b.talk || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("") + '</ul>' +
         ((b.events || []).length ? '<div class="h2-cle"><b>📅 오늘 일정</b>' + b.events.map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') +
         ((A.plan || []).length ? '<div class="h2-cle"><b>🧭 대응</b>' + A.plan.slice(0, 2).map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') + '</div>' +
         '<button type="button" class="h2-clb alt" data-clgo="pb">☀️ PB용 한 장 그림으로 받기</button>',
      w: '<div class="h2-clp"><div class="h2-clt">' + (fri ? "이번 주 한 장이 준비됐어요" : "금요일 장이 끝나면 이번 주 한 장이 열려요") + '</div><p>' + (fri ? "이번 주 지수·업종·포트 흐름을 고객용 그림 한 장으로 만들어 드려요." : "지금 눌러도 지난 금요일까지의 주간 요약으로 만들 수 있어요.") + '</p></div>' +
         '<button type="button" class="h2-clb" data-clgo="wk">📨 이번 주 한 장 만들기</button>'
    };
    if (fri && CLT === "c" && !ls("h2_clt_pick")) CLT = "w";
    var tabs = [["c", "👥 고객용"], ["p", "📋 PB 요약"], ["w", "📅 이번 주"]];
    return '<section class="card h2-cl no-clp" data-cz="done" data-xc="1"><div class="h2-hd"><b>📨 오늘의 한 장</b><span class="mut">' + e(b.label || "") + '</span></div>' +
      '<div class="h2-clt3">' + tabs.map(function(t){ return '<button type="button" data-clt="' + t[0] + '"' + (CLT === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>'; }).join("") + '</div>' +
      '<div class="h2-clw">' + tabs.map(function(t){ return '<div data-clp="' + t[0] + '"' + (CLT === t[0] ? '' : ' hidden') + '>' + pane[t[0]] + '</div>'; }).join("") + '</div></section>';
  }
  function clientBind(root){
    [].forEach.call(root.querySelectorAll("[data-clt]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); CLT = x.dataset.clt; ls("h2_clt_pick", 1);
      [].forEach.call(root.querySelectorAll("[data-clt]"), function(y){ y.classList.toggle("on", y === x); });
      [].forEach.call(root.querySelectorAll("[data-clp]"), function(y){ y.hidden = y.dataset.clp !== CLT; }); }; });
    [].forEach.call(root.querySelectorAll("[data-clgo]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var k = x.dataset.clgo;
      if (k === "wk"){ if (window.__weekSend) __weekSend(); else if (window.toast) window.toast("잠시 뒤 다시 눌러 주세요"); return; }
      if (k === "pb"){ var pc = document.querySelector("#pbcard .pb-ft button, #pbcard [data-pbsend], #pbcard button"); if (pc){ pc.click(); return; } }
      var ob = document.getElementById("opbtn"); if (ob) ob.click(); else if (window.goTo) goTo("home"); }; });
  }

  /* ───────── 붙이기 ───────── */
  var CUR_S = null, BUSY = false;
  /* 🐻 11/09 하락장 계기판 — 사용자 「하락장이면 현금 늘리라 권하고, 바닥이면 이 조건 충족 시 비중 늘리자 — 네가 설명하고 이끌어」
     market/bear.json(src/bear_gate.py, 종가 기계 판정): 시장별 🟢/🟡/🐻 · 현금 권고 · 🌱 바닥 신호 4개. 결론 한 줄 + 펼치면 체크리스트 */
  /* 🏁 11/11 사용자 「각 시장에 고친 방식을 적용하고 신호, 설명창도 추가」 — 시장마다 채택한 방식(best_bt 1등) · 지금 켜진 신호 · 누르면 쉬운 설명 */
  var METH = {
    kospi: {t: "흔들리면 전부 현금 · 아주 싸지면 주식", how: "하락장(고점 −20%) · 신용 경보 + 200일선 아래 · 버블 시계 4시 반 — 셋 중 하나라도 켜지면 주식 몫 전부 현금",
            back: "바닥이 다져지고(저점 10일 넘게 안 깨짐) 50일선 위로 올라오면 다시 주식 (하락장은 판정이 풀릴 때) · 🧩 11/12부터: 코스피가 5년 평균선보다 많이 아래(자기 과거 하위 15%)로 싸지면 경고가 켜져 있어도 현금을 풀고 주식으로",
            why: "1999년부터 다시 돌려 보니 경고 규칙만 쓰면 1년 수익 9.8% · 「아주 싸지면 주식」까지 얹으면 11.9% (2012년까지 13.8% · 2013년 뒤 9.9%) · 그냥 들고 있기 8.5%",
            note: "11/12 수익을 택했어요 — 대신 가장 크게 잃은 폭이 −26% → −43%로 커져요(싸진 뒤에 더 빠진 때가 있었음). 지금 코스피는 5년 평균선보다 +61%라 이 신호는 꺼져 있어요"},
    kosdaq: {t: "버블 시계 6시면 전부 현금 · 미국이 비싸면 절반", how: "버블 시계가 6시를 넘으면 주식 몫 전부 현금 · 🧩 11/12부터: 미국 CAPE(10년 평균 이익 대비 주가)가 과거 상위 10%로 비싸면 최소 절반은 현금",
            back: "신저가가 나온 뒤 바닥 신호가 4개 중 3개 켜지면 다시 주식",
            why: "그냥 들고 있으면 1년 −0.8%(손해)였는데 시계만 쓰면 +4.0% · 미국 CAPE 경고까지 얹으면 +4.9% · 가장 크게 잃은 폭 −72% → −42%", note: "미국 CAPE 경고는 코스피·S&P500·나스닥에도 얹어 봤지만 2012년까지·2013년 뒤 둘 다 나아진 곳은 코스닥뿐이라 코스닥에만 썼어요"},
    sp500: {t: "흔들리면 절반만 채권", how: "고점 −10%(조정) · 또는 신용 경보 + 200일선 아래 — 켜지면 주식 몫 절반을 채권형(중기국채)으로",
            back: "신저가가 나온 뒤 바닥 신호가 켜지면 다시 주식 (신저가 없이 회복하면 바로 복귀)",
            why: "1년 수익 8.6% → 9.4% · 가장 크게 잃은 폭 −55% → −40% · 현금으로 빼면 2013년 뒤엔 손해였고 채권 절반이 가장 나았어요", note: ""},
    nasdaq: {t: "그냥 들고 있기", how: "신호가 와도 팔지 않아요", back: "—",
            why: "200가지 넘게 돌려 봤는데 2012년까지와 2013년 뒤를 둘 다 이긴 방식이 없었어요 — 크게 빠져도 빨리 회복해서 팔면 손해", note: "크게 흔들리는 시장이라 처음부터 비중을 적당히 두는 게 방패예요"}
  };
  function methHtml(B){
    var FL = {kr: "🇰🇷", us: "🇺🇸"};
    var rows = (B.markets || []).map(function(m){
      var D = METH[m.key]; if (!D) return "";
      var ap = m.analog;   // 🔁 11/12 닮은 장 규칙 채택 — 설명을 그 규칙으로 바꿔 보여 줌
      if (ap) D = {t: "🔁 " + ap.rule, how: "지금 장과 닮았던 " + ap.n + "번에서 2년 뒤 가운데값이 가장 좋았던 방식이에요 — " + ap.rule, back: ap.next,
        why: "닮은 때 2년 뒤 가운데값 " + sg(ap.y2_med) + " · 가장 나빴던 때 " + sg(ap.y2_worst) + " · 현금보다 나았던 때 " + ap.beat_cash + "/" + ap.n + "번 (지금 다 샀다면 가운데 " + sg(ap.lump_med) + " · 최악 " + sg(ap.lump_worst) + ")",
        note: "하나 빼고 고르기 검증: 가운데 " + sg(ap.loo.med) + " · 최악 " + sg(ap.loo.worst) + (m.cash_old != null && m.cash_old !== m.cash ? " · 예전 규칙이면 " + (m.to || "현금") + " " + m.cash_old + "% — " + METH[m.key].t : " · 예전 방식: " + METH[m.key].t)};
      var b = m.best || {}, ck = m.checks || [], nb = ck.filter(function(c){ return c.on; }).length;
      var sig = [];
      if (ap) sig = [];
      else if (m.key === "kospi") sig = [["하락장", m.state === "🐻"], ["신용 경보", !!(m.clock && m.clock.kospi_on)], ["시계 4시 반", !!b.on], ["🌱 아주 쌈", !!((m.overlay && m.overlay.parts) || []).filter(function(p){ return p.on; }).length]];
      else if (m.key === "kosdaq") sig = [["시계 6시", !!b.on], ["미국 CAPE 비쌈", !!((m.overlay && m.overlay.parts) || []).filter(function(p){ return p.on; }).length]];
      else if (m.key === "sp500") sig = [["고점 −10%", !!(m.b50 && m.b50.on)], ["신용 경보+200일선", !!b.on]];
      var out = m.cash || 0, to = m.to || "현금";
      var now = m.key === "nasdaq" && !ap ? "주식 그대로" : out ? "주식 " + (100 - out) + "% · " + to + " " + out + "%" : "주식 100%";
      var backNow = ap ? "" : out && m.key !== "nasdaq" ? '<div class="bm-back">🌱 다시 사는 신호 <b>' + nb + '/4</b> — ' + e(D.back) + '</div>' : "";
      return '<details class="bm-r' + (out ? " on" : "") + '"><summary><span class="bm-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>' + e(D.t) + '</small></span>' +
        '<span class="bm-now"><b>' + e(now) + '</b>' + (sig.length ? '<span class="bm-sg">' + sig.map(function(x){ return '<i class="' + (x[1] ? "on" : "") + '">' + (x[1] ? "🔴 " : "⚪ ") + e(x[0]) + '</i>'; }).join("") + '</span>' : '') + '</span></summary>' +
        '<div class="bm-x"><p><b>' + (ap ? "어떤 방식" : "언제 옮기나") + '</b> ' + e(D.how) + '</p>' + (ap ? '<p><b>다음에 바뀌는 때</b> ' + e(D.back) + '</p>' : m.key !== "nasdaq" ? '<p><b>언제 다시 사나</b> ' + e(D.back) + '</p>' : '') +
        (window.__meetLine ? __meetLine(m) : '') +   // 📏 11/13 A11/13-1
        '<p><b>왜 이 방식</b> ' + e(D.why) + '</p>' + (D.note ? '<p class="bm-note">' + e(D.note) + '</p>' : '') +
        (b.since && b.on ? '<p class="bm-note">' + e(b.ent === "credit200" ? "신용 경보+200일선" : b.ent === "clock6" ? "시계 6시" : b.ent === "clock4.5" ? "시계 4시 반" : "신호") + ' 켜진 날 ' + e(md(b.since)) + ' · 대리 버블 시계 지금 ' + (b.h_free != null ? b.h_free + "시" : "–") + '</p>' : '') +
        '</div>' + backNow + '</details>';
    }).join("");
    return '<div class="bm"><div class="bm-h">🏁 시장별 방식 <small>🔁 지금 장과 닮았던 때에서 가장 나았던 방식 · 누르면 설명</small></div>' + rows + '<p class="bm-note">💼 기본 포트는 S&P500 200일선 규칙이 먼저예요 · 🔁 닮은 장 규칙은 국내 주식과 시장별 참고용 — 🇺🇸 200일선 아래로 내려가 두 규칙이 엇갈리기 시작하면 알림</p></div>';
  }
  function moreHtml(B){   // 🌏 11/12 일본·중국·홍콩 — 판정 + 닮은 장 규칙 (bear.json more)
    var A = B.more || []; if (!A.length) return "";
    var FL = {jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰"}, NM = {"🟢": "정상", "🟡": "조정", "🐻": "하락장"};
    return '<details class="bm bm-more"><summary class="bm-h">🌏 일본·중국·홍콩 <small>' + A.map(function(m){ return m.state + e(m.name.replace("225", "").replace("종합", "").replace("성분", "")); }).join(" ") + '</small></summary>' +
      A.map(function(m){ var ap = m.analog;
        return '<div class="bmm"><span>' + (FL[m.nat] || "") + ' <b>' + e(m.name) + '</b> ' + m.state + ' ' + NM[m.state] + ' <small>고점보다 ' + sg(m.dd) + '</small></span><em>' + (ap ? "주식 " + ap.stock + "%" : "정하지 않음") + '</em>' +
          '<small>' + (ap ? '🔁 ' + e(ap.rule) + ' · 다음: ' + e(ap.next) : '닮은 장에서 통하는 방식이 없었어요 — 한 번에 사지 말고 나눠 사기만 참고') + '</small>' + (window.__meetLine ? __meetLine(m) : '') + '</div>'; }).join("") +   // 📏 11/13
      '<p class="bm-note">상태나 주식 몫이 바뀌면 알림이 가요 · 매수·매도 추천 아님</p></details>';
  }
  function bearHtml(d){
    var B = d.bear; if (!B || !B.markets || !B.markets.length) return "";
    var M_ = B.markets, bad = M_.filter(function(m){ return m.state !== "🟢"; });
    var FL = {kr: "🇰🇷", us: "🇺🇸"}, NM = {"🟢": "정상", "🟡": "조정", "🐻": "하락장"};
    var chips = M_.map(function(m){ return '<span class="bg-c s' + (m.state === "🐻" ? 3 : m.state === "🟡" ? 2 : 1) + '">' + FL[m.nat] + ' ' + e(m.name) + ' <b>' + m.state + ' ' + NM[m.state] + '</b><small>' + sg(m.dd, 0) + '</small></span>'; }).join("");
    var lead = bad.length ? B.lead : "네 시장 모두 정상 — 현금을 따로 늘릴 때 아님";
    var det = bad.map(function(m){
      var ladder = m.state === "🐻" ? [30, 30, 20, 10, 0] : [10, 10, 5, 0, 0];
      return '<div class="bg-m"><div class="bg-mh">' + FL[m.nat] + ' <b>' + e(m.name) + '</b> ' + m.state + ' ' + NM[m.state] + ' · 고점보다 ' + sg(m.dd) + ' · 지금 권고 현금 <b>' + m.cash + '%</b></div>' +
        (m.analog ? '<div class="bg-n">🔁 닮은 장 규칙 — <b>' + e(m.analog.rule) + '</b> · 다음: ' + e(m.analog.next) + ' · 아래 신호는 참고</div>'
          : m.rule && m.rule.id === "OFF" ? '<div class="bg-n">⏸ 이 시장은 현금 규칙을 꺼 뒀어요 — 2013년 이후엔 어떤 현금 규칙도 그냥 보유를 못 이겼어요 · 판정과 아래 신호는 참고</div>'
          : m.rule && !m.nuse ? '<div class="bg-n">🌱 ' + e(m.rule.name) + ' · 아래 신호는 참고</div>'
          : '<div class="bg-n">🌱 다시 사는 조건 <b>' + m.n + '/' + (m.nuse || 4) + '</b> — ' + e(m.rule ? m.rule.name : "켜질수록 3분의 1씩 다시 사기") + '</div>') +   // 🌱 11/09 시장별 다시 사기 규칙
        (window.__meetLine ? __meetLine(m) : '') +   // 📏 11/13 A11/13-1 선이 닿는 날 한 토막 (ux1113.js)
        (window.__bearSigHead ? __bearSigHead(m) : '') +   // 🌱 11/09 A11/9-1 과거 성적표 (ux1109b.js)
        '<ul class="bg-ck">' + (m.checks || []).map(function(c, k){ return '<li class="' + (c.on ? "on" : "") + '"><i>' + (c.on ? "✅" : "⬜") + '</i><b>' + e(c.k) + (c.use === false ? ' <em class="bg-ref">참고</em>' : '') + '</b><small>' + e(c.d) + '</small>' + (window.__bearSigLine ? __bearSigLine(m, k) : '') + '</li>'; }).join("") + '</ul>' +
        '<div class="bg-lad">' + (m.ladder ? m.ladder.map(function(x){ return [x[0], x[1]]; }) : [[ladder[0], "신호 0~1개"], [ladder[2], "2개"], [ladder[3], "3개"], [ladder[4], "4개"]]).map(function(x, i, A){ var now = m.ladder && m.ladder.length ? x[0] === m.cash : Math.max(0, m.n - 1) === i; return '<span class="' + (now ? "now" : "") + '"><small>' + e(x[1]) + '</small><b>' + e(m.to || '현금') + ' ' + x[0] + '%</b></span>'; }).join("") + '</div>' +
        '<p class="bg-ad">' + e(m.advice) + '</p></div>';
    }).join("");
    return '<section class="card h2-bear" id="bear" data-cz="done"><div class="bg-h">🐻 하락장 계기판 <small>' + e(md(B.at)) + ' ' + e(String(B.at || "").slice(11, 16)) + ' · 종가 판정</small></div>' +
      '<div class="bg-cs">' + chips + '</div><p class="bg-lead' + (bad.length ? " warn" : "") + '">' + e(lead) + '</p>' + methHtml(B) + moreHtml(B) +
      (bad.length ? '<details class="bg-d"><summary>무엇을 보면 다시 사나 · 체크리스트 펼치기</summary>' + det +
        '<p class="note bg-ru">판정: 고점보다 −10% 조정 · −20% 하락장 (종가) · 현금 권고(11/11부터): 위 🏁 시장별 방식 — 1999년부터 200여 가지를 돌려 2012년까지·2013년 뒤 둘 다 그냥 들고 있기를 이긴 것 중 수익 1등(best_bt). 판정 규칙은 결과 보기 전 등록 · 매수·매도 추천 아님 — 고객 성향·기간에 맞춰 판단.</p></details>' : '') +
      '</section>';
  }
  function apply(){
    if (!on() || typeof cur === "undefined" || cur !== "home") return;
    var b = document.getElementById("hmbody"); if (!b || BUSY) return;
    // 🧊 11/09 ⑪ 쉬운 화면에서 「오늘 자세히 보기」를 안 열었으면 무거운 자료(상품 0.9MB·나침반 0.7MB 등)를 받지 않음 — 열 때 받음
    if (document.documentElement.getAttribute("data-ez") === "easy" && !b.classList.contains("ez-open")) return;
    var hero = document.getElementById("tdhero"); if (!hero) return;
    if (b.getAttribute("data-h2") === String(DT) && document.getElementById("h2rings")) return reorder(b);
    BUSY = true;
    load().then(function(d){
      BUSY = false; if (!d || cur !== "home") return;
      var S = stories(d); CUR_S = S;
      ["h2rings", "h2world", "h2disc", "h2map", "h2num", "h2cl"].forEach(function(id){ var x = document.getElementById(id); if (x) x.remove(); });
      var mk = function(id, html){ var w = document.createElement("div"); w.id = id; w.innerHTML = html; return w; };
      var rings = mk("h2ringsw", ringsHtml(S)); rings.id = "h2ringsw";
      var old = document.getElementById("h2ringsw"); if (old) old.remove();
      b.insertBefore(rings, b.firstChild);
      var num = mk("h2num", numHtml(d)); b.insertBefore(num, b.firstChild);   // ⑰ 오늘의 숫자 맨 위
      var ob = document.getElementById("h2bear"); if (ob) ob.remove(); var bh = bearHtml(d); if (bh) num.insertAdjacentElement("afterend", mk("h2bear", bh));   // 🐻 11/09 결론 바로 아래
      var obb = document.getElementById("h2bub"); if (obb) obb.remove(); try { var bbh = window.__bubCard ? __bubCard(d.bub) : ""; if (bbh) (document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2bub", bbh)); } catch(x) {}   // 🫧 11/10 버블 경보판 — 계기판 바로 아래 (ux1110b.js)
      var osc = document.getElementById("h2season"); if (osc) osc.remove(); try { var sch = window.__seasonCard && window.__seasonData ? __seasonCard(window.__seasonData) : ""; if (sch) (document.getElementById("h2bub") || document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2season", sch)); } catch(x) {}   // 🧭 11/12 계절 시계 (ux1112.js)
      var osp = document.getElementById("h2sigprob"); if (osp) osp.remove(); try { var sph = window.__sigProbCard && window.__sigProbData ? __sigProbCard(window.__sigProbData) : ""; if (sph) (document.getElementById("h2season") || document.getElementById("h2bub") || document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2sigprob", sph)); } catch(x) {}   // 🎯 11/12 신호 확률판 (ux1112d.js)
      var oan = document.getElementById("h2analog"); if (oan) oan.remove(); try { var anh = window.__analogCard && window.__analogData ? __analogCard(window.__analogData) : ""; if (anh) (document.getElementById("h2bub") || document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2analog", anh)); } catch(x) {}   // 🔁 11/12 닮은 장 백테스트 (ux1112e.js) — 버블 경보판 바로 아래
      var orb = document.getElementById("h2reb"); if (orb) orb.remove();   // 📨 11/10 A11/10-1 반등 날 기록 — 🛡 결론 밑 · 계기판 위 (ux1110.js · 반등 날에만)
      try { var kx_ = ix(d.kr, "코스피"), rh = window.__rebCard && kx_ && d.kr && d.kr.date === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) ? __rebCard(d.bear, kx_.chg, "home") : ""; if (rh) num.insertAdjacentElement("afterend", mk("h2reb", rh)); } catch(x) {}
      var world = mk("h2world", worldHtml(d)), disc = mk("h2disc", discHtml(d)), map = mk("h2map", mapHtml(d)), cl = mk("h2cl", clientHtml(d));
      rings.insertAdjacentElement("afterend", world); world.insertAdjacentElement("afterend", hero);   // 날씨판은 타일 아래로
      hero.insertAdjacentElement("afterend", disc);
      var pl = b.querySelector("section.card.pl"); (pl || disc).insertAdjacentElement("afterend", map); map.insertAdjacentElement("afterend", cl);
      clientBind(cl);
      setTimeout(fitMap, 30); setTimeout(fitMap, 600);
      world.querySelector(".card") && world.querySelector(".card").setAttribute("data-cz", "done"); map.querySelector(".card") && map.querySelector(".card").setAttribute("data-cz", "done");
      b.setAttribute("data-h2", String(DT));
      [].forEach.call(rings.querySelectorAll("[data-st]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); openStory(S, +x.dataset.st); }; });
      reorder(b);
    }).catch(function(x){ BUSY = false; console.warn("home2", x); });
  }
  window.__h2apply = function(){ try { apply(); } catch(x) {} };
  function reorder(b){   // v2에선 「오늘 한 장」·「바뀐 것」·5개 시장과 겹치는 띠는 아래로 / 숨김
    var hm = document.getElementById("hmlive"); if (hm) hm.classList.add("h2-hide");
    var more = b.querySelector(".hm-more"); if (more) more.classList.add("h2-hide");   // 아래 바로가기 줄 → 「오늘의 발견」이 대신
    var nm_ = document.getElementById("h2num"); if (nm_ && b.firstElementChild !== nm_) b.insertBefore(nm_, b.firstChild);
    var br_ = document.getElementById("h2bear"); if (nm_ && br_ && nm_.nextElementSibling !== br_) nm_.insertAdjacentElement("afterend", br_);
    var bb_ = document.getElementById("h2bub"), ba_ = br_ || nm_; if (ba_ && bb_ && ba_.nextElementSibling !== bb_) ba_.insertAdjacentElement("afterend", bb_);
    var hz = document.getElementById("tdhero"), wz = document.getElementById("h2world"); if (hz && wz && wz.nextElementSibling !== hz) wz.insertAdjacentElement("afterend", hz);
    // 🔍 11/05 A3: ☀️ 오늘 한 장 · 📨 이번 주 한 장 카드는 「📨 오늘의 한 장」 탭으로 합쳤으니 홈에선 숨김(보내기 단추는 그대로 씀)
    var pb = document.getElementById("pbcard"); if (pb && document.getElementById("h2cl")) pb.classList.add("h2-hide");
    var w1 = document.getElementById("wk1"); if (w1 && document.getElementById("h2cl")) w1.classList.add("h2-hide");
    // 🔍 11/05 A2: 홈은 4장만 펼침 — 나머지는 제목 한 줄(펼치기). 날씨판·발견·바뀐 것 등에 제목을 달아 둠(calm.js 가 접음)
    var hz2 = document.getElementById("tdhero"); if (hz2 && !hz2.dataset.czt) hz2.dataset.czt = "🌤 지금 시장 날씨";
    var dz = document.querySelector("#h2disc .h2-disc"); if (dz && !dz.dataset.czt){ dz.dataset.czt = "✨ 오늘의 발견"; dz.classList.add("card"); }
    var vt = b.querySelector(".hb-vote"); if (vt) vt.setAttribute("data-cz", "done");
  }
  var T = 0;
  try { new MutationObserver(function(ms){
    if (!on()) return;
    for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && t.closest("#h2ringsw,#h2world,#h2disc,#h2map,#h2sv,#h2bear,#h2bub")) continue; if (T) return; T = setTimeout(function(){ T = 0; apply(); }, 200); return; }
  }).observe(document.getElementById("main") || document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (on() && !document.hidden && typeof cur !== "undefined" && cur === "home"){ DT = 0; var b = document.getElementById("hmbody"); if (b) b.removeAttribute("data-h2"); apply(); } }, 5 * 60e3);

  var css = document.createElement("style");
  css.textContent =
    ".h2-hide{display:none!important}html.h2-lock{overflow:hidden}" +
    ".h2-bear{padding:16px 16px 14px!important}.bg-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bg-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".bg-cs{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 8px}.bg-c{display:inline-flex;align-items:baseline;gap:4px;font-size:13.5px;border-radius:12px;padding:7px 10px;background:var(--panel2)}.bg-c b{font-weight:800}.bg-c small{font-size:12px;color:var(--sub);font-weight:700}" +
    ".bg-c.s3{background:rgba(47,111,221,.14);box-shadow:inset 0 0 0 1.5px rgba(47,111,221,.45)}.bg-c.s2{background:rgba(240,180,60,.16)}.bg-c.s1{opacity:.85}" +
    ".bg-lead{margin:0;font-size:15.5px;line-height:1.5;font-weight:700;word-break:keep-all;text-wrap:pretty}.bg-lead.warn{color:var(--text)}" +
    ".bg-d{margin-top:10px}.bg-d summary{cursor:pointer;font-size:14px;font-weight:800;color:var(--accent,#3182f6);list-style:none}.bg-d summary::-webkit-details-marker{display:none}.bg-d summary:after{content:' ▾'}.bg-d[open] summary:after{content:' ▴'}" +
    ".bg-m{background:var(--panel2);border-radius:14px;padding:12px;margin-top:10px}.bg-mh{font-size:14.5px;line-height:1.5;word-break:keep-all}.bg-n{font-size:14px;font-weight:700;margin:6px 0 4px}" +
    ".bg-ck{list-style:none;margin:0;padding:0}.bg-ck li{display:grid;grid-template-columns:22px 1fr;column-gap:4px;padding:5px 0;border-top:1px solid var(--line,rgba(0,0,0,.06));font-size:14px}.bg-ck li i{font-style:normal;grid-row:span 2}.bg-ck li b{font-weight:700}.bg-ck li small{color:var(--sub);font-size:12.5px;word-break:keep-all}.bg-ck li.on b{color:var(--up,#f04452)}" +
    ".bg-lad{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:8px 0 6px}.bg-lad span{text-align:center;border-radius:10px;padding:6px 2px;background:var(--panel,#fff);opacity:.6}.bg-lad span.now{opacity:1;box-shadow:inset 0 0 0 2px var(--accent,#3182f6)}.bg-lad small{display:block;font-size:11.5px;color:var(--sub);font-weight:700}.bg-lad b{font-size:14px;font-weight:900}" +
    ".bm-more summary{cursor:pointer;list-style:none;min-height:44px}.bm-more summary::-webkit-details-marker{display:none}.bm-more summary:after{content:\" ▾\";color:var(--sub)}.bmm{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:8px 0;border-top:1px solid var(--line,rgba(127,127,127,.18));font-size:14px}.bmm em{font-style:normal;font-weight:900}.bmm>small{grid-column:1/-1;font-size:12.5px;line-height:1.45;color:var(--sub);word-break:keep-all}.bmm span small{color:var(--sub)}" +
    ".bm{margin:12px 0 4px}.bm-h{font-size:14px;font-weight:900;margin-bottom:6px}.bm-h small{display:block;font-size:11.5px;font-weight:600;color:var(--sub);margin-top:1px}" +
    ".bm-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.bm-r.on{box-shadow:inset 3px 0 0 #e5484d}.bm-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.bm-r>summary::-webkit-details-marker{display:none}" +
    ".bm-n{min-width:0}.bm-n b{font-size:14px;font-weight:900}.bm-n small{display:block;font-size:12px;color:var(--sub);font-weight:700;margin-top:1px}.bm-now{text-align:right;flex:0 0 auto;max-width:58%}.bm-now>b{font-size:13.5px;font-weight:900;white-space:nowrap}" +
    ".bm-sg{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:3px;margin-top:4px}.bm-sg i{font-style:normal;font-size:11px;font-weight:700;padding:1px 6px;border-radius:999px;background:rgba(127,127,127,.12);color:var(--sub);white-space:nowrap}.bm-sg i.on{background:rgba(229,72,77,.14);color:#e5484d}" +
    ".bm-x{margin-top:8px;font-size:13px;line-height:1.55;word-break:keep-all}.bm-x p{margin:4px 0 0}.bm-x b{font-weight:800;margin-right:4px}.bm-note{color:var(--sub);font-size:12px}.bm-back{margin-top:6px;font-size:12.5px;font-weight:600;word-break:keep-all}.bm-back b{color:#30a46c}" +
    ".bg-ad{margin:4px 0 0;font-size:14px;line-height:1.5;font-weight:600;word-break:keep-all}.bg-ru{font-size:12px;margin:10px 0 0}" +
    /* 🔍 11/05 A1 오늘의 결론 · A3 한 장 탭 */
    ".h2-vd{display:flex;align-items:center;gap:8px;margin:0 0 2px}.h2-num .h2-vd span{font-size:28px}.h2-num .h2-vd b{display:inline;margin:0;font-size:clamp(26px,8vw,32px);font-weight:900;letter-spacing:-1px;line-height:1.15}.h2-num .h2-vd.dn b{color:var(--down,#3182f6)}.h2-num .h2-vd.up b{color:var(--up,#f04452)}" +
    ".h2-vs{font-size:14.5px;font-weight:700;color:var(--sub);margin:2px 0 10px}" +
    ".h2-nn{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 8px}.h2-num .h2-nn div{background:var(--panel2);border-radius:14px;padding:10px 12px}.h2-num .h2-nn small{display:block;font-size:13px;font-weight:700;color:var(--sub)}.h2-num .h2-nn b{display:block;font-size:26px;font-weight:900;letter-spacing:-.8px;margin-top:2px}.h2-num .h2-nn b.up{color:var(--up,#f04452)}.h2-num .h2-nn b.dn{color:var(--down,#3182f6)}" +
    ".h2-np{display:inline-flex;align-items:center;gap:4px;font-size:13.5px;color:var(--sub);cursor:pointer}.h2-num .h2-np b{display:inline;font-size:inherit;margin:0;letter-spacing:0;line-height:inherit;color:var(--text)}.h2-np em{font-style:normal;font-size:12px;font-weight:800;color:#b7791f;background:rgba(240,180,60,.18);border-radius:999px;padding:2px 8px}" +
    ".h2-clt3{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:var(--panel2);border-radius:12px;padding:4px;margin-bottom:10px}.h2-clt3 button{font:inherit;font-size:14px;font-weight:800;border:0;border-radius:9px;padding:9px 4px;background:transparent;color:var(--sub)}.h2-clt3 button.on{background:var(--panel);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.12)}" +
    ".h2-clr{font-size:14px;font-weight:700;margin-bottom:6px}.h2-cle{margin-top:10px;font-size:14px;line-height:1.5}.h2-cle b{display:block;font-size:14px;margin-bottom:2px}.h2-cle div{padding:2px 0;color:var(--text)}.h2-clb.alt{background:var(--panel2);color:var(--text);border:1px solid var(--line)}" +
    /* ⑰ 오늘의 숫자 */
    ".h2-num{cursor:pointer;padding:22px 20px 18px!important}.h2-num small{display:block;font-size:14px;font-weight:700;color:var(--sub);letter-spacing:-.2px}.h2-num b{display:block;font-size:clamp(40px,12vw,54px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin:4px 0 6px}" +
    ".h2-num b.up{color:var(--up,#f04452)}.h2-num b.dn{color:var(--down,#3182f6)}.h2-num p{margin:0;font-size:16.5px;line-height:1.5;font-weight:600;word-break:keep-all;text-wrap:pretty}.h2-nsub{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.h2-nsub span{font-size:13px;font-weight:700;color:var(--sub);background:var(--panel2);border-radius:999px;padding:4px 10px}" +
    /* ⑳ 타일 안 하루 흐름 */
    ".h2-w{position:relative;overflow:hidden}.h2-sp{position:absolute;left:0;right:0;bottom:0;width:100%;height:30%;opacity:.5}.h2-sp line{stroke:#fff;stroke-width:.6;stroke-dasharray:2 2;vector-effect:non-scaling-stroke}.h2-sp polyline{fill:none;stroke:#fff;stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}" +
    /* ⑲ 지도 터치 */
    ".h2-tm.on{outline:3px solid #fff;outline-offset:-3px;z-index:2}.h2-pick{margin-top:8px}.h2-ph{display:flex;justify-content:space-between;align-items:baseline;padding:8px 2px 4px}.h2-ph b{font-size:16.5px}.h2-ph small{color:var(--sub);font-size:13px}" +
    ".h2-pr{display:flex;align-items:center;gap:8px;width:100%;font:inherit;text-align:left;padding:10px 4px;border:0;border-top:1px solid var(--line);background:transparent;color:var(--text)}.h2-pr b{font-size:15.5px;font-weight:700}.h2-pr em{font-style:normal;font-size:13px;color:var(--dim)}.h2-pr span{margin-left:auto;font-weight:800;font-size:15.5px}" +
    /* ㉑ 고객 한 장 */
    ".h2-clp{background:var(--panel2);border-radius:14px;padding:14px 16px;margin-bottom:12px}.h2-clt{font-size:17px;font-weight:800;letter-spacing:-.3px;line-height:1.4;margin-bottom:8px}.h2-clp ul{margin:0;padding-left:18px;font-size:14px;line-height:1.55;color:var(--sub)}.h2-clp p{margin:8px 0 0;font-size:14px;line-height:1.55;color:var(--sub)}" +
    ".h2-clb{display:block;width:100%;font:inherit;font-size:16px;font-weight:800;padding:14px;border-radius:14px;border:0;background:#fee500;color:#191600}" +
    ".h2-hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 2px 10px}.h2-hd b{font-size:16.5px;letter-spacing:-.3px}.h2-hd .mut{font-size:12px}" +
    /* 링 */
    ".h2-rings{display:flex;gap:12px;overflow-x:auto;padding:4px 4px 12px;margin:0 -4px;scrollbar-width:none}.h2-rings::-webkit-scrollbar{display:none}" +
    ".h2-ring{flex:none;display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:0;padding:0;font:inherit;color:var(--text);cursor:pointer;width:64px}" +
    ".h2-ring .o{width:62px;height:62px;border-radius:50%;padding:3px;background:conic-gradient(#f08c00,#e03131,#c2255c,#7048e8,#1c7ed6,#12b886,#f08c00);display:block}" +
    ".h2-ring.seen .o{background:var(--line)}.h2-ring .i{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;background:var(--panel);border:3px solid var(--bg);font-size:27px}" +
    ".h2-ring small{font-size:11.5px;font-weight:700;letter-spacing:-.4px;white-space:nowrap}.h2-ring:active .o{transform:scale(.94)}" +
    /* 세계 */
    ".h2-wg{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.h2-wg .h2-w{grid-column:span 2}.h2-wg .h2-w.big{grid-column:span 3;padding:12px 12px 10px}.h2-w.big b{font-size:30px;letter-spacing:-1.2px}.h2-w.big small{font-size:13px}.h2-w.big em{font-size:12px}.h2-w{display:flex;flex-direction:column;align-items:flex-start;gap:1px;border:0;border-radius:14px;padding:9px 7px 8px;font:inherit;color:#fff;text-align:left;cursor:pointer;min-width:0}" +
    ".h2-w .f{font-size:18px}.h2-w small{font-size:11px;font-weight:700;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.h2-w b{font-size:16.5px;font-weight:900;letter-spacing:-.6px;margin:2px 0}.h2-w em{font-style:normal;font-size:10.5px;opacity:.88;white-space:nowrap}" +
    /* 발견 */
    ".h2-disc{margin:14px 0}.h2-dc{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 2px 6px;scrollbar-width:none}.h2-dc::-webkit-scrollbar{display:none}" +
    ".h2-d{flex:none;width:74%;max-width:300px;min-height:178px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:flex-start;gap:4px;border:0;border-radius:22px;padding:16px 16px 14px;color:#fff;font:inherit;text-align:left;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.18);position:relative;overflow:hidden}" +
    ".h2-d .ic{font-size:30px;line-height:1}.h2-d small{font-size:12.5px;font-weight:700;opacity:.9;margin-top:4px}.h2-d b{font-size:25px;font-weight:900;letter-spacing:-.8px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".h2-d em{font-style:normal;font-size:12.5px;opacity:.88;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.h2-d .go{margin-top:auto;padding-top:8px;font-size:13px;font-weight:800;background:rgba(255,255,255,.18);border-radius:999px;padding:5px 11px}" +
    ".h2-d:after{content:'';position:absolute;right:-30px;top:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)}.h2-d:active{transform:scale(.98)}" +
    /* 지도 */
    ".h2-map{cursor:pointer}.h2-tmw{position:relative;width:100%;aspect-ratio:100/78;border-radius:14px;overflow:hidden}.h2-tm{position:absolute;box-sizing:border-box;border:1.5px solid var(--panel);padding:4px 5px;color:#fff;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}" +
    ".h2-tm span{font-size:12px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;opacity:.95}.h2-tm b{font-size:13.5px;font-weight:900;white-space:nowrap;letter-spacing:-.5px;line-height:1.15;max-width:100%;overflow:hidden}" +
    ".h2-mh{display:block!important}.h2-mh b{display:block;font-size:18px}.h2-mh .mut{display:block;font-size:13px;margin-top:2px}.h2-lg{justify-content:space-between}.h2-lg{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-top:6px}" +
    /* 스토리 */
    "#h2sv{position:fixed;inset:0;z-index:100050;color:#fff;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 10px) 18px calc(env(safe-area-inset-bottom) + 16px);user-select:none;-webkit-user-select:none;animation:svIn .22s ease}@keyframes svIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}" +
    ".sv-bars{display:flex;gap:4px}.sv-bars i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden}.sv-bars i b{display:block;height:100%;width:0;background:#fff}.sv-bars i.done b{width:100%}" +
    ".sv-top{display:flex;align-items:center;gap:10px;margin-top:12px}.sv-top img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.7)}.sv-top div{flex:1}.sv-top b{display:block;font-size:15px}.sv-top small{font-size:12px;opacity:.75}.sv-top button{background:none;border:0;color:#fff;font-size:24px;padding:4px 8px}" +
    ".sv-ic{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:22px}" +
    ".sv-hero{width:118px;height:118px;border-radius:34px;object-fit:cover;box-shadow:0 14px 36px rgba(0,0,0,.35);border:3px solid rgba(255,255,255,.55);margin-bottom:8px;animation:svPop .45s cubic-bezier(.2,1.4,.4,1)}@keyframes svPop{from{transform:scale(.6) rotate(-6deg);opacity:0}to{transform:none;opacity:1}}" +
    ".s2-list b em{font-style:normal;font-size:12px;font-weight:700;opacity:.7;margin-left:4px}" +
    ".sv-body{flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:10px 4px}.sv-body h2{font-size:21px;font-weight:800;letter-spacing:-.5px;margin:0 0 4px;opacity:.95}" +
    ".s2-k{font-size:15px;font-weight:700;opacity:.85}.s2-big{font-size:68px;font-weight:900;letter-spacing:-2.5px;line-height:1}.s2-big small{font-size:16px;font-weight:700;margin-left:6px;letter-spacing:0;opacity:.85}.s2-big2{font-size:34px;font-weight:900;letter-spacing:-1px;line-height:1.2}.s2-big2 small{font-size:15px;opacity:.8}" +
    "#h2sv .up{color:#ffb4ae}#h2sv .dn{color:#a9c8ff}#h2sv .s2-big.up{color:#fff;text-shadow:0 0 30px rgba(255,90,80,.7)}#h2sv .s2-big.dn{color:#fff;text-shadow:0 0 30px rgba(80,140,255,.8)}" +
    ".s2-row{display:flex;gap:16px;flex-wrap:wrap;font-size:15px}.s2-row b{font-weight:800}.s2-gauge{height:10px;border-radius:5px;background:rgba(80,140,255,.55);overflow:hidden}.s2-gauge i{display:block;height:100%;background:#ff6b6b}" +
    ".s2-p{font-size:15px;line-height:1.55;opacity:.92;margin:4px 0 0}.s2-ul{margin:4px 0 0;padding-left:18px;font-size:14px;line-height:1.55;opacity:.92}.s2-chips{display:flex;flex-wrap:wrap;gap:6px}.s2-chips span{background:rgba(255,255,255,.16);border-radius:999px;padding:6px 11px;font-size:14px;font-weight:700}.s2-chips small{opacity:.75}" +
    ".s2-list>div{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.15)}.s2-list .r{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex:none}.s2-list b{flex:1;min-width:0;font-size:17px}.s2-list b small{display:block;font-size:12.5px;font-weight:500;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s2-list>div>span:last-child{font-size:16px;font-weight:800}" +
    ".s2-bars{display:flex;flex-direction:column;gap:9px}.s2-br{display:grid;grid-template-columns:minmax(0,1.1fr) 1fr auto;gap:10px;align-items:center}.s2-br .n{font-size:15px;font-weight:700;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s2-br .t{position:relative;height:14px;background:rgba(255,255,255,.12);border-radius:7px;overflow:hidden}.s2-br .z{position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.5)}.s2-br .b{position:absolute;top:2px;bottom:2px;border-radius:5px}.s2-br .b.u{background:#ff6b6b}.s2-br .b.d{background:#5c9dff}.s2-br>b{font-size:15px;font-weight:800;min-width:56px;text-align:right}" +
    ".sv-foot{display:flex;flex-direction:column;align-items:center;gap:8px}.sv-cta{width:100%;font:inherit;font-size:16px;font-weight:800;padding:15px;border-radius:16px;border:1.5px solid rgba(255,255,255,.45);background:rgba(255,255,255,.12);color:#fff}.sv-cta.hot{background:#fff;color:#1d2433;border-color:#fff}.sv-foot small{font-size:11.5px;opacity:.6}";
  document.head.appendChild(css);
})();
;
/* ======== design.js ======== */
/* 🎨 디자인 한 벌 — 10/22 사용자 「다 진행해(D1~D8 + 다음)」 · 연구 문서: 프로젝트 「🎨 디자인 연구 (오늘 탭 중심) 2026-10-22」
   다른 작업과 안 부딪히게 **이 파일 하나**가 모양만 덮어씀(다른 파일의 내용·숫자·동작은 그대로). 맨 마지막에 읽힘.
   끄기: localStorage ds = "off" (⚙️ 보기 설정과 무관).
   ── 다른 세션에게: 새 카드는 <section class="card"> + <h3> 만 쓰면 여기 모양을 자동으로 받음. 카드에 색띠(ch-strip)·색 번짐(mood)·
      이모지 아이콘 상자(hm-i·pl-ic)를 새로 달지 말 것. 글자 크기는 아래 6단계 변수(--fs-*)를 써 줘요.
   D1 아래 탭 바·머리줄 단추: 이모지 → 같은 굵기 선 아이콘          D2 카드 = 면 한 장(색띠·번짐·테두리 없음 · 밝은 화면 회색 바탕+흰 카드)
   D3 글자 6단계(12·13.5·15·17·22·28) · 숫자 고정폭 · 낱말 안 끊기   D4 오늘 한 줄: 큰 제목이 주인공 · 「오늘 볼 곳」 상자 없는 줄 목록
   D5 내 포트: 숫자 상자 → 칸막이 한 줄 큰 숫자                     D6 맨 위 상태 줄 가볍게            D7 카드 머리 이모지 상자 빼기
   ── 10/27 디자인 점검(Vercel 웹 화면 규칙) 뒤 정한 기준 · 모든 파일 공통 ──
   · 글자: 화면 글자는 최소 12.5px(그림 안 SVG 글자만 예외). 새 글자 크기는 --fs-* 6단계만 쓸 것
   · 색: --text·--sub·--dim 은 이 파일 맨 위 한 곳에서만 정함(흐린 글자도 바탕 대비 4.5:1 이상). 다른 파일에서 다시 정하지 말 것
   · 팝업(#sheet·#peek 등) 스크롤은 뒤 화면으로 안 샘 · 누르는 것엔 포커스 테두리 · ✕ 같은 그림 단추엔 aria-label
   D8 바로가기 같은 폭 3칸                                          + 빼기표 「-1.7%」 → 진짜 마이너스 「−1.7%」(화면 글자만) */
(function(){
  try { if (localStorage.getItem("ds") === "off") return; } catch(x) {}
  document.documentElement.setAttribute("data-ds", "1");
  var R = "html[data-ds]";
  var css =
    /* 색·글자 변수 */
    R + "{--bg:#0d1117;--panel:#161b24;--panel2:#1e2531;--line:#262e3b;--text:#eef1f6;--sub:#a3acbd;--dim:#8a93a5;--fs-cap:12.5px;--fs-s:13.5px;--fs-b:15px;--fs-h:17px;--fs-t:22px;--fs-d:28px}" +
    R + "[data-ui=light]{--bg:#f2f4f6;--panel:#ffffff;--panel2:#f2f4f6;--line:#e8ebef;--text:#191f28;--sub:#4e5968;--dim:#636d7b;--up:#f04452;--down:#3182f6}" +
    ":where(html[data-ds]) :where(small){font-size:max(13.5px,.833em)}" +   // 🎨 11/04: 12.5 → 13.5
    /* 10/27 점검 — 팝업 스크롤이 뒤 화면으로 안 새게 · 누르는 곳 포커스 표시 · 두 번 탭 확대 지연 없애기 */
    ":where(#sheet,#peek,#gdq,#gloss,#gsq,#hmst,#icz,#lpv,#shimg),:where(#sheet,#peek,#gdq,#gloss,#gsq,#hmst,#icz,#lpv,#shimg) *{overscroll-behavior:contain}" +
    ":where(button,a,[role=button],summary,input,select,textarea,[tabindex]):focus-visible{outline:2px solid var(--acc,#3182f6);outline-offset:2px;border-radius:8px}" +
    ":where(button,a,[role=button],summary,label,input,select){touch-action:manipulation}" +
    R + " body{letter-spacing:-.01em;font-feature-settings:'tnum' 1;word-break:keep-all;overflow-wrap:anywhere}" +
    R + " main{padding-top:12px}" +
    /* 머리줄 */
    R + " header{border-bottom:0!important;background:color-mix(in srgb,var(--bg) 86%,transparent)!important;background-image:none!important}" +
    R + " .brand{font-size:19px!important;letter-spacing:-.6px}" +
    R + " #gsbtn," + R + " #wlbtn," + R + " #uibtn{background:transparent!important;border:0!important;box-shadow:none!important;color:var(--text);display:inline-flex;align-items:center;gap:2px}" +
    R + " .ds-ic{width:22px;height:22px;display:block}" +
    R + " #wlbtn .ds-ic{color:#e9b949}" +
    /* D2 카드 = 면 */
    R + " .card{border-color:transparent!important;border-radius:20px!important;background:var(--panel)}" +
    R + "[data-ui=light] .card{box-shadow:0 1px 2px rgba(0,0,0,.04)}" +
    R + " .ch-strip{border-left:0!important;border-left-color:transparent!important}" +
    R + " .mood{background:var(--panel)!important}" +
    R + " .card h3{font-size:var(--fs-h);font-weight:800;color:var(--text);letter-spacing:-.3px}" +
    R + " .card h3 .mut{font-size:var(--fs-cap);font-weight:500}" +
    R + " .sec{font-size:var(--fs-h);font-weight:800;color:var(--text);letter-spacing:-.3px;margin:22px 2px 10px}" +
    R + " .sec small{font-size:var(--fs-cap);font-weight:500;color:var(--sub)}" +
    R + " .note{font-size:var(--fs-cap)}" +
    /* ── 오늘 탭 ── */
    R + " #hmbody .card{padding:20px!important;margin-bottom:12px!important;border-radius:22px!important}" +
    /* D6 상태 줄 */
    R + " #hmbody .hm-day{margin:0 2px 8px!important;font-size:var(--fs-cap)}" +
    R + " #hmbody .hm-mood{background:transparent!important;padding:0!important;font-weight:700}" +
    R + " #hmbody .hm-fresh{background:transparent!important;border:0!important;padding:0!important;font-weight:600}" +
    R + " #hmbody .hm-live{background:transparent!important;border:0!important;box-shadow:none!important;padding:0 2px 12px!important;margin:0!important;font-size:var(--fs-s)}" +
    /* D4 오늘 한 줄 */
    R + " #hmbody .pl-ic{display:none!important}" +
    R + " #hmbody .pl-top{gap:0}" +
    R + " #hmbody .pl-h small{font-size:var(--fs-cap);color:var(--sub);font-weight:600}" +
    R + " #hmbody .pl-head{font-size:var(--fs-t)!important;line-height:1.32!important;letter-spacing:-.6px!important;margin-top:4px;text-wrap:balance}" +
    R + " #hmbody .pl-go{font-size:var(--fs-cap)}" +
    R + " #hmbody .pl-one{margin-top:10px;font-size:var(--fs-b);line-height:1.6;color:var(--sub)}" +
    R + " #hmbody .pl-reg{font-size:var(--fs-cap)!important;font-weight:700;padding:2px 8px;border-radius:6px;background:color-mix(in srgb,var(--acc) 14%,transparent)!important;color:var(--acc)!important;margin-right:6px}" +
    R + " #hmbody .pl-now{background:transparent!important;border:0!important;padding:0!important;margin:16px 0 0!important}" +
    R + " #hmbody .pl-nh b{font-size:var(--fs-h)}" +
    R + " #hmbody .pl-nw{border-top:0!important;padding:10px 0!important;font-size:var(--fs-b)!important;display:grid!important;grid-template-columns:84px minmax(0,1fr);gap:10px;align-items:baseline}" +
    R + " #hmbody .pl-nw+.pl-nw{border-top:1px solid var(--line)!important}" +
    R + " #hmbody .pl-k{width:auto!important;font-weight:700;font-size:var(--fs-s);color:var(--sub)}" +
    R + " #hmbody .pl-nw .pl-sm{font-size:var(--fs-s)!important}" +
    R + " #hmbody .pl-tr{margin:4px 0 6px!important}" +
    R + " #hmbody .pl-act{border-top:1px solid var(--line)!important;padding-top:10px!important;margin-top:4px!important;font-size:var(--fs-s)!important}" +
    R + " #hmbody .pl-foot{margin-top:12px;font-size:12.5px;color:var(--dim)}" +
    /* D7 카드 머리 */
    R + " #hmbody .hm-i{display:none!important}" +
    R + " #hmbody .hm-h{margin-bottom:12px!important}" +
    R + " #hmbody .hm-h b{font-size:var(--fs-h);font-weight:800}" +
    R + " #hmbody .hm-h small{font-size:var(--fs-cap);color:var(--sub)}" +
    R + " #hmbody .hm-go{font-size:var(--fs-cap)}" +
    /* D5 내 포트 */
    R + " #hmbody .hm-big{gap:0!important;margin:0 0 12px!important}" +
    R + " #hmbody .hm-big>div{background:transparent!important;border-radius:0!important;padding:0 10px!important;border-left:1px solid var(--line);min-width:0}" +
    R + " #hmbody .hm-big>div:first-child{border-left:0;padding-left:0!important}" +
    R + " #hmbody .hm-big small{font-size:var(--fs-cap)!important;font-weight:600}" +
    R + " #hmbody .hm-big b{font-size:clamp(22px,6.6vw,28px)!important;letter-spacing:-1px!important;font-weight:800;line-height:1.2;white-space:nowrap}" +
    R + " #hmbody .hm-l{font-size:var(--fs-s)}" +
    /* 바뀐 것 */
    R + " #hmbody .hm-chi{padding:12px 0!important;font-size:var(--fs-b)!important}" +
    R + " #hmbody .hm-chi>span:first-child{width:22px;text-align:center}" +
    /* D8 바로가기 */
    R + " #hmbody .hm-more{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}" +
    R + " #hmbody .hm-more a{display:flex;align-items:center;justify-content:center;padding:12px 6px!important;border-radius:16px!important;background:var(--panel)!important;border:0!important;font-size:12.5px!important;text-align:center;line-height:1.3;color:var(--text)!important;margin:0!important;min-height:56px;white-space:normal}" +
    /* D1 아래 탭 바 */
    R + " #bnav{border-top:1px solid var(--line)!important}" +
    R + " #bnav::after{display:none!important}" +
    R + " #bnav button{font-size:12.5px!important;font-weight:600!important;color:var(--dim)!important}" +
    R + " #bnav button .i{filter:none!important;opacity:1!important;height:24px;display:flex;align-items:center;justify-content:center}" +
    R + " #bnav button .i svg{width:23px;height:23px}" +
    R + " #bnav button.on{color:var(--text)!important}" +
    R + " #bnav button.on:before{display:none!important}" +
    /* 위 작은 탭(시장·포트·신호·상품 묶음): 색 대신 면 */
    R + " .tabs.sub .tab{border-color:transparent!important;background:var(--panel)!important;color:var(--sub)!important;box-shadow:none!important}" +
    R + " .tabs.sub .tab.on{background:var(--text)!important;color:var(--bg)!important}";
  var st = document.createElement("style"); st.id = "ds-css"; st.textContent = css;
  function put(){ document.head.appendChild(st); }   // 늘 맨 끝에(뒤에 붙는 다른 style 보다 뒤로)
  put();

  /* D1 선 아이콘 (직접 그린 단순 선 · 굵기 1.8) */
  var S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  function sv(p){ return '<svg class="ds-ic" viewBox="0 0 24 24" ' + S + ' aria-hidden="true">' + p + '</svg>'; }
  var TAB = {
    "오늘": sv('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>'),
    "시장": sv('<path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>'),
    "포트": sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12l6 6"/>'),
    "신호": sv('<path d="M3 12h4l3-7 4 14 3-7h4"/>'),
    "상품": sv('<rect x="3.5" y="7" width="17" height="13" rx="2.5"/><path d="M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7"/>'),
    "제안서": sv('<path d="M14 3.5H6.5A2.5 2.5 0 0 0 4 6v12a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18V9.5z"/><path d="M14 3.5v6h6"/><path d="m8.5 15.5 2.2-2.2 1.8 1.8 3-3"/>'),   // 10/28 📝 제안서
    "피드": sv('<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    "운세": sv('<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/><path d="M16 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>')
  };
  var HEAD = {
    gsbtn: sv('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    wlbtn: '<svg class="ds-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.2 2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9-4.4-4.1 6-.7z"/></svg>',
    uibtn: sv('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>')
  };
  function icons(){
    var b = document.getElementById("bnav");
    if (b) [].forEach.call(b.querySelectorAll("button"), function(x){ var t = x.children[1] && x.children[1].textContent.trim(), i = x.querySelector(".i");
      if (i && TAB[t] && !i.querySelector("svg")) i.innerHTML = TAB[t]; });
    Object.keys(HEAD).forEach(function(id){ var x = document.getElementById(id); if (!x || x.querySelector(".ds-ic")) return;
      var n = x.firstChild; if (n && n.nodeType === 3){ var sp = document.createElement("span"); sp.innerHTML = HEAD[id]; x.replaceChild(sp.firstChild, n); } });
  }

  /* 빼기표: 화면 글자 「-1.7%」 → 「−1.7%」 (숫자 앞 붙은 - 만 · 날짜 2026-10-22 같은 건 그대로 · 입력칸·코드 안 건드림) */
  var RX = /(^|[\s(\[·:~→>]|^)-(?=\d)/g, SKIP = {SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, CODE: 1, PRE: 1};
  function minus(root){
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: function(n){ var p = n.parentNode; return p && !SKIP[p.nodeName] && n.nodeValue.indexOf("-") >= 0 ? 1 : 3; }}), n, L = [];
    while ((n = w.nextNode())) L.push(n);
    L.forEach(function(t){ var v = t.nodeValue, nv = v.replace(RX, "$1−"); if (nv !== v) t.nodeValue = nv; });
  }
  var q = 0;
  function tick(){ q = 0; icons(); var m = document.getElementById("main") || document.querySelector("main"); minus(m); if (st.nextSibling) put(); }
  function soon(){ if (!q) q = requestAnimationFrame(tick); }
  function start(){
    tick();
    try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true, characterData: true}); } catch(x) { setInterval(tick, 700); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
;
/* ======== wow.js ======== */
/* 🎨 11/04 「우와」 디자인 한 벌 2 — 사용자 「객관적으로 냉정하게 분석해서 가독성 좋게 우와 소리 나오게, 초보자도 쉽게 · 다 진행시켜」
   연구 문서: 프로젝트 「🎨 냉정 디자인 점검·우와 아이디어 31 2026-11-04」. design.js 다음, 늘 맨 마지막 겹.
   다른 파일의 내용·숫자·동작은 그대로 두고, 이 파일 하나가 모양과 「겉 동작」만 덮어씀. 끄기: localStorage wow = "off".
   ── 다른 세션에게: 글자 크기는 --fs-*(design.js) 6단계만 · 카드는 <section class="card"><h3>제목 <span class="mut">시각</span></h3> 틀 · 새 전면 색 바탕 금지(강조색 하나만)
   ① 글자(ux1014c.js 가 규칙을 고쳐 씀 — 바닥 13px·작을수록 더 키움) · 인라인 style 글자도 같이
   ③ 긴 글 3줄 + 더 보기(clamp.js MIN 4)                ⑦ 로딩 뼈대(.loading 회색 반짝 틀)      ⑧ 첫 방문 3장 안내(조이 인사 영상 대신)
   ⑨ 칩 줄 최대 2줄 — 신호 숫자 배지 한 줄 가로 · 「ⓘ 이 화면은?」 칩 빼기(제목·얼굴이 대신) · 장 분위기 칩 한 줄
   ⑩ 날짜 칩 → 「📅 11/4 수 ▾」 단추 하나            ⑪ 첫 화면 뒤로 숨김 · 보내기는 머리줄 아이콘      ⑫ 조이 얼굴은 화면당 1개(카드 안 얼굴은 작은 ⓘ 점)
   ⑬ 색 4개(바탕·카드·강조·오름빨강/내림파랑) — 운세·사주·타로 전면 색 빼기   ⑭ 카드 머리 한 벌   ⑮ 시황 띠 결론 → 근거
   ⑱ 숫자 올라가는 애니메이션   ㉒ 바뀐 탭에 점   ㉔ 빈 화면에 「언제·대신」   ㉖ ELS 표 → 막대 목록   ㉗ 숫자 길게 누르면 뜻   ㉘ 깨진 레이아웃   ㉛ 화면 전환 */
(function(){
  try { if (localStorage.getItem("wow") === "off") return; } catch(x) {}
  var D = document.documentElement; D.setAttribute("data-wow", "1");
  var R = "html[data-wow][data-wow]";   // 속성 두 번 = design.js(html[data-ds]) 보다 우선 — <style> 순서 싸움(떨림의 원인) 대신
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }

  /* ───────────── 모양 ───────────── */
  var css =
    /* ① 글자 6단계 한 단계 위로 · 줄 간격 1.5 · 카드 여백 20 */
    R + "{--fs-cap:14px;--fs-s:15px;--fs-b:16.5px;--fs-h:19px;--fs-t:24px;--fs-d:34px;--r:20px;--acc:#3182f6}" +
    R + "[data-ui=light]{--acc:#2f6fe4}" +
    R + " body{line-height:1.5}" +
    R + " .card{padding:20px!important;border-radius:var(--r)!important;margin-bottom:14px!important}" +
    R + " .card .card{padding:14px!important}" +
    R + " .note{line-height:1.5}" +
    /* ⑭ 카드 머리 한 벌: 왼쪽 제목 · 오른쪽 작은 시각 · 긴 보조글은 아래 줄 */
    R + " .card>h3," + R + " .card h3.tt-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;margin:0 0 10px;line-height:1.3}" +
    R + " .card>h3 .mut," + R + " .card h3.tt-h .mut{margin-left:auto;font-weight:500;color:var(--sub);font-size:var(--fs-cap);white-space:normal;text-align:right}" +
    R + " .card h3 .mut.wow-long{flex:1 1 100%;margin-left:0;text-align:left;line-height:1.45;font-size:var(--fs-cap);color:var(--dim)}" +
    R + " .card h3 .mut.wow-long br{display:none}" +
    /* ⑮ 시황 띠: 결론 먼저(큰 글), 근거(아침판 · 밤사이 뉴스)는 아래 작게 */
    R + " .hero2.mk-strip{display:flex;flex-direction:column;padding:18px!important;border-radius:var(--r)!important}" +
    R + " .mk-strip .hero2-t{order:1;font-size:var(--fs-t)!important;line-height:1.3!important;letter-spacing:-.5px;font-weight:800;text-wrap:balance}" +
    R + " .mk-strip .hero2-k{order:2;margin:10px 0 0!important;font-size:var(--fs-cap)!important;line-height:1.45;color:var(--dim)}" +
    /* ⑦ 로딩 뼈대 */
    "@keyframes wowsk{0%{background-position:100% 0}100%{background-position:-100% 0}}" +
    R + " .loading{min-height:96px;border-radius:16px;color:transparent!important;background:linear-gradient(90deg,var(--panel2) 30%,var(--line) 45%,var(--panel2) 60%)!important;background-size:250% 100%!important;animation:wowsk 1.4s linear infinite;position:relative;overflow:hidden}" +
    R + " .loading::after{content:'';position:absolute;left:18px;right:40%;top:22px;height:14px;border-radius:7px;background:var(--line);opacity:.8}" +
    R + " .loading::before{content:'';position:absolute;left:18px;right:18px;top:48px;height:28px;border-radius:8px;background:var(--line);opacity:.5}" +
    R + " .wow-sk{display:block;height:92px;border-radius:var(--r);margin-bottom:14px;background:linear-gradient(90deg,var(--panel2) 30%,var(--line) 45%,var(--panel2) 60%);background-size:250% 100%;animation:wowsk 1.4s linear infinite}" +
    R + " .wow-sk.tall{height:150px}" +
    /* ⑨ 칩 줄 다이어트 */
    R + " #sgleg{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;padding:0 0 8px;margin:0 0 4px;scrollbar-width:none;-ms-overflow-style:none}" + R + " #sgleg::-webkit-scrollbar{display:none}" +
    R + " #sgleg>small{display:none!important}" + R + " #sgleg>button{flex:none;white-space:nowrap}" +
    R + " details.xp-mini{display:none!important}" +           /* 「ⓘ 이 화면은?」 — 제목(얼굴)을 누르면 같은 설명 */
    R + " .xreg{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;scrollbar-width:none;padding-bottom:4px}" + R + " .xreg::-webkit-scrollbar{display:none}" + R + " .xreg .xrg{flex:none;white-space:nowrap}" +
    R + " .xreg+p.note{display:none!important}" +
    R + " #main>.hero{padding:12px 2px 8px!important}" +
    /* ⑩ 날짜: 단추 하나 + 내려오는 목록 */
    R + " .dates.wow-dd{display:flex;gap:8px;margin:0 0 12px;padding:0;overflow:visible;position:relative;flex-wrap:nowrap}" +
    R + " .dates.wow-dd>.date{display:none}" +
    R + " .wow-dbtn{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:var(--fs-s);font-weight:800;padding:9px 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text);letter-spacing:-.3px}" +
    R + " .wow-dbtn i{font-style:normal;color:var(--sub);font-weight:600}" +
    R + " .wow-dnav{display:inline-flex;gap:4px}" + R + " .wow-dnav button{font:inherit;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--text);font-weight:800}" +
    R + " .wow-dnav button:disabled{opacity:.35}" +
    R + " .wow-dl{position:absolute;left:0;top:44px;z-index:40;max-height:300px;overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:16px;box-shadow:0 18px 40px -12px rgba(0,0,0,.35);padding:6px;min-width:200px;display:none}" +
    R + " .wow-dl.on{display:block}" + R + " .wow-dl button{display:block;width:100%;text-align:left;font:inherit;font-size:var(--fs-s);padding:10px 12px;border:0;border-radius:10px;background:transparent;color:var(--text)}" +
    R + " .wow-dl button.on{background:var(--panel2);font-weight:800}" +
    /* ⑪ 첫 화면 뒤로 숨김 · 보내기 → 머리줄 아이콘 */
    R + " #backbtn.root{display:none!important}" +
    R + " #opbtn{position:static!important;width:38px;height:38px;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;display:inline-flex!important;align-items:center;justify-content:center;font-size:20px!important;margin:0 0 0 2px;order:5}" +
    R + " #opbtn span{display:none!important}" +
    R + " header .top{display:flex;align-items:center;flex-wrap:nowrap;min-width:0;overflow:hidden;gap:2px}" +
    R + " header .brand{white-space:nowrap;flex:none}" + R + " #stamp{white-space:nowrap}" +
    "@media (max-width:430px){" + R + " #stamp{display:none!important}}" +
    R + " html,body{overflow-x:hidden!important;max-width:100vw}" + R + " #main{overflow-x:clip}" +
    R + " #opbtn{width:34px;height:34px;flex:none;font-size:19px!important}" +
    R + " #main{padding-bottom:96px!important}" +
    /* ⑫ 조이 얼굴은 화면당 1개 — 카드 안·칩 안의 얼굴은 작은 ⓘ 점으로 (누르면 똑같이 조이 설명) */
    R + " h3.tt-h>.gd-b," + R + " .mk-lab.tt-h>.gd-b{width:20px!important;height:20px!important;background:var(--panel2)!important;box-shadow:inset 0 0 0 1.5px var(--line)!important;vertical-align:-3px!important;margin-left:6px!important;text-align:center;line-height:20px;color:var(--sub);font:italic 700 12px/20px Georgia,serif}" +
    R + " h3.tt-h>.gd-b::after," + R + " .mk-lab.tt-h>.gd-b::after{content:'i'}" +
    R + " .gd-i{width:16px!important;height:16px!important;background:var(--panel2)!important;box-shadow:inset 0 0 0 1.5px var(--line)!important;vertical-align:-3px!important;text-align:center;color:var(--sub);font:italic 700 11px/16px Georgia,serif}" +
    R + " .gd-i::after{content:'i'}" +
    R + " .gd-b.new::before{display:none!important}" +
    /* ⑬ 색 4개 — 운세·사주·타로 전면 색 바탕 → 카드 한 벌 안에서 강조색만 */
    R + " .tr-hero{background:var(--panel)!important;color:var(--text)!important;border:1px solid var(--line)!important;box-shadow:none!important}" +
    R + " .tr-hero h2," + R + " .tr-hero p{color:var(--text)!important}" + R + " .tr-hero textarea," + R + " .tr-hero input{background:var(--panel2)!important;color:var(--text)!important;border-color:var(--line)!important}" +
    R + " .tr-hero .tw{opacity:.25}" +
    R + " .tr-hero .tr-q{background:var(--panel2)!important;color:var(--text)!important;border-color:var(--line)!important;caret-color:var(--acc)!important}" +
    R + " .tr-read span{background:var(--panel2)!important;border-color:var(--line)!important;color:var(--text)!important;line-height:1.4;white-space:normal}" +
    R + " .tr-hero .tr-ex button," + R + " .tr-hero button.tr-x{background:var(--panel2)!important;color:var(--text)!important;border-color:var(--line)!important}" +
    R + " .sj-btn," + R + " .lk-add," + R + " button.btn.lk-go{background:var(--acc)!important;color:#fff!important}" +
    R + " .qcover{background:var(--panel)!important;color:var(--text)!important;border:1px solid var(--line)}" +
    R + " .lk-hero," + R + " .sj-hero{background:var(--panel)!important;color:var(--text)!important}" +
    R + " button.btn.lk-go," + R + " .lk-add,.sj-add{background:var(--acc)!important;color:#fff!important}" +
    /* ③ 긴 글 접기 — clamp.js 가 그리는 희미해짐 · 더 보기 단추 글자 */
    R + " .clp-more{font-size:var(--fs-s)!important;font-weight:700}" +
    /* ⑱ 숫자 반짝 */
    "@keyframes wowpop{0%{transform:scale(.92);opacity:.4}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}" +
    R + " .wow-pop{animation:wowpop .5s cubic-bezier(.2,1.2,.4,1) both;display:inline-block}" +
    /* ㉒ 바뀐 탭 점 */
    R + " #bnav button{position:relative}" + R + " #bnav button.wow-dot::after{content:'';position:absolute;top:6px;right:calc(50% - 16px);width:7px;height:7px;border-radius:50%;background:#f04452;box-shadow:0 0 0 2px var(--panel)}" +
    /* ㉔ 빈 화면 */
    R + " .empty{padding:36px 18px!important;font-size:var(--fs-b)}" + R + " .empty .big{font-size:44px}" +
    R + " .wow-when{display:block;margin-top:8px;font-size:var(--fs-s);color:var(--sub);font-weight:600}" +
    R + " .wow-alt{display:inline-flex;margin-top:14px;padding:11px 16px;border-radius:999px;background:var(--acc);color:#fff;font:inherit;font-size:var(--fs-s);font-weight:800;border:0}" +
    /* ㉖ ELS 표 → 줄 목록 + 막대 */
    R + " table.pd-ec.wow-h{display:none!important}" +
    R + " .wow-el{display:flex;flex-direction:column;gap:10px;margin:4px 0 8px}" + R + " .wow-el>div{padding:12px 14px;border-radius:14px;background:var(--panel2)}" +
    R + " .wow-el .r1{display:flex;justify-content:space-between;align-items:baseline;gap:8px}" + R + " .wow-el .r1 b{font-size:var(--fs-b);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    R + " .wow-el .r1 .y{font-size:var(--fs-h);font-weight:900;color:var(--up,#f04452);white-space:nowrap}" +
    R + " .wow-el .bar{height:8px;border-radius:4px;background:var(--line);margin:8px 0 6px;overflow:hidden}" + R + " .wow-el .bar i{display:block;height:100%;border-radius:4px;background:var(--up,#f04452)}" +
    R + " .wow-el .r2{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:var(--fs-cap);color:var(--sub)}" +
    R + " .md table," + R + " table.pd-tb," + R + " table.cmpt{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}" +
    /* ㉗ 길게 누르기 안내 */
    R + " .wow-lp{outline:2px solid var(--acc);outline-offset:3px;border-radius:6px}" +
    /* ㉘ 깨진 곳 — 제목 긴 보조글 · 제안서 카드 글 잘림 · 발견 카드 */
    R + " .pp-c small," + R + " .pp-card small," + R + " .h2-d em{display:-webkit-box;-webkit-line-clamp:3!important;-webkit-box-orient:vertical;overflow:hidden;white-space:normal!important}" +
    R + " h3,h2{word-break:keep-all;overflow-wrap:anywhere}" +
    R + " .gchips{grid-template-columns:repeat(auto-fit,minmax(78px,1fr))!important}" + R + " .gc{min-width:0;overflow:hidden}" +   /* 375px 에서 간밤 글로벌 칩이 7px 삐져나가던 것 */
    R + " .mknow-h{flex-wrap:wrap;row-gap:4px;font-size:var(--fs-cap)}" + R + " .mknow-h b{flex:1 1 auto;min-width:0}" + R + " .mknow-h button{flex:none;white-space:nowrap;margin-left:auto}" +
    R + " .pp-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}" + R + " .pp-f{padding:12px 12px 11px!important}" + R + " .pp-f small{-webkit-line-clamp:4!important}" +
    /* ㉛ 화면 전환 */
    "@keyframes wowin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    R + " #main.wow-in>*{animation:wowin .22s ease both}" +
    "@media (prefers-reduced-motion:reduce){" + R + " #main.wow-in>*," + R + " .wow-pop{animation:none!important}}" +
    /* ⑧ 첫 방문 3장 */
    "#wowob{position:fixed;inset:0;z-index:100100;background:rgba(10,14,22,.55);display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}" +
    "#wowob .ob{width:100%;max-width:520px;background:var(--panel);color:var(--text);border-radius:26px 26px 0 0;padding:22px 22px calc(env(safe-area-inset-bottom) + 22px);box-sizing:border-box;animation:wowin .25s ease}" +
    "#wowob .ob-dots{display:flex;gap:6px;justify-content:center;margin-bottom:14px}#wowob .ob-dots i{width:8px;height:8px;border-radius:50%;background:var(--line)}#wowob .ob-dots i.on{background:var(--acc);width:22px;border-radius:4px}" +
    "#wowob .ob-pic{width:96px;height:96px;border-radius:30px;object-fit:cover;display:block;margin:0 auto 14px;box-shadow:0 10px 26px rgba(0,0,0,.18)}" +
    "#wowob h2{margin:0 0 8px;font-size:24px;letter-spacing:-.6px;text-align:center;line-height:1.3}#wowob p{margin:0;text-align:center;font-size:16.5px;line-height:1.6;color:var(--sub)}" +
    "#wowob .ob-row{display:flex;gap:8px;margin-top:18px}#wowob .ob-row button{flex:1;font:inherit;font-size:16px;font-weight:800;padding:14px;border-radius:14px;border:0;background:var(--panel2);color:var(--text)}#wowob .ob-row button.go{background:var(--acc);color:#fff;flex:2}";
  var st = document.createElement("style"); st.id = "wow-css"; st.textContent = css;
  document.head.appendChild(st);   // 한 번만 (매번 맨 뒤로 옮기면 design.js 와 번갈아 옮기며 화면이 떨림)

  /* ───────────── ① 인라인 style 글자도 한 단계 (ux1014c 는 <style> 규칙만 고침) ───────────── */
  var BUMP = function(px){ return px <= 12.5 ? px + 1.5 : px <= 16 ? px + 1.5 : px <= 20 ? px + 2 : px <= 30 ? px + 3 : px; };
  function inlineFs(root){
    var L = (root || document).querySelectorAll('[style*="font-size"]');
    for (var i = 0; i < L.length; i++){ var el = L[i]; if (el.dataset.wfs || el.closest("svg,header,#bnav,#opbtn,canvas")) continue;
      var m = /font-size:\s*(\d+(?:\.\d+)?)px/.exec(el.getAttribute("style") || ""); if (!m) continue;
      var v = parseFloat(m[1]); if (v < 10) continue;
      el.dataset.wfs = "1"; el.style.fontSize = (Math.round(BUMP(Math.max(v, 13)) * 10) / 10) + "px"; }
  }

  /* ───────────── ⑭ 긴 보조글은 제목 아래 줄로 (오늘 확률 제목 네 줄 꺾임 등) ───────────── */
  function heads(root){
    var L = (root || document).querySelectorAll(".card>h3 .mut, .card h3.tt-h .mut");
    for (var i = 0; i < L.length; i++){ var m = L[i]; if (m.classList.contains("wow-long")) continue;
      var t = (m.textContent || "").trim(); if (t.length > 18) m.classList.add("wow-long"); }
  }

  /* ───────────── ⑩ 날짜 칩 → 단추 하나 ───────────── */
  function dates(){
    var d = document.getElementById("dates"); if (!d || d.classList.contains("wow-dd")) return;
    var bs = [].slice.call(d.querySelectorAll("button.date")); if (bs.length < 2) return;
    d.classList.add("wow-dd");
    var on = d.querySelector(".date.on") || bs[0], k = bs.indexOf(on);
    var lab = (on.textContent || "").trim().replace(/\s+/g, " ");
    var wrap = document.createElement("div"); wrap.className = "wow-dnav";
    var prev = document.createElement("button"); prev.type = "button"; prev.textContent = "‹"; prev.setAttribute("aria-label", "이전 날짜"); prev.disabled = k >= bs.length - 1;
    var next = document.createElement("button"); next.type = "button"; next.textContent = "›"; next.setAttribute("aria-label", "다음 날짜"); next.disabled = k <= 0;
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "wow-dbtn"; btn.innerHTML = "📅 " + e(lab) + " <i>▾</i>";
    var list = document.createElement("div"); list.className = "wow-dl";
    list.innerHTML = bs.map(function(b, i){ return '<button type="button" data-i="' + i + '" class="' + (b === on ? "on" : "") + '">' + e((b.textContent || "").trim().replace(/\s+/g, " ")) + '</button>'; }).join("");
    btn.onclick = function(ev){ ev.stopPropagation(); list.classList.toggle("on"); };
    list.onclick = function(ev){ var b = ev.target.closest("[data-i]"); if (!b) return; list.classList.remove("on"); bs[+b.dataset.i].click(); };
    prev.onclick = function(){ if (bs[k + 1]) bs[k + 1].click(); };
    next.onclick = function(){ if (bs[k - 1]) bs[k - 1].click(); };
    document.addEventListener("click", function(ev){ if (!ev.target.closest(".wow-dl,.wow-dbtn")) list.classList.remove("on"); });
    wrap.appendChild(prev); wrap.appendChild(next);
    d.insertBefore(list, d.firstChild); d.insertBefore(wrap, d.firstChild); d.insertBefore(btn, d.firstChild);
  }

  /* ───────────── ⑪ 보내기 단추 → 머리줄 ───────────── */
  function opToHead(){
    var b = document.getElementById("opbtn"), top = document.querySelector("header .top"); if (!b || !top || b.parentNode === top) return;
    var ui = document.getElementById("uibtn");
    if (ui && ui.parentNode === top) top.insertBefore(b, ui); else top.appendChild(b);
    b.title = "보내기 — 고객에게 한 장";
  }

  /* ───────────── ⑱ 숫자 올라오기 (큰 숫자 처음 그려질 때 한 번) ───────────── */
  var SEEN_NUM = new WeakSet();
  function pop(root){
    var L = (root || document).querySelectorAll(".h2-w b, .s2-big, .hm-big b, .kp b, .wow-big b, .pl-nh b, .sum b, .sum3 b");
    for (var i = 0; i < L.length; i++){ if (SEEN_NUM.has(L[i])) continue; SEEN_NUM.add(L[i]); pop1(L[i]); }
  }
  function pop1(el){   // 요소마다 따로(클로저가 섞이지 않게)
    var m = /^([+\-−]?)(\d[\d,]*)(\.\d+)?(.*)$/.exec((el.textContent || "").trim());
    if (!m) { el.classList.add("wow-pop"); return; }
    var sign = m[1], intp = m[2].replace(/,/g, ""), dec = m[3] || "", rest = m[4] || "", tgt = parseFloat(intp + dec);
    if (isNaN(tgt) || tgt > 9999999 || rest.length > 12) { el.classList.add("wow-pop"); return; }
    var hasComma = m[2].indexOf(",") >= 0, dp = dec ? dec.length - 1 : 0, t0 = Date.now(), dur = 520, fin = sign + m[2] + dec + rest;
    el.classList.add("wow-pop");
    if (!(el.childNodes.length === 1 && el.firstChild.nodeType === 3)) return;   // 글자 하나짜리만
    var tn = el.firstChild;
    (function tick(){ var p = Math.min(1, (Date.now() - t0) / dur), q = 1 - Math.pow(1 - p, 3), v = tgt * q;
      var s = v.toFixed(dp); if (hasComma) s = (+s).toLocaleString("en-US", {minimumFractionDigits: dp, maximumFractionDigits: dp});
      if (tn.parentNode !== el) return; tn.nodeValue = p < 1 ? sign + s + rest : fin; if (p < 1) setTimeout(tick, 40); })();
    setTimeout(function(){ if (tn.parentNode === el) tn.nodeValue = fin; }, dur + 80);
  }

  /* ───────────── ㉒ 바뀐 탭 점 — 마지막으로 그 묶음을 본 뒤 새 자료가 올라왔으면 ───────────── */
  var GT = {mkt: ["market", "sector", "prob"], inv: ["port", "score"], sig: ["whale", "cup", "gap", "screen", "sigmore"], prod: ["bond", "fund", "els"], prop: ["prop"], feed: ["feed"], luck: ["luck", "saju", "tarot", "lotto"], home: ["home"]};
  var GN = {mkt: "시장", inv: "포트", sig: "신호", prod: "상품", prop: "제안서", feed: "피드", luck: "운세", home: "오늘"};
  function grpOf(k){ for (var g in GT) if (GT[g].indexOf(k) >= 0) return g; return null; }
  function newest(g){
    var C = (window.M && window.M.cats) || {}, mx = "";   // 🔧 11/04: 지역 var M 이 전역 M 을 가려 'cats' 오류 나던 것
    GT[g].forEach(function(k){ var it = (C[k] || [])[0]; if (it && it.id && it.id > mx) mx = String(it.id); });
    if (g === "prod" && window.__pdAt) mx = String(window.__pdAt);
    return mx;
  }
  function dots(){
    var b = document.getElementById("bnav"); if (!b) return;
    var seen = ls("wow_seen") || {}, c = grpOf(cur());
    if (c){ var nz = newest(c); if (nz) { seen[c] = nz; ls("wow_seen", seen); } }
    [].forEach.call(b.querySelectorAll("button"), function(x){ var t = x.children[1] && x.children[1].textContent.trim(), g = null;
      for (var k in GN) if (GN[k] === t) g = k;
      if (!g || g === "home" || g === "luck" || g === "prop") { x.classList.remove("wow-dot"); return; }
      var nz = newest(g); x.classList.toggle("wow-dot", !!(nz && seen[g] && nz > seen[g]));
      if (x.classList.contains("wow-dot")) x.title = "마지막으로 본 뒤 새 자료가 올라왔어요"; });
  }

  /* ───────────── ㉔ 빈 화면에 「언제 · 대신 뭘 볼지」 ───────────── */
  var WHEN = {port: ["매시간 정각쯤 새로 올라와요", "score", "📊 그동안 성적표 보기"], score: ["매시간 자동으로 채점해요", "port", "💼 그동안 포트 보기"], feed: ["15분마다 새 글을 가져와요", "market", "🌐 그동안 시황 보기"],
              market: ["매일 아침 7시 20분쯤 올라와요", "home", "🏠 오늘 화면 보기"], whale: ["매일 아침 올라와요", "home", "🏠 오늘 화면 보기"], cup: ["매일 아침 올라와요", "home", "🏠 오늘 화면 보기"], gap: ["매일 아침 올라와요", "home", "🏠 오늘 화면 보기"]};
  function empties(root){
    var L = (root || document).querySelectorAll("#main .empty"); if (!L.length) return;
    var w = WHEN[cur()] || ["잠시 뒤 다시 열어 주세요", "home", "🏠 오늘 화면 보기"];
    for (var i = 0; i < L.length; i++){ var el = L[i]; if (el.querySelector(".wow-when") || el.closest("#hmbody")) continue;
      if (!/아직|못 가져|없어요/.test(el.textContent || "")) continue;
      var s = document.createElement("span"); s.className = "wow-when"; s.textContent = "⏰ " + w[0];
      var b = document.createElement("button"); b.type = "button"; b.className = "wow-alt"; b.textContent = w[1] === cur() ? "🏠 오늘 화면 보기" : w[2]; b.setAttribute("data-goto", w[1] === cur() ? "home" : w[1]);
      b.onclick = function(ev){ ev.stopPropagation(); var t = this.getAttribute("data-goto"); if (window.go) go(t); };
      el.appendChild(s); el.appendChild(b); }
  }

  /* ───────────── ㉖ ELS 표 → 줄 목록 + 막대 ───────────── */
  function elsTables(root){
    var T = (root || document).querySelectorAll("table.pd-ec:not(.wow-h)");
    for (var i = 0; i < T.length; i++){ var t = T[i], rows = [].slice.call(t.querySelectorAll("tr")).filter(function(r){ return r.querySelector("td"); }); if (rows.length < 2) continue;
      var items = rows.map(function(r){ var c = [].map.call(r.querySelectorAll("td"), function(x){ return x.innerHTML; }), y = parseFloat(String(c[1] || "").replace(/[^\d.]/g, "")); return {c: c, y: isNaN(y) ? 0 : y, r: r}; });
      var mx = Math.max.apply(null, items.map(function(x){ return x.y; }).concat([0.1]));
      var box = document.createElement("div"); box.className = "wow-el";
      box.innerHTML = items.map(function(x){ return '<div><div class="r1"><b>' + x.c[0] + '</b><span class="y">' + x.c[1] + '</span></div><div class="bar"><i style="width:' + (x.y / mx * 100).toFixed(0) + '%"></i></div><div class="r2"><span>' + (x.c[2] || "") + '</span><span>' + (x.c[3] || "") + '</span></div></div>'; }).join("");
      [].forEach.call(box.children, function(d, k){ var r = items[k].r; d.onclick = function(){ r.click(); }; });
      t.classList.add("wow-h"); t.insertAdjacentElement("afterend", box); }
  }

  /* ───────────── ㉗ 숫자 길게 누르면 뜻 — 조이가 한 줄로 ───────────── */
  var GL = [
    [/세후/, "세후 수익률", "이자 세금(15.4%)을 뗀 뒤 1년에 실제로 손에 쥐는 비율이에요."], [/매수금리|매수수익률/, "매수금리", "지금 이 값에 사면 만기까지 받는 1년 수익률(세금 전)이에요."],
    [/은행 예금/, "은행 예금으로 치면", "같은 돈을 은행 예금에 넣었을 때 몇 %여야 이 상품과 같아지는지예요."], [/오를 확률|확률/, "오를 확률", "2000년 이후 비슷한 상황에서 다음 날 오른 비율에 지금 추세·심리·수급을 더해 계산해요. 50%면 반반이에요."],
    [/200일/, "200일선", "최근 200일 평균 가격이에요. 지수가 그 위면 긴 오름세, 아래면 긴 내림세로 봐요."], [/공포|탐욕/, "공포·탐욕", "시장 사람들이 지금 얼마나 겁먹었는지(0)·들떴는지(100)를 숫자로 만든 거예요."],
    [/5일/, "5일", "최근 5거래일(한 주) 동안 얼마나 움직였는지예요."], [/20일/, "20일", "최근 20거래일(한 달) 동안 얼마나 움직였는지예요."], [/연 ?수익률|연 /, "연 수익률", "1년 동안 가지고 있으면 받는 비율이에요. 세금 전 숫자예요."],
    [/배리어|베리어|기준선/, "기준선(배리어)", "기초자산이 이 선 아래로 내려가면 조기 상환이 안 되는 기준이에요."], [/KI|손실 시작선/, "손실 시작선(KI)", "기초자산이 한 번이라도 이 선 아래로 가면 만기 때 손실이 날 수 있는 선이에요."],
    [/오른 종목/, "오른 종목", "오늘 오른 종목이 전체의 몇 %인지예요. 60% 넘으면 넓게 오르는 장이에요."], [/점수|점$/, "점수", "앱이 여러 신호를 더해 0~100으로 만든 숫자예요. 높을수록 좋은 쪽이에요."],
    [/거래대금|거래/, "거래대금", "오늘 그 종목이 사고팔린 돈의 크기예요. 돈이 몰리는 곳을 보여 줘요."], [/환율|원\/달러/, "원/달러 환율", "1달러를 사는 데 드는 원화예요. 오르면 달러 자산의 원화 값이 늘어요."],
    [/맞힌 비율|적중/, "맞힌 비율", "앱이 미리 말한 것 중 실제로 맞은 비율이에요."], [/S&P/, "S&P500", "미국 큰 회사 500개를 묶은 대표 지수예요. 포트 성적은 이걸 이기는 게 목표예요."],
    [/코스피/, "코스피", "한국 대표 지수예요. 한국 주식 전체가 오늘 어떤지를 한 숫자로 보여 줘요."], [/나스닥/, "나스닥", "미국 기술주가 많이 든 지수예요."],
    [/만기|잔존/, "만기", "원금을 돌려받는 날이에요. 「잔존」은 그날까지 남은 기간이에요."], [/단가/, "단가", "채권 1만 원짜리를 지금 얼마에 사는지예요. 1만 원보다 싸면 할인된 거예요."]
  ];
  function lpTitle(el){
    var c = el.closest("[data-tip],.pd-row>span,.pd-v,.kp,.h2-w,.pl-nw,.sum>div,.sum3>div,.hm-big>div,.wow-el>div,.pd-it,tr,li,p,div");
    var lab = "";
    if (c){ var sm = c.querySelector("small,.pl-k,span:first-child,th"); lab = sm ? (sm.textContent || "") : (c.getAttribute("data-tip") || ""); }
    if (!lab || lab.length > 30){ var h = el.closest(".card,.fold,.hero2"), hh = h && h.querySelector("h3,.fold-h,.hero2-k"); lab = hh ? hh.textContent : lab; }
    return (lab || "").replace(/ⓘ|▾|▴/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  }
  var LP = {t: 0, el: null, x: 0, y: 0};
  function lpStart(ev){
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    var t = ev.target; if (!t.closest || t.closest("#hmbody,#gdq,#sheet input,textarea,input,select,a,button,svg,canvas,header,#bnav,#wowob")) return;
    var tx = (t.textContent || "").trim(); if (!/\d/.test(tx) || tx.length > 40) return;
    var card = t.closest("#main .card, #main .hero2, #sheet"); if (!card) return;
    LP.el = t; LP.x = ev.clientX; LP.y = ev.clientY; clearTimeout(LP.t);
    LP.t = setTimeout(function(){ var el = LP.el; LP.el = null; if (!el) return;
      var lab = lpTitle(el), num = (el.textContent || "").trim(), hit = null;
      for (var i = 0; i < GL.length; i++) if (GL[i][0].test(lab) || GL[i][0].test(num)){ hit = GL[i]; break; }
      var L = hit ? ["「" + num + "」 — " + hit[1] + "이에요.", hit[2]] : ["「" + num + "」은(는) " + (lab ? "「" + lab + "」" : "이 카드") + "의 값이에요.", "카드 제목이나 작은 ⓘ를 누르면 제가 자세히 설명해 드려요."];
      el.classList.add("wow-lp"); setTimeout(function(){ el.classList.remove("wow-lp"); }, 900);
      try { if (navigator.vibrate) navigator.vibrate(12); } catch(x) {}
      LP.fired = Date.now(); if (window.gdSay) gdSay("🔎 " + (hit ? hit[1] : lab || "이 숫자"), L, "", "img/kid_think.jpg?v=1"); }, 560);
  }
  function lpEnd(ev){ if (!LP.el) return; if (ev.type === "pointermove" && Math.abs(ev.clientX - LP.x) < 8 && Math.abs(ev.clientY - LP.y) < 8) return; clearTimeout(LP.t); LP.el = null; }
  document.addEventListener("pointerdown", lpStart, true);
  ["pointermove", "pointerup", "pointercancel", "scroll"].forEach(function(t){ document.addEventListener(t, lpEnd, true); });
  document.addEventListener("click", function(ev){ if (LP.fired && Date.now() - LP.fired < 700){ ev.stopImmediatePropagation(); ev.preventDefault(); LP.fired = 0; } }, true);
  document.addEventListener("contextmenu", function(ev){ if (LP.fired && Date.now() - LP.fired < 1200) ev.preventDefault(); }, true);

  /* ───────────── ⑧ 첫 방문 3장 안내 (조이 인사 영상 대신 · 한 번만) ───────────── */
  var OB = [
    ["img/kid_wave.jpg?v=1", "안녕하세요, 조이예요 👋", "오늘 시장이 어떤지, 뭘 얼마나 사면 되는지<br>어려운 말 없이 알려 드려요."],
    ["img/kid_globe.jpg?v=1", "아래 탭 세 개만 알면 돼요", "🏠 <b>오늘</b> = 시장 한눈에<br>💼 <b>포트</b> = 뭘 얼마나<br>📝 <b>제안서</b> = 고객에게 줄 한 장"],
    ["img/kid_think.jpg?v=1", "궁금하면 제 얼굴을 누르세요", "맨 위 제 얼굴이나 작은 ⓘ를 누르면 그 화면을 설명해요.<br>숫자를 <b>꾹 누르면</b> 뜻도 알려 드려요."]
  ];
  function onboard(){
    if (navigator.webdriver){ ls("gd_intro", 1); return; }   // 🔧 11/04: 자동 검진(로봇 브라우저)엔 첫 안내·조이 인사가 화면을 덮어 탭 클릭이 막힘(#market→섹터 30초 멈춤) → 사람에게만
    if (ls("wow_ob") || /[?&]embed=1/.test(location.search)) return;   // 🔧 11/04: 자동 검진(로봇 브라우저)엔 첫 방문 안내가 화면을 덮어 탭 클릭이 막힘 → 사람에게만
    ls("gd_intro", 1);   // guide.js 의 옛 인사 카드(영상 자동 재생)는 안 띄움
    var k = 0, box = document.createElement("div"); box.id = "wowob"; document.body.appendChild(box);
    function draw(){ var o = OB[k];
      box.innerHTML = '<div class="ob"><div class="ob-dots">' + OB.map(function(_, i){ return '<i class="' + (i === k ? "on" : "") + '"></i>'; }).join("") + '</div><img class="ob-pic" src="' + o[0] + '" alt=""><h2>' + o[1] + '</h2><p>' + o[2] + '</p>' +
        '<div class="ob-row">' + (k < OB.length - 1 ? '<button type="button" data-skip="1">건너뛰기</button><button type="button" class="go" data-next="1">다음</button>' : '<button type="button" class="go" data-skip="1">시작하기 🚀</button>') + '</div></div>'; }
    box.addEventListener("click", function(ev){ var t = ev.target; if (t.closest("[data-next]")){ k++; draw(); } else if (t.closest("[data-skip]") || t === box){ ls("wow_ob", 1); ls("gd_intro", 1); box.remove(); } });
    draw();
  }
  window.wowOnboard = onboard;

  /* ───────────── ㉛ 화면 전환 ───────────── */
  function hookGo(){
    if (typeof window.go !== "function" || window.go.__wow) return;
    var g0 = window.go;
    window.go = function(){ var r = g0.apply(this, arguments); try { var m = document.getElementById("main"); if (m){ m.classList.remove("wow-in"); void m.offsetWidth; m.classList.add("wow-in"); setTimeout(function(){ m.classList.remove("wow-in"); }, 400); } dots(); } catch(x) {} return r; };
    window.go.__wow = 1;
  }

  /* ───────────── 돌리기 ───────────── */
  var q = 0;
  function tick(){ q = 0; var m = document.getElementById("main");
    try { inlineFs(m); heads(m); dates(); opToHead(); pop(m); empties(m); elsTables(m); hookGo(); } catch(x) { try { console.warn("wow", x); } catch(y) {} } }
  function soon(){ if (!q) q = setTimeout(tick, 80); }
  function start(){
    tick(); dots();
    try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 800); }
    setInterval(dots, 60000);
    setTimeout(function(){ if (!document.getElementById("gdq")) onboard(); }, 1600);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
;
/* ======== ux1105.js ======== */
/* CH Investing — 🔍 11/05 냉정 분석 「다 진행해」 (분석 문서: 🔍 냉정 분석 — 효용·가독성·활용도 + 아이디어 2026-11-05)
   A4 홈 맨 아래 「🔮 운세 · 사주 · 타로 · 로또」 한 줄 (아래 탭에서 운세 칸을 뺐으니 여기로)
   C9 본문 글자 최소 13px — 설명·날짜에 많던 10.5~12px 글자를 13px 로 (그림·차트·표 칸·제안서 미리보기는 그대로)
   C10 홈 카드는 한 화면(520px)을 넘지 않게 — 넘치면 「전체 보기」 (simple.js clampLong 이 홈에선 520px 기준)
   C11 빈 카드는 얇은 띠 한 줄로 — 「아직 안 올라왔어요」 큰 빈 상자 대신
   C13 어두운 화면 대비 — 흐린 글자(--dim)·잠긴 칸 투명도 올림
   D17 첫 실행 30초 안내 — 조이 인사 뒤 「📝 제안서 → 📨 오늘의 한 장 → 🎯 1탭 예측」 3곳만 짚어 줌(한 번만) */
(function(){
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function onHome(){ return typeof window.cur !== "undefined" && window.cur === "home"; }

  /* ── A4 운세 줄 ── */
  function luckRow(){
    if (!onHome()) return;
    var b = document.getElementById("hmbody"); if (!b || document.getElementById("uxluck")) return;
    var d = document.createElement("div"); d.id = "uxluck"; d.className = "ux-luck";
    d.innerHTML = [["luck", "🔮", "오늘의 운세"], ["saju", "📜", "사주"], ["tarot", "🃏", "타로"], ["lotto", "🎱", "로또"]].map(function(x){ return '<button type="button" data-go="' + x[0] + '"><span>' + x[1] + '</span>' + x[2] + '</button>'; }).join("");
    d.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-go]"); if (!t) return; ev.stopPropagation(); if (window.go) go(t.dataset.go); });
    b.appendChild(d);
  }

  /* ── C9 13px ── */
  var SKIP = "svg,canvas,header,#bnav,.ppx,.pp-pv,#ppx .px-ft,.h2-tm,.h2-tmw,.ixc,.ixc-card,.sv-bars,.chip-x,sup,sub,.pp-gb,.tz-race,.ds-ic,.kpis,.h2-wg,[data-nofs]";
  function fs13(root){
    if (!root) return;
    var L = root.querySelectorAll("small,span,em,i,b,p,div,li,td,th,a,label,button");
    for (var i = 0; i < L.length; i++){
      var el = L[i]; if (el.dataset.f13) continue; el.dataset.f13 = "1";
      if (el.closest(SKIP)) continue;
      var has = false; for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim().length > 1){ has = true; break; }
      if (!has) continue;
      var v = parseFloat(getComputedStyle(el).fontSize);
      if (v >= 10 && v < 12.9) el.style.fontSize = "13px";
    }
  }

  /* ── C11 빈 카드 → 띠 ── */
  function thin(root){
    if (!root) return;
    [].forEach.call(root.querySelectorAll(".empty"), function(x){
      if (x.dataset.thin || x.closest(".ppx,#sheet")) return;
      var others = root.querySelectorAll("section.card").length;
      if (others < 2) return;   // 화면에 이것뿐이면 그대로(무엇이 비었는지 크게 알려야 함)
      x.dataset.thin = "1"; x.classList.add("ux-thin");
    });
  }

  /* ── D17 첫 실행 안내 ── */
  var OB = [
    {sel: '#bnav [data-g="prop"]', t: "📝 제안서", d: "고객 이름 · 투자성향 · 금액만 넣으면<br>오늘 시황에 맞춘 PDF · PPT가 바로 나와요"},
    {sel: "#h2cl .h2-cl", t: "📨 오늘의 한 장", d: "고객에게 카톡으로 보낼 그림 한 장<br>👥 고객용 · 📋 PB 요약 · 📅 이번 주"},
    {sel: "#hbvote", t: "🎯 1탭 예측", d: "아침에 한 번 누르고 3시 반에 채점<br>동료 PB와 이번 주 순위 경쟁"}
  ];
  var obOn = false;
  function tour(){
    if (obOn || ls("ux_ob3") || navigator.webdriver || /[?&]embed=1/.test(location.search)) return;
    if (!ls("wow_ob") || document.getElementById("wowob") || !onHome()) return;   // 조이 첫 인사가 끝난 뒤
    if (!document.querySelector(OB[0].sel) || !document.querySelector(OB[1].sel)) return;
    obOn = true; var k = 0;
    var mask = document.createElement("div"); mask.id = "uxob"; document.body.appendChild(mask);
    function step(){
      var o = OB[k], el = document.querySelector(o.sel);
      while (!el && k < OB.length - 1){ k++; o = OB[k]; el = document.querySelector(o.sel); }
      if (!el){ end(); return; }
      if (o.sel.indexOf("#bnav") < 0) el.scrollIntoView({block: "center"});
      setTimeout(function(){
        var r = el.getBoundingClientRect(), pad = 6, top = r.top - pad, h = r.height + pad * 2;
        var below = r.top < window.innerHeight * 0.5;
        mask.innerHTML = '<div class="uxob-hole" style="left:' + (r.left - pad) + 'px;top:' + top + 'px;width:' + (r.width + pad * 2) + 'px;height:' + Math.min(h, window.innerHeight * 0.6) + 'px"></div>' +
          '<div class="uxob-tip" style="' + (below ? "top:" + Math.min(top + Math.min(h, window.innerHeight * 0.6) + 12, window.innerHeight - 190) + "px" : "bottom:" + (window.innerHeight - top + 12) + "px") + '">' +
          '<small>' + (k + 1) + ' / ' + OB.length + '</small><b>' + o.t + '</b><p>' + o.d + '</p><div><button type="button" data-ob="skip">건너뛰기</button><button type="button" class="go" data-ob="next">' + (k === OB.length - 1 ? "시작하기 🚀" : "다음") + '</button></div></div>';
      }, 260);
    }
    function end(){ ls("ux_ob3", 1); mask.remove(); obOn = false; window.scrollTo({top: 0, behavior: "smooth"}); }
    mask.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-ob]"); if (!b){ return; } ev.stopPropagation();
      if (b.dataset.ob === "next" && k < OB.length - 1){ k++; step(); } else end(); });
    step();
  }

  /* ── 🩹 11/05 「옆에 짤림… 일일이 내가 다 얘기해야 하니」 — 넘침 자동 고침 ──
     카드(또는 화면) 오른쪽 끝을 넘는 글·칸을 찾아, 그 칸부터 카드까지 거슬러 올라가며
     ① 한 줄 고정(nowrap) → 줄바꿈 허용 ② 가로 줄(flex) → 다음 줄로 넘김 ③ 표 칸(grid) → 칸 폭 줄어들게 ④ 고정 폭 → 100%까지
     를 차례로 풀어 줌. 가로로 밀어 보는 줄(스크롤)·그림·지도·제안서 미리보기는 손대지 않음. 화면을 그릴 때·카드를 펼칠 때마다 다시 봄 */
  var HX = "svg,canvas,.ppx,.pp-pv,#ppx,.h2-tmw,.sv-bars,#uxob,.ixc,.h2-dc,[data-noheal]";
  function scroller(el, stop){ for (var p = el; p && p !== stop && p !== document.body; p = p.parentElement){ var o = getComputedStyle(p).overflowX; if ((o === "auto" || o === "scroll") && p.scrollWidth > p.clientWidth + 2) return true; } return false; }
  function loosen(n, stop){
    for (var a = n; a && a !== stop && a !== document.body; a = a.parentElement){
      var cs = getComputedStyle(a);
      if (cs.position === "absolute" || cs.position === "fixed") return;
      a.style.minWidth = "0";
      // 짧은 덩어리(「▲ 348」「상승 71%」 같은 12자 이하)는 쪼개지 않고 통째로 다음 줄로 — 줄바꿈은 긴 글만
      if ((cs.whiteSpace === "nowrap" || cs.whiteSpace === "pre") && (a.textContent || "").trim().length > 12){ a.style.whiteSpace = "normal"; a.style.overflowWrap = "anywhere"; }
      if (cs.display.indexOf("flex") >= 0 && cs.flexWrap === "nowrap" && cs.flexDirection.indexOf("row") === 0) a.style.flexWrap = "wrap";
      if (cs.display.indexOf("grid") >= 0){ var nC = cs.gridTemplateColumns.split(" ").filter(Boolean).length; if (nC > 1) a.style.gridTemplateColumns = "repeat(" + nC + ",minmax(0,1fr))"; }
      if (/px$/.test(a.style.width || "") || (cs.width && parseFloat(cs.width) > stop.clientWidth)) a.style.maxWidth = "100%";
      if (cs.flexShrink === "0") a.style.flexShrink = "1";
    }
  }
  function heal(){
    var vw = document.documentElement.clientWidth;
    [document.getElementById("main"), document.getElementById("sheet")].forEach(function(root){
      if (!root) return;
      for (var pass = 0; pass < 3; pass++){
        var n = 0, CR = new Map(), L = root.querySelectorAll("*");
        var limOf = function(el){ var c = el.closest("button,.card"); if (c && c.tagName === "BUTTON" && c.getBoundingClientRect().width < 120) c = c.parentElement && c.parentElement.closest(".card"); if (!c || !root.contains(c)) c = root; var v = CR.get(c); if (v == null){ v = Math.min(c.getBoundingClientRect().right, vw); CR.set(c, v); } return [c, v]; };
        for (var i = 0; i < L.length; i++){
          var el = L[i]; if (!el.offsetParent || el.closest(HX)) continue;
          var r = el.getBoundingClientRect(); if (!r.width || r.right <= vw * 0.5) continue;
          var cl = limOf(el), lim = cl[1]; if (r.right <= lim + 1) continue;
          var pe = el.parentElement; if (pe && pe !== cl[0] && pe.getBoundingClientRect().right > lim + 1) continue;   // 바깥쪽부터
          if (scroller(el, cl[0])) continue;
          loosen(el, cl[0]); n++;
        }
        if (!n) break;
      }
    });
  }
  window.__heal = heal;
  var hT = 0; function healSoon(){ clearTimeout(hT); hT = setTimeout(function(){ try { heal(); } catch(x) {} }, 220); }
  document.addEventListener("click", function(){ setTimeout(healSoon, 120); }, true);
  document.addEventListener("toggle", healSoon, true);
  window.addEventListener("resize", healSoon);

  /* ── 돌리기 ── */
  var q = 0;
  function tick(){ q = 0; var m = document.getElementById("main");
    try { luckRow(); } catch(x) {}
    try { fs13(m); fs13(document.getElementById("sheet")); } catch(x) {}
    try { thin(m); } catch(x) {}
    // 「더 보기」로 따로 연 카드는 이미 고른 것이니 바로 펼쳐 보여 줌(접힌 채로 열려 한 번 더 눌러야 했음)
    try { [].forEach.call(document.querySelectorAll("#sheet .cz.cz-on"), function(c){ c.classList.remove("cz-on"); }); } catch(x) {}
    healSoon();
    try { if (onHome()) setTimeout(tour, 2500); } catch(x) {} }
  function soon(){ if (!q) q = setTimeout(tick, 250); }
  function start(){ tick(); try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  var st = document.createElement("style");
  st.textContent =
    ".ux-luck{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:4px 0 14px}.ux-luck button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:13px;font-weight:700;color:var(--sub);background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 4px;cursor:pointer}.ux-luck button span{font-size:20px}" +
    ".ux-thin{display:flex!important;align-items:center;gap:8px;padding:9px 14px!important;margin:0 0 12px!important;font-size:13px!important;line-height:1.4!important;text-align:left!important;color:var(--sub);background:var(--panel2);border-radius:12px;min-height:0!important}.ux-thin .big{font-size:16px!important;margin:0!important}.ux-thin br{display:none}.ux-thin button,.ux-thin .btn{display:none!important}" +
    /* 🩹 막대 그림 칸 이름: 맨 끝 칸은 안쪽으로 붙임 · 아래 구간 이름은 줄바꿈 */
    ".vc-c:last-child .vc-n,.vc-c:last-child .vc-x{left:auto;right:0;transform:none;text-align:right}.vc-c:first-child .vc-n,.vc-c:first-child .vc-x{left:0;transform:none}" +
    ".bins div{min-width:0}.bins small{white-space:normal!important;text-align:center;word-break:keep-all;line-height:1.2}" +
    /* 🌏 5개 시장 한눈에(나침반) — 좁은 화면·큰 글씨에서도 한 칸 안에 */
    ".cp-row .cp-h{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px}.cp-row .cp-h>b{white-space:nowrap}.cp-row .cp-ix{margin-left:auto;white-space:nowrap}.cp-row .cp-n{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto;gap:6px;align-items:baseline}.cp-row .cp-n span{white-space:nowrap}.cp-row .cp-n .mut{text-align:center;overflow:hidden;text-overflow:clip;font-size:.92em}.cp-lb{font-style:normal}@media (max-width:360px){.cp-lb{display:none}}" +
    /* C13 어두운 화면 대비 */
    ":root:not([data-ui=light]){--dim:#9aa3b5}.pp-f.lk{opacity:.62!important}.cz.cz-on .cz-h span{color:var(--text)}" +
    /* D17 */
    "#uxob{position:fixed;inset:0;z-index:9998}.uxob-hole{position:fixed;border-radius:16px;box-shadow:0 0 0 9999px rgba(8,12,20,.66);transition:all .25s;pointer-events:none;border:2px solid #fee500}" +
    ".uxob-tip{position:fixed;left:16px;right:16px;background:#fff;color:#191f28;border-radius:18px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.3)}.uxob-tip small{font-size:12.5px;color:#6b7684;font-weight:700}.uxob-tip b{display:block;font-size:19px;margin:2px 0 4px}.uxob-tip p{margin:0 0 12px;font-size:15px;line-height:1.5;color:#333d4b}" +
    ".uxob-tip div{display:flex;gap:8px;justify-content:flex-end}.uxob-tip button{font:inherit;font-size:15px;font-weight:700;border:0;border-radius:12px;padding:10px 16px;background:#f2f4f6;color:#4e5968}.uxob-tip button.go{background:#3182f6;color:#fff}";
  document.head.appendChild(st);
})();
;
/* ======== ux1105b.js ======== */
/* 11/05 사용자 「1,3 진행해」 — 📱 앱 아이디어 A11/5-1 · A11/5-3
   ① 📐 수익률 지도 (A11/5-1) — 🛍 상품 탭(채권·펀드·ELS 어디서든) 맨 위 한 장:
      가로 = 남은 기간(만기 · ELS 는 최장) · 세로 = 연 수익률(원화 채권 = 세전 매수 금리 · 미국채·호주국채 = 그 나라 돈 기준 · ELS·ELB = 조건 맞으면 연 쿠폰 · 펀드 = 지난 1년).
      펀드는 만기가 없어 오른쪽 「만기 없음」 칸에 유형마다 대표 하나(설정액 가장 큰 것) + 🔬 에 담아 둔 펀드.
      손가락을 옆으로 끌며 네모를 그리면 그 안 상품이 밑에 서고 → 「📲 크게 보기 · 한 장」 → 📨 그림으로 보내기. 점 하나 누르면 그 상품 한 줄.
   ③ 📋 받은 글 → 답장 한 장 (A11/5-3) — 머리 🔍 에 카톡으로 받은 긴 글을 붙여넣으면 검색 대신:
      글에 나온 종목 지금 등락 · 그 종목(·지수)이 기초자산인 청약 중 ELS · 📌 내 ELS 겹침 · 글 속 숫자 조건(5%·3년)에 맞는 상품 · 답이 될 카드(💬 고객이 물으면) → 한 장.
      받은 글은 이 휴대폰 화면 안에서만 읽음(저장·전송 없음) · 한 장에는 원문을 싣지 않음(종목·숫자만).
   원칙: 숫자를 지어내지 않음(자료 없으면 「자료 없음」) · 사라·팔라는 말 없음 · 과거 수익률은 미래 보장 아님 · 사모(pv) 빼기. */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function pc(v, d){ return v == null || isNaN(v) ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function ls(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(x) { return null; } }
  function U(){ return window.__u1104 || null; }
  function J(u, t){ t = t || 600000; return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / t), {ttl: t}).catch(function(){ return null; }); }
  var DISC = "투자 권유 아님 · 과거 수익률은 미래를 보장하지 않음 · ELS·펀드는 원금 손실 가능 · 세금·수수료 전 · 상품 설명서를 꼭 확인";
  var COL = {bond: "#4b8bff", ust: "#7aa7ff", els: "#ff9f43", elb: "#f2c94c", fund: "#2ecc71"};

  /* ════════════ 공통: 크게 보기 · 그림 한 장 ════════════
     S = {title, sub, cards: [{t: "p", h, big, nm, sub, mean, won, k} | {t: "l", h, lines: [[왼쪽, 오른쪽, 색]] , note}], fn} */
  var SHEET = null;
  function bigOpen(S){
    SHEET = S; var old = document.getElementById("nsbig"); if (old) old.remove();
    var d = document.createElement("div"); d.id = "nsbig"; d.className = "no-clp";
    d.innerHTML = '<div class="nb-in"><div class="nb-top"><small>' + md(today()) + ' · 참고용</small><button type="button" class="nb-x" aria-label="닫기">✕</button></div>' +
      '<h2>' + e(S.title) + '</h2><p class="nb-s">' + e(S.sub || "") + '</p>' +
      S.cards.map(function(c){
        if (c.t === "l") return '<div class="nb-c yb-l"><small>' + e(c.h) + '</small>' + c.lines.map(function(l){ return '<div class="yb-li"><span>' + e(l[0]) + '</span><b' + (l[2] ? ' style="color:var(--' + (l[2] === "up" ? "up" : "down") + ')"' : '') + '>' + e(l[1]) + '</b></div>'; }).join("") + (c.note ? '<i>' + e(c.note) + '</i>' : '') + '</div>';
        return '<div class="nb-c"><small>' + e(c.h) + '</small><b>' + e(c.big) + '</b><span>' + e(c.nm) + '</span><em>' + e(c.sub || "") + '</em>' + (c.mean ? '<i>' + e(c.mean) + '</i>' : '') + (c.won ? '<u>' + e(c.won) + '</u>' : '') + '</div>';
      }).join("") +
      '<p class="nb-d">' + DISC + '</p><button type="button" class="nb-send">📨 이 한 장 보내기</button></div>';
    document.body.appendChild(d);
    d.querySelector(".nb-x").onclick = function(){ d.remove(); };
    d.querySelector(".nb-send").onclick = function(){ sendImg(S); };
  }
  function wrap(g, t, maxW){ var out = [], line = ""; String(t).split(/(\s+)/).forEach(function(w){ var tt = line + w; if (g.measureText(tt).width > maxW && line.trim()){ out.push(line.trim()); line = w.trim(); } else line = tt; }); if (line.trim()) out.push(line.trim()); return out; }
  function cardH(c){ return c.t === "l" ? 80 + c.lines.length * 50 + (c.note ? 50 : 0) : 300; }
  function sendImg(S){
    S = S || SHEET; if (!S) return;
    var W = 1080, need = 270 + S.cards.reduce(function(a, c){ return a + cardH(c) + 20; }, 0) + 150, H = Math.min(1920, Math.max(1350, need));
    var c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d");
    var F = "-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", IC = {bond: "#2563eb", els: "#d97706", fund: "#059669"};
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText(md(today()) + " · 참고용", 64, 90);
    g.fillStyle = "#111827"; g.font = "800 54px " + F; wrap(g, S.title, W - 128).slice(0, 1).forEach(function(l){ g.fillText(l, 64, 168); });
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; wrap(g, S.sub || "", W - 128).slice(0, 1).forEach(function(l){ g.fillText(l, 64, 220); });
    var y = 260;
    S.cards.forEach(function(cd){
      var h = cardH(cd); if (y + h > H - 140) return;
      g.fillStyle = "#f3f4f6"; g.beginPath(); if (g.roundRect) g.roundRect(48, y, W - 96, h, 28); else g.rect(48, y, W - 96, h); g.fill();
      g.fillStyle = IC[cd.k] || "#6366f1"; g.fillRect(48, y + 24, 10, h - 48);
      g.fillStyle = "#374151"; g.font = "700 30px " + F; g.fillText(cd.h, 88, y + 58);
      if (cd.t === "l"){
        cd.lines.forEach(function(l, i){ var yy = y + 110 + i * 50;
          g.fillStyle = "#111827"; g.font = "600 32px " + F; var lt = wrap(g, l[0], W - 470)[0] || ""; g.fillText(lt, 88, yy);
          g.fillStyle = l[2] === "up" ? "#dc2626" : l[2] === "dn" ? "#2563eb" : "#111827"; g.font = "800 32px " + F; var tw = g.measureText(l[1]).width; g.fillText(l[1], W - 88 - tw, yy); });
        if (cd.note){ g.fillStyle = "#b45309"; g.font = "500 25px " + F; g.fillText(wrap(g, cd.note, W - 190)[0] || "", 88, y + 114 + cd.lines.length * 50); }
      } else {
        g.fillStyle = "#111827"; g.font = "800 54px " + F; g.fillText(cd.big, 88, y + 124);
        g.font = "600 30px " + F; wrap(g, cd.nm, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 170); });
        g.fillStyle = "#4b5563"; g.font = "500 26px " + F; wrap(g, cd.sub || "", W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 210); });
        g.fillStyle = "#b45309"; g.font = "500 26px " + F; wrap(g, (cd.mean || "") + (cd.won ? " · " + cd.won : ""), W - 190).slice(0, 2).forEach(function(l, i){ g.fillText(l, 88, y + 248 + i * 32); });
      }
      y += h + 20;
    });
    g.fillStyle = "#6b7280"; g.font = "500 24px " + F; wrap(g, DISC, W - 128).forEach(function(l, i){ g.fillText(l, 64, H - 100 + i * 34); });
    c.toBlob(function(b){
      if (!b) return;
      var f = new File([b], (S.fn || "한장") + "_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"});
      if (window.__onepage && __onepage.ready) __onepage.ready([f], S.title);
      else { var a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); }
    }, "image/png");
  }

  /* ════════════ ① 📐 수익률 지도 ════════════ */
  var FTYPES = ["주식형", "해외주식형", "주식혼합형", "채권혼합형", "해외채권혼합형", "채권형", "해외채권형", "MMF"];
  var YM = {D: null, P: null, box: null, tap: null, open: 1, kinds: {bond: 1, els: 1, elb: 1, fund: 1}};
  try { var so = sessionStorage.getItem("ymOpen"); if (so != null) YM.open = +so; } catch(x) {}
  function fundOk(f){ return !f.pv && f.y1 != null && !(f.y1 > 300) && !(/채권형|MMF/.test(f.t || "") && !/혼합/.test(f.t) && f.y1 > 12); }
  function ymPoints(D){
    var u = U(); if (!u) return [];
    var R = u.pick(D, {rate: -99}), pts = [], i;
    R.bond.forEach(function(b){ pts.push({k: "bond", x: b.y, r: b.r, o: b, nm: b.nm, fx: b.cur !== "원화"}); });
    R.els.forEach(function(x){ if (x.y == null || x.y <= 0) return; pts.push({k: x.elb ? "elb" : "els", x: x.y, r: x.r, o: x, nm: x.nm}); });
    var F = ((D.p && D.p.funds) || []).filter(function(f){ return fundOk(f) && (f.aum || 0) >= 10; }), slot = 0;
    FTYPES.forEach(function(t){
      var G = F.filter(function(f){ return f.t === t; }); if (!G.length) return;
      var ys = G.map(function(f){ return f.y1; }).sort(function(a, b){ return a - b; }), med = ys[Math.floor(ys.length / 2)];
      var big = G.slice().sort(function(a, b){ return (b.aum || 0) - (a.aum || 0); })[0];
      pts.push({k: "fund", fund: 1, slot: slot++, r: big.y1, nm: big.n, t: t, med: med, n: G.length, o: {k: "fund", nm: big.n, r: big.y1, t: big.t, st: big.st, rk: big.rk, co: big.co, c: big.c}});
    });
    var mine = ls("xrFunds"), all = (D.p && D.p.funds) || [];
    if (Array.isArray(mine)) mine.forEach(function(m){ for (i = 0; i < all.length; i++){ var f = all[i]; if (f.c === m.id && fundOk(f)){ pts.push({k: "fund", fund: 1, mine: 1, slot: slot++, r: f.y1, nm: f.n, t: f.t, o: {k: "fund", nm: f.n, r: f.y1, t: f.t, st: f.st, rk: f.rk, co: f.co, c: f.c}}); break; } } });
    return pts;
  }
  // 그림 좌표: 만기는 로그 눈금 log(1+년)(가까운 쪽을 넓게 — ELS·단기채가 몰린 1~3년이 보이게) · 오른쪽 띠 = 펀드(만기 없음)
  var G = {W: 358, H: 250, L: 34, R: 62, T: 12, B: 30, XM: 30, YM: 20};
  function gx(y){ return G.L + Math.log(1 + Math.max(0, Math.min(G.XM, y))) / Math.log(1 + G.XM) * (G.W - G.L - G.R); }
  function gy(r){ return G.T + (1 - Math.max(0, Math.min(G.YM, r)) / G.YM) * (G.H - G.T - G.B); }
  function ix(px){ var t = (px - G.L) / (G.W - G.L - G.R); t = Math.max(0, Math.min(1, t)); return Math.exp(t * Math.log(1 + G.XM)) - 1; }
  function iy(py){ return (1 - (py - G.T) / (G.H - G.T - G.B)) * G.YM; }
  function fbx(){ return G.W - G.R + 10; }
  function ptXY(p, nf){ if (p.fund){ var bw = G.R - 16, n = Math.max(1, nf); return [fbx() + 4 + (n === 1 ? bw / 2 : p.slot / (n - 1) * (bw - 8)), gy(p.r)]; } return [gx(p.x), gy(p.r)]; }
  function vis(p){ return YM.kinds[p.k]; }
  function ymSVG(pts){
    var W = G.W, H = G.H, s = '<svg id="ymsvg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="만기와 수익률 지도">';
    [0, 5, 10, 15, 20].forEach(function(r){ var y = gy(r); s += '<line x1="' + G.L + '" x2="' + (W - 6) + '" y1="' + y + '" y2="' + y + '" class="ym-gl"/><text x="' + (G.L - 4) + '" y="' + (y + 4) + '" class="ym-tx" text-anchor="end">' + r + '%</text>'; });
    [1, 3, 5, 10, 30].forEach(function(t){ var x = gx(t); s += '<line x1="' + x + '" x2="' + x + '" y1="' + G.T + '" y2="' + (H - G.B) + '" class="ym-gl ym-v"/><text x="' + x + '" y="' + (H - G.B + 15) + '" class="ym-tx" text-anchor="' + (t === 30 ? "end" : "middle") + '">' + t + '년</text>'; });
    var fb = fbx(); s += '<rect x="' + (fb - 4) + '" y="' + G.T + '" width="' + (G.R - 8) + '" height="' + (H - G.T - G.B) + '" rx="6" class="ym-fb"/><text x="' + (fb + (G.R - 16) / 2) + '" y="' + (H - G.B + 15) + '" class="ym-tx" text-anchor="middle">만기 없음</text>';
    var nf = pts.filter(function(p){ return p.fund; }).length, order = {fund: 0, bond: 1, elb: 2, els: 3};
    pts.slice().sort(function(a, b){ return order[a.k] - order[b.k]; }).forEach(function(p){
      if (!vis(p)) return; var q = ptXY(p, nf), over = p.r > G.YM, cy = over ? G.T + 3 : q[1], col = p.k === "bond" && p.fx ? COL.ust : COL[p.k];
      var sel = YM.box && inBox(p, nf), cls = "ym-p" + (sel ? " on" : YM.box ? " off" : "");
      if (p.k === "elb") s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="3.4" class="' + cls + '" fill="none" stroke="' + col + '" stroke-width="1.6"/>';
      else s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (p.fund ? 5 : 3.3) + '" class="' + cls + '" fill="' + col + '"' + (p.mine ? ' stroke="#fff" stroke-width="1.6"' : '') + '/>';
      if (over) s += '<text x="' + q[0].toFixed(1) + '" y="' + (G.T + 1) + '" class="ym-ov" text-anchor="middle">▲</text>';
    });
    if (YM.box){ var b = YM.box; s += '<rect x="' + Math.min(b.x0, b.x1) + '" y="' + Math.min(b.y0, b.y1) + '" width="' + Math.abs(b.x1 - b.x0) + '" height="' + Math.abs(b.y1 - b.y0) + '" class="ym-box"/>'; }
    if (YM.tap){ var t = YM.tap, tq = ptXY(t, nf); s += '<circle cx="' + tq[0] + '" cy="' + Math.min(tq[1], t.r > G.YM ? G.T + 3 : tq[1]) + '" r="8" class="ym-tap"/>'; }
    return s + '</svg>';
  }
  function inBox(p, nf){ var b = YM.box; if (!b) return false; var q = ptXY(p, nf), y = p.r > G.YM ? G.T + 3 : q[1];
    return q[0] >= Math.min(b.x0, b.x1) - 2 && q[0] <= Math.max(b.x0, b.x1) + 2 && y >= Math.min(b.y0, b.y1) - 2 && y <= Math.max(b.y0, b.y1) + 2; }
  function boxTxt(){
    var b = YM.box; if (!b) return "";
    var xa = Math.min(b.x0, b.x1), xb = Math.max(b.x0, b.x1), ra = iy(Math.max(b.y0, b.y1)), rb = iy(Math.min(b.y0, b.y1)), u = U(), t = [];
    if (xa < G.W - G.R) t.push("남은 기간 " + (ix(xa) < 0.08 ? "0" : u.ytxt(ix(xa)).trim()) + " ~ " + (xb >= G.W - G.R ? "30년" : u.ytxt(ix(xb)).trim()));
    if (xb >= fbx() - 4) t.push("펀드(만기 없음)");
    t.push("연 " + Math.max(0, ra).toFixed(1) + "% ~ " + (Math.min(b.y0, b.y1) <= G.T + 4 ? "그 위" : rb.toFixed(1) + "%"));
    return t.join(" · ");
  }
  var KN = {bond: "🏦 채권", elb: "🎯 ELB(원금 지급형)", els: "🎯 ELS", fund: "📦 펀드"};
  function selList(pts){
    var nf = pts.filter(function(p){ return p.fund; }).length, S = {bond: [], elb: [], els: [], fund: []};
    pts.forEach(function(p){ if (vis(p) && inBox(p, nf)) S[p.k].push(p); });
    return S;
  }
  function selHTML(pts){
    if (YM.tap){
      var p = YM.tap, T = U().rowTxt(p.o, {});
      return '<div class="ym-one"><small>' + T.h + (p.mine ? ' · 🔬 담아 둔 펀드' : '') + '</small><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' +
        (p.fund && p.n ? '<em>같은 유형(' + e(p.t) + ') ' + p.n + '개 가운데값 지난 1년 ' + sg(p.med, 1) + '% · 점은 설정액이 가장 큰 펀드</em>' : '') +
        '<button type="button" class="ym-go" data-ymj="' + (p.k === "bond" ? "bond" : p.k === "fund" ? "fund" : "els") + '">' + KN[p.k] + ' 탭에서 보기 ›</button></div>';
    }
    if (!YM.box) return '<p class="ym-hint">👆 손가락을 <b>옆으로 끌면서</b> 네모를 그리면 그 안 상품이 여기 모여요 · 점 하나를 누르면 그 상품 · 위아래로 밀면 화면이 내려가요</p>';
    var S = selList(pts), n = S.bond.length + S.elb.length + S.els.length + S.fund.length;
    var h = '<div class="ym-sh"><b>▭ ' + e(boxTxt()) + '</b><small>채권 ' + S.bond.length + ' · ELB ' + S.elb.length + ' · ELS ' + S.els.length + ' · 펀드 ' + S.fund.length + '</small><button type="button" class="ym-clr">지우기</button></div>';
    if (!n) return h + '<p class="ym-hint">이 네모 안엔 상품이 없어요. 조금 넓게 그려 보세요.</p>';
    var top = ymTop(S);
    h += '<div class="ns-top">' + top.map(function(x){ var T = U().rowTxt(x, {}); return '<div class="ns-c"><small>' + T.h + '</small><b class="ns-big">' + e(T.big) + '</b><span class="ns-nm">' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i></div>'; }).join("") + '</div>' +
      '<div class="ns-act"><button type="button" class="ym-big">📲 크게 보기 · 한 장</button></div>';
    [["bond", S.bond], ["elb", S.elb], ["els", S.els], ["fund", S.fund]].forEach(function(z){
      if (z[1].length < 2) return;
      h += '<details class="ns-more"><summary>' + KN[z[0]] + ' ' + z[1].length + '개 모두</summary>' + sortK(z[0], z[1]).slice(0, 12).map(function(p){ var T = U().rowTxt(p.o, {}); return '<div class="ns-r"><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><small>' + e(T.sub) + '</small></div>'; }).join("") + (z[1].length > 12 ? '<p class="ym-hint">…위험 낮은 순 12개까지</p>' : '') + '</details>';
    });
    return h;
  }
  function sortK(k, L){   // ux1104 숫자로 찾기와 같은 순서: 원화 먼저·위험 낮은 순 / ELB 먼저·KI 낮은 순 / 펀드는 위험 낮은 순
    L = L.slice();
    if (k === "bond") L.sort(function(a, b){ return (a.o.cur !== "원화") - (b.o.cur !== "원화") || a.o.rk - b.o.rk || a.o.bk - b.o.bk || b.r - a.r; });
    else if (k === "fund") L.sort(function(a, b){ return (b.o.rk || 0) - (a.o.rk || 0) || b.r - a.r; });
    else L.sort(function(a, b){ return a.o.kio - b.o.kio || b.r - a.r; });
    return L;
  }
  function ymTop(S){ return [sortK("bond", S.bond)[0], sortK("elb", S.elb)[0] || sortK("els", S.els)[0], sortK("fund", S.fund)[0]].filter(Boolean).map(function(p){ return p.o; }); }
  function ymSheet(pts){
    var S = selList(pts), top = ymTop(S); if (!top.length) return;
    bigOpen({title: "이 범위의 상품 한눈에", sub: boxTxt() + " · 위험이 낮은 것부터 한 가지씩", fn: "수익률지도",
      cards: top.map(function(x){ var T = U().rowTxt(x, {}); return {t: "p", k: x.k, h: T.h, big: T.big, nm: T.nm, sub: T.sub, mean: T.mean}; })});
  }
  var PRESET = [["1년 안", 0, 1, 0, 20], ["3년 안팎 · 연 4%↑", 2.3, 3.8, 4, 20], ["연 8%↑", 0, 30, 8, 20], ["5년 넘게", 5, 30, 0, 20]];
  function presetBox(i){ var p = PRESET[i]; YM.tap = null; YM.box = {x0: gx(p[1]) - 1, x1: p[2] >= 30 ? G.W - G.R - 1 : gx(p[2]) + 1, y0: gy(p[4]) - 1, y1: gy(p[3]) + 1}; }
  function ymCard(){
    var pts = YM.pts || [];
    var cnt = {bond: 0, elb: 0, els: 0, fund: 0}; pts.forEach(function(p){ cnt[p.k]++; });
    return '<div class="ym-hd" data-ymt="1"><h3>📐 수익률 지도 <small>만기 × 수익률 · 한 판에</small></h3><span class="ym-tg">' + (YM.open ? "접기 ▴" : "펼치기 ▾") + '</span></div>' +
      (YM.open ? '<p class="ym-sub">채권 ' + cnt.bond + ' · ELS ' + cnt.els + ' · ELB ' + cnt.elb + '(청약 중) · 펀드 유형 대표 ' + cnt.fund + ' — 점 하나가 상품 하나</p>' +
      '<div class="ym-kd">' + [["bond", "채권", COL.bond], ["els", "ELS", COL.els], ["elb", "ELB 원금지급", COL.elb], ["fund", "펀드", COL.fund]].map(function(k){ return '<button type="button" data-ymk="' + k[0] + '" class="' + (YM.kinds[k[0]] ? "on" : "") + '"><i style="' + (k[0] === "elb" ? "border:2px solid " + k[2] : "background:" + k[2]) + '"></i>' + k[1] + '</button>'; }).join("") + '</div>' +
      '<div class="ym-cv">' + ymSVG(pts) + '</div>' +
      '<div class="ym-ps">' + PRESET.map(function(p, i){ return '<button type="button" data-ymp="' + i + '">' + e(p[0]) + '</button>'; }).join("") + '</div>' +
      '<div id="ymsel">' + selHTML(pts) + '</div>' +
      '<p class="ym-n">세로: 원화 채권 = 세전 매수 금리(만기까지 들고 있으면) · 미국채·호주국채(옅은 파랑) = 그 나라 돈 기준 · ELS·ELB = 조건 맞으면 받는 연 쿠폰(약속된 최대치 · ELS 는 원금 손실 가능 · 가로는 최장 만기) · 펀드 = 지나간 1년(앞으로 보장 아님) — 셋은 위험이 다른 숫자예요. ' + G.YM + '% 넘는 점은 맨 위 ▲. 미래에셋 판매 목록·DART 청약 공시 그대로 · 참고용</p>' : '');
  }
  function ymPaint(){
    var c = document.getElementById("ymap"); if (!c) return;
    c.innerHTML = ymCard(); ymBind(c);
  }
  function ymPaintSel(){ var s = document.getElementById("ymsel"), v = document.querySelector("#ymap .ym-cv"); if (v) v.innerHTML = ymSVG(YM.pts || []); if (s) s.innerHTML = selHTML(YM.pts || []); ymBindSvg(); }
  function svgPt(svg, ev){ var r = svg.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * G.W, (ev.clientY - r.top) / r.height * G.H]; }
  function ymBindSvg(){
    var svg = document.getElementById("ymsvg"); if (!svg || svg.dataset.b) return; svg.dataset.b = "1";
    var st = null;
    svg.addEventListener("pointerdown", function(ev){ st = {p: svgPt(svg, ev), id: ev.pointerId, draw: ev.pointerType === "mouse", moved: false}; });
    svg.addEventListener("pointermove", function(ev){
      if (!st || ev.pointerId !== st.id) return; var q = svgPt(svg, ev), dx = q[0] - st.p[0], dy = q[1] - st.p[1];
      if (!st.draw){ if (Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy)){ st.draw = true; try { svg.setPointerCapture(ev.pointerId); } catch(z) {} } else return; }
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      st.moved = true; ev.preventDefault();
      YM.tap = null; YM.box = {x0: st.p[0], y0: st.p[1], x1: Math.max(0, Math.min(G.W, q[0])), y1: Math.max(G.T, Math.min(G.H - G.B, q[1]))};
      var b = YM.box, r = svg.querySelector(".ym-box");   // 끄는 동안엔 네모만 고침(그림 전체를 다시 그리면 손가락이 끊김)
      if (!r){ r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); r.setAttribute("class", "ym-box"); svg.appendChild(r); }
      r.setAttribute("x", Math.min(b.x0, b.x1)); r.setAttribute("y", Math.min(b.y0, b.y1)); r.setAttribute("width", Math.abs(b.x1 - b.x0)); r.setAttribute("height", Math.abs(b.y1 - b.y0));
    });
    function end(ev){
      if (!st) return; var s0 = st; st = null;
      if (s0.moved){ ymPaintSel(); try { if (window.ntfyUse) ntfyUse("ymap_box"); } catch(z) {} return; }
      // 누르기 = 가장 가까운 점(14px 안)
      var q = svgPt(svg, ev), best = null, bd = 14 * 14, pts = YM.pts || [], nf = pts.filter(function(p){ return p.fund; }).length;
      pts.forEach(function(p){ if (!vis(p)) return; var a = ptXY(p, nf), y = p.r > G.YM ? G.T + 3 : a[1], d = (a[0] - q[0]) * (a[0] - q[0]) + (y - q[1]) * (y - q[1]); if (d < bd){ bd = d; best = p; } });
      if (best){ YM.tap = best; YM.box = null; ymPaintSel(); }
    }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", function(){ st = null; });
  }
  function ymBind(c){
    c.onclick = function(ev){
      var t = ev.target.closest && ev.target.closest("[data-ymt],button"); if (!t) return; ev.stopPropagation();
      if (t.dataset.ymt){ YM.open = YM.open ? 0 : 1; try { sessionStorage.setItem("ymOpen", YM.open); } catch(z) {} ymPaint(); return; }
      if (t.dataset.ymk){ YM.kinds[t.dataset.ymk] = YM.kinds[t.dataset.ymk] ? 0 : 1; YM.tap = null; ymPaint(); return; }
      if (t.dataset.ymp != null){ presetBox(+t.dataset.ymp); ymPaintSel(); return; }
      if (t.classList.contains("ym-clr")){ YM.box = null; YM.tap = null; ymPaintSel(); return; }
      if (t.classList.contains("ym-big")){ ymSheet(YM.pts || []); return; }
      if (t.dataset.ymj){ var k = t.dataset.ymj; if (window.goTo) goTo(k, "pdbody"); else if (window.go) go(k); }
    };
    ymBindSvg();
  }
  function ymMount(){
    var root = document.getElementById("pdroot"); if (!root || !/^(bond|fund|els)$/.test(root.dataset.k || "")) return;
    if (root.querySelector(".loading") && !root.querySelector("#pdbody")) return;
    if (document.getElementById("ymap")) return;
    var c = document.createElement("section"); c.className = "card no-clp ym4"; c.id = "ymap"; c.dataset.xc = "1";
    c.innerHTML = '<div class="ym-hd"><h3>📐 수익률 지도</h3></div><p class="ym-hint">상품 목록 불러오는 중…</p>';
    root.insertBefore(c, root.firstChild);
    var u = U(); if (!u) return;
    var w = root.clientWidth; if (w > 200) G.W = Math.min(560, Math.round(w - 26));
    u.nsData().then(function(D){ YM.pts = ymPoints(D); ymPaint(); }).catch(function(){ c.innerHTML = '<p class="ym-hint">상품 자료를 못 받았어요.</p>'; });
  }

  /* ════════════ ③ 📋 받은 글 → 답장 한 장 ════════════ */
  var NM = null, TKSTOP = {};   // 금융 줄임말과 같은 티커는 종목으로 안 셈(ELS = 미국 리츠 티커 등)
  "ELS ELB DLS DLB ETF ETN IRP ISA CEO CFO GDP CPI PPI IPO EPS PER PBR ROE USD KRW FED ECB BOJ MMF RSI TDF ATM OTC SEC ESG NAV CMA RIA ADR VIX KOSPI FOMC AI IT".split(" ").forEach(function(k){ TKSTOP[k] = 1; });
  function nameList(){
    if (NM || !window.OPIDX) return NM;
    var L = [];
    OPIDX.forEach(function(r){
      if (/ ADR$/.test(r.name)) return;
      var nm = String(r.name || "").trim(), t = r.tier || 0, kr = r.mkt === "KR";
      if (kr){ if (nm.length >= 3 || (nm.length === 2 && t >= 4)) L.push({w: nm, r: r}); }
      else if (/[가-힣]/.test(nm) && t >= 3 && nm.replace(/\s/g, "").length >= 2) L.push({w: nm, r: r});
      (r.altRaw || []).forEach(function(a){ if (a !== nm && a.length >= 3 && t >= 3 && /^[가-힣A-Za-z0-9]+$/.test(a)) L.push({w: a, r: r}); });
      if (!kr && t >= 4 && /^[A-Z]{3,5}$/.test(r.sym) && !TKSTOP[r.sym]) L.push({w: r.sym, r: r, tk: 1});
    });
    L.sort(function(a, b){ return b.w.length - a.w.length; });
    return NM = L;
  }
  var HAN = /[가-힣]/;
  function findStocks(t){
    var L = nameList() || [], used = new Uint8Array(t.length), out = [], seen = {};
    for (var i = 0; i < L.length && out.length < 8; i++){
      var c = L[i], w = c.w, from = 0, at;
      while ((at = t.indexOf(w, from)) >= 0){
        from = at + 1; var ok = true;
        for (var j = at; j < at + w.length; j++) if (used[j]){ ok = false; break; }
        if (!ok) continue;
        var pre = at ? t.charAt(at - 1) : "", post = t.charAt(at + w.length);
        if (c.tk){ if (/[A-Za-z0-9]/.test(pre) || /[A-Za-z0-9]/.test(post)) continue; }
        else if (w.length <= 3 && HAN.test(pre)) continue;   // 짧은 이름은 앞에 한글이 붙으면(낱말 속) 안 셈
        else if (/^[A-Za-z]/.test(w) && /[A-Za-z]/.test(pre)) continue;
        for (j = at; j < at + w.length; j++) used[j] = 1;
        if (!seen[c.r.sym]){ seen[c.r.sym] = 1; out.push({r: c.r, w: w, at: at}); }
        break;
      }
    }
    return out.sort(function(a, b){ return a.at - b.at; });
  }
  var IDXW = [[/코스피|KOSPI/i, "KOSPI200", "코스피200"], [/S&P|에스앤피|S&amp;P/i, "S&P500", "S&P500"], [/나스닥|NASDAQ/i, "NASDAQ100", "나스닥100"], [/니케이|닛케이|NIKKEI|일본\s*증시/i, "NIKKEI225", "니케이225"], [/항셍|HSCEI|홍콩/i, "HSCEI", "항셍중국"], [/유로스톡스|유로스탁스|EuroStoxx|유럽\s*증시/i, "EUROSTOXX50", "유로스탁스50"]];
  function uaHas(ua, keys){ var s = String(ua || "").replace(/\s/g, "").toUpperCase(); return keys.some(function(k){ return s.indexOf(String(k).replace(/\s/g, "").toUpperCase()) >= 0; }); }
  function numCond(t){   // 글 속 「5%」「3년」 — 금리·쿠폰 뜻으로 쓴 것만(「−3%」 같은 등락은 뺌)
    var o = {}, m;
    m = /(?:연|금리|이자|쿠폰|수익률?)\s*(\d+(?:\.\d+)?)\s*%|(\d+(?:\.\d+)?)\s*%\s*(?:짜리|넘는|이상|되는|대|정도)/.exec(t);
    if (m){ var v = +(m[1] || m[2]); if (v > 0 && v <= 30) o.rate = v; }
    m = /(\d+(?:\.\d+)?)\s*(년|개월)\s*(?:짜리|만기|묶|정도|안팎|동안)/.exec(t); if (m) o.yrs = m[2] === "년" ? +m[1] : +m[1] / 12;
    m = /(\d+(?:\.\d+)?)\s*(억|천만|백만)\s*원?/.exec(t.replace(/,/g, "")); if (m) o.amt = +m[1] * {"억": 1e8, "천만": 1e7, "백만": 1e6}[m[2]];
    return o;
  }
  var ASKK = [[0, /금리|채권|국채|이자/], [1, /ELS|ELB|이엘에스|낙인|녹인/i], [2, /들어가|사도|매수|진입|타이밍/], [3, /급락|폭락|팔아|팔까|손절|빠졌|빠져|빠지|떨어/], [4, /요즘|뭐가 좋|업종|테마|센 거|강한/],
    [5, /환율|달러/], [6, /연금|IRP|퇴직/], [7, /목표|모으|노후/], [8, /섞|분산|나눠/], [9, /포트|내 계좌|수익률 괜찮/], [10, /큰손|외국인|기관|고래/], [11, /일정|실적 발표|FOMC|금통위|이번 주/]];
  var CUR = {US: "$", JP: "¥", CN: "위안 ", HK: "HK$"};
  function fmtPx(v, mkt){ if (v == null) return "–"; if (mkt === "KR") return Math.round(v).toLocaleString() + "원"; var s = v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(2); return (mkt === "CN" ? s + "위안" : (CUR[mkt] || "") + s); }
  function code6(sym){ var m = /^(\d{6})\.(KS|KQ)$/.exec(sym); return m ? m[1] : null; }
  var RP = {live: null, kr: null, sh: {}};
  function pxOf(r){
    var c6 = code6(r.sym);
    if (c6) return (RP.live || (RP.live = J("archive/x/live_px.json", 300e3))).then(function(L){ var q = L && L.q && L.q[c6]; return q ? {p: q[0], c: q[1], when: (L.date === today() ? "오늘 " : md(L.date) + " ") + L.t, live: L.date === today()} : null; });
    if (typeof opShard !== "function" || typeof OPD === "undefined") return Promise.resolve(null);
    var sh = opShard(r.sym);
    return (RP.sh[sh] || (RP.sh[sh] = getJSON(OPD + "p/" + sh + ".json").catch(function(){ return {}; }))).then(function(P){
      var a = P && P[r.sym]; if (!a) return null; var s = a[6] || [], n = s.length;
      return {p: a[1], c: n >= 2 && s[n - 2] > 0 ? (s[n - 1] / s[n - 2] - 1) * 100 : null, when: md(a[0]) + " 마감"}; });
  }
  function myElsUa(D){
    var my = ls("elsmy"); if (!Array.isArray(my) || !my.length) return [];
    var A = (D.e && D.e.items) || [], P = (D.p && D.p.els) || [];
    return my.map(function(m){ var x = null, i; for (i = 0; i < A.length; i++) if (A[i].id === m.id){ x = A[i]; break; }
      if (!x) for (i = 0; i < P.length; i++) if (P[i].isin === m.id){ x = P[i]; break; }
      return x ? {nm: m.nm, ua: x.ua} : null; }).filter(Boolean);
  }
  function rpBuild(t, D){
    var u = U(), td = today(), st = findStocks(t), R = {t: t.length, st: st, idx: [], els: [], my: [], cond: null, ask: []};
    IDXW.forEach(function(w){ if (w[0].test(t)) R.idx.push(w); });
    var open = ((D.e && D.e.items) || []).filter(function(x){ return x.e && x.e >= td && x.cpn > 0 && x.pv !== true; }), mine = myElsUa(D);
    st.forEach(function(s){ var keys = [s.r.name].concat((s.r.altRaw || []).filter(function(a){ return a.length >= 3; }));
      var L = open.filter(function(x){ return uaHas(x.ua, keys); }), M = mine.filter(function(x){ return uaHas(x.ua, keys); });
      if (L.length || M.length) R.els.push({nm: s.r.name, L: L, M: M}); });
    R.idx.forEach(function(w){ var L = open.filter(function(x){ return uaHas(x.ua, [w[1], w[1].replace(/\d+$/, "")]); }), M = mine.filter(function(x){ return uaHas(x.ua, [w[1]]); });
      if (L.length || M.length) R.els.push({nm: w[2] + "(지수)", L: L, M: M}); });
    var o = numCond(t);
    if (o.rate != null || o.yrs != null){ var P = u.pick(D, o); R.cond = {o: o, top: [P.bond[0], P.els[0], P.fund[0]].filter(Boolean), n: P.bond.length + P.els.length + P.fund.length}; }
    var AL = (window.__gsAsk && __gsAsk.list) || [];
    ASKK.forEach(function(a){ if (R.ask.length < 3 && a[1].test(t) && AL[a[0]]) R.ask.push(a[0]); });
    if (R.els.length && R.ask.indexOf(1) < 0 && R.ask.length < 3) R.ask.push(1);
    return R;
  }
  function elsLine(g){
    var S = g.L.filter(function(x){ return !(x.kind === "ELB" || x.nolos); }), B = g.L.length - S.length;
    var cp = S.map(function(x){ return x.cpn; }), ki = S.map(function(x){ return x.ki; }).filter(function(v){ return v > 0; }), lo = Math.min.apply(null, cp), hi = Math.max.apply(null, cp);
    var sub = [];
    if (S.length) sub.push("ELS " + S.length + " — 조건 맞으면 연 " + (lo === hi ? pc(lo, 1) : pc(lo, 1) + "~" + pc(hi, 1)) + (ki.length ? " · 낙인(KI) " + Math.min.apply(null, ki) + "~" + Math.max.apply(null, ki) : ""));
    if (B) sub.push("ELB(원금 지급) " + B);
    if (g.M.length) sub.push("📌 내 ELS " + g.M.length + "개도 이 기초자산");
    return {left: g.nm + " 기초", right: g.L.length ? "청약 중 " + g.L.length + "개" : "청약 중 없음", sub: sub.join(" · ")};
  }
  var RPC = null;
  function rpHTML(R, PX, MK){
    var u = U(), h = '<div class="rp-hd">📨 <b>답장 한 장</b><small>받은 글 ' + R.t + '자 — 이 화면 안에서만 읽고 저장·전송 안 함 · 한 장엔 원문을 싣지 않음</small></div>';
    if (MK) h += '<div class="rp-mk">' + e(MK) + '</div>';
    if (R.st.length){
      h += '<div class="rp-sec"><small>📈 글에 나온 종목 ' + R.st.length + '</small>' + R.st.map(function(s, i){ var p = PX[i];
        return '<button type="button" class="rp-st" data-rps="' + e(s.r.sym) + '"><span>' + ((window.FLAG || {})[s.r.mkt] || "") + ' <b>' + e(s.r.name) + '</b>' + (s.w !== s.r.name ? '<em>「' + e(s.w) + '」</em>' : '') + '</span>' +
          (p ? '<b class="' + (p.c > 0 ? "up" : p.c < 0 ? "dn" : "") + '">' + e(fmtPx(p.p, s.r.mkt)) + ' ' + (p.c == null ? "" : sg(p.c, 2) + "%") + '<small>' + e(p.when) + '</small></b>' : '<b><small>시세 자료 없음</small></b>') + '</button>'; }).join("") +
        '<p class="rp-n">이름이 둘 이상 겹치거나 다른 종목이면 위 검색 칸을 지우고 정확한 이름으로 찾아 주세요 · 누르면 종목 화면</p></div>';
    }
    if (R.els.length) h += '<div class="rp-sec"><small>🎯 이 종목·지수가 기초자산인 ELS</small>' + R.els.map(function(g){ var l = elsLine(g); return '<div class="rp-el"><span><b>' + e(l.left) + '</b><em>' + e(l.sub) + '</em></span><b>' + e(l.right) + '</b></div>'; }).join("") + '<button type="button" class="ns-go" data-rpj="els">🎯 ELS 탭에서 보기 ›</button></div>';
    if (R.cond && R.cond.top.length) h += '<div class="rp-sec"><small>🔢 글 속 조건 「' + e(u.title(R.cond.o)) + '」 — 위험 낮은 것부터</small><div class="ns-top">' + R.cond.top.map(function(x){ var T = u.rowTxt(x, R.cond.o); return '<div class="ns-c"><small>' + T.h + '</small><b class="ns-big">' + e(T.big) + '</b><span class="ns-nm">' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i></div>'; }).join("") + '</div></div>';
    if (R.ask.length){ var AL = __gsAsk.list; h += '<div class="rp-sec"><small>💬 답이 될 카드</small>' + R.ask.map(function(i){ return AL[i][1].slice(0, 2).map(function(d, j){ return '<button type="button" class="rp-ask" data-rpa="' + i + '_' + j + '">' + e(AL[i][0]) + ' → ' + e(d[0]) + '</button>'; }).join(""); }).join("") + '</div>'; }
    var any = R.st.length || R.els.length || (R.cond && R.cond.top.length);
    h += any ? '<div class="ns-act"><button type="button" class="rp-big">📲 크게 보기 · 한 장</button></div>' : '<div class="gs-hint">글에서 종목·지수·조건(예: 「연 5%」「3년짜리」)을 못 찾았어요. 종목은 정확한 이름(예: SK하이닉스)이면 찾아요.</div>';
    return h + '<p class="ns-n">참고용 · 투자 권유 아님 · 숫자는 앱이 받는 시세(국내 10분)·미래에셋 판매 목록·DART 청약 공시 그대로</p>';
  }
  function rpSheet(R, PX, MK){
    var u = U(), cards = [];
    if (R.st.length) cards.push({t: "l", k: "st", h: "📈 말씀하신 종목 · 지금", lines: R.st.slice(0, 6).map(function(s, i){ var p = PX[i]; return [s.r.name, p ? fmtPx(p.p, s.r.mkt) + " " + (p.c == null ? "" : sg(p.c, 2) + "%") : "자료 없음", p && p.c > 0 ? "up" : p && p.c < 0 ? "dn" : ""]; }),
      note: (PX.filter(Boolean)[0] || {}).when ? "기준 " + PX.filter(Boolean)[0].when + " · 국내 10분 시세 · 해외는 최근 마감" : ""});
    if (R.els.length) cards.push({t: "l", k: "els", h: "🎯 이 기초자산으로 지금 청약 중인 ELS", lines: R.els.slice(0, 4).map(function(g){ var l = elsLine(g); return [l.left, l.right, ""]; }), note: "조건 맞으면 받는 쿠폰 · 못 맞추면 원금 손실 가능(ELB 는 원금 지급)"});
    if (R.cond) R.cond.top.slice(0, cards.length >= 2 ? 1 : 2).forEach(function(x){ var T = u.rowTxt(x, R.cond.o); cards.push({t: "p", k: x.k, h: T.h, big: T.big, nm: T.nm, sub: T.sub, mean: T.mean}); });
    bigOpen({title: "말씀하신 것, 지금 숫자로", sub: MK || "", cards: cards, fn: "답장"});
  }
  function mkLine(){
    return J("archive/x/live_kr.json", 300e3).then(function(K){
      if (!K || !Array.isArray(K.index)) return "";
      var k = K.index.filter(function(x){ return x.name === "코스피"; })[0]; if (!k) return "";
      var on = K.date === today(), up = +K.up, tot = +K.total;
      return (on ? "오늘 " + K.t : md(K.date) + " 마감") + " 코스피 " + Math.round(k.last).toLocaleString() + " " + sg(k.chg, 2) + "%" + (tot ? " · 오른 종목 " + Math.round(up / tot * 100) + "%" : "");
    }).catch(function(){ return ""; });
  }
  function isLong(q){ return q.length >= 20 && (q.match(/\s+/g) || []).length >= 3 && !(U() && U().parse(q)); }
  function rpHook(){
    var o = document.getElementById("gsq"); if (!o || o.dataset.rp) return;
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres"); if (!inp || !res) return; o.dataset.rp = "1";
    var box = document.createElement("div"); box.id = "gsreply"; res.parentNode.insertBefore(box, res);
    var tip = document.createElement("div"); tip.id = "gsrptip"; tip.innerHTML = '<button type="button" class="rp-paste">📋 카톡으로 받은 글 붙여넣기 → 답장 한 장</button>';
    var ask = document.getElementById("gsask"); if (ask) ask.parentNode.insertBefore(tip, ask); else res.parentNode.insertBefore(tip, res);
    var seq = 0;
    function draw(){
      var q = inp.value.trim(), long = isLong(q), num = document.getElementById("gsnum");
      tip.style.display = q ? "none" : "";
      if (!long){ box.innerHTML = ""; box.style.display = "none"; return; }
      res.style.display = "none"; if (num) num.style.display = "none"; if (ask) ask.style.display = "none"; box.style.display = "";
      var my = ++seq; box.innerHTML = '<div class="gs-hint">받은 글에서 종목·상품·숫자 찾는 중…</div>';
      Promise.all([U().nsData(), window.opLoadIdx ? opLoadIdx().catch(function(){}) : null, mkLine()]).then(function(r){
        if (my !== seq) return; var R = rpBuild(q, r[0]), MK = r[2];
        return Promise.all(R.st.map(function(s){ return pxOf(s.r).catch(function(){ return null; }); })).then(function(PX){
          if (my !== seq) return; RPC = {R: R, PX: PX, MK: MK}; box.innerHTML = rpHTML(R, PX, MK);
          try { if (window.ntfyUse) ntfyUse("reply_build"); } catch(z) {} });
      }).catch(function(x){ console.warn(x); if (my === seq) box.innerHTML = '<div class="gs-hint">자료를 못 불러왔어요. 잠시 뒤 다시.</div>'; });
    }
    inp.addEventListener("input", function(){ var n = document.getElementById("gsnum"); if (n && !isLong(inp.value.trim())) n.style.display = ""; draw(); });
    inp.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && isLong(inp.value.trim())){ ev.stopImmediatePropagation(); ev.preventDefault(); inp.blur(); } }, true);
    tip.onclick = function(ev){ ev.stopPropagation();
      var put = function(s){ inp.value = String(s || "").replace(/\s+/g, " ").trim(); inp.dispatchEvent(new Event("input")); draw(); };
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(put).catch(function(){ inp.focus(); tip.innerHTML = '<p class="rp-n">검색 칸을 길게 눌러 「붙여넣기」 해 주세요 — 두 줄 넘는 글이면 답장 한 장이 만들어져요.</p>'; });
      else { inp.focus(); tip.innerHTML = '<p class="rp-n">검색 칸을 길게 눌러 「붙여넣기」 해 주세요.</p>'; } };
    box.addEventListener("click", function(ev){
      var t = ev.target.closest && ev.target.closest("button"); if (!t) return; ev.stopPropagation();
      if (t.dataset.rps){ var g = document.getElementById("gsq"); if (g) g.remove(); document.body.classList.remove("gs-open"); if (window.openOP) openOP(t.dataset.rps); return; }
      if (t.dataset.rpa){ var q = t.dataset.rpa.split("_"), d = __gsAsk.list[+q[0]][1][+q[1]]; __gsAsk.jump(d[1], d[2]); return; }
      if (t.dataset.rpj){ __gsAsk.jump(t.dataset.rpj, "#pdbody"); return; }
      if (t.classList.contains("rp-big") && RPC){ rpSheet(RPC.R, RPC.PX, RPC.MK); return; }
    });
    draw();
  }

  window.__u1105b = {findStocks: findStocks, numCond: numCond, rpBuild: rpBuild, ymPoints: ymPoints, G: G, YM: YM, sendImg: sendImg};   // 검사용

  var T = null;
  function tick(){ T = null; /* 11/05 사용자 「상품에 이 화면들 다 빼 — 더 복잡해 보여」 → 📐 수익률 지도 숨김 */ try { var o = document.getElementById("ymap"); if (o) o.remove(); } catch(x) {} try { rpHook(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".ym4{padding-bottom:10px}.ym-hd{display:flex;align-items:center;justify-content:space-between;cursor:pointer}.ym-hd h3{margin:0;font-size:16px}.ym-hd h3 small{font-weight:500;color:var(--sub);font-size:12.5px;margin-left:4px}.ym-tg{font-size:13px;color:var(--sub)}" +
    ".ym-sub{font-size:12.5px;color:var(--sub);margin:4px 0 6px;word-break:keep-all}.ym-kd,.ym-ps{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}" +
    ".ym-kd{flex-wrap:nowrap;overflow-x:auto}.ym-kd button,.ym-ps button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 9px;font:inherit;font-size:13px;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;gap:5px}" +
    ".ym-kd button:not(.on){opacity:.45}.ym-kd i{box-sizing:border-box;width:10px;height:10px;border-radius:50%;display:inline-block}.ym-ps button{border-style:dashed}" +
    ".ym-cv{margin:6px 0 2px;touch-action:pan-y;user-select:none;-webkit-user-select:none}#ymsvg{display:block;touch-action:pan-y}" +
    ".ym-gl{stroke:var(--line);stroke-width:1}.ym-v{stroke-dasharray:2 3}.ym-tx{fill:var(--sub);font-size:10.5px}.ym-fb{fill:var(--panel2);stroke:var(--line)}.ym-ov{fill:var(--sub);font-size:8px}" +
    ".ym-p{opacity:.85}.ym-p.off{opacity:.18}.ym-p.on{opacity:1}.ym-box{fill:rgba(124,156,255,.14);stroke:#7c9cff;stroke-width:1.5;stroke-dasharray:4 3}.ym-tap{fill:none;stroke:var(--text);stroke-width:2}" +
    ".ym-hint{font-size:12.5px;color:var(--sub);margin:8px 2px;word-break:keep-all}.ym-hint b{color:var(--text)}" +
    ".ym-sh{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;margin:8px 2px 4px;font-size:13.5px}.ym-sh b{flex:1 1 100%;word-break:keep-all}.ym-sh small{color:var(--sub);font-size:12.5px;flex:1}" +
    ".ym-clr{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:4px 10px;font:inherit;font-size:12.5px}" +
    "#ymap .ns-top{padding:4px 0}#ymap .ns-act{padding:6px 0}#ymap .ns-more{margin:4px 0}" +
    ".ym-one{border:1px solid var(--line);border-radius:12px;padding:9px 11px;background:var(--panel2);margin-top:8px}.ym-one small{font-size:12px;color:var(--sub);font-weight:700}.ym-one b{display:block;font-size:19px;font-variant-numeric:tabular-nums}" +
    ".ym-one span{display:block;font-size:13.5px;font-weight:700;word-break:keep-all}.ym-one em,.ym-one i{display:block;font-style:normal;font-size:12px;color:var(--sub);word-break:keep-all}.ym-one i{color:#d99a2b}" +
    ".ym-go{margin-top:8px;width:100%;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px;font:inherit;font-size:13.5px;font-weight:700}" +
    ".ym-n{font-size:11.5px;color:var(--sub);line-height:1.5;margin:8px 2px 0;word-break:keep-all}" +
    "#gsrptip{padding:8px 10px 0}.rp-paste{width:100%;border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}" +
    "#gsreply{max-height:72vh;overflow-y:auto}.rp-hd{padding:10px 12px 4px;font-size:15px}.rp-hd small{display:block;color:var(--sub);font-size:12px;margin-top:2px;word-break:keep-all}" +
    ".rp-mk{margin:4px 10px;padding:8px 10px;border-radius:10px;background:var(--panel2);font-size:13.5px;font-weight:700;font-variant-numeric:tabular-nums}" +
    ".rp-sec{margin:8px 10px;border:1px solid var(--line);border-radius:12px;padding:8px 10px}.rp-sec>small{display:block;font-size:12.5px;font-weight:800;color:var(--sub);margin-bottom:4px}" +
    ".rp-st{display:flex;width:100%;align-items:center;gap:8px;justify-content:space-between;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--text);padding:8px 0;font:inherit;font-size:14px;cursor:pointer}.rp-st:first-of-type{border-top:0}" +
    ".rp-st span{min-width:0;word-break:keep-all}.rp-st em{font-style:normal;color:var(--sub);font-size:12px;margin-left:4px}.rp-st>b{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.rp-st>b small{display:block;font-weight:500;color:var(--sub);font-size:11.5px}" +
    ".rp-st b.up{color:var(--up)}.rp-st b.dn{color:var(--down)}.rp-n{font-size:11.5px;color:var(--sub);margin:4px 0 0;line-height:1.45;word-break:keep-all}" +
    ".rp-el{display:flex;gap:8px;justify-content:space-between;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line);font-size:13.5px}.rp-el:first-of-type{border-top:0}.rp-el span{min-width:0}.rp-el em{display:block;font-style:normal;color:var(--sub);font-size:12px;word-break:keep-all}.rp-el>b{white-space:nowrap}" +
    ".rp-sec .ns-top{padding:4px 0}.rp-ask{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:8px 10px;margin:5px 0;font:inherit;font-size:13.5px;cursor:pointer;word-break:keep-all}" +
    ".yb-l .yb-li{display:flex;justify-content:space-between;gap:10px;font-size:18px;padding:5px 0;border-top:1px solid var(--line)}.yb-l .yb-li:first-of-type{border-top:0}.yb-l .yb-li span{min-width:0;word-break:keep-all}.yb-l .yb-li b{display:inline;font-size:18px;margin:0;white-space:nowrap}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
/* ======== bond_outlook.js ======== */
/* 📄 채권 전망 보고서 (11/05 사용자 「국채·미국채·브라질국채를 선택했을 때 시황에 맞춘 전망 보고서를 매일 아침 미리 만들어 두고 탭하면 바로 — 한 장 + PDF 풀버전」)
   🛍 상품 › 채권 › 🇰🇷 국채 · 🇺🇸 미국채 · 🇧🇷 브라질(헤알·달러) 칸 맨 위에 카드 하나:
     오늘 판정(🟢 담기 좋은 자리 · 🟡 나눠서 담기 · ⚪ 서두를 필요 없음) + 한 줄 + [🖼 한 장] [📑 PDF 풀버전]
   파일은 bond_outlook.py 가 매일 아침(평일 08:05) 미리 만듦 → archive/x/bond_outlook/{ktb,ust,brl}.jpg·.pdf · index.json
   한 장 = 휴대폰 화면 크기 그림(📨 카톡 보내기) · PDF = 앱 안 PDF 보기(pdfBig, 저장 단추 있음) */
(function(){
  var MAP = {gov: "ktb", ust: "ust", brl: "brl", bru: "brl"}, IDX = null, BASE = "archive/x/bond_outlook/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function idx(){ return IDX || (IDX = getJSON(BASE + "index.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ IDX = null; return null; })); }
  function ver(J){ return encodeURIComponent((J && J.at) || ""); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }

  function card(J, k){
    var it = J && J.items && J.items[k];
    if (!it) return '<div class="bo-c bo-none">📄 오늘 전망 보고서는 아침 8시쯤 올라와요.</div>';
    var old = J.date && J.date !== today();
    return '<div class="bo-c" data-bok="' + k + '"><div class="bo-h"><span class="bo-t">📄 ' + e(it.title) + ' 보고서</span><span class="bo-d">' + e(md(J.date)) + ' ' + e(J.edition || "") + (old ? ' · 지난 판' : '') + '</span></div>' +
      '<div class="bo-v"><b style="background:' + e(it.color) + '">' + e(it.tag) + ' ' + e(it.verdict) + '</b><span>📐 ' + e(it.stance) + '</span></div>' +
      '<p class="bo-o">' + e(it.one) + '</p>' +
      '<div class="bo-b"><button type="button" class="bo-one" data-bo1="' + k + '">🖼 한 장 보기<small>휴대폰 한 장 · 바로 보내기</small></button><button type="button" class="bo-pdf" data-bop="' + k + '">📑 PDF 풀버전<small>7쪽 · 차트·시나리오·계산</small></button></div></div>';
  }
  function fill(){
    var s = document.querySelector("#pdbody .bo-slot"); if (!s || s.dataset.done) return;
    var k = MAP[s.dataset.bo]; if (!k) return;
    s.dataset.done = "1";
    idx().then(function(J){ if (document.body.contains(s)) s.innerHTML = card(J, k); });
  }
  function oneOpen(k){
    idx().then(function(J){
      var it = J && J.items && J.items[k]; if (!it) return;
      var url = BASE + k + ".jpg?v=" + ver(J), d = document.createElement("div");
      d.className = "bo-ov";
      d.innerHTML = '<div class="bo-top"><button type="button" class="bo-x" aria-label="닫기">✕</button><b>' + e(it.title) + ' · 한 장</b><span style="flex:1"></span><button type="button" class="bo-send">📨 보내기</button></div><div class="bo-img"><img alt="" src="' + url + '"></div>';
      document.body.appendChild(d); document.body.classList.add("sheet-open");
      var close = function(){ d.remove(); document.body.classList.remove("sheet-open"); };
      d.querySelector(".bo-x").onclick = close;
      d.querySelector(".bo-send").onclick = function(){
        var b = this; b.textContent = "준비 중…";
        fetch(url).then(function(r){ return r.blob(); }).then(function(bl){
          var name = it.title.replace(/^\S+\s/, "").replace(/\s/g, "_") + "_" + (J.date || "") + ".jpg", f = new File([bl], name, {type: "image/jpeg"});
          if (navigator.canShare && navigator.canShare({files: [f]})) return navigator.share({files: [f]});
          var a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = name; document.body.appendChild(a); a.click(); a.remove();
        }).catch(function(){}).then(function(){ b.textContent = "📨 보내기"; });
      };
    });
  }
  function pdfOpen(k){
    idx().then(function(J){
      var it = J && J.items && J.items[k]; if (!it) return;
      var url = BASE + k + ".pdf?v=" + ver(J);
      if (window.pdfBig) pdfBig(url, it.title + " 보고서 " + md(J.date)); else window.open(url, "_blank");
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-bo1],[data-bop]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    if (t.dataset.bo1) oneOpen(t.dataset.bo1); else pdfOpen(t.dataset.bop);
  }, true);
  var T = null;
  new MutationObserver(function(){ if (!T) T = setTimeout(function(){ T = null; try { fill(); } catch(x) {} }, 60); }).observe(document.documentElement, {childList: true, subtree: true});
  window.__bondOutlook = {card: card, idx: idx};   // 검사용

  var css = document.createElement("style");
  css.textContent =
    ".bo-c{background:linear-gradient(135deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:18px;padding:14px 14px 12px;margin:0 0 12px}" +
    ".bo-none{color:var(--sub);font-size:13.5px}" +
    ".bo-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.bo-t{font-weight:800;font-size:15.5px}.bo-d{color:var(--dim);font-size:12.5px;white-space:nowrap}" +
    ".bo-v{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:9px 0 6px}.bo-v b{color:#fff;font-size:13.5px;border-radius:999px;padding:4px 11px}.bo-v span{font-size:12.5px;color:var(--sub)}" +
    ".bo-o{margin:0 0 10px;font-size:14px;line-height:1.55;color:var(--text)}" +
    ".bo-b{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bo-b button{appearance:none;border:0;border-radius:14px;padding:11px 10px;font:inherit;font-weight:800;font-size:14.5px;color:#fff;cursor:pointer;text-align:left}" +
    ".bo-b button small{display:block;font-weight:500;font-size:11.5px;opacity:.85;margin-top:2px}.bo-one{background:#2f6fdf}.bo-pdf{background:#334155}" +
    ".bo-ov{position:fixed;inset:0;z-index:2147483000;background:#05080f;display:flex;flex-direction:column}" +
    ".bo-top{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;color:#fff}.bo-top b{font-size:15px}" +
    ".bo-top button{appearance:none;border:0;border-radius:12px;padding:8px 12px;font:inherit;font-weight:800;color:#fff;background:rgba(255,255,255,.14)}.bo-top .bo-send{background:#fee500;color:#191919}" +
    ".bo-img{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:0 10px calc(env(safe-area-inset-bottom,0px) + 14px)}.bo-img img{display:block;width:100%;max-width:560px;margin:0 auto;border-radius:14px}";
  document.head.appendChild(css);
})();
;
/* ======== ux1105c.js ======== */
/* 🔰 11/05 사용자 「여전히 어플이 너무 복잡하고 어떻게 쓰는지 모르겠다는 의견 — 더 심플하고 쉬워서 우와」 → 13가지 「다 진행해」
   원칙: 아무것도 지우지 않음 — 숨기기 · 옮기기 · 이름 바꾸기만. 「☰ 전체 메뉴」 한 번이면 지금까지의 화면이 그대로 다 나옴.
   ① 첫 화면 = 신호등 한 장 + 한 문장 + 버튼 하나 (나머지 오늘 화면은 「오늘 자세히 보기 ▾」 아래)
   ② 쉬운 화면(기본) ⇄ 전체 메뉴 — 쉬운 화면은 아래 탭 3개 + ☰ 전체 · 끄기: localStorage ezmode = "pro" (주소 ?ez=0 / 다시 ?ez=1)
   ③ 탭 이름을 질문으로 — 오늘 어때? · 뭐 살까? · 고객 제안
   ④ 접기 — 쉬운 화면에선 신호·상품 탭 카드도 처음엔 제목 한 줄(calm.js 가 window.__ezFold 를 봄)
   ⑤ 용어 — easy.js 에 200일선 → 장기 평균선 더함 · 판단은 🟢🟡🔴 하나
   ⑥ 🙋 뭐 보지? (아래 탭 바) — 어느 화면에서든 8가지 중 고르면 그 화면으로
   ⑦ 하루 카드 3장 — 첫 화면에 ☀️ 아침 · ⚡ 장중 · 🌙 마감 중 지금이 어디인지 (앱 알림은 push.js 다이어트 그대로 하루 2번)
   ⑧ 제안서 4단계 — 성향 → 상품 → 이름·금액 → 만들기, 지금 할 단계를 위에 띄우고 누르면 그 칸으로
   ⑨ 화면당 큰 버튼 하나 — 첫 화면은 「📨 고객에게 오늘 한 장」
   ⑩ 큰 글씨 — 첫 화면 18px 이상 · 운세·사주·타로·로또는 맨 아래 서랍
   ⑪ 첫 방문 3장 안내(한 번만) ⑫ 막히는 곳 재기 — 5초 안에 떠난 화면 · 뒤로 누른 화면을 사용 현황(usage.js)에 같이 셈
   ⑬ 첫 화면 맨 위 「🔄 15:07 장중 갱신」
   숫자는 pbbrief(오늘 한 장) 자료 그대로 — 지어내지 않음 · 사라·팔라는 말 없음 */
(function(){
  var D = document.documentElement, K = "ezmode";
  try { var qm = /[?&]ez=(\d)/.exec(location.search); if (qm) localStorage.setItem(K, qm[1] === "0" ? "pro" : "easy"); } catch(x) {}
  function EZ(){ try { return !(navigator.webdriver && localStorage.getItem(K) === "pro"); } catch(x) { return true; } }   // (자동 검진(health.py·ui_audit)만 예전처럼 카드를 펼친 화면으로 봄 — 사람에겐 늘 한 화면)  🧊 11/12 한 화면 — 쉬운/전체 두 모드를 없앰(지도 두 장 → 한 장). 예전 전체 메뉴에만 있던 화면은 아래 5칸과 🔬 연구실로
  function setMode(m){ try { localStorage.setItem(K, m); } catch(x) {} apply(); if (typeof window.go === "function" && window.cur) go(m === "easy" && !inEasy(window.cur) ? "home" : window.cur); }
  window.ezMode = function(m){ if (m) setMode(m === "pro" ? "pro" : "easy"); return EZ() ? "easy" : "pro"; };
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function num(s){ return s == null ? null : +String(s).replace("−", "-"); }
  function sg(v){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(1); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  /* 🧊 11/09 ⑫ 첫 방문 「나는 누구?」 1탭 — PB / 투자자 / 구경 → 첫 화면 큰 버튼(오늘 할 일)과 🙋 순서가 바뀜 */
  function ROLE(){ return ls("ez_role") || ""; }
  var ROLES = [["pb", "👔", "PB", "고객에게 보낼 것 먼저"], ["inv", "📈", "투자자", "뭘 살지 먼저"], ["look", "👀", "구경", "가볍게 둘러보기"]];
  window.__ezRole = function(force){ if (force){ ls("ez_role", null); try { localStorage.removeItem("ez_role"); } catch(x) {} HB = 0; if (cur() !== "home" && window.go) go("home"); setTimeout(tick, 50); } return ROLE(); };
  function roleHtml(){
    return '<div class="ez-role"><b>어떤 분이세요?</b><small>고르면 첫 화면이 맞춰져요 · 🙋 에서 언제든 바꿈</small><div>' +
      ROLES.map(function(r){ return '<button type="button" data-role="' + r[0] + '"><span>' + r[1] + '</span>' + r[2] + '<small>' + r[3] + '</small></button>'; }).join("") + '</div></div>';
  }
  document.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-role]"); if (!b) return; ev.stopPropagation(); ls("ez_role", b.dataset.role); HB = 0; tick(); });
  // ⑬ 오늘 할 일 1개 — 역할·장 상태에 맞춘 행동 하나
  function todo(o){
    var r = ROLE();
    if (r === "inv") return '<button type="button" class="ez-cta' + (o.red ? ' red' : '') + '" data-ezgo="port">' + (o.red ? '💼 하락장 규칙대로 비중 확인하기' : '💼 지금 뭘 얼마나 사나 보기') + '</button>';
    if (r === "look") return '<button type="button" class="ez-cta" data-ezask="1">🙋 궁금한 것 골라 보기</button>';
    // 🧩 11/12 사용자 「통일성이 없지? 고객에게 한 장으로 통일하자」 — 이름·색 하나로 (하락장이면 한 장 안에 하락장 안내가 저절로 들어감)
    return '<button type="button" class="ez-cta" data-pbsend="1">📨 고객에게 한 장 보내기</button>';
  }
  document.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-ezask]"); if (!b) return; ev.stopPropagation(); help(); });
  var EASY_TABS = {home: 1, port: 1, score: 1, prop: 1, luck: 1, saju: 1, tarot: 1, lotto: 1};
  function inEasy(k){ return !!EASY_TABS[k]; }

  /* ── ④ calm.js 가 쉬운 화면에서 더 접을 탭 ── */
  window.__ezFold = function(tab){ return EZ() && /^(whale|cup|gap|screen|sigmore|bond|fund|els|feed)$/.test(tab || ""); };

  /* ── ② ③ 아래 탭 바 ── */
  function bar(){   // 🧊 11/12 아래 탭은 nav2.js 의 할 일 5칸 그대로 — 예전 「☰ 전체 메뉴」 단추는 치움
    var all = document.getElementById("ezall"); if (all) all.remove();
  }

  /* ── ① ⑦ ⑨ ⑬ 첫 화면 한 장 ── */
  var B = null, BT = 0;
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function gj5(u, ttl){ if (!window.getJSON) return Promise.resolve(null); var q5 = Math.floor(Date.now() / 300000); return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + q5, {ttl: ttl || 300000}).catch(function(){ return null; }); }
  function brief(){
    if (B && Date.now() - BT < 300000) return Promise.resolve(B);
    var p = window.__pbbrief ? window.__pbbrief() : gj5("archive/x/pbbrief.json");
    // 🧊 11/09: 신호등 판정에 🐻 하락장 계기판 · 적중률(scores) · 지수 값(live_kr·선물) · 바뀐 것(home.json) 같이
    return Promise.all([Promise.resolve(p).catch(function(){ return null; }), gj5(RM + "bear.json"), gj5(RM + "scores.json", 900000), gj5("archive/x/live_kr.json", 120000), gj5("archive/x/live_us_pre.json", 120000), gj5(RM + "home.json"), gj5(RM + "bubble.json", 900000)])
      .then(function(r){ var d = r[0]; if (d){ d = Object.assign({}, d, {_bear: r[1], _sc: r[2], _kr: r[3], _fut: r[4], _home: r[5], _bub: r[6]}); B = d; BT = Date.now(); } return d || B; }).catch(function(){ return B; });
  }
  window.__ezBrief = function(){ return B; };
  function read(b){
    var t = (b.talk || []).join(" · "), plan = ((b.advice && b.advice.plan) || []).join(" "), m;
    var o = {};
    if ((m = /코스피 ([\d,]+(?:\.\d+)?)\(([+−\-]?\d+(?:\.\d+)?)%\)/.exec(t))) { o.kv = m[1]; o.k = num(m[2]); }
    else if ((m = /코스피 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) o.k = num(m[1]);
    if ((m = /코스닥 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) o.q = num(m[1]);
    if ((m = /S&P500 선물 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) { o.s = num(m[1]); o.sl = "S&P500 선물"; }
    else if ((m = /S&P500 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) { o.s = num(m[1]); o.sl = "S&P500"; }
    o.up = /200일 평균 위|200일선 위/.test(plan) ? true : /200일 평균 아래|200일선 아래/.test(plan) ? false : null;
    // 🧊 11/09 ⑩ 지수 값은 실시간 표(live_kr · 선물)에서 — 세 칸 모두 「%+값」
    var KR = b._kr, today_ = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    if (KR && KR.date === today_ && KR.index){ KR.index.forEach(function(x){ if (x.name === "코스피"){ o.k = x.chg; o.kv = Math.round(x.last).toLocaleString(); } if (x.name === "코스닥"){ o.q = x.chg; o.qv = (Math.round(x.last * 10) / 10).toLocaleString(); } }); }
    var FU = b._fut && b._fut.date === today_ ? (b._fut.fut || []).filter(function(f){ return f.name === "S&P500 선물"; })[0] : null;
    if (FU && o.sl === "S&P500 선물"){ o.s = FU.chg; o.sv = Math.round(FU.last).toLocaleString(); }
    // 🧊 11/09 ④ 하락장 계기판(종가 판정)이 신호등의 바탕 — 코스피·S&P 중 하나라도 🐻면 🔴, 🟡(조정)이면 🟡. 오늘 등락은 작은 글로만
    var BM = {}; ((b._bear && b._bear.markets) || []).forEach(function(m){ BM[m.key] = m; }); o.bear = BM;
    var kb = BM.kospi, sb = BM.sp500, day = o.k != null ? "오늘 코스피 " + sg(o.k) : o.s != null ? "오늘 " + o.sl + " " + sg(o.s) : "";
    var big = o.k != null ? o.k : o.s;
    if ((kb && kb.state === "🐻") || (sb && sb.state === "🐻")){ var w = kb && kb.state === "🐻" ? kb : sb;
      o.L = ["r", "🔴", "조심하는 장", w.name + " 하락장 · 고점보다 " + sg(w.dd) + (day ? " · " + day : "")]; o.red = w; }
    else if (o.up === false) o.L = ["r", "🔴", "조심하는 장", "큰 흐름이 아래로 꺾여 있어요"];
    else if ((kb && kb.state === "🟡") || (sb && sb.state === "🟡")){ var w2 = kb && kb.state === "🟡" ? kb : sb;
      o.L = ["y", "🟡", "흔들리는 장", w2.name + " 조정 · 고점보다 " + sg(w2.dd) + (day ? " · " + day : "")]; o.yel = w2; }
    else if ((o.k != null && o.k <= -2) || (o.s != null && o.s <= -1.5)) o.L = ["y", "🟡", "흔들리는 날", o.up ? "큰 흐름은 아직 위예요" : "오늘은 크게 출렁여요"];
    else if (big != null && big >= 0.5) o.L = ["g", "🟢", "좋은 날", o.up ? "큰 흐름도 위예요" : "오늘은 오르고 있어요"];
    else o.L = ["g", "🟢", "무난한 날", o.up ? "큰 흐름은 위예요" : "크게 움직이지 않아요"];
    // ⑤ 장 시작 30분(09:00~09:30)은 노이즈 — 「전날 마감 기준」 꼬리표 · 뉴스 톤과 신호등이 엇갈리면 ⚠ 한 줄
    var hm = new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 16), wd = new Date(Date.now() + 9 * 3600e3).getUTCDay();
    o.early = wd > 0 && wd < 6 && hm >= "09:00" && hm < "09:30";
    var bad = /투매|급락|폭락|공포|패닉|충격|손실|붕괴|매도 폭탄|반대매매/.test(String(b.one || "")), good = /급등|랠리|신고가|폭등|환호/.test(String(b.one || ""));
    o.mix = (o.L[0] === "g" && bad) ? "뉴스는 나쁜데 지수는 버티는 중 — 엇갈릴 땐 서두르지 않기" : (o.L[0] === "r" && good) ? "뉴스는 좋은데 큰 흐름은 아직 아래 — 하루 반등에 서두르지 않기" : "";
    var rd = String((b.advice && b.advice.read) || "").split(/(?:[.!?])\s+/).map(function(x){ return /[.!?]$/.test(x) ? x : x + "."; }).filter(function(x){ return x.trim(); });
    o.act = rd.length ? rd[rd.length - 1] : (((b.advice && b.advice.plan) || [])[1] || "");
    var md = String(b.mode || b.label || "");
    o.ph = /마감|장 끝|저녁/.test(md) ? 2 : /장중/.test(md) ? 1 : 0;
    return o;
  }
  // ③ 적중률 한 줄 — 신호등 바로 밑 (시황 예고 채점 · scores.json)
  function hitHtml(S){
    var r = S && (S.rows || []).filter(function(x){ return x.k === "report"; })[0]; if (!r || !r.n) return "";
    var hi = ((r.cal && r.cal.buckets) || []).filter(function(x){ return /^[789]0%/.test(x.bucket); }), hn = 0, hh = 0; hi.forEach(function(x){ hn += x.n; hh += x.hit; });
    return '<p class="ez-hit" data-ezgo="score">🎯 시황 예고 적중 <b>' + r.rate + '%</b> (' + r.n + '건)' + (hn >= 10 ? ' · 「70% 이상」이라 한 예고는 <b>' + Math.round(hh / hn * 100) + '%</b>' : '') + ' <i>성적표 ›</i></p>';
  }
  // ④ 🔴이 되면 / 🔴일 때 — 규칙을 미리 (하락장 계기판 · 바닥 신호)
  function ruleHtml(o, BR){
    var w = o.red || o.yel, M = (BR && BR.markets) || [];
    if (w){
      var ck = (w.checks || []), F_ = w.rule && w.rule.id === "F", nu = w.nuse || ck.length, on = ck.filter(function(c){ return c.on && (c.use == null || c.use); }).length;   // 🌱 11/09 시장별 다시 사기 규칙
      var tail = (w.analog ? '다음: ' + w.analog.next : w.rule && w.rule.id === "OFF" ? '현금 규칙 꺼 둠' : (w.rule && !w.nuse) || F_ ? '판정 풀릴 때까지' : '다시 사는 조건 ' + on + '/' + nu) + (window.__meetTail ? __meetTail(w) : '');   // 📏 11/13 A11/13-1 꼬리 「그대로면 약 1/8」(ux1113.js)
      return '<details class="ez-rule"><summary>' + (o.red ? '🔴 지금 규칙 · ' + (w.to || '현금') + ' ' + (w.cash || 0) + '%까지 · ' + tail : '🟡 지금 규칙 · ' + tail) + '</summary>' +
        '<p>' + e(w.advice || (BR && BR.lead) || "") + '</p>' + (window.__meetHtml ? __meetHtml(w, BR) : '') + (window.__bearSigHead ? __bearSigHead(w) : '') + '<ul>' + ck.map(function(c, k){ return '<li class="' + (c.on ? "on" : "") + '">' + (c.on ? "✅" : "⬜") + ' ' + e(c.k) + (c.use === false ? ' <em class="ez-ref">참고</em>' : '') + ' <small>' + e(c.d) + '</small>' + (window.__bearSigLine ? __bearSigLine(w, k) : '') + '</li>'; }).join("") + '</ul>' +
        '<p class="ez-rule-n">' + (w.rule ? '다시 사는 규칙(' + e(w.name) + '): ' + e(w.rule.name) : '') + ' · 종가 판정 · 사라·팔라는 뜻 아님</p></details>';
    }
    return '<details class="ez-rule"><summary>🔴이 되면 이렇게 바뀌어요</summary><p>코스피나 S&P500이 고점보다 <b>−20%</b>(종가)면 🔴 하락장, <b>−10%</b>면 🟡 조정이에요. 얼마나 들고 있을지는 🔁 닮은 장 규칙이 시장마다 정해요(지금 장과 닮았던 과거 12번에서 가장 나았던 방식).</p>' +
      '<p>지금: ' + M.map(function(m){ return m.state + ' ' + e(m.name) + ' ' + sg(m.dd); }).join(" · ") + '</p><p class="ez-rule-n">⚡ 공격 포트는 종목마다 −5%면 손절 · 판정은 종가</p></details>';
  }
  function redAct(w){ if (w.analog) return w.name + " 하락장 — " + w.analog.rule + " · 지금 주식 " + w.analog.stock + "% · 다음: " + w.analog.next; return w.name + " 하락장 — 현금 " + (w.cash || 30) + "%까지 늘리고 새로 사지 않기. 단, 이미 크게 빠졌으니 투매는 금지 · 반등 때 나눠 덜기."; }
  // ⑯ 비중이 바뀐 날 「달라진 것 1개 + 이유 1줄」 (home.json port.change)
  function chgHtml(H){
    var c = H && H.port && H.port.change; if (!c || !c.why) return "";
    var td = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), ago = (Date.parse(td) - Date.parse(c.date)) / 864e5; if (!(ago >= 0 && ago <= 2)) return "";
    var parts = String(c.why).split(" — "), first = parts[0].split(" · ")[0].replace(/^🧭\s*/, ""), why = (parts[0].split(" · ")[1] || "").replace(/\(.*$/, "").trim();
    return '<div class="ez-chg" data-ezgo="port"><small>🔁 ' + (ago === 0 ? "오늘" : String(c.date).slice(5).replace("-", "/")) + ' 포트에서 달라진 것</small><p>' + e(first.slice(0, 60)) + '</p>' + (why ? '<em>이유: ' + e(why.slice(0, 70)) + '</em>' : '') + '</div>';
  }
  /* 🧹 11/11 첫 화면 간결화 9가지 (사용자 「첫 화면이 좀 어수선 — 더 간결하게」 → 「다 진행해」) — 지운 기능 없음 · 자리만 옮김
     ① 한 장 규칙: 신호등(결론 포함) · 숫자 3개 · 버튼 하나 = 스크롤 없이 한 화면
     ② 신호등 + 🧭 결론 합침(국내·해외 두 줄이 신호등 안으로) ③ 🐻 규칙·🫧 버블은 경보일 때만 신호등 밑 한 줄
     ④ 나머지(뉴스·수급·적중률·달라진 것·내 종목·대형주·이번 주·고객 질문)는 「한 줄 목록」 — 누르면 펼침
     ⑤ 맨 위 회색 한 줄 ⑥ 첫 화면 색은 신호등 색 하나 · 이모지 줄당 하나 ⑦ 시간대별로 목록 맨 위가 바뀜(아침 뉴스·이번 주 / 장중 수급·대형주 / 마감 성적·달라진 것)
     ⑧ 자리 미리 잡기(늦게 오는 칸 높이 고정) ⑨ 첫 화면엔 버튼 하나 — 머리줄 📨 · 떠 있는 단추 숨김 */
  var PHN = ["아침", "장중", "마감"];
  function warnHtml(o, BR, BU){
    var s = "";
    if (o.red || o.yel) s += ruleHtml(o, BR).replace(/<summary>(?:🔴|🟡) 지금 규칙 · (?:현금 \d+%까지 · )?/, "<summary>📏 언제 다시 사나 · ");   // 🐻 경보일 때만 규칙 한 줄(펼치면 다시 사는 조건) — 현금 % 는 바로 위 결론 줄과 같은 말이라 뺌
    if (BU && (BU.credit_on || (BU.red || 0) >= 3)) { var CK = window.__bubClock ? __bubClock(BU) : null;   // 🕰 11/11 버블 시계 한 줄
      s += '<button type="button" class="ez-warn" data-ezbub="1">' + (CK ? '🫧 버블 시계 ' + e(CK.label) + (BU.credit_on ? ' · 신용 경보' : '') : '🫧 버블 경보 켜짐' + (BU.flow ? ' · ' + e(BU.flow) : '')) + ' <i>›</i></button>'; }
    if (o.mix) s += '<p class="ez-warn ez-warn-y">⚠ ' + e(o.mix) + '</p>';
    return s;
  }
  function heroHtml(b){
    var o = read(b), N = [];
    if (o.k != null) N.push(["코스피", o.kv || "", o.k]);
    if (o.q != null) N.push(["코스닥", o.qv || "", o.q]);
    if (o.s != null) N.push([o.sl, o.sv || "", o.s]);
    return '<p class="ez-top">' + e(String(b.asof || b.at || "").slice(11, 16) || b.label || "") + ' 갱신 · ' + PHN[o.ph] + (o.early ? ' · 09:30 전이라 전날 마감 기준' : '') + '</p>' +
      '<div class="ez-light ' + o.L[0] + '"><div class="ez-lh"><b>' + o.L[1] + '</b><div><strong>' + e(o.L[2]) + '</strong><em>' + e(o.L[3].replace(/ · 오늘 .*$/, "")) + '</em></div></div>' +
        '<div data-vd class="vd-mini"></div>' +   /* 🧭 결론 두 줄(verdict.js)이 신호등 안으로 */
        warnHtml(o, b._bear, b._bub) + '</div>' +
      (window.__rebCard ? __rebCard(b._bear, o.k, "ez") : '') +   // 📨 반등 날에만
      (N.length ? '<div class="ez-nums">' + N.slice(0, 3).map(function(n){ return '<div><small>' + e(n[0]) + '</small><b class="' + cl(n[2]) + '">' + sg(n[2]) + '</b>' + (n[1] ? '<em>' + e(n[1]) + '</em>' : '') + '</div>'; }).join("") + '</div>' : '') +
      todo(o);   /* 🧊 11/12 「어떤 분이세요?」 질문 없앰 — 안 고른 사람은 한 장 보내기 */
  }
  // ④ ⑦ 한 줄 목록 — 시간대(아침 0 · 장중 1 · 마감 2)마다 맨 위가 바뀜
  var ROWORD = {act: [1, 2, 4], news: [0, 3, 5], flow: [3, 0, 2], hit: [5, 5, 0], chg: [4, 4, 1], rule: [6, 6, 6]};
  var MNORD = {mncal: [0, 3, 3], mnwhy: [2, 0, 1], mnwl: [1, 1, 2], mnqa: [3, 2, 0]};
  function rowsHtml(b){
    var o = read(b), ph = o.ph, R = [];
    function row(k, h){ R.push('<div class="ez-row" style="order:' + ROWORD[k][ph] + '">' + h + '</div>'); }
    if (o.act && !o.red) row("act", '<button type="button" class="ez-r ez-clamp" data-ezclamp="1"><small>그래서 오늘은</small>' + e(o.act) + '</button>');
    if (b.one) row("news", '<button type="button" class="ez-r ez-clamp" data-ezclamp="1"><small>오늘 뉴스</small>' + e(String(b.one).split(" ｜ ").pop()) + '</button>');
    row("flow", '<div data-flow class="ez-flow"><span class="ez-r ez-ph">외국인·기관 수급 불러오는 중…</span></div>');
    var S = b._sc && (b._sc.rows || []).filter(function(x){ return x.k === "report"; })[0];
    if (S && S.n) row("hit", '<button type="button" class="ez-r" data-ezgo="score"><small>시황 예고 적중</small><b>' + S.rate + '%</b> · ' + S.n + '건 <i>›</i></button>');
    var c = b._home && b._home.port && b._home.port.change;
    if (c && c.why){ var td = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), ago = (Date.parse(td) - Date.parse(c.date)) / 864e5;
      if (ago >= 0 && ago <= 2) row("chg", '<button type="button" class="ez-r ez-clamp" data-ezgo="port"><small>' + (ago === 0 ? "오늘" : String(c.date).slice(5).replace("-", "/")) + ' 포트에서 달라진 것</small>' + e(String(c.why).split(" — ")[0].split(" · ")[0].replace(/^🧭\s*/, "").slice(0, 60)) + ' <i>›</i></button>'); }
    if (!o.red && !o.yel) row("rule", ruleHtml(o, b._bear).replace('class="ez-rule"', 'class="ez-rule ez-r"'));
    return '<p class="ez-rh">오늘 한 줄씩 <small>' + ["아침엔 뉴스·일정 먼저", "장중엔 수급·대형주 먼저", "마감엔 성적·달라진 것 먼저"][ph] + '</small></p><div class="ez-rows">' + R.join("") + '</div>';
  }
  window.__ezPh = function(){ return B ? read(B).ph : 0; };
  var HB = 0;
  function home(){
    var main = document.getElementById("main"), hb = document.getElementById("hmbody");
    var h = document.getElementById("ezhero"), more = document.getElementById("ezmore"), pl = document.getElementById("ezpro");
    if (cur() !== "home" || !main || !hb){ return; }
    if (!EZ()){
      if (h) h.remove(); if (more) more.remove(); hb.classList.remove("ez-open"); var rw0 = document.getElementById("ezrows"); if (rw0) rw0.remove();
      if (!pl){ pl = document.createElement("button"); pl.id = "ezpro"; pl.type = "button"; pl.textContent = "🔰 쉬운 화면으로 보기"; pl.onclick = function(){ setMode("easy"); }; hb.parentNode.insertBefore(pl, hb); }
      return;
    }
    if (pl) pl.remove();
    if (!h){ h = document.createElement("section"); h.id = "ezhero"; h.className = "ez-hero"; h.setAttribute("data-noemo", "1"); h.innerHTML = '<div class="ez-load ez-skel"><i></i><i></i><i></i></div>'; hb.parentNode.insertBefore(h, hb); HB = 0; }
    if (!more){
      more = document.createElement("div"); more.id = "ezmore";
      more.innerHTML = '<button type="button" class="ez-open">▾ 오늘 자세히 보기 <small>5개 시장 · 오늘의 발견 · 업종 지도 · 1탭 예측</small></button>' +
        '';   /* 🧊 11/12 🎁 더보기(운세·사주·타로·로또) 서랍은 🔬 연구실로 */
      h.insertAdjacentElement("afterend", more);
      more.querySelector(".ez-open").onclick = function(){ var o = hb.classList.toggle("ez-open"), btn = this, t0 = btn.getBoundingClientRect().top, end = Date.now() + 3000, D_ = document.documentElement, stop = function(){ end = 0; D_.removeAttribute("data-ezpin"); };
        /* 🔧 11/13 자가 업그레이드: rAF 붙잡기만으론 큰 자료(상품·나침반)를 읽느라 화면이 바쁠 때 한 박자 늦어 단추가 위로 튐(건강검진 502→172px) → 손가락·휠로 움직이기 전까지(최대 20초 — 늦게 오는 큰 자료가 3초 넘어 도착) 브라우저 스크롤 기준점(overflow-anchor)을 이 단추 하나로 — 위·아래 칸이 늘거나 줄어도 브라우저가 직접 단추 자리를 지킴 */
        D_.setAttribute("data-ezpin", "1"); clearTimeout(window.__ezPinT); window.__ezPinT = setTimeout(function(){ D_.removeAttribute("data-ezpin"); }, 20000); addEventListener("pointerdown", stop, {once: true, passive: true}); addEventListener("keydown", stop, {once: true});   /* class 는 다른 코드가 className 을 통째로 바꿔 지워져서 data- 속성으로 */
        /* 🔧 11/10 자가 업그레이드: 신호등이 막 그려진 뒤 바로 누르면 위 칸(🧭 결론·🧲 수급 등)이 늦게 채워지며 단추가 아래로 밀리던 것(건강검진 383→1802px) → 3초 동안 단추 자리를 붙잡음 · 손가락으로 움직이면 바로 놓음 */
        addEventListener("touchstart", stop, {once: true, passive: true}); addEventListener("wheel", stop, {once: true, passive: true});
        (function pin(){ if (!btn.isConnected) return; var d = btn.getBoundingClientRect().top - t0; if (Math.abs(d) > 2) scrollBy(0, d); if (Date.now() < end) requestAnimationFrame(pin); })(); if (o && window.__h2apply) setTimeout(window.__h2apply, 30); this.innerHTML = o ? "▴ 접기" : '▾ 오늘 자세히 보기 <small>5개 시장 · 오늘의 발견 · 업종 지도 · 1탭 예측</small>'; };   /* 🔧 11/05 자가 업그레이드: 펼칠 때 화면을 hb 맨 위로 끌어 「▴ 접기」가 화면 밖(383→−189px)으로 튀던 것 → 누른 단추 제자리, 내용은 바로 아래 */
    }
    // 🧹 11/11 ④ 한 줄 목록은 신호등 상자 바로 아래(내 종목·대형주·이번 주·고객 질문 칸 #mnbox 보다 위)
    var rw = document.getElementById("ezrows");
    if (!rw){ rw = document.createElement("section"); rw.id = "ezrows"; rw.setAttribute("data-noemo", "1"); rw.innerHTML = '<p class="ez-rh">오늘 한 줄씩</p><div class="ez-rows"><div class="ez-row"><span class="ez-r ez-ph">불러오는 중…</span></div></div>'; }
    var jm_ = document.getElementById("jobmap"), an_ = jm_ && jm_.previousElementSibling === h ? jm_ : h;   // 🧊 11/12 「할 수 있는 일」 지도(ux1112.js)가 신호등 바로 아래 · 한 줄 목록은 그 아래
    if (an_.nextElementSibling !== rw) an_.insertAdjacentElement("afterend", rw);
    mnFold();
    if (Date.now() - HB > 60000){ HB = Date.now();
      brief().then(function(b){ var x = document.getElementById("ezhero"), y = document.getElementById("ezrows"); if (!x) return; var ok = b && (b.one || b.talk);
        x.innerHTML = ok ? heroHtml(b) : '<div class="ez-load">아직 오늘 자료가 안 올라왔어요 · 아래 「오늘 자세히 보기」를 눌러 주세요</div>';
        if (y) y.innerHTML = ok ? rowsHtml(b) : '';   /* 참고용 문구는 화면 맨 아래 공통 고지가 맡음 */
        x.classList.add("ez-done"); }); }
  }

  /* 🧹 11/11 ④ ⑦ 내 종목·대형주·이번 주·고객 질문(#mnbox, mine.js) — 쉬운 첫 화면에선 제목 한 줄씩, 누르면 펼침 · 시간대별 순서 */
  var MNOPEN = {};
  function mnFold(){
    var m = document.getElementById("mnbox"); if (!m || !EZ()) return;
    var ph = window.__ezPh ? __ezPh() : 0;
    [].forEach.call(m.children, function(c){ if (!c.id) return; c.classList.add("ez-f"); c.classList.toggle("ez-x", !!MNOPEN[c.id]); if (MNORD[c.id]) c.style.order = MNORD[c.id][ph]; });
  }
  document.addEventListener("click", function(ev){
    if (!EZ() || !ev.target.closest) return;
    var h = ev.target.closest("#mnbox .ez-f > h3");
    if (h && !ev.target.closest(".gd,.gdk,[data-gd],img")){ var c = h.parentNode; MNOPEN[c.id] = !MNOPEN[c.id]; c.classList.toggle("ez-x", MNOPEN[c.id]); ev.stopPropagation(); return; }
    var k = ev.target.closest("[data-ezclamp]"); if (k){ k.classList.toggle("ez-open1"); return; }
    var bb = ev.target.closest("[data-ezbub]"); if (bb){ ev.stopPropagation();   // 🫧 버블 경보 → 「오늘 자세히 보기」를 열고 버블 경보판으로
      var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open"); if (hb && !hb.classList.contains("ez-open") && op) op.click();
      var n = 0; (function seek(){ var x = document.getElementById("bubble"); if (x){ x.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++n < 20) setTimeout(seek, 250); })(); }
  }, true);
  function homeFlag(){ D.classList.toggle("ez-home", EZ() && cur() === "home"); }

  /* ── ⑥ 🙋 뭐 보면 돼요? ── */
  var ASK = [
    ["home", "🌤", "오늘 장 어때요?", "신호등 한 장"],
    ["sector", "🌏", "미국·중국·일본은요?", "5개 시장 한눈에"],
    ["port", "💼", "지금 뭘 얼마나 사요?", "포트 비중 그대로"],
    ["prop", "📝", "고객 제안서 만들기", "성향 → 상품 → 금액 → 끝"],
    ["@send", "📨", "고객에게 한 장 보내기", "카톡용 그림 한 장"],
    ["@qa", "💬", "고객이 이렇게 물으면?", "오늘 시황으로 쓴 답 25개 · 🔥 이슈 5개"],
    ["bond", "🏦", "채권·ELS 금리 보기", "상품 한곳에서"],
    ["flow", "🧲", "외국인·기관은 뭘 사요?", "국내 수급 한눈에"],
    ["prob", "🎲", "오늘 오를 확률은?", "한국장 기준"],
    ["luck", "🔮", "오늘의 운세", "운세·사주·타로"]
  ];
  function help(){
    var old = document.getElementById("ezsheet"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "ezsheet";
    var ord = ROLE() === "inv" ? ["port", "prob", "flow", "home", "sector", "bond", "prop", "@send", "@qa", "luck"] : ROLE() === "look" ? ["home", "sector", "flow", "prob", "luck", "port", "bond", "prop", "@send", "@qa"] : null;
    var AS = ord ? ASK.slice().sort(function(a, b){ return ord.indexOf(a[0]) - ord.indexOf(b[0]); }) : ASK;
    d.innerHTML = '<div class="ezs-in"><div class="ezs-h"><img src="img/kid_think.jpg?v=1" alt=""><div><b>뭐 보면 돼요?</b><small>궁금한 걸 누르면 그 화면으로 데려가요</small></div><button type="button" class="ezs-x" aria-label="닫기">✕</button></div>' +
      '<div class="ezs-g">' + AS.map(function(a){ return '<button type="button" data-ask="' + a[0] + '"><span>' + a[1] + '</span><b>' + e(a[2]) + '</b><small>' + e(a[3]) + '</small></button>'; }).join("") + '</div>' +
      '<button type="button" class="ezs-mode">🔬 연구실 — 포트 · 신호 · 성적표 · 운세</button></div>';
    document.body.appendChild(d);
    d.addEventListener("click", function(ev){
      var t = ev.target;
      if (t === d || (t.closest && t.closest(".ezs-x"))) { d.remove(); return; }
      if (t.closest && t.closest(".ezs-mode")) { d.remove(); if (typeof window.go === "function") go("lab"); return; }
      var a = t.closest && t.closest("[data-ask]"); if (!a) return; d.remove();
      var k = a.dataset.ask;
      if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }
      if (k === "@send"){ if (window.__onepage) (__onepage.chooser || __onepage.go)(null); return; }
      if (typeof window.go === "function") go(k); window.scrollTo(0, 0);
    });
  }
  window.__ezHelp = function(){ help(); };
  function askBtn(){   // 아래 탭 바 안 「🙋 뭐 보지?」 — 화면을 가리지 않게(떠 있는 단추 대신)
    var b = document.getElementById("ezask"), nav = document.getElementById("bnav"), all = document.getElementById("ezall");
    if (b) b.remove(); return;   // 🧊 11/12 🙋 는 첫 화면 「할 수 있는 일」 지도가 대신함(도움말 창은 🔬 연구실·구경 버튼에서 그대로 열림)
    if (b && b.nextSibling === all) return;
    if (!b){ b = document.createElement("button"); b.id = "ezask"; b.type = "button"; b.innerHTML = '<span class="i">🙋</span><span>뭐 보지?</span>'; b.onclick = help; }
    nav.insertBefore(b, all || null);
  }

  /* ── ⑧ 제안서 4단계 ── */
  var VIEW = 0, LASTAT = -1;
  function stepCards(w){   // 🧊 11/09 ⑦ 단계별 카드 — 성향·상품(기본폼) / 이름·금액 / 고지·만들기
    var top = w.querySelector(".pp-top"), cu = document.getElementById("ppcust"), sim = w.querySelector(".pp-sim"), mk = document.getElementById("ppshow");
    var amt = [].filter.call(w.querySelectorAll(":scope > section.card"), function(c){ return /상품별 금액/.test((c.innerText || "").slice(0, 30)); })[0];
    cu = cu && cu.closest("section.card"); mk = mk && mk.closest("section.card");
    return [[top], [top], [cu, amt], [sim, mk]];
  }
  function stepShow(w){
    var SC = stepCards(w), on = [].concat(SC[VIEW] || []);
    [].forEach.call(w.querySelectorAll(":scope > section.card"), function(c){ c.classList.toggle("ezw-off", EZ() && on.indexOf(c) < 0); });
    var nv = document.getElementById("ezwnav");
    if (!EZ()){ if (nv) nv.remove(); return; }
    if (!nv){ nv = document.createElement("div"); nv.id = "ezwnav"; }
    if (nv.parentNode !== w.parentNode || w.nextSibling !== nv) w.parentNode.insertBefore(nv, w.nextSibling);
    var k = String(VIEW); if (nv.dataset.k === k) return; nv.dataset.k = k;
    nv.innerHTML = (VIEW > 0 ? '<button type="button" data-wv="' + (VIEW - 1) + '">◂ 이전</button>' : '<span></span>') +
      (VIEW < 3 ? '<button type="button" class="go" data-wv="' + (VIEW === 0 ? 1 : VIEW + 1) + '">다음 ▸ ' + ["", "", "이름·금액", "만들기"][VIEW === 0 ? 2 : VIEW + 1] + '</button>' : '<span></span>');
    nv.onclick = function(ev){ var b = ev.target.closest("[data-wv]"); if (!b) return; VIEW = +b.dataset.wv; if (VIEW === 1) VIEW = 2; z_k(); wiz(); window.scrollTo({top: 0, behavior: "smooth"}); };
  }
  function z_k(){ var z = document.getElementById("ezwiz"); if (z) z.dataset.k = ""; }
  function wiz(){
    if (cur() !== "prop" || !EZ()) { var o = document.getElementById("ezwiz"); if (o && cur() !== "prop") o.remove(); if (o && !EZ()) o.remove();
      var nv0 = document.getElementById("ezwnav"); if (nv0 && (cur() !== "prop" || !EZ())) nv0.remove(); [].forEach.call(document.querySelectorAll(".ezw-off"), function(c){ if (!EZ() || cur() !== "prop") c.classList.remove("ezw-off"); });
      if (cur() !== "prop"){ VIEW = 0; LASTAT = -1; } return; }
    var w = document.getElementById("ppw"); if (!w || !w.querySelector(".pp-pf")) return;
    var S = [
      ["🧭", "성향", ".pp-pf", !!w.querySelector(".pp-pg button.on")],
      ["📦", "상품", ".pp-grid", !!w.querySelector(".pp-f.on")],
      ["💰", "이름·금액", "#ppcust", !!((document.getElementById("ppcust") || {}).value) && [].some.call(w.querySelectorAll("input[data-ak]"), function(i){ return +i.value > 0; })],
      ["📤", "만들기", "#ppshow", false]
    ];
    var at = 0; while (at < 3 && S[at][3]) at++;
    if (LASTAT < 0) VIEW = Math.min(at, 1); else if (at === 1 && LASTAT === 0 && VIEW === 0) VIEW = 1;   // 성향 고르면 같은 카드의 상품으로
    LASTAT = at;
    var MSG = ["고객 투자성향부터 골라 주세요", "보낼 상품을 골라 주세요 (여러 개 가능)", "고객 이름과 금액을 넣어 주세요", "📱 한 장 · PDF · PPT 중 하나만 누르면 끝!"];
    var key = S.map(function(s){ return s[3] ? 1 : 0; }).join("") + at + "v" + VIEW;
    stepShow(w);
    var z = document.getElementById("ezwiz");
    if (z && z.dataset.k === key && z.parentNode === w.parentNode) return;
    if (!z){ z = document.createElement("div"); z.id = "ezwiz"; }
    if (z.parentNode !== w.parentNode || z.nextSibling !== w) w.parentNode.insertBefore(z, w);
    z.dataset.k = key;
    var vs = VIEW === 1 && !S[0][3] ? 0 : VIEW;   // 보고 있는 단계
    z.innerHTML = '<div class="ezw-s">' + S.map(function(s, i){ return '<button type="button" data-st="' + i + '" class="' + (i === vs || (vs === 0 && i === 1 && VIEW === 1) ? "on" : s[3] ? "ok" : "") + '"><b>' + (s[3] ? "✓" : i + 1) + '</b><span>' + s[0] + ' ' + s[1] + '</span></button>'; }).join("") + '</div>' +
      '<p class="ezw-m"><b>' + (vs + 1) + '단계</b> ' + e(MSG[vs]) + '</p>';
    z.querySelectorAll("[data-st]").forEach(function(btn){ btn.onclick = function(){ var i = +btn.dataset.st, s = S[i]; VIEW = i; z.dataset.k = ""; wiz();
      var t = w.querySelector(s[2]) || document.querySelector(s[2]); if (!t) { window.scrollTo({top: 0, behavior: "smooth"}); return; }
      var c = t.closest(".card") || t; if (c.classList.contains("cz-on")) c.click();
      c.scrollIntoView({behavior: "smooth", block: "center"}); c.classList.remove("ezw-hl"); void c.offsetWidth; c.classList.add("ezw-hl"); }; });
  }

  /* ── ⑪ 첫 방문 3장 ── */
  var TOURON = false;
  function tour(){
    if (!EZ() || TOURON || ls("ez_tour") || navigator.webdriver || /[?&]embed=1/.test(location.search)) return;
    if (cur() !== "home" || !document.querySelector("#ezhero .ez-light") || document.getElementById("wowob") || document.getElementById("gdq") || document.getElementById("uxob")) return;
    if (!ls("wow_ob")) return;   // wow.js 첫 인사가 먼저
    /* 🧊 11/12 「나는 누구?」 질문은 없앰 */
    TOURON = true; ls("ux_ob3", 1);   // ux1105 의 옛 3곳 안내(지금은 접혀 있는 칸을 가리킴)는 대신함
    var T = [
      ["#ezhero .ez-light", "1 / 3", "이것만 보면 돼요", "🟢 좋은 날 · 🟡 흔들리는 장 · 🔴 조심하는 장 — 하락장 계기판(종가)으로 판정해요. 바로 밑 「규칙」을 누르면 언제 바뀌는지 나와요."],
      ["#ezhero .ez-cta", "2 / 3", "오늘 할 일은 이것 하나", ROLE() !== "inv" && ROLE() !== "look" ? "누르면 오늘 시장을 그림 한 장으로 만들어 카톡으로 보낼 수 있어요." : ROLE() === "inv" ? "누르면 지금 뭘 얼마나 담으면 되는지(비중·주문서)로 가요." : "누르면 궁금한 것 8가지 중에서 골라 볼 수 있어요."],
      ["#jobmap", "3 / 3", "할 수 있는 일은 이게 전부", "보내기 · 제안서 · 상품 · 종목 — 아래 탭과 같아요. 포트·신호·운세 같은 깊은 화면은 🔬 연구실에 모아 뒀어요."]
    ], k = 0;
    var m = document.createElement("div"); m.id = "eztour"; document.body.appendChild(m);
    function end(){ ls("ez_tour", 1); m.remove(); TOURON = false; window.scrollTo({top: 0, behavior: "smooth"}); }
    function draw(){
      var t = T[k], el = document.querySelector(t[0]); if (!el){ if (++k < T.length) return draw(); return end(); }
      if (t[0] !== "#ezask") el.scrollIntoView({block: "center"});
      setTimeout(function(){
        var r = el.getBoundingClientRect(), below = r.top < innerHeight / 2;
        m.innerHTML = '<div class="ezt-hole" style="top:' + (r.top - 6) + 'px;left:' + (r.left - 6) + 'px;width:' + (r.width + 12) + 'px;height:' + (r.height + 12) + 'px"></div>' +
          '<div class="ezt-tip" style="' + (below ? "top:" + Math.min(innerHeight - 200, r.bottom + 14) : "bottom:" + Math.min(innerHeight - 200, innerHeight - r.top + 14)) + 'px"><small>' + t[1] + '</small><b>' + t[2] + '</b><p>' + t[3] + '</p><div><button type="button" data-x>건너뛰기</button><button type="button" class="go" data-n>' + (k === T.length - 1 ? "시작하기" : "다음") + '</button></div></div>';
      }, 260);
    }
    m.addEventListener("click", function(ev){ var t = ev.target; if (t.closest("[data-n]")){ if (++k >= T.length) end(); else draw(); } else if (t.closest("[data-x]")) end(); });
    draw();
  }

  /* ── ⑫ 막히는 곳 재기 (usage.js 의 하루 주머니에 같이 넣음 · 화면 이름만) ── */
  var NM = {home: "오늘", market: "시황", sector: "시장 흐름", prob: "오를 확률", flow: "수급", port: "포트", divc: "배당비교", score: "성적표", whale: "큰손", cup: "컵 차트", gap: "갭 상승", screen: "종목 찾기", sigmore: "신호 더 보기", bond: "채권", fund: "펀드", els: "ELS", prop: "제안서", luck: "운세", saju: "사주", tarot: "타로", lotto: "로또", feed: "피드", onepager: "종목리포트"};
  function bagAdd(label){
    try { var day = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), b = JSON.parse(localStorage.getItem("us_tap") || "null");
      if (!b || b.day !== day) b = {day: day, taps: {}, views: {}, n: 0};
      b.taps[label] = (b.taps[label] || 0) + 1; b.n++; localStorage.setItem("us_tap", JSON.stringify(b)); } catch(x) {}
  }
  var lastK = "", lastAt = 0;
  function watchView(){
    var k = cur(); if (!k || k === lastK) return;
    if (lastK && Date.now() - lastAt < 5000 && !document.hidden) bagAdd("⏱ 5초 안에 떠남 · " + (NM[lastK] || lastK));
    lastK = k; lastAt = Date.now();
  }
  document.addEventListener("click", function(ev){ var t = ev.target; if (t && t.closest && t.closest("#backbtn")) bagAdd("↩ 뒤로 · " + (NM[cur()] || cur())); }, true);

  /* ── 공통 ── */
  function toast(t){ var x = document.createElement("div"); x.className = "ez-toast"; x.textContent = t; document.body.appendChild(x); setTimeout(function(){ x.classList.add("out"); }, 2400); setTimeout(function(){ x.remove(); }, 2900); }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-ezgo]"); if (!t) return; ev.stopPropagation(); if (window.go) go(t.dataset.ezgo); window.scrollTo(0, 0); });
  function apply(){
    D.setAttribute("data-ez", EZ() ? "easy" : "pro");
    if (EZ()) ls("ux_ob3", 1);
    var h = document.getElementById("ezhero"); if (!EZ() && h) h.remove();
    tick();
  }
  var q = 0;
  function tick(){ q = 0;
    try { bar(); } catch(x) {}
    try { askBtn(); } catch(x) {}
    try { homeFlag(); home(); } catch(x) { console.warn("ez home", x); }
    try { wiz(); } catch(x) {}
    try { watchView(); } catch(x) {}
    if (cur() === "home") setTimeout(tour, 1800);
  }
  function soon(){ if (!q) q = setTimeout(tick, 200); }
  function start(){ apply(); try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {} setInterval(tick, 3000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  /* ── 모양 ── */
  var R = "html[data-ez=easy]";
  var st = document.createElement("style");
  st.textContent =
    /* ② 아래 탭: 쉬운 화면엔 오늘 · 포트 · 제안서 + ☰ */
    /* 🧊 11/12 아래 탭 숨김 규칙 없앰 — nav2.js 5칸 */
    "html[data-ez=pro] #ezall{display:none}#ezall .i{font-size:20px}" +
    /* ① 첫 화면: 머리 카드·예전 오늘 화면은 「자세히」 아래 */
    R + "[data-tab=home] #main>.hero{display:none!important}" +
    R + " #hmbody:not(.ez-open){display:none!important}" +
    ".ez-hero{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:18px 18px 16px;margin:4px 0 12px;font-size:17px;line-height:1.5}" +
    ".ez-load{padding:24px 0;text-align:center;color:var(--sub);font-size:16px}" +
    ".ez-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px!important;color:var(--sub);margin-bottom:12px}" +
    ".ez-ph{display:flex;gap:4px}.ez-ph i{font-style:normal;font-size:12.5px!important;padding:3px 8px;border-radius:99px;background:var(--panel2,rgba(127,127,127,.12));opacity:.55}.ez-ph i.on{opacity:1;font-weight:800;color:var(--text);box-shadow:inset 0 0 0 1.5px var(--c,#7c9cff)}" +
    ".ez-light{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:18px;margin-bottom:12px}" +
    ".ez-light.g{background:rgba(46,204,113,.13)}.ez-light.y{background:rgba(242,201,76,.16)}.ez-light.r{background:rgba(240,68,82,.13)}" +
    ".ez-light>b{font-size:46px;line-height:1}.ez-light small{display:block;font-size:13px!important;color:var(--sub)}.ez-light strong{display:block;font-size:27px;font-weight:900;letter-spacing:-.5px;line-height:1.2}.ez-light em{display:block;font-style:normal;font-size:15px!important;color:var(--sub)}" +
    ".ez-one{font-size:19px;font-weight:800;line-height:1.45;margin:0 2px 12px;word-break:keep-all}" +
    ".ez-nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:8px;margin-bottom:12px}.ez-nums div{background:var(--panel2,rgba(127,127,127,.1));border-radius:14px;padding:10px 8px;text-align:center}" +
    ".ez-nums small{display:block;font-size:13px!important;color:var(--sub)}.ez-nums b{display:block;font-size:22px;font-weight:900}.ez-nums em{display:block;font-style:normal;font-size:12.5px!important;color:var(--sub)}" +
    ".ez-hero .up{color:var(--up,#f04452)}.ez-hero .dn{color:var(--down,#3182f6)}" +
    ".ez-act{border-left:4px solid var(--c,#7c9cff);padding:2px 0 2px 12px;margin:0 0 14px}.ez-act small{font-size:13px!important;color:var(--sub)}.ez-act p{margin:2px 0 0;font-size:17px;font-weight:700;line-height:1.5;word-break:keep-all}" +
    ".ez-cta{display:block;width:100%;font:inherit;font-size:18px;font-weight:900;padding:15px 12px;border:0;border-radius:16px;background:#3182f6;color:#fff;cursor:pointer}.ez-cta:active{transform:scale(.98)}" +
    ".ez-early{font-style:normal;font-size:11.5px!important;font-weight:700;color:#b7791f;background:rgba(242,201,76,.2);padding:1px 6px;border-radius:99px;margin-left:4px}" +
    ".ez-hit{margin:-4px 2px 10px;font-size:13.5px!important;color:var(--sub);cursor:pointer}.ez-hit b{color:var(--text)}.ez-hit i{font-style:normal;color:#3182f6;font-weight:700}" +
    ".ez-rule{margin:0 0 12px;border:1px solid var(--line);border-radius:14px;padding:9px 12px;font-size:14.5px}.ez-rule summary{font-weight:800;cursor:pointer;list-style:none}.ez-rule summary::after{content:' ▾';color:var(--sub)}.ez-rule[open] summary::after{content:' ▴'}" +
    ".ez-rule p{margin:8px 0 0;line-height:1.5;word-break:keep-all}.ez-rule ul{margin:8px 0 0;padding:0;list-style:none}.ez-rule li{padding:3px 0;font-size:14px}.ez-rule li small{display:block;color:var(--sub);font-size:12.5px!important;margin-left:22px}.ez-rule-n{font-size:12.5px!important;color:var(--sub)}" +
    ".ez-mix{margin:0 2px 10px;padding:8px 10px;border-radius:12px;background:rgba(242,201,76,.16);font-size:14.5px!important;font-weight:700;word-break:keep-all}" +
    ".ez-chg{margin:0 0 14px;padding:10px 12px;border-radius:14px;background:var(--panel2,rgba(127,127,127,.1));cursor:pointer}.ez-chg small{font-size:12.5px!important;color:var(--sub);font-weight:700}.ez-chg p{margin:2px 0 0;font-size:15.5px;font-weight:800;word-break:keep-all}.ez-chg em{display:block;font-style:normal;font-size:13px!important;color:var(--sub);margin-top:2px}" +
    ".ez-cta.red{background:#e5484d}.ez-todo{margin:0 2px 6px;font-size:13px!important;font-weight:800;color:var(--sub)}" +
    ".ez-role{margin:0 0 4px;padding:12px;border-radius:16px;border:1.5px solid #3182f6;background:rgba(49,130,246,.06)}.ez-role>b{display:block;font-size:17px}.ez-role>small{display:block;font-size:12.5px!important;color:var(--sub);margin-bottom:8px}" +
    ".ez-role>div{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.ez-role button{display:flex;flex-direction:column;align-items:center;gap:1px;font:inherit;font-size:15px;font-weight:800;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 4px;cursor:pointer}.ez-role button span{font-size:22px}.ez-role button small{font-size:11.5px!important;font-weight:500;color:var(--sub);text-align:center;word-break:keep-all}" +
    ".ezw-off{display:none!important}#ezwnav{display:flex;justify-content:space-between;gap:8px;margin:8px 0 16px}#ezwnav button{flex:1;font:inherit;font-size:16px;font-weight:800;border:1px solid var(--line);border-radius:14px;padding:13px 10px;background:var(--panel);color:var(--text);cursor:pointer}#ezwnav button.go{background:#3182f6;color:#fff;border-color:#3182f6}#ezwnav span{flex:1}" +
    ".ez-note{margin:8px 0 0;font-size:12.5px!important;color:var(--dim,var(--sub));text-align:center}" +
    "html[data-ezpin] #main>*:not(#ezmore),html[data-ezpin] #main>*:not(#ezmore) *{overflow-anchor:none}" +
    "#ezmore{margin:0 0 12px}#ezmore .ez-open{display:block;width:100%;font:inherit;font-size:16px;font-weight:800;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:13px 12px;cursor:pointer}#ezmore .ez-open small{display:block;font-size:13px!important;font-weight:500;color:var(--sub);margin-top:2px}" +
    ".ez-drawer{margin-top:12px}.ez-drawer>small{font-size:13px!important;color:var(--sub);font-weight:700}.ez-drawer>div{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}.ez-drawer button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:14px;font-weight:700;color:var(--sub);background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 4px;cursor:pointer}.ez-drawer button span{font-size:20px}" +
    R + " #hmbody.ez-open #uxluck{display:none}" +
    "#ezpro{display:block;width:100%;font:inherit;font-size:14px;font-weight:700;color:var(--sub);background:transparent;border:1px dashed var(--line);border-radius:12px;padding:9px;margin:0 0 10px;cursor:pointer}" +
    /* ⑥ 🙋 */
    "#ezask .i{font-size:20px}html[data-ez=pro] #ezask{display:none}" +
    "#ezsheet{position:fixed;inset:0;z-index:9990;background:rgba(8,12,20,.55);display:flex;align-items:flex-end}" +
    ".ezs-in{width:100%;max-width:560px;margin:0 auto;background:var(--panel,#fff);border-radius:22px 22px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 16px);max-height:88vh;overflow:auto}" +
    ".ezs-h{display:flex;align-items:center;gap:10px;margin-bottom:12px}.ezs-h img{width:46px;height:46px;border-radius:50%;object-fit:cover}.ezs-h b{display:block;font-size:20px}.ezs-h small{font-size:13.5px!important;color:var(--sub)}.ezs-h>div{flex:1}" +
    ".ezs-x{font:inherit;font-size:18px;background:none;border:0;color:var(--sub);padding:6px 8px;cursor:pointer}" +
    ".ezs-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ezs-g button{display:grid;grid-template-columns:30px 1fr;column-gap:8px;align-items:center;text-align:left;font:inherit;color:var(--text);background:var(--panel2,rgba(127,127,127,.1));border:1px solid var(--line);border-radius:16px;padding:10px 10px;cursor:pointer}.ezs-g span{font-size:22px;grid-row:1/3}.ezs-g b{display:block;font-size:15px;line-height:1.3;word-break:keep-all}.ezs-g small{font-size:13px!important;color:var(--sub);line-height:1.3}" +
    ".ezs-mode{display:block;width:100%;margin-top:12px;font:inherit;font-size:15px;font-weight:700;color:var(--sub);background:none;border:1px dashed var(--line);border-radius:14px;padding:11px;cursor:pointer}" +
    /* ⑧ 제안서 단계 */
    "#ezwiz{position:sticky;top:var(--hh,56px);z-index:30;background:var(--bg);padding:8px 0 6px;margin:0 0 6px}" +
    ".ezw-s{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.ezw-s button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:12.5px;color:var(--sub);background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:7px 2px;cursor:pointer}" +
    ".ezw-s b{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;background:var(--panel2,rgba(127,127,127,.15))}" +
    ".ezw-s button.on{color:var(--text);font-weight:800;border-color:#3182f6;box-shadow:0 0 0 1.5px #3182f6}.ezw-s button.on b{background:#3182f6;color:#fff}.ezw-s button.ok b{background:#2ecc71;color:#fff}" +
    ".ezw-m{margin:7px 2px 0;font-size:15px!important;font-weight:700}.ezw-m b{color:#3182f6;margin-right:4px}" +
    "@keyframes ezhl{0%{box-shadow:0 0 0 0 rgba(49,130,246,.7)}100%{box-shadow:0 0 0 14px rgba(49,130,246,0)}}.ezw-hl{animation:ezhl 1s ease-out 2}" +
    /* ⑪ 안내 */
    "#eztour{position:fixed;inset:0;z-index:9998}.ezt-hole{position:fixed;border-radius:18px;box-shadow:0 0 0 9999px rgba(8,12,20,.68);border:2px solid #fee500;pointer-events:none;transition:all .25s}" +
    ".ezt-tip{position:fixed;left:16px;right:16px;background:#fff;color:#191f28;border-radius:18px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.3)}.ezt-tip small{font-size:12.5px;color:#6b7684;font-weight:700}.ezt-tip b{display:block;font-size:20px;margin:2px 0 4px}.ezt-tip p{margin:0 0 12px;font-size:16px;line-height:1.5;color:#333d4b}" +
    ".ezt-tip div{display:flex;gap:8px;justify-content:flex-end}.ezt-tip button{font:inherit;font-size:15px;font-weight:700;border:0;border-radius:12px;padding:10px 16px;background:#f2f4f6;color:#4e5968}.ezt-tip button.go{background:#3182f6;color:#fff}" +
    ".ez-toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 130px);transform:translateX(-50%);z-index:9999;background:rgba(25,31,40,.94);color:#fff;font-size:14.5px;font-weight:700;padding:11px 16px;border-radius:14px;max-width:90vw;text-align:center;transition:opacity .4s}.ez-toast.out{opacity:0}";
  document.head.appendChild(st);
  /* 🧹 11/11 첫 화면 간결화 — 모양 (위 규칙을 덮어씀) */
  var st2 = document.createElement("style");
  st2.textContent =
    ".ez-hero{padding:14px 14px 14px;min-height:420px}.ez-hero.ez-done{min-height:0}" +   /* ⑧ 자리 미리 잡기 */
    ".ez-skel{display:flex;flex-direction:column;gap:12px;padding:6px 0}.ez-skel i{display:block;border-radius:16px;background:var(--panel2,rgba(127,127,127,.12));animation:ezsk 1.2s ease-in-out infinite alternate}.ez-skel i:nth-child(1){height:230px}.ez-skel i:nth-child(2){height:72px}.ez-skel i:nth-child(3){height:56px}@keyframes ezsk{to{opacity:.45}}" +
    ".ez-hero .ez-top{display:block;margin:0 2px 10px;font-size:12.5px!important;color:var(--dim,var(--sub));font-weight:600}" +   /* ⑤ 회색 한 줄 */
    ".ez-light{display:block;padding:14px 14px 10px;margin-bottom:10px}.ez-lh{display:flex;align-items:center;gap:12px}" +
    ".ez-light .ez-lh>b{font-size:40px;line-height:1}.ez-light strong{font-size:26px}.ez-light em{font-size:14.5px!important}" +
    /* ② 결론 두 줄 — 신호등 안, 상자·제목 없이 */
    ".vd-mini{margin:10px 0 0;min-height:58px}.vd-mini .vd-in{border:0;background:transparent;padding:0}.vd-mini .vd-h,.vd-mini .vd-n,.vd-mini .vd-l b small{display:none!important}" +
    ".vd-mini .vd-r{padding:6px 0;border-top:1px solid rgba(127,127,127,.18);gap:8px}.vd-mini .vd-f{font-size:17px}.vd-mini .vd-l{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px}" +
    ".vd-mini .vd-l b{display:inline;font-size:13.5px!important;font-weight:700!important;color:var(--sub)!important}.vd-mini .vd-r em{display:inline;margin:0;font-size:15px!important;color:var(--text)!important}" +
    /* ③ 경보 한 줄 */
    ".ez-light .ez-rule{margin:6px 0 0;border:0;border-top:1px solid rgba(127,127,127,.18);border-radius:0;padding:8px 0 0;font-size:14px;background:transparent}" +
    ".ez-warn{display:block;width:100%;text-align:left;font:inherit;font-size:14px;font-weight:800;color:var(--text);background:transparent;border:0;border-top:1px solid rgba(127,127,127,.18);padding:8px 0 0;margin:6px 0 0;cursor:pointer;word-break:keep-all}.ez-warn i{font-style:normal;color:var(--sub)}" +
    ".ez-warn-y{font-weight:700;color:var(--sub);cursor:default}" +
    ".ez-nums{margin-bottom:10px;gap:6px}.ez-nums div{padding:8px 6px}.ez-nums b{font-size:20px}.ez-nums em{font-size:12px!important}" +
    ".ez-cta{font-size:17px;padding:14px 12px}.ez-cta.red{background:#e5484d}" +
    /* ④ 한 줄 목록 */
    "#ezrows{background:var(--panel);border:1px solid var(--line);border-radius:22px 22px 0 0;border-bottom:0;padding:12px 14px 4px;margin:0}" +
    "html[data-ez=easy] #ezrows+#mnbox{background:var(--panel);border:1px solid var(--line);border-top:0;border-radius:0 0 22px 22px;padding:0 14px 8px;margin:0 0 12px;display:flex;flex-direction:column}" +
    ".ez-rh{margin:0 2px 4px;font-size:15px;font-weight:800}.ez-rh small{font-size:12px!important;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".ez-rows{display:flex;flex-direction:column}.ez-row{border-top:1px solid var(--line)}.ez-row:first-child{border-top:0}" +
    ".ez-r{display:block;width:100%;text-align:left;font:inherit;font-size:15px;line-height:1.45;font-weight:600;color:var(--text);background:transparent;border:0;padding:11px 2px;cursor:pointer;word-break:keep-all;min-height:46px}" +
    ".ez-r small{display:block;font-size:12px!important;font-weight:700;color:var(--sub);margin-bottom:1px}.ez-r i{font-style:normal;color:var(--sub);float:right}.ez-r b{font-weight:900}" +
    ".ez-clamp{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.ez-clamp.ez-open1{-webkit-line-clamp:unset;display:block}" +
    ".ez-ph{color:var(--sub);font-weight:500}.ez-flow{min-height:46px}.ez-flow .fl-line{display:block;width:100%;text-align:left;font:inherit;font-size:15px;line-height:1.45;font-weight:600;color:var(--text);background:transparent;border:0;padding:11px 2px;word-break:keep-all;cursor:pointer}.ez-flow .fl-line i{font-style:normal;color:var(--sub);float:right}" +
    ".ez-rows .ez-rule.ez-r{border:0;border-radius:0;padding:11px 2px;background:transparent;font-size:15px}.ez-rows .ez-rule summary{font-weight:600}" +
    "#ezrows .ez-note{margin:4px 0 6px;font-size:12px!important}" +
    /* ④ #mnbox 칸 — 제목 한 줄 · 누르면 펼침 */
    "html[data-ez=easy] #mnbox .ez-f{background:transparent!important;border:0!important;border-top:1px solid var(--line)!important;border-radius:0!important;box-shadow:none!important;margin:0!important;padding:0!important}" +
    "html[data-ez=easy] #mnbox .ez-f>h3{margin:0!important;padding:12px 2px!important;font-size:15px!important;font-weight:700!important;cursor:pointer;display:flex;align-items:center;gap:6px}" +
    "html[data-ez=easy] #mnbox .ez-f>h3::after{content:'▾';margin-left:auto;color:var(--sub);font-size:13px}html[data-ez=easy] #mnbox .ez-f.ez-x>h3::after{content:'▴'}" +
    "html[data-ez=easy] #mnbox .ez-f>h3 .mut{font-size:12px!important;color:var(--sub);font-weight:500}" +
    "html[data-ez=easy] #mnbox .ez-f:not(.ez-x)>:not(h3){display:none!important}html[data-ez=easy] #mnbox .ez-f.ez-x{padding-bottom:10px!important}" +
    "html[data-ez=easy] #mnbox:empty{min-height:0}" +
    /* ⑨ 첫 화면엔 버튼 하나 — 머리줄 📨 · 뒤로 숨김 */
    "html.ez-home[data-ez=easy] body header .top #opbtn,html.ez-home[data-ez=easy] body #opbtn,html.ez-home[data-ez=easy] body #backbtn{display:none!important}";
  document.head.appendChild(st2);
})();
;
