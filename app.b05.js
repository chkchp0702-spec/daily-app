/* 📦 app.b05.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 5/8 (vvfix.js … ux1022.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
if(typeof __bs!=="function"){window.__bs=window.__bk=window.__be=function(){};}
__bs(5,36,["vvfix.js", "clamp.js", "ticker.js", "ux1013.js", "story.js", "ux1014.js", "ux1014b.js", "ux1014c.js", "ux1015.js", "ux1015b.js", "ux1015c.js", "ux1019.js", "ux1019b.js", "port_design.js", "twin.js", "threeway.js", "tidy.js", "smooth.js", "calm.js", "ux1022.js"],[4, 54, 135, 197, 426, 494, 653, 801, 973, 1115, 1361, 1501, 1721, 1807, 2576, 2699, 2826, 2960, 3109, 3326]);
/* ======== vvfix.js ======== */
/* 📱 11/02 사용자 「밑에 메뉴 화면이 왜 고정 안 되고 떠 있니」
   iOS 26 사파리·홈 화면 앱 버그: 글자 칸(검색·제안서 입력 등)에서 키보드를 열었다 닫으면 visualViewport.offsetTop 이 0으로 안 돌아와
   화면에 붙어 있어야 할 것들(아래 탭 바·위 성적 띠·상태 표시줄 가림막)이 어긋나 떠 보임 (WebKit 297779 · Apple 포럼 800154).
   → 실제로 보이는 영역(visualViewport)과 어긋난 만큼만 되돌려 붙임. 어긋남이 없으면(정상 기기) 0 이라 아무것도 안 바뀜.
   키보드가 열려 있는 동안·두 손가락으로 확대한 동안은 건드리지 않음. */
(function(){
  var vv = window.visualViewport, D = document.documentElement;
  if (!vv) return;
  var css = document.createElement("style");
  css.textContent =
    "#bnav,#opbtn,.ch-toast{translate:0 var(--vvb,0px)}" +
    "#sbcover,header,.po-stk,.fold-jump{translate:0 var(--vvt,0px)}";
  document.head.appendChild(css);
  var lb = null, lt = null, raf = 0;
  function typing(){ var a = document.activeElement; return !!(a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable) && !/^(button|checkbox|radio|range|submit)$/i.test(a.type || "")); }
  function up(){
    raf = 0;
    var b = 0, t = 0;
    if (!typing() && Math.abs((vv.scale || 1) - 1) < 0.01){
      b = Math.round(vv.offsetTop + vv.height - window.innerHeight);   // 보이는 아래 끝 − 화면 배치 아래 끝 (정상이면 0)
      t = Math.round(vv.offsetTop);                                    // 위쪽이 밀린 만큼 (정상이면 0)
      if (Math.abs(b) < 2 || Math.abs(b) > 320) b = 0;
      if (t < 2 || t > 320) t = 0;
    }
    if (b !== lb){ lb = b; D.style.setProperty("--vvb", b + "px"); }
    if (t !== lt){ lt = t; D.style.setProperty("--vvt", t + "px"); }
  }
  // 11/03 사용자 「스크롤할 때 위아래 고정 칸이 흔들려」 — 스크롤 중엔 아이폰이 주소창·튕김 때문에 보이는 영역 값을 잠깐씩 바꿔
  //   그때마다 따라 움직이던 것이 흔들림이었음 → 스크롤 중엔 손대지 않고, 멈춘 뒤 0.35초 지나 「계속 어긋나 있을 때만」 한 번 맞춤
  var st = null, moving = false;
  function settle(){ st = null; moving = false; var b1 = gap(); setTimeout(function(){ if (!moving && Math.abs(gap() - b1) < 2) soon(); }, 150); }
  function gap(){ return Math.round(vv.offsetTop + vv.height - window.innerHeight); }
  function soon(){ if (moving) return; if (!raf) raf = requestAnimationFrame(up); }
  function onScroll(){ moving = true; clearTimeout(st); st = setTimeout(settle, 350); }
  vv.addEventListener("resize", onScroll);
  vv.addEventListener("scroll", onScroll);
  window.addEventListener("scroll", onScroll, {passive: true});
  window.addEventListener("orientationchange", function(){ setTimeout(up, 400); });
  // 키보드가 닫힌 직후: 화면을 한 번 제자리로 다시 맞추고(같은 위치로 스크롤) 다시 잼
  document.addEventListener("focusout", function(){
    setTimeout(function(){ if (!typing()){ try { window.scrollTo(window.scrollX, window.scrollY); } catch(x) {} up(); } }, 320);
    setTimeout(up, 800);
  });
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) setTimeout(up, 200); });
  up();
  window.__vvfix = function(){ return {vvb: lb, vvt: lt, offTop: vv.offsetTop, vvH: vv.height, inH: window.innerHeight}; };
})();
;
__bk(36);
/* ======== clamp.js ======== */
/* CH Investing — 긴 글 접기 (10/12)
   글로만 된 덩어리가 5줄을 넘으면 3줄까지만 보이고 아래는 희미하게 사라짐 → 「더 보기 ▾」 / 「접기 ▴」.
   · 대상: 버튼·차트·표·그림·입력칸이 없는 '글 덩어리'(p · ul · 글만 든 div). 카드 제목은 그대로 둠.
   · 화면이 새로 그려져도 펼친 글은 펼친 채로 (같은 글 첫 40자로 기억).
   · 다른 화면 코드는 건드리지 않음 — 그려진 뒤 살펴보고 덧입힘. */
(function(){
  var TEXT_TAGS = {DIV:1, P:1, SPAN:1, B:1, I:1, EM:1, STRONG:1, SMALL:1, A:1, BR:1, UL:1, OL:1, LI:1, SUP:1, SUB:1, MARK:1, U:1, S:1, CODE:1};
  var SKIP = "button,svg,canvas,table,img,input,select,textarea,details,iframe,video,[data-op],[data-pf],[data-foc],[data-goto],[role=button],.bar,.chip,.pill";
  var OPEN = {};                 // 펼친 글
  var SHOW = 3, MIN = 4;   // 🎨 11/04 우와: 4줄 넘으면 3줄만 (사용자 「긴 글은 3줄까지만」)         // 10/15: 2줄에서 자르니 어색(「오늘의 판단」 두 줄도 접혔음) → 6줄 넘을 때만, 3줄 보이게

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
    el.__clpSet = function(all){ set(all || !!OPEN[k]); };
    set(allOn() || !!OPEN[k]);
  }
  // A10-5 (10/14): 「📖 전체」 스위치 — 켜져 있으면 새로 접힐 글도 펼친 채로 (window.CLAMP_ALL 이 참을 돌려줄 때)
  function allOn(){ try { return !!(window.CLAMP_ALL && window.CLAMP_ALL()); } catch(x) { return false; } }
  window.clampAll = function(){ var a = allOn(); [].forEach.call(document.querySelectorAll("[data-clp]"), function(el){ if (el.__clpSet) el.__clpSet(a); }); };

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
  st.textContent = ".clp{overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 66%,transparent);mask-image:linear-gradient(to bottom,#000 66%,transparent)}" +
    ".clp-btn{display:block;margin:2px 0 6px auto;padding:3px 10px;border:1px solid var(--line);border-radius:999px;background:var(--panel2);color:var(--sub);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent}";
  document.head.appendChild(st);
  // 새로 그려질 때 + 숨어 있던 칸이 보일 때(탭·접기 전환은 class/hidden/style 만 바뀜)
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var m = ms[i];
      if (m.type === "childList" ? m.addedNodes.length : !(m.target.dataset && m.target.dataset.clp)) { later(); return; } } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "style", "open"]});
  window.addEventListener("resize", later); window.addEventListener("hashchange", later); document.addEventListener("click", later, true);
  later();
})();
;
__bk(37);
/* ======== ticker.js ======== */
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
    var re = new RegExp("(^|[^A-Z0-9])" + tt.replace(/[.\-]/g, "\\$&") + "($|[^A-Z0-9])");
    if (re.test(s)) return true;
    // A2 (10/13): 글자 조각마다 따로 봄 — 순위 숫자(「1」)와 붙어 「1INSM」으로 읽혀 이름=티커인데 티커 줄이 한 번 더 붙던 것
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) if (re.test(String(n.nodeValue || "").toUpperCase())) return true;
    return false;
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
  st.textContent = ".tk2{display:block;font-size:12.5px;line-height:1.25;color:var(--sub);font-weight:500;letter-spacing:.2px;margin-top:1px}" +
    ".tk2.in{display:inline;margin:0 0 0 5px;font-size:12.5px;opacity:.85}" +
    ".cc .nm2{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.25}.cc .nm2 .cd{display:block;margin:1px 0 0;font-size:12.5px}" +
    ".po-kc .tk2.in,.hm-chip .tk2.in{font-size:12.5px}";
  document.head.appendChild(st);
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length && !(ms[i].target.classList && ms[i].target.classList.contains("tk2"))) { later(); return; } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true});
  later();
})();
;
__bk(38);
/* ======== ux1013.js ======== */
/* CH Investing — 10/13 아이디어 보고 A1~A5 (사용자: "A 1번부터 5번까지 다 실행해")
   A1 🔙 「뒤로」 버튼: 아래로 스크롤하면 숨고, 위로 올리면 다시 (목록 숫자를 가리지 않게)
   A2 🏷 이름 = 티커면 아래 티커 줄 안 붙임 → ticker.js
   A3 🧭 시장 탭 맨 위 목차 칩 (누르면 그 카드로 · 위에 붙어 다님)
   A4 🕰 포트 탭 「과거로 돌려 보기」 — 해를 누르면 💼·⚡·🎯·S&P 그 해 성적·가장 깊게 빠진 폭 (market/skel_bt.json)
   A5 👆 종목 이름 길게 누르면 미리보기 (1년 주간 그래프·52주 위치·신호·포트) — 화면 이동 없이 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; d = d == null ? 1 : d; return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function J(name){ return getJSON(RAW + name + "?" + Math.floor(Date.now() / 600000), {ttl: 600000}); }
  function hh(){ var h = document.querySelector("header"); return h ? h.offsetHeight : 0; }

  /* ---------- A1 뒤로 버튼: 스크롤 방향 따라 숨김 ---------- */
  var lastY = window.scrollY || 0, acc = 0;
  window.addEventListener("scroll", function(){
    var b = document.getElementById("backbtn"); if (!b) return;
    var y = window.scrollY || 0, d = y - lastY; lastY = y;
    if (y < 0 || y > document.documentElement.scrollHeight - window.innerHeight - 4) return;   // 11/03 튕김 구간 무시
    if ((d > 0) !== (acc > 0)) acc = 0;
    acc += d;
    var nearEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 40;
    if (y < 80 || nearEnd || acc < -24) b.classList.remove("hid");
    else if (acc > 24) b.classList.add("hid");
  }, {passive: true});

  /* ---------- A3 시장 탭 목차 칩 ---------- */
  var NICE = [[/mk-kick/, "⚡ 킥"], [/mk-focus/, "🎯 집중"], [/^mkid$/, "💡 새 규칙"], [/mk-lead2/, "🔥 돈 몰리는 곳"], [/mk-us/, "🇺🇸 미국장"]];
  function label(sec){
    for (var i = 0; i < NICE.length; i++) if (NICE[i][0].test(sec.className) || NICE[i][0].test(sec.id)) return NICE[i][1];
    var t = ((sec.innerText || "").split("\n")[0] || "").replace(/ⓘ/g, "").trim();
    if (/할 일/.test(t)) return "✅ 할 일";
    if (/오늘의 숫자/.test(t)) return "🔢 숫자";
    if (/자산 배분/.test(t)) return "💼 배분";
    if (/판단/.test(t)) return "🧠 판단";
    if (/더 보기/.test(t)) return "📂 더 보기";
    t = t.replace(/^(\S+)\s+(오늘의|지금|전일)\s+/, "$1 ");
    return t.length > 9 ? t.slice(0, 9) : t;
  }
  function mkToc(){
    if (window.cur !== "market") return;
    var body = document.getElementById("body"); if (!body || (body.firstElementChild && body.firstElementChild.classList.contains("loading"))) return;
    var secs = [].filter.call(body.querySelectorAll("section.card, .xs-more"), function(s){
      if (s.closest(".xs-more") && !s.classList.contains("xs-more")) return false;   // 접힌 「더 보기」 안은 하나로
      if (!s.offsetHeight || s.offsetHeight < 60) return false;
      return (s.innerText || "").trim().length > 8;
    });
    if (secs.length < 3) return;
    var sig = secs.map(function(s){ return label(s); }).join("|");
    var bar = document.getElementById("mktoc");
    if (bar && bar.dataset.sig === sig) return;
    if (!bar){ bar = document.createElement("div"); bar.id = "mktoc"; bar.className = "fold-jump mk-toc"; body.parentNode.insertBefore(bar, body); }
    bar.dataset.sig = sig;
    var seen = {};
    // 10/15: 칩은 안쪽 스크롤 칸(.mk-tsc)에 — 오른쪽 「📖 전체 펼치기」가 칩을 덮지 않게
    bar.innerHTML = '<div class="mk-tsc">' + secs.map(function(s, i){ var l = label(s); if (seen[l]) return ""; seen[l] = 1;
      if (!s.id) s.id = "mkt" + i; return '<button data-j="' + e(s.id) + '">' + e(l) + '</button>'; }).join("") + '</div>';
    var sc = bar.querySelector(".mk-tsc");
    [].forEach.call(sc.querySelectorAll("button"), function(bt){ bt.onclick = function(){
      var el = document.getElementById(bt.dataset.j); if (!el) return;
      if (window.unclamp) try { unclamp(el.querySelector(".xs-clamp") || el); } catch(x) {}
      [].forEach.call(sc.children, function(x){ x.classList.toggle("on", x === bt); }); sc.scrollLeft = bt.offsetLeft - sc.offsetLeft - 60;
      var y = el.getBoundingClientRect().top + window.scrollY - (hh() + bar.offsetHeight + 8);
      window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); }; });
    if (window.mkTocExtra) try { mkTocExtra(bar); } catch(x) {}   // A10-5 📝 요약 / 📖 전체 (ux1014.js)
  }
  var tt = null;
  new MutationObserver(function(){ if (window.cur === "port" && !document.getElementById("potm") && document.getElementById("pobody")) setTimeout(tmMount, 0);
    if (window.cur !== "market" || tt) return; tt = setTimeout(function(){ tt = null; try { mkToc(); } catch(x) {} }, 500); })
    .observe(document.getElementById("main") || document.body, {childList: true, subtree: true});

  /* ---------- A4 포트 탭 「과거로 돌려 보기」 ---------- */
  var SK = null, YSEL = "2022";
  var ROWS = [["base", "💼 기본", "#7c9cff"], ["kick", "⚡ 킥 기본 칸", "#f2a93b"], ["conc", "🎯 집중", "#24c08a"], ["spy", "S&P500", "#8a94a8"]];
  function yrOf(k, y){
    if (!SK) return null;
    var src = k === "spy" ? SK.spy : (function(){ var r = SK.roles && SK.roles[k]; return r && (r.live_row || r.pick); })();
    if (!src) return null;
    var p = y >= "2017" ? src.oos : src.is; if (!p || !p.yr || p.yr[y] == null) return null;
    return {r: p.yr[y], dd: p.yr_mdd ? p.yr_mdd[y] : null};
  }
  var MARK = {"2008": "금융위기", "2011": "미 신용등급 강등", "2015": "중국 쇼크", "2018": "금리 인상·무역전쟁", "2020": "코로나", "2022": "금리 급등"};
  function tmDraw(){
    var box = document.getElementById("potm"); if (!box || !SK) return;
    var years = Object.keys((SK.spy.is || {}).yr || {}).concat(Object.keys((SK.spy.oos || {}).yr || {})).sort();
    if (years.indexOf(YSEL) < 0) YSEL = years[years.length - 1];
    var vals = ROWS.map(function(r){ return yrOf(r[0], YSEL); });
    var mx = Math.max.apply(null, vals.map(function(v){ return v ? Math.max(Math.abs(v.r), Math.abs(v.dd || 0)) : 0; }).concat([5]));
    var amt = 1000;   // 만 원
    var best = null; ROWS.forEach(function(r, i){ if (r[0] !== "spy" && vals[i] && (best == null || vals[i].r > vals[best].r)) best = i; });
    box.innerHTML = '<div class="tm-h"><b>🕰 과거로 돌려 보기</b><small>지금 규칙을 그 해에 썼다면</small></div>' +
      '<div class="tm-ys">' + years.map(function(y){ return '<button data-y="' + y + '" class="' + (y === YSEL ? "on" : "") + (MARK[y] ? " mk" : "") + (y < "2017" ? " is" : "") + '">' + y.slice(2) + (MARK[y] ? "<i>●</i>" : "") + '</button>'; }).join("") + '</div>' +
      '<div class="tm-t"><b>' + YSEL + '년</b>' + (MARK[YSEL] ? ' <span class="tm-mk">' + MARK[YSEL] + '</span>' : '') + '<small>' + (YSEL < "2017" ? "규칙을 고른 기간" : "규칙 고를 때 안 본 기간") + (YSEL === years[0] ? " · 7월부터" : "") + (YSEL === years[years.length - 1] ? " · 올해는 " + e(String(SK.to || "").slice(5).replace("-", "/")) + "까지" : "") + '</small></div>' +
      ROWS.map(function(r, i){ var v = vals[i]; if (!v) return '<div class="tm-r"><span class="n">' + r[1] + '</span><span class="mut">자료 없음</span></div>';
        var w = Math.abs(v.r) / mx * 50, wd = v.dd != null ? Math.abs(v.dd) / mx * 50 : 0, end = Math.round(amt * (1 + v.r / 100));
        return '<div class="tm-r' + (i === best ? " best" : "") + '"><span class="n">' + r[1] + '</span>' +
          '<span class="bar"><i class="z"></i><i class="f" style="' + (v.r >= 0 ? "left:50%" : "right:50%") + ';width:' + w.toFixed(1) + '%;background:' + r[2] + '"></i>' +
          (v.dd != null ? '<i class="d" style="right:50%;width:' + wd.toFixed(1) + '%"></i>' : '') + '</span>' +
          '<span class="v"><b class="' + cls(v.r) + '">' + sg(v.r) + '</b></span>' +
          '<span class="w">' + (v.dd != null ? "가장 깊게 " + sg(v.dd, 0) + " · " : "") + '1,000만 원 → <b>' + end.toLocaleString("ko-KR") + '만</b></span></div>'; }).join("") +
      '<p class="tm-n">막대 = 그 해 수익 · 옅은 막대 = 그 해 고점에서 가장 깊게 빠진 폭. 🦴 변동성 맞춤까지 넣은 지금 규칙 · 비용 포함 · 달러 기준. ⚡는 기본 칸만(돌파·고래 칸 빼고). 과거 계산이라 미래를 보장하지 않아요.</p>';
    [].forEach.call(box.querySelectorAll(".tm-ys button"), function(b){ b.onclick = function(){ YSEL = b.dataset.y; tmDraw();
      var on = box.querySelector(".tm-ys .on"); if (on && on.scrollIntoView) try { on.scrollIntoView({inline: "center", block: "nearest"}); } catch(x) {} }; });
  }
  function tmMount(){
    var pb = document.getElementById("pobody"); if (!pb || document.getElementById("potm")) return;
    var s = document.createElement("section"); s.className = "card tm-c"; s.id = "potm";
    s.innerHTML = '<div class="loading">과거 성적 불러오는 중…</div>';
    pb.parentNode.insertBefore(s, pb.nextSibling);
    var addChip = function(){ var jb = document.querySelector("#main .fold-jump:not(.mk-toc)"); if (!jb || jb.querySelector('[data-j="potm"]')) return !!jb;
      var b = document.createElement("button"); b.dataset.j = "potm"; b.textContent = "🕰 과거";
      b.onclick = function(){ var y = s.getBoundingClientRect().top + window.scrollY - (hh() + jb.offsetHeight + 8); window.scrollTo({top: y, behavior: "smooth"}); };
      jb.appendChild(b); return true; };
    var tries = 0; (function again(){ if (!addChip() && ++tries < 20) setTimeout(again, 500); })();
    (SK ? Promise.resolve(SK) : J("skel_bt.json")).then(function(j){ SK = j; tmDraw();
      var on = s.querySelector(".tm-ys .on"); if (on) s.querySelector(".tm-ys").scrollLeft = on.offsetLeft - 120; })
      .catch(function(){ s.remove(); });
  }
  var _pi = window.portInit;
  if (_pi) window.portInit = function(){ var r = _pi.apply(this, arguments); setTimeout(tmMount, 0); return r; };

  /* ---------- A5 길게 눌러 미리보기 ---------- */
  var SEL = '[data-op], a[href*="openOP("], [onclick*="openOP("]';
  function symOf(el){
    var t = el.getAttribute("data-op"); if (t) return t;
    var h = el.getAttribute("href") || el.getAttribute("onclick") || "";
    var m = h.match(/openOP\(\s*['"]([^'"]+)['"]/); return m ? m[1] : null;
  }
  var UNIT = {KR: "원", JP: "엔", US: "달러", HK: "홍콩달러", CN: "위안"};
  var SIGX = null;
  function closePv(){ var p = document.getElementById("lpv"); if (p) p.remove(); }
  function openPv(code){
    closePv();
    var wrap = document.createElement("div"); wrap.id = "lpv";
    wrap.innerHTML = '<div class="lpv-bg"></div><div class="lpv-s"><div class="lpv-grab"></div><div class="lpv-b"><div class="loading">' + e(code) + ' 불러오는 중…</div></div></div>';
    document.body.appendChild(wrap);
    wrap.querySelector(".lpv-bg").onclick = closePv;
    var body = wrap.querySelector(".lpv-b");
    var idx = (typeof opLoadIdx === "function") ? opLoadIdx().catch(function(){}) : Promise.resolve();
    idx.then(function(){
      var r = (typeof opFind === "function") ? opFind(code) : null, sym = r ? r.sym : code;
      var sh = opShard(sym);
      return Promise.all([
        OPP[sh] ? Promise.resolve(OPP[sh]) : getJSON(OPD + "p/" + sh + ".json").then(function(j){ OPP[sh] = j; return j; }).catch(function(){ return {}; }),
        SIGX ? Promise.resolve(SIGX) : J("sigindex.json").then(function(j){ SIGX = j.ix || {}; return SIGX; }).catch(function(){ return {}; })
      ]).then(function(a){
        if (!document.getElementById("lpv")) return;
        var p = (a[0] || {})[sym], ix = a[1] || {}, S = String(sym).toUpperCase(), c0 = S.replace(/\.(KS|KQ)$/, "");
        var x = ix[S] || ix[c0] || ix[c0.replace(/^0+/, "")] || null, u = UNIT[r && r.mkt] || "";
        var h = '<div class="lpv-t"><b>' + e(r ? r.name : code) + '</b><small>' + e(sym) + (r && r.etf ? ' · ETF' : '') + '</small></div>';
        if (p){
          var chg = (p[1] / p[2] - 1) * 100, pos = p[3] > p[4] ? (p[1] - p[4]) / (p[3] - p[4]) * 100 : null;
          h += '<div class="lpv-px"><b>' + fmtPrice(p[1], u) + '</b><span class="' + cls(chg) + '">' + sg(chg, 2) + '</span><small>' + e(String(p[0]).slice(5).replace("-", "/")) + ' 종가</small></div>' +
            '<div class="lpv-ch">' + opChart(p, u) + '</div>' +
            (pos != null ? '<div class="lpv-rg"><small>52주 바닥</small><span class="t"><i style="left:' + Math.max(0, Math.min(100, pos)).toFixed(0) + '%"></i></span><small>꼭대기</small></div>' +
              '<div class="lpv-rgn">1년 범위에서 <b>' + pos.toFixed(0) + '%</b> 자리</div>' : '');
        } else h += '<div class="spark-empty">가격 자료가 아직 없어요</div>';
        var parts = [];
        if (x && x.tags) parts.push('<span class="lpv-tg">' + e(x.tags) + ' 신호' + (x.last ? ' · ' + e(String(x.last).slice(5).replace("-", "/")) : '') + '</span>');
        if (x && x.kick != null) parts.push('<span>⚡ 킥에 ' + (+x.kick).toFixed(1) + '%</span>');
        if (x && x.port) parts.push('<span>💼 포트 「' + e(x.port) + '」</span>');
        if (x && x.focus) parts.push('<span>🎯 집중 「' + e(x.focus) + '」</span>');
        if (x && x.bet) parts.push('<span>🧠 ' + e(x.bet) + '</span>');
        h += '<div class="lpv-sg">' + (parts.length ? parts.join("") : '<span class="mut">오늘 걸린 신호 없음</span>') + '</div>' +
          '<div class="lpv-a"><button class="btn lpv-go">📄 종목리포트 열기</button><button class="btn lpv-x">닫기</button></div>';
        body.innerHTML = h;
        body.querySelector(".lpv-go").onclick = function(){ closePv(); openOP(code); };
        body.querySelector(".lpv-x").onclick = closePv;
      });
    }).catch(function(){ body.innerHTML = '<div class="spark-empty">불러오지 못했어요</div>'; });
  }
  var lp = null, sx = 0, sy = 0, fired = 0, pvTouch = false;
  document.addEventListener("touchstart", function(ev){
    pvTouch = false;
    var el = ev.target.closest && ev.target.closest(SEL); if (!el || ev.touches.length > 1) return;
    var code = symOf(el); if (!code) return;
    sx = ev.touches[0].clientX; sy = ev.touches[0].clientY;
    clearTimeout(lp); lp = setTimeout(function(){ lp = null; fired = Date.now(); pvTouch = true; if (navigator.vibrate) try { navigator.vibrate(12); } catch(x) {} openPv(code); }, 480);
  }, {passive: true});
  document.addEventListener("touchmove", function(ev){ if (!lp) return; var t = ev.touches[0]; if (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10){ clearTimeout(lp); lp = null; } }, {passive: true});
  document.addEventListener("touchend", function(){ if (lp){ clearTimeout(lp); lp = null; } else if (pvTouch){ pvTouch = false; fired = Date.now(); } }, {passive: true});
  document.addEventListener("touchcancel", function(){ if (lp){ clearTimeout(lp); lp = null; } }, {passive: true});
  // 길게 누른 뒤 손을 떼면 생기는 클릭은 버림 (종목 화면으로 넘어가지 않게)
  document.addEventListener("click", function(ev){ if (fired && Date.now() - fired < 700){ ev.preventDefault(); ev.stopPropagation(); fired = 0; } }, true);
  // 컴퓨터: 오른쪽 클릭 · 안드로이드: 길게 누르기 메뉴 대신
  document.addEventListener("contextmenu", function(ev){
    var el = ev.target.closest && ev.target.closest(SEL); if (!el) return; var code = symOf(el); if (!code) return;
    ev.preventDefault(); if (Date.now() - fired > 900){ fired = Date.now(); openPv(code); } });
  document.addEventListener("keydown", function(ev){ if (ev.key === "Escape") closePv(); });

  /* ---------- 모양 ---------- */
  var st = document.createElement("style");
  st.textContent = [
    "#backbtn{transition:transform .22s ease,opacity .22s ease}#backbtn.hid{transform:translateY(170%);opacity:0;pointer-events:none}",
    ".mk-toc{margin-top:2px}.mk-toc button.on{border-color:var(--c,#7c9cff);color:var(--c,#7c9cff)}",
    ".tm-c{padding:14px}.tm-h{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}.tm-h b{font-size:16px}.tm-h small{color:var(--sub);font-size:12.5px}",
    ".tm-ys{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:0 -14px 10px;padding:2px 14px}.tm-ys::-webkit-scrollbar{display:none}",
    ".tm-ys button{flex:none;position:relative;min-width:38px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:6px 0;font:inherit;font-size:13px;font-variant-numeric:tabular-nums;cursor:pointer}",
    ".tm-ys button.is{opacity:.75}.tm-ys button i{position:absolute;top:1px;right:4px;font-size:7px;color:#e5534b;font-style:normal}",
    ".tm-ys button.on{background:var(--c,#7c9cff);border-color:var(--c,#7c9cff);color:#111;font-weight:700;opacity:1}",
    ".tm-t{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin:2px 0 8px}.tm-t b{font-size:20px}.tm-t small{color:var(--sub);font-size:12.5px;flex-basis:100%}",
    ".tm-mk{font-size:12.5px;padding:2px 8px;border-radius:999px;background:rgba(229,83,75,.15);color:#e5534b}",
    ".tm-r{display:grid;grid-template-columns:96px 1fr 62px;row-gap:3px;column-gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}",
    ".tm-r .n{font-size:13px;font-weight:600}.tm-r.best .n::after{content:' 👑';font-size:12.5px}",
    ".tm-r .bar{position:relative;height:14px}.tm-r .bar i{position:absolute;top:0;bottom:0;border-radius:4px}.tm-r .bar .z{left:50%;width:1px;background:var(--line);border-radius:0}",
    ".tm-r .bar .d{top:9px;bottom:-2px;background:rgba(229,83,75,.28)}",
    ".tm-r .v{text-align:right}.tm-r .v b{font-size:15px;font-variant-numeric:tabular-nums}",
    ".tm-r .w{grid-column:1/4;font-size:12.5px;color:var(--sub);text-align:right;font-variant-numeric:tabular-nums}.tm-r .w b{color:var(--text);font-weight:600}",
    ".tm-n{font-size:12.5px;color:var(--sub);margin:8px 0 0;line-height:1.5}",
    "#lpv{position:fixed;inset:0;z-index:200}#lpv .lpv-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);animation:lpvf .18s ease}",
    "#lpv .lpv-s{position:absolute;left:0;right:0;bottom:0;max-height:78vh;overflow:auto;background:var(--panel);border-top-left-radius:20px;border-top-right-radius:20px;border:1px solid var(--line);padding:8px 16px calc(env(safe-area-inset-bottom) + 16px);box-shadow:0 -18px 40px -12px rgba(0,0,0,.5);animation:lpvu .22s cubic-bezier(.2,.8,.2,1)}",
    ".lpv-grab{width:38px;height:4px;border-radius:4px;background:var(--line);margin:0 auto 10px}",
    ".lpv-t b{font-size:18px}.lpv-t small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}",
    ".lpv-px{display:flex;align-items:baseline;gap:8px;margin:8px 0 4px}.lpv-px b{font-size:22px;font-variant-numeric:tabular-nums}.lpv-px small{color:var(--sub);font-size:12.5px;margin-left:auto}",
    ".lpv-ch svg{width:100%;height:auto;display:block}.lpv-ch .muted,.lpv-ch>div{font-size:12.5px;color:var(--sub);margin-top:4px}",
    ".lpv-rg{display:flex;align-items:center;gap:8px;margin-top:8px}.lpv-rg small{font-size:12.5px;color:var(--sub);flex:none}.lpv-rg .t{position:relative;flex:1;height:6px;border-radius:6px;background:linear-gradient(90deg,#1f4e9c,#8a94a8,#c0392b)}",
    ".lpv-rg .t i{position:absolute;top:-4px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--text);border:2px solid var(--panel)}",
    ".lpv-rgn{font-size:12.5px;color:var(--sub);text-align:center;margin-top:4px}",
    ".lpv-sg{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.lpv-sg span{font-size:12.5px;padding:4px 10px;border-radius:999px;background:var(--panel2);border:1px solid var(--line)}.lpv-sg .mut{background:none;border:0;color:var(--sub);padding:0}",
    ".lpv-a{display:flex;gap:8px}.lpv-a .btn{flex:1;padding:11px 0;font-size:14px;text-align:center}.lpv-go{font-weight:700}",
    "@keyframes lpvu{from{transform:translateY(100%)}to{transform:none}}@keyframes lpvf{from{opacity:0}to{opacity:1}}",
    "[data-op],a[href*='openOP('],[onclick*='openOP(']{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}"
  ].join("\n");
  document.head.appendChild(st);
})();
;
__bk(39);
/* ======== story.js ======== */
/* CH Investing — 🎞 아침 30초 스토리 (10/14 A9-4, 사용자 「다 해 보자」)
   홈 날짜 줄의 「▶ 30초」 → 전체 화면에 카드 한 장씩: 어제 결과 → 포트 → 킥 → 오늘 집중 → 🔮 오늘 예고
   · 위에 진행 막대(장 수만큼) · 화면 오른쪽 톡 = 다음, 왼쪽 톡 = 앞 · 6초 자동 넘김 · 마지막 장에 📤 공유
   · 넘기기는 「톡」만(아이폰 가장자리 스와이프 = 뒤로가기와 안 부딪히게) · ✕ 로 닫음 · 홈 카드 HTML 을 그대로 복사하니 새 자료 없음 */
(function(){
  var SEC = 6000, timer = null, idx = 0, pages = [], box = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function pick(){
    var b = document.getElementById("hmbody"); if (!b) return [];
    var out = [], q = function(sel){ return b.querySelector(sel); };
    var grade = q('section[data-goto="market"]'), port = q('section[data-goto="port~pohero"]'), kick = q('section[data-goto="port~pokick"]'), focus = q('section[data-goto="market~mkfo"]');
    if (grade){ var g = grade.cloneNode(true); var wn = g.querySelector(".hm-wn"); if (wn) wn.remove(); var vs = g.querySelector(".hm-vs"); if (vs) vs.remove(); out.push({t: "어제 예고 → 오늘 결과", el: g}); }
    if (port) out.push({t: "포트", el: port.cloneNode(true)});
    if (kick) out.push({t: "킥", el: kick.cloneNode(true)});
    if (focus) out.push({t: "오늘 집중", el: focus.cloneNode(true)});
    if (grade){ var wn2 = grade.querySelector(".hm-wn"); if (wn2){ var s = document.createElement("section"); s.className = "card hm-c";
      s.innerHTML = '<div class="hm-h"><span class="hm-i">🔮</span><div><b>오늘의 예고</b><small>내일 아침 채점 · 👍👎 로 내 표도</small></div></div>'; s.appendChild(wn2.cloneNode(true)); out.push({t: "오늘의 예고", el: s}); } }
    out.forEach(function(p){ [].forEach.call(p.el.querySelectorAll(".hm-sh, .hm-go"), function(x){ x.remove(); }); p.el.removeAttribute("data-goto"); });
    return out;
  }
  function draw(){
    var p = pages[idx]; if (!p) return close();
    box.querySelector(".st-bar").innerHTML = pages.map(function(_, i){ return '<i class="' + (i < idx ? "done" : i === idx ? "on" : "") + '"></i>'; }).join("");
    var body = box.querySelector(".st-body"); body.innerHTML = ""; body.appendChild(p.el.cloneNode(true)); body.scrollTop = 0;
    box.querySelector(".st-n").textContent = (idx + 1) + " / " + pages.length + " · " + p.t;
    var ft = box.querySelector(".st-ft"); ft.innerHTML = idx === pages.length - 1 ? '<button class="hm-sh" data-share="port">📤 카톡으로 공유</button><button class="st-done">다 봤어요 ✓</button>' : '<span class="mut">화면을 톡 치면 다음 · 왼쪽은 앞</span>';
    var dn = ft.querySelector(".st-done"); if (dn) dn.onclick = function(ev){ ev.stopPropagation(); close(); };
    arm();
  }
  function arm(){ clearTimeout(timer); timer = setTimeout(function(){ if (idx < pages.length - 1){ idx++; draw(); } else clearTimeout(timer); }, SEC); }
  function close(){ clearTimeout(timer); if (box){ box.remove(); box = null; } document.documentElement.classList.remove("st-lock"); }
  window.hmStory = function(){
    close();
    pages = pick();
    if (!pages.length){ if (window.P && window.P.toast) window.P.toast("아직 보여 줄 카드가 없어요"); return; }
    idx = 0;
    box = document.createElement("div"); box.id = "hmst";
    box.innerHTML = '<div class="st-bar"></div><div class="st-top"><span class="st-n"></span><button class="st-x" aria-label="닫기">✕</button></div><div class="st-body"></div><div class="st-ft"></div>';
    document.body.appendChild(box);
    document.documentElement.classList.add("st-lock");
    box.querySelector(".st-x").onclick = function(ev){ ev.stopPropagation(); close(); };
    // 톡: 오른쪽 70% = 다음, 왼쪽 30% = 앞 — 버튼·표(👍👎)·공유는 그대로 눌림
    box.addEventListener("click", function(ev){
      if (ev.target.closest("button, [data-share], [data-vote], a")) return;
      ev.preventDefault(); ev.stopPropagation();
      var x = (ev.clientX || 0) / Math.max(1, window.innerWidth);
      if (x < 0.3){ if (idx > 0){ idx--; draw(); } else arm(); }
      else { if (idx < pages.length - 1){ idx++; draw(); } else close(); }
    }, true);
    draw();
  };
  var st = document.createElement("style");
  st.textContent = [
    "#hmst{position:fixed;inset:0;z-index:80;background:var(--bg);display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 10px) 12px calc(env(safe-area-inset-bottom) + 12px)}",
    ".st-lock,.st-lock body{overflow:hidden}",
    ".st-bar{display:flex;gap:4px;height:4px;margin:0 2px 10px}.st-bar i{flex:1;background:var(--line);border-radius:2px;overflow:hidden;position:relative}.st-bar i.done{background:var(--text)}",
    ".st-bar i.on::after{content:'';position:absolute;left:0;top:0;bottom:0;width:0;background:var(--text);animation:stfill " + SEC + "ms linear forwards}@keyframes stfill{to{width:100%}}",
    ".st-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.st-n{font-size:12.5px;color:var(--sub);font-weight:700}",
    ".st-x{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;width:32px;height:32px;font-size:15px;cursor:pointer}",
    ".st-body{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column}.st-body .card{margin:auto 0;font-size:1.06em}.st-body .hm-big b{font-size:24px}.st-body .hm-h b{font-size:18px}",
    ".st-ft{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:8px;font-size:12.5px;color:var(--sub)}.st-ft .hm-sh{margin:0}",
    ".st-done{border:0;background:var(--acc,#7c9cff);color:#111;border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}"
  ].join("\n");
  document.head.appendChild(st);
})();
;
__bk(40);
/* ======== ux1014.js ======== */
/* CH Investing — 10/14 10시 아이디어 보고 A10 (사용자: "3번 빼고 다 진행")
   A10-1 🟢⚪ 시장판 장중/마감 점은 index.html marketBoard · 여기선 「오늘의 숫자」 카드에 「지금 →」 한 줄
   A10-2 🧵 「며칠째 나오는 이름」 칩 — 🔥 돈 몰리는 곳 카드 맨 위 (archive/x/market_x.json chips: 날짜별 리포트에 나온 종목)
   A10-4 📌 아침판 한 줄 맨 위 띠는 views.js · 미국장 카드 같은 제목 빼기는 plus8.js · 여기선 띠 모양(CSS)
   A10-5 📖 「요약 / 전체」 스위치 — 시장 탭 목차 칩 줄 오른쪽 끝 (clamp.js 글 접기 + simple.js 긴 카드 접기 모두) · 휴대폰에 기억 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function isLatest(){ try { var L = (M && M.cats && M.cats.market) || []; return !!L.length && (!window.curDate || curDate === L[0].id); } catch(x) { return false; } }

  /* ---------- A10-5 요약 / 전체 ---------- */
  window.CLAMP_ALL = function(){ return window.cur === "market" && !!(window.store && store.mkFull); };
  function applyFull(){
    if (window.cur !== "market") return;
    var on = !!store.mkFull, main = document.getElementById("main"); if (!main) return;
    [].forEach.call(main.querySelectorAll("section.card[data-xc]"), function(c){
      var b = c.querySelector(":scope > .xs-cl");
      if (on && c.classList.contains("xs-clamp")){ c.classList.remove("xs-clamp"); c.dataset.xfull = "1"; if (b) b.textContent = "접기 ▴"; }
      else if (!on && c.dataset.xfull){ delete c.dataset.xfull; c.classList.add("xs-clamp"); if (b) b.textContent = "전체 보기 ▾"; }
    });
    if (window.clampAll) clampAll();
  }
  function readMin(){ var b = document.getElementById("body"); var n = b ? (b.innerText || "").replace(/\s+/g, "").length : 0; return Math.max(1, Math.round(n / 500)); }
  window.mkTocExtra = function(bar){
    var bt = bar.querySelector(".mk-full");
    if (!bt){ bt = document.createElement("button"); bt.className = "mk-full"; bar.appendChild(bt);
      bt.onclick = function(ev){ ev.stopPropagation(); store.mkFull = !store.mkFull; try { save(); } catch(x) {} applyFull(); paint(); }; }
    var paint = function(){ bt.innerHTML = (store.mkFull ? "📝 요약으로" : "📖 전체 펼치기") + ' <small>약 ' + readMin() + '분</small>'; bt.classList.toggle("on", !!store.mkFull); };
    paint(); setTimeout(paint, 2500);
  };

  /* ---------- A10-1 오늘의 숫자 「지금 →」 ---------- */
  var KMAP = [[/^S&P ?500/i, "sp500"], [/^코스피\s*\(/, "kospi"], [/^코스닥/, "kosdaq"], [/^나스닥/, "nasdaq"], [/^다우/, "dow"], [/^VIX/i, "vix"],
              [/^(달러[·\/]?원|원\/달러)/, "usdkrw"], [/^미국 10년/, "us10y"], [/^(브렌트 \/ )?WTI|^브렌트/, "wti"], [/^금\b|^금 \(/, "gold"],
              [/^삼성전자/, "samsung"], [/^SK하이닉스/, "hynix"], [/^엔비디아/, "nvidia"], [/^마이크론/, "micron"]];
  function fmtV(k, v){ if (k === "us10y") return v.toFixed(2) + "%"; return Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : v.toLocaleString(undefined, {maximumFractionDigits: 2}); }
  function mdNum(s){ var m = String(s || "").match(/(\d{1,2})\/(\d{1,2})/); return m ? (+m[1]) * 100 + (+m[2]) : null; }
  function kpiNow(){
    var d = window.__LATEST; if (!d || window.cur !== "market" || !isLatest()) return;
    var it = d.items || {}, fT = Date.parse(String(d.fetched_kst || "").replace(" ", "T") + ":00+09:00");
    [].forEach.call(document.querySelectorAll("#mbody .kpis2 .kp:not([data-now])"), function(kp){
      kp.dataset.now = "1";
      var lab = ((kp.querySelector("small") || {}).textContent || "").trim(), key = null;
      for (var i = 0; i < KMAP.length; i++) if (KMAP[i][0].test(lab)) { key = KMAP[i][1]; break; }
      var x = key && it[key]; if (!x || x.value == null || !window.mktState) return;
      var s = mktState(x, fT); if (!s) return;
      var ld = mdNum(lab), xd = mdNum(s.md);
      if (!(s.live || (ld != null && xd != null && xd > ld))) return;      // 리포트 숫자보다 새 값일 때만
      var cp = x.change_pct, c = cp > 0 ? "up" : cp < 0 ? "dn" : "";
      var el = document.createElement("div"); el.className = "kp-now";
      el.innerHTML = '지금 → ' + (key === "wti" && /브렌트/.test(lab) ? "WTI " : "") + '<b class="' + c + '">' + e(fmtV(key, x.value)) + '</b>' + (cp != null ? ' <span class="' + c + '">(' + (cp > 0 ? "+" : "") + cp.toFixed(2) + '%)</span>' : '') +
        ' <span class="mut">' + (s.live ? "🟢 장중" : "⚪ " + e(s.md) + " 마감") + '</span>';
      var b = kp.querySelector("b"); if (b && b.nextElementSibling) b.nextElementSibling.insertAdjacentElement("afterend", el); else kp.appendChild(el);
    });
  }
  document.addEventListener("latest-ready", function(){ setTimeout(kpiNow, 50); });

  /* ---------- A10-2 며칠째 나오는 이름 ---------- */
  var MXP = null;
  function mx(){ if (!MXP) MXP = getJSON("archive/x/market_x.json?" + ((window.M && M.updated) || "")).catch(function(){ MXP = null; return null; }); return MXP; }
  function streaks(MX, id){
    var C = MX && MX.chips; if (!C || !C[id]) return null;
    var byDate = {}, firstId = {};
    Object.keys(C).sort().forEach(function(k){ var d = k.slice(0, 10); (byDate[d] = byDate[d] || {});
      C[k].forEach(function(c){ byDate[d][c[0]] = c[1]; if (!firstId[d + "|" + c[0]]) firstId[d + "|" + c[0]] = k; }); });
    var dates = Object.keys(byDate).sort(), di = dates.indexOf(id.slice(0, 10)); if (di < 0) return null;
    var out = C[id].map(function(c){
      var sym = c[0], n = 0, start = di;
      for (var j = di; j >= 0 && byDate[dates[j]][sym]; j--){ n++; start = j; }
      var win = dates.slice(Math.max(0, di - 6), di + 1), hit = win.filter(function(d){ return byDate[d][sym]; }).length;
      var before = dates.slice(Math.max(0, di - 7), di).filter(function(d){ return byDate[d][sym]; }).length;
      return {sym: sym, name: c[1], n: n, hit: hit, win: win.length, fresh: n === 1 && before === 0, from: firstId[dates[start] + "|" + sym], mention: c[2] || 0};
    });
    var long = out.filter(function(x){ return x.n >= 2; }).sort(function(a, b){ return b.n - a.n || b.hit - a.hit || b.mention - a.mention; }).slice(0, 4);
    var fresh = out.filter(function(x){ return x.fresh; }).sort(function(a, b){ return b.mention - a.mention; }).slice(0, 2);
    return {long: long, fresh: fresh};
  }
  function short(n){ n = String(n || ""); n = n.replace(/\s*(홀딩스?|홀딩|ADR|Inc\.?|Corp\.?)\s*/g, " ").trim(); return n.length > 8 ? n.slice(0, 7) + "…" : n; }
  function thread(){
    if (window.cur !== "market") return;
    var box = document.getElementById("mkld"), id = window.curDate; if (!box || !id || box.dataset.thr === id) return;
    box.dataset.thr = id;
    mx().then(function(MX){
      var S = streaks(MX, id); if (!S || (!S.long.length && !S.fresh.length)) return;
      if (!document.getElementById("mkld") || window.curDate !== id) return;
      var old = box.querySelector(".mk-thr"); if (old) old.remove();
      var h = '<div class="mk-thr"><span class="mk-thr-k">🧵 리포트에</span>' +
        S.long.map(function(x){ return '<button data-go="' + e(x.from) + '" title="' + e(x.from.slice(5, 10).replace("-", "/")) + '부터">' + e(short(x.name)) + ' <b>' + x.n + '일째</b>' + (x.hit > x.n ? ' <small>' + x.win + '일 중 ' + x.hit + '</small>' : '') + '</button>'; }).join("") +
        S.fresh.map(function(x){ return '<button class="nw" data-sym="' + e(x.sym) + '">🆕 ' + e(short(x.name)) + ' <small>오늘 처음</small></button>'; }).join("") + '</div>';
      var lab = box.querySelector(".mk-lab"); if (lab) lab.insertAdjacentHTML("afterend", h); else box.insertAdjacentHTML("afterbegin", h);
      [].forEach.call(box.querySelectorAll(".mk-thr [data-go]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var to = b.dataset.go; if (to && to !== window.curDate) go("market", to); else window.scrollTo({top: 0, behavior: "smooth"}); }; });
      [].forEach.call(box.querySelectorAll(".mk-thr [data-sym]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); openOP(b.dataset.sym); }; });
    });
  }

  /* ---------- 공통: 시장 탭이 그려질 때마다 ---------- */
  var tt = null;
  new MutationObserver(function(){ if (window.cur !== "market" || tt) return;
    tt = setTimeout(function(){ tt = null; try { thread(); } catch(x) {} try { kpiNow(); } catch(x) {} try { if (store.mkFull) applyFull(); } catch(x) {} }, 400); })
    .observe(document.getElementById("main") || document.body, {childList: true, subtree: true});

  var st = document.createElement("style");
  st.textContent =
    /* A10-4 맨 위 띠 */
    ".hero2.mk-strip{padding:10px 14px;border-radius:14px;margin:0 0 10px}" +
    ".mk-strip .hero2-k{font-size:12.5px;margin-bottom:3px}.mk-strip .hero2-k span{color:var(--dim,#8a94a8)}" +
    ".mk-strip .hero2-t{font-size:14.5px;line-height:1.5;font-weight:700}" +
    /* A10-1 지금 → */
    ".kpis2 .kp .kp-now{display:block;font-size:12.5px;line-height:1.4;margin:4px 0 2px;color:var(--sub)}.kpis2 .kp .kp-now b,.kpis2 .kp .kp-now span{display:inline;font-size:inherit;font-weight:700;margin:0;padding:0;font-variant-numeric:tabular-nums}.kpis2 .kp .kp-now span.mut{font-weight:500}" +
    /* A10-2 칩 */
    ".mk-thr{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:5px;align-items:center;margin:0 -16px 9px;padding:0 16px}.mk-thr::-webkit-scrollbar{display:none}" +
    ".mk-thr-k{flex:0 0 auto;white-space:nowrap;font-size:12.5px;color:var(--sub);font-weight:700;margin-right:2px}" +
    ".mk-thr button{flex:0 0 auto;white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:3px 9px;font:inherit;font-size:12.5px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".mk-thr button b{color:#ff8a6a}.mk-thr button small{color:var(--dim,#8a94a8);font-size:12.5px}" +
    ".mk-thr button.nw{border-color:color-mix(in srgb,#24c08a 55%,var(--line));}" +
    /* A10-5 스위치: 목차 줄 오른쪽 끝에 붙어 있음 */
    ".mk-toc{overflow:visible!important;align-items:center}" +
    ".mk-tsc{display:flex;gap:5px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none;-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);padding-right:14px}.mk-tsc::-webkit-scrollbar{display:none}" +
    ".mk-toc .mk-full{position:static;margin-left:4px;flex:0 0 auto;background:var(--panel)}" +
    ".mk-toc .mk-full small{font-size:12.5px;color:var(--dim,#8a94a8);font-weight:600}.mk-toc .mk-full.on{border-color:var(--c)}";
  document.head.appendChild(st);
})();

/* ---------- 10/14 11시 A11-1 🪜 스크롤 내리면 머리 접기 ----------
   아래로 내리는 동안 머리(상표 줄 + 「포트/성적표」 줄)를 위로 밀어 올리고(transform — 문서 높이는 안 바뀌어 스크롤 위치가 안 튐), 조금만 위로 올리면 다시 내림.
   위에 붙는 성적 띠·바로가기 칩은 --hh(머리 높이)를 따라가므로 접을 때 --hh 도 같이 줄임. */
(function(){
  var hd = document.querySelector("header"); if (!hd) return;
  var st = document.createElement("style");
  st.textContent =
    "header{transition:transform .22s ease;will-change:transform}header.hd-min{transform:translateY(calc(-1 * var(--hdc,98px)))}" +
    "header.hd-min .top,header.hd-min .tabs.sub{pointer-events:none}" +
    ".po-stk,.fold-jump{transition:top .22s ease}";
  document.head.appendChild(st);
  var lastY = window.scrollY || 0, acc = 0;
  // 10/15: 아이폰 상태 표시줄(시계·배터리) 자리 — 머리는 통째로 올려 숨기고, 그 자리엔 바탕색 띠를 깔아 칩·탭이 시계 밑으로 비치지 않게
  var sp = document.createElement("div"); sp.id = "sbcover";
  sp.style.cssText = "position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top);background:var(--bg);z-index:40;pointer-events:none";
  document.body.appendChild(sp);
  function safeTop(){ return sp.offsetHeight || 0; }
  function setHH(){ var h = hd.offsetHeight, s = safeTop(); if (hd.classList.contains("hd-min")){ document.documentElement.style.setProperty("--hdc", h + "px"); document.documentElement.style.setProperty("--hh", s + "px"); }
    else document.documentElement.style.setProperty("--hh", h + "px"); }
  function set(min){ if (hd.classList.contains("hd-min") === min) return; hd.classList.toggle("hd-min", min); sp.style.display = min ? "" : "none"; setHH(); }
  sp.style.display = "none";
  window.addEventListener("scroll", function(){
    var y = window.scrollY || 0, d = y - lastY; lastY = y;
    // 11/03 「스크롤할 때 위아래 고정 칸이 흔들려」 — 맨 위·맨 아래에서 아이폰이 튕길 때(값이 오르내림) 머리가 접혔다 펴졌다 하던 것 → 튕기는 구간은 무시 · 기준도 조금 크게
    var maxY = (document.documentElement.scrollHeight || 0) - window.innerHeight;
    if (y < 0 || y > maxY - 4) return;
    if ((d > 0) !== (acc > 0)) acc = 0;
    acc += d;
    if (y < 80 || acc < -40) set(false);
    else if (y > 160 && acc > 40) set(true);
  }, {passive: true});
  window.addEventListener("hashchange", function(){ set(false); });
  window.addEventListener("resize", function(){ setTimeout(setHH, 50); });
})();
;
__bk(41);
/* ======== ux1014b.js ======== */
/* CH Investing — 10/14 14시 아이디어 보고 A14 (사용자: "3,4,5 진행")
   A14-3 🖼 📤 공유를 글자 대신 「그림 카드」로 — chShare(제목, 글, 주소) 한 곳을 감싸서 홈·포트·스토리·카드 ⓘ 공유가 모두 같이 바뀜.
         누르면 아래에서 미리보기 창: 「🖼 그림으로 보내기」(사진 공유) · 「✉️ 글로 보내기」(지금까지 방식) · 닫기. 숫자는 화면 글 그대로(새 계산 없음).
   A14-4 📲 사파리(홈 화면 앱 아님)로 열면 홈 맨 위 얇은 띠 「홈 화면에 추가」 · 갤럭시 크롬은 설치 가능할 때만 바로 「설치」 · ✕ 누르면 7일 숨김
   A14-5 는 push.js(알림 화면 시간표 4묶음) */
(function(){
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.setAttribute("role", "status"); d.setAttribute("aria-live", "polite"); d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function dark(){ return document.documentElement.getAttribute("data-ui") !== "light"; }

  /* ---------- A14-3 그림 카드 ---------- */
  var W = 1080, H = 1350, PAD = 84;
  var NUM = /^(.{1,16}?)\s*([+\-−]\d[\d,]*(?:\.\d+)?%)(p?)\s*(\(.*\))?$/;
  function parse(title, text){
    var lines = String(text || "").split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
    var disc = "※ 투자 참고용 · 매수 추천 아님";
    lines = lines.filter(function(l){ return !/^※/.test(l); });
    var head = lines.shift() || title || "CH Investing", stats = [], rest = [];
    lines.forEach(function(l){
      var segs = l.split(/\s+·\s+/), got = [], left = [];
      segs.forEach(function(s){ var m = s.match(NUM); if (m && !m[3] && !/[ ]{2}/.test(m[1])) got.push({lab: m[1].replace(/[:：]$/, ""), v: m[2], note: (m[4] || "").replace(/^\(|\)$/g, "")}); else left.push(s); });
      stats = stats.concat(got);
      if (left.length) rest.push(left.join(" · "));
    });
    if (stats.length < 2){ stats = []; rest = lines.slice(); }   // 숫자 줄이 1개뿐이면 글 카드로
    return {head: head, stats: stats.slice(0, 6), rest: rest.slice(0, 9), disc: disc};
  }
  function wrap(cx, s, maxW, maxL){
    var out = [], cur = "";
    Array.from(s).forEach(function(ch){ if (cx.measureText(cur + ch).width > maxW && cur){ out.push(cur); cur = ch.trim() ? ch : ""; } else cur += ch; });
    if (cur) out.push(cur);
    if (out.length > maxL){ out = out.slice(0, maxL); out[maxL - 1] = out[maxL - 1].replace(/.{1}$/, "…"); }
    return out;
  }
  function draw(P){
    var D = dark(), C = {bg1: D ? "#0b0f17" : "#f5f6fa", bg2: D ? "#1a2238" : "#e3e9f8", panel: D ? "#121826" : "#ffffff", line: D ? "#232c40" : "#e2e6ef",
      text: D ? "#e8ecf4" : "#141824", sub: D ? "#8a94a8" : "#5b6476", up: "#e66767", down: "#3987e5", acc: D ? "#ffd166" : "#b07a00"};
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H; var cx = cv.getContext("2d");
    var F = '-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
    var g = cx.createLinearGradient(0, 0, W, H); g.addColorStop(0, C.bg2); g.addColorStop(0.55, C.bg1); g.addColorStop(1, C.bg1);
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // 머리: 상표 + 날짜
    cx.textBaseline = "alphabetic"; cx.fillStyle = C.acc; cx.font = "800 44px " + F; cx.fillText("CH Investing", PAD, 128);
    var now = new Date(Date.now() + 9 * 3600e3), dl = (now.getUTCMonth() + 1) + "/" + now.getUTCDate() + " " + ("0" + now.getUTCHours()).slice(-2) + ":" + ("0" + now.getUTCMinutes()).slice(-2);
    cx.fillStyle = C.sub; cx.font = "500 32px " + F; cx.textAlign = "right"; cx.fillText(dl, W - PAD, 128); cx.textAlign = "left";
    // 제목
    cx.fillStyle = C.text; cx.font = "800 60px " + F;
    var y = 236; wrap(cx, P.head, W - PAD * 2, 2).forEach(function(l){ cx.fillText(l, PAD, y); y += 76; });
    y += 14;
    if (P.stats.length){
      var mx = Math.max.apply(null, P.stats.map(function(s){ return Math.abs(parseFloat(s.v.replace("−", "-").replace(/,/g, ""))) || 0; }).concat([0.01]));
      var rowH = Math.max(112, Math.min(176, Math.floor((H - 230 - y - (P.rest.length ? 56 * Math.min(3, P.rest.length) : 0)) / P.stats.length)));
      P.stats.forEach(function(s){
        var v = parseFloat(s.v.replace("−", "-").replace(/,/g, "")) || 0, base = /S&P|코스피|코스닥|MSCI|시장/.test(s.lab);
        cx.fillStyle = C.panel; roundRect(cx, PAD, y, W - PAD * 2, rowH - 18, 26); cx.fill();
        cx.fillStyle = C.text; cx.font = "700 " + Math.min(44, rowH * 0.3) + "px " + F; cx.fillText(s.lab, PAD + 34, y + (s.note ? rowH * 0.36 : rowH * 0.48));
        if (s.note){ cx.fillStyle = C.sub; cx.font = "500 " + Math.min(28, rowH * 0.2) + "px " + F; cx.fillText(wrap(cx, s.note, W * 0.42, 1)[0], PAD + 34, y + rowH * 0.36 + Math.min(42, rowH * 0.26)); }
        cx.fillStyle = base ? C.sub : (v >= 0 ? C.up : C.down); cx.font = "900 " + Math.min(70, rowH * 0.5) + "px " + F; cx.textAlign = "right";
        cx.fillText(s.v, W - PAD - 34, y + rowH * 0.5); cx.textAlign = "left";
        var bw = (W - PAD * 2 - 68) * Math.min(1, Math.abs(v) / mx), by = y + rowH - 46;
        cx.fillStyle = C.line; roundRect(cx, PAD + 34, by, W - PAD * 2 - 68, 10, 5); cx.fill();
        cx.fillStyle = base ? C.sub : (v >= 0 ? C.up : C.down); roundRect(cx, PAD + 34, by, Math.max(10, bw), 10, 5); cx.fill();
        y += rowH;
      });
      y += 8;
    }
    cx.fillStyle = P.stats.length ? C.sub : C.text; cx.font = "500 " + (P.stats.length ? 34 : 44) + "px " + F;
    var lh = P.stats.length ? 48 : 70;
    if (!P.stats.length){ var nl = 0; P.rest.forEach(function(l){ nl += wrap(cx, l, W - PAD * 2, 2).length; }); y = Math.max(y + 20, Math.round((y + H - 170) / 2 - (nl * lh + P.rest.length * 8) / 2)); }
    P.rest.forEach(function(l){ wrap(cx, l, W - PAD * 2, 2).forEach(function(w){ if (y < H - 200){ cx.fillText(w, PAD, y + 34); y += lh; } }); y += 8; });
    // 바닥: 주소 + 안내
    cx.strokeStyle = C.line; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(PAD, H - 150); cx.lineTo(W - PAD, H - 150); cx.stroke();
    cx.fillStyle = C.text; cx.font = "700 32px " + F; cx.fillText("📱 chkchp0702-spec.github.io/daily-app", PAD, H - 92);
    cx.fillStyle = C.sub; cx.font = "500 28px " + F; cx.fillText(P.disc, PAD, H - 48);
    return cv;
  }
  function roundRect(cx, x, y, w, h, r){ cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function blobOf(cv){ var u = cv.toDataURL("image/png"), b = atob(u.split(",")[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], {type: "image/png"}); }

  var TXT = window.chShare;   // nav2.js 의 글자 공유(공유창 → 안 되면 복사)
  function sheet(title, text, hash){
    var old = document.getElementById("shimg"); if (old) old.remove();
    var cv; try { cv = draw(parse(title, text)); } catch(e) { return TXT && TXT(title, text, hash); }
    var url = cv.toDataURL("image/png"), now = new Date(Date.now() + 9 * 3600e3);
    var fn = "CH_Investing_" + ("0" + (now.getUTCMonth() + 1)).slice(-2) + ("0" + now.getUTCDate()).slice(-2) + ".png", file = null, canFile = false;
    try { file = new File([blobOf(cv)], fn, {type: "image/png"}); canFile = !!(navigator.canShare && navigator.canShare({files: [file]})); } catch(e) {}
    var d = document.createElement("div"); d.id = "shimg";
    d.innerHTML = '<div class="shi-bk"></div><div class="shi-box"><div class="shi-h"><b>📤 공유</b><button class="shi-x" aria-label="닫기">✕</button></div>' +
      '<img alt="공유 그림 미리보기" src="' + url + '"><div class="shi-bt"><button class="shi-img">🖼 ' + (canFile ? "그림으로 보내기" : "그림 저장") + '</button><button class="shi-txt">✉️ 글로 보내기</button></div>' +
      '<small>' + (canFile ? "카톡·문자·인스타 어디서나 같은 모양으로 보여요." : "이 브라우저는 그림 바로 보내기가 안 돼요 — 그림을 길게 눌러 저장한 뒤 보내 주세요.") + '</small></div>';
    document.body.appendChild(d);
    var close = function(){ d.remove(); };
    d.querySelector(".shi-bk").onclick = close; d.querySelector(".shi-x").onclick = close;
    d.querySelector(".shi-txt").onclick = function(){ close(); if (TXT) TXT(title, text, hash); };
    d.querySelector(".shi-img").onclick = function(){
      if (canFile){ navigator.share({files: [file]}).then(close).catch(function(e){ if (e && e.name !== "AbortError") toast("그림 보내기가 안 됐어요 — 길게 눌러 저장해 주세요"); }); return; }
      var a = document.createElement("a"); a.href = url; a.download = fn; document.body.appendChild(a); a.click(); a.remove(); toast("그림을 저장했어요");
    };
  }
  if (TXT) window.chShare = sheet;

  /* ---------- A14-4 홈 화면에 추가 띠 ---------- */
  var ua = navigator.userAgent || "", ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var inApp = /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(ua);
  var standalone = function(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; };
  var DP = null, HIDE = "a2hsHide";
  window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); DP = e; if (window.cur === "home") band(); });
  window.addEventListener("appinstalled", function(){ DP = null; var b = document.getElementById("a2hs"); if (b) b.remove(); });
  function hidden(){ var t = +ls(HIDE) || 0; return Date.now() - t < 7 * 86400e3; }
  function band(){
    if (standalone() || hidden() || window.cur !== "home") return;
    if (!(ios || DP)) return;   // 아이폰 사파리·카톡 안 · 또는 크롬이 「설치 가능」이라고 알려 준 때만
    var main = document.getElementById("main"); if (!main || document.getElementById("a2hs")) return;
    var b = document.createElement("div"); b.id = "a2hs";
    var msg = ios ? (inApp ? "카톡 안에서 열렸어요 — <b>Safari로 열기</b> 뒤 홈 화면에 추가하면 알림도 와요" : "<b>홈 화면에 추가</b>하면 알림도 오고 앱처럼 바로 열려요")
                  : "<b>앱으로 설치</b>하면 알림도 오고 바로 열려요";
    b.innerHTML = '<span class="a2-i">📲</span><span class="a2-t">' + msg + '</span>' +
      (DP && !ios ? '<button class="a2-go a2-inst">설치</button>' : '<a class="a2-go" href="install.html">방법 ▸</a>') + '<button class="a2-x" aria-label="7일 동안 숨기기">✕</button>';
    main.insertBefore(b, main.firstChild);
    b.querySelector(".a2-x").onclick = function(){ ls(HIDE, String(Date.now())); b.remove(); };
    var ib = b.querySelector(".a2-inst"); if (ib) ib.onclick = function(){ if (!DP) return; DP.prompt(); DP.userChoice.then(function(r){ if (r && r.outcome === "accepted") b.remove(); DP = null; }).catch(function(){}); };
  }
  var HI = window.homeInit;
  if (HI) window.homeInit = function(){ var r = HI.apply(this, arguments); try { band(); } catch(e) {} return r; };
  setTimeout(function(){ try { band(); } catch(e) {} }, 600);

  var st = document.createElement("style");
  st.textContent = [
    "#shimg{position:fixed;inset:0;z-index:90;display:flex;align-items:flex-end;justify-content:center}",
    ".shi-bk{position:absolute;inset:0;background:rgba(0,0,0,.55)}",
    ".shi-box{position:relative;width:100%;max-width:520px;background:var(--panel);border:1px solid var(--line);border-radius:22px 22px 0 0;padding:14px 16px calc(env(safe-area-inset-bottom) + 16px);display:flex;flex-direction:column;gap:10px;max-height:92vh}",
    ".shi-h{display:flex;align-items:center;justify-content:space-between}.shi-h b{font-size:16px}",
    ".shi-x{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;width:32px;height:32px;font-size:15px;cursor:pointer}",
    "#shimg img{display:block;width:auto;max-width:100%;max-height:56vh;margin:0 auto;border-radius:14px;border:1px solid var(--line);-webkit-touch-callout:default}",
    ".shi-bt{display:grid;grid-template-columns:1.3fr 1fr;gap:8px}.shi-bt button{font:inherit;font-size:15px;font-weight:800;padding:13px 8px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}",
    ".shi-bt .shi-img{background:var(--acc);border-color:var(--acc);color:var(--bg)}",
    ".shi-box small{color:var(--sub);font-size:12.5px;text-align:center}",
    "#a2hs{display:flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:8px 8px 8px 12px;margin:0 0 10px;font-size:13px;line-height:1.4}",
    "#a2hs .a2-i{font-size:18px}#a2hs .a2-t{flex:1;min-width:0;color:var(--sub)}#a2hs .a2-t b{color:var(--text)}",
    "#a2hs .a2-go{flex:none;font:inherit;font-size:12.5px;font-weight:800;border:0;border-radius:999px;padding:6px 11px;background:var(--acc);color:var(--bg);text-decoration:none;cursor:pointer;white-space:nowrap}",
    "#a2hs .a2-x{flex:none;border:0;background:transparent;color:var(--sub);font-size:15px;width:28px;height:28px;cursor:pointer}"
  ].join("\n");
  document.head.appendChild(st);
})();
;
__bk(42);
/* ======== ux1014c.js ======== */
/* CH Investing — 10/14 15시 아이디어 보고 A15 (사용자: "다 진행해")
   A15-1 🧱 아래 탭 바 「글자 비침」 막기 — 탭 바·머리 배경을 거의 불투명하게 + 탭 바 위에 사라지는 그림자 한 줄
   A15-2 🔡 작은 글자 바닥선 11.5px + 흐린 글자(--dim) 대비 약 3:1 → 4.7:1 · 밝은 모드 상표 「CH」 진하게
   A15-3 📏 글자 크기 「📱 폰 따라감」(아이폰 텍스트 크기) + 5단계 — zoom 대신 글자 크기 규칙만 고쳐 씀(카드·여백은 그대로)
   A15-4 🌈 오늘 날씨 색 — 🧭 국면 신호판(미·한 합본) 두 점수로 맑음·흐림·비·보류를 정해 머리 띠·홈 첫 카드를 아주 옅게 물들임
   A15-5 🪪 홈 카드 머리 한 벌 + 왼쪽 탭 색 띠(어느 탭 이야기인지) */
(function(){
  var D = document.documentElement;

  /* ---------- A15-2 · A15-3 글자 ---------- */
  var ORIG = new WeakMap(), F = 1, FLOOR = 13;   // 🎨 11/04 우와: 바닥 11.5 → 13 · 작은 글자일수록 더 키움(BUMP) — 사용자 「가독성 좋게」
  function BUMP(px){ return px <= 16 ? px + 1.5 : px <= 20 ? px + 2 : px <= 30 ? px + 3 : px; }
  function sysF(){
    try {
      if (!(window.CSS && CSS.supports && CSS.supports("font", "-apple-system-body"))) return 1;
      var s = document.createElement("span"); s.style.cssText = "font:-apple-system-body;position:absolute;visibility:hidden"; s.textContent = "가";
      (document.body || D).appendChild(s); var px = parseFloat(getComputedStyle(s).fontSize) || 17; s.remove();
      return Math.max(0.85, Math.min(1.35, px / 17));   // 아이폰 기본 「본문」 = 17px
    } catch(x) { return 1; }
  }
  function fixRules(list){
    for (var i = 0; i < list.length; i++){
      var r = list[i];
      if (r.cssRules && !r.style){ fixRules(r.cssRules); continue; }   // @media 안
      if (!r.style) continue;
      var o = ORIG.get(r);
      if (o === undefined){
        var fs = r.style.fontSize;
        o = /^\d+(\.\d+)?px$/.test(fs) ? {px: parseFloat(fs), imp: r.style.getPropertyPriority("font-size")} : null;
        ORIG.set(r, o);
      }
      if (!o) continue;
      if (o.chrome == null) o.chrome = /header|\.stamp|\.brand|#bnav|#uibtn|#gsbtn|#wlbtn|\.tabs?\b/.test(r.selectorText || "");   // 머리·아래 탭 바는 크기 그대로(한 줄 유지)
      if (o.pic == null) o.pic = o.px < 11 && /svg|text|tick|axis|\.t3-|\.ix|\.viz|chart|legend/.test(r.selectorText || "");   // 그림 눈금 글자만 그대로
      var v = Math.round((o.chrome || o.pic ? o.px : BUMP(Math.max(o.px, FLOOR))) * (o.chrome ? 1 : F) * 10) / 10;
      if (r.style.fontSize !== v + "px") r.style.setProperty("font-size", v + "px", o.imp);
    }
  }
  function fixAll(){
    for (var i = 0; i < document.styleSheets.length; i++){
      var sh = document.styleSheets[i], rl;
      try { rl = sh.cssRules; } catch(x) { continue; }   // 바깥 글꼴 CSS 는 못 읽음 → 그대로
      if (rl) fixRules(rl);
    }
  }
  window.chFont = function(fs){
    F = fs === "auto" || fs == null ? sysF() : (+fs || 1);
    if (document.body) document.body.style.zoom = "";
    fixAll();
  };
  var pend = 0;
  function later(){ if (pend) return; pend = setTimeout(function(){ pend = 0; fixAll(); }, 60); }
  // 다른 화면 js 가 나중에 <style> 을 붙이면 그것도 고쳐 씀
  new MutationObserver(function(ms){
    for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++){
      var n = ms[i].addedNodes[j]; if (n.nodeName === "STYLE" || n.nodeName === "LINK"){ later(); return; } }
  }).observe(D, {childList: true, subtree: true});

  /* ---------- A15-4 오늘 날씨 색 ---------- */
  var MOOD = {
    sun:  {ic: "🧭", w: "분위기 좋음", c: "#4dd47a", lc: "#1f9d4f", why: "경기·시장 점수가 둘 다 좋은 쪽"},
    cloud:{ic: "🧭", w: "엇갈림", c: "#e9b949", lc: "#b07d00", why: "두 점수가 엇갈림"},
    rain: {ic: "🧭", w: "분위기 나쁨", c: "#ff6b6b", lc: "#cc3b3b", why: "두 점수가 나쁜 쪽"},
    fog:  {ic: "🧭", w: "판단 보류", c: "#8a94a8", lc: "#6b7486", why: "점수에 든 신호가 적어 판단 보류"}
  };
  var M = null;
  function act(sigs){ return (sigs || []).filter(function(s){ return s.st != null && s.w > 0 && !(s.id === "thrust" && s.st === 0); }); }
  function moodOf(R){
    if (!R || !R.sig) return null;
    var g = function(k, v){ var a = act(R.sig.filter(function(s){ return s.grp === k; })); return a.length < 3 || v == null ? null : v >= 10 ? 1 : v <= -10 ? -1 : 0; };
    var c = g("cycle", R.cycle), t = g("timing", R.timing);
    if (c == null && t == null) return "fog";
    var a = [c, t].filter(function(x){ return x != null; });
    var pos = a.some(function(x){ return x > 0; }), neg = a.some(function(x){ return x < 0; });
    return pos && !neg ? "sun" : neg && !pos ? "rain" : "cloud";
  }
  function paintMood(){
    if (!M) return;
    var m = MOOD[M.k], light = D.getAttribute("data-ui") === "light";
    D.style.setProperty("--mood", light ? m.lc : m.c); D.setAttribute("data-mood", M.k);
    var b = document.querySelector("header .brand");
    if (b && !document.getElementById("moodDot")){
      var d = document.createElement("button"); d.id = "moodDot"; d.type = "button";
      d.onclick = function(ev){ ev.stopPropagation(); if (window.goTo) goTo("sector", "rbboard"); };
      b.appendChild(d);
    }
    var dd = document.getElementById("moodDot");
    if (dd){ dd.setAttribute("aria-label", "장 분위기 " + m.w + " — 국면 신호판 보기"); dd.title = m.ic + " " + m.w + " · " + M.label; }
    var day = document.querySelector("#hmbody .hm-day");
    if (day && !day.querySelector(".hm-mood")){
      var s = document.createElement("span"); s.className = "hm-mood"; s.setAttribute("role", "button");
      s.innerHTML = m.ic + " <b>" + m.w + "</b>";
      s.title = M.label + " — " + m.why + " (누르면 국면 신호판)";
      s.onclick = function(ev){ ev.stopPropagation(); if (window.goTo) goTo("sector", "rbboard"); };
      day.insertBefore(s, day.firstChild);
    }
    var first = document.querySelector("#hmbody > .card");   // 홈 첫 카드만 옅게
    if (first && !first.classList.contains("mood")) first.classList.add("mood");
  }
  function loadMood(){
    if (typeof getJSON !== "function") return;
    var t5 = Math.floor(Date.now() / 300000);
    getJSON("archive/x/regime.json?r" + t5).catch(function(){ return window.PL && PL.X ? PL.X("regime.json") : null; }).then(function(R){
      var k = moodOf(R); if (!k) return;
      M = {k: k, label: R.label || ""}; paintMood();
    }).catch(function(){});
  }

  /* ---------- A15-5 홈 카드 색 띠 ---------- */
  function catColor(k){ var c = (window.CATS || []).filter(function(x){ return x.key === k; })[0]; return c ? c.color : null; }
  function strips(){
    var cards = document.querySelectorAll("#hmbody .card:not([data-stp])");
    for (var i = 0; i < cards.length; i++){
      var c = cards[i], k = c.getAttribute("data-strip") || (c.getAttribute("data-goto") || "").split("~")[0];
      var col = k && catColor(k); c.setAttribute("data-stp", "1");
      if (col){ c.style.setProperty("--strip", col); c.classList.add("ch-strip"); }
    }
  }

  /* 홈이 다시 그려질 때마다(탭 이동·매시간 갱신) 색 띠·날씨 칸 붙이기 */
  var t0 = 0;
  new MutationObserver(function(){ if (t0) return; t0 = setTimeout(function(){ t0 = 0; strips(); paintMood(); }, 50); })
    .observe(document.getElementById("main") || document.body, {childList: true, subtree: true});
  new MutationObserver(function(){ paintMood(); }).observe(D, {attributes: true, attributeFilter: ["data-ui"]});

  /* ---------- CSS ---------- */
  var css = [
    /* A15-1 */
    "header{background-color:rgba(11,15,23,.96)!important}",
    ":root[data-ui=light] header{background-color:rgba(244,246,250,.97)!important}",
    "#bnav{background-color:rgba(11,15,23,.97)!important}",
    ":root[data-ui=light] #bnav{background-color:rgba(255,255,255,.98)!important}",
    "#bnav::after{content:'';position:absolute;left:0;right:0;top:-14px;height:14px;pointer-events:none;background:linear-gradient(to top,var(--bg),transparent)}",
    /* A15-2 */
    ":root{--dim:#8a93a5}",
    ":root[data-ui=light]{--dim:#636d7b}",
    ".stamp{white-space:nowrap}",
    "header .brand{position:relative;white-space:nowrap;margin-right:9px}",
    ":root[data-ui=light] #brandDot{filter:brightness(.62) saturate(1.5)}",
    /* A15-3 설정 줄: 글자 버튼 6개가 한 줄에 */
    "#uiset .us-seg button[data-k=fs]{padding:5px 7px}",
    "#uiset .us-seg button[data-k=fs][data-v='0.88']{font-size:12.5px!important}#uiset .us-seg button[data-k=fs][data-v='0.94']{font-size:12.5px!important}",
    "#uiset .us-seg button[data-k=fs][data-v='1']{font-size:13.5px!important}#uiset .us-seg button[data-k=fs][data-v='1.1']{font-size:15px!important}#uiset .us-seg button[data-k=fs][data-v='1.22']{font-size:17px!important}",
    "#uiset .us-r:has(button[data-k=fs]){flex-wrap:wrap}",
    /* A15-4 */
    "header{background-image:linear-gradient(180deg,color-mix(in srgb,var(--mood,transparent) 11%,transparent),transparent)!important}",
    "#moodDot{position:absolute;top:2px;right:-9px;width:8px;height:8px;padding:0;margin:0;border-radius:50%;border:0;background:var(--mood,#8a94a8);cursor:pointer;box-shadow:0 0 0 3px color-mix(in srgb,var(--mood,#8a94a8) 22%,transparent)}",
    ":root:not([data-mood]) #moodDot{display:none}",
    "#hmbody > .card.mood{background:radial-gradient(120% 120% at 100% 0%,color-mix(in srgb,var(--mood) 16%,transparent),transparent 60%),var(--panel)}",
    ".hm-mood{display:inline-flex;align-items:center;gap:3px;margin-right:6px;padding:2px 9px;border-radius:999px;font-size:12.5px;cursor:pointer;background:color-mix(in srgb,var(--mood) 16%,transparent);color:var(--text)}",
    ".hm-mood b{color:var(--mood)}",
    /* A15-5 */
    ".hm-chg .hm-h{margin-bottom:4px}",
    ".card.ch-strip{border-left:3px solid var(--strip)}",
    ":root[data-ui=light] .card.ch-strip{border-left-color:color-mix(in srgb,var(--strip) 72%,#000)}",
    ".hm-kt.buy,.hm-kt.sell{color:var(--text)!important}",
    ".hm-c:has(.hm-kt.buy) .hm-i{background:color-mix(in srgb,#4dd47a 24%,var(--panel2))}",
    ".hm-c:has(.hm-kt.sell) .hm-i{background:color-mix(in srgb,#ff6b6b 24%,var(--panel2))}"
  ].join("\n");
  var st = document.createElement("style"); st.id = "ux1014c"; st.textContent = css; document.head.appendChild(st);

  function boot(){
    var u = {}; try { u = JSON.parse(localStorage.getItem("ui") || "{}"); } catch(x) {}
    var fs = u.fs == null || u.fs === 1 ? "auto" : u.fs === 0.92 ? 0.94 : u.fs === 1.12 ? 1.1 : u.fs;
    window.chFont(fs); setTimeout(fixAll, 1500);
    strips(); loadMood(); setInterval(loadMood, 30 * 60 * 1000);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
;
__bk(43);
/* ======== ux1015.js ======== */
/* CH Investing — 10/15 앱 아이디어 A9-1·A9-3·A9-4 (사용자 「다 적용해」)
   A9-1 🌞 장중 띠 — 홈 날짜 줄 아래 한 줄: 장중판 = 🇰🇷 코스피·코스닥 지금 값, 저녁판 = 🇺🇸 선물, 밤·아침판 = 🇺🇸 지수 (1분마다 · 누르면 시장 탭 실시간 시장판)
   A9-3 ⟳ 신선도 칩 — 「08:56 기준」 → 「⟳ 41분 전」(1시간 안 초록 · 3시간 안 노랑 · 넘으면 빨강) · 누르면 자료별 신선도(건강검진 health.json) · 머리엔 버전만(시각 글자는 뺌) · 버전은 ⚙️ 맨 아래에도
   A9-4 🪄 숫자 차오름 + 「지난번 본 값」 배지 — 이 휴대폰 안(localStorage ch_seen)에만 · 아이폰 「동작 줄이기」면 움직임 없음
   보고 숫자는 화면에 이미 있는 값만 씀 — 새 계산·매수 권유 없음 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; return (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 2 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kst(s){ var t = Date.parse(String(s || "").trim().replace(" ", "T") + (String(s).length <= 16 ? ":00" : "") + "+09:00"); return isNaN(t) ? null : t; }
  function ago(ms){ var m = Math.round(ms / 60000); if (m < 1) return "방금"; if (m < 60) return m + "분 전"; return Math.floor(m / 60) + "시간 전"; }
  function todayKST(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- A9-3 ⟳ 신선도 칩 ---------- */
  function fresh(H){
    var c = document.getElementById("hmfresh"); if (!c) return;
    var t = kst(H.at); if (t == null) return;
    var paint = function(){
      var age = Date.now() - t;
      c.className = "hm-fresh " + (age < 0 ? "g" : age <= 3600e3 ? "g" : age <= 3 * 3600e3 ? "y" : "r");
      c.textContent = age > 3 * 3600e3 ? "⟳ " + ago(age) + " · 자료가 늦어요" : "⟳ " + (age < 0 ? "방금" : ago(age));
      c.title = "홈 요약 만든 때 " + String(H.at || "").slice(5) + " — 누르면 자료별";
    };
    paint(); clearInterval(fresh.tm); fresh.tm = setInterval(function(){ if (!document.body.contains(c)) return clearInterval(fresh.tm); paint(); }, 60000);
    c.onclick = function(ev){ ev.stopPropagation(); freshSheet(H); };
  }
  function freshSheet(H){
    var old = document.getElementById("frsheet"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "frsheet";
    d.innerHTML = '<b>⟳ 자료 신선도</b><div class="fr-l"><div class="fr-r"><span>🏠 홈 요약</span><em>' + e(ago(Date.now() - kst(H.at))) + '</em></div><div class="mut">불러오는 중…</div></div>' +
      '<small>홈 요약은 매시간 · 실시간 숫자(🌞 띠)는 1분마다 새로 받아요</small><div class="fr-v">앱 v' + e(window.APPV || "") + '</div>';
    document.body.appendChild(d);
    var close = function(ev){ if (!d.contains(ev.target)){ d.remove(); document.removeEventListener("click", close, true); } };
    setTimeout(function(){ document.addEventListener("click", close, true); }, 0);
    if (typeof getJSON !== "function") return;
    getJSON("archive/x/health.json?" + Math.floor(Date.now() / 300000)).then(function(Hx){
      // 건강검진이 잰 때 기준 나이(그 뒤로 더하지 않음 — 건강검진이 늦게 돌면 부풀려 보여서) · 잰 때를 같이 적음
      var rows = (Hx.data || []).map(function(x){
        var h = x.age_h || 0, lim = x.lim || 3, c = h <= 1 ? "g" : h <= lim ? "y" : "r";
        return '<div class="fr-r"><span>' + e(x.name) + '</span><em class="' + c + '">' + e(ago(h * 3600e3)) + '</em></div>'; }).join("");
      var l = d.querySelector(".fr-l"); if (l) l.innerHTML = l.firstElementChild.outerHTML + '<div class="fr-h">🩺 건강검진 ' + e(String(Hx.at || "").slice(5).replace("-", "/")) + ' 잰 것</div>' + (rows || '<div class="mut">건강검진 자료 없음</div>') +
        ((Hx.problems || []).length ? '<div class="fr-p">⚠️ ' + e(Hx.problems[0]) + '</div>' : '');
    }).catch(function(){ var l = d.querySelector(".fr-l .mut"); if (l) l.textContent = "건강검진 자료를 못 받았어요"; });
  }

  /* ---------- A9-1 🌞 장중 띠 ---------- */
  function live(){
    var el = document.getElementById("hmlive"); if (!el || typeof getJSON !== "function") return;
    var ed = el.dataset.ed, mn = Math.floor(Date.now() / 60000);
    var J = function(n){ return getJSON("archive/x/" + n + ".json?" + mn).catch(function(){ return null; }); };
    var show = function(html, stale, title){ el.innerHTML = html; el.hidden = false; el.classList.toggle("stale", !!stale); el.title = title || ""; };
    var usClose = function(){ return J("live_us").then(function(U){
      if (!U || !(U.index || []).length) { el.hidden = true; return; }
      var at = U.at || null, age = at ? Date.now() - at : 9e9, sess = String(U.sess || U.date || "");
      var nyOpen = ed === "night" && age < 15 * 60000;
      show('<span class="lv-f">🇺🇸 ' + (nyOpen ? "장중" : (sess ? sess.slice(5).replace("-", "/") + " 마감" : "마감")) + '</span>' +
        U.index.slice(0, 2).map(function(x){ return '<span>' + e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
        (U.total ? '<span class="lv-m">오른 종목 ' + U.up + '/' + U.total + '</span>' : '') + '<span class="lv-t">' + e(U.t || "") + ' ›</span>',
        ed === "night" && !nyOpen && new Date(Date.now() + 9 * 3600e3).getUTCHours() < 5, "미국 지수 · 누르면 시장 탭 실시간 시장판");
    }); };
    if (ed === "day"){
      J("live_kr").then(function(L){
        if (!L || L.date !== todayKST() || !(L.index || []).length) return usClose();   // 주말·휴장 → 미국 마감
        var t = kst(L.date + " " + L.t), age = t ? Date.now() - t : 9e9;
        var m = new Date(Date.now() + 9 * 3600e3), mm = m.getUTCHours() * 60 + m.getUTCMinutes();
        var stale = age > 10 * 60000 && mm < 15 * 60 + 40;
        show('<span class="lv-f">🇰🇷 ' + (stale ? "멈춤?" : "지금") + '</span>' +
          L.index.slice(0, 2).map(function(x){ return '<span>' + e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
          (L.total ? '<span class="lv-m">오른 종목 ' + L.up + '/' + L.total + '</span>' : '') + '<span class="lv-t">' + e(L.t) + ' ›</span>',
          stale, "한국 장중 · " + L.t + " 값" + (stale ? " (10분 넘게 안 바뀜)" : "") + " · 누르면 시장 탭 실시간 시장판");
      });
    } else if (ed === "eve"){
      J("live_us_pre").then(function(P){
        if (!P || !(P.fut || []).length) return usClose();
        var age = P.at ? Date.now() - P.at : 9e9, nm = function(n){ return String(n).replace("100 선물", " 선물"); };
        show('<span class="lv-f">🇺🇸 선물</span>' + P.fut.slice(0, 2).map(function(x){ return '<span>' + e(nm(x.name)) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
          (P.tone ? '<span class="lv-m">' + e(P.tone) + '</span>' : '') + '<span class="lv-t">' + e(P.t || "") + ' ›</span>',
          age > 30 * 60000, (P.phase_lab || "미국 장 전") + " · 누르면 시장 탭 실시간 시장판");
      });
    } else usClose();
    el.onclick = function(ev){ ev.stopPropagation(); if (window.goTo) goTo("market", "live"); };
    clearTimeout(live.tm); live.tm = setTimeout(function(){ if (document.getElementById("hmlive") === el) live(); }, 60000);
  }

  /* ---------- A9-4 🪄 숫자 차오름 + 지난번 본 값 ---------- */
  var SEEN = {}; try { SEEN = JSON.parse(localStorage.getItem("ch_seen") || "{}") || {}; } catch(x) {}
  var animated = {};
  function nums(){
    var now = Date.now(), changed = false;
    [].forEach.call(document.querySelectorAll("#hmbody [data-num]"), function(el){
      var k = el.dataset.k, v = parseFloat(el.dataset.num); if (!k || isNaN(v)) return;
      var d = el.dataset.d != null ? +el.dataset.d : 2, u = el.dataset.u || "%", nos = el.dataset.nosign;
      var fmt = function(x){ return nos ? (+x).toFixed(d) + u : sg(x, d); };
      var final = el.textContent, p = SEEN[k];
      var diff = p && Math.abs(p.v - v) >= Math.pow(10, -d) / 2;
      if (diff && now - p.t > 5 * 60000){
        var b = document.createElement("i"); b.className = "hm-was " + (v > p.v ? "u" : "d");
        b.textContent = (v > p.v ? "▲" : "▼") + " 지난번 " + fmt(p.v); b.title = "이 휴대폰에서 지난번 본 값 (" + new Date(p.t + 9 * 3600e3).toISOString().slice(5, 16).replace("T", " ").replace("-", "/") + ")";
        el.parentNode.appendChild(b);
        var c = el.closest(".card"); if (c && !RM){ c.classList.remove("hm-pulse"); void c.offsetWidth; c.classList.add("hm-pulse"); }
      }
      if (!p || diff || now - p.t > 5 * 60000){ SEEN[k] = {v: v, t: now}; changed = true; }
      if (RM || (animated[k] && !diff)) return;
      animated[k] = 1;
      var t0 = null, dur = 600;
      (function step(ts){
        if (!document.body.contains(el)) return;
        if (t0 == null) t0 = ts; var q = Math.min(1, (ts - t0) / dur), ez = 1 - Math.pow(1 - q, 3);
        el.textContent = q >= 1 ? final : fmt(v * ez);
        if (q < 1) requestAnimationFrame(step);
      })(performance.now());
    });
    if (changed) try { localStorage.setItem("ch_seen", JSON.stringify(SEEN)); } catch(x) {}
  }

  window.hmAfter = function(H){ fresh(H); live(); nums(); };

  var css = document.createElement("style");
  css.textContent =
    
    ".hm-fresh{border-radius:999px;padding:1px 8px;font-size:12.5px;font-weight:800;white-space:nowrap;cursor:pointer;background:var(--panel2);border:1px solid var(--line)}" +
    ".hm-fresh.g{color:#4dd47a;border-color:rgba(77,212,122,.35)}.hm-fresh.y{color:#ffb84d;border-color:rgba(255,184,77,.4)}.hm-fresh.r{color:#ff8a8a;border-color:rgba(255,138,138,.45);background:rgba(255,107,107,.1)}" +
    ".hm-live{display:flex;flex-wrap:wrap;align-items:center;gap:3px 10px;margin:-4px 0 10px;padding:7px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line);font-size:12.5px;cursor:pointer;line-height:1.5}" +
    ".hm-live[hidden]{display:none}.hm-live span{white-space:nowrap}.hm-live b{font-weight:800}.hm-live .lv-f{font-weight:800}.hm-live .lv-m{color:var(--sub)}.hm-live .lv-t{margin-left:auto;color:var(--dim);font-size:12.5px}" +
    ".hm-live.stale{opacity:.6;filter:grayscale(.8)}.hm-live:active{opacity:.75}" +
    "#frsheet{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 64px);z-index:60;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px 16px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-size:13px;max-width:460px;margin:0 auto}" +
    "#frsheet>b{display:block;font-size:15px;margin-bottom:8px}.fr-r{display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid var(--line)}.fr-r:first-child{border-top:0}.fr-r em{font-style:normal;font-weight:800}" +
    ".fr-h{margin:8px 0 2px;font-size:12.5px;color:var(--sub);font-weight:700}.fr-r em.g{color:#4dd47a}.fr-r em.y{color:#ffb84d}.fr-r em.r{color:#ff8a8a}.fr-p{margin-top:6px;color:#ffb84d;font-size:12.5px}#frsheet small{display:block;margin-top:8px;color:var(--sub);font-size:12.5px}.fr-v{margin-top:6px;color:var(--dim);font-size:12.5px;text-align:right}" +
    ".hm-was{display:block;font-style:normal;font-size:12.5px;font-weight:700;margin-top:1px;color:var(--sub);line-height:1.3}.hm-was.u{color:#ff8a8a}.hm-was.d{color:#7cb0ff}" +
    ".hm-l .hm-was,.hm-c small .hm-was{display:inline;margin-left:4px}" +
    "@keyframes hmPulse{0%{box-shadow:inset 3px 0 0 0 var(--acc,#7c9cff),0 0 0 0 color-mix(in srgb,var(--acc,#7c9cff) 45%,transparent)}100%{box-shadow:inset 3px 0 0 0 transparent,0 0 0 10px transparent}}" +
    ".card.hm-pulse{animation:hmPulse 1.5s ease-out 1}" +
    ".us-ver{margin:10px 0 2px;font-size:12.5px;color:var(--dim);text-align:right}" +
    ":root[data-ui=light] .hm-fresh.g{color:#1f8b4c}:root[data-ui=light] .hm-fresh.y{color:#b26b00}:root[data-ui=light] .hm-fresh.r{color:#c0392b}" +
    ":root[data-ui=light] .fr-r em.g{color:#1f8b4c}:root[data-ui=light] .fr-r em.y{color:#b26b00}:root[data-ui=light] .fr-r em.r,:root[data-ui=light] .fr-p{color:#c0392b}:root[data-ui=light] #frsheet{box-shadow:0 12px 40px rgba(0,0,0,.18)}" +
    ":root[data-ui=light] .hm-was.u{color:#d63031}:root[data-ui=light] .hm-was.d{color:#2f6fd0}";
  document.head.appendChild(css);
})();
;
__bk(44);
/* ======== ux1015b.js ======== */
/* CH Investing — 🌐 시황 탭 A10-1~5 (10/15 사용자 「다 진행해」)
   A10-1 🔮 ✅ 오늘 할 일 3줄에 리포트 확률 띠 + 「지금 →」 칩 (재는 숫자가 있는 줄만 · 숫자는 안 지어냄)
   A10-2 ✂️ → 결론 줄은 안 접음 (tidy.js 에서 .mk-so 뺌) · 2줄까지 보이고 길면 눌러 펼침 — CSS 는 여기
   A10-3 🔢 숫자는 한 줄에 — 킥 표 값 · 오늘의 숫자 둘째 줄 칩 · 실시간 시장판 타일 이름 줄임 + 넘치면 글자 줄임
   A10-4 🗓 날짜 칩 밑줄 = 그날 🇰🇷 코스피 | 🇺🇸 S&P 등락 색 · 휴장 칩 흐리게 · 같은 날 WK·주간 회고 칩 하나로 · 길게 누르면 그날 한 줄
   A10-5 ⏰ 시황도 시간대 순서 — 아침 🌙 밤사이 · 한국 장중 실시간 시장판 · 저녁 ✅ 할 일 · 밤·주말 실시간 시장판을 맨 위 「지금 볼 것」 자리로
           (⚙️ 보기 설정 「🌐 시황 순서」 → 고정이면 끔) */
(function(){
  function X(name, ttl){ var s = Math.floor(Date.now() / (ttl || 120000)); return getJSON("archive/x/" + name + "?" + s, {ttl: ttl || 120000}).catch(function(){ return null; }); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function kst(){ var d = new Date(Date.now() + 9 * 3600000); return {h: d.getUTCHours(), m: d.getUTCMinutes(), t: d.getUTCHours() * 60 + d.getUTCMinutes(), dow: d.getUTCDay(), ymd: d.toISOString().slice(0, 10)}; }
  function addDay(ymd, n){ var d = new Date(ymd + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function uiMkt(){ try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); return u.mkt || "time"; } catch(x) { return "time"; } }
  function curId(){ var b = document.querySelector("#dates .date.on"); return b ? b.dataset.id : ""; }
  function isLatest(){ var b = document.querySelector("#dates .date"); var on = document.querySelector("#dates .date.on"); return !!(b && on && b === on); }
  function fmtN(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.round(Math.abs(v)).toLocaleString(); }
  function pct(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent =
    /* A10-1 */
    ".xtodo .xtd .a101{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}" +
    ".a101-p{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--sub)}" +
    ".a101-p i{position:relative;display:inline-block;width:64px;height:6px;border-radius:3px;background:color-mix(in srgb,var(--line) 70%,transparent);overflow:hidden}" +
    ".a101-p i em{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--acc,#7c9cff)}" +
    ".a101-p b{font-weight:700;color:var(--text);font-variant-numeric:tabular-nums}" +
    ".a101-c{display:inline-block;font-size:12.5px;line-height:1.35;padding:3px 9px;border-radius:999px;background:var(--panel2);color:var(--sub);white-space:nowrap}" +
    ".a101-c b{color:var(--text);font-variant-numeric:tabular-nums}.a101-c.ok{background:rgba(77,212,122,.14)}.a101-c.no{background:rgba(255,107,107,.13)}" +
    ".a101-c .up{color:#ff6b6b}.a101-c .dn{color:#5aa9ff}" +
    /* A10-2 */
    ".mk-so{border-left:3px solid color-mix(in srgb,var(--acc,#7c9cff) 70%,transparent);padding-left:9px;font-size:15px;color:var(--text);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;cursor:pointer}" +
    ".mk-so.a102-open{display:block;-webkit-line-clamp:unset}" +
    /* A10-3 */
    ".mk-rows div span{min-width:0}.mk-rows div b{flex:none;white-space:nowrap;text-align:right}" +
    ".kpis2 .kp>span.a103{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}" +
    ".kpis2 .kp>span.a103>span.a103c{display:inline-block;white-space:nowrap;font-size:12.5px;padding:1px 7px;border-radius:999px;background:color-mix(in srgb,var(--line) 55%,transparent)}" +
    "#live .kv small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#live .kv b{display:block;white-space:nowrap}" +
    /* A10-4 */
    "#dates .date{position:relative;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
    "#dates .date.a104:after{content:'';position:absolute;left:10px;right:10px;bottom:4px;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--kr) 0 48%,transparent 48% 52%,var(--us) 52% 100%)}" +
    "#dates .date.on{border-width:2px}" +
    "#dates .date.a104-hol{opacity:.55;transform:scale(.92)}#dates .date.a104-hid{display:none}" +
    "#dates .date .a104-rv{margin-left:4px;font-size:12.5px;padding:0 5px;border-radius:6px;background:color-mix(in srgb,var(--line) 60%,transparent)}" +
    ".a104-lg{font-size:12.5px;color:var(--dim);margin:-8px 0 10px}" +
    ".a104-tip{position:fixed;z-index:60;max-width:300px;padding:10px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:13.5px;line-height:1.5;color:var(--text)}" +
    ".a104-tip small{display:block;color:var(--dim);font-size:12.5px;margin-bottom:3px}" +
    /* A10-5 */
    "#mknow{margin:0 0 4px}#mknow .mknow-h{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--sub);margin:2px 2px 6px}" +
    "#mknow .mknow-h b{color:var(--text);font-weight:700}#mknow .mknow-h button{margin-left:auto;border:0;background:none;color:var(--dim);font:inherit;font-size:12.5px;cursor:pointer}";
  document.head.appendChild(css);

  /* ---------- A10-1 할 일 확률 띠 + 지금 칩 ---------- */
  function liveChip(text, todayK, FH, LU, FL){
    var md = text.match(/(\d{1,2})\/(\d{1,2})/); if (!md) return "";
    var fdate = todayK.ymd.slice(0, 4) + "-" + ("0" + md[1]).slice(-2) + "-" + ("0" + md[2]).slice(-2);
    // ① 외국인 코스피 순매수 — 네이버 일별(장중 잠정) foreign_hist.json 그날 값
    if (/외국인/.test(text) && /순매수/.test(text)){
      if (fdate !== todayK.ymd) return "";
      if (todayK.dow === 0 || todayK.dow === 6) return "";
      if (todayK.t < 9 * 60) return '<span class="a101-c">🇰🇷 장 열리면 보여요 (09:00~)</span>';
      var v = FH && FH[fdate]; if (v == null) return '<span class="a101-c">외국인 자료 기다리는 중</span>';
      var closed = todayK.t >= 15 * 60 + 40, ok = v > 0;
      return '<span class="a101-c ' + (ok ? "ok" : "no") + '">' + (closed ? "마감 → " : "지금 → ") + '외국인 <b class="' + (v > 0 ? "up" : "dn") + '">' + fmtN(v) + '억</b> ' + (closed ? "(잠정)" : "(장중 잠정)") + ' · ' + (ok ? "✓쪽" : "✗쪽") + '</span>';
    }
    // ② XLE 가 S&P 보다 강함 — 미국 그날 장(밤 10:30~) 시작 뒤에만
    if (/XLE/.test(text) && /S&P/.test(text) && /강/.test(text)){
      var fx = FL && FL.px && FL.px.XLE, ix = LU && (LU.index || []).filter(function(x){ return /S&P/.test(x.name); })[0];
      var inSess = FL && fx && ((FL.date === fdate && String(fx.at) >= "22:30") || (FL.date === addDay(fdate, 1) && String(fx.at) <= "07:00"));
      if (inSess && ix && LU.sess === fdate && fx.r != null && ix.chg != null){
        var ok2 = fx.r > ix.chg, after = FL.date === addDay(fdate, 1) && String(fx.at) >= "05:00";
        return '<span class="a101-c ' + (ok2 ? "ok" : "no") + '">' + (after ? "마감 → " : "지금 → ") + 'XLE <b class="' + (fx.r >= 0 ? "up" : "dn") + '">' + pct(fx.r) + '</b> vs S&P <b class="' + (ix.chg >= 0 ? "up" : "dn") + '">' + pct(ix.chg) + '</b> · ' + (ok2 ? "✓쪽" : "✗쪽") + ' <small>' + esc(fx.at) + '</small></span>';
      }
      if (fdate === todayK.ymd || (fdate === addDay(todayK.ymd, -1) && todayK.t < 5 * 60)) return '<span class="a101-c">🇺🇸 장 열리면 보여요 (밤 10:30~)</span>';
      return "";
    }
    return "";   // 재는 숫자가 정해지지 않은 줄 → 칩 없음
  }
  var A101_BUSY = false;
  function decorateTodo(){
    var box = document.querySelector(".xtodo"); if (!box || box.dataset.a101 || A101_BUSY) return;
    var id = curId(); if (!id) return;
    A101_BUSY = true;
    Promise.all([getJSON(file("market", id, "data.json")).catch(function(){ return null; }), X("foreign_hist.json", 300000), X("live_us.json", 60000), X("focus_live.json", 60000)]).then(function(r){
      A101_BUSY = false;
      box = document.querySelector(".xtodo"); if (!box || box.dataset.a101) return;
      box.dataset.a101 = "1";
      var d = r[0] || {}, P = d.forecasts_p || [], latest = isLatest(), K = kst();
      [].forEach.call(box.querySelectorAll(".xtd"), function(row, i){
        var body = row.querySelector(":scope > div"); if (!body) return;
        var p = P[i], h = "";
        if (p != null && p >= 0 && p <= 1) h += '<span class="a101-p" title="리포트가 아침에 매긴 확률"><i><em style="width:' + Math.round(p * 100) + '%"></em></i><b>' + Math.round(p * 100) + '%</b></span>';
        if (latest) h += liveChip(body.textContent, K, r[1], r[2], r[3]);
        if (h){ var w = document.createElement("div"); w.className = "a101"; w.innerHTML = h; body.appendChild(w); }
      });
      if (latest && P.length){ var n = document.createElement("div"); n.className = "mut"; n.style.cssText = "font-size:12.5px;margin-top:6px";
        n.textContent = "막대 = 리포트가 아침에 매긴 확률 · 「지금 →」 = 장중 숫자로 본 방향(판정은 마감 합계로)"; box.appendChild(n); }
      placeNow();
    }, function(){ A101_BUSY = false; });
  }

  /* ---------- A10-2 → 결론 줄 누르면 펼침 ---------- */
  document.addEventListener("click", function(ev){
    var s = ev.target.closest && ev.target.closest(".mk-so"); if (!s || ev.target.closest("a,button")) return;
    s.classList.toggle("a102-open");
  });

  /* ---------- A10-3 숫자 한 줄 ---------- */
  var SHORT = [[/^코스피 외국인 순매수.*|^외국인 순매수$/, "외국인"], [/^미 10년 금리$/, "美 10년"], [/^SK하이닉스$/, "하이닉스"], [/^달러\/원$/, "달러/원"], [/^달러지수$/, "달러지수"]];
  function fixNumbers(){
    [].forEach.call(document.querySelectorAll(".kpis2 .kp > span:not(.a103):not(.kp-now)"), function(s){
      var t = s.textContent.trim(); if (t.indexOf(" · ") < 0){ s.classList.add("a103"); return; }
      var parts = t.split(/\s·\s/);
      s.classList.add("a103"); s.innerHTML = parts.map(function(x){ return '<span class="a103c">' + esc(x) + '</span>'; }).join("");
    });
    [].forEach.call(document.querySelectorAll("#live .kv"), function(kv){
      var sm = kv.querySelector("small");
      if (sm && !sm.dataset.a103){
        sm.dataset.a103 = "1";
        [].forEach.call(sm.childNodes, function(n){ if (n.nodeType !== 3) return; var t = n.textContent.trim();
          SHORT.forEach(function(p){ if (p[0].test(t)){ sm.title = t; n.textContent = p[1]; } }); });
      }
      var b = kv.querySelector("b"); if (!b || b.dataset.a103 === b.textContent) return;
      b.dataset.a103 = b.textContent; b.style.fontSize = "";
      var fs = parseFloat(getComputedStyle(b).fontSize) || 14, n = 0;
      while (b.scrollWidth > b.clientWidth + 1 && fs > 11 && n++ < 8){ fs -= 1; b.style.fontSize = fs + "px"; }
    });
  }

  /* ---------- A10-4 날짜 칩 ---------- */
  var PERF = null;
  function decorateDates(){
    var box = document.getElementById("dates"); if (!box || box.dataset.a104 || window.cur !== "market") return;
    box.dataset.a104 = "1";
    var bs = [].slice.call(box.querySelectorAll(".date"));
    var ids = {}; bs.forEach(function(b){ ids[b.dataset.id] = b; });
    bs.forEach(function(b){
      var id = b.dataset.id || "", d = id.slice(0, 10), tag = id.slice(11);
      if (tag === "HOL") b.classList.add("a104-hol");
      if (tag === "WEEK" && ids[d + "_WK"]){             // 같은 날 「WK」 칩 하나로 — 📝 누르면 주간 회고
        b.classList.add("a104-hid");
        var wk = ids[d + "_WK"], rv = document.createElement("span"); rv.className = "a104-rv"; rv.textContent = "📝 회고"; rv.title = "주간 회고 열기";
        rv.onclick = function(ev){ ev.stopPropagation(); b.click(); };
        wk.appendChild(rv);
      }
    });
    if (!box.nextElementSibling || !box.nextElementSibling.classList.contains("a104-lg")){
      var lg = document.createElement("div"); lg.className = "a104-lg";
      lg.textContent = "";   // 🧊 11/09 ⑨ 설명 문장(「밑줄 왼쪽…」) 대신 고른 날의 숫자를 그림 옆에 바로 (아래 PERF 받은 뒤)
      box.parentNode.insertBefore(lg, box.nextSibling);
    }
    (PERF ? Promise.resolve(PERF) : X("market_perf.json", 600000)).then(function(m){
      if (!m || !m.dates) return; PERF = m;
      var col = function(c){ if (c == null || isNaN(c)) return "transparent"; if (Math.abs(c) < 0.05) return "color-mix(in srgb,var(--dim) 60%,transparent)";
        var a = Math.min(1, 0.3 + Math.abs(c) / 3).toFixed(2); return c > 0 ? "rgba(255,107,107," + a + ")" : "rgba(90,169,255," + a + ")"; };
      // 🧹 11/12 「코스피 0.0%」 고침 — 야후가 그날 종가를 아직 안 줘서 앞날 값을 그대로 이어 붙인 날(값이 똑같음)은 0.0% 가 아니라 「–」
      var chg = function(arr, i){ return i > 0 && arr && arr[i] != null && arr[i - 1] && arr[i] !== arr[i - 1] ? (arr[i] / arr[i - 1] - 1) * 100 : null; };
      bs.forEach(function(b){
        var d = (b.dataset.id || "").slice(0, 10), md = d.slice(5).replace("-", "/"), i = m.dates.indexOf(md); if (i < 1) return;
        var k = chg(m.kospi, i), s = chg(m.sp500, i);
        b.style.setProperty("--kr", col(k)); b.style.setProperty("--us", col(s)); b.classList.add("a104");
        b.title = "그날 코스피 " + (k == null ? "–" : pct(k)) + " · S&P " + (s == null ? "–" : pct(s)) + " (리포트 성적표 기준)";
        b.dataset.kr = k == null ? "" : pct(k); b.dataset.us = s == null ? "" : pct(s);
      });
      var on_ = box.querySelector(".date.on") || bs[0], lg_ = box.nextElementSibling, td_ = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      if (on_ && (on_.dataset.id || "").slice(0, 10) === td_) on_ = bs.filter(function(x){ return (x.dataset.id || "").slice(0, 10) < td_ && (x.dataset.kr || x.dataset.us); })[0] || null;   // 오늘은 아직 채점 전 → 마지막 거래일
      if (on_ && lg_ && lg_.classList.contains("a104-lg") && (on_.dataset.kr || on_.dataset.us)){
        var cc = function(t){ return /^\+/.test(t) ? "#f04452" : /^[−-]/.test(t) ? "#3182f6" : "inherit"; };
        lg_.innerHTML = '<b>' + esc(on_.textContent.replace(/📝.*$/, "").trim()) + '</b> 그날 <span style="border-bottom:3px solid var(--kr)">🇰🇷 코스피 <b style="color:' + cc(on_.dataset.kr) + '">' + esc(on_.dataset.kr || "–") + '</b></span> · <span>🇺🇸 S&P <b style="color:' + cc(on_.dataset.us) + '">' + esc(on_.dataset.us || "–") + '</b></span>';
        lg_.style.setProperty("--kr", on_.style.getPropertyValue("--kr") || "transparent");
      }
    });
    // 길게 누르면 그날 한 줄
    bs.forEach(function(b){
      var T = null, fired = false;
      var close = function(){ var o = document.querySelector(".a104-tip"); if (o) o.remove(); };
      b.addEventListener("pointerdown", function(){ fired = false; clearTimeout(T); T = setTimeout(function(){
        fired = true; close();
        var id = b.dataset.id, tip = document.createElement("div"); tip.className = "a104-tip";
        var r = b.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(window.innerWidth - 308, r.left)) + "px"; tip.style.top = (r.bottom + 6) + "px";
        tip.innerHTML = "<small>" + esc(b.title || id) + "</small>불러오는 중…"; document.body.appendChild(tip);
        getJSON(file("market", id, "data.json")).then(function(d){ tip.innerHTML = "<small>" + esc(b.title || id) + "</small>" + esc(String(d.one_liner || "한 줄 없음").replace(/<[^>]+>/g, "")); })
          .catch(function(){ tip.innerHTML = "<small>" + esc(b.title || id) + "</small>이 날은 한 줄 요약이 없어요"; });
        setTimeout(function(){ document.addEventListener("pointerdown", function off(){ close(); document.removeEventListener("pointerdown", off, true); }, true); }, 50);
      }, 550); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function(evn){ b.addEventListener(evn, function(){ clearTimeout(T); }); });
      b.addEventListener("click", function(ev){ if (fired){ ev.stopImmediatePropagation(); ev.preventDefault(); fired = false; } }, true);
      b.addEventListener("contextmenu", function(ev){ ev.preventDefault(); });
    });
  }

  /* ---------- A10-5 지금 볼 것 ---------- */
  function slot(){
    var K = kst(), wk = K.dow >= 1 && K.dow <= 5;
    if (K.dow === 6 && K.t < 6 * 60) return {k: "us", lab: "🇺🇸 미국 장 (밤)"};
    if (!wk) return {k: "us", lab: "주말 — 🇺🇸 마지막 장"};
    if (K.t < 6 * 60) return {k: "us", lab: "🌙 밤 — 🇺🇸 미국 장중"};
    if (K.t < 9 * 60) return {k: "am", lab: "🌅 아침 — 밤사이 움직임"};
    if (K.t < 15 * 60 + 30) return {k: "kr", lab: "🌞 한국 장중 — 실시간 시장판"};
    if (K.t < 22 * 60 + 30) return {k: "eve", lab: "🌆 저녁 — 오늘 할 일 결과"};
    return {k: "us", lab: "🌙 밤 — 🇺🇸 미국 장중"};
  }
  function findCard(re){ var c = null; [].some.call(document.querySelectorAll("#body section.card, #body details.card"), function(x){
    var h = x.querySelector(":scope > h3, :scope > summary, :scope > .mk-lab"); if (h && re.test(h.textContent)){ c = x; return true; } }); return c; }
  function placeNow(){
    if (window.cur !== "market" || uiMkt() === "fixed" || !isLatest()) return;
    var body = document.getElementById("body"), mh = document.getElementById("mhead"); if (!body || !mh || !mh.firstChild) return;
    var S = slot(), el = null;
    if (S.k === "kr" || S.k === "us") el = document.getElementById("live");
    else if (S.k === "eve") el = document.querySelector(".xtodo");
    else if (S.k === "am"){
      el = findCard(/밤사이 가장 크게/);
      if (el && el.classList.contains("xs-hid")){
        el.classList.remove("xs-hid"); el.dataset.xs = "keep";
        [].forEach.call(document.querySelectorAll("#xs-more .xs-row"), function(r){ if (/밤사이 가장 크게/.test(r.textContent)) r.remove(); });
        var n = document.querySelectorAll("#xs-more .xs-row").length, xn = document.getElementById("xs-n"); if (xn) xn.textContent = n + "개 · 누르면 열려요";
      }
    }
    if (!el || !el.innerHTML.trim()) return;
    var box = document.getElementById("mknow");
    if (box && box.contains(el)) return;
    if (!box){
      box = document.createElement("div"); box.id = "mknow";
      box.innerHTML = '<div class="mknow-h">⏰ 지금 볼 것 · <b></b><button type="button">고정 순서로</button></div>';
      box.querySelector("button").onclick = function(){ try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); u.mkt = "fixed"; localStorage.setItem("ui", JSON.stringify(u)); } catch(x) {}
        if (window.chToast) chToast("시황 순서를 고정했어요 · ⚙️ 에서 다시 켤 수 있어요"); go("market", curId()); };
    }
    box.querySelector("b").textContent = S.lab;
    if (mh.nextSibling !== box) mh.parentNode.insertBefore(box, mh.nextSibling);
    box.appendChild(el);
  }

  /* ---------- 붙이기 ---------- */
  var T = null;
  function run(){ T = null; if (window.cur !== "market") return; decorateDates(); decorateTodo(); fixNumbers(); placeNow(); }
  function kick(){ if (!T) T = setTimeout(run, 250); }
  function start(){
    var main = document.getElementById("main"); if (!main){ setTimeout(start, 300); return; }
    new MutationObserver(kick).observe(main, {childList: true, subtree: true});
    kick();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
;
__bk(45);
/* ======== ux1015c.js ======== */
/* CH Investing — 📱 신호 탭 A12-1~5 (10/15 사용자 「다 진행해」)
   ① A12-5 신호 묶음 위 작은 탭 4개(🐋 ☕ 📈 🔎)에 오늘 숫자 배지 + 오늘 새로 생긴 게 있으면 점
   ② A12-1·2·3·4 화면 모양(CSS) — 그리는 코드는 views.js(이름·정렬·고래 묶음)·extras.js(돌파 임박 지금 값)
*/
(function(){
  var CNT = null, CNT_T = 0;
  function lat(cat, f){
    var L = ((window.M && M.cats && M.cats[cat]) || []).filter(function(x){ return x.files.indexOf(f) >= 0; });
    return L.length ? getJSON(file(cat, L[0].id, f)).catch(function(){ return null; }) : Promise.resolve(null);
  }
  function counts(){
    if (CNT && Date.now() - CNT_T < 300000) return CNT;
    CNT_T = Date.now();
    CNT = Promise.all([lat("whale", "data.json"), lat("cup", "cards.json"), lat("gap", "cards.json"), lat("screen", "screens.json")]).then(function(r){
      var o = {};
      var w = r[0] && r[0].signals;
      if (w) o.whale = {n: (w.big || []).length, t: "숫자 = 고래 큰 신규 매수 " + (w.big || []).length + "종목", dot: (w.big || []).length > 0};
      var c = r[1];
      if (c && c.top){
        var near = c.top.filter(function(x){ return x.dist != null && x.dist >= -3 && x.dist < 0 && !x.brk; }).length;
        var nw = c.top.filter(function(x){ return x.streak === 1; }).length;
        o.cup = {n: near ? "🎯" + near : c.total, s: "", t: (near ? "숫자 = 돌파 임박 " + near + "종목 · " : "") + "컵 패턴 " + c.total + "종목" + " · 오늘 새로 " + nw, dot: nw > 0};
      }
      var g = r[2];
      if (g && g.top){
        var gn = g.top.filter(function(x){ return x.new || x.fresh || x.streak === 1; }).length;
        o.gap = {n: g.total, t: "갭 돌파 " + g.total + "종목 · 오늘 새로 " + gn, dot: gn > 0};
      }
      var s = r[3];
      if (s){
        var u = {};
        ["quiet", "lead", "hush", "triple"].forEach(function(k){ (s[k] || []).forEach(function(x){ u[(x && (x.code || x.s || x.t || x.sym)) || JSON.stringify(x)] = 1; }); });
        var n = Object.keys(u).length;
        if (n) o.screen = {n: n, t: "거름망 4개에 걸린 종목 " + n + "개 (겹친 것 한 번)", dot: false};
      }
      return o;
    }).catch(function(){ return {}; });
    return CNT;
  }
  window.subBadges = function(nav){
    nav = nav || document.getElementById("tabs");
    if (!nav || !nav.querySelector('[data-k="cup"],[data-k="whale"]')) return;
    counts().then(function(o){
      [].forEach.call(nav.querySelectorAll("button[data-k]"), function(b){
        var x = o[b.dataset.k]; if (!x || b.querySelector(".tbg")) return;
        var em = document.createElement("em"); em.className = "tbg" + (x.dot ? " dot" : "");
        em.textContent = (typeof x.n === "number" ? x.n.toLocaleString() : x.n) + (x.s ? " · " + x.s : "");
        em.setAttribute("role", "button"); em.setAttribute("aria-label", x.t + " — 누르면 그 종목으로");
        em.onclick = function(ev){ ev.stopPropagation(); ev.preventDefault(); jump(b.dataset.k); };
        b.appendChild(em); b.title = x.t;
      });
    });
  };
  /* 숫자를 누르면 → 그 탭의 그 종목들 자리로 이동 (10/15 사용자 「숫자 누르면 그 종목들만 보이게 혹은 위치로 이동」)
     🐋 큰 신규 매수만 남겨 보이기 · ☕ 돌파 임박 카드(접힌 줄까지 펼침) · 📈 갭 목록 · 🔎 거름망 고르는 칸 */
  var ANCH = {whale: "wsig", cup: "xnear", gap: "gseg", screen: "scrk"};
  var LEG = {whale: ["🐋", "큰 신규 매수"], cup: ["☕", "돌파 임박"], gap: ["📈", "갭 돌파"], screen: ["🔎", "거름망 4개 종목"]};
  function jump(k){
    var id = ANCH[k]; if (!id) return;
    if (typeof go === "function" && window.cur !== k) go(k);
    var t0 = Date.now();
    (function find(){
      var el = document.getElementById(id);
      if (!el){ if (Date.now() - t0 < 8000) setTimeout(find, 150); return; }
      var card = el.closest(".card") || el;
      if (k === "cup"){ var t1 = Date.now(); (function more(){ var bt = card.querySelector(".td-more");   // 접힌 「＋N개 더 보기」(tidy.js)가 붙으면 펼침
        if (bt){ if (/더 보기/.test(bt.textContent)) bt.click(); return; } if (Date.now() - t1 < 2500) setTimeout(more, 150); })(); }
      if (k === "whale") whaleOnly(el.closest(".card"));
      setTimeout(function(){
        var hd = document.querySelector("header"), y = card.getBoundingClientRect().top + window.scrollY - ((hd ? hd.offsetHeight : 0) + 10);
        window.scrollTo({top: Math.max(0, y), behavior: "smooth"});
        card.classList.add("flash"); setTimeout(function(){ card.classList.remove("flash"); }, 1800);
      }, 120);
    })();
  }
  window.sigJump = jump;
  function whaleOnly(card){
    if (!card) return;
    var chips = card.querySelectorAll(".wsgc"), n = 0;
    [].forEach.call(chips, function(c){ var on = (" " + (c.getAttribute("data-g") || "") + " ").indexOf(" big ") >= 0; c.classList.toggle("wsg-off", !on); if (on) n++; });
    var bar = card.querySelector(".wsg-only");
    if (!bar){ bar = document.createElement("div"); bar.className = "wsg-only"; var w = card.querySelector(".wsg"); if (w) w.parentNode.insertBefore(bar, w); }
    bar.innerHTML = "🆕 <b>큰 신규 매수 " + n + "종목</b>만 보는 중 <button type='button'>전체 보기 ✕</button>";
    bar.querySelector("button").onclick = function(){ [].forEach.call(chips, function(c){ c.classList.remove("wsg-off"); }); bar.remove(); };
  }
  // 뜻풀이 한 줄 — 신호 화면 맨 위 (누르면 위와 똑같이 이동)
  function legend(){
    var main = document.querySelector("main"); if (!main || !LEG[window.cur]) return;
    if (main.querySelector("#sgleg")) return;
    counts().then(function(o){
      if (!LEG[window.cur] || main.querySelector("#sgleg")) return;
      var ks = ["whale", "cup", "gap", "screen"].filter(function(k){ return o[k]; }); if (!ks.length) return;
      var d = document.createElement("div"); d.id = "sgleg";
      d.innerHTML = '<small>탭 위 숫자 · 누르면 그 종목으로</small>' + ks.map(function(k){ var x = o[k];
        return '<button type="button" data-j="' + k + '" class="' + (x.dot ? "dot" : "") + '"><i>' + (typeof x.n === "number" ? x.n.toLocaleString() : x.n) + '</i>' + LEG[k][0] + " " + LEG[k][1] + '</button>'; }).join("") +
        '<small class="sgl-k">빨간 숫자 = 오늘 새로 들어온 게 있음</small>';
      [].forEach.call(d.querySelectorAll("[data-j]"), function(b){ b.onclick = function(){ jump(b.dataset.j); }; });
      main.insertBefore(d, main.firstChild);
    });
  }
  (function watch(){
    var main = document.querySelector("main");
    if (!main){ setTimeout(watch, 300); return; }
    new MutationObserver(function(){ if (LEG[window.cur] && !main.querySelector("#sgleg")) legend(); }).observe(main, {childList: true});
    legend();
  })();

  // 그려져 있는 탭에도 (처음 열 때)
  setTimeout(function(){ try { window.subBadges(); } catch(x) {} }, 600);

  var css = document.createElement("style");
  css.textContent =
    // A12-5 탭 배지 — 오른쪽 위 작은 숫자 방울(탭 폭은 그대로 · 오늘 새로 생긴 게 있으면 빨강)
    "header .tabs.sub:has(.tbg){padding-top:7px}header .tabs.sub .tab{position:relative}" +
    "header .tabs.sub .tab .tbg{position:absolute;top:-7px;right:-5px;font-style:normal;font-size:12.5px;font-weight:800;line-height:16px;min-width:16px;padding:0 5px;border-radius:999px;background:#3a4256;color:#fff;box-shadow:0 0 0 2px var(--bg);white-space:nowrap;cursor:pointer}header .tabs.sub .tab .tbg::before{content:'';position:absolute;inset:-8px}" +
    "header .tabs.sub .tab .tbg.dot{background:#e5484d}" +
    // 뜻풀이 줄 · 고래 「큰 신규 매수만」
    "#sgleg{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 2px 12px}#sgleg small{flex-basis:100%;color:var(--sub);font-size:12.5px}#sgleg small.sgl-k{font-size:12.5px;color:var(--dim)}" +
    "#sgleg button{border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit;font-size:12.5px;border-radius:999px;padding:4px 10px 4px 4px;display:inline-flex;align-items:center;gap:6px;cursor:pointer}" +
    "#sgleg button i{font-style:normal;font-weight:800;font-size:12.5px;background:#3a4256;color:#fff;border-radius:999px;padding:1px 6px;min-width:18px;text-align:center}#sgleg button.dot i{background:#e5484d}" +
    ".wsgc.wsg-off{display:none}.wsg-only{font-size:13px;margin:0 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.wsg-only button{border:1px solid var(--line);background:var(--panel);color:var(--sub);font:inherit;font-size:12.5px;border-radius:999px;padding:2px 9px;cursor:pointer}" +
    // A12-1 이름 한 줄
    ".cc .nm2 b[data-nmk]{word-break:keep-all}.cc .nm2{min-width:0}" +
    // A12-2 고래 오늘의 신호
    ".wsg-top{margin:0 0 8px;font-size:14px}.wsg-top a{color:inherit}" +
    ".wsg{display:flex;flex-wrap:wrap;gap:6px}.wsgc .wsgi{font-size:12.5px;margin-left:2px;letter-spacing:1px}.wsg-k{margin:8px 0 0!important;font-size:12.5px}" +
    // A12-3 돌파 임박 지금 값
    ".xr .xnl{flex-basis:100%;text-align:right;font-size:12.5px;color:var(--dim);margin-top:-2px}.xr .xnl.on{color:var(--sub)}.xr .xnl.was{color:#2bb673}" +
    ".xr.xbrk{background:color-mix(in srgb,#2bb673 14%,transparent);border-radius:10px}.xr.xbrk .xnd{color:#2bb673!important}.xr.xbrk .xbar i{background:#2bb673!important}" +
    ".xr{flex-wrap:wrap}" +
    // A12-4 며칠째
    ".seg2.srt{margin-top:-4px}.seg2.srt button{font-size:12.5px}" +
    ".cc .nwdot{font-style:normal;color:#ff9f43;font-size:12.5px;margin-right:4px;vertical-align:2px}" +
    ".cc.old{background:color-mix(in srgb,var(--panel) 70%,var(--bg));border-color:color-mix(in srgb,var(--line) 60%,transparent)}" +
    ".cc.old .nm2 b{color:var(--sub)}";
  document.head.appendChild(css);
})();
;
__bk(46);
/* ======== ux1019.js ======== */
/* 🎲 10/19 「오늘, 확률로 말하면」 — 🏠 오늘 탭 맨 위 한 장
   사용자 10/19: "시황두뇌랑 시장확률을 이렇게 열심히 돌리고 있는데 틀려도 좋으니 확률적으로 이렇다 라고
   오늘 카테고리 처음에 좀 강하게 얘기를 해라 · 쉽고 직관적이게 · 그때 그때 바꿔서"
   자료: archive/x/prob.json(🎲 매시간) · market/home.json brain(🧠 매시간) · brain/state.json theses
   시간대에 따라 주인공 시장이 바뀐다: 한국 장 전·장중 = 🇰🇷 코스피 · 저녁·밤 = 🇺🇸 미국. 숫자는 prob.json 그대로(새 계산 없음). */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function J(u){ return getJSON(u + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }
  function pct(p){ return Math.round(p * 100); }
  function ten(p){ return Math.max(0, Math.min(10, Math.round(p * 10))); }
  /* 세게 말하기 — 확률 → 한 마디 (틀려도 좋다는 전제) */
  // ⚡ 10/19: 장이 아직 많이 남았으면(남은 시간 40%↑) 「거의 확실히」라고 하지 않음 — 10:18 「12% 거의 확실히 내린다」 뒤 10:23 플러스 전환
  /* 🔒 10/19 사용자 「너의 확률이 이리 개판」 → 「ㅇㅇ 적용해」: 다음 날 방향 성적이 동전보다 확실히 나아지기 전(20건↑ · 적중 55%↑)엔
     세게 말하지 않는다 — 「반반」·「약간 ○○ 쪽」까지만. 성적은 prob.json score.all.d1 (매일 채점) */
  var PROVEN = false, WEAK = false;
  function gate(P){ var d = P && P.score && P.score.all && P.score.all.d1 || {}; PROVEN = (d.n || 0) >= 20 && (d.hit || 0) >= 55; WEAK = (d.n || 0) >= 20 && (d.hit || 0) < 50; return d; }
  function word(p, soft){
    /* 🩶 10/31 A4: 실전 적중이 동전(50%)보다 못한 동안엔 색을 빼고 「참고」로 — 큰 빨강·파랑 제목이 믿을 만해 보이지 않게 */
    if (WEAK){
      if (p >= 0.55) return {t: "약간 오를 쪽 · 참고만", c: "flat"};
      if (p <= 0.45) return {t: "약간 내릴 쪽 · 참고만", c: "flat"};
      return {t: "반반 — 동전 던지기", c: "flat"};
    }
    if (!PROVEN){
      if (p >= 0.60) return {t: "오를 쪽 (검증 전)", c: "up"};
      if (p >= 0.55) return {t: "약간 오를 쪽", c: "up"};
      if (p <= 0.40) return {t: "내릴 쪽 (검증 전)", c: "dn"};
      if (p <= 0.45) return {t: "약간 내릴 쪽", c: "dn"};
      return {t: "반반 — 동전 던지기", c: "flat"};
    }
    if (soft && p >= 0.70) return {t: "오른다 쪽에 세게", c: "up2"};
    if (soft && p <= 0.30) return {t: "내린다 쪽에 세게", c: "dn2"};
    if (p >= 0.70) return {t: "거의 확실히 오른다", c: "up2"};
    if (p >= 0.60) return {t: "오른다 쪽에 세게", c: "up"};
    if (p >= 0.55) return {t: "오를 쪽", c: "up"};
    if (p > 0.45)  return {t: "반반 — 동전 던지기", c: "flat"};
    if (p > 0.40)  return {t: "내릴 쪽", c: "dn"};
    if (p > 0.30)  return {t: "내린다 쪽에 세게", c: "dn"};
    return {t: "거의 확실히 내린다", c: "dn2"};
  }
  function kst(){ var d = new Date(Date.now() + 9 * 3600e3); return {m: d.getUTCHours() * 60 + d.getUTCMinutes(), day: d.getUTCDay(), ymd: d.toISOString().slice(0, 10)}; }
  /* 지금 시각의 주인공 — 한국 장 전·장중(06:00~15:30) 🇰🇷 · 그 뒤 🇺🇸 · 주말은 다음 주 월요일 이야기 */
  /* 10/31 A2: 금요일 밤에도 「내일 코스피」라던 것 → 실제 다음 장 요일 (prob.json next_day) */
  function nextKr(kr, K){
    var nd = kr && kr.next_day; if (!nd) return K.day === 0 || K.day === 6 ? "월요일" : "내일";
    var dd = Math.round((Date.parse(nd + "T00:00:00Z") - Date.parse(K.ymd + "T00:00:00Z")) / 864e5);
    return dd === 1 ? "내일" : dd === 0 ? "오늘" : ["일", "월", "화", "수", "목", "금", "토"][new Date(nd + "T00:00:00Z").getUTCDay()] + "요일";
  }
  function lead(P, K){
    var M = P.markets || {}, kr = M.KR, us = M.US, wk = K.day === 0 || K.day === 6;
    if (!wk && K.m >= 6 * 60 && K.m < 15 * 60 + 30 && kr) return {mk: kr, when: kr.open_now && kr.intra_chg != null ? "오늘 종가" : "오늘", other: us, otherWhen: "오늘 밤 미국"};
    if (us) return {mk: us, when: wk ? "다음 미국 장" : (K.m >= 22 * 60 + 30 || K.m < 6 * 60 ? "지금 미국 장" : "오늘 밤 미국"), other: kr, otherWhen: nextKr(kr, K) + " 코스피"};
    return kr ? {mk: kr, when: "내일", other: null} : null;
  }
  function anchorLine(mk){
    var a = (mk.methods || []).filter(function(x){ return x.anchor && x.p1 != null; })[0];
    if (!a) return "";
    var ev = String(a.ev || "").split("→")[0].replace(/\(.*?\)/g, "").trim();
    return ev ? a.ic + " " + ev : "";
  }

  /* ⚡ 10/19 사용자: 「두뇌가 확률을 얘기했으면 실시간으로 — 지금 반등이 나오고 있고 종가 플러스 확률이 올라가고 있고 어느 섹터가 강하니
     이쪽을 보자 · 장이 계속 밀리니 어디 섹터는 특히 조심하고 현금 비중을 어느 선까지 — 확률적으로 직관적으로」
     장중 나침반(10분마다) 흐름으로: ① 종가 플러스 확률이 어떻게 움직였나 ② 지금 볼 곳 / 조심할 곳(섹터·대형주) ③ 🎯 집중 ★종목 지금 ④ 규칙에 있는 대응만(현금 선 · 급락일 쉬기) */
  function pc2(v){ return (v > 0 ? "+" : "") + v.toFixed(1) + "%"; }
  function cl2(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function nowBlock(mk, L, lv, F, FL, CONC){
    if (!L || !window.probAt || !mk) return "";
    if (L.date && L.date !== kst().ymd) return "";                                          // 오늘 나침반만
    var closed = false;
    if (!lv){                                                                               // ⚡ 확률 재계산이 없어도 섹터·종목은 늘 보이게 (10/19 「섹터랑 종목 또 사라짐」)
      var ix = L.index && L.index[0]; if (!ix || ix.chg == null || !L.t) return "";
      var r0 = probAt(mk, ix.chg, L.t); closed = !r0 || /CLOSE/i.test(ix.status || "") || kst().m >= 15 * 60 + 30;
      lv = {t: L.t, chg: ix.chg, p1: r0 ? r0.p1 : (ix.chg > 0 ? 0.99 : ix.chg < 0 ? 0.01 : 0.5)};
    }
    var sn = (L.snaps || []).filter(function(x){ return x && x[3] != null; });
    var pts = sn.map(function(x){ var r = probAt(mk, x[3], x[0]); return r ? [x[0], r.p1] : null; }).filter(Boolean);
    pts = pts.filter(function(x){ return x[0] < lv.t; }); pts.push([lv.t, lv.p1]);
    var nowM = (function(t){ var a = t.split(":"); return +a[0] * 60 + +a[1]; })(lv.t);
    var ago = pts.filter(function(x){ var a = x[0].split(":"); return nowM - (+a[0] * 60 + +a[1]) >= 50; }).slice(-1)[0] || pts[0];
    var d = lv.p1 - ago[1], first = pts[0];
    // 흐름 막대: 시각별 확률 (50% 선 위 빨강 · 아래 파랑)
    var W = 150, H = 34, n = pts.length, xs = function(i){ return n > 1 ? 4 + i * (W - 8) / (n - 1) : W / 2; }, ys = function(p){ return 4 + (1 - p) * (H - 8); };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" class="pl-spark"><line x1="0" x2="' + W + '" y1="' + ys(0.5) + '" y2="' + ys(0.5) + '" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="3 3"/>' +
      '<polyline fill="none" stroke="currentColor" stroke-width="2" points="' + pts.map(function(x, i){ return xs(i).toFixed(1) + "," + ys(x[1]).toFixed(1); }).join(" ") + '"/>' +
      '<circle cx="' + xs(n - 1).toFixed(1) + '" cy="' + ys(lv.p1).toFixed(1) + '" r="3" fill="currentColor"/></svg>';
    var chg = lv.chg, mood;
    if (closed) mood = "🔔 마감 — 코스피 " + pc2(chg);
    else if (d >= 0.10 && lv.p1 >= 0.5) mood = "📈 반등이 붙는 중 — 오를 쪽으로 기울고 있어요";
    else if (d >= 0.10) mood = "↗ 낙폭을 줄이는 중 — 아직은 내릴 쪽";
    else if (d <= -0.10 && lv.p1 <= 0.5) mood = "📉 계속 밀리는 중 — 내릴 쪽으로 기울고 있어요";
    else if (d <= -0.10) mood = "↘ 오름폭을 반납하는 중 — 아직은 오를 쪽";
    else mood = "↔ 1시간 전과 비슷 — 큰 변화 없이 버티는 중";
    var up = L.up || 0, dn = L.down || 0, br = Math.round(up / Math.max(1, up + dn) * 100), br0 = first && sn[0] ? Math.round(sn[0][1] / Math.max(1, sn[0][1] + sn[0][2]) * 100) : null;
    var ss = (L.sectors || []).filter(function(x){ return x.r != null; }).sort(function(a, b){ return b.r - a.r; });
    var bigs = function(x, best){ return (x.big || []).filter(function(t){ return t.r != null && (best ? t.r > 0 : t.r < 0); }).sort(function(a, b){ return best ? b.r - a.r : a.r - b.r; }).slice(0, 1)
      .map(function(t){ return '<a data-op="' + e(t.s) + '">' + e(t.n) + ' <b class="' + cl2(t.r) + '">' + pc2(t.r) + '</b></a>'; }).join(" · "); };
    var good = ss.filter(function(x){ return x.r >= 0.3 && (x.up || 0) >= (x.down || 0); }).slice(0, 2);
    var bad = ss.slice().reverse().filter(function(x){ return x.r <= -0.3; }).slice(0, 1);
    var row = function(ic, lab, list, best){ return list.length ? '<div class="pl-nw"><span class="pl-k">' + ic + ' ' + lab + '</span><div>' + list.map(function(x){ var b = bigs(x, best);
      return '<div class="pl-sr"><b>' + e(x.name) + ' <span class="' + cl2(x.r) + '">' + pc2(x.r) + '</span></b>' + (b ? ' <span class="pl-sm">· ' + b + '</span>' : '') + '</div>'; }).join("") + '</div></div>' : ''; };
    // 🎯 오늘 집중 ★·관심 국내 종목의 지금 값
    var fl = FL && FL.px || {}, st = [];
    ((F && F.themes) || []).forEach(function(t){ (t.kr || []).forEach(function(k){ var q = fl[k.t]; if (q && q.r != null) st.push({n: k.name, t: k.t, r: q.r, star: /★/.test(k.act || ""), th: t.name}); }); });
    st.sort(function(a, b){ return b.r - a.r; });
    var foc = st.length ? '<div class="pl-nw"><span class="pl-k">🎯 집중 종목</span><div class="pl-sm">' + st.slice(0, 3).map(function(x){ return (x.star ? "★ " : "") + '<a data-op="' + e(x.t) + '">' + e(x.n) + ' <b class="' + cl2(x.r) + '">' + pc2(x.r) + '</b></a>'; }).join(" · ") + '</div></div>' : '';
    // 대응 — 규칙에 있는 것만
    var act = [];
    if (closed) {}
    else if (chg <= -3) act.push("⛔ 코스피 −3%↓ — 우리 규칙: 오늘은 신규 진입 쉬기");
    else if (d <= -0.10 && chg < -1) act.push("🛑 밀리는 장 — " + (bad[0] ? e(bad[0].name) + "·" : "") + "약한 쪽은 비중 늘리지 않기");
    else if (d >= 0.10 && lv.p1 >= 0.55 && good[0]) act.push("👀 반등 주도 " + e(good[0].name) + (good[1] ? "·" + e(good[1].name) : "") + " 쪽을 먼저 본다 (추격보다 눌림)");
    var R = CONC && CONC.regime;
    if (R) act.push("💼 현금 규칙: " + (R.up ? "🟢 S&P 200일선 위 → 현금 0%" : "🔴 S&P 200일선 아래 → 현금 26%"));
    return '<div class="pl-now"><div class="pl-nh"><b>' + (closed ? '🇰🇷 오늘 장 마감 ' : '⚡ 지금 장 ') + e(lv.t) + '</b> <span class="pl-sm mut">코스피 <span class="' + cl2(chg) + '">' + pc2(chg) + '</span> · 오른 종목 ' + br + '%' + (br0 != null ? ' (개장 ' + br0 + '%)' : '') + '</span></div>' +
      '<div class="pl-tr ' + (lv.p1 >= 0.5 ? "up" : "dn") + '">' + svg + '<span>' + e(mood) + '</span></div>' +
      row("👀", "볼 곳", good, true) + row("⚠️", "조심", bad, false) + foc +
      (act.length ? '<div class="pl-act">' + act.map(function(x){ return '<div>' + x + '</div>'; }).join("") + '</div>' : '') + '</div>';
  }
  // ⚡ 섹터·대형주·집중 종목 칸은 확률 재계산 여부·주인공 시장(밤엔 🇺🇸)과 상관없이, 오늘 한국 나침반이 있으면 늘 붙임 · 오류가 나도 카드 전체는 살림
  function safeNow(P, L, LV, lv){
    try {
      var kr = L.mk.mk === "KR" ? L.mk : (P.markets && P.markets.KR);
      return nowBlock(kr, LV.KR, L.mk.mk === "KR" ? lv : null, LV.F, LV.FL, LV.CONC) || "";
    } catch(x){ if (window.console) console.warn("nowBlock", x); return ""; }
  }
  function build(P, B, T, LV){
    var K = kst(), L = lead(P, K); if (!L) return "";
    LV = LV || {};
    var SC = gate(P);
    // ⚡ 장중이면 장중 나침반(10분마다)의 지금 등락으로 확률을 다시 계산 (problive.js)
    var lv = window.probLive ? probLive(L.mk, LV[L.mk.mk], P) : null;
    if (lv) L.mk = Object.assign({}, L.mk, {p1: lv.p1, intra_chg: lv.chg});
    if (L.other && window.probLive){ var lo = probLive(L.other, LV[L.other.mk], P); if (lo) L.other = Object.assign({}, L.other, {p1: lo.p1}); }
    var soft = L.mk.open_now && (lv ? lv.rem > 0.4 : true);
    var mk = L.mk, p1 = mk.p1, p5 = mk.p5, w1 = word(p1, soft), w5 = word(p5);
    var strong = PROVEN && (p1 >= 0.6 || p1 <= 0.4);
    var head = e(mk.flag + " " + mk.ixn + " " + L.when) + " → <em>" + e(w1.t) + "</em>";
    var ten1 = ten(p1), ten5 = ten(p5);
    var nums = '<span class="pl-ten ' + w1.c + '" title="오를 확률 ' + pct(p1) + '%">' + "●".repeat(ten1) + "○".repeat(10 - ten1) + ' <b>10번 중 ' + ten1 + '번 오름</b> (' + pct(p1) + '%)</span>';
    var anc = lv ? "⚡ 지금 " + mk.ixn + " " + (lv.chg > 0 ? "+" : "") + lv.chg.toFixed(2) + "% (" + lv.t + " 장중 나침반) · 장 남은 시간 " + Math.round(lv.rem * 100) + "% · 남은 흔들림 " + Math.round(lv.vr * 100) + "% · 하루 흔들림 " + (lv.sig * 100).toFixed(1) + "%" : anchorLine(mk);
    var band = !lv && mk.band1 && mk.band1.length === 2 ? "예상 폭 " + mk.band1[0] + "% ~ +" + mk.band1[1] + "%" : "";
    var wk5 = '<div class="pl-row"><span class="pl-k">일주일 뒤</span><b class="' + w5.c + '">' + e(w5.t) + '</b> <small>10번 중 ' + ten5 + '번 (' + pct(p5) + '%)</small></div>';
    var oth = L.other ? '<div class="pl-row"><span class="pl-k">' + e(L.otherWhen) + '</span><b class="' + word(L.other.p1).c + '">' + e(word(L.other.p1).t) + '</b> <small>' + pct(L.other.p1) + '%</small></div>' : "";
    // 🧠 두뇌 — 국면 + 가장 확신하는 논지 하나
    var th = (T && T.theses || []).slice().sort(function(a, b){ return (b.conf || 0) - (a.conf || 0); })[0];
    var br = (B && (B.regime || B.summary)) ? '<div class="pl-row pl-br"><span class="pl-k">🧠 두뇌</span><div><b>' + e(String(B.regime || "").split(" / ")[0]) + '</b>' +
      (th ? '<small>「' + e(th.t) + '」 확신 ' + pct(th.conf || 0) + '%</small>' : (B.summary ? '<small>' + e(String(B.summary).split(" — ")[0]) + '</small>' : '')) + '</div></div>' : "";
    var sc = P.score && P.score.all && P.score.all.d1 || {}, hit = sc.n ? " · 지금까지 다음 날 방향 " + Math.round(sc.hit / 100 * sc.n) + "/" + sc.n + " 맞음" : "";
    var stale = P.date && P.date !== K.ymd && K.m >= 9 * 60 ? ' <span class="pl-old">(' + e(P.date.slice(5).replace("-", "/")) + ' 계산)</span>' : "";
    /* 🧹 10/21 「오늘 한 장」: 결론 한 줄 + 국면·한 문장 + 볼 곳 — 확률 숫자·10칸 점·검증 경고·일주일 뒤·다른 시장은 🎲 시장확률 탭·📊 성적표로 */
    var reg = B && B.regime ? String(B.regime).split(" / ")[0] : "";
    var one = th ? th.t : (B && B.summary ? String(B.summary).split(/ — |\. /)[0] : "");
    if (one.length > 60) one = one.slice(0, 58) + "…";
    var nowH = safeNow(P, L, LV, lv), look = nowH || focusBlock(LV.HF);
    return '<section class="card pl ' + w1.c + '" data-goto="prob" role="button">' +
      '<div class="pl-top"><span class="pl-ic">🎲</span><div class="pl-h"><small>오늘 한 줄 · ' + e(lv ? lv.t : (P.t || "")) + stale + '</small><div class="pl-head">' + head + '</div></div><span class="pl-go">자세히 ›</span></div>' +
      (reg || one ? '<div class="pl-one">' + (reg ? '<span class="pl-reg">' + e(reg) + '</span>' : '') + e(one) + '</div>' : '') +
      look +
      '<div class="pl-foot">' + (PROVEN ? '' : '아직 검증 중이라 약하게만 말해요 · ') + '사라·팔라는 뜻 아님</div></section>';
  }
  /* 장 전·주말엔 장중 나침반이 없으니 「볼 곳」은 오늘 집중 테마(market/home.json focus)로 */
  function focusBlock(F){
    if (!F || !F.length) return "";
    return '<div class="pl-now"><div class="pl-nh"><b>👀 오늘 볼 곳</b> <span class="pl-sm mut">돈이 몰리는 테마</span></div>' + F.slice(0, 2).map(function(t){
      return '<div class="pl-nw"><span class="pl-k">' + e(t.name) + '</span><div class="pl-sm">' + e(t.stage || "") + (t.r5 != null ? ' · 5일 ' + pc2(t.r5) : '') +
        ((t.stars || []).length ? '<div>' + t.stars.slice(0, 3).map(function(x){ return '★ <a data-op="' + e(x.t) + '">' + e(x.name) + '</a>'; }).join(" · ") + '</div>' : '') + '</div></div>'; }).join("") + '</div>';
  }
  function mount(){
    var body = document.getElementById("hmbody"); if (!body) return;
    var LJ = function(k){ return J("archive/x/live_" + k + ".json").catch(function(){ return null; }); };
    var NL = function(u){ return J(u).catch(function(){ return null; }); };
    Promise.all([J("archive/x/prob.json"), J(RAWM + "market/home.json").catch(function(){ return null; }), J(RAWM + "brain/state.json").catch(function(){ return null; }), LJ("kr"), LJ("us"),
                 NL(RAWM + "market/focus.json"), NL("archive/x/focus_live.json"), NL(RAWM + "market/conc.json")]).then(function(a){
      var html = build(a[0], a[1] && a[1].brain, a[2], {KR: a[3], US: a[4], F: a[5], FL: a[6], CONC: a[7], HF: a[1] && a[1].focus}); if (!html) return;
      var b2 = document.getElementById("hmbody"); if (!b2) return;
      var old = b2.querySelector(".pl"); if (old) old.remove();
      var anchor = b2.querySelector(".hm-live") || b2.querySelector(".hm-day");
      var box = document.createElement("div"); box.innerHTML = html; var el = box.firstChild;
      if (anchor && anchor.nextSibling) b2.insertBefore(el, anchor.nextSibling); else b2.appendChild(el);
    }).catch(function(x){ if (window.console) console.warn("probline", x); });
  }
  // 10/19 사용자 「장 중에도 카드 계속 바꿀 거지?」 → 오늘 탭을 열어 둔 동안 3분마다 다시 받아 그 자리에서 바꿈(🎲 계산은 장중 약 30분마다 · 🧠 두뇌는 매시간)
  setInterval(function(){ if (document.visibilityState === "visible" && document.getElementById("hmbody") && document.querySelector("#hmbody .pl")) mount(); }, 180000);
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "visible" && document.getElementById("hmbody")) mount(); });
  var prev = window.hmAfter;
  window.hmAfter = function(H){ if (prev) try { prev(H); } catch(x){ if (window.console) console.warn("hmAfter", x); } mount(); };
  var st = document.createElement("style");
  st.textContent = [
    ".pl{padding:12px 14px!important;cursor:pointer;border-width:1px;position:relative}",
    ".pl-now{margin:10px 0 4px;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,var(--text) 5%,var(--panel));border:1px solid var(--line)}",
    ".pl-nh{margin-bottom:4px}.pl-tr{display:flex;gap:8px;align-items:center;font-size:13.5px;line-height:1.4;margin:2px 0 6px}.pl-tr.up{color:#e5484d}.pl-tr.dn{color:#3987e5}.pl-tr span{color:var(--text)}.pl-spark{flex:none}",
    ".pl-nw{display:flex;gap:8px;font-size:13.5px;line-height:1.45;padding:4px 0;border-top:1px dashed var(--line)}.pl-nw .pl-k{flex:none;width:78px}.pl-nw a{color:inherit;text-decoration:none;cursor:pointer}",
    ".pl-sm{font-size:12.5px;display:inline}.pl-sr .pl-sm+div.pl-sm,.pl-sr div.pl-sm{display:block}.pl-sr{margin-bottom:3px}",
    ".pl-act{margin-top:6px;font-size:13px;line-height:1.5;border-top:1px dashed var(--line);padding-top:5px}",
    ".pl-warn{margin:8px 0 4px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#ffb84d 22%,var(--panel));border:1px solid rgba(255,184,77,.6);font-size:13.5px;line-height:1.45}",
    ".pl.up,.pl.up2{background:color-mix(in srgb,#ff6b6b 10%,var(--panel));border-color:rgba(255,107,107,.45)}",
    ".pl.dn,.pl.dn2{background:color-mix(in srgb,#3987e5 12%,var(--panel));border-color:rgba(57,135,229,.5)}",
    ".pl.flat{background:var(--panel)}.pl.strong{border-width:2px}",
    ".pl-top{display:flex;align-items:flex-start;gap:10px}.pl-ic{font-size:24px;width:38px;height:38px;border-radius:11px;background:var(--panel2);display:flex;align-items:center;justify-content:center;flex:none}",
    ".pl-h{flex:1;min-width:0}.pl-h>small{display:block;font-size:12.5px;color:var(--sub);margin-bottom:2px}.pl-old{color:#ffb84d}",
    ".pl-head{font-size:17px;font-weight:800;line-height:1.3;letter-spacing:-.3px}.pl-head em{font-style:normal;font-size:20px}",
    ".pl.up .pl-head em,.pl.up2 .pl-head em{color:#ff8a8a}.pl.dn .pl-head em,.pl.dn2 .pl-head em{color:#7cb0ff}.pl.flat .pl-head em{color:var(--text)}",
    ".pl-go{color:var(--sub);font-size:12.5px;white-space:nowrap;margin-top:4px}",
    ".pl-nums{margin:8px 0 4px;font-size:13px}.pl-ten{letter-spacing:1px}.pl-ten b{letter-spacing:0;margin-left:4px}.pl-ten.up,.pl-ten.up2{color:#ff8a8a}.pl-ten.dn,.pl-ten.dn2{color:#7cb0ff}.pl-ten.flat{color:var(--sub)}",
    ".pl-why{font-size:12.5px;color:var(--sub);line-height:1.45;margin-bottom:6px}",
    ".pl-row{display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-top:1px dashed var(--line);font-size:13.5px;line-height:1.4}.pl-row:first-of-type{border-top:0}",
    ".pl-k{flex:none;width:92px;color:var(--sub);font-size:12.5px;font-weight:700;padding-top:1px}.pl-row b.up,.pl-row b.up2{color:#ff8a8a}.pl-row b.dn,.pl-row b.dn2{color:#7cb0ff}.pl-row small{color:var(--sub);font-size:12.5px}",
    ".pl-br>div{flex:1;min-width:0}.pl-br small{display:block;line-height:1.4;margin-top:1px}",
    ".pl-foot{margin-top:7px;font-size:12.5px;color:var(--dim);line-height:1.4}",
    ".pl-one{font-size:13.5px;line-height:1.5;margin:6px 0 2px;color:var(--text)}.pl-reg{display:inline-block;font-size:12.5px;font-weight:700;padding:1px 7px;border-radius:9px;margin-right:6px;background:var(--panel2);color:var(--sub)}",
    "html[data-ui=light] .pl.up .pl-head em,html[data-ui=light] .pl.up2 .pl-head em,html[data-ui=light] .pl-ten.up,html[data-ui=light] .pl-ten.up2,html[data-ui=light] .pl-row b.up,html[data-ui=light] .pl-row b.up2{color:#d6453d}",
    "html[data-ui=light] .pl.dn .pl-head em,html[data-ui=light] .pl.dn2 .pl-head em,html[data-ui=light] .pl-ten.dn,html[data-ui=light] .pl-ten.dn2,html[data-ui=light] .pl-row b.dn,html[data-ui=light] .pl-row b.dn2{color:#2c6fd1}"
  ].join("");
  document.head.appendChild(st);
})();
;
__bk(47);
/* ======== ux1019b.js ======== */
/* 🧵 10/19 A10/19-2 「이 종목, 앱 성적표」 — 종목 화면 「이 종목에 뜬 신호」 밑 세로 타임라인 (사용자 「다 적용해」)
   앱이 이 종목에 한 말(알림 · 킥 진입/청산 · 그림자 장부 · 컵·갭·매집 신호 · 시황에 이름 나옴)을 날짜순으로 꿰고,
   값이 있는 점마다 「그때 값 → 지금 ±%」, 맨 끝에 「앱이 한 말 N번 · 그 뒤 오른 것 M번 · 평균 ±%」.
   자료(새 계산 없음): archive/x/push_log.json · market/kick.json(open·hold·closed·closed_all·shadow_log) · archive/x/market_x.json chips · archive/x/perf_cup/gap/accum.json
   숫자는 지어내지 않음 — 그때 값이 없는 점(시황 언급)은 채점에서 뺌. 사라는 말 없음. */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function J(u, t){ return getJSON(u + "?" + Math.floor(Date.now() / (t || 300000)), {ttl: t || 300000}).catch(function(){ return null; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : "") + v.toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v == null || isNaN(v) ? "" : v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return String(d || "").slice(5, 10).replace("-", "/"); }
  function sameFn(sym){
    var code = sym.split(".")[0], kr = /^\d{6}$/.test(code);
    return function(c){ c = String(c || ""); if (!c) return false; if (c === sym) return true; var cc = c.split(".")[0]; return kr ? cc === code : (cc === code && (c.indexOf(".") < 0 || sym.indexOf(".") < 0)); };
  }
  function fmtPx(v, sym){ if (v == null) return ""; var kr = /\.K[SQ]$|^\d{6}$/.test(sym); return kr ? Math.round(v).toLocaleString() : (v >= 100 ? v.toFixed(0) : v.toFixed(2)); }

  function build(sym, box){
    var same = sameFn(sym), st = (window.M && M.updated) || "";
    Promise.all([J("archive/x/push_log.json"), J(RAWM + "market/kick.json"), J("archive/x/market_x.json"), J("archive/x/perf_cup.json"), J("archive/x/perf_gap.json"), J("archive/x/perf_accum.json"),
                 (window.V && V.price ? V.price(/\.K[SQ]$/.test(sym) ? sym.slice(0, 6) : sym) : Promise.resolve(null)).catch(function(){ return null; })]).then(function(r){
      var PL = r[0] || [], K = r[1] || {}, MX = (r[2] || {}).chips || {}, PF = [[r[3], "☕ 컵"], [r[4], "📈 갭"], [r[5], "🤫 매집"]], q = r[6], now = q && q[1];
      var ev = [];   // {d, t(시각), ic, who, txt, px, dir(+1 = 오르면 맞음), tab}
      // 📣 알림
      (Array.isArray(PL) ? PL : []).forEach(function(p){ var hit = (p.syms || []).filter(function(s){ return same(s[0]); })[0]; if (!hit) return;
        ev.push({d: (p.t || "").slice(0, 10), t: (p.t || "").slice(11, 16), ic: "🔔", who: "알림", txt: (p.title || "").replace(/^(🔴|🟡|⚪)\s*/, ""), px: hit[1] != null ? +hit[1] : null, dir: /갭|컵|고래|매집|돌파|매수/.test(p.title || "") && !/팔기|손절|주의|하락/.test(p.title || "") ? 1 : 0, tab: p.tab}); });
      // ⚡ 킥 장부
      var kk = function(x, kind){ if (!x || !same(x.code || x.sym)) return;
        ev.push({d: x.d0, ic: "⚡", who: "킥 진입", txt: (x.src_name || x.kind || x.src || "") + (x.tags ? " " + x.tags : ""), px: x.entry, dir: 1, done: kind === "closed" ? x.r : null, tab: "port~pokick"});
        if (kind === "closed") ev.push({d: x.d1, ic: x.r >= 0 ? "🟢" : "🔴", who: "킥 청산", txt: (x.why || "") + " · " + sg(x.r) + (x.exit ? " · " + fmtPx(x.exit, sym) : ""), px: null, dir: 0, tab: "port~pokick"});
        else ev.push({d: K.asof || K.at, ic: "💼", who: "킥 보유 중", txt: (x.days != null ? x.days + "일째 · " : "") + "지금 " + sg(x.r) + (x.stop ? " · 손절선 " + fmtPx(x.stop, sym) : ""), px: null, dir: 0, tab: "port~pokick", live: true}); };
      (K.open || []).forEach(function(x){ kk(x, "open"); }); (K.hold || []).forEach(function(x){ kk(x, "hold"); });
      var seen = {}; (K.closed || []).concat(K.closed_all || []).forEach(function(x){ var id = (x.code || x.sym) + "|" + x.d0; if (seen[id]) return; seen[id] = 1; kk(x, "closed"); });
      // 🪂 그림자 장부
      Object.keys(K.shadow_log || {}).forEach(function(id){ var s = K.shadow_log[id]; if (!s || !same(s.code)) return;
        ev.push({d: s.d, ic: "🪂", who: "그림자 " + (s.src || ""), txt: (s.done ? "끝 " : "진행 중 ") + sg(s.r), px: null, dir: 1, sh: s.r, tab: ""}); });
      // 🌐 시황에 이름
      Object.keys(MX).sort().forEach(function(dk){ var row = (MX[dk] || []).filter(function(c){ return same(c[0]); })[0]; if (!row) return;
        ev.push({d: dk.slice(0, 10), ic: "🌐", who: "시황에 이름", txt: row[2] > 1 ? row[2] + "번 언급" : "언급", px: null, dir: 0, tab: "market"}); });
      // ☕📈🤫 신호 성적
      PF.forEach(function(z){ var P = z[0]; if (!P || !P.signals) return; P.signals.filter(function(s){ return same(s.code); }).forEach(function(s){
        if (ev.some(function(x){ return x.d === s.d0 && x.ic === "⚡"; })) return;
        ev.push({d: s.d0, ic: z[1].slice(0, 2).trim(), who: z[1].slice(2).trim() + " 신호", txt: (s.days != null ? s.days + "일 지남 · " : "") + "그 뒤 " + sg(s.now), px: s.p0 || null, dir: 1, sh: s.now, tab: ""}); }); });
      ev = ev.filter(function(x){ return x.d; }).sort(function(a, b){ return (a.d + (a.t || "")) < (b.d + (b.t || "")) ? -1 : 1; });
      if (!ev.length){ box.innerHTML = ""; return; }
      // 채점: 값이 있고 방향(오름 기대)이 있는 점만 → 지금(또는 청산값)과 비교
      var calls = ev.filter(function(x){ return x.dir === 1 && (x.px != null && now != null || x.sh != null || x.done != null); });
      var res = calls.map(function(x){ return x.done != null ? x.done : x.sh != null ? x.sh : (now / x.px - 1) * 100; });
      var closedBy = {}; ev.forEach(function(x){ if (x.ic === "🔴" || x.ic === "🟢") closedBy[x.d] = x; });
      var li = ev.map(function(x){
        var chip = "";
        if (x.done != null) chip = '<em class="' + cl(x.done) + '">' + fmtPx(x.px, sym) + ' → 청산 ' + sg(x.done) + '</em>';
        else if (x.px != null && now != null && !x.live){ var rr = (now / x.px - 1) * 100; chip = '<em class="' + cl(rr) + '">' + fmtPx(x.px, sym) + ' → 지금 ' + sg(rr) + '</em>'; }
        else if (x.px != null) chip = '<em>' + fmtPx(x.px, sym) + '</em>';
        return '<li><span class="a2d">' + e(md(x.d)) + (x.t ? '<small>' + e(x.t) + '</small>' : '') + '</span><span class="a2i">' + x.ic + '</span><span class="a2b">' + (x.tab ? '<a href="javascript:go(\'' + e(x.tab) + '\')">' : '<span>') + '<b>' + e(x.who) + '</b> ' + e(x.txt) + (x.tab ? '</a>' : '</span>') + chip + '</span></li>'; });
      var fold = li.length > 8;
      var h = '<section class="card tlc"><h3>🧵 이 종목, 앱 성적표 <span class="mut">앱이 한 말 ' + ev.length + '번</span></h3><ul class="a2tl' + (fold ? ' fold' : '') + '">' + li.join("") + '</ul>' +
        (fold ? '<button class="btn a2more">앞의 ' + (li.length - 8) + '개 더 보기 ▾</button>' : '');
      if (res.length){ var win = res.filter(function(v){ return v > 0; }).length, avg = res.reduce(function(a, b){ return a + b; }, 0) / res.length;
        h += '<div class="a2s">오르는 쪽으로 말한 ' + res.length + '번 중 그 뒤 오른 것 <b>' + win + '번</b> · 평균 <b class="' + cl(avg) + '">' + sg(avg) + '</b>' + (now != null ? ' <span class="mut">(청산한 건 청산값, 나머진 지금 값 기준)</span>' : '') + '</div>'; }
      h += '<p class="note" style="margin:6px 0 0">알림·킥 장부·그림자 장부·신호 성적표·시황 언급을 종목 하나로 모은 것 — 과거 기록이라 미래 보장이 아니고, 사라는 뜻도 아니에요.</p></section>';
      box.innerHTML = h;
      var mb = box.querySelector(".a2more"); if (mb) mb.onclick = function(){ box.querySelector(".a2tl").classList.remove("fold"); mb.remove(); };
    }).catch(function(){ box.innerHTML = ""; });
  }

  var css = document.createElement("style");
  css.textContent = ".tlc h3 .mut{font-weight:400;font-size:12.5px}.a2tl{list-style:none;margin:6px 0 0;padding:0;position:relative}.a2tl:before{content:'';position:absolute;left:66px;top:6px;bottom:6px;width:2px;background:color-mix(in srgb,var(--sub) 30%,transparent)}" +
    ".a2tl li{display:flex;align-items:flex-start;gap:8px;padding:5px 0;margin:0;font-size:12.5px;line-height:1.45;background:none}.a2tl li:before,.a2tl li:after{display:none;content:none}.a2tl.fold li{display:none}.a2tl.fold li:nth-last-child(-n+8){display:flex}" +
    ".a2d{width:48px;flex:none;text-align:right;color:var(--sub);font-variant-numeric:tabular-nums}.a2d small{display:block;font-size:12.5px;color:var(--dim)}.a2i{width:22px;height:22px;flex:none;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:12.5px;position:relative;z-index:1;border:1px solid color-mix(in srgb,var(--sub) 35%,transparent)}" +
    ".a2b{flex:1;min-width:0}.a2b a{color:inherit;text-decoration:none}.a2b b{color:var(--text)}.a2b em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);font-variant-numeric:tabular-nums}.a2b em.up{color:var(--up)}.a2b em.dn{color:var(--dn)}" +
    ".a2more{margin:4px 0 0 66px;font-size:12.5px}.a2s{margin-top:8px;padding:7px 9px;border-radius:9px;background:color-mix(in srgb,var(--panel) 60%,var(--bg));font-size:12.5px;color:var(--sub)}.a2s b{color:var(--text)}.a2s b.up{color:var(--up)}.a2s b.dn{color:var(--dn)}";
  document.head.appendChild(css);

  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){
    return OLD(sym).then(function(h){
      setTimeout(function(){ var el = $("opsig"); if (!el) return; var bx = document.createElement("div"); el.appendChild(bx); build(sym, bx); }, 60);
      return h;
    });
  };
})();
;
__bk(48);
/* ======== port_design.js ======== */
/* 🎛 포트 설계기 — 10/21 A10/21-1 (사용자 「다 좋다 다 진행해」)
   💼 포트 탭: S&P·나스닥·금 막대를 손가락으로 밀면(나머지는 현금·단기채) 2008년부터 매일 굴린 셈으로
   연 수익·최대 낙폭·최악의 해·「1,000만원 → ○○만원」 곡선이 휴대폰에서 바로 다시 계산됨.
   토글 두 개 = 💼 기본 규칙 그대로(🛡 S&P 200일선 아래면 주식 줄이기 · 📉 20일 변동성 맞춤 목표 15%) → 끄고 켤 때 보험값이 숫자 두 개로.
   종목 하나를 0~20% 섞어 볼 수 있음(일봉 있는 18개 · 종목 화면 「💼 이 종목 5% 넣어 보면」 단추가 여기로).
   자료: archive/x/port_px/(SPY·QQQ·GLD·BIL 배당 포함 수정종가, port_px.py 가 7일마다) · 종목은 archive/x/els_px(종가)
   검사: port_px/check.json(파이썬이 같은 자료·같은 규칙으로 낸 값)과 이 엔진 값이 같아야 「✓ 파이썬과 같음」.
   원칙: 과거 계산 · 미래 보장 아님 · 사라는 말 없음 · 위 곡선은 세전 — 11/05 🧾 세금 칸(달러 직투 양도세 vs 국내 ETF 배당소득세·금융종합과세)에서 뗀 값을 따로 보임. */
(function(){
  var ETF = ["SPY", "QQQ", "GLD", "BIL"], PX = {}, IDX = null, IDXW = null, EIDX = null, CHK = null, CHKOK = null;
  // 11/03 사용자 「거치식과 적립식을 구분 · 적립식이면 한 달에 얼마·며칠에 넣는지로 계산 · 거치식 누르면 적립식 칸은 닫히게」
  //   mode: lump(거치식) | dca(적립식) · dm 매달 넣는 돈(만원) · dd 매월 며칠(1~28, 31 = 말일) · d0 처음에 한 번(만원, 선택)
  var ST = {w: {SPY: 47.5, QQQ: 47.5, GLD: 5}, reg: 1, vol: 1, st: "", stw: 5, from: "", prev: null, last: null, ms: 0, pn: null, mode: "lump", dm: 100, dd: 1, d0: 0,
    tx: "gen", brg: 26.4, brb: 44, of: 2000, txo: 1, bd: {}, sx: []};   // ➕ 11/18 sx: 섞은 종목·ETF [{s 야후 코드, n 이름, m 시장, e ETF?, w %}]   // 🏦 11/17 bd: 섞은 채권 {IEF|TLT|BRBOND: 비중 %}   // 🧾 11/05 세금: tx 탭(gen 일반 | big 금융소득종합과세 대상자) · brg/brb 종합소득 세율(지방세 포함 %) · of 다른 금융소득(만원/년) · txo 펼침
  var KEEP = ["w", "reg", "vol", "st", "stw", "from", "mode", "dm", "dd", "d0", "tx", "brg", "brb", "of", "txo", "bd", "sx"];
  try { var sv = JSON.parse(localStorage.getItem("pdz") || "null"); if (sv && sv.w) KEEP.forEach(function(k){ if (sv[k] !== undefined) ST[k] = sv[k]; }); } catch(x) {}
  /* ➕ 11/18 종목·ETF 섞기 (사용자 「포트 설계기에 개별종목이나 etf도 넣는 칸을 만들자」)
     앱 검색 목록(약 2.8만 종목 + ETF)에서 아무거나 · 최대 5개 · 각 5~50% · 종목 + 채권 합 80%까지 · 다른 칸에서 비율대로 떼어 옴 · 방어 규칙 밖
     자료: archive/x/port_px/pool/ (port_px.py — 배당 포함 수정종가 ÷ 환율 = 달러 값) · 없는 종목은 ntfy 로 요청 → 15분마다(pdz_req.yml) 받아 올림
     상장이 늦은 종목: 200일선 준비는 S&P 로 하고, 계산 시작만 그 종목 첫날로 미룸(전엔 같이 거래된 날만 남겨 200거래일이 더 깎였음) */
  var SXMAX = 5, REQT = "chkchp-ch-pdzreq-k4r8", POOL = null, SXC = ["#d55181", "#9b6bd6", "#e07b39", "#4fb0c6", "#b8a13a"];
  var OLDSYM = {"삼성전자": "005930.KS", "SK하이닉스": "000660.KS", "현대차": "005380.KS", "한국전력": "015760.KS", "엔비디아": "NVDA", "애플": "AAPL", "브로드컴": "AVGO", "AMD": "AMD", "마이크론": "MU", "인텔": "INTC", "테슬라": "TSLA", "팔란티어": "PLTR", "KOSPI200": "069500.KS", "NIKKEI225": "^N225", "EUROSTOXX50": "^STOXX50E", "HSCEI": "^HSCE"};
  if (!Array.isArray(ST.sx)) ST.sx = [];
  if (ST.st){ if (OLDSYM[ST.st] && !ST.sx.some(function(x){ return x.s === OLDSYM[ST.st]; })) ST.sx.push({s: OLDSYM[ST.st], n: {"KOSPI200": "KODEX 200", "NIKKEI225": "니케이225 지수", "EUROSTOXX50": "유로스탁스50 지수", "HSCEI": "항셍중국 지수"}[ST.st] || ST.st, m: "", w: ST.stw || 5}); ST.st = ""; }
  var QUICK = [["005930.KS", "삼성전자"], ["000660.KS", "SK하이닉스"], ["NVDA", "엔비디아"], ["AAPL", "애플"], ["TSLA", "테슬라"], ["360750.KS", "TIGER 미국S&P500", 1], ["069500.KS", "KODEX 200", 1], ["SCHD", "미국 배당 SCHD", 1], ["JEPI", "JEPI 커버드콜", 1], ["SOXX", "반도체 SOXX", 1], ["IBIT", "비트코인 IBIT", 1], ["^N225", "니케이225", 1]];
  function sxCol(i){ return SXC[i % SXC.length]; }
  function sxKey(s){ return "X:" + s; }
  function sxReady(x){ return !!(POOL && POOL.assets[x.s]); }
  function sxOn(){ return (ST.sx || []).filter(sxReady); }
  function sxReq(x){   // 자료가 없으면 요청(같은 종목은 30분에 한 번)
    var k = "pdzreq:" + x.s; try { var t = +localStorage.getItem(k) || 0; if (Date.now() - t < 1800e3) return; localStorage.setItem(k, Date.now()); } catch(z) {}
    try { fetch("https://ntfy.sh/" + REQT, {method: "POST", body: x.s + "|" + String(x.n || "").replace(/\|/g, " ").slice(0, 40), keepalive: true}).catch(function(){}); } catch(z) {}
  }
  function keep(){ try { var o = {}; KEEP.forEach(function(k){ o[k] = ST[k]; }); localStorage.setItem("pdz", JSON.stringify(o)); } catch(x) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  var STK = ["삼성전자", "SK하이닉스", "현대차", "한국전력", "엔비디아", "애플", "브로드컴", "AMD", "마이크론", "인텔", "테슬라", "팔란티어", "KOSPI200", "NIKKEI225", "EUROSTOXX50", "HSCEI"];
  var LAB = {"KOSPI200": "코스피200", "NIKKEI225": "니케이225", "EUROSTOXX50": "유로스탁스50", "HSCEI": "항셍중국"};
  function lab(n){ return LAB[n] || n; }
  var COLS = {SPY: "#3987e5", QQQ: "#d95926", GLD: "#c9a227", X: "#d55181", BIL: "#8a94a8", IEF: "#2bb3a3", TLT: "#1c7c8c", BRBOND: "#3fb950"};
  /* 🏦 11/17 채권 섞기 (사용자 「포트 설계기에서 종목 추가뿐 아니라 미국채 브라질국채도 추가할수 있게 업그레이드 해」)
     종목처럼 「고른 비중만큼 다른 칸에서 비율대로 떼어 옴 · 방어 규칙 밖(그대로 둠)」 · 여러 개 함께 가능 · 종목 + 채권 합 최대 80%
     자료: port_px.py → IEF·TLT(이자 포함 달러 값) · BRBOND(헤알 국채 ÷ 달러/헤알 = 달러 값 · 앞쪽은 Selic 근사 — index.json src·splice)
     세금: 미국채는 SPY 처럼(분배금 = 이자) · 브라질국채는 한-브라질 조세협약으로 이자·매매차익·환차익 비과세 → 세금에서 비중만큼 뺌(근사) */
  var BDS = [["IEF", "🇺🇸 미국채 10년", "IEF · 7~10년 국채"], ["TLT", "🇺🇸 미국채 30년", "TLT · 20년 넘는 국채"], ["BRBOND", "🇧🇷 브라질국채", "헤알 국채 · 달러로 환산"]];
  var BDN = {IEF: "미국채 10년", TLT: "미국채 30년", BRBOND: "브라질국채"};
  function bdOn(){ var o = {}; BDS.forEach(function(b){ var v = +(ST.bd || {})[b[0]] || 0; if (v > 0 && IDX && IDX.assets[b[0]]) o[b[0]] = v; }); return o; }
  function extW(){ var o = bdOn(), t = 0; (ST.sx || []).forEach(function(x){ t += +x.w || 0; }); for (var k in o) t += o[k]; return t; }   // 종목(받는 중 포함) + 채권 % 합   // 종목 + 채권 % 합

  /* ── 자료 ── */
  function dec(j){ var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, d = new Int32Array(j.dd.length), c = new Float64Array(j.c.length);
    for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d[i] = t; c[i] = j.c[i]; } return {d: d, c: c}; }
  function idx(){
    if (!IDXW) IDXW = Promise.all([
      getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/els_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/port_px/check.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      poolLoad()
    ]).then(function(r){ IDX = r[0] && r[0].assets ? r[0] : {assets: {}}; EIDX = r[1] && r[1].assets ? r[1] : {assets: {}}; CHK = r[2]; return IDX; });
    return IDXW;
  }
  var POOLT = 0;
  function poolLoad(){   // 5분마다 새로(요청한 종목이 들어왔나)
    if (POOL && Date.now() - POOLT < 300e3) return Promise.resolve(POOL);
    return getJSON("archive/x/port_px/pool/index.json?" + Math.floor(Date.now() / 300e3), {ttl: 300e3}).then(function(j){ POOL = j && j.assets ? j : {assets: {}, bad: {}}; POOL.bad = POOL.bad || {}; POOLT = Date.now(); return POOL; })
      .catch(function(){ if (!POOL) POOL = {assets: {}, bad: {}}; return POOL; });
  }
  function px(k){
    if (/^X:/.test(k)){ var s0 = k.slice(2), pa = POOL && POOL.assets[s0]; if (!pa) return Promise.resolve(null);
      if (!PX[k]) PX[k] = getJSON("archive/x/port_px/pool/" + encodeURIComponent(pa.f) + "?" + String(pa.at || "").replace(/\D/g, ""), {ttl: 864e5}).then(function(j){ return j && j.dd ? dec(j) : null; }).catch(function(){ delete PX[k]; return null; });
      return PX[k]; }
    if (PX[k]) return PX[k];
    var a = IDX && IDX.assets[k], b = !a && EIDX && EIDX.assets[k];
    if (!a && !b) return Promise.resolve(null);
    var u = a ? "archive/x/port_px/" + a.f + "?" + String(a.at || IDX.updated || "").replace(/\D/g, "") : "archive/x/els_px/" + b.f + "?" + String(EIDX.updated || "").replace(/\D/g, "");
    PX[k] = getJSON(u, {ttl: 864e5}).then(function(j){ return j && j.dd ? dec(j) : null; }).catch(function(){ return null; });
    return PX[k];
  }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }

  /* ── 엔진 (port_px.py engine 과 같은 규칙 · 첫날은 BIL 상장 뒤 201거래일) ── */
  function align(ser){   // 모든 자산이 있는 날만
    var ks = Object.keys(ser), base = ser[ks[0]], ptr = {}, D = [], C = {};
    ks.forEach(function(k){ ptr[k] = 0; C[k] = []; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true;
      for (var j = 1; j < ks.length; j++){ var s = ser[ks[j]]; while (ptr[ks[j]] < s.d.length && s.d[ptr[ks[j]]] < t) ptr[ks[j]]++; if (ptr[ks[j]] >= s.d.length || s.d[ptr[ks[j]]] !== t){ ok = false; break; } }
      if (!ok) continue;
      D.push(t); C[ks[0]].push(base.c[i]); for (var j2 = 1; j2 < ks.length; j2++) C[ks[j2]].push(ser[ks[j2]].c[ptr[ks[j2]]]);
    }
    return {D: D, C: C};
  }
  var ALN = {};
  function engine(A, w, o){   // w: {SPY,QQQ,GLD,BIL,X?} 합 1 · o: {reg, vol, start}
    o = o || {}; var D = A.D, n = D.length, K = Object.keys(w), C = A.C, tgt = 15, floor = 0.30, band = 0.05, cost = 0.001;
    var R = {}; K.concat(["SPY"]).forEach(function(k){ if (R[k]) return; var c = C[k], r = new Float64Array(n); for (var i = 1; i < n; i++) r[i] = c[i] / c[i - 1] - 1; R[k] = r; });
    var spy = C.SPY, reg = new Uint8Array(n), s = 0, cur = 0, run = 0;
    for (var i = 0; i < n; i++){ s += spy[i]; if (i >= 200) s -= spy[i - 200];
      var v = i >= 199 && spy[i] > s / 200 ? 1 : 0;
      if (v !== cur){ run++; if (run >= 3){ cur = v; run = 0; } } else run = 0;
      reg[i] = cur; }
    var eq = w.SPY + w.QQQ, ws = eq > 0 ? w.SPY / eq : 0.5, wq = eq > 0 ? w.QQQ / eq : 0.5, sc = new Float64Array(n);
    for (var i2 = 0; i2 < n; i2++){
      if (i2 < 20){ sc[i2] = 1; continue; }
      var m = 0, q = 0, a;
      for (var j = i2 - 19; j <= i2; j++) m += ws * R.SPY[j] + wq * R.QQQ[j];
      m /= 20;
      for (var j3 = i2 - 19; j3 <= i2; j3++){ a = ws * R.SPY[j3] + wq * R.QQQ[j3] - m; q += a * a; }
      var sd = Math.sqrt(q / 19) * Math.sqrt(252) * 100;
      sc[i2] = sd > 0 ? Math.min(1, Math.max(floor, tgt / sd)) : 1;
    }
    var f = 0.63 / 0.95, EXK = Object.keys(w).filter(function(k){ return ["SPY", "QQQ", "GLD", "BIL"].indexOf(k) < 0; }), wx = EXK.reduce(function(a, k){ return a + (w[k] || 0); }, 0);
    function tg(i){
      var on = o.reg ? reg[i] : 1, b = {SPY: w.SPY, QQQ: w.QQQ, GLD: w.GLD, BIL: w.BIL};
      if (!on){ var fr = (w.SPY + w.QQQ) * (1 - f); b = {SPY: w.SPY * f, QQQ: w.QQQ * f, GLD: w.GLD + fr * 0.1875, BIL: w.BIL + fr * 0.8125}; }
      var k = o.vol ? sc[i] : 1, ee = (b.SPY + b.QQQ) * k, out = {SPY: b.SPY * k, QQQ: b.QQQ * k, GLD: b.GLD};
      EXK.forEach(function(k){ out[k] = w[k]; });
      out.BIL = 1 - ee - b.GLD - wx; return out;
    }
    var st = o.start ? Date.parse(o.start + "T00:00:00Z") / 864e5 : 0, i0 = 0;
    while (i0 < n && D[i0] < st) i0++;
    i0 = Math.max(i0, 201); if (i0 >= n - 5) return null;   // 10/21 사용자 「날짜를 직접 넣어서」 — 짧은 기간도
    var W = null, lastEq = 0, nav = 1, NV = new Float64Array(n - i0), sp = new Float64Array(n - i0), spv = 1, turn = 0, expo = 0, WY = {};   // WY: 해마다 자산별 평균 비중(🧾 세금 — 분배금 계산용)
    for (var t = i0; t < n; t++){
      if (!W){ W = tg(t - 1); lastEq = W.SPY + W.QQQ; }
      var r = 0, sum = 0, nw = {};
      for (var k in W){ r += W[k] * R[k][t]; nw[k] = W[k] * (1 + R[k][t]); sum += nw[k]; }
      for (var k2 in nw) W[k2] = nw[k2] / sum;
      var T = tg(t - 1), newm = day2s(D[t - 1]).slice(5, 7) !== day2s(D[t]).slice(5, 7);
      if (newm || (o.reg && reg[t - 1] !== reg[t - 2]) || Math.abs(T.SPY + T.QQQ - lastEq) > band){
        var tv = 0; for (var k3 in T) tv += Math.abs(T[k3] - (W[k3] || 0)); tv /= 2;
        W = T; lastEq = T.SPY + T.QQQ; r -= tv * cost; turn += tv;
      }
      nav *= 1 + r; NV[t - i0] = nav; spv *= 1 + R.SPY[t]; sp[t - i0] = spv; expo += W.SPY + W.QQQ;
      var yk = String(new Date(D[t] * 864e5).getUTCFullYear()), wy = WY[yk] || (WY[yk] = {n: 0});
      wy.n++; for (var k4 in W) wy[k4] = (wy[k4] || 0) + W[k4];
    }
    var ycnt = 0, yrs = (D[n - 1] - D[i0]) / 365.25, pk = 0, mdd = 0, mddAt = 0, spk = 0, smdd = 0, Y = {}, py = null, yv = 1, ysp = 1;
    for (var u = 0; u < NV.length; u++){
      if (NV[u] > pk) pk = NV[u]; var dd = NV[u] / pk - 1; if (dd < mdd){ mdd = dd; mddAt = u; }
      if (sp[u] > spk) spk = sp[u]; var sd2 = sp[u] / spk - 1; if (sd2 < smdd) smdd = sd2;
      var y = day2s(D[i0 + u]).slice(0, 4);
      if (y !== py){ if (py) Y[py] = [(NV[u - 1] / yv - 1) * 100, (sp[u - 1] / ysp - 1) * 100, ycnt]; yv = u ? NV[u - 1] : 1; ysp = u ? sp[u - 1] : 1; py = y; ycnt = 0; }
      ycnt++;
    }
    if (py) Y[py] = [(NV[NV.length - 1] / yv - 1) * 100, (sp[sp.length - 1] / ysp - 1) * 100, ycnt];
    var full = Object.keys(Y).filter(function(y){ return Y[y][2] >= 120; });
    var tot = (nav - 1) * 100, sptot = (spv - 1) * 100;   // 반년 넘게 굴린 해만 (2008 은 3월부터라 넣음)
    var worst = full.sort(function(a, b){ return Y[a][0] - Y[b][0]; })[0];
    return {from: day2s(D[i0]), to: day2s(D[n - 1]), yrs: yrs, tot: tot, sptot: sptot, cagr: (Math.pow(nav, 1 / yrs) - 1) * 100, mdd: mdd * 100, mddAt: day2s(D[i0 + mddAt]), end: nav,
      sp_cagr: (Math.pow(spv, 1 / yrs) - 1) * 100, sp_mdd: smdd * 100, sp_end: spv, worst: worst, Y: Y, nv: NV, sp: sp, D: D, i0: i0, expo: expo / NV.length * 100, turn: turn / yrs * 100, WY: WY};
  }
  /* 💵 적립식 — 설계한 포트(매일 굴린 값 nv)와 S&P(sp)를 「매월 dd일(그날이 쉬면 다음 거래일 · 그달에 그날이 없으면 그달 마지막 거래일) 종가」에 dm 만원씩 산 셈 */
  function dcaCalc(r){
    var N = r.nv.length, m = (ST.dm || 0) * 1e4, z = (ST.d0 || 0) * 1e4, dd = ST.dd || 1;
    var un = 0, us = 0, inv = 0, cnt = 0, V = new Float64Array(N), S = new Float64Array(N), I = new Float64Array(N), flows = [], sflows = [];
    var buy = function(u, a){ if (!(a > 0)) return; un += a / r.nv[u]; us += a / r.sp[u]; inv += a; flows.push([r.D[r.i0 + u], -a]); };
    if (z > 0) buy(0, z);
    var curM = null, did = false, lastU = -1;
    for (var u = 0; u < N; u++){
      var ds = day2s(r.D[r.i0 + u]), mo = ds.slice(0, 7), dom = +ds.slice(8, 10);
      if (mo !== curM){
        if (curM && !did && lastU >= 0 && m > 0){ buy(lastU, m); cnt++; for (var b = lastU; b < u; b++){ V[b] = un * r.nv[b]; S[b] = us * r.sp[b]; I[b] = inv; } }   // 그달에 그날이 없었으면 마지막 거래일에
        curM = mo; did = false;
      }
      if (!did && dom >= dd && m > 0){ buy(u, m); cnt++; did = true; }
      lastU = u; V[u] = un * r.nv[u]; S[u] = us * r.sp[u]; I[u] = inv;
    }
    if (!inv) return null;
    var endV = un * r.nv[N - 1], endS = us * r.sp[N - 1], tEnd = r.D[r.i0 + N - 1];
    // 돈을 넣은 때를 감안한 연 수익(내부수익률) — 반으로 나눠 찾기
    var irr = function(endVal){ var f = function(y){ var s = endVal; flows.forEach(function(x){ s += x[1] * Math.pow(1 + y, (tEnd - x[0]) / 365.25); }); return s; };
      var lo = -0.95, hi = 3; if (f(lo) * f(hi) > 0) return null; for (var k = 0; k < 80; k++){ var md = (lo + hi) / 2; if (f(lo) * f(md) <= 0) hi = md; else lo = md; } return (lo + hi) / 2 * 100; };
    var yrs = (tEnd - flows[0][0]) / 365.25;
    return {inv: inv, cnt: cnt, end: endV, sEnd: endS, ret: (endV / inv - 1) * 100, sRet: (endS / inv - 1) * 100, irr: yrs >= 1 ? irr(endV) : null, sIrr: yrs >= 1 ? irr(endS) : null, V: V, S: S, I: I, first: day2s(flows[0][0])};
  }
  function dcaCurve(r, c){
    var W = 340, H = 140, P = 4, N = c.V.length, step = Math.max(1, Math.floor(N / 170)), hi = 0;
    for (var i = 0; i < N; i++) hi = Math.max(hi, c.V[i], c.S[i], c.I[i]);
    var X = function(i){ return P + (W - 2 * P - 40) * i / (N - 1); }, Yf = function(v){ return H - 16 - (H - 26) * v / (hi || 1); };
    var path = function(arr){ var s2 = ""; for (var i = 0; i < N; i += step) s2 += (s2 ? "L" : "M") + X(i).toFixed(1) + "," + Yf(arr[i]).toFixed(1); return s2 + "L" + X(N - 1).toFixed(1) + "," + Yf(arr[N - 1]).toFixed(1); };
    var g = ""; [0.25, 0.5, 0.75, 1].forEach(function(f){ var v = hi * f, y = Yf(v).toFixed(1); g += '<line x1="' + P + '" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" class="pz-gl"/><text x="' + (W - 38) + '" y="' + (+y + 3) + '" class="pz-gt">' + won(v) + '</text>'; });
    var yt = "", lastY = null, ystep = r.yrs > 12 ? 4 : r.yrs > 6 ? 2 : 1;
    for (var j = 0; j < N; j++){ var yy = day2s(r.D[r.i0 + j]).slice(0, 4); if (r.yrs >= 2 && yy !== lastY && +yy % ystep === 0 && j > 20) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + yy + '</text>'; lastY = yy; }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pz-cv" role="img" aria-label="적립식 넣은 돈과 평가금">' + g + yt +
      '<path d="' + path(c.I) + '" class="pz-li"/><path d="' + path(c.S) + '" class="pz-ls"/><path d="' + path(c.V) + '" class="pz-lm"/></svg>' +
      '<div class="pz-key"><span><i class="m"></i>설계한 포트 평가금</span><span><i class="s"></i>S&P500에 같은 날 넣었다면</span><span><i class="i"></i>넣은 돈 합계</span></div>';
  }
  function dcaH(r){
    var c = dcaCalc(r);
    if (!c) return '<div class="empty">매달 넣을 돈을 적어 주세요.</div>';
    var pf = c.end - c.inv, sp = c.sEnd - c.inv, ddL = ST.dd >= 31 ? "말일" : ST.dd + "일";
    return '<div class="pz-dca"><div class="pz-dcah">💵 적립식 · 매달 ' + won(ST.dm * 1e4) + '원 · 매월 ' + ddL + (ST.d0 > 0 ? ' · 처음 ' + won(ST.d0 * 1e4) + '원' : '') + ' <span class="mut">' + c.first.replace(/-/g, ".") + '부터 ' + c.cnt + '번 넣음</span></div>' +
      '<div class="pz-big"><div><small>넣은 돈</small><b>' + won(c.inv) + '</b><em>' + c.cnt + '번' + (ST.d0 > 0 ? ' + 처음 한 번' : '') + '</em></div>' +
        '<div><small>지금 평가금</small><b class="' + cl(pf) + '">' + won(c.end) + '</b><em>' + (pf >= 0 ? '+' : '−') + won(Math.abs(pf)) + '원</em></div>' +
        '<div><small>수익률</small><b class="' + cl(c.ret) + '">' + sg(c.ret, 1) + '%</b><em>' + (c.irr != null ? '연 ' + sg(c.irr, 1) + '%' : '1년 안 됨') + '</em></div></div>' +
      '<div class="pz-won">📈 S&P500에 같은 날 같은 돈을 넣었다면 <b>' + won(c.sEnd) + '원</b> <small>수익률 ' + sg(c.sRet, 1) + '%' + (c.sIrr != null ? ' · 연 ' + sg(c.sIrr, 1) + '%' : '') + ' · 설계한 포트가 ' + (c.end >= c.sEnd ? '앞섬 +' : '뒤짐 −') + won(Math.abs(c.end - c.sEnd)) + '원</small></div>' +
      dcaCurve(r, c) +
      '<p class="note" style="margin:2px 0 6px">연 % = 돈을 넣은 때를 감안한 연평균 수익(내부수익률) · 매월 그날 종가에 삼(쉬는 날이면 다음 거래일, 그달에 그날이 없으면 마지막 거래일) </p></div>';
  }

  /* 🧾 11/05 세금 뗀 실제 수익 (사용자 「원화로 달러 사서 미국을 사면 세금이 나오잖아 — 양도세가 얼마라서 실제 수익률이 얼마다 ·
     금융종합소득세 과세 대상자 탭을 만들어서 국내에서 ETF로 샀을 때 세금 얼마고 실제 수익률이 얼마다」)
     같은 포트를 ① 💵 원화 → 달러로 바꿔 미국 ETF 직접(SPY·QQQ·GLD·BIL) ② 🇰🇷 국내 상장 같은 지수 ETF(환노출)로 산 셈.
     · 💵 직투: 미국 배당 15% 원천징수(해마다) · 팔 때 (원화 기준 차익 − 연 250만원) × 22% 분리과세 · 환전 0.1%씩(우대 가정)
     · 🇰🇷 국내 ETF: 분배금·매매차익 = 배당소득 15.4% · 그해 금융소득(이자·배당)이 2천만원 넘는 몫은 종합과세(고른 세율, 15.4%보다 낮으면 15.4%)
     · 직투 배당도 금융소득 → 대상자면 2천만 넘는 몫은 고른 세율(외국납부 15% 공제 → 최소 15%)
     · 원화 값 = 포트 값(달러) × 그날 원/달러(USDKRW.json) · 분배금 = 해마다 자산별 평균 비중 × 그해 분배금 수익률(div.json)
     근사: 끝에 한 번에 판 셈(달마다 맞추며 판 차익 과세는 미룬 셈) · 구간 세율 한 칸으로 · 보수·과표기준가 차이·건보료 빼지 않음 */
  var TXD = null, TXW = null;
  var BR = [[6.6, "1,400만↓"], [16.5, "5,000만↓"], [26.4, "8,800만↓"], [38.5, "1.5억↓"], [41.8, "3억↓"], [44, "5억↓"], [46.2, "10억↓"], [49.5, "10억↑"]];
  var DYF = {SPY: 1.8, QQQ: 0.7, GLD: 0, BIL: 1.5, X: 0, BRBOND: 0};   // 미국채(IEF·TLT)는 div.json 값만 씀 — 없으면 이자를 매매차익으로 셈(끝에 한 번)   // div.json 이 아직 없을 때만
  function txLoad(){
    if (!TXW) TXW = idx().then(function(){
      var dv = IDX.assets.DIV;
      return Promise.all([px("USDKRW"), dv ? getJSON("archive/x/port_px/div.json?" + String(dv.at || "").replace(/\D/g, ""), {ttl: 864e5}).catch(function(){ return null; }) : null]);
    }).then(function(x){ TXD = {fx: x[0], div: x[1] && x[1].y ? x[1].y : null}; return TXD; }).catch(function(){ TXD = {fx: null, div: null}; return TXD; });
    return TXW;
  }
  function fxOf(r){
    if (r.fxA) return r.fxA;
    var N = r.nv.length, a = new Float64Array(N), f = TXD && TXD.fx;
    if (!f){ for (var i = 0; i < N; i++) a[i] = 1; r.fxA = a; r.fxNo = 1; return a; }
    for (var u = 0, j = 0; u < N; u++){ var t = r.D[r.i0 + u]; while (j + 1 < f.d.length && f.d[j + 1] <= t) j++; a[u] = f.c[j]; }
    r.fxA = a; return a;
  }
  function dyOf(k, y){ var d = TXD && TXD.div && TXD.div[k]; return d && d[y] != null ? Math.max(0, d[y]) : DYF[k] || 0; }
  function flowsOf(r){   // [u, 원] — 거치식 = 첫날 한 번 · 적립식 = dcaCalc 와 같은 날
    var N = r.nv.length, out = [];
    if (ST.mode !== "dca"){ out.push([0, amt()]); return out; }
    var m = (ST.dm || 0) * 1e4, z = (ST.d0 || 0) * 1e4, dd = ST.dd || 1, curM = null, did = false, lastU = -1;
    if (z > 0) out.push([0, z]);
    for (var u = 0; u < N; u++){
      var ds = day2s(r.D[r.i0 + u]), mo = ds.slice(0, 7), dom = +ds.slice(8, 10);
      if (mo !== curM){ if (curM && !did && lastU >= 0 && m > 0) out.push([lastU, m]); curM = mo; did = false; }
      if (!did && dom >= dd && m > 0){ out.push([u, m]); did = true; }
      lastU = u;
    }
    out.sort(function(a, b){ return a[0] - b[0]; });
    return out;
  }
  function sim(r, kind, fl, br, other){
    var N = r.nv.length, fx = fxOf(r), fxc = kind === "us" ? 0.001 : 0, base = kind === "us" ? 0.15 : 0.154, hi = Math.max(br / 100, base);
    var B = Math.max(0, 2e7 - other), units = 0, up = 0, basis = 0, inv = 0, usdIn = 0, usdU = 0, divTax = 0, divTot = 0, divOver = 0, brem = B, fi = 0, yrOf = function(u){ return new Date(r.D[r.i0 + u] * 864e5).getUTCFullYear(); };
    for (var u = 0; u < N; u++){
      var U = r.nv[u] * fx[u];
      while (fi < fl.length && fl[fi][0] === u){ var a = fl[fi][1]; units += a * (1 - fxc) / U; up += a / U; basis += a; inv += a; usdIn += a / fx[u]; usdU += a / fx[u] / r.nv[u]; fi++; }
      var y = yrOf(u), endY = u === N - 1 || yrOf(u + 1) !== y;
      if (endY){
        var w = r.WY && r.WY[y], py = 0;
        if (w && w.n) for (var k in w) if (k !== "n" && k !== "BRBOND") py += w[k] / w.n * dyOf(/^X/.test(k) ? "X" : k, String(y)) / 100;   // 🇧🇷 비과세 → 분배금 세금에서 뺌
        if (w) py *= Math.min(1, w.n / 252);
        brem = B;
        if (py > 0 && units > 0){
          var V = units * U, dv = V * py, inb = Math.min(dv, brem), t = inb * base + (dv - inb) * hi;
          brem -= inb; divOver += dv - inb; units *= 1 - t / V; basis += dv - t; divTax += t; divTot += dv;
        }
      }
    }
    var Ve = units * r.nv[N - 1] * fx[N - 1], pre = up * r.nv[N - 1] * fx[N - 1], o = {kind: kind, inv: inv, pre: pre, divTax: divTax, divTot: divTot, divOver: divOver};
    var brs = 0, brn = 0; for (var yy in (r.WY || {})){ var wy2 = r.WY[yy]; if (wy2 && wy2.n){ brs += (wy2.BRBOND || 0); brn += wy2.n; } }
    var free = brn ? Math.min(1, brs / brn) : 0; o.free = free;   // 🇧🇷 브라질국채 평균 비중 — 그만큼 차익은 비과세(근사)
    if (kind === "us"){
      var Vs = Ve * (1 - fxc); o.fxCost = inv * fxc + Ve * fxc; o.gain = Vs - basis; o.saleTax = Math.max(0, o.gain * (1 - free) - 2.5e6) * 0.22; o.net = Vs - o.saleTax;
    } else {
      o.fxCost = 0; o.gain = Ve - basis; var g = Math.max(0, o.gain) * (1 - free), inb2 = Math.min(g, brem); o.over = g - inb2; o.saleTax = inb2 * 0.154 + o.over * Math.max(br / 100, 0.154); o.net = Ve - o.saleTax;
    }
    o.tax = o.divTax + o.saleTax; o.ret = (o.net / inv - 1) * 100; o.preRet = (pre / inv - 1) * 100;
    o.usdRet = (usdU * r.nv[N - 1] / usdIn - 1) * 100; o.fx0 = inv / usdIn; o.fx1 = fx[N - 1];
    // 연 % — 거치식은 연평균, 적립식은 넣은 때를 감안한 내부수익률
    var tEnd = r.D[r.i0 + N - 1], yrs = (tEnd - r.D[r.i0 + fl[0][0]]) / 365.25;
    if (yrs >= 1){
      if (fl.length === 1) o.ann = (Math.pow(o.net / inv, 1 / yrs) - 1) * 100, o.preAnn = (Math.pow(pre / inv, 1 / yrs) - 1) * 100;
      else { var irr = function(end){ var f = function(q){ var s2 = end; fl.forEach(function(x){ s2 -= x[1] * Math.pow(1 + q, (tEnd - r.D[r.i0 + x[0]]) / 365.25); }); return s2; };
          var lo = -0.95, hi2 = 3; if (f(lo) * f(hi2) > 0) return null; for (var i = 0; i < 80; i++){ var md = (lo + hi2) / 2; if (f(lo) * f(md) <= 0) hi2 = md; else lo = md; } return (lo + hi2) / 2 * 100; };
        o.ann = irr(o.net); o.preAnn = irr(pre); }
    }
    return o;
  }
  function taxH(r){
    if (!TXD){ txLoad().then(function(){ var el = document.getElementById("pzres"); if (el && ST.last && ST.last.R){ el.innerHTML = result(); bindRes(); } }); return '<div class="pz-tx"><div class="loading">🧾 세금 계산 자료 불러오는 중…</div></div>'; }
    var big = ST.tx === "big", br = big ? ST.brb : ST.brg, other = big ? (ST.of || 0) * 1e4 : 0, fl = flowsOf(r);
    if (!fl.length) return "";
    var us = sim(r, "us", fl, br, other), kr = sim(r, "kr", fl, br, other), fx = fxOf(r), best = us.net >= kr.net ? us : kr, gap = Math.abs(us.net - kr.net);
    var nm = {us: "💵 달러로 직접", kr: "🇰🇷 국내 상장 ETF"}, sub = {us: "원화 → 달러 환전 후 SPY·QQQ·GLD·BIL", kr: "같은 지수 환노출 ETF(원화)"};
    var mx = Math.max(us.pre, kr.pre, us.inv) || 1;
    var bar = function(o){ var n = Math.max(0, o.net), t = o.tax, f = o.fxCost || 0;
      return '<div class="pz-txb"><i class="n" style="width:' + (n / mx * 100).toFixed(1) + '%"></i><i class="t" style="width:' + (t / mx * 100).toFixed(1) + '%"></i>' + (f > 0 ? '<i class="f" style="width:' + Math.max(0.6, f / mx * 100).toFixed(1) + '%"></i>' : '') + '<em style="left:' + (o.inv / mx * 100).toFixed(1) + '%"></em></div>'; };
    var card = function(o){
      var lost = o.preRet - o.ret, win = o === best && gap >= 1e4;
      return '<div class="pz-txc' + (win ? ' win' : '') + '"><div class="pz-txn">' + nm[o.kind] + (win ? ' <span class="pz-txw">👑 더 남음</span>' : '') + '<small>' + sub[o.kind] + '</small></div>' +
        '<div class="pz-txv"><small>세금 떼고 손에 쥐는 돈</small><b>' + won(o.net) + '원</b></div>' +
        '<div class="pz-txr"><span>실제 수익률</span><b class="' + cl(o.ret) + '">' + sg(o.ret, 1) + '%</b>' + (o.ann != null ? '<em>연 ' + sg(o.ann, 1) + '%</em>' : '<em>1년 안 됨</em>') + '</div>' +
        bar(o) +
        '<div class="pz-txl"><span>세전 수익</span><b class="' + cl(o.pre - o.inv) + '">' + (o.pre >= o.inv ? '+' : '−') + won(Math.abs(o.pre - o.inv)) + '</b></div>' +
        '<div class="pz-txl"><span>' + (o.kind === "us" ? '배당 세금(미국 15%' + (big && o.divOver > 0 ? '+종합' : '') + ')' : '분배금 세금(15.4%' + (big && o.divOver > 0 ? '+종합' : '') + ')') + '</span><b class="dn">−' + won(o.divTax) + '</b></div>' +
        '<div class="pz-txl"><span>' + (o.kind === "us" ? '양도세 22% <small>(250만 공제)</small>' : '매매차익 세금 ' + (o.over > 0 ? '<small>(15.4% + 종합 ' + Math.max(br, 15.4) + '%)</small>' : '15.4%')) + '</span><b class="dn">−' + won(o.saleTax) + '</b></div>' +
        (o.kind === "us" ? '<div class="pz-txl"><span>환전 비용 <small>(0.1%씩)</small></span><b class="dn">−' + won(o.fxCost) + '</b></div>' : '') +
        '<div class="pz-txl tot"><span>세금으로 깎인 수익</span><b class="dn">−' + Math.max(0, lost).toFixed(1) + '%p</b></div></div>';
    };
    var per = r.from.replace(/-/g, ".") + ' ~ ' + r.to.slice(2).replace(/-/g, "."), lump = fl.length === 1;
    var fxl = r.fxNo ? '<div class="pz-txx">⏳ 원/달러 일봉은 오늘 저녁 상품 작업 뒤 들어와요 — 지금은 환율이 그대로였던 셈</div>' :
      '<div class="pz-txu"><div><small>달러로는</small><b class="' + cl(us.usdRet) + '">' + sg(us.usdRet, 1) + '%</b></div><div class="op">×</div>' +
      '<div><small>' + (lump ? '환율 ' : '평균 산 환율 ') + Math.round(us.fx0).toLocaleString() + ' → ' + Math.round(us.fx1).toLocaleString() + '원</small><b class="' + cl(us.fx1 - us.fx0) + '">' + sg((us.fx1 / us.fx0 - 1) * 100, 1) + '%</b></div><div class="op">→</div>' +
      '<div><small>원화 세전</small><b class="' + cl(us.preRet) + '">' + sg(us.preRet, 1) + '%</b></div></div>';
    var warn = "";
    if (!big && kr.over > 0) warn = '<div class="pz-txx">⚠️ 국내 ETF는 판 해에 차익 ' + won(Math.max(0, kr.gain)) + '원이 금융소득으로 잡혀 2천만원 넘는 ' + won(kr.over) + '원은 종합과세(' + Math.max(br, 15.4) + '%) — 몇 해에 나눠 팔면 세금이 줄어요.</div>';
    if (big) warn = '<div class="pz-txx ok">💡 대상자는 국내 ETF 차익·분배금이 다른 소득과 합쳐 높은 세율을 맞지만, 해외 직투 양도세는 22% 분리과세라 종합과세에 안 섞여요' + (best.kind === "us" ? ' — 그래서 이 조건에선 직투가 유리' : '') + '. 연금저축·IRP·ISA에 담으면 과세를 미루거나 낮출 수 있어요.</div>';
    var chips = '<div class="pz-txk"><span>' + (big ? '내 종합소득 세율 <small>(지방세 포함 · 과세표준 구간)</small>' : '2천만원 넘을 때 적용할 내 세율 <small>(지방세 포함)</small>') + '</span><div>' +
      BR.map(function(b){ return '<button data-br="' + b[0] + '" class="' + (+br === b[0] ? "on" : "") + '">' + b[0] + '%<small>' + b[1] + '</small></button>'; }).join("") + '</div></div>' +
      (big ? '<label class="pz-txo">다른 금융소득(이자·배당) 연 <input type="number" inputmode="numeric" min="0" step="100" id="pztxof" value="' + (ST.of || 0) + '"> 만원 <small>2천만원 넘으면 이 포트 소득 전부 종합과세</small></label>' : '');
    var sumL = (lump ? won(us.inv) + '원 한 번에' : '적립식 ' + won(us.inv) + '원') + ' · ' + nm[best.kind].split(" ")[0] + ' ' + sg(best.ret, 1) + '%';
    return '<details class="pz-tx" id="pztx"' + (ST.txo ? ' open' : '') + '><summary><b>🧾 세금 떼면 실제 수익률</b><span>💵 직투 <b class="' + cl(us.ret) + '">' + sg(us.ret, 1) + '%</b> · 🇰🇷 국내 ETF <b class="' + cl(kr.ret) + '">' + sg(kr.ret, 1) + '%</b> <small>세전 ' + sg(us.preRet, 1) + '%</small></span></summary>' +
      '<div class="pz-txt"><button data-tx="gen" class="' + (!big ? "on" : "") + '">🙂 일반<small>금융소득 연 2천만원 이하</small></button><button data-tx="big" class="' + (big ? "on" : "") + '">💼 금융소득종합과세 대상자<small>이자·배당 연 2천만원 초과</small></button></div>' +
      chips +
      '<div class="pz-txp">📅 ' + per + ' · ' + (lump ? won(us.inv) + '원을 첫날 한 번에' : '넣은 돈 ' + won(us.inv) + '원 · ' + fl.length + '번') + '</div>' + fxl +
      '<div class="pz-txg">' + card(us) + card(kr) + '</div>' +
      '<div class="pz-txkey"><span><i class="n"></i>손에 쥐는 돈</span><span><i class="t"></i>세금</span><span><i class="f"></i>환전</span><span><i class="e"></i>넣은 돈</span></div>' +
      (gap >= 1e4 ? '<div class="pz-txwin">👑 이 조건이면 <b>' + nm[best.kind] + '</b>이 <b>' + won(gap) + '원</b> 더 남아요 <small>(' + (best === us ? '국내 ETF' : '달러 직투') + '보다 수익률 ' + Math.abs(us.ret - kr.ret).toFixed(1) + '%p)</small></div>' : '<div class="pz-txwin">두 방법 차이가 거의 없어요</div>') +
      warn +
      (sxOn().length ? '<p class="note" style="margin:4px 0 0">➕ 섞은 종목·ETF(' + e(sxOn().map(function(x){ return x.n; }).join(" · ")) + ')도 같은 방식으로 셈(근사 · 배당은 값에 들어 있고 분배금 세금은 빼지 않음 · 국내 상장 주식 매매차익 비과세 같은 차이도 빼지 않음).</p>' : '') +
      (function(){ var B = bdOn(), L = []; if (B.IEF || B.TLT) L.push('미국채는 ETF 처럼 셈(분배금 = 이자 · 국내 ETF 칸은 국내 상장 미국채 ETF 가정)');
        if (B.BRBOND) L.push('🇧🇷 브라질국채 몫(기간 평균 ' + Math.round(us.free * 100) + '%)은 한-브라질 조세협약으로 이자·매매차익·환차익 비과세 · 금융소득종합과세에도 안 들어가 그 몫만큼 세금에서 뺌(근사) · 두 칸 모두 브라질국채는 직접 사는 것으로 같게 셈 · 브라질 현지 세금(IOF)·조세협약은 바뀔 수 있음');
        return L.length ? '<p class="note" style="margin:4px 0 0">🏦 ' + L.join(' · ') + '.</p>' : ''; })() +
      '<p class="note pz-txnote">가정 · 💵 양도세 = (원화로 본 차익 − 연 250만원) × 22%, 끝에 한 번에 판 셈(달마다 맞추며 판 차익 과세는 미룬 셈) · 미국 배당 15% 원천징수 · 환전 우대 0.1%씩 · 🇰🇷 국내 상장 해외 ETF 매매차익·분배금은 배당소득 15.4%, 그해 금융소득 2천만원 넘는 몫은 종합과세(구간 세율 한 칸으로 근사) · 분배금 = 해마다 실제 분배금 수익률' + (TXD.div ? '' : '(자료 준비 중 — 평균값)') + ' · 보수·과표기준가 차이·건강보험료(금융소득 1천만원 넘으면 영향)는 빼지 않음 · 2026년 세법 기준, 바뀔 수 있음 · 세무 상담이 아니에요.</p></details>';
  }
  function wts(){   // 화면 % → 엔진 비중(합 1, 종목은 다른 칸에서 비율대로 떼어 옴)
    var s = ST.w.SPY / 100, q = ST.w.QQQ / 100, g = ST.w.GLD / 100, c = Math.max(0, 1 - s - q - g), X = sxOn(), x = 0, B = bdOn(), bt = 0;
    X.forEach(function(o){ x += (+o.w || 0) / 100; });
    for (var b in B) bt += B[b] / 100;
    var k = Math.max(0, 1 - x - bt);
    var w = {SPY: s * k, QQQ: q * k, GLD: g * k, BIL: c * k}; X.forEach(function(o){ w[sxKey(o.s)] = (+o.w || 0) / 100; }); for (var b2 in B) w[b2] = B[b2] / 100; return w;
  }
  function series(){
    var ks = ETF.slice(), xs = sxOn().map(function(o){ return sxKey(o.s); });
    Object.keys(bdOn()).forEach(function(b){ ks.push(b); });
    return Promise.all(ks.concat(xs).map(px)).then(function(ss){
      if (ss.slice(0, ks.length).some(function(x){ return !x; })) return null;
      var bad = xs.filter(function(k, i){ return !ss[ks.length + i]; }); if (bad.length) return null;
      var key = ks.concat(xs).join(","); if (ALN[key]) return ALN[key];
      var o = {}; ks.forEach(function(k, i){ o[k] = ss[i]; }); var A = align(o);
      if (xs.length){ var X = {}; xs.forEach(function(k, i){ X[k] = ss[ks.length + i]; }); A = addX(A, X); }
      ALN[key] = A; return A;
    });
  }
  function addX(A, X){   // ➕ 종목은 S&P 날짜에 맞춰 바로 앞 날 값으로 채움(휴장일 차이) · 상장 전은 첫 값(계산 시작은 상장 뒤로 미룸 → startOf)
    var C = {}, XF = {}; for (var k0 in A.C) C[k0] = A.C[k0];
    for (var k in X){ var s = X[k], arr = new Array(A.D.length), j = 0;
      for (var i = 0; i < A.D.length; i++){ while (j + 1 < s.d.length && s.d[j + 1] <= A.D[i]) j++; arr[i] = s.c[j]; }
      C[k] = arr; XF[k] = s.d[0]; }
    return {D: A.D, C: C, XF: XF};
  }
  var START0 = "2007-06-01";   // BIL(현금) 상장(2007-05-30) + 200일선 준비 → 실제 시작 2008-03 · 2008 폭락·2009 바닥을 다 넣음
  function first(A){ return A && A.D.length > 201 ? day2s(A.D[201]) : "2008-03-17"; }   // 200일선·변동성 준비가 끝난 첫날
  function xFirst(A){ var m = 0; if (A && A.XF) for (var k in A.XF) if (A.XF[k] > m) m = A.XF[k]; return m ? day2s(m + 1) : ""; }   // 가장 늦게 상장한 종목의 다음 날
  function startOf(A){ var f = first(A), last = A ? day2s(A.D[A.D.length - 6]) : "", xf = xFirst(A); if (xf > f) f = xf;
    if (!ST.from) return f;
    var p = PER[ST.from]; if (p){ var t = new Date(Date.now() + 9 * 3600e3); if (p === "ytd") return (t.getUTCFullYear()) + "-01-01" > f ? t.getUTCFullYear() + "-01-01" : f;
      t.setUTCMonth(t.getUTCMonth() - p); var d = t.toISOString().slice(0, 10); return d > f ? d : f; }
    var d2 = ST.from < f ? f : ST.from; return last && d2 > last ? last : d2; }
  var PER = {"10y": 120, "5y": 60, "3y": 36, "1y": 12, "6m": 6, "ytd": "ytd"};
  var LASTA = null;
  function runAll(A){
    LASTA = A;
    var START = startOf(A), w = wts(), o = {reg: ST.reg, vol: ST.vol, start: START};
    var t0 = performance.now(), main = engine(A, w, o);
    var alt = {reg: ST.reg ? engine(A, w, {reg: 0, vol: ST.vol, start: START}) : engine(A, w, {reg: 1, vol: ST.vol, start: START}),
               vol: ST.vol ? engine(A, w, {reg: ST.reg, vol: 0, start: START}) : engine(A, w, {reg: ST.reg, vol: 1, start: START})};
    ST.ms = performance.now() - t0;
    return {m: main, alt: alt};
  }
  function verify(){   // check.json 과 같은 숫자인지 (4자산만)
    if (CHKOK !== null || !CHK || !CHK.runs) return Promise.resolve(CHKOK);
    return Promise.all(ETF.map(px)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var A = align({SPY: ss[0], QQQ: ss[1], GLD: ss[2], BIL: ss[3]}), ok = 0, n = 0;
      CHK.runs.forEach(function(r){ var x = engine(A, r.w, {reg: r.reg ? 1 : 0, vol: r.vol ? 1 : 0, start: r.from}); n++;
        if (x && Math.abs(x.cagr - r.cagr) < 0.03 && Math.abs(x.mdd - r.mdd) < 0.15) ok++; else console.warn("pdz check", r.name, r.cagr, r.mdd, x && x.cagr, x && x.mdd); });
      CHKOK = {ok: ok, n: n}; return CHKOK;
    });
  }

  /* ── 화면 ── */
  function sl(k, lb){ return '<label class="pz-sl"><span><i style="background:' + COLS[k] + '"></i>' + lb + ' <b id="pzv' + k + '">' + ST.w[k] + '%</b></span><input type="range" min="0" max="100" step="5" value="' + ST.w[k] + '" data-pz="' + k + '"></label>'; }
  function barH(){
    var w = wts(), seg2 = function(c, v){ return v > 0.0005 ? '<i style="flex:' + v.toFixed(4) + ';background:' + c + '"></i>' : ''; }, seg = function(k, v){ return seg2(COLS[k], v); };
    return '<div class="pz-bar">' + seg("SPY", w.SPY) + seg("QQQ", w.QQQ) + seg("GLD", w.GLD) + sxOn().map(function(o, i){ return seg2(sxCol(ST.sx.indexOf(o)), w[sxKey(o.s)] || 0); }).join("") + BDS.map(function(b){ return seg(b[0], w[b[0]] || 0); }).join("") + seg("BIL", w.BIL) + '</div>' +
      '<div class="pz-lg">S&P ' + r1(w.SPY) + ' · 나스닥 ' + r1(w.QQQ) + ' · 금 ' + r1(w.GLD) + sxOn().map(function(o){ return ' · <span style="color:' + sxCol(ST.sx.indexOf(o)) + '">' + e(o.n) + ' ' + r1(w[sxKey(o.s)] || 0) + '</span>'; }).join("") + BDS.map(function(b){ return w[b[0]] ? ' · <span style="color:' + COLS[b[0]] + '">' + BDN[b[0]] + ' ' + r1(w[b[0]]) + '</span>' : ''; }).join("") + ' · 현금 ' + r1(w.BIL) + '</div>';
  }
  function r1(v){ return (Math.round(v * 1000) / 10) + "%"; }
  function head(my){
    return '<div class="pz-pre"><button data-pre="base">💼 기본 비중</button>' + (my ? '<button data-pre="mine">🙋 내 포트 비중</button>' : '') + '<button data-pre="spy">S&P 100%</button><button data-pre="6040">S&P 60 · 금 20 · 현금 20</button></div>' +
      sl("SPY", "S&P500") + sl("QQQ", "나스닥100") + sl("GLD", "금") +
      '<div id="pzbar">' + barH() + '</div>' +
      '<div class="pz-dt"><div class="pz-dth">📅 언제부터 <b id="pzfrom">' + e(ST.from && !PER[ST.from] ? ST.from.replace(/-/g, ".") : "") + '</b> <span class="mut">그날 종가에 샀다면 → 지금까지</span></div>' +
        '<div class="pz-dc">' + [["", "처음(2008.03)"], ["10y", "10년"], ["5y", "5년"], ["3y", "3년"], ["1y", "1년"], ["6m", "6개월"], ["ytd", "올해"]].map(function(x){ return '<button data-fr="' + x[0] + '" class="' + (ST.from === x[0] ? "on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>' +
        '<label class="pz-di">직접 <input type="date" id="pzdate" min="2008-03-17" max="' + new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + '" value="' + e(ST.from && !PER[ST.from] ? ST.from : "") + '"><small>주말·휴일이면 다음 거래일부터</small></label></div>' +
      '<div class="pz-md"><div class="pz-dth">💵 넣는 방식</div><div class="pz-dc"><button data-md="lump" class="' + (ST.mode !== "dca" ? "on" : "") + '">거치식 · 한 번에</button><button data-md="dca" class="' + (ST.mode === "dca" ? "on" : "") + '">적립식 · 매달</button></div>' +
        (ST.mode === "dca" ? '<div class="pz-dcf"><label>매달 <input type="number" inputmode="numeric" min="1" step="10" id="pzdm" value="' + (ST.dm || "") + '"> 만원</label>' +
          '<label>매월 <select id="pzdd">' + Array.apply(null, Array(28)).map(function(_, i){ return '<option value="' + (i + 1) + '"' + (+ST.dd === i + 1 ? " selected" : "") + '>' + (i + 1) + '일</option>'; }).join("") + '<option value="31"' + (+ST.dd >= 31 ? " selected" : "") + '>말일</option></select> 에 넣기</label>' +
          '<label>처음에 한 번 <input type="number" inputmode="numeric" min="0" step="100" id="pzd0" value="' + (ST.d0 || "") + '" placeholder="0"> 만원 <small>(선택)</small></label>' +
          '<small class="pz-dcn">시작은 위 「언제부터」 날짜 · 그날 종가에 사서 지금까지</small></div>' : '<small class="pz-dcn">시작 날짜에 ' + won(amt()) + '원을 한 번에 넣은 셈 (금액은 💼 내 포트 금액)</small>') + '</div>' +
      '<div class="pz-tg"><button data-tg="reg" class="' + (ST.reg ? "on" : "") + '">🛡 200일선 방어 <b>' + (ST.reg ? "켬" : "끔") + '</b></button><button data-tg="vol" class="' + (ST.vol ? "on" : "") + '">📉 변동성 맞춤 <b>' + (ST.vol ? "켬" : "끔") + '</b></button></div>' +
      sxUI() + bondUI();
  }
  function tk(x){ return x.m === "US" || (!x.m && /^[A-Z][A-Z.\-]*$/.test(x.s)) ? x.s : (window.V && V.cd ? V.cd(x.s) : x.s.replace(/\.(KS|KQ)$/, "")); }   // 미국 종목은 이름 밑에 티커
  function sxRow(x, i){
    var a = POOL && POOL.assets[x.s], bad = POOL && POOL.bad && POOL.bad[x.s], y = a && a.from ? a.from.slice(0, 7).replace("-", ".") : "";
    var st = a ? (y > "2008.03" ? '<small class="pz-sxok">' + y + ' 상장 → 그때부터</small>' : '') : bad ? '<small class="pz-sxbad">✗ 일봉 자료가 없어요 <button data-sxre="' + i + '">다시 요청</button></small>' : '<small class="pz-sxwait">⏳ 20년 일봉 받는 중 · 보통 15~30분 · 들어오면 자동으로 계산에 넣어요</small>';
    return '<div class="pz-sxr' + (a ? '' : ' wait') + '"><div class="pz-sxh"><i style="background:' + sxCol(i) + '"></i><span><b>' + e(x.n) + '</b><em class="tk">' + e(tk(x)) + '</em></span>' +
      '<b class="pz-sxv" id="pzsxv' + i + '">' + x.w + '%</b><button class="pz-sxx" data-sxdel="' + i + '" aria-label="빼기">✕</button></div>' +
      '<input type="range" min="5" max="50" step="5" value="' + x.w + '" data-sxw="' + i + '"' + (a ? '' : ' disabled') + '>' + st + '</div>';
  }
  function sxUI(){   // ➕ 11/18 종목·ETF 섞어 보기
    var L = ST.sx || [], have = {}; L.forEach(function(x){ have[x.s] = 1; });
    var sum = L.length + '개 · ' + L.reduce(function(t, x){ return t + (+x.w || 0); }, 0) + '%';
    return '<details class="pz-st pz-sx" id="pzsx"' + (L.length || ST.sxo ? " open" : "") + '><summary>➕ 종목·ETF 섞어 보기 ' + (L.length ? '<b>' + e(sum) + '</b>' : '<span class="mut">(지금 없음)</span>') + '</summary>' +
      (L.length < SXMAX ? '<div class="pz-sxq"><input type="search" id="pzsxq" placeholder="이름·코드 (예: 삼성전자, SCHD)" autocomplete="off" autocapitalize="off" spellcheck="false"><div id="pzsxres" class="pz-sxres"></div></div>' +
        '<div class="pz-sc pz-sxqk">' + QUICK.filter(function(q){ return !have[q[0]]; }).slice(0, 10).map(function(q){ return '<button data-sxq="' + e(q[0]) + '" data-nm="' + e(q[1]) + '" data-et="' + (q[2] ? 1 : 0) + '">' + e(q[1]) + '</button>'; }).join("") + '</div>'
        : '<p class="note" style="margin:2px 0 6px">최대 ' + SXMAX + '개까지 — 하나를 빼면 더 넣을 수 있어요.</p>') +
      L.map(sxRow).join("") +
      '<p class="note" style="margin:2px 0 0">약 2.8만 종목·ETF(한·미·일·중·홍) 중 아무거나 · 최대 ' + SXMAX + '개 · 각 5~50% · 종목 + 채권 합 80%까지 · 고른 비중만큼 S&P·나스닥·금·현금에서 비율대로 떼어 와요 · 방어 규칙 밖(그대로 둠) · 달마다 맞춤 · 배당 포함 값을 달러로 바꿔 셈(원화 수익은 🧾 세금 칸에서 환율 반영) · 상장이 늦으면 그날부터 계산.</p></details>';
  }
  function sxAdd(s, n, m, et){
    ST.sx = ST.sx || [];
    if (ST.sx.some(function(x){ return x.s === s; })) return false;
    if (ST.sx.length >= SXMAX){ if (window.P && P.toast) P.toast("종목·ETF 는 " + SXMAX + "개까지예요"); return false; }
    var room = 80 - extW(); if (room < 5){ if (window.P && P.toast) P.toast("종목 + 채권은 합쳐 80%까지예요 — 다른 칸을 줄여 주세요"); return false; }
    var x = {s: s, n: n || s, m: m || "", e: et ? 1 : 0, w: Math.min(10, Math.floor(room / 5) * 5)}; ST.sx.push(x);
    if (!(POOL && POOL.assets[s])) sxReq(x);
    return true;
  }
  function bondUI(){   // 🏦 11/17 채권 섞어 보기
    var B = bdOn(), on = Object.keys(B), br = IDX.assets.BRBOND;
    var sum = on.map(function(k){ return BDN[k] + ' ' + B[k] + '%'; }).join(" · ");
    return '<details class="pz-st pz-bd"' + (on.length ? " open" : "") + '><summary>🏦 채권 섞어 보기 <span class="mut">미국채 · 브라질국채</span> ' + (on.length ? '<b>' + e(sum) + '</b>' : '<span class="mut">(지금 없음)</span>') + '</summary>' +
      '<div class="pz-sc">' + BDS.map(function(b){ var a = IDX.assets[b[0]], y = a && a.from ? a.from.slice(0, 4) : "";
        return a ? '<button data-bd="' + b[0] + '" class="' + (B[b[0]] ? "on" : "") + '">' + b[1] + '<small>' + b[2] + (y > "2007" ? ' · ' + y + '~' : '') + '</small></button>' : '<button disabled style="opacity:.5">' + b[1] + '<small>자료 준비 중</small></button>'; }).join("") + '</div>' +
      on.map(function(k){ return '<label class="pz-sl"><span><i style="background:' + COLS[k] + '"></i>' + BDN[k] + ' <b id="pzbv' + k + '">' + B[k] + '%</b></span><input type="range" min="5" max="60" step="5" value="' + B[k] + '" data-bw="' + k + '"></label>'; }).join("") +
      '<p class="note" style="margin:2px 0 0">채권도 다른 칸에서 비율대로 떼어 와요 · 방어 규칙 밖(그대로 둠) · 종목 + 채권 합은 80%까지 · 미국채는 이자 포함 달러 값(원화 수익은 🧾 세금 칸에서 환율 반영)' +
        (br ? ' · 브라질국채 = 헤알 국채 값을 달러로 바꾼 값(헤알 값이 오르내린 것 포함)' + (br.splice ? ' · ' + br.splice.slice(0, 7).replace("-", ".") + ' 전은 브라질 기준금리 이자만 쌓은 근사(금리 변화로 값이 오르내린 것 빠짐)' : (/Selic/.test(br.src || "") ? ' · 브라질 기준금리 이자만 쌓은 근사(금리 변화로 값이 오르내린 것 빠짐)' : '')) + ' · 한-브라질 조세협약으로 이자·매매차익·환차익 비과세 · 브라질국채는 중개 상품이라 고객 요청이 있을 때만 제안 가능' : '') + '.</p></details>';
  }
  function curve(r, PN){
    var W = 340, H = 150, P = 4, N = r.nv.length, step = Math.max(1, Math.floor(N / 170)), lo = Infinity, hi = -Infinity;
    for (var i = 0; i < N; i++){ var a = Math.log(r.nv[i]), b = Math.log(r.sp[i]); if (a < lo) lo = a; if (b < lo) lo = b; if (a > hi) hi = a; if (b > hi) hi = b; }
    lo = Math.min(lo, 0); var X = function(i){ return P + (W - 2 * P - 40) * i / (N - 1); }, Yf = function(v){ return H - 16 - (H - 26) * (Math.log(v) - lo) / (hi - lo || 1); };
    var path = function(arr){ var s = ""; for (var i = 0; i < N; i += step) s += (s ? "L" : "M") + X(i).toFixed(1) + "," + Yf(arr[i]).toFixed(1); return s + "L" + X(N - 1).toFixed(1) + "," + Yf(arr[N - 1]).toFixed(1); };
    var span = hi - lo, g = "", mult = span > 0.9 ? [0.5, 1, 2, 3, 4, 6, 8, 12, 16] : span > 0.35 ? [0.6, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5] : [0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4];
    mult.forEach(function(m){ var lv = Math.log(m); if (lv < lo - 0.01 || lv > hi + 0.01) return; var y = Yf(m).toFixed(1);
      g += '<line x1="' + P + '" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" class="pz-gl"/><text x="' + (W - 38) + '" y="' + (+y + 3) + '" class="pz-gt">' + (span > 0.9 ? m + '배' : (m >= 1 ? '+' : '−') + Math.round(Math.abs(m - 1) * 100) + '%') + '</text>'; });
    var yt = "", lastY = null;
    var ystep = r.yrs > 12 ? 4 : r.yrs > 6 ? 2 : 1, lastM = null;
    for (var j = 0; j < N; j++){ var ds = day2s(r.D[r.i0 + j]), yy = ds.slice(0, 4), mm = ds.slice(0, 7);
      if (r.yrs >= 2){ if (yy !== lastY && +yy % ystep === 0 && j > 20) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + yy + '</text>'; }
      else if (mm !== lastM && j > 5 && (+ds.slice(5, 7)) % (r.yrs > 1 ? 3 : r.yrs > 0.4 ? 2 : 1) === 1) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + (+ds.slice(5, 7) === 1 ? yy.slice(2) + '.' : '') + (+ds.slice(5, 7)) + '월</text>';
      lastY = yy; lastM = mm; }
    var mi = r.D.indexOf ? -1 : -1;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pz-cv" role="img" aria-label="설계한 포트와 S&P500 곡선">' + g + yt +
      '<path d="' + path(r.sp) + '" class="pz-ls"/><path d="' + path(r.nv) + '" class="pz-lm"/>' +
      (PN && PN.alts ? PN.alts.map(function(a, k){ return a.path ? '<path d="' + path(a.path) + '" class="pz-pn pz-pn' + k + '"/>' : ''; }).join("") +
        '<circle cx="' + X(PN.s).toFixed(1) + '" cy="' + Yf(r.nv[PN.s]).toFixed(1) + '" r="4.5" class="pz-pnd"/><text x="' + Math.min(W - 70, Math.max(8, X(PN.s) - 10)).toFixed(1) + '" y="' + Math.max(10, Yf(r.nv[PN.s]) + 16).toFixed(1) + '" class="pz-pnt">😱 ' + PN.lab + '</text>' : '') +
      '<circle cx="' + X(N - 1).toFixed(1) + '" cy="' + Yf(r.nv[N - 1]).toFixed(1) + '" r="3" class="pz-dm"/></svg>' +
      '<div class="pz-key"><span><i class="m"></i>설계한 포트</span><span><i class="s"></i>S&P500(배당 포함, 그대로 들고 있기)</span>' + (PN && PN.alts ? '<span><i class="p"></i>😱 그날 팔았다면</span>' : '') + '<span class="mut">눈금은 배수(로그)</span></div>';
  }
  /* 😱 10/22 A10/22-1 패닉 비용 — S&P 가 고점에서 15% 넘게 빠진 구간마다 「가장 크게 빠진 날」 종가에 전부 팔고(현금·단기채 BIL)
     20·60·120거래일 뒤 다시 같은 비중으로 샀다면 지금 돈이 얼마 달라졌나 + 반대로 그날 투자금의 10% 를 더 넣었다면(그 돈은 원래 현금) */
  function panicEps(r){
    var sp = r.sp, N = sp.length, pk = sp[0], pki = 0, eps = [], cur = null;
    for (var u = 1; u < N; u++){
      if (sp[u] > pk){ if (cur && cur.dd <= -0.15) eps.push(cur); pk = sp[u]; pki = u; cur = null; continue; }
      var dd = sp[u] / pk - 1, r1 = sp[u] / sp[u - 1] - 1;
      if (!cur) cur = {dd: dd, worst: r1, s: u};
      if (dd < cur.dd) cur.dd = dd;
      if (r1 < cur.worst){ cur.worst = r1; cur.s = u; }
    }
    if (cur && cur.dd <= -0.15) eps.push(cur);
    return eps.filter(function(x){ return x.s + 20 < N; }).map(function(x){ var ds = day2s(r.D[r.i0 + x.s]); return {s: x.s, d: ds, dd: x.dd * 100, r1: x.worst * 100, lab: ds.slice(0, 7).replace("-", ".")}; });
  }
  function panicCalc(r, ep){
    var A = LASTA, bil = A && A.C.BIL; if (!bil) return null;
    var N = r.nv.length, s = ep.s, end = r.nv[N - 1], B = function(u){ return bil[r.i0 + u]; };
    var alts = [20, 60, 120].map(function(h){
      if (s + h >= N) return {h: h, na: 1};
      var k = (r.nv[s] / r.nv[s + h]) * (B(s + h) / B(s)), path = new Float64Array(N);
      for (var u = 0; u < N; u++) path[u] = u <= s ? r.nv[u] : u <= s + h ? r.nv[s] * B(u) / B(s) : r.nv[u] * k;
      return {h: h, path: path, end: end * k, back: day2s(r.D[r.i0 + s + h])};
    });
    var add = 1 - (r.nv[s] / end) * (B(N - 1) / B(s));   // 그날 가진 돈의 10% 를 포트에 더 넣은 것 − 현금으로 둔 것, 지금 돈 대비 (× 0.1 은 화면에서)
    return {s: s, lab: ep.lab, alts: alts, add: add, end: end};
  }
  function panicH(r){
    var eps = panicEps(r);
    if (!eps.length) return '<div class="pz-pnx" id="pzpanic"><div class="pz-pnh">😱 그날 겁먹고 팔았다면 <span class="mut">패닉 비용</span></div><p class="note" style="margin:4px 0 0">이 기간엔 S&P 가 고점에서 15% 넘게 빠진 적이 없어요 — 「처음(2008.03)」으로 보면 2008·2020·2022·2025 가 나와요.</p></div>';
    var sel = eps.filter(function(x){ return x.d === ST.pn; })[0] || eps[eps.length - 1], P = panicCalc(r, sel), A = amt();
    if (!P) return "";
    ST.pnObj = P;
    var rows = P.alts.map(function(a){
      if (a.na) return '<div class="pz-pnr"><span>' + a.h + '거래일 뒤 복귀</span><b class="mut">아직 그만큼 안 지남</b></div>';
      var dv = A * (a.end / P.end - 1), dp = (a.end / P.end - 1) * 100;
      return '<div class="pz-pnr"><span><i class="pz-pk pz-pk' + P.alts.indexOf(a) + '"></i>' + a.h + '거래일 뒤 ' + a.back.slice(2).replace(/-/g, ".") + ' 복귀</span><b class="' + cl(dv) + '">' + (dv >= 0 ? "+" : "−") + won(Math.abs(dv)) + '원</b><em>' + sg(dp, 1) + '%</em></div>'; });
    var ad = A * 0.1 * P.add;
    return '<div class="pz-pnx" id="pzpanic"><div class="pz-pnh">😱 그날 겁먹고 팔았다면 <span class="mut">패닉 비용 · 지금 돈 ' + won(A) + '원 기준</span></div>' +
      '<div class="pz-pnc">' + eps.map(function(x){ return '<button data-pn="' + x.d + '" class="' + (x === sel ? "on" : "") + '">' + x.lab + '<small>S&P ' + sg(x.r1, 1) + '%</small></button>'; }).join("") + '</div>' +
      '<p class="pz-pns"><b>' + sel.d.replace(/-/g, ".") + '</b> — S&P 고점에서 ' + sg(sel.dd, 0) + '% 빠진 구간 중 가장 크게 빠진 날(' + sg(sel.r1, 1) + '%). 그날 종가에 이 포트를 전부 팔고 현금(단기채)으로 있다가 다시 샀다면, 지금 ' + won(A) + '원이 그대로 들고 있던 것보다:</p>' +
      rows.join("") +
      '<div class="pz-pnr pz-pnb"><span>↔ 반대로 그날 가진 돈의 10% 를 더 넣었다면</span><b class="' + cl(ad) + '">' + (ad >= 0 ? "+" : "−") + won(Math.abs(ad)) + '원</b><em>현금으로 둔 것보다</em></div>' +
      '<p class="note" style="margin:4px 0 0">곡선의 점선 = 그날 팔았다면 · 이 포트 규칙(방어·변동성 맞춤) 그대로 · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p></div>';
  }
  function yearsH(r){
    var ys = Object.keys(r.Y).sort();
    return '<div class="pz-yr">' + ys.map(function(y){ var v = r.Y[y][0], s = r.Y[y][1], a = Math.min(1, Math.abs(v) / 35);
      return '<div title="' + y + ' 설계 ' + sg(v) + '% · S&P ' + sg(s) + '%" style="background:color-mix(in srgb,var(' + (v >= 0 ? "--up" : "--down") + ') ' + Math.round(15 + a * 70) + '%,transparent)"><small>' + y.slice(2) + '</small><b>' + (Math.abs(v) < 0.5 ? "0" : (v > 0 ? "+" : "−") + Math.abs(v).toFixed(0)) + '</b></div>'; }).join("") + '</div>' +
      '<p class="note" style="margin:3px 0 0">해마다 수익률(%) · 처음·마지막 해는 일부 기간 · 칸을 누르면 S&P 와 비교</p>';
  }
  function insur(R){
    var m = R.m, out = [];
    [["reg", "🛡 200일선 방어"], ["vol", "📉 변동성 맞춤"]].forEach(function(t){
      var a = R.alt[t[0]]; if (!a || !m) return; var on = ST[t[0]];
      var sh = m.yrs < 1, dc = sh ? a.tot - m.tot : a.cagr - m.cagr, dm = a.mdd - m.mdd;   // 1년 안 = 기간 수익 차이
      out.push('<div class="pz-in"><b>' + t[1] + '</b> ' + (on ? '끄면' : '켜면') + (sh ? ' 기간 수익 ' : ' 연 ') + '<b class="' + cl(dc) + '">' + sg(dc, 1) + '%p</b> · 최대 낙폭 ' + sg(m.mdd, 0) + '% → <b class="' + (dm < -0.5 ? "dn" : dm > 0.5 ? "up" : "") + '">' + sg(a.mdd, 0) + '%</b>' +
        '<small>' + (on ? (dc > 0.1 && dm < -0.5 ? '= 이 보험값: ' + (sh ? '이 기간 ' : '해마다 ') + dc.toFixed(1) + '%p 내고 낙폭 ' + Math.abs(dm).toFixed(0) + '%p 덜 맞음' : dc <= 0.1 && dm < -0.5 ? '= 끄면 덜 벌고 더 맞음 — 공짜 보험' : '') : (dc < -0.1 && dm > 0.5 ? '= 켜면 ' + (sh ? '이 기간 ' : '해마다 ') + Math.abs(dc).toFixed(1) + '%p 내고 낙폭 ' + dm.toFixed(0) + '%p 덜 맞음' : dc >= -0.1 && dm > 0.5 ? '= 켜면 덜 맞고 더 벎 — 공짜 보험' : '')) + '</small></div>');
    });
    return out.join("");
  }
  function delta(c, p){
    if (!c || !p) return "";
    var a = c.cagr - p.cagr, b = c.mdd - p.mdd;
    if (Math.abs(a) < 0.05 && Math.abs(b) < 0.3) return "";
    return '<div class="pz-dl">방금 바꾸기 전보다 · 연 <b class="' + cl(a) + '">' + sg(a, 1) + '%p</b> · 최대 낙폭 <b class="' + (b > 0 ? "up" : "dn") + '">' + sg(b, 1) + '%p</b></div>';
  }
  function result(){
    ST.pnObj = null;
    if (!ST.last) return '<div class="loading">계산 중…</div>';
    if (ST.last.err) return '<div class="empty">' + e(ST.last.err) + '</div>';
    var R = ST.last.R, r = R.m, A = amt();
    var lng = r.yrs >= 1, wy = r.yrs >= 2 && r.worst && r.Y[r.worst];
    return (ST.mode === "dca" ? dcaH(r) + '<div class="pz-sel">📊 포트 자체 성적 <span class="mut">한 번에 넣었을 때 기준 · 적립식도 같은 포트를 사는 것</span></div>' : '') + '<div class="pz-per">📅 <b>' + r.from.replace(/-/g, ".") + '</b>부터 지금까지 <b class="' + cl(r.tot) + '">' + sg(r.tot, 1) + '%</b> <span>S&P ' + sg(r.sptot, 1) + '% · ' + (r.tot - r.sptot >= 0 ? '앞섬 ' : '뒤짐 ') + sg(r.tot - r.sptot, 1) + '%p</span></div>' +
      '<div class="pz-big">' + (lng ? '<div><small>연 수익</small><b class="' + cl(r.cagr) + '">' + sg(r.cagr, 1) + '%</b><em>S&P ' + sg(r.sp_cagr, 1) + '%</em></div>' : '<div><small>기간 수익</small><b class="' + cl(r.tot) + '">' + sg(r.tot, 1) + '%</b><em>S&P ' + sg(r.sptot, 1) + '%</em></div>') +
      '<div><small>최대 낙폭</small><b class="dn">' + sg(r.mdd, 0) + '%</b><em>' + r.mddAt.slice(0, 7).replace("-", ".") + ' · S&P ' + sg(r.sp_mdd, 0) + '%</em></div>' +
      (wy ? '<div><small>최악의 해</small><b class="' + cl(wy[0]) + '">' + sg(wy[0], 0) + '%</b><em>' + r.worst + (wy[2] < 240 ? '(일부)' : '') + ' · S&P ' + sg(wy[1], 0) + '%</em></div>' :
        '<div><small>S&P보다</small><b class="' + cl(r.tot - r.sptot) + '">' + sg(r.tot - r.sptot, 1) + '%p</b><em>같은 기간</em></div>') + '</div>' +
      delta(r, ST.prev) +
      (ST.mode === "dca" ? '' : '<div class="pz-won">💰 ' + won(A) + '원 → <b>' + won(A * r.end) + '원</b> <small>S&P 그대로였다면 ' + won(A * r.sp_end) + '원 · ' + r.from.slice(0, 7).replace("-", ".") + ' ~ ' + r.to.slice(2).replace(/-/g, ".") + ' (' + (r.yrs >= 1.5 ? r.yrs.toFixed(0) + '년' : Math.round(r.yrs * 12) + '개월') + ')</small></div>') +
      (function(){ try { return taxH(r); } catch(x) { console.warn(x); return ""; } })() +
      (function(){ var ph = ""; try { ph = panicH(r); } catch(x) { console.warn(x); } return curve(r, ST.pnObj) + insur(R) + ph; })() + yearsH(r) +
      '<p class="note pz-ms">휴대폰에서 ' + (r.nv.length * 3).toLocaleString() + '일 치를 ' + (ST.ms < 1000 ? ST.ms.toFixed(0) + 'ms' : (ST.ms / 1000).toFixed(1) + '초') + ' 만에 다시 셈 · 평균 주식 ' + r.expo.toFixed(0) + '%' +
        (CHKOK ? (CHKOK.ok === CHKOK.n ? ' · <b class="pz-ok">✓ 파이썬 검사 ' + CHKOK.n + '개와 같은 숫자</b>' : ' · ⚠️ 파이썬 검사 ' + CHKOK.ok + '/' + CHKOK.n + ' 맞음') : '') + '</p>';
  }
  // 🔧 11/14 ui_audit 「🙋 내 포트 비중 405→582」: 프리셋·종목 단추가 설계기를 통째로 다시 그리면 누른 단추가 아래로 밀림 → 다시 그린 뒤 손가락 밑 제자리로
  function pin(sel, y0){ var fix = function(){ var n = document.querySelector("#main " + sel) || document.querySelector(sel); if (!n) return; var d = n.getBoundingClientRect().top - y0; if (Math.abs(d) > 2) window.scrollBy(0, d); };
    // 늦게 오는 계산 결과(세금·위기 칸 등)가 위 칸 높이를 바꿔도 1.5초 동안 매 프레임 붙잡음 — 손가락·휠이 움직이면 바로 놓음
    var t0 = Date.now(), stop = false, off = function(){ stop = true; }; ["touchstart", "wheel", "keydown"].forEach(function(k){ window.addEventListener(k, off, {once: true, passive: true}); });
    (function loop(){ if (stop) return; fix(); if (Date.now() - t0 < 1500) (window.requestAnimationFrame || setTimeout)(loop, 16); })(); }
  function paint(){ var r = document.getElementById("pzres"); if (r) r.innerHTML = result(); bindRes(); var b = document.getElementById("pzbar"); if (b) b.innerHTML = barH(); }
  var RUN = 0;
  function calc(){
    var my = ++RUN;
    series().then(function(A){
      if (my !== RUN) return;
      if (!A){ ST.last = {err: "일봉을 못 받은 자산이 있어요. 잠시 뒤 다시 열어 주세요."}; paint(); return; }
      var R = null; try { R = runAll(A); } catch(x) { console.warn(x); }
      if (ST.last && ST.last.R && ST.last.R.m) ST.prev = ST.last.R.m;
      ST.last = R && R.m ? {R: R} : {err: "같이 거래된 날이 너무 적어 계산할 수 없어요(상장이 늦은 종목일 때)."};
      paint();
      verify().then(function(v){ if (v && my === RUN) paint(); });
    });
  }
  var MY = null;
  function draw(box){
    if (!box) return;
    if (!IDX){ box.innerHTML = '<div class="loading">포트 설계기 자료 불러오는 중…</div>'; idx().then(function(){ draw(document.getElementById(box.id)); }); return; }
    if (!ETF.every(function(k){ return IDX.assets[k]; })){ box.innerHTML = '<div class="sec">🎛 포트 설계기</div><section class="card"><div class="empty">20년 치 일봉 자료 준비 중 — 상품 작업이 한 번 돈 뒤 채워져요.</div></section>'; return; }
    box.innerHTML = '<div class="sec">🎛 포트 설계기 <small class="mut">비중·날짜를 바꾸면 그때부터 지금까지 다시 계산 · 휴대폰에만 저장</small></div><section class="card pz">' +
      '<p class="pz-sub">💼 기본 포트 규칙 그대로(200일선 방어 · 변동성 맞춤 · 달마다 맞춤 · 비용 0.1%) 비중과 시작 날짜는 내 맘대로 — 그날 종가에 사서 매일 굴린 셈이에요(처음 = 2008년 3월, 폭락까지 다 넣음).</p>' + head(MY) +
      '<div class="pz-res" id="pzres">' + result() + '</div>' +
      '<p class="note" style="margin:8px 0 0">과거 계산이고 미래를 보장하지 않아요 · 배당 포함 ETF 값(SPY·QQQ·GLD·BIL' + (Object.keys(bdOn()).length ? ' · 채권 ' + Object.keys(bdOn()).map(function(k){ return BDN[k]; }).join("·") : '') + ') · 세금·환전 비용은 🧾 세금 칸에서 따로 뗌 · 사라는 뜻이 아니에요.</p></section>';
    bind(box);
    if (!ST.last) calc(); else bindRes();
    if (window.__pdzFocus){ window.__pdzFocus = 0; setTimeout(function(){ box.scrollIntoView({block: "start", behavior: "smooth"}); }, 120); }
    if (window.__pdzPanic){ window.__pdzPanic = 0; var tries = 0, fp = function(){ var z = document.getElementById("podz"), p = document.getElementById("pzpanic"); if (z && z.classList.contains("cz-on")){ var hz = z.querySelector(".cz-h"); if (hz) hz.click(); else z.classList.remove("cz-on"); }   // calm.js 가 접어 둔 설계기 펼치기
      if (p && p.getBoundingClientRect().height) window.scrollTo({top: scrollY + p.getBoundingClientRect().top - 130, behavior: "smooth"}); else if (tries++ < 30) setTimeout(fp, 200); }; setTimeout(fp, 400); }
  }
  function bindRes(){
    [].forEach.call(document.querySelectorAll("#pzpanic [data-pn]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.pn = b.getAttribute("data-pn"); var r = document.getElementById("pzres"); if (r){ r.innerHTML = result(); bindRes(); } }; });
    var rr = function(){ var el = document.getElementById("pzres"); if (el){ el.innerHTML = result(); bindRes(); } };
    var tx = document.getElementById("pztx");
    if (tx){ tx.addEventListener("toggle", function(){ ST.txo = tx.open ? 1 : 0; keep(); });
      tx.querySelector("summary").addEventListener("click", function(ev){ ev.stopPropagation(); }); }
    [].forEach.call(document.querySelectorAll("#pztx [data-tx]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.tx = b.getAttribute("data-tx"); keep(); rr(); }; });
    [].forEach.call(document.querySelectorAll("#pztx [data-br]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST[ST.tx === "big" ? "brb" : "brg"] = +b.getAttribute("data-br"); keep(); rr(); }; });
    var of = document.getElementById("pztxof");
    if (of){ of.addEventListener("click", function(ev){ ev.stopPropagation(); });
      of.onchange = function(){ ST.of = Math.max(0, Math.round(+of.value || 0)); keep(); rr(); }; }
    [].forEach.call(document.querySelectorAll(".pz-yr>div"), function(d){ d.onclick = function(ev){ ev.stopPropagation(); if (window.P && P.toast) P.toast(d.title); }; });
  }
  function bindSx(box){
    var redo = function(sel){ var el = box.querySelector(sel), y0 = el ? el.getBoundingClientRect().top : 0; keep(); draw(box); calc(); pin("#pzsx", y0 || (box.querySelector("#pzsx") || {getBoundingClientRect: function(){ return {top: 0}; }}).getBoundingClientRect().top); };
    var det = box.querySelector("#pzsx"); if (det) det.addEventListener("toggle", function(){ ST.sxo = det.open ? 1 : 0; });
    var addOne = function(s, n, m, et){ var y0 = (box.querySelector("#pzsx") || box).getBoundingClientRect().top; if (!sxAdd(s, n, m, et)) return; ST.sxo = 1; keep(); draw(box); calc(); pin("#pzsx", y0);
      setTimeout(function(){ var q = document.getElementById("pzsxq"); if (q && document.activeElement !== q && ST.sx.length < SXMAX) {} }, 0); };
    [].forEach.call(box.querySelectorAll("[data-sxq]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var s = b.getAttribute("data-sxq"); addOne(s, b.getAttribute("data-nm"), /\.(KS|KQ)$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /^\^/.test(s) ? "" : "US", +b.getAttribute("data-et")); }; });
    [].forEach.call(box.querySelectorAll("[data-sxdel]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var i = +b.getAttribute("data-sxdel"), y0 = (box.querySelector("#pzsx") || box).getBoundingClientRect().top; ST.sx.splice(i, 1); ST.sxo = 1; keep(); draw(box); calc(); pin("#pzsx", y0); }; });
    [].forEach.call(box.querySelectorAll("[data-sxre]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var x = ST.sx[+b.getAttribute("data-sxre")]; if (!x) return; try { localStorage.removeItem("pdzreq:" + x.s); } catch(z) {} if (POOL && POOL.bad) delete POOL.bad[x.s]; sxReq(x); keep(); draw(box); if (window.P && P.toast) P.toast("다시 요청했어요 — 15~30분 뒤 다시 열어 보세요"); }; });
    [].forEach.call(box.querySelectorAll("input[data-sxw]"), function(x){ var i = +x.getAttribute("data-sxw"), o = ST.sx[i]; if (!o) return;
      x.oninput = function(){ var v = +x.value, room = 80 - (extW() - (+o.w || 0)); if (v > room){ v = Math.max(5, Math.floor(room / 5) * 5); x.value = v; } o.w = v; var t = document.getElementById("pzsxv" + i); if (t) t.textContent = v + "%"; var bb = document.getElementById("pzbar"); if (bb) bb.innerHTML = barH(); };
      x.onchange = function(){ x.oninput(); keep(); calc(); var sm = box.querySelector("#pzsx summary b"); if (sm) sm.textContent = ST.sx.length + "개 · " + ST.sx.reduce(function(t, y){ return t + (+y.w || 0); }, 0) + "%"; };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
    var q = box.querySelector("#pzsxq"), res = box.querySelector("#pzsxres");
    if (q && res){
      q.addEventListener("click", function(ev){ ev.stopPropagation(); });
      var show = function(){ var t = q.value.trim(); if (!t){ res.innerHTML = ""; return; }
        if (!window.opSearch || !window.OPIDX){ res.innerHTML = '<div class="pz-sxh2">종목 목록 불러오는 중…</div>'; return; }
        var have = {}; (ST.sx || []).forEach(function(x){ have[x.s] = 1; });
        var T = t.toUpperCase(), r0 = opSearch(t) || [], ex = (window.OPIDX || []).filter(function(x){ return x.sym.toUpperCase() === T || x.sym.toUpperCase().replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "") === T; });   // 티커를 정확히 치면 그 종목이 맨 위(SCHD → 찰스 슈왑보다 SCHD ETF)
        var r = ex.concat(r0.filter(function(x){ return ex.indexOf(x) < 0; })).slice(0, 7), FL = window.FLAG || {};
        res.innerHTML = r.length ? r.map(function(x){ var rd = POOL && POOL.assets[x.sym];
          return '<button type="button" data-sxa="' + e(x.sym) + '" data-nm="' + e(x.name) + '" data-mk="' + e(x.mkt || "") + '" data-et="' + (x.etf ? 1 : 0) + '"' + (have[x.sym] ? ' disabled' : '') + '>' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b>' + (x.etf ? ' <span class="gs-etf">ETF</span>' : '') +
            '<small>' + e(x.mkt === "US" ? x.sym : (window.V && V.cd ? V.cd(x.sym) : x.sym)) + (have[x.sym] ? ' · 담음' : rd ? ' · 바로 계산' : ' · 처음이면 15~30분') + '</small></button>'; }).join("")
          : '<div class="pz-sxh2">「' + e(t) + '」 — 못 찾았어요</div>';
        [].forEach.call(res.querySelectorAll("[data-sxa]"), function(y){ var go1 = function(ev){ ev.preventDefault(); ev.stopPropagation(); if (y._done) return; y._done = 1; addOne(y.dataset.sxa, y.dataset.nm, y.dataset.mk, +y.dataset.et); };
          y.onmousedown = go1; y.onclick = go1; });   // 누르는 순간(mousedown) 바로 담음 — 입력칸이 포커스를 잃으며 키보드가 내려가고 화면이 다시 그려져 탭이 빗나가는 일 막기 · 스크롤은 mousedown 이 안 생김
      };
      q.oninput = show; q.onkeydown = function(ev){ if (ev.key === "Enter"){ ev.preventDefault(); var f = res.querySelector("[data-sxa]:not([disabled])"); if (f) f.click(); } };
      q.onfocus = function(){ if (window.opLoadIdx && !window.OPIDX) opLoadIdx().then(show, function(){}); };
    }
    // ⏳ 받는 중인 종목이 있으면 열려 있는 동안 2분마다 다시 확인 → 들어오면 바로 계산
    if ((ST.sx || []).some(function(x){ return !sxReady(x); }) && !SXT) SXT = setInterval(function(){
      var bx = document.getElementById(box.id); if (!bx || !(ST.sx || []).some(function(x){ return !sxReady(x); })){ clearInterval(SXT); SXT = 0; return; }
      var before = ST.sx.filter(sxReady).length; POOLT = 0;
      poolLoad().then(function(){ if (ST.sx.filter(sxReady).length > before){ var b2 = document.getElementById(box.id); if (b2){ draw(b2); calc(); } if (window.P && P.toast) P.toast("➕ 요청한 종목 자료가 들어와 계산에 넣었어요"); } }); }, 120e3);
  }
  var SXT = 0;
  function bind(box){
    [].forEach.call(box.querySelectorAll("input[data-pz]"), function(x){
      var k = x.getAttribute("data-pz");
      var sync = function(){ var v = +x.value, o = 0; ["SPY", "QQQ", "GLD"].forEach(function(j){ if (j !== k) o += ST.w[j]; });
        if (v + o > 100){ v = 100 - o; x.value = v; } ST.w[k] = v; var t = document.getElementById("pzv" + k); if (t) t.textContent = v + "%"; var b = document.getElementById("pzbar"); if (b) b.innerHTML = barH(); };
      x.oninput = sync; x.onchange = function(){ sync(); keep(); calc(); };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); });
    });
    [].forEach.call(box.querySelectorAll("[data-pre]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var p = b.getAttribute("data-pre");
      ST.w = p === "base" ? {SPY: 47.5, QQQ: 47.5, GLD: 5} : p === "spy" ? {SPY: 100, QQQ: 0, GLD: 0} : p === "6040" ? {SPY: 60, QQQ: 0, GLD: 20} : {SPY: MY.spx, QQQ: MY.ndx, GLD: MY.gold};
      if (p === "base"){ ST.reg = 1; ST.vol = 1; }
      var y0 = b.getBoundingClientRect().top; keep(); draw(box); calc(); pin("[data-pre=\"" + p + "\"]", y0); }; });
    [].forEach.call(box.querySelectorAll("[data-tg]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var k = b.getAttribute("data-tg"); ST[k] = ST[k] ? 0 : 1;
      b.classList.toggle("on", !!ST[k]); b.querySelector("b").textContent = ST[k] ? "켬" : "끔"; keep(); calc(); }; });
    bindSx(box);
    [].forEach.call(box.querySelectorAll("[data-bd]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var k = b.getAttribute("data-bd"); ST.bd = ST.bd || {};
      if (ST.bd[k]) delete ST.bd[k]; else { var room = 80 - extW(); if (room < 5){ if (window.P && P.toast) P.toast("종목 + 채권은 합쳐 80%까지예요 — 다른 칸을 줄여 주세요"); return; } ST.bd[k] = Math.min(20, room); }
      var y0 = b.getBoundingClientRect().top; keep(); draw(box); calc(); pin("[data-bd=\"" + k + "\"]", y0); }; });
    [].forEach.call(box.querySelectorAll("input[data-bw]"), function(x){ var k = x.getAttribute("data-bw");
      x.oninput = function(){ var v = +x.value, room = 80 - (extW() - (ST.bd[k] || 0)); if (v > room){ v = Math.max(5, Math.floor(room / 5) * 5); x.value = v; } ST.bd[k] = v; var t = document.getElementById("pzbv" + k); if (t) t.textContent = v + "%"; var bb = document.getElementById("pzbar"); if (bb) bb.innerHTML = barH(); };
      x.onchange = function(){ x.oninput(); keep(); calc(); var sm = box.querySelector(".pz-bd summary b"); if (sm){ var B = bdOn(); sm.textContent = Object.keys(B).map(function(j){ return BDN[j] + " " + B[j] + "%"; }).join(" · "); } };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
    [].forEach.call(box.querySelectorAll("[data-fr]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.from = b.getAttribute("data-fr");
      [].forEach.call(box.querySelectorAll("[data-fr]"), function(x){ x.classList.toggle("on", x === b); }); var di = document.getElementById("pzdate"); if (di) di.value = ""; var f = document.getElementById("pzfrom"); if (f) f.textContent = ""; keep(); calc(); }; });
    var di = document.getElementById("pzdate");
    if (di){ di.addEventListener("click", function(ev){ ev.stopPropagation(); });
      di.onchange = function(){ var v = di.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return; ST.from = v;
        [].forEach.call(box.querySelectorAll("[data-fr]"), function(x){ x.classList.remove("on"); }); var f = document.getElementById("pzfrom"); if (f) f.textContent = v.replace(/-/g, "."); keep(); calc(); }; }
    [].forEach.call(box.querySelectorAll("details.pz-st summary"), function(s){ s.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
    // 💵 넣는 방식 — 계산(엔진)은 그대로, 결과 칸만 다시 그림 · 거치식이면 적립식 칸은 닫힘
    [].forEach.call(box.querySelectorAll("[data-md]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var md = b.getAttribute("data-md"); if (ST.mode === md) return; ST.mode = md; keep(); draw(box); }; });
    var rp = function(){ var r = document.getElementById("pzres"); if (r){ r.innerHTML = result(); bindRes(); } };
    [["pzdm", "dm"], ["pzd0", "d0"], ["pzdd", "dd"]].forEach(function(q){ var el = document.getElementById(q[0]); if (!el) return;
      el.addEventListener("click", function(ev){ ev.stopPropagation(); });
      var f = function(){ var v = Math.max(0, Math.round(+el.value || 0)); if (q[1] === "dm" && !v) return; ST[q[1]] = q[1] === "dd" ? (v || 1) : v; keep(); rp(); };
      el.onchange = f; if (el.tagName === "INPUT") el.oninput = function(){ clearTimeout(el._t); el._t = setTimeout(f, 500); }; });
  }
  window.portDesign = function(box, my){ MY = my && (my.spx + my.ndx + my.gold) > 0 ? my : null; draw(box); };
  // ⚖️ A10/21-3 세 갈래 길이 같은 엔진을 씀: 💼 기본 규칙 n년 굴림 분포
  window.__pdz = {
    ready: function(){ return idx().then(function(){ return Promise.all(ETF.map(px)); }).then(function(ss){ return ss.every(Boolean) ? align({SPY: ss[0], QQQ: ss[1], GLD: ss[2], BIL: ss[3]}) : null; }); },
    panic: function(){ ST.from = ""; ST.last = null; keep(); window.__pdzFocus = 1; window.__pdzPanic = 1; },
    tax: {sim: sim, flowsOf: flowsOf, taxH: taxH, set: function(x){ TXD = x; TXW = Promise.resolve(x); }}, engine: engine, wts: function(){ var w = wts(); return Object.keys(w).some(function(k){ return ETF.indexOf(k) < 0; }) ? null : w; }, cfg: function(){ return {reg: ST.reg, vol: ST.vol, w: ST.w, st: "", stw: 0, sx: sxOn().map(function(x){ return {s: x.s, n: x.n, m: x.m, e: x.e, w: x.w}; }), bd: bdOn()}; }
  };

  /* 📄 종목 화면: 「💼 이 종목 5% 넣어 보면」 — 11/18 모든 종목·ETF 로 넓힘(자료가 없으면 요청) */
  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){
    return OLD(sym).then(function(h){
      var s = String(sym || "").trim(); if (!s) return h;
      setTimeout(function(){ var el = document.getElementById("opsig"); if (!el || el.querySelector(".pz-go")) return;
        var r = window.opFind ? opFind(s) : null; if (r && r.sym) s = r.sym;
        var b = document.createElement("button"); b.className = "pz-go"; b.type = "button";
        b.innerHTML = '💼 이 종목 5% 넣어 보면 <small>포트 설계기 · 2008년부터 다시 계산 ›</small>';
        b.onclick = function(ev){ ev.stopPropagation();
          var nm = r && r.name || s, mk = r && r.mkt || "", hit = (ST.sx || []).filter(function(x){ return x.s === s; })[0];
          if (!hit){ if ((ST.sx || []).length >= SXMAX) ST.sx.shift(); var room = 80 - extW(); if (room < 5) ST.bd = {};
            ST.sx.push({s: s, n: nm, m: mk, e: r && r.etf ? 1 : 0, w: 5}); poolLoad().then(function(){ if (!(POOL && POOL.assets[s])) sxReq({s: s, n: nm}); }); }
          ST.sxo = 1; ST.last = null; keep(); window.__pdzFocus = 1; if (window.go) go("port"); };
        el.appendChild(b); }, 80);
      return h;
    });
  };


  var css = document.createElement("style");
  css.textContent =
    ".pz-sub{margin:-2px 0 8px;font-size:12.5px;color:var(--sub)}.pz-pre{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px}" +
    ".pz-pre button,.pz-sc button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-sc{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.pz-sc button small{margin-left:3px;font-size:12.5px;color:var(--sub)}.pz-sc button.on{background:#d55181;color:#fff;border-color:transparent;font-weight:700}.pz-sc button.on small{color:#fde}" +
    ".pz-sl{display:flex;align-items:center;gap:10px;margin:2px 0;font-size:13px}.pz-sl span{min-width:118px;display:flex;align-items:center;gap:5px}.pz-sl span i{width:9px;height:9px;border-radius:2px;display:inline-block}.pz-sl input{flex:1;accent-color:#e9c46a;height:30px}" +
    ".pz-bar{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:1px;margin:6px 0 3px}.pz-lg{font-size:12.5px;color:var(--sub)}" +
    ".pz-dt{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed var(--line)}.pz-dth{font-size:13px;font-weight:700}.pz-dth .mut{font-weight:400;font-size:12.5px}.pz-dth b{color:#e9c46a}" +
    ".pz-dc{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.pz-dc button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}.pz-dc button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:700}" +
    ".pz-di{display:flex;align-items:center;gap:8px;font-size:12.5px;flex-wrap:wrap}.pz-di input{font:inherit;font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.pz-di small{font-size:12.5px;color:var(--sub)}" +
    ".pz-per{font-size:14px;margin:0 0 8px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#e9c46a 12%,var(--panel2))}.pz-per b{font-variant-numeric:tabular-nums}.pz-per b.up{color:var(--up)}.pz-per b.dn{color:var(--down)}.pz-per span{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pz-tg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0 4px}.pz-tg button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:10px;padding:8px 6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-tg button b{display:block;font-size:12.5px}.pz-tg button.on{border-color:#e9c46a;color:var(--text);background:color-mix(in srgb,#e9c46a 14%,var(--panel2))}.pz-tg button.on b{color:#e9c46a}" +
    ".pz-st{margin:8px 0 0;font-size:13px}.pz-st summary{cursor:pointer;color:var(--sub)}.pz-st summary b{color:var(--text)}" +
    ".pz-md{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed var(--line)}.pz-dcf{display:grid;gap:7px;margin:4px 0 2px;font-size:13.5px}.pz-dcf label{display:flex;align-items:center;gap:6px;flex-wrap:wrap}" +
    ".pz-dcf input,.pz-dcf select{font:inherit;font-size:16px;width:110px;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.pz-dcf select{width:auto}.pz-dcf small,.pz-dcn{font-size:12.5px;color:var(--sub)}" +
    ".pz-dca .pz-big b{font-size:19px;white-space:nowrap}.pz-sel{font-size:14px;font-weight:800;margin:6px 0 6px;padding-top:8px;border-top:1px dashed var(--line)}.pz-sel .mut{font-weight:400;font-size:12.5px}.pz-dca{margin:0 0 10px}.pz-dcah{font-size:14px;font-weight:800;margin:0 0 6px}.pz-dcah .mut{display:block;font-weight:400;font-size:12.5px}.pz-li{fill:none;stroke:#8a94a8;stroke-width:1.4}.pz-key i.i{background:#8a94a8}" +
    ".pz-res{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".pz-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.pz-big>div{background:var(--panel2);border-radius:10px;padding:8px 6px;text-align:center}.pz-big small,.pz-big em{display:block;font-size:12.5px;color:var(--sub);font-style:normal}" +
    ".pz-big b{display:block;font-size:22px;font-variant-numeric:tabular-nums;margin:1px 0}.pz-big b.up,.pz-in b.up,.pz-dl b.up{color:var(--up)}.pz-big b.dn,.pz-in b.dn,.pz-dl b.dn{color:var(--down)}" +
    ".pz-dl{font-size:12.5px;color:var(--sub);margin:6px 0 0}.pz-won{margin:10px 0 2px;font-size:14px}.pz-won b{font-size:17px}.pz-won small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pz-cv{width:100%;height:auto;display:block;margin:4px 0 0}.pz-gl{stroke:var(--line);stroke-width:1}.pz-gt{fill:var(--sub);font-size:9.5px}.pz-ls{fill:none;stroke:#7c9cff;stroke-width:1.4;stroke-dasharray:3 2;opacity:.85}.pz-lm{fill:none;stroke:#e9c46a;stroke-width:2.2}.pz-dm{fill:#e9c46a}" +
    ".pz-key{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:2px 0 8px}.pz-key i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:4px;vertical-align:middle}.pz-key i.m{background:#e9c46a}.pz-key i.s{background:#7c9cff}" +
    ".pz-in{font-size:13px;padding:7px 9px;border-radius:9px;background:var(--panel2);margin:5px 0}.pz-in small{display:block;font-size:12.5px;color:var(--sub);margin-top:1px}" +
    ".pz-yr{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:3px;margin-top:8px}.pz-yr>div{border-radius:6px;padding:3px 0;text-align:center;cursor:pointer}.pz-yr small{display:block;font-size:12.5px;color:var(--sub)}.pz-yr b{font-size:12.5px;font-variant-numeric:tabular-nums}" +
    ".pz-ms{margin:8px 0 0;font-size:12.5px}.pz-ok{color:#3fb950}" +
    ".pz-pn{fill:none;stroke-width:1.3;stroke-dasharray:4 3}.pz-pn0{stroke:#ff8fa3}.pz-pn1{stroke:#c77dff}.pz-pn2{stroke:#8a94a8}.pz-pnd{fill:none;stroke:#ff6b6b;stroke-width:2}.pz-pnt{fill:#ff6b6b;font-size:10px;font-weight:700}" +
    ".pz-key i.p{background:repeating-linear-gradient(90deg,#ff8fa3 0 4px,transparent 4px 7px)}" +
    ".pz-pnx{margin:10px 0 4px;padding:10px;border-radius:12px;background:color-mix(in srgb,#ff6b6b 9%,var(--panel2))}.pz-pnh{font-size:14.5px;font-weight:800}.pz-pnh .mut{font-weight:400;font-size:12.5px}" +
    ".pz-pnc{display:flex;flex-wrap:wrap;gap:5px;margin:7px 0}.pz-pnc button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:4px 9px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;text-align:center}.pz-pnc button small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}.pz-pnc button.on{background:#ff6b6b;color:#fff;border-color:transparent}.pz-pnc button.on small{color:#ffe}" +
    ".pz-pns{font-size:12.5px;color:var(--sub);margin:2px 0 6px;word-break:keep-all}.pz-pns b{color:var(--text)}" +
    ".pz-pnr{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:baseline;padding:6px 0;border-top:1px solid var(--line);font-size:13px}.pz-pnr b{font-size:16px;font-variant-numeric:tabular-nums;white-space:nowrap}.pz-pnr b.up{color:var(--up)}.pz-pnr b.dn{color:var(--down)}.pz-pnr em{font-style:normal;font-size:12.5px;color:var(--sub);white-space:nowrap;min-width:46px;text-align:right}" +
    ".pz-pk{display:inline-block;width:12px;height:0;border-top:2px dashed;margin-right:5px;vertical-align:middle}.pz-pk0{color:#ff8fa3}.pz-pk1{color:#c77dff}.pz-pk2{color:#8a94a8}.pz-pnb{font-weight:700;grid-template-columns:auto 1fr}.pz-pnb span{grid-column:1/-1}.pz-pnb em{text-align:left}" +
    ".pz-tx{margin:12px 0 6px;padding:10px;border-radius:12px;background:color-mix(in srgb,#3fb950 7%,var(--panel2));border:1px solid color-mix(in srgb,#3fb950 25%,var(--line))}" +
    ".pz-tx>summary{cursor:pointer;list-style:none;display:flex;flex-direction:column;gap:2px}.pz-tx>summary::-webkit-details-marker{display:none}.pz-tx>summary>b{font-size:15px}.pz-tx>summary>b::after{content:' ›';color:var(--sub);font-weight:400}.pz-tx[open]>summary>b::after{content:' ⌄'}" +
    ".pz-tx>summary span{font-size:13px;color:var(--sub)}.pz-tx>summary span b{font-size:15px;font-variant-numeric:tabular-nums}.pz-tx b.up{color:var(--up)}.pz-tx b.dn{color:var(--down)}.pz-tx>summary small{font-size:12.5px;margin-left:4px}" +
    ".pz-txt{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0 8px}.pz-txt button{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:10px;padding:8px 6px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;word-break:keep-all}.pz-txt button small{display:block;font-weight:400;font-size:12px}" +
    ".pz-txt button.on{background:#3fb950;color:#fff;border-color:transparent}.pz-txt button.on small{color:#e8ffe9}" +
    ".pz-txk{font-size:12.5px;margin:0 0 6px}.pz-txk>span{display:block;color:var(--sub);margin-bottom:4px}.pz-txk>span small{font-size:12px}.pz-txk>div{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}" +
    ".pz-txk button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;padding:4px 2px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums}.pz-txk button small{display:block;font-weight:400;font-size:11.5px;color:var(--sub)}.pz-txk button.on{background:#e9c46a;color:#111;border-color:transparent}.pz-txk button.on small{color:#4a3d10}" +
    ".pz-txo{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;margin:6px 0}.pz-txo input{font:inherit;font-size:16px;width:96px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--text);color-scheme:light dark}.pz-txo small{width:100%;font-size:12px;color:var(--sub)}" +
    ".pz-txp{font-size:12.5px;color:var(--sub);margin:8px 0 4px}" +
    ".pz-txu{display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;gap:4px;background:var(--panel);border-radius:10px;padding:7px 6px;text-align:center;margin:0 0 8px}.pz-txu>div{min-width:0}.pz-txu small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all;line-height:1.3}.pz-txu b{font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.pz-txu .op{color:var(--sub);font-weight:700}" +
    ".pz-txg{display:grid;grid-template-columns:1fr 1fr;gap:6px}.pz-txc{background:var(--panel);border-radius:11px;padding:9px 8px;border:1.5px solid transparent;min-width:0}.pz-txc.win{border-color:#e9c46a}" +
    ".pz-txn{font-size:13.5px;font-weight:800;word-break:keep-all}.pz-txn small{display:block;font-weight:400;font-size:11.5px;color:var(--sub);margin-top:1px}.pz-txw{display:inline-block;font-size:11px;font-weight:700;background:#e9c46a;color:#111;border-radius:999px;padding:0 6px;vertical-align:1px}" +
    ".pz-txv{margin:7px 0 2px}.pz-txv small{display:block;font-size:11.5px;color:var(--sub)}.pz-txv b{font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".pz-txr{display:flex;align-items:baseline;gap:5px;flex-wrap:wrap;font-size:12px;color:var(--sub)}.pz-txr b{font-size:18px;font-variant-numeric:tabular-nums}.pz-txr em{font-style:normal}" +
    ".pz-txb{position:relative;display:flex;height:9px;border-radius:5px;overflow:hidden;background:color-mix(in srgb,var(--line) 60%,transparent);margin:7px 0 5px}.pz-txb i{display:block;height:100%}.pz-txb i.n,.pz-txkey i.n{background:#e9c46a}.pz-txb i.t,.pz-txkey i.t{background:#ff6b6b}.pz-txb i.f,.pz-txkey i.f{background:#8a94a8}" +
    ".pz-txb em{position:absolute;top:-1px;bottom:-1px;width:2px;background:var(--text);opacity:.7}.pz-txkey i.e{background:var(--text);width:2px!important;opacity:.7}" +
    ".pz-txl{display:flex;justify-content:space-between;gap:4px;font-size:12px;color:var(--sub);padding:2px 0;border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.pz-txl small{font-size:11px}.pz-txl b{font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--text)}.pz-txl b.up{color:var(--up)}.pz-txl b.dn{color:var(--down)}.pz-txl.tot{font-weight:700}" +
    ".pz-txkey{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;color:var(--sub);margin:6px 0 2px}.pz-txkey i{display:inline-block;width:12px;height:8px;border-radius:2px;margin-right:4px;vertical-align:middle}" +
    ".pz-txwin{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#e9c46a 16%,var(--panel));font-size:13.5px;word-break:keep-all}.pz-txwin small{display:block;font-size:12px;color:var(--sub)}" +
    ".pz-txx{margin:6px 0 0;padding:7px 9px;border-radius:9px;background:color-mix(in srgb,#ff6b6b 10%,var(--panel));font-size:12.5px;word-break:keep-all}.pz-txx.ok{background:color-mix(in srgb,#3fb950 10%,var(--panel))}.pz-txnote{margin:8px 0 0;font-size:12px;word-break:keep-all}" +
    "@media (max-width:370px){.pz-txg{grid-template-columns:1fr}.pz-txk>div{grid-template-columns:repeat(2,1fr)}}" +
    ".pz-bd .pz-sc button.on{background:#1f9e8f}.pz-bd .pz-sc button.on small{color:#dff7f3}.pz-bd .pz-sc button small{display:block;margin:1px 0 0;font-size:11.5px}.pz-bd summary .mut{font-size:12.5px}" +
    ".pz-go{display:block;width:100%;text-align:left;margin:8px 0 0;border:1px dashed #e9c46a;background:color-mix(in srgb,#e9c46a 10%,var(--panel));color:var(--text);border-radius:10px;padding:9px 11px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}.pz-go small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}" +
    ".pz-sxq{position:relative;margin:4px 0 6px}.pz-sxq input{width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text)}" +
    ".pz-sxres{display:flex;flex-direction:column;gap:4px;margin-top:4px}.pz-sxres button{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px;text-align:left;font:inherit;font-size:14px;padding:8px 10px;border-radius:9px;border:1px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer}" +
    ".pz-sxres button small{flex-basis:100%;font-size:12px;color:var(--sub)}.pz-sxres button[disabled]{opacity:.5}.pz-sxh2{font-size:13px;color:var(--sub);padding:4px 2px}" +
    ".pz-sxqk{margin:0 0 6px}.pz-sxr{margin:6px 0;padding:8px 10px 6px;border-radius:10px;background:color-mix(in srgb,var(--text) 4%,var(--panel))}.pz-sxr.wait{opacity:.85}" +
    ".pz-sxh{display:flex;align-items:center;gap:8px}.pz-sxh>i{flex:none;width:10px;height:10px;border-radius:3px}.pz-sxh>span{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.2}.pz-sxh>span b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".pz-sxh>span .tk{font-style:normal;font-size:11.5px;color:var(--sub)}.pz-sxv{flex:none;font-size:15px}.pz-sxx{flex:none;border:0;background:none;color:var(--sub);font-size:16px;padding:4px 6px;cursor:pointer}" +
    ".pz-sxr input[type=range]{width:100%;margin:4px 0 0}.pz-sxr small{display:block;font-size:12px;color:var(--sub);word-break:keep-all}.pz-sxwait{color:#c99a1a!important}.pz-sxbad{color:#d9534f!important}" +
    ".pz-sxbad button{border:1px solid currentColor;background:none;color:inherit;border-radius:7px;font:inherit;font-size:11.5px;padding:1px 7px;margin-left:4px;cursor:pointer}";
  document.head.appendChild(css);
})();
;
__bk(49);
/* ======== twin.js ======== */
/* 🧲 오늘과 닮은 날 — 과거 쌍둥이 5일 · 10/21 A10/21-2 (사용자 「다 좋다 다 진행해」)
   🎲 시장확률 › 🇰🇷 한국 카드의 「상태 한 줄」 자리를 바꿔 끼움: 오늘 모양(오늘 등락 · 전날 등락 · 5일 · 어제까지 20일 · 200일선 · 흔들림)과
   조건이 가장 많이 겹치는 2000년 이후 날짜 5개 + 「그날 → 20거래일 뒤」 코스피 선 5개를 겹쳐 그림 + 5일 중 몇 번 올랐나·최악.
   날짜를 누르면 그 날짜 한 줄(그 무렵 큰 사건 — 아래 EV 표, 모르면 비움).
   자료: archive/x/port_px/KOSPI.json(port_px.py · ^KS11 2000~ 종가) + 장중이면 prob.json 의 지금 등락(liveFix 뒤 m.intra_chg).
   원칙: 「닮은 정도 %」는 안 씀 — 조건 6개 중 몇 개가 같은지만. 같은 시기 날짜가 몰리지 않게 20거래일 띄움. 과거 이야기 · 미래 보장 아님. */
(function(){
  var KP = null, KW = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function load(){
    if (!KW) KW = getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return getJSON("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), {ttl: 3600e3});
    }).then(function(j){
      if (!j || !j.dd) return null;
      var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(day2s(t)); c.push(+j.c[i]); }
      KP = {d: d, c: c}; return KP;
    }).catch(function(){ return null; });
    return KW;
  }
  // 그 무렵 큰 사건 (달 단위 · 확실한 것만)
  var EV = {"2000-04": "닷컴 거품 붕괴 — 기술주 급락", "2000-05": "닷컴 거품 붕괴", "2001-09": "9·11 테러", "2003-03": "이라크 전쟁 개전", "2004-04": "중국 긴축 쇼크",
    "2004-05": "중국 긴축 쇼크", "2006-05": "신흥국 급락(미 금리 인상 우려)", "2006-06": "신흥국 급락(미 금리 인상 우려)", "2007-02": "중국 상하이 급락(2·27)", "2007-03": "중국 급락 뒤",
    "2007-08": "서브프라임 사태 시작", "2008-01": "서브프라임 확산 · 세계 증시 급락", "2008-09": "리먼 브러더스 파산", "2008-10": "금융위기 한가운데", "2008-11": "금융위기", "2008-12": "금융위기",
    "2009-03": "금융위기 바닥", "2010-05": "그리스 재정위기 · 플래시 크래시", "2010-11": "연평도 포격", "2011-08": "미국 신용등급 강등", "2011-09": "유럽 재정위기", "2011-10": "유럽 재정위기",
    "2013-06": "버냉키 「테이퍼」 발언", "2015-08": "중국 위안화 절하 충격", "2016-01": "중국 증시 급락 · 유가 폭락", "2016-02": "유가 바닥", "2016-06": "브렉시트 투표",
    "2016-11": "미국 대선(트럼프 당선)", "2018-02": "미국 변동성 급등", "2018-10": "미·중 무역분쟁 · 미 금리 급등", "2019-08": "미·중 무역분쟁 격화", "2020-02": "코로나 폭락 시작",
    "2020-03": "코로나 폭락", "2020-04": "코로나 뒤 반등", "2022-06": "미 물가 급등 · 금리 인상 가속", "2022-09": "강달러 · 영국 국채 혼란", "2023-03": "실리콘밸리은행 파산",
    "2024-08": "엔 캐리 청산 폭락(8·5)", "2024-12": "비상계엄 사태", "2025-04": "미국 상호관세 충격"};
  function feats(c, i){
    if (i < 251) return null;
    var r = function(a, b){ return (c[a] / c[b] - 1) * 100; }, s = 0;
    for (var k = i - 199; k <= i; k++) s += c[k];
    var sd = function(n){ var m = 0, q = 0, x; for (var k = i - n + 1; k <= i; k++) m += c[k] / c[k - 1] - 1; m /= n; for (var k2 = i - n + 1; k2 <= i; k2++){ x = c[k2] / c[k2 - 1] - 1 - m; q += x * x; } return Math.sqrt(q / (n - 1)); };
    return {r1: r(i, i - 1), r0: r(i - 1, i - 2), r5: r(i, i - 5), r20: r(i - 1, i - 21), up200: c[i] > s / 200, vr: sd(20) / sd(250)};
  }
  var CONDS = [
    ["r1", "오늘", function(a, b){ return a.r1 * b.r1 > 0 && Math.abs(a.r1 - b.r1) <= Math.max(1, 0.35 * Math.abs(a.r1)); }, function(f){ return sg(f.r1) + "%"; }],
    ["r0", "전날", function(a, b){ return a.r0 * b.r0 > 0 && Math.abs(a.r0 - b.r0) <= Math.max(1, 0.35 * Math.abs(a.r0)); }, function(f){ return sg(f.r0) + "%"; }],
    ["r5", "5일", function(a, b){ return Math.abs(a.r5 - b.r5) <= Math.max(2.5, 0.3 * Math.abs(a.r5)); }, function(f){ return sg(f.r5) + "%"; }],
    ["r20", "어제까지 20일", function(a, b){ return Math.abs(a.r20 - b.r20) <= Math.max(4, 0.3 * Math.abs(a.r20)); }, function(f){ return sg(f.r20) + "%"; }],
    ["up200", "200일선", function(a, b){ return a.up200 === b.up200; }, function(f){ return f.up200 ? "위" : "아래"; }],
    ["vr", "흔들림", function(a, b){ return Math.abs(a.vr - b.vr) <= Math.max(0.25, 0.3 * a.vr); }, function(f){ return "평소 ×" + f.vr.toFixed(1); }]];
  function dist(a, b){ return Math.abs(a.r1 - b.r1) / 2 + Math.abs(a.r0 - b.r0) / 2 + Math.abs(a.r5 - b.r5) / 5 + Math.abs(a.r20 - b.r20) / 8 + Math.abs(a.vr - b.vr) * 2 + (a.up200 === b.up200 ? 0 : 2); }
  function find(m){
    var d = KP.d.slice(), c = KP.c.slice(), live = false;
    // 오늘 봉: 장중이면 마지막 마감(base_date) 뒤를 지우고 지금 값으로 · 마감 뒤엔 파일 그대로(늦으면 prob 의 마감 값 붙임)
    var bd = m.base_date || d[d.length - 1];
    while (d.length && d[d.length - 1] > bd){ d.pop(); c.pop(); }
    if (d[d.length - 1] === bd && m.last) c[c.length - 1] = +m.last;
    else if (d[d.length - 1] < bd && m.last){ d.push(bd); c.push(+m.last); }
    if (m.open_now && m.intra_chg != null){ d.push(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)); c.push(c[c.length - 1] * (1 + m.intra_chg / 100)); live = true; }
    var T = c.length - 1, ft = feats(c, T); if (!ft) return null;
    var cand = [];
    for (var i = 251; i <= T - 21; i++){ var f = feats(c, i), n = 0, hit = {};
      CONDS.forEach(function(q){ if (q[2](ft, f)){ n++; hit[q[0]] = 1; } });
      if (n >= 3) cand.push({i: i, n: n, dx: dist(ft, f), f: f, hit: hit}); }
    cand.sort(function(a, b){ return b.n - a.n || a.dx - b.dx; });
    var pick = [];
    for (var j = 0; j < cand.length && pick.length < 5; j++){ var x = cand[j]; if (pick.every(function(p){ return Math.abs(p.i - x.i) >= 20; })) pick.push(x); }
    pick.forEach(function(p){ p.d = d[p.i]; p.path = []; for (var k = 0; k <= 20; k++) p.path.push((c[p.i + k] / c[p.i] - 1) * 100); p.r5 = p.path[5]; p.r20 = p.path[20]; });
    return {ft: ft, live: live, today: d[T], pick: pick, n: T - 271};
  }
  var COL = ["#e9c46a", "#f4a261", "#7c9cff", "#3dd6c6", "#d55181"];
  function svg(R){
    var W = 340, H = 140, lo = 0, hi = 0;
    R.pick.forEach(function(p){ p.path.forEach(function(v){ if (v < lo) lo = v; if (v > hi) hi = v; }); });
    lo = Math.floor(lo / 5) * 5 - 1; hi = Math.ceil(hi / 5) * 5 + 1;
    var X = function(k){ return 26 + (W - 70) * k / 20; }, Y = function(v){ return 8 + (H - 26) * (hi - v) / (hi - lo); };
    var g = "";
    for (var v = Math.ceil(lo / 5) * 5; v <= hi; v += 5){ g += '<line x1="26" x2="' + (W - 44) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" class="tw-gl' + (v === 0 ? " z" : "") + '"/><text x="22" y="' + (Y(v) + 3).toFixed(1) + '" class="tw-gt" text-anchor="end">' + (v > 0 ? "+" : "") + v + '</text>'; }
    [0, 5, 10, 15, 20].forEach(function(k){ g += '<text x="' + X(k).toFixed(1) + '" y="' + (H - 3) + '" class="tw-gt" text-anchor="middle">' + (k ? k + '일' : '그날') + '</text>'; });
    var ls = R.pick.map(function(p, i){ return '<path d="' + p.path.map(function(v, k){ return (k ? "L" : "M") + X(k).toFixed(1) + "," + Y(v).toFixed(1); }).join("") + '" stroke="' + COL[i] + '" class="tw-l" data-tw="' + i + '"/>' +
      '<text x="' + (X(20) + 4).toFixed(1) + '" y="' + (Y(p.path[20]) + 3).toFixed(1) + '" fill="' + COL[i] + '" class="tw-et">' + sg(p.path[20], 0) + '</text>'; }).join("");
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="tw-sv" role="img" aria-label="닮은 날 5개의 그 뒤 20거래일 코스피">' + g + ls + '</svg>';
  }
  function html(R){
    var ft = R.ft, P = R.pick;
    if (!P.length) return '<p class="note">조건 3개 넘게 겹치는 과거 날이 없어요 — 오늘은 2000년 이후 처음 보는 모양이에요.</p>';
    var up20 = P.filter(function(p){ return p.r20 > 0; }).length, avg = P.reduce(function(a, p){ return a + p.r20; }, 0) / P.length, worst = P.slice().sort(function(a, b){ return a.r20 - b.r20; })[0], best = P.slice().sort(function(a, b){ return b.r20 - a.r20; })[0];
    var up5 = P.filter(function(p){ return p.r5 > 0; }).length, yrs = {}; P.forEach(function(p){ yrs[p.d.slice(0, 4)] = 1; });
    return '<div class="tw-h">🧲 <b>오늘과 닮은 날</b> <span class="mut">2000년 이후 코스피 · 조건 6개 중 많이 겹치는 순 · ' + (R.live ? '지금 장중 값' : R.today.slice(5).replace("-", "/") + ' 마감') + ' 기준</span></div>' +
      '<div class="tw-cd">' + CONDS.map(function(q){ return '<span><small>' + q[1] + '</small>' + q[3](ft) + '</span>'; }).join("") + '</div>' +
      svg(R) +
      '<div class="tw-sum">20거래일 뒤 <b>' + P.length + '번 중 ' + up20 + '번 오름</b> · 평균 <b class="' + cl(avg) + '">' + sg(avg) + '%</b> · 최악 <b class="dn">' + sg(worst.r20) + '%</b>(' + worst.d.slice(2).replace(/-/g, ".") + ') · 최고 <b class="up">' + sg(best.r20) + '%</b>' +
        '<small>5거래일 뒤로는 ' + up5 + '번 오름' + (Object.keys(yrs).length === 1 ? ' · ⚠️ 5개가 다 ' + Object.keys(yrs)[0] + '년 — 표본 한 해' : '') + '</small></div>' +
      '<div class="tw-ls">' + P.map(function(p, i){ var ev = EV[p.d.slice(0, 7)];
        return '<button class="tw-r" data-tw="' + i + '"><i style="background:' + COL[i] + '"></i><span class="tw-d"><b>' + p.d.replace(/-/g, ".") + '</b><small>' + p.n + '/6 같음' + (ev ? ' · ' + e(ev) : '') + '</small></span>' +
          '<span class="tw-v"><small>5일</small><b class="' + cl(p.r5) + '">' + sg(p.r5) + '</b></span><span class="tw-v"><small>20일</small><b class="' + cl(p.r20) + '">' + sg(p.r20) + '</b></span></button>' +
          '<div class="tw-x" data-twx="' + i + '" hidden>그날 ' + CONDS.map(function(q){ return '<span class="' + (p.hit[q[0]] ? "y" : "n") + '">' + q[1] + ' ' + q[3](p.f) + '</span>'; }).join("") + '</div>'; }).join("") + '</div>' +
      '<p class="note tw-n">「닮음」은 조건 일치 개수일 뿐이에요 — 날짜 5개라 표본이 작고, 과거 이야기일 뿐 다음을 보장하지 않아요 · 줄을 누르면 그날 조건(같은 것 굵게).</p>';
  }
  window.twinKR = function(box, m){
    if (!box) return;
    box.innerHTML = '<div class="loading">닮은 날 찾는 중…</div>';
    load().then(function(K){
      if (!K){ box.innerHTML = '<p class="note pr-st">' + e(m.state || "") + '</p>'; return; }
      var R = null; try { R = find(m); } catch(x) { console.warn(x); }
      if (!R){ box.innerHTML = '<p class="note pr-st">' + e(m.state || "") + '</p>'; return; }
      box.innerHTML = html(R);
      [].forEach.call(box.querySelectorAll(".tw-r"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var i = b.getAttribute("data-tw"), x = box.querySelector('[data-twx="' + i + '"]'), on = x.hidden;
        x.hidden = !on; b.classList.toggle("on", on);
        [].forEach.call(box.querySelectorAll("path.tw-l"), function(p){ p.classList.toggle("dim", on && p.getAttribute("data-tw") !== i); }); }; });
    });
  };
  var css = document.createElement("style");
  css.textContent =
    ".tw-h{font-size:13.5px;margin:12px 0 6px}.tw-h .mut{font-size:12.5px}" +
    ".tw-cd{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:0 0 6px}.tw-cd span{background:var(--panel2);border-radius:8px;padding:4px 6px;font-size:12.5px;font-weight:700;font-variant-numeric:tabular-nums}.tw-cd small{display:block;font-size:12.5px;font-weight:400;color:var(--sub)}" +
    ".tw-sv{width:100%;height:auto;display:block}.tw-gl{stroke:var(--line);stroke-width:1}.tw-gl.z{stroke:var(--sub);stroke-dasharray:3 3}.tw-gt{fill:var(--sub);font-size:9.5px}.tw-l{fill:none;stroke-width:2;transition:opacity .15s}.tw-l.dim{opacity:.15}.tw-et{font-size:12.5px;font-weight:700}" +
    ".tw-sum{font-size:13px;margin:4px 0 6px}.tw-sum b.up{color:var(--up)}.tw-sum b.dn{color:var(--down)}.tw-sum small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".tw-r{display:flex;align-items:center;gap:8px;width:100%;border:0;border-top:1px solid var(--line);background:none;color:var(--text);font:inherit;text-align:left;padding:7px 0;cursor:pointer}.tw-r i{width:10px;height:10px;border-radius:50%;flex:none}" +
    ".tw-d{flex:1;min-width:0}.tw-d b{font-size:13px;font-variant-numeric:tabular-nums}.tw-d small{display:block;font-size:12.5px;color:var(--sub)}.tw-v{width:56px;text-align:right}.tw-v small{display:block;font-size:12.5px;color:var(--sub)}.tw-v b{font-size:13px;font-variant-numeric:tabular-nums}" +
    ".tw-v b.up{color:var(--up)}.tw-v b.dn{color:var(--down)}.tw-x{font-size:12.5px;color:var(--sub);padding:0 0 7px 18px}.tw-x span{margin-right:6px}.tw-x span.y{color:var(--text);font-weight:700}.tw-n{margin:6px 0 0}";
  document.head.appendChild(css);
})();
;
__bk(50);
/* ======== threeway.js ======== */
/* ⚖️ 같은 돈, 세 갈래 길 — 채권·ELS·포트 3년 경주 · 10/21 A10/21-3 (사용자 「다 좋다 다 진행해」)
   🛍 상품 탭(채권·펀드·ELS) 맨 위 카드 하나: 같은 투자금을 3년 동안
     🇰🇷 채권 = 지금 파는 「매우 낮은 위험」 국채·공사채 중 남은 만기가 3년에 가장 가까운 것의 매수수익률(세전)로 → 금액 한 점
     🎯 ELS = 🎛 ELS 설계기 조건 그대로, 2006년부터 매 거래일 가입한 셈(els_design.js 엔진) × 그 조건에 가장 가까운 실제 청약 상품의 연 수익률
            일찍 끝나면 남은 기간은 위 채권 금리로 굴린 셈 · 만기에 손실이 아니면 원금만(더미 쿠폰은 안 넣음 — 보수적으로)
     💼 포트 = 🎛 포트 설계기 비중 + 💼 기본 규칙(port_design.js 엔진), 2008년부터 모든 3년(756거래일) 구간 · 달러 기준(환율 빼고)
   → 3년 뒤 금액의 범위(최악 · 열에 하나 · 가운데 · 열에 아홉 · 최고)를 같은 눈금에 나란히.
   투자금은 💼 포트 주문서와 같은 칸(portSet.amt)을 씀. 원칙: 실제 상품 값만 · 지어내지 않음 · 과거 계산 · 보장 아님 · 세금·수수료 전 · 사라는 말 없음. */
(function(){
  var H = 3, OPEN = 1, BOX = null, DATA = null, PORT = null, ELS = null, BUSY = 0;
  try { var o = localStorage.getItem("tw3open"); if (o != null) OPEN = +o; } catch(x) {}
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function getAmt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function setAmt(v){ try { var s = JSON.parse(localStorage.getItem("portSet") || "{}"); s.amt = v; localStorage.setItem("portSet", JSON.stringify(s)); } catch(x) {} }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 2).replace(/\.?0+$/, "") + "억" : Math.round(m).toLocaleString() + "만"; }
  function q(arr, p){ var i = (arr.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return arr[lo] + (arr[hi] - arr[lo]) * (i - lo); }
  function sum5(a){ a = a.slice().sort(function(x, y){ return x - y; }); return {min: a[0], p10: q(a, 0.1), p50: q(a, 0.5), p90: q(a, 0.9), max: a[a.length - 1], loss: a.filter(function(v){ return v < 0.9995; }).length / a.length * 100, n: a.length}; }

  function bond(D){
    var L = (D.krw || []).filter(function(r){ return /매우낮은/.test(r.risk || "") && (r.kind === "국채" || r.kind === "공사채·지방채") && r.buy > 0; })
      .map(function(r){ return {r: r, y: r.yrs + r.days / 365}; }).filter(function(x){ return x.y >= 2.5 && x.y <= 3.6; });
    L.sort(function(a, b){ return Math.abs(a.y - H) - Math.abs(b.y - H) || (a.r.kind === "국채" ? -1 : 1); });
    var b = L[0]; return b ? {name: b.r.name, kind: b.r.kind, y: b.r.buy, after: b.r.after, yrs: b.y, end: Math.pow(1 + b.r.buy / 100, H)} : null;
  }
  function portDist(){
    if (!window.__pdz) return Promise.resolve(null);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var c = __pdz.cfg(), w = __pdz.wts() || {SPY: .475, QQQ: .475, GLD: .05, BIL: 0};
      var r = __pdz.engine(A, w, {reg: c.reg, vol: c.vol, start: "2007-06-01"}); if (!r) return null;
      var N = r.nv.length, L = 756, ends = [];
      for (var i = 0; i + L < N; i++) ends.push(r.nv[i + L] / r.nv[i]);
      var s = sum5(ends); s.from = r.from; s.w = w; s.reg = c.reg; s.vol = c.vol; s.custom = !!__pdz.wts() && !(Math.abs(w.SPY - .475) < 1e-6 && Math.abs(w.QQQ - .475) < 1e-6 && Math.abs(w.GLD - .05) < 1e-6);
      return s;
    });
  }
  function elsDist(yb){
    var Z = window.__elsDz, API = window.__elsApi; if (!Z || !API) return Promise.resolve(null);
    return Promise.all([Z.ready(), API.load ? API.load() : null]).then(function(){ return Z.run(); }).then(function(st){
      if (!st || !st.raw) return {err: "설계기 조건으로 재생할 수 없어요(기초자산 일봉 부족)."};
      var nr = Z.near(), p = nr && nr[0]; if (!p || p.cpn == null) return {err: "이 조건과 비슷한 지금 청약 중 상품이 없어 연 수익률을 못 정해요 — 🎛 설계에서 조건을 바꿔 보세요."};
      var S = Z.st(), cyc = S.cyc, n = Z.bars().length, mat = n * cyc / 12, R = st.raw, cp = +p.cpn / 100, g = 1 + yb / 100, ends = [];
      for (var j = 0; j < R.done.length; j++){
        var k = R.done[j], amt, t;
        if (k >= 0){ t = (k + 1) * cyc / 12; amt = 1 + cp * t; }
        else { t = mat; var lossy = R.hasKi ? R.ki[j] : true; amt = lossy ? R.last[j] : 1; }
        ends.push(amt * Math.pow(g, Math.max(0, H - t)));
      }
      var s = sum5(ends); s.cpn = +p.cpn; s.iss = p.iss; s.pn = p.n; s.ua = S.ua.map(Z.lab).join("·"); s.br = Z.bars().join("-"); s.ki = S.ki; s.mat = mat; s.from = st.from;
      s.early = st.k[0]; return s;
    }).catch(function(){ return {err: "ELS 자료를 못 받았어요."}; });
  }

  function fan(rows, A){
    var lo = Infinity, hi = -Infinity;
    rows.forEach(function(r){ if (!r.s) return; if (r.s.min != null){ lo = Math.min(lo, r.s.min); hi = Math.max(hi, r.s.max); } else { lo = Math.min(lo, r.s.end); hi = Math.max(hi, r.s.end); } });
    lo = Math.min(lo, 1); hi = Math.max(hi, 1);
    var pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
    var W = 340, X = function(v){ return 8 + (W - 16) * (v - lo) / (hi - lo); }, rowH = 50, Hh = rows.length * rowH + 30;
    var g = '<line x1="' + X(1).toFixed(1) + '" x2="' + X(1).toFixed(1) + '" y1="4" y2="' + (Hh - 16) + '" class="t3-one"/><text x="' + X(1).toFixed(1) + '" y="' + (Hh - 4) + '" class="t3-gt" text-anchor="' + (X(1) < 50 ? "start" : "middle") + '">원금 ' + won(A) + '</text>';
    var tk = [], st = (hi - lo) > 2 ? 0.5 : 0.25;
    for (var v = Math.ceil(lo / st) * st; v <= hi; v += st){ if (Math.abs(v - 1) < 1e-9) continue; tk.push(v); }
    tk = tk.filter(function(v){ return Math.abs(X(v) - X(1)) > 46; });
    tk.forEach(function(v){ g += '<line x1="' + X(v).toFixed(1) + '" x2="' + X(v).toFixed(1) + '" y1="4" y2="' + (Hh - 18) + '" class="t3-gl"/><text x="' + X(v).toFixed(1) + '" y="' + (Hh - 4) + '" class="t3-gt" text-anchor="middle">' + won(A * v) + '</text>'; });
    rows.forEach(function(r, i){
      var y = 24 + i * rowH, s = r.s;
      g += '<text x="8" y="' + (y - 10) + '" class="t3-lb" fill="' + r.c + '">' + r.t + '</text>';
      if (!s) return;
      if (s.min == null){ g += '<path d="M' + X(s.end).toFixed(1) + ',' + (y - 7) + 'l7,7l-7,7l-7,-7z" fill="' + r.c + '"/><text x="' + (X(s.end) + 10).toFixed(1) + '" y="' + (y + 4) + '" class="t3-v" fill="' + r.c + '">' + won(A * s.end) + '</text>'; return; }
      g += '<line x1="' + X(s.min).toFixed(1) + '" x2="' + X(s.max).toFixed(1) + '" y1="' + y + '" y2="' + y + '" stroke="' + r.c + '" stroke-width="2" opacity=".55"/>' +
        '<rect x="' + X(s.p10).toFixed(1) + '" y="' + (y - 7) + '" width="' + Math.max(2, X(s.p90) - X(s.p10)).toFixed(1) + '" height="14" rx="7" fill="' + r.c + '" opacity=".35"/>' +
        '<line x1="' + X(s.min).toFixed(1) + '" x2="' + X(s.min).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" stroke="' + r.c + '" stroke-width="2"/><line x1="' + X(s.max).toFixed(1) + '" x2="' + X(s.max).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" stroke="' + r.c + '" stroke-width="2"/>' +
        '<circle cx="' + X(s.p50).toFixed(1) + '" cy="' + y + '" r="5.5" fill="' + r.c + '" stroke="var(--panel)" stroke-width="2"/>' +
        '<text x="' + X(s.p50).toFixed(1) + '" y="' + (y + 20) + '" class="t3-v" text-anchor="middle" fill="' + r.c + '">' + won(A * s.p50) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + Hh + '" class="t3-sv" role="img" aria-label="3년 뒤 금액 범위 비교">' + g + '</svg>';
  }
  function lane(ic, t, s, A, sub){
    if (!s) return '<div class="t3-l"><b>' + ic + ' ' + t + '</b><small class="mut">계산 중…</small></div>';
    if (s.err) return '<div class="t3-l"><b>' + ic + ' ' + t + '</b><small class="mut">' + e(s.err) + '</small></div>';
    if (s.min == null) return '<div class="t3-l"><b>' + ic + ' ' + t + ' <span>' + won(A * s.end) + '원</span></b><small>' + sub + '</small></div>';
    var tight = s.p90 - s.p10 < 0.005;
    return '<div class="t3-l"><b>' + ic + ' ' + t + ' <span>가운데 ' + won(A * s.p50) + '원</span></b>' +
      (tight ? '<small>열에 여덟 넘게가 <b>' + won(A * s.p50) + '</b> 언저리(일찍 끝나 같은 금액) · 최악 <b class="dn">' + won(A * s.min) + '</b> · 최고 ' + won(A * s.max) + ' · 3년 뒤 원금 밑 <b class="' + (s.loss >= 1 ? "dn" : "") + '">' + (s.loss < 0.5 && s.loss > 0 ? "1% 미만" : s.loss.toFixed(0) + "%") + '</b></small>' :
      '<small>열에 하나는 <b>' + won(A * s.p10) + '</b> 아래 · 열에 아홉은 <b>' + won(A * s.p90) + '</b> 아래 · 최악 <b class="dn">' + won(A * s.min) + '</b> · 최고 ' + won(A * s.max) + ' · 3년 뒤 원금 밑 <b class="' + (s.loss >= 1 ? "dn" : "") + '">' + (s.loss < 0.5 && s.loss > 0 ? "1% 미만" : s.loss.toFixed(0) + "%") + '</b></small>') +
      '<small class="mut">' + sub + '</small></div>';
  }
  function html(){
    var A = getAmt(), B = DATA ? bond(DATA) : null;
    if (!OPEN) return '<button class="t3-hd fold" data-t3t="1">⚖️ 같은 ' + won(A) + '원, 세 갈래 길 — 채권·ELS·포트 3년 뒤 <i class="fchev">▾</i></button>';
    var rows = [{c: "#3fb950", t: "🇰🇷 채권", s: B ? {end: B.end} : null}, {c: "#f4a261", t: "🎯 ELS", s: ELS && !ELS.err ? ELS : null}, {c: "#e9c46a", t: "💼 포트", s: PORT}];
    return '<button class="t3-hd fold open" data-t3t="1">⚖️ 같은 ' + won(A) + '원, 세 갈래 길 — 채권·ELS·포트 3년 뒤 <i class="fchev">▾</i></button>' +
      '<section class="card t3"><div class="t3-amt">투자금 ' + [1e7, 3e7, 5e7, 1e8].map(function(v){ return '<button data-t3a="' + v + '" class="' + (v === A ? "on" : "") + '">' + won(v) + '</button>'; }).join("") + '<small>💼 포트 주문서와 같은 칸</small></div>' +
      fan(rows, A) +
      '<div class="t3-key"><span><i class="d"></i>점 = 가운데</span><span><i class="b"></i>굵은 띠 = 열에 하나 ~ 열에 아홉</span><span><i class="w"></i>가는 선 = 최악 ~ 최고</span></div>' +
      lane("🇰🇷", "채권", B ? {end: B.end} : {err: "3년 안팎 「매우 낮은 위험」 채권을 못 찾았어요."}, A, B ? e(B.name) + ' · 남은 ' + B.yrs.toFixed(1) + '년 · 매수수익률 연 ' + B.y.toFixed(2) + '%(세후 ' + (B.after != null ? B.after.toFixed(2) + '%' : '–') + ') · 만기까지 들고 있으면 이 값에 거의 고정' : '') +
      lane("🎯", "ELS", ELS, A, ELS && !ELS.err ? '🎛 설계기 조건 ' + e(ELS.ua) + ' · ' + e(ELS.br) + (ELS.ki != null ? ' · KI ' + ELS.ki : ' · 노낙인') + ' · 연 ' + ELS.cpn.toFixed(2) + '%(가장 가까운 실제 상품 · ' + e(ELS.iss) + ') · ' + e(ELS.from) + '~ 가입 ' + ELS.n.toLocaleString() + '번 · 일찍 끝나면 남은 기간은 채권 금리로' : '') +
      lane("💼", "포트", PORT, A, PORT ? (PORT.custom ? '🎛 포트 설계기 비중' : '💼 기본 포트 비중') + ' · ' + (PORT.reg ? '200일선 방어' : '방어 끔') + ' · ' + (PORT.vol ? '변동성 맞춤' : '맞춤 끔') + ' · ' + PORT.from.slice(0, 7).replace("-", ".") + '~ 모든 3년 구간 ' + PORT.n.toLocaleString() + '개 · 달러 기준(환율 빼고)' : '') +
      '<p class="note t3-n">셋은 위험이 달라요 — 띠가 넓을수록 결과가 크게 갈렸다는 뜻. 과거 계산이고 미래를 보장하지 않아요 · 세금·수수료 전 · 비교용일 뿐 가입·매수하라는 뜻이 아니에요. 조건은 🎯 ELS › 🎛 설계, 💼 포트 › 🎛 포트 설계기에서 바꾸면 여기도 따라 바뀌어요.</p></section>';
  }
  function paint(){
    if (!BOX || !document.body.contains(BOX)) return;
    BOX.innerHTML = html();
    [].forEach.call(BOX.querySelectorAll("[data-t3t]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); OPEN = OPEN ? 0 : 1; try { localStorage.setItem("tw3open", OPEN); } catch(x) {} paint(); if (OPEN) calc(); }; });
    [].forEach.call(BOX.querySelectorAll("[data-t3a]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); setAmt(+b.getAttribute("data-t3a")); paint(); }; });
  }
  function calc(){
    if (!OPEN || BUSY) return; BUSY = 1;
    var B = DATA && bond(DATA), yb = B ? B.y : 3.5;
    Promise.all([portDist(), elsDist(yb)]).then(function(r){ PORT = r[0]; ELS = r[1]; BUSY = 0; paint(); }, function(){ BUSY = 0; });
  }
  var T = null;
  window.__tw3 = function(){ if (!BOX || !OPEN) return; clearTimeout(T); T = setTimeout(function(){ ELS = null; calc(); }, 250); };   // 설계기에서 조건을 바꾸면
  window.threeWay = function(box, D){ BOX = box; DATA = D; paint(); calc(); };

  var css = document.createElement("style");
  css.textContent =
    ".t3-hd{margin:0 0 8px;display:flex;justify-content:space-between;align-items:center;width:100%;cursor:pointer;font-weight:700}.t3-hd .fchev{font-style:normal;transition:transform .15s}.t3-hd.open .fchev{transform:rotate(180deg)}" +
    ".t3-amt{display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:12.5px;margin:0 0 6px}.t3-amt button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer}.t3-amt button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:700}.t3-amt small{color:var(--sub);font-size:12.5px}" +
    ".t3-sv{width:100%;height:auto;display:block;margin:2px 0}.t3-gl{stroke:var(--line);stroke-width:1}.t3-one{stroke:var(--sub);stroke-width:1;stroke-dasharray:3 3}.t3-gt{fill:var(--sub);font-size:9.5px}.t3-v{font-size:12.5px;font-weight:700}.t3-lb{font-size:12.5px;font-weight:700}" +
    ".t3-key{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:12.5px;color:var(--sub);margin:0 0 6px}.t3-key i{display:inline-block;margin-right:4px;vertical-align:middle;background:var(--sub)}.t3-key i.d{width:8px;height:8px;border-radius:50%}.t3-key i.b{width:16px;height:7px;border-radius:4px;opacity:.5}.t3-key i.w{width:16px;height:2px}" +
    ".t3-l{padding:7px 0;border-top:1px solid var(--line);font-size:13px}.t3-l>b span{float:right;font-variant-numeric:tabular-nums}.t3-l small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.45}.t3-l small b{color:var(--text)}.t3-l small b.dn{color:var(--down)}.t3-n{margin:6px 0 0}";
  document.head.appendChild(css);
})();
;
__bk(51);
/* ======== tidy.js ======== */
/* CH Investing — 🧹 한눈에 보기 (10/14 밤)
   사용자: "글이 많으면 가독성이 떨어져. 내용을 없애라는 게 아니고, 심플한 틀을 유지하되 추가 내용·설명은 탭하면 나오고 다시 접게 — 전체 다"
   그려진 화면을 살펴보고 덧입힌다 (다른 화면 코드는 그대로):
   ① 설명 글(.note · 카드 속 작은 회색 설명 줄)  → 「ⓘ 첫 마디…」 한 줄로. 누르면 펼침, 다시 누르면 접힘
   ② 목록이 길면(같은 모양 줄 8개 넘음) → 6개만 + 「＋N개 더 보기」 / 「접기」
   ③ 종목 칩 줄이 길면(10개 넘음) → 8개만 + 「＋N」
   ④ ⚙️ 설정의 「🧹 한눈에 보기」 끄면 예전처럼 다 펼침 (휴대폰에 기억)
   지키는 것: 숫자 한 줄짜리 짧은 설명(40자 아래)·경고(⚠)·장중 표시 같은 핵심 줄은 그대로 보임. 펼친 것은 다시 그려져도 펼친 채로. */
(function(){
  var OFF = false;
  try { OFF = localStorage.getItem("tidyOff") === "1"; } catch(x) {}
  var OPEN = {}, MORE = {};
  // 설명 글로 보는 칸 (10/14 밤 탭별 점검으로 모음: 홈 어제 예고 풀이 · 시장 집중 근거 · 국면 신호판 풀이 · 포트 설명 · 성적 풀이 · 거르기 종목 풀이 · 피드 본문)
  // 10/15 A10-2: 「→ 결론」 줄(.mk-so)은 설명이 아니라 카드의 결론이라 뺌 — ux1015b.js 가 2줄까지 보이고 눌러 펼침
  var NOTE_SEL = [".note", ".pr-ev", ".ps-sub", ".pr-eb", ".sc-few", ".wp-why > div", ".hero2 .mut", ".card small.mut", ".card p.mut", ".card .sub-note",
    ".hm-gr small", ".fo-why", ".fo-lag", ".fo-stop", ".fo-sub .mut", ".rb-bt", ".rb-r > p", ".cp-sum", ".cn-n", ".cn-n2", ".cn-d > p", ".tm-n",
    ".sc-li", ".st .tm", ".fd-tx", ".br-bi em", ".xp-in > p"].join(", ");
  var KEEP = ".keep, .lvoff, .pr-st, .tidy-keep, .clp-btn, nav *, header *, #bnav *, .tabs *, .ch-toast, .tip, .tt-x";
  var ROWS = ".xr, .ss-r, .sc-li, .lv-r, .pt, .ps-t, .pr-hw, .wp-r, .hl, .fd-it, .fd-grp, .feed-item, .op-row, .mg-r, .row-item";

  function txt(el){ return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function key(el){ return txt(el).slice(0, 48); }
  function important(t){ return /^(⚠|❗|🚨|경고|오류|실패|지금은 장중|휴장|지연)/.test(t); }   // 맨 앞이 경고일 때만 그대로 둠

  // ① 설명 줄 → 한 줄 접기
  function foldNote(el){
    if (el.dataset.td) return;
    if (el.matches(KEEP) || el.closest(".tidy-x,.clp-open,[contenteditable],form,.sheet-top,.sh-top")) return;
    if (el.querySelector("button,input,select,svg,canvas,table,img,a[href^='javascript'],[data-goto],.btn")) return;
    if (el.parentElement && el.parentElement.closest("[data-td='n']")) return;     // 바깥이 이미 접힘
    var t = txt(el);
    if (t.length < 46 || important(t)) return;
    el.dataset.td = "n";
    // clamp.js 가 먼저 「더 보기」를 붙였으면 걷어 냄 (한 가지 방식으로만)
    var nx = el.nextElementSibling;
    if (nx && nx.classList.contains("clp-btn")) nx.remove();
    el.classList.remove("clp"); el.style.maxHeight = ""; el.dataset.clp = "1";
    var k = key(el);
    el.classList.add("td-n");
    var set = function(o){ el.classList.toggle("td-open", o); el.setAttribute("aria-expanded", o ? "true" : "false"); };
    set(!!OPEN[k]);
    el.addEventListener("click", function(ev){
      if (OFF) return;
      if (ev.target.closest("a,button")) return;
      ev.stopPropagation();
      OPEN[k] = !OPEN[k]; set(OPEN[k]);
    });
  }

  // ② 같은 모양 줄이 길게 이어지면 6개만
  function foldRows(box){
    if (box.dataset.tdr) return;
    var kids = [].filter.call(box.children, function(c){ return c.matches(ROWS); });
    if (kids.length <= 8) return;
    box.dataset.tdr = "1";
    var k = (box.closest("section,.card") ? key(box.closest("section,.card").querySelector("h3,h2,.sub2") || box) : "") + "|" + key(kids[0]).slice(0, 16);
    var extra = kids.slice(6);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "td-more";
    var set = function(o){ extra.forEach(function(c){ c.classList.toggle("td-hide", !o); }); btn.textContent = o ? "접기 ▴" : "＋" + extra.length + "개 더 보기 ▾"; };
    btn.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); MORE[k] = !MORE[k]; set(MORE[k]);
      if (!MORE[k]){ var r = box.getBoundingClientRect(); if (r.top < 0) box.scrollIntoView({block: "start", behavior: "smooth"}); } };
    extra[extra.length - 1].insertAdjacentElement("afterend", btn);
    set(!!MORE[k]);
  }

  // ③ 칩 줄
  function foldChips(box){
    if (box.dataset.tdc) return;
    var kids = [].filter.call(box.children, function(c){ return c.matches("a,span,button") && !c.classList.contains("td-chipmore"); });
    if (kids.length <= 10) return;
    box.dataset.tdc = "1";
    var k = "c|" + key(box).slice(0, 30);
    var extra = kids.slice(8);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "td-chipmore";
    var set = function(o){ extra.forEach(function(c){ c.classList.toggle("td-hide", !o); }); btn.textContent = o ? "접기" : "＋" + extra.length; };
    btn.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); MORE[k] = !MORE[k]; set(MORE[k]); };
    box.appendChild(btn);
    set(!!MORE[k]);
  }

  function scan(){
    if (OFF) return;
    var root = document.querySelectorAll("#main, #sheet");
    [].forEach.call(root, function(r){
      [].forEach.call(r.querySelectorAll(NOTE_SEL), function(el){ try { if (el.offsetParent !== null || el.closest("[hidden]") === null) foldNote(el); } catch(x) {} });
      var boxes = new Set();
      [].forEach.call(r.querySelectorAll(ROWS), function(el){ if (el.parentElement) boxes.add(el.parentElement); });
      boxes.forEach(function(b){ try { foldRows(b); } catch(x) {} });
      [].forEach.call(r.querySelectorAll(".cp-sts, .chips, .sc-gb > div"), function(b){ try { foldChips(b); } catch(x) {} });
    });
  }

  // ④ 설정 스위치 — ⚙️ 안 (있으면) · 없으면 전역 함수로
  window.tidyScan = function(){ scan(); };
  window.tidySet = function(on){ OFF = !on; try { localStorage.setItem("tidyOff", OFF ? "1" : "0"); } catch(x) {}
    document.documentElement.classList.toggle("td-off", OFF); if (!OFF) scan(); };
  document.documentElement.classList.toggle("td-off", OFF);
  function addSwitch(){
    var host = document.querySelector("#uiset");
    if (!host || host.querySelector(".td-sw")) return;
    var d = document.createElement("label"); d.className = "td-sw";
    d.innerHTML = '<input type="checkbox"' + (OFF ? "" : " checked") + '> 🧹 한눈에 보기 <small>설명·긴 목록을 접어 두기</small>';
    d.querySelector("input").onchange = function(){ window.tidySet(this.checked); };
    host.appendChild(d);
  }

  var st = document.createElement("style");
  st.textContent =
    // 설명 한 줄: 앞에 ⓘ, 한 줄 말줄임, 누르면 전체
    ":root:not(.td-off) .td-n{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;line-clamp:1;position:relative;overflow:hidden;min-width:0;max-width:100%;box-sizing:border-box;word-break:break-all;cursor:pointer;padding-left:18px !important;-webkit-tap-highlight-color:transparent;opacity:.85}" +
    ":root:not(.td-off) .td-n::before{content:'ⓘ';position:absolute;left:2px;top:0;font-style:normal;color:var(--acc,#7c9cff);font-weight:700}" +
    ":root:not(.td-off) .td-n.td-open{display:block;-webkit-line-clamp:unset;line-clamp:unset;overflow:visible;word-break:keep-all;opacity:1}" +
    ":root:not(.td-off) .td-n.td-open::after{content:' 접기 ▴';color:var(--acc,#7c9cff);font-weight:700;font-size:.95em}" +
    ":root:not(.td-off) .td-hide{display:none !important}" +
    ".td-off .td-more,.td-off .td-chipmore{display:none}" +
    ".td-more{display:block;width:100%;margin:6px 0 2px;padding:8px;border:1px dashed var(--line);border-radius:10px;background:transparent;color:var(--sub);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".td-chipmore{display:inline-flex;align-items:center;padding:4px 10px;border:1px dashed var(--line);border-radius:999px;background:transparent;color:var(--sub);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".td-sw{display:flex;align-items:center;gap:8px;padding:10px 4px;font-size:14px}.td-sw small{color:var(--sub);font-size:12.5px}" +
    // 숨 쉴 틈: 카드 안 설명과 다음 덩어리 사이 여백을 살짝 넓힘
    ":root:not(.td-off) .card .sub2{margin-top:16px}";
  document.head.appendChild(st);

  var t = null;
  function later(){ if (t) return; t = setTimeout(function(){ t = null; try { scan(); addSwitch(); } catch(e) {} }, 350); }
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length){ later(); return; } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true});
  window.addEventListener("hashchange", later);
  later();
})();
;
__bk(52);
/* ======== smooth.js ======== */
/* CH Investing — 🪟 매끄럽게 열고 닫기 (10/15)
   사용자: "누르는 칸이나 탭이 있으면 매끄럽게 연결하고 다시 닫을 수 있게"
   ① 카드·줄·칩을 누르면(data-goto) 지금 화면은 그대로 두고, 그 화면을 아래에서 올라오는 「창」으로 연다.
      닫기 = ✕ · 위 손잡이를 아래로 끌기 · 바깥(어두운 곳) 누르기 · 휴대폰 뒤로가기 · 오른쪽 아래 「뒤로」 → 보던 자리 그대로.
      창 안에서 「전체 화면 ⤢」 를 누르면 그 탭으로 완전히 넘어감.
   ② 아래 탭 바·위 작은 탭으로 화면을 바꿀 때 살짝 밀려 들어오는 움직임.
   창 속은 같은 앱을 ?embed=1 로 연 것 (머리·아래 탭 없이) — 화면 코드를 따로 고칠 필요 없음. */
(function(){
  var EMBED = /[?&]embed=1/.test(location.search);
  var D = document.documentElement;

  /* ---------- 창 안 (embed) ---------- */
  if (EMBED){
    D.classList.add("embed");
    var s = document.createElement("style");
    s.textContent = ".embed header,.embed #bnav,.embed #backbtn,.embed #tabs,.embed .tabs,.embed #netbar,.embed .a2hs{display:none!important}" +
      ".embed body{padding-top:6px!important;padding-bottom:30px!important}.embed #main{padding-top:0!important;margin-top:0!important}" +
      ".embed #main > .hero{display:none!important}";
    document.head.appendChild(s);
    // 창 안에서 또 누르면 창 안에서 그대로 이동 (창을 겹겹이 열지 않음) · 부모에 제목 알려 주기
    var tell = function(){ try { parent.postMessage({peek: "title", t: (document.querySelector("#main > .hero h1") || {}).textContent || ""}, "*"); } catch(x) {} };
    new MutationObserver(function(){ clearTimeout(tell.t); tell.t = setTimeout(tell, 120); }).observe(document.body || D, {childList: true, subtree: true});
    return;
  }

  /* ---------- ① 창 ---------- */
  var LAB = {home: "🏠 오늘", market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", port: "💼 포트", score: "📊 성적표",
             whale: "🐋 고래", cup: "☕ 컵", gap: "📈 갭", screen: "🔎 거르기", feed: "📰 피드", accum: "🤫 매집", danta: "⚡ 단타", alarm: "🔔 알림", idea: "💬 의견함", onepager: "📄 종목"};
  var PK = null, SAVED = null;
  function peekOpen(target){
    if (PK) return;
    var p = target.split("~"), tab = p[0];
    var wrap = document.createElement("div");
    wrap.id = "peek";
    wrap.innerHTML = '<div class="pk-bg"></div><div class="pk-sh"><div class="pk-top"><i class="pk-grip"></i>' +
      '<b class="pk-t">' + (LAB[tab] || "") + '</b><button type="button" class="pk-full">전체 화면 ⤢</button><button type="button" class="pk-x" aria-label="닫기">✕</button></div>' +
      '<div class="pk-load"><i></i></div><iframe class="pk-f" src="index.html?embed=1&v=' + encodeURIComponent(window.APPV || "") + '#' + encodeURIComponent(tab) + (p[1] ? "~" + encodeURIComponent(p[1]) : "") + '"></iframe></div>';
    document.body.appendChild(wrap);
    D.classList.add("peek-on");
    var f = wrap.querySelector(".pk-f");
    f.addEventListener("load", function(){ setTimeout(function(){ wrap.classList.add("ready"); }, 250); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ wrap.classList.add("on"); }); });
    PK = {el: wrap, target: target};
    // 휴대폰 뒤로가기로 닫히게: 지금 기록을 「창 아래」로 표시해 두고 창 기록 하나를 얹음
    try {
      SAVED = history.state;
      history.replaceState(Object.assign({}, SAVED || {}, {t: "xs", _pk: 1}), "");
      history.pushState({t: "peek", d: ((SAVED && SAVED.d) || 0) + 1}, "", location.pathname + location.hash);
    } catch(x) {}
    wrap.querySelector(".pk-x").onclick = function(){ peekClose(); };
    wrap.querySelector(".pk-bg").onclick = function(){ peekClose(); };
    wrap.querySelector(".pk-full").onclick = function(){ var t = PK.target; peekClose(true, function(){ var q = t.split("~"); if (window.goTo) goTo(q[0], q[1]); else go(q[0]); }); };
    drag(wrap.querySelector(".pk-top"), wrap.querySelector(".pk-sh"));
  }
  function peekClose(fromNav, after){
    if (!PK) return;
    var el = PK.el; PK = null;
    el.classList.remove("on"); D.classList.remove("peek-on");
    setTimeout(function(){ el.remove(); if (after) after(); }, 260);
    if (!fromNav || fromNav === true){
      // 얹은 기록 하나를 걷어 냄 (뒤로가기 한 번 = 창 닫힘)
      try { if (history.state && history.state.t === "peek"){ history.back(); } } catch(x) {}
    }
  }
  window.addEventListener("popstate", function(ev){
    if (PK){ peekClose("nav"); }
    if (ev.state && ev.state._pk){                    // 창 아래 기록으로 돌아옴 → 원래 기록으로 되돌려 둠 (화면은 그대로)
      try { history.replaceState(SAVED, ""); } catch(x) {}
      if (window.updBack) try { updBack(); } catch(x) {}
    }
  });
  // 손잡이를 아래로 끌어 닫기
  function drag(handle, sheet){
    var y0 = null, dy = 0;
    handle.addEventListener("touchstart", function(e){ y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = "none"; }, {passive: true});
    handle.addEventListener("touchmove", function(e){ if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = "translateY(" + dy + "px)"; }, {passive: true});
    handle.addEventListener("touchend", function(){ sheet.style.transition = ""; if (dy > 90) peekClose(); else sheet.style.transform = ""; y0 = null; });
  }
  // 창 안 제목
  window.addEventListener("message", function(ev){ if (!PK || !ev.data || ev.data.peek !== "title" || !ev.data.t) return; var t = PK.el.querySelector(".pk-t"); if (t) t.textContent = ev.data.t.trim(); });
  // 「뒤로」 버튼도 창부터 닫기
  function wrapBack(){ var cur_ = window.goBack; if (cur_ && !cur_.__pk){ var w = function(){ if (PK){ peekClose(); return; } return cur_.apply(this, arguments); }; w.__pk = 1; window.goBack = w; } }
  wrapBack(); window.addEventListener("load", function(){ setTimeout(wrapBack, 300); });

  // 카드·줄·칩 누르기 → 창 (종목 이름 data-op 은 지금처럼 종목 화면) · 같은 탭 안 이동은 그대로
  document.addEventListener("click", function(ev){
    if (ev.defaultPrevented || !ev.target.closest) return;
    if (ev.target.closest("[data-op], a[href], input, select, label, textarea, [data-share], .hm-sh, .cz.cz-on")) return;   // 🔧 11/05: 접힌 카드(calm.js)는 누르면 펼치기만 — 카드 자체가 data-goto 인 🏠 「내 포트」 띠는 펼침+💼 창이 같이 열렸음
    var t = ev.target.closest("[data-goto]"); if (!t) return;
    // 10/19: 카드 안의 단추·링크(접기·펼치기·전체 보기 등)를 누르면 카드 전체 이동(data-goto)을 하지 않음
    var ctl = ev.target.closest("button,a,summary,input,select,label,.fold"); if (ctl && !ctl.hasAttribute("data-goto") && t !== ctl && t.contains(ctl)) return;
    var btn = ev.target.closest("button");
    if (btn && btn !== t && !btn.hasAttribute("data-goto") && t.contains(btn)) return;     // 카드 안 자기 버튼(👍·공유 등)은 그대로
    var g = t.getAttribute("data-goto") || ""; var tab = g.split("~")[0];
    if (!tab || tab === window.cur) return;                       // 같은 탭 안 → 원래대로 (그 카드로 스크롤)
    if (t.closest(".ttx,.tip,#sheet")) return;                    // 설명 풍선·옛 시트 안 링크는 원래대로
    ev.preventDefault(); ev.stopPropagation();
    peekOpen(g);
  }, true);

  /* ---------- ② 탭 바꿀 때 밀려 들어오는 움직임 ---------- */
  var ORDER = ["home", "market", "sector", "prob", "port", "score", "whale", "cup", "gap", "screen", "feed"];
  function hookGo(){
    if (typeof window.go !== "function" || window.go.__pk) return;
    var g0 = window.go;
    var w = function(key){
      var from = window.cur, r = g0.apply(this, arguments);
      try {
        var m = document.getElementById("main");
        if (m && from && from !== key){
          var dir = ORDER.indexOf(key) >= ORDER.indexOf(from) ? 1 : -1;
          m.style.setProperty("--pk-dx", (dir * 22) + "px");
          m.classList.remove("pg-in"); void m.offsetWidth; m.classList.add("pg-in");
        }
      } catch(x) {}
      return r;
    };
    w.__pk = 1; window.go = w;
  }
  hookGo(); window.addEventListener("load", hookGo);

  var st = document.createElement("style");
  st.textContent =
    "#peek{position:fixed;inset:0;z-index:9000;pointer-events:none}" +
    "#peek .pk-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);opacity:0;transition:opacity .25s;pointer-events:auto}" +
    "#peek.on .pk-bg{opacity:1}" +
    "#peek .pk-sh{position:absolute;left:0;right:0;bottom:0;height:92vh;height:92dvh;background:var(--bg);border-radius:18px 18px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.35);transform:translateY(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto}" +
    "#peek.on .pk-sh{transform:translateY(0)}" +
    "#peek .pk-top{position:relative;display:flex;align-items:center;gap:8px;padding:16px 12px 10px;border-bottom:1px solid var(--line);touch-action:none}" +
    "#peek .pk-grip{position:absolute;left:50%;top:6px;width:38px;height:5px;margin-left:-19px;border-radius:3px;background:var(--line)}" +
    "#peek .pk-t{flex:1;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "#peek .pk-full{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:6px 11px;font:inherit;font-size:12.5px;font-weight:700}" +
    "#peek .pk-x{width:34px;height:34px;border-radius:50%;border:0;background:var(--panel2,var(--panel));color:var(--text);font-size:16px;font-weight:700}" +
    "#peek .pk-f{flex:1;width:100%;border:0;background:var(--bg);opacity:0;transition:opacity .2s}" +
    "#peek.ready .pk-f{opacity:1}#peek.ready .pk-load{display:none}" +
    "#peek .pk-load{position:absolute;top:50%;left:50%;width:28px;height:28px;margin:-14px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--acc,#7c9cff);animation:pkspin .8s linear infinite}" +
    "@keyframes pkspin{to{transform:rotate(360deg)}}" +
    ".peek-on body{overflow:hidden}" +
    "#main.pg-in{animation:pgin .24s cubic-bezier(.2,.8,.2,1)}" +
    "@keyframes pgin{from{opacity:.0;transform:translateX(var(--pk-dx,16px))}to{opacity:1;transform:none}}" +
    // 누를 수 있는 것은 누를 때 살짝 눌림 — 연결된다는 느낌
    "[data-goto],.hm-chi,.hm-c,.sc-c{transition:transform .12s,background-color .12s;-webkit-tap-highlight-color:transparent}" +
    "[data-goto]:active,.hm-chi:active{transform:scale(.985);background-color:color-mix(in srgb,var(--acc,#7c9cff) 8%,transparent)}" +
    "@media (prefers-reduced-motion: reduce){#main.pg-in{animation:none}#peek .pk-sh{transition:none}}";
  document.head.appendChild(st);
})();
;
__bk(53);
/* ======== calm.js ======== */
/* CH Investing — 🧹 차분하게 (10/21 사용자 「앱이 너무 복잡하고 산만하다는 지적 — 다 진행해」)
   ② 결론 → 근거 2층: 시황·나침반·포트·시장확률 탭은 맨 위 결론 카드만 펼치고, 나머지 카드는 제목 한 줄로 접음(누르면 펼침 · 휴대폰에 기억)
   ③ 이모지 줄이기: 카드 제목은 이모지 1개까지 · 본문의 꾸밈 이모지는 뺌(🟢🔴·나라 국기·신호 출처 🐋☕📈 같은 뜻 있는 표시는 그대로) · 📖 용어 풀이
   ④ 정직 계산 칩(검증 숫자)은 📊 성적표에서만 — 다른 탭에선 숨김
   ⑤ 숫자·날짜 한 규칙: 등락(부호 있는 %)은 소수 1자리 · 금리·수익률은 2자리까지 · 올해 날짜는 10/19 식
   다른 화면 코드는 건드리지 않고, 그려진 뒤 살펴보고 덧입힘. 숫자는 표기만 바꾸고 값은 그대로. */
(function(){
  var D = document.documentElement;
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }

  /* ---------- 지금 탭 표시 (④ CSS 용) ---------- */
  var _dt = window.drawTabs;
  window.drawTabs = function(){ var r = _dt ? _dt.apply(this, arguments) : undefined; try { D.setAttribute("data-tab", window.cur || ""); } catch(x) {} return r; };

  /* ---------- ② 결론 → 근거 ---------- */
  // 탭별 「결론」 카드(제목에 이 말) — 이것만 펼쳐 둠. 나머지 맨 위 단계 카드는 제목 한 줄
  var KEEP = {
    market: /오늘 할 일|아침판/,
    sector: /국면 신호판|장중 나침반/,
    port:   /부터 성적/,
    score:  /^$/,             // 11/05 성적표(포트 묶음)도 전부 접음
    prob:   /오를 확률/,
    whale:  /TOP 10/,          // ⑥ 신호 탭: 오늘 볼 것 하나만 펼치고 나머지 상세는 한 단계 아래로
    cup:    /돌파 임박/,
    gap:    /오늘 갭 지도/,
    home:   /5개 시장|업종 지도|오늘의 한 장|1탭 예측/   // 🔍 11/05 A2 홈은 4장만 펼침(나머지는 제목 한 줄)
  };
  // 11/05 사용자 「시장·포트에서 펼쳐져 있는 것들 처음엔 닫아 놓고 — 펼치기 했을 때만 보이게」
  //   · 결론 카드(오늘 할 일·성적 등)도 처음엔 접음 · 펼친 기억은 이번 방문(sessionStorage) 동안만 → 다음에 앱을 열면 다시 전부 접힘
  var ALL_FOLD = {market: 1, sector: 1, prob: 1, port: 1, score: 1};   // 시장·포트 묶음만 결론 카드까지 접음
  var OPEN = {}; try { OPEN = JSON.parse(sessionStorage.getItem("czopen") || "{}") || {}; } catch(x) {}
  try { localStorage.removeItem("czopen"); } catch(x) {}
  function keepOpen(){ try { sessionStorage.setItem("czopen", JSON.stringify(OPEN)); } catch(x) {} }
  var EMO = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})[️‍\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}]*/gu;
  function titleOf(c){
    if (c.dataset && c.dataset.czt) return c.dataset.czt;
    if (c.id === "tdhero") return "🌤 지금 시장 날씨";
    var h = c.querySelector(":scope > h3, :scope > .hm-h b, :scope > .sc-h b, :scope > summary, :scope > .sec");
    var t = (h ? h.textContent : String(c.innerText || "").split("\n").filter(function(x){ return x.trim(); })[0] || "").replace(/ⓘ/g, "").replace(/\s+/g, " ").trim();
    if (!t || /^[\d+\-−.,%\s]+$/.test(t)) return "";      // 숫자만 있는 타일은 제목 아님
    return t.length > 38 ? t.slice(0, 36) + "…" : t;
  }
  var EXTRA = {port: ", #pohero, #podz", home: ", #tdhero"};   // 포트 탭은 카드 모양이 아닌 큰 덩어리도 접음
  function topCards(root, tab){
    return [].filter.call(root.querySelectorAll(".card" + (EXTRA[tab] || "")), function(c){
      if (c.tagName === "DETAILS" || c.classList.contains("xs-more") || c.classList.contains("hero")) return false;
      var p = c.parentElement && c.parentElement.closest(".card, .fold, #sheet, #xs-more, .xs-list, #pohero, #podz"); return !p;
    });
  }
  function fold(){
    var tab = window.cur, EZF = !!(window.__ezFold && window.__ezFold(tab)), re = KEEP[tab] || (EZF ? /^$/ : null), main = document.getElementById("main"); if (!re || !main) return;   // 🔰 11/05 쉬운 화면: 신호·상품·피드 탭도 전부 접음 (ux1105c.js)
    var cards = topCards(main, tab), seen = false;
    cards.forEach(function(c){
      if (c.dataset.cz === "done" || c.classList.contains("xs-hid")) return;
      var t = titleOf(c);
      if (!(ALL_FOLD[tab] || EZF) && !seen && re.test(t)){ seen = true; c.dataset.cz = "done"; return; }
      if (!(ALL_FOLD[tab] || EZF) && re.test(t)){ c.dataset.cz = "done"; return; }
      if (!t){ c.dataset.cz = "done"; return; }
      if (c.offsetHeight < 140) return;                                     // 아직 짧은(그리는 중일 수 있는) 카드는 다음에 다시 봄
      c.dataset.cz = "done"; var key = tab + ":" + t.replace(EMO, "").slice(0, 24);
      var hd = document.createElement("div"); hd.className = "cz-h"; hd.innerHTML = '<span></span><i>펼치기 ▾</i>'; hd.firstChild.textContent = t;
      var ft = document.createElement("button"); ft.className = "cz-f"; ft.textContent = "접기 ▴";
      c.insertBefore(hd, c.firstChild); c.appendChild(ft); c.classList.add("cz"); c.dataset.czk = key;
      if (!OPEN[key]) c.classList.add("cz-on");
    });
  }
  // 제목 줄(.sec) + 바로 다음 덩어리 모양(시황 「오늘의 숫자」 타일 묶음 등) — 덩어리만 접고 제목 줄에 펼치기
  function secFold(){
    var tab = window.cur; if (!KEEP[tab]) return;
    [].forEach.call(document.querySelectorAll("#main .sec"), function(sc){
      var nx = sc.nextElementSibling; if (sc.dataset.cz || !nx || !/kpis/.test(nx.className)) return;
      sc.dataset.cz = "1"; var key = tab + ":sec:" + sc.textContent.replace(EMO, "").trim().slice(0, 20);
      var tg = document.createElement("i"); tg.className = "cz-st"; sc.appendChild(tg);
      var set = function(o){ nx.style.display = o ? "" : "none"; tg.textContent = o ? "접기 ▴" : "펼치기 ▾"; };
      set(!!OPEN[key]); sc.style.cursor = "pointer";
      sc.addEventListener("click", function(ev){ ev.preventDefault(); ev.stopPropagation(); var o = nx.style.display === "none"; set(o); if (o) OPEN[key] = 1; else delete OPEN[key]; keepOpen(); }, true);
    });
  }
  // 펼치기·접기 — 한 곳에서만 받음(10/21: 예전엔 여기서 가로챈 뒤 제목 줄 click() 을 다시 불러 아무것도 안 열렸음)
  function czOpen(c, o){
    var key = c.dataset.czk; c.classList.toggle("cz-on", !o);
    if (key){ if (o) OPEN[key] = 1; else delete OPEN[key]; keepOpen(); }
    if (!o){ var y = c.getBoundingClientRect().top; if (y < 0) window.scrollBy(0, y - 80); }
  }
  document.addEventListener("click", function(ev){
    if (!ev.target.closest) return;
    var f = ev.target.closest(".cz-f");
    if (f){ var c1 = f.closest(".cz"); if (c1){ ev.preventDefault(); ev.stopPropagation(); czOpen(c1, false); } return; }
    var c = ev.target.closest(".cz.cz-on"); if (!c) return;          // 접힌 카드는 어디를 눌러도 펼침(카드 이동 대신)
    ev.preventDefault(); ev.stopPropagation(); czOpen(c, true);
  }, true);
  // 알림·링크로 접힌 카드 안을 찾아가면 펼쳐서 보여 줌
  var _goTo = window.goTo;
  if (_goTo) window.goTo = function(tab, anchor){
    var r = _goTo.apply(this, arguments);
    if (anchor){ var t0 = Date.now(); (function f(){ var el = document.getElementById(anchor); if (el){ var c = el.closest(".cz.cz-on"); if (c) c.classList.remove("cz-on"); return; } if (Date.now() - t0 < 6000) setTimeout(f, 200); })(); }
    return r;
  };

  /* ---------- ③ 이모지 줄이기 ---------- */
  // 꾸밈으로만 쓰인 것 — 본문에서 뺌. 뜻이 있는 표시(🟢🔴🟡⚪ · ✅❌ · ⚠️ · ★ · 국기 · 신호 출처 🐋☕📈🤫 · 포트 표시 💼⚡🎯🙋)는 그대로
  var DECOR = /(?:🔥|🧊|💡|👀|📌|🧭|🌙|☀️?|🌞|🌅|🌆|🗺️?|🏁|🧮|🧪|📊|📅|🗓️?|🔔|💬|📤|🧾|🧵|🪄|🗳️?|🔮|🎞️?|🕰️?|🎛️?|📋|🔁|🧩|🌏|🌍|🌐|🔗|🏷️?|🏔️?|📜|💱|🌡️?|🕐|🔄|⏳|⏱️?|⏰|📏|🔢|✂️?|🧹|🆕|💭|🗣️?|📖|📘|📢|📣|🎲|🧠|🚀|💧|🪙|🏆|🎉|👆|👉|🙌|✨|📉|🛑|⛔|🚨|💸|🤝|💪|🧑‍💼|🕸️?|⚔️?|🌉|🕳️?|🌱|🛍️?|📦|🏦|📰|🔎|🔍|🐣|🍀|🌈|🎈|📍|🧲|⚖️?|📝|🗂️?|📂|👻|🧱|🪪|🛰️?|😱|💰|🩹|🦴|🔒|🔓|🔑)\s?/gu;
  var SKIPSEL = "script,style,svg,input,textarea,select,button,.seg2,.tabs,#bnav,header,.hm-i,.pl-ic,.sc-h .hm-i,.cz-h,.hm-more,[data-noemo],.chip,.hm-chip,.sgx-t,.pd-v,.date,.dates";
  function thinTitles(root){
    [].forEach.call(root.querySelectorAll("h3, .hm-h b, .sec, summary"), function(h){
      if (h.dataset.emo) return; h.dataset.emo = "1";
      var n = 0;
      walk(h, function(tn){ var v = tn.nodeValue, out = v.replace(EMO, function(m){ n++; return n > 1 ? "" : m; }); if (out !== v) tn.nodeValue = out.replace(/\s{2,}/g, " "); });
    });
  }
  function walk(root, fn){
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: function(n){ var p = n.parentElement; return !p || p.closest(SKIPSEL) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }});
    var a = [], x; while ((x = w.nextNode())) a.push(x); a.forEach(fn);
  }

  /* ---------- ⑤ 숫자·날짜 ---------- */
  var Y = String(new Date(Date.now() + 9 * 3600e3).getUTCFullYear());
  function fmtText(v, decor){
    var o = v;
    if (decor) o = o.replace(DECOR, "");
    // 등락(부호 있는 %) → 소수 1자리 (0.0 이 되면 2자리 그대로)
    o = o.replace(/([+\-−])(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2,})%(?!p)/g, function(m, s, a, b){ var x = (+(a.replace(/,/g, "") + "." + b)).toFixed(1); return x === "0.0" ? m : s + x + "%"; });
    // 금리·수익률(부호 없음)·%p → 2자리까지 (표면금리는 그대로)
    o = o.replace(/(표면\s*)?(\d+)\.(\d{3,})(%p?)/g, function(m, pre, a, b, u){ return pre ? m : (+(a + "." + b)).toFixed(2) + u; });
    // 올해 날짜 2026-10-19 → 10/19 · 10-19 → 10/19
    o = o.replace(new RegExp("(^|[^\\d-])" + Y + "-(\\d{2})-(\\d{2})(?![\\d])", "g"), function(m, p, mo, d){ return p + mo + "/" + d; });
    o = o.replace(/(^|[\s(·])(0[1-9]|1[0-2])-([0-2]\d|3[01])(?=[\s)·,]|$)(?![%시일개년월주배건종p])/g, function(m, p, mo, d){ return p + mo + "/" + d; });
    return o;
  }
  function normalize(root){
    var tab = window.cur || "", prod = /^(bond|fund|els|onepager)$/.test(tab);
    walk(root, function(tn){
      var p = tn.parentElement; if (!p || p.closest("[data-num]") && p.closest(".hm-big")) return;   // 홈 숫자 차오름 중인 칸은 그 코드가 맡음
      var v = tn.nodeValue; if (!v || v.length < 2) return;
      if (!v.replace(EMO, "").trim()) return;                    // 이모지만 있는 칸 = 아이콘 자리 → 그대로
      var decor = !p.closest("h3, .hm-h b, .sec, summary");      // 제목은 thinTitles 가 맡음
      var o = prod ? (decor ? v.replace(DECOR, "") : v) : fmtText(v, decor);
      if (o !== v) tn.nodeValue = o;
    });
  }

  /* ---------- 한 번에 돌리기 (그려질 때마다 · 잠깐 모아서) ---------- */
  var T = null, busy = false;
  function pass(){
    T = null; if (busy || ls("calm") === "off") return; busy = true;
    try { var m = document.getElementById("main"); if (m){ thinTitles(m); normalize(m); fold(); secFold(); } var sh = document.getElementById("sheet"); if (sh){ thinTitles(sh); normalize(sh); } }
    catch(x){ if (window.console) console.warn("calm", x); }
    busy = false;
  }
  function soon(){ if (!T) T = setTimeout(pass, 260); }
  function start(){
    var mo = new MutationObserver(function(){ if (!busy) soon(); });
    mo.observe(document.body, {childList: true, subtree: true, characterData: true});
    soon();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();

  /* ---------- 📖 용어 풀이 ---------- */
  var G = [
    ["기본 포트", "시황리포트 자산배분표대로 담은 포트. 주식 칸은 S&P500 반 + 나스닥 반이 뼈대."],
    ["공격(킥) 포트", "기본 포트에 성과가 확인된 신호(고래·컵·갭) 종목을 10~20% 섞어 시장을 이기려는 포트."],
    ["집중 포트", "오르는 장이라고 볼 때만 S&P·나스닥 뼈대 + 공격(킥) 종목에 몰아서 담는 포트."],
    ["내 포트", "내가 직접 정한 비중으로 굴린 셈 치는 포트."],
    ["고래", "기관·유명 투자자 40곳. 분기마다 공시(13F)하는 보유 종목 변화를 따라감."],
    ["컵", "컵앤핸들 차트 — 바닥을 둥글게 다진 뒤 손잡이를 지나 전 고점을 뚫으려는 모양."],
    ["갭", "전날 종가보다 크게 뛰어 시작해 차트에 빈칸(갭)이 생긴 종목."],
    ["나침반", "5개 시장(한·미·일·중·홍)의 오른 종목 수·지수·섹터 흐름을 한 화면에."],
    ["국면", "지금 시장이 상승장·조정·하락장 중 어디쯤인지. 🟢 상승장 / 🔴 아님."],
    ["두뇌", "매시간 뉴스·블로그·텔레그램을 읽고 시장 판단과 논지(이렇게 될 것)를 고치는 자동 분석."],
    ["시장확률", "여러 방법을 합쳐 계산한 「다음 장 오를 확률」. 매일 종가로 채점하고, 검증되기 전엔 약하게만 말함."],
    ["200일선", "최근 200거래일 평균 가격. 지수가 그 위면 상승 추세로 보고 현금을 줄임."],
    ["정직 계산", "다음 날 가격에 사고 수수료·세금·환전 비용까지 뺀 성적. 📊 성적표에서 봄."],
    ["예고 채점", "아침 시황리포트가 낸 예고(예: 코스피 5,400 위 마감)를 다음 날 맞았는지 채점."]
  ];
  function gloss(){
    var old = document.getElementById("gloss"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "gloss";
    d.innerHTML = '<div class="gl-in"><div class="gl-t"><b>📖 용어 풀이</b><button aria-label="닫기">✕</button></div>' + G.map(function(x){ return '<div class="gl-r"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join("") + '</div>';
    d.onclick = function(ev){ if (ev.target === d || ev.target.closest("button")) d.remove(); };
    document.body.appendChild(d);
  }
  window.chGloss = gloss;
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-gloss]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); gloss(); }, true);

  /* ---------- 모양 ---------- */
  var st = document.createElement("style");
  st.textContent = [
    // ② 접힌 카드
    ".card.cz{position:relative}.cz-h{display:none}.cz-f{display:block;margin:10px auto 0;background:none;border:0;color:var(--sub);font-size:12.5px;padding:4px 10px;cursor:pointer}",
    ".cz.cz-on{padding:12px 14px!important;cursor:pointer;background:var(--panel);border:1px solid var(--line);border-radius:16px;margin-bottom:12px}.cz.cz-on>*{display:none!important}.cz.cz-on>.cz-h{display:flex!important}" +
    // 11/05 사용자 「빈칸 뭐니」: 펼쳐 있을 때 너무 길어 「전체 보기」(xs-clamp) 처리된 카드가 접히면, 아래를 흐리게 덮던 150px 막(::after)이 제목 줄까지 덮어 빈 카드로 보였음 → 접힌 카드엔 덮개·높이 제한 없음
    ".cz.cz-on::after{display:none!important}.cz.cz-on.xs-clamp{max-height:none!important;overflow:visible!important}",
    ".cz-h{align-items:center;gap:8px;font-weight:700;font-size:14.5px;line-height:1.35}.cz-h span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cz-h i{flex:none;font-style:normal;font-weight:400;font-size:12.5px;color:var(--sub)}",
    // 포트 탭 묶음(.fold)이 다른 「.fold」 단추 모양을 물려받아 상자 안 상자로 보이던 것 정리
    ".cz-st{float:right;font-style:normal;font-weight:400;font-size:12.5px;color:var(--sub);margin-left:8px}",
    "#pobody>.fold{padding:0;border:0;background:none;margin:0 0 8px}#pobody>.fold.open{margin-bottom:14px}#pobody>.fold:not(.open) .fold-h{margin:0}",
    // 홈: 큰 「🏠 오늘」 머리·날짜(위 머리에 이미 있음) 숨김 → 첫 화면에 오늘 한 줄이 바로
    "html[data-tab=home] #main>.hero{display:none}html[data-tab=home] .hm-day .hm-date{display:none}html[data-tab=home] .hm-day{margin-top:10px}",
    // ④ 정직 칩은 성적표에서만
    "html:not([data-tab=score]) .hon-chip,html:not([data-tab=score]) .hon-tag,html:not([data-tab=score]) .hon-line{display:none!important}",
    // 홈 아래 바로가기 줄
    ".hm-more{display:flex;flex-wrap:wrap;gap:8px;margin:4px 2px 18px}.hm-more a{flex:1 1 auto;text-align:center;font-size:12.5px;padding:9px 10px;border-radius:12px;background:var(--panel);border:1px solid var(--line);color:var(--sub);text-decoration:none;cursor:pointer;white-space:nowrap}",
    // 🗂 신호 › 더 보기
    ".sm-t{padding:9px 0;border-top:1px dashed var(--line)}.sm-t:first-of-type{border-top:0}.sm-tb{display:flex;gap:10px;align-items:flex-start}.sm-tb b{flex:1;font-size:14px;line-height:1.45}.sm-t small{display:block;font-size:12.5px;color:var(--sub);line-height:1.45;margin-top:3px}",
    ".sm-c{flex:none;width:64px;text-align:right}.sm-c i{display:block;height:5px;border-radius:3px;background:#7c9cff;margin:6px 0 2px auto;max-width:64px}.sm-c em{font-style:normal;font-size:12.5px;color:var(--sub)}",
    ".sm-go{display:flex;align-items:center;gap:10px;padding:11px 2px;border-top:1px solid var(--line);cursor:pointer}.sm-go:first-of-type{border-top:0}.sm-go>span{font-size:20px;width:30px;text-align:center}.sm-go div{flex:1}.sm-go b{display:block;font-size:14.5px}.sm-go small{font-size:12.5px;color:var(--sub)}.sm-go i{font-style:normal;color:var(--sub)}",
    // 📖 용어 풀이
    "#gloss{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}",
    ".gl-in{width:100%;max-width:560px;max-height:82vh;overflow:auto;background:var(--panel);border-radius:18px 18px 0 0;padding:14px 16px calc(18px + env(safe-area-inset-bottom))}",
    ".gl-t{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:16px}.gl-t button{background:none;border:0;color:var(--sub);font-size:18px;padding:4px 8px}",
    ".gl-r{padding:9px 0;border-top:1px solid var(--line);font-size:13.5px;line-height:1.5}.gl-r b{display:block;margin-bottom:1px}.gl-r span{color:var(--sub)}"
  ].join("");
  document.head.appendChild(st);
})();
;
__bk(54);
/* ======== ux1022.js ======== */
/* 10/22 사용자 「세 개 다 좋아 실행해」 — 📱 앱 아이디어 A10/22-1·2·3
   ① 😱 급락 뒤 홈 한 줄 「그날 팔았다면」 (A10/22-1 · 설계기 쪽은 port_design.js)
      코스피가 하루 −3.5% 넘게 빠진 날이 최근 3거래일 안에 있으면 「오늘 한 줄」 밑에 카드 하나:
      2000년 이후 같은 급락일 종가에 팔고 20·60·120거래일 뒤 돌아왔다면 → 놓친 지수 수익(평균·몇 번 중 몇 번 손해·최악),
      반대로 그날 10% 더 샀다면 → 그 10% 의 수익. 자료: archive/x/port_px/KOSPI.json(^KS11 2000~) — 계산은 휴대폰에서.
   ② 📌 내 ELS 관제탑 (A10/22-2) — 🎯 ELS 탭 맨 위. 청약 중 상품을 「담아 두기」(실제·가상 같은 단추, 휴대폰에만 저장) →
      기초자산마다 기준가 대비 · 다음 평가 D-day · 배리어까지 여유 · KI 까지 거리, 그리고 2006~ 일봉으로
      「과거에 이 위치였던 가입일들은 다음 평가 때 상환 ○% · 결국 손실 ○%」. 두 개 넘으면 「같이 깨진 비율(겹침)」.
      자료: archive/x/els_px(7일마다 일봉) + els_px/last.json(매 실행 최근 종가 · els_replay.py) · els_replay.json by_id(조건키) · els_all.json · products.json
   ③ 👁 내 눈 vs 거름망 (A10/22-3) — 🔎 아침 거르기 카드마다 「👁 볼 만함」 한 번(안 누른 건 넘긴 것).
      다음 날부터 화면 맨 위 한 줄 + 📊 성적표 카드: 찍은 것 vs 안 찍은 것(그날 거름망 전체) 「그날 종가 → 가장 최근 종가」 평균.
      값은 opdata p/ (종목 종가 · 매일 아침) — 날짜가 그날보다 뒤인 것만 셈. 휴대폰에만 저장.
   원칙: 과거·지난 값 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」). */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function s2day(s){ return Date.parse(s + "T00:00:00Z") / 864e5; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function lb(a, v){ var lo = 0, hi = a.length; while (lo < hi){ var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
  function addM(t, m){ var x = new Date(t * 864e5), y = x.getUTCFullYear(), mo = x.getUTCMonth() + m, dd = x.getUTCDate();
    var ny = y + Math.floor(mo / 12), nm = ((mo % 12) + 12) % 12, last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
    return Date.UTC(ny, nm, Math.min(dd, last)) / 864e5; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function goTab(t){ if (typeof window.go === "function") go(t); else location.hash = t; }

  /* ═════════ ① 😱 급락 뒤 「그날 팔았다면」 ═════════ */
  var KP = null, KW = null;
  // 10/23: 파일(어제까지 종가)은 한 번만 받고, 실시간 코스피(live_kr, 장중 2분마다 갱신)는 부를 때마다 새로 얹음 → 장중 급락도 바로 반영
  function kospi(){
    if (!KW) KW = getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return getJSON("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), {ttl: 3600e3});
    }).then(function(j){
      if (!j || !j.dd) return null;
      var t = s2day(j.d0), d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(day2s(t)); c.push(+j.c[i]); }
      KP = {d: d, c: c}; return KP;
    }).catch(function(){ KW = null; return null; });
    return KW.then(function(B){
      if (!B) return null;
      return getJSON("archive/x/live_kr.json?" + Math.floor(Date.now() / 60000), {ttl: 60000}).then(function(L){
        var K = {d: B.d.slice(), c: B.c.slice(), live: null};
        var ix = L && L.date && L.date <= kst() ? (L.index || []).filter(function(x){ return x.name === "코스피"; })[0] : null;
        if (ix && ix.last > 0){
          // 오늘 칸을 실시간 값으로 · 10/23: 파일에 전날 종가가 빠져 있으면(야후가 10/22 를 건너뜀) 실시간 등락률로 되살려 끼움 — 안 그러면 이틀치가 하루로 잡힘
          if (K.d[K.d.length - 1] === L.date){ K.d.pop(); K.c.pop(); }
          if (K.d[K.d.length - 1] < L.date){
            var pv = ix.chg != null ? +ix.last / (1 + ix.chg / 100) : null, pd = new Date(L.date + "T00:00:00Z");
            do { pd.setUTCDate(pd.getUTCDate() - 1); } while (pd.getUTCDay() === 0 || pd.getUTCDay() === 6);
            var pds = pd.toISOString().slice(0, 10), lc = K.c[K.c.length - 1];
            if (pv && pds > K.d[K.d.length - 1] && Math.abs(pv / lc - 1) > 0.0005){ K.d.push(pds); K.c.push(pv); }   // 휴장일이면 값이 같아 넣지 않음
            K.d.push(L.date); K.c.push(+ix.last);
          }
          if (L.date === kst() && ix.status !== "CLOSE") K.live = {t: L.t || "", d: L.date}; }
        return K;
      }, function(){ return {d: B.d, c: B.c, live: null}; });
    });
  }
  var CUT = -3.5;
  function panicStats(K){
    var c = K.c, d = K.d, n = c.length, drops = [];
    for (var i = 1; i < n; i++) if ((c[i] / c[i - 1] - 1) * 100 <= CUT) drops.push(i);
    var trig = null;   // 최근 3거래일 안 급락(가장 최근)
    for (var j = Math.max(1, n - 3); j < n; j++){ var r = (c[j] / c[j - 1] - 1) * 100; if (r <= CUT) trig = {i: j, d: d[j], r: r}; }
    if (!trig) return null;
    var H = [20, 60, 120].map(function(h){
      var rs = [], worst = null;
      drops.forEach(function(i){ if (i + h >= n) return; var r = (c[i + h] / c[i] - 1) * 100; rs.push(r); if (!worst || r < worst.r) worst = {r: r, d: d[i]}; });
      if (!rs.length) return {h: h, n: 0};
      var s = 0, up = 0; rs.forEach(function(x){ s += x; if (x > 0) up++; });
      var so = rs.slice().sort(function(a, b){ return a - b; });
      return {h: h, n: rs.length, avg: s / rs.length, med: so[Math.floor(so.length / 2)], up: up, worst: worst};
    });
    var now = null;   // 오늘이 며칠째 연속 하락인가(오늘 −1.5% 넘게 · 앞날들도 −1.5% 넘게, 최대 5일) → 「이틀 동안 −x%」
    if (d[n - 1] === kst() && n > 2){
      var st = n - 1;
      while (st > n - 5 && (c[st - 1] / c[st - 2] - 1) * 100 <= -1.5) st--;
      var k = n - st, rn = (c[n - 1] / c[n - 2] - 1) * 100;
      if (k >= 2 && rn <= -1.5){
        var r2 = (c[n - 1] / c[st - 1] - 1) * 100, cut2 = Math.ceil(r2), hs = [], seen = -999;   // 같은 날 수(k일) 동안 그만큼 빠진 날들 → 120거래일 뒤
        for (var q = k; q < n - 1; q++){ var rr = (c[q] / c[q - k] - 1) * 100; if (rr <= cut2 && q - seen > k){ seen = q; if (q + 120 < n) hs.push((c[q + 120] / c[q] - 1) * 100); } }
        var av = null, upn = 0; if (hs.length){ av = 0; hs.forEach(function(x){ av += x; if (x > 0) upn++; }); av /= hs.length; }
        now = {r: rn, prev: (c[n - 2] / c[n - 3] - 1) * 100, r2: r2, k: k, cut2: cut2, n: hs.length, avg: av, up: upn};
      }
    }
    return {trig: trig, drops: drops.length, H: H, from: d[0].slice(0, 4), today: d[n - 1] === kst(), live: K.live, now: now};
  }
  function kday(k){ return ({2: "이틀", 3: "사흘", 4: "나흘", 5: "닷새"})[k] || k + "일"; }
  function panicHome(S){
    var A = amt(), T = S.trig, h120 = S.H[2], h20 = S.H[0];
    var rows = S.H.filter(function(x){ return x.n; }).map(function(x){
      return '<div class="pnh-r"><span>' + x.h + '거래일 뒤 돌아옴</span><b class="' + cl(-x.avg) + '">' + sg(-x.avg, 1) + '%p</b><em>' + x.n + '번 중 <b>' + x.up + '</b>번 손해</em></div>'; }).join("");
    var add = h120 && h120.n ? A * 0.1 * h120.avg / 100 : null;
    return '<div class="pnh-h"><b>😱 ' + (T.d === kst() ? (S.live ? "오늘(장중 " + S.live.t + ")" : "오늘") : md(T.d)) + ' 코스피 ' + sg(T.r, 1) + '%' + (S.now && T.d === kst() ? ' · ' + kday(S.now.k) + ' 동안 ' + sg(S.now.r2, 1) + '%' : '') + ' — 그날 팔았다면?</b><small>' + S.from + '년 이후 하루 ' + Math.abs(CUT) + '% 넘게 빠진 날 ' + S.drops + '번 · 그날 종가에 팔고 다시 샀을 때 지수를 그대로 들고 있던 것보다</small></div>' +
      (S.now ? '<div class="pnh-r pnh-now"><span>🔴 ' + (S.now.k === 2 ? '어제 ' + sg(S.now.prev, 1) + '%에 이어 ' : S.now.k + '일째 하락 · ') + '오늘' + (S.live ? '(장중 ' + S.live.t + ')' : '') + ' ' + sg(S.now.r, 1) + '% → ' + kday(S.now.k) + ' 동안 ' + sg(S.now.r2, 1) + '%</span>' + (S.now.n ? '<b class="' + cl(S.now.avg) + '">' + sg(S.now.avg, 1) + '%</b><em>2000년 이후 ' + kday(S.now.k) + ' 새 ' + Math.abs(S.now.cut2) + '% 넘게 빠진 ' + S.now.n + '번 · 120거래일 뒤 평균 · ' + S.now.up + '번 오름</em>' : '<em>같은 낙폭 과거 사례 부족</em>') + '</div>' : '') +
      rows +
      (add != null ? '<div class="pnh-r pnh-b"><span>↔ 반대로 그날 ' + won(A * 0.1) + '원(10%) 더 샀다면 120거래일 뒤</span><b class="' + cl(add) + '">' + (add >= 0 ? "+" : "−") + won(Math.abs(add)) + '원</b><em>평균 · 최악 ' + sg(h120.worst.r, 0) + '%(' + h120.worst.d.slice(0, 7).replace("-", ".") + ')</em></div>' : '') +
      '<div class="pnh-go">💼 내 포트 설계로 2008·2020·2022·2025 낙폭에서 보기 ›</div>' +
      '<p class="note" style="margin:4px 0 0">코스피 지수 기준(개별 종목 아님 · 현금 이자 뺌) · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p>';
  }
  var HPB = 0;
  function homePanic(){
    var b = document.getElementById("hmbody"); if (!b || HPB) return;
    var pl = b.querySelector("section.card.pl"); if (!pl || document.getElementById("hmpanic")) return;
    HPB = 1;
    kospi().then(function(K){
      HPB = 0; if (!K) return;
      var S = panicStats(K); if (!S) return;
      var b2 = document.getElementById("hmbody"), pl2 = b2 && b2.querySelector("section.card.pl"); if (!pl2 || document.getElementById("hmpanic")) return;
      var s = document.createElement("section"); s.className = "card hmpn"; s.id = "hmpanic"; s.setAttribute("role", "button");
      s.innerHTML = panicHome(S); s.dataset.sig = psig(S); pl2.parentNode.insertBefore(s, pl2.nextSibling);
      s.onclick = function(ev){ ev.stopPropagation(); if (window.__pdz && __pdz.panic) __pdz.panic(); goTab("port"); };
    }).catch(function(){ HPB = 0; });
  }
  function psig(S){ return S.trig.d + "|" + S.trig.r.toFixed(1) + "|" + (S.now ? S.now.r.toFixed(1) + S.now.k : "") + "|" + (S.live ? S.live.t : ""); }
  // 장중엔 2분마다 다시 계산 → 숫자가 바뀌면 카드를 새로 그림(급락이 새로 생기거나 사라져도)
  setInterval(function(){
    if (document.hidden || !document.getElementById("hmbody")) return;
    var h = +new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 13); if (h < 9 || h > 16) return;
    kospi().then(function(K){
      if (!K) return; var S = panicStats(K), old = document.getElementById("hmpanic");
      if (!S){ if (old) old.remove(); return; }
      if (old && old.dataset.sig === psig(S)) return;
      if (old) old.remove(); HPB = 0; homePanic();
    }).catch(function(){});
  }, 120000);
  window.__panicStats = function(){ return kospi().then(function(K){ return K && panicStats(K); }); };   // 검사용

  /* ═════════ ② 📌 내 ELS 관제탑 ═════════ */
  var EPX = {}, EIDX = null, ELAST = null, EW = null;
  function eload(){
    if (!EW) EW = Promise.all([
      getJSON("archive/x/els_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/els_px/last.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; }),
      getJSON("archive/x/els_replay.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; }),
      getJSON("archive/x/els_all.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })
    ]).then(function(r){ EIDX = r[0] && r[0].assets ? r[0] : {assets: {}}; ELAST = r[1] && r[1].assets ? r[1] : null; return {rep: r[2] || {by_id: {}}, all: r[3] || {items: []}}; });
    return EW;
  }
  function epx(n){   // 7일마다 일봉 + last.json 최근 종가(겹치는 날 값으로 맞춰 이어 붙임)
    if (EPX[n]) return EPX[n];
    var a = EIDX && EIDX.assets[n]; if (!a) return Promise.resolve(null);
    EPX[n] = getJSON("archive/x/els_px/" + a.f + "?" + String(EIDX.updated || "").replace(/\D/g, ""), {ttl: 864e5}).then(function(j){
      if (!j || !j.dd) return null;
      var t = s2day(j.d0), d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(t); c.push(+j.c[i]); }
      var L = ELAST && ELAST.assets[n], tail = 0;
      if (L && L.length){
        var lastD = d[d.length - 1], k = null;
        for (var q = 0; q < L.length; q++) if (s2day(L[q][0]) === lastD){ k = c[c.length - 1] / L[q][1]; break; }
        if (k){ L.forEach(function(x){ var tt = s2day(x[0]); if (tt > lastD){ d.push(tt); c.push(x[1] * k); tail++; } }); }
      }
      return {d: Int32Array.from(d), c: Float64Array.from(c), tail: tail};
    }).catch(function(){ return null; });
    return EPX[n];
  }
  function align(ss){
    var base = ss[0], m = ss.length, D = [], C = ss.map(function(){ return []; }), ptr = ss.map(function(){ return 0; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true, vals = [base.c[i]];
      for (var a = 1; a < m; a++){ var s = ss[a]; while (ptr[a] < s.d.length && s.d[ptr[a]] < t) ptr[a]++; if (ptr[a] >= s.d.length || s.d[ptr[a]] !== t){ ok = false; break; } vals.push(s.c[ptr[a]]); }
      if (!ok) continue; D.push(t); for (var a2 = 0; a2 < m; a2++) C[a2].push(vals[a2]);
    }
    return {D: Int32Array.from(D), C: C.map(function(x){ return Float64Array.from(x); })};
  }
  function sparse(arr){ var n = arr.length, K = [arr], k = 1; while ((1 << k) <= n){ var p = K[k - 1], q = new Float64Array(n - (1 << k) + 1), h = 1 << (k - 1); for (var i = 0; i < q.length; i++) q[i] = p[i] < p[i + h] ? p[i] : p[i + h]; K.push(q); k++; } return K; }
  function rmin(K, a, b){ if (b < a) return Infinity; var k = 31 - Math.clz32(b - a + 1), x = K[k][a], y = K[k][b - (1 << k) + 1]; return x < y ? x : y; }
  function parseKey(key){ var p = String(key).split("|"); return {ua: p[0].split("+"), bars: p[1].split("-").map(Number), cyc: +p[2], ki: p[3] === "none" ? null : +p[3], pp: p[4] === "pp"}; }
  // 가입일 s 에서 끝까지 (els_replay replay 와 같은 규칙: 평가일마다 가장 못한 자산이 배리어 위면 상환 · 끝까지 못 넘으면 KI 닿았으면 손실(KI 없으면 손실))
  function simAt(G, q, s){
    var D = G.D, T = D.length, n = q.bars.length, m = G.C.length, ev = [];
    for (var k = 0; k < n; k++){ var tt = addM(D[s], q.cyc * (k + 1)); if (tt > D[T - 1]) return null; ev.push(Math.min(lb(D, tt), T - 1)); }
    for (var k2 = 0; k2 < n; k2++){ var w = Infinity; for (var a = 0; a < m; a++){ var r = G.C[a][ev[k2]] / G.C[a][s]; if (r < w) w = r; } if (w >= q.bars[k2] / 100) return {k: k2, ev: ev}; }
    var touched = false; if (q.ki != null) for (var a2 = 0; a2 < m; a2++) if (rmin(G.K[a2], s, ev[n - 1]) / G.C[a2][s] < q.ki / 100){ touched = true; break; }
    return {k: -1, loss: q.ki != null ? touched : true, ev: ev};
  }
  function worstAt(G, s, p){ var w = Infinity, wa = 0; for (var a = 0; a < G.C.length; a++){ var r = G.C[a][p] / G.C[a][s]; if (r < w){ w = r; wa = a; } } return {w: w, a: wa}; }
  function kiTouched(G, q, s, p){ if (q.ki == null) return false; for (var a = 0; a < G.C.length; a++) if (rmin(G.K[a], s, p) / G.C[a][s] < q.ki / 100) return true; return false; }
  function monitor(it, G){
    var q = parseKey(it.key), D = G.D, T = D.length, b = lb(D, s2day(it.base));
    if (b >= T) return {wait: 1, q: q};
    var L = T - 1, n = q.bars.length, evT = [];
    for (var k = 0; k < n; k++) evT.push(addM(D[b], q.cyc * (k + 1)));
    var passed = evT.filter(function(t){ return t <= D[L]; }).length;
    // 지나간 평가에서 이미 상환됐나
    for (var k2 = 0; k2 < passed; k2++){ var p = Math.min(lb(D, evT[k2]), L), w = worstAt(G, b, p).w; if (w >= q.bars[k2] / 100) return {done: {k: k2, d: day2s(D[p]), w: w}, q: q}; }
    var cur = G.C.map(function(c, a){ return c[L] / c[b]; }), W = worstAt(G, b, L), kt = kiTouched(G, q, b, L);
    var out = {q: q, b: b, L: L, cur: cur, w: W.w, wa: W.a, kt: kt, next: passed < n ? {k: passed, t: evT[passed], bar: q.bars[passed]} : null, mat: day2s(evT[n - 1]), last: day2s(D[L]), base: day2s(D[b])};
    if (!out.next) return out;
    // 과거에 이 위치: 경과일이 같고(같은 평가 차례 앞) · 가장 못한 자산이 지금과 ±tol 안 · KI 닿음 여부 같음 · 그때까지 상환 안 됨
    var E = D[L] - D[b], nS = 0, nNext = 0, nEarly = 0, nMat = 0, nLoss = 0, tol = 0.05, cand = [];
    for (var tries = 0; tries < 3; tries++){
      cand = [];
      for (var s = 0; s < T; s++){
        if (s >= b - 5 && s <= L) break;
        var pp = lb(D, D[s] + E); if (pp >= T) break;
        var sim = simAt(G, q, s); if (!sim) break;
        if (sim.k >= 0 && sim.k < passed) continue;          // 그 위치 전에 이미 끝남
        var ww = worstAt(G, s, pp).w; if (Math.abs(ww - W.w) > tol) continue;
        if (q.ki != null && kiTouched(G, q, s, pp) !== kt) continue;
        cand.push(sim);
      }
      if (cand.length >= 30) break;
      tol = tol === 0.05 ? 0.08 : 0.12;
    }
    cand.forEach(function(x){ nS++; if (x.k === passed) nNext++; if (x.k >= 0) nEarly++; else if (x.loss) nLoss++; else nMat++; });
    out.hist = {n: nS, next: nNext, early: nEarly, mat: nMat, loss: nLoss, tol: tol, from: day2s(D[0]).slice(0, 4)};
    return out;
  }
  function overlap(items, GS){   // 담은 것 둘 넘으면: 모두가 있는 날 가입했다면 하나가 손실일 때 다른 것도 손실인 비율
    var names = []; items.forEach(function(it){ parseKey(it.key).ua.forEach(function(u){ if (names.indexOf(u) < 0) names.push(u); }); });
    return Promise.all(names.map(epx)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var G = align(ss); if (G.D.length < 600) return null; G.K = G.C.map(sparse);
      var subs = items.map(function(it){ var q = parseKey(it.key), idx = q.ua.map(function(u){ return names.indexOf(u); });
        return {q: q, G: {D: G.D, C: idx.map(function(i){ return G.C[i]; }), K: idx.map(function(i){ return G.K[i]; })}}; });
      var any = 0, both = 0, tot = 0, ones = items.map(function(){ return 0; });
      for (var s = 0; s < G.D.length; s++){
        var rs = subs.map(function(x){ return simAt(x.G, x.q, s); });
        if (rs.some(function(r){ return !r; })) break;
        tot++; var L = rs.map(function(r){ return r.k < 0 && r.loss; }), c = L.filter(Boolean).length;
        L.forEach(function(v, i){ if (v) ones[i]++; });
        if (c >= 1) any++; if (c >= 2) both++;
      }
      return tot >= 200 ? {tot: tot, any: any, both: both, ones: ones, from: day2s(G.D[0]).slice(0, 7)} : null;
    });
  }
  var LABU = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LABU[n] || n; }
  function my(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function nextWeekday(s){ var t = s2day(s) + 1; for (var i = 0; i < 5; i++){ var w = new Date(t * 864e5).getUTCDay(); if (w > 0 && w < 6) break; t++; } return day2s(t); }
  function cands(R){
    var by = (R.rep && R.rep.by_id) || {}, out = [], API = window.__elsApi, Dd = API && API.D && API.D();
    ((Dd && Dd.els) || []).forEach(function(x){ var k = by[x.isin]; if (k && (x.pp || 0) < 100) out.push({id: x.isin, nm: x.n, iss: "미래에셋증권", key: k, e: x.e, cpn: x.cpn}); });
    ((R.all && R.all.items) || []).forEach(function(x){ var k = by[x.id]; if (k && x.kind !== "ELB" && !x.nolos) out.push({id: x.id, nm: String(x.nm || "").replace(/\s*\[.*$/, "").replace(/파생결합증권\(주가연계증권\)/, "ELS"), iss: String(x.iss || "").replace(/주식회사|\(주\)/g, "").trim(), key: k, e: x.e, cpn: x.cpn}); });
    var seen = {}; return out.filter(function(c){ if (seen[c.id]) return false; seen[c.id] = 1; return parseKey(c.key).ua.every(function(u){ return EIDX && EIDX.assets[u]; }); });
  }
  function condTxt(q){ return q.ua.map(lab).join("·") + ' · ' + q.bars.join("-") + ' · ' + q.cyc + '개월마다 · KI ' + (q.ki == null ? "없음" : q.ki); }
  var EM = {open: 0, q: "", busy: 0};
  function itemH(it, M){
    var q = parseKey(it.key), head = '<div class="em-ih"><div><b>' + e(it.nm) + '</b>' + (it.virt ? ' <span class="em-v">🧪 가상</span>' : '') + '<small>' + e(it.iss || "") + ' · ' + e(condTxt(q)) + '</small></div><button class="em-x" data-emx="' + e(it.id) + '" aria-label="빼기">✕</button></div>';
    var dt = '<label class="em-dt">기준일 <input type="date" data-emd="' + e(it.id) + '" value="' + e(it.base) + '"><button data-emt="' + e(it.id) + '">오늘로</button></label>';
    if (!M) return '<div class="em-it">' + head + '<div class="mut em-l">기초자산 일봉 자료가 없어요(18개 밖).</div>' + dt + '</div>';
    if (M.wait) return '<div class="em-it">' + head + '<div class="em-l">⏳ 기준가가 아직 안 정해졌어요 — <b>' + md(it.base) + '</b> 종가가 기준(발행일이 다르면 아래 날짜를 고쳐 주세요).</div>' + dt + '</div>';
    if (M.done) return '<div class="em-it">' + head + '<div class="em-l em-ok">✅ ' + (M.done.k + 1) + '차 평가(' + md(M.done.d) + ')에서 가장 못한 자산 ' + Math.round(M.done.w * 100) + '% ≥ ' + q.bars[M.done.k] + ' — 상환 조건을 넘었어요(증권사 공지로 확인).</div>' + dt + '</div>';
    var bars = q.ua.map(function(u, i){ var r = M.cur[i] * 100, pos = Math.max(0, Math.min(100, (r - 40) / (130 - 40) * 100));
      return '<div class="em-ua"><span>' + e(lab(u)) + (i === M.wa ? ' <i>가장 못함</i>' : '') + '</span><div class="em-tr"><i class="em-bar" style="left:' + ((M.next ? M.next.bar : q.bars[q.bars.length - 1]) - 40) / 0.9 + '%"></i>' + (q.ki != null ? '<i class="em-ki" style="left:' + (q.ki - 40) / 0.9 + '%"></i>' : '') + '<i class="em-dot ' + cl(r - 100) + '" style="left:' + pos + '%"></i></div><b class="' + cl(r - 100) + '">' + sg(r - 100, 1) + '%</b></div>'; }).join("");
    var nx = M.next, dd = nx ? Math.round(nx.t - s2day(kst())) : null, gap = nx ? M.w * 100 - nx.bar : null;
    var H = M.hist, hist = H && H.n >= 10 ? '<div class="em-hs">🕰 과거에 이 위치(가장 못한 자산 ' + Math.round(M.w * 100) + '% ±' + Math.round(H.tol * 100) + ' · 같은 차례' + (q.ki != null ? ' · KI ' + (M.kt ? '닿음' : '안 닿음') : '') + ')였던 가입일 <b>' + H.n.toLocaleString() + '</b>번 →' +
        '<div class="em-hb"><span style="flex:' + H.next + '" class="a"></span><span style="flex:' + (H.early - H.next) + '" class="b"></span><span style="flex:' + H.mat + '" class="c"></span><span style="flex:' + H.loss + '" class="d"></span></div>' +
        '<div class="em-hl"><span><i class="a"></i>다음 평가 상환 <b>' + Math.round(H.next / H.n * 100) + '%</b></span><span><i class="b"></i>그 뒤 상환 ' + Math.round((H.early - H.next) / H.n * 100) + '%</span>' + (H.mat ? '<span><i class="c"></i>만기 원금 ' + Math.round(H.mat / H.n * 100) + '%</span>' : '') + '<span><i class="d"></i>손실 <b>' + Math.round(H.loss / H.n * 100) + '%</b></span></div></div>'
      : '<div class="em-hs mut">🕰 과거에 이 위치였던 가입일이 ' + (H ? H.n : 0) + '번뿐이라 비율은 안 보여 줘요.</div>';
    return '<div class="em-it">' + head +
      '<div class="em-k"><div><small>다음 평가</small><b>' + (nx ? (nx.k + 1) + '차 · D-' + dd : '만기 지남') + '</b><em>' + (nx ? md(day2s(nx.t)) + ' · 배리어 ' + nx.bar : '') + '</em></div>' +
        '<div><small>배리어까지</small><b class="' + (gap >= 0 ? "up" : "dn") + '">' + (gap == null ? "–" : sg(gap, 1) + '%p') + '</b><em>' + (gap == null ? '' : gap >= 0 ? '지금이면 상환' : '더 올라야 상환') + '</em></div>' +
        '<div><small>' + (q.ki != null ? 'KI ' + q.ki + '까지' : 'KI') + '</small><b class="' + (M.kt ? "dn" : "") + '">' + (q.ki == null ? '없음' : M.kt ? '닿음' : sg(q.ki - M.w * 100, 0) + '%p') + '</b><em>' + (q.ki != null && !M.kt ? '여기까지 빠지면 손실 위험' : q.ki != null ? '만기에 못 넘으면 손실' : '만기 배리어 밑이면 손실') + '</em></div></div>' +
      bars + '<div class="em-lg"><span><i class="em-bar"></i>다음 배리어</span>' + (q.ki != null ? '<span><i class="em-ki"></i>KI</span>' : '') + '<span class="mut">기준가 ' + md(M.base) + ' → ' + md(M.last) + ' 종가</span></div>' + hist + dt + '</div>';
  }
  function emDraw(){
    var box = document.getElementById("elsmy"); if (!box) return;
    var L = my();
    box.innerHTML = '<div class="em-hd"><b>📌 내 ELS 관제탑</b><small>' + (L.length ? L.length + '개 · 휴대폰에만 저장' : '들고 있거나 지켜볼 ELS 를 담아 두면 매일 「지금 어디쯤」') + '</small></div>' +
      (L.length ? '<div id="emov"></div><div id="emlist"><div class="loading">계산 중…</div></div>' : '<p class="em-in">청약한 ELS(또는 지켜볼 상품)를 담아 두면 — 기초자산마다 기준가 대비 · 다음 평가까지 D-day · 배리어까지 여유 · KI 까지 거리, 그리고 <b>2006년부터 「과거에 이 위치였던 가입일들은 어떻게 끝났나」</b>를 매일 보여 줘요. 두 개 넘게 담으면 「같이 손실로 끝난 비율」도.</p>') +
      '<button class="em-add" id="emadd">' + (EM.open ? '닫기 ▴' : '＋ 담아 두기') + '</button><div id="empick"' + (EM.open ? '' : ' hidden') + '></div>' +
      '<p class="note" style="margin:6px 0 0">과거 계산 · 미래 보장 아님 · 기본 스텝다운 기준(월지급·리자드 빼고) · 실제 상환은 증권사 공지로 확인 · 사라는 뜻이 아니에요.</p>';
    document.getElementById("emadd").onclick = function(ev){ ev.stopPropagation(); EM.open = !EM.open; emDraw(); };
    if (EM.open) pickDraw();
    if (!L.length) return;
    eload().then(function(){
      return Promise.all(L.map(function(it){ var q = parseKey(it.key); return Promise.all(q.ua.map(epx)).then(function(ss){
        if (ss.some(function(x){ return !x; })) return null; var G = align(ss); G.K = G.C.map(sparse); var t0 = performance.now(), M = null; try { M = monitor(it, G); } catch(x) { console.warn(x); } if (M) M.ms = performance.now() - t0; return M; }); }));
    }).then(function(MS){
      var el = document.getElementById("emlist"); if (!el) return;
      el.innerHTML = L.map(function(it, i){ return itemH(it, MS[i]); }).join("");
      bindItems(el);
      var live = L.filter(function(it, i){ var M = MS[i]; return M && !M.wait && !M.done; });
      var ov = document.getElementById("emov");
      if (ov && live.length >= 2){ ov.innerHTML = '<div class="em-ov mut">🔗 겹침 계산 중…</div>';
        overlap(live).then(function(O){ var o = document.getElementById("emov"); if (!o) return;
          if (!O){ o.innerHTML = ''; return; }
          if (O.any < 20){ o.innerHTML = '<div class="em-ov">🔗 ' + O.from.replace("-", ".") + '~ 매 거래일 ' + live.length + '개를 같이 가입했다면 ' + O.tot.toLocaleString() + '번 중 하나라도 손실로 끝난 게 ' + O.any + '번뿐 — 겹침(같이 깨진 비율)을 셀 만큼 손실이 없었어요.</div>'; return; }
          var p = O.any ? Math.round(O.both / O.any * 100) : 0;
          o.innerHTML = '<div class="em-ov"><div class="em-ovb"><b>' + p + '%</b><small>겹침</small></div><div>' + O.from.replace("-", ".") + '~ 매 거래일 ' + live.length + '개를 같이 가입했다면 <b>' + O.tot.toLocaleString() + '</b>번 중 하나라도 손실 ' + O.any.toLocaleString() + '번 — 그중 <b>' + p + '%</b>는 ' + (live.length > 2 ? '두 개 넘게' : '둘 다') + ' 같이 손실' +
            '<small>' + (p >= 60 ? '기초자산이 겹쳐 나눠 들어도 위험이 잘 안 나뉘어요' : p >= 30 ? '꽤 같이 움직여요' : '위험이 꽤 나뉘어 있어요') + ' · 따로따로 손실: ' + live.map(function(it, i){ return e(String(it.nm).slice(0, 12)) + ' ' + Math.round(O.ones[i] / O.tot * 100) + '%'; }).join(" · ") + '</small></div></div>'; });
      } else if (ov) ov.innerHTML = '';
    });
  }
  function save(L){ ls("elsmy", L); }
  function bindItems(el){
    [].forEach.call(el.querySelectorAll("[data-emx]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var id = b.getAttribute("data-emx"); save(my().filter(function(x){ return x.id !== id; })); emDraw(); }; });
    [].forEach.call(el.querySelectorAll("[data-emd]"), function(i){ i.addEventListener("click", function(ev){ ev.stopPropagation(); }); i.onchange = function(){ var id = i.getAttribute("data-emd"), v = i.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return; save(my().map(function(x){ if (x.id === id) x.base = v; return x; })); emDraw(); }; });
    [].forEach.call(el.querySelectorAll("[data-emt]"), function(b){ b.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); var id = b.getAttribute("data-emt"); save(my().map(function(x){ if (x.id === id){ x.base = kst(); x.virt = 1; } return x; })); emDraw(); }; });
  }
  function pickDraw(){
    var el = document.getElementById("empick"); if (!el) return;
    el.innerHTML = '<div class="loading">청약 중 상품 불러오는 중…</div>';
    eload().then(function(R){
      var el2 = document.getElementById("empick"); if (!el2) return;
      var C = cands(R), have = {}; my().forEach(function(x){ have[x.id] = 1; });
      var qv = EM.q.trim(), list = C.filter(function(c){ return !qv || (c.nm + c.iss + c.key).toLowerCase().indexOf(qv.toLowerCase()) >= 0; });
      el2.innerHTML = '<input aria-label="상품·증권사·기초자산" class="em-q" id="emq" placeholder="🔎 상품·증권사·기초자산 (예: 삼성전자, KB)" value="' + e(EM.q) + '">' +
        '<div class="em-pl">' + (list.length ? list.slice(0, 40).map(function(c){ var q = parseKey(c.key);
          return '<div class="em-pr"><div><b>' + e(c.nm) + '</b><small>' + e(c.iss) + ' · ' + e(condTxt(q)) + (c.cpn != null ? ' · 연 ' + c.cpn + '%' : '') + ' · 청약 마감 ' + md(c.e) + '</small></div>' +
            (have[c.id] ? '<span class="mut">담음</span>' : '<button data-emp="' + e(c.id) + '">📌 담기</button>') + '</div>'; }).join("") : '<div class="empty">맞는 상품이 없어요 — 자료가 있는 기초자산(18개) 상품만 담을 수 있어요.</div>') + '</div>' +
        '<p class="note" style="margin:4px 0 0">기준일은 청약 마감 다음 평일(보통 발행일)로 잡아요 · 다르면 담은 뒤 고칠 수 있고 「오늘로」를 누르면 오늘 가입한 셈(🧪 가상)이에요.</p>';
      var qi = document.getElementById("emq");
      qi.addEventListener("click", function(ev){ ev.stopPropagation(); });
      qi.oninput = function(){ EM.q = qi.value; clearTimeout(pickDraw.t); pickDraw.t = setTimeout(function(){ pickDraw(); var n = document.getElementById("emq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); };
      [].forEach.call(el2.querySelectorAll("[data-emp]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var c = C.filter(function(x){ return x.id === b.getAttribute("data-emp"); })[0]; if (!c) return;
        var L = my(); L.push({id: c.id, nm: c.nm, iss: c.iss, key: c.key, base: nextWeekday(c.e || kst()), at: kst()}); save(L); EM.open = 0; emDraw(); }; });
    });
  }
  function elsMount(){
    var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== "els" || document.getElementById("elsmy")) return;
    if (root.querySelector(".loading") && !root.querySelector("#pdbody")) return;
    var box = document.createElement("section"); box.className = "card em no-clp"; box.id = "elsmy"; box.dataset.xc = "1";   // 길어도 「전체 보기」로 자르지 않음(simple.js)
    root.insertBefore(box, root.firstChild); emDraw();
  }
  // 펼친 미래에셋 ELS 카드 안에도 「📌 관제탑에 담기」
  function elsPinBtn(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot[data-k=els] .pd-e.on > .pd-x:not([data-em])"), function(p){
      p.setAttribute("data-em", "1"); var row = p.parentNode, o = __pdObj(row.dataset.x); o = o && o.o; if (!o || !o.isin) return;
      eload().then(function(R){ var k = R.rep && R.rep.by_id && R.rep.by_id[o.isin]; if (!k || (o.pp || 0) >= 100) return;
        var have = my().some(function(x){ return x.id === o.isin; }), b = document.createElement("button"); b.className = "em-add em-pin"; b.type = "button";
        b.textContent = have ? "📌 관제탑에 담겨 있어요" : "📌 내 ELS 관제탑에 담아 두기"; b.disabled = have;
        b.onclick = function(ev){ ev.stopPropagation(); var L = my(); if (!L.some(function(x){ return x.id === o.isin; })) L.push({id: o.isin, nm: o.n, iss: "미래에셋증권", key: k, base: nextWeekday(o.e || kst()), at: kst()}); save(L);
          b.textContent = "📌 담았어요 — 맨 위 관제탑"; b.disabled = true; var m = document.getElementById("elsmy"); if (m){ emDraw(); } };
        p.appendChild(b); });
    });
  }
  window.__elsMy = {monitor: monitor, simAt: simAt, parseKey: parseKey, align: align, sparse: sparse, epx: epx, load: eload};   // 검사용

  /* ═════════ ③ 👁 내 눈 vs 거름망 ═════════ */
  // 저장: eyeScr = {"2026-10-22": ["SYM", …]} (그날 「볼 만함」 누른 것) · 그날 목록 전체는 화면에서 본 screens.json 을 다시 받음
  function eyes(){ var o = ls("eyeScr"); return o && typeof o === "object" ? o : {}; }
  function shard(sym){ if (typeof window.opShard === "function") return opShard(sym); var h = 0x811c9dc5, b = new TextEncoder().encode(sym); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } var x = (h % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  var PSH = {};
  function pShard(sh){ if (!PSH[sh]) PSH[sh] = getJSON(OPD + "p/" + sh + ".json", {ttl: 3600e3}).catch(function(){ return {}; }); return PSH[sh]; }
  function lastPx(sym){ var c = /^\d{6}$/.test(sym) ? [sym + ".KS", sym + ".KQ"] : [sym];
    return Promise.all(c.map(function(s){ return pShard(shard(s)).then(function(j){ return j && j[s]; }); })).then(function(r){ for (var i = 0; i < r.length; i++) if (r[i]) return r[i]; return null; }); }
  var SCR = {};
  function scrDay(d){ if (!SCR[d]) SCR[d] = getJSON("archive/screen/" + d + "/screens.json", {ttl: 3600e3}).catch(function(){ SCR[d] = null; return null; }); return SCR[d]; }
  function rowsOf(D){ var m = {}; ["quiet", "lead", "hush", "triple"].forEach(function(k){ (D && D[k] || []).forEach(function(r){ if (r && r.s && r.c != null && !m[r.s]) m[r.s] = {s: r.s, n: r.n, c: +r.c}; }); }); return m; }
  function scoreDay(d, picks){
    var key = "eyeSc:" + d;
    return scrDay(d).then(function(D){
      if (!D) return null;
      var R = rowsOf(D), syms = Object.keys(R), sd = D.date || d;
      return Promise.all(syms.map(function(s){ return lastPx(s).then(function(p){ return p && p[0] > sd && p[1] > 0 ? {s: s, r: (p[1] / R[s].c - 1) * 100, at: p[0]} : null; }); })).then(function(rs){
        var P = {}; picks.forEach(function(s){ P[s] = 1; });
        var a = [], b = [], at = ""; rs.forEach(function(x){ if (!x) return; (P[x.s] ? a : b).push(x); if (x.at > at) at = x.at; });
        var avg = function(L){ if (!L.length) return null; var s = 0; L.forEach(function(x){ s += x.r; }); return s / L.length; };
        var all = a.concat(b), out = {d: d, n_pick: a.length, n_skip: b.length, pick: avg(a), skip: avg(b), all: avg(all), at: at,
          jump: b.filter(function(x){ return x.r >= 10; }).sort(function(x, y){ return y.r - x.r; }).slice(0, 2).map(function(x){ return {s: x.s, n: R[x.s].n, r: x.r}; })};
        ls(key, out); return out;
      });
    });
  }
  function eyeScores(){
    var E = eyes(), days = Object.keys(E).filter(function(d){ return (E[d] || []).length && d < kst(); }).sort().slice(-20);
    return Promise.all(days.map(function(d){ return scoreDay(d, E[d]); })).then(function(L){ return L.filter(function(x){ return x && x.n_pick; }); });
  }
  function eyeSum(L){
    var np = 0, sp = 0, sa = 0, na = 0, win = 0;
    L.forEach(function(x){ np += x.n_pick; sp += x.pick * x.n_pick; sa += x.all * (x.n_pick + x.n_skip); na += x.n_pick + x.n_skip; if (x.pick > x.all) win++; });
    return {days: L.length, np: np, pick: np ? sp / np : null, all: na ? sa / na : null, win: win};
  }
  var SCR_SEL = "";
  function scrMount(){
    if (!document.getElementById("scrk")) return;
    var root = document.getElementById("scrk").parentNode, date = curScrDate();
    if (!date) return;
    if (!root.querySelector("#eyesum")){ var s = document.createElement("div"); s.id = "eyesum"; s.className = "eye-sum"; root.insertBefore(s, root.firstChild); eyeTop(); }
    var E = eyes(), mine = E[date] || [];
    [].forEach.call(root.querySelectorAll(".list .st"), function(st){
      if (st.querySelector(".eye-b")) return;
      var a = st.querySelector(".nm a"), m = a && /openOP\('([^']+)'\)/.exec(a.getAttribute("href") || ""); if (!m) return;
      var sym = m[1].replace(/\\'/g, "'"), on = mine.indexOf(sym) >= 0, b = document.createElement("button");
      b.type = "button"; b.className = "eye-b" + (on ? " on" : ""); b.textContent = on ? "👁 볼 만함 ✓" : "👁 볼 만함"; b.dataset.s = sym;
      b.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); var E2 = eyes(), L = E2[date] || [], i = L.indexOf(sym);
        if (i >= 0) L.splice(i, 1); else L.push(sym); E2[date] = L; ls("eyeScr", E2);
        var on2 = L.indexOf(sym) >= 0; b.classList.toggle("on", on2); b.textContent = on2 ? "👁 볼 만함 ✓" : "👁 볼 만함"; eyeTop(); };
      st.appendChild(b);
    });
  }
  function curScrDate(){ var d = window.curDate; return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }   // 고른 날짜 칩(index.html 전역 curDate)
  function eyeTop(){
    var el = document.getElementById("eyesum"); if (!el) return;
    var date = curScrDate(), E = eyes(), today = (E[date] || []).length;
    var head = '<div class="eye-h"><b>👁 내 눈 vs 거름망</b><small>' + (date ? md(date) + ' 볼 만함 ' + today + '개 찍음' : '') + ' · 안 누른 건 넘긴 것으로 셈</small></div>';
    el.innerHTML = head + '<div class="eye-l mut">채점 불러오는 중…</div>';
    eyeScores().then(function(L){
      var el2 = document.getElementById("eyesum"); if (!el2) return;
      if (!L.length){ el2.innerHTML = head + '<div class="eye-l">카드마다 「👁 볼 만함」을 누르면 <b>다음 날 아침부터</b> 「찍은 것 vs 거름망 전체」를 그날 종가 → 가장 최근 종가로 채점해요.</div>'; return; }
      var x = L[L.length - 1], S = eyeSum(L), dif = x.pick - x.all, sd = S.pick - S.all;
      el2.innerHTML = head +
        '<div class="eye-l">' + md(x.d) + ' 찍은 <b>' + x.n_pick + '개</b> <b class="' + cl(x.pick) + '">' + sg(x.pick, 1) + '%</b> · 안 찍은 ' + x.n_skip + '개 ' + sg(x.skip, 1) + '%</div>' +
        '<div class="eye-k">내 눈이 거름망보다 <b class="' + cl(dif) + '">' + sg(dif, 1) + '%p</b></div>' +
        '<div class="eye-s">거름망 전체 ' + sg(x.all, 1) + '% · ' + md(x.d) + ' 종가 → ' + md(x.at) + ' 종가' + (L.length > 1 ? ' · 쌓인 ' + S.days + '일 ' + S.np + '개 평균 ' + sg(sd, 1) + '%p (' + S.win + '/' + S.days + '일 이김)' : '') + '</div>' +
        (x.jump.length ? '<div class="eye-j">😬 넘긴 것 중 크게 뛴 것: ' + x.jump.map(function(j){ return '<a href="javascript:openOP(\'' + e(j.s) + '\')">' + e(j.n || j.s) + '</a> ' + sg(j.r, 0) + '%'; }).join(" · ") + '</div>' : '');
    });
  }
  // 📊 성적표 카드
  function scoreMount(){
    var m = document.getElementById("main"); if (!m || document.getElementById("eyescore")) return;
    var anchor = m.querySelector(".sc-c"); if (!anchor || (window.cur && cur !== "score")) return;
    var E = eyes(); if (!Object.keys(E).some(function(d){ return (E[d] || []).length; })) return;
    var s = document.createElement("section"); s.className = "card sc-c"; s.id = "eyescore"; s.dataset.goto = "screen";
    s.innerHTML = '<div class="sc-h"><div><b>👁 내 눈 — 아침 거르기</b><small>내가 「볼 만함」 찍은 종목 vs 그날 거름망 전체</small></div></div><div class="eye-l mut">채점 불러오는 중…</div>';
    anchor.parentNode.insertBefore(s, anchor);
    eyeScores().then(function(L){
      var el = document.getElementById("eyescore"); if (!el) return;
      if (!L.length){ el.querySelector(".eye-l").innerHTML = '찍은 다음 날부터 채점돼요.'; return; }
      var S = eyeSum(L), d = S.pick - S.all;
      el.innerHTML = '<div class="sc-h"><div><b>👁 내 눈 — 아침 거르기</b><small>찍은 날 종가 → 가장 최근 종가 · ' + S.days + '일 · ' + S.np + '개</small></div><div class="eye-big"><b class="' + cl(d) + '">' + sg(d, 1) + '%p</b><small>거름망보다</small></div></div>' +
        '<div class="eye-dots">' + L.map(function(x){ var v = x.pick - x.all; return '<i class="' + (v > 0 ? "w" : "l") + '" title="' + x.d + ' ' + sg(v, 1) + '%p"></i>'; }).join("") + '</div>' +
        '<div class="eye-l mut">찍은 것 평균 ' + sg(S.pick, 1) + '% · 거름망 전체 ' + sg(S.all, 1) + '% · 이긴 날 ' + S.win + '/' + S.days + (S.days < 10 ? ' · 10일 쌓이기 전엔 참고만' : '') + '</div>';
    });
  }

  /* ── 붙이기 ── */
  var T = null;
  function tick(){ T = null; try { homePanic(); } catch(x) { console.warn(x); } try { elsMount(); elsPinBtn(); } catch(x) { console.warn(x); } try { scrMount(); } catch(x) { console.warn(x); } try { scoreMount(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".hmpn{cursor:pointer}.pnh-h b{display:block;font-size:var(--fs-h,17px);font-weight:800;word-break:keep-all}.pnh-h small{display:block;font-size:12.5px;color:var(--sub);margin:3px 0 4px;word-break:keep-all}" +
    ".pnh-r{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:baseline;padding:7px 0;border-top:1px solid var(--line);font-size:13.5px}.pnh-r>b{font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap}.pnh-r b.up{color:var(--up)}.pnh-r b.dn{color:var(--down)}" +
    ".pnh-r em{font-style:normal;font-size:12.5px;color:var(--sub);white-space:nowrap;text-align:right}.pnh-r em b{color:var(--text);font-size:12.5px}.pnh-b{grid-template-columns:auto 1fr}.pnh-b span{grid-column:1/-1;font-weight:700;word-break:keep-all}.pnh-b em{text-align:left;white-space:normal}.pnh-go{margin-top:6px;font-size:13px;font-weight:700;color:var(--acc,#7c9cff)}" +
    ".em-hd b{display:block;font-size:var(--fs-h,17px);font-weight:800}.em-hd small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px}.em-in{font-size:13px;color:var(--sub);margin:8px 0;word-break:keep-all}.em-in b{color:var(--text)}" +
    ".em-add{display:block;width:100%;margin:8px 0 0;border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}.em-add:disabled{opacity:.7}" +
    ".em-q{width:100%;box-sizing:border-box;margin:8px 0 4px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:14px}" +
    ".em-pl{max-height:360px;overflow:auto}.em-pr{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}.em-pr b{font-size:13.5px}.em-pr small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".em-pr button{flex:none;border:0;background:#f4a261;color:#111;border-radius:999px;padding:6px 11px;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer}" +
    ".em-it{margin:10px 0 0;padding:10px 0 0;border-top:1px solid var(--line)}.em-ih{display:flex;justify-content:space-between;gap:8px}.em-ih b{font-size:14.5px}.em-ih small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".em-x{flex:none;border:0;background:none;color:var(--sub);font-size:16px;cursor:pointer;padding:0 4px;height:28px}.em-v{font-size:12.5px;padding:1px 6px;border-radius:999px;background:var(--panel2);color:var(--sub)}" +
    ".em-k{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.em-k>div{background:var(--panel2);border-radius:10px;padding:7px 4px;text-align:center}.em-k small,.em-k em{display:block;font-size:12.5px;color:var(--sub);font-style:normal;word-break:keep-all}" +
    ".em-k b{display:block;font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap;margin:1px 0}.em-k b.up,.em-ua b.up{color:var(--up)}.em-k b.dn,.em-ua b.dn{color:var(--down)}" +
    ".em-ua{display:grid;grid-template-columns:88px 1fr 58px;gap:8px;align-items:center;font-size:12.5px;margin:5px 0}.em-ua span i{font-style:normal;font-size:12.5px;color:#ff6b6b;display:block}.em-ua>b{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".pnh-now{background:rgba(255,80,80,.08);border-radius:8px;padding:6px 8px}.em-tr{position:relative;height:8px;border-radius:4px;background:var(--panel2)}.em-tr i{position:absolute;top:-3px;bottom:-3px;width:2px}.em-bar{background:#3fb950}.em-ki{background:#ff6b6b}.em-tr .em-dot{width:12px;height:12px;top:-2px;bottom:auto;border-radius:50%;margin-left:-6px;background:var(--text);border:2px solid var(--panel)}" +
    ".em-lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub)}.em-lg i{display:inline-block;width:2px;height:10px;margin-right:4px;vertical-align:middle}" +
    ".em-hs{font-size:12.5px;margin:8px 0 0;word-break:keep-all}.em-hb{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1px;margin:5px 0 3px}.em-hb .a,.em-hl i.a{background:#3fb950}.em-hb .b,.em-hl i.b{background:#8fd19e}.em-hb .c,.em-hl i.c{background:#8a94a8}.em-hb .d,.em-hl i.d{background:#ff6b6b}" +
    ".em-hl{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:12.5px;color:var(--sub)}.em-hl b{color:var(--text)}.em-hl i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:3px}" +
    ".em-dt{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--sub);margin:8px 0 0}.em-dt input{font:inherit;font-size:13px;padding:3px 6px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.em-dt button{border:1px solid var(--line);background:none;color:var(--sub);border-radius:999px;padding:3px 8px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".em-l{font-size:13px;margin:6px 0 0;word-break:keep-all}.em-ok{color:#3fb950}" +
    ".em-ov{display:flex;gap:10px;align-items:center;margin:10px 0 0;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,#f4a261 12%,var(--panel2));font-size:12.5px;word-break:keep-all}.em-ov small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}" +
    ".em-ovb{flex:none;text-align:center;min-width:54px}.em-ovb b{display:block;font-size:24px;font-variant-numeric:tabular-nums}.em-ovb small{margin:0}" +
    ".eye-b{display:block;margin:8px 0 0 auto;border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:3px 9px;font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap}.eye-b.on{background:#7ee0b5;color:#0b2;border-color:transparent;font-weight:800;color:#063}" +
    ".eye-sum{margin:0 0 10px;padding:10px 12px;border-radius:14px;background:var(--panel)}.eye-h b{font-size:15px}.eye-h small{display:block;font-size:12.5px;color:var(--sub)}.eye-l{font-size:13px;margin-top:5px;word-break:keep-all}.eye-s{font-size:12.5px;color:var(--sub);margin-top:2px;word-break:keep-all}.eye-l b.up,.eye-k b.up,.eye-big b.up{color:var(--up)}.eye-l b.dn,.eye-k b.dn,.eye-big b.dn{color:var(--down)}" +
    ".eye-k{margin-top:4px;font-size:14px;font-weight:700}.eye-j{margin-top:4px;font-size:12.5px;color:var(--sub)}.eye-big{margin-left:auto;text-align:right}.eye-big b{display:block;font-size:24px;font-variant-numeric:tabular-nums}.eye-big small{font-size:12.5px;color:var(--sub)}" +
    ".eye-dots{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0 2px}.eye-dots i{width:10px;height:10px;border-radius:50%}.eye-dots i.w{background:#3fb950}.eye-dots i.l{background:#ff6b6b}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
__bk(55);
__be(5);
