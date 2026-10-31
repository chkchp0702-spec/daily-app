/* 🏠 오늘 탭 10가지 (10/22 사용자 「오늘 카테고리 더 임팩트·신선·우와·레이아웃·눈에 확 — 다해」)
   ① 🌤 날씨판 — 맨 위 한 장면: 오늘 숫자로 배경·날씨가 바뀌고 꼬마가 그날 표정으로 한마디
   ② 🔥 히어로 숫자 — 지금 가장 중요한 숫자 하나를 크게 + 그날 장중 선을 배경으로 · 「2000년 이후 이만큼 움직인 날 N번」
   ③ ⚡ 카운트업 — 날씨판 숫자가 0 에서 촤르륵
   ④ 🎞 「그날 팔았다면?」 → 세 컷 만화 (숫자 표는 「숫자로 자세히」 접기 안에 그대로)
   ⑤ 🏁 내 포트 경주 트랙 — 기본·공격·집중·S&P 레인 + 하루하루 S&P 이긴 날 점 띠 (선 그래프는 「선으로 보기」)
   ⑥ 🧭 바뀐 것 → 세로 타임라인 · 바뀐 칩은 색이 들어오며 등장
   ⑦ 🌙 시간대별 첫 장면 — 아침(밤사이 미국)·장중(지금 코스피)·저녁(오늘 마감 + 내일 확률)·밤(미국 선물)
   ⑧ 🏆 오늘의 배지 — 어제 S&P 이김 · 예고 적중 · 시장 절반 넘게 앞섬 · 연속 방문
   ⑨ 👆 카드를 길게 누르면 꼬마가 한 줄씩 요약 (window.gdSay · guide.js)
   ⑩ 🎨 색 규칙 — 오름 빨강 · 내림 파랑 · 바로가기는 회색 밑줄 (파랑 = 내림 하나로)
   원칙: 숫자는 자료 그대로(지어내지 않음) · 사라·팔라는 말 없음 · 자료가 없으면 그 칸은 안 보임 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function gj(u, ttl){ return typeof getJSON === "function" ? getJSON(u, {ttl: ttl || 120000}).catch(function(){ return null; }) : Promise.resolve(null); }
  var q2 = function(){ return "?" + Math.floor(Date.now() / 120000); };

  /* ── ⑦ 시간대 ── */
  function slot(){ var t = kst(), m = t.getUTCHours() * 60 + t.getUTCMinutes(), wd = t.getUTCDay();
    if (wd === 0 || wd === 6) return "week";
    if (m >= 6 * 60 && m < 9 * 60) return "morn";
    if (m >= 9 * 60 && m < 15 * 60 + 30) return "day";
    if (m >= 15 * 60 + 30 && m < 22 * 60 + 30) return "eve";
    return "night"; }
  var SLOT = {morn: ["🌅", "아침판"], day: ["🌞", "장중판"], eve: ["🌆", "저녁판"], night: ["🌙", "밤판"], week: ["🗓", "주말판"]};

  /* ── ① 날씨 ── */
  var WX = {
    sun:   {ic: "☀️", w: "맑음",      kid: "img/kid_joy.jpg?v=1", acc: "", say: "기분 좋은 날이에요"},
    part:  {ic: "🌤", w: "구름 조금", kid: "img/kid_thumb.jpg?v=1",  acc: "",   say: "살짝 맑아요"},
    cloud: {ic: "☁️", w: "흐림",      kid: "img/kid_globe.jpg?v=1", acc: "",   say: "큰 움직임 없이 흐려요"},
    rain:  {ic: "🌧", w: "비",        kid: "img/kid_umb.jpg?v=1", acc: "", say: "비가 와요, 서두르지 말아요"},
    storm: {ic: "⛈", w: "폭풍",      kid: "img/guide_src.jpg?v=1", acc: "⛈", say: "폭풍우예요 — 오늘은 숫자보다 마음을 지켜요"}
  };
  function wxOf(r){ return r == null ? "cloud" : r >= 1.5 ? "sun" : r >= 0.3 ? "part" : r > -0.3 ? "cloud" : r > -1.5 ? "rain" : "storm"; }

  /* ── 자료 ── */
  var KP = null;
  function kospiHist(){
    if (KP) return KP;
    KP = gj("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), 600000).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return gj("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), 3600e3);
    }).then(function(j){
      if (!j || !j.dd) return null;
      var c = j.c.map(Number), rs = [];
      for (var i = 1; i < c.length; i++) rs.push((c[i] / c[i - 1] - 1) * 100);
      return {rs: rs, from: String(j.d0).slice(0, 4)};
    }).catch(function(){ return null; });
    return KP;
  }
  function load(){
    return Promise.all([gj(RAW + "home.json" + q2()), gj("archive/x/live_kr.json" + q2()), gj("archive/x/live_us_pre.json" + q2()), gj("archive/x/prob.json" + q2()), kospiHist()]);
  }

  /* ── ①②⑦ 장면 고르기 ── */
  function scene(H, LK, US, PB){
    var s = slot(), P = (H && H.port) || {}, td = today();
    var kr = LK && LK.date === td ? (LK.index || []).filter(function(x){ return x.name === "코스피"; })[0] : null;
    var kq = LK && LK.date === td ? (LK.index || []).filter(function(x){ return x.name === "코스닥"; })[0] : null;
    var es = US && US.date === td ? (US.fut || []).filter(function(x){ return x.s === "ES=F"; })[0] : null;
    var krp = PB && PB.markets && PB.markets.KR;
    var S = {slot: s, P: P, kr: kr, kq: kq, es: es};
    // 큰 숫자 하나
    if (s === "day" && kr) S.big = {lab: "🇰🇷 지금 코스피", sh: "지금 코스피", v: kr.chg, krx: 1, sub: (LK.up != null ? "오른 종목 " + Math.round(LK.up / Math.max(1, LK.total) * 100) + "%" : "") + " · " + e(LK.t) + " 기준"};
    else if (s === "eve" && kr) S.big = {lab: "🇰🇷 오늘 코스피 마감", sh: "코스피 마감", v: kr.chg, krx: 1, sub: kq ? "코스닥 " + sg(kq.chg, 1) + "%" : ""};
    else if ((s === "night" || s === "eve") && es) S.big = {lab: "🇺🇸 S&P500 선물", sh: "S&P 선물", v: es.chg, sub: "미국 장 열기 전 · " + e(US.t) + " 기준"};
    else if (P.d1_spy != null) S.big = {lab: "🇺🇸 밤사이 S&P500", sh: "밤사이 S&P", v: P.d1_spy, sub: md(P.d1_date) + " 미국 종가"};
    else if (kr) S.big = {lab: "🇰🇷 코스피", sh: "코스피", v: kr.chg, krx: 1, sub: ""};
    S.wx = wxOf(S.big ? S.big.v : null);
    // 장중 선 (코스피 등락 % — snaps 네 번째 칸)
    S.line = LK && LK.date === td && (LK.snaps || []).length > 3 ? LK.snaps.map(function(x){ return +x[3]; }).filter(function(v){ return !isNaN(v); }) : null;
    // 내일 확률(저녁·주말) — 실전 성적이 쌓이기 전이라 말은 약하게
    if ((s === "eve" || s === "week") && krp && krp.p1 != null){
      var hit = PB.score && PB.score.all && PB.score.all.d1 ? PB.score.all.d1.hit : null;
      S.prob = {p: Math.round(krp.p1 * 100), tone: krp.tone1 || "", day: nextLab(krp.next_day), hit: hit, weak: hit != null && hit < 50}; }
    // 꼬마 한마디
    var W = WX[S.wx], b = S.big;
    var lead = s === "morn" ? "좋은 아침이에요! " : s === "eve" ? "오늘 장 끝! " : s === "night" ? "밤이에요 🌙 " : s === "week" ? "주말이에요 🗓 " : "";
    S.say = lead + (b ? b.sh + " " + sg(b.v, 1) + "% · " : "") + W.say;
    if (s === "morn" && (H.focus || []).length) S.say2 = "오늘 볼 곳: " + H.focus.map(function(t){ return t.name; }).slice(0, 2).join(" · ");
    else if (S.prob && !S.prob.weak) S.say2 = S.prob.day + " 코스피 오를 확률 " + S.prob.p + "% (" + S.prob.tone + " · 아직 검증 중)";
    else if (S.prob) S.say2 = S.prob.day + " 코스피는 " + S.prob.tone + " · 실전 적중 " + Math.round(S.prob.hit) + "%라 참고만";   // 10/31 A4: 성적 낮을 땐 숫자 빼고 회색으로
    return S;
  }

  /* 10/31 A2: 「내일」이 주말·휴장이면 실제 다음 장 요일로 */
  function nextLab(nd){
    if (!nd) return "다음 장";
    var t = Date.parse(today() + "T00:00:00Z"), n = Date.parse(nd + "T00:00:00Z");
    if (isNaN(n)) return "다음 장";
    var dd = Math.round((n - t) / 864e5);
    if (dd === 1) return "내일";
    if (dd === 0) return "오늘";
    return ["일", "월", "화", "수", "목", "금", "토"][new Date(n).getUTCDay()] + "요일(" + nd.slice(5).replace("-", "/") + ")";
  }

  /* ── ⑧ 배지 ── */
  function streak(){
    var V = ls("td_visits") || [], d = today();
    if (V[V.length - 1] !== d){ V.push(d); V = V.slice(-60); ls("td_visits", V); }
    var n = 1, t = Date.parse(d + "T00:00:00Z");
    for (var i = V.length - 2; i >= 0; i--){ t -= 864e5; var dd = new Date(t).toISOString().slice(0, 10);
      while (new Date(t).getUTCDay() === 0 || new Date(t).getUTCDay() === 6){ if (V[i] === dd) break; t -= 864e5; dd = new Date(t).toISOString().slice(0, 10); }
      if (V[i] === dd) n++; else break; }
    return n;
  }
  function badges(H){
    var P = (H && H.port) || {}, G = H && H.grade, out = [];
    if (P.d1 != null && P.d1_spy != null && P.d1 > P.d1_spy) out.push(["🏆", "어제 S&P 이김", "내 포트(기본) " + sg(P.d1, 2) + "% vs S&P " + sg(P.d1_spy, 2) + "% (" + md(P.d1_date) + ")"]);
    if (G && (G.items || []).length){ var ok = G.items.filter(function(x){ return x.cls === "ok"; }).length, n = G.items.filter(function(x){ return x.cls === "ok" || x.cls === "no"; }).length;
      if (n && ok / n >= 0.6) out.push(["🎯", "예고 " + ok + "/" + n + " 적중", md(G.prev || G.date) + " 시황 예고 채점"]); }
    if (P.n_bench && P.beat_kick != null && P.beat_kick * 2 > P.n_bench) out.push(["📈", "시장 " + P.n_bench + "곳 중 " + P.beat_kick + "곳 앞섬", md(P.start) + "부터 · 공격(킥) 기준"]);
    var st = streak(); if (st >= 2) out.push(["🔥", st + "일 연속", "평일 기준 연속으로 앱을 연 날"]);
    return out.slice(0, 3);
  }

  /* ── ② 장중 선 배경 svg ── */
  function bgLine(L){
    if (!L || L.length < 4) return "";
    var mn = Math.min.apply(null, L.concat([0])), mx = Math.max.apply(null, L.concat([0])), r = (mx - mn) || 1, W = 300, Hh = 90;
    var pts = L.map(function(v, i){ return (i / (L.length - 1) * W).toFixed(1) + "," + (8 + (mx - v) / r * (Hh - 16)).toFixed(1); }).join(" ");
    var z = (8 + mx / r * (Hh - 16)).toFixed(1);
    return '<svg class="tz-bg" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + z + '" y2="' + z + '" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>' +
      '<polyline points="0,' + Hh + ' ' + pts + ' ' + W + ',' + Hh + '" fill="rgba(255,255,255,.10)" stroke="none"/><polyline class="tz-bgl" points="' + pts + '" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
  }

  /* ── ①② 날씨판 그리기 ── */
  function rankLine(S, K){
    var b = S.big; if (!b || !b.krx || !K || Math.abs(b.v) < 1.5) return "";
    var r = b.v, n = K.rs.filter(function(x){ return r < 0 ? x <= r : x >= r; }).length, pct = n / K.rs.length * 100;
    return '<div class="tz-rank">' + K.from + '년 이후 하루 ' + Math.abs(r).toFixed(1) + '% 넘게 ' + (r < 0 ? "빠진" : "오른") + ' 날 <b>' + n + '번</b> · 상위 ' + (pct < 1 ? pct.toFixed(1) : Math.round(pct)) + '%</div>';
  }
  function hero(H, LK, US, PB, K){
    var S = scene(H, LK, US, PB), W = WX[S.wx], P = S.P, sl = SLOT[S.slot], b = S.big;
    var mini = [];
    if (S.kr && !(b && b.krx)) mini.push(["🇰🇷 코스피", S.kr.chg, S.kr.status === "CLOSE" ? "마감" : "지금"]);   // 10/31 A2: 큰 숫자와 같은 건 작은 칸에서 뺌
    var bigUS = b && /S&P/.test(b.sh || "");
    if (S.es && S.slot !== "morn" && S.slot !== "week" && !/선물/.test(b && b.sh || "")) mini.push(["🇺🇸 S&P 선물", S.es.chg, "지금"]);
    else if (P.d1_spy != null && !bigUS) mini.push(["🇺🇸 S&P500", P.d1_spy, md(P.d1_date)]);
    if (bigUS && P.d1_qqq != null) mini.push(["🇺🇸 나스닥", P.d1_qqq, md(P.d1_date)]);
    if (P.d1 != null) mini.push(["💼 내 포트", P.d1, md(P.d1_date)]);
    var BG = badges(H);
    var rw = !!(b && b.krx && S.line && S.line.length >= 4);   // 🎞 되감기 (A10/30-3)
    var h = '<div class="tz-sky ' + S.wx + (rw ? ' tz-rwok' : '') + '">' + (S.wx === "rain" || S.wx === "storm" ? '<i class="tz-rain" aria-hidden="true"></i>' : S.wx === "sun" ? '<i class="tz-sun" aria-hidden="true"></i>' : '') + bgLine(S.line) +
      '<div class="tz-top"><span class="tz-wx">' + W.ic + ' <b>' + W.w + '</b></span><span class="tz-sl">' + sl[0] + ' ' + sl[1] + '</span></div>' +
      '<div class="tz-main">' +
        '<div class="tz-kid" style="background-image:url(' + (S.slot === "night" && S.wx !== "storm" ? "img/kid_night.jpg?v=1" : W.kid) + ')"' + ' aria-hidden="true">' + (W.acc ? '<i>' + W.acc + '</i>' : '') + '</div>' +
        '<div class="tz-num">' + (b ? '<small>' + e(b.lab) + '</small><b class="tz-cnt" data-v="' + b.v + '">' + sg(b.v, 2) + '%</b><em>' + e(b.sub || "") + '</em>' : '<small>오늘</small><b>–</b>') + '</div>' +
      '</div>' +
      rankLine(S, K) +
      '<div class="tz-say"><b>' + e(S.say) + '</b>' + (S.say2 ? '<small>' + e(S.say2) + '</small>' : '') + '</div>' +
      (mini.length ? '<div class="tz-mini">' + mini.map(function(m){ return '<div><small>' + m[0] + '</small><b class="tz-cnt" data-v="' + m[1] + '">' + sg(m[1], 2) + '%</b><em>' + e(m[2]) + '</em></div>'; }).join("") + '</div>' : '') +
      (BG.length ? '<div class="tz-bdg">' + BG.map(function(x){ return '<span title="' + e(x[2]) + '" data-why="' + e(x[2]) + '">' + x[0] + ' ' + e(x[1]) + '</span>'; }).join("") + '</div>' : '') +
      '<div class="tz-hint">' + (rw ? '⏪ 카드를 옆으로 밀면 오늘 하루가 되감겨요' : '👆 카드를 길게 누르면 조이가 요약해 줘요') + '</div>' +
    '</div>';
    return h;
  }
  /* ── 🎞 오늘 하루 되감기 (A10/30-3 · 10/30 사용자 「1,3번 진행해」) ──
     장중 선이 깔린 큰 카드를 옆으로 밀면 그 시각(10분마다 저장된 snaps)의 코스피 % · 오른/내린 종목 수 · 코스닥 · 가장 센/약한 업종으로 바뀜
     손을 떼면 지금으로 돌아옴 · 세로로 움직이면 그냥 스크롤 · 숫자는 live_kr.json snaps 그대로(지어내지 않음) */
  var RWX = 0;
  function rewind(d, LK){
    var sky = d.querySelector(".tz-sky.tz-rwok"); if (!sky || !LK || LK.date !== today()) return;
    var sn = (LK.snaps || []).filter(function(x){ return x && x[3] != null && !isNaN(+x[3]); }); if (sn.length < 4) return;
    var nb = sky.querySelector(".tz-num b"), lab = sky.querySelector(".tz-num small"), sub = sky.querySelector(".tz-num em"); if (!nb || !lab) return;
    var L = sn.map(function(x){ return +x[3]; }), mn = Math.min.apply(null, L.concat([0])), mx = Math.max.apply(null, L.concat([0])), rr = (mx - mn) || 1, last = sn[sn.length - 1];
    var cur = document.createElement("i"); cur.className = "tz-rwc"; cur.innerHTML = '<i class="tz-rwd"></i>'; sky.appendChild(cur);
    var tip = document.createElement("div"); tip.className = "tz-rwt"; sky.appendChild(tip);
    var o = null, st = null, idx = -1;
    function show(i){
      if (i === idx) return; idx = i; var s = sn[i], v = +s[3], n = sn.length;
      if (!o) o = {nb: nb.textContent, nc: nb.className, lab: lab.innerHTML, sub: sub ? sub.innerHTML : ""};
      nb.textContent = sg(v, 2) + "%"; nb.className = "tz-cnt " + cl(v);
      lab.textContent = "⏪ " + s[0] + " 코스피";
      var tot = (+s[1] || 0) + (+s[2] || 0);
      if (sub) sub.textContent = "오른 종목 " + s[1] + " · 내린 " + s[2] + (tot ? " (오른 비율 " + Math.round(s[1] / tot * 100) + "%)" : "") + " · 코스닥 " + sg(+s[4], 1) + "%";
      var x = n > 1 ? i / (n - 1) * 100 : 50, y = 58 + (8 + (mx - v) / rr * 74) / 90 * 42;
      cur.style.left = x + "%"; cur.firstChild.style.top = y + "%"; sky.classList.add("tz-rwon");
      var aft = +last[3] - v;
      tip.innerHTML = (s[5] ? '<span>🔥 ' + e(s[5]) + ' <b>' + sg(+s[6], 1) + '%</b></span><span>🧊 ' + e(s[7]) + ' <b>' + sg(+s[8], 1) + '%</b></span>' : '') +
        (i < n - 1 ? '<span>그 뒤 ' + e(last[0]) + '까지 <b>' + sg(aft, 1) + '%p</b></span>' : '<span>지금</span>');
      try { navigator.vibrate && navigator.vibrate(4); } catch(z) {}
    }
    function back(){ if (!o) return; nb.textContent = o.nb; nb.className = o.nc; lab.innerHTML = o.lab; if (sub) sub.innerHTML = o.sub; o = null; idx = -1; sky.classList.remove("tz-rwon"); }
    function at(ev){ var r = sky.getBoundingClientRect(), f = Math.max(0, Math.min(1, (ev.clientX - r.left) / (r.width || 1))); return Math.round(f * (sn.length - 1)); }
    sky.addEventListener("pointerdown", function(ev){ if (ev.button > 0) return; st = {x: ev.clientX, y: ev.clientY, m: null, id: ev.pointerId}; });
    sky.addEventListener("pointermove", function(ev){
      if (!st || ev.pointerId !== st.id) return;
      var dx = ev.clientX - st.x, dy = ev.clientY - st.y;
      if (!st.m){ if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)){ st.m = "rw"; try { sky.setPointerCapture(ev.pointerId); } catch(z) {} } else if (Math.abs(dy) > 12){ st = null; return; } }
      if (st.m === "rw"){ ev.preventDefault(); show(at(ev)); }
    });
    function end(ev){ if (st && st.m === "rw"){ RWX = Date.now(); setTimeout(back, 900); } st = null; }
    sky.addEventListener("pointerup", end); sky.addEventListener("pointercancel", end);
  }

  /* ── ③ 카운트업 ── */
  function countUp(root){
    [].forEach.call(root.querySelectorAll(".tz-cnt:not([data-done])"), function(el){
      el.setAttribute("data-done", "1");
      var v = parseFloat(el.dataset.v); if (isNaN(v) || RM) return;
      var t0 = null, dur = 900;
      (function step(ts){ if (!document.body.contains(el)) return; if (t0 == null) t0 = ts;
        var q = Math.min(1, (ts - t0) / dur), ez = 1 - Math.pow(1 - q, 3);
        el.textContent = sg(v * ez, 2) + "%"; el.className = "tz-cnt " + cl(v);
        if (q < 1) requestAnimationFrame(step); })(performance.now());
    });
  }

  /* ── ④ 세 컷 만화 ── */
  function comic(){
    var s = document.getElementById("hmpanic"); if (!s || s.dataset.td) return;
    var h = s.querySelector(".pnh-h b"), r1 = s.querySelector(".pnh-r:not(.pnh-b):not(.pnh-now)"), rn = s.querySelector(".pnh-now"), rb = s.querySelector(".pnh-b"); if (!h || !r1) return;
    s.dataset.td = "1";
    var tt = h.textContent.replace(/^😱\s*/, "").split(" — ")[0];
    var c1 = r1.children, lab1 = c1[0] ? c1[0].textContent : "", v1 = c1[1] ? c1[1].textContent : "", n1 = c1[2] ? c1[2].textContent : "";
    var vb = rb && rb.children[1] ? rb.children[1].textContent : null, lb = rb && rb.children[0] ? rb.children[0].textContent.replace(/^↔\s*반대로\s*/, "") : "";
    var keep = document.createElement("details"); keep.className = "tz-raw";
    keep.innerHTML = '<summary>숫자로 자세히 ▾</summary>';
    while (s.firstChild) keep.appendChild(s.firstChild);
    var pan = function(img, cap, big, cls_, small){ return '<div class="tz-pan"><div class="tz-pk" style="background-image:url(' + img + ')"></div><div class="tz-pt"><small>' + cap + '</small><b class="' + (cls_ || "") + '">' + big + '</b>' + (small ? '<em>' + small + '</em>' : '') + '</div></div>'; };
    var neg1 = /^−|^-/.test(v1.trim());
    s.insertAdjacentHTML("afterbegin", '<div class="tz-ch"><b>🎞 ' + e(tt) + ' — 그날 팔았다면?</b><small>2000년 이후 같은 급락일로 되짚은 세 컷</small></div>' +
      '<div class="tz-comic">' +
        pan("img/guide_src.jpg?v=1", "① " + e(tt.replace(/\s*[−-][\d.]+%.*$/, "")), e((tt.match(/[−-][\d.]+%/) || [""])[0]), "dn", "😱 깜짝 놀라 팔고 싶어져요") +
        pan("img/kid_piggy.jpg?v=1", "② 팔고 " + e(lab1.replace(/\s*뒤\s*돌아옴$/, "")) + " 뒤 돌아왔다면", e(v1), neg1 ? "dn" : "up", e(n1) + (neg1 ? " — 놓친 몫" : "")) +
        (vb ? pan(/^\+/.test(vb) ? "img/kid_joy.jpg?v=1" : "img/kid_umb.jpg?v=1", "③ 반대로 " + e(lb.replace(/\s*\d+거래일 뒤$/, "")), e(vb), /^\+/.test(vb) ? "up" : "dn", "120거래일 뒤 평균") : "") +
      '</div>' +
      (rn ? '<div class="tz-now">' + e(rn.children[0] ? rn.children[0].textContent : "") + (rn.children[1] && rn.children[1].tagName === "B" ? '<br>과거엔 120거래일 뒤 평균 <b class="' + rn.children[1].className + '">' + e(rn.children[1].textContent) + '</b>' + (rn.children[2] ? '<small>' + e(rn.children[2].textContent.replace(/ · 120거래일 뒤 평균/, "")) + '</small>' : '') : '') + '</div>' : ''));
    s.appendChild(keep);
    keep.addEventListener("click", function(ev){ ev.stopPropagation(); }, true);
  }

  /* ── ⑤ 경주 트랙 ── */
  function race(H){
    var c = document.querySelector('#hmbody section.hm-c[data-goto^="port"]'); if (!c || c.querySelector(".tz-race")) return;
    var P = (H && H.port) || {}, sp = c.querySelector(".hm-sp");
    var L = [["기본", P.base, "#e9b949"], ["공격(킥)", P.kick, "#ff6b6b"], ["집중", P.conc, "#4dd47a"], ["S&P500", P.spy, "#7c9cff"]].filter(function(x){ return x[1] != null; });
    if (L.length < 2) return;
    var vs = L.map(function(x){ return x[1]; }).concat([0]), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), pad = (mx - mn) * 0.12 || 1;
    mn -= pad; mx += pad;
    var X = function(v){ return (v - mn) / (mx - mn) * 100; }, top = Math.max.apply(null, L.map(function(x){ return x[1]; }));
    var dots = "", nW = 0, nT = 0;
    var nav = P.nav || [], spl = P.spy_line || [];
    for (var i = 1; i < Math.min(nav.length, spl.length); i++){ var a = nav[i] - nav[i - 1], b = spl[i] - spl[i - 1], w = a > b; nT++; if (w) nW++; dots += '<i class="' + (w ? "w" : "l") + '"></i>'; }
    var gap = P.base != null && P.spy != null ? P.base - P.spy : null;
    var el = document.createElement("div"); el.className = "tz-race";
    el.innerHTML = '<div class="tz-rh"><b>🏁 ' + md(P.start) + '부터 경주</b>' + (gap != null ? '<span class="' + cl(gap) + '">기본이 S&P보다 ' + sg(gap, 1) + '%p</span>' : '') + '</div>' +
      L.map(function(x){ var me = x[0] !== "S&P500";
        return '<div class="tz-ln"><span class="tz-lb">' + x[0] + '</span><div class="tz-tk"><i class="tz-z" style="left:' + X(0).toFixed(1) + '%"></i><i class="tz-rn' + (me ? " me" : "") + '" data-x="' + X(x[1]).toFixed(1) + '" style="left:' + X(0).toFixed(1) + '%;--c:' + x[2] + '">' + (x[1] === top ? "👑" : "") + '</i></div><b class="' + cl(x[1]) + '">' + sg(x[1], 2) + '%</b></div>'; }).join("") +
      (nT ? '<div class="tz-dw"><small>하루하루 S&P와 승부 — <b>' + nT + '일 중 ' + nW + '일</b> 이김</small><div>' + dots + '</div></div>' : '') +
      (sp ? '<button type="button" class="tz-tg">선으로 보기 ▾</button>' : '');
    if (sp){ sp.parentNode.insertBefore(el, sp); sp.classList.add("tzx-hide"); }
    else c.appendChild(el);
    var tg = el.querySelector(".tz-tg"); if (tg) tg.onclick = function(ev){ ev.stopPropagation(); ev.preventDefault(); var o = sp.classList.toggle("tzx-hide"); tg.textContent = o ? "선으로 보기 ▾" : "선 접기 ▴"; };
    requestAnimationFrame(function(){ setTimeout(function(){ [].forEach.call(el.querySelectorAll(".tz-rn"), function(r){ r.style.left = r.dataset.x + "%"; }); }, 60); });
  }

  /* ── ⑥ 바뀐 것 타임라인 ── */
  function timeline(){ var c = document.querySelector("#hmbody .hm-chg"); if (c && !c.classList.contains("tz-tl")) c.classList.add("tz-tl"); }

  /* ── ⑨ 길게 누르면 꼬마 요약 ── */
  var LP = {t: null, x: 0, y: 0, el: null, fired: 0};
  function summary(card){
    var tEl = card.querySelector(".hm-h b, .pl-h small, .tz-ch b, h3"), title = tEl ? tEl.textContent.replace(/\s+/g, " ").trim() : "이 카드";
    var seen = {}, lines = [];
    String(card.innerText || "").split("\n").forEach(function(l){ l = l.replace(/\s+/g, " ").replace(/[›▾▴]/g, "").trim();
      if (!l || l.length < 4 || seen[l] || l === title || /^(열기|자세히|포트|시황|숫자로 자세히|선으로 보기|선 접기)$/.test(l)) return; seen[l] = 1; lines.push(l); });
    var withNum = lines.filter(function(l){ return /[\d%]/.test(l); }), rest = lines.filter(function(l){ return !/[\d%]/.test(l); });
    var L = withNum.slice(0, 4).concat(rest.slice(0, 2));
    // 짧은 조각(라벨·숫자)은 앞 줄에 붙여 한 문장처럼
    var out = []; L.forEach(function(l){ if (out.length && l.length <= 10) out[out.length - 1] += " · " + l; else out.push(l); });
    return {title: "👆 " + title + " — 요약", lines: out.slice(0, 5)};
  }
  function lpStart(ev){
    var c = ev.target.closest && ev.target.closest("#hmbody section.card"); if (!c || ev.button > 0) return;
    LP.el = c; LP.x = ev.clientX; LP.y = ev.clientY; LP.fired = 0; clearTimeout(LP.t);
    LP.t = setTimeout(function(){ if (!LP.el) return; LP.fired = Date.now(); try { navigator.vibrate && navigator.vibrate(12); } catch(x) {}
      var s = summary(LP.el); if (window.gdSay && s.lines.length) gdSay(s.title, s.lines, "", "img/kid_thumb.jpg?v=1"); LP.el = null; }, 550);
  }
  function lpCancel(ev){ if (!LP.el) return; if (ev && ev.type === "pointermove" && Math.abs(ev.clientX - LP.x) < 10 && Math.abs(ev.clientY - LP.y) < 10) return; clearTimeout(LP.t); LP.el = null; }
  document.addEventListener("pointerdown", lpStart, true);
  ["pointermove", "pointerup", "pointercancel", "scroll"].forEach(function(t){ document.addEventListener(t, lpCancel, true); });
  document.addEventListener("click", function(ev){ if (LP.fired && Date.now() - LP.fired < 800 && ev.target.closest && ev.target.closest("#hmbody")){ ev.stopImmediatePropagation(); ev.preventDefault(); LP.fired = 0; } }, true);
  document.addEventListener("contextmenu", function(ev){ if (ev.target.closest && ev.target.closest("#hmbody section.card")) ev.preventDefault(); }, true);

  /* ── 붙이기 ── */
  var busy = 0, H0 = null, stamp = 0;
  function apply(){
    var b = document.getElementById("hmbody"); if (!b || busy) return;
    timeline(); comic();
    if (H0) race(H0);
    if (document.getElementById("tdhero") && Date.now() - stamp < 120000) return;
    if (!b.querySelector("section.card")) return;
    busy = 1;
    load().then(function(a){
      busy = 0; stamp = Date.now(); H0 = a[0] || H0;
      var b2 = document.getElementById("hmbody"); if (!b2) return;
      var old = document.getElementById("tdhero"), d = document.createElement("div"); d.id = "tdhero"; d.className = "tz-hero"; d.setAttribute("role", "button");
      d.innerHTML = hero(a[0] || {}, a[1], a[2], a[3], a[4]);
      if (old) old.replaceWith(d); else b2.insertBefore(d, b2.firstChild);
      d.onclick = function(ev){ var bd = ev.target.closest && ev.target.closest(".tz-bdg span"); ev.stopPropagation();
        if (Date.now() - RWX < 700) return;   // 되감기 손을 뗀 직후의 눌림은 무시
        if (bd){ if (window.gdSay) gdSay("🏆 오늘의 배지", [bd.textContent, bd.dataset.why], "", "img/kid_joy.jpg?v=1"); return; }
        if (window.goTo) goTo("market", "live"); else if (window.go) go("market"); };
      countUp(d); try { rewind(d, a[1]); } catch(z) {} if (H0) race(H0);
    }, function(){ busy = 0; });
  }
  var tm = null;
  new MutationObserver(function(){ if (tm) return; tm = setTimeout(function(){ tm = null; if (window.cur === "home" || document.getElementById("hmbody")) apply(); }, 150); })
    .observe(document.documentElement, {childList: true, subtree: true});

  /* ── 모양 ── */
  var css = document.createElement("style");
  css.textContent =
    // ① 날씨판
    ".tz-hero{margin:4px 0 14px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".tz-sky{position:relative;overflow:hidden;border-radius:26px;padding:16px 18px 14px;color:#fff;box-shadow:0 10px 30px rgba(20,30,60,.18);isolation:isolate}" +
    ".tz-sky.sun{background:linear-gradient(155deg,#ffb347 0%,#ff7e5f 55%,#e8557a 100%)}" +
    ".tz-sky.part{background:linear-gradient(155deg,#56ccf2 0%,#2f80ed 100%)}" +
    ".tz-sky.cloud{background:linear-gradient(155deg,#94a3b8 0%,#5b6b80 100%)}" +
    ".tz-sky.rain{background:linear-gradient(160deg,#4b6cb7 0%,#1e2f5c 100%)}" +
    ".tz-sky.storm{background:linear-gradient(160deg,#3a3f5c 0%,#14172b 100%)}" +
    ".tz-bg{position:absolute;left:0;right:0;bottom:0;width:100%;height:42%;z-index:-1;opacity:.45}" +
    ".tz-bgl{stroke-dasharray:1200;stroke-dashoffset:1200;animation:tdDraw 1.6s ease-out .2s forwards}@keyframes tdDraw{to{stroke-dashoffset:0}}" +
    ".tz-rain{position:absolute;inset:-40px 0 0;z-index:-1;background:repeating-linear-gradient(105deg,rgba(255,255,255,.0) 0 14px,rgba(255,255,255,.16) 14px 15px);animation:tdRain .7s linear infinite;opacity:.8}" +
    "@keyframes tdRain{from{transform:translateY(-20px)}to{transform:translateY(20px)}}" +
    ".tz-sky.storm:after{content:'';position:absolute;inset:0;z-index:-1;background:#fff;opacity:0;animation:tdFlash 6s infinite}@keyframes tdFlash{0%,92%,100%{opacity:0}93%{opacity:.35}94%{opacity:0}95%{opacity:.2}}" +
    ".tz-sun{position:absolute;right:-60px;top:-60px;width:200px;height:200px;z-index:-1;border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.22) 0 8deg,transparent 8deg 22deg);animation:tdSpin 30s linear infinite}@keyframes tdSpin{to{transform:rotate(360deg)}}" +
    ".tz-top{display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:.95}.tz-wx b{font-weight:800}.tz-sl{background:rgba(255,255,255,.18);padding:3px 10px;border-radius:999px;font-weight:700}" +
    ".tz-main{display:flex;align-items:center;gap:14px;margin-top:10px}" +
    ".tz-kid{flex:none;width:86px;height:110px;border-radius:20px;background:#f3e6d6 center top/cover no-repeat;box-shadow:0 6px 18px rgba(0,0,0,.25);position:relative;animation:tdHop 2.6s ease-in-out infinite}" +
    ".tz-kid i{position:absolute;right:-10px;top:-12px;font-size:30px;font-style:normal;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}" +
    "@keyframes tdHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}" +
    ".tz-num{min-width:0}.tz-num small{display:block;font-size:13px;opacity:.9;font-weight:700}" +
    ".tz-num b{display:block;font-size:52px;line-height:1.05;font-weight:900;letter-spacing:-2px;font-variant-numeric:tabular-nums;color:#fff!important;text-shadow:0 3px 14px rgba(0,0,0,.25)}" +
    ".tz-num em{display:block;font-style:normal;font-size:12.5px;opacity:.85;margin-top:2px}" +
    ".tz-rank{margin-top:10px;font-size:13px;background:rgba(0,0,0,.18);border-radius:12px;padding:7px 11px;display:inline-block}.tz-rank b{font-weight:900}" +
    ".tz-say{margin-top:10px;background:rgba(255,255,255,.95);color:#1d2433;border-radius:16px 16px 16px 4px;padding:10px 13px;font-size:15px;line-height:1.45;box-shadow:0 4px 14px rgba(0,0,0,.12)}.tz-say b{font-weight:800}.tz-say small{display:block;color:#5d667a;font-size:12.5px;margin-top:3px}" +
    ".tz-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.tz-mini div{background:rgba(255,255,255,.14);border-radius:14px;padding:8px 10px;min-width:0}" +
    ".tz-mini small{display:block;font-size:12.5px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tz-mini b{display:block;font-size:20px;font-weight:900;color:#fff!important;font-variant-numeric:tabular-nums;letter-spacing:-.5px}.tz-mini em{font-style:normal;font-size:12.5px;opacity:.8}" +
    ".tz-bdg{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.tz-bdg span{background:rgba(255,255,255,.95);color:#1d2433;border-radius:999px;padding:5px 11px;font-size:12.5px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.12);animation:tdPop .5s cubic-bezier(.2,1.6,.4,1) both}" +
    ".tz-bdg span:nth-child(2){animation-delay:.12s}.tz-bdg span:nth-child(3){animation-delay:.24s}@keyframes tdPop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}" +
    ".tz-hint{margin-top:9px;font-size:12.5px;opacity:.75;text-align:right}" +
    ".tz-sky.tz-rwok{touch-action:pan-y;-webkit-user-select:none;user-select:none}" +
    ".tz-rwc{position:absolute;top:0;bottom:0;width:0;border-left:1.5px dashed rgba(255,255,255,.85);z-index:2;pointer-events:none;display:none}.tz-rwd{position:absolute;left:-6px;width:11px;height:11px;margin-top:-5px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.35)}" +
    ".tz-rwt{position:absolute;top:8px;left:10px;right:10px;z-index:3;pointer-events:none;display:none;flex-wrap:wrap;gap:2px 10px;background:rgba(10,14,30,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:10px;padding:6px 9px;font-size:11.5px;line-height:1.35}.tz-rwt b{font-weight:800}" +
    ".tz-rwon .tz-rwc{display:block}.tz-rwon .tz-rwt{display:flex}.tz-rwon .tz-bg{opacity:.85}" +
    // ④ 세 컷
    ".tz-ch b{display:block;font-size:16px;font-weight:800}.tz-ch small{color:var(--sub);font-size:12.5px}" +
    ".tz-now{margin:8px 0 4px;padding:9px 11px;border-radius:12px;background:rgba(255,80,80,.10);border:1px solid rgba(255,80,80,.35);font-size:14px;font-weight:700;line-height:1.45}.tz-now b{font-size:16px}.tz-now small{display:block;font-weight:500;opacity:.75;font-size:12.5px;margin-top:2px}" +
    ".tz-comic{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 6px}" +
    ".tz-pan{border:2px solid var(--text);border-radius:14px;overflow:hidden;background:var(--panel2);display:flex;flex-direction:column;animation:tdPop .45s both}.tz-pan:nth-child(2){animation-delay:.15s}.tz-pan:nth-child(3){animation-delay:.3s}" +
    ".tz-pk{height:92px;background:#f3e6d6 center 12%/cover no-repeat;border-bottom:2px solid var(--text)}" +
    ".tz-pt{padding:7px 8px 9px;min-width:0}.tz-pt small{display:block;font-size:12.5px;color:var(--sub);line-height:1.3}.tz-pt b{display:block;font-size:clamp(15px,4.6vw,19px);font-weight:900;letter-spacing:-.6px;margin:2px 0;white-space:nowrap}.tz-pt em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);line-height:1.3}" +
    ".tz-raw summary{font-size:12.5px;color:var(--sub);text-decoration:underline;cursor:pointer;list-style:none;margin-top:4px}.tz-raw summary::-webkit-details-marker{display:none}" +
    // ⑤ 경주
    ".tz-race{margin:10px 0 4px;padding:10px 12px;border-radius:16px;background:var(--panel2)}" +
    ".tz-rh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px;margin-bottom:6px}.tz-rh b{font-weight:800}.tz-rh span{font-weight:800}" +
    ".tz-ln{display:grid;grid-template-columns:62px 1fr 64px;align-items:center;gap:8px;margin:7px 0}.tz-lb{font-size:12.5px;color:var(--sub);white-space:nowrap}.tz-ln>b{text-align:right;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums}" +
    ".tz-tk{position:relative;height:14px;border-radius:999px;background:repeating-linear-gradient(90deg,var(--line) 0 6px,transparent 6px 12px);}" +
    ".tz-z{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--sub);opacity:.6;border-radius:2px}" +
    ".tz-rn{position:absolute;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px var(--panel2),0 2px 6px rgba(0,0,0,.25);transition:left 1.1s cubic-bezier(.2,.9,.25,1);font-style:normal;font-size:12.5px;line-height:18px;text-align:center}" +
    ".tz-rn:empty{font-size:0}.tz-rn:not(:empty){width:22px;height:22px;margin:-11px 0 0 -11px;line-height:22px;background:#fff;box-shadow:0 0 0 3px var(--c),0 2px 6px rgba(0,0,0,.25)}" +
    ".tz-dw{margin-top:8px}.tz-dw small{font-size:12.5px;color:var(--sub)}.tz-dw small b{color:var(--text)}.tz-dw div{display:flex;gap:3px;margin-top:4px}.tz-dw i{flex:1;height:10px;border-radius:3px;background:#3987e5;opacity:.75}.tz-dw i.w{background:#e66767;opacity:1}" +
    ".tz-tg{margin-top:6px;border:0;background:none;color:var(--sub);font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;padding:2px 0}.hm-sp.tzx-hide{display:none}" +
    // ⑥ 타임라인
    ".hm-chg.tz-tl .hm-chi{position:relative;padding-left:4px;border-top:0!important}" +
    ".hm-chg.tz-tl .hm-chi>span:first-child{position:relative;z-index:1;width:34px;height:34px;flex:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--panel2);box-shadow:0 0 0 2px var(--line)}" +
    ".hm-chg.tz-tl .hm-chi:not(:last-child)>span:first-child:after{content:'';position:absolute;left:50%;top:36px;width:2px;height:40px;margin-left:-1px;background:var(--line);z-index:-1}" +
    ".hm-chg.tz-tl .hm-chi:first-of-type>span:first-child{box-shadow:0 0 0 2px #3987e5;animation:tdPulse 2s ease-out 2}@keyframes tdPulse{0%{box-shadow:0 0 0 2px #3987e5,0 0 0 0 rgba(57,135,229,.5)}100%{box-shadow:0 0 0 2px #3987e5,0 0 0 12px rgba(57,135,229,0)}}" +
    ".hm-chg.tz-tl .hm-cb s,.hm-chg.tz-tl .hm-chi s{opacity:.55}" +
    ".hm-chg.tz-tl .hm-chi b:last-of-type{animation:tdIn .8s ease-out .3s both}@keyframes tdIn{from{filter:grayscale(1);opacity:.4;transform:translateX(-6px)}to{filter:none;opacity:1;transform:none}}" +
    // ⑩ 색 규칙 — 바로가기는 회색 밑줄 (파랑은 내림에만)
    "#hmbody .hm-nw,#hmbody .pnh-go,#hmbody a[data-goto]:not(.hm-chip),#hmbody .hm-go,#hmbody .pl a{color:var(--sub)!important;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;font-weight:600}" +
    "#hmbody .hm-nw b{color:var(--text)!important}" +
    "@media (max-width:360px){.tz-num b{font-size:42px}.tz-kid{width:72px;height:94px}.tz-pk{height:76px}.tz-pt b{font-size:16px}}" +
    "@media (prefers-reduced-motion:reduce){.tz-kid,.tz-rain,.tz-sun,.tz-sky.storm:after,.tz-bgl,.tz-bdg span,.tz-pan{animation:none!important}.tz-bgl{stroke-dashoffset:0}.tz-rn{transition:none}}";
  document.head.appendChild(css);
})();
