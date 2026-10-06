/* CH Investing — 3차 업그레이드 ①: 시황 · 고래 · 컵 · 갭 ("우아" 아이디어) */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt;
  var P = PL, X = P.X, card = P.card, chip = P.chip, pct = P.pct, opA = P.opA, kn = P.kn, md = P.md;
  function sheet(title){
    navPush({t: "go", key: cur, id: curDate}); closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button class="sh-x" onclick="goBack()">✕</button><b>' + title + '</b></div><div class="sh-body"><div class="loading">불러오는 중…</div></div>';
    document.body.appendChild(sh); document.body.classList.add("sheet-open"); updBack();
    return sh.querySelector(".sh-body");
  }
  window.PSHEET = sheet;
  // 여러 경로를 겹쳐 그리기: paths=[{vals, color, w, op}], band={lo, hi}, mark=x index, zero line
  function paths(list, opt){
    opt = opt || {};
    var W = 330, H = opt.h || 130, L = 6, R = 40, T = 8, B = 16;
    var all = [];
    list.forEach(function(p){ p.vals.forEach(function(v){ if (v != null && isFinite(v)) all.push(v); }); });
    if (opt.band) opt.band.lo.concat(opt.band.hi).forEach(function(v){ if (v != null) all.push(v); });
    if (all.length < 2) return '<div class="spark-empty">자료가 더 쌓이면 그려져요</div>';
    var lo = Math.min.apply(null, all.concat([0])), hi = Math.max.apply(null, all.concat([0])), r = (hi - lo) || 1; lo -= r * .06; hi += r * .06; r = hi - lo;
    var n = opt.n || Math.max.apply(null, list.map(function(p){ return p.vals.length; }).concat([2]));
    var x = function(i){ return L + i * (W - L - R) / Math.max(1, n - 1); }, y = function(v){ return T + (hi - v) / r * (H - T - B); };
    var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '">';
    s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" class="lc-z"/>';
    [hi - r * .06, lo + r * .06].forEach(function(v){ s += '<text x="' + (W - R + 4) + '" y="' + (y(v) + 3).toFixed(1) + '" class="lc-a">' + sgn(v, 0) + '%</text>'; });
    if (opt.band){ var pts = opt.band.hi.map(function(v, i){ return x(i).toFixed(1) + "," + y(v).toFixed(1); }).concat(opt.band.lo.map(function(v, i){ return [i, v]; }).reverse().map(function(q){ return x(q[0]).toFixed(1) + "," + y(q[1]).toFixed(1); }));
      s += '<polygon points="' + pts.join(" ") + '" fill="' + (opt.band.color || "#7c9cff") + '" opacity=".16"/>'; }
    if (opt.mark != null) s += '<line x1="' + x(opt.mark).toFixed(1) + '" x2="' + x(opt.mark).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#e8ecf4" stroke-opacity=".4" stroke-dasharray="3 3"/>';
    list.forEach(function(p){ var q = []; p.vals.forEach(function(v, i){ if (v != null && isFinite(v)) q.push(x(i).toFixed(1) + "," + y(v).toFixed(1)); });
      if (q.length > 1) s += '<polyline points="' + q.join(" ") + '" fill="none" stroke="' + p.color + '" stroke-width="' + (p.w || 2) + '" stroke-opacity="' + (p.op || 1) + '" stroke-linejoin="round"/>'; });
    if (opt.xl) s += '<text x="' + L + '" y="' + (H - 3) + '" class="lc-a">' + e(opt.xl[0]) + '</text><text x="' + (W - R) + '" y="' + (H - 3) + '" class="lc-a" text-anchor="end">' + e(opt.xl[1]) + '</text>';
    return s + '</svg>';
  }
  function avgPath(list, n){
    var out = [], lo = [], hi = [];
    for (var i = 0; i < n; i++){
      var v = list.map(function(p){ return p[i]; }).filter(function(z){ return z != null && isFinite(z); }).sort(function(a, b){ return a - b; });
      if (v.length < Math.max(3, list.length * .4)){ break; }
      out.push(v.reduce(function(a, b){ return a + b; }, 0) / v.length); lo.push(v[Math.floor(v.length * .25)]); hi.push(v[Math.floor(v.length * .75)]);
    }
    return {avg: out, lo: lo, hi: hi};
  }
  function scatter(pts, opt){
    // pts=[{x, y, label, code, color}]
    opt = opt || {};
    if (pts.length < 3) return '<div class="spark-empty">점이 더 쌓이면 그려져요</div>';
    var W = 330, H = opt.h || 220, L = 30, R = 10, T = 10, B = 26;
    var xs = pts.map(function(p){ return p.x; }), ys = pts.map(function(p){ return p.y; });
    var x0 = opt.x0 != null ? opt.x0 : Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys.concat([0])), y1 = Math.max.apply(null, ys.concat([0]));
    var rx = (x1 - x0) || 1, ry = (y1 - y0) || 1; x0 -= rx * .05; x1 += rx * .05; y0 -= ry * .08; y1 += ry * .08; rx = x1 - x0; ry = y1 - y0;
    var X_ = function(v){ return L + (v - x0) / rx * (W - L - R); }, Y_ = function(v){ return T + (y1 - v) / ry * (H - T - B); };
    var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '">';
    if (y0 < 0 && y1 > 0) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y_(0).toFixed(1) + '" y2="' + Y_(0).toFixed(1) + '" class="lc-z"/>';
    if (opt.qx != null) s += '<line x1="' + X_(opt.qx).toFixed(1) + '" x2="' + X_(opt.qx).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" class="lc-g"/>';
    if (opt.qy != null) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y_(opt.qy).toFixed(1) + '" y2="' + Y_(opt.qy).toFixed(1) + '" class="lc-g"/>';
    if (opt.trend){ var n = pts.length, mx = xs.reduce(function(a, b){ return a + b; }, 0) / n, my = ys.reduce(function(a, b){ return a + b; }, 0) / n;
      var sxy = 0, sxx = 0; pts.forEach(function(p){ sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) * (p.x - mx); }); var b = sxx ? sxy / sxx : 0;
      s += '<line x1="' + X_(x0).toFixed(1) + '" y1="' + Y_(my + b * (x0 - mx)).toFixed(1) + '" x2="' + X_(x1).toFixed(1) + '" y2="' + Y_(my + b * (x1 - mx)).toFixed(1) + '" stroke="#ffb84d" stroke-width="2" stroke-dasharray="5 4"/>'; }
    pts.forEach(function(p){ s += '<a href="javascript:openOP(\'' + e(p.code || "").replace(/'/g, "") + '\')"><circle cx="' + X_(p.x).toFixed(1) + '" cy="' + Y_(p.y).toFixed(1) + '" r="' + (p.r || 4.5) + '" fill="' + (p.color || (p.y >= 0 ? V.UP : V.DN)) + '" fill-opacity=".8" stroke="#121826" data-tip="' + e(p.label || "") + '"/></a>'; });
    s += '<text x="' + L + '" y="' + (H - 6) + '" class="lc-a">' + e(opt.xn || "") + ' →</text><text x="2" y="' + (T + 8) + '" class="lc-a">' + e(opt.yn || "") + '</text></svg>';
    return s;
  }
  window.PVIZ = {paths: paths, avgPath: avgPath, scatter: scatter};

  /* ======================= 🌐 시황 ======================= */
  function man(v){ var m = Math.round(v / 1e4), ok = Math.floor(m / 1e4), r_ = m % 1e4; return (ok ? ok + "억 " : "") + (r_ ? r_.toLocaleString() + "만" : "") + "원"; }
  function perfCard(el){
    X("market_perf.json").then(function(M_){
      if (!M_ || !M_.port || M_.port.length < 2){ return; }
      var last = function(a){ return a[a.length - 1] - 100; };
      var h = V.lines([{name: "내 배분", color: "#ffb84d", vals: M_.port}, {name: "코스피", color: "#7c9cff", vals: M_.kospi}, {name: "S&P500", color: "#8a94a8", vals: M_.sp500}], M_.dates, {h: 170, nodots: 1}) +
        '<div class="x4"><div><small>내 배분</small><b class="' + cls(last(M_.port)) + '">' + pct(last(M_.port)) + '</b></div><div><small>코스피</small><b class="' + cls(last(M_.kospi)) + '">' + pct(last(M_.kospi)) + '</b></div><div><small>S&P500</small><b class="' + cls(last(M_.sp500)) + '">' + pct(last(M_.sp500)) + '</b></div>' +
        '<div><small>1억이면 지금</small><b class="' + cls(last(M_.port)) + '">' + man(1e8 * M_.port[M_.port.length - 1] / 100) + '</b></div></div>' +
        '<div class="sub2">자산별 기여</div>' + V.dbars(M_.groups.map(function(g){ return {label: e(g.name) + ' <span class="mut">' + g.pct + '% · ' + e(g.syms.join(" ")) + '</span>', v: g.ret || 0}; }));
      el.innerHTML = card("🏆 리포트대로 굴렸다면 <span class='mut'>" + md(M_.start) + "부터 · 1억 기준</span>", h +
        '<p class="note">리포트의 지금 배분을 ' + md(M_.start) + '부터 그대로 들고 있었다고 가정했어요(중간 비중 변경은 반영 안 함). 각 자산은 리포트에 적힌 대표 ETF·종목 평균, 현금은 SGOV. 수수료·환율 제외.</p>');
    });
  }
  function kickCard(el){
    X("market_perf.json").then(function(M_){
      var K = (M_ && M_.kicks) || []; if (!K.length) return;
      el.innerHTML = card("⚡ 킥 되감기 <span class='mut'>그날 킥 → 그 뒤 시장</span>", '<div class="kr">' + K.map(function(k){
        return '<div class="kr-i"><div class="row"><b>' + md(k.date) + '</b><span class="mut">그 뒤 코스피 <b class="' + cls(k.kospi) + '">' + pct(k.kospi) + '</b> · S&P <b class="' + cls(k.sp500) + '">' + pct(k.sp500) + '</b> · 미 10년 <b>' + (k.us10y_bp == null ? "–" : sgn(k.us10y_bp) + "bp") + '</b></span></div>' +
          '<p>' + e(k.title) + '</p><small>→ ' + e(k.so || "") + '</small></div>'; }).join("") + '</div>' +
        '<p class="note">킥을 쓴 날부터 지금까지 시장이 어떻게 갔는지 자동으로 붙여요. 킥이 방향을 맞혔는지 스스로 채점해 보는 용도.</p>');
    });
  }
  function boughtCard(el, it){
    X("market_x.json").then(function(MX){
      var chips = MX && MX.chips && MX.chips[it.id]; if (!chips || !chips.length) return;
      var d0 = it.id.slice(0, 10);
      Promise.all(chips.slice(0, 16).map(function(c){ return V.price(c[0]).then(function(p){ return {c: c, p: p}; }); })).then(function(R){
        var rows = R.filter(function(r){ return r.p && r.p[6] && r.p[6].length > 3; }).map(function(r){
          var wk = Math.max(0, Math.round(P.dDiff(r.p[0], d0) / 7)), arr = r.p[6], i = Math.max(0, arr.length - 1 - wk), p0 = arr[i];
          return {c: r.c, ret: p0 ? (r.p[1] / p0 - 1) * 100 : null, p0: p0, now: r.p[1]}; }).filter(function(r){ return r.ret != null; });
        if (!rows.length) return;
        rows.sort(function(a, b){ return b.ret - a.ret; });
        var avg = rows.reduce(function(a, r){ return a + r.ret; }, 0) / rows.length;
        el.innerHTML = card("💸 그날 샀다면 <span class='mut'>" + md(d0) + " 리포트에 나온 종목 → 지금</span>", '<div class="x2"><div><small>평균</small><b class="' + cls(avg) + '">' + pct(avg) + '</b></div><div><small>오른 종목</small><b>' + rows.filter(function(r){ return r.ret > 0; }).length + ' / ' + rows.length + '</b></div></div>' +
          V.dbars(rows.map(function(r){ return {label: '<b>' + e(r.c[1]) + '</b> <span class="mut">' + e(V.cd(r.c[0])) + '</span>', v: r.ret, attr: ' onclick="openOP(\'' + e(r.c[0]) + '\')" style="cursor:pointer"', tip: e(r.c[1]) + " " + fmt(r.p0) + " → " + fmt(r.now)}; })) +
          '<p class="note">리포트 날짜가 들어간 주의 주간 종가로 샀다고 계산했어요 (대략값). 리포트가 이름을 언급한 것이지 추천한 건 아니에요.</p>');
      });
    });
  }
  function rateMap(el){
    X("market_perf.json").then(function(MP){
      var R = ((MP && MP.ratemap) || []).map(function(r){ return {d: r[0], y: r[1], k: r[2]}; }).filter(function(r){ return r.k && r.y; });
      if (R.length < 5){ return; }
      R = R.slice(-40);
      var W = 330, H = 230, L = 34, Rr = 10, T = 10, B = 26;
      var xs = R.map(function(r){ return r.y; }), ys = R.map(function(r){ return r.k; });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var rx = (x1 - x0) || .1, ry = (y1 - y0) || 1; x0 -= rx * .08; x1 += rx * .08; y0 -= ry * .08; y1 += ry * .08; rx = x1 - x0; ry = y1 - y0;
      var X_ = function(v){ return L + (v - x0) / rx * (W - L - Rr); }, Y_ = function(v){ return T + (y1 - v) / ry * (H - T - B); };
      var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '">';
      for (var i = 1; i < R.length; i++){ var op = .2 + .8 * i / R.length;
        s += '<line x1="' + X_(R[i - 1].y).toFixed(1) + '" y1="' + Y_(R[i - 1].k).toFixed(1) + '" x2="' + X_(R[i].y).toFixed(1) + '" y2="' + Y_(R[i].k).toFixed(1) + '" stroke="#7c9cff" stroke-opacity="' + op.toFixed(2) + '" stroke-width="2.4"/>'; }
      R.forEach(function(r, i){ var last = i === R.length - 1; s += '<circle cx="' + X_(r.y).toFixed(1) + '" cy="' + Y_(r.k).toFixed(1) + '" r="' + (last ? 6 : 2.5) + '" fill="' + (last ? "#ffb84d" : "#7c9cff") + '" data-tip="' + e("<b>" + r.d + "</b><br>미 10년 " + r.y.toFixed(2) + "% · 코스피 " + Math.round(r.k).toLocaleString()) + '"/>'; });
      s += '<text x="' + X_(R[0].y).toFixed(1) + '" y="' + (Y_(R[0].k) - 7).toFixed(1) + '" class="lc-a">' + md(R[0].d) + '</text><text x="' + X_(R[R.length - 1].y).toFixed(1) + '" y="' + (Y_(R[R.length - 1].k) - 9).toFixed(1) + '" class="lc-a" fill="#ffb84d">지금</text>';
      s += '<text x="' + L + '" y="' + (H - 6) + '" class="lc-a">미 10년 금리 ' + x0.toFixed(2) + '% → ' + x1.toFixed(2) + '%</text><text x="2" y="' + (T + 8) + '" class="lc-a">코스피</text></svg>';
      var a = R[0], b = R[R.length - 1], dy = b.y - a.y, dk = (b.k / a.k - 1) * 100;
      el.innerHTML = card("🗺️ 금리 한 장 지도 <span class='mut'>최근 " + R.length + "일 · 가로 = 미 10년, 세로 = 코스피</span>", s +
        '<p class="note">선이 오른쪽 아래로 가면 "금리 오르고 주식 내림", 오른쪽 위면 "금리 올라도 주식 오름". ' + md(a.d) + ' 이후 금리 ' + sgn(dy * 100, 0) + 'bp, 코스피 ' + pct(dk) + ' — ' +
        (dy > 0 && dk > 0 ? "금리를 이기고 올랐어요." : dy > 0 && dk < 0 ? "금리에 눌렸어요." : dy < 0 && dk > 0 ? "금리가 내리며 받쳐줬어요." : "금리가 내려도 못 올랐어요.") + ' 점을 누르면 날짜별 값.</p>');
    }).catch(function(){});
  }
  P.wrap("market", null, function(it, b){
    b.insertAdjacentHTML("afterbegin", '<div id="p4perf"></div><div id="p4map"></div><div id="p4kick"></div><div id="p4buy"></div>');
    perfCard($("p4perf")); rateMap($("p4map")); kickCard($("p4kick")); boughtCard($("p4buy"), it);
  });

  /* ======================= 🐋 고래 ======================= */
  var WHJ = null;
  function wh(){ return WHJ || (WHJ = X("whale_holdings.json")); }
  function copyCalc(el, W){
    var names = Object.keys(W.m).sort(function(a, b){ return (W.m[a].rank || 99) - (W.m[b].rank || 99); });
    el.innerHTML = card("🧮 고래 그대로 따라 사기 <span class='mut'>상위 15종목 비중대로</span>",
      '<select class="xsel" id="ccw">' + names.map(function(n){ return '<option>' + e(n) + '</option>'; }).join("") + '</select>' +
      '<div class="reqrow"><input id="ccamt" type="number" inputmode="numeric" placeholder="투자금 (원) 예: 10000000" value="' + (store.ccamt || "") + '"></div><button class="btn al-sub" id="ccgo" style="margin-top:8px">계산</button><div id="ccout"></div>');
    if (store.ccw && W.m[store.ccw]) $("ccw").value = store.ccw;
    $("ccgo").onclick = function(){
      var nm = $("ccw").value, amt = +$("ccamt").value; store.ccw = nm; store.ccamt = amt; save();
      if (!amt){ P.toast("투자금을 넣어 주세요"); return; }
      var m = W.m[nm], it = m.items.slice(0, 15), tw = it.reduce(function(a, x){ return a + x.w; }, 0);
      $("ccout").innerHTML = '<div class="loading">가격 받는 중…</div>';
      Promise.all([getJSON(OPD + "p/fx.json").catch(function(){ return {USD: 1350}; })].concat(it.map(function(x){ return V.price(x.t); }))).then(function(r){
        var fx = r[0].USD || 1350, used = 0;
        var rows = it.map(function(x, i){ var p = r[i + 1], won = amt * x.w / tw, pr = p ? p[1] * fx : null, n = pr ? Math.floor(won / pr) : 0; used += n * (pr || 0);
          return '<div class="xr">' + opA(x.t, '<b>' + e(x.nm) + '</b> <em class="tk">' + e(x.t) + '</em>') + '<span class="mut">' + (x.w / tw * 100).toFixed(1) + '%</span><b>' + (pr ? n.toLocaleString() + "주" : "가격 없음") + '</b><span class="mut">' + (pr ? fmtKRW(n * pr, "m") : "") + '</span></div>'; });
        $("ccout").innerHTML = '<div class="xt" style="margin-top:8px">' + rows.join("") + '</div><p class="note">살 수 있는 금액 ' + fmtKRW(used, "m") + ' · 남는 돈 ' + fmtKRW(amt - used, "m") + ' (1주 단위로 내림). 환율 1달러 = ' + Math.round(fx).toLocaleString() + '원. ' + e(m.q) + ' 13F 기준이라 지금 보유와 다를 수 있어요.</p>';
      });
    };
  }
  function overlapMap(el, W){
    var names = Object.keys(W.m).filter(function(n){ return W.m[n].items && W.m[n].items.length >= 5; }).slice(0, 40);
    var vec = {}; names.forEach(function(n){ var v = {}; W.m[n].items.forEach(function(x){ v[x.t] = x.w; }); vec[n] = v; });
    var sim = function(a, b){ var s = 0, A = vec[a], B = vec[b]; for (var t in A) if (B[t]) s += Math.min(A[t], B[t]); return s / 100; };
    var N = names.length, pos = names.map(function(_, i){ var a = i / N * Math.PI * 2; return [Math.cos(a) * 80, Math.sin(a) * 80]; });
    var S = []; for (var i = 0; i < N; i++){ S[i] = []; for (var j = 0; j < N; j++) S[i][j] = i === j ? 0 : sim(names[i], names[j]); }
    for (var it = 0; it < 400; it++){
      for (var i2 = 0; i2 < N; i2++){ var fx = 0, fy = 0;
        for (var j2 = 0; j2 < N; j2++){ if (i2 === j2) continue; var dx = pos[i2][0] - pos[j2][0], dy = pos[i2][1] - pos[j2][1], d = Math.sqrt(dx * dx + dy * dy) + .1;
          var rep = 2600 / (d * d), att = S[i2][j2] * d * .05; fx += dx / d * (rep - att); fy += dy / d * (rep - att); }
        fx -= pos[i2][0] * .01; fy -= pos[i2][1] * .01;
        pos[i2][0] += Math.max(-4, Math.min(4, fx)); pos[i2][1] += Math.max(-4, Math.min(4, fy)); }
    }
    var xs = pos.map(function(p){ return p[0]; }), ys = pos.map(function(p){ return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var W_ = 330, H_ = 360, X_ = function(v){ return 20 + (v - x0) / ((x1 - x0) || 1) * (W_ - 40); }, Y_ = function(v){ return 16 + (v - y0) / ((y1 - y0) || 1) * (H_ - 32); };
    var s = '<svg class="lc" viewBox="0 0 ' + W_ + ' ' + H_ + '">';
    for (var a = 0; a < N; a++) for (var b = a + 1; b < N; b++) if (S[a][b] >= .12) s += '<line x1="' + X_(pos[a][0]).toFixed(1) + '" y1="' + Y_(pos[a][1]).toFixed(1) + '" x2="' + X_(pos[b][0]).toFixed(1) + '" y2="' + Y_(pos[b][1]).toFixed(1) + '" stroke="#3dd6c6" stroke-opacity="' + Math.min(.8, S[a][b] * 1.5).toFixed(2) + '" stroke-width="' + (1 + S[a][b] * 6).toFixed(1) + '"/>';
    names.forEach(function(n, i){ var m = W.m[n], col = m.g === "ppl" ? "#ffb84d" : "#3dd6c6";
      var top = m.items.slice(0, 3).map(function(x){ return x.t; }).join(", ");
      var deg = S[i].filter(function(v){ return v >= .12; }).length, big = deg >= 3 || (m.rank || 99) <= 3;
      s += '<g data-mgr="' + e(n) + '" style="cursor:pointer" data-tip="' + e("<b>" + n + "</b><br>상위: " + top + "<br>1년 " + sgn(m.ret1y) + "%") + '"><circle cx="' + X_(pos[i][0]).toFixed(1) + '" cy="' + Y_(pos[i][1]).toFixed(1) + '" r="' + (big ? 7 : 5) + '" fill="' + col + '" stroke="#121826" stroke-width="2"/>' +
        (big ? '<text x="' + (X_(pos[i][0]) + 9).toFixed(1) + '" y="' + (Y_(pos[i][1]) + 3).toFixed(1) + '" class="rotl">' + e(n.split(/\s/)[0].slice(0, 9)) + '</text>' : '') + '</g>'; });
    s += '</svg>';
    var pairs = []; for (var a2 = 0; a2 < N; a2++) for (var b2 = a2 + 1; b2 < N; b2++) pairs.push([S[a2][b2], names[a2], names[b2]]);
    pairs.sort(function(p, q){ return q[0] - p[0]; });
    el.innerHTML = card("🕸️ 고래 겹침 지도 <span class='mut'>보유 종목이 많이 겹칠수록 가깝게</span>", s +
      '<div class="lg"><span><i style="background:#3dd6c6"></i>기관</span><span><i style="background:#ffb84d"></i>유명인</span><span class="mut">선 굵기 = 겹치는 비중</span></div>' +
      '<div class="sub2">가장 닮은 고래 짝</div><div class="xt">' + pairs.slice(0, 5).map(function(p){ return '<div class="xr"><a data-mgr="' + e(p[1]) + '"><b>' + e(p[1]) + '</b></a><span class="mut">↔</span><a data-mgr="' + e(p[2]) + '"><b>' + e(p[2]) + '</b></a><b class="up" style="margin-left:auto">' + Math.round(p[0] * 100) + '%</b></div>'; }).join("") + '</div>' +
      '<p class="note">숫자 = 두 고래 포트폴리오에서 같은 종목에 겹쳐 있는 비중. 이름은 많이 연결된 고래만 표시 — 다른 점은 눌러 보면 이름이 나와요. 한 무리에 모인 고래들은 같은 이야기에 베팅 중이에요.</p>');
  }
  function wstatsCard(el, WP, W){
    var S = WP && WP.wstats; if (!S || !Object.keys(S).length) return;
    var ks = Object.keys(S).sort(function(a, b){ return (S[b].avg || 0) - (S[a].avg || 0); });
    var draw = function(n){ var x = S[n], mx = Math.max.apply(null, x.bins.concat([1]));
      var lab = ["−30%↓", "−30~−10", "−10~0", "0~10", "10~30", "30~100", "100%↑"];
      return '<div class="bins">' + x.bins.map(function(c, i){ return '<div><i style="height:' + (c / mx * 70).toFixed(0) + 'px;background:' + (i < 3 ? V.DN : V.UP) + '"></i><b>' + c + '</b><small>' + lab[i] + '</small></div>'; }).join("") + '</div>' +
        '<div class="x4"><div><small>새로 산 종목</small><b>' + x.n + '개</b></div><div><small>지금까지 평균</small><b class="' + cls(x.avg) + '">' + pct(x.avg) + '</b></div><div><small>플러스 비율</small><b>' + x.win + '%</b></div><div><small>1년 뒤</small><b class="' + cls(x.avg1y) + '">' + (x.avg1y == null ? "–" : pct(x.avg1y)) + '</b><em>' + (x.n1y || 0) + '건</em></div></div>'; };
    el.innerHTML = card("🎯 고래가 새로 산 종목, 그 뒤 성적 <span class='mut'>공시일에 샀다면</span>",
      V.dbars(ks.slice(0, 12).map(function(n){ var x = S[n]; return {label: '<b>' + e(n) + '</b> <span class="mut">' + x.n + '건 · 플러스 ' + x.win + '%</span>', v: x.avg, attr: ' data-ws="' + e(n) + '" style="cursor:pointer"'}; })) +
      '<select class="xsel" id="wssel" style="margin-top:10px">' + ks.map(function(n){ return '<option>' + e(n) + '</option>'; }).join("") + '</select><div id="wsbox">' + draw(ks[0]) + '</div>' +
      '<p class="note">고래가 새로 담은 종목을 13F 공시일(분기말 +46일)에 샀다고 보고 지금까지 수익률을 모았어요. 막대를 누르거나 골라서 분포 보기. 이 고래 말을 얼마나 믿을지의 근거.</p>');
    $("wssel").onchange = function(){ $("wsbox").innerHTML = draw($("wssel").value); };
    [].forEach.call(el.querySelectorAll("[data-ws]"), function(b){ b.onclick = function(){ $("wssel").value = b.dataset.ws; $("wsbox").innerHTML = draw(b.dataset.ws); }; });
  }
  function duelCard(el, W){
    var names = Object.keys(W.m).sort(function(a, b){ return (W.m[a].rank || 99) - (W.m[b].rank || 99); });
    var opt = names.map(function(n){ return '<option>' + e(n) + '</option>'; }).join("");
    el.innerHTML = card("⚔️ 고래 vs 고래", '<div class="g2s"><select class="xsel" id="wd1">' + opt + '</select><select class="xsel" id="wd2">' + opt + '</select></div><div id="wdout"></div>');
    $("wd2").selectedIndex = Math.min(1, names.length - 1);
    var draw = function(){
      var a = W.m[$("wd1").value], b = W.m[$("wd2").value], na = $("wd1").value, nb = $("wd2").value;
      var A = {}, B = {}; a.items.forEach(function(x){ A[x.t] = x; }); b.items.forEach(function(x){ B[x.t] = x; });
      var both = Object.keys(A).filter(function(t){ return B[t]; });
      var soldA = {}; (a.sold || []).forEach(function(x){ soldA[x.t] = 1; }); var soldB = {}; (b.sold || []).forEach(function(x){ soldB[x.t] = 1; });
      var opp = [];
      Object.keys(A).forEach(function(t){ if (soldB[t] || (B[t] && ((A[t].chg === "new" || A[t].chg === "up") && B[t].chg === "down"))) opp.push([t, na + " 삼", nb + (soldB[t] ? " 정리" : " 줄임")]); });
      Object.keys(B).forEach(function(t){ if (soldA[t] || (A[t] && ((B[t].chg === "new" || B[t].chg === "up") && A[t].chg === "down"))) opp.push([t, nb + " 삼", na + (soldA[t] ? " 정리" : " 줄임")]); });
      var row = function(l, va, vb, c){ return '<tr><td>' + l + '</td><td class="' + (c ? cls(va) : "") + '">' + (va == null ? "–" : c ? pct(va) : va) + '</td><td class="' + (c ? cls(vb) : "") + '">' + (vb == null ? "–" : c ? pct(vb) : vb) + '</td></tr>'; };
      $("wdout").innerHTML = '<table class="cmpt"><tr><th></th><th>' + e(na) + '</th><th>' + e(nb) + '</th></tr>' + row("1년 수익률", a.ret1y, b.ret1y, 1) + row("그룹 안 순위", (a.rank || "–") + "위 (" + (a.g === "ppl" ? "유명인" : "기관") + ")", (b.rank || "–") + "위 (" + (b.g === "ppl" ? "유명인" : "기관") + ")") + row("보유 종목", a.n + "개", b.n + "개") + row("이번 분기 신규", (a.n_new || 0) + "개", (b.n_new || 0) + "개") + row("가장 큰 비중", a.items[0] ? a.items[0].t + " " + a.items[0].w.toFixed(0) + "%" : "–", b.items[0] ? b.items[0].t + " " + b.items[0].w.toFixed(0) + "%" : "–") + '</table>' +
        '<div class="sub2">🤝 둘 다 가진 종목 <span class="mut">' + both.length + '개</span></div><div class="cp-sts">' + (both.length ? both.slice(0, 12).map(function(t){ return opA(t, '<span class="cp-st"><b>' + e(A[t].nm) + '</b><span class="mut">' + A[t].w.toFixed(1) + '% / ' + B[t].w.toFixed(1) + '%</span></span>'); }).join("") : '<span class="mut">없음</span>') + '</div>' +
        '<div class="sub2">⚔️ 서로 반대로 베팅 <span class="mut">한쪽은 사고 한쪽은 팔았음</span></div><div class="xt">' + (opp.length ? opp.slice(0, 8).map(function(o){ return '<div class="xr">' + opA(o[0], '<b>' + e(o[0]) + '</b>') + '<span class="up">' + e(o[1]) + '</span><span class="dn">' + e(o[2]) + '</span></div>'; }).join("") : '<p class="note" style="margin:0">이번 분기엔 반대로 간 종목이 없어요.</p>') + '</div>';
    };
    $("wd1").onchange = draw; $("wd2").onchange = draw; draw();
  }
  P.wrap("whale", null, function(it, b){
    b.insertAdjacentHTML("afterbegin", '<div id="p4cc"></div><div id="p4ws"></div><div id="p4ov"></div><div id="p4wd"></div>');
    Promise.all([wh(), X("whale_plus.json")]).then(function(r){ var W = r[0]; if (!W || !W.m) return;
      copyCalc($("p4cc"), W); wstatsCard($("p4ws"), r[1], W); overlapMap($("p4ov"), W); duelCard($("p4wd"), W); });
  });

  /* ======================= ☕ 컵 ======================= */
  P.wrap("cup", function(it, a, o){
    if (it.files.indexOf("cards.json") < 0) return;
    Promise.all([getJSON(file("cup", it.id, "cards.json")), X("perf_cup.json")]).then(function(r){
      var d = r[0], Pf = r[1], sig = (Pf && Pf.signals) || [], h = "";
      var by = {}; (d.ath || []).concat(d.top || []).forEach(function(c){ by[c.code] = c; });
      // ① 닮은 컵의 그 뒤 경로 — 카드마다
      var past = sig.filter(function(s){ return s.path && s.path.length >= 15 && s.f_depth != null && s.path.every(function(v){ return v == null || Math.abs(v) < 150; }); });
      var near = function(c){ return past.filter(function(s){ return s.code !== c.code; }).map(function(s){
          var dd = Math.abs((s.f_depth - (c.depth || 0)) / 15) + Math.abs(((s.f_weeks || 0) - (c.weeks || 0)) / 10) + Math.abs(((s.f_handle || 0) - (c.handle || 0)) / 6) + Math.abs(((s.score || 0) - (c.score || 0)) / 20);
          return [dd, s]; }).sort(function(x, y){ return x[0] - y[0]; }).slice(0, 20).map(function(z){ return z[1]; }); };
      if (past.length >= 8) P.each(o, ".cc", function(cc){
        var sp = cc.querySelector("[data-spark]"), c = sp && by[sp.getAttribute("data-spark")]; if (!c) return;
        var b = document.createElement("button"); b.className = "fold sim"; b.textContent = "🔮 닮은 컵 20개는 그 뒤 어떻게 갔나";
        b.onclick = function(){ var N = near(c), A = avgPath(N.map(function(s){ return s.path; }), 61);
          if (A.avg.length < 5){ b.outerHTML = '<p class="note">닮은 컵 자료가 아직 적어요.</p>'; return; }
          var endv = A.avg[A.avg.length - 1];
          b.outerHTML = '<div class="simbox">' + paths([{vals: A.avg, color: "#ffb84d", w: 2.6}].concat(N.slice(0, 8).map(function(s){ return {vals: s.path, color: "#8a94a8", w: 1, op: .35}; })), {band: {lo: A.lo, hi: A.hi, color: "#ffb84d"}, h: 120, xl: ["신호일", A.avg.length - 1 + "거래일 뒤"]}) +
            '<p class="note">컵 깊이·기간·손잡이·점수가 가장 닮은 과거 컵 ' + N.length + '개. 주황 = 평균, 띠 = 가운데 절반. ' + (A.avg.length - 1) + '거래일 뒤 평균 <b class="' + cls(endv) + '">' + pct(endv) + '</b> · 플러스 ' + Math.round(N.filter(function(s){ return (s.path[Math.min(s.path.length - 1, A.avg.length - 1)] || 0) > 0; }).length / N.length * 100) + '%</p></div>'; };
        var pt = cc.querySelector(".hq") || cc.querySelector(".st4"); if (pt) pt.parentNode.insertBefore(b, cc.querySelector(".row:last-child"));
      });
      // ④ 컵 지도는 views.js RENDER.cup 에서 (갭과 같은 자리: 요약 아래)
      a.insertAdjacentHTML("beforeend", h);
    });
  });

  /* ======================= 📈 갭 ======================= */
  var NEWSK = /(실적|영업이익|매출|수주|계약|공급|승인|허가|인수|합병|M&A|상장|유상|무상|배당|자사주|특허|임상|FDA|earnings|revenue|guidance|contract|approval|acquire|merger|deal|upgrade|beat)/i;
  function gb(g){ return g < 5 ? 0 : g < 10 ? 1 : 2; }
  P.wrap("gap", function(it, a, o){
    Promise.all([it.files.indexOf("cards.json") >= 0 ? getJSON(file("gap", it.id, "cards.json")) : Promise.resolve(null), X("perf_gap.json"), X("gap_pairs.json"), window.opLoadIdx ? opLoadIdx().catch(function(){ return null; }) : null]).then(function(r){
      var d = r[0], Pf = r[1], GP = r[2], sig = (Pf && Pf.signals) || [], h = "", by = {};
      ((d && d.top) || []).forEach(function(c){ by[c.code] = c; });
      var mine = {}; sig.forEach(function(s){ if (!mine[s.code]) mine[s.code] = s; });
      // ② 갭 전날 뉴스 · ③ 평균 경로 vs 이 종목 — 카드마다
      P.each(o, ".cc", function(cc){
        var sp = cc.querySelector("[data-spark]"), c = sp && by[sp.getAttribute("data-spark")]; if (!c) return;
        var nb = document.createElement("div"); nb.className = "gnews"; nb.innerHTML = '<span class="mut">📰 갭 이유 찾는 중…</span>';
        var tg = cc.querySelector(".gq") || cc.querySelector(".tags"); if (tg) tg.after(nb);
        var sym = /^\d{6}$/.test(c.code) ? c.code + ".KS" : c.code;
        var tryN = function(s){ return getJSON(OPD + "n/" + opFile(s) + ".json").catch(function(){ return getJSON(OPD + "d/" + opFile(s) + ".json").then(function(j){ return j.news || []; }); }); };
        tryN(sym).catch(function(){ return /\.KS$/.test(sym) ? tryN(sym.replace(".KS", ".KQ")) : []; }).catch(function(){ return []; }).then(function(N){
          N = N || []; var g0 = c.gday || "";
          var hit = N.filter(function(n){ return n.date && g0 && Math.abs(P.dDiff(n.date, g0)) <= 2; });
          var why = hit.filter(function(n){ return NEWSK.test(n.title); });
          var pick = (why.length ? why : hit).slice(0, 2);
          var tag = why.length ? (/(실적|영업이익|매출|earnings|revenue|guidance|beat)/i.test(why[0].title) ? "실적" : /(수주|계약|공급|contract|deal)/i.test(why[0].title) ? "수주·계약" : /(승인|허가|FDA|임상|approval)/i.test(why[0].title) ? "승인·임상" : /(인수|합병|M&A|acquire|merger)/i.test(why[0].title) ? "인수합병" : "재료") : hit.length ? "뉴스 있음" : "이유 못 찾음";
          nb.innerHTML = '<span class="chip2 ' + (why.length ? "hot" : "") + '">📰 ' + tag + '</span>' + pick.map(function(n){ return '<a href="' + e(n.link) + '" target="_blank">' + e(n.title.length > 46 ? n.title.slice(0, 45) + "…" : n.title) + ' <span class="mut">' + md(n.date) + '</span></a>'; }).join("") +
            (!pick.length ? '<span class="mut"> 갭 날(' + md(g0) + ') 앞뒤 뉴스가 없어요 — 이유 없는 갭은 메워지는 경우가 많아요.</span>' : '');
        });
        var s0 = mine[c.code], peers = sig.filter(function(s){ return s.path && s.path.length > 5 && s.path.every(function(v){ return v == null || Math.abs(v) < 150; }) && s.gap != null && gb(s.gap) === gb(c.gap || 0) && s.code !== c.code; });
        if (peers.length >= 5){
          var bt = document.createElement("button"); bt.className = "fold sim"; bt.textContent = "📉 비슷한 갭 평균 경로 vs 이 종목";
          bt.onclick = function(){ var A = avgPath(peers.map(function(s){ return s.path; }), 61);
            var me = s0 && s0.path ? s0.path : null;
            bt.outerHTML = '<div class="simbox">' + paths([{vals: A.avg, color: "#9085e9", w: 2.4}].concat(me ? [{vals: me, color: "#ffb84d", w: 2.6}] : []), {band: {lo: A.lo, hi: A.hi, color: "#9085e9"}, h: 120, xl: ["신호일", (A.avg.length - 1) + "일 뒤"]}) +
              '<div class="lg"><span><i style="background:#9085e9"></i>비슷한 갭 ' + peers.length + '개 평균</span>' + (me ? '<span><i style="background:#ffb84d"></i>이 종목 (' + (me.length - 1) + '일째 ' + pct(me[me.length - 1]) + ')</span>' : '') + '</div>' +
              '<p class="note">주황선이 보라 띠 위에 있으면 평균보다 잘 버티는 중.</p></div>'; };
          var lr = cc.querySelector(".row:last-child"); if (lr) lr.before(bt);
        }
      });
      // ① 갭 메움 레이스
      var race = sig.filter(function(s){ return s.path && s.path.every(function(v){ return v == null || Math.abs(v) < 150; }) && s.path.length >= 2 && s.fill_lvl && s.p0 && P.dDiff(P.today(), s.d0) <= 30; }).slice(0, 12);
      if (race.length >= 3){
        var dist = function(s, k){ var v = s.path[Math.min(k, s.path.length - 1)]; return ((1 + v / 100) * s.p0 / s.fill_lvl - 1) * 100; };
        var maxK = Math.max.apply(null, race.map(function(s){ return s.path.length - 1; }));
        var drawR = function(k){ var mx = Math.max.apply(null, race.map(function(s){ return Math.max(1, dist(s, 0)); }));
          return race.map(function(s){ var dd = dist(s, k), done = dd <= 0 || (s.filled && s.fill_days != null && s.fill_days <= k);
            return '<div class="rc"><span class="rc-n">' + opA(s.code, e(s.name.slice(0, 10))) + '</span><span class="rc-t"><i style="width:' + (done ? 0 : Math.max(2, Math.min(100, dd / mx * 100))).toFixed(0) + '%;background:#9085e9"></i><em>' + (done ? "🏁 메움" : "") + '</em></span><b class="' + (done ? "dn" : "") + '">' + (done ? "0" : dd.toFixed(1)) + '%</b></div>'; }).join(""); };
        h += card("🏁 갭 메움 레이스 <span class='mut'>최근 30일 갭 · 막대 = 갭 전 박스까지 남은 거리</span>", '<div id="race">' + drawR(maxK) + '</div><div class="rotc"><button class="btn" id="raceb">▶ 1일째부터 재생</button><b id="racek">' + maxK + '일째</b></div>' +
          '<p class="note">막대가 0에 닿으면(🏁) 갭을 다 메운 것. 끝까지 멀리 남은 종목이 "갭을 지킨" 강한 종목이에요.</p>');
        setTimeout(function(){ var b = $("raceb"); if (b) b.onclick = function(){ var k = 0; var t = function(){ if (!$("race")) return; $("race").innerHTML = drawR(k); $("racek").textContent = k + "일째"; if (++k <= maxK) setTimeout(t, 260); }; t(); }; }, 0);
      }
      // ④ 갭 지도
      if (d && d.top && d.top.length >= 5) h += card("🎯 갭 크기 × 거래량 <span class='mut'>오른쪽 위 = 크게 + 거래 많이 = 최강</span>",
        scatter(d.top.filter(function(c){ return c.gap != null && c.vol != null; }).map(function(c){ return {x: Math.min(c.vol, 30), y: Math.min(c.gap, 60), code: c.code, label: "<b>" + e(c.name) + "</b><br>갭 +" + c.gap.toFixed(1) + "% · 거래량 " + c.vol.toFixed(1) + "배 · " + (c.hold ? "유지" : "메움"), color: c.hold ? V.UP : "#5d667a", r: 3 + (c.score || 50) / 25}; }), {xn: "거래량 (배)", yn: "갭 크기 %", x0: 0, qx: 3, qy: 10, h: 230}) +
        '<p class="note">빨강 = 갭 유지, 회색 = 메움 · 점 크기 = 갭 점수. 선(거래량 3배·갭 10%) 오른쪽 위 칸이 가장 믿을 만한 갭. 점을 누르면 리포트.</p>');
      // ⑤ 미국 갭 → 한국 짝꿍
      if (GP && GP.pairs && GP.pairs.length){
        var L_ = GP.last_gap || {}, hot = Object.keys(L_).filter(function(u){ return Math.abs(L_[u] || 0) >= 3; });
        var rows = GP.pairs.slice().sort(function(x, y){ return (hot.indexOf(y.us) >= 0) - (hot.indexOf(x.us) >= 0) || ((y.up || {}).n || 0) - ((x.up || {}).n || 0); });
        var nm = function(s){ var r0 = window.OPIDX && OPIDX.filter(function(z){ return z.sym === s; })[0]; return r0 ? r0.name : V.cd(s); };
        h += card("🌉 미국 밤 갭 → 한국 아침 <span class='mut'>최근 2년 · 미국 ±3% 갭 다음 날</span>", (hot.length ? '<div class="kick2" style="margin:0 0 10px"><b>⚡ 지난 미국장 갭</b> ' + hot.map(function(u){ return u + " " + pct(L_[u]); }).join(" · ") + '</div>' : '') +
          '<table class="cmpt pairs"><tr><th>미국 → 한국</th><th>위로 갭 다음 날</th><th>아래로 갭 다음 날</th></tr>' + rows.slice(0, 18).map(function(p){
            var c = function(x){ return x ? '<b class="' + cls(x.close) + '">' + pct(x.close) + '</b><small>시가 ' + pct(x.open) + ' · 같은 방향 ' + x.same + '% · ' + x.n + '번</small>' : '<span class="mut">–</span>'; };
            return '<tr' + (hot.indexOf(p.us) >= 0 ? ' class="hot"' : '') + '><td>' + opA(p.us, '<b>' + e(p.us) + '</b>') + ' → ' + opA(p.kr, '<b>' + e(nm(p.kr)) + '</b>') + '</td><td>' + c(p.up) + '</td><td>' + c(p.dn) + '</td></tr>'; }).join("") + '</table>' +
          '<p class="note">미국 대장주가 시가에 ±3% 넘게 갭이 난 날, 다음 한국 장에서 짝꿍 종목이 평균 얼마나 움직였나 (종가 기준, 시가 = 아침 갭). "같은 방향" = 미국 갭과 같은 쪽으로 끝난 비율. 매일 한 번 계산.</p>');
      }
      a.insertAdjacentHTML("beforeend", h);
    });
  });
})();
