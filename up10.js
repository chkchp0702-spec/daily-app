/* CH Investing — 앱 업그레이드 10 (10/10 사용자: "어플 전체를 업그레이드하는 전략 열 개 … 다 진행해")
   ① 🏠 오늘 — 첫 화면 한 장 (market/home.json)
   ③ 📊 성적 — 판단 채점을 한 곳에 (market/scores.json)
   ⑤ 접히는 카드 + 바로가기 칩 (💼 포트)
   ⑥ 밝은 테마 · 글자 크기 (⚙️)
   ⑦ 종목 화면: 🐋☕📈🤫🎯🧠 신호 · 포트·킥에 들어 있나 (market/sigindex.json)
   ⑨ 알림을 누르면 그 카드로 바로 (#탭~카드id)
   ⑧ 자료는 서비스 워커가 마지막 것을 들고 있다가 느리면 그걸 먼저 (sw.js) */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; d = d == null ? 2 : d; return (v > 0 ? "+" : "") + (+v).toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? String(d).slice(5, 10).replace("-", "/") : ""; }
  function J(name){ return fetch(RAW + name + "?" + Math.floor(Date.now() / 120000)).then(function(r){ if (!r.ok) throw 0; return r.json(); }); }
  var UI = {theme: "auto", fs: 1};
  try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); if (u.theme) UI.theme = u.theme; if (u.fs) UI.fs = u.fs; } catch(x) {}
  function keepUI(){ try { localStorage.setItem("ui", JSON.stringify(UI)); } catch(x) {} }

  /* ---------- ⑥ 테마 · 글자 크기 ---------- */
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : null;
  function applyUI(){
    var t = UI.theme === "auto" ? (mq && mq.matches ? "light" : "dark") : UI.theme;
    document.documentElement.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "light" ? "#f5f6fa" : "#0b0f17");
    document.documentElement.style.setProperty("--fs", UI.fs);
    document.body && (document.body.style.zoom = UI.fs === 1 ? "" : UI.fs);
  }
  if (mq && mq.addEventListener) mq.addEventListener("change", applyUI);
  applyUI();
  function settings(){
    var old = document.getElementById("uiset"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "uiset";
    var row = function(lab, key, opts){ return '<div class="us-r"><span>' + lab + '</span><div class="us-seg">' + opts.map(function(o){
      return '<button data-k="' + key + '" data-v="' + o[0] + '" class="' + (String(UI[key]) === String(o[0]) ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div></div>'; };
    d.innerHTML = '<b>⚙️ 보기 설정</b>' + row("화면", "theme", [["auto", "자동"], ["dark", "🌙 어둡게"], ["light", "☀️ 밝게"]]) +
      row("글자", "fs", [[0.92, "작게"], [1, "보통"], [1.12, "크게"]]) + '<small>자동 = 휴대폰 설정(다크 모드)을 따라가요.</small>';
    document.body.appendChild(d);
    [].forEach.call(d.querySelectorAll("button"), function(b){ b.onclick = function(){ var k = b.dataset.k, v = b.dataset.v; UI[k] = k === "fs" ? +v : v; keepUI(); applyUI(); d.remove(); settings(); }; });
    setTimeout(function(){ document.addEventListener("click", function off(ev){ if (!d.contains(ev.target) && ev.target.id !== "uibtn"){ d.remove(); document.removeEventListener("click", off); } }); }, 0);
  }
  function addBtn(){
    var top = document.querySelector("header .top"); if (!top || document.getElementById("uibtn")) return;
    var b = document.createElement("button"); b.id = "uibtn"; b.textContent = "⚙️"; b.setAttribute("aria-label", "보기 설정"); b.onclick = settings;
    top.appendChild(b);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function(){ addBtn(); applyUI(); }) : (addBtn(), applyUI());

  /* ---------- ⑨ 알림·링크에서 바로 그 카드로: #port~pokick ---------- */
  window.goTo = function(tab, anchor){
    if (typeof go === "function" && cur !== tab) go(tab);
    if (!anchor) return;
    var t0 = Date.now();
    (function find(){
      var el = document.getElementById(anchor);
      if (el){ if (el.classList.contains("fold") && !el.classList.contains("open")) el.classList.add("open");
        setTimeout(function(){ el.scrollIntoView({behavior: "smooth", block: "start"}); el.classList.add("flash"); setTimeout(function(){ el.classList.remove("flash"); }, 1800); }, 60); return; }
      if (Date.now() - t0 < 8000) setTimeout(find, 150);
    })();
  };
  function deep(){
    var h = (location.hash || "").slice(1); if (h.indexOf("~") < 0) return;
    var p = h.split("~"); setTimeout(function(){ goTo(p[0], p[1]); }, 50);
  }
  window.addEventListener("hashchange", deep);
  window.addEventListener("load", function(){ setTimeout(deep, 400); });
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-goto]"); if (!t) return;
    ev.preventDefault(); var p = t.getAttribute("data-goto").split("~"); goTo(p[0], p[1]);
  });

  /* ---------- ① 🏠 오늘 ---------- */
  window.homeView = function(){ return '<div id="hmbody"><div class="loading">오늘 할 일 모으는 중…</div></div>'; };
  window.homeInit = function(){
    Promise.all([J("home.json"), J("sigindex.json").catch(function(){ return null; })]).then(function(a){ SIG = a[1] && a[1].ix; drawHome(a[0]); })
      .catch(function(){ var b = document.getElementById("hmbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">🏠</div>오늘 요약이 아직 안 올라왔어요.<br>매시간 자동으로 만들어져요.</div>'; });
  };
  function card(go, ic, t, sub, body, goLab){
    return '<section class="card hm-c" data-goto="' + go + '"><div class="hm-h"><span class="hm-i">' + ic + '</span><div><b>' + t + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><span class="hm-go">' + (goLab || "열기") + ' ›</span></div>' + body + '</section>';
  }
  function drawHome(H){
    var b = document.getElementById("hmbody"); if (!b) return;
    var P = H.port || {}, K = H.kick || {}, D = H.danta || {}, Bn = H.brain || {}, S = H.scores || {};
    var now = new Date(Date.now() + 9 * 3600e3), wd = "일월화수목금토"[now.getUTCDay()];
    var h = '<div class="hm-day">' + (now.getUTCMonth() + 1) + '월 ' + now.getUTCDate() + '일 ' + wd + '요일 · <span class="mut">' + e(String(H.at || "").slice(5)) + ' 기준</span></div>';
    // 💼 포트
    var ex = (P.kick || 0) - (P.spy || 0);
    var spark = (window.V && P.nav && P.nav.length > 1) ? V.lines([{name: "⚡ 킥", color: "#ff6b6b", vals: P.kick_line}, {name: "💼 기본", color: "#e9c46a", vals: P.nav}, {name: "S&P", color: "#7c9cff", vals: P.spy_line, dash: 1}],
      (P.nav || []).map(function(_, i){ return i ? "" : md(P.start); }), {h: 96, unit: "%", zero: 1, nodots: 1}) : "";
    h += card("port", "💼", "포트", md(P.start) + "부터 · " + md(P.asof) + " 미국 종가",
      '<div class="hm-big"><div><small>⚡ 킥</small><b class="' + cls(P.kick) + '">' + sg(P.kick) + '</b></div><div><small>💼 기본</small><b class="' + cls(P.base) + '">' + sg(P.base) + '</b></div><div><small>S&P500</small><b>' + sg(P.spy) + '</b></div></div>' +
      '<div class="hm-l">어제(' + md(P.d1_date) + ') 💼 <b class="' + cls(P.d1) + '">' + sg(P.d1) + '</b> · ⚡ <b class="' + cls(P.d1_kick) + '">' + sg(P.d1_kick) + '</b> · S&P ' + sg(P.d1_spy) +
      ' · 시장 ' + P.n_bench + '곳 중 <b>' + P.beat_kick + '</b>곳 앞섬' + (ex < 0 ? ' · S&P까지 ' + sg(ex) + 'p' : '') + '</div>' +
      '<div class="hm-sp">' + spark + '</div>' +
      (P.change ? '<div class="hm-alert" data-goto="port~pofollow">🔁 ' + md(P.change.date) + ' 비중·상품 바뀜 — <b>따라하기에서 맞추기 ›</b><small>' + e(String(P.change.why || "").replace(/\s*\([^()]*\)/g, "").slice(0, 120)) + '…</small></div>' : '') +
      ((P.weak || []).length ? '<div class="hm-chips">' + P.weak.map(function(x){ return '<span class="hm-chip b">약함 ' + e(x) + '</span>'; }).join("") + (P.strong || []).slice(0, 3).map(function(x){ return '<span class="hm-chip g">강함 ' + e(x) + '</span>'; }).join("") + '</div>' : ''));
    // ⚡ 킥
    var ev = K.events || [];
    h += card("port~pokick", "⚡", "킥 — 오늘 할 일", K.n + "종목 · 포트의 " + K.w + "%",
      (ev.length ? ev.map(function(x){ return '<div class="hm-ev ' + (x.k === "사기" ? "buy" : "sell") + '">' + (x.k === "사기" ? "🟢 사기" : x.k === "팔기" ? "🔴 팔기" : "🟡 절반") + ' <b>' + e(x.name) + '</b>' + (x.r != null ? ' ' + sg(x.r, 1) : '') + (x.why ? ' <small>' + e(x.why) + '</small>' : '') + '</div>'; }).join("")
        : '<div class="hm-l">' + md(K.asof) + ' 사고판 것 없음 — 들고 있는 그대로</div>') +
      '<div class="hm-chips">' + (K.best || []).map(function(o){ return '<span class="hm-chip">' + e(o.tags || "") + ' ' + e(o.name) + ' <b class="' + cls(o.r) + '">' + sg(o.r, 1) + '</b></span>'; }).join("") +
      (K.worst || []).map(function(o){ return '<span class="hm-chip">' + e(o.tags || "") + ' ' + e(o.name) + ' <b class="' + cls(o.r) + '">' + sg(o.r, 1) + '</b></span>'; }).join("") + '</div>', "킥 보기");
    // 🎯 집중
    if ((H.focus || []).length) h += card("market", "🎯", "오늘 집중", "돈이 몰리는 테마",
      H.focus.map(function(t){ return '<div class="hm-f"><b>' + e(t.name) + '</b> <span class="hm-chip ' + (t.stage === "과열" ? "b" : "g") + '">' + e(t.stage || "") + '</span> <small>5일 ' + sg(t.r5, 1) + ' · S&P 대비 20일 ' + sg(t.rs20, 1) + 'p</small>' +
        '<div class="hm-l">' + e(t.do || "") + ((t.stars || []).length ? ' · ★ ' + t.stars.map(function(s){ return '<a data-op="' + e(s.t) + '">' + e(s.name) + '</a>'; }).join(", ") : '') + ((t.etf_kr || []).length ? ' · 🇰🇷 ' + e(t.etf_kr[0].name) : '') + '</div></div>'; }).join(""), "시황");
    // ⚡ 단타
    h += card("danta", "🔔", "단타 알람", "오늘 " + (D.today || 0) + "건",
      '<div class="hm-l">' + ((D.strong || []).length ? '⭐ 이기는 자리: <b>' + e(D.strong.join(", ")) + '</b>' : '아직 「강함」 자리 없음') + ((D.observe || []).length ? ' · 👀 관찰만: ' + e(D.observe.join(", ")) : '') + '</div>', "단타");
    // 🧠 두뇌
    if (Bn.summary) h += card("feed", "🧠", "지금 생각", (Bn.regime || "") + " · " + md(Bn.at) + " " + String(Bn.at || "").slice(11, 16),
      '<div class="hm-l">' + e(Bn.summary) + '</div>' + ((Bn.ideas || []).length ? '<div class="hm-chips">' + Bn.ideas.map(function(x){ var t = typeof x === "string" ? x : ((x["칸"] || x.box || "") + " " + (x["제안"] || x.idea || "")); return t.trim() ? '<span class="hm-chip">💡 ' + e(t) + '</span>' : ''; }).join("") + '</div>' : ''), "피드");
    // 📊 성적
    h += card("score", "📊", "성적 한 줄", "무엇이 이기고 지나",
      '<div class="hm-l">' + ((S.good || []).length ? '✅ ' + e(S.good.join(" · ")) : '') + ((S.bad || []).length ? '<br>❌ ' + e(S.bad.join(" · ")) : '') + (!(S.good || []).length && !(S.bad || []).length ? '표본이 쌓이는 중' : '') + '</div>', "성적표");
    b.innerHTML = h;
  }

  /* ---------- ③ 📊 성적표 ---------- */
  window.scoreView = function(){ return '<div id="scbody"><div class="loading">채점 모으는 중…</div></div>'; };
  window.scoreInit = function(){
    J("scores.json").then(drawScore).catch(function(){ var b = document.getElementById("scbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">📊</div>성적표가 아직 안 올라왔어요.</div>'; });
  };
  function bar(w, l){ var n = (w || 0) + (l || 0); if (!n) return ''; return '<div class="sc-bar"><span class="w" style="flex:' + w + '">' + (w ? w : "") + '</span><span class="l" style="flex:' + l + '">' + (l ? l : "") + '</span></div>'; }
  function drawScore(S){
    var b = document.getElementById("scbody"); if (!b) return;
    var h = '<section class="card sc-top"><div class="sc-gb"><div><b>✅ 이기는 것</b>' + ((S.good || []).length ? S.good.map(function(x){ return '<span>' + e(x) + '</span>'; }).join("") : '<span class="mut">표본 쌓는 중</span>') + '</div>' +
      '<div><b>❌ 지는 것</b>' + ((S.bad || []).length ? S.bad.map(function(x){ return '<span>' + e(x) + '</span>'; }).join("") : '<span class="mut">없음</span>') + '</div></div>' +
      '<p class="note">매시간 자동 채점 · ' + e(String(S.at || "").slice(5)) + ' · 매일 저녁 자가 업그레이드가 이 숫자로 규칙을 고쳐요(지는 건 줄이고 이기는 건 늘림).</p></section>';
    (S.rows || []).forEach(function(r){
      var top = '<div class="sc-h"><span class="hm-i">' + r.ic + '</span><div><b>' + e(r.t) + '</b><small>' + e(r.note || "") + '</small></div>' +
        (r.rate != null && ((r.win || 0) + (r.loss || 0) >= 5 || (r.k === "kick" && (r.n || 0) >= 5)) ? '<div class="sc-rate ' + (r.rate >= 55 ? "up" : r.rate < 45 ? "dn" : "") + '">' + r.rate + '%<small>맞음</small></div>' : r.avg != null ? '<div class="sc-rate ' + cls(r.avg) + '">' + sg(r.avg, 1) + '<small>평균</small></div>' : '') + '</div>';
      var nn = (r.win || 0) + (r.loss || 0);
      var body = nn && nn < 5 && r.k !== "port" ? '<div class="sc-few">표본 ' + nn + '건 — 5건 넘으면 비율을 보여 줘요</div>' : bar(r.win, r.loss);
      if (r.k === "report" && r.recent) body += r.recent.map(function(x){ return '<div class="sc-li"><span class="sc-v ' + (/맞/.test(x.v) ? "w" : /틀/.test(x.v) ? "l" : "") + '">' + e(x.v) + '</span>' + md(x.d) + ' ' + e(String(x.t || "").slice(0, 70)) + '</div>'; }).join("");
      if (r.k === "kick" && r.sig) body += '<div class="sc-sig">' + r.sig.map(function(x){ return '<div class="' + (x.shadow ? "sh" : x.trial ? "tr" : x.on ? "on" : "off") + '"><b>' + e(x.tag) + ' ' + e({cup: "컵", gap: "갭", accum: "매집", whale: "고래", focus: "집중", lead: "선행"}[x.k] || x.k) + '</b>' +
        '<small>' + (x.shadow ? "👻 그림자 " : x.trial ? "🧪 시험 " : x.on ? "✓ 킥에 들어감 " : "⏳ 대기 ") + (x.n != null ? x.n + "건" : "") + (x.avg != null ? " · 평균 " + sg(x.avg, 1) : "") + (x.pf ? " · 손익비 " + x.pf : "") + '</small></div>'; }).join("") + '</div>';
      if (r.k === "danta" && r.rows) body += '<table class="lrn"><tr><th></th><th>09시</th><th>10시</th><th>11~12시</th><th>13시~</th></tr>' + r.rows.map(function(x){
        return '<tr><td>' + e(x.k) + '<small>' + (x.n || 0) + '건 ' + sg(x.avg) + '</small></td>' + ["09시", "10시", "11~12시", "13시 이후"].map(function(s){ var c = (x.slots || {})[s] || {};
          return '<td><b class="st-' + e(c.st) + '">' + e({"강함": "⭐", "켬": "켬", "관찰": "👀", "닫힘": "닫힘"}[c.st] || "–") + '</b><small>' + (c.n ? c.n + "건 " + sg(c.avg, 1) : "") + '</small></td>'; }).join("") + '</tr>'; }).join("") + '</table>';
      if (r.k === "picks" && r.rows) body += r.rows.map(function(x){ return '<div class="sc-li">' + e(x.name) + ' · ' + e((x.picks || []).join("·")) + (x.edge != null ? ' <b class="' + cls(x.edge) + '">' + (x.edge >= 0 ? "앞섬 " : "뒤짐 ") + sg(x.edge, 1).replace("%", "p") + '</b>' : ' <span class="mut">채점 대기</span>') + '</div>'; }).join("");
      h += '<section class="card sc-c">' + top + body + '</section>';
    });
    b.innerHTML = h;
  }

  /* ---------- ⑤ 접히는 카드 + 바로가기 칩 (💼 포트) ---------- */
  var FOLD = {};
  try { FOLD = JSON.parse(localStorage.getItem("fold") || "{}"); } catch(x) {}
  var FMAP = [[/시장 .*비교/, "pocmp", "🏁 비교", 1], [/킥 칸 속/, "pokick", "⚡ 킥", 1], [/이렇게 담으면/, "pofollow", "📋 따라하기", 1], [/비중 바뀐 날/, "potl", "🔁 바뀐 날", 0],
              [/해외 동종주/, "popeers", "🌏 동종주", 0], [/벌고 잃었나/, "poct", "🧩 칸별", 0], [/날짜별/, "podt", "📅 날짜별", 0]];
  window.foldify = function(root){
    if (!root) return;
    var kids = [].slice.call(root.children), groups = [], g = null;
    kids.forEach(function(k){
      if (k.classList.contains("sec")){
        var t = k.textContent, m = FMAP.filter(function(x){ return x[0].test(t); })[0];
        g = m ? {sec: k, m: m, body: []} : null; if (g) groups.push(g); return;
      }
      if (g && !k.classList.contains("po-mode") && !k.classList.contains("po-hero")) g.body.push(k); else g = null;
    });
    if (!groups.length) return;
    groups.forEach(function(x){
      var id = x.m[1], open = FOLD[id] == null ? !!x.m[3] : !!FOLD[id];
      var w = document.createElement("div"); w.className = "fold" + (open ? " open" : ""); w.id = id;
      x.sec.parentNode.insertBefore(w, x.sec);
      x.sec.classList.add("fold-h"); x.sec.insertAdjacentHTML("beforeend", '<i class="fchev">▾</i>');
      w.appendChild(x.sec);
      var bd = document.createElement("div"); bd.className = "fold-b"; x.body.forEach(function(n){ bd.appendChild(n); }); w.appendChild(bd);
      x.sec.onclick = function(ev){ if (ev.target.closest("button,a,[data-op]")) return; var o = w.classList.toggle("open"); FOLD[id] = o ? 1 : 0; try { localStorage.setItem("fold", JSON.stringify(FOLD)); } catch(z) {} };
    });
    var bar_ = document.createElement("div"); bar_.className = "fold-jump";
    bar_.innerHTML = '<button data-j="pohero">💼 성적</button>' + groups.map(function(x){ return '<button data-j="' + x.m[1] + '">' + x.m[2] + '</button>'; }).join("");
    root.insertBefore(bar_, root.firstChild);
    var hero = root.querySelector(".po-hero"); if (hero && !hero.id) hero.id = "pohero";
    [].forEach.call(bar_.querySelectorAll("button"), function(bt){ bt.onclick = function(){ var el = document.getElementById(bt.dataset.j); if (!el) return;
      if (el.classList.contains("fold") && !el.classList.contains("open")){ el.classList.add("open"); FOLD[el.id] = 1; try { localStorage.setItem("fold", JSON.stringify(FOLD)); } catch(z) {} }
      var y = el.getBoundingClientRect().top + window.scrollY - (document.querySelector("header").offsetHeight + 46); window.scrollTo({top: y, behavior: "smooth"}); }; });
  };

  /* ---------- ⑦ 종목 화면 신호 배지: 포트·킥·집중·두뇌까지 ---------- */
  var SIG = null;
  function sigOf(sym){
    var p = SIG ? Promise.resolve(SIG) : J("sigindex.json").then(function(j){ SIG = j.ix; return SIG; }).catch(function(){ return {}; });
    return p.then(function(ix){ var s = String(sym || "").toUpperCase(), c = s.replace(/\.(KS|KQ)$/, ""); return ix[s] || ix[c] || ix[c.replace(/^0+/, "")] || null; });
  }
  var _sb = window.sigBadges;
  if (_sb) window.sigBadges = function(sym){
    return Promise.all([_sb(sym).catch(function(){ return ""; }), sigOf(sym)]).then(function(a){
      var x = a[1]; if (!x) return a[0];
      var parts = [];
      if (x.tags) parts.push('<span class="sgx-t">' + e(x.tags) + '</span>');
      if (x.kick != null) parts.push('<a class="sgx k" data-goto="port~pokick">⚡ 킥에 ' + (+x.kick).toFixed(1) + '% 들어 있음' + (x.kick_r != null ? ' <b class="' + cls(x.kick_r) + '">' + sg(x.kick_r, 1) + '</b>' : '') + '</a>');
      if (x.port) parts.push('<a class="sgx p" data-goto="port~pofollow">💼 포트 「' + e(x.port) + '」 칸 상품</a>');
      if (x.focus) parts.push('<a class="sgx f" data-goto="market">🎯 오늘 집중 「' + e(x.focus) + '」 ★</a>');
      if (x.bet) parts.push('<a class="sgx b" data-goto="feed">🧠 두뇌 선제 아이디어 · ' + e(x.bet) + '</a>');
      if (!parts.length) return a[0];
      return '<div class="card sgx-c">' + parts.join("") + '</div>' + a[0];
    });
  };

  /* ---------- 탭 그리기 보완: 홈·성적 버튼은 같은 모양 ---------- */
  var css = document.createElement("style");
  css.textContent = [
    /* 탭: 두 줄 7칸 (아이콘 위·글자 아래) */
    "header .tabs{grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:2px 8px 8px}",
    "header .tab{flex-direction:column;gap:1px;padding:5px 0 4px;font-size:10.5px;border-radius:10px;letter-spacing:-.6px}",
    "header .tab .ic{font-size:16px}",
    "@media (max-width:350px){header .tab .ic{display:block;font-size:14px}header .tab{font-size:9.5px}}",
    "#uibtn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:3px 8px;font-size:14px;margin-left:8px;cursor:pointer}",
    "#uiset{position:fixed;z-index:60;top:calc(env(safe-area-inset-top) + 52px);right:12px;width:260px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:12px;box-shadow:0 18px 40px -12px rgba(0,0,0,.5)}",
    "#uiset b{display:block;margin-bottom:8px}#uiset small{display:block;color:var(--sub);font-size:11.5px;margin-top:8px}",
    ".us-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}.us-r>span{font-size:13px;color:var(--sub)}",
    ".us-seg{display:flex;gap:4px}.us-seg button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:9px;padding:5px 8px;font:inherit;font-size:12px;cursor:pointer}.us-seg button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}",
    /* 홈 */
    ".hm-day{font-size:13px;color:var(--sub);margin:-4px 2px 10px}",
    ".hm-c{cursor:pointer;transition:transform .12s}.hm-c:active{transform:scale(.99)}",
    ".hm-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.hm-h>div{flex:1;min-width:0}.hm-h b{font-size:16px}.hm-h small{display:block;font-size:11.5px;color:var(--sub)}",
    ".hm-i{font-size:22px;width:36px;height:36px;border-radius:11px;background:var(--panel2);display:flex;align-items:center;justify-content:center;flex:none}",
    ".hm-go{font-size:12px;color:var(--sub);white-space:nowrap}",
    ".hm-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:2px 0 6px}.hm-big>div{background:var(--panel2);border-radius:12px;padding:7px 9px}.hm-big small{display:block;font-size:11px;color:var(--sub)}.hm-big b{font-size:20px;letter-spacing:-.5px}",
    ".hm-l{font-size:13.5px;line-height:1.5;color:var(--text)}.hm-l small{color:var(--sub)}.hm-l a{color:var(--acc);cursor:pointer}",
    ".hm-sp{margin:4px -4px 0}.hm-sp .lg{font-size:11px}",
    ".hm-alert{margin-top:8px;background:rgba(255,184,77,.12);border:1px solid rgba(255,184,77,.4);border-radius:12px;padding:8px 10px;font-size:13px}.hm-alert small{display:block;color:var(--sub);font-size:11.5px;margin-top:2px}",
    ".hm-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.hm-chip{font-size:12px;background:var(--panel2);border-radius:999px;padding:3px 9px}.hm-chip.g{background:rgba(77,212,122,.14);color:#4dd47a}.hm-chip.b{background:rgba(57,135,229,.16);color:#7cb0ff}",
    ".hm-ev{font-size:14px;padding:5px 0;border-bottom:1px dashed var(--line)}.hm-ev small{color:var(--sub)}",
    ".hm-f{padding:6px 0;border-bottom:1px dashed var(--line)}.hm-f:last-child{border-bottom:0}.hm-f small{color:var(--sub);font-size:11.5px}",
    /* 성적표 */
    ".sc-gb{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sc-gb>div{background:var(--panel2);border-radius:12px;padding:9px}.sc-gb b{display:block;font-size:13px;margin-bottom:4px}.sc-gb span{display:block;font-size:12px;line-height:1.5}",
    ".sc-h{display:flex;align-items:center;gap:10px}.sc-h>div:nth-child(2){flex:1;min-width:0}.sc-h b{font-size:15px}.sc-h small{display:block;font-size:11.5px;color:var(--sub)}",
    ".sc-rate{font-size:22px;font-weight:900;text-align:right;line-height:1.05}.sc-rate small{display:block;font-size:10.5px;color:var(--sub);font-weight:600}",
    ".sc-bar{display:flex;height:16px;border-radius:8px;overflow:hidden;margin:9px 0 4px;font-size:10.5px;font-weight:800}.sc-bar .w{background:#3fae6a;color:#fff;padding-left:6px}.sc-bar .l{background:#d0574f;color:#fff;text-align:right;padding-right:6px}",
    ".sc-li{font-size:12.5px;padding:5px 0;border-top:1px dashed var(--line)}.sc-v{font-size:10.5px;font-weight:800;border-radius:5px;padding:0 5px;margin-right:5px;background:var(--panel2)}.sc-v.w{background:rgba(77,212,122,.18);color:#4dd47a}.sc-v.l{background:rgba(230,103,103,.18);color:#ff8a8a}",
    ".sc-sig{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}.sc-sig>div{border-radius:10px;padding:7px 9px;background:var(--panel2)}.sc-sig b{display:block;font-size:13px}.sc-sig small{font-size:11px;color:var(--sub)}",
    ".sc-sig .on{background:rgba(77,212,122,.12)}.sc-sig .tr{background:rgba(255,184,77,.12)}.sc-sig .sh{background:rgba(124,156,255,.1)}",
    ".sc-few{font-size:12px;color:var(--sub);margin-top:6px}",
    ".lrn .st-강함{color:#4dd47a}.lrn .st-관찰{color:#ffb84d}.lrn .st-닫힘{color:var(--dim)}",
    /* 접기 */
    ".fold .fold-h{cursor:pointer;display:flex;align-items:center;gap:6px}.fold .fold-h .fchev{margin-left:auto;font-style:normal;color:var(--sub);transition:transform .2s}",
    ".fold:not(.open) .fold-b{display:none}.fold:not(.open) .fchev{transform:rotate(-90deg)}.fold:not(.open){margin-bottom:6px}",
    ".fold:not(.open) .fold-h{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:11px 12px}",
    ".fold-jump{position:sticky;top:var(--hh,140px);z-index:5;display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin:0 -16px 10px;padding:6px 16px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}",
    ".fold-jump::-webkit-scrollbar{display:none}.fold-jump button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;cursor:pointer}",
    ".flash{animation:flash 1.6s ease}@keyframes flash{0%,40%{box-shadow:0 0 0 3px var(--c,#7c9cff)}100%{box-shadow:none}}",
    /* 종목 신호 */
    ".sgx-c{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 12px}.sgx-t{font-size:20px;letter-spacing:-1px}",
    ".sgx{font-size:12.5px;border-radius:999px;padding:4px 10px;background:var(--panel2);color:var(--text);text-decoration:none;cursor:pointer}.sgx.k{background:rgba(255,107,107,.14)}.sgx.p{background:rgba(233,196,106,.16)}.sgx.f{background:rgba(124,156,255,.14)}.sgx.b{background:rgba(77,212,122,.12)}",
    /* ⑥ 밝은 테마 */
    ":root[data-theme=light]{--bg:#f4f6fa;--panel:#ffffff;--panel2:#eef1f6;--line:#dde2ea;--text:#141a26;--sub:#5a6476;--dim:#8b94a4;--acc:#3d63dd;--up:#d64545;--down:#2f6fd0}",
    ":root[data-theme=light] header{background:rgba(244,246,250,.9)}",
    ":root[data-theme=light] header .tab{background:#fff;border-color:#dde2ea;color:#5a6476}",
    ":root[data-theme=light] header .tab.on{color:#fff}",
    ":root[data-theme=light] .chip{background:rgba(20,26,38,.06)}",
    ":root[data-theme=light] .card,:root[data-theme=light] .hero{box-shadow:0 1px 2px rgba(20,26,38,.05)}",
    ":root[data-theme=light] .po-hero{background:linear-gradient(160deg,rgba(233,196,106,.22),#fff 60%)}",
    ":root[data-theme=light] .po-hero.kick{background:linear-gradient(160deg,rgba(255,107,107,.18),#fff 60%)}",
    ":root[data-theme=light] .vtip{background:#141a26;color:#fff}",
    ":root[data-theme=light] .lc-g{stroke:#e3e7ee}:root[data-theme=light] .lc-a{fill:#6b7486}",
    ":root[data-theme=light] svg circle[stroke='#121826']{stroke:#fff}",
    ":root[data-theme=light] .up{color:#d64545}:root[data-theme=light] .dn{color:#2f6fd0}",
    ":root[data-theme=light] #backbtn{background:#fff;color:#141a26;border-color:#dde2ea}",
    ":root[data-theme=light] .hm-chip.g,:root[data-theme=light] .po-sg.g{color:#1f8b4c}:root[data-theme=light] .hm-chip.b{color:#2f6fd0}",
    ":root[data-theme=light] .sc-v.w{color:#1f8b4c}:root[data-theme=light] .sc-v.l{color:#c23b3b}",
    ":root[data-theme=light] em.w,:root[data-theme=light] .po-rr .d.w,:root[data-theme=light] .mk-t td small.up{color:#1f8b4c}",
    ":root[data-theme=light] .po-pf3 .on{color:#1f8b4c}:root[data-theme=light] .po-pf3 .trial{color:#b26b00}",
    ":root[data-theme=light] .hero{background:radial-gradient(120% 140% at 100% 0%,color-mix(in srgb,var(--c) 28%,transparent),transparent 60%),#fff}",
    ":root[data-theme=light] iframe.rep{background:#fff}"
  ].join("\n");
  document.head.appendChild(css);
  // 접기 칩이 헤더 바로 아래 붙도록 헤더 높이 기억
  function hh(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }
  window.addEventListener("resize", hh); setTimeout(hh, 300); setTimeout(hh, 1500);
})();
