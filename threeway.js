/* ⚖️ 같은 돈, 세 갈래 길 — 채권·ELS·포트 3년 경주 · 10/21 A10/21-3 (사용자 「다 좋다 다 진행해」)
   🛍 상품 탭(채권·펀드·ELS) 맨 위 카드 하나: 같은 투자금을 3년 동안
     🇰🇷 채권 = 지금 파는 「매우 낮은 위험」 국채·공사채 중 남은 만기가 3년에 가장 가까운 것의 매수수익률(세전)로 → 금액 한 점
     🎯 ELS = 🎛 ELS 설계기 조건 그대로, 2006년부터 매 거래일 가입한 셈(els_design.js 엔진) × 그 조건에 가장 가까운 실제 청약 상품의 연 수익률
            일찍 끝나면 남은 기간은 위 채권 금리로 굴린 셈 · 만기에 손실이 아니면 원금만(더미 쿠폰은 안 넣음 — 보수적으로)
     💼 포트 = 🎛 포트 설계기 비중 + 💼 기본 규칙(port_design.js 엔진), 2008년부터 모든 3년(756거래일) 구간 · 달러 기준(환율 빼고)
   → 3년 뒤 금액의 범위(최악 · 열에 하나 · 가운데 · 열에 아홉 · 최고)를 같은 눈금에 나란히.
   투자금은 💼 포트 주문서와 같은 칸(portSet.amt)을 씀. 원칙: 실제 상품 값만 · 지어내지 않음 · 과거 계산 · 보장 아님 · 세금·수수료 전 · 사라는 말 없음. */
(function(){
  var H = 3, OPEN = 1, BOX = null, DATA = null, PORT = null, ELS = null, BUSY = 0;
  try { var o = localStorage.getItem("tw3open"); if (o != null) OPEN = +o; } catch(x) {}
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function getAmt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function setAmt(v){ try { var s = JSON.parse(localStorage.getItem("portSet") || "{}"); s.amt = v; localStorage.setItem("portSet", JSON.stringify(s)); } catch(x) {} }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 2).replace(/\.?0+$/, "") + "억" : Math.round(m).toLocaleString() + "만"; }
  function q(arr, p){ var i = (arr.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return arr[lo] + (arr[hi] - arr[lo]) * (i - lo); }
  function sum5(a){ a = a.slice().sort(function(x, y){ return x - y; }); return {min: a[0], p10: q(a, 0.1), p50: q(a, 0.5), p90: q(a, 0.9), max: a[a.length - 1], loss: a.filter(function(v){ return v < 0.9995; }).length / a.length * 100, n: a.length}; }

  function bond(D){
    var L = (D.krw || []).filter(function(r){ return /매우낮은/.test(r.risk || "") && (r.kind === "국채" || r.kind === "공사채·지방채") && r.buy > 0; })
      .map(function(r){ return {r: r, y: r.yrs + r.days / 365}; }).filter(function(x){ return x.y >= 2.5 && x.y <= 3.6; });
    L.sort(function(a, b){ return Math.abs(a.y - H) - Math.abs(b.y - H) || (a.r.kind === "국채" ? -1 : 1); });
    var b = L[0]; return b ? {name: b.r.name, kind: b.r.kind, y: b.r.buy, after: b.r.after, yrs: b.y, end: Math.pow(1 + b.r.buy / 100, H)} : null;
  }
  function portDist(){
    if (!window.__pdz) return Promise.resolve(null);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var c = __pdz.cfg(), w = __pdz.wts() || {SPY: .475, QQQ: .475, GLD: .05, BIL: 0};
      var r = __pdz.engine(A, w, {reg: c.reg, vol: c.vol, start: "2007-06-01"}); if (!r) return null;
      var N = r.nv.length, L = 756, ends = [];
      for (var i = 0; i + L < N; i++) ends.push(r.nv[i + L] / r.nv[i]);
      var s = sum5(ends); s.from = r.from; s.w = w; s.reg = c.reg; s.vol = c.vol; s.custom = !!__pdz.wts() && !(Math.abs(w.SPY - .475) < 1e-6 && Math.abs(w.QQQ - .475) < 1e-6 && Math.abs(w.GLD - .05) < 1e-6);
      return s;
    });
  }
  function elsDist(yb){
    var Z = window.__elsDz, API = window.__elsApi; if (!Z || !API) return Promise.resolve(null);
    return Promise.all([Z.ready(), API.load ? API.load() : null]).then(function(){ return Z.run(); }).then(function(st){
      if (!st || !st.raw) return {err: "설계기 조건으로 재생할 수 없어요(기초자산 일봉 부족)."};
      var nr = Z.near(), p = nr && nr[0]; if (!p || p.cpn == null) return {err: "이 조건과 비슷한 지금 청약 중 상품이 없어 연 수익률을 못 정해요 — 🎛 설계에서 조건을 바꿔 보세요."};
      var S = Z.st(), cyc = S.cyc, n = Z.bars().length, mat = n * cyc / 12, R = st.raw, cp = +p.cpn / 100, g = 1 + yb / 100, ends = [];
      for (var j = 0; j < R.done.length; j++){
        var k = R.done[j], amt, t;
        if (k >= 0){ t = (k + 1) * cyc / 12; amt = 1 + cp * t; }
        else { t = mat; var lossy = R.hasKi ? R.ki[j] : true; amt = lossy ? R.last[j] : 1; }
        ends.push(amt * Math.pow(g, Math.max(0, H - t)));
      }
      var s = sum5(ends); s.cpn = +p.cpn; s.iss = p.iss; s.pn = p.n; s.ua = S.ua.map(Z.lab).join("·"); s.br = Z.bars().join("-"); s.ki = S.ki; s.mat = mat; s.from = st.from;
      s.early = st.k[0]; return s;
    }).catch(function(){ return {err: "ELS 자료를 못 받았어요."}; });
  }

  function fan(rows, A){
    var lo = Infinity, hi = -Infinity;
    rows.forEach(function(r){ if (!r.s) return; if (r.s.min != null){ lo = Math.min(lo, r.s.min); hi = Math.max(hi, r.s.max); } else { lo = Math.min(lo, r.s.end); hi = Math.max(hi, r.s.end); } });
    lo = Math.min(lo, 1); hi = Math.max(hi, 1);
    var pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
    var W = 340, X = function(v){ return 8 + (W - 16) * (v - lo) / (hi - lo); }, rowH = 50, Hh = rows.length * rowH + 30;
    var g = '<line x1="' + X(1).toFixed(1) + '" x2="' + X(1).toFixed(1) + '" y1="4" y2="' + (Hh - 16) + '" class="t3-one"/><text x="' + X(1).toFixed(1) + '" y="' + (Hh - 4) + '" class="t3-gt" text-anchor="' + (X(1) < 50 ? "start" : "middle") + '">원금 ' + won(A) + '</text>';
    var tk = [], st = (hi - lo) > 2 ? 0.5 : 0.25;
    for (var v = Math.ceil(lo / st) * st; v <= hi; v += st){ if (Math.abs(v - 1) < 1e-9) continue; tk.push(v); }
    tk = tk.filter(function(v){ return Math.abs(X(v) - X(1)) > 46; });
    tk.forEach(function(v){ g += '<line x1="' + X(v).toFixed(1) + '" x2="' + X(v).toFixed(1) + '" y1="4" y2="' + (Hh - 18) + '" class="t3-gl"/><text x="' + X(v).toFixed(1) + '" y="' + (Hh - 4) + '" class="t3-gt" text-anchor="middle">' + won(A * v) + '</text>'; });
    rows.forEach(function(r, i){
      var y = 24 + i * rowH, s = r.s;
      g += '<text x="8" y="' + (y - 10) + '" class="t3-lb" fill="' + r.c + '">' + r.t + '</text>';
      if (!s) return;
      if (s.min == null){ g += '<path d="M' + X(s.end).toFixed(1) + ',' + (y - 7) + 'l7,7l-7,7l-7,-7z" fill="' + r.c + '"/><text x="' + (X(s.end) + 10).toFixed(1) + '" y="' + (y + 4) + '" class="t3-v" fill="' + r.c + '">' + won(A * s.end) + '</text>'; return; }
      g += '<line x1="' + X(s.min).toFixed(1) + '" x2="' + X(s.max).toFixed(1) + '" y1="' + y + '" y2="' + y + '" stroke="' + r.c + '" stroke-width="2" opacity=".55"/>' +
        '<rect x="' + X(s.p10).toFixed(1) + '" y="' + (y - 7) + '" width="' + Math.max(2, X(s.p90) - X(s.p10)).toFixed(1) + '" height="14" rx="7" fill="' + r.c + '" opacity=".35"/>' +
        '<line x1="' + X(s.min).toFixed(1) + '" x2="' + X(s.min).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" stroke="' + r.c + '" stroke-width="2"/><line x1="' + X(s.max).toFixed(1) + '" x2="' + X(s.max).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" stroke="' + r.c + '" stroke-width="2"/>' +
        '<circle cx="' + X(s.p50).toFixed(1) + '" cy="' + y + '" r="5.5" fill="' + r.c + '" stroke="var(--panel)" stroke-width="2"/>' +
        '<text x="' + X(s.p50).toFixed(1) + '" y="' + (y + 20) + '" class="t3-v" text-anchor="middle" fill="' + r.c + '">' + won(A * s.p50) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + Hh + '" class="t3-sv" role="img" aria-label="3년 뒤 금액 범위 비교">' + g + '</svg>';
  }
  function lane(ic, t, s, A, sub){
    if (!s) return '<div class="t3-l"><b>' + ic + ' ' + t + '</b><small class="mut">계산 중…</small></div>';
    if (s.err) return '<div class="t3-l"><b>' + ic + ' ' + t + '</b><small class="mut">' + e(s.err) + '</small></div>';
    if (s.min == null) return '<div class="t3-l"><b>' + ic + ' ' + t + ' <span>' + won(A * s.end) + '원</span></b><small>' + sub + '</small></div>';
    var tight = s.p90 - s.p10 < 0.005;
    return '<div class="t3-l"><b>' + ic + ' ' + t + ' <span>가운데 ' + won(A * s.p50) + '원</span></b>' +
      (tight ? '<small>열에 여덟 넘게가 <b>' + won(A * s.p50) + '</b> 언저리(일찍 끝나 같은 금액) · 최악 <b class="dn">' + won(A * s.min) + '</b> · 최고 ' + won(A * s.max) + ' · 3년 뒤 원금 밑 <b class="' + (s.loss >= 1 ? "dn" : "") + '">' + (s.loss < 0.5 && s.loss > 0 ? "1% 미만" : s.loss.toFixed(0) + "%") + '</b></small>' :
      '<small>열에 하나는 <b>' + won(A * s.p10) + '</b> 아래 · 열에 아홉은 <b>' + won(A * s.p90) + '</b> 아래 · 최악 <b class="dn">' + won(A * s.min) + '</b> · 최고 ' + won(A * s.max) + ' · 3년 뒤 원금 밑 <b class="' + (s.loss >= 1 ? "dn" : "") + '">' + (s.loss < 0.5 && s.loss > 0 ? "1% 미만" : s.loss.toFixed(0) + "%") + '</b></small>') +
      '<small class="mut">' + sub + '</small></div>';
  }
  function html(){
    var A = getAmt(), B = DATA ? bond(DATA) : null;
    if (!OPEN) return '<button class="t3-hd fold" data-t3t="1">⚖️ 같은 ' + won(A) + '원, 세 갈래 길 — 채권·ELS·포트 3년 뒤 <i class="fchev">▾</i></button>';
    var rows = [{c: "#3fb950", t: "🇰🇷 채권", s: B ? {end: B.end} : null}, {c: "#f4a261", t: "🎯 ELS", s: ELS && !ELS.err ? ELS : null}, {c: "#e9c46a", t: "💼 포트", s: PORT}];
    return '<button class="t3-hd fold open" data-t3t="1">⚖️ 같은 ' + won(A) + '원, 세 갈래 길 — 채권·ELS·포트 3년 뒤 <i class="fchev">▾</i></button>' +
      '<section class="card t3"><div class="t3-amt">투자금 ' + [1e7, 3e7, 5e7, 1e8].map(function(v){ return '<button data-t3a="' + v + '" class="' + (v === A ? "on" : "") + '">' + won(v) + '</button>'; }).join("") + '<small>💼 포트 주문서와 같은 칸</small></div>' +
      fan(rows, A) +
      '<div class="t3-key"><span><i class="d"></i>점 = 가운데</span><span><i class="b"></i>굵은 띠 = 열에 하나 ~ 열에 아홉</span><span><i class="w"></i>가는 선 = 최악 ~ 최고</span></div>' +
      lane("🇰🇷", "채권", B ? {end: B.end} : {err: "3년 안팎 「매우 낮은 위험」 채권을 못 찾았어요."}, A, B ? e(B.name) + ' · 남은 ' + B.yrs.toFixed(1) + '년 · 매수수익률 연 ' + B.y.toFixed(2) + '%(세후 ' + (B.after != null ? B.after.toFixed(2) + '%' : '–') + ') · 만기까지 들고 있으면 이 값에 거의 고정' : '') +
      lane("🎯", "ELS", ELS, A, ELS && !ELS.err ? '🎛 설계기 조건 ' + e(ELS.ua) + ' · ' + e(ELS.br) + (ELS.ki != null ? ' · KI ' + ELS.ki : ' · 노낙인') + ' · 연 ' + ELS.cpn.toFixed(2) + '%(가장 가까운 실제 상품 · ' + e(ELS.iss) + ') · ' + e(ELS.from) + '~ 가입 ' + ELS.n.toLocaleString() + '번 · 일찍 끝나면 남은 기간은 채권 금리로' : '') +
      lane("💼", "포트", PORT, A, PORT ? (PORT.custom ? '🎛 포트 설계기 비중' : '💼 기본 포트 비중') + ' · ' + (PORT.reg ? '200일선 방어' : '방어 끔') + ' · ' + (PORT.vol ? '변동성 맞춤' : '맞춤 끔') + ' · ' + PORT.from.slice(0, 7).replace("-", ".") + '~ 모든 3년 구간 ' + PORT.n.toLocaleString() + '개 · 달러 기준(환율 빼고)' : '') +
      '<p class="note t3-n">셋은 위험이 달라요 — 띠가 넓을수록 결과가 크게 갈렸다는 뜻. 과거 계산이고 미래를 보장하지 않아요 · 세금·수수료 전 · 비교용일 뿐 가입·매수하라는 뜻이 아니에요. 조건은 🎯 ELS › 🎛 설계, 💼 포트 › 🎛 포트 설계기에서 바꾸면 여기도 따라 바뀌어요.</p></section>';
  }
  function paint(){
    if (!BOX || !document.body.contains(BOX)) return;
    BOX.innerHTML = html();
    [].forEach.call(BOX.querySelectorAll("[data-t3t]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); OPEN = OPEN ? 0 : 1; try { localStorage.setItem("tw3open", OPEN); } catch(x) {} paint(); if (OPEN) calc(); }; });
    [].forEach.call(BOX.querySelectorAll("[data-t3a]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); setAmt(+b.getAttribute("data-t3a")); paint(); }; });
  }
  function calc(){
    if (!OPEN || BUSY) return; BUSY = 1;
    var B = DATA && bond(DATA), yb = B ? B.y : 3.5;
    Promise.all([portDist(), elsDist(yb)]).then(function(r){ PORT = r[0]; ELS = r[1]; BUSY = 0; paint(); }, function(){ BUSY = 0; });
  }
  var T = null;
  window.__tw3 = function(){ if (!BOX || !OPEN) return; clearTimeout(T); T = setTimeout(function(){ ELS = null; calc(); }, 250); };   // 설계기에서 조건을 바꾸면
  window.threeWay = function(box, D){ BOX = box; DATA = D; paint(); calc(); };

  var css = document.createElement("style");
  css.textContent =
    ".t3-hd{margin:0 0 8px;display:flex;justify-content:space-between;align-items:center;width:100%;cursor:pointer;font-weight:700}.t3-hd .fchev{font-style:normal;transition:transform .15s}.t3-hd.open .fchev{transform:rotate(180deg)}" +
    ".t3-amt{display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:12.5px;margin:0 0 6px}.t3-amt button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer}.t3-amt button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:700}.t3-amt small{color:var(--sub);font-size:12.5px}" +
    ".t3-sv{width:100%;height:auto;display:block;margin:2px 0}.t3-gl{stroke:var(--line);stroke-width:1}.t3-one{stroke:var(--sub);stroke-width:1;stroke-dasharray:3 3}.t3-gt{fill:var(--sub);font-size:9.5px}.t3-v{font-size:12.5px;font-weight:700}.t3-lb{font-size:12.5px;font-weight:700}" +
    ".t3-key{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:12.5px;color:var(--sub);margin:0 0 6px}.t3-key i{display:inline-block;margin-right:4px;vertical-align:middle;background:var(--sub)}.t3-key i.d{width:8px;height:8px;border-radius:50%}.t3-key i.b{width:16px;height:7px;border-radius:4px;opacity:.5}.t3-key i.w{width:16px;height:2px}" +
    ".t3-l{padding:7px 0;border-top:1px solid var(--line);font-size:13px}.t3-l>b span{float:right;font-variant-numeric:tabular-nums}.t3-l small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.45}.t3-l small b{color:var(--text)}.t3-l small b.dn{color:var(--down)}.t3-n{margin:6px 0 0}";
  document.head.appendChild(css);
})();
