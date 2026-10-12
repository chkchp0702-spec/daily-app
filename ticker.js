/* CH Investing — 미국 종목 이름 밑에 티커 (10/13 사용자: "앞으로 모든 미국 종목들은 밑에 종목티커 달아, 전체 어플 다")
   종목 화면을 여는 모든 곳([data-op] · openOP('…') 링크 · 종목 카드 .nm2)을 살펴, 미국 티커(영문 1~5자)인데
   보이는 글에 티커가 없으면 작은 글씨로 티커를 붙인다. 긴 줄(카드 제목)은 아래 줄에, 칩·한 줄짜리는 옆에.
   한국(.KS/.KQ)·일본(.T)·홍콩(.HK)·중국(.SS/.SZ)은 그대로. 다른 화면 코드는 건드리지 않음 — 그려진 뒤 덧입힘. */
(function(){
  var US = /^[A-Z][A-Z0-9.\-]{0,6}$/;
  function tick(el){
    var t = el.getAttribute("data-op"); if (t) return t;
    var h = el.getAttribute("href") || el.getAttribute("onclick") || "";
    var m = h.match(/openOP\(\s*['"]([^'"]+)['"]/); return m ? m[1] : null;
  }
  function isUS(t){ return US.test(t) && !/\.(KS|KQ|T|HK|SS|SZ|KL|TW|L|PA|DE|AS)$/.test(t) && !/^\d/.test(t); }
  function has(el, t){
    var s = (el.innerText || el.textContent || "").toUpperCase(), tt = t.toUpperCase();
    if (s.split(/\s+/).indexOf(tt) >= 0) return true;
    // 단어 단위로 들어 있나 (TOST 안의 'OST' 같은 우연 제외)
    return new RegExp("(^|[^A-Z0-9])" + tt.replace(/[.\-]/g, "\\$&") + "($|[^A-Z0-9])").test(s);
  }
  function add(el, t){
    if (el.dataset.tk) return; el.dataset.tk = "1";
    if (el.querySelector(".tk2")) return;
    var cs = getComputedStyle(el), inline = /inline/.test(cs.display) || el.tagName === "SPAN" || el.classList.contains("hm-chip") || el.classList.contains("po-kc") || el.classList.contains("po-tk");
    var s = document.createElement("small"); s.className = "tk2" + (inline ? " in" : ""); s.textContent = t;
    // 카드 제목 줄(.nm2 등)은 굵은 이름 바로 뒤에
    var b = el.querySelector(":scope > b, :scope > a > b, :scope > .fo-nm > b, :scope > .n > b");
    if (b && !inline) b.insertAdjacentElement("afterend", s); else el.appendChild(s);
  }
  function scan(){
    var els = document.querySelectorAll('[data-op], a[href*="openOP("], [onclick*="openOP("]');
    for (var i = 0; i < els.length; i++){
      var el = els[i], t = tick(el); if (!t || !isUS(t) || el.dataset.tk) continue;
      if (el.closest("nav,header,.tabbar,#sheet .sh-top")) continue;
      if (has(el, t)) { el.dataset.tk = "1"; continue; }
      add(el, t);
    }
    // 종목 카드 제목(.nm2): 티커가 .cd 로 있지만 한 줄에 잘려 안 보임 → 아래 줄로 (CSS) · 없으면 붙임
    var nm = document.querySelectorAll(".cc .nm2");
    for (var j = 0; j < nm.length; j++){
      var n = nm[j], cd = n.querySelector(".cd"); if (n.dataset.tk) continue;
      if (cd){ n.dataset.tk = "1"; continue; }
    }
  }
  var t = null;
  function later(){ if (t) return; t = setTimeout(function(){ t = null; try { scan(); } catch(e) {} }, 300); }
  var st = document.createElement("style");
  st.textContent = ".tk2{display:block;font-size:11px;line-height:1.25;color:var(--sub);font-weight:500;letter-spacing:.2px;margin-top:1px}" +
    ".tk2.in{display:inline;margin:0 0 0 5px;font-size:10.5px;opacity:.85}" +
    ".cc .nm2{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.25}.cc .nm2 .cd{display:block;margin:1px 0 0;font-size:11.5px}" +
    ".po-kc .tk2.in,.hm-chip .tk2.in{font-size:10px}";
  document.head.appendChild(st);
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length && !(ms[i].target.classList && ms[i].target.classList.contains("tk2"))) { later(); return; } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true});
  later();
})();
