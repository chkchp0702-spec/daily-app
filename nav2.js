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
    if (cur && cur !== "onepager"){ store.lastTab = cur; }
    try { updBack(); } catch(x) {}
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

  // ⑦ 뒤로: 홈이 아니면 늘 보이게 (알림 링크로 종목 화면을 바로 열었을 때도) — 더 돌아갈 기록이 없으면 보던 탭 → 오늘로
  window.updBack = function(){ var b = document.getElementById("backbtn"); if (!b) return; b.classList.add("on");
    b.classList.toggle("root", !(navD() > 0 || !!document.getElementById("sheet") || (window.cur && cur !== "home"))); };
  var _goBack = window.goBack;
  window.goBack = function(){
    if (document.getElementById("sheet") || navD() > 0) return _goBack();
    var t = (cur === "onepager" && store.lastTab && store.lastTab !== "onepager") ? store.lastTab : "home";
    if (cur !== t) go(t); else window.scrollTo({top: 0, behavior: "smooth"});
  };
  // ③ 탭 머리: 누르면 소개 글
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest("#main > .hero"); if (!h || ev.target.closest("button,a")) return;
    h.classList.toggle("show");
  });

  // ④ 긴 카드 접기는 simple.js(clampLong)가 함 — 알림·링크로 그 안의 카드에 갈 땐 펼쳐서
  window.unclamp = function(el){ var c = el && el.closest && el.closest(".xs-clamp"); if (c){ c.classList.remove("xs-clamp"); var b = c.querySelector(":scope > .xs-cl"); if (b) b.textContent = "접기 ▴"; } };


  // ⑤ 차트 글씨가 겹치면 비켜 쓰기 (섹터 시계·지도·되감기 — 10/11 사용자: "겹치면 비켜써")
  function declutter(svg){
    var ts = [].slice.call(svg.querySelectorAll("text.rotl"));
    var fw = svg.closest(".famw"), ff = fw ? fw.dataset.ff || "" : "";
    if (!svg.getBoundingClientRect().width) return;                          // 안 보이는 카드 — 보일 때 다시
    ts = ts.filter(function(t){ var g = t.closest("[data-fam]"); return !g || (ff ? g.dataset.fam === ff : !!g.closest("[data-top]") || !fw); });
    var sig = ff + "#" + ts.map(function(t){ return (t.dataset.x0 || t.getAttribute("x")) + "," + (t.dataset.y0 || t.getAttribute("y")); }).join("|");
    if (!ts.length || svg.dataset.dc === sig) return;
    var boxes = [];
    try {        // 점(동그라미)도 피해서
      [].forEach.call(svg.querySelectorAll("circle"), function(c){ var r = +c.getAttribute("r"), g = c.closest("[data-fam]"); if (ff && g && g.dataset.fam !== ff) return; if (r >= 3 && r <= 9){ var cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy"); boxes.push({x: cx - r, y: cy - r, w: 2 * r, h: 2 * r}); } });
    } catch(x) {}
    try {        // 구역 이름(🔥 계속 강함 등)도 피해서
      [].forEach.call(svg.querySelectorAll("text.rotq"), function(q){ var b = q.getBBox(); if (b.width) boxes.push({x: b.x, y: b.y, w: b.width, h: b.height}); });
    } catch(x) {}
    [].forEach.call(svg.querySelectorAll(".dc-ln"), function(l){ l.remove(); });
    ts.sort(function(a, b){ return (+a.getAttribute("y")) - (+b.getAttribute("y")); });
    var over = function(b){ return boxes.some(function(o){ return b.x < o.x + o.w + 1 && o.x < b.x + b.w + 1 && b.y < o.y + o.h && o.y < b.y + b.h; }); };
    var W = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 9999;
    for (var i = 0; i < ts.length; i++){
      var t = ts[i];
      if (t.dataset.x0){ t.setAttribute("x", t.dataset.x0); t.setAttribute("y", t.dataset.y0); t.removeAttribute("text-anchor"); }
      var bb; try { bb = t.getBBox(); } catch(x) { return; }
      if (!bb.width) return;                                  // 아직 안 보이는 카드 — 보일 때 다시
      var x0 = +t.getAttribute("x"), y0 = +t.getAttribute("y"); t.dataset.x0 = x0; t.dataset.y0 = y0;
      var dy = bb.y - y0, dx = bb.x - x0, L = -(bb.width + 14), put = null;
      var tries = [[0, 0], [L, 0], [0, -11], [0, 11], [L, -11], [L, 11], [0, -22], [0, 22], [L, -22], [L, 22], [0, -33], [0, 33], [L, -33], [L, 33], [0, -44], [0, 44]];
      for (var j = 0; j < tries.length; j++){
        var b = {x: x0 + dx + tries[j][0], y: y0 + dy + tries[j][1], w: bb.width, h: bb.height};
        if (b.x < 0 || b.x + b.w > W) continue;
        if (!over(b)){ put = tries[j]; boxes.push(b); break; }
      }
      if (!put){ boxes.push({x: bb.x, y: bb.y, w: bb.width, h: bb.height}); continue; }
      if (put[0] || put[1]){
        t.setAttribute("x", x0 + put[0]); t.setAttribute("y", y0 + put[1]);
        if (Math.abs(put[1]) > 0){
          var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
          ln.setAttribute("class", "dc-ln"); ln.setAttribute("x1", x0 - 6); ln.setAttribute("y1", y0 - 4);
          ln.setAttribute("x2", put[0] ? x0 + put[0] + bb.width + 1 : x0 - 1); ln.setAttribute("y2", y0 + put[1] - 4);
          t.parentNode.insertBefore(ln, t);
        }
      }
    }
    svg.dataset.dc = sig;
  }
  // ⑥ 나침반: 설명 글은 「ⓘ 설명」을 눌러야 보이게 (10/11 사용자: "지우지 말고 밑에 누르면 설명 부분 나오게 · 나침반이 복잡해 보여")
  var NOTE_TABS = {sector: 1};
  function notes(){
    [].forEach.call(document.querySelectorAll("#sheet details.cpx-d:not([data-op1])"), function(d){ d.dataset.op1 = "1"; d.open = true; });   // 칩으로 열면 바로 펼친 채로
    if (!NOTE_TABS[cur]) return;
    [].forEach.call(document.querySelectorAll("#main p.note, #main .rb-help, #sheet p.note"), function(n){
      if (n.dataset.nt || !n.textContent.trim()) return;
      n.dataset.nt = "1"; n.classList.add("nt-h");
      var b = document.createElement("button"); b.className = "nt-b"; b.type = "button"; b.textContent = "ⓘ 설명";
      b.onclick = function(ev){ ev.stopPropagation(); var o = n.classList.toggle("nt-h"); b.textContent = o ? "ⓘ 설명" : "ⓘ 설명 접기"; };
      n.parentNode.insertBefore(b, n);
    });
  }
  // 세부 섹터 계열 고르기 (시계·지도·되감기 같이)
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".famc [data-ffam]"); if (!b) return;
    var f = b.dataset.ffam; try { store.secf = f; save(); } catch(x) {}
    [].forEach.call(document.querySelectorAll(".famw"), function(w){ w.dataset.ff = f; });
    [].forEach.call(document.querySelectorAll(".famc [data-ffam]"), function(x){ x.classList.toggle("on", x.dataset.ffam === f); });
    setTimeout(function(){ [].forEach.call(document.querySelectorAll(".famw svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 30);
  });
  var DCT = null;
  new MutationObserver(function(){ if (DCT) return; DCT = setTimeout(function(){ DCT = null; notes();
    [].forEach.call(document.querySelectorAll("svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 200); })
    .observe(document.body, {childList: true, subtree: true});

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
    // 나침반 접기·설명
    ".nt-h{display:none!important}.nt-b{display:inline-block;border:0;background:none;color:var(--sub);font:inherit;font-size:12px;padding:4px 2px;margin:2px 0;cursor:pointer}" +
    "details.cpx-d>summary,.rb-det>summary{cursor:pointer;font-weight:800;font-size:15px;list-style:none;padding:2px 0}details.cpx-d>summary::-webkit-details-marker,.rb-det>summary::-webkit-details-marker{display:none}" +
    "details.cpx-d>summary:after,.rb-det>summary:after{content:' ▾';color:var(--dim);font-weight:400}details.cpx-d[open]>summary:after,.rb-det[open]>summary:after{content:' ▴'}" +
    "details.cpx-d>summary .mut{display:block;font-size:12px;font-weight:400;margin-top:2px}details.cpx-d[open]>summary{margin-bottom:10px}" +
    ".rb-det{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.rb-det>summary{font-size:14px;color:var(--sub)}" +
    // 계열 고르기
    ".famc{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin:6px 0 2px;padding-bottom:2px}.famc::-webkit-scrollbar{display:none}" +
    ".famc button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:4px 10px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}.famc button.on{background:var(--text);color:var(--bg);border-color:transparent}" +
    ".famw[data-ff=it] [data-fam]:not([data-fam=it]),.famw[data-ff=hc] [data-fam]:not([data-fam=hc]),.famw[data-ff=ind] [data-fam]:not([data-fam=ind]),.famw[data-ff=fin] [data-fam]:not([data-fam=fin])," +
    ".famw[data-ff=con] [data-fam]:not([data-fam=con]),.famw[data-ff=com] [data-fam]:not([data-fam=com]),.famw[data-ff=mat] [data-fam]:not([data-fam=mat]),.famw[data-ff=re] [data-fam]:not([data-fam=re]){display:none}" +
    ".famw[data-ff=''] [data-fam]:not([data-top]) .rotl,.famw:not([data-ff]) [data-fam]:not([data-top]) .rotl{display:none}" +   // 전체일 땐 움직임 큰 10곳만 이름
    // 겹친 글씨 비켜 쓴 선 · 밝은 화면의 카드 창 머리
    "svg .dc-ln{stroke:var(--sub);stroke-width:.8;opacity:.6}" +
    ":root[data-ui=light] .sh-top{background:rgba(255,255,255,.94)!important}:root[data-ui=light] .sh-top b{color:#141a26}" +
    // 날짜 칩 한 줄로 작게
    "#main .dates{margin-bottom:10px}#main .date{padding:5px 11px!important;border-radius:999px!important;font-size:11.5px!important;line-height:1.3}" +
    "#main .date b{display:inline!important;font-size:13.5px!important;margin-right:3px}" +
    "#backbtn.root{display:none!important}#backbtn{padding:9px 14px!important;font-size:14px!important}" +
    "";
  document.head.appendChild(css);
  if (window.cur) try { window.drawTabs(); } catch(x) {}
})();
