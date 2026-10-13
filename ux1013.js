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
    bar.innerHTML = secs.map(function(s, i){ var l = label(s); if (seen[l]) return ""; seen[l] = 1;
      if (!s.id) s.id = "mkt" + i; return '<button data-j="' + e(s.id) + '">' + e(l) + '</button>'; }).join("");
    [].forEach.call(bar.querySelectorAll("button"), function(bt){ bt.onclick = function(){
      var el = document.getElementById(bt.dataset.j); if (!el) return;
      if (window.unclamp) try { unclamp(el.querySelector(".xs-clamp") || el); } catch(x) {}
      [].forEach.call(bar.children, function(x){ x.classList.toggle("on", x === bt); }); bar.scrollLeft = bt.offsetLeft - 60;
      var y = el.getBoundingClientRect().top + window.scrollY - (hh() + bar.offsetHeight + 8);
      window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); }; });
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
    ".tm-c{padding:14px}.tm-h{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}.tm-h b{font-size:16px}.tm-h small{color:var(--sub);font-size:12px}",
    ".tm-ys{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:0 -14px 10px;padding:2px 14px}.tm-ys::-webkit-scrollbar{display:none}",
    ".tm-ys button{flex:none;position:relative;min-width:38px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:6px 0;font:inherit;font-size:13px;font-variant-numeric:tabular-nums;cursor:pointer}",
    ".tm-ys button.is{opacity:.75}.tm-ys button i{position:absolute;top:1px;right:4px;font-size:7px;color:#e5534b;font-style:normal}",
    ".tm-ys button.on{background:var(--c,#7c9cff);border-color:var(--c,#7c9cff);color:#111;font-weight:700;opacity:1}",
    ".tm-t{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin:2px 0 8px}.tm-t b{font-size:20px}.tm-t small{color:var(--sub);font-size:12px;flex-basis:100%}",
    ".tm-mk{font-size:12px;padding:2px 8px;border-radius:999px;background:rgba(229,83,75,.15);color:#e5534b}",
    ".tm-r{display:grid;grid-template-columns:96px 1fr 62px;row-gap:3px;column-gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}",
    ".tm-r .n{font-size:13px;font-weight:600}.tm-r.best .n::after{content:' 👑';font-size:11px}",
    ".tm-r .bar{position:relative;height:14px}.tm-r .bar i{position:absolute;top:0;bottom:0;border-radius:4px}.tm-r .bar .z{left:50%;width:1px;background:var(--line);border-radius:0}",
    ".tm-r .bar .d{top:9px;bottom:-2px;background:rgba(229,83,75,.28)}",
    ".tm-r .v{text-align:right}.tm-r .v b{font-size:15px;font-variant-numeric:tabular-nums}",
    ".tm-r .w{grid-column:1/4;font-size:11.5px;color:var(--sub);text-align:right;font-variant-numeric:tabular-nums}.tm-r .w b{color:var(--text);font-weight:600}",
    ".tm-n{font-size:11.5px;color:var(--sub);margin:8px 0 0;line-height:1.5}",
    "#lpv{position:fixed;inset:0;z-index:200}#lpv .lpv-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);animation:lpvf .18s ease}",
    "#lpv .lpv-s{position:absolute;left:0;right:0;bottom:0;max-height:78vh;overflow:auto;background:var(--panel);border-top-left-radius:20px;border-top-right-radius:20px;border:1px solid var(--line);padding:8px 16px calc(env(safe-area-inset-bottom) + 16px);box-shadow:0 -18px 40px -12px rgba(0,0,0,.5);animation:lpvu .22s cubic-bezier(.2,.8,.2,1)}",
    ".lpv-grab{width:38px;height:4px;border-radius:4px;background:var(--line);margin:0 auto 10px}",
    ".lpv-t b{font-size:18px}.lpv-t small{display:block;color:var(--sub);font-size:12px;margin-top:2px}",
    ".lpv-px{display:flex;align-items:baseline;gap:8px;margin:8px 0 4px}.lpv-px b{font-size:22px;font-variant-numeric:tabular-nums}.lpv-px small{color:var(--sub);font-size:11.5px;margin-left:auto}",
    ".lpv-ch svg{width:100%;height:auto;display:block}.lpv-ch .muted,.lpv-ch>div{font-size:11.5px;color:var(--sub);margin-top:4px}",
    ".lpv-rg{display:flex;align-items:center;gap:8px;margin-top:8px}.lpv-rg small{font-size:11px;color:var(--sub);flex:none}.lpv-rg .t{position:relative;flex:1;height:6px;border-radius:6px;background:linear-gradient(90deg,#1f4e9c,#8a94a8,#c0392b)}",
    ".lpv-rg .t i{position:absolute;top:-4px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--text);border:2px solid var(--panel)}",
    ".lpv-rgn{font-size:12px;color:var(--sub);text-align:center;margin-top:4px}",
    ".lpv-sg{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.lpv-sg span{font-size:12.5px;padding:4px 10px;border-radius:999px;background:var(--panel2);border:1px solid var(--line)}.lpv-sg .mut{background:none;border:0;color:var(--sub);padding:0}",
    ".lpv-a{display:flex;gap:8px}.lpv-a .btn{flex:1;padding:11px 0;font-size:14px;text-align:center}.lpv-go{font-weight:700}",
    "@keyframes lpvu{from{transform:translateY(100%)}to{transform:none}}@keyframes lpvf{from{opacity:0}to{opacity:1}}",
    "[data-op],a[href*='openOP('],[onclick*='openOP(']{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}"
  ].join("\n");
  document.head.appendChild(st);
})();
