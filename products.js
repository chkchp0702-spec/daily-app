/* CH Investing — 🛍️ 상품: 미래에셋증권이 지금 파는 채권 · 펀드 · ELS (archive/x/products.json, products.yml 하루 3번 · 🇧🇷 브라질 실시간 금리·달러채 archive/x/brl_live.json 평일 20분마다)
   10/16 사용자: 「상품 카테고리 — 국채·미국채·브라질국채 / 펀드·사모펀드(수익률 순위) / ELS — 하위 3개 · 기존 카테고리 형식과 비슷하게」
   세 탭: bond(🏦 채권) · fund(📦 펀드) · els(🎯 ELS). 숫자는 미래에셋 공개 화면에서 받은 그대로 — 사라는 뜻 아님. */
(function(){
  var e = V.e, cls = V.cls, fmt = V.fmt;
  var SEL = {}, PER = "m3";
  try { SEL = JSON.parse(localStorage.getItem("prodsel") || "{}"); PER = localStorage.getItem("prodper") || "m3"; } catch(x) {}
  function keep(){ try { localStorage.setItem("prodsel", JSON.stringify(SEL)); localStorage.setItem("prodper", PER); } catch(x) {} }
  function card(t, b, x, id){ return '<section class="card"' + (id ? ' id="' + id + '"' : '') + '>' + (t ? '<h3>' + t + (x || "") + '</h3>' : '') + b + '</section>'; }
  function P(){
    // 🇧🇷 10/21: 브라질 실시간 금리(archive/x/brl_live.json, 평일 20분마다)를 함께 — 못 받아도 상품 화면은 그대로
    return Promise.all([getJSON("archive/x/products.json?" + Math.floor(Date.now() / 300000), {ttl: 300000}),
      getJSON("archive/x/brl_live.json?" + Math.floor(Date.now() / 60000), {ttl: 60000}).catch(function(){ return null; })])
      .then(function(a){ var D = a[0]; if (D && a[1]) D.live = a[1]; return D; });
  }
  function pc(v, d){ return v == null ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function sg(v, d){ return v == null ? "–" : '<b class="' + cls(v) + '">' + (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 1 : d) + "%</b>"; }
  function md(d){ return d ? String(d).slice(5).replace("-", "/") : ""; }
  function yrs(r){ return r.yrs + "년" + (r.days ? " " + r.days + "일" : ""); }
  function seg(id, items, on){ return '<div class="seg2" id="' + id + '">' + items.map(function(x){ return '<button' + (x[0] === on ? ' class="on"' : '') + ' data-k="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>'; }
  function bindSeg(id, fn){ var n = document.getElementById(id); if (!n) return; [].forEach.call(n.children, function(b){ b.onclick = function(){ [].forEach.call(n.children, function(x){ x.classList.toggle("on", x === b); }); fn(b.dataset.k); }; }); }
  function holdAt(sel, y){
    var stop = false, t0 = Date.now(), quit = function(){ stop = true; };
    window.addEventListener("touchstart", quit, {once: true, passive: true}); window.addEventListener("wheel", quit, {once: true, passive: true});
    (function f(){ if (stop) return; var n = document.querySelector(sel); if (n){ var d = n.getBoundingClientRect().top - y; if (Math.abs(d) > 1) window.scrollTo({top: window.scrollY + d, behavior: "instant"}); }
      if (Date.now() - t0 < 800) requestAnimationFrame(f); })();
  }
  function line1(vals, labels, opt){ return V.lines([{name: opt.name, color: opt.color || "#7c9cff", vals: vals}], labels, {h: opt.h || 150, endLabels: true, nolegend: true, nodots: true}); }
  function hist(h, n){ h = h || []; return h.slice(-(n || 260)); }
  function lbl(h){ return h.map(function(x){ return x[0].slice(2, 4) + "년 " + (+x[0].slice(5, 7)) + "월"; }); }
  function vals(h){ return h.map(function(x){ return x[1]; }); }
  /* 📘 상품 설명 — 10/16 사용자 「상품들에 대한 자세한 설명도 탭, 접기로」. 중학생도 읽히게 · 사라는 말 없음 */
  var DOC = {
    gov: ["🇰🇷 국고채·국민주택채권이 뭐예요?", "<b>국고채</b>는 대한민국 정부가 돈을 빌리면서 써 주는 차용증이에요. 나라가 망하지 않는 한 이자와 원금을 돌려주니까 우리나라에서 가장 안전한 채권으로 쳐요. <b>국민주택채권</b>은 집을 살 때 의무로 사는 채권이 시장에 나온 것인데 역시 정부가 보증해요.<br><br>" +
      "<b>이름 읽는 법</b> — 「국고채권 01500-5003(20-2)」= 표면금리 1.500%, 만기 2050년 3월, 2020년 두 번째 발행. 표면금리가 낮은 옛날 채권은 값이 싸서(단가 6,049원 = 액면 10,000원짜리를 6,049원에) 만기에 10,000원을 받는 몫이 커요. 이게 <b>세후 수익률</b>이 높은 이유 — 이자(과세)는 적고 차익(비과세)이 크니까.<br><br>" +
      "<b>어떻게 보나</b> — ① <b>세후 수익률</b>: 세금 떼고 1년에 손에 쥐는 비율. ② <b>은행 예금으로 치면</b>: 같은 돈을 예금에 넣었을 때 필요한 세전 금리(비교용). ③ <b>잔존기간</b>: 만기까지 남은 시간 — 길수록 금리가 조금만 움직여도 값이 크게 흔들려요(20년 남은 채권은 금리 1%p 오르면 값이 15% 안팎 빠질 수 있음).<br><br>" +
      "<b>조심할 것</b> — 만기까지 들고 있으면 처음 계산한 수익률 그대로지만, 중간에 팔면 그날 시장 금리로 값이 정해져요. 예금자보호는 없어요(대신 정부 신용). 매수 단위·수수료는 매매 화면에서."],
    ust: ["🇺🇸 미국채가 뭐예요?", "미국 정부가 발행한 채권으로, 세계에서 가장 많이 거래되는 안전자산이에요. 달러로 사고 달러로 이자를 받아요.<br><br>" +
      "<b>이름 읽는 법</b> — 「T 1 1/8 10/31/26」= 미국 국채(T), 표면금리 1.125%(1 1/8), 만기 2026년 10월 31일. <b>시세 수익률</b>이 지금 가격에 사서 만기까지 들면 얻는 연 수익률(달러 기준·세전).<br><br>" +
      "<b>수익은 두 가지</b> — ① 채권 수익률(달러) ② 환율. 1,350원에 사서 1,250원에 돌려받으면 7% 손해, 1,450원이면 7% 이득이 더해져요. 환차익은 비과세, 이자는 15.4% 과세. 표면금리가 낮은 종목(0.375%, 1.125%)은 이자 대신 싸게 사서 만기에 액면을 받는 몫이 커서 세금 면에서 유리해요.<br><br>" +
      "<b>만기 고르기</b> — 1~2년짜리는 금리 변동에 둔감하고 환율만 보면 되고, 10년 넘는 것(2040·2050)은 미국 금리가 내리면 값이 크게 오르고 오르면 크게 빠져요(금리 하락에 거는 투자). 미래에셋은 매일 아침 「미국채 시장동향·판매정보」에 파는 종목과 시세를 올려요. 호주국채도 같은 방식(AUD)."],
    bru: ["🇧🇷 달러표시 브라질국채(글로벌본드)가 뭐예요?", "브라질 정부가 <b>미국 달러</b>로 빌린 채권이에요(국제 시장 발행 · 「글로벌본드」). 헤알 국채와 같은 나라가 갚지만 이자·원금을 <b>달러</b>로 받아요.<br><br>" +
      "<b>헤알 국채와 뭐가 다른가</b> — ① 금리: 헤알 국채는 연 12~13%대, 달러채는 연 5~7%대 — 헤알 환율 위험이 빠진 만큼 낮아요. ② 환율: 헤알이 아니라 <b>원/달러</b>만 신경 쓰면 돼요(미국채와 같은 환율 위험). ③ 위험: 브라질 신용(BB, 투기등급)은 그대로 — 같은 만기 미국채보다 더 주는 몫(<b>가산금리</b>)이 그 위험값이에요.<br><br>" +
      "<b>어떻게 보나</b> — 「시세 수익률」은 지금 가격에 사서 만기까지 들면 얻는 연 수익률(달러·세전). 「미국채 +x%p」가 크게 벌어지면 시장이 브라질 위험을 더 무섭게 본다는 뜻(가격↓), 좁혀지면 그 반대.<br><br>" +
      "<b>세금</b> — 헤알 국채의 개인 비과세(한-브라질 조세협약)가 달러채에도 똑같이 적용되는지는 사기 전에 미래에셋에 꼭 확인하세요. 아래 계산서는 보수적으로 이자 15.4% 과세로 계산했어요. 장외 최소 거래 단위가 큰 종목(액면 20만 달러 등)이 많아 소액은 어려울 수 있어요."],
    brl: ["🇧🇷 브라질국채가 뭐예요?", "브라질 정부가 헤알(BRL)로 발행한 채권이에요. 금리가 연 10%를 넘는 대신 ① 헤알 환율이 크게 흔들리고 ② 신용등급이 BB(투기등급)라 위험이 커요.<br><br>" +
      "<b>왜 인기였나</b> — 한국-브라질 조세협약으로 <b>개인은 이자·매매차익·환차익 모두 비과세</b>예요(법인은 과세). 금융소득종합과세에 안 잡혀서 자산가들이 많이 샀어요. 단, 협약·법이 바뀌면 달라질 수 있어요.<br><br>" +
      "<b>여기서는 이표채(NTN-F)만</b> — 6개월마다(1월·7월 1일) 연 10% 이자를 주는 고정금리 채권이에요. 지금 시장 금리가 10%보다 높으면 액면보다 싸게, 낮으면 비싸게 거래돼요. 할인채(LTN)·물가채(NTN-B)는 목록에서 뺐어요.<br><br>" +
      "<b>환율이 전부</b> — 금리 12%를 받아도 헤알이 12% 떨어지면 원화로는 0이에요. 헤알/원이 쌀 때(아래 차트 낮은 쪽) 사면 환차익이 더해지고, 비쌀 때 사면 금리를 다 까먹을 수 있어요. 2011년 1헤알=700원이던 게 지금 260원대 — 긴 하락이었어요.<br><br>" +
      "<b>미래에셋에서는</b> — 판매가 아니라 <b>단순중개</b>: 홈페이지에 종목표가 없고 MAPS(해외채권 중개)나 영업점에서 종목·금리를 받아요. 수수료 연환산 오프라인 30bp·온라인 15bp. 아래 종목·금리는 브라질 재무부가 매일 공개하는 Tesouro Direto 기준이라 미래에셋 중개 금리와는 조금 다를 수 있어요."],
    oth: ["공사채·회사채·신종자본증권이 뭐예요?", "<b>공사채</b>는 한국전력·도로공사·수자원공사처럼 정부가 뒤에 있는 공기업이 발행한 채권(국채보다 금리 조금 높고 거의 안전). <b>지방채</b>는 서울·부산 같은 지자체(도시철도공채 등). <b>회사채</b>는 일반 기업 — 신용등급(AAA~BBB)이 낮을수록 금리가 높고 부도 위험이 있어요.<br><br>" +
      "<b>신종자본증권·조건부자본증권(코코본드)</b> — 은행·금융지주가 발행하는 「만기 없는(영구) 채권」이에요. 금리가 높은 대신 ① 은행이 부실해지면 원금이 <b>상각(0원)</b>되거나 주식으로 바뀌고 ② 이자 지급이 중단될 수 있고 ③ 보통 5년 뒤 「콜」로 갚지만 안 갚을 수도 있어요. 그래서 「매우높은위험」 표시가 붙어요. 2023년 크레디트스위스 사태 때 실제로 0원이 됐어요.<br><br>" +
      "<b>어떻게 보나</b> — 세후 수익률이 국고채보다 얼마나 높은지(그 차이가 위험의 값), 잔존기간, 위험 등급. 「후순위」는 회사가 망하면 다른 채권자보다 늦게 받는다는 뜻."],
    fund: ["📦 펀드가 뭐예요? (공모 · 사모 · 재간접)", "<b>펀드</b>는 여러 사람 돈을 모아 전문가(운용사)가 대신 투자하는 바구니예요. 바구니 값(기준가)이 매일 바뀌고, 수익률 = 기준가가 얼마나 올랐나.<br><br>" +
      "<b>공모펀드</b> — 누구나 1만원부터 살 수 있고, 금융투자협회에 매일 기준가·수익률을 공시해요. 미래에셋 펀드검색에 1,700여 개.<br>" +
      "<b>사모펀드</b> — 49인 이하(일반투자자)에게만 비공개로 파는 펀드. 일반투자자는 최소 3억원, 운용 전략·보유 종목을 공개 안 해도 되고 규제가 느슨해서 헤지펀드(롱숏·멀티전략)·Pre-IPO·메자닌·코스닥벤처 같은 투자를 해요. 성적을 공개할 의무가 없어서 인터넷에는 성적표가 없어요.<br>" +
      "<b>🔒 사모 라인업</b> — 미래에셋증권이 파는 주요 사모펀드 라인업 화면(사내용)을 옮긴 거라 비밀번호로 잠가 두었어요. 전략별(롱·롱숏·멀티·Pre-IPO·메자닌·공모주하이일드·코스닥벤처·PE)로 걸러 보고, 펀드를 누르면 전략 설명과 연도별 성적이 나와요.<br><br>" +
      "<b>수익률 읽는 법</b> — 기간(3개월·1년·3년)마다 순위가 완전히 달라져요. 1년 +80%는 「작년에 좋았다」지 「내년에도」가 아니에요. 같은 유형끼리 비교(주식형 vs 주식형)하고, <b>순자산</b>이 너무 작은 펀드(10억 미만)는 수익률이 왜곡되기 쉬워 뺐어요. <b>위험 등급</b> 1(매우높음)~6(매우낮음). 수수료 「선취」는 살 때 떼고, 「총보수」는 매년 떼요(온라인 클래스 e 가 보통 싸요).<br><br>" +
      "<b>사모 성적 읽는 법</b> — 운용사 기준가로 계산한 값이라 결산 때 이익을 나눠 주고 기준가가 1,000 근처로 돌아가는 펀드(멀티전략 하우스에 흔함)는 기준가 숫자가 아니라 <b>연도별 수익률</b>로 보세요. Pre-IPO·PE는 평가가 드물게 바뀌어 한동안 0%였다가 한 번에 뛰어요. 달러 펀드는 달러 기준. 「손익차등형 2종」은 후순위(레버리지)라 등락이 커요."],
    els: ["🎯 ELS · ELB · DLS가 뭐예요?", "<b>ELS(주가연계증권)</b>는 「정해진 조건만 지키면 연 X% 줄게」라는 증권사와의 약속이에요. 기초자산(KOSPI200·삼성전자 같은 지수나 주식)이 <b>많이 안 떨어지면</b> 이자를 받고, <b>많이 떨어지면</b> 그만큼 손실이에요. 주식처럼 오르는 만큼 버는 게 아니라, 「안 떨어지는 데」 거는 투자.<br><br>" +
      "<b>스텝다운 읽기</b> — 「85-85-85-80-75-70, KI 45」: 6개월마다 평가해서 기초자산이 처음의 85%(1·2·3차), 80%(4차), 75%(5차), 70%(만기) 위면 그때 이자와 함께 끝(조기상환). 숫자가 낮을수록 상환되기 쉬워요. <b>KI(녹인) 45</b>: 3년 중 한 번이라도 45% 아래로 떨어지면 만기 때 떨어진 만큼 손실(최대 −100%). 기초자산이 여럿이면 <b>가장 못한 것</b> 기준이라 개수가 많을수록 위험해요(그래서 금리도 높음).<br><br>" +
      "<b>ELB</b>는 원금지급형 — 조건이 안 맞아도 원금은 증권사가 줘요(다만 증권사가 망하면 못 받음 · 예금자보호 없음). <b>DLS</b>는 기초자산이 금리·환율·원유 같은 것. <b>월지급식</b>은 매달 이자를 주고, <b>주식지급형</b>은 손실 때 현금 대신 주식으로 줘요.<br><br>" +
      "<b>조심할 것</b> — 연 20%짜리는 그만큼 떨어질 확률이 높다는 뜻(기초자산이 변동성 큰 개별주). 「고난도 상품」은 청약 뒤 숙려기간(하루)이 있어 취소할 수 있어요. <b>모인 돈/한도</b>는 인기 — 한도를 넘으면 배정이 줄어요. 중도 해지는 평가금액의 95% 안팎만 받아요."]
  };
  function doc(k){ var d = DOC[k]; return d ? '<details class="card cpx-d pd-doc"><summary>📘 ' + e(d[0]) + ' <span class="mut">누르면 설명</span></summary><p>' + d[1] + '</p></details>' : ""; }
  var WARN = '<p class="note">미래에셋증권 홈페이지에 공개된 숫자를 그대로 옮긴 거예요. 사라는 뜻이 아니고, 실제 매수 조건(금리·수수료·세금)은 매매 화면에서 다시 확인하세요.</p>';

  /* ───────── 🏦 채권 ───────── */
  function bondView(D){
    var k = SEL.bond || "gov", K = D.krw || [], U = D.ust || {}, A = D.aud || {}, B = D.brl || {};
    var gov = K.filter(function(r){ return r.kind === "국채"; }), oth = K.filter(function(r){ return r.kind !== "국채"; });
    var top = function(a, f){ return a.slice().sort(function(x, y){ return (y[f] || 0) - (x[f] || 0); })[0]; };
    var g1 = top(gov, "after"), u1 = (U.items || []).slice().sort(function(x, y){ return (y.ytm || 0) - (x.ytm || 0); })[0], brl = (B.fx || []).slice(-1)[0], brl0 = (B.fx || []).slice(-2)[0];
    var h = '<div class="mg-kv">' +
      '<div><small>🇰🇷 국고채 세후 최고</small><b class="up">' + (g1 ? pc(g1.after) : "–") + '</b><em>' + (g1 ? e(g1.name) + " · " + yrs(g1) : "") + '</em></div>' +
      '<div><small>🇺🇸 미국채 10년 금리</small><b>' + (U.y10 != null ? pc(U.y10) : "–") + '</b><em>' + (U.y10_prev != null ? "전일 " + pc(U.y10_prev) + " · 환율 " + fmt(U.fx) : "") + '</em></div>' +
      '<div><small>🇺🇸 판매 미국채 최고 수익률</small><b>' + (u1 ? pc(u1.ytm) : "–") + '</b><em>' + (u1 ? e(u1.name) + " · 만기 " + e(u1.mat) : "") + '</em></div>' +
      '<div><small>🇧🇷 헤알/원 환율</small><b>' + (brl ? fmt(brl[1]) : "–") + '</b><em>' + (brl && brl0 ? "하루 " + V.sgn((brl[1] / brl0[1] - 1) * 100, 2) + "% · " + md(brl[0]) : "") + '</em></div></div>';
    h += seg("pdseg", [["gov", "🇰🇷 국채"], ["ust", "🇺🇸 미국채"], ["brl", "🇧🇷 브라질(헤알)"], ["bru", "🇧🇷 브라질(달러)"], ["oth", "공사채·회사채"]], k) + sortBar() + '<div id="pdbody">' + bondBody(D, k) + '</div>';
    if (D.notice && D.notice.length) h += '<details class="card cpx-d"><summary>📢 채권 공지 <span class="mut">미래에셋 · 최근 ' + D.notice.length + '건</span></summary>' +
      D.notice.map(function(n){ return '<a class="pd-nt" href="' + e(n.url) + '" target="_blank" rel="noopener"><span class="mut">' + e(n.date || "") + '</span>' + e(n.title) + '</a>'; }).join("") + '</details>';
    return h + WARN;
  }
  /* 🧾 10/16 사용자: 「펀드나 채권 누르면 각각에 대한 설명 혹은 모의 투자계산서 나오게 탭 접기」 — 행을 누르면 그 밑에 설명 + 계산서가 펼쳐짐 */
  var OBJ = {}, OBN = 0, AMT = 1000;
  try { AMT = +localStorage.getItem("prodamt") || 1000; } catch(x) {}
  function reg(kind, o){ var id = "x" + (++OBN); OBJ[id] = {k: kind, o: o}; return ' data-x="' + id + '"'; }
  /* 📅 10/21 사용자 「채권 솔팅할 때 만기순으로도 조회 가능하게 탭」 — 채권 모든 칸(국채·미국채·브라질 헤알/달러·공사채)에 같은 정렬 탭
     y = 수익률 높은 순(기본) · m = 만기 빠른 순 · M = 만기 먼 순. 고른 값은 이 기기에 기억 */
  var BSL = {y: "수익률 높은 순", m: "만기 빠른 순", M: "만기 먼 순"};
  function bsk(){ return BSL[SEL.bsort] ? SEL.bsort : "y"; }
  function bs(a, yk, mk){ var k = bsk(); mk = mk || "mat";
    return a.slice().sort(function(x, y){
      if (k === "y") return (y[yk] == null ? -1e9 : y[yk]) - (x[yk] == null ? -1e9 : x[yk]) || String(x[mk]).localeCompare(String(y[mk]));
      var c = String(x[mk] || "").localeCompare(String(y[mk] || "")); return (k === "m" ? c : -c) || (y[yk] || 0) - (x[yk] || 0); }); }
  function sortBar(){ return '<div class="pd-sort"><span class="mut">정렬</span>' + seg("pdbsort", [["y", "💰 수익률순"], ["m", "📅 만기 빠른순"], ["M", "📅 만기 먼순"]], bsk()) + '</div>'; }
  function bondRows(rows, hi){
    if (!rows.length) return '<div class="empty">지금 파는 상품이 없어요.</div>';
    var mx = Math.max.apply(null, rows.map(function(r){ return r.after || 0; }).concat([0.1]));
    return '<div class="pd-list">' + rows.map(function(r, i){
      return '<div class="pd-it pd-tap"' + reg("krw", r) + '><div class="pd-h"><span class="rk">' + (i + 1) + '</span><div class="pd-n"><b>' + e(r.name) + '</b><small>' + e(r.risk) + ' · 잔존 ' + yrs(r) + ' · ' + (/^9999/.test(r.mat) ? '영구채(콜 가능)' : '만기 ' + e(r.mat)) + '</small></div>' +
        '<div class="pd-v"><b class="up">' + pc(r.after) + '</b><small>세후 수익률</small></div></div>' +
        '<div class="pd-bar"><i style="width:' + ((r.after || 0) / mx * 100).toFixed(0) + '%"></i></div>' +
        '<div class="pd-row"><span>매수금리 <b>' + pc(r.buy, 3) + '</b></span><span>은행 예금으로 치면 <b>' + pc(r.bank) + '</b></span><span>단가 <b>' + fmt(r.px) + '</b></span></div></div>';
    }).join("") + '</div>';
  }
  function bondBody(D, k){
    var K = D.krw || [], U = D.ust || {}, A = D.aud || {}, B = D.brl || {}, H = D.ust_hist || {};
    if (k === "gov"){
      var g = bs(K.filter(function(r){ return r.kind === "국채"; }), "after");
      return doc("gov") + card("🇰🇷 국고채·국민주택채권 <span class='mut'>장외채권 · " + (bsk() === "y" ? "세후 수익률 높은" : BSL[bsk()].replace(" 순", "")) + " 순 · " + g.length + "개</span>",
        '<p class="note" style="margin:0 0 10px">「세후 수익률」은 이자 세금(15.4%)을 뗀 뒤 1년에 실제로 손에 쥐는 비율, 「은행 예금으로 치면」은 같은 돈을 예금했을 때 필요한 세전 금리예요. 만기가 긴 국채는 중간에 팔면 값이 크게 움직여요.</p>' + bondRows(g));
    }
    if (k === "ust"){
      var y = hist(H.y10, 260), fx = hist(H.usdkrw, 260), items = bs(U.items || [], "ytm");
      var h = doc("ust") + card("🇺🇸 미래에셋이 파는 미국채 <span class='mut'>" + e(U.date ? md(U.date) + " 판매정보 · " : "") + BSL[bsk()] + "</span>",
        (items.length ? '<div class="pd-list">' + items.map(function(r){
          var yr = Math.max(0, (new Date(r.mat) - Date.now()) / 365.25 / 864e5);
          return '<div class="pd-it pd-tap"' + reg("ust", Object.assign({fx: U.fx}, r)) + '><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' (약 ' + yr.toFixed(1) + '년) · 표면금리 ' + pc(r.cpn, 3) + ' · ' + e(r.cur) + '</small></div>' +
            '<div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>시세 수익률(세전)</small></div></div></div>'; }).join("") + '</div>' : '<div class="empty">오늘 판매정보가 아직 없어요.</div>') +
        '<p class="note">미국채는 달러로 사요 — 수익률은 달러 기준이고, 원화로 바꾸면 환율만큼 더해지거나 빠져요. 이자는 과세(15.4%), 표면금리가 낮은 채권은 이자 대신 싸게 사서 만기에 액면을 받는 몫이 커요. 매일 아침 미래에셋이 올리는 「미국채 시장동향·판매정보」 글에서 가져왔어요' + (U.url ? ' (<a href="' + e(U.url) + '" target="_blank" rel="noopener">원문</a>)' : '') + '.</p>');
      h += ustAll(D);
      h += card("미국 10년 국채 금리 <span class='mut'>1년 · 야후</span>", (y.length > 5 ? line1(vals(y), lbl(y), {name: "10년", color: "#e66767", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 10년 금리 ' + (U.y10 != null ? '<b>' + pc(U.y10) + '</b> (전일 ' + pc(U.y10_prev) + ')' : '–') + '. 금리가 오르면 이미 산 채권 값은 내려가고, 내리면 올라가요 — 만기가 길수록 더 크게.</p>');
      h += card("원/달러 환율 <span class='mut'>1년</span>", (fx.length > 5 ? line1(vals(fx), lbl(fx), {name: "원/달러", color: "#7c9cff", h: 130}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 ' + (U.fx != null ? '<b>' + fmt(U.fx) + '원</b> (전일 ' + fmt(U.fx_prev) + ')' : '–') + '. 달러가 싸질 때 사 두면 환차익, 비쌀 때 사면 환손실이 더해져요.</p>');
      if (A.items && A.items.length) h += '<details class="card cpx-d"><summary>🇦🇺 호주국채도 팔아요 <span class="mut">' + A.items.length + '개 · 10년 ' + pc(A.y10) + '</span></summary><div class="pd-list">' + bs(A.items, "ytm").map(function(r){
        return '<div class="pd-it pd-tap"' + reg("aud", Object.assign({fx: A.fx}, r)) + '><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' · 표면 ' + pc(r.cpn) + ' · AUD</small></div><div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>수익률</small></div></div></div>'; }).join("") +
        '</div><p class="note">호주달러 환율 ' + fmt(A.fx) + '원 · 신용등급 AAA · 이자 과세.</p></details>';
      return h;
    }
    if (k === "bru") return bruBody(D);
    if (k === "brl"){
      var f = hist(B.fx, 260), ub = hist(B.usdbrl, 260), last = f.slice(-1)[0], first = f[0];
      var yr1 = last && first ? (last[1] / first[1] - 1) * 100 : null;
      /* 10/16 사용자 「브라질국채는 할인채랑 물가채 빼」 — LTN(할인채)·NTN-B/NTN-C(물가채) 숨김, 이표채 NTN-F 만 (LFT 는 접어서) */
      var T = (D.td || []).filter(function(x){ return x.code === "NTN-F"; }), TH = {}; Object.keys(D.td_hist || {}).forEach(function(k){ if (/^NTN-F/.test(k)) TH[k] = D.td_hist[k]; });
      var grp = {}; T.forEach(function(x){ (grp[x.kind] = grp[x.kind] || []).push(x); });
      var h = doc("brl") + liveStrip(D) + card("🇧🇷 브라질국채 <span class='mut'>미래에셋 · 단순중개</span>",
        '<div class="pd-brl"><div><small>이자 세금</small><b class="up">비과세</b><em>개인 · 한-브라질 조세협약</em></div><div><small>신용등급</small><b>BB</b><em>투기등급 (국제)</em></div><div><small>통화</small><b>BRL</b><em>헤알 · USD 표시도</em></div><div><small>종류</small><b>NTN-F</b><em>이표채 · 연 10% · 6개월마다 이자</em></div></div>' +
        '<p class="note">미래에셋은 브라질국채를 「판매」가 아니라 <b>단순중개</b>로 다뤄요 — 홈페이지에 매일 파는 종목표가 올라오지 않고, MAPS(해외채권 중개 화면)나 영업점에서 종목·금리를 받아요. 수수료 연환산 오프라인 30bp · 온라인 15bp. 아래 종목·금리는 <b>브라질 재무부(Tesouro Direto)</b>가 매일 공개하는 값이라 미래에셋 중개 호가와는 조금 다를 수 있어요.</p>');
      var AN = D.anb || [], fxb = last ? last[1] : null;
      var brow = function(x){
        var yr = Math.max(0, (new Date(x.mat) - Date.now()) / 365.25 / 864e5);
        return '<div class="pd-it pd-tap"' + reg("brl", Object.assign({fx: fxb}, x)) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.code) + ' ' + e(x.mat.slice(0, 7).replace("-", "/")) + '</b><small>만기 ' + e(x.mat) + ' (약 ' + yr.toFixed(1) + '년) · 단가 R$ ' + fmt(x.pu) + '</small></div>' +
          '<div class="pd-v"><b class="up">' + (x.code === "NTN-B" || x.code === "NTN-C" ? (x.code === "NTN-B" ? "IPCA+" : "IGPM+") : x.code === "LFT" ? "Selic+" : "") + (x.r != null ? x.r.toFixed(x.code === "LFT" ? 3 : 2) + "%" : "–") + '</b><small>' + (x.code === "LTN" || x.code === "NTN-F" ? "연 금리(헤알·고정)" : x.code === "LFT" ? "Selic 가산" : "물가 + 연") + '</small></div></div></div>'; };
      if (AN.length){
        var ag = {}; AN.forEach(function(x){ (ag[x.code] = ag[x.code] || []).push(x); });
        h += card("브라질 이표채(NTN-F) 전 종목 <span class='mut'>" + AN.filter(function(x){ return x.code === "NTN-F"; }).length + "개 · ANBIMA " + e(AN[0].asof) + "</span>",
          ["NTN-F"].filter(function(c){ return ag[c]; }).map(function(c){ return '<div class="sub2">' + e(c) + ' <span class="mut">' + e(ag[c][0].kind) + ' · ' + ag[c].length + '개 · ' + BSL[bsk()] + '</span></div><div class="pd-list">' + bs(ag[c], "r").map(brow).join("") + '</div>'; }).join("") +
          '<p class="note">브라질 금융시장협회(ANBIMA)가 매일 내는 <b>유통시장 지표금리</b> — 시장에서 실제로 거래되는 고정금리 이표채(NTN-F) 전부예요 — 할인채(LTN)·물가채(NTN-B)는 뺐어요. 미래에셋 중개 호가는 이것과 조금 달라요. 종목을 누르면 만기까지 현금흐름이 나와요.</p>') +
          (ag.LFT ? '<details class="card cpx-d"><summary>LFT (Selic 변동금리) ' + ag.LFT.length + '개 <span class="mut">한국 투자자는 거의 안 사요</span></summary><div class="pd-list">' + bs(ag.LFT, "r").map(brow).join("") + '</div></details>' : '');
      } else if (T.length){
        h += card("만기별 브라질 국채 <span class='mut'>" + T.length + "개 · 브라질 재무부</span>", '<div class="pd-list">' + bs(T, "r").map(function(x){ return brow({code: x.code, kind: x.kind, mat: x.mat, pu: x.px, r: x.r, asof: x.asof}); }).join("") + '</div>');
      }
      Object.keys(TH).forEach(function(nm){ var hh = hist(TH[nm], 260); if (hh.length > 5) h += card("브라질 국채 금리 · " + e(nm) + " <span class='mut'>1년 · 연 %</span>", line1(vals(hh), lbl(hh), {name: nm, color: "#d95926", h: 130})); });
      h += card("헤알/원 환율 <span class='mut'>1년 · 원/달러 ÷ 헤알/달러</span>", (f.length > 5 ? line1(vals(f), lbl(f), {name: "헤알/원", color: "#199e70", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
          '<p class="note">지금 <b>' + (last ? fmt(last[1]) + "원" : "–") + '</b>' + (yr1 != null ? ' · 1년 ' + sg(yr1) : '') + '. 브라질국채 수익은 「채권 금리 + 환율」이라 헤알이 싸질 때 사면 환차익 몫이 커지고, 비쌀 때 사면 금리를 받아도 환손실이 더 클 수 있어요.</p>') +
        card("헤알/달러 <span class='mut'>1년 · 숫자가 커지면 헤알 약세</span>", (ub.length > 5 ? line1(vals(ub), lbl(ub), {name: "헤알/달러", color: "#c98500", h: 120}) : '<div class="spark-empty">자료 준비 중</div>'));
      return h;
    }
    var o = bs((D.krw || []).filter(function(r){ return r.kind !== "국채"; }), "after");
    var kinds = {}; o.forEach(function(r){ kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
    return doc("oth") + card("공사채·회사채·신종자본증권 <span class='mut'>장외채권 · " + (bsk() === "y" ? "세후 수익률 높은" : BSL[bsk()].replace(" 순", "")) + " 순 · " + o.length + "개</span>",
      '<div style="margin-bottom:8px">' + Object.keys(kinds).map(function(x){ return '<span class="chip2">' + e(x) + ' ' + kinds[x] + '</span>'; }).join("") + '</div>' +
      '<p class="note" style="margin:0 0 10px">「매우높은위험」으로 표시된 조건부자본증권(신종·후순위)은 은행이 어려워지면 원금을 날릴 수 있어서 금리가 높아요. 위험 등급을 꼭 같이 보세요.</p>' + bondRows(o));
  }

  /* 🇧🇷 10/21 사용자 「달러표시 브라질국채도 다른 것들과 똑같이 · 구분해서 · 실시간 금리 잘 반영」
     archive/x/brl_live.json (brl_live.py · 평일 20분마다): 글로벌본드 전 종목 시세·수익률(TradingView — BONDS.com 실시간 우선) · 같은 만기 미국채 대비 가산금리 · 헤알 10년·환율(CNBC) */
  function ago(at){ if (!at) return ""; var t = Date.parse(at.replace(" ", "T") + ":00+09:00"); if (isNaN(t)) return at; var m = Math.round((Date.now() - t) / 60000); return m < 1 ? "방금" : m < 60 ? m + "분 전" : m < 1440 ? Math.round(m / 60) + "시간 전" : md(at.slice(0, 10)); }
  function qv(q, k){ return q && q[k] ? q[k] : {}; }
  function liveStrip(D){
    var L = D.live; if (!L || !L.q) return "";
    var b = qv(L.q, "BR10Y"), u = qv(L.q, "US10Y"), r = qv(L.q, "BRL="), w = qv(L.q, "KRW=");
    var cell = function(t, v, c, unit, sub){ return '<div><small>' + t + '</small><b>' + (v != null ? (+v).toFixed(unit === "%" ? 3 : 2) + (unit === "%" ? "%" : "") : "–") + '</b><em>' + (c != null ? '<span class="' + cls(c) + '">' + (c > 0 ? "+" : "") + (+c).toFixed(unit === "%" ? 3 : 2) + (unit === "%" ? "%p" : "") + '</span> ' : '') + (sub || "") + '</em></div>'; };
    return '<div class="pd-live"><div class="pd-lh"><span class="pd-dot"></span>실시간 금리 <span class="mut">' + e(ago(L.q_at || L.at)) + ' 받음 · 평일 20분마다</span></div><div class="mg-kv">' +
      cell("🇧🇷 헤알 국채 10년", b.v, b.chg, "%", b.cpn ? "표면 " + e(b.cpn) : "") + cell("🇺🇸 미국채 10년", u.v, u.chg, "%", "") +
      cell("헤알/원", L.brlkrw, null, "", "원/달러 ÷ 헤알/달러") + cell("원/달러", w.v, w.chg, "", "헤알/달러 " + (r.v != null ? (+r.v).toFixed(3) : "–")) + '</div></div>';
  }
  function bruBody(D){
    var L = D.live || {}, A = bs(L.usd || [], "ytm"), w = qv(L.q, "KRW="), fx = w.v || (D.ust || {}).fx, now = Date.now();
    var h = doc("bru") + liveStrip(D);
    h += card("🇧🇷 달러표시 브라질국채 <span class='mut'>글로벌본드 · " + A.length + "개 · 달러</span>",
      '<div class="pd-brl"><div><small>통화</small><b>USD</b><em>이자·원금 모두 달러</em></div><div><small>신용등급</small><b>BB</b><em>투기등급 (국제)</em></div><div><small>이자</small><b>6개월마다</b><em>고정 표면금리</em></div><div><small>세금</small><b>확인 필요</b><em>헤알 국채 비과세와 같은지 창구 확인</em></div></div>' +
      '<p class="note">미래에셋은 브라질국채를 <b>단순중개</b>(MAPS·영업점)로 다뤄요 — 달러채도 주문 가능 종목·최소 단위·호가는 창구에서 확인하세요. 아래 시세는 국제 채권시장 값이라 미래에셋 중개 호가와 조금 달라요.</p>');
    if (!A.length) return h + card("", '<div class="empty">달러채 시세를 아직 못 받았어요. 20분 안에 다시 들어와요.</div>');
    var sps = A.map(function(x){ return x.sp; }).filter(function(v){ return v != null; });
    var avg = sps.length ? sps.reduce(function(a, b){ return a + b; }, 0) / sps.length : null;
    var mx = Math.max.apply(null, A.map(function(x){ return x.ytm || 0; }).concat([0.1]));
    var row = function(x){
      var yr = Math.max(0, (new Date(x.mat) - now) / 365.25 / 864e5);
      return '<div class="pd-it pd-tap"' + reg("bru", {fx: fx, name: x.name, mat: x.mat, cpn: x.cpn || 0, ytm: x.ytm, cur: "USD", sp: x.sp, src: x.src}) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.name) + '</b><small>만기 ' + e(x.mat) + ' (약 ' + yr.toFixed(1) + '년) · 가격 ' + (+x.px).toFixed(2) + (x.chg != null ? ' <span class="' + cls(x.chg) + '">' + (x.chg > 0 ? "+" : "") + (+x.chg).toFixed(2) + '</span>' : '') + '</small></div>' +
        '<div class="pd-v"><b class="up">' + pc(x.ytm) + '</b><small>' + (x.sp != null ? '미국채 +' + x.sp.toFixed(2) + '%p' : '시세 수익률') + '</small></div></div>' +
        '<div class="pd-bar"><i style="width:' + ((x.ytm || 0) / mx * 100).toFixed(0) + '%"></i></div>' +
        '<div class="pd-row"><span>같은 만기 미국채 <b>' + pc(x.ust) + '</b></span><span>' + e(x.src) + '</span><span class="mut">' + e(x.isin) + '</span></div></div>'; };
    h += card("전 종목 <span class='mut'>" + BSL[bsk()] + " · 수익률 = 달러·세전</span>",
      '<div class="pd-list">' + A.map(row).join("") + '</div>' +
      '<p class="note">「미국채 +x%p」= 같은 만기 미국 국채(재무부 ' + e(md(L.curve)) + ' 곡선)보다 더 주는 금리, 곧 <b>브라질 위험값</b>이에요' + (avg != null ? ' — 지금 평균 <b>+' + avg.toFixed(2) + '%p</b>' : '') + '. 이 값이 벌어지면 브라질 달러채 값이 빠지고, 좁혀지면 올라요. 시세는 BONDS.com 실시간이 있으면 그 값, 없으면 유럽 거래소들(15분 지연)의 가운데 값 · ' + e(ago(L.usd_at || L.at)) + ' 받음. 종목을 누르면 모의 투자계산서가 나와요.</p>');
    var HH = Object.keys(L.hist || {}).sort().map(function(d){ return [d, L.hist[d]]; });
    var s1 = HH.filter(function(x){ return x[1].sp10 != null; }).map(function(x){ return [x[0], x[1].sp10]; });
    var s2 = HH.filter(function(x){ return x[1].brl10 != null && x[1].usd10 != null; });
    if (s1.length > 5) h += card("10년 달러채 가산금리 흐름 <span class='mut'>미국채보다 +%p</span>", line1(vals(s1), lbl(s1), {name: "가산금리", color: "#d95926", h: 130}));
    if (s2.length > 5) h += card("헤알 10년 − 달러 10년 <span class='mut'>%p</span>", line1(vals(s2.map(function(x){ return [x[0], x[1].brl10 - x[1].usd10]; })), lbl(s2), {name: "헤알 − 달러", color: "#199e70", h: 120}) + '<p class="note">두 금리 차이 = 시장이 헤알 약세(환율 위험)에 요구하는 몫이에요.</p>');
    else h += '<p class="note" style="margin:6px 4px 12px">📈 가산금리·헤알 대비 흐름 그래프는 10/21부터 하루 한 점씩 쌓여요(일주일쯤 뒤부터 보여요).</p>';
    var b = qv(L.q, "BR10Y"), bm = A.reduce(function(p, x){ var t = Math.abs((new Date(x.mat) - now) / 365.25 / 864e5 - 10); return !p || t < p[0] ? [t, x] : p; }, null);
    if (b.v != null && bm) h += card("헤알로 살까, 달러로 살까 <span class='mut'>10년 근처 · 지금</span>",
      '<div class="mg-kv"><div><small>🇧🇷 헤알 국채 10년</small><b>' + pc(b.v, 3) + '</b><em>헤알 환율 위험 포함</em></div><div><small>🇧🇷 달러채 ' + e(bm[1].mat.slice(0, 4)) + '년 만기</small><b>' + pc(bm[1].ytm) + '</b><em>원/달러 위험만</em></div></div>' +
      '<p class="note">차이 <b>' + (b.v - bm[1].ytm).toFixed(2) + '%p</b> — 헤알이 달러 대비 1년에 그만큼보다 덜 약해지면 헤알 국채가, 더 약해지면 달러채가 유리해요(세금 차이 제외).</p>');
    return h;
  }

  /* 🇺🇸 미국채 전 종목 — 10/16 사용자 「미국채 종류 훨씬 더 많을껴 다 찾고」. 미국 재무부 MSPD(월말 전 종목) + 일일 수익률 곡선으로 추정한 수익률 */
  var UK = [["", "전체"], ["N", "Note(2~10년물)"], ["B", "Bond(20·30년물)"], ["TIPS", "물가연동(TIPS)"], ["Bill", "T-Bill(1년 이하)"], ["FRN", "변동금리(FRN)"]];
  var UKN = {N: "Note", B: "Bond", TIPS: "물가연동 TIPS", Bill: "T-Bill", FRN: "변동금리 FRN"};
  var UBK = [[0, 1, "1년 이내"], [1, 3, "1~3년"], [3, 7, "3~7년"], [7, 15, "7~15년"], [15, 25, "15~25년"], [25, 99, "25년 넘게"]];
  function ustAll(D){
    var UA = D.ust_all, U = D.ust || {}; if (!UA || !UA.items || !UA.items.length) return "";
    var f = SEL.ustk || "", it = UA.items.filter(function(x){ return !f || x.k === f; }), now = Date.now();
    var mq = {}; (U.items || []).forEach(function(x){ mq[(+x.cpn).toFixed(3) + x.mat] = x.ytm; });
    var gaps = UA.items.filter(function(x){ return x.mir && x.y != null && mq[(+x.cpn).toFixed(3) + x.mat] != null; }).map(function(x){ return mq[(+x.cpn).toFixed(3) + x.mat] - x.y; });
    var gap = gaps.length ? gaps.reduce(function(a, b){ return a + b; }, 0) / gaps.length : null;
    var row = function(x){
      var yr = Math.max(0, (new Date(x.mat) - now) / 365.25 / 864e5), mqy = mq[(+(x.cpn || 0)).toFixed(3) + x.mat];
      return '<div class="pd-it pd-tap"' + reg("ust", {fx: U.fx, name: x.nm, mat: x.mat, cpn: x.cpn || 0, ytm: mqy != null ? mqy : x.y, est: mqy == null, tips: x.k === "TIPS", frn: x.k === "FRN", cur: "USD"}) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.nm) + (x.mir ? ' <span class="chip2 hot" style="margin:0">미래에셋 판매</span>' : '') + '</b><small>' + e(UKN[x.k]) + ' · 만기 ' + e(x.mat) + ' (약 ' + yr.toFixed(1) + '년)' + (x.cpn != null ? ' · 표면 ' + pc(x.cpn, 3) : '') + (x.px ? ' · 가격 약 ' + x.px.toFixed(1) : '') + (x.out ? ' · 잔액 $' + fmt(x.out) + 'B' : '') + '</small></div>' +
        '<div class="pd-v"><b class="up">' + (mqy != null ? pc(mqy) : x.y != null ? pc(x.y) : '변동') + '</b><small>' + (mqy != null ? '미래에셋 시세' : x.k === "TIPS" ? '실질(추정)' : x.y != null ? '추정 수익률' : '3개월물+α') + '</small></div></div></div>'; };
    var groups = UBK.map(function(b){ var a = it.filter(function(x){ var t = (new Date(x.mat) - now) / 365.25 / 864e5; return t >= b[0] && t < b[1]; }); return [b, bs(a, "y")]; }).filter(function(g){ return g[1].length; });
    if (bsk() === "M") groups.reverse();
    return card("🇺🇸 미국채 전 종목 <span class='mut'>" + UA.n + "개 · 미국 재무부</span>",
      '<div class="seg2 wrap" id="pdustk">' + UK.map(function(x){ var n = UA.items.filter(function(r){ return !x[0] || r.k === x[0]; }).length; return '<button' + (x[0] === f ? ' class="on"' : '') + ' data-k="' + x[0] + '">' + x[1] + ' <span class="mut">' + n + '</span></button>'; }).join("") + '</div>' +
      groups.map(function(g, i){ var ys = g[1].map(function(x){ return x.y; }).filter(function(v){ return v != null; }), nm = g[1].filter(function(x){ return x.mir; }).length;
        return '<details class="pd-grp"><summary><b>' + g[0][2] + '</b> <span class="mut">' + g[1].length + '개' + (ys.length ? ' · ' + Math.min.apply(null, ys).toFixed(2) + '~' + Math.max.apply(null, ys).toFixed(2) + '%' : '') + (nm ? ' · 미래에셋 판매 ' + nm : '') + '</span></summary><div class="pd-list">' + g[1].map(row).join("") + '</div></details>'; }).join("") +
      '<p class="note">지금 시장에서 거래되는 미국 국채 <b>전부</b>예요(재무부 월말 명세서 ' + e(UA.mspd) + ' 기준 · 그 뒤 새로 나온 건 다음 달에). 종목별 실시간 시세는 공개 안 돼서, 수익률은 재무부가 매일 내는 <b>수익률 곡선(' + e(UA.curve) + ')을 만기에 맞춰 끼워 넣은 추정치</b>예요' + (gap != null ? ' — 미래에셋이 실제로 파는 종목은 추정보다 평균 <b>' + V.sgn(gap) + '%p</b> 다르게 나와요(표면금리 낮은 옛 채권이 더 비싸게 거래되고, 매도 호가 차이가 있어서)' : '') + '. 「미래에셋 판매」 표시는 미래에셋 시세 그대로. 다른 종목도 미래에셋 해외채권(MAPS)·영업점에서 주문할 수 있는지는 따로 확인하세요. TIPS 수익률은 물가를 뺀 실질 수익률(5년 미만은 5년 값).</p>');
  }

  /* ───────── 📦 펀드 ───────── */
  var PERS = [["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"], ["y3", "3년"]], PN = {m3: "3개월", m6: "6개월", y1: "1년", y3: "3년"};
  function fname(n){ return String(n || "").replace(/\s*\((?:수수료|운용|보수)[^)]*\)\s*/g, "").replace(/\s*(종류|클래스|Class|class|CLASS)\s*[A-Za-z][-A-Za-z0-9]*\s*(\([^)]*\))?\s*$/, ""); }
  function frow(x, i, per){
    var v = x[per];
    return '<div class="pd-it pd-f pd-tap"' + reg("fund", Object.assign({per: per}, x)) + '><div class="pd-h"><span class="rk">' + (i + 1) + '</span><div class="pd-n"><b>' + e(fname(x.n)) + '</b><small>' + e(x.co || "") + ' · ' + e(x.t || "") + (x.st ? ' · ' + e(x.st) : '') + (x.rk ? ' · 위험 ' + x.rk + '등급' : '') + '</small></div>' +
      '<div class="pd-v">' + (v == null ? '<b class="mut">–</b>' : sg(v)) + '<small>' + PN[per] + '</small></div></div>' +
      '<div class="pd-row"><span>3개월 ' + sg(x.m3) + '</span><span>1년 ' + sg(x.y1) + '</span><span>3년 ' + sg(x.y3) + '</span><span>순자산 <b>' + (x.aum != null ? fmt(x.aum) + '억' : '–') + '</b></span></div></div>';
  }
  /* 🔒 사모 라인업 — 10/16 사용자 「사모펀드 다 빼고 이 리스트(미래에셋 사모 주요펀드 라인업)에 있는것만 · 수익률 top30 위주 · 나머지는 펼치기 접기」
     사내용 자료라 평문은 저장소에 없음: archive/x/pv_lineup.enc (AES-256-GCM · PBKDF2) 를 비밀번호로 이 기기에서만 풂 */
  var PVL = null, PVERR = "", PVBUSY = false;
  function b64u(s){ var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function pvUnlock(pw){
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error("이 브라우저는 암호 풀기를 지원하지 않아요"));
    return getJSON("archive/x/pv_lineup.enc?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(E){
      return crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]).then(function(k){
        return crypto.subtle.deriveKey({name: "PBKDF2", salt: b64u(E.s), iterations: E.it, hash: "SHA-256"}, k, {name: "AES-GCM", length: 256}, false, ["decrypt"]);
      }).then(function(key){ return crypto.subtle.decrypt({name: "AES-GCM", iv: b64u(E.i)}, key, b64u(E.c)); });
    }).then(function(buf){ PVL = JSON.parse(new TextDecoder().decode(buf)); return pvLive(PVL); });
  }
  /* 📡 10/16 사용자 「수익률 매일매일 업데이트 해서 채우고」 — 라인업 중 금융투자협회에 기준가를 공시하는 펀드(이름으로 찾아 둔 k)만 매일 갱신 가능.
     archive/x/pv_kofia.json(products.yml 하루 3번)의 최신 기준가 ÷ 10/15 기준가(kb) 비율로 이어 붙임:
     1일·1주·1개월·3개월 = 금투협 값 그대로 · 6개월·1년·올해 = 10/15 표 값 × 그 뒤 변화 (금투협 6개월·1년은 분배·결산으로 기준가가 리셋돼 틀림) */
  function pvLive(L){
    return P().then(function(D){ L.bm = D && D.bm && D.bm.length ? D.bm : []; L.bmasof = L.bm.length ? L.bm[0].asof : null; }, function(){ L.bm = []; }).then(function(){
      var q_ = "?" + Math.floor(Date.now() / 600000), g_ = function(f){ return getJSON("archive/x/" + f + q_, {ttl: 600000}).catch(function(){ return null; }); };
      return Promise.all([g_("pv_nav.json"), g_("pv_kofia.json"), g_("pv_pub.json"), g_("pv_basket.json")]);
    }).then(function(a){
      var H = a[0], K = a[1], n = 0;
      L.kasof = H && H.d ? H.d[H.d.length - 1] : K ? K.asof : null;
      L.rows.forEach(function(o){
        if (!o.k || !o.kb) return;
        var lev = /손익차등|[12]종/.test(o.n), c = H && H.v && H.v[o.k] ? navCalc(H.d, H.v[o.k], lev) : null, q = K && K.i ? K.i[o.k] : null;
        // ✅ 검산: 10/15 까지의 기록만으로 계산한 값이 10/15 화면 값과 5%p 넘게 다르면 그 기간은 직접 계산을 안 믿음(분배·손익차등 구조 등)
        var bad = {};
        if (c && H){ var cut = H.d.filter(function(d){ return d <= o.kd; }).length, c0 = cut > 2 ? navCalc(H.d.slice(0, cut), H.v[o.k].slice(0, cut), lev) : null;
          [["m1", "m1"], ["m3", "m3"], ["m6", "m6"], ["y1", "y1"], ["ytd", "ytd"]].forEach(function(pp){ var sv = pp[0] === "ytd" ? (o.y || {})["2026"] : o[pp[0]], cv = c0 ? c0[pp[1]] : null;
            if (cv == null || sv == null || Math.abs(cv - sv) > 5) bad[pp[0]] = 1; }); }
        var lastNav = c ? c.last : q ? q[0] : null, asof = c ? c.asof : K ? K.asof : null;
        if (!lastNav || !(asof > o.kd)) return;
        var ra = lastNav / o.kb, chain = ra > 0.7 && ra < 1.4 ? function(v){ return v == null ? null : Math.round(((1 + v / 100) * ra - 1) * 10000) / 100; } : function(){ return null; };
        var src = {};
        ["d1", "w1", "m1", "m3", "m6", "y1"].forEach(function(p){
          if (c && c[p] != null && !bad[p]){ o[p] = c[p]; src[p] = "calc"; }
          else if (q && (p === "d1" || p === "w1") && q[p === "d1" ? 1 : 2] != null){ o[p] = q[p === "d1" ? 1 : 2]; src[p] = "kofia"; }
          else { o[p] = chain(o[p]); src[p] = "chain"; }
        });
        o.y = o.y || {};
        if (c && c.ytd != null && !bad.ytd){ o.y["2026"] = c.ytd; src.ytd = "calc"; } else if (o.y["2026"] != null){ o.y["2026"] = chain(o.y["2026"]); src.ytd = "chain"; }
        if (o.nav != null && ra > 0.7 && ra < 1.4) o.nav = Math.round(o.nav * ra * 100) / 100;
        o.live = {asof: asof, ch: Math.round((ra - 1) * 10000) / 100, src: src, resets: c ? c.resets : []};
        o.wk = c ? c.wk : null; n++;
      });
      L.nlive = n;
      try { pvEstimate(L, H, a[2], a[3], L.bm); } catch(z) { console.error(z); }
      L.rows.forEach(function(o){ o.oc = openClose(o); });
      return L;
    }).catch(function(){ return L; });
  }
  /* 기준가 기록으로 직접 계산 — 결산(기준가가 1,000 근처로 리셋, 한 칸에 −15% 넘게)은 그 칸만 빼고 이어 붙임 */
  function navCalc(ds, arr, noReset){
    var pts = []; ds.forEach(function(d, i){ if (arr[i] != null && arr[i] > 0) pts.push([d, arr[i]]); });
    if (pts.length < 2) return null;
    var f = [1], resets = [];
    for (var i = 1; i < pts.length; i++){ var r = pts[i][1] / pts[i - 1][1]; if (!noReset && r < 0.85 && Math.abs(pts[i][1] - 1000) < 60){ r = 1; resets.push(pts[i][0]); } f.push(f[i - 1] * r); }
    var L_ = pts.length - 1, T = function(d){ return Date.parse(d + "T00:00:00Z"); }, now = T(pts[L_][0]);
    var at = function(days, slack){ var t = now - days * 864e5, j = -1; for (var i = 0; i < L_; i++) if (T(pts[i][0]) <= t) j = i; if (j < 0 || t - T(pts[j][0]) > (slack || 8) * 864e5) return null; return Math.round((f[L_] / f[j] - 1) * 10000) / 100; };
    var out = {last: pts[L_][1], asof: pts[L_][0], resets: resets,
      d1: now - T(pts[L_ - 1][0]) <= 4 * 864e5 ? Math.round((f[L_] / f[L_ - 1] - 1) * 10000) / 100 : null,
      w1: at(7, 4), m1: at(30.4), m3: at(91.3), m6: at(182.6), y1: at(365.25)};
    var y0 = pts[L_][0].slice(0, 4) + "-01-01", j = -1; for (var k = 0; k < L_; k++) if (pts[k][0] < y0) j = k;
    out.ytd = j >= 0 && T(y0) - T(pts[j][0]) <= 10 * 864e5 ? Math.round((f[L_] / f[j] - 1) * 10000) / 100 : null;
    var wk = {}, wl = [];                          // 주마다 마지막 점 → 주간 수익률
    pts.forEach(function(p, i){ var dt = new Date(T(p[0])), th = new Date(dt); th.setUTCDate(dt.getUTCDate() + 3 - ((dt.getUTCDay() + 6) % 7)); wk[th.toISOString().slice(0, 10)] = i; });
    Object.keys(wk).forEach(function(kk){ wl.push(wk[kk]); }); wl.sort(function(a, b){ return a - b; });
    out.wk = []; for (var w = 1; w < wl.length; w++){ var i0 = wl[w - 1], i1 = wl[w]; if (T(pts[i1][0]) - T(pts[i0][0]) <= 10 * 864e5) out.wk.push([pts[i1][0], Math.round((f[i1] / f[i0] - 1) * 10000) / 100]); }
    out.wk = out.wk.slice(-13);
    return out;
  }
  /* 🧮 10/16 사용자 「어떻게 해서든 찾으라고 · 아니면 구성 종목으로 네가 계산해」 — 금투협에 기준가가 없는 펀드의 추정
     후보 줄: ① 같은 운용사 공모펀드 기준가(사모재간접 = 그 운용사 사모펀드를 담은 공모펀드 포함, pv_pub.json)
              ② 운용사 바스켓(5% 넘게 가진 종목을 평가금액 비중으로, pv_hold.yml → pv_basket.json) ③ 같은 전략 실측 펀드 평균 ④ 코스피·코스닥
     → 10/15 화면의 1주·1개월·3개월·6개월·1년 성적과 같은 기간 후보 수익률로 민감도 b 를 맞추고(로그 수익률 최소제곱, 원점 지남),
       오차가 가장 작은 후보로 10/15 뒤 변화 = (1 + 후보 변화)^b − 1 을 이어 붙임. 시장 줄(②④)은 펀드 기준가가 전날 종가라 하루 앞 날짜로 맞춤 */
  var ANCHOR = "2026-10-15";
  function serNav(ds, arr){ var d = [], f = [], prev = null, acc = 1;
    for (var i = 0; i < ds.length; i++){ var v = arr[i]; if (v == null || !(v > 0)) continue; if (prev != null){ var r = v / prev; if (r < 0.85 && Math.abs(v - 1000) < 60) r = 1; acc *= r; } d.push(ds[i]); f.push(acc); prev = v; }
    return d.length > 3 ? {d: d, f: f, nav: true} : null; }
  function serMkt(ds, vs){ return ds && ds.length > 3 ? {d: ds, f: vs, nav: false} : null; }
  function sAt(S, date, strict){ var T = Date.parse(date + "T00:00:00Z"), j = -1; for (var i = 0; i < S.d.length; i++){ if (strict ? S.d[i] < date : S.d[i] <= date) j = i; else break; }
    if (j < 0 || T - Date.parse(S.d[j] + "T00:00:00Z") > 9 * 864e5) return null; return S.f[j]; }
  function sAgo(date, days){ return new Date(Date.parse(date + "T00:00:00Z") - days * 864e5).toISOString().slice(0, 10); }
  function sWin(S, end, days){ var st = !S.nav, a = sAt(S, end, st), b = sAt(S, sAgo(end, days), st); return a != null && b != null ? a / b - 1 : null; }
  var WINS = [["w1", 7], ["m1", 30.4], ["m3", 91.3], ["m6", 182.6], ["y1", 365.25]];
  function fitCand(o, S){
    var xs = [], ys = [];
    WINS.forEach(function(w){ var fr = o[w[0]], cr = sWin(S, ANCHOR, w[1]); if (fr == null || cr == null || fr <= -99 || cr <= -0.99) return; xs.push(Math.log(1 + cr)); ys.push(Math.log(1 + fr / 100)); });
    if (xs.length < 3) return null;
    var sxy = 0, sxx = 0; xs.forEach(function(x, i){ sxy += x * ys[i]; sxx += x * x; }); if (sxx < 1e-5) return null;
    var b = Math.max(0, Math.min(3, sxy / sxx)), se = 0; xs.forEach(function(x, i){ se += Math.pow(ys[i] - b * x, 2); });
    return {b: b, err: Math.sqrt(se / xs.length) * 100, n: xs.length};
  }
  function pvEstimate(L, H, PUB, BK, bm){
    var live = L.rows.filter(function(o){ return o.live && o.k && H && H.v && H.v[o.k]; });
    var peer = {};                                     // 같은 전략 실측 펀드 평균 줄 (pv_nav 날짜 기준)
    live.forEach(function(o){ var S = serNav(H.d, H.v[o.k]); if (!S) return; (peer[o.s] = peer[o.s] || []).push(S); });
    var peerSer = function(s){ var P_ = peer[s]; if (!P_ || P_.length < 2) return null; var d = [], f = [];
      H.d.forEach(function(dd){ var a = [], base; P_.forEach(function(S){ var v = sAt(S, dd), z = sAt(S, ANCHOR); if (v != null && z) a.push(v / z); }); if (a.length >= 2){ d.push(dd); f.push(a.reduce(function(x, y){ return x + y; }, 0) / a.length); } });
      return d.length > 3 ? {d: d, f: f, nav: true} : null; };
    var pubBy = {}; if (PUB && PUB.v) Object.keys(PUB.v).forEach(function(c){ var nm = (PUB.n || {})[c]; if (!nm) return; (pubBy[nm[1]] = pubBy[nm[1]] || []).push(c); });
    var n = 0;
    L.rows.forEach(function(o){
      if (o.live) return;
      var C = [];
      if (o.mg && pubBy[o.mg]) pubBy[o.mg].slice(0, 40).forEach(function(c){ var S = serNav(PUB.d, PUB.v[c]); if (S) C.push([S, "같은 운용사 공모펀드 「" + fname(PUB.n[c][0]) + "」 기준가", "pub"]); });
      if (o.mg && BK && BK[o.mg]){ var S2 = serMkt(BK[o.mg].d, BK[o.mg].v); if (S2) C.push([S2, "운용사 바스켓(5% 넘게 가진 " + BK[o.mg].n + "종목 · 평가금액 비중)", "bk"]); }
      var S3 = peerSer(o.s); if (S3) C.push([S3, "같은 전략(" + (SSHORT[o.s] || o.s) + ") 실측 펀드 " + peer[o.s].length + "개 평균", "peer"]);
      (bm || []).forEach(function(b){ var S4 = b.s ? serMkt(b.s.d, b.s.v) : null; if (S4) C.push([S4, b.n + " 지수", "ix"]); });
      var best = null;
      C.forEach(function(c){ var ft = fitCand(o, c[0]); if (ft && (!best || ft.err < best.ft.err)) best = {c: c, ft: ft}; });
      if (!best || best.ft.err > 10) return;
      var S = best.c[0], st = !S.nav, b = best.ft.b, z = sAt(S, ANCHOR, st), lastD = S.d[S.d.length - 1], last = S.f[S.f.length - 1];
      if (!z) return;
      var tf = function(r){ return r == null ? null : Math.round((Math.exp(b * Math.log(1 + r)) - 1) * 10000) / 100; };
      var since = last / z - 1, est = tf(since);
      var chain = function(v){ return v == null ? null : Math.round(((1 + v / 100) * (1 + est / 100) - 1) * 10000) / 100; };
      if (lastD > ANCHOR && Math.abs(since) > 1e-9){
        ["m1", "m3", "m6", "y1"].forEach(function(p){ o[p] = chain(o[p]); });
        if (o.y && o.y["2026"] != null) o.y["2026"] = chain(o.y["2026"]);
        if (o.nav != null) o.nav = Math.round(o.nav * (1 + est / 100) * 100) / 100;
        var w1 = S.f.length > 5 ? sWin(S, lastD, 7) : null, d1 = S.f.length > 1 ? S.f[S.f.length - 1] / S.f[S.f.length - 2] - 1 : null;
        o.w1 = tf(w1); o.d1 = tf(d1);
      }
      // 주간 수익률(추정)
      var wk = {}, wl = []; S.d.forEach(function(d, i){ var dt = new Date(Date.parse(d + "T00:00:00Z")); dt.setUTCDate(dt.getUTCDate() + 3 - ((dt.getUTCDay() + 6) % 7)); wk[dt.toISOString().slice(0, 10)] = i; });
      Object.keys(wk).sort().forEach(function(k){ wl.push(wk[k]); });
      o.wk = []; for (var w = 1; w < wl.length; w++){ var i0 = wl[w - 1], i1 = wl[w]; if (Date.parse(S.d[i1]) - Date.parse(S.d[i0]) <= 10 * 864e5) o.wk.push([S.d[i1], tf(S.f[i1] / S.f[i0] - 1)]); }
      o.wk = o.wk.slice(-13); o.wkEst = true;
      o.est = {by: best.c[1], kind: best.c[2], b: Math.round(b * 100) / 100, err: Math.round(best.ft.err * 10) / 10, n: best.ft.n, ch: est, asof: lastD, mkt: st, tried: C.length};
      n++;
    });
    L.nest = n;
  }
  /* 🔐 폐쇄형·개방형 — 10/16 사용자 「폐쇄형 개방형 구분해서 볼 수 있게」. 사모펀드 약관은 공개되지 않아 이름·전략으로 판정(화면에 「추정」 표시)
     폐쇄형: 이름에 만기형·폐쇄·Pre-IPO·PEF·Secondary·SPAC·사모대출 / 전략이 Pre-IPO·메자닌·국내 PE·해외 PE·VC·PD
     개방형: 롱·롱숏·멀티·재간접 헤지펀드(보통 월·분기 환매) · 코스닥벤처·공모주하이일드는 대개 폐쇄형(만기 3년 안팎) */
  function openClose(o){
    var n = o.n, s = o.s;
    if (/만기형|폐쇄|Pre-?IPO|PEF|PE |Secondary|SPAC|스팩|사모대출|PMF|프라이빗|비상장|메자닌|IPO\s*Selection/i.test(n)) return "폐쇄형";
    if (/Pre-IPO|Mezzanine|PE|VC|PD|코스닥벤처|하이일드/.test(s)) return "폐쇄형";
    return "개방형";
  }
  var PVP = [["w1", "1주"], ["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"], ["ytd", "올해"]], PVPN = {d1: "1일", w1: "1주", m1: "1개월", m3: "3개월", m6: "6개월", y1: "1년", ytd: "올해(2026)"};
  var SG = [["", "전체"], ["Long", "롱"], ["Long/Short", "롱숏"], ["Multi", "멀티전략"], ["Fund of Fund", "재간접"], ["Pre-IPO", "Pre-IPO"], ["Mezzanine", "메자닌"], ["하이일드", "공모주하이일드"], ["코스닥벤처", "코스닥벤처"], ["PE", "PE·VC·사모대출"], ["USD", "💵 달러"]];
  var SSHORT = {"Equity Hedge (Long)": "롱", "Equity Hedge (Long · USD)": "롱·달러", "Equity Hedge (Long/Short)": "롱숏", "Equity Hedge (Multi-Strategy)": "멀티전략", "Equity Hedge (Fund of Fund)": "헤지 재간접", "Event-Driven (Pre-IPO)": "Pre-IPO·공모주", "Event-Driven (Mezzanine)": "메자닌", "Event-Driven (공모주 하이일드)": "공모주 하이일드", "Event-Driven (코스닥벤처)": "코스닥벤처", "국내형 PE": "국내 PE", "Global VC": "해외 VC", "Global PE (원화)": "해외 PE(원화)", "Global PE (USD)": "해외 PE(달러)", "Global PD (USD)": "해외 사모대출(달러)"};
  function sgOk(x, f){
    if (!f) return true;
    if (f === "USD") return x.usd;
    if (f === "Long") return x.s === "Equity Hedge (Long)" || x.s === "Equity Hedge (Long · USD)";
    if (f === "PE") return /PE|VC|PD/.test(x.s);
    return x.s.indexOf(f) >= 0;
  }
  function pvv(x, p){ return p === "ytd" ? (x.y || {})["2026"] : x[p]; }
  function pvname(n){ return String(n).replace(/\s*(일반\s*사모\s*(증권|혼합자산)?\s*투자\s*신탁|전문투자형\s*사모\s*투자\s*신탁|사모\s*증권\s*투자\s*신탁|일반\s*사모)\s*/g, " ").replace(/\s+/g, " ").trim(); }
  function pvlrow(x, i, p){
    var v = pvv(x, p), cur = x.usd ? "$" : "";
    return '<div class="pd-it pd-p pd-tap"' + reg("pvl", Object.assign({per: p}, x)) + '><div class="pd-h">' + (i != null ? '<span class="rk">' + (i + 1) + '</span>' : '') + '<div class="pd-n"><b>' + e(pvname(x.n)) + '</b><small>' + e(SSHORT[x.s] || x.s) + (x.d ? ' · 설정 ' + e(x.d.slice(0, 7).replace("-", ".")) : '') + (x.nav != null ? ' · 기준가 ' + cur + fmt(x.nav) : '') + (/손익차등/.test(x.n) ? ' · <span class="chip2 hot" style="margin:0">손익차등</span>' : '') + ' · ' + e(x.oc || openClose(x)) + (x.live ? ' · <span class="pd-lv">📡 실측 ' + e(md(x.live.asof)) + '</span>' : x.est ? ' · <span class="pd-es">🧮 추정 ' + e(md(x.est.asof)) + '</span>' : ' · <span class="mut">📷 10/15</span>') + '</small></div>' +
      '<div class="pd-v">' + (v == null ? '<b class="mut">–</b>' : sg(v)) + '<small>' + PVPN[p] + '</small></div></div>' +
      '<div class="pd-row"><span>1주 ' + sg(x.w1) + '</span><span>1개월 ' + sg(x.m1) + '</span><span>3개월 ' + sg(x.m3) + '</span><span>6개월 ' + sg(x.m6) + '</span><span>1년 ' + sg(x.y1) + '</span><span>올해 ' + sg((x.y || {})["2026"]) + '</span></div></div>';
  }
  function pvBody(){
    if (!PVL){
      var saved = ""; try { saved = localStorage.getItem("pvk") || ""; } catch(z) {}
      return card("🔒 미래에셋 사모 라인업 <span class='mut'>잠김</span>",
        (saved && !PVERR ? '<div class="loading">여는 중…</div>' :
        '<p class="note" style="margin:0 0 10px">미래에셋증권 사내용 「사모 주요펀드 라인업 및 성과현황」을 옮긴 자료라 비밀번호로 잠가 두었어요. 한 번 열면 이 기기에서는 다음부터 자동으로 열려요.</p>' +
        '<div class="pd-pw"><input id="pvpw" type="password" autocomplete="current-password" placeholder="비밀번호" class="pd-q" style="margin:0"><button id="pvgo">열기</button></div>' +
        (PVERR ? '<div class="pd-err">⚠️ ' + e(PVERR) + '</div>' : '')));
    }
    var p = SEL.pvp || "y1", f = SEL.pvs || "", oc = SEL.pvoc || "", L = PVL.rows.filter(function(x){ return sgOk(x, f) && (!oc || (x.oc || openClose(x)) === oc); });
    var has = L.filter(function(x){ return pvv(x, p) != null; }).sort(function(a, b){ return pvv(b, p) - pvv(a, p); }), none = L.filter(function(x){ return pvv(x, p) == null; });
    var top = has.slice(0, 30), rest = has.slice(30), med = has.length ? pvv(has[Math.floor(has.length / 2)], p) : null;
    var bm = (PVL.bm || []).map(function(b){ var v = pvv(b, p); return v == null ? "" : '<span>' + e(b.n) + ' ' + sg(v) + '</span>'; }).join("");
    return card("🔒 미래에셋 사모 라인업 수익률 TOP 30 <span class='mut'>" + PVPN[p] + " · " + has.length + "개 중</span>",
      seg("pdpvp", PVP, p) + seg("pdpvoc", [["", "전체"], ["개방형", "🔓 개방형 " + PVL.rows.filter(function(x){ return (x.oc || openClose(x)) === "개방형"; }).length], ["폐쇄형", "🔒 폐쇄형 " + PVL.rows.filter(function(x){ return (x.oc || openClose(x)) === "폐쇄형"; }).length]], oc) + '<div class="seg2 wrap" id="pdpvs">' + SG.map(function(x){ var n = PVL.rows.filter(function(r){ return sgOk(r, x[0]); }).length; return '<button' + (x[0] === f ? ' class="on"' : '') + ' data-k="' + x[0] + '">' + x[1] + ' <span class="mut">' + n + '</span></button>'; }).join("") + '</div>' +
      '<div class="pd-row" style="margin:0 0 10px">비교 기준선 ' + (bm || '–') + (med != null ? '<span>라인업 가운데 ' + sg(med) + '</span>' : '') + '</div>' +
      (top.length ? '<div class="pd-list">' + top.map(function(x, i){ return pvlrow(x, i, p); }).join("") + '</div>' : '<div class="empty">이 조건에 수익률이 있는 펀드가 없어요.</div>')) +
      (rest.length ? '<details class="card cpx-d"><summary>나머지 ' + rest.length + '개 펼치기 <span class="mut">31위~</span></summary><div class="pd-list">' + rest.map(function(x, i){ return pvlrow(x, i + 30, p); }).join("") + '</div></details>' : '') +
      (none.length ? '<details class="card cpx-d"><summary>' + PVPN[p] + ' 수익률 없음 ' + none.length + '개 <span class="mut">새로 만든 펀드 등</span></summary><div class="pd-list">' + none.map(function(x){ return pvlrow(x, null, p); }).join("") + '</div></details>' : '') +
      '<p class="note">' + e(PVL.src) + '. 비교 기준선 KOSPI·KOSDAQ는 지수 종가로 직접 계산(엑셀 값 안 씀). 수익률은 기준가 기준(세전·보수 차감 후), 달러 펀드는 달러 기준이에요. <b>📡 표시 ' + (PVL.nlive || 0) + '개</b>는 금융투자협회 공시 기준가를 매일 쌓아 수익률을 직접 계산, <b>🧮 추정 ' + (PVL.nest || 0) + '개</b>는 기준가가 공개되지 않아 같은 운용사 공모펀드·운용사 보유 종목 바스켓·같은 전략 실측 펀드·지수 중 과거 성적에 가장 잘 맞는 것으로 매일 추정(' + e(md(PVL.kasof || "")) + ') — 나머지는 금투협에 기준가를 안 올리는 펀드라 10/15 화면 값이에요(새 화면 사진·엑셀을 주시면 갱신). 펀드를 누르면 전략 설명·연도별 성적·모의 계산이 펼쳐져요. <a href="#" id="pvlock">이 기기에서 잠그기</a></p>';
  }
  function fundView(D){
    var F = (D.funds || []).filter(function(x){ return x.t; }), k = SEL.fund || "pv";
    if (k === "mir") k = SEL.fund = "pv";
    var h = '<div class="mg-kv"><div><small>🔒 미래에셋 사모 라인업</small><b>' + (PVL ? PVL.rows.length + '개' : '잠김') + '</b><em>' + (PVL ? e(PVL.asof) + ' 사내 화면' : '비밀번호로 열기') + '</em></div>' +
      '<div><small>공모펀드 (미래에셋 펀드검색)</small><b>' + F.length.toLocaleString() + '개</b><em>순자산 10억↑ 수익률 순위</em></div></div>';
    h += seg("pdseg", [["pv", "🔒 사모 라인업"], ["all", "🏆 공모 TOP 20"], ["type", "유형별 TOP"]], k) + '<div id="pdbody">' + fundBody(D, k) + '</div>';
    return doc("fund") + h + WARN;
  }
  function fundBody(D, k){
    var F = (D.funds || []).filter(function(x){ return x.t; }), per = PER;
    var by = function(a, p){ p = p || per; return a.filter(function(x){ return x[p] != null; }).sort(function(x, y){ return y[p] - x[p]; }); };
    if (k === "pv" || k === "mir") return pvBody();
    if (k === "all"){
      var big = by(F.filter(function(x){ return (x.aum || 0) >= 10; })), top = big.slice(0, 20), bot = big.slice(-10).reverse();
      return card("🏆 공모펀드 수익률 TOP 20 <span class='mut'>" + PN[per] + " · 순자산 10억 이상 " + big.length + "개 중</span>", seg("pdper", PERS, per) + '<div class="pd-list">' + top.map(function(x, i){ return frow(x, i, per); }).join("") + '</div>') +
        '<details class="card cpx-d"><summary>📉 ' + PN[per] + ' 가장 많이 빠진 10개</summary><div class="pd-list">' + bot.map(function(x, i){ return frow(x, i, per); }).join("") + '</div></details>';
    }
    var types = {}; F.forEach(function(x){ if ((x.aum || 0) >= 10 && x[per] != null){ (types[x.t] = types[x.t] || []).push(x); } });
    var order = Object.keys(types).sort(function(a, b){ return types[b].length - types[a].length; });
    return seg("pdper", PERS, per) + order.map(function(t){
      var a = by(types[t]), avg = a.reduce(function(s, x){ return s + x[per]; }, 0) / a.length;
      return '<details class="card cpx-d"' + (t === order[0] ? " open" : "") + '><summary>' + e(t) + ' <span class="mut">' + a.length + '개 · 평균 ' + V.sgn(avg) + '%</span></summary><div class="pd-list">' + a.slice(0, 5).map(function(x, i){ return frow(x, i, per); }).join("") + '</div></details>';
    }).join("");
  }
  function fundSheet(x){
    if (!x) return;
    navPush({t: "fund", c: x.c}); closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    var u = "https://securities.miraeasset.com/hks/hks4116/p11.do?fd_cd=" + encodeURIComponent(x.c);
    sh.innerHTML = '<div class="sh-top"><button class="sh-x" onclick="goBack()">✕</button><b>' + e(fname(x.n)) + '</b></div><div class="sh-body">' +
      '<div class="mg-kv"><div><small>' + PN[PER] + ' 수익률</small>' + (x[PER] == null ? '<b>–</b>' : '<b class="' + cls(x[PER]) + '">' + V.sgn(x[PER]) + '%</b>') + '</div><div><small>순자산</small><b>' + (x.aum != null ? fmt(x.aum) + '억' : '–') + '</b></div>' +
      '<div><small>운용사</small><b style="font-size:14px">' + e(x.co || "–") + '</b></div><div><small>위험</small><b>' + (x.rk ? x.rk + '등급' : '–') + '</b><em>1 매우높음 ~ 6 매우낮음</em></div></div>' +
      card("기간별 수익률", V.dbars([["1주", x.w1], ["1개월", x.m1], ["3개월", x.m3], ["6개월", x.m6], ["1년", x.y1], ["3년", x.y3], ["5년", x.y5]].filter(function(r){ return r[1] != null; }).map(function(r){ return {label: r[0], v: r[1]}; }))) +
      card("정보", '<div class="pd-row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>유형 <b>' + e(x.t || "") + (x.st ? " · " + e(x.st) : "") + '</b></span><span>클래스 <b>' + e(x.cls || "–") + '</b></span><span>총보수 <b>' + (x.fee != null ? x.fee + "%" : "–") + '</b>' + (x.sfee ? ' · 선취 ' + x.sfee + '%' : '') + '</span><span>설정일 <b>' + e(x.est ? x.est.slice(0, 4) + "-" + x.est.slice(4, 6) + "-" + x.est.slice(6, 8) : "–") + '</b></span><span>기준가 날짜 <b>' + e(x.d ? x.d.slice(0, 4) + "-" + x.d.slice(4, 6) + "-" + x.d.slice(6, 8) : "–") + '</b></span></div>' +
        '<p class="note"><a href="' + u + '" target="_blank" rel="noopener">미래에셋 상품 상세 열기 ↗</a></p>') +
      '<p class="note" style="padding:0 4px 90px">' + e(x.n) + '</p></div>';
    document.body.appendChild(sh); document.body.classList.add("sheet-open"); try { updBack(); } catch(z) {}
  }

  /* 🎬 ELS 과거 재생 — 10/19 A10/19-1: els_replay.py(els_dart·products 작업)가 기초자산 일봉으로 「2006년부터 매 거래일 가입한 셈」 돌린 결과(archive/x/els_replay.json).
     숫자가 없는 상품(개별주 이름 사전에 없음·조건을 못 읽음)은 띠를 안 그림. 과거 계산 · 미래 보장 아님 · 사라는 말 없음. */
  var ELSREP = null, ELSREPW = null;
  function elsRep(id){
    if (!ELSREP){ if (!ELSREPW) ELSREPW = getJSON("archive/x/els_replay.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ ELSREP = j && j.stats ? j : {stats: {}, by_id: {}}; if (window.__pdRedraw) window.__pdRedraw(); }).catch(function(){ ELSREP = {stats: {}, by_id: {}}; });
      return null; }
    var k = (ELSREP.by_id || {})[id]; return k ? (ELSREP.stats || {})[k] || null : null;
  }
  function repBand(st, full){
    if (!st || !st.k || !st.k.length) return "";
    var n = st.k.length, cyc = st.cyc || 6, mo = function(m){ return m % 12 === 0 ? (m / 12) + "년" : m + "개월"; };
    var first = st.k[0], second = n > 1 ? st.k[1] : null, early = st.k[n - 2] != null ? st.k[n - 2] : st.k[0], all = st.k[n - 1];
    var matOk = st.mat_ok || 0, loss = st.loss || 0;
    var segs = [[all, "var(--up)", "상환"], [matOk, "#a3a3a3", "만기 원금"], [loss, "var(--dn)", "손실"]];
    var bar = '<span class="pd-rpb">' + segs.map(function(sg){ return sg[0] > 0 ? '<i style="width:' + sg[0] + '%;background:' + sg[1] + '" title="' + sg[2] + ' ' + sg[0] + '%"></i>' : ''; }).join("") + '</span>';
    var txt = '<b>' + mo(cyc) + ' 만에 끝 ' + first.toFixed(0) + '%</b>' + (second != null ? ' · ' + mo(cyc * 2) + ' 안 ' + second.toFixed(0) + '%' : '') + ' · 만기 평가 때 상환 ' + Math.max(0, all - early).toFixed(0) + '%' +
      (matOk ? ' · 만기에 ' + (st.ki_touch != null ? '원금+이자(KI 안 닿음) ' : '원금만 ') + matOk.toFixed(0) + '%' : '') +
      ' · <b class="' + (loss || st.loss_avg != null ? 'dn' : '') + '">손실로 끝 ' + (loss < 0.5 && st.loss_avg != null ? '1% 미만' : loss.toFixed(0) + '%') + '</b>' + ((loss || st.loss_avg != null) && st.loss_yrs && st.loss_yrs.length ? '(' + st.loss_yrs.join('·') + ' 가입분)' : '') +
      (st.loss_avg != null ? ' 평균 ' + st.loss_avg.toFixed(0) + '%' : '');
    var wk = st.worst ? Object.keys(st.worst).sort(function(a, b){ return st.worst[b] - st.worst[a]; }) : [];
    var tail = (st.ki_touch != null ? ' · KI 닿은 적 ' + st.ki_touch.toFixed(0) + '%' : '') + (wk.length ? ' · 1차에 발목 잡은 건 주로 <b>' + e(wk[0]) + '</b> ' + st.worst[wk[0]] + '%' : '');
    return '<div class="pd-rep' + (full ? ' full' : '') + '"><div class="pd-rph">🎬 과거 재생 <span class="mut">' + e(st.from) + '~' + e(st.to) + ' 매 거래일 가입 ' + st.n.toLocaleString() + '회 · 기본 스텝다운 기준</span></div>' + bar + '<div class="pd-rpt">' + txt + tail + '</div>' +
      (full ? '<p class="note" style="margin:4px 0 0">기초자산 일봉으로 이 조건(배리어·주기·KI)만 그대로 돌린 과거 계산 — 월지급·리자드·조기상환 뒤 재투자는 안 넣었고, 만기까지 결과가 난 가입일만 셌어요. 미래 보장이 아니고 사라는 뜻도 아니에요.</p>' : '') + '</div>';
  }

  window.__elsApi = {repBand: function(st, f){ return repBand(st, f); }, repMini: function(st){ return repMini(st); }, rep: function(){ return ELSREP; }, D: function(){ return DATA; }};   // 🎛 설계기(els_design.js)에서 씀
  function repMini(st){ if (!st || !st.k || !st.k.length) return ""; var cyc = st.cyc || 6, mo = cyc % 12 === 0 ? (cyc / 12) + "년" : cyc + "개월"; return '<span class="pd-rpm"><span>🎬 과거 ' + mo + ' 상환 ' + st.k[0].toFixed(0) + '%</span><b class="' + (st.loss || st.loss_avg != null ? 'dn' : '') + '">과거 손실 ' + ((st.loss || 0) < 0.5 && st.loss_avg != null ? '1% 미만' : (st.loss || 0).toFixed(0) + '%') + '</b></span>'; }

  /* ───────── 🎯 ELS ───────── */
  function dday(d){ if (!d) return ""; var n = Math.round((new Date(d + "T23:59:59+09:00") - Date.now()) / 864e5); return n < 0 ? "마감" : n === 0 ? "오늘 마감" : "D-" + n; }
  function elsRow(x, done){
    var t = x.t, pp = (x.pp || 0) >= 100;
    return '<div class="pd-it pd-e pd-tap"' + reg("els", x) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.n) + '</b><small><span class="chip2 ' + (pp ? "cool" : "hot") + '">' + e(t) + (pp ? " · 원금지급" : " · 원금 비보장") + '</span>' + (x.hi ? '<span class="chip2">고난도</span>' : '') + (x.monthly ? '<span class="chip2">월지급</span>' : '') + (x.dl_e ? '<span class="chip2">숙려 ' + e(md(x.dl_e)) + '까지</span>' : '') + '</small></div>' +
      '<div class="pd-v"><b class="up">' + pc(x.cpn) + '</b><small>연 수익률(세전)</small></div></div>' +
      '<div class="pd-row"><span>기초자산 <b>' + e(x.ua || "–") + '</b></span></div>' +
      '<div class="pd-row"><span>구조 <b>' + e(x.kind || "") + '</b> ' + e(x.desc || "") + '</span></div>' + repBand(elsRep(x.isin)) +
      '<div class="pd-row"><span>만기 <b>' + e(x.mat || "–") + '</b> · ' + e(x.cyc || "") + '마다 상환 기회</span><span>최대 손실 <b class="' + ((x.loss || 0) < 0 ? "dn" : "") + '">' + (x.loss != null ? x.loss + "%" : "–") + '</b></span>' + (x.ki ? '<span>KI <b>' + x.ki + '</b></span>' : '') + '</div>' +
      '<div class="pd-row"><span>청약 ' + e(md(x.s)) + ' ~ ' + e(md(x.e)) + (done ? '' : ' <b class="' + (/오늘|D-[12]$/.test(dday(x.e)) ? "dn" : "") + '">' + dday(x.e) + '</b>') + '</span><span>모인 돈 <b>' + fmt(x.amt) + '억</b> / 한도 ' + fmt(x.lim) + '억' + (x.cr != null ? ' (' + (x.cr * 100).toFixed(1) + '%)' : '') + '</span></div></div>';
  }
  function elsView(D){
    var L = (D.els || []).slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); }), k = SEL.els || "open";
    var pp = L.filter(function(x){ return (x.pp || 0) >= 100; }), np = L.filter(function(x){ return (x.pp || 0) < 100; });
    var ua = {}; L.forEach(function(x){ String(x.ua || "").split(/,\s*/).forEach(function(u){ if (u) ua[u] = (ua[u] || 0) + 1; }); });
    var h = '<div class="mg-kv"><div><small>지금 청약 중</small><b>' + L.length + '개</b><em>ELS ' + np.length + ' · ELB(원금지급) ' + pp.length + '</em></div><div><small>최고 연 수익률</small><b class="up">' + (L[0] ? pc(L[0].cpn) : "–") + '</b><em>' + (L[0] ? e(L[0].n) : "") + '</em></div>' +
      '<div><small>청약 마감</small><b>' + (L.length ? e(md(L.map(function(x){ return x.e; }).sort()[0])) : "–") + '</b><em>' + (L.length ? dday(L.map(function(x){ return x.e; }).sort()[0]) : "") + '</em></div><div><small>많이 쓰는 기초자산</small><b style="font-size:14px">' + Object.keys(ua).sort(function(a, b){ return ua[b] - ua[a]; }).slice(0, 3).map(e).join(", ") + '</b></div></div>';
    h += seg("pdseg", [["open", "🟢 청약 중 " + L.length], ["design", "🎛 설계"], ["cmp", "🏁 타사 비교"], ["done", "최근 청약 완료"]], k) + '<div id="pdbody">' + elsBody(D, k) + '</div>';
    h = doc("els") + h;
    h += '<details class="card cpx-d"><summary>📘 ELS 구조 빨리 읽기</summary><p class="note" style="margin:0">「85-85-85-80-75-70, KI 45」= 6개월마다 기초자산이 처음의 85%·85%·85%·80%·75%·70% 위에 있으면 그때 수익과 함께 끝. <b>KI 45</b>는 중간에 한 번이라도 45% 아래로 떨어지면 만기 때 떨어진 만큼 손실(최대 −100%). 기초자산이 여럿이면 <b>가장 못한 것</b> 기준. ELB는 원금을 증권사가 지급(증권사 신용 위험은 남음). 「고난도」 상품은 숙려기간이 있어 청약 뒤 하루 더 생각할 시간을 줘요.</p></details>';
    return h + WARN;
  }
  function elsBody(D, k){
    if (k === "cmp") return elsCmp(D);
    if (k === "design"){ elsRep(""); return '<div id="elsdz"><div class="loading">설계기 준비 중…</div></div>'; }   // 🎛 10/20 A10/20-1 (els_design.js)
    if (k === "done"){
      var L = (D.els_done || []).slice(0, 40);
      return card("최근 청약 완료 <span class='mut'>" + L.length + "개 · 조건 참고용</span>", L.length ? '<div class="pd-list">' + L.map(function(x){ return elsRow(x, true); }).join("") + '</div>' : '<div class="empty">자료가 없어요.</div>');
    }
    var L = (D.els || []).slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    var np = L.filter(function(x){ return (x.pp || 0) < 100; }), pp = L.filter(function(x){ return (x.pp || 0) >= 100; });
    return (np.length ? card("🎯 ELS · 원금 비보장 <span class='mut'>연 수익률 높은 순 · " + np.length + "개</span>", '<div class="pd-list">' + np.map(function(x){ return elsRow(x); }).join("") + '</div>') : '') +
      (pp.length ? card("🛡️ ELB · 원금지급형 <span class='mut'>" + pp.length + "개</span>", '<div class="pd-list">' + pp.map(function(x){ return elsRow(x); }).join("") + '</div>') : '') +
      (!L.length ? '<div class="empty">지금 청약 중인 상품이 없어요.</div>' : '');
  }


  /* 🏁 ELS 타사 비교 — 10/16 사용자 「Els도 타사들꺼랑 비교해 보기 편하게 · Els 나올때마다 똑같이 계속 비교」
     archive/x/els_all.json ← els_dart.yml(평일 08:23·14:53): 모든 증권사가 DART 에 낸 ELS·ELB 공모 서류의 회차별 조건 */
  var ELSALL = null, ELSWAIT = null;
  var UAN = [[/코스피\s*200|KOSPI\s*200/i, "KOSPI200"], [/S&P\s*500/i, "S&P500"], [/유로\s*스탁스\s*50|EURO\s*STOXX\s*50/i, "EUROSTOXX50"], [/니(케|께)이\s*225|NIKKEI\s*225/i, "NIKKEI225"],
             [/항셍\s*중국(\s*기업)?|HSCEI|H-?지수/i, "HSCEI"], [/항셍\s*(지수)?$|HSI$/i, "HSI"], [/나스닥\s*100|NASDAQ\s*100/i, "NASDAQ100"], [/코스닥\s*150|KOSDAQ\s*150/i, "KOSDAQ150"], [/테슬라|Tesla/i, "테슬라"], [/마이크론|Micron/i, "마이크론"], [/팔란티어|Palantir/i, "팔란티어"], [/엔비디아|NVIDIA/i, "엔비디아"], [/애플|Apple/i, "애플"], [/아마존|Amazon/i, "아마존"], [/마이크로소프트|Microsoft/i, "마이크로소프트"], [/알파벳|Alphabet|구글/i, "알파벳"], [/메타\s*플랫폼|Meta\s*Platforms/i, "메타"], [/브로드컴|Broadcom/i, "브로드컴"], [/어드밴스드\s*마이크로|Advanced\s*Micro|\bAMD\b/i, "AMD"], [/TSMC|Taiwan\s*Semiconductor/i, "TSMC"], [/코인베이스|Coinbase/i, "코인베이스"], [/넷플릭스|Netflix/i, "넷플릭스"], [/일라이\s*릴리|Eli\s*Lilly/i, "일라이릴리"]];
  function uaKey(s){
    var t = String(s || ""), out = [];
    UAN.forEach(function(u){ var re = new RegExp(u[0].source, "gi"); if (re.test(t)){ out.push(u[1]); t = t.replace(new RegExp(u[0].source, "gi"), " "); } });
    t.replace(/\([^)]*\)|\[[^\]]*\]|지수/g, " ").split(/보통주|우선주|,|\/|·|및|\n|\s{2,}/).forEach(function(x){ x = x.replace(/\s+/g, "").trim(); var x2 = x.replace(/Technolog(y|ies)|Inc\.?|Corp(oration)?\.?|Ltd\.?|Co\.|Class[A-Z]?|Platforms|Holdings|테크놀로지|테크놀러지|테크/gi, ""); if (x2.length >= 2) out.push(x); });
    return out.filter(function(x, i){ return out.indexOf(x) === i; }).sort().join(" + ");
  }
  function barSeq(a){ a = a || []; for (var L = 1; L <= a.length / 2; L++){ if (a.length % L) continue; var ok = true; for (var i = L; i < a.length; i++) if (a[i] !== a[i % L]){ ok = false; break; } if (ok) return a.slice(0, L); } return a; }
  function elsCmp(D){
    if (!ELSALL){ if (!ELSWAIT) ELSWAIT = getJSON("archive/x/els_all.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ ELSALL = j; if (window.__pdRedraw) window.__pdRedraw(); }).catch(function(){ ELSALL = {items: [], err: 1}; if (window.__pdRedraw) window.__pdRedraw(); });
      return '<div class="loading">전체 증권사 ELS 불러오는 중…</div>'; }
    var today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    var A = (ELSALL.items || []).filter(function(x){ return x.cpn != null && (x.e || "9999") >= today; });
    if (!A.length) return card("🏁 ELS 타사 비교", '<div class="empty">' + (ELSALL.err ? '자료 준비 중 — 첫 수집 뒤 채워져요.' : '지금 청약 중인 타사 ELS 자료가 없어요.') + '</div>');
    var mir = function(x){ return /미래에셋/.test(x.iss || ""); };
    A.forEach(function(x){ x.uk = uaKey(x.ua); });
    var f = SEL.elsk || "ELS", L = A.filter(function(x){ return f === "all" || x.kind === f; });
    var iss = {}; L.forEach(function(x){ var k = (x.iss || "").replace(/주식회사|\(주\)/g, "").trim(); (iss[k] = iss[k] || []).push(x.cpn); });
    var isl = Object.keys(iss).map(function(k){ var a = iss[k]; return [k, a.length, a.reduce(function(p, c){ return p + c; }, 0) / a.length, Math.max.apply(null, a)]; }).sort(function(a, b){ return b[2] - a[2]; });
    var row = function(x, hi){ return '<tr class="' + (mir(x) ? 'me' : '') + '"><td><b>' + e((x.iss || "").replace(/주식회사|\(주\)/g, "").trim()) + '</b><br><span class="mut">' + e((x.nm.match(/제\s*\[?\d+\]?\s*회/) || [""])[0].replace(/[\[\]\s]/g, "")) + (x.risk ? ' · ' + e(x.risk.replace(/\(.*$/, "")) : '') + '</span></td>' +
      '<td><b class="up">' + pc(x.cpn) + '</b><br><span class="mut">' + (x.kind === "ELB" || x.nolos ? '원금지급' : x.loss != null ? '최대 ' + x.loss + '%' : '원금 비보장') + '</span></td>' +
      '<td>' + (x.bars && x.bars.length ? e(barSeq(x.bars).join("-")) : '–') + (x.ki ? '<br><span class="mut">KI ' + x.ki + '</span>' : '') + repMini(elsRep(x.id)) + '</td>' +
      '<td>' + e(/^\d{4}-/.test(x.mat || "") ? md(x.mat) : (x.mat || "")) + '<br><span class="mut">마감 ' + e(md(x.e || "")) + '</span></td></tr>'; };
    var tblh = '<table class="pd-ec"><tr><th>발행사</th><th>연 수익률</th><th>배리어 · KI</th><th>만기 · 청약</th></tr>';
    var h = '<div class="mg-kv"><div><small>청약 중 전체 (DART)</small><b>' + L.length + '개</b><em>발행사 ' + isl.length + '곳 · ' + e(ELSALL.updated || "") + '</em></div>' +
      '<div><small>가장 높은 연 수익률</small><b class="up">' + pc(Math.max.apply(null, L.map(function(x){ return x.cpn; }))) + '</b><em>' + e((L.slice().sort(function(a, b){ return b.cpn - a.cpn; })[0] || {}).iss || "") + '</em></div></div>' +
      seg("pdelsk", [["ELS", "ELS(원금 비보장)"], ["ELB", "ELB(원금지급)"], ["all", "전체"]], f);
    // ① 미래에셋 청약 중 상품마다: 같은 기초자산 타사
    var M = (D.els || []).filter(function(x){ return f === "all" || (f === "ELB" ? (x.pp || 0) >= 100 : (x.pp || 0) < 100); });
    if (M.length) h += card("🟠 미래에셋 청약 중 상품 vs 같은 기초자산 타사", M.map(function(m){
      var k = uaKey(m.ua), S = L.filter(function(x){ return x.uk === k && !mir(x); }).sort(function(a, b){ return b.cpn - a.cpn; });
      var better = S.filter(function(x){ return x.cpn > m.cpn; }).length;
      var mr = elsRep(m.isin), lossOf = function(st){ return st ? (st.loss || 0) + (st.loss_avg != null && !(st.loss >= 0.5) ? 0.4 : 0) : null; };   // 🎬 10/19: 미래에셋도 같은 과거 재생 · 타사와 「손실로 끝」 비교
      var SR = S.map(function(x){ return elsRep(x.id); }).filter(function(st){ return st; });
      var safer = mr ? SR.filter(function(st){ return lossOf(st) < lossOf(mr) - 0.05; }).length : 0, riskier = mr ? SR.filter(function(st){ return lossOf(st) > lossOf(mr) + 0.05; }).length : 0;
      var mrow = L.filter(function(x){ return mir(x) && x.uk === k && Math.abs(x.cpn - m.cpn) < 0.006; })[0] ||
        {iss: "미래에셋증권", nm: (String(m.n).match(/\d+[a-z]?\)?$/) ? "제" + String(m.n).match(/(\d+)[a-z]?$/)[1] + "회" : ""), cpn: m.cpn, kind: (m.pp || 0) >= 100 ? "ELB" : "ELS", nolos: (m.pp || 0) >= 100, loss: m.loss,
         bars: String(m.desc || "").split(",")[0].split("(")[0].split("-").map(function(b){ return parseFloat(b); }).filter(function(b){ return !isNaN(b); }), ki: m.ki, mat: m.mat, e: m.e, id: m.isin};   // DART 목록에 없는 회차 → 우리 상품 자료로 주황 줄
      return '<div class="pd-ecm"><div class="sub2">' + e(m.n) + ' <span class="mut">' + e(k) + '</span></div><p class="note" style="margin:0 0 6px">미래에셋 <b class="up">연 ' + pc(m.cpn) + '</b>' + (m.ki ? ' · KI ' + m.ki : '') + ' · 「' + e(m.desc || "") + '」 — ' +
        (S.length ? '같은 기초자산 타사 ' + S.length + '개 중 미래에셋보다 수익률 높은 곳 <b>' + better + '개</b>' + (better ? ' (최고 ' + pc(S[0].cpn) + ' ' + e(S[0].iss) + ')' : ' — 미래에셋이 가장 높거나 같아요') : '지금 같은 기초자산 조합의 타사 청약이 없어요') + '</p>' +
        (mr ? repBand(mr) + (SR.length ? '<div class="pd-rcmp">🎬 과거 재생 숫자가 있는 같은 기초자산 타사 ' + SR.length + '개 중 「손실로 끝」 비율이 미래에셋보다 <b>낮은 곳 ' + safer + '개</b> · 높은 곳 ' + riskier + '개 · 같은 수준 ' + (SR.length - safer - riskier) + '개' + (S.length > SR.length ? ' <span class="mut">(나머지 ' + (S.length - SR.length) + '개는 서류에서 배리어·주기를 다 못 읽어 계산 안 함)</span>' : '') + '</div>' : '') : '<div class="pd-rcmp">🎬 과거 재생: 이 상품 기초자산 시세를 아직 못 받아 계산 전이에요(다음 자료 갱신 때 채워짐).</div>') +
        (S.length ? tblh + (mrow ? row(mrow) : '') + S.slice(0, 8).map(function(x){ return row(x); }).join("") + '</table>' : '') + '</div>'; }).join("") +
      '<p class="note">수익률만 보지 말고 KI(낮을수록 안전)·첫 조기상환 배리어(높을수록 상환이 어려움)·만기를 같이 비교하세요. 같은 기초자산이라도 구조가 다르면 수익률이 달라요.</p>');
    // ② 발행사별 평균
    h += card("🏢 발행사별 평균 연 수익률 <span class='mut'>청약 중 · " + (f === "all" ? "전체" : f) + "</span>", '<div class="pd-hl">' + isl.map(function(r){ var mx = isl[0][2] || 1;
      return '<div><span class="n">' + e(r[0]) + ' <em>' + r[1] + '개 · 최고 ' + r[3].toFixed(2) + '%</em></span><span class="xbar"><i style="width:' + (r[2] / mx * 100).toFixed(0) + '%;background:' + (/미래에셋/.test(r[0]) ? '#f59e0b' : 'var(--c)') + '"></i></span><b>' + r[2].toFixed(2) + '%</b></div>'; }).join("") + '</div>');
    // ③ 기초자산 조합별 전체
    var G = {}; L.forEach(function(x){ (G[x.uk] = G[x.uk] || []).push(x); });
    var gk = Object.keys(G).sort(function(a, b){ return G[b].length - G[a].length; });
    h += '<div class="sec" style="margin-top:6px">기초자산 조합별 전체 <span class="mut">' + gk.length + '가지 · 연 수익률 높은 순</span></div>' + gk.map(function(k, i){ var a = G[k].sort(function(x, y){ return y.cpn - x.cpn; });
      return '<details class="card cpx-d"' + (i < 2 ? ' open' : '') + '><summary>' + e(k || "기타") + ' <span class="mut">' + a.length + '개 · ' + pc(a[a.length - 1].cpn) + '~' + pc(a[0].cpn) + (a.some(mir) ? ' · 🟠 미래에셋 있음' : '') + '</span></summary>' + tblh + a.map(function(x){ return row(x); }).join("") + '</table></details>'; }).join("");
    return h + '<p class="note">금융감독원 DART 「일괄신고추가서류(주가연계증권·주가연계파생결합사채)」를 회차마다 읽어 뽑은 조건이에요(' + e(ELSALL.updated || "") + ' · 평일 하루 두 번 새로 냄). 서류 문장을 자동으로 읽은 거라 배리어·KI 가 빠지거나 다르게 읽힐 수 있어요 — 청약 전엔 각 증권사 투자설명서로 확인하세요. 🟠 = 미래에셋.</p>';
  }
  /* ───────── 🧾 누르면 펼쳐지는 설명·모의 투자계산서 ───────── */
  function W(v){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v), s = v < 0 ? "−" : ""; return a >= 1e8 ? s + (a / 1e8).toFixed(2).replace(/\.?0+$/, "") + "억원" : s + Math.round(a / 1e4).toLocaleString() + "만원"; }
  function amtBar(){ return '<div class="pd-amt"><span class="mut">투자금</span>' + [500, 1000, 3000, 5000, 10000].map(function(a){ return '<button data-amt="' + a + '"' + (a === AMT ? ' class="on"' : '') + '>' + (a >= 10000 ? (a / 10000) + "억" : a.toLocaleString() + "만") + '</button>'; }).join("") + '</div>'; }
  function tbl(rows){ return '<table class="pd-tb">' + rows.map(function(r){ return '<tr><td>' + r[0] + '</td><td class="' + (r[2] || "") + '">' + r[1] + '</td></tr>'; }).join("") + '</table>'; }
  function pvf(y, n, c){ return c / y * (1 - Math.pow(1 + y, -n)) + 100 / Math.pow(1 + y, n); }       // 연 이표 c(%), 수익률 y, n년 → 액면 100 당 값
  function dur(y, n, c){ var P = pvf(y, n, c), d = 0; for (var t = 1; t <= Math.ceil(n); t++){ var cf = (t <= n ? c : 0) + (t === Math.ceil(n) ? 100 : 0); d += t * cf / Math.pow(1 + y, t); } return d / P / (1 + y); }   // 수정 듀레이션(근사)
  function bondCalc(A, px, y, n, cpnKnown, taxFree){
    // A 원, 단가 px(액면 10,000 당), 세전 수익률 y(%), 잔존 n 년. 이표 c 는 이름에서 알면 그것, 아니면 단가·수익률로 역산
    var yy = y / 100, c = cpnKnown != null ? cpnKnown : Math.max(0, (px / 100 - 100 / Math.pow(1 + yy, n)) * yy / (1 - Math.pow(1 + yy, -n)));
    var face = A / px * 10000, cpnY = face * c / 100, cpnAll = cpnY * n, tax = taxFree ? 0 : cpnAll * 0.154, gain = face - A;
    var tot = face + cpnAll - tax, cagr = n > 0 ? (Math.pow(tot / A, 1 / n) - 1) * 100 : 0, D = dur(yy, n, c);
    return {c: c, face: face, cpnY: cpnY, cpnAll: cpnAll, tax: tax, gain: gain, tot: tot, cagr: cagr, D: D};
  }
  /* 📅 만기까지 현금흐름 — 10/16 사용자 「모의투자계산서는 만기까지 현금흐름 다 나오게」 */
  function addM(d, m){ var x = new Date(d.getTime()); var day = x.getUTCDate(); x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + m); var last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate(); x.setUTCDate(Math.min(day, last)); return x; }
  function ymd(d){ return d.toISOString().slice(0, 10); }
  function sched(mat, freq){   // 만기에서 거꾸로 freq 개월씩 → 오늘 이후 지급일
    var m = new Date(mat + "T00:00:00Z"), now = new Date(), out = [];
    var eom = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate() === m.getUTCDate();   // 말일 만기(9/30 등)면 이자일도 말일
    for (var k = 0; k < 400; k++){ var d = addM(m, -freq * k); if (eom) d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)); if (d <= now) break; out.unshift(d); }
    return out;
  }
  function cfTable(rows, cur, fx, note){
    // rows: [날짜, 내용, 세전, 세금, 세후(받는 돈)] — 외화면 cur/fx 로 원화 환산 열 추가
    var cum = 0, fmtC = function(v){ return v == null ? "" : cur ? Math.round(v).toLocaleString() : Math.abs(v) >= 1e8 ? W(v) : Math.round(v).toLocaleString() + "원"; };
    var krw = function(v){ return Math.abs(v) >= 1e8 ? W(v) : Math.round(v).toLocaleString() + "원"; };
    var body = rows.map(function(r){ cum += r[4]; return '<tr><td>' + e(r[0]) + '</td><td>' + r[1] + (r[3] ? '<br><span class="mut">세전 ' + fmtC(r[2]) + ' · 세금 −' + fmtC(r[3]) + '</span>' : '') + '</td><td><b>' + fmtC(r[4]) + '</b>' + (cur && fx ? '<br><span class="mut">≈ ' + krw(r[4] * fx) + '</span>' : '') + '</td></tr>'; }).join("");
    var tg = rows.reduce(function(s, r){ return s + r[2]; }, 0), tt = rows.reduce(function(s, r){ return s + (r[3] || 0); }, 0);
    return '<div class="sub2">📅 만기까지 현금흐름 <span class="mut">' + rows.length + '번' + (cur ? ' · ' + cur : '') + '</span></div><div class="pd-cfw"><table class="pd-cf"><tr><th>날짜</th><th>내용</th><th>받는 돈</th></tr>' + body +
      '<tr class="sum"><td>합계</td><td>' + (tt ? '<span class="mut">세전 ' + fmtC(tg) + ' · 세금 −' + fmtC(tt) + '</span>' : '') + '</td><td><b>' + fmtC(cum) + '</b>' + (cur && fx ? '<br><span class="mut">≈ ' + krw(cum * fx) + '</span>' : '') + '</td></tr></table></div>' + (note ? '<p class="note">' + note + '</p>' : '');
  }
  function xpanel(R){
    var k = R.k, o = R.o, A = AMT * 1e4, h = "";
    if (k === "krw"){
      var m = /(\d{5})-/.exec(o.name), cpn = o.cpn != null ? o.cpn : m ? +m[1] / 1000 : null, n = o.yrs + o.days / 365, b = bondCalc(A, o.px, o.pre, n, cpn, false);
      if (/복리/.test(o.ctype || (/국민주택/.test(o.name) ? "복리" : ""))){ var _iss = new Date(o.issue + "T00:00:00Z"), _t = (new Date(o.mat + "T00:00:00Z") - _iss) / 365.25 / 864e5, _fin = b.face * Math.pow(1 + b.c / 100, _t), _ih = _fin - b.face * Math.pow(1 + b.c / 100, _t - n);
        b.cpnAll = _ih; b.tax = _ih * 0.154; b.tot = b.face + (_fin - b.face) - b.tax; b.gain = b.face - A; }
      var why = o.kind === "국채" ? "대한민국 정부가 갚는 채권이라 부도 걱정은 거의 없어요." : o.kind === "공사채·지방채" ? "공기업·지자체가 발행 — 사실상 정부가 뒤에 있어 국채 다음으로 안전해요." : o.kind === "신종·후순위" ? "은행·금융지주의 만기 없는 채권 — 금리가 높은 대신 은행이 부실해지면 원금이 0이 될 수 있고(상각), 콜(보통 5년)을 안 할 수도 있어요." : "일반 회사가 발행 — 신용등급이 낮을수록 금리가 높고 부도 위험이 있어요.";
      h += '<p>' + why + ' ' + (cpn != null ? '표면금리 ' + cpn.toFixed(3) + '%로 ' + e(o.issue.slice(0, 7)) + '에 발행, ' : '') + (o.px < 9000 ? '액면 10,000원짜리를 <b>' + fmt(o.px) + '원</b>에 싸게 사서 만기에 10,000원을 받는 몫이 커요 — 그 차익은 개인 비과세라 세후 수익률이 좋아요. ' : '단가가 액면(10,000원)에 가까워 수익 대부분이 이자(과세)예요. ') +
        (n >= 10 ? '잔존 ' + n.toFixed(1) + '년으로 길어서 시장 금리가 1%p 움직이면 값이 약 <b>' + (b.D).toFixed(0) + '%</b> 움직여요(중간에 팔 때 얘기 · 만기까지 들면 상관없음).' : '잔존 ' + n.toFixed(1) + '년 — 금리가 1%p 움직여도 값은 약 ' + b.D.toFixed(1) + '% 정도만 흔들려요.') + '</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">만기까지 들고 있을 때</span></div>' + amtBar() + tbl([
        ["산 금액", W(A)], ["받는 액면(만기 원금)", W(b.face) + ' <span class="mut">(' + fmt(o.px) + '원에 ' + Math.round(b.face / 1e4).toLocaleString() + '만원어치)</span>'],
        ["이자 (연 " + b.c.toFixed(2) + "% × " + n.toFixed(1) + "년)", W(b.cpnAll)], ["이자 세금 15.4%", "−" + W(b.tax), "dn"], ["만기 차익 (액면 − 산 금액 · 비과세)", (b.gain >= 0 ? "+" : "") + W(b.gain), b.gain >= 0 ? "up" : "dn"],
        ["<b>만기에 손에 쥐는 돈</b> <span class='mut'>이자 재투자 없이 합산</span>", "<b>" + W(b.tot) + "</b> <span class='mut'>" + V.sgn((b.tot / A - 1) * 100, 0) + "%</span>", "up"], ["미래에셋 표기 세후 수익률(연·복리)", pc(o.after)],
        ["1년 뒤 금리 +1%p 때 팔면", "약 " + W(A * (1 - b.D / 100) + b.cpnY * 0.846), "dn"], ["1년 뒤 금리 −1%p 때 팔면", "약 " + W(A * (1 + b.D / 100) + b.cpnY * 0.846), "up"]]);
      // 현금흐름: 이표채 = 주기마다 이자, 복리채 = 만기에 원리금 한 번, 할인채 = 만기에 액면
      var ct = o.ctype || (/국민주택/.test(o.name) ? "복리채" : "이표채"), fq = o.freq || (o.kind === "국채" ? 6 : 3), rows = [];
      if (/복리/.test(ct)){
        var iss = new Date(o.issue + "T00:00:00Z"), matd = new Date(o.mat + "T00:00:00Z"), tTot = (matd - iss) / 365.25 / 864e5, tHeld = n;
        var fin = b.face * Math.pow(1 + b.c / 100, tTot), intHeld = b.face * (Math.pow(1 + b.c / 100, tTot) - Math.pow(1 + b.c / 100, tTot - tHeld));
        rows.push([o.mat, "원금 + 복리 이자 (연 " + b.c.toFixed(2) + "% · 발행부터 " + tTot.toFixed(1) + "년)", fin, intHeld * 0.154, fin - intHeld * 0.154]);
      } else if (/할인/.test(ct)){
        rows.push([o.mat, "액면 상환", b.face, 0, b.face]);
      } else {
        var ds = sched(o.mat, fq), cp = b.face * (b.c / 100) * fq / 12;
        ds.forEach(function(d, i){ var last = i === ds.length - 1; rows.push([ymd(d), last ? "마지막 이자 + 원금" : (i + 1) + "회차 이자", cp + (last ? b.face : 0), cp * 0.154, cp * 0.846 + (last ? b.face : 0)]); });
      }
      h += cfTable(rows, "", null, e(ct) + ' · 이자 ' + fq + '개월마다 · 표면금리 ' + b.c.toFixed(3) + '% · ' + e(o.redeem || "만기일시상환") + '. 첫 이자는 실제로는 산 날부터 보유한 기간만큼만 과세(보유기간 과세)라 세금이 조금 다를 수 있어요. 매수 단위·수수료는 매매 화면 기준.');
    }
    else if (k === "ust" && (o.frn || o.ytm == null)){
      h += '<p><b>변동금리채(FRN)</b> — 이자가 매주 13주 T-Bill 금리 + 고정 가산(스프레드)으로 바뀌고 3개월마다 들어와요. 금리가 올라도 값이 거의 안 흔들려 사실상 「달러 예금 + 미국 정부 신용」이에요. 만기 ' + e(o.mat) + '. 수익은 단기 금리와 환율에 달려 있어 고정 계산서는 만들지 않았어요.</p>';
    }
    else if (k === "ust" || k === "aud" || k === "bru"){
      if (o.tips) h += '<p><b>물가연동국채(TIPS)</b> — 원금이 미국 소비자물가(CPI)만큼 불어나고, 그 불어난 원금에 표면금리 이자를 줘요. 아래 수익률은 <b>물가를 뺀 실질 수익률</b>이라 실제 달러 수익은 「실질 수익률 + 물가상승률」이에요(계산서는 물가 0% 가정 — 실제로는 그만큼 더).</p>';
      if (o.est) h += '<p class="note">이 종목 수익률은 재무부 수익률 곡선으로 추정한 값이에요(실제 호가와 0.1~0.5%p 다를 수 있음). 아래 계산서도 그 추정치 기준.</p>';
      var cur = k === "aud" ? "호주달러" : "달러", fx = o.fx || 1, n = Math.max(0.1, (new Date(o.mat) - Date.now()) / 365.25 / 864e5), yy = o.ytm / 100, c = o.cpn || 0, P = pvf(yy, n, c);
      var A_f = A / fx, face = A_f / P * 100, cpnAll = face * c / 100 * n, tax = cpnAll * 0.154, tot = face + cpnAll - tax;
      var D = dur(yy, n, c);
      h += '<p>' + (k === "ust" ? "미국 정부가 갚는 달러 채권이에요. " : k === "bru" ? "브라질 정부(BB · 투기등급)가 갚는 달러 채권이에요" + (o.sp != null ? " — 같은 만기 미국채보다 연 " + o.sp.toFixed(2) + "%p 더 줘요(브라질 위험값). " : ". ") : "호주 정부(AAA)가 갚는 호주달러 채권이에요. ") + '표면금리 ' + pc(c, 3) + ', 지금 가격에 사면 연 <b>' + pc(o.ytm) + '</b>(' + cur + ' 기준·세전). ' + (c < 2 ? '표면금리가 낮아 이자 대신 싸게 사서(100당 약 ' + P.toFixed(1) + ') 만기에 액면을 받는 몫이 커요 — 그 차익은 비과세라 세금 면에서 좋아요. ' : '') +
        (n >= 8 ? '만기가 ' + n.toFixed(1) + '년 남아 금리가 1%p 내리면 값이 약 ' + D.toFixed(0) + '% 오르고, 오르면 그만큼 빠져요(금리 하락에 거는 투자). ' : '만기가 ' + n.toFixed(1) + '년으로 짧아 금리보다 환율이 수익을 좌우해요. ') + '환차익은 비과세, 이자는 15.4%' + (k === "bru" ? '(브라질 달러채도 헤알 국채처럼 비과세인지는 창구 확인 — 비과세면 아래 세금 줄이 0이 돼요)' : '') + '.</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">환율 ' + fmt(fx) + '원 기준 · 만기 보유</span></div>' + amtBar() + tbl([
        ["산 금액", W(A) + ' <span class="mut">= ' + Math.round(A_f).toLocaleString() + ' ' + cur + '</span>'], ["만기 원금 (액면)", Math.round(face).toLocaleString() + " " + cur], ["이자 합계 (" + n.toFixed(1) + "년)", Math.round(cpnAll).toLocaleString() + " " + cur], ["이자 세금 15.4%", "−" + Math.round(tax).toLocaleString() + " " + cur, "dn"],
        ["<b>만기에 받는 " + cur + "</b>", "<b>" + Math.round(tot).toLocaleString() + " " + cur + "</b>"],
        ["환율 그대로 (" + fmt(fx) + ")", W(tot * fx) + " <span class='mut'>" + V.sgn((tot * fx / A - 1) * 100) + "%</span>", "up"],
        ["환율 10% 하락 (" + fmt(fx * 0.9) + ")", W(tot * fx * 0.9) + " <span class='mut'>" + V.sgn((tot * fx * 0.9 / A - 1) * 100) + "%</span>", tot * 0.9 >= A / fx ? "" : "dn"],
        ["환율 10% 상승 (" + fmt(fx * 1.1) + ")", W(tot * fx * 1.1) + " <span class='mut'>" + V.sgn((tot * fx * 1.1 / A - 1) * 100) + "%</span>", "up"],
        ["1년 뒤 금리 ±1%p 때 값", "약 " + V.sgn(-D) + "% / " + V.sgn(D) + "%"]]);
      var dsu = sched(o.mat, 6), cpu = face * c / 100 / 2, ru = [];
      dsu.forEach(function(d, i){ var last = i === dsu.length - 1; ru.push([ymd(d), last ? "마지막 이자 + 원금" : (i + 1) + "회차 이자", cpu + (last ? face : 0), cpu * 0.154, cpu * 0.846 + (last ? face : 0)]); });
      if (!c) ru = [[o.mat, "액면 상환 (무이표)", face, 0, face]];
      h += cfTable(ru, cur, fx, '이자는 6개월마다 ' + cur + '로 들어와요(원화 환산은 지금 환율 ' + fmt(fx) + '원 그대로 가정). 환전·매매 수수료는 뺐어요.');
    }
    else if (k === "brl"){
      var fx = o.fx || 1, n = Math.max(0.05, (new Date(o.mat) - Date.now()) / 365.25 / 864e5), r = o.r || 0, code = o.code, IP = 4.5;
      var A_b = A / fx, units = A_b / (o.pu || 1000), rows = [], md = new Date(o.mat + "T00:00:00Z");
      var t_ = function(d){ return Math.max(0, (d - Date.now()) / 365.25 / 864e5); };
      if (code === "LTN"){ rows.push([o.mat, "액면 R$1,000 × " + units.toFixed(2) + "개", units * 1000, 0, units * 1000]); }
      else if (code === "NTN-F"){
        var cpf = 1000 * (Math.pow(1.10, 0.5) - 1), dsf = sched(o.mat, 6);
        dsf.forEach(function(d, i){ var last = i === dsf.length - 1; rows.push([ymd(d), last ? "마지막 이자 + 액면" : (i + 1) + "회차 이자 (연 10%)", units * (cpf + (last ? 1000 : 0)), 0, units * (cpf + (last ? 1000 : 0))]); });
      } else if (code === "NTN-B" || code === "NTN-C"){
        // VNA(물가로 불어난 원금) 추정: 지금 단가 = VNA × Σ 할인된 실질 현금흐름(실질 금리 r)
        var real = code === "NTN-B" ? Math.pow(1.06, 0.5) - 1 : Math.pow(1.12, 0.5) - 1, dsb = sched(o.mat, 6), pct = 0;
        dsb.forEach(function(d, i){ var tt = t_(d); pct += (real + (i === dsb.length - 1 ? 1 : 0)) / Math.pow(1 + r / 100, tt); });
        var vna0 = (o.pu || 0) / (pct || 1);
        dsb.forEach(function(d, i){ var last = i === dsb.length - 1, vna = vna0 * Math.pow(1 + IP / 100, t_(d)), cf = vna * (real + (last ? 1 : 0)); rows.push([ymd(d), last ? "마지막 이자 + 원금(물가 반영)" : (i + 1) + "회차 이자 (실질 연 " + (code === "NTN-B" ? 6 : 12) + "%)", units * cf, 0, units * cf]); });
      } else {   // LFT
        rows.push([o.mat, "원금 × Selic 누적 (Selic 연 10.5% 가정 · 실제는 변동)", units * (o.pu || 0) * Math.pow(1 + 0.105, n), 0, units * (o.pu || 0) * Math.pow(1 + 0.105, n)]);
      }
      var totb = rows.reduce(function(s_, x){ return s_ + x[4]; }, 0);
      h += '<p>' + (code === "LTN" ? "이자 없이 싸게(R$ " + fmt(o.pu) + ") 사서 만기에 액면 R$1,000을 받는 <b>할인채(LTN)</b>예요." : code === "NTN-F" ? "6개월마다 이자(연 10%, 매년 1월·7월 1일)를 주는 <b>이표채(NTN-F)</b>예요. 지금 단가 R$ " + fmt(o.pu) + "는 시장 금리 " + r.toFixed(2) + "%를 반영한 값." : code === "LFT" ? "Selic(브라질 기준금리)만큼 불어나는 <b>변동금리채(LFT)</b> — 금리 위험은 거의 없고 환율만 남아요." : "<b>물가채(" + code + ")</b> — 원금이 브라질 물가(IPCA)만큼 불어나고 그 위에 실질 연 " + (code === "NTN-B" ? "6%" : "12%") + " 이자를 6개월마다 줘요. 시장 실질금리 " + r.toFixed(2) + "%.") +
        ' 개인은 이자·차익·환차익 모두 <b>비과세</b>. 헤알/원 환율이 결과를 다 바꿔요.</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">헤알/원 ' + fmt(fx) + ' 기준 · 만기 보유 · 세금 0' + (code === "NTN-B" || code === "NTN-C" ? ' · 브라질 물가 연 ' + IP + '% 가정' : '') + '</span></div>' + amtBar() + tbl([
        ["산 금액", W(A) + ' <span class="mut">= R$ ' + Math.round(A_b).toLocaleString() + ' (' + units.toFixed(2) + '개)</span>'], ["만기까지 받는 헤알 합계", "R$ " + Math.round(totb).toLocaleString()],
        ["환율 그대로 (" + fmt(fx) + "원)", W(totb * fx) + " <span class='mut'>" + V.sgn((totb * fx / A - 1) * 100) + "%</span>", "up"],
        ["헤알 20% 약세 (" + fmt(fx * 0.8) + "원)", W(totb * fx * 0.8) + " <span class='mut'>" + V.sgn((totb * fx * 0.8 / A - 1) * 100) + "%</span>", totb * 0.8 >= A_b ? "" : "dn"],
        ["헤알 40% 약세 (" + fmt(fx * 0.6) + "원)", W(totb * fx * 0.6) + " <span class='mut'>" + V.sgn((totb * fx * 0.6 / A - 1) * 100) + "%</span>", totb * 0.6 >= A_b ? "" : "dn"],
        ["헤알 20% 강세 (" + fmt(fx * 1.2) + "원)", W(totb * fx * 1.2) + " <span class='mut'>" + V.sgn((totb * fx * 1.2 / A - 1) * 100) + "%</span>", "up"]]);
      h += cfTable(rows, "헤알(R$)", fx, 'ANBIMA 지표금리·단가 기준이라 미래에셋 중개 호가와 수수료(연 0.15~0.30%)에 따라 달라요. 원화 환산은 지금 환율 그대로 가정 — 실제로는 받는 날의 환율. 받은 이자를 다시 투자하지 않은 단순 합계예요.');
    }
    else if (k === "fund" || k === "pv"){
      var isPv = k === "pv", sfee = isPv ? 0 : (o.sfee || 0), fee = o.fee;
      var pers = isPv ? [["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"]] : [["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"], ["y3", "3년"], ["y5", "5년"]];
      var net = A * (1 - sfee / 100);
      h += '<p>' + (isPv ? '<b>' + e(o.co) + '</b>의 ' + e(o.t) + ' 사모펀드 — 설정 ' + e((o.est || "").slice(0, 4)) + '년, 설정액 ' + fmt(o.amt) + '억, 기준가 ' + fmt(o.nav) + '. 49인 이하에게 비공개로 팔리는 펀드라 일반 창구에서는 못 사고 판매사·최소금액(보통 3억)이 따로 있어요. 수익률은 금투협 기준가 비교값이라 분배금·결산은 빠져 있어요.' :
        '<b>' + e(o.co) + '</b>의 ' + e(o.t) + (o.st ? '(' + e(o.st) + ')' : '') + ' 공모펀드 — 순자산 ' + fmt(o.aum) + '억, 위험 ' + (o.rk || "–") + '등급(1 매우높음~6 매우낮음), 설정 ' + e((o.est || "").slice(0, 4)) + '년. ' + (o.cls ? '클래스 「' + e(o.cls) + '」: ' : '') + (sfee ? '살 때 <b>선취 ' + sfee + '%</b>를 떼고, ' : '선취 수수료 없이, ') + (fee != null ? '매년 총보수 <b>' + fee + '%</b>가 기준가에서 빠져요(아래 수익률엔 이미 반영).' : '')) + '</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">「그때 샀다면 지금」 · 과거 수익률 그대로</span></div>' + amtBar() + tbl([["산 금액", W(A)]].concat(sfee ? [["선취 수수료 " + sfee + "%", "−" + W(A - net), "dn"]] : []).concat(pers.filter(function(p){ return o[p[0]] != null; }).map(function(p){
        var v = net * (1 + o[p[0]] / 100); return [p[1] + " 전 샀다면 지금", W(v) + " <span class='mut'>" + V.sgn(o[p[0]]) + "%</span>", v >= A ? "up" : "dn"]; })).concat(fee != null && !isPv ? [["매년 나가는 보수 (" + fee + "%)", "약 " + W(A * fee / 100) + "/년"]] : []));
      if (!isPv) h += '<div class="pd-hold" data-hold="' + e(o.c) + '"><div class="sub2">🧺 펀드 구성 <span class="mut">불러오는 중…</span></div></div>';
      else h += '<p class="note">🧺 사모펀드는 보유 종목을 공개하지 않아요 — 분기마다 투자자에게만 자산운용보고서로 알려 줘요.</p>';
      h += '<p class="note">이익에 15.4% 세금(국내 주식 매매차익은 비과세, 해외·채권·배당은 과세)이 붙고, 환매는 신청 뒤 2~10일 걸려요. 과거 수익률이 앞으로도 같다는 뜻은 아니에요.' + (!isPv ? ' <a href="https://securities.miraeasset.com/hks/hks4116/p11.do?fd_cd=' + encodeURIComponent(o.c) + '" target="_blank" rel="noopener">미래에셋 상품 상세 ↗</a>' : '') + '</p>';
    }
    else if (k === "els"){
      var cpn = o.cpn || 0, pp = (o.pp || 0) >= 100, half = A * cpn / 100 / 2, t = 0.154;
      h += '<p>' + (pp ? '<b>원금지급형(ELB)</b> — 조건이 안 맞아도 원금은 미래에셋증권이 줘요(증권사 신용 위험만). ' : '<b>원금 비보장</b> — ') + '기초자산 <b>' + e(o.ua) + '</b>' + (String(o.ua || "").split(",").length > 1 ? '(여럿이면 가장 못한 것 기준)' : '') + ', 「' + e(o.desc) + '」. ' + (o.ki ? 'KI ' + o.ki + ': 3년 중 한 번이라도 처음의 ' + o.ki + '% 아래로 가면 만기 때 떨어진 만큼 손실. ' : '') + (o.monthly ? '매달 이자를 주는 월지급식. ' : '') + (o.hi ? '고난도 상품이라 청약 뒤 숙려기간에 취소할 수 있어요.' : '') + '</p>' + repBand(elsRep(o.isin), true);
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">연 ' + pc(cpn) + ' · 세전/세후</span></div>' + amtBar() + tbl([["산 금액", W(A)],
        ["6개월 만에 조기상환", W(A + half * (1 - t)) + " <span class='mut'>이자 " + W(half) + " − 세금</span>", "up"], ["1년 만에 조기상환", W(A + 2 * half * (1 - t)), "up"], ["만기(" + e(o.mat) + ")까지 가서 상환", W(A + 6 * half * (1 - t)) + " <span class='mut'>세전 " + W(A + 6 * half) + "</span>", "up"]].concat(pp ? [] : [
        ["KI 뚫고 만기에 기초자산 −40%", W(A * 0.6), "dn"], ["KI 뚫고 만기에 기초자산 −60%", W(A * 0.4), "dn"]]));
      var bars = String(o.desc || "").split(",")[0].split("-").map(function(x){ return parseFloat(x); }).filter(function(x){ return !isNaN(x); });
      var cycm = parseInt(o.cyc) || 6, start = new Date((o.e || ymd(new Date())) + "T00:00:00Z"), er = [];
      bars.forEach(function(bv, i){ var d = addM(start, cycm * (i + 1)), cp = A * cpn / 100 * cycm * (i + 1) / 12;
        er.push([ymd(d), (i === bars.length - 1 ? "만기 평가" : (i + 1) + "차 조기상환 평가") + " — 기초자산이 처음의 <b>" + bv + "%</b> 이상이면", A + cp, cp * 0.154, A + cp * 0.846]); });
      if (er.length){
        var ets = '<div class="sub2">📅 상환 일정 · 회차별 받는 돈 <span class="mut">그 회차에 조건을 맞추면 그때 끝</span></div><div class="pd-cfw"><table class="pd-cf"><tr><th>평가일<br><span class="mut">(예상)</span></th><th>조건</th><th>받는 돈</th></tr>' +
          er.map(function(r){ return '<tr><td>' + e(r[0]) + '</td><td>' + r[1] + '<br><span class="mut">세전 ' + W(r[2]) + ' · 세금 −' + W(r[3]) + '</span></td><td><b>' + W(r[4]) + '</b></td></tr>'; }).join("") +
          (pp ? '' : '<tr class="sum"><td>만기</td><td>' + (o.ki ? 'KI ' + o.ki + '% 아래로 한 번이라도 갔고 만기에 ' + bars[bars.length - 1] + '% 미만이면' : '만기 조건 미달이면') + ' — 떨어진 만큼 손실 (−40%면)</td><td><b class="dn">' + W(A * 0.6) + '</b></td></tr>') + '</table></div>';
        h += ets + (o.monthly ? '<p class="note">월지급식: 위와 별도로 매달 기초자산이 월지급 배리어 위면 월 이자(연 ' + pc(cpn) + ' ÷ 12)가 들어와요.</p>' : '');
      }
      h += '<p class="note">평가일은 청약 마감 뒤 ' + cycm + '개월 간격으로 잡은 예상일이라 실제 날짜는 투자설명서 기준. 이자 15.4% 과세(금융소득종합과세 대상). 중도 해지는 평가금액의 95% 안팎. 배정은 청약 경쟁에 따라 줄 수 있어요.</p>';
    }
    else if (k === "pvl"){
      var S = (PVL && PVL.S || {})[o.s] || [o.s, "", "", ""], usd = o.usd, bm = (PVL && PVL.bm) || [], kospi = bm[0] || {}, kosdaq = bm[1] || {};
      h += '<div class="sub2">📘 ' + e(S[0]) + ' <span class="mut">' + e(o.s) + '</span></div><p>' + e(S[1]) + '</p><p>🧺 <b>' + e(S[2].split(" — ")[0]) + '</b> — ' + e(S[2].split(" — ").slice(1).join(" — ")) + '</p><p>👀 ' + e(S[3]) + '</p>';
      if (o.live){ var SN = {d1: "1일", w1: "1주", m1: "1개월", m3: "3개월", m6: "6개월", y1: "1년", ytd: "올해"}, cs = [], ch_ = [];
        Object.keys(SN).forEach(function(k){ var v = o.live.src[k]; if (v === "calc" || v === "kofia") cs.push(SN[k]); else if (v === "chain") ch_.push(SN[k]); });
        h += '<p class="pd-lvp">📡 금융투자협회 공시 기준가로 ' + e(o.live.asof) + '까지 <b>직접 계산</b> — ' + (cs.length ? cs.join("·") + '은 기준가 기록으로' : '') + (ch_.length ? (cs.length ? ', ' : '') + ch_.join("·") + '은 아직 기록이 짧아 10/15 값에 그 뒤 변화(' + V.sgn(o.live.ch) + '%)를 이어 붙였어요(기록이 쌓이면 자동으로 직접 계산)' : '') + '.' + (o.live.resets && o.live.resets.length ? ' 결산으로 기준가가 리셋된 날(' + o.live.resets.map(function(d){ return d.slice(5); }).join(", ") + ')은 빼고 이어 붙였어요.' : '') + '</p>'; }
      else if (o.est) h += '<p class="pd-lvp">🧮 <b>추정</b> — 이 펀드는 기준가가 어디에도 공개되지 않아 <b>' + e(o.est.by) + '</b>로 계산했어요. 후보 ' + o.est.tried + '개 중 10/15 화면의 기간 성적(' + o.est.n + '개 기간)과 가장 잘 맞음: 민감도 ' + o.est.b + '배, 평균 오차 ±' + o.est.err + '%p(' + (o.est.err < 3 ? '잘 맞음' : o.est.err < 6 ? '보통' : '느슨함 — 참고만') + '). 10/15 뒤 ' + (o.est.ch != null ? V.sgn(o.est.ch) + '%' : '변화 없음') + ' (' + e(o.est.asof) + (o.est.mkt ? ' 종가' : ' 기준가') + '까지). 1일·1주·주간 수익률은 이 추정 줄 그대로 · 1개월~올해는 10/15 값에 이어 붙임. 실제 기준가와 다를 수 있어요.</p>';
      else h += '<p class="pd-lvp">📷 10/15 화면 값 — 기준가가 공개되지 않고, 과거 성적과 잘 맞는 추정 후보(같은 운용사 공모펀드·보유 종목 바스켓·같은 전략 펀드·지수)도 없어서 그대로 뒀어요.</p>';
      h += '<p class="pd-lvp">' + ((o.oc || openClose(o)) === "폐쇄형" ? '🔒 <b>폐쇄형(추정)</b> — 만기 전엔 보통 환매가 안 돼요.' : '🔓 <b>개방형(추정)</b> — 보통 월·분기마다 환매 신청이 가능해요(환매 주기·수수료는 약관 확인).') + ' 사모펀드 약관은 공개되지 않아 이름·전략으로 구분했어요.</p>';
      if (o.m) h += '<div class="sub2">🏢 운용사</div><p>' + e(o.m) + '</p>';
      h += '<div class="pd-pvh" data-pvhold="' + e(o.mg || "") + '"><div class="sub2">🧺 구성 엿보기 <span class="mut">불러오는 중…</span></div></div>';
      if (o.h && o.h.length) h += '<div style="margin:2px 0 8px">' + o.h.map(function(t){ return '<span class="chip2">' + e(t) + '</span>'; }).join("") + '</div>';
      h += '<p class="note">가입은 미래에셋 PB·영업점(일반투자자 최소 3억, 전문투자자 요건)이에요.</p>';
      h += '<div class="sub2">📊 기간 수익률 <span class="mut">' + (usd ? '달러 기준 · ' : '') + '옆은 ' + (PVL && PVL.bmasof ? e(PVL.bmasof.slice(5).replace('-', '/')) + ' 마감' : '10/15 화면의') + ' KOSPI / KOSDAQ</span></div>' + tbl([["d1", "1일"], ["w1", "1주"], ["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"]].map(function(p){
        var v = o[p[0]]; return [p[1] + ' <span class="mut">' + (kospi[p[0]] != null ? V.sgn(kospi[p[0]]) + '%' : '–') + ' / ' + (kosdaq[p[0]] != null ? V.sgn(kosdaq[p[0]]) + '%' : '–') + '</span>', v == null ? '–' : V.sgn(v) + '%', v == null ? '' : v >= 0 ? 'up' : 'dn']; }));
      if (o.wk && o.wk.length){ var bw = {}; ((kospi.wk) || []).forEach(function(w){ bw[w[0].slice(0, 10)] = w[1]; });
        var wkOf = function(d){ var t = Date.parse(d + "T00:00:00Z"); var best = null; Object.keys(bw).forEach(function(x){ var dd = Math.abs(Date.parse(x + "T00:00:00Z") - t); if (dd <= 4 * 864e5 && (best == null || dd < best[0])) best = [dd, x]; }); return best ? bw[best[1]] : null; };
        h += '<div class="sub2">📆 주간 수익률 <span class="mut">' + (o.wkEst ? '🧮 추정' : '기준가로 직접 계산') + ' · 최근 ' + o.wk.length + '주 · 옆은 그 주 코스피</span></div>' + tbl(o.wk.slice().reverse().map(function(w){ var kb = wkOf(w[0]);
          return [e(w[0].slice(5).replace("-", "/")) + ' 주 <span class="mut">' + (kb != null ? '코스피 ' + V.sgn(kb) + '%' : '') + '</span>', V.sgn(w[1]) + '%', w[1] >= 0 ? 'up' : 'dn']; })) +
          '<p class="note" style="margin:4px 0 0">펀드 기준가는 전날 종가로 계산돼서 코스피보다 하루 늦게 움직여요.</p>'; }
      var ys = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"].filter(function(y){ return (o.y || {})[y] != null; });
      if (ys.length) h += '<div class="sub2">📅 연도별 수익률 <span class="mut">2026은 ' + (o.live ? e(o.live.asof.slice(5).replace('-', '/')) : '10/15') + '까지 · 첫해는 설정일부터</span></div>' + V.dbars(ys.map(function(y){ return {label: y + '년', v: o.y[y]}; })) + (kospi.y ? '<p class="pd-bm">같은 해 코스피 ' + ys.filter(function(y){ return kospi.y[y] != null; }).map(function(y){ return y + ' <b class="' + cls(kospi.y[y]) + '">' + V.sgn(kospi.y[y], 1) + '%</b>'; }).join(' · ') + '</p>' : '');
      var pers = [["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"]].filter(function(p){ return o[p[0]] != null; });
      var chain = null, y0 = ys[0]; if (ys.length >= 2){ chain = 1; ys.forEach(function(y){ chain *= 1 + o.y[y] / 100; }); }
      h += '<div class="sub2">🧾 모의 계산 <span class="mut">「그때 넣었다면 지금」 · 과거 성적 그대로</span></div>' + amtBar() + tbl([["넣은 돈", W(A) + (usd ? ' <span class="mut">(달러로 바꿔 넣는 펀드 · 환율 변화 제외)</span>' : '')]].concat(pers.map(function(p){
        var v = A * (1 + o[p[0]] / 100); return [p[1] + " 전에 넣었다면", W(v) + " <span class='mut'>" + V.sgn(o[p[0]]) + "%</span>", v >= A ? "up" : "dn"]; })).concat(chain ? [[y0 + "년부터 연도별 성적 이어 붙이면", W(A * chain) + " <span class='mut'>" + V.sgn((chain - 1) * 100, 0) + "%</span>", chain >= 1 ? "up" : "dn"]] : []));
      h += '<p class="note">수익률은 보수를 뗀 기준가 기준(세전)이에요. 이익에는 배당소득세 15.4%(국내 상장주식 매매차익은 비과세)가 붙고, 사모펀드는 환매 주기(월·분기)나 폐쇄형 만기가 있어 바로 못 뺄 수 있어요. 과거 성적이 앞으로도 같다는 뜻은 아니에요.</p>';
    }
    return h + '<button class="pd-close" data-close>닫기 ▲</button>';
  }

  /* 🧺 사모 「구성 엿보기」 — 10/16 사용자 「사모펀드들 안에 구성종목 어캐든 찾아서 다 집어넣어」
     펀드별 보유 종목은 공개되지 않음 → 공개된 것 중 가장 가까운 두 가지를 운용사 단위로:
     ① DART 5% 대량보유 보고(archive/x/pv_hold.json · pv_hold.yml 매일) ② 같은 운용사 공모펀드의 보유 상위(fund_hold.json) */
  var PVH = null, DATA = null;
  function fillPvHold(pnl){
    var box = pnl && pnl.querySelector("[data-pvhold]"); if (!box) return;
    var mg = box.dataset.pvhold;
    if (!mg){ box.innerHTML = '<div class="sub2">🧺 구성 엿보기</div><p class="note">해외 사모·재간접처럼 국내 상장 주식을 직접 담지 않거나 운용사 공개 자료를 못 찾은 펀드예요. 위 「담는 것」이 이 전략의 일반적인 구성이고, 실제 내역은 가입자에게 분기마다 오는 자산운용보고서에만 나와요.</p>'; return; }
    Promise.all([PVH ? Promise.resolve(PVH) : getJSON("archive/x/pv_hold.json?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(j){ PVH = j; return j; }).catch(function(){ return null; }),
                 HOLD ? Promise.resolve(HOLD) : getJSON("archive/x/fund_hold.json?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(j){ HOLD = j; return j; }).catch(function(){ return null; })]).then(function(a){
      var H = a[0], FH = a[1], L = H && H.mg ? H.mg[mg] : null;
      var h = '<div class="sub2">🧺 구성 엿보기 <span class="mut">' + e(mg) + ' · 운용사 단위 공개 자료</span></div>' +
        '<p class="note" style="margin:0 0 6px">사모펀드는 펀드별 보유 종목을 공개하지 않아요. 대신 <b>이 운용사 전체</b>(모든 펀드·일임 합계)가 공개해야 하는 것을 모았어요 — 이 펀드가 꼭 담고 있다는 뜻은 아니에요.</p>';
      if (L && L.length){
        var on = L.filter(function(x){ return x.r == null || x.r >= 5; }).sort(function(x, y){ return (y.val || 0) - (x.val || 0) || (y.r || 0) - (x.r || 0); }), off = L.filter(function(x){ return x.r != null && x.r < 5; });
        var tv = on.reduce(function(a, x){ return a + (x.val || 0); }, 0), mw = Math.max.apply(null, on.map(function(x){ return x.w || 0; }).concat([1]));
        h += '<div class="sub2" style="margin-top:4px">① 5% 넘게 가진 상장사 <span class="mut">DART 대량보유 ' + on.length + '곳' + (tv ? ' · 평가 약 ' + fmt(Math.round(tv)) + '억원' : '') + '</span></div>' +
          '<div class="pd-pvl"><div class="hd"><span class="n">종목</span><b>비중</b><small>지분율</small></div>' + on.slice(0, 30).map(function(x){
          var dd = x.r != null && x.r0 != null ? x.r - x.r0 : null;
          return '<div><span class="n">' + (x.mk ? '<em>' + e(x.mk === "유" ? "코스피" : x.mk === "코" ? "코스닥" : x.mk) + '</em> ' : '') + e(x.nm) + '</span><b>' + (x.w != null ? x.w.toFixed(1) + '%' : '–') + '</b><small>' + (x.r != null ? x.r.toFixed(2) + '%' : '–') + '</small>' +
            (x.w != null ? '<span class="xbar"><i style="width:' + (x.w / mw * 100).toFixed(0) + '%;background:var(--c)"></i></span>' : '') +
            '<span class="d mut">' + (x.val != null ? '평가 약 ' + fmt(x.val) + '억 · ' : '') + (dd != null ? '지분 ' + (dd > 0 ? '▲' : dd < 0 ? '▼' : '') + Math.abs(dd).toFixed(2) + '%p · ' : '신규 보고 · ') + '보고 ' + e(x.date || "") + (x.purp && x.purp !== "단순투자" ? ' · ' + e(x.purp) : '') + '</span></div>'; }).join("") + '</div>' +
          (off.length ? '<p class="note" style="margin:4px 0 0">최근 5% 밑으로 줄인 곳: ' + off.slice(0, 12).map(function(x){ return e(x.nm) + ' ' + x.r.toFixed(1) + '%'; }).join(" · ") + '</p>' : '') +
          '<p class="note" style="margin:4px 0 0">「비중」 = 보고된 보유 주식 수 × 최근 종가로 잰 평가금액을, 이 운용사가 5% 넘게 가진 종목들 합계로 나눈 비율이에요(5% 밑 종목·채권·현금은 몰라서 빠짐 — 펀드 실제 비중과 달라요). 「지분율」 = 그 회사 주식 중 운용사가 가진 비율. 주식 수는 보고서 기준일 값(1%p 넘게 바뀌면 다시 보고). 금융감독원 DART · ' + e(H.updated || "") + ' 수집.</p>';
      } else h += '<p class="note">① DART 5% 대량보유 보고: ' + (H ? '최근 2년 안에 이 운용사 이름으로 낸 보고서가 없어요(5% 넘게 가진 상장사가 없거나 등록 이름이 달라 못 찾음).' : '자료 준비 중 — 첫 수집 뒤 채워져요.') + '</p>';
      var F = ((DATA || {}).funds || []).filter(function(f){ return f.co === mg && FH && FH.items && FH.items[f.c] && FH.items[f.c].h && FH.items[f.c].h.length; }).sort(function(x, y){ return (y.aum || 0) - (x.aum || 0); });
      if (F.length){ var f = F[0], x = FH.items[f.c], mx = Math.max.apply(null, x.h.map(function(r){ return r[1]; }));
        h += '<div class="sub2">② 같은 운용사 공모펀드 보유 상위 <span class="mut">' + e(fname(f.n)) + '</span></div><div class="pd-hl">' + x.h.slice(0, 10).map(function(r){ return '<div><span class="n">' + e(r[0]) + (r[2] ? ' <em>' + e(r[2]) + '</em>' : '') + '</span><span class="xbar"><i style="width:' + (r[1] / mx * 100).toFixed(0) + '%;background:var(--c)"></i></span><b>' + r[1].toFixed(1) + '%</b></div>'; }).join("") + '</div>' +
          '<p class="note" style="margin:4px 0 0">같은 하우스의 공모펀드라 스타일이 비슷한 경우가 많지만 사모펀드와 종목·비중은 달라요. ' + e(x.d ? x.d.slice(0, 4) + "-" + x.d.slice(4, 6) : "") + ' 기준.</p>';
      }
      box.innerHTML = h;
    });
  }
  /* 🧺 펀드 구성 — archive/x/fund_hold.json (미래에셋 펀드 상세 「보유 상위 종목」) 을 누를 때만 받음 */
  var HOLD = null;
  var ACOL = {"주식": "#e66767", "채권": "#3987e5", "유동성": "#9aa4b5", "펀드": "#9085e9", "파생": "#c98500", "기타": "#6b7280"};
  function fillHold(pnl){
    var box = pnl && pnl.querySelector("[data-hold]"); if (!box) return;
    (HOLD ? Promise.resolve(HOLD) : getJSON("archive/x/fund_hold.json?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(j){ HOLD = j; return j; })).then(function(H){
      var x = (H.items || {})[box.dataset.hold];
      if (!x || !x.h || !x.h.length){ box.innerHTML = '<div class="sub2">🧺 펀드 구성</div><p class="note">이 펀드는 보유 종목 자료가 아직 없어요(작은 펀드·신규 펀드는 공시가 늦어요).</p>'; return; }
      var at = {}, sum = 0; x.h.forEach(function(r){ var t = r[2] || "기타"; if (t === "유동성" && /사모|투자신탁|펀드/.test(r[0])) t = "펀드"; at[t] = (at[t] || 0) + r[1]; sum += r[1]; });
      if (sum < 99.5) at["나머지(상위 밖)"] = 100 - sum;
      var segs = Object.keys(at).sort(function(a, b){ return at[b] - at[a]; }).map(function(k, i){ return {label: k, v: Math.round(at[k] * 10) / 10, color: ACOL[k] || V.CAT[i % 6]}; });
      var mx = Math.max.apply(null, x.h.map(function(r){ return r[1]; }));
      box.innerHTML = '<div class="sub2">🧺 펀드 구성 <span class="mut">보유 상위 ' + x.h.length + '개 · ' + e(x.d ? x.d.slice(0, 4) + "-" + x.d.slice(4, 6) + "-" + x.d.slice(6, 8) : "") + ' 기준</span></div>' +
        '<div class="pd-stack">' + segs.map(function(sg_){ return '<i style="flex:' + sg_.v + ';background:' + sg_.color + '" title="' + e(sg_.label) + ' ' + sg_.v + '%"></i>'; }).join("") + '</div>' +
        '<div class="pd-leg">' + segs.map(function(sg_){ return '<span><i style="background:' + sg_.color + '"></i>' + e(sg_.label) + ' <b>' + sg_.v.toFixed(1) + '%</b></span>'; }).join("") + '</div>' +
        '<div class="pd-hl">' + x.h.map(function(r){ return '<div><span class="n">' + e(r[0]) + (r[2] ? ' <em>' + e(r[2]) + '</em>' : '') + '</span><span class="xbar"><i style="width:' + (r[1] / mx * 100).toFixed(0) + '%;background:var(--c)"></i></span><b>' + r[1].toFixed(1) + '%</b></div>'; }).join("") + '</div>' +
        '<p class="note">미래에셋 펀드 상세의 「보유 상위 종목」(보통 한두 달 전 기준)이에요. 재간접 펀드는 안에 담은 펀드 이름이 보여요.</p>';
    }).catch(function(){ box.innerHTML = '<div class="sub2">🧺 펀드 구성</div><p class="note">구성 자료를 못 불러왔어요.</p>'; });
  }


  /* 💼 포트 「🙋 내 포트」에 상품을 넣을 수 있게 (10/16 사용자 「포트에 주식 부분에 상품 부분을 더한 포트 · 비교 방식, 넣는 방식 등은 같게」)
     port.js 가 부름 — 채권·ELS 는 연 수익률(y)로 날마다 쌓고, 펀드는 기간 수익률(per)을 이어 붙여 길을 만든다 */
  window.prodCatalog = function(){
    var sv = ""; try { sv = localStorage.getItem("pvk") || ""; } catch(z) {}
    var pv = PVL ? Promise.resolve(PVL) : sv ? pvUnlock(sv).catch(function(){ return null; }) : Promise.resolve(null);
    return Promise.all([P(), pv]).then(function(a){
      var D = a[0], L = a[1], out = [], ds = function(d){ return d && d.length === 8 ? d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8) : d; };
      (D.krw || []).forEach(function(r){ if (r.after != null) out.push({id: "krw:" + r.name, g: "krw", name: r.name, sub: (r.kind || "") + " · 세후 " + pc(r.after) + " · 만기 " + r.mat, y: r.after, cur: "원"}); });
      var U = D.ust || {}, mq = {}; (U.items || []).forEach(function(x){ mq[(+x.cpn).toFixed(3) + x.mat] = x.ytm; });
      ((D.ust_all || {}).items || []).forEach(function(x){ if (x.k === "FRN" || x.k === "TIPS" || x.y == null) return; var q = mq[(+(x.cpn || 0)).toFixed(3) + x.mat];
        out.push({id: "ust:" + x.cu, g: "ust", name: x.nm + (x.mir ? " ★" : ""), sub: "만기 " + x.mat + " · " + (q != null ? "미래에셋 시세 " + pc(q) : "추정 " + pc(x.y)) + " · 달러", y: q != null ? q : x.y, cur: "달러", mir: !!x.mir}); });
      (D.anb || []).forEach(function(x){ if (x.code !== "NTN-F" || x.r == null) return; out.push({id: "brl:" + x.mat, g: "brl", name: "브라질 NTN-F " + x.mat.slice(0, 7), sub: "연 " + x.r.toFixed(2) + "% · 헤알 · 비과세", y: x.r, cur: "헤알"}); });
      ((D.live || {}).usd || []).forEach(function(x){ out.push({id: "bru:" + x.isin, g: "brl", name: x.name + " (달러)", sub: "연 " + pc(x.ytm) + " · 달러 · 미국채 +" + (x.sp != null ? x.sp.toFixed(2) : "–") + "%p", y: x.ytm, cur: "달러"}); });
      (D.funds || []).forEach(function(x){ if (!x.t || (x.aum || 0) < 10 || x.y1 == null) return; out.push({id: "fund:" + x.c, g: "fund", name: fname(x.n), sub: (x.co || "") + " · 1년 " + V.sgn(x.y1) + "% · 순자산 " + fmt(x.aum) + "억", per: {w1: x.w1, m1: x.m1, m3: x.m3, m6: x.m6, y1: x.y1}, asof: ds(x.d), cur: "원", rank: x.y1}); });
      if (L) L.rows.forEach(function(x, i){ out.push({id: "pvl:" + i + ":" + x.n.slice(0, 12), g: "pvl", name: pvname(x.n), sub: (SSHORT[x.s] || x.s) + " · 1년 " + (x.y1 != null ? V.sgn(x.y1) + "%" : "–") + (x.usd ? " · 달러" : ""), per: {d1: x.d1, w1: x.w1, m1: x.m1, m3: x.m3, m6: x.m6, y1: x.y1}, asof: L.asof, cur: x.usd ? "달러" : "원", rank: x.y1}); });
      (D.els || []).forEach(function(x){ if (x.cpn == null) return; out.push({id: "els:" + x.n, g: "els", name: x.n, sub: (x.ua || "") + " · 연 " + pc(x.cpn) + ((x.pp || 0) >= 100 ? " · 원금지급" : " · 원금 비보장"), y: x.cpn, cur: "원"}); });
      return {items: out, pvl: !!L};
    });
  };

  /* ───────── 공통 ───────── */
  var VIEW = {bond: bondView, fund: fundView, els: elsView}, BODY = {bond: bondBody, fund: fundBody, els: elsBody};
  window.prodView = function(key){ return '<div id="pdroot" data-k="' + key + '"><div class="loading">미래에셋 상품 자료 불러오는 중…</div></div>'; };
  window.prodInit = function(key){
    P().then(function(D){
      var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== key) return; DATA = D;
      var full = function(){ var r = document.getElementById("pdroot"); if (!r || r.dataset.k !== key) return;
        r.innerHTML = (D.errors && D.errors.length ? '<p class="note" style="margin:0 0 8px">⚠️ 일부 자료를 못 받았어요: ' + e(D.errors.join(" · ").slice(0, 200)) + ' — 지난 값을 보여 줘요.</p>' : '') + VIEW[key](D);
        bindSeg("pdseg", function(k){ SEL[key] = k; keep(); redraw(); }); bindInner(); };
      window.__pdRedraw = function(){ redraw(); };
      var redraw = function(){ var b = document.getElementById("pdbody"); if (!b) return; var y = b.getBoundingClientRect().top; b.innerHTML = BODY[key](D, SEL[key] || {bond: "gov", fund: "pv", els: "open"}[key]); holdAt("#pdbody", y); bindInner(); };
      var bindInner = function(){
        var dz = document.getElementById("elsdz"); if (dz && window.elsDesign) elsDesign(dz);
        bindSeg("pdper", function(k){ PER = k; keep(); redraw(); });
        bindSeg("pdustk", function(k){ SEL.ustk = k; keep(); redraw(); });
        bindSeg("pdbsort", function(k){ SEL.bsort = k; keep(); redraw(); });
        bindSeg("pdelsk", function(k){ SEL.elsk = k; keep(); redraw(); });
        bindSeg("pdpvp", function(k){ SEL.pvp = k; keep(); redraw(); });
        bindSeg("pdpvs", function(k){ SEL.pvs = k; keep(); redraw(); });
        bindSeg("pdpvoc", function(k){ SEL.pvoc = k; keep(); redraw(); });
        var go = document.getElementById("pvgo"), pw = document.getElementById("pvpw");
        var tryOpen = function(v, quiet){ if (PVBUSY || !v) return; PVBUSY = true; if (go) go.textContent = "여는 중…";
          pvUnlock(v).then(function(){ PVERR = ""; try { localStorage.setItem("pvk", v); } catch(z) {} PVBUSY = false; full(); })
            .catch(function(err){ PVBUSY = false; PVERR = quiet ? "" : (err && err.message && /브라우저/.test(err.message) ? err.message : "비밀번호가 맞지 않아요."); try { if (quiet && err && err.name === "OperationError") localStorage.removeItem("pvk"); } catch(z) {} redraw(); }); };
        if (go && pw){ go.onclick = function(){ tryOpen(pw.value.trim()); }; pw.onkeydown = function(ev){ if (ev.key === "Enter") tryOpen(pw.value.trim()); }; }
        if (!PVL && !PVBUSY && document.querySelector("#pdbody .loading")){ var sv = ""; try { sv = localStorage.getItem("pvk") || ""; } catch(z) {} if (sv) tryOpen(sv, true); }
        var lk = document.getElementById("pvlock"); if (lk) lk.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); PVL = null; try { localStorage.removeItem("pvk"); } catch(z) {} full(); };
      };
      full();
      root.addEventListener("click", function(ev){
        var amt = ev.target.closest && ev.target.closest("[data-amt]");
        if (amt){ ev.stopPropagation(); AMT = +amt.dataset.amt; try { localStorage.setItem("prodamt", AMT); } catch(z) {}
          var row = amt.closest(".pd-tap"), pnl = row && row.querySelector(":scope > .pd-x"); if (pnl){ var y = row.getBoundingClientRect().top; pnl.innerHTML = xpanel(OBJ[row.dataset.x]); fillHold(pnl); fillPvHold(pnl); holdAt('[data-x="' + row.dataset.x + '"]', y); } return; }
        var cl = ev.target.closest && ev.target.closest("[data-close]");
        if (cl){ ev.stopPropagation(); var r0 = cl.closest(".pd-tap"), p0 = r0 && r0.querySelector(":scope > .pd-x"); if (p0){ p0.remove(); r0.classList.remove("on"); var t0 = r0.getBoundingClientRect().top; if (t0 < 60) window.scrollTo({top: window.scrollY + t0 - 70, behavior: "smooth"}); } return; }
        if (ev.target.closest("a[href]")) return;
        var row = ev.target.closest && ev.target.closest(".pd-tap"); if (!row || !OBJ[row.dataset.x]) return;
        var pnl = row.querySelector(":scope > .pd-x");
        if (pnl){ pnl.remove(); row.classList.remove("on"); return; }
        pnl = document.createElement("div"); pnl.className = "pd-x no-clp"; setTimeout(function(){ fillHold(pnl); fillPvHold(pnl); }, 0); pnl.innerHTML = xpanel(OBJ[row.dataset.x]); row.appendChild(pnl); row.classList.add("on");
        try { if (window.unclamp) unclamp(row); } catch(z) {}   // 긴 카드 접기(전체 보기)가 펼친 계산서를 가리지 않게
      });
      var st = document.getElementById("pdstamp"); if (st) st.textContent = D.updated || "";
    }).catch(function(err){ console.error(err); var r = document.getElementById("pdroot"); if (r) r.innerHTML = '<div class="empty">상품 자료를 못 불러왔어요. 다음 수집 때 채워져요.</div>'; });
  };
  var css = document.createElement("style");
  css.textContent = ".pd-list{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}.pd-list>*{min-width:0}.pd-x{min-width:0;overflow:hidden}.pd-it{display:block;background:var(--panel2);border-radius:14px;padding:11px 12px;color:var(--text);text-decoration:none}" +
    ".pd-h{display:flex;align-items:center;gap:10px}.pd-n{flex:1;min-width:0}.pd-n b{display:block;font-size:14px;line-height:1.35;word-break:keep-all;overflow-wrap:anywhere}.pd-n small{overflow-wrap:anywhere}.pd-it{overflow:hidden}.pd-n small{display:block;color:var(--sub);font-size:11.5px;margin-top:2px;line-height:1.5}" +
    ".pd-v{text-align:right;flex:none}.pd-v b{display:block;font-size:19px;letter-spacing:-.3px}.pd-v small{display:block;color:var(--dim);font-size:10.5px}" +
    ".pd-it .rk{flex:none;width:22px;height:22px;border-radius:7px;background:var(--panel);color:var(--sub);font-size:12px;font-weight:800;display:inline-flex;align-items:center;justify-content:center}" +
    ".pd-bar{height:5px;border-radius:3px;background:var(--panel);margin:8px 0 6px;overflow:hidden}.pd-bar i{display:block;height:100%;background:var(--up);border-radius:3px}" +
    ".pd-row{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--sub);margin-top:6px;line-height:1.6}.pd-row b{color:var(--text)}" +
    ".pd-rep{margin:7px 0 2px;padding:7px 9px;border-radius:10px;background:color-mix(in srgb,var(--panel) 60%,var(--bg))}.pd-rph{font-size:12px;font-weight:700;color:var(--text)}.pd-rph .mut{font-weight:400}.pd-rpb{display:flex;height:7px;border-radius:4px;overflow:hidden;background:color-mix(in srgb,var(--sub) 25%,transparent);margin:5px 0 4px}.pd-rpb i{display:block;height:100%}.pd-rpt{font-size:11.5px;color:var(--sub);line-height:1.55}.pd-rpt b{color:var(--text)}.pd-rpt b.dn,.pd-rpm b.dn{color:var(--dn)}.pd-rpm{display:block;margin-top:3px;font-size:10.5px;color:var(--sub);line-height:1.35}.pd-rpm>span,.pd-rpm>b{display:block;word-break:keep-all;overflow-wrap:anywhere}.pd-ec td{vertical-align:top}.pd-rcmp{font-size:12px;color:var(--sub);line-height:1.5;margin:2px 0 8px}.pd-rcmp b{color:var(--text)}" +
    ".pd-e .chip2{margin:4px 4px 0 0}.pd-nt{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none;font-size:13px;line-height:1.45}.pd-nt .mut{flex:none;width:78px}" +
    ".pd-sort{display:flex;align-items:center;gap:8px;margin:-2px 0 10px}.pd-sort>.mut{flex:none;font-size:12px}.pd-sort .seg2{flex:1;margin:0}.pd-sort .seg2 button{font-size:12.5px;padding:6px 4px}" +
    ".pd-live{border:1px solid rgba(25,158,112,.35);border-radius:14px;padding:10px 10px 2px;margin:0 0 12px;background:linear-gradient(160deg,rgba(25,158,112,.08),transparent 70%)}.pd-lh{display:flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;margin:0 2px 8px}.pd-lh .mut{font-weight:400;font-size:11.5px}" +
    ".pd-dot{width:8px;height:8px;border-radius:50%;background:#19c37d;box-shadow:0 0 0 0 rgba(25,195,125,.6);animation:pdpulse 1.8s infinite}@keyframes pdpulse{0%{box-shadow:0 0 0 0 rgba(25,195,125,.55)}70%{box-shadow:0 0 0 7px rgba(25,195,125,0)}100%{box-shadow:0 0 0 0 rgba(25,195,125,0)}}" +
    ".pd-brl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px}.pd-brl div{background:var(--panel2);border-radius:12px;padding:10px 12px}.pd-brl small{display:block;color:var(--sub);font-size:11.5px}.pd-brl b{font-size:18px}.pd-brl em{display:block;font-style:normal;font-size:11px;color:var(--dim)}" +
    "#pdper{margin-top:-4px}.pd-doc p{margin:0;font-size:13.5px;line-height:1.7;color:var(--text);word-break:keep-all}.pd-doc summary{font-weight:700}" +
    ".pd-tap{cursor:pointer}.pd-tap.on{background:color-mix(in srgb,var(--c) 10%,var(--panel2));outline:1px solid color-mix(in srgb,var(--c) 40%,transparent)}.pd-x{margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".pd-x p{margin:0 0 6px;font-size:13px;line-height:1.65;color:var(--text);word-break:keep-all}.pd-x .note{color:var(--sub);font-size:12px}.pd-x .sub2{margin:10px 0 6px}" +
    ".pd-amt{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:0 0 8px}.pd-amt button{border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:999px;padding:3px 10px;font:inherit;font-size:12px}.pd-amt button.on{color:var(--text);border-color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent)}" +
    ".pd-tb{width:100%;border-collapse:collapse;font-size:12.5px}.pd-tb td{padding:5px 0;border-bottom:1px solid var(--line);vertical-align:top}.pd-tb td:first-child{color:var(--sub);padding-right:8px;width:50%}.pd-tb td:last-child{text-align:right;font-weight:600}.pd-tb td.up{color:var(--up)}.pd-tb td.dn{color:var(--down)}" +
    ".pd-cfw{max-height:360px;overflow:auto;border:1px solid var(--line);border-radius:10px;margin:0 0 6px}.pd-cf{width:100%;border-collapse:collapse;font-size:11.5px;table-layout:fixed}.pd-cf th:nth-child(1),.pd-cf td:nth-child(1){width:25%}.pd-cf th:nth-child(3),.pd-cf td:nth-child(3){width:31%}.pd-cf th{position:sticky;top:0;background:var(--panel);color:var(--sub);font-weight:600;padding:6px 5px;text-align:right;white-space:nowrap}.pd-cf th:nth-child(-n+2){text-align:left}" +
    ".pd-cf td{padding:6px 5px;border-top:1px solid var(--line);text-align:right;vertical-align:top}.pd-cf td:nth-child(1){text-align:left;color:var(--sub);font-size:11px;word-break:break-all}.pd-cf td:nth-child(2){text-align:left;word-break:keep-all}.pd-cf td:nth-child(3){white-space:nowrap}.pd-cf .mut{font-size:10.5px}.pd-cf td.dn{color:var(--down)}.pd-cf tr.sum td{background:var(--panel);font-weight:700}" +
    ".pd-stack{display:flex;height:12px;border-radius:6px;overflow:hidden;gap:2px;margin:4px 0 6px}.pd-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px;color:var(--sub);margin-bottom:8px}.pd-leg i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px}" +
    ".pd-hl div{display:grid;grid-template-columns:minmax(0,1fr) 56px 44px;gap:8px;align-items:center;font-size:12px;padding:4px 0;border-bottom:1px solid var(--line)}.pd-hl .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pd-hl em{font-style:normal;color:var(--dim);font-size:10.5px}.pd-hl b{text-align:right}" +
    ".pd-grp{border-top:1px solid var(--line);padding:6px 0}.pd-grp>summary{cursor:pointer;padding:6px 2px;font-size:14px}.pd-grp>.pd-list{margin:4px 0 6px}.seg2.wrap{flex-wrap:wrap;overflow:visible}.pd-pw{display:flex;gap:8px}.pd-pw button{flex:none;border:0;border-radius:12px;padding:0 16px;background:var(--c);color:#fff;font:inherit;font-weight:700}.pd-close{display:block;width:100%;margin:10px 0 0;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--sub);font:inherit;font-size:13px}.pd-lv{color:var(--c);font-weight:600}.pd-ec{width:100%;border-collapse:collapse;font-size:11.5px;table-layout:fixed;margin:0 0 6px}.pd-ec th{color:var(--sub);font-weight:600;text-align:left;padding:5px 4px;border-bottom:1px solid var(--line)}.pd-ec td{padding:6px 4px;border-bottom:1px solid var(--line);vertical-align:top;word-break:keep-all;overflow-wrap:anywhere}.pd-ec .mut{font-size:10.5px}.pd-ec tr.me td{background:rgba(245,158,11,.12)}.pd-ecm{padding:4px 0 8px;border-bottom:1px dashed var(--line);margin-bottom:8px}.pd-es{color:#c98500;font-weight:600}.pd-lvp{font-size:12.5px!important;color:var(--sub)!important;margin:0 0 8px!important}.pd-pvl div{display:grid;grid-template-columns:minmax(0,1fr) 54px 58px;gap:2px 8px;align-items:baseline;font-size:12.5px;padding:5px 0;border-bottom:1px solid var(--line)}.pd-pvl .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pd-pvl em{font-style:normal;font-size:10px;color:var(--dim)}.pd-pvl b{text-align:right}.pd-pvl small{text-align:right;font-size:11px}.pd-pvl .d{grid-column:1/-1;font-size:10.5px;margin-top:-2px}.pd-pvl .xbar{grid-column:1/-1;height:4px;display:block;width:100%}.pd-pvl .hd{font-size:10.5px;color:var(--dim);padding:2px 0}.pd-pvl .hd b{font-weight:500}.pd-bm{font-size:12px;color:var(--sub);margin:4px 0 0;line-height:1.7}.pd-err{color:var(--down);font-size:13px;font-weight:600;margin:8px 2px 0}.pd-q{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:9px 12px;font:inherit;font-size:14px;margin:0 0 10px}";
  document.head.appendChild(css);
})();
