/* 📦 app.b07.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 7/8 (design.js … ux1113.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
if(typeof __bs!=="function"){window.__bs=window.__bk=window.__be=function(){};}
__bs(7,67,["design.js", "wow.js", "ux1105.js", "ux1105b.js", "bond_outlook.js", "ux1105c.js", "ux1109.js", "ux1109b.js", "ux1110.js", "ux1110b.js", "ux1112.js", "ux1111.js", "ux1112b.js", "ux1112c.js", "ux1112d.js", "ux1112e.js", "ux1113.js"]);
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
__bk(67);
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
__bk(68);
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
__bk(69);
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
__bk(70);
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
__bk(71);
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
    /* 🛡 11/18 16시: 7개가 「다 와야」 그리던 것 → 하나씩 최대 8초만 기다리고 안 온 건 빼고 그림(한 파일이 늦어도 첫 화면 뼈대에서 안 멈춤) */
    var w8 = function(q){ return Promise.race([Promise.resolve(q).catch(function(){ return null; }), new Promise(function(r){ setTimeout(function(){ r(null); }, 8000); })]); };
    return Promise.all([w8(p), w8(gj5(RM + "bear.json")), w8(gj5(RM + "scores.json", 900000)), w8(gj5("archive/x/live_kr.json", 120000)), w8(gj5("archive/x/live_us_pre.json", 120000)), w8(gj5(RM + "home.json")), w8(gj5(RM + "bubble.json", 900000)), w8(gj5("archive/x/wl_live.json", 120000))])
      .then(function(r){ var d = r[0]; if (d){ d = Object.assign({}, d, {_bear: r[1], _sc: r[2], _kr: r[3], _fut: r[4], _home: r[5], _bub: r[6], _wl: r[7]}); B = d; BT = Date.now(); } return d || B; }).catch(function(){ return B; });
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
  /* 🇰🇷 11/19 사용자 「오늘에서 오늘 국장이 딱 안 보여 — 시황 한 장의 일부라도」 → 「네 뜻대로 진행」
     시황 한 장의 국장 부분을 첫 칸 맨 위 한 칸으로: 지수 2칸 + 하루 흐름 그림 · 오른/내린 종목 · 강한/약한 업종 · 돈 몰린 곳 · 크게 움직인 대형주(뉴스 제목) · 수급 한 줄
     예전 지수 칸(ez-nums)과 「오늘 한 줄씩」의 수급 줄은 이 칸으로 합침(새 화면 아님 — 12/1 동결 약속 지킴)
     숫자 시각: 장중 = 실시간 표(live_kr · 10분마다) 시각 · 15:30 뒤 = 마감 · 날짜가 오늘이 아니면 「○/○ 마감」으로 분명히 */
  function krNow(){ var d = new Date(Date.now() + 9 * 3600e3); return {td: d.toISOString().slice(0, 10), hm: d.toISOString().slice(11, 16), wd: d.getUTCDay()}; }
  function mdK(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function krSpark(SN){
    var a = SN.map(function(x){ return x[3]; }), q = SN.map(function(x){ return x[4]; }), all = a.concat(q, [0]).filter(function(v){ return v != null && !isNaN(v); });
    if (a.length < 3 || !all.length) return "";
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all); if (mx - mn < 0.4){ var c = (mx + mn) / 2; mn = c - 0.2; mx = c + 0.2; }
    var W = 300, H = 54, P = 4, X = function(i, n){ return (P + (W - 2 * P) * i / Math.max(1, n - 1)).toFixed(1); }, Y = function(v){ return (H - P - (v - mn) / (mx - mn) * (H - 2 * P)).toFixed(1); };
    var pl = function(v){ return v.map(function(p, i){ return (i ? "L" : "M") + X(i, v.length) + " " + Y(p == null ? 0 : p); }).join(""); };
    return '<svg class="kr19-sp" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="currentColor" stroke-dasharray="3 3" opacity=".3" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + pl(q) + '" fill="none" stroke="#9aa3b5" stroke-width="2" vector-effect="non-scaling-stroke"/><path d="' + pl(a) + '" fill="none" stroke="' + (a[a.length - 1] >= 0 ? "#f04452" : "#3182f6") + '" stroke-width="2.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' +
      '<div class="kr19-spl"><span>' + e(SN[0][0]) + '</span><span><i class="k"></i>코스피 <i class="q"></i>코스닥 · 하루 흐름</span><span>' + e(SN[SN.length - 1][0]) + '</span></div>';
  }
  function krNm(L){ return (L || []).slice().sort(function(x, y){ return Math.abs(y.r) - Math.abs(x.r); }).slice(0, 2).map(function(x){ return x.n; }).join("·"); }
  function krCard(b, o){
    var K = b._kr; if (!K || !K.index || !K.date) return "";
    var IX = {}; K.index.forEach(function(x){ IX[x.name] = x; }); var kp = IX["코스피"], kq = IX["코스닥"]; if (!kp || kp.chg == null) return "";
    var T = krNow(), isT = K.date === T.td, wkday = T.wd > 0 && T.wd < 6, closed = !isT || String(K.t || "") >= "15:30" || T.hm >= "15:40";
    var SN = isT ? (K.snaps || []) : [];
    var tag = isT ? (closed ? K.t + " 마감" : "장중 " + K.t) : mdK(K.date) + " 마감 · " + (wkday && T.hm < "09:00" ? "오늘 장 시작 전" : wkday && T.hm < "16:00" ? "오늘 자료 기다리는 중" : "지난 거래일");
    var early = isT && !closed && SN.length <= 2;
    var tile = function(n, x){ var v = n === "코스닥" ? (Math.round(x.last * 10) / 10).toLocaleString() : Math.round(x.last).toLocaleString(); return '<div class="kr19-t"><small>' + n + '</small><b class="' + cl(x.chg) + '">' + sg(x.chg) + '</b><em>' + v + '</em></div>'; };
    var up = K.up || 0, dn = K.down || 0, tot = up + dn + (K.flat || 0), upr = tot ? Math.round(up / tot * 100) : null;
    var R = [];
    var row = function(ic, lab, h, attr){ R.push('<' + (attr ? 'button type="button" ' + attr : 'div') + ' class="kr19-r"><span class="kr19-ic">' + ic + '</span><small>' + lab + '</small><p>' + h + '</p>' + (attr ? '<i>›</i>' : '') + '</' + (attr ? 'button' : 'div') + '>'); };
    var big = function(L){ return (L || []).filter(function(x){ return (x.n || 0) >= 8; }).slice(0, 2); };
    var st = big(K.strong), wk = big(K.weak);
    if (st.length) row("🔥", "강한 업종", st.map(function(x){ var l = krNm(x.lead); return e(x.name) + ' <b class="up">' + sg(x.r) + '</b>' + (l ? ' <span class="kr19-m">' + e(l) + '</span>' : ''); }).join(" · "), 'data-ezgo="sector"');
    if (wk.length) row("🧊", "약한 업종", wk.map(function(x){ return e(x.name) + ' <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "), 'data-ezgo="sector"');
    var V = (K.value || []).slice(0, 3);
    if (V.length) row("💰", "돈 몰린 종목(거래대금)", V.map(function(x){ return '<u data-op="' + e(x.s) + '">' + e(x.n) + '</u> <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "));
    var WY = ((b._wl && b._wl.why) || []).filter(function(w){ return w.day === K.date; }).sort(function(x, y){ return Math.abs(y.r) - Math.abs(x.r); })[0];
    if (WY){ var nw = (WY.news || [])[0]; row("⚡", "크게 움직인 대형주", '<u data-op="' + e(WY.s) + '">' + e(WY.n) + '</u> <b class="' + cl(WY.r) + '">' + sg(WY.r) + '</b>' + (nw ? ' — <span class="kr19-m">' + e(String(nw.t).slice(0, 46)) + '</span>' : '')); }
    var fut = o && o.sl === "S&P500 선물" && o.s != null ? '<span class="kr19-us">🇺🇸 S&P500 선물 <b class="' + cl(o.s) + '">' + sg(o.s) + '</b></span>' : '';
    return '<section class="kr19" id="kr19"><div class="kr19-h"><b>🇰🇷 오늘 국장</b><span>' + e(tag) + '</span></div>' +
      '<div class="kr19-ts">' + tile("코스피", kp) + (kq ? tile("코스닥", kq) : '') + '</div>' +
      (early ? '<p class="kr19-early">⏱ 개장 직후라 등락이 아직 작아요 · 흐름은 30분 뒤부터 보는 게 좋아요</p>' : krSpark(SN)) +
      (upr != null && tot > 100 ? '<div class="kr19-br"><div><i style="width:' + upr + '%"></i></div><span>오른 종목 <b class="up">' + up.toLocaleString() + '</b> · 내린 종목 <b class="dn">' + dn.toLocaleString() + '</b> <em>(' + upr + '%가 올랐어요)</em></span></div>' : '') +
      '<div class="kr19-rs">' + R.join("") + '<div data-flow class="kr19-fl"></div></div>' +
      '<div class="kr19-f">' + fut + '<button type="button" class="kr19-send" data-kr19send="1">📨 이 칸 고객에게</button></div></section>';
  }
  function heroHtml(b){
    var o = read(b), N = [];
    if (o.k != null) N.push(["코스피", o.kv || "", o.k]);
    if (o.q != null) N.push(["코스닥", o.qv || "", o.q]);
    if (o.s != null) N.push([o.sl, o.sv || "", o.s]);
    // 🗓 11/19 「오늘 장이 반영 안 됐다」 — 숫자는 실시간 표(live_kr · 10분마다)인데 꼬리표는 두뇌 시각(한 시간마다)이라 옛 값처럼 보였음 → 숫자 시각을 그대로
    var td_ = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), lt_ = b._kr && b._kr.date === td_ && b._kr.t ? b._kr.t : "";
    var KC = krCard(b, o); if (KC){ lt_ = ""; N = N.filter(function(n){ return n[0] !== "코스피" && n[0] !== "코스닥"; }); if (o.sl === "S&P500 선물") N = N.filter(function(n){ return n[0] !== o.sl; }); }   // 🇰🇷 11/19 국장 칸이 지수·시각을 맡음
    return KC + '<p class="ez-top">' + (lt_ ? '지수 ' + e(lt_) + ' 기준' : e(String(b.asof || b.at || "").slice(11, 16) || b.label || "") + ' 갱신') + ' · ' + PHN[o.ph] + (o.early ? ' · 09:30 전이라 전날 마감 기준' : '') + '</p>' +
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
    var KC_ = !!krCard(b, o);   // 🇰🇷 11/19 국장 칸이 있으면 수급 줄·「코스피 ○○ 마감」 뉴스 줄은 거기로
    if (b.one && !(KC_ && /^코스피 [\d,.]+\([+−\-]?[\d.]+%\)[^.]*\.?$/.test(String(b.one).split(" ｜ ").pop().trim()))) row("news", '<button type="button" class="ez-r ez-clamp" data-ezclamp="1"><small>오늘 뉴스</small>' + e(String(b.one).split(" ｜ ").pop()) + '</button>');
    if (!KC_) row("flow", '<div data-flow class="ez-flow"><span class="ez-r ez-ph">외국인·기관 수급 불러오는 중…</span></div>');
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
      /* 🛡 11/18 16시: 실패·그리기 오류·12초 넘김 모두 뼈대 대신 「다시 불러오기」 단추 (전엔 실패하면 회색 뼈대가 영영 남음) */
      var retry = '<div class="ez-load">⏳ 인터넷이 느려 오늘 자료를 아직 못 받았어요 <button type="button" class="btn" data-ezretry="1" style="margin-left:6px">다시 불러오기</button></div>';
      var guard = setTimeout(function(){ var x = document.getElementById("ezhero"); if (x && !x.classList.contains("ez-done") && x.querySelector(".ez-skel")){ x.innerHTML = retry; HB = 0; if (window.chErr) chErr("stuck", "첫 화면 큰 칸 12초", "ux1105c.js"); } }, 12000);
      brief().then(function(b){ clearTimeout(guard); var x = document.getElementById("ezhero"), y = document.getElementById("ezrows"); if (!x) return; var ok = b && (b.one || b.talk);
        try {
          x.innerHTML = ok ? heroHtml(b) : !b ? retry : '<div class="ez-load">아직 오늘 자료가 안 올라왔어요 · 아래 「오늘 자세히 보기」를 눌러 주세요</div>';   /* b 없음 = 못 받음 → 다시 불러오기 */
          if (!b) HB = 0;
          if (y) y.innerHTML = ok ? rowsHtml(b) : '';   /* 참고용 문구는 화면 맨 아래 공통 고지가 맡음 */
        } catch(er){ x.innerHTML = retry; HB = 0; if (window.chErr) chErr("render", (er && er.message) || er, "ux1105c.js", " · 첫 화면 큰 칸"); }
        x.classList.add("ez-done"); }, function(er){ clearTimeout(guard); var x = document.getElementById("ezhero"); if (x){ x.innerHTML = retry; HB = 0; } }); }
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
    var rt = ev.target.closest("[data-ezretry]"); if (rt){ ev.stopPropagation(); B = null; BT = 0; HB = 0; if (window.getJSONdrop) try { getJSONdrop(); } catch(z) {} var x = document.getElementById("ezhero"); if (x){ x.classList.remove("ez-done"); x.innerHTML = '<div class="ez-load ez-skel"><i></i><i></i><i></i></div>'; } home(); return; }
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
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-kr19send]"); if (!t) return; ev.stopPropagation();   // 🇰🇷 11/19 국장 칸 → 고객 한 장
    if (window.__onepage && __onepage.sendKr) __onepage.sendKr(); else if (window.toast) toast("한 장 기능을 불러오는 중이에요 — 잠시 뒤 다시 눌러 주세요"); });
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
    /* 🇰🇷 11/19 오늘 국장 칸 */
    ".kr19{background:var(--panel2,rgba(127,127,127,.07));border-radius:18px;padding:12px 12px 10px;margin:0 0 12px}" +
    ".kr19-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 2px 8px}.kr19-h b{font-size:18px;font-weight:900;letter-spacing:-.3px}.kr19-h span{font-size:13px!important;color:var(--sub);font-weight:700}" +
    ".kr19-ts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.kr19-t{background:var(--panel,#fff);border-radius:14px;padding:9px 8px;text-align:center}.kr19-t small{display:block;font-size:13px!important;color:var(--sub)}.kr19-t b{display:block;font-size:24px;font-weight:900;line-height:1.2}.kr19-t em{display:block;font-style:normal;font-size:13px!important;color:var(--sub)}" +
    ".kr19-sp{display:block;width:100%;height:46px;margin:8px 0 0;color:var(--text)}.kr19-spl{display:flex;justify-content:space-between;font-size:11.5px!important;color:var(--sub);margin:1px 2px 0}.kr19-spl i{display:inline-block;width:10px;height:3px;border-radius:2px;margin:0 3px 2px 6px;vertical-align:middle;background:#f04452}.kr19-spl i.q{background:#9aa3b5}" +
    ".kr19-early{margin:8px 2px 0;font-size:13px!important;color:#b7791f;font-weight:700}" +
    ".kr19-br{margin:8px 2px 2px}.kr19-br>div{height:6px;border-radius:3px;background:rgba(49,130,246,.35);overflow:hidden}.kr19-br>div i{display:block;height:100%;background:rgba(240,68,82,.75)}.kr19-br span{display:block;font-size:13px!important;margin-top:4px;color:var(--sub)}.kr19-br em{font-style:normal}" +
    ".kr19-rs{margin-top:6px}.kr19-r{display:grid;grid-template-columns:22px 1fr auto;column-gap:4px;align-items:start;width:100%;text-align:left;font:inherit;color:var(--text);background:transparent;border:0;border-top:1px solid rgba(127,127,127,.16);padding:7px 2px;cursor:default}" +
    "button.kr19-r{cursor:pointer}.kr19-ic{grid-row:span 2;font-size:15px;line-height:1.35}.kr19-r small{font-size:12px!important;color:var(--sub);font-weight:700}.kr19-r p{grid-column:2;margin:1px 0 0;font-size:14.5px;line-height:1.45;word-break:keep-all;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.kr19-r>i{grid-row:1/span 2;grid-column:3;align-self:center;font-style:normal;color:var(--sub)}" +
    ".kr19-r b{font-weight:800}.kr19-r u{text-decoration:none;font-weight:700;border-bottom:1px dotted currentColor;cursor:pointer}.kr19-m{color:var(--sub);font-size:13px}" +
    ".kr19-fl .fl-line{border-radius:0!important;box-shadow:none!important;border-left:0!important;border-right:0!important;border-bottom:0!important;margin:0!important;display:block;width:100%;text-align:left;font:inherit;font-size:14px;font-weight:700;color:var(--text);background:transparent;border:0;border-top:1px solid rgba(127,127,127,.16);padding:8px 2px;cursor:pointer;word-break:keep-all}.kr19-fl .fl-line i{font-style:normal;color:var(--sub);float:right}" +
    ".kr19-f{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;border-top:1px solid rgba(127,127,127,.16);padding-top:8px}.kr19-us{font-size:13px!important;color:var(--sub)}.kr19-us b{font-weight:800}" +
    ".kr19-send{margin-left:auto;font:inherit;font-size:13.5px;font-weight:800;color:#3182f6;background:rgba(49,130,246,.1);border:0;border-radius:99px;padding:7px 12px;cursor:pointer;white-space:nowrap}" +
    ".kr19 .up{color:var(--up,#f04452)}.kr19 .dn{color:var(--down,#3182f6)}" +
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
__bk(72);
/* ======== ux1109.js ======== */
/* 🧊 11/09 사용자 「냉정하고 객관적으로 효용성·편리성 판단해서 개선 — 누구나 쉽게 효과적으로」 → 아이디어 17 「다 반영해」
   이 파일: ① 뭐 살까? 첫 카드 = 「지금 이렇게 담으면 돼요」(열어 둠) → 성적은 두 번째
           ② 성적 카드 맨 위 정직 한 줄 (S&P보다 몇 %p · 끌어내린 칸 · 최근 바꾼 것) — 쉬운·전체 화면 모두
           ⑥ 쉬운 화면: 탭당 카드 5개까지(첫 카드는 열어 둠) · 나머지는 「＋ n개 더 보기」 한 줄 — 전체 메뉴는 그대로
           ⑦ 제안서 머리의 「AI 안 씀 · 0원」 꼬리표 숨김(동료는 뜻 모름)
           ⑧ 쉬운 화면 머리 아이콘 5→2 (조이·검색만 · ★·⚙·📨 은 🙋 뭐 보지? 안으로)
           ⑮ 쉬운 화면: 어려운 말이 처음 나올 때 점선 밑줄 → 누르면 조이 한 줄
   (③④⑤⑩⑫⑬⑯ 는 ux1105c.js 첫 화면 · ⑨ ux1015b.js · ⑪ home2.js · ⑭ gsearch.js · ⑰ onepage.js)
   원칙: 지우지 않음 — 숨기기·옮기기·이름 바꾸기만. 숫자는 자료 그대로. */
(function(){
  var D = document.documentElement;
  function EZ(){ return D.getAttribute("data-ez") === "easy"; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pp(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1); }
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var HJ = null, HT = 0;
  function homeJ(){
    if (HJ && Date.now() - HT < 300000) return Promise.resolve(HJ);
    if (!window.getJSON) return Promise.resolve(null);
    return getJSON(RM + "home.json?" + Math.floor(Date.now() / 300000), {ttl: 300000}).then(function(j){ HJ = j; HT = Date.now(); return j; }).catch(function(){ return HJ; });
  }

  /* ── ① 뭐 살까? 순서 + 열어 두기 (쉬운 화면) ── */
  function portOrder(){
    if (cur() !== "port" || !EZ()) return;
    var body = document.getElementById("pobody"), fol = document.getElementById("pofollow"), win = body && body.querySelector(":scope > .po-win");
    if (!body || !fol || fol.parentNode !== body) return;
    var ref = win || document.getElementById("posum"); if (!ref) return;
    if (fol.nextElementSibling !== ref){ body.insertBefore(fol, ref); }
    if (!fol.dataset.ez1){ fol.dataset.ez1 = "1"; fol.classList.add("open"); }
  }

  /* ── ② 정직 한 줄 ── */
  function honest(){
    if (cur() !== "port") return;
    var sum = document.getElementById("posum"); if (!sum || sum.querySelector(".ez-hon")) return;
    if (sum.dataset.ezh === "wait") return; sum.dataset.ezh = "wait";
    homeJ().then(function(H){
      sum.dataset.ezh = "";
      var P = H && H.port; if (!P || P.base == null || P.spy == null || sum.querySelector(".ez-hon") || !document.body.contains(sum)) return;
      var gap = P.base - P.spy, weak = (P.weak || []).map(function(x){ return String(x).replace(/^🧭\s*/, "").replace(/ 코어$/, ""); }).slice(0, 3);
      var c = P.change || {}, ch = c.why ? String(c.why).split(" — ")[0].split(" · ")[0].replace(/^🧭\s*/, "").replace(/\(.*?\)/g, "").trim() : "";
      var d = document.createElement("div"); d.className = "ez-hon " + (gap >= 0 ? "ok" : "bad");
      d.innerHTML = '<b>' + (gap >= 0 ? "📈 S&P500보다 " + pp(gap) + "%p 앞" : "📉 S&P500보다 " + pp(gap) + "%p 뒤") + '</b>' +
        (gap < 0 && weak.length ? '<span>끌어내린 칸: ' + e(weak.join(" · ")) + '</span>' : '') +
        (ch ? '<span>최근 바꾼 것: ' + e(String(c.date || "").slice(5).replace("-", "/")) + ' ' + e(ch.slice(0, 48)) + '</span>' : '') +
        '<button type="button" class="ez-hon-go">왜? 칸별 보기 ›</button>';
      var sh = sum.querySelector(".po-sh"); if (sh) sh.insertAdjacentElement("afterend", d); else sum.insertBefore(d, sum.firstChild);
      d.querySelector(".ez-hon-go").onclick = function(ev){ ev.stopPropagation(); var f = document.getElementById("poct"); if (!f) return;
        f.classList.remove("ez-cap-hid"); f.classList.add("open"); f.scrollIntoView({behavior: "smooth", block: "start"}); };
    });
  }

  /* ── ⑥ 쉬운 화면: 카드 5개 상한 · 첫 카드 열기 ── */
  var NOCAP = {home: 1, divc: 1, prop: 1, luck: 1, saju: 1, tarot: 1, lotto: 1, onepager: 1, alarm: 1, idea: 1};
  var CAP = 5, MORE = {};
  try { MORE = JSON.parse(sessionStorage.getItem("ezcapmore") || "{}") || {}; } catch(x) {}
  function blocks(root){
    var sel = ".card, .fold, details.card, #podz, #pohero";
    return [].filter.call(root.querySelectorAll(sel), function(c){
      if (c.classList.contains("hero") || c.id === "ezcapb" || c.offsetParent === null && !c.classList.contains("ez-cap-hid")) return false;
      var p = c.parentElement && c.parentElement.closest(sel + ", .fold-b, #sheet, .xs-list, #posum"); return !p || !root.contains(p);
    });
  }
  function openFirst(c){
    if (c.dataset.ezf) return; c.dataset.ezf = "1";
    if (c.classList.contains("fold")) { c.classList.add("open"); return; }
    if (c.classList.contains("cz-on")){ var h = c.querySelector(":scope > .cz-h"); if (h) h.click(); else c.classList.remove("cz-on"); }
  }
  function cap(){
    var t = cur(), main = document.getElementById("main"), btn = document.getElementById("ezcapb");
    if (!main || !EZ() || NOCAP[t] || MORE[t]){
      if (btn) btn.remove(); [].forEach.call(document.querySelectorAll(".ez-cap-hid"), function(x){ x.classList.remove("ez-cap-hid"); }); return;
    }
    var L = blocks(main); if (L.length <= CAP + 1){ if (btn) btn.remove(); [].forEach.call(document.querySelectorAll(".ez-cap-hid"), function(x){ x.classList.remove("ez-cap-hid"); }); return; }
    // 포트 탭은 성적 덩어리(#posum)가 카드 모양이 아니라 목록에 안 잡힘 → 「담으면」 + 성적 + 3장
    var first = L[0]; if (first && main.dataset.ezft !== t){ main.dataset.ezft = t; openFirst(first); }
    var show = t === "port" ? CAP - 1 : CAP;
    L.forEach(function(c, i){ c.classList.toggle("ez-cap-hid", i >= show); });
    var last = L[show - 1], n = L.length - show;
    if (!btn){ btn = document.createElement("button"); btn.type = "button"; btn.id = "ezcapb";
      btn.onclick = function(){ MORE[cur()] = 1; try { sessionStorage.setItem("ezcapmore", JSON.stringify(MORE)); } catch(x) {} cap(); }; }
    btn.innerHTML = '＋ ' + n + '개 더 보기 <small>' + e(L.slice(show, show + 3).map(function(c){ return title(c); }).filter(Boolean).join(" · ")) + (n > 3 ? " …" : "") + '</small>';
    if (last && last.nextElementSibling !== btn) last.insertAdjacentElement("afterend", btn);
    for (var x = btn.nextElementSibling; x; x = x.nextElementSibling){ if (x.classList.contains("sec")) x.classList.add("ez-cap-hid"); }   // 카드 없이 남는 제목 줄도 같이
  }
  function title(c){
    var h = c.querySelector(":scope > .cz-h span, :scope > .sec, :scope > summary, :scope > h3, :scope > .fold-h");
    var t = (h ? h.textContent : (c.innerText || "").split("\n")[0]) || "";
    t = t.replace(/펼치기 ▾|접기 ▴/g, "").replace(/\s+/g, " ").trim();
    return t.length > 14 ? t.slice(0, 13) + "…" : t;
  }

  /* ── ⑦ 제안서 꼬리표 ── */
  function propChip(){
    if (cur() !== "prop") return;
    [].forEach.call(document.querySelectorAll("#main > .hero .chip, #main > .hero span"), function(x){ if (/AI 안 씀/.test(x.textContent)) x.style.display = "none"; });
  }

  /* ── ⑮ 어려운 말 점선 밑줄 (쉬운 화면) ── */
  var TERMS = [
    ["하락장", "고점보다 20% 넘게 빠진 장 (종가 기준). 이때 얼마나 들고 있을지는 🔁 닮은 장 규칙이 시장마다 정함 (예: 코스피는 50일선 넘으면 사기 · 코스닥은 절반 들고 감)."],
    ["닮은 장 규칙", "지금 장과 숫자가 닮았던 과거 12번을 찾아, 그때 2년 뒤 가장 나았던 방식을 지금 규칙으로 씀 (11/12부터)."],
    ["조정", "고점보다 10~20% 빠진 상태. 하락장의 앞 단계 — 현금을 조금(10%) 늘림."],
    ["바닥 신호", "하락장이 끝나 가는지 보는 4가지 체크 (저점 다지기·20일선 회복·공포 진정·외국인 순매수). 켜진 개수만큼 다시 담음."],
    ["장기 평균선", "최근 200거래일(약 10개월) 평균 가격. 지수가 그 위면 큰 흐름이 위."],
    ["200일선", "최근 200거래일(약 10개월) 평균 가격. 지수가 그 위면 큰 흐름이 위."],
    ["20일선", "최근 20거래일(약 한 달) 평균 가격. 짧은 흐름을 볼 때 씀."],
    ["손절", "정해 둔 만큼(공격 포트는 −5%) 빠지면 더 잃기 전에 파는 것."],
    ["%p", "퍼센트포인트 — 두 수익률의 차이. 내 −8%와 시장 −4%의 차이는 4%p."],
    ["S&P500", "미국 대표 500개 회사 지수. 앱의 「시장」 기준선."],
    ["나스닥100", "미국 기술주 중심 100개 회사 지수."],
    ["선물", "앞으로 사고팔 값을 미리 정하는 거래. 밤사이 미국 선물로 다음 날 분위기를 미리 봄."],
    ["VIX", "미국 주식의 「공포 지수」. 20 아래면 차분, 30 넘으면 겁먹은 장."],
    ["ELS", "주가가 정해진 선 아래로 크게 안 빠지면 약속한 이자를 주는 상품. 낙인선을 깨면 손실 날 수 있음."],
    ["낙인", "ELS에서 기초자산이 이 선 아래로 떨어지면 원금 손실 가능성이 생기는 선."],
    ["헤알", "브라질 돈. 브라질 국채는 금리가 높지만 헤알 값이 떨어지면 원화 수익이 줄어듦."],
    ["듀레이션", "채권 값이 금리에 얼마나 민감한지. 클수록 금리 내릴 때 더 많이 오름."],
    ["리츠", "빌딩·물류센터 등에 투자해 임대료를 나눠 주는 상품."],
    ["반대매매", "빌린 돈으로 산 주식이 담보보다 떨어지면 증권사가 강제로 파는 것. 급락을 키움."],
    ["순매수", "산 금액에서 판 금액을 뺀 것. 플러스면 더 많이 산 것."],
    ["배분표", "시황리포트가 매일 정하는 자산별 비중표 (주식·금·현금 몇 %)."],
    ["공격 포트", "기본 포트에 성과가 확인된 신호(큰손·컵·갭) 종목을 10~20% 섞어 시장을 이기려는 포트."],
    ["집중 포트", "오르는 장이라고 볼 때만 S&P·나스닥 뼈대 + 공격 종목에 몰아서 담는 포트."],
    ["기본 포트", "시황리포트 자산배분표대로 담은 포트. 주식 칸은 S&P500 반 + 나스닥 반이 뼈대."],
    ["큰손", "기관·유명 투자자 40곳. 분기마다 공시(13F)하는 보유 종목 변화를 따라감."],
    ["컵", "컵앤핸들 차트 — 바닥을 둥글게 다진 뒤 전 고점을 뚫으려는 모양."],
    ["심의필", "고객에게 보내는 자료가 회사 준법 심의를 통과했다는 번호."]
  ];
  var TRE = new RegExp("(" + TERMS.map(function(t){ return t[0].replace(/[.*+?^${}()|[\]\\%&]/g, "\\$&"); }).sort(function(a, b){ return b.length - a.length; }).join("|") + ")");
  var TDEF = {}; TERMS.forEach(function(t){ TDEF[t[0]] = t[1]; });
  var USED = {}, UTAB = "", SCAN = 0;
  var SKIP = "button,a,input,textarea,select,svg,canvas,script,style,summary,.cz-h,.fold-h,.sec,.ez-term,#bnav,header,.ezw-s,.ez-nums,.gs-box,#ezsheet,#eztour,.po-sb,.po-sbl,code,pre,.chip,label";
  function terms(){
    if (!EZ()) return;
    var t = cur(), main = document.getElementById("main"); if (!main || t === "luck" || t === "saju" || t === "tarot" || t === "lotto") return;
    if (UTAB !== t){ UTAB = t; USED = {}; [].forEach.call(main.querySelectorAll(".ez-term"), function(u){ USED[u.dataset.t] = 1; }); }
    var w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {acceptNode: function(n){
      if (!n.nodeValue || n.nodeValue.length < 2 || n.__ezt) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement; if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
      if (p.offsetParent === null) return NodeFilter.FILTER_REJECT;   // 접힌 칸은 펼칠 때
      return NodeFilter.FILTER_ACCEPT; }}), n, k = 0, todo = [];
    while ((n = w.nextNode()) && k++ < 2500){ n.__ezt = 1; var m = TRE.exec(n.nodeValue); if (m && !USED[m[1]]){ USED[m[1]] = 1; todo.push([n, m]); } }
    todo.forEach(function(x){
      var n2 = x[0], m2 = x[1], i = m2.index, s = n2.nodeValue;
      var u = document.createElement("u"); u.className = "ez-term"; u.dataset.t = m2[1]; u.textContent = m2[1];
      var after = document.createTextNode(s.slice(i + m2[1].length)); after.__ezt = 1;
      n2.nodeValue = s.slice(0, i); n2.parentNode.insertBefore(u, n2.nextSibling); u.parentNode.insertBefore(after, u.nextSibling);
    });
  }
  document.addEventListener("click", function(ev){
    var u = ev.target.closest && ev.target.closest(".ez-term"); if (!u) return;
    ev.preventDefault(); ev.stopPropagation();
    var d = TDEF[u.dataset.t]; if (!d) return;
    if (window.gdSay) gdSay("📖 " + u.dataset.t, [d]); else alert(d);
  }, true);

  /* ── ⑧ 머리 아이콘 다이어트 — ★·⚙·📨 을 🙋 안으로 (시트가 열릴 때 줄 하나 덧붙임) ── */
  function sheetRow(){
    var s = document.querySelector("#ezsheet .ezs-in"); if (!s || s.querySelector(".ezs-tools") || !EZ()) return;
    var r = document.createElement("div"); r.className = "ezs-tools";
    r.innerHTML = [["wlbtn", "★", "관심종목"], ["opbtn", "📨", "화면 한 장"], ["uibtn", "⚙", "보기 설정"]].map(function(x){ return '<button type="button" data-tool="' + x[0] + '"><span>' + x[1] + '</span>' + x[2] + '</button>'; }).join("");
    var mode = s.querySelector(".ezs-mode"); s.insertBefore(r, mode || null);
    r.onclick = function(ev){ var b = ev.target.closest("[data-tool]"); if (!b) return; var k = b.dataset.tool, sh = document.getElementById("ezsheet"); if (sh) sh.remove();
      if (k === "@role"){ if (window.__ezRole) __ezRole(true); return; }
      var o = document.getElementById(k); if (o) o.click(); };
  }

  /* ── 공통 ── */
  var q = 0, lastTab = "";
  function tick(){ q = 0;
    var t = cur(); if (t !== lastTab){ lastTab = t; }
    try { portOrder(); } catch(x) {}
    try { honest(); } catch(x) {}
    try { cap(); } catch(x) { console.warn("ez cap", x); }
    try { propChip(); } catch(x) {}
    try { sheetRow(); } catch(x) {}
    clearTimeout(SCAN); SCAN = setTimeout(function(){ try { terms(); } catch(x) { console.warn("ez terms", x); } }, 700);
  }
  function soon(){ if (!q) q = setTimeout(tick, 250); }
  function start(){ tick(); try { new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var tg = ms[i].target; if (tg.id === "ezcapb" || (tg.closest && tg.closest("#ezcapb"))) continue; soon(); return; } }).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
    document.addEventListener("click", function(){ setTimeout(soon, 120); }, true); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  var R = "html[data-ez=easy]", st = document.createElement("style");
  st.textContent =
    R + " #wlbtn," + R + " #opbtn," + R + " #uibtn," + R + " #stamp{display:none!important}" +
    ".ez-cap-hid{display:none!important}" +
    "#ezcapb{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;color:var(--text);background:var(--panel);border:1px dashed var(--line);border-radius:16px;padding:12px;margin:4px 0 14px;cursor:pointer}#ezcapb small{display:block;font-weight:500;font-size:12.5px!important;color:var(--sub);margin-top:2px}" +
    ".ez-hon{margin:6px 0 8px;padding:9px 11px;border-radius:12px;font-size:13.5px;line-height:1.45}.ez-hon.bad{background:rgba(49,130,246,.09)}.ez-hon.ok{background:rgba(240,68,82,.08)}" +
    ".ez-hon b{display:block;font-size:14.5px}.ez-hon span{display:block;color:var(--sub);word-break:keep-all}.ez-hon-go{margin-top:4px;font:inherit;font-size:13px;font-weight:700;color:#3182f6;background:none;border:0;padding:0;cursor:pointer}" +
    "u.ez-term{text-decoration:none;border-bottom:1.5px dotted currentColor;cursor:help}" +
    ".ezs-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.ezs-tools button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:12.5px;font-weight:700;color:var(--sub);background:none;border:1px solid var(--line);border-radius:12px;padding:8px 2px;cursor:pointer}.ezs-tools span{font-size:18px}";
  document.head.appendChild(st);
})();
;
__bk(73);
/* ======== ux1109b.js ======== */
/* 🌱 11/09 A11/9-1 (+ 같은 날 오후: 시장별 다시 사기 규칙 — 머리는 그 규칙 단계 기준, 규칙에 안 쓰는 신호는 「참고」) 「신호가 켜지면 — 바닥 신호 4개의 과거 성적표」 (사용자 「다 진행해」)
   bear.json 시장마다 hist(src/bear_gate.py --bt → market/bear_sig_bt.json, 2000년부터 과거 🐻 하락장마다)를
   🐻 하락장 계기판 체크리스트(오늘 홈 · 쉬운 화면 「지금 규칙」 펼침)에 붙인다.
   ─ 머리: 신호 2·3·4개가 처음 켜진 날 → 6개월 뒤 코스피가 올라 있던 때 / 내려 있던 때 · 그날 뒤 바닥이 더 남아 있던 때 (「n번 중 m번」으로만)
   ─ 신호 줄 밑: 바닥 뒤 보통 며칠 · 바닥보다 몇 % 위에서 켜짐 · 「켜졌다가 더 빠진 적」은 누르면
   ─ 오늘 켜진 신호는 「🟢 켜짐」 · 이번 하락장에서 켜졌다 꺼진 횟수 한 줄
   숫자는 자료 그대로 · 평균·확률 % 안 씀 · 매수 권유 문구 없음 · 계산은 만드는 쪽(이 파일은 그리기만) */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pc(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(Math.round(v)) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  var NUM = ["①", "②", "③", "④"];

  // 🌱 11/09 오후 시장별 다시 사기 규칙(사용자 「네 추천대로」): 머리는 「그 규칙의 단계에 처음 닿은 날」 뒤 6개월
  function stageLine(s, nm, merged){
    if (!s) return "";
    var lab = merged ? "①+④(+② 대개 같은 날) 켜져 다시 산 날" : s.lv === "out" ? "하락장 판정이 풀려 다시 산 날" : s.lv === "10" ? "① 저점 다지기 + ④ 50일선 위 → 현금 10%" : "② 20일선까지 → 현금 0%";
    if (!s.hit) return '<li><b>' + e(lab) + '</b> — 과거 하락장 ' + s.eps + '번 안에선 닿은 적 없음</li>';
    var r6n = (s.pos6 || 0) + (s.neg6 || 0);
    return '<li><b>' + e(lab) + '</b> → 6개월 뒤 ' + e(nm) + ' 올라 있던 때 <b class="bs-u">' + s.pos6 + '번</b> · 내려 있던 때 <b class="bs-d">' + s.neg6 + '번</b>' +
      (r6n < s.hit ? ' <small>(' + (s.hit - r6n) + '번은 6개월이 아직 안 지남)</small>' : '') +
      '<br><small>보통 바닥 ' + Math.round(s.after) + '거래일 뒤 · 바닥보다 ' + pc(s.up) + ' 위에서 · 그 뒤 바닥이 더 남아 있던 때 ' + s.early + '번' + (s.worst_more ? ' (가장 깊게 ' + e(s.worst_more.y) + '년 ' + pc(s.worst_more.more) + ' 더)' : '') + '</small></li>';
  }

  // 체크리스트 한 줄 밑에 붙는 과거 한 줄 (k = 0~3)
  window.__bearSigLine = function(m, k){
    var h = m && m.hist, s = h && h.sig && h.sig[k], c = m && m.checks && m.checks[k]; if (!s) return "";
    var fresh = (m.fresh || []).indexOf(k) >= 0, on = c && c.on, ref = c && c.use === false;
    var main = !s.on ? '과거 하락장 ' + s.eps + '번: 바닥 뒤엔 한 번도 안 켜짐'
      : '과거 ' + s.eps + '번 중 ' + s.on + '번 · 보통 바닥 <b>' + Math.round(s.after) + '거래일</b> 뒤 · 바닥보다 <b>' + pc(s.up) + '</b> 위에서 켜짐';
    var fk = s.fake_eps ? '<details class="bs-f"><summary>켜졌다가 더 빠진 적 ' + s.eps + '번 중 ' + s.fake_eps + '번</summary><p>하락장 ' + s.fake_eps + '번에서 모두 ' + s.fake_n + '회 켜졌다가, 그 뒤 더 낮은 바닥이 나왔어요' +
      (s.fake_worst ? ' · 가장 깊게 ' + e(s.fake_worst.y) + '년 켜진 뒤 ' + pc(s.fake_worst.more) + ' 더 빠짐' : '') + '.' + (k === 3 && h.note4 ? ' ' + e(h.note4) + '.' : '') + '</p></details>'
      : (s.on ? '<small class="bs-ok">켜졌다가 더 빠진 적 없음</small>' : '');
    return '<div class="bs-l' + (on && !ref ? " on" : "") + '">' + (on && !ref ? '<b class="bs-on">🟢 ' + (fresh ? "오늘 " : "") + '켜짐</b> · ' : '') + '📜 ' + main + fk + '</div>';
  };

  // 체크리스트 위에 붙는 머리 (그 시장 다시 사기 규칙의 단계에 처음 닿은 날 뒤 6개월)
  window.__bearSigHead = function(m){
    var h = m && m.hist; if (!h || !h.stages || !h.stages.length) return "";
    var nm = m.name || "", S = h.stages, eps = S[0].eps, F_ = h.rule !== "E", OFF_ = h.rule === "OFF" || !!m.analog;   // 🔁 11/12 닮은 장 규칙이 정하면 이 과거 기록은 예전 규칙 참고
    var merged = !F_ && S.length === 2 && S[1].same_prev === S[1].hit && S[0].hit === S[1].hit;
    var now = h.now && h.now.fake ? h.now.fake.map(function(n, i){ return n && (!m.checks || !m.checks[i] || m.checks[i].use !== false) ? NUM[i] + ' ' + n + '회' : ""; }).filter(Boolean) : [];
    return '<div class="bs-h"><div class="bs-ht">📜 ' + (OFF_ ? '참고 — ' : '이 규칙대로였다면 — ') + '과거 ' + e(nm) + ' 하락장 ' + (eps || "") + '번 <small>' + e(String(h.from || "").slice(0, 4)) + '년부터 · 종가</small></div><ul class="bs-ul">' +
      (merged ? stageLine(S[1], nm, true) : S.map(function(s){ return stageLine(s, nm); }).join("")) + '</ul>' +
      (h.now && !F_ ? '<p class="bs-now">이번 하락장(' + md(h.now.in) + '부터 ' + h.now.len + '거래일): ' + (now.length ? '켜졌다가 도로 꺼진 조건 ' + now.join(" · ") : '아직 켜졌다 꺼진 조건 없음') + '</p>' : '') +
      (m.analog ? '<p class="bs-now">지금은 🔁 닮은 장 규칙(' + e(m.analog.rule) + ')이 정해요 — 위 기록은 예전 규칙 참고예요</p>' : OFF_ ? '<p class="bs-now">이 시장은 현금 규칙을 꺼 뒀어요 — 위 줄은 「판정이 풀린 날」 기준 참고예요</p>' : F_ ? '<p class="bs-now">이 시장은 바닥 신호로 미리 다시 사지 않아요 — 늦게 사는 대신 「바닥이 더 남았는데 산」 일이 없어요</p>' : '') +
      '<p class="bs-n">하락장 수가 적어 「몇 번 중 몇 번」으로만 봐요 · 과거일 뿐 앞날 보장 아님 · 사라·팔라는 뜻 아님' + (h.note4 ? ' · ' + e(h.note4) : '') + '</p></div>';
  };

  var css = document.createElement("style");
  css.textContent =
    ".bs-h{margin:8px 0 6px;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08));box-shadow:inset 0 0 0 1px var(--line,rgba(127,127,127,.25))}" +
    ".bs-ht{font-size:14px;font-weight:900}.bs-ht small{font-size:12px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".bs-h ul{margin:6px 0 4px;padding-left:16px;font-size:13.5px;line-height:1.55;word-break:keep-all}.bs-h li{margin:3px 0}.bs-h li small{color:var(--sub);font-size:12.5px}" +
    ".bs-u{color:var(--up)}.bs-d{color:var(--down)}" +
    ".bs-now{margin:4px 0 0;font-size:13px;font-weight:700;word-break:keep-all}.bs-n{margin:4px 0 0;font-size:12px;color:var(--sub);line-height:1.5;word-break:keep-all}" +
    ".bs-l{display:block;width:100%;margin:3px 0 2px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all;font-weight:500}.bs-l b{color:var(--text)}.bs-l.on{color:var(--text)}.bs-on{color:#1f9d55!important}" +
    ".bs-f{margin-top:2px}.bs-f summary{cursor:pointer;list-style:none;color:var(--acc,#3182f6);font-weight:700}.bs-f summary::-webkit-details-marker{display:none}.bs-f p{margin:3px 0 0}.bs-ok{display:block;color:var(--sub)}" +
    ".bg-ck li .bs-l{grid-column:2}.bg-ck li .bs-l b{color:var(--text);font-weight:800}.bg-ck li .bs-l b.bs-on{color:#1f9d55}.bg-ck li .bs-l small{font-size:12.5px}" +
    ".ez-rule li .bs-l{margin-left:22px;width:auto}.ez-rule li .bs-l small{margin-left:0!important;display:block}.ez-rule .bs-h ul.bs-ul{list-style:disc;padding-left:16px;margin:6px 0 4px}.ez-rule .bs-h li{font-size:13.5px}.ez-rule .bs-h li small{display:inline;margin-left:0}.ez-rule .bs-h p{margin:4px 0 0}" +
    ".bs-h ul.bs-ul{list-style:disc}.ez-ref,.bg-ref{font-style:normal;font-size:11px;font-weight:700;color:var(--sub);border:1px solid var(--line);border-radius:6px;padding:0 4px;margin-left:4px}";
  document.head.appendChild(css);
})();
;
__bk(74);
/* ======== ux1110.js ======== */
/* 📨 11/10 A11/10-1 「이번 하락장 반등 날 n번, 그 뒤엔」 — 반등 날에만 뜨는 기록 카드 (사용자 「네 추천 진행시켜」)
   코스피가 🐻 하락장이고 오늘 +3% 넘게 오른 날에만:
   ─ 🔰 쉬운 첫 화면 「그래서 오늘은」 밑 · 전체 메뉴 🏠 🛡 결론 카드 밑(계기판 위) · 📨 고객 한 장(시장) 한 줄
   ─ 「7/8 하락장 시작 뒤 +3% 넘게 오른 날 n번 — 그 뒤 20거래일 안에 그날까지 저점을 다시 깬 때 m번 · 안 깬 때 k번 · 미정 j번」 + 이번 하락장만의 점 띠
   ─ n < 3 이면 안 띄움 · 과거 하락장 겹치기 없음 · 확률 % 없음 · 「규칙은 그대로, 이건 기록」
   계산은 만드는 쪽(market-strategy-report src/bear_gate.py rebounds() → bear.json 코스피 칸 rebounds) — 이 파일은 그리기만 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function sg(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }

  // bear.json(전체) 또는 코스피 칸 → 오늘 보여 줄 정보 (없으면 null)
  function info(B, chg){
    var m = B && B.markets ? B.markets.filter(function(x){ return x.key === "kospi"; })[0] : B;
    var R = m && m.rebounds;
    if (!m || m.state !== "🐻" || !R || !(R.n >= (R.min || 3))) return null;
    chg = chg == null ? null : +String(chg).replace("−", "-");
    if (chg == null || isNaN(chg) || chg < (R.up || 3)) return null;
    var k = kst(), wd = k.getUTCDay(), hm = k.getUTCHours() * 60 + k.getUTCMinutes();
    if (wd === 0 || wd === 6 || hm < 9 * 60) return null;     // 장 열기 전엔 「오늘」 등락이 아님
    var td = today(), pts = R.pts || [], inPts = pts.some(function(p){ return p.d === td; });
    var last = pts[pts.length - 1];
    return {m: m, R: R, chg: chg, td: td, inPts: inPts, last: last};
  }

  function lastLine(p){
    if (!p) return "";
    var t = "가장 최근 " + md(p.d) + " " + sg(p.r1) + " → ";
    if (p.out === "broke") t += p.bd + "거래일 뒤 저점 다시 깸";
    else if (p.out === "held") t += "20거래일 동안 안 깸" + (p.r20 != null ? " (20일 뒤 " + sg(p.r20) + ")" : "");
    else t += "아직 " + p.left + "거래일 남음 · 미정";
    return t;
  }

  // 이번 하락장만의 점 띠 (날짜 비례 · 안 깸 = 빨강 · 다시 깸 = 파랑 · 미정 = 회색 · 오늘 = 빈 동그라미)
  function strip(I){
    var R = I.R, t0 = Date.parse(R.from), t1 = Date.parse(I.td), W = 300, L = 8, Rr = 292;
    if (!(t1 > t0)) return "";
    var x = function(d){ return L + (Date.parse(d) - t0) / (t1 - t0) * (Rr - L); };
    var col = {held: "var(--up,#e66767)", broke: "var(--down,#3987e5)", open: "var(--dim,#8a93a5)"};
    var dots = (R.pts || []).map(function(p){ return '<circle cx="' + x(p.d).toFixed(1) + '" cy="14" r="5" fill="' + col[p.out] + '"><title>' + e(md(p.d) + " " + sg(p.r1)) + '</title></circle>'; }).join("");
    var now = I.inPts ? "" : '<circle cx="' + Rr + '" cy="14" r="5" fill="none" stroke="var(--text,#e8ecf4)" stroke-width="1.6"/>';
    return '<svg class="rbx-sv" viewBox="0 0 ' + W + ' 28" preserveAspectRatio="none" aria-hidden="true"><line x1="' + L + '" y1="14" x2="' + Rr + '" y2="14" stroke="var(--line,rgba(127,127,127,.35))" stroke-width="1.5"/>' + dots + now + '</svg>' +
      '<div class="rbx-ax"><span>' + e(md(R.from)) + ' 하락장 시작</span><span>오늘</span></div>' +
      '<div class="rbx-lg"><i style="background:var(--up,#e66767)"></i>안 깸 <i style="background:var(--down,#3987e5)"></i>다시 깸' + (R.open ? ' <i style="background:var(--dim,#8a93a5)"></i>미정' : '') + (I.inPts ? '' : ' <i class="o"></i>오늘') + '</div>';
  }

  function main(I){
    var R = I.R;
    return md(R.from) + " 하락장 시작 뒤 <b>+" + (R.up || 3) + "% 넘게 오른 날 " + R.n + "번</b> — 그 뒤 " + (R.nd || 20) + "거래일 안에 그날까지의 저점을 " +
      '다시 깬 때 <b class="rbx-d">' + R.broke + "번</b> · 안 깬 때 <b class=\"rbx-u\">" + R.held + "번</b>" + (R.open ? " · 아직 " + (R.nd || 20) + "일 안 지나 미정 " + R.open + "번" : "");
  }

  // 화면 카드 (where: "ez" 쉬운 화면 · "home" 전체 메뉴 홈)
  window.__rebCard = function(B, chg, where){
    var I = info(B, chg); if (!I) return "";
    return '<section class="rbx-c' + (where === "ez" ? " ez" : " card") + '" id="rbcard" data-cz="done">' +
      '<div class="rbx-h">📈 이번 하락장 반등 날 ' + I.R.n + '번, 그 뒤엔 <small>오늘 코스피 ' + sg(I.chg) + '</small></div>' +
      '<p class="rbx-m">' + main(I) + '</p>' +
      (I.last ? '<p class="rbx-s">' + e(lastLine(I.last)) + (I.inPts ? '' : ' · 오늘 ' + sg(I.chg) + '은 마감 뒤 ' + (I.R.n + 1) + '번째로 들어가요') + '</p>' : '') +
      strip(I) +
      '<p class="rbx-n">규칙은 그대로, 이건 기록 · 종가 기준 · 이번 하락장 안에서만 셈 · 사라·팔라는 뜻 아님</p></section>';
  };

  // 📨 고객 한 장 한 줄 ({h, t, tone, max} · onepage.js note 블록)
  window.__rebNote = function(B, chg){
    var I = info(B, chg); if (!I) return null;
    var R = I.R;
    return {h: "📈 이번 하락장 반등 날 " + R.n + "번, 그 뒤엔",
      t: md(R.from) + " 하락장 시작 뒤 +" + (R.up || 3) + "% 넘게 오른 날 " + R.n + "번 중 " + (R.nd || 20) + "거래일 안에 저점을 다시 깬 때 " + R.broke + "번 · 안 깬 때 " + R.held + "번" + (R.open ? " · 미정 " + R.open + "번" : "") + " — 반등 하루로 판단하지 않고 정한 규칙대로 가요 (종가 기준 기록)",
      tone: "dark", max: 3};
  };

  var css = document.createElement("style");
  css.textContent =
    ".rbx-c{margin:10px 0;padding:12px 14px;border-radius:14px;background:var(--panel,rgba(127,127,127,.08));box-shadow:inset 0 0 0 1px var(--line,rgba(127,127,127,.25))}" +
    ".rbx-c.card{margin:10px 0}" +
    ".rbx-h{font-size:15px;font-weight:900;line-height:1.35;word-break:keep-all}.rbx-h small{display:block;margin-top:2px;font-size:12px;font-weight:700;color:var(--up,#e66767)}" +
    ".rbx-m{margin:6px 0 2px;font-size:14px;line-height:1.55;word-break:keep-all}.rbx-u{color:var(--up,#e66767)}.rbx-d{color:var(--down,#3987e5)}" +
    ".rbx-s{margin:2px 0 6px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".rbx-sv{display:block;width:100%;height:28px}" +
    ".rbx-ax{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-top:-2px}" +
    ".rbx-lg{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin-top:4px;font-size:12px;color:var(--sub)}.rbx-lg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:3px}.rbx-lg i.o{background:none;box-shadow:inset 0 0 0 1.5px var(--text,#e8ecf4)}" +
    ".rbx-n{margin:6px 0 0;font-size:12px;color:var(--sub);line-height:1.5;word-break:keep-all}";
  document.head.appendChild(css);
})();
;
__bk(75);
/* ======== ux1110b.js ======== */
/* 🫧 11/10 버블 경보판 — 「주식보다 채권이 먼저 운다」 (사용자: 전병서 11/11 「AI 버블, 지금 몇 시인가」를 올리며 「네 두뇌에 생각을 더해 · 이 글부터 바로 반영」)
   🏠 오늘 홈 🐻 하락장 계기판 바로 아래 카드 한 장:
   ─ 머리: 🔴·🟠·🟢 개수 띠 + 결론 한 줄(신용 경보 켜짐이면 「출구 설계: 현금 도는 기업·전력/데이터·외상 없는 삽 장수」)
   ─ 📅 분수령 날짜(엔비디아 실적 · FOMC) D-day
   ─ 펼치면: 신용 / 바늘 / 완충 묶음별 칸 — 자동(야후 종가) · 손(두뇌가 출처와 함께 갱신) 꼬리표
   계산은 만드는 쪽(market-strategy-report src/bubble_gate.py → market/bubble.json) — 이 파일은 그리기만 */
/* 🕰 11/11 버블 시계(A11/11-1 · 사용자 「둘 다 진행」) — 머리 띠 자리에 시계 하나: 전병서 순서 4단계(💳 신용 → 📈 금리·규제·유가 → 🧊 주식 속살·현금 도피 → 🛟 완충 꺼짐)
   칸 점수 🔴1·🟠½·🟢0 · 단계마다 3시간 · 앞 단계가 ¾ 넘게 울어야 다음 단계로 · 테두리 11칸(누르면 그 칸 근거) · 어제 마지막 시각 → 지금(bubble_log) · 계산은 결과 보기 전 등록 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function dday(d){
    var t = Date.parse(String(d).slice(0, 10) + "T00:00:00+09:00"), n = Date.parse(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + "T00:00:00+09:00");
    var k = Math.round((t - n) / 864e5); return k === 0 ? "오늘" : k > 0 ? "D-" + k : "";
  }
  var GN = {"신용": "💳 신용 — 채권이 먼저 우는 곳", "바늘": "📌 바늘 — 풍선 곁에 모인 것", "완충": "🛟 완충 — 버텨 주는 것"};
  var SC = {"🔴": "r", "🟠": "o", "🟢": "g"};

  // 🕰 버블 시계 — 순서는 전병서 「지금 몇 시인가」 틀(주식보다 신용이 먼저 운다)
  var CQ = [
    {t: "💳 신용", k: ["fcf", "bonds", "cds", "credit"]},
    {t: "📈 금리·규제·유가", k: ["rate", "policy", "geo"]},
    {t: "🧊 주식 속살·현금 도피", k: ["breadth", "flow"]},
    {t: "🛟 완충 꺼짐", k: ["buffer", "recession"]}
  ];
  var PT = {"🔴": 1, "🟠": 0.5, "🟢": 0};
  var KN = {fcf: "빅테크 현금흐름", bonds: "회사채", cds: "AI CDS", credit: "신용스프레드", rate: "금리", policy: "규제", geo: "유가", breadth: "평균 종목", flow: "현금 도피", buffer: "완충", recession: "경기"};
  function clockOf(st){   // st = {key: "🔴"...} → {h, label, q:[{t, comp, r, o, n}]}
    var h = 0, stop = false, q = CQ.map(function(Q){
      var ks = Q.k.filter(function(k){ return st[k] != null; }), sum = 0, r = 0, o = 0;
      ks.forEach(function(k){ sum += PT[st[k]] || 0; if (st[k] === "🔴") r++; if (st[k] === "🟠") o++; });
      return {t: Q.t, comp: ks.length ? sum / ks.length : 0, r: r, o: o, n: ks.length};
    });
    // 🕰 11/11 구조 손질(사용자 「구조를 손봐」): 순서 문(앞 단계 ¾) 없앰 — 과거 위기 때 금리가 내려 2단계가 못 채워 바늘이 4시 반에 묶였음(닷컴·금융위기) → 네 단계가 운 만큼 그냥 더함
    q.forEach(function(x){ h += 3 * x.comp; });
    var hh = Math.round(h * 2) / 2, w = Math.floor(hh), half = hh - w >= 0.5;
    var label = hh <= 0 ? "12시 · 조용" : hh >= 12 ? "12시 · 다 울었음" : "약 " + w + "시" + (half ? " 반" : "");
    if (hh > 0 && hh < 1) label = "약 12시 반";
    return {h: h, hh: hh, label: label, q: q};
  }
  function stOf(B){ var st = {}; (B.items || []).forEach(function(x){ if (x.key) st[x.key] = x.state; }); return st; }
  window.__bubClock = function(B){ try { return B && B.items ? clockOf(stOf(B)) : null; } catch(x) { return null; } };
  // 🕰 11/11 정직 표기 — 「🟠 3 / 3칸」이 꽉 찬 것처럼 읽혀서: 시계에 실제로 찬 만큼(절반·¾…)을 씀 · 앞 단계에 막힌 단계는 「⏸ 대기」
  function frac(c){ var F = [[1/4, "¼"], [1/3, "⅓"], [1/2, "절반"], [2/3, "⅔"], [3/4, "¾"]]; for (var i = 0; i < F.length; i++) if (Math.abs(c - F[i][0]) < 0.01) return F[i][1]; return Math.round(c * 100) + "%"; }
  function cnt(x){ return (x.r ? "🔴" + x.r : "") + (x.o ? (x.r ? " " : "") + "🟠" + x.o : ""); }
  function word(x){
    if (!x.n) return "자료 없음";
    if (x.wait) return x.comp > 0 ? cnt(x) + " · ⏸ 대기" : "조용";
    return x.comp >= 0.999 ? "다 울었음" : x.comp > 0 ? cnt(x) + " · " + frac(x.comp) : "조용";
  }
  function pt(a, r){ var t = a * Math.PI / 180; return (60 + r * Math.sin(t)).toFixed(1) + " " + (60 - r * Math.cos(t)).toFixed(1); }
  function clockSVG(B, C){
    var byK = {}; (B.items || []).forEach(function(x){ if (x.key) byK[x.key] = x; });
    var arcs = "", R = 47;
    CQ.forEach(function(Q, qi){
      var a0 = qi * 90, n = Q.k.length, step = 90 / n;
      Q.k.forEach(function(k, i){
        var x = byK[k], s0 = a0 + i * step + 2.2, s1 = a0 + (i + 1) * step - 2.2;
        arcs += '<path class="bck ' + (x ? (SC[x.state] || "n") : "n") + (C.q[qi] && C.q[qi].wait ? " w" : "") + '" data-bbk="' + k + '" d="M' + pt(s0, R) + ' A' + R + ' ' + R + ' 0 0 1 ' + pt(s1, R) + '"><title>' + e(x ? x.name + " " + x.state : k) + '</title></path>';
      });
    });
    var nums = [[0, "12"], [90, "3"], [180, "6"], [270, "9"]].map(function(z){ var p = pt(z[0], 33).split(" "); return '<text x="' + p[0] + '" y="' + (+p[1] + 4) + '">' + z[1] + '</text>'; }).join("") +
      '<text x="60" y="38" class="bck-12">출발·터짐</text>';   // 12시 = 출발점이자 한 바퀴 끝(다 울었음)
    var ang = C.hh / 12 * 360, tip = pt(ang, 38).split(" ");
    return '<svg class="bck-svg" viewBox="0 0 120 120" role="img" aria-label="버블 시계 ' + e(C.label) + '"><circle cx="60" cy="60" r="56" class="bck-face"/>' + arcs + nums +
      '<line x1="60" y1="60" x2="' + tip[0] + '" y2="' + tip[1] + '" class="bck-hand"/><circle cx="60" cy="60" r="4.5" class="bck-hub"/></svg>';
  }
  function dur(h){ var m = Math.round(h * 60); return m >= 60 ? (m / 60) + '시간' : m + '분'; }
  function chgLine(B, C){   // 어제 마지막 기록 → 지금
    var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bubble_log.json?t=" + Math.floor(Date.now() / 6e5);
    fetch(RAW).then(function(r){ return r.ok ? r.json() : null; }).then(function(L){
      var el = document.getElementById("bck-chg"); if (!el || !L || !L.length) return;
      var today = String(B.at || "").slice(0, 10), prev = null;
      for (var i = L.length - 1; i >= 0; i--) if (String(L[i].at || "").slice(0, 10) < today){ prev = L[i]; break; }
      if (!prev){ el.textContent = "어제 기록 없음 — 오늘부터 바늘 흐름을 적어요"; return; }
      var P = clockOf(prev.states || {}), d = C.hh - P.hh;
      // 왜 움직였나 — 바뀐 칸(최대 2개)을 「유가 🟢→🟠」처럼
      var ps = prev.states || {}, cs = stOf(B), why = [];
      CQ.forEach(function(Q){ Q.k.forEach(function(k){ if (ps[k] && cs[k] && ps[k] !== cs[k] && why.length < 2) why.push((KN[k] || k) + " " + ps[k] + "→" + cs[k]); }); });
      el.innerHTML = e(md(prev.at)) + ' 마지막 <b>' + e(P.label.replace(/^약 /, "")) + '</b> → 지금 <b>' + e(C.label.replace(/^약 /, "")) + '</b>' + (d > 0 ? ' <em class="up">▲' + dur(d) + '</em>' : d < 0 ? ' <em class="dn">▼' + dur(-d) + '</em>' : ' · 그대로') +
        (why.length ? '<small class="bck-why">' + e(why.join(" · ")) + '</small>' : '');
    }).catch(function(){});
  }
  // 🕰 11/11 「과거엔?」 — 기계 칸만으로 1999년부터 다시 돌린 시계(market/bubble_bt.json · src/bubble_bt.py)
  function pastLine(){
    var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/", t = "?t=" + Math.floor(Date.now() / 36e5);
    var gj = function(f){ return fetch(RM + f + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); };
    Promise.all([gj("bubble_bt.json"), gj("best_bt.json")]).then(function(Z){
      var R = Z[0], BT = Z[1], el = document.getElementById("bck-past"); if (!el || !R || !R.markets) return;
      var M = {}; R.markets.forEach(function(m){ M[m.key] = m; });
      var li = [];
      var fc = (R.free_crises || []).filter(function(c){ return !/지금/.test(c.name); }).map(function(c){ return c.name.replace(/ (\d{4}).*$/, " $1") + " " + c.max + "시"; }).join(" · ");
      if (fc) li.push('<li><b>과거 위기 때 바늘</b> — ' + e(fc) + (R.free_dist && R.free_dist["6"] != null ? ' · 6시를 넘은 날은 전체의 ' + R.free_dist["6"] + '%뿐' : '') + ' → <b>6시부터 조심, 9시면 위기 한복판</b>으로 읽어요.</li>');
      // 🏁 11/11 시장별 1등 방식 (best_bt.json — 앞·뒤 모두 보유를 이긴 것 중 전체 연수익 1등)
      var NMB = {"dd10": "고점 −10%", "dd15": "고점 −15%", "dd20": "고점 −20%", "ma200": "200일선 아래", "clock4.5": "버블 시계 4.5시", "clock6": "버블 시계 6시", "credit200": "신용 경보+200일선 아래",
                 "release": "판정 풀림", "floor3": "바닥 신호 3개", "floor14": "바닥 ①④", "ma200up": "200일선 위로", "off": "신호 꺼짐", "cash": "현금", "bond": "중기국채"};
      var nmb = function(k){ return /^current\+/.test(k) ? "지금 규칙 + " + (NMB[k.slice(8)] || k.slice(8)) : k === "current" ? "지금 규칙" : (NMB[k] || k); };
      if (BT && BT.markets) BT.markets.forEach(function(m){
        var b = m.best, flag = /kos/.test(m.key) ? "🇰🇷 " : "🇺🇸 ";
        li.push('<li><b>' + flag + e(m.name) + '</b> — ' + (b ? e(nmb(b.ent)) + ' → ' + e(nmb(b.exit)) + ' · ' + e(NMB[b.alt] || b.alt) + ' ' + Math.round(b.frac * 100) + '% · 연 ' + b.full.cagr + '% (그냥 들고 있기 ' + m.hold.cagr + '%) · 최대 낙폭 ' + String(b.full.mdd).replace('-', '−') + '% (' + String(m.hold.mdd).replace('-', '−') + '%)' : '판 ' + m.n + '개 중 앞·뒤 모두 보유를 이긴 방식이 없어 <b>그냥 들고 있기</b>') + '</li>');
      });
      el.innerHTML = '<summary>🕰 과거엔? — 1999년부터 다시 돌려 봄</summary><ul>' + li.join("") + '</ul><small>손 칸(FCF·CDS·규제)은 옛 자료가 없어 기계 칸으로 만든 대리 시계라 앱 시계보다 낮게 나와요 · 2012년까지 고르고 2013년부터 확인 · ' + e(String(R.at || "").slice(5, 10).replace("-", "/")) + ' 계산 · 매수·매도 추천 아님</small>';
      el.hidden = false;
    });
  }
  function clockBlock(B){
    var C = clockOf(stOf(B)); if (!C) return "";
    setTimeout(function(){ chgLine(B, C); pastLine(); }, 0);
    var rows = C.q.map(function(x, i){ return '<li class="' + (x.wait && x.comp > 0 ? "w" : x.comp >= 0.75 ? "r" : x.comp > 0 ? "o" : "g") + '"><span>' + e(x.t) + '</span><b>' + e(word(x)) + '</b></li>'; }).join("");
    return '<div class="bck">' + clockSVG(B, C) + '<div class="bck-t"><div class="bck-k">🕰 버블 시계</div><div class="bck-big">지금 ' + e(C.label) + '</div><ol>' + rows + '</ol><div class="bck-chg" id="bck-chg">어제와 비교 중…</div></div></div>' +
      '<p class="bck-ru">순서: 전병서 「AI 버블, 지금 몇 시인가」 틀(채권·신용이 주식보다 먼저 울어요) · 테두리는 단계마다 3시간씩(12→3 신용 · 3→6 금리·규제·유가 · 6→9 주식 속살·현금 도피 · 9→12 완충) · 바늘 = 네 단계가 운 만큼을 다 더한 것(🔴 1 · 🟠 ½) — 전부 울면 한 바퀴 돌아 12시 · 「절반」은 그 단계 3시간 중 절반 · 바늘 위치는 「어느 단계냐」가 아니라 「얼마나 많이 우나」예요(어느 칸이 우는지는 테두리 색) · 11/11 손질: 앞 단계가 ¾ 울어야 다음 단계를 더하던 규칙을 없앰(과거 위기 때 바늘이 4시 반에 묶였음) · 테두리 칸을 누르면 그 칸 근거 · 생각의 틀 — 사라·팔라는 뜻 아님</p><details class="bck-past" id="bck-past" hidden></details>';
  }

  window.__bubCard = function(B){
    if (!B || !B.items || !B.items.length) return "";
    var n = (B.red || 0) + (B.orange || 0) + (B.green || 0) || B.items.length;
    var bar = [["r", B.red], ["o", B.orange], ["g", B.green]].map(function(x){ return x[1] ? '<i class="bbx-b' + x[0] + '" style="flex:' + x[1] + '"></i>' : ""; }).join("");
    var cnt = '<span class="bbx-n"><b class="r">🔴 ' + (B.red || 0) + '</b><b class="o">🟠 ' + (B.orange || 0) + '</b><b class="g">🟢 ' + (B.green || 0) + '</b>' + (B.credit_on ? '<em>신용 경보 켜짐</em>' : '') + '</span>';
    var dates = (B.dates || []).slice(0, 3).map(function(d){ var dd = dday(d.d); return '<li><b>' + e(md(d.d)) + (dd ? ' <em>' + dd + '</em>' : '') + '</b><span>' + e(d.t) + '<small>' + e(d.why) + '</small></span></li>'; }).join("");
    var groups = {}; B.items.forEach(function(x){ (groups[x.grp || "바늘"] = groups[x.grp || "바늘"] || []).push(x); });
    var det = ["신용", "바늘", "완충"].filter(function(g){ return groups[g]; }).map(function(g){
      return '<div class="bbx-g"><div class="bbx-gh">' + e(GN[g] || g) + '</div><ul>' + groups[g].map(function(x){
        return '<li class="' + (SC[x.state] || "") + '" data-bbk="' + e(x.key || "") + '"><i>' + e(x.state) + '</i><div><b>' + e(x.name) + ' <small>기준: ' + e(x.th) + '</small></b><p>' + e(x.now) + '</p><small class="bbx-src">' +
          (x.auto ? '<em class="a">자동</em> 야후 종가 · ' + e(String(x.at || "").slice(5, 16).replace("-", "/")) : '<em>손</em> ' + e(x.src) + ' · ' + e(md(x.at))) + '</small></div></li>';
      }).join("") + '</ul></div>';
    }).join("");
    var fr = B.frame ? '<details class="bbx-f"><summary>이 틀은 어디서? — ' + e(B.frame.title) + '</summary><ul>' + (B.frame.lines || []).map(function(l){ return '<li>' + e(l) + '</li>'; }).join("") + '</ul></details>' : "";
    return '<section class="card bbx" id="bubble" data-cz="done">' +
      '<div class="bbx-h">🫧 버블 경보판 <small>' + e(md(B.at)) + ' ' + e(String(B.at || "").slice(11, 16)) + ' · 주식보다 채권이 먼저 울어요</small></div>' +
      clockBlock(B) + cnt +
      '<p class="bbx-lead' + (B.credit_on || B.red >= 3 ? " warn" : "") + '">' + e(B.lead) + '</p>' + (B.sub ? '<p class="bbx-sub">' + e(B.sub) + '</p>' : '') +
      (dates ? '<ul class="bbx-d">' + dates + '</ul>' : '') +
      '<details class="bbx-det"><summary>' + n + '칸 펼치기 · 무엇이 울고 있나</summary>' + det + fr +
      '<p class="note bbx-ru">자동 칸 기준 — 신용: 하이일드÷국채(HYG/IEF) 20일 −1.5%↓ 🔴 · −0.5%↓ 🟠 / 10년물 5% 위 5일 연속 🔴 · 4.75%↑ 🟠 / 브렌트 100$ 🔴 · 90$ 🟠 / 평균 종목(동일가중 S&P) 1년 고점 −15% 🔴 · −8% 🟠 / ' +
      '현금 도피 = 나스닥100 하루 −5%↓ + 방어주도 하락 + 신용 악화 🔴 · 방어주가 기술주보다 20일 +3%p = 업종 갈아타기 🟠. 생각의 틀이에요 — 포트 비중·현금 규칙은 이 판 혼자 바꾸지 않아요(현금은 🐻 계기판) · 매수·매도 추천 아님.</p></details></section>';
  };

  var css = document.createElement("style");
  css.textContent =
    ".bbx{padding:16px 16px 14px!important}.bbx-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bbx-h small{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--sub)}" +
    ".bbx-bar{display:flex;gap:3px;height:8px;margin:12px 0 8px;border-radius:6px;overflow:hidden}.bbx-bar i{display:block;min-width:6px}.bbx-br{background:#e5484d}.bbx-bo{background:#f59e0b}.bbx-bg{background:#30a46c}" +
    ".bbx-n{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font-size:13px}.bbx-n b{font-weight:800}.bbx-n em{font-style:normal;font-size:12px;font-weight:800;color:#e5484d;padding:2px 8px;border-radius:999px;background:rgba(229,72,77,.12)}" +
    ".bbx-lead{margin:10px 0 0;font-size:14px;font-weight:700;line-height:1.5;word-break:keep-all}.bbx-lead.warn{color:var(--text)}.bbx-sub{margin:4px 0 0;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    ".bbx-d{list-style:none;margin:12px 0 0;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08))}.bbx-d li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.4}.bbx-d li+li{margin-top:8px}" +
    ".bbx-d li>b{flex:0 0 64px;font-weight:900}.bbx-d li>b em{display:block;font-style:normal;font-size:11px;color:#f59e0b}.bbx-d li>span{flex:1;min-width:0;font-weight:700;word-break:keep-all}.bbx-d small{display:block;font-weight:500;color:var(--sub);font-size:12px;margin-top:2px}" +
    ".bbx-det{margin-top:12px}.bbx-det>summary,.bbx-f>summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--accent,#3987e5);list-style:none}.bbx-det>summary::-webkit-details-marker,.bbx-f>summary::-webkit-details-marker{display:none}" +
    ".bbx-g{margin-top:12px}.bbx-gh{font-size:12px;font-weight:800;color:var(--sub);margin-bottom:6px}.bbx-g ul{list-style:none;margin:0;padding:0}" +
    ".bbx-g li{display:flex;gap:8px;padding:9px 10px;border-radius:10px;background:var(--panel,rgba(127,127,127,.06))}.bbx-g li+li{margin-top:6px}.bbx-g li.r{box-shadow:inset 3px 0 0 #e5484d}.bbx-g li.o{box-shadow:inset 3px 0 0 #f59e0b}.bbx-g li.g{box-shadow:inset 3px 0 0 #30a46c}" +
    ".bbx-g li>i{font-style:normal;flex:0 0 auto}.bbx-g li>div{flex:1;min-width:0}.bbx-g li b{font-size:13px;font-weight:800}.bbx-g li b small{font-weight:600;color:var(--sub);font-size:11px;margin-left:4px}" +
    ".bbx-g li p{margin:3px 0 0;font-size:13px;line-height:1.45;word-break:keep-all;overflow-wrap:anywhere}.bbx-src{display:block;margin-top:3px;font-size:11px;color:var(--sub)}.bbx-src em{font-style:normal;font-weight:800;padding:0 5px;border-radius:5px;background:rgba(127,127,127,.18)}.bbx-src em.a{background:rgba(57,135,229,.18)}" +
    ".bbx-f{margin-top:12px}.bbx-f ul{margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.5;word-break:keep-all}.bbx-f li+li{margin-top:4px}.bbx-ru{margin-top:12px!important}";
  css.textContent +=
    ".bck{display:flex;gap:12px;align-items:center;margin:12px 0 8px}.bck-svg{flex:0 0 112px;width:112px;height:112px}" +
    ".bck-face{fill:var(--panel,rgba(127,127,127,.08));stroke:rgba(127,127,127,.25);stroke-width:1}.bck-svg text{font-size:10px;font-weight:800;fill:var(--sub);text-anchor:middle}" +
    ".bck-svg path.bck{fill:none;stroke-width:9;cursor:pointer}.bck-svg path.r{stroke:#e5484d}.bck-svg path.o{stroke:#f59e0b}.bck-svg path.g{stroke:#30a46c}.bck-svg path.n{stroke:rgba(127,127,127,.35)}.bck-svg path.w{opacity:.32;stroke-dasharray:3 2}.bck-svg text.bck-12{font-size:6.5px;font-weight:700;opacity:.8}" +
    ".bck-past{margin:0 0 10px;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08))}.bck-past>summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--accent,#3987e5);list-style:none}.bck-past>summary::-webkit-details-marker{display:none}" +
    ".bck-past ul{margin:8px 0 6px;padding-left:16px;font-size:12.5px;line-height:1.5;word-break:keep-all}.bck-past li+li{margin-top:5px}.bck-past>small{display:block;font-size:11px;color:var(--sub);line-height:1.4;word-break:keep-all}" +
    ".bck-t ol li.w b{color:var(--sub)}.bck-why{display:block;margin-top:2px;font-size:11px;color:var(--sub)}" +
    ".bck-hand{stroke:var(--text,#111);stroke-width:3.2;stroke-linecap:round}.bck-hub{fill:var(--text,#111)}" +
    ".bck-t{flex:1;min-width:0}.bck-k{font-size:12px;font-weight:800;color:var(--sub)}.bck-big{font-size:21px;font-weight:900;letter-spacing:-.4px;margin:1px 0 6px}" +
    ".bck-t ol{list-style:none;margin:0;padding:0;font-size:12px;line-height:1.35}.bck-t ol li{display:flex;justify-content:space-between;gap:6px}.bck-t ol li+li{margin-top:2px}.bck-t ol li span{color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bck-t ol li b{font-weight:800;white-space:nowrap}" +
    ".bck-t ol li.r b{color:#e5484d}.bck-t ol li.o b{color:#d97706}.bck-t ol li.g b{color:#30a46c}" +
    ".bck-chg{margin-top:6px;font-size:12px;color:var(--sub)}.bck-chg b{color:var(--text)}.bck-chg em{font-style:normal;font-weight:800}.bck-chg em.up{color:#e5484d}.bck-chg em.dn{color:#30a46c}" +
    ".bck-ru{margin:0 0 8px;font-size:11px;line-height:1.45;color:var(--sub);word-break:keep-all}.bbx-g li.bck-hl{outline:2px solid var(--accent,#3987e5);outline-offset:1px}";
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest(".bck-svg [data-bbk]"); if (!t) return;
    var card = t.closest(".bbx"); if (!card) return;
    var det = card.querySelector(".bbx-det"); if (det) det.open = true;
    var li = card.querySelector('.bbx-g li[data-bbk="' + t.getAttribute("data-bbk") + '"]'); if (!li) return;
    li.scrollIntoView({behavior: "smooth", block: "center"}); li.classList.add("bck-hl"); setTimeout(function(){ li.classList.remove("bck-hl"); }, 1800);
  }, true);
  document.head.appendChild(css);
  if (window.__h2apply) try { __h2apply(); } catch(x) {}
})();
;
__bk(76);
/* ======== ux1112.js ======== */
/* 🧭 11/12 계절 시계 — 사용자 「5개 국가 각각의 지수들을 백테스트 해서 현금 비중을 늘려야 할 때·주식 비중을 늘려야 할 때를 시계나 보기 쉬운 그림으로」
   market-strategy-report/market/season.json (src/season_bt.py · 평일 07:20·16:50) → 🏠 오늘 홈, 🫧 버블 경보판 아래 카드
   시계 = 주가 흐름 계절 6칸(달력 아님 — 11/12 사용자 「실제 달력 부분은 빼자」) · 칸 색 = 3개월 뒤 올라 있던 비율 · 바늘 = 지금 계절
   🧭 11/12 A11/12-1 계절 띠(사용자 「1번 진행」): 지수 9줄 글자 목록 → 지수마다 지난 2년 주별 계절 색 띠 한 줄(season.json trail · 만드는 쪽 변경 없음)
      띠를 누르면 그 주 계절·몇 주째 풍선 · 이름·오른쪽 글자를 누르면 지금처럼 시계·성적 펼침
      「그냥 들기」 글자 → 「계절은 참고만」·「🏁 시장별 방식」(한국·미국은 🏁 시장별 방식을 따름 — 같은 화면 한 목소리) */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/season.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return String(v).replace("-", "−"); }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"}, CN = {kr: "한국", jp: "일본", cn: "중국", hk: "홍콩", us: "미국"};
  var SN = {spring: ["🌱", "봄", "바닥에서 올라오는 중"], summer: ["☀️", "여름", "오르는 추세"], hot: ["🔥", "늦여름", "과열"], autumn: ["🍂", "가을", "꺾이는 중"], winter: ["❄️", "겨울", "내리는 추세"], base: ["🌤", "늦겨울", "바닥 다지는 중"]};
  var SHORT = {hold: "그냥 들고 있기", hal0: "11~4월만 주식", hal: "5~10월엔 절반만", halma: "11~4월 주식 · 여름엔 추세 좋을 때 절반", halma2: "11~4월 주식 · 여름엔 추세 좋을 때만",
               deep: "10개월선 위면 주식 · 많이 싸면 절반", floor: "하락장엔 현금 → 바닥 신호마다 담기", ma10: "10개월선 위면 주식", ma10h: "10개월선 아래면 절반", step2: "신호 2개 계단", step3: "신호 3개 계단",
               mom12: "1년 전보다 높으면 주식", ddl: "−10% 절반 · −20% 현금", season: "계절표", bear: "하락장이면 현금", halbear: "11~4월 + 하락장 아님", halbear2: "달력·하락장 둘 다 보기"};
  function pt(r, deg){ var a = (deg - 90) * Math.PI / 180; return [(60 + r * Math.cos(a)).toFixed(1), (60 + r * Math.sin(a)).toFixed(1)]; }
  function wedge(r0, r1, a0, a1){ var p = pt(r1, a0), q = pt(r1, a1), s = pt(r0, a1), t = pt(r0, a0); return "M" + p + "A" + r1 + " " + r1 + " 0 0 1 " + q + "L" + s + "A" + r0 + " " + r0 + " 0 0 0 " + t + "Z"; }
  function mcls(v){ return v >= 1.5 ? "g2" : v >= 0.3 ? "g1" : v > -0.3 ? "z" : v > -1 ? "r1" : "r2"; }
  // 🧭 11/12 사용자 「실제 달력 부분은 빼자」 → 시계 = 주가 흐름 계절 6칸(달력 아님) · 칸 색 = 그 계절에서 3개월 뒤 올라 있던 비율 · 바늘 = 지금 계절
  var ORD = ["spring", "summer", "hot", "autumn", "winter", "base"];
  function ucls(v){ return v == null ? "z" : v >= 65 ? "g2" : v >= 57 ? "g1" : v >= 50 ? "z" : v >= 45 ? "r1" : "r2"; }
  function dial(m){
    var by = {}; (m.states || []).forEach(function(x){ by[x.st] = x; });
    var g = "", cur = ORD.indexOf(m.now.st);
    ORD.forEach(function(k, i){
      var a0 = i * 60 + 1.5, a1 = i * 60 + 58.5, x = by[k] || {}, ep = pt(37, i * 60 + 30);
      g += '<path class="sc-m ' + ucls(x.up60) + (i === cur ? " cur" : "") + '" d="' + wedge(20, 52, a0, a1) + '"/><text class="sc-me" x="' + ep[0] + '" y="' + (+ep[1] - 1) + '">' + SN[k][0] + '</text><text class="sc-ml" x="' + ep[0] + '" y="' + (+ep[1] + 9) + '">' + (x.up60 != null ? x.up60 + "%" : "–") + '</text>';
    });
    var ang = cur * 60 + Math.min(54, 6 + (m.now.days || 0) * 1.2), np = pt(52, ang), nb = pt(6, ang);
    var s = SN[m.now.st] || ["", "", ""];
    return '<svg class="sc-svg" viewBox="0 0 120 120" role="img" aria-label="' + e(m.name) + ' 흐름 시계 — 지금 ' + e(s[1]) + '">' + g +
      (cur >= 0 ? '<line class="sc-nd" x1="' + nb[0] + '" y1="' + nb[1] + '" x2="' + np[0] + '" y2="' + np[1] + '"/><circle class="sc-nd" cx="60" cy="60" r="3.2"/>' : '') + '</svg>';
  }
  // 🧭 A11/12-1 계절 띠 — trail = [[주 날짜, 계절 번호(ORD 순)], …] 지난 104주
  var BM = {kospi: "흔들리면 전부 현금", kosdaq: "버블 시계 6시면 전부 현금", sp500: "흔들리면 절반만 채권", nasdaq: "그냥 들고 있기"};   // 🏁 시장별 방식(home2.js METH 와 같은 이름)
  var SC = {spring: "#8ccf6a", summer: "#f0c64a", hot: "#f08a3c", autumn: "#a8744a", winter: "#3f78d1", base: "#9ccbee"};
  function runs(t){ var R = []; (t || []).forEach(function(x, i){ var k = ORD[x[1]]; if (R.length && R[R.length - 1].k === k) R[R.length - 1].n++; else R.push({k: k, d: x[0], i: i, n: 1}); }); return R; }
  function band(m){
    var t = m.trail || [], N = t.length; if (!N) return '<span class="sc-band"></span>';
    var g = runs(t).map(function(r){ var a = (r.i / N * 100).toFixed(2), b = ((r.i + r.n) / N * 100).toFixed(2); return SC[r.k] + " " + a + "% " + b + "%"; }).join(",");
    return '<span class="sc-band" data-scb="' + e(m.key) + '" role="img" aria-label="' + e(m.name) + ' 지난 2년 계절 띠" style="background:linear-gradient(90deg,' + g + ')"><i></i></span>';
  }
  function md2(d){ var x = String(d).split("-"); return (+x[1]) + "/" + (+x[2]); }
  function axis(ms){
    var t = (ms[0] && ms[0].trail) || [], N = t.length, h = "";
    t.forEach(function(x, i){ var mo = x[0].slice(5, 7), pm = i ? t[i - 1][0].slice(5, 7) : ""; if (i && mo !== pm && (mo === "01" || mo === "07") && i / N < 0.78) h += '<i style="left:' + (i / N * 100).toFixed(1) + '%">' + (mo === "01" ? "’" + x[0].slice(2, 4) : "7월") + '</i>'; });
    return '<div class="sc-ax"><span></span><span class="sc-axb">' + h + '<i class="r">지금</i></span><span></span></div>';
  }
  function tip(el, ev){
    var S = window.__seasonData, k = el.dataset.scb, m = S && (S.markets || []).filter(function(x){ return x.key === k; })[0]; if (!m) return;
    var t = m.trail || [], N = t.length, rc = el.getBoundingClientRect(), f = Math.max(0, Math.min(0.999, (ev.clientX - rc.left) / rc.width)), i = Math.floor(f * N);
    var R = runs(t), j = 0; R.forEach(function(r, q){ if (i >= r.i && i < r.i + r.n) j = q; });
    var r = R[j], p = R[j - 1], nx = R[j + 1], s = SN[r.k];
    var txt = '<b>' + e(m.name) + ' · ' + s[0] + ' ' + s[1] + '</b> ' + md2(r.d) + ' 주부터 ' + (nx ? r.n + '주 → 다음 ' + SN[nx.k][0] + ' ' + SN[nx.k][1] : '지금까지 ' + r.n + '주째') + (p ? ' <small>(그 전 ' + SN[p.k][0] + ' ' + SN[p.k][1] + ' ' + p.n + '주)</small>' : '');
    var card = el.closest(".sc"), tp = card && card.querySelector(".sc-tip"); if (!tp) return;
    tp.innerHTML = txt; tp.hidden = false;
    var row = el.closest(".sc-r"); row.parentNode.insertBefore(tp, row.nextSibling);
    clearTimeout(tp._t); tp._t = setTimeout(function(){ tp.hidden = true; }, 6000);
  }
  document.addEventListener("click", function(ev){
    var el = ev.target.closest && ev.target.closest(".sc-band[data-scb]"); if (el){ ev.preventDefault(); ev.stopPropagation(); tip(el, ev); return; }
    var a = ev.target.closest && ev.target.closest("[data-scbm]"); if (a){ ev.preventDefault(); var b = document.querySelector("#h2bear .bm") || document.getElementById("h2bear"); if (b) b.scrollIntoView({behavior: "smooth", block: "start"}); }
  }, true);
  function row(m){
    var b = m.best, M = m.meta && m.meta.all, s = SN[m.now.st] || ["", "", ""];
    var st = (m.states || []).filter(function(x){ return x.st === m.now.st; })[0] || {};
    var hold = b.k === "hold", w = b.w_now;
    var tb = (m.methods || []).map(function(x){ return '<tr class="' + (x.k === b.k ? "pk" : "") + '"><td>' + (x.both ? "✅ " : "") + e(SHORT[x.k] || x.name) + '</td><td>' + x.cagr + '%</td><td>' + mn(x.mdd) + '%</td><td>' + x.w_now + '%</td></tr>'; }).join("");
    var bm = BM[m.key];
    return '<details class="sc-r"><summary class="sc-bs"><span class="sc-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small class="sc-w w' + (hold ? "h" : w >= 100 ? 2 : w > 0 ? 1 : 0) + '">' + (hold ? (bm ? "🏁 시장별 방식" : "계절은 참고만") : "주식 " + w + "%") + '</small></span>' +
      band(m) + '<span class="sc-st"><b>' + s[0] + ' ' + e(s[1]) + '</b><small>' + m.now.days + '일째</small></span></summary>' +
      '<div class="sc-x"><div class="sc-d">' + dial(m) + '<ul class="sc-f">' +
        '<li><small>지금 ' + e(s[1]) + '일 때 3개월 뒤 올라 있던 비율</small><b>' + (st.up60 != null ? st.up60 + "%" : "–") + '</b><em>평균 ' + (st.avg60 > 0 ? "+" : "") + mn(st.avg60) + '%</em></li>' +
        '<li><small>200일선보다 · 1년 고점보다</small><b>' + (m.now.g200 > 0 ? "+" : "") + mn(m.now.g200) + '% · ' + mn(m.now.dd) + '%</b></li>' +
        '<li><small>이 계절이었던 날</small><b>전체의 ' + (st.share != null ? st.share : "–") + '%</b></li></ul></div>' +
      '<p class="sc-v">' + (hold ? '<b>이 시계로는 못 이김</b> — 주가 흐름 방식 ' + ((m.methods || []).length - 1) + '개 중 앞 절반·뒤 절반 둘 다 그냥 들고 있기(연 ' + b.cagr + '% · 가장 크게 잃은 폭 ' + mn(b.mdd) + '%)를 이긴 게 없어요.' + (bm ? ' <a class="sc-bm" href="#h2bear" data-scbm="1">→ ' + e(m.name) + ' 판단은 🏁 시장별 방식 「' + e(bm) + '」을 따라요 ›</a>' : ' 계절은 참고로만 보세요.')
        : '<b>' + e(b.name) + '</b> — 연 ' + b.cagr + '% (그냥 들고 있기 ' + M.hold_cagr + '%) · 가장 크게 잃은 폭 ' + mn(b.mdd) + '% (' + mn(M.hold_mdd) + '%) · 1년에 ' + b.sw_y + '번 바꿈 · 지금 <b>주식 ' + w + '%</b>') + '</p>' +
      '<details class="sc-t"><summary>방식 ' + (m.methods || []).length + '개 성적 보기 (' + e(String(M.from).slice(0, 4)) + '~)</summary><table><tr><th>방식</th><th>연수익</th><th>최대 낙폭</th><th>지금 주식</th></tr>' + tb + '</table><small>✅ = 앞 절반·뒤 절반 둘 다 그냥 들고 있기를 이김 · 현금 연 2% · 바꿀 때 0.1%</small></details></div></details>';
  }
  window.__seasonCard = function(S){
    if (!S || !S.markets) return "";
    var ms = S.markets.filter(function(m){ return m.best && m.states; }); if (!ms.length) return "";
    var cnt = {}; ms.forEach(function(m){ cnt[m.now.st] = (cnt[m.now.st] || 0) + 1; });
    var lead = ORD.filter(function(k){ return cnt[k]; }).map(function(k){ return SN[k][0] + " " + SN[k][1] + " " + cnt[k] + "곳"; }).join(" · ");
    var hold = ms.filter(function(m){ return m.best.k === "hold"; }), win = ms.filter(function(m){ return m.best.k !== "hold"; });
    var out = axis(ms) + ms.map(row).join("") + '<div class="sc-tip" hidden></div>';
    var rec = ms.filter(function(m){ return m.now.days <= 10; }).sort(function(a, b){ return a.now.days - b.now.days; }).map(function(m){ return FL[m.nat] + " " + m.name + " " + SN[m.now.st][0] + " " + SN[m.now.st][1] + " " + m.now.days + "일째"; });
    return '<section class="card sc" id="season" data-cz="done"><div class="sc-h">🧭 계절 시계 <small>' + e(String(S.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="sc-lead">지수 ' + ms.length + '개 지금 — ' + e(lead) + '</p>' + out + (rec.length ? '<p class="sc-rec">🔄 최근 계절이 바뀐 곳 — ' + e(rec.join(" · ")) + '</p>' : '') +
      '<p class="sc-sum">여기서 계절은 달력이 아니라 <b>주가 흐름에 붙인 이름</b>이에요(200일선·50일선 위냐 아래냐). 흐름만 보고 주식·현금을 오가는 방식 ' + ((ms[0].methods || []).length - 1) + '개를 다시 돌려 보니, ' + (win.length ? '<b>' + win.map(function(m){ return m.name; }).join("·") + '</b>에서만 꾸준히 통했고 ' : '') + '나머지 ' + hold.length + '개는 그냥 들고 있기를 못 이겼어요 — 그래서 한국·미국은 🏁 시장별 방식을 따르고, 계절은 <b>흐름이 어디쯤인지</b> 보는 데 써요.</p>' +
      '<div class="sc-lg"><span>띠 = 지난 2년, 주마다 그 주의 계절 · 띠를 누르면 몇 주째인지</span>' + ORD.map(function(k){ return '<span><i style="background:' + SC[k] + '"></i>' + SN[k][1] + '</span>'; }).join("") + '</div>' +
      '<div class="sc-lg"><span>이름을 누르면 시계 — 칸 색 = 그 계절에서 3개월 뒤 올라 있던 비율</span><span><i class="g2"></i>65%↑</span><span><i class="g1"></i>57%↑</span><span><i class="z"></i>50%↑</span><span><i class="r1"></i>45%↑</span><span><i class="r2"></i>그 아래</span></div>' +
      '<p class="sc-note">읽는 법: 시계는 🌱 봄(바닥에서 올라옴) → ☀️ 여름(오름) → 🔥 늦여름(과열) → 🍂 가을(꺾임) → ❄️ 겨울(내림) → 🌤 늦겨울(바닥 다지기) 순서로 돌고, 바늘이 지금 자리예요. 과거 통계로 확률을 보려는 것이지 맞히는 게 아니에요. 가격지수(배당 제외) · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".sc-h{font-size:17px;font-weight:900}.sc-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.sc-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.sc-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.sc-sum b{color:var(--text,inherit)}" +
    ".sc-g{margin:12px 0 2px;font-size:12.5px;font-weight:800;color:var(--sub)}.sc-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.sc-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}.sc-r>summary::-webkit-details-marker{display:none}" +
    ".sc-n{min-width:0}.sc-n b{font-size:14.5px;font-weight:900}.sc-n small{display:block;font-size:12px;color:var(--sub);font-weight:700;margin-top:1px;word-break:keep-all}.sc-w{flex:0 0 auto;text-align:right}.sc-w b{display:inline-block;font-size:13.5px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap}.sc-w.w2 b{background:rgba(48,164,108,.16);color:#1f8a57}.sc-w.w1 b{background:rgba(240,160,60,.2);color:#b86a00}.sc-w.w0 b{background:rgba(229,72,77,.15);color:#d13438}.sc-w.wh b{background:rgba(127,127,127,.16);color:var(--sub)}.sc-m.cur{stroke:var(--text,#111);stroke-width:2}.sc-me{font-size:11px;text-anchor:middle}.sc-w i{display:block;font-style:normal;font-size:10.5px;color:var(--sub);font-weight:700;margin-top:2px}" +
    ".sc-x{margin-top:10px}.sc-d{display:flex;gap:10px;align-items:center}.sc-svg{width:132px;height:132px;flex:0 0 auto}.sc-m.g2{fill:#30a46c}.sc-m.g1{fill:#9bd8b7}.sc-m.z{fill:rgba(127,127,127,.28)}.sc-m.r1{fill:#f3b0a4}.sc-m.r2{fill:#e5484d}" +
    ".sc-ml{font-size:8px;font-weight:800;text-anchor:middle;fill:#1b1f24}.sc-o.on{fill:#1f8a57}.sc-o.half{fill:#e0a030}.sc-o.off{fill:rgba(127,127,127,.25)}.sc-nd{stroke:var(--text,#111);stroke-width:2.4;stroke-linecap:round;fill:var(--text,#111)}.sc-ce{font-size:15px;text-anchor:middle}.sc-cn{font-size:8.5px;font-weight:800;text-anchor:middle;fill:var(--text,#111)}" +
    ".sc-f{list-style:none;margin:0;padding:0;flex:1;min-width:0}.sc-f li{padding:4px 0}.sc-f li+li{border-top:1px solid rgba(127,127,127,.18)}.sc-f small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;line-height:1.3;word-break:keep-all}.sc-f b{font-size:15px;font-weight:900}.sc-f em{font-style:normal;font-size:11.5px;color:var(--sub);margin-left:5px}" +
    ".sc-v,.sc-c{margin:8px 0 0;font-size:13px;line-height:1.55;word-break:keep-all}.sc-c{padding:8px 10px;border-radius:10px;background:rgba(240,160,60,.13)}" +
    ".sc-t{margin-top:8px}.sc-t>summary{cursor:pointer;font-size:12.5px;font-weight:800;color:var(--accent,#3182f6)}.sc-t table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11.5px}.sc-t th,.sc-t td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.sc-t th:first-child,.sc-t td:first-child{text-align:left;white-space:normal;word-break:keep-all}.sc-t tr.pk td{font-weight:900}.sc-t small{display:block;margin-top:4px;font-size:11px;color:var(--sub);line-height:1.4}" +
    ".sc-lg{display:flex;flex-wrap:wrap;gap:4px 10px;margin:12px 0 0;font-size:11px;color:var(--sub);font-weight:700}.sc-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}.sc-lg .g2{background:#30a46c}.sc-lg .g1{background:#9bd8b7}.sc-lg .z{background:rgba(127,127,127,.28)}.sc-lg .r1{background:#f3b0a4}.sc-lg .r2{background:#e5484d}.sc-lg .o{background:#1f8a57;height:4px;vertical-align:2px}" +
    ".sc-note{margin:8px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    /* 🧭 A11/12-1 계절 띠 */
    ".sc-rec{margin:10px 0 6px;font-size:12.5px;font-weight:800;line-height:1.45;word-break:keep-all}" +
    ".sc-ax,.sc-r>summary.sc-bs{display:grid;grid-template-columns:98px minmax(0,1fr) 54px;gap:7px;align-items:center}.sc-r>summary.sc-bs{justify-content:normal}" +
    ".sc-ax{margin:10px 0 -2px;padding:0 12px;font-size:10px;font-weight:800;color:var(--sub)}.sc-axb{position:relative;height:13px}.sc-axb i{position:absolute;top:0;font-style:normal;transform:translateX(-50%);white-space:nowrap}.sc-axb i.r{right:0;transform:none}" +
    ".sc-r{padding:7px 12px;margin-top:5px}.sc-bs .sc-n b{font-size:13px;white-space:nowrap}.sc-bs .sc-n{white-space:nowrap;overflow:hidden}.sc-bs .sc-n small.sc-w{display:block;text-align:left;background:none;padding:0;font-size:10.5px;font-weight:800;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sc-bs small.sc-w.w2{color:#1f8a57}.sc-bs small.sc-w.w1{color:#b86a00}.sc-bs small.sc-w.w0{color:#d13438}.sc-bs small.sc-w.wh{color:var(--sub)}" +
    ".sc-band{position:relative;display:block;height:18px;border-radius:5px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(127,127,127,.18)}.sc-band i{position:absolute;right:-3px;top:-3px;bottom:-3px;width:3px;border-radius:2px;background:var(--text,#111)}" +
    ".sc-st{text-align:right;min-width:0}.sc-st b{display:block;font-size:12.5px;font-weight:900;white-space:nowrap}.sc-st small{display:block;font-size:10.5px;font-weight:700;color:var(--sub)}" +
    ".sc-tip{margin:6px 0 2px;padding:8px 10px;border-radius:10px;font-size:12.5px;line-height:1.5;background:rgba(49,130,246,.12);word-break:keep-all}.sc-tip small{color:var(--sub)}" +
    ".sc-bm{display:inline;color:var(--accent,#3182f6);font-weight:800;text-decoration:none}";
  document.head.appendChild(css);
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__seasonData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
;
__bk(77);
/* ======== ux1111.js ======== */
/* 🔭 11/11 신호 탭 「지켜보는 중」 모드 (A11/11-2 · 사용자 「둘 다 진행」)
   코스피가 🐻 하락장(현금 100% · 새로 사지 않기)인 동안 신호 탭(🐋 고래 · ☕ 컵 · 📈 갭 · 🔎 거르기 · ⚡ 단타 · 🤫 매집)이 같은 말을 하도록:
   ─ 머리에 「🐻 지금은 지켜보는 중」 띠 (첫 화면 「국내 주식 → 새로 사지 않기」와 한 목소리)
   ─ 🇰🇷 한국 종목 이름 옆에 「🔭 지켜봄」 꼬리표 — 카드는 숨기지 않음 · 미국·일본 종목은 그대로
   ─ 「🔭 하락장 동안 쌓인 한국 신호 n개」 목록(만드는 쪽 bear_watch.py → archive/x/bear_watch.json · 앱은 그리기만)
   ─ 판정이 풀리면 14일 동안 「하락장 동안 쌓인 신호 n개 ›」 한 줄만 (수익률 계산 없음 · 종목별 성적은 그 종목 화면 🧵)
   판정은 market/bear.json 코스피 칸 그대로(매시간) · 매수·매도 권유 아님 */
(function(){
  var SIG = {whale: 1, cup: 1, gap: 1, screen: 1, danta: 1, accum: 1, sigmore: 1};
  var RAWB = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bear.json";
  var KRA = /openOP\('(\d{6})(?:\.K[SQ])?'\)|m\.stock\.naver\.com\/domestic\/stock\/(\d{6})/;
  var KQ = null, BEAR = null, W = null, got = 0;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function tb(){ return Math.floor(Date.now() / 6e5); }
  function gj(u){ return fetch(u + (u.indexOf("?") < 0 ? "?" : "&") + "t=" + tb(), {cache: "no-store"}).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }
  function load(){
    if (got && Date.now() - got < 6e5) return Promise.resolve();
    return Promise.all([gj(RAWB), gj("archive/x/bear_watch.json")]).then(function(r){
      var k = r[0] && (r[0].markets || []).filter(function(m){ return m.key === "kospi"; })[0];
      BEAR = k || null; KQ = r[0] && (r[0].markets || []).filter(function(m){ return m.key === "kosdaq"; })[0] || null; W = r[1]; got = Date.now();
    });
  }
  function tab(){ return (typeof window.cur !== "undefined" && window.cur) || (location.hash || "").slice(1); }
  function isSig(){ return !!SIG[tab()] || !!document.querySelector("#main #sgleg"); }
  function bearOn(){ return BEAR && BEAR.state === "🐻"; }
  function endedRecent(){
    if (!W || !W.ended || bearOn()) return false;
    return (Date.now() - Date.parse(W.ended + "T00:00:00+09:00")) / 864e5 <= 14;
  }
  function row(r){
    return '<li><button type="button" data-bwc="' + e(r.c) + '"><div><b>' + e(r.n) + '</b> <small>' + e(r.c) + '</small></div><span>' + e((r.s || []).join(" · ")) + '</span>' +
      '<em>' + (r.first === r.last ? md(r.first) : md(r.first) + "~" + md(r.last)) + ' · ' + r.days + '일</em></button></li>';
  }
  function list(){
    if (!W || !W.rows || !W.rows.length) return "";
    W.rows.forEach(function(r){ if ((r.s || []).indexOf('☕ 컵 돌파') >= 0) r.s = r.s.filter(function(x){ return x !== '☕ 컵'; }); });
    var L = W.last_day, today = W.rows.filter(function(r){ return r.last === L; }), rest = W.rows.filter(function(r){ return r.last !== L; });
    return '<details class="bw-d"><summary>🔭 하락장 동안 쌓인 한국 신호 <b>' + W.n + '개</b>' + (W.new_last ? ' <i>' + md(L) + ' 새로 ' + W.new_last + '</i>' : '') + ' <u>▾</u></summary>' +
      (today.length ? '<div class="bw-gh">' + md(L) + '에 뜬 ' + today.length + '개</div><ul>' + today.map(row).join("") + '</ul>' : '') +
      (rest.length ? '<details class="bw-more"><summary>그 전에 떴던 ' + rest.length + '개 ▾</summary><ul>' + rest.slice(0, 80).map(row).join("") + '</ul>' + (rest.length > 80 ? '<p class="bw-n">＋ ' + (rest.length - 80) + '개 더(오래된 것)</p>' : '') + '</details>' : '') +
      '<p class="bw-n">' + md(W.rec_from) + '부터 앱 기록(하락장 시작 ' + md(W.from) + ') · ☕ 컵 · 📈 갭 · ⚡ 단타 · 🤫 매집에 뜬 🇰🇷 종목 · 누르면 그 종목 화면 · 수익률은 계산하지 않아요 — 종목별 성적은 그 종목 화면 🧵 · 기록일 뿐 사라는 뜻 아님</p></details>';
  }
  function banner(){
    if (bearOn()){
      return '<section class="bw-b" id="bw-b"><div class="bw-h">🐻 지금은 <b>지켜보는 중</b></div>' +
        '<p>코스피 하락장(고점 ' + e(BEAR.dd) + '% · ' + md(BEAR.asof) + ' 종가 판정) — 국내 주식은 ' + (BEAR.analog ? '코스피 <b>' + e(BEAR.analog.next) + '</b>' + (KQ && KQ.analog ? ' · 코스닥은 주식 ' + KQ.analog.stock + '%' : '') : '판정 풀릴 때까지 <b>새로 사지 않기</b>') + '. 이 탭의 🇰🇷 한국 종목엔 <span class="bw-tg">🔭 지켜봄</span> 꼬리표만 붙여 기록해요 · 미국·일본 종목은 그대로.</p>' + list() + '</section>';
    }
    if (endedRecent()){
      return '<section class="bw-b ok" id="bw-b"><div class="bw-h">✅ 코스피 하락장 판정 풀림 <small>' + md(W.ended) + '</small></div>' + list() + '</section>';
    }
    return "";
  }
  function apply(){
    var M = document.getElementById("main"); if (!M) return;
    var on = isSig() && (bearOn() || endedRecent());
    document.documentElement.classList.toggle("bw-on", !!(on && bearOn()));
    var old = document.getElementById("bw-b");
    if (!on){ if (old) old.remove(); return; }
    if (!old){
      var html = banner(); if (!html) return;
      var box = document.createElement("div"); box.innerHTML = html; var b = box.firstChild;
      var leg = M.querySelector("#sgleg"), hero = M.querySelector(".hero");
      if (hero && hero.parentNode === M) hero.insertAdjacentElement("afterend", b);
      else if (leg) leg.insertAdjacentElement("afterend", b);
      else M.insertBefore(b, M.firstChild);
    }
    if (!bearOn()) return;
    M.querySelectorAll("a[href]:not([data-bw])").forEach(function(a){
      a.setAttribute("data-bw", "1");
      if (a.closest("#bw-b")) return;
      if (KRA.test(a.getAttribute("href") || "")) a.classList.add("bw-kr");
    });
  }
  var T = 0;   // 모아서 한 번(계속 바뀌는 화면이 있어도 0.3초 안에 꼭 돌게 — 늦추기만 하면 굶음)
  function run(){ T = 0; if (!isSig()){ apply(); return; } load().then(apply); }
  function soon(){ if (!T) T = setTimeout(run, 300); }
  function boot(){
    var M = document.getElementById("main"); if (!M){ setTimeout(boot, 300); return; }
    new MutationObserver(function(ms){
      for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && t.closest("#bw-b")) continue; soon(); return; }
    }).observe(M, {childList: true, subtree: true});
    window.addEventListener("hashchange", soon); soon();
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-bwc]"); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    if (typeof window.openOP === "function") window.openOP(b.getAttribute("data-bwc"));
  }, true);

  var css = document.createElement("style");
  css.textContent =
    ".bw-b{margin:10px 0 12px;padding:13px 14px;border-radius:16px;background:rgba(229,72,77,.08);box-shadow:inset 0 0 0 1px rgba(229,72,77,.28)}.bw-b.ok{background:rgba(48,164,108,.08);box-shadow:inset 0 0 0 1px rgba(48,164,108,.3)}" +
    ".bw-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bw-h small{font-size:12px;color:var(--sub);font-weight:700;margin-left:4px}.bw-b>p{margin:6px 0 0;font-size:13px;line-height:1.5;word-break:keep-all}" +
    ".bw-tg{display:inline-block;font-size:11px;font-weight:800;padding:0 6px;border-radius:6px;background:rgba(127,127,127,.18);white-space:nowrap}" +
    ".bw-d{margin-top:10px}.bw-d>summary,.bw-more>summary{cursor:pointer;list-style:none;font-size:13px;font-weight:800;color:var(--accent,#3987e5)}.bw-d>summary::-webkit-details-marker,.bw-more>summary::-webkit-details-marker{display:none}" +
    ".bw-d>summary i{font-style:normal;font-size:11px;font-weight:800;color:#e5484d;margin-left:4px}.bw-d>summary u{text-decoration:none}" +
    ".bw-gh{margin:10px 0 4px;font-size:12px;font-weight:800;color:var(--sub)}.bw-d ul{list-style:none;margin:0;padding:0}.bw-d li+li{margin-top:4px}" +
    ".bw-d li button{all:unset;box-sizing:border-box;display:grid;grid-template-columns:1fr auto;gap:1px 8px;width:100%;padding:7px 10px;border-radius:10px;background:var(--panel,rgba(127,127,127,.07));cursor:pointer;font-size:13px}" +
    ".bw-d li div{grid-column:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bw-d li b{font-weight:800}.bw-d li small{color:var(--sub);font-size:11px}.bw-d li span{grid-column:1;font-size:12px;color:var(--sub)}.bw-d li em{grid-column:2;grid-row:1/3;align-self:center;font-style:normal;font-size:11px;color:var(--sub);white-space:nowrap}" +
    ".bw-more{margin-top:8px}.bw-n{margin:8px 0 0;font-size:11px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    "html.bw-on #main a.bw-kr::after{content:'🔭 지켜봄';display:inline-block;margin-left:5px;padding:0 5px;border-radius:6px;font-size:10px;font-weight:800;line-height:16px;vertical-align:1px;color:var(--sub);background:rgba(127,127,127,.18);white-space:nowrap}";
  document.head.appendChild(css);
  boot();
})();
;
__bk(78);
/* ======== ux1112b.js ======== */
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
    ["send",     "send",   "고객에게 한 장", "오늘 시장 그림 · 고객 질문 답"],
    ["prop",     "prop",   "제안서 만들기",   "이름·금액만 넣으면 PDF·PPT"],
    ["bond",     "prod",   "상품 찾기",       "채권 · 펀드 · ELS · 배당"],
    ["onepager", "stock",  "종목 보기",       "검색 · 리포트 · 수급"],
    ["lab",      "lab",    "연구실",          "포트 · 신호 · 세금 계산 · 운세"]
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
    return '<p class="jm-h">할 수 있는 일 <small>아래 탭과 같아요</small></p>' + (window.__secTile ? __secTile() : "") + '<div class="jm-g">' + JOBS.map(function(j){
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
    ["💼 내 포트", [["port", "💼", "포트", "지금 뭘 얼마나 담나"], ["score", "📊", "성적표", "맞았나 틀렸나"]]],
    ["🎯 신호", [["sigall", "🎯", "신호 한눈에", "큰손 · 컵 · 갭 · 오를 확률 한 화면"], ["screen", "🔎", "종목 찾기", "매일 아침 거름망"], ["sigmore", "🗂", "더 보기", "예측 채점 · 상세"]]],
    ["🧪 연구", [["@bubble", "🕰", "버블 시계 · 하락장 계기판", "오늘 탭 「자세히 보기」 안"], ["@season", "🧭", "계절 시계", "5개국 지수 흐름 · 3개월 뒤 확률"], ["@analog", "🔁", "닮은 장 백테스트", "지금과 닮았던 때 12번 · 그 뒤 2년"], ["@sigprob", "🎯", "신호 확률판", "경고·바닥 신호가 켜지면 실제로 몇 %"], ["@bt40", "📏", "40주선 백테스트", "지수·대표 주식"]]],
    ["🧾 세금", [["tax", "🧾", "세무계산기", "금융소득·건보료 · 연금 · 퇴직 · 해외주식 · ISA"]]],
    ["🔮 재미", [["luck", "🔮", "오늘의 운세", "생일만 넣으면"], ["saju", "📜", "사주 리포트", "PDF 저장"], ["tarot", "🃏", "타로", "질문 → 카드"], ["lotto", "🎱", "로또", "번호 분석"]]],
    ["⚙️ 앱", [["@wlbtn", "★", "관심종목", "담아 둔 종목"], ["@uibtn", "⚙️", "보기 설정", "글자 크기 · 화면 색"], ["alarm", "🔔", "알림", "켜고 끄기"], ["idea", "💬", "의견함", "바라는 점 남기기"], ["@help", "🙋", "뭐 보면 돼요?", "궁금한 것 → 그 화면으로"]]]
  ];
  window.hubView = function(key){
    if (key === "lab") return '<div id="hub" class="hub hub-lab" data-noemo="1">' + LABS.map(function(g){
      return '<section class="card hub-c" data-cz="done"><p class="hub-h">' + g[0] + '</p><div class="hub-l">' + g[1].map(function(x){
        return '<button type="button" data-hub="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small><i>›</i></button>'; }).join("") + '</div></section>'; }).join("") +
      '<p class="hub-n">깊이 보는 화면을 한곳에 모았어요 · 지운 것은 없어요</p></div>';
    return '<div id="hub" class="hub hub-send" data-noemo="1">' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">고객에게 한 장</p><p class="hub-p" id="hubone">오늘 시장을 그림 한 장으로 — 받는 분 이름을 넣으면 그 고객만을 위한 한 장이 돼요.</p>' +
        '<button type="button" class="hub-cta" data-hub="@one">📨 고객에게 한 장 보내기</button></section>' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">고객이 이렇게 물으면 <small id="hubqn"></small></p><div class="hub-q" id="hubq"><p class="hub-p">불러오는 중…</p></div>' +
        '<button type="button" class="hub-sub" data-hub="@qa">질문 전부 보기 ›</button></section>' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">다른 것도 한 장으로</p><div class="hub-l">' +
        [["diag", "🩻", "포트 진단 한 장", "고객 보유 종목 → 쏠림 · 배당 · 고점 대비"], ["tax", "🧾", "연말 절세 한 장", "세무계산기 결과 → 그림 한 장 (금융소득·건보료·연금·퇴직·해외주식)"], ["bond", "🏦", "채권 전망도 한 장", "국고채 · 미국채 · 브라질국채"], ["prop", "📝", "제안서", "성향 → 상품 → 금액 → PDF·PPT"], ["onepager", "🔍", "종목 한 장", "종목을 찾아 위 📨 누르기"]].map(function(x){
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
    // 🧭 11/16 사용자 「왜 두 개의 시황 한 장이 내용이 약간 다르지?」 — 여기만 아침 시황 한 줄(pbbrief.one, 「10:00 장중 기준」이라 붙었지만 실제는 11/13 종가 판정)을 따로 써서
    //   오늘 탭 결론 두 줄(verdict.js)과 문구가 달랐음 → 같은 결론 상자(data-vd)를 그대로 씀
    var o = document.getElementById("hubone"); if (o && !o.querySelector("[data-vd]")) o.innerHTML = '<div data-vd></div><small>받는 분 이름을 넣으면 그 고객만을 위한 한 장이 돼요</small>';
  };
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#hub [data-hub]"); if (!t) return; ev.stopPropagation();
    hubGo(t.dataset.hub);
  });
  window.__hubGo = hubGo;   // 🔎 11/12 메뉴 찾기(gsearch.js)도 같은 길로
  function hubGo(k){
    if (k === "@one"){ if (window.__onepage) (__onepage.chooser || __onepage.go)(null); return; }
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }
    if (k === "@wlbtn" || k === "@uibtn"){ var o = document.getElementById(k.slice(1)); if (o) o.click(); return; }
    if (k === "@help"){ if (window.__ezHelp) __ezHelp(); return; }
    if (k === "@bt40"){ location.href = "bt40.html"; return; }
    if (k === "@bubble" || k === "@season" || k === "@sigprob" || k === "@analog"){ var tid = k === "@season" ? "season" : k === "@sigprob" ? "sigprob" : k === "@analog" ? "analog" : "bubble"; if (typeof window.go === "function") go("home");
      var n = 0; (function seek(){ var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open");
        if (hb && !hb.classList.contains("ez-open") && op) op.click();
        var x = document.getElementById(tid); if (x){ x.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++n < 30) setTimeout(seek, 300); })(); return; }
    if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); }
  }

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
    "html[data-tab=send] #main>.hero,html[data-tab=lab] #main>.hero,html[data-tab=diag] #main>.hero,html[data-tab=sigall] #main>.hero{display:none!important}" +
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
;
__bk(79);
/* ======== ux1112c.js ======== */
/* CH Investing — ⬆ 언제나 접기 · ← 언제나 뒤로 (11/12 사용자 「언제나 접기, 뒤로 버튼 좀 만들어 좀」)
   ① ← 뒤로: 어느 화면에서든 늘 보이게 (첫 화면·스크롤 중에도 숨지 않음) — 동작은 그대로(goBack: 보던 곳 → 탭 첫 화면 → 오늘 → 맨 위)
   ② ▴ 접기(떠 있는 버튼): 지금 보고 있는 펼친 칸(details · 오늘 「자세히 보기」 · 「전체 보기」 카드)이 화면에 있으면 뒤로 버튼 옆에 나타남
      누르면 그 칸을 접고 그 칸 머리로 돌아감
   ③ 길게 펼친 칸(details) 맨 아래에도 「▴ 접기」 한 줄 */
(function(){
  "use strict";
  var FB = null, TGT = null, T = 0;
  function vis(el){ return el && el.offsetParent !== null && el.getClientRects().length; }
  // 펼쳐진 칸들 → {el, close}
  function opens(){
    var L = [];
    [].forEach.call(document.querySelectorAll("details[open]"), function(d){
      if (!vis(d) || d.offsetHeight < 140 || d.closest("#sheet .sh-top")) return;
      L.push({el: d, close: function(){ d.open = false; }, head: d.querySelector(":scope > summary") || d});
    });
    var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open");
    if (hb && op && hb.classList.contains("ez-open") && vis(hb)) L.push({el: hb, close: function(){ op.click(); }, head: op});
    [].forEach.call(document.querySelectorAll(".xs-cl"), function(b){
      var c = b.parentNode; if (!c || c.classList.contains("xs-clamp") || !/접기/.test(b.textContent) || !vis(c)) return;
      L.push({el: c, close: function(){ b.click(); }, head: c});
    });
    [].forEach.call(document.querySelectorAll("[data-ezclamp].ez-open1"), function(c){ if (vis(c)) L.push({el: c, close: function(){ c.classList.remove("ez-open1"); }, head: c}); });
    return L;
  }
  // 화면 가운데를 지나는 펼친 칸 중 가장 안쪽(작은) 것
  function pick(){
    var vh = window.innerHeight, best = null;
    opens().forEach(function(o){
      var r = o.el.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.35 && (!best || o.el.offsetHeight < best.el.offsetHeight)) best = o;
    });
    return best;
  }
  function upd(){
    T = 0;
    if (!FB) return;
    TGT = pick();
    FB.classList.toggle("on", !!TGT);
    var b = document.getElementById("backbtn");
    if (b){ b.classList.add("on"); b.classList.remove("root", "hid"); }
  }
  function soon(){ if (!T) T = setTimeout(upd, 120); }
  function make(){
    if (FB || !document.body) return;
    FB = document.createElement("button"); FB.id = "foldbtn"; FB.type = "button"; FB.setAttribute("aria-label", "접기");
    FB.innerHTML = "▴<span>접기</span>";
    FB.onclick = function(){
      var o = TGT || pick(); if (!o) return;
      var h = o.head; o.close();
      setTimeout(function(){ try { (h && vis(h) ? h : o.el).scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} soon(); }, 30);
    };
    document.body.appendChild(FB);
    upd();
  }
  // ③ 펼친 details 맨 아래 「▴ 접기」
  document.addEventListener("toggle", function(ev){
    var d = ev.target; if (!d || d.tagName !== "DETAILS") return;
    if (d.open && !d.querySelector(":scope > .fold-end")){
      setTimeout(function(){
        if (!d.open || d.offsetHeight < 320 || d.querySelector(":scope > .fold-end")) return;
        var b = document.createElement("button"); b.type = "button"; b.className = "fold-end"; b.textContent = "▴ 접기";
        b.onclick = function(e){ e.preventDefault(); e.stopPropagation(); d.open = false; var s = d.querySelector(":scope > summary") || d; try { s.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} };
        d.appendChild(b);
      }, 60);
    }
    soon();
  }, true);
  window.addEventListener("scroll", soon, {passive: true});
  window.addEventListener("resize", soon);
  document.addEventListener("click", function(){ setTimeout(soon, 80); }, true);
  window.addEventListener("popstate", function(){ setTimeout(soon, 200); });
  // 뒤로 버튼을 숨기는 다른 규칙(첫 화면 · 스크롤 내릴 때 · 쉬운 첫 화면)보다 이기게
  var css = document.createElement("style");
  css.textContent =
    "html body #backbtn,html body #backbtn.root,html.fab-hide body #backbtn,html body #backbtn.hid,html.ez-home[data-ez] body #backbtn,html[data-ez][data-tab] body #backbtn.root.on,html[data-ui][data-ez] body #backbtn.root,html[data-wow][data-wow][data-wow] body #backbtn.root,html[data-wow][data-wow][data-wow] body #backbtn{display:flex!important;opacity:1!important;transform:none!important;pointer-events:auto!important}" +
    "#foldbtn{position:fixed;right:118px;bottom:calc(env(safe-area-inset-bottom) + 74px);z-index:80;display:none;align-items:center;gap:6px;border:1px solid var(--line,rgba(127,127,127,.3));" +
      "background:rgba(18,24,38,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--text,#fff);font:inherit;font-size:18px;font-weight:800;padding:9px 14px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.35)}" +
    "#foldbtn span{font-size:14px}#foldbtn.on{display:flex}#foldbtn:active{transform:scale(.96)}" +
    ":root[data-ui=light] #foldbtn{background:#fff;color:#141a26;border-color:#dde2ea}" +
    ".fold-end{display:block;width:100%;margin:10px 0 2px;padding:9px;border:0;border-radius:10px;background:rgba(127,127,127,.1);color:var(--sub,#888);font:inherit;font-size:13px;font-weight:800;cursor:pointer}";
  document.head.appendChild(css);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", make); else make();
  setInterval(function(){ if (!document.hidden) soon(); }, 1500);
})();
;
__bk(80);
/* ======== ux1112d.js ======== */
/* 🎯 11/12 신호 확률판 — 사용자 「어떤 신호가 왔을 때 현금 비중을 늘리는지 · 어떤 바닥 신호들이 왔을 때 주식 비중을 늘리는지 — 확률을 좀 높여줘」
   market-strategy-report/market/prob.json (src/prob_bt.py · 평일 07:20·16:50) → 🏠 오늘 홈, 🧭 계절 시계 아래
   신호마다 「켜진 날 뒤에 실제로 얼마나 자주 빠졌나/올랐나」를 9개 지수에서 센 것 · 앞(~2012)·뒤(2013~) 둘 다 통한 신호만 「믿을 만」 */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/prob.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"};
  function bar(p, base){
    if (p == null) return "";
    var hot = base != null && p >= base + 8, cool = base != null && p <= base - 5;
    return '<span class="sp-bar"><i class="' + (hot ? "h" : cool ? "c" : "") + '" style="width:' + Math.max(3, Math.min(100, p)) + '%"></i>' + (base != null ? '<u style="left:' + Math.min(100, base) + '%"></u>' : '') + '</span>';
  }
  function pick(v){ return v ? (v.p_mk != null ? v.p_mk : v.p) : null; }
  function row(m, P){
    var d = m.t.down, c = m.t.crash, pd = pick(d), pc = pick(c), nm = P.wn || {};
    var word = pd == null ? "" : pd >= (d.base_mk || d.base) + 8 ? "평소보다 높음" : pd <= (d.base_mk || d.base) - 5 ? "평소보다 낮음" : "평소 수준";
    var own = ((P.targets.down.per_market[m.key] || {}).top || []).concat(((P.targets.crash.per_market[m.key] || {}).top || []));
    var seen = {}, ownL = own.filter(function(x){ if (seen[x.k]) return false; seen[x.k] = 1; return true; }).slice(0, 5);
    var on = {}; (d.on || []).concat(c ? c.on : [], d.own_on || [], c ? c.own_on : []).forEach(function(k){ on[k] = 1; });
    return '<details class="sp-r"><summary><span class="sp-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>고점보다 ' + String(m.dd).replace("-", "−") + '% · 경고 ' + d.n + '/' + d.of + '개 켜짐</small></span>' +
      '<span class="sp-p"><b>' + (pd != null ? pd + "%" : "–") + '</b><small>평소 ' + Math.round(d.base_mk || d.base) + '% · ' + e(word) + '</small>' + bar(pd, d.base_mk || d.base) + '</span></summary>' +
      '<div class="sp-x"><p><b>6개월 안에 10% 넘게 더 빠질 확률</b> ' + (pd != null ? pd + "%" : "–") + ' (이 지수 평소 ' + Math.round(d.base_mk || d.base) + '%' + (d.p_mk_ep ? ' · 이런 때가 과거 ' + d.p_mk_ep + '번' : '') + ')</p>' +
        (c ? '<p><b>1년 안에 20% 넘게 더 빠질 확률</b> ' + (pc != null ? pc + "%" : "–") + ' (이 지수 평소 ' + Math.round(c.base_mk || c.base) + '%)</p>' : '') +
        '<p class="sp-ch"><b>지금 켜진 경고</b> ' + (Object.keys(on).length ? Object.keys(on).map(function(k){ return '<i class="on">🔴 ' + e(nm[k] || k) + '</i>'; }).join("") : '<i>없음</i>') + '</p>' +
        (ownL.length ? '<p class="sp-own"><b>이 지수에서 잘 맞았던 경고</b> (앞·뒤 기간 둘 다)</p><ul class="sp-ul">' + ownL.map(function(x){ return '<li>' + (on[x.k] ? "🔴 " : "⚪ ") + e(x.name) + ' <em>켜지면 ' + x.p_on + '% · ' + x.lift + '배</em></li>'; }).join("") + '</ul>'
          : '<p class="sp-own">이 지수만 따로 보면 앞·뒤 기간 둘 다 통한 경고 신호가 없어요 — 전체 지수 통계로 봤어요.</p>') +
      '</div></details>';
  }
  function sigRows(T){
    return (T.signals || []).filter(function(x){ return !x.thin; }).slice(0, 8).map(function(x){
      return '<tr class="' + (x.good ? "pk" : "") + '"><td>' + (x.good ? "✅ " : "") + e(x.name) + '</td><td>' + x.p_on + '%</td><td>' + x.lift + '배</td><td>' + (x.lift_a == null ? "–" : x.lift_a) + ' / ' + (x.lift_b == null ? "–" : x.lift_b) + '</td></tr>'; }).join("");
  }
  // 📦 11/12 나라별 「다른 자료」(싼지 비싼지 · 빚 · 심리 · 자금) — market/alt.json (src/alt_bt.py)
  var TGN = {down: "6개월 안 −10%", crash: "1년 안 −20%", up12: "1년 뒤 플러스", good: "6개월 좋은 매수 자리", up12_deep: "1년 뒤 플러스(고점 −20% 아래서)", good_deep: "6개월 좋은 매수 자리(고점 −20% 아래서)"};
  function altHtml(A){
    if (!A || !A.markets) return "";
    var onW = [], onB = [];
    var rows = A.markets.map(function(m){
      var gs = (m.signals || []).filter(function(r){ return r.good && r.good.length; });
      var li = gs.map(function(r){
        var tg = r.good[0], v = r.t[tg];
        if (r.now) (r.side === "W" ? onW : onB).push(m.name);
        return '<li class="' + (r.now ? "on" : "") + '">' + (r.side === "W" ? "🚨" : "🌱") + ' <b>' + e(r.name) + '</b>' + (r.now ? ' <i>지금 켜짐</i>' : '') + '<em>' + e(TGN[tg] || tg) + ' ' + v.p_on + '% (평소 ' + v.base + '%) · ' + v.years + '개 해에 걸쳐 · ' + String(v.from).slice(0, 4) + '년~</em></li>'; }).join("");
      var x = m.x5 || {};
      return '<div class="sp-am"><div class="sp-amh">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>5년 평균선보다 ' + (x.gap > 0 ? "+" : "") + String(x.gap).replace("-", "−") + '% · 자기 과거 중 ' + (x.pct >= 50 ? "비싼 쪽 상위 " + (100 - x.pct) : "싼 쪽 하위 " + x.pct) + '%</small></div>' +
        (li ? '<ul class="sp-al">' + li + '</ul>' : '<p class="sp-an">통과한 신호 없음 (' + (m.signals || []).length + '개 시험)</p>') + '</div>';
    }).join("");
    var uq = function(a){ return a.filter(function(x, i){ return a.indexOf(x) === i; }); };
    return '<details class="sp-t" open><summary>📦 나라별 다른 자료 — 싼지 비싼지 · 빚 · 심리 · 자금</summary>' +
      '<p>주가 말고 다른 종류의 자료로 만든 신호 <b>' + A.n_tested + '개 중 ' + A.n_good + '개</b>가 앞·뒤 기간 둘 다 통했어요. ' +
        (uq(onW).length ? '지금 🚨 경고가 켜진 곳: <b>' + e(uq(onW).join(" · ")) + '</b>. ' : '') + (uq(onB).length ? '지금 🌱 바닥 쪽이 켜진 곳: <b>' + e(uq(onB).join(" · ")) + '</b>.' : '지금 🌱 바닥 쪽이 켜진 곳은 없어요.') + '</p>' + rows +
      '<small>자료: 🇺🇸 CAPE·PER·PBR·개인 심리(AAII) · 🇰🇷 예탁금·신용잔고·반대매매(금융투자협회)·외국인 매매·환율 · 🇨🇳 PER·PBR·주식−채권 금리차·시총÷GDP·융자잔고·북향 자금 · 🇭🇰 남향 자금 · 전부 5년 평균선. 「비싸다·싸다」는 그날까지 자기 과거와 비교(미래 값 안 봄). 못 받은 것: 🇰🇷 코스피 PER·PBR(KRX 로그인 필요) · 🇯🇵 닛케이 PER·PBR 과거 · 🇺🇸 신용융자·실업률(막힘)</small></details>';
  }
  window.__sigProbCard = function(P){
    if (!P || !P.targets || !P.now) return "";
    var T = P.targets, D = T.down, C = T.crash, G = T.good, U = T.up12;
    var ms = P.now.filter(function(m){ return m.t && m.t.down; }); if (!ms.length) return "";
    var hi = ms.filter(function(m){ var d = m.t.down, p = pick(d); return p != null && p >= (d.base_mk || d.base) + 8; });
    var lead = hi.length ? "지금 경고가 평소보다 높은 곳 — " + hi.map(function(m){ return m.name; }).join(" · ") : "지금 평소보다 경고가 높은 지수는 없어요";
    var auc = D.oos_gb || D.oos_logit || {};
    var inDD = ms.filter(function(m){ return m.t.good; });
    return '<section class="card sp" id="sigprob" data-cz="done"><div class="sp-h">🎯 신호 확률판 <small>' + e(String(P.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="sp-lead">' + e(lead) + '</p>' +
      '<p class="sp-sum">신호가 켜진 날 뒤에 실제로 얼마나 자주 빠졌는지를 9개 지수 약 30년치로 센 숫자예요. <b>숫자 = 앞으로 6개월 안에 지금보다 10% 넘게 더 빠진 적이 있던 비율</b> · 세로 줄은 그 지수의 평소 값.</p>' +
      ms.map(function(m){ return row(m, P); }).join("") +
      altHtml(window.__altData) +
      '<details class="sp-t"><summary>🚨 어떤 신호에 현금을 늘리나 — 경고 신호 성적</summary>' +
        '<p>경고 ' + (D.signals || []).length + '개 중 <b>앞·뒤 기간 둘 다 통한 건 ' + (D.good || []).length + '개</b>예요. 켜져도 평소 ' + D.base + '% → 50% 안팎으로, 조금 올라가는 정도예요.</p>' +
        '<table><tr><th>신호 (6개월 안 −10%)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(D) + '</table>' +
        '<p>믿을 만한 신호가 겹치면: ' + (D.ladder_good || []).map(function(x){ return (x.lo === x.hi ? x.lo : x.lo + "개↑").toString().replace(/^(\d+)$/, "$1개") + " " + (x.p == null ? "–" : x.p + "%"); }).join(" → ") + '</p>' +
        '<table><tr><th>신호 (1년 안 −20% 큰 하락)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(C) + '</table>' +
        '<small>평소 = ' + D.base + '% (6개월 −10%) · ' + C.base + '% (1년 −20%) · ✅ = 앞(~2012)·뒤(2013~) 둘 다 1.15배 넘고 지수 3분의 2 넘게 같은 방향</small></details>' +
      '<details class="sp-t"><summary>🌱 어떤 바닥 신호에 주식을 늘리나 — 바닥 신호 성적</summary>' +
        '<p><b>바닥 신호 ' + (G.signals || []).length + '개 중 앞·뒤 기간 둘 다 통한 건 ' + (G.good || []).length + '개예요.</b> 고점보다 20% 넘게 빠진 날에 샀을 때 평소 확률은 — 6개월 뒤 좋은 자리(플러스이고 그 사이 −10% 더 안 빠짐) <b>' + G.base + '%</b> · 1년 뒤 플러스 <b>' + U.base + '%</b>. 신호가 켜지길 기다려도 이 숫자가 꾸준히 올라가지 않았어요.</p>' +
        '<table><tr><th>신호 (6개월 좋은 매수 자리)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(G) + '</table>' +
        (inDD.length ? '<p>지금 고점 −20% 아래: ' + inDD.map(function(m){ return e(m.name); }).join(" · ") + ' — 과거 같은 깊이에서 1년 뒤 플러스였던 비율 ' + inDD.map(function(m){ var u = m.t.up12; return e(m.name) + " " + (u && u.base_mk != null ? Math.round(u.base_mk) + "%" : "–"); }).join(" · ") + '</p>' : '') +
        '</details>' +
      '<p class="sp-note">얼마나 믿을 수 있나: 해마다 그 전 자료만으로 맞히게 하는 시험에서 맞히는 힘은 ' + (auc.auc != null ? auc.auc : "–") + '이었어요(0.5 = 동전 던지기 · 1 = 다 맞힘). 큰 하락(−20%)은 ' + ((C.oos_logit || {}).auc != null ? C.oos_logit.auc : "–") + '. 즉 「확률이 조금 기운다」 정도이고 맞히는 도구는 아니에요. 날마다 겹치는 표본이라 독립된 사건 수는 훨씬 적어요 · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".sp-h{font-size:17px;font-weight:900}.sp-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.sp-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.sp-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.sp-sum b{color:var(--text,inherit)}" +
    ".sp-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.sp-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px}.sp-r>summary::-webkit-details-marker{display:none}" +
    ".sp-n{min-width:0;flex:1}.sp-n b{font-size:14.5px;font-weight:900}.sp-n small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px}.sp-p{flex:0 0 46%;text-align:right}.sp-p>b{font-size:17px;font-weight:900}.sp-p>small{font-size:11px;color:var(--sub);font-weight:700;margin-left:5px}" +
    ".sp-bar{display:block;position:relative;height:7px;border-radius:99px;background:rgba(127,127,127,.18);margin-top:4px;overflow:visible}.sp-bar i{display:block;height:100%;border-radius:99px;background:#9aa3b2}.sp-bar i.h{background:#e5484d}.sp-bar i.c{background:#30a46c}.sp-bar u{position:absolute;top:-3px;width:2px;height:13px;background:var(--text,#111);border-radius:1px}" +
    ".sp-x{margin-top:8px;font-size:13px;line-height:1.55;word-break:keep-all}.sp-x p{margin:4px 0 0}.sp-ch i{display:inline-block;font-style:normal;font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:999px;background:rgba(127,127,127,.12);color:var(--sub);margin:2px 3px 0 0}.sp-ch i.on{background:rgba(229,72,77,.13);color:#d13438}" +
    ".sp-own{color:var(--sub);font-size:12.5px}.sp-ul{margin:4px 0 0;padding:0;list-style:none;font-size:12.5px}.sp-ul li{padding:2px 0}.sp-ul em{font-style:normal;color:var(--sub);margin-left:4px}" +
    ".sp-t{margin-top:10px;border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px}.sp-t>summary{cursor:pointer;font-size:13.5px;font-weight:900;list-style:none}.sp-t>summary::-webkit-details-marker{display:none}.sp-t p{margin:8px 0 6px;font-size:13px;line-height:1.55;word-break:keep-all}" +
    ".sp-t table{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0 8px}.sp-t th,.sp-t td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.sp-t th:first-child,.sp-t td:first-child{text-align:left;white-space:normal;word-break:keep-all}.sp-t tr.pk td{font-weight:900}.sp-t small{display:block;font-size:11px;color:var(--sub);line-height:1.4}" +
    ".sp-am{margin-top:10px;padding-top:8px;border-top:1px solid rgba(127,127,127,.18)}.sp-amh b{font-size:13.5px;font-weight:900}.sp-amh small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px}" +
    ".sp-al{list-style:none;margin:6px 0 0;padding:0}.sp-al li{font-size:12.5px;line-height:1.45;padding:4px 0;word-break:keep-all}.sp-al li b{font-weight:800}.sp-al li em{display:block;font-style:normal;color:var(--sub);font-size:11.5px}.sp-al li i{font-style:normal;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:99px;background:rgba(229,72,77,.14);color:#d13438;margin-left:3px}.sp-an{margin:4px 0 0!important;font-size:12px!important;color:var(--sub)}" +
    ".sp-note{margin:10px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}";
  document.head.appendChild(css);
  fetch(RAW.replace("prob.json", "alt.json") + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(A){
    if (!A) return; window.__altData = A; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__sigProbData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
;
__bk(81);
/* ======== ux1112e.js ======== */
/* 🔁 11/12 닮은 장 백테스트 — 사용자 「이번엔 지금 장과 유사했던 때들로만 백테스트 · 성격이 다른 장들까지 다 넣으니 확률이 안 올라간 것 같아」
   market-strategy-report/market/analog.json (src/analog_bt.py · 평일 07:40) → 🏠 오늘 홈, 🎯 신호 확률판 아래 · 🔬 연구실 바로가기
   지수마다: 지금과 닮았던 때 12번 → 그 뒤 2년 길(그림) · 더 빠졌나 · 방식 16개 성적 */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/analog.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return v == null ? "–" : String(v).replace("-", "−"); }
  function sg(v){ return v == null ? "–" : (v > 0 ? "+" : "") + mn(v) + "%"; }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"};
  var SHORT = {lump: "지금 다 사기", cash: "계속 현금", dca6: "6개월 나눠 사기", dca12: "12개월 나눠 사기", dip: "더 빠질 때마다 사기", half200: "절반 지금 + 절반 200일선 회복 때", third: "3분의 1씩 나눠(지금·50일선·200일선)",
               floor: "바닥 신호마다 3분의 1씩", bear: "하락장이면 현금 · 풀리면 주식", ma10: "10개월선 위로 올라오면 사기", ddl: "−10% 절반 · −20% 현금", deep: "10개월선 + 많이 싸면 절반", mom12: "1년 전보다 높으면 주식",
               step3: "신호 3개 계단", a200: "200일선 위로 올라오면 사기", a50: "50일선 위로 올라오면 사기"};
  function verdict(m){
    var f = m.fwd, L = {}; m.rules.forEach(function(r){ L[r.k] = r; });
    var lump = L.lump, n = f.n;
    if (lump.beat_cash >= Math.ceil(n * 0.75) && lump.y2_med >= 15) return ["buy", "사는 쪽이 유리했음", "닮은 때 " + n + "번 중 " + lump.beat_cash + "번, 지금 사서 2년 들고 있는 게 현금보다 나았어요"];
    if (f.more10 >= Math.ceil(n * 0.75) && lump.beat_cash <= n / 2) return ["wait", "더 기다리는 쪽이 유리했음", "닮은 때 " + n + "번 중 " + f.more10 + "번, 그 뒤 10% 넘게 더 빠졌어요"];
    return ["mid", "반반 — 나눠서", "닮은 때 " + n + "번 중 " + lump.beat_cash + "번만 지금 사는 게 현금보다 나았어요"];
  }
  function chart(m){
    var W = 300, H = 130, pl = 30, pr = 6, pt = 8, pb = 18, all = [], k;
    m.episodes.forEach(function(ep){ ep.path.forEach(function(v){ all.push(v); }); });
    var lo = Math.min(-10, Math.min.apply(null, all)), hi = Math.max(10, Math.min(150, Math.max.apply(null, all)));
    var X = function(i){ return pl + i * (W - pl - pr) / 24; }, Y = function(v){ return pt + (hi - Math.min(hi, v)) * (H - pt - pb) / (hi - lo); };
    var g = '<line class="an-z" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '"/>';
    [lo, 0, hi].forEach(function(v){ g += '<text class="an-ax" x="' + (pl - 4) + '" y="' + (Y(v) + 3).toFixed(1) + '" text-anchor="end">' + (v > 0 ? "+" : "") + mn(Math.round(v)) + '%</text>'; });
    [[0, "지금"], [12, "1년 뒤"], [24, "2년 뒤"]].forEach(function(t){ g += '<text class="an-ax" x="' + X(t[0]).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="' + (t[0] === 0 ? "start" : t[0] === 24 ? "end" : "middle") + '">' + t[1] + '</text>'; });
    m.episodes.forEach(function(ep){ g += '<polyline class="an-l ' + ((ep.y2 != null ? ep.y2 : ep.y1) > 0 ? "u" : "d") + '" points="' + ep.path.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") + '"/>'; });
    var med = [];
    for (k = 0; k <= 24; k++){ var vs = m.episodes.filter(function(ep){ return ep.path.length > k; }).map(function(ep){ return ep.path[k]; }).sort(function(a, b){ return a - b; }); if (vs.length < 4) break; med.push(vs.length % 2 ? vs[(vs.length - 1) / 2] : (vs[vs.length / 2 - 1] + vs[vs.length / 2]) / 2); }
    g += '<polyline class="an-m" points="' + med.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") + '"/>';
    return '<svg class="an-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + e(m.name) + ' 닮은 때 ' + m.episodes.length + '번의 그 뒤 2년">' + g + '</svg>';
  }
  function row(m){
    var f = m.fwd, n = f.n, v = verdict(m), now = m.now, best = m.rules[0], L = {}; m.rules.forEach(function(r){ L[r.k] = r; });
    var show = m.rules.slice(0, 5); ["lump", "cash"].forEach(function(k){ if (show.indexOf(L[k]) < 0) show.push(L[k]); });
    var tb = show.map(function(r, i){ return '<tr class="' + (i === 0 ? "pk" : "") + '"><td>' + e(SHORT[r.k] || r.name) + '</td><td>' + sg(r.y2_med) + '</td><td>' + sg(r.y2_worst) + '</td><td>' + r.beat_cash + '/' + r.n + '</td></tr>'; }).join("");
    var eps = m.episodes.map(function(ep){ return '<li>' + (FL[ep.nat] || "") + ' ' + e(ep.name) + ' <b>' + e(ep.date.slice(0, 7).replace("-", "년 ") + "월") + '</b><em>더 ' + mn(ep.more) + '% · 1년 뒤 ' + sg(ep.y1) + ' · 2년 뒤 ' + sg(ep.y2) + '</em></li>'; }).join("");
    var sens = (m.sens || []).map(function(s){ return "닮은 때 " + s.n + "번으로 보면 1등 「" + (SHORT[s.top[0][0]] || s.top[0][0]) + "」 · 지금 다 사기 " + sg(s.lump[0]) + " (현금보다 " + s.lump[1] + "/" + s.n + ")"; }).join(" / ");
    return '<details class="an-r"><summary><span class="an-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>2년 새 ' + sg(now.run) + ' 오른 뒤 고점보다 ' + mn(now.dd) + '% · ' + now.since + '일째</small></span>' +
      '<span class="an-v ' + v[0] + '"><b>' + e(v[1]) + '</b></span></summary>' +
      '<div class="an-x"><p class="an-why">' + e(v[2]) + '</p>' + chart(m) +
      '<p class="an-cap">가는 선 = 닮았던 때 하나하나(그날 샀다면) · 굵은 선 = 가운데 길</p>' +
      '<ul class="an-f"><li><small>그 뒤 가장 깊이 더 빠진 폭(가운데값)</small><b>' + mn(f.more_med) + '%</b></li><li><small>10% 넘게 더 빠진 때</small><b>' + f.more10 + '/' + n + '번</b></li><li><small>바닥까지 걸린 기간</small><b>약 ' + Math.max(1, Math.round(f.to_low_med / 21)) + '개월</b></li><li><small>1년 뒤 플러스 · 2년 뒤 플러스</small><b>' + f.y1_up + '/' + n + ' · ' + f.y2_up + '/' + n + '번</b></li></ul>' +
      '<p class="an-b"><b>가장 나았던 방식 — ' + e(SHORT[best.k] || best.name) + '</b> · 2년 뒤 가운데값 ' + sg(best.y2_med) + ' · 가장 나빴던 때 ' + sg(best.y2_worst) + ' · 현금보다 나았던 때 ' + best.beat_cash + '/' + best.n + '번</p>' +
      '<table><tr><th>방식(닮은 날부터 2년)</th><th>가운데</th><th>최악</th><th>현금보다</th></tr>' + tb + '</table>' +
      '<details class="an-e"><summary>닮았던 때 ' + n + '번 보기</summary><ul>' + eps + '</ul><small>' + e(sens) + '</small></details></div></details>';
  }
  function pickHtml(A){
    var P = A.markets.filter(function(m){ return m.pick; }); if (!P.length) return "";
    var rows = P.map(function(m){ var p = m.pick;
      return '<li class="' + (p.ok ? "" : "no") + '"><span>' + FL[m.nat] + ' <b>' + e(m.name) + '</b></span>' +
        (p.ok ? '<em>주식 ' + p.stock + '%</em><small><b>' + e(SHORT[p.k] || p.rule) + '</b> · 다음: ' + e(p.next) + '</small>'
              : '<em class="no">정하지 않음</em><small>통하는 방식이 없었어요 — 한 번에 사지 말고 나눠 사기만 참고</small>') + '</li>'; }).join("");
    return '<div class="an-pk"><div class="an-pkh">📌 지금 규칙 <small>닮은 장에서 2년 뒤 가운데값이 가장 좋았던 방식</small></div><ul>' + rows + '</ul>' +
      '<p>고른 방식이 우연인지 보려고 닮은 때 하나를 빼고 고른 뒤 그 하나에 적용해 봤어요(12번 반복). 그 결과가 계속 현금(2년 약 ' + (A.cash2 || 4) + '%)보다 못한 곳은 정하지 않았어요. 🇰🇷🇺🇸 네 시장은 하락장 계기판의 현금 몫에 그대로 반영돼요. 💼 기본 포트는 S&P500 200일선 규칙이 먼저예요 · 🔁 닮은 장 규칙은 국내 주식과 시장별 참고용 · 고르는 방식이 바뀌면 알림이 가요.</p></div>';
  }
  window.__analogCard = function(A){
    if (!A || !A.markets || !A.markets.length) return "";
    var by = {buy: [], wait: [], mid: []}; A.markets.forEach(function(m){ by[verdict(m)[0]].push(m.name); });
    var lead = [by.wait.length ? "더 기다리는 쪽: " + by.wait.join("·") : "", by.buy.length ? "사는 쪽: " + by.buy.join("·") : "", by.mid.length ? "나눠서: " + by.mid.join("·") : ""].filter(Boolean).join(" / ");
    return '<section class="card an" id="analog" data-cz="done"><div class="an-h">🔁 닮은 장 백테스트 <small>' + e(String(A.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="an-lead">' + e(lead) + '</p>' +
      '<p class="an-sum">지금 장과 <b>닮았던 때만</b> 골라 그 뒤 2년을 봤어요. 닮았다 = 고점 전 급등 폭 · 고점에서 빠진 폭 · 고점 뒤 며칠째 · 200일선·5년 평균선과의 거리 · 출렁임이 지금과 가까운 날(9개 지수 + 나스닥100 + 반도체 지수 · 1985년~ · 지수마다 12번).</p>' +
      pickHtml(A) + A.markets.map(row).join("") +
      '<p class="an-note">닮은 때가 12번뿐이라 「12번 중 몇 번」으로만 읽어 주세요. 닮음의 기준에 싼지 비싼지(PER·CAPE)·금리는 들어 있지 않아요. 현금 연 2% · 바꿀 때 0.1% · 가격지수(배당 제외) · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".an-pk{margin:6px 0 10px;padding:10px 12px;border-radius:14px;background:var(--bg2,rgba(127,127,127,.08))}.an-pkh{font-size:15px;font-weight:900}.an-pkh small{display:block;font-size:12px;font-weight:600;color:var(--sub);margin-top:2px}.an-pk ul{list-style:none;margin:8px 0 6px;padding:0}.an-pk li{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:7px 0;border-top:1px solid var(--line,rgba(127,127,127,.18));font-size:14px}.an-pk li em{font-style:normal;font-weight:900}.an-pk li em.no{color:var(--sub);font-weight:700}.an-pk li small{grid-column:1/-1;font-size:12.5px;line-height:1.45;color:var(--sub);word-break:keep-all}.an-pk li small b{color:var(--text)}.an-pk p{margin:0;font-size:12px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".an-h{font-size:17px;font-weight:900}.an-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.an-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.an-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.an-sum b{color:var(--text,inherit)}" +
    ".an-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.an-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}.an-r>summary::-webkit-details-marker{display:none}" +
    ".an-n{min-width:0}.an-n b{font-size:14.5px;font-weight:900}.an-n small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px;word-break:keep-all}.an-v{flex:0 0 auto}.an-v b{display:inline-block;font-size:12.5px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap}" +
    ".an-v.buy b{background:rgba(48,164,108,.16);color:#1f8a57}.an-v.wait b{background:rgba(229,72,77,.15);color:#d13438}.an-v.mid b{background:rgba(240,160,60,.2);color:#b86a00}" +
    ".an-x{margin-top:8px}.an-why{margin:0 0 6px;font-size:13px;font-weight:700;line-height:1.5;word-break:keep-all}.an-svg{width:100%;height:auto;display:block}.an-l{fill:none;stroke-width:1;opacity:.55}.an-l.u{stroke:#30a46c}.an-l.d{stroke:#e5484d}.an-m{fill:none;stroke:var(--text,#111);stroke-width:2.6;stroke-linejoin:round}.an-z{stroke:rgba(127,127,127,.5);stroke-dasharray:3 3}.an-ax{font-size:8.5px;fill:var(--sub,#888);font-weight:700}" +
    ".an-cap{margin:2px 0 6px;font-size:11px;color:var(--sub)}.an-f{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}.an-f li{background:rgba(127,127,127,.08);border-radius:10px;padding:6px 8px}.an-f small{display:block;font-size:11px;color:var(--sub);font-weight:700;line-height:1.3;word-break:keep-all}.an-f b{font-size:15px;font-weight:900}" +
    ".an-b{margin:10px 0 4px;font-size:13px;line-height:1.55;word-break:keep-all}.an-x table{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0}.an-x th,.an-x td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.an-x th:first-child,.an-x td:first-child{text-align:left;white-space:normal;word-break:keep-all}.an-x tr.pk td{font-weight:900}" +
    ".an-e{margin-top:6px}.an-e>summary{cursor:pointer;font-size:12.5px;font-weight:800;color:var(--accent,#3182f6)}.an-e ul{list-style:none;margin:6px 0;padding:0;font-size:12px}.an-e li{padding:3px 0;word-break:keep-all}.an-e li em{display:block;font-style:normal;color:var(--sub);font-size:11.5px}.an-e small{display:block;font-size:11px;color:var(--sub);line-height:1.45;word-break:keep-all}" +
    ".an-note{margin:10px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}";
  document.head.appendChild(css);
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__analogData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
;
__bk(82);
/* ======== ux1113.js ======== */
/* 📏 11/13 A11/13-1 「선이 내려오는 날 — 가격이 가만히 있어도 50일선·장기선이 지금 값에 닿는 날짜」 (사용자 「진행」)
   규칙의 기준선(50일선·200일선)은 지난 n개 종가의 평균이라 옛 종가가 하루씩 빠지며 스스로 움직임 →
   만드는 쪽 bear_gate.py 가 bear.json markets[]/more[] 에 meet 칸(최근 60일 가격·선 + 「오늘 종가 그대로면」 선의 앞길 + 닿는 거래일·날짜)을 붙이고 앱은 그리기만.
   붙는 곳: ① 🏠 「📏 언제 다시 사나 ▾」 펼침 — 그림(가격선·선 두 가닥 + 그대로면 점선)과 「오늘 당장이면 +x% ↔ 그대로면 약 n거래일 뒤」 한 문장(본체)
           ② 🐻 계기판 시장 줄·체크리스트·🌏 일본·중국·홍콩 줄 — 한 토막씩(글자만)
   예측 아님 · 산수 · 「닿음 ≠ 사기」(규칙 조건은 종가 기준 그대로) · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return String(v).replace("-", "−"); }
  function pct(v){ return (v > 0 ? "+" : "") + mn(v) + "%"; }
  function num(v){ return v == null ? "–" : mn(Math.round(v).toLocaleString("en-US")); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  var LN = {m50: "50일선", m200: "장기 평균선(200일)", dd20: "고점 −20% 선"};
  function lname(L){ return LN[L.k] || L.k; }

  /* 한 문장 — 두 날 사이 */
  function sentence(L, short){
    var ln = lname(L), lv = num(L.lv);
    if (L.k === "dd20") return "📏 " + ln + "(" + lv + ")까지 " + pct(L.need) + " · 이 선은 움직이지 않아요";
    var slope = L.slope != null ? " · 선은 요즘 하루 약 " + (L.slope > 0 ? "+" : "") + mn(L.slope) + "p" : "";
    if (L.above){   // 가격이 선 위 — 선이 올라와 닿으면 「아래로」 시작
      return "📏 지금 " + ln.replace(/\(.*\)/, "") + "(" + lv + ")보다 " + pct(-L.need) + " 위" + (L.days ? " · 가격이 그대로면 약 " + L.days + "거래일 뒤(" + md(L.date) + ") 선이 올라와 닿아요" : " · 가격이 그대로면 " + (L.proj ? L.proj.length : 130) + "거래일 안엔 안 닿아요") + slope + (short ? "" : " · 예측 아님, 산수");
    }
    var a = "오늘 당장이면 " + pct(L.need) + "(" + lv + ")";
    var b = L.days ? "가격이 그대로면 약 " + L.days + "거래일 뒤(" + md(L.date) + ") 선이 내려와 닿아요" : "가격이 그대로면 " + (L.proj ? L.proj.length : 130) + "거래일 안엔 안 닿아요 — 가격이 올라야 만나요";
    return "📏 " + ln + " — " + a + " ↔ " + b + (short ? "" : " · 실제는 이 사이 어딘가" + slope + " · 예측 아님, " + L.n + "개 종가 평균의 산수");
  }

  /* 그림 — 최근 60일 가격선·선 + 오른쪽 「그대로면」 점선 두 가닥 + 닿는 점 */
  function chart(L, name){
    var H = L.hist || []; if (H.length < 10) return "";
    var P = L.px, proj = (L.proj || []).slice(0, L.days || Math.min(60, (L.proj || []).length));
    if (!L.days && proj.length > 60) proj = proj.slice(0, 60);
    var N = H.length + proj.length, W = 340, HT = 128, pl = 6, pr = 64, pt = 12, pb = 20;
    var vals = [P]; H.forEach(function(h){ vals.push(h[0], h[1]); }); proj.forEach(function(v){ vals.push(v); });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
    function X(i){ return pl + (W - pl - pr) * i / Math.max(1, N - 1); }
    function Y(v){ return pt + (HT - pt - pb) * (1 - (v - lo) / (hi - lo)); }
    var px = H.map(function(h, i){ return X(i).toFixed(1) + "," + Y(h[0]).toFixed(1); }).join(" ");
    var ma = H.map(function(h, i){ return X(i).toFixed(1) + "," + Y(h[1]).toFixed(1); }).join(" ");
    var i0 = H.length - 1, xt = X(i0);
    var ppx = proj.length ? [xt.toFixed(1) + "," + Y(P).toFixed(1)].concat(proj.map(function(v, j){ return X(i0 + j + 1).toFixed(1) + "," + Y(P).toFixed(1); })).join(" ") : "";
    var pma = proj.length ? [xt.toFixed(1) + "," + Y(H[i0][1]).toFixed(1)].concat(proj.map(function(v, j){ return X(i0 + j + 1).toFixed(1) + "," + Y(v).toFixed(1); })).join(" ") : "";
    var xe = X(N - 1), ye = Y(P);
    var meet = L.days ? '<circle class="mt-dot" cx="' + xe.toFixed(1) + '" cy="' + ye.toFixed(1) + '" r="4"/><text class="mt-t mt-td" x="' + (xe + 6).toFixed(1) + '" y="' + (ye - 6).toFixed(1) + '">약 ' + e(md(L.date)) + '</text><text class="mt-t" x="' + (xe + 6).toFixed(1) + '" y="' + (ye + 8).toFixed(1) + '">' + L.days + '거래일 뒤</text>' : '';
    var lab = '<text class="mt-t" x="' + (xt + 4).toFixed(1) + '" y="' + (Y(H[i0][1]) + (H[i0][1] > P ? -5 : 11)).toFixed(1) + '">' + e(lname(L).replace(/\(.*\)/, "")) + ' ' + e(num(L.lv)) + '</text>' +
              '<text class="mt-t" x="' + (xt + 4).toFixed(1) + '" y="' + (ye + (H[i0][1] > P ? 11 : -5)).toFixed(1) + '">지금 ' + e(num(P)) + '</text>';
    return '<svg class="mt-svg" viewBox="0 0 ' + W + ' ' + HT + '" role="img" aria-label="' + e(name) + ' 가격과 ' + e(lname(L)) + ' — 가격이 그대로면 선이 닿는 날">' +
      '<line class="mt-ax" x1="' + xt.toFixed(1) + '" y1="' + pt + '" x2="' + xt.toFixed(1) + '" y2="' + (HT - pb) + '"/>' +
      '<polyline class="mt-ma" points="' + ma + '"/><polyline class="mt-px" points="' + px + '"/>' +
      (proj.length ? '<polyline class="mt-ma mt-dash" points="' + pma + '"/><polyline class="mt-px mt-dash" points="' + ppx + '"/>' : '') + meet + lab +
      '<text class="mt-t mt-x" x="' + pl + '" y="' + (HT - 5) + '">' + H.length + '거래일 전</text><text class="mt-t mt-x" x="' + xt.toFixed(1) + '" y="' + (HT - 5) + '" text-anchor="middle">오늘</text>' +
      (proj.length ? '<text class="mt-t mt-x" x="' + xe.toFixed(1) + '" y="' + (HT - 5) + '" text-anchor="end">그대로면 →</text>' : '') + '</svg>';
  }

  /* ① 📏 언제 다시 사나 펼침 — 한국 시장 전부(그림 + 문장) */
  function block(m){
    var M = (m.meet && m.meet.lines) || []; if (!M.length) return "";
    return '<div class="mt-box"><div class="mt-h">' + (m.nat === "kr" ? "🇰🇷" : m.nat === "us" ? "🇺🇸" : "") + ' <b>' + e(m.name) + '</b> <small>선이 내려오는 날 · ' + e(md(m.meet.asof)) + ' 종가</small></div>' +
      M.map(function(L){ return (L.k === "dd20" ? "" : chart(L, m.name)) + '<p class="mt-s">' + e(sentence(L)) + '</p>'; }).join("") + '</div>';
  }
  window.__meetHtml = function(w, BR){
    var A = ((BR && BR.markets) || []).filter(function(m){ return m.nat === "kr" && m.meet && m.meet.lines && m.meet.lines.length; });
    if (!A.length && w && w.meet) A = [w];
    if (!A.length) return "";
    return '<div class="mt-wrap">' + A.map(block).join("") + '<p class="mt-n">선은 지난 50·200개 종가의 평균이라 옛 종가가 빠지면서 날마다 움직여요 — 「그대로면」은 오늘 종가가 안 변한다는 가정의 산수(예측 아님) · 닿았다고 사는 게 아니라 규칙 조건(종가 기준)은 그대로 · 휴장일 안 셈 · 사라·팔라는 뜻 아님</p></div>';
  };
  /* 요약 줄 꼬리 「· 그대로면 약 1/8」 */
  window.__meetTail = function(w){
    var L = ((w && w.meet && w.meet.lines) || []).filter(function(x){ return x.days && !x.above; })[0];
    return L ? " · 그대로면 약 " + md(L.date) : "";
  };
  /* ② 한 토막(글자만) — 계기판 체크리스트·시장별 방식 줄·🌏 줄 */
  window.__meetLine = function(m, cls){
    var M = (m && m.meet && m.meet.lines) || []; if (!M.length) return "";
    return M.map(function(L){ return '<p class="' + (cls || "mt-line") + '">' + e(sentence(L, true)) + '</p>'; }).join("");
  };

  var css = document.createElement("style"); css.id = "ux1113css";
  css.textContent =
    ".mt-wrap{margin:8px 0 4px}.mt-box{margin:0 0 10px;padding:8px 10px;border:1px solid var(--line,#e5e7eb);border-radius:12px}" +
    ".mt-h{font-size:13px;margin-bottom:4px}.mt-h small{color:var(--sub,#888);font-weight:600;margin-left:4px}" +
    ".mt-svg{width:100%;height:auto;display:block;margin:2px 0 4px}.mt-px{fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}.mt-ma{fill:none;stroke:#2f80ed;stroke-width:2;stroke-linejoin:round}" +
    ".mt-dash{stroke-dasharray:4 3;stroke-width:1.6;opacity:.85}.mt-ax{stroke:rgba(127,127,127,.5);stroke-dasharray:2 3}.mt-dot{fill:#e5484d}" +
    ".mt-t{font-size:9.5px;fill:var(--sub,#888);font-weight:700}.mt-td{fill:#e5484d;font-size:10.5px}.mt-x{font-size:9px;font-weight:600}" +
    ".mt-s{margin:2px 0 6px;font-size:13px;line-height:1.5;word-break:keep-all}.mt-n{margin:2px 0 0;font-size:11.5px;color:var(--sub,#888);line-height:1.45;word-break:keep-all}" +
    ".mt-line{margin:4px 0 0;font-size:12.5px;line-height:1.5;word-break:keep-all;color:var(--text,#111)}.bmm .mt-line{display:block;margin:2px 0 0;font-size:11.5px;color:var(--sub,#888)}" +
    ":root[data-ui=light] .mt-ma{stroke:#2f80ed}:root:not([data-ui=light]) .mt-ma{stroke:#5aa0ff}";
  document.head.appendChild(css);
})();
;
__bk(83);
__be(7);
