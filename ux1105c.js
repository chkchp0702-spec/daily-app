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
  function EZ(){ try { return localStorage.getItem(K) !== "pro"; } catch(x) { return true; } }
  function setMode(m){ try { localStorage.setItem(K, m); } catch(x) {} apply(); if (typeof window.go === "function" && window.cur) go(m === "easy" && !inEasy(window.cur) ? "home" : window.cur); }
  window.ezMode = function(m){ if (m) setMode(m === "pro" ? "pro" : "easy"); return EZ() ? "easy" : "pro"; };
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function num(s){ return s == null ? null : +String(s).replace("−", "-"); }
  function sg(v){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(1); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  var EASY_TABS = {home: 1, port: 1, score: 1, prop: 1, luck: 1, saju: 1, tarot: 1, lotto: 1};
  function inEasy(k){ return !!EASY_TABS[k]; }

  /* ── ④ calm.js 가 쉬운 화면에서 더 접을 탭 ── */
  window.__ezFold = function(tab){ return EZ() && /^(whale|cup|gap|screen|sigmore|bond|fund|els|feed)$/.test(tab || ""); };

  /* ── ② ③ 아래 탭 바 ── */
  var QN = {home: "오늘 어때?", inv: "뭐 살까?", prop: "고객 제안"};
  function bar(){
    var b = document.getElementById("bnav"); if (!b) return;
    var all = document.getElementById("ezall");
    if (!EZ()){ if (all) all.remove(); [].forEach.call(b.querySelectorAll("button[data-g]"), function(x){ if (x.dataset.ezo){ x.children[1].textContent = x.dataset.ezo; delete x.dataset.ezo; } }); return; }
    [].forEach.call(b.querySelectorAll("button[data-g]"), function(x){ var q = QN[x.dataset.g], s = x.children[1]; if (!q || !s) return;
      if (s.textContent !== q){ if (!x.dataset.ezo) x.dataset.ezo = s.textContent; s.textContent = q; } });
    if (!all){ all = document.createElement("button"); all.id = "ezall"; all.type = "button";
      all.innerHTML = '<span class="i">☰</span><span>전체 메뉴</span>'; all.onclick = function(){ setMode("pro"); toast("전체 메뉴로 바꿨어요 · 오늘 탭 맨 위 🔰 로 다시 쉬운 화면"); };
      b.appendChild(all); }
  }

  /* ── ① ⑦ ⑨ ⑬ 첫 화면 한 장 ── */
  var B = null, BT = 0;
  function brief(){
    if (B && Date.now() - BT < 300000) return Promise.resolve(B);
    var p = window.__pbbrief ? window.__pbbrief() : (window.getJSON ? getJSON("archive/x/pbbrief.json?" + Math.floor(Date.now() / 300000), {ttl: 300000}) : Promise.resolve(null));
    return Promise.resolve(p).then(function(d){ if (d){ B = d; BT = Date.now(); } return d; }).catch(function(){ return B; });
  }
  function read(b){
    var t = (b.talk || []).join(" · "), plan = ((b.advice && b.advice.plan) || []).join(" "), m;
    var o = {};
    if ((m = /코스피 ([\d,]+(?:\.\d+)?)\(([+−\-]?\d+(?:\.\d+)?)%\)/.exec(t))) { o.kv = m[1]; o.k = num(m[2]); }
    else if ((m = /코스피 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) o.k = num(m[1]);
    if ((m = /코스닥 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) o.q = num(m[1]);
    if ((m = /S&P500 선물 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) { o.s = num(m[1]); o.sl = "S&P500 선물"; }
    else if ((m = /S&P500 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) { o.s = num(m[1]); o.sl = "S&P500"; }
    o.up = /200일 평균 위|200일선 위/.test(plan) ? true : /200일 평균 아래|200일선 아래/.test(plan) ? false : null;
    var big = o.k != null ? o.k : o.s;
    if (o.up === false) o.L = ["r", "🔴", "조심하는 장", "큰 흐름이 아래로 꺾여 있어요"];
    else if ((o.k != null && o.k <= -2) || (o.s != null && o.s <= -1.5)) o.L = ["y", "🟡", "흔들리는 날", o.up ? "큰 흐름은 아직 위예요" : "오늘은 크게 출렁여요"];
    else if (big != null && big >= 0.5) o.L = ["g", "🟢", "좋은 날", o.up ? "큰 흐름도 위예요" : "오늘은 오르고 있어요"];
    else o.L = ["g", "🟢", "무난한 날", o.up ? "큰 흐름은 위예요" : "크게 움직이지 않아요"];
    var rd = String((b.advice && b.advice.read) || "").split(/(?:[.!?])\s+/).map(function(x){ return /[.!?]$/.test(x) ? x : x + "."; }).filter(function(x){ return x.trim(); });
    o.act = rd.length ? rd[rd.length - 1] : (((b.advice && b.advice.plan) || [])[1] || "");
    var md = String(b.mode || b.label || "");
    o.ph = /마감|장 끝|저녁/.test(md) ? 2 : /장중/.test(md) ? 1 : 0;
    return o;
  }
  function heroHtml(b){
    var o = read(b), N = [];
    if (o.k != null) N.push(["코스피", o.kv || "", o.k]);
    if (o.q != null) N.push(["코스닥", "", o.q]);
    if (o.s != null) N.push([o.sl, "", o.s]);
    var PH = [["☀️", "아침"], ["⚡", "장중"], ["🌙", "마감"]];
    return '<div class="ez-top"><span>🔄 ' + e(String(b.asof || b.at || "").slice(11, 16) || b.label || "") + ' 갱신</span><span class="ez-ph">' +
        PH.map(function(p, i){ return '<i class="' + (i === o.ph ? "on" : "") + '">' + p[0] + ' ' + p[1] + '</i>'; }).join("") + '</span></div>' +
      '<div class="ez-light ' + o.L[0] + '"><b>' + o.L[1] + '</b><div><small>오늘 장</small><strong>' + e(o.L[2]) + '</strong><em>' + e(o.L[3]) + '</em></div></div>' +
      (b.one ? '<p class="ez-one">' + e(b.one) + '</p>' : '') +
      (N.length ? '<div class="ez-nums">' + N.slice(0, 3).map(function(n){ return '<div><small>' + e(n[0]) + '</small><b class="' + cl(n[2]) + '">' + sg(n[2]) + '</b>' + (n[1] ? '<em>' + e(n[1]) + '</em>' : '') + '</div>'; }).join("") + '</div>' : '') +
      (o.act ? '<div class="ez-act"><small>그래서 오늘은</small><p>👉 ' + e(o.act) + '</p></div>' : '') +
      '<button type="button" class="ez-cta" data-pbsend="1">📨 고객에게 오늘 한 장 보내기</button>' +
      '<p class="ez-note">' + e(b.note || "참고용 · 사라·팔라는 뜻이 아니에요") + '</p>';
  }
  var HB = 0;
  function home(){
    var main = document.getElementById("main"), hb = document.getElementById("hmbody");
    var h = document.getElementById("ezhero"), more = document.getElementById("ezmore"), pl = document.getElementById("ezpro");
    if (cur() !== "home" || !main || !hb){ return; }
    if (!EZ()){
      if (h) h.remove(); if (more) more.remove(); hb.classList.remove("ez-open");
      if (!pl){ pl = document.createElement("button"); pl.id = "ezpro"; pl.type = "button"; pl.textContent = "🔰 쉬운 화면으로 보기"; pl.onclick = function(){ setMode("easy"); }; hb.parentNode.insertBefore(pl, hb); }
      return;
    }
    if (pl) pl.remove();
    if (!h){ h = document.createElement("section"); h.id = "ezhero"; h.className = "ez-hero"; h.setAttribute("data-noemo", "1"); h.innerHTML = '<div class="ez-load">오늘 시장을 한 장으로 모으는 중…</div>'; hb.parentNode.insertBefore(h, hb); HB = 0; }
    if (!more){
      more = document.createElement("div"); more.id = "ezmore";
      more.innerHTML = '<button type="button" class="ez-open">▾ 오늘 자세히 보기 <small>5개 시장 · 오늘의 발견 · 업종 지도 · 1탭 예측</small></button>' +
        '<div class="ez-drawer"><small>🎁 더보기</small><div>' + [["luck", "🔮", "운세"], ["saju", "📜", "사주"], ["tarot", "🃏", "타로"], ["lotto", "🎱", "로또"]].map(function(x){ return '<button type="button" data-ezgo="' + x[0] + '"><span>' + x[1] + '</span>' + x[2] + '</button>'; }).join("") + '</div></div>';
      h.insertAdjacentElement("afterend", more);
      more.querySelector(".ez-open").onclick = function(){ var o = hb.classList.toggle("ez-open"); this.innerHTML = o ? "▴ 접기" : '▾ 오늘 자세히 보기 <small>5개 시장 · 오늘의 발견 · 업종 지도 · 1탭 예측</small>'; if (o) setTimeout(function(){ hb.scrollIntoView({behavior: "smooth", block: "start"}); }, 60); };
    }
    if (Date.now() - HB > 60000){ HB = Date.now();
      brief().then(function(b){ var x = document.getElementById("ezhero"); if (!x) return; x.innerHTML = b && (b.one || b.talk) ? heroHtml(b) : '<div class="ez-load">아직 오늘 자료가 안 올라왔어요 · 아래 「오늘 자세히 보기」를 눌러 주세요</div>'; }); }
  }

  /* ── ⑥ 🙋 뭐 보면 돼요? ── */
  var ASK = [
    ["home", "🌤", "오늘 장 어때요?", "신호등 한 장"],
    ["sector", "🌏", "미국·중국·일본은요?", "5개 시장 한눈에"],
    ["port", "💼", "지금 뭘 얼마나 사요?", "포트 비중 그대로"],
    ["prop", "📝", "고객 제안서 만들기", "성향 → 상품 → 금액 → 끝"],
    ["@send", "📨", "고객에게 한 장 보내기", "카톡용 그림 한 장"],
    ["bond", "🏦", "채권·ELS 금리 보기", "상품 한곳에서"],
    ["prob", "🎲", "오늘 오를 확률은?", "한국장 기준"],
    ["luck", "🔮", "오늘의 운세", "운세·사주·타로"]
  ];
  function help(){
    var old = document.getElementById("ezsheet"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "ezsheet";
    d.innerHTML = '<div class="ezs-in"><div class="ezs-h"><img src="img/kid_think.jpg?v=1" alt=""><div><b>뭐 보면 돼요?</b><small>궁금한 걸 누르면 그 화면으로 데려가요</small></div><button type="button" class="ezs-x" aria-label="닫기">✕</button></div>' +
      '<div class="ezs-g">' + ASK.map(function(a){ return '<button type="button" data-ask="' + a[0] + '"><span>' + a[1] + '</span><b>' + e(a[2]) + '</b><small>' + e(a[3]) + '</small></button>'; }).join("") + '</div>' +
      '<button type="button" class="ezs-mode">' + (EZ() ? "☰ 전체 메뉴로 보기 (예전 화면 전부)" : "🔰 쉬운 화면으로 보기") + '</button></div>';
    document.body.appendChild(d);
    d.addEventListener("click", function(ev){
      var t = ev.target;
      if (t === d || (t.closest && t.closest(".ezs-x"))) { d.remove(); return; }
      if (t.closest && t.closest(".ezs-mode")) { d.remove(); setMode(EZ() ? "pro" : "easy"); return; }
      var a = t.closest && t.closest("[data-ask]"); if (!a) return; d.remove();
      var k = a.dataset.ask;
      if (k === "@send"){ if (window.__onepage) (__onepage.chooser || __onepage.go)(null); return; }
      if (typeof window.go === "function") go(k); window.scrollTo(0, 0);
    });
  }
  function askBtn(){   // 아래 탭 바 안 「🙋 뭐 보지?」 — 화면을 가리지 않게(떠 있는 단추 대신)
    var b = document.getElementById("ezask"), nav = document.getElementById("bnav"), all = document.getElementById("ezall");
    if (!EZ() || !nav){ if (b) b.remove(); return; }
    if (b && b.nextSibling === all) return;
    if (!b){ b = document.createElement("button"); b.id = "ezask"; b.type = "button"; b.innerHTML = '<span class="i">🙋</span><span>뭐 보지?</span>'; b.onclick = help; }
    nav.insertBefore(b, all || null);
  }

  /* ── ⑧ 제안서 4단계 ── */
  function wiz(){
    if (cur() !== "prop" || !EZ()) { var o = document.getElementById("ezwiz"); if (o && cur() !== "prop") o.remove(); if (o && !EZ()) o.remove(); return; }
    var w = document.getElementById("ppw"); if (!w || !w.querySelector(".pp-pf")) return;
    var S = [
      ["🧭", "성향", ".pp-pf", !!w.querySelector(".pp-pg button.on")],
      ["📦", "상품", ".pp-grid", !!w.querySelector(".pp-f.on")],
      ["💰", "이름·금액", "#ppcust", !!((document.getElementById("ppcust") || {}).value) && [].some.call(w.querySelectorAll("input[data-ak]"), function(i){ return +i.value > 0; })],
      ["📤", "만들기", "#ppshow", false]
    ];
    var at = 0; while (at < 3 && S[at][3]) at++;
    var MSG = ["고객 투자성향부터 골라 주세요", "보낼 상품을 골라 주세요 (여러 개 가능)", "고객 이름과 금액을 넣어 주세요", "📱 한 장 · PDF · PPT 중 하나만 누르면 끝!"];
    var key = S.map(function(s){ return s[3] ? 1 : 0; }).join("") + at;
    var z = document.getElementById("ezwiz");
    if (z && z.dataset.k === key && z.parentNode === w.parentNode) return;
    if (!z){ z = document.createElement("div"); z.id = "ezwiz"; }
    if (z.parentNode !== w.parentNode || z.nextSibling !== w) w.parentNode.insertBefore(z, w);
    z.dataset.k = key;
    z.innerHTML = '<div class="ezw-s">' + S.map(function(s, i){ return '<button type="button" data-st="' + i + '" class="' + (s[3] ? "ok" : i === at ? "on" : "") + '"><b>' + (s[3] ? "✓" : i + 1) + '</b><span>' + s[0] + ' ' + s[1] + '</span></button>'; }).join("") + '</div>' +
      '<p class="ezw-m"><b>' + (at + 1) + '단계</b> ' + e(MSG[at]) + '</p>';
    z.querySelectorAll("[data-st]").forEach(function(btn){ btn.onclick = function(){ var s = S[+btn.dataset.st], t = w.querySelector(s[2]) || document.querySelector(s[2]); if (!t) return;
      var c = t.closest(".card") || t; if (c.classList.contains("cz-on")) c.click();
      c.scrollIntoView({behavior: "smooth", block: "center"}); c.classList.remove("ezw-hl"); void c.offsetWidth; c.classList.add("ezw-hl"); }; });
  }

  /* ── ⑪ 첫 방문 3장 ── */
  var TOURON = false;
  function tour(){
    if (!EZ() || TOURON || ls("ez_tour") || navigator.webdriver || /[?&]embed=1/.test(location.search)) return;
    if (cur() !== "home" || !document.querySelector("#ezhero .ez-light") || document.getElementById("wowob") || document.getElementById("gdq") || document.getElementById("uxob")) return;
    if (!ls("wow_ob")) return;   // wow.js 첫 인사가 먼저
    TOURON = true; ls("ux_ob3", 1);   // ux1105 의 옛 3곳 안내(지금은 접혀 있는 칸을 가리킴)는 대신함
    var T = [
      ["#ezhero .ez-light", "1 / 3", "이것만 보면 돼요", "🟢 좋은 날 · 🟡 흔들리는 날 · 🔴 조심하는 장 — 오늘 장을 신호등 하나로 알려 줘요."],
      ["#ezhero .ez-cta", "2 / 3", "고객에게 바로 보내기", "누르면 오늘 시장을 그림 한 장으로 만들어 카톡으로 보낼 수 있어요."],
      ["#ezask", "3 / 3", "막히면 여기", "아래 🙋 뭐 보지? 를 누르면 「뭐 보면 돼요?」 8가지가 나와요. 예전 화면 전부는 아래 ☰ 전체 메뉴."]
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
  var NM = {home: "오늘", market: "시황", sector: "시장 흐름", prob: "오를 확률", port: "포트", score: "성적표", whale: "큰손", cup: "컵 차트", gap: "갭 상승", screen: "종목 찾기", sigmore: "신호 더 보기", bond: "채권", fund: "펀드", els: "ELS", prop: "제안서", luck: "운세", saju: "사주", tarot: "타로", lotto: "로또", feed: "피드", onepager: "종목리포트"};
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
    try { home(); } catch(x) { console.warn("ez home", x); }
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
    R + " #bnav button[data-g=mkt]," + R + " #bnav button[data-g=sig]," + R + " #bnav button[data-g=prod]{display:none!important}" +
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
    ".ez-note{margin:8px 0 0;font-size:12.5px!important;color:var(--dim,var(--sub));text-align:center}" +
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
})();
