/* CH Investing — 10/14 15시 아이디어 보고 A15 (사용자: "다 진행해")
   A15-1 🧱 아래 탭 바 「글자 비침」 막기 — 탭 바·머리 배경을 거의 불투명하게 + 탭 바 위에 사라지는 그림자 한 줄
   A15-2 🔡 작은 글자 바닥선 11.5px + 흐린 글자(--dim) 대비 약 3:1 → 4.7:1 · 밝은 모드 상표 「CH」 진하게
   A15-3 📏 글자 크기 「📱 폰 따라감」(아이폰 텍스트 크기) + 5단계 — zoom 대신 글자 크기 규칙만 고쳐 씀(카드·여백은 그대로)
   A15-4 🌈 오늘 날씨 색 — 🧭 국면 신호판(미·한 합본) 두 점수로 맑음·흐림·비·보류를 정해 머리 띠·홈 첫 카드를 아주 옅게 물들임
   A15-5 🪪 홈 카드 머리 한 벌 + 왼쪽 탭 색 띠(어느 탭 이야기인지) */
(function(){
  var D = document.documentElement;

  /* ---------- A15-2 · A15-3 글자 ---------- */
  var ORIG = new WeakMap(), F = 1, FLOOR = 11.5;
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
      var v = Math.round(Math.max(o.px, FLOOR) * (o.chrome ? 1 : F) * 10) / 10;
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
