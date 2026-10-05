/* CH Investing — 2차 업그레이드: 나침반 · 매집 · 종목리포트 · 단타 · 알림 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt;
  var P = PL, X = P.X, card = P.card, chip = P.chip, pct = P.pct, opA = P.opA, kn = P.kn, md = P.md;

  /* ======================= 🧭 나침반 (compass.js 의 시장 상세 아래에 붙음) ======================= */
  var RC = {"상승장": "u", "하락장": "d", "횡보장": "f"};
  function regHist(m){
    var ix = (m.index || [])[0]; if (!ix || !ix.reg_hist || ix.reg_hist.length < 5) return "";
    var H = ix.reg_hist, ch = [];
    for (var i = 1; i < H.length; i++) if (H[i][1] !== H[i - 1][1]) ch.push([H[i][0], H[i - 1][1], H[i][1]]);
    return card("📜 국면 기록 <span class='mut'>" + e(ix.name) + " · 최근 " + H.length + "거래일</span>",
      '<div class="rgs">' + H.map(function(x){ return '<i class="' + (RC[x[1]] || "f") + '" data-tip="' + e("<b>" + x[0] + "</b> " + x[1]) + '"></i>'; }).join("") + '</div>' +
      '<div class="rgl"><span>' + e(H[0][0]) + '</span><span><i class="u"></i>상승장 <i class="f"></i>횡보장 <i class="d"></i>하락장</span><span>' + e(H[H.length - 1][0]) + '</span></div>' +
      (ch.length ? '<div class="sub2">국면이 바뀐 날</div><div class="xt">' + ch.slice(-6).reverse().map(function(c){ return '<div class="xr"><b>' + e(c[0]) + '</b><span class="mut">' + e(c[1]) + ' →</span><b class="' + (c[2] === "상승장" ? "up" : c[2] === "하락장" ? "dn" : "") + '">' + e(c[2]) + '</b></div>'; }).join("") + '</div>' : '<p class="note">이 기간엔 국면이 한 번도 안 바뀌었어요.</p>') +
      '<p class="note">🔔 알림 탭에서 "시장 국면 변화"를 구독하면 바뀌는 날만 푸시가 와요.</p>');
  }
  function rotSvg(m, di){
    var ss = (m.sectors || []).filter(function(x){ return x.path && x.path.length; });
    if (ss.length < 4) return "";
    var W = 330, H = 250, Pd = 26, all = [];
    ss.forEach(function(x){ x.path.forEach(function(p){ all.push(p); }); });
    var mx = Math.max.apply(null, all.map(function(p){ return Math.abs(p[2]); }).concat([1])) * 1.12, my = Math.max.apply(null, all.map(function(p){ return Math.abs(p[1]); }).concat([1])) * 1.12;
    var Xs = function(v){ return Pd + (v + mx) / (2 * mx) * (W - 2 * Pd); }, Ys = function(v){ return Pd + (my - v) / (2 * my) * (H - 2 * Pd); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="rotsv">' +
      '<rect x="' + Xs(0) + '" y="' + Pd + '" width="' + (W - Pd - Xs(0)) + '" height="' + (Ys(0) - Pd) + '" fill="#e66767" opacity=".08"/><rect x="' + Pd + '" y="' + Ys(0) + '" width="' + (Xs(0) - Pd) + '" height="' + (H - Pd - Ys(0)) + '" fill="#3987e5" opacity=".08"/>' +
      '<line x1="' + Pd + '" x2="' + (W - Pd) + '" y1="' + Ys(0) + '" y2="' + Ys(0) + '" stroke="#3a4358"/><line x1="' + Xs(0) + '" x2="' + Xs(0) + '" y1="' + Pd + '" y2="' + (H - Pd) + '" stroke="#3a4358"/>' +
      '<text x="' + (W - Pd - 2) + '" y="' + (Pd + 12) + '" text-anchor="end" class="rotq u">🔥 계속 강함</text><text x="' + (Pd + 2) + '" y="' + (Pd + 12) + '" class="rotq">🌱 새로 뜨는 중</text>' +
      '<text x="' + (W - Pd - 2) + '" y="' + (H - Pd - 6) + '" text-anchor="end" class="rotq">🍂 힘 빠지는 중</text><text x="' + (Pd + 2) + '" y="' + (H - Pd - 6) + '" class="rotq d">🧊 계속 약함</text>';
    ss.forEach(function(x, i){
      var p = x.path, k = Math.min(di, p.length - 1), tr = p.slice(Math.max(0, k - 4), k + 1);
      var col = V.CAT[i % 6];
      if (tr.length > 1) s += '<polyline points="' + tr.map(function(q){ return Xs(q[2]).toFixed(1) + "," + Ys(q[1]).toFixed(1); }).join(" ") + '" fill="none" stroke="' + col + '" stroke-opacity=".45" stroke-width="2"/>';
      var cx = Xs(p[k][2]), cy = Ys(p[k][1]);
      s += '<g data-tip="' + e("<b>" + x.icon + " " + x.name + "</b> " + p[k][0] + "<br>1주 " + pct(p[k][1]) + " · 1개월 " + pct(p[k][2])) + '"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="' + col + '" stroke="#121826" stroke-width="2"/>' +
        '<text x="' + (cx + 7).toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) + '" class="rotl">' + e(x.name) + '</text></g>';
    });
    return s + '</svg>';
  }
  function rotSlider(m, k){
    var ss = (m.sectors || []).filter(function(x){ return x.path && x.path.length; });
    if (ss.length < 4) return "";
    var n = Math.max.apply(null, ss.map(function(x){ return x.path.length; }));
    var days = ss[0].path.map(function(p){ return p[0]; });
    return card("🎞️ 섹터 흐름 되감기 <span class='mut'>최근 " + n + "거래일 · 꼬리 = 지난 4일 이동</span>",
      '<div id="rotw-' + k + '">' + rotSvg(m, n - 1) + '</div><div class="rotc"><button class="btn" data-rotplay="' + k + '">▶︎ 재생</button><input type="range" min="0" max="' + (n - 1) + '" value="' + (n - 1) + '" data-rot="' + k + '"><b id="rotd-' + k + '">' + e(days[n - 1] || "") + '</b></div>' +
      '<p class="note">막대를 밀면 그날 기준 섹터 위치로 바뀌어요. 왼쪽 아래 → 왼쪽 위 → 오른쪽 위로 도는 섹터가 "새로 돈이 들어오는" 곳.</p>');
  }
  var CMP = null;
  document.addEventListener("input", function(ev){
    var t = ev.target; if (!t.getAttribute || !t.getAttribute("data-rot")) return;
    var k = t.getAttribute("data-rot"), m = CMP && CMP.markets[k]; if (!m) return;
    $("rotw-" + k).innerHTML = rotSvg(m, +t.value);
    var ss = m.sectors.filter(function(x){ return x.path && x.path.length; }); $("rotd-" + k).textContent = (ss[0].path[+t.value] || [""])[0];
  });
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-rotplay]"); if (!b) return;
    var k = b.getAttribute("data-rotplay"), r = document.querySelector('[data-rot="' + k + '"]'); if (!r) return;
    var i = 0, n = +r.max;
    var tick = function(){ if (!document.body.contains(r)) return; r.value = i; r.dispatchEvent(new Event("input", {bubbles: true})); if (i++ < n) setTimeout(tick, 380); };
    tick();
  });
  var KRN = {"005930.KS": "삼성전자", "000660.KS": "SK하이닉스", "042700.KS": "한미반도체", "403870.KQ": "HPSP", "267260.KS": "HD현대일렉트릭", "010120.KS": "LS ELECTRIC",
             "298040.KS": "효성중공업", "012450.KS": "한화에어로", "064350.KS": "현대로템", "009540.KS": "HD한국조선해양", "373220.KS": "LG에너지솔루션", "006400.KS": "삼성SDI",
             "247540.KQ": "에코프로비엠", "207940.KS": "삼성바이오", "196170.KQ": "알테오젠", "068270.KS": "셀트리온", "035420.KS": "NAVER", "035720.KS": "카카오",
             "034020.KS": "두산에너빌리티", "052690.KS": "한전기술"};
  var THEMES = [
    ["반도체", ["NVDA", "MU", "AVGO", "AMD"], ["005930.KS", "000660.KS", "042700.KS", "403870.KQ"]],
    ["전력·전기장비", ["GEV", "VRT", "ETN"], ["267260.KS", "010120.KS", "298040.KS"]],
    ["방산·조선", ["LMT", "NOC", "RTX"], ["012450.KS", "064350.KS", "009540.KS"]],
    ["2차전지·전기차", ["TSLA", "ALB"], ["373220.KS", "006400.KS", "247540.KQ"]],
    ["바이오·비만약", ["LLY", "NVO"], ["207940.KS", "196170.KQ", "068270.KS"]],
    ["인터넷·AI 소프트웨어", ["GOOGL", "META", "MSFT"], ["035420.KS", "035720.KS"]],
    ["원전", ["CEG", "CCJ", "OKLO"], ["034020.KS", "052690.KS"]]
  ];
  function link(C){
    var us = C.markets.US, kr = C.markets.KR; if (!us || !kr) return "";
    var kmap = {}; (kr.sectors || []).forEach(function(s){ kmap[s.k] = s; });
    var top = (us.sectors || []).filter(function(s){ return s.r5 != null; }).sort(function(a, b){ return b.r5 - a.r5; }).slice(0, 4);
    var h = '<div class="xt">' + top.map(function(s){ var k = kmap[s.k];
      return '<div class="xr"><b>' + s.icon + " " + e(s.name) + '</b><span class="mut">🇺🇸 1주</span><b class="' + cls(s.r5) + '">' + pct(s.r5) + '</b><span class="mut">→ 🇰🇷</span>' + (k ? '<b class="' + cls(k.r5) + '">' + pct(k.r5) + '</b>' + (k.r5 < s.r5 - 2 ? chip("덜 오름", "c") : "") : '<span class="mut">–</span>') + '</div>'; }).join("") + '</div>';
    h += '<div class="sub2">테마별 짝꿍 종목 <span class="mut">미국 대장 → 한국 수혜주 · 하루 등락</span></div><div id="lkth">' + THEMES.map(function(t, i){
      return '<div class="lk"><b>' + e(t[0]) + '</b><div class="lk-r">' + t[1].map(function(s){ return '<a class="cp-st" href="javascript:openOP(\'' + s + '\')" data-lk="' + s + '"><b>' + s + '</b><span class="mut">…</span></a>'; }).join("") + '<span class="lk-a">→</span>' +
        t[2].map(function(s){ return '<a class="cp-st" href="javascript:openOP(\'' + s + '\')" data-lk="' + s + '"><b>' + e(KRN[s] || V.cd(s)) + '</b><span class="mut">…</span></a>'; }).join("") + '</div></div>'; }).join("") + '</div>';
    setTimeout(function(){ [].forEach.call(document.querySelectorAll("[data-lk]:not([data-done])"), function(x){ x.setAttribute("data-done", 1);
      V.price(x.getAttribute("data-lk")).then(function(p){ var sp = x.querySelector("span"); if (!p){ sp.textContent = "–"; return; } var c = (p[1] / p[2] - 1) * 100; sp.className = cls(c); sp.textContent = sgn(c) + "%"; });
      }); }, 50);
    return card("🔗 미국 → 한국 연결고리 <span class='mut'>미국에서 강한 업종, 한국은 따라왔나</span>", h +
      '<p class="note">미국에서 1주 동안 강했는데 한국 같은 업종이 "덜 오름"이면 따라잡을 여지를 볼 만해요. 짝꿍 종목은 흔히 같이 묶이는 이름이에요 (참고용).</p>');
  }
  function hlTrend(m){
    var H = m.hl_hist; if (!H || H.length < 5) return "";
    var ratio = H.map(function(x){ return x[1] + x[2] ? x[1] / (x[1] + x[2]) * 100 : 50; });
    var last = ratio[ratio.length - 1], prev = ratio.slice(-6, -1).reduce(function(a, b){ return a + b; }, 0) / Math.max(1, ratio.slice(-6, -1).length);
    return card("📈 신고가 vs 신저가 비율 <span class='mut'>최근 " + H.length + "거래일</span>",
      V.lines([{name: "신고가 비율(%)", color: "#e66767", vals: ratio}], H.map(function(x){ return x[0]; }), {h: 140, unit: "%", nodots: 1}) +
      '<div class="x2"><div><small>오늘 신고가 : 신저가</small><b><span class="up">' + H[H.length - 1][1] + '</span> : <span class="dn">' + H[H.length - 1][2] + '</span></b></div><div><small>신고가 비율</small><b class="' + (last >= 50 ? "up" : "dn") + '">' + last.toFixed(0) + '%</b><em>' + (last > prev + 5 ? "좋아지는 중" : last < prev - 5 ? "나빠지는 중" : "비슷") + '</em></div></div>' +
      '<p class="note">선 하나로 보는 시장 체력. 50% 위 = 1년 최고가를 새로 쓰는 종목이 더 많음. 지수는 오르는데 이 선이 내려가면 "몇 종목만 끌고 가는" 장이에요.</p>');
  }
  function sens(m){
    var S = m.sens; if (!S || !S.items || !S.items.length) return "";
    var it = S.items.slice().sort(function(a, b){ return b.fx - a.fx; });
    var bar = function(v){ var w = Math.min(100, Math.abs(v) * 200); return '<span class="sbar"><i style="' + (v >= 0 ? "left:50%" : "right:50%") + ';width:' + (w / 2).toFixed(0) + '%;background:' + (v >= 0 ? V.UP : V.DN) + '"></i></span>'; };
    var fxUp = S.fx_chg1 != null && S.fx_chg1 > 0, best = it.slice(0, 3), worst = it.slice(-3).reverse();
    return card("💱 환율·금리에 민감한 업종 <span class='mut'>최근 60거래일 같이 움직인 정도</span>",
      '<table class="cmpt sens"><tr><th></th><th>' + e(S.fx_name) + '↑</th><th>미 금리↑</th></tr>' + it.map(function(x){
        return '<tr><td>' + x.icon + " " + e(x.name) + '</td><td>' + bar(x.fx) + '<small class="' + cls(x.fx) + '">' + sgn(x.fx, 2) + '</small></td><td>' + bar(x.rate) + '<small class="' + cls(x.rate) + '">' + sgn(x.rate, 2) + '</small></td></tr>'; }).join("") + '</table>' +
      '<p class="note">최근 ' + e(S.fx_name) + ' <b class="' + cls(S.fx_chg1) + '">' + pct(S.fx_chg1) + '</b> · 미 10년 금리 <b>' + (S.rate_chg1 == null ? "–" : sgn(S.rate_chg1) + "bp") + '</b>. ' +
      e(S.fx_name) + '이 오를 때 같이 오르던 업종: <b>' + best.map(function(x){ return x.name; }).join(", ") + '</b> · 내리던 업종: <b>' + worst.map(function(x){ return x.name; }).join(", ") + '</b>. ' +
      '숫자는 상관계수(−1~+1). 0.3 넘으면 꽤 같이 움직이는 편.</p>');
  }
  window.CPX = function(m, k, C){
    CMP = C;
    return regHist(m) + rotSlider(m, k) + hlTrend(m) + sens(m) + ((k === "KR" || k === "US") ? link(C) : "");
  };

  /* ======================= 🤫 조용한 매집 ======================= */
  P.wrap("accum", function(it, a){
    Promise.all([X("accum_x.json"), getJSON(file("accum", it.id, "list.json")).catch(function(){ return []; }), X("perf_accum.json")]).then(function(r){
      var A = r[0], rows = r[1], Pf = r[2], by = {}, h = "";
      rows.forEach(function(x){ by[x.code] = x; });
      var items = ((A && A.items) || []).filter(function(x){ return by[x.code]; });
      // ① 매집 강도 순위
      var pw = items.filter(function(x){ return x.power != null; }).sort(function(p, q){ return q.power - p.power; });
      if (pw.length) h += card("🏋️ 매집 강도 순위 <span class='mut'>점수 + 변동성 축소 + 거래량 + 수급</span>", V.hbars(pw.slice(0, 12).map(function(x){ var r0 = by[x.code];
        return {label: (V.FLAGS[r0.mkt] || "") + " " + e(r0.name.slice(0, 13)), v: x.power, text: x.power, color: x.power >= 75 ? V.UP : "#d55181", attr: ' onclick="openOP(\'' + e(x.code) + '\')"',
          tip: "<b>" + e(r0.name) + "</b><br>" + Object.keys(x.comp || {}).map(function(k){ return e(k) + " " + x.comp[k]; }).join("<br>") + (x.contr != null ? "<br>최근 10일 변동폭 = 60일의 " + Math.round(x.contr * 100) + "%" : "")}; }), {max: 100}) +
        '<p class="note">"조용히 모은다" = 가격 변동폭은 줄고(축소) 거래는 꾸준. 네 가지를 0~100으로 바꿔 섞었어요. 막대를 길게 누르면 항목별 점수.</p>');
      // ② 연기금·프로그램 (한국)
      var pen = items.filter(function(x){ return x.pen; });
      if (pen.length) h += card("🏛️ 연기금·프로그램 <span class='mut'>한국 · 최근 5일 순매수</span>", '<div class="xt">' + pen.map(function(x){ var r0 = by[x.code];
        return '<div class="xr">' + opA(x.code, '<b>' + e(r0.name) + '</b>') + (x.pen.pen != null ? '<span>연기금 <b class="' + cls(x.pen.pen) + '">' + (x.pen.pen > 0 ? "+" : "") + Math.round(x.pen.pen).toLocaleString() + '</b></span>' : '') +
          (x.pen.prog != null ? '<span>프로그램 <b class="' + cls(x.pen.prog) + '">' + (x.pen.prog > 0 ? "+" : "") + Math.round(x.pen.prog).toLocaleString() + '</b></span>' : '') + '<span class="mut">' + e(x.pen.src) + '</span></div>'; }).join("") + '</div>' +
        '<p class="note">연기금은 오래 들고 가는 돈이라 매집과 겹치면 의미가 커요.</p>');
      else if (items.some(function(x){ return /^\d{6}/.test(x.code); })) h += '<p class="note" style="margin:0 4px 12px">🏛️ 연기금·프로그램 순매수는 자료원(다음·KRX)에서 받아지는 날만 보여요.</p>';
      // ③ 13D/13G
      var dg = items.filter(function(x){ return x.dg && x.dg.length; }), wdg = (A && A.watch_dg) || {};
      if (dg.length || Object.keys(wdg).length) h += card("📑 5% 대량 보유 신고 <span class='mut'>미국 · 최근 60일 SC 13D/13G</span>", '<div class="xt">' +
        dg.map(function(x){ return [x.code, by[x.code].name, x.dg]; }).concat(Object.keys(wdg).map(function(s){ return [s, "⭐ " + s, wdg[s]]; })).map(function(z){
          return '<div class="xr">' + opA(z[0], '<b>' + e(z[1]) + '</b>') + z[2].slice(0, 4).map(function(f){ return '<a class="chip2 ' + (/13D/.test(f.f) ? "hot" : "c") + '" href="' + e(f.u) + '" target="_blank">' + e(f.f.replace("SC ", "")) + " " + md(f.d) + '</a>'; }).join("") + '</div>'; }).join("") + '</div>' +
        '<p class="note">13D = 경영에 관여할 수 있는 5% 이상 보유 (행동주의), 13G = 단순 투자 5% 이상. 매집 신호와 겹치면 "누가 사는지" 단서가 돼요. 누르면 SEC 원문.</p>');
      // ⑤ 거래대금 급감 · 목록에서 빠짐
      var dry = items.filter(function(x){ return x.dry; }), drop = (A && A.dropped) || [];
      if (dry.length || drop.length) h += card("⚠️ 관심이 식는 신호", (dry.length ? '<div class="sub2" style="margin-top:0">최근 5일 거래대금이 그 전의 절반 아래</div><div class="cp-sts">' + dry.map(function(x){ var r0 = by[x.code];
          return opA(x.code, '<span class="cp-st"><b>' + e(r0.name.slice(0, 12)) + '</b><span class="dn">' + Math.round(x.v5 * 100) + '%</span></span>'); }).join("") + '</div>' : '') +
        (drop.length ? '<div class="sub2">어제 목록에 있다가 오늘 빠진 종목 <span class="mut">' + md(A.prev_day) + ' → ' + md(A.date) + '</span></div><div class="cp-sts">' + drop.map(function(x){
          return opA(x.code, '<span class="cp-st"><b>' + (V.FLAGS[x.mkt] || "") + " " + e(String(x.name).slice(0, 12)) + '</b><span class="mut">' + (x.score != null ? Math.round(x.score) + "점" : "") + '</span></span>'); }).join("") + '</div>' : '') +
        '<p class="note">매집이 끝나면 거래가 줄거나 조건에서 빠져요. 돌파 없이 빠지면 "매집 실패"일 수 있으니 들고 있다면 점검.</p>');
      a.insertAdjacentHTML("beforeend", h);
    });
  }, function(it, b){
    X("perf_accum.json").then(function(Pf){
      if (!Pf || !Pf.by_days) return;
      var o = ["1~2일째", "3~5일째", "6~10일째", "11일째 이상"], ks = o.filter(function(k){ return Pf.by_days[k]; });
      if (!ks.length) return;
      b.insertAdjacentHTML("afterbegin", card("⏳ 매집 기간별 돌파 성공률 <span class='mut'>신호 뒤 박스(20일 고점) 돌파 비율</span>", V.hbars(ks.map(function(k){ var x = Pf.by_days[k];
        return {label: e(k) + ' <span class="mut">' + x.n + '건 · 평균 ' + pct((x.now || {}).avg) + '</span>', v: x.brk || 0, text: (x.brk || 0) + "%", color: "#d55181"}; }), {max: 100}) +
        '<p class="note">신호가 처음 나왔을 때 이미 며칠째 매집 중이었나에 따라 나눴어요. 전체 돌파율 ' + ((Pf.brk || {}).rate == null ? "–" : Pf.brk.rate + "%") + '.</p>'));
    });
  });

  /* ======================= 📄 종목리포트 ======================= */
  var GOOD = /(상향|급등|신고가|최고치|호실적|흑자|수주|계약|승인|돌파|매수|강세|확대|성장|기대|beat|surge|record|upgrade|raise|soar|jump|rall|win|approv)/i;
  var BAD = /(하향|급락|적자|손실|소송|리콜|하락|약세|우려|매도|감소|부진|쇼크|경고|조사|miss|plunge|downgrade|cut|fall|drop|slump|lawsuit|probe|warn|recall)/i;
  function newsMood(list){
    var L = (list || []).slice(0, 8).map(function(n){ var g = GOOD.test(n.title), b = BAD.test(n.title); return {d: n.date || "", t: n.title, v: g && !b ? 1 : b && !g ? -1 : 0}; });
    if (L.length < 2) return "";
    var sc = L.reduce(function(a, x){ return a + x.v; }, 0);
    var lab = sc >= 2 ? ["좋은 소식이 많아요", "up"] : sc <= -2 ? ["나쁜 소식이 많아요", "dn"] : ["엇갈려요", ""];
    L.sort(function(a, b){ return a.d < b.d ? -1 : 1; });
    return '<div class="sub2">📰 최근 뉴스 분위기 <b class="' + lab[1] + '">' + lab[0] + '</b></div><div class="nm8">' + L.map(function(x){
      return '<i class="' + (x.v > 0 ? "u" : x.v < 0 ? "d" : "") + '" data-tip="' + e("<b>" + x.d + "</b> " + x.t) + '"></i>'; }).join("") + '<span class="mut">← 오래된 것 · 최근 →</span></div>';
  }
  var IV = null;
  function verdictCard(sym, box){
    var code = sym.split(".")[0];
    Promise.all([getJSON(OPD + "d/" + opFile(sym) + ".json").catch(function(){ return null; }), getJSON(OPD + "e/" + opFile(sym) + ".json").catch(function(){ return null; }),
                 V.price(/^\d{6}\.K[SQ]$/.test(sym) ? code : sym), P.compassNow(), IV ? Promise.resolve(IV) : getJSON(OPD + "ind_val.json").then(function(j){ IV = j; return j; }).catch(function(){ return {}; }),
                 getJSON(OPD + "n/" + opFile(sym) + ".json").catch(function(){ return null; }), P.todaySignals()]).then(function(r){
      var d = r[0] || {}, E = r[1] || {}, p = r[2], C = r[3], iv = (r[4] || {})[d.industry_ko || d.industry] || null, news = r[5] || d.news || [], SG = r[6] || {};
      var mk = (d.ticker && d.ticker.market) || (/\.K[SQ]$/.test(sym) ? "KR" : "US");
      var reg = C && C.markets && C.markets[mk] ? C.markets[mk].regime : null;
      // ① 한 줄 판정: 신호 + 국면 + 52주 위치 + 애널리스트
      var pts = 0, why = [], sg = SG[kn(sym)] || [];
      if (sg.length){ pts += Math.min(2, sg.length); why.push("신호 " + sg.map(function(x){ return x[0].replace(/^\S+\s/, ""); }).slice(0, 2).join("·")); }
      if (reg === "상승장"){ pts += 1; why.push("시장 상승장"); } else if (reg === "하락장"){ pts -= 1; why.push("시장 하락장"); }
      var pos = p && p[3] > p[4] ? (p[1] - p[4]) / (p[3] - p[4]) * 100 : null;
      if (pos != null){ if (pos >= 85){ pts += 1; why.push("1년 고점 근처"); } else if (pos <= 15){ pts -= 1; why.push("1년 저점 근처"); } }
      var an = d.analyst || {}, up = an.target_mean && p ? (an.target_mean / p[1] - 1) * 100 : null;
      if (up != null && an.n_analysts >= 3){ if (up >= 20){ pts += 1; why.push("목표가까지 +" + up.toFixed(0) + "%"); } else if (up < 0){ pts -= 1; why.push("목표가보다 비쌈"); } }
      var vd = pts >= 3 ? ["진입 후보", "hot", "🟢"] : pts >= 1 ? ["주목", "c", "🟡"] : ["관망", "cool", "⚪"];
      var h = '<div class="vd"><span class="vd-i">' + vd[2] + '</span><div><b>지금은 <span class="chip2 ' + vd[1] + '">' + vd[0] + '</span></b><small>' + e(why.join(" · ") || "눈에 띄는 신호 없음") + '</small></div>' + P.starBtn(sym, d.ticker ? d.ticker.name : sym, 1) + '</div>';
      // ② 밸류 위치
      var pe = d.pe, fe = null, est = (E.estimates || [])[0];
      if (est && est.eps && p && est.eps > 0) fe = p[1] / est.eps;
      if (pe || fe){
        var hi = Math.max(pe || 0, fe || 0, (iv && iv.pe75) || 0, (iv && iv.pe) || 0) * 1.15 || 1;
        var mark = function(v, lab, c){ return v ? '<span class="vm" style="left:' + Math.min(100, v / hi * 100).toFixed(1) + '%;--mc:' + c + '"></span>' : ''; };
        var leg = function(v, lab, c){ return v ? '<span><i style="background:' + c + '"></i>' + lab + ' <b>' + v.toFixed(1) + '배</b></span>' : ''; };
        h += '<div class="sub2">💰 밸류 위치 <span class="mut">PER (주가 ÷ 1주당 이익)</span></div><div class="vbar">' +
          (iv && iv.pe25 && iv.pe75 ? '<span class="vrange" style="left:' + (iv.pe25 / hi * 100).toFixed(1) + '%;width:' + ((iv.pe75 - iv.pe25) / hi * 100).toFixed(1) + '%"></span>' : '') +
          mark(iv && iv.pe, "업종 중간", "#8a94a8") + mark(pe, "지금", "#ffb84d") + mark(fe, "내년 예상", "#3dd6c6") + '</div>' +
          '<div class="vleg">' + leg(pe, "지금", "#ffb84d") + leg(iv && iv.pe, "업종 중간", "#8a94a8") + leg(fe, "내년 예상", "#3dd6c6") + '</div>' +
          '<p class="note">' + (iv ? "회색 띠 = 같은 업종(" + e(d.industry_ko || d.industry) + ", " + iv.n + "종목)의 가운데 절반. " : "") +
          (pe && iv && iv.pe ? (pe < iv.pe * 0.8 ? "업종보다 <b>싼 편</b>" : pe > iv.pe * 1.25 ? "업종보다 <b>비싼 편</b>" : "업종과 <b>비슷</b>") + "이에요. " : "") +
          (fe && pe ? (fe < pe * 0.85 ? "내년 이익이 늘 거라 예상 PER은 더 낮아요." : "") : "") + (d.pb ? " PBR " + d.pb.toFixed(1) + "배" + (iv && iv.pb ? " (업종 " + iv.pb + "배)" : "") + "." : "") + '</p>';
      }
      // ③ 실적 서프라이즈
      var S = E.surp || [];
      if (S.length >= 2){
        h += '<div class="sub2">🎯 실적 서프라이즈 <span class="mut">최근 ' + S.length + '분기 · 예상 EPS 대비 실제</span></div>' + V.cols(S.map(function(x){ var s = x[1] ? (x[2] / Math.abs(x[1]) - (x[1] < 0 ? -1 : 1)) * 100 : 0;
          s = Math.max(-60, Math.min(60, s));
          return {label: x[0].slice(2, 7).replace("-", "/"), v: s, top: (s > 0 ? "+" : "") + s.toFixed(0) + "%", tip: "<b>" + x[0] + "</b><br>예상 " + x[1] + " · 실제 " + x[2]}; }), {h: 100}) +
          '<p class="note">' + S.filter(function(x){ return x[2] >= x[1]; }).length + '/' + S.length + '번 예상을 넘었어요. 꾸준히 넘는 회사는 실적 발표 때 갭이 위로 날 확률이 높아요.</p>';
      } else if (E.cal && (E.cal.earn || []).length) h += '<p class="note">📅 다음 실적 ' + e(E.cal.earn[0]) + ' (서프라이즈 기록은 미국·애널리스트가 있는 종목만, 매주 토요일 갱신)</p>';
      // ④ 뉴스 분위기
      h += newsMood(news);
      // ⑤ 내 메모
      var w = P.WL()[kn(sym)];
      h += '<div class="sub2">📝 내 메모</div><div id="opmemo" class="opmemo">' + (w && (w.buy || w.tgt || w.stop || w.memo) ?
        '<div class="wl-m">' + (w.buy ? '<span>매수 ' + fmt(w.buy) + (p ? ' <b class="' + cls(p[1] - w.buy) + '">' + pct((p[1] / w.buy - 1) * 100) + '</b>' : '') + '</span>' : '') + (w.tgt ? '<span class="up">🎯 ' + fmt(w.tgt) + '</span>' : '') + (w.stop ? '<span class="dn">🛑 ' + fmt(w.stop) + '</span>' : '') + '</div>' + (w.memo ? '<p class="wl-memo">' + e(w.memo) + '</p>' : '') : '<p class="note" style="margin:0">매수가·목표가·손절가와 매수 이유를 적어두면 가격이 닿을 때 알려줘요.</p>') +
        '<button class="btn" id="opmemob" style="margin-top:8px">✏️ 메모 ' + (w ? "고치기" : "쓰기") + '</button></div>';
      box.innerHTML = '<section class="card opx">' + h + '</section>';
      var mb = $("opmemob"); if (mb) mb.onclick = function(){
        var k = kn(sym), W_ = P.WL(); if (!W_[k]){ W_[k] = {n: d.ticker ? d.ticker.name : sym, s: sym, t: P.today(), p0: p ? p[1] : null}; }
        P.memoForm($("opmemo"), k, function(){ verdictCard(sym, box); });
      };
    });
  }
  var OLD_SB = window.sigBadges;
  window.sigBadges = function(sym){
    return OLD_SB(sym).then(function(h){
      setTimeout(function(){ var el = $("opsig"); if (!el) return; var bx = document.createElement("div"); el.appendChild(bx); bx.innerHTML = '<div class="loading">판정 계산 중…</div>'; verdictCard(sym, bx); }, 0);
      return h;
    });
  };

  /* ======================= ⚡ 단타 ======================= */
  P.wrap("danta", function(it, a, o){
    Promise.all([X("danta_stats.json"), P.compassNow()]).then(function(r){
      var S = r[0], C = r[1], h = "", reg = C && C.markets && C.markets.KR ? C.markets.KR.regime : null;
      // ④ 시장 체제 연동
      if (reg) h += '<div class="rgban ' + (RC[reg] || "f") + '">🧭 한국 <b>' + e(reg) + '</b> — ' + (reg === "하락장" ? "C등급 알람은 앱 푸시를 줄였어요. 알람이 와도 더 깐깐하게." : reg === "상승장" ? "알람이 잘 맞기 쉬운 장이에요. 그래도 손절은 꼭." : "방향이 없는 장 — A·B등급 위주로 보세요.") + '</div>';
      // ⑤ 하루 손실 한도
      var T = S && S.today, lim = store.dlim || {pnl: 3, stops: 2};
      if (T && T.d === P.today()){
        var over = (T.pnl != null && T.pnl <= -lim.pnl) || (T.stops >= lim.stops);
        h += '<div class="dlim ' + (over ? "over" : "") + '"><b>' + (over ? "🛑 오늘은 여기까지" : "✅ 오늘 손실 한도 안") + '</b><span>가상 매매 ' + pct(T.pnl) + ' · 손절 ' + T.stops + '번 · 연속 ' + T.streak + '번</span>' +
          '<small>내 한도: 하루 −' + lim.pnl + '% 또는 손절 ' + lim.stops + '번 <a href="javascript:void 0" id="dlimset">바꾸기</a></small></div>';
      } else h += '<div class="dlim"><b>🧯 하루 손실 한도</b><span>오늘 알람이 쌓이면 가상 매매 기준으로 한도를 확인해요.</span><small>내 한도: 하루 −' + lim.pnl + '% 또는 손절 ' + lim.stops + '번 <a href="javascript:void 0" id="dlimset">바꾸기</a></small></div>';
      // ③ A등급만 보기
      h += '<div class="seg2" id="dgrd"><button data-g="all" class="' + (store.dgrade === "A" ? "" : "on") + '">전체 알람</button><button data-g="A" class="' + (store.dgrade === "A" ? "on" : "") + '">품질 A만</button></div>';
      a.innerHTML = h;
      var ap = function(){ [].forEach.call(o.querySelectorAll(".list .st"), function(st){ var g = st.querySelector(".chip2.gA"); st.style.display = store.dgrade === "A" && !g ? "none" : ""; }); };
      [].forEach.call(a.querySelectorAll("#dgrd button"), function(b){ b.onclick = function(){ store.dgrade = b.dataset.g; save(); [].forEach.call(a.querySelectorAll("#dgrd button"), function(x){ x.classList.toggle("on", x === b); }); ap(); }; });
      setTimeout(ap, 1500); new MutationObserver(ap).observe(o, {childList: true, subtree: true});
      var ds = $("dlimset"); if (ds) ds.onclick = function(){
        var v = prompt("하루 손실 한도 % (예: 3)", lim.pnl), n = prompt("하루 손절 횟수 한도 (예: 2)", lim.stops);
        if (v && n){ store.dlim = {pnl: Math.abs(+v) || 3, stops: Math.max(1, +n || 2)}; save(); go("danta", curDate); }
      };
    });
  }, function(it, b){
    X("danta_stats.json").then(function(S){
      if (!S) return;
      var h = "";
      // ① 최적 시간대
      var sl = S.by_slot || {}, all = (S.all || {}).win || 0, ks = Object.keys(sl);
      var good = ks.filter(function(k){ return sl[k].n >= 5 && sl[k].win >= all; }).sort(function(x, y){ return sl[y].win - sl[x].win; });
      if (ks.length) h += card("⏰ 잘 맞는 시간대 <span class='mut'>전체 승률 " + all + "%</span>", '<div class="cp-sts">' + ks.map(function(k){ var g = good.indexOf(k) >= 0;
        return '<span class="cp-st"><b>' + e(k) + '</b><span class="' + (g ? "up" : "mut") + '">' + sl[k].win + '%</span><span class="mut">' + sl[k].n + '건</span>' + (g ? '<span class="up">✓</span>' : '') + '</span>'; }).join("") + '</div>' +
        '<p class="note">' + (good.length ? "<b>" + good.join(", ") + "</b>에 뜬 알람이 평균보다 잘 맞았어요." : "아직 평균보다 확실히 나은 시간대가 없어요.") + ' 이 시간대 알람만 받으려면 아래 구독.</p>' +
        '<div class="al-b"><a class="btn al-sub" href="ntfy://ntfy.sh/chkchp-ch-danta-best">🔔 잘 맞는 시간대만 받기</a><a class="btn al-sub" href="ntfy://ntfy.sh/chkchp-ch-danta-a">🔔 품질 A만 받기</a></div>' +
        '<p class="note">둘 다 실시간 단타 알림이에요. 전체 알림(⚡ 단타)을 끄고 이것만 켜면 알림 수가 줄어요.</p>');
      // ② 실패 패턴
      var pt = S.patterns || {};
      h += card("🔍 손절 난 알람의 공통점 <span class='mut'>손절 " + (pt.n || 0) + "건 분석</span>", (pt.lines && pt.lines.length ? '<div class="xt">' + pt.lines.map(function(l){ return '<div class="xr"><span class="chip2 cool">' + e(l.k) + '</span><span>' + e(l.t) + '</span></div>'; }).join("") + '</div>'
        : '<p class="note" style="margin:0">손절이 5건 넘게 쌓이면 시간대·유형·요일·당일 등락에서 공통점을 찾아줘요.</p>') +
        '<p class="note">손절 = 알람이 정한 손절가까지 내려간 경우 (가상 매매 기준). 표본이 적으면 우연일 수 있어요.</p>');
      b.insertAdjacentHTML("afterbegin", h);
    });
  });

  /* ======================= 🔔 알림 ======================= */
  var OLD_AV = window.alarmView, OLD_AI = window.alarmInit;
  ALARMS.push({t: "brief", ic: "☀️", nm: "아침 요약 하나로", d: "탭별 알림 대신 아침에 한 번: 국면·시황 할 일·오늘 신호 수·다가오는 실적"});
  ALARMS.push({t: "danta-a", ic: "🅰️", nm: "단타 — 품질 A만", d: "같은 유형·시간대 과거 승률이 좋은 알람만 (실시간)"});
  ALARMS.push({t: "danta-best", ic: "⏰", nm: "단타 — 잘 맞는 시간대만", d: "승률이 평균보다 높은 시간대에 뜬 알람만 (실시간)"});
  window.alarmView = function(){
    var al = store.al || {}, q = al.quiet || [23, 7];
    var opt = function(sel){ var s = ""; for (var i = 0; i < 24; i++) s += '<option value="' + i + '"' + (i === sel ? " selected" : "") + '>' + (i < 10 ? "0" : "") + i + ':00</option>'; return s; };
    var wl = P.WL(), wk = Object.keys(wl), withPx = wk.filter(function(k){ return wl[k].tgt || wl[k].stop; });
    var top = '<section class="card me"><h3>⭐ 내 알림 <span class="mut">이 휴대폰 전용 주제</span></h3>' +
      '<p class="note" style="margin-top:0">관심종목에 신호가 뜰 때 · 목표가/손절가에 닿을 때 · 내 종목 아침 요약이 여기로 와요.</p>' +
      '<div class="al-b"><a class="btn al-sub" href="ntfy://ntfy.sh/' + MYTOPIC + '">🔔 내 알림 구독</a><a class="btn" href="javascript:openWL()">⭐ 관심종목 ' + wk.length + '개</a><button class="btn al-test" data-me="1">테스트</button></div>' +
      '<div class="sub2">🎯 가격 도달 알림 <span class="mut">매시간 확인</span></div>' + (withPx.length ? '<div class="xt">' + withPx.map(function(k){ var w = wl[k];
        return '<div class="xr">' + opA(w.s || k, '<b>' + e(w.n || k) + '</b>') + (w.tgt ? '<span class="up">🎯 ' + fmt(w.tgt) + '</span>' : '') + (w.stop ? '<span class="dn">🛑 ' + fmt(w.stop) + '</span>' : '') + '</div>'; }).join("") + '</div>'
        : '<p class="note" style="margin-top:0">관심종목의 ✏️ 메모에서 목표가·손절가를 적으면 닿을 때 알려줘요.</p>') +
      '<div class="sub2">🌙 조용한 시간 <span class="mut">이 시간엔 소리·진동 없이</span></div><div class="qrow"><select id="qa">' + opt(q[0]) + '</select><span>부터</span><select id="qb">' + opt(q[1]) + '</select><span>까지</span></div>' +
      '<label class="tg"><input type="checkbox" id="qbrief"' + (al.brief === 0 ? "" : " checked") + '> 아침에 내 관심종목 요약 받기</label>' +
      '<p class="note">단타 실시간 알림은 장중이라 조용한 시간과 상관없어요. 휴대폰 "방해 금지 모드"를 같이 쓰면 더 확실해요.</p></section>';
    var base = OLD_AV();
    return top + base.replace('<div class="sec">받을 알림 고르기</div>', '<div class="sec">받을 알림 고르기 (모두 함께 보기)</div>') + '<div id="plog"></div>';
  };
  window.alarmInit = function(){
    OLD_AI();
    var sv = function(){ store.al = {quiet: [+$("qa").value, +$("qb").value], brief: $("qbrief").checked ? 1 : 0}; save(); P.sync(); P.toast("저장했어요"); };
    ["qa", "qb", "qbrief"].forEach(function(id){ var x = $(id); if (x) x.onchange = sv; });
    var t = document.querySelector('[data-me]'); if (t) t.onclick = function(){ t.disabled = true; t.textContent = "보내는 중…";
      fetch("https://ntfy.sh/" + MYTOPIC, {method: "POST", body: "⭐ 내 알림 테스트 — 관심종목 알림이 이렇게 와요!", headers: {"Title": "CH Investing"}}).then(function(){ t.textContent = "보냈어요 ✓"; }).catch(function(){ t.textContent = "실패"; t.disabled = false; }); };
    // ④ 알림 기록 + 그 뒤 수익률
    X("push_log.json").then(function(L){
      var el = $("plog"); if (!el) return;
      if (!L || !L.length){ el.innerHTML = card("📜 알림 기록", '<p class="note" style="margin:0">보낸 알림이 쌓이면 여기서 다시 보고, 그때 가격 대비 지금 수익률도 보여줘요.</p>'); return; }
      el.innerHTML = card("📜 알림 기록 <span class='mut'>최근 " + Math.min(40, L.length) + "개 · 그때 가격 → 지금</span>", '<div class="plog">' + L.slice(0, 40).map(function(x, i){
        return '<div class="pl"><div class="row"><b>' + e(x.title) + '</b><span class="mut">' + e(x.t.slice(5)) + '</span></div><small>' + e(x.msg) + '</small>' +
          ((x.syms || []).filter(function(s){ return s[1]; }).length ? '<div class="cp-sts">' + x.syms.filter(function(s){ return s[1]; }).slice(0, 6).map(function(s){
            return '<a class="cp-st" href="javascript:openOP(\'' + e(s[0]) + '\')" data-pl0="' + e(s[0]) + '" data-px0="' + s[1] + '"><b>' + e(V.cd(s[0])) + '</b><span class="mut">…</span></a>'; }).join("") + '</div>' : '') +
          '<a class="btn" style="margin-top:6px" href="javascript:go(\'' + e(x.tab === "sector" ? "sector" : x.tab) + '\')">탭 열기 →</a></div>'; }).join("") + '</div>' +
        '<p class="note">수익률 = 알림 보낸 때 가격 → 최근 종가. 신호가 실제로 쓸모 있었는지 확인하는 용도예요.</p>');
      [].forEach.call(el.querySelectorAll("[data-pl0]"), function(a){ V.price(a.getAttribute("data-pl0")).then(function(p){ var s = a.querySelector("span"); if (!p){ s.textContent = "–"; return; }
        var r = (p[1] / +a.getAttribute("data-px0") - 1) * 100; if (Math.abs(r) > 80){ s.textContent = "–"; return; } s.className = cls(r); s.textContent = pct(r); }); });
    });
  };
})();
