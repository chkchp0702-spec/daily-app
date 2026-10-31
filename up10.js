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
  function hon(v, o){ return window.HON ? HON.chip(v, o) : ""; }   // 🧾 정직 계산 칩 (honest.js · 자료 없으면 빈칸)
  function J(name){ return getJSON(RAW + name + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }   // 같은 2분 안엔 한 번만 받음 (index.html getJSON)
  var UI = {theme: "auto", fs: "auto", home: "time", mkt: "time"};   // 10/14 A15-3: fs = "auto"(아이폰 글자 크기 따라감) | 0.88~1.22   // 10/14 A9-1: home = "time"(시간대 맞춤 순서) | "fixed"(고정)
  try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); if (u.theme) UI.theme = u.theme; if (u.fs) UI.fs = u.fs === 1 ? "auto" : u.fs === 0.92 ? 0.94 : u.fs === 1.12 ? 1.1 : u.fs; if (u.home) UI.home = u.home; if (u.mkt) UI.mkt = u.mkt; } catch(x) {}
  function keepUI(){ try { localStorage.setItem("ui", JSON.stringify(UI)); } catch(x) {} }

  /* ---------- ⑥ 테마 · 글자 크기 ---------- */
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : null;
  function applyUI(){
    var t = UI.theme === "auto" ? (mq && mq.matches ? "light" : "dark") : UI.theme;
    document.documentElement.setAttribute("data-ui", t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "light" ? "#f5f6fa" : "#0b0f17");
    document.documentElement.style.setProperty("--fs", UI.fs === "auto" ? 1 : UI.fs);
    // 10/14 A15-3: zoom(카드·여백까지 다 커짐) 대신 글자만 키움 — ux1014c.js chFont 가 글자 크기 규칙만 고쳐 씀
    if (document.body) document.body.style.zoom = "";
    if (window.chFont) window.chFont(UI.fs);
  }
  if (mq && mq.addEventListener) mq.addEventListener("change", applyUI);
  applyUI();
  function settings(){
    var old = document.getElementById("uiset"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "uiset";
    var row = function(lab, key, opts){ return '<div class="us-r"><span>' + lab + '</span><div class="us-seg">' + opts.map(function(o){
      return '<button data-k="' + key + '" data-v="' + o[0] + '" class="' + (String(UI[key]) === String(o[0]) ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div></div>'; };
    d.innerHTML = '<b>⚙️ 보기 설정</b>' + row("화면", "theme", [["auto", "자동"], ["dark", "🌙 어둡게"], ["light", "☀️ 밝게"]]) +
      row("글자", "fs", [["auto", "📱 자동"], [0.88, "가"], [0.94, "가"], [1, "가"], [1.1, "가"], [1.22, "가"]]) +
      row("🌐 시황 순서", "mkt", [["time", "🕘 시간대"], ["fixed", "고정"]]) +
      '<small>글자 「📱 자동」 = 아이폰 설정 › 디스플레이 › 텍스트 크기를 따라가요(가 다섯 개 = 아주 작게 ~ 아주 크게, 카드 모양은 그대로). 화면 자동 = 휴대폰 설정(다크 모드)을 따라가요. 시황 「시간대」 = 아침·장중·저녁·밤마다 지금 볼 카드를 맨 위로.</small>' +
      '<div class="us-ver">앱 버전 v' + e(window.APPV || "") + (window.M && M.updated ? ' · 자료 목록 ' + e(String(M.updated).slice(5)) : '') + '</div>' +
      '<div class="us-go"><button data-gloss="1">📖 용어 풀이</button><button data-go="score">📊 성적표</button><button data-go="alarm">🔔 알림 켜기·끄기</button><button data-go="idea">💬 의견함</button><button data-go="onepager">📄 종목리포트</button></div>';
    document.body.appendChild(d);
    [].forEach.call(d.querySelectorAll("[data-go]"), function(b){ b.onclick = function(){ d.remove(); go(b.dataset.go); }; });
    [].forEach.call(d.querySelectorAll("button[data-k]"), function(b){ b.onclick = function(){ var k = b.dataset.k, v = b.dataset.v; UI[k] = k === "fs" && v !== "auto" ? +v : v; keepUI(); applyUI(); d.remove(); settings();
      if (k === "home" && window.cur === "home" && window.homeInit) homeInit(); if (k === "mkt" && window.cur === "market") go("market", window.curDate); }; });
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
      if (el){ if (window.unclamp) unclamp(el); var f = el.closest(".fold"); if (f && !f.classList.contains("open")) f.classList.add("open");
        if (el.classList.contains("xs-hid") && window.closeSheet){ /* 「더 보기」로 숨은 카드면 그대로 펼쳐 보이기 */ el.classList.remove("xs-hid"); }
        setTimeout(function(){ var hd = document.querySelector("header"), jb = document.querySelector(".fold-jump");
          var y = el.getBoundingClientRect().top + window.scrollY - ((hd ? hd.offsetHeight : 0) + (jb ? jb.offsetHeight : 0) + 8);
          window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); el.classList.add("flash"); setTimeout(function(){ el.classList.remove("flash"); }, 1800); }, 80); return; }
      // ⚡ 킥 카드는 포트 탭이 「킥 포트」일 때만 있으니, 없으면 킥 포트로 바꿔서 다시 찾기
      if (anchor === "pokick" && Date.now() - t0 > 400 && !find.sw){ var kb = document.querySelector('#pobody [data-pf="kick"]'); if (kb){ find.sw = 1; kb.click(); } }
      if (Date.now() - t0 < 8000) setTimeout(find, 150);
    })();
  };
  function deep(){
    var h = (location.hash || "").slice(1); if (h.indexOf("~") < 0) return;
    var p = h.split("~"); setTimeout(function(){ goTo(p[0], p[1]); }, 50);
  }
  window.addEventListener("hashchange", deep);
  window.addEventListener("load", function(){ setTimeout(deep, 400); });
  // 화면 연동 (10/10 사용자: "뭐든지 누르면 화면 연동 잘 되게") — 어디서든 ① 종목 이름(data-op) → 그 종목 화면 ② 줄·칩·카드(data-goto) → 그 탭의 그 카드
  document.addEventListener("click", function(ev){
    if (ev.defaultPrevented || !ev.target.closest) return;            // 다른 화면이 이미 처리한 클릭
    var op = ev.target.closest("[data-op]");
    if (op && window.openOP){ ev.preventDefault(); ev.stopPropagation(); openOP(op.getAttribute("data-op")); return; }
    var t = ev.target.closest("[data-goto]"); if (!t) return;
    // 10/19: 카드 안의 단추·링크(접기·펼치기·전체 보기 등)를 누르면 카드 전체 이동(data-goto)을 하지 않음
    var ctl = ev.target.closest("button,a,summary,input,select,label,.fold"); if (ctl && !ctl.hasAttribute("data-goto") && t !== ctl && t.contains(ctl)) return;
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
  /* ---------- 🗳 A9-5 「🔮 예고에 내 표 던지기」 — 표는 이 휴대폰 안(localStorage)에만 ---------- */
  var VOTE = {}, VH = {};
  try { VOTE = JSON.parse(localStorage.getItem("hvote") || "{}") || {}; VH = JSON.parse(localStorage.getItem("hvote_hist") || "{}") || {}; } catch(x) {}
  function keepVote(){ try { localStorage.setItem("hvote", JSON.stringify(VOTE)); localStorage.setItem("hvote_hist", JSON.stringify(VH)); } catch(x) {} }
  function prevKey(G){   // 어제 예고의 날짜: home.json 이 주면 그것, 없으면 표가 있는 날 중 채점일보다 앞선 가장 최근
    if (G.prev) return G.prev;
    var ks = Object.keys(VOTE).filter(function(k){ return !G.date || k < G.date; }).sort();
    return ks.length ? ks[ks.length - 1] : null;
  }
  function gradeVotes(G){   // 채점 카드 한 줄 — 앱 ✓✗ 와 내 ✓✗ 나란히 · 누적은 날짜당 한 번만 셈
    var pk = prevKey(G), mine = pk && VOTE[pk] || {}, out = {rows: [], me_ok: 0, me_n: 0, app_ok: 0, app_n: 0};
    (G.items || []).forEach(function(x, i){
      var v = mine[String(i + 1)], scored = x.cls === "ok" || x.cls === "no";
      if (scored){ out.app_n++; if (x.cls === "ok") out.app_ok++; }
      var r = null;
      if (v && scored){ r = (v > 0) === (x.cls === "ok"); out.me_n++; if (r) out.me_ok++; }
      out.rows.push({v: v, r: r});
    });
    if (G.date && out.app_n && !VH[G.date]){ VH[G.date] = {app_ok: out.app_ok, app_n: out.app_n, me_ok: out.me_ok, me_n: out.me_n}; keepVote(); }
    var T = {app_ok: 0, app_n: 0, me_ok: 0, me_n: 0};
    Object.keys(VH).forEach(function(k){ var h = VH[k]; T.app_ok += h.app_ok || 0; T.app_n += h.app_n || 0; T.me_ok += h.me_ok || 0; T.me_n += h.me_n || 0; });
    out.tot = T;
    return out;
  }
  function voteBtns(date, i){
    var v = (VOTE[date] || {})[String(i)];
    return '<span class="hm-vt"><button data-vote="' + e(date) + '|' + i + '|1" class="' + (v > 0 ? "on" : "") + '" aria-label="그렇다">👍</button><button data-vote="' + e(date) + '|' + i + '|-1" class="' + (v < 0 ? "on" : "") + '" aria-label="아니다">👎</button></span>';
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-vote]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var p = t.dataset.vote.split("|"), d = p[0], i = p[1], v = +p[2];
    VOTE[d] = VOTE[d] || {};
    if (VOTE[d][i] === v) delete VOTE[d][i]; else VOTE[d][i] = v;   // 같은 걸 또 누르면 취소
    keepVote();
    var wrap = t.closest(".hm-vt"); if (wrap){ [].forEach.call(wrap.children, function(b){ b.classList.toggle("on", (VOTE[d][i] || 0) === +b.dataset.vote.split("|")[2]); }); }
    if (window.P && window.P.toast) window.P.toast(VOTE[d][i] ? (v > 0 ? "👍 그렇다 — 내일 아침 채점해요" : "👎 아니다 — 내일 아침 채점해요") : "표 취소");
  }, true);

  /* ---------- 🌅 A9-1 시간대 맞춤 홈 — 지금 볼 카드를 맨 위로 (설정 「홈 순서」로 고정 가능) ---------- */
  function edition(now){   // now = 한국 시간으로 맞춘 Date (getUTC* 로 읽음)
    var m = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (m < 6 * 60) return {k: "night", ic: "🌙", t: "밤판", order: ["port", "score", "kick", "grade", "focus", "brain"], why: "미국 장 끝 — 포트 성적부터"};
    if (m < 9 * 60) return {k: "morn", ic: "🌅", t: "아침판", order: ["grade", "kick", "port", "focus", "brain", "score"], why: "어제 결과·오늘 할 일부터"};
    if (m < 15 * 60 + 30) return {k: "day", ic: "🌞", t: "장중판", order: ["focus", "brain", "kick", "port", "grade", "score"], why: "한국 장중 — 오늘 집중·지금 생각부터"};
    if (m < 22 * 60 + 30) return {k: "eve", ic: "🌆", t: "저녁판", order: ["kick", "grade", "port", "focus", "brain", "score"], why: "미국 장 전 — 킥 할 일·🔮 예고부터"};
    return {k: "night", ic: "🌙", t: "밤판", order: ["port", "score", "kick", "grade", "focus", "brain"], why: "미국 장중 — 포트 성적부터"};
  }
  var FIXED = ["grade", "port", "kick", "focus", "brain", "score"];

  function drawHome(H){
    var b = document.getElementById("hmbody"); if (!b) return;
    var P = H.port || {}, K = H.kick || {}, D = H.danta || {}, Bn = H.brain || {}, S = H.scores || {};
    var now = new Date(Date.now() + 9 * 3600e3), wd = "일월화수목금토"[now.getUTCDay()];
    var ED = edition(now), useTime = UI.home !== "fixed";
    // 10/15 A9-3: 「08:56 기준」 글자 → ⟳ 신선도 칩(ux1015.js 가 「N분 전」·색을 채움) · 가운뎃점 대신 간격
    var h = '<div class="hm-day"><span class="hm-date">' + (now.getUTCMonth() + 1) + '/' + now.getUTCDate() + ' (' + wd + ')</span>' +
      '<span class="hm-fresh" id="hmfresh" role="button" data-at="' + e(H.at || "") + '">⟳ ' + e(String(H.at || "").slice(11, 16)) + '</span>' +
      '</div>' +
      '<div class="hm-live" id="hmlive" data-ed="' + ED.k + '" role="button" hidden></div>';   // 10/15 A9-1 🌞 장중 띠 (ux1015.js)
    // 10/13 「더 자주 열게」 ③ 어제보다 바뀐 것 · ⑦ 이번 주 복기(주말) · ⑥ 어제 예고 → 오늘 결과
    var CH = (H.chg && H.chg.items) || [];
    /* 🧹 10/21 사용자 「앱이 복잡하고 산만하다 — 다 진행해」: 홈 = 오늘 한 장(① 오늘 한 줄+볼 곳 ux1019.js · ② 내 포트 · ③ 바뀐 것 3줄) — 나머지는 각 탭·🗂 신호 › 더 보기·📊 성적표로 */
    var chgH = "";
    if (CH.length) chgH = '<section class="card hm-chg" data-strip="home"><div class="hm-h"><span class="hm-i">🆕</span><div><b>바뀐 것</b><small>' + (H.chg.since ? md(H.chg.since) + ' 이후' : '') + (CH.length > 3 ? ' · 중요한 3가지' : '') + '</small></div></div>' +
      CH.slice(0, 3).map(function(x){ return '<div class="hm-chi" data-goto="' + e(x.go || "home") + '"><span>' + e(x.ic) + '</span>' + chgBody(x) + '<i>›</i></div>'; }).join("") + '</section>';
    var Wk = H.week || {}, dw = now.getUTCDay(), wkH = "";
    if ((dw === 6 || dw === 0) && Wk.days){
      var wb = [["💼 기본", Wk.base], ["⚡ 킥", Wk.kick], ["🎯 집중", Wk.conc]].filter(function(x){ return x[1] != null; });
      var wkH = card("port", "📅", "이번 주 복기", md(Wk.from) + "부터 " + Wk.days + "거래일 (미국 날짜)",
        '<div class="hm-big">' + wb.map(function(x){ return '<div><small>' + x[0] + '</small><b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b></div>'; }).join("") + '</div>' +
        '<div class="hm-l">S&amp;P500 <b class="' + cls(Wk.spy) + '">' + sg(Wk.spy) + '</b> · 코스피 <b class="' + cls(Wk.kospi) + '">' + sg(Wk.kospi) + '</b>' +
        (Wk.rep && Wk.rep.n ? ' · 시황 예고 ✓' + Wk.rep.win + ' ✗' + Wk.rep.loss : '') +
        (Wk.kick_ev && (Wk.kick_ev.buy || Wk.kick_ev.sell) ? ' · 킥 사기 ' + Wk.kick_ev.buy + ' · 팔기 ' + Wk.kick_ev.sell : '') + '</div>' +
        ((Wk.next || []).length ? '<div class="hm-wn"><small>앞으로 볼 일정</small>' + Wk.next.map(function(x){ return '<div><b>' + e(x.when) + '</b> ' + e(x.what) + '</div>'; }).join("") + '</div>' : '') +
        '', "포트");
    }
    var C = {};
    // 💼 포트 (A9-2: 선 끝에 값 · 범례 없음)
    var ex = (P.kick || 0) - (P.spy || 0);
    var spark = (window.V && P.nav && P.nav.length > 1) ? V.lines([{name: "공격(킥)", short: "공격", color: "#ff6b6b", vals: P.kick_line}].concat((function(){ var c = (P.conc_line || []).slice(), n = (P.nav || []).length; while (c.length && c.length < n) c.unshift(0); return c.length === n ? [{name: "집중", short: "집중", color: "#4dd47a", vals: c}] : []; })()).concat([{name: "기본", short: "기본", color: "#e9c46a", vals: P.nav}, {name: "S&P", short: "S&P", color: "#7c9cff", vals: P.spy_line, dash: 1}]),
      (P.nav || []).map(function(_, i){ return i ? "" : md(P.start); }), {h: 96, unit: "%", zero: 1, nodots: 1, endLabels: 1, nolegend: 1}) : "";
    // ⚡ 공격(킥) 오늘 할 일 — 포트 카드 안 한 줄로 합침 (10/21)
    var ev = K.events || [];
    var kickLine = ev.length ? ev.map(function(x){ return '<div class="hm-ev ' + (x.k === "사기" ? "buy" : "sell") + '">' + (x.k === "사기" ? "🟢 사기" : x.k === "팔기" ? "🔴 팔기" : "🟡 절반") + ' <b data-op="' + e(x.code) + '">' + e(x.name) + ' ›</b>' + (x.r != null ? ' ' + sg(x.r, 1) : '') + (x.why ? ' <small>' + e(x.why) + '</small>' : '') + '</div>'; }).join("")
      : '<div class="hm-l mut">공격(킥) 오늘 할 일 없음 — ' + md(K.asof) + ' 마감 기준 그대로</div>';
    C.port = card("port~pohero", "💼", "내 포트", md(P.start) + "부터 · " + md(P.asof) + " 미국 종가",
      '<div class="hm-big"><div data-goto="port~pohero"><small>기본</small><b class="' + cls(P.base) + '" data-num="' + P.base + '" data-k="base">' + sg(P.base, 1) + '</b></div>' +
        '<div data-goto="port~pokick"><small>공격(킥)</small><b class="' + cls(P.kick) + '" data-num="' + P.kick + '" data-k="kick">' + sg(P.kick, 1) + '</b></div>' +
        (P.conc != null ? '<div data-goto="port~poconc"><small>집중</small><b class="' + cls(P.conc) + '" data-num="' + P.conc + '" data-k="conc">' + sg(P.conc, 1) + '</b></div>' : '') + '</div>' +
      '<div class="hm-l">S&amp;P500 <b class="' + cls(P.spy) + '">' + sg(P.spy, 1) + '</b> · <a data-goto="port~pocmp" class="hm-nw">시장 ' + P.n_bench + '곳 중 <b>' + P.beat_kick + '</b>곳 앞섬 ›</a></div>' +
      '<div class="hm-sp">' + spark + '</div>' +
      (P.change ? '<div class="hm-alert" data-goto="port~pofollow">🔁 ' + md(P.change.date) + ' 비중·상품 바뀜 — <b>따라하기에서 맞추기 ›</b></div>' : '') + kickLine, "포트");
    // 🎯 집중
    if ((H.focus || []).length) C.focus = card("market~mkfo", "🎯", "오늘 집중", "돈이 몰리는 테마",
      H.focus.map(function(t){ return '<div class="hm-f"><b>' + e(t.name) + '</b> <span class="hm-chip ' + (t.stage === "과열" ? "b" : "g") + '">' + e(t.stage || "") + '</span> <small>5일 ' + sg(t.r5, 1) + ' · S&P 대비 20일 ' + sg(t.rs20, 1) + 'p</small>' +
        '<div class="hm-l">' + e(t.do || "") + ((t.stars || []).length ? ' · ★ ' + t.stars.map(function(s){ return '<a data-op="' + e(s.t) + '">' + e(s.name) + '</a>'; }).join(", ") : '') + ((t.etf_kr || []).length ? ' · 🇰🇷 <a data-op="' + e(t.etf_kr[0].t) + '">' + e(t.etf_kr[0].name) + '</a>' : '') + '</div></div>'; }).join(""), "시황");
    // ⚡ 단타
    // 10/12: ⚡ 단타 카드 뺌 — 단타는 알림(앱·텔레그램)으로만
    // 🧠 두뇌
    // ⏳ 10/19 사용자 「지금 생각 시각 좀 봐라…」(10:50 에 09:35 급락 개장 문장) → 몇 분 전 생각인지 붙이고, 60분 넘으면 「그 뒤 시장」 한 줄을 장중 나침반에서 바로 채움
    var bnAge = Bn.at ? Math.round((Date.now() - Date.parse(String(Bn.at).replace(" ", "T") + ":00+09:00")) / 60000) : null;
    if (Bn.summary) C.brain = card("feed~fdbrain", "🧠", "지금 생각", (Bn.regime || "") + " · " + md(Bn.at) + " " + String(Bn.at || "").slice(11, 16) + (bnAge != null && bnAge >= 0 ? (bnAge < 60 ? " · " + bnAge + "분 전" : ' · <b class="dn">⏳ ' + (bnAge < 120 ? bnAge + "분" : Math.round(bnAge / 60) + "시간") + ' 전 생각</b>') : ""),
      (bnAge != null && bnAge >= 60 ? '<div class="hm-l" id="hmbrlive"><small class="mut">그 뒤 시장 불러오는 중…</small></div>' : '') +
      '<div class="hm-l">' + e(Bn.summary) + '</div>' + ((Bn.ideas || []).length ? '<div class="hm-chips">' + Bn.ideas.map(function(x){ var t = typeof x === "string" ? x : ((x["칸"] || x.box || "") + " " + (x["제안"] || x.idea || "")); return t.trim() ? '<span class="hm-chip" data-goto="port~poct">💡 ' + e(t) + '</span>' : ''; }).join("") + '</div>' : ''), "피드");
    // 📊 성적
    C.score = card("score", "📊", "성적 한 줄", "무엇이 이기고 지나",
      '<div class="hm-l">' + ((S.good || []).length ? '✅ ' + e(S.good.join(" · ")) : '') + ((S.bad || []).length ? '<br>❌ ' + e(S.bad.join(" · ")) : '') + (!(S.good || []).length && !(S.bad || []).length ? '표본이 쌓이는 중' : '') + '</div>', "성적표");
    h += (C.port || "") + chgH + (wkH || "") +
      '<div class="hm-more"><a data-goto="sector">🧭 나침반</a><a data-goto="sigmore">🗂 예고 채점·두뇌 논지</a><a data-goto="score">📊 성적표</a><a data-goto="feed~fdbrain">🧠 지금 생각</a><a data-gloss="1">📖 용어 풀이</a></div>';
    b.innerHTML = h;
    HSH = H;
    if (document.getElementById("hmbrlive")) getJSON("archive/x/live_kr.json?" + Math.floor(Date.now() / 120000), {ttl: 120000}).then(function(L){
      var el = document.getElementById("hmbrlive"); if (!el) return;
      var ix = L && L.index || [], ok = L && L.date === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      if (!ok || !ix.length){ el.innerHTML = '<small class="mut">⏳ 아래 생각은 ' + e(String(Bn.at).slice(11, 16)) + ' 것 — 다음 검토 때 바뀌어요</small>'; return; }
      var ss = (L.sectors || []).filter(function(x){ return x.r != null; }).sort(function(a, b2){ return b2.r - a.r; });
      el.innerHTML = '<b>⚡ 그 뒤 ' + e(L.t) + ' 지금</b> ' + ix.map(function(x){ return e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg, 2) + '</b>'; }).join(" · ") +
        (ss.length ? ' · 강한 ' + e(ss[0].name) + ' ' + sg(ss[0].r, 1) + ' · 약한 ' + e(ss[ss.length - 1].name) + ' ' + sg(ss[ss.length - 1].r, 1) : '') +
        '<br><small class="mut">아래 생각은 ' + e(String(Bn.at).slice(11, 16)) + ' 것 — 그 사이 시장이 바뀌었을 수 있어요</small>';
    }).catch(function(){});
    var edl = document.getElementById("hmed"); if (edl) edl.onclick = function(ev){ ev.stopPropagation(); if (window.P && window.P.toast) window.P.toast(ED.ic + " " + ED.t + " — " + ED.why + " · 순서는 ⚙️ 설정에서"); };
    var sb = document.getElementById("hmstory"); if (sb) sb.onclick = function(ev){ ev.stopPropagation(); if (window.hmStory) hmStory(); };
    if (window.hmAfter) try { hmAfter(H); } catch(x) { if (window.console) console.warn("hmAfter", x); }   // 10/15 A9-1·3·4 (ux1015.js)
  }
  /* 🎯 어제 예고 → 오늘 결과 — 10/21부터 홈이 아니라 🎯 신호 › 🗂 더 보기(sigmore)에 */
  function gradeCard(H){
    var G = H && H.grade; if (!G || !(G.items || []).length) return "";
      var ok = G.items.filter(function(x){ return x.cls === "ok"; }).length, no = G.items.filter(function(x){ return x.cls === "no"; }).length;
      var GV = gradeVotes(G), meTxt = GV.me_n ? ' · 나 ✓' + GV.me_ok + ' ✗' + (GV.me_n - GV.me_ok) : '';
      var tot = GV.tot, cum = (tot.me_n >= 1 && tot.app_n >= 1) ? '<div class="hm-vs"><span>🗳 나 vs 앱 적중률</span>' +
        '<div><small>나</small><i><b style="width:' + Math.round(tot.me_ok / tot.me_n * 100) + '%"></b></i><em>' + Math.round(tot.me_ok / tot.me_n * 100) + '% <span class="mut">(' + tot.me_n + '건)</span></em></div>' +
        '<div><small>앱</small><i><b style="width:' + Math.round(tot.app_ok / tot.app_n * 100) + '%"></b></i><em>' + Math.round(tot.app_ok / tot.app_n * 100) + '% <span class="mut">(' + tot.app_n + '건)</span></em></div></div>' : '';
      return card("market", "🎯", "어제 예고 → 오늘 결과", md(G.date) + " " + e(G.label || "") + " 채점 · 앱 ✓" + ok + " ✗" + no + meTxt + (G.rate != null ? ' · 누적 적중 <span data-num="' + G.rate + '" data-k="rate" data-d="0" data-u="%" data-nosign="1">' + G.rate + '%</span>' : "") + ((G.last10 || []).length ? ' <span class="hm-l10" title="최근 ' + G.last10.length + '번 채점 (왼쪽이 옛날)">' + dots(G.last10) + '</span>' : ""),
        G.items.map(function(x, i){ var r = GV.rows[i] || {};
          return '<div class="hm-gr ' + e(x.cls || "") + '"><span>' + e(x.mark || "·") + '</span><div><b>' + e(x.t) +
            (r.v ? ' <span class="hm-me ' + (r.r === true ? "ok" : r.r === false ? "no" : "") + '">나 ' + (r.v > 0 ? "👍" : "👎") + (r.r === true ? " ✓" : r.r === false ? " ✗" : "") + '</span>' : '') +
            '</b>' + trail(x.tr, true) + '<small>' + e(x.x) + '</small></div></div>'; }).join("") + cum + voices(G.voices) +
        ((G.next || []).length ? '<div class="hm-wn"><small>🔮 오늘의 예고 — 내일 아침 채점 · 👍👎 로 내 표도</small>' + G.next.map(function(x, i){
          return '<div class="hm-nx">' + (x.p != null ? '<span class="hm-pb" title="앱이 보는 확률 ' + Math.round(x.p * 100) + '%"><i style="width:' + Math.round(x.p * 100) + '%"></i><b>' + Math.round(x.p * 100) + '%</b></span>' : '') +
            '<span class="hm-nxt">' + e(x.t) + trail(x.tr, false) + '</span>' + (G.date ? voteBtns(G.date, i + 1) : '') + '</div>'; }).join("") + '</div>' : '') +
        '<button class="hm-sh" data-share="grade">📤 카톡으로 공유</button>', "시황");
  }
  window.gradeCard = gradeCard;
  window.hmEdition = edition;
  /* ---------- 🔀 10/15 A9-2 「바뀐 것」 전 → 후 두 토막 · 같은 말은 흐리게 ---------- */
  function chgBody(x){
    var a = x.a, b = x.b, lab = x.lab, note = x.note;
    if (lab && a == null) return '<div class="hm-cb"><b>' + e(lab) + '</b>' + (x.sub ? '<small class="hm-cs">' + e(x.sub) + '</small>' : '') + '</div>';
    if (a == null || b == null){   // 옛 home.json — 「 → 」 마지막 것 기준으로 나눠 봄
      var t = String(x.t || ""), i = t.lastIndexOf(" → ");
      if (i < 0) return '<b>' + e(t) + '</b>';
      lab = ""; a = t.slice(0, i); b = t.slice(i + 3);
    }
    var sp = function(v){ return String(v).split(" / "); }, A = sp(a), B = sp(b);
    var mark = function(L, O){ return L.map(function(seg){ return '<span class="' + (O.indexOf(seg) >= 0 ? "same" : "diff") + '">' + e(seg) + '</span>'; }).join('<span class="sl"> / </span>'); };
    return '<div class="hm-cb">' + (lab ? '<b>' + e(lab) + (note ? ' <small>(' + e(note) + ')</small>' : '') + '</b>' : '') +
      ('<div class="hm-ab"><span class="hm-a">' + mark(A, B) + '</span><span class="hm-to">→</span><span class="hm-b">' + mark(B, A) + '</span></div>') + '</div>';
  }
  /* ---------- 🗣 10/19 A10/19-3 「엇갈린 날, 누가 맞았나」 — 코스피를 두고 🎲 시장확률 · 🧠 두뇌 · 💭 지금 생각(열쇠 적은 날만)을 매일 종가로 채점 (home.py voices · market/voices.json) ---------- */
  function voices(V){
    if (!V || !V.today) return "";
    var W = {up: "오름", down: "내림", flat: "중립"}, tv = V.today.v || {}, keys = [["dice", "🎲 시장확률"], ["brain", "🧠 두뇌"], ["think", "💭 지금 생각"]];
    var todayTxt = function(k){ var x = tv[k]; if (!x) return '<em class="mut">' + (k === "think" ? "열쇠 없음" : "—") + '</em>'; return '<em class="' + (x.d === "up" ? "up" : x.d === "down" ? "dn" : "") + '">' + e(k === "dice" && x.t ? x.t : (W[x.d] || x.d)) + (x.p != null ? ' ' + Math.round(x.p * 100) + '%' : '') + '</em>'; };
    var ds = Object.keys(tv).map(function(k){ return tv[k].d; }), one = ds.length >= 2 && ds.every(function(d){ return d === ds[0]; });
    var r = V.today.r, rTxt = r && r.chg != null ? ' · 코스피 종가 ' + (r.chg > 0 ? "+" : "") + r.chg.toFixed(2) + '%' : (V.today.at ? ' · ' + e(V.today.at) + ' 적어 둠, 마감 뒤 채점' : '');
    var row = function(k, lab, S){ S = S || {}; var n = S.n || 0, w = S.win || 0;
      return '<div class="hm-vr"><span>' + lab + '</span>' + (k ? todayTxt(k) : '<em class="mut">' + (one ? "오늘 한목소리 " + e(W[ds[0]]) : "오늘은 엇갈림") + '</em>') +
        '<b>' + ((S.last10 || []).length ? dots(S.last10) : '') + (n ? ' ✓' + w + ' ✗' + (n - w) + (n >= 10 ? ' <i class="pc">' + Math.round(w / n * 100) + '%</i>' : '') : '<i class="mut">아직 0</i>') + '</b></div>'; };
    return '<div class="hm-vc"><small>🗣 코스피를 두고 앱의 세 목소리 — 장 시작 무렵 적어 두고 매일 종가로 채점' + rTxt + '</small>' +
      keys.map(function(z){ return row(z[0], z[1], V[z[0]]); }).join("") + row(null, "🎯 한목소리 날", V.chorus) +
      '<div class="hm-vn">오름 = 종가 + · 내림 = − · 중립 = ±0.5% 안 · 💭 는 지금 생각에 방향 열쇠를 적은 날만 · ' + (V.days || 0) + '일 채점</div></div>';
  }

  /* ---------- 🧵 10/15 A9-5 예고 실타래 — 같은 주제 최근 맞음(●)·빗나감(○) ---------- */
  function dots(L){ return (L || []).map(function(m){ var v = typeof m === "string" ? m : m.m; return '<i class="' + (v === "ok" ? "o" : "x") + '"></i>'; }).join(""); }
  function trail(tr, inGrade){
    if (!tr || !tr.length || (inGrade && tr.length < 2)) return "";
    var last = tr[tr.length - 1].m, run = 0; for (var i = tr.length - 1; i >= 0 && tr[i].m === last; i--) run++;
    var ok = tr.filter(function(x){ return x.m === "ok"; }).length;
    var lab = run >= 2 ? (last === "ok" ? run + "번 연속 맞음" : run + "번 연속 빗나감") : "최근 " + tr.length + "번 ✓" + ok + " ✗" + (tr.length - ok);
    return '<span class="hm-tr" role="button" title="같은 주제 최근 채점 — 누르면 날짜별">' + dots(tr) + '<em class="' + (run >= 2 ? (last === "ok" ? "ok" : "no") : "") + '">' + lab + '</em></span>' +
      '<span class="hm-trd" hidden>' + tr.map(function(x){ return md(x.d) + ' ' + (x.m === "ok" ? "✓" : "✗"); }).join(" · ") + ' <span class="mut">(채점한 날)</span></span>';
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest(".hm-tr"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var d = t.nextElementSibling; if (d && d.classList.contains("hm-trd")) d.hidden = !d.hidden;
  }, true);
  // ⑧ 공유: 카드 내용을 글로 만들어 휴대폰 공유창(카톡 등)으로
  var HSH = null;
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-share]"); if (!t || !HSH) return;
    ev.preventDefault(); ev.stopPropagation();
    var H = HSH, P = H.port || {}, k = t.dataset.share, txt = "", hash = "";
    if (k === "port"){ txt = "💼 CH Investing 포트 (" + md(P.start) + "부터)\n" + (P.conc != null ? "🎯 집중 " + sg(P.conc) + " · " : "") + "⚡ 킥 " + sg(P.kick) + " · 💼 기본 " + sg(P.base) + "\nS&P500 " + sg(P.spy) + " · 시장 " + P.n_bench + "곳 중 " + P.beat_kick + "곳보다 앞섬"; hash = "port"; }
    else if (k === "grade"){ var G = H.grade || {}; txt = "🎯 시황 예고 채점 (" + md(G.date) + ")\n" + (G.items || []).map(function(x){ return x.mark + " " + x.t; }).join("\n") + (G.rate != null ? "\n누적 적중 " + G.rate + "%" : "") + ((G.next || []).length ? "\n\n🔮 오늘 예고\n" + G.next.map(function(x){ return (x.p != null ? Math.round(x.p * 100) + "% " : "") + x.t; }).join("\n") : ""); hash = "market"; }
    else if (k === "week"){ var W = H.week || {}; txt = "📅 이번 주 복기 (" + md(W.from) + "부터)\n💼 기본 " + sg(W.base) + (W.kick != null ? " · ⚡ 킥 " + sg(W.kick) : "") + (W.conc != null ? " · 🎯 집중 " + sg(W.conc) : "") + "\nS&P500 " + sg(W.spy) + " · 코스피 " + sg(W.kospi); hash = "home"; }
    if (window.chShare) chShare("CH Investing", txt + "\n\n※ 투자 참고용 · 매수 추천 아님", hash);
  }, true);

  /* ---------- 🗂 10/21 신호 › 더 보기 — 「있으면 좋은 것」 한 단계 아래 (사용자: 「6번은 신호 탭 안에서 한 단계 내리는 걸로」)
     ① 어제 예고 → 오늘 결과(예고 채점 · 내 표) ② 두뇌 논지 목록 ③ 고래·컵·갭 상세 · 단타 통계 · 조용한 매집 바로가기 ---------- */
  window.sigmoreView = function(){ return '<div id="smbody"><div class="loading">모으는 중…</div></div>'; };
  window.sigmoreInit = function(){
    Promise.all([J("home.json").catch(function(){ return null; }), getJSON("https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/brain/state.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })]).then(function(a){
      var b = document.getElementById("smbody"); if (!b) return;
      var H = a[0] || {}, T = a[1] || {}; HSH = H;
      var h = gradeCard(H) || '<section class="card"><h3>🎯 예고 채점</h3><div class="empty">오늘 채점이 아직 없어요.</div></section>';
      var th = (T.theses || []).slice().sort(function(x, y){ return (y.conf || 0) - (x.conf || 0); });
      if (th.length) h += '<section class="card sm-th"><h3>🧠 두뇌 논지 <span class="mut">' + th.length + '개 · 확신 높은 순 · 매시간 점검</span></h3>' + th.map(function(x){
        var c = Math.round((x.conf || 0) * 100);
        return '<div class="sm-t"><div class="sm-tb"><b>' + e(x.t) + '</b><span class="sm-c"><i style="width:' + c + '%"></i><em>' + c + '%</em></span></div>' +
          (x.breaks ? '<small>이러면 틀림 — ' + e(x.breaks) + '</small>' : '') + (x.since ? '<small class="mut">' + md(x.since) + '부터</small>' : '') + '</div>'; }).join("") + '</section>';
      var L = [["whale", "🐋", "고래 상세", "고래별 성적·합의 매수·매도 경보 등 17가지"], ["cup", "☕", "컵 상세", "돌파 후 추적·주봉 컵·신호 성적표"], ["gap", "📈", "갭 상세", "갭 메움·미국 밤 갭·실적 갭"],
               ["danta", "⚡", "단타 통계", "전광판·날짜별 성적 (알림으로 받는 것)"], ["accum", "🤫", "조용한 매집", "거래량 이상·박스 돌파 (참고용)"]];
      h += '<section class="card"><h3>📂 신호 상세 <span class="mut">각 화면 맨 아래 「더 보기」</span></h3>' + L.map(function(x){
        return '<div class="sm-go" data-goto="' + x[0] + '"><span>' + x[1] + '</span><div><b>' + x[2] + '</b><small>' + x[3] + '</small></div><i>›</i></div>'; }).join("") + '</section>';
      b.innerHTML = h;
    });
  };
  /* ---------- ③ 📊 성적표 ---------- */
  window.scoreView = function(){ return '<div id="scbody"><div class="loading">채점 모으는 중…</div></div>'; };
  window.scoreInit = function(){
    Promise.all([J("scores.json"), getJSON("archive/x/prob.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })]).then(function(a){ drawScore(a[0], a[1]); }).catch(function(){ var b = document.getElementById("scbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">📊</div>성적표가 아직 안 올라왔어요.</div>'; });
  };
  function bar(w, l){ var n = (w || 0) + (l || 0); if (!n) return ''; return '<div class="sc-bar"><span class="w" style="flex:' + w + '">' + (w ? w : "") + '</span><span class="l" style="flex:' + l + '">' + (l ? l : "") + '</span></div>'; }
  /* 🩺 10/29 성적표 ⚡ 신호별에 「nh52·pead·cust·ins·earn·maxcut·frog」 영어 내부 이름이 그대로 보이던 것 — 건강검진 「영어 내부 이름」 검사로 찾음 */
  var SIGK = {cup: "컵", gap: "갭", accum: "매집", whale: "고래", focus: "집중", lead: "선행", nh52: "52주 신고가", pead: "실적 표류", dip: "급락 반등", trend: "추세",
    cust: "고객사 따라", ins: "내부자 매수", earn: "실적 갭", maxcut: "복권 거름망", frog: "개구리 갭", agree: "신호 겹침", nonews: "뉴스 없는 갭", pbskip: "눌림 안 온 갭", krgap: "한국 돌파 갭", cup_eye: "컵(눈 검사)"};
  function drawScore(S, PB){
    var b = document.getElementById("scbody"); if (!b) return;
    /* 🎲 10/21: 홈 첫 카드의 「아직 동전보다 못함」 경고·적중률은 여기로 (전면엔 말로만) */
    var d1 = PB && PB.score && PB.score.all && PB.score.all.d1 || {}, okN = d1.n ? Math.round(d1.hit / 100 * d1.n) : 0, proven = (d1.n || 0) >= 20 && (d1.hit || 0) >= 55;
    var pcard = d1.n ? '<section class="card sc-c" data-goto="prob"><div class="sc-h"><span class="hm-i">🎲</span><div><b>시장확률 — 다음 날 방향</b><small>홈 「오늘 한 줄」이 얼마나 맞나 · 5개 시장 합산</small></div>' +
      '<div class="sc-rate ' + (d1.hit >= 55 ? "up" : d1.hit < 45 ? "dn" : "") + '">' + Math.round(d1.hit) + '%<small>맞음</small></div><span class="hm-go">보기 ›</span></div>' + bar(okN, d1.n - okN) +
      '<p class="note">' + d1.n + '번 중 ' + okN + '번 맞음. ' + (proven ? '20번 넘게 채점해 55%를 넘어서, 홈에서 「세게」 말해요.' : '<b>아직 동전보다 확실히 낫지 않아요</b> — 20번 넘게 채점해 55%를 넘기 전까지 홈에서는 「약간 오를 쪽」처럼 약하게만 말해요. 이 숫자로 사고팔지 마세요.') + '</p></section>' : '';
    /* 📊 10/31 B9 「번 돈÷잃은 돈 1.6 (비용 뺀 36건)」 글자 벽 → 막대 그림 — 가운데 선 = 본전(1배), 오른쪽 초록 = 버는 쪽, 왼쪽 빨강 = 잃는 쪽 */
    var pfRow = function(x, good){ var m = /^(.*?)\s*손익비\s*([\d.]+)\s*(?:\((.*)\))?/.exec(String(x)); if (!m) return '<div class="pf-r"><span class="pf-n">' + e(x) + '</span></div>';
      var v = +m[2], L = Math.min(1, Math.abs(Math.log(Math.max(v, 0.05))) / Math.log(4)) * 50, sub = (m[3] || "").replace(/비용 뺀\s*/, "").replace(/비용 전\s*([\d.]+)/, "비용 빼기 전 $1배");
      return '<div class="pf-r"><span class="pf-n">' + e(m[1]) + (sub ? '<small>' + e(sub) + '</small>' : '') + '</span><span class="pf-t"><i class="pf-z"></i><i class="pf-b ' + (v >= 1 ? "g" : "r") + '" style="' + (v >= 1 ? "left:50%" : "right:50%") + ';width:' + L.toFixed(1) + '%"></i></span><b class="pf-v ' + (v >= 1 ? "g" : "r") + '">' + v.toFixed(v >= 10 ? 0 : 1) + '배</b></div>'; };
    var pfAll = (S.good || []).map(function(x){ return pfRow(x, 1); }).concat((S.bad || []).map(function(x){ return pfRow(x, 0); }));
    var h = pcard + '<section class="card sc-top sc-c" data-goto="port~pokick"><div class="sc-h"><span class="hm-i">⚖️</span><div><b>신호별 번 돈 ÷ 잃은 돈</b><small>가운데 선 = 본전(1배) · 오른쪽으로 길수록 잘 버는 신호</small></div></div>' +
      (pfAll.length ? '<div class="pf-l">' + pfAll.join("") + '</div>' : '<p class="mut">표본 쌓는 중</p>') +
      '<p class="note">매시간 자동 채점 · ' + e(String(S.at || "").slice(5)) + ' · 매일 저녁 자가 업그레이드가 이 숫자로 규칙을 고쳐요(지는 건 줄이고 이기는 건 늘림).</p></section>';
    (S.rows || []).forEach(function(r){
      var top = '<div class="sc-h"><span class="hm-i">' + r.ic + '</span><div><b>' + e(r.t) + '</b><small>' + e(r.note || "") + '</small></div>' +
        (r.rate != null && ((r.win || 0) + (r.loss || 0) >= 5 || (r.k === "kick" && (r.n || 0) >= 5)) ? '<div class="sc-rate ' + (r.rate >= 55 ? "up" : r.rate < 45 ? "dn" : "") + '">' + r.rate + '%<small>맞음</small></div>' : r.avg != null ? '<div class="sc-rate ' + cls(r.avg) + '">' + sg(r.avg, 1) + '<small>평균</small></div>' : '') + '</div>';
      var nn = (r.win || 0) + (r.loss || 0);
      var body = nn && nn < 5 && r.k !== "port" ? '<div class="sc-few">표본 ' + nn + '건 — 5건 넘으면 비율을 보여 줘요</div>' : bar(r.win, r.loss);
      if (r.k === "report" && r.recent) body += r.recent.map(function(x){ return '<div class="sc-li"><span class="sc-v ' + (/맞/.test(x.v) ? "w" : /틀/.test(x.v) ? "l" : "") + '">' + e(x.v) + '</span>' + md(x.d) + ' ' + e(String(x.t || "").slice(0, 70)) + '</div>'; }).join("");
      if (r.k === "report" && r.cal && r.cal.n) body += '<div class="sc-cal"><b>🎯 확률 채점 ' + r.cal.n + '건 · 브라이어 ' + r.cal.brier + ' <span class="mut">(0 완벽 · 0.25 동전)</span> · ' + e(r.cal.tone || "") + '</b>' +
        (r.cal.cats || []).map(function(c){ return '<span class="' + (c.ok ? "ok" : "") + '">' + e(c.k) + ' ' + c.rate + '% <small>' + c.n + '건</small>' + (c.ok ? ' ✓' : '') + '</span>'; }).join("") +
        '<small>' + e(r.cal.gate || "") + ' · ✓ = 비중을 바꿔도 되는 분야</small></div>';
      if (r.k === "kick" && r.sig) body += '<div class="sc-sig">' + r.sig.map(function(x){ return '<div class="' + (x.shadow ? "sh" : x.trial ? "tr" : x.on ? "on" : "off") + '"><b>' + e(x.tag) + ' ' + e(SIGK[x.k] || x.name || x.k) + '</b>' +
        '<small>' + (x.shadow ? "👻 그림자 " : x.trial ? "🧪 시험 " : x.on ? "✓ 킥에 들어감 " : "⏳ 대기 ") + (x.n != null ? x.n + "건" : "") + (x.avg != null ? " · 평균 " + sg(x.avg, 1) : "") + (x.pf ? " · 손익비 " + x.pf : "") + '</small>' +
        (window.HON ? '<div class="sc-hon">' + (x.h_n ? HON.chip(x.h_avg, {n: x.h_n, pf: x.h_pf, basis: x.h_basis, oos: x.h_oos}) + HON.tags(x) : '') + (x.k === "whale" ? HON.whale(x) : '') + '</div>' : '') + '</div>'; }).join("") + '</div>' +
        (r.honest_ret != null && window.HON ? '<div class="sc-hon">⚡ 킥 포트 전체 ' + HON.chip(r.honest_ret, {d: 2, note: r.honest_note}) + '</div>' : '');
      if (r.k === "danta" && r.rows) body += '<table class="lrn"><tr><th></th><th>09시</th><th>10시</th><th>11~12시</th><th>13시~</th></tr>' + r.rows.map(function(x){
        return '<tr><td>' + e(x.k) + '<small>' + (x.n || 0) + '건 ' + sg(x.avg) + '</small></td>' + ["09시", "10시", "11~12시", "13시 이후"].map(function(s){ var c = (x.slots || {})[s] || {};
          return '<td><b class="st-' + e(c.st) + '">' + e({"강함": "⭐", "켬": "켬", "관찰": "👀", "닫힘": "닫힘"}[c.st] || "–") + '</b><small>' + (c.n ? c.n + "건 " + sg(c.avg, 1) : "") + '</small></td>'; }).join("") + '</tr>'; }).join("") + '</table>';
      if (r.k === "picks" && r.rows) body += r.rows.map(function(x){ return '<div class="sc-li">' + e(x.name) + ' · ' + e((x.picks || []).join("·")) + (x.edge != null ? ' <b class="' + cls(x.edge) + '">' + (x.edge >= 0 ? "앞섬 " : "뒤짐 ") + sg(x.edge, 1).replace("%", "p") + '</b>' : ' <span class="mut">채점 대기</span>') + '</div>'; }).join("");
      var GO = {report: "market", bets: "feed~fdbrain", kick: "port~pokick", picks: "port~poct", focus: "market~mkfo", port: "port~pocmp", whale: "port~pokick"}[r.k];
      h += '<section class="card sc-c"' + (GO ? ' data-goto="' + GO + '"' : '') + '>' + top.replace('</div></div>', '</div><span class="hm-go">보기 ›</span></div>') + body + '</section>';
    });
    b.innerHTML = h + '<div id="scrbt"></div>';
    J("rules_bt.json").then(function(T){ var x = document.getElementById("scrbt"); if (!x || !T || !T.rows) return;
      x.outerHTML = '<section class="card sc-bt" id="scrbt"><h3>🧪 포트 규칙 검증 <span class="mut">' + e(T.from.slice(0, 4)) + '~' + e(T.to.slice(0, 4)) + ' · 매주 일요일 다시</span></h3>' +
        '<table class="sc-bt-t"><tr><th></th><th>연 수익</th><th>최대 낙폭</th><th>샤프</th><th></th></tr>' + T.rows.map(function(r){
          return '<tr' + (/켬/.test(r.lab) ? ' class="kp"' : '') + '><td>' + e(r.lab) + '</td><td class="' + cls(r.cagr) + '">' + sg(r.cagr, 1) + '</td><td>' + r.mdd + '%</td><td>' + (r.sharpe != null ? r.sharpe : "–") + '</td><td>' + e(r.verdict || "") + '</td></tr>'; }).join("") + '</table>' +
        '<p class="note">「같은 비중」에 규칙 하나씩 붙여 본 결과예요. ✅ 나아진 것만 킥 포트에 켜요 — 지금은 ① 국면 현금만 켜져 있어요. ' + e(T.note || "") + '</p><p class="note" id="sctri"></p></section>';
      // 🧾 10/22 시도 장부 — 지금까지 시험한 조합 수 한 줄 (조합이 많을수록 1등은 운으로도 좋아 보임)
      J("trials.json").then(function(R){ var y = document.getElementById("sctri"); if (y && R && R.line) y.textContent = R.line; }).catch(function(){});
    }).catch(function(){});
  }

  /* ---------- ⑤ 접히는 카드 + 바로가기 칩 (💼 포트) ---------- */
  var FOLD = {};
  try { FOLD = JSON.parse(localStorage.getItem("fold") || "{}"); } catch(x) {}
  // 10/21 「결론 → 근거」: 포트 탭 묶음은 처음엔 모두 접힘(맨 위 「부터 성적」이 결론) — 한 번 펼치면 기억
  var FMAP = [[/시장 .*비교/, "pocmp", "🏁 비교", 0], [/목소리 경주/, "povoice", "🗣 목소리", 0], [/집중 포트/, "poconc", "🎯 집중", 0], [/섹터 의견/, "poviews", "🧭 섹터", 0], [/킥 칸 속/, "pokick", "⚡ 킥", 0], [/이렇게 담으면/, "pofollow", "📋 따라하기", 0], [/비중 바뀐 날/, "potl", "🔁 바뀐 날", 0],
              [/해외 동종주/, "popeers", "🌏 동종주", 0], [/벌고 잃었나/, "poct", "🧩 칸별", 0], [/날짜별/, "podt", "📅 날짜별", 0]];
  window.foldify = function(root){
    if (!root) return;
    var kids = [].slice.call(root.children), groups = [], g = null;
    kids.forEach(function(k){
      if (k.classList.contains("sec")){
        var t = k.textContent, m = FMAP.filter(function(x){ return x[0].test(t); })[0];
        g = m ? {sec: k, m: m, body: []} : null; if (g) groups.push(g); return;
      }
      if (g && !k.classList.contains("po-mode") && !k.classList.contains("po-hero") && k.id !== "podz") g.body.push(k); else g = null;
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
    "header .tab{flex-direction:column;gap:1px;padding:5px 0 4px;font-size:12.5px;border-radius:10px;letter-spacing:-.6px}",
    "header .tab .ic{font-size:16px}",
    "@media (max-width:350px){header .tab .ic{display:block;font-size:14px}header .tab{font-size:12.5px}}",
    "#uibtn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:3px 8px;font-size:14px;margin-left:8px;cursor:pointer}",
    "#uiset{position:fixed;z-index:60;top:calc(env(safe-area-inset-top) + 52px);right:12px;width:260px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:12px;box-shadow:0 18px 40px -12px rgba(0,0,0,.5)}",
    ".us-go{display:flex;flex-direction:column;gap:6px;margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.us-go button{text-align:left;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:9px 10px;font:inherit;font-size:14px;cursor:pointer}",
    "#uiset b{display:block;margin-bottom:8px}#uiset small{display:block;color:var(--sub);font-size:12.5px;margin-top:8px}",
    ".us-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}.us-r>span{font-size:13px;color:var(--sub)}",
    ".us-seg{display:flex;gap:4px}.us-seg button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:9px;padding:5px 8px;font:inherit;font-size:12.5px;cursor:pointer}.us-seg button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}",
    /* 홈 */
    ".hm-day{font-size:13px;color:var(--sub);margin:-4px 2px 10px;display:flex;align-items:center;flex-wrap:wrap;gap:5px}.hm-date{white-space:nowrap}.hm-day .hm-story{padding:3px 8px}.hm-day>*{flex-shrink:0}.hm-cs{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.4}",
    /* 10/14 A9-1 시간대 라벨 · A9-4 30초 스토리 버튼 */
    ".hm-ed{background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:12.5px;color:var(--text);cursor:pointer;white-space:nowrap}",
    ".hm-story{margin-left:auto;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer}",
    /* A9-2 줄 안 꺾임 · 선 끝 라벨 */
    ".hm-nw{white-space:nowrap}.lc-e{font-size:12.5px}",
    /* A9-3 킥 제목 · 잘 가는/안 가는 줄 */
    ".hm-kt.rest{color:var(--sub);font-weight:700}.hm-kt.buy{color:#4dd47a}.hm-kt.sell{color:#ff8a8a}.hm-cl{flex:none;align-self:center;font-size:12.5px;color:var(--sub);font-weight:700;margin-right:2px}",
    /* A9-5 🔮 예고 표 · 확률 막대 · 나 vs 앱 */
    ".hm-nx{display:flex;align-items:center;gap:7px;padding:5px 0;border-top:1px dashed var(--line)}.hm-nx:first-of-type{border-top:0}.hm-nxt{flex:1;min-width:0}",
    ".hm-pb{position:relative;flex:none;width:44px;height:16px;border-radius:5px;background:var(--panel);overflow:hidden;border:1px solid var(--line)}.hm-pb i{position:absolute;left:0;top:0;bottom:0;background:rgba(255,184,77,.55)}.hm-pb b{position:absolute;inset:0;font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;justify-content:center}",
    ".hm-vt{display:flex;flex:none;gap:3px}.hm-vt button{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:2px 6px;font-size:14px;line-height:1.2;cursor:pointer;opacity:.75}.hm-vt button.on{opacity:1;border-color:#ffb84d;background:rgba(255,184,77,.22)}",
    ".hm-me{font-size:12.5px;font-weight:700;color:var(--sub);background:var(--panel2);border-radius:6px;padding:0 5px;margin-left:4px;white-space:nowrap}.hm-me.ok{color:#4dd47a}.hm-me.no{color:#ff8a8a}",
    ".hm-vs{margin-top:8px;background:var(--panel2);border-radius:10px;padding:7px 10px;font-size:12.5px}.hm-vs>span{display:block;font-weight:800;margin-bottom:4px}.hm-vs>div{display:flex;align-items:center;gap:7px;margin:3px 0}.hm-vs small{width:18px;color:var(--sub);font-weight:700}.hm-vs i{flex:1;height:8px;border-radius:4px;background:var(--panel);overflow:hidden;display:block}.hm-vs i b{display:block;height:100%;background:#7c9cff;border-radius:4px}.hm-vs>div:first-of-type i b{background:#ffb84d}.hm-vs em{font-style:normal;font-weight:800;width:72px;text-align:right;white-space:nowrap}",
    ".hm-c{cursor:pointer;transition:transform .12s}.hm-c:active{transform:scale(.99)}",
    ".hm-cb{flex:1;min-width:0}.hm-cb>b{display:block;font-weight:700;font-size:13.5px}.hm-cb>b small{font-weight:600;color:var(--sub);font-size:12.5px}" +
    ".hm-ab{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;margin-top:3px}.hm-a,.hm-b{border-radius:8px;padding:2px 8px;font-size:12.5px;line-height:1.45}.hm-a{background:var(--panel2);color:var(--sub)}.hm-b{background:color-mix(in srgb,var(--acc,#7c9cff) 16%,var(--panel2));font-weight:700}" +
    ".hm-a .diff{text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--sub) 60%,transparent)}.hm-a .same,.hm-b .same{opacity:.55}.hm-b .diff{color:var(--text)}.hm-ab .sl{opacity:.4}.hm-to{color:var(--dim);font-weight:800}" +
    ".hm-tr{display:inline-flex;align-items:center;gap:3px;margin:3px 0 1px;cursor:pointer;vertical-align:middle}.hm-tr em,.hm-l10{font-style:normal}.hm-tr em{font-size:12.5px;color:var(--sub);margin-left:4px;font-weight:700}.hm-tr em.no{color:#ff8a8a}.hm-tr em.ok{color:#4dd47a}" +
    ".hm-tr i,.hm-l10 i{display:inline-block;width:8px;height:8px;border-radius:50%}.hm-tr i.o,.hm-l10 i.o{background:#4dd47a}.hm-tr i.x,.hm-l10 i.x{border:1.5px solid #ff8a8a;box-sizing:border-box}" +
    ".hm-l10{display:inline-flex;gap:2px;vertical-align:middle;margin-left:2px}.hm-trd[hidden]{display:none!important}.hm-trd{display:block;font-size:12.5px;color:var(--sub);margin:2px 0 3px}.hm-nxt .hm-tr{display:flex}" +
    ".hm-vc{margin-top:8px;background:var(--panel2);border-radius:10px;padding:7px 10px;font-size:12.5px}.hm-vc>small{display:block;color:var(--sub);margin-bottom:4px;line-height:1.4}.hm-vr{display:flex;align-items:center;gap:6px;margin:4px 0;white-space:nowrap}.hm-vr>span{width:84px;flex:none;font-weight:700}.hm-vr>em{flex:1;min-width:0;font-style:normal;font-weight:800;overflow:hidden;text-overflow:ellipsis}.hm-vr>em.up{color:var(--up)}.hm-vr>em.dn{color:var(--dn)}.hm-vr>em.mut{color:var(--dim);font-weight:500}.hm-vr>b{display:inline-flex;align-items:center;gap:2px;font-size:12.5px;color:var(--sub);font-weight:700}.hm-vr>b i{display:inline-block;width:8px;height:8px;border-radius:50%}.hm-vr>b i.o{background:#4dd47a}.hm-vr>b i.x{border:1.5px solid #ff8a8a;box-sizing:border-box}.hm-vr>b i.pc{width:auto;height:auto;border:0;border-radius:0;font-style:normal;color:var(--text);margin-left:2px}.hm-vr>b i.mut{width:auto;height:auto;border:0;border-radius:0;font-style:normal;color:var(--dim);font-weight:500}.hm-vn{font-size:12.5px;color:var(--dim);margin-top:4px;line-height:1.4}" +
    ".hm-chg{padding:12px 14px!important}.hm-cht{font-weight:800;font-size:14px;margin-bottom:6px}.hm-chi{display:flex;align-items:center;gap:8px;padding:8px 2px;border-top:1px solid var(--line);font-size:13.5px;cursor:pointer}.hm-chi:first-of-type{border-top:0}.hm-chi b{flex:1;font-weight:600}.hm-chi i{font-style:normal;color:var(--dim)}",
    ".hm-gr{display:flex;gap:9px;padding:7px 0;border-top:1px solid var(--line)}.hm-gr:first-of-type{border-top:0}.hm-gr>span{font-weight:900;font-size:16px;min-width:16px}.hm-gr.ok>span{color:#4dd47a}.hm-gr.no>span{color:#ff8a8a}.hm-gr.hold>span{color:var(--sub)}.hm-gr b{display:block;font-size:13.5px}.hm-gr small{display:block;font-size:12.5px;color:var(--sub);line-height:1.45}",
    ".hm-wn{margin-top:8px;background:var(--panel2);border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.5}.hm-wn small{display:block;color:var(--sub);font-weight:700;margin-bottom:2px}.hm-p{color:#ffb84d}",
    ".hm-sh{display:block;margin:10px 0 0 auto;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}",
    ".hm-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.hm-h>div{flex:1;min-width:0}.hm-h b{font-size:16px}.hm-h small{display:block;font-size:12.5px;color:var(--sub)}",
    ".hm-i{font-size:22px;width:36px;height:36px;border-radius:11px;background:var(--panel2);display:flex;align-items:center;justify-content:center;flex:none}",
    ".hm-go{font-size:12.5px;color:var(--sub);white-space:nowrap}",
    ".sc-hon:empty{display:none}.sc-hon{margin-top:3px;font-size:12.5px;color:var(--sub)}.hm-big .hon-chip{display:flex;width:max-content;margin:3px 0 0;font-size:12.5px;padding:1px 6px}.hm-big .hon-chip b{font-size:12.5px;letter-spacing:0}" +
    ".hm-big{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:2px 0 6px}.hm-big>div{background:var(--panel2);border-radius:12px;padding:7px 9px}.hm-big small{display:block;font-size:12.5px;color:var(--sub)}.hm-big b{font-size:20px;letter-spacing:-.5px}",
    ".hm-l{font-size:13.5px;line-height:1.5;color:var(--text)}.hm-l small{color:var(--sub)}.hm-l a{color:var(--acc);cursor:pointer}",
    ".hm-sp{margin:4px -4px 0}.hm-sp .lg{font-size:12.5px}",
    ".hm-alert{margin-top:8px;background:rgba(255,184,77,.12);border:1px solid rgba(255,184,77,.4);border-radius:12px;padding:8px 10px;font-size:13px}.hm-alert small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}",
    ".hm-cn{display:flex;justify-content:space-between;align-items:center;gap:8px;border-radius:10px;padding:7px 10px;margin-bottom:8px;font-size:13px;cursor:pointer}.hm-cn.g{background:rgba(77,212,122,.12)}.hm-cn.r{background:rgba(255,107,107,.12)}.hm-cn small{color:var(--sub)}" +
    ".hm-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.hm-chip{font-size:12.5px;background:var(--panel2);border-radius:999px;padding:3px 9px}.hm-chip.g{background:rgba(77,212,122,.14);color:#4dd47a}.hm-chip.b{background:rgba(57,135,229,.16);color:#7cb0ff}",
    ".hm-ev{font-size:14px;padding:5px 0;border-bottom:1px dashed var(--line)}.hm-ev small{color:var(--sub)}",
    ".hm-f{padding:6px 0;border-bottom:1px dashed var(--line)}.hm-f:last-child{border-bottom:0}.hm-f small{color:var(--sub);font-size:12.5px}",
    /* 누르는 곳 */
    ".hm-chip[data-op],.hm-chip[data-goto],[data-op],a[data-goto]{cursor:pointer}.hm-l a,.hm-ev b[data-op]{color:var(--acc);text-decoration:none}",
    ".sc-cal{margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--panel2);font-size:12.5px;display:flex;flex-wrap:wrap;gap:5px}.sc-cal>b{width:100%;font-size:12.5px}.sc-cal span{border:1px solid var(--line);border-radius:999px;padding:2px 8px}.sc-cal span.ok{border-color:#4dd47a;color:#4dd47a}.sc-cal>small{width:100%;color:var(--sub);font-size:12.5px}",
    ".sc-bt-t{width:100%;border-collapse:collapse;font-size:12.5px}.sc-bt-t td,.sc-bt-t th{padding:6px 4px;border-bottom:1px solid var(--line);text-align:right}.sc-bt-t td:first-child,.sc-bt-t th:first-child{text-align:left}.sc-bt-t tr.kp td{font-weight:800}",
    ".hm-chip[data-op]:active,.hm-chip[data-goto]:active,.sc-c:active{opacity:.7}.sc-c{cursor:pointer}",
    /* 성적표 */
    ".pf-l{margin-top:8px}.pf-r{display:grid;grid-template-columns:minmax(0,1.25fr) 1fr auto;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--line)}.pf-r:first-child{border-top:0}.pf-n{font-size:13.5px;font-weight:700;line-height:1.35;min-width:0}.pf-n small{display:block;font-size:11.5px;font-weight:500;color:var(--sub)}" +
    ".pf-t{position:relative;height:14px;background:var(--panel2);border-radius:7px;overflow:hidden}.pf-z{position:absolute;left:50%;top:-2px;bottom:-2px;width:2px;margin-left:-1px;background:var(--sub);opacity:.6}.pf-b{position:absolute;top:2px;bottom:2px;border-radius:5px}.pf-b.g{background:#2f9e44}.pf-b.r{background:#d6453d}" +
    ".pf-v{font-size:14px;font-weight:800;min-width:42px;text-align:right}.pf-v.g{color:#2f9e44}.pf-v.r{color:#d6453d}",
    ".sc-gb{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sc-gb>div{background:var(--panel2);border-radius:12px;padding:9px}.sc-gb b{display:block;font-size:13px;margin-bottom:4px}.sc-gb span{display:block;font-size:12.5px;line-height:1.5}",
    ".sc-h{display:flex;align-items:center;gap:10px}.sc-h>div:nth-child(2){flex:1;min-width:0}.sc-h b{font-size:15px}.sc-h small{display:block;font-size:12.5px;color:var(--sub)}",
    ".sc-rate{font-size:22px;font-weight:900;text-align:right;line-height:1.05}.sc-rate small{display:block;font-size:12.5px;color:var(--sub);font-weight:600}",
    ".sc-bar{display:flex;height:16px;border-radius:8px;overflow:hidden;margin:9px 0 4px;font-size:12.5px;font-weight:800}.sc-bar .w{background:#3fae6a;color:#fff;padding-left:6px}.sc-bar .l{background:#d0574f;color:#fff;text-align:right;padding-right:6px}",
    ".sc-li{font-size:12.5px;padding:5px 0;border-top:1px dashed var(--line)}.sc-v{font-size:12.5px;font-weight:800;border-radius:5px;padding:0 5px;margin-right:5px;background:var(--panel2)}.sc-v.w{background:rgba(77,212,122,.18);color:#4dd47a}.sc-v.l{background:rgba(230,103,103,.18);color:#ff8a8a}",
    ".sc-sig{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}.sc-sig>div{border-radius:10px;padding:7px 9px;background:var(--panel2)}.sc-sig b{display:block;font-size:13px}.sc-sig small{font-size:12.5px;color:var(--sub)}",
    ".sc-sig .on{background:rgba(77,212,122,.12)}.sc-sig .tr{background:rgba(255,184,77,.12)}.sc-sig .sh{background:rgba(124,156,255,.1)}",
    ".sc-few{font-size:12.5px;color:var(--sub);margin-top:6px}",
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
    ":root[data-ui=light]{--bg:#f4f6fa;--panel:#ffffff;--panel2:#eef1f6;--line:#dde2ea;--text:#141a26;--sub:#5a6476;--dim:#636d7b;--acc:#3d63dd;--up:#d64545;--down:#2f6fd0}",
    ":root[data-ui=light] header{background:rgba(244,246,250,.9)}",
    ":root[data-ui=light] header .tab{background:#fff;border-color:#dde2ea;color:#5a6476}",
    ":root[data-ui=light] header .tab.on{color:#fff}",
    ":root[data-ui=light] .chip{background:rgba(20,26,38,.06)}",
    ":root[data-ui=light] .card,:root[data-ui=light] .hero{box-shadow:0 1px 2px rgba(20,26,38,.05)}",
    ":root[data-ui=light] .po-hero{background:linear-gradient(160deg,rgba(233,196,106,.22),#fff 60%)}",
    ":root[data-ui=light] .po-hero.kick{background:linear-gradient(160deg,rgba(255,107,107,.18),#fff 60%)}",
    ":root[data-ui=light] .vtip{background:#141a26;color:#fff}",
    ":root[data-ui=light] .lc-g{stroke:#e3e7ee}:root[data-ui=light] .lc-a{fill:#6b7486}",
    ":root[data-ui=light] svg circle[stroke='#121826']{stroke:#fff}",
    ":root[data-ui=light] .up{color:#d64545}:root[data-ui=light] .dn{color:#2f6fd0}",
    ":root[data-ui=light] #backbtn{background:#fff;color:#141a26;border-color:#dde2ea}",
    ":root[data-ui=light] .hm-chip.g,:root[data-ui=light] .po-sg.g{color:#1f8b4c}:root[data-ui=light] .hm-chip.b{color:#2f6fd0}",
    ":root[data-ui=light] .sc-v.w{color:#1f8b4c}:root[data-ui=light] .sc-v.l{color:#c23b3b}",
    ":root[data-ui=light] em.w,:root[data-ui=light] .po-rr .d.w,:root[data-ui=light] .mk-t td small.up{color:#1f8b4c}",
    ":root[data-ui=light] .po-pf3 .on{color:#1f8b4c}:root[data-ui=light] .po-pf3 .trial{color:#b26b00}",
    ":root[data-ui=light] .hero{background:radial-gradient(120% 140% at 100% 0%,color-mix(in srgb,var(--c) 28%,transparent),transparent 60%),#fff}",
    ":root[data-ui=light] iframe.rep{background:#fff}"
  ].join("\n");
  document.head.appendChild(css);
  // 접기 칩이 헤더 바로 아래 붙도록 헤더 높이 기억
  function hh(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }
  window.addEventListener("resize", hh); setTimeout(hh, 300); setTimeout(hh, 1500);
})();
