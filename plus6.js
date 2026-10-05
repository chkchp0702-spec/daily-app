/* CH Investing — 🧭 국면 신호판 v2 (나침반 맨 위)
   경기 사이클(6~18개월) · 시장 타이밍(1~3개월) 두 점수 + 사분면 + 2000년 이후 검증 */
(function(){
  var e = V.e, P = PL, X = P.X, card = P.card;
  // 한국식 색: 좋음(상승 쪽) = 빨강 ▲ · 경고(하락 쪽) = 파랑 ▼
  function ic(st){ return st == null ? '<b class="rb-d na">·</b>' : st === 1 ? '<b class="rb-d ok">▲</b>' : st === -1 ? '<b class="rb-d bad">▼</b>' : '<b class="rb-d mid">–</b>'; }
  function col(v){ return v == null ? "#8a94a8" : v >= 10 ? V.UP : v <= -10 ? V.DN : "#c9a227"; }
  function sg(v){ return v == null ? "–" : (v > 0 ? "+" : "") + v; }
  function pc(v){ return v == null ? "–" : (v > 0 ? "+" : "") + v + "%"; }
  function mini(vals, color, w, h){
    vals = (vals || []).filter(function(v){ return v != null && !isNaN(v); });
    if (vals.length < 3) return "";
    w = w || 70; h = h || 20;
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); if (hi === lo) hi = lo + 1;
    var pts = vals.map(function(v, i){ return (i / (vals.length - 1) * w).toFixed(1) + "," + (h - (v - lo) / (hi - lo) * (h - 2) - 1).toFixed(1); });
    return '<svg class="rb-mini" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><polyline points="' + pts.join(" ") + '" fill="none" stroke="' + (color || "#8a94a8") + '" stroke-width="1.6"/></svg>';
  }
  function gauge(name, sub, v){
    var x = v == null ? 50 : (v + 100) / 2;
    return '<div class="rb-gc"><div class="rb-gt"><b>' + name + '</b><small>' + sub + '</small></div><div class="rb-gv" style="color:' + col(v) + '">' + sg(v) + '</div>' +
      '<div class="rb-gb"><i style="left:' + x.toFixed(1) + '%;background:' + col(v) + '"></i></div></div>';
  }
  // 사분면 지도: 가로 = 시장 타이밍, 세로 = 경기 사이클, 최근 26주 꼬리
  function quadMap(R){
    var W = 300, H = 200, cx = W / 2, cy = H / 2;
    var X_ = function(t){ return cx + (t || 0) / 100 * (W / 2 - 14); }, Y_ = function(c){ return cy - (c || 0) / 100 * (H / 2 - 14); };
    var s = '<svg class="rb-q" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<rect x="' + cx + '" y="0" width="' + cx + '" height="' + cy + '" fill="' + V.UP + '" fill-opacity=".07"/><rect x="0" y="' + cy + '" width="' + cx + '" height="' + cy + '" fill="' + V.DN + '" fill-opacity=".08"/>' +
      '<line x1="0" x2="' + W + '" y1="' + cy + '" y2="' + cy + '" stroke="#3a4255"/><line y1="0" y2="' + H + '" x1="' + cx + '" x2="' + cx + '" stroke="#3a4255"/>' +
      '<text x="' + (W - 6) + '" y="14" text-anchor="end" fill="#ff8a8a" font-size="10.5" font-weight="700">상승 국면</text>' +
      '<text x="6" y="14" fill="#c9a227" font-size="10.5" font-weight="700">경기 속 조정</text>' +
      '<text x="' + (W - 6) + '" y="' + (H - 6) + '" text-anchor="end" fill="#c9a227" font-size="10.5" font-weight="700">천장 조심</text>' +
      '<text x="6" y="' + (H - 6) + '" fill="#7fb0ff" font-size="10.5" font-weight="700">하락 국면</text>' +
      '<text x="' + (W - 6) + '" y="' + (cy + 12) + '" text-anchor="end" fill="#6b7385" font-size="9">시장 타이밍 →</text><text x="' + (cx - 4) + '" y="' + (cy - 6) + '" text-anchor="end" fill="#6b7385" font-size="9">↑ 경기 사이클</text>';
    var h = (R.hist || []).filter(function(x){ return x[1] != null && x[2] != null; }).slice(-26);
    if (h.length > 1) s += '<polyline points="' + h.map(function(x){ return X_(x[2]).toFixed(1) + "," + Y_(x[1]).toFixed(1); }).join(" ") + '" fill="none" stroke="#8a94a8" stroke-opacity=".5" stroke-width="1.4"/>' +
      h.map(function(x, i){ return '<circle cx="' + X_(x[2]).toFixed(1) + '" cy="' + Y_(x[1]).toFixed(1) + '" r="2.2" fill="#8a94a8" fill-opacity="' + (0.2 + i / h.length * 0.6).toFixed(2) + '" data-tip="' + e(x[0].slice(2) + " · 경기 " + sg(x[1]) + " · 시장 " + sg(x[2])) + '"/>'; }).join("");
    if (R.cycle != null && R.timing != null) s += '<circle cx="' + X_(R.timing).toFixed(1) + '" cy="' + Y_(R.cycle).toFixed(1) + '" r="7" fill="#ffb84d" stroke="#121826" stroke-width="2.5"><animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite"/></circle>';
    return s + '</svg><p class="note" style="margin-top:2px">주황 점 = 오늘 · 회색 꼬리 = 지난 반년 (매주)</p>';
  }
  function lines(R){
    var h = (R.hist || []).filter(function(x){ return x[1] != null || x[2] != null; });
    if (h.length < 5) return "";
    var W = 330, H = 110, n = h.length, X_ = function(i){ return 8 + i / (n - 1) * (W - 16); }, Y_ = function(v){ return H / 2 - (v || 0) / 100 * (H / 2 - 8); };
    var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '"><line x1="8" x2="' + (W - 8) + '" y1="' + H / 2 + '" y2="' + H / 2 + '" stroke="#3a4255" stroke-dasharray="3 3"/>';
    [[1, "#ffb84d"], [2, "#7c9cff"]].forEach(function(p){
      s += '<polyline points="' + h.map(function(x, i){ return x[p[0]] == null ? null : X_(i).toFixed(1) + "," + Y_(x[p[0]]).toFixed(1); }).filter(Boolean).join(" ") + '" fill="none" stroke="' + p[1] + '" stroke-width="2"/>';
    });
    s += '<text x="10" y="12" fill="#8a94a8" font-size="10">' + e(h[0][0].slice(0, 7)) + '</text><text x="' + (W - 10) + '" y="12" fill="#8a94a8" font-size="10" text-anchor="end">' + e(h[n - 1][0].slice(0, 7)) + '</text></svg>';
    return s + '<div class="lg"><span><i style="background:#ffb84d"></i>경기 사이클</span><span><i style="background:#7c9cff"></i>시장 타이밍</span><span class="mut">최근 2년 · 매주</span></div>';
  }
  function past(q, h){
    if (!q || !q.us) return "";
    return '<div class="rb-past"><div class="rb-ph">📜 2000년 이후 지금과 같은 국면이었던 ' + q.n + '주 → ' + h + ' 동안</div><div class="rb-pg">' +
      [["🇺🇸 S&P500", q.us], ["🇰🇷 코스피", q.kr]].map(function(x){ var a = x[1] || [];
        return '<div><small>' + x[0] + '</small><b style="color:' + (a[3] >= 35 ? V.DN : a[3] <= 20 ? V.UP : "#c9a227") + '">' + (a[3] != null ? a[3] + "%" : "–") + '</b><em>−10% 넘게 빠진 비율<br>평균 수익 ' + pc(a[0]) + ' · 플러스 ' + (a[1] != null ? a[1] + "%" : "–") + '</em></div>'; }).join("") + '</div></div>';
  }
  function btLine(s){
    var b = s.bt;
    if (!b) return '<div class="rb-bt">🧪 과거 자료가 없어 검증은 못 했어요 · 무게 1</div>';
    var txt = b.since + '년 이후 검증 (' + b.h + ' 안에 −10% 넘게 빠진 비율, 미·한 평균): 경고일 때 <b class="dn">' + b.neg[3] + '%</b> · 좋음일 때 <b class="up">' + b.pos[3] + '%</b> <span class="mut">(평균 수익 경고 ' + pc(b.neg[1]) + ' · 좋음 ' + pc(b.pos[1]) + ')</span>';
    if (!(s.w > 0)) return '<div class="rb-bt off">🧪 ' + txt + ' — 위험을 잘 못 갈라서 <b>점수에서 뺐어요</b> (참고로만)</div>';
    return '<div class="rb-bt">🧪 ' + txt + ' → 무게 ' + s.w + '</div>';
  }
  function row(s){
    var st = s.st, hist = s.hist || [];
    var right = '<span class="rb-v">' + e(s.val || "") + '</span>' + (hist.length ? mini(hist, st === 1 ? V.UP : st === -1 ? V.DN : "#8a94a8") : "");
    var body = '<p>' + e(s.mean || "") + '</p>' +
      (s.rows ? '<div class="rb-ctry">' + s.rows.map(function(x){ return '<span class="' + (x.st === 1 ? "up" : x.st === -1 ? "dn" : "") + '">' + x.flag + ' ' + (x.v != null ? x.v + (x.u != null ? x.u : "%") : x.gap != null ? (x.gap > 0 ? "+" : "") + x.gap + "%" : "–") + (x.fired ? ' <b>발동 ' + e(x.fired) + '</b>' : '') + (x.note ? ' <em>' + e(x.note) + '</em>' : '') + '</span>'; }).join("") + '</div>' : '') +
      btLine(s) +
      '<div class="rb-meta">' + (s.lead ? '<span>⏱ 앞서는 정도: ' + e(s.lead) + '</span>' : '') + (s.rule ? '<span>📏 ' + e(s.rule) + '</span>' : '') + (s.src ? '<span>📎 ' + e(s.src) + '</span>' : '') + '</div>';
    return '<details class="rb-r ' + (st === 1 ? "rb-ok" : st === -1 ? "rb-bad" : st === 0 ? "rb-mid" : "rb-na") + (s.w === 0 && s.bt ? " rb-off" : "") + '"><summary><span class="rb-i">' + ic(st) + '</span><span class="rb-n">' + e(s.name) + (s.w >= 1.5 ? ' <small>중요</small>' : '') + (s.w === 0 && s.bt ? ' <small class="x">참고</small>' : '') + '</span>' + right + '</summary>' + body + '</details>';
  }
  function table(rows, h, now){
    if (!rows || !rows.length) return "";
    return '<table class="rb-tb"><tr><th>점수</th><th>주</th><th>🇺🇸 −10% 확률 · 수익</th><th>🇰🇷 −10% 확률 · 수익</th></tr>' + rows.map(function(r){
      var on = now && now.lab === r.lab;
      return '<tr' + (on ? ' class="on"' : '') + '><td>' + e(r.lab) + (on ? ' ◀' : '') + '</td><td>' + r.n + '</td>' + ["us", "kr"].map(function(k){ var a = r[k];
        return '<td>' + (a ? '<b class="' + (a[3] >= 35 ? "dn" : a[3] <= 20 ? "up" : "") + '">' + a[3] + '%</b> <small>' + pc(a[0]) + '</small>' : '<span class="mut">표본 적음</span>') + '</td>'; }).join("") + '</tr>'; }).join("") + '</table>';
  }
  function board(R){
    if (!R || !R.sig) return "";
    if (!R.v) return card("🧭 국면 신호판", '<p class="note">새 계산 방식으로 바꾸는 중이에요. 다음 갱신 때 보여요.</p>');
    var cyc = R.sig.filter(function(s){ return s.grp === "cycle"; }), tim = R.sig.filter(function(s){ return s.grp === "timing"; });
    var h = '<div class="rb-top"><div class="rb-lab"><small>지금 국면</small><b>' + e(R.label) + '</b></div><em>' + e((R.updated || "").slice(5)) + '</em></div>' +
      '<p class="rb-verdict">' + e(R.verdict) + '</p>' +
      '<div class="rb-g2">' + gauge("경기 사이클", "6~18개월 뒤", R.cycle) + gauge("시장 타이밍", "1~3개월 뒤", R.timing) + '</div>' +
      quadMap(R) + past(R.quad_stats, "3개월");
    if (R.changes && R.changes.length) h += '<div class="rb-chg">🔔 달라진 것: ' + R.changes.map(function(c){ return e(c.name) + ' ' + ic(c.from) + '→' + ic(c.to); }).join(" · ") + '</div>';
    h += '<div class="sub2">두 점수의 흐름</div>' + lines(R);
    [["🏭 경기 사이클 <small>6~18개월 뒤를 말하는 것</small>", cyc, R.cycle], ["📊 시장 타이밍 <small>1~3개월 뒤를 말하는 것</small>", tim, R.timing]].forEach(function(g){
      h += '<div class="rb-grp"><div class="rb-gh"><b>' + g[0] + '</b><span style="color:' + col(g[2]) + '">' + sg(g[2]) + '</span></div>' + g[1].map(row).join("") + '</div>';
    });
    h += '<details class="rb-more"><summary>📊 점수별 과거 성적 보기</summary><div class="sub2">경기 사이클 점수 → 6개월 동안</div>' + table((R.tables || {}).cycle, "6개월", R.now_cycle) +
      '<div class="sub2">시장 타이밍 점수 → 3개월 동안</div>' + table((R.tables || {}).timing, "3개월", R.now_timing) +
      '<p class="note">큰 글씨 = 그 기간 안에 고점 대비 −10% 넘게 빠진 적이 있는 비율 · 작은 글씨 = 평균 수익 · ◀ = 지금. ' + e(R.bt_note || "") + '</p></details>';
    h += '<p class="note">▲ 좋음 +1 · ▼ 경고 −1 · – 중립 0 에 지표별 무게(과거에 「크게 빠질 위험」을 잘 가른 만큼, 0~2)를 곱해 평균 ×100. 이 지표들은 평균 수익보다 하락 위험을 훨씬 잘 맞혀요. 줄을 누르면 뜻·기준·과거 검증·출처가 보여요.' + (R.errors && R.errors.length ? ' <em class="mut">오늘 못 받은 자료 ' + R.errors.length + '개</em>' : '') + '</p>';
    return card("🧭 국면 신호판 <span class='mut'>지금 시장은 어느 국면인가</span>", h, "", "rbboard");
  }
  window.CPREG = function(el){
    X("regime.json").then(function(R){ el.innerHTML = R ? board(R) : ""; });
  };
})();
