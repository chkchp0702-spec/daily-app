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
  // 점수를 처음 보는 사람도: 말로 된 판정 + 신호 개수 + 막대 양 끝 뜻 (10/11)
  function word(v){ return v == null ? "–" : v >= 35 ? "좋음" : v >= 10 ? "조금 좋음" : v > -10 ? "반반 (엇갈림)" : v > -35 ? "조금 나쁨" : "나쁨"; }
  // 10/13: 점수에 들어간 신호가 3개 미만이면 「판단 보류」 · 개수와 점수 방향이 다르면 무게를 같이 보여 줌
  function act(sigs){ return (sigs || []).filter(function(s){ return s.st != null && s.w > 0 && !(s.id === "thrust" && s.st === 0); }); }
  function wline(a, v){
    var n = function(k){ return a.filter(function(s){ return s.st === k; }).length; }, W = function(k){ return a.filter(function(s){ return s.st === k; }).reduce(function(t, s){ return t + s.w; }, 0); };
    var dc = n(1) - n(-1), sv = v == null ? 0 : v >= 10 ? 1 : v <= -10 ? -1 : 0, sc = dc > 0 ? 1 : dc < 0 ? -1 : 0;
    if (sc === sv) return "";
    var f = function(x){ return (Math.round(x * 10) / 10).toString(); };
    return '<div class="rb-gwt">중요도 반영: 🟢 무게 ' + f(W(1)) + ' · 🔴 무게 ' + f(W(-1)) + '<br>' + (W(1) > W(-1) ? "🟢 쪽에 중요한 신호가 더 많아요" : W(1) < W(-1) ? "🔴 쪽에 중요한 신호가 더 많아요" : "무게로는 똑같아요") + '</div>';
  }
  function gauge(name, sub, v, sigs, gk){
    var a = act(sigs), low = a.length > 0 && a.length < 3;
    var x = v == null ? 50 : (v + 100) / 2, c = low ? "#8a94a8" : col(v);
    var n = function(k){ return a.filter(function(s){ return s.st === k; }).length; };
    return '<div class="rb-gc' + (low ? " low" : "") + '" data-gk="' + (gk || "") + '" role="button"><div class="rb-gt"><b>' + name + ' <i class="rb-tap">ⓘ</i></b><small>' + sub + '</small></div>' +
      '<div class="rb-gv" style="color:' + c + '">' + sg(v) + '<span class="rb-gw">' + (low ? "판단 보류" : word(v)) + '</span></div>' +
      '<div class="rb-gb"><i style="left:' + x.toFixed(1) + '%;background:' + c + '"></i></div>' +
      '<div class="rb-ge"><span>−100 경고</span><span>0</span><span>+100 좋음</span></div>' +
      (a.length ? '<div class="rb-gn">신호 ' + a.length + '개 <span>🟢' + n(1) + ' ⚪' + n(0) + ' 🔴' + n(-1) + '</span></div>' : '') +
      (low ? '<div class="rb-gwt warn">신호가 ' + a.length + '개뿐이라 점수를 믿기 어려워요 — 국면은 이 쪽을 0으로 보고 정해요</div>' : wline(a, v)) + '</div>';
  }
  function gaugeHelp(R){
    var t = R.now_timing, c = R.now_cycle;
    var f = function(q, h){ return q && q.mk ? '이 점수대(' + e(q.lab) + ')였던 ' + q.n + '주 → ' + h + ' 뒤 ' + e(R.index) + ' 평균 ' + pc(q.mk[0]) : q && q.us ? '이 점수대(' + e(q.lab) + ')였던 ' + q.n + '주 → ' + h + ' 뒤 S&P500 평균 ' + pc(q.us[0]) + ' · 코스피 ' + pc(q.kr[0]) : ''; };
    return '<div class="rb-help"><b>점수 읽는 법</b> — 신호마다 🟢 좋음 +1 · ⚪ 보통 0 · 🔴 경고 −1 을 매겨 (중요한 신호는 무게를 더 줘서) 평균 낸 것을 −100~+100으로 바꾼 숫자예요. ' +
      '<b>0 근처 = 좋은 신호와 나쁜 신호가 반반</b>, +면 좋은 쪽이 많고 −면 경고가 많아요.' +
      '<br>📊 <b>시장 타이밍</b> = 주가 흐름 자체(지수 200일선·오른 종목 수·신고가·공포지수·외국인 등)로 본 1~3개월 날씨' + (t ? ' · ' + f(t, "3개월") : '') +
      '<br>🏭 <b>경기 사이클</b> = 금리·실업·경기선행지수로 본 6~18개월 경기' + (c ? ' · ' + f(c, "6개월") : '') +
      '<br><span class="mut">아래 신호 목록에서 무엇이 🟢·🔴인지 볼 수 있어요.</span></div>';
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
  // 🌏 10/13 시장별 판: 표·과거 성적 칸을 그 시장 지수 하나로 (합본은 미·한 두 칸)
  function cols(R){ return R && R.mk ? [[R.flag + " " + R.index, "mk"]] : [["🇺🇸 S&P500", "us"], ["🇰🇷 코스피", "kr"]]; }
  var CUR = null;
  function past(q, h){
    if (!q || !(q.us || q.mk)) return "";
    return '<div class="rb-past"><div class="rb-ph">📜 2000년 이후 지금과 같은 국면이었던 ' + q.n + '주 → ' + h + ' 동안</div><div class="rb-pg">' +
      cols(CUR).map(function(c){ return [c[0], q[c[1]]]; }).map(function(x){ var a = x[1] || [];
        return '<div><small>' + x[0] + '</small><b style="color:' + (a[3] >= 35 ? V.DN : a[3] <= 20 ? V.UP : "#c9a227") + '">' + (a[3] != null ? a[3] + "%" : "–") + '</b><em>−10% 넘게 빠진 비율<br>평균 수익 ' + pc(a[0]) + ' · 플러스 ' + (a[1] != null ? a[1] + "%" : "–") + '</em></div>'; }).join("") + '</div></div>';
  }
  function btLine(s){
    var b = s.bt;
    if (!b) return '<div class="rb-bt">🧪 과거 자료가 없어 검증은 못 했어요 · 무게 1</div>';
    var txt = b.since + '년 이후 검증 (' + b.h + ' 안에 −10% 넘게 빠진 비율, ' + (b.one && CUR && CUR.index ? CUR.index : '미·한 평균') + '): 경고일 때 <b class="dn">' + b.neg[3] + '%</b> · 좋음일 때 <b class="up">' + b.pos[3] + '%</b> <span class="mut">(평균 수익 경고 ' + pc(b.neg[1]) + ' · 좋음 ' + pc(b.pos[1]) + ')</span>';
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
    var C = cols(CUR);
    return '<table class="rb-tb"><tr><th>점수</th><th>주</th>' + C.map(function(c){ return '<th>' + c[0] + ' −10% 확률 · 수익</th>'; }).join("") + '</tr>' + rows.map(function(r){
      var on = now && now.lab === r.lab;
      return '<tr' + (on ? ' class="on"' : '') + '><td>' + e(r.lab) + (on ? ' ◀' : '') + '</td><td>' + r.n + '</td>' + C.map(function(c){ return c[1]; }).map(function(k){ var a = r[k];
        return '<td>' + (a ? '<b class="' + (a[3] >= 35 ? "dn" : a[3] <= 20 ? "up" : "") + '">' + a[3] + '%</b> <small>' + pc(a[0]) + '</small>' : '<span class="mut">표본 적음</span>') + '</td>'; }).join("") + '</tr>'; }).join("") + '</table>';
  }
  var MKS = [["US", "🇺🇸 미국"], ["KR", "🇰🇷 한국"], ["JP", "🇯🇵 일본"], ["CN", "🇨🇳 중국"], ["HK", "🇭🇰 홍콩"], ["ALL", "🌐 미·한 합본"]];
  function tabs(cur, M){
    return '<div class="rb-tabs" role="tablist">' + MKS.filter(function(m){ return m[0] === "ALL" || (M && M[m[0]]); }).map(function(m){
      var r = m[0] === "ALL" ? null : M[m[0]];
      return '<button type="button" class="rb-tab' + (m[0] === cur ? ' on' : '') + '" data-rmk="' + m[0] + '">' + m[1] + (r && r.label ? '<small>' + e(r.label) + '</small>' : '<small>💼 현금 규칙이 씀</small>') + '</button>'; }).join("") + '</div>';
  }
  function board(R, cur, M){
    if (!R || !R.sig) return "";
    CUR = R;
    if (!R.v && !R.mk) return card("🧭 국면 신호판", '<p class="note">새 계산 방식으로 바꾸는 중이에요. 다음 갱신 때 보여요.</p>');
    var cyc = R.sig.filter(function(s){ return s.grp === "cycle"; }), tim = R.sig.filter(function(s){ return s.grp === "timing"; });
    var h = tabs(cur, M) + (cur === "ALL" ? '<p class="note rb-mknote">🌐 미국 경기 신호 + 미·한 주가 신호를 섞은 판이에요(💼 포트 현금 비중이 이 판을 써요). 나라별로는 위 탭을 누르세요.</p>' : '') +
      '<div class="rb-top"><div class="rb-lab"><small>' + (R.mk ? e(R.flag + " " + R.name) + ' · ' : '') + '지금 국면</small><b>' + e(R.label) + '</b></div><em>' + e((R.updated || "").slice(5)) + '</em></div>' +
      '<p class="rb-verdict">' + e(R.verdict) + '</p>' +
      '<div class="rb-g2">' + gauge("경기 사이클", "6~18개월 뒤", R.cycle, cyc, "cycle") + gauge("시장 타이밍", "1~3개월 뒤", R.timing, tim, "timing") + '</div>' +
      '<div class="rb-x" id="rbx" hidden></div>' + gaugeHelp(R) +
      past(R.quad_stats, "3개월") +
      // 10/11 사용자: "나침반이 복잡해 보여" — 지도·흐름·신호 목록은 「자세히」 안으로
      '<details class="rb-det"><summary>🔎 자세히 — 국면 지도 · 두 점수 흐름 · 신호 ' + R.sig.length + '개</summary>' + quadMap(R);
    if (R.changes && R.changes.length) h += '<div class="rb-chg">🔔 달라진 것: ' + R.changes.map(function(c){ return e(c.name) + ' ' + ic(c.from) + '→' + ic(c.to); }).join(" · ") + '</div>';
    h += '<div class="sub2">두 점수의 흐름</div>' + lines(R);
    [["🏭 경기 사이클 <small>6~18개월 뒤를 말하는 것</small>", cyc, R.cycle], ["📊 시장 타이밍 <small>1~3개월 뒤를 말하는 것</small>", tim, R.timing]].forEach(function(g){
      h += '<div class="rb-grp"><div class="rb-gh"><b>' + g[0] + '</b><span style="color:' + col(g[2]) + '">' + sg(g[2]) + '</span></div>' + g[1].map(row).join("") + '</div>';
    });
    h += '<details class="rb-more"><summary>📊 점수별 과거 성적 보기</summary><div class="sub2">경기 사이클 점수 → 6개월 동안</div>' + table((R.tables || {}).cycle, "6개월", R.now_cycle) +
      '<div class="sub2">시장 타이밍 점수 → 3개월 동안</div>' + table((R.tables || {}).timing, "3개월", R.now_timing) +
      '<p class="note">큰 글씨 = 그 기간 안에 고점 대비 −10% 넘게 빠진 적이 있는 비율 · 작은 글씨 = 평균 수익 · ◀ = 지금. ' + e(R.bt_note || "") + '</p></details>';
    h += '<p class="note">▲ 좋음 +1 · ▼ 경고 −1 · – 중립 0 에 지표별 무게(과거에 「크게 빠질 위험」을 잘 가른 만큼, 0~2)를 곱해 평균 ×100. 이 지표들은 평균 수익보다 하락 위험을 훨씬 잘 맞혀요. 줄을 누르면 뜻·기준·과거 검증·출처가 보여요.' + (R.errors && R.errors.length ? ' <em class="mut">오늘 못 받은 자료 ' + R.errors.length + '개</em>' : '') + '</p>';
    h += '</details>';
    return card("🧭 국면 신호판 <span class='mut'>" + (R.mk ? e(R.flag + " " + R.name) + " 시장은 어느 국면인가" : "미·한 합본") + "</span>", h, "", "rbboard");
  }
  // 🧭 두 점수를 누르면 아래에 설명 (10/11 사용자: "경기 사이클과 시장 타이밍 눌렀을 때 밑에 설명 이쁘게 · 닫기 버튼도")
  var LASTR = null;
  function explain(R, gk){
    var cyc = gk === "cycle", v = cyc ? R.cycle : R.timing, q = cyc ? R.now_cycle : R.now_timing;
    var sigs = R.sig.filter(function(s){ return s.grp === gk && s.st != null && !(s.id === "thrust" && s.st === 0); })
      .sort(function(a, b){ return ((b.w > 0) - (a.w > 0)) || (b.st - a.st) || ((b.w || 0) - (a.w || 0)); });
    var dot = function(st){ return st === 1 ? "🟢" : st === -1 ? "🔴" : "⚪"; };
    var h = '<div class="rbx-h" style="--gc:' + col(v) + '"><div><small>' + (cyc ? "🏭 경기 사이클 · 6~18개월 뒤 경기" : "📊 시장 타이밍 · 1~3개월 뒤 주가 흐름") + '</small>' +
      '<b>' + sg(v) + ' <span>' + (act(sigs).length && act(sigs).length < 3 ? "판단 보류" : word(v)) + '</span></b></div><button class="rbx-x" type="button">닫기 ✕</button></div>' +
      (act(sigs).length && act(sigs).length < 3 ? '<p class="rbx-low">⚠️ 점수에 들어간 신호가 <b>' + act(sigs).length + '개</b>뿐이에요. 하나만 바뀌어도 점수가 크게 출렁여서, 이 쪽은 <b>판단 보류</b>로 보고 국면을 정해요.</p>' : '') +
      '<p class="rbx-what">' + (cyc ? "금리·신용·실업·경기선행지수처럼 <b>경기 자체</b>를 보는 신호예요. 느리게 움직이고, 6~18개월 뒤 경기가 좋을지 미리 알려 줘요."
                                   : "지수 200일선·오른 종목 수·신고가·공포지수·외국인처럼 <b>주가 흐름 자체</b>를 보는 신호예요. 빨리 움직이고, 1~3개월 날씨를 알려 줘요.") + '</p>';
    if (q && q.mk) h += '<div class="rbx-past"><small>2000년 이후 이 점수대(' + e(q.lab) + ')였던 ' + q.n + '주 → ' + (cyc ? "6개월" : "3개월") + ' 뒤</small>' +
      '<div><span>' + e(R.flag + " " + R.index) + ' <b class="' + (q.mk[0] >= 0 ? "up" : "dn") + '">' + pc(q.mk[0]) + '</b></span><span>−10% 넘게 빠질 확률 <b>' + q.mk[3] + '%</b></span></div></div>';
    else if (q && q.us) h += '<div class="rbx-past"><small>2000년 이후 이 점수대(' + e(q.lab) + ')였던 ' + q.n + '주 → ' + (cyc ? "6개월" : "3개월") + ' 뒤</small>' +
      '<div><span>🇺🇸 S&P500 <b class="' + (q.us[0] >= 0 ? "up" : "dn") + '">' + pc(q.us[0]) + '</b></span><span>🇰🇷 코스피 <b class="' + (q.kr[0] >= 0 ? "up" : "dn") + '">' + pc(q.kr[0]) + '</b></span>' +
      '<span>−10% 넘게 빠질 확률 <b>' + q.us[3] + '%</b></span></div></div>';
    h += '<div class="rbx-sh">신호 ' + sigs.length + '개 — 지금 어떤가</div><div class="rbx-list">' + sigs.map(function(s){
      return '<div class="rbx-r st' + s.st + (s.w > 0 ? '' : ' w0') + '"><span class="rbx-d">' + dot(s.st) + '</span><div><b>' + e(s.name) + (s.w >= 1.5 ? ' <em>중요</em>' : '') + (s.w > 0 ? '' : ' <em>참고 · 점수엔 안 들어감</em>') + '</b>' +
        '<small>' + e(s.val || "") + (s.rule ? ' · ' + e(s.rule) : '') + '</small></div></div>'; }).join("") + '</div>' +
      '<p class="rbx-how">점수 = 신호마다 🟢 +1 · ⚪ 0 · 🔴 −1 (중요 신호는 무게를 더) 평균을 −100~+100 으로. 0 근처면 반반이에요.</p>' +
      '<button class="rbx-x rbx-x2" type="button">설명 닫기 ▴</button>';
    return h;
  }
  document.addEventListener("click", function(ev){
    var x = ev.target.closest && ev.target.closest(".rbx-x");
    if (x){ var bx = x.closest(".rb-x"), top = bx.closest(".card"); bx.hidden = true; bx.dataset.gk = "";
      if (x.classList.contains("rbx-x2") && top){ var y = top.getBoundingClientRect().top + window.scrollY - 140; window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); }
      [].forEach.call(document.querySelectorAll(".rb-gc.on"), function(g){ g.classList.remove("on"); }); return; }
    var g = ev.target.closest && ev.target.closest(".rb-gc[data-gk]"); if (!g || !LASTR) return;
    var box = g.closest(".card").querySelector(".rb-x"); if (!box) return;
    var gk = g.dataset.gk, same = !box.hidden && box.dataset.gk === gk;
    [].forEach.call(g.parentNode.children, function(c){ c.classList.toggle("on", !same && c === g); });
    if (same){ box.hidden = true; box.dataset.gk = ""; return; }
    var cd = g.closest(".card"); if (cd && cd.classList.contains("xs-clamp")){ cd.classList.remove("xs-clamp"); var cb = cd.querySelector(":scope > .xs-cl"); if (cb) cb.remove(); }   // 설명이 「전체 보기」에 잘리지 않게
    box.innerHTML = explain(LASTR, gk); box.dataset.gk = gk; box.hidden = false;
    box.classList.remove("rbx-in"); void box.offsetWidth; box.classList.add("rbx-in");
  });
  var css2 = document.createElement("style");
  css2.textContent =
    ".rb-tabs{display:flex;gap:6px;overflow-x:auto;margin:-2px -2px 10px;padding:2px;scrollbar-width:none}.rb-tabs::-webkit-scrollbar{display:none}" +
    ".rb-tab{flex:none;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:6px 10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;text-align:left;line-height:1.25}" +
    ".rb-tab small{display:block;font-size:12.5px;font-weight:600;color:var(--sub)}.rb-tab.on{background:var(--text);color:var(--bg);border-color:var(--text)}.rb-tab.on small{color:var(--bg);opacity:.75}" +
    ".rb-mknote{margin:0 0 8px}" +
    ".rb-gc[data-gk]{cursor:pointer;border:1.5px solid transparent;transition:border-color .15s}.rb-gc.on{border-color:var(--text)}.rb-gc:active{transform:scale(.98)}" +
    ".rb-tap{font-style:normal;font-size:12.5px;color:var(--sub);font-weight:400}" +
    ".rb-x{margin:4px 0 10px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);padding:12px 12px 10px;font-size:13px;line-height:1.55}" +
    ".rb-x.rbx-in{animation:rbxIn .2s ease-out}@keyframes rbxIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}" +
    ".rbx-h{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;border-left:4px solid var(--gc);padding-left:10px}" +
    ".rbx-h small{display:block;color:var(--sub);font-size:12.5px}.rbx-h b{font-size:22px;font-weight:900;color:var(--gc)}.rbx-h b span{font-size:13px;color:var(--text);font-weight:700}" +
    ".rbx-x{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".rbx-what{margin:10px 0 8px;color:var(--text)}" +
    ".rb-gwt{font-size:12.5px;color:var(--sub);margin-top:6px;line-height:1.45}.rb-gwt.warn{color:#ffb84d}.rb-gc.low .rb-gb{opacity:.5}" +
    ".rbx-low{margin:8px 0;padding:8px 10px;border-radius:10px;background:rgba(255,184,77,.1);color:#ffb84d;font-size:12.5px}.rbx-r.w0{opacity:.55}" +
    ".rbx-past{background:var(--panel);border-radius:10px;padding:8px 10px;margin-bottom:8px}.rbx-past small{color:var(--sub);font-size:12.5px}.rbx-past div{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:3px;font-size:12.5px}" +
    ".rbx-sh{font-weight:800;font-size:12.5px;color:var(--sub);margin:6px 0 4px}" +
    ".rbx-list{display:flex;flex-direction:column;gap:4px}.rbx-r{display:flex;gap:8px;align-items:flex-start;background:var(--panel);border-radius:10px;padding:7px 9px}" +
    ".rbx-r b{font-size:13px}.rbx-r b em{font-style:normal;font-size:12.5px;color:var(--sub);border:1px solid var(--line);border-radius:6px;padding:0 4px;margin-left:3px}" +
    ".rbx-r small{display:block;color:var(--sub);font-size:12.5px;line-height:1.45}.rbx-d{flex:none;font-size:13px;line-height:1.5}" +
    ".rbx-how{margin:8px 0 0;font-size:12.5px;color:var(--sub)}.rbx-x2{display:block;width:100%;margin-top:10px;padding:9px}";
  document.head.appendChild(css2);
  var MKD = null, ALLR = null, CEL = null;
  function pick(){ var k = null; try { k = localStorage.getItem("rbmk"); } catch (_){}
    if (k === "ALL" && ALLR) return k; return k && MKD && MKD[k] ? k : (MKD && MKD.US ? "US" : "ALL"); }
  function draw(k){
    var R = k === "ALL" ? ALLR : (MKD || {})[k];
    if (!R){ k = "ALL"; R = ALLR; }
    LASTR = R; CEL.innerHTML = R ? board(R, k, MKD) : "";
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".rb-tab[data-rmk]"); if (!b || !CEL) return;
    try { localStorage.setItem("rbmk", b.dataset.rmk); } catch (_){}
    var y = CEL.getBoundingClientRect().top; draw(b.dataset.rmk);
    var y2 = CEL.getBoundingClientRect().top; if (Math.abs(y2 - y) > 2) window.scrollBy(0, y2 - y);
  });
  window.CPREG = function(el){
    CEL = el;
    // 10/13: 국면 파일은 하루 두 번 바뀌는데 X() 는 수집 시각으로만 주소를 바꿔 옛 판이 남던 문제 → 5분마다 새 주소
    var t5 = Math.floor(Date.now() / 300000), gx = function(n){ return getJSON("archive/x/" + n + "?r" + t5).catch(function(){ return X(n); }); };
    Promise.all([gx("regime.json"), gx("regime_mk.json")]).then(function(a){
      ALLR = a[0]; MKD = a[1] && a[1].markets ? a[1].markets : null;
      draw(pick());
    });
  };
})();
