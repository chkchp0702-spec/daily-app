/* CH Investing — 보기 단순하게 (10/6)
   탭마다 핵심 카드만 바로 보여주고, 나머지 카드는 맨 아래 「📂 더 보기」에 제목 한 줄씩 모은다.
   한 줄을 누르면 그 카드가 아래에서 올라오는 화면(#sheet)으로 열린다. ← 뒤로 / ✕ 로 닫으면 제자리로 돌아간다.
   종목 카드의 이름을 누르면 종목리포트로 간다. */
(function(){
  // 탭별로 바로 보여줄 카드 (제목에 이 말이 들어가면). 제목 없는 카드(킥·미국장 등)는 항상 보임.
  var KEEP = {
    market: /오늘 할 일|경우의 수|자산 배분|오늘의 판단/,
    whale:  /TOP 10|오늘의 신호|함께 든 종목/,
    cup:    /오늘 컵 지도|나라별|많이 나온 섹터|돌파 임박/,
    gap:    /오늘 갭 지도|나라별|많이 나온 섹터/,
    sector: /국면 신호판|장중 나침반|5개 시장 한눈에|대표 지수|섹터 등락/,
    accum:  /매집 강도 순위|박스 돌파|매집 점수 순위/,
    danta:  /전광판|날짜별 성적/,
    alarm:  /내 알림|처음 한 번만|알림 기록/
  };
  var T = null, OPEN = null;

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
      if (c.dataset.xc || c.classList.contains("ixc-card") || c.classList.contains("xs-hid") || c.closest("#sheet") || c.id === "xs-more" || c.parentElement.closest(".card")) return;
      if (c.offsetHeight < 900) return;
      c.dataset.xc = "1"; c.classList.add("xs-clamp");
      var b = document.createElement("button"); b.className = "xs-cl"; b.textContent = "전체 보기 ▾";
      b.onclick = function(){ var o = c.classList.toggle("xs-clamp"); b.textContent = o ? "전체 보기 ▾" : "접기 ▴"; if (o) c.scrollIntoView({block: "start", behavior: "smooth"}); };
      c.appendChild(b);
    });
  }

  function watch(){
    var main = document.getElementById("main"); if (!main) return setTimeout(watch, 200);
    new MutationObserver(function(){ if (!T) T = setTimeout(function(){ scan(); slimCards(); setTimeout(clampLong, 400); }, 120); }).observe(main, {childList: true, subtree: true});
  }
  watch();
})();
