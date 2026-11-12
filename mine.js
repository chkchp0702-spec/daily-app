/* CH Investing — 홈 4장 (11/10 냉정 분석 3차 · 사용자 「모든 걸 허락하고 다 실행」)
   #7 ⭐ 내 종목 — 관심종목 등락·수급·뉴스·실적일 한 화면 (네이버증권식 · 「내 것」이 있어야 매일 옴)
   #8 ⚡ 왜 움직였나 — 오늘 ±5% 넘게 움직인 대형주·관심종목에 이유 한 줄 (뉴스 제목 · 없으면 수급)
   #9 📅 이번 주 — 경제 지표(미·한·중·일 중요) + 대형주·포트·관심종목 실적 (cal_week.json)
   #10 💬 고객 질문 10 — 「지금 팔아야 해요?」 같은 질문에 오늘 숫자로 채운 답 + 카톡 복사
   자리: 쉬운 화면 = 첫 상자 바로 아래 · 전체 메뉴 = 첫 결론 카드 아래. 고객 제안 탭 맨 위·🙋·검색에서도 💬 를 엶. AI·돈 안 씀. */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kd(off){ return new Date(Date.now() + 9 * 3600e3 + (off || 0) * 864e5).toISOString().slice(0, 10); }
  function md(d){ return d ? Number(d.slice(5, 7)) + "/" + Number(d.slice(8, 10)) : ""; }
  function wd(d){ return ["일", "월", "화", "수", "목", "금", "토"][new Date(d + "T00:00:00Z").getUTCDay()]; }
  function won(v){ if (v == null) return "–"; var a = Math.abs(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + (a >= 10000 ? (a / 10000).toFixed(1) + "조" : Math.round(a).toLocaleString() + "억"); }
  function px(v, kr){ return v == null ? "" : kr ? Math.round(v).toLocaleString() + "원" : "$" + (+v).toFixed(v >= 100 ? 1 : 2); }
  function gj(u, ttl){ return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / (ttl || 300000)), {ttl: ttl || 300000}).catch(function(){ return null; }); }
  function EZ(){ return document.documentElement.getAttribute("data-ez") === "easy"; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function wl(){ var W = (window.store && store.wl) || {}, L = []; for (var k in W) L.push({k: k, n: (W[k] && W[k].n) || k}); return L; }
  function code6(k){ var m = /^(\d{6})/.exec(String(k)); return m ? m[1] : null; }
  function tick(k){ return String(k).replace(/\.(KS|KQ)$/, ""); }

  var DATA = null, DT = 0;
  function load(){
    if (DATA && Date.now() - DT < 120000) return Promise.resolve(DATA);
    return Promise.all([gj("archive/x/wl_live.json", 120000), gj("archive/x/live_px.json", 120000), gj("archive/x/flow_kr.json", 600000), gj("archive/x/cal_week.json", 900000), gj("archive/x/earn_cal.json", 900000)])
      .then(function(r){ DATA = {wl: r[0] || {}, px: r[1] || {}, fl: r[2] || {}, cal: r[3] || {}, ec: r[4] || {}}; DT = Date.now(); return DATA; });
  }
  function flowOf(D, c){ return c ? ((D.fl.stocks || []).filter(function(s){ return s.c === c; })[0] || null) : null; }
  function earnOf(D, k){
    var t = tick(k).toUpperCase(), lim = kd(14), a = (D.cal.earn || []).filter(function(x){ return x.s === t && x.d >= kd(0) && x.d <= lim; })[0];
    if (a) return a.d; var b = ((D.ec.items || []).filter(function(x){ return (x.s === k || x.s === t || tick(x.s) === t) && x.d >= kd(0) && x.d <= lim; })[0]); return b ? b.d : null;
  }

  /* ── #7 ⭐ 내 종목 ── */
  function mineHtml(D){
    var L = wl();
    if (!L.length) return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnwl"><h3>⭐ 내 종목</h3><p class="mn-e">자주 보는 종목을 ⭐ 담아 두면 여기서 매일 <b>등락 · 외국인·기관 수급 · 뉴스 · 실적일</b>을 한 번에 봐요.</p><button type="button" class="mn-btn" data-goto="onepager">🔎 종목 찾아서 ⭐ 담기</button></section>';
    var Q = D.wl.q || {}, P = (D.px.q || {}), live = D.px.date === kd(0);
    var rows = L.slice(0, 12).map(function(o){
      var c = code6(o.k), q = Q[c || tick(o.k)] || Q[o.k] || null, p = null, ch = null;
      if (c && P[c]){ p = P[c][0]; ch = P[c][1]; } else if (q){ p = q.p; ch = q.chg; }
      var f = flowOf(D, c), nw = q && (q.news || [])[0], ed = earnOf(D, o.k), nm = (q && q.n && !/^\d/.test(q.n) ? q.n : o.n) || o.k;
      var sub = [];
      if (f && f.f5 != null) sub.push('🧲 외 <i class="' + cl(f.f5) + '">' + won(f.f5) + '</i> · 기 <i class="' + cl(f.i5) + '">' + won(f.i5) + '</i> (5일)');
      if (ed) sub.push('📅 실적 ' + md(ed) + '(' + wd(ed) + ')');
      var why = ch != null && Math.abs(ch) >= 5 && nw ? '<p class="mn-why">' + (ch > 0 ? "🚀" : "🧊") + ' 왜? ' + e(nw.t) + '</p>' : (nw ? '<p class="mn-nw">📰 ' + e(nw.t) + '</p>' : '');
      return {ch: ch == null ? 0 : Math.abs(ch), h: '<button type="button" class="mn-r" data-mnop="' + e(o.k) + '"><span class="mn-n"><b>' + e(String(nm).slice(0, 18)) + '</b><small>' + e(tick(o.k)) + '</small></span>' + (ch == null ? '<span class="mn-p"><small>시세 다음 갱신 때</small></span>' : '<span class="mn-p"><b class="' + cl(ch) + '">' + sg(ch) + '</b><small>' + px(p, !!c) + '</small></span>') +
        (sub.length ? '<span class="mn-s">' + sub.join(" · ") + '</span>' : '') + why + '</button>'};
    });
    rows.sort(function(a, b){ return b.ch - a.ch; });   // 많이 움직인 것 먼저
    var lim = EZ() ? 4 : 6;
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnwl"><h3>⭐ 내 종목 <span class="mut">' + L.length + '개 · ' + (live ? e(D.px.t || "") + " 실시간" : "마지막 장") + '</span></h3>' +
      rows.slice(0, lim).map(function(r){ return r.h; }).join("") + (rows.length > lim ? '<details class="mn-more"><summary>＋ ' + (rows.length - lim) + '개 더</summary>' + rows.slice(lim).map(function(r){ return r.h; }).join("") + '</details>' : '') + '</section>';
  }

  /* ── #8 ⚡ 왜 움직였나 ── */
  function whyHtml(D){
    var W = (D.wl.why || []).filter(function(w){ return w.day === kd(0); });
    if (!W.length) return "";
    var lim = EZ() ? 3 : 5;
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnwhy"><h3>⚡ 크게 움직인 대형주 — 왜?</h3>' + W.slice(0, lim).map(function(w){
      var f = flowOf(D, w.c), nw = (w.news || [])[0];
      var why = nw ? e(nw.t) : (f && f.f5 != null ? '관련 뉴스 없음 — 외국인 5일 ' + won(f.f5) + ' · 기관 ' + won(f.i5) : '관련 뉴스 없음 — 업종·수급 영향일 수 있어요');
      return '<button type="button" class="mn-r" data-mnop="' + e(w.s) + '"><span class="mn-n"><b>' + e(w.n) + '</b><small>' + e(w.c) + '</small></span><span class="mn-p"><b class="' + cl(w.r) + '">' + sg(w.r) + '</b><small>' + px(w.p, true) + '</small></span><p class="mn-why">' + why + '</p></button>'; }).join("") +
      '<p class="mn-ft">뉴스 제목은 네이버 증권 · 제목이 이유를 다 말해 주진 않아요</p></section>';
  }

  /* ── #9 📅 이번 주 ── */
  function calHtml(D){
    var C = D.cal || {}, t0 = kd(0), mine = {}; wl().forEach(function(o){ mine[tick(o.k).toUpperCase()] = 1; });
    var ev = (C.econ || []).filter(function(x){ return x.d >= t0; }).map(function(x){ return {d: x.d, t: x.t, h: x.f + ' ' + e(x.n) + (x.fc ? ' <small>예상 ' + e(x.fc) + (x.pv ? ' · 이전 ' + e(x.pv) : '') + '</small>' : ''), s: x.f === "🇺🇸" ? 1 : 2}; });
    var er = (C.earn || []).filter(function(x){ return x.d >= t0 && x.d <= kd(7); }).map(function(x){ var my = mine[x.s] || x.w; return {d: x.d, t: x.tm === "장 전" ? "장 전" : x.tm === "장 뒤" ? "장 뒤" : "", h: (my ? "⭐" : "💼") + ' ' + e(x.n.replace(/,? (Inc|Corporation|Corp|Ltd|Holdings|Co)\.?$/i, "")) + ' <small>' + e(x.s) + ' 실적</small>', s: my ? 0 : 3}; });
    var all = ev.concat(er).sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : a.s - b.s; });
    if (!all.length) return "";
    var lim = EZ() ? 4 : 6, days = {};
    function row(x){ var first = !days[x.d]; days[x.d] = 1; return '<div class="mn-cal' + (x.d === t0 ? " today" : "") + '"><span class="mn-cd">' + (first ? (x.d === t0 ? "오늘" : md(x.d) + "(" + wd(x.d) + ")") : "") + '</span><span class="mn-ct">' + (x.t || "") + '</span><span class="mn-ce">' + x.h + '</span></div>'; }
    var h = all.slice(0, lim).map(row).join(""); days = {}; all.slice(0, lim).forEach(function(x){ days[x.d] = 1; });
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mncal"><h3>📅 이번 주 <span class="mut">한국 시각</span></h3>' + h +
      (all.length > lim ? '<details class="mn-more"><summary>＋ ' + (all.length - lim) + '개 더</summary>' + all.slice(lim).map(row).join("") + '</details>' : '') +
      '<p class="mn-ft">⭐ 내 종목 · 💼 대형주·포트 실적 · 미국 장 뒤 실적은 한국 다음 날 아침에 반영 · 일정은 바뀔 수 있어요</p></section>';
  }

  /* ── #10 💬 고객 질문 (11/10 10개 → 11/11 20개 → 11/12 25개 = 기본 20 + 🔥 이슈 5) ── */
  var QD = null;
  function qload(){
    if (QD) return Promise.resolve(QD);
    return Promise.all([gj(RM + "bear.json", 600000), gj(RM + "port.json", 600000), gj("archive/x/flow_kr.json", 600000), gj("archive/x/wl_live.json", 120000), gj("archive/x/live_kr.json", 120000), gj("archive/x/products.json", 1800000), gj(RM + "qa.json", 300000)])
      .then(function(r){ QD = {B: r[0] || {}, P: r[1] || {}, F: r[2] || {}, W: r[3] || {}, L: r[4] || {}, PR: r[5] || {}, QA: r[6] || null}; setTimeout(function(){ QD = null; }, 600000); return QD; });
  }
  function qa(Q){
    var M = {}; (Q.B.markets || []).forEach(function(m){ M[m.key] = m; });
    var k = M.kospi || {}, s = M.sp500 || {}, nq = M.nasdaq || {}, QD = M.kosdaq || null;
    var hold = Q.P.hold || [], pc = function(re){ var t = 0; hold.forEach(function(h){ if (re.test(h.name)) t += +h.pct || 0; }); return Math.round(t * 10) / 10; };
    var cash = pc(/현금/), gold = pc(/^금/), core = pc(/코어/);
    var R = (Q.F.mkt || {}).KOSPI || [], r0 = R[0] || {}, U = Math.abs(r0.f || 0) > 1e6 ? 1e8 : 1, fs = 0; for (var i = 0; i < R.length; i++){ if (R[i].f && (R[i].f > 0) === (r0.f > 0)) fs++; else break; }
    var f20 = 0; R.forEach(function(x){ f20 += (x.f || 0) / U; });
    var topSell = (Q.F.stocks || []).slice().sort(function(a, b){ return (a.f5 || 0) - (b.f5 || 0); }).slice(0, 3).map(function(x){ return x.n; }).join(", ");
    var topBuy = (Q.F.stocks || []).slice().sort(function(a, b){ return (b.f5 || 0) - (a.f5 || 0); }).slice(0, 3).map(function(x){ return x.n; }).join(", ");
    var st = function(m){ return m.state === "🐻" ? "하락장" : m.state === "🟡" ? "조정" : "정상 흐름"; };
    var rb = k.rebounds || {}, bn = k.n || 0;
    var big = ((Q.L.date === kd(0) ? Q.L.value : null) || []).slice(0, 3).sort(function(a, b){ return Math.abs(b.r) - Math.abs(a.r); })[0];
    var bigWhy = big ? ((Q.W.why || []).filter(function(w){ return w.c === big.s.slice(0, 6); })[0] || {}) : {}, bf = big ? (Q.F.stocks || []).filter(function(x){ return x.c === big.s.slice(0, 6); })[0] : null;
    var fx = Q.W.fx || {}, krw = (Q.PR.krw || []).filter(function(b){ return b.kind === "국채" && b.after; }).sort(function(a, b){ return b.after - a.after; })[0], y10 = ((Q.PR.ust_hist || {}).y10 || []).slice(-1)[0];
    var y10p = ((Q.PR.ust_hist || {}).y10 || []).slice(-21)[0];
    var out = [];
    out.push(["지금 팔아야 해요?", k.state === "🐻"
      ? "국내 주식은 코스피가 고점보다 " + sg(k.dd, 0) + "로 하락장이에요. " + (k.analog ? "규칙상 코스피 몫은 주식 " + k.analog.stock + "%(" + k.analog.next + ")" + (QD && QD.analog ? ", 코스닥 몫은 주식 " + QD.analog.stock + "%예요" : "예요") + ". 줄일 때도" : "규칙은 국내 주식 몫을 현금 " + (k.cash || 100) + "%까지 줄이는 쪽이지만,") + " 이미 많이 빠진 뒤라 한 번에 던지지 않고 반등 때 나눠서 줄이는 게 원칙이에요. 해외 ETF(S&P500 " + st(s) + ")는 배분 그대로 가져가요."
      : "코스피는 " + st(k) + "(고점 " + sg(k.dd, 0) + "), S&P500은 " + st(s) + "이에요. 규칙상 서둘러 팔 구간은 아니고, 정해 둔 비중에서 크게 벗어난 것만 맞추면 돼요."]);
    out.push(["지금 사도 돼요?", k.state === "🐻"
      ? (k.analog ? "국내 주식은 지금 장과 닮았던 때를 보고 정한 규칙을 따라요. 코스피는 주식 " + k.analog.stock + "% — " + k.analog.next + "." + (QD && QD.analog ? " 코스닥은 주식 " + QD.analog.stock + "% — " + QD.analog.next + "." : "") : "국내 주식은 판정이 풀릴 때(고점 −10% 위 + 200일선 위)까지 새로 사지 않는 규칙이에요. 바닥 신호는 지금 " + bn + "/4개 — 2개 넘게 켜지면 나눠서 담기 시작해요.") + " 해외 ETF는 배분표대로 나눠서 담아도 되는 구간이에요."
      : "한 번에 사기보다 2~3번 나눠서 담는 걸 권해요. 지금 배분표는 지수 ETF(S&P500·나스닥) " + core + "% · 금 " + gold + "% · 현금 " + cash + "%예요."]);
    if (big) out.push([big.n + " 왜 " + (big.r >= 0 ? "올라요?" : "빠져요?"), big.n + "는 오늘 " + sg(big.r) + "예요. " + ((bigWhy.news || [])[0] ? "관련 뉴스: 「" + bigWhy.news[0].t + "」. " : "") +
      (bf ? "최근 5일 외국인 " + won(bf.f5) + ", 기관 " + won(bf.i5) + " 순매수였어요." : "") + " 하루 등락보다는 실적·업황 흐름으로 판단하는 게 좋아요."]);
    if (r0.f != null) out.push(["외국인은 왜 " + (r0.f >= 0 ? "사요?" : "팔아요?"), "코스피에서 외국인은 " + Number(r0.d.slice(5, 7)) + "/" + Number(r0.d.slice(8)) + " 하루 " + won(r0.f / U) + (fs >= 2 ? "(" + fs + "일째)" : "") + ", 최근 20일 합계 " + won(f20) + "예요. 5일 동안 가장 많이 판 종목은 " + topSell + ", 많이 산 종목은 " + topBuy + "예요. " +
      "다만 10년치를 돌려 보면 외국인·기관을 따라 사는 건 수익으로 이어지지 않았어요 — 흐름 참고용이에요."]);
    out.push(["미국 주식은 괜찮아요?", "S&P500은 고점보다 " + sg(s.dd, 1) + "로 " + st(s) + "이고, " + (s.close && s.m200 ? (s.close > s.m200 ? "장기 평균선(200일) 위에 있어요." : "장기 평균선(200일) 아래로 내려왔어요.") : "") + " 나스닥은 " + sg(nq.dd, 1) + "(" + st(nq) + "). 규칙상 해외 ETF 비중은 " + (s.cash ? "주식 몫 " + s.cash + "%를 " + (s.to || "현금") + "으로 옮기는 구간이에요(바닥 신호 3개 켜지면 복귀)." : "그대로 유지하는 구간이에요.")]);
    if (k.state === "🐻") out.push(["코스피 바닥은 언제예요?", "바닥을 미리 맞히는 방법은 없어요. 대신 규칙으로 봐요 — 이번 하락장(" + md(rb.from) + "~)에서 하루 +3% 넘는 반등이 " + (rb.n || 0) + "번 있었고 그중 " + (rb.broke || 0) + "번은 20일 안에 저점을 다시 깼어요. " + (k.analog ? "규칙상 다음 단계: " + k.analog.next + " (지금 장과 닮았던 과거 12번에서 가장 나았던 방식)." : "바닥 신호 4개 중 " + bn + "개가 켜져 있고, 2개가 넘으면 나눠 담기를 시작해요.")]);
    out.push(["현금은 얼마나 들고 있어야 해요?", "국내 주식 몫은 " + (k.analog ? "코스피 현금 " + k.cash + "%" + (QD && QD.analog ? " · 코스닥 현금 " + QD.cash + "%" : "") + "(🔁 닮은 장 규칙)" : k.cash ? "지금 규칙상 현금 " + k.cash + "%까지" : "따로 현금을 늘릴 필요는 없어요") + ". 해외 ETF 포트는 현금 " + cash + "% · 금 " + gold + "%예요. 고객 성향(안정형일수록 더 많이)에 맞춰 조절해요."]);
    if (gold) out.push(["금 지금 사도 돼요?", "지금 배분표의 금 비중은 " + gold + "%예요. 금은 주식이 흔들릴 때 덜 빠지는 방패 역할이라 한 번에 크게보다 정해 둔 비중만큼 나눠서 담아요."]);
    var br = (Q.PR.td || []).filter(function(t){ return /Prefixado 2032/.test(t.n); })[0], bfx = ((Q.PR.brl || {}).fx || []), bf1 = bfx.slice(-1)[0], bf0 = bfx.slice(-22)[0];
    if (krw || y10 || br) out.push(["채권 금리 지금 어때요? (한국·미국·브라질)", (krw ? "🇰🇷 국고채는 세후 기준 최고 " + krw.after.toFixed(2) + "%(" + krw.name + ") 수준이에요. " : "") + (y10 ? "🇺🇸 미국 10년 국채 금리는 " + (+y10[1]).toFixed(2) + "%" + (y10p ? "(한 달 전 " + (+y10p[1]).toFixed(2) + "%)" : "") + "예요. " : "") +
      (br ? "🇧🇷 브라질 국채(헤알, 2032년 만기)는 " + br.r.toFixed(2) + "%" + (bf1 && bf0 ? ", 헤알/원은 " + bf1[1].toFixed(1) + "원(한 달 " + sg((bf1[1] / bf0[1] - 1) * 100) + ")" : "") + " — 금리보다 환율 위험을 먼저 봐야 해요(중개 상품이라 고객 요청이 있을 때만 안내·제안 가능). " : "") + "주식이 흔들릴 때 채권 비중을 갖고 있으면 전체 변동이 줄어요."]);
    if (fx.p) out.push(["환율 어디로 가요?", "원/달러는 지금 " + (Math.round(fx.p * 10) / 10).toLocaleString() + "원(" + sg(fx.chg, 2) + ")이에요. 환율 방향은 아무도 맞히기 어려워서, 달러 자산은 한 번에 바꾸기보다 몇 번에 나눠 환전하는 게 원칙이에요."]);
    return out.slice(0, 10);
  }
  /* 💬 11/10 사용자 「답변이 영 시원치 않다 — 네 시황을 반영해서 우와 할 정도로 늘 답해」
     → 답은 매일 아침 시황리포트를 쓰는 Claude 가 그날 시황으로 직접 씀(market-strategy-report market/qa.json · RULES 1-N · 검산 src/qa.py).
       결론 한 문장 → 근거 3(오늘 숫자) → 고객 유형별 행동 → 이 답이 바뀌는 조건 → 다음에 볼 것. 4일 넘게 안 올라오면 예전 틀 답으로 대신. */
  function rich(Q){ var A = Q.QA; if (!A || !(A.items || []).length || !A.date) return null; return (Date.parse(kd(0)) - Date.parse(A.date)) / 864e5 <= 4 ? A : null; }
  function nowStrip(Q){
    var p = [], ix = (Q.L.index || [])[0], fx = Q.W.fx;
    if (ix && Q.L.date) p.push("코스피 " + Math.round(ix.last).toLocaleString() + " <b class=\"" + cl(ix.chg) + "\">" + sg(ix.chg) + "</b>" + (Q.L.date === kd(0) ? "" : " (" + md(Q.L.date) + ")"));
    if (fx && fx.p) p.push("원/달러 " + (Math.round(fx.p * 10) / 10).toLocaleString() + "원");
    var r = ((Q.F.mkt || {}).KOSPI || [])[0]; if (r && r.f != null){ var U = Math.abs(r.f) > 1e6 ? 1e8 : 1; p.push("외국인 <b class=\"" + cl(r.f) + "\">" + won(r.f / U) + "</b> (" + md(r.d) + ")"); }
    return p.length ? '<div class="qa-now">⚡ 지금 · ' + p.join(" · ") + '</div>' : "";
  }
  /* 🙌 11/11 사용자 「질문 20개까지 · 각 답변 닫기 버튼 · 뒤로 버튼 — 편의성」
     → 답마다 「✕ 답 닫기」 · 하나 열면 다른 답은 접힘 · 시트 머리(늘 위에 붙어 있음)에 「← 뒤로」(답이 열려 있으면 「← 질문 목록」) · 휴대폰 뒤로 키도 같은 순서(답 → 시트)
       · 20개라 갈래 칩(전체·주식·금리·환율·상품·연금 — qa.json 의 g)과 질문 번호(Q1~) */
  // 🔥 11/12 사용자 「이슈 질문을 5개로 하고 총 25개」 — qa.json 의 "hot": true = 그날 이슈(매시간 갈아 끼움) · 칩 「🔥 오늘 이슈」로 따로 보기
  var QG = [["all", "전체"], ["hot", "🔥 오늘 이슈"], ["주식", "📈 주식"], ["금리", "💱 금리·환율"], ["상품", "🧺 상품·연금"]];
  var CLS = '<button type="button" class="mn-qc qa-cl" data-qclose="1">✕ 답 닫기</button>';
  function richItem(x, i, open){
    return '<details class="mn-q qa-r" data-g="' + e(x.g || "") + '"' + (x.hot ? ' data-hot="1"' : '') + (open ? " open" : "") + '><summary data-n="' + (i + 1) + '">' + (x.hot ? '<span class="qa-hot">🔥 이슈</span>' : '') + e(x.q) + '<em>' + e(x.a) + '</em></summary><div class="qa-body">' +
      '<p class="qa-a">' + e(x.a) + '</p>' +
      '<ol class="qa-pts">' + (x.pts || []).map(function(p){ return '<li><b>' + e(p.k) + '</b>' + e(p.t) + '</li>'; }).join("") + '</ol>' +
      ((x.act || []).length ? '<div class="qa-act"><small>그래서 이렇게</small>' + x.act.map(function(a){ return '<div><b>' + e(a[0]) + '</b><span>' + e(a[1]) + '</span></div>'; }).join("") + '</div>' : '') +
      (x.flip ? '<p class="qa-flip"><b>🔁 이 답이 바뀌는 조건</b>' + e(x.flip) + '</p>' : '') +
      (x.watch ? '<p class="qa-watch">👀 다음에 볼 것 · ' + e(x.watch) + '</p>' : '') +
      (x.src ? '<p class="qa-src">근거: ' + e(x.src) + '</p>' : '') +
      '<div class="qa-btn"><button type="button" class="mn-qc" data-qcopy="' + i + '" data-qm="s">📋 카톡용(짧게)</button><button type="button" class="mn-qc" data-qcopy="' + i + '" data-qm="f">📋 전체 복사</button>' + CLS + '</div></div></details>';
  }
  function qaChips(Q){
    var A = rich(Q); if (!A) return "";
    var n = {}; A.items.forEach(function(x){ if (x.g) n[x.g] = (n[x.g] || 0) + 1; if (x.hot) n.hot = (n.hot || 0) + 1; });
    if (Object.keys(n).length < 2) return "";
    return '<div class="qa-chips">' + QG.filter(function(g){ return g[0] === "all" || n[g[0]]; }).map(function(g){ return '<button type="button" data-qg="' + g[0] + '"' + (g[0] === "all" ? ' class="on"' : '') + '>' + g[1] + ' ' + (g[0] === "all" ? A.items.length : n[g[0]]) + '</button>'; }).join("") + '</div>';
  }
  function qaN(Q){ var A = rich(Q); return A ? A.items.length : qa(Q).length; }
  function qaList(Q, lim){
    var A = rich(Q);
    if (A) return (lim ? "" : '<p class="qa-meta">📝 ' + md(A.date) + ' ' + e(A.edition || "") + ' 시황으로 쓴 답 · ' + e(String(A.at || "").slice(5).replace("-", "/")) + ' 갱신' + (A.date !== kd(0) ? ' · <b>지난 시황 기준</b>' : '') + '</p>' + nowStrip(Q)) +
      A.items.slice(0, lim || A.items.length).map(function(x, i){ return richItem(x, i, false); }).join("");
    var L = qa(Q);
    return L.slice(0, lim || L.length).map(function(x, i){ return '<details class="mn-q"><summary>' + e(x[0]) + '</summary><p>' + e(x[1]) + '</p><div class="qa-btn"><button type="button" class="mn-qc" data-qcopy="' + i + '">📋 카톡용 복사</button>' + CLS + '</div></details>'; }).join("");
  }
  var NUM = ["①", "②", "③", "④"];
  function copyQ(i, mode){ qload().then(function(Q){
    var A = rich(Q), t, tail = "\n\n※ 참고용 자료이며 투자 권유가 아닙니다. 투자 판단과 책임은 본인에게 있습니다.";
    if (A){ var x = A.items[i]; if (!x) return;
      t = "Q. " + x.q + "\n\n" + x.a + "\n\n" + (x.pts || []).map(function(p, k){ return NUM[k] + " " + p.t; }).join("\n");
      if (mode === "f") t += ((x.act || []).length ? "\n\n[그래서 이렇게]\n" + x.act.map(function(a){ return "· " + a[0] + ": " + a[1]; }).join("\n") : "") + (x.flip ? "\n\n[이 답이 바뀌는 조건]\n" + x.flip : "");
      t += (x.watch ? "\n\n👀 다음에 볼 것: " + x.watch : "") + "\n(" + md(A.date) + " 기준)" + tail;
    } else { var y = qa(Q)[i]; if (!y) return; t = "Q. " + y[0] + "\nA. " + y[1] + tail; }
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ try { toast("📋 복사했어요 — 카톡에 붙여 넣기"); } catch(x2) {} }, function(){ window.prompt("길게 눌러 복사하세요", t); }); }); }
  function qaCard(){
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnqa"><h3>💬 고객이 이렇게 물으면 <span class="mut">오늘 시황으로 쓴 답</span></h3><div id="mnqab"><div class="loading">불러오는 중…</div></div><button type="button" class="mn-btn" data-qaall="1" id="mnqaall">💬 질문 모두 보기</button></section>';
  }
  var QSAVED = null;
  function qaOpenAns(d){ return d.querySelector("details.mn-q[open]"); }
  function qaBk(){ var d = document.getElementById("qasheet"), b = d && d.querySelector(".qa-bk"); if (b) b.textContent = qaOpenAns(d) ? "← 질문 목록" : "← 뒤로"; }
  function qaShut(){                                   // 시트 통째로 닫기 (✕ · 바깥 누르기 · 화면 이동)
    var d = document.getElementById("qasheet"); if (!d) return; d.remove();
    window.removeEventListener("hashchange", qaShut);
    try { if (history.state && history.state.t === "qa") history.back(); } catch(z) {}      // 얹어 둔 기록 하나 걷기
  }
  function qaBack(){                                   // ← 뒤로: 답이 열려 있으면 답만 닫고, 아니면 시트를 닫음
    try { if (history.state && history.state.t === "qa"){ history.back(); return; } } catch(z) {}
    var d = document.getElementById("qasheet"); if (!d) return; var o = qaOpenAns(d);
    if (o){ o.open = false; qaBk(); } else qaShut();
  }
  window.addEventListener("popstate", function(ev){    // 휴대폰 뒤로 키 = ← 뒤로 와 같은 순서 (smooth.js 미리 보기 창과 같은 방식)
    var d = document.getElementById("qasheet");
    if (d){
      var o = qaOpenAns(d);
      if (o){ o.open = false; qaBk(); try { history.pushState({t: "qa", d: ((QSAVED && QSAVED.d) || 0) + 1}, "", location.pathname + location.hash); } catch(z) {} return; }
      d.remove(); window.removeEventListener("hashchange", qaShut);
    }
    if (ev.state && ev.state._qa){ try { history.replaceState(QSAVED, ""); } catch(z) {} if (window.updBack) try { updBack(); } catch(z) {} }
  });
  window.__qaOpen = function(){
    if (document.getElementById("qasheet")) return;
    var d = document.createElement("div"); d.id = "qasheet";
    d.innerHTML = '<div class="qa-in"><div class="qa-h"><div class="qa-ht"><button type="button" class="qa-bk" aria-label="뒤로">← 뒤로</button><b>💬 고객이 이렇게 물으면</b><button type="button" class="qa-x" aria-label="닫기">✕</button></div><small>질문을 누르면 결론 → 근거 3개 → 행동 → 바뀌는 조건</small><div class="qa-cb"></div></div><div class="qa-b"><div class="loading">불러오는 중…</div></div><p class="mn-ft">참고용 · 고객 성향과 기간에 맞춰 조정하세요 · 투자 권유 아님</p></div>';
    document.body.appendChild(d);
    try { QSAVED = history.state;
      history.replaceState(Object.assign({}, QSAVED || {}, {t: "xs", _qa: 1}), "");
      history.pushState({t: "qa", d: ((QSAVED && QSAVED.d) || 0) + 1}, "", location.pathname + location.hash); } catch(z) {}
    window.addEventListener("hashchange", qaShut);
    d.onclick = function(ev){
      if (ev.target === d || ev.target.closest(".qa-x")){ qaShut(); return; }
      if (ev.target.closest(".qa-bk")){ qaBack(); return; }
      var c = ev.target.closest("[data-qg]"); if (!c) return;
      var g = c.dataset.qg; [].forEach.call(d.querySelectorAll("[data-qg]"), function(b){ b.classList.toggle("on", b === c); });
      [].forEach.call(d.querySelectorAll(".qa-b details.mn-q"), function(x){ var hide = g === "hot" ? !x.dataset.hot : g !== "all" && x.dataset.g !== g; x.hidden = hide; if (hide) x.open = false; });
      qaBk(); d.querySelector(".qa-in").scrollTop = 0;
    };
    qload().then(function(Q){ var c = d.querySelector(".qa-cb"); if (c) c.innerHTML = qaChips(Q); var b = d.querySelector(".qa-b"); if (b) b.innerHTML = qaList(Q); var n = d.querySelector(".qa-in"); if (n) n.scrollTop = 0; });
  };
  // 답 하나를 열면 같은 묶음의 다른 답은 접고, 연 질문이 화면 위로 오게
  document.addEventListener("toggle", function(ev){
    var t = ev.target; if (!t || !t.classList || !t.classList.contains("mn-q")) return;
    if (t.open){
      [].forEach.call(t.parentNode.querySelectorAll("details.mn-q[open]"), function(o){ if (o !== t) o.open = false; });
      var sh = !!t.closest("#qasheet");
      // 🔧 11/11 자가 업그레이드: 홈 카드에선 연 질문이 이미 화면 위쪽 60% 안에 있으면 그대로 둠(전엔 「nearest」가 긴 답을 맞추느라 질문을 378→72px 로 끌어올림 — 🩺 건강검진 튐)
      setTimeout(function(){ try { if (!t.open) return; if (sh){ t.scrollIntoView({block: "start", behavior: "smooth"}); return; }
        var y = t.querySelector("summary").getBoundingClientRect().top; if (y < 0 || y > innerHeight * 0.6) t.scrollIntoView({block: "start", behavior: "smooth"}); } catch(z) {} }, 80);
    }
    qaBk();
  }, true);

  /* ── 붙이기 ── */
  function mount(){
    if (cur() !== "home") return;
    var hb = document.getElementById("hmbody"); if (!hb) return;
    var host = document.getElementById("mnbox");
    var anchor = EZ() ? document.getElementById("ezhero") : hb.querySelector(".h2-num");
    if (!anchor) return;
    if (!host || host.dataset.ez !== String(EZ())){
      if (host) host.remove();
      host = document.createElement("div"); host.id = "mnbox"; host.dataset.ez = String(EZ());
      anchor.insertAdjacentElement("afterend", host); host.dataset.t = "0";
    }
    if (Date.now() - (+host.dataset.t || 0) < 90000) return;
    host.dataset.t = String(Date.now());
    load().then(function(D){ var h = document.getElementById("mnbox"); if (!h) return;
      h.innerHTML = mineHtml(D) + whyHtml(D) + calHtml(D) + qaCard();
      qload().then(function(Q){ var b = document.getElementById("mnqab"); if (b) b.innerHTML = qaList(Q, EZ() ? 2 : 3); var a = document.getElementById("mnqaall"); if (a) a.textContent = "💬 " + qaN(Q) + "개 모두 보기"; });
    });
  }
  function propBtn(){
    if (cur() !== "prop") return; var m = document.getElementById("main"); if (!m || document.getElementById("qaprop")) return;
    var hero = m.querySelector(".hero"); if (!hero) return;
    var b = document.createElement("button"); b.type = "button"; b.id = "qaprop"; b.className = "mn-btn qa-prop"; b.innerHTML = "💬 고객이 이렇게 물으면? <small>오늘 시황으로 쓴 답 20개 · 갈래별로 보기 · 카톡 복사</small>";
    b.onclick = window.__qaOpen; hero.insertAdjacentElement("afterend", b);
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-mnop],[data-qcopy],[data-qaall],[data-qclose]"); if (!t) return;
    ev.stopPropagation();
    if (t.dataset.mnop != null){ if (window.openOP) openOP(t.dataset.mnop); return; }
    if (t.dataset.qcopy != null){ copyQ(+t.dataset.qcopy, t.dataset.qm); return; }
    if (t.dataset.qclose){ var dt = t.closest("details"); if (dt){ var y0 = t.getBoundingClientRect().top; dt.open = false;   // 🔧 11/11: 닫은 질문이 「✕ 답 닫기」를 누른 그 자리에 오게(손가락 밑) — 시트 안이면 시트를, 아니면 화면을 굴림
        try { var dy = dt.getBoundingClientRect().top - y0, sc = dt.closest(".qa-in"); if (sc) sc.scrollTop += dy; else window.scrollBy(0, dy); } catch(z) {} } return; }
    if (t.dataset.qaall) window.__qaOpen();
  }, true);
  var MT = 0; new MutationObserver(function(){ clearTimeout(MT); MT = setTimeout(function(){ try { mount(); propBtn(); } catch(x) {} }, 120); }).observe(document.documentElement, {childList: true, subtree: true});
  setInterval(function(){ try { var h = document.getElementById("mnbox"); if (h) h.dataset.t = "0"; mount(); } catch(x) {} }, 180000);

  (function(){ var st = document.createElement("style"); st.textContent =
    "#mnbox .mn-c{margin-top:12px}.mn-c h3 .mut{font-size:12px}.mn-e{font-size:14px;line-height:1.6;color:var(--sub);margin:0 0 10px;word-break:keep-all}.mn-e b{color:var(--text)}" +
    ".mn-btn{display:block;width:100%;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px}.mn-btn small{display:block;font-weight:400;font-size:12px;color:var(--sub);margin-top:2px}" +
    ".qa-prop{margin:0 0 12px;text-align:left;padding:12px 14px;border-color:rgba(124,156,255,.5)}" +
    ".mn-r{display:flex;flex-wrap:wrap;align-items:center;gap:2px 10px;width:100%;padding:10px 0;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);font:inherit;text-align:left;cursor:pointer}.mn-r:last-of-type{border-bottom:0}" +
    ".mn-n{flex:1;min-width:0}.mn-n b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mn-n small{display:block;font-size:12px;color:var(--sub)}" +
    ".mn-p{flex:0 0 auto;text-align:right;line-height:1.25}.mn-p b{display:block;font-size:16px;font-weight:800}.mn-p small{font-size:12px;color:var(--sub)}" +
    ".mn-s{flex:1 0 100%;font-size:12.5px;color:var(--sub);margin-top:3px}.mn-s i{font-style:normal;font-weight:700}" +
    ".mn-why,.mn-nw{flex:1 0 100%;margin:4px 0 0;font-size:13px;line-height:1.45;word-break:keep-all;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.mn-why{font-weight:700}.mn-nw{color:var(--sub)}" +
    "#mnbox .up{color:var(--up)}#mnbox .dn{color:var(--down)}.mn-ft{font-size:12px;color:var(--sub);margin:8px 0 0;line-height:1.5}" +
    ".mn-more summary{cursor:pointer;font-size:13px;color:var(--sub);padding:8px 0 2px;list-style:none;text-align:center}.mn-more summary::-webkit-details-marker{display:none}" +
    ".mn-cal{display:flex;gap:8px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px}.mn-cal:last-of-type{border-bottom:0}.mn-cal.today .mn-cd{color:var(--up);font-weight:800}" +
    ".mn-cd{flex:0 0 66px;white-space:nowrap;font-size:12.5px;font-weight:700;color:var(--sub)}.mn-ct{flex:0 0 46px;font-size:12px;color:var(--sub);white-space:nowrap}.mn-ce{flex:1;min-width:0;line-height:1.4;word-break:keep-all}.mn-ce small{color:var(--sub);font-size:12px}" +
    ".mn-q{border-bottom:1px solid var(--line);padding:2px 0}.mn-q summary{cursor:pointer;font-size:14.5px;font-weight:700;padding:9px 0;list-style:none}.mn-q summary::-webkit-details-marker{display:none}.mn-q summary:before{content:'Q. ';color:var(--acc,#7c9cff)}" +
    ".mn-q p{margin:0 0 8px;font-size:14px;line-height:1.65;color:var(--text);word-break:keep-all}.mn-qc{border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;margin:0 0 8px;cursor:pointer}" +
    ".qa-r summary em{display:block;font-style:normal;font-weight:500;font-size:13px;line-height:1.5;color:var(--sub);margin-top:3px;word-break:keep-all}.qa-r[open] summary em{display:none}.qa-r summary:before{content:'Q' attr(data-n) '. ';color:var(--acc,#7c9cff)}" +
    ".qa-body{padding:0 0 12px}.qa-a{font-size:16px!important;font-weight:800;line-height:1.55!important;margin:2px 0 10px!important;padding:11px 13px;border-radius:12px;background:color-mix(in srgb,var(--acc,#7c9cff) 13%,transparent);word-break:keep-all}" +
    ".qa-pts{list-style:none;margin:0 0 10px;padding:0;counter-reset:q}.qa-pts li{counter-increment:q;position:relative;padding:8px 0 8px 30px;border-bottom:1px solid var(--line);font-size:14px;line-height:1.6;word-break:keep-all}.qa-pts li:last-child{border-bottom:0}" +
    ".qa-pts li:before{content:counter(q);position:absolute;left:0;top:9px;width:21px;height:21px;border-radius:50%;background:var(--text);color:var(--panel,#fff);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}" +
    ".qa-pts li b{display:inline-block;font-size:12px;font-weight:800;padding:1px 7px;border-radius:999px;border:1px solid var(--line);margin-right:6px;vertical-align:1px;white-space:nowrap}" +
    ".qa-act{border:1px solid var(--line);border-radius:12px;padding:9px 12px;margin:0 0 10px}.qa-act small{display:block;font-size:12px;font-weight:800;color:var(--sub);margin-bottom:2px}.qa-act div{padding:6px 0;border-bottom:1px dashed var(--line);font-size:13.5px;line-height:1.5;word-break:keep-all}.qa-act div:last-child{border-bottom:0}" +
    ".qa-act div b{display:block;font-size:13px}.qa-act div span{color:var(--text)}" +
    ".qa-flip{font-size:13.5px!important;line-height:1.6!important;margin:0 0 8px!important;padding:9px 12px;border-radius:12px;background:color-mix(in srgb,#f0a020 14%,transparent);word-break:keep-all}.qa-flip b{display:block;font-size:12.5px;margin-bottom:2px}" +
    ".qa-watch{font-size:13px!important;margin:0 0 4px!important;line-height:1.5!important;color:var(--text)}.qa-src{font-size:12px!important;color:var(--sub)!important;margin:0 0 8px!important;line-height:1.5!important}.qa-btn{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.qa-btn .mn-qc{margin:0;min-height:34px}.qa-btn .qa-cl{margin-left:auto;border-color:var(--text);font-weight:800}.mn-q>.qa-btn{margin:0 0 10px}.mn-q[hidden]{display:none}" +
    ".qa-meta{font-size:12.5px;color:var(--sub);margin:0 0 6px;line-height:1.5}.qa-meta b{color:var(--up)}.qa-now{font-size:13px;line-height:1.5;padding:8px 11px;border-radius:10px;background:var(--panel2,rgba(127,127,127,.08));margin:0 0 6px}.qa-now .up{color:var(--up)}.qa-now .dn{color:var(--down)}" +
    "#qasheet{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}.qa-in{background:var(--bg,var(--panel));width:100%;max-width:560px;max-height:88vh;overflow:auto;border-radius:20px 20px 0 0;padding:16px 16px calc(20px + env(safe-area-inset-bottom))}" +
    "#qasheet .qa-in{padding-top:0}.qa-h{position:sticky;top:0;z-index:3;background:var(--bg,var(--panel));margin:0 -16px 8px;padding:12px 16px 9px;border-bottom:1px solid var(--line);border-radius:20px 20px 0 0}.qa-ht{display:flex;align-items:center;gap:8px;margin-bottom:3px}" +
    ".qa-ht b{flex:1;min-width:0;font-size:16.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qa-h small{display:block;color:var(--sub);font-size:12.5px}" +
    ".qa-bk{flex:0 0 auto;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);height:36px;padding:0 12px;border-radius:999px;font:inherit;font-size:13.5px;font-weight:800;white-space:nowrap;cursor:pointer}" +
    ".qa-x{flex:0 0 auto;border:0;background:var(--panel2,rgba(127,127,127,.14));color:var(--text);width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer}" +
    ".qa-hot{display:inline-block;margin-right:6px;font-size:12px;font-weight:800;color:#fff;background:#f04452;border-radius:6px;padding:1px 6px;vertical-align:1px}" +
    ".qa-chips{display:flex;gap:6px;overflow-x:auto;padding-top:8px;scrollbar-width:none}.qa-chips::-webkit-scrollbar{display:none}.qa-chips button{flex:0 0 auto;border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:999px;height:32px;padding:0 12px;font:inherit;font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer}" +
    ".qa-chips button.on{background:var(--text);color:var(--bg,var(--panel,#fff));border-color:var(--text)}#qasheet .mn-q{scroll-margin-top:148px}#mnqab .mn-q{scroll-margin-top:70px}";
    document.head.appendChild(st); })();
})();
