/* CH Investing — 🧭 국면 신호판 (나침반 맨 위): 선행지표 20개로 상승/하락 국면 읽기 */
(function(){
  var e = V.e, P = PL, X = P.X, card = P.card;
  var ICON = {1: "🟢", 0: "⚪", "-1": "🔴"}, WORD = {1: "좋음", 0: "중립", "-1": "경고"};
  function ic(st){ return st == null ? "▫️" : ICON[String(st)]; }
  function col(score){ return score >= 15 ? V.UP : score <= -15 ? V.DN : "#c9a227"; }
  function mini(vals, color, w, h){
    vals = (vals || []).filter(function(v){ return v != null && !isNaN(v); });
    if (vals.length < 3) return "";
    w = w || 80; h = h || 22;
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); if (hi === lo) hi = lo + 1;
    var pts = vals.map(function(v, i){ return (i / (vals.length - 1) * w).toFixed(1) + "," + (h - (v - lo) / (hi - lo) * (h - 2) - 1).toFixed(1); });
    return '<svg class="rg-mini" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><polyline points="' + pts.join(" ") + '" fill="none" stroke="' + (color || "#8a94a8") + '" stroke-width="1.6"/></svg>';
  }
  function gauge(score){
    var x = (score + 100) / 2;
    return '<div class="rg-g"><div class="rg-gb"><i style="left:' + x.toFixed(1) + '%;background:' + col(score) + '"></i></div><div class="rg-gl"><span>하락 경고</span><span>엇갈림</span><span>상승 우세</span></div></div>';
  }
  function histChart(hist){
    if (!hist || hist.length < 3) return '<p class="note">점수 흐름은 며칠 쌓이면 그려져요.</p>';
    var W = 330, H = 90, n = hist.length, X_ = function(i){ return 8 + i / (n - 1) * (W - 16); }, Y_ = function(v){ return H / 2 - v / 100 * (H / 2 - 6); };
    var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '"><line x1="8" x2="' + (W - 8) + '" y1="' + H / 2 + '" y2="' + H / 2 + '" stroke="#3a4255" stroke-dasharray="3 3"/>';
    s += '<line x1="8" x2="' + (W - 8) + '" y1="' + Y_(35) + '" y2="' + Y_(35) + '" stroke="' + V.UP + '" stroke-opacity=".25"/><line x1="8" x2="' + (W - 8) + '" y1="' + Y_(-35) + '" y2="' + Y_(-35) + '" stroke="' + V.DN + '" stroke-opacity=".25"/>';
    s += '<polyline points="' + hist.map(function(h, i){ return X_(i).toFixed(1) + "," + Y_(h[1]).toFixed(1); }).join(" ") + '" fill="none" stroke="#ffb84d" stroke-width="2.4"/>';
    hist.forEach(function(h, i){ s += '<circle cx="' + X_(i).toFixed(1) + '" cy="' + Y_(h[1]).toFixed(1) + '" r="3" fill="' + col(h[1]) + '" data-tip="' + e(h[0].slice(5) + " · " + (h[1] > 0 ? "+" : "") + h[1] + "점 · 🟢" + h[2] + " 🔴" + h[3]) + '"/>'; });
    s += '<text x="10" y="12" fill="#8a94a8" font-size="10">' + e(hist[0][0].slice(5)) + '</text><text x="' + (W - 10) + '" y="12" fill="#8a94a8" font-size="10" text-anchor="end">' + e(hist[n - 1][0].slice(5)) + '</text></svg>';
    return s;
  }
  function row(s){
    var st = s.st, hist = s.hist || [];
    var right = '<span class="rg-v">' + e(s.val || "") + '</span>' + (hist.length ? mini(hist, st === 1 ? V.UP : st === -1 ? V.DN : "#8a94a8") : "");
    var body = '<p>' + e(s.mean || "") + '</p>' +
      (s.rows ? '<div class="rg-ctry">' + s.rows.map(function(x){ return '<span class="' + (x.st === 1 ? "up" : x.st === -1 ? "dn" : "") + '">' + x.flag + ' ' + (x.v != null ? x.v + (x.u != null ? x.u : "%") : x.gap != null ? (x.gap > 0 ? "+" : "") + x.gap + "%" : x.st == null ? "–" : (x.st === 1 ? "위" : "아래")) + (x.fired ? ' <b>발동 ' + e(x.fired) + '</b>' : '') + (x.note ? ' <em>' + e(x.note) + '</em>' : '') + '</span>'; }).join("") + '</div>' : '') +
      '<div class="rg-meta">' + (s.lead ? '<span>⏱ 앞서는 정도: ' + e(s.lead) + '</span>' : '') + (s.rule ? '<span>📏 ' + e(s.rule) + '</span>' : '') + (s.src ? '<span>📎 ' + e(s.src) + '</span>' : '') + '</div>';
    return '<details class="rg-r ' + (st === 1 ? "g" : st === -1 ? "r" : st === 0 ? "n" : "x") + '"><summary><span class="rg-i">' + ic(st) + '</span><span class="rg-n">' + e(s.name) + (s.w > 1 ? ' <small>중요</small>' : '') + '</span>' + right + '</summary>' + body + '</details>';
  }
  function board(R){
    if (!R || !R.sig) return "";
    var byg = {}; R.sig.forEach(function(s){ (byg[s.grp] = byg[s.grp] || []).push(s); });
    var reds = R.sig.filter(function(s){ return s.st === -1; }), greens = R.sig.filter(function(s){ return s.st === 1; });
    var h = '<div class="rg-head"><div class="rg-score" style="color:' + col(R.score) + '">' + (R.score > 0 ? "+" : "") + R.score + '<small>점</small></div><div class="rg-lab"><b>' + e(R.label) + '</b><span>🟢 ' + R.n_green + ' · ⚪ ' + (R.n_total - R.n_green - R.n_red) + ' · 🔴 ' + R.n_red + ' <em>' + e((R.updated || "").slice(5)) + '</em></span></div></div>' +
      gauge(R.score) + '<p class="rg-verdict">' + e(R.verdict) + '</p>';
    if (reds.length) h += '<div class="rg-tags"><b class="dn">경고</b>' + reds.map(function(s){ return '<span>' + e(s.name) + '</span>'; }).join("") + '</div>';
    if (greens.length) h += '<div class="rg-tags"><b class="up">좋음</b>' + greens.map(function(s){ return '<span>' + e(s.name) + '</span>'; }).join("") + '</div>';
    if (R.changes && R.changes.length) h += '<div class="rg-chg">🔔 달라진 것: ' + R.changes.map(function(c){ return e(c.name) + ' ' + ic(c.from) + '→' + ic(c.to); }).join(" · ") + '</div>';
    h += '<div class="sub2">점수 흐름 <span class="mut">+35 위 상승 우세 · −35 아래 하락 경고</span></div>' + histChart(R.hist);
    (R.groups || []).forEach(function(g){
      var L = byg[g[0]]; if (!L || !L.length) return;
      var gs = L.filter(function(s){ return s.st != null; });
      var sum = gs.reduce(function(a, s){ return a + s.st * s.w; }, 0), wsum = gs.reduce(function(a, s){ return a + s.w; }, 0) || 1, gsc = Math.round(sum / wsum * 100);
      h += '<div class="rg-grp"><div class="rg-gh"><b>' + e(g[1]) + '</b><span style="color:' + col(gsc) + '">' + (gsc > 0 ? "+" : "") + gsc + '</span></div>' + L.map(row).join("") + '</div>';
    });
    h += '<p class="note">선행지표를 종류별로 하나씩 골라 겹치지 않게 20개. 🟢 +1 · 🔴 −1 (「중요」표시는 2배) → 가중 평균 ×100. 줄을 누르면 뜻·기준·출처가 보여요. 어느 하나만 보면 다 틀린 적이 있어요 — 같은 방향으로 여럿이 모일 때가 신호예요.' + (R.errors && R.errors.length ? ' <em class="mut">오늘 못 받은 자료 ' + R.errors.length + '개</em>' : '') + '</p>';
    return card("🧭 국면 신호판 <span class='mut'>시장이 어느 국면으로 가나 · 선행지표 " + R.n_total + "개</span>", h, "", "rgboard");
  }
  window.CPREG = function(el){
    X("regime.json").then(function(R){
      if (!R){ el.innerHTML = ""; return; }
      el.innerHTML = board(R);
    });
  };
})();
