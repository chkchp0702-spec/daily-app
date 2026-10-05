/* CH Investing — 3차 업그레이드 ②: 나침반 · 매집 · 종목리포트 · 단타 · 알림 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt;
  var P = PL, X = P.X, card = P.card, chip = P.chip, pct = P.pct, opA = P.opA, kn = P.kn, md = P.md, VZ = PVIZ;
  var clamp = function(v){ return Math.max(0, Math.min(100, v)); };

  /* ======================= 🧭 나침반 ======================= */
  var ORD = [["JP", "15:30"], ["KR", "15:30"], ["CN", "16:00"], ["HK", "17:10"], ["US", "다음 날 05:00"]];
  function corr(a, b){ var n = a.length; if (n < 10) return null; var ma = 0, mb = 0; for (var i = 0; i < n; i++){ ma += a[i]; mb += b[i]; } ma /= n; mb /= n;
    var s = 0, sa = 0, sb = 0; for (var j = 0; j < n; j++){ s += (a[j] - ma) * (b[j] - mb); sa += (a[j] - ma) * (a[j] - ma); sb += (b[j] - mb) * (b[j] - mb); } return sa && sb ? s / Math.sqrt(sa * sb) : null; }
  window.CPTOP = function(C){
    var ks = ORD.filter(function(o){ return C.markets[o[0]]; }), h = "";
    // ① 세계 시장 하루 흐름
    if (ks.length >= 3){
      var W = 330, H = 150, step = (W - 50) / (ks.length - 1);
      var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '"><defs><linearGradient id="wfg" x1="0" x2="1"><stop offset="0" stop-color="#ffb84d"/><stop offset="1" stop-color="#7c9cff"/></linearGradient></defs>';
      s += '<path d="M25,70 ' + ks.map(function(_, i){ return "L" + (25 + i * step).toFixed(1) + ",70"; }).join(" ") + '" stroke="url(#wfg)" stroke-width="3" fill="none" stroke-dasharray="6 5"><animate attributeName="stroke-dashoffset" from="22" to="0" dur="1.2s" repeatCount="indefinite"/></path>';
      ks.forEach(function(o, i){ var m = C.markets[o[0]], r = m.up / Math.max(1, m.up + m.down) * 100, ix = m.index[0] || {}, cx = 25 + i * step, R = 15 + Math.abs(r - 50) / 3;
        var col = r >= 55 ? V.UP : r <= 45 ? V.DN : "#6b7385";
        s += '<g data-tip="' + e("<b>" + m.flag + " " + m.name + "</b> " + m.date + " 마감<br>오른 종목 " + r.toFixed(0) + "% · " + (ix.name || "") + " " + pct(ix.chg1) + "<br>" + m.regime) + '">' +
          '<circle cx="' + cx.toFixed(1) + '" cy="70" r="' + R.toFixed(1) + '" fill="' + col + '" fill-opacity=".85" stroke="#121826" stroke-width="2"><animate attributeName="r" values="' + R.toFixed(1) + ';' + (R + 3).toFixed(1) + ';' + R.toFixed(1) + '" dur="2.4s" begin="' + (i * .35) + 's" repeatCount="indefinite"/></circle>' +
          '<text x="' + cx.toFixed(1) + '" y="74" text-anchor="middle" class="wf-r">' + r.toFixed(0) + '</text>' +
          '<text x="' + cx.toFixed(1) + '" y="34" text-anchor="middle" class="wf-f">' + m.flag + '</text>' +
          '<text x="' + cx.toFixed(1) + '" y="108" text-anchor="middle" class="lc-a">' + e(m.name) + ' ' + o[1].replace("다음 날 ", "") + '</text>' +
          '<text x="' + cx.toFixed(1) + '" y="124" text-anchor="middle" class="wf-c ' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</text></g>'; });
      s += '</svg>';
      var best = ks.slice().sort(function(a, b){ var ma = C.markets[a[0]], mb = C.markets[b[0]]; return mb.up / Math.max(1, mb.up + mb.down) - ma.up / Math.max(1, ma.up + ma.down); })[0];
      h += card("🌍 세계 시장 하루 흐름 <span class='mut'>해가 뜨는 순서 · 원 안 = 오른 종목 %</span>", s +
        '<p class="note">일본 → 한국 → 중국 → 홍콩 → 미국 순으로 장이 닫혀요. 원이 크고 빨갈수록 오른 종목이 많았던 시장. 가장 고르게 오른 곳: <b>' + C.markets[best[0]].flag + " " + e(C.markets[best[0]].name) + '</b>. 원을 누르면 자세히.</p>');
    }
    // ⑤ 상관 매트릭스
    var ret = {};
    ks.forEach(function(o){ var ix = C.markets[o[0]].index[0]; if (!ix || !ix.close) return; var r = {};
      for (var i = 1; i < ix.close.length; i++) if (ix.close[i] && ix.close[i - 1]) r[ix.dates[i]] = ix.close[i] / ix.close[i - 1] - 1; ret[o[0]] = r; });
    var mk = Object.keys(ret);
    if (mk.length >= 3){
      var M_ = {}; mk.forEach(function(a){ M_[a] = {}; mk.forEach(function(b){ var ds = Object.keys(ret[a]).filter(function(d){ return ret[b][d] != null; });
        M_[a][b] = a === b ? 1 : corr(ds.map(function(d){ return ret[a][d]; }), ds.map(function(d){ return ret[b][d]; })); }); });
      var pairs = []; mk.forEach(function(a, i){ mk.forEach(function(b, j){ if (j > i && M_[a][b] != null) pairs.push([M_[a][b], a, b]); }); }); pairs.sort(function(x, y){ return y[0] - x[0]; });
      var nm = function(k){ return C.markets[k].flag + " " + C.markets[k].name; };
      h += card("🔗 5개 시장, 누가 누구를 따라가나 <span class='mut'>최근 60거래일 지수 하루 등락의 상관</span>", '<div class="hm"><table class="corr"><thead><tr><th></th>' + mk.map(function(k){ return '<th>' + C.markets[k].flag + '</th>'; }).join("") + '</tr></thead><tbody>' +
        mk.map(function(a){ return '<tr><th>' + nm(a) + '</th>' + mk.map(function(b){ var v = M_[a][b]; return '<td style="background:' + (a === b ? "#232c40" : "rgba(124,156,255," + (v == null ? 0 : Math.max(0, v) * .85).toFixed(2) + ")") + '">' + (v == null ? "–" : v.toFixed(2)) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>' +
        '<p class="note">1 = 똑같이 움직임, 0 = 상관없음. 가장 붙어 다니는 짝: <b>' + nm(pairs[0][1]) + ' ↔ ' + nm(pairs[0][2]) + ' ' + pairs[0][0].toFixed(2) + '</b> · 가장 따로 노는 짝: <b>' + nm(pairs[pairs.length - 1][1]) + ' ↔ ' + nm(pairs[pairs.length - 1][2]) + ' ' + pairs[pairs.length - 1][0].toFixed(2) + '</b>. 미국은 마감 시각이 달라 다음 날 아시아와 짝이 더 맞을 수 있어요.</p>');
    }
    return h;
  };
  function sentence(m){
    var r = m.up / Math.max(1, m.up + m.down) * 100, ix = m.index[0] || {}, ss = (m.sectors || []).slice().sort(function(a, b){ return (b.r1 || 0) - (a.r1 || 0); });
    var lead = ss[0], lag = ss[ss.length - 1], st = (m.strong || [])[0];
    var bigsmall = ix.chg1 != null && m.median1 != null ? (ix.chg1 - m.median1 > 0.7 ? "대형주가 끌고 중소형은 따라오지 못한" : m.median1 - ix.chg1 > 0.7 ? "지수보다 중소형이 더 힘을 낸" : "큰 회사와 작은 회사가 비슷하게 움직인") : "";
    var mood = r >= 65 ? "거의 모든 종목이 오른" : r >= 55 ? "오른 종목이 더 많은" : r > 45 ? "오르고 내린 종목이 반반인" : r > 35 ? "내린 종목이 더 많은" : "거의 모든 종목이 내린";
    return "오늘 " + m.name + "은 " + (lead && (lead.r1 || 0) > 0 ? "<b>" + e(lead.name) + "</b>(" + pct(lead.r1) + ")이 끌고 " : "") + (lag && (lag.r1 || 0) < 0 ? "<b>" + e(lag.name) + "</b>(" + pct(lag.r1) + ")이 밀린, " : "") + mood + " 날" +
      (bigsmall ? " — " + bigsmall + " 장" : "") + "이었어요." + (st ? " 업종으로는 <b>" + e(st.name) + "</b>(" + pct(st.r1) + ")이 가장 셌고" + (st.lead && st.lead[0] ? ", 대장은 " + e(st.lead[0].n) + "." : ".") : "") +
      (m.highs != null ? " 52주 신고가 " + m.highs + "개 / 신저가 " + m.lows + "개." : "");
  }
  function forecast(m){
    var ix = (m.index || [])[0]; if (!ix || !ix.ma20 || ix.ma20.length < 12 || !ix.ma60) return "";
    var a = ix.ma20, n = a.length, m20 = a[n - 1], sl = (a[n - 1] - a[n - 11]) / 10, m60 = ix.ma60, px = ix.last;
    var gap = (m20 / m60 - 1) * 100, pg = (px / m20 - 1) * 100, txt, days = null, to = null;
    if (m.regime !== "상승장" && m20 < m60 && sl > 0){ days = Math.ceil((m60 - m20) / sl); to = "상승장"; txt = "20일선이 60일선 아래에서 하루 " + (sl / m20 * 100).toFixed(2) + "%씩 올라오는 중"; }
    else if (m.regime !== "하락장" && m20 > m60 && sl < 0){ days = Math.ceil((m20 - m60) / -sl); to = "하락장"; txt = "20일선이 60일선 위에서 하루 " + (sl / m20 * 100).toFixed(2) + "%씩 내려오는 중"; }
    else txt = m.regime === "상승장" ? "20일선이 60일선 위에서 계속 오르는 중 — 당장 바뀔 신호 없음" : m.regime === "하락장" ? "20일선이 60일선 아래에서 계속 내리는 중 — 당장 바뀔 신호 없음" : "20일선 기울기가 평평 — 방향을 기다리는 중";
    var bar = function(v){ return '<span class="xbar" style="flex:1"><i style="width:' + clamp(50 + v * 8).toFixed(0) + '%;background:' + (v >= 0 ? V.UP : V.DN) + '"></i></span>'; };
    return card("⏳ 국면 전환 예보 <span class='mut'>" + e(ix.name) + " · 지금 " + e(m.regime) + "</span>",
      (days != null && days <= 60 ? '<div class="fc"><b class="' + (to === "상승장" ? "up" : "dn") + '">' + (to === "상승장" ? "▲" : "▼") + ' 약 ' + days + '거래일 뒤 ' + to + ' 조건</b><small>이 속도가 그대로 이어지면</small></div>' : '<div class="fc"><b>◆ 60거래일 안엔 바뀔 신호 없음</b></div>') +
      '<div class="xr"><span>지수 vs 20일선</span>' + bar(pg) + '<b class="' + cls(pg) + '">' + sgn(pg) + '%</b></div><div class="xr"><span>20일선 vs 60일선</span>' + bar(gap) + '<b class="' + cls(gap) + '">' + sgn(gap) + '%</b></div>' +
      '<p class="note">' + txt + '. 상승장 = 지수가 20일선·60일선 위 + 20일선이 60일선 위 + 20일선이 오름. 예보는 지금 속도를 그대로 이은 것이라 하루 큰 움직임에 바로 바뀌어요.</p>');
  }
  function clock(m){
    var ss = (m.sectors || []).filter(function(x){ return x.r5 != null && x.r20 != null; }); if (ss.length < 4) return "";
    var med = function(k){ var v = ss.map(function(x){ return x[k]; }).sort(function(a, b){ return a - b; }); return v[Math.floor(v.length / 2)]; };
    var m5 = med("r5"), m20 = med("r20"), W = 300, cx = 150, cy = 150, R = 118;
    var ang = function(x, y){ return Math.atan2(x, y); };            // 12시에서 시계 방향
    var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + W + '">';
    var q = [["🔥 계속 강함", 0, "#e66767"], ["🍂 힘 빠지는 중", 90, "#d98a1a"], ["🧊 계속 약함", 180, "#3987e5"], ["🌱 새로 뜨는 중", 270, "#3fb27f"]];
    q.forEach(function(z){ var a0 = (z[1] - 90) * Math.PI / 180, a1 = (z[1] + 0) * Math.PI / 180;
      s += '<path d="M' + cx + ',' + cy + ' L' + (cx + R * Math.cos(a0)).toFixed(1) + ',' + (cy + R * Math.sin(a0)).toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + (cx + R * Math.cos(a1)).toFixed(1) + ',' + (cy + R * Math.sin(a1)).toFixed(1) + ' Z" fill="' + z[2] + '" opacity=".1"/>';
      var am = (z[1] + 45 - 90) * Math.PI / 180; s += '<text x="' + (cx + (R + 14) * Math.cos(am)).toFixed(1) + '" y="' + (cy + (R + 14) * Math.sin(am) + 3).toFixed(1) + '" text-anchor="middle" class="lc-a">' + z[0] + '</text>'; });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#3a4358"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#e8ecf4"/>';
    s += '<path d="M' + (cx + 40) + ',' + (cy - R - 4) + ' A' + (R + 4) + ',' + (R + 4) + ' 0 0 1 ' + (cx + R * .8).toFixed(1) + ',' + (cy - R * .62).toFixed(1) + '" stroke="#8a94a8" fill="none" marker-end="url(#ah)"/><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L6,3L0,6Z" fill="#8a94a8"/></marker></defs>';
    var mxv = Math.max.apply(null, ss.map(function(x){ return Math.hypot(x.r20 - m20, (x.r5 - m5) * 2); }).concat([1]));
    ss.forEach(function(x, i){ var dx = x.r20 - m20, dy = (x.r5 - m5) * 2, a = ang(dx, dy), rr = 30 + Math.min(1, Math.hypot(dx, dy) / mxv) * (R - 40);
      var px = cx + rr * Math.sin(a), py = cy - rr * Math.cos(a), col = V.CAT[i % 6], tail = "";
      if (x.path && x.path.length > 4){ var p0 = x.path[x.path.length - 5], d0x = p0[2] - m20, d0y = (p0[1] - m5) * 2, a0 = ang(d0x, d0y), r0 = 30 + Math.min(1, Math.hypot(d0x, d0y) / mxv) * (R - 40);
        tail = '<line x1="' + (cx + r0 * Math.sin(a0)).toFixed(1) + '" y1="' + (cy - r0 * Math.cos(a0)).toFixed(1) + '" x2="' + px.toFixed(1) + '" y2="' + py.toFixed(1) + '" stroke="' + col + '" stroke-opacity=".5" stroke-width="2" marker-end="url(#ah)"/>'; }
      var hour = ((a * 180 / Math.PI + 360) % 360) / 30;
      s += tail + '<g data-csec="' + e(x.k) + '" style="cursor:pointer" data-tip="' + e("<b>" + x.icon + " " + x.name + "</b> " + (Math.floor(hour) || 12) + "시 방향<br>1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20)) + '"><circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="6" fill="' + col + '" stroke="#121826" stroke-width="2"/>' +
        '<text x="' + (px + 8).toFixed(1) + '" y="' + (py + 3).toFixed(1) + '" class="rotl">' + e(x.name) + '</text></g>'; });
    s += '</svg>';
    return card("🕐 섹터 로테이션 시계 <span class='mut'>돈은 시계 방향으로 돈다</span>", s +
      '<p class="note">교과서의 경기 순환처럼 섹터는 보통 🌱 새로 뜸(9~12시) → 🔥 강함(12~3시) → 🍂 힘 빠짐(3~6시) → 🧊 약함(6~9시) 순으로 돌아요. 화살표 = 지난 5일 이동. 9~12시 쪽에 있는 섹터가 다음 주인공 후보예요. 점을 누르면 종목.</p>');
  }
  window.CPX2 = function(m, k, C){
    return '<section class="card sentc"><div class="sentc-k">🗣️ 오늘 ' + e(m.name) + ' 한 문장</div><p>' + sentence(m) + '</p></section>' + forecast(m) + clock(m);
  };

  /* ======================= 🤫 조용한 매집 ======================= */
  P.wrap("accum", null, function(it, b){
    Promise.all([X("accum_x.json"), getJSON(file("accum", it.id, "list.json")).catch(function(){ return []; }), X("perf_accum.json")]).then(function(r){
      var A = r[0] || {}, rows = r[1] || [], Pf = r[2], by = {}, h = "";
      rows.forEach(function(x){ by[x.code] = x; });
      var items = (A.items || []).filter(function(x){ return by[x.code]; });
      // ④ 숨소리
      var br = items.filter(function(x){ return x.vspark && x.pspark && x.vspark.length > 20; }).sort(function(p, q){ return (q.power || 0) - (p.power || 0); }).slice(0, 6);
      if (br.length) h += card("🫁 거래량 숨소리 <span class='mut'>가격은 조용, 거래는 쌓이는 모습 · 60일</span>", '<div class="brg">' + br.map(function(x){ var r0 = by[x.code], v = x.vspark, p = x.pspark;
          var W = 150, H = 70, mv = Math.max.apply(null, v.concat([1])), lo = Math.min.apply(null, p), hi = Math.max.apply(null, p), rr = (hi - lo) || 1, n = v.length, bw = W / n;
          var avg = v.slice(0, n - 10).reduce(function(a, c){ return a + c; }, 0) / Math.max(1, n - 10);
          var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="brs">' + v.map(function(c, i){ var hh = c / mv * (H * .55), hot = c > avg * 1.5;
            return '<rect x="' + (i * bw).toFixed(1) + '" y="' + (H - hh).toFixed(1) + '" width="' + Math.max(1, bw - .6).toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="' + (hot ? "#ff8fc7" : "#4a5266") + '"' + (i >= n - 10 && hot ? ' class="breath"' : '') + '/>'; }).join("") +
            '<polyline points="' + p.map(function(c, i){ return (i * bw + bw / 2).toFixed(1) + "," + (4 + (hi - c) / rr * (H * .4)).toFixed(1); }).join(" ") + '" fill="none" stroke="#e8ecf4" stroke-width="1.6"/></svg>';
          var rng = (hi / lo - 1) * 100;
          return '<a class="brc" href="javascript:openOP(\'' + e(x.code) + '\')"><b>' + e(r0.name.slice(0, 12)) + '</b>' + s + '<small>가격 폭 ' + rng.toFixed(0) + '% · 거래 ' + (x.v5 ? (x.v5 * 100).toFixed(0) + "%" : "–") + ' · 강도 ' + (x.power || "–") + '</small></a>'; }).join("") + '</div>' +
        '<p class="note">흰 선 = 가격, 막대 = 거래량(분홍 = 평소의 1.5배 넘는 날, 최근 것이 숨 쉬듯 깜빡여요). 선은 평평한데 분홍 막대가 쌓이면 누군가 조용히 모으는 중.</p>');
      // ② 누가 모으나
      var fl = items.filter(function(x){ return x.flow && x.flow.length; });
      if (fl.length) h += card("🕵️ 누가 모으나 <span class='mut'>한국 · 최근 10일 순매수 합</span>", fl.map(function(x){ var r0 = by[x.code], f = 0, o = 0, i = 0;
          x.flow.forEach(function(d){ f += d.f; o += d.o; i += d.i; });
          var mx = Math.max(Math.abs(f), Math.abs(o), Math.abs(i), 1), who = [["외국인", f, "#7c9cff"], ["기관", o, "#3dd6c6"], ["개인", i, "#ffb84d"]];
          var top = who.slice().sort(function(a, c){ return c[1] - a[1]; })[0];
          return '<div class="xfl"><div class="row">' + opA(x.code, '<b>' + e(r0.name) + '</b>') + (top[1] > 0 ? chip(top[0] + "이 모으는 중", "hot") : chip("모두 매도", "cool")) + '</div>' +
            who.map(function(w){ return '<div class="whob"><span>' + w[0] + '</span><span class="sbar wide"><i style="' + (w[1] >= 0 ? "left:50%" : "right:50%") + ';width:' + (Math.abs(w[1]) / mx * 50).toFixed(0) + '%;background:' + w[2] + '"></i></span><b class="' + cls(w[1]) + '">' + (w[1] > 0 ? "+" : "") + Math.round(w[1]).toLocaleString() + '</b></div>'; }).join("") +
            (x.pen && x.pen.pen != null ? '<small class="mut">연기금 ' + (x.pen.pen > 0 ? "+" : "") + Math.round(x.pen.pen).toLocaleString() + '</small>' : '') + '</div>'; }).join("") +
        '<p class="note">주 단위 순매수. 개인이 팔고 외국인·기관이 사면 전형적인 "조용한 매집" 모양이에요.</p>');
      // ③ 지속 일수 랭킹 + 돌파 확률
      var bd = (Pf && Pf.by_days) || {}, bk = function(dd){ return dd <= 2 ? "1~2일째" : dd <= 5 ? "3~5일째" : dd <= 10 ? "6~10일째" : "11일째 이상"; };
      var lr = rows.filter(function(x){ return x.days; }).sort(function(p, q){ return q.days - p.days; }).slice(0, 10);
      if (lr.length) h += card("📆 오래 모으는 순 <span class='mut'>매집 며칠째 · 그 기간대 과거 돌파율</span>", V.hbars(lr.map(function(x){ var bb = bd[bk(x.days)];
          return {label: (V.FLAGS[x.mkt] || "") + " " + e(x.name.slice(0, 12)) + (bb ? ' <span class="mut">돌파율 ' + (bb.brk == null ? "–" : bb.brk + "%") + '</span>' : ''), v: x.days, text: x.days + "일째", color: "#ff8fc7", attr: ' onclick="openOP(\'' + e(x.code) + '\')" style="cursor:pointer"'}; })) +
        '<p class="note">돌파율 = 과거에 같은 기간대(예: 6~10일째)에 잡힌 매집 신호가 그 뒤 20일 고점을 넘은 비율. 신호가 쌓일수록 정확해져요.</p>');
      // ① 생애 그래프
      var sg = ((Pf && Pf.signals) || []).filter(function(s){ return s.path && s.path.length > 5; });
      if (sg.length >= 3){
        var ok = sg.filter(function(s){ return s.abrk; }), no = sg.filter(function(s){ return !s.abrk; });
        var Ao = VZ.avgPath(ok.map(function(s){ return s.path; }), 61), An = VZ.avgPath(no.map(function(s){ return s.path; }), 61);
        h += card("🧬 조용한 매집의 생애 <span class='mut'>신호 뒤 60일 평균 경로</span>", VZ.paths([].concat(Ao.avg.length ? [{vals: Ao.avg, color: V.UP, w: 2.6}] : []).concat(An.avg.length ? [{vals: An.avg, color: "#5aa0ff", w: 2.6}] : []), {h: 140, xl: ["신호일", "60일 뒤"]}) +
          '<div class="lg"><span><i style="background:' + V.UP + '"></i>돌파 성공 ' + ok.length + '</span><span><i style="background:#5aa0ff"></i>돌파 못 함 ' + no.length + '</span></div>' +
          '<p class="note">매집 → (조용히 횡보) → 박스 돌파 → 상승이 정석. 돌파 못 한 매집은 대체로 제자리에 머물러요. 지금 목록 종목들은 대부분 ' + (rows.length ? Math.round(rows.reduce(function(a, x){ return a + (x.days || 1); }, 0) / rows.length) : "–") + '일째 — 그래프의 왼쪽 끝 근처예요.</p>');
      } else h += card("🧬 조용한 매집의 생애", '<p class="note" style="margin:0">매집 신호가 쌓이면(현재 ' + sg.length + '개) "매집 → 돌파 → 상승"의 평균 곡선과 지금 종목 위치를 보여줘요.</p>');
      // ⑤ 섹터 클러스터
      var sc = {}; rows.forEach(function(x){ var k = (x.mkt || "") + "|" + (x.sector || "미분류"); if (x.sector && x.sector !== "미분류") (sc[k] = sc[k] || []).push(x); });
      var cl = Object.keys(sc).filter(function(k){ return sc[k].length >= 2; }).sort(function(a, c){ return sc[c].length - sc[a].length; });
      if (cl.length) h += card("🧲 섹터째 모으는 중 <span class='mut'>같은 시장·섹터에서 2종목 이상</span>", cl.map(function(k){ var p = k.split("|");
          return '<div class="xfl"><div class="row"><b>' + (V.FLAGS[p[0]] || "") + " " + e(p[1]) + '</b>' + chip("섹터 매집 " + sc[k].length, "hot") + '</div><div class="cp-sts">' + sc[k].map(function(x){ return opA(x.code, '<span class="cp-st"><b>' + e(x.name.slice(0, 12)) + '</b><span class="mut">' + (x.score || 0).toFixed(0) + '점</span></span>'); }).join("") + '</div></div>'; }).join("") +
        '<p class="note">한 종목이 아니라 같은 업종 여러 종목에 동시에 매집 신호가 뜨면, 큰손이 업종 전체를 담는 신호일 수 있어요.</p>');
      b.insertAdjacentHTML("afterbegin", h);
      [].forEach.call(b.querySelectorAll("[data-tip]"), function(){});
    });
  });

  /* ======================= 📄 종목리포트 ======================= */
  var SECJ = null, IVJ = null;
  function secAll(){ return SECJ || (SECJ = getJSON(OPD + "sec.json").catch(function(){ return {}; })); }
  function radar(ax){
    var W = 260, c = 130, R = 92, n = ax.length, s = '<svg viewBox="0 0 ' + W + ' ' + W + '" class="radar">';
    var pt = function(i, v){ var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + R * v / 100 * Math.cos(a), c + R * v / 100 * Math.sin(a)]; };
    [25, 50, 75, 100].forEach(function(g){ s += '<polygon points="' + ax.map(function(_, i){ return pt(i, g).map(function(z){ return z.toFixed(1); }).join(","); }).join(" ") + '" fill="none" stroke="#2d3650"/>'; });
    s += '<polygon points="' + ax.map(function(_, i){ return pt(i, 50).map(function(z){ return z.toFixed(1); }).join(","); }).join(" ") + '" fill="#8a94a8" fill-opacity=".12" stroke="#8a94a8" stroke-dasharray="4 3"/>';
    s += '<polygon points="' + ax.map(function(a, i){ return pt(i, a[1]).map(function(z){ return z.toFixed(1); }).join(","); }).join(" ") + '" fill="#5ac8fa" fill-opacity=".3" stroke="#5ac8fa" stroke-width="2.4"><animate attributeName="fill-opacity" values=".15;.35;.15" dur="3s" repeatCount="indefinite"/></polygon>';
    ax.forEach(function(a, i){ var p = pt(i, 118), q = pt(i, a[1]); s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="3.5" fill="#5ac8fa"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="middle" class="rd-l">' + a[0] + '</text><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 16).toFixed(1) + '" text-anchor="middle" class="rd-v">' + Math.round(a[1]) + '</text>'; });
    return s + '</svg>';
  }
  function extraCard(sym, box){
    var mk = /\.K[SQ]$/.test(sym) ? "KR" : /\.T$/.test(sym) ? "JP" : /\.HK$/.test(sym) ? "HK" : /\.(SS|SZ)$/.test(sym) ? "CN" : "US";
    Promise.all([getJSON(OPD + "d/" + opFile(sym) + ".json").catch(function(){ return null; }), getJSON(OPD + "e/" + opFile(sym) + ".json").catch(function(){ return {}; }),
                 getJSON(OPD + "k/" + opFile(sym) + ".json").catch(function(){ return {}; }), getJSON(OPD + "m/" + opFile(sym) + ".json").catch(function(){ return {}; }),
                 V.price(/\.K[SQ]$/.test(sym) ? sym.slice(0, 6) : sym), IVJ ? Promise.resolve(IVJ) : getJSON(OPD + "ind_val.json").then(function(j){ IVJ = j; return j; }).catch(function(){ return {}; }),
                 P.todaySignals(), secAll(), window.opLoadIdx ? opLoadIdx().catch(function(){ return null; }) : Promise.resolve(null)]).then(function(r){
      var d = r[0]; if (!d){ box.innerHTML = ""; return; }
      var E = r[1] || {}, K = r[2] || {}, MD = r[3] || {}, p = r[4], IV = (r[5] || {})[d.industry_ko || d.industry], SG = (r[6] || {})[kn(sym)] || [], S = r[7] || {};
      var nm = (d.ticker && d.ticker.name) || sym, h = "";
      var fin = (d.financials || []).filter(function(x){ return x.revenue; }), lastF = fin[fin.length - 1], prevF = fin[fin.length - 2];
      var g = lastF && prevF ? (lastF.revenue / prevF.revenue - 1) * 100 : null, om = lastF && lastF.operating_income != null ? lastF.operating_income / lastF.revenue * 100 : null;
      var r1y = p && p[6] && p[6][0] ? (p[1] / p[6][0] - 1) * 100 : null, pos = p && p[3] > p[4] ? (p[1] - p[4]) / (p[3] - p[4]) * 100 : null;
      var an = d.analyst || {}, up = an.target_mean && p ? (an.target_mean / p[1] - 1) * 100 : null;
      var cur = {USD: "달러", KRW: "원", JPY: "엔", CNY: "위안", HKD: "홍콩달러"}[d.currency] || "";
      var money = function(v){ if (v == null) return "–"; var a = Math.abs(v); return d.currency === "KRW" ? fmtKRW(v, "m") : (a >= 1e12 ? (v / 1e12).toFixed(1) + "조 " : a >= 1e8 ? Math.round(v / 1e8).toLocaleString() + "억 " : Math.round(v / 1e4).toLocaleString() + "만 ") + cur; };
      // ① 10초 설명
      var desc = (K.desc_ko || d.business_summary_ko || "").replace(/\s+/g, " ");
      var first = (desc.match(/^.*?(다\.|요\.|\.)\s/) || [desc.slice(0, 90)])[0].trim();
      var lines = [
        "🏭 " + (first ? first.replace(/^(이 회사는|동사는)\s*/, "") : e(d.industry_ko || d.industry || "")),
        "💰 " + (lastF ? "1년에 " + money(lastF.revenue) + " 팔고" + (om != null ? " 100원 팔면 " + Math.round(om) + "원이 남아요" : "") : "매출 자료 없음") + (g != null ? " · 매출 " + (g >= 0 ? "+" : "") + g.toFixed(0) + "% " + (g >= 20 ? "급성장" : g >= 5 ? "성장" : g >= -5 ? "제자리" : "감소") : ""),
        "📈 " + (r1y != null ? "1년 주가 " + sgn(r1y) + "%" : "") + (pos != null ? " · 1년 범위의 " + Math.round(pos) + "% 위치" : "") + (up != null && an.n_analysts ? " · 애널리스트 " + an.n_analysts + "명 목표가까지 " + sgn(up) + "%" : "")
      ];
      var photo = MD.photo || "";
      h += '<div class="ten">' + (photo ? '<div class="ten-img" style="background-image:url(\'' + e(photo) + '\')"></div>' : '') + '<div class="ten-b"><div class="ten-k">⏱️ 10초 설명</div><b>' + e(nm) + '</b>' + lines.map(function(l){ return '<p>' + e(l) + '</p>'; }).join("") +
        '<button class="btn" id="tenshare">📤 친구에게 보내기</button></div></div>';
      // ② DNA 레이더
      var val = d.pe && IV && IV.pe ? clamp(50 + (IV.pe - d.pe) / IV.pe * 60) : d.pe ? clamp(100 - d.pe * 2) : 50;
      var ax = [["성장", g == null ? 50 : clamp((g + 10) / 50 * 100)], ["수익성", om == null ? 50 : clamp(om / 30 * 100)], ["싸다", val], ["주가 힘", pos == null ? 50 : pos],
                ["전문가", up == null ? 50 : clamp((up + 10) / 40 * 100)], ["신호", clamp(SG.length * 30 + (an.rating && /매수/.test(an.rating) ? 20 : 0))]];
      var strong = ax.slice().sort(function(a, b){ return b[1] - a[1]; });
      h += '<div class="sub2">🧬 종목 DNA <span class="mut">점선 = 보통(50)</span></div><div class="rd-w">' + radar(ax) + '<div class="rd-t"><b>강점</b> ' + strong.slice(0, 2).map(function(a){ return a[0]; }).join(" · ") + '<br><b>약점</b> ' + strong.slice(-2).map(function(a){ return a[0]; }).join(" · ") +
        '<small>성장 = 매출 증가율 · 수익성 = 영업이익률 · 싸다 = PER(업종 대비) · 주가 힘 = 1년 범위 위치 · 전문가 = 목표가까지 · 신호 = 앱 신호 수</small></div></div>';
      // ⑤ 실적 D-day + 과거 반응
      var nx = ((E.cal || {}).earn || [])[0], su = (E.surp || []).filter(function(x){ return x[3] != null; });
      if (nx || su.length){
        var dd = nx ? P.dDiff(nx.slice(0, 10), P.today()) : null;
        h += '<div class="sub2">📅 실적 발표 <span class="mut">' + (nx ? md(nx) + (dd >= 0 ? " · D-" + dd : "") : "날짜 미정") + '</span></div>' +
          (su.length ? V.cols(su.map(function(x){ return {label: x[0].slice(2, 7).replace("-", "/"), v: x[3], top: sgn(x[3], 1), tip: "<b>" + x[0] + "</b> 다음 날 " + sgn(x[3]) + "%<br>예상 EPS " + x[1] + " · 실제 " + x[2]}; }), {h: 100}) +
            '<p class="note">실적 다음 날 평균 <b class="' + cls(su.reduce(function(a, x){ return a + x[3]; }, 0) / su.length) + '">' + pct(su.reduce(function(a, x){ return a + x[3]; }, 0) / su.length) + '</b> · 평균 크기 ±' + (su.reduce(function(a, x){ return a + Math.abs(x[3]); }, 0) / su.length).toFixed(1) + '% · 오른 날 ' + su.filter(function(x){ return x[3] > 0; }).length + '/' + su.length + '. 발표 날 이 정도는 흔들린다는 뜻.</p>'
            : '<p class="note">과거 실적 반응은 매주 토요일 계산부터 채워져요 (애널리스트가 있는 종목).</p>');
      }
      // ③ 닮은 회사
      var me = S[sym];
      if (me && me[1]){
        var cand = Object.keys(S).filter(function(k){ var v = S[k]; return k !== sym && v && v[1] === me[1] && v[2]; }).map(function(k){ var v = S[k];
          var dc = Math.abs(Math.log((v[2] || 1) / (me[2] || 1))), dp = me[3] && v[3] ? Math.abs(v[3] - me[3]) / Math.max(me[3], 5) : .5; return [dc + dp + (k.split(".")[1] === sym.split(".")[1] ? .15 : 0), k]; })
          .sort(function(a, b){ return a[0] - b[0]; }).slice(0, 6).map(function(z){ return z[1]; });
        var names = {}; (window.OPIDX || []).forEach(function(x){ names[x.sym] = x.name; });
        if (cand.length) h += '<div class="sub2">👯 닮은 회사 <span class="mut">같은 업종(' + e(me[1]) + ') · 덩치·PER 비슷한 순</span></div><div class="cp-sts" id="simco">' + cand.map(function(k){
          return '<a class="cp-st" href="javascript:openOP(\'' + e(k) + '\')" data-sp="' + e(k) + '"><b>' + e((names[k] || V.cd(k)).slice(0, 14)) + '</b><em class="tk">' + e(V.cd(k)) + '</em><span class="mut">…</span></a>'; }).join("") + '</div>';
      }
      box.innerHTML = '<section class="card opx">' + h + '</section>';
      [].forEach.call(box.querySelectorAll("[data-sp]"), function(a){ V.price(a.getAttribute("data-sp")).then(function(q){ var sp = a.querySelector("span.mut"); if (!q || !q[6]){ sp.textContent = ""; return; } var rr = (q[1] / q[6][0] - 1) * 100; sp.className = cls(rr); sp.textContent = "1년 " + sgn(rr) + "%"; }); });
      var sb = $("tenshare"); if (sb) sb.onclick = function(){ var t = nm + "\n" + lines.join("\n") + "\n" + location.origin + location.pathname + "#onepager";
        if (navigator.share) navigator.share({title: nm, text: t}).catch(function(){}); else { try { navigator.clipboard.writeText(t); P.toast("복사했어요"); } catch(x) {} } };
    });
  }
  var OLD_SB = window.sigBadges;
  window.sigBadges = function(sym){
    return OLD_SB(sym).then(function(h){
      setTimeout(function(){ var el = $("opsig"); if (!el) return; var bx = document.createElement("div"); el.appendChild(bx); bx.innerHTML = '<div class="loading">10초 설명 만드는 중…</div>'; extraCard(sym, bx); }, 30);
      return h;
    });
  };

  /* ======================= ⚡ 단타 ======================= */
  var SBT = null;
  function scoreboard(el){
    clearTimeout(SBT);
    getText(RAW + "stock-screener/main/data/tracking.csv?" + Date.now()).then(function(t){
      if (!document.body.contains(el)) return;
      var R = parseCSV(t), today = P.today().replace(/-/g, ""), rows = R.filter(function(r){ return String(r["시각"] || "").indexOf(today) === 0; }), live = true;
      if (!rows.length){ var last = R.length ? String(R[R.length - 1]["시각"]).slice(0, 8) : ""; rows = R.filter(function(r){ return String(r["시각"] || "").indexOf(last) === 0; }); live = false; }
      if (!rows.length){ el.innerHTML = ""; return; }
      var d0 = String(rows[0]["시각"]).slice(0, 8);
      var sum = rows.reduce(function(a, r){ return a + (+r["현재"] || 0); }, 0) / rows.length;
      el.innerHTML = '<section class="card sb"><h3>📺 ' + (live ? "오늘 알람 실시간 전광판" : d0.slice(4, 6) + "/" + d0.slice(6) + " 알람 전광판") + ' <span class="mut">' + (live ? "1분마다 새로 · 단타 프로그램 10분 저장" : "오늘 알람 없음") + '</span></h3>' +
        '<div class="sb-sum"><span>알람 ' + rows.length + '</span><b class="' + cls(sum) + '">평균 ' + pct(sum) + '</b><span>플러스 ' + rows.filter(function(r){ return +r["현재"] > 0; }).length + '</span></div><div class="sb-g">' +
        rows.slice().reverse().map(function(r){ var v = +r["현재"] || 0, hi = +r["최고"] || 0, lo = +r["최저"] || 0, ex = (r["청산알림"] || "").replace(/nan/i, "");
          return '<a class="sb-t ' + (v > 0 ? "u" : v < 0 ? "d" : "") + (live ? " blink" : "") + '" href="javascript:openOP(\'' + e(r.code) + '\')"><small>' + String(r["시각"]).slice(9, 11) + ':' + String(r["시각"]).slice(11, 13) + ' · ' + e(r["유형"] && r["유형"] !== "nan" ? r["유형"] : "알람") + '</small><b>' + e(r.name) + '</b>' +
            '<em class="' + cls(v) + '">' + pct(v) + '</em><span class="sb-r"><i style="left:' + clamp(50 + lo * 8).toFixed(0) + '%;right:' + clamp(50 - hi * 8).toFixed(0) + '%"></i><u style="left:' + clamp(50 + v * 8).toFixed(0) + '%"></u></span>' +
            (ex ? '<small class="' + (/손절|이탈|시간|트레일/.test(ex) ? "dn" : "up") + '">' + e(ex) + '</small>' : '<small class="mut">최고 ' + pct(hi) + ' · 최저 ' + pct(lo) + '</small>') + '</a>'; }).join("") + '</div>' +
        '<p class="note">막대 = 장중 최저~최고 범위, 흰 점 = 지금. ' + (live ? "장 중엔 1분마다 새로 불러와요." : "") + ' 시험 중인 알람이라 참고만.</p></section>';
      if (live && cur === "danta") SBT = setTimeout(function(){ scoreboard(el); }, 60000);
    }).catch(function(){ el.innerHTML = ""; });
  }
  function replayBtn(st, rp){
    var b = document.createElement("button"); b.className = "fold sim"; b.textContent = "▶ 알람 순간 되감기 (전 30분 ~ 뒤 90분)";
    b.onclick = function(){
      var s = rp.s, W = 320, H = 120, L = 6, R = 36, T = 8, B = 16, xs = s.map(function(z){ return z[0]; }), ys = s.map(function(z){ return (z[1] / rp.p - 1) * 100; });
      var lv = [0]; if (rp.stop != null) lv.push(rp.stop); if (rp.t1 != null) lv.push(rp.t1);
      var lo = Math.min.apply(null, ys.concat(lv)), hi = Math.max.apply(null, ys.concat(lv)), rr = (hi - lo) || 1; lo -= rr * .08; hi += rr * .08; rr = hi - lo;
      var x = function(v){ return L + (v - xs[0]) / ((xs[xs.length - 1] - xs[0]) || 1) * (W - L - R); }, y = function(v){ return T + (hi - v) / rr * (H - T - B); };
      var box = document.createElement("div"); box.className = "simbox"; b.replaceWith(box);
      var k = 1, base = '<line x1="' + x(0).toFixed(1) + '" x2="' + x(0).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#ffd166" stroke-dasharray="3 3"/><text x="' + (x(0) + 3).toFixed(1) + '" y="' + (T + 8) + '" class="lc-a" fill="#ffd166">알람</text>' +
        (rp.stop != null ? '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(rp.stop).toFixed(1) + '" y2="' + y(rp.stop).toFixed(1) + '" stroke="' + V.DN + '" stroke-dasharray="4 3"/><text x="' + (W - R + 3) + '" y="' + (y(rp.stop) + 3).toFixed(1) + '" class="lc-a">손절</text>' : '') +
        (rp.t1 != null ? '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(rp.t1).toFixed(1) + '" y2="' + y(rp.t1).toFixed(1) + '" stroke="' + V.UP + '" stroke-dasharray="4 3"/><text x="' + (W - R + 3) + '" y="' + (y(rp.t1) + 3).toFixed(1) + '" class="lc-a">목표</text>' : '') +
        '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" class="lc-z"/><text x="' + L + '" y="' + (H - 3) + '" class="lc-a">−30분</text><text x="' + (W - R) + '" y="' + (H - 3) + '" class="lc-a" text-anchor="end">+90분</text>';
      var tick = function(){ if (!document.body.contains(box)) return; var pts = s.slice(0, k).map(function(z, i){ return x(z[0]).toFixed(1) + "," + y(ys[i]).toFixed(1); }).join(" "), lst = ys[k - 1];
        box.innerHTML = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '">' + base + '<polyline points="' + pts + '" fill="none" stroke="#e8ecf4" stroke-width="2"/><circle cx="' + x(s[k - 1][0]).toFixed(1) + '" cy="' + y(lst).toFixed(1) + '" r="4" fill="' + (lst >= 0 ? V.UP : V.DN) + '"/></svg>' +
          '<p class="note">' + (s[k - 1][0] >= 0 ? "+" : "") + s[k - 1][0] + '분 · 알람가 대비 <b class="' + cls(lst) + '">' + pct(lst) + '</b> · 1분 스냅샷</p>';
        if (++k <= s.length) setTimeout(tick, 45); };
      tick();
    };
    var lr = st.querySelector(".row:last-child"); if (lr) lr.before(b);
  }
  P.wrap("danta", function(it, a, o){
    a.insertAdjacentHTML("afterbegin", '<div id="dsb"></div>');
    scoreboard($("dsb"));
    X("danta_stats.json").then(function(S){
      if (!S) return;
      var RP = S.replay || {};
      P.each(o, ".list .st", function(st){ var cd = st.querySelector(".cd"), tm = st.querySelector(".tm"); if (!cd || !tm) return;
        var t = (tm.textContent.match(/\d\d:\d\d/) || [""])[0], rp = RP[it.id.slice(0, 10) + "|" + t + "|" + cd.textContent.trim()]; if (rp) replayBtn(st, rp); });
    });
  }, function(it, b){
    Promise.all([X("danta_stats.json"), getJSON("archive/x/live_kr.json?" + Date.now()).catch(function(){ return null; })]).then(function(r){
      var S = r[0], L = r[1], h = ""; if (!S) return;
      // ③ 오늘 같은 장
      var BM = S.by_mkt || {}, ks = Object.keys(BM);
      if (ks.length){
        var kq = L && L.date === P.today() && L.index && L.index[1] ? L.index[1].chg : null, src = "오늘 장중";
        if (kq == null){ var kd = Object.keys(S.kq || {}).sort(); if (kd.length){ kq = S.kq[kd[kd.length - 1]]; src = md(kd[kd.length - 1]) + " 마감"; } }
        var bkt = kq == null ? null : kq < -1 ? "코스닥 −1% 아래" : kq < 0 ? "코스닥 −1~0%" : kq < 1 ? "코스닥 0~+1%" : "코스닥 +1% 위";
        var cur_ = bkt && BM[bkt];
        h += card("🌦️ 오늘 같은 장에서 알람 성적 <span class='mut'>코스닥 그날 등락별</span>", (cur_ ? '<div class="fc"><b class="' + ((cur_.win || 0) >= 50 ? "up" : "dn") + '">' + e(bkt) + ' 날 승률 ' + cur_.win + '% · 평균 ' + pct(cur_.avg) + '</b><small>지금 코스닥 ' + pct(kq) + ' (' + src + ') · 과거 ' + cur_.n + '건</small></div>' : '') +
          V.hbars(ks.map(function(k){ var x = BM[k]; return {label: e(k) + ' <span class="mut">' + x.n + '건</span>' + (k === bkt ? ' ◀' : ''), v: x.win || 0, text: x.win + "%", color: k === bkt ? "#ffd166" : (x.win || 0) >= 50 ? V.UP : V.DN}; }), {max: 100}) +
          '<p class="note">오늘 같은 분위기의 날에 알람이 얼마나 잘 맞았는지. 승률이 낮은 장이면 알람이 와도 한 번 더 참는 게 좋아요.</p>');
      }
      // ④ 유형별 베스트
      var BS = S.best || {};
      if (Object.keys(BS).length) h += card("🏅 유형별 가장 잘 된 알람", Object.keys(BS).map(function(t){ return '<div class="sub2" style="margin-top:6px">' + e(t) + '</div>' + BS[t].map(function(x, i){
          return '<div class="bst"><span class="rk">' + (i + 1) + '</span><div style="flex:1;min-width:0">' + opA(x.code, '<b>' + e(x.name) + '</b>') + ' <span class="mut">' + md(x.d) + ' ' + e(x.time || "") + '</span>' + V.range(x.lo, x.hi, x.now) + '</div><b class="' + cls(x.pnl) + '">' + pct(x.pnl) + '</b></div>'; }).join(""); }).join("") +
        '<p class="note">가상 매매(손절·목표1 규칙) 결과가 가장 좋았던 알람. 막대 = 장중 최저~최고, 점 = 마감.</p>');
      b.insertAdjacentHTML("afterbegin", h);
    });
  });

  /* ======================= 🔔 알림 ======================= */
  function speak(btn){
    if (!window.speechSynthesis){ P.toast("이 휴대폰은 음성 읽기를 지원하지 않아요"); return; }
    if (speechSynthesis.speaking){ speechSynthesis.cancel(); btn.textContent = "🔊 아침 요약 듣기"; return; }
    var L = (M.cats.market || []).filter(function(x){ return x.files.indexOf("data.json") >= 0; })[0];
    Promise.all([L ? getJSON(file("market", L.id, "data.json")).catch(function(){ return null; }) : null, P.compassNow(), P.todaySignals()]).then(function(r){
      var d = r[0], C = r[1], SG = r[2] || {}, txt = [];
      var plain = function(s){ return String(s || "").replace(/<[^>]+>/g, "").replace(/[「」"“”]/g, "").replace(/(\d)\.(\d)/g, "$1점$2").replace(/%/g, "퍼센트").replace(/bp/g, "베이시스포인트").replace(/·/g, ","); };
      txt.push("C H 인베스팅 아침 요약입니다.");
      if (d){ txt.push(plain(d.one_liner)); if (d.kick && !d.kick.none) txt.push("오늘의 킥. " + plain(d.kick.title) + ". 그래서, " + plain(d.kick.so));
        (d.checks || []).slice(0, 3).forEach(function(c, i){ txt.push("체크 " + (i + 1) + ". " + plain(c)); }); }
      if (C && C.markets) txt.push("시장 국면은 " + Object.keys(C.markets).map(function(k){ return C.markets[k].name + " " + C.markets[k].regime; }).join(", ") + "입니다.");
      var cnt = {}; Object.keys(SG).forEach(function(k){ SG[k].forEach(function(x){ cnt[x[1]] = (cnt[x[1]] || 0) + 1; }); });
      var nm = {cup: "컵", gap: "갭", accum: "매집", whale: "고래", danta: "단타"};
      txt.push("오늘 신호는 " + Object.keys(cnt).map(function(k){ return (nm[k] || k) + " " + cnt[k] + "개"; }).join(", ") + "입니다.");
      var wl = P.WL(), mine = Object.keys(wl).filter(function(k){ return SG[k]; });
      if (mine.length) txt.push("관심종목 중 " + mine.map(function(k){ return wl[k].n; }).join(", ") + "에 신호가 떴습니다.");
      var u = new SpeechSynthesisUtterance(txt.join(" ")); u.lang = "ko-KR"; u.rate = 1.05;
      var vs = speechSynthesis.getVoices().filter(function(v){ return /ko/i.test(v.lang); }); if (vs.length) u.voice = vs[0];
      u.onend = function(){ btn.textContent = "🔊 아침 요약 듣기"; };
      btn.textContent = "⏹ 그만 듣기"; speechSynthesis.speak(u);
    });
  }
  window.PSPEAK = speak;
  // 시황 탭 위에도 듣기 버튼
  P.wrap("market", function(it, a){ if ((M.cats.market || [])[0] && M.cats.market[0].id === it.id){ a.insertAdjacentHTML("afterbegin", '<button class="btn listen" id="lsn1">🔊 아침 요약 듣기</button>'); $("lsn1").onclick = function(){ speak($("lsn1")); }; } });
  var OLD_AV = window.alarmView, OLD_AI = window.alarmInit;
  window.alarmView = function(){
    var al = store.al || {};
    var top = '<section class="card"><h3>🔊 귀로 듣기 <span class="mut">출근길용</span></h3><p class="note" style="margin-top:0">시황 한 줄 · 킥 · 체크할 것 · 국면 · 오늘 신호 · 내 관심종목 신호를 읽어줘요.</p><button class="btn al-sub" id="lsn2">🔊 아침 요약 듣기</button></section>' +
      '<section class="card"><h3>🎚️ 하루 알림 개수 <span class="mut">내 알림(관심종목)</span></h3><div class="seg2" id="limseg">' + [[3, "3개"], [5, "5개"], [10, "10개"], [0, "전부"]].map(function(x){ return '<button data-l="' + x[0] + '"' + ((al.lim || 0) === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join("") + '</div>' +
      '<p class="note" style="margin-top:0">개수를 정하면 중요한 것부터 보내고 나머지는 하루 묶어서 넘겨요. 🔴 돌파·목표가·손절가 → 🟡 돌파 임박·새 갭·고래 → ⚪ 나머지.</p>' +
      '<div class="lvl"><span>🔴 지금 봐야 함</span><span>🟡 오늘 중에</span><span>⚪ 참고</span></div><p class="note">모든 알림 제목 앞에 붙어요. 🔴는 소리·진동이 더 크게(ntfy 우선순위 높음).</p></section>';
    return OLD_AV().replace('<div id="plog"></div>', '') + top + '<div id="pweek"></div><div id="pcal"></div><div id="plog"></div>';
  };
  window.alarmInit = function(){
    OLD_AI();
    var l2 = $("lsn2"); if (l2) l2.onclick = function(){ speak(l2); };
    [].forEach.call(document.querySelectorAll("#limseg button"), function(b){ b.onclick = function(){ store.al = store.al || {}; store.al.lim = +b.dataset.l || null; save(); P.sync();
      [].forEach.call(document.querySelectorAll("#limseg button"), function(x){ x.classList.toggle("on", x === b); }); P.toast("하루 " + (+b.dataset.l ? b.dataset.l + "개까지" : "전부") + " 받아요"); }; });
    X("push_weekly.json").then(function(Wk){ var el = $("pweek"); if (!el || !Wk || !Wk.rows) return;
      el.innerHTML = card("📊 지난주 알림 성적 <span class='mut'>" + md(Wk.date) + " 계산 · 알림 때 가격 → 지금</span>", '<div class="x4"><div><small>종목</small><b>' + Wk.n + '</b></div><div><small>평균</small><b class="' + cls(Wk.avg) + '">' + pct(Wk.avg) + '</b></div><div><small>오른 종목</small><b>' + Wk.win + '</b></div><div><small>승률</small><b>' + Math.round(Wk.win / Math.max(1, Wk.n) * 100) + '%</b></div></div>' +
        V.dbars(Wk.rows.slice(0, 12).map(function(x){ return {label: '<b>' + e(x[0]) + '</b> <span class="mut">' + e(String(x[2]).replace(/^\S+\s/, "").slice(0, 18)) + '</span>', v: x[1], attr: ' onclick="openOP(\'' + e(x[0]) + '\')" style="cursor:pointer"'}; })) +
        '<p class="note">매주 월요일 아침 같은 내용이 ⚪ 알림으로도 와요.</p>'); });
    X("push_log.json").then(function(LG){ var el = $("pcal"); if (!el || !LG || !LG.length) return;
      var by = {}; LG.forEach(function(x){ (by[x.t.slice(0, 10)] = by[x.t.slice(0, 10)] || []).push(x); });
      var t = P.today(), y = +t.slice(0, 4), m = +t.slice(5, 7), view = store.calm || t.slice(0, 7);
      var draw = function(){ var yy = +view.slice(0, 4), mm = +view.slice(5, 7), first = new Date(Date.UTC(yy, mm - 1, 1)), days = new Date(Date.UTC(yy, mm, 0)).getUTCDate(), off = first.getUTCDay();
        var cells = ""; for (var i = 0; i < off; i++) cells += '<i></i>';
        for (var dd = 1; dd <= days; dd++){ var key = view + "-" + (dd < 10 ? "0" : "") + dd, L2 = by[key] || [], hi = L2.some(function(x){ return /^🔴/.test(x.title); });
          cells += '<button class="cd' + (L2.length ? " has" : "") + (hi ? " hi" : "") + (key === t ? " td" : "") + '" data-d="' + key + '">' + dd + (L2.length ? '<em>' + L2.length + '</em>' : '') + '</button>'; }
        el.innerHTML = card("🗓️ 알림 캘린더 <span class='mut'>숫자 = 그날 알림 수 · 빨강 = 🔴 있음</span>", '<div class="row"><button class="btn" id="cpv">‹</button><b>' + yy + '년 ' + mm + '월</b><button class="btn" id="cnx">›</button></div><div class="cal"><b>일</b><b>월</b><b>화</b><b>수</b><b>목</b><b>금</b><b>토</b>' + cells + '</div><div id="cald"></div>');
        $("cpv").onclick = function(){ var d2 = new Date(Date.UTC(yy, mm - 2, 1)); view = d2.toISOString().slice(0, 7); store.calm = view; save(); draw(); };
        $("cnx").onclick = function(){ var d2 = new Date(Date.UTC(yy, mm, 1)); view = d2.toISOString().slice(0, 7); store.calm = view; save(); draw(); };
        [].forEach.call(el.querySelectorAll(".cal .cd"), function(b){ b.onclick = function(){ var L2 = by[b.dataset.d] || [];
          $("cald").innerHTML = L2.length ? '<div class="plog">' + L2.map(function(x){ return '<div class="pl"><div class="row"><b>' + e(x.title) + '</b><span class="mut">' + e(x.t.slice(11)) + '</span></div><small>' + e(x.msg) + '</small><a class="btn" style="margin-top:6px" href="javascript:go(\'' + e(x.tab) + '\')">탭 열기 →</a></div>'; }).join("") + '</div>' : '<p class="note">' + md(b.dataset.d) + ' 알림 없음</p>'; }; }); };
      draw(); });
  };
})();
