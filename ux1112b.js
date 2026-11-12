/* CH Investing — 🧊 11/12 냉정 분석 4차 「왜 계속 복잡한가」 → 사용자 「네 의견대로 다 진행해」
   진단: ① 숨기기·옮기기만 7번, 지운 것 0 ② 숨기면 「뭐가 있는지 모름」, 꺼내면 「복잡」 ③ 쉬운 화면/전체 메뉴 = 지도 두 장 ④ 연구실·PB 도구·고객용이 한 앱
   처방(이 파일 ux1112b.js — ux1112.js 는 🧭 계절 시계 + nav2.js GROUPS + ux1105c.js EZ()):
     A. 화면 하나 — 쉬운/전체 두 모드 없음
     B. 아래 탭 = 할 일 5칸: 오늘 · 보내기 · 제안서 · 상품 · 종목
     C. 🔬 연구실(#lab) — 포트·성적표·확률·신호·운세를 지우지 않고 한곳에
     D. 첫 화면 「할 수 있는 일」 지도 — 타일마다 무엇을 해 주는지 한 문장 + 오늘 살아 있는 숫자
     F. 디자인: 카드 한 종류 · 강조색 하나 · 위 작은 탭 알약 모양
   되돌리기: GitHub 브랜치 backup-before-job5-1112 */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function gj(u){ if (!window.getJSON) return Promise.resolve(null); return getJSON(u + "?" + Math.floor(Date.now() / 300000), {ttl: 300000}).catch(function(){ return null; }); }
  function hm(s){ var m = /(\d\d):(\d\d)/.exec(String(s || "")); return m ? m[1] + ":" + m[2] : ""; }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  var S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  function sv(p){ return '<svg class="ds-ic jm-ic" viewBox="0 0 24 24" ' + S + ' aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    market: sv('<path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>'),
    send:   sv('<path d="M21 3 10.5 13.5"/><path d="M21 3l-6.5 18-4-7.5L3 9.5z"/>'),
    prop:   sv('<path d="M14 3.5H6.5A2.5 2.5 0 0 0 4 6v12a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18V9.5z"/><path d="M14 3.5v6h6"/><path d="m8.5 15.5 2.2-2.2 1.8 1.8 3-3"/>'),
    prod:   sv('<rect x="3.5" y="7" width="17" height="13" rx="2.5"/><path d="M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7"/>'),
    stock:  sv('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    lab:    sv('<path d="M9.5 3.5h5"/><path d="M10.5 3.5v6L5 18.5a1.5 1.5 0 0 0 1.3 2.2h11.4a1.5 1.5 0 0 0 1.3-2.2l-5.5-9v-6"/><path d="M8 15h8"/>')
  };

  /* ───────── D. 첫 화면 「할 수 있는 일」 지도 ───────── */
  var JOBS = [
    ["market",   "market", "시황 리포트",     "오늘 어디로 돈이 몰리는지"],
    ["send",     "send",   "고객에게 보내기", "시장 한 장 · 고객 질문 답"],
    ["prop",     "prop",   "제안서 만들기",   "이름·금액만 넣으면 PDF·PPT"],
    ["bond",     "prod",   "상품 찾기",       "채권 · 펀드 · ELS · 배당"],
    ["onepager", "stock",  "종목 보기",       "검색 · 리포트 · 수급"],
    ["lab",      "lab",    "연구실",          "포트 · 신호 · 성적표 · 운세"]
  ];
  var LIVE = {}, LT = 0;
  function liveNow(){
    try { var it = ((window.M && M.cats && M.cats.market) || [])[0]; if (it && it.id) LIVE.market = md(it.id) + " 올라옴"; } catch(x) {}
    try { var n = 0, W = (window.store && store.wl) || {}; for (var k in W) n++; LIVE.onepager = n ? "내 종목 " + n + "개" : "2만 종목·ETF"; } catch(x) {}
    LIVE.lab = "깊이 보고 싶을 때";
  }
  function live(){
    if (Date.now() - LT < 120000) return; LT = Date.now();
    Promise.all([gj("archive/x/pbbrief.json"), gj("archive/x/proposal.json"), gj("archive/x/products.json"), gj(RM + "qa.json")]).then(function(r){
      var b = r[0], p = r[1], d = r[2], q = r[3];
      if (b && (b.one || b.talk)) LIVE.send = (hm(b.asof) || "오늘") + " 준비됨";
      if (p && p.forms) LIVE.prop = "기본폼 " + p.forms.length + "종";
      if (d){ var el = (d.els || []).length, kb = (d.krw || []).length; LIVE.bond = el ? "ELS " + el + "개 청약" : kb ? "채권 " + kb + "개" : ""; }
      QA = q || QA; paint(); hubPaint();
    });
  }
  function mapHtml(){
    return '<p class="jm-h">할 수 있는 일 <small>아래 탭과 같아요</small></p><div class="jm-g">' + JOBS.map(function(j){
      return '<button type="button" class="jm-t' + (j[0] === "lab" ? " jm-lab" : "") + '" data-jm="' + j[0] + '">' + IC[j[1]] + '<b>' + j[2] + '</b><small>' + j[3] + '</small><em>' + e(LIVE[j[0]] || "") + '</em></button>'; }).join("") + '</div>';
  }
  function paint(){ var m = document.getElementById("jobmap"); if (!m) return; var h = mapHtml(); if (m._h !== h){ m.innerHTML = h; m._h = h; } }
  function map(){
    var m = document.getElementById("jobmap");
    if (cur() !== "home"){ return; }
    var hero = document.getElementById("ezhero"); if (!hero) return;
    if (!m){ m = document.createElement("section"); m.id = "jobmap"; m.setAttribute("data-noemo", "1"); m.setAttribute("data-cz", "done"); }
    if (hero.nextElementSibling !== m) hero.insertAdjacentElement("afterend", m);
    live(); liveNow(); paint();
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-jm]"); if (!t) return; ev.stopPropagation();
    if (typeof window.go === "function"){ go(t.dataset.jm); window.scrollTo(0, 0); }
  });

  /* ───────── B·C. 📨 보내기 · 🔬 연구실 화면 ───────── */
  var QA = null;
  var LABS = [
    ["💼 내 포트", [["port", "💼", "포트", "지금 뭘 얼마나 담나"], ["score", "📊", "성적표", "맞았나 틀렸나"], ["prob", "🎲", "오를 확률", "5개 시장 · 매일 채점"]]],
    ["🎯 신호", [["whale", "🐋", "큰손", "기관·유명 투자자 보유 변화"], ["cup", "☕", "컵 차트", "돌파 후보"], ["gap", "📈", "갭 상승", "갭 돌파 후보"], ["screen", "🔎", "종목 찾기", "매일 아침 거름망"], ["sigmore", "🗂", "더 보기", "예측 채점 · 상세"]]],
    ["🧪 연구", [["@bubble", "🕰", "버블 시계 · 하락장 계기판", "오늘 탭 「자세히 보기」 안"], ["@season", "🧭", "계절 시계", "5개국 지수 흐름 · 3개월 뒤 확률"], ["@sigprob", "🎯", "신호 확률판", "경고·바닥 신호가 켜지면 실제로 몇 %"], ["@bt40", "📏", "40주선 백테스트", "지수·대표 주식"]]],
    ["🔮 재미", [["luck", "🔮", "오늘의 운세", "생일만 넣으면"], ["saju", "📜", "사주 리포트", "PDF 저장"], ["tarot", "🃏", "타로", "질문 → 카드"], ["lotto", "🎱", "로또", "번호 분석"]]],
    ["⚙️ 앱", [["@wlbtn", "★", "관심종목", "담아 둔 종목"], ["@uibtn", "⚙️", "보기 설정", "글자 크기 · 화면 색"], ["alarm", "🔔", "알림", "켜고 끄기"], ["idea", "💬", "의견함", "바라는 점 남기기"], ["@help", "🙋", "뭐 보면 돼요?", "궁금한 것 → 그 화면으로"]]]
  ];
  window.hubView = function(key){
    if (key === "lab") return '<div id="hub" class="hub hub-lab" data-noemo="1">' + LABS.map(function(g){
      return '<section class="card hub-c" data-cz="done"><p class="hub-h">' + g[0] + '</p><div class="hub-l">' + g[1].map(function(x){
        return '<button type="button" data-hub="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small><i>›</i></button>'; }).join("") + '</div></section>'; }).join("") +
      '<p class="hub-n">깊이 보는 화면을 한곳에 모았어요 · 지운 것은 없어요</p></div>';
    return '<div id="hub" class="hub hub-send" data-noemo="1">' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">오늘 한 장</p><p class="hub-p" id="hubone">오늘 시장을 그림 한 장으로 — 받는 분 이름을 넣으면 그 고객만을 위한 한 장이 돼요.</p>' +
        '<button type="button" class="hub-cta" data-hub="@one">📨 오늘 한 장 만들어 보내기</button></section>' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">고객이 이렇게 물으면 <small id="hubqn"></small></p><div class="hub-q" id="hubq"><p class="hub-p">불러오는 중…</p></div>' +
        '<button type="button" class="hub-sub" data-hub="@qa">질문 전부 보기 ›</button></section>' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">다른 것도 한 장으로</p><div class="hub-l">' +
        [["bond", "🏦", "채권 전망 한 장", "국고채 · 미국채 · 브라질국채"], ["prop", "📝", "제안서", "성향 → 상품 → 금액 → PDF·PPT"], ["onepager", "🔍", "종목 한 장", "종목을 찾아 위 📨 누르기"]].map(function(x){
          return '<button type="button" data-hub="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small><i>›</i></button>'; }).join("") + '</div>' +
        '<p class="hub-n">어느 화면에서든 맨 위 📨 를 누르면 그 화면이 한 장이 돼요</p></section></div>';
  };
  function hubPaint(){
    if (cur() !== "send") return;
    var q = document.getElementById("hubq"), n = document.getElementById("hubqn");
    if (q && QA && QA.items && QA.items.length){
      q.innerHTML = QA.items.slice(0, 5).map(function(x){ return '<button type="button" data-hub="@qa"><b>' + e(x.q) + '</b><small>' + e(x.a) + '</small></button>'; }).join("");
      if (n) n.textContent = md(QA.date) + " " + (QA.edition || "") + " · " + QA.items.length + "개";
    } else if (q && QA === 0) q.innerHTML = '<p class="hub-p">오늘 답이 아직 안 올라왔어요</p>';
  }
  window.hubInit = function(key){
    if (key !== "send") return;
    hubPaint();
    gj(RM + "qa.json").then(function(q){ QA = q || QA || 0; hubPaint(); });
    gj("archive/x/pbbrief.json").then(function(b){ var o = document.getElementById("hubone"); if (o && b && b.one) o.innerHTML = '<b>' + e(String(b.one).split("｜")[0].trim()) + '</b><br><small>' + e(b.label || "") + ' 기준 · 받는 분 이름을 넣으면 그 고객만을 위한 한 장이 돼요</small>'; });
  };
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#hub [data-hub]"); if (!t) return; ev.stopPropagation();
    var k = t.dataset.hub;
    if (k === "@one"){ if (window.__onepage) (__onepage.chooser || __onepage.go)(null); return; }
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }
    if (k === "@wlbtn" || k === "@uibtn"){ var o = document.getElementById(k.slice(1)); if (o) o.click(); return; }
    if (k === "@help"){ if (window.__ezHelp) __ezHelp(); return; }
    if (k === "@bt40"){ location.href = "bt40.html"; return; }
    if (k === "@bubble" || k === "@season" || k === "@sigprob"){ var tid = k === "@season" ? "season" : k === "@sigprob" ? "sigprob" : "bubble"; if (typeof window.go === "function") go("home");
      var n = 0; (function seek(){ var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open");
        if (hb && !hb.classList.contains("ez-open") && op) op.click();
        var x = document.getElementById(tid); if (x){ x.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++n < 30) setTimeout(seek, 300); })(); return; }
    if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); }
  });

  /* ───────── 아래 탭 아이콘(보내기·종목) — design.js 는 이름으로 찾는데 새 이름이 없어서 ───────── */
  function icons(){
    var b = document.getElementById("bnav"); if (!b) return;
    [].forEach.call(b.querySelectorAll("button[data-g]"), function(x){ var i = x.querySelector(".i"), g = x.dataset.g;
      if (i && (g === "send" || g === "stock") && !i.querySelector("svg")) i.innerHTML = IC[g].replace(" jm-ic", ""); });
  }

  /* ───────── F. 디자인 ───────── */
  var st = document.createElement("style");
  st.textContent =
    /* 지도 */
    "#jobmap{margin:0 0 12px}.jm-h{margin:6px 4px 8px;font-size:15px;font-weight:800}.jm-h small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".jm-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".jm-t{font:inherit;text-align:left;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:13px 14px 12px;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-height:112px;min-width:0}" +
    ".jm-t:active{transform:scale(.98)}.jm-t .jm-ic{width:24px;height:24px;color:#3182f6;margin-bottom:6px}" +
    ".jm-t b{font-size:16px;font-weight:800;letter-spacing:-.3px}.jm-t small{font-size:13px;color:var(--sub);line-height:1.35;word-break:keep-all}" +
    ".jm-t em{font-style:normal;font-size:12.5px;font-weight:700;color:#3182f6;margin-top:auto;padding-top:6px;min-height:22px;word-break:keep-all}" +
    ".jm-t.jm-lab{background:transparent;border-style:dashed}.jm-t.jm-lab .jm-ic,.jm-t.jm-lab em{color:var(--sub)}" +
    /* 허브 */
    ".hub .hub-c{padding:16px 16px 14px}.hub .hub-c>.hub-h{margin:0 0 10px;font-size:16px;font-weight:800;display:flex;align-items:baseline;gap:8px}.hub .hub-c>.hub-h small{font-size:12.5px;font-weight:500;color:var(--sub)}" +
    ".hub-p{margin:0 0 12px;font-size:15px;line-height:1.5;word-break:keep-all}.hub-p small{color:var(--sub);font-size:13px}" +
    ".hub-cta{display:block;width:100%;font:inherit;font-size:17px;font-weight:800;padding:14px 12px;border:0;border-radius:14px;background:#3182f6;color:#fff;cursor:pointer}.hub-cta:active{transform:scale(.98)}" +
    ".hub-sub{display:block;width:100%;font:inherit;font-size:14.5px;font-weight:700;padding:11px;margin-top:8px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);cursor:pointer}" +
    ".hub-q button{display:block;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:11px 2px;cursor:pointer}.hub-q button:first-child{border-top:0;padding-top:2px}" +
    ".hub-q b{display:block;font-size:15.5px;font-weight:700}.hub-q small{display:block;font-size:13px;color:var(--sub);line-height:1.4;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".hub-l button{display:grid;grid-template-columns:30px 1fr 14px;column-gap:8px;align-items:center;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:11px 2px;cursor:pointer}.hub-l button:first-child{border-top:0}" +
    ".hub-l span{grid-row:1/3;font-size:21px;text-align:center}.hub-l b{font-size:15.5px;font-weight:700}.hub-l small{grid-column:2;font-size:13px;color:var(--sub)}.hub-l i{grid-row:1/3;grid-column:3;font-style:normal;color:var(--sub);font-size:18px}" +
    ".hub-n{margin:10px 2px 0;font-size:12.5px;color:var(--sub);text-align:center}" +
    "html[data-tab=send] #main>.hero,html[data-tab=lab] #main>.hero{display:none!important}" +
    /* 위 작은 탭 — 알약 하나로 통일(탭마다 다른 색 대신 글자색 하나) */
    ".tabs.sub .tab-lab{color:var(--sub)!important;font-weight:600!important}" +
    /* ⚙ 설정은 머리줄에 다시(11/09 에 🙋 안으로 넣었는데 🙋 가 없어져서) */
    "html[data-ez=easy] body header #uibtn{display:inline-flex!important;align-items:center;justify-content:center}" +
    /* 아래 탭 5칸 — 고르게 */
    "#bnav{display:flex}#bnav>button{flex:1 1 0;min-width:0}";
  document.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; try { map(); } catch(x) { console.warn("jobmap", x); } try { icons(); } catch(x) {}
    try { document.documentElement.setAttribute("data-tab", cur()); } catch(x) {} }
  function soon(){ if (!q) q = setTimeout(tick, 150); }
  function start(){ tick(); try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {} setInterval(tick, 3000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
