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
        b.appendChild(em); b.title = x.t;
      });
    });
  };
  // 그려져 있는 탭에도 (처음 열 때)
  setTimeout(function(){ try { window.subBadges(); } catch(x) {} }, 600);

  var css = document.createElement("style");
  css.textContent =
    // A12-5 탭 배지 — 오른쪽 위 작은 숫자 방울(탭 폭은 그대로 · 오늘 새로 생긴 게 있으면 빨강)
    "header .tabs.sub:has(.tbg){padding-top:7px}header .tabs.sub .tab{position:relative}" +
    "header .tabs.sub .tab .tbg{position:absolute;top:-7px;right:-5px;font-style:normal;font-size:10.5px;font-weight:800;line-height:16px;min-width:16px;padding:0 5px;border-radius:999px;background:#3a4256;color:#fff;box-shadow:0 0 0 2px var(--bg);white-space:nowrap;pointer-events:none}" +
    "header .tabs.sub .tab .tbg.dot{background:#e5484d}" +
    // A12-1 이름 한 줄
    ".cc .nm2 b[data-nmk]{word-break:keep-all}.cc .nm2{min-width:0}" +
    // A12-2 고래 오늘의 신호
    ".wsg-top{margin:0 0 8px;font-size:14px}.wsg-top a{color:inherit}" +
    ".wsg{display:flex;flex-wrap:wrap;gap:6px}.wsgc .wsgi{font-size:12px;margin-left:2px;letter-spacing:1px}.wsg-k{margin:8px 0 0!important;font-size:12px}" +
    // A12-3 돌파 임박 지금 값
    ".xr .xnl{flex-basis:100%;text-align:right;font-size:11.5px;color:var(--dim);margin-top:-2px}.xr .xnl.on{color:var(--sub)}.xr .xnl.was{color:#2bb673}" +
    ".xr.xbrk{background:color-mix(in srgb,#2bb673 14%,transparent);border-radius:10px}.xr.xbrk .xnd{color:#2bb673!important}.xr.xbrk .xbar i{background:#2bb673!important}" +
    ".xr{flex-wrap:wrap}" +
    // A12-4 며칠째
    ".seg2.srt{margin-top:-4px}.seg2.srt button{font-size:12.5px}" +
    ".cc .nwdot{font-style:normal;color:#ff9f43;font-size:10px;margin-right:4px;vertical-align:2px}" +
    ".cc.old{background:color-mix(in srgb,var(--panel) 70%,var(--bg));border-color:color-mix(in srgb,var(--line) 60%,transparent)}" +
    ".cc.old .nm2 b{color:var(--sub)}";
  document.head.appendChild(css);
})();
