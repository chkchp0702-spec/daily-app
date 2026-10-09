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
    sector: /국면 신호판|장중 나침반|5개 시장 한눈에|대표 지수|섹터 등락/,
    accum:  /매집 강도 순위|박스 돌파|매집 점수 순위/,
    danta:  /전광판|날짜별 성적/,
    alarm:  /내 알림|처음 한 번만|알림 기록/
  };
  var T = null, OPEN = null;
  // 🧭 나침반: 상위(묶음) → 하위(카드). 묶음마다 대표 카드 하나만 펼쳐 두고, 나머지는 묶음 머리의 칩으로 (누르면 아래에서 열림)
  var GROUPS = [
    {k: "reg",  ic: "🧭", t: "지금 시장은 어느 국면?", s: "큰 그림 · 경기·타이밍·공포탐욕",
     main: /국면 신호판/, sub: /국면 전환 예보|국면 기록|공포·탐욕 지수|제일 강할까/},
    {k: "live", ic: "⚡", t: "오늘 장 흐름", s: "5개 시장 실시간 · 서로 어떻게 따라가나",
     main: /장중 나침반/, sub: /5개 시장 한눈에|세계 시장 하루 흐름|누가 누구를 따라가나|미국 → 한국 연결고리/},
    {k: "ix",   ic: "📈", t: "지수 · 시장 폭", s: "대표 지수 · 오른 종목 vs 내린 종목 · 신고가",
     main: /대표 지수/, sub: /오늘 오른 종목 · 내린 종목|상승 − 하락 종목 수 흐름|신고가 vs 신저가|52주 신고가/},
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
    if (dd){ drawer(body); var n = dd.querySelectorAll(".xs-row").length; dd.querySelector("#xs-n").textContent = n + "개 · 누르면 열려요"; }
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
      else if (c.dataset.xs !== "keep" || !m) by[k].subs.push({c: c, t: ti.t, sub: ti.sub});
    });
    var n = 0;
    GROUPS.forEach(function(g){
      var o = by[g.k]; if (!o) return;
      n++;
      if (o.main){ o.main.dataset.xs = "keep"; o.main.classList.remove("xs-hid"); }
      o.subs.forEach(function(x){ x.c.dataset.xs = "hide"; x.c.classList.add("xs-hid"); });
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
      var dd = document.getElementById("xs-more"); dd.querySelector("#xs-n").textContent = dd.querySelectorAll(".xs-row").length + "개 · 누르면 열려요";
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
    accum: ["🤫 조용한 매집을 찾는 화면", [
      "<b>무엇을</b> — <b>가격은 거의 제자리</b>인데 최근 한 달 <b>거래량이 그 전 석 달의 3배</b> 이상으로 꾸준히 늘어난 종목. 누군가 티 안 나게 사 모으는 흔적(와이코프 '흡수')이에요.",
      "<b>어떻게 고르나</b> — 한 달 가격 변화 −5%~+3% · 거래량 2배 넘는 날이 10일 이상(하루이틀 터진 것 제외) · 52주 고점 −40% 안. 위꼬리·하락일 거래량이 많으면 「분배 의심」으로 따로 표시.",
      "<b>쓰는 법</b> — 매집 점수가 높고 <b>박스 위쪽</b>에 붙어 있으면 돌파 직전 후보. 박스를 뚫는 날(📦 박스 돌파)이 실제 매수 신호예요.",
      "<b>보는 법</b> — 점수 순위 막대·카드 이름을 누르면 종목리포트. 외국인·기관 순매수가 같이 늘면 더 믿을 만해요."]]
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
    var h = HELP[cur]; if (!h) return;
    var body = document.getElementById("body"); if (!body || body.querySelector(":scope > .xp-card")) return;
    var d = document.createElement("details"); d.className = "card xp-card"; d.dataset.xs = "keep";
    d.innerHTML = '<summary><span>❓ 이 화면은 무엇을 찾나요?</span><small>' + h[0] + ' · 눌러서 보기</small></summary>' + h[1].map(function(x){ return '<p>' + x + '</p>'; }).join("");
    body.insertBefore(d, body.firstChild);
  }

  function openCard(c, t){
    if (window.closeSheet && document.getElementById("sheet")) closeSheet();
    var ph = document.createComment("xs"); c.parentNode.insertBefore(ph, c);
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button class="sh-x" onclick="goBack()">✕</button><b></b></div><div class="sh-body"></div>';
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
      if (c.dataset.xc || c.classList.contains("ixc-card") || c.classList.contains("mk-focus") || c.closest("#pobody") || c.classList.contains("br") || c.classList.contains("pu-main") || c.classList.contains("pu-list") || c.classList.contains("xs-hid") || c.closest("#sheet") || c.id === "xs-more" || c.parentElement.closest(".card")) return;
      if (c.offsetHeight < 900) return;
      c.dataset.xc = "1"; c.classList.add("xs-clamp");
      var b = document.createElement("button"); b.className = "xs-cl"; b.textContent = "전체 보기 ▾";
      b.onclick = function(){ var o = c.classList.toggle("xs-clamp"); b.textContent = o ? "전체 보기 ▾" : "접기 ▴"; if (o) c.scrollIntoView({block: "start", behavior: "smooth"}); };
      c.appendChild(b);
    });
  }

  function watch(){
    var main = document.getElementById("main"); if (!main) return setTimeout(watch, 200);
    new MutationObserver(function(){ if (!T) T = setTimeout(function(){ addHelp(); scan(); slimCards(); setTimeout(clampLong, 400); }, 120); }).observe(main, {childList: true, subtree: true});
  }
  watch();
})();
