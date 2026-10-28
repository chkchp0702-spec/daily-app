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
    ":where(html[data-ds]) :where(small){font-size:max(12.5px,.833em)}" +
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
