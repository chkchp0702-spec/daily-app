/* 🎛 ELS 내 맘대로 설계기 — 10/20 A10/20-1 (사용자 「1,2 둘 다 실행」)
   🛍 상품 → 🎯 ELS → 「🎛 설계」: 기초자산(최대 3개)·첫/마지막 상환 조건·낙인(KI)·만기를 손가락으로 바꾸면
   「2006년부터 매 거래일 가입했다면」 결과가 휴대폰에서 바로 다시 계산됨(els_replay.py replay() 와 같은 규칙을 JS 로).
   자료: archive/x/els_px/index.json + <코드>.json (els_replay.py 가 7일마다 · 기초자산 종가 일봉)
   맨 아래: 지금 청약 중인 상품(미래에셋 + DART 전 증권사) 중 이 조건에 가장 가까운 것 3개(조건·연 수익률·과거 재생).
   원칙: 과거 계산 · 미래 보장 아님 · 사라는 말 없음 · 연 수익률(쿠폰)은 시장이 정하므로 설계기는 숫자를 지어내지 않고 비슷한 실제 상품의 값만 보여 줌. */
(function(){
  var PX = {}, IDX = null, IDXW = null, ALL = null, ALLW = null;
  var ST = {ua: ["KOSPI200", "S&P500", "EUROSTOXX50"], f: 85, l: 70, ki: 45, mat: 3, cyc: 6, prev: null, last: null, ms: 0};
  try { var sv = JSON.parse(localStorage.getItem("elsdz") || "null"); if (sv && sv.ua) ["ua", "f", "l", "ki", "mat"].forEach(function(k){ if (sv[k] !== undefined) ST[k] = sv[k]; }); } catch(x) {}
  function keep(){ try { localStorage.setItem("elsdz", JSON.stringify({ua: ST.ua, f: ST.f, l: ST.l, ki: ST.ki, mat: ST.mat})); } catch(x) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var GRP = [["지수", ["KOSPI200", "S&P500", "EUROSTOXX50", "NIKKEI225", "HSCEI", "NASDAQ100"]], ["🇰🇷 종목", ["삼성전자", "SK하이닉스", "현대차", "한국전력"]], ["🇺🇸 종목", ["테슬라", "엔비디아", "팔란티어", "마이크론", "인텔", "AMD", "애플", "브로드컴"]]];
  var LAB = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LAB[n] || n; }
  var B5 = function(){ return Math.floor(Date.now() / 3600e3); };

  function idx(){ if (!IDXW) IDXW = getJSON("archive/x/els_px/index.json?" + B5(), {ttl: 3600e3}).then(function(j){ IDX = j && j.assets ? j : {assets: {}}; return IDX; }).catch(function(){ IDX = {assets: {}, err: 1}; return IDX; }); return IDXW; }
  function px(n){
    if (PX[n]) return PX[n];
    var a = IDX && IDX.assets[n]; if (!a) return Promise.resolve(null);
    PX[n] = getJSON("archive/x/els_px/" + a.f + "?" + (IDX.updated || "").replace(/\D/g, ""), {ttl: 864e5}).then(function(j){
      if (!j || !j.dd) return null;
      var t0 = Date.parse(j.d0 + "T00:00:00Z") / 864e5, d = new Int32Array(j.dd.length), c = new Float64Array(j.c.length), t = t0;
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d[i] = t; c[i] = j.c[i]; }
      return {d: d, c: c};
    }).catch(function(){ return null; });
    return PX[n];
  }
  function all(){ if (!ALLW) ALLW = getJSON("archive/x/els_all.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ ALL = j || {items: []}; return ALL; }).catch(function(){ ALL = {items: []}; return ALL; }); return ALLW; }

  /* ── 재생(els_replay.py replay 와 같은 규칙) ── */
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function addM(t, m){ var x = new Date(t * 864e5), y = x.getUTCFullYear(), mo = x.getUTCMonth() + m, dd = x.getUTCDate();
    var ny = y + Math.floor(mo / 12), nm = ((mo % 12) + 12) % 12, last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
    return Date.UTC(ny, nm, Math.min(dd, last)) / 864e5; }
  function lb(a, v){ var lo = 0, hi = a.length; while (lo < hi){ var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
  function sparse(arr){ var n = arr.length, K = [arr], k = 1; while ((1 << k) <= n){ var p = K[k - 1], q = new Float64Array(n - (1 << k) + 1), h = 1 << (k - 1); for (var i = 0; i < q.length; i++) q[i] = p[i] < p[i + h] ? p[i] : p[i + h]; K.push(q); k++; } return K; }
  function rmin(K, a, b){ var k = 31 - Math.clz32(b - a + 1), p = K[k]; var x = p[a], y = p[b - (1 << k) + 1]; return x < y ? x : y; }
  function bars(){ var n = Math.round(ST.mat * 12 / ST.cyc), h = Math.ceil(n / 2), out = [];
    for (var i = 0; i < n; i++) out.push(i < h ? ST.f : Math.round((ST.f - (ST.f - ST.l) * (i - h + 1) / (n - h)) / 5) * 5);
    return out; }
  function replay(series, names, br, cyc, ki){
    // 공통 거래일
    var base = series[0], m = series.length, D = [], C = names.map(function(){ return []; });
    var ptr = series.map(function(){ return 0; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true, vals = [base.c[i]];
      for (var a = 1; a < m; a++){ var s = series[a]; while (ptr[a] < s.d.length && s.d[ptr[a]] < t) ptr[a]++; if (ptr[a] >= s.d.length || s.d[ptr[a]] !== t){ ok = false; break; } vals.push(s.c[ptr[a]]); }
      if (!ok) continue;
      D.push(t); for (var a2 = 0; a2 < m; a2++) C[a2].push(vals[a2]);
    }
    var T = D.length, n = br.length; if (T < 500) return null;
    var Cf = C.map(function(x){ return Float64Array.from(x); }), K = Cf.map(sparse), last = D[T - 1];
    var S = []; for (var s0 = 0; s0 < T; s0++){ if (addM(D[s0], cyc * n) <= last) S.push(s0); else break; }
    if (S.length < 200) return null;
    var Ns = S.length, done = new Int8Array(Ns).fill(-1), endPos = new Int32Array(Ns), lastRatio = new Float64Array(Ns), firstArg = new Int8Array(Ns).fill(-1);
    for (var j = 0; j < Ns; j++){
      var s = S[j];
      for (var k = 0; k < n; k++){
        var p = Math.min(lb(D, addM(D[s], cyc * (k + 1))), T - 1), w = Infinity, wa = 0;
        for (var a3 = 0; a3 < m; a3++){ var r = Cf[a3][p] / Cf[a3][s]; if (r < w){ w = r; wa = a3; } }
        if (k === 0 && w < br[0] / 100) firstArg[j] = wa;
        if (done[j] < 0 && w >= br[k] / 100){ done[j] = k; }
        if (k === n - 1){ endPos[j] = p; lastRatio[j] = w; }
        if (done[j] >= 0 && k > 0) break;
      }
    }
    var kiT = 0, nFail = 0, nLoss = 0, lossSum = 0, lossMin = 0, yrs = {}, cum = [], kiFlag = new Uint8Array(Ns);
    for (var j2 = 0; j2 < Ns; j2++){
      if (done[j2] >= 0) continue;
      nFail++;
      var s2 = S[j2], e2 = endPos[j2], touched = false;
      if (ki != null){ for (var a4 = 0; a4 < m; a4++){ if (rmin(K[a4], s2, e2) / Cf[a4][s2] < ki / 100){ touched = true; break; } } }
      if (touched){ kiT++; kiFlag[j2] = 1; }
      var lossy = ki != null ? touched : true;
      if (lossy){ nLoss++; var lr = (lastRatio[j2] - 1) * 100; lossSum += lr; if (lr < lossMin) lossMin = lr; var y = day2s(D[s2]).slice(0, 4); yrs[y] = (yrs[y] || 0) + 1; }
    }
    for (var k2 = 0; k2 < n; k2++){ var c = 0; for (var j3 = 0; j3 < Ns; j3++) if (done[j3] >= 0 && done[j3] <= k2) c++; cum.push(Math.round(c / Ns * 1000) / 10); }
    var out = {n: Ns, from: day2s(D[S[0]]).slice(0, 7), to: day2s(D[S[Ns - 1]]).slice(0, 7), k: cum, cyc: cyc,
      mat_ok: Math.round((nFail - nLoss) / Ns * 1000) / 10, loss: Math.round(nLoss / Ns * 1000) / 10,
      loss_avg: nLoss ? Math.round(lossSum / nLoss * 10) / 10 : null, loss_worst: nLoss ? Math.round(lossMin * 10) / 10 : null,
      loss_yrs: Object.keys(yrs).sort(function(a, b){ return yrs[b] - yrs[a]; }).slice(0, 4)};
    if (ki != null) out.ki_touch = Math.round(kiT / Ns * 1000) / 10;
    if (m > 1){ var f1 = 0, cnt = names.map(function(){ return 0; }); for (var j4 = 0; j4 < Ns; j4++) if (firstArg[j4] >= 0){ f1++; cnt[firstArg[j4]]++; }
      if (f1){ out.worst = {}; names.forEach(function(nm, i){ if (cnt[i]) out.worst[lab(nm)] = Math.round(cnt[i] / f1 * 100); }); } }
    return out;
  }

  /* ── 가까운 실제 상품 ── */
  function parseKey(key){ var p = String(key).split("|"); return {ua: p[0].split("+"), bars: p[1].split("-").map(Number), cyc: +p[2], ki: p[3] === "none" ? null : +p[3], pp: p[4] === "pp"}; }
  function near(){
    var API = window.__elsApi; if (!API) return [];
    var R = API.rep(), D = API.D(); if (!R || !R.by_id) return [];
    var today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), C = [];
    (D && D.els || []).forEach(function(x){ var k = R.by_id[x.isin]; if (k && (x.pp || 0) < 100) C.push({key: k, n: x.n, iss: "미래에셋증권", cpn: x.cpn, e: x.e, me: 1}); });
    (ALL && ALL.items || []).forEach(function(x){ var k = R.by_id[x.id]; if (k && x.cpn != null && (x.e || "9999") >= today && x.kind !== "ELB" && !x.nolos && !/미래에셋/.test(x.iss || "")) C.push({key: k, n: x.nm, iss: (x.iss || "").replace(/주식회사|\(주\)/g, "").trim(), cpn: x.cpn, e: x.e}); });
    var my = bars(), mine = ST.ua.slice().sort();
    C.forEach(function(c){ var q = parseKey(c.key); if (q.pp){ c.d = 1e9; return; }
      var inter = q.ua.filter(function(u){ return mine.indexOf(u) >= 0; }).length, sym = q.ua.length + mine.length - 2 * inter;
      c.q = q; c.d = sym * 15 + Math.abs(q.bars[0] - my[0]) + Math.abs(q.bars[q.bars.length - 1] - my[my.length - 1]) + Math.abs((q.ki || 0) - (ST.ki || 0)) * 0.6 + Math.abs(q.bars.length * q.cyc - ST.mat * 12) / 3 + Math.abs(q.cyc - ST.cyc); });
    C.sort(function(a, b){ return a.d - b.d || (b.cpn || 0) - (a.cpn || 0); });
    var seen = {}; return C.filter(function(c){ if (c.d >= 1e9 || seen[c.key + c.iss]) return false; seen[c.key + c.iss] = 1; return true; }).slice(0, 3);
  }

  /* ── 화면 ── */
  function seg(id, items, on){ return '<div class="seg2 dz-seg" data-dz="' + id + '">' + items.map(function(x){ return '<button' + (String(x[0]) === String(on) ? ' class="on"' : '') + ' data-v="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>'; }
  function head(){
    var A = IDX.assets || {};
    var chips = GRP.map(function(g){ return '<div class="dz-g"><span class="mut">' + g[0] + '</span>' + g[1].filter(function(n){ return A[n]; }).map(function(n){ var on = ST.ua.indexOf(n) >= 0, y = (A[n].from || "").slice(0, 4);
      return '<button class="dz-ua' + (on ? " on" : "") + '" data-ua="' + e(n) + '">' + e(lab(n)) + (y > "2007" ? '<small>' + y + '~</small>' : '') + '</button>'; }).join("") + '</div>'; }).join("");
    var b = bars();
    return '<div class="dz-sec"><div class="dz-t">① 기초자산 <span class="mut">최대 3개 · 여럿이면 가장 못한 것 기준</span></div>' + chips + '</div>' +
      '<div class="dz-sec"><div class="dz-t">② 상환 조건 <span class="mut">6개월마다 처음 값의 몇 % 위면 끝나나</span></div>' +
        '<label class="dz-sl"><span>첫 상환 <b id="dzfv">' + ST.f + '%</b></span><input type="range" id="dzf" min="70" max="100" step="5" value="' + ST.f + '"></label>' +
        '<label class="dz-sl"><span>마지막 <b id="dzlv">' + ST.l + '%</b></span><input type="range" id="dzl" min="50" max="100" step="5" value="' + ST.l + '"></label>' +
        '<div class="dz-lad" id="dzlad">' + ladder(b) + '</div></div>' +
      '<div class="dz-sec"><div class="dz-t">③ 낙인(KI) <span class="mut">중간에 한 번이라도 이 아래로 가면 만기 손실</span></div>' + seg("ki", [["", "없음"], [50, "50"], [45, "45"], [40, "40"], [35, "35"], [30, "30"]], ST.ki == null ? "" : ST.ki) + '</div>' +
      '<div class="dz-sec"><div class="dz-t">④ 만기</div>' + seg("mat", [[1, "1년"], [2, "2년"], [3, "3년"]], ST.mat) + '</div>';
  }
  function ladder(b){ return '조건 <b>' + b.join("-") + '</b>' + (ST.ki != null ? ' · KI <b>' + ST.ki + '</b>' : ' · 노낙인') + ' · ' + ST.mat + '년 · 6개월마다'; }
  function delta(cur, prev){
    if (!cur || !prev) return "";
    var d1 = cur.k[0] - prev.k[0], dl = (cur.loss || 0) - (prev.loss || 0);
    var f = function(v, good){ if (Math.abs(v) < 0.5) return '<span class="mut">그대로</span>'; var g = good ? v > 0 : v < 0; return '<b class="' + (g ? "dz-good" : "dz-bad") + '">' + (v > 0 ? "+" : "−") + Math.abs(v).toFixed(0) + '%p</b>'; };
    return '<div class="dz-dl">방금 바꾸기 전보다 · 첫 상환 ' + f(d1, true) + ' · 손실로 끝 ' + f(dl, false) + '</div>';
  }
  function big(st){
    if (!st) return "";
    var loss = st.loss || 0, first = st.k[0];
    return '<div class="dz-big"><div><small>6개월 만에 끝</small><b>' + first.toFixed(0) + '%</b></div><div><small>결국 상환</small><b>' + st.k[st.k.length - 1].toFixed(0) + '%</b></div><div><small>손실로 끝</small><b class="' + (loss >= 1 ? "dn" : "") + '">' + (loss < 0.5 && st.loss_avg != null ? "1% 미만" : loss.toFixed(0) + "%") + '</b></div></div>';
  }
  function result(){
    var API = window.__elsApi;
    if (!ST.ua.length) return '<div class="empty">기초자산을 하나 이상 골라 주세요.</div>';
    if (!ST.last) return '<div class="loading">20년 치 재생 계산 중…</div>';
    if (ST.last.err) return '<div class="empty">' + e(ST.last.err) + '</div>';
    var st = ST.last.st;
    return big(st) + delta(st, ST.prev) + (API ? API.repBand(st, true) : "") + '<p class="note dz-ms">휴대폰에서 ' + st.n.toLocaleString() + '번 가입을 ' + (ST.ms < 1000 ? ST.ms.toFixed(0) + "ms" : (ST.ms / 1000).toFixed(1) + "초") + ' 만에 다시 셈 · 연 수익률(쿠폰)은 시장이 정해서 여기서 지어내지 않아요 — 아래 비슷한 실제 상품의 값을 보세요.</p>';
  }
  function nearHtml(){
    var API = window.__elsApi; if (!API) return "";
    if (!API.rep() || !ALL) return '<div class="loading">청약 중 상품과 견주는 중…</div>';
    var L = near(); if (!L.length) return '<p class="note">지금 청약 중인 상품 중 과거 재생이 된 비슷한 상품이 없어요.</p>';
    return L.map(function(c){ var q = c.q, st = (API.rep().stats || {})[c.key];
      var dd = c.e ? Math.round((new Date(c.e + "T23:59:59+09:00") - Date.now()) / 864e5) : null;
      return '<div class="dz-nr' + (c.me ? " me" : "") + '"><div class="dz-nh"><b>' + e(c.iss) + '</b><b class="up">연 ' + (+c.cpn).toFixed(2) + '%</b></div>' +
        '<div class="dz-nb">' + e(q.ua.map(lab).join(" · ")) + ' · ' + e(q.bars.join("-")) + (q.ki ? ' · KI ' + q.ki : ' · 노낙인') + ' · ' + (q.cyc === 12 ? '1년' : q.cyc + '개월') + '마다' + (dd != null ? ' · 청약 ' + (dd <= 0 ? '오늘 마감' : 'D-' + dd) : '') + '</div>' +
        (st ? API.repMini(st) : '') + '</div>'; }).join("");
  }
  function draw(box){
    if (!box) return;
    if (!IDX){ box.innerHTML = '<div class="loading">기초자산 일봉 불러오는 중…</div>'; idx().then(function(){ draw(document.getElementById("elsdz")); }); return; }
    if (!Object.keys(IDX.assets || {}).length){ box.innerHTML = '<section class="card"><h3>🎛 ELS 내 맘대로 설계기</h3><div class="empty">기초자산 일봉 자료 준비 중 — 상품 작업이 한 번 돈 뒤 채워져요.</div></section>'; return; }
    ST.ua = ST.ua.filter(function(n){ return IDX.assets[n]; });
    box.innerHTML = '<section class="card dz" data-xc="1"><h3>🎛 ELS 내 맘대로 설계기</h3><p class="dz-sub">조건을 바꾸면 2006년부터 매 거래일 가입한 셈으로 휴대폰에서 바로 다시 계산해요.</p>' + head() +
      '<div class="dz-res" id="dzres">' + result() + '</div></section>' +
      '<section class="card" data-xc="1"><h3>🎯 지금 청약 중 · 이 조건과 가장 가까운 상품 <span class="mut">미래에셋 + 전 증권사(DART)</span></h3><div id="dznear">' + nearHtml() + '</div>' +
      '<p class="note" style="margin:6px 0 0">기초자산이 같을수록, 첫·마지막 상환 조건과 KI·만기가 가까울수록 위에 와요. 과거 재생은 그 상품 조건 그대로 돌린 값이에요. 비교용일 뿐 가입하라는 뜻이 아니에요.</p></section>';
    bind(box);
    if (!ST.last && ST.ua.length) calc();
    if (!ALL) all().then(function(){ var n = document.getElementById("dznear"); if (n) n.innerHTML = nearHtml(); });
  }
  var RUN = 0;
  function calc(){
    var my = ++RUN, names = ST.ua.slice();
    if (!names.length){ ST.last = null; paint(); return; }
    Promise.all(names.map(px)).then(function(ss){
      if (my !== RUN) return;
      if (ss.some(function(x){ return !x; })){ ST.last = {err: "일봉을 못 받은 기초자산이 있어요. 잠시 뒤 다시 열어 주세요."}; paint(); return; }
      var t0 = performance.now(), st = null;
      try { st = replay(ss, names, bars(), ST.cyc, ST.ki); } catch(x) { st = null; }
      ST.ms = performance.now() - t0;
      if (ST.last && ST.last.st) ST.prev = ST.last.st;
      ST.last = st ? {st: st} : {err: "같이 거래된 날이 너무 적어 재생할 수 없어요(상장이 늦은 종목끼리일 때)."};
      paint();
    });
  }
  function paint(){
    var r = document.getElementById("dzres"); if (r) r.innerHTML = result();
    var n = document.getElementById("dznear"); if (n) n.innerHTML = nearHtml();
    var l = document.getElementById("dzlad"); if (l) l.innerHTML = ladder(bars());
  }
  function bind(box){
    [].forEach.call(box.querySelectorAll("[data-ua]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var n = b.getAttribute("data-ua"), i = ST.ua.indexOf(n);
      if (i >= 0) ST.ua.splice(i, 1); else { if (ST.ua.length >= 3) ST.ua.shift(); ST.ua.push(n); }
      [].forEach.call(box.querySelectorAll("[data-ua]"), function(x){ x.classList.toggle("on", ST.ua.indexOf(x.getAttribute("data-ua")) >= 0); });
      keep(); calc(); }; });
    [].forEach.call(box.querySelectorAll("[data-dz]"), function(g){ [].forEach.call(g.children, function(b){ b.onclick = function(ev){ ev.stopPropagation();
      [].forEach.call(g.children, function(x){ x.classList.toggle("on", x === b); });
      var k = g.getAttribute("data-dz"), v = b.getAttribute("data-v");
      if (k === "ki") ST.ki = v === "" ? null : +v; else ST.mat = +v;
      keep(); paint(); calc(); }; }); });
    var f = document.getElementById("dzf"), l = document.getElementById("dzl");
    var sync = function(){ ST.f = +f.value; if (+l.value > ST.f){ l.value = ST.f; } ST.l = +l.value;
      document.getElementById("dzfv").textContent = ST.f + "%"; document.getElementById("dzlv").textContent = ST.l + "%"; var ld = document.getElementById("dzlad"); if (ld) ld.innerHTML = ladder(bars()); };
    [f, l].forEach(function(x){ if (!x) return; x.oninput = sync; x.onchange = function(){ sync(); keep(); calc(); };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
  }
  window.elsDesign = function(box){ draw(box); };

  var css = document.createElement("style");
  css.textContent =
    ".dz .dz-sec{margin:10px 0 0}.dz-t{font-size:13px;font-weight:700;margin-bottom:5px}.dz-t .mut{font-weight:400;font-size:11.5px}" +
    ".dz-g{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:4px 0}.dz-g>.mut{font-size:11px;min-width:42px}" +
    ".dz-ua{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}.dz-ua small{margin-left:3px;font-size:10px;color:var(--sub)}" +
    ".dz-ua.on{background:#f4a261;color:#111;border-color:transparent;font-weight:700}.dz-ua.on small{color:#333}" +
    ".dz-sl{display:flex;align-items:center;gap:10px;margin:4px 0;font-size:13px}.dz-sl span{min-width:92px}.dz-sl input{flex:1;accent-color:#f4a261;height:28px}" +
    ".dz-lad{font-size:12.5px;color:var(--sub);margin-top:2px}.dz-lad b{color:var(--text)}" +
    ".dz-seg button{min-width:44px}" +
    ".dz-res{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".dz-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.dz-big>div{background:var(--panel2);border-radius:10px;padding:8px 6px;text-align:center}.dz-big small{display:block;font-size:11px;color:var(--sub)}.dz-big b{font-size:22px;font-variant-numeric:tabular-nums}.dz-big b.dn{color:#ff6b6b}" +
    ".dz-dl{font-size:12px;color:var(--sub);margin:6px 0 0}.dz-good{color:#3fb950}.dz-bad{color:#ff6b6b}.dz-sub{margin:-2px 0 4px;font-size:12px;color:var(--sub)}" +
    ".dz-ms{margin:6px 0 0;font-size:11px}" +
    ".dz-nr{padding:8px 0;border-top:1px solid var(--line)}.dz-nr:first-child{border-top:0}.dz-nr.me .dz-nh b:first-child:after{content:' 🟠';font-size:11px}.dz-nh{display:flex;justify-content:space-between;font-size:14px}.dz-nb{font-size:12px;color:var(--sub);margin-top:2px}";
  document.head.appendChild(css);
})();
