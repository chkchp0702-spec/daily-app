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
    var M = window.M && M.cats || {}, mx = "";
    GT[g].forEach(function(k){ var it = (M[k] || [])[0]; if (it && it.id && it.id > mx) mx = String(it.id); });
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
    if (ls("wow_ob") || /[?&]embed=1/.test(location.search)) return;
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
