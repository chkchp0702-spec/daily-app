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
    ".td-chipmore{display:inline-flex;align-items:center;padding:4px 10px;border:1px dashed var(--line);border-radius:999px;background:transparent;color:var(--sub);font:inherit;font-size:12px;font-weight:700;cursor:pointer}" +
    ".td-sw{display:flex;align-items:center;gap:8px;padding:10px 4px;font-size:14px}.td-sw small{color:var(--sub);font-size:12px}" +
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
