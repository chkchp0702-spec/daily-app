/* CH Investing — 🏠 다시 오게 하는 홈 (10/31 사용자: 「A·B 다 진행 · C는 3·4 빼고 다」)
   B8 홈을 화면 1.5장쯤으로 — 긴 카드는 핵심 한 줄만, 나머지는 「펼치기」
   C1 🎯 아침 1탭 예측 — 「코스피 오를까?」 한 번 누르고, 3시 반에 결과 · 주간 순위 · 조이 vs 사람 (vote.py 가 모아 채점)
   C2 📛 앱 아이콘 숫자 — 홈을 보면 0으로 (숫자는 알림이 올 때 sw.js 가 올림)
   C5 🔮 운세 → 시장 다리 — 생일이 저장된 사람은 홈에 「오늘 투자운 N점」 칩 · 운세 화면엔 진짜 시장 날씨(mktWeather)
   C6 ⚡ 장중 「지금 바뀐 것」 — 한국 장중에만 3줄(30분 전과 비교 · 강한 업종 · 돈이 몰린 종목 · 환율), 5분마다 갈아끼움
   C7 📨 이번 주 한 장 — 금요일 장 끝~일요일 홈 카드 · 누르면 고객에게 보낼 주간 요약 그림 (금 16시 알림: plus.py week1)
   C8 👀 다시 오면 「마지막으로 본 뒤 바뀐 것」만 먼저 — 날씨판 바로 아래 */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var VOTE_TOPIC = "chkchp-ch-vote";
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function hm(){ return kst().toISOString().slice(11, 16); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 300000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function q5(){ return "?" + Math.floor(Date.now() / 300000); }
  var WDK = ["일", "월", "화", "수", "목", "금", "토"];
  function wd(d){ return WDK[new Date(d + "T00:00:00Z").getUTCDay()]; }
  function onHome(){ return (typeof cur !== "undefined" && cur === "home") && document.getElementById("hmbody"); }
  function toast(m){ if (window.P && P.toast) return P.toast(m); var d = document.createElement("div"); d.className = "ch-toast"; d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function dev(){ var d = null; try { d = localStorage.getItem("us_dev"); } catch(x) {} if (!d){ d = Math.random().toString(36).slice(2, 10); try { localStorage.setItem("us_dev", d); } catch(x) {} } return d; }

  /* ───────── 🌤 시장 날씨 (운세 화면 · 다른 곳에서 같이 씀) ───────── */
  function wxOf(r){ return r == null ? ["☁️", "흐림"] : r >= 1.5 ? ["☀️", "맑음"] : r >= 0.3 ? ["🌤", "구름 조금"] : r > -0.3 ? ["☁️", "흐림"] : r > -1.5 ? ["🌧", "비"] : ["⛈", "폭풍"]; }
  window.mktWeather = function(){
    return Promise.all([gj("archive/x/live_kr.json" + q5()), gj(RAWM + "home.json" + q5())]).then(function(r){
      var L = r[0] || {}, H = r[1] || {}, P = H.port || {};
      var k = (L.index || []).filter(function(x){ return x.name === "코스피"; })[0];
      var liveToday = L.date === today() && k;
      var big = liveToday ? k.chg : P.d1_spy != null ? P.d1_spy : k ? k.chg : null, w = wxOf(big);
      var parts = [];
      if (k) parts.push("코스피 " + sg(k.chg) + (liveToday ? (L.t && L.t < "15:30" ? " (" + L.t + ")" : " 마감") : " (" + wd(L.date) + ")"));
      if (P.d1_spy != null) parts.push("S&P " + sg(P.d1_spy) + " (" + wd(P.d1_date) + ")");
      return {ic: w[0], w: w[1], line: parts.join(" · ") + " — 눌러서 홈으로"};
    });
  };

  /* ───────── B8 홈 접기 ───────── */
  var OPEN = {};   // 이번에 펼친 카드 (매시간 다시 그려져도 펼친 채로)
  function foldBtn(key, lab){ return '<button type="button" class="hf-b" data-hf="' + key + '" data-lab="' + lab + '">' + (OPEN[key] ? "접기 ▴" : lab + " ▾") + '</button>'; }
  function foldOne(card, key, parts, lab, where){
    if (!card) return;
    // 다른 화면 js 가 카드 안에 늦게 붙이는 칸(경주 그림 등)도 잡도록 매번 다시 표시
    parts.forEach(function(sel){ [].forEach.call(card.querySelectorAll(sel + ":not(.hf-x)"), function(x){ x.classList.add("hf-x"); }); });
    if (card.getAttribute("data-hfk")) return;
    if (!card.querySelector(".hf-x")) return;
    card.setAttribute("data-hfk", key); card.classList.add("hf-c"); if (OPEN[key]) card.classList.add("hf-open");
    var at = where ? card.querySelector(where) : null;
    var w = document.createElement("div"); w.className = "hf-row"; w.innerHTML = foldBtn(key, lab);
    if (at && at.parentNode === card) at.insertAdjacentElement("afterend", w); else card.appendChild(w);
  }
  function fold(){
    var b = document.getElementById("hmbody"); if (!b) return;
    // ☀️ 오늘 한 장 — 나라별 한 줄만 · 할 말·일정·보내기는 펼치면 (보내기는 왼쪽 아래 📨 단추에도 있음)
    foldOne(document.getElementById("pbcard"), "pb", [".pb-talk", ".pb-ev", ".pb-ft"], "3줄 요약·일정 보기", ".pb-reg");
    // 💼 내 포트 — 숫자 세 개 + 할 일만 · 경주 그림은 펼치면
    [].forEach.call(b.querySelectorAll("section.card"), function(c){
      var t = (c.querySelector(".hm-h b") || {}).textContent || "";
      if (/내 포트/.test(t)) foldOne(c, "port", [".tz-race", ".hm-sp"], "10/2부터 경주 보기", ".hm-l");
      else if (/이번 주 복기/.test(t)){ if (document.getElementById("wk1")) c.classList.add("hf-gone"); else foldOne(c, "week", [".hm-wn", ".hm-l"], "자세히", ".hm-big"); }   // 주말엔 📨 이번 주 한 장 카드에 합침
      else if (c.classList.contains("hm-chg")) foldOne(c, "chg", [".hm-chi:nth-of-type(n+4)"], "더 보기", null);
    });
    var hint = b.querySelector(".tz-hint"); if (hint) hint.classList.add("hf-gone");
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-hf]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var c = t.closest(".hf-c"), k = t.dataset.hf; if (!c) return;
    OPEN[k] = !OPEN[k]; c.classList.toggle("hf-open", OPEN[k]); t.textContent = OPEN[k] ? "접기 ▴" : (t.getAttribute("data-lab") || "펼치기") + " ▾";
  }, true);

  /* ───────── C8 👀 마지막으로 본 뒤 바뀐 것 ───────── */
  var SEEN_K = "hb_seen", SINCE = null;   // SINCE = 이번 방문에 보여 줄 「바뀐 것」(30분 유지)
  function snapOf(H){
    var P = (H && H.port) || {}, mk = window.M && M.cats && M.cats.market && M.cats.market[0];
    return {at: Date.now(), base: P.base, kick: P.kick, conc: P.conc, asof: P.asof, mkt: mk ? mk.id : "",
      focus: ((H && H.focus) || []).map(function(f){ return f.name; }), ev: ((H && H.kick && H.kick.events) || []).map(function(x){ return x.k + ":" + x.name; }),
      chg: ((H && H.chg && H.chg.items) || []).map(function(x){ return x.t; })};
  }
  function ago(t){ var m = Math.round((Date.now() - t) / 60000); if (m < 60) return m + "분 전"; var h = Math.round(m / 60); if (h < 24) return h + "시간 전"; return Math.round(h / 24) + "일 전"; }
  function diffs(H, old){
    var now = snapOf(H), out = [];
    if (!old) return out;
    var mk = window.M && M.cats && M.cats.market && M.cats.market[0];
    if (now.mkt && old.mkt && now.mkt !== old.mkt) out.push({ic: "🌐", t: "새 시황 나옴", s: dateLab(now.mkt), go: "market"});
    if (now.asof && old.asof && now.asof !== old.asof && now.base != null && old.base != null)
      out.push({ic: "💼", t: "내 포트(기본) " + sg(old.base) + " → " + sg(now.base), s: md(now.asof) + " 미국 종가 반영", go: "port~pohero"});
    var nf = now.focus.filter(function(f){ return old.focus.indexOf(f) < 0; });
    if (nf.length) out.push({ic: "🎯", t: "새 집중 테마: " + nf.join(" · "), go: "market~mkfo"});
    var ne = now.ev.filter(function(f){ return old.ev.indexOf(f) < 0; });
    if (ne.length) out.push({ic: "⚡", t: "공격 할 일: " + ne.map(function(x){ return x.replace(":", " "); }).join(" · "), go: "port~pokick"});
    ((H && H.chg && H.chg.items) || []).forEach(function(x){
      if (old.chg.indexOf(x.t) >= 0 || /시황 나옴/.test(x.t) && out.some(function(o){ return o.ic === "🌐"; })) return;
      out.push({ic: x.ic, t: x.lab ? x.lab + (x.a ? " " + x.a + " → " + x.b : "") + (x.note ? " (" + x.note + ")" : "") : x.t, s: x.sub || "", go: x.go || "home"}); });
    return out.slice(0, 4);
    function dateLab(id){ var d = id.slice(0, 10); return md(d) + "(" + wd(d) + ") " + ({AM: "오전", PM: "오후", HOL: "휴장"}[id.slice(11)] || ""); }
  }
  function sinceCard(H){
    var b = document.getElementById("hmbody"); if (!b || !H) return;
    var old = ls(SEEN_K);
    if (!SINCE || Date.now() - SINCE.made > 30 * 60e3){
      // 3시간 넘게 지나 다시 온 사람에게만 — 방금 본 사람에겐 같은 걸 또 보여 주지 않음
      SINCE = {made: Date.now(), from: old && old.at, items: old && Date.now() - old.at > 3 * 3600e3 ? diffs(H, old) : []};
      ls(SEEN_K, snapOf(H));
    }
    var ex = document.getElementById("hbsince");
    if (!SINCE.items.length){ if (ex) ex.remove(); return; }
    var h = '<div class="hm-h"><span class="hm-i">👀</span><div><b>마지막으로 본 뒤 바뀐 것</b><small>' + ago(SINCE.from) + '에 봄 · ' + SINCE.items.length + '가지</small></div></div>' +
      SINCE.items.map(function(x){ return '<div class="hb-si" data-goto="' + e(x.go) + '"><span>' + e(x.ic) + '</span><div><b>' + e(x.t) + '</b>' + (x.s ? '<small>' + e(x.s) + '</small>' : '') + '</div><i>›</i></div>'; }).join("");
    if (!ex){ ex = document.createElement("section"); ex.id = "hbsince"; ex.className = "card hb-since"; }
    if (ex.getAttribute("data-sig") !== String(SINCE.made)){ ex.innerHTML = h; ex.setAttribute("data-sig", String(SINCE.made)); }
    var hero = document.getElementById("tdhero");
    if (hero && ex.previousElementSibling !== hero) hero.insertAdjacentElement("afterend", ex);
    else if (!hero && ex.parentNode !== b) b.insertBefore(ex, b.firstChild);
    // 같은 내용인 서버 「바뀐 것」 카드는 숨김 (겹치지 않게)
    var dup = b.querySelector(".hm-chg"); if (dup) dup.classList.add("hf-gone");
  }

  /* ───────── C2 📛 아이콘 숫자 지우기 ───────── */
  function clearBadge(){
    try { if (navigator.clearAppBadge) navigator.clearAppBadge().catch(function(){}); } catch(x) {}
    try { if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({t: "badge", n: 0}); } catch(x) {}
  }

  /* ───────── C5 🔮 오늘 투자운 칩 ───────── */
  function luckChip(){
    var hero = document.getElementById("tdhero"); if (!hero || hero.querySelector(".hb-luck")) return;
    var ppl = ls("sj_people"); if (!ppl || !ppl.length) return;
    (window.needMod ? needMod("luck") : Promise.resolve()).then(function(){
      var L = window.luckToday && luckToday(); if (!L || L.inv == null || !document.getElementById("tdhero") || hero.querySelector(".hb-luck")) return;
      var a = document.createElement("button"); a.type = "button"; a.className = "hb-luck";
      a.innerHTML = '🔮 ' + e(L.name) + ' 님 오늘 투자운 <b>' + L.inv + '점</b> ›';
      a.onclick = function(ev){ ev.stopPropagation(); go("luck"); };
      var say = hero.querySelector(".tz-say"); if (say) say.insertAdjacentElement("afterend", a); else hero.appendChild(a);
    });
  }

  /* ───────── C6 ⚡ 장중 지금 바뀐 것 ───────── */
  var LIVE_T = 0;
  function liveStrip(){
    var b = document.getElementById("hmbody"); if (!b) return;
    var d = kst(), m = d.getUTCHours() * 60 + d.getUTCMinutes(), wk = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    var ex = document.getElementById("hblive");
    if (wk || m < 9 * 60 || m > 15 * 60 + 40){ if (ex) ex.remove(); return; }
    Promise.all([gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/wl_live.json" + q5(), 120000)]).then(function(r){
      var L = r[0], W = r[1]; if (!L || L.date !== today() || !onHome()) return;
      var ix = {}; (L.index || []).forEach(function(x){ ix[x.name] = x; });
      var ks = ix["코스피"], sn = L.snaps || [], rows = [];
      if (ks && sn.length >= 4){   // 30분 전(스냅 3칸 전)과 비교
        var p = sn[Math.max(0, sn.length - 4)], dlt = ks.chg - (+p[3]);
        rows.push('<b>📈 코스피 ' + sg(ks.chg) + '</b> <span class="mut">30분 전 ' + sg(+p[3]) + ' → ' + (Math.abs(dlt) < 0.15 ? "제자리" : dlt > 0 ? '<span class="up">올라오는 중</span>' : '<span class="dn">밀리는 중</span>') + '</span>');
      }
      var st = (L.strong || []).filter(function(s){ return s.n >= 5; }).slice(0, 2);
      if (st.length) rows.push('<b>🔥 강한 업종</b> ' + st.map(function(s){ return e(s.name.replace(/\(.*?\)/g, "")) + ' <span class="' + cls(s.r) + '">' + sg(s.r) + '</span>'; }).join(" · "));
      var v = (L.value || []).slice(0, 3);
      if (v.length) rows.push('<b>💰 돈이 몰린 종목</b> ' + v.map(function(s){ return '<a data-op="' + e(s.s) + '">' + e(s.n) + '</a> <span class="' + cls(s.r) + '">' + sg(s.r) + '</span>'; }).join(" · "));
      var fx = W && W.fx; if (fx && fx.p && String(fx.t || "").slice(0, 10) === today()){ var dw = fx.prev ? fx.p - fx.prev : null; rows.push('<b>💱 원/달러</b> ' + (Math.round(fx.p * 10) / 10).toLocaleString() + '원' + (dw != null ? ' <span class="' + cls(dw) + '">' + (dw > 0 ? "▲" : dw < 0 ? "▼" : "") + Math.abs(dw).toFixed(1) + '원</span>' : '')); }
      if (!rows.length) return;
      if (!ex){ ex = document.createElement("section"); ex.id = "hblive"; ex.className = "card hb-live"; }
      ex.innerHTML = '<div class="hb-lh"><b>⚡ 지금 바뀐 것</b><span class="mut">' + e(L.t || "") + ' 기준 · 10분마다</span></div>' + rows.map(function(x){ return '<div class="hb-lr">' + x + '</div>'; }).join("");
      var after = document.getElementById("hbsince") || document.getElementById("tdhero");
      if (after){ if (ex.previousElementSibling !== after) after.insertAdjacentElement("afterend", ex); }
      else if (ex.parentNode !== b) b.insertBefore(ex, b.firstChild);
    });
  }

  /* ───────── C1 🎯 아침 1탭 예측 ───────── */
  var VK = "hb_vote";   // {day: p}
  function myVotes(){ return ls(VK) || {}; }
  function nick(){ var n = ls("hb_nick"); return n || "PB-" + dev().slice(0, 4); }
  function target(PB, L){
    var kr = PB && PB.markets && PB.markets.KR, nd = kr && kr.next_day, td = today(), m = hm(), wk = [0, 6].indexOf(kst().getUTCDay()) >= 0;
    var session = !wk && m >= "09:00" && m < "15:30" && L && L.date === td;
    if (session) return {day: td, open: false, session: true};
    if (nd && (nd > td || (nd === td && m < "09:00"))) return {day: nd, open: true};
    if (!wk && m < "09:00") return {day: td, open: true};
    return {day: nd || td, open: false};
  }
  function dayLab(d){ var td = today(); if (d === td) return "오늘"; var dd = Math.round((Date.parse(d) - Date.parse(td)) / 864e5); return dd === 1 ? "내일" : wd(d) + "요일(" + md(d) + ")"; }
  function sendVote(day, p){
    var V = myVotes(); V[day] = p; var keep = {}; Object.keys(V).sort().slice(-60).forEach(function(k){ keep[k] = V[k]; }); ls(VK, keep);
    try { fetch("https://ntfy.sh/" + VOTE_TOPIC, {method: "POST", body: JSON.stringify({d: dev(), day: day, p: p, nm: nick()}), headers: {"Title": "vote"}, keepalive: true}).catch(function(){}); } catch(x) {}
  }
  function myRecord(VJ, L){
    var V = myVotes(), w = 0, n = 0, run = 0, last = null;
    Object.keys(V).sort().forEach(function(d){
      var r = resOf(d, VJ, L); if (r == null || r === 0) return;
      n++; var ok = V[d] === r; if (ok) w++; run = ok ? (run > 0 ? run + 1 : 1) : 0; last = {d: d, ok: ok};
    });
    return {w: w, n: n, run: run, last: last};
  }
  function resOf(d, VJ, L){
    var x = VJ && VJ.days && VJ.days[d]; if (x && x.res != null) return x.res;
    if (L && L.date === d && String(L.t || "") >= "15:30"){ var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0]; if (k) return k.chg > 0 ? 1 : k.chg < 0 ? -1 : 0; }
    return null;
  }
  function chgOf(d, VJ, L){ var x = VJ && VJ.days && VJ.days[d]; if (x && x.chg != null) return x.chg; if (L && L.date === d){ var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0]; if (k) return k.chg; } return null; }
  function voteCard(){
    var b = document.getElementById("hmbody"); if (!b) return;
    Promise.all([gj("archive/x/prob.json" + q5()), gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/vote.json" + q5())]).then(function(r){
      var PB = r[0], L = r[1], VJ = r[2] || {}; if (!onHome()) return;
      var T = target(PB, L), V = myVotes(), mine = V[T.day], dx = (VJ.days || {})[T.day] || {}, kr = PB && PB.markets && PB.markets.KR;
      var joeyP = dx.joey_p != null ? dx.joey_p : kr && kr.next_day === T.day && kr.p1 != null ? Math.round(kr.p1 * 100) : null;
      var joey = joeyP == null ? "" : joeyP >= 50 ? "📈 오른다" : "📉 내린다";
      var rec = myRecord(VJ, L), h = '';
      // 어제(가장 최근) 결과 먼저
      var prev = Object.keys(V).filter(function(d){ return d < T.day || (d === T.day && !T.open && !T.session); }).sort().pop();
      if (prev){ var pr = resOf(prev, VJ, L), pc = chgOf(prev, VJ, L);
        if (pr != null && pr !== 0) h += '<div class="hv-res ' + (V[prev] === pr ? "ok" : "no") + '">' + (V[prev] === pr ? "✅ 맞혔어요!" : "❌ 아쉬워요") + ' <span>' + md(prev) + ' 코스피 ' + sg(pc) + ' · 내 답 ' + (V[prev] > 0 ? "📈" : "📉") + '</span></div>'; }
      if (T.session){
        var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0], my = V[T.day];
        h += '<div class="hv-q">오늘 코스피, 3시 반에 결과</div>' + (my && k ? '<div class="hv-now">내 답 ' + (my > 0 ? "📈 오른다" : "📉 내린다") + ' · 지금 코스피 <b class="' + cls(k.chg) + '">' + sg(k.chg) + '</b> → ' + ((my > 0) === (k.chg > 0) ? '<b class="ok">맞는 중</b>' : '<b class="no">틀리는 중</b>') + '</div>' : '<div class="hv-now mut">오늘은 투표가 끝났어요 (9시 전까지) · 내일 아침에 참여해 보세요</div>');
      } else if (T.open){
        h += '<div class="hv-q">' + dayLab(T.day) + ' 코스피, 오를까요? <small>' + (T.day === today() ? "9시 전까지" : dayLab(T.day) + " 9시 전까지") + ' · 바꿀 수 있어요</small></div>' +
          '<div class="hv-bt"><button type="button" data-hv="1" class="' + (mine === 1 ? "on" : "") + '">📈 오른다</button><button type="button" data-hv="-1" class="' + (mine === -1 ? "on" : "") + '">📉 내린다</button></div>';
        var tot = (dx.up || 0) + (dx.dn || 0);
        h += '<div class="hv-sub">' + (joey ? '🧒 조이는 <b>' + joey + '</b>' + (joeyP != null ? ' (오를 확률 ' + joeyP + '%)' : '') : '') + (tot ? ' · 동료 ' + tot + '명 중 📈 ' + Math.round((dx.up || 0) / tot * 100) + '%' : '') + '</div>';
      } else {
        h += '<div class="hv-q">다음 투표는 ' + dayLab(T.day) + ' 아침에 열려요</div>';
      }
      // 기록 · 조이 vs 사람 · 주간 순위
      var Wk = VJ.week || {}, rows = Wk.rows || [], me = dev().slice(0, 4), jw = Wk.joey || {}, pw = Wk.people || {};
      var foot = [];
      if (rec.n) foot.push('내 기록 <b>' + rec.w + '/' + rec.n + '</b>' + (rec.run >= 2 ? ' · 🔥 ' + rec.run + '연속' : ''));
      if (jw.n) foot.push('이번 주 🧒 조이 ' + jw.w + '/' + jw.n + ' vs 👥 사람 ' + (pw.n ? Math.round(pw.w / pw.n * 100) + '%' : '–'));
      var rank = rows.length ? '<div class="hv-rk"><small>🏆 이번 주 순위 (' + md(Wk.from) + '~)</small>' + rows.slice(0, 3).map(function(x, i){ return '<div class="' + (x.id === me ? "me" : "") + '"><span>' + ["🥇", "🥈", "🥉"][i] + '</span><b>' + e(x.nm) + '</b><span>' + x.w + '/' + x.n + '</span></div>'; }).join("") +
        (rows.slice(3).some(function(x){ return x.id === me; }) ? '<div class="me"><span>' + (rows.map(function(x){ return x.id; }).indexOf(me) + 1) + '위</span><b>나</b><span></span></div>' : '') + '</div>' : '';
      var html = '<div class="hm-h"><span class="hm-i">🎯</span><div><b>1탭 예측</b><small>동료 PB와 맞히기 · 재미로</small></div><button type="button" class="hv-nk" data-hvnk="1">별명 ' + e(nick()) + ' ✏️</button></div>' + h +
        (foot.length ? '<div class="hv-ft">' + foot.join(" · ") + '</div>' : '') + rank;
      var ex = document.getElementById("hbvote");
      if (!ex){ ex = document.createElement("section"); ex.id = "hbvote"; ex.className = "card hb-vote"; }
      if (ex.getAttribute("data-h") !== html){ ex.innerHTML = html; ex.setAttribute("data-h", html); }
      var pl = b.querySelector("section.card.pl");   // 오늘 한 줄 다음
      if (pl){ if (ex.previousElementSibling !== pl) pl.insertAdjacentElement("afterend", ex); }
      else if (ex.parentNode !== b) b.appendChild(ex);
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-hv],[data-hvnk]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    if (t.dataset.hvnk){
      var n = prompt("순위에 보일 별명 (실명 말고 별명 · 10자 이내)", ls("hb_nick") || "");
      if (n != null){ n = n.trim().slice(0, 10); ls("hb_nick", n || null); var ex0 = document.getElementById("hbvote"); if (ex0) ex0.removeAttribute("data-h"); voteCard(); }
      return;
    }
    Promise.all([gj("archive/x/prob.json" + q5()), gj("archive/x/live_kr.json" + q5(), 120000)]).then(function(r){
      var T = target(r[0], r[1]); if (!T.open){ toast("지금은 투표 시간이 아니에요"); return; }
      sendVote(T.day, +t.dataset.hv); toast((+t.dataset.hv > 0 ? "📈 오른다" : "📉 내린다") + " — " + dayLab(T.day) + " 3시 반에 채점해요");
      try { if (navigator.vibrate) navigator.vibrate(12); } catch(x) {}
      var ex = document.getElementById("hbvote"); if (ex) ex.removeAttribute("data-h"); voteCard();
    });
  }, true);

  /* ───────── C7 📨 이번 주 한 장 ───────── */
  function weekWin(){ var d = kst(), w = d.getUTCDay(), m = d.getUTCHours() * 60 + d.getUTCMinutes(); return (w === 5 && m >= 15 * 60 + 30) || w === 6 || w === 0; }
  function weekCard(){
    var b = document.getElementById("hmbody"); if (!b) return;
    var ex = document.getElementById("wk1");
    if (!weekWin()){ if (ex) ex.remove(); return; }
    if (!ex){
      ex = document.createElement("section"); ex.id = "wk1"; ex.className = "card hb-wk";
      ex.innerHTML = '<div class="hb-wkb"><span>📨</span><div><b>이번 주 한 장</b><small>5개 시장 한 주 · 강했던·약했던 업종 · 다음 주 일정 — 고객에게 바로 보내기</small></div><i>›</i></div><div class="hb-wkp" id="wk1p"></div>';
      ex.onclick = function(ev){ if (ev.target.closest("[data-goto]")) return; weekSend(); };
    }
    // 이번 주 내 포트 한 줄 (홈 「이번 주 복기」 카드를 여기로 합침)
    var Wk = H0 && H0.week, pp = document.getElementById("wk1p");
    if (pp && Wk && Wk.days && !pp.innerHTML){
      var it = [["기본", Wk.base], ["공격", Wk.kick], ["집중", Wk.conc]].filter(function(x){ return x[1] != null; });
      pp.innerHTML = '<span data-goto="port">💼 이번 주 내 포트 ' + it.map(function(x){ return x[0] + ' <b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b>'; }).join(" · ") + ' <span class="mut">vs S&amp;P ' + sg(Wk.spy) + '</span> ›</span>';
    }
    var v = document.getElementById("hbvote") || b.querySelector("section.card.pl");
    if (v){ if (ex.previousElementSibling !== v) v.insertAdjacentElement("afterend", ex); } else if (ex.parentNode !== b) b.appendChild(ex);
  }
  function weekSpec(){
    var it = window.M && M.cats && M.cats.sector && M.cats.sector[0];
    return Promise.all([it ? gj("archive/sector/" + it.id + "/compass.json") : null, window.__pbbrief ? __pbbrief() : gj("archive/x/pbbrief.json" + q5())]).then(function(r){
      var C = r[0], PB = r[1] || {}; if (!C || !C.markets) return null;
      var MK = [["KR", "🇰🇷", "코스피"], ["US", "🇺🇸", "S&P500"], ["JP", "🇯🇵", "닛케이"], ["CN", "🇨🇳", "상해"], ["HK", "🇭🇰", "항셍"]], world = [], lastD = "";
      MK.forEach(function(k){ var m = C.markets[k[0]], ix = m && (m.index || [])[0]; if (ix && ix.chg5 != null){ world.push({f: k[1], n: k[2], v: ix.chg5, s: md(ix.date) + "까지"}); if (ix.date > lastD) lastD = ix.date; } });
      var secs = [];
      ["KR", "US"].forEach(function(k){ var m = C.markets[k]; ((m && m.sectors) || []).forEach(function(s){ if (s.r5 != null && (s.n || 0) >= 5) secs.push({n: (k === "KR" ? "🇰🇷 " : "🇺🇸 ") + (s.pn || s.name).replace(/\(.*?\)/g, ""), v: s.r5}); }); });
      secs.sort(function(a, b){ return b.v - a.v; });
      var bars = secs.length >= 6 ? secs.slice(0, 3).concat(secs.slice(-3)) : secs;
      var up = world.filter(function(w){ return w.v > 0; }), best = world.slice().sort(function(a, b){ return b.v - a.v; })[0], worst = world.slice().sort(function(a, b){ return a.v - b.v; })[0];
      var one = world.length ? "이번 주 5개 시장 중 " + up.length + "곳 상승 — 가장 강한 곳 " + best.n + " " + sg(best.v) + ", 가장 약한 곳 " + worst.n + " " + sg(worst.v) + "." : "";
      var watch = ((PB.advice && PB.advice.watch) || []).map(function(w){ return {n: w[1], v: w[0], vc: "#5d667a"}; });
      var plan = ((PB.advice && PB.advice.plan) || [])[0] || "";
      var wkFrom = new Date(Date.parse((lastD || today()) + "T00:00:00Z") - 4 * 864e5).toISOString().slice(0, 10);
      return {kind: "screen", scene: "city_" + (up.length >= 3 ? "up" : up.length <= 1 ? "down" : "flat"), mood: up.length >= 3 ? "up" : up.length <= 1 ? "down" : "flat",
        title: "이번 주 한 장", sub: md(wkFrom) + " ~ " + md(lastD) + " · 5개 시장 한 주 흐름",
        blocks: [["world", world], ["note", {h: "📌 한 주 정리", t: one, tone: "dark", max: 3}], ["bars", bars.length ? {title: "한 주 강했던 업종 · 약했던 업종 (5일)", items: bars} : null],
          ["list", watch.length ? {title: "📅 다음 주 볼 일정", items: watch, rank: false} : null], ["note", plan ? {h: "🧭 자산배분 원칙", t: plan, tone: "info", max: 3} : null]],
        note: "주간 등락은 각 시장 마지막 5거래일 기준"};
    });
  }
  function weekSend(){
    var O = window.__onepage; if (!O || !O.draw || !O.ready){ toast("잠시 뒤 다시 눌러 주세요"); return; }
    toast("이번 주 한 장 만드는 중…");
    weekSpec().then(function(C){
      if (!C){ toast("자료를 못 가져왔어요"); return; }
      var nm = ""; try { nm = localStorage.getItem("pbname") || ""; } catch(x) {}
      var c = O.draw(C, nm);
      c.toBlob(function(b){ if (!b){ toast("만들지 못했어요"); return; }
        O.ready([new File([b], "이번주_한장_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"})], "이번 주 한 장"); }, "image/png");
    }).catch(function(x){ console.warn(x); toast("만들지 못했어요"); });
  }
  window.__weekSend = weekSend;

  /* ───────── 붙이기 ───────── */
  var H0 = null;
  function loadH(){ return gj(RAWM + "home.json" + q5()).then(function(H){ if (H) H0 = H; return H0; }); }
  function apply(){
    if (!onHome()) return;
    try { fold(); } catch(x) { console.warn("fold", x); }
    try { weekCard(); } catch(x) {}
    try { luckChip(); } catch(x) {}
    loadH().then(function(H){ if (onHome()){ try { sinceCard(H); } catch(x) { console.warn("since", x); } try { weekCard(); } catch(x) {} } });
    voteCard();
    if (Date.now() - LIVE_T > 60000){ LIVE_T = Date.now(); liveStrip(); }
    if (!document.hidden) clearBadge();
  }
  var T = 0;
  function soon(){ if (T) return; T = setTimeout(function(){ T = 0; apply(); }, 150); }
  try { new MutationObserver(function(ms){
    for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && (t.closest("#hbvote") || t.closest("#hblive") || t.closest("#hbsince") || t.closest("#wk1"))) continue; soon(); return; }
  }).observe(document.getElementById("main") || document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (onHome() && !document.hidden){ LIVE_T = 0; apply(); } }, 5 * 60e3);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden && onHome()){ LIVE_T = 0; apply(); } });

  var css = document.createElement("style");
  css.textContent =
    ".hf-c .hf-x{display:none!important}.hf-c.hf-open .hf-x{display:block!important}.hf-c.hf-open .tz-race.hf-x,.hf-c.hf-open .hm-sp.hf-x{display:block!important}.hf-gone{display:none!important}" +
    ".hf-row{margin:6px 0 0}.hf-b{font:inherit;font-size:13px;font-weight:700;color:var(--sub);background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:6px 12px;cursor:pointer}" +
    ".hb-since .hb-si{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line);cursor:pointer}.hb-since .hb-si:first-of-type{border-top:0}.hb-si>span{font-size:20px;flex:none;width:28px;text-align:center}.hb-si div{flex:1;min-width:0}.hb-si b{display:block;font-size:15px;line-height:1.4}.hb-si small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hb-si i{font-style:normal;color:var(--sub)}" +
    ".hb-since{box-shadow:0 0 0 2px rgba(57,135,229,.45)}" +
    ".hb-live .hb-lh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}.hb-live .hb-lh b{font-size:15.5px}.hb-live .hb-lh span{font-size:12px}.hb-lr{font-size:14px;line-height:1.5;padding:5px 0;border-top:1px solid var(--line)}.hb-lr:first-of-type{border-top:0}.hb-lr b{margin-right:4px}.hb-lr a{color:inherit;text-decoration:underline;text-decoration-color:var(--line)}" +
    ".hb-luck{display:inline-flex;align-items:center;gap:4px;margin:8px 0 0;font:inherit;font-size:13px;font-weight:700;color:#1d2433;background:rgba(255,255,255,.88);border:0;border-radius:999px;padding:6px 12px;cursor:pointer}.hb-luck b{color:#7b4dff}" +
    ".hb-vote .hm-h{position:relative}.hv-nk{margin-left:auto;font:inherit;font-size:12px;color:var(--sub);background:none;border:1px solid var(--line);border-radius:999px;padding:4px 9px;white-space:nowrap}" +
    ".hv-q{font-size:16.5px;font-weight:800;margin:6px 0 8px}.hv-q small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px}" +
    ".hv-bt{display:flex;gap:8px}.hv-bt button{flex:1;font:inherit;font-size:17px;font-weight:800;padding:14px 0;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}.hv-bt button.on{border-color:#3987e5;background:rgba(57,135,229,.14)}.hv-bt button:active{transform:scale(.97)}" +
    ".hv-sub{font-size:13px;color:var(--sub);margin-top:8px}.hv-now{font-size:14.5px;line-height:1.5}.hv-now .ok,.hv-res.ok{color:#2f9e44}.hv-now .no,.hv-res.no{color:#d6453d}" +
    ".hv-res{font-size:15px;font-weight:800;margin:4px 0 6px}.hv-res span{font-size:13px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".hv-ft{font-size:13px;color:var(--sub);margin-top:10px;padding-top:8px;border-top:1px solid var(--line)}" +
    ".hv-rk{margin-top:8px}.hv-rk small{display:block;font-size:12px;color:var(--sub);margin-bottom:4px}.hv-rk div{display:flex;gap:8px;align-items:center;font-size:14px;padding:3px 0}.hv-rk div b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hv-rk div.me b{color:#3987e5}" +
    ".hb-wk{cursor:pointer;background:linear-gradient(135deg,rgba(57,135,229,.14),rgba(124,156,255,.08))!important}.hb-wkb{display:flex;align-items:center;gap:12px}.hb-wkb>span{font-size:28px}.hb-wkb div{flex:1;min-width:0}.hb-wkb b{display:block;font-size:16.5px}.hb-wkb small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.4}.hb-wkb i{font-style:normal;font-size:20px;color:var(--sub)}.hb-wkp{font-size:13.5px;margin-top:10px;padding-top:9px;border-top:1px solid var(--line)}.hb-wkp:empty{display:none}";
  document.head.appendChild(css);
})();
