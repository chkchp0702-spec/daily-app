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
    /* 🛡 11/24 「오늘 자세히 보기」 전체(#hmbody)는 떠 있는 접기 대상에서 뺌 — 누르면 아래 칸이 한꺼번에 접혀 첫 화면으로 돌아간 것처럼 보였음(사용자 「초기 화면으로 돌아가」). 접기는 그 칸 맨 아래 「▴ 접기」로 */
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
  var ONAT = 0;
  function upd(){
    T = 0;
    if (!FB) return;
    TGT = pick();
    if (!!TGT && !FB.classList.contains("on")) ONAT = Date.now();   // 🛡 11/24 막 나타난 단추는 0.6초 동안 안 눌림(「더 보기」를 누르려던 손가락이 새로 뜬 접기에 닿던 것)
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
      if (Date.now() - ONAT < 600) return;
      foldOne(TGT || pick());
    };
    document.body.appendChild(FB);
    upd();
  }
  /* 하나만 접고 그 칸 머리를 화면 위쪽에 둠 + 「되돌리기」 3초 (잘못 눌러도 바로 원래대로) */
  function foldOne(o){
    if (!o) return false;
    var h = o.head, y0 = scrollY; o.close();
    setTimeout(function(){ try { var t = (h && vis(h) ? h : o.el); var r = t.getBoundingClientRect(); if (r.top < 70 || r.top > innerHeight * 0.6) scrollBy({top: r.top - 90, behavior: "smooth"}); } catch(x) {} soon(); }, 30);
    try {
      var old = document.getElementById("foldundo"); if (old) old.remove();
      var u = document.createElement("button"); u.id = "foldundo"; u.type = "button"; u.textContent = "접었어요 · 되돌리기";
      u.onclick = function(){ u.remove(); try { if (o.el.tagName === "DETAILS") o.el.open = true; else if (h && h.click) h.click(); } catch(x) {} setTimeout(function(){ scrollTo({top: y0}); }, 40); };
      document.body.appendChild(u); setTimeout(function(){ u.remove(); }, 3200);
    } catch(x) {}
    return true;
  }
  window.__foldInner = function(){ var o = pick(); return o ? foldOne(o) : false; };   // ← 뒤로(돌아갈 화면 없을 때)가 씀
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
  /* 🛡 11/24 「초기 화면으로 돌아가」가 아이폰이 앱을 저절로 다시 연 경우인지 알아내기 — 읽던 위치를 적어 두고, 15초 안에 「다시 열림」이면 오류 기록(early.js chErr)에 남김 */
  try {
    var nv = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {}, LS = JSON.parse(sessionStorage.getItem("ch_lastpos") || "null");
    if (LS && Date.now() - LS.t < 15000 && LS.y > 600 && !/[?&]v=/.test(location.search) && window.chErr) setTimeout(function(){ chErr("reload", "읽던 중 다시 열림(" + (nv.type || "?") + ")", "", " · " + LS.k + " · y" + LS.y + " · h" + LS.h); }, 3000);
    var PT = 0; addEventListener("scroll", function(){ if (PT) return; PT = setTimeout(function(){ PT = 0; try { sessionStorage.setItem("ch_lastpos", JSON.stringify({t: Date.now(), y: Math.round(scrollY), h: document.documentElement.scrollHeight, k: window.cur || ""})); } catch(x) {} }, 1000); }, {passive: true});
  } catch(x) {}
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
    "#foldundo{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 132px);z-index:90;border:0;border-radius:999px;padding:9px 16px;font:inherit;font-size:13px;font-weight:700;color:#fff;background:#2563eb;box-shadow:0 4px 14px rgba(0,0,0,.25)}" +
    "#foldbtn span{font-size:14px}#foldbtn.on{display:flex}#foldbtn:active{transform:scale(.96)}" +
    ":root[data-ui=light] #foldbtn{background:#fff;color:#141a26;border-color:#dde2ea}" +
    ".fold-end{display:block;width:100%;margin:10px 0 2px;padding:9px;border:0;border-radius:10px;background:rgba(127,127,127,.1);color:var(--sub,#888);font:inherit;font-size:13px;font-weight:800;cursor:pointer}";
  document.head.appendChild(css);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", make); else make();
  setInterval(function(){ if (!document.hidden) soon(); }, 1500);
})();
