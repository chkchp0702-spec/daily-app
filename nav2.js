/* CH Investing — 화면 정리 (10/11 사용자: "보기 좋게 심플하게 · 상위 하위 · 펼치기 접기 · 중복은 빼도 됨 · 돋보기가 있는데 종목 카테고리가 있는 것도")
   ① 아래 탭 바 5개(오늘·시장·포트·신호·피드) → 위에는 그 묶음의 작은 탭만 (14칸 격자 대신)
   ② 📄 종목 탭은 🔍 검색으로, 🔔 알림·💬 의견함은 ⚙️ 안으로 (주소 #onepager·#alarm·#idea 는 그대로 열림)
   ③ 탭 머리(큰 소개 카드)는 한 줄로 — 소개 글은 머리를 누르면
   ④ 뒤로 버튼은 돌아갈 곳이 있을 때만 */
(function(){
  var GROUPS = [
    {k: "home", ic: "🏠", t: "오늘", tabs: ["home"]},
    {k: "mkt",  ic: "🌐", t: "시장", tabs: ["market", "sector"]},
    {k: "inv",  ic: "💼", t: "포트", tabs: ["port", "score"]},
    {k: "sig",  ic: "🎯", t: "신호", tabs: ["whale", "cup", "gap", "accum", "danta"]},
    {k: "feed", ic: "📰", t: "피드", tabs: ["feed"]}
  ];
  var LAB = {market: "🌐 시황", sector: "🧭 나침반", port: "💼 포트", score: "📊 성적표", whale: "🐋 고래", cup: "☕ 컵", gap: "📈 갭", accum: "🤫 매집", danta: "⚡ 단타"};
  function grpOf(k){ for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].tabs.indexOf(k) >= 0) return GROUPS[i]; return null; }
  function last(g){ var m = (window.store && store.gl) || {}; return m[g.k] && g.tabs.indexOf(m[g.k]) >= 0 ? m[g.k] : g.tabs[0]; }

  function bar(){
    var b = document.getElementById("bnav");
    if (!b){
      b = document.createElement("nav"); b.id = "bnav";
      b.innerHTML = GROUPS.map(function(g){ return '<button data-g="' + g.k + '"><span class="i">' + g.ic + '</span><span>' + g.t + '</span></button>'; }).join("");
      document.body.appendChild(b);
      [].forEach.call(b.children, function(x){ x.onclick = function(){
        var g = GROUPS.filter(function(y){ return y.k === x.dataset.g; })[0], gc = grpOf(cur);
        if (gc === g){ window.scrollTo({top: 0, behavior: "smooth"}); return; }   // 지금 묶음을 또 누르면 맨 위로
        go(last(g)); }; });
    }
    var gc = grpOf(cur);
    [].forEach.call(b.children, function(x){ x.classList.toggle("on", !!gc && x.dataset.g === gc.k); });
  }
  window.drawTabs = function(){
    var nav = document.getElementById("tabs"); if (!nav) return;
    var g = grpOf(cur);
    if (g){ store.gl = store.gl || {}; store.gl[g.k] = cur; try { save(); } catch(x) {} }
    if (g && g.tabs.length > 1){
      nav.className = "tabs sub";
      nav.innerHTML = g.tabs.map(function(k){ var c = CATS.filter(function(x){ return x.key === k; })[0] || {};
        return '<button class="tab' + (k === cur ? " on" : "") + '" style="--c:' + c.color + '" data-k="' + k + '">' + (LAB[k] || c.name) + '</button>'; }).join("");
      [].forEach.call(nav.children, function(b){ b.onclick = function(){ if (b.dataset.k !== cur) go(b.dataset.k); }; });
      var on = nav.querySelector(".on"); if (on && on.scrollIntoView) try { on.scrollIntoView({inline: "center", block: "nearest"}); } catch(x) {}
    } else { nav.className = "tabs sub none"; nav.innerHTML = ""; }
    bar();
    setTimeout(function(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }, 0);   // 접기 칩이 헤더 바로 아래 붙게
  };

  // ③ 탭 머리: 누르면 소개 글
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest("#main > .hero"); if (!h || ev.target.closest("button,a")) return;
    h.classList.toggle("show");
  });

  // ④ 긴 카드 접기는 simple.js(clampLong)가 함 — 알림·링크로 그 안의 카드에 갈 땐 펼쳐서
  window.unclamp = function(el){ var c = el && el.closest && el.closest(".xs-clamp"); if (c){ c.classList.remove("xs-clamp"); var b = c.querySelector(":scope > .xs-cl"); if (b) b.textContent = "접기 ▴"; } };


  var css = document.createElement("style");
  css.textContent =
    // 위: 묶음 안의 작은 탭 (가로로 밀기)
    "header .tabs.sub{display:flex!important;gap:6px;overflow-x:auto;padding:0 12px 10px;scrollbar-width:none;grid-template-columns:none}" +
    "header .tabs.sub::-webkit-scrollbar{display:none}header .tabs.sub.none{display:none!important}" +
    "header .tabs.sub .tab{flex:none;flex-direction:row;padding:7px 14px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:-.3px;gap:0;min-width:auto}" +
    "header .tabs.sub .tab.on{background:var(--c);color:#111;border-color:transparent}" +
    ".top{padding-bottom:8px!important}.brand{font-size:20px!important}" +
    // 아래 탭 바
    "#bnav{position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;background:rgba(11,15,23,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);" +
    "border-top:1px solid var(--line);padding:4px 4px calc(env(safe-area-inset-bottom) + 4px)}" +
    "#bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;color:var(--sub);font:inherit;font-size:11.5px;padding:5px 0 3px;cursor:pointer;position:relative}" +
    "#bnav button .i{font-size:21px;line-height:1.15;filter:grayscale(.6);opacity:.75}" +
    "#bnav button.on{color:var(--text);font-weight:800}#bnav button.on .i{filter:none;opacity:1}" +
    "#bnav button.on:before{content:'';position:absolute;top:-4px;left:30%;right:30%;height:3px;border-radius:0 0 3px 3px;background:var(--c,#7c9cff)}" +
    ":root[data-ui=light] #bnav{background:rgba(255,255,255,.94);border-top-color:#dde2ea}" +
    "#backbtn{bottom:calc(env(safe-area-inset-bottom) + 74px)!important}#main{padding-bottom:120px!important}footer{padding-bottom:110px!important}" +
    // 탭 머리 한 줄
    "#main > .hero{background:none!important;border:0!important;box-shadow:none!important;padding:2px 4px 8px!important;margin:0 0 4px!important;cursor:pointer}" +
    "#main > .hero h1{display:inline;font-size:19px!important;letter-spacing:-.4px}" +
    "#main > .hero .meta{display:inline-flex!important;margin:0 0 0 8px!important;vertical-align:2px;gap:4px!important}" +
    "#main > .hero .meta .chip{font-size:11px;padding:2px 7px}" +
    "#main > .hero p{display:none}#main > .hero.show p{display:block;margin-top:6px}" +
    "#main > .hero h1:after{content:' ⓘ';font-size:12px;color:var(--dim);font-weight:400}" +
    // 날짜 칩 한 줄로 작게
    "#main .dates{margin-bottom:10px}#main .date{padding:5px 11px!important;border-radius:999px!important;font-size:11.5px!important;line-height:1.3}" +
    "#main .date b{display:inline!important;font-size:13.5px!important;margin-right:3px}" +
    "#backbtn.root{display:none!important}#backbtn{padding:9px 14px!important;font-size:14px!important}" +
    "";
  document.head.appendChild(css);
  if (window.cur) try { window.drawTabs(); } catch(x) {}
})();
