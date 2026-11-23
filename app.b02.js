/* 📦 app.b02.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 2/8 (products.js … onepage.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
if(typeof __bs!=="function"){window.__bs=window.__bk=window.__be=function(){};}
__bs(2,9,["products.js", "els_design.js", "extras.js", "burst.js", "usage.js", "plus.js", "cpin.js", "onepage.js"],[4, 992, 1221, 1586, 1648, 1782, 1984, 2086]);
/* ======== products.js ======== */
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
    h += seg("pdseg", [["gov", "🇰🇷 국채"], ["ust", "🇺🇸 미국채"], ["brl", "🇧🇷 브라질(헤알)"], ["bru", "🇧🇷 브라질(달러)"], ["oth", "공사채·회사채"]], k) + sortBar() + '<div id="pdbody">' + boSlot(k) + bondBody(D, k) + '</div>';
    if (D.notice && D.notice.length) h += '<details class="card cpx-d"><summary>📢 채권 공지 <span class="mut">미래에셋 · 최근 ' + D.notice.length + '건</span></summary>' +
      D.notice.map(function(n){ return '<a class="pd-nt" href="' + e(n.url) + '" target="_blank" rel="noopener"><span class="mut">' + e(n.date || "") + '</span>' + e(n.title) + '</a>'; }).join("") + '</details>';
    return h + WARN;
  }
  /* 🧾 10/16 사용자: 「펀드나 채권 누르면 각각에 대한 설명 혹은 모의 투자계산서 나오게 탭 접기」 — 행을 누르면 그 밑에 설명 + 계산서가 펼쳐짐 */
  var OBJ = {}, OBN = 0, AMT = 1000;
  try { AMT = +localStorage.getItem("prodamt") || 1000; } catch(x) {}
  function reg(kind, o){ var id = "x" + (++OBN); OBJ[id] = {k: kind, o: o}; return ' data-x="' + id + '"'; }
  window.__pdObj = function(id){ return OBJ[id]; };   // 📌 10/22 A10/22-2 관제탑 「담아 두기」 단추(ux1022.js)
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
      if (L.asof) ANCHOR = L.asof;
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
  var ANCHOR = "2026-10-15";        // 화면 사진 날짜 — pvLive 가 PVL.asof 로 바꿈 (10/22: 새 사진 받을 때마다 자동)
  function amd(){ return String(ANCHOR).slice(5).replace("-", "/"); }   // 사진 날짜 「10/22」 (xpanel 안 md 가림 피함)
  var SLACK = {w1: 3, m1: 5, m3: 8, m6: 12, y1: 15};   // 10/22 학습: 기간 시작점이 이만큼보다 멀면 안 씀(옛 9일 → 1주가 2주로 늘어 −10%p 넘게 틀렸음)
  function serNav(ds, arr){ var d = [], f = [], prev = null, acc = 1;
    for (var i = 0; i < ds.length; i++){ var v = arr[i]; if (v == null || !(v > 0)) continue; if (prev != null){ var r = v / prev; if (r < 0.85 && Math.abs(v - 1000) < 60) r = 1; acc *= r; } d.push(ds[i]); f.push(acc); prev = v; }
    return d.length > 3 ? {d: d, f: f, nav: true} : null; }
  function serMkt(ds, vs){ return ds && ds.length > 3 ? {d: ds, f: vs, nav: false} : null; }
  function sAt(S, date, strict, slack){ var T = Date.parse(date + "T00:00:00Z"), j = -1; for (var i = 0; i < S.d.length; i++){ if (strict ? S.d[i] < date : S.d[i] <= date) j = i; else break; }
    if (j < 0 || T - Date.parse(S.d[j] + "T00:00:00Z") > (slack || 9) * 864e5) return null; return S.f[j]; }
  function sAgo(date, days){ return new Date(Date.parse(date + "T00:00:00Z") - days * 864e5).toISOString().slice(0, 10); }
  function sWin(S, end, days, slack){ var st = !S.nav, a = sAt(S, end, st, 4), b = sAt(S, sAgo(end, days), st, slack); return a != null && b != null ? a / b - 1 : null; }
  var WINS = [["w1", 7], ["m1", 30.4], ["m3", 91.3], ["m6", 182.6], ["y1", 365.25]];
  function fitCand(o, S){
    var xs = [], ys = [];
    // 10/22 학습: 지금 사진 + 지난 사진(o.hx)의 기간 성적을 모두 식으로 씀 → 사진이 쌓일수록 민감도·후보 고르기가 실제에 맞춰짐
    var snaps = [[ANCHOR, o]]; Object.keys(o.hx || {}).forEach(function(d){ if (d !== ANCHOR) snaps.push([d, o.hx[d]]); });
    snaps.forEach(function(sn){ WINS.forEach(function(w){ var fr = sn[1][w[0]], cr = sWin(S, sn[0], w[1], SLACK[w[0]]); if (fr == null || cr == null || fr <= -99 || cr <= -0.99) return; xs.push(Math.log(1 + cr)); ys.push(Math.log(1 + fr / 100)); }); });
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
      if (o.live || (o.k && o.kb && o.kd >= ANCHOR)) return;      // 11/05: 사진 날짜 = 금투협 마지막 날짜인 날엔 실측 펀드를 추정으로 바꾸지 않음(다음 기준가부터 📡)
      var C = [];
      if (o.mg && pubBy[o.mg]) pubBy[o.mg].slice(0, 40).forEach(function(c){ var S = serNav(PUB.d, PUB.v[c]); if (S) C.push([S, "같은 운용사 공모펀드 「" + fname(PUB.n[c][0]) + "」 기준가", "pub"]); });
      if (o.mg && BK && BK[o.mg]){ var S2 = serMkt(BK[o.mg].d, BK[o.mg].v); if (S2) C.push([S2, "운용사 바스켓(5% 넘게 가진 " + BK[o.mg].n + "종목 · 평가금액 비중)", "bk"]); }
      var S3 = peerSer(o.s); if (S3) C.push([S3, "같은 전략(" + (SSHORT[o.s] || o.s) + ") 실측 펀드 " + peer[o.s].length + "개 평균", "peer"]);
      (bm || []).forEach(function(b){ var S4 = b.s ? serMkt(b.s.d, b.s.v) : null; if (S4) C.push([S4, b.n + " 지수", "ix"]); });
      var best = null;
      C.forEach(function(c){ var ft = fitCand(o, c[0]); if (ft && (!best || ft.err < best.ft.err)) best = {c: c, ft: ft}; });
      if (!best || best.ft.err > 10) return;
      // 10/27 학습: 지수(ix)로 맞춘 추정은 실제보다 2배쯤 크게 움직였음(10/15→22·10/22→27 두 번 다) → 민감도 절반으로
      // 11/05 학습: 같은 운용사 공모펀드(pub)로 맞춘 민감도가 1을 넘으면(타임폴리오 위드타임 1.5배 등) 실제보다 크게 움직임 → 1로 상한(세 구간 중 두 구간 개선)
      var S = best.c[0], st = !S.nav, b = Math.min(best.c[2] === "pub" ? 1 : 3, best.ft.b) * (best.c[2] === "ix" ? 0.5 : 1), z = sAt(S, ANCHOR, st, 4), lastD = S.d[S.d.length - 1], last = S.f[S.f.length - 1];
      if (!z) return;
      var tf = function(r){ return r == null ? null : Math.round((Math.exp(b * Math.log(1 + r)) - 1) * 10000) / 100; };
      var since = last / z - 1, est = tf(since);
      var chain = function(v){ return v == null ? null : Math.round(((1 + v / 100) * (1 + est / 100) - 1) * 10000) / 100; };
      if (lastD > ANCHOR && Math.abs(since) > 1e-9){
        ["m1", "m3", "m6", "y1"].forEach(function(p){ o[p] = chain(o[p]); });
        if (o.y && o.y["2026"] != null) o.y["2026"] = chain(o.y["2026"]);
        if (o.nav != null) o.nav = Math.round(o.nav * (1 + est / 100) * 100) / 100;
        var w1 = S.f.length > 5 ? sWin(S, lastD, 7, SLACK.w1) : null, d1 = S.f.length > 1 && Date.parse(S.d[S.d.length - 1]) - Date.parse(S.d[S.d.length - 2]) <= 4 * 864e5 ? S.f[S.f.length - 1] / S.f[S.f.length - 2] - 1 : null;
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
    return '<div class="pd-it pd-p pd-tap"' + reg("pvl", Object.assign({per: p}, x)) + '><div class="pd-h">' + (i != null ? '<span class="rk">' + (i + 1) + '</span>' : '') + '<div class="pd-n"><b>' + e(pvname(x.n)) + '</b><small>' + e(SSHORT[x.s] || x.s) + (x.d ? ' · 설정 ' + e(x.d.slice(0, 7).replace("-", ".")) : '') + (x.nav != null ? ' · 기준가 ' + cur + fmt(x.nav) : '') + (/손익차등/.test(x.n) ? ' · <span class="chip2 hot" style="margin:0">손익차등</span>' : '') + ' · ' + e(x.oc || openClose(x)) + (x.live ? ' · <span class="pd-lv">📡 실측 ' + e(md(x.live.asof)) + '</span>' : x.est ? ' · <span class="pd-es">🧮 추정 ' + e(md(x.est.asof)) + '</span>' : ' · <span class="mut">📷 ' + amd() + '</span>') + '</small></div>' +
      '<div class="pd-v">' + (v == null ? '<b class="mut">–</b>' : sg(v)) + '<small>' + PVPN[p] + '</small></div></div>' +
      '<div class="pd-row"><span>1주 ' + sg(x.w1) + '</span><span>1개월 ' + sg(x.m1) + '</span><span>3개월 ' + sg(x.m3) + '</span><span>6개월 ' + sg(x.m6) + '</span><span>1년 ' + sg(x.y1) + '</span><span>올해 ' + sg((x.y || {})["2026"]) + '</span></div></div>';
  }
  function pvBody(){
    if (!PVL){
      var saved = ""; try { saved = localStorage.getItem("pvk") || ""; } catch(z) {}
      return card("🔒 미래에셋 사모 라인업 <span class='mut'>잠김</span>",
        (saved && !PVERR ? '<div class="loading">여는 중…</div>' :
        '<p class="note" style="margin:0 0 10px">미래에셋증권 사내용 「사모 주요펀드 라인업 및 성과현황」을 옮긴 자료라 비밀번호로 잠가 두었어요. 한 번 열면 이 기기에서는 다음부터 자동으로 열려요.</p>' +
        '<div class="pd-pw"><input aria-label="비밀번호" id="pvpw" type="password" autocomplete="current-password" placeholder="비밀번호" class="pd-q" style="margin:0"><button id="pvgo">열기</button></div>' +
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
      '<p class="note">' + e(PVL.src) + '. 비교 기준선 KOSPI·KOSDAQ는 지수 종가로 직접 계산(엑셀 값 안 씀). 수익률은 기준가 기준(세전·보수 차감 후), 달러 펀드는 달러 기준이에요. <b>📡 표시 ' + (PVL.nlive || 0) + '개</b>는 금융투자협회 공시 기준가를 매일 쌓아 수익률을 직접 계산, <b>🧮 추정 ' + (PVL.nest || 0) + '개</b>는 기준가가 공개되지 않아 같은 운용사 공모펀드·운용사 보유 종목 바스켓·같은 전략 실측 펀드·지수 중 과거 성적에 가장 잘 맞는 것으로 매일 추정(' + e(md(PVL.kasof || "")) + ') — 나머지는 금투협에 기준가를 안 올리는 펀드라 ' + amd() + ' 화면 값이에요(새 화면 사진·엑셀을 주시면 갱신). 펀드를 누르면 전략 설명·연도별 성적·모의 계산이 펼쳐져요. <a href="#" id="pvlock">이 기기에서 잠그기</a></p>';
  }
  /* 🏢 운용사별 — 11/05 사용자 「공모랑 사모펀드 운용사별로 검색할 수 있는 탭 만들어」
     공모 = 미래에셋 펀드검색 전체(x.co) · 사모 = 🔒 라인업(잠금 풀렸을 때만, o.mg — 없으면 이름 앞머리로. 확실한 계열만 운용사 이름으로 붙이고 나머지는 「이름 기준」 표시) */
  var MGMAP = [[/^미래에셋/, "미래에셋자산운용"], [/^KB\s/, "KB자산운용"], [/^신한\s/, "신한자산운용"], [/^삼성/, "삼성자산운용"], [/^대신\s/, "대신자산운용"]];
  var MGBRAND = ["WWG", "TCK", "The황소", "Blue 라이언", "아너스", "CK", "AH", "리딩", "NB", "W"];
  function mgNorm(n){ return String(n || "").replace(/투자일임$/, "").replace(/\s+/g, "").trim(); }
  function pvMgr(o){
    if (o.mg) return [mgNorm(o.mg), false];
    for (var i = 0; i < MGMAP.length; i++) if (MGMAP[i][0].test(o.n)) return [MGMAP[i][1], false];
    for (var j = 0; j < MGBRAND.length; j++) if (String(o.n).indexOf(MGBRAND[j]) === 0) return [MGBRAND[j], true];
    return [String(o.n).split(/\s|일반|전문/)[0] || "기타", true];
  }
  function mgShort(n){ return String(n).replace(/(자산운용|투자신탁운용|투자자산운용|자산운용사)$/, "") || n; }
  function mgIndex(D){
    var M = {}, add = function(nm, k, x, g){ var m = M[nm] = M[nm] || {n: nm, pub: [], pv: [], guess: false}; m[k].push(x); if (g) m.guess = true; };
    (D.funds || []).forEach(function(x){ if (x.co) add(mgNorm(x.co), "pub", x); });
    if (PVL) PVL.rows.forEach(function(o){ var g = pvMgr(o); add(g[0], "pv", o, g[1]); });
    return Object.keys(M).map(function(k){ return M[k]; });
  }
  function mgSrch(s){ return String(s || "").toLowerCase().replace(/[\s·()\[\]_\-]/g, ""); }
  function mgAvg(a){ var v = a.filter(function(v){ return v != null && v > -99; }); return v.length ? v.reduce(function(s, x){ return s + x; }, 0) / v.length : null; }
  function mgList(D){
    var per = PER, q = mgSrch(SEL.mq), Q = String(SEL.mq || "").split(/\s+/).map(mgSrch).filter(Boolean), kind = SEL.mk || "", srt = SEL.ms || "n";
    var A = mgIndex(D).map(function(m){
      // 띄어쓰기로 나눈 낱말이 모두 (운용사 이름 + 펀드 이름)에 들어 있으면 맞음 — 「머스트 10호」·「타임 EH」처럼
      var mn = mgSrch(m.n) + mgSrch(mgShort(m.n)), ok = function(x){ var t = mn + "|" + mgSrch(x.n); return Q.every(function(w){ return t.indexOf(w) >= 0; }); };
      var hitN = Q.length && Q.every(function(w){ return mn.indexOf(w) >= 0; }), pub = m.pub, pv = m.pv;
      if (Q.length && !hitN){ pub = pub.filter(ok); pv = pv.filter(ok); }
      if (kind === "pub") pv = []; if (kind === "pv") pub = [];
      return {n: m.n, guess: m.guess, pub: pub, pv: pv, hitN: hitN, cnt: pub.length + pv.length, avg: mgAvg(pub.map(function(x){ return x[per]; }).concat(pv.map(function(o){ return pvv(o, per === "y3" ? "y1" : per); })))};
    }).filter(function(m){ return m.cnt > 0; });
    A.sort(srt === "r" ? function(a, b){ return (b.avg == null ? -1e9 : b.avg) - (a.avg == null ? -1e9 : a.avg); } : function(a, b){ return b.cnt - a.cnt || (b.avg || 0) - (a.avg || 0); });
    var nPub = A.reduce(function(s, m){ return s + m.pub.length; }, 0), nPv = A.reduce(function(s, m){ return s + m.pv.length; }, 0);
    var row = function(m){
      var by = function(a, pv){ return a.slice().sort(function(x, y){ var u = pv ? pvv(x, per) : x[per], w = pv ? pvv(y, per) : y[per]; return (w == null ? -1e9 : w) - (u == null ? -1e9 : u); }); };
      var pvs = by(m.pv, true), pbs = by(m.pub, false), best = pbs.concat(pvs).filter(function(x){ return (m.pv.indexOf(x) >= 0 ? pvv(x, per) : x[per]) != null; })[0];
      var bestV = best ? (m.pv.indexOf(best) >= 0 ? pvv(best, per) : best[per]) : null;
      var body = (pvs.length ? '<div class="sub2">🔒 사모 ' + pvs.length + '개</div><div class="pd-list">' + pvs.map(function(x, i){ return pvlrow(x, i, per === "y3" ? "y1" : per); }).join("") + '</div>' : '') +
        (pbs.length ? '<div class="sub2">📦 공모 ' + pbs.length + '개</div><div class="pd-list">' + pbs.slice(0, 20).map(function(x, i){ return frow(x, i, per); }).join("") + '</div>' +
          (pbs.length > 20 ? '<details class="pd-mmore"><summary>공모 나머지 ' + (pbs.length - 20) + '개 펼치기</summary><div class="pd-list">' + pbs.slice(20).map(function(x, i){ return frow(x, i + 20, per); }).join("") + '</div></details>' : '') : '') +
        (m.guess ? '<p class="note" style="margin:6px 2px 0">운용사 이름은 펀드 이름 앞머리 기준이라 실제 운용사와 다를 수 있어요(약관에서 확인).</p>' : '');
      return '<details class="pd-mg"' + (q && A.length <= 3 ? ' open' : '') + '><summary><div class="pd-mgh"><div class="pd-n"><b>' + e(mgShort(m.n)) + (m.guess ? ' <span class="mut" style="font-weight:400;font-size:12px">이름 기준</span>' : '') + '</b><small>' +
        (m.pub.length ? '📦 공모 ' + m.pub.length : '') + (m.pub.length && m.pv.length ? ' · ' : '') + (m.pv.length ? '🔒 사모 ' + m.pv.length : '') +
        (best && m.pub.length + m.pv.length > 1 ? ' · 1등 ' + e((m.pv.indexOf(best) >= 0 ? pvname(best.n) : fname(best.n)).slice(0, 22)) + ' ' + sg(bestV) : '') + '</small></div>' +
        '<div class="pd-v">' + (m.avg == null ? '<b class="mut">–</b>' : sg(m.avg)) + '<small>평균 ' + PN[per] + '</small></div></div></summary><div class="pd-mgb">' + body + '</div></details>';
    };
    var lim = SEL.mall ? A.length : 30;
    return '<p class="pd-mgc">' + (q ? '「' + e(SEL.mq) + '」 ' : '') + '운용사 <b>' + A.length + '</b>곳 · 공모 <b>' + nPub.toLocaleString() + '</b> · 사모 <b>' + nPv + '</b></p>' +
      (A.length ? A.slice(0, lim).map(row).join("") : '<div class="empty">찾는 운용사·펀드가 없어요. 이름 일부만 넣어 보세요(예: 타임, 머스트, VIP).</div>') +
      (A.length > lim ? '<button class="pd-mall" id="pdmall">운용사 ' + (A.length - lim) + '곳 더 보기</button>' : '');
  }
  function mgBody(D){
    return card("🏢 운용사별 찾기 <span class='mut'>공모 + 사모</span>",
      '<input id="pdmq" class="pd-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="운용사·펀드 이름 (예: 타임폴리오, 머스트, 삼성)" value="' + e(SEL.mq || "") + '">' +
      seg("pdmk", [["", "전체"], ["pub", "📦 공모"], ["pv", "🔒 사모"]], SEL.mk || "") +
      '<div class="pd-sort"><span class="mut">기간</span>' + seg("pdper", PERS, PER) + '</div>' +
      '<div class="pd-sort"><span class="mut">순서</span>' + seg("pdms", [["n", "펀드 많은 순"], ["r", "평균 수익률 순"]], SEL.ms || "n") + '</div>' +
      (PVL ? '' : '<a href="#" id="pdmpv" class="pd-mpv">🔒 사모는 「사모 라인업」에서 비밀번호로 열면 함께 보여요 ›</a>') +
      '<p class="note" style="margin:6px 2px 0">운용사를 누르면 그 운용사의 사모·공모 펀드가 수익률 순으로 펼쳐지고, 펀드를 누르면 상세가 열려요. 평균은 그 운용사 펀드들의 단순 평균(클래스가 여러 개면 각각 셈)이라 참고용이에요. 사모 3년 수익률은 없어서 1년으로 보여 줘요.</p>') +
      '<div id="pdmlist">' + mgList(D) + '</div>';   // 목록은 카드 밖 — 긴 카드 「전체 보기」 접기에 안 걸리게
  }
  function fundView(D){
    var F = (D.funds || []).filter(function(x){ return x.t; }), k = SEL.fund || "pv";
    if (k === "mir") k = SEL.fund = "pv";
    var h = '<div class="mg-kv"><div><small>🔒 미래에셋 사모 라인업</small><b>' + (PVL ? PVL.rows.length + '개' : '잠김') + '</b><em>' + (PVL ? e(PVL.asof) + ' 사내 화면' : '비밀번호로 열기') + '</em></div>' +
      '<div><small>공모펀드 (미래에셋 펀드검색)</small><b>' + F.length.toLocaleString() + '개</b><em>순자산 10억↑ 수익률 순위</em></div></div>';
    h += seg("pdseg", [["pv", "🔒 사모 라인업"], ["mgr", "🏢 운용사별"], ["all", "🏆 공모 TOP 20"], ["type", "유형별 TOP"]], k) + '<div id="pdbody">' + fundBody(D, k) + '</div>';
    return doc("fund") + h + WARN;
  }
  function fundBody(D, k){
    var F = (D.funds || []).filter(function(x){ return x.t; }), per = PER;
    var by = function(a, p){ p = p || per; return a.filter(function(x){ return x[p] != null; }).sort(function(x, y){ return y[p] - x[p]; }); };
    if (k === "pv" || k === "mir") return pvBody();
    if (k === "mgr") return mgBody(D);
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
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b>' + e(fname(x.n)) + '</b></div><div class="sh-body">' +
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

  window.__elsApi = {repBand: function(st, f){ return repBand(st, f); }, repMini: function(st){ return repMini(st); }, rep: function(){ return ELSREP; }, D: function(){ return DATA; }, load: function(){ elsRep(""); return ELSREPW || Promise.resolve(); }};   // 🎛 설계기(els_design.js)에서 씀
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
        h += '<p class="pd-lvp">📡 금융투자협회 공시 기준가로 ' + e(o.live.asof) + '까지 <b>직접 계산</b> — ' + (cs.length ? cs.join("·") + '은 기준가 기록으로' : '') + (ch_.length ? (cs.length ? ', ' : '') + ch_.join("·") + '은 아직 기록이 짧아 ' + amd() + ' 값에 그 뒤 변화(' + V.sgn(o.live.ch) + '%)를 이어 붙였어요(기록이 쌓이면 자동으로 직접 계산)' : '') + '.' + (o.live.resets && o.live.resets.length ? ' 결산으로 기준가가 리셋된 날(' + o.live.resets.map(function(d){ return d.slice(5); }).join(", ") + ')은 빼고 이어 붙였어요.' : '') + '</p>'; }
      else if (o.est) h += '<p class="pd-lvp">🧮 <b>추정</b> — 이 펀드는 기준가가 어디에도 공개되지 않아 <b>' + e(o.est.by) + '</b>로 계산했어요. 후보 ' + o.est.tried + '개 중 ' + amd() + ' 화면의 기간 성적(' + o.est.n + '개 기간)과 가장 잘 맞음: 민감도 ' + o.est.b + '배, 평균 오차 ±' + o.est.err + '%p(' + (o.est.err < 3 ? '잘 맞음' : o.est.err < 6 ? '보통' : '느슨함 — 참고만') + '). ' + amd() + ' 뒤 ' + (o.est.ch != null ? V.sgn(o.est.ch) + '%' : '변화 없음') + ' (' + e(o.est.asof) + (o.est.mkt ? ' 종가' : ' 기준가') + '까지). 1일·1주·주간 수익률은 이 추정 줄 그대로 · 1개월~올해는 ' + amd() + ' 값에 이어 붙임. 실제 기준가와 다를 수 있어요.</p>';
      else h += '<p class="pd-lvp">📷 ' + amd() + ' 화면 값 — 기준가가 공개되지 않고, 과거 성적과 잘 맞는 추정 후보(같은 운용사 공모펀드·보유 종목 바스켓·같은 전략 펀드·지수)도 없어서 그대로 뒀어요.</p>';
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
      if (ys.length) h += '<div class="sub2">📅 연도별 수익률 <span class="mut">2026은 ' + (o.live ? e(o.live.asof.slice(5).replace('-', '/')) : amd()) + '까지 · 첫해는 설정일부터</span></div>' + V.dbars(ys.map(function(y){ return {label: y + '년', v: o.y[y]}; })) + (kospi.y ? '<p class="pd-bm">같은 해 코스피 ' + ys.filter(function(y){ return kospi.y[y] != null; }).map(function(y){ return y + ' <b class="' + cls(kospi.y[y]) + '">' + V.sgn(kospi.y[y], 1) + '%</b>'; }).join(' · ') + '</p>' : '');
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
  // 🔧 11/16 자가 업그레이드: 오류 줄의 영어 내부 이름(ust_all 등)·HTTP 기술 문구를 한글 이름만 남김 (health #bond·#fund·#els)
  var ERRKO = {krw: "원화채권", ust: "미국채(미래에셋)", aud: "호주채", notice: "채권 공지", funds: "공모펀드", els: "ELS", els_done: "지난 ELS", td: "브라질 국채", td_hist: "브라질 국채 기록", anb: "브라질 채권 시세", ust_all: "미국채 전체 목록", bm: "기준 지수"};
  function errKo(L){ var seen = {}; return (L || []).map(function(x){ var k = String(x).split(":")[0].trim(); return ERRKO[k] || k.replace(/[A-Za-z_]{3,}\S*/g, "").trim() || "일부 자료"; }).filter(function(n){ if (seen[n]) return false; seen[n] = 1; return true; }).join(" · ").slice(0, 120); }
  function boSlot(k){ return /^(gov|ust|brl|bru)$/.test(k || "gov") ? '<div class="bo-slot" data-bo="' + (k || "gov") + '"></div>' : ""; }   // 📄 11/05 채권 전망 보고서(bond_outlook.js) 자리
  var VIEW = {bond: bondView, fund: fundView, els: elsView}, BODY = {bond: function(D, k){ return boSlot(k) + bondBody(D, k); }, fund: fundBody, els: elsBody};
  window.prodView = function(key){ return '<div id="pdroot" data-k="' + key + '"><div class="loading">미래에셋 상품 자료 불러오는 중…</div></div>'; };
  window.prodInit = function(key){
    P().then(function(D){
      var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== key) return; DATA = D;
      var full = function(){ var r = document.getElementById("pdroot"); if (!r || r.dataset.k !== key) return;
        r.innerHTML = (D.errors && D.errors.length ? '<p class="note" style="margin:0 0 8px">⚠️ 일부 자료를 못 받았어요: ' + e(errKo(D.errors)) + ' — 지난 값을 보여 줘요.</p>' : '') + (false && window.threeWay && key === "bond" ? '<div id="pd3w"></div>' : '') + VIEW[key](D);   // 🎨 11/04: 세 갈래 길은 상품 첫 화면(채권)에만 — 채권·펀드 중복 카드 분리
        if (false && window.threeWay && key === "bond") try { threeWay(document.getElementById("pd3w"), D); } catch(x) {}   // ⚖️ 10/21 A10/21-3 세 갈래 길
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
        bindSeg("pdmk", function(k){ SEL.mk = k; keep(); redraw(); });
        bindSeg("pdms", function(k){ SEL.ms = k; keep(); redraw(); });
        var mq = document.getElementById("pdmq"), ml = document.getElementById("pdmlist"), mt = null;
        var mgAll = function(){ var b = document.getElementById("pdmall"); if (b) b.onclick = function(){ SEL.mall = 1; ml.innerHTML = mgList(D); mgAll(); }; };
        if (mq && ml){ mq.oninput = function(){ clearTimeout(mt); mt = setTimeout(function(){ SEL.mq = mq.value.trim(); SEL.mall = 0; keep(); ml.innerHTML = mgList(D); mgAll(); }, 180); }; mgAll(); }
        var mpv = document.getElementById("pdmpv"); if (mpv) mpv.onclick = function(ev){ ev.preventDefault(); SEL.fund = "pv"; keep(); full(); };
        var go = document.getElementById("pvgo"), pw = document.getElementById("pvpw");
        var tryOpen = function(v, quiet){ if (PVBUSY || !v) return; PVBUSY = true; if (go) go.textContent = "여는 중…";
          pvUnlock(v).then(function(){ PVERR = ""; try { localStorage.setItem("pvk", v); } catch(z) {} PVBUSY = false; full(); })
            .catch(function(err){ PVBUSY = false; PVERR = quiet ? "" : (err && err.message && /브라우저/.test(err.message) ? err.message : "비밀번호가 맞지 않아요."); try { if (quiet && err && err.name === "OperationError") localStorage.removeItem("pvk"); } catch(z) {} redraw(); }); };
        if (go && pw){ go.onclick = function(){ tryOpen(pw.value.trim()); }; pw.onkeydown = function(ev){ if (ev.key === "Enter") tryOpen(pw.value.trim()); }; }
        if (!PVL && !PVBUSY && document.querySelector("#pdbody .loading")){ var sv = ""; try { sv = localStorage.getItem("pvk") || ""; } catch(z) {} if (sv) tryOpen(sv, true); }
        if (!PVL && !PVBUSY && mq && !window.__pvTried){ window.__pvTried = 1; var sv2 = ""; try { sv2 = localStorage.getItem("pvk") || ""; } catch(z) {} if (sv2) tryOpen(sv2, true); }   // 운용사별 탭에서도 저장된 비밀번호로 사모 자동 열기
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
  css.textContent = ".pd-mg{background:var(--panel2);border-radius:14px;margin:0 0 8px;overflow:hidden}.pd-mg>summary{list-style:none;cursor:pointer;padding:11px 12px}.pd-mg>summary::-webkit-details-marker{display:none}.pd-mg[open]>summary{border-bottom:1px solid var(--line)}.pd-mgh{display:flex;align-items:center;gap:10px}.pd-mgh .pd-n b{font-size:15px}.pd-mgb{padding:4px 8px 10px}.pd-mgb .pd-it{background:var(--panel)}.pd-mgb .sub2{margin:10px 4px 6px}.pd-mgc{font-size:12.5px;color:var(--sub);margin:4px 2px 8px}.pd-mgc b{color:var(--text)}.pd-mall{display:block;width:100%;margin:4px 0 0;padding:11px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--text);font-weight:700}.pd-mmore{margin-top:8px}.pd-mmore>summary{cursor:pointer;font-size:13px;color:var(--sub);padding:6px 4px}#pdmq{margin:0 0 10px}.pd-mpv{display:block;font-size:12.5px;color:var(--sub);margin:2px 2px 10px;text-decoration:none}" +
    ".pd-list{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}.pd-list>*{min-width:0}.pd-x{min-width:0;overflow:hidden}.pd-it{display:block;background:var(--panel2);border-radius:14px;padding:11px 12px;color:var(--text);text-decoration:none}" +
    ".pd-h{display:flex;align-items:center;gap:10px}.pd-n{flex:1;min-width:0}.pd-n b{display:block;font-size:14px;line-height:1.35;word-break:keep-all;overflow-wrap:anywhere}.pd-n small{overflow-wrap:anywhere}.pd-it{overflow:hidden}.pd-n small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px;line-height:1.5}" +
    ".pd-v{text-align:right;flex:none}.pd-v b{display:block;font-size:19px;letter-spacing:-.3px}.pd-v small{display:block;color:var(--dim);font-size:12.5px}" +
    ".pd-it .rk{flex:none;width:22px;height:22px;border-radius:7px;background:var(--panel);color:var(--sub);font-size:12.5px;font-weight:800;display:inline-flex;align-items:center;justify-content:center}" +
    ".pd-bar{height:5px;border-radius:3px;background:var(--panel);margin:8px 0 6px;overflow:hidden}.pd-bar i{display:block;height:100%;background:var(--up);border-radius:3px}" +
    ".pd-row{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin-top:6px;line-height:1.6}.pd-row b{color:var(--text)}" +
    ".pd-rep{margin:7px 0 2px;padding:7px 9px;border-radius:10px;background:color-mix(in srgb,var(--panel) 60%,var(--bg))}.pd-rph{font-size:12.5px;font-weight:700;color:var(--text)}.pd-rph .mut{font-weight:400}.pd-rpb{display:flex;height:7px;border-radius:4px;overflow:hidden;background:color-mix(in srgb,var(--sub) 25%,transparent);margin:5px 0 4px}.pd-rpb i{display:block;height:100%}.pd-rpt{font-size:12.5px;color:var(--sub);line-height:1.55}.pd-rpt b{color:var(--text)}.pd-rpt b.dn,.pd-rpm b.dn{color:var(--dn)}.pd-rpm{display:block;margin-top:3px;font-size:12.5px;color:var(--sub);line-height:1.35}.pd-rpm>span,.pd-rpm>b{display:block;word-break:keep-all;overflow-wrap:anywhere}.pd-ec td{vertical-align:top}.pd-rcmp{font-size:12.5px;color:var(--sub);line-height:1.5;margin:2px 0 8px}.pd-rcmp b{color:var(--text)}" +
    ".pd-e .chip2{margin:4px 4px 0 0}.pd-nt{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none;font-size:13px;line-height:1.45}.pd-nt .mut{flex:none;width:78px}" +
    ".pd-sort{display:flex;align-items:center;gap:8px;margin:-2px 0 10px}.pd-sort>.mut{flex:none;font-size:12.5px}.pd-sort .seg2{flex:1;margin:0}.pd-sort .seg2 button{font-size:12.5px;padding:6px 4px}" +
    ".pd-live{border:1px solid rgba(25,158,112,.35);border-radius:14px;padding:10px 10px 2px;margin:0 0 12px;background:linear-gradient(160deg,rgba(25,158,112,.08),transparent 70%)}.pd-lh{display:flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;margin:0 2px 8px}.pd-lh .mut{font-weight:400;font-size:12.5px}" +
    ".pd-dot{width:8px;height:8px;border-radius:50%;background:#19c37d;box-shadow:0 0 0 0 rgba(25,195,125,.6);animation:pdpulse 1.8s infinite}@keyframes pdpulse{0%{box-shadow:0 0 0 0 rgba(25,195,125,.55)}70%{box-shadow:0 0 0 7px rgba(25,195,125,0)}100%{box-shadow:0 0 0 0 rgba(25,195,125,0)}}" +
    ".pd-brl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px}.pd-brl div{background:var(--panel2);border-radius:12px;padding:10px 12px}.pd-brl small{display:block;color:var(--sub);font-size:12.5px}.pd-brl b{font-size:18px}.pd-brl em{display:block;font-style:normal;font-size:12.5px;color:var(--dim)}" +
    "#pdper{margin-top:-4px}.pd-doc p{margin:0;font-size:13.5px;line-height:1.7;color:var(--text);word-break:keep-all}.pd-doc summary{font-weight:700}" +
    ".pd-tap{cursor:pointer}.pd-tap.on{background:color-mix(in srgb,var(--c) 10%,var(--panel2));outline:1px solid color-mix(in srgb,var(--c) 40%,transparent)}.pd-x{margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".pd-x p{margin:0 0 6px;font-size:13px;line-height:1.65;color:var(--text);word-break:keep-all}.pd-x .note{color:var(--sub);font-size:12.5px}.pd-x .sub2{margin:10px 0 6px}" +
    ".pd-amt{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:0 0 8px}.pd-amt button{border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px}.pd-amt button.on{color:var(--text);border-color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent)}" +
    ".pd-tb{width:100%;border-collapse:collapse;font-size:12.5px}.pd-tb td{padding:5px 0;border-bottom:1px solid var(--line);vertical-align:top}.pd-tb td:first-child{color:var(--sub);padding-right:8px;width:50%}.pd-tb td:last-child{text-align:right;font-weight:600}.pd-tb td.up{color:var(--up)}.pd-tb td.dn{color:var(--down)}" +
    ".pd-cfw{max-height:360px;overflow:auto;border:1px solid var(--line);border-radius:10px;margin:0 0 6px}.pd-cf{width:100%;border-collapse:collapse;font-size:12.5px;table-layout:fixed}.pd-cf th:nth-child(1),.pd-cf td:nth-child(1){width:25%}.pd-cf th:nth-child(3),.pd-cf td:nth-child(3){width:31%}.pd-cf th{position:sticky;top:0;background:var(--panel);color:var(--sub);font-weight:600;padding:6px 5px;text-align:right;white-space:nowrap}.pd-cf th:nth-child(-n+2){text-align:left}" +
    ".pd-cf td{padding:6px 5px;border-top:1px solid var(--line);text-align:right;vertical-align:top}.pd-cf td:nth-child(1){text-align:left;color:var(--sub);font-size:12.5px;word-break:break-all}.pd-cf td:nth-child(2){text-align:left;word-break:keep-all}.pd-cf td:nth-child(3){white-space:nowrap}.pd-cf .mut{font-size:12.5px}.pd-cf td.dn{color:var(--down)}.pd-cf tr.sum td{background:var(--panel);font-weight:700}" +
    ".pd-stack{display:flex;height:12px;border-radius:6px;overflow:hidden;gap:2px;margin:4px 0 6px}.pd-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin-bottom:8px}.pd-leg i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px}" +
    ".pd-hl div{display:grid;grid-template-columns:minmax(0,1fr) 56px 44px;gap:8px;align-items:center;font-size:12.5px;padding:4px 0;border-bottom:1px solid var(--line)}.pd-hl .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pd-hl em{font-style:normal;color:var(--dim);font-size:12.5px}.pd-hl b{text-align:right}" +
    ".pd-grp{border-top:1px solid var(--line);padding:6px 0}.pd-grp>summary{cursor:pointer;padding:6px 2px;font-size:14px}.pd-grp>.pd-list{margin:4px 0 6px}.seg2.wrap{flex-wrap:wrap;overflow:visible}.pd-pw{display:flex;gap:8px}.pd-pw button{flex:none;border:0;border-radius:12px;padding:0 16px;background:var(--c);color:#fff;font:inherit;font-weight:700}.pd-close{display:block;width:100%;margin:10px 0 0;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--sub);font:inherit;font-size:13px}.pd-lv{color:var(--c);font-weight:600}.pd-ec{width:100%;border-collapse:collapse;font-size:12.5px;table-layout:fixed;margin:0 0 6px}.pd-ec th{color:var(--sub);font-weight:600;text-align:left;padding:5px 4px;border-bottom:1px solid var(--line)}.pd-ec td{padding:6px 4px;border-bottom:1px solid var(--line);vertical-align:top;word-break:keep-all;overflow-wrap:anywhere}.pd-ec .mut{font-size:12.5px}.pd-ec tr.me td{background:rgba(245,158,11,.12)}.pd-ecm{padding:4px 0 8px;border-bottom:1px dashed var(--line);margin-bottom:8px}.pd-es{color:#c98500;font-weight:600}.pd-lvp{font-size:12.5px!important;color:var(--sub)!important;margin:0 0 8px!important}.pd-pvl div{display:grid;grid-template-columns:minmax(0,1fr) 54px 58px;gap:2px 8px;align-items:baseline;font-size:12.5px;padding:5px 0;border-bottom:1px solid var(--line)}.pd-pvl .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pd-pvl em{font-style:normal;font-size:12.5px;color:var(--dim)}.pd-pvl b{text-align:right}.pd-pvl small{text-align:right;font-size:12.5px}.pd-pvl .d{grid-column:1/-1;font-size:12.5px;margin-top:-2px}.pd-pvl .xbar{grid-column:1/-1;height:4px;display:block;width:100%}.pd-pvl .hd{font-size:12.5px;color:var(--dim);padding:2px 0}.pd-pvl .hd b{font-weight:500}.pd-bm{font-size:12.5px;color:var(--sub);margin:4px 0 0;line-height:1.7}.pd-err{color:var(--down);font-size:13px;font-weight:600;margin:8px 2px 0}.pd-q{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:9px 12px;font:inherit;font-size:14px;margin:0 0 10px}";
  document.head.appendChild(css);
})();
;
__bk(9);
/* ======== els_design.js ======== */
/* 🎛 ELS 내 맘대로 설계기 — 10/20 A10/20-1 (사용자 「1,2 둘 다 실행」)
   🛍 상품 → 🎯 ELS → 「🎛 설계」: 기초자산(최대 3개)·첫/마지막 상환 조건·낙인(KI)·만기를 손가락으로 바꾸면
   「2006년부터 매 거래일 가입했다면」 결과가 휴대폰에서 바로 다시 계산됨(els_replay.py replay() 와 같은 규칙을 JS 로).
   자료: archive/x/els_px/index.json + <코드>.json (els_replay.py 가 7일마다 · 기초자산 종가 일봉)
   맨 아래: 지금 청약 중인 상품(미래에셋 + DART 전 증권사) 중 이 조건에 가장 가까운 것 3개(조건·연 수익률·과거 재생).
   원칙: 과거 계산 · 미래 보장 아님 · 사라는 말 없음 · 연 수익률(쿠폰)은 시장이 정하므로 설계기는 숫자를 지어내지 않고 비슷한 실제 상품의 값만 보여 줌. */
(function(){
  var PX = {}, IDX = null, IDXW = null, ALL = null, ALLW = null;
  var ST = {ua: ["KOSPI200", "S&P500", "EUROSTOXX50"], f: 85, l: 70, ki: 45, mat: 3, cyc: 6, prev: null, last: null, ms: 0};
  try { var sv = JSON.parse(localStorage.getItem("elsdz") || "null"); if (sv && sv.ua) ["ua", "f", "l", "ki", "mat"].forEach(function(k){ if (sv[k] !== undefined) ST[k] = sv[k]; }); } catch(x) {}
  function keep(){ try { localStorage.setItem("elsdz", JSON.stringify({ua: ST.ua, f: ST.f, l: ST.l, ki: ST.ki, mat: ST.mat})); } catch(x) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var GRP = [["지수", ["KOSPI200", "S&P500", "EUROSTOXX50", "NIKKEI225", "HSCEI", "NASDAQ100"]], ["🇰🇷 종목", ["삼성전자", "SK하이닉스", "현대차", "한국전력"]], ["🇺🇸 종목", ["테슬라", "엔비디아", "팔란티어", "마이크론", "인텔", "AMD", "애플", "브로드컴"]]];
  var LAB = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LAB[n] || n; }
  var B5 = function(){ return Math.floor(Date.now() / 3600e3); };

  function idx(){ if (!IDXW) IDXW = getJSON("archive/x/els_px/index.json?" + B5(), {ttl: 3600e3}).then(function(j){ IDX = j && j.assets ? j : {assets: {}}; return IDX; }).catch(function(){ IDX = {assets: {}, err: 1}; return IDX; }); return IDXW; }
  function px(n){
    if (PX[n]) return PX[n];
    var a = IDX && IDX.assets[n]; if (!a) return Promise.resolve(null);
    PX[n] = getJSON("archive/x/els_px/" + a.f + "?" + (IDX.updated || "").replace(/\D/g, ""), {ttl: 864e5}).then(function(j){
      if (!j || !j.dd) return null;
      var t0 = Date.parse(j.d0 + "T00:00:00Z") / 864e5, d = new Int32Array(j.dd.length), c = new Float64Array(j.c.length), t = t0;
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d[i] = t; c[i] = j.c[i]; }
      return {d: d, c: c};
    }).catch(function(){ return null; });
    return PX[n];
  }
  function all(){ if (!ALLW) ALLW = getJSON("archive/x/els_all.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ ALL = j || {items: []}; return ALL; }).catch(function(){ ALL = {items: []}; return ALL; }); return ALLW; }

  /* ── 재생(els_replay.py replay 와 같은 규칙) ── */
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function addM(t, m){ var x = new Date(t * 864e5), y = x.getUTCFullYear(), mo = x.getUTCMonth() + m, dd = x.getUTCDate();
    var ny = y + Math.floor(mo / 12), nm = ((mo % 12) + 12) % 12, last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
    return Date.UTC(ny, nm, Math.min(dd, last)) / 864e5; }
  function lb(a, v){ var lo = 0, hi = a.length; while (lo < hi){ var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
  function sparse(arr){ var n = arr.length, K = [arr], k = 1; while ((1 << k) <= n){ var p = K[k - 1], q = new Float64Array(n - (1 << k) + 1), h = 1 << (k - 1); for (var i = 0; i < q.length; i++) q[i] = p[i] < p[i + h] ? p[i] : p[i + h]; K.push(q); k++; } return K; }
  function rmin(K, a, b){ var k = 31 - Math.clz32(b - a + 1), p = K[k]; var x = p[a], y = p[b - (1 << k) + 1]; return x < y ? x : y; }
  function bars(){ var n = Math.round(ST.mat * 12 / ST.cyc), h = Math.ceil(n / 2), out = [];
    for (var i = 0; i < n; i++) out.push(i < h ? ST.f : Math.round((ST.f - (ST.f - ST.l) * (i - h + 1) / (n - h)) / 5) * 5);
    return out; }
  function replay(series, names, br, cyc, ki, raw){
    // 공통 거래일
    var base = series[0], m = series.length, D = [], C = names.map(function(){ return []; });
    var ptr = series.map(function(){ return 0; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true, vals = [base.c[i]];
      for (var a = 1; a < m; a++){ var s = series[a]; while (ptr[a] < s.d.length && s.d[ptr[a]] < t) ptr[a]++; if (ptr[a] >= s.d.length || s.d[ptr[a]] !== t){ ok = false; break; } vals.push(s.c[ptr[a]]); }
      if (!ok) continue;
      D.push(t); for (var a2 = 0; a2 < m; a2++) C[a2].push(vals[a2]);
    }
    var T = D.length, n = br.length; if (T < 500) return null;
    var Cf = C.map(function(x){ return Float64Array.from(x); }), K = Cf.map(sparse), last = D[T - 1];
    var S = []; for (var s0 = 0; s0 < T; s0++){ if (addM(D[s0], cyc * n) <= last) S.push(s0); else break; }
    if (S.length < 200) return null;
    var Ns = S.length, done = new Int8Array(Ns).fill(-1), endPos = new Int32Array(Ns), lastRatio = new Float64Array(Ns), firstArg = new Int8Array(Ns).fill(-1);
    for (var j = 0; j < Ns; j++){
      var s = S[j];
      for (var k = 0; k < n; k++){
        var p = Math.min(lb(D, addM(D[s], cyc * (k + 1))), T - 1), w = Infinity, wa = 0;
        for (var a3 = 0; a3 < m; a3++){ var r = Cf[a3][p] / Cf[a3][s]; if (r < w){ w = r; wa = a3; } }
        if (k === 0 && w < br[0] / 100) firstArg[j] = wa;
        if (done[j] < 0 && w >= br[k] / 100){ done[j] = k; }
        if (k === n - 1){ endPos[j] = p; lastRatio[j] = w; }
        if (done[j] >= 0 && k > 0) break;
      }
    }
    var kiT = 0, nFail = 0, nLoss = 0, lossSum = 0, lossMin = 0, yrs = {}, cum = [], kiFlag = new Uint8Array(Ns);
    for (var j2 = 0; j2 < Ns; j2++){
      if (done[j2] >= 0) continue;
      nFail++;
      var s2 = S[j2], e2 = endPos[j2], touched = false;
      if (ki != null){ for (var a4 = 0; a4 < m; a4++){ if (rmin(K[a4], s2, e2) / Cf[a4][s2] < ki / 100){ touched = true; break; } } }
      if (touched){ kiT++; kiFlag[j2] = 1; }
      var lossy = ki != null ? touched : true;
      if (lossy){ nLoss++; var lr = (lastRatio[j2] - 1) * 100; lossSum += lr; if (lr < lossMin) lossMin = lr; var y = day2s(D[s2]).slice(0, 4); yrs[y] = (yrs[y] || 0) + 1; }
    }
    for (var k2 = 0; k2 < n; k2++){ var c = 0; for (var j3 = 0; j3 < Ns; j3++) if (done[j3] >= 0 && done[j3] <= k2) c++; cum.push(Math.round(c / Ns * 1000) / 10); }
    var out = {n: Ns, from: day2s(D[S[0]]).slice(0, 7), to: day2s(D[S[Ns - 1]]).slice(0, 7), k: cum, cyc: cyc,
      mat_ok: Math.round((nFail - nLoss) / Ns * 1000) / 10, loss: Math.round(nLoss / Ns * 1000) / 10,
      loss_avg: nLoss ? Math.round(lossSum / nLoss * 10) / 10 : null, loss_worst: nLoss ? Math.round(lossMin * 10) / 10 : null,
      loss_yrs: Object.keys(yrs).sort(function(a, b){ return yrs[b] - yrs[a]; }).slice(0, 4)};
    if (ki != null) out.ki_touch = Math.round(kiT / Ns * 1000) / 10;
    if (raw) out.raw = {done: done, last: lastRatio, ki: kiFlag, hasKi: ki != null};   // ⚖️ 10/21 A10/21-3 세 갈래 길: 가입일마다 결과
    if (m > 1){ var f1 = 0, cnt = names.map(function(){ return 0; }); for (var j4 = 0; j4 < Ns; j4++) if (firstArg[j4] >= 0){ f1++; cnt[firstArg[j4]]++; }
      if (f1){ out.worst = {}; names.forEach(function(nm, i){ if (cnt[i]) out.worst[lab(nm)] = Math.round(cnt[i] / f1 * 100); }); } }
    return out;
  }

  /* ── 가까운 실제 상품 ── */
  function parseKey(key){ var p = String(key).split("|"); return {ua: p[0].split("+"), bars: p[1].split("-").map(Number), cyc: +p[2], ki: p[3] === "none" ? null : +p[3], pp: p[4] === "pp"}; }
  function near(){
    var API = window.__elsApi; if (!API) return [];
    var R = API.rep(), D = API.D(); if (!R || !R.by_id) return [];
    var today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), C = [];
    (D && D.els || []).forEach(function(x){ var k = R.by_id[x.isin]; if (k && (x.pp || 0) < 100) C.push({key: k, n: x.n, iss: "미래에셋증권", cpn: x.cpn, e: x.e, me: 1}); });
    (ALL && ALL.items || []).forEach(function(x){ var k = R.by_id[x.id]; if (k && x.cpn != null && (x.e || "9999") >= today && x.kind !== "ELB" && !x.nolos && !/미래에셋/.test(x.iss || "")) C.push({key: k, n: x.nm, iss: (x.iss || "").replace(/주식회사|\(주\)/g, "").trim(), cpn: x.cpn, e: x.e}); });
    var my = bars(), mine = ST.ua.slice().sort();
    C.forEach(function(c){ var q = parseKey(c.key); if (q.pp){ c.d = 1e9; return; }
      var inter = q.ua.filter(function(u){ return mine.indexOf(u) >= 0; }).length, sym = q.ua.length + mine.length - 2 * inter;
      c.q = q; c.d = sym * 15 + Math.abs(q.bars[0] - my[0]) + Math.abs(q.bars[q.bars.length - 1] - my[my.length - 1]) + Math.abs((q.ki || 0) - (ST.ki || 0)) * 0.6 + Math.abs(q.bars.length * q.cyc - ST.mat * 12) / 3 + Math.abs(q.cyc - ST.cyc); });
    C.sort(function(a, b){ return a.d - b.d || (b.cpn || 0) - (a.cpn || 0); });
    var seen = {}; return C.filter(function(c){ if (c.d >= 1e9 || seen[c.key + c.iss]) return false; seen[c.key + c.iss] = 1; return true; }).slice(0, 3);
  }

  /* ── 화면 ── */
  function seg(id, items, on){ return '<div class="seg2 dz-seg" data-dz="' + id + '">' + items.map(function(x){ return '<button' + (String(x[0]) === String(on) ? ' class="on"' : '') + ' data-v="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>'; }
  function head(){
    var A = IDX.assets || {};
    var chips = GRP.map(function(g){ return '<div class="dz-g"><span class="mut">' + g[0] + '</span>' + g[1].filter(function(n){ return A[n]; }).map(function(n){ var on = ST.ua.indexOf(n) >= 0, y = (A[n].from || "").slice(0, 4);
      return '<button class="dz-ua' + (on ? " on" : "") + '" data-ua="' + e(n) + '">' + e(lab(n)) + (y > "2007" ? '<small>' + y + '~</small>' : '') + '</button>'; }).join("") + '</div>'; }).join("");
    var b = bars();
    return '<div class="dz-sec"><div class="dz-t">① 기초자산 <span class="mut">최대 3개 · 여럿이면 가장 못한 것 기준</span></div>' + chips + '</div>' +
      '<div class="dz-sec"><div class="dz-t">② 상환 조건 <span class="mut">6개월마다 처음 값의 몇 % 위면 끝나나</span></div>' +
        '<label class="dz-sl"><span>첫 상환 <b id="dzfv">' + ST.f + '%</b></span><input type="range" id="dzf" min="70" max="100" step="5" value="' + ST.f + '"></label>' +
        '<label class="dz-sl"><span>마지막 <b id="dzlv">' + ST.l + '%</b></span><input type="range" id="dzl" min="50" max="100" step="5" value="' + ST.l + '"></label>' +
        '<div class="dz-lad" id="dzlad">' + ladder(b) + '</div></div>' +
      '<div class="dz-sec"><div class="dz-t">③ 낙인(KI) <span class="mut">중간에 한 번이라도 이 아래로 가면 만기 손실</span></div>' + seg("ki", [["", "없음"], [50, "50"], [45, "45"], [40, "40"], [35, "35"], [30, "30"]], ST.ki == null ? "" : ST.ki) + '</div>' +
      '<div class="dz-sec"><div class="dz-t">④ 만기</div>' + seg("mat", [[1, "1년"], [2, "2년"], [3, "3년"]], ST.mat) + '</div>';
  }
  function ladder(b){ return '조건 <b>' + b.join("-") + '</b>' + (ST.ki != null ? ' · KI <b>' + ST.ki + '</b>' : ' · 노낙인') + ' · ' + ST.mat + '년 · 6개월마다'; }
  function delta(cur, prev){
    if (!cur || !prev) return "";
    var d1 = cur.k[0] - prev.k[0], dl = (cur.loss || 0) - (prev.loss || 0);
    var f = function(v, good){ if (Math.abs(v) < 0.5) return '<span class="mut">그대로</span>'; var g = good ? v > 0 : v < 0; return '<b class="' + (g ? "dz-good" : "dz-bad") + '">' + (v > 0 ? "+" : "−") + Math.abs(v).toFixed(0) + '%p</b>'; };
    return '<div class="dz-dl">방금 바꾸기 전보다 · 첫 상환 ' + f(d1, true) + ' · 손실로 끝 ' + f(dl, false) + '</div>';
  }
  function big(st){
    if (!st) return "";
    var loss = st.loss || 0, first = st.k[0];
    return '<div class="dz-big"><div><small>6개월 만에 끝</small><b>' + first.toFixed(0) + '%</b></div><div><small>결국 상환</small><b>' + st.k[st.k.length - 1].toFixed(0) + '%</b></div><div><small>손실로 끝</small><b class="' + (loss >= 1 ? "dn" : "") + '">' + (loss < 0.5 && st.loss_avg != null ? "1% 미만" : loss.toFixed(0) + "%") + '</b></div></div>';
  }
  function result(){
    var API = window.__elsApi;
    if (!ST.ua.length) return '<div class="empty">기초자산을 하나 이상 골라 주세요.</div>';
    if (!ST.last) return '<div class="loading">20년 치 재생 계산 중…</div>';
    if (ST.last.err) return '<div class="empty">' + e(ST.last.err) + '</div>';
    var st = ST.last.st;
    return big(st) + delta(st, ST.prev) + (API ? API.repBand(st, true) : "") + '<p class="note dz-ms">휴대폰에서 ' + st.n.toLocaleString() + '번 가입을 ' + (ST.ms < 1000 ? ST.ms.toFixed(0) + "ms" : (ST.ms / 1000).toFixed(1) + "초") + ' 만에 다시 셈 · 연 수익률(쿠폰)은 시장이 정해서 여기서 지어내지 않아요 — 아래 비슷한 실제 상품의 값을 보세요.</p>';
  }
  function nearHtml(){
    var API = window.__elsApi; if (!API) return "";
    if (!API.rep() || !ALL) return '<div class="loading">청약 중 상품과 견주는 중…</div>';
    var L = near(); if (!L.length) return '<p class="note">지금 청약 중인 상품 중 과거 재생이 된 비슷한 상품이 없어요.</p>';
    return L.map(function(c){ var q = c.q, st = (API.rep().stats || {})[c.key];
      var dd = c.e ? Math.round((new Date(c.e + "T23:59:59+09:00") - Date.now()) / 864e5) : null;
      return '<div class="dz-nr' + (c.me ? " me" : "") + '"><div class="dz-nh"><b>' + e(c.iss) + '</b><b class="up">연 ' + (+c.cpn).toFixed(2) + '%</b></div>' +
        '<div class="dz-nb">' + e(q.ua.map(lab).join(" · ")) + ' · ' + e(q.bars.join("-")) + (q.ki ? ' · KI ' + q.ki : ' · 노낙인') + ' · ' + (q.cyc === 12 ? '1년' : q.cyc + '개월') + '마다' + (dd != null ? ' · 청약 ' + (dd <= 0 ? '오늘 마감' : 'D-' + dd) : '') + '</div>' +
        (st ? API.repMini(st) : '') + '</div>'; }).join("");
  }
  function draw(box){
    if (!box) return;
    if (!IDX){ box.innerHTML = '<div class="loading">기초자산 일봉 불러오는 중…</div>'; idx().then(function(){ draw(document.getElementById("elsdz")); }); return; }
    if (!Object.keys(IDX.assets || {}).length){ box.innerHTML = '<section class="card"><h3>🎛 ELS 내 맘대로 설계기</h3><div class="empty">기초자산 일봉 자료 준비 중 — 상품 작업이 한 번 돈 뒤 채워져요.</div></section>'; return; }
    ST.ua = ST.ua.filter(function(n){ return IDX.assets[n]; });
    box.innerHTML = '<section class="card dz" data-xc="1"><h3>🎛 ELS 내 맘대로 설계기</h3><p class="dz-sub">조건을 바꾸면 2006년부터 매 거래일 가입한 셈으로 휴대폰에서 바로 다시 계산해요.</p>' + head() +
      '<div class="dz-res" id="dzres">' + result() + '</div></section>' +
      '<section class="card" data-xc="1"><h3>🎯 지금 청약 중 · 이 조건과 가장 가까운 상품 <span class="mut">미래에셋 + 전 증권사(DART)</span></h3><div id="dznear">' + nearHtml() + '</div>' +
      '<p class="note" style="margin:6px 0 0">기초자산이 같을수록, 첫·마지막 상환 조건과 KI·만기가 가까울수록 위에 와요. 과거 재생은 그 상품 조건 그대로 돌린 값이에요. 비교용일 뿐 가입하라는 뜻이 아니에요.</p></section>';
    bind(box);
    if (!ST.last && ST.ua.length) calc();
    if (!ALL) all().then(function(){ var n = document.getElementById("dznear"); if (n) n.innerHTML = nearHtml(); });
  }
  var RUN = 0;
  function calc(){
    var my = ++RUN, names = ST.ua.slice();
    if (!names.length){ ST.last = null; paint(); return; }
    Promise.all(names.map(px)).then(function(ss){
      if (my !== RUN) return;
      if (ss.some(function(x){ return !x; })){ ST.last = {err: "일봉을 못 받은 기초자산이 있어요. 잠시 뒤 다시 열어 주세요."}; paint(); return; }
      var t0 = performance.now(), st = null;
      try { st = replay(ss, names, bars(), ST.cyc, ST.ki); } catch(x) { st = null; }
      ST.ms = performance.now() - t0;
      if (ST.last && ST.last.st) ST.prev = ST.last.st;
      ST.last = st ? {st: st} : {err: "같이 거래된 날이 너무 적어 재생할 수 없어요(상장이 늦은 종목끼리일 때)."};
      paint();
    });
  }
  function paint(){
    if (window.__tw3) try { __tw3(); } catch(x) {}   // ⚖️ 세 갈래 길도 같이
    var r = document.getElementById("dzres"); if (r) r.innerHTML = result();
    var n = document.getElementById("dznear"); if (n) n.innerHTML = nearHtml();
    var l = document.getElementById("dzlad"); if (l) l.innerHTML = ladder(bars());
  }
  function bind(box){
    [].forEach.call(box.querySelectorAll("[data-ua]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var n = b.getAttribute("data-ua"), i = ST.ua.indexOf(n);
      if (i >= 0) ST.ua.splice(i, 1); else { if (ST.ua.length >= 3) ST.ua.shift(); ST.ua.push(n); }
      [].forEach.call(box.querySelectorAll("[data-ua]"), function(x){ x.classList.toggle("on", ST.ua.indexOf(x.getAttribute("data-ua")) >= 0); });
      keep(); calc(); }; });
    [].forEach.call(box.querySelectorAll("[data-dz]"), function(g){ [].forEach.call(g.children, function(b){ b.onclick = function(ev){ ev.stopPropagation();
      [].forEach.call(g.children, function(x){ x.classList.toggle("on", x === b); });
      var k = g.getAttribute("data-dz"), v = b.getAttribute("data-v");
      if (k === "ki") ST.ki = v === "" ? null : +v; else ST.mat = +v;
      keep(); paint(); calc(); }; }); });
    var f = document.getElementById("dzf"), l = document.getElementById("dzl");
    var sync = function(){ ST.f = +f.value; if (+l.value > ST.f){ l.value = ST.f; } ST.l = +l.value;
      document.getElementById("dzfv").textContent = ST.f + "%"; document.getElementById("dzlv").textContent = ST.l + "%"; var ld = document.getElementById("dzlad"); if (ld) ld.innerHTML = ladder(bars()); };
    [f, l].forEach(function(x){ if (!x) return; x.oninput = sync; x.onchange = function(){ sync(); keep(); calc(); };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
  }
  window.elsDesign = function(box){ draw(box); };
  // ⚖️ 10/21 A10/21-3 세 갈래 길(threeway.js)이 같은 조건·같은 엔진을 씀
  window.__elsDz = {
    ready: function(){ return idx().then(function(){ return all(); }); },
    st: function(){ return ST; }, bars: bars, lab: lab, near: function(){ return near(); },
    run: function(){ var names = ST.ua.slice(); if (!names.length) return Promise.resolve(null);
      return Promise.all(names.map(px)).then(function(ss){ if (ss.some(function(x){ return !x; })) return null; try { return replay(ss, names, bars(), ST.cyc, ST.ki, true); } catch(x) { return null; } }); }
  };

  var css = document.createElement("style");
  css.textContent =
    ".dz .dz-sec{margin:10px 0 0}.dz-t{font-size:13px;font-weight:700;margin-bottom:5px}.dz-t .mut{font-weight:400;font-size:12.5px}" +
    ".dz-g{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:4px 0}.dz-g>.mut{font-size:12.5px;min-width:42px}" +
    ".dz-ua{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}.dz-ua small{margin-left:3px;font-size:12.5px;color:var(--sub)}" +
    ".dz-ua.on{background:#f4a261;color:#111;border-color:transparent;font-weight:700}.dz-ua.on small{color:#333}" +
    ".dz-sl{display:flex;align-items:center;gap:10px;margin:4px 0;font-size:13px}.dz-sl span{min-width:92px}.dz-sl input{flex:1;accent-color:#f4a261;height:28px}" +
    ".dz-lad{font-size:12.5px;color:var(--sub);margin-top:2px}.dz-lad b{color:var(--text)}" +
    ".dz-seg button{min-width:44px}" +
    ".dz-res{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".dz-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.dz-big>div{background:var(--panel2);border-radius:10px;padding:8px 6px;text-align:center}.dz-big small{display:block;font-size:12.5px;color:var(--sub)}.dz-big b{font-size:22px;font-variant-numeric:tabular-nums}.dz-big b.dn{color:#ff6b6b}" +
    ".dz-dl{font-size:12.5px;color:var(--sub);margin:6px 0 0}.dz-good{color:#3fb950}.dz-bad{color:#ff6b6b}.dz-sub{margin:-2px 0 4px;font-size:12.5px;color:var(--sub)}" +
    ".dz-ms{margin:6px 0 0;font-size:12.5px}" +
    ".dz-nr{padding:8px 0;border-top:1px solid var(--line)}.dz-nr:first-child{border-top:0}.dz-nr.me .dz-nh b:first-child:after{content:' 🟠';font-size:12.5px}.dz-nh{display:flex;justify-content:space-between;font-size:14px}.dz-nb{font-size:12.5px;color:var(--sub);margin-top:2px}";
  document.head.appendChild(css);
})();
;
__bk(10);
/* ======== extras.js ======== */
/* CH Investing — 업그레이드 묶음: 신호 성적표·차트 그림·고래 합의·매집 수급·단타 대시보드·시황 할 일/검색 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt, rich = V.rich;
  var XC = {};
  function X(name){ if (!XC[name]) XC[name] = getJSON("archive/x/" + name + "?" + (M.updated || "")).catch(function(){ XC[name] = null; return null; }); return XC[name]; }
  function card(title, body, extra){ return '<section class="card">' + (title ? '<h3>' + title + (extra || "") + '</h3>' : '') + body + '</section>'; }
  function sec(t){ return '<div class="sec">' + t + '</div>'; }
  function chip(t, c){ return '<span class="chip2 ' + (c || "") + '">' + t + '</span>'; }
  function pct(v){ return v == null ? "–" : sgn(v) + "%"; }
  function opA(code, inner, noTk){ return '<a class="xo" href="javascript:openOP(\'' + e(code).replace(/'/g, "") + '\')">' + inner + (noTk || inner.indexOf(V.cd(code)) >= 0 ? '' : ' <em class="tk">' + e(V.cd(code)) + '</em>') + '</a>'; }
  function wrap(key, top, bottom){
    var OLD = RENDER[key];
    RENDER[key] = function(it, el){
      el.innerHTML = '<div class="xa"></div><div class="xo2"></div><div class="xb"></div>';
      var a = el.querySelector(".xa"), o = el.querySelector(".xo2"), b = el.querySelector(".xb");
      OLD(it, o);
      if (top) try { top(it, a, o); } catch(err) {}
      if (bottom) try { bottom(it, b, o); } catch(err) {}
    };
  }
  function latest(cat, fname){
    var L = (M.cats[cat] || []).filter(function(x){ return x.files.indexOf(fname) >= 0; });
    return L.length ? getJSON(file(cat, L[0].id, fname)).catch(function(){ return null; }) : Promise.resolve(null);
  }
  function compassNow(){
    var L = (M.cats.sector || []).filter(function(x){ return x.files.indexOf("compass.json") >= 0; });
    return L.length ? getJSON(file("sector", L[0].id, "compass.json")).catch(function(){ return null; }) : Promise.resolve(null);
  }
  var RG = {"상승장": "▲", "하락장": "▼", "횡보장": "◆"};

  /* ---------- 성적표 (컵·갭·매집 공통) ---------- */
  function scoreboard(P, label){
    if (!P || !P.signals || !P.signals.length) return card("📊 " + label + " 성적표", '<p class="note">신호가 쌓이면 여기에 성적이 나와요. (' + (P ? P.days + "일치 기록" : "준비 중") + ')</p>');
    var A = P.stats.all, tile = function(k, nm){ var s = A[k] || {}; return '<div><small>' + nm + '</small><b class="' + cls(s.avg) + '">' + pct(s.avg) + '</b><em>승률 ' + (s.win == null ? "–" : s.win + "%") + ' · ' + (s.n || 0) + '건</em></div>'; };
    var h = '<div class="x4">' + tile("r5", "5일 뒤") + tile("r20", "20일 뒤") + tile("r60", "60일 뒤") + tile("now", "지금까지") + '</div>';
    var bs = P.stats.by_score || {}, rows = Object.keys(bs).map(function(k){ var s = bs[k][P.stats.all.r20.n >= 10 ? "r20" : "now"]; return {label: e(k) + ' <span class="mut">승률 ' + (s.win == null ? "–" : s.win + "%") + '</span>', v: s.avg || 0, text: pct(s.avg), tip: "<b>" + k + "</b> " + s.n + "건 · 평균 " + pct(s.avg) + " · 승률 " + s.win + "%"}; });
    if (rows.length) h += '<div class="sub2">점수별 평균 수익률 (' + (P.stats.all.r20.n >= 10 ? "20일 뒤" : "지금까지") + ')</div>' + V.dbars(rows, {unit: ""});
    var bm = P.stats.by_mkt || {}, mr = Object.keys(bm).map(function(k){ var s = bm[k].now; return {label: (V.FLAGS[k] || "") + " " + e(V.MKT[k] || k) + ' <span class="mut">승률 ' + (s.win == null ? "–" : s.win + "%") + '</span>', v: s.avg || 0, text: pct(s.avg)}; });
    if (mr.length > 1) h += '<div class="sub2">나라별 (지금까지)</div>' + V.dbars(mr, {unit: ""});
    if (P.brk) h += '<p class="note">신호 뒤 실제로 매수 기준가(피벗)를 넘은 비율 <b>' + P.brk.rate + '%</b> (' + P.brk.n + '건)</p>';
    h += '<div class="sub2">최근 신호 ' + Math.min(15, P.signals.length) + '개</div><div class="xt">' + P.signals.slice(0, 15).map(function(s){
      return '<div class="xr">' + opA(s.code, (V.FLAGS[s.mkt] || "") + ' <b>' + e(s.name.length > 16 ? s.name.slice(0, 15) + "…" : s.name) + '</b>') +
        '<span class="mut">' + s.d0.slice(5).replace("-", "/") + '</span><b class="' + cls(s.now) + '">' + pct(s.now) + '</b><span class="mut">최고 ' + pct(s.maxup) + '</span>' +
        (s.filled != null ? (s.filled ? chip("메움", "cool") : chip("유지", "")) : s.brk != null ? (s.brk ? chip("돌파", "hot") : "") : "") + '</div>';
    }).join("") + '</div>';
    h += '<p class="note">' + P.first + '부터 ' + P.days + '일치 기록' + (P.eye_only ? ' · <b>👁 눈 검사 통과 종목만</b>(자동 선별분은 뺌)' : '') + ' · 신호 = 목록에 처음 나온 날 종가로 샀다고 가정 · 수수료 제외</p>';
    return card("📊 " + label + " 성적표 <span class='mut'>신호 " + P.signals.length + "개</span>", h);
  }
  function sectorPerf(P){
    if (!P || !P.signals) return "";
    var by = {};
    P.signals.forEach(function(s){ var k = s.sector && s.sector !== "미분류" && s.sector !== "-" ? s.sector : null; if (!k) return; (by[k] = by[k] || []).push(s.now); });
    var rows = Object.keys(by).filter(function(k){ return by[k].length >= 2; }).map(function(k){ var v = by[k], a = v.reduce(function(x, y){ return x + y; }, 0) / v.length;
      return {label: e(k) + ' <span class="mut">' + v.length + '</span>', v: a, tip: "<b>" + k + "</b> 신호 " + v.length + "개 · 지금까지 평균 " + pct(a)}; })
      .sort(function(a, b){ return b.v - a.v; }).slice(0, 10);
    return rows.length ? card("🧩 섹터별 신호 수 · 성적 <span class='mut'>숫자 = 신호 수</span>", V.dbars(rows)) : "";
  }

  /* ---------- 컵 그림: 컵·손잡이·돌파선 ---------- */
  function cupSvg(vals, c){
    var W = 320, H = 120, P = 6, n = vals.length;
    var piv = c.pivot, bot = piv && c.depth != null ? piv * (1 - c.depth / 100) : null, hnd = piv && c.handle != null ? piv * (1 - c.handle / 100) : null;
    var ext = vals.concat([piv, bot].filter(function(x){ return x; }));
    var lo = Math.min.apply(null, ext), hi = Math.max.apply(null, ext), r = (hi - lo) || 1; lo -= r * .08; hi += r * .08; r = hi - lo;
    var x = function(i){ return P + i * (W - P * 2) / (n - 1); }, y = function(v){ return P + (hi - v) / r * (H - P * 2); };
    var wk = Math.min(n - 1, Math.round(c.weeks || 0)), x0 = x(n - 1 - wk), hw = Math.min(5, Math.max(2, Math.round(wk / 6)));
    var s = '<svg class="cupsv" viewBox="0 0 ' + W + ' ' + H + '">';
    if (wk > 2) s += '<rect x="' + x0.toFixed(1) + '" y="0" width="' + (x(n - 1) - x0).toFixed(1) + '" height="' + H + '" fill="rgba(255,184,77,.10)" rx="6"/>';
    if (hnd) s += '<rect x="' + x(n - 1 - hw).toFixed(1) + '" y="' + y(piv).toFixed(1) + '" width="' + (x(n - 1) - x(n - 1 - hw)).toFixed(1) + '" height="' + Math.max(2, y(hnd) - y(piv)).toFixed(1) + '" fill="rgba(144,133,233,.35)" rx="3"/>';
    if (bot) s += '<line x1="' + x0.toFixed(1) + '" x2="' + x(n - 1) + '" y1="' + y(bot).toFixed(1) + '" y2="' + y(bot).toFixed(1) + '" stroke="#ffb84d" stroke-opacity=".7" stroke-dasharray="2 3"/>';
    var line = vals.map(function(v, i){ return x(i).toFixed(1) + "," + y(v).toFixed(1); }).join(" ");
    s += '<polyline points="' + line + '" fill="none" stroke="#e8ecf4" stroke-width="1.8" stroke-linejoin="round"/>';
    if (piv) s += '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + y(piv).toFixed(1) + '" y2="' + y(piv).toFixed(1) + '" stroke="' + V.UP + '" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<text x="' + (P + 2) + '" y="' + (y(piv) - 4).toFixed(1) + '" class="cupl up">돌파선 ' + fmt(piv) + '</text>';
    var last = vals[n - 1];
    s += '<circle cx="' + x(n - 1).toFixed(1) + '" cy="' + y(last).toFixed(1) + '" r="4" fill="' + (piv && last >= piv ? V.UP : "#ffb84d") + '" stroke="#121826" stroke-width="2"/></svg>';
    return s;
  }
  function upgradeCups(root, byCode){
    var go = function(){
      [].forEach.call(root.querySelectorAll(".cc .sp-box[data-spark]:not([data-cup])"), function(b){
        var c = byCode[b.getAttribute("data-spark")]; if (!c) return;
        b.setAttribute("data-cup", "1");
        V.price(c.code).then(function(p){
          if (!p || !p[6] || p[6].length < 8) return;
          var vals = p[6].slice(); vals[vals.length - 1] = p[1];
          var dtxt = c.dist == null ? "–" : c.dist >= 0 ? "돌파선 위 +" + c.dist.toFixed(1) + "%" : "돌파선까지 +" + (-c.dist).toFixed(1) + "%";
          b.innerHTML = cupSvg(vals, c) + '<div class="cupk"><span><i class="k1"></i>컵 ' + Math.round(c.weeks || 0) + '주</span><span><i class="k2"></i>바닥 −' + (c.depth || 0).toFixed(0) + '%</span><span><i class="k3"></i>손잡이 −' + (c.handle || 0).toFixed(0) + '%</span><span><i class="k4"></i>돌파선</span></div>' +
            '<div class="spark-cap"><span>주간 종가 1년</span><b class="' + (c.dist != null && c.dist >= 0 ? "up" : "") + '">' + dtxt + '</b><span>' + p[0].slice(5).replace("-", "/") + ' ' + fmt(p[1]) + '</span></div>';
          b.setAttribute("data-done", "1");
        });
      });
    };
    go(); new MutationObserver(go).observe(root, {childList: true, subtree: true});
  }

  /* ☕ 돌파 임박 — 지금 값 (📱 A12-3 · cup_live.py) : 오늘 리포트일 때만, 40분 안 값만 「지금」 */
  function nearLive(root, day){
    var draw = function(){
      var box = root.querySelector("#xnear"); if (!box) return;
      getJSON("archive/x/cup_live.json?" + Math.floor(Date.now() / 120000), {ttl: 120000}).then(function(L){
        if (!L || !L.items || L.day !== day) return;
        var now = Date.now(), fresh = 0, crossed = 0;
        [].forEach.call(box.querySelectorAll("[data-nc]"), function(r){
          var x = L.items[r.getAttribute("data-nc")], nd = r.querySelector(".xnd"), nl = r.querySelector(".xnl"); if (!x || !nd || !nl) return;
          var t = new Date(x.at.replace(" ", "T") + ":00+09:00").getTime(), age = (now - t) / 60000;
          var live = age < 40 && x.s !== "마감", lab = live ? (x.s === "시간외" ? "🌙 시간외 " : "🟢 지금 ") : x.s === "마감" && age < 40 ? "📕 마감값 " : "⏱ ";
          if (live) fresh++;
          var bar = r.querySelector(".xbar i"); if (bar) bar.style.width = Math.max(4, Math.min(100, 100 + x.d / 3 * 100)).toFixed(0) + "%";
          r.classList.toggle("xbrk", x.d >= 0);
          if (x.d >= 0){ crossed++; nd.textContent = "넘음 +" + x.d.toFixed(1) + "%"; nl.textContent = "🎉 " + lab.replace(/^\S+ /, "") + x.at.slice(11); }
          else { nd.textContent = sgn(-x.d) + "%"; nl.textContent = (x.x ? "🎉 " + x.x.slice(6) + " 넘었다 내려옴 · " : "") + lab + x.at.slice(11); }
          nl.className = "xnl " + (live ? "on" : "old");
        });
        var n = root.querySelector("#xnearn");
        if (n && (fresh || crossed)) n.innerHTML = (fresh ? "🟢 " + fresh + "종목 지금 값으로 다시 잼" : "📕 오늘 받은 값으로 다시 잼") + (crossed ? " · <b class='up'>🎉 " + crossed + "종목 돌파선 넘음</b>" : "") + " · 값이 없는 종목(작은 종목 등)은 「마감 기준」. 10분마다 바뀌어요.";
      });
    };
    draw();
    var iv = setInterval(function(){ if (!document.body.contains(root)) { clearInterval(iv); return; } if (!document.hidden) draw(); }, 120000);
  }

  /* ======================= ☕ 컵 ======================= */
  wrap("cup", function(it, a, o){
    if (it.files.indexOf("cards.json") < 0) return;
    Promise.all([getJSON(file("cup", it.id, "cards.json")), latest("gap", "cards.json"), compassNow()]).then(function(r){
      var d = r[0], g = r[1], C = r[2], gapSet = {};
      ((g && g.top) || []).forEach(function(x){ gapSet[x.code] = 1; });
      var reg = function(m){ return C && C.markets && C.markets[m] ? C.markets[m].regime : null; };
      var all = (d.ath || []).concat(d.top || []), by = {};
      all.forEach(function(c){ by[c.code] = c; });
      upgradeCups(o, by);
      var near = (d.top || []).filter(function(c){ return c.dist != null && c.dist >= -3 && c.dist < 0 && !c.brk; })
        .sort(function(x, y){ return (reg(y.mkt) === "상승장") - (reg(x.mkt) === "상승장") || y.dist - x.dist; });
      var dual = all.filter(function(c){ return gapSet[c.code]; });
      var h = "";
      if (C && C.markets) h += '<div class="xreg">' + ["US", "KR", "JP", "CN", "HK"].filter(function(k){ return C.markets[k]; }).map(function(k){ var m = C.markets[k];
        var lb = window.regDisp ? regDisp(m) : m.regime; return '<span class="xrg ' + (/반등|상승장$/.test(lb) ? "u" : /급락|하락장$/.test(lb) ? "d" : "") + '">' + m.flag + " " + (RG[lb] || (/반등/.test(lb) ? "↗" : "↘")) + " " + e(lb) + '</span>'; }).join("") + '</div>' +
        '<p class="note" style="margin:0 2px 10px">🧭 나침반 국면 — <b>상승장</b>인 시장의 신호를 먼저, ★로 표시해요.</p>';
      // 📱 A12-1·A12-3 (10/15): 한글 짧은 이름 · 장중·시간외엔 지금 값으로 돌파선 거리 다시 (archive/x/cup_live.json, 10분마다)
      if (near.length) h += card("🎯 돌파 임박 <span class='mut'>돌파선까지 3% 이내</span>", '<div class="xt" id="xnear">' + near.slice(0, 12).map(function(c){
        var hot = reg(c.mkt) === "상승장", nm = V.nmOf ? V.nmOf(c) : c.name;
        return '<div class="xr' + (hot ? " star" : "") + '" data-nc="' + e(c.code) + '">' + opA(c.code, (hot ? "★ " : "") + (V.FLAGS[c.mkt] || "") + ' <b data-nmk="' + e(c.code) + '">' + e(nm.length > 16 ? nm.slice(0, 15) + "…" : nm) + '</b>') +
          '<span class="xbar"><i style="width:' + Math.max(4, 100 + c.dist / 3 * 100).toFixed(0) + '%"></i></span><b class="up xnd">' + sgn(-c.dist) + '%</b>' + (gapSet[c.code] ? chip("갭도", "hot") : "") +
          '<small class="xnl">마감 기준</small></div>'; }).join("") + '</div>' +
        '<p class="note" id="xnearn">막대가 꽉 찰수록 돌파선에 가까워요. 숫자는 어제 마감 기준 — 장중·시간외엔 10분마다 지금 값으로 바뀌어요. 🔔 알림 탭에서 "컵 돌파 임박"을 구독하면 휴대폰으로 받아요.</p>');
      if (dual.length) h += card("✨ 이중 신호 <span class='mut'>컵 + 갭 동시</span>", '<div class="cp-sts">' + dual.map(function(c){ return opA(c.code, '<span class="cp-st"><b>' + (V.FLAGS[c.mkt] || "") + " " + e(c.name) + '</b><em class="tk">' + e(V.cd(c.code)) + '</em><span class="up">컵·갭</span></span>'); }).join("") + '</div>');
      a.innerHTML = h;
      if (near.length) nearLive(a, it.id);
    });
  }, function(it, b){
    X("perf_cup.json").then(function(P){ b.innerHTML = scoreboard(P, "컵 신호") + sectorPerf(P); });
  });

  /* ======================= 📈 갭 ======================= */
  function gapGauge(c){
    var g = Math.min(100, (c.gap || 0) / 15 * 100), v = Math.min(100, (c.vol || 0) / 10 * 100), s = c.score || 0;
    return '<div class="ggz"><div><small>갭 크기</small><span class="xbar"><i style="width:' + g.toFixed(0) + '%;background:' + V.UP + '"></i></span><b>' + (c.gap != null ? c.gap.toFixed(1) + "%" : "–") + '</b></div>' +
      '<div><small>거래량</small><span class="xbar"><i style="width:' + v.toFixed(0) + '%;background:#c98500"></i></span><b>' + (c.vol != null ? c.vol.toFixed(1) + "배" : "–") + '</b></div>' +
      '<div><small>강도 점수</small><span class="xbar"><i style="width:' + Math.min(100, s).toFixed(0) + '%;background:#9085e9"></i></span><b>' + (c.score != null ? c.score.toFixed(0) : "–") + '</b></div></div>';
  }
  wrap("gap", function(it, a, o){
    Promise.all([it.files.indexOf("cards.json") >= 0 ? getJSON(file("gap", it.id, "cards.json")) : Promise.resolve(null), latest("cup", "cards.json"), X("premarket.json")]).then(function(r){
      var d = r[0], cu = r[1], pm = r[2], cupSet = {}, by = {}, h = "";
      ((cu && cu.top) || []).concat((cu && cu.ath) || []).forEach(function(x){ cupSet[x.code] = 1; });
      if (d) ((d.top) || []).forEach(function(c){ by[c.code] = c; });
      // 카드마다 강도 게이지 + 이중 신호 표시
      var go = function(){ [].forEach.call(o.querySelectorAll(".cc .sp-box[data-spark]:not([data-gg])"), function(bx){
        var c = by[bx.getAttribute("data-spark")]; if (!c) return; bx.setAttribute("data-gg", "1");
        bx.insertAdjacentHTML("afterend", gapGauge(c) + (cupSet[c.code] ? '<div class="tags">' + chip("✨ 컵 신호도", "hot") + '</div>' : ""));
      }); };
      go(); new MutationObserver(go).observe(o, {childList: true, subtree: true});
      if (pm && pm.items){
        var fresh = (pm.updated || "").slice(0, 10) === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
        h += card("🌅 미국 장 전 갭 후보 <span class='mut'>" + e(pm.et) + " (뉴욕) · 관심 " + pm.n_watch + "종목 중</span>", (pm.items.length ? '<div class="xt">' + pm.items.slice(0, 12).map(function(x){
          return '<div class="xr">' + opA(x.s, '<b>' + e(x.s) + '</b> <span class="mut">' + e((x.n || "").slice(0, 14)) + '</span>') + '<span class="mut">' + e(x.why.join("·")) + '</span><b class="' + cls(x.gap) + '">' + pct(x.gap) + '</b></div>'; }).join("") + '</div>' : '<p class="note">±2% 넘게 움직이는 종목이 없어요.</p>') +
          '<p class="note">' + (fresh ? "오늘 미국 장 시작 전 가격 기준이에요." : "지난 장 전 기록이에요. 미국 장 전(한국 밤 9~10시)에 새로 계산돼요.") + ' 관심 = 컵·갭·매집·고래·대형주 목록.</p>');
      }
      var dual = d ? (d.top || []).filter(function(c){ return cupSet[c.code]; }) : [];
      if (dual.length) h += card("✨ 이중 신호 <span class='mut'>갭 + 컵 동시</span>", '<div class="cp-sts">' + dual.map(function(c){ return opA(c.code, '<span class="cp-st"><b>' + (V.FLAGS[c.mkt] || "") + " " + e(c.name) + '</b><em class="tk">' + e(V.cd(c.code)) + '</em><span class="up">갭·컵</span></span>'); }).join("") + '</div>');
      a.innerHTML = h;
    });
  }, function(it, b){
    X("perf_gap.json").then(function(P){
      var h = "";
      if (P && P.fill && P.fill.n){
        var F = P.fill;
        h += card("🕳️ 갭 메움 추적 <span class='mut'>갭 전 박스 상단까지 되돌아왔나</span>",
          '<div class="x4"><div><small>5일 안 메움</small><b>' + (F.f5 == null ? "–" : F.f5 + "%") + '</b></div><div><small>20일 안 메움</small><b>' + (F.f20 == null ? "–" : F.f20 + "%") + '</b></div>' +
          '<div><small>지금 갭 유지</small><b class="up">' + (F.now == null ? "–" : (100 - F.now) + "%") + '</b></div><div><small>신호</small><b>' + F.n + '</b></div></div>' +
          V.dbars([{label: "갭 유지한 종목", v: F.held_ret || 0}, {label: "갭 메운 종목", v: F.fill_ret || 0}]) +
          '<p class="note">갭을 지킨 종목과 메운 종목의 지금까지 평균 수익률이에요. 차이가 크면 "갭 유지"가 중요한 신호라는 뜻.</p>');
      }
      b.innerHTML = h + scoreboard(P, "갭 신호") + sectorPerf(P);
    });
  });

  /* ======================= 🤫 조용한 매집 ======================= */
  wrap("accum", function(it, a){
    Promise.all([X("accum_x.json"), getJSON(file("accum", it.id, "list.json")).catch(function(){ return []; })]).then(function(r){
      var Xa = r[0], rows = r[1], by = {}, h = "";
      if (!Xa) return;
      rows.forEach(function(x){ by[x.code] = x; });
      var items = (Xa.items || []).filter(function(x){ return by[x.code]; });
      var brk = items.filter(function(x){ return x.brk; }), near = items.filter(function(x){ return !x.brk && x.to_brk != null && x.to_brk <= 5; }).sort(function(p, q){ return p.to_brk - q.to_brk; });
      if (brk.length || near.length) h += card("🚀 박스 돌파 <span class='mut'>최근 20일 고점 위로</span>", (brk.length ? '<div class="cp-sts">' + brk.map(function(x){ var r0 = by[x.code];
        return opA(x.code, '<span class="cp-st"><b>' + (V.FLAGS[r0.mkt] || "") + " " + e(r0.name.slice(0, 14)) + '</b><em class="tk">' + e(V.cd(x.code)) + '</em><span class="up">돌파</span></span>'); }).join("") + '</div>' : '<p class="note">오늘 돌파한 종목은 없어요.</p>') +
        (near.length ? '<div class="sub2">돌파까지 5% 이내</div><div class="xt">' + near.map(function(x){ var r0 = by[x.code];
          return '<div class="xr">' + opA(x.code, (V.FLAGS[r0.mkt] || "") + ' <b>' + e(r0.name.slice(0, 16)) + '</b>') + '<span class="xbar"><i style="width:' + Math.max(4, 100 - x.to_brk * 20).toFixed(0) + '%"></i></span><b class="up">+' + x.to_brk.toFixed(1) + '%</b></div>'; }).join("") + '</div>' : '') +
        '<p class="note">🔔 알림 탭에서 "매집 돌파"를 구독하면 돌파하는 날 휴대폰으로 받아요.</p>');
      var fl = items.filter(function(x){ return x.flow && x.flow.length; });
      if (fl.length) h += card("🇰🇷 외국인·기관 순매수 <span class='mut'>최근 5일 합계 (주)</span>", fl.map(function(x){ var r0 = by[x.code], f5 = x.flow.slice(0, 5);
        var F = f5.reduce(function(s, d){ return s + d.f; }, 0), O = f5.reduce(function(s, d){ return s + d.o; }, 0);
        var both = F > 0 && O > 0;
        return '<div class="xfl"><div class="row">' + opA(x.code, '<b>' + e(r0.name) + '</b>') + (both ? chip("둘 다 매수 ✓", "hot") : F > 0 || O > 0 ? chip("한쪽 매수", "c") : chip("둘 다 매도", "cool")) + '</div>' +
          '<div class="x2"><div><small>외국인</small><b class="' + cls(F) + '">' + (F > 0 ? "+" : "") + Math.round(F).toLocaleString() + '</b></div><div><small>기관</small><b class="' + cls(O) + '">' + (O > 0 ? "+" : "") + Math.round(O).toLocaleString() + '</b></div></div>' +
          '<div class="xfd">' + f5.slice().reverse().map(function(d){ return '<i class="' + (d.f + d.o > 0 ? "u" : "d") + '" title="' + e(d.d) + '"></i>'; }).join("") + '<span class="mut">← 날짜별 외국인+기관 (빨강 = 순매수)</span></div></div>'; }).join("") +
        '<p class="note">조용한 매집 + 외국인·기관이 같이 사면 신호가 더 믿을 만해요.</p>');
      // 달력 히트맵
      var days = Xa.days || [], cal = Xa.calendar || {}, codes = Object.keys(cal).sort(function(p, q){ return Object.keys(cal[q].days).length - Object.keys(cal[p].days).length; }).slice(0, 15);
      if (days.length && codes.length) h += card("🗓️ 매집 달력 <span class='mut'>최근 " + days.length + "일 · 진할수록 점수 높음</span>",
        '<div class="xcal"><div class="xcr"><span></span>' + days.map(function(d){ return '<em>' + (days.length <= 12 || d.slice(8) % 3 === 0 ? d.slice(8) : "") + '</em>'; }).join("") + '</div>' +
        codes.map(function(c){ var x = cal[c]; return '<div class="xcr">' + opA(c, e((x.name || c).slice(0, 8)), 1) + days.map(function(d){ var v = x.days[d];
          return '<i style="background:' + (v == null ? "#1b2232" : "rgba(213,81,145," + (0.25 + Math.min(1, (v - 50) / 50) * 0.75).toFixed(2) + ")") + '" data-tip="' + e("<b>" + (x.name || c) + "</b> " + d + (v != null ? " · 점수 " + v : " · 없음")) + '"></i>'; }).join("") + '</div>'; }).join("") + '</div>');
      if (Xa.sectors && Xa.sectors.length) h += card("🧩 매집 종목 섹터", V.hbars(Xa.sectors.slice(0, 8).map(function(s){ return {label: e(s[0]), v: s[1], text: s[1] + "개"}; }), {color: "#d55181"}));
      a.innerHTML = h;
    });
  }, function(it, b){ X("perf_accum.json").then(function(P){ b.innerHTML = scoreboard(P, "매집 신호"); }); });

  /* ======================= ⚡ 단타 ======================= */
  wrap("danta", null, function(it, b, o){
    Promise.all([X("danta_stats.json"), getJSON(file("danta", it.id, "alerts.json")).catch(function(){ return []; }),
                 fetch("https://raw.githubusercontent.com/chkchp0702-spec/stock-screener/main/data/learned.json?" + Math.floor(Date.now() / 300000)).then(function(x){ return x.ok ? x.json() : null; }).catch(function(){ return null; })]).then(function(r){
      var S = r[0], rows = r[1], LR = r[2]; if (!S) return;
      var slot = function(t){ var hh = +(t || "0").slice(0, 2); return hh <= 9 ? "09시" : hh === 10 ? "10시" : hh <= 12 ? "11~12시" : "13시 이후"; };
      // 오늘 알람에 품질 등급 붙이기
      var q = S.quality || {};
      var go = function(){ [].forEach.call(o.querySelectorAll(".list .st:not([data-q])"), function(st, i){
        st.setAttribute("data-q", "1");
        var nm = st.querySelector(".nm a"), tm = st.querySelector(".tm"), ty = st.querySelector(".chip2.c");
        if (!ty || !tm) return;
        var k = ty.textContent + "|" + slot(tm.textContent), g = q[k];
        if (g) ty.insertAdjacentHTML("afterend", '<span class="chip2 g' + g.grade + '" data-tip="' + e("<b>품질 " + g.grade + "</b><br>같은 유형·시간대 과거 " + g.n + "건<br>승률 " + g.win + "% · 가상 매매 평균 " + pct(g.pnl)) + '">품질 ' + g.grade + '</span>');
      }); };
      go(); new MutationObserver(go).observe(o, {childList: true, subtree: true});
      var A = S.all, h = "";
      // 🧪 스스로 배운 것 (stock-screener learn.py → data/learned.json · 세션 시작·장중 매시간)
      if (LR && LR.types){
        var SL = ["09시", "10시", "11~12시", "13시 이후"], ST = {"강함": ["⭐ 강함", "#4dd47a"], "켬": ["켬", "#8a94a8"], "관찰": ["👀 관찰", "#ffb84d"], "닫힘": ["닫힘", "#4a5266"]};
        var pp = LR.params || {}, G = LR.gate || {};
        // 10/11: 비용 0.45% + 다음 1분 가격(+0.2% 미끄러짐) 진입 · 20거래일·칸당 40건 문턱 (learned.json gate·slip·entry·cost)
        var costTxt = "비용 " + (LR.cost != null ? LR.cost : 0.45) + "% 뺌 · " + (LR.entry === "next_min" || !LR.entry ? "다음 1분 가격" : e(LR.entry)) + (LR.slip != null ? " +" + LR.slip + "%" : " +0.2%") + " 진입";
        var gateTxt = (G.min_days || 20) + "거래일·칸당 " + (G.min_n || 40) + "건 차야 규칙이 바뀜 (그 전엔 관찰만" + (G.days_ok === false ? " · 지금 " + (LR.n_days || 0) + "일째" : "") + ")";
        h += card("🧪 단타가 스스로 배운 것 <span class='mut'>쌓인 1분 자료 " + LR.n_days + "일 + 실제 알람 · " + e(String(LR.at || "").slice(5)) + "</span>",
          '<table class="lrn"><tr><th></th>' + SL.map(function(x){ return '<th>' + x + '</th>'; }).join("") + '</tr>' +
          Object.keys(LR.types).map(function(k){ var T = LR.types[k];
            return '<tr><td>' + e(k) + '<small>' + (T.n_all || 0) + '건 ' + pct(T.avg_all) + '</small></td>' + SL.map(function(x){ var c = T.slots[x] || {}, st = ST[c.st] || [c.st || "–", "#8a94a8"];
              return '<td data-tip="' + e("<b>" + k + " · " + x + "</b><br>" + (c.st || "") + " · " + (c.n || 0) + "건 · 평균 " + pct(c.avg) + " (" + costTxt + ")" + (c.obs ? "<br>👀 아직 문턱 전 — 관찰만(규칙 안 바뀜)" : "") + "<br>다시 돌린 것 " + ((c.replay || {}).n || 0) + " · 실제 알람 " + ((c.live || {}).n || 0)) + '"><b style="color:' + st[1] + '">' + st[0] + '</b><small>' + (c.n ? c.n + '건 ' + pct(c.avg) : '자료 없음') + '</small></td>'; }).join("") + '</tr>'; }).join("") + '</table>' +
          '<p class="note"><b>⭐ 강함</b> = 품질 A로 먼저 알림 · <b>👀 관찰</b> = 지는 쪽이라 앱 푸시 없이 기록만(추적은 계속, 좋아지면 저절로 다시 켜짐) · <b>닫힘</b> = 오후는 성적이 증명돼야 열림. ' +
          '지금 손잡이: 후발주 대장 ' + pp.fol_hold + '분 유지·' + (pp.fol_band || []).join("~") + '% · 거래폭발 ×' + pp.burst_x + ' · 청산 ' + e(pp.exit || "") + ' · 신규 알람 ' + String(pp.cutoff || 1130).replace(/(\d\d)$/, ":$1") + '까지' +
          (LR.changed && LR.changed.length ? ' · <b>바뀐 것: ' + e(LR.changed.join(", ")) + '</b>' : '') + ' · ' + gateTxt + ' · 확실히 나을 때만 손잡이를 바꿔요' + '. <span class="mut">성적은 ' + costTxt + '.</span></p>');
      }
      h += card("📊 단타 성적 대시보드 <span class='mut'>전체 " + A.n + "건</span>",
        '<div class="x4"><div><small>승률(마감)</small><b>' + A.win + '%</b></div><div><small>평균</small><b class="' + cls(A.avg) + '">' + pct(A.avg) + '</b></div><div><small>목표1 도달</small><b class="up">' + A.hit1 + '%</b></div><div><small>손절 도달</small><b class="dn">' + A.hits + '%</b></div></div>' +
        '<div class="sub2">유형별 승률</div>' + V.hbars(Object.keys(S.by_type).map(function(k){ var s = S.by_type[k]; return {label: e(k) + ' <span class="mut">' + s.n + '</span>', v: s.win || 0, text: s.win + "%", color: (s.win || 0) >= 50 ? V.UP : V.DN,
          tip: "<b>" + k + "</b> " + s.n + "건<br>승률 " + s.win + "% · 평균 " + pct(s.avg) + "<br>목표1 " + s.hit1 + "% · 손절 " + s.hits + "% · 장중 최고 평균 " + pct(s.hi)}; }), {max: 100}) +
        '<div class="sub2">시간대별 승률</div>' + V.hbars(Object.keys(S.by_slot).map(function(k){ var s = S.by_slot[k]; return {label: e(k) + ' <span class="mut">' + s.n + '</span>', v: s.win || 0, text: s.win + "%", color: (s.win || 0) >= 50 ? V.UP : V.DN,
          tip: "<b>" + k + "</b> " + s.n + "건 · 승률 " + s.win + "% · 평균 " + pct(s.avg)}; }), {max: 100}) +
        '<p class="note">오늘 알람 옆 <b>품질 A/B/C</b> = 같은 유형·같은 시간대 과거 승률로 매긴 등급 (A: 승률 55%↑·평균 플러스).</p>');
      h += card("🎯 손절·익절 라인 vs 실제 <span class='mut'>알람이 낸 손절가·목표가</span>",
        V.hbars([{label: "목표1까지 올라감", v: A.hit1, text: A.hit1 + "%", color: V.UP}, {label: "손절가까지 내려감", v: A.hits, text: A.hits + "%", color: V.DN}, {label: "둘 다 아님", v: Math.max(0, 100 - A.hit1 - A.hits), text: Math.max(0, 100 - A.hit1 - A.hits) + "%", color: "#4a5266"}], {max: 100}) +
        '<p class="note">장중 최고점 평균은 <b class="up">' + pct(A.hi) + '</b>인데 목표1(보통 +5% 안팎) 도달은 ' + A.hit1 + '%뿐 — 목표를 ' + (A.hi != null && A.hi < 4 ? "더 가깝게(+" + Math.max(1.5, A.hi).toFixed(1) + "% 근처) 잡는 게 현실적" : "그대로 둬도 될 만함") + '이에요.</p>');
      if (S.equity && S.equity.length > 1) h += card("📒 가상 매매 일지 <span class='mut'>알람마다 1주씩 샀다면</span>",
        V.lines([{name: "누적 수익(%)", color: V.CAT[0], vals: S.equity.map(function(x){ return x[2]; })}], S.equity.map(function(x){ return x[0]; }), {h: 150, zero: 1, unit: "%"}) +
        '<p class="note">규칙: 알람가에 사서 → 손절가 닿으면 손절(보수적으로 먼저 계산) → 목표1 닿으면 익절 → 아니면 장 마감 가격. 하루 평균을 더해 간 곡선이에요.</p>' +
        '<div class="xt">' + (S.journal || []).slice(0, 12).map(function(j){ return '<div class="xr"><span class="mut">' + j.d.slice(5).replace("-", "/") + " " + e(j.time || "") + '</span>' + opA(j.code, '<b>' + e(j.name) + '</b>') +
          '<span class="mut">' + e(j.type) + '</span><b class="' + cls(j.pnl) + '">' + pct(j.pnl) + '</b>' + (j.hits ? chip("손절", "cool") : j.hit1 ? chip("익절", "hot") : chip("마감", "")) + '</div>'; }).join("") + '</div>');
      b.innerHTML = h;
    });
  });

  /* ======================= 🐋 고래 ======================= */
  wrap("whale", null, function(it, b){
    X("whale_x.json").then(function(W){
      if (!W) return;
      var h = "";
      if (W.consensus && W.consensus.length) h += card("🤝 합의 매수 <span class='mut'>" + e(W.quarter) + "에 새로 담은 고래 수</span>",
        V.hbars(W.consensus.slice(0, 12).map(function(c){ return {label: '<b>' + e(c.t) + '</b>', v: c.n, text: c.n + "명", color: "#3dd6c6", attr: ' onclick="openOP(\'' + e(c.t) + '\')"',
          tip: "<b>" + c.t + "</b> 새로 산 고래 " + c.n + "<br>" + c.by.map(e).join(", ") + (c.vs != null ? "<br>분기말 대비 지금 " + pct(c.vs) : "")}; })) +
        '<p class="note">같은 분기에 여러 고래가 새로 산 종목일수록 "합의"가 강해요. 막대를 누르면 이름, 길게 보면 고래 목록.</p>');
      if (W.cheap && W.cheap.length) h += card("💸 고래보다 싸게 <span class='mut'>고래 기준가(분기말 가격)보다 지금이 낮은 종목</span>",
        '<div class="xt">' + W.cheap.slice(0, 10).map(function(c){ return '<div class="xr">' + opA(c.t, '<b>' + e(c.t) + '</b>') + '<span class="mut">고래 ' + (c.n || "–") + '명 · 기준 ' + fmt(c.qe) + '</span><span class="mut">지금 ' + fmt(c.last) + '</span><b class="dn">' + pct(c.vs) + '</b></div>'; }).join("") + '</div>' +
        '<p class="note">13F는 정확한 매수가를 알려주지 않아서, 고래가 산 분기의 마지막 날 가격을 기준가로 썼어요.</p>');
      var F = W.follow || {};
      if (F.curve && F.curve.length > 1) h += card("📈 고래 따라하기 수익곡선 <span class='mut'>큰 신규 포지션을 공시일에 사서 다음 공시일까지</span>",
        V.lines([{name: "고래 따라하기", color: "#3dd6c6", vals: F.curve.map(function(x){ return x[1]; })}, {name: "S&P 500(SPY)", color: "#8a94a8", vals: F.curve.map(function(x){ return x[2]; })}],
          F.curve.map(function(x){ return x[0].slice(2, 7).replace("-", "/"); }), {h: 170}) +
        '<div class="xt">' + F.legs.map(function(l){ return '<div class="xr"><b>' + e(l.q) + '</b><span class="mut">' + l.n + '종목 · 승률 ' + l.win + '%</span><b class="' + cls(l.ret) + '">' + pct(l.ret) + '</b><span class="mut">SPY ' + pct(l.spy) + '</span></div>'; }).join("") + '</div>' +
        '<p class="note">100에서 시작. 13F 공시(분기말 +46일)에 같은 비중으로 사서 다음 공시일까지 들고 있는 단순 규칙이에요. 마지막 줄은 진행 중.</p>');
      var T = W.timeline || {}, names = (W.groups.inst || []).concat(W.groups.ppl || []).filter(function(n){ return T[n]; });
      if (names.length) h += card("🕰️ 고래별 분기 타임라인", '<select id="wtl" class="xsel">' + names.map(function(n){ return '<option>' + e(n) + '</option>'; }).join("") + '</select><button class="btn wtl-all" id="wtlall">📋 이 고래의 보유 종목 전체 보기</button><div id="wtlb"></div>');
      b.innerHTML = h;
      var drawT = function(n){ $("wtlb").innerHTML = (T[n] || []).map(function(r){
        return '<div class="xtl"><div class="row"><b>' + e(r.q) + '</b><span class="mut">보유 ' + r.n + ' · <span class="up">+' + r.na + '</span> / <span class="dn">−' + r.nd + '</span></span></div>' +
          (r.add.length ? '<div class="cp-sts">' + r.add.slice(0, 12).map(function(t){ return opA(t, '<span class="cp-st"><b>' + e(t) + '</b><span class="up">신규</span></span>'); }).join("") + '</div>' : '') +
          (r.drop.length ? '<div class="cp-sts">' + r.drop.slice(0, 8).map(function(t){ return '<span class="cp-st"><b>' + e(t) + '</b><span class="dn">정리</span></span>'; }).join("") + '</div>' : '') + '</div>'; }).join(""); };
      if ($("wtl")){ var sel = $("wtl"); if (store.wtl && T[store.wtl]) sel.value = store.wtl; sel.onchange = function(){ store.wtl = sel.value; save(); drawT(sel.value); }; drawT(sel.value);
        $("wtlall").onclick = function(){ openMgr(sel.value); }; }
    });
  });

  /* ======================= 🌐 시황: 오늘 할 일 · 종목 칩 · 검색 ======================= */
  wrap("market", function(it, a){
    var has = function(f){ return it.files.indexOf(f) >= 0; };
    Promise.all([has("data.json") ? getJSON(file("market", it.id, "data.json")).catch(function(){ return null; }) : Promise.resolve(null), X("market_x.json")]).then(function(r){
      var d = r[0], MX = r[1], h = "";
      if (d && (d.checks || d.candidates_signal)){
        var cs = d.candidates_signal || {}, ks = Object.keys(cs);
        h += '<section class="card xtodo"><h3>✅ 오늘 할 일</h3>' +
          (d.decision && d.decision.badges ? '<div style="margin-bottom:8px">' + d.decision.badges.map(function(x){ return chip(e(x), "c"); }).join("") + '</div>' : '') +
          (d.checks || []).slice(0, 3).map(function(c, i){ return '<div class="xtd"><span class="n">' + (i + 1) + '</span><div>' + rich(c) + '</div></div>'; }).join("") +
          (ks.length ? '<div class="sub2">볼 것 · 피할 것</div><div class="xcs">' + ks.map(function(k){ var avoid = /피할/.test(k);
            return '<div class="' + (avoid ? "av" : "") + '"><b>' + (avoid ? "🚫 " : "👀 ") + e(k.replace(/^피할 것:\s*/, "")) + '</b><small>' + e(cs[k]) + '</small></div>'; }).join("") + '</div>' : '') + '</section>';
      }
      var chips = MX && MX.chips && MX.chips[it.id];
      if (chips && chips.length) h += card("🏷️ 오늘 리포트에 나온 종목 <span class='mut'>누르면 종목리포트</span>", '<div class="cp-sts" id="mchips">' + chips.map(function(c){
        return '<a class="cp-st" href="javascript:openOP(\'' + e(c[0]) + '\')" data-pc="' + e(c[0]) + '"><b>' + e(c[1].length > 12 ? c[1].slice(0, 11) + "…" : c[1]) + '</b><em class="tk">' + e(V.cd(c[0])) + '</em><span class="mut">…</span></a>'; }).join("") + '</div>');
      h += '<details class="card xsrch"><summary>🔎 지난 시황 검색</summary><div class="reqrow" style="margin-top:10px"><input aria-label="지난 시황 검색" id="msq" placeholder="예: 삼성전자, 금리, 외국인" enterkeyhint="search"></div><div id="msr"></div></details>';
      a.innerHTML = h;
      [].forEach.call(document.querySelectorAll("#mchips [data-pc]"), function(x){ V.price(x.getAttribute("data-pc")).then(function(p){
        var s = x.querySelector("span"); if (!p){ s.textContent = ""; return; } var c = (p[1] / p[2] - 1) * 100; s.className = cls(c); s.textContent = fmt(p[1]) + " " + sgn(c) + "%"; }); });
      var q = $("msq"), T = null;
      if (q) q.onkeydown = function(ev){ if (ev.key === "Enter"){ q.blur(); search(q.value); } };
      if (q) q.oninput = function(){ clearTimeout(T); T = setTimeout(function(){ if (q.value.trim().length >= 2) search(q.value); }, 500); };
    });
  });
  var MSC = null;
  function marketTexts(){
    if (MSC) return MSC;
    var L = (M.cats.market || []).slice(0, 60);
    MSC = Promise.all(L.map(function(x){
      var f = x.files.indexOf("kakao.txt") >= 0 ? "kakao.txt" : x.files.indexOf("data.json") >= 0 ? "data.json" : x.files.filter(function(z){ return /\.(txt|md)$/.test(z); })[0];
      if (!f) return Promise.resolve(null);
      return getText(file("market", x.id, f)).then(function(t){ return {id: x.id, t: t.replace(/<[^>]+>/g, " ").replace(/\\n/g, " ").replace(/\s+/g, " ")}; }).catch(function(){ return null; });
    })).then(function(r){ return r.filter(Boolean); });
    return MSC;
  }
  function search(qs){
    var box = $("msr"); if (!box) return;
    qs = qs.trim(); if (qs.length < 2) return;
    box.innerHTML = '<div class="loading">찾는 중…</div>';
    marketTexts().then(function(docs){
      var res = [];
      docs.forEach(function(d){ var i = d.t.indexOf(qs), n = 0, k = i; while (k >= 0){ n++; k = d.t.indexOf(qs, k + qs.length); }
        if (i >= 0) res.push({id: d.id, n: n, snip: d.t.slice(Math.max(0, i - 40), i + qs.length + 60)}); });
      box.innerHTML = res.length ? '<div class="mut" style="margin:8px 0">' + res.length + '개 리포트에서 찾았어요</div>' + res.map(function(r){
        return '<button class="xsr" data-id="' + e(r.id) + '"><b>' + e(dateLabel(r.id).replace(/<[^>]+>/g, " ")) + ' <span class="mut">' + e(r.id) + ' · ' + r.n + '번</span></b><small>…' + e(r.snip).split(e(qs)).join("<mark>" + e(qs) + "</mark>") + '…</small></button>'; }).join("")
        : '<div class="mut" style="margin:8px 0">"' + e(qs) + '"이(가) 나온 리포트가 없어요.</div>';
      [].forEach.call(box.querySelectorAll(".xsr"), function(b){ b.onclick = function(){ go("market", b.dataset.id); }; });
    });
  }
})();
;
__bk(11);
/* ======== burst.js ======== */
/* ⚠️ 거래폭발 = 「따라 사지 마세요」 경고 (10/28 사용자 「넣어」)
   1분 자료 15거래일 검증: 거래가 갑자기 터진 종목(1분 거래대금이 그날 평균의 5배 + 2분 새 +1% 넘게 · VWAP 위)은
   그날 종가까지 시장(거래대금 상위 500종목 가운데값)보다 평균 −2.7%p 더 빠졌고, 15일 중 13일이 그랬음.
   → 사는 신호가 아니라 경고. stock-screener 가 장중 매분 data/burst_warn.json 에 쌓고, 여기서 2분마다 읽어 신호 화면 위에 보여 줌. */
(function(){
  var URL = "https://raw.githubusercontent.com/chkchp0702-spec/stock-screener/main/data/burst_warn.json";
  // 10/29 사용자 「단타 화면이 없으니 감춰~ 기록만 해둬」 → 어느 화면에도 안 띄움 · 기록은 stock-screener data/burst_log.csv 에 계속 쌓임
  var TABS = {};
  var W = null, at = 0;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ var d = new Date(Date.now() + 9 * 3600e3); return d.toISOString().slice(0, 10).replace(/-/g, ""); }
  function inWL(code){ try { var wl = (window.store && store.wl) || {}; for (var k in wl) if (String(k).replace(/\D/g, "").slice(0, 6) === code) return true; } catch(x) {} return false; }
  function load(){
    if (Date.now() - at < 110e3) return Promise.resolve(W);
    at = Date.now();
    return fetch(URL + "?" + Math.floor(Date.now() / 60000)).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ W = j; return j; }).catch(function(){ return W; });
  }
  function html(j){
    var L = (j.items || []).slice().reverse(), star = L.filter(function(x){ return inWL(x.code); });
    var row = function(x){ var w = inWL(x.code);
      return '<div class="bw-r' + (w ? ' bw-w' : '') + '"><span class="bw-t">' + e(x.t) + '</span><a href="https://m.stock.naver.com/domestic/stock/' + e(x.code) + '/total" target="_blank" rel="noopener"><b>' + (w ? '⭐ ' : '') + e(x.name) + '</b></a>' +
        '<span class="bw-v">' + (x.chg >= 0 ? "+" : "") + x.chg + '%</span><small>거래 ×' + x.x + ' · 2분 +' + x.px2 + '%</small></div>'; };
    var top = L.slice(0, 4), rest = L.slice(4);
    return '<section class="card bw" id="bwcard" data-cz="done"><h3>⚠️ 지금 따라 사지 마세요 <span class="mut">거래 폭발 ' + L.length + '개 · ' + e(j.at || "") + '</span></h3>' +
      (star.length ? '<div class="bw-star">⭐ 관심 종목 ' + star.map(function(x){ return e(x.name); }).join(", ") + ' — 들고 있다면 차익 실현을 생각해 볼 때예요</div>' : '') +
      '<div class="bw-l">' + top.map(row).join("") + '</div>' +
      (rest.length ? '<details class="bw-more"><summary>나머지 ' + rest.length + '개</summary>' + rest.map(row).join("") + '</details>' : '') +
      '<p class="note">' + e(j.why || "거래폭발 종목은 그날 종가까지 시장보다 평균 −2.7%p 더 빠졌어요") + '. 급하게 거래가 터진 뒤엔 대개 식어요 — 사라·팔라는 뜻이 아니라 「쫓아 사지 말자」는 경고예요.</p></section>';
  }
  function mount(){
    var k = (typeof cur !== "undefined" && cur) || "";
    var old = document.getElementById("bwcard");
    if (!TABS[k]){ if (old) old.remove(); return; }
    load().then(function(j){
      var k2 = (typeof cur !== "undefined" && cur) || "", o = document.getElementById("bwcard");
      if (!TABS[k2] || !j || j.date !== kst() || !(j.items || []).length){ if (o) o.remove(); return; }
      var h = html(j);
      if (o){ if (o.dataset.sig !== j.at + "|" + j.items.length){ o.outerHTML = h; o = document.getElementById("bwcard"); if (o) o.dataset.sig = j.at + "|" + j.items.length; } return; }
      var m = document.getElementById("main"); if (!m) return;
      var hero = m.querySelector(":scope > .hero"), box = document.createElement("div"); box.innerHTML = h; var c = box.firstChild;
      c.dataset.sig = j.at + "|" + j.items.length;
      if (hero && hero.nextSibling) m.insertBefore(c, hero.nextSibling); else m.insertBefore(c, m.firstChild);
    });
  }
  var css = document.createElement("style");
  css.textContent = ".bw{border:1.5px solid rgba(255,107,107,.55)!important;background:linear-gradient(180deg,rgba(255,107,107,.08),transparent 60%)}" +
    ".bw-r{display:flex;align-items:baseline;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);flex-wrap:wrap}.bw-r:last-child{border-bottom:0}" +
    ".bw-t{font-variant-numeric:tabular-nums;color:var(--mut,#8a94a8);font-size:12.5px;min-width:38px}.bw-r a{color:var(--text);text-decoration:none}" +
    ".bw-v{color:#ff6b6b;font-weight:700;margin-left:auto}.bw-r small{width:100%;padding-left:46px;color:var(--mut,#8a94a8);font-size:12px}" +
    ".bw-w{background:rgba(255,200,60,.10);border-radius:8px;padding-left:4px}.bw-star{margin:0 0 8px;padding:8px 10px;border-radius:10px;background:rgba(255,200,60,.14);font-weight:700;font-size:13.5px}" +
    ".bw-more summary{cursor:pointer;color:var(--mut,#8a94a8);padding:6px 0;font-size:13px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { mount(); } catch(x) {} }, 400); }
  try { new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t && t.closest && t.closest("#bwcard")) return; } soon(); }).observe(document.getElementById("main") || document.body, {childList: true}); } catch(x) {}
  setInterval(function(){ if (!document.hidden){ at = 0; mount(); } }, 120e3);
  window.__bwMount = mount;
  soon();
})();
;
__bk(12);
/* ======== usage.js ======== */
/* 📈 사용 현황 (10/28 사용자 「동료 PB」가 자주 쓰게 — 1단계: 먼저 잰다)
   앱을 열 때 익명 신호 하나: 기기 번호(이름 없음·난수) · 날짜 · 처음 연 탭 · 앱 버전. 하루에 한 기기 1번 + 30분 넘게 닫았다 다시 열면 1번.
   ntfy 공개 주제(chkchp-ch-open)로 보내고, 서버(usage.py, 2시간마다)가 모아 archive/x/usage.json 에 날짜별로 쌓음.
   관심종목·메모·이름은 보내지 않음. 설정 ⚙️ › 「📈 사용 현황」에서 봄. */
(function(){
  var TOPIC = "chkchp-ch-open", KEY = "us_last";
  // 🩹 11/20 자동 검진·화면 찍기(로봇 브라우저)가 단추를 차례로 눌러 11/18부터 집계가 「누른 수 = 누른 사람 수」로 오염 → 사람 손만 셈
  var BOT = (function(){ try { return !!navigator.webdriver || /HeadlessChrome|Playwright|puppeteer/i.test(navigator.userAgent) || /[?&]embed=1/.test(location.search); } catch(x) { return false; } })();
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function dev(){ var d = ls("us_dev"); if (!d){ d = Math.random().toString(36).slice(2, 10); ls("us_dev", d); } return d; }
  function ping(){
    var d = kst(), tab = (typeof cur !== "undefined" && cur) || (location.hash || "#home").slice(1) || "home";
    var body = {d: dev(), day: d, tab: String(tab).slice(0, 12), v: (typeof APPV !== "undefined" ? APPV : ""), t: new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 16)};
    if (BOT) return;
    try { fetch("https://ntfy.sh/" + TOPIC, {method: "POST", body: JSON.stringify(body), headers: {"Title": "open"}, keepalive: true}).catch(function(){}); } catch(x) {}
    ls(KEY, String(Date.now()));
  }
  function maybe(){ var last = +ls(KEY) || 0; if (Date.now() - last > 30 * 60e3) ping(); }

  // ---------- 🎯 11/04 누른 것 · 본 화면 (사용자 「들어온 사람들이 어디를 제일 많이 봤니」) ----------
  //   이름·관심종목·입력한 글은 안 보냄. 단추·카드의 「짧은 이름」만 세서 모았다가 한 번에(앱을 내릴 때 · 10분마다) 보냄.
  var TK = "us_tap", NAMES = {home: "오늘", market: "시황", sector: "시장 흐름", prob: "오를 확률", flow: "수급", port: "포트", divc: "배당비교", score: "성적표", whale: "큰손", cup: "컵 차트", gap: "갭 상승", screen: "종목 찾기", sigmore: "신호 더 보기",
    bond: "채권", fund: "펀드", els: "ELS", prop: "제안서", luck: "오늘의 운세", saju: "사주", tarot: "타로", lotto: "로또", feed: "피드", onepager: "종목리포트", alarm: "알림", idea: "의견함", send: "한 장", lab: "연구실", tax: "세무계산기", diag: "포트 진단", sigall: "신호 한눈에"};
  function bag(){ var b = null; try { b = JSON.parse(localStorage.getItem(TK) || "null"); } catch(x) {} if (!b || b.day !== kst()) b = {day: kst(), taps: {}, views: {}, n: 0}; return b; }
  function put(b){ try { localStorage.setItem(TK, JSON.stringify(b)); } catch(x) {} }
  // 🩹 11/18 글자를 UTF-16 길이로 자르면 이모지가 반쪽만 남을 수 있음 → 끝의 짝 없는 글자를 지움 (usage.py 가 이것 때문에 11/17 16시부터 멈췄음)
  function add(kind, label){ if (!label) return; var b = bag(), m = kind === "v" ? b.views : b.taps; label = String(label).replace(/\s+/g, " ").trim().slice(0, kind === "v" ? 14 : 28).replace(/[\ud800-\udbff]$/, ""); if (!label) return; m[label] = (m[label] || 0) + 1; b.n++; put(b); }
  var lastView = "";
  function view(){ var c = (typeof cur !== "undefined" && cur) || ""; if (!c || c === lastView) return; lastView = c; add("v", NAMES[c] || c); }
  // 🔒 11/23 단추 글자 「안에」 고객 이름이 섞인 경우(예 📨 한 장 「📨 홍길동 고객님께 보내기」)도 이름을 ○○ 로 바꿔서만 셈
  function names(){ try { var a = JSON.parse(localStorage.getItem("op_clients") || "[]") || [], h = JSON.parse(localStorage.getItem("pp_hist") || "[]") || [];
      return a.concat(h.map(function(o){ return o && o.cust; })).concat([localStorage.getItem("pbname")]).filter(function(n){ return typeof n === "string" && n.trim().length >= 2; }).map(function(n){ return n.trim(); }); } catch(z){ return []; } }
  function scrub(x){ var L = names().sort(function(p, q){ return q.length - p.length; }); for (var i = 0; i < L.length; i++) x = x.split(L[i]).join("○○"); return x; }
  function isName(x){ if (!x || x.length > 24) return false; try { var a = JSON.parse(localStorage.getItem("op_clients") || "[]") || []; var h = JSON.parse(localStorage.getItem("pp_hist") || "[]") || [];
      var L = a.concat(h.map(function(o){ return o && o.cust; })).concat([localStorage.getItem("pbname")]).filter(function(n){ return typeof n === "string" && n; });
      for (var i = 0; i < L.length; i++) if (x === L[i] || x === L[i] + "님" || x === L[i] + " 고객님") return true; } catch(z) {} return false; }
  function labelOf(t){
    if (t.closest("input,textarea,select,[contenteditable]")) return null;
    var g = t.closest("#bnav button"); if (g) return "아래탭 · " + ((g.children[1] && g.children[1].textContent) || g.textContent).trim();
    if (t.closest("#gdbtn,.gd-b,.gd-i")) return "조이 설명";
    if (t.closest("#opbtn,#h2clb")) return "📨 보내기";
    if (t.closest("#x23go")) return "한 장 · 📨 완성본 보내기";   // 🔒 11/23 이 단추 글자엔 방금 친(아직 저장 안 된) 받는 분 이름이 들어가므로 이름을 고정
    var x18 = t.closest("[data-sc18],[data-nw18],[data-pp18h],[data-pp18n],[data-pp18s],[data-pp18o],#tx18,#pf18,.sec18");   // 🧊 11/18 6차 — 새 단추는 이름을 고정(쓰이는지 재려고)
    if (x18) return x18.dataset.sc18 ? "📌 바로가기 · " + x18.dataset.sc18 : x18.dataset.nw18 ? "🆕 새로 생긴 것 · " + x18.dataset.nw18 : x18.dataset.pp18h != null ? "제안서 · 🔁 지난번 그대로" : x18.dataset.pp18n != null ? "제안서 · 🔁 이름만 바꿔" : (x18.dataset.pp18s != null || x18.dataset.pp18o != null) ? "제안서 · 👀 완성본 먼저" : x18.id === "tx18" ? "세무 · 📨 절세 한 장" : x18.id === "pf18" ? "포트 · 📊 성적 펼치기" : "오늘 · 🗺 섹터 지도 타일";
    if (t.closest("#gsbtn")) return "🔍 검색"; if (t.closest("#wlbtn")) return "⭐ 관심종목"; if (t.closest("#uibtn")) return "⚙️ 설정";
    var r = t.closest(".h2-ring"); if (r) return "스토리 · " + ((r.querySelector("small") || r).textContent || "").trim();
    var d = t.closest(".h2-d"); if (d) return "오늘의 발견 · " + (d.getAttribute("data-goto") ? (NAMES[d.getAttribute("data-goto")] || d.getAttribute("data-goto")) : "");
    if (t.closest(".h2-tm")) return "업종 지도 칸"; if (t.closest(".h2-w")) return "5개 시장 타일"; if (t.closest(".h2-num")) return "오늘의 숫자"; if (t.closest("#tdhero")) return "날씨판";
    var tab = t.closest("header .tabs .tab, .tabs.sub .tab"); if (tab) return "위탭 · " + (tab.textContent || "").replace(/[^\s가-힣A-Za-z0-9·]/g, "").trim();
    var op = t.closest("[data-op]"); if (op) return "종목 열기";   // 종목 이름은 안 보냄
    var gt = t.closest("[data-goto]"); if (gt) return "→ " + (NAMES[String(gt.getAttribute("data-goto")).split("~")[0]] || gt.getAttribute("data-goto"));
    var bt = t.closest("button,summary,.fold,a,[role=button]"); if (!bt || bt.closest("#gdq,#wowob,#usgx")) return null;
    // 🔒 11/18 고객 이름 칩(최근 받는 분)을 누르면 단추 글자 = 고객 이름이 그대로 집계에 올라가던 것을 막음 — 이 휴대폰에 저장된 이름과 같은 글자의 단추는 세지 않음
    if (bt.closest("[data-cl],[data-dvcl],[data-tx18c],[data-x23cl],.opc-rc,.tx18-rc,.pp18-r,.x23-rc") || isName((bt.innerText || bt.textContent || "").replace(/\s+/g, " ").trim())) return null;
    var tx = scrub(bt.innerText || bt.textContent || "").replace(/[\d,.%+−\-]+/g, "#").replace(/\s+/g, " ").trim();   // 숫자는 # 로(값 말고 단추 이름만)
    if (!tx || tx.length < 2) return null;
    var c = (typeof cur !== "undefined" && cur) || ""; return (NAMES[c] || c) + " · " + tx.slice(0, 20).replace(/[\ud800-\udbff]$/, "");
  }
  document.addEventListener("click", function(ev){ try { var t = ev.target; if (!t || !t.closest) return; add("t", labelOf(t)); } catch(x) {} }, true);
  function flush(){
    var b = bag(); if (!b.n) return;
    var body = {k: "tap", d: dev(), day: b.day, v: (typeof APPV !== "undefined" ? APPV : ""), taps: b.taps, views: b.views};
    var s = JSON.stringify(body); if (s.length > 3800){ var ks = Object.keys(b.taps).sort(function(a, c){ return b.taps[c] - b.taps[a]; }).slice(0, 40), t2 = {}; ks.forEach(function(k){ t2[k] = b.taps[k]; }); body.taps = t2; s = JSON.stringify(body); }
    if (BOT){ put({day: b.day, taps: {}, views: {}, n: 0}); return; }
    try { fetch("https://ntfy.sh/" + TOPIC, {method: "POST", body: s, headers: {"Title": "tap"}, keepalive: true}).catch(function(){}); } catch(x) {}
    put({day: b.day, taps: {}, views: {}, n: 0});
  }
  setInterval(view, 1500); setTimeout(view, 3000);
  setInterval(function(){ if (!document.hidden) flush(); }, 10 * 60e3);
  document.addEventListener("visibilitychange", function(){ if (document.hidden) flush(); });
  window.addEventListener("pagehide", flush);
  setTimeout(maybe, 2500);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) maybe(); });

  // ---------- 보기: 설정 ⚙️ › 📈 사용 현황 ----------
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ return s ? s.slice(5).replace("-", "/") : ""; }
  function show(){
    var box = document.createElement("div"); box.id = "usgx"; box.innerHTML = '<div class="usg-s"><div class="loading">사용 현황 불러오는 중…</div></div>';
    box.addEventListener("click", function(ev){ if (ev.target === box) box.remove(); });
    document.body.appendChild(box);
    fetch("archive/x/usage.json?" + Math.floor(Date.now() / 600000)).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(J){   // 🔒 11/04 운영자 전용 — 잠근 몫(parts)을 하나씩 열어 더함
        if (!J) return null; if (J.days) return J;
        if (!J.parts) return null; if (!window.__opOpen) throw "locked";
        return Promise.all(J.parts.map(function(p){ return window.__opOpen(p).catch(function(x){ if (x === "locked") throw x; return null; }); })).then(function(L){
          var U = {days: {}, at: J.at};
          L.forEach(function(P){ if (!P || !P.days) return; Object.keys(P.days).forEach(function(d){ var S = P.days[d], T = U.days[d] || (U.days[d] = {dev: {}, tabs: {}, opens: 0, ver: {}, taps: {}, views: {}, tapdev: {}});
            ["dev", "tabs", "ver", "taps", "views"].forEach(function(f){ var o = S[f] || {}; Object.keys(o).forEach(function(k){ T[f][k] = (T[f][k] || 0) + o[k]; }); });
            T.opens += S.opens || 0; var W = S.tapdev || {}; Object.keys(W).forEach(function(k){ var a = T.tapdev[k] || (T.tapdev[k] = {}); Object.keys(W[k] || {}).forEach(function(x){ a[x] = 1; }); }); }); });
          return U; }); })
      .then(function(U){
      var s = box.firstChild;
      if (!U || !U.days){ s.innerHTML = '<h3>📈 사용 현황</h3><p class="note">아직 모인 기록이 없어요. 2시간마다 모아요.</p><button class="btn" id="usgc">닫기</button>'; return; }
      var days = Object.keys(U.days).sort(), last = days.slice(-14), w7 = days.slice(-7), p7 = days.slice(-14, -7);
      var uniq = function(ds){ var s_ = {}; ds.forEach(function(d){ Object.keys(U.days[d].dev || {}).forEach(function(k){ s_[k] = 1; }); }); return Object.keys(s_).length; };
      var cnt = {}; w7.forEach(function(d){ Object.keys(U.days[d].dev || {}).forEach(function(k){ cnt[k] = (cnt[k] || 0) + 1; }); });
      var devs = Object.keys(cnt), loyal = devs.filter(function(k){ return cnt[k] >= 3; }).length;
      var tabs = {}; w7.forEach(function(d){ var T = U.days[d].tabs || {}; Object.keys(T).forEach(function(k){ tabs[k] = (tabs[k] || 0) + T[k]; }); });
      var tt = Object.keys(tabs).sort(function(a, b){ return tabs[b] - tabs[a]; }).slice(0, 5);
      var mx = Math.max.apply(null, last.map(function(d){ return Object.keys(U.days[d].dev || {}).length; }).concat([1]));
      s.innerHTML = '<h3>📈 사용 현황 <span class="mut">익명 · ' + e(md(U.at || "")) + ' 기준</span></h3>' +
        '<div class="usg-k"><div><b>' + uniq(w7) + '</b><small>이번 7일 쓴 기기</small></div><div><b>' + loyal + '</b><small>주 3회 이상</small></div><div><b>' + (uniq(p7) ? (uniq(w7) >= uniq(p7) ? "+" : "") + (uniq(w7) - uniq(p7)) : "–") + '</b><small>지난 7일 대비</small></div></div>' +
        '<div class="usg-b">' + last.map(function(d){ var n = Object.keys(U.days[d].dev || {}).length; return '<div title="' + e(md(d)) + ' ' + n + '기기"><i style="height:' + Math.round(n / mx * 44) + 'px"></i><small>' + e(d.slice(8)) + '</small></div>'; }).join("") + '</div>' +
        '<p class="note" style="margin:6px 0 2px">날짜별 쓴 기기 수(최근 14일)</p>' +
        (tt.length ? '<div class="usg-t">' + tt.map(function(k){ return '<span>' + e(k) + ' <b>' + tabs[k] + '</b></span>'; }).join("") + '</div><p class="note" style="margin:4px 0 0">이번 7일 처음 연 화면</p>' : '') +
        (function(){ var T = (U.days[days[days.length - 1]] || {}), V = T.views || {}, P = T.taps || {}, W = T.tapdev || {};
          var vk = Object.keys(V).sort(function(a, b){ return V[b] - V[a]; }).slice(0, 8), pk = Object.keys(P).sort(function(a, b){ return P[b] - P[a]; }).slice(0, 10);
          if (!vk.length && !pk.length) return '<p class="note" style="margin:10px 0 0">🎯 누른 것 기록은 11/4 오후부터 모여요.</p>';
          var mv = Math.max.apply(null, vk.map(function(k){ return V[k]; }).concat([1]));
          return '<h4 style="margin:14px 0 6px;font-size:15px">👀 ' + e(md(days[days.length - 1])) + ' 많이 본 화면</h4>' + vk.map(function(k){ return '<div style="display:flex;align-items:center;gap:8px;margin:4px 0;font-size:14px"><span style="width:84px;flex:none">' + e(k) + '</span><i style="height:10px;border-radius:5px;background:var(--acc,#7c9cff);width:' + Math.round(V[k] / mv * 60) + '%"></i><b>' + V[k] + '</b></div>'; }).join("") +
            (pk.length ? '<h4 style="margin:14px 0 6px;font-size:15px">👆 많이 누른 것</h4><ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7">' + pk.map(function(k){ var nd = W[k] ? Object.keys(W[k]).length : 0; return '<li>' + e(k) + ' <b>' + P[k] + '번</b>' + (nd ? ' <span class="mut">· ' + nd + '명</span>' : '') + '</li>'; }).join("") + '</ol>' : ''); })() +
        '<p class="note">기기 번호(난수)·날짜·처음 연 화면만 모아요. 이름·관심종목·메모는 안 보내요. 목표: 4주 뒤 「주 3회 이상」 늘리기.</p><button class="btn" id="usgc">닫기</button>';
      var c = document.getElementById("usgc"); if (c) c.onclick = function(){ box.remove(); };
    }).catch(function(x){ box.firstChild.innerHTML = '<h3>📈 사용 현황</h3><p class="note">' + (x === "locked" ? '🔒 운영자만 볼 수 있어요. 💬 의견함 › 🔐 운영자에서 비밀번호를 넣은 휴대폰에서만 열려요.' : '불러오지 못했어요.') + '</p><button class="btn" onclick="document.getElementById(\'usgx\').remove()">닫기</button>'; });
  }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-usage]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); show(); }, true);
  function addBtn(){ var g = document.querySelector("#uiset .us-go"); if (!g || g.querySelector("[data-usage]")) return;
    if (!(window.__opHas && __opHas())) return;   // 🔒 11/04 운영자 비밀번호가 있는 폰에만 단추가 보임
    var b = document.createElement("button"); b.setAttribute("data-usage", "1"); b.textContent = "📈 사용 현황";
    var ic = g.querySelector("[data-icons]"); g.insertBefore(b, ic ? ic.nextSibling : g.firstChild); }
  new MutationObserver(function(){ if (document.getElementById("uiset")) addBtn(); }).observe(document.documentElement, {childList: true, subtree: true});
  var st = document.createElement("style");
  st.textContent = "#usgx{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}" +
    ".usg-s{width:100%;max-width:520px;max-height:80vh;overflow:auto;background:var(--panel);color:var(--text);border-radius:18px 18px 0 0;padding:16px 16px 28px;box-sizing:border-box}.usg-s h3{margin:0 0 10px;font-size:17px}" +
    ".usg-k{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 12px}.usg-k div{background:var(--panel2);border-radius:12px;padding:10px 8px;text-align:center}.usg-k b{display:block;font-size:24px;font-weight:800}.usg-k small{color:var(--mut,#8a94a8);font-size:11.5px}" +
    ".usg-b{display:flex;gap:4px;align-items:flex-end;height:64px;padding:0 2px}.usg-b div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}.usg-b i{display:block;width:100%;min-height:2px;border-radius:4px 4px 0 0;background:var(--acc,#7c9cff)}.usg-b small{font-size:10px;color:var(--mut,#8a94a8);margin-top:3px}" +
    ".usg-t{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.usg-t span{background:var(--panel2);border-radius:999px;padding:4px 10px;font-size:12.5px}.usg-s .btn{margin-top:10px;width:100%}";
  document.head.appendChild(st);
})();
;
__bk(13);
/* ======== plus.js ======== */
/* CH Investing — 2차 업그레이드: ⭐ 관심종목·메모 + 9개 탭 기능 45개 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt;
  var XC = {};
  function X(name){ if (!XC[name]) XC[name] = getJSON("archive/x/" + name + "?" + (M.updated || "")).catch(function(){ XC[name] = null; return null; }); return XC[name]; }
  function card(title, body, extra, id){ return '<section class="card"' + (id ? ' id="' + id + '"' : '') + '>' + (title ? '<h3>' + title + (extra || "") + '</h3>' : '') + body + '</section>'; }
  function chip(t, c){ return '<span class="chip2 ' + (c || "") + '">' + t + '</span>'; }
  function pct(v){ return v == null || isNaN(v) ? "–" : sgn(v) + "%"; }
  function opA(code, inner){ return '<a class="xo" href="javascript:openOP(\'' + e(code).replace(/'/g, "") + '\')">' + inner + '</a>'; }
  function kn(c){ c = String(c || ""); return /^\d{6}(\.K[SQ])?$/.test(c) ? c.slice(0, 6) : c; }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function dAdd(d, n){ var t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
  function dDiff(a, b){ return Math.round((new Date(a + "T00:00:00Z") - new Date(b + "T00:00:00Z")) / 864e5); }
  function md(d){ return String(d || "").slice(5, 10).replace("-", "/"); }
  function latest(cat, fname){
    var L = (M.cats[cat] || []).filter(function(x){ return x.files.indexOf(fname) >= 0; });
    return L.length ? getJSON(file(cat, L[0].id, fname)).catch(function(){ return null; }) : Promise.resolve(null);
  }
  function compassNow(){ return latest("sector", "compass.json"); }
  function after(fn){ setTimeout(fn, 0); }
  function wrap(key, top, bottom){
    var OLD = RENDER[key];
    RENDER[key] = function(it, el){
      el.innerHTML = '<div class="pa"></div><div class="po"></div><div class="pb"></div>';
      var a = el.querySelector(".pa"), o = el.querySelector(".po"), b = el.querySelector(".pb");
      OLD(it, o);
      if (top) try { top(it, a, o); } catch(err) { console.error(err); }
      if (bottom) try { bottom(it, b, o); } catch(err) { console.error(err); }
    };
  }
  // 화면에 새로 생기는 요소마다 한 번씩 손대기
  var EACHN = 0;
  function each(root, sel, fn){
    var tag = "data-pl" + (++EACHN);
    var run = function(){ [].forEach.call(root.querySelectorAll(sel + ":not([" + tag + "])"), function(x){ x.setAttribute(tag, "1"); try { fn(x); } catch(err) { console.error(err); } }); };
    run(); new MutationObserver(run).observe(root, {childList: true, subtree: true});
  }

  /* =================== ⭐ 관심종목 · 메모 =================== */
  var WL = store.wl || {};
  (function(){   // 10/28 「하이닉스를 쳤는데 왜 ADR로 나와」 — 관심종목에 담긴 한국 회사 미국 ADR → 한국 본주로 바꿈 (한 번)
    var TW = {SKHY: ["000660", "SK하이닉스"], PKX: ["005490", "POSCO홀딩스"], KB: ["105560", "KB금융"], SHG: ["055550", "신한지주"], WF: ["316140", "우리금융지주"], KEP: ["015760", "한국전력"], LPL: ["034220", "LG디스플레이"], SKM: ["017670", "SK텔레콤"]}, ch = [];
    Object.keys(WL).forEach(function(k){ var t = TW[String(k).toUpperCase()]; if (!t) return; if (!WL[t[0]]) WL[t[0]] = {n: t[1], s: t[0] + ".KS", t: WL[k].t || ""}; delete WL[k]; ch.push(t[1]); });
    if (ch.length){ store.wl = WL; save(); setTimeout(function(){ try { syncSoon(); } catch(x) {} try { toast("⭐ " + ch.join("·") + " — 미국 ADR 대신 한국 본주로 바꿔 담았어요"); } catch(x) {} }, 2500); }
  })();
  if (!store.uid){ store.uid = Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, "x"); save(); }
  var UID = store.uid;
  function wlSave(){ store.wl = WL; save(); syncSoon(); refreshStars(); }
  function inWL(code){ return !!WL[kn(code)]; }
  function wlToggle(code, name){
    var k = kn(code);
    if (WL[k]){ if (!confirm((WL[k].n || k) + " 을(를) 관심종목에서 뺄까요?")) return false; delete WL[k]; wlSave(); toast("관심종목에서 뺐어요"); return false; }
    WL[k] = {n: name || k, s: code, t: today()};
    V.price(code).then(function(p){ if (p && WL[k]){ WL[k].p0 = p[1]; wlSave(); } });
    wlSave(); toast("⭐ 관심종목에 담았어요 — 신호가 뜨면 알려드려요");
    return true;
  }
  window.wlToggle = wlToggle;
  function starBtn(code, name, big){
    return '<button class="star' + (inWL(code) ? " on" : "") + (big ? " big" : "") + '" data-star="' + e(code) + '" data-nm="' + e(name || "") + '" aria-label="관심종목">' + (inWL(code) ? "★" : "☆") + (big ? '<span>' + (inWL(code) ? "관심종목" : "관심종목 담기") + '</span>' : '') + '</button>';
  }
  function refreshStars(){
    [].forEach.call(document.querySelectorAll("[data-star]"), function(b){
      var on = inWL(b.getAttribute("data-star"));
      b.classList.toggle("on", on);
      b.firstChild.nodeValue = on ? "★" : "☆";
      var sp = b.querySelector("span"); if (sp) sp.textContent = on ? "관심종목" : "관심종목 담기";
    });
    var hb = $("wlbtn"); if (hb) hb.querySelector("em").textContent = Object.keys(WL).length || "";
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-star]");
    if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    wlToggle(b.getAttribute("data-star"), b.getAttribute("data-nm"));
  }, true);
  function toast(t){
    var x = document.createElement("div"); x.className = "toast"; x.setAttribute("role", "status"); x.setAttribute("aria-live", "polite"); x.textContent = t; document.body.appendChild(x);
    setTimeout(function(){ x.classList.add("on"); }, 10); setTimeout(function(){ x.classList.remove("on"); setTimeout(function(){ x.remove(); }, 300); }, 2200);
  }

  // 서버 알림을 위해 관심종목·목표가만 올리기 (메모 글은 휴대폰에만)
  var SYNC = "chkchp-ch-sync", ST = null;
  function syncSoon(){ clearTimeout(ST); ST = setTimeout(sync, 2500); }
  window.__cpSync = syncSoon;
  function sync(){
    var al = store.al || {};
    var body = {uid: UID, wl: Object.keys(WL).map(function(k){ var w = WL[k]; return [k, (w.n || k).slice(0, 40), w.buy || null, w.tgt || null, w.stop || null]; }),
                quiet: al.quiet || [23, 7], brief: al.brief === 0 ? 0 : 1, lim: al.lim || null,
                cp: (store.cp || []).slice(0, 60), els: (function(){ try { return (JSON.parse(localStorage.getItem("elsmy") || "[]") || []).slice(0, 30).map(function(x){ return [x.id, String(x.nm || "").slice(0, 40), x.key, x.base]; }); } catch(z) { return []; } })()};   // 10/28 📌 내 고객 상품(채권·펀드·ELS) — 알림용
    fetch("https://ntfy.sh/" + SYNC, {method: "POST", body: JSON.stringify(body)}).then(function(){ store.synced = today(); save(); }).catch(function(){});
  }
  if (store.synced !== today() && (Object.keys(WL).length || store.al || (store.cp && store.cp.length))) setTimeout(sync, 4000);
  window.MYTOPIC = "chkchp-ch-u-" + UID;

  // 헤더 ⭐ 버튼
  (function(){
    var top = document.querySelector("header .top"); if (!top) return;
    var b = document.createElement("button"); b.id = "wlbtn"; b.innerHTML = "⭐<em>" + (Object.keys(WL).length || "") + "</em>";
    b.onclick = function(){ openWL(); };
    top.insertBefore(b, $("stamp"));
  })();

  function openWL(){
    navPush({t: "go", key: cur, id: curDate});
    closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b>⭐ 내 관심종목</b></div><div class="sh-body" id="wlbody"><div class="loading">불러오는 중…</div></div>';
    document.body.appendChild(sh); document.body.classList.add("sheet-open"); updBack();
    drawWL();
  }
  window.openWL = openWL;
  function drawWL(){
    var box = $("wlbody"); if (!box) return;
    var ks = Object.keys(WL);
    if (!ks.length){ box.innerHTML = '<div class="empty"><div class="big">⭐</div>아직 담은 종목이 없어요.<br>카드나 종목리포트의 <b>☆</b>를 누르면 여기에 모여요.<br><br><small class="mut">담은 종목에 컵·갭·매집·고래·단타 신호가 뜨면 알림을 받을 수 있어요 (🔔 알림 탭).</small></div>'; return; }
    Promise.all([X("earn_cal.json"), X("whale_holdings.json"), todaySignals()]).then(function(r){
      var EC = r[0], WH = r[1], SG = r[2];
      var holders = whaleHolders(WH);
      var h = '<p class="note" style="margin:0 2px 12px">신호가 뜬 종목이 위로 와요. 누르면 종목리포트, ✏️로 매수가·목표가·손절가·메모.</p>';
      ks.sort(function(a, b){ return (SG[b] ? 1 : 0) - (SG[a] ? 1 : 0) || (WL[a].n || a).localeCompare(WL[b].n || b); });
      h += ks.map(function(k){
        var w = WL[k], sg = SG[k] || [], ec = ((EC && EC.items) || []).filter(function(x){ return kn(x.s) === k; })[0], wh = holders[k] || [];
        return '<section class="card wl" data-k="' + e(k) + '"><div class="row"><div class="wl-n">' + opA(w.s || k, '<b>' + e(w.n || k) + '</b> <em class="tk">' + e(V.cd(w.s || k)) + '</em>') + '</div>' +
          '<div class="wl-p" data-wp="' + e(w.s || k) + '">…</div></div>' +
          (sg.length ? '<div class="wl-sg">' + sg.map(function(s){ return '<a class="chip2 hot" href="javascript:go(\'' + s[1] + '\')">' + e(s[0]) + '</a>'; }).join("") + '</div>' : '') +
          '<div class="wl-m">' + (w.buy ? '<span>매수 ' + fmt(w.buy) + '</span>' : '') + (w.tgt ? '<span class="up">🎯 ' + fmt(w.tgt) + '</span>' : '') + (w.stop ? '<span class="dn">🛑 ' + fmt(w.stop) + '</span>' : '') +
          (ec ? '<span>📅 ' + e(ec.kind) + ' ' + md(ec.d) + '</span>' : '') + (wh.length ? '<span>🐋 ' + e(wh.slice(0, 2).map(function(x){ return x[0]; }).join(", ")) + (wh.length > 2 ? " 외 " + (wh.length - 2) : "") + '</span>' : '') + '</div>' +
          (w.memo ? '<p class="wl-memo">📝 ' + e(w.memo) + '</p>' : '') +
          '<div class="row" style="margin-top:8px"><span class="mut">' + md(w.t) + ' 담음' + (w.p0 ? ' · 그때 ' + fmt(w.p0) : '') + '</span><span><button class="btn wl-ed" data-k="' + e(k) + '">✏️ 메모</button> <button class="btn wl-rm" data-k="' + e(k) + '">빼기</button></span></div></section>';
      }).join("");
      h += '<section class="card"><h3>🔔 관심종목 알림 받기</h3><p class="note" style="margin-top:0">담은 종목에 신호가 뜨거나 목표가·손절가에 닿으면 이 휴대폰으로 알려줘요 (ntfy 앱 필요).</p>' +
        '<div class="al-b"><a class="btn al-sub" href="ntfy://ntfy.sh/' + MYTOPIC + '">🔔 내 알림 구독</a><a class="btn" href="javascript:go(\'alarm\')">알림 설정 →</a></div>' +
        '<p class="note">알림을 위해 종목 코드와 목표가·손절가만 서버에 올려요 (메모 글은 이 휴대폰에만). 다른 휴대폰에선 따로 담아야 해요.</p></section>';
      box.innerHTML = h;
      [].forEach.call(box.querySelectorAll("[data-wp]"), function(x){ V.price(x.getAttribute("data-wp")).then(function(p){
        var k = kn(x.getAttribute("data-wp")), w = WL[k] || {};
        if (!p){ x.textContent = "–"; return; }
        var c = (p[1] / p[2] - 1) * 100, base = w.buy || w.p0, r = base ? (p[1] / base - 1) * 100 : null;
        x.innerHTML = '<b>' + fmt(p[1]) + '</b> <span class="' + cls(c) + '">' + sgn(c) + '%</span>' + (r != null ? '<small class="' + cls(r) + '">' + (w.buy ? "매수가" : "담은 뒤") + ' ' + sgn(r) + '%</small>' : ''); }); });
      [].forEach.call(box.querySelectorAll(".wl-rm"), function(b){ b.onclick = function(){ if (wlToggle(b.dataset.k) === false) drawWL(); }; });
      [].forEach.call(box.querySelectorAll(".wl-ed"), function(b){ b.onclick = function(){ memoForm(b.closest(".wl"), b.dataset.k, drawWL); }; });
    });
  }
  function memoForm(host, k, done){
    var w = WL[k] || {};
    var f = document.createElement("div"); f.className = "memo-f";
    f.innerHTML = '<div class="mf3"><label>매수가<input type="number" inputmode="decimal" step="any" name="buy" value="' + (w.buy || "") + '"></label>' +
      '<label>🎯 목표가<input type="number" inputmode="decimal" step="any" name="tgt" value="' + (w.tgt || "") + '"></label>' +
      '<label>🛑 손절가<input type="number" inputmode="decimal" step="any" name="stop" value="' + (w.stop || "") + '"></label></div>' +
      '<label>📝 매수 이유 · 메모<textarea name="memo" rows="3" placeholder="왜 샀나, 무엇을 보면 팔까">' + e(w.memo || "") + '</textarea></label>' +
      '<div class="row"><span class="mut">목표가·손절가에 닿으면 알림 (매시간 확인)</span><button class="btn al-sub mf-ok">저장</button></div>';
    var old = host.querySelector(".memo-f"); if (old){ old.remove(); return; }
    host.appendChild(f);
    f.querySelector(".mf-ok").onclick = function(){
      var g = function(n){ var v = parseFloat(f.querySelector("[name=" + n + "]").value); return isNaN(v) || v <= 0 ? null : v; };
      WL[k] = Object.assign(WL[k] || {n: k, s: k, t: today()}, {buy: g("buy"), tgt: g("tgt"), stop: g("stop"), memo: f.querySelector("textarea").value.trim()});
      wlSave(); toast("저장했어요"); if (done) done();
    };
  }
  window.memoForm = memoForm;
  function whaleHolders(WH){
    var o = {};
    if (!WH || !WH.m) return o;
    Object.keys(WH.m).forEach(function(nm){ (WH.m[nm].items || []).forEach(function(x){ (o[kn(x.t)] = o[kn(x.t)] || []).push([nm, x.w, x.chg]); }); });
    Object.keys(o).forEach(function(k){ o[k].sort(function(a, b){ return b[1] - a[1]; }); });
    return o;
  }
  // 오늘 탭별 신호 → {키: [[설명, 탭]]}
  var SGP = null;
  function todaySignals(){
    if (SGP) return SGP;
    SGP = Promise.all([latest("cup", "cards.json"), latest("gap", "cards.json"), latest("accum", "list.json"), latest("danta", "alerts.json"), X("whale_x.json"), X("accum_x.json")]).then(function(r){
      var o = {}, add = function(c, t, tab){ (o[kn(c)] = o[kn(c)] || []).push([t, tab]); };
      var cu = r[0] || {}; (cu.ath || []).concat(cu.top || []).forEach(function(c){ if (c.brk) add(c.code, "☕ 컵 돌파", "cup"); else if (c.dist != null && c.dist >= -3) add(c.code, "☕ 돌파 임박", "cup"); else add(c.code, "☕ 컵 후보", "cup"); });
      ((r[1] || {}).top || []).forEach(function(c){ add(c.code, "📈 갭 " + (c.hold ? "유지" : "메움"), "gap"); });
      (r[2] || []).forEach(function(c){ add(c.code, "🤫 " + (c.tag || "매집"), "accum"); });
      (r[3] || []).forEach(function(c){ if (c.sent !== false) add(c.code, "⚡ 단타 " + c.time, "danta"); });
      ((r[4] || {}).consensus || []).forEach(function(c){ add(c.t, "🐋 고래 " + c.n + "명 매수", "whale"); });
      ((r[5] || {}).items || []).forEach(function(c){ if (c.brk) add(c.code, "🚀 박스 돌파", "accum"); });
      return o;
    });
    return SGP;
  }

  // 카드마다 ☆ 달기 (컵·갭·매집 카드: data-spark 에 코드가 있음)
  each(document.body, ".cc", function(cc){
    var sp = cc.querySelector("[data-spark]"); if (!sp) return;
    var code = sp.getAttribute("data-spark"), nm = (cc.querySelector(".nm2 b") || {}).textContent || code;
    var row = cc.querySelector(".row"); if (row) row.insertAdjacentHTML("beforeend", starBtn(code, nm));
  });
  each(document.body, ".list .st", function(st){
    var cd = st.querySelector(".cd"), nm = st.querySelector(".nm a"); if (!cd || !nm) return;
    nm.parentNode.insertAdjacentHTML("beforeend", starBtn(cd.textContent.trim(), nm.textContent.trim()));
  });

  window.PL = {X: X, card: card, chip: chip, pct: pct, opA: opA, kn: kn, today: today, dAdd: dAdd, dDiff: dDiff, md: md, latest: latest, compassNow: compassNow,
               wrap: wrap, each: each, starBtn: starBtn, WL: function(){ return WL; }, todaySignals: todaySignals, whaleHolders: whaleHolders, toast: toast, sync: sync, memoForm: memoForm};
})();
;
__bk(14);
/* ======== cpin.js ======== */
/* 📌 내 고객 상품 (10/28 사용자 「동료 PB」 ③) — 동료 PB 가 자기 고객이 든 채권·펀드를 담아 두면
   🏠 오늘 맨 위에 「오늘 내 고객 상품 중 챙길 것」: 만기 D-n · 이자일 · 펀드 큰 등락 · ELS 다음 평가(ELS 는 📌 관제탑 것을 같이 씀).
   휴대폰에만 저장(cpin) · 서버 알림용으로는 종류·코드·이름·만기만 올림(plus.js sync 의 cp). 고객 이름은 어디에도 없음. */
(function(){
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pins(){ var a = ls("cpin"); return Array.isArray(a) ? a : []; }
  function save(L){ ls("cpin", L); try { if (window.store){ store.cp = L.map(function(p){ return [p.k, p.id, p.nm, p.mat || null]; }); if (typeof window.save === "function") window.save(); } } catch(x) {} try { if (window.__cpSync) __cpSync(); } catch(x) {} }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function ymd(d){ return d.toISOString().slice(0, 10); }
  function dday(s){ if (!s) return null; var t = new Date(s + "T00:00:00Z"), n = new Date(ymd(kst()) + "T00:00:00Z"); return Math.round((t - n) / 864e5); }
  function addM(s, m){ var d = new Date(s + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + m); return ymd(d); }
  var KN = {krw: "원화 채권", ust: "미국채", aud: "호주국채", brl: "브라질국채", fund: "펀드", els: "ELS"};

  // ---------- 담기 단추: 펼친 상품 카드 안 ----------
  function pinBtns(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot .pd-tap.on > .pd-x:not([data-cp])"), function(p){
      p.setAttribute("data-cp", "1"); var row = p.parentNode, R = __pdObj(row.dataset.x); if (!R) return;
      var k = R.k, o = R.o, it = null;
      if (k === "krw") it = {k: k, id: o.code, nm: o.name, mat: o.mat, cpn: o.cpn, freq: o.freq, issue: o.issue, ctype: o.ctype};
      else if (k === "ust" || k === "aud" || k === "brl") it = {k: k, id: o.name, nm: o.name, mat: o.mat, cpn: o.cpn, freq: 6, issue: o.issue};
      else if (k === "fund" && !o.pv) it = {k: "fund", id: o.c, nm: o.n};
      if (!it || !it.id) return;
      var have = pins().some(function(x){ return x.k === it.k && x.id === it.id; });
      var b = document.createElement("button"); b.className = "em-add cp-pin"; b.type = "button";
      b.textContent = have ? "📌 내 고객 상품에 담겨 있어요" : "📌 내 고객 상품에 담아 두기"; b.disabled = have;
      b.onclick = function(ev){ ev.stopPropagation(); var L = pins(); if (!L.some(function(x){ return x.k === it.k && x.id === it.id; })){ it.at = ymd(kst()); L.push(it); save(L); }
        b.textContent = "📌 담았어요 — 🏠 오늘 맨 위에서 챙겨요"; b.disabled = true; };
      p.appendChild(b);
    });
  }

  // ---------- 챙길 것 계산 ----------
  function bondItems(p){
    var out = [], dm = dday(p.mat);
    if (dm != null && dm >= 0 && dm <= 45) out.push({lv: dm <= 7 ? 2 : 1, t: "만기 D-" + dm + (dm === 0 ? " (오늘)" : "") + " · 재투자 상담", d: p.mat});
    if (p.freq && p.issue && !/복리|할인/.test(p.ctype || "")){
      var t = p.issue, n = 0; while (t < ymd(kst()) && n < 600){ t = addM(t, p.freq); n++; }
      var di = dday(t); if (di != null && di >= 0 && di <= 7) out.push({lv: 1, t: "이자 지급일 D-" + di + (p.cpn ? " (표면 " + p.cpn + "%)" : ""), d: t});
    }
    return out;
  }
  function fundItems(p, F){
    var f = F && F[p.id]; if (!f) return [];
    var out = [];
    if (f.w1 != null && Math.abs(f.w1) >= 3) out.push({lv: Math.abs(f.w1) >= 6 ? 2 : 1, t: "1주 " + (f.w1 > 0 ? "+" : "") + f.w1.toFixed(1) + "% · 고객에게 한마디", d: f.d});
    else if (f.m1 != null && Math.abs(f.m1) >= 5) out.push({lv: 1, t: "1개월 " + (f.m1 > 0 ? "+" : "") + f.m1.toFixed(1) + "%", d: f.d});
    return out;
  }
  function elsItems(it){
    var out = []; if (!it.key || !it.base) return out;
    var pr = String(it.key).split("|"), cyc = +pr[2] || 6, bars = (pr[1] || "").split("-"), t = it.base, k = 0;
    while (t <= ymd(kst()) && k < bars.length){ t = addM(it.base, cyc * (k + 1)); k++; }
    var d = dday(t); if (d != null && d >= 0 && d <= 21) out.push({lv: d <= 7 ? 2 : 1, t: (k === bars.length ? "만기 평가" : k + "차 평가") + " D-" + d + (bars[k - 1] ? " · 배리어 " + bars[k - 1] : ""), d: t});
    return out;
  }
  var FUND = null;
  function funds(){ if (FUND) return FUND; return FUND = fetch("archive/x/products.json?" + Math.floor(Date.now() / 1800e3)).then(function(r){ return r.ok ? r.json() : null; }).then(function(D){ var m = {}; ((D && D.funds) || []).forEach(function(f){ m[f.c] = f; }); return m; }).catch(function(){ return {}; }); }

  // ---------- 🏠 카드 ----------
  function card(){
    var L = pins(), E = (ls("elsmy") || []), all = L.length + E.length;
    var b = document.getElementById("hmbody"); if (!b) return;
    var old = document.getElementById("cpcard");
    if (!all){ if (old) old.remove(); return; }
    funds().then(function(F){
      var rows = [];
      L.forEach(function(p){ (p.k === "fund" ? fundItems(p, F) : bondItems(p)).forEach(function(x){ rows.push({p: p, x: x}); }); });
      E.forEach(function(it){ elsItems(it).forEach(function(x){ rows.push({p: {k: "els", id: it.id, nm: it.nm}, x: x}); }); });
      rows.sort(function(a, b2){ return b2.x.lv - a.x.lv || (a.x.d < b2.x.d ? -1 : 1); });
      var sig = all + "|" + rows.map(function(r){ return r.p.id + r.x.t; }).join(",");
      if (old && old.dataset.sig === sig) return;
      var h = '<section class="card cpc" id="cpcard" data-sig="' + e(sig) + '" data-cz="done"><h3>📌 오늘 내 고객 상품 <span class="mut">' + all + '개 담음</span></h3>' +
        (rows.length ? '<div class="cp-l">' + rows.slice(0, 8).map(function(r){ return '<div class="cp-r lv' + r.x.lv + '"><span class="cp-k">' + e(KN[r.p.k] || r.p.k) + '</span><b>' + e(String(r.p.nm).slice(0, 28)) + '</b><small>' + e(r.x.t) + '</small></div>'; }).join("") + '</div>' +
          (rows.length > 8 ? '<p class="note" style="margin:4px 0 0">외 ' + (rows.length - 8) + '건</p>' : '') :
          '<p class="note" style="margin:0">오늘 챙길 건 없어요 — 만기·이자일 7일 안, 펀드 1주 ±3% 넘게, ELS 평가 3주 안이면 여기 떠요.</p>') +
        '<div class="cp-ft"><button type="button" data-cpm="1">목록 · 빼기</button><span class="mut">채권·펀드는 상품 카드를 펼쳐 📌 담아요 · ELS 는 관제탑</span></div>' +
        '<div id="cpm" hidden></div></section>';
      if (old) old.outerHTML = h; else { var hero = b.querySelector(":scope > .hero, :scope > #tdhero"), box = document.createElement("div"); box.innerHTML = h; var c = box.firstChild; if (hero && hero.nextSibling) b.insertBefore(c, hero.nextSibling); else b.insertBefore(c, b.firstChild); }
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target;
    if (t.closest && t.closest("[data-cpm]")){ ev.stopPropagation(); var m = document.getElementById("cpm"); if (!m) return; m.hidden = !m.hidden; if (!m.hidden) m.innerHTML = pins().map(function(p, i){ return '<div class="cp-r"><span class="cp-k">' + e(KN[p.k] || p.k) + '</span><b>' + e(String(p.nm).slice(0, 30)) + '</b>' + (p.mat ? '<small>만기 ' + e(p.mat) + '</small>' : '') + '<button type="button" data-cpx="' + i + '">✕</button></div>'; }).join("") + ((ls("elsmy") || []).length ? '<p class="note" style="margin:6px 0 0">ELS ' + (ls("elsmy") || []).length + '개는 🎯 ELS 관제탑에서 빼요</p>' : '') + (pins().length ? '' : '<p class="note" style="margin:0">담은 채권·펀드가 없어요</p>'); return; }
    var x = t.closest && t.closest("[data-cpx]"); if (x){ ev.stopPropagation(); var L = pins(); L.splice(+x.dataset.cpx, 1); save(L); var o = document.getElementById("cpcard"); if (o) o.remove(); card(); return; }
  }, true);

  var css = document.createElement("style");
  css.textContent = ".cp-l{display:flex;flex-direction:column;gap:6px}.cp-r{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding:7px 10px;border-radius:10px;background:var(--panel2)}.cp-r.lv2{background:rgba(255,107,107,.12)}" +
    ".cp-k{font-size:11.5px;color:var(--mut,#8a94a8);min-width:52px}.cp-r b{font-size:14px}.cp-r small{width:100%;color:var(--sub,#aab);font-size:12.5px}.cp-r button{margin-left:auto;background:none;border:0;color:var(--mut,#8a94a8);font-size:14px}" +
    ".cp-ft{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px}.cp-ft button{font:inherit;font-size:12.5px;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.cp-pin{margin-top:8px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { pinBtns(); } catch(x) {} try { card(); } catch(x) {} }, 300); }
  try { new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t && t.closest && t.closest("#cpcard")) return; } soon(); }).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
  window.__cpPins = pins;
  soon();
})();
;
__bk(15);
/* ======== onepage.js ======== */
/* 📨 고객에게 보내기 — 한 장 (10/28 사용자 「동료 PB」 ② · 09:57 「CH Investing 지우고 · 내용 조합·압축 · 그림 · 심플」)
   🏠·🌐 → 지금(오늘) 시장 한 장 · 💼 → 오늘의 자산배분 한 장 · 🏦·🎯·📦 → 펼친 상품 한 장.
   화면 캡처가 아니라 앱 자료(실시간 시세·국면·배분·과거 재생)를 골라 캔버스에 새로 그림(1080×1350 PNG):
   숫자 타일 · 업종 막대 · 배분 막대 · 성과 선 · 만기 시간표 · ELS 계단 · 수익률 막대. 앱 이름은 넣지 않음(PB 이름만). 🔒 사모 라인업은 절대 안 들어감. */
(function(){
  var TABS = {home: "시장", market: "시장", sector: "시장", prob: "시장", port: "포트", score: "포트", whale: "신호", cup: "신호", gap: "신호", screen: "신호", sigmore: "신호", bond: "상품", els: "상품", fund: "상품", feed: "피드", onepager: "종목"};
  var SCREENS = {};   // 화면 키 → 한 장 만들기 (아래에서 채움)
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function strip(t){ return String(t || "").replace(/<br\s*\/?>/gi, " ｜ ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function q(){ return "?" + Math.floor(Date.now() / 300000); }
  function pbname(){ var n = ls("pbname"); if (n != null) return n; n = prompt("한 장 위에 넣을 내 이름 (예: 김OO PB · 비워도 돼요)", "") || ""; ls("pbname", n.trim().slice(0, 30)); return ls("pbname") || ""; }
  /* 💌 11/12 사용자 「오늘의 한 장 고객에게 보낼 때 고객 이름 넣는 칸 — 나만을 위해 보냈다는 생각이 들게」
     보내기 창마다 「받는 분」 칸 · 비우면 예전 그대로 · 한 번 보낸 뒤엔 비워짐(다른 고객에게 잘못 가지 않게) · 최근 이름 8개는 칩으로 한 번에 */
  var CLIENT = "";
  function cliLab(){ var c = String(CLIENT || "").replace(/\s+/g, " ").trim(); if (!c) return ""; return /님$/.test(c) ? c : c + " 고객님"; }
  function cliRecent(){ try { var a = JSON.parse(ls("op_clients") || "[]"); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 8) : []; } catch(x){ return []; } }
  function cliSave(){ var c = String(CLIENT || "").trim(); if (!c) return; var a = cliRecent().filter(function(x){ return x !== c; }); a.unshift(c); ls("op_clients", JSON.stringify(a.slice(0, 8))); }
  function cliDone(){ cliSave(); CLIENT = ""; }
  function cliHTML(){ var e = function(t){ return String(t).replace(/[&<>"]/g, ""); }, R = cliRecent();
    return '<label class="opc-n opc-cl">💌 받는 분 <input id="opccl" maxlength="20" placeholder="고객 이름 (예: 홍길동 · 비워도 돼요)" autocomplete="off"></label>' +
      (R.length ? '<div class="opc-rc">' + R.map(function(n){ return '<button type="button" data-cl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<p class="opc-tip">이름을 넣으면 한 장 맨 위에 「○○ 고객님께」로 들어가요</p>'; }
  function cliBind(box){ CLIENT = ""; var I = box.querySelector("#opccl"); if (!I) return;
    I.addEventListener("input", function(){ CLIENT = I.value.trim().slice(0, 20); [].forEach.call(box.querySelectorAll("[data-cl]"), function(b){ b.classList.toggle("on", b.dataset.cl === CLIENT); }); });
    box.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-cl]"); if (!b) return; ev.stopPropagation(); var on = CLIENT !== b.dataset.cl; I.value = on ? b.dataset.cl : ""; I.dispatchEvent(new Event("input")); }, true); }
  // 캔버스 맨 위 한 줄 — 왼쪽 「○○ 고객님께」 · 오른쪽 날짜·보내는 사람 (넘치면 글자를 줄임)
  function headLine(g, name, y, cL, cR, cN){
    var d = kst(), ds = d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + "일월화수목금토"[d.getUTCDay()] + ")", cl = cliLab();
    if (!cl){ g.fillStyle = cL; font(g, 600, 24); g.fillText(ds, MX, y); if (name){ g.textAlign = "right"; g.fillStyle = cN || cL; font(g, 700, 24); g.fillText(name, W - MX, y); g.textAlign = "left"; } return; }
    var L = "💌 " + cl + "께", Rt = ds.replace(/^\d+년 /, "") + (name ? " · " + name + " 드림" : ""), fs = 30, fr = 22;
    for (var k = 0; k < 8; k++){ font(g, 800, fs); var lw = g.measureText(L).width; font(g, 600, fr); var rw = g.measureText(Rt).width; if (lw + rw + 28 <= CW) break; if (fs > 24) fs -= 2; else if (fr > 17) fr -= 1; else break; }
    g.fillStyle = cR; font(g, 800, fs); g.fillText(L, MX, y + 2);
    g.textAlign = "right"; g.fillStyle = cN || cL; font(g, 600, fr); g.fillText(Rt, W - MX, y); g.textAlign = "left";
  }
  function pct(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0] : null; }
  function yrs(mat){ var t = (new Date(mat + "T00:00:00Z") - kst()) / 365.25 / 864e5; return t > 0 ? t : 0; }
  function num(s){ var m = /[−\-]?\d+(\.\d+)?/.exec(String(s || "").replace("−", "-")); return m ? +m[0] : null; }

  /* ───────────── 내용 ───────────── */
  // 🌐 시장: 숫자 타일(코스피·코스닥·오른 종목·S&P 선물) + 업종 막대 + 국면 칩 + 할 말 3줄 + 오늘 일정 + 배분 한 줄
  function kospiHist(){   // 최근 25거래일 코스피 종가 (port_px) — 한 달 흐름 선
    return gj("archive/x/port_px/index.json" + q()).then(function(ix){ var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return gj("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, "")).then(function(j){ if (!j || !j.dd) return null; var c = j.c.slice(-25).map(Number); return c; }); }).catch(function(){ return null; });
  }
  // 🌐 시장 한 장 — 고객이 한눈에: 코스피 큰 숫자+오늘 흐름+한 달 흐름 · 세계 시장 타일 · 업종 열지도 · 시장 온도(오른 종목) · 테마 · 환율·유가·금 · 일정 · 자산배분
  function mkMarket(){
    var it = latest("market");
    return Promise.all([window.__pbbrief ? __pbbrief() : null, gj("archive/x/live_kr.json" + q()), gj("archive/x/live_us_pre.json" + q()), it ? gj(file("market", it.id, "data.json")) : null, gj(RAWM + "ledger/ledger.json"), kospiHist(), gj("archive/x/wl_live.json" + q()), gj(RAWM + "market/bear.json" + q())]).then(function(r){
      var PB = r[0], L = r[1], U = r[2], D = r[3] || {}, LG = r[4], KH = r[5], WLJ = r[6], BR = r[7];
      var live = !!(L && L.date === today() && L.index && L.index.length), liveMode = !!(PB && PB.mode === "장중" && live);
      var ix = {}; (live ? L.index : []).forEach(function(x){ ix[x.name] = x; });
      var ks = ix["코스피"] || {}, kq = ix["코스닥"] || {};
      var snaps = live ? (L.snaps || []).map(function(x){ return {t: x[0], k: x[3], q: x[4]}; }) : [];
      var hero = live ? {name: "코스피", last: ks.last, chg: ks.chg, sub: "코스닥 " + pct(kq.chg) + (kq.last ? " · " + Math.round(kq.last).toLocaleString() : ""), intra: snaps.length >= 3 ? snaps : null, hist: KH, t: L.t} : null;
      var fut = U && U.date === today() ? (U.fut || []) : [], mac = U && U.date === today() ? (U.macro || []) : [], wd = U && U.date === today() ? (U.world || []) : [];
      var F = function(arr, nm){ return arr.filter(function(f){ return f.name === nm; })[0]; };
      var world = [];
      var es = F(fut, "S&P500 선물"), nq = F(fut, "나스닥100 선물");
      if (es) world.push({f: "🇺🇸", n: "미국 선물", v: es.chg, s: nq ? "나스닥 " + pct(nq.chg) : ""});
      [["🇯🇵", "닛케이225", "일본"], ["🇭🇰", "항셍", "홍콩"], ["🇨🇳", "상해종합", "중국"], ["🇪🇺", "유로스톡스50", "유럽"], ["🇮🇳", "인도 니프티", "인도"]].forEach(function(w){ var x = F(wd, w[1]); if (x && world.length < 6) world.push({f: w[0], n: w[2] + (x.st === "prev" ? " · 전일" : ""), v: x.chg}); });
      var heat = live ? (L.sectors || []).filter(function(x){ return x.n >= 5; }).map(function(x){ var nm = x.name.replace(/\(.*?\)/g, ""); if (nm.length > 6) nm = nm.split("·")[0]; return {n: nm.slice(0, 7), ic: x.icon || "", v: x.r}; }) : [];
      var gauge = live && L.total ? {up: L.up, down: L.down, flat: L.flat, total: L.total, lu: L.limit_up || 0, ld: L.limit_dn || 0} : null;
      var themes = live ? (L.themes || []).slice(0, 3).map(function(t){ return {n: t.name.replace(/\(.*?\)/g, "").slice(0, 10), v: t.r, s: (t.lead || []).slice(0, 3).map(function(x){ return x.n; }).join(" · ")}; }) : [];
      var k2 = [];
      [["원/달러", "원/달러"], ["WTI", "유가 WTI"], ["금", "금"], ["미 10년물 국채 선물", "미 10년 국채"]].forEach(function(w){ var x = F(mac, w[0]);
        if (w[0] === "원/달러"){   // 💱 환율은 「1,331원 ▲2.3원」 — % 아니라 원으로 · wl_live 10분마다 값
          var fx = WLJ && WLJ.fx && WLJ.fx.t && WLJ.fx.t.slice(0, 10) === today() ? WLJ.fx : x ? {p: x.last, prev: x.chg != null ? x.last / (1 + x.chg / 100) : null, t: ""} : null;
          if (fx && fx.p){ var dw = fx.prev ? fx.p - fx.prev : null; k2.push({l: "원/달러" + (fx.t ? " " + fx.t.slice(11, 16) : ""), v: (Math.round(fx.p * 10) / 10).toLocaleString() + "원", neutral: true, s: dw == null ? "" : (dw > 0 ? "▲" : dw < 0 ? "▼" : "") + Math.abs(dw).toFixed(1) + "원"}); }
          return; }
        if (x) k2.push({l: w[1], v: pct(x.chg)}); });
      var reg = (PB && PB.regime) || "";
      var chips = reg ? reg.split("·").map(function(x){ return x.trim(); }).filter(Boolean) : [];
      var ev = (PB && PB.events) || [];
      var al = (LG && LG.allocation || []).filter(function(a){ return a.pct > 0; });
      if (!al.length) (D.allocation_seen || []).forEach(function(a, i){ var m = /([\d.]+)/.exec(a.verdict || ""); if (m && +m[1] > 0) al.push({name: ["S&P500", "나스닥100", "금", "현금"][i] || "", pct: +m[1]}); });
      var lab = live ? (L.t || "") + " 장중" : (PB && PB.label) || (md(D.date) + " 아침");
      var top2 = heat.slice().sort(function(a, b){ return b.v - a.v; }).slice(0, 2).map(function(x){ return x.n; }).join("·");
      var word = !live ? "" : ks.chg >= 3 ? "급등" : ks.chg >= 1 ? "강세" : ks.chg > -1 ? "보합" : ks.chg > -3 ? "약세" : "급락";
      var head = live ? "코스피 " + pct(ks.chg) + " " + word + (top2 ? " · " + top2 + " 주도" : "") + (gauge ? " · 종목 " + Math.round(gauge.up / gauge.total * 100) + "% 상승" : "") : (D.one_liner ? strip(D.one_liner).split(" — ")[0].slice(0, 44) : "");
      // 오늘 핵심 3줄 (업종 · 세계 · 앞으로)
      var key = [], hs = heat.slice().sort(function(a, b){ return b.v - a.v; });
      if (live && hs.length){ var big = ks.chg >= 0 ? hs : hs.slice().reverse(); key.push([ks.chg >= 0 ? "🚀" : "🧊", big.slice(0, 2).map(function(x){ return x.n + " " + pct(x.v); }).join(" · ") + (ks.chg >= 0 ? "가 끌어올린 날" : "가 끌어내린 날")]); }
      if (world.length){ var upN = world.filter(function(w){ return w.v > 0; }).length; key.push(["🌏", (upN === world.length ? "세계 증시 모두 올라요" : upN === 0 ? "세계 증시 모두 내려요" : "세계 증시 " + world.length + "곳 중 " + upN + "곳 상승") + " — " + world.slice(0, 2).map(function(w){ return w.n.replace(" · 전일", "") + " " + pct(w.v); }).join(" · ")]); }
      var wl0 = PB && PB.advice ? liveWatch(PB.advice.watch) : []; if (wl0[0]) key.push(["📅", wl0[0][0] + " " + wl0[0][1]]);
      else if (gauge) key.push(["🌡️", "종목 " + Math.round(gauge.up / gauge.total * 100) + "%가 올랐어요 · 상한가 " + gauge.lu]);
      try { if (window.__flowJ){ var R_ = (__flowJ.mkt || {}).KOSPI || [], r_ = R_[0]; if (r_ && r_.f != null){ var U_ = Math.abs(r_.f) > 1e6 ? 1e8 : 1, w_ = function(v){ v /= U_; var a = Math.abs(v); return (v >= 0 ? "+" : "−") + (a >= 10000 ? (a / 10000).toFixed(1) + "조" : Math.round(a).toLocaleString() + "억"); };
        var fl_ = ["🧲", "외국인 " + w_(r_.f) + " · 기관 " + w_(r_.i) + " · 개인 " + w_(r_.p) + " (코스피 " + Number(r_.d.slice(5, 7)) + "/" + Number(r_.d.slice(8)) + ")"];   // 🧲 11/10 #3 수급 한 줄
        if (key.length >= 3 && key[2][0] === "🌡️") key[2] = fl_; else if (key.length < 3) key.push(fl_); else key.splice(2, 0, fl_); key = key.slice(0, 3); } } } catch(x) {}
      var stars = live ? (L.value || []).slice(0, 5).map(function(x){ return {n: x.n, p: x.p, r: x.r, v: x.v}; }) : null;
      var adv = PB && PB.advice && PB.asof && PB.asof.slice(0, 10) === today() ? Object.assign({}, PB.advice, {watch: liveWatch(PB.advice.watch)}) : null;
      if (adv && live && ks.chg != null) adv.read = String(adv.read).replace(/(코스피[가는]? (?:오늘(?:도)? )?)[+−\-]?\d+(\.\d+)?%/, "$1" + pct(ks.chg));   // 매시간 글 ↔ 지금 숫자 맞춤
      // 🧊 11/09 ④ 하락장 판정을 고객 한 장에도 — 코스피가 하락장·조정이면 「주식 비중 그대로」 대신 계기판 권고를 먼저 (S&P 200일선만 보던 것)
      var bk = BR && (BR.markets || []).filter(function(m){ return m.key === "kospi"; })[0], bearN = null;
      if (bk && (bk.state === "🐻" || bk.state === "🟡")){
        bearN = {h: (bk.state === "🐻" ? "🐻 코스피 하락장" : "🟡 코스피 조정") + " · 고점보다 " + pct(bk.dd), t: String(bk.advice || BR.lead || "").replace(/^코스피 (하락장|조정)\s*—\s*/, ""), tone: "warn", max: 3};
        var kq_ = (BR.markets || []).filter(function(m){ return m.key === "kosdaq"; })[0];
        if (bk.analog) bearN.t = "코스피는 주식 " + bk.analog.stock + "% — " + bk.analog.next + (kq_ && kq_.analog ? " · 코스닥은 주식 " + kq_.analog.stock + "% — " + kq_.analog.next : "") + " (지금 장과 닮았던 과거 12번에서 가장 나았던 방식)";
        var on_ = bk.analog ? 0 : (bk.checks || []).filter(function(c){ return c.on && (c.use == null || c.use); }).length;   // 🌱 11/09 시장별 다시 사기 규칙(rule)
        if (bk.analog || (bk.rule && !bk.nuse)){} else if (bk.checks && bk.checks.length) bearN.t += " · 다시 사는 조건 " + on_ + "/" + (bk.nuse || bk.checks.length) + "개 켜짐";
        var sp_ = (BR.markets || []).filter(function(m){ return m.key === "sp500"; })[0];   // 🧭 11/10 결론 통일 — 해외 ETF 포트는 S&P500 판정을 따름
        if (sp_ && sp_.state !== bk.state) bearN.t += " | 🌏 해외 주식(포트)은 S&P500 " + sp_.state + (sp_.state === "🟢" ? " 정상 → 배분 그대로" : " → " + (sp_.to || "현금") + " " + (sp_.cash || 0) + "%");
        bearN.max = 4;
        if (adv && adv.plan) adv.plan = adv.plan.filter(function(x){ return !/상승 추세|비중을 그대로/.test(x); });
      }
      // 🧊 11/09 ⑰ 「다음에 볼 것」 한 줄 — 오늘이 아닌 가장 가까운 일정 → 고객이 다음 한 장을 기다리게
      var nx_ = adv && (adv.watch || []).filter(function(w){ return w[0] !== "오늘"; })[0], nextN = nx_ ? {h: "👀 다음에 볼 것", t: nx_[0] + " — " + String(nx_[1]).split(" · ")[0], tone: "dark", max: 2} : null;
      var rebN = window.__rebNote && live ? __rebNote(BR, ks.chg) : null;   // 📨 11/10 A11/10-1 이번 하락장 반등 날 기록 (반등 날에만 · ux1110.js)
      return {kind: "market", bear: bearN, reb: rebN, next: nextN, title: liveMode ? "지금 시장 한 장" : "오늘 시장 한 장", sub: lab + (head ? " · " + head : ""), label: lab, key: key.length >= 2 ? key : null, stars: stars && stars.length >= 3 ? stars : null,
        advice: adv,
        hero: hero, world: world.length ? world : null, heat: heat.length >= 8 ? heat : null, gauge: gauge, chips: chips, events: ev,
        themes: themes.length ? {title: "오늘 뜨는 테마 — 대장주", items: themes} : null, kpis2: k2.slice(0, 4),
        alloc: al.length ? al.map(function(a){ return {n: a.name.replace(" 코어", ""), pct: a.pct}; }) : null,
        note: liveMode ? "장중 시세는 10~15분 늦을 수 있어요" : null};
    });
  }
  // 💼 포트: 배분 막대(큰) + 국면 + 성과 선(배분 vs S&P) + 담는 상품
  function mkPort(){
    var it = latest("market");
    return Promise.all([gj(RAWM + "ledger/ledger.json"), gj(RAWM + "market/home.json"), it ? gj(file("market", it.id, "data.json")) : null]).then(function(r){
      var LG = r[0], H = r[1], D = r[2] || {};
      var al = (LG && LG.allocation || []).filter(function(a){ return a.pct > 0; });
      if (!al.length){ var NM = ["S&P500 코어", "나스닥100 코어", "금", "현금·단기채"], IN = ["TIGER 미국S&P500 360750", "TIGER 미국나스닥100 133690", "TIGER KRX금현물 0072R0", "TIGER CD금리 499660"];
        (D.allocation_seen || []).forEach(function(a, i){ var m = /([\d.]+)/.exec(a.verdict || ""); if (m && +m[1] > 0) al.push({name: NM[i] || "", pct: +m[1], instruments: IN[i] || ""}); }); }
      if (!al.length) return null;
      var P = (H && H.port) || {}, nav = null, spy = null;
      try { nav = typeof P.nav === "string" ? JSON.parse(P.nav) : P.nav; spy = typeof P.spy_line === "string" ? JSON.parse(P.spy_line) : P.spy_line; } catch(x) {}
      var badge = D.decision && D.decision.badges ? strip(D.decision.badges[0]) : "";
      var why = (D.allocation_seen || []).map(function(a, i){ return {n: ["S&P500", "나스닥100", "금", "현금"][i] || "", s: strip(a.seen), v: strip(a.verdict)}; }).filter(function(x){ return x.s; });
      var sch = (D.schedule || []).slice(0, 3).map(function(x){ return {n: strip(x.when), s: strip(x.what)}; });
      return {kind: "port", title: "오늘의 자산배분 제안", why: why.length ? {title: "오늘 국면 근거 — 본 것 → 판정", items: why} : null, sched: sch.length ? {title: "앞으로 볼 일정", items: sch} : null, sub: (P.asof ? md(P.asof) + " 기준 · " : "") + "지수 ETF 뼈대 · 레버리지 없음",
        chips: badge ? [badge] : [], alloc: al.map(function(a){ return {n: a.name.replace(" 코어", ""), pct: a.pct, s: a.sleeve ? "업종 ETF 묶음 — 리포트의 섹터 판단대로" : strip(a.instruments).split("/")[0].trim()}; }),
        line: nav && spy && nav.length > 3 ? {a: nav, b: spy, la: "이 배분", lb: "S&P500", from: md(P.start)} : null,
        kpis: P.start ? [{l: md(P.start) + "부터 이 배분", v: pct(P.base)}, {l: "같은 기간 S&P500", v: pct(P.spy)}] : [],
        bullets: ["주식의 80%는 미국 대표 지수(S&P500·나스닥100) ETF, 20%는 리포트가 고른 업종 ETF로 담아요", "시장이 꺾이면(S&P500이 200일 평균 아래) 주식을 줄이고 금·현금을 늘려요 · 레버리지 없음"],
        note: "시장 국면(S&P500 200일선)에 따라 비중이 바뀌는 규칙 · 개별 종목 추천 아님"};
    });
  }
  function selected(){ var row = document.querySelector("#pdroot .pd-tap.on"); if (!row || !window.__pdObj) return null; var R = __pdObj(row.dataset.x); return R && R.o ? R : null; }
  function mkProduct(R){
    var k = R.k, o = R.o;
    if (k === "pv" || k === "pvl" || (o && o.pv === true)) return Promise.resolve({refuse: "사내 사모 라인업은 고객용 한 장에 넣지 않아요"});
    if (k === "krw"){
      var y = yrs(o.mat), A = 1000;
      var kp = [{l: "세후 수익률 (연)", v: o.after != null ? o.after.toFixed(2) + "%" : "–", big: true}, {l: "예금으로 치면", v: o.bank != null ? o.bank.toFixed(2) + "%" : "–", neutral: true}, {l: "표면금리", v: o.cpn != null ? o.cpn + "%" : "–", neutral: true}];
      var tiles = [{l: "1,000만원 넣으면", v: o.after != null ? "약 " + Math.round(A * o.after / 100 * y).toLocaleString() + "만원" : "–", s: "만기까지 세후 이자 합 (대략)"}, {l: "한 해 세후 이자", v: o.after != null ? "약 " + Math.round(A * o.after / 100) + "만원" : "–", s: o.freq ? "한 번에 약 " + Math.round(A * (o.cpn || 0) / 100 / (12 / o.freq) * 0.846) + "만원씩" : ""}, {l: "이자 받는 주기", v: o.freq ? o.freq + "개월마다" : (o.ctype || "–"), s: o.redeem || "만기일시상환"}];
      var RK = {"매우낮은위험": 1, "낮은위험": 2, "보통위험": 3, "다소높은위험": 4, "높은위험": 5, "매우높은위험": 6};
      return gj("archive/x/products.json" + q()).then(function(PD){
        var same = ((PD && PD.krw) || []).filter(function(b){ return b.kind === o.kind && b.after != null; }).sort(function(a, b){ return b.after - a.after; });
        var rank = same.findIndex(function(b){ return b.code === o.code; }), med = same.length ? same[Math.floor(same.length / 2)].after : null;
        var cmp = same.length >= 3 ? {title: "같은 종류(" + o.kind + ") 세후 수익률 — 이 채권은 " + (rank + 1) + "위 / " + same.length + "개", items: [{n: "이 채권", v: o.after}, {n: "같은 종류 중간값", v: med}, {n: "같은 종류 최고", v: same[0].after}, {n: "같은 종류 최저", v: same[same.length - 1].after}], plain: true} : null;
        return {kind: "bond", title: o.name, sub: "원화 채권 · " + o.kind + (o.risk ? " · " + o.risk : "") + (o.issue ? " · 발행 " + o.issue.slice(0, 7).replace("-", ".") : ""), kpis: kp, tiles: tiles, risk: RK[o.risk] || null, riskTitle: "위험 등급 (" + (o.risk || "") + ")",
          timeline: {from: today(), to: o.mat, freq: o.freq, label: y < 1 ? "만기까지 " + Math.round(y * 12) + "개월" : "만기까지 " + y.toFixed(1) + "년"}, cmp: cmp,
          bullets: [o.kind === "국채" ? "대한민국 정부가 갚는 채권이라 부도 걱정은 거의 없어요" : o.kind === "공사채·지방채" ? "공기업·지자체가 발행 — 사실상 정부가 뒤에 있어요" : o.kind === "신종·후순위" ? "은행·금융사가 발행 — 이자가 높은 대신 갚는 순서가 뒤예요" : "회사가 발행한 채권 — 회사가 갚을 힘(신용등급)이 핵심이에요",
            (o.freq ? "이자는 " + o.freq + "개월마다 통장으로, 원금은 만기에 돌려받아요" : "이자와 원금을 만기에 한 번에 받아요"), "「예금으로 치면」은 같은 돈을 예금에 넣었을 때 필요한 세전 금리예요", "중간에 팔 수도 있어요 — 그날 시장 가격으로"],
          note: "세후 수익률은 매수 시점 가격 기준 · 중도 매도 시 가격이 바뀔 수 있어요"};
      });
    }
    if (k === "ust" || k === "aud" || k === "brl"){
      var y2 = yrs(o.mat);
      return Promise.resolve({kind: "bond", title: o.name, sub: (o.kind || "해외 국채") + " · " + (o.cur || ""), kpis: [{l: "만기수익률 (연 · " + (o.cur || "") + ")", v: o.ytm != null ? o.ytm + "%" : "–", big: true}, {l: "표면금리", v: o.cpn != null ? o.cpn + "%" : "–", neutral: true}],
        timeline: {from: today(), to: o.mat, freq: 6, label: "만기까지 " + y2.toFixed(1) + "년"}, bullets: ["원화로 바꾸면 환율만큼 더하거나 빠져요"], note: "환율 변동에 따라 원화 수익이 달라져요"});
    }
    if (k === "els"){
      var bars = (String(o.desc || "").split("(")[0].match(/\d+/g) || []).map(Number), ua = String(o.ua || "").split(/,\s*/).filter(Boolean);
      return gj("archive/x/els_replay.json" + q()).then(function(Rp){
        var key = Rp && Rp.by_id && Rp.by_id[o.isin], st = key && Rp.stats && Rp.stats[key];
        var C = {kind: "els", title: o.n, sub: (o.t || "ELS") + " · " + (o.kind || "") + " · 만기 " + (o.mat || "") + " · " + (o.cyc || "") + "마다 평가", chips: ua,
          kpis: [{l: "연 수익률 (조건 충족 시)", v: o.cpn != null ? o.cpn + "%" : "–", big: true}, {l: "낙인(KI)", v: o.ki != null ? o.ki + "%" : (o.pp >= 100 ? "원금지급형" : "없음"), neutral: true}, {l: "청약 마감", v: o.e ? md(o.e) : "–", neutral: true}],
          steps: bars.length ? {bars: bars, ki: o.ki} : null, note: "조건 미충족 시 원금 손실 가능 · 과거 계산은 미래를 보장하지 않아요"};
        var cycM = parseInt(o.cyc) || 6, bar0 = bars[0], barL = bars[bars.length - 1];
        C.bullets = [cycM + "개월마다 평가 — 기초자산 모두가 처음 가격의 " + bar0 + "% 위면 연 " + (o.cpn != null ? o.cpn : "–") + "% 쿠폰과 함께 상환",
          o.ki != null ? "만기까지 한 번도 " + o.ki + "%(낙인) 아래로 안 가면 마지막 평가는 " + barL + "%만 넘어도 상환" : "만기 평가는 " + barL + "% — 못 넘으면 그만큼 손실",
          "가장 많이 빠진 기초자산 하나가 기준 — 두세 개 중 하나만 무너져도 조건 미충족"];
        if (st && st.n && st.k){ C.prob = {k: st.k, n: st.n};
          var worst = st.worst ? Object.keys(st.worst).sort(function(a, b){ return st.worst[b] - st.worst[a]; })[0] : null;
          C.tiles = [{l: "손실로 끝난 경우", v: (st.loss != null ? st.loss.toFixed(1) : "–") + "%", s: st.loss_avg != null ? "평균 " + st.loss_avg.toFixed(0) + "% · 최악 " + (st.loss_worst || 0).toFixed(0) + "%" : "손실 사례 없음"},
            {l: "1년 안 상환", v: Math.round(st.k[Math.min(st.k.length - 1, Math.max(0, Math.round(12 / cycM) - 1))]) + "%", s: st.from + "년~ " + st.n.toLocaleString() + "번 재생"},
            {l: "발목 잡은 기초자산", v: worst ? worst.slice(0, 8) : "–", s: worst ? "손실 사례의 " + st.worst[worst] + "%" : ""}]; }
        return C;
      });
    }
    if (k === "fund"){
      var rr_ = [["1개월", o.m1], ["3개월", o.m3], ["6개월", o.m6], ["1년", o.y1], ["3년", o.y3], ["5년", o.y5]].filter(function(x){ return x[1] != null; });
      return gj("archive/x/products.json" + q()).then(function(PD){
        var same = ((PD && PD.funds) || []).filter(function(f){ return f.t === o.t && f.y1 != null; }).sort(function(a, b){ return b.y1 - a.y1; });
        var rank = same.findIndex(function(f){ return f.c === o.c; });
        var since = o.est ? String(o.est).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2") : "";
        return {kind: "fund", title: o.n, sub: (o.co || "") + " · " + (o.t || "") + (o.st ? " · " + o.st : "") + (since ? " · 설정 " + since : ""), chips: o.rk ? ["위험 " + o.rk + "등급 (1 높음 ~ 6 낮음)"] : [],
          kpis: [{l: "1년 수익률", v: pct(o.y1), big: true}, {l: "총보수 (연)", v: o.fee != null ? o.fee + "%" : "–", neutral: true}, {l: "선취 수수료", v: o.sfee ? o.sfee + "%" : "없음", neutral: true}],
          tiles: rank >= 0 ? [{l: (o.t || "같은 유형") + " " + same.length + "개 중", v: (rank + 1) + "위", s: "1년 수익률 기준"}, {l: "같은 유형 가운데", v: pct(same[Math.floor(same.length / 2)].y1), s: "1년 수익률 중간값"}] : null,
          risk: o.rk ? +o.rk : null,
          bars: rr_.length ? {title: "기간별 수익률 (보수 차감 후)", items: rr_.map(function(x){ return {n: x[0], v: x[1]}; })} : null,
          bullets: [/채권/.test(o.t || "") ? "채권에 투자해 이자를 쌓는 펀드 — 금리가 오르면 잠깐 흔들릴 수 있어요" : /주식/.test(o.t || "") ? (/해외/.test(o.t) ? "해외 주식에 투자하는 펀드 — 시장과 환율에 따라 움직여요" : "주식에 투자하는 펀드 — 시장이 빠지면 같이 빠져요") : "여러 자산에 나눠 투자하는 펀드예요", "수익률은 보수를 뺀 뒤 숫자예요 · 환매는 보통 며칠 걸려요"],
          note: "기준일 " + (o.d ? String(o.d).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3") : "") + " · 과거 성과는 미래 수익을 보장하지 않아요"};
      });
    }
    return Promise.resolve(null);
  }

  /* ───────────── 그리기 ───────────── */
  var W = 1080, H = 1620, MX = 60, CW = W - MX * 2;   // 시장 한 장은 1920 (코멘트까지)
  var INK = "#141414", SUB = "#6a6f7a", MUT = "#9aa0ab", LINE = "#e6e8ec", UP = "#d6453d", DN = "#2f6fdd", ACC = "#1f2d4d", BG = "#f7f7f5", TILE = "#ffffff";
  var F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  // 10/28 「숫자표기 세자리수마다 ,」 — 한 장에 그리는 모든 글자에서 4자리 이상 숫자에 쉼표 (연도·코드·시각·날짜는 그대로)
  function commaTxt(t){
    t = String(t);
    return t.replace(/(^|[^\d.,:\/\-A-Za-z])(\d{4,})(?=(\.\d+)?)(?![\d]|년|\.K|\.T|\.S|\.H|\))/g, function(m, pre, n, dec, off){
      var after = t.charAt(off + m.length);
      if (/^(19|20)\d\d$/.test(n) || /^0/.test(n) || after === "-" || /[-)]$/.test(pre) || /[A-Za-z]/.test(after) || (n.length === 6 && !/[원억조만%배개주달명]/.test(after))) return m;   // 연도·종목코드(360750·0072R0)는 그대로
      return pre + n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });
  }
  function ctx2d(c){
    var g = c.getContext("2d"), ft = g.fillText.bind(g), mt = g.measureText.bind(g);
    g.fillText = function(t, x, y, w){ return w === undefined ? ft(commaTxt(t), x, y) : ft(commaTxt(t), x, y, w); };
    g.measureText = function(t){ return mt(commaTxt(t)); };
    return g;
  }
  function font(g, w, s){ g.font = w + " " + s + "px " + F; }
  function rr(g, x, y, w, h, r, fill){ g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }
  function cls(v){ var n = typeof v === "number" ? v : num(v); return n == null || n === 0 ? INK : n > 0 ? UP : DN; }
  function wrap(g, text, x, y, w, lh, max){
    var out = [], line = "", ch = String(text).split("");
    for (var i = 0; i < ch.length; i++){ var t = line + ch[i]; if (g.measureText(t).width > w && line){ var sp = line.lastIndexOf(" "); if (sp > line.length * 0.45 && ch[i] !== " "){ out.push(line.slice(0, sp)); line = line.slice(sp + 1) + ch[i]; } else { out.push(line); line = ch[i] === " " ? "" : ch[i]; } } else line = t; }   // 낱말 중간에서 안 끊기게(띄어쓰기에서)
    if (line) out.push(line);
    if (out.length > (max || 3)){ out = out.slice(0, max || 3); out[out.length - 1] = out[out.length - 1].replace(/.{2}$/, "…"); }
    out.forEach(function(l, i){ g.fillText(l, x, y + i * lh); });
    return out.length * lh;
  }
  function nLines(g, text, w, max){ var n = 0, line = "", ch = String(text).split(""); for (var i = 0; i < ch.length; i++){ var t = line + ch[i]; if (g.measureText(t).width > w && line){ var sp = line.lastIndexOf(" "); n++; if (sp > line.length * 0.45 && ch[i] !== " ") line = line.slice(sp + 1) + ch[i]; else line = ch[i] === " " ? "" : ch[i]; } else line = t; } if (line) n++; return Math.min(n, max || 3); }
  function liveWatch(W_){   // 이미 지난 오늘 일정(「09시 …」)은 빼기
    var hh = kst().getUTCHours();
    return (W_ || []).map(function(w){ if (w[0] !== "오늘") return w; var parts = String(w[1]).split(" · ").filter(function(x){ var m = /^(\d{1,2})시/.exec(x.trim()); return !m || +m[1] > hh; }); return parts.length ? [w[0], parts.join(" · ")] : null; }).filter(Boolean);
  }
  function bKpis(g, y, K){
    if (!K || !K.length) return 0;
    var n = Math.min(K.length, 4), gap = 16, w = (CW - gap * (n - 1)) / n, big = K.some(function(k){ return k.big; }), h = big ? 150 : 126;
    K.slice(0, n).forEach(function(k, i){
      var x = MX + i * (w + gap);
      rr(g, x, y, w, h, 20, TILE);
      g.fillStyle = SUB; font(g, 600, 23); wrap(g, k.l, x + 20, y + 40, w - 36, 26, 1);
      var vs = k.big ? 58 : 44, vy = y + (k.big ? 112 : 96);
      g.fillStyle = k.neutral ? INK : cls(k.v); font(g, 800, vs); var vw = g.measureText(k.v).width;
      if (vw > w - 40){ font(g, 800, Math.floor(vs * (w - 40) / vw)); vw = g.measureText(k.v).width; }
      g.fillText(k.v, x + 20, vy);
      if (k.s){ g.fillStyle = MUT; font(g, 500, 21); if (vw + 14 + g.measureText(k.s).width < w - 36) g.fillText(k.s, x + 20 + vw + 12, vy); else g.fillText(k.s, x + 20, vy + 26); }
    });
    return h + 24;
  }
  function bChips(g, y, C){
    if (!C || !C.length) return 0;
    var x = MX; font(g, 600, 24);
    C.forEach(function(c){ var w = g.measureText(c).width + 32; if (x + w > W - MX) return; rr(g, x, y, w, 44, 22, "#e9ecf3"); g.fillStyle = ACC; g.fillText(c, x + 16, y + 30); x += w + 10; });
    return 44 + 22;
  }
  function bBars(g, y, B){
    if (!B || !B.items || !B.items.length) return 0;
    var items = B.items, n = items.length, rowH = 44, lw = 230, bx = MX + lw + 16, bw = CW - lw - 16 - 120;
    var h = 36 + n * rowH + 14; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(B.title, MX + 22, y + 32);
    var mx = Math.max.apply(null, items.map(function(i){ return Math.abs(i.v); }).concat([0.1])), zero = B.plain ? bx : bx + bw / 2;
    items.forEach(function(it, i){
      var yy = y + 36 + i * rowH + 10;
      g.fillStyle = INK; font(g, 600, 24); wrap(g, it.n, MX + 22, yy + 24, lw - 10, 26, 1);
      var len = Math.abs(it.v) / mx * (B.plain ? bw - 6 : bw / 2 - 6);
      g.fillStyle = "#eef0f4"; g.fillRect(bx, yy + 8, bw, 20);
      g.fillStyle = B.plain ? (i === 0 ? ACC : "#9aa0ab") : it.v >= 0 ? UP : DN; g.fillRect(it.v >= 0 ? zero : zero - len, yy + 8, Math.max(2, len), 20);
      g.fillStyle = B.plain ? INK : cls(it.v); font(g, 800, 26); g.textAlign = "right"; g.fillText(B.plain ? (+it.v).toFixed(2) + "%" : pct(it.v), W - MX - 22, yy + 26); g.textAlign = "left";
    });
    return h + 24;
  }
  var COLS = ["#1f2d4d", "#3b5bdb", "#d9a441", "#8a94a8"];
  function bAlloc(g, y, A, big){
    if (!A || !A.length) return 0;
    if (!big){
      var h = 36 + 56 + 6; rr(g, MX, y, CW, h, 20, TILE);
      g.fillStyle = SUB; font(g, 700, 24); g.fillText("오늘의 자산배분 제안", MX + 22, y + 32);
      var x = MX + 22, bw = CW - 44, yy = y + 46;
      A.forEach(function(a, i){ var w = bw * a.pct / 100; g.fillStyle = COLS[i % 4]; g.fillRect(x, yy, w, 22); x += w; });
      x = MX + 22; font(g, 600, 21);
      A.forEach(function(a, i){ g.fillStyle = COLS[i % 4]; g.fillRect(x, yy + 34, 14, 14); g.fillStyle = INK; var t = a.n + " " + a.pct + "%"; g.fillText(t, x + 20, yy + 47); x += g.measureText(t).width + 40; });
      return h + 24;
    }
    var h2 = 20 + A.length * 84 + 10; rr(g, MX, y, CW, h2, 20, TILE);
    A.forEach(function(a, i){
      var yy = y + 20 + i * 84;
      g.fillStyle = INK; font(g, 700, 30); g.fillText(a.n, MX + 22, yy + 30);
      g.fillStyle = COLS[i % 4]; font(g, 800, 36); g.textAlign = "right"; g.fillText(a.pct + "%", W - MX - 22, yy + 32); g.textAlign = "left";
      g.fillStyle = "#eef0f4"; g.fillRect(MX + 22, yy + 42, CW - 44, 14); g.fillStyle = COLS[i % 4]; g.fillRect(MX + 22, yy + 42, (CW - 44) * a.pct / 100, 14);
      if (a.s){ g.fillStyle = MUT; font(g, 500, 21); g.fillText(a.s, MX + 22, yy + 76); }
    });
    return h2 + 24;
  }
  function bLine(g, y, L){
    if (!L) return 0;
    var h = 250; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText((L.from ? L.from + "부터 " : "") + L.la + " vs " + L.lb, MX + 22, y + 32);
    var x0 = MX + 22, x1 = W - MX - 22, y0 = y + 56, y1 = y + h - 44, all = L.a.concat(L.b), mn = Math.min.apply(null, all), mx = Math.max.apply(null, all); if (mx === mn) mx = mn + 1;
    var X = function(i, n){ return x0 + (x1 - x0) * i / Math.max(1, n - 1); }, Y = function(v){ return y1 - (v - mn) / (mx - mn) * (y1 - y0); };
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke();
    [[L.b, "#9aa0ab", 4], [L.a, ACC, 6]].forEach(function(s){ var v = s[0]; g.strokeStyle = s[1]; g.lineWidth = s[2]; g.lineJoin = "round"; g.beginPath(); v.forEach(function(p, i){ i ? g.lineTo(X(i, v.length), Y(p)) : g.moveTo(X(i, v.length), Y(p)); }); g.stroke(); });
    font(g, 700, 22); g.fillStyle = ACC; g.fillText("— " + L.la + " " + pct(L.a[L.a.length - 1]), x0, y + h - 14); g.fillStyle = "#9aa0ab"; g.textAlign = "right"; g.fillText("— " + L.lb + " " + pct(L.b[L.b.length - 1]), x1, y + h - 14); g.textAlign = "left";
    return h + 24;
  }
  function bTiles(g, y, T){
    if (!T || !T.length) return 0;
    var n = T.length, gap = 16, w = (CW - gap * (n - 1)) / n, h = 150;
    T.forEach(function(t, i){ var x = MX + i * (w + gap); rr(g, x, y, w, h, 20, TILE);
      g.fillStyle = SUB; font(g, 600, 23); g.fillText(t.l, x + 22, y + 40);
      g.fillStyle = INK; font(g, 800, 36); wrap(g, t.v, x + 22, y + 90, w - 44, 40, 1);
      if (t.s){ g.fillStyle = MUT; font(g, 500, 21); wrap(g, t.s, x + 22, y + 126, w - 44, 24, 1); } });
    return h + 24;
  }
  function bTimeline(g, y, T){
    if (!T || !T.to) return 0;
    var h = 150; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("언제까지 · " + T.label, MX + 22, y + 32);
    var x0 = MX + 50, x1 = W - MX - 50, yy = y + 84, t0 = Date.parse(T.from + "T00:00:00Z"), t1 = Date.parse(T.to + "T00:00:00Z");
    g.strokeStyle = "#dfe3ea"; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.stroke();
    if (T.freq && t1 > t0 && (t1 - t0) / 2592e6 / T.freq <= 24){ var d = new Date(t1), k = 0; while (k < 400){ d.setUTCMonth(d.getUTCMonth() - T.freq); k++; if (d.getTime() <= t0) break; var x = x0 + (x1 - x0) * (d.getTime() - t0) / (t1 - t0); g.fillStyle = "#d9a441"; g.beginPath(); g.arc(x, yy, 8, 0, 7); g.fill(); } }
    g.fillStyle = ACC; g.beginPath(); g.arc(x0, yy, 13, 0, 7); g.fill(); g.beginPath(); g.arc(x1, yy, 13, 0, 7); g.fill();
    g.fillStyle = INK; font(g, 600, 22); g.fillText("오늘 " + md(T.from), x0 - 30, yy + 46); g.textAlign = "right"; g.fillText("만기 " + T.to, x1 + 30, yy + 46); g.textAlign = "left";
    if (T.freq){ g.fillStyle = MUT; font(g, 500, 20); g.textAlign = "center"; g.fillText((t1 - t0) / 2592e6 / T.freq <= 24 ? "● 이자 받는 날" : T.freq + "개월마다 이자", (x0 + x1) / 2, yy + 46); g.textAlign = "left"; }
    return h + 24;
  }
  function bSteps(g, y, S){
    if (!S || !S.bars || !S.bars.length) return 0;
    var h = 300; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("조기상환 조건 — 평가일에 기초자산이 이 선 위면 상환", MX + 22, y + 32);
    var n = S.bars.length, x0 = MX + 80, x1 = W - MX - 30, y0 = y + 66, y1 = y + h - 54, lo = Math.min(S.ki != null ? S.ki : 100, Math.min.apply(null, S.bars)) - 15, hi = 106;
    var Y = function(v){ return y1 - (v - lo) / (hi - lo) * (y1 - y0); }, cw = (x1 - x0) / n;
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, Y(100)); g.lineTo(x1, Y(100)); g.stroke(); g.fillStyle = MUT; font(g, 500, 20); g.fillText("기준 100", MX + 18, Y(100) + 7);
    S.bars.forEach(function(b, i){ var x = x0 + i * cw; g.fillStyle = "#dbe4ff"; g.fillRect(x + 6, Y(b), cw - 12, y1 - Y(b)); g.strokeStyle = "#3b5bdb"; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 6, Y(b)); g.lineTo(x + cw - 6, Y(b)); g.stroke();
      g.fillStyle = "#3b5bdb"; font(g, 800, 24); g.textAlign = "center"; g.fillText(b + "%", x + cw / 2, Y(b) - 10); g.fillStyle = MUT; font(g, 500, 20); g.fillText(i + 1 === n ? "만기" : (i + 1) + "차", x + cw / 2, y1 + 30); g.textAlign = "left"; });
    if (S.ki != null){ g.strokeStyle = UP; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(x0, Y(S.ki)); g.lineTo(x1, Y(S.ki)); g.stroke(); g.setLineDash([]); g.fillStyle = UP; font(g, 700, 20); g.fillText("낙인 " + S.ki, MX + 18, Y(S.ki) + 7); }
    return h + 24;
  }
  function bProb(g, y, P){
    if (!P || !P.k) return 0;
    var h = 134; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("과거 재생 — 각 평가일까지 상환될 누적 확률 (" + P.n.toLocaleString() + "번)", MX + 22, y + 32);
    var n = P.k.length, x0 = MX + 22, bw = (CW - 44 - (n - 1) * 10) / n;
    P.k.forEach(function(v, i){ var x = x0 + i * (bw + 10); g.fillStyle = "#eef0f4"; g.fillRect(x, y + 50, bw, 22); g.fillStyle = "#3b5bdb"; g.fillRect(x, y + 50, bw * v / 100, 22);
      g.fillStyle = INK; font(g, 700, 21); g.textAlign = "center"; g.fillText(Math.round(v) + "%", x + bw / 2, y + 100); g.fillStyle = MUT; font(g, 500, 18); g.fillText(i + 1 === n ? "만기" : (i + 1) + "차", x + bw / 2, y + 124); g.textAlign = "left"; });
    return h + 24;
  }
  function bRows(g, y, R, mode){   // 이름 · 값(%) · 작은 설명  — 테마·거래대금·집중 ETF·국면 근거·일정
    if (!R || !R.items || !R.items.length) return 0;
    var items = R.items.slice(0, 5), rowH = mode === "text" ? 66 : 62, h = 40 + items.length * rowH + 6; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(R.title, MX + 22, y + 32);
    items.forEach(function(it, i){
      var yy = y + 40 + i * rowH;
      g.fillStyle = INK; font(g, 700, 27); wrap(g, it.n, MX + 22, yy + 28, mode === "text" ? 200 : CW - 180, 30, 1);
      if (it.v != null && mode !== "text"){ g.fillStyle = cls(it.v); font(g, 800, 28); g.textAlign = "right"; g.fillText(typeof it.v === "number" ? pct(it.v) : it.v, W - MX - 22, yy + 29); g.textAlign = "left"; }
      if (mode === "text"){ g.fillStyle = INK; font(g, 600, 25); wrap(g, it.s + (it.v ? "  →  " + it.v : ""), MX + 232, yy + 28, CW - 260, 30, 2); }
      else if (it.s){ g.fillStyle = MUT; font(g, 500, 22); wrap(g, it.s, MX + 22, yy + 54, CW - 60, 24, 1); }
      if (i < items.length - 1){ g.fillStyle = LINE; g.fillRect(MX + 22, yy + rowH - 4, CW - 44, 1); }
    });
    return h + 24;
  }
  function bRisk(g, y, r, title){
    if (!r) return 0;
    var h = 96; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(title || "위험 등급", MX + 22, y + 32);
    var x0 = MX + 160, bw = (CW - 200) / 6;
    for (var i = 1; i <= 6; i++){ var x = x0 + (i - 1) * bw; g.fillStyle = i === r ? (i <= 2 ? UP : i <= 4 ? "#d9a441" : "#3fb950") : "#eef0f4"; rr(g, x + 3, y + 48, bw - 6, 26, 8, g.fillStyle); g.fillStyle = i === r ? "#fff" : MUT; font(g, 700, 20); g.textAlign = "center"; g.fillText(i === 1 ? "1 높음" : i === 6 ? "6 낮음" : String(i), x + bw / 2, y + 67); g.textAlign = "left"; }
    return h + 24;
  }
  function bHero(g, y, Hh){
    if (!Hh) return 0;
    var h = 300; rr(g, MX, y, CW, h, 24, TILE);
    g.fillStyle = SUB; font(g, 600, 26); g.fillText(Hh.name + (Hh.t ? "  " + Hh.t : ""), MX + 28, y + 46);
    g.fillStyle = cls(Hh.chg); font(g, 800, 96); var v = pct(Hh.chg); g.fillText(v, MX + 28, y + 150);
    g.fillStyle = INK; font(g, 700, 34); g.fillText(Hh.last ? Math.round(Hh.last).toLocaleString() : "", MX + 28, y + 200);
    g.fillStyle = SUB; font(g, 500, 24); g.fillText(Hh.sub || "", MX + 28, y + 240);
    // 오른쪽: 오늘 흐름(10분마다) 또는 한 달 흐름
    var x0 = MX + 470, x1 = W - MX - 28, y0 = y + 60, y1 = y + 236;
    var ser = Hh.intra ? Hh.intra.map(function(p){ return p.k; }) : null, lab = "오늘 흐름 (전일 대비 %)";
    if (!ser && Hh.hist && Hh.hist.length > 5){ ser = Hh.hist; lab = "최근 한 달 흐름"; }
    if (ser){
      var mn = Math.min.apply(null, ser), mx = Math.max.apply(null, ser); if (Hh.intra){ mn = Math.min(mn, 0); mx = Math.max(mx, 0); } if (mx === mn) mx = mn + 1;
      var X = function(i){ return x0 + (x1 - x0) * i / Math.max(1, ser.length - 1); }, Y = function(v){ return y1 - (v - mn) / (mx - mn) * (y1 - y0); };
      g.fillStyle = SUB; font(g, 600, 22); g.fillText(lab, x0, y + 44);
      if (Hh.intra){ g.strokeStyle = LINE; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke(); g.setLineDash([]); }
      var col = ser[ser.length - 1] >= (Hh.intra ? 0 : ser[0]) ? UP : DN;
      g.beginPath(); ser.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.lineTo(X(ser.length - 1), y1); g.lineTo(x0, y1); g.closePath(); g.fillStyle = col === UP ? "rgba(214,69,61,.12)" : "rgba(47,111,221,.12)"; g.fill();
      g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = "round"; g.beginPath(); ser.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(X(ser.length - 1), Y(ser[ser.length - 1]), 8, 0, 7); g.fill();
      g.fillStyle = MUT; font(g, 500, 20); g.fillText(Hh.intra ? Hh.intra[0].t : "한 달 전", x0, y1 + 28); g.textAlign = "right"; g.fillText(Hh.intra ? Hh.intra[Hh.intra.length - 1].t : "오늘", x1, y1 + 28); g.textAlign = "left";
      if (!Hh.intra){ var r1 = (ser[ser.length - 1] / ser[0] - 1) * 100; g.fillStyle = cls(r1); font(g, 700, 22); g.textAlign = "right"; g.fillText("한 달 " + pct(r1), x1, y + 44); g.textAlign = "left"; }
    }
    if (Hh.intra && Hh.hist && Hh.hist.length > 5){ var r2 = (Hh.hist[Hh.hist.length - 1] / Hh.hist[0] - 1) * 100; g.fillStyle = SUB; font(g, 600, 22); g.fillText("최근 한 달 " , MX + 28, y + 276); g.fillStyle = cls(r2); font(g, 800, 22); g.fillText(pct(r2), MX + 28 + 112, y + 276); }
    return h + 24;
  }
  function bWorld(g, y, Wd){
    if (!Wd || !Wd.length) return 0;
    var n = Math.min(6, Wd.length), gap = 12, w = (CW - gap * (n - 1)) / n, h = 138;
    Wd.slice(0, n).forEach(function(x, i){ var xx = MX + i * (w + gap), bg = x.v == null || x.v === 0 ? "#eef0f4" : x.v > 0 ? "rgba(214,69,61,.10)" : "rgba(47,111,221,.10)";
      rr(g, xx, y, w, h, 18, bg);
      font(g, 600, 28); g.fillStyle = INK; g.fillText(x.f, xx + 14, y + 38);
      g.fillStyle = SUB; font(g, 600, 20); wrap(g, x.n, xx + 14, y + 68, w - 22, 22, 1);
      g.fillStyle = cls(x.v); font(g, 800, 34); g.fillText(pct(x.v), xx + 14, y + 110);
      if (x.s){ g.fillStyle = MUT; font(g, 500, 18); wrap(g, x.s, xx + 14, y + 130, w - 22, 20, 1); } });
    return h + 24;
  }
  function bHeat(g, y, Hm){
    if (!Hm || Hm.length < 8) return 0;
    var srt = Hm.slice().sort(function(a, b){ return b.v - a.v; }), items = srt.length > 18 ? srt.slice(0, 12).concat(srt.slice(-6)) : srt, cols = 6, rows = Math.ceil(items.length / cols), gap = 8, w = (CW - gap * (cols - 1)) / cols, th = 76, h = 40 + rows * (th + gap) + 8;
    rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("업종 열지도 — 강한 12 · 약한 6 (빨강 오름 · 파랑 내림)", MX + 22, y + 32);
    var mx = Math.max.apply(null, items.map(function(i){ return Math.abs(i.v); }).concat([1]));
    items.forEach(function(it, i){ var c = i % cols, r = Math.floor(i / cols), x = MX + 22 + c * (w + gap) - 22 + 22, yy = y + 44 + r * (th + gap);
      x = MX + 12 + c * (w - 4 + gap) ; var ww = w - 4;
      var a = Math.min(1, 0.18 + Math.abs(it.v) / mx * 0.82), bg = it.v > 0 ? "rgba(214,69,61," + a.toFixed(2) + ")" : it.v < 0 ? "rgba(47,111,221," + a.toFixed(2) + ")" : "#e6e8ec";
      rr(g, x, yy, ww, th, 12, bg);
      var dark = a > 0.5; g.fillStyle = dark ? "#fff" : INK; font(g, 700, 20); wrap(g, it.n, x + 10, yy + 30, ww - 16, 22, 1);
      font(g, 800, 24); g.fillText(pct(it.v), x + 10, yy + 62); });
    return h + 24;
  }
  function bGauge(g, y, G, T){
    if (!G) return 0;
    var h = 150; rr(g, MX, y, CW, h, 20, TILE);
    var upr = Math.round(G.up / G.total * 100), dnr = Math.round(G.down / G.total * 100);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("시장 온도 — 오늘 오른 종목 " + upr + "% (" + G.total.toLocaleString() + "개 중)", MX + 22, y + 32);
    var x0 = MX + 22, bw = CW - 44, yy = y + 52;
    g.fillStyle = DN; rr(g, x0, yy, bw, 30, 15, DN); g.fillStyle = "#c9ced8"; g.fillRect(x0 + bw * upr / 100, yy, bw * (100 - upr - dnr) / 100, 30); g.fillStyle = UP; rr(g, x0, yy, bw * upr / 100, 30, 15, UP); g.fillRect(x0 + 15, yy, Math.max(0, bw * upr / 100 - 15), 30);
    g.fillStyle = "#fff"; font(g, 800, 22); g.fillText("오름 " + upr + "%", x0 + 14, yy + 22); g.textAlign = "right"; g.fillText("내림 " + dnr + "%", x0 + bw - 14, yy + 22); g.textAlign = "left";
    var mood = upr >= 70 ? "🔥 거의 다 오르는 날" : upr >= 55 ? "🙂 오르는 종목이 더 많아요" : upr >= 45 ? "😐 반반이에요" : upr >= 30 ? "😟 내리는 종목이 더 많아요" : "🥶 거의 다 내리는 날";
    g.fillStyle = INK; font(g, 700, 26); g.fillText(mood, x0, y + 122);
    g.fillStyle = MUT; font(g, 500, 22); g.textAlign = "right"; g.fillText("상한가 " + G.lu + " · 하한가 " + G.ld, x0 + bw, y + 122); g.textAlign = "left";
    return h + 24;
  }
  function bAdvice(g, y, A, name){   // 📌 PB 코멘트 — 지금 해석 · 앞으로 볼 것 · 이렇게 대응
    if (!A || !A.read) return 0;
    var pad = 28, tw = CW - pad * 2 - 8, yy, h;
    var measure = function(t, sz, mx){ font(g, 600, sz); return nLines(g, t, tw, mx); };
    var RL = A.maxRead || 3, nRead = measure(A.read, 30, RL), nPlan = 0; (A.plan || []).forEach(function(p){ nPlan += measure("✓ " + p, 26, 2); });
    h = 70 + nRead * 42 + 22 + (A.watch && A.watch.length ? 44 + A.watch.length * 40 + 16 : 0) + (nPlan ? 44 + nPlan * 36 + (A.plan.length * 8) : 0) + 20;
    rr(g, MX, y, CW, h, 24, "#1f2d4d");
    g.fillStyle = "#d9a441"; g.fillRect(MX, y + 24, 8, 44);
    var aT = cliLab() ? "📌 " + cliLab() + "께 드리는 말씀" + (A.title ? " — " + A.title : "") : "📌 " + (name ? name + "의 " : "PB ") + "코멘트" + (A.title ? " — " + A.title : " — 그래서 앞으로"), aF = 30;
    font(g, 800, aF); while (g.measureText(aT).width > CW - pad * 2 && aF > 22){ aF -= 2; font(g, 800, aF); }
    g.fillStyle = "#fff"; g.fillText(aT, MX + pad, y + 56);
    yy = y + 70;
    g.fillStyle = "#f3f5fa"; font(g, 600, 30); yy += wrap(g, A.read, MX + pad, yy + 34, tw, 42, RL) + 22;
    if (A.watch && A.watch.length){
      g.fillStyle = "#d9a441"; font(g, 800, 24); g.fillText("앞으로 볼 일정", MX + pad, yy + 26); yy += 44;
      A.watch.forEach(function(w){ rr(g, MX + pad, yy + 4, 150, 32, 16, "rgba(255,255,255,.12)"); g.fillStyle = "#fff"; font(g, 700, 21); g.textAlign = "center"; g.fillText(w[0], MX + pad + 75, yy + 27); g.textAlign = "left";
        g.fillStyle = "#e6e9f2"; font(g, 600, 24); wrap(g, w[1], MX + pad + 166, yy + 28, tw - 166, 28, 1); yy += 40; });
      yy += 16;
    }
    if (A.plan && A.plan.length){
      g.fillStyle = "#d9a441"; font(g, 800, 24); g.fillText("이렇게 대응해요", MX + pad, yy + 26); yy += 44;
      A.plan.forEach(function(p){ g.fillStyle = "#fff"; font(g, 600, 26); yy += wrap(g, "✓ " + p, MX + pad, yy + 26, tw, 36, 2) + 8; });
    }
    return h + 24;
  }
  function bBullets(g, y, B, title){
    if (!B || !B.length) return 0;
    var lines = B.slice(0, 4), lh = 40, est = 0; font(g, 600, 29);
    lines.forEach(function(t){ est += Math.min(3, Math.ceil(g.measureText("·  " + t).width / (CW - 60))) * lh + 12; });
    var h = (title ? 44 : 18) + est + 4; rr(g, MX, y, CW, h, 20, TILE);
    var yy = y + (title ? 44 : 18);
    if (title){ g.fillStyle = SUB; font(g, 700, 24); g.fillText(title, MX + 22, y + 32); }
    lines.forEach(function(t){ g.fillStyle = INK; font(g, 600, 29); yy += wrap(g, "·  " + t, MX + 22, yy + 30, CW - 60, lh, 3) + 12; });
    return h + 24;
  }
  function bEvents(g, y, E){
    if (!E || !E.length) return 0;
    var t = "📅 오늘  " + E.join("  ·  "); font(g, 600, 25);
    var n = Math.min(2, Math.ceil(g.measureText(t).width / (CW - 44))), h = 20 + n * 34; rr(g, MX, y, CW, h, 16, "#eef1f7");
    g.fillStyle = ACC; wrap(g, t, MX + 22, y + 36, CW - 44, 34, 2);
    return h + 24;
  }
  /* ───────────── 🎨 그림 머리 (10/28 13:35 「시황·종목 디자인·내용 업그레이드」 · Canva 크레딧 소진 → 코드로 그림, 하루 제한 없음) ───────────── */
  var TINT = {city_up: ["#121c45", "#7a2a3c"], city_dn: ["#0c1730", "#1f4f8f"], city_flat: ["#111a35", "#39476a"],
    chip: ["#0a1430", "#2446a8"], battery: ["#0b2118", "#2a7a45"], dna: ["#0a2626", "#1f7a6c"], bank: ["#17132e", "#4b3d86"], ship: ["#08203a", "#1d6f9c"],
    rocket: ["#0b0b24", "#3b2a7a"], net: ["#0b1a2e", "#1f6a8a"], energy: ["#24170a", "#8a5a14"], car: ["#14161c", "#4a5568"], build: ["#1f1a14", "#7a5a32"], shop: ["#2a0f22", "#8a2d5c"], chart: ["#101a33", "#33507a"]};
  function rnd(seed){ var s = seed || 7; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function scene(g, kind, bw, bh, mood){
    var t = TINT[kind] || TINT.chart, bg = g.createLinearGradient(0, 0, bw, bh); bg.addColorStop(0, t[0]); bg.addColorStop(1, t[1]); g.fillStyle = bg; g.fillRect(0, 0, bw, bh);
    var R = rnd(kind.length * 31 + 5), cx = bw * 0.78, cy = bh * 0.42;
    g.save(); g.strokeStyle = "rgba(255,255,255,.22)"; g.fillStyle = "rgba(255,255,255,.10)"; g.lineWidth = 3;
    var glow = function(x, y, r, col){ var gg = g.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, col); gg.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    if (kind.indexOf("city") === 0){
      if (mood !== "dn"){ glow(bw * 0.8, bh * 0.36, 230, mood === "up" ? "rgba(255,170,90,.55)" : "rgba(255,220,150,.30)"); g.fillStyle = mood === "up" ? "rgba(255,196,120,.9)" : "rgba(255,230,180,.55)"; g.beginPath(); g.arc(bw * 0.8, bh * 0.36, 58, 0, 7); g.fill(); }
      if (mood !== "up"){ g.fillStyle = "rgba(255,255,255,.16)"; [[0.62, 0.22, 1], [0.86, 0.3, 1.3], [0.72, 0.42, .8]].forEach(function(c){ var x = bw * c[0], y = bh * c[1], s = c[2]; g.beginPath(); g.arc(x, y, 34 * s, 0, 7); g.arc(x + 40 * s, y - 16 * s, 44 * s, 0, 7); g.arc(x + 86 * s, y, 32 * s, 0, 7); g.rect(x, y, 86 * s, 30 * s); g.fill(); }); }
      var x = bw * 0.38; while (x < bw){ var w = 40 + R() * 70, h = 70 + R() * (bh * 0.55); g.fillStyle = "rgba(6,10,24,.55)"; g.fillRect(x, bh - h, w, h);
        g.fillStyle = "rgba(255,214,140,.55)"; for (var yy = bh - h + 14; yy < bh - 10; yy += 20) for (var xx = x + 8; xx < x + w - 8; xx += 16) if (R() < 0.35) g.fillRect(xx, yy, 6, 9); x += w + 6; }
      g.strokeStyle = mood === "dn" ? "rgba(140,190,255,.8)" : "rgba(255,150,130,.85)"; g.lineWidth = 5; g.beginPath(); var px = bw * 0.36, py = bh * (mood === "dn" ? 0.3 : 0.8);
      for (var i = 0; i <= 12; i++){ var X = px + (bw - px) * i / 12, Y = py + (mood === "dn" ? 1 : -1) * (bh * 0.45) * i / 12 + (R() - 0.5) * 40; i ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.stroke();
    } else if (kind === "chip"){
      glow(cx, cy, 260, "rgba(90,200,255,.35)");
      for (var k = 0; k < 18; k++){ var a = R() * 6.28, r0 = 110, r1 = 160 + R() * 260, x0 = cx + Math.cos(a) * r0, y0 = cy + Math.sin(a) * r0, xm = cx + Math.cos(a) * r1;
        g.strokeStyle = "rgba(120,210,255,.35)"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(xm, y0); g.lineTo(xm, y0 + (R() - 0.5) * 120); g.stroke(); g.fillStyle = "rgba(160,230,255,.8)"; g.beginPath(); g.arc(xm, y0, 5, 0, 7); g.fill(); }
      rr(g, cx - 110, cy - 110, 220, 220, 22, "rgba(15,30,70,.9)"); g.strokeStyle = "rgba(140,220,255,.8)"; g.lineWidth = 4; g.strokeRect(cx - 80, cy - 80, 160, 160);
      for (var p = 0; p < 7; p++){ var o = -90 + p * 30; g.fillStyle = "rgba(170,225,255,.7)"; g.fillRect(cx + o, cy - 132, 8, 22); g.fillRect(cx + o, cy + 110, 8, 22); g.fillRect(cx - 132, cy + o, 22, 8); g.fillRect(cx + 110, cy + o, 22, 8); }
      g.fillStyle = "rgba(140,220,255,.25)"; for (var m = 0; m < 4; m++) for (var n = 0; n < 4; n++) g.fillRect(cx - 70 + m * 36, cy - 70 + n * 36, 28, 28);
    } else if (kind === "battery"){
      glow(cx, cy, 240, "rgba(120,255,160,.30)");
      for (var b = 0; b < 3; b++){ var bx = cx - 190 + b * 130, by = cy - 90; rr(g, bx + 30, by - 16, 40, 18, 6, "rgba(220,255,230,.6)"); rr(g, bx, by, 100, 210, 18, "rgba(255,255,255,.14)"); g.strokeStyle = "rgba(200,255,215,.7)"; g.strokeRect(bx, by, 100, 210);
        var lv = 0.45 + b * 0.22; rr(g, bx + 10, by + 200 - 190 * lv, 80, 190 * lv - 10, 10, "rgba(120,240,150,.75)"); }
    } else if (kind === "dna"){
      glow(cx, cy, 240, "rgba(120,255,230,.28)");
      for (var s = 0; s <= 40; s++){ var yy2 = 20 + s * (bh - 40) / 40, ph = s * 0.42, xa = cx + Math.sin(ph) * 120, xb = cx - Math.sin(ph) * 120;
        g.strokeStyle = "rgba(200,255,245,.25)"; g.lineWidth = 3; g.beginPath(); g.moveTo(xa, yy2); g.lineTo(xb, yy2); g.stroke();
        g.fillStyle = "rgba(140,255,230,.85)"; g.beginPath(); g.arc(xa, yy2, 7, 0, 7); g.fill(); g.fillStyle = "rgba(255,180,220,.85)"; g.beginPath(); g.arc(xb, yy2, 7, 0, 7); g.fill(); }
    } else if (kind === "bank"){
      glow(cx, cy, 240, "rgba(200,180,255,.28)"); g.fillStyle = "rgba(255,255,255,.22)";
      g.beginPath(); g.moveTo(cx - 220, cy - 40); g.lineTo(cx, cy - 150); g.lineTo(cx + 220, cy - 40); g.closePath(); g.fill();
      for (var c2 = 0; c2 < 5; c2++) g.fillRect(cx - 190 + c2 * 90, cy - 20, 34, 190); g.fillRect(cx - 230, cy + 175, 460, 22);
    } else if (kind === "ship"){
      glow(cx, cy - 40, 220, "rgba(150,220,255,.3)");
      g.fillStyle = "rgba(10,20,40,.75)"; g.beginPath(); g.moveTo(cx - 240, cy + 40); g.lineTo(cx + 240, cy + 40); g.lineTo(cx + 190, cy + 110); g.lineTo(cx - 210, cy + 110); g.closePath(); g.fill();
      ["#e8594f", "#f2b33d", "#3fa7e0", "#5cc46b"].forEach(function(col, i){ for (var j = 0; j < 3; j++){ g.fillStyle = col; g.globalAlpha = .8; g.fillRect(cx - 200 + i * 90 + j * 28, cy - 10 - (i % 2) * 26, 26, 48); } }); g.globalAlpha = 1;
      g.strokeStyle = "rgba(200,235,255,.4)"; for (var wv2 = 0; wv2 < 4; wv2++){ g.beginPath(); for (var xx2 = bw * 0.35; xx2 <= bw; xx2 += 20){ var Y2 = cy + 140 + wv2 * 26 + Math.sin(xx2 / 40 + wv2) * 8; xx2 === bw * 0.35 ? g.moveTo(xx2, Y2) : g.lineTo(xx2, Y2); } g.stroke(); }
    } else if (kind === "rocket"){
      for (var st = 0; st < 70; st++){ g.fillStyle = "rgba(255,255,255," + (0.3 + R() * 0.6).toFixed(2) + ")"; g.fillRect(bw * 0.3 + R() * bw * 0.7, R() * bh, 2 + R() * 2, 2 + R() * 2); }
      glow(cx + 60, cy + 120, 200, "rgba(150,120,255,.45)"); g.fillStyle = "rgba(120,100,230,.8)"; g.beginPath(); g.arc(cx + 60, cy + 150, 110, 0, 7); g.fill();
      g.strokeStyle = "rgba(220,210,255,.6)"; g.beginPath(); g.ellipse(cx + 60, cy + 150, 200, 46, -0.3, 0, 7); g.stroke();
      g.save(); g.translate(cx - 120, cy - 40); g.rotate(0.6); g.fillStyle = "rgba(255,255,255,.92)"; g.beginPath(); g.moveTo(0, -70); g.quadraticCurveTo(28, -30, 22, 40); g.lineTo(-22, 40); g.quadraticCurveTo(-28, -30, 0, -70); g.fill();
      g.fillStyle = "rgba(255,170,80,.9)"; g.beginPath(); g.moveTo(-16, 42); g.lineTo(0, 100); g.lineTo(16, 42); g.fill(); g.restore();
    } else if (kind === "net"){
      var P = []; for (var nd = 0; nd < 22; nd++) P.push([bw * 0.4 + R() * bw * 0.58, 20 + R() * (bh - 40)]);
      g.strokeStyle = "rgba(140,220,255,.28)"; g.lineWidth = 2; P.forEach(function(a, i){ P.forEach(function(b2, j){ if (j > i && Math.hypot(a[0] - b2[0], a[1] - b2[1]) < 190){ g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b2[0], b2[1]); g.stroke(); } }); });
      P.forEach(function(a){ glow(a[0], a[1], 22, "rgba(140,230,255,.55)"); g.fillStyle = "rgba(200,245,255,.95)"; g.beginPath(); g.arc(a[0], a[1], 5, 0, 7); g.fill(); });
    } else if (kind === "energy"){
      glow(cx, cy, 250, "rgba(255,200,90,.38)"); g.fillStyle = "rgba(255,214,110,.9)";
      g.beginPath(); g.moveTo(cx + 20, cy - 150); g.lineTo(cx - 80, cy + 20); g.lineTo(cx - 5, cy + 20); g.lineTo(cx - 40, cy + 160); g.lineTo(cx + 90, cy - 30); g.lineTo(cx + 15, cy - 30); g.closePath(); g.fill();
    } else if (kind === "car"){
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.moveTo(bw * 0.55, bh); g.lineTo(bw * 0.76, bh * 0.35); g.lineTo(bw * 0.8, bh * 0.35); g.lineTo(bw, bh); g.fill();
      g.strokeStyle = "rgba(255,230,140,.7)"; g.setLineDash([26, 22]); g.lineWidth = 6; g.beginPath(); g.moveTo(bw * 0.78, bh * 0.36); g.lineTo(bw * 0.88, bh); g.stroke(); g.setLineDash([]);
      glow(bw * 0.78, bh * 0.33, 160, "rgba(255,230,160,.4)");
    } else {
      for (var bb = 0; bb < 9; bb++){ var hh2 = 40 + bb * 22 + R() * 30; rr(g, bw * 0.45 + bb * 58, bh - 30 - hh2, 40, hh2, 8, "rgba(255,255,255," + (0.08 + bb * 0.025).toFixed(2) + ")"); }
      glow(bw * 0.92, bh * 0.25, 160, "rgba(160,200,255,.35)");
    }
    g.restore();
    var sh = g.createLinearGradient(0, 0, bw * 0.75, 0); sh.addColorStop(0, "rgba(6,10,24,.82)"); sh.addColorStop(0.55, "rgba(6,10,24,.45)"); sh.addColorStop(1, "rgba(6,10,24,0)"); g.fillStyle = sh; g.fillRect(0, 0, bw, bh);
  }
  var LUP = "#ff8f80", LDN = "#8fb8ff";
  function lcls(v){ return v == null || v === 0 ? "#fff" : v > 0 ? LUP : LDN; }
  function topLine(g, name){ headLine(g, name, 58, "rgba(255,255,255,.8)", "#fff"); }
  function spark(g, ser, x0, y0, x1, y1, zero, labs){
    if (!ser || ser.length < 3) return;
    var mn = Math.min.apply(null, ser), mx = Math.max.apply(null, ser); if (zero){ mn = Math.min(mn, 0); mx = Math.max(mx, 0); } if (mx === mn) mx = mn + 1;
    var X = function(i){ return x0 + (x1 - x0) * i / (ser.length - 1); }, Y = function(v){ return y1 - (v - mn) / (mx - mn) * (y1 - y0); };
    var upc = ser[ser.length - 1] >= (zero ? 0 : ser[0]), col = upc ? LUP : LDN;
    if (zero){ g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke(); g.setLineDash([]); }
    var fg = g.createLinearGradient(0, y0, 0, y1); fg.addColorStop(0, upc ? "rgba(255,143,128,.45)" : "rgba(143,184,255,.45)"); fg.addColorStop(1, "rgba(255,255,255,0)");
    g.beginPath(); ser.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); g.fillStyle = fg; g.fill();
    g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = "round"; g.beginPath(); ser.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(x1, Y(ser[ser.length - 1]), 9, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x1, Y(ser[ser.length - 1]), 6, 0, 7); g.fill();
    if (labs){ g.fillStyle = "rgba(255,255,255,.65)"; font(g, 500, 20); g.fillText(labs[0], x0, y1 + 28); g.textAlign = "right"; g.fillText(labs[1], x1, y1 + 28); g.textAlign = "left"; }
  }
  function bannerMarket(g, C, name){
    var B = C.hero || {}, chg = B.chg, mood = chg == null ? "flat" : chg >= 0.5 ? "up" : chg <= -0.5 ? "dn" : "flat", bh = 520;
    scene(g, "city_" + mood, W, bh, mood); topLine(g, name);
    var wx = chg == null ? "🌤️" : chg >= 2 ? "☀️" : chg >= 0.5 ? "🌤️" : chg > -0.5 ? "⛅" : chg > -2 ? "🌧️" : "⛈️";
    var wd = chg == null ? "" : chg >= 2 ? "맑음 · 크게 오름" : chg >= 0.5 ? "대체로 맑음" : chg > -0.5 ? "흐림 · 제자리" : chg > -2 ? "비 · 내림" : "폭풍 · 크게 내림";
    g.fillStyle = "#fff"; font(g, 800, 54); g.fillText("오늘의 시장 날씨 " + wx, MX, 134);
    g.fillStyle = "rgba(255,255,255,.82)"; font(g, 600, 26); wrap(g, (C.label || "") + (wd ? " · " + wd : ""), MX, 178, CW, 30, 1);
    if (chg != null){
      g.fillStyle = "rgba(255,255,255,.75)"; font(g, 700, 26); g.fillText("코스피" + (B.t ? "  " + B.t : ""), MX, 248);
      g.fillStyle = lcls(chg); font(g, 800, 108); g.fillText(pct(chg), MX - 4, 350);
      g.fillStyle = "#fff"; font(g, 800, 40); g.fillText(B.last ? Math.round(B.last).toLocaleString() : "", MX, 404);
      g.fillStyle = "rgba(255,255,255,.8)"; font(g, 600, 24); g.fillText(B.sub || "", MX, 446);
      if (B.hist && B.hist.length > 5){ var r2 = (B.hist[B.hist.length - 1] / B.hist[0] - 1) * 100; g.fillText("최근 한 달 ", MX, 484); g.fillStyle = lcls(r2); font(g, 800, 24); g.fillText(pct(r2), MX + 118, 484); }
      var ser = B.intra ? B.intra.map(function(p){ return p.k; }) : B.hist;
      if (ser){ rr(g, 540, 222, W - MX - 540, 256, 22, "rgba(255,255,255,.08)"); g.fillStyle = "rgba(255,255,255,.75)"; font(g, 600, 21); g.fillText(B.intra ? "오늘 흐름 (전일 대비 %)" : "최근 한 달", 566, 256);
        spark(g, ser, 566, 276, W - MX - 30, 430, !!B.intra, B.intra ? [B.intra[0].t, B.intra[B.intra.length - 1].t] : ["한 달 전", "오늘"]); }
    }
    return bh + 30;
  }
  function bannerStock(g, C, name){
    var bh = 470, im = C.img, S = C.top || {};
    g.save(); g.beginPath(); g.rect(0, 0, W, bh); g.clip();
    if (im){ var sc = Math.max(W / im.width, bh / im.height), iw = im.width * sc, ih = im.height * sc; g.drawImage(im, (W - iw) / 2, (bh - ih) / 2, iw, ih); var gr = g.createLinearGradient(0, 0, 0, bh); gr.addColorStop(0, "rgba(6,10,24,.35)"); gr.addColorStop(1, "rgba(6,10,24,.9)"); g.fillStyle = gr; g.fillRect(0, 0, W, bh); }
    else scene(g, C.scene || "chart", W, bh);
    g.restore(); topLine(g, name);
    g.fillStyle = "#fff"; font(g, 800, 58); wrap(g, C.title, MX, 138, CW, 62, 1);
    g.fillStyle = "rgba(255,255,255,.8)"; font(g, 600, 25); wrap(g, C.sub || "", MX, 180, CW, 30, 1);
    if (S.price){
      g.fillStyle = "rgba(255,255,255,.72)"; font(g, 700, 24); g.fillText(S.lab || "", MX, 252);
      g.fillStyle = "#fff"; font(g, 800, 76); g.fillText(S.price, MX - 2, 336); var pw = g.measureText(S.price).width;
      if (S.chg != null){ font(g, 800, 36); var tx = pct(S.chg), tw2 = g.measureText(tx).width + 36; rr(g, MX + pw + 22, 290, tw2, 54, 27, S.chg > 0 ? "rgba(255,110,95,.92)" : S.chg < 0 ? "rgba(90,140,255,.92)" : "rgba(255,255,255,.25)"); g.fillStyle = "#fff"; g.fillText(tx, MX + pw + 40, 330); }
      if (S.twin){ g.fillStyle = "rgba(255,255,255,.9)"; font(g, 700, 24); wrap(g, S.twin, MX, 382, CW, 28, 1); }
    }
    if (C.about){ rr(g, MX, bh - 72, CW, 50, 14, "rgba(255,255,255,.12)"); g.fillStyle = "rgba(255,255,255,.92)"; font(g, 600, 23); wrap(g, "🏢 " + C.about, MX + 18, bh - 38, CW - 36, 26, 1); }
    return bh + 30;
  }
  function bKey(g, y, K){   // 오늘 핵심 3줄
    if (!K || !K.length) return 0;
    var h = 58 + K.length * 62; rr(g, MX, y, CW, h, 22, TILE);
    g.fillStyle = SUB; font(g, 800, 24); g.fillText("오늘 핵심 3줄", MX + 24, y + 38);
    K.forEach(function(k, i){ var yy = y + 58 + i * 62; rr(g, MX + 22, yy + 4, 48, 48, 24, "#f1f3f8"); font(g, 600, 26); g.fillStyle = INK; g.textAlign = "center"; g.fillText(k[0], MX + 46, yy + 38); g.textAlign = "left";
      g.fillStyle = INK; font(g, 700, 28); wrap(g, k[1], MX + 86, yy + 38, CW - 110, 32, 1); });
    return h + 24;
  }
  function bStars(g, y, S){   // 오늘 돈이 몰린 종목 (거래대금 상위)
    if (!S || S.length < 3) return 0;
    var n = Math.min(5, S.length), h = 60 + n * 64; rr(g, MX, y, CW, h, 22, TILE);
    g.fillStyle = SUB; font(g, 800, 24); g.fillText("💰 오늘 돈이 가장 많이 몰린 종목 (거래대금 순)", MX + 24, y + 38);
    var mxv = Math.max.apply(null, S.slice(0, n).map(function(s){ return s.v || 0; }).concat([1]));
    S.slice(0, n).forEach(function(s, i){ var yy = y + 56 + i * 64;
      rr(g, MX + 22, yy + 50, (CW - 44) * (s.v || 0) / mxv, 6, 3, s.r >= 0 ? "rgba(214,69,61,.25)" : "rgba(47,111,221,.25)");
      g.fillStyle = MUT; font(g, 800, 26); g.fillText(String(i + 1), MX + 24, yy + 38);
      g.fillStyle = INK; font(g, 800, 28); wrap(g, s.n, MX + 60, yy + 38, 300, 30, 1);
      g.textAlign = "right"; g.fillStyle = MUT; font(g, 500, 21); g.fillText(s.v ? "거래 " + (s.v >= 10000 ? (s.v / 10000).toFixed(1) + "조" : Math.round(s.v).toLocaleString() + "억") : "", MX + 520, yy + 38);
      g.fillStyle = SUB; font(g, 700, 25); g.fillText(Math.round(s.p).toLocaleString() + "원", MX + 770, yy + 38);
      font(g, 800, 30); g.fillStyle = cls(s.r); g.fillText(pct(s.r), W - MX - 24, yy + 38); g.textAlign = "left"; });
    return h + 24;
  }
  function bFin(g, y, F_){   // 실적 흐름 — 매출 막대 + 영업이익
    if (!F_ || F_.rows.length < 3) return 0;
    var h = 330; rr(g, MX, y, CW, h, 22, TILE);
    g.fillStyle = SUB; font(g, 800, 24); g.fillText("📊 실적 흐름 — 매출(막대) · 영업이익(아래)", MX + 24, y + 38);
    if (F_.head){ g.fillStyle = INK; font(g, 700, 24); g.textAlign = "right"; g.fillText(F_.head, W - MX - 24, y + 38); g.textAlign = "left"; }
    var R_ = F_.rows, n = R_.length, mx = Math.max.apply(null, R_.map(function(r){ return r.rev; })), bw = (CW - 48) / n, base = y + 236;
    R_.forEach(function(r, i){ var x = MX + 24 + i * bw, hh = Math.max(6, r.rev / mx * 150), last = i === n - 1;
      rr(g, x + bw * 0.2, base - hh, bw * 0.6, hh, 10, last ? "#3b5bdb" : "#c9d3f0");
      g.fillStyle = last ? INK : SUB; font(g, 800, 24); g.textAlign = "center"; g.fillText(F_.fmt(r.rev), x + bw / 2, base - hh - 12);
      g.fillStyle = MUT; font(g, 600, 20); g.fillText(r.y, x + bw / 2, base + 28);
      g.fillStyle = r.op == null ? MUT : r.op >= 0 ? "#2f9e44" : DN; font(g, 700, 21); g.fillText(r.op == null ? "–" : "이익 " + F_.fmt(r.op), x + bw / 2, base + 58); g.textAlign = "left"; });
    return h + 24;
  }
  /* ───────────── 🖼 화면 한 장 (10/28 15:39 「어디에 있던 그 화면의 대부분을 차지하는 내용을 원페이지로 — 시황 보내듯 깔끔하게」) ───────────── */
  function bannerScreen(g, C, name){
    var bh = C.hero || (C.stats && C.stats.length) ? 470 : 300, mood = C.mood || "flat";
    scene(g, C.scene || "chart", W, bh, mood); topLine(g, name);
    g.fillStyle = "#fff"; font(g, 800, 54); wrap(g, C.title, MX, 134, CW, 60, 1);
    if (C.sub){ g.fillStyle = "rgba(255,255,255,.82)"; font(g, 600, 25); wrap(g, C.sub, MX, 178, CW, 30, 1); }
    if (C.hero){
      var Hh = C.hero; g.fillStyle = "rgba(255,255,255,.75)"; font(g, 700, 25); wrap(g, Hh.l || "", MX, 250, 470, 28, 1);
      g.fillStyle = Hh.c === "up" ? LUP : Hh.c === "dn" ? LDN : "#fff"; var hs = 96; font(g, 800, hs); while (g.measureText(String(Hh.v)).width > 470 && hs > 50){ hs -= 6; font(g, 800, hs); } g.fillText(String(Hh.v), MX - 2, 348);
      if (Hh.s){ g.fillStyle = "rgba(255,255,255,.85)"; font(g, 600, 24); wrap(g, Hh.s, MX, 398, 470, 28, 2); }
    }
    if (C.stats && C.stats.length){
      var S_ = C.stats.slice(0, 4), x0 = C.hero ? 560 : MX, bw = W - MX - x0, rh = Math.min(62, 230 / S_.length);
      rr(g, x0, 222, bw, rh * S_.length + 26, 22, C.hero ? "rgba(255,255,255,.10)" : "rgba(6,10,24,.62)");
      S_.forEach(function(s, i){ var yy = 222 + 13 + i * rh + rh / 2 + 9;
        g.fillStyle = "rgba(255,255,255,.78)"; font(g, 600, 22); wrap(g, s.l, x0 + 22, yy, bw * 0.55, 26, 1);
        g.fillStyle = s.c === "up" ? LUP : s.c === "dn" ? LDN : "#fff"; font(g, 800, 30); g.textAlign = "right"; g.fillText(String(s.v), x0 + bw - 22, yy + 2); g.textAlign = "left";
        if (i < S_.length - 1){ g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(x0 + 22, yy + rh / 2 - 6, bw - 44, 1); } });
    }
    return bh + 30;
  }
  function bList(g, y, L){   // 순위 목록 — 이름(1~2줄) · 작은 설명 · 값 · 막대
    if (!L || !L.items || !L.items.length) return 0;
    var items = L.items.slice(0, L.max || 8), NL = L.wrap2 ? 2 : 1, x00 = MX + 24 + (L.rank !== false ? 40 : 0), nw = function(it){ return CW - 48 - (x00 - MX - 24) - (it.v != null ? 190 : 0); };
    font(g, 800, 28); var hs = items.map(function(it){ var n = nLines(g, (it.f ? it.f + " " : "") + it.n, nw(it), NL); return 18 + n * 34 + (it.s ? 28 : 0) + (it.bar != null ? 10 : 0); });
    var h = 58 + hs.reduce(function(a, b){ return a + b; }, 0) + 4;
    rr(g, MX, y, CW, h, 22, TILE);
    g.fillStyle = SUB; font(g, 800, 24); g.fillText(L.title, MX + 24, y + 38);
    if (L.right){ g.fillStyle = MUT; font(g, 600, 21); g.textAlign = "right"; g.fillText(L.right, W - MX - 24, y + 38); g.textAlign = "left"; }
    var bmax = Math.max.apply(null, items.map(function(it){ return Math.abs(it.bar || 0); }).concat([1e-9])), yy = y + 54;
    items.forEach(function(it, i){
      var x = MX + 24, vx = W - MX - 24, rowH = hs[i];
      if (L.rank !== false){ g.fillStyle = i < 3 ? ACC : MUT; font(g, 800, 26); g.fillText(String(i + 1), x, yy + 32); x += 40; }
      g.fillStyle = INK; font(g, 800, 28); var nh = wrap(g, (it.f ? it.f + " " : "") + it.n, x, yy + 32, nw(it), 34, NL);
      if (it.s){ g.fillStyle = MUT; font(g, 500, 21); wrap(g, it.s, x, yy + nh + 26, CW - 48 - (x - MX - 24) - 150, 24, 1); }
      if (it.v != null){ var vv = typeof it.v === "number" ? pct(it.v) : String(it.v); g.fillStyle = it.vc || (typeof it.v === "number" ? cls(it.v) : INK); font(g, 800, 30); g.textAlign = "right"; g.fillText(vv, vx, yy + 32); g.textAlign = "left"; }
      if (it.v2){ g.fillStyle = MUT; font(g, 600, 20); g.textAlign = "right"; g.fillText(it.v2, vx, yy + 60); g.textAlign = "left"; }
      if (it.bar != null) rr(g, MX + 24, yy + rowH - 12, (CW - 48) * Math.abs(it.bar) / bmax, 6, 3, it.barc || (it.bar >= 0 ? "rgba(214,69,61,.28)" : "rgba(47,111,221,.28)"));
      else if (i < items.length - 1){ g.fillStyle = LINE; g.fillRect(MX + 24, yy + rowH - 4, CW - 48, 1); }
      yy += rowH;
    });
    return h + 24;
  }
  function bImg(g, y, I){   // 화면에서 찍은 카드 그림 — 폭 맞춤 · 너무 길면 아래를 흐리게 자름
    if (!I || !I.c || !I.c.width) return 0;
    var sc = CW / I.c.width, full = I.c.height * sc, hh = Math.min(full, I.max || 1900);
    g.save(); g.shadowColor = "rgba(20,30,60,.10)"; g.shadowBlur = 18; g.shadowOffsetY = 4; rr(g, MX, y, CW, hh, 22, "#fff"); g.restore();
    g.save(); g.beginPath(); if (g.roundRect) g.roundRect(MX, y, CW, hh, 22); else g.rect(MX, y, CW, hh); g.clip();
    g.drawImage(I.c, 0, 0, I.c.width, hh / sc, MX, y, CW, hh);
    if (full > hh){ var fg = g.createLinearGradient(0, y + hh - 140, 0, y + hh); fg.addColorStop(0, "rgba(247,247,245,0)"); fg.addColorStop(1, "rgba(247,247,245,1)"); g.fillStyle = fg; g.fillRect(MX, y + hh - 140, CW, 140); }
    g.restore();
    return hh + 22;
  }
  function bStat(g, y, T){   // 숫자 칸 2~5개 (색 있는 값)
    if (!T || !T.items || !T.items.length) return 0;
    var it = T.items.slice(0, 5), n = it.length, gap = 12, w = (CW - gap * (n - 1)) / n, h = T.title ? 196 : 152, y0 = y;
    if (T.title){ g.fillStyle = SUB; font(g, 800, 24); g.fillText(T.title, MX + 4, y + 30); y0 = y + 44; }
    it.forEach(function(t, i){ var x = MX + i * (w + gap), sel = t.sel; rr(g, x, y0, w, 152, 20, sel ? "#eef2ff" : TILE); if (sel){ g.strokeStyle = "#3b5bdb"; g.lineWidth = 3; g.beginPath(); if (g.roundRect) g.roundRect(x + 1.5, y0 + 1.5, w - 3, 149, 19); else g.rect(x, y0, w, 152); g.stroke(); }
      g.fillStyle = SUB; font(g, 700, 22); wrap(g, t.l, x + 16, y0 + 36, w - 28, 24, 1);
      g.fillStyle = t.c === "up" ? UP : t.c === "dn" ? DN : t.c === "ok" ? "#2f9e44" : INK; var fs = n >= 5 ? 36 : 44; font(g, 800, fs); while (g.measureText(String(t.v)).width > w - 28 && fs > 22){ fs -= 2; font(g, 800, fs); } g.fillText(String(t.v), x + 16, y0 + 92);
      if (t.s){ g.fillStyle = MUT; font(g, 500, 20); wrap(g, t.s, x + 16, y0 + 128, w - 28, 22, 1); } });
    return (T.title ? 44 : 0) + 152 + 24;
  }
  function bNote(g, y, N){   // 글 상자 (정직 경고·설명) — tone: warn | info | dark
    if (!N || !N.t) return 0;
    var tone = N.tone || "info", bg = tone === "warn" ? "#fff4dc" : tone === "dark" ? "#1f2d4d" : "#eef2fa", fg = tone === "dark" ? "#f3f5fa" : INK, tw = CW - 56;
    font(g, 600, 26); var n = nLines(g, N.t, tw, N.max || 4), h = (N.h ? 50 : 22) + n * 36 + 24;
    rr(g, MX, y, CW, h, 20, bg);
    if (N.h){ g.fillStyle = tone === "warn" ? "#b7791f" : tone === "dark" ? "#d9a441" : ACC; font(g, 800, 24); g.fillText(N.h, MX + 28, y + 38); }
    g.fillStyle = fg; font(g, 600, 26); wrap(g, N.t, MX + 28, y + (N.h ? 50 : 22) + 28, tw, 36, N.max || 4);
    return h + 24;
  }
  function draw(C, name){
    var dyn = C.kind === "market" || C.kind === "stock" || C.kind === "screen";
    H = dyn ? 3400 : 1620;
    var c = document.createElement("canvas"); c.width = W; c.height = H; var g = ctx2d(c);
    g.fillStyle = BG; g.fillRect(0, 0, W, H);
    var d = kst(), y = 70;
    if (C.kind === "market") y = bannerMarket(g, C, name);
    else if (C.kind === "stock") y = bannerStock(g, C, name);
    else if (C.kind === "screen") y = bannerScreen(g, C, name);
    else {
      headLine(g, name, y, MUT, INK, SUB);
      y += 20; g.fillStyle = INK; font(g, 800, 52); y += wrap(g, C.title, MX, y + 52, CW, 60, 2);
      if (C.sub){ g.fillStyle = SUB; font(g, 500, 26); y += wrap(g, C.sub, MX, y + 36, CW, 34, 2) + 6; }
      y += 24;
    }
    var blocks;
    if (C.kind === "screen") blocks = C.blocks || [];
    else if (C.kind === "market") blocks = [["key", C.key], ["note", C.bear], ["note", C.reb], ["world", C.world], ["stars", C.stars], ["heat", C.heat], ["gauge", C.gauge], ["advice", C.advice, name], ["note", C.next], ["kpis", C.kpis2], ["rows", C.themes], ["alloc", C.alloc, false]];
    else if (C.kind === "port") blocks = [["chips", C.chips], ["alloc", C.alloc, true], ["line", C.line], ["kpis", C.kpis], ["rows", C.why, "text"], ["bullets", C.bullets], ["rows", C.sched, "text"]];
    else if (C.kind === "bond") blocks = [["kpis", C.kpis], ["timeline", C.timeline], ["tiles", C.tiles], ["risk", C.risk, C.riskTitle], ["bars", C.cmp], ["bullets", C.bullets]];
    else if (C.kind === "els") blocks = [["chips", C.chips], ["kpis", C.kpis], ["steps", C.steps], ["prob", C.prob], ["tiles", C.tiles], ["bullets", C.bullets]];
    else if (C.kind === "stock") blocks = [["chips", C.chips], ["kpis", C.kpis], ["chart", C.chart], ["glance", C.glance], ["news", C.news], ["advice", C.advice, name], ["fin", C.fin], ["dna5", C.dna], ["anl", C.anl]];
    else if (C.kind === "myels") blocks = [["kpis", C.kpis], ["ua", C.uabars], ["advice", C.advice, name], ["steps", C.steps]];
    else blocks = [["chips", C.chips], ["kpis", C.kpis], ["risk", C.risk], ["bars", C.bars], ["tiles", C.tiles], ["bullets", C.bullets]];
    var FN = {kpis: bKpis, chips: bChips, bars: bBars, bullets: bBullets, events: bEvents, alloc: bAlloc, line: bLine, tiles: bTiles, timeline: bTimeline, steps: bSteps, prob: bProb, rows: bRows, risk: bRisk, hero: bHero, world: bWorld, heat: bHeat, gauge: bGauge, advice: bAdvice, chart: bChart, dna: bDna, anl: bAnl, ua: bUa, glance: bGlance, news: bNews, dna5: bDna5, key: bKey, stars: bStars, fin: bFin, list: bList, stat: bStat, note: bNote, img: bImg};
    var c2 = document.createElement("canvas"); c2.width = W; c2.height = H; var g2 = ctx2d(c2);   // 먼저 재 보고 들어갈 때만 그림
    blocks.forEach(function(b){ if (!b || !b[1]) return; var hh = FN[b[0]](g2, 0, b[1], b[2]) || 0; if (!hh || y + hh > H - 104) return; FN[b[0]](g, y, b[1], b[2]); y += hh; });
    if (dyn && y + 130 < H){   // 내용만큼만 — 아래 빈 화면 없게
      var c3 = document.createElement("canvas"); c3.width = W; c3.height = Math.max(1350, y + 130); var g3 = ctx2d(c3);
      g3.fillStyle = BG; g3.fillRect(0, 0, W, c3.height); g3.drawImage(c, 0, 0, W, y, 0, 0, W, y); c = c3; g = g3; H = c3.height;
    }
    g.fillStyle = LINE; g.fillRect(MX, H - 96, CW, 2);
    g.fillStyle = MUT; font(g, 500, 21);
    wrap(g, (C.note ? C.note + " · " : "") + "참고용 자료 · 과거 성과는 미래 수익을 보장하지 않아요 · 투자 판단과 책임은 본인에게 있어요", MX, H - 58, CW, 28, 2);
    return c;
  }

  /* ───────────── ⭐ 관심종목 · 📌 내 고객 상품 · 🎯 내 ELS → 한 장씩 (10/28 12:50 「관심종목 포함」) ───────────── */
  var OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function oj(path){ return gj(OPD + path); }
  var DNAP = null, SIGP = null;
  function dnaOf(sym){ if (!DNAP) DNAP = oj("dna.json").then(function(j){ var m = {}; ((j && j.rows) || []).forEach(function(r){ m[r[0]] = r; }); return m; }).catch(function(){ return {}; }); return DNAP.then(function(m){ return m[sym] || null; }); }
  function sigOf(sym){ if (!SIGP) SIGP = gj(RAWM + "market/sigindex.json").then(function(j){ return (j && j.ix) || {}; }).catch(function(){ return {}; }); return SIGP.then(function(m){ var c = sym.split(".")[0]; return m[sym] || m[c] || null; }); }
  function pxOf(code){ return window.V && V.price ? V.price(code).catch(function(){ return null; }) : Promise.resolve(null); }
  function fullSym(code, p){ if (/^\d{6}$/.test(code)){ return pxOf(code).then(function(){ return code; }); } return Promise.resolve(code); }
  function josa(w){ var c = String(w).slice(-1), k = c.charCodeAt(0); if (k >= 0xAC00 && k <= 0xD7A3) return w + ((k - 0xAC00) % 28 ? "은" : "는"); return w + "은(는)"; }
  function wlItems(){ var W = (window.store && store.wl) || {}; return Object.keys(W).map(function(k){ var w = W[k]; return {kind: "stock", id: w.s || k, nm: w.n || k}; }); }
  function pinItems(){
    var L = []; try { L = JSON.parse(localStorage.getItem("cpin") || "[]") || []; } catch(x) {}
    var E = []; try { E = JSON.parse(localStorage.getItem("elsmy") || "[]") || []; } catch(x) {}
    return L.map(function(p){ return {kind: p.k === "fund" ? "fund" : "bond", k: p.k, id: p.id, nm: p.nm, pin: p}; }).concat(E.map(function(e){ return {kind: "myels", id: e.id, nm: e.nm, it: e}; }));
  }
  // 종목 한 장 (10/28 13:02 「디자인·그림·가독성 · 주가랑 뉴스가 어제꺼」 → 사진 머리 · 실시간 가격(wl_live.json, 10분마다) · 한눈에 4칸 · 오늘 뉴스 · 코멘트 · 점수·증권사)
  // 11/02 「종목 같이 누르니까 안 돼」 — 아이폰 사파리는 같은 사진을 앞서 종목 화면에서(허락 표시 없이) 본 적이 있으면 그 저장본을 써서
  //   그림판이 「오염」돼 그림 파일로 못 꺼냄(SecurityError) → 사진 주소 뒤에 표시를 붙여 늘 새로 받고, 그래도 오염되면 사진 빼고 다시 그림(safeDraw)
  function loadImg(url){ if (url) url += (url.indexOf("?") >= 0 ? "&" : "?") + "chx=1"; return new Promise(function(res){ if (!url) return res(null); var im = new Image(); im.crossOrigin = "anonymous"; var t = setTimeout(function(){ res(null); }, 3500); im.onload = function(){ clearTimeout(t); res(im); }; im.onerror = function(){ clearTimeout(t); res(null); }; im.src = url; }); }
  function shortAbout(t){   // 「○○는 자회사를 통해 한국, 중국…에서 X의 개발·판매에 참여하고 있습니다」 → 「X의 개발·판매를 해요」
    var a = String(t || "").split(/\.\s/)[0].replace(/\s+/g, " ").trim(); if (!a) return "";
    a = a.replace(/^.*?(?:는|은)\s+/, "").replace(/자회사(?:들)?[을를]? 통해\s*/, "");
    var RG = /^(?:(?:한국|중국|미국|일본|캐나다|유럽|미주|중동|아프리카|아시아 태평양|아시아|기타 아시아 지역|기타|대만|인도|전 세계(?:적으로)?|국제적으로|세계적으로|전 세계에서|지역|및|그리고)(?:,|의|에서)?\s*)+/;
    a = a.replace(RG, "");
    a = a.replace(/에 참여하고 있습니다$|을 영위하고 있습니다$|를 영위하고 있습니다$/, function(m){ return /참여/.test(m) ? "을 해요" : "을 해요"; }).replace(/합니다$/, "해요").replace(/있습니다$/, "있어요").replace(/입니다$/, "이에요");
    a = a.replace(/(판매|생산|개발|제조|서비스|유통|마케팅)을 해요$/, function(m, w){ return w + (/[가-힣]/.test(w) && (w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? "을" : "를") + " 해요"; });
    return a.length > 42 ? a.slice(0, 41) + "…" : a;
  }
  function mkStock(code, nm){
    code = String(code || ""); if (/^\d{6}\.K[SQ]$/.test(code)) code = code.slice(0, 6);
    var ks = /^\d{6}$/.test(code) ? [code + ".KS", code + ".KQ"] : [code];
    return Promise.all([pxOf(code), Promise.all(ks.map(function(k){ return oj("d/" + k + ".json"); })), Promise.all(ks.map(function(k){ return oj("e/" + k + ".json"); })), Promise.all(ks.map(dnaOf)), Promise.all(ks.map(sigOf)), gj("archive/x/live_kr.json" + q()), gj("archive/x/live_us_pre.json" + q()), window.__pbbrief ? __pbbrief() : null, gj("archive/x/wl_live.json" + q()), Promise.all(ks.map(function(k){ return oj("m/" + k + ".json"); }))]).then(function(r){
      var P = r[0], Dd = r[1].filter(Boolean)[0] || {}, E = r[2].filter(Boolean)[0] || {}, DN = r[3].filter(Boolean)[0], SG = r[4].filter(Boolean)[0], L = r[5], U = r[6], PB = r[7], WLv = ((r[8] || {}).q || {})[code], MD = r[9].filter(Boolean)[0] || {};
      if (!P && !WLv) return null;
      P = P || [WLv.t.slice(0, 10), WLv.p, WLv.prev, WLv.p, WLv.p, "", []];
      var kr = /^\d{6}$/.test(code), cur_ = kr ? "원" : (Dd.currency === "USD" || !Dd.currency ? "$" : " " + Dd.currency);
      var last = +P[1], prev = +P[2], hi = +P[3], lo = +P[4], wk = (P[6] || []).slice(), asof = P[0], live = false;
      var closed = false;
      if (WLv && WLv.p && WLv.t && WLv.t.slice(0, 10) >= String(P[0])){ last = +WLv.p; prev = WLv.prev ? +WLv.prev : prev; asof = WLv.t;
        var ago = (kst() - new Date(WLv.t.replace(" ", "T") + ":00Z")) / 60e3; live = ago < 45; closed = !live; }
      else if (kr && L && L.date === today() && P[0] < today()){
        var LV = {}; [].concat(L.value || [], L.movers || [], [].concat.apply([], (L.sectors || []).map(function(x){ return x.big || []; })), [].concat.apply([], (L.themes || []).map(function(x){ return x.lead || []; })), [].concat.apply([], (L.strong || []).map(function(x){ return x.lead || []; }))).forEach(function(x){ if (x && x.s) LV[x.s.split(".")[0]] = x; });
        var lv = LV[code]; if (lv && lv.p){ last = +lv.p; prev = lv.r != null ? last / (1 + lv.r / 100) : +P[1]; asof = today() + " " + (L.t || ""); live = true; }
      }
      hi = Math.max(hi, last); lo = Math.min(lo, last);
      if (wk.length) wk[wk.length - 1] = last;
      var d1 = prev ? (last / prev - 1) * 100 : null, r4 = wk.length > 5 ? (last / wk[wk.length - 5] - 1) * 100 : null, r13 = wk.length > 14 ? (last / wk[wk.length - 14] - 1) * 100 : null, r52 = wk.length >= 20 ? (last / wk[0] - 1) * 100 : null;
      var fromHi = hi ? (last / hi - 1) * 100 : null, posR = hi > lo ? (last - lo) / (hi - lo) * 100 : null;
      var fmtP = function(v){ return kr ? Math.round(v).toLocaleString() + "원" : (cur_ === "$" ? "$" + (+v).toFixed(2) : (+v).toFixed(2) + cur_); };
      var an = Dd.analyst || {}, tgt = an.target_mean, up = tgt && last ? (tgt / last - 1) * 100 : null;
      var mk = null; if (kr && L && L.date === today()){ var ix = (L.index || []).filter(function(x){ return x.name === "코스피"; })[0]; if (ix) mk = {n: "코스피", v: ix.chg}; }
      if (!kr && U && U.date === today()){ var es = (U.fut || []).filter(function(f){ return f.s === "ES=F"; })[0]; if (es) mk = {n: "S&P500 선물", v: es.chg}; }
      if (closed && !kr) mk = null;
      var earn = ((E.cal || {}).earn || []).filter(function(d){ return d >= today(); })[0];
      var tags = SG && SG.tags ? SG.tags.split("").filter(function(c){ return c.trim(); }) : [];
      var TAGN = {"☕": "☕ 컵 모양(돌파 대기)", "📈": "📈 갭 돌파", "🐋": "🐋 큰손 매수", "🤫": "🤫 조용한 매집", "🎯": "🎯 집중"};
      var nmS = nm || (Dd.ticker || {}).name || code;
      // 한눈에 4칸
      var trend = r13 == null ? null : r13 > 8 && (r4 == null || r4 > -5) ? ["📈", "상승 흐름", "석 달 " + pct(r13), UP] : r13 < -8 ? ["📉", "하락 흐름", "석 달 " + pct(r13), DN] : ["➡️", "옆걸음", "석 달 " + pct(r13), "#8a94a8"];
      var place = posR == null ? null : posR >= 80 ? ["🔝", "1년 높은 쪽", "최고가 " + pct(fromHi), UP] : posR <= 30 ? ["🔻", "1년 낮은 쪽", "최고가 " + pct(fromHi), DN] : ["📍", "1년 가운데", "최고가 " + pct(fromHi), "#8a94a8"];
      var val = DN && DN[3] != null ? (DN[3] >= 70 ? ["💰", "싼 편", "이익 대비 · " + DN[3] + "점", "#2f9e44"] : DN[3] <= 30 ? ["💸", "비싼 편", "이익 대비 · " + DN[3] + "점", UP] : ["⚖️", "보통", "이익 대비 · " + DN[3] + "점", "#8a94a8"]) : (Dd.pe ? ["⚖️", "PER " + (+Dd.pe).toFixed(1) + "배", "이익 대비 가격", "#8a94a8"] : null);
      var buyN = (an.strong_buy || 0) + (an.buy || 0), sellN = (an.sell || 0) + (an.strong_sell || 0);
      var pro = an.n_analysts ? (buyN / an.n_analysts >= 0.7 ? ["👍", "매수 우세", an.n_analysts + "곳 중 " + buyN + "곳", "#2f9e44"] : sellN / an.n_analysts >= 0.3 ? ["👎", "매도 많음", an.n_analysts + "곳 중 " + sellN + "곳", UP] : ["🤝", "의견 갈림", an.n_analysts + "곳", "#8a94a8"]) : null;
      var glance = [trend, place, val, pro].filter(Boolean);
      // 뉴스
      var news = WLv && WLv.news && WLv.news.length ? WLv.news.slice(0, 3).map(function(n){ var d = String(n.d || ""); return {t: n.t, s: (n.src || "") + (d.length >= 8 ? " · " + (d.slice(0, 8) === today().replace(/-/g, "") ? "오늘 " + d.slice(8, 10) + ":" + d.slice(10, 12) : d.slice(4, 6) + "/" + d.slice(6, 8)) : "")}; }) : null;
      // 📌 PB 코멘트
      var read = "", plan = [], watch = [];
      if (d1 != null){ var rel = mk ? d1 - mk.v : null; read = josa(nmS) + " " + (live ? "오늘 " : closed && !kr ? "지난밤 미국에서 " : "최근 거래일 ") + pct(d1) + (mk ? " — " + mk.n + "(" + pct(mk.v) + ")보다 " + (rel >= 0.5 ? "강해요" : rel <= -0.5 ? "약해요" : "비슷해요") : "") + ". "; }
      if (posR != null) read += posR >= 80 ? "1년 중 높은 쪽(최고가 대비 " + pct(fromHi) + ")이라 흐름은 좋지만 많이 오른 자리예요." : posR <= 30 ? "1년 중 낮은 쪽(최고가 대비 " + pct(fromHi) + ")이에요 — 싸 보이지만 내림이 멈췄는지 먼저 확인할 때예요." : "1년 가격 범위의 가운데쯤이에요.";
      if (r4 != null && r13 != null) read += " 한 달 " + pct(r4) + " · 석 달 " + pct(r13) + ".";
      if (r13 != null && r13 > 8 && (r4 == null || r4 > -5)) plan.push("흐름이 살아 있어요 — 들고 계시면 유지, 새로 담는다면 쉬어 가는 날에 나눠서.");
      else if (r13 != null && r13 < -8) plan.push("석 달째 내리는 흐름이에요 — 비중이 크면 일부 줄이고, 새로 담는 건 반등이 확인된 뒤에.");
      else if (r4 != null && r4 < -15) plan.push("한 달 새 크게 빠졌어요 — 한 번에 사기보다 2~3번 나눠서, 정한 비중 안에서만.");
      else plan.push("방향이 뚜렷하지 않아요 — 서두르지 말고 정한 비중 안에서만.");
      if (up != null && an.n_analysts) plan.push("증권사 " + an.n_analysts + "곳 평균 목표가 " + fmtP(tgt) + " — 지금보다 " + pct(up) + (up > 20 ? ", 여유가 있는 편이에요." : up < 0 ? ", 이미 넘어섰어요." : "."));
      if (earn) watch.push([earn === today() ? "오늘" : md(earn), "실적 발표 — 결과에 따라 크게 움직일 수 있어요"]);
      liveWatch((PB && PB.advice && PB.advice.watch) || []).slice(0, 2).forEach(function(w){ if (watch.length < 3) watch.push(w); });
      var tw = WLv && WLv.kr && WLv.kr.t && WLv.kr.t.slice(0, 10) === today() ? WLv.kr : null;
      if (tw){ read = "한국 본주 " + josa(tw.n) + " 지금(" + tw.t.slice(11, 16) + ") " + pct(tw.chg) + " — 오늘 밤 미국 주가도 이 흐름을 따라갈 가능성이 커요. 미국 상장 " + code + "는 " + read.replace(/^.*?(지난밤|오늘|최근 거래일)/, "$1"); }
      var kp = [{l: "한 달", v: pct(r4)}, {l: "석 달", v: pct(r13)}, wk.length >= 20 ? {l: wk.length >= 48 ? "1년" : "상장 후", v: pct(r52)} : {l: "최고가 대비", v: pct(fromHi)}, {l: "목표가까지", v: up != null ? pct(up) : "–"}];
      var top = {lab: live ? "지금 " + (asof.length > 10 ? asof.slice(11, 16) : "") + " · 실시간" : closed && !kr ? md(asof) + " 미국 마감 가격" : md(asof) + " 종가", price: fmtP(last), chg: d1,
        twin: tw ? "🇰🇷 한국 본주 " + tw.n + " 지금 " + Math.round(tw.p).toLocaleString() + "원 " + pct(tw.chg) : mk ? (mk.n + " " + pct(mk.v) + " 대비 " + (d1 - mk.v >= 0.5 ? "강해요 💪" : d1 - mk.v <= -0.5 ? "약해요" : "비슷해요")) : ""};
      var about = shortAbout(Dd.business_summary_ko);
      var finR = (Dd.financials || []).filter(function(x){ return x.revenue; }).slice(-4).map(function(x){ return {y: String(x.period).slice(0, 4), rev: x.revenue, op: x.operating_income}; });
      var krw = kr || (finR.length && Math.max.apply(null, finR.map(function(r){ return r.rev; })) > 3e12);
      var ffmt = function(v){ var a = Math.abs(v), sg = v < 0 ? "−" : ""; return krw ? (a >= 1e12 ? sg + (a / 1e12).toFixed(a >= 1e13 ? 0 : 1) + "조" : sg + Math.round(a / 1e8).toLocaleString() + "억") : (a >= 1e9 ? sg + "$" + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1) + "B" : sg + "$" + Math.round(a / 1e6) + "M"); };
      var fl = finR[finR.length - 1], fp = finR[finR.length - 2];
      var fin = finR.length >= 3 ? {rows: finR, fmt: ffmt, head: fl && fp ? "매출 " + pct((fl.rev / fp.rev - 1) * 100, 0) + (fl.op != null ? " · 이익률 " + Math.round(fl.op / fl.rev * 100) + "%" : "") : ""} : null;
      var dna = DN ? [{n: "성장", v: DN[1]}, {n: "수익성", v: DN[2]}, {n: "싸다", v: DN[3]}, {n: "주가 힘", v: DN[4]}, {n: "전문가", v: DN[5]}].filter(function(x){ return x.v != null; }) : null;
      var anl = an.n_analysts ? {n: an.n_analysts, sb: an.strong_buy || 0, b: an.buy || 0, h: an.hold || 0, s: sellN, tgt: tgt, up: up, lo: an.target_low, hi: an.target_high, last: last, fmt: fmtP} : null;
      return loadImg(MD.photo).then(function(img){
        var ind = (Dd.industry_ko || Dd.industry || "") + " " + nmS, EM = [[/반도체|메모리|hynix|하이닉스|Semicon/i, "💾"], [/자동차|Auto/i, "🚗"], [/배터리|2차전지|리튬|Albemarle|화학/i, "🔋"], [/바이오|제약|헬스|Pharma|Bio/i, "🧬"], [/은행|금융|보험|Bank|Financ/i, "🏦"], [/조선|해운|Ship/i, "🚢"], [/방산|항공|우주|Aero|Space|Defense/i, "🚀"], [/인터넷|소프트|플랫폼|Software|Internet|Meta|게임/i, "💻"], [/통신|네트워크|Network|Arista|Telecom/i, "📡"], [/에너지|정유|석유|Oil|Energy|전력|유틸/i, "⚡"], [/건설|Construction/i, "🏗️"], [/화장품|소비|유통|Retail|식품/i, "🛍️"], [/ETF|지수/i, "📊"]];
        var emo = "🏢"; for (var ei = 0; ei < EM.length; ei++) if (EM[ei][0].test(ind)){ emo = EM[ei][1]; break; }
        var SC = {"💾": "chip", "🚗": "car", "🔋": "battery", "🧬": "dna", "🏦": "bank", "🚢": "ship", "🚀": "rocket", "💻": "net", "📡": "net", "⚡": "energy", "🏗️": "build", "🛍️": "shop", "📊": "chart"};
        return {kind: "stock", emoji: emo, scene: SC[emo] || "chart", top: top, about: about, fin: fin, title: nmS + (kr ? "" : " · " + code), sub: [kr ? code : "", Dd.industry_ko || "", Dd.market_cap ? "시총 " + (kr ? Math.round(Dd.market_cap / 1e12).toLocaleString() + "조원" : "$" + Math.round(Dd.market_cap / 1e9).toLocaleString() + "B") : ""].filter(Boolean).join(" · "),
          img: img, live: live, asof: asof, chips: tags.map(function(t){ return TAGN[t] || ""; }).filter(Boolean),
          kpis: kp, chart: wk.length > 10 ? {v: wk, hi: hi, lo: lo, last: last, fmt: fmtP} : null, glance: glance.length >= 3 ? glance : null, news: news ? {title: "📰 최근 뉴스", items: news} : null,
          dna: dna && dna.length >= 4 ? dna : null, anl: anl,
          advice: {title: "이 종목, 이렇게 봐요", maxRead: 5, read: read.trim(), watch: watch.slice(0, 3), plan: plan.slice(0, 2)},
          note: (live ? "가격 " + asof.slice(5, 16).replace("-", "/") + " 기준(10~15분 늦을 수 있음) · " : closed && !kr ? "가격 " + asof.slice(5, 16).replace("-", "/") + " 미국 마감 기준 · " : "가격 " + md(asof) + " 종가 기준 · ") + "개별 종목 정보는 참고용이에요 · 매수·매도 권유가 아니에요"};
      });
    });
  }
  function bGlance(g, y, G){
    if (!G || !G.length) return 0;
    var n = G.length, gap = 12, w = (CW - gap * (n - 1)) / n, h = 168;
    G.forEach(function(x, i){ var xx = MX + i * (w + gap); rr(g, xx, y, w, h, 20, TILE); g.fillStyle = x[3]; g.fillRect(xx, y + 20, 6, h - 40);
      font(g, 600, 46); g.fillStyle = INK; g.fillText(x[0], xx + 22, y + 62);
      g.fillStyle = x[3] === "#8a94a8" ? INK : x[3]; font(g, 800, 30); wrap(g, x[1], xx + 22, y + 108, w - 34, 32, 1);
      g.fillStyle = MUT; font(g, 500, 20); wrap(g, x[2], xx + 22, y + 142, w - 34, 22, 1); });
    return h + 24;
  }
  function bNews(g, y, N){
    if (!N || !N.items || !N.items.length) return 0;
    var items = N.items, h = 46; font(g, 700, 26); items.forEach(function(it){ h += nLines(g, it.t, CW - 60, 2) * 34 + 38; }); h += 6;
    rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(N.title, MX + 22, y + 32);
    var yy = y + 46;
    items.forEach(function(it, i){ g.fillStyle = INK; font(g, 700, 26); yy += wrap(g, it.t, MX + 22, yy + 28, CW - 60, 34, 2); g.fillStyle = MUT; font(g, 500, 20); g.fillText(it.s, MX + 22, yy + 22); yy += 38;
      if (i < items.length - 1){ g.fillStyle = LINE; g.fillRect(MX + 22, yy - 8, CW - 44, 1); } });
    return h + 24;
  }
  function bDna5(g, y, D){   // 다섯 점수 — 작은 원형 게이지 5개
    if (!D || !D.length) return 0;
    var n = D.length, w = CW / n, h = 196; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("다섯 가지 점수 (100점 만점 · 같은 시장 종목과 비교)", MX + 22, y + 32);
    D.forEach(function(d, i){ var cx = MX + w * i + w / 2, cy = y + 112, R = 46, c = d.v >= 70 ? "#2f9e44" : d.v >= 40 ? "#d9a441" : "#d6453d";
      g.lineWidth = 12; g.strokeStyle = "#eef0f4"; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = c; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * d.v / 100); g.stroke(); g.lineCap = "butt";
      g.fillStyle = c; font(g, 800, 30); g.textAlign = "center"; g.fillText(String(d.v), cx, cy + 11); g.fillStyle = INK; font(g, 700, 22); g.fillText(d.n, cx, y + 184); g.textAlign = "left"; });
    return h + 24;
  }
  // 📌 담은 채권·펀드 → 상품 한 장 (products.json 에서 원본 찾기)
  function mkPin(it){
    return gj("archive/x/products.json" + q()).then(function(D){
      D = D || {}; var o = null, k = it.k;
      if (k === "krw") o = (D.krw || []).filter(function(b){ return b.code === it.id; })[0];
      else if (k === "fund") o = (D.funds || []).filter(function(f){ return f.c === it.id; })[0];
      else if (k === "ust" || k === "aud") o = ((D[k] || {}).items || []).filter(function(b){ return b.name === it.id; })[0];
      if (!o) return null;
      return mkProduct({k: k, o: o});
    });
  }
  // 🎯 내 ELS 지금 어디쯤 (관제탑 계산 그대로)
  function mkMyEls(it){
    var E = window.__elsMy; if (!E) return Promise.resolve(null);
    return E.load().then(function(){ var qk = E.parseKey(it.key); return Promise.all(qk.ua.map(E.epx)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var G = E.align(ss); G.K = G.C.map(E.sparse); var M = E.monitor(it, G); if (!M || M.wait) return null;
      var dt = function(t){ return new Date(t * 864e5).toISOString().slice(0, 10); };
      if (M.done) return {kind: "myels", title: it.nm, sub: "내 ELS · " + (M.done.k + 1) + "차 평가(" + M.done.d + ")에 조기상환 조건 충족", kpis: [{l: "결과", v: "상환 조건 충족", neutral: true}], note: "실제 상환은 증권사 공지로 확인하세요"};
      var ua = qk.ua, bars = qk.bars, nx = M.next;
      var dd = nx ? Math.round(nx.t - Date.parse(today() + "T00:00:00Z") / 864e5) : null;
      var items = ua.map(function(n, i){ return {n: n, v: (M.cur[i] * 100)}; });
      var worst = Math.min.apply(null, items.map(function(x){ return x.v; })), gap = nx ? worst - nx.bar : null;
      var read = "가장 많이 빠진 기초자산이 처음 가격의 " + worst.toFixed(0) + "%예요. " + (nx ? (gap >= 0 ? "다음 평가 기준(" + nx.bar + "%)보다 " + gap.toFixed(0) + "%p 위라 지금 그대로면 " + (nx.k + 1) + "차에 상환돼요." : "다음 평가 기준(" + nx.bar + "%)까지 " + (-gap).toFixed(0) + "%p 모자라요 — 남은 평가에서 회복을 기다리는 구간이에요.") : "");
      if (qk.ki != null) read += M.kt ? " 낙인(" + qk.ki + "%)에 한 번 닿았어요 — 만기에 마지막 기준을 넘어야 원금이 지켜져요." : " 낙인(" + qk.ki + "%)까지는 " + (worst - qk.ki).toFixed(0) + "%p 여유가 있어요.";
      return {kind: "myels", title: it.nm, sub: "내 ELS 지금 위치 · 가입 기준 " + M.base + " · 만기 " + M.mat,
        kpis: [{l: "다음 평가", v: nx ? "D-" + Math.max(0, dd) : "–", s: nx ? (nx.k + 1) + "차 · " + dt(nx.t).slice(5).replace("-", "/") : "", neutral: true}, {l: "평가 기준", v: nx ? nx.bar + "%" : "–", neutral: true}, {l: "가장 약한 자산", v: worst.toFixed(0) + "%", neutral: true}],
        uabars: {items: items, bar: nx ? nx.bar : null, ki: qk.ki}, steps: {bars: bars, ki: qk.ki},
        advice: {title: "내 ELS, 이렇게 봐요", read: read, watch: nx ? [[dt(nx.t).slice(5).replace("-", "/"), (nx.k + 1) + "차 평가 — 모두 " + nx.bar + "% 위면 상환"]] : [], plan: [gap != null && gap >= 5 ? "지금은 여유 있게 상환 쪽이에요 — 그대로 지켜보면 돼요." : gap != null && gap >= 0 ? "기준 바로 위예요 — 평가일까지 흔들릴 수 있어요." : "당장 상환은 어려워요 — 다음 평가들과 낙인 여유를 같이 보세요."]},
        note: "과거·현재 가격으로 계산한 위치예요 · 실제 상환은 증권사 공지로 확인하세요"};
    }); }).catch(function(){ return null; });
  }
  // 그림 블록: 1년 주간 차트 · 다섯 가지 점수 · 증권사 의견 · 기초자산 위치
  function bChart(g, y, Cc){
    if (!Cc) return 0;
    var h = 300; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("최근 1년 흐름 (주간)", MX + 22, y + 32);
    var v = Cc.v, x0 = MX + 22, x1 = W - MX - 150, y0 = y + 60, y1 = y + h - 40, mn = Math.min(Cc.lo, Math.min.apply(null, v)), mx = Math.max(Cc.hi, Math.max.apply(null, v)); if (mx === mn) mx = mn + 1;
    var X = function(i){ return x0 + (x1 - x0) * i / (v.length - 1); }, Y = function(p){ return y1 - (p - mn) / (mx - mn) * (y1 - y0); };
    var col = v[v.length - 1] >= v[0] ? UP : DN;
    g.beginPath(); v.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); g.fillStyle = col === UP ? "rgba(214,69,61,.10)" : "rgba(47,111,221,.10)"; g.fill();
    g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = "round"; g.beginPath(); v.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(X(v.length - 1), Y(v[v.length - 1]), 9, 0, 7); g.fill();
    font(g, 600, 21); g.textAlign = "left";
    [[Cc.hi, "1년 최고 ", "#8a94a8"], [Cc.lo, "1년 최저 ", "#8a94a8"]].forEach(function(z){ g.strokeStyle = "#e1e4ea"; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x0, Y(z[0])); g.lineTo(x1, Y(z[0])); g.stroke(); g.setLineDash([]); g.fillStyle = z[2]; g.fillText(z[1] + Cc.fmt(z[0]), x1 + 12, Y(z[0]) + 7); });
    g.fillStyle = col; font(g, 800, 22); g.fillText("지금 " + Cc.fmt(Cc.last), x1 + 12, Math.min(Math.max(Y(Cc.last) + 7, Y(Cc.hi) + 34), Y(Cc.lo) - 20));
    return h + 24;
  }
  function bDna(g, y, D){
    if (!D || !D.length) return 0;
    var h = 40 + D.length * 44 + 10; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("다섯 가지 점수 (0~100, 같은 시장 종목과 비교)", MX + 22, y + 32);
    D.forEach(function(d, i){ var yy = y + 44 + i * 44; g.fillStyle = INK; font(g, 700, 25); g.fillText(d.n, MX + 22, yy + 26);
      var bx = MX + 170, bw = CW - 170 - 100; g.fillStyle = "#eef0f4"; rr(g, bx, yy + 8, bw, 22, 11, "#eef0f4"); var c = d.v >= 70 ? "#2f9e44" : d.v >= 40 ? "#d9a441" : "#d6453d"; rr(g, bx, yy + 8, Math.max(22, bw * d.v / 100), 22, 11, c);
      g.fillStyle = c; font(g, 800, 26); g.textAlign = "right"; g.fillText(String(d.v), W - MX - 22, yy + 28); g.textAlign = "left"; });
    return h + 24;
  }
  function bAnl(g, y, A){
    if (!A) return 0;
    var h = 190; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("증권사 의견 " + A.n + "곳", MX + 22, y + 32);
    var tot = A.sb + A.b + A.h + A.s || 1, x = MX + 22, bw = CW - 44, parts = [[A.sb, "적극 매수", "#1f7a3a"], [A.b, "매수", "#2f9e44"], [A.h, "보유", "#d9a441"], [A.s, "매도", "#d6453d"]];
    parts.forEach(function(p_){ var w = bw * p_[0] / tot; if (w <= 0) return; g.fillStyle = p_[2]; g.fillRect(x, y + 50, w, 30); if (w > 70){ g.fillStyle = "#fff"; font(g, 700, 20); g.fillText(p_[1] + " " + p_[0], x + 8, y + 72); } x += w; });
    if (A.tgt){ var lo = A.lo || A.tgt, hi = A.hi || A.tgt, mn = Math.min(lo, A.last), mx = Math.max(hi, A.last), X = function(v){ return MX + 40 + (CW - 80) * (v - mn) / ((mx - mn) || 1); };
      g.strokeStyle = "#dfe3ea"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(X(lo), y + 122); g.lineTo(X(hi), y + 122); g.stroke();
      g.fillStyle = "#3b5bdb"; g.beginPath(); g.arc(X(A.tgt), y + 122, 11, 0, 7); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(X(A.last), y + 122, 9, 0, 7); g.fill();
      font(g, 600, 20); g.fillStyle = MUT; g.fillText("목표가 범위 " + A.fmt(lo) + " ~ " + A.fmt(hi), MX + 22, y + 170);
      g.textAlign = "right"; g.fillStyle = "#3b5bdb"; font(g, 800, 22); g.fillText("● 평균 " + A.fmt(A.tgt) + " (" + pct(A.up) + ")   ", W - MX - 22 - 130, y + 170); g.fillStyle = INK; g.fillText("● 지금", W - MX - 22, y + 170); g.textAlign = "left"; }
    return h + 24;
  }
  function bUa(g, y, U_){
    if (!U_ || !U_.items) return 0;
    var items = U_.items, h = 76 + items.length * 64 + 20; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("기초자산 지금 위치 (처음 가격 = 100)", MX + 22, y + 32);
    var bx = MX + 230, bw = CW - 230 - 120, lo = Math.min(U_.ki != null ? U_.ki - 5 : 50, Math.min.apply(null, items.map(function(x){ return x.v; })) - 5), hi = Math.max(120, Math.max.apply(null, items.map(function(x){ return x.v; })) + 5), X = function(v){ return bx + bw * (v - lo) / (hi - lo); };
    items.forEach(function(it, i){ var yy = y + 76 + i * 64; g.fillStyle = INK; font(g, 700, 25); wrap(g, it.n, MX + 22, yy + 32, 200, 28, 1);
      g.fillStyle = "#eef0f4"; g.fillRect(bx, yy + 16, bw, 24); var c = U_.bar != null && it.v >= U_.bar ? "#2f9e44" : U_.ki != null && it.v < U_.ki ? UP : "#d9a441"; g.fillStyle = c; g.fillRect(bx, yy + 16, Math.max(4, X(it.v) - bx), 24);
      g.fillStyle = c; font(g, 800, 26); g.textAlign = "right"; g.fillText(it.v.toFixed(0) + "%", W - MX - 22, yy + 36); g.textAlign = "left"; });
    var yb = y + 74, ye = y + h - 14;
    [[U_.bar, "#3b5bdb", "평가 기준 "], [U_.ki, UP, "낙인 "], [100, "#9aa0ab", ""]].forEach(function(z){ if (z[0] == null) return; g.strokeStyle = z[1]; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(X(z[0]), yb); g.lineTo(X(z[0]), ye); g.stroke(); g.setLineDash([]); if (z[2]){ g.fillStyle = z[1]; font(g, 700, 19); g.textAlign = "center"; g.fillText(z[2] + z[0], X(z[0]), yb - 8); g.textAlign = "left"; } });
    return h + 24;
  }

  // 고르기 창: 시황만 / 관심종목 포함
  function chooser(){
    var old = document.getElementById("opch"); if (old) old.remove();
    var W_ = wlItems(), P_ = pinItems(), all = W_.concat(P_);
    var box = document.createElement("div"); box.id = "opch";
    var row = function(it, i){ var ic = it.kind === "stock" ? "⭐" : it.kind === "myels" ? "🎯" : it.kind === "fund" ? "📦" : "🏦"; return '<label class="opc-r"><input type="checkbox" data-i="' + i + '"><span>' + ic + '</span><b>' + String(it.nm).replace(/[<>&]/g, "").slice(0, 26) + '</b><small>' + (it.kind === "stock" ? it.id : it.kind === "myels" ? "내 ELS" : it.kind === "fund" ? "펀드" : "채권") + '</small></label>'; };
    box.innerHTML = '<div class="opc-s"><h3>📨 보내기</h3>' +
      '<label class="opc-n">✍️ 보내는 사람 <input id="opcnm" maxlength="30" placeholder="내 이름 (예: 김OO PB · 비워도 돼요)" value="' + String(ls("pbname") || "").replace(/[&<>"]/g, "") + '"></label>' + cliHTML() +
      '<button class="opc-b main" data-m="mkt">📊 시황만 <small>시장 한 장</small></button>' +
      '<button class="opc-b" data-m="pick">⭐ 종목·상품 고르기 <small>고른 종목·상품 한 장씩 · 시황은 넣어도 빼도 돼요</small></button>' +
      '<div id="opcl" hidden>' + (all.length ? '<label class="opc-wm"><span>📊 시황 한 장도 같이 보내기</span><input type="checkbox" role="switch" id="opcwm"' + (ls("opc_wm") === "0" ? "" : " checked") + '><i></i></label><div class="opc-h"><span>보낼 것 고르기</span><button type="button" data-all="1">전체</button></div><div class="opc-list">' + all.map(row).join("") + '</div><button class="opc-go" id="opcgo" disabled>골라 주세요</button>' :
        '<p class="note">⭐ 관심종목이나 📌 담아 둔 상품이 아직 없어요. 종목 화면의 ☆, 상품 카드의 「📌 담아 두기」, ELS 관제탑으로 담아 주세요.</p>') + '</div>' +
      '<button class="opc-x" data-x="1">닫기</button></div>';
    document.body.appendChild(box); cliBind(box);
    // 11/02 진짜 원인: 「📊 시황 한 장도 같이」 스위치도 체크박스라 고른 목록에 빈 항목으로 끼어들어 → 만들기 첫 줄에서 오류로 멈춤(시황만·종목 화면에서 보내기는 됨)
    var sel = function(){ return [].filter.call(box.querySelectorAll('input[type=checkbox][data-i]'), function(c){ return c.checked; }).map(function(c){ return all[+c.dataset.i]; }).filter(Boolean); };
    var withM = function(){ var c = document.getElementById("opcwm"); return !c || c.checked; };
    var upd = function(){ var b = document.getElementById("opcgo"); if (!b) return; var n = sel().length, wm = withM(); b.disabled = !n; b.textContent = n ? (wm ? "시장 한 장 + " + n + "장 = " + (n + 1) + "장 만들기" : n + "장만 만들기 (시황 없이)") : "골라 주세요"; };
    box.addEventListener("change", function(ev){ if (ev.target && ev.target.id === "opcwm") ls("opc_wm", ev.target.checked ? "1" : "0"); upd(); });
    var nmI = document.getElementById("opcnm"); if (nmI) nmI.addEventListener("input", function(){ ls("pbname", nmI.value.trim().slice(0, 30)); });
    box.addEventListener("click", function(ev){
      var t = ev.target; if (t === box || t.closest("[data-x]")){ box.remove(); return; }
      var m = t.closest("[data-m]"); if (m){ if (m.dataset.m === "mkt"){ box.remove(); go(null, true); } else { document.getElementById("opcl").hidden = false; m.classList.add("on"); } return; }
      if (t.closest("[data-all]")){ var cs = box.querySelectorAll('input[type=checkbox][data-i]'), on = [].some.call(cs, function(c){ return !c.checked; }); [].forEach.call(cs, function(c){ c.checked = on; }); upd(); return; }
      if (t.closest("#opcgo")){ var L = sel(), wm = withM(); box.remove(); goMany(L, wm); }
    });
  }
  // 🔍 종목리포트 화면에서 그 종목 한 장만 바로 (10/28 14:25)
  document.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-opstk]"); if (!b) return; ev.stopPropagation(); ask("이 종목 한 장 보내기", function(){ goMany([{kind: "stock", id: b.dataset.opstk, nm: b.dataset.nm || ""}], false); }); }, true);
  // 🔧 11/02 보내기 진단 — 어느 단계에서 막히는지 화면에 그대로 보여 줌 (사진 한 장이면 원인을 바로 앎)
  var DG = [];
  function dgLive(){ var o = document.getElementById("oplive"); if (!o) return; o.innerHTML = '<pre style="margin:0;font:inherit;white-space:pre-wrap;color:#e8e8e8">' + esc0("📨 만드는 중 · 앱 " + (window.APPV || "?") + "\n" + DG.slice(-6).join("\n")) + '</pre>'; }
  // 진단을 사용자 화면 캡처 없이 받기 위해 익명 진단 주제로도 보냄 (앱 버전·기기·단계 기록만 · 개인 정보 없음)
  var DGT = "chkchp-ch-diag-p4k9", dgSid = Math.random().toString(36).slice(2, 8), dgTm = null;
  function dgSend(){ dgTm = null; try { fetch("https://ntfy.sh/" + DGT, {method: "POST", keepalive: true, body: JSON.stringify({sid: dgSid, v: window.APPV || "", ua: (navigator.userAgent.match(/OS [\d_]+|Android [\d.]+/) || [""])[0] + (navigator.standalone ? " 홈앱" : ""), log: DG.slice(-25)})}).catch(function(){}); } catch(x) {} }
  function dg(m){ var d = new Date(); setTimeout(dgLive, 0); if (!dgTm) dgTm = setTimeout(dgSend, DG.length ? 700 : 0); DG.push(("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + " " + m); if (DG.length > 40) DG.shift(); try { localStorage.setItem("opdiag", DG.join("\n")); } catch(x) {} }
  function dgShow(head){ var lv0 = document.getElementById("oplive"); if (lv0) lv0.remove(); var o = document.getElementById("opdiag"); if (o) o.remove(); o = document.createElement("div"); o.id = "opdiag"; o.className = "no-clp"; o.setAttribute("data-xc", "1"); o.setAttribute("data-cz", "done");
    o.style.cssText = "position:fixed;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom) + 80px);z-index:100010;background:#111;color:#e8e8e8;border:2px solid #fee500;border-radius:12px;padding:10px 12px;font:12px/1.45 monospace;max-height:50vh;overflow:auto;white-space:pre-wrap";
    o.innerHTML = '<pre style="margin:0;font:inherit;white-space:pre-wrap;color:#e8e8e8">' + esc0("🔧 " + head + "\n앱 " + (window.APPV || "?") + " · " + (navigator.userAgent.match(/OS [\d_]+/) || [""])[0] + "\n" + DG.join("\n") + "\n\n(이 화면을 캡처해 보내 주세요 · 누르면 닫힘)") + '</pre>';
    o.onclick = function(){ o.remove(); }; document.body.appendChild(o); }
  function goMany(L, withMkt){ L = (L || []).filter(Boolean); return goMany0(L, withMkt); }
  function goMany0(L, withMkt){   // 10/28 14:25 「종목만 따로 보낼 수 있게 — 반드시 시황과 같이가 아닌」 → withMkt=false 면 시황 빼고
    if (withMkt === undefined) withMkt = true;
    toast((withMkt ? "시장 한 장 + " : "") + L.length + "장 만드는 중…");
    var lv = document.getElementById("oplive"); if (lv) lv.remove(); lv = document.createElement("div"); lv.id = "oplive"; lv.className = "no-clp"; lv.setAttribute("data-xc", "1"); lv.setAttribute("data-cz", "done");
    lv.style.cssText = "position:fixed;left:10px;right:10px;top:calc(env(safe-area-inset-top) + 70px);z-index:100009;background:rgba(17,17,17,.92);color:#e8e8e8;border:2px solid #fee500;border-radius:12px;padding:8px 10px;font:12px/1.45 monospace;white-space:pre-wrap;pointer-events:none";
    document.body.appendChild(lv);
    DG = []; dgSid = Math.random().toString(36).slice(2, 8); dg("시작 · 시황 " + (withMkt ? "넣음" : "뺌") + " · " + L.map(function(it){ return it.kind + ":" + (it.id || it.nm || ""); }).join(", ")); dgSend();
    var nm = pbname(), done = false;
    // 11/02 「만드는 중…」에서 멈춘 채 아무것도 안 뜨던 것 — 자료 받기·그림 굽기 어디서든 멈추면 25초 뒤 진단을 띄움
    var wd = setTimeout(function(){ if (!done){ dg("⏰ 45초 넘게 안 끝남"); dgShow("멈춤 — 시간 초과"); } }, 45000);
    var jobs = (withMkt ? [mkMarket] : []).concat(L.map(function(it){ return function(){ return it.kind === "stock" ? mkStock(it.id, it.nm) : it.kind === "myels" ? mkMyEls(it.it) : mkPin(it.pin); }; }));
    // 자료는 같이 받되 한 가지가 멈춰도 15초면 그것만 빼고 감
    new Promise(function(r){ setTimeout(r, 80); }).then(function(){ dg("자료 받는 중…"); return Promise.all(jobs.map(function(fn, j){ return withTO(new Promise(function(r){ setTimeout(r, 30 * j); }).then(fn), 15000).then(function(C){ dg("자료 " + (j + 1) + " " + (C ? (C.refuse ? "거절" : "ok " + (C.title || "")) : "없음(null)")); return C; }, function(e){ dg("자료 " + (j + 1) + " 실패 " + ((e && (e.name + ": " + e.message)) || e)); return null; }); })); }).then(function(Cs){
      var ok = Cs.filter(function(C){ return C && !C.refuse; }), miss = Cs.length - ok.length;
      if (!ok.length){ done = true; clearTimeout(wd); toast("자료를 못 가져왔어요"); dgShow("자료를 못 가져옴"); return; }
      // 그림은 한 장씩: 그리고 → 파일로 → 그림판 비우고 → 다음 (아이폰 그림판 메모리 한도)
      var fs = [];
      dg("자료 끝 · 그림 " + ok.length + "장 시작");
      return ok.reduce(function(p, C, j){ return p.then(function(){ return new Promise(function(r){ setTimeout(r, 60); }); }).then(function(){   // 단계마다 화면에 한 번 숨 쉬게(진행판이 그려지게)
        dg("그림 " + (j + 1) + " 그리는 중… (" + (C.kind || "") + " " + (C.title || "") + ")");
        return new Promise(function(r){ setTimeout(r, 60); });
      }).then(function(){
        var t0 = Date.now(), c; try { c = safeDraw(C, nm); dg("그림 " + (j + 1) + " " + c.width + "x" + c.height + " · " + (Date.now() - t0) + "ms" + (C.img ? " 사진있음" : "") + (tainted(c) ? " ⚠오염" : "")); } catch(e){ dg("그림 " + (j + 1) + " 실패 " + ((e && (e.name + ": " + e.message)) || e)); return; }
        dg("파일 " + (j + 1) + " 바꾸는 중…");
        return blobOf(c).then(function(b){ try { c.width = c.height = 0; } catch(x) {}
          dg("파일 " + (j + 1) + " " + (b ? Math.round(b.size / 1024) + "KB " + b.type : "못 만듦"));
          if (b) fs.push(new File([b], (j + 1) + "_" + (cliLab() ? CLIENT.replace(/[^\w가-힣]+/g, "") + "님_" : "") + (C.title || "한장").replace(/[^\w가-힣]+/g, "_").slice(0, 24) + "_" + kst().toISOString().slice(5, 10).replace("-", "") + (b.type === "image/jpeg" ? ".jpg" : ".png"), {type: b.type || "image/png"})); });
      }); }, Promise.resolve()).then(function(){
        done = true; clearTimeout(wd);
        if (!fs.length){ dgShow("파일을 못 만듦"); toast("만들지 못했어요"); return; }
        dg("준비 창 열기 · " + fs.length + "장 · canShare " + (function(){ try { return navigator.canShare ? navigator.canShare({files: fs}) : "없음"; } catch(e){ return "오류 " + e.name; } })());
        cliDone(); readySheet(fs, "시장 한 장" + (fs.length > 1 ? " 외 " + (fs.length - 1) + "장" : ""));
        if (miss) toast(miss + "개는 자료가 없어 뺐어요");
      });
    }).catch(function(e){ done = true; clearTimeout(wd); console.warn(e); dg("멈춤 " + ((e && (e.name + ": " + e.message)) || e)); toast("만들지 못했어요 (" + ((e && e.name) || "?") + ")"); dgShow("만들기 실패"); });
  }
  function withTO(p, ms){ return new Promise(function(ok, no){ var t = setTimeout(function(){ var e = new Error(ms / 1000 + "초 안에 안 끝남"); e.name = "Timeout"; no(e); }, ms); p.then(function(v){ clearTimeout(t); ok(v); }, function(e){ clearTimeout(t); no(e); }); }); }
  // 그림 → 파일: toBlob 이 아이폰에서 답을 안 주는 경우가 있어 6초 뒤엔 toDataURL 로 직접 바꿈 · 그래도 안 되면 JPEG
  function blobOf(c){
    return new Promise(function(ok){
      var fin = false, end = function(b){ if (!fin){ fin = true; ok(b); } };
      var viaURL = function(type, q){ try { var u = c.toDataURL(type, q), bs = atob(u.split(",")[1]), a = new Uint8Array(bs.length); for (var i = 0; i < bs.length; i++) a[i] = bs.charCodeAt(i); return a.length > 1000 ? new Blob([a], {type: type}) : null; } catch(e){ dg("dataURL 실패 " + e.name); return null; } };
      setTimeout(function(){ if (!fin){ dg("toBlob 응답 없음 → 직접 변환"); end(viaURL("image/png") || viaURL("image/jpeg", 0.9)); } }, 6000);
      try { c.toBlob(function(b){ if (b && b.size > 1000) end(b); else { dg("toBlob 빈 결과 → JPEG"); end(viaURL("image/jpeg", 0.9)); } }, "image/png"); }
      catch(e){ dg("toBlob 오류 " + e.name); end(viaURL("image/jpeg", 0.9)); }
    });
  }
  function tainted(c){ try { c.getContext("2d").getImageData(0, 0, 1, 1); return false; } catch(e){ return true; } }
  function safeDraw(C, nm){ var c = draw(C, nm); if (!tainted(c)) return c; try { c.width = c.height = 0; } catch(x) {} var C2 = {}; for (var k in C){ var v = C[k]; C2[k] = (v && (v instanceof HTMLImageElement || v instanceof HTMLCanvasElement || (v.c && v.c instanceof HTMLCanvasElement))) ? null : v; } return draw(C2, nm); }
  function shareMany(arr){
    return Promise.all(arr.map(function(a, i){ return new Promise(function(res){ a.c.toBlob(function(b){ dg("파일 " + (i + 1) + " " + (b ? Math.round(b.size / 1024) + "KB" : "못 만듦(null)")); try { a.c.width = a.c.height = 0; } catch(x) {} res(b ? new File([b], (i + 1) + "_" + (a.t || "한장").replace(/[^\w가-힣]+/g, "_").slice(0, 24) + "_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", {type: "image/png"}) : null); }, "image/png"); }); })).then(function(fs){
      fs = fs.filter(Boolean); if (!fs.length) throw new Error("blob");
      dg("준비 창 열기 · " + fs.length + "장 · canShare " + (function(){ try { return navigator.canShare ? navigator.canShare({files: fs}) : "없음"; } catch(e){ return "오류 " + e.name; } })());
      readySheet(fs, "시장 한 장" + (fs.length > 1 ? " 외 " + (fs.length - 1) + "장" : ""));
    });
  }
  /* 🛠 10/28 사용자 「보내기 했더니 카톡이나 문자로 연결 안 돼」 — 아이폰은 「누른 바로 그 순간」에만 공유창을 열어 줌.
     그림을 만드는 동안(자료 받기·그림 굽기) 그 순간이 지나가 공유창이 막혔던 것 → 다 만든 뒤 「카톡·문자로 보내기」 단추를 한 번 더 누르게(그 누름에서 바로 공유창). */
  function esc0(t){ return String(t || "").replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function readySheet(fs, title){
    var lv0 = document.getElementById("oplive"); if (lv0) lv0.remove(); var dg0 = document.getElementById("opdiag"); if (dg0) dg0.remove();   // 늦게라도 다 되면 진단 상자는 치움
    var old = document.getElementById("opready"); if (old) old.remove();
    var box = document.createElement("div"); box.id = "opready"; box.className = "no-clp"; box.setAttribute("data-xc", "1"); box.setAttribute("data-cz", "done");
    var urls = fs.map(function(f){ return URL.createObjectURL(f); });
    // 11/02 사용자 「보내기 한 다음 연결 프로그램이 안 나와」 — 아이폰은 파일과 제목(글)을 같이 넘기면 카톡 등이 목록에서 빠지거나 공유창이 안 뜨는 경우가 있어
    //   파일만 넘김 · canShare 가 거짓이어도 공유 단추는 보여 주고(아이폰 일부에서 잘못 거짓), 실패하면 이유를 같이 알려 줌
    var can = !!navigator.share;
    var img = /^image\//.test(fs[0].type);
    box.innerHTML = '<div class="opr-s"><h3>📨 ' + (img ? (fs.length > 1 ? fs.length + "장이" : "한 장이") : "파일이") + ' 준비됐어요</h3>' +
      '<div class="opr-im">' + urls.map(function(u, i){ return '<div class="opr-c">' + (/^image\//.test(fs[i].type) ? '<img src="' + u + '" alt="">' : '<div class="opr-f">📄 ' + esc0(fs[i].name) + '</div>') +
        (can && fs.length > 1 ? '<button class="opr-one" type="button" data-i="' + i + '">💬 이 장 보내기</button>' : '') + '</div>'; }).join("") + '</div>' +
      (can ? '<button class="opr-go" type="button">💬 카톡·문자로 ' + (fs.length > 1 ? "모두 보내기 (" + fs.length + "장)" : "보내기") + '</button>' : '') +
      (can && fs.length > 1 ? '<p class="opr-n">한꺼번에 안 열리면 그림 아래 「💬 이 장 보내기」로 한 장씩 보내 주세요</p>' : '') +
      '<button class="opr-sv" type="button">' + (img ? (can ? "⬇️ 사진으로 저장" : "⬇️ 그림 저장 (사진에서 보내기)") : "⬇️ 파일 저장") + '</button>' +
      (img ? '<p class="opr-n">그림을 길게 눌러도 저장·공유할 수 있어요</p>' : '') +
      '<button class="opr-x" type="button">닫기</button><button class="opr-dg" type="button" style="display:block;margin:8px auto 0;background:none;border:0;color:var(--sub);font:inherit;font-size:12px;text-decoration:underline">🔧 안 되면 눌러서 진단 보기</button></div>';
    function close(){ box.remove(); setTimeout(function(){ urls.forEach(function(u){ URL.revokeObjectURL(u); }); }, 60000); }
    box.addEventListener("click", function(ev){
      var t = ev.target;
      if (t === box || t.closest(".opr-x")) return close();
      if (t.closest(".opr-dg")) return dgShow("진단 (준비 창)");
      var one = t.closest(".opr-one");
      if (one){   // 11/02 「종목 같이 누르니까 안 돼」 — 아이폰은 여러 장을 한꺼번에 넘기면 공유창이 안 뜨는 경우가 있어 한 장씩도 보낼 수 있게
        var f1 = fs[+one.dataset.i], p1; try { p1 = navigator.share({files: [f1]}); } catch(e){ p1 = Promise.reject(e); }
        dg("한 장 보내기 누름 · " + f1.name + " " + Math.round(f1.size / 1024) + "KB");
        p1.then(function(){ dg("한 장 공유 성공"); one.textContent = "✓ 보냈어요"; one.classList.add("done"); }).catch(function(e){ dg("한 장 공유 실패 " + ((e && (e.name + ": " + e.message)) || e)); if (e && e.name === "AbortError") return; dgShow("한 장 공유 실패"); toast("공유창을 못 열었어요 (" + ((e && e.name) || "?") + ") — 그림을 길게 눌러 저장해 주세요"); });
        return;
      }
      if (t.closest(".opr-go")){
        var p; try { p = navigator.share({files: fs}); } catch(e){ p = Promise.reject(e); }
        dg("모두 보내기 누름 · " + fs.length + "장");
        p.then(function(){ dg("공유 끝(성공)"); close(); }).catch(function(e){ dg("공유 실패 " + ((e && (e.name + ": " + e.message)) || e)); if (e && e.name === "AbortError") return; console.warn(e); dgShow("공유 실패"); try { localStorage.setItem("share_err", (e && (e.name + ": " + e.message)) || "?"); } catch(x) {}
          toast(fs.length > 1 ? "한꺼번에는 안 열려요 (" + ((e && e.name) || "?") + ") — 그림 아래 「💬 이 장 보내기」로 한 장씩 보내 주세요" : "공유창을 못 열었어요 (" + ((e && e.name) || "?") + ") — 「사진으로 저장」 뒤 카톡에서 보내 주세요"); });
        return;
      }
      if (t.closest(".opr-sv")){
        fs.forEach(function(f, i){ setTimeout(function(){ var a = document.createElement("a"); a.href = urls[i]; a.download = f.name; a.target = "_blank"; document.body.appendChild(a); a.click(); a.remove(); }, i * 400); });
        toast("저장했어요 — 사진에서 카톡으로 보내세요");
      }
    });
    document.body.appendChild(box);
  }

  /* ───────────── 🖼 화면별 한 장 만들기 (10/28 15:39) — 화면 키 → {kind:"screen", scene, title, sub, hero, stats, blocks} ───────────── */
  var RAWF = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function curItem(cat){ var L = (window.M && M.cats && M.cats[cat]) || [], d = window.curDate; if (cur() === cat && d){ var f = L.filter(function(x){ return x.id === d; })[0]; if (f) return f; } return L.length ? L[0] : null; }   // 고른 날짜 그대로
  function moodOf(v){ return v == null ? "flat" : v >= 0.5 ? "up" : v <= -0.5 ? "dn" : "flat"; }
  function cOf(v){ return v == null ? "" : v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function shortNm(n){ var t = String(n || "").replace(/\s+(Common Stock|Ordinary Shares|Common Shares|Class [A-Z]).*$/i, "").replace(/\s+-\s.*$/, ""); for (var i = 0; i < 2; i++) t = t.replace(/,?\s*(Inc\.?|Corporation|Corp\.?|Ltd\.?|Holdings|Co\.?|CO|plc|\(The\))$/i, "").trim(); return t.replace(/\s+-\s*$/, "").trim(); }
  var SNP = null; function sigNames(){ if (!SNP) SNP = gj("archive/x/sig_names.json").then(function(j){ return j || {}; }); return SNP; }
  function nmK(SN, code, name){ return (SN && SN[code]) || shortNm(name) || code; }
  function p100(v){ return v == null ? "–" : Math.round(v * 100) + "%"; }
  // 🌐 시황 리포트
  SCREENS.market = function(){
    var it = curItem("market");
    return Promise.all([it ? gj(file("market", it.id, "data.json")) : null, gj(RAWM + "ledger/ledger.json")]).then(function(r){
      var D = r[0], LG = r[1]; if (!D) return null;
      var stats = (D.kpis || []).filter(function(k){ return num(strip(k.change).split(" ")[0]) != null && /%/.test(strip(k.change).split(" ")[0]); }).slice(0, 4).map(function(k){ var ch = strip(k.change).split(" ")[0], n_ = num(ch); return {l: strip(k.label).replace(/\s*\(.*?\)/, "").split(" / ")[0].slice(0, 10) + " " + strip(k.value), v: ch, c: cOf(n_)}; });
      var mood = moodOf(stats[0] ? num(stats[0].v) : null);
      var chk = (D.checks || []).map(function(c, i){ var t = strip(c), a = t.split(/\.\s/); return {n: a[0].replace(/\.$/, ""), s: a.slice(1).join(". "), v: D.forecasts_p && D.forecasts_p[i] != null ? p100(D.forecasts_p[i]) : null, vc: ACC}; });
      var gr = (D.yesterday_grades || []).map(function(x){ return {n: strip(x.title).replace(/^예고\s*[①-⑩]\s*/, ""), s: strip(x.text), v: x.mark === "✓" ? "✓ 맞음" : x.mark === "✗" || x.cls === "no" ? "✗ 틀림" : "△ 반반", vc: x.cls === "ok" ? "#2f9e44" : x.cls === "no" ? UP : "#d9a441"}; });
      var sch = (D.schedule || []).slice(0, 4).map(function(x){ return {n: strip(x.what), v: strip(x.when), vc: SUB}; });
      var qs = (D.quotes || []).slice(0, 3).map(function(x){ return {n: strip(x.who), s: strip(x.said)}; });
      var al = (LG && LG.allocation || []).filter(function(a){ return a.pct > 0; }).map(function(a){ return {n: a.name.replace(" 코어", ""), pct: a.pct}; });
      var fz = (D.falsify || []).slice(0, 3).map(function(x){ return {n: strip(x.claim), s: strip(x.signal), v: strip(x.dist), vc: SUB}; });
      return {kind: "screen", scene: "city_" + mood, mood: mood, title: "오늘의 시황 리포트", sub: (D.edition_label || "") + " · " + md(D.date) + " · 미국·한국 전날 마감 기준", stats: stats,
        blocks: [["note", {h: "📌 오늘 한 줄", t: strip(D.one_liner), tone: "dark", max: 3}],
          ["list", {title: "🎯 오늘 지켜볼 것 — 그대로 될 확률", items: chk, rank: false}],
          ["list", {title: "✅ 어제 짚은 것, 이렇게 됐어요", items: gr, rank: false}],
          ["alloc", al.length ? al : null, false],
          ["list", {title: "🗣 전문가 한마디", items: qs, rank: false}],
          ["list", {title: "📅 앞으로 볼 일정", items: sch, rank: false}],
          ["list", {title: "🔁 이러면 생각을 바꿔요 (지금과의 거리)", items: fz, rank: false}]],
        note: "시황리포트 " + (D.edition_label || "") + " 내용 · 확률은 리포트가 적은 값"};
    });
  };
  // 🧭 나침반
  SCREENS.sector = function(){
    var it = curItem("sector");
    return Promise.all([it ? gj(file("sector", it.id, "compass.json") + q()) : null, gj("archive/x/regime_mk.json" + q()), gj("archive/x/regime.json" + q()), it ? gj(file("sector", it.id, "top.json")) : null]).then(function(r){
      var C = r[0], RM = r[1], RG = r[2], T = r[3]; if (!C || !C.markets) return null;
      var M_ = C.markets, mk0 = (window.store && store.cpm && M_[store.cpm]) ? store.cpm : "KR", kr = M_[mk0] || M_.KR || {}, kix = (kr.index || [])[0] || {};
      var stats = ["US", "KR", "JP", "CN", "HK"].filter(function(k){ return M_[k] && k !== mk0; }).map(function(k){ var ix = (M_[k].index || [])[0] || {}; return {l: (M_[k].flag || "") + " " + (ix.name || M_[k].name), v: pct(ix.chg1), c: cOf(ix.chg1)}; });
      var order = (RM && RM.order) || ["US", "KR", "JP", "CN", "HK"];
      var reg = RM && RM.markets ? order.filter(function(k){ return RM.markets[k]; }).map(function(k){ var m = RM.markets[k]; return {l: m.flag + " " + m.name, v: m.label || "–", s: (m.cycle > 0 ? "+" : "") + m.cycle + " / " + (m.timing > 0 ? "+" : "") + m.timing, c: /상승/.test(m.label) ? "up" : /하락|위험/.test(m.label) ? "dn" : ""}; }) : null;
      var secs = (kr.sectors || []).slice().sort(function(a, b){ return b.r1 - a.r1; });
      var strong = secs.slice(0, 5).map(function(x){ return {n: (x.icon || "") + " " + x.name, s: (x.big || []).slice(0, 3).map(function(b){ return b.n; }).join(" · "), v: x.r1, bar: x.r1}; });
      var weak = secs.slice(-3).reverse().map(function(x){ return {n: (x.icon || "") + " " + x.name, s: (x.big || []).slice(0, 3).map(function(b){ return b.n; }).join(" · "), v: x.r1, bar: x.r1}; });
      var picks = T && T.top ? T.top.slice(0, 3).map(function(x){ return {n: x.sector, s: (x.picks || []).join(" · "), v: "점수 " + Math.round(x.score * 100), vc: ACC}; }) : [];
      return {kind: "screen", scene: "city_" + moodOf(kix.chg1), mood: moodOf(kix.chg1), title: "시장 나침반", sub: "5개 시장 국면 · " + md(C.date) + " · " + (kr.name || "") + " " + (kix.live ? "장중" : "마감"),
        hero: {l: (kr.flag || "") + " " + (kix.name || "") + " " + (kix.last ? Math.round(kix.last).toLocaleString() : ""), v: pct(kix.chg1), c: cOf(kix.chg1), s: kr.fg ? "시장 온도 " + kr.fg.score + "점 · " + kr.fg.label + " · 국면 " + (kr.regime || "") : ""}, stats: stats,
        blocks: [["note", RG && RG.label ? {h: "🧭 지금 시장은 어느 국면? — " + RG.label, t: strip(RG.verdict), tone: "dark", max: 3} : null],
          ["stat", reg ? {title: "나라별 국면 (아래 숫자 = 경기 점수 / 시장 흐름 점수)", items: reg} : null],
          ["note", kr.summary ? {h: (kr.flag || "") + " 오늘 " + (kr.name || "") + " 장", t: strip(kr.summary), max: 2} : null],
          ["list", {title: "🔥 오늘 강한 업종 (" + (kr.name || "") + ")", items: strong}],
          ["list", picks.length && mk0 === "KR" ? {title: "⭐ 섹터 브리핑 — 오늘 볼 업종·대표주", items: picks, rank: false} : null],
          ["list", {title: weak[0] && weak[0].v > 0 ? "🐢 덜 오른 업종" : "🧊 약한 업종", items: weak, rank: false}]],
        note: "국면 = 경기·시장 흐름 점수로 나눈 구간 · 과거 통계 기준"};
    });
  };
  // 🎲 시장확률 — 실전 성적 경고를 반드시 같이
  SCREENS.prob = function(){
    return Promise.all([window.__probD ? Promise.resolve(window.__probD) : gj("archive/x/prob.json" + q()), gj("archive/x/prob_sec.json" + q())]).then(function(r){
      var D = r[0], PS = r[1]; if (!D || !D.markets) return null;
      var ks = ["KR", "US", "JP", "CN", "HK"].filter(function(k){ return D.markets[k]; }), kr = D.markets.KR || D.markets[ks[0]];
      var t1 = ks.map(function(k){ var m = D.markets[k]; return {l: m.flag + " " + m.name, v: p100(m.p1), s: "평소 " + p100(m.pb1), c: m.p1 >= 0.55 ? "up" : m.p1 <= 0.45 ? "dn" : "", sel: k === "KR"}; });
      var t5 = ks.map(function(k){ var m = D.markets[k]; return {l: m.flag + " " + m.name, v: p100(m.p5), s: "평소 " + p100(m.pb5), c: m.p5 >= 0.55 ? "up" : m.p5 <= 0.45 ? "dn" : ""}; });
      var band = ks.map(function(k){ var m = D.markets[k], b = m.band1 || []; return {n: m.flag + " " + m.name + " " + (m.ixn || ""), s: "다음 거래일 이 범위 안일 가능성 68%", v: b.length ? pct(b[0]) + " ~ " + pct(b[1]) : "–", vc: SUB}; });
      var sc = D.score && D.score.all && D.score.all.d1 || {}, okRec = (sc.n || 0) >= 20 && (sc.hit || 0) >= 55;
      var sec = PS && PS.markets && PS.markets.KR && PS.markets.KR.sectors ? PS.markets.KR.sectors.slice().sort(function(a, b){ return b.p5 - a.p5; }).slice(0, 5).map(function(x){ return {n: (x.icon || "") + " " + x.name, v: p100(x.p5), vc: x.p5 >= 0.55 ? UP : INK}; }) : [];
      return {kind: "screen", scene: "net", title: "시장 확률", sub: "다음 거래일 오를 확률 · 한국시각 " + (D.lvT || D.t || "") + " 기준",
        hero: {l: "🇰🇷 " + (kr.ixn || "코스피") + " 다음 장 오를 확률", v: p100(kr.p1), c: kr.p1 >= 0.55 ? "up" : kr.p1 <= 0.45 ? "dn" : "", s: "평소엔 " + p100(kr.pb1) + " · " + (kr.open_now ? "장중 지금 등락 반영" : "마감 기준")},
        stats: ks.filter(function(k){ return k !== "KR"; }).slice(0, 4).map(function(k){ var m = D.markets[k]; return {l: m.flag + " " + m.name, v: p100(m.p1), c: m.p1 >= 0.55 ? "up" : m.p1 <= 0.45 ? "dn" : ""}; }),
        blocks: [["note", okRec ? {h: "✅ 실전 성적", t: "실전 채점 " + sc.n + "번 중 " + sc.hit + "% 맞음.", tone: "info"} : {h: "⚠️ 참고만 하세요 — 아직 실전 성적이 동전 던지기보다 못해요", t: "실전 채점 " + (sc.n || 0) + "번 중 " + (sc.hit || 0) + "% 맞음. 과거 데이터로는 57~65%였지만 실전에선 아직 못 따라와요 — 이 숫자만 보고 사고팔지 마세요.", tone: "warn", max: 3}],
          ["stat", {title: "다음 거래일 오를 확률", items: t1}],
          ["stat", {title: "다음 5거래일 오를 확률", items: t5}],
          ["list", {title: "📏 다음 거래일 예상 범위", items: band, rank: false}],
          ["list", sec.length ? {title: "🇰🇷 업종별 — 5거래일 뒤 오를 확률 높은 순", items: sec} : null]],
        note: "과거 비슷한 날들의 통계로 계산한 확률 · 미래를 보장하지 않아요"};
    });
  };
  // 💼 포트
  SCREENS.port = function(){
    return Promise.all([mkPort(), gj(RAWM + "market/home.json"), gj(RAWM + "market/port.json")]).then(function(r){
      var C = r[0], H = r[1] || {}, PT = r[2] || {}; if (!C) return null;
      var P = H.port || {}, st_ = PT.stat || {};
      return {kind: "screen", scene: "chart", title: "포트폴리오 — 지금 이렇게 담아요", sub: (P.start ? md(P.start) + "부터 " : "") + (P.asof ? md(P.asof) + " 기준" : "") + " · 지수 ETF 뼈대",
        hero: {l: "💼 기본 포트 " + (P.start ? md(P.start) + "부터" : ""), v: pct(P.base), c: cOf(P.base), s: "같은 기간 S&P500 " + pct(P.spy) + (st_.kospi != null ? " · 코스피 " + pct(st_.kospi) : "")},
        stats: [{l: "⚡ 킥 포트", v: pct(P.kick), c: cOf(P.kick)}, {l: "🇺🇸 S&P500", v: pct(P.spy), c: cOf(P.spy)}, st_.mdd != null ? {l: "가장 크게 빠졌던 폭", v: pct(st_.mdd), c: "dn"} : null, PT.rule && PT.rule.quad ? {l: "지금 국면", v: PT.rule.quad.replace(/^\S+\s/, ""), c: /상승/.test(PT.rule.quad) ? "up" : "dn"} : null].filter(Boolean),
        blocks: [["alloc", C.alloc, true], ["line", C.line], ["rows", C.why, "text"], ["bullets", C.bullets], ["rows", C.sched, "text"]],
        note: C.note};
    });
  };
  // 📊 성적표
  SCREENS.score = function(){
    return Promise.all([gj(RAWM + "market/scores.json"), window.__probD ? Promise.resolve(window.__probD) : gj("archive/x/prob.json" + q())]).then(function(r){
      var S = r[0], PD = r[1]; if (!S || !S.rows) return null;
      var rows = S.rows.filter(function(x){ return x.rate != null; }), rep = rows.filter(function(x){ return x.k === "report"; })[0] || rows[0];
      var d1 = PD && PD.score && PD.score.all && PD.score.all.d1 || {};
      return {kind: "screen", scene: "chart", title: "앱 신호 성적표", sub: "매일 자동 채점 · " + md(String(S.at || "").slice(0, 10)) + " 기준",
        hero: rep ? {l: (rep.ic || "") + " " + rep.t + " 맞음 비율", v: rep.rate + "%", c: rep.rate >= 55 ? "up" : "", s: strip(rep.note)} : null,
        stats: [{l: "🎲 시장확률", v: (d1.hit != null ? d1.hit + "%" : "–"), c: d1.hit >= 55 ? "up" : "dn"}].concat(rows.filter(function(x){ return x !== rep; }).slice(0, 3).map(function(x){ return {l: (x.ic || "") + " " + x.t, v: x.rate + "%", c: x.rate >= 55 ? "up" : x.rate < 45 ? "dn" : ""}; })),
        blocks: [["list", {title: "신호별 맞음 비율", items: rows.slice(0, 8).map(function(x){ return {n: (x.ic || "") + " " + x.t, s: strip(x.note), v: x.rate + "%", vc: x.rate >= 55 ? "#2f9e44" : x.rate < 45 ? UP : INK, bar: x.rate, barc: "rgba(59,91,219,.22)"}; })}],
          ["bullets", (S.good || []).slice(0, 4), "✅ 잘 맞는 것"], ["bullets", (S.bad || []).slice(0, 3), "❌ 덜 맞는 것"]],
        note: "앱이 낸 신호를 정해진 기준으로 매일 채점한 결과"};
    });
  };
  // 🐋 고래
  SCREENS.whale = function(){
    var it = curItem("whale");
    return Promise.all([gj("archive/x/whale_pick.json" + q()), it ? gj(file("whale", it.id, "data.json")) : null]).then(function(r){
      var WP = r[0], D = r[1] || {}; if (!WP || !WP.pick) return null;
      var p = WP.pick, parts = p.parts || {}, MAXP = {"고래": 25, "차트": 25, "수급": 15, "흐름": 20, "뉴스·실적": 15};
      var rank = (WP.rank || []).slice(0, 8).map(function(x){ return {n: x.n + " (" + x.s + ")", v: Math.round(x.tot) + "점", vc: INK, bar: x.tot, barc: "rgba(31,122,108,.28)"}; });
      var hold = (D.hold || []).slice(0, 5).map(function(h){ return {n: h[0], s: h[2] || "", v: h[1] + "곳", vc: INK}; });
      return {kind: "screen", scene: "ship", title: "오늘의 고래 픽", sub: "유명 펀드·투자자가 들고 있는 종목 중 점수 1등 · " + md(WP.whale_date),
        hero: {l: "🐋 " + p.n + " · " + p.s, v: Math.round(p.tot) + "점", s: "지금 $" + (p.last || "") + " · 최근 20일 " + pct(p.r20)},
        stats: Object.keys(parts).slice(0, 4).map(function(k){ return {l: k, v: Math.round(parts[k]) + " / " + (MAXP[k] || 25)}; }),
        blocks: [["bullets", (p.why || []).slice(0, 4), "왜 이 종목인가"], ["list", {title: "🏆 오늘 점수 상위", items: rank}], ["list", hold.length ? {title: "🐳 고래들이 가장 많이 들고 있는 종목", items: hold} : null]],
        note: "고래 보유 공시(13F)는 분기마다·최대 45일 늦게 나와요 · 종목 추천 아님"};
    });
  };
  // ☕ 컵
  SCREENS.cup = function(){
    var it = curItem("cup");
    return Promise.all([it ? gj(file("cup", it.id, "cards.json")) : null, gj("archive/x/cup_live.json" + q()), sigNames()]).then(function(r){
      var D = r[0], LV = r[1], SN = r[2]; if (!D || !D.top) return null;
      var lv = LV && LV.items || {}, all = (D.top || []).concat(D.ath || []);
      var near = all.map(function(c){ var x = lv[c.code], d = x && x.d != null ? x.d : c.dist; return {c: c, d: d, lv: !!x}; }).filter(function(z){ return z.d != null && (Object.keys(lv).length ? z.lv : (z.d > -3 && z.d <= 3)); }).sort(function(a, b){ return Math.abs(a.d) - Math.abs(b.d); });
      var FL = {US: "🇺🇸", KR: "🇰🇷", JP: "🇯🇵", CN: "🇨🇳", HK: "🇭🇰"};
      var row = function(z){ var c = z.c; return {f: FL[c.mkt] || "", n: nmK(SN, c.code, c.name), s: (c.sector || "") + " · 컵 깊이 " + Math.round(c.depth || 0) + "% · " + Math.round(c.weeks || 0) + "주", v: z.d >= 0 ? "넘음 " + pct(z.d) : "남은 " + pct(-z.d).replace("+", ""), vc: z.d >= 0 ? "#2f9e44" : UP}; };
      var ath = (D.ath || []).slice(0, 4).map(function(c){ return {f: FL[c.mkt] || "", n: nmK(SN, c.code, c.name), s: (c.sector || "") + " · 주가강도 " + Math.round(c.rs || 0), v: c.brk ? "돌파" : pct(c.dist), vc: c.brk ? "#2f9e44" : INK}; });
      return {kind: "screen", scene: "chart", title: "컵 차트 — 돌파 임박", sub: "컵 모양으로 쉬었다가 다시 오르려는 종목 · " + md(it.id),
        hero: {l: "🎯 돌파 임박 — 돌파선 ±3% 안", v: near.length + "종목", s: "돌파선 = 컵 손잡이 고점 — 넘으면 새 상승이 시작될 때가 많아요"},
        stats: [{l: "컵 모양 종목", v: D.total || all.length}, {l: "사상 최고가 돌파", v: (D.ath || []).length}, {l: "돌파 완료", v: all.filter(function(c){ return c.brk; }).length}],
        blocks: [["list", {title: "🎯 돌파 임박 — 돌파선까지 남은 거리", items: near.slice(0, 8).map(row)}], ["list", ath.length ? {title: "⭐ 사상 최고가 돌파", items: ath, rank: false} : null]],
        note: "차트 모양 신호 · 실패하는 돌파도 있어요 · 종목 추천 아님"};
    });
  };
  // 📈 갭
  SCREENS.gap = function(){
    var it = curItem("gap");
    return Promise.all([it ? gj(file("gap", it.id, "cards.json")) : null, sigNames()]).then(function(r){
      var D = r[0], SN = r[1]; if (!D || !D.top) return null;
      var FL = {US: "🇺🇸", KR: "🇰🇷", JP: "🇯🇵", CN: "🇨🇳", HK: "🇭🇰"}, top = D.top.slice().sort(function(a, b){ return (b.score || 0) - (a.score || 0); });
      var avg = top.slice(0, 10).reduce(function(s, c){ return s + (c.gap || 0); }, 0) / Math.max(1, Math.min(10, top.length)), held = D.top.filter(function(c){ return c.hold; }).length;
      var bm = D.by_mkt || {}; var mk = Object.keys(bm).map(function(k){ return {l: (FL[k] || "") + " " + k, v: (bm[k].n || bm[k]) + "종목"}; }).slice(0, 2);
      return {kind: "screen", scene: "chart", mood: "up", title: "갭 돌파 종목", sub: "실적·뉴스로 하루에 껑충 뛰고(갭) 그 자리를 지키는 종목 · " + md(it.id),
        hero: {l: "📈 갭 돌파 종목", v: (D.total || D.top.length) + "개", s: "상위 10개 평균 갭 " + pct(avg) + " · 갭 유지 " + held + "/" + D.top.length},
        stats: [{l: "상위 평균 갭", v: pct(avg), c: "up"}, {l: "갭 자리 지킴", v: held + " / " + D.top.length}].concat(mk),
        blocks: [["list", {title: "🏆 갭 점수 상위", items: top.slice(0, 8).map(function(c){ return {f: FL[c.mkt] || "", n: nmK(SN, c.code, c.name), s: (c.sector || "") + " · 갭 " + md(c.gday) + " · 거래량 " + (c.vol ? c.vol.toFixed(1) + "배" : "–") + " · " + (c.hold ? "갭 유지" : "갭 메움"), v: c.gap}; })}]],
        note: "갭 = 전날 가격보다 크게 위에서 시작한 날 · 메워지며 되돌아가는 경우도 있어요 · 종목 추천 아님"};
    });
  };
  // 🔎 거르기
  SCREENS.screen = function(){
    var it = curItem("screen");
    return Promise.all([it ? gj(file("screen", it.id, "screens.json")) : null, sigNames()]).then(function(r){
      var D = r[0], SN = r[1]; if (!D) return null;
      var FL = {US: "🇺🇸", KR: "🇰🇷", JP: "🇯🇵", CN: "🇨🇳", HK: "🇭🇰"};
      var L = function(arr, sfn, vfn){ return (arr || []).slice(0, 5).map(function(x){ return {f: FL[x.m] || "", n: /[가-힣]/.test(x.n) ? x.n : nmK(SN, x.s, x.n), s: sfn(x), v: vfn(x)}; }); };
      var ls = [].concat.apply([], Object.keys(D.lead_sec || {}).map(function(k){ return (D.lead_sec[k] || []).slice(0, 2).map(function(x){ return {f: FL[k] || "", n: x.name, s: x.n + "종목 중", v: "강도 +" + x.rs, vc: UP}; }); })).slice(0, 6);
      return {kind: "screen", scene: "net", title: "아침 거르기 — 눈여겨볼 종목", sub: md(D.date) + " · 미국·한국·일본·중국·홍콩",
        hero: {l: "🔎 오늘 걸린 종목", v: ((D.quiet || []).length + (D.lead || []).length + (D.hush || []).length + (D.triple || []).length) + "개", s: (D.n || 0).toLocaleString() + "종목을 네 가지 거름망으로 거른 결과"},
        stats: [{l: "🤫 조용한 돈 유입", v: (D.quiet || []).length}, {l: "🏆 업종 1등주", v: (D.lead || []).length}, {l: "🌱 조용한 매집", v: (D.hush || []).length}, {l: "🤝 신호 겹침", v: (D.triple || []).length}],
        blocks: [["list", {title: "🤫 조용한 돈 유입 — 가격은 좁게, 거래대금은 크게", items: L(D.quiet, function(x){ return (x.sub || "") + " · 20일 " + pct(x.r20); }, function(x){ return x.tvx ? "거래 " + x.tvx.toFixed(1) + "배" : pct(x.r20); })}],
          ["list", {title: "🏆 업종 1등주 — 20일 수익률", items: L(D.lead, function(x){ return x.sub || ""; }, function(x){ return x.r20; })}],
          ["list", ls.length ? {title: "💪 요즘 강한 업종", items: ls, rank: false} : null]],
        note: "거름망에 걸린 후보 목록 · 종목 추천 아님"};
    });
  };
  // 🗂 더 보기 — 어제 예고 → 오늘 결과 · 두뇌 논지
  SCREENS.sigmore = function(){
    return Promise.all([gj(RAWM + "market/home.json"), gj(RAWM + "brain/state.json")]).then(function(r){
      var H = r[0] || {}, B = r[1] || {}, G = H.grade; if (!G) return null;
      var items = (G.items || []).map(function(x){ return {n: strip(x.t).replace(/^예고\s*[①-⑩]\s*/, ""), s: strip(x.x), v: x.mark === "✓" ? "✓ 맞음" : x.mark === "✗" ? "✗ 틀림" : "△", vc: x.cls === "ok" ? "#2f9e44" : x.cls === "no" ? UP : "#d9a441"}; });
      var nx = (G.next || []).map(function(x){ var a = strip(x.t).split(/\.\s/); return {n: a[0], s: a.slice(1).join(". "), v: x.p != null ? (x.p > 1 ? Math.round(x.p) : Math.round(x.p * 100)) + "%" : "", vc: ACC}; });
      var th = (B.theses || []).slice(0, 3).map(function(x){ var a = strip(x.t).split(" — "); return {n: a[0], s: (a.slice(1).join(" — ") || "") + (x.since ? " · " + md(x.since) + "부터" : ""), v: Math.round((x.conf || 0) * 100) + "%", vc: ACC}; });
      var okN = (G.items || []).filter(function(x){ return x.cls === "ok"; }).length;
      return {kind: "screen", scene: "net", title: "어제 예고 → 오늘 결과", sub: (G.label || "") + " 채점 · " + md(G.date),
        hero: {l: "어제 예고 " + (G.items || []).length + "개 중", v: okN + "개 맞음", c: okN >= (G.items || []).length * 0.6 ? "up" : "", s: G.rate != null ? "누적 적중 " + G.rate + "%" : ""},
        blocks: [["list", {title: "✅ 어제 예고, 이렇게 됐어요", items: items, rank: false}], ["list", nx.length ? {title: "🎯 오늘의 예고 — 내일 아침 채점", items: nx, rank: false, wrap2: true} : null],
          ["note", B.summary ? {h: "🧠 지금 시장 생각", t: strip(B.summary), tone: "dark", max: 5} : null], ["list", th.length ? {title: "🧠 지금 가장 무게 두는 생각 (확신 순)", items: th, wrap2: true} : null]],
        note: "매일 숫자로 채점하는 예고 · 확률은 앱이 적은 값"};
    });
  };
  // 🏦 채권 · 📦 펀드 · 🎯 ELS (사모 라인업은 절대 안 넣음)
  function prodData(){ return gj("archive/x/products.json" + q()); }
  SCREENS.bond = function(sk){
    return Promise.all([prodData(), gj("archive/x/brl_live.json" + q())]).then(function(r){
      var P = r[0], BL = r[1]; if (!P || !P.krw) return null;
      var kr = P.krw.slice().filter(function(x){ return sk === "oth" ? !/국채|국고/.test(x.kind + x.name) : sk === "gov" || !sk ? /국채|국고|국민주택/.test(x.kind + x.name) || !sk : true; }).sort(function(a, b){ return (b.after || 0) - (a.after || 0); }), best = kr[0] || {};
      var ust = P.ust || {}, ui = (ust.items || []).slice().sort(function(a, b){ return (b.ytm || 0) - (a.ytm || 0); });
      var bfx = P.brl && P.brl.fx, brl = bfx && bfx.length ? bfx[bfx.length - 1][1] : null;
      return {kind: "screen", scene: "bank", title: "채권 — 지금 받을 수 있는 이자", sub: "미래에셋증권 판매 채권 · " + md(P.updated ? String(P.updated).slice(0, 10) : today()),
        hero: sk === "ust" && ui[0] ? {l: "🇺🇸 판매 미국채 최고 수익률", v: (+ui[0].ytm).toFixed(2) + "%", c: "up", s: ui[0].name + " · 만기 " + (ui[0].mat || "")} : {l: sk === "oth" ? "🏢 공사채·회사채 세후 수익률 최고" : "🇰🇷 국고채 세후 수익률 최고", v: (best.after || 0).toFixed(2) + "%", c: "up", s: shortNm(best.name) + " · 은행 예금으로 치면 " + (best.bank || "–") + "%"},
        stats: [ust.y10 ? {l: "🇺🇸 미국채 10년 금리", v: (+ust.y10).toFixed(2) + "%"} : null, ui[0] ? {l: "🇺🇸 판매 미국채 최고", v: (+ui[0].ytm).toFixed(2) + "%", c: "up"} : null, ust.fx ? {l: "원/달러", v: Math.round(ust.fx).toLocaleString() + "원"} : null, brl ? {l: "🇧🇷 헤알/원", v: (+brl).toFixed(1) + "원"} : null].filter(Boolean),
        blocks: [sk === "ust" ? null : ["list", {title: sk === "oth" ? "🏢 공사채·회사채 — 세후 수익률 높은 순" : sk === "gov" ? "🇰🇷 국고채 — 세후 수익률 높은 순" : "🇰🇷 국고채·공사채 — 세후 수익률 높은 순", items: kr.slice(0, sk ? 8 : 6).map(function(x){ return {n: x.name, s: (x.kind || "") + " · 만기 " + (x.mat || "") + (x.bank ? " · 예금 환산 " + x.bank + "%" : ""), v: (x.after || 0).toFixed(2) + "%", vc: UP}; })}],
          ["list", ui.length && sk !== "gov" && sk !== "oth" ? {title: "🇺🇸 미국채 — 만기까지 받는 수익률", items: ui.slice(0, sk === "ust" ? 8 : 4).map(function(x){ return {n: x.name, s: "만기 " + (x.mat || "") + (x.cpn != null ? " · 쿠폰 " + x.cpn + "%" : ""), v: (+x.ytm).toFixed(2) + "%", vc: UP}; })} : null],
          ["bullets", ["만기까지 들고 있으면 세후 수익률이 거의 그대로 확정돼요", "중간에 팔면 그때 금리에 따라 손익이 달라져요 · 해외 채권은 환율도 같이 움직여요"], "알아 두기"]],
        note: "미래에셋증권 공개 숫자 그대로 · 세후 = 이자소득세 15.4% 뺀 값"};
    });
  };
  SCREENS.fund = function(sk){
    return prodData().then(function(P){
      if (!P || !P.funds) return null;
      var F = P.funds.filter(function(f){ return (f.aum || 0) >= 10 && f.y1 != null && !f.pv; }), top = F.slice().sort(function(a, b){ return b.y1 - a.y1; });
      var bt = {}; F.forEach(function(f){ var k = f.t || "기타"; if (!bt[k] || f.y1 > bt[k].y1) bt[k] = f; });
      var types = Object.keys(bt).map(function(k){ return bt[k]; }).sort(function(a, b){ return b.y1 - a.y1; }).slice(0, 5);
      return {kind: "screen", scene: "bank", mood: "up", title: "공모펀드 수익률 TOP", sub: "미래에셋증권 펀드 검색 · 순자산 10억 이상 · 1년 수익률 순",
        hero: {l: "📦 비교한 공모펀드", v: F.length.toLocaleString() + "개", s: "1위 " + shortNm(top[0] && top[0].n).slice(0, 22) + " " + pct(top[0] && top[0].y1)},
        blocks: (function(){ var a = ["list", {wrap2: true, title: "🏆 1년 수익률 TOP 8", items: top.slice(0, 8).map(function(f){ return {n: f.n, s: (f.co || "") + " · " + (f.st || f.t || "") + " · 3개월 " + pct(f.m3), v: f.y1}; })}], b = ["list", {wrap2: true, title: "🗂 유형별 1등", items: types.map(function(f){ return {n: f.t + " — " + f.n, s: (f.co || ""), v: f.y1}; }), rank: false}]; return sk === "type" ? [b, a] : [a, b]; })(),
        note: "공모펀드만 · 수수료·보수는 상품마다 달라요"};
    });
  };
  SCREENS.els = function(sk){
    return prodData().then(function(P){
      if (!P || !P.els) return null;
      if (sk === "done" && P.els_done && P.els_done.length){ var DN_ = P.els_done.slice(0, 8);
        return {kind: "screen", scene: "chart", title: "ELS · ELB 최근 청약 완료", sub: "미래에셋증권 · " + md(today()) + " 기준", hero: {l: "최근 청약 완료", v: P.els_done.length + "개", s: "연 수익률 · 기초자산"},
          blocks: [["list", {wrap2: true, title: "최근 청약 완료", rank: false, items: DN_.map(function(x){ return {n: x.n, s: (x.ua || "") + (x.e ? " · 마감 " + md(x.e) : ""), v: x.cpn != null ? x.cpn + "%" : null, vc: UP}; })}]], note: "미래에셋증권 공개 숫자 그대로"}; }
      var td = today(), E = P.els.filter(function(x){ return !x.e || x.e >= td; }), els = E.filter(function(x){ return x.t !== "ELB"; }), elb = E.filter(function(x){ return x.t === "ELB"; });
      var top = E.slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); }), soon = E.map(function(x){ return x.e; }).filter(Boolean).sort()[0];
      var uc = {}; E.forEach(function(x){ String(x.ua || "").split(/,\s*/).forEach(function(u){ if (u) uc[u] = (uc[u] || 0) + 1; }); });
      var ua = Object.keys(uc).sort(function(a, b){ return uc[b] - uc[a]; }).slice(0, 3);
      return {kind: "screen", scene: "chart", title: "ELS · ELB 청약 중", sub: "미래에셋증권 · " + md(td) + " 기준",
        hero: {l: "🎯 지금 청약 중", v: E.length + "개", s: "ELS " + els.length + " · ELB(원금지급) " + elb.length + (soon ? " · 가장 빠른 마감 " + md(soon) : "")},
        stats: [top[0] ? {l: "최고 연 수익률", v: top[0].cpn + "%", c: "up"} : null, soon ? {l: "가장 빠른 마감", v: md(soon)} : null, ua.length ? {l: "많이 쓰는 기초자산", v: ua[0]} : null].filter(Boolean),
        blocks: [["list", {title: "💰 연 수익률(조건 충족 시) 높은 순", items: top.slice(0, 8).map(function(x){ return {n: x.n, s: (x.ua || "") + " · " + String(x.desc || "").split(",")[0] + (x.e ? " · 마감 " + md(x.e) : ""), v: x.cpn + "%", vc: x.t === "ELB" ? "#2f9e44" : UP}; })}],
          ["note", {h: "알아 두기", t: "ELS는 조건이 맞으면 약속한 이자를 주지만, 기초자산이 크게 떨어지면(낙인) 원금 손실이 날 수 있어요. ELB는 원금을 지급하는 대신 이자가 낮아요.", max: 3}]],
        note: "미래에셋증권 공개 숫자 그대로 · 연 수익률은 조건 충족 시 · 원금 손실 가능(ELS)"};
    });
  };
  // 📰 피드
  SCREENS.feed = function(){
    return Promise.all([gj(RAWM + "feeds/my_feed.json"), gj(RAWM + "feeds/hot.json"), gj(RAWM + "brain/state.json")]).then(function(r){
      var F = r[0], HT = r[1] || {}, B = r[2] || {}; if (!F || !F.items) return null;
      var hot = HT.items || {}, td = today();
      var it = F.items.filter(function(x){ return String(x.at || "").slice(0, 10) === td; });
      var imp = it.filter(function(x){ return hot[x.id]; }).sort(function(a, b){ return (hot[b.id].lv || 0) - (hot[a.id].lv || 0); }).slice(0, 5);
      var rest = it.filter(function(x){ return !hot[x.id] && x.title; }).slice(0, 8 - imp.length);
      var row = function(x){ var h = hot[x.id]; return {n: (h ? (h.lv >= 2 ? "🔴 " : "🟡 ") : "") + strip(x.title), s: (x.press || x.name || x.src || "") + " · " + String(x.at || "").slice(11, 16), v: null}; };
      return {kind: "screen", scene: "net", title: "오늘의 주요 뉴스", sub: md(td) + " · " + String(F.at || "").slice(11, 16) + "까지 · 오늘 " + it.length + "건 중 골라",
        blocks: [["note", B.summary ? {h: "🧠 지금 시장, 한 문단으로", t: strip(B.summary), tone: "dark", max: 6} : null],
          ["list", imp.length ? {title: "🔴🟡 꼭 볼 뉴스", items: imp.map(row), rank: false, wrap2: true} : null],
          ["list", {title: "📰 방금 들어온 뉴스", items: rest.map(row), rank: false, wrap2: true}]],
        note: "여러 언론·블로그·텔레그램을 모은 것 · 원문 확인 권장"};
    });
  };
  /* ───────────── 📄 지금 보고 있는 부분 → 한 장 (10/28 15:58 「하위 카테고리까지 · 어느 화면에서든 그 화면의 대부분을 차지하는 내용」) ─────────────
     화면 글자를 그대로 캡처하지 않고, 카드마다 제목·표·「이름 — 숫자」 짝·설명 글을 뽑아 같은 디자인으로 다시 그림. */
  var VAL = /^[+−\-–]?[\d,]+(\.\d+)?\s*(%p?|원|개|배|점|주|곳|종목|억|조|만|달러|일|건|번|위|bp)?(\s*[\/·~]\s*[+−\-]?[\d,]+(\.\d+)?\s*(%|원|개|점)?)?$/;
  var JUNK = /^(펼치기|접기|자세히|자세히 ▾|더 보기|전체 보기|보기|닫기|열기|뒤로|원문|공유|📤 공유|▾|▴|›|‹|→|←|.*(펼치기|접기)\s*[▾▴]?|.*보기\s*[▾›]|누르면 .*|.*\d+개 더 보기.*)$/;
  function vis(el){ return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)); }
  function cl(t){ return String(t || "").replace(/\s+/g, " ").trim(); }
  function cardTitle(c){
    var h = c.querySelector("h1,h2,h3,h4,summary,.ct,.sh-top b,.pd-h b,b,strong"); var t = h && vis(h) ? cl(h.innerText.split("\n")[0]) : "";
    return t.length > 46 ? t.slice(0, 45) + "…" : t;
  }
  function cardBlocks(c, fallbackTitle){
    var title = cardTitle(c) || fallbackTitle || "", out = [];
    var btn = {}; [].forEach.call(c.querySelectorAll("button,a.btn,.seg2,.chip-row,select,input"), function(b){ cl(b.innerText).split(/\s{2,}|\n/).forEach(function(t){ if (t) btn[cl(t)] = 1; }); btn[cl(b.innerText)] = 1; });
    // 표
    var rows = [].filter.call(c.querySelectorAll("tr"), vis).map(function(tr){ return [].map.call(tr.children, function(td){ return cl(td.innerText); }).filter(Boolean); }).filter(function(r){ return r.length; });
    if (rows.length >= 2){
      var hd = rows[0].length > 1 && rows.slice(1).every(function(r){ return r.length === rows[0].length; }) && !rows[0].some(function(x){ return /\d/.test(x); }) ? rows.shift() : null;
      out.push(["list", {title: title + (hd ? "  (" + hd.slice(1).join(" · ") + ")" : ""), rank: false, wrap2: true, max: 10, items: rows.slice(0, 10).map(function(r){ return {n: r[0], s: r.length > 2 ? r.slice(1, -1).join(" · ") : "", v: r.length > 1 ? r[r.length - 1] : null, vc: /^[+]/.test(r[r.length - 1]) ? UP : /^[−\-]/.test(r[r.length - 1]) ? DN : INK}; })}]);
      return out;
    }
    var lines = c.innerText.split("\n").map(cl).filter(function(l){ return l && l !== title && !btn[l] && !JUNK.test(l) && l.length > 1; });
    var seen = {}; lines = lines.filter(function(l){ if (seen[l]) return false; seen[l] = 1; return true; });
    var items = [], para = [], i = 0;
    while (i < lines.length && items.length < 10){
      var a = lines[i], b = lines[i + 1];
      if (b && VAL.test(b) && !VAL.test(a) && a.length <= 30){ items.push({n: a, v: b, vc: /^[+]/.test(b) ? UP : /^[−\-–]/.test(b) ? DN : INK}); i += 2; continue; }
      var m = /^(.{2,40}?)\s+([+−\-]?[\d,]+(\.\d+)?\s*(%p?|원|개|배|점|곳|종목))$/.exec(a);
      if (m){ items.push({n: m[1], v: m[2], vc: /^[+]/.test(m[2]) ? UP : /^[−\-]/.test(m[2]) ? DN : INK}); i++; continue; }
      if (VAL.test(a) && items.length && items[items.length - 1].v == null){ items[items.length - 1].v = a; i++; continue; }
      if (a.length > 44) para.push(a); else items.push({n: a, v: null});
      i++;
    }
    // 설명만 있는 짧은 줄은 앞 항목의 작은 글로
    var merged = []; items.forEach(function(it){ var last = merged[merged.length - 1]; if (it.v == null && last && last.v != null && !last.s && it.n.length > 12) last.s = it.n; else merged.push(it); });
    if (merged.length) out.push(["list", {title: title, rank: false, wrap2: true, max: 10, items: merged.slice(0, 10)}]);
    if (para.length) out.push(["note", {h: merged.length ? "" : title, t: para.slice(0, 3).join(" "), max: 6}]);
    return out;
  }
  function outerCards(root){
    var C = [].filter.call(root.querySelectorAll("section.card, .card, details, .pd-tap, .hm-card, .tile, .kpi-row"), vis);
    return C.filter(function(c){ for (var p = c.parentElement; p && p !== root; p = p.parentElement){ if (C.indexOf(p) >= 0) return false; } return true; });
  }
  function layoutBlocks(root){   // 카드 클래스가 없는 화면도 — 화면 폭을 거의 다 쓰는 덩어리로 나눔
    var vh = window.innerHeight, rw = root.getBoundingClientRect().width || 360, out = [];
    (function walk(el, d){
      [].forEach.call(el.children, function(c){
        if (!vis(c) || /^(SCRIPT|STYLE|BUTTON|NAV|IMG|SVG|svg|INPUT|SELECT)$/.test(c.tagName) || c.id === "opbtn" || c.id === "bnav") return;
        var r = c.getBoundingClientRect(); if (r.height < 40 || r.width < rw * 0.6) return;
        if ((r.height > vh * 1.1 || c.classList.contains("hero") === false && c.children.length > 0 && r.height > vh * 0.9) && d < 6 && c.children.length) walk(c, d + 1);
        else out.push(c);
      });
    })(root, 0);
    return out.filter(function(c){ return !c.classList.contains("hero") && !c.classList.contains("dates") && !c.classList.contains("seg2") && !/^(tabs|bnav)$/.test(c.id); });
  }
  function inView(root){   // 화면에 보이는 덩어리 (가장 크게 보이는 것 위주, 최대 5개)
    var top = 64, bot = window.innerHeight - 70;
    var score = function(list){ return list.map(function(c){ var r = c.getBoundingClientRect(); return {c: c, v: Math.max(0, Math.min(r.bottom, bot) - Math.max(r.top, top))}; }).filter(function(x){ return x.v > 60; }); };
    var cs = score(outerCards(root)); if (!cs.length) cs = score(layoutBlocks(root));
    if (!cs.length) return [];
    var big = cs.reduce(function(a, b){ return b.v > a.v ? b : a; }), i0 = cs.indexOf(big);
    if (big.v > (bot - top) * 0.55) return cs.slice(Math.max(0, i0 - 1), i0 + 3).filter(function(x){ return x.v > 100 || x === big; }).map(function(x){ return x.c; });   // 큰 카드 하나가 화면 대부분
    return cs.slice(0, 10).map(function(x){ return x.c; });   // 작은 줄들이 여럿 — 보이는 것 다
  }
  function grpScene(k){ var g = TABS[k]; return g === "상품" ? "bank" : g === "신호" ? "chart" : g === "피드" ? "net" : g === "포트" ? "chart" : g === "종목" ? "chart" : "city_flat"; }
  function heroName(){ var h = document.querySelector("#main .hero h1"); return h ? cl(h.innerText) : ""; }
  function domScreen(opt){
    opt = opt || {};
    var sh = document.getElementById("sheet"), root, cards, title, sub;
    if (sh){ root = sh.querySelector(".sh-body") || sh; title = cl((sh.querySelector(".sh-top b") || {}).innerText || "") || heroName(); cards = outerCards(root); if (!cards.length) cards = [root]; }
    else { root = document.getElementById("main") || document.body; cards = inView(root); title = heroName(); }
    var pvOn = cur() === "fund" && document.querySelector("#pdseg .on[data-k=pv]");
    if (pvOn || /사모|🔒/.test(title)) return Promise.resolve({refuse: "사내 사모 라인업은 고객용 한 장에 넣지 않아요"});
    var n0 = cards.length; cards = cards.filter(function(c){ return !/사모|🔒/.test(c.innerText); });   // 🔒 사모 칸은 통째로 뺌
    if (n0 && !cards.length) return Promise.resolve({refuse: "사내 사모 라인업은 고객용 한 장에 넣지 않아요"});
    if (!cards.length) return Promise.resolve(null);
    var seg = document.querySelector("#main .seg2 .on, #main .dates .date.on"), segT = seg ? cl(seg.innerText) : "";
    var first0 = cards.length === 1 || cards[0].getBoundingClientRect().height > 300 ? cardTitle(cards[0]) : "";
    var head = {kind: "screen", scene: grpScene(cur()), title: sh ? title : (title.replace(/^\S+\s/, "") || "지금 화면") + (first0 && !sh ? " — " + first0.replace(/^[^\w가-힣]+/, "") : ""), sub: (sh ? md(today()) : /^\d{1,2}\/\d{1,2}/.test(segT) ? segT.replace(/^(\d{1,2}\/\d{1,2})(\S)/, "$1 ($2)") : (segT ? segT + " · " : "") + md(today())) + " · 앱 화면 그대로", note: "앱 화면을 그대로 옮겼어요"};
    if (!opt.text && window.loadScript && window.H2P){   // 📸 카드를 그림 그대로 (차트 포함)
      return loadScript(document, window.H2P).then(function(){ return window.snapEls ? snapEls(cards.slice(0, 6)) : Promise.reject("no snap"); }).then(function(cvs){
        if (!cvs || !cvs.length) throw new Error("빈 그림");
        head.blocks = cvs.map(function(c){ return ["img", {c: c, max: cvs.length === 1 ? 2600 : 1500}]; }); return head;
      }).catch(function(e){ console.warn("snap 실패 → 글로", e); return domScreen({text: true}); });
    }
    var blocks = [], small = [], flush = function(){ if (small.length){ blocks.push(["list", {title: blocks.length ? "" : "화면에 보이는 항목", rank: false, wrap2: true, max: 10, items: small.slice(0, 10)}]); small = []; } };
    cards.forEach(function(c){
      var r = c.getBoundingClientRect();
      if (r.height < 150 && !c.querySelector("tr")){   // 접힌 줄·작은 칸 → 한 줄 항목으로 모음
        var ls_ = c.innerText.split("\n").map(cl).filter(function(l){ return l && !JUNK.test(l) && l !== "▶" && l.length > 1; });
        if (!ls_.length) return;
        var it = {n: ls_[0], s: ls_.slice(1).filter(function(l){ return !VAL.test(l); }).join(" · ").slice(0, 90), v: ls_.slice(1).filter(function(l){ return VAL.test(l); })[0] || null};
        if (it.v) it.vc = /^[+]/.test(it.v) ? UP : /^[−\-–]/.test(it.v) ? DN : INK;
        small.push(it); return;
      }
      flush(); blocks = blocks.concat(cardBlocks(c, title));
    });
    flush();
    blocks = blocks.filter(function(b){ return b && b[1]; }).slice(0, 10);
    if (!blocks.length) return Promise.resolve(null);
    var first = cards.length === 1 || cards[0].getBoundingClientRect().height > 300 ? cardTitle(cards[0]) : "";
    return Promise.resolve({kind: "screen", scene: grpScene(cur()), title: sh ? title : (title.replace(/^\S+\s/, "") || "지금 화면") + (first && !sh ? " — " + first.replace(/^[^\w가-힣]+/, "") : ""), sub: (segT ? segT + " · " : "") + md(today()) + " · 앱 화면 내용 정리", blocks: blocks, note: "앱 화면의 내용을 그대로 옮겨 정리했어요"});
  }
  function screenSummary(){   // 화면 요약 한 장 (하위 탭·날짜 반영) — 없으면 null
    var k = cur(), seg = document.querySelector("#pdseg .on"), sk = seg ? seg.dataset.k : null;
    if (k === "fund" && sk === "pv") return null;
    if (k === "bond" && (sk === "brl" || sk === "bru")) return null;
    if (k === "els" && (sk === "design" || sk === "cmp")) return null;
    return SCREENS[k] ? function(){ return SCREENS[k](sk); } : null;
  }
  function sendChooser(){   // 🏠 밖의 화면: 요약 한 장 / 지금 보는 부분 / (펼친 상품)
    var old = document.getElementById("opch"); if (old) old.remove();
    var k = cur(), R = TABS[k] === "상품" ? selected() : null, sum = screenSummary(), sh = document.getElementById("sheet");
    var vc = sh ? [] : inView(document.getElementById("main") || document.body), vt = sh ? cl((sh.querySelector(".sh-top b") || {}).innerText || "") : vc.map(cardTitle).filter(Boolean).slice(0, 3).join(" · ");
    var opts = [];
    if (R) opts.push(["prod", "📦 펼친 이 상품 한 장", cl(R.o && (R.o.n || R.o.name) || "")]);
    if (sum && !sh) opts.push(["sum", "🗂 이 화면 요약 한 장", heroName() + (document.querySelector("#pdseg .on") ? " · " + cl(document.querySelector("#pdseg .on").innerText) : "")]);
    opts.push(["view", sh ? "📄 열어 둔 이 내용 한 장" : "📄 지금 보고 있는 부분 한 장", vt || "화면에 보이는 카드"]);
    var box = document.createElement("div"); box.id = "opch";
    box.innerHTML = '<div class="opc-s"><h3>📨 보내기</h3><label class="opc-n">✍️ 보내는 사람 <input id="opcnm" maxlength="30" placeholder="내 이름 (예: 김OO PB · 비워도 돼요)" value="' + String(ls("pbname") || "").replace(/[&<>"]/g, "") + '"></label>' + cliHTML() +
      opts.map(function(o, i){ return '<button class="opc-b' + (i === 0 ? " main" : "") + '" data-o="' + o[0] + '">' + o[1] + ' <small>' + String(o[2]).replace(/[&<>"]/g, "").slice(0, 80) + '</small></button>'; }).join("") +
      '<button class="opc-x" data-x="1">닫기</button></div>';
    document.body.appendChild(box); cliBind(box);
    var nmI = document.getElementById("opcnm"); if (nmI) nmI.addEventListener("input", function(){ ls("pbname", nmI.value.trim().slice(0, 30)); });
    box.addEventListener("click", function(ev){ var t = ev.target; if (t === box || t.closest("[data-x]")){ box.remove(); return; } var o = t.closest("[data-o]"); if (!o) return; box.remove(); go2(o.dataset.o, R, sum); });
  }
  function go2(o, R, sum){
    var p = o === "prod" ? mkProduct(R) : o === "sum" ? sum() : domScreen();
    toast("한 장 만드는 중…");
    p.then(function(C){ if (!C){ toast("이 화면은 한 장으로 옮길 내용이 없어요"); return; } if (C.refuse){ toast(C.refuse); return; } var cv = draw(C, pbname()), sp = share(cv, C.title); cliDone(); return sp; }).catch(function(e){ console.warn(e); toast("만들지 못했어요"); });
  }
  /* ───────────── 공유 ───────────── */
  function share(c, title){
    var pre = cliLab() ? CLIENT.replace(/[^\w가-힣]+/g, "") + "님_" : "";
    return blobOf(c).then(function(b){
      if (!b) throw new Error("blob");
      var f = new File([b], pre + (title || "한장").replace(/[^\w가-힣]+/g, "_").slice(0, 30) + "_" + kst().toISOString().slice(5, 10).replace("-", "") + (b.type === "image/jpeg" ? ".jpg" : ".png"), {type: b.type || "image/png"});
      readySheet([f], title || "한 장");
    });
  }
  // 💌 바로 만들던 곳(종목 화면 📨 · 상품 줄 「이 상품 한 장 보내기」 · 종목 한 장)도 이름 칸을 한 번 거치게
  function ask(title, run){
    var old = document.getElementById("opch"); if (old) old.remove();
    var box = document.createElement("div"); box.id = "opch";
    box.innerHTML = '<div class="opc-s"><h3>📨 ' + String(title || "보내기").replace(/[&<>"]/g, "") + '</h3><label class="opc-n">✍️ 보내는 사람 <input id="opcnm" maxlength="30" placeholder="내 이름 (예: 김OO PB · 비워도 돼요)" value="' + String(ls("pbname") || "").replace(/[&<>"]/g, "") + '"></label>' + cliHTML() +
      '<button class="opc-go" data-go="1">한 장 만들기</button><button class="opc-x" data-x="1">닫기</button></div>';
    document.body.appendChild(box); cliBind(box);
    var nmI = document.getElementById("opcnm"); if (nmI) nmI.addEventListener("input", function(){ ls("pbname", nmI.value.trim().slice(0, 30)); });
    box.addEventListener("click", function(ev){ var t = ev.target; if (t === box || t.closest("[data-x]")){ box.remove(); return; } if (t.closest("[data-go]")){ box.remove(); run(); } });
  }
  /* 🇰🇷 11/19 오늘 국장 한 장 — 첫 화면 「🇰🇷 오늘 국장」 칸의 📨 (사용자 「시황 한 장의 일부라도 고객에게」)
     live_kr(10분마다) · wl_live(크게 움직인 대형주 뉴스 제목) · flow_kr(수급) · bear(큰 흐름) — 화면 칸과 같은 숫자 · 사라·팔라는 말 없음 */
  SCREENS.krday = function(){
    var q5 = "?" + Math.floor(Date.now() / 120000);
    return Promise.all([gj("archive/x/live_kr.json" + q5), gj("archive/x/wl_live.json" + q5), window.__flowLine ? window.__flowLine().catch(function(){ return ""; }) : "", gj(RAWM + "market/bear.json" + q())]).then(function(r){
      var K = r[0], WL = r[1], FL = r[2], BR = r[3]; if (!K || !K.index) return null;
      var IX = {}; K.index.forEach(function(x){ IX[x.name] = x; }); var kp = IX["코스피"], kq = IX["코스닥"]; if (!kp) return null;
      var td = today(), isT = K.date === td, closed = !isT || String(K.t || "") >= "15:30";
      var when = isT ? (closed ? md(K.date) + " " + K.t + " 마감" : md(K.date) + " 장중 " + K.t + " 기준") : md(K.date) + " 마감";
      var up = K.up || 0, dn = K.down || 0, tot = up + dn + (K.flat || 0), mood = moodOf(kp.chg);
      var big = function(L){ return (L || []).filter(function(x){ return (x.n || 0) >= 8; }); };
      var lead = function(L){ return (L || []).slice().sort(function(a, b){ return Math.abs(b.r) - Math.abs(a.r); }).slice(0, 3).map(function(x){ return x.n + " " + pct(x.r); }).join(" · "); };
      var strong = big(K.strong).slice(0, 4).map(function(x){ return {n: x.name, s: lead(x.lead), v: x.r, bar: x.r}; });
      var weak = big(K.weak).slice(0, 3).map(function(x){ return {n: x.name, s: lead(x.lead), v: x.r, bar: x.r}; });
      var stars = (K.value || []).slice(0, 5).map(function(x){ return {n: x.n, r: x.r, p: x.p, v: x.v}; });
      var why = ((WL && WL.why) || []).filter(function(w){ return w.day === K.date; }).sort(function(a, b){ return Math.abs(b.r) - Math.abs(a.r); }).slice(0, 4)
        .map(function(w){ var nw = (w.news || [])[0]; return {n: w.n, s: nw ? nw.t : "관련 뉴스 없음 — 업종·수급 영향일 수 있어요", v: w.r}; });
      var SN = isT ? (K.snaps || []) : [], line = SN.length >= 3 ? {a: SN.map(function(x){ return x[3]; }), b: SN.map(function(x){ return x[4]; }), la: "코스피", lb: "코스닥", from: SN[0][0]} : null;
      var bk = ((BR && BR.markets) || []).filter(function(m){ return m.key === "kospi"; })[0];
      var bigp = bk && bk.dd != null ? {h: "📏 큰 흐름", t: "코스피는 고점보다 " + pct(bk.dd) + (bk.state === "🐻" ? " — 하락장 구간(종가 기준)이에요. 하루 반등보다 큰 흐름이 돌아서는지가 중요해요." : bk.state === "🟡" ? " — 조정 구간(종가 기준)이에요." : " — 큰 흐름은 정상 구간이에요."), tone: bk.state === "🐻" ? "warn" : "info", max: 3} : null;
      return {kind: "screen", scene: "city_" + mood, mood: mood, title: "오늘의 한국 증시", sub: when + " · 코스피·코스닥",
        hero: {l: "🇰🇷 코스피 " + Math.round(kp.last).toLocaleString(), v: pct(kp.chg, 2), c: cOf(kp.chg), s: tot > 100 ? "오른 종목 " + up.toLocaleString() + " · 내린 종목 " + dn.toLocaleString() + " (" + Math.round(up / tot * 100) + "%가 올랐어요)" : ""},
        stats: [kq ? {l: "코스닥 " + (Math.round(kq.last * 10) / 10).toLocaleString(), v: pct(kq.chg, 2), c: cOf(kq.chg)} : null, K.limit_up != null ? {l: "상한가", v: K.limit_up + "개", c: ""} : null].filter(Boolean),
        blocks: [["line", line],
          ["note", FL ? {h: "🧲 누가 샀나", t: FL.replace(/^코스피 /, "코스피 · "), max: 2} : null],
          ["list", strong.length ? {title: "🔥 오늘 강한 업종 · 대표 종목", items: strong, rank: false} : null],
          ["list", weak.length ? {title: "🧊 오늘 약한 업종", items: weak, rank: false} : null],
          ["stars", stars.length >= 3 ? stars : null],
          ["list", why.length ? {title: "⚡ 크게 움직인 대형주 — 뉴스 제목", items: why, rank: false} : null],
          ["note", bigp]],
        note: "한국거래소 시세(10분마다) · 뉴스 제목은 네이버 증권 · 제목이 이유를 다 말해 주진 않아요"};
    });
  };
  function sendKr(){
    ask("오늘 국장 한 장", function(){
      toast("한 장 만드는 중…");
      SCREENS.krday().then(function(C){ if (!C){ toast("오늘 국장 자료를 못 가져왔어요"); return; } var nm = pbname(), sp = share(safeDraw(C, nm), C.title); cliDone(); return sp; })
        .catch(function(e){ console.warn(e); toast("만들지 못했어요"); });
    });
  }
  function go(R, now){
    if (!now){ ask(R ? "이 상품 한 장 보내기" : "한 장 보내기", function(){ go(R, true); }); return; }
    var k = cur(), p = null;
    if (R) p = mkProduct(R);
    else if (k === "onepager"){ var ob = document.querySelector("[data-opstk]"); p = ob ? mkStock(ob.dataset.opstk, ob.dataset.nm) : null; if (!ob){ toast("종목을 하나 연 뒤 눌러 주세요"); return; } }
    else if (SCREENS[k]) p = SCREENS[k]();
    else if (k === "port") p = mkPort();
    else if (k === "home") p = mkMarket();
    if (!p){ if (TABS[k] === "상품") toast("보낼 상품을 하나 펼친 뒤 눌러 주세요"); else toast("이 화면은 한 장으로 못 만들어요"); return; }
    toast("한 장 만드는 중…");
    p.then(function(C){
      if (!C){ toast("자료를 못 가져왔어요"); return; }
      if (C.refuse){ toast(C.refuse); return; }
      var nm = pbname(), sp = share(safeDraw(C, nm), C.title); cliDone(); return sp;
    }).catch(function(e){ console.warn(e); toast("만들지 못했어요"); });
  }

  /* ───────────── 단추 ───────────── */
  function fab(){
    var k = cur(), b = document.getElementById("opbtn");
    if (!TABS[k] && !document.getElementById("sheet")){ if (b) b.remove(); return; }
    if (b){ b.classList.toggle("onsheet", !!document.getElementById("sheet")); return; }
    b = document.createElement("button"); b.id = "opbtn"; b.type = "button"; b.innerHTML = "📨 <span>보내기</span>"; b.setAttribute("aria-label", "보내기 — 한 장");
    b.onclick = function(ev){ ev.stopPropagation(); var k2 = cur(); if (k2 === "home" && !document.getElementById("sheet")) chooser(); else if (k2 === "onepager" && !document.getElementById("sheet")) go(null); else sendChooser(); };
    document.body.appendChild(b);
  }
  function rowBtns(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot .pd-tap.on > .pd-x:not([data-op1])"), function(p){
      p.setAttribute("data-op1", "1"); var row = p.parentNode, R = __pdObj(row.dataset.x); if (!R || !R.o) return;
      if (R.k === "pv" || R.k === "pvl" || R.o.pv === true) return;
      var b = document.createElement("button"); b.className = "em-add op-row"; b.type = "button"; b.textContent = "📨 이 상품 한 장 보내기";
      b.onclick = function(ev){ ev.stopPropagation(); go(R); }; p.appendChild(b);
    });
  }
  var css = document.createElement("style");
  css.textContent = "#opbtn{position:fixed;left:16px;bottom:calc(env(safe-area-inset-bottom) + 74px);z-index:80;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:rgba(18,24,38,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--text);font:inherit;font-size:14px;font-weight:800;padding:9px 14px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.45)}" +
    "#opch{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}.opc-s{width:100%;max-width:520px;max-height:85vh;overflow:auto;background:var(--panel);color:var(--text);border-radius:18px 18px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 20px);box-sizing:border-box}.opc-s h3{margin:0 0 12px;font-size:17px}" +
    ".opc-n{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub,#aab);margin:0 0 10px}.opc-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-4px 0 8px}.opc-rc button{font:inherit;font-size:13px;font-weight:700;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.opc-rc button.on{border-color:var(--acc,#7c9cff);background:rgba(124,156,255,.18)}.opc-tip{margin:-2px 0 12px;font-size:12px;color:var(--mut,#8a94a8)}.opc-n input{flex:1;min-width:0;font:inherit;font-size:15px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}" +
    ".opc-b{display:block;width:100%;text-align:left;font:inherit;font-size:16px;font-weight:800;padding:14px;margin:0 0 8px;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2);color:var(--text)}.opc-b small{display:block;font-weight:500;font-size:12.5px;color:var(--sub,#aab);margin-top:3px}.opc-b.main,.opc-b.on{border-color:var(--acc,#7c9cff)}" +
    ".opc-wm{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:15px;font-weight:800;margin:4px 0 8px;padding:12px 14px;border-radius:14px;background:var(--panel2);border:1.5px solid var(--line)}" +
    ".opc-wm input{position:absolute;opacity:0;width:1px;height:1px}.opc-wm i{flex:none;width:50px;height:30px;border-radius:15px;background:#8a94a8;position:relative;transition:.2s}.opc-wm i:after{content:'';position:absolute;left:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:.2s}" +
    ".opc-wm input:checked + i{background:#3fb950}.opc-wm input:checked + i:after{left:23px}" +
    ".opc-h{display:flex;justify-content:space-between;align-items:center;margin:10px 0 6px;font-size:13px;color:var(--sub,#aab)}.opc-h button{font:inherit;font-size:12.5px;background:none;border:1px solid var(--line);color:var(--text);border-radius:999px;padding:3px 10px}" +
    ".opc-list{display:flex;flex-direction:column;gap:4px;max-height:40vh;overflow:auto}.opc-r{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:10px;background:var(--panel2);font-size:14px}.opc-r b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.opc-r small{color:var(--mut,#8a94a8);font-size:11.5px}.opc-r input{width:18px;height:18px}" +
    ".opc-go{display:block;width:100%;margin-top:10px;font:inherit;font-size:15px;font-weight:800;padding:13px;border-radius:14px;border:0;background:var(--acc,#7c9cff);color:#fff}.opc-go:disabled{opacity:.45}.opc-x{display:block;width:100%;margin-top:8px;font:inherit;font-size:14px;padding:10px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--text)}" +
    "#opready{position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}.opr-s{width:100%;max-width:520px;max-height:90vh;overflow:auto;background:var(--panel);color:var(--text);border-radius:18px 18px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 18px);box-sizing:border-box}.opr-s h3{margin:0 0 10px;font-size:17px}.opr-im{display:flex;gap:8px;overflow-x:auto;margin:0 0 12px}.opr-f{flex:1;padding:16px;border-radius:12px;background:var(--panel2);border:1px solid var(--line);font-weight:700;font-size:14px;word-break:break-all}.opr-c{flex:none;display:flex;flex-direction:column;gap:6px;align-items:stretch}.opr-one{font:inherit;font-size:13.5px;font-weight:800;padding:9px 8px;border-radius:10px;border:0;background:#fee500;color:#191919}.opr-one.done{background:var(--panel2);color:var(--sub)}.opr-im img{flex:none;height:min(42vh,360px);width:auto;border-radius:12px;border:1px solid var(--line);-webkit-touch-callout:default}.opr-go{display:block;width:100%;font:inherit;font-size:17px;font-weight:800;padding:15px;border-radius:14px;border:0;background:#fee500;color:#191919;margin:0 0 8px}.opr-sv{display:block;width:100%;font:inherit;font-size:15px;font-weight:700;padding:12px;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2);color:var(--text)}.opr-n{margin:8px 0 4px;font-size:12.5px;color:var(--sub,#aab);text-align:center}.opr-x{display:block;width:100%;margin-top:6px;font:inherit;font-size:14px;padding:10px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--text)}" +
    "#opbtn.onsheet{z-index:100001}#opch{z-index:100002!important}#opbtn span{font-size:14px}:root[data-ui=light] #opbtn{background:#fff;color:#141a26;border-color:#dde2ea}#opbtn:active{transform:scale(.96)}.op-row{margin-top:8px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { fab(); } catch(x) {} try { rowBtns(); } catch(x) {} }, 300); }
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
  window.addEventListener("hashchange", soon);
  window.__onepage = {sendKr: sendKr, _safeDraw: function(C, nm){ return safeDraw(C, nm); }, _tainted: function(c){ return tainted(c); }, ready: readySheet,
    /* 📨 11/23 A11/23-1 한 장 화면 미리보기(ux1123.js)가 받는 분·보내기 길을 그대로 쓰게 — 저장 원칙(보낸 뒤 비움 · 최근 8명 칩)은 여기 것 그대로 */
    _client: function(v){ if (v !== undefined) CLIENT = String(v || "").trim().slice(0, 20); return CLIENT; }, _cliRecent: cliRecent, _cliDone: cliDone, _share: share, _pbname: function(){ return ls("pbname") || ""; }, screens: SCREENS, dom: domScreen, sendChooser: sendChooser, go: go, draw: draw, chooser: chooser, _mkStock: mkStock, _mkMyEls: mkMyEls, _mkPin: mkPin, _goMany: goMany, _mkProduct: mkProduct, _mkPort: mkPort, _mkMarket: mkMarket};
  soon();
})();
;
__bk(16);
__be(2);
