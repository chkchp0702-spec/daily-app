/* 10/22 사용자 「세 개 다 좋아 실행해」 — 📱 앱 아이디어 A10/22-1·2·3
   ① 😱 급락 뒤 홈 한 줄 「그날 팔았다면」 (A10/22-1 · 설계기 쪽은 port_design.js)
      코스피가 하루 −3.5% 넘게 빠진 날이 최근 3거래일 안에 있으면 「오늘 한 줄」 밑에 카드 하나:
      2000년 이후 같은 급락일 종가에 팔고 20·60·120거래일 뒤 돌아왔다면 → 놓친 지수 수익(평균·몇 번 중 몇 번 손해·최악),
      반대로 그날 10% 더 샀다면 → 그 10% 의 수익. 자료: archive/x/port_px/KOSPI.json(^KS11 2000~) — 계산은 휴대폰에서.
   ② 📌 내 ELS 관제탑 (A10/22-2) — 🎯 ELS 탭 맨 위. 청약 중 상품을 「담아 두기」(실제·가상 같은 단추, 휴대폰에만 저장) →
      기초자산마다 기준가 대비 · 다음 평가 D-day · 배리어까지 여유 · KI 까지 거리, 그리고 2006~ 일봉으로
      「과거에 이 위치였던 가입일들은 다음 평가 때 상환 ○% · 결국 손실 ○%」. 두 개 넘으면 「같이 깨진 비율(겹침)」.
      자료: archive/x/els_px(7일마다 일봉) + els_px/last.json(매 실행 최근 종가 · els_replay.py) · els_replay.json by_id(조건키) · els_all.json · products.json
   ③ 👁 내 눈 vs 거름망 (A10/22-3) — 🔎 아침 거르기 카드마다 「👁 볼 만함」 한 번(안 누른 건 넘긴 것).
      다음 날부터 화면 맨 위 한 줄 + 📊 성적표 카드: 찍은 것 vs 안 찍은 것(그날 거름망 전체) 「그날 종가 → 가장 최근 종가」 평균.
      값은 opdata p/ (종목 종가 · 매일 아침) — 날짜가 그날보다 뒤인 것만 셈. 휴대폰에만 저장.
   원칙: 과거·지난 값 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」). */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function s2day(s){ return Date.parse(s + "T00:00:00Z") / 864e5; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function lb(a, v){ var lo = 0, hi = a.length; while (lo < hi){ var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
  function addM(t, m){ var x = new Date(t * 864e5), y = x.getUTCFullYear(), mo = x.getUTCMonth() + m, dd = x.getUTCDate();
    var ny = y + Math.floor(mo / 12), nm = ((mo % 12) + 12) % 12, last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
    return Date.UTC(ny, nm, Math.min(dd, last)) / 864e5; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function goTab(t){ if (typeof window.go === "function") go(t); else location.hash = t; }

  /* ═════════ ① 😱 급락 뒤 「그날 팔았다면」 ═════════ */
  var KP = null, KW = null;
  // 10/23: 파일(어제까지 종가)은 한 번만 받고, 실시간 코스피(live_kr, 장중 2분마다 갱신)는 부를 때마다 새로 얹음 → 장중 급락도 바로 반영
  function kospi(){
    if (!KW) KW = getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return getJSON("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), {ttl: 3600e3});
    }).then(function(j){
      if (!j || !j.dd) return null;
      var t = s2day(j.d0), d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(day2s(t)); c.push(+j.c[i]); }
      KP = {d: d, c: c}; return KP;
    }).catch(function(){ KW = null; return null; });
    return KW.then(function(B){
      if (!B) return null;
      return getJSON("archive/x/live_kr.json?" + Math.floor(Date.now() / 60000), {ttl: 60000}).then(function(L){
        var K = {d: B.d.slice(), c: B.c.slice(), live: null};
        var ix = L && L.date && L.date <= kst() ? (L.index || []).filter(function(x){ return x.name === "코스피"; })[0] : null;
        if (ix && ix.last > 0){ var n = K.d.length; if (K.d[n - 1] === L.date) K.c[n - 1] = +ix.last; else if (K.d[n - 1] < L.date){ K.d.push(L.date); K.c.push(+ix.last); }
          if (L.date === kst() && ix.status !== "CLOSE") K.live = {t: L.t || "", d: L.date}; }
        return K;
      }, function(){ return {d: B.d, c: B.c, live: null}; });
    });
  }
  var CUT = -3.5;
  function panicStats(K){
    var c = K.c, d = K.d, n = c.length, drops = [];
    for (var i = 1; i < n; i++) if ((c[i] / c[i - 1] - 1) * 100 <= CUT) drops.push(i);
    var trig = null;   // 최근 3거래일 안 급락(가장 최근)
    for (var j = Math.max(1, n - 3); j < n; j++){ var r = (c[j] / c[j - 1] - 1) * 100; if (r <= CUT) trig = {i: j, d: d[j], r: r}; }
    if (!trig) return null;
    var H = [20, 60, 120].map(function(h){
      var rs = [], worst = null;
      drops.forEach(function(i){ if (i + h >= n) return; var r = (c[i + h] / c[i] - 1) * 100; rs.push(r); if (!worst || r < worst.r) worst = {r: r, d: d[i]}; });
      if (!rs.length) return {h: h, n: 0};
      var s = 0, up = 0; rs.forEach(function(x){ s += x; if (x > 0) up++; });
      var so = rs.slice().sort(function(a, b){ return a - b; });
      return {h: h, n: rs.length, avg: s / rs.length, med: so[Math.floor(so.length / 2)], up: up, worst: worst};
    });
    var now = null;   // 오늘 장중(또는 오늘 종가)인데 급락일이 오늘이 아닐 때 — 「오늘도 −x%」
    if (d[n - 1] === kst() && trig && trig.d !== d[n - 1]){
      var rn = (c[n - 1] / c[n - 2] - 1) * 100, r2 = (c[n - 1] / c[trig.i - 1] - 1) * 100;
      if (rn <= -1.5){
        var k = n - 1 - (trig.i - 1), cut2 = Math.ceil(r2), hs = [], seen = -999;   // 같은 날 수(k일) 동안 r2 만큼 빠진 날들 → 120거래일 뒤
        for (var q = k; q < n - 1; q++){ var rr = (c[q] / c[q - k] - 1) * 100; if (rr <= cut2 && q - seen > k){ seen = q; if (q + 120 < n) hs.push((c[q + 120] / c[q] - 1) * 100); } }
        var av = null, upn = 0; if (hs.length){ av = 0; hs.forEach(function(x){ av += x; if (x > 0) upn++; }); av /= hs.length; }
        now = {r: rn, r2: r2, k: k, cut2: cut2, n: hs.length, avg: av, up: upn};
      }
    }
    return {trig: trig, drops: drops.length, H: H, from: d[0].slice(0, 4), today: d[n - 1] === kst(), live: K.live, now: now};
  }
  function panicHome(S){
    var A = amt(), T = S.trig, h120 = S.H[2], h20 = S.H[0];
    var rows = S.H.filter(function(x){ return x.n; }).map(function(x){
      return '<div class="pnh-r"><span>' + x.h + '거래일 뒤 돌아옴</span><b class="' + cl(-x.avg) + '">' + sg(-x.avg, 1) + '%p</b><em>' + x.n + '번 중 <b>' + x.up + '</b>번 손해</em></div>'; }).join("");
    var add = h120 && h120.n ? A * 0.1 * h120.avg / 100 : null;
    return '<div class="pnh-h"><b>😱 ' + (T.d === kst() ? (S.live ? "오늘(장중 " + S.live.t + ")" : "오늘") : md(T.d)) + ' 코스피 ' + sg(T.r, 1) + '% — 그날 팔았다면?</b><small>' + S.from + '년 이후 하루 ' + Math.abs(CUT) + '% 넘게 빠진 날 ' + S.drops + '번 · 그날 종가에 팔고 다시 샀을 때 지수를 그대로 들고 있던 것보다</small></div>' +
      (S.now ? '<div class="pnh-r pnh-now"><span>🔴 오늘도 ' + (S.live ? '장중(' + S.live.t + ') ' : '') + sg(S.now.r, 1) + '% · ' + S.now.k + '일 합쳐 ' + sg(S.now.r2, 1) + '%</span>' + (S.now.n ? '<b class="' + cl(S.now.avg) + '">' + sg(S.now.avg, 1) + '%</b><em>' + S.now.k + '일 새 ' + Math.abs(S.now.cut2) + '% 넘게 빠진 ' + S.now.n + '번 · 120거래일 뒤 평균 · ' + S.now.up + '번 오름</em>' : '<em>같은 낙폭 과거 사례 부족</em>') + '</div>' : '') +
      rows +
      (add != null ? '<div class="pnh-r pnh-b"><span>↔ 반대로 그날 ' + won(A * 0.1) + '원(10%) 더 샀다면 120거래일 뒤</span><b class="' + cl(add) + '">' + (add >= 0 ? "+" : "−") + won(Math.abs(add)) + '원</b><em>평균 · 최악 ' + sg(h120.worst.r, 0) + '%(' + h120.worst.d.slice(0, 7).replace("-", ".") + ')</em></div>' : '') +
      '<div class="pnh-go">💼 내 포트 설계로 2008·2020·2022·2025 낙폭에서 보기 ›</div>' +
      '<p class="note" style="margin:4px 0 0">코스피 지수 기준(개별 종목 아님 · 현금 이자 뺌) · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p>';
  }
  var HPB = 0;
  function homePanic(){
    var b = document.getElementById("hmbody"); if (!b || HPB) return;
    var pl = b.querySelector("section.card.pl"); if (!pl || document.getElementById("hmpanic")) return;
    HPB = 1;
    kospi().then(function(K){
      HPB = 0; if (!K) return;
      var S = panicStats(K); if (!S) return;
      var b2 = document.getElementById("hmbody"), pl2 = b2 && b2.querySelector("section.card.pl"); if (!pl2 || document.getElementById("hmpanic")) return;
      var s = document.createElement("section"); s.className = "card hmpn"; s.id = "hmpanic"; s.setAttribute("role", "button");
      s.innerHTML = panicHome(S); s.dataset.sig = psig(S); pl2.parentNode.insertBefore(s, pl2.nextSibling);
      s.onclick = function(ev){ ev.stopPropagation(); if (window.__pdz && __pdz.panic) __pdz.panic(); goTab("port"); };
    }).catch(function(){ HPB = 0; });
  }
  function psig(S){ return S.trig.d + "|" + S.trig.r.toFixed(1) + "|" + (S.now ? S.now.r.toFixed(1) : "") + "|" + (S.live ? S.live.t : ""); }
  // 장중엔 2분마다 다시 계산 → 숫자가 바뀌면 카드를 새로 그림(급락이 새로 생기거나 사라져도)
  setInterval(function(){
    if (document.hidden || !document.getElementById("hmbody")) return;
    var h = +new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 13); if (h < 9 || h > 16) return;
    kospi().then(function(K){
      if (!K) return; var S = panicStats(K), old = document.getElementById("hmpanic");
      if (!S){ if (old) old.remove(); return; }
      if (old && old.dataset.sig === psig(S)) return;
      if (old) old.remove(); HPB = 0; homePanic();
    }).catch(function(){});
  }, 120000);
  window.__panicStats = function(){ return kospi().then(function(K){ return K && panicStats(K); }); };   // 검사용

  /* ═════════ ② 📌 내 ELS 관제탑 ═════════ */
  var EPX = {}, EIDX = null, ELAST = null, EW = null;
  function eload(){
    if (!EW) EW = Promise.all([
      getJSON("archive/x/els_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/els_px/last.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; }),
      getJSON("archive/x/els_replay.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; }),
      getJSON("archive/x/els_all.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })
    ]).then(function(r){ EIDX = r[0] && r[0].assets ? r[0] : {assets: {}}; ELAST = r[1] && r[1].assets ? r[1] : null; return {rep: r[2] || {by_id: {}}, all: r[3] || {items: []}}; });
    return EW;
  }
  function epx(n){   // 7일마다 일봉 + last.json 최근 종가(겹치는 날 값으로 맞춰 이어 붙임)
    if (EPX[n]) return EPX[n];
    var a = EIDX && EIDX.assets[n]; if (!a) return Promise.resolve(null);
    EPX[n] = getJSON("archive/x/els_px/" + a.f + "?" + String(EIDX.updated || "").replace(/\D/g, ""), {ttl: 864e5}).then(function(j){
      if (!j || !j.dd) return null;
      var t = s2day(j.d0), d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(t); c.push(+j.c[i]); }
      var L = ELAST && ELAST.assets[n], tail = 0;
      if (L && L.length){
        var lastD = d[d.length - 1], k = null;
        for (var q = 0; q < L.length; q++) if (s2day(L[q][0]) === lastD){ k = c[c.length - 1] / L[q][1]; break; }
        if (k){ L.forEach(function(x){ var tt = s2day(x[0]); if (tt > lastD){ d.push(tt); c.push(x[1] * k); tail++; } }); }
      }
      return {d: Int32Array.from(d), c: Float64Array.from(c), tail: tail};
    }).catch(function(){ return null; });
    return EPX[n];
  }
  function align(ss){
    var base = ss[0], m = ss.length, D = [], C = ss.map(function(){ return []; }), ptr = ss.map(function(){ return 0; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true, vals = [base.c[i]];
      for (var a = 1; a < m; a++){ var s = ss[a]; while (ptr[a] < s.d.length && s.d[ptr[a]] < t) ptr[a]++; if (ptr[a] >= s.d.length || s.d[ptr[a]] !== t){ ok = false; break; } vals.push(s.c[ptr[a]]); }
      if (!ok) continue; D.push(t); for (var a2 = 0; a2 < m; a2++) C[a2].push(vals[a2]);
    }
    return {D: Int32Array.from(D), C: C.map(function(x){ return Float64Array.from(x); })};
  }
  function sparse(arr){ var n = arr.length, K = [arr], k = 1; while ((1 << k) <= n){ var p = K[k - 1], q = new Float64Array(n - (1 << k) + 1), h = 1 << (k - 1); for (var i = 0; i < q.length; i++) q[i] = p[i] < p[i + h] ? p[i] : p[i + h]; K.push(q); k++; } return K; }
  function rmin(K, a, b){ if (b < a) return Infinity; var k = 31 - Math.clz32(b - a + 1), x = K[k][a], y = K[k][b - (1 << k) + 1]; return x < y ? x : y; }
  function parseKey(key){ var p = String(key).split("|"); return {ua: p[0].split("+"), bars: p[1].split("-").map(Number), cyc: +p[2], ki: p[3] === "none" ? null : +p[3], pp: p[4] === "pp"}; }
  // 가입일 s 에서 끝까지 (els_replay replay 와 같은 규칙: 평가일마다 가장 못한 자산이 배리어 위면 상환 · 끝까지 못 넘으면 KI 닿았으면 손실(KI 없으면 손실))
  function simAt(G, q, s){
    var D = G.D, T = D.length, n = q.bars.length, m = G.C.length, ev = [];
    for (var k = 0; k < n; k++){ var tt = addM(D[s], q.cyc * (k + 1)); if (tt > D[T - 1]) return null; ev.push(Math.min(lb(D, tt), T - 1)); }
    for (var k2 = 0; k2 < n; k2++){ var w = Infinity; for (var a = 0; a < m; a++){ var r = G.C[a][ev[k2]] / G.C[a][s]; if (r < w) w = r; } if (w >= q.bars[k2] / 100) return {k: k2, ev: ev}; }
    var touched = false; if (q.ki != null) for (var a2 = 0; a2 < m; a2++) if (rmin(G.K[a2], s, ev[n - 1]) / G.C[a2][s] < q.ki / 100){ touched = true; break; }
    return {k: -1, loss: q.ki != null ? touched : true, ev: ev};
  }
  function worstAt(G, s, p){ var w = Infinity, wa = 0; for (var a = 0; a < G.C.length; a++){ var r = G.C[a][p] / G.C[a][s]; if (r < w){ w = r; wa = a; } } return {w: w, a: wa}; }
  function kiTouched(G, q, s, p){ if (q.ki == null) return false; for (var a = 0; a < G.C.length; a++) if (rmin(G.K[a], s, p) / G.C[a][s] < q.ki / 100) return true; return false; }
  function monitor(it, G){
    var q = parseKey(it.key), D = G.D, T = D.length, b = lb(D, s2day(it.base));
    if (b >= T) return {wait: 1, q: q};
    var L = T - 1, n = q.bars.length, evT = [];
    for (var k = 0; k < n; k++) evT.push(addM(D[b], q.cyc * (k + 1)));
    var passed = evT.filter(function(t){ return t <= D[L]; }).length;
    // 지나간 평가에서 이미 상환됐나
    for (var k2 = 0; k2 < passed; k2++){ var p = Math.min(lb(D, evT[k2]), L), w = worstAt(G, b, p).w; if (w >= q.bars[k2] / 100) return {done: {k: k2, d: day2s(D[p]), w: w}, q: q}; }
    var cur = G.C.map(function(c, a){ return c[L] / c[b]; }), W = worstAt(G, b, L), kt = kiTouched(G, q, b, L);
    var out = {q: q, b: b, L: L, cur: cur, w: W.w, wa: W.a, kt: kt, next: passed < n ? {k: passed, t: evT[passed], bar: q.bars[passed]} : null, mat: day2s(evT[n - 1]), last: day2s(D[L]), base: day2s(D[b])};
    if (!out.next) return out;
    // 과거에 이 위치: 경과일이 같고(같은 평가 차례 앞) · 가장 못한 자산이 지금과 ±tol 안 · KI 닿음 여부 같음 · 그때까지 상환 안 됨
    var E = D[L] - D[b], nS = 0, nNext = 0, nEarly = 0, nMat = 0, nLoss = 0, tol = 0.05, cand = [];
    for (var tries = 0; tries < 3; tries++){
      cand = [];
      for (var s = 0; s < T; s++){
        if (s >= b - 5 && s <= L) break;
        var pp = lb(D, D[s] + E); if (pp >= T) break;
        var sim = simAt(G, q, s); if (!sim) break;
        if (sim.k >= 0 && sim.k < passed) continue;          // 그 위치 전에 이미 끝남
        var ww = worstAt(G, s, pp).w; if (Math.abs(ww - W.w) > tol) continue;
        if (q.ki != null && kiTouched(G, q, s, pp) !== kt) continue;
        cand.push(sim);
      }
      if (cand.length >= 30) break;
      tol = tol === 0.05 ? 0.08 : 0.12;
    }
    cand.forEach(function(x){ nS++; if (x.k === passed) nNext++; if (x.k >= 0) nEarly++; else if (x.loss) nLoss++; else nMat++; });
    out.hist = {n: nS, next: nNext, early: nEarly, mat: nMat, loss: nLoss, tol: tol, from: day2s(D[0]).slice(0, 4)};
    return out;
  }
  function overlap(items, GS){   // 담은 것 둘 넘으면: 모두가 있는 날 가입했다면 하나가 손실일 때 다른 것도 손실인 비율
    var names = []; items.forEach(function(it){ parseKey(it.key).ua.forEach(function(u){ if (names.indexOf(u) < 0) names.push(u); }); });
    return Promise.all(names.map(epx)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var G = align(ss); if (G.D.length < 600) return null; G.K = G.C.map(sparse);
      var subs = items.map(function(it){ var q = parseKey(it.key), idx = q.ua.map(function(u){ return names.indexOf(u); });
        return {q: q, G: {D: G.D, C: idx.map(function(i){ return G.C[i]; }), K: idx.map(function(i){ return G.K[i]; })}}; });
      var any = 0, both = 0, tot = 0, ones = items.map(function(){ return 0; });
      for (var s = 0; s < G.D.length; s++){
        var rs = subs.map(function(x){ return simAt(x.G, x.q, s); });
        if (rs.some(function(r){ return !r; })) break;
        tot++; var L = rs.map(function(r){ return r.k < 0 && r.loss; }), c = L.filter(Boolean).length;
        L.forEach(function(v, i){ if (v) ones[i]++; });
        if (c >= 1) any++; if (c >= 2) both++;
      }
      return tot >= 200 ? {tot: tot, any: any, both: both, ones: ones, from: day2s(G.D[0]).slice(0, 7)} : null;
    });
  }
  var LABU = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LABU[n] || n; }
  function my(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function nextWeekday(s){ var t = s2day(s) + 1; for (var i = 0; i < 5; i++){ var w = new Date(t * 864e5).getUTCDay(); if (w > 0 && w < 6) break; t++; } return day2s(t); }
  function cands(R){
    var by = (R.rep && R.rep.by_id) || {}, out = [], API = window.__elsApi, Dd = API && API.D && API.D();
    ((Dd && Dd.els) || []).forEach(function(x){ var k = by[x.isin]; if (k && (x.pp || 0) < 100) out.push({id: x.isin, nm: x.n, iss: "미래에셋증권", key: k, e: x.e, cpn: x.cpn}); });
    ((R.all && R.all.items) || []).forEach(function(x){ var k = by[x.id]; if (k && x.kind !== "ELB" && !x.nolos) out.push({id: x.id, nm: String(x.nm || "").replace(/\s*\[.*$/, "").replace(/파생결합증권\(주가연계증권\)/, "ELS"), iss: String(x.iss || "").replace(/주식회사|\(주\)/g, "").trim(), key: k, e: x.e, cpn: x.cpn}); });
    var seen = {}; return out.filter(function(c){ if (seen[c.id]) return false; seen[c.id] = 1; return parseKey(c.key).ua.every(function(u){ return EIDX && EIDX.assets[u]; }); });
  }
  function condTxt(q){ return q.ua.map(lab).join("·") + ' · ' + q.bars.join("-") + ' · ' + q.cyc + '개월마다 · KI ' + (q.ki == null ? "없음" : q.ki); }
  var EM = {open: 0, q: "", busy: 0};
  function itemH(it, M){
    var q = parseKey(it.key), head = '<div class="em-ih"><div><b>' + e(it.nm) + '</b>' + (it.virt ? ' <span class="em-v">🧪 가상</span>' : '') + '<small>' + e(it.iss || "") + ' · ' + e(condTxt(q)) + '</small></div><button class="em-x" data-emx="' + e(it.id) + '" aria-label="빼기">✕</button></div>';
    var dt = '<label class="em-dt">기준일 <input type="date" data-emd="' + e(it.id) + '" value="' + e(it.base) + '"><button data-emt="' + e(it.id) + '">오늘로</button></label>';
    if (!M) return '<div class="em-it">' + head + '<div class="mut em-l">기초자산 일봉 자료가 없어요(18개 밖).</div>' + dt + '</div>';
    if (M.wait) return '<div class="em-it">' + head + '<div class="em-l">⏳ 기준가가 아직 안 정해졌어요 — <b>' + md(it.base) + '</b> 종가가 기준(발행일이 다르면 아래 날짜를 고쳐 주세요).</div>' + dt + '</div>';
    if (M.done) return '<div class="em-it">' + head + '<div class="em-l em-ok">✅ ' + (M.done.k + 1) + '차 평가(' + md(M.done.d) + ')에서 가장 못한 자산 ' + Math.round(M.done.w * 100) + '% ≥ ' + q.bars[M.done.k] + ' — 상환 조건을 넘었어요(증권사 공지로 확인).</div>' + dt + '</div>';
    var bars = q.ua.map(function(u, i){ var r = M.cur[i] * 100, pos = Math.max(0, Math.min(100, (r - 40) / (130 - 40) * 100));
      return '<div class="em-ua"><span>' + e(lab(u)) + (i === M.wa ? ' <i>가장 못함</i>' : '') + '</span><div class="em-tr"><i class="em-bar" style="left:' + ((M.next ? M.next.bar : q.bars[q.bars.length - 1]) - 40) / 0.9 + '%"></i>' + (q.ki != null ? '<i class="em-ki" style="left:' + (q.ki - 40) / 0.9 + '%"></i>' : '') + '<i class="em-dot ' + cl(r - 100) + '" style="left:' + pos + '%"></i></div><b class="' + cl(r - 100) + '">' + sg(r - 100, 1) + '%</b></div>'; }).join("");
    var nx = M.next, dd = nx ? Math.round(nx.t - s2day(kst())) : null, gap = nx ? M.w * 100 - nx.bar : null;
    var H = M.hist, hist = H && H.n >= 10 ? '<div class="em-hs">🕰 과거에 이 위치(가장 못한 자산 ' + Math.round(M.w * 100) + '% ±' + Math.round(H.tol * 100) + ' · 같은 차례' + (q.ki != null ? ' · KI ' + (M.kt ? '닿음' : '안 닿음') : '') + ')였던 가입일 <b>' + H.n.toLocaleString() + '</b>번 →' +
        '<div class="em-hb"><span style="flex:' + H.next + '" class="a"></span><span style="flex:' + (H.early - H.next) + '" class="b"></span><span style="flex:' + H.mat + '" class="c"></span><span style="flex:' + H.loss + '" class="d"></span></div>' +
        '<div class="em-hl"><span><i class="a"></i>다음 평가 상환 <b>' + Math.round(H.next / H.n * 100) + '%</b></span><span><i class="b"></i>그 뒤 상환 ' + Math.round((H.early - H.next) / H.n * 100) + '%</span>' + (H.mat ? '<span><i class="c"></i>만기 원금 ' + Math.round(H.mat / H.n * 100) + '%</span>' : '') + '<span><i class="d"></i>손실 <b>' + Math.round(H.loss / H.n * 100) + '%</b></span></div></div>'
      : '<div class="em-hs mut">🕰 과거에 이 위치였던 가입일이 ' + (H ? H.n : 0) + '번뿐이라 비율은 안 보여 줘요.</div>';
    return '<div class="em-it">' + head +
      '<div class="em-k"><div><small>다음 평가</small><b>' + (nx ? (nx.k + 1) + '차 · D-' + dd : '만기 지남') + '</b><em>' + (nx ? md(day2s(nx.t)) + ' · 배리어 ' + nx.bar : '') + '</em></div>' +
        '<div><small>배리어까지</small><b class="' + (gap >= 0 ? "up" : "dn") + '">' + (gap == null ? "–" : sg(gap, 1) + '%p') + '</b><em>' + (gap == null ? '' : gap >= 0 ? '지금이면 상환' : '더 올라야 상환') + '</em></div>' +
        '<div><small>' + (q.ki != null ? 'KI ' + q.ki + '까지' : 'KI') + '</small><b class="' + (M.kt ? "dn" : "") + '">' + (q.ki == null ? '없음' : M.kt ? '닿음' : sg(q.ki - M.w * 100, 0) + '%p') + '</b><em>' + (q.ki != null && !M.kt ? '여기까지 빠지면 손실 위험' : q.ki != null ? '만기에 못 넘으면 손실' : '만기 배리어 밑이면 손실') + '</em></div></div>' +
      bars + '<div class="em-lg"><span><i class="em-bar"></i>다음 배리어</span>' + (q.ki != null ? '<span><i class="em-ki"></i>KI</span>' : '') + '<span class="mut">기준가 ' + md(M.base) + ' → ' + md(M.last) + ' 종가</span></div>' + hist + dt + '</div>';
  }
  function emDraw(){
    var box = document.getElementById("elsmy"); if (!box) return;
    var L = my();
    box.innerHTML = '<div class="em-hd"><b>📌 내 ELS 관제탑</b><small>' + (L.length ? L.length + '개 · 휴대폰에만 저장' : '들고 있거나 지켜볼 ELS 를 담아 두면 매일 「지금 어디쯤」') + '</small></div>' +
      (L.length ? '<div id="emov"></div><div id="emlist"><div class="loading">계산 중…</div></div>' : '<p class="em-in">청약한 ELS(또는 지켜볼 상품)를 담아 두면 — 기초자산마다 기준가 대비 · 다음 평가까지 D-day · 배리어까지 여유 · KI 까지 거리, 그리고 <b>2006년부터 「과거에 이 위치였던 가입일들은 어떻게 끝났나」</b>를 매일 보여 줘요. 두 개 넘게 담으면 「같이 손실로 끝난 비율」도.</p>') +
      '<button class="em-add" id="emadd">' + (EM.open ? '닫기 ▴' : '＋ 담아 두기') + '</button><div id="empick"' + (EM.open ? '' : ' hidden') + '></div>' +
      '<p class="note" style="margin:6px 0 0">과거 계산 · 미래 보장 아님 · 기본 스텝다운 기준(월지급·리자드 빼고) · 실제 상환은 증권사 공지로 확인 · 사라는 뜻이 아니에요.</p>';
    document.getElementById("emadd").onclick = function(ev){ ev.stopPropagation(); EM.open = !EM.open; emDraw(); };
    if (EM.open) pickDraw();
    if (!L.length) return;
    eload().then(function(){
      return Promise.all(L.map(function(it){ var q = parseKey(it.key); return Promise.all(q.ua.map(epx)).then(function(ss){
        if (ss.some(function(x){ return !x; })) return null; var G = align(ss); G.K = G.C.map(sparse); var t0 = performance.now(), M = null; try { M = monitor(it, G); } catch(x) { console.warn(x); } if (M) M.ms = performance.now() - t0; return M; }); }));
    }).then(function(MS){
      var el = document.getElementById("emlist"); if (!el) return;
      el.innerHTML = L.map(function(it, i){ return itemH(it, MS[i]); }).join("");
      bindItems(el);
      var live = L.filter(function(it, i){ var M = MS[i]; return M && !M.wait && !M.done; });
      var ov = document.getElementById("emov");
      if (ov && live.length >= 2){ ov.innerHTML = '<div class="em-ov mut">🔗 겹침 계산 중…</div>';
        overlap(live).then(function(O){ var o = document.getElementById("emov"); if (!o) return;
          if (!O){ o.innerHTML = ''; return; }
          if (O.any < 20){ o.innerHTML = '<div class="em-ov">🔗 ' + O.from.replace("-", ".") + '~ 매 거래일 ' + live.length + '개를 같이 가입했다면 ' + O.tot.toLocaleString() + '번 중 하나라도 손실로 끝난 게 ' + O.any + '번뿐 — 겹침(같이 깨진 비율)을 셀 만큼 손실이 없었어요.</div>'; return; }
          var p = O.any ? Math.round(O.both / O.any * 100) : 0;
          o.innerHTML = '<div class="em-ov"><div class="em-ovb"><b>' + p + '%</b><small>겹침</small></div><div>' + O.from.replace("-", ".") + '~ 매 거래일 ' + live.length + '개를 같이 가입했다면 <b>' + O.tot.toLocaleString() + '</b>번 중 하나라도 손실 ' + O.any.toLocaleString() + '번 — 그중 <b>' + p + '%</b>는 ' + (live.length > 2 ? '두 개 넘게' : '둘 다') + ' 같이 손실' +
            '<small>' + (p >= 60 ? '기초자산이 겹쳐 나눠 들어도 위험이 잘 안 나뉘어요' : p >= 30 ? '꽤 같이 움직여요' : '위험이 꽤 나뉘어 있어요') + ' · 따로따로 손실: ' + live.map(function(it, i){ return e(String(it.nm).slice(0, 12)) + ' ' + Math.round(O.ones[i] / O.tot * 100) + '%'; }).join(" · ") + '</small></div></div>'; });
      } else if (ov) ov.innerHTML = '';
    });
  }
  function save(L){ ls("elsmy", L); }
  function bindItems(el){
    [].forEach.call(el.querySelectorAll("[data-emx]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var id = b.getAttribute("data-emx"); save(my().filter(function(x){ return x.id !== id; })); emDraw(); }; });
    [].forEach.call(el.querySelectorAll("[data-emd]"), function(i){ i.addEventListener("click", function(ev){ ev.stopPropagation(); }); i.onchange = function(){ var id = i.getAttribute("data-emd"), v = i.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return; save(my().map(function(x){ if (x.id === id) x.base = v; return x; })); emDraw(); }; });
    [].forEach.call(el.querySelectorAll("[data-emt]"), function(b){ b.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); var id = b.getAttribute("data-emt"); save(my().map(function(x){ if (x.id === id){ x.base = kst(); x.virt = 1; } return x; })); emDraw(); }; });
  }
  function pickDraw(){
    var el = document.getElementById("empick"); if (!el) return;
    el.innerHTML = '<div class="loading">청약 중 상품 불러오는 중…</div>';
    eload().then(function(R){
      var el2 = document.getElementById("empick"); if (!el2) return;
      var C = cands(R), have = {}; my().forEach(function(x){ have[x.id] = 1; });
      var qv = EM.q.trim(), list = C.filter(function(c){ return !qv || (c.nm + c.iss + c.key).toLowerCase().indexOf(qv.toLowerCase()) >= 0; });
      el2.innerHTML = '<input class="em-q" id="emq" placeholder="🔎 상품·증권사·기초자산 (예: 삼성전자, KB)" value="' + e(EM.q) + '">' +
        '<div class="em-pl">' + (list.length ? list.slice(0, 40).map(function(c){ var q = parseKey(c.key);
          return '<div class="em-pr"><div><b>' + e(c.nm) + '</b><small>' + e(c.iss) + ' · ' + e(condTxt(q)) + (c.cpn != null ? ' · 연 ' + c.cpn + '%' : '') + ' · 청약 마감 ' + md(c.e) + '</small></div>' +
            (have[c.id] ? '<span class="mut">담음</span>' : '<button data-emp="' + e(c.id) + '">📌 담기</button>') + '</div>'; }).join("") : '<div class="empty">맞는 상품이 없어요 — 자료가 있는 기초자산(18개) 상품만 담을 수 있어요.</div>') + '</div>' +
        '<p class="note" style="margin:4px 0 0">기준일은 청약 마감 다음 평일(보통 발행일)로 잡아요 · 다르면 담은 뒤 고칠 수 있고 「오늘로」를 누르면 오늘 가입한 셈(🧪 가상)이에요.</p>';
      var qi = document.getElementById("emq");
      qi.addEventListener("click", function(ev){ ev.stopPropagation(); });
      qi.oninput = function(){ EM.q = qi.value; clearTimeout(pickDraw.t); pickDraw.t = setTimeout(function(){ pickDraw(); var n = document.getElementById("emq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); };
      [].forEach.call(el2.querySelectorAll("[data-emp]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var c = C.filter(function(x){ return x.id === b.getAttribute("data-emp"); })[0]; if (!c) return;
        var L = my(); L.push({id: c.id, nm: c.nm, iss: c.iss, key: c.key, base: nextWeekday(c.e || kst()), at: kst()}); save(L); EM.open = 0; emDraw(); }; });
    });
  }
  function elsMount(){
    var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== "els" || document.getElementById("elsmy")) return;
    if (root.querySelector(".loading") && !root.querySelector("#pdbody")) return;
    var box = document.createElement("section"); box.className = "card em no-clp"; box.id = "elsmy"; box.dataset.xc = "1";   // 길어도 「전체 보기」로 자르지 않음(simple.js)
    root.insertBefore(box, root.firstChild); emDraw();
  }
  // 펼친 미래에셋 ELS 카드 안에도 「📌 관제탑에 담기」
  function elsPinBtn(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot[data-k=els] .pd-e.on > .pd-x:not([data-em])"), function(p){
      p.setAttribute("data-em", "1"); var row = p.parentNode, o = __pdObj(row.dataset.x); o = o && o.o; if (!o || !o.isin) return;
      eload().then(function(R){ var k = R.rep && R.rep.by_id && R.rep.by_id[o.isin]; if (!k || (o.pp || 0) >= 100) return;
        var have = my().some(function(x){ return x.id === o.isin; }), b = document.createElement("button"); b.className = "em-add em-pin"; b.type = "button";
        b.textContent = have ? "📌 관제탑에 담겨 있어요" : "📌 내 ELS 관제탑에 담아 두기"; b.disabled = have;
        b.onclick = function(ev){ ev.stopPropagation(); var L = my(); if (!L.some(function(x){ return x.id === o.isin; })) L.push({id: o.isin, nm: o.n, iss: "미래에셋증권", key: k, base: nextWeekday(o.e || kst()), at: kst()}); save(L);
          b.textContent = "📌 담았어요 — 맨 위 관제탑"; b.disabled = true; var m = document.getElementById("elsmy"); if (m){ emDraw(); } };
        p.appendChild(b); });
    });
  }
  window.__elsMy = {monitor: monitor, simAt: simAt, parseKey: parseKey, align: align, sparse: sparse, epx: epx, load: eload};   // 검사용

  /* ═════════ ③ 👁 내 눈 vs 거름망 ═════════ */
  // 저장: eyeScr = {"2026-10-22": ["SYM", …]} (그날 「볼 만함」 누른 것) · 그날 목록 전체는 화면에서 본 screens.json 을 다시 받음
  function eyes(){ var o = ls("eyeScr"); return o && typeof o === "object" ? o : {}; }
  function shard(sym){ if (typeof window.opShard === "function") return opShard(sym); var h = 0x811c9dc5, b = new TextEncoder().encode(sym); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } var x = (h % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  var PSH = {};
  function pShard(sh){ if (!PSH[sh]) PSH[sh] = getJSON(OPD + "p/" + sh + ".json", {ttl: 3600e3}).catch(function(){ return {}; }); return PSH[sh]; }
  function lastPx(sym){ var c = /^\d{6}$/.test(sym) ? [sym + ".KS", sym + ".KQ"] : [sym];
    return Promise.all(c.map(function(s){ return pShard(shard(s)).then(function(j){ return j && j[s]; }); })).then(function(r){ for (var i = 0; i < r.length; i++) if (r[i]) return r[i]; return null; }); }
  var SCR = {};
  function scrDay(d){ if (!SCR[d]) SCR[d] = getJSON("archive/screen/" + d + "/screens.json", {ttl: 3600e3}).catch(function(){ SCR[d] = null; return null; }); return SCR[d]; }
  function rowsOf(D){ var m = {}; ["quiet", "lead", "hush", "triple"].forEach(function(k){ (D && D[k] || []).forEach(function(r){ if (r && r.s && r.c != null && !m[r.s]) m[r.s] = {s: r.s, n: r.n, c: +r.c}; }); }); return m; }
  function scoreDay(d, picks){
    var key = "eyeSc:" + d;
    return scrDay(d).then(function(D){
      if (!D) return null;
      var R = rowsOf(D), syms = Object.keys(R), sd = D.date || d;
      return Promise.all(syms.map(function(s){ return lastPx(s).then(function(p){ return p && p[0] > sd && p[1] > 0 ? {s: s, r: (p[1] / R[s].c - 1) * 100, at: p[0]} : null; }); })).then(function(rs){
        var P = {}; picks.forEach(function(s){ P[s] = 1; });
        var a = [], b = [], at = ""; rs.forEach(function(x){ if (!x) return; (P[x.s] ? a : b).push(x); if (x.at > at) at = x.at; });
        var avg = function(L){ if (!L.length) return null; var s = 0; L.forEach(function(x){ s += x.r; }); return s / L.length; };
        var all = a.concat(b), out = {d: d, n_pick: a.length, n_skip: b.length, pick: avg(a), skip: avg(b), all: avg(all), at: at,
          jump: b.filter(function(x){ return x.r >= 10; }).sort(function(x, y){ return y.r - x.r; }).slice(0, 2).map(function(x){ return {s: x.s, n: R[x.s].n, r: x.r}; })};
        ls(key, out); return out;
      });
    });
  }
  function eyeScores(){
    var E = eyes(), days = Object.keys(E).filter(function(d){ return (E[d] || []).length && d < kst(); }).sort().slice(-20);
    return Promise.all(days.map(function(d){ return scoreDay(d, E[d]); })).then(function(L){ return L.filter(function(x){ return x && x.n_pick; }); });
  }
  function eyeSum(L){
    var np = 0, sp = 0, sa = 0, na = 0, win = 0;
    L.forEach(function(x){ np += x.n_pick; sp += x.pick * x.n_pick; sa += x.all * (x.n_pick + x.n_skip); na += x.n_pick + x.n_skip; if (x.pick > x.all) win++; });
    return {days: L.length, np: np, pick: np ? sp / np : null, all: na ? sa / na : null, win: win};
  }
  var SCR_SEL = "";
  function scrMount(){
    if (!document.getElementById("scrk")) return;
    var root = document.getElementById("scrk").parentNode, date = curScrDate();
    if (!date) return;
    if (!root.querySelector("#eyesum")){ var s = document.createElement("div"); s.id = "eyesum"; s.className = "eye-sum"; root.insertBefore(s, root.firstChild); eyeTop(); }
    var E = eyes(), mine = E[date] || [];
    [].forEach.call(root.querySelectorAll(".list .st"), function(st){
      if (st.querySelector(".eye-b")) return;
      var a = st.querySelector(".nm a"), m = a && /openOP\('([^']+)'\)/.exec(a.getAttribute("href") || ""); if (!m) return;
      var sym = m[1].replace(/\\'/g, "'"), on = mine.indexOf(sym) >= 0, b = document.createElement("button");
      b.type = "button"; b.className = "eye-b" + (on ? " on" : ""); b.textContent = on ? "👁 볼 만함 ✓" : "👁 볼 만함"; b.dataset.s = sym;
      b.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); var E2 = eyes(), L = E2[date] || [], i = L.indexOf(sym);
        if (i >= 0) L.splice(i, 1); else L.push(sym); E2[date] = L; ls("eyeScr", E2);
        var on2 = L.indexOf(sym) >= 0; b.classList.toggle("on", on2); b.textContent = on2 ? "👁 볼 만함 ✓" : "👁 볼 만함"; eyeTop(); };
      st.appendChild(b);
    });
  }
  function curScrDate(){ var d = window.curDate; return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }   // 고른 날짜 칩(index.html 전역 curDate)
  function eyeTop(){
    var el = document.getElementById("eyesum"); if (!el) return;
    var date = curScrDate(), E = eyes(), today = (E[date] || []).length;
    var head = '<div class="eye-h"><b>👁 내 눈 vs 거름망</b><small>' + (date ? md(date) + ' 볼 만함 ' + today + '개 찍음' : '') + ' · 안 누른 건 넘긴 것으로 셈</small></div>';
    el.innerHTML = head + '<div class="eye-l mut">채점 불러오는 중…</div>';
    eyeScores().then(function(L){
      var el2 = document.getElementById("eyesum"); if (!el2) return;
      if (!L.length){ el2.innerHTML = head + '<div class="eye-l">카드마다 「👁 볼 만함」을 누르면 <b>다음 날 아침부터</b> 「찍은 것 vs 거름망 전체」를 그날 종가 → 가장 최근 종가로 채점해요.</div>'; return; }
      var x = L[L.length - 1], S = eyeSum(L), dif = x.pick - x.all, sd = S.pick - S.all;
      el2.innerHTML = head +
        '<div class="eye-l">' + md(x.d) + ' 찍은 <b>' + x.n_pick + '개</b> <b class="' + cl(x.pick) + '">' + sg(x.pick, 1) + '%</b> · 안 찍은 ' + x.n_skip + '개 ' + sg(x.skip, 1) + '%</div>' +
        '<div class="eye-k">내 눈이 거름망보다 <b class="' + cl(dif) + '">' + sg(dif, 1) + '%p</b></div>' +
        '<div class="eye-s">거름망 전체 ' + sg(x.all, 1) + '% · ' + md(x.d) + ' 종가 → ' + md(x.at) + ' 종가' + (L.length > 1 ? ' · 쌓인 ' + S.days + '일 ' + S.np + '개 평균 ' + sg(sd, 1) + '%p (' + S.win + '/' + S.days + '일 이김)' : '') + '</div>' +
        (x.jump.length ? '<div class="eye-j">😬 넘긴 것 중 크게 뛴 것: ' + x.jump.map(function(j){ return '<a href="javascript:openOP(\'' + e(j.s) + '\')">' + e(j.n || j.s) + '</a> ' + sg(j.r, 0) + '%'; }).join(" · ") + '</div>' : '');
    });
  }
  // 📊 성적표 카드
  function scoreMount(){
    var m = document.getElementById("main"); if (!m || document.getElementById("eyescore")) return;
    var anchor = m.querySelector(".sc-c"); if (!anchor || (window.cur && cur !== "score")) return;
    var E = eyes(); if (!Object.keys(E).some(function(d){ return (E[d] || []).length; })) return;
    var s = document.createElement("section"); s.className = "card sc-c"; s.id = "eyescore"; s.dataset.goto = "screen";
    s.innerHTML = '<div class="sc-h"><div><b>👁 내 눈 — 아침 거르기</b><small>내가 「볼 만함」 찍은 종목 vs 그날 거름망 전체</small></div></div><div class="eye-l mut">채점 불러오는 중…</div>';
    anchor.parentNode.insertBefore(s, anchor);
    eyeScores().then(function(L){
      var el = document.getElementById("eyescore"); if (!el) return;
      if (!L.length){ el.querySelector(".eye-l").innerHTML = '찍은 다음 날부터 채점돼요.'; return; }
      var S = eyeSum(L), d = S.pick - S.all;
      el.innerHTML = '<div class="sc-h"><div><b>👁 내 눈 — 아침 거르기</b><small>찍은 날 종가 → 가장 최근 종가 · ' + S.days + '일 · ' + S.np + '개</small></div><div class="eye-big"><b class="' + cl(d) + '">' + sg(d, 1) + '%p</b><small>거름망보다</small></div></div>' +
        '<div class="eye-dots">' + L.map(function(x){ var v = x.pick - x.all; return '<i class="' + (v > 0 ? "w" : "l") + '" title="' + x.d + ' ' + sg(v, 1) + '%p"></i>'; }).join("") + '</div>' +
        '<div class="eye-l mut">찍은 것 평균 ' + sg(S.pick, 1) + '% · 거름망 전체 ' + sg(S.all, 1) + '% · 이긴 날 ' + S.win + '/' + S.days + (S.days < 10 ? ' · 10일 쌓이기 전엔 참고만' : '') + '</div>';
    });
  }

  /* ── 붙이기 ── */
  var T = null;
  function tick(){ T = null; try { homePanic(); } catch(x) { console.warn(x); } try { elsMount(); elsPinBtn(); } catch(x) { console.warn(x); } try { scrMount(); } catch(x) { console.warn(x); } try { scoreMount(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".hmpn{cursor:pointer}.pnh-h b{display:block;font-size:var(--fs-h,17px);font-weight:800;word-break:keep-all}.pnh-h small{display:block;font-size:12px;color:var(--sub);margin:3px 0 4px;word-break:keep-all}" +
    ".pnh-r{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:baseline;padding:7px 0;border-top:1px solid var(--line);font-size:13.5px}.pnh-r>b{font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap}.pnh-r b.up{color:var(--up)}.pnh-r b.dn{color:var(--down)}" +
    ".pnh-r em{font-style:normal;font-size:11.5px;color:var(--sub);white-space:nowrap;text-align:right}.pnh-r em b{color:var(--text);font-size:11.5px}.pnh-b{grid-template-columns:auto 1fr}.pnh-b span{grid-column:1/-1;font-weight:700;word-break:keep-all}.pnh-b em{text-align:left;white-space:normal}.pnh-go{margin-top:6px;font-size:13px;font-weight:700;color:var(--acc,#7c9cff)}" +
    ".em-hd b{display:block;font-size:var(--fs-h,17px);font-weight:800}.em-hd small{display:block;font-size:12px;color:var(--sub);margin-top:2px}.em-in{font-size:13px;color:var(--sub);margin:8px 0;word-break:keep-all}.em-in b{color:var(--text)}" +
    ".em-add{display:block;width:100%;margin:8px 0 0;border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}.em-add:disabled{opacity:.7}" +
    ".em-q{width:100%;box-sizing:border-box;margin:8px 0 4px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:14px}" +
    ".em-pl{max-height:360px;overflow:auto}.em-pr{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}.em-pr b{font-size:13.5px}.em-pr small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all}" +
    ".em-pr button{flex:none;border:0;background:#f4a261;color:#111;border-radius:999px;padding:6px 11px;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer}" +
    ".em-it{margin:10px 0 0;padding:10px 0 0;border-top:1px solid var(--line)}.em-ih{display:flex;justify-content:space-between;gap:8px}.em-ih b{font-size:14.5px}.em-ih small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all}" +
    ".em-x{flex:none;border:0;background:none;color:var(--sub);font-size:16px;cursor:pointer;padding:0 4px;height:28px}.em-v{font-size:11px;padding:1px 6px;border-radius:999px;background:var(--panel2);color:var(--sub)}" +
    ".em-k{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.em-k>div{background:var(--panel2);border-radius:10px;padding:7px 4px;text-align:center}.em-k small,.em-k em{display:block;font-size:11px;color:var(--sub);font-style:normal;word-break:keep-all}" +
    ".em-k b{display:block;font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap;margin:1px 0}.em-k b.up,.em-ua b.up{color:var(--up)}.em-k b.dn,.em-ua b.dn{color:var(--down)}" +
    ".em-ua{display:grid;grid-template-columns:88px 1fr 58px;gap:8px;align-items:center;font-size:12.5px;margin:5px 0}.em-ua span i{font-style:normal;font-size:10px;color:#ff6b6b;display:block}.em-ua>b{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".pnh-now{background:rgba(255,80,80,.08);border-radius:8px;padding:6px 8px}.em-tr{position:relative;height:8px;border-radius:4px;background:var(--panel2)}.em-tr i{position:absolute;top:-3px;bottom:-3px;width:2px}.em-bar{background:#3fb950}.em-ki{background:#ff6b6b}.em-tr .em-dot{width:12px;height:12px;top:-2px;bottom:auto;border-radius:50%;margin-left:-6px;background:var(--text);border:2px solid var(--panel)}" +
    ".em-lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11px;color:var(--sub)}.em-lg i{display:inline-block;width:2px;height:10px;margin-right:4px;vertical-align:middle}" +
    ".em-hs{font-size:12.5px;margin:8px 0 0;word-break:keep-all}.em-hb{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1px;margin:5px 0 3px}.em-hb .a,.em-hl i.a{background:#3fb950}.em-hb .b,.em-hl i.b{background:#8fd19e}.em-hb .c,.em-hl i.c{background:#8a94a8}.em-hb .d,.em-hl i.d{background:#ff6b6b}" +
    ".em-hl{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:11.5px;color:var(--sub)}.em-hl b{color:var(--text)}.em-hl i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:3px}" +
    ".em-dt{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--sub);margin:8px 0 0}.em-dt input{font:inherit;font-size:13px;padding:3px 6px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.em-dt button{border:1px solid var(--line);background:none;color:var(--sub);border-radius:999px;padding:3px 8px;font:inherit;font-size:11.5px;cursor:pointer}" +
    ".em-l{font-size:13px;margin:6px 0 0;word-break:keep-all}.em-ok{color:#3fb950}" +
    ".em-ov{display:flex;gap:10px;align-items:center;margin:10px 0 0;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,#f4a261 12%,var(--panel2));font-size:12.5px;word-break:keep-all}.em-ov small{display:block;color:var(--sub);font-size:11.5px;margin-top:2px}" +
    ".em-ovb{flex:none;text-align:center;min-width:54px}.em-ovb b{display:block;font-size:24px;font-variant-numeric:tabular-nums}.em-ovb small{margin:0}" +
    ".eye-b{display:block;margin:8px 0 0 auto;border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:3px 9px;font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}.eye-b.on{background:#7ee0b5;color:#0b2;border-color:transparent;font-weight:800;color:#063}" +
    ".eye-sum{margin:0 0 10px;padding:10px 12px;border-radius:14px;background:var(--panel)}.eye-h b{font-size:15px}.eye-h small{display:block;font-size:11.5px;color:var(--sub)}.eye-l{font-size:13px;margin-top:5px;word-break:keep-all}.eye-s{font-size:11.5px;color:var(--sub);margin-top:2px;word-break:keep-all}.eye-l b.up,.eye-k b.up,.eye-big b.up{color:var(--up)}.eye-l b.dn,.eye-k b.dn,.eye-big b.dn{color:var(--down)}" +
    ".eye-k{margin-top:4px;font-size:14px;font-weight:700}.eye-j{margin-top:4px;font-size:12px;color:var(--sub)}.eye-big{margin-left:auto;text-align:right}.eye-big b{display:block;font-size:24px;font-variant-numeric:tabular-nums}.eye-big small{font-size:11px;color:var(--sub)}" +
    ".eye-dots{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0 2px}.eye-dots i{width:10px;height:10px;border-radius:50%}.eye-dots i.w{background:#3fb950}.eye-dots i.l{background:#ff6b6b}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
