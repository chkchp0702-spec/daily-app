/* 🧒 꼬마 안내원 (10/22 사용자: 둘째 아들을 닮은 3D 캐릭터로 앱 각 카테고리 설명 — Kling 영상 대신 비용 0원 안내 카드)
   · 머리 「CH Investing」 옆 작은 얼굴 버튼 하나 → 누르면 지금 보고 있는 묶음(오늘·시장·포트·신호·상품·피드)을 말풍선으로 설명
   · 처음 보는 묶음에선 얼굴 버튼에 작은 링이 한 번만 반짝 — 한 번 열면 조용히
   · 앱을 처음 연 사람에게만 인사 카드 한 번 (다시 안 뜸)
   · 대사는 아래 SAY 만 고치면 됨 (화면이 바뀌어도 다시 찍을 필요 없음) */
(function(){
  var IMG = "img/guide.jpg?v=1", BODY = "img/guide_body.jpg?v=1";
  // 🎨 10/22 Canva 로 만든 꼬마 자세 (나머지 묶음·자세히는 기본 그림) — 사용자 「일단 지금 있는 것만」
  var POSE = {intro: "img/kid_wave.jpg?v=1", home: "img/kid_thumb.jpg?v=1", mkt: "img/kid_globe.jpg?v=1", inv: "img/kid_piggy.jpg?v=1", prod: "img/kid_piggy.jpg?v=1", sig: "img/kid_detect.jpg?v=1"};  // 10/25 신호 = 돋보기 조이
  // 10/23 사용자 「꼬마 여러 표정을 적재적소에」 — 조이(Joey) 표정: 기쁨(kid_joy) · 우산(kid_umb, 조심·내림) · 엄지(kid_thumb) · 손인사(kid_wave) · 지구본(kid_globe) · 저금통(kid_piggy) · 놀람(guide_src)
  var FACE = {joy: "img/kid_joy.jpg?v=1", umb: "img/kid_umb.jpg?v=1", thumb: "img/kid_thumb.jpg?v=1", wow: "img/guide_src.jpg?v=1", think: "img/kid_think.jpg?v=1", detect: "img/kid_detect.jpg?v=1", night: "img/kid_night.jpg?v=1"};  // 10/26 +졸린 밤(kid_night)  // 10/24 +생각(kid_think) · 10/25 +돋보기(kid_detect)
  function faceFor(L){ var t = (L || []).join(" ");     // 말 내용으로 표정 고르기
    if (/⚠️|주의|조심|못 미|미달|아직 검증|무리|이르|손실|내림|빠진|급락/.test(t)) return FACE.umb;
    if (/🏆|이김|적중|확인됨|✅|앞섬/.test(t)) return FACE.joy;
    if (/추정|검증 중|확률/.test(t)) return FACE.think;
    return null; }
  var MKPOSE = {prob: FACE.think, cup: FACE.detect, gap: FACE.detect, screen: FACE.detect};                      // 자세히 묶음별 자세 (확률 = 생각하는 조이)
  var GRP = {home: "home", market: "mkt", sector: "mkt", prob: "mkt", port: "inv", score: "inv",
             whale: "sig", cup: "sig", gap: "sig", screen: "sig", sigmore: "sig", accum: "sig", danta: "sig",
             bond: "prod", fund: "prod", els: "prod", feed: "feed", prop: "prop", luck: "luck", saju: "luck", tarot: "luck", lotto: "luck"};
  var NAME = {intro: "👋 인사", home: "🏠 오늘", mkt: "🌐 시장", inv: "💼 포트", sig: "🎯 신호", prod: "🛍️ 상품", prop: "📝 제안서", feed: "📰 피드", luck: "🔮 운세"};
  var SAY = {
    intro: ["안녕하세요! 저는 어플 안내자 조이(Joey)예요.", "어려운 투자 이야기, 제가 쉽게 알려 줄게요.", "궁금할 땐 위에 있는 제 얼굴을 눌러 주세요!"],
    home: ["여기는 「오늘」이에요.", "오늘 꼭 알아야 할 것만 한 장에 모았어요.", "카드를 누르면 그 탭으로 바로 가요.", "맨 위 동그라미를 누르면 오늘 이야기를 한 장씩 보여 줘요 — 마지막 장에서 그 탭으로 바로 가요.", "✨ 옆으로 넘기는 「오늘의 발견」엔 탭마다 가장 놀라운 숫자가 있어요.", "👀 다시 오면 그사이 바뀐 것부터 보여 줘요.", "🎯 아침마다 「코스피 오를까?」 한 번 눌러 동료랑 맞혀 봐요!", "바쁠 땐 여기만 봐도 돼요!"],
    mkt: ["「시장」에서는 어느 나라, 어느 업종으로 돈이 몰리는지 봐요.", "🌐 시황은 매일 아침 시황 리포트예요.", "🧭 나침반은 한국·미국·일본·중국·홍콩을 한눈에 보여 줘요.", "🎲 시장확률은 오늘 장이 오를 확률이에요!"],
    inv: ["「포트」는 시황 리포트대로 투자했다면 얼마 벌었을지 보여 줘요.", "뭘 얼마나 사야 하는지도 바로 보여요.", "📊 성적표에서는 우리 신호들이 잘 맞았는지 매일 채점해요.", "시장보다 잘했는지 늘 정직하게 비교해요!"],
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
    prob: ["🎲 시장확률은 내일과 일주일 뒤 시장이 오를 확률이에요.", "계산법: 평소 오르는 비율(기저율)에서 출발해요. 추세·변동성·심리(공포·탐욕)·자금(크레딧·환율)·시장 폭·외국인 수급·옵션 만기·전날 미국장 같은 근거 20가지 정도를 하나씩 더해요.", "근거끼리 비슷한 말을 하는 경우가 많아서, 근거가 많아도 「서로 다른 근거 2개 정도」 몫만 믿어요.", "과거에 잘 맞힌 방법은 가중치를 올리고, 못 맞힌 방법은 내려요(매일 자동 채점).", "그래서 숫자가 50% 근처에 자주 머물러요. 억지로 부풀리지 않으려는 거예요.", "⚠️ 실전 방향 성적이 20건 넘게 쌓이고 55%를 넘기 전까진 「약간 ○○ 쪽」까지만 말해요. 아직 그대로 따라 사고팔긴 무리예요."],
    port: ["💼 포트는 「시황 리포트 배분표대로 투자했다면」을 매일 계산해요.", "💼 기본 = 뼈대(S&P500 반 + 나스닥 반, 시장이 200일선 아래면 현금·금을 늘림) · ⚡ 킥 = 기본에 확인된 신호(고래·컵·갭) 조금 · 🎯 집중 = 오르는 시장에 몰아서.", "시작일은 10/2가 기본이고, 날짜를 바꿔 다른 날부터 볼 수도 있어요.", "🎛 포트 설계기에서는 비중을 손가락으로 밀면 2008년부터 다시 굴려서 연 수익·최대 낙폭·최악의 해를 바로 보여 줘요.", "「정직」 숫자는 다음 날 진입·사고팔 때 비용까지 뺀 값이에요.", "⚠️ 실전 기록은 10/2부터라 아직 몇 주뿐이에요. 그대로 따라 하기엔 이르니, 위의 S&P500 비교 숫자와 성적표를 꼭 같이 보세요."],
    score: ["📊 성적표는 앱이 한 말이 맞았는지 한곳에서 채점하는 곳이에요.", "시황 예고, 두뇌 생각, 킥 신호, 단타 알람, 해외 상품까지 다 매겨요.", "🧪 포트 규칙 검증은 규칙을 2008~2016년에서 고르고 2017년부터 시험한 결과예요.", "🧾 시도 장부는 지금까지 시험한 규칙 조합 수예요. 많이 시험할수록 1등은 운으로도 좋아 보여서, 과거 숫자는 절반쯤 깎아서 봐요."],
    whale: ["🐋 고래는 미국 큰 펀드와 유명 투자자예요.", "SEC 13F 공시로 수익률 좋은 기관 20곳 + 유명 투자자 20곳, 모두 40곳을 매일 골라요(1년 복제 수익률 순위).", "그 40곳이 새로 사거나 크게 늘린 종목을 알려 줘요.", "🐋 원픽은 고래·차트·수급·흐름·뉴스를 100점으로 매겨 하나 뽑은 거예요.", "⚠️ 13F는 분기가 끝나고 45일 뒤에 공개돼요. 고래가 실제로 산 날보다 늦게 알게 돼요."],
    cup: ["☕ 컵은 컵 모양(U자로 내렸다 회복) + 손잡이(살짝 쉬었다 가기) 차트예요.", "한국·미국·일본·중국·홍콩 약 2만 종목을 매일 다 훑어요.", "컵 깊이, 기간, 손잡이 거래량 감소, 사상최고가와의 거리, 주가 강도 같은 조건을 모두 통과한 것만 남겨요.", "봇이 눈으로 한 번 더 걸러요(👁 눈 검사).", "⚠️ 컵이 보인다고 다 오르진 않아요. 손잡이를 「돌파」한 뒤가 중요하고, 성적표의 정직 숫자를 같이 보세요."],
    gap: ["📈 갭은 전날 종가보다 훌쩍 높게 시작해서 그 자리를 지키는 종목이에요.", "컵과 같은 5개 시장 약 2만 종목을 매일 훑어요.", "갭 직전에 평평하게 쉬던 박스, 신고가 돌파, 갭을 메우지 않고 지키는지로 모양 점수를 매겨요.", "우리 기록에선 4~8% 갭이 그보다 큰 갭보다 나았어요.", "⚠️ 비용과 다음 날 진입까지 뺀 「정직」 숫자가 기준(손익비 1.5)에 못 미치면 ⚠ 표시가 붙어요. 그땐 참고로만 보세요."],
    screen: ["🔎 아침 거르기는 약 2만 7천 종목 중 하루 거래대금 10억 원 넘는 약 1만 2천 종목을 매일 아침 걸러요.", "거름망 네 개: 🤫 조용한 돈 유입 · 🏆 섹터 1등주 · 🌱 조용한 신고가 · 🐋 고래+임원 매수+차트(미국).", "👁 「볼 만함」을 눌러 두면, 다음 날 내 눈이 거름망보다 나았는지 채점해 줘요.", "⚠️ 살펴볼 후보일 뿐, 사라는 뜻이 아니에요."],
    sigmore: ["🗂 더 보기는 있으면 좋은 자세한 자료를 모은 곳이에요.", "예고 채점, 두뇌 논지, 고래·컵·갭 상세, 단타 통계가 있어요.", "🤫 매집·⚡ 단타는 화면 대신 알림으로만 받아요. 단타는 아직 성적이 마이너스라 대부분 기록만 해요."],
    bond: ["🏦 채권은 미래에셋증권이 지금 파는 국고채·미국채·브라질국채·공사채·회사채예요.", "세금 뗀 뒤 수익률 순으로 보여 주고, 만기 순서로도 정렬할 수 있어요.", "하루 세 번 새 정보로 바뀌어요.", "⚖️ 세 갈래 길에서는 같은 돈을 채권·ELS·포트에 넣었을 때 3년 뒤를 나란히 비교해요."],
    fund: ["📦 펀드는 미래에셋이 파는 공모펀드 약 1,800개예요.", "사모펀드(재간접) 수익률 순위, 전체 순위, 유형별로 볼 수 있어요.", "⚠️ 과거 수익률은 앞으로를 보장하지 않아요. 보수(수수료)도 같이 보세요."],
    els: ["🎯 ELS는 지금 청약 중인 ELS·ELB의 연 수익률·기초자산·구조·마감일을 모은 거예요.", "🎬 과거 재생: 이 조건으로 2006년부터 매일 가입했다면 몇 번이 일찍 끝나고 몇 번이 손실이었는지 보여 줘요.", "🎛 설계: 배리어·낙인·기초자산을 손가락으로 밀어 내 ELS를 직접 짜 보고, 과거 확률이 바로 바뀌어요.", "타사 비교, 📌 담아 두기(들고 있는 ELS가 지금 어디쯤인지)도 있어요.", "⚠️ 과거 계산이에요. 미래를 보장하지 않아요."],
    prop: ["📝 제안서 기본폼 9종: 국내 주식 · 국내+해외 주식 · 개인연금 · DC · IRP · 국고채 · 미국채 · 브라질국채 · ELS.", "주식·연금은 매일 아침 시황 배분표(미국 S&P500 200일선 규칙)를, 퇴직연금은 위험자산 70% 한도를 따라요.", "채권·ELS는 미래에셋이 지금 파는 상품 중 기간별 세후 1등, 원금지급형+지수형으로 골라요.", "🎚 위험 정도: 안전은 위험자산 절반을 현금성으로, 적극은 안전자산 절반을 위험자산으로 옮겨요. 과거 계산도 그 단계로 다시 해요.", "📲 고객에게 보여 주기: 상담 자리에서 휴대폰을 건네면 고객이 금액·위험 정도를 직접 눌러 보며 큰 글씨 카드를 넘겨 봐요. ✕ 두 번이면 닫혀요.", "🔗 동료 PB에게 세팅 링크를 보낼 수 있어요. 고객 이름은 안 담겨요.", "📱 한 장은 카톡용 그림, 📄 PDF는 표지부터 유의사항까지, 📊 PPT는 맑은 고딕에 차트를 PPT에서 고칠 수 있어요.", "⚖️ 모든 출력물 끝에 위험고지가 들어가고, 심의필 번호를 넣으면 같이 찍혀요.", "⚠️ 참고 자료예요. 고객에게 드리기 전 숫자와 상품 조건을 한 번 더 확인해 주세요."],
    luck: ["🔮 오늘의 운세는 그날의 기운(일진)과 태어난 사주를 비교해서 점수를 매겨요.", "일 · 돈 · 사람 · 몸 네 가지와 행운의 색 · 숫자 · 방향 · 좋은 시간을 알려 줘요.", "이번 주 막대를 누르면 다른 날 운세도 볼 수 있어요. 가족 · 고객을 여러 명 넣어 두면 「모두의 오늘」로 한눈에 봐요.", "인터넷 · API 없이 휴대폰 안에서 계산해요. 생일은 이 휴대폰에만 저장돼요.", "⚠️ 재미로 보는 참고예요. 투자 판단의 근거가 아니에요."],
    lotto: ["🎱 로또는 1회부터 지금까지 모든 당첨 번호를 분석해요.", "솔직히 말하면, 어떤 번호든 1등 확률은 똑같아요. 과거 번호로 다음 번호는 못 맞혀요.", "대신 1~3등은 당첨자끼리 나누니까, 남들이 덜 찍는 조합이면 혼자 받을 수 있어요. 3·4등 당첨자 수로 사람들이 좋아하는 번호를 재서 덜 겹치는 조합을 만들어요.", "검증해 보니 덜 겹친다고 본 쪽이 1등을 탔을 때 평균 약 25% 더 받았어요.", "⚠️ 로또는 기대 수익이 마이너스인 놀이예요. 즐길 만큼만!"],
    tarot: ["🃏 타로는 질문을 적고 카드를 고르면, 그 질문에 맞춰 풀어 줘요.", "질문을 읽어서 투자 · 돈 · 연애 · 결혼 · 직장 · 사업 · 시험 · 건강 · 관계 · 이사 중 어떤 주제인지, 「해도 될까 · 언제 · 어떻게 · A냐 B냐」 중 무엇을 묻는지 알아내요.", "78장 카드마다 주제별 해석을 미리 써 둬서 인터넷 · API 비용 없이 바로 풀어요.", "더 깊게 보고 싶으면 「Claude 심화 해석 문구」를 복사해 Claude 채팅에 붙여 넣어요.", "⚠️ 재미와 자기 성찰용이에요. 투자 판단의 근거가 아니에요."],
    saju: ["📜 사주 리포트는 예전 「나를 읽는 리포트」 모양 그대로예요.", "8글자 · 숨은 글자 · 관계도 · 간판 · 가장 필요한 기운 · 특별한 표시 · 다섯 기운 · 재물 · 10년 대운 · 연도별 · 올해 월별 · 배우자 · 별자리 · 생활 · 정리까지.", "만세력(절기 · 음력 · 윤달), 서머타임, 태어난 곳 경도까지 천문 계산식으로 직접 계산해요.", "📄 PDF로 저장해서 보낼 수 있어요. 더 깊은 글은 「Claude 심화판 문구」를 복사해 Claude 채팅에 붙여 넣으면 돼요(API 비용 없음).", "⚠️ 전통 이론에 따른 해석이고, 과학적 예측이 아니에요."],
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
  function vidHtml(vs, wait){ return vs ? '<div class="gd-vw"><video class="gd-v" src="' + vs + '" muted' + (wait ? '' : ' autoplay') + ' playsinline preload="' + (wait ? 'metadata' : 'auto') + '" controls disablepictureinpicture></video></div>' : ""; }
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
      (vs ? '<div class="gd-vw"><video class="gd-v" src="' + vs + '" muted autoplay playsinline preload="auto" controls disablepictureinpicture></video></div>' : '') +
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
    if (!ls("gd_intro") && !/[?&]embed=1/.test(location.search)) setTimeout(function(){ if (document.getElementById("gdq")) return; ls("gd_intro", 1); open("intro"); }, 2900);   // 인사 화면(2초) 뒤
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  setTimeout(function(){ addBtn(); hook(); }, 900);
  window.gdOpen = open;
})();
