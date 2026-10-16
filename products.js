/* CH Investing — 🛍️ 상품: 미래에셋증권이 지금 파는 채권 · 펀드 · ELS (archive/x/products.json, products.yml 하루 3번)
   10/16 사용자: 「상품 카테고리 — 국채·미국채·브라질국채 / 펀드·사모펀드(수익률 순위) / ELS — 하위 3개 · 기존 카테고리 형식과 비슷하게」
   세 탭: bond(🏦 채권) · fund(📦 펀드) · els(🎯 ELS). 숫자는 미래에셋 공개 화면에서 받은 그대로 — 사라는 뜻 아님. */
(function(){
  var e = V.e, cls = V.cls, fmt = V.fmt;
  var SEL = {}, PER = "m3";
  try { SEL = JSON.parse(localStorage.getItem("prodsel") || "{}"); PER = localStorage.getItem("prodper") || "m3"; } catch(x) {}
  function keep(){ try { localStorage.setItem("prodsel", JSON.stringify(SEL)); localStorage.setItem("prodper", PER); } catch(x) {} }
  function card(t, b, x, id){ return '<section class="card"' + (id ? ' id="' + id + '"' : '') + '>' + (t ? '<h3>' + t + (x || "") + '</h3>' : '') + b + '</section>'; }
  function P(){ return getJSON("archive/x/products.json?" + Math.floor(Date.now() / 300000), {ttl: 300000}); }
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
    brl: ["🇧🇷 브라질국채가 뭐예요?", "브라질 정부가 헤알(BRL)로 발행한 채권이에요. 금리가 연 10%를 넘는 대신 ① 헤알 환율이 크게 흔들리고 ② 신용등급이 BB(투기등급)라 위험이 커요.<br><br>" +
      "<b>왜 인기였나</b> — 한국-브라질 조세협약으로 <b>개인은 이자·매매차익·환차익 모두 비과세</b>예요(법인은 과세). 금융소득종합과세에 안 잡혀서 자산가들이 많이 샀어요. 단, 협약·법이 바뀌면 달라질 수 있어요.<br><br>" +
      "<b>종류 세 가지</b> — <b>이표채(NTN-F)</b>: 6개월마다 이자, 금리가 고정. <b>할인채(LTN)</b>: 이자 없이 싸게 사서 만기에 액면. <b>물가채(NTN-B)</b>: 「물가상승률(IPCA) + 고정금리」라 물가가 오르면 같이 올라요.<br><br>" +
      "<b>환율이 전부</b> — 금리 12%를 받아도 헤알이 12% 떨어지면 원화로는 0이에요. 헤알/원이 쌀 때(아래 차트 낮은 쪽) 사면 환차익이 더해지고, 비쌀 때 사면 금리를 다 까먹을 수 있어요. 2011년 1헤알=700원이던 게 지금 260원대 — 긴 하락이었어요.<br><br>" +
      "<b>미래에셋에서는</b> — 판매가 아니라 <b>단순중개</b>: 홈페이지에 종목표가 없고 MAPS(해외채권 중개)나 영업점에서 종목·금리를 받아요. 수수료 연환산 오프라인 30bp·온라인 15bp. 아래 종목·금리는 브라질 재무부가 매일 공개하는 Tesouro Direto 기준이라 미래에셋 중개 금리와는 조금 다를 수 있어요."],
    oth: ["공사채·회사채·신종자본증권이 뭐예요?", "<b>공사채</b>는 한국전력·도로공사·수자원공사처럼 정부가 뒤에 있는 공기업이 발행한 채권(국채보다 금리 조금 높고 거의 안전). <b>지방채</b>는 서울·부산 같은 지자체(도시철도공채 등). <b>회사채</b>는 일반 기업 — 신용등급(AAA~BBB)이 낮을수록 금리가 높고 부도 위험이 있어요.<br><br>" +
      "<b>신종자본증권·조건부자본증권(코코본드)</b> — 은행·금융지주가 발행하는 「만기 없는(영구) 채권」이에요. 금리가 높은 대신 ① 은행이 부실해지면 원금이 <b>상각(0원)</b>되거나 주식으로 바뀌고 ② 이자 지급이 중단될 수 있고 ③ 보통 5년 뒤 「콜」로 갚지만 안 갚을 수도 있어요. 그래서 「매우높은위험」 표시가 붙어요. 2023년 크레디트스위스 사태 때 실제로 0원이 됐어요.<br><br>" +
      "<b>어떻게 보나</b> — 세후 수익률이 국고채보다 얼마나 높은지(그 차이가 위험의 값), 잔존기간, 위험 등급. 「후순위」는 회사가 망하면 다른 채권자보다 늦게 받는다는 뜻."],
    fund: ["📦 펀드가 뭐예요? (공모 · 사모 · 재간접)", "<b>펀드</b>는 여러 사람 돈을 모아 전문가(운용사)가 대신 투자하는 바구니예요. 바구니 값(기준가)이 매일 바뀌고, 수익률 = 기준가가 얼마나 올랐나.<br><br>" +
      "<b>공모펀드</b> — 누구나 1만원부터 살 수 있고, 금융투자협회에 매일 기준가·수익률을 공시해요. 미래에셋 펀드검색에 1,700여 개.<br>" +
      "<b>사모펀드</b> — 49인 이하(일반투자자)에게만 비공개로 파는 펀드. 최소 3억원, 운용 전략을 공개 안 해도 되고 규제가 느슨해서 헤지펀드(롱숏·멀티전략)·부동산·메자닌 같은 특이한 투자를 해요. 수익률을 공개할 의무가 없어서 <b>인터넷에 성적표가 없어요</b> — 금융투자협회에 기준가를 올리는 1,300여 개만 볼 수 있고, 유명 주식형 헤지펀드(타임폴리오·DS 등)는 대부분 빠져 있어요.<br>" +
      "<b>사모투자재간접형</b> — 공모펀드인데 안에 사모(헤지)펀드를 여러 개 담은 것. 일반 계좌로 500만원부터 사모펀드 성적을 받는 길이에요. 미래에셋에서 6개 팔아요.<br><br>" +
      "<b>수익률 읽는 법</b> — 기간(3개월·1년·3년)마다 순위가 완전히 달라져요. 1년 +80%는 「작년에 좋았다」지 「내년에도」가 아니에요. 같은 유형끼리 비교(주식형 vs 주식형)하고, <b>순자산</b>이 너무 작은 펀드(10억 미만)는 수익률이 왜곡되기 쉬워 뺐어요. <b>위험 등급</b> 1(매우높음)~6(매우낮음). 수수료 「선취」는 살 때 떼고, 「총보수」는 매년 떼요(온라인 클래스 e 가 보통 싸요).<br><br>" +
      "<b>사모 순위의 한계</b> — 사모펀드 수익률은 금융투자협회 「기준가격」을 1·3·6·12개월 전과 비교해 계산한 거라 <b>분배금(배당)·결산으로 기준가가 리셋된 펀드는 틀리게 나와요</b>. 부동산·특별자산 펀드가 특히 그래요. 「2종·손익차등형」은 후순위(레버리지)라 따로 표시했어요. 어느 판매사가 파는지는 공개 안 돼서 미래에셋 판매 여부는 표시 못 해요(재간접 6개만 확실)."],
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
    h += seg("pdseg", [["gov", "🇰🇷 국채"], ["ust", "🇺🇸 미국채"], ["brl", "🇧🇷 브라질국채"], ["oth", "공사채·회사채"]], k) + '<div id="pdbody">' + bondBody(D, k) + '</div>';
    if (D.notice && D.notice.length) h += '<details class="card cpx-d"><summary>📢 채권 공지 <span class="mut">미래에셋 · 최근 ' + D.notice.length + '건</span></summary>' +
      D.notice.map(function(n){ return '<a class="pd-nt" href="' + e(n.url) + '" target="_blank" rel="noopener"><span class="mut">' + e(n.date || "") + '</span>' + e(n.title) + '</a>'; }).join("") + '</details>';
    return h + WARN;
  }
  /* 🧾 10/16 사용자: 「펀드나 채권 누르면 각각에 대한 설명 혹은 모의 투자계산서 나오게 탭 접기」 — 행을 누르면 그 밑에 설명 + 계산서가 펼쳐짐 */
  var OBJ = {}, OBN = 0, AMT = 1000;
  try { AMT = +localStorage.getItem("prodamt") || 1000; } catch(x) {}
  function reg(kind, o){ var id = "x" + (++OBN); OBJ[id] = {k: kind, o: o}; return ' data-x="' + id + '"'; }
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
      var g = K.filter(function(r){ return r.kind === "국채"; }).sort(function(x, y){ return (y.after || 0) - (x.after || 0); });
      return doc("gov") + card("🇰🇷 국고채·국민주택채권 <span class='mut'>장외채권 · 세후 수익률 높은 순 · " + g.length + "개</span>",
        '<p class="note" style="margin:0 0 10px">「세후 수익률」은 이자 세금(15.4%)을 뗀 뒤 1년에 실제로 손에 쥐는 비율, 「은행 예금으로 치면」은 같은 돈을 예금했을 때 필요한 세전 금리예요. 만기가 긴 국채는 중간에 팔면 값이 크게 움직여요.</p>' + bondRows(g));
    }
    if (k === "ust"){
      var y = hist(H.y10, 260), fx = hist(H.usdkrw, 260), items = (U.items || []).slice().sort(function(a, b){ return a.mat < b.mat ? -1 : 1; });
      var h = doc("ust") + card("🇺🇸 미래에셋이 파는 미국채 <span class='mut'>" + e(U.date ? md(U.date) + " 판매정보" : "") + "</span>",
        (items.length ? '<div class="pd-list">' + items.map(function(r){
          var yr = Math.max(0, (new Date(r.mat) - Date.now()) / 365.25 / 864e5);
          return '<div class="pd-it pd-tap"' + reg("ust", Object.assign({fx: U.fx}, r)) + '><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' (약 ' + yr.toFixed(1) + '년) · 표면금리 ' + pc(r.cpn, 3) + ' · ' + e(r.cur) + '</small></div>' +
            '<div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>시세 수익률(세전)</small></div></div></div>'; }).join("") + '</div>' : '<div class="empty">오늘 판매정보가 아직 없어요.</div>') +
        '<p class="note">미국채는 달러로 사요 — 수익률은 달러 기준이고, 원화로 바꾸면 환율만큼 더해지거나 빠져요. 이자는 과세(15.4%), 표면금리가 낮은 채권은 이자 대신 싸게 사서 만기에 액면을 받는 몫이 커요. 매일 아침 미래에셋이 올리는 「미국채 시장동향·판매정보」 글에서 가져왔어요' + (U.url ? ' (<a href="' + e(U.url) + '" target="_blank" rel="noopener">원문</a>)' : '') + '.</p>');
      h += card("미국 10년 국채 금리 <span class='mut'>1년 · 야후</span>", (y.length > 5 ? line1(vals(y), lbl(y), {name: "10년", color: "#e66767", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 10년 금리 ' + (U.y10 != null ? '<b>' + pc(U.y10) + '</b> (전일 ' + pc(U.y10_prev) + ')' : '–') + '. 금리가 오르면 이미 산 채권 값은 내려가고, 내리면 올라가요 — 만기가 길수록 더 크게.</p>');
      h += card("원/달러 환율 <span class='mut'>1년</span>", (fx.length > 5 ? line1(vals(fx), lbl(fx), {name: "원/달러", color: "#7c9cff", h: 130}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 ' + (U.fx != null ? '<b>' + fmt(U.fx) + '원</b> (전일 ' + fmt(U.fx_prev) + ')' : '–') + '. 달러가 싸질 때 사 두면 환차익, 비쌀 때 사면 환손실이 더해져요.</p>');
      if (A.items && A.items.length) h += '<details class="card cpx-d"><summary>🇦🇺 호주국채도 팔아요 <span class="mut">' + A.items.length + '개 · 10년 ' + pc(A.y10) + '</span></summary><div class="pd-list">' + A.items.map(function(r){
        return '<div class="pd-it pd-tap"' + reg("aud", Object.assign({fx: A.fx}, r)) + '><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' · 표면 ' + pc(r.cpn) + ' · AUD</small></div><div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>수익률</small></div></div></div>'; }).join("") +
        '</div><p class="note">호주달러 환율 ' + fmt(A.fx) + '원 · 신용등급 AAA · 이자 과세.</p></details>';
      return h;
    }
    if (k === "brl"){
      var f = hist(B.fx, 260), ub = hist(B.usdbrl, 260), last = f.slice(-1)[0], first = f[0];
      var yr1 = last && first ? (last[1] / first[1] - 1) * 100 : null;
      var T = (D.td || []).filter(function(x){ return x.code !== "LFT"; }), TH = D.td_hist || {};
      var grp = {}; T.forEach(function(x){ (grp[x.kind] = grp[x.kind] || []).push(x); });
      var h = doc("brl") + card("🇧🇷 브라질국채 <span class='mut'>미래에셋 · 단순중개</span>",
        '<div class="pd-brl"><div><small>이자 세금</small><b class="up">비과세</b><em>개인 · 한-브라질 조세협약</em></div><div><small>신용등급</small><b>BB</b><em>투기등급 (국제)</em></div><div><small>통화</small><b>BRL</b><em>헤알 · USD 표시도</em></div><div><small>잔존만기</small><b>1~30년</b><em>이표채·물가채·할인채</em></div></div>' +
        '<p class="note">미래에셋은 브라질국채를 「판매」가 아니라 <b>단순중개</b>로 다뤄요 — 홈페이지에 매일 파는 종목표가 올라오지 않고, MAPS(해외채권 중개 화면)나 영업점에서 종목·금리를 받아요. 수수료 연환산 오프라인 30bp · 온라인 15bp. 아래 종목·금리는 <b>브라질 재무부(Tesouro Direto)</b>가 매일 공개하는 값이라 미래에셋 중개 호가와는 조금 다를 수 있어요.</p>');
      var AN = D.anb || [], fxb = last ? last[1] : null;
      var brow = function(x){
        var yr = Math.max(0, (new Date(x.mat) - Date.now()) / 365.25 / 864e5);
        return '<div class="pd-it pd-tap"' + reg("brl", Object.assign({fx: fxb}, x)) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.code) + ' ' + e(x.mat.slice(0, 7).replace("-", "/")) + '</b><small>만기 ' + e(x.mat) + ' (약 ' + yr.toFixed(1) + '년) · 단가 R$ ' + fmt(x.pu) + '</small></div>' +
          '<div class="pd-v"><b class="up">' + (x.code === "NTN-B" || x.code === "NTN-C" ? (x.code === "NTN-B" ? "IPCA+" : "IGPM+") : x.code === "LFT" ? "Selic+" : "") + (x.r != null ? x.r.toFixed(x.code === "LFT" ? 3 : 2) + "%" : "–") + '</b><small>' + (x.code === "LTN" || x.code === "NTN-F" ? "연 금리(헤알·고정)" : x.code === "LFT" ? "Selic 가산" : "물가 + 연") + '</small></div></div></div>'; };
      if (AN.length){
        var ag = {}; AN.forEach(function(x){ (ag[x.code] = ag[x.code] || []).push(x); });
        h += card("만기별 브라질 국채 전 종목 <span class='mut'>" + AN.filter(function(x){ return x.code !== "LFT"; }).length + "개 · ANBIMA " + e(AN[0].asof) + "</span>",
          ["NTN-F", "LTN", "NTN-B", "NTN-C"].filter(function(c){ return ag[c]; }).map(function(c){ return '<div class="sub2">' + e(c) + ' <span class="mut">' + e(ag[c][0].kind) + ' · ' + ag[c].length + '개</span></div><div class="pd-list">' + ag[c].map(brow).join("") + '</div>'; }).join("") +
          '<p class="note">브라질 금융시장협회(ANBIMA)가 매일 내는 <b>유통시장 지표금리</b> — 시장에서 실제로 거래되는 브라질 국채 전부예요(한국 투자자가 주로 사는 NTN-F·LTN·NTN-B). 미래에셋 중개 호가는 이것과 조금 달라요. 종목을 누르면 만기까지 현금흐름이 나와요.</p>') +
          (ag.LFT ? '<details class="card cpx-d"><summary>LFT (Selic 변동금리) ' + ag.LFT.length + '개 <span class="mut">한국 투자자는 거의 안 사요</span></summary><div class="pd-list">' + ag.LFT.map(brow).join("") + '</div></details>' : '');
      } else if (T.length){
        h += card("만기별 브라질 국채 <span class='mut'>" + T.length + "개 · 브라질 재무부</span>", '<div class="pd-list">' + T.map(function(x){ return brow({code: x.code, kind: x.kind, mat: x.mat, pu: x.px, r: x.r, asof: x.asof}); }).join("") + '</div>');
      }
      Object.keys(TH).forEach(function(nm){ var hh = hist(TH[nm], 260); if (hh.length > 5) h += card("브라질 국채 금리 · " + e(nm) + " <span class='mut'>1년 · 연 %</span>", line1(vals(hh), lbl(hh), {name: nm, color: "#d95926", h: 130})); });
      h += card("헤알/원 환율 <span class='mut'>1년 · 원/달러 ÷ 헤알/달러</span>", (f.length > 5 ? line1(vals(f), lbl(f), {name: "헤알/원", color: "#199e70", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
          '<p class="note">지금 <b>' + (last ? fmt(last[1]) + "원" : "–") + '</b>' + (yr1 != null ? ' · 1년 ' + sg(yr1) : '') + '. 브라질국채 수익은 「채권 금리 + 환율」이라 헤알이 싸질 때 사면 환차익 몫이 커지고, 비쌀 때 사면 금리를 받아도 환손실이 더 클 수 있어요.</p>') +
        card("헤알/달러 <span class='mut'>1년 · 숫자가 커지면 헤알 약세</span>", (ub.length > 5 ? line1(vals(ub), lbl(ub), {name: "헤알/달러", color: "#c98500", h: 120}) : '<div class="spark-empty">자료 준비 중</div>'));
      return h;
    }
    var o = (D.krw || []).filter(function(r){ return r.kind !== "국채"; }).sort(function(x, y){ return (y.after || 0) - (x.after || 0); });
    var kinds = {}; o.forEach(function(r){ kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
    return doc("oth") + card("공사채·회사채·신종자본증권 <span class='mut'>장외채권 · 세후 수익률 높은 순 · " + o.length + "개</span>",
      '<div style="margin-bottom:8px">' + Object.keys(kinds).map(function(x){ return '<span class="chip2">' + e(x) + ' ' + kinds[x] + '</span>'; }).join("") + '</div>' +
      '<p class="note" style="margin:0 0 10px">「매우높은위험」으로 표시된 조건부자본증권(신종·후순위)은 은행이 어려워지면 원금을 날릴 수 있어서 금리가 높아요. 위험 등급을 꼭 같이 보세요.</p>' + bondRows(o));
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
  var PV_T = [["", "전체"], ["주식", "주식형"], ["혼합", "혼합"], ["채권", "채권형"], ["부동산", "부동산"], ["특별자산", "특별자산"], ["재간접", "재간접"]];
  var PVPER = [["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"]], PVN = {m0: "월초 대비", m1: "1개월", m3: "3개월", m6: "6개월", y1: "1년"};
  function fundView(D){
    var F = (D.funds || []).filter(function(x){ return x.t; }), k = SEL.fund || "pv", PV = D.pv || {};
    var pv = F.filter(function(x){ return x.pv; }), it = PV.items || [];
    var h = '<div class="mg-kv"><div><small>🔒 사모펀드 (금투협 공시)</small><b>' + (PV.n || 0).toLocaleString() + '개</b><em>' + e(PV.asof || "") + ' 기준가 · 운용사 ' + Object.keys(it.reduce(function(o, x){ o[x.co] = 1; return o; }, {})).length + '곳</em></div>' +
      '<div><small>미래에셋에서 살 수 있는 사모(재간접)</small><b>' + pv.length + '개</b><em>공모펀드 ' + F.length.toLocaleString() + '개 중</em></div></div>';
    h += seg("pdseg", [["pv", "🔒 사모펀드 전체"], ["mir", "🟠 미래에셋 사모(재간접)"], ["all", "🏆 공모 TOP 20"], ["type", "유형별 TOP"]], k) + '<div id="pdbody">' + fundBody(D, k) + '</div>';
    return doc("fund") + h + WARN;
  }
  function pvrow(x, i, per){
    var v = per === "m0" ? x.m0 : x[per];
    return '<div class="pd-it pd-p pd-tap"' + reg("pv", Object.assign({per: per}, x)) + '><div class="pd-h"><span class="rk">' + (i + 1) + '</span><div class="pd-n"><b>' + e(x.n) + '</b><small>' + e(x.co) + ' · ' + e(x.t) + ' · 설정 ' + e((x.est || "").slice(0, 4)) + '년' + (x.tr ? ' · <span class="chip2 hot" style="margin:0">후순위·손익차등</span>' : '') + '</small></div>' +
      '<div class="pd-v">' + (v == null ? '<b class="mut">–</b>' : sg(v)) + '<small>' + PVN[per] + '</small></div></div>' +
      '<div class="pd-row"><span>1개월 ' + sg(x.m1) + '</span><span>3개월 ' + sg(x.m3) + '</span><span>6개월 ' + sg(x.m6) + '</span><span>1년 ' + sg(x.y1) + '</span><span>설정액 <b>' + fmt(x.amt) + '억</b></span><span>기준가 <b>' + fmt(x.nav) + '</b></span></div></div>';
  }
  function fundBody(D, k){
    var F = (D.funds || []).filter(function(x){ return x.t; }), per = PER;
    var by = function(a, p){ p = p || per; return a.filter(function(x){ return x[p] != null; }).sort(function(x, y){ return y[p] - x[p]; }); };
    if (k === "pv"){
      var PV = D.pv || {}, it = PV.items || [], pp = SEL.pvper || "m3", tf = SEL.pvt || "", q = (SEL.pvq || "").trim();
      // 분배금·결산 의심: 한 달 기준가 변화가 금투협 「월초 대비」와 15%p 넘게 어긋나면 순위에서 뺌
      var sus = function(x){
        if (x.m1 != null && x.m0 != null && Math.abs(x.m1 - x.m0) > 15) return true;
        if (/주식/.test(x.t || "")) return false;                       // 주식형은 진짜 크게 움직일 수 있음
        var pts = [x.y1, x.m6, x.m3, x.m1, 0].filter(function(v){ return v != null; }).map(function(r){ return x.nav / (1 + r / 100); });
        for (var i = 1; i < pts.length; i++) if (Math.abs(pts[i] / pts[i - 1] - 1) > 0.25) return true;   // 두 시점 사이 25% 넘게 튐 = 분배·결산
        return false;
      };
      var base = it.filter(function(x){ return (x.amt || 0) >= 10 && x.nav > 0 && !x.tr && !sus(x) && (!tf || (x.t || "").indexOf(tf) >= 0) && (!q || (x.n + x.co).indexOf(q) >= 0); });
      var nsus = it.filter(sus).length;
      var lst = by(base, pp), top = lst.slice(0, 30), bot = lst.slice(-10).reverse();
      var med = lst.length ? lst[Math.floor(lst.length / 2)][pp] : null;
      return card("🔒 사모펀드 수익률 순위 <span class='mut'>" + PVN[pp] + " · " + lst.length + "개 (설정액 10억↑ · 후순위 제외)</span>",
        '<input class="pd-q" id="pdq" placeholder="펀드명·운용사 검색" value="' + e(q) + '">' +
        seg("pdpvper", PVPER, pp) + seg("pdpvt", PV_T, tf) +
        '<p class="note" style="margin:0 0 10px">금융투자협회에 기준가를 공시하는 사모펀드 전부(' + (PV.n || 0).toLocaleString() + '개)예요. 수익률은 기준가를 ' + e((PV.dates || {})[pp] || "") + ' 과 비교한 값이라 <b>분배금·결산(기준가 리셋)은 반영 못 해요</b> — 부동산·특별자산은 특히 틀릴 수 있어요. 유명 주식형 헤지펀드는 공시를 안 해서 없어요. 기준가가 분배·결산으로 튄 것 같은 ' + nsus + '개는 순위에서 뺐어요. 가운데 펀드 ' + (med != null ? '<b>' + V.sgn(med) + '%</b>' : '–') + '.</p>' +
        (top.length ? '<div class="pd-list">' + top.map(function(x, i){ return pvrow(x, i, pp); }).join("") + '</div>' : '<div class="empty">조건에 맞는 펀드가 없어요.</div>')) +
        (bot.length ? '<details class="card cpx-d"><summary>📉 ' + PVN[pp] + ' 가장 많이 빠진 10개</summary><div class="pd-list">' + bot.map(function(x, i){ return pvrow(x, i, pp); }).join("") + '</div></details>' : '') +
        (function(){ var tr = by(it.filter(function(x){ return x.tr && (x.amt || 0) >= 10 && x.nav > 0; }), pp); return tr.length ? '<details class="card cpx-d"><summary>⚠️ 후순위·손익차등형 ' + tr.length + '개 <span class="mut">레버리지 — 따로</span></summary><p class="note" style="margin:0 0 8px">「손익차등형」은 1종(선순위)이 먼저 손실을 막아 주고 2종(후순위)이 나머지 손익을 몇 배로 떠안는 구조라 등락이 큽니다.</p><div class="pd-list">' + tr.slice(0, 10).map(function(x, i){ return pvrow(x, i, pp); }).join("") + '</div></details>' : ""; })();
    }
    if (k === "mir"){
      var pv = by(F.filter(function(x){ return x.pv; }));
      return card("🟠 미래에셋에서 살 수 있는 사모펀드 <span class='mut'>사모투자재간접형 · " + PN[per] + "</span>",
        seg("pdper", PERS, per) +
        '<p class="note" style="margin:0 0 10px">미래에셋증권이 일반 고객에게 파는 <b>사모투자재간접형</b> 공모펀드 — 안에 사모(헤지)펀드를 여러 개 담아요. 500만원부터, 일반 계좌로. 직접 사모펀드 가입은 영업점·PB 상담(최소 3억·전문투자자 요건).</p>' +
        (pv.length ? '<div class="pd-list">' + pv.map(function(x, i){ return frow(x, i, per); }).join("") + '</div>' : '<div class="empty">이 기간 수익률이 있는 펀드가 없어요.</div>'));
    }
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

  /* ───────── 🎯 ELS ───────── */
  function dday(d){ if (!d) return ""; var n = Math.round((new Date(d + "T23:59:59+09:00") - Date.now()) / 864e5); return n < 0 ? "마감" : n === 0 ? "오늘 마감" : "D-" + n; }
  function elsRow(x, done){
    var t = x.t, pp = (x.pp || 0) >= 100;
    return '<div class="pd-it pd-e pd-tap"' + reg("els", x) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.n) + '</b><small><span class="chip2 ' + (pp ? "cool" : "hot") + '">' + e(t) + (pp ? " · 원금지급" : " · 원금 비보장") + '</span>' + (x.hi ? '<span class="chip2">고난도</span>' : '') + (x.monthly ? '<span class="chip2">월지급</span>' : '') + (x.dl_e ? '<span class="chip2">숙려 ' + e(md(x.dl_e)) + '까지</span>' : '') + '</small></div>' +
      '<div class="pd-v"><b class="up">' + pc(x.cpn) + '</b><small>연 수익률(세전)</small></div></div>' +
      '<div class="pd-row"><span>기초자산 <b>' + e(x.ua || "–") + '</b></span></div>' +
      '<div class="pd-row"><span>구조 <b>' + e(x.kind || "") + '</b> ' + e(x.desc || "") + '</span></div>' +
      '<div class="pd-row"><span>만기 <b>' + e(x.mat || "–") + '</b> · ' + e(x.cyc || "") + '마다 상환 기회</span><span>최대 손실 <b class="' + ((x.loss || 0) < 0 ? "dn" : "") + '">' + (x.loss != null ? x.loss + "%" : "–") + '</b></span>' + (x.ki ? '<span>KI <b>' + x.ki + '</b></span>' : '') + '</div>' +
      '<div class="pd-row"><span>청약 ' + e(md(x.s)) + ' ~ ' + e(md(x.e)) + (done ? '' : ' <b class="' + (/오늘|D-[12]$/.test(dday(x.e)) ? "dn" : "") + '">' + dday(x.e) + '</b>') + '</span><span>모인 돈 <b>' + fmt(x.amt) + '억</b> / 한도 ' + fmt(x.lim) + '억' + (x.cr != null ? ' (' + (x.cr * 100).toFixed(1) + '%)' : '') + '</span></div></div>';
  }
  function elsView(D){
    var L = (D.els || []).slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); }), k = SEL.els || "open";
    var pp = L.filter(function(x){ return (x.pp || 0) >= 100; }), np = L.filter(function(x){ return (x.pp || 0) < 100; });
    var ua = {}; L.forEach(function(x){ String(x.ua || "").split(/,\s*/).forEach(function(u){ if (u) ua[u] = (ua[u] || 0) + 1; }); });
    var h = '<div class="mg-kv"><div><small>지금 청약 중</small><b>' + L.length + '개</b><em>ELS ' + np.length + ' · ELB(원금지급) ' + pp.length + '</em></div><div><small>최고 연 수익률</small><b class="up">' + (L[0] ? pc(L[0].cpn) : "–") + '</b><em>' + (L[0] ? e(L[0].n) : "") + '</em></div>' +
      '<div><small>청약 마감</small><b>' + (L.length ? e(md(L.map(function(x){ return x.e; }).sort()[0])) : "–") + '</b><em>' + (L.length ? dday(L.map(function(x){ return x.e; }).sort()[0]) : "") + '</em></div><div><small>많이 쓰는 기초자산</small><b style="font-size:14px">' + Object.keys(ua).sort(function(a, b){ return ua[b] - ua[a]; }).slice(0, 3).map(e).join(", ") + '</b></div></div>';
    h += seg("pdseg", [["open", "🟢 청약 중 " + L.length], ["done", "최근 청약 완료"]], k) + '<div id="pdbody">' + elsBody(D, k) + '</div>';
    h = doc("els") + h;
    h += '<details class="card cpx-d"><summary>📘 ELS 구조 빨리 읽기</summary><p class="note" style="margin:0">「85-85-85-80-75-70, KI 45」= 6개월마다 기초자산이 처음의 85%·85%·85%·80%·75%·70% 위에 있으면 그때 수익과 함께 끝. <b>KI 45</b>는 중간에 한 번이라도 45% 아래로 떨어지면 만기 때 떨어진 만큼 손실(최대 −100%). 기초자산이 여럿이면 <b>가장 못한 것</b> 기준. ELB는 원금을 증권사가 지급(증권사 신용 위험은 남음). 「고난도」 상품은 숙려기간이 있어 청약 뒤 하루 더 생각할 시간을 줘요.</p></details>';
    return h + WARN;
  }
  function elsBody(D, k){
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
    for (var k = 0; k < 400; k++){ var d = addM(m, -freq * k); if (d <= now) break; out.unshift(d); }
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
    else if (k === "ust" || k === "aud"){
      var cur = k === "ust" ? "달러" : "호주달러", fx = o.fx || 1, n = Math.max(0.1, (new Date(o.mat) - Date.now()) / 365.25 / 864e5), yy = o.ytm / 100, c = o.cpn || 0, P = pvf(yy, n, c);
      var A_f = A / fx, face = A_f / P * 100, cpnAll = face * c / 100 * n, tax = cpnAll * 0.154, tot = face + cpnAll - tax;
      var D = dur(yy, n, c);
      h += '<p>' + (k === "ust" ? "미국 정부가 갚는 달러 채권이에요. " : "호주 정부(AAA)가 갚는 호주달러 채권이에요. ") + '표면금리 ' + pc(c, 3) + ', 지금 가격에 사면 연 <b>' + pc(o.ytm) + '</b>(' + cur + ' 기준·세전). ' + (c < 2 ? '표면금리가 낮아 이자 대신 싸게 사서(100당 약 ' + P.toFixed(1) + ') 만기에 액면을 받는 몫이 커요 — 그 차익은 비과세라 세금 면에서 좋아요. ' : '') +
        (n >= 8 ? '만기가 ' + n.toFixed(1) + '년 남아 금리가 1%p 내리면 값이 약 ' + D.toFixed(0) + '% 오르고, 오르면 그만큼 빠져요(금리 하락에 거는 투자). ' : '만기가 ' + n.toFixed(1) + '년으로 짧아 금리보다 환율이 수익을 좌우해요. ') + '환차익은 비과세, 이자는 15.4%.</p>';
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
      h += '<p>' + (pp ? '<b>원금지급형(ELB)</b> — 조건이 안 맞아도 원금은 미래에셋증권이 줘요(증권사 신용 위험만). ' : '<b>원금 비보장</b> — ') + '기초자산 <b>' + e(o.ua) + '</b>' + (String(o.ua || "").split(",").length > 1 ? '(여럿이면 가장 못한 것 기준)' : '') + ', 「' + e(o.desc) + '」. ' + (o.ki ? 'KI ' + o.ki + ': 3년 중 한 번이라도 처음의 ' + o.ki + '% 아래로 가면 만기 때 떨어진 만큼 손실. ' : '') + (o.monthly ? '매달 이자를 주는 월지급식. ' : '') + (o.hi ? '고난도 상품이라 청약 뒤 숙려기간에 취소할 수 있어요.' : '') + '</p>';
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
    return h;
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

  /* ───────── 공통 ───────── */
  var VIEW = {bond: bondView, fund: fundView, els: elsView}, BODY = {bond: bondBody, fund: fundBody, els: elsBody};
  window.prodView = function(key){ return '<div id="pdroot" data-k="' + key + '"><div class="loading">미래에셋 상품 자료 불러오는 중…</div></div>'; };
  window.prodInit = function(key){
    P().then(function(D){
      var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== key) return;
      root.innerHTML = (D.errors && D.errors.length ? '<p class="note" style="margin:0 0 8px">⚠️ 일부 자료를 못 받았어요: ' + e(D.errors.join(" · ").slice(0, 200)) + ' — 지난 값을 보여 줘요.</p>' : '') + VIEW[key](D);
      var redraw = function(){ var b = document.getElementById("pdbody"); if (!b) return; var y = b.getBoundingClientRect().top; b.innerHTML = BODY[key](D, SEL[key]); holdAt("#pdbody", y); bindInner(); };
      var bindInner = function(){
        bindSeg("pdper", function(k){ PER = k; keep(); redraw(); });
        bindSeg("pdpvper", function(k){ SEL.pvper = k; keep(); redraw(); });
        bindSeg("pdpvt", function(k){ SEL.pvt = k; keep(); redraw(); });
        var q = document.getElementById("pdq"); if (q){ var t; q.oninput = function(){ clearTimeout(t); t = setTimeout(function(){ SEL.pvq = q.value; keep(); var y = q.getBoundingClientRect().top; redraw(); var n = document.getElementById("pdq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); holdAt("#pdq", y); } }, 350); }; }
      };
      bindSeg("pdseg", function(k){ SEL[key] = k; keep(); redraw(); });
      bindInner();
      root.addEventListener("click", function(ev){
        var amt = ev.target.closest && ev.target.closest("[data-amt]");
        if (amt){ ev.stopPropagation(); AMT = +amt.dataset.amt; try { localStorage.setItem("prodamt", AMT); } catch(z) {}
          var row = amt.closest(".pd-tap"), pnl = row && row.querySelector(":scope > .pd-x"); if (pnl){ var y = row.getBoundingClientRect().top; pnl.innerHTML = xpanel(OBJ[row.dataset.x]); fillHold(pnl); holdAt('[data-x="' + row.dataset.x + '"]', y); } return; }
        if (ev.target.closest("a[href]")) return;
        var row = ev.target.closest && ev.target.closest(".pd-tap"); if (!row || !OBJ[row.dataset.x]) return;
        var pnl = row.querySelector(":scope > .pd-x");
        if (pnl){ pnl.remove(); row.classList.remove("on"); return; }
        pnl = document.createElement("div"); pnl.className = "pd-x no-clp"; setTimeout(function(){ fillHold(pnl); }, 0); pnl.innerHTML = xpanel(OBJ[row.dataset.x]); row.appendChild(pnl); row.classList.add("on");
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
    ".pd-e .chip2{margin:4px 4px 0 0}.pd-nt{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none;font-size:13px;line-height:1.45}.pd-nt .mut{flex:none;width:78px}" +
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
    ".pd-q{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:9px 12px;font:inherit;font-size:14px;margin:0 0 10px}";
  document.head.appendChild(css);
})();
