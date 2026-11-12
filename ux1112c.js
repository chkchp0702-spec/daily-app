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
