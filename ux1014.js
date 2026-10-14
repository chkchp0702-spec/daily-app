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
    ".mk-strip .hero2-k{font-size:11px;margin-bottom:3px}.mk-strip .hero2-k span{color:var(--dim,#8a94a8)}" +
    ".mk-strip .hero2-t{font-size:14.5px;line-height:1.5;font-weight:700}" +
    /* A10-1 지금 → */
    ".kpis2 .kp .kp-now{display:block;font-size:11.5px;line-height:1.4;margin:4px 0 2px;color:var(--sub)}.kpis2 .kp .kp-now b,.kpis2 .kp .kp-now span{display:inline;font-size:inherit;font-weight:700;margin:0;padding:0;font-variant-numeric:tabular-nums}.kpis2 .kp .kp-now span.mut{font-weight:500}" +
    /* A10-2 칩 */
    ".mk-thr{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:5px;align-items:center;margin:0 -16px 9px;padding:0 16px}.mk-thr::-webkit-scrollbar{display:none}" +
    ".mk-thr-k{flex:0 0 auto;white-space:nowrap;font-size:11px;color:var(--sub);font-weight:700;margin-right:2px}" +
    ".mk-thr button{flex:0 0 auto;white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:3px 9px;font:inherit;font-size:11.5px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".mk-thr button b{color:#ff8a6a}.mk-thr button small{color:var(--dim,#8a94a8);font-size:10px}" +
    ".mk-thr button.nw{border-color:color-mix(in srgb,#24c08a 55%,var(--line));}" +
    /* A10-5 스위치: 목차 줄 오른쪽 끝에 붙어 있음 */
    ".mk-toc .mk-full{position:sticky;right:0;margin-left:auto;flex:0 0 auto;background:var(--panel);box-shadow:-10px 0 10px -4px var(--bg)}" +
    ".mk-toc .mk-full small{font-size:10px;color:var(--dim,#8a94a8);font-weight:600}.mk-toc .mk-full.on{border-color:var(--c)}";
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
  function setHH(){ var h = hd.offsetHeight; if (hd.classList.contains("hd-min")){ document.documentElement.style.setProperty("--hdc", (h - 2) + "px"); document.documentElement.style.setProperty("--hh", "2px"); }
    else document.documentElement.style.setProperty("--hh", h + "px"); }
  function set(min){ if (hd.classList.contains("hd-min") === min) return; hd.classList.toggle("hd-min", min); setHH(); }
  window.addEventListener("scroll", function(){
    var y = window.scrollY || 0, d = y - lastY; lastY = y;
    if ((d > 0) !== (acc > 0)) acc = 0;
    acc += d;
    if (y < 80 || acc < -24) set(false);
    else if (y > 160 && acc > 24) set(true);
  }, {passive: true});
  window.addEventListener("hashchange", function(){ set(false); });
  window.addEventListener("resize", function(){ setTimeout(setHH, 50); });
})();
