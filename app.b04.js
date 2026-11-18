/* 📦 app.b04.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 4/7 (simple.js … port_design.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
/* ======== simple.js ======== */
/* CH Investing — 보기 단순하게 (10/6)
   탭마다 핵심 카드만 바로 보여주고, 나머지 카드는 맨 아래 「📂 더 보기」에 제목 한 줄씩 모은다.
   한 줄을 누르면 그 카드가 아래에서 올라오는 화면(#sheet)으로 열린다. ← 뒤로 / ✕ 로 닫으면 제자리로 돌아간다.
   종목 카드의 이름을 누르면 종목리포트로 간다. */
(function(){
  // 탭별로 바로 보여줄 카드 (제목에 이 말이 들어가면). 제목 없는 카드(킥·미국장 등)는 항상 보임.
  var KEEP = {
    market: /오늘 할 일|자산 배분|오늘의 판단/,
    whale:  /TOP 10|오늘의 신호|함께 든 종목/,
    cup:    /오늘 컵 지도|나라별|많이 나온 섹터|돌파 임박/,
    gap:    /오늘 갭 지도|나라별|많이 나온 섹터/,
    sector: /국면 신호판|장중 나침반|5개 시장 한눈에|대표 지수|포트 비교 지수|섹터 등락/,
    accum:  /거래량 이상 종목|박스 돌파/,
    danta:  /전광판|날짜별 성적/,
    alarm:  /내 알림|처음 한 번만|알림 기록/
  };
  var T = null, OPEN = null;
  // 🧭 나침반: 상위(묶음) → 하위(카드). 묶음마다 대표 카드 하나만 펼쳐 두고, 나머지는 묶음 머리의 칩으로 (누르면 아래에서 열림)
  var GROUPS = [
    {k: "reg",  ic: "🧭", t: "지금 시장은 어느 국면?", s: "큰 그림 · 경기·타이밍·공포탐욕",
     main: /국면 신호판/, sub: /국면 전환 예보|국면 기록|공포·탐욕 지수|체감 온도|제일 강할까/},
    {k: "live", ic: "⚡", t: "오늘 장 흐름", s: "5개 시장 실시간 · 서로 어떻게 따라가나",
     main: /장중 나침반/, sub: /5개 시장 한눈에|세계 시장 하루 흐름|누가 누구를 따라가나|미국 → 한국 연결고리/},
    {k: "ix",   ic: "📈", t: "지수 · 시장 폭", s: "대표 지수 · 오른 종목 vs 내린 종목 · 신고가",
     main: /대표 지수|포트 비교 지수/, sub: /오늘 오른 종목 · 내린 종목|상승 − 하락 종목 수 흐름|신고가 vs 신저가|52주 신고가/},
    {k: "watch", ic: "🎯", t: "오늘 볼 업종·종목", s: "고른 나라 기준 · 업종 3곳과 대장주",
     main: /오늘 이 업종·종목을 보자/, sub: /^$/},
    {k: "sec",  ic: "🏭", t: "섹터 · 업종", s: "돈이 어디로 가나 · 강한 업종 · 대형주",
     main: /^섹터 등락/, sub: /오늘 강한 업종|약한 업종|많이 오른 대형주|섹터 로테이션|섹터 히트맵|섹터 흐름 되감기|환율·금리에 민감/},
    {k: "brf",  ic: "☀️", t: "아침 섹터 브리핑", s: "오늘 볼 섹터 · 간밤 글로벌",
     main: /모닝 섹터 브리핑/, sub: /간밤 글로벌|전일 섹터 등락/}
  ];
  function groupOf(t){ for (var i = 0; i < GROUPS.length; i++){ if (GROUPS[i].main.test(t)) return {g: GROUPS[i], main: true}; if (GROUPS[i].sub.test(t)) return {g: GROUPS[i], main: false}; } return null; }

  function titleOf(c){
    var h = c.querySelector(":scope > h3") || c.querySelector(":scope > summary");
    if (!h) return null;
    var main = h.cloneNode(true), sub = "";
    var m = main.querySelector(".mut"); if (m){ sub = m.textContent.trim(); m.remove(); }
    [].forEach.call(main.querySelectorAll("button,a.btn,select,input"), function(x){ x.remove(); });
    var t = main.textContent.replace(/\s+/g, " ").trim();
    return t ? {t: t, sub: sub} : null;
  }

  function drawer(body){
    var d = document.getElementById("xs-more");
    if (!d || !body.contains(d)){
      d = document.createElement("section"); d.id = "xs-more"; d.className = "card xs-more";
      d.innerHTML = '<h3>📂 더 보기 <span class="mut" id="xs-n"></span></h3><div class="xs-list"></div>';
      body.appendChild(d);
    } else if (d !== body.lastElementChild){ body.appendChild(d); }   // 늘 맨 아래
    return d;
  }

  function scan(){
    T = null;
    var body = document.getElementById("body") || document.getElementById("main"); if (!body || !cur) return;
    var re = KEEP[cur]; if (!re) return;
    var cards = body.querySelectorAll("section.card, details.card");
    var d = null;
    if (cur === "sector"){ groupScan(body, cards); return; }
    [].forEach.call(cards, function(c){
      if (c.dataset.xs || c.id === "xs-more" || c.closest("#xs-more")) return;
      if (c.parentElement && c.parentElement.closest(".card")) { c.dataset.xs = "in"; return; }   // 카드 안의 카드는 그대로
      var ti = titleOf(c);
      if (!ti || re.test(ti.t)){ c.dataset.xs = "keep"; return; }
      c.dataset.xs = "hide"; c.classList.add("xs-hid");
      d = d || drawer(body);
      var row = document.createElement("button"); row.className = "xs-row";
      row.innerHTML = '<span class="xs-t"></span><span class="xs-s mut"></span><span class="hgo">›</span>';
      row.querySelector(".xs-t").textContent = ti.t; row.querySelector(".xs-s").textContent = ti.sub;
      row.onclick = function(){ openCard(c, ti.t); };
      d.querySelector(".xs-list").appendChild(row);
    });
    var dd = document.getElementById("xs-more");
    if (dd){ drawer(body); var n = dd.querySelectorAll(".xs-row").length; dd.querySelector("#xs-n").textContent = n + "개 · 누르면 열려요"; fold(dd); }
  }
  // 📂 더 보기 줄이 많으면 처음엔 5개만 · 「전체 n개 보기 ▾」 (10/12)
  var MORE_OPEN = {};
  function fold(dd){
    var rows = dd.querySelectorAll(".xs-row"), n = rows.length, k = cur, open = !!MORE_OPEN[k];
    var b = dd.querySelector(".xs-all");
    if (n <= 6){ if (b) b.remove(); [].forEach.call(rows, function(r){ if (r.hidden) r.hidden = false; }); return; }
    [].forEach.call(rows, function(r, i){ var v = !open && i >= 5; if (r.hidden !== v) r.hidden = v; });   // 🎨 11/04: 같은 값은 다시 안 씀(DOM 변경 폭주 → 떨림 예방)
    if (!b){ b = document.createElement("button"); b.type = "button"; b.className = "xs-all clp-btn"; dd.appendChild(b);
      b.onclick = function(){ MORE_OPEN[cur] = !MORE_OPEN[cur]; fold(dd); }; }
    else dd.appendChild(b);
    var bt = open ? "접기 ▴" : "전체 " + n + "개 보기 ▾"; if (b.textContent !== bt) b.textContent = bt;
  }

  // 나침반 묶음 만들기
  function groupScan(body, cards){
    var by = {};
    [].forEach.call(cards, function(c){
      if (c.closest("#xs-more") || c.id === "xs-more") return;
      if (c.parentElement && c.parentElement.closest(".card")) return;
      var ti = titleOf(c); if (!ti) return;
      var m = groupOf(ti.t);
      var k = m ? m.g.k : "etc";
      by[k] = by[k] || {main: null, subs: []};
      if (m && m.main && !by[k].main) by[k].main = c;
      else if (m && m.main){ c.dataset.xs = "keep"; c.classList.remove("xs-hid"); }   // 대표 카드가 둘(📈 대표 지수 + 🏁 포트 비교 지수)이면 둘 다 펼침
      else if (c.dataset.xs !== "keep" || !m) by[k].subs.push({c: c, t: ti.t, sub: ti.sub});
    });
    var n = 0;
    GROUPS.forEach(function(g){
      var o = by[g.k]; if (!o) return;
      n++;
      if (o.main && o.main.dataset.xs !== "keep"){ o.main.dataset.xs = "keep"; o.main.classList.remove("xs-hid"); }
      o.subs.forEach(function(x){ if (x.c.dataset.xs !== "hide"){ x.c.dataset.xs = "hide"; x.c.classList.add("xs-hid"); } });   // 🎨 11/04: 같은 값은 다시 안 씀
      var anchor = o.main || (o.subs[0] && o.subs[0].c); if (!anchor) return;
      var h = anchor.previousElementSibling && anchor.previousElementSibling.classList.contains("cg-h") ? anchor.previousElementSibling : null;
      [].forEach.call(body.querySelectorAll('.cg-h[data-g="' + g.k + '"]'), function(x){ if (x !== h) x.remove(); });   // 자리 바뀐 옛 머리 지우기
      var sig = o.subs.map(function(x){ return x.t; }).join("|");
      if (h && h.dataset.sig === sig){ h._subs = o.subs; return; }                    // 바뀐 게 없으면 그대로 (무한 반복 방지)
      if (!h){ h = document.createElement("div"); h.className = "cg-h"; anchor.parentNode.insertBefore(h, anchor); }
      h.dataset.g = g.k; h.dataset.sig = sig; h._subs = o.subs;
      h.innerHTML = '<div class="cg-t"><span class="cg-i">' + g.ic + '</span><div><b>' + g.t + '</b><small>' + g.s + '</small></div></div>' +
        (o.subs.length ? '<div class="cg-chips"></div>' : '');
      var box = h.querySelector(".cg-chips");
      o.subs.forEach(function(x, i){
        var b = document.createElement("button"); b.className = "cg-chip"; b.textContent = x.t.replace(/^[^\w가-힣]+/, "").slice(0, 18);
        b.onclick = function(){ var y = (h._subs || [])[i] || x; openCard(y.c, y.t); }; box.appendChild(b);
      });
    });
    // 나라 고르는 줄 위에도 머리 하나 (아래 지수·섹터는 고른 나라 기준)
    var seg = document.getElementById("cpseg");
    if (seg && !(seg.previousElementSibling && seg.previousElementSibling.classList.contains("cg-h"))){
      var hh = document.createElement("div"); hh.className = "cg-h"; hh.dataset.g = "ctry";
      hh.innerHTML = '<div class="cg-t"><span class="cg-i">🌏</span><div><b>나라 골라 자세히</b><small>아래 국면·지수·섹터는 고른 나라 기준이에요</small></div></div>';
      seg.parentNode.insertBefore(hh, seg);
    }
    // 묶음에 안 들어간 카드는 예전처럼 「더 보기」
    var etc = (by.etc || {subs: []}).subs.filter(function(x){ return x.c.dataset.xs !== "keep" && !KEEP.sector.test(x.t); });
    if (etc.length){
      var d = drawer(body);
      etc.forEach(function(x){ if (x.c.dataset.xs === "hide") return; x.c.dataset.xs = "hide"; x.c.classList.add("xs-hid");
        var row = document.createElement("button"); row.className = "xs-row";
        row.innerHTML = '<span class="xs-t"></span><span class="xs-s mut"></span><span class="hgo">›</span>';
        row.querySelector(".xs-t").textContent = x.t; row.querySelector(".xs-s").textContent = x.sub;
        row.onclick = function(){ openCard(x.c, x.t); }; d.querySelector(".xs-list").appendChild(row); });
      var dd = document.getElementById("xs-more"); dd.querySelector("#xs-n").textContent = dd.querySelectorAll(".xs-row").length + "개 · 누르면 열려요"; fold(dd);
    } else { var old = document.getElementById("xs-more"); if (old && !old.querySelector(".xs-row")) old.remove(); }
  }

  // ❓ 이 화면은 무엇을 찾나요 (컵·갭·조용한 매집)
  var HELP = {
    cup: ["☕ 컵앤핸들을 찾는 화면", [
      "<b>무엇을</b> — 오르던 종목(주도주)이 한 번 쉬면서 <b>U자·V자 그릇(컵)</b>을 만들고, 왼쪽 고점 근처까지 돌아온 뒤 살짝 눌리며 <b>손잡이</b>를 만드는 종목. 윌리엄 오닐(CAN SLIM)의 대표 매수 모양이에요.",
      "<b>어떻게 고르나</b> — 한·미·일·중·홍 전 종목 → 숫자 규칙(컵 깊이·기간·회복·상대강도) → 차트를 그림으로 그려 <b>눈으로</b> 한 번 더 걸러요. 매일 아침 새로.",
      "<b>사는 자리</b> — 손잡이 위 <b>기준가(왼쪽 고점, 점선)</b>를 큰 거래량으로 뚫을 때. 카드의 「기준가까지 %」가 0 근처면 임박, 이미 +5% 넘게 달아났으면 추격 주의.",
      "<b>보는 법</b> — 위 <b>지도(나라×섹터)</b> 숫자를 누르면 그 종목만. 차트의 파란 음영 = 컵, 노란 음영 = 손잡이. 이름을 누르면 종목리포트."]],
    gap: ["📈 갭 돌파를 찾는 화면", [
      "<b>무엇을</b> — 몇 주~몇 달 <b>옆으로 기던 박스(성곽)</b>를 어느 날 시가부터 <b>빈칸(갭)</b>을 내며 뛰어넘은 종목. 큰 거래량이 같이 터지면 기관·큰손이 들어온 신호예요.",
      "<b>어떻게 고르나</b> — 갭 전 횡보 4주 이상 · 시가가 박스 고점 위 · 거래량 1.5배 이상 · 지금도 박스 위에 있는 것. 그다음 그림으로 눈 검사.",
      "<b>사는 자리</b> — 갭 시가 위에서 버티는 동안. 박스 안으로 다시 들어오면(갭 메움) 실패. 갭 시가보다 +15% 넘게 오른 건 추격 금지.",
      "<b>보는 법</b> — 위 <b>갭 지도</b> 숫자·막대를 누르면 그 종목만. 🎯 갭 크기×거래량 그림에서 오른쪽 위일수록 힘이 센 갭."]],
    accum: ["🤫 거래량 이상 종목 (참고용)", [
      "<b>무엇을</b> — <b>가격은 거의 제자리</b>인데 최근 한 달 <b>거래량이 그 전 석 달의 3배</b> 이상으로 꾸준히 늘어난 종목. 누군가 사 모으는 흔적일 수도, 파는 흔적(분배)일 수도 있어요.",
      "<b>성적</b> — 2012년부터 5개 시장에서 다시 돌려 보니 지수도, 같은 시장 아무 종목도 못 이겼어요(40일 초과수익 2012~19년 −1.9% · 2020년~ −2.2%). 점수·「강한 매집」·박스 돌파 확인도 나아지지 않았어요.",
      "<b>쓰는 법</b> — <b>매수 신호가 아니에요.</b> 이미 관심 있는 종목에 거래량이 몰리는지 확인하는 참고로만. 킥 포트 후보에서도 뺐어요(10/12).",
      "<b>보는 법</b> — 막대·카드 이름을 누르면 종목리포트."]]
  };
  HELP.whale = ["🐋 유명 펀드·투자자의 보유 종목을 보는 화면", [
      "<b>무엇을</b> — 버핏·애크먼 같은 유명 펀드·투자자 40곳(고래)이 미국 SEC에 분기마다 내는 보유 보고서(13F)를 모아, <b>무엇을 새로 사고 늘리고 팔았는지</b> 보여줘요.",
      "<b>어떻게 보나</b> — 「TOP 10」은 여러 고래가 함께 든 종목·비중이 큰 종목. 「오늘의 신호」는 새로 담거나 크게 늘린 종목. 고래 이름을 누르면 그 펀드의 포트폴리오 전체.",
      "<b>주의</b> — 13F는 분기 말 기준이고 45일 늦게 나와요. 지금도 들고 있는지는 모르니 <b>아이디어 출발점</b>으로 쓰고, 차트(컵·갭)와 함께 확인하세요.",
      "<b>보는 법</b> — 종목 이름을 누르면 종목리포트, 막대를 누르면 숫자가 나와요."]];
  HELP.danta = ["⚡ 단타(당일 급등 신호) 알람을 모은 화면", [
      "<b>무엇을</b> — 장중에 <b>거래량이 갑자기 터지면서 가격이 뛰는 종목</b>을 스크리너가 실시간으로 잡아 텔레그램·앱으로 알린 기록이에요. 같은 알람이 이 화면에 바로 쌓여요.",
      "<b>전광판</b> — 오늘 알람 종목과 알람 뒤 지금까지 몇 % 움직였는지. 「날짜별 성적」은 그날 알람이 난 종목들이 지금까지 평균 몇 % 벌었는지(날짜별 막대).",
      "<b>쓰는 법</b> — 알람은 <b>출발 신호</b>일 뿐이에요. 거래대금이 크고, 알람 뒤 눌림에서 버티는 종목만 보세요. 손절 자리를 먼저 정하고 들어가는 게 원칙.",
      "<b>보는 법</b> — 종목 이름을 누르면 종목리포트. 잘 맞는 시간대·업종 통계도 아래 「더 보기」에 있어요."]];
  function addHelp(){
    if (document.documentElement.hasAttribute("data-wow")) return;   // 🎨 11/04: 칩 줄 다이어트 — 제목·조이 얼굴이 같은 설명을 엶
    var h = HELP[cur]; if (!h) return;
    var body = document.getElementById("body"); if (!body || body.querySelector(":scope > .xp-card, :scope > .xp-mini")) return;
    var d = document.createElement("details"); d.className = "xp-mini no-clp"; d.dataset.xs = "keep";
    d.innerHTML = '<summary>ⓘ 이 화면은? <span>' + h[0] + '</span></summary><div class="xp-in">' + h[1].map(function(x){ return '<p>' + x + '</p>'; }).join("") + '</div>';
    body.insertBefore(d, body.firstChild);
  }

  function openCard(c, t){
    if (window.closeSheet && document.getElementById("sheet")) closeSheet();
    var ph = document.createComment("xs"); if (c.parentNode) c.parentNode.insertBefore(ph, c);   // 🔧 11/04: 화면이 다시 그려져 카드가 떨어져 나간 뒤 줄을 누르면 insertBefore 오류 → 그래도 시트로 엶
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b></b></div><div class="sh-body"></div>';
    sh.querySelector("b").textContent = t;
    document.body.appendChild(sh); document.body.classList.add("sheet-open");
    c.classList.remove("xs-hid"); sh.querySelector(".sh-body").appendChild(c);
    OPEN = {c: c, ph: ph};
    try { history.pushState({t: "xs", d: navD() + 1}, "", location.pathname + "#" + cur); } catch(e) {}
    if (window.updBack) updBack();
  }
  function restore(){
    if (!OPEN) return;
    var o = OPEN; OPEN = null;
    if (o.ph.parentNode){ o.ph.parentNode.insertBefore(o.c, o.ph); o.ph.remove(); }
    o.c.classList.add("xs-hid");
  }
  // 기존 시트 닫기에 "카드 제자리로" 끼워 넣기
  var _close = window.closeSheet;
  window.closeSheet = function(){ restore(); if (_close) _close(); };

  // 종목 카드 이름 누르면 종목리포트
  document.addEventListener("click", function(ev){
    var n = ev.target.closest && ev.target.closest(".cc .nm2");
    if (!n || ev.target.closest("a,button")) return;
    var cd = n.querySelector(".cd"); if (cd && window.openOP) openOP(cd.textContent.trim());
  });

  // 종목 카드: 이름·차트·핵심 숫자·맨 아래 줄만 보이고, 나머지(뉴스·설명·막대 등)는 「자세히 ▾」로
  function slimCards(){
    var main = document.getElementById("main"); if (!main) return;
    [].forEach.call(main.querySelectorAll(".cc"), function(cc){
      var tg = cc.querySelector(":scope > .xs-tg");
      var extra = [].filter.call(cc.children, function(x){ return x !== cc.firstElementChild && x !== cc.lastElementChild && !x.matches(".sp-box,.st4,.xs-tg"); });
      if (!extra.length){ if (tg) tg.remove(); return; }
      if (!tg){
        tg = document.createElement("button"); tg.className = "xs-tg"; tg.textContent = "자세히 ▾";
        tg.onclick = function(ev){ ev.stopPropagation(); var o = cc.classList.toggle("xs-open"); tg.textContent = o ? "접기 ▴" : "자세히 ▾"; };
        cc.insertBefore(tg, cc.lastElementChild);
      } else if (tg.nextElementSibling !== cc.lastElementChild){ cc.insertBefore(tg, cc.lastElementChild); }
    });
  }

  // 너무 긴 카드(휴대폰 한 화면 넘게)는 앞부분만 보이고 「전체 보기 ▾」
  function clampLong(){
    var main = document.getElementById("main"); if (!main) return;
    [].forEach.call(main.querySelectorAll("section.card"), function(c){
      if (c.dataset.xc || c.classList.contains("ixc-card") || c.closest("#pobody") || (c.classList.contains("br") && cur !== "feed") || c.classList.contains("pu-main") || c.classList.contains("pl") || c.classList.contains("pu-list") || c.classList.contains("xs-hid") || c.closest("#sheet") || c.id === "xs-more" || c.parentElement.closest(".card")) return;
      if (c.querySelector(".rb-x")) return;                     // 국면 신호판: 점수 설명을 펼친 카드는 자르지 않음
      if (c.offsetHeight < (window.cur === "home" ? 520 : 900)) return;   // 🔍 11/05 C10 홈 카드는 한 화면 안
      c.dataset.xc = "1"; c.classList.add("xs-clamp");
      var b = document.createElement("button"); b.className = "xs-cl"; b.textContent = "전체 보기 ▾";
      // 10/19 사용자 「전체보기를 눌렀는데 이상한 데로 가니」 — 카드 전체가 누르면 다른 탭으로 가는 카드(data-goto)일 때 이 단추 클릭이 카드로 번져 탭이 바뀌었음
      b.onclick = function(ev){ if (ev){ ev.preventDefault(); ev.stopPropagation(); } var o = c.classList.toggle("xs-clamp"); b.textContent = o ? "전체 보기 ▾" : "접기 ▴"; if (o) c.scrollIntoView({block: "start", behavior: "smooth"}); };
      c.appendChild(b);
    });
  }

  function watch(){
    var main = document.getElementById("main"); if (!main) return setTimeout(watch, 200);
    new MutationObserver(function(){ if (!T) T = setTimeout(function(){ addHelp(); scan(); slimCards(); setTimeout(clampLong, 400); }, 120); }).observe(main, {childList: true, subtree: true});
  }
  watch();
})();
;
/* ======== pdfx.js ======== */
/* CH Investing — 화면 그대로 PDF (10/6)
   예전: 리포트 전체를 큰 캔버스 한 장으로 그림 → 아이폰 캔버스 한도에 걸려 그림(주가·매출)이 빠지고 카드가 잘림.
   지금: ① 화면을 몰래 복제해 SVG 차트는 다 그려진 PNG로, 외부 사진·로고는 중계 서버(wsrv.nl)로 받아 그림 데이터로 바꾸고
         ② 카드(섹션)를 한 장씩 작은 캔버스로 찍어 ③ PDF 쪽에 차례로 붙인다. 카드가 쪽 경계에서 잘리지 않는다. */
(function(){
  var PW = 114, PH = 203, M = 4;
  // 아이폰 사파리: 캔버스 메모리 한도가 작아 한 번에 많이 그리면 실패 → 작게 찍고, 쓴 캔버스는 바로 비우고, 한 카드가 실패해도 건너뛰고 계속
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);          // PDF 쪽 크기(mm)·여백 — 휴대폰 화면 비율
  var CPROPS = ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity",
                "font-size", "font-weight", "font-family", "font-style", "letter-spacing", "text-anchor", "dominant-baseline", "paint-order", "color"];   // 10/28 paint-order 빠지면 글자 테두리가 글자를 덮어 흰 덩어리(섹터 로테이션 지도)
  function rgb(v){ return conv(v); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function loadImg(img){
    return new Promise(function(ok){ if (img.complete && img.naturalWidth) return ok(true);
      var t = setTimeout(function(){ ok(false); }, 8000);
      img.onload = function(){ clearTimeout(t); ok(true); }; img.onerror = function(){ clearTimeout(t); ok(false); }; });
  }
  // SVG → PNG (다 그려진 뒤의 그림). 원본 SVG에서 계산된 색·굵기를 복사해 넣는다
  function svgToPng(svg, srcSvg, w){
    var r = srcSvg.getBoundingClientRect(); if (!r.width || !r.height) return Promise.resolve(null);
    var a = [srcSvg].concat([].slice.call(srcSvg.querySelectorAll("*"))), b = [svg].concat([].slice.call(svg.querySelectorAll("*")));
    a.forEach(function(n, i){ var cs = w.getComputedStyle(n), st = ""; CPROPS.forEach(function(p){ var v = cs.getPropertyValue(p); if (v) st += p + ":" + rgb(v) + ";"; }); if (b[i]) b[i].setAttribute("style", st); });
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg"); svg.setAttribute("width", r.width); svg.setAttribute("height", r.height);
    var img = new w.Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    return loadImg(img).then(function(ok){
      if (!ok) return null;
      var c = w.document.createElement("canvas"), s = 2; c.width = Math.ceil(r.width * s); c.height = Math.ceil(r.height * s);
      var g = c.getContext("2d"); g.scale(s, s); g.drawImage(img, 0, 0, r.width, r.height);
      var out = w.document.createElement("img"); out.src = c.toDataURL("image/png"); c.width = c.height = 0;   // 캔버스 메모리 바로 돌려줌(아이폰)
      out.style.cssText = "display:block;width:" + r.width + "px;height:" + r.height + "px;max-width:100%";
      return loadImg(out).then(function(){ return out; });
    });
  }
  // 외부 이미지(로고·사진) → 그림 데이터. 직접 못 받으면 중계 서버로
  function inlineImg(img, w){
    var src = img.getAttribute("src") || "";
    if (!src || /^data:/.test(src)) return Promise.resolve();
    var abs; try { abs = new URL(src, w.location.href).href; } catch(e) { return Promise.resolve(); }
    var toData = function(u){ var ac = window.AbortController ? new AbortController() : null; if (ac) setTimeout(function(){ ac.abort(); }, 5000);   // 5초 안에 안 오면 포기 (멈춤 방지)
      return fetch(u, {mode: "cors", signal: ac ? ac.signal : undefined}).then(function(r){ if (!r.ok) throw 0; return r.blob(); }).then(function(bl){
      return new Promise(function(ok){ var fr = new FileReader(); fr.onload = function(){ ok(fr.result); }; fr.readAsDataURL(bl); }); }); };
    return toData(abs).catch(function(){ return toData("https://wsrv.nl/?url=" + encodeURIComponent(abs) + "&output=png"); })
      .then(function(d){ img.src = d; return loadImg(img); })
      .catch(function(){ img.style.visibility = "hidden"; });
  }

  // 복제본 안의 색 계산값 color(srgb …)·color(display-p3 …) 등을 rgb 로 한 번만 (html2canvas 가 못 읽음 — 아이폰 사파리 「unsupported color function "color"」)
  //   10/14: 아이폰은 색이 들어가는 모든 속성(테두리·그림자·글자 장식·::before/::after 까지)에서 color() 가 나와서, 이름에 색 관련 말이 든 속성은 전부 + 앞뒤 꾸밈(가상 요소)까지 고친다
  function conv(v){
    if (!v || !/(color|lab|lch|oklab|oklch)\(/.test(v)) return v;
    v = v.replace(/color\(\s*(srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65)\s+([-\d.e]+|none)\s+([-\d.e]+|none)\s+([-\d.e]+|none)(?:\s*\/\s*([-\d.e%]+|none))?\s*\)/g, function(_, sp, r, g, b, a){
      var f = function(x){ x = x === "none" ? 0 : +x; return Math.max(0, Math.min(255, Math.round(x * 255))); };
      var al = a == null || a === "none" ? 1 : (/%$/.test(a) ? parseFloat(a) / 100 : +a);
      return "rgba(" + f(r) + "," + f(g) + "," + f(b) + "," + al + ")"; });
    return v.replace(/(oklab|oklch|lab|lch|color)\([^()]*\)/g, "rgba(128,128,128,0.5)");   // 못 바꾸는 건 회색으로 (그림이 실패하는 것보다 낫게)
  }
  var CKEYS = null;
  function fixOnce(root, w){
    var d = root.ownerDocument, css = [], n = 0;
    var keys = function(cs){ if (CKEYS) return CKEYS; CKEYS = [];
      for (var k = 0; k < cs.length; k++){ var p = cs[k]; if (/color|shadow|background|border|outline|decoration|fill|stroke|caret|column-rule|emphasis/.test(p)) CKEYS.push(p); }
      return CKEYS; };
    [root].concat([].slice.call(root.querySelectorAll("*"))).forEach(function(el){
      var cs = w.getComputedStyle(el), ks = keys(cs);
      ks.forEach(function(p){ var v = cs.getPropertyValue(p); if (v && v.indexOf("(") >= 0 && /(color|lab|lch)\(/.test(v)) el.style.setProperty(p, conv(v), "important"); });
      ["::before", "::after"].forEach(function(ps){
        var pc = w.getComputedStyle(el, ps); if (!pc || pc.content === "none" || pc.content === "normal") return;
        var rule = "";
        ks.forEach(function(p){ var v = pc.getPropertyValue(p); if (v && v.indexOf("(") >= 0 && /(color|lab|lch)\(/.test(v)) rule += p + ":" + conv(v) + " !important;"; });
        if (rule){ if (!el.dataset.pfx) el.dataset.pfx = String(++n); css.push('[data-pfx="' + el.dataset.pfx + '"]' + ps + "{" + rule + "}"); }
      });
    });
    if (css.length){ var st = d.createElement("style"); st.textContent = css.join("\n"); root.appendChild(st); }
  }
  /* w: 화면이 있는 window(iframe 이면 그 contentWindow), root: 찍을 영역, bg: 배경색 */
  window.screenPdf = function(w, root, name, bg, prog){
    var d = w.document, H2P = w.html2pdf;
    if (!H2P) return Promise.reject("html2pdf 없음");
    var width = root.getBoundingClientRect().width || 390;
    // 1) 화면 복제 (보이는 화면은 건드리지 않음)
    var host = d.createElement("div");
    host.style.cssText = "position:absolute;left:-20000px;top:0;width:" + width + "px;background:" + bg;
    var clone = root.cloneNode(true); host.appendChild(clone); d.body.appendChild(host);
    [].forEach.call(clone.querySelectorAll(".pdfbar,.pdfb,button.more,.xs-tg,.xs-cl,#xs-more,script"), function(x){ x.remove(); });
    [].forEach.call(clone.querySelectorAll(".xs-clamp"), function(x){ x.classList.remove("xs-clamp"); });   // 접어 둔 긴 카드는 PDF에선 다 펼침
    // 2) SVG → PNG, 외부 이미지 → 데이터
    var srcSvgs = root.querySelectorAll("svg"), cSvgs = clone.querySelectorAll("svg"), jobs = [];
    [].forEach.call(cSvgs, function(svg, i){ var s0 = srcSvgs[i]; if (!s0) return;
      jobs.push(svgToPng(svg, s0, w).then(function(img){ if (img && svg.parentNode) svg.parentNode.replaceChild(img, svg); })); });
    [].forEach.call(clone.querySelectorAll("img"), function(img){ jobs.push(inlineImg(img, w)); });
    return Promise.all(jobs).then(function(){ return wait(150); }).then(function(){
      // 3) 카드(섹션) 목록: 한 줄로 쌓인 맨 위 자식들. 여러 단 그리드는 그 안의 카드로 쪼갬
      var parts = [];
      (function walk(el){ [].forEach.call(el.children, function(ch){
        if (!ch.offsetHeight) return;
        var cs = w.getComputedStyle(ch);
        if (ch.children.length > 1 && ch.offsetHeight > 700 && !ch.matches(".card,section,table,svg,img,canvas,.cc,.kpi")) return walk(ch);   // 큰 묶음이면 안의 카드 단위로
        parts.push(ch); }); })(clone);
      if (!parts.length) parts = [clone];
      // 찍는 폭 = 화면 폭 그대로 (html2pdf 는 쪽 너비로 다시 배치하므로 쪽을 px 로 화면 폭과 같게)
      // 10/14: 예전엔 카드마다 문서 전체(수천 개)의 색을 다시 고쳐서 나침반이 2분 넘게 걸리고 휴대폰에선 멈춤
      //   → 색 고치기는 복제본에 한 번만, 찍을 땐 원래 화면은 건너뜀(ignoreElements)
      fixOnce(host, w);
      // 문서 바탕(html·body)의 색도 html2canvas 가 읽음 — 잠깐 rgb 로 바꿔 두고 끝나면 되돌림
      [d.documentElement, d.body].forEach(function(el){ var cs = w.getComputedStyle(el), keep = el.getAttribute("style");
        (CKEYS || []).forEach(function(p){ var v = cs.getPropertyValue(p); if (v && /(color|lab|lch)\(/.test(v)){ if (!el.__pfxKeep) el.__pfxKeep = [keep]; el.style.setProperty(p, conv(v), "important"); } }); });
      var opt = {margin: 0, jsPDF: {unit: "px", format: [width, 2000], orientation: "portrait", hotfixes: ["px_scaling"]}, html2canvas: {scale: IOS ? 1.25 : (w.devicePixelRatio > 2 ? 1.5 : 1.8), backgroundColor: bg, useCORS: true, logging: false, scrollX: 0, scrollY: 0,
                                ignoreElements: function(n){ return n.parentNode === d.body && n !== host && !(n.classList && n.classList.contains("html2pdf__overlay")) && !/^(HEAD|STYLE|LINK|SCRIPT)$/.test(n.tagName); }}};
      // 4) PDF 만들기 — 쪽 너비에 맞춰 카드를 차례로 붙이고, 남은 자리가 모자라면 새 쪽
      return H2P().set({jsPDF: {unit: "mm", format: [PW, PH], orientation: "portrait"}}).from(d.createElement("div")).toPdf().get("pdf").then(function(tmp){
        var PDF = tmp;                                     // 빈 첫 쪽이 하나 있는 jsPDF — 배경을 칠하고 그 위에 그린다
        var hx = (function(c){ var m = String(c).match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/); return m ? "#" + [m[1], m[2], m[3]].map(function(x){ return ("0" + (+x).toString(16)).slice(-2); }).join("") : c; })(bg);
        var paint = function(){ PDF.setFillColor(hx); PDF.rect(0, 0, PW, PH, "F"); };
        paint();
        var y = M, i = 0, scale = (PW - M * 2) / width, okN = 0, failN = 0, lastErr = null;    // mm per css px
        // 첫 줄: 제목
        var next = function(){
          if (i >= parts.length) return Promise.resolve();
          var el = parts[i++];
          if (prog) try { prog(i, parts.length); } catch(e) {}
          return wait(IOS ? 60 : 30).then(function(){ return H2P().set(opt).from(el).toCanvas().get("canvas"); }).then(function(cv){   // 카드 사이 숨 고르기 — 화면이 멈추지 않게
            [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); });
            if (!cv || !cv.width || !cv.height) throw new Error("빈 그림");
            var wmm = PW - M * 2, hmm = cv.height / cv.width * wmm, gap = 2.2;   // 찍힌 그림 비율 그대로
            if (hmm <= PH - M * 2){
              if (y + hmm > PH - M){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              PDF.addImage(cv.toDataURL("image/jpeg", 0.88), "JPEG", M, y, wmm, hmm); y += hmm + gap;
            } else {                                         // 한 쪽보다 긴 카드: 쪽 높이로 잘라 이어 붙임
              var pxPerMm = cv.height / hmm, off = 0;
              if (y > M + 1){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              while (off < hmm - 0.5){
                var take = Math.min(PH - M * 2, hmm - off), sc = d.createElement("canvas");
                sc.width = cv.width; sc.height = Math.ceil(take * pxPerMm);
                sc.getContext("2d").drawImage(cv, 0, Math.floor(off * pxPerMm), cv.width, sc.height, 0, 0, cv.width, sc.height);
                PDF.addImage(sc.toDataURL("image/jpeg", 0.88), "JPEG", M, y, wmm, take); off += take; y += take + gap; sc.width = sc.height = 0;
                if (off < hmm - 0.5){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              }
            }
            cv.width = cv.height = 0; okN++;
            return next();
          }).catch(function(e){ failN++; lastErr = e; [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); return next(); });
        };
        return next().then(function(){
          if (!okN) throw new Error("카드를 하나도 못 찍음 · " + (lastErr && (lastErr.message || lastErr) || ""));
          if (failN) try { console.warn("pdf: 건너뛴 카드", failN, lastErr); } catch(e) {}
          return PDF.output("blob"); });
      });
    }).finally(function(){ host.remove();
      [d.documentElement, d.body].forEach(function(el){ if (el.__pfxKeep){ var k = el.__pfxKeep[0]; if (k == null) el.removeAttribute("style"); else el.setAttribute("style", k); el.__pfxKeep = null; } });
      // 10/14: html2pdf 가 남기는 투명 덮개(html2pdf__overlay)가 화면을 덮어 「PDF 저장하기」를 못 누르던 문제 — 다 치움
      [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); });
  };

  /* 📨 10/28 「어느 화면에서든 그 화면의 대부분을 고객 한 장으로」 — 보이는 카드만 밝은 화면으로 찍어 캔버스 목록으로 (onepage.js 가 그림 머리·바닥글 틀에 끼움)
     조이(꼬마) 그림·단추·펼치기 줄은 빼고, SVG 차트는 그림으로 바꿔 찍음. */
  window.snapEls = function(els, opt){
    opt = opt || {};
    var w = window, d = document, H2P = w.html2pdf;
    if (!H2P) return Promise.reject("html2pdf 없음");
    var root = d.documentElement, oldUi = root.getAttribute("data-ui"), light = opt.light !== false;
    var cover = d.createElement("div"); cover.style.cssText = "position:fixed;inset:0;z-index:2147483646;background:rgba(10,14,22,.82);color:#fff;display:flex;align-items:center;justify-content:center;font:700 16px system-ui";
    cover.textContent = "📨 한 장 만드는 중…"; d.body.appendChild(cover);
    if (light) root.setAttribute("data-ui", "light");
    var sx = w.scrollX, sy = w.scrollY, shEl = d.getElementById("sheet"), shY = shEl ? shEl.scrollTop : 0;
    w.scrollTo(0, 0);   // html2canvas 는 스크롤만큼 어긋나 찍힘 → 덮개 뒤에서 잠깐 맨 위로
    var restore = function(){ w.scrollTo(sx, sy); if (shEl) shEl.scrollTop = shY; var sc_ = d.getElementById("snapcss"); if (sc_) sc_.remove(); if (light){ if (oldUi == null) root.removeAttribute("data-ui"); else root.setAttribute("data-ui", oldUi); } cover.remove();
      [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); };
    return wait(120).then(function(){
      var width = Math.round(els[0].getBoundingClientRect().width) || 360, bg = w.getComputedStyle(d.body).backgroundColor || "#fff";
      var host = d.createElement("div"); host.id = "snaphost"; host.style.cssText = "position:absolute;left:-20000px;top:0;width:" + width + "px;background:" + conv(bg);
      var hs = d.createElement("style"); hs.id = "snapcss";   // 조이 얼굴은 안내 스크립트가 새 카드에 다시 붙임 → 찍는 동안 통째로 숨김 (html2pdf 복제본 포함)
      hs.textContent = "#snaphost *::before,.html2pdf__container *::before{background-image:none!important}#snaphost [class*=gd-],.html2pdf__container [class*=gd-],#snaphost video,.html2pdf__container video{display:none!important}";
      d.head.appendChild(hs);
      d.body.appendChild(host);
      var clones = els.map(function(el){ var c = el.cloneNode(true); c.style.margin = "0"; c.style.maxHeight = "none"; c.style.width = width + "px"; host.appendChild(c); return {src: el, c: c}; });
      var jobs = [];
      clones.forEach(function(o){
        [].forEach.call(o.c.querySelectorAll("button,.pdfbar,.pdfb,.xs-tg,.xs-cl,script,input,select,.seg2 button:not(.on)"), function(x){ x.remove(); });
        [].forEach.call(o.c.querySelectorAll("img"), function(im){ if (/img\/(kid_|guide)/.test(im.getAttribute("src") || "")) im.remove(); });
        [].forEach.call(o.c.querySelectorAll("[class*=gd-],video,[class*=joy]"), function(x){ x.remove(); });   // 조이 얼굴(작은 동그라미)
        [].forEach.call(o.c.querySelectorAll(".td-n"), function(x){ x.classList.remove("td-n"); });
        [].forEach.call(o.c.querySelectorAll(".xs-clamp"), function(x){ x.classList.remove("xs-clamp"); });
        var ss = o.src.querySelectorAll("svg"), cs = o.c.querySelectorAll("svg");
        [].forEach.call(cs, function(svg, i){ var s0 = ss[i]; if (!s0) return; jobs.push(svgToPng(svg, s0, w).then(function(img){ if (img && svg.parentNode) svg.parentNode.replaceChild(img, svg); })); });
        [].forEach.call(o.c.querySelectorAll("img"), function(im){ jobs.push(inlineImg(im, w)); });
      });
      return Promise.all(jobs).then(function(){ return wait(120); }).then(function(){
        fixOnce(host, w);
        var o2 = {margin: 0, jsPDF: {unit: "px", format: [width, 2000], orientation: "portrait", hotfixes: ["px_scaling"]}, html2canvas: {scale: IOS ? 2 : 2.4, scrollX: 0, scrollY: 0, backgroundColor: conv(bg), useCORS: true,
          ignoreElements: function(n){ return n.parentNode === d.body && n !== host && !(n.classList && n.classList.contains("html2pdf__overlay")) && !/^(HEAD|STYLE|LINK|SCRIPT)$/.test(n.tagName); }}};
        var out = [], i = 0;
        var next = function(){ if (i >= clones.length) return Promise.resolve(out); var el = clones[i++].c;
          return H2P().set(o2).from(el).toCanvas().get("canvas").then(function(cv){ [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); if (cv && cv.width && cv.height) out.push(cv); return next(); }, function(){ return next(); }); };
        return next();
      }).then(function(out){ host.remove(); restore(); return out; }, function(e){ host.remove(); restore(); throw e; });
    }, function(e){ restore(); throw e; });
  };
})();
;
/* ======== honest.js ======== */
/* CH Investing — 🧾 정직 성적 (10/11)
   지금 숫자 옆에 「정직 계산」(다음 날 가격에 사고 · 수수료·세금·환전 비용을 뺀 값)을 나란히.
   ① ☕ 컵 · 📈 갭 탭 맨 위 한 줄: 목록 전체 20일 성적 + 킥이 고르는 돌파 + 정직 계산
   ② HON.chip / HON.tags — 🏠 홈 · 💼 포트 · 📊 성적표에서 같이 씀
   자료(edge·kick·port·home·scores)에 정직 칸이 아직 없으면 조용히 숨김 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var WHY = "다음 날 가격에 사고 수수료·세금·환전 비용을 뺀 값";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function num(v){ return v != null && v !== "" && !isNaN(v); }
  function sg(v, d){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? String(d).slice(5, 10).replace("-", "/") : ""; }
  function oosTxt(o){ return o && o.n ? "뒤 절반(" + md(o.from) + "~, 맞출 때 안 쓴 자료) " + o.n + "건 · 평균 " + sg(o.avg) + (num(o.pf) ? " · 손익비 " + o.pf : "") : ""; }

  // 「정직 +1.0% ⓘ」 칩 — 누르면 무슨 뜻인지
  function chip(v, o){
    if (!num(v)) return "";
    o = o || {};
    var tip = "<b>🧾 정직 계산</b><br>" + WHY + (o.basis ? "<br><small>" + e(o.basis) + "</small>" : "") + (o.n ? "<br>" + o.n + "건" + (num(o.pf) ? " · 손익비 " + o.pf : "") : "") + (oosTxt(o.oos) ? "<br>" + e(oosTxt(o.oos)) : "") + (o.note ? "<br><small>" + e(o.note) + "</small>" : "");
    return '<span class="hon-chip" data-tip="' + e(tip) + '">' + (o.label || "정직") + ' <b class="' + cls(v) + '">' + sg(v, o.d) + '</b> <i>ⓘ</i></span>';
  }
  // 경고 꼬리표: 손익비 1.5 미만 → 「정직 기준 미달」 · 같은 표본으로 고른 필터 → 「같은 자료로 맞춘 값」
  function tags(h){
    if (!h) return "";
    var sr = h.h_n !== undefined;   // 📊 성적표 줄(h_ 칸) — 그 줄의 n·pf 는 정직이 아닌 원래 숫자라 h_ 쪽만 봄
    var n = sr ? h.h_n : h.n, pf = sr ? h.h_pf : h.pf, ins = sr ? h.h_insample : h.insample, out = "";
    if (!n) return "";
    if (pf != null && pf < 1.5) out += '<span class="hon-tag" data-tip="' + e("정직 계산 손익비 " + pf + " — 1.5 아래면 비용·진입 지연을 견딜 만큼 강하다고 보기 어려워요") + '">⚠ 정직 기준 미달</span>';
    if (ins === true) out += '<span class="hon-tag" data-tip="' + e("이 필터를 고를 때 쓴 같은 자료로 잰 값이라 실제보다 좋아 보일 수 있어요") + '">같은 자료로 맞춘 값</span>';
    return out;
  }
  function whale(p){ return p && p.fixed ? '<span class="hon-tag" data-tip="' + e(p.why_note || "4분기 표본 · 코드에 고정된 판정") + '">4분기 표본·고정 판정</span>' : ""; }
  // 칩·꼬리표를 눌러도 카드 이동(data-goto)이 일어나지 않게 — 설명만
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest(".hon-chip,.hon-tag"); if (t){ ev.preventDefault(); ev.stopPropagation(); } }, true);

  var t5 = function(){ return Math.floor(Date.now() / 300000); };
  function edge(){ return getJSON(RAW + "edge.json?" + t5()).catch(function(){ return null; }); }
  function perf(name){ return getJSON("archive/x/" + name + "?" + ((window.M && M.updated) || "")).catch(function(){ return null; }); }
  window.HON = {chip: chip, tags: tags, whale: whale, edge: edge, WHY: WHY};

  /* ---------- ① 컵·갭 탭 맨 위 한 줄 ---------- */
  function line(kind, el){
    var box = document.createElement("div"); box.className = "hon-line"; box.style.display = "none"; el.insertBefore(box, el.firstChild);
    Promise.all([perf(kind === "cup" ? "perf_cup.json" : "perf_gap.json"), edge()]).then(function(r){
      var A = r[0] && r[0].stats && r[0].stats.all && r[0].stats.all.r20, E = r[1] && r[1][kind], parts = [];
      if (A && A.n) parts.push('목록 전체 20일 평균 <b class="' + cls(A.avg) + '">' + sg(A.avg) + '</b><span class="mut">(승률 ' + Math.round(A.win) + '%, ' + A.n + '건)</span>');
      var K = E ? (kind === "cup" ? E.brk_real_kick : (E["돌파_by_size"] || {})["4-8%"]) : null, H = E && E.honest;
      if (K && num(K.avg) || H && num(H.avg)) parts.push((kind === "cup" ? "킥이 고르는 돌파" : "킥이 고르는 갭 4~8%") + ': ' +
        (K && num(K.avg) ? '<b class="' + cls(K.avg) + '">' + sg(K.avg) + '</b>' : '') +
        (H && num(H.avg) ? ' / ' + chip(H.avg, {label: "정직", basis: H.basis, n: H.n, pf: H.pf, oos: H.oos}) + tags(H) : '') +
        (H && num(H.avg) ? ' <span class="mut">(다음 날 진입·비용 뺌)</span>' : ''));
      if (!parts.length) { box.remove(); return; }
      box.innerHTML = '📊 <b>지금까지</b> · ' + parts.join(" · ");
      box.style.display = "";
    });
  }
  ["cup", "gap"].forEach(function(k){
    var OLD = window.RENDER && RENDER[k]; if (!OLD) return;
    RENDER[k] = function(it, el){ OLD(it, el); try { line(k, el); } catch(x) { console.error(x); } };
  });
})();
;
/* ======== up10.js ======== */
/* CH Investing — 앱 업그레이드 10 (10/10 사용자: "어플 전체를 업그레이드하는 전략 열 개 … 다 진행해")
   ① 🏠 오늘 — 첫 화면 한 장 (market/home.json)
   ③ 📊 성적 — 판단 채점을 한 곳에 (market/scores.json)
   ⑤ 접히는 카드 + 바로가기 칩 (💼 포트)
   ⑥ 밝은 테마 · 글자 크기 (⚙️)
   ⑦ 종목 화면: 🐋☕📈🤫🎯🧠 신호 · 포트·킥에 들어 있나 (market/sigindex.json)
   ⑨ 알림을 누르면 그 카드로 바로 (#탭~카드id)
   ⑧ 자료는 서비스 워커가 마지막 것을 들고 있다가 느리면 그걸 먼저 (sw.js) */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; d = d == null ? 2 : d; return (v > 0 ? "+" : "") + (+v).toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? String(d).slice(5, 10).replace("-", "/") : ""; }
  function hon(v, o){ return window.HON ? HON.chip(v, o) : ""; }   // 🧾 정직 계산 칩 (honest.js · 자료 없으면 빈칸)
  function J(name){ return getJSON(RAW + name + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }   // 같은 2분 안엔 한 번만 받음 (index.html getJSON)
  var UI = {theme: "auto", fs: "auto", home: "time", mkt: "time"};   // 10/14 A15-3: fs = "auto"(아이폰 글자 크기 따라감) | 0.88~1.22   // 10/14 A9-1: home = "time"(시간대 맞춤 순서) | "fixed"(고정)
  try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); if (u.theme) UI.theme = u.theme; if (u.fs) UI.fs = u.fs === 1 ? "auto" : u.fs === 0.92 ? 0.94 : u.fs === 1.12 ? 1.1 : u.fs; if (u.home) UI.home = u.home; if (u.mkt) UI.mkt = u.mkt; } catch(x) {}
  function keepUI(){ try { localStorage.setItem("ui", JSON.stringify(UI)); } catch(x) {} }

  /* ---------- ⑥ 테마 · 글자 크기 ---------- */
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : null;
  function applyUI(){
    var t = UI.theme === "auto" ? (mq && mq.matches ? "light" : "dark") : UI.theme;
    document.documentElement.setAttribute("data-ui", t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "light" ? "#f5f6fa" : "#0b0f17");
    document.documentElement.style.setProperty("--fs", UI.fs === "auto" ? 1 : UI.fs);
    // 10/14 A15-3: zoom(카드·여백까지 다 커짐) 대신 글자만 키움 — ux1014c.js chFont 가 글자 크기 규칙만 고쳐 씀
    if (document.body) document.body.style.zoom = "";
    if (window.chFont) window.chFont(UI.fs);
  }
  if (mq && mq.addEventListener) mq.addEventListener("change", applyUI);
  applyUI();
  function settings(){
    var old = document.getElementById("uiset"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "uiset";
    var row = function(lab, key, opts){ return '<div class="us-r"><span>' + lab + '</span><div class="us-seg">' + opts.map(function(o){
      return '<button data-k="' + key + '" data-v="' + o[0] + '" class="' + (String(UI[key]) === String(o[0]) ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div></div>'; };
    d.innerHTML = '<b>⚙️ 보기 설정</b>' + row("화면", "theme", [["auto", "자동"], ["dark", "🌙 어둡게"], ["light", "☀️ 밝게"]]) +
      row("글자", "fs", [["auto", "📱 자동"], [1, "보통"], [1.12, "크게"], [1.25, "아주 크게"]]) +
      row("🌐 시황 순서", "mkt", [["time", "🕘 시간대"], ["fixed", "고정"]]) +
      '<small>글자 「📱 자동」 = 아이폰 설정 › 디스플레이 › 텍스트 크기를 따라가요(가 다섯 개 = 아주 작게 ~ 아주 크게, 카드 모양은 그대로). 화면 자동 = 휴대폰 설정(다크 모드)을 따라가요. 시황 「시간대」 = 아침·장중·저녁·밤마다 지금 볼 카드를 맨 위로.</small>' +
      '<div class="us-ver">앱 버전 v' + e(window.APPV || "") + (window.M && M.updated ? ' · 자료 목록 ' + e(String(M.updated).slice(5)) : '') + '</div>' +
      '<div class="us-go"><button data-gloss="1">📖 용어 풀이</button><button data-go="score">📊 성적표</button><button data-go="alarm">🔔 알림 켜기·끄기</button><button data-go="idea">💬 의견함</button><button data-go="onepager">📄 종목리포트</button></div>';
    document.body.appendChild(d);
    [].forEach.call(d.querySelectorAll("[data-go]"), function(b){ b.onclick = function(){ d.remove(); go(b.dataset.go); }; });
    [].forEach.call(d.querySelectorAll("button[data-k]"), function(b){ b.onclick = function(){ var k = b.dataset.k, v = b.dataset.v; UI[k] = k === "fs" && v !== "auto" ? +v : v; keepUI(); applyUI(); d.remove(); settings();
      if (k === "home" && window.cur === "home" && window.homeInit) homeInit(); if (k === "mkt" && window.cur === "market") go("market", window.curDate); }; });
    setTimeout(function(){ document.addEventListener("click", function off(ev){ if (!d.contains(ev.target) && ev.target.id !== "uibtn"){ d.remove(); document.removeEventListener("click", off); } }); }, 0);
  }
  function addBtn(){
    var top = document.querySelector("header .top"); if (!top || document.getElementById("uibtn")) return;
    var b = document.createElement("button"); b.id = "uibtn"; b.textContent = "⚙️"; b.setAttribute("aria-label", "보기 설정"); b.onclick = settings;
    top.appendChild(b);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function(){ addBtn(); applyUI(); }) : (addBtn(), applyUI());

  /* ---------- ⑨ 알림·링크에서 바로 그 카드로: #port~pokick ---------- */
  window.goTo = function(tab, anchor){
    if (typeof go === "function" && cur !== tab) go(tab);
    if (!anchor) return;
    var t0 = Date.now();
    (function find(){
      var el = document.getElementById(anchor);
      if (el){ if (window.unclamp) unclamp(el); var f = el.closest(".fold"); if (f && !f.classList.contains("open")) f.classList.add("open");
        if (el.classList.contains("xs-hid") && window.closeSheet){ /* 「더 보기」로 숨은 카드면 그대로 펼쳐 보이기 */ el.classList.remove("xs-hid"); }
        setTimeout(function(){ var hd = document.querySelector("header"), jb = document.querySelector(".fold-jump");
          var y = el.getBoundingClientRect().top + window.scrollY - ((hd ? hd.offsetHeight : 0) + (jb ? jb.offsetHeight : 0) + 8);
          window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); el.classList.add("flash"); setTimeout(function(){ el.classList.remove("flash"); }, 1800); }, 80); return; }
      // ⚡ 킥 카드는 포트 탭이 「킥 포트」일 때만 있으니, 없으면 킥 포트로 바꿔서 다시 찾기
      if (anchor === "pokick" && Date.now() - t0 > 400 && !find.sw){ var kb = document.querySelector('#pobody [data-pf="kick"]'); if (kb){ find.sw = 1; kb.click(); } }
      if (Date.now() - t0 < 8000) setTimeout(find, 150);
    })();
  };
  function deep(){
    var h = (location.hash || "").slice(1); if (h.indexOf("~") < 0) return;
    var p = h.split("~"); setTimeout(function(){ goTo(p[0], p[1]); }, 50);
  }
  window.addEventListener("hashchange", deep);
  window.addEventListener("load", function(){ setTimeout(deep, 400); });
  // 화면 연동 (10/10 사용자: "뭐든지 누르면 화면 연동 잘 되게") — 어디서든 ① 종목 이름(data-op) → 그 종목 화면 ② 줄·칩·카드(data-goto) → 그 탭의 그 카드
  document.addEventListener("click", function(ev){
    if (ev.defaultPrevented || !ev.target.closest) return;            // 다른 화면이 이미 처리한 클릭
    var op = ev.target.closest("[data-op]");
    if (op && window.openOP){ ev.preventDefault(); ev.stopPropagation(); openOP(op.getAttribute("data-op")); return; }
    var t = ev.target.closest("[data-goto]"); if (!t) return;
    // 10/19: 카드 안의 단추·링크(접기·펼치기·전체 보기 등)를 누르면 카드 전체 이동(data-goto)을 하지 않음
    var ctl = ev.target.closest("button,a,summary,input,select,label,.fold"); if (ctl && !ctl.hasAttribute("data-goto") && t !== ctl && t.contains(ctl)) return;
    ev.preventDefault(); var p = t.getAttribute("data-goto").split("~"); goTo(p[0], p[1]);
  });

  /* ---------- ① 🏠 오늘 ---------- */
  window.homeView = function(){ return '<div id="hmbody"><div class="loading">오늘 할 일 모으는 중…</div></div>'; };
  window.homeInit = function(){
    Promise.all([J("home.json"), J("sigindex.json").catch(function(){ return null; })]).then(function(a){ SIG = a[1] && a[1].ix; drawHome(a[0]); })
      .catch(function(){ var b = document.getElementById("hmbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">🏠</div>오늘 요약이 아직 안 올라왔어요.<br>매시간 자동으로 만들어져요.</div>'; });
  };
  function card(go, ic, t, sub, body, goLab){
    return '<section class="card hm-c" data-goto="' + go + '"><div class="hm-h"><span class="hm-i">' + ic + '</span><div><b>' + t + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><span class="hm-go">' + (goLab || "열기") + ' ›</span></div>' + body + '</section>';
  }
  /* ---------- 🗳 A9-5 「🔮 예고에 내 표 던지기」 — 표는 이 휴대폰 안(localStorage)에만 ---------- */
  var VOTE = {}, VH = {};
  try { VOTE = JSON.parse(localStorage.getItem("hvote") || "{}") || {}; VH = JSON.parse(localStorage.getItem("hvote_hist") || "{}") || {}; } catch(x) {}
  function keepVote(){ try { localStorage.setItem("hvote", JSON.stringify(VOTE)); localStorage.setItem("hvote_hist", JSON.stringify(VH)); } catch(x) {} }
  function prevKey(G){   // 어제 예고의 날짜: home.json 이 주면 그것, 없으면 표가 있는 날 중 채점일보다 앞선 가장 최근
    if (G.prev) return G.prev;
    var ks = Object.keys(VOTE).filter(function(k){ return !G.date || k < G.date; }).sort();
    return ks.length ? ks[ks.length - 1] : null;
  }
  function gradeVotes(G){   // 채점 카드 한 줄 — 앱 ✓✗ 와 내 ✓✗ 나란히 · 누적은 날짜당 한 번만 셈
    var pk = prevKey(G), mine = pk && VOTE[pk] || {}, out = {rows: [], me_ok: 0, me_n: 0, app_ok: 0, app_n: 0};
    (G.items || []).forEach(function(x, i){
      var v = mine[String(i + 1)], scored = x.cls === "ok" || x.cls === "no";
      if (scored){ out.app_n++; if (x.cls === "ok") out.app_ok++; }
      var r = null;
      if (v && scored){ r = (v > 0) === (x.cls === "ok"); out.me_n++; if (r) out.me_ok++; }
      out.rows.push({v: v, r: r});
    });
    if (G.date && out.app_n && !VH[G.date]){ VH[G.date] = {app_ok: out.app_ok, app_n: out.app_n, me_ok: out.me_ok, me_n: out.me_n}; keepVote(); }
    var T = {app_ok: 0, app_n: 0, me_ok: 0, me_n: 0};
    Object.keys(VH).forEach(function(k){ var h = VH[k]; T.app_ok += h.app_ok || 0; T.app_n += h.app_n || 0; T.me_ok += h.me_ok || 0; T.me_n += h.me_n || 0; });
    out.tot = T;
    return out;
  }
  function voteBtns(date, i){
    var v = (VOTE[date] || {})[String(i)];
    return '<span class="hm-vt"><button data-vote="' + e(date) + '|' + i + '|1" class="' + (v > 0 ? "on" : "") + '" aria-label="그렇다">👍</button><button data-vote="' + e(date) + '|' + i + '|-1" class="' + (v < 0 ? "on" : "") + '" aria-label="아니다">👎</button></span>';
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-vote]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var p = t.dataset.vote.split("|"), d = p[0], i = p[1], v = +p[2];
    VOTE[d] = VOTE[d] || {};
    if (VOTE[d][i] === v) delete VOTE[d][i]; else VOTE[d][i] = v;   // 같은 걸 또 누르면 취소
    keepVote();
    var wrap = t.closest(".hm-vt"); if (wrap){ [].forEach.call(wrap.children, function(b){ b.classList.toggle("on", (VOTE[d][i] || 0) === +b.dataset.vote.split("|")[2]); }); }
    if (window.P && window.P.toast) window.P.toast(VOTE[d][i] ? (v > 0 ? "👍 그렇다 — 내일 아침 채점해요" : "👎 아니다 — 내일 아침 채점해요") : "표 취소");
  }, true);

  /* ---------- 🌅 A9-1 시간대 맞춤 홈 — 지금 볼 카드를 맨 위로 (설정 「홈 순서」로 고정 가능) ---------- */
  function edition(now){   // now = 한국 시간으로 맞춘 Date (getUTC* 로 읽음)
    var m = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (m < 6 * 60) return {k: "night", ic: "🌙", t: "밤판", order: ["port", "score", "kick", "grade", "focus", "brain"], why: "미국 장 끝 — 포트 성적부터"};
    if (m < 9 * 60) return {k: "morn", ic: "🌅", t: "아침판", order: ["grade", "kick", "port", "focus", "brain", "score"], why: "어제 결과·오늘 할 일부터"};
    if (m < 15 * 60 + 30) return {k: "day", ic: "🌞", t: "장중판", order: ["focus", "brain", "kick", "port", "grade", "score"], why: "한국 장중 — 오늘 집중·지금 생각부터"};
    if (m < 22 * 60 + 30) return {k: "eve", ic: "🌆", t: "저녁판", order: ["kick", "grade", "port", "focus", "brain", "score"], why: "미국 장 전 — 킥 할 일·🔮 예고부터"};
    return {k: "night", ic: "🌙", t: "밤판", order: ["port", "score", "kick", "grade", "focus", "brain"], why: "미국 장중 — 포트 성적부터"};
  }
  var FIXED = ["grade", "port", "kick", "focus", "brain", "score"];

  function drawHome(H){
    var b = document.getElementById("hmbody"); if (!b) return;
    var P = H.port || {}, K = H.kick || {}, D = H.danta || {}, Bn = H.brain || {}, S = H.scores || {};
    var now = new Date(Date.now() + 9 * 3600e3), wd = "일월화수목금토"[now.getUTCDay()];
    var ED = edition(now), useTime = UI.home !== "fixed";
    // 10/15 A9-3: 「08:56 기준」 글자 → ⟳ 신선도 칩(ux1015.js 가 「N분 전」·색을 채움) · 가운뎃점 대신 간격
    var h = '<div class="hm-day"><span class="hm-date">' + (now.getUTCMonth() + 1) + '/' + now.getUTCDate() + ' (' + wd + ')</span>' +
      '<span class="hm-fresh" id="hmfresh" role="button" data-at="' + e(H.at || "") + '">⟳ ' + e(String(H.at || "").slice(11, 16)) + '</span>' +
      '</div>' +
      '<div class="hm-live" id="hmlive" data-ed="' + ED.k + '" role="button" hidden></div>';   // 10/15 A9-1 🌞 장중 띠 (ux1015.js)
    // 10/13 「더 자주 열게」 ③ 어제보다 바뀐 것 · ⑦ 이번 주 복기(주말) · ⑥ 어제 예고 → 오늘 결과
    var CH = (H.chg && H.chg.items) || [];
    /* 🧹 10/21 사용자 「앱이 복잡하고 산만하다 — 다 진행해」: 홈 = 오늘 한 장(① 오늘 한 줄+볼 곳 ux1019.js · ② 내 포트 · ③ 바뀐 것 3줄) — 나머지는 각 탭·🗂 신호 › 더 보기·📊 성적표로 */
    var chgH = "";
    if (CH.length) chgH = '<section class="card hm-chg" data-strip="home"><div class="hm-h"><span class="hm-i">🆕</span><div><b>바뀐 것</b><small>' + (H.chg.since ? md(H.chg.since) + ' 이후' : '') + (CH.length > 3 ? ' · 중요한 3가지' : '') + '</small></div></div>' +
      CH.slice(0, 3).map(function(x){ return '<div class="hm-chi" data-goto="' + e(x.go || "home") + '"><span>' + e(x.ic) + '</span>' + chgBody(x) + '<i>›</i></div>'; }).join("") + '</section>';
    var Wk = H.week || {}, dw = now.getUTCDay(), wkH = "";
    if ((dw === 6 || dw === 0) && Wk.days){
      var wb = [["💼 기본", Wk.base], ["⚡ 킥", Wk.kick], ["🎯 집중", Wk.conc]].filter(function(x){ return x[1] != null; });
      var wkH = card("port", "📅", "이번 주 복기", md(Wk.from) + "부터 " + Wk.days + "거래일 (미국 날짜)",
        '<div class="hm-big">' + wb.map(function(x){ return '<div><small>' + x[0] + '</small><b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b></div>'; }).join("") + '</div>' +
        '<div class="hm-l">S&amp;P500 <b class="' + cls(Wk.spy) + '">' + sg(Wk.spy) + '</b> · 코스피 <b class="' + cls(Wk.kospi) + '">' + sg(Wk.kospi) + '</b>' +
        (Wk.rep && Wk.rep.n ? ' · 시황 예고 ✓' + Wk.rep.win + ' ✗' + Wk.rep.loss : '') +
        (Wk.kick_ev && (Wk.kick_ev.buy || Wk.kick_ev.sell) ? ' · 킥 사기 ' + Wk.kick_ev.buy + ' · 팔기 ' + Wk.kick_ev.sell : '') + '</div>' +
        ((Wk.next || []).length ? '<div class="hm-wn"><small>앞으로 볼 일정</small>' + Wk.next.map(function(x){ return '<div><b>' + e(x.when) + '</b> ' + e(x.what) + '</div>'; }).join("") + '</div>' : '') +
        '', "포트");
    }
    var C = {};
    // 💼 포트 (A9-2: 선 끝에 값 · 범례 없음)
    var ex = (P.kick || 0) - (P.spy || 0);
    var spark = (window.V && P.nav && P.nav.length > 1) ? V.lines([{name: "공격(킥)", short: "공격", color: "#ff6b6b", vals: P.kick_line}].concat((function(){ var c = (P.conc_line || []).slice(), n = (P.nav || []).length; while (c.length && c.length < n) c.unshift(0); return c.length === n ? [{name: "집중", short: "집중", color: "#4dd47a", vals: c}] : []; })()).concat([{name: "기본", short: "기본", color: "#e9c46a", vals: P.nav}, {name: "S&P", short: "S&P", color: "#7c9cff", vals: P.spy_line, dash: 1}]),
      (P.nav || []).map(function(_, i){ return i ? "" : md(P.start); }), {h: 96, unit: "%", zero: 1, nodots: 1, endLabels: 1, nolegend: 1}) : "";
    // ⚡ 공격(킥) 오늘 할 일 — 포트 카드 안 한 줄로 합침 (10/21)
    var ev = K.events || [];
    var kickLine = ev.length ? ev.map(function(x){ return '<div class="hm-ev ' + (x.k === "사기" ? "buy" : "sell") + '">' + (x.k === "사기" ? "🟢 사기" : x.k === "팔기" ? "🔴 팔기" : "🟡 절반") + ' <b data-op="' + e(x.code) + '">' + e(x.name) + ' ›</b>' + (x.r != null ? ' ' + sg(x.r, 1) : '') + (x.why ? ' <small>' + e(x.why) + '</small>' : '') + '</div>'; }).join("")
      : '<div class="hm-l mut">공격(킥) 오늘 할 일 없음 — ' + md(K.asof) + ' 마감 기준 그대로</div>';
    C.port = card("port~pohero", "💼", "내 포트", md(P.start) + "부터 · " + md(P.asof) + " 미국 종가",
      '<div class="hm-big"><div data-goto="port~pohero"><small>기본</small><b class="' + cls(P.base) + '" data-num="' + P.base + '" data-k="base">' + sg(P.base, 1) + '</b></div>' +
        '<div data-goto="port~pokick"><small>공격(킥)</small><b class="' + cls(P.kick) + '" data-num="' + P.kick + '" data-k="kick">' + sg(P.kick, 1) + '</b></div>' +
        (P.conc != null ? '<div data-goto="port~poconc"><small>집중</small><b class="' + cls(P.conc) + '" data-num="' + P.conc + '" data-k="conc">' + sg(P.conc, 1) + '</b></div>' : '') + '</div>' +
      '<div class="hm-l">S&amp;P500 <b class="' + cls(P.spy) + '">' + sg(P.spy, 1) + '</b> · <a data-goto="port~pocmp" class="hm-nw">시장 ' + P.n_bench + '곳 중 <b>' + P.beat_kick + '</b>곳 앞섬 <small>(공격)</small> ›</a></div>' +
      '<div class="hm-sp">' + spark + '</div>' +
      (P.change ? '<div class="hm-alert" data-goto="port~pofollow">🔁 ' + md(P.change.date) + ' 비중·상품 바뀜 — <b>따라하기에서 맞추기 ›</b></div>' : '') + kickLine, "포트");
    // 🎯 집중
    if ((H.focus || []).length) C.focus = card("market~mkfo", "🎯", "오늘 집중", "돈이 몰리는 테마",
      H.focus.map(function(t){ return '<div class="hm-f"><b>' + e(t.name) + '</b> <span class="hm-chip ' + (t.stage === "과열" ? "b" : "g") + '">' + e(t.stage || "") + '</span> <small>5일 ' + sg(t.r5, 1) + ' · S&P 대비 20일 ' + sg(t.rs20, 1) + 'p</small>' +
        '<div class="hm-l">' + e(t.do || "") + ((t.stars || []).length ? ' · ★ ' + t.stars.map(function(s){ return '<a data-op="' + e(s.t) + '">' + e(s.name) + '</a>'; }).join(", ") : '') + ((t.etf_kr || []).length ? ' · 🇰🇷 <a data-op="' + e(t.etf_kr[0].t) + '">' + e(t.etf_kr[0].name) + '</a>' : '') + '</div></div>'; }).join(""), "시황");
    // ⚡ 단타
    // 10/12: ⚡ 단타 카드 뺌 — 단타는 알림(앱·텔레그램)으로만
    // 🧠 두뇌
    // ⏳ 10/19 사용자 「지금 생각 시각 좀 봐라…」(10:50 에 09:35 급락 개장 문장) → 몇 분 전 생각인지 붙이고, 60분 넘으면 「그 뒤 시장」 한 줄을 장중 나침반에서 바로 채움
    var bnAge = Bn.at ? Math.round((Date.now() - Date.parse(String(Bn.at).replace(" ", "T") + ":00+09:00")) / 60000) : null;
    if (Bn.summary) C.brain = card("feed~fdbrain", "🧠", "지금 생각", (Bn.regime || "") + " · " + md(Bn.at) + " " + String(Bn.at || "").slice(11, 16) + (bnAge != null && bnAge >= 0 ? (bnAge < 60 ? " · " + bnAge + "분 전" : ' · <b class="dn">⏳ ' + (bnAge < 120 ? bnAge + "분" : Math.round(bnAge / 60) + "시간") + ' 전 생각</b>') : ""),
      (bnAge != null && bnAge >= 60 ? '<div class="hm-l" id="hmbrlive"><small class="mut">그 뒤 시장 불러오는 중…</small></div>' : '') +
      '<div class="hm-l">' + e(Bn.summary) + '</div>' + ((Bn.ideas || []).length ? '<div class="hm-chips">' + Bn.ideas.map(function(x){ var t = typeof x === "string" ? x : ((x["칸"] || x.box || "") + " " + (x["제안"] || x.idea || "")); return t.trim() ? '<span class="hm-chip" data-goto="port~poct">💡 ' + e(t) + '</span>' : ''; }).join("") + '</div>' : ''), "피드");
    // 📊 성적
    C.score = card("score", "📊", "성적 한 줄", "무엇이 이기고 지나",
      '<div class="hm-l">' + ((S.good || []).length ? '✅ ' + e(S.good.join(" · ")) : '') + ((S.bad || []).length ? '<br>❌ ' + e(S.bad.join(" · ")) : '') + (!(S.good || []).length && !(S.bad || []).length ? '표본이 쌓이는 중' : '') + '</div>', "성적표");
    h += (C.port || "") + chgH + (wkH || "") +
      '<div class="hm-more"><a data-goto="sector">🧭 나침반</a><a data-goto="sigmore">🗂 예고 채점·두뇌 논지</a><a data-goto="score">📊 성적표</a><a data-goto="feed~fdbrain">🧠 지금 생각</a><a data-gloss="1">📖 용어 풀이</a></div>';
    b.innerHTML = h;
    HSH = H;
    if (document.getElementById("hmbrlive")) getJSON("archive/x/live_kr.json?" + Math.floor(Date.now() / 120000), {ttl: 120000}).then(function(L){
      var el = document.getElementById("hmbrlive"); if (!el) return;
      var ix = L && L.index || [], ok = L && L.date === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      if (!ok || !ix.length){ el.innerHTML = '<small class="mut">⏳ 아래 생각은 ' + e(String(Bn.at).slice(11, 16)) + ' 것 — 다음 검토 때 바뀌어요</small>'; return; }
      var ss = (L.sectors || []).filter(function(x){ return x.r != null; }).sort(function(a, b2){ return b2.r - a.r; });
      el.innerHTML = '<b>⚡ 그 뒤 ' + e(L.t) + ' 지금</b> ' + ix.map(function(x){ return e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg, 2) + '</b>'; }).join(" · ") +
        (ss.length ? ' · 강한 ' + e(ss[0].name) + ' ' + sg(ss[0].r, 1) + ' · 약한 ' + e(ss[ss.length - 1].name) + ' ' + sg(ss[ss.length - 1].r, 1) : '') +
        '<br><small class="mut">아래 생각은 ' + e(String(Bn.at).slice(11, 16)) + ' 것 — 그 사이 시장이 바뀌었을 수 있어요</small>';
    }).catch(function(){});
    var edl = document.getElementById("hmed"); if (edl) edl.onclick = function(ev){ ev.stopPropagation(); if (window.P && window.P.toast) window.P.toast(ED.ic + " " + ED.t + " — " + ED.why + " · 순서는 ⚙️ 설정에서"); };
    var sb = document.getElementById("hmstory"); if (sb) sb.onclick = function(ev){ ev.stopPropagation(); if (window.hmStory) hmStory(); };
    if (window.hmAfter) try { hmAfter(H); } catch(x) { if (window.console) console.warn("hmAfter", x); }   // 10/15 A9-1·3·4 (ux1015.js)
  }
  /* 🎯 어제 예고 → 오늘 결과 — 10/21부터 홈이 아니라 🎯 신호 › 🗂 더 보기(sigmore)에 */
  function gradeCard(H){
    var G = H && H.grade; if (!G || !(G.items || []).length) return "";
      var ok = G.items.filter(function(x){ return x.cls === "ok"; }).length, no = G.items.filter(function(x){ return x.cls === "no"; }).length;
      var GV = gradeVotes(G), meTxt = GV.me_n ? ' · 나 ✓' + GV.me_ok + ' ✗' + (GV.me_n - GV.me_ok) : '';
      var tot = GV.tot, cum = (tot.me_n >= 1 && tot.app_n >= 1) ? '<div class="hm-vs"><span>🗳 나 vs 앱 적중률</span>' +
        '<div><small>나</small><i><b style="width:' + Math.round(tot.me_ok / tot.me_n * 100) + '%"></b></i><em>' + Math.round(tot.me_ok / tot.me_n * 100) + '% <span class="mut">(' + tot.me_n + '건)</span></em></div>' +
        '<div><small>앱</small><i><b style="width:' + Math.round(tot.app_ok / tot.app_n * 100) + '%"></b></i><em>' + Math.round(tot.app_ok / tot.app_n * 100) + '% <span class="mut">(' + tot.app_n + '건)</span></em></div></div>' : '';
      return card("market", "🎯", "어제 예고 → 오늘 결과", md(G.date) + " " + e(G.label || "") + " 채점 · 앱 ✓" + ok + " ✗" + no + meTxt + (G.rate != null ? ' · 누적 적중 <span data-num="' + G.rate + '" data-k="rate" data-d="0" data-u="%" data-nosign="1">' + G.rate + '%</span>' : "") + ((G.last10 || []).length ? ' <span class="hm-l10" title="최근 ' + G.last10.length + '번 채점 (왼쪽이 옛날)">' + dots(G.last10) + '</span>' : ""),
        G.items.map(function(x, i){ var r = GV.rows[i] || {};
          return '<div class="hm-gr ' + e(x.cls || "") + '"><span>' + e(x.mark || "·") + '</span><div><b>' + e(x.t) +
            (r.v ? ' <span class="hm-me ' + (r.r === true ? "ok" : r.r === false ? "no" : "") + '">나 ' + (r.v > 0 ? "👍" : "👎") + (r.r === true ? " ✓" : r.r === false ? " ✗" : "") + '</span>' : '') +
            '</b>' + trail(x.tr, true) + '<small>' + e(x.x) + '</small></div></div>'; }).join("") + cum + voices(G.voices) +
        ((G.next || []).length ? '<div class="hm-wn"><small>🔮 오늘의 예고 — 내일 아침 채점 · 👍👎 로 내 표도</small>' + G.next.map(function(x, i){
          return '<div class="hm-nx">' + (x.p != null ? '<span class="hm-pb" title="앱이 보는 확률 ' + Math.round(x.p * 100) + '%"><i style="width:' + Math.round(x.p * 100) + '%"></i><b>' + Math.round(x.p * 100) + '%</b></span>' : '') +
            '<span class="hm-nxt">' + e(x.t) + trail(x.tr, false) + '</span>' + (G.date ? voteBtns(G.date, i + 1) : '') + '</div>'; }).join("") + '</div>' : '') +
        '<button class="hm-sh" data-share="grade">📤 카톡으로 공유</button>', "시황");
  }
  window.gradeCard = gradeCard;
  window.hmEdition = edition;
  /* ---------- 🔀 10/15 A9-2 「바뀐 것」 전 → 후 두 토막 · 같은 말은 흐리게 ---------- */
  function chgBody(x){
    var a = x.a, b = x.b, lab = x.lab, note = x.note;
    if (lab && a == null) return '<div class="hm-cb"><b>' + e(lab) + '</b>' + (x.sub ? '<small class="hm-cs">' + e(x.sub) + '</small>' : '') + '</div>';
    if (a == null || b == null){   // 옛 home.json — 「 → 」 마지막 것 기준으로 나눠 봄
      var t = String(x.t || ""), i = t.lastIndexOf(" → ");
      if (i < 0) return '<b>' + e(t) + '</b>';
      lab = ""; a = t.slice(0, i); b = t.slice(i + 3);
    }
    var sp = function(v){ return String(v).split(" / "); }, A = sp(a), B = sp(b);
    var mark = function(L, O){ return L.map(function(seg){ return '<span class="' + (O.indexOf(seg) >= 0 ? "same" : "diff") + '">' + e(seg) + '</span>'; }).join('<span class="sl"> / </span>'); };
    return '<div class="hm-cb">' + (lab ? '<b>' + e(lab) + (note ? ' <small>(' + e(note) + ')</small>' : '') + '</b>' : '') +
      ('<div class="hm-ab"><span class="hm-a">' + mark(A, B) + '</span><span class="hm-to">→</span><span class="hm-b">' + mark(B, A) + '</span></div>') + '</div>';
  }
  /* ---------- 🗣 10/19 A10/19-3 「엇갈린 날, 누가 맞았나」 — 코스피를 두고 🎲 시장확률 · 🧠 두뇌 · 💭 지금 생각(열쇠 적은 날만)을 매일 종가로 채점 (home.py voices · market/voices.json) ---------- */
  function voices(V){
    if (!V || !V.today) return "";
    var W = {up: "오름", down: "내림", flat: "중립"}, tv = V.today.v || {}, keys = [["dice", "🎲 시장확률"], ["brain", "🧠 두뇌"], ["think", "💭 지금 생각"]];
    var todayTxt = function(k){ var x = tv[k]; if (!x) return '<em class="mut">' + (k === "think" ? "열쇠 없음" : "—") + '</em>'; return '<em class="' + (x.d === "up" ? "up" : x.d === "down" ? "dn" : "") + '">' + e(k === "dice" && x.t ? x.t : (W[x.d] || x.d)) + (x.p != null ? ' ' + Math.round(x.p * 100) + '%' : '') + '</em>'; };
    var ds = Object.keys(tv).map(function(k){ return tv[k].d; }), one = ds.length >= 2 && ds.every(function(d){ return d === ds[0]; });
    var r = V.today.r, rTxt = r && r.chg != null ? ' · 코스피 종가 ' + (r.chg > 0 ? "+" : "") + r.chg.toFixed(2) + '%' : (V.today.at ? ' · ' + e(V.today.at) + ' 적어 둠, 마감 뒤 채점' : '');
    var row = function(k, lab, S){ S = S || {}; var n = S.n || 0, w = S.win || 0;
      return '<div class="hm-vr"><span>' + lab + '</span>' + (k ? todayTxt(k) : '<em class="mut">' + (one ? "오늘 한목소리 " + e(W[ds[0]]) : "오늘은 엇갈림") + '</em>') +
        '<b>' + ((S.last10 || []).length ? dots(S.last10) : '') + (n ? ' ✓' + w + ' ✗' + (n - w) + (n >= 10 ? ' <i class="pc">' + Math.round(w / n * 100) + '%</i>' : '') : '<i class="mut">아직 0</i>') + '</b></div>'; };
    return '<div class="hm-vc"><small>🗣 코스피를 두고 앱의 세 목소리 — 장 시작 무렵 적어 두고 매일 종가로 채점' + rTxt + '</small>' +
      keys.map(function(z){ return row(z[0], z[1], V[z[0]]); }).join("") + row(null, "🎯 한목소리 날", V.chorus) +
      '<div class="hm-vn">오름 = 종가 + · 내림 = − · 중립 = ±0.5% 안 · 💭 는 지금 생각에 방향 열쇠를 적은 날만 · ' + (V.days || 0) + '일 채점</div></div>';
  }

  /* ---------- 🧵 10/15 A9-5 예고 실타래 — 같은 주제 최근 맞음(●)·빗나감(○) ---------- */
  function dots(L){ return (L || []).map(function(m){ var v = typeof m === "string" ? m : m.m; return '<i class="' + (v === "ok" ? "o" : "x") + '"></i>'; }).join(""); }
  function trail(tr, inGrade){
    if (!tr || !tr.length || (inGrade && tr.length < 2)) return "";
    var last = tr[tr.length - 1].m, run = 0; for (var i = tr.length - 1; i >= 0 && tr[i].m === last; i--) run++;
    var ok = tr.filter(function(x){ return x.m === "ok"; }).length;
    var lab = run >= 2 ? (last === "ok" ? run + "번 연속 맞음" : run + "번 연속 빗나감") : "최근 " + tr.length + "번 ✓" + ok + " ✗" + (tr.length - ok);
    return '<span class="hm-tr" role="button" title="같은 주제 최근 채점 — 누르면 날짜별">' + dots(tr) + '<em class="' + (run >= 2 ? (last === "ok" ? "ok" : "no") : "") + '">' + lab + '</em></span>' +
      '<span class="hm-trd" hidden>' + tr.map(function(x){ return md(x.d) + ' ' + (x.m === "ok" ? "✓" : "✗"); }).join(" · ") + ' <span class="mut">(채점한 날)</span></span>';
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest(".hm-tr"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var d = t.nextElementSibling; if (d && d.classList.contains("hm-trd")) d.hidden = !d.hidden;
  }, true);
  // ⑧ 공유: 카드 내용을 글로 만들어 휴대폰 공유창(카톡 등)으로
  var HSH = null;
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-share]"); if (!t || !HSH) return;
    ev.preventDefault(); ev.stopPropagation();
    var H = HSH, P = H.port || {}, k = t.dataset.share, txt = "", hash = "";
    if (k === "port"){ txt = "💼 CH Investing 포트 (" + md(P.start) + "부터)\n" + (P.conc != null ? "🎯 집중 " + sg(P.conc) + " · " : "") + "⚡ 킥 " + sg(P.kick) + " · 💼 기본 " + sg(P.base) + "\nS&P500 " + sg(P.spy) + " · 시장 " + P.n_bench + "곳 중 " + P.beat_kick + "곳보다 앞섬"; hash = "port"; }
    else if (k === "grade"){ var G = H.grade || {}; txt = "🎯 시황 예고 채점 (" + md(G.date) + ")\n" + (G.items || []).map(function(x){ return x.mark + " " + x.t; }).join("\n") + (G.rate != null ? "\n누적 적중 " + G.rate + "%" : "") + ((G.next || []).length ? "\n\n🔮 오늘 예고\n" + G.next.map(function(x){ return (x.p != null ? Math.round(x.p * 100) + "% " : "") + x.t; }).join("\n") : ""); hash = "market"; }
    else if (k === "week"){ var W = H.week || {}; txt = "📅 이번 주 복기 (" + md(W.from) + "부터)\n💼 기본 " + sg(W.base) + (W.kick != null ? " · ⚡ 킥 " + sg(W.kick) : "") + (W.conc != null ? " · 🎯 집중 " + sg(W.conc) : "") + "\nS&P500 " + sg(W.spy) + " · 코스피 " + sg(W.kospi); hash = "home"; }
    if (window.chShare) chShare("CH Investing", txt + "\n\n※ 투자 참고용 · 매수 추천 아님", hash);
  }, true);

  /* ---------- 🗂 10/21 신호 › 더 보기 — 「있으면 좋은 것」 한 단계 아래 (사용자: 「6번은 신호 탭 안에서 한 단계 내리는 걸로」)
     ① 어제 예고 → 오늘 결과(예고 채점 · 내 표) ② 두뇌 논지 목록 ③ 고래·컵·갭 상세 · 단타 통계 · 조용한 매집 바로가기 ---------- */
  window.sigmoreView = function(){ return '<div id="smbody"><div class="loading">모으는 중…</div></div>'; };
  window.sigmoreInit = function(){
    Promise.all([J("home.json").catch(function(){ return null; }), getJSON("https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/brain/state.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })]).then(function(a){
      var b = document.getElementById("smbody"); if (!b) return;
      var H = a[0] || {}, T = a[1] || {}; HSH = H;
      var h = gradeCard(H) || '<section class="card"><h3>🎯 예고 채점</h3><div class="empty">오늘 채점이 아직 없어요.</div></section>';
      var th = (T.theses || []).slice().sort(function(x, y){ return (y.conf || 0) - (x.conf || 0); });
      if (th.length) h += '<section class="card sm-th"><h3>🧠 두뇌 논지 <span class="mut">' + th.length + '개 · 확신 높은 순 · 매시간 점검</span></h3>' + th.map(function(x){
        var c = Math.round((x.conf || 0) * 100);
        return '<div class="sm-t"><div class="sm-tb"><b>' + e(x.t) + '</b><span class="sm-c"><i style="width:' + c + '%"></i><em>' + c + '%</em></span></div>' +
          (x.breaks ? '<small>이러면 틀림 — ' + e(x.breaks) + '</small>' : '') + (x.since ? '<small class="mut">' + md(x.since) + '부터</small>' : '') + '</div>'; }).join("") + '</section>';
      var L = [["whale", "🐋", "고래 상세", "고래별 성적·합의 매수·매도 경보 등 17가지"], ["cup", "☕", "컵 상세", "돌파 후 추적·주봉 컵·신호 성적표"], ["gap", "📈", "갭 상세", "갭 메움·미국 밤 갭·실적 갭"],
               ["danta", "⚡", "단타 통계", "전광판·날짜별 성적 (알림으로 받는 것)"], ["accum", "🤫", "조용한 매집", "거래량 이상·박스 돌파 (참고용)"]];
      h += '<section class="card"><h3>📂 신호 상세 <span class="mut">각 화면 맨 아래 「더 보기」</span></h3>' + L.map(function(x){
        return '<div class="sm-go" data-goto="' + x[0] + '"><span>' + x[1] + '</span><div><b>' + x[2] + '</b><small>' + x[3] + '</small></div><i>›</i></div>'; }).join("") + '</section>';
      b.innerHTML = h;
    });
  };
  /* ---------- ③ 📊 성적표 ---------- */
  window.scoreView = function(){ return '<div id="scbody"><div class="loading">채점 모으는 중…</div></div>'; };
  window.scoreInit = function(){
    Promise.all([J("scores.json"), getJSON("archive/x/prob.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })]).then(function(a){ drawScore(a[0], a[1]); }).catch(function(){ var b = document.getElementById("scbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">📊</div>성적표가 아직 안 올라왔어요.</div>'; });
  };
  function bar(w, l){ var n = (w || 0) + (l || 0); if (!n) return ''; return '<div class="sc-bar"><span class="w" style="flex:' + w + '">' + (w ? w : "") + '</span><span class="l" style="flex:' + l + '">' + (l ? l : "") + '</span></div>'; }
  /* 🩺 10/29 성적표 ⚡ 신호별에 「nh52·pead·cust·ins·earn·maxcut·frog」 영어 내부 이름이 그대로 보이던 것 — 건강검진 「영어 내부 이름」 검사로 찾음 */
  var SIGK = {cup: "컵", gap: "갭", accum: "매집", whale: "고래", focus: "집중", lead: "선행", nh52: "52주 신고가", pead: "실적 표류", dip: "급락 반등", trend: "추세",
    cust: "고객사 따라", ins: "내부자 매수", earn: "실적 갭", maxcut: "복권 거름망", frog: "개구리 갭", agree: "신호 겹침", nonews: "뉴스 없는 갭", pbskip: "눌림 안 온 갭", krgap: "한국 돌파 갭", cup_eye: "컵(눈 검사)"};
  function drawScore(S, PB){
    var b = document.getElementById("scbody"); if (!b) return;
    /* 🎲 10/21: 홈 첫 카드의 「아직 동전보다 못함」 경고·적중률은 여기로 (전면엔 말로만) */
    var d1 = PB && PB.score && PB.score.all && PB.score.all.d1 || {}, okN = d1.n ? Math.round(d1.hit / 100 * d1.n) : 0, proven = (d1.n || 0) >= 20 && (d1.hit || 0) >= 55;
    var pcard = d1.n ? '<section class="card sc-c" data-goto="prob"><div class="sc-h"><span class="hm-i">🎲</span><div><b>시장확률 — 다음 날 방향</b><small>홈 「오늘 한 줄」이 얼마나 맞나 · 5개 시장 합산</small></div>' +
      '<div class="sc-rate ' + (d1.hit >= 55 ? "up" : d1.hit < 45 ? "dn" : "") + '">' + Math.round(d1.hit) + '%<small>맞음</small></div><span class="hm-go">보기 ›</span></div>' + bar(okN, d1.n - okN) +
      '<p class="note">' + d1.n + '번 중 ' + okN + '번 맞음. ' + (proven ? '20번 넘게 채점해 55%를 넘어서, 홈에서 「세게」 말해요.' : '<b>아직 동전보다 확실히 낫지 않아요</b> — 20번 넘게 채점해 55%를 넘기 전까지 홈에서는 「약간 오를 쪽」처럼 약하게만 말해요. 이 숫자로 사고팔지 마세요.') + '</p></section>' : '';
    /* 📊 10/31 B9 「번 돈÷잃은 돈 1.6 (비용 뺀 36건)」 글자 벽 → 막대 그림 — 가운데 선 = 본전(1배), 오른쪽 초록 = 버는 쪽, 왼쪽 빨강 = 잃는 쪽 */
    var pfRow = function(x, good){ var m = /^(.*?)\s*손익비\s*([\d.]+)\s*(?:\((.*)\))?/.exec(String(x)); if (!m) return '<div class="pf-r"><span class="pf-n">' + e(x) + '</span></div>';
      var v = +m[2], L = Math.min(1, Math.abs(Math.log(Math.max(v, 0.05))) / Math.log(4)) * 50, sub = (m[3] || "").replace(/비용 뺀\s*/, "").replace(/비용 전\s*([\d.]+)/, "비용 빼기 전 $1배");
      return '<div class="pf-r"><span class="pf-n">' + e(m[1]) + (sub ? '<small>' + e(sub) + '</small>' : '') + '</span><span class="pf-t"><i class="pf-z"></i><i class="pf-b ' + (v >= 1 ? "g" : "r") + '" style="' + (v >= 1 ? "left:50%" : "right:50%") + ';width:' + L.toFixed(1) + '%"></i></span><b class="pf-v ' + (v >= 1 ? "g" : "r") + '">' + v.toFixed(v >= 10 ? 0 : 1) + '배</b></div>'; };
    var pfAll = (S.good || []).map(function(x){ return pfRow(x, 1); }).concat((S.bad || []).map(function(x){ return pfRow(x, 0); }));
    var h = pcard + '<section class="card sc-top sc-c" data-goto="port~pokick"><div class="sc-h"><span class="hm-i">⚖️</span><div><b>신호별 번 돈 ÷ 잃은 돈</b><small>가운데 선 = 본전(1배) · 오른쪽으로 길수록 잘 버는 신호</small></div></div>' +
      (pfAll.length ? '<div class="pf-l">' + pfAll.join("") + '</div>' : '<p class="mut">표본 쌓는 중</p>') +
      '<p class="note">매시간 자동 채점 · ' + e(String(S.at || "").slice(5)) + ' · 매일 저녁 자가 업그레이드가 이 숫자로 규칙을 고쳐요(지는 건 줄이고 이기는 건 늘림).</p></section>';
    (S.rows || []).forEach(function(r){
      var top = '<div class="sc-h"><span class="hm-i">' + r.ic + '</span><div><b>' + e(r.t) + '</b><small>' + e(r.note || "") + '</small></div>' +
        (r.rate != null && ((r.win || 0) + (r.loss || 0) >= 5 || (r.k === "kick" && (r.n || 0) >= 5)) ? '<div class="sc-rate ' + (r.rate >= 55 ? "up" : r.rate < 45 ? "dn" : "") + '">' + r.rate + '%<small>맞음</small></div>' : r.avg != null ? '<div class="sc-rate ' + cls(r.avg) + '">' + sg(r.avg, 1) + '<small>평균</small></div>' : '') + '</div>';
      var nn = (r.win || 0) + (r.loss || 0);
      var body = nn && nn < 5 && r.k !== "port" ? '<div class="sc-few">표본 ' + nn + '건 — 5건 넘으면 비율을 보여 줘요</div>' : bar(r.win, r.loss);
      if (r.k === "report" && r.recent) body += r.recent.map(function(x){ return '<div class="sc-li"><span class="sc-v ' + (/맞/.test(x.v) ? "w" : /틀/.test(x.v) ? "l" : "") + '">' + e(x.v) + '</span>' + md(x.d) + ' ' + e(String(x.t || "").slice(0, 70)) + '</div>'; }).join("");
      if (r.k === "report" && r.cal && r.cal.n) body += '<div class="sc-cal"><b>🎯 확률 채점 ' + r.cal.n + '건 · 브라이어 ' + r.cal.brier + ' <span class="mut">(0 완벽 · 0.25 동전)</span> · ' + e(r.cal.tone || "") + '</b>' +
        (r.cal.cats || []).map(function(c){ return '<span class="' + (c.ok ? "ok" : "") + '">' + e(c.k) + ' ' + c.rate + '% <small>' + c.n + '건</small>' + (c.ok ? ' ✓' : '') + '</span>'; }).join("") +
        '<small>' + e(r.cal.gate || "") + ' · ✓ = 비중을 바꿔도 되는 분야</small></div>';
      if (r.k === "kick" && r.sig) body += '<div class="sc-sig">' + r.sig.map(function(x){ return '<div class="' + (x.shadow ? "sh" : x.trial ? "tr" : x.on ? "on" : "off") + '"><b>' + e(x.tag) + ' ' + e(SIGK[x.k] || x.name || x.k) + '</b>' +
        '<small>' + (x.shadow ? "👻 그림자 " : x.trial ? "🧪 시험 " : x.on ? "✓ 킥에 들어감 " : "⏳ 대기 ") + (x.n != null ? x.n + "건" : "") + (x.avg != null ? " · 평균 " + sg(x.avg, 1) : "") + (x.pf ? " · 손익비 " + x.pf : "") + '</small>' +
        (window.HON ? '<div class="sc-hon">' + (x.h_n ? HON.chip(x.h_avg, {n: x.h_n, pf: x.h_pf, basis: x.h_basis, oos: x.h_oos}) + HON.tags(x) : '') + (x.k === "whale" ? HON.whale(x) : '') + '</div>' : '') + '</div>'; }).join("") + '</div>' +
        (r.honest_ret != null && window.HON ? '<div class="sc-hon">⚡ 킥 포트 전체 ' + HON.chip(r.honest_ret, {d: 2, note: r.honest_note}) + '</div>' : '');
      if (r.k === "danta" && r.rows) body += '<table class="lrn"><tr><th></th><th>09시</th><th>10시</th><th>11~12시</th><th>13시~</th></tr>' + r.rows.map(function(x){
        return '<tr><td>' + e(x.k) + '<small>' + (x.n || 0) + '건 ' + sg(x.avg) + '</small></td>' + ["09시", "10시", "11~12시", "13시 이후"].map(function(s){ var c = (x.slots || {})[s] || {};
          return '<td><b class="st-' + e(c.st) + '">' + e({"강함": "⭐", "켬": "켬", "관찰": "👀", "닫힘": "닫힘"}[c.st] || "–") + '</b><small>' + (c.n ? c.n + "건 " + sg(c.avg, 1) : "") + '</small></td>'; }).join("") + '</tr>'; }).join("") + '</table>';
      if (r.k === "picks" && r.rows) body += r.rows.map(function(x){ return '<div class="sc-li">' + e(x.name) + ' · ' + e((x.picks || []).join("·")) + (x.edge != null ? ' <b class="' + cls(x.edge) + '">' + (x.edge >= 0 ? "앞섬 " : "뒤짐 ") + sg(x.edge, 1).replace("%", "p") + '</b>' : ' <span class="mut">채점 대기</span>') + '</div>'; }).join("");
      var GO = {report: "market", bets: "feed~fdbrain", kick: "port~pokick", picks: "port~poct", focus: "market~mkfo", port: "port~pocmp", whale: "port~pokick"}[r.k];
      h += '<section class="card sc-c"' + (GO ? ' data-goto="' + GO + '"' : '') + '>' + top.replace('</div></div>', '</div><span class="hm-go">보기 ›</span></div>') + body + '</section>';
    });
    b.innerHTML = h + '<div id="scrbt"></div>';
    J("rules_bt.json").then(function(T){ var x = document.getElementById("scrbt"); if (!x || !T || !T.rows) return;
      x.outerHTML = '<section class="card sc-bt" id="scrbt"><h3>🧪 포트 규칙 검증 <span class="mut">' + e(T.from.slice(0, 4)) + '~' + e(T.to.slice(0, 4)) + ' · 매주 일요일 다시</span></h3>' +
        '<table class="sc-bt-t"><tr><th></th><th>연 수익</th><th>최대 낙폭</th><th>샤프</th><th></th></tr>' + T.rows.map(function(r){
          return '<tr' + (/켬/.test(r.lab) ? ' class="kp"' : '') + '><td>' + e(r.lab) + '</td><td class="' + cls(r.cagr) + '">' + sg(r.cagr, 1) + '</td><td>' + r.mdd + '%</td><td>' + (r.sharpe != null ? r.sharpe : "–") + '</td><td>' + e(r.verdict || "") + '</td></tr>'; }).join("") + '</table>' +
        '<p class="note">「같은 비중」에 규칙 하나씩 붙여 본 결과예요. ✅ 나아진 것만 킥 포트에 켜요 — 지금은 ① 국면 현금만 켜져 있어요. ' + e(T.note || "") + '</p><p class="note" id="sctri"></p></section>';
      // 🧾 10/22 시도 장부 — 지금까지 시험한 조합 수 한 줄 (조합이 많을수록 1등은 운으로도 좋아 보임)
      J("trials.json").then(function(R){ var y = document.getElementById("sctri"); if (y && R && R.line) y.textContent = R.line; }).catch(function(){});
    }).catch(function(){});
  }

  /* ---------- ⑤ 접히는 카드 + 바로가기 칩 (💼 포트) ---------- */
  var FOLD = {};
  try { FOLD = JSON.parse(localStorage.getItem("fold") || "{}"); } catch(x) {}
  // 10/21 「결론 → 근거」: 포트 탭 묶음은 처음엔 모두 접힘(맨 위 「부터 성적」이 결론) — 한 번 펼치면 기억
  var FMAP = [[/시장 .*비교/, "pocmp", "🏁 비교", 0], [/목소리 경주/, "povoice", "🗣 목소리", 0], [/집중 포트/, "poconc", "🎯 집중", 0], [/섹터 의견/, "poviews", "🧭 섹터", 0], [/킥 칸 속/, "pokick", "⚡ 킥", 0], [/이렇게 담으면/, "pofollow", "📋 따라하기", 0], [/비중 바뀐 날/, "potl", "🔁 바뀐 날", 0],
              [/해외 동종주/, "popeers", "🌏 동종주", 0], [/벌고 잃었나/, "poct", "🧩 칸별", 0], [/날짜별/, "podt", "📅 날짜별", 0]];
  window.foldify = function(root){
    if (!root) return;
    var kids = [].slice.call(root.children), groups = [], g = null;
    kids.forEach(function(k){
      if (k.classList.contains("sec")){
        var t = k.textContent, m = FMAP.filter(function(x){ return x[0].test(t); })[0];
        g = m ? {sec: k, m: m, body: []} : null; if (g) groups.push(g); return;
      }
      if (g && !k.classList.contains("po-mode") && !k.classList.contains("po-hero") && k.id !== "podz") g.body.push(k); else g = null;
    });
    if (!groups.length) return;
    groups.forEach(function(x){
      var id = x.m[1], open = FOLD[id] == null ? !!x.m[3] : !!FOLD[id];
      var w = document.createElement("div"); w.className = "fold" + (open ? " open" : ""); w.id = id;
      x.sec.parentNode.insertBefore(w, x.sec);
      x.sec.classList.add("fold-h"); x.sec.insertAdjacentHTML("beforeend", '<i class="fchev"></i>');   // 글자는 CSS(펼치기 ▾ / 접기 ▴)
      w.appendChild(x.sec);
      var bd = document.createElement("div"); bd.className = "fold-b"; x.body.forEach(function(n){ bd.appendChild(n); }); w.appendChild(bd);
      // 11/05 사용자 「집중 포트 눌렀더니 닫기 버튼이 없어」 — 펼친 묶음 맨 아래에 「접기 ▴」 (제목 줄 ▾ 만으로는 안 보임) · 제목 줄도 「펼치기 ▾ / 접기 ▴」 글자로
      var cb = document.createElement("button"); cb.type = "button"; cb.className = "fold-x"; cb.textContent = "접기 ▴"; bd.appendChild(cb);
      var setF = function(o){ w.classList.toggle("open", o); FOLD[id] = o ? 1 : 0; try { localStorage.setItem("fold", JSON.stringify(FOLD)); } catch(z) {} };
      cb.onclick = function(ev){ ev.stopPropagation(); setF(false); var y = w.getBoundingClientRect().top; var hh = (document.querySelector("header") || {}).offsetHeight || 0; if (y < hh + 46) window.scrollTo({top: window.scrollY + y - hh - 52, behavior: "instant"}); };
      x.sec.onclick = function(ev){ if (ev.target.closest("button,a,[data-op],.tt-i")) return; setF(!w.classList.contains("open")); };
    });
    var bar_ = document.createElement("div"); bar_.className = "fold-jump";
    bar_.innerHTML = '<button data-j="pohero">💼 성적</button>' + groups.map(function(x){ return '<button data-j="' + x.m[1] + '">' + x.m[2] + '</button>'; }).join("");
    root.insertBefore(bar_, root.firstChild);
    var hero = root.querySelector(".po-hero"); if (hero && !hero.id) hero.id = "pohero";
    [].forEach.call(bar_.querySelectorAll("button"), function(bt){ bt.onclick = function(){ var el = document.getElementById(bt.dataset.j); if (!el) return;
      if (el.classList.contains("fold") && !el.classList.contains("open")){ el.classList.add("open"); FOLD[el.id] = 1; try { localStorage.setItem("fold", JSON.stringify(FOLD)); } catch(z) {} }
      var y = el.getBoundingClientRect().top + window.scrollY - (document.querySelector("header").offsetHeight + 46); window.scrollTo({top: y, behavior: "smooth"}); }; });
  };

  /* ---------- ⑦ 종목 화면 신호 배지: 포트·킥·집중·두뇌까지 ---------- */
  var SIG = null;
  function sigOf(sym){
    var p = SIG ? Promise.resolve(SIG) : J("sigindex.json").then(function(j){ SIG = j.ix; return SIG; }).catch(function(){ return {}; });
    return p.then(function(ix){ var s = String(sym || "").toUpperCase(), c = s.replace(/\.(KS|KQ)$/, ""); return ix[s] || ix[c] || ix[c.replace(/^0+/, "")] || null; });
  }
  var _sb = window.sigBadges;
  if (_sb) window.sigBadges = function(sym){
    return Promise.all([_sb(sym).catch(function(){ return ""; }), sigOf(sym)]).then(function(a){
      var x = a[1]; if (!x) return a[0];
      var parts = [];
      if (x.tags) parts.push('<span class="sgx-t">' + e(x.tags) + '</span>');
      if (x.kick != null) parts.push('<a class="sgx k" data-goto="port~pokick">⚡ 킥에 ' + (+x.kick).toFixed(1) + '% 들어 있음' + (x.kick_r != null ? ' <b class="' + cls(x.kick_r) + '">' + sg(x.kick_r, 1) + '</b>' : '') + '</a>');
      if (x.port) parts.push('<a class="sgx p" data-goto="port~pofollow">💼 포트 「' + e(x.port) + '」 칸 상품</a>');
      if (x.focus) parts.push('<a class="sgx f" data-goto="market">🎯 오늘 집중 「' + e(x.focus) + '」 ★</a>');
      if (x.bet) parts.push('<a class="sgx b" data-goto="feed">🧠 두뇌 선제 아이디어 · ' + e(x.bet) + '</a>');
      if (!parts.length) return a[0];
      return '<div class="card sgx-c">' + parts.join("") + '</div>' + a[0];
    });
  };

  /* ---------- 탭 그리기 보완: 홈·성적 버튼은 같은 모양 ---------- */
  var css = document.createElement("style");
  css.textContent = [
    /* 탭: 두 줄 7칸 (아이콘 위·글자 아래) */
    "header .tabs{grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:2px 8px 8px}",
    "header .tab{flex-direction:column;gap:1px;padding:5px 0 4px;font-size:12.5px;border-radius:10px;letter-spacing:-.6px}",
    "header .tab .ic{font-size:16px}",
    "@media (max-width:350px){header .tab .ic{display:block;font-size:14px}header .tab{font-size:12.5px}}",
    "#uibtn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:3px 8px;font-size:14px;margin-left:8px;cursor:pointer}",
    "#uiset{position:fixed;z-index:60;top:calc(env(safe-area-inset-top) + 52px);right:12px;width:260px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:12px;box-shadow:0 18px 40px -12px rgba(0,0,0,.5)}",
    ".us-go{display:flex;flex-direction:column;gap:6px;margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.us-go button{text-align:left;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:9px 10px;font:inherit;font-size:14px;cursor:pointer}",
    "#uiset b{display:block;margin-bottom:8px}#uiset small{display:block;color:var(--sub);font-size:12.5px;margin-top:8px}",
    ".us-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}.us-r>span{font-size:13px;color:var(--sub)}",
    ".us-seg{display:flex;gap:4px}.us-seg button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:9px;padding:5px 8px;font:inherit;font-size:12.5px;cursor:pointer}.us-seg button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}",
    /* 홈 */
    ".hm-day{font-size:13px;color:var(--sub);margin:-4px 2px 10px;display:flex;align-items:center;flex-wrap:wrap;gap:5px}.hm-date{white-space:nowrap}.hm-day .hm-story{padding:3px 8px}.hm-day>*{flex-shrink:0}.hm-cs{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.4}",
    /* 10/14 A9-1 시간대 라벨 · A9-4 30초 스토리 버튼 */
    ".hm-ed{background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:12.5px;color:var(--text);cursor:pointer;white-space:nowrap}",
    ".hm-story{margin-left:auto;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer}",
    /* A9-2 줄 안 꺾임 · 선 끝 라벨 */
    ".hm-nw{white-space:nowrap}.lc-e{font-size:12.5px}",
    /* A9-3 킥 제목 · 잘 가는/안 가는 줄 */
    ".hm-kt.rest{color:var(--sub);font-weight:700}.hm-kt.buy{color:#4dd47a}.hm-kt.sell{color:#ff8a8a}.hm-cl{flex:none;align-self:center;font-size:12.5px;color:var(--sub);font-weight:700;margin-right:2px}",
    /* A9-5 🔮 예고 표 · 확률 막대 · 나 vs 앱 */
    ".hm-nx{display:flex;align-items:center;gap:7px;padding:5px 0;border-top:1px dashed var(--line)}.hm-nx:first-of-type{border-top:0}.hm-nxt{flex:1;min-width:0}",
    ".hm-pb{position:relative;flex:none;width:44px;height:16px;border-radius:5px;background:var(--panel);overflow:hidden;border:1px solid var(--line)}.hm-pb i{position:absolute;left:0;top:0;bottom:0;background:rgba(255,184,77,.55)}.hm-pb b{position:absolute;inset:0;font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;justify-content:center}",
    ".hm-vt{display:flex;flex:none;gap:3px}.hm-vt button{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:2px 6px;font-size:14px;line-height:1.2;cursor:pointer;opacity:.75}.hm-vt button.on{opacity:1;border-color:#ffb84d;background:rgba(255,184,77,.22)}",
    ".hm-me{font-size:12.5px;font-weight:700;color:var(--sub);background:var(--panel2);border-radius:6px;padding:0 5px;margin-left:4px;white-space:nowrap}.hm-me.ok{color:#4dd47a}.hm-me.no{color:#ff8a8a}",
    ".hm-vs{margin-top:8px;background:var(--panel2);border-radius:10px;padding:7px 10px;font-size:12.5px}.hm-vs>span{display:block;font-weight:800;margin-bottom:4px}.hm-vs>div{display:flex;align-items:center;gap:7px;margin:3px 0}.hm-vs small{width:18px;color:var(--sub);font-weight:700}.hm-vs i{flex:1;height:8px;border-radius:4px;background:var(--panel);overflow:hidden;display:block}.hm-vs i b{display:block;height:100%;background:#7c9cff;border-radius:4px}.hm-vs>div:first-of-type i b{background:#ffb84d}.hm-vs em{font-style:normal;font-weight:800;width:72px;text-align:right;white-space:nowrap}",
    ".hm-c{cursor:pointer;transition:transform .12s}.hm-c:active{transform:scale(.99)}",
    ".hm-cb{flex:1;min-width:0}.hm-cb>b{display:block;font-weight:700;font-size:13.5px}.hm-cb>b small{font-weight:600;color:var(--sub);font-size:12.5px}" +
    ".hm-ab{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;margin-top:3px}.hm-a,.hm-b{border-radius:8px;padding:2px 8px;font-size:12.5px;line-height:1.45}.hm-a{background:var(--panel2);color:var(--sub)}.hm-b{background:color-mix(in srgb,var(--acc,#7c9cff) 16%,var(--panel2));font-weight:700}" +
    ".hm-a .diff{text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--sub) 60%,transparent)}.hm-a .same,.hm-b .same{opacity:.55}.hm-b .diff{color:var(--text)}.hm-ab .sl{opacity:.4}.hm-to{color:var(--dim);font-weight:800}" +
    ".hm-tr{display:inline-flex;align-items:center;gap:3px;margin:3px 0 1px;cursor:pointer;vertical-align:middle}.hm-tr em,.hm-l10{font-style:normal}.hm-tr em{font-size:12.5px;color:var(--sub);margin-left:4px;font-weight:700}.hm-tr em.no{color:#ff8a8a}.hm-tr em.ok{color:#4dd47a}" +
    ".hm-tr i,.hm-l10 i{display:inline-block;width:8px;height:8px;border-radius:50%}.hm-tr i.o,.hm-l10 i.o{background:#4dd47a}.hm-tr i.x,.hm-l10 i.x{border:1.5px solid #ff8a8a;box-sizing:border-box}" +
    ".hm-l10{display:inline-flex;gap:2px;vertical-align:middle;margin-left:2px}.hm-trd[hidden]{display:none!important}.hm-trd{display:block;font-size:12.5px;color:var(--sub);margin:2px 0 3px}.hm-nxt .hm-tr{display:flex}" +
    ".hm-vc{margin-top:8px;background:var(--panel2);border-radius:10px;padding:7px 10px;font-size:12.5px}.hm-vc>small{display:block;color:var(--sub);margin-bottom:4px;line-height:1.4}.hm-vr{display:flex;align-items:center;gap:6px;margin:4px 0;white-space:nowrap}.hm-vr>span{width:84px;flex:none;font-weight:700}.hm-vr>em{flex:1;min-width:0;font-style:normal;font-weight:800;overflow:hidden;text-overflow:ellipsis}.hm-vr>em.up{color:var(--up)}.hm-vr>em.dn{color:var(--dn)}.hm-vr>em.mut{color:var(--dim);font-weight:500}.hm-vr>b{display:inline-flex;align-items:center;gap:2px;font-size:12.5px;color:var(--sub);font-weight:700}.hm-vr>b i{display:inline-block;width:8px;height:8px;border-radius:50%}.hm-vr>b i.o{background:#4dd47a}.hm-vr>b i.x{border:1.5px solid #ff8a8a;box-sizing:border-box}.hm-vr>b i.pc{width:auto;height:auto;border:0;border-radius:0;font-style:normal;color:var(--text);margin-left:2px}.hm-vr>b i.mut{width:auto;height:auto;border:0;border-radius:0;font-style:normal;color:var(--dim);font-weight:500}.hm-vn{font-size:12.5px;color:var(--dim);margin-top:4px;line-height:1.4}" +
    ".hm-chg{padding:12px 14px!important}.hm-cht{font-weight:800;font-size:14px;margin-bottom:6px}.hm-chi{display:flex;align-items:center;gap:8px;padding:8px 2px;border-top:1px solid var(--line);font-size:13.5px;cursor:pointer}.hm-chi:first-of-type{border-top:0}.hm-chi b{flex:1;font-weight:600}.hm-chi i{font-style:normal;color:var(--dim)}",
    ".hm-gr{display:flex;gap:9px;padding:7px 0;border-top:1px solid var(--line)}.hm-gr:first-of-type{border-top:0}.hm-gr>span{font-weight:900;font-size:16px;min-width:16px}.hm-gr.ok>span{color:#4dd47a}.hm-gr.no>span{color:#ff8a8a}.hm-gr.hold>span{color:var(--sub)}.hm-gr b{display:block;font-size:13.5px}.hm-gr small{display:block;font-size:12.5px;color:var(--sub);line-height:1.45}",
    ".hm-wn{margin-top:8px;background:var(--panel2);border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.5}.hm-wn small{display:block;color:var(--sub);font-weight:700;margin-bottom:2px}.hm-p{color:#ffb84d}",
    ".hm-sh{display:block;margin:10px 0 0 auto;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}",
    ".hm-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.hm-h>div{flex:1;min-width:0}.hm-h b{font-size:16px}.hm-h small{display:block;font-size:12.5px;color:var(--sub)}",
    ".hm-i{font-size:22px;width:36px;height:36px;border-radius:11px;background:var(--panel2);display:flex;align-items:center;justify-content:center;flex:none}",
    ".hm-go{font-size:12.5px;color:var(--sub);white-space:nowrap}",
    ".sc-hon:empty{display:none}.sc-hon{margin-top:3px;font-size:12.5px;color:var(--sub)}.hm-big .hon-chip{display:flex;width:max-content;margin:3px 0 0;font-size:12.5px;padding:1px 6px}.hm-big .hon-chip b{font-size:12.5px;letter-spacing:0}" +
    ".hm-big{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:2px 0 6px}.hm-big>div{background:var(--panel2);border-radius:12px;padding:7px 9px}.hm-big small{display:block;font-size:12.5px;color:var(--sub)}.hm-big b{font-size:20px;letter-spacing:-.5px}",
    ".hm-l{font-size:13.5px;line-height:1.5;color:var(--text)}.hm-l small{color:var(--sub)}.hm-l a{color:var(--acc);cursor:pointer}",
    ".hm-sp{margin:4px -4px 0}.hm-sp .lg{font-size:12.5px}",
    ".hm-alert{margin-top:8px;background:rgba(255,184,77,.12);border:1px solid rgba(255,184,77,.4);border-radius:12px;padding:8px 10px;font-size:13px}.hm-alert small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}",
    ".hm-cn{display:flex;justify-content:space-between;align-items:center;gap:8px;border-radius:10px;padding:7px 10px;margin-bottom:8px;font-size:13px;cursor:pointer}.hm-cn.g{background:rgba(77,212,122,.12)}.hm-cn.r{background:rgba(255,107,107,.12)}.hm-cn small{color:var(--sub)}" +
    ".hm-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.hm-chip{font-size:12.5px;background:var(--panel2);border-radius:999px;padding:3px 9px}.hm-chip.g{background:rgba(77,212,122,.14);color:#4dd47a}.hm-chip.b{background:rgba(57,135,229,.16);color:#7cb0ff}",
    ".hm-ev{font-size:14px;padding:5px 0;border-bottom:1px dashed var(--line)}.hm-ev small{color:var(--sub)}",
    ".hm-f{padding:6px 0;border-bottom:1px dashed var(--line)}.hm-f:last-child{border-bottom:0}.hm-f small{color:var(--sub);font-size:12.5px}",
    /* 누르는 곳 */
    ".hm-chip[data-op],.hm-chip[data-goto],[data-op],a[data-goto]{cursor:pointer}.hm-l a,.hm-ev b[data-op]{color:var(--acc);text-decoration:none}",
    ".sc-cal{margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--panel2);font-size:12.5px;display:flex;flex-wrap:wrap;gap:5px}.sc-cal>b{width:100%;font-size:12.5px}.sc-cal span{border:1px solid var(--line);border-radius:999px;padding:2px 8px}.sc-cal span.ok{border-color:#4dd47a;color:#4dd47a}.sc-cal>small{width:100%;color:var(--sub);font-size:12.5px}",
    ".sc-bt-t{width:100%;border-collapse:collapse;font-size:12.5px}.sc-bt-t td,.sc-bt-t th{padding:6px 4px;border-bottom:1px solid var(--line);text-align:right}.sc-bt-t td:first-child,.sc-bt-t th:first-child{text-align:left}.sc-bt-t tr.kp td{font-weight:800}",
    ".hm-chip[data-op]:active,.hm-chip[data-goto]:active,.sc-c:active{opacity:.7}.sc-c{cursor:pointer}",
    /* 성적표 */
    ".pf-l{margin-top:8px}.pf-r{display:grid;grid-template-columns:minmax(0,1.25fr) 1fr auto;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--line)}.pf-r:first-child{border-top:0}.pf-n{font-size:13.5px;font-weight:700;line-height:1.35;min-width:0}.pf-n small{display:block;font-size:11.5px;font-weight:500;color:var(--sub)}" +
    ".pf-t{position:relative;height:14px;background:var(--panel2);border-radius:7px;overflow:hidden}.pf-z{position:absolute;left:50%;top:-2px;bottom:-2px;width:2px;margin-left:-1px;background:var(--sub);opacity:.6}.pf-b{position:absolute;top:2px;bottom:2px;border-radius:5px}.pf-b.g{background:#2f9e44}.pf-b.r{background:#d6453d}" +
    ".pf-v{font-size:14px;font-weight:800;min-width:42px;text-align:right}.pf-v.g{color:#2f9e44}.pf-v.r{color:#d6453d}",
    ".sc-gb{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sc-gb>div{background:var(--panel2);border-radius:12px;padding:9px}.sc-gb b{display:block;font-size:13px;margin-bottom:4px}.sc-gb span{display:block;font-size:12.5px;line-height:1.5}",
    ".sc-h{display:flex;align-items:center;gap:10px}.sc-h>div:nth-child(2){flex:1;min-width:0}.sc-h b{font-size:15px}.sc-h small{display:block;font-size:12.5px;color:var(--sub)}",
    ".sc-rate{font-size:22px;font-weight:900;text-align:right;line-height:1.05}.sc-rate small{display:block;font-size:12.5px;color:var(--sub);font-weight:600}",
    ".sc-bar{display:flex;height:16px;border-radius:8px;overflow:hidden;margin:9px 0 4px;font-size:12.5px;font-weight:800}.sc-bar .w{background:#3fae6a;color:#fff;padding-left:6px}.sc-bar .l{background:#d0574f;color:#fff;text-align:right;padding-right:6px}",
    ".sc-li{font-size:12.5px;padding:5px 0;border-top:1px dashed var(--line)}.sc-v{font-size:12.5px;font-weight:800;border-radius:5px;padding:0 5px;margin-right:5px;background:var(--panel2)}.sc-v.w{background:rgba(77,212,122,.18);color:#4dd47a}.sc-v.l{background:rgba(230,103,103,.18);color:#ff8a8a}",
    ".sc-sig{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:9px}.sc-sig .hon-chip{width:auto;max-width:100%;flex-wrap:wrap}.sc-sig .hon-tag,.sc-sig .sc-hon{white-space:normal}.sc-sig>div{min-width:0;overflow-wrap:anywhere;border-radius:10px;padding:7px 9px;background:var(--panel2)}.sc-sig b{display:block;font-size:13px}.sc-sig small{font-size:12.5px;color:var(--sub)}",
    ".sc-sig .on{background:rgba(77,212,122,.12)}.sc-sig .tr{background:rgba(255,184,77,.12)}.sc-sig .sh{background:rgba(124,156,255,.1)}",
    ".sc-few{font-size:12.5px;color:var(--sub);margin-top:6px}",
    ".lrn .st-강함{color:#4dd47a}.lrn .st-관찰{color:#ffb84d}.lrn .st-닫힘{color:var(--dim)}",
    /* 접기 */
    ".fold .fold-h{cursor:pointer;display:flex;align-items:center;gap:6px}.fold .fold-h .fchev{margin-left:auto;flex:none;font-style:normal;white-space:nowrap}",
    ".fold .fold-h .fchev::after{content:'접기 ▴';font-size:12.5px;font-weight:700;color:var(--sub);border:1px solid var(--line);border-radius:999px;padding:3px 9px;background:var(--panel)}.fold:not(.open) .fold-h .fchev::after{content:'펼치기 ▾'}",
    ".fold:not(.open) .fold-b{display:none}.fold:not(.open){margin-bottom:6px}",
    ".fold-x{display:block;margin:10px auto 2px;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:8px 22px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}",
    ".fold:not(.open) .fold-h{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:11px 12px}",
    ".fold-jump{position:sticky;top:var(--hh,140px);z-index:5;display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin:0 -16px 10px;padding:6px 16px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}",
    ".fold-jump::-webkit-scrollbar{display:none}.fold-jump button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;cursor:pointer}",
    ".flash{animation:flash 1.6s ease}@keyframes flash{0%,40%{box-shadow:0 0 0 3px var(--c,#7c9cff)}100%{box-shadow:none}}",
    /* 종목 신호 */
    ".sgx-c{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 12px}.sgx-t{font-size:20px;letter-spacing:-1px}",
    ".sgx{font-size:12.5px;border-radius:999px;padding:4px 10px;background:var(--panel2);color:var(--text);text-decoration:none;cursor:pointer}.sgx.k{background:rgba(255,107,107,.14)}.sgx.p{background:rgba(233,196,106,.16)}.sgx.f{background:rgba(124,156,255,.14)}.sgx.b{background:rgba(77,212,122,.12)}",
    /* ⑥ 밝은 테마 */
    ":root[data-ui=light]{--bg:#f4f6fa;--panel:#ffffff;--panel2:#eef1f6;--line:#dde2ea;--text:#141a26;--sub:#5a6476;--dim:#636d7b;--acc:#3d63dd;--up:#d64545;--down:#2f6fd0}",
    ":root[data-ui=light] header{background:rgba(244,246,250,.9)}",
    ":root[data-ui=light] header .tab{background:#fff;border-color:#dde2ea;color:#5a6476}",
    ":root[data-ui=light] header .tab.on{color:#fff}",
    ":root[data-ui=light] .chip{background:rgba(20,26,38,.06)}",
    ":root[data-ui=light] .card,:root[data-ui=light] .hero{box-shadow:0 1px 2px rgba(20,26,38,.05)}",
    ":root[data-ui=light] .po-hero{background:linear-gradient(160deg,rgba(233,196,106,.22),#fff 60%)}",
    ":root[data-ui=light] .po-hero.kick{background:linear-gradient(160deg,rgba(255,107,107,.18),#fff 60%)}",
    ":root[data-ui=light] .vtip{background:#141a26;color:#fff}",
    ":root[data-ui=light] .lc-g{stroke:#e3e7ee}:root[data-ui=light] .lc-a{fill:#6b7486}",
    ":root[data-ui=light] svg circle[stroke='#121826']{stroke:#fff}",
    ":root[data-ui=light] .up{color:#d64545}:root[data-ui=light] .dn{color:#2f6fd0}",
    ":root[data-ui=light] #backbtn{background:#fff;color:#141a26;border-color:#dde2ea}",
    ":root[data-ui=light] .hm-chip.g,:root[data-ui=light] .po-sg.g{color:#1f8b4c}:root[data-ui=light] .hm-chip.b{color:#2f6fd0}",
    ":root[data-ui=light] .sc-v.w{color:#1f8b4c}:root[data-ui=light] .sc-v.l{color:#c23b3b}",
    ":root[data-ui=light] em.w,:root[data-ui=light] .po-rr .d.w,:root[data-ui=light] .mk-t td small.up{color:#1f8b4c}",
    ":root[data-ui=light] .po-pf3 .on{color:#1f8b4c}:root[data-ui=light] .po-pf3 .trial{color:#b26b00}",
    ":root[data-ui=light] .hero{background:radial-gradient(120% 140% at 100% 0%,color-mix(in srgb,var(--c) 28%,transparent),transparent 60%),#fff}",
    ":root[data-ui=light] iframe.rep{background:#fff}"
  ].join("\n");
  document.head.appendChild(css);
  // 접기 칩이 헤더 바로 아래 붙도록 헤더 높이 기억
  function hh(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }
  window.addEventListener("resize", hh); setTimeout(hh, 300); setTimeout(hh, 1500);
})();
;
/* ======== nav2.js ======== */
/* CH Investing — 화면 정리 (10/11 사용자: "보기 좋게 심플하게 · 상위 하위 · 펼치기 접기 · 중복은 빼도 됨 · 돋보기가 있는데 종목 카테고리가 있는 것도")
   ① 아래 탭 바 5개(오늘·시장·포트·신호·피드) → 위에는 그 묶음의 작은 탭만 (14칸 격자 대신)
   ② 📄 종목 탭은 🔍 검색으로, 🔔 알림·💬 의견함은 ⚙️ 안으로 (주소 #onepager·#alarm·#idea 는 그대로 열림)
   ③ 탭 머리(큰 소개 카드)는 한 줄로 — 소개 글은 머리를 누르면
   ④ 뒤로 버튼은 돌아갈 곳이 있을 때만 */
(function(){
  var GROUPS = [
    /* 🧊 11/12 냉정 분석 4차 「한 화면 · 할 일 5칸 · 연구실」 — 사용자 「네 의견대로 다 진행해」
       아래 탭 = PB 가 하는 일 5가지. 나머지(포트·성적표·확률·신호·운세)는 지우지 않고 🔬 연구실(#lab) 한곳으로 — 숨은 묶음이라 아래 탭엔 없지만 들어가면 위 작은 탭은 그대로.
       되돌리기: 브랜치 backup-before-job5-1112 */
    {k: "home",  ic: "🏠", t: "오늘",   tabs: ["home", "market", "sector", "feed"]},
    {k: "send",  ic: "📨", t: "한 장", tabs: ["send", "diag"]},   // 🩻 11/16 포트 진단 한 장(ux1116.js)
    {k: "prop",  ic: "📝", t: "제안서", tabs: ["prop"]},
    {k: "prod",  ic: "🛍️", t: "상품",   tabs: ["bond", "fund", "els", "divc"]},
    {k: "stock", ic: "🔍", t: "종목",   tabs: ["onepager", "flow"]},
    {k: "lab",   ic: "🔬", t: "연구실", tabs: ["lab"], hide: true},
    {k: "inv",   ic: "💼", t: "포트",   tabs: ["port", "score"], hide: true, lab: 1},
    /* 🧊 11/16 냉정 분석 5차 — 큰손·컵·갭·오를 확률을 「신호 한눈에」(sigall · ux1116.js) 한 화면으로 합침. 네 화면은 지우지 않고 그 안 「전체 보기」로 */
    {k: "sig",   ic: "🎯", t: "신호",   tabs: ["sigall", "screen", "sigmore"], hide: true, lab: 1},
    {k: "sigd",  ic: "🎯", t: "신호 상세", tabs: ["whale", "cup", "gap", "prob"], hide: true, lab: 1, up: "sigall", upt: "신호"},
    {k: "luck",  ic: "🔮", t: "운세",   tabs: ["luck", "saju", "tarot", "lotto"], hide: true, lab: 1},
    {k: "tax",   ic: "🧾", t: "세무계산기", tabs: ["tax"], hide: true, lab: 1}   // 🧾 11/16 tax.js
  ];
  var LAB = {tax: "🧾 세무계산기", diag: "🩻 포트 진단", sigall: "🎯 신호 한눈에", send: "📨 고객에게 한 장", lab: "🔬 연구실", onepager: "🔍 종목 찾기", home: "🏠 오늘", feed: "📰 피드", market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", flow: "🧲 수급", port: "💼 포트", divc: "💰 배당비교", score: "📊 성적표", whale: "🐋 큰손", cup: "☕ 컵", gap: "📈 갭", accum: "🤫 매집", danta: "⚡ 단타", screen: "🔎 거르기", sigmore: "🗂 더 보기", bond: "🏦 채권", fund: "📦 펀드", els: "🎯 ELS", luck: "🔮 오늘의 운세", saju: "📜 사주 리포트", tarot: "🃏 타로", lotto: "🎱 로또", prop: "📝 제안서"};
  window.__navMap = {groups: GROUPS, lab: LAB};   // 🔎 11/12 메뉴 찾기 — 화면이 바뀌어도 지금 이름·자리로 길 안내
  function grpOf(k){ for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].tabs.indexOf(k) >= 0) return GROUPS[i]; return null; }
  function last(g){ var m = (window.store && store.gl) || {}; return m[g.k] && g.tabs.indexOf(m[g.k]) >= 0 ? m[g.k] : g.tabs[0]; }

  function bar(){
    var b = document.getElementById("bnav");
    if (!b){
      b = document.createElement("nav"); b.id = "bnav";
      b.innerHTML = GROUPS.filter(function(g){ return !g.hide; }).map(function(g){ return '<button data-g="' + g.k + '"><span class="i">' + g.ic + '</span><span>' + g.t + '</span></button>'; }).join("");
      document.body.appendChild(b);
      [].forEach.call(b.children, function(x){ x.onclick = function(){
        var g = GROUPS.filter(function(y){ return y.k === x.dataset.g; })[0], gc = grpOf(cur);
        if (gc === g){ window.scrollTo({top: 0, behavior: "smooth"}); return; }   // 지금 묶음을 또 누르면 맨 위로
        go(last(g)); }; });
    }
    var gc = grpOf(cur);
    [].forEach.call(b.children, function(x){ x.classList.toggle("on", !!gc && x.dataset.g === gc.k); });
  }
  window.drawTabs = function(){
    var nav = document.getElementById("tabs"); if (!nav) return;
    var g = grpOf(cur);
    if (cur && cur !== "onepager"){ store.lastTab = cur; }
    try { updBack(); } catch(x) {}
    if (g){ store.gl = store.gl || {}; store.gl[g.k] = cur; try { save(); } catch(x) {} }
    if (g && (g.tabs.length > 1 || g.lab)){   // 🧾 11/16 연구실 안 화면은 탭이 하나여도 「‹ 연구실」을 보임(세무계산기)
      // 🧊 11/12: 홈에서도 위 작은 탭을 보임(오늘·시황·시장 흐름·피드 — 「뭐가 있는지 모르겠다」)
      nav.className = "tabs sub";
      nav.innerHTML = (g.up ? '<button class="tab tab-lab" data-k="' + g.up + '">‹ ' + g.upt + '</button>' : g.lab ? '<button class="tab tab-lab" data-k="lab">‹ 연구실</button>' : '') + g.tabs.map(function(k){ var c = CATS.filter(function(x){ return x.key === k; })[0] || {};
        return '<button class="tab' + (k === cur ? " on" : "") + '" style="--c:' + c.color + '" data-k="' + k + '">' + String(LAB[k] || c.name).replace(/^[^\s가-힣A-Za-z]+\s+/, "") + '</button>'; }).join("");   // 🧊 11/12 위 작은 탭은 글자만(이모지 뺌)
      [].forEach.call(nav.children, function(b){ b.onclick = function(){ if (b.dataset.k !== cur || cur === "onepager") go(b.dataset.k); }; });   // 🧊 11/12 종목리포트를 보다가 「종목 찾기」를 누르면 검색으로
      var on = nav.querySelector(".on"); if (on && on.scrollIntoView) try { on.scrollIntoView({inline: "center", block: "nearest"}); } catch(x) {}
      if (window.subBadges) try { subBadges(nav); } catch(x) {}   // 📱 A12-5 신호 탭 숫자 배지
    } else { nav.className = "tabs sub none"; nav.innerHTML = ""; }
    bar();
    setTimeout(function(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }, 0);   // 접기 칩이 헤더 바로 아래 붙게
  };

  // ⑦ 뒤로: 홈이 아니면 늘 보이게 (알림 링크로 종목 화면을 바로 열었을 때도) — 더 돌아갈 기록이 없으면 보던 탭 → 오늘로
  window.updBack = function(){ var b = document.getElementById("backbtn"); if (!b) return; b.classList.add("on");
    // 🎨 11/04: 아래 탭으로 가는 첫 화면(돌아갈 기록 없음)에선 숨김 — 종목리포트처럼 탭에 없는 화면은 보임
    var tabbed = !!(window.cur && document.querySelector("#bnav") && ["home","market","sector","flow","divc","bond","fund","els","prop","feed","send","lab"].indexOf(cur) >= 0);
    b.classList.toggle("root", tabbed ? !document.getElementById("sheet") : !(navD() > 0 || !!document.getElementById("sheet") || (window.cur && cur !== "home"))); };
  var _goBack = window.goBack;
  window.goBack = function(){
    if (document.getElementById("sheet") || navD() > 0) return _goBack();
    var t = (cur === "onepager" && store.lastTab && store.lastTab !== "onepager") ? store.lastTab : "home";
    if (cur !== t) go(t); else window.scrollTo({top: 0, behavior: "smooth"});
  };
  // ③ 탭 머리: 누르면 소개 글
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest("#main > .hero"); if (!h || ev.target.closest("button,a")) return;
    h.classList.toggle("show");
  });

  // ④ 긴 카드 접기는 simple.js(clampLong)가 함 — 알림·링크로 그 안의 카드에 갈 땐 펼쳐서
  window.unclamp = function(el){ var c = el && el.closest && el.closest(".xs-clamp"); if (c){ c.classList.remove("xs-clamp"); var b = c.querySelector(":scope > .xs-cl"); if (b) b.textContent = "접기 ▴"; } };


  // ⑤ 차트 글씨가 겹치면 비켜 쓰기 (섹터 시계·지도·되감기 — 10/11 사용자: "겹치면 비켜써")
  function declutter(svg){
    var ts = [].slice.call(svg.querySelectorAll("text.rotl"));
    var fw = svg.closest(".famw"), ff = fw ? fw.dataset.ff || "" : "";
    if (!svg.getBoundingClientRect().width) return;                          // 안 보이는 카드 — 보일 때 다시
    ts = ts.filter(function(t){ var g = t.closest("[data-fam]"); return !g || (ff ? g.dataset.fam === ff : !!g.closest("[data-top]") || !fw); });
    var sig = ff + "#" + ts.map(function(t){ return (t.dataset.x0 || t.getAttribute("x")) + "," + (t.dataset.y0 || t.getAttribute("y")); }).join("|");
    if (!ts.length || svg.dataset.dc === sig) return;
    var boxes = [];
    try {        // 점(동그라미)도 피해서
      [].forEach.call(svg.querySelectorAll("circle"), function(c){ var r = +c.getAttribute("r"), g = c.closest("[data-fam]"); if (ff && g && g.dataset.fam !== ff) return; if (r >= 3 && r <= 9){ var cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy"); boxes.push({x: cx - r, y: cy - r, w: 2 * r, h: 2 * r}); } });
    } catch(x) {}
    try {        // 구역 이름(🔥 계속 강함 등)도 피해서
      [].forEach.call(svg.querySelectorAll("text.rotq"), function(q){ var b = q.getBBox(); if (b.width) boxes.push({x: b.x, y: b.y, w: b.width, h: b.height}); });
    } catch(x) {}
    [].forEach.call(svg.querySelectorAll(".dc-ln"), function(l){ l.remove(); });
    ts.sort(function(a, b){ return (+a.getAttribute("y")) - (+b.getAttribute("y")); });
    var over = function(b){ return boxes.some(function(o){ return b.x < o.x + o.w + 1 && o.x < b.x + b.w + 1 && b.y < o.y + o.h && o.y < b.y + b.h; }); };
    var W = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 9999;
    for (var i = 0; i < ts.length; i++){
      var t = ts[i];
      if (t.dataset.x0){ t.setAttribute("x", t.dataset.x0); t.setAttribute("y", t.dataset.y0); t.removeAttribute("text-anchor"); }
      var bb; try { bb = t.getBBox(); } catch(x) { return; }
      if (!bb.width) return;                                  // 아직 안 보이는 카드 — 보일 때 다시
      var x0 = +t.getAttribute("x"), y0 = +t.getAttribute("y"); t.dataset.x0 = x0; t.dataset.y0 = y0;
      var dy = bb.y - y0, dx = bb.x - x0, L = -(bb.width + 14), put = null;
      var tries = [[0, 0], [L, 0], [0, -11], [0, 11], [L, -11], [L, 11], [0, -22], [0, 22], [L, -22], [L, 22], [0, -33], [0, 33], [L, -33], [L, 33], [0, -44], [0, 44]];
      for (var j = 0; j < tries.length; j++){
        var b = {x: x0 + dx + tries[j][0], y: y0 + dy + tries[j][1], w: bb.width, h: bb.height};
        if (b.x < 0 || b.x + b.w > W) continue;
        if (!over(b)){ put = tries[j]; boxes.push(b); break; }
      }
      if (!put){ boxes.push({x: bb.x, y: bb.y, w: bb.width, h: bb.height}); continue; }
      if (put[0] || put[1]){
        t.setAttribute("x", x0 + put[0]); t.setAttribute("y", y0 + put[1]);
        if (Math.abs(put[1]) > 0){
          var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
          ln.setAttribute("class", "dc-ln"); ln.setAttribute("x1", x0 - 6); ln.setAttribute("y1", y0 - 4);
          ln.setAttribute("x2", put[0] ? x0 + put[0] + bb.width + 1 : x0 - 1); ln.setAttribute("y2", y0 + put[1] - 4);
          t.parentNode.insertBefore(ln, t);
        }
      }
    }
    svg.dataset.dc = sig;
  }
  // ⑧ 모든 카드 제목: 누르면 설명 칸(닫기 ✕) + 관련 화면 바로가기 (10/11 사용자: "모든 타이틀들이 설명이나 연동 화면으로 가게 · 되돌아오거나 닫기")
  //    국면 신호판 점수 설명(plus6)과 같은 모양. 카드 안의 「읽는 법」 글(p.note)은 이 칸 안으로 옮겨 카드를 가볍게.
  var DESC = [
    // 🎲 시장확률 — 🌡️ 시장 심리 온도 (10/28 · 옛 이름 공포·탐욕)
    [/시장 심리 온도/, "시장 사람들이 지금 얼마나 들떠 있는지를 0~100으로 나타내요. 지수 추세·변동성(VIX)·회사채·안전자산·위험선호 같은 7가지를 지난 1년과 비교한 순위예요. 그래서 「무섭다」가 아니라 「1년 중 몇 번째로 들떠 있나」로 읽어야 해요. 많이 오른 해엔 잠깐 쉬어도 낮게 나와요. 2007년 이후 기록으론 가장 움츠린 구간 뒤가 오히려 조금 더 잘 올랐어요. CNN 공포·탐욕 지수는 원래 이름 그대로 아래에 같이 보여 줘요."],
    // 🏠 오늘 — ☀️ 오늘 한 장 (10/28 · 옛 이름 PB 한 장)
    [/오늘 한 장/, "지금 시장을 고객에게 설명할 때 쓸 한 장이에요. 맨 위 줄은 나라별 흐름(횡보·상승·하락)과 오늘 가장 중요한 이유, 「고객에게 할 말」은 그대로 읽어 줘도 되는 3~4줄이에요. 장중엔 매시간 새로 써요(옆 시각이 마지막으로 쓴 때). 「📨 보내기」를 누르면 이 내용으로 「지금 시장 한 장」 그림을 만들어 카톡 등으로 보낼 수 있어요. 투자 참고용이고 매수 추천이 아니에요."],
    // 📝 제안서 (10/29 사용자 「제안서 카테고리의 조이는 설명이 거의 없어」 — 자세한 건 propose.js 의 JOY 글)
    [/오늘의 기본폼/, "매일 아침 시황에 맞춰 미리 만들어 둔 제안서 틀 9가지예요. 고를 상품을 누르면 아래 칸이 열려요."],
    [/누구에게 · 누가/, "제안서 표지에 들어갈 고객 이름과 제안자(나)·소속을 넣는 칸이에요."],
    [/상품별 금액/, "고른 상품마다 금액과 위험 정도·환전 여부·꼭 넣을 종목을 정하는 칸이에요."],
    [/^📤 만들기|^만들기/, "고객에게 바로 보여 주거나, 한 장 그림·PDF·PPT로 만들어 보내는 칸이에요."],
    // 🌐 시황
    [/오늘의 킥/, "오늘 짧게 노려 볼 기회(킥)와 그 이유예요. 킥 포트에 실제로 담기는 건 성과가 확인된 신호뿐이에요."],
    [/전일 미국장/, "어젯밤 미국장에서 중요했던 움직임과 오늘 한국장에 줄 영향이에요."],
    [/오늘의 집중/, "오늘 돈이 가는 길 → 그걸 담는 방법 → 오늘 할 행동을 한 장으로 정리했어요."],
    [/돈이 몰리는 곳/, "지금 돈(거래·상승)이 몰리는 섹터·테마예요."],
    [/숫자 복기/, "이번 주에 앱의 신호들(컵·갭·매집·고래·킥 등)이 실제로 얼마나 벌었는지 숫자로 되돌아보는 표예요."],
    [/밤사이 가장 크게/, "우리가 자는 동안 미국·세계 시장에서 평소보다 크게 움직인 것 3개를 골라, 오늘 한국장에 줄 영향을 같이 적었어요."],
    [/일정판/, "이번 주 경제 발표·실적 일정이에요. 내 관심종목이나 신호 종목의 실적이 있으면 따로 표시돼요."],
    [/오늘 할 일/, "오늘 시황을 보고 할 일을 정리한 목록이에요. 체크하면 이 휴대폰에 기억돼요."],
    [/리포트에 나온 종목/, "오늘 시황 리포트에 나온 종목들이에요. 이름을 누르면 그 종목의 종목리포트로 가요."],
    [/지난 시황 검색/, "지난 시황 리포트를 낱말로 찾아요. 예: 「금리」, 「반도체」."],
    [/실시간 시장판/, "지수·환율·금리·원자재의 지금 값과 오늘 등락이에요."],
    [/오늘의 숫자/, "오늘 시황의 핵심 숫자들이에요."],
    [/경우의 수/, "시황 리포트가 본 앞으로의 시나리오와 각각의 확률이에요. 확률이 바뀌면 순서도 바뀌어요."],
    [/킥 포함 자산 배분/, "기본 배분에서 현금 일부를 떼어, 성과가 확인된 신호(킥)에 담은 배분이에요. 기본과 킥을 같은 날 같은 기준으로 비교해요."],
    [/자산 배분/, "시황 리포트 기준으로 지금 주식·채권·금·현금을 얼마씩 담을지 정리한 표예요. 예시이며 매수 추천은 아니에요."],
    [/최근 흐름/, "최근 리포트들의 판단이 어떻게 바뀌어 왔는지 한 줄씩 보여줘요."],
    [/규칙 발동/, "미리 정해 둔 매매 규칙 중 오늘 조건이 맞아 켜진 것이 있는지 확인해요."],
    [/오늘의 판단/, "오늘 시황의 결론 한 줄과 그 이유예요."],
    [/어제 예고/, "어제 리포트가 예고한 것이 오늘 맞았는지 채점한 결과예요."],
    [/다가오는 일정/, "앞으로 시장을 흔들 수 있는 발표·행사 일정이에요."],
    [/이러면 틀린 것/, "오늘 판단이 틀렸다고 볼 신호예요. 이게 나오면 생각을 바꿔요 — 고집하지 않기 위한 장치."],
    [/카톡 요약/, "카톡으로 보내기 좋게 줄인 오늘 시황 요약이에요."],
    [/적중률/, "시황 리포트의 예고가 실제로 맞은 비율을 계속 쌓아 채점한 기록이에요."],
    [/대응표/, "시나리오마다 내가 어떻게 할지 미리 적어 두는 칸이에요. 미리 정해 두면 장이 흔들려도 덜 흔들려요."],
    [/리포트대로 굴렸다면/, "리포트의 배분을 그대로 들고 있었다면 1억이 지금 얼마가 됐을지 계산한 거예요."],
    [/금리 한 장 지도/, "미국 10년 금리와 코스피를 한 그림에 놓고, 금리가 주식을 누르는지 보는 지도예요."],
    [/킥 되감기/, "그날 썼던 킥(짧게 노린 기회)이 그 뒤 실제로 맞았는지 자동으로 붙여 보는 기록이에요."],
    // 🧭 나침반
    [/국면 신호판/, "경기 사이클(6~18개월 뒤 경기)과 시장 타이밍(1~3개월 뒤 주가) 두 점수로 지금이 어떤 국면인지 보여줘요. 점수를 누르면 신호별 설명이 나와요."],
    [/5개 시장 한눈에/, "한국·미국·일본·중국·홍콩 5개 시장에서 오늘 오른 종목과 내린 종목 비율을 한 줄씩 비교해요."],
    [/세계 시장 하루 흐름/, "해가 뜨는 순서(일본 → 한국 → 중국 → 홍콩 → 미국)로 시장마다 오른 종목 비율을 원으로 보여줘요."],
    [/누가 누구를 따라가나/, "5개 시장의 지수가 하루하루 얼마나 같이 움직였는지(상관) 보여줘요. 1이면 똑같이, 0이면 상관없이 움직여요."],
    [/제일 강할까/, "체감 온도 점수로 5개 시장을 줄 세웠어요. 높을수록 사람들이 사고 싶어 하는 시장이에요."],
    [/국면 전환 예보/, "지수와 20일선·60일선의 위치·기울기로 상승장·횡보장·하락장을 판정하고(급락 — 20일 −8%·20일 고점 대비 −10% — 은 바로 하락장), 지금 속도면 언제 바뀔지 예보해요."],
    [/로테이션 시계/, "섹터마다 고른 기간(1·3·6개월)의 흐름과 그보다 짧은 기간 흐름으로 시계 위 자리를 정해요. 돈은 보통 시계 방향으로 돌아요."],
    [/로테이션 지도/, "위 탭으로 기간을 골라요 — 1개월(가로 한 달·세로 1주) · 3개월(가로 석 달·세로 1개월) · 6개월(가로 반년·세로 석 달). 고른 기간은 섹터 묶음 전체(등락·시계·되감기·업종·대형주)에 같이 적용돼요. 어느 섹터로 돈이 들어오고 빠지는지 한 장으로 봐요."],
    [/이 업종·종목을 보자/, "오늘 등락·1주 흐름·업종 안 오른 종목 비율로 고른 업종 3곳과 대장주예요."],
    [/체감 온도/, "오늘 하루 오른 종목 비율·신고가·지수 위치를 섞어 시장 분위기를 0(차가움)~100(뜨거움)으로 나타내요. CNN 방식 공포·탐욕은 시장확률 탭에 있어요."],
    [/오른 종목 · 내린 종목/, "오늘 오른 종목과 내린 종목 수예요. 지수가 대형주 위주라서, 이 숫자가 보통 종목의 실제 체감이에요."],
    [/대표 지수/, "나라별 대표 지수 차트예요. 차트를 누르고 옆으로 밀면 그날 값이 나와요."],
    [/포트 비교 지수/, "내 포트가 이겨야 할 시장 14곳의 지수예요. 포트 탭의 「시장 14곳과 비교」와 같은 목록이에요."],
    [/상승 − 하락/, "매일 오른 종목 수에서 내린 종목 수를 뺀 값의 흐름이에요. 시장의 체력을 봐요."],
    [/섹터 등락/, "시가총액 가중으로 본 섹터별 오늘 등락이에요. 섹터를 누르면 그 섹터 종목이 나와요."],
    [/52주 신고가/, "1년 중 가장 높은 값을 오늘 새로 쓴 종목이에요. 큰 회사 순."],
    [/많이 오른 대형주/, "오늘 많이 오른 큰 회사들이에요."],
    [/약한 업종/, "오늘 가장 약했던 업종이에요."],
    [/히트맵/, "섹터별로 기간(1주·1개월·3개월 등) 수익률을 색으로 보여줘요. 빨강 = 오름, 파랑 = 내림."],
    [/국면 기록/, "최근 60거래일 동안 시장 국면(상승·횡보·하락)이 어떻게 바뀌어 왔는지 기록이에요."],
    [/흐름 되감기/, "최근 15거래일 동안 섹터들이 지도 위에서 어떻게 움직였는지 다시 돌려 봐요. 섹터를 고르면 그것만 돌려요."],
    [/신고가 vs 신저가/, "신고가 종목과 신저가 종목의 비율 흐름이에요. 지수는 오르는데 이 선이 내려가면 몇 종목만 끄는 장이에요."],
    [/환율·금리에 민감/, "환율·금리가 움직일 때 같이 움직인 업종이에요. 환율·금리 뉴스가 나오면 어느 업종이 영향을 받을지 봐요."],
    [/미국 → 한국/, "미국에서 강한 업종을 한국 같은 업종이 따라왔는지 봐요. 덜 따라온 곳은 따라잡을 여지를 볼 만해요."],
    // 💼 포트
    [/시장 \d+곳과 비교/, "내 포트(기본·킥)를 세계 주요 지수 14곳과 같은 날부터 달러 기준으로 비교해요. 목표는 S&P500을 이기는 것."],
    [/킥 칸 속/, "킥 칸 안에 무엇이 들어 있고, 손절·익절 규칙과 수익이 어떤지 보여줘요."],
    [/이렇게 담으면/, "지금 배분표대로 담으려면 무엇을 몇 주 사면 되는지 금액을 넣어 계산해 줘요."],
    [/비중 바뀐 날/, "배분 비중이나 상품이 바뀐 날과 그 이유의 기록이에요."],
    [/해외 동종주/, "미국에서 강한 섹터마다 한국·일본·대만 등 해외 같은 업종 종목을 달러 수익·위험 대비로 비교해, 이기는 쪽을 포트에 담아요."],
    [/벌고 잃었나/, "포트의 칸(자산)마다 시작일부터 수익에 얼마나 더하고 뺐는지(기여 %p)와 지금 신호예요."],
    [/날짜별 성적/, "날짜마다 성적(수익률)을 차례로 보여줘요."],
    // 📊 성적표
    [/규칙 검증/, "포트 규칙(국면 현금·칸 기울이기·추세 브레이크)을 2008년부터 미국 섹터 ETF에 매일 적용해 본 결과예요. 나아진 규칙만 킥 포트에 켜요."],
    // 🐋 고래
    [/고래 지수 vs/, "고래(유명 펀드)들이 많이 든 종목으로 만든 지수와 S&P500의 1년 수익률을 비교해요."],
    [/TOP 10/, "고래 보유·최근 매수·가격 위치를 점수로 매긴 오늘의 상위 10종목이에요."],
    [/오늘의 신호/, "오늘 새로 생긴 고래 관련 신호예요."],
    [/함께 든 종목/, "여러 고래가 같이 들고 있는 종목이에요. 많이 겹칠수록 믿음이 모인 종목."],
    [/행동별 이후 성적/, "고래가 새로 산·늘린·줄인·판 종목이 그 뒤 실제로 얼마나 올랐는지 비교해요."],
    [/이것 하나/, "매일 하나씩 고른 「오늘 이것 하나」가 그 뒤 얼마나 올랐는지 기록이에요."],
    [/수익률 상위 고래/, "1년 수익률이 높은 고래 순이에요. 누르면 그 고래의 보유 종목."],
    [/합의 매수/, "같은 분기에 여러 고래가 새로 산 종목이에요."],
    [/고래보다 싸게/, "고래가 산 분기의 마지막 날 가격보다 지금 더 싼 종목이에요."],
    [/따라하기 수익곡선/, "고래의 큰 신규 매수를 공시일에 따라 샀다면 수익이 어땠는지 곡선으로 보여줘요."],
    [/분기 타임라인/, "고래별로 분기마다 무엇을 사고팔았는지 시간 순서로 보여줘요."],
    [/13F 공시 카운트다운/, "미국 기관이 보유 내역(13F)을 내는 마감까지 남은 날과 아직 안 낸 곳이에요."],
    [/매도 경보/, "여러 고래가 정리하거나 크게 줄인 종목이에요. 들고 있다면 한 번 점검."],
    [/확신도/, "비중을 크게 새로 담았거나 크게 늘린 고래 순이에요. 돈을 크게 건 쪽을 보여줘요."],
    [/내부자도 사는 중/, "최근 90일 동안 회사 임원·대주주가 자기 돈으로 장에서 산 기록이에요."],
    [/관심종목을 가진 고래/, "내 ⭐ 관심종목을 들고 있는 고래와 그 비중이에요."],
    [/그대로 따라 사기/, "고래들이 많이 든 상위 15종목을 그 비중대로 산다면 어떻게 되는지 보여줘요."],
    [/새로 산 종목, 그 뒤/, "고래가 새로 산 종목을 공시일에 샀다면 지금까지 수익이 어떤지 모았어요. 그 고래를 얼마나 믿을지의 근거."],
    [/겹침 지도/, "고래들의 보유 종목이 얼마나 겹치는지 그림으로 보여줘요. 가까울수록 같은 이야기에 베팅 중."],
    [/고래 vs 고래/, "고래 두 곳을 골라 보유 종목과 성적을 나란히 비교해요."],
    // ☕ 컵 · 📈 갭
    [/돌파 후 추적/, "컵 돌파가 난 종목이 그 뒤 성공(+20%)했는지 실패(−8%)했는지 따라가 봐요."],
    [/잘 맞던 조건/, "지금까지 성적이 좋았던 조건만 남겨 고른 종목이에요."],
    [/매수 계획/, "금액과 손절 폭을 넣으면 몇 주를 살지 계산해 줘요."],
    [/주봉 컵/, "몇 달~1년 넘게 만든 큰 컵 모양이에요. 일봉 컵보다 큰 그림."],
    [/돌파 임박/, "돌파선(왼쪽 고점)까지 3% 안으로 다가온 종목이에요."],
    [/이중 신호/, "컵과 갭 신호가 동시에 나온 종목이에요. 두 신호가 겹치면 더 볼 만해요."],
    [/컵 지도|갭 지도/, "오늘 신호가 어느 나라·섹터에 몰렸는지 보여주는 표예요. 숫자를 누르면 그 종목만 남아요."],
    [/^나라별/, "나라별 신호 수예요. 누르면 그 나라 종목만 보여요."],
    [/많이 나온 섹터/, "신호가 많이 나온 섹터예요. 누르면 그 섹터 종목만 보여요."],
    [/신호 성적표/, "이 화면의 신호가 처음 나온 날 샀다면 그 뒤 성적이 어땠는지 모은 표예요."],
    [/섹터별 신호 수/, "섹터마다 신호가 몇 개 나왔고 성적이 어땠는지 보여줘요."],
    [/메움 레이스/, "최근 갭이 갭 전 자리까지 되돌아오는지(메움) 경주처럼 보여줘요. 멀리 남은 종목이 강한 종목."],
    [/갭 크기 × 거래량/, "갭 크기와 거래량을 한 그림에 놓았어요. 오른쪽 위(크게 + 거래 많이)가 가장 믿을 만한 갭."],
    [/밤 갭/, "미국 대장주가 밤에 크게 갭이 나면 다음 날 한국 짝꿍 종목이 어떻게 움직였는지 2년 기록이에요."],
    [/갭 유형별/, "갭 종류(돌파·실적·소진 의심 등)마다 갭을 메운 비율이에요."],
    [/메움 확률표/, "갭 크기·거래량 조합마다 5일·20일 안에 갭을 메운 확률이에요. 낮을수록 잘 버틴 조합."],
    [/연속 갭/, "최근 20일 안에 위로 갭이 2번 넘게 난 종목이에요. 사는 힘이 강하다는 뜻."],
    [/실적 다음날 갭/, "실적 발표 다음 날 생긴 갭과, 실적을 앞둔 후보예요."],
    [/장 전 갭 후보/, "미국 장이 열리기 전 거래에서 갭이 날 것 같은 관심 종목이에요."],
    [/메움 추적/, "갭을 지킨 종목과 메운 종목의 그 뒤 수익을 비교해요."],
    // 🤫 매집
    [/매집 강도/, "가격은 조용한데 거래·수급이 쌓이는 정도를 점수로 매긴 순위예요."],
    [/관심이 식는/, "매집 조건에서 빠지거나 거래가 줄어든 종목이에요. 들고 있다면 점검."],
    [/박스 돌파/, "최근 20일 고점 위로 올라선 매집 종목이에요."],
    [/외국인·기관 순매수/, "최근 5일 동안 외국인·기관이 산 양이에요. 매집과 같이 나오면 더 믿을 만해요."],
    [/매집 달력/, "최근 8일 매집 점수를 달력처럼 보여줘요. 진할수록 점수가 높아요."],
    [/매집 종목 섹터/, "매집 종목이 어느 섹터에 몰려 있는지 보여줘요."],
    [/거래량 이상 종목/, "거래량이 그 전 석 달보다 크게 늘었는데 가격은 제자리인 종목이에요. 참고용 — 과거 검증에서 매수 신호로는 안 통했어요."],
    [/기간별 돌파/, "매집이 며칠째였는지에 따라 그 뒤 박스 돌파에 성공한 비율이에요."],
    [/숨소리/, "가격은 조용한데 거래량이 쌓이는 모습을 60일 그림으로 보여줘요."],
    [/누가 모으나/, "최근 10일 동안 개인·외국인·기관 중 누가 샀는지 보여줘요."],
    [/오래 모으는/, "매집이 오래된 순이에요. 같은 기간대의 과거 돌파율을 같이 적었어요."],
    [/매집의 생애/, "매집 → 돌파 → 상승의 평균 흐름과 지금 종목의 위치를 보여줘요."],
    // ⚡ 단타
    [/전광판/, "오늘 뜬 단타 알람과 지금 값이에요. 막대 = 장중 최저~최고, 흰 점 = 지금."],
    [/스스로 배운/, "쌓인 1분 자료와 실제 알람 결과로 단타 알람이 스스로 고친 규칙이에요."],
    [/성적 대시보드/, "단타 알람 전체의 승률과 평균 수익이에요."],
    [/손절·익절 라인/, "알람이 정한 손절가·목표가와 실제 움직임을 비교해요."],
    [/가상 매매 일지/, "알람마다 1주씩 샀다면 어땠는지 규칙대로 계산한 일지예요."],
    [/잘 맞는 시간대/, "몇 시에 뜬 알람이 잘 맞았는지 보여줘요."],
    [/손절 난 알람/, "손절까지 간 알람들의 공통점을 찾아봐요."],
    [/오늘 같은 장/, "오늘처럼 코스닥이 움직인 날에 알람 성적이 어땠는지 보여줘요."],
    [/유형별 가장 잘 된/, "알람 유형마다 가장 잘 된 알람이에요."],
    // 기타
    [/간밤 글로벌/, "간밤 미국·유럽 증시와 환율·금리·원자재가 어떻게 끝났는지 요약이에요."],
    [/전일 섹터 등락/, "어제 섹터별 등락이에요."],
    [/장중 나침반/, "장이 열려 있는 동안 5개 시장의 섹터 흐름을 몇 분마다 새로 보여줘요."],
    [/장중 섹터 발동/, "장중에 갑자기 강해진 섹터 기록이에요."],
    [/대장주/, "이 섹터에서 시가총액이 가장 큰 종목들이에요. 이름을 누르면 종목리포트."],
    [/오늘 많이 오른 종목/, "이 섹터에서 오늘 많이 오른 종목이에요."],
    [/구성 종목|테마 종목/, "이 섹터·테마에 속한 종목 목록이에요. 이름을 누르면 종목리포트."],
    [/한국 같은 섹터|관련주/, "같은 업종의 다른 나라 종목이에요. 이름을 누르면 종목리포트."],
    [/내 알림|알림 받기|알림 개수/, "휴대폰으로 받을 알림을 고르는 칸이에요."],
    [/종목 찾기/, "종목 이름이나 코드로 찾아 종목리포트를 열어요."],
    [/의견 남기기/, "앱에 바라는 점을 남기는 칸이에요. 운영자만 볼 수 있어요."]
  ];
  // 관련 화면 바로가기 [제목 규칙, 버튼 글, 갈 곳(탭~카드)]
  var LINKS = [
    [/킥/, "⚡ 킥 포트 보기", "port~pokick"],
    [/자산 배분|리포트대로 굴렸다면|이렇게 담으면/, "📋 포트에서 따라하기", "port~pofollow"],
    [/포트 비교 지수|시장 \d+곳과 비교/, "🏁 포트 vs 시장 14곳", "port~pocmp"],
    [/포트 비교 지수|시장 \d+곳과 비교/, "📈 나침반 지수 차트", "sector"],
    [/적중률|어제 예고|신호 성적표|성적 대시보드|규칙 검증|숫자 복기/, "📊 성적표", "score"],
    [/규칙 검증/, "⚡ 규칙이 켜진 킥 포트", "port~pokick"],
    [/국면|공포·탐욕|심리 온도|경우의 수|오늘의 판단/, "🧭 국면 신호판", "sector"],
    [/섹터|업종|로테이션|히트맵|돈이 몰리는 곳/, "🧭 나침반 섹터", "sector"],
    [/해외 동종주|벌고 잃었나/, "🧭 나침반 섹터", "sector"],
    [/이중 신호/, "☕ 컵", "cup"], [/이중 신호/, "📈 갭", "gap"],
    [/고래|13F|내부자/, "🐋 고래", "whale"],
    [/매집|외국인·기관/, "🤫 매집", "accum"],
    [/돌파 임박|박스 돌파|국면 기록|시간대|전광판|매도 경보|관심종목 알림/, "🔔 알림 켜기", "alarm"],
    [/밤사이|일정판|다가오는 일정|오늘 할 일|오늘의 판단/, "🎯 오늘의 집중", "market~mkfo"],
    [/리포트에 나온 종목|종목 찾기/, "📰 피드", "feed"],
    [/국면 신호판|국면 전환 예보|국면 기록/, "🧪 국면 규칙 검증", "score~scrbt"],
    [/섹터 등락|로테이션|히트맵|미국 → 한국/, "🌏 포트의 섹터별 동종주", "port~popeers"],
    [/52주 신고가|신고가 vs/, "☕ 컵 (돌파 후보)", "cup"],
    [/비중 바뀐 날|날짜별 성적/, "🌐 시황 판단", "market"],
    [/날짜별 성적/, "📊 성적표", "score"]
  ];
  function ttText(h){ var c = h.cloneNode(true); [].forEach.call(c.querySelectorAll(".mut,button,select,input,.fchev,.tt-i,a.btn,.gd-b,.gd-i"), function(x){ x.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim(); }
  var KEEPV = /추천 아님|변경 없음|종목은 없어요|넘은 비율|브라이어|보류 \d+건|도달은/;
  function titles(){
    var hs = document.querySelectorAll("#main section.card > h3, #sheet section.card > h3, #main section.card > .mk-lab, #main .fold > .fold-h");
    [].forEach.call(hs, function(h){
      if (h.dataset.tt) return;
      var c = h.closest(".fold") || h.closest("section.card");
      if (!c || c.id === "xs-more" || c.matches(".hm-c,.sc-c,.xs-more") || h.closest("[data-goto],[data-op]")) return;
      var t = ttText(h); if (!t) return;
      h.dataset.tt = "1";
      if (h.classList.contains("fold-h")){                 // 💼 포트 접기 머리: 머리 누르면 접기 그대로, ⓘ 만 설명
        var ib = document.createElement("button"); ib.type = "button"; ib.className = "tt-i"; ib.textContent = "ⓘ";
        var ch = h.querySelector(".fchev"); h.insertBefore(ib, ch || null);
      } else h.classList.add("tt-h");
      // 카드의 「읽는 법」 글을 설명 칸으로 (조작 버튼·현재 상태 글은 카드에 그대로)
      var ns = [].filter.call(c.querySelectorAll(c.matches(".fold") ? ":scope > .fold-b > section > p.note, :scope > .fold-b > p.note" : ":scope > p.note"), function(n){
        return !n.dataset.nt && n.textContent.trim() && !n.querySelector("button,a,input,select,textarea,label") && !KEEPV.test(n.textContent); });
      if (ns.length){ ns.forEach(function(n){ n.dataset.nt = "1"; n.classList.add("tt-note"); }); }
      h._tt = {t: t, ns: ns};
    });
  }
  function ttOpen(h){
    var c = h.closest(".fold") || h.closest("section.card"), box = h.nextElementSibling;
    if (box && box.classList.contains("tt-x")){ var o = box.hidden; box.hidden = !o; h.classList.toggle("tt-on", o); return; }
    var info = h._tt || {t: ttText(h), ns: []}, t = info.t;
    var sub = h.querySelector(".mut"); sub = sub ? sub.textContent.replace(/\s+/g, " ").trim() : "";
    var d = DESC.filter(function(x){ return x[0].test(t); })[0];
    var seen = {}, ls = LINKS.filter(function(x){ if (!x[0].test(t)) return false; var tab = x[2].split("~")[0];
      if (tab === cur && x[2].indexOf("~") < 0) return false; if (x[2].split("~")[1] && document.getElementById(x[2].split("~")[1]) && c.contains(document.getElementById(x[2].split("~")[1]))) return false;
      if (seen[x[2]]) return false; seen[x[2]] = 1; return true; }).slice(0, 3);
    box = document.createElement("div"); box.className = "tt-x";
    box.innerHTML = '<div class="ttx-h"><div><small>ⓘ 이 카드는</small><b></b>' + (sub ? '<em></em>' : '') + '</div><button class="ttx-x" type="button">닫기 ✕</button></div>' +
      (d ? '<p class="ttx-what"></p>' : '') + '<div class="ttx-n"></div>' +
      (ls.length ? '<div class="ttx-go"><small>관련 화면</small>' + ls.map(function(x){ return '<button type="button" class="ttx-l" data-goto="' + x[2] + '">' + x[1] + ' ›</button>'; }).join("") + '</div>' : '') +
      '<div class="ttx-bt"><button class="ttx-sh" type="button">📤 이 카드 공유</button><button class="ttx-x ttx-x2" type="button">설명 닫기 ▴</button></div>';
    box.querySelector("b").textContent = t;
    if (sub) box.querySelector("em").textContent = sub;
    if (d) box.querySelector(".ttx-what").textContent = d[1];
    var nb = box.querySelector(".ttx-n");
    (info.ns || []).forEach(function(n){ if (n.parentNode){ n.classList.remove("tt-note"); nb.appendChild(n); } });
    if (!nb.children.length) nb.remove(); else nb.insertAdjacentHTML("afterbegin", "<small>읽는 법</small>");
    if (!d){ var p0 = document.createElement("p"); p0.className = "ttx-what"; p0.textContent = sub || t; box.insertBefore(p0, box.children[1]); }
    h.parentNode.insertBefore(box, h.nextSibling);
    h.classList.add("tt-on");
    if (window.unclamp) unclamp(h);
    box.classList.add("ttx-in");
  }
  document.addEventListener("click", function(ev){
    var t = ev.target; if (!t.closest) return;
    var x = t.closest(".ttx-x");
    if (x){ ev.stopPropagation(); var bx = x.closest(".tt-x"), h = bx.previousElementSibling; bx.hidden = true; if (h) h.classList.remove("tt-on");
      if (x.classList.contains("ttx-x2") && h){ var y = h.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 12;
        if (h.getBoundingClientRect().top < 0) window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); }
      return; }
    var sh = t.closest(".ttx-sh");
    if (sh){ ev.stopPropagation(); var bx2 = sh.closest(".tt-x"), h2 = bx2.previousElementSibling, c2 = h2 && (h2.closest(".fold") || h2.closest("section.card"));
      var title = (h2 && h2._tt && h2._tt.t) || "", body = "";
      if (c2){ var all = (c2.innerText || "").replace(bx2.innerText || "", ""), seen = {}, out = [];
        all.split("\n").map(function(l){ return l.replace(/\s+/g, " ").trim(); }).forEach(function(l){
          if (!l || l === title || l.indexOf(title) === 0 || /^(ⓘ|전체 보기|접기|더 보기|자세히)/.test(l) || seen[l]) return; seen[l] = 1;
          if (out.length && (l.length <= 6 || out[out.length - 1].length <= 3)) out[out.length - 1] += " · " + l; else out.push(l); });
        body = out.slice(0, 6).join("\n"); }
      chShare("CH Investing", "📌 " + title + (body ? "\n" + body.slice(0, 260) : "") + "\n\n※ 투자 참고용 · 매수 추천 아님", cur); return; }
    var ib = t.closest(".tt-i"); if (ib){ ev.stopPropagation(); ttOpen(ib.closest(".fold-h")); return; }
    var h = t.closest("h3.tt-h, .mk-lab.tt-h"); if (!h) return;
    if (t.closest("button,a,input,select,label,textarea,[data-op],[data-goto]")) return;
    ttOpen(h);
  }, true);

  // ⑨ 공유 (10/13 「더 자주 열게」 ⑧) — 휴대폰 공유창(카톡 등) · 안 되면 복사
  window.chShare = function(title, text, hash){
    var url = "https://chkchp0702-spec.github.io/daily-app/" + (hash ? "#" + hash : "");
    var toast = function(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.setAttribute("role", "status"); d.setAttribute("aria-live", "polite"); d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); };
    var copy = function(){ var all = text + "\n" + url;
      if (navigator.clipboard) navigator.clipboard.writeText(all).then(function(){ toast("복사했어요 — 카톡 대화창에 붙여넣기 하세요"); }, function(){ prompt("길게 눌러 복사하세요", all); });
      else prompt("길게 눌러 복사하세요", all); };
    if (navigator.share) navigator.share({title: title, text: text, url: url}).catch(function(e){ if (e && e.name !== "AbortError") copy(); });
    else copy();
  };
  // ⑥ 나침반: 설명 글은 「ⓘ 설명」을 눌러야 보이게 (10/11 사용자: "지우지 말고 밑에 누르면 설명 부분 나오게 · 나침반이 복잡해 보여")
  var NOTE_TABS = {sector: 1};
  function notes(){
    [].forEach.call(document.querySelectorAll("#sheet details.cpx-d:not([data-op1])"), function(d){ d.dataset.op1 = "1"; d.open = true; });   // 칩으로 열면 바로 펼친 채로
    if (!NOTE_TABS[cur]) return;
    [].forEach.call(document.querySelectorAll("#main p.note, #main .rb-help, #sheet p.note"), function(n){
      if (n.dataset.nt || !n.textContent.trim()) return;
      n.dataset.nt = "1"; n.classList.add("nt-h");
      var b = document.createElement("button"); b.className = "nt-b"; b.type = "button"; b.textContent = "ⓘ 설명";
      b.onclick = function(ev){ ev.stopPropagation(); var o = n.classList.toggle("nt-h"); b.textContent = o ? "ⓘ 설명" : "ⓘ 설명 접기"; };
      n.parentNode.insertBefore(b, n);
    });
  }
  // 세부 섹터 계열 고르기 (시계·지도·되감기 같이)
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".famc [data-ffam]"); if (!b) return;
    var f = b.dataset.ffam; try { store.secf = f; save(); } catch(x) {}
    [].forEach.call(document.querySelectorAll(".famw"), function(w){ w.dataset.ff = f; });
    [].forEach.call(document.querySelectorAll(".famc [data-ffam]"), function(x){ x.classList.toggle("on", x.dataset.ffam === f); });
    setTimeout(function(){ [].forEach.call(document.querySelectorAll(".famw svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 30);
  });
  var DCT = null;
  new MutationObserver(function(){ if (DCT) return; DCT = setTimeout(function(){ DCT = null; try { titles(); } catch(x) {} notes();
    [].forEach.call(document.querySelectorAll("svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 200); })
    .observe(document.body, {childList: true, subtree: true});

  var css = document.createElement("style");
  css.textContent =
    // 위: 묶음 안의 작은 탭 (가로로 밀기)
    "header .tabs.sub{display:flex!important;gap:6px;overflow-x:auto;padding:0 12px 10px;scrollbar-width:none;grid-template-columns:none}" +
    "header .tabs.sub::-webkit-scrollbar{display:none}header .tabs.sub.none{display:none!important}" +
    "header .tabs.sub .tab{flex:none;flex-direction:row;padding:7px 14px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:-.3px;gap:0;min-width:auto}" +
    "header .tabs.sub .tab.on{background:var(--c);color:#111;border-color:transparent}" +
    ".top{padding-bottom:8px!important}.brand{font-size:20px!important}" +
    // 아래 탭 바
    "#bnav{position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;background:rgba(11,15,23,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);" +
    "border-top:1px solid var(--line);padding:4px 4px calc(env(safe-area-inset-bottom) + 4px)}" +
    "#bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;color:var(--sub);font:inherit;font-size:12.5px;padding:5px 0 3px;cursor:pointer;position:relative}" +
    "#bnav button .i{font-size:21px;line-height:1.15;filter:grayscale(.6);opacity:.75}" +
    "#bnav button.on{color:var(--text);font-weight:800}#bnav button.on .i{filter:none;opacity:1}" +
    "#bnav button.on:before{content:'';position:absolute;top:-4px;left:30%;right:30%;height:3px;border-radius:0 0 3px 3px;background:var(--c,#7c9cff)}" +
    ":root[data-ui=light] #bnav{background:rgba(255,255,255,.94);border-top-color:#dde2ea}" +
    "#backbtn{bottom:calc(env(safe-area-inset-bottom) + 74px)!important}#main{padding-bottom:120px!important}footer{padding-bottom:110px!important}" +
    // 탭 머리 한 줄
    "#main > .hero{background:none!important;border:0!important;box-shadow:none!important;padding:2px 4px 8px!important;margin:0 0 4px!important;cursor:pointer}" +
    "#main > .hero h1{display:inline;font-size:19px!important;letter-spacing:-.4px}" +
    "#main > .hero .meta{display:inline-flex!important;margin:0 0 0 8px!important;vertical-align:2px;gap:4px!important}" +
    "#main > .hero .meta .chip{font-size:12.5px;padding:2px 7px}" +
    "#main > .hero p{display:none}#main > .hero.show p{display:block;margin-top:6px}" +
    "#main > .hero h1:after{content:' ⓘ';font-size:12.5px;color:var(--dim);font-weight:400}" +
    // 카드 제목 설명 칸
    "h3.tt-h{justify-content:flex-start!important;gap:6px}h3.tt-h>.mut{margin-left:auto}h3.tt-h,.mk-lab.tt-h{cursor:pointer;-webkit-tap-highlight-color:transparent}h3.tt-h:after,.mk-lab.tt-h:after{content:'ⓘ';margin-left:4px;font-size:12.5px;color:var(--dim);font-weight:400;flex:none}" +
    "h3.tt-h.tt-on:after,.mk-lab.tt-h.tt-on:after{content:'ⓘ ▴';color:var(--text)}.tt-note{display:none!important}" +
    ".tt-i{flex:none;border:0;background:none;color:var(--dim);font:inherit;font-size:13px;padding:2px 6px;cursor:pointer}" +
    ".tt-x{margin:2px 0 12px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);padding:12px 12px 10px;font-size:13px;line-height:1.55;color:var(--text);font-weight:400;text-align:left}" +
    ".tt-x.ttx-in{animation:rbxIn .2s ease-out}@keyframes rbxIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}" +
    ".ttx-h{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;border-left:4px solid var(--c,#7c9cff);padding-left:10px}" +
    ".ttx-h small{display:block;color:var(--sub);font-size:12.5px}.ttx-h b{display:block;font-size:15.5px;font-weight:800;color:var(--text)}.ttx-h em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".ttx-x{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ttx-what{margin:10px 0 6px}.ttx-n{background:var(--panel);border-radius:10px;padding:8px 10px;margin:6px 0}.ttx-n>small,.ttx-go>small{display:block;color:var(--sub);font-size:12.5px;font-weight:700;margin-bottom:2px}" +
    ".ttx-n p.note{margin:4px 0 0!important;font-size:12.5px;color:var(--text)}" +
    ".ttx-go{margin:8px 0 2px;display:flex;flex-wrap:wrap;gap:6px}.ttx-go>small{flex-basis:100%}" +
    ".ttx-l{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ttx-bt{display:flex;gap:6px;margin-top:10px}.ttx-bt .ttx-x2{flex:1;margin:0}.ttx-sh{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ch-toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 90px);transform:translateX(-50%);z-index:99;background:var(--text);color:var(--bg);border-radius:12px;padding:10px 14px;font-size:13.5px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center}" +
    ".ttx-x2{display:block;width:100%;margin-top:10px;padding:9px}" +
    // 나침반 접기·설명
    ".nt-h{display:none!important}.nt-b{display:inline-block;border:0;background:none;color:var(--sub);font:inherit;font-size:12.5px;padding:4px 2px;margin:2px 0;cursor:pointer}" +
    "details.cpx-d>summary,.rb-det>summary{cursor:pointer;font-weight:800;font-size:15px;list-style:none;padding:2px 0}details.cpx-d>summary::-webkit-details-marker,.rb-det>summary::-webkit-details-marker{display:none}" +
    "details.cpx-d>summary:after,.rb-det>summary:after{content:' ▾';color:var(--dim);font-weight:400}details.cpx-d[open]>summary:after,.rb-det[open]>summary:after{content:' ▴'}" +
    "details.cpx-d>summary .mut{display:block;font-size:12.5px;font-weight:400;margin-top:2px}details.cpx-d[open]>summary{margin-bottom:10px}" +
    ".rb-det{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.rb-det>summary{font-size:14px;color:var(--sub)}" +
    // 계열 고르기
    ".famc{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin:6px 0 2px;padding-bottom:2px}.famc::-webkit-scrollbar{display:none}" +
    ".famc button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}.famc button.on{background:var(--text);color:var(--bg);border-color:transparent}" +
    ".famw[data-ff=it] [data-fam]:not([data-fam=it]),.famw[data-ff=hc] [data-fam]:not([data-fam=hc]),.famw[data-ff=ind] [data-fam]:not([data-fam=ind]),.famw[data-ff=fin] [data-fam]:not([data-fam=fin])," +
    ".famw[data-ff=con] [data-fam]:not([data-fam=con]),.famw[data-ff=com] [data-fam]:not([data-fam=com]),.famw[data-ff=mat] [data-fam]:not([data-fam=mat]),.famw[data-ff=re] [data-fam]:not([data-fam=re]){display:none}" +
    ".famw[data-ff=''] [data-fam]:not([data-top]) .rotl,.famw:not([data-ff]) [data-fam]:not([data-top]) .rotl{display:none}" +   // 전체일 땐 움직임 큰 10곳만 이름
    // 겹친 글씨 비켜 쓴 선 · 밝은 화면의 카드 창 머리
    "svg .dc-ln{stroke:var(--sub);stroke-width:.8;opacity:.6}" +
    ":root[data-ui=light] .sh-top{background:rgba(255,255,255,.94)!important}:root[data-ui=light] .sh-top b{color:#141a26}" +
    // 날짜 칩 한 줄로 작게
    "#main .dates{margin-bottom:10px}#main .date{padding:5px 11px!important;border-radius:999px!important;font-size:12.5px!important;line-height:1.3}" +
    "#main .date b{display:inline!important;font-size:13.5px!important;margin-right:3px}" +
    "#backbtn.root{display:none!important}#backbtn{padding:9px 14px!important;font-size:14px!important}" +
    // 🫥 10/31 B7: 읽으려고 아래로 내리는 동안엔 「보내기」「뒤로」를 아래로 숨김 — 글자를 가리지 않게 (위로 살짝 올리거나 맨 위·맨 아래면 다시)
    "#backbtn,#opbtn{transition:transform .25s ease,opacity .25s ease!important}" +
    "html.fab-hide #backbtn,html.fab-hide #opbtn{transform:translateY(140%)!important;opacity:0!important;pointer-events:none!important}" +
    "";
  document.head.appendChild(css);
  (function(){
    var D = document.documentElement, lastY = window.scrollY;
    window.addEventListener("scroll", function(){
      var y = window.scrollY, dy = y - lastY, end = y + window.innerHeight >= document.documentElement.scrollHeight - 40;
      if (y < 0 || y > document.documentElement.scrollHeight - window.innerHeight - 4) return;   // 11/03 맨 위·아래 튕김 구간은 무시(단추가 들락날락 흔들리던 것)
      if (y < 80 || end || dy < -30) D.classList.remove("fab-hide");
      else if (dy > 30) D.classList.add("fab-hide");
      if (Math.abs(dy) > 30) lastY = y;
    }, {passive: true});
  })();
  if (window.cur) try { window.drawTabs(); } catch(x) {}
})();
;
/* ======== vvfix.js ======== */
/* 📱 11/02 사용자 「밑에 메뉴 화면이 왜 고정 안 되고 떠 있니」
   iOS 26 사파리·홈 화면 앱 버그: 글자 칸(검색·제안서 입력 등)에서 키보드를 열었다 닫으면 visualViewport.offsetTop 이 0으로 안 돌아와
   화면에 붙어 있어야 할 것들(아래 탭 바·위 성적 띠·상태 표시줄 가림막)이 어긋나 떠 보임 (WebKit 297779 · Apple 포럼 800154).
   → 실제로 보이는 영역(visualViewport)과 어긋난 만큼만 되돌려 붙임. 어긋남이 없으면(정상 기기) 0 이라 아무것도 안 바뀜.
   키보드가 열려 있는 동안·두 손가락으로 확대한 동안은 건드리지 않음. */
(function(){
  var vv = window.visualViewport, D = document.documentElement;
  if (!vv) return;
  var css = document.createElement("style");
  css.textContent =
    "#bnav,#opbtn,.ch-toast{translate:0 var(--vvb,0px)}" +
    "#sbcover,header,.po-stk,.fold-jump{translate:0 var(--vvt,0px)}";
  document.head.appendChild(css);
  var lb = null, lt = null, raf = 0;
  function typing(){ var a = document.activeElement; return !!(a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable) && !/^(button|checkbox|radio|range|submit)$/i.test(a.type || "")); }
  function up(){
    raf = 0;
    var b = 0, t = 0;
    if (!typing() && Math.abs((vv.scale || 1) - 1) < 0.01){
      b = Math.round(vv.offsetTop + vv.height - window.innerHeight);   // 보이는 아래 끝 − 화면 배치 아래 끝 (정상이면 0)
      t = Math.round(vv.offsetTop);                                    // 위쪽이 밀린 만큼 (정상이면 0)
      if (Math.abs(b) < 2 || Math.abs(b) > 320) b = 0;
      if (t < 2 || t > 320) t = 0;
    }
    if (b !== lb){ lb = b; D.style.setProperty("--vvb", b + "px"); }
    if (t !== lt){ lt = t; D.style.setProperty("--vvt", t + "px"); }
  }
  // 11/03 사용자 「스크롤할 때 위아래 고정 칸이 흔들려」 — 스크롤 중엔 아이폰이 주소창·튕김 때문에 보이는 영역 값을 잠깐씩 바꿔
  //   그때마다 따라 움직이던 것이 흔들림이었음 → 스크롤 중엔 손대지 않고, 멈춘 뒤 0.35초 지나 「계속 어긋나 있을 때만」 한 번 맞춤
  var st = null, moving = false;
  function settle(){ st = null; moving = false; var b1 = gap(); setTimeout(function(){ if (!moving && Math.abs(gap() - b1) < 2) soon(); }, 150); }
  function gap(){ return Math.round(vv.offsetTop + vv.height - window.innerHeight); }
  function soon(){ if (moving) return; if (!raf) raf = requestAnimationFrame(up); }
  function onScroll(){ moving = true; clearTimeout(st); st = setTimeout(settle, 350); }
  vv.addEventListener("resize", onScroll);
  vv.addEventListener("scroll", onScroll);
  window.addEventListener("scroll", onScroll, {passive: true});
  window.addEventListener("orientationchange", function(){ setTimeout(up, 400); });
  // 키보드가 닫힌 직후: 화면을 한 번 제자리로 다시 맞추고(같은 위치로 스크롤) 다시 잼
  document.addEventListener("focusout", function(){
    setTimeout(function(){ if (!typing()){ try { window.scrollTo(window.scrollX, window.scrollY); } catch(x) {} up(); } }, 320);
    setTimeout(up, 800);
  });
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) setTimeout(up, 200); });
  up();
  window.__vvfix = function(){ return {vvb: lb, vvt: lt, offTop: vv.offsetTop, vvH: vv.height, inH: window.innerHeight}; };
})();
;
/* ======== clamp.js ======== */
/* CH Investing — 긴 글 접기 (10/12)
   글로만 된 덩어리가 5줄을 넘으면 3줄까지만 보이고 아래는 희미하게 사라짐 → 「더 보기 ▾」 / 「접기 ▴」.
   · 대상: 버튼·차트·표·그림·입력칸이 없는 '글 덩어리'(p · ul · 글만 든 div). 카드 제목은 그대로 둠.
   · 화면이 새로 그려져도 펼친 글은 펼친 채로 (같은 글 첫 40자로 기억).
   · 다른 화면 코드는 건드리지 않음 — 그려진 뒤 살펴보고 덧입힘. */
(function(){
  var TEXT_TAGS = {DIV:1, P:1, SPAN:1, B:1, I:1, EM:1, STRONG:1, SMALL:1, A:1, BR:1, UL:1, OL:1, LI:1, SUP:1, SUB:1, MARK:1, U:1, S:1, CODE:1};
  var SKIP = "button,svg,canvas,table,img,input,select,textarea,details,iframe,video,[data-op],[data-pf],[data-foc],[data-goto],[role=button],.bar,.chip,.pill";
  var OPEN = {};                 // 펼친 글
  var SHOW = 3, MIN = 4;   // 🎨 11/04 우와: 4줄 넘으면 3줄만 (사용자 「긴 글은 3줄까지만」)         // 10/15: 2줄에서 자르니 어색(「오늘의 판단」 두 줄도 접혔음) → 6줄 넘을 때만, 3줄 보이게

  function key(el){ return (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40); }
  function isText(el){
    if (!TEXT_TAGS[el.tagName]) return false;
    if (el.matches(SKIP) || el.querySelector(SKIP)) return false;
    var all = el.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) if (!TEXT_TAGS[all[i].tagName]) return false;
    // 문장 덩어리만: 칸마다 글자가 넉넉해야 함 (숫자 목록·표 같은 줄은 칸이 많고 글이 짧음)
    var len = (el.textContent || "").replace(/\s+/g, " ").trim().length;
    if (len / (all.length + 1) < 28) return false;
    // 띄어쓰기 있는 긴 문장이 하나는 있어야 함
    var ok = false, w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { var v = n.nodeValue.trim(); if (v.length >= 30 && v.split(" ").length >= 5) { ok = true; break; } }
    return ok;
  }
  function lh(el){ var cs = getComputedStyle(el), v = parseFloat(cs.lineHeight); return isNaN(v) ? parseFloat(cs.fontSize) * 1.45 : v; }

  function clamp(el){
    if (el.dataset.clp) return;
    var L = lh(el), h = el.scrollHeight;
    if (h < L * MIN + 2) return;
    var k = key(el); if (!k) return;
    el.dataset.clp = "1";
    var max = Math.round(L * SHOW + 2);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "clp-btn";
    var set = function(open){
      el.classList.toggle("clp", !open); el.classList.toggle("clp-open", open);
      el.style.maxHeight = open ? "" : max + "px";
      btn.textContent = open ? "접기 ▴" : "더 보기 ▾";
    };
    btn.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); var o = !OPEN[k]; OPEN[k] = o; set(o);
      if (!o){ var r = el.getBoundingClientRect(); if (r.top < 60) el.scrollIntoView({block: "start", behavior: "smooth"}); } };
    el.insertAdjacentElement("afterend", btn);
    el.__clpSet = function(all){ set(all || !!OPEN[k]); };
    set(allOn() || !!OPEN[k]);
  }
  // A10-5 (10/14): 「📖 전체」 스위치 — 켜져 있으면 새로 접힐 글도 펼친 채로 (window.CLAMP_ALL 이 참을 돌려줄 때)
  function allOn(){ try { return !!(window.CLAMP_ALL && window.CLAMP_ALL()); } catch(x) { return false; } }
  window.clampAll = function(){ var a = allOn(); [].forEach.call(document.querySelectorAll("[data-clp]"), function(el){ if (el.__clpSet) el.__clpSet(a); }); };

  function scan(root){
    var cand = (root || document).querySelectorAll("main p, main ul, main div, #sheet p, #sheet ul, #sheet div");
    for (var i = 0; i < cand.length; i++){
      var el = cand[i];
      if (el.dataset.clp || el.closest(".clp,.clp-open,.no-clp,nav,header,.tabbar,.tt-x,.tip,.toast")) continue;
      if (el.matches("section,.card") || !el.offsetParent) continue;
      if ((el.textContent || "").length < 140) continue;
      if (!isText(el)) continue;
      var p = el.parentElement;                        // 가장 바깥 글 덩어리만 (카드 자체는 제외)
      if (p && !p.matches("section,.card,main,#sheet,.sh-body") && isText(p) && (p.textContent || "").length < (el.textContent || "").length * 1.6) continue;
      clamp(el);
    }
  }
  var t = null, last = 0;     // 묶어서 한 번에 — 자주 바뀌는 화면이어도 0.6초에 한 번은 반드시 살핌
  function later(){ if (t) return; var w = Math.max(250, 600 - (Date.now() - last));
    t = setTimeout(function(){ t = null; last = Date.now(); try { scan(); } catch(e) {} }, w); }
  var st = document.createElement("style");
  st.textContent = ".clp{overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 66%,transparent);mask-image:linear-gradient(to bottom,#000 66%,transparent)}" +
    ".clp-btn{display:block;margin:2px 0 6px auto;padding:3px 10px;border:1px solid var(--line);border-radius:999px;background:var(--panel2);color:var(--sub);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent}";
  document.head.appendChild(st);
  // 새로 그려질 때 + 숨어 있던 칸이 보일 때(탭·접기 전환은 class/hidden/style 만 바뀜)
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var m = ms[i];
      if (m.type === "childList" ? m.addedNodes.length : !(m.target.dataset && m.target.dataset.clp)) { later(); return; } } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "style", "open"]});
  window.addEventListener("resize", later); window.addEventListener("hashchange", later); document.addEventListener("click", later, true);
  later();
})();
;
/* ======== ticker.js ======== */
/* CH Investing — 미국 종목 이름 밑에 티커 (10/13 사용자: "앞으로 모든 미국 종목들은 밑에 종목티커 달아, 전체 어플 다")
   종목 화면을 여는 모든 곳([data-op] · openOP('…') 링크 · 종목 카드 .nm2)을 살펴, 미국 티커(영문 1~5자)인데
   보이는 글에 티커가 없으면 작은 글씨로 티커를 붙인다. 긴 줄(카드 제목)은 아래 줄에, 칩·한 줄짜리는 옆에.
   한국(.KS/.KQ)·일본(.T)·홍콩(.HK)·중국(.SS/.SZ)은 그대로. 다른 화면 코드는 건드리지 않음 — 그려진 뒤 덧입힘. */
(function(){
  var US = /^[A-Z][A-Z0-9.\-]{0,6}$/;
  function tick(el){
    var t = el.getAttribute("data-op"); if (t) return t;
    var h = el.getAttribute("href") || el.getAttribute("onclick") || "";
    var m = h.match(/openOP\(\s*['"]([^'"]+)['"]/); return m ? m[1] : null;
  }
  function isUS(t){ return US.test(t) && !/\.(KS|KQ|T|HK|SS|SZ|KL|TW|L|PA|DE|AS)$/.test(t) && !/^\d/.test(t); }
  function has(el, t){
    var s = (el.innerText || el.textContent || "").toUpperCase(), tt = t.toUpperCase();
    if (s.split(/\s+/).indexOf(tt) >= 0) return true;
    // 단어 단위로 들어 있나 (TOST 안의 'OST' 같은 우연 제외)
    var re = new RegExp("(^|[^A-Z0-9])" + tt.replace(/[.\-]/g, "\\$&") + "($|[^A-Z0-9])");
    if (re.test(s)) return true;
    // A2 (10/13): 글자 조각마다 따로 봄 — 순위 숫자(「1」)와 붙어 「1INSM」으로 읽혀 이름=티커인데 티커 줄이 한 번 더 붙던 것
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) if (re.test(String(n.nodeValue || "").toUpperCase())) return true;
    return false;
  }
  function add(el, t){
    if (el.dataset.tk) return; el.dataset.tk = "1";
    if (el.querySelector(".tk2")) return;
    var cs = getComputedStyle(el), inline = /inline/.test(cs.display) || el.tagName === "SPAN" || el.classList.contains("hm-chip") || el.classList.contains("po-kc") || el.classList.contains("po-tk");
    var s = document.createElement("small"); s.className = "tk2" + (inline ? " in" : ""); s.textContent = t;
    // 카드 제목 줄(.nm2 등)은 굵은 이름 바로 뒤에
    var b = el.querySelector(":scope > b, :scope > a > b, :scope > .fo-nm > b, :scope > .n > b");
    if (b && !inline) b.insertAdjacentElement("afterend", s); else el.appendChild(s);
  }
  function scan(){
    var els = document.querySelectorAll('[data-op], a[href*="openOP("], [onclick*="openOP("]');
    for (var i = 0; i < els.length; i++){
      var el = els[i], t = tick(el); if (!t || !isUS(t) || el.dataset.tk) continue;
      if (el.closest("nav,header,.tabbar,#sheet .sh-top")) continue;
      if (has(el, t)) { el.dataset.tk = "1"; continue; }
      add(el, t);
    }
    // 종목 카드 제목(.nm2): 티커가 .cd 로 있지만 한 줄에 잘려 안 보임 → 아래 줄로 (CSS) · 없으면 붙임
    var nm = document.querySelectorAll(".cc .nm2");
    for (var j = 0; j < nm.length; j++){
      var n = nm[j], cd = n.querySelector(".cd"); if (n.dataset.tk) continue;
      if (cd){ n.dataset.tk = "1"; continue; }
    }
  }
  var t = null;
  function later(){ if (t) return; t = setTimeout(function(){ t = null; try { scan(); } catch(e) {} }, 300); }
  var st = document.createElement("style");
  st.textContent = ".tk2{display:block;font-size:12.5px;line-height:1.25;color:var(--sub);font-weight:500;letter-spacing:.2px;margin-top:1px}" +
    ".tk2.in{display:inline;margin:0 0 0 5px;font-size:12.5px;opacity:.85}" +
    ".cc .nm2{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.25}.cc .nm2 .cd{display:block;margin:1px 0 0;font-size:12.5px}" +
    ".po-kc .tk2.in,.hm-chip .tk2.in{font-size:12.5px}";
  document.head.appendChild(st);
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length && !(ms[i].target.classList && ms[i].target.classList.contains("tk2"))) { later(); return; } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true});
  later();
})();
;
/* ======== ux1013.js ======== */
/* CH Investing — 10/13 아이디어 보고 A1~A5 (사용자: "A 1번부터 5번까지 다 실행해")
   A1 🔙 「뒤로」 버튼: 아래로 스크롤하면 숨고, 위로 올리면 다시 (목록 숫자를 가리지 않게)
   A2 🏷 이름 = 티커면 아래 티커 줄 안 붙임 → ticker.js
   A3 🧭 시장 탭 맨 위 목차 칩 (누르면 그 카드로 · 위에 붙어 다님)
   A4 🕰 포트 탭 「과거로 돌려 보기」 — 해를 누르면 💼·⚡·🎯·S&P 그 해 성적·가장 깊게 빠진 폭 (market/skel_bt.json)
   A5 👆 종목 이름 길게 누르면 미리보기 (1년 주간 그래프·52주 위치·신호·포트) — 화면 이동 없이 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; d = d == null ? 1 : d; return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function J(name){ return getJSON(RAW + name + "?" + Math.floor(Date.now() / 600000), {ttl: 600000}); }
  function hh(){ var h = document.querySelector("header"); return h ? h.offsetHeight : 0; }

  /* ---------- A1 뒤로 버튼: 스크롤 방향 따라 숨김 ---------- */
  var lastY = window.scrollY || 0, acc = 0;
  window.addEventListener("scroll", function(){
    var b = document.getElementById("backbtn"); if (!b) return;
    var y = window.scrollY || 0, d = y - lastY; lastY = y;
    if (y < 0 || y > document.documentElement.scrollHeight - window.innerHeight - 4) return;   // 11/03 튕김 구간 무시
    if ((d > 0) !== (acc > 0)) acc = 0;
    acc += d;
    var nearEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 40;
    if (y < 80 || nearEnd || acc < -24) b.classList.remove("hid");
    else if (acc > 24) b.classList.add("hid");
  }, {passive: true});

  /* ---------- A3 시장 탭 목차 칩 ---------- */
  var NICE = [[/mk-kick/, "⚡ 킥"], [/mk-focus/, "🎯 집중"], [/^mkid$/, "💡 새 규칙"], [/mk-lead2/, "🔥 돈 몰리는 곳"], [/mk-us/, "🇺🇸 미국장"]];
  function label(sec){
    for (var i = 0; i < NICE.length; i++) if (NICE[i][0].test(sec.className) || NICE[i][0].test(sec.id)) return NICE[i][1];
    var t = ((sec.innerText || "").split("\n")[0] || "").replace(/ⓘ/g, "").trim();
    if (/할 일/.test(t)) return "✅ 할 일";
    if (/오늘의 숫자/.test(t)) return "🔢 숫자";
    if (/자산 배분/.test(t)) return "💼 배분";
    if (/판단/.test(t)) return "🧠 판단";
    if (/더 보기/.test(t)) return "📂 더 보기";
    t = t.replace(/^(\S+)\s+(오늘의|지금|전일)\s+/, "$1 ");
    return t.length > 9 ? t.slice(0, 9) : t;
  }
  function mkToc(){
    if (window.cur !== "market") return;
    var body = document.getElementById("body"); if (!body || (body.firstElementChild && body.firstElementChild.classList.contains("loading"))) return;
    var secs = [].filter.call(body.querySelectorAll("section.card, .xs-more"), function(s){
      if (s.closest(".xs-more") && !s.classList.contains("xs-more")) return false;   // 접힌 「더 보기」 안은 하나로
      if (!s.offsetHeight || s.offsetHeight < 60) return false;
      return (s.innerText || "").trim().length > 8;
    });
    if (secs.length < 3) return;
    var sig = secs.map(function(s){ return label(s); }).join("|");
    var bar = document.getElementById("mktoc");
    if (bar && bar.dataset.sig === sig) return;
    if (!bar){ bar = document.createElement("div"); bar.id = "mktoc"; bar.className = "fold-jump mk-toc"; body.parentNode.insertBefore(bar, body); }
    bar.dataset.sig = sig;
    var seen = {};
    // 10/15: 칩은 안쪽 스크롤 칸(.mk-tsc)에 — 오른쪽 「📖 전체 펼치기」가 칩을 덮지 않게
    bar.innerHTML = '<div class="mk-tsc">' + secs.map(function(s, i){ var l = label(s); if (seen[l]) return ""; seen[l] = 1;
      if (!s.id) s.id = "mkt" + i; return '<button data-j="' + e(s.id) + '">' + e(l) + '</button>'; }).join("") + '</div>';
    var sc = bar.querySelector(".mk-tsc");
    [].forEach.call(sc.querySelectorAll("button"), function(bt){ bt.onclick = function(){
      var el = document.getElementById(bt.dataset.j); if (!el) return;
      if (window.unclamp) try { unclamp(el.querySelector(".xs-clamp") || el); } catch(x) {}
      [].forEach.call(sc.children, function(x){ x.classList.toggle("on", x === bt); }); sc.scrollLeft = bt.offsetLeft - sc.offsetLeft - 60;
      var y = el.getBoundingClientRect().top + window.scrollY - (hh() + bar.offsetHeight + 8);
      window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); }; });
    if (window.mkTocExtra) try { mkTocExtra(bar); } catch(x) {}   // A10-5 📝 요약 / 📖 전체 (ux1014.js)
  }
  var tt = null;
  new MutationObserver(function(){ if (window.cur === "port" && !document.getElementById("potm") && document.getElementById("pobody")) setTimeout(tmMount, 0);
    if (window.cur !== "market" || tt) return; tt = setTimeout(function(){ tt = null; try { mkToc(); } catch(x) {} }, 500); })
    .observe(document.getElementById("main") || document.body, {childList: true, subtree: true});

  /* ---------- A4 포트 탭 「과거로 돌려 보기」 ---------- */
  var SK = null, YSEL = "2022";
  var ROWS = [["base", "💼 기본", "#7c9cff"], ["kick", "⚡ 킥 기본 칸", "#f2a93b"], ["conc", "🎯 집중", "#24c08a"], ["spy", "S&P500", "#8a94a8"]];
  function yrOf(k, y){
    if (!SK) return null;
    var src = k === "spy" ? SK.spy : (function(){ var r = SK.roles && SK.roles[k]; return r && (r.live_row || r.pick); })();
    if (!src) return null;
    var p = y >= "2017" ? src.oos : src.is; if (!p || !p.yr || p.yr[y] == null) return null;
    return {r: p.yr[y], dd: p.yr_mdd ? p.yr_mdd[y] : null};
  }
  var MARK = {"2008": "금융위기", "2011": "미 신용등급 강등", "2015": "중국 쇼크", "2018": "금리 인상·무역전쟁", "2020": "코로나", "2022": "금리 급등"};
  function tmDraw(){
    var box = document.getElementById("potm"); if (!box || !SK) return;
    var years = Object.keys((SK.spy.is || {}).yr || {}).concat(Object.keys((SK.spy.oos || {}).yr || {})).sort();
    if (years.indexOf(YSEL) < 0) YSEL = years[years.length - 1];
    var vals = ROWS.map(function(r){ return yrOf(r[0], YSEL); });
    var mx = Math.max.apply(null, vals.map(function(v){ return v ? Math.max(Math.abs(v.r), Math.abs(v.dd || 0)) : 0; }).concat([5]));
    var amt = 1000;   // 만 원
    var best = null; ROWS.forEach(function(r, i){ if (r[0] !== "spy" && vals[i] && (best == null || vals[i].r > vals[best].r)) best = i; });
    box.innerHTML = '<div class="tm-h"><b>🕰 과거로 돌려 보기</b><small>지금 규칙을 그 해에 썼다면</small></div>' +
      '<div class="tm-ys">' + years.map(function(y){ return '<button data-y="' + y + '" class="' + (y === YSEL ? "on" : "") + (MARK[y] ? " mk" : "") + (y < "2017" ? " is" : "") + '">' + y.slice(2) + (MARK[y] ? "<i>●</i>" : "") + '</button>'; }).join("") + '</div>' +
      '<div class="tm-t"><b>' + YSEL + '년</b>' + (MARK[YSEL] ? ' <span class="tm-mk">' + MARK[YSEL] + '</span>' : '') + '<small>' + (YSEL < "2017" ? "규칙을 고른 기간" : "규칙 고를 때 안 본 기간") + (YSEL === years[0] ? " · 7월부터" : "") + (YSEL === years[years.length - 1] ? " · 올해는 " + e(String(SK.to || "").slice(5).replace("-", "/")) + "까지" : "") + '</small></div>' +
      ROWS.map(function(r, i){ var v = vals[i]; if (!v) return '<div class="tm-r"><span class="n">' + r[1] + '</span><span class="mut">자료 없음</span></div>';
        var w = Math.abs(v.r) / mx * 50, wd = v.dd != null ? Math.abs(v.dd) / mx * 50 : 0, end = Math.round(amt * (1 + v.r / 100));
        return '<div class="tm-r' + (i === best ? " best" : "") + '"><span class="n">' + r[1] + '</span>' +
          '<span class="bar"><i class="z"></i><i class="f" style="' + (v.r >= 0 ? "left:50%" : "right:50%") + ';width:' + w.toFixed(1) + '%;background:' + r[2] + '"></i>' +
          (v.dd != null ? '<i class="d" style="right:50%;width:' + wd.toFixed(1) + '%"></i>' : '') + '</span>' +
          '<span class="v"><b class="' + cls(v.r) + '">' + sg(v.r) + '</b></span>' +
          '<span class="w">' + (v.dd != null ? "가장 깊게 " + sg(v.dd, 0) + " · " : "") + '1,000만 원 → <b>' + end.toLocaleString("ko-KR") + '만</b></span></div>'; }).join("") +
      '<p class="tm-n">막대 = 그 해 수익 · 옅은 막대 = 그 해 고점에서 가장 깊게 빠진 폭. 🦴 변동성 맞춤까지 넣은 지금 규칙 · 비용 포함 · 달러 기준. ⚡는 기본 칸만(돌파·고래 칸 빼고). 과거 계산이라 미래를 보장하지 않아요.</p>';
    [].forEach.call(box.querySelectorAll(".tm-ys button"), function(b){ b.onclick = function(){ YSEL = b.dataset.y; tmDraw();
      var on = box.querySelector(".tm-ys .on"); if (on && on.scrollIntoView) try { on.scrollIntoView({inline: "center", block: "nearest"}); } catch(x) {} }; });
  }
  function tmMount(){
    var pb = document.getElementById("pobody"); if (!pb || document.getElementById("potm")) return;
    var s = document.createElement("section"); s.className = "card tm-c"; s.id = "potm";
    s.innerHTML = '<div class="loading">과거 성적 불러오는 중…</div>';
    pb.parentNode.insertBefore(s, pb.nextSibling);
    var addChip = function(){ var jb = document.querySelector("#main .fold-jump:not(.mk-toc)"); if (!jb || jb.querySelector('[data-j="potm"]')) return !!jb;
      var b = document.createElement("button"); b.dataset.j = "potm"; b.textContent = "🕰 과거";
      b.onclick = function(){ var y = s.getBoundingClientRect().top + window.scrollY - (hh() + jb.offsetHeight + 8); window.scrollTo({top: y, behavior: "smooth"}); };
      jb.appendChild(b); return true; };
    var tries = 0; (function again(){ if (!addChip() && ++tries < 20) setTimeout(again, 500); })();
    (SK ? Promise.resolve(SK) : J("skel_bt.json")).then(function(j){ SK = j; tmDraw();
      var on = s.querySelector(".tm-ys .on"); if (on) s.querySelector(".tm-ys").scrollLeft = on.offsetLeft - 120; })
      .catch(function(){ s.remove(); });
  }
  var _pi = window.portInit;
  if (_pi) window.portInit = function(){ var r = _pi.apply(this, arguments); setTimeout(tmMount, 0); return r; };

  /* ---------- A5 길게 눌러 미리보기 ---------- */
  var SEL = '[data-op], a[href*="openOP("], [onclick*="openOP("]';
  function symOf(el){
    var t = el.getAttribute("data-op"); if (t) return t;
    var h = el.getAttribute("href") || el.getAttribute("onclick") || "";
    var m = h.match(/openOP\(\s*['"]([^'"]+)['"]/); return m ? m[1] : null;
  }
  var UNIT = {KR: "원", JP: "엔", US: "달러", HK: "홍콩달러", CN: "위안"};
  var SIGX = null;
  function closePv(){ var p = document.getElementById("lpv"); if (p) p.remove(); }
  function openPv(code){
    closePv();
    var wrap = document.createElement("div"); wrap.id = "lpv";
    wrap.innerHTML = '<div class="lpv-bg"></div><div class="lpv-s"><div class="lpv-grab"></div><div class="lpv-b"><div class="loading">' + e(code) + ' 불러오는 중…</div></div></div>';
    document.body.appendChild(wrap);
    wrap.querySelector(".lpv-bg").onclick = closePv;
    var body = wrap.querySelector(".lpv-b");
    var idx = (typeof opLoadIdx === "function") ? opLoadIdx().catch(function(){}) : Promise.resolve();
    idx.then(function(){
      var r = (typeof opFind === "function") ? opFind(code) : null, sym = r ? r.sym : code;
      var sh = opShard(sym);
      return Promise.all([
        OPP[sh] ? Promise.resolve(OPP[sh]) : getJSON(OPD + "p/" + sh + ".json").then(function(j){ OPP[sh] = j; return j; }).catch(function(){ return {}; }),
        SIGX ? Promise.resolve(SIGX) : J("sigindex.json").then(function(j){ SIGX = j.ix || {}; return SIGX; }).catch(function(){ return {}; })
      ]).then(function(a){
        if (!document.getElementById("lpv")) return;
        var p = (a[0] || {})[sym], ix = a[1] || {}, S = String(sym).toUpperCase(), c0 = S.replace(/\.(KS|KQ)$/, "");
        var x = ix[S] || ix[c0] || ix[c0.replace(/^0+/, "")] || null, u = UNIT[r && r.mkt] || "";
        var h = '<div class="lpv-t"><b>' + e(r ? r.name : code) + '</b><small>' + e(sym) + (r && r.etf ? ' · ETF' : '') + '</small></div>';
        if (p){
          var chg = (p[1] / p[2] - 1) * 100, pos = p[3] > p[4] ? (p[1] - p[4]) / (p[3] - p[4]) * 100 : null;
          h += '<div class="lpv-px"><b>' + fmtPrice(p[1], u) + '</b><span class="' + cls(chg) + '">' + sg(chg, 2) + '</span><small>' + e(String(p[0]).slice(5).replace("-", "/")) + ' 종가</small></div>' +
            '<div class="lpv-ch">' + opChart(p, u) + '</div>' +
            (pos != null ? '<div class="lpv-rg"><small>52주 바닥</small><span class="t"><i style="left:' + Math.max(0, Math.min(100, pos)).toFixed(0) + '%"></i></span><small>꼭대기</small></div>' +
              '<div class="lpv-rgn">1년 범위에서 <b>' + pos.toFixed(0) + '%</b> 자리</div>' : '');
        } else h += '<div class="spark-empty">가격 자료가 아직 없어요</div>';
        var parts = [];
        if (x && x.tags) parts.push('<span class="lpv-tg">' + e(x.tags) + ' 신호' + (x.last ? ' · ' + e(String(x.last).slice(5).replace("-", "/")) : '') + '</span>');
        if (x && x.kick != null) parts.push('<span>⚡ 킥에 ' + (+x.kick).toFixed(1) + '%</span>');
        if (x && x.port) parts.push('<span>💼 포트 「' + e(x.port) + '」</span>');
        if (x && x.focus) parts.push('<span>🎯 집중 「' + e(x.focus) + '」</span>');
        if (x && x.bet) parts.push('<span>🧠 ' + e(x.bet) + '</span>');
        h += '<div class="lpv-sg">' + (parts.length ? parts.join("") : '<span class="mut">오늘 걸린 신호 없음</span>') + '</div>' +
          '<div class="lpv-a"><button class="btn lpv-go">📄 종목리포트 열기</button><button class="btn lpv-x">닫기</button></div>';
        body.innerHTML = h;
        body.querySelector(".lpv-go").onclick = function(){ closePv(); openOP(code); };
        body.querySelector(".lpv-x").onclick = closePv;
      });
    }).catch(function(){ body.innerHTML = '<div class="spark-empty">불러오지 못했어요</div>'; });
  }
  var lp = null, sx = 0, sy = 0, fired = 0, pvTouch = false;
  document.addEventListener("touchstart", function(ev){
    pvTouch = false;
    var el = ev.target.closest && ev.target.closest(SEL); if (!el || ev.touches.length > 1) return;
    var code = symOf(el); if (!code) return;
    sx = ev.touches[0].clientX; sy = ev.touches[0].clientY;
    clearTimeout(lp); lp = setTimeout(function(){ lp = null; fired = Date.now(); pvTouch = true; if (navigator.vibrate) try { navigator.vibrate(12); } catch(x) {} openPv(code); }, 480);
  }, {passive: true});
  document.addEventListener("touchmove", function(ev){ if (!lp) return; var t = ev.touches[0]; if (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10){ clearTimeout(lp); lp = null; } }, {passive: true});
  document.addEventListener("touchend", function(){ if (lp){ clearTimeout(lp); lp = null; } else if (pvTouch){ pvTouch = false; fired = Date.now(); } }, {passive: true});
  document.addEventListener("touchcancel", function(){ if (lp){ clearTimeout(lp); lp = null; } }, {passive: true});
  // 길게 누른 뒤 손을 떼면 생기는 클릭은 버림 (종목 화면으로 넘어가지 않게)
  document.addEventListener("click", function(ev){ if (fired && Date.now() - fired < 700){ ev.preventDefault(); ev.stopPropagation(); fired = 0; } }, true);
  // 컴퓨터: 오른쪽 클릭 · 안드로이드: 길게 누르기 메뉴 대신
  document.addEventListener("contextmenu", function(ev){
    var el = ev.target.closest && ev.target.closest(SEL); if (!el) return; var code = symOf(el); if (!code) return;
    ev.preventDefault(); if (Date.now() - fired > 900){ fired = Date.now(); openPv(code); } });
  document.addEventListener("keydown", function(ev){ if (ev.key === "Escape") closePv(); });

  /* ---------- 모양 ---------- */
  var st = document.createElement("style");
  st.textContent = [
    "#backbtn{transition:transform .22s ease,opacity .22s ease}#backbtn.hid{transform:translateY(170%);opacity:0;pointer-events:none}",
    ".mk-toc{margin-top:2px}.mk-toc button.on{border-color:var(--c,#7c9cff);color:var(--c,#7c9cff)}",
    ".tm-c{padding:14px}.tm-h{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}.tm-h b{font-size:16px}.tm-h small{color:var(--sub);font-size:12.5px}",
    ".tm-ys{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:0 -14px 10px;padding:2px 14px}.tm-ys::-webkit-scrollbar{display:none}",
    ".tm-ys button{flex:none;position:relative;min-width:38px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:6px 0;font:inherit;font-size:13px;font-variant-numeric:tabular-nums;cursor:pointer}",
    ".tm-ys button.is{opacity:.75}.tm-ys button i{position:absolute;top:1px;right:4px;font-size:7px;color:#e5534b;font-style:normal}",
    ".tm-ys button.on{background:var(--c,#7c9cff);border-color:var(--c,#7c9cff);color:#111;font-weight:700;opacity:1}",
    ".tm-t{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin:2px 0 8px}.tm-t b{font-size:20px}.tm-t small{color:var(--sub);font-size:12.5px;flex-basis:100%}",
    ".tm-mk{font-size:12.5px;padding:2px 8px;border-radius:999px;background:rgba(229,83,75,.15);color:#e5534b}",
    ".tm-r{display:grid;grid-template-columns:96px 1fr 62px;row-gap:3px;column-gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}",
    ".tm-r .n{font-size:13px;font-weight:600}.tm-r.best .n::after{content:' 👑';font-size:12.5px}",
    ".tm-r .bar{position:relative;height:14px}.tm-r .bar i{position:absolute;top:0;bottom:0;border-radius:4px}.tm-r .bar .z{left:50%;width:1px;background:var(--line);border-radius:0}",
    ".tm-r .bar .d{top:9px;bottom:-2px;background:rgba(229,83,75,.28)}",
    ".tm-r .v{text-align:right}.tm-r .v b{font-size:15px;font-variant-numeric:tabular-nums}",
    ".tm-r .w{grid-column:1/4;font-size:12.5px;color:var(--sub);text-align:right;font-variant-numeric:tabular-nums}.tm-r .w b{color:var(--text);font-weight:600}",
    ".tm-n{font-size:12.5px;color:var(--sub);margin:8px 0 0;line-height:1.5}",
    "#lpv{position:fixed;inset:0;z-index:200}#lpv .lpv-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);animation:lpvf .18s ease}",
    "#lpv .lpv-s{position:absolute;left:0;right:0;bottom:0;max-height:78vh;overflow:auto;background:var(--panel);border-top-left-radius:20px;border-top-right-radius:20px;border:1px solid var(--line);padding:8px 16px calc(env(safe-area-inset-bottom) + 16px);box-shadow:0 -18px 40px -12px rgba(0,0,0,.5);animation:lpvu .22s cubic-bezier(.2,.8,.2,1)}",
    ".lpv-grab{width:38px;height:4px;border-radius:4px;background:var(--line);margin:0 auto 10px}",
    ".lpv-t b{font-size:18px}.lpv-t small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}",
    ".lpv-px{display:flex;align-items:baseline;gap:8px;margin:8px 0 4px}.lpv-px b{font-size:22px;font-variant-numeric:tabular-nums}.lpv-px small{color:var(--sub);font-size:12.5px;margin-left:auto}",
    ".lpv-ch svg{width:100%;height:auto;display:block}.lpv-ch .muted,.lpv-ch>div{font-size:12.5px;color:var(--sub);margin-top:4px}",
    ".lpv-rg{display:flex;align-items:center;gap:8px;margin-top:8px}.lpv-rg small{font-size:12.5px;color:var(--sub);flex:none}.lpv-rg .t{position:relative;flex:1;height:6px;border-radius:6px;background:linear-gradient(90deg,#1f4e9c,#8a94a8,#c0392b)}",
    ".lpv-rg .t i{position:absolute;top:-4px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--text);border:2px solid var(--panel)}",
    ".lpv-rgn{font-size:12.5px;color:var(--sub);text-align:center;margin-top:4px}",
    ".lpv-sg{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.lpv-sg span{font-size:12.5px;padding:4px 10px;border-radius:999px;background:var(--panel2);border:1px solid var(--line)}.lpv-sg .mut{background:none;border:0;color:var(--sub);padding:0}",
    ".lpv-a{display:flex;gap:8px}.lpv-a .btn{flex:1;padding:11px 0;font-size:14px;text-align:center}.lpv-go{font-weight:700}",
    "@keyframes lpvu{from{transform:translateY(100%)}to{transform:none}}@keyframes lpvf{from{opacity:0}to{opacity:1}}",
    "[data-op],a[href*='openOP('],[onclick*='openOP(']{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}"
  ].join("\n");
  document.head.appendChild(st);
})();
;
/* ======== story.js ======== */
/* CH Investing — 🎞 아침 30초 스토리 (10/14 A9-4, 사용자 「다 해 보자」)
   홈 날짜 줄의 「▶ 30초」 → 전체 화면에 카드 한 장씩: 어제 결과 → 포트 → 킥 → 오늘 집중 → 🔮 오늘 예고
   · 위에 진행 막대(장 수만큼) · 화면 오른쪽 톡 = 다음, 왼쪽 톡 = 앞 · 6초 자동 넘김 · 마지막 장에 📤 공유
   · 넘기기는 「톡」만(아이폰 가장자리 스와이프 = 뒤로가기와 안 부딪히게) · ✕ 로 닫음 · 홈 카드 HTML 을 그대로 복사하니 새 자료 없음 */
(function(){
  var SEC = 6000, timer = null, idx = 0, pages = [], box = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function pick(){
    var b = document.getElementById("hmbody"); if (!b) return [];
    var out = [], q = function(sel){ return b.querySelector(sel); };
    var grade = q('section[data-goto="market"]'), port = q('section[data-goto="port~pohero"]'), kick = q('section[data-goto="port~pokick"]'), focus = q('section[data-goto="market~mkfo"]');
    if (grade){ var g = grade.cloneNode(true); var wn = g.querySelector(".hm-wn"); if (wn) wn.remove(); var vs = g.querySelector(".hm-vs"); if (vs) vs.remove(); out.push({t: "어제 예고 → 오늘 결과", el: g}); }
    if (port) out.push({t: "포트", el: port.cloneNode(true)});
    if (kick) out.push({t: "킥", el: kick.cloneNode(true)});
    if (focus) out.push({t: "오늘 집중", el: focus.cloneNode(true)});
    if (grade){ var wn2 = grade.querySelector(".hm-wn"); if (wn2){ var s = document.createElement("section"); s.className = "card hm-c";
      s.innerHTML = '<div class="hm-h"><span class="hm-i">🔮</span><div><b>오늘의 예고</b><small>내일 아침 채점 · 👍👎 로 내 표도</small></div></div>'; s.appendChild(wn2.cloneNode(true)); out.push({t: "오늘의 예고", el: s}); } }
    out.forEach(function(p){ [].forEach.call(p.el.querySelectorAll(".hm-sh, .hm-go"), function(x){ x.remove(); }); p.el.removeAttribute("data-goto"); });
    return out;
  }
  function draw(){
    var p = pages[idx]; if (!p) return close();
    box.querySelector(".st-bar").innerHTML = pages.map(function(_, i){ return '<i class="' + (i < idx ? "done" : i === idx ? "on" : "") + '"></i>'; }).join("");
    var body = box.querySelector(".st-body"); body.innerHTML = ""; body.appendChild(p.el.cloneNode(true)); body.scrollTop = 0;
    box.querySelector(".st-n").textContent = (idx + 1) + " / " + pages.length + " · " + p.t;
    var ft = box.querySelector(".st-ft"); ft.innerHTML = idx === pages.length - 1 ? '<button class="hm-sh" data-share="port">📤 카톡으로 공유</button><button class="st-done">다 봤어요 ✓</button>' : '<span class="mut">화면을 톡 치면 다음 · 왼쪽은 앞</span>';
    var dn = ft.querySelector(".st-done"); if (dn) dn.onclick = function(ev){ ev.stopPropagation(); close(); };
    arm();
  }
  function arm(){ clearTimeout(timer); timer = setTimeout(function(){ if (idx < pages.length - 1){ idx++; draw(); } else clearTimeout(timer); }, SEC); }
  function close(){ clearTimeout(timer); if (box){ box.remove(); box = null; } document.documentElement.classList.remove("st-lock"); }
  window.hmStory = function(){
    close();
    pages = pick();
    if (!pages.length){ if (window.P && window.P.toast) window.P.toast("아직 보여 줄 카드가 없어요"); return; }
    idx = 0;
    box = document.createElement("div"); box.id = "hmst";
    box.innerHTML = '<div class="st-bar"></div><div class="st-top"><span class="st-n"></span><button class="st-x" aria-label="닫기">✕</button></div><div class="st-body"></div><div class="st-ft"></div>';
    document.body.appendChild(box);
    document.documentElement.classList.add("st-lock");
    box.querySelector(".st-x").onclick = function(ev){ ev.stopPropagation(); close(); };
    // 톡: 오른쪽 70% = 다음, 왼쪽 30% = 앞 — 버튼·표(👍👎)·공유는 그대로 눌림
    box.addEventListener("click", function(ev){
      if (ev.target.closest("button, [data-share], [data-vote], a")) return;
      ev.preventDefault(); ev.stopPropagation();
      var x = (ev.clientX || 0) / Math.max(1, window.innerWidth);
      if (x < 0.3){ if (idx > 0){ idx--; draw(); } else arm(); }
      else { if (idx < pages.length - 1){ idx++; draw(); } else close(); }
    }, true);
    draw();
  };
  var st = document.createElement("style");
  st.textContent = [
    "#hmst{position:fixed;inset:0;z-index:80;background:var(--bg);display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 10px) 12px calc(env(safe-area-inset-bottom) + 12px)}",
    ".st-lock,.st-lock body{overflow:hidden}",
    ".st-bar{display:flex;gap:4px;height:4px;margin:0 2px 10px}.st-bar i{flex:1;background:var(--line);border-radius:2px;overflow:hidden;position:relative}.st-bar i.done{background:var(--text)}",
    ".st-bar i.on::after{content:'';position:absolute;left:0;top:0;bottom:0;width:0;background:var(--text);animation:stfill " + SEC + "ms linear forwards}@keyframes stfill{to{width:100%}}",
    ".st-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.st-n{font-size:12.5px;color:var(--sub);font-weight:700}",
    ".st-x{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;width:32px;height:32px;font-size:15px;cursor:pointer}",
    ".st-body{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column}.st-body .card{margin:auto 0;font-size:1.06em}.st-body .hm-big b{font-size:24px}.st-body .hm-h b{font-size:18px}",
    ".st-ft{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:8px;font-size:12.5px;color:var(--sub)}.st-ft .hm-sh{margin:0}",
    ".st-done{border:0;background:var(--acc,#7c9cff);color:#111;border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}"
  ].join("\n");
  document.head.appendChild(st);
})();
;
/* ======== ux1014.js ======== */
/* CH Investing — 10/14 10시 아이디어 보고 A10 (사용자: "3번 빼고 다 진행")
   A10-1 🟢⚪ 시장판 장중/마감 점은 index.html marketBoard · 여기선 「오늘의 숫자」 카드에 「지금 →」 한 줄
   A10-2 🧵 「며칠째 나오는 이름」 칩 — 🔥 돈 몰리는 곳 카드 맨 위 (archive/x/market_x.json chips: 날짜별 리포트에 나온 종목)
   A10-4 📌 아침판 한 줄 맨 위 띠는 views.js · 미국장 카드 같은 제목 빼기는 plus8.js · 여기선 띠 모양(CSS)
   A10-5 📖 「요약 / 전체」 스위치 — 시장 탭 목차 칩 줄 오른쪽 끝 (clamp.js 글 접기 + simple.js 긴 카드 접기 모두) · 휴대폰에 기억 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function isLatest(){ try { var L = (M && M.cats && M.cats.market) || []; return !!L.length && (!window.curDate || curDate === L[0].id); } catch(x) { return false; } }

  /* ---------- A10-5 요약 / 전체 ---------- */
  window.CLAMP_ALL = function(){ return window.cur === "market" && !!(window.store && store.mkFull); };
  function applyFull(){
    if (window.cur !== "market") return;
    var on = !!store.mkFull, main = document.getElementById("main"); if (!main) return;
    [].forEach.call(main.querySelectorAll("section.card[data-xc]"), function(c){
      var b = c.querySelector(":scope > .xs-cl");
      if (on && c.classList.contains("xs-clamp")){ c.classList.remove("xs-clamp"); c.dataset.xfull = "1"; if (b) b.textContent = "접기 ▴"; }
      else if (!on && c.dataset.xfull){ delete c.dataset.xfull; c.classList.add("xs-clamp"); if (b) b.textContent = "전체 보기 ▾"; }
    });
    if (window.clampAll) clampAll();
  }
  function readMin(){ var b = document.getElementById("body"); var n = b ? (b.innerText || "").replace(/\s+/g, "").length : 0; return Math.max(1, Math.round(n / 500)); }
  window.mkTocExtra = function(bar){
    var bt = bar.querySelector(".mk-full");
    if (!bt){ bt = document.createElement("button"); bt.className = "mk-full"; bar.appendChild(bt);
      bt.onclick = function(ev){ ev.stopPropagation(); store.mkFull = !store.mkFull; try { save(); } catch(x) {} applyFull(); paint(); }; }
    var paint = function(){ bt.innerHTML = (store.mkFull ? "📝 요약으로" : "📖 전체 펼치기") + ' <small>약 ' + readMin() + '분</small>'; bt.classList.toggle("on", !!store.mkFull); };
    paint(); setTimeout(paint, 2500);
  };

  /* ---------- A10-1 오늘의 숫자 「지금 →」 ---------- */
  var KMAP = [[/^S&P ?500/i, "sp500"], [/^코스피\s*\(/, "kospi"], [/^코스닥/, "kosdaq"], [/^나스닥/, "nasdaq"], [/^다우/, "dow"], [/^VIX/i, "vix"],
              [/^(달러[·\/]?원|원\/달러)/, "usdkrw"], [/^미국 10년/, "us10y"], [/^(브렌트 \/ )?WTI|^브렌트/, "wti"], [/^금\b|^금 \(/, "gold"],
              [/^삼성전자/, "samsung"], [/^SK하이닉스/, "hynix"], [/^엔비디아/, "nvidia"], [/^마이크론/, "micron"]];
  function fmtV(k, v){ if (k === "us10y") return v.toFixed(2) + "%"; return Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : v.toLocaleString(undefined, {maximumFractionDigits: 2}); }
  function mdNum(s){ var m = String(s || "").match(/(\d{1,2})\/(\d{1,2})/); return m ? (+m[1]) * 100 + (+m[2]) : null; }
  function kpiNow(){
    var d = window.__LATEST; if (!d || window.cur !== "market" || !isLatest()) return;
    var it = d.items || {}, fT = Date.parse(String(d.fetched_kst || "").replace(" ", "T") + ":00+09:00");
    [].forEach.call(document.querySelectorAll("#mbody .kpis2 .kp:not([data-now])"), function(kp){
      kp.dataset.now = "1";
      var lab = ((kp.querySelector("small") || {}).textContent || "").trim(), key = null;
      for (var i = 0; i < KMAP.length; i++) if (KMAP[i][0].test(lab)) { key = KMAP[i][1]; break; }
      var x = key && it[key]; if (!x || x.value == null || !window.mktState) return;
      var s = mktState(x, fT); if (!s) return;
      var ld = mdNum(lab), xd = mdNum(s.md);
      if (!(s.live || (ld != null && xd != null && xd > ld))) return;      // 리포트 숫자보다 새 값일 때만
      var cp = x.change_pct, c = cp > 0 ? "up" : cp < 0 ? "dn" : "";
      var el = document.createElement("div"); el.className = "kp-now";
      el.innerHTML = '지금 → ' + (key === "wti" && /브렌트/.test(lab) ? "WTI " : "") + '<b class="' + c + '">' + e(fmtV(key, x.value)) + '</b>' + (cp != null ? ' <span class="' + c + '">(' + (cp > 0 ? "+" : "") + cp.toFixed(2) + '%)</span>' : '') +
        ' <span class="mut">' + (s.live ? "🟢 장중" : "⚪ " + e(s.md) + " 마감") + '</span>';
      var b = kp.querySelector("b"); if (b && b.nextElementSibling) b.nextElementSibling.insertAdjacentElement("afterend", el); else kp.appendChild(el);
    });
  }
  document.addEventListener("latest-ready", function(){ setTimeout(kpiNow, 50); });

  /* ---------- A10-2 며칠째 나오는 이름 ---------- */
  var MXP = null;
  function mx(){ if (!MXP) MXP = getJSON("archive/x/market_x.json?" + ((window.M && M.updated) || "")).catch(function(){ MXP = null; return null; }); return MXP; }
  function streaks(MX, id){
    var C = MX && MX.chips; if (!C || !C[id]) return null;
    var byDate = {}, firstId = {};
    Object.keys(C).sort().forEach(function(k){ var d = k.slice(0, 10); (byDate[d] = byDate[d] || {});
      C[k].forEach(function(c){ byDate[d][c[0]] = c[1]; if (!firstId[d + "|" + c[0]]) firstId[d + "|" + c[0]] = k; }); });
    var dates = Object.keys(byDate).sort(), di = dates.indexOf(id.slice(0, 10)); if (di < 0) return null;
    var out = C[id].map(function(c){
      var sym = c[0], n = 0, start = di;
      for (var j = di; j >= 0 && byDate[dates[j]][sym]; j--){ n++; start = j; }
      var win = dates.slice(Math.max(0, di - 6), di + 1), hit = win.filter(function(d){ return byDate[d][sym]; }).length;
      var before = dates.slice(Math.max(0, di - 7), di).filter(function(d){ return byDate[d][sym]; }).length;
      return {sym: sym, name: c[1], n: n, hit: hit, win: win.length, fresh: n === 1 && before === 0, from: firstId[dates[start] + "|" + sym], mention: c[2] || 0};
    });
    var long = out.filter(function(x){ return x.n >= 2; }).sort(function(a, b){ return b.n - a.n || b.hit - a.hit || b.mention - a.mention; }).slice(0, 4);
    var fresh = out.filter(function(x){ return x.fresh; }).sort(function(a, b){ return b.mention - a.mention; }).slice(0, 2);
    return {long: long, fresh: fresh};
  }
  function short(n){ n = String(n || ""); n = n.replace(/\s*(홀딩스?|홀딩|ADR|Inc\.?|Corp\.?)\s*/g, " ").trim(); return n.length > 8 ? n.slice(0, 7) + "…" : n; }
  function thread(){
    if (window.cur !== "market") return;
    var box = document.getElementById("mkld"), id = window.curDate; if (!box || !id || box.dataset.thr === id) return;
    box.dataset.thr = id;
    mx().then(function(MX){
      var S = streaks(MX, id); if (!S || (!S.long.length && !S.fresh.length)) return;
      if (!document.getElementById("mkld") || window.curDate !== id) return;
      var old = box.querySelector(".mk-thr"); if (old) old.remove();
      var h = '<div class="mk-thr"><span class="mk-thr-k">🧵 리포트에</span>' +
        S.long.map(function(x){ return '<button data-go="' + e(x.from) + '" title="' + e(x.from.slice(5, 10).replace("-", "/")) + '부터">' + e(short(x.name)) + ' <b>' + x.n + '일째</b>' + (x.hit > x.n ? ' <small>' + x.win + '일 중 ' + x.hit + '</small>' : '') + '</button>'; }).join("") +
        S.fresh.map(function(x){ return '<button class="nw" data-sym="' + e(x.sym) + '">🆕 ' + e(short(x.name)) + ' <small>오늘 처음</small></button>'; }).join("") + '</div>';
      var lab = box.querySelector(".mk-lab"); if (lab) lab.insertAdjacentHTML("afterend", h); else box.insertAdjacentHTML("afterbegin", h);
      [].forEach.call(box.querySelectorAll(".mk-thr [data-go]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var to = b.dataset.go; if (to && to !== window.curDate) go("market", to); else window.scrollTo({top: 0, behavior: "smooth"}); }; });
      [].forEach.call(box.querySelectorAll(".mk-thr [data-sym]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); openOP(b.dataset.sym); }; });
    });
  }

  /* ---------- 공통: 시장 탭이 그려질 때마다 ---------- */
  var tt = null;
  new MutationObserver(function(){ if (window.cur !== "market" || tt) return;
    tt = setTimeout(function(){ tt = null; try { thread(); } catch(x) {} try { kpiNow(); } catch(x) {} try { if (store.mkFull) applyFull(); } catch(x) {} }, 400); })
    .observe(document.getElementById("main") || document.body, {childList: true, subtree: true});

  var st = document.createElement("style");
  st.textContent =
    /* A10-4 맨 위 띠 */
    ".hero2.mk-strip{padding:10px 14px;border-radius:14px;margin:0 0 10px}" +
    ".mk-strip .hero2-k{font-size:12.5px;margin-bottom:3px}.mk-strip .hero2-k span{color:var(--dim,#8a94a8)}" +
    ".mk-strip .hero2-t{font-size:14.5px;line-height:1.5;font-weight:700}" +
    /* A10-1 지금 → */
    ".kpis2 .kp .kp-now{display:block;font-size:12.5px;line-height:1.4;margin:4px 0 2px;color:var(--sub)}.kpis2 .kp .kp-now b,.kpis2 .kp .kp-now span{display:inline;font-size:inherit;font-weight:700;margin:0;padding:0;font-variant-numeric:tabular-nums}.kpis2 .kp .kp-now span.mut{font-weight:500}" +
    /* A10-2 칩 */
    ".mk-thr{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:5px;align-items:center;margin:0 -16px 9px;padding:0 16px}.mk-thr::-webkit-scrollbar{display:none}" +
    ".mk-thr-k{flex:0 0 auto;white-space:nowrap;font-size:12.5px;color:var(--sub);font-weight:700;margin-right:2px}" +
    ".mk-thr button{flex:0 0 auto;white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:3px 9px;font:inherit;font-size:12.5px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".mk-thr button b{color:#ff8a6a}.mk-thr button small{color:var(--dim,#8a94a8);font-size:12.5px}" +
    ".mk-thr button.nw{border-color:color-mix(in srgb,#24c08a 55%,var(--line));}" +
    /* A10-5 스위치: 목차 줄 오른쪽 끝에 붙어 있음 */
    ".mk-toc{overflow:visible!important;align-items:center}" +
    ".mk-tsc{display:flex;gap:5px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none;-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);padding-right:14px}.mk-tsc::-webkit-scrollbar{display:none}" +
    ".mk-toc .mk-full{position:static;margin-left:4px;flex:0 0 auto;background:var(--panel)}" +
    ".mk-toc .mk-full small{font-size:12.5px;color:var(--dim,#8a94a8);font-weight:600}.mk-toc .mk-full.on{border-color:var(--c)}";
  document.head.appendChild(st);
})();

/* ---------- 10/14 11시 A11-1 🪜 스크롤 내리면 머리 접기 ----------
   아래로 내리는 동안 머리(상표 줄 + 「포트/성적표」 줄)를 위로 밀어 올리고(transform — 문서 높이는 안 바뀌어 스크롤 위치가 안 튐), 조금만 위로 올리면 다시 내림.
   위에 붙는 성적 띠·바로가기 칩은 --hh(머리 높이)를 따라가므로 접을 때 --hh 도 같이 줄임. */
(function(){
  var hd = document.querySelector("header"); if (!hd) return;
  var st = document.createElement("style");
  st.textContent =
    "header{transition:transform .22s ease;will-change:transform}header.hd-min{transform:translateY(calc(-1 * var(--hdc,98px)))}" +
    "header.hd-min .top,header.hd-min .tabs.sub{pointer-events:none}" +
    ".po-stk,.fold-jump{transition:top .22s ease}";
  document.head.appendChild(st);
  var lastY = window.scrollY || 0, acc = 0;
  // 10/15: 아이폰 상태 표시줄(시계·배터리) 자리 — 머리는 통째로 올려 숨기고, 그 자리엔 바탕색 띠를 깔아 칩·탭이 시계 밑으로 비치지 않게
  var sp = document.createElement("div"); sp.id = "sbcover";
  sp.style.cssText = "position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top);background:var(--bg);z-index:40;pointer-events:none";
  document.body.appendChild(sp);
  function safeTop(){ return sp.offsetHeight || 0; }
  function setHH(){ var h = hd.offsetHeight, s = safeTop(); if (hd.classList.contains("hd-min")){ document.documentElement.style.setProperty("--hdc", h + "px"); document.documentElement.style.setProperty("--hh", s + "px"); }
    else document.documentElement.style.setProperty("--hh", h + "px"); }
  function set(min){ if (hd.classList.contains("hd-min") === min) return; hd.classList.toggle("hd-min", min); sp.style.display = min ? "" : "none"; setHH(); }
  sp.style.display = "none";
  window.addEventListener("scroll", function(){
    var y = window.scrollY || 0, d = y - lastY; lastY = y;
    // 11/03 「스크롤할 때 위아래 고정 칸이 흔들려」 — 맨 위·맨 아래에서 아이폰이 튕길 때(값이 오르내림) 머리가 접혔다 펴졌다 하던 것 → 튕기는 구간은 무시 · 기준도 조금 크게
    var maxY = (document.documentElement.scrollHeight || 0) - window.innerHeight;
    if (y < 0 || y > maxY - 4) return;
    if ((d > 0) !== (acc > 0)) acc = 0;
    acc += d;
    if (y < 80 || acc < -40) set(false);
    else if (y > 160 && acc > 40) set(true);
  }, {passive: true});
  window.addEventListener("hashchange", function(){ set(false); });
  window.addEventListener("resize", function(){ setTimeout(setHH, 50); });
})();
;
/* ======== ux1014b.js ======== */
/* CH Investing — 10/14 14시 아이디어 보고 A14 (사용자: "3,4,5 진행")
   A14-3 🖼 📤 공유를 글자 대신 「그림 카드」로 — chShare(제목, 글, 주소) 한 곳을 감싸서 홈·포트·스토리·카드 ⓘ 공유가 모두 같이 바뀜.
         누르면 아래에서 미리보기 창: 「🖼 그림으로 보내기」(사진 공유) · 「✉️ 글로 보내기」(지금까지 방식) · 닫기. 숫자는 화면 글 그대로(새 계산 없음).
   A14-4 📲 사파리(홈 화면 앱 아님)로 열면 홈 맨 위 얇은 띠 「홈 화면에 추가」 · 갤럭시 크롬은 설치 가능할 때만 바로 「설치」 · ✕ 누르면 7일 숨김
   A14-5 는 push.js(알림 화면 시간표 4묶음) */
(function(){
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.setAttribute("role", "status"); d.setAttribute("aria-live", "polite"); d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function dark(){ return document.documentElement.getAttribute("data-ui") !== "light"; }

  /* ---------- A14-3 그림 카드 ---------- */
  var W = 1080, H = 1350, PAD = 84;
  var NUM = /^(.{1,16}?)\s*([+\-−]\d[\d,]*(?:\.\d+)?%)(p?)\s*(\(.*\))?$/;
  function parse(title, text){
    var lines = String(text || "").split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
    var disc = "※ 투자 참고용 · 매수 추천 아님";
    lines = lines.filter(function(l){ return !/^※/.test(l); });
    var head = lines.shift() || title || "CH Investing", stats = [], rest = [];
    lines.forEach(function(l){
      var segs = l.split(/\s+·\s+/), got = [], left = [];
      segs.forEach(function(s){ var m = s.match(NUM); if (m && !m[3] && !/[ ]{2}/.test(m[1])) got.push({lab: m[1].replace(/[:：]$/, ""), v: m[2], note: (m[4] || "").replace(/^\(|\)$/g, "")}); else left.push(s); });
      stats = stats.concat(got);
      if (left.length) rest.push(left.join(" · "));
    });
    if (stats.length < 2){ stats = []; rest = lines.slice(); }   // 숫자 줄이 1개뿐이면 글 카드로
    return {head: head, stats: stats.slice(0, 6), rest: rest.slice(0, 9), disc: disc};
  }
  function wrap(cx, s, maxW, maxL){
    var out = [], cur = "";
    Array.from(s).forEach(function(ch){ if (cx.measureText(cur + ch).width > maxW && cur){ out.push(cur); cur = ch.trim() ? ch : ""; } else cur += ch; });
    if (cur) out.push(cur);
    if (out.length > maxL){ out = out.slice(0, maxL); out[maxL - 1] = out[maxL - 1].replace(/.{1}$/, "…"); }
    return out;
  }
  function draw(P){
    var D = dark(), C = {bg1: D ? "#0b0f17" : "#f5f6fa", bg2: D ? "#1a2238" : "#e3e9f8", panel: D ? "#121826" : "#ffffff", line: D ? "#232c40" : "#e2e6ef",
      text: D ? "#e8ecf4" : "#141824", sub: D ? "#8a94a8" : "#5b6476", up: "#e66767", down: "#3987e5", acc: D ? "#ffd166" : "#b07a00"};
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H; var cx = cv.getContext("2d");
    var F = '-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
    var g = cx.createLinearGradient(0, 0, W, H); g.addColorStop(0, C.bg2); g.addColorStop(0.55, C.bg1); g.addColorStop(1, C.bg1);
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // 머리: 상표 + 날짜
    cx.textBaseline = "alphabetic"; cx.fillStyle = C.acc; cx.font = "800 44px " + F; cx.fillText("CH Investing", PAD, 128);
    var now = new Date(Date.now() + 9 * 3600e3), dl = (now.getUTCMonth() + 1) + "/" + now.getUTCDate() + " " + ("0" + now.getUTCHours()).slice(-2) + ":" + ("0" + now.getUTCMinutes()).slice(-2);
    cx.fillStyle = C.sub; cx.font = "500 32px " + F; cx.textAlign = "right"; cx.fillText(dl, W - PAD, 128); cx.textAlign = "left";
    // 제목
    cx.fillStyle = C.text; cx.font = "800 60px " + F;
    var y = 236; wrap(cx, P.head, W - PAD * 2, 2).forEach(function(l){ cx.fillText(l, PAD, y); y += 76; });
    y += 14;
    if (P.stats.length){
      var mx = Math.max.apply(null, P.stats.map(function(s){ return Math.abs(parseFloat(s.v.replace("−", "-").replace(/,/g, ""))) || 0; }).concat([0.01]));
      var rowH = Math.max(112, Math.min(176, Math.floor((H - 230 - y - (P.rest.length ? 56 * Math.min(3, P.rest.length) : 0)) / P.stats.length)));
      P.stats.forEach(function(s){
        var v = parseFloat(s.v.replace("−", "-").replace(/,/g, "")) || 0, base = /S&P|코스피|코스닥|MSCI|시장/.test(s.lab);
        cx.fillStyle = C.panel; roundRect(cx, PAD, y, W - PAD * 2, rowH - 18, 26); cx.fill();
        cx.fillStyle = C.text; cx.font = "700 " + Math.min(44, rowH * 0.3) + "px " + F; cx.fillText(s.lab, PAD + 34, y + (s.note ? rowH * 0.36 : rowH * 0.48));
        if (s.note){ cx.fillStyle = C.sub; cx.font = "500 " + Math.min(28, rowH * 0.2) + "px " + F; cx.fillText(wrap(cx, s.note, W * 0.42, 1)[0], PAD + 34, y + rowH * 0.36 + Math.min(42, rowH * 0.26)); }
        cx.fillStyle = base ? C.sub : (v >= 0 ? C.up : C.down); cx.font = "900 " + Math.min(70, rowH * 0.5) + "px " + F; cx.textAlign = "right";
        cx.fillText(s.v, W - PAD - 34, y + rowH * 0.5); cx.textAlign = "left";
        var bw = (W - PAD * 2 - 68) * Math.min(1, Math.abs(v) / mx), by = y + rowH - 46;
        cx.fillStyle = C.line; roundRect(cx, PAD + 34, by, W - PAD * 2 - 68, 10, 5); cx.fill();
        cx.fillStyle = base ? C.sub : (v >= 0 ? C.up : C.down); roundRect(cx, PAD + 34, by, Math.max(10, bw), 10, 5); cx.fill();
        y += rowH;
      });
      y += 8;
    }
    cx.fillStyle = P.stats.length ? C.sub : C.text; cx.font = "500 " + (P.stats.length ? 34 : 44) + "px " + F;
    var lh = P.stats.length ? 48 : 70;
    if (!P.stats.length){ var nl = 0; P.rest.forEach(function(l){ nl += wrap(cx, l, W - PAD * 2, 2).length; }); y = Math.max(y + 20, Math.round((y + H - 170) / 2 - (nl * lh + P.rest.length * 8) / 2)); }
    P.rest.forEach(function(l){ wrap(cx, l, W - PAD * 2, 2).forEach(function(w){ if (y < H - 200){ cx.fillText(w, PAD, y + 34); y += lh; } }); y += 8; });
    // 바닥: 주소 + 안내
    cx.strokeStyle = C.line; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(PAD, H - 150); cx.lineTo(W - PAD, H - 150); cx.stroke();
    cx.fillStyle = C.text; cx.font = "700 32px " + F; cx.fillText("📱 chkchp0702-spec.github.io/daily-app", PAD, H - 92);
    cx.fillStyle = C.sub; cx.font = "500 28px " + F; cx.fillText(P.disc, PAD, H - 48);
    return cv;
  }
  function roundRect(cx, x, y, w, h, r){ cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function blobOf(cv){ var u = cv.toDataURL("image/png"), b = atob(u.split(",")[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], {type: "image/png"}); }

  var TXT = window.chShare;   // nav2.js 의 글자 공유(공유창 → 안 되면 복사)
  function sheet(title, text, hash){
    var old = document.getElementById("shimg"); if (old) old.remove();
    var cv; try { cv = draw(parse(title, text)); } catch(e) { return TXT && TXT(title, text, hash); }
    var url = cv.toDataURL("image/png"), now = new Date(Date.now() + 9 * 3600e3);
    var fn = "CH_Investing_" + ("0" + (now.getUTCMonth() + 1)).slice(-2) + ("0" + now.getUTCDate()).slice(-2) + ".png", file = null, canFile = false;
    try { file = new File([blobOf(cv)], fn, {type: "image/png"}); canFile = !!(navigator.canShare && navigator.canShare({files: [file]})); } catch(e) {}
    var d = document.createElement("div"); d.id = "shimg";
    d.innerHTML = '<div class="shi-bk"></div><div class="shi-box"><div class="shi-h"><b>📤 공유</b><button class="shi-x" aria-label="닫기">✕</button></div>' +
      '<img alt="공유 그림 미리보기" src="' + url + '"><div class="shi-bt"><button class="shi-img">🖼 ' + (canFile ? "그림으로 보내기" : "그림 저장") + '</button><button class="shi-txt">✉️ 글로 보내기</button></div>' +
      '<small>' + (canFile ? "카톡·문자·인스타 어디서나 같은 모양으로 보여요." : "이 브라우저는 그림 바로 보내기가 안 돼요 — 그림을 길게 눌러 저장한 뒤 보내 주세요.") + '</small></div>';
    document.body.appendChild(d);
    var close = function(){ d.remove(); };
    d.querySelector(".shi-bk").onclick = close; d.querySelector(".shi-x").onclick = close;
    d.querySelector(".shi-txt").onclick = function(){ close(); if (TXT) TXT(title, text, hash); };
    d.querySelector(".shi-img").onclick = function(){
      if (canFile){ navigator.share({files: [file]}).then(close).catch(function(e){ if (e && e.name !== "AbortError") toast("그림 보내기가 안 됐어요 — 길게 눌러 저장해 주세요"); }); return; }
      var a = document.createElement("a"); a.href = url; a.download = fn; document.body.appendChild(a); a.click(); a.remove(); toast("그림을 저장했어요");
    };
  }
  if (TXT) window.chShare = sheet;

  /* ---------- A14-4 홈 화면에 추가 띠 ---------- */
  var ua = navigator.userAgent || "", ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var inApp = /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(ua);
  var standalone = function(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; };
  var DP = null, HIDE = "a2hsHide";
  window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); DP = e; if (window.cur === "home") band(); });
  window.addEventListener("appinstalled", function(){ DP = null; var b = document.getElementById("a2hs"); if (b) b.remove(); });
  function hidden(){ var t = +ls(HIDE) || 0; return Date.now() - t < 7 * 86400e3; }
  function band(){
    if (standalone() || hidden() || window.cur !== "home") return;
    if (!(ios || DP)) return;   // 아이폰 사파리·카톡 안 · 또는 크롬이 「설치 가능」이라고 알려 준 때만
    var main = document.getElementById("main"); if (!main || document.getElementById("a2hs")) return;
    var b = document.createElement("div"); b.id = "a2hs";
    var msg = ios ? (inApp ? "카톡 안에서 열렸어요 — <b>Safari로 열기</b> 뒤 홈 화면에 추가하면 알림도 와요" : "<b>홈 화면에 추가</b>하면 알림도 오고 앱처럼 바로 열려요")
                  : "<b>앱으로 설치</b>하면 알림도 오고 바로 열려요";
    b.innerHTML = '<span class="a2-i">📲</span><span class="a2-t">' + msg + '</span>' +
      (DP && !ios ? '<button class="a2-go a2-inst">설치</button>' : '<a class="a2-go" href="install.html">방법 ▸</a>') + '<button class="a2-x" aria-label="7일 동안 숨기기">✕</button>';
    main.insertBefore(b, main.firstChild);
    b.querySelector(".a2-x").onclick = function(){ ls(HIDE, String(Date.now())); b.remove(); };
    var ib = b.querySelector(".a2-inst"); if (ib) ib.onclick = function(){ if (!DP) return; DP.prompt(); DP.userChoice.then(function(r){ if (r && r.outcome === "accepted") b.remove(); DP = null; }).catch(function(){}); };
  }
  var HI = window.homeInit;
  if (HI) window.homeInit = function(){ var r = HI.apply(this, arguments); try { band(); } catch(e) {} return r; };
  setTimeout(function(){ try { band(); } catch(e) {} }, 600);

  var st = document.createElement("style");
  st.textContent = [
    "#shimg{position:fixed;inset:0;z-index:90;display:flex;align-items:flex-end;justify-content:center}",
    ".shi-bk{position:absolute;inset:0;background:rgba(0,0,0,.55)}",
    ".shi-box{position:relative;width:100%;max-width:520px;background:var(--panel);border:1px solid var(--line);border-radius:22px 22px 0 0;padding:14px 16px calc(env(safe-area-inset-bottom) + 16px);display:flex;flex-direction:column;gap:10px;max-height:92vh}",
    ".shi-h{display:flex;align-items:center;justify-content:space-between}.shi-h b{font-size:16px}",
    ".shi-x{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;width:32px;height:32px;font-size:15px;cursor:pointer}",
    "#shimg img{display:block;width:auto;max-width:100%;max-height:56vh;margin:0 auto;border-radius:14px;border:1px solid var(--line);-webkit-touch-callout:default}",
    ".shi-bt{display:grid;grid-template-columns:1.3fr 1fr;gap:8px}.shi-bt button{font:inherit;font-size:15px;font-weight:800;padding:13px 8px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}",
    ".shi-bt .shi-img{background:var(--acc);border-color:var(--acc);color:var(--bg)}",
    ".shi-box small{color:var(--sub);font-size:12.5px;text-align:center}",
    "#a2hs{display:flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:8px 8px 8px 12px;margin:0 0 10px;font-size:13px;line-height:1.4}",
    "#a2hs .a2-i{font-size:18px}#a2hs .a2-t{flex:1;min-width:0;color:var(--sub)}#a2hs .a2-t b{color:var(--text)}",
    "#a2hs .a2-go{flex:none;font:inherit;font-size:12.5px;font-weight:800;border:0;border-radius:999px;padding:6px 11px;background:var(--acc);color:var(--bg);text-decoration:none;cursor:pointer;white-space:nowrap}",
    "#a2hs .a2-x{flex:none;border:0;background:transparent;color:var(--sub);font-size:15px;width:28px;height:28px;cursor:pointer}"
  ].join("\n");
  document.head.appendChild(st);
})();
;
/* ======== ux1014c.js ======== */
/* CH Investing — 10/14 15시 아이디어 보고 A15 (사용자: "다 진행해")
   A15-1 🧱 아래 탭 바 「글자 비침」 막기 — 탭 바·머리 배경을 거의 불투명하게 + 탭 바 위에 사라지는 그림자 한 줄
   A15-2 🔡 작은 글자 바닥선 11.5px + 흐린 글자(--dim) 대비 약 3:1 → 4.7:1 · 밝은 모드 상표 「CH」 진하게
   A15-3 📏 글자 크기 「📱 폰 따라감」(아이폰 텍스트 크기) + 5단계 — zoom 대신 글자 크기 규칙만 고쳐 씀(카드·여백은 그대로)
   A15-4 🌈 오늘 날씨 색 — 🧭 국면 신호판(미·한 합본) 두 점수로 맑음·흐림·비·보류를 정해 머리 띠·홈 첫 카드를 아주 옅게 물들임
   A15-5 🪪 홈 카드 머리 한 벌 + 왼쪽 탭 색 띠(어느 탭 이야기인지) */
(function(){
  var D = document.documentElement;

  /* ---------- A15-2 · A15-3 글자 ---------- */
  var ORIG = new WeakMap(), F = 1, FLOOR = 13;   // 🎨 11/04 우와: 바닥 11.5 → 13 · 작은 글자일수록 더 키움(BUMP) — 사용자 「가독성 좋게」
  function BUMP(px){ return px <= 16 ? px + 1.5 : px <= 20 ? px + 2 : px <= 30 ? px + 3 : px; }
  function sysF(){
    try {
      if (!(window.CSS && CSS.supports && CSS.supports("font", "-apple-system-body"))) return 1;
      var s = document.createElement("span"); s.style.cssText = "font:-apple-system-body;position:absolute;visibility:hidden"; s.textContent = "가";
      (document.body || D).appendChild(s); var px = parseFloat(getComputedStyle(s).fontSize) || 17; s.remove();
      return Math.max(0.85, Math.min(1.35, px / 17));   // 아이폰 기본 「본문」 = 17px
    } catch(x) { return 1; }
  }
  function fixRules(list){
    for (var i = 0; i < list.length; i++){
      var r = list[i];
      if (r.cssRules && !r.style){ fixRules(r.cssRules); continue; }   // @media 안
      if (!r.style) continue;
      var o = ORIG.get(r);
      if (o === undefined){
        var fs = r.style.fontSize;
        o = /^\d+(\.\d+)?px$/.test(fs) ? {px: parseFloat(fs), imp: r.style.getPropertyPriority("font-size")} : null;
        ORIG.set(r, o);
      }
      if (!o) continue;
      if (o.chrome == null) o.chrome = /header|\.stamp|\.brand|#bnav|#uibtn|#gsbtn|#wlbtn|\.tabs?\b/.test(r.selectorText || "");   // 머리·아래 탭 바는 크기 그대로(한 줄 유지)
      if (o.pic == null) o.pic = o.px < 11 && /svg|text|tick|axis|\.t3-|\.ix|\.viz|chart|legend/.test(r.selectorText || "");   // 그림 눈금 글자만 그대로
      var v = Math.round((o.chrome || o.pic ? o.px : BUMP(Math.max(o.px, FLOOR))) * (o.chrome ? 1 : F) * 10) / 10;
      if (r.style.fontSize !== v + "px") r.style.setProperty("font-size", v + "px", o.imp);
    }
  }
  function fixAll(){
    for (var i = 0; i < document.styleSheets.length; i++){
      var sh = document.styleSheets[i], rl;
      try { rl = sh.cssRules; } catch(x) { continue; }   // 바깥 글꼴 CSS 는 못 읽음 → 그대로
      if (rl) fixRules(rl);
    }
  }
  window.chFont = function(fs){
    F = fs === "auto" || fs == null ? sysF() : (+fs || 1);
    if (document.body) document.body.style.zoom = "";
    fixAll();
  };
  var pend = 0;
  function later(){ if (pend) return; pend = setTimeout(function(){ pend = 0; fixAll(); }, 60); }
  // 다른 화면 js 가 나중에 <style> 을 붙이면 그것도 고쳐 씀
  new MutationObserver(function(ms){
    for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++){
      var n = ms[i].addedNodes[j]; if (n.nodeName === "STYLE" || n.nodeName === "LINK"){ later(); return; } }
  }).observe(D, {childList: true, subtree: true});

  /* ---------- A15-4 오늘 날씨 색 ---------- */
  var MOOD = {
    sun:  {ic: "🧭", w: "분위기 좋음", c: "#4dd47a", lc: "#1f9d4f", why: "경기·시장 점수가 둘 다 좋은 쪽"},
    cloud:{ic: "🧭", w: "엇갈림", c: "#e9b949", lc: "#b07d00", why: "두 점수가 엇갈림"},
    rain: {ic: "🧭", w: "분위기 나쁨", c: "#ff6b6b", lc: "#cc3b3b", why: "두 점수가 나쁜 쪽"},
    fog:  {ic: "🧭", w: "판단 보류", c: "#8a94a8", lc: "#6b7486", why: "점수에 든 신호가 적어 판단 보류"}
  };
  var M = null;
  function act(sigs){ return (sigs || []).filter(function(s){ return s.st != null && s.w > 0 && !(s.id === "thrust" && s.st === 0); }); }
  function moodOf(R){
    if (!R || !R.sig) return null;
    var g = function(k, v){ var a = act(R.sig.filter(function(s){ return s.grp === k; })); return a.length < 3 || v == null ? null : v >= 10 ? 1 : v <= -10 ? -1 : 0; };
    var c = g("cycle", R.cycle), t = g("timing", R.timing);
    if (c == null && t == null) return "fog";
    var a = [c, t].filter(function(x){ return x != null; });
    var pos = a.some(function(x){ return x > 0; }), neg = a.some(function(x){ return x < 0; });
    return pos && !neg ? "sun" : neg && !pos ? "rain" : "cloud";
  }
  function paintMood(){
    if (!M) return;
    var m = MOOD[M.k], light = D.getAttribute("data-ui") === "light";
    D.style.setProperty("--mood", light ? m.lc : m.c); D.setAttribute("data-mood", M.k);
    var b = document.querySelector("header .brand");
    if (b && !document.getElementById("moodDot")){
      var d = document.createElement("button"); d.id = "moodDot"; d.type = "button";
      d.onclick = function(ev){ ev.stopPropagation(); if (window.goTo) goTo("sector", "rbboard"); };
      b.appendChild(d);
    }
    var dd = document.getElementById("moodDot");
    if (dd){ dd.setAttribute("aria-label", "장 분위기 " + m.w + " — 국면 신호판 보기"); dd.title = m.ic + " " + m.w + " · " + M.label; }
    var day = document.querySelector("#hmbody .hm-day");
    if (day && !day.querySelector(".hm-mood")){
      var s = document.createElement("span"); s.className = "hm-mood"; s.setAttribute("role", "button");
      s.innerHTML = m.ic + " <b>" + m.w + "</b>";
      s.title = M.label + " — " + m.why + " (누르면 국면 신호판)";
      s.onclick = function(ev){ ev.stopPropagation(); if (window.goTo) goTo("sector", "rbboard"); };
      day.insertBefore(s, day.firstChild);
    }
    var first = document.querySelector("#hmbody > .card");   // 홈 첫 카드만 옅게
    if (first && !first.classList.contains("mood")) first.classList.add("mood");
  }
  function loadMood(){
    if (typeof getJSON !== "function") return;
    var t5 = Math.floor(Date.now() / 300000);
    getJSON("archive/x/regime.json?r" + t5).catch(function(){ return window.PL && PL.X ? PL.X("regime.json") : null; }).then(function(R){
      var k = moodOf(R); if (!k) return;
      M = {k: k, label: R.label || ""}; paintMood();
    }).catch(function(){});
  }

  /* ---------- A15-5 홈 카드 색 띠 ---------- */
  function catColor(k){ var c = (window.CATS || []).filter(function(x){ return x.key === k; })[0]; return c ? c.color : null; }
  function strips(){
    var cards = document.querySelectorAll("#hmbody .card:not([data-stp])");
    for (var i = 0; i < cards.length; i++){
      var c = cards[i], k = c.getAttribute("data-strip") || (c.getAttribute("data-goto") || "").split("~")[0];
      var col = k && catColor(k); c.setAttribute("data-stp", "1");
      if (col){ c.style.setProperty("--strip", col); c.classList.add("ch-strip"); }
    }
  }

  /* 홈이 다시 그려질 때마다(탭 이동·매시간 갱신) 색 띠·날씨 칸 붙이기 */
  var t0 = 0;
  new MutationObserver(function(){ if (t0) return; t0 = setTimeout(function(){ t0 = 0; strips(); paintMood(); }, 50); })
    .observe(document.getElementById("main") || document.body, {childList: true, subtree: true});
  new MutationObserver(function(){ paintMood(); }).observe(D, {attributes: true, attributeFilter: ["data-ui"]});

  /* ---------- CSS ---------- */
  var css = [
    /* A15-1 */
    "header{background-color:rgba(11,15,23,.96)!important}",
    ":root[data-ui=light] header{background-color:rgba(244,246,250,.97)!important}",
    "#bnav{background-color:rgba(11,15,23,.97)!important}",
    ":root[data-ui=light] #bnav{background-color:rgba(255,255,255,.98)!important}",
    "#bnav::after{content:'';position:absolute;left:0;right:0;top:-14px;height:14px;pointer-events:none;background:linear-gradient(to top,var(--bg),transparent)}",
    /* A15-2 */
    ":root{--dim:#8a93a5}",
    ":root[data-ui=light]{--dim:#636d7b}",
    ".stamp{white-space:nowrap}",
    "header .brand{position:relative;white-space:nowrap;margin-right:9px}",
    ":root[data-ui=light] #brandDot{filter:brightness(.62) saturate(1.5)}",
    /* A15-3 설정 줄: 글자 버튼 6개가 한 줄에 */
    "#uiset .us-seg button[data-k=fs]{padding:5px 7px}",
    "#uiset .us-seg button[data-k=fs][data-v='0.88']{font-size:12.5px!important}#uiset .us-seg button[data-k=fs][data-v='0.94']{font-size:12.5px!important}",
    "#uiset .us-seg button[data-k=fs][data-v='1']{font-size:13.5px!important}#uiset .us-seg button[data-k=fs][data-v='1.1']{font-size:15px!important}#uiset .us-seg button[data-k=fs][data-v='1.22']{font-size:17px!important}",
    "#uiset .us-r:has(button[data-k=fs]){flex-wrap:wrap}",
    /* A15-4 */
    "header{background-image:linear-gradient(180deg,color-mix(in srgb,var(--mood,transparent) 11%,transparent),transparent)!important}",
    "#moodDot{position:absolute;top:2px;right:-9px;width:8px;height:8px;padding:0;margin:0;border-radius:50%;border:0;background:var(--mood,#8a94a8);cursor:pointer;box-shadow:0 0 0 3px color-mix(in srgb,var(--mood,#8a94a8) 22%,transparent)}",
    ":root:not([data-mood]) #moodDot{display:none}",
    "#hmbody > .card.mood{background:radial-gradient(120% 120% at 100% 0%,color-mix(in srgb,var(--mood) 16%,transparent),transparent 60%),var(--panel)}",
    ".hm-mood{display:inline-flex;align-items:center;gap:3px;margin-right:6px;padding:2px 9px;border-radius:999px;font-size:12.5px;cursor:pointer;background:color-mix(in srgb,var(--mood) 16%,transparent);color:var(--text)}",
    ".hm-mood b{color:var(--mood)}",
    /* A15-5 */
    ".hm-chg .hm-h{margin-bottom:4px}",
    ".card.ch-strip{border-left:3px solid var(--strip)}",
    ":root[data-ui=light] .card.ch-strip{border-left-color:color-mix(in srgb,var(--strip) 72%,#000)}",
    ".hm-kt.buy,.hm-kt.sell{color:var(--text)!important}",
    ".hm-c:has(.hm-kt.buy) .hm-i{background:color-mix(in srgb,#4dd47a 24%,var(--panel2))}",
    ".hm-c:has(.hm-kt.sell) .hm-i{background:color-mix(in srgb,#ff6b6b 24%,var(--panel2))}"
  ].join("\n");
  var st = document.createElement("style"); st.id = "ux1014c"; st.textContent = css; document.head.appendChild(st);

  function boot(){
    var u = {}; try { u = JSON.parse(localStorage.getItem("ui") || "{}"); } catch(x) {}
    var fs = u.fs == null || u.fs === 1 ? "auto" : u.fs === 0.92 ? 0.94 : u.fs === 1.12 ? 1.1 : u.fs;
    window.chFont(fs); setTimeout(fixAll, 1500);
    strips(); loadMood(); setInterval(loadMood, 30 * 60 * 1000);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
;
/* ======== ux1015.js ======== */
/* CH Investing — 10/15 앱 아이디어 A9-1·A9-3·A9-4 (사용자 「다 적용해」)
   A9-1 🌞 장중 띠 — 홈 날짜 줄 아래 한 줄: 장중판 = 🇰🇷 코스피·코스닥 지금 값, 저녁판 = 🇺🇸 선물, 밤·아침판 = 🇺🇸 지수 (1분마다 · 누르면 시장 탭 실시간 시장판)
   A9-3 ⟳ 신선도 칩 — 「08:56 기준」 → 「⟳ 41분 전」(1시간 안 초록 · 3시간 안 노랑 · 넘으면 빨강) · 누르면 자료별 신선도(건강검진 health.json) · 머리엔 버전만(시각 글자는 뺌) · 버전은 ⚙️ 맨 아래에도
   A9-4 🪄 숫자 차오름 + 「지난번 본 값」 배지 — 이 휴대폰 안(localStorage ch_seen)에만 · 아이폰 「동작 줄이기」면 움직임 없음
   보고 숫자는 화면에 이미 있는 값만 씀 — 새 계산·매수 권유 없음 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; return (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 2 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kst(s){ var t = Date.parse(String(s || "").trim().replace(" ", "T") + (String(s).length <= 16 ? ":00" : "") + "+09:00"); return isNaN(t) ? null : t; }
  function ago(ms){ var m = Math.round(ms / 60000); if (m < 1) return "방금"; if (m < 60) return m + "분 전"; return Math.floor(m / 60) + "시간 전"; }
  function todayKST(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- A9-3 ⟳ 신선도 칩 ---------- */
  function fresh(H){
    var c = document.getElementById("hmfresh"); if (!c) return;
    var t = kst(H.at); if (t == null) return;
    var paint = function(){
      var age = Date.now() - t;
      c.className = "hm-fresh " + (age < 0 ? "g" : age <= 3600e3 ? "g" : age <= 3 * 3600e3 ? "y" : "r");
      c.textContent = age > 3 * 3600e3 ? "⟳ " + ago(age) + " · 자료가 늦어요" : "⟳ " + (age < 0 ? "방금" : ago(age));
      c.title = "홈 요약 만든 때 " + String(H.at || "").slice(5) + " — 누르면 자료별";
    };
    paint(); clearInterval(fresh.tm); fresh.tm = setInterval(function(){ if (!document.body.contains(c)) return clearInterval(fresh.tm); paint(); }, 60000);
    c.onclick = function(ev){ ev.stopPropagation(); freshSheet(H); };
  }
  function freshSheet(H){
    var old = document.getElementById("frsheet"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "frsheet";
    d.innerHTML = '<b>⟳ 자료 신선도</b><div class="fr-l"><div class="fr-r"><span>🏠 홈 요약</span><em>' + e(ago(Date.now() - kst(H.at))) + '</em></div><div class="mut">불러오는 중…</div></div>' +
      '<small>홈 요약은 매시간 · 실시간 숫자(🌞 띠)는 1분마다 새로 받아요</small><div class="fr-v">앱 v' + e(window.APPV || "") + '</div>';
    document.body.appendChild(d);
    var close = function(ev){ if (!d.contains(ev.target)){ d.remove(); document.removeEventListener("click", close, true); } };
    setTimeout(function(){ document.addEventListener("click", close, true); }, 0);
    if (typeof getJSON !== "function") return;
    getJSON("archive/x/health.json?" + Math.floor(Date.now() / 300000)).then(function(Hx){
      // 건강검진이 잰 때 기준 나이(그 뒤로 더하지 않음 — 건강검진이 늦게 돌면 부풀려 보여서) · 잰 때를 같이 적음
      var rows = (Hx.data || []).map(function(x){
        var h = x.age_h || 0, lim = x.lim || 3, c = h <= 1 ? "g" : h <= lim ? "y" : "r";
        return '<div class="fr-r"><span>' + e(x.name) + '</span><em class="' + c + '">' + e(ago(h * 3600e3)) + '</em></div>'; }).join("");
      var l = d.querySelector(".fr-l"); if (l) l.innerHTML = l.firstElementChild.outerHTML + '<div class="fr-h">🩺 건강검진 ' + e(String(Hx.at || "").slice(5).replace("-", "/")) + ' 잰 것</div>' + (rows || '<div class="mut">건강검진 자료 없음</div>') +
        ((Hx.problems || []).length ? '<div class="fr-p">⚠️ ' + e(Hx.problems[0]) + '</div>' : '');
    }).catch(function(){ var l = d.querySelector(".fr-l .mut"); if (l) l.textContent = "건강검진 자료를 못 받았어요"; });
  }

  /* ---------- A9-1 🌞 장중 띠 ---------- */
  function live(){
    var el = document.getElementById("hmlive"); if (!el || typeof getJSON !== "function") return;
    var ed = el.dataset.ed, mn = Math.floor(Date.now() / 60000);
    var J = function(n){ return getJSON("archive/x/" + n + ".json?" + mn).catch(function(){ return null; }); };
    var show = function(html, stale, title){ el.innerHTML = html; el.hidden = false; el.classList.toggle("stale", !!stale); el.title = title || ""; };
    var usClose = function(){ return J("live_us").then(function(U){
      if (!U || !(U.index || []).length) { el.hidden = true; return; }
      var at = U.at || null, age = at ? Date.now() - at : 9e9, sess = String(U.sess || U.date || "");
      var nyOpen = ed === "night" && age < 15 * 60000;
      show('<span class="lv-f">🇺🇸 ' + (nyOpen ? "장중" : (sess ? sess.slice(5).replace("-", "/") + " 마감" : "마감")) + '</span>' +
        U.index.slice(0, 2).map(function(x){ return '<span>' + e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
        (U.total ? '<span class="lv-m">오른 종목 ' + U.up + '/' + U.total + '</span>' : '') + '<span class="lv-t">' + e(U.t || "") + ' ›</span>',
        ed === "night" && !nyOpen && new Date(Date.now() + 9 * 3600e3).getUTCHours() < 5, "미국 지수 · 누르면 시장 탭 실시간 시장판");
    }); };
    if (ed === "day"){
      J("live_kr").then(function(L){
        if (!L || L.date !== todayKST() || !(L.index || []).length) return usClose();   // 주말·휴장 → 미국 마감
        var t = kst(L.date + " " + L.t), age = t ? Date.now() - t : 9e9;
        var m = new Date(Date.now() + 9 * 3600e3), mm = m.getUTCHours() * 60 + m.getUTCMinutes();
        var stale = age > 10 * 60000 && mm < 15 * 60 + 40;
        show('<span class="lv-f">🇰🇷 ' + (stale ? "멈춤?" : "지금") + '</span>' +
          L.index.slice(0, 2).map(function(x){ return '<span>' + e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
          (L.total ? '<span class="lv-m">오른 종목 ' + L.up + '/' + L.total + '</span>' : '') + '<span class="lv-t">' + e(L.t) + ' ›</span>',
          stale, "한국 장중 · " + L.t + " 값" + (stale ? " (10분 넘게 안 바뀜)" : "") + " · 누르면 시장 탭 실시간 시장판");
      });
    } else if (ed === "eve"){
      J("live_us_pre").then(function(P){
        if (!P || !(P.fut || []).length) return usClose();
        var age = P.at ? Date.now() - P.at : 9e9, nm = function(n){ return String(n).replace("100 선물", " 선물"); };
        show('<span class="lv-f">🇺🇸 선물</span>' + P.fut.slice(0, 2).map(function(x){ return '<span>' + e(nm(x.name)) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
          (P.tone ? '<span class="lv-m">' + e(P.tone) + '</span>' : '') + '<span class="lv-t">' + e(P.t || "") + ' ›</span>',
          age > 30 * 60000, (P.phase_lab || "미국 장 전") + " · 누르면 시장 탭 실시간 시장판");
      });
    } else usClose();
    el.onclick = function(ev){ ev.stopPropagation(); if (window.goTo) goTo("market", "live"); };
    clearTimeout(live.tm); live.tm = setTimeout(function(){ if (document.getElementById("hmlive") === el) live(); }, 60000);
  }

  /* ---------- A9-4 🪄 숫자 차오름 + 지난번 본 값 ---------- */
  var SEEN = {}; try { SEEN = JSON.parse(localStorage.getItem("ch_seen") || "{}") || {}; } catch(x) {}
  var animated = {};
  function nums(){
    var now = Date.now(), changed = false;
    [].forEach.call(document.querySelectorAll("#hmbody [data-num]"), function(el){
      var k = el.dataset.k, v = parseFloat(el.dataset.num); if (!k || isNaN(v)) return;
      var d = el.dataset.d != null ? +el.dataset.d : 2, u = el.dataset.u || "%", nos = el.dataset.nosign;
      var fmt = function(x){ return nos ? (+x).toFixed(d) + u : sg(x, d); };
      var final = el.textContent, p = SEEN[k];
      var diff = p && Math.abs(p.v - v) >= Math.pow(10, -d) / 2;
      if (diff && now - p.t > 5 * 60000){
        var b = document.createElement("i"); b.className = "hm-was " + (v > p.v ? "u" : "d");
        b.textContent = (v > p.v ? "▲" : "▼") + " 지난번 " + fmt(p.v); b.title = "이 휴대폰에서 지난번 본 값 (" + new Date(p.t + 9 * 3600e3).toISOString().slice(5, 16).replace("T", " ").replace("-", "/") + ")";
        el.parentNode.appendChild(b);
        var c = el.closest(".card"); if (c && !RM){ c.classList.remove("hm-pulse"); void c.offsetWidth; c.classList.add("hm-pulse"); }
      }
      if (!p || diff || now - p.t > 5 * 60000){ SEEN[k] = {v: v, t: now}; changed = true; }
      if (RM || (animated[k] && !diff)) return;
      animated[k] = 1;
      var t0 = null, dur = 600;
      (function step(ts){
        if (!document.body.contains(el)) return;
        if (t0 == null) t0 = ts; var q = Math.min(1, (ts - t0) / dur), ez = 1 - Math.pow(1 - q, 3);
        el.textContent = q >= 1 ? final : fmt(v * ez);
        if (q < 1) requestAnimationFrame(step);
      })(performance.now());
    });
    if (changed) try { localStorage.setItem("ch_seen", JSON.stringify(SEEN)); } catch(x) {}
  }

  window.hmAfter = function(H){ fresh(H); live(); nums(); };

  var css = document.createElement("style");
  css.textContent =
    
    ".hm-fresh{border-radius:999px;padding:1px 8px;font-size:12.5px;font-weight:800;white-space:nowrap;cursor:pointer;background:var(--panel2);border:1px solid var(--line)}" +
    ".hm-fresh.g{color:#4dd47a;border-color:rgba(77,212,122,.35)}.hm-fresh.y{color:#ffb84d;border-color:rgba(255,184,77,.4)}.hm-fresh.r{color:#ff8a8a;border-color:rgba(255,138,138,.45);background:rgba(255,107,107,.1)}" +
    ".hm-live{display:flex;flex-wrap:wrap;align-items:center;gap:3px 10px;margin:-4px 0 10px;padding:7px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line);font-size:12.5px;cursor:pointer;line-height:1.5}" +
    ".hm-live[hidden]{display:none}.hm-live span{white-space:nowrap}.hm-live b{font-weight:800}.hm-live .lv-f{font-weight:800}.hm-live .lv-m{color:var(--sub)}.hm-live .lv-t{margin-left:auto;color:var(--dim);font-size:12.5px}" +
    ".hm-live.stale{opacity:.6;filter:grayscale(.8)}.hm-live:active{opacity:.75}" +
    "#frsheet{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 64px);z-index:60;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px 16px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-size:13px;max-width:460px;margin:0 auto}" +
    "#frsheet>b{display:block;font-size:15px;margin-bottom:8px}.fr-r{display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid var(--line)}.fr-r:first-child{border-top:0}.fr-r em{font-style:normal;font-weight:800}" +
    ".fr-h{margin:8px 0 2px;font-size:12.5px;color:var(--sub);font-weight:700}.fr-r em.g{color:#4dd47a}.fr-r em.y{color:#ffb84d}.fr-r em.r{color:#ff8a8a}.fr-p{margin-top:6px;color:#ffb84d;font-size:12.5px}#frsheet small{display:block;margin-top:8px;color:var(--sub);font-size:12.5px}.fr-v{margin-top:6px;color:var(--dim);font-size:12.5px;text-align:right}" +
    ".hm-was{display:block;font-style:normal;font-size:12.5px;font-weight:700;margin-top:1px;color:var(--sub);line-height:1.3}.hm-was.u{color:#ff8a8a}.hm-was.d{color:#7cb0ff}" +
    ".hm-l .hm-was,.hm-c small .hm-was{display:inline;margin-left:4px}" +
    "@keyframes hmPulse{0%{box-shadow:inset 3px 0 0 0 var(--acc,#7c9cff),0 0 0 0 color-mix(in srgb,var(--acc,#7c9cff) 45%,transparent)}100%{box-shadow:inset 3px 0 0 0 transparent,0 0 0 10px transparent}}" +
    ".card.hm-pulse{animation:hmPulse 1.5s ease-out 1}" +
    ".us-ver{margin:10px 0 2px;font-size:12.5px;color:var(--dim);text-align:right}" +
    ":root[data-ui=light] .hm-fresh.g{color:#1f8b4c}:root[data-ui=light] .hm-fresh.y{color:#b26b00}:root[data-ui=light] .hm-fresh.r{color:#c0392b}" +
    ":root[data-ui=light] .fr-r em.g{color:#1f8b4c}:root[data-ui=light] .fr-r em.y{color:#b26b00}:root[data-ui=light] .fr-r em.r,:root[data-ui=light] .fr-p{color:#c0392b}:root[data-ui=light] #frsheet{box-shadow:0 12px 40px rgba(0,0,0,.18)}" +
    ":root[data-ui=light] .hm-was.u{color:#d63031}:root[data-ui=light] .hm-was.d{color:#2f6fd0}";
  document.head.appendChild(css);
})();
;
/* ======== ux1015b.js ======== */
/* CH Investing — 🌐 시황 탭 A10-1~5 (10/15 사용자 「다 진행해」)
   A10-1 🔮 ✅ 오늘 할 일 3줄에 리포트 확률 띠 + 「지금 →」 칩 (재는 숫자가 있는 줄만 · 숫자는 안 지어냄)
   A10-2 ✂️ → 결론 줄은 안 접음 (tidy.js 에서 .mk-so 뺌) · 2줄까지 보이고 길면 눌러 펼침 — CSS 는 여기
   A10-3 🔢 숫자는 한 줄에 — 킥 표 값 · 오늘의 숫자 둘째 줄 칩 · 실시간 시장판 타일 이름 줄임 + 넘치면 글자 줄임
   A10-4 🗓 날짜 칩 밑줄 = 그날 🇰🇷 코스피 | 🇺🇸 S&P 등락 색 · 휴장 칩 흐리게 · 같은 날 WK·주간 회고 칩 하나로 · 길게 누르면 그날 한 줄
   A10-5 ⏰ 시황도 시간대 순서 — 아침 🌙 밤사이 · 한국 장중 실시간 시장판 · 저녁 ✅ 할 일 · 밤·주말 실시간 시장판을 맨 위 「지금 볼 것」 자리로
           (⚙️ 보기 설정 「🌐 시황 순서」 → 고정이면 끔) */
(function(){
  function X(name, ttl){ var s = Math.floor(Date.now() / (ttl || 120000)); return getJSON("archive/x/" + name + "?" + s, {ttl: ttl || 120000}).catch(function(){ return null; }); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function kst(){ var d = new Date(Date.now() + 9 * 3600000); return {h: d.getUTCHours(), m: d.getUTCMinutes(), t: d.getUTCHours() * 60 + d.getUTCMinutes(), dow: d.getUTCDay(), ymd: d.toISOString().slice(0, 10)}; }
  function addDay(ymd, n){ var d = new Date(ymd + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function uiMkt(){ try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); return u.mkt || "time"; } catch(x) { return "time"; } }
  function curId(){ var b = document.querySelector("#dates .date.on"); return b ? b.dataset.id : ""; }
  function isLatest(){ var b = document.querySelector("#dates .date"); var on = document.querySelector("#dates .date.on"); return !!(b && on && b === on); }
  function fmtN(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.round(Math.abs(v)).toLocaleString(); }
  function pct(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent =
    /* A10-1 */
    ".xtodo .xtd .a101{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}" +
    ".a101-p{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--sub)}" +
    ".a101-p i{position:relative;display:inline-block;width:64px;height:6px;border-radius:3px;background:color-mix(in srgb,var(--line) 70%,transparent);overflow:hidden}" +
    ".a101-p i em{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--acc,#7c9cff)}" +
    ".a101-p b{font-weight:700;color:var(--text);font-variant-numeric:tabular-nums}" +
    ".a101-c{display:inline-block;font-size:12.5px;line-height:1.35;padding:3px 9px;border-radius:999px;background:var(--panel2);color:var(--sub);white-space:nowrap}" +
    ".a101-c b{color:var(--text);font-variant-numeric:tabular-nums}.a101-c.ok{background:rgba(77,212,122,.14)}.a101-c.no{background:rgba(255,107,107,.13)}" +
    ".a101-c .up{color:#ff6b6b}.a101-c .dn{color:#5aa9ff}" +
    /* A10-2 */
    ".mk-so{border-left:3px solid color-mix(in srgb,var(--acc,#7c9cff) 70%,transparent);padding-left:9px;font-size:15px;color:var(--text);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;cursor:pointer}" +
    ".mk-so.a102-open{display:block;-webkit-line-clamp:unset}" +
    /* A10-3 */
    ".mk-rows div span{min-width:0}.mk-rows div b{flex:none;white-space:nowrap;text-align:right}" +
    ".kpis2 .kp>span.a103{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}" +
    ".kpis2 .kp>span.a103>span.a103c{display:inline-block;white-space:nowrap;font-size:12.5px;padding:1px 7px;border-radius:999px;background:color-mix(in srgb,var(--line) 55%,transparent)}" +
    "#live .kv small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#live .kv b{display:block;white-space:nowrap}" +
    /* A10-4 */
    "#dates .date{position:relative;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
    "#dates .date.a104:after{content:'';position:absolute;left:10px;right:10px;bottom:4px;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--kr) 0 48%,transparent 48% 52%,var(--us) 52% 100%)}" +
    "#dates .date.on{border-width:2px}" +
    "#dates .date.a104-hol{opacity:.55;transform:scale(.92)}#dates .date.a104-hid{display:none}" +
    "#dates .date .a104-rv{margin-left:4px;font-size:12.5px;padding:0 5px;border-radius:6px;background:color-mix(in srgb,var(--line) 60%,transparent)}" +
    ".a104-lg{font-size:12.5px;color:var(--dim);margin:-8px 0 10px}" +
    ".a104-tip{position:fixed;z-index:60;max-width:300px;padding:10px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:13.5px;line-height:1.5;color:var(--text)}" +
    ".a104-tip small{display:block;color:var(--dim);font-size:12.5px;margin-bottom:3px}" +
    /* A10-5 */
    "#mknow{margin:0 0 4px}#mknow .mknow-h{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--sub);margin:2px 2px 6px}" +
    "#mknow .mknow-h b{color:var(--text);font-weight:700}#mknow .mknow-h button{margin-left:auto;border:0;background:none;color:var(--dim);font:inherit;font-size:12.5px;cursor:pointer}";
  document.head.appendChild(css);

  /* ---------- A10-1 할 일 확률 띠 + 지금 칩 ---------- */
  function liveChip(text, todayK, FH, LU, FL){
    var md = text.match(/(\d{1,2})\/(\d{1,2})/); if (!md) return "";
    var fdate = todayK.ymd.slice(0, 4) + "-" + ("0" + md[1]).slice(-2) + "-" + ("0" + md[2]).slice(-2);
    // ① 외국인 코스피 순매수 — 네이버 일별(장중 잠정) foreign_hist.json 그날 값
    if (/외국인/.test(text) && /순매수/.test(text)){
      if (fdate !== todayK.ymd) return "";
      if (todayK.dow === 0 || todayK.dow === 6) return "";
      if (todayK.t < 9 * 60) return '<span class="a101-c">🇰🇷 장 열리면 보여요 (09:00~)</span>';
      var v = FH && FH[fdate]; if (v == null) return '<span class="a101-c">외국인 자료 기다리는 중</span>';
      var closed = todayK.t >= 15 * 60 + 40, ok = v > 0;
      return '<span class="a101-c ' + (ok ? "ok" : "no") + '">' + (closed ? "마감 → " : "지금 → ") + '외국인 <b class="' + (v > 0 ? "up" : "dn") + '">' + fmtN(v) + '억</b> ' + (closed ? "(잠정)" : "(장중 잠정)") + ' · ' + (ok ? "✓쪽" : "✗쪽") + '</span>';
    }
    // ② XLE 가 S&P 보다 강함 — 미국 그날 장(밤 10:30~) 시작 뒤에만
    if (/XLE/.test(text) && /S&P/.test(text) && /강/.test(text)){
      var fx = FL && FL.px && FL.px.XLE, ix = LU && (LU.index || []).filter(function(x){ return /S&P/.test(x.name); })[0];
      var inSess = FL && fx && ((FL.date === fdate && String(fx.at) >= "22:30") || (FL.date === addDay(fdate, 1) && String(fx.at) <= "07:00"));
      if (inSess && ix && LU.sess === fdate && fx.r != null && ix.chg != null){
        var ok2 = fx.r > ix.chg, after = FL.date === addDay(fdate, 1) && String(fx.at) >= "05:00";
        return '<span class="a101-c ' + (ok2 ? "ok" : "no") + '">' + (after ? "마감 → " : "지금 → ") + 'XLE <b class="' + (fx.r >= 0 ? "up" : "dn") + '">' + pct(fx.r) + '</b> vs S&P <b class="' + (ix.chg >= 0 ? "up" : "dn") + '">' + pct(ix.chg) + '</b> · ' + (ok2 ? "✓쪽" : "✗쪽") + ' <small>' + esc(fx.at) + '</small></span>';
      }
      if (fdate === todayK.ymd || (fdate === addDay(todayK.ymd, -1) && todayK.t < 5 * 60)) return '<span class="a101-c">🇺🇸 장 열리면 보여요 (밤 10:30~)</span>';
      return "";
    }
    return "";   // 재는 숫자가 정해지지 않은 줄 → 칩 없음
  }
  var A101_BUSY = false;
  function decorateTodo(){
    var box = document.querySelector(".xtodo"); if (!box || box.dataset.a101 || A101_BUSY) return;
    var id = curId(); if (!id) return;
    A101_BUSY = true;
    Promise.all([getJSON(file("market", id, "data.json")).catch(function(){ return null; }), X("foreign_hist.json", 300000), X("live_us.json", 60000), X("focus_live.json", 60000)]).then(function(r){
      A101_BUSY = false;
      box = document.querySelector(".xtodo"); if (!box || box.dataset.a101) return;
      box.dataset.a101 = "1";
      var d = r[0] || {}, P = d.forecasts_p || [], latest = isLatest(), K = kst();
      [].forEach.call(box.querySelectorAll(".xtd"), function(row, i){
        var body = row.querySelector(":scope > div"); if (!body) return;
        var p = P[i], h = "";
        if (p != null && p >= 0 && p <= 1) h += '<span class="a101-p" title="리포트가 아침에 매긴 확률"><i><em style="width:' + Math.round(p * 100) + '%"></em></i><b>' + Math.round(p * 100) + '%</b></span>';
        if (latest) h += liveChip(body.textContent, K, r[1], r[2], r[3]);
        if (h){ var w = document.createElement("div"); w.className = "a101"; w.innerHTML = h; body.appendChild(w); }
      });
      if (latest && P.length){ var n = document.createElement("div"); n.className = "mut"; n.style.cssText = "font-size:12.5px;margin-top:6px";
        n.textContent = "막대 = 리포트가 아침에 매긴 확률 · 「지금 →」 = 장중 숫자로 본 방향(판정은 마감 합계로)"; box.appendChild(n); }
      placeNow();
    }, function(){ A101_BUSY = false; });
  }

  /* ---------- A10-2 → 결론 줄 누르면 펼침 ---------- */
  document.addEventListener("click", function(ev){
    var s = ev.target.closest && ev.target.closest(".mk-so"); if (!s || ev.target.closest("a,button")) return;
    s.classList.toggle("a102-open");
  });

  /* ---------- A10-3 숫자 한 줄 ---------- */
  var SHORT = [[/^코스피 외국인 순매수.*|^외국인 순매수$/, "외국인"], [/^미 10년 금리$/, "美 10년"], [/^SK하이닉스$/, "하이닉스"], [/^달러\/원$/, "달러/원"], [/^달러지수$/, "달러지수"]];
  function fixNumbers(){
    [].forEach.call(document.querySelectorAll(".kpis2 .kp > span:not(.a103):not(.kp-now)"), function(s){
      var t = s.textContent.trim(); if (t.indexOf(" · ") < 0){ s.classList.add("a103"); return; }
      var parts = t.split(/\s·\s/);
      s.classList.add("a103"); s.innerHTML = parts.map(function(x){ return '<span class="a103c">' + esc(x) + '</span>'; }).join("");
    });
    [].forEach.call(document.querySelectorAll("#live .kv"), function(kv){
      var sm = kv.querySelector("small");
      if (sm && !sm.dataset.a103){
        sm.dataset.a103 = "1";
        [].forEach.call(sm.childNodes, function(n){ if (n.nodeType !== 3) return; var t = n.textContent.trim();
          SHORT.forEach(function(p){ if (p[0].test(t)){ sm.title = t; n.textContent = p[1]; } }); });
      }
      var b = kv.querySelector("b"); if (!b || b.dataset.a103 === b.textContent) return;
      b.dataset.a103 = b.textContent; b.style.fontSize = "";
      var fs = parseFloat(getComputedStyle(b).fontSize) || 14, n = 0;
      while (b.scrollWidth > b.clientWidth + 1 && fs > 11 && n++ < 8){ fs -= 1; b.style.fontSize = fs + "px"; }
    });
  }

  /* ---------- A10-4 날짜 칩 ---------- */
  var PERF = null;
  function decorateDates(){
    var box = document.getElementById("dates"); if (!box || box.dataset.a104 || window.cur !== "market") return;
    box.dataset.a104 = "1";
    var bs = [].slice.call(box.querySelectorAll(".date"));
    var ids = {}; bs.forEach(function(b){ ids[b.dataset.id] = b; });
    bs.forEach(function(b){
      var id = b.dataset.id || "", d = id.slice(0, 10), tag = id.slice(11);
      if (tag === "HOL") b.classList.add("a104-hol");
      if (tag === "WEEK" && ids[d + "_WK"]){             // 같은 날 「WK」 칩 하나로 — 📝 누르면 주간 회고
        b.classList.add("a104-hid");
        var wk = ids[d + "_WK"], rv = document.createElement("span"); rv.className = "a104-rv"; rv.textContent = "📝 회고"; rv.title = "주간 회고 열기";
        rv.onclick = function(ev){ ev.stopPropagation(); b.click(); };
        wk.appendChild(rv);
      }
    });
    if (!box.nextElementSibling || !box.nextElementSibling.classList.contains("a104-lg")){
      var lg = document.createElement("div"); lg.className = "a104-lg";
      lg.textContent = "";   // 🧊 11/09 ⑨ 설명 문장(「밑줄 왼쪽…」) 대신 고른 날의 숫자를 그림 옆에 바로 (아래 PERF 받은 뒤)
      box.parentNode.insertBefore(lg, box.nextSibling);
    }
    (PERF ? Promise.resolve(PERF) : X("market_perf.json", 600000)).then(function(m){
      if (!m || !m.dates) return; PERF = m;
      var col = function(c){ if (c == null || isNaN(c)) return "transparent"; if (Math.abs(c) < 0.05) return "color-mix(in srgb,var(--dim) 60%,transparent)";
        var a = Math.min(1, 0.3 + Math.abs(c) / 3).toFixed(2); return c > 0 ? "rgba(255,107,107," + a + ")" : "rgba(90,169,255," + a + ")"; };
      // 🧹 11/12 「코스피 0.0%」 고침 — 야후가 그날 종가를 아직 안 줘서 앞날 값을 그대로 이어 붙인 날(값이 똑같음)은 0.0% 가 아니라 「–」
      var chg = function(arr, i){ return i > 0 && arr && arr[i] != null && arr[i - 1] && arr[i] !== arr[i - 1] ? (arr[i] / arr[i - 1] - 1) * 100 : null; };
      bs.forEach(function(b){
        var d = (b.dataset.id || "").slice(0, 10), md = d.slice(5).replace("-", "/"), i = m.dates.indexOf(md); if (i < 1) return;
        var k = chg(m.kospi, i), s = chg(m.sp500, i);
        b.style.setProperty("--kr", col(k)); b.style.setProperty("--us", col(s)); b.classList.add("a104");
        b.title = "그날 코스피 " + (k == null ? "–" : pct(k)) + " · S&P " + (s == null ? "–" : pct(s)) + " (리포트 성적표 기준)";
        b.dataset.kr = k == null ? "" : pct(k); b.dataset.us = s == null ? "" : pct(s);
      });
      var on_ = box.querySelector(".date.on") || bs[0], lg_ = box.nextElementSibling, td_ = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      if (on_ && (on_.dataset.id || "").slice(0, 10) === td_) on_ = bs.filter(function(x){ return (x.dataset.id || "").slice(0, 10) < td_ && (x.dataset.kr || x.dataset.us); })[0] || null;   // 오늘은 아직 채점 전 → 마지막 거래일
      if (on_ && lg_ && lg_.classList.contains("a104-lg") && (on_.dataset.kr || on_.dataset.us)){
        var cc = function(t){ return /^\+/.test(t) ? "#f04452" : /^[−-]/.test(t) ? "#3182f6" : "inherit"; };
        lg_.innerHTML = '<b>' + esc(on_.textContent.replace(/📝.*$/, "").trim()) + '</b> 그날 <span style="border-bottom:3px solid var(--kr)">🇰🇷 코스피 <b style="color:' + cc(on_.dataset.kr) + '">' + esc(on_.dataset.kr || "–") + '</b></span> · <span>🇺🇸 S&P <b style="color:' + cc(on_.dataset.us) + '">' + esc(on_.dataset.us || "–") + '</b></span>';
        lg_.style.setProperty("--kr", on_.style.getPropertyValue("--kr") || "transparent");
      }
    });
    // 길게 누르면 그날 한 줄
    bs.forEach(function(b){
      var T = null, fired = false;
      var close = function(){ var o = document.querySelector(".a104-tip"); if (o) o.remove(); };
      b.addEventListener("pointerdown", function(){ fired = false; clearTimeout(T); T = setTimeout(function(){
        fired = true; close();
        var id = b.dataset.id, tip = document.createElement("div"); tip.className = "a104-tip";
        var r = b.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(window.innerWidth - 308, r.left)) + "px"; tip.style.top = (r.bottom + 6) + "px";
        tip.innerHTML = "<small>" + esc(b.title || id) + "</small>불러오는 중…"; document.body.appendChild(tip);
        getJSON(file("market", id, "data.json")).then(function(d){ tip.innerHTML = "<small>" + esc(b.title || id) + "</small>" + esc(String(d.one_liner || "한 줄 없음").replace(/<[^>]+>/g, "")); })
          .catch(function(){ tip.innerHTML = "<small>" + esc(b.title || id) + "</small>이 날은 한 줄 요약이 없어요"; });
        setTimeout(function(){ document.addEventListener("pointerdown", function off(){ close(); document.removeEventListener("pointerdown", off, true); }, true); }, 50);
      }, 550); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function(evn){ b.addEventListener(evn, function(){ clearTimeout(T); }); });
      b.addEventListener("click", function(ev){ if (fired){ ev.stopImmediatePropagation(); ev.preventDefault(); fired = false; } }, true);
      b.addEventListener("contextmenu", function(ev){ ev.preventDefault(); });
    });
  }

  /* ---------- A10-5 지금 볼 것 ---------- */
  function slot(){
    var K = kst(), wk = K.dow >= 1 && K.dow <= 5;
    if (K.dow === 6 && K.t < 6 * 60) return {k: "us", lab: "🇺🇸 미국 장 (밤)"};
    if (!wk) return {k: "us", lab: "주말 — 🇺🇸 마지막 장"};
    if (K.t < 6 * 60) return {k: "us", lab: "🌙 밤 — 🇺🇸 미국 장중"};
    if (K.t < 9 * 60) return {k: "am", lab: "🌅 아침 — 밤사이 움직임"};
    if (K.t < 15 * 60 + 30) return {k: "kr", lab: "🌞 한국 장중 — 실시간 시장판"};
    if (K.t < 22 * 60 + 30) return {k: "eve", lab: "🌆 저녁 — 오늘 할 일 결과"};
    return {k: "us", lab: "🌙 밤 — 🇺🇸 미국 장중"};
  }
  function findCard(re){ var c = null; [].some.call(document.querySelectorAll("#body section.card, #body details.card"), function(x){
    var h = x.querySelector(":scope > h3, :scope > summary, :scope > .mk-lab"); if (h && re.test(h.textContent)){ c = x; return true; } }); return c; }
  function placeNow(){
    if (window.cur !== "market" || uiMkt() === "fixed" || !isLatest()) return;
    var body = document.getElementById("body"), mh = document.getElementById("mhead"); if (!body || !mh || !mh.firstChild) return;
    var S = slot(), el = null;
    if (S.k === "kr" || S.k === "us") el = document.getElementById("live");
    else if (S.k === "eve") el = document.querySelector(".xtodo");
    else if (S.k === "am"){
      el = findCard(/밤사이 가장 크게/);
      if (el && el.classList.contains("xs-hid")){
        el.classList.remove("xs-hid"); el.dataset.xs = "keep";
        [].forEach.call(document.querySelectorAll("#xs-more .xs-row"), function(r){ if (/밤사이 가장 크게/.test(r.textContent)) r.remove(); });
        var n = document.querySelectorAll("#xs-more .xs-row").length, xn = document.getElementById("xs-n"); if (xn) xn.textContent = n + "개 · 누르면 열려요";
      }
    }
    if (!el || !el.innerHTML.trim()) return;
    var box = document.getElementById("mknow");
    if (box && box.contains(el)) return;
    if (!box){
      box = document.createElement("div"); box.id = "mknow";
      box.innerHTML = '<div class="mknow-h">⏰ 지금 볼 것 · <b></b><button type="button">고정 순서로</button></div>';
      box.querySelector("button").onclick = function(){ try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); u.mkt = "fixed"; localStorage.setItem("ui", JSON.stringify(u)); } catch(x) {}
        if (window.chToast) chToast("시황 순서를 고정했어요 · ⚙️ 에서 다시 켤 수 있어요"); go("market", curId()); };
    }
    box.querySelector("b").textContent = S.lab;
    if (mh.nextSibling !== box) mh.parentNode.insertBefore(box, mh.nextSibling);
    box.appendChild(el);
  }

  /* ---------- 붙이기 ---------- */
  var T = null;
  function run(){ T = null; if (window.cur !== "market") return; decorateDates(); decorateTodo(); fixNumbers(); placeNow(); }
  function kick(){ if (!T) T = setTimeout(run, 250); }
  function start(){
    var main = document.getElementById("main"); if (!main){ setTimeout(start, 300); return; }
    new MutationObserver(kick).observe(main, {childList: true, subtree: true});
    kick();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
;
/* ======== ux1015c.js ======== */
/* CH Investing — 📱 신호 탭 A12-1~5 (10/15 사용자 「다 진행해」)
   ① A12-5 신호 묶음 위 작은 탭 4개(🐋 ☕ 📈 🔎)에 오늘 숫자 배지 + 오늘 새로 생긴 게 있으면 점
   ② A12-1·2·3·4 화면 모양(CSS) — 그리는 코드는 views.js(이름·정렬·고래 묶음)·extras.js(돌파 임박 지금 값)
*/
(function(){
  var CNT = null, CNT_T = 0;
  function lat(cat, f){
    var L = ((window.M && M.cats && M.cats[cat]) || []).filter(function(x){ return x.files.indexOf(f) >= 0; });
    return L.length ? getJSON(file(cat, L[0].id, f)).catch(function(){ return null; }) : Promise.resolve(null);
  }
  function counts(){
    if (CNT && Date.now() - CNT_T < 300000) return CNT;
    CNT_T = Date.now();
    CNT = Promise.all([lat("whale", "data.json"), lat("cup", "cards.json"), lat("gap", "cards.json"), lat("screen", "screens.json")]).then(function(r){
      var o = {};
      var w = r[0] && r[0].signals;
      if (w) o.whale = {n: (w.big || []).length, t: "숫자 = 고래 큰 신규 매수 " + (w.big || []).length + "종목", dot: (w.big || []).length > 0};
      var c = r[1];
      if (c && c.top){
        var near = c.top.filter(function(x){ return x.dist != null && x.dist >= -3 && x.dist < 0 && !x.brk; }).length;
        var nw = c.top.filter(function(x){ return x.streak === 1; }).length;
        o.cup = {n: near ? "🎯" + near : c.total, s: "", t: (near ? "숫자 = 돌파 임박 " + near + "종목 · " : "") + "컵 패턴 " + c.total + "종목" + " · 오늘 새로 " + nw, dot: nw > 0};
      }
      var g = r[2];
      if (g && g.top){
        var gn = g.top.filter(function(x){ return x.new || x.fresh || x.streak === 1; }).length;
        o.gap = {n: g.total, t: "갭 돌파 " + g.total + "종목 · 오늘 새로 " + gn, dot: gn > 0};
      }
      var s = r[3];
      if (s){
        var u = {};
        ["quiet", "lead", "hush", "triple"].forEach(function(k){ (s[k] || []).forEach(function(x){ u[(x && (x.code || x.s || x.t || x.sym)) || JSON.stringify(x)] = 1; }); });
        var n = Object.keys(u).length;
        if (n) o.screen = {n: n, t: "거름망 4개에 걸린 종목 " + n + "개 (겹친 것 한 번)", dot: false};
      }
      return o;
    }).catch(function(){ return {}; });
    return CNT;
  }
  window.subBadges = function(nav){
    nav = nav || document.getElementById("tabs");
    if (!nav || !nav.querySelector('[data-k="cup"],[data-k="whale"]')) return;
    counts().then(function(o){
      [].forEach.call(nav.querySelectorAll("button[data-k]"), function(b){
        var x = o[b.dataset.k]; if (!x || b.querySelector(".tbg")) return;
        var em = document.createElement("em"); em.className = "tbg" + (x.dot ? " dot" : "");
        em.textContent = (typeof x.n === "number" ? x.n.toLocaleString() : x.n) + (x.s ? " · " + x.s : "");
        em.setAttribute("role", "button"); em.setAttribute("aria-label", x.t + " — 누르면 그 종목으로");
        em.onclick = function(ev){ ev.stopPropagation(); ev.preventDefault(); jump(b.dataset.k); };
        b.appendChild(em); b.title = x.t;
      });
    });
  };
  /* 숫자를 누르면 → 그 탭의 그 종목들 자리로 이동 (10/15 사용자 「숫자 누르면 그 종목들만 보이게 혹은 위치로 이동」)
     🐋 큰 신규 매수만 남겨 보이기 · ☕ 돌파 임박 카드(접힌 줄까지 펼침) · 📈 갭 목록 · 🔎 거름망 고르는 칸 */
  var ANCH = {whale: "wsig", cup: "xnear", gap: "gseg", screen: "scrk"};
  var LEG = {whale: ["🐋", "큰 신규 매수"], cup: ["☕", "돌파 임박"], gap: ["📈", "갭 돌파"], screen: ["🔎", "거름망 4개 종목"]};
  function jump(k){
    var id = ANCH[k]; if (!id) return;
    if (typeof go === "function" && window.cur !== k) go(k);
    var t0 = Date.now();
    (function find(){
      var el = document.getElementById(id);
      if (!el){ if (Date.now() - t0 < 8000) setTimeout(find, 150); return; }
      var card = el.closest(".card") || el;
      if (k === "cup"){ var t1 = Date.now(); (function more(){ var bt = card.querySelector(".td-more");   // 접힌 「＋N개 더 보기」(tidy.js)가 붙으면 펼침
        if (bt){ if (/더 보기/.test(bt.textContent)) bt.click(); return; } if (Date.now() - t1 < 2500) setTimeout(more, 150); })(); }
      if (k === "whale") whaleOnly(el.closest(".card"));
      setTimeout(function(){
        var hd = document.querySelector("header"), y = card.getBoundingClientRect().top + window.scrollY - ((hd ? hd.offsetHeight : 0) + 10);
        window.scrollTo({top: Math.max(0, y), behavior: "smooth"});
        card.classList.add("flash"); setTimeout(function(){ card.classList.remove("flash"); }, 1800);
      }, 120);
    })();
  }
  window.sigJump = jump;
  function whaleOnly(card){
    if (!card) return;
    var chips = card.querySelectorAll(".wsgc"), n = 0;
    [].forEach.call(chips, function(c){ var on = (" " + (c.getAttribute("data-g") || "") + " ").indexOf(" big ") >= 0; c.classList.toggle("wsg-off", !on); if (on) n++; });
    var bar = card.querySelector(".wsg-only");
    if (!bar){ bar = document.createElement("div"); bar.className = "wsg-only"; var w = card.querySelector(".wsg"); if (w) w.parentNode.insertBefore(bar, w); }
    bar.innerHTML = "🆕 <b>큰 신규 매수 " + n + "종목</b>만 보는 중 <button type='button'>전체 보기 ✕</button>";
    bar.querySelector("button").onclick = function(){ [].forEach.call(chips, function(c){ c.classList.remove("wsg-off"); }); bar.remove(); };
  }
  // 뜻풀이 한 줄 — 신호 화면 맨 위 (누르면 위와 똑같이 이동)
  function legend(){
    var main = document.querySelector("main"); if (!main || !LEG[window.cur]) return;
    if (main.querySelector("#sgleg")) return;
    counts().then(function(o){
      if (!LEG[window.cur] || main.querySelector("#sgleg")) return;
      var ks = ["whale", "cup", "gap", "screen"].filter(function(k){ return o[k]; }); if (!ks.length) return;
      var d = document.createElement("div"); d.id = "sgleg";
      d.innerHTML = '<small>탭 위 숫자 · 누르면 그 종목으로</small>' + ks.map(function(k){ var x = o[k];
        return '<button type="button" data-j="' + k + '" class="' + (x.dot ? "dot" : "") + '"><i>' + (typeof x.n === "number" ? x.n.toLocaleString() : x.n) + '</i>' + LEG[k][0] + " " + LEG[k][1] + '</button>'; }).join("") +
        '<small class="sgl-k">빨간 숫자 = 오늘 새로 들어온 게 있음</small>';
      [].forEach.call(d.querySelectorAll("[data-j]"), function(b){ b.onclick = function(){ jump(b.dataset.j); }; });
      main.insertBefore(d, main.firstChild);
    });
  }
  (function watch(){
    var main = document.querySelector("main");
    if (!main){ setTimeout(watch, 300); return; }
    new MutationObserver(function(){ if (LEG[window.cur] && !main.querySelector("#sgleg")) legend(); }).observe(main, {childList: true});
    legend();
  })();

  // 그려져 있는 탭에도 (처음 열 때)
  setTimeout(function(){ try { window.subBadges(); } catch(x) {} }, 600);

  var css = document.createElement("style");
  css.textContent =
    // A12-5 탭 배지 — 오른쪽 위 작은 숫자 방울(탭 폭은 그대로 · 오늘 새로 생긴 게 있으면 빨강)
    "header .tabs.sub:has(.tbg){padding-top:7px}header .tabs.sub .tab{position:relative}" +
    "header .tabs.sub .tab .tbg{position:absolute;top:-7px;right:-5px;font-style:normal;font-size:12.5px;font-weight:800;line-height:16px;min-width:16px;padding:0 5px;border-radius:999px;background:#3a4256;color:#fff;box-shadow:0 0 0 2px var(--bg);white-space:nowrap;cursor:pointer}header .tabs.sub .tab .tbg::before{content:'';position:absolute;inset:-8px}" +
    "header .tabs.sub .tab .tbg.dot{background:#e5484d}" +
    // 뜻풀이 줄 · 고래 「큰 신규 매수만」
    "#sgleg{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 2px 12px}#sgleg small{flex-basis:100%;color:var(--sub);font-size:12.5px}#sgleg small.sgl-k{font-size:12.5px;color:var(--dim)}" +
    "#sgleg button{border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit;font-size:12.5px;border-radius:999px;padding:4px 10px 4px 4px;display:inline-flex;align-items:center;gap:6px;cursor:pointer}" +
    "#sgleg button i{font-style:normal;font-weight:800;font-size:12.5px;background:#3a4256;color:#fff;border-radius:999px;padding:1px 6px;min-width:18px;text-align:center}#sgleg button.dot i{background:#e5484d}" +
    ".wsgc.wsg-off{display:none}.wsg-only{font-size:13px;margin:0 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.wsg-only button{border:1px solid var(--line);background:var(--panel);color:var(--sub);font:inherit;font-size:12.5px;border-radius:999px;padding:2px 9px;cursor:pointer}" +
    // A12-1 이름 한 줄
    ".cc .nm2 b[data-nmk]{word-break:keep-all}.cc .nm2{min-width:0}" +
    // A12-2 고래 오늘의 신호
    ".wsg-top{margin:0 0 8px;font-size:14px}.wsg-top a{color:inherit}" +
    ".wsg{display:flex;flex-wrap:wrap;gap:6px}.wsgc .wsgi{font-size:12.5px;margin-left:2px;letter-spacing:1px}.wsg-k{margin:8px 0 0!important;font-size:12.5px}" +
    // A12-3 돌파 임박 지금 값
    ".xr .xnl{flex-basis:100%;text-align:right;font-size:12.5px;color:var(--dim);margin-top:-2px}.xr .xnl.on{color:var(--sub)}.xr .xnl.was{color:#2bb673}" +
    ".xr.xbrk{background:color-mix(in srgb,#2bb673 14%,transparent);border-radius:10px}.xr.xbrk .xnd{color:#2bb673!important}.xr.xbrk .xbar i{background:#2bb673!important}" +
    ".xr{flex-wrap:wrap}" +
    // A12-4 며칠째
    ".seg2.srt{margin-top:-4px}.seg2.srt button{font-size:12.5px}" +
    ".cc .nwdot{font-style:normal;color:#ff9f43;font-size:12.5px;margin-right:4px;vertical-align:2px}" +
    ".cc.old{background:color-mix(in srgb,var(--panel) 70%,var(--bg));border-color:color-mix(in srgb,var(--line) 60%,transparent)}" +
    ".cc.old .nm2 b{color:var(--sub)}";
  document.head.appendChild(css);
})();
;
/* ======== ux1019.js ======== */
/* 🎲 10/19 「오늘, 확률로 말하면」 — 🏠 오늘 탭 맨 위 한 장
   사용자 10/19: "시황두뇌랑 시장확률을 이렇게 열심히 돌리고 있는데 틀려도 좋으니 확률적으로 이렇다 라고
   오늘 카테고리 처음에 좀 강하게 얘기를 해라 · 쉽고 직관적이게 · 그때 그때 바꿔서"
   자료: archive/x/prob.json(🎲 매시간) · market/home.json brain(🧠 매시간) · brain/state.json theses
   시간대에 따라 주인공 시장이 바뀐다: 한국 장 전·장중 = 🇰🇷 코스피 · 저녁·밤 = 🇺🇸 미국. 숫자는 prob.json 그대로(새 계산 없음). */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function J(u){ return getJSON(u + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }
  function pct(p){ return Math.round(p * 100); }
  function ten(p){ return Math.max(0, Math.min(10, Math.round(p * 10))); }
  /* 세게 말하기 — 확률 → 한 마디 (틀려도 좋다는 전제) */
  // ⚡ 10/19: 장이 아직 많이 남았으면(남은 시간 40%↑) 「거의 확실히」라고 하지 않음 — 10:18 「12% 거의 확실히 내린다」 뒤 10:23 플러스 전환
  /* 🔒 10/19 사용자 「너의 확률이 이리 개판」 → 「ㅇㅇ 적용해」: 다음 날 방향 성적이 동전보다 확실히 나아지기 전(20건↑ · 적중 55%↑)엔
     세게 말하지 않는다 — 「반반」·「약간 ○○ 쪽」까지만. 성적은 prob.json score.all.d1 (매일 채점) */
  var PROVEN = false, WEAK = false;
  function gate(P){ var d = P && P.score && P.score.all && P.score.all.d1 || {}; PROVEN = (d.n || 0) >= 20 && (d.hit || 0) >= 55; WEAK = (d.n || 0) >= 20 && (d.hit || 0) < 50; return d; }
  function word(p, soft){
    /* 🩶 10/31 A4: 실전 적중이 동전(50%)보다 못한 동안엔 색을 빼고 「참고」로 — 큰 빨강·파랑 제목이 믿을 만해 보이지 않게 */
    if (WEAK){
      if (p >= 0.55) return {t: "약간 오를 쪽 · 참고만", c: "flat"};
      if (p <= 0.45) return {t: "약간 내릴 쪽 · 참고만", c: "flat"};
      return {t: "반반 — 동전 던지기", c: "flat"};
    }
    if (!PROVEN){
      if (p >= 0.60) return {t: "오를 쪽 (검증 전)", c: "up"};
      if (p >= 0.55) return {t: "약간 오를 쪽", c: "up"};
      if (p <= 0.40) return {t: "내릴 쪽 (검증 전)", c: "dn"};
      if (p <= 0.45) return {t: "약간 내릴 쪽", c: "dn"};
      return {t: "반반 — 동전 던지기", c: "flat"};
    }
    if (soft && p >= 0.70) return {t: "오른다 쪽에 세게", c: "up2"};
    if (soft && p <= 0.30) return {t: "내린다 쪽에 세게", c: "dn2"};
    if (p >= 0.70) return {t: "거의 확실히 오른다", c: "up2"};
    if (p >= 0.60) return {t: "오른다 쪽에 세게", c: "up"};
    if (p >= 0.55) return {t: "오를 쪽", c: "up"};
    if (p > 0.45)  return {t: "반반 — 동전 던지기", c: "flat"};
    if (p > 0.40)  return {t: "내릴 쪽", c: "dn"};
    if (p > 0.30)  return {t: "내린다 쪽에 세게", c: "dn"};
    return {t: "거의 확실히 내린다", c: "dn2"};
  }
  function kst(){ var d = new Date(Date.now() + 9 * 3600e3); return {m: d.getUTCHours() * 60 + d.getUTCMinutes(), day: d.getUTCDay(), ymd: d.toISOString().slice(0, 10)}; }
  /* 지금 시각의 주인공 — 한국 장 전·장중(06:00~15:30) 🇰🇷 · 그 뒤 🇺🇸 · 주말은 다음 주 월요일 이야기 */
  /* 10/31 A2: 금요일 밤에도 「내일 코스피」라던 것 → 실제 다음 장 요일 (prob.json next_day) */
  function nextKr(kr, K){
    var nd = kr && kr.next_day; if (!nd) return K.day === 0 || K.day === 6 ? "월요일" : "내일";
    var dd = Math.round((Date.parse(nd + "T00:00:00Z") - Date.parse(K.ymd + "T00:00:00Z")) / 864e5);
    return dd === 1 ? "내일" : dd === 0 ? "오늘" : ["일", "월", "화", "수", "목", "금", "토"][new Date(nd + "T00:00:00Z").getUTCDay()] + "요일";
  }
  function lead(P, K){
    var M = P.markets || {}, kr = M.KR, us = M.US, wk = K.day === 0 || K.day === 6;
    if (!wk && K.m >= 6 * 60 && K.m < 15 * 60 + 30 && kr) return {mk: kr, when: kr.open_now && kr.intra_chg != null ? "오늘 종가" : "오늘", other: us, otherWhen: "오늘 밤 미국"};
    if (us) return {mk: us, when: wk ? "다음 미국 장" : (K.m >= 22 * 60 + 30 || K.m < 6 * 60 ? "지금 미국 장" : "오늘 밤 미국"), other: kr, otherWhen: nextKr(kr, K) + " 코스피"};
    return kr ? {mk: kr, when: "내일", other: null} : null;
  }
  function anchorLine(mk){
    var a = (mk.methods || []).filter(function(x){ return x.anchor && x.p1 != null; })[0];
    if (!a) return "";
    var ev = String(a.ev || "").split("→")[0].replace(/\(.*?\)/g, "").trim();
    return ev ? a.ic + " " + ev : "";
  }

  /* ⚡ 10/19 사용자: 「두뇌가 확률을 얘기했으면 실시간으로 — 지금 반등이 나오고 있고 종가 플러스 확률이 올라가고 있고 어느 섹터가 강하니
     이쪽을 보자 · 장이 계속 밀리니 어디 섹터는 특히 조심하고 현금 비중을 어느 선까지 — 확률적으로 직관적으로」
     장중 나침반(10분마다) 흐름으로: ① 종가 플러스 확률이 어떻게 움직였나 ② 지금 볼 곳 / 조심할 곳(섹터·대형주) ③ 🎯 집중 ★종목 지금 ④ 규칙에 있는 대응만(현금 선 · 급락일 쉬기) */
  function pc2(v){ return (v > 0 ? "+" : "") + v.toFixed(1) + "%"; }
  function cl2(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function nowBlock(mk, L, lv, F, FL, CONC){
    if (!L || !window.probAt || !mk) return "";
    if (L.date && L.date !== kst().ymd) return "";                                          // 오늘 나침반만
    var closed = false;
    if (!lv){                                                                               // ⚡ 확률 재계산이 없어도 섹터·종목은 늘 보이게 (10/19 「섹터랑 종목 또 사라짐」)
      var ix = L.index && L.index[0]; if (!ix || ix.chg == null || !L.t) return "";
      var r0 = probAt(mk, ix.chg, L.t); closed = !r0 || /CLOSE/i.test(ix.status || "") || kst().m >= 15 * 60 + 30;
      lv = {t: L.t, chg: ix.chg, p1: r0 ? r0.p1 : (ix.chg > 0 ? 0.99 : ix.chg < 0 ? 0.01 : 0.5)};
    }
    var sn = (L.snaps || []).filter(function(x){ return x && x[3] != null; });
    var pts = sn.map(function(x){ var r = probAt(mk, x[3], x[0]); return r ? [x[0], r.p1] : null; }).filter(Boolean);
    pts = pts.filter(function(x){ return x[0] < lv.t; }); pts.push([lv.t, lv.p1]);
    var nowM = (function(t){ var a = t.split(":"); return +a[0] * 60 + +a[1]; })(lv.t);
    var ago = pts.filter(function(x){ var a = x[0].split(":"); return nowM - (+a[0] * 60 + +a[1]) >= 50; }).slice(-1)[0] || pts[0];
    var d = lv.p1 - ago[1], first = pts[0];
    // 흐름 막대: 시각별 확률 (50% 선 위 빨강 · 아래 파랑)
    var W = 150, H = 34, n = pts.length, xs = function(i){ return n > 1 ? 4 + i * (W - 8) / (n - 1) : W / 2; }, ys = function(p){ return 4 + (1 - p) * (H - 8); };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" class="pl-spark"><line x1="0" x2="' + W + '" y1="' + ys(0.5) + '" y2="' + ys(0.5) + '" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="3 3"/>' +
      '<polyline fill="none" stroke="currentColor" stroke-width="2" points="' + pts.map(function(x, i){ return xs(i).toFixed(1) + "," + ys(x[1]).toFixed(1); }).join(" ") + '"/>' +
      '<circle cx="' + xs(n - 1).toFixed(1) + '" cy="' + ys(lv.p1).toFixed(1) + '" r="3" fill="currentColor"/></svg>';
    var chg = lv.chg, mood;
    if (closed) mood = "🔔 마감 — 코스피 " + pc2(chg);
    else if (d >= 0.10 && lv.p1 >= 0.5) mood = "📈 반등이 붙는 중 — 오를 쪽으로 기울고 있어요";
    else if (d >= 0.10) mood = "↗ 낙폭을 줄이는 중 — 아직은 내릴 쪽";
    else if (d <= -0.10 && lv.p1 <= 0.5) mood = "📉 계속 밀리는 중 — 내릴 쪽으로 기울고 있어요";
    else if (d <= -0.10) mood = "↘ 오름폭을 반납하는 중 — 아직은 오를 쪽";
    else mood = "↔ 1시간 전과 비슷 — 큰 변화 없이 버티는 중";
    var up = L.up || 0, dn = L.down || 0, br = Math.round(up / Math.max(1, up + dn) * 100), br0 = first && sn[0] ? Math.round(sn[0][1] / Math.max(1, sn[0][1] + sn[0][2]) * 100) : null;
    var ss = (L.sectors || []).filter(function(x){ return x.r != null; }).sort(function(a, b){ return b.r - a.r; });
    var bigs = function(x, best){ return (x.big || []).filter(function(t){ return t.r != null && (best ? t.r > 0 : t.r < 0); }).sort(function(a, b){ return best ? b.r - a.r : a.r - b.r; }).slice(0, 1)
      .map(function(t){ return '<a data-op="' + e(t.s) + '">' + e(t.n) + ' <b class="' + cl2(t.r) + '">' + pc2(t.r) + '</b></a>'; }).join(" · "); };
    var good = ss.filter(function(x){ return x.r >= 0.3 && (x.up || 0) >= (x.down || 0); }).slice(0, 2);
    var bad = ss.slice().reverse().filter(function(x){ return x.r <= -0.3; }).slice(0, 1);
    var row = function(ic, lab, list, best){ return list.length ? '<div class="pl-nw"><span class="pl-k">' + ic + ' ' + lab + '</span><div>' + list.map(function(x){ var b = bigs(x, best);
      return '<div class="pl-sr"><b>' + e(x.name) + ' <span class="' + cl2(x.r) + '">' + pc2(x.r) + '</span></b>' + (b ? ' <span class="pl-sm">· ' + b + '</span>' : '') + '</div>'; }).join("") + '</div></div>' : ''; };
    // 🎯 오늘 집중 ★·관심 국내 종목의 지금 값
    var fl = FL && FL.px || {}, st = [];
    ((F && F.themes) || []).forEach(function(t){ (t.kr || []).forEach(function(k){ var q = fl[k.t]; if (q && q.r != null) st.push({n: k.name, t: k.t, r: q.r, star: /★/.test(k.act || ""), th: t.name}); }); });
    st.sort(function(a, b){ return b.r - a.r; });
    var foc = st.length ? '<div class="pl-nw"><span class="pl-k">🎯 집중 종목</span><div class="pl-sm">' + st.slice(0, 3).map(function(x){ return (x.star ? "★ " : "") + '<a data-op="' + e(x.t) + '">' + e(x.n) + ' <b class="' + cl2(x.r) + '">' + pc2(x.r) + '</b></a>'; }).join(" · ") + '</div></div>' : '';
    // 대응 — 규칙에 있는 것만
    var act = [];
    if (closed) {}
    else if (chg <= -3) act.push("⛔ 코스피 −3%↓ — 우리 규칙: 오늘은 신규 진입 쉬기");
    else if (d <= -0.10 && chg < -1) act.push("🛑 밀리는 장 — " + (bad[0] ? e(bad[0].name) + "·" : "") + "약한 쪽은 비중 늘리지 않기");
    else if (d >= 0.10 && lv.p1 >= 0.55 && good[0]) act.push("👀 반등 주도 " + e(good[0].name) + (good[1] ? "·" + e(good[1].name) : "") + " 쪽을 먼저 본다 (추격보다 눌림)");
    var R = CONC && CONC.regime;
    if (R) act.push("💼 현금 규칙: " + (R.up ? "🟢 S&P 200일선 위 → 현금 0%" : "🔴 S&P 200일선 아래 → 현금 26%"));
    return '<div class="pl-now"><div class="pl-nh"><b>' + (closed ? '🇰🇷 오늘 장 마감 ' : '⚡ 지금 장 ') + e(lv.t) + '</b> <span class="pl-sm mut">코스피 <span class="' + cl2(chg) + '">' + pc2(chg) + '</span> · 오른 종목 ' + br + '%' + (br0 != null ? ' (개장 ' + br0 + '%)' : '') + '</span></div>' +
      '<div class="pl-tr ' + (lv.p1 >= 0.5 ? "up" : "dn") + '">' + svg + '<span>' + e(mood) + '</span></div>' +
      row("👀", "볼 곳", good, true) + row("⚠️", "조심", bad, false) + foc +
      (act.length ? '<div class="pl-act">' + act.map(function(x){ return '<div>' + x + '</div>'; }).join("") + '</div>' : '') + '</div>';
  }
  // ⚡ 섹터·대형주·집중 종목 칸은 확률 재계산 여부·주인공 시장(밤엔 🇺🇸)과 상관없이, 오늘 한국 나침반이 있으면 늘 붙임 · 오류가 나도 카드 전체는 살림
  function safeNow(P, L, LV, lv){
    try {
      var kr = L.mk.mk === "KR" ? L.mk : (P.markets && P.markets.KR);
      return nowBlock(kr, LV.KR, L.mk.mk === "KR" ? lv : null, LV.F, LV.FL, LV.CONC) || "";
    } catch(x){ if (window.console) console.warn("nowBlock", x); return ""; }
  }
  function build(P, B, T, LV){
    var K = kst(), L = lead(P, K); if (!L) return "";
    LV = LV || {};
    var SC = gate(P);
    // ⚡ 장중이면 장중 나침반(10분마다)의 지금 등락으로 확률을 다시 계산 (problive.js)
    var lv = window.probLive ? probLive(L.mk, LV[L.mk.mk], P) : null;
    if (lv) L.mk = Object.assign({}, L.mk, {p1: lv.p1, intra_chg: lv.chg});
    if (L.other && window.probLive){ var lo = probLive(L.other, LV[L.other.mk], P); if (lo) L.other = Object.assign({}, L.other, {p1: lo.p1}); }
    var soft = L.mk.open_now && (lv ? lv.rem > 0.4 : true);
    var mk = L.mk, p1 = mk.p1, p5 = mk.p5, w1 = word(p1, soft), w5 = word(p5);
    var strong = PROVEN && (p1 >= 0.6 || p1 <= 0.4);
    var head = e(mk.flag + " " + mk.ixn + " " + L.when) + " → <em>" + e(w1.t) + "</em>";
    var ten1 = ten(p1), ten5 = ten(p5);
    var nums = '<span class="pl-ten ' + w1.c + '" title="오를 확률 ' + pct(p1) + '%">' + "●".repeat(ten1) + "○".repeat(10 - ten1) + ' <b>10번 중 ' + ten1 + '번 오름</b> (' + pct(p1) + '%)</span>';
    var anc = lv ? "⚡ 지금 " + mk.ixn + " " + (lv.chg > 0 ? "+" : "") + lv.chg.toFixed(2) + "% (" + lv.t + " 장중 나침반) · 장 남은 시간 " + Math.round(lv.rem * 100) + "% · 남은 흔들림 " + Math.round(lv.vr * 100) + "% · 하루 흔들림 " + (lv.sig * 100).toFixed(1) + "%" : anchorLine(mk);
    var band = !lv && mk.band1 && mk.band1.length === 2 ? "예상 폭 " + mk.band1[0] + "% ~ +" + mk.band1[1] + "%" : "";
    var wk5 = '<div class="pl-row"><span class="pl-k">일주일 뒤</span><b class="' + w5.c + '">' + e(w5.t) + '</b> <small>10번 중 ' + ten5 + '번 (' + pct(p5) + '%)</small></div>';
    var oth = L.other ? '<div class="pl-row"><span class="pl-k">' + e(L.otherWhen) + '</span><b class="' + word(L.other.p1).c + '">' + e(word(L.other.p1).t) + '</b> <small>' + pct(L.other.p1) + '%</small></div>' : "";
    // 🧠 두뇌 — 국면 + 가장 확신하는 논지 하나
    var th = (T && T.theses || []).slice().sort(function(a, b){ return (b.conf || 0) - (a.conf || 0); })[0];
    var br = (B && (B.regime || B.summary)) ? '<div class="pl-row pl-br"><span class="pl-k">🧠 두뇌</span><div><b>' + e(String(B.regime || "").split(" / ")[0]) + '</b>' +
      (th ? '<small>「' + e(th.t) + '」 확신 ' + pct(th.conf || 0) + '%</small>' : (B.summary ? '<small>' + e(String(B.summary).split(" — ")[0]) + '</small>' : '')) + '</div></div>' : "";
    var sc = P.score && P.score.all && P.score.all.d1 || {}, hit = sc.n ? " · 지금까지 다음 날 방향 " + Math.round(sc.hit / 100 * sc.n) + "/" + sc.n + " 맞음" : "";
    var stale = P.date && P.date !== K.ymd && K.m >= 9 * 60 ? ' <span class="pl-old">(' + e(P.date.slice(5).replace("-", "/")) + ' 계산)</span>' : "";
    /* 🧹 10/21 「오늘 한 장」: 결론 한 줄 + 국면·한 문장 + 볼 곳 — 확률 숫자·10칸 점·검증 경고·일주일 뒤·다른 시장은 🎲 시장확률 탭·📊 성적표로 */
    var reg = B && B.regime ? String(B.regime).split(" / ")[0] : "";
    var one = th ? th.t : (B && B.summary ? String(B.summary).split(/ — |\. /)[0] : "");
    if (one.length > 60) one = one.slice(0, 58) + "…";
    var nowH = safeNow(P, L, LV, lv), look = nowH || focusBlock(LV.HF);
    return '<section class="card pl ' + w1.c + '" data-goto="prob" role="button">' +
      '<div class="pl-top"><span class="pl-ic">🎲</span><div class="pl-h"><small>오늘 한 줄 · ' + e(lv ? lv.t : (P.t || "")) + stale + '</small><div class="pl-head">' + head + '</div></div><span class="pl-go">자세히 ›</span></div>' +
      (reg || one ? '<div class="pl-one">' + (reg ? '<span class="pl-reg">' + e(reg) + '</span>' : '') + e(one) + '</div>' : '') +
      look +
      '<div class="pl-foot">' + (PROVEN ? '' : '아직 검증 중이라 약하게만 말해요 · ') + '사라·팔라는 뜻 아님</div></section>';
  }
  /* 장 전·주말엔 장중 나침반이 없으니 「볼 곳」은 오늘 집중 테마(market/home.json focus)로 */
  function focusBlock(F){
    if (!F || !F.length) return "";
    return '<div class="pl-now"><div class="pl-nh"><b>👀 오늘 볼 곳</b> <span class="pl-sm mut">돈이 몰리는 테마</span></div>' + F.slice(0, 2).map(function(t){
      return '<div class="pl-nw"><span class="pl-k">' + e(t.name) + '</span><div class="pl-sm">' + e(t.stage || "") + (t.r5 != null ? ' · 5일 ' + pc2(t.r5) : '') +
        ((t.stars || []).length ? '<div>' + t.stars.slice(0, 3).map(function(x){ return '★ <a data-op="' + e(x.t) + '">' + e(x.name) + '</a>'; }).join(" · ") + '</div>' : '') + '</div></div>'; }).join("") + '</div>';
  }
  function mount(){
    var body = document.getElementById("hmbody"); if (!body) return;
    var LJ = function(k){ return J("archive/x/live_" + k + ".json").catch(function(){ return null; }); };
    var NL = function(u){ return J(u).catch(function(){ return null; }); };
    Promise.all([J("archive/x/prob.json"), J(RAWM + "market/home.json").catch(function(){ return null; }), J(RAWM + "brain/state.json").catch(function(){ return null; }), LJ("kr"), LJ("us"),
                 NL(RAWM + "market/focus.json"), NL("archive/x/focus_live.json"), NL(RAWM + "market/conc.json")]).then(function(a){
      var html = build(a[0], a[1] && a[1].brain, a[2], {KR: a[3], US: a[4], F: a[5], FL: a[6], CONC: a[7], HF: a[1] && a[1].focus}); if (!html) return;
      var b2 = document.getElementById("hmbody"); if (!b2) return;
      var old = b2.querySelector(".pl"); if (old) old.remove();
      var anchor = b2.querySelector(".hm-live") || b2.querySelector(".hm-day");
      var box = document.createElement("div"); box.innerHTML = html; var el = box.firstChild;
      if (anchor && anchor.nextSibling) b2.insertBefore(el, anchor.nextSibling); else b2.appendChild(el);
    }).catch(function(x){ if (window.console) console.warn("probline", x); });
  }
  // 10/19 사용자 「장 중에도 카드 계속 바꿀 거지?」 → 오늘 탭을 열어 둔 동안 3분마다 다시 받아 그 자리에서 바꿈(🎲 계산은 장중 약 30분마다 · 🧠 두뇌는 매시간)
  setInterval(function(){ if (document.visibilityState === "visible" && document.getElementById("hmbody") && document.querySelector("#hmbody .pl")) mount(); }, 180000);
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "visible" && document.getElementById("hmbody")) mount(); });
  var prev = window.hmAfter;
  window.hmAfter = function(H){ if (prev) try { prev(H); } catch(x){ if (window.console) console.warn("hmAfter", x); } mount(); };
  var st = document.createElement("style");
  st.textContent = [
    ".pl{padding:12px 14px!important;cursor:pointer;border-width:1px;position:relative}",
    ".pl-now{margin:10px 0 4px;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,var(--text) 5%,var(--panel));border:1px solid var(--line)}",
    ".pl-nh{margin-bottom:4px}.pl-tr{display:flex;gap:8px;align-items:center;font-size:13.5px;line-height:1.4;margin:2px 0 6px}.pl-tr.up{color:#e5484d}.pl-tr.dn{color:#3987e5}.pl-tr span{color:var(--text)}.pl-spark{flex:none}",
    ".pl-nw{display:flex;gap:8px;font-size:13.5px;line-height:1.45;padding:4px 0;border-top:1px dashed var(--line)}.pl-nw .pl-k{flex:none;width:78px}.pl-nw a{color:inherit;text-decoration:none;cursor:pointer}",
    ".pl-sm{font-size:12.5px;display:inline}.pl-sr .pl-sm+div.pl-sm,.pl-sr div.pl-sm{display:block}.pl-sr{margin-bottom:3px}",
    ".pl-act{margin-top:6px;font-size:13px;line-height:1.5;border-top:1px dashed var(--line);padding-top:5px}",
    ".pl-warn{margin:8px 0 4px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#ffb84d 22%,var(--panel));border:1px solid rgba(255,184,77,.6);font-size:13.5px;line-height:1.45}",
    ".pl.up,.pl.up2{background:color-mix(in srgb,#ff6b6b 10%,var(--panel));border-color:rgba(255,107,107,.45)}",
    ".pl.dn,.pl.dn2{background:color-mix(in srgb,#3987e5 12%,var(--panel));border-color:rgba(57,135,229,.5)}",
    ".pl.flat{background:var(--panel)}.pl.strong{border-width:2px}",
    ".pl-top{display:flex;align-items:flex-start;gap:10px}.pl-ic{font-size:24px;width:38px;height:38px;border-radius:11px;background:var(--panel2);display:flex;align-items:center;justify-content:center;flex:none}",
    ".pl-h{flex:1;min-width:0}.pl-h>small{display:block;font-size:12.5px;color:var(--sub);margin-bottom:2px}.pl-old{color:#ffb84d}",
    ".pl-head{font-size:17px;font-weight:800;line-height:1.3;letter-spacing:-.3px}.pl-head em{font-style:normal;font-size:20px}",
    ".pl.up .pl-head em,.pl.up2 .pl-head em{color:#ff8a8a}.pl.dn .pl-head em,.pl.dn2 .pl-head em{color:#7cb0ff}.pl.flat .pl-head em{color:var(--text)}",
    ".pl-go{color:var(--sub);font-size:12.5px;white-space:nowrap;margin-top:4px}",
    ".pl-nums{margin:8px 0 4px;font-size:13px}.pl-ten{letter-spacing:1px}.pl-ten b{letter-spacing:0;margin-left:4px}.pl-ten.up,.pl-ten.up2{color:#ff8a8a}.pl-ten.dn,.pl-ten.dn2{color:#7cb0ff}.pl-ten.flat{color:var(--sub)}",
    ".pl-why{font-size:12.5px;color:var(--sub);line-height:1.45;margin-bottom:6px}",
    ".pl-row{display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-top:1px dashed var(--line);font-size:13.5px;line-height:1.4}.pl-row:first-of-type{border-top:0}",
    ".pl-k{flex:none;width:92px;color:var(--sub);font-size:12.5px;font-weight:700;padding-top:1px}.pl-row b.up,.pl-row b.up2{color:#ff8a8a}.pl-row b.dn,.pl-row b.dn2{color:#7cb0ff}.pl-row small{color:var(--sub);font-size:12.5px}",
    ".pl-br>div{flex:1;min-width:0}.pl-br small{display:block;line-height:1.4;margin-top:1px}",
    ".pl-foot{margin-top:7px;font-size:12.5px;color:var(--dim);line-height:1.4}",
    ".pl-one{font-size:13.5px;line-height:1.5;margin:6px 0 2px;color:var(--text)}.pl-reg{display:inline-block;font-size:12.5px;font-weight:700;padding:1px 7px;border-radius:9px;margin-right:6px;background:var(--panel2);color:var(--sub)}",
    "html[data-ui=light] .pl.up .pl-head em,html[data-ui=light] .pl.up2 .pl-head em,html[data-ui=light] .pl-ten.up,html[data-ui=light] .pl-ten.up2,html[data-ui=light] .pl-row b.up,html[data-ui=light] .pl-row b.up2{color:#d6453d}",
    "html[data-ui=light] .pl.dn .pl-head em,html[data-ui=light] .pl.dn2 .pl-head em,html[data-ui=light] .pl-ten.dn,html[data-ui=light] .pl-ten.dn2,html[data-ui=light] .pl-row b.dn,html[data-ui=light] .pl-row b.dn2{color:#2c6fd1}"
  ].join("");
  document.head.appendChild(st);
})();
;
/* ======== ux1019b.js ======== */
/* 🧵 10/19 A10/19-2 「이 종목, 앱 성적표」 — 종목 화면 「이 종목에 뜬 신호」 밑 세로 타임라인 (사용자 「다 적용해」)
   앱이 이 종목에 한 말(알림 · 킥 진입/청산 · 그림자 장부 · 컵·갭·매집 신호 · 시황에 이름 나옴)을 날짜순으로 꿰고,
   값이 있는 점마다 「그때 값 → 지금 ±%」, 맨 끝에 「앱이 한 말 N번 · 그 뒤 오른 것 M번 · 평균 ±%」.
   자료(새 계산 없음): archive/x/push_log.json · market/kick.json(open·hold·closed·closed_all·shadow_log) · archive/x/market_x.json chips · archive/x/perf_cup/gap/accum.json
   숫자는 지어내지 않음 — 그때 값이 없는 점(시황 언급)은 채점에서 뺌. 사라는 말 없음. */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function J(u, t){ return getJSON(u + "?" + Math.floor(Date.now() / (t || 300000)), {ttl: t || 300000}).catch(function(){ return null; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : "") + v.toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v == null || isNaN(v) ? "" : v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return String(d || "").slice(5, 10).replace("-", "/"); }
  function sameFn(sym){
    var code = sym.split(".")[0], kr = /^\d{6}$/.test(code);
    return function(c){ c = String(c || ""); if (!c) return false; if (c === sym) return true; var cc = c.split(".")[0]; return kr ? cc === code : (cc === code && (c.indexOf(".") < 0 || sym.indexOf(".") < 0)); };
  }
  function fmtPx(v, sym){ if (v == null) return ""; var kr = /\.K[SQ]$|^\d{6}$/.test(sym); return kr ? Math.round(v).toLocaleString() : (v >= 100 ? v.toFixed(0) : v.toFixed(2)); }

  function build(sym, box){
    var same = sameFn(sym), st = (window.M && M.updated) || "";
    Promise.all([J("archive/x/push_log.json"), J(RAWM + "market/kick.json"), J("archive/x/market_x.json"), J("archive/x/perf_cup.json"), J("archive/x/perf_gap.json"), J("archive/x/perf_accum.json"),
                 (window.V && V.price ? V.price(/\.K[SQ]$/.test(sym) ? sym.slice(0, 6) : sym) : Promise.resolve(null)).catch(function(){ return null; })]).then(function(r){
      var PL = r[0] || [], K = r[1] || {}, MX = (r[2] || {}).chips || {}, PF = [[r[3], "☕ 컵"], [r[4], "📈 갭"], [r[5], "🤫 매집"]], q = r[6], now = q && q[1];
      var ev = [];   // {d, t(시각), ic, who, txt, px, dir(+1 = 오르면 맞음), tab}
      // 📣 알림
      (Array.isArray(PL) ? PL : []).forEach(function(p){ var hit = (p.syms || []).filter(function(s){ return same(s[0]); })[0]; if (!hit) return;
        ev.push({d: (p.t || "").slice(0, 10), t: (p.t || "").slice(11, 16), ic: "🔔", who: "알림", txt: (p.title || "").replace(/^(🔴|🟡|⚪)\s*/, ""), px: hit[1] != null ? +hit[1] : null, dir: /갭|컵|고래|매집|돌파|매수/.test(p.title || "") && !/팔기|손절|주의|하락/.test(p.title || "") ? 1 : 0, tab: p.tab}); });
      // ⚡ 킥 장부
      var kk = function(x, kind){ if (!x || !same(x.code || x.sym)) return;
        ev.push({d: x.d0, ic: "⚡", who: "킥 진입", txt: (x.src_name || x.kind || x.src || "") + (x.tags ? " " + x.tags : ""), px: x.entry, dir: 1, done: kind === "closed" ? x.r : null, tab: "port~pokick"});
        if (kind === "closed") ev.push({d: x.d1, ic: x.r >= 0 ? "🟢" : "🔴", who: "킥 청산", txt: (x.why || "") + " · " + sg(x.r) + (x.exit ? " · " + fmtPx(x.exit, sym) : ""), px: null, dir: 0, tab: "port~pokick"});
        else ev.push({d: K.asof || K.at, ic: "💼", who: "킥 보유 중", txt: (x.days != null ? x.days + "일째 · " : "") + "지금 " + sg(x.r) + (x.stop ? " · 손절선 " + fmtPx(x.stop, sym) : ""), px: null, dir: 0, tab: "port~pokick", live: true}); };
      (K.open || []).forEach(function(x){ kk(x, "open"); }); (K.hold || []).forEach(function(x){ kk(x, "hold"); });
      var seen = {}; (K.closed || []).concat(K.closed_all || []).forEach(function(x){ var id = (x.code || x.sym) + "|" + x.d0; if (seen[id]) return; seen[id] = 1; kk(x, "closed"); });
      // 🪂 그림자 장부
      Object.keys(K.shadow_log || {}).forEach(function(id){ var s = K.shadow_log[id]; if (!s || !same(s.code)) return;
        ev.push({d: s.d, ic: "🪂", who: "그림자 " + (s.src || ""), txt: (s.done ? "끝 " : "진행 중 ") + sg(s.r), px: null, dir: 1, sh: s.r, tab: ""}); });
      // 🌐 시황에 이름
      Object.keys(MX).sort().forEach(function(dk){ var row = (MX[dk] || []).filter(function(c){ return same(c[0]); })[0]; if (!row) return;
        ev.push({d: dk.slice(0, 10), ic: "🌐", who: "시황에 이름", txt: row[2] > 1 ? row[2] + "번 언급" : "언급", px: null, dir: 0, tab: "market"}); });
      // ☕📈🤫 신호 성적
      PF.forEach(function(z){ var P = z[0]; if (!P || !P.signals) return; P.signals.filter(function(s){ return same(s.code); }).forEach(function(s){
        if (ev.some(function(x){ return x.d === s.d0 && x.ic === "⚡"; })) return;
        ev.push({d: s.d0, ic: z[1].slice(0, 2).trim(), who: z[1].slice(2).trim() + " 신호", txt: (s.days != null ? s.days + "일 지남 · " : "") + "그 뒤 " + sg(s.now), px: s.p0 || null, dir: 1, sh: s.now, tab: ""}); }); });
      ev = ev.filter(function(x){ return x.d; }).sort(function(a, b){ return (a.d + (a.t || "")) < (b.d + (b.t || "")) ? -1 : 1; });
      if (!ev.length){ box.innerHTML = ""; return; }
      // 채점: 값이 있고 방향(오름 기대)이 있는 점만 → 지금(또는 청산값)과 비교
      var calls = ev.filter(function(x){ return x.dir === 1 && (x.px != null && now != null || x.sh != null || x.done != null); });
      var res = calls.map(function(x){ return x.done != null ? x.done : x.sh != null ? x.sh : (now / x.px - 1) * 100; });
      var closedBy = {}; ev.forEach(function(x){ if (x.ic === "🔴" || x.ic === "🟢") closedBy[x.d] = x; });
      var li = ev.map(function(x){
        var chip = "";
        if (x.done != null) chip = '<em class="' + cl(x.done) + '">' + fmtPx(x.px, sym) + ' → 청산 ' + sg(x.done) + '</em>';
        else if (x.px != null && now != null && !x.live){ var rr = (now / x.px - 1) * 100; chip = '<em class="' + cl(rr) + '">' + fmtPx(x.px, sym) + ' → 지금 ' + sg(rr) + '</em>'; }
        else if (x.px != null) chip = '<em>' + fmtPx(x.px, sym) + '</em>';
        return '<li><span class="a2d">' + e(md(x.d)) + (x.t ? '<small>' + e(x.t) + '</small>' : '') + '</span><span class="a2i">' + x.ic + '</span><span class="a2b">' + (x.tab ? '<a href="javascript:go(\'' + e(x.tab) + '\')">' : '<span>') + '<b>' + e(x.who) + '</b> ' + e(x.txt) + (x.tab ? '</a>' : '</span>') + chip + '</span></li>'; });
      var fold = li.length > 8;
      var h = '<section class="card tlc"><h3>🧵 이 종목, 앱 성적표 <span class="mut">앱이 한 말 ' + ev.length + '번</span></h3><ul class="a2tl' + (fold ? ' fold' : '') + '">' + li.join("") + '</ul>' +
        (fold ? '<button class="btn a2more">앞의 ' + (li.length - 8) + '개 더 보기 ▾</button>' : '');
      if (res.length){ var win = res.filter(function(v){ return v > 0; }).length, avg = res.reduce(function(a, b){ return a + b; }, 0) / res.length;
        h += '<div class="a2s">오르는 쪽으로 말한 ' + res.length + '번 중 그 뒤 오른 것 <b>' + win + '번</b> · 평균 <b class="' + cl(avg) + '">' + sg(avg) + '</b>' + (now != null ? ' <span class="mut">(청산한 건 청산값, 나머진 지금 값 기준)</span>' : '') + '</div>'; }
      h += '<p class="note" style="margin:6px 0 0">알림·킥 장부·그림자 장부·신호 성적표·시황 언급을 종목 하나로 모은 것 — 과거 기록이라 미래 보장이 아니고, 사라는 뜻도 아니에요.</p></section>';
      box.innerHTML = h;
      var mb = box.querySelector(".a2more"); if (mb) mb.onclick = function(){ box.querySelector(".a2tl").classList.remove("fold"); mb.remove(); };
    }).catch(function(){ box.innerHTML = ""; });
  }

  var css = document.createElement("style");
  css.textContent = ".tlc h3 .mut{font-weight:400;font-size:12.5px}.a2tl{list-style:none;margin:6px 0 0;padding:0;position:relative}.a2tl:before{content:'';position:absolute;left:66px;top:6px;bottom:6px;width:2px;background:color-mix(in srgb,var(--sub) 30%,transparent)}" +
    ".a2tl li{display:flex;align-items:flex-start;gap:8px;padding:5px 0;margin:0;font-size:12.5px;line-height:1.45;background:none}.a2tl li:before,.a2tl li:after{display:none;content:none}.a2tl.fold li{display:none}.a2tl.fold li:nth-last-child(-n+8){display:flex}" +
    ".a2d{width:48px;flex:none;text-align:right;color:var(--sub);font-variant-numeric:tabular-nums}.a2d small{display:block;font-size:12.5px;color:var(--dim)}.a2i{width:22px;height:22px;flex:none;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:12.5px;position:relative;z-index:1;border:1px solid color-mix(in srgb,var(--sub) 35%,transparent)}" +
    ".a2b{flex:1;min-width:0}.a2b a{color:inherit;text-decoration:none}.a2b b{color:var(--text)}.a2b em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);font-variant-numeric:tabular-nums}.a2b em.up{color:var(--up)}.a2b em.dn{color:var(--dn)}" +
    ".a2more{margin:4px 0 0 66px;font-size:12.5px}.a2s{margin-top:8px;padding:7px 9px;border-radius:9px;background:color-mix(in srgb,var(--panel) 60%,var(--bg));font-size:12.5px;color:var(--sub)}.a2s b{color:var(--text)}.a2s b.up{color:var(--up)}.a2s b.dn{color:var(--dn)}";
  document.head.appendChild(css);

  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){
    return OLD(sym).then(function(h){
      setTimeout(function(){ var el = $("opsig"); if (!el) return; var bx = document.createElement("div"); el.appendChild(bx); build(sym, bx); }, 60);
      return h;
    });
  };
})();
;
/* ======== port_design.js ======== */
/* 🎛 포트 설계기 — 10/21 A10/21-1 (사용자 「다 좋다 다 진행해」)
   💼 포트 탭: S&P·나스닥·금 막대를 손가락으로 밀면(나머지는 현금·단기채) 2008년부터 매일 굴린 셈으로
   연 수익·최대 낙폭·최악의 해·「1,000만원 → ○○만원」 곡선이 휴대폰에서 바로 다시 계산됨.
   토글 두 개 = 💼 기본 규칙 그대로(🛡 S&P 200일선 아래면 주식 줄이기 · 📉 20일 변동성 맞춤 목표 15%) → 끄고 켤 때 보험값이 숫자 두 개로.
   종목 하나를 0~20% 섞어 볼 수 있음(일봉 있는 18개 · 종목 화면 「💼 이 종목 5% 넣어 보면」 단추가 여기로).
   자료: archive/x/port_px/(SPY·QQQ·GLD·BIL 배당 포함 수정종가, port_px.py 가 7일마다) · 종목은 archive/x/els_px(종가)
   검사: port_px/check.json(파이썬이 같은 자료·같은 규칙으로 낸 값)과 이 엔진 값이 같아야 「✓ 파이썬과 같음」.
   원칙: 과거 계산 · 미래 보장 아님 · 사라는 말 없음 · 위 곡선은 세전 — 11/05 🧾 세금 칸(달러 직투 양도세 vs 국내 ETF 배당소득세·금융종합과세)에서 뗀 값을 따로 보임. */
(function(){
  var ETF = ["SPY", "QQQ", "GLD", "BIL"], PX = {}, IDX = null, IDXW = null, EIDX = null, CHK = null, CHKOK = null;
  // 11/03 사용자 「거치식과 적립식을 구분 · 적립식이면 한 달에 얼마·며칠에 넣는지로 계산 · 거치식 누르면 적립식 칸은 닫히게」
  //   mode: lump(거치식) | dca(적립식) · dm 매달 넣는 돈(만원) · dd 매월 며칠(1~28, 31 = 말일) · d0 처음에 한 번(만원, 선택)
  var ST = {w: {SPY: 47.5, QQQ: 47.5, GLD: 5}, reg: 1, vol: 1, st: "", stw: 5, from: "", prev: null, last: null, ms: 0, pn: null, mode: "lump", dm: 100, dd: 1, d0: 0,
    tx: "gen", brg: 26.4, brb: 44, of: 2000, txo: 1, bd: {}, sx: []};   // ➕ 11/18 sx: 섞은 종목·ETF [{s 야후 코드, n 이름, m 시장, e ETF?, w %}]   // 🏦 11/17 bd: 섞은 채권 {IEF|TLT|BRBOND: 비중 %}   // 🧾 11/05 세금: tx 탭(gen 일반 | big 금융소득종합과세 대상자) · brg/brb 종합소득 세율(지방세 포함 %) · of 다른 금융소득(만원/년) · txo 펼침
  var KEEP = ["w", "reg", "vol", "st", "stw", "from", "mode", "dm", "dd", "d0", "tx", "brg", "brb", "of", "txo", "bd", "sx"];
  try { var sv = JSON.parse(localStorage.getItem("pdz") || "null"); if (sv && sv.w) KEEP.forEach(function(k){ if (sv[k] !== undefined) ST[k] = sv[k]; }); } catch(x) {}
  /* ➕ 11/18 종목·ETF 섞기 (사용자 「포트 설계기에 개별종목이나 etf도 넣는 칸을 만들자」)
     앱 검색 목록(약 2.8만 종목 + ETF)에서 아무거나 · 최대 5개 · 각 5~50% · 종목 + 채권 합 80%까지 · 다른 칸에서 비율대로 떼어 옴 · 방어 규칙 밖
     자료: archive/x/port_px/pool/ (port_px.py — 배당 포함 수정종가 ÷ 환율 = 달러 값) · 없는 종목은 ntfy 로 요청 → 15분마다(pdz_req.yml) 받아 올림
     상장이 늦은 종목: 200일선 준비는 S&P 로 하고, 계산 시작만 그 종목 첫날로 미룸(전엔 같이 거래된 날만 남겨 200거래일이 더 깎였음) */
  var SXMAX = 5, REQT = "chkchp-ch-pdzreq-k4r8", POOL = null, SXC = ["#d55181", "#9b6bd6", "#e07b39", "#4fb0c6", "#b8a13a"];
  var OLDSYM = {"삼성전자": "005930.KS", "SK하이닉스": "000660.KS", "현대차": "005380.KS", "한국전력": "015760.KS", "엔비디아": "NVDA", "애플": "AAPL", "브로드컴": "AVGO", "AMD": "AMD", "마이크론": "MU", "인텔": "INTC", "테슬라": "TSLA", "팔란티어": "PLTR", "KOSPI200": "069500.KS", "NIKKEI225": "^N225", "EUROSTOXX50": "^STOXX50E", "HSCEI": "^HSCE"};
  if (!Array.isArray(ST.sx)) ST.sx = [];
  if (ST.st){ if (OLDSYM[ST.st] && !ST.sx.some(function(x){ return x.s === OLDSYM[ST.st]; })) ST.sx.push({s: OLDSYM[ST.st], n: {"KOSPI200": "KODEX 200", "NIKKEI225": "니케이225 지수", "EUROSTOXX50": "유로스탁스50 지수", "HSCEI": "항셍중국 지수"}[ST.st] || ST.st, m: "", w: ST.stw || 5}); ST.st = ""; }
  var QUICK = [["005930.KS", "삼성전자"], ["000660.KS", "SK하이닉스"], ["NVDA", "엔비디아"], ["AAPL", "애플"], ["TSLA", "테슬라"], ["360750.KS", "TIGER 미국S&P500", 1], ["069500.KS", "KODEX 200", 1], ["SCHD", "미국 배당 SCHD", 1], ["JEPI", "JEPI 커버드콜", 1], ["SOXX", "반도체 SOXX", 1], ["IBIT", "비트코인 IBIT", 1], ["^N225", "니케이225", 1]];
  function sxCol(i){ return SXC[i % SXC.length]; }
  function sxKey(s){ return "X:" + s; }
  function sxReady(x){ return !!(POOL && POOL.assets[x.s]); }
  function sxOn(){ return (ST.sx || []).filter(sxReady); }
  function sxReq(x){   // 자료가 없으면 요청(같은 종목은 30분에 한 번)
    var k = "pdzreq:" + x.s; try { var t = +localStorage.getItem(k) || 0; if (Date.now() - t < 1800e3) return; localStorage.setItem(k, Date.now()); } catch(z) {}
    try { fetch("https://ntfy.sh/" + REQT, {method: "POST", body: x.s + "|" + String(x.n || "").replace(/\|/g, " ").slice(0, 40), keepalive: true}).catch(function(){}); } catch(z) {}
  }
  function keep(){ try { var o = {}; KEEP.forEach(function(k){ o[k] = ST[k]; }); localStorage.setItem("pdz", JSON.stringify(o)); } catch(x) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  var STK = ["삼성전자", "SK하이닉스", "현대차", "한국전력", "엔비디아", "애플", "브로드컴", "AMD", "마이크론", "인텔", "테슬라", "팔란티어", "KOSPI200", "NIKKEI225", "EUROSTOXX50", "HSCEI"];
  var LAB = {"KOSPI200": "코스피200", "NIKKEI225": "니케이225", "EUROSTOXX50": "유로스탁스50", "HSCEI": "항셍중국"};
  function lab(n){ return LAB[n] || n; }
  var COLS = {SPY: "#3987e5", QQQ: "#d95926", GLD: "#c9a227", X: "#d55181", BIL: "#8a94a8", IEF: "#2bb3a3", TLT: "#1c7c8c", BRBOND: "#3fb950"};
  /* 🏦 11/17 채권 섞기 (사용자 「포트 설계기에서 종목 추가뿐 아니라 미국채 브라질국채도 추가할수 있게 업그레이드 해」)
     종목처럼 「고른 비중만큼 다른 칸에서 비율대로 떼어 옴 · 방어 규칙 밖(그대로 둠)」 · 여러 개 함께 가능 · 종목 + 채권 합 최대 80%
     자료: port_px.py → IEF·TLT(이자 포함 달러 값) · BRBOND(헤알 국채 ÷ 달러/헤알 = 달러 값 · 앞쪽은 Selic 근사 — index.json src·splice)
     세금: 미국채는 SPY 처럼(분배금 = 이자) · 브라질국채는 한-브라질 조세협약으로 이자·매매차익·환차익 비과세 → 세금에서 비중만큼 뺌(근사) */
  var BDS = [["IEF", "🇺🇸 미국채 10년", "IEF · 7~10년 국채"], ["TLT", "🇺🇸 미국채 30년", "TLT · 20년 넘는 국채"], ["BRBOND", "🇧🇷 브라질국채", "헤알 국채 · 달러로 환산"]];
  var BDN = {IEF: "미국채 10년", TLT: "미국채 30년", BRBOND: "브라질국채"};
  function bdOn(){ var o = {}; BDS.forEach(function(b){ var v = +(ST.bd || {})[b[0]] || 0; if (v > 0 && IDX && IDX.assets[b[0]]) o[b[0]] = v; }); return o; }
  function extW(){ var o = bdOn(), t = 0; (ST.sx || []).forEach(function(x){ t += +x.w || 0; }); for (var k in o) t += o[k]; return t; }   // 종목(받는 중 포함) + 채권 % 합   // 종목 + 채권 % 합

  /* ── 자료 ── */
  function dec(j){ var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, d = new Int32Array(j.dd.length), c = new Float64Array(j.c.length);
    for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d[i] = t; c[i] = j.c[i]; } return {d: d, c: c}; }
  function idx(){
    if (!IDXW) IDXW = Promise.all([
      getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/els_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/port_px/check.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      poolLoad()
    ]).then(function(r){ IDX = r[0] && r[0].assets ? r[0] : {assets: {}}; EIDX = r[1] && r[1].assets ? r[1] : {assets: {}}; CHK = r[2]; return IDX; });
    return IDXW;
  }
  var POOLT = 0;
  function poolLoad(){   // 5분마다 새로(요청한 종목이 들어왔나)
    if (POOL && Date.now() - POOLT < 300e3) return Promise.resolve(POOL);
    return getJSON("archive/x/port_px/pool/index.json?" + Math.floor(Date.now() / 300e3), {ttl: 300e3}).then(function(j){ POOL = j && j.assets ? j : {assets: {}, bad: {}}; POOL.bad = POOL.bad || {}; POOLT = Date.now(); return POOL; })
      .catch(function(){ if (!POOL) POOL = {assets: {}, bad: {}}; return POOL; });
  }
  function px(k){
    if (/^X:/.test(k)){ var s0 = k.slice(2), pa = POOL && POOL.assets[s0]; if (!pa) return Promise.resolve(null);
      if (!PX[k]) PX[k] = getJSON("archive/x/port_px/pool/" + encodeURIComponent(pa.f) + "?" + String(pa.at || "").replace(/\D/g, ""), {ttl: 864e5}).then(function(j){ return j && j.dd ? dec(j) : null; }).catch(function(){ delete PX[k]; return null; });
      return PX[k]; }
    if (PX[k]) return PX[k];
    var a = IDX && IDX.assets[k], b = !a && EIDX && EIDX.assets[k];
    if (!a && !b) return Promise.resolve(null);
    var u = a ? "archive/x/port_px/" + a.f + "?" + String(a.at || IDX.updated || "").replace(/\D/g, "") : "archive/x/els_px/" + b.f + "?" + String(EIDX.updated || "").replace(/\D/g, "");
    PX[k] = getJSON(u, {ttl: 864e5}).then(function(j){ return j && j.dd ? dec(j) : null; }).catch(function(){ return null; });
    return PX[k];
  }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }

  /* ── 엔진 (port_px.py engine 과 같은 규칙 · 첫날은 BIL 상장 뒤 201거래일) ── */
  function align(ser){   // 모든 자산이 있는 날만
    var ks = Object.keys(ser), base = ser[ks[0]], ptr = {}, D = [], C = {};
    ks.forEach(function(k){ ptr[k] = 0; C[k] = []; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true;
      for (var j = 1; j < ks.length; j++){ var s = ser[ks[j]]; while (ptr[ks[j]] < s.d.length && s.d[ptr[ks[j]]] < t) ptr[ks[j]]++; if (ptr[ks[j]] >= s.d.length || s.d[ptr[ks[j]]] !== t){ ok = false; break; } }
      if (!ok) continue;
      D.push(t); C[ks[0]].push(base.c[i]); for (var j2 = 1; j2 < ks.length; j2++) C[ks[j2]].push(ser[ks[j2]].c[ptr[ks[j2]]]);
    }
    return {D: D, C: C};
  }
  var ALN = {};
  function engine(A, w, o){   // w: {SPY,QQQ,GLD,BIL,X?} 합 1 · o: {reg, vol, start}
    o = o || {}; var D = A.D, n = D.length, K = Object.keys(w), C = A.C, tgt = 15, floor = 0.30, band = 0.05, cost = 0.001;
    var R = {}; K.concat(["SPY"]).forEach(function(k){ if (R[k]) return; var c = C[k], r = new Float64Array(n); for (var i = 1; i < n; i++) r[i] = c[i] / c[i - 1] - 1; R[k] = r; });
    var spy = C.SPY, reg = new Uint8Array(n), s = 0, cur = 0, run = 0;
    for (var i = 0; i < n; i++){ s += spy[i]; if (i >= 200) s -= spy[i - 200];
      var v = i >= 199 && spy[i] > s / 200 ? 1 : 0;
      if (v !== cur){ run++; if (run >= 3){ cur = v; run = 0; } } else run = 0;
      reg[i] = cur; }
    var eq = w.SPY + w.QQQ, ws = eq > 0 ? w.SPY / eq : 0.5, wq = eq > 0 ? w.QQQ / eq : 0.5, sc = new Float64Array(n);
    for (var i2 = 0; i2 < n; i2++){
      if (i2 < 20){ sc[i2] = 1; continue; }
      var m = 0, q = 0, a;
      for (var j = i2 - 19; j <= i2; j++) m += ws * R.SPY[j] + wq * R.QQQ[j];
      m /= 20;
      for (var j3 = i2 - 19; j3 <= i2; j3++){ a = ws * R.SPY[j3] + wq * R.QQQ[j3] - m; q += a * a; }
      var sd = Math.sqrt(q / 19) * Math.sqrt(252) * 100;
      sc[i2] = sd > 0 ? Math.min(1, Math.max(floor, tgt / sd)) : 1;
    }
    var f = 0.63 / 0.95, EXK = Object.keys(w).filter(function(k){ return ["SPY", "QQQ", "GLD", "BIL"].indexOf(k) < 0; }), wx = EXK.reduce(function(a, k){ return a + (w[k] || 0); }, 0);
    function tg(i){
      var on = o.reg ? reg[i] : 1, b = {SPY: w.SPY, QQQ: w.QQQ, GLD: w.GLD, BIL: w.BIL};
      if (!on){ var fr = (w.SPY + w.QQQ) * (1 - f); b = {SPY: w.SPY * f, QQQ: w.QQQ * f, GLD: w.GLD + fr * 0.1875, BIL: w.BIL + fr * 0.8125}; }
      var k = o.vol ? sc[i] : 1, ee = (b.SPY + b.QQQ) * k, out = {SPY: b.SPY * k, QQQ: b.QQQ * k, GLD: b.GLD};
      EXK.forEach(function(k){ out[k] = w[k]; });
      out.BIL = 1 - ee - b.GLD - wx; return out;
    }
    var st = o.start ? Date.parse(o.start + "T00:00:00Z") / 864e5 : 0, i0 = 0;
    while (i0 < n && D[i0] < st) i0++;
    i0 = Math.max(i0, 201); if (i0 >= n - 5) return null;   // 10/21 사용자 「날짜를 직접 넣어서」 — 짧은 기간도
    var W = null, lastEq = 0, nav = 1, NV = new Float64Array(n - i0), sp = new Float64Array(n - i0), spv = 1, turn = 0, expo = 0, WY = {};   // WY: 해마다 자산별 평균 비중(🧾 세금 — 분배금 계산용)
    for (var t = i0; t < n; t++){
      if (!W){ W = tg(t - 1); lastEq = W.SPY + W.QQQ; }
      var r = 0, sum = 0, nw = {};
      for (var k in W){ r += W[k] * R[k][t]; nw[k] = W[k] * (1 + R[k][t]); sum += nw[k]; }
      for (var k2 in nw) W[k2] = nw[k2] / sum;
      var T = tg(t - 1), newm = day2s(D[t - 1]).slice(5, 7) !== day2s(D[t]).slice(5, 7);
      if (newm || (o.reg && reg[t - 1] !== reg[t - 2]) || Math.abs(T.SPY + T.QQQ - lastEq) > band){
        var tv = 0; for (var k3 in T) tv += Math.abs(T[k3] - (W[k3] || 0)); tv /= 2;
        W = T; lastEq = T.SPY + T.QQQ; r -= tv * cost; turn += tv;
      }
      nav *= 1 + r; NV[t - i0] = nav; spv *= 1 + R.SPY[t]; sp[t - i0] = spv; expo += W.SPY + W.QQQ;
      var yk = String(new Date(D[t] * 864e5).getUTCFullYear()), wy = WY[yk] || (WY[yk] = {n: 0});
      wy.n++; for (var k4 in W) wy[k4] = (wy[k4] || 0) + W[k4];
    }
    var ycnt = 0, yrs = (D[n - 1] - D[i0]) / 365.25, pk = 0, mdd = 0, mddAt = 0, spk = 0, smdd = 0, Y = {}, py = null, yv = 1, ysp = 1;
    for (var u = 0; u < NV.length; u++){
      if (NV[u] > pk) pk = NV[u]; var dd = NV[u] / pk - 1; if (dd < mdd){ mdd = dd; mddAt = u; }
      if (sp[u] > spk) spk = sp[u]; var sd2 = sp[u] / spk - 1; if (sd2 < smdd) smdd = sd2;
      var y = day2s(D[i0 + u]).slice(0, 4);
      if (y !== py){ if (py) Y[py] = [(NV[u - 1] / yv - 1) * 100, (sp[u - 1] / ysp - 1) * 100, ycnt]; yv = u ? NV[u - 1] : 1; ysp = u ? sp[u - 1] : 1; py = y; ycnt = 0; }
      ycnt++;
    }
    if (py) Y[py] = [(NV[NV.length - 1] / yv - 1) * 100, (sp[sp.length - 1] / ysp - 1) * 100, ycnt];
    var full = Object.keys(Y).filter(function(y){ return Y[y][2] >= 120; });
    var tot = (nav - 1) * 100, sptot = (spv - 1) * 100;   // 반년 넘게 굴린 해만 (2008 은 3월부터라 넣음)
    var worst = full.sort(function(a, b){ return Y[a][0] - Y[b][0]; })[0];
    return {from: day2s(D[i0]), to: day2s(D[n - 1]), yrs: yrs, tot: tot, sptot: sptot, cagr: (Math.pow(nav, 1 / yrs) - 1) * 100, mdd: mdd * 100, mddAt: day2s(D[i0 + mddAt]), end: nav,
      sp_cagr: (Math.pow(spv, 1 / yrs) - 1) * 100, sp_mdd: smdd * 100, sp_end: spv, worst: worst, Y: Y, nv: NV, sp: sp, D: D, i0: i0, expo: expo / NV.length * 100, turn: turn / yrs * 100, WY: WY};
  }
  /* 💵 적립식 — 설계한 포트(매일 굴린 값 nv)와 S&P(sp)를 「매월 dd일(그날이 쉬면 다음 거래일 · 그달에 그날이 없으면 그달 마지막 거래일) 종가」에 dm 만원씩 산 셈 */
  function dcaCalc(r){
    var N = r.nv.length, m = (ST.dm || 0) * 1e4, z = (ST.d0 || 0) * 1e4, dd = ST.dd || 1;
    var un = 0, us = 0, inv = 0, cnt = 0, V = new Float64Array(N), S = new Float64Array(N), I = new Float64Array(N), flows = [], sflows = [];
    var buy = function(u, a){ if (!(a > 0)) return; un += a / r.nv[u]; us += a / r.sp[u]; inv += a; flows.push([r.D[r.i0 + u], -a]); };
    if (z > 0) buy(0, z);
    var curM = null, did = false, lastU = -1;
    for (var u = 0; u < N; u++){
      var ds = day2s(r.D[r.i0 + u]), mo = ds.slice(0, 7), dom = +ds.slice(8, 10);
      if (mo !== curM){
        if (curM && !did && lastU >= 0 && m > 0){ buy(lastU, m); cnt++; for (var b = lastU; b < u; b++){ V[b] = un * r.nv[b]; S[b] = us * r.sp[b]; I[b] = inv; } }   // 그달에 그날이 없었으면 마지막 거래일에
        curM = mo; did = false;
      }
      if (!did && dom >= dd && m > 0){ buy(u, m); cnt++; did = true; }
      lastU = u; V[u] = un * r.nv[u]; S[u] = us * r.sp[u]; I[u] = inv;
    }
    if (!inv) return null;
    var endV = un * r.nv[N - 1], endS = us * r.sp[N - 1], tEnd = r.D[r.i0 + N - 1];
    // 돈을 넣은 때를 감안한 연 수익(내부수익률) — 반으로 나눠 찾기
    var irr = function(endVal){ var f = function(y){ var s = endVal; flows.forEach(function(x){ s += x[1] * Math.pow(1 + y, (tEnd - x[0]) / 365.25); }); return s; };
      var lo = -0.95, hi = 3; if (f(lo) * f(hi) > 0) return null; for (var k = 0; k < 80; k++){ var md = (lo + hi) / 2; if (f(lo) * f(md) <= 0) hi = md; else lo = md; } return (lo + hi) / 2 * 100; };
    var yrs = (tEnd - flows[0][0]) / 365.25;
    return {inv: inv, cnt: cnt, end: endV, sEnd: endS, ret: (endV / inv - 1) * 100, sRet: (endS / inv - 1) * 100, irr: yrs >= 1 ? irr(endV) : null, sIrr: yrs >= 1 ? irr(endS) : null, V: V, S: S, I: I, first: day2s(flows[0][0])};
  }
  function dcaCurve(r, c){
    var W = 340, H = 140, P = 4, N = c.V.length, step = Math.max(1, Math.floor(N / 170)), hi = 0;
    for (var i = 0; i < N; i++) hi = Math.max(hi, c.V[i], c.S[i], c.I[i]);
    var X = function(i){ return P + (W - 2 * P - 40) * i / (N - 1); }, Yf = function(v){ return H - 16 - (H - 26) * v / (hi || 1); };
    var path = function(arr){ var s2 = ""; for (var i = 0; i < N; i += step) s2 += (s2 ? "L" : "M") + X(i).toFixed(1) + "," + Yf(arr[i]).toFixed(1); return s2 + "L" + X(N - 1).toFixed(1) + "," + Yf(arr[N - 1]).toFixed(1); };
    var g = ""; [0.25, 0.5, 0.75, 1].forEach(function(f){ var v = hi * f, y = Yf(v).toFixed(1); g += '<line x1="' + P + '" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" class="pz-gl"/><text x="' + (W - 38) + '" y="' + (+y + 3) + '" class="pz-gt">' + won(v) + '</text>'; });
    var yt = "", lastY = null, ystep = r.yrs > 12 ? 4 : r.yrs > 6 ? 2 : 1;
    for (var j = 0; j < N; j++){ var yy = day2s(r.D[r.i0 + j]).slice(0, 4); if (r.yrs >= 2 && yy !== lastY && +yy % ystep === 0 && j > 20) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + yy + '</text>'; lastY = yy; }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pz-cv" role="img" aria-label="적립식 넣은 돈과 평가금">' + g + yt +
      '<path d="' + path(c.I) + '" class="pz-li"/><path d="' + path(c.S) + '" class="pz-ls"/><path d="' + path(c.V) + '" class="pz-lm"/></svg>' +
      '<div class="pz-key"><span><i class="m"></i>설계한 포트 평가금</span><span><i class="s"></i>S&P500에 같은 날 넣었다면</span><span><i class="i"></i>넣은 돈 합계</span></div>';
  }
  function dcaH(r){
    var c = dcaCalc(r);
    if (!c) return '<div class="empty">매달 넣을 돈을 적어 주세요.</div>';
    var pf = c.end - c.inv, sp = c.sEnd - c.inv, ddL = ST.dd >= 31 ? "말일" : ST.dd + "일";
    return '<div class="pz-dca"><div class="pz-dcah">💵 적립식 · 매달 ' + won(ST.dm * 1e4) + '원 · 매월 ' + ddL + (ST.d0 > 0 ? ' · 처음 ' + won(ST.d0 * 1e4) + '원' : '') + ' <span class="mut">' + c.first.replace(/-/g, ".") + '부터 ' + c.cnt + '번 넣음</span></div>' +
      '<div class="pz-big"><div><small>넣은 돈</small><b>' + won(c.inv) + '</b><em>' + c.cnt + '번' + (ST.d0 > 0 ? ' + 처음 한 번' : '') + '</em></div>' +
        '<div><small>지금 평가금</small><b class="' + cl(pf) + '">' + won(c.end) + '</b><em>' + (pf >= 0 ? '+' : '−') + won(Math.abs(pf)) + '원</em></div>' +
        '<div><small>수익률</small><b class="' + cl(c.ret) + '">' + sg(c.ret, 1) + '%</b><em>' + (c.irr != null ? '연 ' + sg(c.irr, 1) + '%' : '1년 안 됨') + '</em></div></div>' +
      '<div class="pz-won">📈 S&P500에 같은 날 같은 돈을 넣었다면 <b>' + won(c.sEnd) + '원</b> <small>수익률 ' + sg(c.sRet, 1) + '%' + (c.sIrr != null ? ' · 연 ' + sg(c.sIrr, 1) + '%' : '') + ' · 설계한 포트가 ' + (c.end >= c.sEnd ? '앞섬 +' : '뒤짐 −') + won(Math.abs(c.end - c.sEnd)) + '원</small></div>' +
      dcaCurve(r, c) +
      '<p class="note" style="margin:2px 0 6px">연 % = 돈을 넣은 때를 감안한 연평균 수익(내부수익률) · 매월 그날 종가에 삼(쉬는 날이면 다음 거래일, 그달에 그날이 없으면 마지막 거래일) </p></div>';
  }

  /* 🧾 11/05 세금 뗀 실제 수익 (사용자 「원화로 달러 사서 미국을 사면 세금이 나오잖아 — 양도세가 얼마라서 실제 수익률이 얼마다 ·
     금융종합소득세 과세 대상자 탭을 만들어서 국내에서 ETF로 샀을 때 세금 얼마고 실제 수익률이 얼마다」)
     같은 포트를 ① 💵 원화 → 달러로 바꿔 미국 ETF 직접(SPY·QQQ·GLD·BIL) ② 🇰🇷 국내 상장 같은 지수 ETF(환노출)로 산 셈.
     · 💵 직투: 미국 배당 15% 원천징수(해마다) · 팔 때 (원화 기준 차익 − 연 250만원) × 22% 분리과세 · 환전 0.1%씩(우대 가정)
     · 🇰🇷 국내 ETF: 분배금·매매차익 = 배당소득 15.4% · 그해 금융소득(이자·배당)이 2천만원 넘는 몫은 종합과세(고른 세율, 15.4%보다 낮으면 15.4%)
     · 직투 배당도 금융소득 → 대상자면 2천만 넘는 몫은 고른 세율(외국납부 15% 공제 → 최소 15%)
     · 원화 값 = 포트 값(달러) × 그날 원/달러(USDKRW.json) · 분배금 = 해마다 자산별 평균 비중 × 그해 분배금 수익률(div.json)
     근사: 끝에 한 번에 판 셈(달마다 맞추며 판 차익 과세는 미룬 셈) · 구간 세율 한 칸으로 · 보수·과표기준가 차이·건보료 빼지 않음 */
  var TXD = null, TXW = null;
  var BR = [[6.6, "1,400만↓"], [16.5, "5,000만↓"], [26.4, "8,800만↓"], [38.5, "1.5억↓"], [41.8, "3억↓"], [44, "5억↓"], [46.2, "10억↓"], [49.5, "10억↑"]];
  var DYF = {SPY: 1.8, QQQ: 0.7, GLD: 0, BIL: 1.5, X: 0, BRBOND: 0};   // 미국채(IEF·TLT)는 div.json 값만 씀 — 없으면 이자를 매매차익으로 셈(끝에 한 번)   // div.json 이 아직 없을 때만
  function txLoad(){
    if (!TXW) TXW = idx().then(function(){
      var dv = IDX.assets.DIV;
      return Promise.all([px("USDKRW"), dv ? getJSON("archive/x/port_px/div.json?" + String(dv.at || "").replace(/\D/g, ""), {ttl: 864e5}).catch(function(){ return null; }) : null]);
    }).then(function(x){ TXD = {fx: x[0], div: x[1] && x[1].y ? x[1].y : null}; return TXD; }).catch(function(){ TXD = {fx: null, div: null}; return TXD; });
    return TXW;
  }
  function fxOf(r){
    if (r.fxA) return r.fxA;
    var N = r.nv.length, a = new Float64Array(N), f = TXD && TXD.fx;
    if (!f){ for (var i = 0; i < N; i++) a[i] = 1; r.fxA = a; r.fxNo = 1; return a; }
    for (var u = 0, j = 0; u < N; u++){ var t = r.D[r.i0 + u]; while (j + 1 < f.d.length && f.d[j + 1] <= t) j++; a[u] = f.c[j]; }
    r.fxA = a; return a;
  }
  function dyOf(k, y){ var d = TXD && TXD.div && TXD.div[k]; return d && d[y] != null ? Math.max(0, d[y]) : DYF[k] || 0; }
  function flowsOf(r){   // [u, 원] — 거치식 = 첫날 한 번 · 적립식 = dcaCalc 와 같은 날
    var N = r.nv.length, out = [];
    if (ST.mode !== "dca"){ out.push([0, amt()]); return out; }
    var m = (ST.dm || 0) * 1e4, z = (ST.d0 || 0) * 1e4, dd = ST.dd || 1, curM = null, did = false, lastU = -1;
    if (z > 0) out.push([0, z]);
    for (var u = 0; u < N; u++){
      var ds = day2s(r.D[r.i0 + u]), mo = ds.slice(0, 7), dom = +ds.slice(8, 10);
      if (mo !== curM){ if (curM && !did && lastU >= 0 && m > 0) out.push([lastU, m]); curM = mo; did = false; }
      if (!did && dom >= dd && m > 0){ out.push([u, m]); did = true; }
      lastU = u;
    }
    out.sort(function(a, b){ return a[0] - b[0]; });
    return out;
  }
  function sim(r, kind, fl, br, other){
    var N = r.nv.length, fx = fxOf(r), fxc = kind === "us" ? 0.001 : 0, base = kind === "us" ? 0.15 : 0.154, hi = Math.max(br / 100, base);
    var B = Math.max(0, 2e7 - other), units = 0, up = 0, basis = 0, inv = 0, usdIn = 0, usdU = 0, divTax = 0, divTot = 0, divOver = 0, brem = B, fi = 0, yrOf = function(u){ return new Date(r.D[r.i0 + u] * 864e5).getUTCFullYear(); };
    for (var u = 0; u < N; u++){
      var U = r.nv[u] * fx[u];
      while (fi < fl.length && fl[fi][0] === u){ var a = fl[fi][1]; units += a * (1 - fxc) / U; up += a / U; basis += a; inv += a; usdIn += a / fx[u]; usdU += a / fx[u] / r.nv[u]; fi++; }
      var y = yrOf(u), endY = u === N - 1 || yrOf(u + 1) !== y;
      if (endY){
        var w = r.WY && r.WY[y], py = 0;
        if (w && w.n) for (var k in w) if (k !== "n" && k !== "BRBOND") py += w[k] / w.n * dyOf(/^X/.test(k) ? "X" : k, String(y)) / 100;   // 🇧🇷 비과세 → 분배금 세금에서 뺌
        if (w) py *= Math.min(1, w.n / 252);
        brem = B;
        if (py > 0 && units > 0){
          var V = units * U, dv = V * py, inb = Math.min(dv, brem), t = inb * base + (dv - inb) * hi;
          brem -= inb; divOver += dv - inb; units *= 1 - t / V; basis += dv - t; divTax += t; divTot += dv;
        }
      }
    }
    var Ve = units * r.nv[N - 1] * fx[N - 1], pre = up * r.nv[N - 1] * fx[N - 1], o = {kind: kind, inv: inv, pre: pre, divTax: divTax, divTot: divTot, divOver: divOver};
    var brs = 0, brn = 0; for (var yy in (r.WY || {})){ var wy2 = r.WY[yy]; if (wy2 && wy2.n){ brs += (wy2.BRBOND || 0); brn += wy2.n; } }
    var free = brn ? Math.min(1, brs / brn) : 0; o.free = free;   // 🇧🇷 브라질국채 평균 비중 — 그만큼 차익은 비과세(근사)
    if (kind === "us"){
      var Vs = Ve * (1 - fxc); o.fxCost = inv * fxc + Ve * fxc; o.gain = Vs - basis; o.saleTax = Math.max(0, o.gain * (1 - free) - 2.5e6) * 0.22; o.net = Vs - o.saleTax;
    } else {
      o.fxCost = 0; o.gain = Ve - basis; var g = Math.max(0, o.gain) * (1 - free), inb2 = Math.min(g, brem); o.over = g - inb2; o.saleTax = inb2 * 0.154 + o.over * Math.max(br / 100, 0.154); o.net = Ve - o.saleTax;
    }
    o.tax = o.divTax + o.saleTax; o.ret = (o.net / inv - 1) * 100; o.preRet = (pre / inv - 1) * 100;
    o.usdRet = (usdU * r.nv[N - 1] / usdIn - 1) * 100; o.fx0 = inv / usdIn; o.fx1 = fx[N - 1];
    // 연 % — 거치식은 연평균, 적립식은 넣은 때를 감안한 내부수익률
    var tEnd = r.D[r.i0 + N - 1], yrs = (tEnd - r.D[r.i0 + fl[0][0]]) / 365.25;
    if (yrs >= 1){
      if (fl.length === 1) o.ann = (Math.pow(o.net / inv, 1 / yrs) - 1) * 100, o.preAnn = (Math.pow(pre / inv, 1 / yrs) - 1) * 100;
      else { var irr = function(end){ var f = function(q){ var s2 = end; fl.forEach(function(x){ s2 -= x[1] * Math.pow(1 + q, (tEnd - r.D[r.i0 + x[0]]) / 365.25); }); return s2; };
          var lo = -0.95, hi2 = 3; if (f(lo) * f(hi2) > 0) return null; for (var i = 0; i < 80; i++){ var md = (lo + hi2) / 2; if (f(lo) * f(md) <= 0) hi2 = md; else lo = md; } return (lo + hi2) / 2 * 100; };
        o.ann = irr(o.net); o.preAnn = irr(pre); }
    }
    return o;
  }
  function taxH(r){
    if (!TXD){ txLoad().then(function(){ var el = document.getElementById("pzres"); if (el && ST.last && ST.last.R){ el.innerHTML = result(); bindRes(); } }); return '<div class="pz-tx"><div class="loading">🧾 세금 계산 자료 불러오는 중…</div></div>'; }
    var big = ST.tx === "big", br = big ? ST.brb : ST.brg, other = big ? (ST.of || 0) * 1e4 : 0, fl = flowsOf(r);
    if (!fl.length) return "";
    var us = sim(r, "us", fl, br, other), kr = sim(r, "kr", fl, br, other), fx = fxOf(r), best = us.net >= kr.net ? us : kr, gap = Math.abs(us.net - kr.net);
    var nm = {us: "💵 달러로 직접", kr: "🇰🇷 국내 상장 ETF"}, sub = {us: "원화 → 달러 환전 후 SPY·QQQ·GLD·BIL", kr: "같은 지수 환노출 ETF(원화)"};
    var mx = Math.max(us.pre, kr.pre, us.inv) || 1;
    var bar = function(o){ var n = Math.max(0, o.net), t = o.tax, f = o.fxCost || 0;
      return '<div class="pz-txb"><i class="n" style="width:' + (n / mx * 100).toFixed(1) + '%"></i><i class="t" style="width:' + (t / mx * 100).toFixed(1) + '%"></i>' + (f > 0 ? '<i class="f" style="width:' + Math.max(0.6, f / mx * 100).toFixed(1) + '%"></i>' : '') + '<em style="left:' + (o.inv / mx * 100).toFixed(1) + '%"></em></div>'; };
    var card = function(o){
      var lost = o.preRet - o.ret, win = o === best && gap >= 1e4;
      return '<div class="pz-txc' + (win ? ' win' : '') + '"><div class="pz-txn">' + nm[o.kind] + (win ? ' <span class="pz-txw">👑 더 남음</span>' : '') + '<small>' + sub[o.kind] + '</small></div>' +
        '<div class="pz-txv"><small>세금 떼고 손에 쥐는 돈</small><b>' + won(o.net) + '원</b></div>' +
        '<div class="pz-txr"><span>실제 수익률</span><b class="' + cl(o.ret) + '">' + sg(o.ret, 1) + '%</b>' + (o.ann != null ? '<em>연 ' + sg(o.ann, 1) + '%</em>' : '<em>1년 안 됨</em>') + '</div>' +
        bar(o) +
        '<div class="pz-txl"><span>세전 수익</span><b class="' + cl(o.pre - o.inv) + '">' + (o.pre >= o.inv ? '+' : '−') + won(Math.abs(o.pre - o.inv)) + '</b></div>' +
        '<div class="pz-txl"><span>' + (o.kind === "us" ? '배당 세금(미국 15%' + (big && o.divOver > 0 ? '+종합' : '') + ')' : '분배금 세금(15.4%' + (big && o.divOver > 0 ? '+종합' : '') + ')') + '</span><b class="dn">−' + won(o.divTax) + '</b></div>' +
        '<div class="pz-txl"><span>' + (o.kind === "us" ? '양도세 22% <small>(250만 공제)</small>' : '매매차익 세금 ' + (o.over > 0 ? '<small>(15.4% + 종합 ' + Math.max(br, 15.4) + '%)</small>' : '15.4%')) + '</span><b class="dn">−' + won(o.saleTax) + '</b></div>' +
        (o.kind === "us" ? '<div class="pz-txl"><span>환전 비용 <small>(0.1%씩)</small></span><b class="dn">−' + won(o.fxCost) + '</b></div>' : '') +
        '<div class="pz-txl tot"><span>세금으로 깎인 수익</span><b class="dn">−' + Math.max(0, lost).toFixed(1) + '%p</b></div></div>';
    };
    var per = r.from.replace(/-/g, ".") + ' ~ ' + r.to.slice(2).replace(/-/g, "."), lump = fl.length === 1;
    var fxl = r.fxNo ? '<div class="pz-txx">⏳ 원/달러 일봉은 오늘 저녁 상품 작업 뒤 들어와요 — 지금은 환율이 그대로였던 셈</div>' :
      '<div class="pz-txu"><div><small>달러로는</small><b class="' + cl(us.usdRet) + '">' + sg(us.usdRet, 1) + '%</b></div><div class="op">×</div>' +
      '<div><small>' + (lump ? '환율 ' : '평균 산 환율 ') + Math.round(us.fx0).toLocaleString() + ' → ' + Math.round(us.fx1).toLocaleString() + '원</small><b class="' + cl(us.fx1 - us.fx0) + '">' + sg((us.fx1 / us.fx0 - 1) * 100, 1) + '%</b></div><div class="op">→</div>' +
      '<div><small>원화 세전</small><b class="' + cl(us.preRet) + '">' + sg(us.preRet, 1) + '%</b></div></div>';
    var warn = "";
    if (!big && kr.over > 0) warn = '<div class="pz-txx">⚠️ 국내 ETF는 판 해에 차익 ' + won(Math.max(0, kr.gain)) + '원이 금융소득으로 잡혀 2천만원 넘는 ' + won(kr.over) + '원은 종합과세(' + Math.max(br, 15.4) + '%) — 몇 해에 나눠 팔면 세금이 줄어요.</div>';
    if (big) warn = '<div class="pz-txx ok">💡 대상자는 국내 ETF 차익·분배금이 다른 소득과 합쳐 높은 세율을 맞지만, 해외 직투 양도세는 22% 분리과세라 종합과세에 안 섞여요' + (best.kind === "us" ? ' — 그래서 이 조건에선 직투가 유리' : '') + '. 연금저축·IRP·ISA에 담으면 과세를 미루거나 낮출 수 있어요.</div>';
    var chips = '<div class="pz-txk"><span>' + (big ? '내 종합소득 세율 <small>(지방세 포함 · 과세표준 구간)</small>' : '2천만원 넘을 때 적용할 내 세율 <small>(지방세 포함)</small>') + '</span><div>' +
      BR.map(function(b){ return '<button data-br="' + b[0] + '" class="' + (+br === b[0] ? "on" : "") + '">' + b[0] + '%<small>' + b[1] + '</small></button>'; }).join("") + '</div></div>' +
      (big ? '<label class="pz-txo">다른 금융소득(이자·배당) 연 <input type="number" inputmode="numeric" min="0" step="100" id="pztxof" value="' + (ST.of || 0) + '"> 만원 <small>2천만원 넘으면 이 포트 소득 전부 종합과세</small></label>' : '');
    var sumL = (lump ? won(us.inv) + '원 한 번에' : '적립식 ' + won(us.inv) + '원') + ' · ' + nm[best.kind].split(" ")[0] + ' ' + sg(best.ret, 1) + '%';
    return '<details class="pz-tx" id="pztx"' + (ST.txo ? ' open' : '') + '><summary><b>🧾 세금 떼면 실제 수익률</b><span>💵 직투 <b class="' + cl(us.ret) + '">' + sg(us.ret, 1) + '%</b> · 🇰🇷 국내 ETF <b class="' + cl(kr.ret) + '">' + sg(kr.ret, 1) + '%</b> <small>세전 ' + sg(us.preRet, 1) + '%</small></span></summary>' +
      '<div class="pz-txt"><button data-tx="gen" class="' + (!big ? "on" : "") + '">🙂 일반<small>금융소득 연 2천만원 이하</small></button><button data-tx="big" class="' + (big ? "on" : "") + '">💼 금융소득종합과세 대상자<small>이자·배당 연 2천만원 초과</small></button></div>' +
      chips +
      '<div class="pz-txp">📅 ' + per + ' · ' + (lump ? won(us.inv) + '원을 첫날 한 번에' : '넣은 돈 ' + won(us.inv) + '원 · ' + fl.length + '번') + '</div>' + fxl +
      '<div class="pz-txg">' + card(us) + card(kr) + '</div>' +
      '<div class="pz-txkey"><span><i class="n"></i>손에 쥐는 돈</span><span><i class="t"></i>세금</span><span><i class="f"></i>환전</span><span><i class="e"></i>넣은 돈</span></div>' +
      (gap >= 1e4 ? '<div class="pz-txwin">👑 이 조건이면 <b>' + nm[best.kind] + '</b>이 <b>' + won(gap) + '원</b> 더 남아요 <small>(' + (best === us ? '국내 ETF' : '달러 직투') + '보다 수익률 ' + Math.abs(us.ret - kr.ret).toFixed(1) + '%p)</small></div>' : '<div class="pz-txwin">두 방법 차이가 거의 없어요</div>') +
      warn +
      (sxOn().length ? '<p class="note" style="margin:4px 0 0">➕ 섞은 종목·ETF(' + e(sxOn().map(function(x){ return x.n; }).join(" · ")) + ')도 같은 방식으로 셈(근사 · 배당은 값에 들어 있고 분배금 세금은 빼지 않음 · 국내 상장 주식 매매차익 비과세 같은 차이도 빼지 않음).</p>' : '') +
      (function(){ var B = bdOn(), L = []; if (B.IEF || B.TLT) L.push('미국채는 ETF 처럼 셈(분배금 = 이자 · 국내 ETF 칸은 국내 상장 미국채 ETF 가정)');
        if (B.BRBOND) L.push('🇧🇷 브라질국채 몫(기간 평균 ' + Math.round(us.free * 100) + '%)은 한-브라질 조세협약으로 이자·매매차익·환차익 비과세 · 금융소득종합과세에도 안 들어가 그 몫만큼 세금에서 뺌(근사) · 두 칸 모두 브라질국채는 직접 사는 것으로 같게 셈 · 브라질 현지 세금(IOF)·조세협약은 바뀔 수 있음');
        return L.length ? '<p class="note" style="margin:4px 0 0">🏦 ' + L.join(' · ') + '.</p>' : ''; })() +
      '<p class="note pz-txnote">가정 · 💵 양도세 = (원화로 본 차익 − 연 250만원) × 22%, 끝에 한 번에 판 셈(달마다 맞추며 판 차익 과세는 미룬 셈) · 미국 배당 15% 원천징수 · 환전 우대 0.1%씩 · 🇰🇷 국내 상장 해외 ETF 매매차익·분배금은 배당소득 15.4%, 그해 금융소득 2천만원 넘는 몫은 종합과세(구간 세율 한 칸으로 근사) · 분배금 = 해마다 실제 분배금 수익률' + (TXD.div ? '' : '(자료 준비 중 — 평균값)') + ' · 보수·과표기준가 차이·건강보험료(금융소득 1천만원 넘으면 영향)는 빼지 않음 · 2026년 세법 기준, 바뀔 수 있음 · 세무 상담이 아니에요.</p></details>';
  }
  function wts(){   // 화면 % → 엔진 비중(합 1, 종목은 다른 칸에서 비율대로 떼어 옴)
    var s = ST.w.SPY / 100, q = ST.w.QQQ / 100, g = ST.w.GLD / 100, c = Math.max(0, 1 - s - q - g), X = sxOn(), x = 0, B = bdOn(), bt = 0;
    X.forEach(function(o){ x += (+o.w || 0) / 100; });
    for (var b in B) bt += B[b] / 100;
    var k = Math.max(0, 1 - x - bt);
    var w = {SPY: s * k, QQQ: q * k, GLD: g * k, BIL: c * k}; X.forEach(function(o){ w[sxKey(o.s)] = (+o.w || 0) / 100; }); for (var b2 in B) w[b2] = B[b2] / 100; return w;
  }
  function series(){
    var ks = ETF.slice(), xs = sxOn().map(function(o){ return sxKey(o.s); });
    Object.keys(bdOn()).forEach(function(b){ ks.push(b); });
    return Promise.all(ks.concat(xs).map(px)).then(function(ss){
      if (ss.slice(0, ks.length).some(function(x){ return !x; })) return null;
      var bad = xs.filter(function(k, i){ return !ss[ks.length + i]; }); if (bad.length) return null;
      var key = ks.concat(xs).join(","); if (ALN[key]) return ALN[key];
      var o = {}; ks.forEach(function(k, i){ o[k] = ss[i]; }); var A = align(o);
      if (xs.length){ var X = {}; xs.forEach(function(k, i){ X[k] = ss[ks.length + i]; }); A = addX(A, X); }
      ALN[key] = A; return A;
    });
  }
  function addX(A, X){   // ➕ 종목은 S&P 날짜에 맞춰 바로 앞 날 값으로 채움(휴장일 차이) · 상장 전은 첫 값(계산 시작은 상장 뒤로 미룸 → startOf)
    var C = {}, XF = {}; for (var k0 in A.C) C[k0] = A.C[k0];
    for (var k in X){ var s = X[k], arr = new Array(A.D.length), j = 0;
      for (var i = 0; i < A.D.length; i++){ while (j + 1 < s.d.length && s.d[j + 1] <= A.D[i]) j++; arr[i] = s.c[j]; }
      C[k] = arr; XF[k] = s.d[0]; }
    return {D: A.D, C: C, XF: XF};
  }
  var START0 = "2007-06-01";   // BIL(현금) 상장(2007-05-30) + 200일선 준비 → 실제 시작 2008-03 · 2008 폭락·2009 바닥을 다 넣음
  function first(A){ return A && A.D.length > 201 ? day2s(A.D[201]) : "2008-03-17"; }   // 200일선·변동성 준비가 끝난 첫날
  function xFirst(A){ var m = 0; if (A && A.XF) for (var k in A.XF) if (A.XF[k] > m) m = A.XF[k]; return m ? day2s(m + 1) : ""; }   // 가장 늦게 상장한 종목의 다음 날
  function startOf(A){ var f = first(A), last = A ? day2s(A.D[A.D.length - 6]) : "", xf = xFirst(A); if (xf > f) f = xf;
    if (!ST.from) return f;
    var p = PER[ST.from]; if (p){ var t = new Date(Date.now() + 9 * 3600e3); if (p === "ytd") return (t.getUTCFullYear()) + "-01-01" > f ? t.getUTCFullYear() + "-01-01" : f;
      t.setUTCMonth(t.getUTCMonth() - p); var d = t.toISOString().slice(0, 10); return d > f ? d : f; }
    var d2 = ST.from < f ? f : ST.from; return last && d2 > last ? last : d2; }
  var PER = {"10y": 120, "5y": 60, "3y": 36, "1y": 12, "6m": 6, "ytd": "ytd"};
  var LASTA = null;
  function runAll(A){
    LASTA = A;
    var START = startOf(A), w = wts(), o = {reg: ST.reg, vol: ST.vol, start: START};
    var t0 = performance.now(), main = engine(A, w, o);
    var alt = {reg: ST.reg ? engine(A, w, {reg: 0, vol: ST.vol, start: START}) : engine(A, w, {reg: 1, vol: ST.vol, start: START}),
               vol: ST.vol ? engine(A, w, {reg: ST.reg, vol: 0, start: START}) : engine(A, w, {reg: ST.reg, vol: 1, start: START})};
    ST.ms = performance.now() - t0;
    return {m: main, alt: alt};
  }
  function verify(){   // check.json 과 같은 숫자인지 (4자산만)
    if (CHKOK !== null || !CHK || !CHK.runs) return Promise.resolve(CHKOK);
    return Promise.all(ETF.map(px)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var A = align({SPY: ss[0], QQQ: ss[1], GLD: ss[2], BIL: ss[3]}), ok = 0, n = 0;
      CHK.runs.forEach(function(r){ var x = engine(A, r.w, {reg: r.reg ? 1 : 0, vol: r.vol ? 1 : 0, start: r.from}); n++;
        if (x && Math.abs(x.cagr - r.cagr) < 0.03 && Math.abs(x.mdd - r.mdd) < 0.15) ok++; else console.warn("pdz check", r.name, r.cagr, r.mdd, x && x.cagr, x && x.mdd); });
      CHKOK = {ok: ok, n: n}; return CHKOK;
    });
  }

  /* ── 화면 ── */
  function sl(k, lb){ return '<label class="pz-sl"><span><i style="background:' + COLS[k] + '"></i>' + lb + ' <b id="pzv' + k + '">' + ST.w[k] + '%</b></span><input type="range" min="0" max="100" step="5" value="' + ST.w[k] + '" data-pz="' + k + '"></label>'; }
  function barH(){
    var w = wts(), seg2 = function(c, v){ return v > 0.0005 ? '<i style="flex:' + v.toFixed(4) + ';background:' + c + '"></i>' : ''; }, seg = function(k, v){ return seg2(COLS[k], v); };
    return '<div class="pz-bar">' + seg("SPY", w.SPY) + seg("QQQ", w.QQQ) + seg("GLD", w.GLD) + sxOn().map(function(o, i){ return seg2(sxCol(ST.sx.indexOf(o)), w[sxKey(o.s)] || 0); }).join("") + BDS.map(function(b){ return seg(b[0], w[b[0]] || 0); }).join("") + seg("BIL", w.BIL) + '</div>' +
      '<div class="pz-lg">S&P ' + r1(w.SPY) + ' · 나스닥 ' + r1(w.QQQ) + ' · 금 ' + r1(w.GLD) + sxOn().map(function(o){ return ' · <span style="color:' + sxCol(ST.sx.indexOf(o)) + '">' + e(o.n) + ' ' + r1(w[sxKey(o.s)] || 0) + '</span>'; }).join("") + BDS.map(function(b){ return w[b[0]] ? ' · <span style="color:' + COLS[b[0]] + '">' + BDN[b[0]] + ' ' + r1(w[b[0]]) + '</span>' : ''; }).join("") + ' · 현금 ' + r1(w.BIL) + '</div>';
  }
  function r1(v){ return (Math.round(v * 1000) / 10) + "%"; }
  function head(my){
    return '<div class="pz-pre"><button data-pre="base">💼 기본 비중</button>' + (my ? '<button data-pre="mine">🙋 내 포트 비중</button>' : '') + '<button data-pre="spy">S&P 100%</button><button data-pre="6040">S&P 60 · 금 20 · 현금 20</button></div>' +
      sl("SPY", "S&P500") + sl("QQQ", "나스닥100") + sl("GLD", "금") +
      '<div id="pzbar">' + barH() + '</div>' +
      '<div class="pz-dt"><div class="pz-dth">📅 언제부터 <b id="pzfrom">' + e(ST.from && !PER[ST.from] ? ST.from.replace(/-/g, ".") : "") + '</b> <span class="mut">그날 종가에 샀다면 → 지금까지</span></div>' +
        '<div class="pz-dc">' + [["", "처음(2008.03)"], ["10y", "10년"], ["5y", "5년"], ["3y", "3년"], ["1y", "1년"], ["6m", "6개월"], ["ytd", "올해"]].map(function(x){ return '<button data-fr="' + x[0] + '" class="' + (ST.from === x[0] ? "on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>' +
        '<label class="pz-di">직접 <input type="date" id="pzdate" min="2008-03-17" max="' + new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + '" value="' + e(ST.from && !PER[ST.from] ? ST.from : "") + '"><small>주말·휴일이면 다음 거래일부터</small></label></div>' +
      '<div class="pz-md"><div class="pz-dth">💵 넣는 방식</div><div class="pz-dc"><button data-md="lump" class="' + (ST.mode !== "dca" ? "on" : "") + '">거치식 · 한 번에</button><button data-md="dca" class="' + (ST.mode === "dca" ? "on" : "") + '">적립식 · 매달</button></div>' +
        (ST.mode === "dca" ? '<div class="pz-dcf"><label>매달 <input type="number" inputmode="numeric" min="1" step="10" id="pzdm" value="' + (ST.dm || "") + '"> 만원</label>' +
          '<label>매월 <select id="pzdd">' + Array.apply(null, Array(28)).map(function(_, i){ return '<option value="' + (i + 1) + '"' + (+ST.dd === i + 1 ? " selected" : "") + '>' + (i + 1) + '일</option>'; }).join("") + '<option value="31"' + (+ST.dd >= 31 ? " selected" : "") + '>말일</option></select> 에 넣기</label>' +
          '<label>처음에 한 번 <input type="number" inputmode="numeric" min="0" step="100" id="pzd0" value="' + (ST.d0 || "") + '" placeholder="0"> 만원 <small>(선택)</small></label>' +
          '<small class="pz-dcn">시작은 위 「언제부터」 날짜 · 그날 종가에 사서 지금까지</small></div>' : '<small class="pz-dcn">시작 날짜에 ' + won(amt()) + '원을 한 번에 넣은 셈 (금액은 💼 내 포트 금액)</small>') + '</div>' +
      '<div class="pz-tg"><button data-tg="reg" class="' + (ST.reg ? "on" : "") + '">🛡 200일선 방어 <b>' + (ST.reg ? "켬" : "끔") + '</b></button><button data-tg="vol" class="' + (ST.vol ? "on" : "") + '">📉 변동성 맞춤 <b>' + (ST.vol ? "켬" : "끔") + '</b></button></div>' +
      sxUI() + bondUI();
  }
  function tk(x){ return x.m === "US" || (!x.m && /^[A-Z][A-Z.\-]*$/.test(x.s)) ? x.s : (window.V && V.cd ? V.cd(x.s) : x.s.replace(/\.(KS|KQ)$/, "")); }   // 미국 종목은 이름 밑에 티커
  function sxRow(x, i){
    var a = POOL && POOL.assets[x.s], bad = POOL && POOL.bad && POOL.bad[x.s], y = a && a.from ? a.from.slice(0, 7).replace("-", ".") : "";
    var st = a ? (y > "2008.03" ? '<small class="pz-sxok">' + y + ' 상장 → 그때부터</small>' : '') : bad ? '<small class="pz-sxbad">✗ 일봉 자료가 없어요 <button data-sxre="' + i + '">다시 요청</button></small>' : '<small class="pz-sxwait">⏳ 20년 일봉 받는 중 · 보통 15~30분 · 들어오면 자동으로 계산에 넣어요</small>';
    return '<div class="pz-sxr' + (a ? '' : ' wait') + '"><div class="pz-sxh"><i style="background:' + sxCol(i) + '"></i><span><b>' + e(x.n) + '</b><em class="tk">' + e(tk(x)) + '</em></span>' +
      '<b class="pz-sxv" id="pzsxv' + i + '">' + x.w + '%</b><button class="pz-sxx" data-sxdel="' + i + '" aria-label="빼기">✕</button></div>' +
      '<input type="range" min="5" max="50" step="5" value="' + x.w + '" data-sxw="' + i + '"' + (a ? '' : ' disabled') + '>' + st + '</div>';
  }
  function sxUI(){   // ➕ 11/18 종목·ETF 섞어 보기
    var L = ST.sx || [], have = {}; L.forEach(function(x){ have[x.s] = 1; });
    var sum = L.length + '개 · ' + L.reduce(function(t, x){ return t + (+x.w || 0); }, 0) + '%';
    return '<details class="pz-st pz-sx" id="pzsx"' + (L.length || ST.sxo ? " open" : "") + '><summary>➕ 종목·ETF 섞어 보기 ' + (L.length ? '<b>' + e(sum) + '</b>' : '<span class="mut">(지금 없음)</span>') + '</summary>' +
      (L.length < SXMAX ? '<div class="pz-sxq"><input type="search" id="pzsxq" placeholder="이름·코드 (예: 삼성전자, SCHD)" autocomplete="off" autocapitalize="off" spellcheck="false"><div id="pzsxres" class="pz-sxres"></div></div>' +
        '<div class="pz-sc pz-sxqk">' + QUICK.filter(function(q){ return !have[q[0]]; }).slice(0, 10).map(function(q){ return '<button data-sxq="' + e(q[0]) + '" data-nm="' + e(q[1]) + '" data-et="' + (q[2] ? 1 : 0) + '">' + e(q[1]) + '</button>'; }).join("") + '</div>'
        : '<p class="note" style="margin:2px 0 6px">최대 ' + SXMAX + '개까지 — 하나를 빼면 더 넣을 수 있어요.</p>') +
      L.map(sxRow).join("") +
      '<p class="note" style="margin:2px 0 0">약 2.8만 종목·ETF(한·미·일·중·홍) 중 아무거나 · 최대 ' + SXMAX + '개 · 각 5~50% · 종목 + 채권 합 80%까지 · 고른 비중만큼 S&P·나스닥·금·현금에서 비율대로 떼어 와요 · 방어 규칙 밖(그대로 둠) · 달마다 맞춤 · 배당 포함 값을 달러로 바꿔 셈(원화 수익은 🧾 세금 칸에서 환율 반영) · 상장이 늦으면 그날부터 계산.</p></details>';
  }
  function sxAdd(s, n, m, et){
    ST.sx = ST.sx || [];
    if (ST.sx.some(function(x){ return x.s === s; })) return false;
    if (ST.sx.length >= SXMAX){ if (window.P && P.toast) P.toast("종목·ETF 는 " + SXMAX + "개까지예요"); return false; }
    var room = 80 - extW(); if (room < 5){ if (window.P && P.toast) P.toast("종목 + 채권은 합쳐 80%까지예요 — 다른 칸을 줄여 주세요"); return false; }
    var x = {s: s, n: n || s, m: m || "", e: et ? 1 : 0, w: Math.min(10, Math.floor(room / 5) * 5)}; ST.sx.push(x);
    if (!(POOL && POOL.assets[s])) sxReq(x);
    return true;
  }
  function bondUI(){   // 🏦 11/17 채권 섞어 보기
    var B = bdOn(), on = Object.keys(B), br = IDX.assets.BRBOND;
    var sum = on.map(function(k){ return BDN[k] + ' ' + B[k] + '%'; }).join(" · ");
    return '<details class="pz-st pz-bd"' + (on.length ? " open" : "") + '><summary>🏦 채권 섞어 보기 <span class="mut">미국채 · 브라질국채</span> ' + (on.length ? '<b>' + e(sum) + '</b>' : '<span class="mut">(지금 없음)</span>') + '</summary>' +
      '<div class="pz-sc">' + BDS.map(function(b){ var a = IDX.assets[b[0]], y = a && a.from ? a.from.slice(0, 4) : "";
        return a ? '<button data-bd="' + b[0] + '" class="' + (B[b[0]] ? "on" : "") + '">' + b[1] + '<small>' + b[2] + (y > "2007" ? ' · ' + y + '~' : '') + '</small></button>' : '<button disabled style="opacity:.5">' + b[1] + '<small>자료 준비 중</small></button>'; }).join("") + '</div>' +
      on.map(function(k){ return '<label class="pz-sl"><span><i style="background:' + COLS[k] + '"></i>' + BDN[k] + ' <b id="pzbv' + k + '">' + B[k] + '%</b></span><input type="range" min="5" max="60" step="5" value="' + B[k] + '" data-bw="' + k + '"></label>'; }).join("") +
      '<p class="note" style="margin:2px 0 0">채권도 다른 칸에서 비율대로 떼어 와요 · 방어 규칙 밖(그대로 둠) · 종목 + 채권 합은 80%까지 · 미국채는 이자 포함 달러 값(원화 수익은 🧾 세금 칸에서 환율 반영)' +
        (br ? ' · 브라질국채 = 헤알 국채 값을 달러로 바꾼 값(헤알 값이 오르내린 것 포함)' + (br.splice ? ' · ' + br.splice.slice(0, 7).replace("-", ".") + ' 전은 브라질 기준금리 이자만 쌓은 근사(금리 변화로 값이 오르내린 것 빠짐)' : (/Selic/.test(br.src || "") ? ' · 브라질 기준금리 이자만 쌓은 근사(금리 변화로 값이 오르내린 것 빠짐)' : '')) + ' · 한-브라질 조세협약으로 이자·매매차익·환차익 비과세 · 브라질국채는 중개 상품이라 고객 요청이 있을 때만 제안 가능' : '') + '.</p></details>';
  }
  function curve(r, PN){
    var W = 340, H = 150, P = 4, N = r.nv.length, step = Math.max(1, Math.floor(N / 170)), lo = Infinity, hi = -Infinity;
    for (var i = 0; i < N; i++){ var a = Math.log(r.nv[i]), b = Math.log(r.sp[i]); if (a < lo) lo = a; if (b < lo) lo = b; if (a > hi) hi = a; if (b > hi) hi = b; }
    lo = Math.min(lo, 0); var X = function(i){ return P + (W - 2 * P - 40) * i / (N - 1); }, Yf = function(v){ return H - 16 - (H - 26) * (Math.log(v) - lo) / (hi - lo || 1); };
    var path = function(arr){ var s = ""; for (var i = 0; i < N; i += step) s += (s ? "L" : "M") + X(i).toFixed(1) + "," + Yf(arr[i]).toFixed(1); return s + "L" + X(N - 1).toFixed(1) + "," + Yf(arr[N - 1]).toFixed(1); };
    var span = hi - lo, g = "", mult = span > 0.9 ? [0.5, 1, 2, 3, 4, 6, 8, 12, 16] : span > 0.35 ? [0.6, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5] : [0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4];
    mult.forEach(function(m){ var lv = Math.log(m); if (lv < lo - 0.01 || lv > hi + 0.01) return; var y = Yf(m).toFixed(1);
      g += '<line x1="' + P + '" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" class="pz-gl"/><text x="' + (W - 38) + '" y="' + (+y + 3) + '" class="pz-gt">' + (span > 0.9 ? m + '배' : (m >= 1 ? '+' : '−') + Math.round(Math.abs(m - 1) * 100) + '%') + '</text>'; });
    var yt = "", lastY = null;
    var ystep = r.yrs > 12 ? 4 : r.yrs > 6 ? 2 : 1, lastM = null;
    for (var j = 0; j < N; j++){ var ds = day2s(r.D[r.i0 + j]), yy = ds.slice(0, 4), mm = ds.slice(0, 7);
      if (r.yrs >= 2){ if (yy !== lastY && +yy % ystep === 0 && j > 20) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + yy + '</text>'; }
      else if (mm !== lastM && j > 5 && (+ds.slice(5, 7)) % (r.yrs > 1 ? 3 : r.yrs > 0.4 ? 2 : 1) === 1) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + (+ds.slice(5, 7) === 1 ? yy.slice(2) + '.' : '') + (+ds.slice(5, 7)) + '월</text>';
      lastY = yy; lastM = mm; }
    var mi = r.D.indexOf ? -1 : -1;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pz-cv" role="img" aria-label="설계한 포트와 S&P500 곡선">' + g + yt +
      '<path d="' + path(r.sp) + '" class="pz-ls"/><path d="' + path(r.nv) + '" class="pz-lm"/>' +
      (PN && PN.alts ? PN.alts.map(function(a, k){ return a.path ? '<path d="' + path(a.path) + '" class="pz-pn pz-pn' + k + '"/>' : ''; }).join("") +
        '<circle cx="' + X(PN.s).toFixed(1) + '" cy="' + Yf(r.nv[PN.s]).toFixed(1) + '" r="4.5" class="pz-pnd"/><text x="' + Math.min(W - 70, Math.max(8, X(PN.s) - 10)).toFixed(1) + '" y="' + Math.max(10, Yf(r.nv[PN.s]) + 16).toFixed(1) + '" class="pz-pnt">😱 ' + PN.lab + '</text>' : '') +
      '<circle cx="' + X(N - 1).toFixed(1) + '" cy="' + Yf(r.nv[N - 1]).toFixed(1) + '" r="3" class="pz-dm"/></svg>' +
      '<div class="pz-key"><span><i class="m"></i>설계한 포트</span><span><i class="s"></i>S&P500(배당 포함, 그대로 들고 있기)</span>' + (PN && PN.alts ? '<span><i class="p"></i>😱 그날 팔았다면</span>' : '') + '<span class="mut">눈금은 배수(로그)</span></div>';
  }
  /* 😱 10/22 A10/22-1 패닉 비용 — S&P 가 고점에서 15% 넘게 빠진 구간마다 「가장 크게 빠진 날」 종가에 전부 팔고(현금·단기채 BIL)
     20·60·120거래일 뒤 다시 같은 비중으로 샀다면 지금 돈이 얼마 달라졌나 + 반대로 그날 투자금의 10% 를 더 넣었다면(그 돈은 원래 현금) */
  function panicEps(r){
    var sp = r.sp, N = sp.length, pk = sp[0], pki = 0, eps = [], cur = null;
    for (var u = 1; u < N; u++){
      if (sp[u] > pk){ if (cur && cur.dd <= -0.15) eps.push(cur); pk = sp[u]; pki = u; cur = null; continue; }
      var dd = sp[u] / pk - 1, r1 = sp[u] / sp[u - 1] - 1;
      if (!cur) cur = {dd: dd, worst: r1, s: u};
      if (dd < cur.dd) cur.dd = dd;
      if (r1 < cur.worst){ cur.worst = r1; cur.s = u; }
    }
    if (cur && cur.dd <= -0.15) eps.push(cur);
    return eps.filter(function(x){ return x.s + 20 < N; }).map(function(x){ var ds = day2s(r.D[r.i0 + x.s]); return {s: x.s, d: ds, dd: x.dd * 100, r1: x.worst * 100, lab: ds.slice(0, 7).replace("-", ".")}; });
  }
  function panicCalc(r, ep){
    var A = LASTA, bil = A && A.C.BIL; if (!bil) return null;
    var N = r.nv.length, s = ep.s, end = r.nv[N - 1], B = function(u){ return bil[r.i0 + u]; };
    var alts = [20, 60, 120].map(function(h){
      if (s + h >= N) return {h: h, na: 1};
      var k = (r.nv[s] / r.nv[s + h]) * (B(s + h) / B(s)), path = new Float64Array(N);
      for (var u = 0; u < N; u++) path[u] = u <= s ? r.nv[u] : u <= s + h ? r.nv[s] * B(u) / B(s) : r.nv[u] * k;
      return {h: h, path: path, end: end * k, back: day2s(r.D[r.i0 + s + h])};
    });
    var add = 1 - (r.nv[s] / end) * (B(N - 1) / B(s));   // 그날 가진 돈의 10% 를 포트에 더 넣은 것 − 현금으로 둔 것, 지금 돈 대비 (× 0.1 은 화면에서)
    return {s: s, lab: ep.lab, alts: alts, add: add, end: end};
  }
  function panicH(r){
    var eps = panicEps(r);
    if (!eps.length) return '<div class="pz-pnx" id="pzpanic"><div class="pz-pnh">😱 그날 겁먹고 팔았다면 <span class="mut">패닉 비용</span></div><p class="note" style="margin:4px 0 0">이 기간엔 S&P 가 고점에서 15% 넘게 빠진 적이 없어요 — 「처음(2008.03)」으로 보면 2008·2020·2022·2025 가 나와요.</p></div>';
    var sel = eps.filter(function(x){ return x.d === ST.pn; })[0] || eps[eps.length - 1], P = panicCalc(r, sel), A = amt();
    if (!P) return "";
    ST.pnObj = P;
    var rows = P.alts.map(function(a){
      if (a.na) return '<div class="pz-pnr"><span>' + a.h + '거래일 뒤 복귀</span><b class="mut">아직 그만큼 안 지남</b></div>';
      var dv = A * (a.end / P.end - 1), dp = (a.end / P.end - 1) * 100;
      return '<div class="pz-pnr"><span><i class="pz-pk pz-pk' + P.alts.indexOf(a) + '"></i>' + a.h + '거래일 뒤 ' + a.back.slice(2).replace(/-/g, ".") + ' 복귀</span><b class="' + cl(dv) + '">' + (dv >= 0 ? "+" : "−") + won(Math.abs(dv)) + '원</b><em>' + sg(dp, 1) + '%</em></div>'; });
    var ad = A * 0.1 * P.add;
    return '<div class="pz-pnx" id="pzpanic"><div class="pz-pnh">😱 그날 겁먹고 팔았다면 <span class="mut">패닉 비용 · 지금 돈 ' + won(A) + '원 기준</span></div>' +
      '<div class="pz-pnc">' + eps.map(function(x){ return '<button data-pn="' + x.d + '" class="' + (x === sel ? "on" : "") + '">' + x.lab + '<small>S&P ' + sg(x.r1, 1) + '%</small></button>'; }).join("") + '</div>' +
      '<p class="pz-pns"><b>' + sel.d.replace(/-/g, ".") + '</b> — S&P 고점에서 ' + sg(sel.dd, 0) + '% 빠진 구간 중 가장 크게 빠진 날(' + sg(sel.r1, 1) + '%). 그날 종가에 이 포트를 전부 팔고 현금(단기채)으로 있다가 다시 샀다면, 지금 ' + won(A) + '원이 그대로 들고 있던 것보다:</p>' +
      rows.join("") +
      '<div class="pz-pnr pz-pnb"><span>↔ 반대로 그날 가진 돈의 10% 를 더 넣었다면</span><b class="' + cl(ad) + '">' + (ad >= 0 ? "+" : "−") + won(Math.abs(ad)) + '원</b><em>현금으로 둔 것보다</em></div>' +
      '<p class="note" style="margin:4px 0 0">곡선의 점선 = 그날 팔았다면 · 이 포트 규칙(방어·변동성 맞춤) 그대로 · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p></div>';
  }
  function yearsH(r){
    var ys = Object.keys(r.Y).sort();
    return '<div class="pz-yr">' + ys.map(function(y){ var v = r.Y[y][0], s = r.Y[y][1], a = Math.min(1, Math.abs(v) / 35);
      return '<div title="' + y + ' 설계 ' + sg(v) + '% · S&P ' + sg(s) + '%" style="background:color-mix(in srgb,var(' + (v >= 0 ? "--up" : "--down") + ') ' + Math.round(15 + a * 70) + '%,transparent)"><small>' + y.slice(2) + '</small><b>' + (Math.abs(v) < 0.5 ? "0" : (v > 0 ? "+" : "−") + Math.abs(v).toFixed(0)) + '</b></div>'; }).join("") + '</div>' +
      '<p class="note" style="margin:3px 0 0">해마다 수익률(%) · 처음·마지막 해는 일부 기간 · 칸을 누르면 S&P 와 비교</p>';
  }
  function insur(R){
    var m = R.m, out = [];
    [["reg", "🛡 200일선 방어"], ["vol", "📉 변동성 맞춤"]].forEach(function(t){
      var a = R.alt[t[0]]; if (!a || !m) return; var on = ST[t[0]];
      var sh = m.yrs < 1, dc = sh ? a.tot - m.tot : a.cagr - m.cagr, dm = a.mdd - m.mdd;   // 1년 안 = 기간 수익 차이
      out.push('<div class="pz-in"><b>' + t[1] + '</b> ' + (on ? '끄면' : '켜면') + (sh ? ' 기간 수익 ' : ' 연 ') + '<b class="' + cl(dc) + '">' + sg(dc, 1) + '%p</b> · 최대 낙폭 ' + sg(m.mdd, 0) + '% → <b class="' + (dm < -0.5 ? "dn" : dm > 0.5 ? "up" : "") + '">' + sg(a.mdd, 0) + '%</b>' +
        '<small>' + (on ? (dc > 0.1 && dm < -0.5 ? '= 이 보험값: ' + (sh ? '이 기간 ' : '해마다 ') + dc.toFixed(1) + '%p 내고 낙폭 ' + Math.abs(dm).toFixed(0) + '%p 덜 맞음' : dc <= 0.1 && dm < -0.5 ? '= 끄면 덜 벌고 더 맞음 — 공짜 보험' : '') : (dc < -0.1 && dm > 0.5 ? '= 켜면 ' + (sh ? '이 기간 ' : '해마다 ') + Math.abs(dc).toFixed(1) + '%p 내고 낙폭 ' + dm.toFixed(0) + '%p 덜 맞음' : dc >= -0.1 && dm > 0.5 ? '= 켜면 덜 맞고 더 벎 — 공짜 보험' : '')) + '</small></div>');
    });
    return out.join("");
  }
  function delta(c, p){
    if (!c || !p) return "";
    var a = c.cagr - p.cagr, b = c.mdd - p.mdd;
    if (Math.abs(a) < 0.05 && Math.abs(b) < 0.3) return "";
    return '<div class="pz-dl">방금 바꾸기 전보다 · 연 <b class="' + cl(a) + '">' + sg(a, 1) + '%p</b> · 최대 낙폭 <b class="' + (b > 0 ? "up" : "dn") + '">' + sg(b, 1) + '%p</b></div>';
  }
  function result(){
    ST.pnObj = null;
    if (!ST.last) return '<div class="loading">계산 중…</div>';
    if (ST.last.err) return '<div class="empty">' + e(ST.last.err) + '</div>';
    var R = ST.last.R, r = R.m, A = amt();
    var lng = r.yrs >= 1, wy = r.yrs >= 2 && r.worst && r.Y[r.worst];
    return (ST.mode === "dca" ? dcaH(r) + '<div class="pz-sel">📊 포트 자체 성적 <span class="mut">한 번에 넣었을 때 기준 · 적립식도 같은 포트를 사는 것</span></div>' : '') + '<div class="pz-per">📅 <b>' + r.from.replace(/-/g, ".") + '</b>부터 지금까지 <b class="' + cl(r.tot) + '">' + sg(r.tot, 1) + '%</b> <span>S&P ' + sg(r.sptot, 1) + '% · ' + (r.tot - r.sptot >= 0 ? '앞섬 ' : '뒤짐 ') + sg(r.tot - r.sptot, 1) + '%p</span></div>' +
      '<div class="pz-big">' + (lng ? '<div><small>연 수익</small><b class="' + cl(r.cagr) + '">' + sg(r.cagr, 1) + '%</b><em>S&P ' + sg(r.sp_cagr, 1) + '%</em></div>' : '<div><small>기간 수익</small><b class="' + cl(r.tot) + '">' + sg(r.tot, 1) + '%</b><em>S&P ' + sg(r.sptot, 1) + '%</em></div>') +
      '<div><small>최대 낙폭</small><b class="dn">' + sg(r.mdd, 0) + '%</b><em>' + r.mddAt.slice(0, 7).replace("-", ".") + ' · S&P ' + sg(r.sp_mdd, 0) + '%</em></div>' +
      (wy ? '<div><small>최악의 해</small><b class="' + cl(wy[0]) + '">' + sg(wy[0], 0) + '%</b><em>' + r.worst + (wy[2] < 240 ? '(일부)' : '') + ' · S&P ' + sg(wy[1], 0) + '%</em></div>' :
        '<div><small>S&P보다</small><b class="' + cl(r.tot - r.sptot) + '">' + sg(r.tot - r.sptot, 1) + '%p</b><em>같은 기간</em></div>') + '</div>' +
      delta(r, ST.prev) +
      (ST.mode === "dca" ? '' : '<div class="pz-won">💰 ' + won(A) + '원 → <b>' + won(A * r.end) + '원</b> <small>S&P 그대로였다면 ' + won(A * r.sp_end) + '원 · ' + r.from.slice(0, 7).replace("-", ".") + ' ~ ' + r.to.slice(2).replace(/-/g, ".") + ' (' + (r.yrs >= 1.5 ? r.yrs.toFixed(0) + '년' : Math.round(r.yrs * 12) + '개월') + ')</small></div>') +
      (function(){ try { return taxH(r); } catch(x) { console.warn(x); return ""; } })() +
      (function(){ var ph = ""; try { ph = panicH(r); } catch(x) { console.warn(x); } return curve(r, ST.pnObj) + insur(R) + ph; })() + yearsH(r) +
      '<p class="note pz-ms">휴대폰에서 ' + (r.nv.length * 3).toLocaleString() + '일 치를 ' + (ST.ms < 1000 ? ST.ms.toFixed(0) + 'ms' : (ST.ms / 1000).toFixed(1) + '초') + ' 만에 다시 셈 · 평균 주식 ' + r.expo.toFixed(0) + '%' +
        (CHKOK ? (CHKOK.ok === CHKOK.n ? ' · <b class="pz-ok">✓ 파이썬 검사 ' + CHKOK.n + '개와 같은 숫자</b>' : ' · ⚠️ 파이썬 검사 ' + CHKOK.ok + '/' + CHKOK.n + ' 맞음') : '') + '</p>';
  }
  // 🔧 11/14 ui_audit 「🙋 내 포트 비중 405→582」: 프리셋·종목 단추가 설계기를 통째로 다시 그리면 누른 단추가 아래로 밀림 → 다시 그린 뒤 손가락 밑 제자리로
  function pin(sel, y0){ var fix = function(){ var n = document.querySelector("#main " + sel) || document.querySelector(sel); if (!n) return; var d = n.getBoundingClientRect().top - y0; if (Math.abs(d) > 2) window.scrollBy(0, d); };
    // 늦게 오는 계산 결과(세금·위기 칸 등)가 위 칸 높이를 바꿔도 1.5초 동안 매 프레임 붙잡음 — 손가락·휠이 움직이면 바로 놓음
    var t0 = Date.now(), stop = false, off = function(){ stop = true; }; ["touchstart", "wheel", "keydown"].forEach(function(k){ window.addEventListener(k, off, {once: true, passive: true}); });
    (function loop(){ if (stop) return; fix(); if (Date.now() - t0 < 1500) (window.requestAnimationFrame || setTimeout)(loop, 16); })(); }
  function paint(){ var r = document.getElementById("pzres"); if (r) r.innerHTML = result(); bindRes(); var b = document.getElementById("pzbar"); if (b) b.innerHTML = barH(); }
  var RUN = 0;
  function calc(){
    var my = ++RUN;
    series().then(function(A){
      if (my !== RUN) return;
      if (!A){ ST.last = {err: "일봉을 못 받은 자산이 있어요. 잠시 뒤 다시 열어 주세요."}; paint(); return; }
      var R = null; try { R = runAll(A); } catch(x) { console.warn(x); }
      if (ST.last && ST.last.R && ST.last.R.m) ST.prev = ST.last.R.m;
      ST.last = R && R.m ? {R: R} : {err: "같이 거래된 날이 너무 적어 계산할 수 없어요(상장이 늦은 종목일 때)."};
      paint();
      verify().then(function(v){ if (v && my === RUN) paint(); });
    });
  }
  var MY = null;
  function draw(box){
    if (!box) return;
    if (!IDX){ box.innerHTML = '<div class="loading">포트 설계기 자료 불러오는 중…</div>'; idx().then(function(){ draw(document.getElementById(box.id)); }); return; }
    if (!ETF.every(function(k){ return IDX.assets[k]; })){ box.innerHTML = '<div class="sec">🎛 포트 설계기</div><section class="card"><div class="empty">20년 치 일봉 자료 준비 중 — 상품 작업이 한 번 돈 뒤 채워져요.</div></section>'; return; }
    box.innerHTML = '<div class="sec">🎛 포트 설계기 <small class="mut">비중·날짜를 바꾸면 그때부터 지금까지 다시 계산 · 휴대폰에만 저장</small></div><section class="card pz">' +
      '<p class="pz-sub">💼 기본 포트 규칙 그대로(200일선 방어 · 변동성 맞춤 · 달마다 맞춤 · 비용 0.1%) 비중과 시작 날짜는 내 맘대로 — 그날 종가에 사서 매일 굴린 셈이에요(처음 = 2008년 3월, 폭락까지 다 넣음).</p>' + head(MY) +
      '<div class="pz-res" id="pzres">' + result() + '</div>' +
      '<p class="note" style="margin:8px 0 0">과거 계산이고 미래를 보장하지 않아요 · 배당 포함 ETF 값(SPY·QQQ·GLD·BIL' + (Object.keys(bdOn()).length ? ' · 채권 ' + Object.keys(bdOn()).map(function(k){ return BDN[k]; }).join("·") : '') + ') · 세금·환전 비용은 🧾 세금 칸에서 따로 뗌 · 사라는 뜻이 아니에요.</p></section>';
    bind(box);
    if (!ST.last) calc(); else bindRes();
    if (window.__pdzFocus){ window.__pdzFocus = 0; setTimeout(function(){ box.scrollIntoView({block: "start", behavior: "smooth"}); }, 120); }
    if (window.__pdzPanic){ window.__pdzPanic = 0; var tries = 0, fp = function(){ var z = document.getElementById("podz"), p = document.getElementById("pzpanic"); if (z && z.classList.contains("cz-on")){ var hz = z.querySelector(".cz-h"); if (hz) hz.click(); else z.classList.remove("cz-on"); }   // calm.js 가 접어 둔 설계기 펼치기
      if (p && p.getBoundingClientRect().height) window.scrollTo({top: scrollY + p.getBoundingClientRect().top - 130, behavior: "smooth"}); else if (tries++ < 30) setTimeout(fp, 200); }; setTimeout(fp, 400); }
  }
  function bindRes(){
    [].forEach.call(document.querySelectorAll("#pzpanic [data-pn]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.pn = b.getAttribute("data-pn"); var r = document.getElementById("pzres"); if (r){ r.innerHTML = result(); bindRes(); } }; });
    var rr = function(){ var el = document.getElementById("pzres"); if (el){ el.innerHTML = result(); bindRes(); } };
    var tx = document.getElementById("pztx");
    if (tx){ tx.addEventListener("toggle", function(){ ST.txo = tx.open ? 1 : 0; keep(); });
      tx.querySelector("summary").addEventListener("click", function(ev){ ev.stopPropagation(); }); }
    [].forEach.call(document.querySelectorAll("#pztx [data-tx]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.tx = b.getAttribute("data-tx"); keep(); rr(); }; });
    [].forEach.call(document.querySelectorAll("#pztx [data-br]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST[ST.tx === "big" ? "brb" : "brg"] = +b.getAttribute("data-br"); keep(); rr(); }; });
    var of = document.getElementById("pztxof");
    if (of){ of.addEventListener("click", function(ev){ ev.stopPropagation(); });
      of.onchange = function(){ ST.of = Math.max(0, Math.round(+of.value || 0)); keep(); rr(); }; }
    [].forEach.call(document.querySelectorAll(".pz-yr>div"), function(d){ d.onclick = function(ev){ ev.stopPropagation(); if (window.P && P.toast) P.toast(d.title); }; });
  }
  function bindSx(box){
    var redo = function(sel){ var el = box.querySelector(sel), y0 = el ? el.getBoundingClientRect().top : 0; keep(); draw(box); calc(); pin("#pzsx", y0 || (box.querySelector("#pzsx") || {getBoundingClientRect: function(){ return {top: 0}; }}).getBoundingClientRect().top); };
    var det = box.querySelector("#pzsx"); if (det) det.addEventListener("toggle", function(){ ST.sxo = det.open ? 1 : 0; });
    var addOne = function(s, n, m, et){ var y0 = (box.querySelector("#pzsx") || box).getBoundingClientRect().top; if (!sxAdd(s, n, m, et)) return; ST.sxo = 1; keep(); draw(box); calc(); pin("#pzsx", y0);
      setTimeout(function(){ var q = document.getElementById("pzsxq"); if (q && document.activeElement !== q && ST.sx.length < SXMAX) {} }, 0); };
    [].forEach.call(box.querySelectorAll("[data-sxq]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var s = b.getAttribute("data-sxq"); addOne(s, b.getAttribute("data-nm"), /\.(KS|KQ)$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /^\^/.test(s) ? "" : "US", +b.getAttribute("data-et")); }; });
    [].forEach.call(box.querySelectorAll("[data-sxdel]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var i = +b.getAttribute("data-sxdel"), y0 = (box.querySelector("#pzsx") || box).getBoundingClientRect().top; ST.sx.splice(i, 1); ST.sxo = 1; keep(); draw(box); calc(); pin("#pzsx", y0); }; });
    [].forEach.call(box.querySelectorAll("[data-sxre]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var x = ST.sx[+b.getAttribute("data-sxre")]; if (!x) return; try { localStorage.removeItem("pdzreq:" + x.s); } catch(z) {} if (POOL && POOL.bad) delete POOL.bad[x.s]; sxReq(x); keep(); draw(box); if (window.P && P.toast) P.toast("다시 요청했어요 — 15~30분 뒤 다시 열어 보세요"); }; });
    [].forEach.call(box.querySelectorAll("input[data-sxw]"), function(x){ var i = +x.getAttribute("data-sxw"), o = ST.sx[i]; if (!o) return;
      x.oninput = function(){ var v = +x.value, room = 80 - (extW() - (+o.w || 0)); if (v > room){ v = Math.max(5, Math.floor(room / 5) * 5); x.value = v; } o.w = v; var t = document.getElementById("pzsxv" + i); if (t) t.textContent = v + "%"; var bb = document.getElementById("pzbar"); if (bb) bb.innerHTML = barH(); };
      x.onchange = function(){ x.oninput(); keep(); calc(); var sm = box.querySelector("#pzsx summary b"); if (sm) sm.textContent = ST.sx.length + "개 · " + ST.sx.reduce(function(t, y){ return t + (+y.w || 0); }, 0) + "%"; };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
    var q = box.querySelector("#pzsxq"), res = box.querySelector("#pzsxres");
    if (q && res){
      q.addEventListener("click", function(ev){ ev.stopPropagation(); });
      var show = function(){ var t = q.value.trim(); if (!t){ res.innerHTML = ""; return; }
        if (!window.opSearch || !window.OPIDX){ res.innerHTML = '<div class="pz-sxh2">종목 목록 불러오는 중…</div>'; return; }
        var have = {}; (ST.sx || []).forEach(function(x){ have[x.s] = 1; });
        var T = t.toUpperCase(), r0 = opSearch(t) || [], ex = (window.OPIDX || []).filter(function(x){ return x.sym.toUpperCase() === T || x.sym.toUpperCase().replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "") === T; });   // 티커를 정확히 치면 그 종목이 맨 위(SCHD → 찰스 슈왑보다 SCHD ETF)
        var r = ex.concat(r0.filter(function(x){ return ex.indexOf(x) < 0; })).slice(0, 7), FL = window.FLAG || {};
        res.innerHTML = r.length ? r.map(function(x){ var rd = POOL && POOL.assets[x.sym];
          return '<button type="button" data-sxa="' + e(x.sym) + '" data-nm="' + e(x.name) + '" data-mk="' + e(x.mkt || "") + '" data-et="' + (x.etf ? 1 : 0) + '"' + (have[x.sym] ? ' disabled' : '') + '>' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b>' + (x.etf ? ' <span class="gs-etf">ETF</span>' : '') +
            '<small>' + e(x.mkt === "US" ? x.sym : (window.V && V.cd ? V.cd(x.sym) : x.sym)) + (have[x.sym] ? ' · 담음' : rd ? ' · 바로 계산' : ' · 처음이면 15~30분') + '</small></button>'; }).join("")
          : '<div class="pz-sxh2">「' + e(t) + '」 — 못 찾았어요</div>';
        [].forEach.call(res.querySelectorAll("[data-sxa]"), function(y){ var go1 = function(ev){ ev.preventDefault(); ev.stopPropagation(); if (y._done) return; y._done = 1; addOne(y.dataset.sxa, y.dataset.nm, y.dataset.mk, +y.dataset.et); };
          y.onmousedown = go1; y.onclick = go1; });   // 누르는 순간(mousedown) 바로 담음 — 입력칸이 포커스를 잃으며 키보드가 내려가고 화면이 다시 그려져 탭이 빗나가는 일 막기 · 스크롤은 mousedown 이 안 생김
      };
      q.oninput = show; q.onkeydown = function(ev){ if (ev.key === "Enter"){ ev.preventDefault(); var f = res.querySelector("[data-sxa]:not([disabled])"); if (f) f.click(); } };
      q.onfocus = function(){ if (window.opLoadIdx && !window.OPIDX) opLoadIdx().then(show, function(){}); };
    }
    // ⏳ 받는 중인 종목이 있으면 열려 있는 동안 2분마다 다시 확인 → 들어오면 바로 계산
    if ((ST.sx || []).some(function(x){ return !sxReady(x); }) && !SXT) SXT = setInterval(function(){
      var bx = document.getElementById(box.id); if (!bx || !(ST.sx || []).some(function(x){ return !sxReady(x); })){ clearInterval(SXT); SXT = 0; return; }
      var before = ST.sx.filter(sxReady).length; POOLT = 0;
      poolLoad().then(function(){ if (ST.sx.filter(sxReady).length > before){ var b2 = document.getElementById(box.id); if (b2){ draw(b2); calc(); } if (window.P && P.toast) P.toast("➕ 요청한 종목 자료가 들어와 계산에 넣었어요"); } }); }, 120e3);
  }
  var SXT = 0;
  function bind(box){
    [].forEach.call(box.querySelectorAll("input[data-pz]"), function(x){
      var k = x.getAttribute("data-pz");
      var sync = function(){ var v = +x.value, o = 0; ["SPY", "QQQ", "GLD"].forEach(function(j){ if (j !== k) o += ST.w[j]; });
        if (v + o > 100){ v = 100 - o; x.value = v; } ST.w[k] = v; var t = document.getElementById("pzv" + k); if (t) t.textContent = v + "%"; var b = document.getElementById("pzbar"); if (b) b.innerHTML = barH(); };
      x.oninput = sync; x.onchange = function(){ sync(); keep(); calc(); };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); });
    });
    [].forEach.call(box.querySelectorAll("[data-pre]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var p = b.getAttribute("data-pre");
      ST.w = p === "base" ? {SPY: 47.5, QQQ: 47.5, GLD: 5} : p === "spy" ? {SPY: 100, QQQ: 0, GLD: 0} : p === "6040" ? {SPY: 60, QQQ: 0, GLD: 20} : {SPY: MY.spx, QQQ: MY.ndx, GLD: MY.gold};
      if (p === "base"){ ST.reg = 1; ST.vol = 1; }
      var y0 = b.getBoundingClientRect().top; keep(); draw(box); calc(); pin("[data-pre=\"" + p + "\"]", y0); }; });
    [].forEach.call(box.querySelectorAll("[data-tg]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var k = b.getAttribute("data-tg"); ST[k] = ST[k] ? 0 : 1;
      b.classList.toggle("on", !!ST[k]); b.querySelector("b").textContent = ST[k] ? "켬" : "끔"; keep(); calc(); }; });
    bindSx(box);
    [].forEach.call(box.querySelectorAll("[data-bd]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var k = b.getAttribute("data-bd"); ST.bd = ST.bd || {};
      if (ST.bd[k]) delete ST.bd[k]; else { var room = 80 - extW(); if (room < 5){ if (window.P && P.toast) P.toast("종목 + 채권은 합쳐 80%까지예요 — 다른 칸을 줄여 주세요"); return; } ST.bd[k] = Math.min(20, room); }
      var y0 = b.getBoundingClientRect().top; keep(); draw(box); calc(); pin("[data-bd=\"" + k + "\"]", y0); }; });
    [].forEach.call(box.querySelectorAll("input[data-bw]"), function(x){ var k = x.getAttribute("data-bw");
      x.oninput = function(){ var v = +x.value, room = 80 - (extW() - (ST.bd[k] || 0)); if (v > room){ v = Math.max(5, Math.floor(room / 5) * 5); x.value = v; } ST.bd[k] = v; var t = document.getElementById("pzbv" + k); if (t) t.textContent = v + "%"; var bb = document.getElementById("pzbar"); if (bb) bb.innerHTML = barH(); };
      x.onchange = function(){ x.oninput(); keep(); calc(); var sm = box.querySelector(".pz-bd summary b"); if (sm){ var B = bdOn(); sm.textContent = Object.keys(B).map(function(j){ return BDN[j] + " " + B[j] + "%"; }).join(" · "); } };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
    [].forEach.call(box.querySelectorAll("[data-fr]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.from = b.getAttribute("data-fr");
      [].forEach.call(box.querySelectorAll("[data-fr]"), function(x){ x.classList.toggle("on", x === b); }); var di = document.getElementById("pzdate"); if (di) di.value = ""; var f = document.getElementById("pzfrom"); if (f) f.textContent = ""; keep(); calc(); }; });
    var di = document.getElementById("pzdate");
    if (di){ di.addEventListener("click", function(ev){ ev.stopPropagation(); });
      di.onchange = function(){ var v = di.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return; ST.from = v;
        [].forEach.call(box.querySelectorAll("[data-fr]"), function(x){ x.classList.remove("on"); }); var f = document.getElementById("pzfrom"); if (f) f.textContent = v.replace(/-/g, "."); keep(); calc(); }; }
    [].forEach.call(box.querySelectorAll("details.pz-st summary"), function(s){ s.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
    // 💵 넣는 방식 — 계산(엔진)은 그대로, 결과 칸만 다시 그림 · 거치식이면 적립식 칸은 닫힘
    [].forEach.call(box.querySelectorAll("[data-md]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var md = b.getAttribute("data-md"); if (ST.mode === md) return; ST.mode = md; keep(); draw(box); }; });
    var rp = function(){ var r = document.getElementById("pzres"); if (r){ r.innerHTML = result(); bindRes(); } };
    [["pzdm", "dm"], ["pzd0", "d0"], ["pzdd", "dd"]].forEach(function(q){ var el = document.getElementById(q[0]); if (!el) return;
      el.addEventListener("click", function(ev){ ev.stopPropagation(); });
      var f = function(){ var v = Math.max(0, Math.round(+el.value || 0)); if (q[1] === "dm" && !v) return; ST[q[1]] = q[1] === "dd" ? (v || 1) : v; keep(); rp(); };
      el.onchange = f; if (el.tagName === "INPUT") el.oninput = function(){ clearTimeout(el._t); el._t = setTimeout(f, 500); }; });
  }
  window.portDesign = function(box, my){ MY = my && (my.spx + my.ndx + my.gold) > 0 ? my : null; draw(box); };
  // ⚖️ A10/21-3 세 갈래 길이 같은 엔진을 씀: 💼 기본 규칙 n년 굴림 분포
  window.__pdz = {
    ready: function(){ return idx().then(function(){ return Promise.all(ETF.map(px)); }).then(function(ss){ return ss.every(Boolean) ? align({SPY: ss[0], QQQ: ss[1], GLD: ss[2], BIL: ss[3]}) : null; }); },
    panic: function(){ ST.from = ""; ST.last = null; keep(); window.__pdzFocus = 1; window.__pdzPanic = 1; },
    tax: {sim: sim, flowsOf: flowsOf, taxH: taxH, set: function(x){ TXD = x; TXW = Promise.resolve(x); }}, engine: engine, wts: function(){ var w = wts(); return Object.keys(w).some(function(k){ return ETF.indexOf(k) < 0; }) ? null : w; }, cfg: function(){ return {reg: ST.reg, vol: ST.vol, w: ST.w, st: "", stw: 0, sx: sxOn().map(function(x){ return {s: x.s, n: x.n, m: x.m, e: x.e, w: x.w}; }), bd: bdOn()}; }
  };

  /* 📄 종목 화면: 「💼 이 종목 5% 넣어 보면」 — 11/18 모든 종목·ETF 로 넓힘(자료가 없으면 요청) */
  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){
    return OLD(sym).then(function(h){
      var s = String(sym || "").trim(); if (!s) return h;
      setTimeout(function(){ var el = document.getElementById("opsig"); if (!el || el.querySelector(".pz-go")) return;
        var r = window.opFind ? opFind(s) : null; if (r && r.sym) s = r.sym;
        var b = document.createElement("button"); b.className = "pz-go"; b.type = "button";
        b.innerHTML = '💼 이 종목 5% 넣어 보면 <small>포트 설계기 · 2008년부터 다시 계산 ›</small>';
        b.onclick = function(ev){ ev.stopPropagation();
          var nm = r && r.name || s, mk = r && r.mkt || "", hit = (ST.sx || []).filter(function(x){ return x.s === s; })[0];
          if (!hit){ if ((ST.sx || []).length >= SXMAX) ST.sx.shift(); var room = 80 - extW(); if (room < 5) ST.bd = {};
            ST.sx.push({s: s, n: nm, m: mk, e: r && r.etf ? 1 : 0, w: 5}); poolLoad().then(function(){ if (!(POOL && POOL.assets[s])) sxReq({s: s, n: nm}); }); }
          ST.sxo = 1; ST.last = null; keep(); window.__pdzFocus = 1; if (window.go) go("port"); };
        el.appendChild(b); }, 80);
      return h;
    });
  };


  var css = document.createElement("style");
  css.textContent =
    ".pz-sub{margin:-2px 0 8px;font-size:12.5px;color:var(--sub)}.pz-pre{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px}" +
    ".pz-pre button,.pz-sc button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-sc{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.pz-sc button small{margin-left:3px;font-size:12.5px;color:var(--sub)}.pz-sc button.on{background:#d55181;color:#fff;border-color:transparent;font-weight:700}.pz-sc button.on small{color:#fde}" +
    ".pz-sl{display:flex;align-items:center;gap:10px;margin:2px 0;font-size:13px}.pz-sl span{min-width:118px;display:flex;align-items:center;gap:5px}.pz-sl span i{width:9px;height:9px;border-radius:2px;display:inline-block}.pz-sl input{flex:1;accent-color:#e9c46a;height:30px}" +
    ".pz-bar{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:1px;margin:6px 0 3px}.pz-lg{font-size:12.5px;color:var(--sub)}" +
    ".pz-dt{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed var(--line)}.pz-dth{font-size:13px;font-weight:700}.pz-dth .mut{font-weight:400;font-size:12.5px}.pz-dth b{color:#e9c46a}" +
    ".pz-dc{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.pz-dc button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}.pz-dc button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:700}" +
    ".pz-di{display:flex;align-items:center;gap:8px;font-size:12.5px;flex-wrap:wrap}.pz-di input{font:inherit;font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.pz-di small{font-size:12.5px;color:var(--sub)}" +
    ".pz-per{font-size:14px;margin:0 0 8px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#e9c46a 12%,var(--panel2))}.pz-per b{font-variant-numeric:tabular-nums}.pz-per b.up{color:var(--up)}.pz-per b.dn{color:var(--down)}.pz-per span{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pz-tg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0 4px}.pz-tg button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:10px;padding:8px 6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-tg button b{display:block;font-size:12.5px}.pz-tg button.on{border-color:#e9c46a;color:var(--text);background:color-mix(in srgb,#e9c46a 14%,var(--panel2))}.pz-tg button.on b{color:#e9c46a}" +
    ".pz-st{margin:8px 0 0;font-size:13px}.pz-st summary{cursor:pointer;color:var(--sub)}.pz-st summary b{color:var(--text)}" +
    ".pz-md{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed var(--line)}.pz-dcf{display:grid;gap:7px;margin:4px 0 2px;font-size:13.5px}.pz-dcf label{display:flex;align-items:center;gap:6px;flex-wrap:wrap}" +
    ".pz-dcf input,.pz-dcf select{font:inherit;font-size:16px;width:110px;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.pz-dcf select{width:auto}.pz-dcf small,.pz-dcn{font-size:12.5px;color:var(--sub)}" +
    ".pz-dca .pz-big b{font-size:19px;white-space:nowrap}.pz-sel{font-size:14px;font-weight:800;margin:6px 0 6px;padding-top:8px;border-top:1px dashed var(--line)}.pz-sel .mut{font-weight:400;font-size:12.5px}.pz-dca{margin:0 0 10px}.pz-dcah{font-size:14px;font-weight:800;margin:0 0 6px}.pz-dcah .mut{display:block;font-weight:400;font-size:12.5px}.pz-li{fill:none;stroke:#8a94a8;stroke-width:1.4}.pz-key i.i{background:#8a94a8}" +
    ".pz-res{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".pz-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.pz-big>div{background:var(--panel2);border-radius:10px;padding:8px 6px;text-align:center}.pz-big small,.pz-big em{display:block;font-size:12.5px;color:var(--sub);font-style:normal}" +
    ".pz-big b{display:block;font-size:22px;font-variant-numeric:tabular-nums;margin:1px 0}.pz-big b.up,.pz-in b.up,.pz-dl b.up{color:var(--up)}.pz-big b.dn,.pz-in b.dn,.pz-dl b.dn{color:var(--down)}" +
    ".pz-dl{font-size:12.5px;color:var(--sub);margin:6px 0 0}.pz-won{margin:10px 0 2px;font-size:14px}.pz-won b{font-size:17px}.pz-won small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pz-cv{width:100%;height:auto;display:block;margin:4px 0 0}.pz-gl{stroke:var(--line);stroke-width:1}.pz-gt{fill:var(--sub);font-size:9.5px}.pz-ls{fill:none;stroke:#7c9cff;stroke-width:1.4;stroke-dasharray:3 2;opacity:.85}.pz-lm{fill:none;stroke:#e9c46a;stroke-width:2.2}.pz-dm{fill:#e9c46a}" +
    ".pz-key{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:2px 0 8px}.pz-key i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:4px;vertical-align:middle}.pz-key i.m{background:#e9c46a}.pz-key i.s{background:#7c9cff}" +
    ".pz-in{font-size:13px;padding:7px 9px;border-radius:9px;background:var(--panel2);margin:5px 0}.pz-in small{display:block;font-size:12.5px;color:var(--sub);margin-top:1px}" +
    ".pz-yr{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:3px;margin-top:8px}.pz-yr>div{border-radius:6px;padding:3px 0;text-align:center;cursor:pointer}.pz-yr small{display:block;font-size:12.5px;color:var(--sub)}.pz-yr b{font-size:12.5px;font-variant-numeric:tabular-nums}" +
    ".pz-ms{margin:8px 0 0;font-size:12.5px}.pz-ok{color:#3fb950}" +
    ".pz-pn{fill:none;stroke-width:1.3;stroke-dasharray:4 3}.pz-pn0{stroke:#ff8fa3}.pz-pn1{stroke:#c77dff}.pz-pn2{stroke:#8a94a8}.pz-pnd{fill:none;stroke:#ff6b6b;stroke-width:2}.pz-pnt{fill:#ff6b6b;font-size:10px;font-weight:700}" +
    ".pz-key i.p{background:repeating-linear-gradient(90deg,#ff8fa3 0 4px,transparent 4px 7px)}" +
    ".pz-pnx{margin:10px 0 4px;padding:10px;border-radius:12px;background:color-mix(in srgb,#ff6b6b 9%,var(--panel2))}.pz-pnh{font-size:14.5px;font-weight:800}.pz-pnh .mut{font-weight:400;font-size:12.5px}" +
    ".pz-pnc{display:flex;flex-wrap:wrap;gap:5px;margin:7px 0}.pz-pnc button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:4px 9px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;text-align:center}.pz-pnc button small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}.pz-pnc button.on{background:#ff6b6b;color:#fff;border-color:transparent}.pz-pnc button.on small{color:#ffe}" +
    ".pz-pns{font-size:12.5px;color:var(--sub);margin:2px 0 6px;word-break:keep-all}.pz-pns b{color:var(--text)}" +
    ".pz-pnr{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:baseline;padding:6px 0;border-top:1px solid var(--line);font-size:13px}.pz-pnr b{font-size:16px;font-variant-numeric:tabular-nums;white-space:nowrap}.pz-pnr b.up{color:var(--up)}.pz-pnr b.dn{color:var(--down)}.pz-pnr em{font-style:normal;font-size:12.5px;color:var(--sub);white-space:nowrap;min-width:46px;text-align:right}" +
    ".pz-pk{display:inline-block;width:12px;height:0;border-top:2px dashed;margin-right:5px;vertical-align:middle}.pz-pk0{color:#ff8fa3}.pz-pk1{color:#c77dff}.pz-pk2{color:#8a94a8}.pz-pnb{font-weight:700;grid-template-columns:auto 1fr}.pz-pnb span{grid-column:1/-1}.pz-pnb em{text-align:left}" +
    ".pz-tx{margin:12px 0 6px;padding:10px;border-radius:12px;background:color-mix(in srgb,#3fb950 7%,var(--panel2));border:1px solid color-mix(in srgb,#3fb950 25%,var(--line))}" +
    ".pz-tx>summary{cursor:pointer;list-style:none;display:flex;flex-direction:column;gap:2px}.pz-tx>summary::-webkit-details-marker{display:none}.pz-tx>summary>b{font-size:15px}.pz-tx>summary>b::after{content:' ›';color:var(--sub);font-weight:400}.pz-tx[open]>summary>b::after{content:' ⌄'}" +
    ".pz-tx>summary span{font-size:13px;color:var(--sub)}.pz-tx>summary span b{font-size:15px;font-variant-numeric:tabular-nums}.pz-tx b.up{color:var(--up)}.pz-tx b.dn{color:var(--down)}.pz-tx>summary small{font-size:12.5px;margin-left:4px}" +
    ".pz-txt{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0 8px}.pz-txt button{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:10px;padding:8px 6px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;word-break:keep-all}.pz-txt button small{display:block;font-weight:400;font-size:12px}" +
    ".pz-txt button.on{background:#3fb950;color:#fff;border-color:transparent}.pz-txt button.on small{color:#e8ffe9}" +
    ".pz-txk{font-size:12.5px;margin:0 0 6px}.pz-txk>span{display:block;color:var(--sub);margin-bottom:4px}.pz-txk>span small{font-size:12px}.pz-txk>div{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}" +
    ".pz-txk button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;padding:4px 2px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums}.pz-txk button small{display:block;font-weight:400;font-size:11.5px;color:var(--sub)}.pz-txk button.on{background:#e9c46a;color:#111;border-color:transparent}.pz-txk button.on small{color:#4a3d10}" +
    ".pz-txo{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;margin:6px 0}.pz-txo input{font:inherit;font-size:16px;width:96px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--text);color-scheme:light dark}.pz-txo small{width:100%;font-size:12px;color:var(--sub)}" +
    ".pz-txp{font-size:12.5px;color:var(--sub);margin:8px 0 4px}" +
    ".pz-txu{display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;gap:4px;background:var(--panel);border-radius:10px;padding:7px 6px;text-align:center;margin:0 0 8px}.pz-txu>div{min-width:0}.pz-txu small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all;line-height:1.3}.pz-txu b{font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.pz-txu .op{color:var(--sub);font-weight:700}" +
    ".pz-txg{display:grid;grid-template-columns:1fr 1fr;gap:6px}.pz-txc{background:var(--panel);border-radius:11px;padding:9px 8px;border:1.5px solid transparent;min-width:0}.pz-txc.win{border-color:#e9c46a}" +
    ".pz-txn{font-size:13.5px;font-weight:800;word-break:keep-all}.pz-txn small{display:block;font-weight:400;font-size:11.5px;color:var(--sub);margin-top:1px}.pz-txw{display:inline-block;font-size:11px;font-weight:700;background:#e9c46a;color:#111;border-radius:999px;padding:0 6px;vertical-align:1px}" +
    ".pz-txv{margin:7px 0 2px}.pz-txv small{display:block;font-size:11.5px;color:var(--sub)}.pz-txv b{font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".pz-txr{display:flex;align-items:baseline;gap:5px;flex-wrap:wrap;font-size:12px;color:var(--sub)}.pz-txr b{font-size:18px;font-variant-numeric:tabular-nums}.pz-txr em{font-style:normal}" +
    ".pz-txb{position:relative;display:flex;height:9px;border-radius:5px;overflow:hidden;background:color-mix(in srgb,var(--line) 60%,transparent);margin:7px 0 5px}.pz-txb i{display:block;height:100%}.pz-txb i.n,.pz-txkey i.n{background:#e9c46a}.pz-txb i.t,.pz-txkey i.t{background:#ff6b6b}.pz-txb i.f,.pz-txkey i.f{background:#8a94a8}" +
    ".pz-txb em{position:absolute;top:-1px;bottom:-1px;width:2px;background:var(--text);opacity:.7}.pz-txkey i.e{background:var(--text);width:2px!important;opacity:.7}" +
    ".pz-txl{display:flex;justify-content:space-between;gap:4px;font-size:12px;color:var(--sub);padding:2px 0;border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.pz-txl small{font-size:11px}.pz-txl b{font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--text)}.pz-txl b.up{color:var(--up)}.pz-txl b.dn{color:var(--down)}.pz-txl.tot{font-weight:700}" +
    ".pz-txkey{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;color:var(--sub);margin:6px 0 2px}.pz-txkey i{display:inline-block;width:12px;height:8px;border-radius:2px;margin-right:4px;vertical-align:middle}" +
    ".pz-txwin{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#e9c46a 16%,var(--panel));font-size:13.5px;word-break:keep-all}.pz-txwin small{display:block;font-size:12px;color:var(--sub)}" +
    ".pz-txx{margin:6px 0 0;padding:7px 9px;border-radius:9px;background:color-mix(in srgb,#ff6b6b 10%,var(--panel));font-size:12.5px;word-break:keep-all}.pz-txx.ok{background:color-mix(in srgb,#3fb950 10%,var(--panel))}.pz-txnote{margin:8px 0 0;font-size:12px;word-break:keep-all}" +
    "@media (max-width:370px){.pz-txg{grid-template-columns:1fr}.pz-txk>div{grid-template-columns:repeat(2,1fr)}}" +
    ".pz-bd .pz-sc button.on{background:#1f9e8f}.pz-bd .pz-sc button.on small{color:#dff7f3}.pz-bd .pz-sc button small{display:block;margin:1px 0 0;font-size:11.5px}.pz-bd summary .mut{font-size:12.5px}" +
    ".pz-go{display:block;width:100%;text-align:left;margin:8px 0 0;border:1px dashed #e9c46a;background:color-mix(in srgb,#e9c46a 10%,var(--panel));color:var(--text);border-radius:10px;padding:9px 11px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}.pz-go small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}" +
    ".pz-sxq{position:relative;margin:4px 0 6px}.pz-sxq input{width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text)}" +
    ".pz-sxres{display:flex;flex-direction:column;gap:4px;margin-top:4px}.pz-sxres button{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px;text-align:left;font:inherit;font-size:14px;padding:8px 10px;border-radius:9px;border:1px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer}" +
    ".pz-sxres button small{flex-basis:100%;font-size:12px;color:var(--sub)}.pz-sxres button[disabled]{opacity:.5}.pz-sxh2{font-size:13px;color:var(--sub);padding:4px 2px}" +
    ".pz-sxqk{margin:0 0 6px}.pz-sxr{margin:6px 0;padding:8px 10px 6px;border-radius:10px;background:color-mix(in srgb,var(--text) 4%,var(--panel))}.pz-sxr.wait{opacity:.85}" +
    ".pz-sxh{display:flex;align-items:center;gap:8px}.pz-sxh>i{flex:none;width:10px;height:10px;border-radius:3px}.pz-sxh>span{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.2}.pz-sxh>span b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".pz-sxh>span .tk{font-style:normal;font-size:11.5px;color:var(--sub)}.pz-sxv{flex:none;font-size:15px}.pz-sxx{flex:none;border:0;background:none;color:var(--sub);font-size:16px;padding:4px 6px;cursor:pointer}" +
    ".pz-sxr input[type=range]{width:100%;margin:4px 0 0}.pz-sxr small{display:block;font-size:12px;color:var(--sub);word-break:keep-all}.pz-sxwait{color:#c99a1a!important}.pz-sxbad{color:#d9534f!important}" +
    ".pz-sxbad button{border:1px solid currentColor;background:none;color:inherit;border-radius:7px;font:inherit;font-size:11.5px;padding:1px 7px;margin-left:4px;cursor:pointer}";
  document.head.appendChild(css);
})();
;
