/* CH Investing — 긴 글 접기 (10/12)
   글로만 된 덩어리가 5줄을 넘으면 3줄까지만 보이고 아래는 희미하게 사라짐 → 「더 보기 ▾」 / 「접기 ▴」.
   · 대상: 버튼·차트·표·그림·입력칸이 없는 '글 덩어리'(p · ul · 글만 든 div). 카드 제목은 그대로 둠.
   · 화면이 새로 그려져도 펼친 글은 펼친 채로 (같은 글 첫 40자로 기억).
   · 다른 화면 코드는 건드리지 않음 — 그려진 뒤 살펴보고 덧입힘. */
(function(){
  var TEXT_TAGS = {DIV:1, P:1, SPAN:1, B:1, I:1, EM:1, STRONG:1, SMALL:1, A:1, BR:1, UL:1, OL:1, LI:1, SUP:1, SUB:1, MARK:1, U:1, S:1, CODE:1};
  var SKIP = "button,svg,canvas,table,img,input,select,textarea,details,iframe,video,[data-op],[data-pf],[data-foc],[data-goto],[role=button],.bar,.chip,.pill";
  var OPEN = {};                 // 펼친 글
  var SHOW = 3, MIN = 5;         // 3줄 보이고, 5줄 넘을 때만 접음

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
    set(!!OPEN[k]);
  }

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
  st.textContent = ".clp{overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 55%,transparent);mask-image:linear-gradient(to bottom,#000 55%,transparent)}" +
    ".clp-btn{display:block;margin:2px 0 6px auto;padding:3px 10px;border:1px solid var(--line);border-radius:999px;background:var(--panel2);color:var(--sub);font:inherit;font-size:12px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent}";
  document.head.appendChild(st);
  // 새로 그려질 때 + 숨어 있던 칸이 보일 때(탭·접기 전환은 class/hidden/style 만 바뀜)
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var m = ms[i];
      if (m.type === "childList" ? m.addedNodes.length : !(m.target.dataset && m.target.dataset.clp)) { later(); return; } } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "style", "open"]});
  window.addEventListener("resize", later); window.addEventListener("hashchange", later); document.addEventListener("click", later, true);
  later();
})();
