/* 📦 app.b03.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 3/7 (plus3.js … port.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
/* ======== plus3.js ======== */
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
  var RSEL = {};       // 되감기: 고른 섹터만 (10/11 사용자: "섹터 선택하면 그것만 돌려 볼 수 있게, 전체 누르면 다시 전체")
  /* 🗓 11/17 섹터 기간 탭(1·3·6개월) — 3·6개월을 고르면 그 기간 흐름(pathp)으로 되감기 */
  function rpth(m){ var SP = window.SECP, p = SP ? SP.rp(m) : "1M"; return {p: p, L: SP ? SP.lab(p) : {xl: "1개월", yl: "1주"}, f: function(x){ return SP ? SP.path(x, p, m) : x.path; }}; }
  function rotSvg(m, di, sel){
    var RP = rpth(m);
    var ss = (m.sectors || []).map(function(x){ var o = Object.create(x); o.path = RP.f(x); o._s = x; return o; }).filter(function(x){ return x.path && x.path.length; });
    if (ss.length < 4) return "";
    var W = 330, H = 250, Pd = 26, all = [];
    ss.forEach(function(x){ if (!sel || x.k === sel) x.path.forEach(function(p){ all.push(p); }); });
    var TOP = V.topSet(ss, 10);   // 한 섹터만 볼 땐 그 섹터 길이에 맞춰 크게
    var SP = window.SECP, cur = [];
    ss.forEach(function(x){ if (!sel || x.k === sel){ var q = x.path[Math.min(di, x.path.length - 1)]; if (q) cur.push(q); } });
    // 📏 11/17 혼자 튄 섹터는 가장자리에 붙임 — 축은 지금 칸 기준(지난 길이 넘치면 가장자리에서 잘림)
    var mx = SP ? SP.lim(cur.map(function(p){ return p[2]; })) : Math.max.apply(null, all.map(function(p){ return Math.abs(p[2]); }).concat([1])) * 1.12,
        my = SP ? SP.lim(cur.map(function(p){ return p[1]; })) : Math.max.apply(null, all.map(function(p){ return Math.abs(p[1]); }).concat([1])) * 1.12;
    var cX = function(v){ return Math.max(-mx * .94, Math.min(mx * .94, v)); }, cY = function(v){ return Math.max(-my * .94, Math.min(my * .94, v)); };
    var Xs = function(v){ v = cX(v); return Pd + (v + mx) / (2 * mx) * (W - 2 * Pd); }, Ys = function(v){ v = cY(v); return Pd + (my - v) / (2 * my) * (H - 2 * Pd); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="rotsv">' +
      '<rect x="' + Xs(0) + '" y="' + Pd + '" width="' + (W - Pd - Xs(0)) + '" height="' + (Ys(0) - Pd) + '" fill="#e66767" opacity=".08"/><rect x="' + Pd + '" y="' + Ys(0) + '" width="' + (Xs(0) - Pd) + '" height="' + (H - Pd - Ys(0)) + '" fill="#3987e5" opacity=".08"/>' +
      '<line x1="' + Pd + '" x2="' + (W - Pd) + '" y1="' + Ys(0) + '" y2="' + Ys(0) + '" stroke="#3a4358"/><line x1="' + Xs(0) + '" x2="' + Xs(0) + '" y1="' + Pd + '" y2="' + (H - Pd) + '" stroke="#3a4358"/>' +
      '<text x="' + (W - Pd - 2) + '" y="' + (Pd + 12) + '" text-anchor="end" class="rotq u">🔥 계속 강함</text><text x="' + (Pd + 2) + '" y="' + (Pd + 12) + '" class="rotq">🌱 새로 뜨는 중</text>' +
      '<text x="' + (W - Pd - 2) + '" y="' + (H - Pd - 6) + '" text-anchor="end" class="rotq">🍂 힘 빠지는 중</text><text x="' + (Pd + 2) + '" y="' + (H - Pd - 6) + '" class="rotq d">🧊 계속 약함</text>';
    var OUT = [];
    ss.forEach(function(x, i){
      if (sel && x.k !== sel) return;
      var p = x.path, k = Math.min(di, p.length - 1), tr = p.slice(sel ? 0 : Math.max(0, k - 4), k + 1);   // 한 섹터만 볼 땐 처음부터 지나온 길 전부
      var col = V.secCol(x.k, i);
      s += '<g data-fam="' + V.famOf(x) + '"' + (sel || TOP[x.k] ? ' data-top="1"' : '') + '>';
      if (tr.length > 1) s += '<polyline points="' + tr.map(function(q){ return Xs(q[2]).toFixed(1) + "," + Ys(q[1]).toFixed(1); }).join(" ") + '" fill="none" stroke="' + col + '" stroke-opacity="' + (sel ? .8 : .45) + '" stroke-width="' + (sel ? 2.5 : 2) + '"/>' +
        (sel ? tr.slice(0, -1).map(function(q){ return '<circle cx="' + Xs(q[2]).toFixed(1) + '" cy="' + Ys(q[1]).toFixed(1) + '" r="2" fill="' + col + '" opacity=".6"/>'; }).join("") : '');
      var cx = Xs(p[k][2]), cy = Ys(p[k][1]);
      s += '<g data-csec="' + e(x.k) + '" data-cm="' + MKX + '" style="cursor:pointer" data-tip="' + e("<b>" + x.icon + " " + x.name + "</b> " + p[k][0] + "<br>" + RP.L.yl + " " + pct(p[k][1]) + " · " + RP.L.xl + " " + pct(p[k][2])) + '"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="' + col + '" stroke="#121826" stroke-width="2"/>' +
        (function(){ var q = p[k], dx = q[2] > mx * .94 ? 1 : q[2] < -mx * .94 ? -1 : 0, dy = q[1] > my * .94 ? 1 : q[1] < -my * .94 ? -1 : 0;
          if ((dx || dy) && SP){ OUT.push({n: x.name, c: col, v: dx ? q[2] : q[1]}); return SP.tri(cx, cy, dx, dy, col) + '</g></g>'; }
          return '<text x="' + (cx + 7).toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) + '" class="rotl" style="fill:' + col + '">' + e(V.shortSec(x.name)) + '</text></g></g>'; })();
    });
    var RI = {"1M": "최근 15거래일 · 하루 간격", "3M": "최근 약 3개월(60거래일) · 4거래일 간격", "6M": "최근 약 6개월(120거래일) · 8거래일 간격"}, want = SP ? SP.cur() : "1M";
    var hd = '<div class="rot-hd">' + (want !== RP.p ? '⏳ <b>' + SP.lab(want).xl + ' 흐름은 오늘 저녁(16:20 가격 작업) 뒤부터</b> 나와요. 지금은 <b>1개월 흐름</b>을 보여 줘요.' :
      '<b>' + RP.L.xl + ' 흐름</b> · ' + RI[RP.p] + ' · 꼬리 = 직전 4칸 · 가로 ' + RP.L.xl + ' · 세로 ' + RP.L.yl + (SP && SP.xs(m) ? ' (' + e(SP.ixn(m)) + ' 대비)' : '')) + '</div>';
    return hd + s + '</svg>' + (SP ? SP.out(OUT) : '');
  }
  if (window.SECP) SECP.reg("rot", function(m, k){ var r = document.querySelector('[data-rot="' + k + '"]'); if (r) r._tok = Math.random();
    var n = rlen(m), v = n - 1; if (r){ r.max = n - 1; r.value = v; }
    var RP = rpth(m), s0 = (m.sectors || []).filter(function(x){ var q = RP.f(x); return q && q.length; })[0], dd = document.getElementById("rotd-" + k);
    if (dd && s0) dd.textContent = (RP.f(s0)[v] || [""])[0];
    return rotSvg(m, v, RSEL[k]); });
  function rlen(m){ var RP = rpth(m); return Math.max.apply(null, (m.sectors || []).map(function(x){ var q = RP.f(x); return q ? q.length : 0; }).concat([1])); }
  function rotSlider(m, k){
    var RP = rpth(m);
    var ss = (m.sectors || []).filter(function(x){ var q = RP.f(x); return q && q.length; });
    if (ss.length < 4) return "";
    var n = Math.max.apply(null, ss.map(function(x){ return RP.f(x).length; }));
    var days = RP.f(ss[0]).map(function(p){ return p[0]; });
    return card("🎞️ 섹터 흐름 되감기 <span class='mut'>기간 탭에 따라 1·3·6개월 흐름</span>", (window.SECP ? SECP.tabs("p") : "") +
      '<div class="famw" data-ff="' + ((window.store && store.secf) || "") + '"><div id="rotw-' + k + '"' + (window.SECP ? ' data-secpb="rot" data-mk="' + e(k) + '"' : '') + '>' + rotSvg(m, n - 1, RSEL[k]) + '</div>' + V.famChips("rot") +
      // 세부 섹터 칩: 고른 계열의 섹터만 보이고, 누르면 그 섹터만 재생 (10/11 사용자: "밑에 세부 섹터는 되감기 재생 안 됨")
      '<div class="rots">' + ['<button data-rsel="' + k + '|"' + (!RSEL[k] ? ' class="on"' : '') + '>전체</button>'].concat(ss.map(function(x, i){
        return '<button data-rsel="' + k + '|' + e(x.k) + '" data-fam="' + V.famOf(x) + '" style="--sc:' + V.secCol(x.k, i) + '"' + (RSEL[k] === x.k ? ' class="on"' : '') + '><i></i>' + e(x.name) + '</button>'; })).join("") + '</div></div>' +
      '<div class="rotc"><button class="btn" data-rotplay="' + k + '">▶︎ 재생</button><input type="range" min="0" max="' + (n - 1) + '" value="' + (n - 1) + '" data-rot="' + k + '"><b id="rotd-' + k + '">' + e(days[n - 1] || "") + '</b></div>' +
      '<p class="note">막대를 밀면 그날 기준 섹터 위치로 바뀌어요. 왼쪽 아래 → 왼쪽 위 → 오른쪽 위로 도는 섹터가 "새로 돈이 들어오는" 곳.</p>');
  }
  var CMP = null;
  document.addEventListener("input", function(ev){
    var t = ev.target; if (!t.getAttribute || !t.getAttribute("data-rot")) return;
    var k = t.getAttribute("data-rot"), m = CMP && CMP.markets[k]; if (!m) return;
    $("rotw-" + k).innerHTML = rotSvg(m, +t.value, RSEL[k]);
    var RP = rpth(m), ss = m.sectors.filter(function(x){ var q = RP.f(x); return q && q.length; }); if (ss.length) $("rotd-" + k).textContent = (RP.f(ss[0])[+t.value] || [""])[0];
  });
  document.addEventListener("click", function(ev){       // 계열(큰 섹터)을 다시 고르면 세부 섹터 선택은 풀고 그 계열 전체로
    var fb = ev.target.closest && ev.target.closest(".famc [data-ffam]"); if (!fb) return;
    var w = fb.closest(".famw"), rw = w && w.querySelector('[id^="rotw-"]'); if (!rw) return;
    var k = rw.id.slice(5), m = CMP && CMP.markets[k], r = w.parentNode.querySelector('[data-rot="' + k + '"]');
    RSEL[k] = null;
    [].forEach.call(w.querySelectorAll(".rots button"), function(x){ x.classList.toggle("on", x.dataset.rsel === k + "|"); });
    if (m && r){ r._tok = Math.random(); rw.innerHTML = rotSvg(m, +r.value, null); }
  });
  document.addEventListener("click", function(ev){       // 섹터 고르기 → 그 섹터만 처음부터 재생 · 전체 → 전체 재생
    var b = ev.target.closest && ev.target.closest("[data-rsel]"); if (!b) return;
    var a = b.getAttribute("data-rsel").split("|"), k = a[0];
    RSEL[k] = a[1] || null;
    [].forEach.call(b.parentNode.children, function(x){ x.classList.toggle("on", x === b); });
    var w = b.closest(".famw");
    if (w && w.dataset.ff && b.dataset.fam && b.dataset.fam !== w.dataset.ff){ var fb = w.querySelector('.famc [data-ffam="' + b.dataset.fam + '"]'); if (fb) fb.click(); }
    var pb = document.querySelector('[data-rotplay="' + k + '"]'); if (pb) pb.click();
  });
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-rotplay]"); if (!b) return;
    var k = b.getAttribute("data-rotplay"), r = document.querySelector('[data-rot="' + k + '"]'); if (!r) return;
    var i = 0, n = +r.max, tok = r._tok = Math.random();      // 새로 누르면 앞의 재생은 멈춤
    var tick = function(){ if (!document.body.contains(r) || r._tok !== tok) return; r.value = i; r.dispatchEvent(new Event("input", {bubbles: true})); if (i++ < n) setTimeout(tick, 380); };
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
  function link(C, tk){
    tk = tk || "KR";
    var us = C.markets.US, kr = C.markets[tk]; if (!us || !kr) return "";
    var kmap = {}; (kr.sectors || []).forEach(function(s){ kmap[s.k] = s; });
    var top = (us.sectors || []).filter(function(s){ return s.r5 != null; }).sort(function(a, b){ return b.r5 - a.r5; }).slice(0, 4);
    var h = '<div class="xt">' + top.map(function(s){ var k = kmap[s.k];
      return '<div class="xr" data-csec="' + e(s.k) + '" data-cm="US" style="cursor:pointer"><b>' + s.icon + " " + e(s.name) + ' <span class="hgo">›</span></b><span class="mut">🇺🇸 1주</span><b class="' + cls(s.r5) + '">' + pct(s.r5) + '</b><span class="mut">→ ' + kr.flag + '</span>' + (k ? '<b class="' + cls(k.r5) + '">' + pct(k.r5) + '</b>' + (k.r5 < s.r5 - 2 ? chip("덜 오름", "c") : "") : '<span class="mut">–</span>') + '</div>'; }).join("") + '</div>';
    if (tk === "KR") h += '<div class="sub2">테마별 짝꿍 종목 <span class="mut">미국 대장 → 한국 수혜주 · 하루 등락</span></div><div id="lkth">' + THEMES.map(function(t, i){
      return '<div class="lk"><b>' + e(t[0]) + '</b><div class="lk-r">' + t[1].map(function(s){ return '<a class="cp-st" href="javascript:openOP(\'' + s + '\')" data-lk="' + s + '"><b>' + s + '</b><span class="mut">…</span></a>'; }).join("") + '<span class="lk-a">→</span>' +
        t[2].map(function(s){ return '<a class="cp-st" href="javascript:openOP(\'' + s + '\')" data-lk="' + s + '"><b>' + e(KRN[s] || V.cd(s)) + '</b><span class="mut">…</span></a>'; }).join("") + '</div></div>'; }).join("") + '</div>';
    setTimeout(function(){ [].forEach.call(document.querySelectorAll("[data-lk]:not([data-done])"), function(x){ x.setAttribute("data-done", 1);
      V.price(x.getAttribute("data-lk")).then(function(p){ var sp = x.querySelector("span"); if (!p){ sp.textContent = "–"; return; } var c = (p[1] / p[2] - 1) * 100; sp.className = cls(c); sp.textContent = sgn(c) + "%"; });
      }); }, 50);
    return card("🔗 미국 → " + e(kr.name) + " 연결고리 <span class='mut'>미국에서 강한 업종, " + e(kr.name) + "은 따라왔나</span>", h +
      '<p class="note">미국에서 1주 동안 강했는데 ' + e(kr.name) + ' 같은 업종이 "덜 오름"이면 따라잡을 여지를 볼 만해요. 업종을 누르면 미국 종목과 ' + e(kr.name) + ' 같은 섹터 종목을 함께 보여줘요.' + (tk === "KR" ? ' 짝꿍 종목은 흔히 같이 묶이는 이름이에요 (참고용).' : '') + '</p>');
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
        return '<tr data-csec="' + e(x.k) + '" data-cm="' + MKX + '" class="hrow"><td>' + x.icon + " " + e(x.name) + ' <span class="hgo">›</span></td><td>' + bar(x.fx) + '<small class="' + cls(x.fx) + '">' + sgn(x.fx, 2) + '</small></td><td>' + bar(x.rate) + '<small class="' + cls(x.rate) + '">' + sgn(x.rate, 2) + '</small></td></tr>'; }).join("") + '</table>' +
      '<p class="note">최근 ' + e(S.fx_name) + ' <b class="' + cls(S.fx_chg1) + '">' + pct(S.fx_chg1) + '</b> · 미 10년 금리 <b>' + (S.rate_chg1 == null ? "–" : sgn(S.rate_chg1) + "bp") + '</b>. ' +
      e(S.fx_name) + '이 오를 때 같이 오르던 업종: <b>' + best.map(function(x){ return x.name; }).join(", ") + '</b> · 내리던 업종: <b>' + worst.map(function(x){ return x.name; }).join(", ") + '</b>. ' +
      '숫자는 상관계수(−1~+1). 0.3 넘으면 꽤 같이 움직이는 편.</p>');
  }
  /* ⚡ 장중 나침반 (한국·일본·중국·홍콩·미국, 10분마다) */
  function liveLine(sn, ixn){
    if (!sn || sn.length < 2) return "";
    var br = sn.map(function(x){ return x[1] + x[2] ? Math.round(x[1] / (x[1] + x[2]) * 100) : 50; });
    return '<div class="sub2">오늘 장중 흐름 <span class="mut">10분마다</span></div>' + V.lines([{name: "상승 종목 비율(%)", color: "#e66767", vals: br}, {name: (ixn || "코스피") + " 등락(%)", color: "#7c9cff", vals: sn.map(function(x){ return x[3]; })}],
      sn.map(function(x){ return x[0]; }), {h: 130, nodots: sn.length > 8 ? 1 : 0});
  }
  var LVM = [["KR", "🇰🇷", "한국"], ["JP", "🇯🇵", "일본"], ["CN", "🇨🇳", "중국"], ["HK", "🇭🇰", "홍콩"], ["US", "🇺🇸", "미국"]], LVSEL = null;
  function liveBody(L, mk, C, test){
    var r = L.up / Math.max(1, L.up + L.down) * 100;
    var y = C && C.markets && C.markets[mk], yr = y ? y.up / Math.max(1, y.up + y.down) * 100 : null;
    var cur = mk === "KR" ? "" : (L.vcur || "");
    var chip_ = function(x){ return '<a class="cp-st" href="javascript:openOP(\'' + e(x.s) + '\')"><b>' + e(x.n) + '</b><span class="' + cls(x.r) + '">' + pct(x.r) + '</span></a>'; };
    var h = '<div class="row"><div class="lv-ix">' + (L.index || []).map(function(i){ return '<span>' + e(i.name) + ' <b>' + V.fmt(i.last) + '</b> <b class="' + cls(i.chg) + '">' + pct(i.chg) + '</b></span>'; }).join("") + '</div>' +
      '<button class="btn" id="lvre">↻</button></div>' +
      '<div class="cp-bb tall" style="margin-top:10px"><i class="u" style="flex:' + L.up + '"></i><i class="f" style="flex:' + L.flat + '"></i><i class="d" style="flex:' + L.down + '"></i></div>' +
      '<div class="cp-n"><span class="up">▲ ' + L.up.toLocaleString() + '</span><span class="mut">상승 비율 ' + r.toFixed(0) + '%' + (yr != null ? ' (지난 마감 ' + yr.toFixed(0) + '%)' : '') + '</span><span class="dn">▼ ' + L.down.toLocaleString() + '</span></div>' +
      '<p class="note">종목 중간값 <b class="' + cls(L.median) + '">' + pct(L.median) + '</b>' + (L.limit_up != null ? ' · 상한가 ' + L.limit_up + ' · 하한가 ' + L.limit_dn : '') + '</p>' + liveLine(L.snaps, L.index && L.index[0] && L.index[0].name);
    if (L.sectors && L.sectors.length) h += '<div class="sub2">섹터 지금 <span class="mut">누르면 종목</span></div>' + V.dbars(L.sectors.map(function(x){ return {label: x.icon + " " + e(x.name) + ' <span class="hgo">›</span>', v: x.r, attr: ' data-csec="' + e(x.k) + '" data-cm="' + mk + '" style="cursor:pointer"', tip: "<b>" + e(x.name) + "</b> " + pct(x.r) + " · ▲" + x.up + " ▼" + x.down + "<br>" + x.big.map(function(b){ return e(b.n) + " " + pct(b.r); }).join(", ")}; }));
    if (L.strong && L.strong.length) h += '<div class="sub2">🔥 지금 강한 업종 <span class="mut">이름을 누르면 전체 종목</span></div>' + L.strong.slice(0, 5).map(function(x){ return '<div class="lv-r"><div class="row"><b data-ind="' + e(x.name) + '" data-cm="' + mk + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b><b class="' + cls(x.r) + '">' + pct(x.r) + '</b></div><div class="cp-sts">' + x.lead.map(chip_).join("") + '</div></div>'; }).join("");
    if (L.themes && L.themes.length) h += '<div class="sub2">🏷 지금 강한 테마 <span class="mut">+3% 넘은 종목 수</span></div>' + L.themes.slice(0, 6).map(function(x){ return '<div class="lv-r"><div class="row"><b data-theme="' + e(x.name) + '" data-lead="' + e((x.lead[0] || {}).n || "") + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span> <span class="mut">' + x.up3 + '/' + x.n + '</span></b><b class="' + cls(x.r) + '">' + pct(x.r) + '</b></div><div class="cp-sts">' + x.lead.map(chip_).join("") + '</div></div>'; }).join("");
    if (L.movers && L.movers.length && mk !== "KR") h += '<div class="sub2">🚀 지금 많이 오른 종목</div><div class="cp-sts">' + L.movers.map(chip_).join("") + '</div>';
    if (L.value && L.value.length) h += '<div class="sub2">💰 거래대금 상위</div><div class="cp-sts">' + L.value.slice(0, 10).map(function(x){ return '<a class="cp-st" href="javascript:openOP(\'' + e(x.s) + '\')"><b>' + e(x.n) + '</b><span class="' + cls(x.r) + '">' + pct(x.r) + '</span><span class="mut">' + x.v.toLocaleString() + '억' + cur + '</span></a>'; }).join("") + '</div>';
    return h + '<p class="note">' + (mk === "KR" ? '네이버 시세로 코스피·코스닥 ' + L.total.toLocaleString() + '종목 (우선주·스팩·ETF 제외)' : e(L.note || "")) + ' · 장 시간에 10분마다 새로 계산. 국면·신고가 등 나머지는 마감 기준이에요.</p>';
  }
  // 10/14 사용자 「미국장 개장 전엔 선물·아시아·다른 나라 거래·섹터·종목 가격으로 낮에도 미국 나침반을」 → archive/x/live_us_pre.json (uspre.yml)
  function preFresh(P){ return P && P.at && (Date.now() - P.at < 60 * 60e3); }
  function preBody(P){
    var chip_ = function(x){ return '<a class="cp-st" href="javascript:openOP(\'' + e(x.s) + '\')"><b>' + e(x.n) + '</b><span class="' + cls(x.r) + '">' + pct(x.r) + '</span></a>'; };
    var stLab = {live: '<i class="pdot on"></i>지금 거래 중', done: '오늘 마감', prev: '<span class="mut">지난 장</span>'};
    var h = '<p class="note lvoff">🌙 미국 정규장 전 · 뉴욕 ' + e(P.ny) + ' · ' + e(P.phase_lab) + '</p>';
    h += '<div class="pre-tone ' + cls(P.tone_chg) + '">' + e(P.tone) + ' <b>' + pct(P.tone_chg) + '</b> <span class="mut">S&P·나스닥 선물 평균</span></div>';
    if (P.fut && P.fut.length) h += '<div class="sub2">📈 미 지수 선물 <span class="mut">예상 개장 = 현물 종가 × 선물 등락</span></div><div class="x4">' + P.fut.map(function(f){
      return '<div><small>' + e(f.name) + '</small><b class="' + cls(f.chg) + '">' + pct(f.chg) + '</b><small class="mut">' + V.fmt(f.last) + (f.est ? ' · 예상 ' + V.fmt(f.est) : '') + '</small></div>'; }).join("") + '</div>';
    if (P.mirror && P.mirror.length) h += '<div class="sub2">🪞 미국 섹터의 해외 거울 <span class="mut">같은 업종 해외 대장주 오늘 등락</span></div>' +
      V.dbars(P.mirror.map(function(m){ var v = m.r != null ? m.r : m.r_all;
        return {label: m.icon + " " + e(m.name) + (m.r == null ? ' <span class="mut">(지난 장)</span>' : ''), v: v,
          tip: "<b>" + e(m.name) + "</b> (미국 " + e(m.etf) + ")<br>" + m.items.map(function(x){ return e(x.n) + " " + pct(x.r) + (x.today ? "" : " (지난 장)"); }).join("<br>")}; })) +
      '<div class="cp-sts">' + P.mirror.slice(0, 3).concat(P.mirror.slice(-2)).map(function(m){ return m.items.slice(0, 2).map(chip_).join(""); }).join("") + '</div>';
    var X = P.ext;
    if (X && X.n){
      var rr = X.up / Math.max(1, X.up + X.down) * 100;
      h += '<div class="sub2">🌗 미국 종목 시간외 가격 <span class="mut">' + (X.pre_n > X.n / 2 ? '프리마켓' : '애프터마켓') + ' · 마지막 ' + e(X.last) + ' (뉴욕) · 정규장 종가 대비</span></div>' +
        '<div class="cp-bb tall"><i class="u" style="flex:' + X.up + '"></i><i class="f" style="flex:' + X.flat + '"></i><i class="d" style="flex:' + X.down + '"></i></div>' +
        '<div class="cp-n"><span class="up">▲ ' + X.up + '</span><span class="mut">오른 비율 ' + rr.toFixed(0) + '% · 중간값 ' + pct(X.median) + ' · ' + X.n + '/' + X.cand + '종목 거래</span><span class="dn">▼ ' + X.down + '</span></div>';
      if (X.sectors && X.sectors.length) h += V.dbars(X.sectors.slice(0, 6).concat(X.sectors.length > 9 ? X.sectors.slice(-3) : []).map(function(x){
        return {label: x.icon + " " + e(x.name), v: x.r, tip: "<b>" + e(x.name) + "</b> " + pct(x.r) + " · ▲" + x.up + " ▼" + x.down + "<br>" + x.big.map(function(b){ return e(b.n) + " " + pct(b.r); }).join(", ")}; }));
      if (X.big && X.big.length) h += '<div class="sub2">👑 시가총액 큰 종목 지금</div><div class="cp-sts">' + X.big.slice(0, 12).map(chip_).join("") + '</div>';
      if (X.gain && X.gain.length) h += '<div class="sub2">🚀 시간외 많이 오른</div><div class="cp-sts">' + X.gain.map(chip_).join("") + '</div>';
      if (X.loss && X.loss.length) h += '<div class="sub2">🧊 시간외 많이 내린</div><div class="cp-sts">' + X.loss.map(chip_).join("") + '</div>';
    } else h += '<p class="note">미국 종목 시간외 거래가 아직 없어요 (애프터 뉴욕 20시 마감 → 프리마켓 뉴욕 4시 시작). 선물·해외 거울로 보세요.</p>';
    if (P.macro && P.macro.length) h += '<div class="sub2">💵 금리·달러·원자재 <span class="mut">밤낮 거래</span></div><div class="x4">' + P.macro.map(function(m){
      return '<div><small>' + e(m.name) + '</small><b class="' + cls(m.chg) + '">' + pct(m.chg) + '</b><small class="mut">' + V.fmt(m.last) + (m.hint ? ' · ' + e(m.hint) : '') + '</small></div>'; }).join("") + '</div>';
    if (P.world && P.world.length) h += '<div class="sub2">🌏 세계 증시 지금</div>' + P.world.map(function(w){
      return '<div class="xr"><b>' + w.flag + ' ' + e(w.name) + '</b><span class="mut" style="flex:1">' + (stLab[w.st] || "") + '</span><span>' + V.fmt(w.last) + '</span> <b class="' + cls(w.chg) + '">' + pct(w.chg) + '</b></div>'; }).join("");
    return h + '<p class="note">' + e(P.note || "") + ' · ' + e(P.t) + ' 기준 (10분마다)</p>';
  }
  // 10/12 사용자 「장중 나침반이 왜 한국만 돌아? 5개 시장으로」 — 5개 시장을 늘 보여주고, 열린 시장은 실시간 · 닫힌 시장은 마지막 장 + 다음 개장
  var LVH = {KR: [900, 1530], JP: [900, 1530], CN: [1030, 1600], HK: [1030, 1710], US: [930, 1600]};
  function lvClock(mk){
    var d = new Date();
    if (mk === "US"){
      try { var f = new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit"}).formatToParts(d);
        var g = function(t){ return (f.filter(function(x){ return x.type === t; })[0] || {}).value; };
        return {wd: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday")), hm: (+g("hour") % 24) * 100 + (+g("minute"))}; } catch(x) {}
    }
    var k = new Date(d.getTime() + 9 * 3600e3);
    return {wd: k.getUTCDay(), hm: k.getUTCHours() * 100 + k.getUTCMinutes()};
  }
  function lvState(mk, L){
    var c = lvClock(mk), h = LVH[mk], wk = c.wd >= 1 && c.wd <= 5, inHrs = wk && c.hm >= h[0] && c.hm <= h[1] + 15;
    var fresh = L && L.at ? (Date.now() - L.at < 40 * 60e3) : (L && L.date === P.today());
    var hh = function(v){ return Math.floor(v / 100) + ":" + ("0" + v % 100).slice(-2); };
    if (inHrs && fresh) return {k: "live", lab: "장중", sh: "장중", dot: "#4dd47a"};
    if (inHrs && !fresh) return c.hm < h[0] + 30 ? {k: "wait", lab: "개장 직후 · 곧 반영", sh: "곧 반영", dot: "#ffb84d"} : {k: "wait", lab: "오늘 휴장 또는 지연", sh: "휴장", dot: "#ffb84d"};
    if (wk && c.hm < h[0]) return {k: "pre", lab: "개장 전 · " + (mk === "US" ? "뉴욕 9:30" : hh(h[0])), sh: "개장 전", dot: "#8a94a8"};
    return {k: "closed", lab: "마감", sh: "마감", dot: "#8a94a8"};
  }
  window.CPLIVE = function(el, C){
    if (!el) return;
    var test = /[?&]livetest/.test(location.search);
    Promise.all(LVM.map(function(x){ return getJSON("archive/x/live_" + x[0].toLowerCase() + (test ? "_test" : "") + ".json?" + Date.now()).catch(function(){ return null; }); })
      .concat([getJSON("archive/x/live_us_pre.json?" + Date.now()).catch(function(){ return null; })])).then(function(R){
      var have = {}, stt = {}, PRE = R[LVM.length];
      LVM.forEach(function(x, i){ if (R[i]) have[x[0]] = R[i]; stt[x[0]] = lvState(x[0], R[i]); });
      var usPre = preFresh(PRE) && stt.US.k !== "live";
      if (usPre && !have.US) have.US = {up: 0, down: 0, flat: 0, index: [], t: PRE.t, date: PRE.date};
      var ks = LVM.filter(function(x){ return have[x[0]]; });
      if (!ks.length){ el.innerHTML = '<p class="note" style="margin:0 4px 12px">⚡ 장중 나침반 자료를 아직 못 받았어요.</p>'; return; }
      var liveK = ks.filter(function(x){ return stt[x[0]].k === "live"; });
      if (!LVSEL || !have[LVSEL]) LVSEL = (have[store.cpm] && stt[store.cpm].k === "live") ? store.cpm : (liveK[0] || (usPre ? ["US"] : ks[0]))[0];
      var md = function(d){ return d ? d.slice(5).replace("-", "/") : ""; };
      var draw = function(){
        var L = have[LVSEL], S = stt[LVSEL];
        // 5개 시장 한 줄 요약
        var strip = '<div class="lv5">' + LVM.map(function(x){
          var Lx = have[x[0]], Sx = stt[x[0]]; if (!Lx) return '<div class="lv5c off"><b>' + x[1] + ' ' + x[2] + '</b><small>자료 없음</small></div>';
          if (x[0] === "US" && usPre) return '<button class="lv5c' + (x[0] === LVSEL ? ' on' : '') + '" data-m="US"><b>' + x[1] + ' ' + x[2] + '</b>' +
            '<span class="lv5s"><i style="background:#9b7cff"></i>🌙 선물</span><span class="lv5b"><i style="width:' + (PRE.ext ? (PRE.ext.up / Math.max(1, PRE.ext.up + PRE.ext.down) * 100).toFixed(0) : 50) + '%"></i></span>' +
            '<small><b class="' + cls(PRE.tone_chg) + '">' + pct(PRE.tone_chg) + '</b></small></button>';
          var r = Lx.up / Math.max(1, Lx.up + Lx.down) * 100, ixc = Lx.index && Lx.index[0] ? Lx.index[0].chg : null;
          return '<button class="lv5c' + (x[0] === LVSEL ? ' on' : '') + '" data-m="' + x[0] + '"><b>' + x[1] + ' ' + x[2] + '</b>' +
            '<span class="lv5s"><i style="background:' + Sx.dot + '"></i>' + e(Sx.k === "live" ? Lx.t : Sx.sh) + '</span>' +
            '<span class="lv5b"><i style="width:' + r.toFixed(0) + '%"></i></span>' +
            '<small>' + (ixc != null ? '<b class="' + cls(ixc) + '">' + pct(ixc) + '</b>' : '') + '</small></button>';
        }).join("") + '</div>';
        var preMode = LVSEL === "US" && usPre;
        var head = preMode ? '🌙 개장 전 나침반 · ' + e(PRE.t) + ' 기준' : S.k === "live" ? e(L.t) + ' 기준 · 장중' : '마지막 장 ' + md(L.sess || L.date) + ' ' + e(L.t) + ' · ' + e(S.lab);
        el.innerHTML = '<section class="card lv"><h3>⚡ 장중 나침반 <span class="mut">5개 시장 · 10분마다' + (test ? " (시험)" : "") + '</span></h3>' + strip +
          '<div class="lvhd"><b>' + LVM.filter(function(x){ return x[0] === LVSEL; })[0].slice(1, 3).join(" ") + '</b> <span class="mut">' + head + '</span></div>' +
          (preMode ? preBody(PRE) + (L.total ? '<details class="pre-old"><summary>지난 미국 장 마감 모습 (' + md(L.sess || L.date) + ')</summary>' + liveBody(L, LVSEL, C, test) + '</details>' : '') :
           (S.k === "live" ? '' : '<p class="note lvoff">지금은 장중이 아니라 마지막 장 마감 무렵 모습이에요.</p>') + liveBody(L, LVSEL, C, test)) + '</section>';
        [].forEach.call(el.querySelectorAll(".lv5c[data-m]"), function(b){ b.onclick = function(){ LVSEL = b.dataset.m; draw(); }; });
        var b = $("lvre"); if (b) b.onclick = function(){ el.innerHTML = '<div class="loading">새로 불러오는 중…</div>'; CPLIVE(el, C); };
      };
      draw();
    }).catch(function(){ el.innerHTML = ""; });
  };
  (function(){ var st_ = document.createElement("style"); st_.textContent =
    ".lv5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:2px 0 10px}" +
    ".lv5c{display:flex;flex-direction:column;gap:3px;align-items:flex-start;text-align:left;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:10px;padding:6px 5px;font:inherit;cursor:pointer;min-width:0}" +
    ".lv5c b{font-size:12.5px}.lv5c.on{outline:2px solid var(--acc,#7c9cff)}.lv5c.off{opacity:.5}.lv5c b{font-size:12.5px;white-space:nowrap}.lv5c small{font-size:12.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}" +
    ".lv5s{font-size:12.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.lv5s i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:3px;vertical-align:0}" +
    ".lv5b{display:block;width:100%;height:5px;border-radius:3px;background:rgba(124,156,255,.35);overflow:hidden}.lv5b i{display:block;height:100%;background:#e66767}" +
    ".lvhd{margin:2px 0 4px;font-size:14px}.lvoff{margin:2px 0 6px}" +
    ".pre-tone{font-size:16px;font-weight:700;margin:4px 2px 8px}.pre-tone .mut{font-size:12.5px;font-weight:400}" +
    ".pdot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#4dd47a;margin-right:4px}" +
    ".pre-old{margin-top:12px;border-top:1px solid var(--line);padding-top:8px}.pre-old summary{cursor:pointer;color:var(--sub);font-size:13px}";
    document.head.appendChild(st_); })();

  /* 섹터·테마를 누르면 보조 화면(아래에서 올라오는 시트)으로 관련 종목 → 누르면 종목리포트 */
  var HETF = {"반도체": "091160", "자동차": "091180", "은행": "091170", "증권": "102970", "건설": "117700", "철강": "117680",
              "에너지화학": "117460", "헬스케어": "266420", "2차전지": "305720", "방산": "449450"};
  function sheet(title){
    navPush({t: "go", key: cur, id: curDate});
    closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b>' + title + '</b></div><div class="sh-body"><div class="loading">불러오는 중…</div></div>';
    document.body.appendChild(sh); document.body.classList.add("sheet-open"); updBack();
    return sh.querySelector(".sh-body");
  }
  function row(code, name, w, crown, extra){
    return '<a class="ss-r" href="javascript:openOP(\'' + e(code) + '\')" data-hpx="' + e(code) + '">' + (crown ? '<span class="ss-c">👑</span>' : '<span class="ss-c"></span>') +
      '<div class="ss-n"><b>' + e(name) + '</b><em class="tk">' + e(V.cd(code)) + '</em>' + (extra ? '<small>' + extra + '</small>' : '') + '</div>' +
      (w != null ? '<span class="ss-w">' + w + '</span>' : '') + '<span class="ss-p mut">…</span><span class="ss-go">›</span></a>';
  }
  function fillPx(root){
    [].forEach.call(root.querySelectorAll("[data-hpx]:not([data-done])"), function(a){ a.setAttribute("data-done", 1);
      V.price(a.getAttribute("data-hpx")).then(function(p){ var sp = a.querySelector(".ss-p"); if (!sp) return; if (!p){ sp.textContent = ""; return; }
        var c = (p[1] / p[2] - 1) * 100; sp.className = "ss-p " + cls(c); sp.innerHTML = '<b>' + fmt(p[1]) + '</b><small>' + pct(c) + '</small>'; }); });
  }
  function kv(items){ return '<div class="x4">' + items.map(function(x){ return '<div><small>' + x[0] + '</small><b class="' + (x[2] || "") + '">' + x[1] + '</b></div>'; }).join("") + '</div>'; }
  // ① 나침반 섹터 (시장 + 섹터 키)
  function openSector(mk, k){
    var m = CMP && CMP.markets[mk], sx = m && (m.sectors || []).filter(function(x){ return x.k === k; })[0];
    if (!sx) return;
    var body = sheet(sx.icon + " " + e(sx.name) + " · " + m.flag + " " + e(m.name));
    var sn = m.sens && (m.sens.items || []).filter(function(x){ return x.k === k; })[0];
    var h = kv([["오늘", pct(sx.r1), cls(sx.r1)], ["1주", pct(sx.r5), cls(sx.r5)], ["1개월", pct(sx.r20), cls(sx.r20)], ["상승 / 하락", '<span class="up">' + sx.up + '</span> / <span class="dn">' + sx.down + '</span>']]) +
      '<p class="note" style="margin:4px 2px 12px">' + sx.n + '종목 · 시가총액 가중' + (sn ? ' · ' + e(m.sens.fx_name) + '과 상관 ' + sgn(sn.fx, 2) + ', 미 금리와 상관 ' + sgn(sn.rate, 2) : '') + '</p>';
    var top = sx.top && sx.top.length ? sx.top : sx.big || [];
    h += '<section class="card"><h3>👑 대장주 <span class="mut">시가총액 큰 순</span></h3><div class="ss">' + top.map(function(x, i){ return row(x.s, x.n, null, i === 0, "오늘 " + pct(x.r1) + (x.r5 != null ? " · 1주 " + pct(x.r5) : "")); }).join("") + '</div></section>';
    if (sx.hot && sx.hot.length) h += '<section class="card"><h3>🔥 오늘 많이 오른 종목 <span class="mut">큰 회사 중</span></h3><div class="ss">' + sx.hot.map(function(x){ return row(x.s, x.n, null, false, "오늘 " + pct(x.r1) + " · 1주 " + pct(x.r5)); }).join("") + '</div></section>';
    if (mk === "US" && CMP.markets.KR){ var kk = (CMP.markets.KR.sectors || []).filter(function(x){ return x.k === k; })[0];
      if (kk) h += '<section class="card"><h3>🇰🇷 한국 같은 섹터 <span class="mut">오늘 ' + pct(kk.r1) + ' · 1주 ' + pct(kk.r5) + '</span></h3><div class="ss">' + (kk.top || kk.big || []).slice(0, 5).map(function(x, i){ return row(x.s, x.n, null, i === 0, "오늘 " + pct(x.r1)); }).join("") + '</div></section>'; }
    h += '<p class="note" style="padding:0 4px 90px">' + (m.live && m.live.cards ? '「오늘」은 ' + e(m.live.t || "") + ' 장중 값(– = 아직 모름, 오른쪽 숫자가 지금 시세) · 1주·1개월은 ' + e(m.date) + ' 마감까지.' : e(m.date) + ' 마감 기준.') + ' 종목을 누르면 종목리포트로 가요.' + (sx.top ? '' : ' (대장주 10개 목록은 다음 나침반 계산부터 나와요.)') + '</p>';
    body.innerHTML = h; fillPx(body);
  }
  // ② 섹터 히트맵 (한국 섹터 ETF 구성 종목)
  function openHeat(nm){
    var code = HETF[nm], body = sheet("🗺️ " + e(nm) + " 섹터 종목");
    if (!code){ body.innerHTML = '<div class="empty">이 섹터는 구성 종목 자료가 없어요.</div>'; return; }
    getJSON(OPD + "x/" + code + ".KS.json").then(function(j){
      var H = (j.holdings || []).filter(function(x){ return /^\d{6}$/.test(x.code || ""); }).slice(0, 20);
      if (!H.length) throw 0;
      body.innerHTML = '<section class="card"><h3>' + e(j.name) + ' 구성 종목 <span class="mut">비중 순 · 👑 비중 1위</span></h3><div class="ss">' +
        H.map(function(x, i){ return row(x.code, x.name, x.w.toFixed(1) + "%", i === 0); }).join("") + '</div></section>' +
        '<a class="btn" href="javascript:openOP(\'' + code + '\')">' + e(j.name) + ' ETF 리포트 →</a><p class="note" style="padding:0 4px 90px">이 섹터를 대표하는 ETF의 보유 종목이에요. 오른쪽 숫자 = 최근 종가·하루 등락.</p>';
      fillPx(body);
    }).catch(function(){ body.innerHTML = '<div class="empty">구성 종목을 못 불러왔어요.</div>'; });
  }
  // ③ 장중 섹터 발동 테마 (단타 프로그램 테마 목록)
  var THC = null;
  function themes(){ return THC || (THC = getText(RAW + "stock-screener/main/data/themes.csv").then(parseCSV).catch(function(){ return []; })); }
  function openTheme(nm, lead){
    var body = sheet("🔥 " + e(nm));
    themes().then(function(T){
      var L = T.filter(function(r){ return r.group === nm && /^\d{6}$/.test(r.code || ""); });
      var seen = {}; L = L.filter(function(r){ if (seen[r.code]) return false; seen[r.code] = 1; return true; });
      if (!L.length){ body.innerHTML = '<div class="empty">이 테마의 종목 목록이 없어요.</div>'; return; }
      L.sort(function(a, b){ return (b.name === lead) - (a.name === lead); });
      body.innerHTML = '<section class="card"><h3>' + e(nm) + ' 테마 종목 <span class="mut">' + L.length + '개 · 👑 오늘 대장</span></h3><div class="ss">' +
        L.map(function(r){ return row(r.code, r.name, null, r.name === lead); }).join("") + '</div></section><p class="note" style="padding:0 4px 90px">단타 프로그램이 쓰는 테마 목록이에요. 숫자 = 최근 종가·하루 등락 (장중엔 앞 종가 기준).</p>';
      fillPx(body);
      // 오늘 등락 순으로 다시 정렬
      setTimeout(function(){ var box = body.querySelector(".ss"); if (!box) return; var a = [].slice.call(box.children);
        a.sort(function(x, y){ var gx = parseFloat((x.querySelector(".ss-p small") || {}).textContent) || -99, gy = parseFloat((y.querySelector(".ss-p small") || {}).textContent) || -99;
          return (y.querySelector(".ss-c").textContent ? 1 : 0) - (x.querySelector(".ss-c").textContent ? 1 : 0) || gy - gx; });
        a.forEach(function(x){ box.appendChild(x); }); }, 2500);
    });
  }
  // ④ 업종 (신고가 업종·강한 업종·약한 업종) — 그 시장의 같은 업종 종목 전체
  var SECJ = null;
  function secAll(){ return SECJ || (SECJ = getJSON(OPD + "sec.json").catch(function(){ return {}; })); }
  function mktOf(sym){ return /\.K[SQ]$/.test(sym) ? "KR" : /\.T$/.test(sym) ? "JP" : /\.HK$/.test(sym) ? "HK" : /\.(SS|SZ)$/.test(sym) ? "CN" : /^[A-Z][A-Z.\-]*$/.test(sym) ? "US" : ""; }
  function openIndustry(mk, ind, mode){
    var m = CMP && CMP.markets[mk];
    var body = sheet((mode === "high" ? "🏔️ " : "🏭 ") + e(ind) + (m ? " · " + m.flag + " " + e(m.name) : ""));
    var info = m && (m.strong || []).concat(m.weak || []).filter(function(x){ return x.name === ind; })[0];
    var hiSet = {}; ((m && m.high_list) || []).forEach(function(x){ hiSet[x.s] = 1; });
    ((m && m.high_by_ind && m.high_by_ind[ind]) || []).forEach(function(x){ hiSet[x.s] = 1; });
    secAll().then(function(S){
      var L = Object.keys(S).filter(function(k){ var v = S[k]; return v && v[1] === ind && mktOf(k) === mk; })
        .map(function(k){ return {s: k, cap: S[k][2] || 0}; }).sort(function(a, b){ return b.cap - a.cap; }).slice(0, 40);
      if (!L.length){ body.innerHTML = '<div class="empty">이 업종의 종목 목록을 못 찾았어요.</div>'; return; }
      var names = {}; (window.OPIDX || []).forEach(function(r){ names[r.sym] = r.name; });
      var ready = window.OPIDX ? Promise.resolve() : (window.opLoadIdx ? opLoadIdx().then(function(){ (OPIDX || []).forEach(function(r){ names[r.sym] = r.name; }); }) : Promise.resolve());
      ready.then(function(){
        if (mk === "KR") L = L.filter(function(x){ return !/우[A-C]?$|우\(.*\)$/.test(names[x.s] || ""); });
        var h = (info ? kv([["오늘", pct(info.r1), cls(info.r1)], ["1주", pct(info.r5), cls(info.r5)], ["종목", info.n + "개"], ["상승 / 하락", '<span class="up">' + info.up + '</span> / <span class="dn">' + info.down + '</span>']]) : '') +
          '<section class="card"><h3>' + (mode === "high" ? "52주 신고가 종목 먼저 · 🏔️ = 1년 최고가 근처" : "시가총액 큰 순 · 👑 1위") + ' <span class="mut">' + L.length + '종목</span></h3><div class="ss" id="indss">' +
          L.map(function(x, i){ return row(x.s, names[x.s] || V.cd(x.s), null, i === 0 && mode !== "high", hiSet[x.s] ? "🏔️ 52주 신고가" : ""); }).join("") + '</div></section>' +
          '<p class="note" style="padding:0 4px 90px">' + (m ? e(m.date) + " 마감 기준. " : "") + '종목을 누르면 종목리포트로 가요.</p>';
        body.innerHTML = h; fillPx(body);
        // 가격이 들어오면 1년 최고가 근처 표시 + (신고가 모드면) 위로
        setTimeout(function(){ var box = $("indss"); if (!box) return;
          var a = [].slice.call(box.children);
          a.forEach(function(r){ V.price(r.getAttribute("data-hpx")).then(function(p){ if (p && p[3] && p[1] >= p[3] * 0.99){ r.setAttribute("data-hi", 1); var sm = r.querySelector(".ss-n small"); if (sm){ if (!sm.textContent) sm.textContent = "🏔️ 1년 최고가 근처"; } else r.querySelector(".ss-n").insertAdjacentHTML("beforeend", "<small>🏔️ 1년 최고가 근처</small>"); } }); });
          if (mode === "high") setTimeout(function(){ a.sort(function(x, y){ return (y.hasAttribute("data-hi") ? 1 : 0) - (x.hasAttribute("data-hi") ? 1 : 0); }); a.forEach(function(x){ box.appendChild(x); }); }, 2000);
        }, 300);
      });
    });
  }
  function curMk(){ return store.cpm && CMP && CMP.markets[store.cpm] ? store.cpm : CMP && CMP.markets.KR ? "KR" : CMP ? Object.keys(CMP.markets)[0] : null; }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-hsec],[data-csec],[data-theme],[data-lsec],[data-ind]");
    if (!t || (ev.target.closest("a[href^='javascript:openOP']") && !t.matches("a"))) return;
    ev.preventDefault();
    if (t.hasAttribute("data-hsec")) openHeat(t.getAttribute("data-hsec"));
    else if (t.hasAttribute("data-csec")) openSector(t.getAttribute("data-cm") || curMk(), t.getAttribute("data-csec"));
    else if (t.hasAttribute("data-lsec")) openSector("KR", t.getAttribute("data-lsec"));
    else if (t.hasAttribute("data-ind")) openIndustry(t.getAttribute("data-cm") || curMk(), t.getAttribute("data-ind"), t.getAttribute("data-im"));
    else openTheme(t.getAttribute("data-theme"), t.getAttribute("data-lead"));
  });
  // 장중 섹터 발동: 테마 → 시트, 대장 → 종목리포트
  window.themeLog = function(el, day){
    if (!el) return;
    getText(RAW + "stock-screener/main/data/theme_log.csv?" + Date.now()).then(function(t){
      var rows = parseCSV(t).filter(function(r){ return (r.date || "").replace(/-/g, "") === day.replace(/-/g, ""); });
      if (!rows.length) return;
      el.innerHTML = '<div class="card"><h3>🔥 장중 섹터 발동 (' + day.slice(5).replace("-", "/") + ') <span class="mut">테마를 누르면 종목</span></h3>' + rows.map(function(r){
        var lp = +r.lead_pct;
        return '<div class="tlr"><button class="tl-t" data-theme="' + e(r.name) + '" data-lead="' + e(r.lead) + '"><b>' + e(r.name) + '</b> <span class="hgo">›</span></button>' +
          '<a class="tl-l" href="javascript:openOP(\'' + e(r.lead).replace(/'/g, "") + '\')">👑 ' + e(r.lead) + '</a>' +
          '<span class="tl-v"><b class="' + (lp > 0 ? "up" : "dn") + '">' + (lp > 0 ? "+" : "") + (isNaN(lp) ? "" : lp.toFixed(1) + "%") + '</b><small>' + e(r.t || "") + '</small></span></div>'; }).join("") + '</div>';
    }).catch(function(){});
  };
  var MKX = "KR";
  // 시장별 섹터 히트맵 (1주~12개월) — 누르면 그 섹터 종목
  function heat(m, k){
    var ss = (m.sectors || []).filter(function(x){ return x.heat && Object.keys(x.heat).length; });
    if (ss.length < 3) return "";
    var cols = ["1W", "1M", "3M", "6M", "12M"].filter(function(c){ return ss.some(function(x){ return x.heat[c] != null; }); });
    var lab = {"1W": "1주", "1M": "1개월", "3M": "3개월", "6M": "6개월", "12M": "12개월"};
    var mx = {}; cols.forEach(function(c){ mx[c] = Math.max.apply(null, ss.map(function(x){ return Math.abs(x.heat[c] || 0); }).concat([1])); });
    ss = ss.slice().sort(function(a, b){ return (b.heat["1M"] || 0) - (a.heat["1M"] || 0); });
    return card("🗺️ " + e(m.name) + " 섹터 히트맵 <span class='mut'>기간별 수익률 · 섹터를 누르면 종목</span>", '<div class="hm"><table><thead><tr><th></th>' + cols.map(function(c){ return '<th>' + lab[c] + '</th>'; }).join("") + '</tr></thead><tbody>' +
      ss.map(function(x){ return '<tr class="hrow" data-csec="' + e(x.k) + '" data-cm="' + k + '"><th>' + x.icon + " " + e(x.name) + ' <span class="hgo">›</span></th>' + cols.map(function(c){ var v = x.heat[c];
        return '<td style="background:' + V.heat(v, mx[c]) + '">' + (v == null ? "" : sgn(v, Math.abs(v) >= 100 ? 0 : 1)) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>' +
      '<p class="note">시가총액 가중 · 1개월 순. 빨강 = 오름, 파랑 = 내림.</p>');
  }
  window.CPX = function(m, k, C){
    CMP = C; MKX = k;
    return heat(m, k) + regHist(m) + rotSlider(m, k) + hlTrend(m) + sens(m) + (k === "US" ? link(C, "KR") : link(C, k));
  };

  /* ======================= 🤫 조용한 매집 ======================= */
  P.wrap("accum", function(it, a){
    Promise.all([X("accum_x.json"), getJSON(file("accum", it.id, "list.json")).catch(function(){ return []; }), X("perf_accum.json")]).then(function(r){
      var A = r[0], rows = r[1], Pf = r[2], by = {}, h = '<div class="acc-ref">📎 <b>참고용</b> — 거래량만 크게 늘고 가격은 제자리인 종목이에요. 2012년부터 다시 돌려 보니 <b>지수도, 아무 종목도 못 이겼어요</b>(40일 초과수익 −1.9%·−2.2%). 박스 돌파 확인도 더 나빴어요. 매수 신호가 아니고, 킥 포트 후보에서도 뺐어요.</div>';
      rows.forEach(function(x){ by[x.code] = x; });
      var items = ((A && A.items) || []).filter(function(x){ return by[x.code]; });
      // ① 매집 강도 순위
      var pw = items.filter(function(x){ return x.power != null; }).sort(function(p, q){ return q.power - p.power; });
      if (false && pw.length) h += card("🏋️ 매집 강도 순위 <span class='mut'>점수 + 변동성 축소 + 거래량 + 수급</span>", V.hbars(pw.slice(0, 12).map(function(x){ var r0 = by[x.code];
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
  ALARMS.push({t: "brief", ic: "☀️", nm: "오늘 한 장 (아침 8시)", d: "하루 한 번: 국면 한 줄 · 고객에게 할 말 3줄 · 오늘 만기·이벤트"});
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
;
/* ======== plus4.js ======== */
/* CH Investing — 3차 업그레이드 ①: 시황 · 고래 · 컵 · 갭 ("우아" 아이디어) */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt;
  var P = PL, X = P.X, card = P.card, chip = P.chip, pct = P.pct, opA = P.opA, kn = P.kn, md = P.md;
  function sheet(title){
    navPush({t: "go", key: cur, id: curDate}); closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b>' + title + '</b></div><div class="sh-body"><div class="loading">불러오는 중…</div></div>';
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
;
/* ======== plus5.js ======== */
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
      // 11/10 사용자 「이거 고쳐」: SVG 글자 안 국기가 아이폰에서 □J□P 로 깨지고, 시장 이름·시각이 서로 겹침 → HTML 5칸 격자로
      var s = '<div class="wf2">' + ks.map(function(o, i){ var m = C.markets[o[0]], r = m.up / Math.max(1, m.up + m.down) * 100, ix = m.index[0] || {}, R = Math.round(34 + Math.abs(r - 50) / 2);
        var col = r >= 55 ? V.UP : r <= 45 ? V.DN : "#6b7385";
        return '<div class="wf2-c" data-tip="' + e("<b>" + m.flag + " " + m.name + "</b> " + m.date + " 마감<br>오른 종목 " + r.toFixed(0) + "% · " + (ix.name || "") + " " + pct(ix.chg1) + "<br>" + m.regime) + '">' +
          '<div class="wf2-f">' + m.flag + '</div>' +
          '<div class="wf2-o"><span style="width:' + R + 'px;height:' + R + 'px;background:' + col + ';animation-delay:' + (i * .35) + 's">' + r.toFixed(0) + '</span></div>' +
          '<div class="wf2-n">' + e(m.name) + '</div><div class="wf2-t">' + o[1].replace("다음 날 ", "") + '</div>' +
          '<div class="wf2-p ' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</div></div>'; }).join("") + '</div>';
      var best = ks.slice().sort(function(a, b){ var ma = C.markets[a[0]], mb = C.markets[b[0]]; return mb.up / Math.max(1, mb.up + mb.down) - ma.up / Math.max(1, ma.up + ma.down); })[0];
      h += card("🌍 세계 시장 하루 흐름", '<p class="wf2-sub">해가 뜨는 순서 · 원 안 숫자 = 오른 종목 %</p>' + s +
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
  // 🧭 10/15 사용자: "오른 종목과 내린 종목이 같다라….. 장난하냐?" — 코스피 −7.9% 날 어제 종목 수로 「반반」. 오늘 장중(live) 숫자로 쓰기
  function sentLive(m){
    var L = m.live, r = m.up / Math.max(1, m.up + m.down) * 100, ix = m.index[0] || {}, ss = L.ss || [], st = L.st;
    var lead = ss[0], lag = ss[ss.length - 1], ic = ix.date === L.date ? ix.chg1 : null, md = m.median1;
    var gap = ic != null && md != null ? ic - md : null;
    var bigsmall = gap == null ? "" : gap > 0.7 ? (ic < 0 ? "대형주보다 중소형이 더 크게 빠지는" : "대형주가 끌고 중소형은 따라오지 못하는") :
      gap < -0.7 ? (ic < 0 ? "지수(대형주)가 보통 종목보다 더 크게 빠지는" : "지수보다 중소형이 더 힘을 내는") : "큰 회사와 작은 회사가 같이 움직이는";
    var mood = r >= 65 ? "거의 모든 종목이 오르는" : r >= 55 ? "오른 종목이 더 많은" : r > 45 ? "오르고 내린 종목이 반반인" : r > 35 ? "내린 종목이 더 많은" : "거의 모든 종목이 내리는";
    return "지금(" + e(L.t || "") + ") " + m.name + "은 " + (ic != null ? e(ix.name) + " <b class='" + cls(ic) + "'>" + pct(ic) + "</b>, " : "") +
      "오른 " + (+m.up).toLocaleString() + " · 내린 " + (+m.down).toLocaleString() + "종목 — " + mood + " 장" + (bigsmall ? ", " + bigsmall + " 모습" : "") + "이에요." +
      (md != null ? " 보통 종목(중간값)은 <b class='" + cls(md) + "'>" + pct(md) + "</b>." : "") +
      (lead && lead[1] > 0 ? " 버티는 쪽은 <b>" + e(lead[0]) + "</b>(" + pct(lead[1]) + ")," : "") + (lag && lag[1] < 0 ? " 가장 약한 쪽은 <b>" + e(lag[0]) + "</b>(" + pct(lag[1]) + ")." : "") +
      (st && st.r > 0 ? " 세부 업종으로는 <b>" + e(st.name) + "</b>(" + pct(st.r) + ")이 가장 셌고" + (st.lead ? ", 대장은 " + e(st.lead) + "." : ".") : "");
  }
  function sentence(m){
    if (m.live) return sentLive(m);
    var r = m.up / Math.max(1, m.up + m.down) * 100, ix = m.index[0] || {}, ss = (m.sectors || []).slice().sort(function(a, b){ return (b.r1 || 0) - (a.r1 || 0); });
    var lead = ss[0], lag = ss[ss.length - 1], st = (m.strong || [])[0];
    // 10/15: 종목은 어제(m.date)인데 지수는 오늘 장중이면 → 같은 날 지수 등락으로 비교, 「오늘」 대신 날짜
    var ic = ix.chg1, day = "오늘";
    if (ix.date && m.date && ix.date > m.date){
      day = m.date.slice(5).replace("-", "/"); ic = null;
      var o = ix.ohlc || [], j = o.map(function(r){ return r[0]; }).indexOf(m.date);
      if (j > 0) ic = (o[j][4] / o[j - 1][4] - 1) * 100;
    }
    var bigsmall = ic != null && m.median1 != null ? (ic - m.median1 > 0.7 ? "대형주가 끌고 중소형은 따라오지 못한" : m.median1 - ic > 0.7 ? "지수보다 중소형이 더 힘을 낸" : "큰 회사와 작은 회사가 비슷하게 움직인") : "";
    var mood = r >= 65 ? "거의 모든 종목이 오른" : r >= 55 ? "오른 종목이 더 많은" : r > 45 ? "오르고 내린 종목이 반반인" : r > 35 ? "내린 종목이 더 많은" : "거의 모든 종목이 내린";
    return day + " " + m.name + "은 " + (lead && (lead.r1 || 0) > 0 ? "<b>" + e(lead.name) + "</b>(" + pct(lead.r1) + ")이 끌고 " : "") + (lag && (lag.r1 || 0) < 0 ? "<b>" + e(lag.name) + "</b>(" + pct(lag.r1) + ")이 밀린, " : "") + mood + " 날" +
      (bigsmall ? " — " + bigsmall + " 장" : "") + "이었어요." + (st ? " 업종으로는 <b>" + e(st.name) + "</b>(" + pct(st.r1) + ")이 가장 셌고" + (st.lead && st.lead[0] ? ", 대장은 " + e(st.lead[0].n) + "." : ".") : "") +
      (m.highs != null ? " 52주 신고가 " + m.highs + "개 / 신저가 " + m.lows + "개." : "");
  }
  function forecast(m){
    var ix = (m.index || [])[0]; if (!ix || !ix.ma20 || ix.ma20.length < 12 || !ix.ma60) return "";
    var a = ix.ma20, n = a.length, m20 = a[n - 1], sl = (a[n - 1] - a[n - 11]) / 10, m60 = ix.ma60, px = ix.last;
    var gap = (m20 / m60 - 1) * 100, pg = (px / m20 - 1) * 100, txt, days = null, to = null;
    if (ix.crash){ txt = "📉 급락으로 하락장 — " + e(ix.why.replace(/^급락 — /, "")) + ". 선(20·60일)이 따라오기 전에 먼저 하락장으로 봐요. 지수가 20일선 위로 돌아오면 다시 선으로 판정"; }
    else if (m.regime !== "상승장" && m20 < m60 && sl > 0){ days = Math.ceil((m60 - m20) / sl); to = "상승장"; txt = "20일선이 60일선 아래에서 하루 " + (sl / m20 * 100).toFixed(2) + "%씩 올라오는 중"; }
    else if (m.regime !== "하락장" && m20 > m60 && sl < 0){ days = Math.ceil((m20 - m60) / -sl); to = "하락장"; txt = "20일선이 60일선 위에서 하루 " + (sl / m20 * 100).toFixed(2) + "%씩 내려오는 중"; }
    else txt = m.regime === "상승장" ? "20일선이 60일선 위에서 계속 오르는 중 — 당장 바뀔 신호 없음" : m.regime === "하락장" ? "20일선이 60일선 아래에서 계속 내리는 중 — 당장 바뀔 신호 없음" : "20일선 기울기가 평평 — 방향을 기다리는 중";
    var bar = function(v){ return '<span class="xbar" style="flex:1"><i style="width:' + clamp(50 + v * 8).toFixed(0) + '%;background:' + (v >= 0 ? V.UP : V.DN) + '"></i></span>'; };
    return card("⏳ 국면 전환 예보 <span class='mut'>" + e(ix.name) + " · 지금 " + e(m.regime) + "</span>",
      (ix.crash ? '<div class="fc"><b class="dn">▼ 급락 — 지금 하락장</b><small>지수가 20일선(' + V.fmt(m20) + ') 위로 돌아오면 풀려요</small></div>' : days != null && days <= 60 ? '<div class="fc"><b class="' + (to === "상승장" ? "up" : "dn") + '">' + (to === "상승장" ? "▲" : "▼") + ' 약 ' + days + '거래일 뒤 ' + to + ' 조건</b><small>이 속도가 그대로 이어지면</small></div>' : '<div class="fc"><b>◆ 60거래일 안엔 바뀔 신호 없음</b></div>') +
      '<div class="xr"><span>지수 vs 20일선</span>' + bar(pg) + '<b class="' + cls(pg) + '">' + sgn(pg) + '%</b></div><div class="xr"><span>20일선 vs 60일선</span>' + bar(gap) + '<b class="' + cls(gap) + '">' + sgn(gap) + '%</b></div>' +
      '<p class="note">' + txt + '. 상승장 = 지수가 20일선·60일선 위 + 20일선이 60일선 위 + 20일선이 오름. 급락(20일선 아래 + 20일 −8% 이하 또는 20일 고점 대비 −10% 이하)은 바로 하락장. 예보는 지금 속도를 그대로 이은 것이라 하루 큰 움직임에 바로 바뀌어요.</p>');
  }
  /* 🗓 11/17 섹터 기간 탭(1·3·6개월)을 같이 씀 — window.SECP (compass.js) */
  function clockSvg(m){
    var SP = window.SECP, p = SP ? SP.cur() : "1M", L = SP ? SP.lab(p) : {xl: "1개월", yl: "1주"};
    var ss = (m.sectors || []).map(function(x){ var q = SP ? SP.xy(x, p, m) : {x: x.r20, y: x.r5}, pa = SP ? SP.path(x, p, m) : x.path;
      return {k: x.k, icon: x.icon, name: x.name, p: x.p, n: x.n, r1: x.r1, r5: q.y, r20: q.x, path: pa, _s: x}; }).filter(function(x){ return x.r5 != null && x.r20 != null; });
    if (ss.length < 4) return '<div class="empty">' + L.xl + ' 자료가 아직 모자라요.</div>';
    var med = function(k){ var v = ss.map(function(x){ return x[k]; }).sort(function(a, b){ return a - b; }); return v[Math.floor(v.length / 2)]; };
    var m5 = med("r5"), m20 = med("r20"), W = 300, cx = 150, cy = 150, R = 118;
    var ang = function(x, y){ return Math.atan2(x, y); };            // 12시에서 시계 방향
    var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + W + '">';
    var q = [["🔥 계속 강함", 0, "#e66767"], ["🍂 힘 빠지는 중", 90, "#d98a1a"], ["🧊 계속 약함", 180, "#3987e5"], ["🌱 새로 뜨는 중", 270, "#3fb27f"]];
    q.forEach(function(z){ var a0 = (z[1] - 90) * Math.PI / 180, a1 = (z[1] + 0) * Math.PI / 180;
      s += '<path d="M' + cx + ',' + cy + ' L' + (cx + R * Math.cos(a0)).toFixed(1) + ',' + (cy + R * Math.sin(a0)).toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + (cx + R * Math.cos(a1)).toFixed(1) + ',' + (cy + R * Math.sin(a1)).toFixed(1) + ' Z" fill="' + z[2] + '" opacity=".1"/>';
      var am = (z[1] + 45 - 90) * Math.PI / 180; s += '<text x="' + (cx + (R + 14) * Math.cos(am)).toFixed(1) + '" y="' + (cy + (R + 14) * Math.sin(am) + 3).toFixed(1) + '" text-anchor="middle" class="lc-a rotq">' + z[0] + '</text>'; });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#3a4358"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#e8ecf4"/>';
    s += '<path d="M' + (cx + 40) + ',' + (cy - R - 4) + ' A' + (R + 4) + ',' + (R + 4) + ' 0 0 1 ' + (cx + R * .8).toFixed(1) + ',' + (cy - R * .62).toFixed(1) + '" stroke="#8a94a8" fill="none" marker-end="url(#ah)"/><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L6,3L0,6Z" fill="#8a94a8"/></marker></defs>';
    var mxv = Math.max.apply(null, ss.map(function(x){ return Math.hypot(x.r20 - m20, (x.r5 - m5) * 2); }).concat([1])), TOP = V.topSet(ss, 10);
    ss.forEach(function(x, i){ var dx = x.r20 - m20, dy = (x.r5 - m5) * 2, a = ang(dx, dy), rr = 30 + Math.min(1, Math.hypot(dx, dy) / mxv) * (R - 40);
      var px = cx + rr * Math.sin(a), py = cy - rr * Math.cos(a), col = V.secCol(x.k, i), tail = "";
      if (x.path && x.path.length > 4){ var p0 = x.path[x.path.length - 5], d0x = p0[2] - m20, d0y = (p0[1] - m5) * 2, a0 = ang(d0x, d0y), r0 = 30 + Math.min(1, Math.hypot(d0x, d0y) / mxv) * (R - 40);
        tail = '<line x1="' + (cx + r0 * Math.sin(a0)).toFixed(1) + '" y1="' + (cy - r0 * Math.cos(a0)).toFixed(1) + '" x2="' + px.toFixed(1) + '" y2="' + py.toFixed(1) + '" stroke="' + col + '" stroke-opacity=".5" stroke-width="2" marker-end="url(#ah)"/>'; }
      var hour = ((a * 180 / Math.PI + 360) % 360) / 30;
      s += '<g data-csec="' + e(x.k) + '" data-fam="' + V.famOf(x._s) + '"' + (TOP[x.k] ? ' data-top="1"' : '') + ' style="cursor:pointer" data-tip="' + e("<b>" + x.icon + " " + x.name + "</b> " + (Math.floor(hour) || 12) + "시 방향<br>" + L.yl + " " + pct(x.r5) + " · " + L.xl + " " + pct(x.r20)) + '">' + tail + '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="6" fill="' + col + '" stroke="#121826" stroke-width="2"/>' +
        '<text x="' + (px + 8).toFixed(1) + '" y="' + (py + 3).toFixed(1) + '" class="rotl" style="fill:' + col + '">' + e(V.shortSec(x.name)) + '</text></g>'; });
    return s + '</svg>';
  }
  if (window.SECP) SECP.reg("clock", function(m){ return clockSvg(m); });
  function clock(m, k){
    var SP = window.SECP;
    if ((m.sectors || []).filter(function(x){ return x.r5 != null && x.r20 != null; }).length < 4) return "";
    var s = '<div class="famw" data-ff="' + ((window.store && store.secf) || "") + '">' + (SP ? SP.body("clock", k, clockSvg(m)) : clockSvg(m)) + V.famChips("clock") + '</div>';
    return card("🕐 섹터 로테이션 시계 <span class='mut'>돈은 시계 방향으로 돈다</span>", (SP ? SP.tabs("p") : "") + s +
      '<p class="note">교과서의 경기 순환처럼 섹터는 보통 🌱 새로 뜸(9~12시) → 🔥 강함(12~3시) → 🍂 힘 빠짐(3~6시) → 🧊 약함(6~9시) 순으로 돌아요. 화살표 = 지난 5일 이동. 9~12시 쪽에 있는 섹터가 다음 주인공 후보예요. 점을 누르면 종목.</p>');
  }
  window.CPX2 = function(m, k, C){
    return '<section class="card sentc"><div class="sentc-k">🗣️ ' + (m.live ? (window.cpLiveDone && cpLiveDone(m) ? e(md(m.live.date)) + " 마감" : "지금") : (m.index || [])[0] && m.index[0].date > m.date ? e(m.date.slice(5).replace("-", "/")) + " 마감" : "오늘") + ' ' + e(m.name) + ' 한 문장' + (m.live ? ' <span class="mut">' + (window.cpLiveDone && cpLiveDone(m) ? '장 마감 · 마지막 ' + e(m.live.t || "") + ' 값' : e(m.live.t || "") + ' 장중') + '</span>' : '') + '</div><p>' + sentence(m) + '</p></section>' + forecast(m) + clock(m, k);
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
    dantaLive().then(function(R){
      if (!document.body.contains(el)) return;
      var today = P.today().replace(/-/g, ""), rows = R.filter(function(r){ return String(r["시각"] || "").indexOf(today) === 0; }), live = true;
      if (!rows.length){ var last = R.length ? String(R[R.length - 1]["시각"]).slice(0, 8) : ""; rows = R.filter(function(r){ return String(r["시각"] || "").indexOf(last) === 0; }); live = false; }
      if (!rows.length){ el.innerHTML = ""; return; }
      var d0 = String(rows[0]["시각"]).slice(0, 8);
      var sum = rows.reduce(function(a, r){ return a + (+r["현재"] || 0); }, 0) / rows.length;
      el.innerHTML = '<section class="card sb"><h3>📺 ' + (live ? "오늘 알람 실시간 전광판" : d0.slice(4, 6) + "/" + d0.slice(6) + " 알람 전광판") + ' <span class="mut">' + (live ? "30초마다 새로 · 텔레그램과 같은 순간" : "오늘 알람 없음") + '</span></h3>' +
        '<div class="sb-sum"><span>알람 ' + rows.length + '</span><b class="' + cls(sum) + '">평균 ' + pct(sum) + '</b><span>플러스 ' + rows.filter(function(r){ return +r["현재"] > 0; }).length + '</span></div><div class="sb-g">' +
        rows.slice().reverse().map(function(r){ var v = +r["현재"] || 0, hi = +r["최고"] || 0, lo = +r["최저"] || 0, ex = (r["청산알림"] || "").replace(/nan/i, "");
          return '<a class="sb-t ' + (v > 0 ? "u" : v < 0 ? "d" : "") + (live ? " blink" : "") + '" href="javascript:openOP(\'' + e(r.code) + '\')"><small>' + String(r["시각"]).slice(9, 11) + ':' + String(r["시각"]).slice(11, 13) + ' · ' + e(r["유형"] && r["유형"] !== "nan" ? r["유형"] : "알람") + '</small><b>' + e(r.name) + '</b>' +
            '<em class="' + cls(v) + '">' + pct(v) + '</em><span class="sb-r"><i style="left:' + clamp(50 + lo * 8).toFixed(0) + '%;right:' + clamp(50 - hi * 8).toFixed(0) + '%"></i><u style="left:' + clamp(50 + v * 8).toFixed(0) + '%"></u></span>' +
            (ex ? '<small class="' + (/손절|이탈|시간|트레일/.test(ex) ? "dn" : "up") + '">' + e(ex) + '</small>' : '<small class="mut">최고 ' + pct(hi) + ' · 최저 ' + pct(lo) + '</small>') + '</a>'; }).join("") + '</div>' +
        '<p class="note">막대 = 장중 최저~최고 범위, 흰 점 = 지금. ' + (live ? "장 중엔 30초마다 새로 불러와요." : "") + ' 시험 중인 알람이라 참고만.</p></section>';
      if (live && cur === "danta") SBT = setTimeout(function(){ scoreboard(el); }, 30000);
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
  // 🔊 아침 요약 듣기 — 휴대폰에서 소리가 안 나와 뺌 (10/11 사용자)
  var OLD_AV = window.alarmView, OLD_AI = window.alarmInit;
  window.alarmView = function(){
    var al = store.al || {};
    var top = '<section class="card"><h3>🎚️ 하루 알림 개수 <span class="mut">내 알림(관심종목)</span></h3><div class="seg2" id="limseg">' + [[3, "3개"], [5, "5개"], [10, "10개"], [0, "전부"]].map(function(x){ return '<button data-l="' + x[0] + '"' + ((al.lim || 0) === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join("") + '</div>' +
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
;
/* ======== plus6.js ======== */
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
;
/* ======== plus7.js ======== */
/* CH Investing — 💬 의견함
   이름 · 건의 · 사진/파일 → 휴대폰에서 바로 암호화(AES-GCM, 열쇠는 RSA 공개키로 잠금) → ntfy 비밀 주제 → 서버가 매시간 모아 저장.
   저장소에는 암호문만 남고, 운영자 비밀번호(개인키 잠금 해제)를 넣은 휴대폰에서만 내용을 볼 수 있다. */
(function(){
  var e = V.e;
  var TOPIC = "chkchp-ch-idea-x7m2q", NT = "https://ntfy.sh/";
  var PUB = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjgbxbM4W4aVEYiKkghweZsDsfWvpXZPhwoW6hDgMYIzA6ZVfd0Fyw5Tyrfw9meAcvJ000JYMTF14eepeCx2nWf2ofjgYFtBiCr/KW/vWfv4t7QkF7U0h4bJSMdUgtOQuAjE18Q+pgs3yjsNbTCVTuHXp8rlw20JNd1UQmJJoyaCKQxicMaSTvf6MXAQAw7wDPTFuYzSEJDUV4a6rHSSkTHZQiAKRS0aVWervR1KolRFfpit/fuwyDv8JbeeGITucWTNqEltBYY1IDVWOvkYg7kg4ZqkQyrIGhAG3bDvsQPNh43MPb73CFlmZXupcMaTq3Et2+Or9yMyEcvKtlPAK/QIDAQAB";
  var MAXF = 5, MAXB = 14 * 1024 * 1024;
  var picked = [], C = window.crypto && window.crypto.subtle;
  function b64(buf){ var s = "", a = new Uint8Array(buf); for (var i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
  function ub64(s){ var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  var TE = new TextEncoder(), TD = new TextDecoder();
  function kb(n){ return n > 1048576 ? (n / 1048576).toFixed(1) + "MB" : Math.max(1, Math.round(n / 1024)) + "KB"; }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function now(){ var d = new Date(), p = function(n){ return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); }
  // 사진은 긴 변 1600px JPEG 로 줄여서 보냄
  function shrink(f){
    return new Promise(function(res){
      if (!/^image\/(jpeg|png|webp|heic|heif)/i.test(f.type) || f.size < 400 * 1024) return res(f);
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function(){
        var s = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function(b){ URL.revokeObjectURL(url); res(b && b.size < f.size ? new File([b], f.name.replace(/\.\w+$/, "") + ".jpg", {type: "image/jpeg"}) : f); }, "image/jpeg", 0.82);
      };
      img.onerror = function(){ URL.revokeObjectURL(url); res(f); };
      img.src = url;
    });
  }
  // ---------- 암호화 ----------
  function newKey(){ return C.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]); }
  function enc(key, bytes){ var iv = crypto.getRandomValues(new Uint8Array(12)); return C.encrypt({name: "AES-GCM", iv: iv}, key, bytes).then(function(ct){ return {iv: b64(iv), ct: ct}; }); }
  function wrap(key){
    return C.importKey("spki", ub64(PUB), {name: "RSA-OAEP", hash: "SHA-256"}, false, ["encrypt"]).then(function(pk){
      return C.exportKey("raw", key).then(function(raw){ return C.encrypt({name: "RSA-OAEP"}, pk, raw); });
    }).then(b64);
  }
  // ---------- 보내기 ----------
  function drawPicked(){
    var box = $("idfiles"); if (!box) return;
    box.innerHTML = picked.map(function(f, i){
      var th = /^image\//.test(f.type) ? '<img src="' + URL.createObjectURL(f) + '">' : '<span class="id-fi">📄</span>';
      return '<div class="id-f">' + th + '<small>' + e(f.name) + '<br>' + kb(f.size) + '</small><button data-i="' + i + '" aria-label="빼기">✕</button></div>';
    }).join("");
    [].forEach.call(box.querySelectorAll("button"), function(b){ b.onclick = function(){ picked.splice(+b.dataset.i, 1); drawPicked(); }; });
  }
  function status(t, cls){ var s = $("idst"); if (s){ s.className = "id-st " + (cls || ""); s.innerHTML = t; } }
  function send(){
    var name = ($("idname").value || "").trim(), text = ($("idtext").value || "").trim();
    if (!text){ status("건의 내용을 적어 주세요.", "bad"); $("idtext").focus(); return; }
    if (!C){ status("이 브라우저는 암호화를 지원하지 않아요. 사파리·크롬 최신 버전에서 열어 주세요.", "bad"); return; }
    store.idname = name; save();
    var id = uid(), btn = $("idsend"), K, files = picked.slice(); btn.disabled = true;
    status("🔒 암호화해서 보내는 중…");
    var chain = newKey().then(function(k){ K = k; return Promise.all([wrap(K), enc(K, TE.encode(JSON.stringify({name: name, text: text, t: now()})))]); }).then(function(r){
      var msg = JSON.stringify({kind: "idea", id: id, n: files.length, k: r[0], iv: r[1].iv, ct: b64(r[1].ct)});
      return fetch(NT, {method: "POST", body: JSON.stringify({topic: TOPIC, title: "💬 새 의견", tags: ["lock"], message: msg})}).then(function(x){ if (!x.ok) throw new Error("글 " + x.status); });
    });
    var done = 0;
    files.forEach(function(f, i){
      chain = chain.then(function(){ return shrink(f); }).then(function(g){
        if (g.size > MAXB) throw new Error(g.name + " 이(가) 너무 커요 (14MB 까지)");
        return g.arrayBuffer().then(function(buf){ return Promise.all([enc(K, buf), enc(K, TE.encode(JSON.stringify({name: g.name, type: g.type})))]); }).then(function(r){
          var q = "?filename=" + (i + 1) + ".bin&message=" + encodeURIComponent(JSON.stringify({kind: "idea-file", id: id, i: i + 1, iv: r[0].iv, miv: r[1].iv, meta: b64(r[1].ct)}));
          return fetch(NT + TOPIC + q, {method: "PUT", body: new Blob([r[0].ct], {type: "application/octet-stream"})}).then(function(x){ if (!x.ok) throw new Error("첨부 " + x.status); done++; status("🔒 첨부 보내는 중… " + done + "/" + files.length); });
        });
      });
    });
    chain.then(function(){
      var mine = store.ideas || []; mine.unshift({id: id, t: now(), text: text.slice(0, 200), n: files.length}); store.ideas = mine.slice(0, 30); save();
      picked = []; drawPicked(); $("idtext").value = "";
      status("✅ 보냈어요! 고마워요 🙏 (내용은 암호화돼서 운영자만 볼 수 있어요)", "ok");
      btn.disabled = false; mineList();
    }).catch(function(err){ status("❌ 못 보냈어요: " + e(err.message || err) + " — 잠시 뒤 다시 눌러 주세요.", "bad"); btn.disabled = false; });
  }
  function mineList(){
    var box = $("idmine"); if (!box) return;
    var mine = store.ideas || [];
    box.innerHTML = mine.length ? '<div class="sec">내가 보낸 의견 <span class="mut">이 휴대폰에만 보여요</span></div>' + mine.slice(0, 10).map(function(x){
      return '<div class="id-it pend"><p>' + e(x.text) + '</p><small class="mut">' + e(x.t) + (x.n ? ' · 첨부 ' + x.n + '개' : '') + '</small></div>'; }).join("") : "";
  }
  // ---------- 운영자 보기 ----------
  var PRIV = null;
  function unlock(pw){
    return getJSON("archive/x/fb_key.json?" + Date.now()).then(function(kf){
      return C.importKey("raw", TE.encode(pw), "PBKDF2", false, ["deriveKey"]).then(function(base){
        return C.deriveKey({name: "PBKDF2", salt: ub64(kf.salt), iterations: kf.iter, hash: "SHA-256"}, base, {name: "AES-GCM", length: 256}, false, ["decrypt"]);
      }).then(function(dk){ return C.decrypt({name: "AES-GCM", iv: ub64(kf.iv)}, dk, ub64(kf.ct)); })
        .then(function(pk){ return C.importKey("pkcs8", pk, {name: "RSA-OAEP", hash: "SHA-256"}, false, ["decrypt"]); });
    });
  }
  // 🔒 11/04 사용 현황(usage.js)도 같은 운영자 열쇠로 — 비밀번호가 이 폰에 있을 때만
  window.__opOpen = function(x){
    if (!store.fbpass || !C) return Promise.reject("locked");
    return (PRIV ? Promise.resolve(PRIV) : unlock(store.fbpass).then(function(k){ PRIV = k; return k; })).then(function(pk){
      return C.decrypt({name: "RSA-OAEP"}, pk, ub64(x.k)); }).then(function(raw){ return C.importKey("raw", raw, {name: "AES-GCM"}, false, ["decrypt"]); })
      .then(function(K){ return C.decrypt({name: "AES-GCM", iv: ub64(x.iv)}, K, ub64(x.ct)); }).then(function(b){ return JSON.parse(TD.decode(b)); });
  };
  window.__opHas = function(){ return !!(store.fbpass && C); };
  function openItem(x){
    return C.decrypt({name: "RSA-OAEP"}, PRIV, ub64(x.k)).then(function(raw){ return C.importKey("raw", raw, {name: "AES-GCM"}, false, ["decrypt"]); }).then(function(K){
      return C.decrypt({name: "AES-GCM", iv: ub64(x.iv)}, K, ub64(x.ct)).then(function(b){
        var body = JSON.parse(TD.decode(b));
        var noteP = x.nct ? C.decrypt({name: "AES-GCM", iv: ub64(x.niv)}, K, ub64(x.nct)).then(function(n){ body.note = TD.decode(n); }).catch(function(){}) : Promise.resolve();
        return Promise.all((x.files || []).map(function(f){
          return C.decrypt({name: "AES-GCM", iv: ub64(f.miv)}, K, ub64(f.meta)).then(function(m){ var meta = JSON.parse(TD.decode(m));
            return fetch(f.path).then(function(r){ return r.arrayBuffer(); }).then(function(buf){ return C.decrypt({name: "AES-GCM", iv: ub64(f.iv)}, K, buf); })
              .then(function(pl){ return {name: meta.name, type: meta.type, url: URL.createObjectURL(new Blob([pl], {type: meta.type || "application/octet-stream"}))}; });
          }).catch(function(){ return {name: "첨부 열기 실패", type: "", url: ""}; });
        })).then(function(fs){ body.files = fs; return noteP; }).then(function(){ return body; });
      });
    });
  }
  function adminList(){
    var box = $("idadmin"); if (!box) return;
    box.innerHTML = '<div class="loading">🔓 여는 중…</div>';
    getJSON("archive/x/ideas.json?" + Date.now()).catch(function(){ return {items: []}; }).then(function(db){
      var items = db.items || [];
      if (!items.length){ box.innerHTML = '<div class="sec">들어온 의견 <span class="mut">운영자 보기</span></div><div class="empty">아직 들어온 의견이 없어요.</div>'; return; }
      return Promise.all(items.map(function(x){ return openItem(x).catch(function(){ return null; }); })).then(function(bodies){
        box.innerHTML = '<div class="sec">들어온 의견 ' + items.length + '건 <span class="mut">🔓 운영자 보기 · <a href="javascript:void 0" id="idlock">잠그기</a></span></div>' + items.map(function(x, i){
          var b = bodies[i], st = x.status || "접수", cls = st === "반영함" ? "hot" : st === "진행 중" ? "c" : st === "보류" ? "cool" : "";
          if (!b) return '<div class="id-it"><p class="mut">열지 못한 의견 (' + e(x.t) + ')</p></div>';
          var files = (b.files || []).map(function(f){
            return /^image\//.test(f.type) ? '<a href="' + f.url + '" target="_blank"><img src="' + f.url + '"></a>' : '<a class="id-fl" href="' + f.url + '" download="' + e(f.name) + '">📄 ' + e(f.name) + '</a>'; }).join("");
          return '<div class="id-it"><div class="id-h"><b>' + e(b.name || "이름 없음") + '</b><span class="chip2 ' + cls + '">' + e(st) + '</span></div><p>' + e(b.text).replace(/\n/g, "<br>") + '</p>' +
            (files ? '<div class="id-att">' + files + '</div>' : '') + (x.lost ? '<small class="dn">첨부 ' + x.lost + '개는 서버가 늦게 받아 사라졌어요</small>' : '') + (b.note ? '<div class="id-note">🛠 ' + e(b.note) + '</div>' : '') + '<small class="mut">' + e(b.t || x.t) + '</small></div>';
        }).join("");
        var l = $("idlock"); if (l) l.onclick = function(){ delete store.fbpass; save(); PRIV = null; go("idea"); };
      });
    });
  }
  function adminBox(){
    var box = $("idadmin"); if (!box) return;
    if (store.fbpass && C){
      unlock(store.fbpass).then(function(k){ PRIV = k; adminList(); }).catch(function(){ delete store.fbpass; save(); adminBox(); });
      return;
    }
    if (!adminBox.shown){ box.innerHTML = ""; return; }
    box.innerHTML = '<details class="id-adm" open><summary>🔐 운영자</summary><div class="id-adm-b"><input aria-label="운영자 비밀번호" id="idpw" type="password" placeholder="운영자 비밀번호" autocomplete="current-password"><button class="btn" id="idpwb">열기</button></div><small id="idpwst" class="mut"></small></details>';
    $("idpwb").onclick = function(){
      var pw = ($("idpw").value || "").trim(); if (!pw) return;
      $("idpwst").textContent = "확인 중…";
      unlock(pw).then(function(k){ PRIV = k; store.fbpass = pw; save(); adminList(); }).catch(function(){ $("idpwst").textContent = "비밀번호가 맞지 않아요."; });
    };
  }
  window.ideaView = function(){
    return '<section class="card id-form"><h3>✍️ 의견 남기기</h3>' +
      '<label>이름<input aria-label="이름 또는 닉네임" id="idname" maxlength="40" placeholder="이름 또는 닉네임 (비워도 돼요)" value="' + e(store.idname || "") + '"></label>' +
      '<label>건의 내용<textarea id="idtext" rows="6" maxlength="4000" placeholder="앱에서 바뀌었으면 하는 점, 추가했으면 하는 기능, 오류 등 자유롭게"></textarea></label>' +
      '<div class="id-pick"><label class="btn" for="idfile">📎 사진·파일 첨부</label><input id="idfile" type="file" multiple accept="image/*,application/pdf,.pdf,.xlsx,.xls,.csv,.txt,.docx,.pptx,.zip"><small class="mut">최대 ' + MAXF + '개 · 사진은 자동으로 줄여서 보내요</small></div>' +
      '<div id="idfiles" class="id-files"></div>' +
      '<button class="btn id-send" id="idsend">보내기</button><div id="idst" class="id-st"></div>' +
      '<p class="note">🔒 보낸 내용과 첨부는 이 휴대폰에서 바로 암호화돼서 전송·저장돼요. 다른 사용자는 누가 무슨 의견을 보냈는지 전혀 볼 수 없고, 운영자만 열어볼 수 있어요.</p></section>' +
      '<div id="idmine"></div><div id="idadmin"></div>';
  };
  window.ideaInit = function(){
    picked = [];
    $("idfile").onchange = function(ev){
      [].forEach.call(ev.target.files || [], function(f){ if (picked.length < MAXF) picked.push(f); });
      ev.target.value = ""; drawPicked();
    };
    $("idsend").onclick = send;
    mineList(); adminBox.shown = false; adminBox();
    // 운영자 입구는 숨김: 위쪽 「💬 의견함」 제목을 3초 안에 5번 누르면 나타남
    var h1 = document.querySelector("#main .hero h1"), taps = [];
    if (h1) h1.addEventListener("click", function(){
      var t = Date.now(); taps = taps.filter(function(x){ return t - x < 3000; }); taps.push(t);
      if (taps.length >= 5 && !adminBox.shown){ adminBox.shown = true; adminBox(); var b = $("idadmin"); if (b) b.scrollIntoView({behavior: "smooth"}); }
    });
  };
})();
;
/* ======== plus8.js ======== */
/* CH Investing — 시황 맨 위: ⚡ 킥 → 🇺🇸 전일 미국장 핵심 멘트 (가장 바깥 겹이라 항상 맨 위) */
(function(){
  var P = PL, e = V.e, rich = V.rich;
  function strip(s){ return String(s || "").replace(/<span[^>]*>|<\/span>/g, ""); }
  function pc(v){ return v == null ? '<b>–</b>' : '<b class="' + (v >= 0 ? "up" : "dn") + '">' + (v >= 0 ? "+" : "") + Number(v).toFixed(1) + '%</b>'; }
  // 관련주 → 종목리포트 → 뒤로 하면 보던 관련주 창으로 다시
  var RET = null;
  window.addEventListener("popstate", function(){
    if (!RET) return;
    var n = 0, t = setInterval(function(){
      if (!RET || ++n > 25){ clearInterval(t); return; }
      if (cur !== "market" || !document.getElementById("mkld") || document.getElementById("sheet")) return;
      clearInterval(t); var o = RET; RET = null; themeSheet(o.r, o.S); }, 80);
  });

  // 🎯 오늘의 집중 그리기 — F: market/focus.json, L: archive/x/focus_live.json (장중, 없으면 null)
  var ST_IC = {"초입": "🌱", "주도": "🚀", "과열": "🔥", "꺾임": "🍂"};
  function spark(v, w, h){
    if (!v || v.length < 2) return "";
    var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), rg = (mx - mn) || 1, col = v[v.length - 1] >= 0 ? "#e66767" : "#3987e5";
    var pts = v.map(function(x, i){ return (i * (w - 2) / (v.length - 1) + 1).toFixed(1) + "," + (h - 2 - (x - mn) / rg * (h - 4)).toFixed(1); }).join(" ");
    var z = mn < 0 && mx > 0 ? (h - 2 - (0 - mn) / rg * (h - 4)).toFixed(1) : null;
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + (z ? '<line x1="0" x2="' + w + '" y1="' + z + '" y2="' + z + '" stroke="#5d667a" stroke-dasharray="2 3" stroke-width=".8"/>' : '') +
      '<polyline fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" points="' + pts + '"/></svg>';
  }
  function man(v){ var a = Math.abs(v); return (v >= 0 ? "+" : "−") + (a >= 1e4 ? (a / 1e4).toFixed(a >= 1e5 ? 0 : 1) + "만" : Math.round(a).toLocaleString()) + "주"; }
  // 돈의 길 나라 카드 → 눌러서 펼침 (지수 1일·1주·1개월, 국면, 오르는 종목 비율, 뜨는 업종과 대장주)
  var FOSEL = null;
  function countryDetail(c){
    if (!c) return '';
    var row = function(k, v){ return '<div class="fo-dr"><span>' + k + '</span><b>' + v + '</b></div>'; };
    var hot = (c.hot || []).map(function(h){
      return '<div class="fo-dh"><div class="fo-dt">▲ <b>' + e(h.name) + '</b> <span>오늘 ' + pc(h.r1) + ' · 1주 ' + pc(h.r5) + '</span></div><div class="fo-dl">' +
        (h.lead || []).map(function(l){ return '<a href="javascript:openOP(\'' + e(l.s).replace(/'/g, "") + '\')">' + e(l.n || l.s) + ' ' + pc(l.r1) + '</a>'; }).join("") + '</div></div>'; }).join("");
    return '<div class="fo-cd"><div class="fo-dhd">' + c.flag + ' <b>' + e(c.name) + '</b> · ' + e(c.ix || "") + (c.date ? ' <small>' + e(c.date.slice(5)) + ' 기준</small>' : '') + '</div>' +
      '<div class="fo-dg">' + row("오늘", pc(c.chg1)) + row("1주", pc(c.chg5)) + row("1개월", pc(c.chg20)) + row("국면", e(c.regime || "—")) + row("10일선 위", c.breadth10 != null ? e(c.breadth10) + "%" : "—") + '</div>' +
      (hot || '<div class="mut" style="font-size:12.5px">뜨는 업종 자료 없음</div>') + '<div class="mut" style="font-size:12.5px;margin-top:4px">종목 이름을 누르면 차트가 열려요</div></div>';
  }
  window.foSel = function(i){
    FOSEL = FOSEL === i ? null : i;
    var b = document.querySelector("#mkfo .fo-b"); if (b && window.__FO) b.innerHTML = focusHtml(window.__FO.F, window.__FO.L);
    var d = b && b.querySelector(".fo-cd"); if (d && d.scrollIntoView) d.scrollIntoView({block: "nearest", behavior: "smooth"});
  };
  function focusHtml(F, L){
    window.__FO = {F: F, L: L};
    var px = (L && L.px) || {}, liveOn = L && L.date && L.at;
    var tagc = function(a){ return a === "추격 금지" ? "r" : a === "눌림 대기" ? "o" : /★/.test(a) ? "g" : "x"; };
    var usOpen = (function(){ var a = (L && L.at) || "", h = +a.slice(0, 2); return a && (h >= 22 || h < 6); })();
    var chip = function(x, flag){ var nm = x.name || x.t, q = px[x.t]; if (q && flag === "🇺🇸" && !usOpen) q = {lv: q.lv, d: q.d};
      var pos = x.pos ? '<small class="fo-pos">' + e(x.pos.k) + ' ' + (q && q.lv ? (q.d >= 0 ? "+" : "") + q.d.toFixed(1) : (x.pos.d != null ? (x.pos.d >= 0 ? "+" : "") + x.pos.d.toFixed(1) : "")) + '%</small>' : '';
      var now = q && q.r != null ? '<small class="fo-now ' + (q.r >= 0 ? "up" : "dn") + '">지금 ' + (q.r >= 0 ? "+" : "") + q.r.toFixed(1) + '%</small>' : '';
      return '<a class="fo-st" href="javascript:openOP(\'' + e(x.t).replace(/'/g, "") + '\')"><span class="fo-nm">' + flag + ' <b>' + e(nm.length > 13 ? nm.slice(0, 12) + "…" : nm) + '</b>' + (x.star ? ' <em>★' + e(x.star) + '</em>' : '') + pos + '</span>' +
        '<span>' + now + (x.r5 != null ? pc(x.r5) : '') + ' <i class="fo-t ' + tagc(x.act || "") + '">' + e(x.act || "") + '</i></span></a>'; };
    var al = (function(){ var seen = {}, out = []; (L && L.alerts || []).slice().reverse().forEach(function(a){ var k = a.name + "|" + a.k; if (!seen[k]){ seen[k] = 1; out.push(a); } }); return out.slice(0, 4); })(); // 같은 종목·같은 신호는 최신 1건만
    var h = (al.length ? '<div class="fo-al">' + al.map(function(a){ return '<div class="' + (a.k === "돌파" ? "ok" : "ng") + '">' + (a.k === "돌파" ? "✅" : "⚠️") + ' <b>' + e(a.name) + '</b> ' + e(a.msg) + ' <small>' + e(a.at) + '</small></div>'; }).join("") + '</div>' : '') +
      (liveOn ? '<div class="fo-live"><span class="ixc-on">●</span> 장중 추적 ' + e(L.at) + ' · 10분마다 · 기준가 돌파/20일선 이탈은 알림 탭 「🎯」 구독하면 휴대폰으로</div>' : '');
    h += '<div class="fo-sub" style="margin-top:2px">① 돈의 길 — 5개 시장 1주</div><div class="fo-cs">' + (F.countries || []).map(function(c, i){
      return '<div class="fo-c' + (i === 0 && c.label ? " fo-top" : "") + (FOSEL === i ? " fo-on" : "") + '" data-foc="' + i + '" role="button" tabindex="0" onclick="foSel(' + i + ')"><div class="fo-n">' + c.flag + " " + e(c.name) + ' <span class="fo-ar">' + (FOSEL === i ? "▴" : "▾") + '</span></div><div class="fo-v">' + pc(c.chg5) + '</div><small>' + (c.label ? e(c.label) : "1주 " + e(c.ix || "")) + '</small>' +
        ((c.hot || [])[0] ? '<small class="fo-h">▲ ' + e(c.hot[0].name) + '</small>' : '') + '</div>'; }).join("") + '</div>' + countryDetail((F.countries || [])[FOSEL]);
    h += F.themes.slice(0, 2).map(function(t, i){
      var sg = t.stage || {}, fl = t.flow, lg = t.lag, sp = t.supply;
      return '<div class="fo-th"><div class="fo-tt"><b>' + (i ? "③" : "②") + " " + e(t.name) + '</b> <small>' + e(t.sym) + '</small>' + (t.streak >= 3 ? ' <em>🔥' + t.streak + '일</em>' : '') +
          '<span>5일 ' + pc(t.r5) + ' · 20일 ' + pc(t.r20) + '</span></div>' +
        (sg.s ? '<div class="fo-stg s-' + e(sg.c || "x") + '"><b>' + (ST_IC[sg.s] || "") + " " + e(sg.s) + '</b> ' + e(sg.do || "") + '</div>' : '') +
        (fl ? '<div class="fo-fl">' + spark(fl.rs, 92, 26) + '<div><b>💧 ' + e(fl.lab) + '</b><small>S&amp;P 대비 20일 흐름 ' + pc(fl.rs[fl.rs.length - 1]) + ' · 거래대금 ' + fl.dv + '배</small></div></div>' : '') +
        (t.why_auto ? '<div class="fo-why">' + e(t.why_auto) + '</div>' : '') +
        (lg ? '<div class="fo-lag">🔗 ' + e(lg.txt) + (lg.today ? '<br><b>' + e(lg.today) + '</b>' : '') + '</div>' : '') +
        '<div class="fo-sub">ETF</div>' + chip({t: t.sym, name: t.sym + " (미국)", r5: t.r5, act: t.etf_us.act}, "🇺🇸") + (t.etf_kr || []).slice(0, 2).map(function(x){ return chip(x, "🇰🇷"); }).join("") +
        '<div class="fo-sub">종목 <span class="mut">★ = 우리 컵·갭·매집에도 걸림 · 작은 글씨 = 매수 자리까지 · 오른쪽 = 5일</span></div>' + (t.us || []).slice(0, 4).map(function(x){ return chip(x, "🇺🇸"); }).join("") + (t.kr || []).slice(0, 4).map(function(x){ return chip(x, "🇰🇷"); }).join("") +
        (sp ? '<div class="fo-sup">🏦 한국 연결주 5일 수급 · 외국인 <b class="' + (sp.frg >= 0 ? "up" : "dn") + '">' + man(sp.frg) + '</b> · 기관 <b class="' + (sp.org >= 0 ? "up" : "dn") + '">' + man(sp.org) + '</b> <small>(' + sp.n + '종목)</small></div>' : '') +
        (t.stop ? '<div class="fo-stop">⛔ <b>이게 깨지면</b> ' + e(t.stop) + '</div>' : '') + '</div>'; }).join("");
    var sc = F.score || {};
    h += (F.avoid && F.avoid.length ? '<div class="fo-av">🧊 빠지는 곳: ' + F.avoid.slice(0, 3).map(function(a){ return e(a.name) + " " + pc(a.r5); }).join(" · ") + '</div>' : '');
    if (sc.bad) h += '<div class="fo-bad">⚠️ 집중 성적이 나빠요 — 최근 5번 중 3번 이상 S&amp;P에 짐<br>' + (sc.week || []).slice(0, 3).map(function(x){ return e(x.asof.slice(5)) + " " + e(x.name) + " " + pc(x.res) + " → " + e(x.lesson || ""); }).join("<br>") + '</div>';
    h += '<details class="fo-wk"><summary>📒 집중 성적 ' + (sc.n ? '<b>' + sc.hit + '/' + sc.n + '</b> · 평균 S&amp;P 대비 ' + pc(sc.avg_ex) : '— 10/7부터 기록, 5거래일 뒤 채점') + ' <span class="mut">· 눌러서 회고</span></summary>' +
      ((sc.week || []).length ? (sc.week || []).map(function(x){ var w = Math.min(100, Math.abs(x.ex || 0) * 8);
        return '<div class="fo-wr"><span>' + e(x.asof.slice(5)) + ' <b>' + e(x.name) + '</b></span><span class="fo-wb"><i style="width:' + w + '%;background:' + ((x.ex || 0) >= 0 ? "#e66767" : "#3987e5") + '"></i></span><span>' + pc(x.ex) + 'p</span>' + (x.lesson ? '<small>' + e(x.lesson) + '</small>' : '') + '</div>'; }).join("")
        : '<div class="mut" style="font-size:12.5px;padding:6px 0">아직 채점된 집중이 없어요. 채점 대기: ' + (sc.open || []).map(function(x){ return e(x.asof.slice(5)) + " " + e(x.name); }).join(" · ") + '</div>') + '</details>';
    h += '<div class="mut" style="font-size:12.5px;margin-top:6px">단계 🌱초입=모아가기 · 🚀주도=눌림 매수 · 🔥과열=추격 금지 · 🍂꺾임=끝났나? / 종목 ★관심 = 테마+차트 자리 · 눌림 대기 = 5일 +15%↑ · 추격 금지 = 하루 +8%↑. 매수 권유가 아니라 볼 곳을 좁히는 표예요.</div>';
    return h;
  }
  // 테마 → 관련주 보조 창
  function themeSheet(r, S){
    if (!r) return;
    if (window.closeSheet && document.getElementById("sheet")) closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b></b></div><div class="sh-body"><div class="empty">불러오는 중…</div></div>';
    sh.querySelector("b").textContent = "🔥 " + r.name + " 관련주";
    document.body.appendChild(sh); document.body.classList.add("sheet-open");
    try { history.pushState({t: "xs", d: navD() + 1}, "", location.pathname + "#" + cur); } catch(x) {}
    if (window.updBack) updBack();
    var mem = r.members || {us: (r.lead || []), kr: []};
    var draw = function(){
      var nm = {}; (window.OPIDX || []).forEach(function(x){ nm[x.sym] = x; });
      var list = function(L, kr){
        if (!L || !L.length) return '<div class="mut" style="font-size:12.5px;padding:6px 0">아직 없음</div>';
        return '<div class="th-h"><span>종목</span><span>1일</span><span>5일</span><span>20일</span></div>' + L.map(function(m){
          var o = nm[m.t], name = kr ? (o ? o.name : m.n) : (o ? o.name : m.t);
          return '<div class="th-r' + (o ? " go" : "") + '"' + (o ? ' data-op="' + e(m.t) + '"' : '') + '><span class="th-n">' + e(name) + ' <small>' + e(kr ? m.t.replace(/\.K[SQ]$/, "") : m.t) + '</small>' + (o ? ' <i>›</i>' : '') + '</span>' + pc(m.r1) + pc(m.r5) + pc(m.r20) + '</div>'; }).join("");
      };
      var spy = S.spy || {};
      var h = '<section class="card"><div class="th-k">' +
        '<div><small>5일</small>' + pc(r.r5) + '</div><div><small>20일</small>' + pc(r.r20) + '</div><div><small>60일</small>' + pc(r.r60) + '</div>' +
        '<div><small>S&amp;P 대비 5일</small>' + pc(r.rs5) + '</div></div>' +
        '<div class="mut" style="font-size:12.5px;margin-top:8px">' + e(r.sym) + ' · 순위 ' + (r.rank || "–") + '위' + (r.rank_chg ? ' (' + (r.rank_chg > 0 ? "▲" : "▼") + Math.abs(r.rank_chg) + ')' : '') +
        (r.streak >= 3 ? ' · 🔥 S&amp;P보다 강한 날 ' + r.streak + '일 연속' : '') + (r.off_hi != null ? ' · 52주 고점 대비 ' + Number(r.off_hi).toFixed(1) + '%' : '') + ' · ' + e(String(S.asof || "").slice(5).replace("-", "/")) + ' 종가</div></section>' +
        '<section class="card"><h3>🇺🇸 미국 관련주 <span class="mut">5일 순</span></h3>' + list(mem.us) + '</section>' +
        '<section class="card"><h3>🇰🇷 한국 관련주 <span class="mut">5일 순</span></h3>' + list(mem.kr, true) + '</section>' +
        '<div class="mut" style="font-size:12.5px;text-align:center;margin:6px 0 30px">이름을 누르면 종목리포트로 가요</div>';
      var b = sh.querySelector(".sh-body"); b.innerHTML = h;
      [].forEach.call(b.querySelectorAll("[data-op]"), function(el){ el.onclick = function(){ RET = {r: r, S: S}; openOP(el.dataset.op); }; });
    };
    (window.opLoadIdx ? opLoadIdx() : Promise.resolve()).then(draw, draw);
  }
  function sameHead(a, b){ var n = function(x){ return String(x || "").replace(/<[^>]*>/g, "").replace(/[\s「」'"·,.—–-]/g, "").slice(0, 12); }; return !!a && !!b && n(a) === n(b); }
  P.wrap("market", function(it, a){
    if (it.files.indexOf("data.json") < 0) return;
    getJSON(file("market", it.id, "data.json")).then(function(d){
      var h = "", k = d.kick, s = d.story || {};
      // ① 킥
      if (k && !k.none && k.title){
        h += '<section class="card mk-kick"><div class="mk-lab">⚡ 오늘의 킥</div>' +
          '<div class="mk-t">' + rich(strip(k.title)) + '</div>' +
          (k.so ? '<div class="mk-so">→ ' + rich(strip(k.so)) + '</div>' : '') +
          ((k.rows && k.rows.length) ? '<div class="mk-rows">' + k.rows.slice(0, 6).map(function(r){
            return '<div class="' + (r.hi ? "hi" : "") + '"><span>' + e(r.label) + '</span><b class="' + (r.dir > 0 ? "up" : r.dir < 0 ? "dn" : "") + '">' + e(r.text) + '</b></div>'; }).join("") + '</div>' : '') +
          (k.why ? '<details class="mk-why"><summary>왜 이게 킥인가</summary><p>' + rich(strip(k.why)) + '</p></details>' : '') + '</section>';
      } else if (k && k.none){
        h += '<section class="card mk-kick"><div class="mk-lab">⚡ 오늘의 킥</div><div class="mk-so">오늘은 킥 없음 — ' + rich(strip(k.why || "")) + '</div></section>';
      }
      // ①-1 🎯 오늘의 집중 (market-strategy-report/market/focus.json — 돈의 길 → 담는 법 → 행동)
      h += '<section class="card mk-focus" id="mkfo"><div class="mk-lab">🎯 오늘의 집중 <span class="mut">돈의 길 → 담는 법 → 행동</span></div><div class="fo-b"><div class="loading">불러오는 중…</div></div></section>';
      // ①-1b 💡 새 규칙 오늘 (10/12 검증 통과분 — kick.json ideas: 🧭 추세 칸 · 📊 실적 표류 · 👻 그림자)
      h += '<section class="card" id="mkid"><div class="mk-lab">💡 새 규칙 오늘 <span class="mut">10/12 과거 검증 · 통과한 것만 포트에</span></div><div class="id-b"><div class="loading">불러오는 중…</div></div></section>';
      // ①-2 🔥 지금 주도 테마 (리포트 data.leaders + 아침 자동 레이더 market/sectors.json)
      h += '<section class="card mk-lead2" id="mkld"><div class="mk-lab">🔥 지금 돈이 몰리는 곳</div>' +
        (d.leaders && d.leaders.title ? '<div class="mk-t2">' + rich(strip(d.leaders.title)) + '</div>' + (d.leaders.so ? '<div class="mk-so">→ ' + rich(strip(d.leaders.so)) + '</div>' : '') +
          ((d.leaders.korea || []).length ? '<div class="mk-kr">' + d.leaders.korea.map(function(k){ return '<div>🇰🇷 ' + rich(strip(k)) + '</div>'; }).join("") + '</div>' : '') : '') +
        '<div class="mk-rad"></div></section>';
      // ② 전일 미국장 핵심 멘트
      var us = (d.quotes || []).filter(function(q){ return q.cls === "us"; }).slice(0, 3);
      var bm = String(d.basis || "").match(/미국[^·]*/);
      if (s.title || s.lead || us.length){
        h += '<section class="card mk-us"><div class="mk-lab">🇺🇸 전일 미국장 핵심' + (bm ? ' <span class="mut">' + e(bm[0].trim()) + '</span>' : '') + '</div>' +
          (s.title && !sameHead(s.title, d.one_liner) ? '<div class="mk-t2">' + rich(strip(s.title)) + '</div>' : '') +   // A10-4: 맨 위 띠와 같은 제목이면 한 번만
          (s.lead ? '<p class="mk-lead">' + rich(strip(s.lead)) + '</p>' : '') +
          (us.length ? '<div class="mk-q">' + us.map(function(q){
            return '<div><small>' + e(String(q.who || "").replace(/^🇺🇸\s*/, "")) + '</small><b>' + rich(strip(q.said)) + '</b>' + (q.so ? '<span>→ ' + rich(strip(q.so).replace(/^\s*→?\s*(<b>)?\s*그래서\?\s*(<\/b>)?\s*/, "")) + '</span>' : '') + '</div>'; }).join("") + '</div>' : '') + '</section>';
      }
      a.innerHTML = h;
      // 🎯 집중 채우기 (단계·흐름 선·시차·자리·수급 + 장중 추적)
      getJSON(RAW + "market-strategy-report/main/market/focus.json?" + Date.now()).then(function(F){
        (function(){ getJSON(RAW + "market-strategy-report/main/market/kick.json?" + Date.now()).then(function(K){
          var bx = document.querySelector("#mkid .id-b"); if (!bx) return; var I = K.ideas || {}, T = K.trend || {};
          var row = function(k){ var x = I[k]; if (!x) return ''; return '<div class="id-r"><b>' + e(x.state) + ' ' + e(x.name) + '</b> <span class="mut">' + e(x.state === "✅" ? "포트에 반영" : x.state === "🧪" ? "절반 크기로 시험" : x.state === "👻" ? "그림자 채점만" : "기각 · 채점만") + '</span>' +
            ((x.today || []).length ? '<div class="id-t">' + (k === "trend" ? "지금 들고 있음: " : e((x.today_d || "").slice(5)) + " 신호: ") + x.today.map(function(t){ return '<a href="javascript:openOP(\'' + e(t) + '\')">' + e(t) + '</a>'; }).join(" · ") + '</div>' : '<div class="id-t mut">오늘 신호 없음</div>') + '</div>'; };
          bx.innerHTML = row("trend") + row("pead") + row("nh52") + row("dip") +
            '<div class="mut" style="font-size:12.5px;margin-top:6px">🧭 추세 = 금·원유·장기채·달러·지수 ETF 100일 고점 돌파에 사고 50일 저점 이탈에 팖 · 킥 포트의 5% 칸' + (T.from ? ' (' + e(T.from.slice(5)) + '부터)' : '') + ' · 📊 실적 표류 = 실적 철 미국 갭 +8%↑·거래량 3배↑ → 최대 40일. 매수 권유가 아니라 규칙 상태 표시예요.</div>';
        }).catch(function(){ var bx = document.querySelector("#mkid .id-b"); if (bx) bx.innerHTML = '<div class="mut">자료를 못 불러왔어요.</div>'; }); })();
        var box = document.querySelector("#mkfo .fo-b"); if (!box) return;
        if (!F || !F.themes || !F.themes.length){ box.innerHTML = '<div class="mut">오늘 집중 자료가 아직 없어요.</div>'; return; }
        window.__FO = F;
        box.innerHTML = focusHtml(F, null);
        var live = function(){ getJSON("archive/x/focus_live.json?" + Math.floor(Date.now() / 60000)).then(function(L){
          if (!L || !document.getElementById("mkfo")) return;
          var b = document.querySelector("#mkfo .fo-b"); if (b) b.innerHTML = focusHtml(F, L); }).catch(function(){}); };
        live(); clearInterval(window.__FOT); window.__FOT = setInterval(function(){ if (!document.getElementById("mkfo")) return clearInterval(window.__FOT); if (!document.hidden) live(); }, 120000);
      }).catch(function(){ var box = document.querySelector("#mkfo .fo-b"); if (box) box.innerHTML = '<div class="mut">집중 자료를 못 불러왔어요.</div>'; });
      // 아침 자동 레이더 (리포트에 없더라도 숫자는 매일)
      getJSON(RAW + "market-strategy-report/main/market/sectors.json?" + Date.now()).then(function(S){
        var box = document.querySelector("#mkld .mk-rad"); if (!box || !S || !S.rows) return;
        var by = {}; S.rows.forEach(function(r){ by[r.sym] = r; });
        var row = function(r, cold){ var v = r.r5 || 0; return '<div class="rad" data-s="' + e(r.sym) + '"><span class="rad-n">' + (cold ? "🧊 " : "") + e(r.name) + ' <small>' + e(r.sym) + '</small>' + (r.streak >= 3 ? ' <em>🔥' + r.streak + '일</em>' : '') + '</span>' +
          '<span class="rad-b"><i style="width:' + Math.min(100, Math.abs(v) * 9).toFixed(0) + '%;background:' + (v >= 0 ? "#e5533b" : "#3b7ddd") + '"></i></span><b class="' + (v >= 0 ? "up" : "dn") + '">' + (v >= 0 ? "+" : "") + v.toFixed(1) + '%</b>' +
          '<small class="rad-20">20일 ' + (r.r20 != null ? (r.r20 >= 0 ? "+" : "") + r.r20.toFixed(1) + "%" : "–") + '</small></div>'; };
        box.innerHTML = '<div class="rad-h">미국 섹터·테마 5일 · ' + e(String(S.asof || "").slice(5).replace("-", "/")) + ' 종가 · S&amp;P ' + ((S.spy && S.spy.r5) >= 0 ? "+" : "") + ((S.spy && S.spy.r5) || 0).toFixed(1) + '%</div>' +
          (S.hot || []).slice(0, 5).map(function(s){ return by[s] ? row(by[s]) : ""; }).join("") +
          (S.cold || []).slice(0, 2).map(function(s){ return by[s] ? row(by[s], true) : ""; }).join("") +
          '<div class="rad-tip">테마를 누르면 관련주가 나와요 ›</div>';
        [].forEach.call(box.querySelectorAll(".rad[data-s]"), function(el){ el.onclick = function(){ themeSheet(by[el.dataset.s], S); }; });
      }).catch(function(){});
    }).catch(function(){});
  });
})();
;
/* ======== gsearch.js ======== */
/* 🔍 어디서든 종목 검색 (10/9) — 헤더 🔍 를 누르고 종목명·코드를 치면 바로 종목리포트로.
   한글 이름·영문·티커·6자리 코드 모두 (종목리포트 검색과 같은 목록 · 약 2만 종목 + ETF) */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function close(){ var o = document.getElementById("gsq"); if (o) o.remove(); document.body.classList.remove("gs-open"); }
  function go(sym){ close(); if (window.openOP) openOP(sym); }
  /* 💬 고객이 물으면 (11/2 A11/2-3) — 상담 자리에서 고객이 자주 묻는 말 → 앱 안에서 그 답이 있는 카드 2~3장으로 바로.
     자유 입력·AI 없음(0원) · 사람이 고른 대응표 · 누르면 그 탭의 그 카드로 스크롤·반짝(goTo 그대로) → 떠 있는 「📨 보내기」로 그 화면 한 장 */
  var ASK = [
    ["금리 내리면?", [["🗺 금리 한 장 지도 · 미 10년 금리 vs 코스피", "market", "#p4map"], ["🏛 국고채 · 지금 금리 · 만기까지 받는 돈", "bond", "#pdbody"]]],
    ["ELS 괜찮아요?", [["🎬 청약 중 ELS · 과거엔 몇 번 끝났나", "els", "#pdbody"], ["📌 내 ELS 관제탑 · 낙인까지 거리", "els", "#elsmy"]]],
    ["지금 들어가도?", [["🎲 다음 장 오를 확률 · 오늘과 닮은 날", "prob", "#prbody"], ["🧭 장 분위기판 · 지금 어느 국면", "sector", "#rbboard"], ["⏳ 장 분위기 전환 예보", "sector", "#cpd"]]],
    ["급락인데 팔까요?", [["😱 그날 겁먹고 팔았다면 · 포트 설계기 안", "port", "#podz"], ["⏳ 장 분위기 전환 예보", "sector", "#cpd"], ["🎲 다음 장 오를 확률", "prob", "#prbody"]]],
    ["요즘 뭐가 세요?", [["🔥 오늘 장중 섹터 발동", "sector", "#tlog"], ["🌍 세계 시장 하루 흐름", "sector", "#cptop"], ["🗺 오늘 업종 지도", "home", ".h2-map"]]],
    ["환율은요?", [["📊 실시간 시장판 · 원/달러", "market", "#live"], ["💵 미국채 · 달러 채권 목록", "bond", "#pdbody"]]],
    ["연금은 뭘로?", [["🌱 개인연금 폼", "prop", '.pp-f[data-k="pension"]'], ["🏢 DC 폼", "prop", '.pp-f[data-k="dc"]'], ["🛡️ IRP 폼", "prop", '.pp-f[data-k="irp"]']]],
    ["목표 금액 되나요?", [["🎯 목표에서 거꾸로 · 폼마다 과거에 닿은 비율", "prop", ".pp-gl"], ["🎛 포트 설계기 · 비중 바꿔 다시 계산", "port", "#podz"]]],
    ["섞으면 어때요?", [["🧪 폼 둘 넘게 고르면 · 섞은 과거", "prop", ".pp-grid"]]],
    ["내 포트 괜찮아요?", [["🏁 시장 14곳과 비교", "port", "#pocmp"], ["🔬 내 돈 속 진짜 종목", "port", "#xrsec"], ["🎛 포트 설계기", "port", "#podz"]]],
    ["큰손들은 뭐 사요?", [["🐋 큰손 픽 · 오늘의 신호", "whale", "#wbody"], ["🎯 큰손이 새로 산 종목 · 그 뒤 성적", "whale", "#p4ws"], ["🔥 돈 몰리는 곳 · 집중 성적", "market", "#mkfo"]]],
    ["이번 주 일정은?", [["📅 이번 주 일정판 · 실적·지표", "market", "#pms"], ["🌙 밤사이 가장 크게 움직인 3가지", "market", "#pmo"]]]
  ];
  function settle(id){   // 탭이 늦게 그려지며 자리가 밀리면 한 번 더 맞춤
    [1300, 2600].forEach(function(t){ setTimeout(function(){ var el = document.getElementById(id); if (!el) return;
      var hd = document.querySelector("header"), jb = document.querySelector(".fold-jump"), off = (hd ? hd.offsetHeight : 0) + (jb ? jb.offsetHeight : 0) + 8, r = el.getBoundingClientRect();
      if (r.top < off - 30 || r.top > window.innerHeight * 0.45) window.scrollTo({top: Math.max(0, r.top + window.scrollY - off), behavior: "smooth"}); }, t); });
  }
  function jump(tab, sel){
    close();
    if (tab === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }   // 💬 11/10 #10
    if (!window.goTo){ if (window.go) go(tab); return; }
    if (sel.charAt(0) === "#" && sel.indexOf(" ") < 0){ goTo(tab, sel.slice(1)); settle(sel.slice(1)); return; }
    goTo(tab);
    var t0 = Date.now();
    (function f(){ var el = document.querySelector(sel);
      if (el){ if (!el.id) el.id = "ask" + Math.random().toString(36).slice(2, 7); goTo(tab, el.id); settle(el.id); return; }
      if (Date.now() - t0 < 8000) setTimeout(f, 200); })();
  }
  /* 🧊 11/09 ⑭ 질문형 검색 — 「브라질 국채 지금 어때」「삼성전자 컵이야?」처럼 쳐도 답 카드로. 사람이 고른 낱말표 · AI 없음(0원) */
  var QW = [
    [/브라질|헤알/, [["🇧🇷 브라질 국채 · 금리·헤알 · 전망 보고서", "bond", "#pdbody"]]],
    [/미국채|미 국채|달러 ?채권/, [["🇺🇸 미국채 · 지금 금리 · 전망", "bond", "#pdbody"]]],
    [/하락장|폭락|급락|바닥|현금/, [["🐻 하락장 계기판 · 바닥 신호", "home", "#bear"]].concat(ASK[3][1].slice(0, 2))],
    [/금리|국채|채권/, ASK[0][1]], [/els|ELS|이엘에스/i, ASK[1][1]], [/들어가|살까|사도|타이밍|매수/, ASK[2][1]], [/팔까|손절|매도/, ASK[3][1]],
    [/섹터|업종|테마|요즘|세요|센 ?거/, ASK[4][1]], [/환율|달러|원화/, ASK[5][1]], [/연금|irp|IRP|DC|퇴직/i, ASK[6][1]], [/목표|모으|노후/, ASK[7][1]],
    [/포트|비중|배분|뭐 ?사/, [["💼 지금 이렇게 담으면 돼요 · 비중", "port", "#porec"]].concat(ASK[9][1].slice(0, 2))], [/큰손|고래|기관|연기금/, ASK[10][1]], [/일정|cpi|CPI|실적|fomc|FOMC|고용/, ASK[11][1]],
    [/고객.*(물|질문)|뭐라고 (답|말)|팔아야|사도 돼/, [["💬 고객이 이렇게 물으면 · 오늘 숫자로 채운 답", "@qa", ""]]], [/달력|일정|실적 ?발표|이번 ?주/, [["📅 이번 주 경제 지표·실적 일정", "home", "#mncal"]]], [/배당|분배금|월배당|고배당/, [["💰 배당비교 · 종목·ETF 배당 나란히 (100만원 기준 · 언제 들어오나)", "divc", "#dvbody"]]], [/수급|외국인|외인|기관|순매수|쌍끌이/, [["🧲 국내 수급 · 외국인·기관 집중 매수", "flow", "#flrank"]]], [/확률|오를까|오르나|내릴까/, [["🎲 다음 장 오를 확률 · 한국장 기준", "prob", "#prbody"]]], [/제안서|제안|성향/, [["📝 고객 제안서 만들기 · 4단계", "prop", ".pp-pf"]]],
    [/한 ?장|보내|카톡/, [["📨 고객에게 한 장 보내기", "send", "#hub"]]], [/운세|사주|타로|로또/, [["🔮 오늘의 운세 · 사주 · 타로", "luck", "#main"]]],
    [/펀드|사모/, [["🧺 펀드 · 사모 라인업", "fund", "#pdbody"]]], [/컵|cup/i, [["☕ 컵 차트 · 돌파 임박", "cup", "#main"]]], [/갭/, [["📈 갭 상승 · 오늘 갭 지도", "gap", "#main"]]]
  ];
  var QSTOP = /(지금|요즘|오늘|어때요?|어떤가요?|어떻게|괜찮아요?|이야|인가요?|일까|이에요|예요|봐|보여|줘|좀|\?|？|컵(이야|인가|이에요)?|사도 ?돼|살까|팔까)/g;
  function stripQ(q){ return String(q).replace(QSTOP, " ").replace(/\s+/g, " ").trim(); }
  function qAnswers(q){
    if (!q || q.length < 2) return [];
    var out = [], seen = {};
    QW.forEach(function(w){ if (w[0].test(q)) w[1].forEach(function(d){ var k = d[1] + d[2]; if (!seen[k] && out.length < 4){ seen[k] = 1; out.push(d); } }); });
    if (/컵/.test(q) && window.opSearch){ var st = stripQ(q), r = st ? opSearch(st)[0] : null; if (r) out.unshift(["☕ " + r.name + " — 종목리포트에서 컵 여부·차트", "@op", r.sym]); }
    return out.slice(0, 4);
  }
  function askHTML(on){
    return '<div class="gs-ask"><div class="gs-ah">💬 고객이 물으면 <small>누르면 답이 있는 카드로</small></div><div class="gs-ac">' +
      ASK.map(function(a, i){ return '<button type="button" data-ask="' + i + '"' + (i === on ? ' class="on"' : '') + '>' + e(a[0]) + '</button>'; }).join("") + '</div>' +
      (on != null && ASK[on] ? '<div class="gs-ag">' + ASK[on][1].map(function(d, j){ return '<button type="button" data-aj="' + on + '_' + j + '">' + e(d[0]) + '<small>' + e({home: "오늘", market: "시장", sector: "시장 · 분위기", prob: "시장 · 확률", port: "포트", bond: "상품 · 채권", fund: "상품 · 펀드", els: "상품 · ELS", prop: "제안서", whale: "신호 · 큰손"}[d[1]] || d[1]) + ' ›</small></button>'; }).join("") +
        '<p class="gs-an">카드로 간 뒤 아래 「📨 보내기」를 누르면 그 화면을 한 장으로 보낼 수 있어요 · 참고용 · 사라·팔라는 뜻 아님</p></div>' : '') + '</div>';
  }
  /* 🔎 11/12 사용자 「어플 디자인을 자주 바꿔서 원하는 메뉴 찾기 힘드니, 메뉴 검색창도 하나 만들자」
     메뉴 이름·옛 이름(나침반·보내기·고래 …)·하는 일(배당, 풀버전, 나라별 섹터 …)·초성(ㅂㄷ)으로 찾음 → 누르면 그 화면·그 칸으로 바로
     길 안내(「🏠 오늘 › 시장 흐름」)는 nav2.js 의 지금 탭 묶음에서 그때그때 읽어서 — 화면 배치가 또 바뀌어도 맞게 나옴 */
  var MENU = [
    ["home", "", "🏠 오늘", "홈 첫화면 신호등 오늘한장 pb요약 아침 요약 5개 시장 업종 지도 오늘의 숫자"],
    ["market", "", "🌐 시황 리포트", "시황 리포트 아침 시황 주도 섹터 테마 돈 몰리는 곳 일정 카톡 요약 전략 대시보드"],
    ["market", "@pdf", "📄 시황 풀버전 PDF", "풀버전 전체 리포트 pdf 요약본 시황 리포트 원문 보고서"],
    ["sector", "", "🧭 시장 흐름 · 나라별 섹터", "나침반 나라별 섹터 업종 섹터 등락 로테이션 한국 미국 일본 중국 홍콩 5개 시장 국면 장 분위기 대장주 히트맵 모닝 섹터 브리핑"],
    ["feed", "", "📰 피드", "뉴스 블로그 텔레그램 네이버 블룸버그 기사"],
    ["diag", "", "🩻 포트 진단 한 장", "포트 진단 고객 보유 종목 쏠림 집중 분산 배당 고점 대비 타사 포트폴리오 점검 한장"],
    ["tax", "", "🧾 세무계산기", "세무 세금 계산기 절세 연말 절세 한 장 고객에게 보내기 금융소득종합과세 2000만 건보료 건강보험료 피부양자 지역가입자 연금저축 irp 세액공제 연말정산 퇴직소득세 퇴직금 연금 수령 1500만 해외주식 양도세 250만 isa 비과세 배당 분리과세"],
    ["sigall", "", "🎯 신호 한눈에", "신호 큰손 고래 컵 갭 오를 확률 한 화면 한눈에"],
    ["send", "", "📨 고객에게 한 장", "보내기 한장 카톡 문자 고객 그림 오늘 한 장 하락장 안내 이름 넣기"],
    ["@qa", "", "💬 고객이 이렇게 물으면", "고객 질문 답 25개 이슈 팔아야 사도 돼 상담"],
    ["prop", "", "📝 제안서", "제안서 투자제안 pdf ppt 심의 위험고지 성향 연금 irp dc 국고채 미국채 브라질 els 폼 회차 고르기 모의투자"],
    ["bond", "", "🏦 채권", "채권 국고채 미국채 브라질 국채 ntn 금리 만기 채권 전망 보고서 회사채"],
    ["fund", "", "📦 펀드", "펀드 사모 라인업 운용사 공모"],
    ["els", "", "🎯 ELS", "els elb 청약 낙인 ki 조기상환 관제탑"],
    ["divc", "", "💰 배당비교", "배당 배당률 배당금 백만원 언제 배당 고배당 etf 비교"],
    ["onepager", "", "🔍 종목 찾기 · 종목리포트", "종목 검색 종목리포트 원페이저 티커 차트"],
    ["flow", "", "🧲 수급", "수급 외국인 기관 순매수 집중 매수 연기금"],
    ["lab", "", "🔬 연구실", "연구실 연구 신호 더보기 숨은 메뉴"],
    ["port", "", "💼 포트", "포트 자산배분 배분표 비중 공격 킥 집중 기본 포트 설계기 세금 뭘 얼마나 사"],
    ["score", "", "📊 성적표", "성적표 채점 수익률 예고 맞음 틀림"],
    ["prob", "", "🎲 오를 확률", "시장확률 확률 내일 오를 확률 닮은 날"],
    ["whale", "", "🐋 큰손", "고래 큰손 whale 기관 유명 투자자 13f 보유"],
    ["cup", "", "☕ 컵 차트", "컵 컵앤핸들 돌파"],
    ["gap", "", "📈 갭 상승", "갭 상승 돌파"],
    ["screen", "", "🔎 종목 거르기", "거르기 스크리너 거름망"],
    ["sigmore", "", "🗂 신호 더 보기", "더 보기 예측 채점 상세 매집"],
    ["@bubble", "", "🕰 버블 시계 · 🐻 하락장 계기판", "버블 시계 하락장 계기판 현금 비중 곰 신용 경보 언제 다시 사나 바닥 신호 채권형"],
    ["@season", "", "🧭 계절 시계", "계절 시계 5개국 지수 흐름 3개월 뒤"],
    ["@sigprob", "", "🎯 신호 확률판", "신호 확률판 경고 신호 바닥 신호 확률"],
    ["@analog", "", "🔁 닮은 장", "닮은 장 비슷한 과거 백테스트"],
    ["@bt40", "", "📏 40주선 백테스트", "40주 이동평균 백테스트"],
    ["luck", "", "🔮 오늘의 운세", "운세 오늘의 운세 투자운"],
    ["saju", "", "📜 사주 리포트", "사주 별자리"],
    ["tarot", "", "🃏 타로", "타로 카드"],
    ["lotto", "", "🎱 로또", "로또 번호"],
    ["@wlbtn", "", "★ 관심종목", "관심종목 즐겨찾기 내 종목 별"],
    ["@uibtn", "", "⚙️ 보기 설정", "설정 글자 크기 글씨 화면 색 다크 밝게"],
    ["alarm", "", "🔔 알림", "알림 푸시 켜기 끄기"],
    ["idea", "", "💬 의견함", "의견 바라는 점 건의"],
    ["@help", "", "🙋 뭐 보면 돼요?", "도움말 사용법 처음 궁금"]
  ];
  var CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  function cho(t){ return String(t).replace(/[가-힣]/g, function(c){ return CHO.charAt(Math.floor((c.charCodeAt(0) - 0xAC00) / 588)); }); }
  function nz(t){ return String(t || "").toLowerCase().replace(/[\s·›\-_]/g, "").replace(/[^\w가-힣ㄱ-ㅎ]/g, ""); }
  function navName(k){ var N = window.__navMap; return (N && N.lab && N.lab[k]) || null; }
  function menuPath(k){
    if (k === "@qa") return "📨 고객에게 한 장 › 질문 답";
    if (/^@(bubble|season|sigprob|analog)$/.test(k)) return "🏠 오늘 › 자세히 보기 안";
    if (k === "@bt40") return "🔬 연구실 › 연구";
    if (/^@(wlbtn|uibtn)$/.test(k)) return "맨 위 오른쪽";
    if (k === "@help") return "꼬마 얼굴 누르기";
    var N = window.__navMap, G = (N && N.groups) || [];
    for (var i = 0; i < G.length; i++) if (G[i].tabs.indexOf(k) >= 0){ var g = G[i], nm = navName(k);
      if (g.tabs.length < 2) return "아래 탭 " + g.ic + " " + g.t;
      return (g.hide ? "🔬 연구실" : "아래 탭 " + g.ic + " " + g.t) + " › 위쪽 칸 「" + String(nm || k).replace(/^\S+\s/, "") + "」"; }
    return "🔬 연구실 안";
  }
  function msearch(q){
    var a = nz(q); if (!a) return [];
    var isCho = /^[ㄱ-ㅎ]+$/.test(a), out = [];
    MENU.forEach(function(m, i){
      var nm = navName(m[0]), t = nz(m[2] + " " + (m[1] ? "" : nm || "")), kw = nz(m[3]), sc = 0;
      if (isCho){ var ct = cho(t), ck = cho(kw); sc = ct.indexOf(a) === 0 ? 6 : ct.indexOf(a) >= 0 ? 4 : ck.indexOf(a) >= 0 ? 2 : 0; }
      else sc = t.indexOf(a) === 0 ? 10 : t.indexOf(a) >= 0 ? 8 : kw.indexOf(a) >= 0 ? 5 : (a.length >= 2 && a.split("").every(function(c){ return kw.indexOf(c) >= 0; }) && kw.indexOf(a.slice(0, 2)) >= 0 ? 1 : 0);
      if (sc) out.push({i: i, sc: sc}); });
    return out.sort(function(x, y){ return y.sc - x.sc || x.i - y.i; }).slice(0, 6).map(function(o){ var m = MENU[o.i]; return {k: m[0], sel: m[1], t: m[1] ? m[2] : (navName(m[0]) && !/^@/.test(m[0]) && m[2].indexOf("·") < 0 ? navName(m[0]) : m[2]), sc: o.sc}; });
  }
  function menuGo(k, sel){
    close();
    try { if (window.ntfyUse) ntfyUse("menu_find"); } catch(z) {}
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }
    if (k.charAt(0) === "@" && window.__hubGo){ __hubGo(k);
      var tid = {"@bubble": "bubble", "@season": "season", "@sigprob": "sigprob", "@analog": "analog"}[k];   // 위 카드가 늦게 그려지며 밀리면 다시 맞춤
      if (tid) [1500, 3000, 4500].forEach(function(t){ setTimeout(function(){ var x = document.getElementById(tid); if (x){ var r = x.getBoundingClientRect(); if (Math.abs(r.top - 70) > 120) window.scrollTo({top: Math.max(0, r.top + window.scrollY - 70), behavior: "smooth"}); } }, t); });
      return; }
    if (typeof window.go === "function"){ window.go(k); window.scrollTo(0, 0); }   // ⚠ 이 파일 안의 go() 는 종목 열기라 window.go 로
    if (sel === "@pdf"){ var t0 = Date.now(); (function f(){ var b = [].filter.call(document.querySelectorAll("#main .fold, #main button, #main summary"), function(x){ return /전체 리포트/.test(x.textContent); })[0];
      if (b){ var hid = b.closest(".ez-cap-hid") || (b.classList.contains("ez-cap-hid") ? b : null); if (hid) hid.classList.remove("ez-cap-hid");   // 「더 보기」 밑에 숨어 있어도 꺼내서
        b.scrollIntoView({behavior: "smooth", block: "center"}); b.classList.add("ms-hi"); setTimeout(function(){ b.classList.remove("ms-hi"); }, 2600); return; }
      if (Date.now() - t0 < 8000) setTimeout(f, 250); })(); }
  }
  function menuHTML(list){
    return list.length ? '<div class="gs-mn"><div class="gs-ah">📍 메뉴 <small>누르면 바로 그 화면으로</small></div>' + list.map(function(m, j){
      return '<button type="button" data-mn="' + j + '"><b>' + e(m.t) + '</b><small>' + e(menuPath(m.k)) + '</small></button>'; }).join("") + '</div>' : '';
  }
  var MCHIP = [["시황 풀버전", "market", "@pdf"], ["나라별 섹터", "sector", ""], ["고객에게 한 장", "send", ""], ["제안서", "prop", ""], ["배당비교", "divc", ""], ["채권", "bond", ""], ["포트", "port", ""], ["버블 시계", "@bubble", ""]];
  function mchipHTML(){ return '<div class="gs-ask gs-mc"><div class="gs-ah">📍 자주 찾는 메뉴 <small>위 칸에 메뉴 이름·하는 일을 쳐도 돼요 (예: 배당, 풀버전, ㅅㅎ)</small></div><div class="gs-ac">' +
    MCHIP.map(function(c, i){ return '<button type="button" data-mc="' + i + '">' + e(c[0]) + '</button>'; }).join("") + '</div></div>'; }
  function open(mode){
    if (document.getElementById("gsq")) return;
    var o = document.createElement("div"); o.id = "gsq";
    o.innerHTML = '<div class="gs-box"><div class="gs-row"><input aria-label="종목명·코드" id="gsin" type="search" placeholder="메뉴·종목·질문 (예: 배당, 섹터, 삼전, ㅅㅅㅈㅈ)" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="gs-x" aria-label="닫기">✕</button></div>' +
      '<div id="gsmc">' + mchipHTML() + '</div><div id="gsask"></div><div id="gsres" class="gs-res"><div class="gs-hint">종목 목록 불러오는 중…</div></div></div>';
    document.body.appendChild(o); document.body.classList.add("gs-open");
    o.addEventListener("click", function(ev){ if (ev.target === o) close(); });
    o.querySelector(".gs-x").onclick = close;
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres");
    var ask = document.getElementById("gsask"), aOn = null, mc = document.getElementById("gsmc"), ML = [];
    function drawAsk(){ ask.innerHTML = askHTML(aOn); ask.style.display = inp.value.trim() ? "none" : ""; mc.style.display = inp.value.trim() ? "none" : ""; }
    mc.onclick = function(ev){ var t = ev.target.closest && ev.target.closest("[data-mc]"); if (!t) return; var c = MCHIP[+t.dataset.mc]; menuGo(c[1], c[2]); };
    res.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-mn]"); if (!t) return; var m = ML[+t.dataset.mn]; if (m) menuGo(m.k, m.sel); });
    ask.onclick = function(ev){ var t = ev.target.closest && ev.target.closest("button"); if (!t) return;
      if (t.dataset.ask != null){ aOn = aOn === +t.dataset.ask ? null : +t.dataset.ask; drawAsk(); try { if (window.ntfyUse) ntfyUse("ask_chip"); } catch(z) {} return; }
      if (t.dataset.aj){ var q = t.dataset.aj.split("_"), d = ASK[+q[0]][1][+q[1]]; jump(d[1], d[2]); } };
    drawAsk();
    setTimeout(function(){ inp.focus(); }, 30);
    var ready = false;
    (window.opLoadIdx ? opLoadIdx() : Promise.reject()).then(function(){ ready = true; res.innerHTML = '<div class="gs-hint">이름이나 코드를 치면 바로 찾아요 · 엔터 = 첫 번째 종목</div>'; if (inp.value) draw(); })
      .catch(function(){ res.innerHTML = '<div class="gs-hint">목록을 못 불러왔어요. 잠시 뒤 다시.</div>'; });
    function draw(){
      var q0 = inp.value.trim(); if (!q0){ res.innerHTML = ""; return; }
      ML = msearch(q0); var mh = menuHTML(ML);
      var qa = qAnswers(q0), qh = mh + (qa.length ? '<div class="gs-qa"><div class="gs-ah">💬 이 질문의 답 <small>누르면 그 카드로</small></div>' + qa.map(function(d, j){ return '<button type="button" data-qa="' + j + '">' + e(d[0]) + '</button>'; }).join("") + '</div>' : '');
      if (!ready){ res.innerHTML = qh || '<div class="gs-hint">종목 목록 불러오는 중…</div>'; bindQa(qa); return; }
      var q = stripQ(q0) || q0;
      var r0 = opSearch(q), fz = r0.fz || {}, r = r0.slice(0, qa.length ? 6 : 12), FL = window.FLAG || {};   // 🔎 11/12 줄임말·초성·한/영·철자 표시
      res.innerHTML = qh + (r.length ? r.map(function(x){
        return '<button data-s="' + e(x.sym) + '">' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b>' + (x.etf ? ' <span class="gs-etf">ETF</span>' : '') + (fz[x.sym] ? ' <span class="fzb">' + e(typeof fz[x.sym] === "string" ? fz[x.sym] : "비슷한 발음") + '</span>' : '') +
          '<small>' + e(window.V && V.cd ? V.cd(x.sym) : x.sym) + (x.built ? '' : ' · 준비 중') + '</small></button>'; }).join("")
        : (qa.length || ML.length ? '' : '<div class="gs-hint">「' + e(q0) + '」 — 찾는 메뉴·종목·질문이 없어요 · 예: 「브라질 국채 지금 어때」「하락장이면?」</div>'));
      [].forEach.call(res.querySelectorAll("button[data-s]"), function(b){ b.onclick = function(){ go(b.dataset.s); }; });
      bindQa(qa);
    }
    function bindQa(qa){ [].forEach.call(res.querySelectorAll("button[data-qa]"), function(b){ b.onclick = function(){ var d = qa[+b.dataset.qa]; try { if (window.ntfyUse) ntfyUse("ask_free"); } catch(z) {} if (d[1] === "@op") go(d[2]); else jump(d[1], d[2]); }; }); }
    inp.oninput = function(){ draw(); ask.style.display = mc.style.display = inp.value.trim() ? "none" : ""; };
    inp.onkeydown = function(ev){
      if (ev.key === "Escape") close();
      if (ev.key === "Enter"){ var mm = msearch(inp.value.trim()); if (mm.length && mm[0].sc >= 8){ menuGo(mm[0].k, mm[0].sel); return; } var qa = qAnswers(inp.value.trim()); if (qa.length && qa[0][1] !== "@op"){ jump(qa[0][1], qa[0][2]); return; } if (ready){ var r = opSearch(stripQ(inp.value.trim()) || inp.value.trim())[0]; if (r) go(r.sym); } }
    };
  }
  window.gsOpen = open;
  window.__menuFind = msearch;
  function bar(){
    var k = typeof cur !== "undefined" ? cur : null, m = document.getElementById("main");
    if (!m || ["home", "lab", "send"].indexOf(k) < 0 || document.getElementById("msbar")) return;
    var b = document.createElement("button"); b.type = "button"; b.id = "msbar";
    b.innerHTML = '<span>🔎</span><b>메뉴 찾기</b><small>배당 · 나라별 섹터 · 시황 풀버전 · 종목 …</small>';
    b.onclick = function(){ open(); };
    m.insertBefore(b, m.firstChild);
  }
  function watch(){ var m = document.getElementById("main"); if (!m){ setTimeout(watch, 500); return; } new MutationObserver(function(){ if (!document.getElementById("msbar")) bar(); }).observe(m, {childList: true}); bar(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
  window.__gsAsk = {list: ASK, jump: jump};   // 11/05 📋 받은 글 → 답장 한 장(ux1105b)이 답 카드 칩을 같이 씀
  function addBtn(){
    var top = document.querySelector("header .top"); if (!top || document.getElementById("gsbtn")) return;
    var b = document.createElement("button"); b.id = "gsbtn"; b.setAttribute("aria-label", "메뉴·종목 찾기"); b.innerHTML = "🔍";
    b.onclick = open;
    var ref = document.getElementById("wlbtn") || document.getElementById("stamp");
    top.insertBefore(b, ref);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addBtn); else addBtn();
  setTimeout(addBtn, 800);
  var css = document.createElement("style");
  css.textContent =
    "#gsbtn{margin-left:auto;margin-right:6px;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:6px 10px;font:inherit;font-size:15px;cursor:pointer}" +
    "#gsbtn + #wlbtn{margin-left:0}" +
    "#gsq{position:fixed;inset:0;z-index:9999;background:rgba(5,8,14,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);padding:calc(env(safe-area-inset-top) + 10px) 12px 12px}" +
    ".gs-box{max-width:560px;margin:0 auto;background:var(--panel);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.5)}" +
    ".gs-row{display:flex;gap:8px;padding:10px;border-bottom:1px solid var(--line)}" +
    "#gsin{flex:1;min-width:0;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:11px 12px;font:inherit;font-size:16px}" +
    ".gs-x{border:0;background:none;color:var(--sub);font-size:18px;padding:0 6px;cursor:pointer}" +
    ".gs-res{max-height:65vh;overflow-y:auto}.gs-res button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);padding:11px 14px;font:inherit;font-size:15px;cursor:pointer}" +
    ".gs-res button:active{background:var(--panel2)}.gs-res small{display:block;color:var(--sub);font-size:12.5px;margin-top:1px}" +
    ".gs-etf{font-size:12.5px;background:#5ac8fa;color:#111;border-radius:5px;padding:0 5px;font-weight:800}.gs-hint{padding:14px;color:var(--sub);font-size:13.5px}" +
    ".gs-qa{padding:10px 10px 6px;border-bottom:1px solid var(--line)}.gs-qa button{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px 12px;margin-top:6px;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}" +
    ".gs-ask{padding:10px 10px 4px;border-bottom:1px solid var(--line)}.gs-ah{font-size:13.5px;font-weight:800;margin:0 2px 7px}.gs-ah small{font-weight:500;color:var(--sub);font-size:12px;margin-left:4px}" +
    ".gs-ac{display:flex;flex-wrap:wrap;gap:6px}.gs-ac button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:7px 11px;font:inherit;font-size:13.5px;cursor:pointer}" +
    ".gs-ac button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}" +
    ".gs-ag{margin:8px 0 4px;border:1px solid var(--line);border-radius:12px;overflow:hidden}.gs-ag button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);padding:10px 12px;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}" +
    ".gs-mn{padding:10px 10px 6px;border-bottom:1px solid var(--line)}.gs-mn button{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px 12px;margin-top:6px;font:inherit;font-size:15px;cursor:pointer}.gs-mn button b{font-weight:800}.gs-mn button small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}" +
    ".gs-mc{border-bottom:1px solid var(--line)}" +
    "#msbar{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 12px;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:14px;padding:12px 14px;font:inherit;text-align:left;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.05)}#msbar span{font-size:17px}#msbar b{font-size:15px;font-weight:800;flex:none}#msbar small{color:var(--sub);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}" +
    ".ms-hi{outline:3px solid #3182f6;outline-offset:3px;border-radius:12px;transition:outline-color .4s}" +
    ".gs-ag button small{display:block;font-weight:500;color:var(--sub);font-size:12px;margin-top:1px}.gs-ag button:active{background:var(--panel2)}.gs-an{font-size:11.5px;color:var(--sub);margin:0;padding:8px 12px;line-height:1.45}";
  document.head.appendChild(css);
})();
;
/* ======== brain.js ======== */
/* 🧠 시황 두뇌 카드 (10/9) — 매시간 검토가 쌓는 brain/state.json 을 피드·포트 탭 위에 보여 준다 */
(function(){
  var U = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/brain/state.json";
  // 10/29 사용자 「여기도 맨날 안 바뀌는 거 같아」 — 두뇌(state.json)는 매시간 쓰지만 선제 아이디어의 진행·채점은 10/27 뒤로 옮겨 적지 않아 멈춰 보였음.
  //   시세 채점은 GitHub Actions(bets_score.json)가 매시간 하므로, 화면에서 그 값을 바로 덮어씀 + 승패도 닫힌 기록에서 직접 셈
  var USC = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bets_score.json";
  function pctOf(res){ var m = String(res || "").match(/([+\-−]\s?\d+(?:\.\d+)?)\s*%/); return m ? parseFloat(m[1].replace("−", "-").replace(/\s/g, "")) : null; }
  function merge(B, S){
    if (!B) return B;
    var live = {}, closedS = {};
    ((S && S.bets) || []).forEach(function(x){ if (x.st === "열림" || x.st === "대기") live[x.id || x.t] = x; else closedS[x.id || x.t] = x; });
    (B.bets || []).forEach(function(b){ var x = live[b.id] || live[b.t]; if (x && b.status === "열림"){ b.res = x.res; b.now = x.now; b.r = x.r; b._live = 1; }
      var c = closedS[b.id]; if (c && b.status === "열림"){ b.status = "닫힘"; b.res = c.res; } });
    var rs = []; (B.bets || []).forEach(function(b){ if (b.status === "닫힘"){ var r = pctOf(b.res); if (r != null) rs.push(r); } });
    if (rs.length){ B.scorecard = B.scorecard || {}; B.scorecard.bets = {made: (B.bets || []).filter(function(b){ return b.t; }).length, win: rs.filter(function(r){ return r > 0; }).length, loss: rs.filter(function(r){ return r < 0; }).length, avg: Math.round(rs.reduce(function(a, b){ return a + b; }, 0) / rs.length * 10) / 10}; }
    B._scAt = S && S.at;
    return B;
  }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function card(B, full){
    if (!B || !B.last_review) return '<section class="card br"><div class="br-h">🧠 지금 생각 <small>매시간 검토 · 첫 검토 준비 중</small></div></section>';
    var th = (B.theses || []).slice().sort(function(a, b){ return (b.conf || 0) - (a.conf || 0); });
    var sc = B.scorecard || {};
    var h = '<section class="card br"><div class="br-h">🧠 지금 생각 <small>' + e(B.last_review.slice(5).replace("-", "/")) + ' 검토' + (function(){ var a = Math.round((Date.now() - Date.parse(String(B.last_review).replace(" ", "T") + ":00+09:00")) / 60000); return isNaN(a) || a < 0 ? '' : a < 60 ? ' · ' + a + '분 전' : ' · <b class="dn">⏳ ' + (a < 120 ? a + '분' : Math.round(a / 60) + '시간') + ' 전</b>'; })() + (B.regime ? ' · ' + e(B.regime) : '') +
      (sc.made ? ' · 논지 채점 ' + (sc.right || 0) + '/' + ((sc.right || 0) + (sc.wrong || 0)) : '') + '</small></div>' +
      '<div class="br-s">' + e(B.summary) + '</div>';
    if (th.length) h += '<div class="br-t">' + th.slice(0, full ? 5 : 3).map(function(t){
      var c = Math.round((t.conf || 0) * 100);
      return '<div class="br-ti"><div class="br-bar"><i style="width:' + c + '%"></i></div><div><b>' + e(t.t) + '</b> <small>' + c + '%</small>' +
        (full ? '<em>' + e(t.why || "") + (t.breaks ? ' · 깨지면: ' + e(t.breaks) : '') + '</em>' : '') + '</div></div>'; }).join("") + '</div>';
    var bets = (B.bets || []).filter(function(x){ return x.status === "열림"; }).slice(0, full ? 5 : 2), bs = (sc.bets || {});
    if (bets.length || bs.made) h += '<div class="br-b"><div class="br-bh">⚡ 선제 아이디어 <small>채점 ' + (bs.win || 0) + '승 ' + (bs.loss || 0) + '패' + (bs.avg != null ? ' · 평균 ' + (bs.avg > 0 ? '+' : '') + bs.avg + '%' : '') + (B._scAt ? ' · 시세 ' + e(String(B._scAt).slice(5).replace("-", "/")) : '') + '</small></div>' +
      bets.map(function(x){ return '<div class="br-bi"' + (x.t ? ' data-op="' + e(x.t) + '"' : '') + '><b>' + e(x.name || x.t) + (x.t ? ' <i class="po-go">›</i>' : '') + '</b> <span class="' + (x.dir === "오름" ? "up" : "dn") + '">' + e(x.dir) + '</span> <small>' + e(x.entry) + ' → ' + e(x.target) + ' · 손절 ' + e(x.stop) + ' · ' + e(x.horizon) + '</small>' +
        (x.res ? '<div style="font-size:12.5px;margin-top:2px"><b class="' + ((x.r != null ? x.r : pctOf(x.res)) >= 0 ? "up" : "dn") + '">' + e(String(x.res).replace(/^진행/, "지금")) + '</b>' + (x.now ? ' <small>· 현재가 ' + e(x.now) + '</small>' : '') + '</div>' : '') +
        (full ? '<em>' + e(x.edge || x.why || "") + '</em>' : '') + '</div>'; }).join("") + '</div>';
    var pi = B.port_ideas || [];
    if (pi.length) h += '<div class="br-p">💼 포트 제안 · ' + pi.slice(0, 4).map(function(p){ return '<b>' + e(p["칸"] || p.k || "") + '</b> ' + e(p["제안"] || p.s || "") + (p["얼마"] && +p["얼마"] !== 0 ? ' ' + e((+p["얼마"] > 0 ? '+' : '') + p["얼마"]) + '%p' : ''); }).join(" · ") + '</div>';
    if (full && (B.watch || []).length) h += '<div class="br-w">👀 ' + B.watch.slice(0, 4).map(function(w){ return e(w && typeof w === "object" ? (w.t || w.title || "") : w); }).join("<br>👀 ") + '</div>';
    return h + '<div class="br-n">아침 시황리포트가 이 생각을 채점하고 포트에 반영해요 · 매수 추천 아님</div></section>';
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#fdbrain [data-op]");
    if (t && window.openOP){ ev.preventDefault(); openOP(t.getAttribute("data-op")); }
  });
  window.brainCard = function(box, full){
    if (!box) return;
    var j = function(u){ return fetch(u + "?" + Date.now()).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); };
    Promise.all([j(U), j(USC)]).then(function(a){ box.innerHTML = card(merge(a[0], a[1]), full); }).catch(function(){});
  };
  var css = document.createElement("style");
  css.textContent =
    ".br{border:1px solid rgba(124,156,255,.35);background:linear-gradient(160deg,rgba(124,156,255,.12),rgba(18,24,38,.3) 70%);margin-bottom:10px}" +
    ".br-h{font-weight:800;font-size:15px}.br-h small{font-weight:400;color:var(--sub);font-size:12.5px;margin-left:4px}" +
    ".br-s{font-size:14px;line-height:1.55;margin:6px 0 4px}" +
    ".br-ti{display:flex;gap:8px;align-items:flex-start;padding:5px 0;font-size:13px}.br-ti small{color:var(--sub)}.br-ti em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}.br-ti>div:last-child{flex:1;min-width:0}.br-ti b,.br-ti em{overflow-wrap:anywhere}" +
    ".br-bar{flex:none;width:34px;height:6px;border-radius:3px;background:var(--panel2);margin-top:7px;overflow:hidden}.br-bar i{display:block;height:100%;background:#7c9cff}" +
    ".br-b{margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3)}.br-bh{font-size:13px;font-weight:800}.br-bh small{font-weight:400;color:var(--sub);margin-left:4px}" +
    ".br-bi{font-size:13px;padding:4px 0}.br-bi[data-op]{cursor:pointer}.br-bi .po-go{font-style:normal;color:#ff6b6b;font-weight:800}.br-bi small{color:var(--sub)}.br-bi em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".br-p{font-size:12.5px;margin-top:6px;padding:7px 9px;border-radius:9px;background:rgba(233,196,106,.1)}.br-w{font-size:12.5px;color:var(--sub);margin-top:6px;line-height:1.6}" +
    ".br-n{font-size:12.5px;color:var(--dim);margin-top:6px}";
  document.head.appendChild(css);
})();
;
/* ======== feed.js ======== */
/* 📰 내 피드 (10/9) — 매일 보는 네이버 블로그 + 텔레그램 채널을 한 곳에
   자료: market-strategy-report/feeds/my_feed.json (매시간 :40 수집) · feeds/feed_score.json (📣 채널 성적표, 10/20)
   · 위: 출처 칩(누르면 그 출처만) · 🎯 집중 연결 · 📌 모아 둔 글 · 검색
   · 🎯 = 오늘의 집중 테마·종목 이름이 들어간 글, 📝 = 아침 시황리포트가 인용한 글
   · ⭐ 10/21: 🔴 핵심·🟡 주목 = 🧠 두뇌가 매시간 고른 중요 글(feeds/hot.json) — 색 테두리·이유 한 줄·맨 위 「지금 꼭 볼 글」
   · 글을 누르면 펼침, 📌 로 모아 두기(이 기기에만), 「원문」으로 블로그·텔레그램 열기 */
(function(){
  var RAWF = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var S = {d: null, f: "ALL", q: "", kw: [], used: {}, open: {}, gopen: {}, hot: {}};
  var PIN = {};
  try { PIN = JSON.parse(localStorage.getItem("feedpin") || "{}"); } catch(e) {}
  function savePin(){ try { localStorage.setItem("feedpin", JSON.stringify(PIN)); } catch(e) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  var IC = {tg: "✈️", blog: "🅽", news: "🌐", ai: "🧠"};
  function K_OF(i){ return i.kind === "news" ? "news" : i.kind === "ai" ? "ai" : "mine"; }
  var WDS = ["일","월","화","수","목","금","토"];
  function dayLab(d){
    var t = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    var y = new Date(Date.now() + 9 * 3600e3 - 86400e3).toISOString().slice(0, 10);
    var w = WDS[new Date(d + "T00:00:00+09:00").getDay()];
    return (d === t ? "오늘" : d === y ? "어제" : d.slice(5).replace("-", "/")) + " (" + w + ")";
  }

  window.feedView = function(){
    setTimeout(function(){ if (window.brainCard) brainCard(document.getElementById("fdbrain"), true); }, 0);
    return '<div id="fdbrain"></div><div class="fd-top"><div class="fd-src" id="fdsrc"></div>' +
      '<input aria-label="검색" id="fdq" class="fd-q" type="search" placeholder="🔎 검색 (예: 반도체, TSMC, 금리)"></div>' +
      '<div id="fdbody"><div class="loading">블로그·텔레그램 불러오는 중…</div></div>';
  };

  window.feedInit = function(){
    var t = Date.now();
    Promise.all([
      fetch(RAWF + "feeds/my_feed.json?" + t).then(function(r){ return r.json(); }),
      fetch(RAWF + "market/focus.json?" + t).then(function(r){ return r.json(); }).catch(function(){ return null; }),
      fetch(RAWF + "feeds/used.json?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
      fetch(RAWF + "feeds/feed_score.json?" + Math.floor(t / 600000)).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
      fetch(RAWF + "feeds/hot.json?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })
    ]).then(function(a){
      S.hot = a[4] && a[4].items ? a[4].items : {};
      S.hotAt = a[4] && a[4].at;
      S.sc = a[3] && a[3].ch ? a[3] : null;
      S.d = a[0];
      S.kw = keywords(a[1]);
      S.used = {};
      if (a[2] && a[2].items) a[2].items.forEach(function(u){ S.used[u.id] = u.why || "시황리포트 인용"; });
      S.usedDate = a[2] && a[2].date;
      S.usedInfo = a[2] || null;
      draw();
    }).catch(function(){ var b = document.getElementById("fdbody"); if (b) b.innerHTML = '<div class="empty">피드를 아직 못 가져왔어요. 잠시 뒤 다시 열어 주세요.</div>'; });
    var q = document.getElementById("fdq");
    if (q) q.oninput = function(){ S.q = q.value.trim().toLowerCase(); S.lim = 40; list(); };
  };

  // 🎯 오늘의 집중에서 테마·종목 이름 뽑기 → 글에 들어 있으면 표시
  function keywords(F){
    var k = [];
    if (!F) return k;
    (F.themes || []).forEach(function(t){
      (t.name || "").split(/[·\/,()\s]+/).forEach(function(w){ if (w.length >= 2) k.push({w: w, t: t.name}); });
      (t.us || []).concat(t.kr || []).forEach(function(x){
        var n = (x.name || "").replace(/\(.*\)/, "").trim();
        if (n.length >= 2) k.push({w: n, t: t.name});
        if (x.t && /^[A-Z]{2,5}$/.test(x.t)) k.push({w: x.t, t: t.name, exact: 1});
      });
    });
    return k;
  }
  function hits(it){
    var s = (it.title + " " + it.text), out = [];
    S.kw.forEach(function(k){
      var ok = k.exact ? new RegExp("(^|[^A-Za-z])" + k.w + "([^A-Za-z]|$)").test(s) : s.indexOf(k.w) >= 0;
      if (ok && out.indexOf(k.w) < 0) out.push(k.w);
    });
    return out.slice(0, 4);
  }

  function draw(){
    var d = S.d, srcEl = document.getElementById("fdsrc");
    if (!srcEl) return;
    d.items.forEach(function(it){ it._h = hits(it); });
    var nF = d.items.filter(function(i){ return i._h.length; }).length;
    var nP = d.items.filter(function(i){ return PIN[i.id]; }).length;
    var nU = d.items.filter(function(i){ return S.used[i.id]; }).length;
    var nH = d.items.filter(function(i){ return S.hot[i.id]; }).length;
    var nH2 = d.items.filter(function(i){ return S.hot[i.id] && S.hot[i.id].lv >= 2; }).length;
    var chips = [{k: "ALL", t: "전체 " + d.items.length}];
    if (nH) chips.push({k: "HOT", t: "⭐ 중요 " + nH + (nH2 ? " · 🔴" + nH2 : ""), hot: 1});
    if (nU) chips.push({k: "USED", t: "📝 리포트 인용 " + nU});
    chips.push({k: "FOCUS", t: "🎯 집중 연결 " + nF});
    chips.push({k: "PIN", t: "📌 " + nP});
    if (S.sc) chips.push({k: "SCORE", t: "📣 채널 성적표"});
    var cnt = function(k){ return d.items.filter(function(i){ return K_OF(i) === k; }).length; };
    [["K:mine", "📝 블로그·텔레그램"], ["K:news", "🌐 뉴스"], ["K:ai", "🧠 AI가 찾은 글"]].forEach(function(x){ var n = cnt(x[0].slice(2)); if (n) chips.push({k: x[0], t: x[1] + " " + n}); });
    // 출처 칩: 고른 묶음(📝/🌐/🧠)의 출처만 (10/10 뉴스 50곳 — 한 줄에 다 늘어놓지 않게)
    var cur = S.f.indexOf("K:") === 0 ? S.f.slice(2) : (function(){ var x = d.sources.filter(function(s){ return s.id === S.f; })[0]; return x ? K_OF(x) : "mine"; })();
    var SRC = d.sources.filter(function(s){ return K_OF(s) === cur; }).sort(function(x, y){ return (y.n || 0) - (x.n || 0); });
    SRC.forEach(function(s){ var g = scOf(s.id); chips.push({k: s.id, t: IC[s.kind] + " " + s.name.replace(/\s*\(.*\)/, "") + " " + s.n + (g && g.n5 >= MINN ? " · 📣" + g.up5 + "%" : ""), bad: !s.ok}); });
    var chip = function(c){ return '<button class="fd-chip' + (S.f === c.k ? " on" : "") + (c.bad ? " bad" : "") + (c.hot ? " hot" : "") + '" data-fk="' + e(c.k) + '">' + e(c.t) + '</button>'; };
    var nTop = chips.length - SRC.length;
    srcEl.innerHTML = '<div class="fd-row">' + chips.slice(0, nTop).map(chip).join("") + '</div><div class="fd-row">' + chips.slice(nTop).map(chip).join("") + '</div>' +
      '<div class="fd-meta">' + e(d.at.slice(5).replace("-", "/")) + ' 모음 · 매시간 :40 · 7일치</div>' +
      (S.usedInfo && S.usedInfo.date ? '<div class="fd-sel">📝 ' + e(S.usedInfo.date.slice(5).replace("-", "/")) + ' 시황리포트: 글 <b>' + (S.usedInfo.read || "–") + '개</b> 읽고 <b>' + nU + '개</b> 골라 반영' +
        (S.usedInfo.skip ? '<small>안 쓴 이유: ' + e(S.usedInfo.skip) + '</small>' : '') + '</div>' : '');
    [].forEach.call(srcEl.querySelectorAll("[data-fk]"), function(b){ b.onclick = function(){ S.f = b.getAttribute("data-fk"); S.lim = 40; draw(); }; });
    list();
  }

  function pass(it){
    if (S.f === "SCORE") return false;
    if (S.f === "FOCUS" && !it._h.length) return false;
    if (S.f === "HOT" && !S.hot[it.id]) return false;
    if (S.f === "PIN" && !PIN[it.id]) return false;
    if (S.f === "USED" && !S.used[it.id]) return false;
    if (/^K:/.test(S.f)){ if (K_OF(it) !== S.f.slice(2)) return false; }
    else if (["ALL", "FOCUS", "PIN", "USED", "SCORE", "HOT"].indexOf(S.f) < 0 && it.src !== S.f) return false;
    if (S.q && (it.title + " " + it.text + " " + it.name).toLowerCase().indexOf(S.q) < 0) return false;
    return true;
  }

  function card(it, news){
      var long = it.text.length > 150, op = S.open[it.id];
      var body = e(it.text).replace(/\n/g, "<br>");
      S.kw.length && it._h.forEach(function(w){ body = body.split(e(w)).join('<mark>' + e(w) + '</mark>'); });
      var hv = S.hot[it.id];
      return '<div class="fd-it fd-' + (it.kind || "bl") + (hv ? " fd-h" + (hv.lv >= 2 ? 2 : 1) : "") + '" data-fid="' + e(it.id) + '">' +
        '<div class="fd-hd"><span class="fd-sn">' + (IC[it.kind] || "🅽") + " " + e(it.name.replace(/\s*\(.*\)/, "")) + (it.press ? ' <small class="fd-press">· ' + e(it.press) + '</small>' : '') + '</span>' +
        hotTag(hv) + '<span class="fd-tm">' + e((it.at || "").slice(11)) + '</span>' + (news[it.id] ? '<span class="fd-new">새 글</span>' : "") + scTag(it) +
        '<button class="fd-pin' + (PIN[it.id] ? " on" : "") + '" data-pin="' + e(it.id) + '">📌</button></div>' +
        (it.kind !== "tg" ? '<div class="fd-ti">' + e(it.title) + '</div>' : "") +
        (hv && hv.why ? '<div class="fd-why">' + (hv.lv >= 2 ? "🔴 " : "🟡 ") + e(hv.why) + '</div>' : "") +
        (S.used[it.id] ? '<div class="fd-used">📝 오늘 시황리포트: ' + e(S.used[it.id]) + '</div>' : "") +
        (it._h.length ? '<div class="fd-hit">🎯 ' + it._h.map(e).join(" · ") + '</div>' : "") + stkTags(it) +
        '<div class="fd-tx' + (long && !op ? " cl" : "") + '">' + body + '</div>' +
        (it.files && it.files.length ? '<div class="fd-fl">📎 ' + it.files.map(e).join("<br>📎 ") + '</div>' : "") +
        (it.imgs && it.imgs.length && op ? '<div class="fd-im">' + it.imgs.map(function(u){ return '<img loading="lazy" referrerpolicy="no-referrer" src="' + e(u) + '">'; }).join("") + '</div>' : "") +
        '<div class="fd-ft">' + (long || (it.imgs && it.imgs.length) ? '<span class="fd-more">' + (op ? "접기 ▲" : "펼치기 ▼" + (it.imgs && it.imgs.length ? " · 사진 " + it.imgs.length : "")) + '</span>' : "<span></span>") +
        '<a class="fd-go" href="' + e(it.link) + '" target="_blank" rel="noopener">원문 ↗</a></div></div>';
  }

  /* 🧵 A13-2 (10/15): 같은 채널(텔레그램·블로그) 글이 1시간 안에 연달아 오면 카드 한 장으로 묶음.
     닫힌 묶음 = 머리(채널 · N개 · 시각~시각) + 글마다 첫 줄 · 누르면 글 카드가 하나씩 펼쳐짐(📌 는 글마다 그대로)
     뉴스·AI 글은 안 묶음 · 🎯 집중 연결 · 📝 리포트 인용이 든 글이 있으면 묶음 머리에 표시 */
  function tms(it){
    var s = String(it.at || it.first || "");
    if (s.length < 16) return null;
    var t = Date.parse(s.slice(0, 10) + "T" + s.slice(11, 16) + ":00+09:00");
    return isNaN(t) ? null : t;
  }
  function grp(its){
    var out = [], cur = null;
    its.forEach(function(it){
      var p = cur && cur[cur.length - 1], tp = p && tms(p), ti = tms(it);
      var ok = p && (it.kind === "tg" || it.kind === "blog") && it.kind === p.kind && it.src === p.src &&
        String(it.at || it.first).slice(0, 10) === String(p.at || p.first).slice(0, 10) &&
        tp != null && ti != null && Math.abs(tp - ti) <= 3600e3;
      if (ok) cur.push(it); else { cur = [it]; out.push(cur); }
    });
    return out;
  }
  function firstLine(it){
    var t = it.kind === "tg" ? "" : (it.title || "");
    if (!t) t = (String(it.text || "").split(/\n+/).filter(function(x){ return x.trim(); })[0] || it.title || "").trim();
    t = t.replace(/^[\s•·▪◦\-*>]+/, "") || t;
    return t.length > 70 ? t.slice(0, 70) + "…" : t;
  }
  function grpCard(g, news){
    var a = g[0], z = g[g.length - 1], gid = a.id, op = S.gopen[gid];
    var t2 = String(a.at || "").slice(11, 16), t1 = String(z.at || "").slice(11, 16);
    var nNew = g.filter(function(i){ return news[i.id]; }).length;
    var nPin = g.filter(function(i){ return PIN[i.id]; }).length;
    var nUsed = g.filter(function(i){ return S.used[i.id]; }).length;
    var gh = 0; g.forEach(function(i){ var v = S.hot[i.id]; if (v && v.lv > gh) gh = v.lv >= 2 ? 2 : 1; });
    var hit = []; g.forEach(function(i){ (i._h || []).forEach(function(w){ if (hit.indexOf(w) < 0) hit.push(w); }); });
    return '<div class="fd-grp fd-' + (a.kind || "bl") + (op ? " op" : "") + (gh ? " fd-h" + gh : "") + '">' +
      '<div class="fd-ghd" data-gid="' + e(gid) + '">' +
        '<div class="fd-hd"><span class="fd-sn">' + (IC[a.kind] || "🅽") + " " + e(a.name.replace(/\s*\(.*\)/, "")) + '</span>' +
        hotTag(gh ? {lv: gh} : null) + '<span class="fd-gn">' + g.length + '개</span><span class="fd-tm">' + e(t1 === t2 ? t2 : t1 + "~" + t2) + '</span>' + scTag(a) +
        (nNew ? '<span class="fd-new">새 글' + (nNew > 1 ? " " + nNew : "") + '</span>' : "") +
        (nPin ? '<span class="fd-gp">📌' + (nPin > 1 ? nPin : "") + '</span>' : "") + '</div>' +
        (nUsed ? '<div class="fd-used">📝 오늘 시황리포트 인용 ' + nUsed + '개</div>' : "") +
        (hit.length ? '<div class="fd-hit">🎯 ' + hit.slice(0, 4).map(e).join(" · ") + '</div>' : "") +
        (op ? "" : '<ul class="fd-gl">' + g.map(function(i){ var v = S.hot[i.id]; return '<li' + (v ? ' class="h' + (v.lv >= 2 ? 2 : 1) + '"' : '') + '>' + (v ? (v.lv >= 2 ? "🔴 " : "🟡 ") : "") + (S.used[i.id] ? "📝 " : "") + e(firstLine(i)) + '</li>'; }).join("") + '</ul>') +
        '<div class="fd-ft"><span class="fd-more">' + (op ? "묶음 접기 ▲" : "하나씩 보기 ▼") + '</span><span></span></div>' +
      '</div>' +
      (op ? '<div class="fd-gin">' + g.map(function(i){ return card(i, news); }).join("") + '</div>' : "") +
    '</div>';
  }

  /* ⭐ 10/21 중요 표시 — feeds/hot.json (🧠 두뇌가 매시간 새 글을 읽고 고름)
     lv2 🔴 핵심 = 보유 칸·킥·bets·가설과 직결되거나 시장을 움직일 숫자 · lv1 🟡 주목 = 알아 둘 만한 것 · 나머지는 그대로 */
  function hotTag(v){
    if (!v) return "";
    return v.lv >= 2 ? '<span class="fd-hb h2">🔴 핵심</span>' : '<span class="fd-hb h1">🟡 주목</span>';
  }
  function hotBox(){
    var L = S.d.items.filter(function(i){ var v = S.hot[i.id]; return v && v.lv >= 2; }).slice(0, 6);
    if (!L.length) return "";
    return '<div class="fd-hbox"><div class="fd-hbt">🔴 지금 꼭 볼 글 <small>🧠 두뇌가 고름 · ' + e(String((S.hotAt || "")).slice(11, 16)) + '</small><button data-fk="HOT">⭐ 중요만 보기 ›</button></div>' +
      L.map(function(i){ return '<div class="fd-hbi" data-hid="' + e(i.id) + '"><b>' + e(firstLine(i)) + '</b><small>' + e(S.hot[i.id].why || "") + '</small></div>'; }).join("") + '</div>';
  }

  /* 🗣 A10/20-2 (10/20): 내 채널 성적표 — feeds/feed_score.json (market-strategy-report src/feed_score.py · 평일 07:25·16:10)
     채널 글이 이름을 부른 종목을 「글 날짜 뒤 첫 거래일 종가 → 5·20거래일 뒤」로 채점. 사라/팔아라는 안 가림 — 「언급 뒤 올랐나」만.
     5일 채점 MINN 개 전엔 % 대신 「쌓는 중」 · 매수 추천 아님 */
  var MINN = 10;
  function scOf(src){ return S.sc && S.sc.ch ? S.sc.ch[src] || null : null; }
  function pct(v, d){ return v == null ? "–" : (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 1 : d) + "%"; }
  function scTag(it){
    if (it.kind !== "tg" && it.kind !== "blog") return "";
    var g = scOf(it.src); if (!g || !g.n5) return "";
    return g.n5 >= MINN ? '<span class="fd-sc" title="이 채널이 부른 종목, 5거래일 뒤 오른 비율 (' + g.n5 + '건)">📣 5일 적중 ' + g.up5 + '%</span>' : '<span class="fd-sc mut">📣 채점 ' + g.n5 + '/' + MINN + '</span>';
  }
  function stkTags(it){
    var L = S.sc && S.sc.post ? S.sc.post[it.id] : null; if (!L || !L.length) return "";
    return '<div class="fd-stk">🏷 ' + L.map(function(x){ return '<span data-fop="' + e(x[1]) + '">' + e(x[0]) + '</span>'; }).join("") + '</div>';
  }
  function dots(arr){ return (arr || []).slice(0, 12).map(function(r){ var v = r.r5; return '<i class="' + (v == null ? "" : v > 0 ? "su" : "sd") + '" title="' + e(r.d.slice(5).replace("-", "/") + " " + r.n + (v != null ? " " + pct(v) : " 채점 전")) + '"></i>'; }).join(""); }
  function scoreView(){
    var sc = S.sc, ch = sc.ch, ks = Object.keys(ch);
    var ord = SCORD || "ex";   // 시장 전체가 빠진 기간엔 「오른 비율」보다 「지수 대비」가 고르는 눈을 더 정직하게 보여 줌
    ks.sort(function(a, b){ var A = ch[a], B = ch[b], ra = (A.n5 || 0) >= MINN, rb = (B.n5 || 0) >= MINN;
      if (ord === "n") return (B.n || 0) - (A.n || 0);
      if (ra !== rb) return ra ? -1 : 1;
      return ord === "ex" ? (B.ex5 == null ? -99 : B.ex5) - (A.ex5 == null ? -99 : A.ex5) : (B.up5 || 0) - (A.up5 || 0) || (B.avg5 || 0) - (A.avg5 || 0); });
    var bs = sc.base || {};
    var h = '<section class="card fd-scc" data-xc="1"><h3>📣 내 채널 성적표 <span class="mut">최근 ' + (sc.win_days || 90) + '일 언급 · ' + e(String(sc.updated || "").slice(5).replace("-", "/")) + '</span></h3>' +
      '<p class="note" style="margin:0 0 8px">채널 글이 이름을 부른 종목을 <b>글 날짜 뒤 첫 거래일 종가</b>로 잡고 <b>5거래일·20거래일 뒤</b> 값과 비교했어요. 「사라·팔아라」는 가리지 않고 <b>언급 뒤 올랐나</b>만 셌어요. 같은 채널·종목·날은 1번, 종목이 7개 넘게 나온 목록 글은 뺐어요.' +
      (bs.n5 ? ' 모든 채널 합쳐 5일 뒤 오른 비율 <b>' + bs.up5 + '%</b>(' + bs.n5 + '건) — 이 숫자보다 높아야 「고르는 눈」이 있는 셈.' : '') + '</p>' +
      '<div class="fd-sord">' + [["ex", "지수 대비순"], ["hit", "오른 비율순"], ["n", "언급 많은 순"]].map(function(x){ return '<button data-sord="' + x[0] + '"' + (ord === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join("") + '</div>';
    h += ks.map(function(k, i){ var g = ch[k], ok = (g.n5 || 0) >= MINN;
      var src = (S.d.sources || []).filter(function(s){ return s.id === k; })[0] || {};
      return '<div class="fd-scr" data-fk="' + e(k) + '"><div class="fd-scn"><b>' + (ok && ord !== "n" ? (i + 1) + ". " : "") + (IC[src.kind] || "") + " " + e(String(g.name || k).replace(/\s*\(.*\)/, "")) + '</b><span class="mut">언급 ' + g.n + (g.top && g.top.length ? ' · ' + g.top.slice(0, 3).map(e).join("·") : '') + '</span></div>' +
        '<div class="fd-scv">' + (ok ? '<span>5일 뒤 오름 <b class="' + (g.up5 >= (bs.up5 || 50) ? "up" : "dn") + '">' + g.up5 + '%</b></span><span>평균 <b class="' + (g.avg5 > 0 ? "up" : "dn") + '">' + pct(g.avg5) + '</b></span>' + (g.ex5 != null ? '<span>지수 대비 <b class="' + (g.ex5 > 0 ? "up" : "dn") + '">' + pct(g.ex5) + 'p</b></span>' : '') :
          '<span class="mut">5일 채점 ' + (g.n5 || 0) + '/' + MINN + ' — 쌓는 중</span>') + (g.pend ? '<span class="mut">채점 기다림 ' + g.pend + '</span>' : '') +
        ((g.n20 || 0) >= MINN ? '<span>20일 오름 <b>' + g.up20 + '%</b> ' + pct(g.avg20) + '</span>' : (g.n20 ? '<span class="mut">20일 ' + g.n20 + '건</span>' : '')) + '</div>' +
        '<div class="fd-scd">' + dots(g.last) + '</div></div>'; }).join("");
    h += '<p class="note" style="margin:8px 0 0">점 = 최근 채점된 언급 12개(빨강 5일 뒤 오름 · 파랑 내림) · 줄을 누르면 그 채널 글만 · 과거 기록일 뿐 앞으로를 보장하지 않고, 매수 추천도 아니에요.</p></section>';
    return h;
  }
  var SCORD = null;
  function bindScore(b){
    [].forEach.call(b.querySelectorAll("[data-sord]"), function(x){ x.onclick = function(){ SCORD = x.getAttribute("data-sord"); list(); }; });
    [].forEach.call(b.querySelectorAll(".fd-scr[data-fk]"), function(x){ x.onclick = function(){ S.f = x.getAttribute("data-fk"); S.lim = 40; draw(); window.scrollTo(0, 0); }; });
  }

  function list(){
    var b = document.getElementById("fdbody"); if (!b || !S.d) return;
    if (S.f === "SCORE"){ b.innerHTML = scoreView(); bindScore(b); return; }
    var its = S.d.items.filter(pass), news = {};
    (S.d.new || []).forEach(function(i){ news[i] = 1; });
    if (!its.length){ b.innerHTML = '<div class="empty">' + (S.f === "PIN" ? "📌 모아 둔 글이 없어요. 글 오른쪽 📌 를 눌러 모아 두세요." : "해당하는 글이 없어요.") + '</div>'; return; }
    var h = "", day = "", all = its.length;
    if (S.f === "ALL" && !S.q) h += hotBox();
    S.lim = S.lim || 40; its = its.slice(0, S.lim);          // 처음엔 40개만 — 끝없이 긴 화면 대신 「더 보기」
    grp(its).forEach(function(g){
      var dd = (g[0].at || g[0].first).slice(0, 10);
      if (dd !== day){ day = dd; h += '<div class="fd-day">' + dayLab(dd) + '</div>'; }
      h += g.length > 1 ? grpCard(g, news) : card(g[0], news);
    });
    if (all > its.length) h += '<button class="fd-lim" id="fdlim">더 보기 ▾ <small>' + (all - its.length) + '개 남음</small></button>';
    b.innerHTML = h;
    [].forEach.call(b.querySelectorAll(".fd-hbox [data-fk]"), function(x){ x.onclick = function(){ S.f = "HOT"; S.lim = 40; draw(); window.scrollTo(0, 0); }; });
    [].forEach.call(b.querySelectorAll("[data-hid]"), function(x){ x.onclick = function(){
      var id = x.getAttribute("data-hid"); S.f = "HOT"; S.open[id] = true; S.lim = 200; draw();
      setTimeout(function(){ var el = document.querySelector('.fd-it[data-fid="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (el) el.scrollIntoView({block: "center"}); }, 30); }; });
    var lb = document.getElementById("fdlim"); if (lb) lb.onclick = function(){ var y = window.scrollY; S.lim += 60; list(); window.scrollTo(0, y); };
    [].forEach.call(b.querySelectorAll("[data-gid]"), function(el){
      el.onclick = function(ev){
        if (ev.target.closest("a")) return;
        if (window.getSelection && String(window.getSelection()).length) return;
        var id = el.getAttribute("data-gid"); S.gopen[id] = !S.gopen[id];
        var y = window.scrollY; list(); window.scrollTo(0, y);
      };
    });
    [].forEach.call(b.querySelectorAll(".fd-it"), function(el){
      el.onclick = function(ev){
        if (ev.target.closest("a")) return;
        var op = ev.target.closest("[data-fop]");
        if (op){ ev.stopPropagation(); if (window.openOP) openOP(op.getAttribute("data-fop")); return; }
        var pin = ev.target.closest("[data-pin]");
        var id = el.getAttribute("data-fid");
        if (pin){ if (PIN[id]) delete PIN[id]; else PIN[id] = 1; savePin(); pin.classList.toggle("on", !!PIN[id]); return; }
        if (window.getSelection && String(window.getSelection()).length) return;
        S.open[id] = !S.open[id]; var y = window.scrollY; list(); window.scrollTo(0, y);
      };
    });
  }

  var css = document.createElement("style");
  css.textContent =
    ".fd-top{padding:2px 0 6px}" +
    ".fd-src{display:flex;flex-wrap:wrap;gap:6px}.fd-row{display:flex;gap:6px;overflow-x:auto;width:100%;padding-bottom:2px;scrollbar-width:none}.fd-row::-webkit-scrollbar{display:none}" +
    ".fd-chip{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;flex:none}" +
    ".fd-chip.on{background:var(--c,#f4a261);color:#111;border-color:transparent;font-weight:700}" +
    ".fd-chip.bad{opacity:.5;text-decoration:line-through}" +
    ".fd-sel{width:100%;margin-top:6px;padding:8px 10px;border-radius:10px;background:rgba(124,156,255,.12);font-size:13px;color:var(--text)}.fd-sel small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}" +
    ".fd-meta{width:100%;font-size:12.5px;color:var(--dim);margin-top:2px}" +
    ".fd-q{width:100%;margin-top:8px;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:9px 11px;font:inherit;font-size:15px}" +
    ".fd-day{margin:14px 2px 6px;font-size:13px;font-weight:700;color:var(--sub)}" +
    ".fd-it{background:var(--panel);border:1px solid var(--line);border-left:3px solid #4aa3ff;border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer}" +
    ".fd-it.fd-news{border-left-color:#8a94a8}.fd-it.fd-ai{border-left-color:#7c9cff;background:linear-gradient(160deg,rgba(124,156,255,.08),var(--panel) 60%)}.fd-press{font-weight:400;color:var(--sub)}" +
    ".fd-it.fd-bl,.fd-it.fd-blog{border-left-color:#03c75a}" +
    ".fd-hd{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--sub)}" +
    ".fd-sn{font-weight:700;color:var(--text)}.fd-tm{color:var(--dim)}" +
    ".fd-new{background:#ff6b6b;color:#fff;border-radius:6px;padding:1px 6px;font-size:12.5px;font-weight:700}" +
    ".fd-pin{margin-left:auto;background:none;border:0;font-size:16px;opacity:.25;cursor:pointer;padding:0 2px}.fd-pin.on{opacity:1}" +
    ".fd-ti{font-weight:700;font-size:15.5px;margin:6px 0 2px}" +
    ".fd-used{font-size:12.5px;color:#7c9cff;margin:4px 0}" +
    ".fd-hit{font-size:12.5px;color:#ffb84d;margin:4px 0}" +
    ".fd-tx{font-size:14px;line-height:1.55;margin-top:5px;word-break:break-word}" +
    ".fd-lim{display:block;width:100%;margin:6px 0 14px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}.fd-lim small{color:var(--sub);font-weight:400;margin-left:4px}" +
    ".fd-tx.cl{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}" +
    ".fd-tx mark{background:rgba(255,184,77,.25);color:inherit;border-radius:3px;padding:0 2px}" +
    ".fd-fl{font-size:12.5px;color:var(--sub);margin-top:6px}" +
    ".fd-im{display:flex;gap:6px;overflow-x:auto;margin-top:8px}.fd-im img{height:150px;border-radius:8px;flex:none}" +
    ".fd-ft{display:flex;justify-content:space-between;align-items:center;margin-top:7px;font-size:12.5px}" +
    ".fd-grp{background:var(--panel);border:1px solid var(--line);border-left:3px solid #4aa3ff;border-radius:12px;margin-bottom:8px;box-shadow:3px 3px 0 -1px var(--panel2),3px 3px 0 0 var(--line)}" +
    ".fd-grp.fd-blog{border-left-color:#03c75a}.fd-ghd{padding:10px 12px;cursor:pointer}" +
    ".fd-gn{background:rgba(74,163,255,.16);color:var(--text);border-radius:6px;padding:1px 6px;font-size:12.5px;font-weight:700}" +
    ".fd-gp{margin-left:auto;font-size:13px}" +
    ".fd-gl{list-style:none;margin:7px 0 0;padding:0}.fd-gl li{font-size:14px;line-height:1.5;padding:3px 0 3px 12px;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fd-gl li:before{content:'';position:absolute;left:2px;top:.75em;width:4px;height:4px;border-radius:50%;background:var(--sub)}" +
    ".fd-gl li+li{border-top:1px dashed var(--line)}" +
    ".fd-gin{padding:0 8px 2px}.fd-gin .fd-it{border-left-width:1px;margin-bottom:6px}" +
    ".fd-sc{background:rgba(255,184,77,.16);color:#ffb84d;border-radius:6px;padding:1px 6px;font-size:12.5px;font-weight:700;white-space:nowrap}.fd-sc.mut{background:rgba(138,148,168,.15);color:var(--sub);font-weight:400}" +
    ".fd-stk{display:flex;flex-wrap:wrap;gap:4px;margin:5px 0 0;font-size:12.5px;color:var(--sub);align-items:center}.fd-stk span{border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--text);cursor:pointer}" +
    ".fd-sord{display:flex;gap:6px;margin:0 0 6px}.fd-sord button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer}.fd-sord button.on{color:var(--text);border-color:#ffb84d;font-weight:700}" +
    ".fd-scr{padding:9px 2px;border-top:1px solid var(--line);cursor:pointer}.fd-scn{display:flex;flex-direction:column;gap:1px}.fd-scn b{font-size:14.5px}.fd-scn .mut{font-size:12.5px}" +
    ".fd-scv{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin-top:3px}.fd-scv b.up{color:var(--up)}.fd-scv b.dn{color:var(--dn)}.fd-scv b{color:var(--text)}" +
    ".fd-scd{display:flex;gap:3px;margin-top:5px}.fd-scd i{width:9px;height:9px;border-radius:50%;background:rgba(138,148,168,.4)}.fd-scd i.su{background:#ff5a5a}.fd-scd i.sd{background:#4d8dff}" +
    ".fd-chip.hot{border-color:#ff5a5a;color:#ff7b7b;font-weight:700}.fd-chip.hot.on{background:#ff5a5a;color:#fff}" +
    ".fd-it.fd-h2,.fd-grp.fd-h2{border-left:4px solid #ff4d4d;background:linear-gradient(160deg,rgba(255,77,77,.11),var(--panel) 55%);border-color:rgba(255,77,77,.45);border-left-color:#ff4d4d}" +
    ".fd-it.fd-h1,.fd-grp.fd-h1{border-left:4px solid #ffb020;background:linear-gradient(160deg,rgba(255,176,32,.09),var(--panel) 55%);border-left-color:#ffb020}" +
    ".fd-it.fd-h2 .fd-ti{font-size:16.5px}" +
    ".fd-hb{border-radius:6px;padding:1px 6px;font-size:12.5px;font-weight:800;white-space:nowrap}.fd-hb.h2{background:#ff4d4d;color:#fff}.fd-hb.h1{background:rgba(255,176,32,.2);color:#ffb020}" +
    ".fd-why{font-size:12.5px;font-weight:600;margin:4px 0 2px;padding:4px 8px;border-radius:8px;background:rgba(255,77,77,.1);color:var(--text)}.fd-h1 .fd-why{background:rgba(255,176,32,.1)}" +
    ".fd-gl li.h2{font-weight:700}.fd-gl li.h2:before,.fd-gl li.h1:before{display:none}.fd-gl li.h1,.fd-gl li.h2{padding-left:2px}" +
    ".fd-hbox{border:1px solid rgba(255,77,77,.45);border-radius:12px;padding:9px 11px 4px;margin:8px 0 4px;background:linear-gradient(160deg,rgba(255,77,77,.1),var(--panel) 70%)}" +
    ".fd-hbt{display:flex;flex-wrap:wrap;align-items:center;gap:2px 6px;font-weight:800;font-size:14px;margin-bottom:4px}.fd-hbt small{order:3;width:100%;font-weight:400;color:var(--sub);font-size:12.5px}.fd-hbt button{margin-left:auto;border:0;background:none;color:#ff7b7b;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".fd-hbi{padding:6px 0;border-top:1px dashed var(--line);cursor:pointer}.fd-hbi b{display:block;font-size:14px;line-height:1.4}.fd-hbi small{display:block;color:var(--sub);font-size:12.5px;margin-top:1px}" +
    ".fd-more{color:var(--sub)}.fd-go{color:var(--c,#f4a261);text-decoration:none;font-weight:700}";
  document.head.appendChild(css);
})();
;
/* ======== push.js ======== */
/* 🔔 알림 (10/9 단순화) — 이 앱을 설치한 휴대폰이 「알림 받기」만 켜고 끄면 끝.
   켜면: 알림 허락 → 웹 푸시 구독 → 구독 정보를 휴대폰에서 암호화(RSA 공개키)해서 보냄 → 서버(stock-screener 저장소의 push-relay, 6시간 이어달리기)가 신호마다 푸시.
   다른 앱(ntfy) 설치·구독 단계 없음. */
(function(){
  var NT = "https://ntfy.sh/", SUB = "chkchp-ch-pushsub-k4t9", TEST = "chkchp-ch-pushtest-k4t9";
  var C = window.crypto && window.crypto.subtle, TE = new TextEncoder(), KEYS = null;
  function b64(buf){ var s = "", a = new Uint8Array(buf); for (var i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
  function ub64(s){ var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function ub64u(s){ s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return ub64(s); }
  function hex(buf){ return [].map.call(new Uint8Array(buf), function(x){ return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e) {} return null; }

  var standalone = function(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; };
  var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var can = function(){ return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window; };

  function reg(){ return navigator.serviceWorker.register("sw.js", {scope: "./"}).then(function(){ return navigator.serviceWorker.ready; }); }
  if ("serviceWorker" in navigator) { try { reg().catch(function(){}); } catch(e) {} }

  function keys(){ return KEYS ? Promise.resolve(KEYS) : fetch("https://raw.githubusercontent.com/chkchp0702-spec/stock-screener/main/push/keys.json?" + Date.now()).then(function(r){ if (!r.ok) throw new Error("keys"); return r.json(); }).then(function(k){ KEYS = k; return k; }); }
  function idOf(sub){ return C.digest("SHA-256", TE.encode(sub.endpoint)).then(function(h){ return hex(h).slice(0, 24); }); }
  function seal(obj, pub){
    var K;
    return C.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt"]).then(function(k){ K = k;
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return Promise.all([
        C.importKey("spki", ub64(pub), {name: "RSA-OAEP", hash: "SHA-256"}, false, ["encrypt"]).then(function(pk){ return C.exportKey("raw", K).then(function(raw){ return C.encrypt({name: "RSA-OAEP"}, pk, raw); }); }),
        C.encrypt({name: "AES-GCM", iv: iv}, K, TE.encode(JSON.stringify(obj))).then(function(ct){ return {iv: iv, ct: ct}; })
      ]);
    }).then(function(r){ return {k: b64(r[0]), iv: b64(r[1].iv), ct: b64(r[1].ct)}; });
  }
  function post(topic, body){ return fetch(NT + topic, {method: "POST", body: typeof body === "string" ? body : JSON.stringify(body)}).then(function(r){ if (!r.ok) throw new Error("ntfy " + r.status); }); }
  function sendSub(sub){
    return keys().then(function(k){ return Promise.all([idOf(sub), seal(sub.toJSON(), k.rsa_pub)]); })
      .then(function(r){ ls("pushId", r[0]); ls("pushSent", String(Date.now()));
        var uid = ""; try { uid = (window.store && store.uid) || (JSON.parse(localStorage.getItem("app") || "{}").uid) || ""; } catch(z) {}
        return post(SUB, Object.assign({op: "on", id: r[0], mode: mode(), uid: uid}, r[1])).then(function(){ return r[0]; }); });
  }
  // 10/28 알림 다이어트(동료 PB ④): 👔 PB 기본 = 하루 2개(☀️ PB 한 장 + 📌 내 고객 상품·⭐ 관심종목) · 🔔 전부
  function mode(){ return ls("pushMode") === "all" ? "all" : "pb"; }
  window.__pushMode = function(m){ ls("pushMode", m === "all" ? "all" : "pb"); if (ls("pushOn") === "1") current().then(function(s){ if (s) sendSub(s).catch(function(){}); }); };
  function current(){ if (!can()) return Promise.resolve(null); return navigator.serviceWorker.getRegistration("./").then(function(r){ return r ? r.pushManager.getSubscription() : null; }).catch(function(){ return null; }); }

  function turnOn(){
    if (!can()) return Promise.reject(new Error("unsupported"));
    return Notification.requestPermission().then(function(p){
      if (p !== "granted") throw new Error("denied");
      return Promise.all([reg(), keys()]);
    }).then(function(r){
      return r[0].pushManager.getSubscription().then(function(s){ return s || r[0].pushManager.subscribe({userVisibleOnly: true, applicationServerKey: ub64u(r[1].vapid_pub)}); });
    }).then(sendSub).then(function(){ ls("pushOn", "1"); });
  }
  function turnOff(){
    return current().then(function(s){
      var id = ls("pushId");
      var p = s ? s.unsubscribe().catch(function(){}) : Promise.resolve();
      return p.then(function(){ return id ? post(SUB, {op: "off", id: id}).catch(function(){}) : null; });
    }).then(function(){ ls("pushOn", null); ls("pushId", null); });
  }
  // 켜 둔 휴대폰은 하루 한 번 구독 정보를 다시 보냄 (서버 쪽 목록이 빠지지 않게)
  setTimeout(function(){
    if (ls("pushOn") !== "1") return;
    current().then(function(s){ if (s && Date.now() - (+ls("pushSent") || 0) > 20 * 3600e3) sendSub(s).catch(function(){}); });
  }, 4000);

  /* 10/14 A14-5 「켜면 이런 알림이 와요」 — 고르는 목록처럼 보이던 11줄을 하루 시간표 4묶음으로 (스위치 하나는 그대로) · 묶음마다 최근 10일 실제 건수(push_log.json) */
  var GROUPS = [
    {k: "am", ic: "🌅", t: "아침 6~9시", s: "미국 장이 끝난 뒤", tp: ["brief", "cup", "whale", "report"],
     it: [["☀️", "아침 요약", "국면·시황 할 일·오늘 신호 수·다가오는 실적을 한 번에"], ["🌐", "시황리포트 도착", "매일 아침 리포트가 올라오면"], ["☕", "컵 돌파 임박 · 돌파", "돌파선까지 2% 안으로 온 종목, 돌파한 종목"], ["🐋", "고래 픽 변경", "오늘의 고래 픽이 바뀌면"]]},
    {k: "kr", ic: "🏙", t: "한국 장중 9~15시", s: "장이 열려 있는 동안", tp: ["danta", "danta-a", "danta-best", "focus"],
     it: [["⚡", "단타 알람", "장중 단타 신호 (시험 중이라 참고만) · 연속 손절이면 「쉬어 가기」"], ["🎯", "오늘의 집중 — 돌파·이탈", "아침에 고른 집중 종목이 기준가를 뚫거나 20일선 아래로 (10분마다)"]]},
    {k: "us", ic: "🌃", t: "밤 9시~새벽 1시", s: "미국 장 시작 전·첫 30분", tp: ["gap"],
     it: [["📈", "갭 — 장 전 ±4% · 첫 30분 지킴/무너짐", "새로 나온 갭 돌파 종목도 함께"]]},
    {k: "any", ic: "📅", t: "가끔", s: "조건이 맞는 날에만", tp: ["compass", "accum"],
     it: [["🧭", "시장 국면 변화", "5개 시장 중 상승장·하락장·횡보장이 바뀌면"], ["🤫", "매집 종목 박스 돌파", "조용히 모으던 종목이 20일 고점을 넘는 날"]]}
  ];
  window.alarmView = function(){
    var list = GROUPS.map(function(g){
      return '<div class="pu-g"><div class="pu-gh"><span>' + g.ic + '</span><b>' + g.t + '</b><small>' + g.s + '</small><em class="pu-n" data-g="' + g.k + '"></em></div>' +
        g.it.map(function(a){ return '<div class="pu-li"><span>' + a[0] + '</span><div><b>' + a[1] + '</b><small>' + a[2] + '</small></div></div>'; }).join("") + '</div>';
    }).join("");
    var pb = mode() === "pb";
    var pick = '<section class="card pu-mode"><div class="sec" style="margin:0 0 8px">얼마나 받을까요</div>' +
      '<label class="pu-opt' + (pb ? ' on' : '') + '"><input type="radio" name="pumode" value="pb"' + (pb ? ' checked' : '') + '><div><b>👔 PB 기본 — 하루 2개</b><small>아침 8시 ☀️ 오늘 한 장 + 📌 내 고객 상품·⭐ 관심종목에 일이 있을 때만</small></div></label>' +
      '<label class="pu-opt' + (pb ? '' : ' on') + '"><input type="radio" name="pumode" value="all"' + (pb ? '' : ' checked') + '><div><b>🔔 전부</b><small>아래 시간표의 신호 알림까지 모두 (최근 10일 하루 평균 6건쯤)</small></div></label></section>';
    return pick + '<section class="card pu-main"><div class="pu-top"><div><div class="pu-t">🔔 이 휴대폰으로 알림 받기</div><div class="pu-s" id="pust">확인하는 중…</div></div>' +
      '<button class="pu-sw" id="pusw" role="switch" aria-checked="false" aria-label="알림 받기"><i></i></button></div>' +
      '<div id="puhelp"></div><div class="pu-act" id="puact"></div></section>' +
      '<div class="sec">켜면 하루에 이렇게 와요 <span class="mut" id="putot"></span></div><section class="card pu-list">' + list + '</section>' +
      '<section class="card pu-lv"><b>알림 제목 앞 동그라미</b><div><span>🔴</span>지금 봐야 함 <small>(돌파·손절가 도달·국면 변화)</small></div><div><span>🟡</span>오늘 중에 보면 됨</div><div><span>⚪</span>참고 <small>(요약·성적)</small></div>' +
      '<p class="note" style="margin:6px 0 0">밤 11시~아침 7시에 오는 알림은 소리 없이 와요. 언제든 위 스위치로 끌 수 있어요.</p></section>';
  };
  function counts(){
    var get = window.getJSON ? getJSON("archive/x/push_log.json?" + ((window.M && M.updated) || Date.now())) : fetch("archive/x/push_log.json").then(function(r){ return r.json(); });
    get.then(function(L){
      if (!L || !L.length) return;
      var last = L[0].t.slice(0, 10), d0 = new Date(last + "T00:00:00Z"); d0.setUTCDate(d0.getUTCDate() - 9);
      var from = d0.toISOString().slice(0, 10), R = L.filter(function(x){ return x.t.slice(0, 10) >= from; }), days = {};
      R.forEach(function(x){ days[x.t.slice(0, 10)] = 1; });
      GROUPS.forEach(function(g){ var n = R.filter(function(x){ return g.tp.indexOf(x.topic) >= 0; }).length, el = document.querySelector('.pu-n[data-g="' + g.k + '"]');
        if (el) el.textContent = n ? "최근 10일 " + n + "건" : "최근 10일 없음"; });
      var tot = document.getElementById("putot"), nd = Object.keys(days).length;
      if (tot && nd) tot.textContent = "· 최근 10일 " + R.length + "건, 하루 평균 약 " + Math.round(R.length / 10) + "건";
    }).catch(function(){});
  }
  window.alarmInit = function(){
    [].forEach.call(document.querySelectorAll('input[name="pumode"]'), function(r){ r.onchange = function(){ __pushMode(r.value); [].forEach.call(document.querySelectorAll(".pu-opt"), function(l){ l.classList.toggle("on", l.querySelector("input").checked); }); }; });
    var sw = document.getElementById("pusw"), st = document.getElementById("pust"), help = document.getElementById("puhelp"), act = document.getElementById("puact");
    function set(on, msg, cls){ sw.classList.toggle("on", !!on); sw.setAttribute("aria-checked", on ? "true" : "false"); st.className = "pu-s " + (cls || ""); st.innerHTML = msg; }
    function testBtn(){ act.innerHTML = '<button class="btn pu-test" id="putest">테스트 알림 보내기</button>';
      document.getElementById("putest").onclick = function(){ var b = this, id = ls("pushId"); b.disabled = true; b.textContent = "보내는 중… (1분 안에 와요)";
        post(TEST, id || "").then(function(){ setTimeout(function(){ b.disabled = false; b.textContent = "테스트 알림 보내기"; }, 60000); }).catch(function(){ b.disabled = false; b.textContent = "다시 시도"; }); }; }
    function draw(){
      help.innerHTML = ""; act.innerHTML = "";
      if (ios && !standalone()){
        set(false, "홈 화면에 추가한 앱에서만 켤 수 있어요", "warn"); sw.disabled = true;
        help.innerHTML = '<div class="pu-help"><b>아이폰은 이렇게 한 번만</b><ol><li>사파리 아래 <b>공유 버튼(□↑)</b> → <b>홈 화면에 추가</b></li><li>홈 화면의 <b>CH Investing</b> 아이콘으로 열기</li><li>이 화면에서 스위치 켜기</li></ol><a class="btn" href="install.html">그림으로 보기 →</a></div>';
        return;
      }
      if (!can()){ set(false, "이 브라우저는 알림을 지원하지 않아요 (아이폰은 iOS 16.4 이상)", "warn"); sw.disabled = true; return; }
      if (Notification.permission === "denied"){ set(false, "알림이 막혀 있어요", "warn");
        help.innerHTML = '<div class="pu-help">휴대폰 <b>설정 → 알림 → CH Investing</b> 에서 <b>알림 허용</b>을 켠 뒤 다시 와 주세요.</div>'; return; }
      current().then(function(s){
        if (s && Notification.permission === "granted"){ set(true, "켜져 있어요 · 신호가 뜨면 바로 알려 드려요", "ok"); testBtn(); if (ls("pushOn") !== "1"){ ls("pushOn", "1"); sendSub(s).catch(function(){}); } }
        else set(false, "꺼져 있어요 · 스위치를 누르면 켜져요");
      });
    }
    sw.onclick = function(){
      if (sw.disabled || sw.dataset.busy) return; sw.dataset.busy = 1;
      var on = sw.classList.contains("on");
      set(!on, on ? "끄는 중…" : "켜는 중… 알림 허용을 물으면 「허용」");
      (on ? turnOff() : turnOn()).then(function(){ delete sw.dataset.busy; draw(); if (!on) st.innerHTML = "켜졌어요 ✓ · 아래 테스트로 확인해 보세요"; })
        .catch(function(e){ delete sw.dataset.busy; draw();
          if (e && e.message === "denied") set(false, "알림 허용을 눌러야 켜져요", "warn");
          else if (e && e.message === "keys") set(false, "알림 서버 준비 중이에요. 잠시 뒤 다시 눌러 주세요", "warn");
          else set(false, "켜지 못했어요 — 다시 눌러 주세요", "warn"); });
    };
    draw(); counts();
  };

  var css = document.createElement("style");
  css.textContent =
    ".pu-main{padding:18px 16px}.pu-top{display:flex;align-items:center;gap:12px}.pu-top>div{flex:1}" +
    ".pu-t{font-size:18px;font-weight:800}.pu-s{font-size:13.5px;color:var(--sub);margin-top:3px}.pu-s.ok{color:#4dd47a}.pu-s.warn{color:#ffb84d}" +
    ".pu-sw{flex:none;width:62px;height:36px;border-radius:18px;border:0;background:#3a4258;position:relative;cursor:pointer;transition:background .2s}" +
    ".pu-sw i{position:absolute;top:3px;left:3px;width:30px;height:30px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 2px 6px rgba(0,0,0,.3)}" +
    ".pu-sw.on{background:#34c759}.pu-sw.on i{left:29px}.pu-sw:disabled{opacity:.4}" +
    ".pu-help{margin-top:14px;padding:12px;border-radius:12px;background:var(--panel2);font-size:14px;line-height:1.6}.pu-help ol{margin:6px 0 10px;padding-left:20px}" +
    ".pu-act{margin-top:12px}.pu-test{width:100%}" +
    ".pu-list{padding:6px 14px}.pu-li{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);align-items:flex-start}.pu-li:last-child{border-bottom:0}" +
    ".pu-g{padding:4px 0 6px;border-bottom:1px solid var(--line)}.pu-g:last-child{border-bottom:0}.pu-g .pu-li{border-bottom:0;padding:7px 0 7px 4px}" +
    ".pu-gh{display:flex;align-items:baseline;gap:7px;padding:10px 0 2px}.pu-gh>span{font-size:18px}.pu-gh b{font-size:15.5px}.pu-gh small{color:var(--sub);font-size:12.5px;flex:1;min-width:0}.pu-n{font-style:normal;font-size:12.5px;color:var(--sub);background:var(--panel2);border-radius:999px;padding:2px 8px;white-space:nowrap}.pu-n:empty{display:none}" +
    ".pu-lv{padding:12px 14px;font-size:13.5px}.pu-lv>b{display:block;margin-bottom:6px;font-size:14px}.pu-lv div{padding:3px 0}.pu-lv span{display:inline-block;width:24px}.pu-lv small{color:var(--sub)}" +
    ".pu-li>span{font-size:20px;line-height:1.3}.pu-li b{display:block;font-size:14.5px}.pu-li small{color:var(--sub);font-size:12.5px}";
  document.head.appendChild(css);
  (function(){ var c = document.createElement("style"); c.textContent = ".pu-opt{display:flex;gap:10px;align-items:flex-start;padding:10px;border:1.5px solid var(--line);border-radius:12px;margin-bottom:8px;cursor:pointer}.pu-opt.on{border-color:var(--acc,#7c9cff);background:rgba(124,156,255,.08)}.pu-opt input{margin-top:4px}.pu-opt b{display:block;font-size:14.5px}.pu-opt small{color:var(--sub,#aab);font-size:12.5px;line-height:1.4}"; document.head.appendChild(c); })();
})();
;
/* ======== port.js ======== */
/* 💼 포트 (10/9) — 「시황리포트 배분표대로 투자했다면」
   자료: market-strategy-report/market/port.json (src/port.py, 매시간 갱신)
   ① 지금까지 성적(S&P·코스피·60/40 비교) ② 따라하기: 금액 넣으면 칸별·상품별 얼마/몇 주 ③ 비중 바뀐 날 ④ 칸별 기여 ⑤ 날짜별 성적 */
(function(){
  var URL_P = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/port.json";
  var COL = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9", "#2ab3c0", "#8a94a8", "#6fbf4a", "#e0a43a"];
  var URL_K = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/kick.json";
  var URL_C = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/conc.json";   // 🎯 집중 포트 (10/11)
  var CN = null;
  var P = null, K = null, PE = null, S = {amt: 10000000, mode: "us", pf: "base", bg: "전체", bsel: ["S&P500", "코스피", "코스닥", "MSCI 전세계"], cmine: 1, hv: 0, have: {}, my: {spx: 40, ndx: 40, gold: 5, per: 3, wm: "all", w: {}, pick: {}, own: [], prod: [], nm: ""}, mySaved: [], myEdit: null, inf: 0};   // my: 10/14 🙋 내 포트(뼈대 비중 직접 + 킥 종목 체크) · inf: 포트 설명 칸 열림   // cmine: 10/14 A11-2 「내 포트만」 그래프 · hv/have: 10/14 A11-4 「갖고 있는 주 수 → 바꿀 것만」(휴대폰에만 저장)
  // 📅 비교 구간 (10/14 사용자: "포트 수익률과 비교 구간은 10/2 기본, 날짜를 바꿀 수도 있게") — S.from 이 없으면 port.json start(10/02)
  //   고른 날 전 거래일 종가를 0% 로 다시 맞춤(모든 포트·지수 같은 기준) · 앱을 다시 열면 기본(10/02)으로
  var P0 = null, WB = 0;
  function winIdx(){ var ds = P0.dates, f = S.from || P0.start, bi = 0; for (var i = 0; i < ds.length; i++) if (ds[i] < f) bi = i; return Math.max(0, Math.min(bi, ds.length - 2)); }
  function rbase(arr, bi){ if (!arr) return arr; var b = arr[bi]; b = b == null ? 0 : b;
    return arr.slice(bi).map(function(v){ return v == null ? null : Math.round(((1 + v / 100) / (1 + b / 100) - 1) * 10000) / 100; }); }
  function winApply(PF){   // 전체 줄로 계산한 뒤 고른 구간만 잘라 다시 0% 부터
    WB = winIdx(); if (!WB) return;
    var Bn = {}; Object.keys(P0.bench).forEach(function(n){ Bn[n] = rbase(P0.bench[n], WB); });
    var ds = P0.dates.slice(WB);
    P = Object.assign({}, P0, {dates: ds, start: ds[1], bench: Bn, daily: (P0.daily || []).filter(function(d){ return d.d >= ds[1]; })});
    PF.forEach(function(f){ f.line = rbase(f.line, WB); });
  }
  function winHtml(){
    var ds = P0.dates, last = ds[ds.length - 1], cur = P.start, def = !WB;
    var ago = function(n){ var d = new Date(last + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
    var pre = [["기본", P0.start]].concat([[ "1주", ago(7)], ["2주", ago(14)], ["1개월", ago(30)], ["3개월", ago(91)]].filter(function(x){ return x[1] > P0.start; }))
      .concat(ds.length > 2 ? [["마지막 하루", ds[ds.length - 1]]] : []);
    return '<div class="po-win"><span class="po-wl">📅 비교 구간</span>' + pre.map(function(x){ var on = x[0] === "기본" ? def : (!def && S.from === x[1]);
        return '<button type="button" data-win="' + x[1] + '" class="' + (on ? "on" : "") + '">' + x[0] + (x[0] === "기본" ? ' <small>' + md(P0.start) + '</small>' : '') + '</button>'; }).join("") +
      '<details class="po-wdd"><summary>📅 날짜로</summary><label class="po-wd"><input type="date" id="powin" value="' + cur + '" min="' + P0.start + '" max="' + last + '"></label></details>' +
      '<small class="po-wn">' + md(cur) + ' ~ ' + md(last) + ' · ' + (P.dates.length - 1) + '거래일' + (def ? '' : ' · <b>바꾼 구간</b>') + '</small></div>';
  }
  var URL_PE = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/peers.json";
  // 🐻 11/09 A11/9-2 하락장 규칙 겹쳐 보기 — 보기 전용(배분표·규칙은 그대로) · 시장마다 그 시장 주식 칸에만 bear.json 현금 % 적용
  var URL_BR = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bear.json", BR = null, BEARON = false;
  document.addEventListener("click", function(ev){ var c = ev.target.closest && ev.target.closest('.ez-cta.red[data-ezgo="port"]'); if (c) BEARON = true; }, true);   // 쉬운 화면 「하락장 규칙대로 비중 확인하기」로 오면 켜 둠
  try { var sv = JSON.parse(localStorage.getItem("portSet") || "{}"); ["amt", "mode", "pf", "bg"].forEach(function(k){ if (sv[k]) S[k] = sv[k]; }); if (sv.cmine != null) S.cmine = sv.cmine ? 1 : 0; if (sv.hv) S.hv = 1; if (sv.have && typeof sv.have === "object") S.have = sv.have; if (sv.bsel && sv.bsel.length) S.bsel = sv.bsel; if (sv.my && typeof sv.my === "object") S.my = Object.assign(S.my, sv.my, {pick: sv.my.pick || {}, w: sv.my.w || {}, own: sv.my.own || [], prod: sv.my.prod || []}); if (sv.mySaved && sv.mySaved.length) S.mySaved = sv.mySaved; if (sv.myEdit != null) S.myEdit = sv.myEdit; if (sv.inf) S.inf = 1; } catch(e) {}
  // 비교 지수 색 (늘 같은 색)
  var BCOL = {"S&P500": "#7c9cff", "나스닥100": "#b38cff", "다우": "#5fa8d3", "코스피": "#8fd3ff", "코스닥": "#4dd4c6", "MSCI 전세계": "#ffb84d",
              "MSCI 선진국": "#e0a43a", "MSCI 신흥국": "#d98b5f", "니케이225": "#ff8fab", "항셍": "#e66767", "중국 CSI300": "#c96b6b", "심천성분": "#e07a5f", "과창판50": "#f2a65a", "주식60·채권40": "#8a94a8"};
  var BGRP = ["전체", "미국", "한국", "MSCI", "중국", "아시아", "자산배분"];
  function keep(){ try { localStorage.setItem("portSet", JSON.stringify(S)); } catch(e) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null) return "–"; d = d == null ? 2 : d; return (v > 0 ? "+" : "") + v.toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function won(v){ if (v >= 1e8) return (v / 1e8).toFixed(v >= 1e9 ? 1 : 2).replace(/\.?0+$/, "") + "억"; if (v >= 1e4) return Math.round(v / 1e4).toLocaleString("ko-KR") + "만"; return Math.round(v).toLocaleString("ko-KR"); }
  function md(d){ return d ? d.slice(5).replace("-", "/") : ""; }
  // 🧾 정직 계산 (10/11) — 기본: port.json honest.base(주 1회 리밸런싱·비용) · 킥: kick.json honest.ret(다음 날 진입·비용). 없으면 숨김
  function honV(f){ if (WB || f.k === "conc" || f.k === "mine") return null; return f.k === "kick" ? (K && K.honest ? K.honest.ret : null) : ((P.honest && P.honest.base != null) ? P.honest.base : (P.stat || {}).base_honest); }
  function honC(f){ var v = honV(f); return v == null || !window.HON ? "" : HON.chip(v, {d: 2, note: f.k === "kick" ? (K.honest || {}).note : (P.honest || {}).note}); }

  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pobody [data-op], #pobrain [data-op]");
    if (t && window.openOP){ ev.preventDefault(); ev.stopPropagation(); openOP(t.getAttribute("data-op")); }
  }, true);
  window.portView = function(){ return '<div id="pobody"><div class="loading">포트 불러오는 중…</div></div>'; };
  window.portInit = function(){
    var t = Date.now();
    Promise.all([fetch(URL_P + "?" + t).then(function(r){ if (!r.ok) throw 0; return r.json(); }),
                 fetch(URL_K + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_PE + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_C + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_BR + "?" + Math.floor(t / 300000)).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })])
      .then(function(a){ P = P0 = a[0]; K = a[1]; PE = a[2]; CN = a[3]; BR = a[4]; draw(); })
      .catch(function(err){ try { console.error("port", err); } catch(x) {} var b = document.getElementById("pobody"); if (b) b.innerHTML = '<div class="empty"><div class="big">💼</div>포트 계산이 아직 안 올라왔어요.<br>다음 자동 수집(매시간) 때 채워져요.</div>'; });
  };

  function draw(){
    var b = document.getElementById("pobody"); if (!b || !P0) return;
    P = P0; WB = 0;
    var B = P.bench, mk = [["S&P500", "S&P500"], ["코스피", "코스피"], ["주식60·채권40", "60·40"]];
    // 두 포트 (같은 날짜 줄)
    var PF = [{k: "base", ic: "💼", t: "기본 포트", s: "킥 없음 · 배분표 그대로", s2: "킥 없음", line: P.nav, color: "#e9c46a"}];
    if (K) PF.push({k: "kick", ic: "⚡", t: "킥 포트", s: (K.rule && K.rule.base_now ? "국면 현금 + 🐋 고래 10% + 확인된 돌파 🧪" : "현금 15%p → 성과 확인된 신호만 🐋☕📈🤫"), s2: "킥 " + Math.round((((K.rules || {}).sleeve || 0) + ((K.rules || {}).whale_sleeve || 0)) * 100) + "% 포함", line: K.kick, color: "#ff6b6b"});
    if (CN && CN.nav && CN.nav.length){   // 🎯 집중 — 포트와 같은 날짜 줄에 맞춤
      var cm = {}; (CN.dates || []).forEach(function(d, i){ cm[d] = CN.nav[i]; });
      var lastv = 0, cl = P.dates.map(function(d){ if (cm[d] != null) lastv = cm[d]; return lastv; });
      PF.push({k: "conc", ic: "🎯", t: "집중 포트", s: "오르는 시장이면 주식 100% · 아니면 절반", s2: (CN.regime && CN.regime.up ? "🟢 상승장" : "🔴 상승장 아님"), line: cl, color: "#4dd47a"});
    }
    // 🙋 내 포트 (10/14 사용자) — S&P·나스닥·금 비중은 내가 정하고, ⚡ 킥 종목은 체크한 것만 · 계산은 휴대폰에서(myLine)
    var MW = myW();
    PF.push({k: "mine", ic: "🙋", t: S.my.nm || "내 포트", s: "S&P " + r1(MW.spx) + "% · 나스닥 " + r1(MW.ndx) + "% · 금 " + r1(MW.gold) + "% · 종목 " + MW.st.length + "개" + ((MW.pr || []).length ? " · 상품 " + MW.pr.length + "개" : ""), s2: "내가 고른 것", line: myLine(MW), color: "#f472b6"});
    PF.forEach(function(f){ f.line0 = f.line; }); PFR = PF;   // 10/15 A11-3: 문지르기는 자르기 전 줄로 다시 셈
    winApply(PF); B = P.bench;   // 📅 고른 구간으로 자르고 다시 0% 부터
    PF.forEach(function(f){
      var v = f.line, n = v.length, peak = -1e9, mdd = 0, win = 0, best = null, worst = null;
      for (var i = 0; i < n; i++){ var x = 1 + v[i] / 100; peak = Math.max(peak, x); mdd = Math.min(mdd, (x / peak - 1) * 100);
        if (i){ var r = ((1 + v[i] / 100) / (1 + v[i - 1] / 100) - 1) * 100, sp = ((1 + B["S&P500"][i] / 100) / (1 + B["S&P500"][i - 1] / 100) - 1) * 100;
          if (r >= sp) win++; if (!best || r > best.r) best = {d: P.dates[i], r: r}; if (!worst || r < worst.r) worst = {d: P.dates[i], r: r}; } }
      f.ret = v[n - 1]; f.mdd = mdd; f.win = win; f.days = n - 1; f.best = best; f.worst = worst;
    });
    if (!PF.some(function(f){ return f.k === S.pf; })) S.pf = "base";
    var F = PF.filter(function(f){ return f.k === S.pf; })[0] || PF[0];
    // 비교 지수 목록 (port.json bench_meta — 달러 기준, 현지 통화도)
    var BM = (P.bench_meta || Object.keys(B).map(function(n){ return {name: n, group: "", ok: true}; })).filter(function(m){ return m.ok !== false && B[m.name]; })
      .map(function(m){ var v = B[m.name]; return {name: m.name, group: m.group || "", ret: v[v.length - 1], local: m.local, r1: m.r1}; });
    S.bsel = S.bsel.filter(function(n){ return B[n]; }); if (!S.bsel.length) S.bsel = ["S&P500"];
    var beat = function(f){ return BM.filter(function(m){ return f.ret >= m.ret; }).length; };
    var bmx = Math.max.apply(null, BM.map(function(m){ return Math.abs(m.ret); }).concat(PF.map(function(f){ return Math.abs(f.ret); }), [0.5]));
    var rowsB = BM.filter(function(m){ return S.bg === "전체" || m.group === S.bg; }).map(function(m){ return {b: m, ret: m.ret}; })
      .concat(PF.map(function(f){ return {f: f, ret: f.ret}; })).sort(function(a, b){ return b.ret - a.ret; });
    // 10/13 「우와」 ③: 내 포트 위아래 2줄만 · 「전체 보기」로 펼침 (S&P500 줄은 늘 보임)
    var nearI = {}; rowsB.forEach(function(x, i){ if (x.f || (x.b && x.b.name === "S&P500")) for (var j = i - 2; j <= i + 2; j++) nearI[j] = 1; });
    var lbCut = !S.lbAll && rowsB.length > 9;
    var myRank = rowsB.map(function(x){ return x.f && x.f.k; }).indexOf(F.k) + 1;
    // 10/14 A11-3: 등수 변천 — 「전체」 묶음에서 날짜마다 내 포트가 몇 위였나(시작일은 모두 0% 라 뺌)
    var rkH = null, rkTot = BM.length + PF.length, rkY = null, rkSvg = "";
    if (S.bg === "전체" && P.dates.length > 2){ rkH = [];
      for (var di = 1; di < P.dates.length; di++){ var mv = F.line[di]; if (mv == null){ rkH.push(null); continue; }
        var cnt = 1; BM.forEach(function(m){ var v = (B[m.name] || [])[di]; if (v != null && v > mv) cnt++; }); PF.forEach(function(f){ if (f !== F && f.line[di] != null && f.line[di] > mv) cnt++; });
        rkH.push(cnt); }
      rkY = rkH.length > 1 ? rkH[rkH.length - 2] : null;
      var pts = [], rw = 64, rh = 18, rn = rkH.length;
      rkH.forEach(function(rv, i){ if (rv == null) return; pts.push((2 + i * (rw - 4) / Math.max(1, rn - 1)).toFixed(1) + "," + (2 + (rv - 1) / Math.max(1, rkTot - 1) * (rh - 4)).toFixed(1)); });
      if (pts.length > 1) rkSvg = '<svg class="po-rks" viewBox="0 0 ' + rw + ' ' + rh + '" width="' + rw + '" height="' + rh + '"><polyline points="' + pts.join(" ") + '" fill="none" stroke="' + F.color + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + pts[pts.length - 1].split(",")[0] + '" cy="' + pts[pts.length - 1].split(",")[1] + '" r="2.2" fill="' + F.color + '"/></svg>';
    }
    var rkNow = rkH && rkH.length ? rkH[rkH.length - 1] : myRank;
    var rkDelta = rkY == null || rkNow == null ? '' : (rkNow < rkY ? '<em class="w">어제 ' + rkY + '위 ↑</em>' : rkNow > rkY ? '<em class="l">어제 ' + rkY + '위 ↓</em>' : '<em>어제도 ' + rkY + '위</em>');
    // 10/15 A11-5: 포트 카드 4장(같은 「9/14곳 이김」 반복) → 등수 한 줄 띠 · 「전체」 묶음 기준 · 어제 등수와 비교
    var rkOf = function(f, di){ var mv = f.line[di]; if (mv == null) return null; var c = 1;
      BM.forEach(function(m){ var v = (B[m.name] || [])[di]; if (v != null && v > mv) c++; }); PF.forEach(function(g){ if (g !== f && g.line[di] != null && g.line[di] > mv) c++; }); return c; };
    var nL = P.dates.length - 1, RK = PF.map(function(f){ return {f: f, now: rkOf(f, nL), y: nL >= 2 ? rkOf(f, nL - 1) : null, w: beat(f)}; })
      .sort(function(a, b){ return (a.now || 99) - (b.now || 99); });
    var wSame = RK.every(function(x){ return x.w === RK[0].w; });
    var stripH = '<div class="po-rkb"><div class="po-rkbh">🏁 전체 ' + rkTot + '곳 중 등수 <small>누르면 그 포트 기준</small></div><div class="po-rkbr">' +
      RK.map(function(x){ return '<button type="button" data-pf="' + x.f.k + '" class="' + (S.pf === x.f.k ? "on" : "") + '">' + x.f.ic + ' <b>' + (x.now || "–") + '</b>위</button>'; }).join("") + '</div>' +
      '<div class="po-rkbs">' + (wSame ? (PF.length > 1 ? PF.length + '개 포트 모두 ' : '') + '시장 ' + BM.length + '곳 중 <b>' + RK[0].w + '</b>곳 이김'
        : '이긴 시장 ' + RK.map(function(x){ return x.f.ic + ' <b>' + x.w + '</b>'; }).join(' · ') + ' / ' + BM.length + '곳') + '</div>' +
      (nL >= 2 ? '<div class="po-rkbs">어제보다 ' + RK.map(function(x){ if (x.y == null || x.now == null) return x.f.ic + ' –';
        return x.y === x.now ? x.f.ic + ' ' + x.now + ' 그대로' : '<span class="' + (x.now < x.y ? "w" : "l") + '">' + x.f.ic + ' ' + x.y + '→' + x.now + (x.now < x.y ? ' ↑' : ' ↓') + '</span>'; }).join(' · ') + '</div>' : '') +
      (honC(F) ? '<div class="po-rkbo">' + F.ic + ' ' + F.t + ' ' + honC(F) + '</div>' : '') + '</div>';
    var cmpH = '<div class="sec">🏁 시장 ' + BM.length + '곳과 비교 <small class="mut">' + md(P.start) + '부터 · 달러 기준</small></div><section class="card po-lb">' +
      stripH +
      '<div class="po-chips">' + BGRP.filter(function(g){ return g === "전체" || BM.some(function(m){ return m.group === g; }); }).map(function(g){
        return '<button data-bg="' + g + '" class="' + (S.bg === g ? "on" : "") + '">' + g + '</button>'; }).join("") + '</div>' +
      '<div class="po-rank"><b>' + F.ic + ' ' + F.t + '</b>' + (rkSvg ? '<span class="po-rkh">' + rkDelta + rkSvg + '</span>' : '') + '<span class="po-rn">' + myRank + '<small>위 / ' + rowsB.length + '</small></span></div>' +
      '<div class="po-rk">' + rowsB.map(function(x, i){
        if (lbCut && !nearI[i]) return (nearI[i - 1] ? '<div class="po-gapr">⋯</div>' : '');
        var v = x.ret, dv = v - F.ret, cap = 3, w = Math.min(Math.abs(dv), cap) / cap * 50;   // 10/14 A11-3: 막대 가운데 = 내 포트(0점) · 오른쪽 = 그쪽이 앞섬 · 왼쪽 = 내가 앞섬 · ±3%p 넘으면 ›‹
        var bar = '<div class="bar z"><span class="' + (dv > 0 ? "p" : "m") + '" style="width:' + w.toFixed(1) + '%"></span>' + (Math.abs(dv) > cap ? '<em class="ov ' + (dv > 0 ? "r" : "l") + '">' + (dv > 0 ? "›" : "‹") + '</em>' : '') + '</div>';
        if (x.f) return '<div class="po-rr me' + (x.f.k === "kick" ? " k" : "") + (S.pf === x.f.k ? " on" : "") + '" data-pf="' + x.f.k + '"><span class="no">' + (i + 1) + '</span><span class="n">' + x.f.ic + ' <b>' + x.f.t + '</b></span>' + bar + '<b class="v ' + cls(v) + '">' + sg(v) + '</b><span class="d"></span></div>';
        var m = x.b, on = S.bsel.indexOf(m.name) >= 0, d = F.ret - m.ret;
        return '<div class="po-rr' + (on ? " sel" : "") + '" data-bn="' + e(m.name) + '"><span class="no">' + (i + 1) + '</span><span class="n"><i class="dot" style="' + (on ? "background:" + (BCOL[m.name] || "#8a94a8") : "") + '"></i>' + e(m.name) +
          '<small>' + e(m.group) + (m.local != null && Math.abs(m.local - m.ret) >= 0.05 ? ' · 현지 ' + sg(m.local, 1) : '') + '</small></span>' + bar +
          '<b class="v ' + cls(v) + '">' + sg(v) + '</b><span class="d ' + (d >= 0 ? "w" : "l") + '">' + (d >= 0 ? "앞섬 " : "뒤짐 ") + sg(d, 1).replace("%", "p") + '</span></div>'; }).join("") + '</div>' +
      (rowsB.length > 9 ? '<button class="po-all" data-lball="1">' + (S.lbAll ? '내 자리 근처만 보기 ▴' : '전체 ' + rowsB.length + '곳 보기 ▾') + '</button>' : '') +
      '<p class="note" style="margin:6px 0 0">지수 줄을 누르면 아래 그래프 「전체」에 넣고 빼요(최대 5개). 막대 가운데 선 = ' + F.ic + ' ' + F.t + ' (초록 왼쪽 = 내가 앞섬 · 빨강 오른쪽 = 그쪽이 앞섬 · ±3%p 넘으면 ›). 「앞섬·뒤짐」도 같은 기준. 포트와 같은 달러 기준이라 코스피·니케이처럼 현지 통화와 다를 땐 「현지」 수익률을 함께 적었어요.</p></section>';
    var ex = F.ret - B["S&P500"][B["S&P500"].length - 1];
    var cmp = S.bsel.slice(0, 4);
    var spN = B["S&P500"][B["S&P500"].length - 1];
    var gapB = function(v){ var d = v - spN; return '<em class="' + (d >= 0 ? "w" : "l") + '">' + (d >= 0 ? "앞섬 " : "뒤짐 ") + sg(d).replace("%", "%p") + '</em>'; };
    var FB = PF.filter(function(f){ return f.k === "base"; })[0], FM = PF.filter(function(f){ return f.k === "mine"; })[0];
    var fxv = FB && FM && FB.ret != null && FM.ret != null ? FM.ret - FB.ret : null, fxD = myDiff(MW);
    var h = winHtml() + '<section class="po-sum" id="posum"><div class="po-sh"><span id="posumh">' + md(P.start) + '부터 성적</span> <small>S&P500보다 <button class="po-shb" type="button" data-pshare="1">📤 공유</button></small></div>' +
      PF.map(function(f){ var op = S.sumOpen === f.k; return '<button class="po-sr' + (S.pf === f.k ? " on" : "") + (op ? " op" : "") + ' ' + f.k + '" data-pf="' + f.k + '" data-sumo="1"><span>' + f.ic + ' ' + f.t + ' <i class="po-sra">' + (op ? '▴' : '▾') + '</i></span><b class="' + cls(f.ret) + '">' + sg(f.ret) + '</b>' + gapB(f.ret) + '</button>' + (op ? holdBox(f) : ''); }).join("") +
      (fxv != null ? '<div class="po-myfx" id="pomyfx">🙋 내 선택 효과 ' + fxTag(fxv) + ' <small>' + (fxD.length ? '💼 기본 포트 대비' : '아직 기본과 같은 비중') + '</small></div>' : '') +
      '<div class="po-sr sp"><span>🇺🇸 S&P500</span><b class="' + cls(spN) + '">' + sg(spN) + '</b><em>기준</em></div></section>' + infHtml() +
      '<section class="po-hero' + (F.k === "kick" ? " kick" : F.k === "conc" ? " conc" : F.k === "mine" ? " mine" : "") + '"><div class="po-k">' + F.ic + ' <b>' + F.t + '</b> · ' + F.s + ' · ' + md(P.start) + '부터</div>' +
      '<div class="po-gap ' + (ex >= 0 ? "w" : "l") + '"><small>S&P500보다</small><b>' + sg(ex).replace("%", "%p") + '</b><em>' + (ex >= 0 ? "앞서는 중 👍" : "뒤지는 중") + '</em></div>' +
      '<div class="po-rl2">수익률 <b class="' + cls(F.ret) + '">' + sg(F.ret) + '</b> · S&P500 <b class="' + cls(spN) + '">' + sg(spN) + '</b></div>' + (F.k === "mine" && fxv != null ? '<div class="po-fx"><div class="po-fxh">🙋 내 선택 효과 ' + fxTag(fxv) + '<small>내 포트 ' + sg(FM.ret) + ' vs 💼 기본 ' + sg(FB.ret) + '</small></div>' +
        '<div class="po-fxd">' + (fxD.length ? '다른 점: ' + fxD.map(e).join(' · ') : '아직 기본 포트와 같은 비중이에요 — 아래 🙋 칸에서 바꾸면 여기 차이가 생겨요') + '</div>' +
        '<details class="po-fxb"><summary>날짜별로 내 선택이 벌고 잃은 것</summary>' + fxBars(FM, FB) + '</details></div>' : '') + (honV(F) != null ? '<div class="po-hon">' + honC(F) + '<small>' + (F.k === "kick" ? "돌파 칸은 다음 거래일 종가에 사고 비용을 뺀 값" : "주 1회만 비중을 맞추고 그때 비용을 뺀 값") + '</small></div>' : '') +
      '<div class="po-won">💰 ' + won(S.amt) + '원 넣었다면 <b class="' + cls(F.ret) + '">' + (F.ret >= 0 ? "+" : "−") + won(Math.abs(S.amt * F.ret / 100)) + '원</b>' +
        ' <small>S&P였다면 ' + (B["S&P500"][B["S&P500"].length - 1] >= 0 ? "+" : "−") + won(Math.abs(S.amt * B["S&P500"][B["S&P500"].length - 1] / 100)) + '원 · 금액은 📋 따라하기 투자금 기준</small></div>' +
      (F.k === "conc" && CN && CN.now ? '<div class="po-cbuy"><div class="po-cbh">🛒 지금 살 것 <small>' + won(S.amt) + '원 · ' + (S.mode === "kr" ? "₩ 원화" : "💵 외화") + ' · ' + (CN.regime && CN.regime.up ? "🟢 오르는 시장" : "🔴 오르는 시장 아님") + '</small></div>' +
        concPlan().map(function(c){ var it = c.items[0] || {};
          if (c.kick) return '<div class="cn-buy" data-goto="port~pofollow"><b class="pct">' + c.x.pct + '%</b><span class="nm">⚡ 킥 종목 ' + c.items.length + '개<small>' + c.items.slice(0, 4).map(function(t){ return e(t.short); }).join(" · ") + (c.items.length > 4 ? " …" : "") + '</small></span><span class="q"><b>›</b><small>' + won(c.amt) + '원</small></span></div>';
          return '<div class="cn-buy" data-op="' + e(it.code) + '"><b class="pct">' + c.x.pct + '%</b><span class="nm">' + e(c.x.name) + '<small>' + e(it.nm) + (it.code && it.code !== it.nm ? ' ' + e(it.code) : '') + '</small></span>' +
            '<span class="q"><b>' + (it.sh != null ? it.sh.toLocaleString("ko-KR") + '주' : '가격 확인') + '</b><small>' + won(c.amt) + '원</small></span></div>'; }).join("") +
        '<div class="po-cbn">판정이 바뀌는 날 · 🔄 월말 흐름 날에만 고치면 돼요 · 투자금은 📋 따라하기에서</div></div>' : '') +
      (function(){ var VR = F.k === "kick" ? (K && K.vol_rule) : F.k === "conc" ? (CN && CN.vol_rule) : F.k === "mine" ? null : P.vol_rule; if (!VR || !VR.on) return '';
        return '<div class="po-vr" data-tip="' + e("🦴 변동성 맞춤(" + VR.role + ") — S&P½+나스닥½ 최근 20일 흔들림이 목표 " + VR.target + "%를 넘으면 주식을 그만큼 줄여 현금·단기채로. 바닥 " + VR.floor + "% · 5%p 넘게 바뀔 때만 조정 · " + (VR.from || "").slice(5) + "부터") + '">🦴 변동성 방어(' + e(VR.role) + ') · 주식 <b>' + VR.eq_scale + '%</b> 유지 <small>20일 흔들림 ' + VR.vol20 + '% / 목표 ' + VR.target + '% ⓘ</small></div>'; })() +
      // 🔄 10/28 Q10/28-2: 연기금 월말 리밸런싱 앞지르기 (💼 port.json month_flow · 🎯 conc.json month_flow — Q10/28-3)
      (function(){ var M = F.k === "conc" ? (CN && CN.month_flow) : (F.k === "kick" || F.k === "mine") ? null : P.month_flow; if (!M || !M.on) return '';
        var tip = "🔄 월말 흐름 — 매달 마지막 " + M.k + "거래일, 60/40 펀드(S&P·중기채) 주식 비중이 ±" + M.th + "%p 넘게 쏠리면 펀드가 억지로 사고팔 쪽에 미리 섬: 넘침 → 주식 칸 " + Math.round((M.f || 0.6) * 100) + "% 미국 장기채(TLT) · 모자람 → " + (F.k === "conc" ? "추세·현금" : "금·추세") + " 칸 " + Math.round((M.f || 0.6) * 100) + "% 주식. 하루 먼저 알림 → 그날 밤 미국 종가 예약(LOC). 검증 2017~ 연 +" + (F.k === "conc" ? "2.3" : "2.4") + "%p · " + (M.from || "").slice(5) + "부터";
        var st = M.sig > 0 ? '주식 → 장기채 <b>' + M.pct + '%</b>' : M.sig < 0 ? (F.k === "conc" ? '추세·현금 → 주식 쪽' : '금·추세 → 주식 쪽') : M.window ? '쏠림 작음 · 그대로' : '쉬는 중 · 월말 ' + M.k + '거래일에만';
        // ⏰ 11/17 Q11/6-3: 하루 먼저 알림 — 오늘 밤 미국 종가 예약(LOC) 주문 (port.json·conc.json month_flow.tonight)
        var T = M.tonight, ton = T && T.act ? '<div class="po-vr" style="border:1px solid #ffb84d;background:rgba(255,184,77,.10)" data-tip="' + e((T.note || "") + " · " + (T.for || "").slice(5) + " 비중을 오늘 밤 장 마감 가격으로 맞춰 둠") + '">⏰ <b>' + e(T.text) + '</b> <small>' + (T.order_at || "").slice(5) + ' 밤 · ' + (T.drift != null ? '쏠림 ' + (T.drift >= 0 ? "+" : "") + T.drift + '%p · ' : '') + '하루 먼저 알림 ⓘ</small></div>' : '';
        return ton + '<div class="po-vr" data-tip="' + e(tip) + '">🔄 월말 흐름 · ' + st + ' <small>' + (M.drift != null ? '쏠림 ' + (M.drift >= 0 ? "+" : "") + M.drift + '%p · ' : '') + (M.for || "").slice(5) + ' 기준 ⓘ</small></div>'; })() +
      '<div class="po-sub">' + F.days + '거래일 · 시장 ' + BM.length + '곳 중 <b>' + beat(F) + '</b>곳보다 앞섬 · 가장 크게 빠졌을 때 <b>' + sg(F.mdd) + '</b></div>' +
      '<div class="po-cmp n' + cmp.length + '">' + cmp.map(function(n){ var x = B[n][B[n].length - 1];
        return '<div style="border-top:3px solid ' + (BCOL[n] || "#8a94a8") + '"><small>' + e(n) + '</small><b class="' + cls(x) + '">' + sg(x) + '</b><em class="' + (F.ret >= x ? "w" : "l") + '">' + (F.ret >= x ? "포트가 앞섬" : "포트가 뒤짐") + '</em></div>'; }).join("") + '</div>' +
      // 10/14 A11-2: 「🔍 내 포트만」(기본) = 💼⚡🎯 + S&P 만 · 둥근 눈금 · 선 끝 값(범례 없음) / 「전체」 = 고른 지수까지(지수 줄 눌러 넣고 빼기)
      '<div class="po-ctg"><button data-cm="1" class="' + (S.cmine ? "on" : "") + '">🔍 내 포트만</button><button data-cm="0" class="' + (S.cmine ? "" : "on") + '">전체 ' + (S.bsel.length + 1) + '</button>' +
        '<small>' + (S.cmine ? "S&P 와 세 포트만 크게" : "지수 줄을 누르면 넣고 빼요") + '</small></div>' +
      '<div class="po-ch">' + (S.cmine
        ? V.lines(PF.map(function(f){ return {name: f.ic + " " + f.t, short: f.ic, color: f.color, vals: f.line}; }).concat([{name: "S&P500", short: "S&P", color: BCOL["S&P500"], vals: B["S&P500"], dash: 1}]),
            P.dates.map(md), {h: 200, unit: "%", zero: 1, nodots: P.dates.length > 12, marks: marks(F), endLabels: 1, niceTicks: 1, nolegend: 1})
        : V.lines([{name: F.ic + " " + F.t, color: F.color, vals: F.line}].concat(S.bsel.map(function(n){ return {name: n, color: BCOL[n] || "#8a94a8", vals: B[n], dash: 1}; })),
            P.dates.map(md), {h: 200, unit: "%", zero: 1, nodots: P.dates.length > 12, marks: marks(F), niceTicks: 1})) + '</div>' +
      '<div class="po-mk"><span><i style="background:#ffb84d"></i>비중·상품 바뀐 날</span>' + (F.k === "kick" ? '<span><i style="background:#4dd47a"></i>킥 사기</span><span><i style="background:#ff6b6b"></i>킥 팔기</span>' : '') + '</div>' +
      '<div class="po-w">S&P를 이긴 날 <b>' + F.win + ' / ' + F.days + '</b>' + (F.best ? ' · 가장 좋았던 날 ' + md(F.best.d) + ' <b class="up">' + sg(F.best.r) + '</b>' : '') + (F.worst ? ' · 가장 나빴던 날 ' + md(F.worst.d) + ' <b class="dn">' + sg(F.worst.r) + '</b>' : '') + '</div>' +
      (P0.dates.length > 3 ? '<div class="po-scr" id="poscr"><div class="po-scrh">👆 시작일 문지르기 <small>밀면 「그날부터 샀다면」이 바로 바뀌어요</small></div>' +
        '<input type="range" id="poscrr" min="0" max="' + (P0.dates.length - 2) + '" step="1" value="' + WB + '" aria-label="비교 시작일">' +
        '<div class="po-scrt"><span>' + md(P0.dates[1]) + '</span><span>' + md(P0.dates[P0.dates.length - 1]) + '</span></div>' +
        '<div class="po-scro" id="poscro">' + scrubOut(WB) + '</div></div>' : '') + '</section>';
    if (S.pf === "mine") h += myHtml(MW);   // 🙋 고르는 칸은 성적 바로 아래 (바꾸면 위 숫자가 바로 바뀌는 게 보이게)
    h += cmpH;   // 10/12: 위 바로가기 칩 순서(💼 성적 → 🏁 비교)와 맞춤
    // 🗣 10/27 A10/27-1 목소리 경주 (voices.js) — 포트 선은 여기서 넘겨 줌(🙋 내 포트는 휴대폰 계산)
    try { window.__poLines = {dates: P.dates, base: FB && FB.line, mine: FM && FM.line, mineName: FM && FM.t}; } catch(x) {}
    h += '<div class="sec">🗣 목소리 경주 <small class="mut">누구 말을 따랐어야 했나 · 같은 돈</small></div><section class="card vr-c"><div id="vrace" class="vr-w"><small class="mut">불러오는 중…</small></div></section>';
    h += '<div id="podz"></div>';   // 🎛 10/21 A10/21-1 포트 설계기 (port_design.js)

    if (CN && CN.regime) h += concHtml();
    if (K && S.pf === "kick") h += kickHtml();

    // ② 따라하기
    var isC = S.pf === "conc" && CN && CN.now;
    var segs = S.pf === "mine" ? myPlan().map(function(c, i){ return {label: c.x.name, v: c.x.pct, color: c.kick ? "#ff6b6b" : c.prod ? "#38bdf8" : c.i >= 0 ? COL[c.i % COL.length] : "#8a94a8"}; }) : isC ? concPlan().map(function(c, i){ return {label: c.x.name, v: c.x.pct, color: c.kick ? "#ff6b6b" : COL[i % COL.length]}; }) : P.hold.map(function(x, i){ return {label: x.name, v: x.pct, color: COL[i % COL.length]}; });
    h += '<div class="sec">📋 지금 이렇게 담으면 돼요 <small class="mut">' + (S.pf === "mine" ? "🙋 내가 정한 비중 기준" : md(P.changes[0] && P.changes[0].date) + ' 배분표 기준') + '</small></div>' +
      '<section class="card po-follow"><div data-vd></div><div class="po-sb">' + segs.map(function(sg_, i){ return sg_.v > 0 ? '<i data-ix="' + i + '" style="flex:' + sg_.v + ';background:' + sg_.color + '" title="' + e(sg_.label) + '"></i>' : ''; }).join("") + '</div>' +
      '<div class="po-sbl">' + segs.map(function(sg_, i){ return '<span data-ix="' + i + '" class="' + (sg_.v > 0 ? "" : "z") + '"><i style="background:' + sg_.color + '"></i>' + e(sg_.label) + ' <b>' + sg_.v + '%</b></span>'; }).join("") + '</div>' +
      '<div class="po-in"><label>내 투자금</label><div class="po-amt"><input id="poamt" inputmode="numeric" value="' + S.amt.toLocaleString("ko-KR") + '"><span>원</span></div>' +
      '<div class="po-q">' + [3e6, 1e7, 3e7, 1e8].map(function(v){ return '<button data-v="' + v + '">' + won(v) + '</button>'; }).join("") + '</div>' +
      '<div class="po-mode po-pf"><button data-pf="base" class="' + (S.pf === "base" ? "on" : "") + '">💼 기본</button>' + (K ? '<button data-pf="kick" class="' + (S.pf === "kick" ? "on" : "") + '">⚡ 킥 포함</button>' : '') + (CN && CN.now ? '<button data-pf="conc" class="' + (S.pf === "conc" ? "on" : "") + '">🎯 집중+킥</button>' : '') + '<button data-pf="mine" class="' + (S.pf === "mine" ? "on" : "") + '">🙋 내 포트</button></div>' +
      '<div class="po-mode"><button data-m="us" class="' + (S.mode === "us" ? "on" : "") + '">💵 외화 베이스</button><button data-m="kr" class="' + (S.mode === "kr" ? "on" : "") + '">₩ 원화 베이스</button></div></div>' +
      '<div class="po-rcp"><div class="po-rch">🧾 주문서 <small>' + won(S.amt) + '원 · ' + (S.mode === "kr" ? "₩ 원화" : "💵 외화") + '</small></div>' +
      // 10/14 A11-4: 「갖고 있는 주 수」를 넣으면 주문서가 「처음부터 다 사기」 대신 「바꿀 것만」(+n주 사기 · −n주 팔기 · 그대로)
      '<div class="po-hv"><button type="button" id="pohvt" class="' + (S.hv ? "on" : "") + '">' + (S.hv ? "✍️ 갖고 있는 주 수 넣는 중" : "✍️ 갖고 있는 주 수 넣기") + '</button><small>' + (S.hv ? "주문서가 「바꿀 것만」 보여 줘요 · 휴대폰에만 저장" : "넣으면 「바꿀 것만」 보여 줘요") + '</small></div>' +
      '<p class="po-rl" style="margin:6px 0 2px;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all">💼 기본 포트는 S&P500 200일선 규칙이 먼저예요 · 🔁 닮은 장 규칙은 국내 주식과 시장별 참고용 (11/12)</p>' +   // 🔁 11/12 사용자 「그 한 줄 넣고」
      bearBtn() +
      '<div id="porows"></div><div id="pobrx"></div><div id="pohvx"></div>' +
      '<div class="po-cp"><button class="btn" id="pocopy">📋 주문 목록 복사</button><span id="pocpst"></span></div></div>' +
      '<p class="note">환율 ' + (P.fx ? P.fx.toLocaleString("ko-KR") + "원" : "–") + ' · 주 수는 ' + md(P.asof) + ' 종가 기준 내림. <b>외화 베이스</b> = 미국 ETF를 달러로 · <b>원화 베이스</b> = 같은 걸 담은 한국 상장 ETF로 바꿔 원화로. 원화 상품이 없는 칸과 해외 개별 종목(🇭🇰 등)은 원화 베이스에서도 외화예요. ' +
      '<b>비중이 바뀐 날(아래 「비중 바뀐 날」)에만 고치면</b> 돼요.</p></section>';

    // ③ 비중 바뀐 날
    h += '<div class="sec">🔁 비중 바뀐 날</div><section class="card po-tl no-clp">' + P.changes.map(function(c, i){
      return '<div class="po-tli' + (i === 0 ? " now" : "") + '"><span class="d">' + md(c.date) + (i === 0 ? ' <em>지금</em>' : '') + '</span><span class="t">' + e(c.why || "") + '</span></div>'; }).join("") +
      (P.changes.length < 2 ? '<p class="note" style="margin:6px 0 0">' + md(P.start) + ' 이후 배분표가 그대로예요. 리포트가 비중을 바꾸면 여기에 쌓이고 알림이 가요.</p>' : '') + '</section>';

    // 🧭 섹터 의견 (10/11 C안) — 리포트의 섹터 판단은 배분표 밖에서 그림자로 채점 (port.json views)
    if (P.views && P.views.rows && P.views.rows.length){
      var VW = P.views, vmx = Math.max.apply(null, VW.rows.map(function(x){ return Math.abs(x.ret || 0); }).concat([0.5]));
      // 10/28 사용자 「2번」: 섹터 의견 = 실제 돈 (🧭 섹터 칸 = 주식의 20%) — 칩의 %는 실제 비중
      var SLV = (P.hold || []).filter(function(x){ return /^🧭/.test(x.name); }).reduce(function(a, x){ return a + (+x.pct || 0); }, 0), VT = VW.rows.reduce(function(a, x){ return a + (+x.pct || 0); }, 0);
      var realPct = function(x){ return SLV && VT ? Math.round(x.pct / VT * SLV * 10) / 10 : x.pct; };
      h += '<div class="sec">🧭 섹터 칸 <small class="mut">' + (SLV ? '실제 ' + Math.round(SLV * 10) / 10 + '% (주식의 20%) · 리포트 섹터 판단대로 · 지수 코어와 비교' : '리포트의 섹터 판단 · 돈은 안 넣고 지수 코어와 비교') + '</small></div><section class="card po-vw">' +
        (VW.pending ? '<p class="cn-n">' + md(VW.since) + ' 첫 거래일부터 채점해요. 12/23에 코어(S&P½+나스닥½)와 비교해 키울지·접을지 정해요.</p>'
          : '<div class="cn-v" style="grid-template-columns:repeat(3,1fr)"><div class="me"><small>🧭 섹터 ' + (SLV ? "칸" : "의견") + '</small><b class="' + cls(VW.ret) + '">' + sg(VW.ret) + '</b></div><div><small>코어</small><b class="' + cls(VW.core) + '">' + sg(VW.core) + '</b></div><div><small>차이</small><b class="' + cls(VW.edge) + '">' + sg(VW.edge).replace("%", "%p") + '</b></div></div>') +
        '<div class="po-vcs">' + VW.rows.map(function(x, i){ var st = x.ret == null ? "wait" : x.ret - (VW.core || 0) >= 0 ? "g" : "b";
          return '<button class="po-vc ' + st + '" data-vi="' + i + '"><b>' + e(x.name.replace(/\s*\(.*\)$/, "")) + '</b> ' + realPct(x) + '%<small>' + (x.ret == null ? "대기" : sg(x.ret, 1) + (st === "g" ? " ↑" : " ↓")) + '</small></button>'; }).join("") + '</div>' +
        '<div class="po-vd" id="povd"></div>' +
        '<p class="note" style="margin:6px 0 0">10/11부터 💼 기본 포트 뼈대는 검증한 규칙(🟢 S&P·나스닥 코어 95%·금 5% / 🔴 코어 63%·금 11%·현금 26%)이 정해요. 2017년 이후 옛 뼈대(섹터 칸 + 현금 26% 상시)는 S&P보다 연 −1.5%p, 새 뼈대는 +1.9%p였어요.</p></section>';
    }

    // 🌏 해외 동종주 (market/peers.json) — 미국 강세 섹터와 같은 일을 하는 일·중·홍·대만·한국 종목을 달러 기준으로 비교
    if (PE && PE.themes && PE.themes.length) h += peersHtml();

    // ④ 칸별 기여
    var mx = Math.max.apply(null, P.hold.map(function(x){ return Math.abs(x.contrib) || 0.01; }));
    h += '<div class="sec">🧩 어느 칸이 벌고 잃었나 <small class="mut">' + md(P0.start) + '부터 기여 %p' + (WB ? ' (📅 구간과 상관없이 처음부터)' : '') + '  · 칸별 신호(S&P 대비·20일선)</small></div><section class="card po-ct">' +
      P.hold.slice().sort(function(a, b){ return b.contrib - a.contrib; }).map(function(x){
        var i = P.hold.indexOf(x), w = Math.abs(x.contrib) / mx * 50;
        var us = x.us.map(function(u){ return '<span class="po-tk" data-op="' + e(u.t) + '">' + e(u.t) + '</span> ' + sg(u.since, 1); }).join(" · ");
        var sgc = /^강함/.test(x.sig || "") ? "g" : /^약함/.test(x.sig || "") ? "b" : /^꺾이/.test(x.sig || "") ? "w" : "";
        return '<div class="po-cr"><div class="n"><i style="background:' + COL[i % COL.length] + '"></i>' + e(x.name) + ' <small>' + x.pct + '%</small>' + (sgc ? ' <span class="po-sg ' + sgc + '">' + e(x.sig.split(" — ")[0]) + '</span>' : '') + '<em>' + us + '</em>' + (sgc ? '<em class="sgt">' + e((x.sig.split(" — ")[1] || "")) + '</em>' : '') + pvs(x.pick_vs) + '</div>' +
          '<div class="bar"><span class="' + (x.contrib >= 0 ? "p" : "m") + '" style="width:' + w.toFixed(1) + '%"></span></div><b class="' + cls(x.contrib) + '">' + sg(x.contrib) + 'p<small class="po-cw">' + (x.contrib >= 0 ? "+" : "−") + won(Math.abs(S.amt * x.contrib / 100)) + '원</small></b></div>'; }).join("") + '</section>';

    // ⑤ 날짜별
    var CNm = {}; if (CN && CN.dates) CN.dates.forEach(function(d, i){ CNm[d] = i; });
    h += '<div class="sec">📅 날짜별 성적</div><section class="card"><table class="po-dt"><tr><th>날짜(미국)</th><th>💼 기본</th>' + (K ? '<th>⚡ 킥</th>' : '') + (CN ? '<th>🎯 집중</th>' : '') + '<th>🙋 내</th><th>S&P500</th></tr>' +
      P.daily.slice().reverse().slice(0, 15).map(function(d){
        var j = K ? K.dates.indexOf(d.d) : -1, kr = j > 0 ? ((1 + K.kick[j] / 100) / (1 + K.kick[j - 1] / 100) - 1) * 100 : null;
        var tag = function(x){ return x == null ? '' : (x >= d.spy ? ' <em class="w">이김</em>' : ' <em class="l">짐</em>'); };
        var mi = P.dates.indexOf(d.d), ml = PF.filter(function(f){ return f.k === "mine"; })[0].line, mr = mi > 0 ? ((1 + ml[mi] / 100) / (1 + ml[mi - 1] / 100) - 1) * 100 : null;
        var ci = CNm[d.d], cr = ci > 0 ? ((1 + CN.nav[ci] / 100) / (1 + CN.nav[ci - 1] / 100) - 1) * 100 : (ci === 0 ? CN.nav[0] : null);
        return '<tr><td>' + md(d.d) + '</td><td class="' + cls(d.r) + '">' + sg(d.r) + tag(d.r) + '</td>' + (K ? '<td class="' + cls(kr) + '">' + sg(kr) + tag(kr) + '</td>' : '') + (CN ? '<td class="' + cls(cr) + '">' + sg(cr) + tag(cr) + '</td>' : '') + '<td class="' + cls(mr) + '">' + sg(mr) + tag(mr) + '</td><td class="' + cls(d.spy) + '">' + sg(d.spy) + '</td></tr>'; }).join("") + '</table></section>' +
      '<p class="note">' + e(P.note) + ' 계산 ' + e(P.at) + (P.miss && P.miss.length ? ' · 시세 없음: ' + e(P.miss.join(", ")) : '') + '</p>';
    b.innerHTML = h;
    rows();
    var inp = document.getElementById("poamt");
    inp.oninput = function(){ var v = +inp.value.replace(/[^\d]/g, "") || 0; S.amt = v; keep(); rows(); };
    inp.onblur = function(){ inp.value = S.amt.toLocaleString("ko-KR"); };
    [].forEach.call(b.querySelectorAll(".po-q button"), function(x){ x.onclick = function(){ S.amt = +x.dataset.v; inp.value = S.amt.toLocaleString("ko-KR"); keep(); rows(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(x){ x.onclick = function(){ S.mode = x.dataset.m; keep();
      [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ if (x.dataset.sumo) S.sumOpen = S.sumOpen === x.dataset.pf ? "" : x.dataset.pf; S.pf = x.dataset.pf; keep(); pfJump(x); }; });
    [].forEach.call(b.querySelectorAll("[data-hbx]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var k = S.sumOpen; S.sumOpen = ""; keep(); var r = document.querySelector('#posum .po-sr[data-pf="' + k + '"]'); if (r) pfJump(r); else draw(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(x){ x.onclick = function(){ S.pf = x.dataset.p; keep();
      [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ if (x.dataset.sumo) S.sumOpen = S.sumOpen === x.dataset.pf ? "" : x.dataset.pf; S.pf = x.dataset.pf; keep(); pfJump(x); }; });
    [].forEach.call(b.querySelectorAll("[data-hbx]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var k = S.sumOpen; S.sumOpen = ""; keep(); var r = document.querySelector('#posum .po-sr[data-pf="' + k + '"]'); if (r) pfJump(r); else draw(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    document.getElementById("pocopy").onclick = copy;
    myBind(b);
    if (window.portDesign) try { portDesign(document.getElementById("podz"), {spx: +MW.spx || 0, ndx: +MW.ndx || 0, gold: +MW.gold || 0}); } catch(x) {}   // 🎛 A10/21-1
    var inf = b.querySelector(".po-inf"); if (inf) inf.addEventListener("toggle", function(){ S.inf = inf.open ? 1 : 0; keep(); });
    var hvt = document.getElementById("pohvt"); if (hvt) hvt.onclick = function(){ S.hv = S.hv ? 0 : 1; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); };   // A11-4
    var brt = document.getElementById("pobrt"); if (brt) brt.onclick = function(){ BEARON = !BEARON; var y = window.scrollY; draw(); window.scrollTo(0, y); };   // 🐻 A11/9-2
    if (window.foldify) foldify(b);
    // ⑩ 위에 붙는 미니 성적 띠 (접기 바로가기 칩과 한 덩어리) — 요약 카드가 안 보일 때만
    var fj = b.querySelector(".fold-jump");
    if (fj){ var st = document.createElement("div"); st.className = "po-stk"; fj.parentNode.insertBefore(st, fj);
      var mini = document.createElement("button"); mini.className = "po-mini"; mini.type = "button";
      mini.innerHTML = PF.map(function(f){ return '<span>' + f.ic + '<b class="' + cls(f.ret) + '">' + sg(f.ret) + '</b></span>'; }).join("") + '<span class="sp">S&P <b class="' + cls(spN) + '">' + sg(spN) + '</b></span><i>▲</i>';
      mini.onclick = function(){ var t = document.getElementById("posum"); if (t){ var y = t.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 8; window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); } };
      st.appendChild(mini); st.appendChild(fj);
      var sm = document.getElementById("posum"), upd = function(){ if (!st.isConnected) return window.removeEventListener("scroll", upd);
        var r = sm ? sm.getBoundingClientRect() : null; st.classList.toggle("mini-on", !!r && r.bottom < ((document.querySelector("header") || {}).offsetHeight || 0) + 10); };
      window.addEventListener("scroll", upd, {passive: true}); upd(); }
    [].forEach.call(b.querySelectorAll("[data-pshare]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); if (!window.chShare) return;
      chShare("CH Investing", "💼 CH Investing 포트 (" + md(P.start) + "부터)\n" + PF.map(function(f){ return f.ic + " " + f.t + " " + sg(f.ret) + " (S&P보다 " + sg(f.ret - spN).replace("%", "%p") + ")"; }).join("\n") + "\n🇺🇸 S&P500 " + sg(spN) + "\n\n※ 투자 참고용 · 매수 추천 아님", "port"); }; });
    // ③ 비교표 전체/내 자리
    [].forEach.call(b.querySelectorAll("[data-lball]"), function(x){ x.onclick = function(){ S.lbAll = !S.lbAll; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    // ④ 막대·범례를 누르면 그 칸 줄로
    [].forEach.call(b.querySelectorAll(".po-sb [data-ix], .po-sbl [data-ix]"), function(x){ x.onclick = function(){
      var r = b.querySelector('#porows .po-r[data-ix="' + x.dataset.ix + '"]') || b.querySelectorAll("#porows .po-r")[+x.dataset.ix]; if (!r) return;
      var y = r.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3; window.scrollTo({top: Math.max(0, y), behavior: "smooth"});
      r.classList.remove("flash"); void r.offsetWidth; r.classList.add("flash"); }; });
    // ⑧ 타임라인: 누르면 그날 이유 펼침
    [].forEach.call(b.querySelectorAll(".po-tli"), function(x){ x.onclick = function(){ x.classList.toggle("open"); }; });
    // ⑨ 섹터 의견 칩: 누르면 담는 상품
    [].forEach.call(b.querySelectorAll(".po-vc"), function(x){ x.onclick = function(){
      var d = document.getElementById("povd"), on = !x.classList.contains("on");
      [].forEach.call(b.querySelectorAll(".po-vc"), function(y){ y.classList.remove("on"); });
      if (!on || !d){ if (d) d.innerHTML = ""; return; } x.classList.add("on");
      var r = P.views.rows[+x.dataset.vi] || {};
      d.innerHTML = '<b>' + e(r.name) + '</b> · ' + r.pct + '%' + (r.ret != null ? ' · ' + sg(r.ret) : ' · 채점 대기') + (r.t && r.t.length ? '<br>담는 상품: ' + r.t.map(function(t){ return '<span class="po-tk" data-op="' + e(t) + '">' + e(t) + '</span>'; }).join(" · ") : ''); }; });
    [].forEach.call(b.querySelectorAll("[data-bn]"), function(x){ x.onclick = function(){ var n = x.dataset.bn, i = S.bsel.indexOf(n);
      if (i >= 0){ if (S.bsel.length > 1) S.bsel.splice(i, 1); } else { S.bsel.push(n); if (S.bsel.length > 5) S.bsel.shift(); }
      keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll("[data-bg]"), function(x){ x.onclick = function(){ S.bg = x.dataset.bg; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll("[data-win]"), function(x){ x.onclick = function(){ S.from = x.dataset.win === P0.start ? null : x.dataset.win; var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    var wi = document.getElementById("powin"); if (wi) wi.onchange = function(){ var v = wi.value; if (!v) return; S.from = v <= P0.start ? null : v; var y = window.scrollY; draw(); window.scrollTo(0, y); };
    [].forEach.call(b.querySelectorAll("[data-cm]"), function(x){ x.onclick = function(){ S.cmine = +x.dataset.cm; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });   // A11-2
    var sr = document.getElementById("poscrr");   // 10/15 A11-3: 미는 동안은 숫자만, 손 떼면 그래프·등수까지 다시 그림
    if (sr){ sr.oninput = function(){ scrubLive(+sr.value); };
      sr.onchange = function(){ var bi = +sr.value; S.from = bi ? P0.dates[bi + 1] : null; var top = sr.getBoundingClientRect().top; draw();
        var n = document.getElementById("poscrr"); if (n) window.scrollTo({top: window.scrollY + n.getBoundingClientRect().top - top, behavior: "instant"}); }; }
  }

  // 10/15 A11-4: 🙋 내 선택 효과 — 내 포트 − 기본 포트 (같은 구간·같은 날짜 줄)
  function fxTag(v){ var z = Math.abs(v) < 0.005; return '<b class="' + (z ? "" : v > 0 ? "w" : "l") + '">' + (z ? "0.00%p" : sg(v).replace("%", "%p")) + '</b>'; }
  function myDiff(MW){
    var H = P0.hold || [], pk = function(re){ var x = H.filter(function(h){ return re.test(h.name); })[0]; return x ? +x.pct || 0 : 0; };
    var bw = {spx: pk(/S&P/), ndx: pk(/나스닥/), gold: pk(/^금/), cash: pk(/현금/)}, out = [];
    [["S&P", "spx"], ["나스닥", "ndx"], ["금", "gold"], ["현금", "cash"]].forEach(function(q){ var a = bw[q[1]], c = +MW[q[1]] || 0; if (Math.abs(a - c) >= 0.5) out.push(q[0] + " " + r1(a) + "→" + r1(c) + "%"); });
    if (MW.st.length) out.push("⚡ 종목 " + MW.st.length + "개");
    return out;
  }
  function fxBars(FM, FB){
    var rows = [], mx = 0.05;
    for (var i = 1; i < P.dates.length; i++){ var a = FM.line[i], a0 = FM.line[i - 1], c = FB.line[i], c0 = FB.line[i - 1]; if (a == null || c == null) continue;
      var d = ((1 + a / 100) / (1 + (a0 || 0) / 100) - (1 + c / 100) / (1 + (c0 || 0) / 100)) * 100; rows.push([P.dates[i], d]); mx = Math.max(mx, Math.abs(d)); }
    if (!rows.length) return '<p class="note">아직 날짜가 부족해요.</p>';
    return rows.reverse().map(function(r){ var w = Math.abs(r[1]) / mx * 50, z = Math.abs(r[1]) < 0.005;
      return '<div class="po-fxr"><span>' + md(r[0]) + '</span><div class="po-fxbar"><i class="' + (r[1] >= 0 ? "g" : "n") + '" style="width:' + w.toFixed(1) + '%"></i></div><b class="' + (z ? "" : r[1] > 0 ? "w" : "l") + '">' + (r[1] > 0 ? "+" : "") + r[1].toFixed(2) + '%p</b></div>'; }).join("") +
      '<p class="note">초록 오른쪽 = 그날 내 선택이 기본보다 더 벌었음 · 파랑 왼쪽 = 덜 벌었음</p>';
  }
  // 10/15 A11-3: 👆 시작일 문지르기 — 미는 동안 「그날부터 샀다면」 숫자만 그 자리에서 다시 셈(그래프·등수는 손 뗄 때)
  var PFR = null;
  function relAt(arr, bi){ if (!arr) return null; var a = arr[bi], z = arr[arr.length - 1]; if (z == null) return null; a = a == null ? 0 : a; return ((1 + z / 100) / (1 + a / 100) - 1) * 100; }
  function scrubVals(bi){ return {sp: relAt(P0.bench["S&P500"], bi), pf: (PFR || []).map(function(f){ return {f: f, r: relAt(f.line0, bi)}; })}; }
  function scrubOut(bi){
    var X = scrubVals(bi), d = P0.dates[bi + 1], sel = X.pf.filter(function(x){ return x.f.k === S.pf; })[0] || X.pf[0];
    var gap = !sel || sel.r == null || X.sp == null ? null : sel.r - X.sp;
    return '<div class="po-scd"><b>' + md(d) + '부터</b> 샀다면' + (gap == null ? '' : ' <em class="' + (gap >= 0 ? "w" : "l") + '">' + sel.f.ic + ' S&P보다 ' + (gap >= 0 ? "앞섬 " : "뒤짐 ") + sg(gap).replace("%", "%p") + '</em>') + '</div>' +
      '<div class="po-scv">' + X.pf.map(function(x){ return '<span class="' + (x.f.k === S.pf ? "on" : "") + '">' + x.f.ic + ' <b class="' + cls(x.r) + '">' + sg(x.r) + '</b></span>'; }).join("") +
      '<span class="sp">S&P <b class="' + cls(X.sp) + '">' + sg(X.sp) + '</b></span></div>';
  }
  function scrubLive(bi){
    var o = document.getElementById("poscro"); if (o) o.innerHTML = scrubOut(bi);
    var X = scrubVals(bi), sh = document.getElementById("posumh"); if (sh) sh.textContent = md(P0.dates[bi + 1]) + "부터 성적";
    var R = {}; X.pf.forEach(function(x){ R[x.f.k] = x.r;
      var row = document.querySelector('#posum .po-sr[data-pf="' + x.f.k + '"]'); if (!row || x.r == null) return;
      var bb = row.querySelector("b"), ee = row.querySelector("em"); if (bb){ bb.className = cls(x.r); bb.textContent = sg(x.r); }
      if (ee && X.sp != null){ var g = x.r - X.sp; ee.className = g >= 0 ? "w" : "l"; ee.textContent = (g >= 0 ? "앞섬 " : "뒤짐 ") + sg(g).replace("%", "%p"); } });
    var spb = document.querySelector("#posum .po-sr.sp b"); if (spb && X.sp != null){ spb.className = cls(X.sp); spb.textContent = sg(X.sp); }
    var fx = document.querySelector("#pomyfx b"); if (fx && R.mine != null && R.base != null){ var t = document.createElement("span"); t.innerHTML = fxTag(R.mine - R.base); fx.replaceWith(t.firstChild); }
    var gp = document.querySelector("#pobody .po-hero .po-gap"); if (gp && R[S.pf] != null && X.sp != null){ var g2 = R[S.pf] - X.sp;
      gp.className = "po-gap " + (g2 >= 0 ? "w" : "l"); var gb = gp.querySelector("b"), ge = gp.querySelector("em"); if (gb) gb.textContent = sg(g2).replace("%", "%p"); if (ge) ge.textContent = g2 >= 0 ? "앞서는 중 👍" : "뒤지는 중"; }
  }
  // ② 그래프 표시: 비중·상품 바뀐 날(노랑) · 킥 사기(초록)·팔기(빨강) — 「그때 그 판단이 맞았나」를 눈으로
  function marks(F){
    var out = [], idx = function(d){ var i = P.dates.indexOf(d); if (i < 0) for (var j = 0; j < P.dates.length; j++) if (P.dates[j] >= d){ i = j; break; } return i; };
    (P.changes || []).forEach(function(c){ var i = idx(c.date); if (i > 0) out.push({i: i, color: "#ffb84d", t: "🔁 " + md(c.date) + " 비중·상품 바뀜"}); });
    if (F.k === "kick" && K) (K.events || []).forEach(function(ev){ if (ev.k !== "사기" && ev.k !== "팔기") return; if (ev.d < P.dates[0]) return; var i = idx(ev.d); if (i >= 0) out.push({i: i, color: ev.k === "사기" ? "#4dd47a" : "#ff6b6b", t: (ev.k === "사기" ? "🟢 사기 " : "🔴 팔기 ") + nm(ev.name) + (ev.r != null ? " " + sg(ev.r, 1) : "")}); });
    return out;
  }
  // 포트 고르기(기본·킥·집중): 다시 그린 뒤 「누른 버튼」이 화면 같은 자리에 오도록 (위 칸 높이가 바뀌어도 안 튐 · 10/12)
  function pfJump(x){
    var grp = x.closest(".po-sum") ? ".po-sum" : x.closest(".po-pf") ? ".po-pf" : x.closest(".po-pf2") ? ".po-pf2" : x.closest(".po-lbs") ? ".po-lbs" : x.closest(".po-rkb") ? ".po-rkb" : x.closest(".po-rk") ? ".po-rk" : null;
    var top = x.getBoundingClientRect().top, y0 = window.scrollY;
    var fold = {}; [].forEach.call(document.querySelectorAll("#pobody .fold"), function(f){ fold[f.id] = f.classList.contains("open"); });
    draw();
    var n = grp && document.querySelector("#pobody " + grp + ' [data-pf="' + S.pf + '"]');
    if (n){ var f = n.closest(".fold"); if (f && fold[f.id] && !f.classList.contains("open")) f.classList.add("open");
      // 다시 그린 뒤 1초 동안은 긴 글 접기·그림이 자리를 바꿔도 누른 버튼을 같은 자리에 붙잡아 둠 (손으로 스크롤하면 멈춤)
      var t0 = Date.now(), stop = false, quit = function(){ stop = true; };
      window.addEventListener("touchstart", quit, {once: true, passive: true}); window.addEventListener("wheel", quit, {once: true, passive: true});
      // 10/21: 붙잡는 1.2초 안에 다른 것(ⓘ 등)을 누르면 멈춤 — 안 멈추면 그 위에 설명 칸이 열릴 때 화면이 끌려가 누른 ⓘ 가 화면 밖으로 튐(화면 점검 port ⓘ 313→−14px)
      setTimeout(function(){ window.addEventListener("click", quit, {once: true, capture: true}); window.addEventListener("pointerdown", quit, {once: true, passive: true}); }, 0);
      (function hold(){ if (stop || !n.isConnected) return; var d = n.getBoundingClientRect().top - top; if (Math.abs(d) > 1) window.scrollTo({top: window.scrollY + d, behavior: "instant"});
        if (Date.now() - t0 < 1200) requestAnimationFrame(hold); })(); }
    else window.scrollTo(0, y0);
  }
  // 칸마다 무엇을 얼마나
  function wRows(){ return (K && K.whale && K.whale.rows || []).filter(function(r){ return r.on; }); }
  function kHold(){ return K && K.hold ? K.hold : (K ? K.open.map(function(o){ return {code: o.code, name: o.name, tags: "", w: o.w, r: o.r, now: o.now, rule: "손절 " + pr(o.stop)}; }) : []); }
  function kickW(){ return (K && S.pf === "kick") ? kHold().reduce(function(a, o){ return a + (o.w || 0); }, 0) : 0; }
  // 🎯 집중 포트 따라하기 (10/12) — conc.json now(지금 담을 것) · 가격은 기본 포트 칸에서 같은 티커를 찾아 씀
  function concPlan(){
    // 10/12 사용자: 집중 = S&P·나스닥 뼈대 + ⚡ 킥 종목 같이. 킥 칸 비중만큼 뼈대를 줄이고, 킥 줄은 킥 포함과 같은 모양
    var px = {}; P.hold.forEach(function(h){ (h.us || []).forEach(function(u){ px[u.t] = u; }); (h.kr || []).forEach(function(k){ px[k.code] = k; }); });
    var KH = K ? kHold() : [], kw = KH.reduce(function(a, o){ return a + (o.w || 0); }, 0), share = (100 - kw) / 100;
    var out = CN.now.map(function(n, i){
      var pct = Math.round(n.pct * share * 10) / 10, amt = S.amt * pct / 100, items = [], kr = n.kr && px[n.kr.code];
      if (n.items){ n.items.forEach(function(u){ var a3 = amt * (u.w || 0), usd3 = P.fx ? a3 / P.fx : null;    // 🧭 10/28 Q10/28-1: 현금 몫 → 자산 추세 칸(칸 안 비중대로)
        items.push({nm: (u.name ? u.name + " " : "") + u.t, code: u.t, amt: a3, usd: usd3, sh: usd3 && u.px ? Math.floor(usd3 / u.px) : null, px: u.px, cur: "$"}); }); }
      else if (S.mode === "kr" && n.kr){ var kp = kr && kr.px; items.push({nm: n.kr.name, code: n.kr.code, amt: amt, sh: kp ? Math.floor(amt / kp) : null, px: kp, cur: "원"}); }
      else { var u = px[n.t] || {}, usd = P.fx ? amt / P.fx : null; items.push({nm: n.t, code: n.t, amt: amt, usd: usd, sh: usd && u.px ? Math.floor(usd / u.px) : null, px: u.px, cur: "$"}); }
      return {x: {name: n.name, pct: pct}, i: i, amt: amt, items: items};
    });
    if (kw) out.push({x: {name: "⚡ 킥", pct: Math.round(kw * 10) / 10}, i: -1, amt: S.amt * kw / 100, kick: 1, items: KH.map(function(o){
      var a2 = S.amt * o.w / 100, kr2 = /^\d{6}\.K[SQ]$/.test(o.code), us2 = /^[A-Z\-]+$/.test(o.code), usd2 = us2 && P.fx ? a2 / P.fx : null;
      return {tags: o.tags || "", short: nm(o.name), nm: (o.tags ? o.tags + " " : "") + nm(o.name), code: o.code, amt: a2, usd: usd2, cur: us2 ? "$" : kr2 ? "원" : "현지",
              sh: us2 ? (usd2 && o.now ? Math.floor(usd2 / o.now) : null) : kr2 ? Math.floor(a2 / o.now) : null, note: o.rule || ""}; })});
    return out;
  }
  // 11/05 사용자 「각 포트 누르면 뭐를 담고 있는지 보여줘」 — 성적 줄을 누르면 그 포트가 지금 담은 칸·상품·종목을 바로 아래에 펼침(다시 누르거나 「닫기」로 접음)
  function holdBox(f){
    var sv = S.pf, pl = [];
    try { S.pf = f.k; pl = plan() || []; } catch(x) { console.warn("holdBox", x); } finally { S.pf = sv; }
    pl = pl.filter(function(p){ return p.x && p.x.pct > 0; });
    if (!pl.length) return '<div class="po-hb"><div class="po-hbn">담은 것을 아직 못 불러왔어요</div></div>';
    var col = function(p){ return p.kick ? "#ff6b6b" : p.prod ? "#38bdf8" : COL[p.i % COL.length]; };
    var tk = function(it){ var c = String(it.code || ""), us = /^[A-Z][A-Z.\-]{0,6}$/.test(c), n = String(it.short || it.nm || c).replace(c, "").replace(/\s*(Incorporated|Corporation|Holdings?|Company|Group|Class [A-C]|Common Stock)\b.*$/i, "").replace(/[\s\-–,·]+$/, "").trim() || c;
      if (n.length > 16) n = n.slice(0, 15) + "…";   // 미국 종목은 이름 밑에 티커
      return '<span class="po-hbi"' + (c ? ' data-op="' + e(c) + '"' : '') + '>' + (it.tags && n.indexOf(it.tags) < 0 ? e(it.tags) + ' ' : '') + e(n) + (us && n !== c ? '<small>' + e(c) + '</small>' : '') + '</span>'; };
    return '<div class="po-hb" data-hb="' + f.k + '"><div class="po-hbh">' + f.ic + ' <b>' + f.t + '</b>가 지금 담은 것 <small>' + (S.mode === "kr" ? "₩ 원화 상품" : "💵 외화 상품") + ' 기준</small></div>' +
      '<div class="po-hbbar">' + pl.map(function(p){ return '<i style="flex:' + p.x.pct + ';background:' + col(p) + '"></i>'; }).join("") + '</div>' +
      pl.map(function(p){ return '<div class="po-hbr"><div class="po-hbc"><i style="background:' + col(p) + '"></i><b>' + e(p.x.name) + '</b><span>' + p.x.pct + '%</span></div>' +
        '<div class="po-hbl">' + (p.items.length ? p.items.map(tk).join("") : '<span class="po-hbe">' + (p.kick ? '지금 빈 자리(현금)' : '현금·단기채') + '</span>') + '</div></div>'; }).join("") +
      '<button type="button" class="po-hbx" data-hbx="1">닫기 ▴</button></div>';
  }
  function plan(){
    if (S.pf === "conc" && CN && CN.now) return concPlan();
    if (S.pf === "mine") return myPlan();
    var kw = kickW(), out;
    // 🧪 10/12부터 킥 포트: 기본 칸은 규칙 비중(국면 현금) × (1 − 돌파 − 고래), 킥에서 안 쓴 자리는 현금
    var RB = (kw && K.rule && K.rule.base_now) ? K.rule.base_now : null;
    var share = RB ? 1 - ((K.rules || {}).sleeve || 0) - ((K.rules || {}).whale_sleeve || 0) : 1;
    var spare = RB ? Math.max(0, (1 - share) * 100 - kw) : 0;
    out = P.hold.map(function(x, i){
      // 🅿️ 10/19 Q10/19-1: 킥 빈 자리(spare)는 현금 대신 💼 기본 칸 비중 그대로 나눠 담음 (kick.json park.on)
      var rb0 = RB ? (RB[x.name] != null ? RB[x.name] : x.trend ? 0 : x.pct) : 0, PK = K && K.park && K.park.on;   // 🧭 10/28: 추세 주차 칸은 💼 에만(킥 기본 칸은 규칙 비중 그대로)
      var pct = RB ? rb0 * share + (PK ? rb0 / 100 * spare : (/현금/.test(x.name) ? spare : 0)) : x.pct - (kw && /현금/.test(x.name) ? kw : 0);
      x = Object.assign({}, x, {pct: Math.round(pct * 10) / 10});
      var amt = S.amt * x.pct / 100, items = [];
      var kr = (x.kr || []).filter(function(k){ return k.etf; });
      if (S.mode === "kr" && kr.length){
        var k = kr[0];
        items.push({nm: k.name, code: k.code, amt: amt, sh: k.px ? Math.floor(amt / k.px) : null, px: k.px, cur: "원"});
      } else {
        var us = x.us.filter(function(u){ return u.px; }), each = us.length ? amt / us.length : 0;
        us.forEach(function(u){
          if (u.w != null) each = amt * u.w;      // 🧭 자산 추세 칸: 칸 안 비중대로
          if (u.cur && u.cur !== "달러"){      // 🌏 미국 밖 종목: 원화 환산가(krw)로 주 수
            items.push({nm: u.name || u.t, code: u.t, amt: each, sh: u.krw ? Math.floor(each / u.krw) : null, px: u.px, cur: "원", fx: u.cur, r1: u.r1}); return; }
          var usd = P.fx ? each / P.fx : null;
          items.push({nm: u.name || u.t, code: u.t, amt: each, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$", r1: u.r1}); });
      }
      return {x: x, i: i, amt: amt, items: items};
    });
    if (kw) out.push({x: {name: "⚡ 킥", pct: Math.round(kw * 10) / 10}, i: -1, amt: S.amt * kw / 100, kick: 1, items: kHold().map(function(o){
      var a = S.amt * o.w / 100, kr = /^\d{6}\.K[SQ]$/.test(o.code), us = /^[A-Z\-]+$/.test(o.code);
      var usd = us && P.fx ? a / P.fx : null;
      return {tags: o.tags || "", short: nm(o.name), nm: (o.tags ? o.tags + " " : "") + nm(o.name), code: o.code, amt: a, usd: usd, cur: us ? "$" : kr ? "원" : "현지", sh: us ? (usd && o.now ? Math.floor(usd / o.now) : null) : kr ? Math.floor(a / o.now) : null,
              note: o.rule || ""}; })});
    return out;
  }

  // ---- 🙋 내 포트 (10/14 사용자: 「기본 포트에서 킥 종목 중 v자 체크해서 채우기 · S&P·나스닥 비중도 내가 정하기 · 수익률 비교는 다 똑같이」 — 킥 종목을 현실적으로 다 사진 않으니까)
  //      10/14 2차: 「종목 직접 추가 · 종목마다 가중치 일괄/개별 · 내 포트 저장·편집」
  function r1(v){ return Math.round(v * 10) / 10; }
  function myCfg(){ var m = S.my, c = {spx: m.spx, ndx: m.ndx, gold: m.gold, per: m.per, wm: m.wm, w: m.w, pick: m.pick, own: m.own}; if (m.prod && m.prod.length) c.prod = m.prod; return JSON.parse(JSON.stringify(c)); }
  function mySlot(){ return (S.mySaved || []).filter(function(x){ return x.nm === S.my.nm; })[0]; }
  function myDirty(){ var sl = mySlot(); return !!S.my.nm && (!sl || JSON.stringify(sl.cfg) !== JSON.stringify(myCfg())); }
  function wOf(code){ var m = S.my; return m.wm === "each" && m.w[code] != null ? +m.w[code] : (+m.per || 0); }
  function myStocks(){   // ⚡ 킥에서 체크한 것 + ✍️ 직접 넣은 것
    var out = [], seen = {};
    if (K) kHold().forEach(function(h){ if (!S.my.pick[h.code]) return; seen[h.code] = 1;
      out.push({code: h.code, name: nm(h.name), tags: h.tags || "", kind: "kick", d0: h.d0, entry: h.entry, kline: h.line, r: h.r, now: h.now, rule: h.rule}); });
    (S.my.own || []).forEach(function(o){ if (seen[o.code]) return; seen[o.code] = 1; out.push({code: o.code, name: o.name || o.code, tags: "✍️", kind: "own", d0: o.d0 || P.start, mkt: o.mkt}); });
    return out;
  }
  function myW(){   // 합이 100% 넘으면 비율대로 줄임 · 남는 건 현금·단기채
    var m = S.my, st = myStocks(); st.forEach(function(x){ x.w0 = wOf(x.code); });
    var pr = (m.prod || []).map(function(p){ return Object.assign({}, p, {w0: +p.w || 0}); });
    var tot = (+m.spx || 0) + (+m.ndx || 0) + (+m.gold || 0) + st.reduce(function(a, x){ return a + x.w0; }, 0) + pr.reduce(function(a, x){ return a + x.w0; }, 0), sc = tot > 100 ? 100 / tot : 1;
    st.forEach(function(x){ x.w = x.w0 * sc; }); pr.forEach(function(x){ x.w = x.w0 * sc; });
    return {spx: (+m.spx || 0) * sc, ndx: (+m.ndx || 0) * sc, gold: (+m.gold || 0) * sc, st: st, pr: pr, tot: tot, sc: sc, cash: Math.max(0, 100 - tot)};
  }
  function onP(arr, kd){   // kick.json 날짜 줄 → 포트 날짜 줄 (null 은 그대로 = 아직 안 산 날)
    if (!arr || !kd) return null; var m = {}; kd.forEach(function(d, i){ m[d] = arr[i]; });
    var last = null, seen = false; return P.dates.map(function(d){ if (d in m){ last = m[d]; seen = true; } return seen ? last : null; });
  }
  // 직접 넣은 종목 시세: opdata q/(최근 60일 일봉) → 없으면 p/(주간 종가 + 마지막 종가)로 대략
  var OPDU = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/", SHD = {p: {}, q: {}}, SHP = {};
  function fnv(str){ var h = 0x811c9dc5, b = new TextEncoder().encode(str); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function shd(sym){ var x = (fnv(sym) % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  function shGet(dir, sh){ var k = dir + sh; if (!SHP[k]) SHP[k] = fetch(OPDU + dir + "/" + sh + ".json").then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; }).then(function(j){ SHD[dir][sh] = j; return j; }); return SHP[k]; }
  var myWait = 0;
  function myLoad(st){   // 아직 안 받은 묶음만 받고, 다 받으면 한 번 다시 그림
    var need = []; st.forEach(function(x){ if (x.kind === "kick" && x.kline) return; var sh = shd(x.code); if (!SHD.p[sh]) need.push(shGet("p", sh), shGet("q", sh)); });
    if (!need.length || myWait) return; myWait = 1;
    Promise.all(need).then(function(){ myWait = 0; if (document.getElementById("pobody") && P){ var y = window.scrollY; draw(); window.scrollTo(0, y); } });
  }
  function iso(d){ return d.toISOString().slice(0, 10); }
  function pxSer(code){
    var sh = shd(code), q = (SHD.q[sh] || {})[code], p = (SHD.p[sh] || {})[code], pts = [];
    if (!q && !p) return null;
    if (p && p[6] && p[6].length){ var fri = new Date(p[0] + "T00:00:00Z"); fri.setUTCDate(fri.getUTCDate() + (5 - fri.getUTCDay() + 7) % 7);
      p[6].forEach(function(v, k){ var d = new Date(fri); d.setUTCDate(d.getUTCDate() - 7 * (p[6].length - 1 - k)); var ds = iso(d); pts.push([ds > p[0] ? p[0] : ds, v]); }); }
    if (q){ pts = pts.filter(function(x){ return x[0] < q[0]; }); var d0 = new Date(q[0] + "T00:00:00Z");
      q[1].forEach(function(o, i){ var d = new Date(d0); d.setUTCDate(d.getUTCDate() + o); pts.push([iso(d), q[2][i]]); }); }
    if (p && (!pts.length || pts[pts.length - 1][0] < p[0])) pts.push([p[0], p[1]]);
    return {pts: pts, daily: !!q, last: pts.length ? pts[pts.length - 1] : null};
  }
  function pxOn(ser, d){ var v = null; for (var i = 0; i < ser.pts.length && ser.pts[i][0] <= d; i++) v = ser.pts[i][1]; return v; }
  function stLine(x){
    if (x.kind === "kick" && x.kline && K) return onP(x.kline, K.dates);
    var ser = pxSer(x.code); if (!ser) return null; x.daily = ser.daily;
    var d0 = x.d0 || P.start, en = (x.kind === "kick" && x.entry) ? x.entry : (pxOn(ser, d0) || (ser.pts[0] && ser.pts[0][1]));
    if (!en) return null;
    if (ser.last){ x.now = ser.last[1]; x.r = Math.round((ser.last[1] / en - 1) * 1000) / 10; }
    return P.dates.map(function(d){ if (d < d0) return null; var c = pxOn(ser, d); return c == null ? null : Math.round((c / en - 1) * 10000) / 100; });
  }
  /* 🛍️ 상품 칸 (10/16 사용자 「포트에 주식 부분에 상품 부분을 더한 포트 · 비교 방식, 넣는 방식은 같게」)
     채권·ELS: 연 수익률(y)을 날마다 고르게 쌓음(중간 가격 변동·환율 빼고) · 펀드: 기준일에서 1일·1주·1·3·6개월·1년 전 수익률을 이어 붙인 길(그 사이는 고르게) */
  function dnum(d){ return Date.parse(d + "T00:00:00Z") / 864e5; }
  function prodLine(p){
    var d0 = p.d0 || P.start, t0 = dnum(d0);
    if (p.per){
      var a = dnum(p.asof), pts = [[a, 0]], L = [["d1", 1], ["w1", 7], ["m1", 30.4], ["m3", 91.3], ["m6", 182.6], ["y1", 365.25]];
      L.forEach(function(q){ var v = p.per[q[0]]; if (v != null && v > -99) pts.push([a - q[1], -Math.log(1 + v / 100)]); });
      pts.sort(function(x, y){ return x[0] - y[0]; });
      var lv = function(t){ if (t < pts[0][0]) return null; if (t >= a) return 0; for (var i = 1; i < pts.length; i++) if (t <= pts[i][0]){ var u = pts[i - 1], w = pts[i]; return u[1] + (w[1] - u[1]) * (t - u[0]) / ((w[0] - u[0]) || 1); } return 0; };
      var s0 = lv(Math.max(t0, pts[0][0]));
      return P.dates.map(function(d){ var t = dnum(d); if (t < t0) return null; var v = lv(t); return v == null || s0 == null ? null : Math.round((Math.exp(v - s0) - 1) * 10000) / 100; });
    }
    var y = (+p.y || 0) / 100;
    return P.dates.map(function(d){ var t = dnum(d); return t < t0 ? null : Math.round((Math.pow(1 + y, (t - t0) / 365.25) - 1) * 10000) / 100; });
  }
  function myLine(W){
    var A = (K && K.assets) || {}, kd = K && K.dates, B = P.bench;
    var spx = onP(A.SPY, kd) || B["S&P500"], ndx = onP(A.QQQ, kd) || B["나스닥100"], gld = onP(A.GLD, kd), cash = onP(A.SGOV, kd);
    W.miss = []; W.rough = [];
    if (!gld && W.gold){   // 금 일봉이 아직 kick.json 에 없으면 GLD 를 직접 넣은 종목처럼
      var g = {code: "GLD", kind: "own", d0: P.dates[0]}; gld = stLine(g); if (!gld){ myLoad([g]); W.miss.push("금"); } }
    var parts = [[W.spx, spx], [W.ndx, ndx], [W.gold, gld], [W.cash, cash]];
    myLoad(W.st);
    W.st.forEach(function(x){ var L = stLine(x); if (L){ parts.push([x.w, L]); if (x.kind === "own" && !x.daily) W.rough.push(x.name); } else W.miss.push(x.name); });
    (W.pr || []).forEach(function(x){ var L = prodLine(x), z = L.filter(function(v){ return v != null; }); x.r = z.length ? z[z.length - 1] : null; parts.push([x.w, L]); });
    var v = 1, out = [0];
    for (var j = 1; j < P.dates.length; j++){
      var r = 0;
      parts.forEach(function(q){ var w = q[0], L = q[1]; if (!w || !L) return; var a = L[j - 1], b = L[j]; if (b == null) return;
        r += w / 100 * (a == null ? b / 100 : (1 + b / 100) / (1 + a / 100) - 1); });   // 종목은 산 날 값부터 (그 전엔 그 몫이 현금)
      v *= 1 + r; out.push(Math.round((v - 1) * 10000) / 100);
    }
    return out;
  }
  function myHtml(W){
    var m = S.my, KH = K ? kHold() : [], ed = S.myEdit == null ? !(S.mySaved || []).length : !!S.myEdit;
    var kind = {"돌파": "☕📈 돌파", "고래": "🐋 고래", "추세": "🧭 추세"};
    var stepper = function(k, val, d, cls_){ return '<span class="my-sp ' + (cls_ || "") + '"><button type="button" data-myk="' + k + '" data-d="-' + d + '">−</button><input class="my-in" inputmode="decimal" data-myk="' + k + '" value="' + r1(+val || 0) + '"><b>%</b><button type="button" data-myk="' + k + '" data-d="' + d + '">+</button></span>'; };
    var row = function(k, lab, col){ return '<div class="my-st"><span class="n"><i style="background:' + col + '"></i>' + lab + '</span>' + stepper(k, m[k], 5) + '</div>'; };
    var sw = W.st.reduce(function(a, x){ return a + x.w; }, 0), pw = W.pr.reduce(function(a, x){ return a + x.w; }, 0);
    // 저장한 포트 칩
    var saved = S.mySaved || [];
    var h = '<div class="sec">🙋 내 포트 <small class="mut">휴대폰에만 저장 · 바꾸면 위 성적이 바로 다시 계산돼요</small></div><section class="card my-c">' +
      '<div class="my-sv">' + saved.map(function(x, i){ return '<button type="button" data-myload="' + i + '" class="' + (x.nm === m.nm ? "on" : "") + '">' + e(x.nm) + (x.nm === m.nm && myDirty() ? ' <i>●</i>' : '') + '</button>'; }).join("") +
        '<button type="button" data-mynew="1" class="nw">＋ 새 포트</button></div>' +
      '<div class="my-top"><b>' + e(m.nm || "이름 없는 포트") + '</b>' + (m.nm ? (myDirty() ? ' <small class="dt">● 저장 안 한 변경</small>' : ' <small class="ok">✓ 저장됨</small>') : ' <small class="dt">아직 저장 안 함</small>') +
        '<span class="my-acts"><button type="button" data-mysave="1" class="pri">💾 저장</button>' + (m.nm ? '<button type="button" data-myas="1">다른 이름으로</button><button type="button" data-myren="1">이름 바꾸기</button><button type="button" data-mydel="1">🗑</button>' : '') + '</span></div>' +
      '<div class="my-sb"><i style="flex:' + W.spx + ';background:' + COL[0] + '"></i><i style="flex:' + W.ndx + ';background:' + COL[1] + '"></i><i style="flex:' + W.gold + ';background:' + COL[2] + '"></i><i style="flex:' + sw + ';background:#f472b6"></i><i style="flex:' + pw + ';background:#38bdf8"></i><i style="flex:' + W.cash + ';background:#8a94a8"></i></div>' +
      '<div class="my-lg">S&P ' + r1(W.spx) + '% · 나스닥 ' + r1(W.ndx) + '% · 금 ' + r1(W.gold) + '% · <span style="color:#f472b6">종목 ' + W.st.length + '개 ' + r1(sw) + '%</span> · <span style="color:#38bdf8">상품 ' + W.pr.length + '개 ' + r1(pw) + '%</span> · 현금 ' + r1(W.cash) + '%</div>' +
      (W.sc < 1 ? '<div class="my-warn">합이 ' + r1(W.tot) + '% 라 100%에 맞게 비율대로 줄여서 계산해요</div>' : '');
    // 고른 종목 (편집 안 할 때도 보임)
    h += '<div class="my-h">담은 종목 <small>' + W.st.length + '개</small></div>' + (W.st.length ? '<div class="my-sl">' + W.st.map(function(x){
        return '<div class="my-si' + (ed ? ' ed' : '') + '"><span class="nm"><b>' + e(x.tags) + ' ' + e(x.name) + '</b><small>' + (x.kind === "kick" ? '⚡ 킥 · ' + md(x.d0) + ' 킥이 산 값부터' : '✍️ 직접 · ' + md(x.d0) + '부터 계산' + (x.daily === false ? ' · 주간 시세로 대략' : '')) + '</small></span>' +
          '<b class="r ' + cls(x.r) + '">' + (x.r != null ? sg(x.r, 1) : '…') + '</b>' +
          (ed ? '<span class="my-ctl">' + (m.wm === "each" ? stepper("w:" + x.code, wOf(x.code), 1, "sm") : '<span class="my-wv">' + r1(x.w) + '%</span>') + '<button type="button" class="my-x" data-myrm="' + e(x.code) + '" data-kind="' + x.kind + '" aria-label="빼기">✕ 빼기</button></span>' : '<span class="my-wv">' + r1(x.w) + '%</span>') + '</div>'; }).join("") + '</div>'
      : '<p class="note" style="margin:2px 0 6px">아직 없어요 — ' + (ed ? '아래에서 킥 종목을 ✓ 하거나 직접 넣어요' : '✏️ 편집에서 넣어요') + '</p>');
    h += '<div class="my-h">🛍️ 담은 상품 <small>' + W.pr.length + '개 · 채권·펀드·ELS</small></div>' + (W.pr.length ? '<div class="my-sl">' + W.pr.map(function(x){
        return '<div class="my-si' + (ed ? ' ed' : '') + '"><span class="nm"><b>' + e(PGN[x.g] || "") + ' ' + e(x.name) + '</b><small>' + e(x.sub || "") + ' · ' + md(x.d0) + '부터' + (x.per ? ' · 기간 수익률 이어 붙임' : ' · 연 ' + (+x.y).toFixed(2) + '% 쌓기') + '</small></span>' +
          '<b class="r ' + cls(x.r) + '">' + (x.r != null ? sg(x.r, 1) : '…') + '</b>' +
          (ed ? '<span class="my-ctl">' + stepper("pw:" + x.id, x.w0, 1, "sm") + '<button type="button" class="my-x" data-myprm="' + e(x.id) + '" aria-label="빼기">✕ 빼기</button></span>' : '<span class="my-wv">' + r1(x.w) + '%</span>') + '</div>'; }).join("") + '</div>'
      : '<p class="note" style="margin:2px 0 6px">아직 없어요 — ' + (ed ? '아래 ⑤에서 채권·펀드·ELS를 골라 넣어요' : '✏️ 편집에서 넣어요') + '</p>');
    if (!ed){
      h += '<button type="button" class="my-edit" data-myedit="1">✏️ 편집 (비중·종목 바꾸기)</button>';
    } else {
      h += '<div class="my-h">① 뼈대 비중</div>' + row("spx", "S&P500", COL[0]) + row("ndx", "나스닥100", COL[1]) + row("gold", "금", COL[2]) +
        '<div class="my-h">② 종목 가중치 <span class="my-seg"><button type="button" data-mywm="all" class="' + (m.wm !== "each" ? "on" : "") + '">일괄</button><button type="button" data-mywm="each" class="' + (m.wm === "each" ? "on" : "") + '">개별</button></span></div>' +
        (m.wm !== "each" ? '<div class="my-st"><span class="n">모든 종목 똑같이</span>' + stepper("per", m.per, 1) + '</div>'
          : '<p class="note" style="margin:0 0 4px">위 「담은 종목」 줄마다 비중을 따로 정해요 (처음 값 = 일괄 ' + r1(+m.per || 0) + '%)</p>') +
        '<div class="my-h">③ ✍️ 종목 직접 넣기</div><div class="my-add"><input aria-label="종목 이름·코드" id="myq" type="search" autocomplete="off" placeholder="종목 이름·코드 (예: MSFT, 036930)"><div id="myres" class="my-res"></div>' +
        '<label class="my-d0">계산 시작일 <input id="myd0" type="date" value="' + e(S.myD0 || P.start) + '" min="' + P.dates[0] + '" max="' + P.dates[P.dates.length - 1] + '"><small>산 날을 넣으면 그날 종가부터</small></label></div>' +
        '<div class="my-h">④ ⚡ 킥 종목에서 고르기</div>' +
        (KH.length ? '<div class="my-all"><button type="button" data-myall="1">전부 체크</button><button type="button" data-myall="0">전부 빼기</button><small>' + KH.filter(function(o){ return m.pick[o.code]; }).length + ' / ' + KH.length + ' 체크</small></div>' +
          '<div class="my-ks">' + KH.map(function(o){ var on = !!m.pick[o.code];
            return '<label class="my-k' + (on ? " on" : "") + '"><input type="checkbox" data-pick="' + e(o.code) + '"' + (on ? " checked" : "") + '><span class="ck">' + (on ? "✓" : "") + '</span>' +
              '<span class="nm"><b>' + e(o.tags || "") + ' ' + e(nm(o.name)) + '</b><small>' + e(kind[o.kind] || o.kind || "") + ' · ' + md(o.d0) + ' 산 값부터</small></span>' +
              '<b class="r ' + cls(o.r) + '">' + sg(o.r, 1) + '</b></label>'; }).join("") + '</div>'
          : '<p class="note">지금 킥에 든 종목이 없어요.</p>') +
        '<div class="my-h">⑤ 🛍️ 상품 넣기 <small>상품 탭에 있는 채권·펀드·ELS</small></div><div class="my-add"><div class="my-pk">' + PGK.map(function(g){ return '<button type="button" data-mypg="' + g[0] + '" class="' + ((S.myPg || "ust") === g[0] ? "on" : "") + '">' + g[1] + '</button>'; }).join("") + '</div>' +
          '<input aria-label="상품 이름 검색" id="mypq" type="search" autocomplete="off" placeholder="상품 이름 검색 (비우면 인기·높은 순)"><div id="mypres" class="my-res"><div class="my-hint">상품 목록 불러오는 중…</div></div></div>' +
        '<button type="button" class="my-edit done" data-myedit="0">✓ 편집 끝' + (m.nm && myDirty() ? ' (저장은 💾)' : '') + '</button>';
    }
    h += (W.miss && W.miss.length ? '<div class="my-warn">시세를 불러오는 중이거나 아직 없어 현금처럼 계산: ' + e(W.miss.join(", ")) + '</div>' : '') +
      '<p class="note" style="margin:8px 0 0">계산 방법: 고른 비중을 ' + md(P.start) + '부터 매일 그대로 유지했다면(매일 비중 맞춤 · 비용 빼지 않음 · 종목은 그 나라 통화 기준). 킥 종목은 킥이 산 날·값부터, 직접 넣은 종목은 계산 시작일 종가부터 들어가고 그 전엔 그 몫이 현금이에요. 킥이 판 종목은 목록에서 빠져요.' + (W.pr.length ? ' 🛍️ 상품: 채권·ELS는 연 수익률을 날마다 고르게 쌓은 값(중간 가격 변동·환율·세금 빼고 · ELS는 조기상환 조건이 맞는다고 가정), 펀드는 기준일의 1일·1주·1·3·6개월·1년 수익률을 이어 붙인 길(그 사이는 고르게)이에요. 외화 상품은 그 나라 통화 기준.' : '') + ' 내가 고른 대로의 계산일 뿐 매수 추천이 아니에요.</p></section>';
    return h;
  }
  var PGK = [["ust", "🇺🇸 미국채"], ["krw", "🇰🇷 국내채권"], ["brl", "🇧🇷 브라질"], ["fund", "📦 공모펀드"], ["pvl", "🔒 사모 라인업"], ["els", "🎯 ELS"]];
  var PGN = {ust: "🇺🇸", krw: "🇰🇷", brl: "🇧🇷", fund: "📦", pvl: "🔒", els: "🎯"}, PCAT = null, PCATP = null;
  function pcat(){ if (!PCATP && window.prodCatalog) PCATP = prodCatalog().then(function(c){ PCAT = c; return c; }, function(){ PCATP = null; return null; }); return PCATP || Promise.resolve(null); }
  function myBind(b){
    // 10/19 🔧: 누른 단추가 그 자리에 그대로 있게 — 위쪽 「담은 종목」이 늘거나 줄어도 화면이 튀지 않음 (ui_audit 「전부 체크」 407→1963px)
    var redraw = function(anc){ keep(); var y = window.scrollY, a0 = anc && document.querySelector(anc), t0 = a0 && a0.getBoundingClientRect().top; draw(); window.scrollTo(0, y);
      var a1 = anc && document.querySelector(anc); if (a1 && t0 != null){ var d = a1.getBoundingClientRect().top - t0; if (Math.abs(d) > 2) window.scrollBy(0, d); } };
    var setV = function(k, v){ v = Math.max(0, Math.min(100, Math.round(v * 10) / 10));
      if (k.indexOf("pw:") === 0){ (S.my.prod || []).forEach(function(p){ if (p.id === k.slice(3)) p.w = v; }); return; }
      if (k.indexOf("w:") === 0) S.my.w[k.slice(2)] = v; else S.my[k] = v; };
    var getV = function(k){ if (k.indexOf("pw:") === 0){ var p = (S.my.prod || []).filter(function(x){ return x.id === k.slice(3); })[0]; return p ? +p.w || 0 : 0; } return k.indexOf("w:") === 0 ? wOf(k.slice(2)) : (+S.my[k] || 0); };
    [].forEach.call(b.querySelectorAll("button[data-myk]"), function(x){ x.onclick = function(){ setV(x.dataset.myk, getV(x.dataset.myk) + (+x.dataset.d)); redraw(); }; });
    [].forEach.call(b.querySelectorAll("input.my-in"), function(x){ x.onchange = function(){ setV(x.dataset.myk, +String(x.value).replace(/[^\d.]/g, "") || 0); redraw(); };
      x.onkeydown = function(ev){ if (ev.key === "Enter") x.blur(); }; });
    [].forEach.call(b.querySelectorAll("[data-pick]"), function(x){ x.onchange = function(){ if (x.checked) S.my.pick[x.dataset.pick] = 1; else delete S.my.pick[x.dataset.pick]; redraw('[data-pick="' + x.dataset.pick + '"]'); }; });
    [].forEach.call(b.querySelectorAll("[data-myall]"), function(x){ x.onclick = function(){ S.my.pick = {}; if (x.dataset.myall === "1") kHold().forEach(function(h){ S.my.pick[h.code] = 1; }); redraw('[data-myall="' + x.dataset.myall + '"]'); }; });
    [].forEach.call(b.querySelectorAll("[data-myrm]"), function(x){ x.onclick = function(){ var c = x.dataset.myrm;
      if (x.dataset.kind === "kick") delete S.my.pick[c]; else S.my.own = S.my.own.filter(function(o){ return o.code !== c; }); delete S.my.w[c]; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-mywm]"), function(x){ x.onclick = function(){ S.my.wm = x.dataset.mywm; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myedit]"), function(x){ x.onclick = function(){ S.myEdit = +x.dataset.myedit; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myprm]"), function(x){ x.onclick = function(){ var id = x.dataset.myprm; S.my.prod = (S.my.prod || []).filter(function(p){ return p.id !== id; }); redraw(); }; });
    var pq = document.getElementById("mypq"), pres = document.getElementById("mypres");
    if (pq && pres){
      var pshow = function(){
        if (!PCAT){ pres.innerHTML = '<div class="my-hint">상품 목록 불러오는 중…</div>'; return; }
        var g = S.myPg || "ust", t = pq.value.trim().toLowerCase(), have = {}; (S.my.prod || []).forEach(function(p){ have[p.id] = 1; });
        if (g === "pvl" && !PCAT.pvl){ pres.innerHTML = '<div class="my-hint">🔒 사모 라인업은 상품 › 펀드 탭에서 비밀번호로 한 번 열면 여기서도 보여요.</div>'; return; }
        var L = PCAT.items.filter(function(x){ return x.g === g && (!t || (x.name + " " + x.sub).toLowerCase().indexOf(t) >= 0); });
        if (!t){ if (g === "fund" || g === "pvl") L.sort(function(a, c){ return (c.rank || -1e9) - (a.rank || -1e9); }); else if (g === "ust") L.sort(function(a, c){ return (c.mir ? 1 : 0) - (a.mir ? 1 : 0) || c.y - a.y; }); else L.sort(function(a, c){ return c.y - a.y; }); }
        pres.innerHTML = L.length ? L.slice(0, 12).map(function(x){ return '<button type="button" data-padd="' + e(x.id) + '"' + (have[x.id] ? ' disabled' : '') + '><b>' + e(x.name) + '</b> <small>' + e(x.sub) + (have[x.id] ? ' · 이미 담음' : '') + '</small></button>'; }).join("") + (L.length > 12 ? '<div class="my-hint">' + L.length + '개 중 12개 — 이름으로 더 찾아요</div>' : '')
          : '<div class="my-hint">「' + e(pq.value) + '」 — 못 찾았어요</div>';
        [].forEach.call(pres.querySelectorAll("[data-padd]"), function(y){ y.onclick = function(){
          var x = PCAT.items.filter(function(z){ return z.id === y.dataset.padd; })[0]; if (!x) return;
          var dd = (document.getElementById("myd0") || {}).value || P.start; if (dd < P.dates[0]) dd = P.dates[0];
          S.my.prod = (S.my.prod || []).concat([{id: x.id, g: x.g, name: x.name, sub: x.sub, y: x.y, per: x.per, asof: x.asof, cur: x.cur, w: 10, d0: dd}]); redraw(); }; });
      };
      pq.oninput = pshow; pshow(); if (!PCAT) pcat().then(pshow);
    }
    [].forEach.call(b.querySelectorAll("[data-mypg]"), function(x){ x.onclick = function(){ S.myPg = x.dataset.mypg; redraw(); }; });
    // 💾 저장 · 다른 이름 · 이름 바꾸기 · 삭제 · 불러오기 · 새 포트
    var ask = function(msg, def){ var n = window.prompt(msg, def || ""); n = (n || "").trim().slice(0, 20); return n || null; };
    var put = function(n){ S.mySaved = (S.mySaved || []).filter(function(x){ return x.nm !== n; }); S.mySaved.push({nm: n, cfg: myCfg()}); S.my.nm = n; };
    [].forEach.call(b.querySelectorAll("[data-mysave]"), function(x){ x.onclick = function(){ var n = S.my.nm || ask("이 포트 이름을 정해 주세요", "내 포트 " + ((S.mySaved || []).length + 1)); if (!n) return;
      if (!S.my.nm && (S.mySaved || []).some(function(y){ return y.nm === n; }) && !window.confirm("「" + n + "」 이 이미 있어요. 덮어쓸까요?")) return; put(n); S.myEdit = 0; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myas]"), function(x){ x.onclick = function(){ var n = ask("새 이름", S.my.nm + " 2"); if (!n) return; put(n); redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myren]"), function(x){ x.onclick = function(){ var o = S.my.nm, n = ask("바꿀 이름", o); if (!n || n === o) return;
      S.mySaved = (S.mySaved || []).filter(function(y){ return y.nm !== n; }).map(function(y){ return y.nm === o ? {nm: n, cfg: y.cfg} : y; }); S.my.nm = n; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-mydel]"), function(x){ x.onclick = function(){ if (!window.confirm("「" + S.my.nm + "」 을 지울까요? (지금 화면의 비중·종목은 남아요)")) return;
      var o = S.my.nm; S.mySaved = (S.mySaved || []).filter(function(y){ return y.nm !== o; }); S.my.nm = ""; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myload]"), function(x){ x.onclick = function(){ var sl = S.mySaved[+x.dataset.myload]; if (!sl || sl.nm === S.my.nm) return;
      if (myDirty() && !window.confirm("「" + S.my.nm + "」 의 저장 안 한 변경이 사라져요. 바꿀까요?")) return;
      S.my = Object.assign({prod: []}, JSON.parse(JSON.stringify(sl.cfg)), {nm: sl.nm}); S.myEdit = 0; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-mynew]"), function(x){ x.onclick = function(){
      if (myDirty() && !window.confirm("「" + S.my.nm + "」 의 저장 안 한 변경이 사라져요. 새로 만들까요?")) return;
      S.my = {spx: 40, ndx: 40, gold: 5, per: 3, wm: "all", w: {}, pick: {}, own: [], prod: [], nm: ""}; S.myEdit = 1; redraw(); }; });
    // ✍️ 종목 직접 넣기 — 앱 검색 목록(약 2만 종목 + ETF)에서 고름
    var q = document.getElementById("myq"), res = document.getElementById("myres"), d0 = document.getElementById("myd0");
    if (d0) d0.onchange = function(){ S.myD0 = d0.value || ""; keep(); };
    if (q && res){
      var show = function(){ var t = q.value.trim(); if (!t){ res.innerHTML = ""; return; }
        if (!window.opSearch || !window.OPIDX){ res.innerHTML = '<div class="my-hint">종목 목록 불러오는 중…</div>'; return; }
        var have = {}; myStocks().forEach(function(x){ have[x.code] = 1; });
        var r = opSearch(t).slice(0, 8), FL = window.FLAG || {};
        res.innerHTML = r.length ? r.map(function(x){ return '<button type="button" data-add="' + e(x.sym) + '" data-nm="' + e(x.name) + '" data-mk="' + e(x.mkt || "") + '"' + (have[x.sym] ? ' disabled' : '') + '>' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b> <small>' + e(window.V && V.cd ? V.cd(x.sym) : x.sym) + (have[x.sym] ? ' · 이미 담음' : '') + '</small></button>'; }).join("")
          : '<div class="my-hint">「' + e(t) + '」 — 못 찾았어요</div>';
        [].forEach.call(res.querySelectorAll("[data-add]"), function(y){ y.onclick = function(){
          var dd = (d0 && d0.value) || P.start; if (dd < P.dates[0]) dd = P.dates[0];
          S.my.own = (S.my.own || []).concat([{code: y.dataset.add, name: y.dataset.nm, mkt: y.dataset.mk, d0: dd}]); redraw();
          setTimeout(function(){ var n = document.getElementById("myq"); if (n) n.focus(); }, 0); }; });
      };
      q.oninput = show; q.onkeydown = function(ev){ if (ev.key === "Enter"){ var f = res.querySelector("[data-add]:not([disabled])"); if (f) f.click(); } };
      if (window.opLoadIdx && !window.OPIDX) opLoadIdx().then(show, function(){});
    }
  }
  function myPlan(){   // 📋 주문서 — 뼈대 칸은 기본 포트 상품 그대로, 종목은 담은 것만
    var W = myW(), want = {"S&P": W.spx, "나스닥": W.ndx, "금": W.gold, "현금": W.cash};
    var out = P.hold.map(function(x, i){
      var key = /S&P/.test(x.name) ? "S&P" : /나스닥/.test(x.name) ? "나스닥" : /^금/.test(x.name) ? "금" : /현금/.test(x.name) ? "현금" : null;
      var pct = r1(key ? want[key] : 0), amt = S.amt * pct / 100, items = [], kr = (x.kr || []).filter(function(k){ return k.etf; });
      if (S.mode === "kr" && kr.length){ var k = kr[0]; items.push({nm: k.name, code: k.code, amt: amt, sh: k.px ? Math.floor(amt / k.px) : null, px: k.px, cur: "원"}); }
      else { var u = (x.us || []).filter(function(u){ return u.px; })[0]; if (u){ var usd = P.fx ? amt / P.fx : null; items.push({nm: u.name || u.t, code: u.t, amt: amt, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$"}); } }
      return {x: {name: x.name, pct: pct}, i: i, amt: amt, items: items};
    });
    if (W.st.length){ myLine(W);   // 직접 넣은 종목의 지금 가격(x.now) 채우기
      out.push({x: {name: "🙋 담은 종목", pct: r1(W.st.reduce(function(a, x){ return a + x.w; }, 0))}, i: -1, amt: S.amt * W.st.reduce(function(a, x){ return a + x.w; }, 0) / 100, kick: 1, items: W.st.map(function(o){
        var a = S.amt * o.w / 100, kr = /^\d{6}\.K[SQ]$/.test(o.code), us = /^[A-Z\-]+$/.test(o.code), usd = us && P.fx ? a / P.fx : null;
        return {tags: o.tags || "", short: o.name, nm: (o.tags ? o.tags + " " : "") + o.name, code: o.code, amt: a, usd: usd, cur: us ? "$" : kr ? "원" : "현지",
                sh: o.now ? (us ? (usd ? Math.floor(usd / o.now) : null) : kr ? Math.floor(a / o.now) : null) : null, note: o.rule || ""}; })}); }
    if (W.pr.length) out.push({x: {name: "🛍️ 담은 상품", pct: r1(W.pr.reduce(function(a, x){ return a + x.w; }, 0))}, i: -1, amt: S.amt * W.pr.reduce(function(a, x){ return a + x.w; }, 0) / 100, prod: 1,
      items: W.pr.map(function(o){ return {nm: (PGN[o.g] || "") + " " + o.name, amt: S.amt * o.w / 100, w: o.w, cur: o.cur, sub: o.sub}; })});
    return out;
  }
  // ⓘ 포트 설명 칸 (10/14 사용자: 「킥포트와 집중포트에 대한 탭하면 정보 나오고 닫는 칸」)
  function infHtml(){
    var R = (K && K.rules) || {}, CR = (CN && CN.rule) || {};
    var pc = function(v){ return v == null ? "–" : Math.round(v * 100) + "%"; };
    return '<details class="card po-inf no-clp"><summary>ⓘ 포트 4개, 뭐가 달라요? <small>눌러서 열고 닫기</small></summary><div class="po-infb">' +
      '<div><b>💼 기본 포트</b> — 뼈대. S&P500·나스닥100 반반에 금 조금. 시장이 나빠지면 현금을 늘려요. 개별 종목은 없어요.</div>' +
      (K ? '<div class="k"><b>⚡ 킥 포트</b> — <u>기본 뼈대 + 개별 종목 양념</u>. 돈의 약 ' + pc(R.sleeve) + '는 ☕ 컵·📈 갭 같은 신호가 뜬 종목을 최대 ' + (R.slots || "–") + '개, 약 ' + pc(R.whale_sleeve) + '는 🐋 고래가 새로 산 종목 묶음에 담아요. 종목마다 ' +
        (R.stop != null ? Math.round(R.stop * 100) + '% 손절 · ' : '') + (R.take != null ? '+' + Math.round(R.take * 100) + '% 익절 · ' : '') + (R.time ? R.time + '거래일 지나면 정리' : '') + '. 사고파는 일이 잦고, 스캐너가 잘 맞히느냐에 성적이 걸려 있어요.</div>' : '') +
      (CN ? '<div class="c"><b>🎯 집중 포트</b> — <u>' + (CR.core ? '나스닥100에 몰빵' : '지수 두 개에 몰빵') + ' + 날씨 따라 우산</u>. 개별 종목 없이 ' + (CR.core ? '나스닥100(11/18부터)' : 'S&P500·나스닥100') + '만. 판정: ' + e(CR.judge || "S&P500 200일선") + '. ' + e(CR.on || "") + ' / ' + e(CR.off || "") + '. 손은 주 1회 비중 맞출 때와 판정이 바뀐 날에만 가요 · 🔄 월말 흐름은 하루 먼저 ⏰ 알림 → 그날 밤 미국 종가 예약(LOC).</div>' : '') +
      '<div class="m"><b>🙋 내 포트</b> — <u>내가 실제로 담는 그대로</u>. S&P·나스닥·금 비중을 직접 정하고, ⚡ 킥 종목 중 산 것만 ✓ 체크. 성적·비교·그래프는 다른 포트와 똑같이 보여 줘요.</div>' +
      '<p class="note" style="margin:6px 0 0">셋 다 「규칙대로 했다면」 계산이지 매수 추천이 아니에요.</p></div></details>';
  }
  // ---- 🐻 11/09 A11/9-2 하락장 규칙 겹쳐 보기 ----
  var BMK = {kospi: "🇰🇷 코스피", kosdaq: "🇰🇷 코스닥", sp500: "🇺🇸 S&P500", nasdaq: "🇺🇸 나스닥"}, BNM = {"🟢": "정상", "🟡": "조정", "🐻": "하락장"};
  function bearM(){ var o = {}; ((BR && BR.markets) || []).forEach(function(m){ o[m.key] = m; }); return o; }
  function bearAny(){ return ((BR && BR.markets) || []).some(function(m){ return m.state !== "🟢"; }); }
  function bearOn(){ return BEARON && bearAny(); }
  function bearHead(){ return ((BR && BR.markets) || []).filter(function(m){ return m.key !== "kosdaq"; }).map(function(m){ return m.state + m.name + (m.cash ? " " + (m.to || "현금") + " " + m.cash + "%" : ""); }).join(" · ") + " · " + md((BR.markets[0] || {}).asof) + " 종가 판정"; }
  function bearBtn(){
    if (!bearAny()) return '';
    return '<div class="po-hv po-brt"><button type="button" id="pobrt" class="' + (BEARON ? "on" : "") + '">' + (BEARON ? "🐻 하락장 규칙 겹쳐 보는 중" : "🐻 하락장 규칙 겹쳐 보기") + '</button><small>' + (BEARON ? "보기 전용 · 끄면 원래 배분표" : "켜면 시장마다 그 시장 칸에 계기판 현금 권고를 겹쳐 주황으로") + '</small></div>';
  }
  function pplan(){
    var pl = plan(); if (!bearOn()) return pl;
    // 11/09 오후 2차 「코스피는 켜고 미국은 끄는걸로」: 시장마다 그 시장 칸에만 그 시장 현금 권고(🇰🇷 하락장 100% · 🇺🇸 꺼 둠 0%)
    //   (그 전 「2번 후자로」 = 포트 전체를 가장 센 권고로 — 미국을 끈 뒤엔 코스피 100%가 미국 칸까지 지우게 돼 시장별로 되돌림)
    var BM_ = bearM(), cut = 0, out = pl.map(function(p){
      var mk = rowMk(p); if (!mk) return p;
      var q = Object.assign({}, p, {x: Object.assign({}, p.x)}), lost = 0, mks = {};
      q.items = p.items.map(function(it){
        var k = mk === "item" ? itemMk(it) : mk, c = (BM_[k] && BM_[k].cash) || 0; if (!c) return it;
        var f = 1 - c / 100, n = Object.assign({}, it, {amt: it.amt * f, sh0: it.sh, amt0: it.amt});
        if (it.usd != null) n.usd = it.usd * f;
        if (it.sh != null) n.sh = it.usd != null && it.px ? Math.floor(it.usd * f / it.px) : it.cur === "원" && it.px && !it.fx ? Math.floor(it.amt * f / it.px) : Math.floor(it.sh * f);
        lost += it.amt - n.amt; mks[k] = c; return n; });
      if (!p.items.length){ var k0 = mk === "item" ? "sp500" : mk, c0 = (BM_[k0] && BM_[k0].cash) || 0; if (c0){ lost = p.amt * c0 / 100; mks[k0] = c0; } }
      if (lost <= 0) return p;
      q.amt0 = p.amt; q.amt = p.amt - lost; q.x.pct0 = p.x.pct; q.x.pct = Math.round(q.amt / S.amt * 1000) / 10;
      var ks = Object.keys(mks); q.bc = ks.length === 1 ? mks[ks[0]] : Math.round(lost / p.amt * 100);
      q.bmk = ks.map(function(k){ return BMK[k] + " " + (BM_[k].state || "") + " " + BNM[BM_[k].state] + " " + mks[k] + "%"; }).join(" · ");
      cut += lost; return q; });
    if (cut > 0){
      var ci = -1; out.forEach(function(p, i){ if (ci < 0 && /현금/.test(p.x.name) && !p.kick && !p.prod) ci = i; });
      var src = P.hold.filter(function(h){ return /현금/.test(h.name); })[0];
      var base = ci >= 0 ? out[ci] : {x: {name: "현금·단기채", pct: 0}, i: src ? P.hold.indexOf(src) : 0, amt: 0, items: []};
      var amt = base.amt + cut, items = [];
      if (S.mode === "kr" && src && (src.kr || []).filter(function(k){ return k.etf && k.px; }).length){ var k = src.kr.filter(function(k){ return k.etf && k.px; })[0]; items.push({nm: k.name, code: k.code, amt: amt, sh: Math.floor(amt / k.px), px: k.px, cur: "원"}); }
      else if (src && (src.us || []).filter(function(u){ return u.px; }).length){ var u = src.us.filter(function(u){ return u.px; })[0], usd = P.fx ? amt / P.fx : null; items.push({nm: u.name || u.t, code: u.t, amt: amt, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$"}); }
      var cr = Object.assign({}, base, {x: {name: base.x.name, pct: Math.round(amt / S.amt * 1000) / 10, pct0: base.x.pct}, amt: amt, amt0: base.amt, items: items, bcash: 1});
      if (ci >= 0) out[ci] = cr; else out.push(cr);
    }
    out._cut = cut; return out;
  }
  // 칸 → 시장: 이름으로(원화 베이스에서 한국 상장 ETF 로 바뀌어도 S&P 칸은 S&P) · 종목 칸(킥·담은 종목)은 종목 코드로 · 금·현금·채권·자산 추세·상품은 주식이 아니라 그대로
  function rowMk(p){
    var n = String(p.x.name || "");
    if (p.prod || /현금|단기|채권|추세|달러|^금$|^금 |🥇/.test(n)) return null;
    if (/나스닥|QQQ/i.test(n)) return "nasdaq";
    if (/S&P|SPY/i.test(n)) return "sp500";
    if (/코스피|코스닥|국내|한국|KOSPI/i.test(n)) return "kospi";
    if (/^🧭/.test(n)) return "sp500";
    return "item";
  }
  function itemMk(it){ return /^\d{6}(\.K[SQ])?$/.test(String(it.code || "")) ? "kospi" : "sp500"; }
  function bearWorst(){ var ms = ((BR && BR.markets) || []).filter(function(m){ return m.cash > 0; }); ms.sort(function(a, b){ return b.cash - a.cash || a.dd - b.dd; }); return ms[0] || null; }
  function bearSum(PL){
    var bx = document.getElementById("pobrx"); if (!bx) return;
    if (!bearOn()){ bx.innerHTML = ""; return; }
    var cut = PL._cut || 0, used = {};
    PL.forEach(function(p){ var mk = rowMk(p); if (!mk) return; if (mk === "item") p.items.forEach(function(it){ used[itemMk(it)] = 1; }); else used[mk] = 1; });
    var cr = PL.filter(function(p){ return p.bcash; })[0];
    var lines = ((BR && BR.markets) || []).filter(function(m){ return m.key !== "kosdaq"; }).map(function(m){   // 🌱 11/11 코스닥은 판정·알림만(포트 칸 없음)
      var off = m.rule && m.rule.id === "OFF";
      var tx = off ? "현금 규칙 꺼 둠 — 그대로" : !m.cash ? "그대로" : !used[m.key] ? "이 포트엔 " + (m.key === "kospi" ? "한국 주식 칸이 없어 해당 없음" : "그 시장 칸이 없어 해당 없음") : "그 시장 주식 칸의 " + m.cash + "% 덜기";
      return '<li><b>' + BMK[m.key] + ' ' + m.state + ' ' + BNM[m.state] + '</b>' + (m.cash ? ' ' + (m.to || '현금') + ' ' + m.cash + '%' : '') + ' → ' + tx + '</li>'; }).join("");
    bx.innerHTML = '<div class="po-brs"><div class="po-brh">🐻 하락장 규칙 겹쳐 봄 <small>' + e(md((BR.markets[0] || {}).asof)) + ' 종가 판정</small></div>' +
      '<div class="po-brn">현금·단기 <b>' + (cr ? cr.x.pct0 : 0) + '%</b> → <b class="po-bcv">' + (cr ? cr.x.pct : 0) + '%</b> <small>(' + (cut ? '+' + won(cut) + '원' : '바뀌는 줄 없음') + ')</small></div>' +
      '<ul>' + lines + '</ul>' +
      '<p>시장마다 그 시장 칸에만 🔁 닮은 장 규칙의 현금 몫을 적용 — 금·자산 추세·현금·상품은 그대로 · 켜 둔 동안 「주문 목록 복사」도 이대로</p>' +
      '<p class="po-brt2">💼 기본 포트는 S&P500 200일선 규칙이 먼저예요 · 🔁 닮은 장 규칙은 국내 주식과 시장별 참고용 · 보기 전용 · 매수·매도 권유 아님</p></div>';
  }
  function rows(){
    var box = document.getElementById("porows"); if (!box) return;
    var PL = pplan(); bearSum(PL);
    box.innerHTML = PL.map(function(p){
      if (p.kick) return kickRow(p);
      if (!p.x.pct) return '';
      if (p.prod) return '<div class="po-r"><div class="po-rh"><i style="background:#38bdf8"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        p.items.map(function(it){ return '<div class="po-it"><span class="tk">' + e(it.nm) + ' <small>' + r1(it.w) + '%</small></span><span class="v">' + won(it.amt) + '원' + (it.cur && it.cur !== "원" ? ' · ' + e(it.cur) + '로' : '') + '</span></div>'; }).join("") +
        '<div class="po-itn">상품은 상품 탭 · 미래에셋 매매 화면에서 금액으로 사요(채권 단가·펀드 최소금액 확인)</div></div>';                              // 0% 칸은 주문서에서 뺌
      return '<div class="po-r' + (p.kick ? ' po-rk' : '') + (p.bc ? ' po-bc' : '') + '" data-ix="' + p.i + '"><div class="po-rh"><i style="background:' + (p.kick ? "#ff6b6b" : p.bcash ? "#8a94a8" : COL[p.i % COL.length]) + '"></i><b>' + e(p.x.name) + '</b><span class="pct">' + (p.bc ? '<s>' + p.x.pct0 + '%</s> → ' : '') + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        (p.bc ? '<div class="po-bcn">🐻 ' + e(p.bmk) + ' — 이 칸의 ' + p.bc + '% 덜기 · −' + won(p.amt0 - p.amt) + '원</div>' : '') +
        (p.bcash ? '<div class="po-bcn">🐻 덜어 낸 돈 ' + won(p.amt - (p.amt0 || 0)) + '원이 여기로</div>' : '') +
        p.items.map(function(it){
          return '<div class="po-it" data-op="' + e(it.code) + '"><span class="tk">' + e(it.nm) + (it.code !== it.nm ? ' <small>' + e(it.code) + '</small>' : '') + ' <i class="po-go">›</i></span>' +
            '<span class="v">' + (it.cur === "$" ? (it.usd != null ? '$' + Math.round(it.usd).toLocaleString("en-US") + ' · ' : '') : won(it.amt) + '원 · ') +
            (it.sh != null ? (it.sh0 != null && it.sh0 !== it.sh ? '<s>' + it.sh0.toLocaleString("ko-KR") + '주</s> → <b class="po-bcv">' + it.sh.toLocaleString("ko-KR") + '주</b>' : '<b>' + it.sh.toLocaleString("ko-KR") + '주</b>') : it.cur === "현지" ? '현지 통화로' : '가격 확인') + (it.fx ? ' <small class="po-fx">' + flag(it.code) + ' ' + e(it.fx) + '</small>' : '') + '</span></div>' +
            (S.hv && it.sh != null ? hvLine(it) : '') +
            (it.note ? '<div class="po-itn">' + e(it.note) + '</div>' : ''); }).join("") +
          (p.kick && !p.items.length ? '<div class="po-itn">지금 빈 자리 — 신호가 뜨면 3%씩 들어가요 (그때까지 현금)</div>' : '') + '</div>';
    }).join("");
    hvAfter(box);
  }
  // ---- 10/14 A11-4 「갖고 있는 것 → 바꿀 것만」 ----
  function hvQty(code){ var v = S.have[code]; return v == null || v === "" ? null : +v; }
  function hvDiff(it){ var h = hvQty(it.code); if (h == null || it.sh == null) return null; return it.sh - h; }
  function hvTxt(d){ return d > 0 ? '<b class="hv-b">+' + d.toLocaleString("ko-KR") + '주 사기</b>' : d < 0 ? '<b class="hv-s">−' + (-d).toLocaleString("ko-KR") + '주 팔기</b>' : '<b class="hv-k">그대로 ✓</b>'; }
  function hvLine(it){
    var h = hvQty(it.code), d = hvDiff(it);
    return '<div class="po-hvl" data-hvl="1"><span>지금 <input aria-label="지금 가진 주식 수" class="po-hin" inputmode="numeric" data-code="' + e(it.code) + '" value="' + (h == null ? "" : h) + '" placeholder="0">주</span>' +
      '<span class="hv-d">' + (d == null ? '<small>주 수를 넣으면 「바꿀 것」이 나와요</small>' : '→ ' + hvTxt(d)) + '</span></div>';
  }
  function hvAfter(box){
    var ex = document.getElementById("pohvx"); if (ex) ex.innerHTML = "";
    if (!S.hv) return;
    [].forEach.call(box.querySelectorAll(".po-hin"), function(inp){
      inp.onclick = function(ev){ ev.stopPropagation(); };
      inp.oninput = function(ev){ ev.stopPropagation(); var v = inp.value.replace(/[^\d]/g, ""); if (v === "") delete S.have[inp.dataset.code]; else S.have[inp.dataset.code] = +v; keep();
        var row = inp.closest(".po-hvl"), code = inp.dataset.code, it = null; pplan().forEach(function(p){ p.items.forEach(function(x){ if (x.code === code) it = x; }); });
        if (row && it){ var d = hvDiff(it); row.querySelector(".hv-d").innerHTML = d == null ? '<small>주 수를 넣으면 「바꿀 것」이 나와요</small>' : '→ ' + hvTxt(d); } hvExtra(); };
    });
    // ⚡ 킥 칩(kickRow)에도 보유 수 입력은 없음 — 킥 칸은 종목이 바뀌니 「배분표에 없는 보유분」 줄로 「팔 것」을 알려 줌
    hvExtra();
  }
  function hvExtra(){
    var ex = document.getElementById("pohvx"); if (!ex || !S.hv) return;
    var inPlan = {}; pplan().forEach(function(p){ p.items.forEach(function(x){ inPlan[x.code] = 1; }); });
    var left = Object.keys(S.have).filter(function(c){ return !inPlan[c] && hvQty(c) > 0; });
    var sum = hvSummary();
    ex.innerHTML = (left.length ? '<div class="po-hvx"><b>지금 배분표에 없는 보유분</b> → 팔기: ' + left.map(function(c){ return '<span class="po-tk" data-op="' + e(c) + '">' + e(c) + '</span> ' + hvTxt(-hvQty(c)) + ' <button aria-label="닫기" type="button" class="hv-rm" data-rm="' + e(c) + '">✕</button>'; }).join(" · ") + '</div>' : '') +
      (sum ? '<div class="po-hvs">' + sum + '</div>' : '');
    [].forEach.call(ex.querySelectorAll(".hv-rm"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); delete S.have[b.dataset.rm]; keep(); hvExtra(); }; });
  }
  function hvSummary(){
    var buy = 0, sell = 0, keepN = 0, miss = 0;
    pplan().forEach(function(p){ p.items.forEach(function(it){ if (it.sh == null) return; var d = hvDiff(it); if (d == null){ miss++; return; } if (d > 0) buy++; else if (d < 0) sell++; else keepN++; }); });
    if (!buy && !sell && !keepN) return "";
    return '바꿀 것 ' + (buy + sell) + '줄 <small>(사기 ' + buy + ' · 팔기 ' + sell + ' · 그대로 ' + keepN + (miss ? ' · 주 수 안 넣음 ' + miss : '') + ')</small>';
  }
  // ⚡ 킥 칸은 간단히: 신호별 개수 한 줄 + 종목 칩(이모티콘·이름·주 수) · 규칙·손절은 「킥」 카드에서
  function kickRow(p){
    var cnt = {}; p.items.forEach(function(it){ (it.tags.match(/\p{Extended_Pictographic}/gu) || ["·"]).forEach(function(t){ cnt[t] = (cnt[t] || 0) + 1; }); });
    var lab = {"🐋": "고래", "☕": "컵", "📈": "갭", "🤫": "매집", "🧪": "시험"};
    var sum = Object.keys(cnt).filter(function(t){ return lab[t]; }).map(function(t){ return t + ' ' + lab[t] + ' ' + cnt[t]; }).join(' · ');
    return '<div class="po-r po-rk' + (p.bc ? ' po-bc' : '') + '"><div class="po-rh"><i style="background:#ff6b6b"></i><b>' + e(p.x.name) + '</b><span class="pct">' + (p.bc ? '<s>' + p.x.pct0 + '%</s> → ' : '') + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
      (p.bc ? '<div class="po-bcn">🐻 ' + e(p.bmk) + ' · −' + won(p.amt0 - p.amt) + '원 (종목마다 그 시장 권고만큼)</div>' : '') +
      (p.items.length ? '<div class="po-ksum">' + p.items.length + '종목 · 한 종목 약 ' + won(p.amt / p.items.length) + '원' + (sum ? ' · ' + sum : '') + '</div><div class="po-kg">' +
        p.items.map(function(it){
          var q = it.sh ? it.sh.toLocaleString("ko-KR") + '주' : it.cur === "현지" ? won(it.amt) + '원' : '<span class="po-k0">1주 안 됨</span>';
          return '<span class="po-kc" data-op="' + e(it.code) + '"><i>' + e(it.tags.replace(/🧪/g, "")) + '</i><b>' + e(it.short) + '</b><small>' + q + '</small></span>'; }).join("") + '</div>' +
        '<div class="po-kl" data-goto="port~pokick">손절·익절 규칙과 수익은 ⚡ 킥 카드에서 ›</div>'
      : '<div class="po-itn">지금 빈 자리 — 신호가 뜨면 3%씩 들어가요 (그때까지 현금)</div>') + '</div>';
  }
  function nm(x){ return String(x || "").replace(/,? (Inc\.?|Corp\.?|Corporation|Ltd\.?|Company|plc|N\.V\.|S\.A\.|ASA)?\s*(Common Stock|Ordinary Shares|Class [A-Z].*|American Depositary.*)$/i, "").replace(/,? (Inc\.?|Corporation|Corp\.?|Ltd\.?)$/i, "").trim(); }
  function pr(v){ return v == null ? "–" : (+v).toLocaleString("ko-KR", {maximumFractionDigits: v >= 1000 ? 0 : 2}); }
  function flag(t){ t = String(t || ""); return /\.T$/.test(t) ? "🇯🇵" : /\.K[SQ]$/.test(t) ? "🇰🇷" : /\.HK$/.test(t) ? "🇭🇰" : /\.(SS|SZ)$/.test(t) ? "🇨🇳" : "🇺🇸"; }
  function pvs(v){
    if (!v) return '';
    if (v.pending || v.edge == null) return '<em class="pvs">🌏 ' + md(v.since) + ' 고른 상품 — 다음 거래일부터 원래 상품(' + e((v.base || []).join("·")) + ')과 비교</em>';
    return '<em class="pvs">🌏 고른 상품 ' + sg(v.pick, 1) + ' vs 원래 ' + e((v.base || []).join("·")) + ' ' + sg(v.base_r, 1) + ' → <b class="' + (v.edge >= 0 ? "w" : "l") + '">' + (v.edge >= 0 ? "앞섬 " : "뒤짐 ") + sg(v.edge, 1).replace("%", "p") + '</b> · ' + v.days + '일</em>';
  }
  function peersHtml(){
    var held = {}; P.hold.forEach(function(x){ (x.picks || []).forEach(function(t){ held[t] = x.name; }); });
    var vc = function(v){ return /편입/.test(v) ? "g" : /매매 불가/.test(v) ? "n" : /과열/.test(v) ? "w" : /약함/.test(v) ? "b" : ""; };
    var h = '<div class="sec">🌏 미국 강세 섹터 × 해외 동종주 <small class="mut">3개월 달러 수익 · 위험 대비 · 과열 — 이기는 쪽을 포트에 담아요</small></div><section class="card po-pe">';
    h += PE.themes.map(function(T, ti){
      var et = T.etf || {}, all = T.rows || [], rows = all;
      var inP = rows.filter(function(r){ return held[r.t]; }).length;
      return '<details><summary><b>' + e(T.name) + '</b>' + (inP ? ' <span class="po-sg g">포트 ' + inP + '</span>' : '') +
        '<em>' + (/^미국/.test(et.t || "") ? '' : '미국 기준 ') + e(et.t || "") + ' 3개월 <b class="' + cls(et.r3) + '">' + sg(et.r3, 0) + '</b></em></summary>' +
        rows.map(function(r, ri){ var mine = held[r.t];
          return '<div class="po-per' + (mine ? " mine" : "") + (ri >= 8 && !mine ? " more" : "") + (r.nobuy ? " nb" : "") + '" data-op="' + e(r.t) + '"><span class="n">' + flag(r.t) + ' ' + e(r.name) + (mine ? ' <span class="po-sg g">✓ 담음</span>' : '') +
            '<small>' + e(r.t) + ' · 1개월 ' + sg(r.r1, 0) + ' · 낙폭 ' + sg(r.mdd, 0) + (r.ma50 ? ' · 50일선 위' : ' · 50일선 아래') + (r.nobuy ? ' · 🔒 ' + e(r.nobuy) : '') + '</small></span>' +
            '<span class="r"><b class="' + cls(r.r3) + '">' + sg(r.r3, 0) + '</b><small>vs 미국 ' + (r.ex3 >= 0 ? "+" : "") + Math.round(r.ex3) + 'p</small></span>' +
            '<span class="po-sg ' + vc(r.verdict || "") + '">' + e(r.verdict || "") + '</span></div>'; }).join("") +
          (all.length > 8 ? '<button class="po-more" onclick="this.parentNode.classList.toggle(\'all\');this.textContent=this.parentNode.classList.contains(\'all\')?\'접기\':\'전체 ' + all.length + '개 보기\'">전체 ' + all.length + '개 보기</button>' : '') + '</details>'; }).join("");
    return h + '<p class="note">' + e(PE.note || "") + ' · ' + e(PE.at || "") + ' · 「✓ 담음」 = 지금 포트 칸의 상품. 🔒 = 창업판·과창판이라 비교만 해요. 리포트가 매일 아침 이 표로 칸마다 가장 나은 상품을 고르고 바꾸면 「비중 바뀐 날」에 남아요.</p></section>';
  }
  // 🎯 집중 포트 카드 (10/11 사용자: "선택과 집중 — 오르는 시장이면 벌 때 벌어야, 단 오르는 시장 판단이 먼저")
  function concHtml(){
    var R = CN.regime, up = R.up, bt = CN.bt || {}, o = bt.oos || {}, so = bt.spy_oos || {}, ii = bt.is || {}, cu = bt.cur_oos || {};
    var h = '<div class="sec">🎯 집중 포트 <small class="mut">오르는 시장이면 벌 때 번다 · 검증한 규칙 그대로</small></div><section class="card cn-c">' +
      '<div class="cn-rg ' + (up ? "g" : "r") + '"><div class="cn-l">' + (up ? "🟢 오르는 시장" : "🔴 오르는 시장 아님") + '</div>' +
        '<div class="cn-s">S&P500 ' + (R.spx || 0).toLocaleString("en-US") + ' · 200일선보다 <b>' + sg(R.gap, 1) + '</b> · ' + md(R.since) + '부터' +
        (R.kospi_up != null ? ' · 코스피 ' + (R.kospi_up ? "🟢" : "🔴") + ' (' + sg(R.kospi_gap, 1) + ')' : '') + '</div>' +
        (R.raw_today !== up ? '<div class="cn-w">⚠ 오늘 종가는 반대쪽 — 3거래일 이어지면 판정이 바뀌어요</div>' : '') + '</div>' +
      '<div class="cn-h">지금 살 것 <small>' + won(S.amt) + '원 기준 · ' + (S.mode === "kr" ? "₩ 원화 베이스" : "💵 외화 베이스") + ' · 다음 거래일 종가</small></div>' +
      concPlan().filter(function(c){ return !c.kick; }).map(function(c){ var it = c.items[0] || {};
        return '<div class="cn-buy" data-op="' + e(it.code) + '"><b class="pct">' + c.x.pct + '%</b><span class="nm">' + e(c.x.name) + '<small>' + e(it.nm) + (it.code && it.code !== it.nm ? ' ' + e(it.code) : '') + '</small></span>' +
          '<span class="q"><b>' + (it.sh != null ? it.sh.toLocaleString("ko-KR") + '주' : '가격 확인') + '</b><small>' + won(c.amt) + '원</small></span></div>'; }).join("") +
      (CN.vol_rule && CN.vol_rule.on ? '<div class="cn-vr">🦴 변동성 방어(' + e(CN.vol_rule.role) + ') · 주식 <b>' + CN.vol_rule.eq_scale + '%</b> 유지 <small>20일 흔들림 ' + CN.vol_rule.vol20 + '% / 목표 ' + CN.vol_rule.target + '%</small></div>' : '') +
      (CN.month_flow && CN.month_flow.on ? (function(M){ var fp = Math.round((M.f || 0.6) * 100), st = M.sig > 0 ? '주식 ' + fp + '% → 장기채 <b>' + M.pct + '%</b>' : M.sig < 0 ? '추세·현금 ' + fp + '% → 주식' : M.window ? '쏠림 작음 · 그대로' : '쉬는 중 · 월말 ' + M.k + '거래일에만';
        return (M.tonight && M.tonight.act ? '<div class="cn-vr" style="border:1px solid #ffb84d">⏰ <b>' + e(M.tonight.text) + '</b></div>' : '') + '<div class="cn-vr">🔄 월말 흐름 · ' + st + ' <small>' + (M.drift != null ? '쏠림 ' + (M.drift >= 0 ? "+" : "") + M.drift + '%p · ' : '') + (M.for || "").slice(5) + ' 기준</small></div>'; })(CN.month_flow) : '') +
      '<p class="cn-n2">판정이 바뀌는 날(🟢↔🔴)과 🔄 월말 흐름 날에만 고치면 돼요. 금액·환율 바꾸기는 아래 📋 따라하기에서.</p>' +
      '<details class="cn-d"><summary>📊 성적·검증 보기</summary>' +
      '<div class="cn-h">' + md(CN.start) + '부터 <small>비용 포함 · 달러 기준</small></div>' +
      '<div class="cn-v">' + [["🎯 집중", CN.ret], ["💼 기본", CN.base], ["⚡ 킥", CN.kick], ["S&P500", CN.spy_ret], ["나스닥100", CN.qqq_ret]].map(function(x){
        return '<div' + (x[0] === "🎯 집중" ? ' class="me"' : '') + '><small>' + x[0] + '</small><b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b></div>'; }).join("") + '</div>';
    if (o.cagr != null){
      h += '<div class="cn-h">검증 — 규칙 고를 때 안 본 ' + e((bt.period || [])[0] || "").slice(0, 4) + '~' + e((bt.period || [])[1] || "").slice(0, 4) + ' <small>다음 날 체결·비용 포함</small></div>' +
        '<table class="cn-t"><tr><th></th><th>연수익</th><th>최대 낙폭</th><th>이긴 해</th></tr>' +
        '<tr class="me"><td>🎯 이 규칙</td><td class="up">' + sg(o.cagr, 1) + '</td><td>' + sg(o.mdd, 0) + '</td><td>' + o.beat_years + '/' + o.years + '</td></tr>' +
        '<tr><td>S&P500</td><td>' + sg(so.cagr, 1) + '</td><td>' + sg(so.mdd, 0) + '</td><td>–</td></tr>' +
        (cu.cagr != null ? '<tr><td>현금 26% 늘 들기<br><small>지금 기본 포트 닮은꼴</small></td><td class="dn">' + sg(cu.cagr, 1) + '</td><td>' + sg(cu.mdd, 0) + '</td><td>' + cu.beat_years + '/' + cu.years + '</td></tr>' : '') + '</table>' +
        '<p class="cn-n">S&P보다 연 <b class="' + cls(o.ex) + '">' + sg(o.ex, 1) + 'p</b> · 낙폭은 ' + Math.abs((o.mdd || 0) - (so.mdd || 0)).toFixed(0) + '%p 작게' + (ii.ex != null ? ' · 규칙 고른 2008~2016에서도 ' + sg(ii.ex, 1) + 'p' : '') + '</p>';
      if (bt.yr){
        var ys = Object.keys(bt.yr).filter(function(y){ return y >= "2017"; });
        var mx = Math.max.apply(null, ys.map(function(y){ return Math.max(Math.abs(bt.yr[y][0]), Math.abs(bt.yr[y][1])); }).concat([1]));
        h += '<div class="cn-yr">' + ys.map(function(y){ var a = bt.yr[y][0], b2 = bt.yr[y][1], w = a >= b2;
          return '<div><span>' + y.slice(2) + '</span><i class="a ' + (a < 0 ? "m" : "") + '" style="height:' + (Math.abs(a) / mx * 34).toFixed(0) + 'px"></i><i class="b" style="height:' + (Math.abs(b2) / mx * 34).toFixed(0) + 'px"></i><em class="' + (w ? "w" : "l") + '">' + (w ? "●" : "○") + '</em></div>'; }).join("") + '</div>' +
          '<div class="cn-lg"><span><i class="a"></i>🎯 규칙</span><span><i class="b"></i>S&P500</span><span>● 이긴 해</span></div>';
      }
    }
    h += '</details><details class="cn-d"><summary>왜 이 규칙인가 · 규칙 그대로</summary><p>' +
      '「강한 섹터 2~3개에 몰기」는 2017년 이후 576가지 조합 중 2~7%만 S&P를 이겼어요(섹터를 늦게 타고 늦게 내림 + 비용). 지는 가장 큰 이유는 상승장에서도 현금·금을 크게 들고 있는 것이었어요. ' +
      '그래서 「섹터」가 아니라 「시장에 싣는 양」에 집중합니다. 상승장 판정은 평균 수익을 올리기보다 나쁜 꼬리(20일 최악 10%: −3.6% vs −7%)를 절반으로 줄여요.</p>' +
      '<p><b>판정</b> ' + e(CN.rule.judge) + '<br>' + e(CN.rule.on) + '<br>' + e(CN.rule.off) + '<br><small>' + e(CN.rule.how) + '</small></p>' +
      ((R.flips || []).length ? '<p><b>판정이 바뀐 날</b><br>' + R.flips.map(function(f){ return (f.up ? "🟢 " : "🔴 ") + e(f.d); }).join(" · ") + '</p>' : '') +
      '<p class="mut">' + e(CN.note) + ' 계산 ' + e(CN.at) + '</p></details></section>';
    return h;
  }

  function kickHtml(){
    var ks = K.stat, d = ks.kick - ks.base, rows2;
    var h = '<div class="sec">⚡ 킥 칸 속 <small class="mut">킥 포트에만 있는 ' + Math.round((((K.rules || {}).sleeve || 0) + ((K.rules || {}).whale_sleeve || 0)) * 100) + '% · 기본 포트보다 ' + sg(d) + 'p</small></div><section class="card po-vs">' +
      '<div class="po-ks">' + (K.whale ? '<span>🐋 들어온 고래 종목 <b class="' + cls(K.whale.ret) + '">' + sg(K.whale.ret) + '</b></span><span>☕📈 돌파 종목 <b class="' + cls(K.sleeve) + '">' + sg(K.sleeve) + '</b></span>' : '<span>슬리브 <b class="' + cls(K.sleeve) + '">' + sg(K.sleeve) + '</b></span>') + '<span>자리 <b>' + ks.slots + '</b></span><span>끝난 거래 <b>' + ks.trades + '</b>' +
      (ks.win != null ? ' · 이긴 비율 <b>' + ks.win + '%</b>' : '') + '</span>' + (ks.avg_win != null ? '<span>이길 때 <b class="up">' + sg(ks.avg_win, 1) + '</b> · 질 때 <b class="dn">' + sg(ks.avg_loss, 1) + '</b></span>' : '') +
      (ks.paused ? '<span class="warn">⛔ 브레이크 중 (새 진입 멈춤)</span>' : '') + '</div>';
    if (K.rule && K.rule.base_now){
      var R = K.rule, P0 = {}; P.hold.forEach(function(x){ P0[x.name] = x.pct; });
      var cashN = Object.keys(R.base_now).filter(function(n){ return /현금/.test(n); })[0];
      h += '<div class="po-rule"><b>🧪 ' + md(R.from) + '부터 킥 포트 규칙</b> <small>검증을 통과한 것만 · 💼 기본 포트(리포트 그대로)와 S&P500에 견줘요</small>' +
        '<div>① 현금 = 국면 「' + e(R.quad || "") + '」 → <b>' + R.cash + '%</b>' + (cashN ? ' <span class="mut">(리포트 ' + P0[cashN] + '%)</span>' : '') + '</div>' +
        '<div>② 🐋 고래 바스켓 <b>' + Math.round((R.whale_sleeve || 0) * 100) + '%</b> <span class="mut">(전 6%)</span> · 돌파 ' + Math.round(((K.rules || {}).sleeve || 0) * 100) + '%</div>' +
        '<div class="mut">③ 강한 칸 기울이기 · ④ 추세 브레이크는 2008년~ 검증에서 효과가 없어 꺼 둠 · 📊 실적 갭은 그림자 채점부터</div>' +
        '<div class="po-rl" data-goto="score~scrbt">검증 결과 보기 ›</div></div>';
    }
    // 🛑 10/22 신호별 손실 한도 — 정상이면 아무것도 안 보임, 걸렸을 때만 작은 꼬리표
    var GN = (K.guard || {}).now || {}, GR = (K.guard || {}).rule || {};
    function gTag(k){ var g = GN[k]; if (!g || g.mult == null || g.mult >= 1) return '';
      return ' <small class="' + (g.mult === 0 ? 'dn' : 'warn') + '" data-tip="' + e("🛑 신호별 손실 한도 — 이 신호의 끝난 거래 장부가 고점 대비 " + g.dd + "% · " + (GR.doc || "")) + '">' + (g.mult === 0 ? '🛑 멈춤' : '✂ ½') + '</small>'; }
    if (K.proof) h += '<div class="po-pf3">' + [["whale", "🐋 고래"], ["cup", "☕ 컵"], ["gap", "📈 갭"], ["earn", "📊 실적 갭"], ["trend", "🧭 추세"], ["pead", "📊 실적 표류"], ["nh52", "🏔 신고가"], ["dip", "🩹 급락 반등"]].filter(function(x){ return K.proof[x[0]]; }).map(function(x){ var p = K.proof[x[0]] || {}; var ID = (K.ideas || {})[x[0]]; if (ID && !ID.on) p = Object.assign({}, p, {on: false, trial: false, n: null, shadow: ID.state});
      var ho = p.honest, ht = ho && ho.n && ho.avg != null ? "<br>🧾 정직 " + (ho.avg > 0 ? "+" : "") + ho.avg.toFixed(1) + "% · " + ho.n + "건" + (ho.pf != null ? " · 손익비 " + ho.pf : "") + (ho.pf != null && ho.pf < 1.5 ? " ⚠ 정직 기준 미달" : "") + (ho.insample ? " · 같은 자료로 맞춘 값" : "") : p.fixed ? "<br>4분기 표본·고정 판정" : "";
      return '<span class="' + (p.trial ? "trial" : p.on ? "on" : "wait") + '" data-tip="' + e((p.why || "") + ht) + '">' + x[1] + ' ' + (p.trial ? '🧪 시험 ½' : p.on ? '✓' : p.shadow ? (p.shadow === '❌' ? '❌ 기각' : '👻 그림자') : '⏳ ' + (p.n || 0) + '/20') + (ho && ho.n && ho.avg != null ? ' <small class="' + cls(ho.avg) + '">정직 ' + sg(ho.avg, 1) + '</small>' : '') + gTag(x[0]) + '</span>'; }).join("") + '</div>';
    if (K.shadow_stat && Object.keys(K.shadow_stat).length) h += '<div class="po-itn" style="padding-left:0">👻 못 들어온 신호도 「들어갔다면」으로 계속 채점 — ' + Object.keys(K.shadow_stat).map(function(k){ var v = K.shadow_stat[k];
      return e(v.tag || k) + ' ' + v.n + '건 평균 ' + sg(v.avg, 1); }).join(" · ") + ' (20건·손익비 1.5 넘으면 자동 편입)</div>';
    var HL = kHold();
    h += '<div class="po-kh">지금 들고 있는 것 <small>' + HL.length + '종목</small></div>' + (HL.length ? HL.map(function(o){
      return '<div class="po-kp" data-op="' + e(o.code) + '"><div><span class="po-tg">' + e(o.tags || "") + '</span> <b>' + e(nm(o.name)) + ' <i class="po-go">›</i></b> <small>' + e(o.code) + ' · ' + (Math.round(o.w * 10) / 10) + '%</small>' + (o.half ? ' <span class="po-sg w">절반 익절</span>' : '') +
        '<em>' + md(o.d0) + ' 진입 ' + pr(o.entry) + ' · ' + e(o.rule || "") + (o.by && o.by.length ? ' · ' + e(o.by.join(", ")) : '') + '</em></div><b class="' + cls(o.r) + '">' + sg(o.r, 1) + '<small class="po-cw">' + (o.r >= 0 ? "+" : "−") + won(Math.abs(S.amt * o.w / 100 * o.r / 100)) + '원</small></b></div>'; }).join("")
      : '<div class="po-itn">빈 자리 — 확인된 신호를 기다리는 중</div>');
    if (K.park && K.park.on) h += '<div class="po-itn" style="padding-left:0">🅿️ 빈 자리 ' + (K.park.w != null ? '<b>' + (Math.round(K.park.w * 10) / 10) + '%</b> ' : '') + '는 현금 대신 💼 기본 칸과 똑같이(S&P·나스닥 비중 그대로) 담아 둬요 — 신호가 오면 그만큼 지수를 팔아 사요 (' + md(K.park.from) + '부터)</div>';
    if (K.tags) h += '<p class="po-itn" style="padding-left:0">' + Object.keys(K.tags).map(function(k){ return k + ' ' + e(K.tags[k]); }).join(" · ") + '</p>';
    if (K.closed.length) h += '<div class="po-kh">끝난 거래</div>' + K.closed.slice(0, 8).map(function(c){
      return '<div class="po-kp" data-op="' + e(c.code) + '"><div><b>' + e(nm(c.name)) + ' <i class="po-go">›</i></b> <small>' + e(c.code) + '</small><em>' + md(c.d0) + '→' + md(c.d1) + ' · ' + c.days + '일 · ' + e(c.why) + '</em></div><b class="' + cls(c.r) + '">' + sg(c.r, 1) + '</b></div>'; }).join("");
    h += '<p class="note">' + e(K.note) + '</p></section>';
    return h;
  }
  function copy(){
    var t;
    if (S.hv){   // A11-4: 바꿀 것만 복사
      var ls = []; pplan().forEach(function(p){ p.items.forEach(function(it){ if (it.sh == null) return; var d = hvDiff(it); if (d == null) ls.push("· " + it.nm + " " + it.sh + "주 (지금 주 수 안 넣음)"); else if (d) ls.push("· " + it.nm + " " + (d > 0 ? "+" + d + "주 사기" : "−" + (-d) + "주 팔기")); }); });
      var inPlan = {}; pplan().forEach(function(p){ p.items.forEach(function(x){ inPlan[x.code] = 1; }); });
      Object.keys(S.have).forEach(function(c){ if (!inPlan[c] && hvQty(c) > 0) ls.push("· " + c + " −" + hvQty(c) + "주 팔기 (배분표에 없음)"); });
      t = "💼 CH Investing 포트 바꿀 것만 (" + md(P.changes[0] && P.changes[0].date) + " 배분표 · 투자금 " + won(S.amt) + "원)\n" + (ls.length ? ls.join("\n") : "· 바꿀 것 없음 ✓") + "\n※ 매수 추천 아님 · 리포트 배분표와 내 보유분의 차이 계산";
    } else
    t = "💼 CH Investing 포트 따라하기 (" + md(P.changes[0] && P.changes[0].date) + " 배분표 · 투자금 " + won(S.amt) + "원)" + (bearOn() ? " · 🐻 하락장 규칙 겹친 것(" + bearHead() + ")" : "") + "\n" +
      pplan().filter(function(p){ return p.x.pct > 0; }).map(function(p){ return "· " + p.x.name + " " + p.x.pct + "% (" + won(p.amt) + "원): " + p.items.map(function(it){ return it.nm + (it.sh != null ? " " + it.sh + "주" : ""); }).join(", "); }).join("\n") +
      (bearOn() ? "\n※ 🐻 보기 전용 겹침 — 시장마다 그 시장 칸에만 계기판 현금 권고(🇰🇷 하락장 100% · 🇺🇸 꺼 둠)(배분표 규칙은 그대로)" : "") + "\n※ 매수 추천 아님 · 리포트 배분표를 그대로 옮긴 계산";
    var ok = function(){ var s = document.getElementById("pocpst"); if (s){ s.textContent = "복사됐어요 ✓"; setTimeout(function(){ s.textContent = ""; }, 2500); } };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok).catch(function(){ prompt("복사하세요", t); });
    else prompt("복사하세요", t);
  }

  var css = document.createElement("style");
  css.textContent =
    ".po-brt button.on{background:rgba(255,140,40,.18);box-shadow:inset 0 0 0 1.5px rgba(255,140,40,.6);color:var(--text)}" +
    ".po-bc{box-shadow:inset 3px 0 0 #ff8c28}.po-bc .pct s,.po-r .v s{opacity:.55;font-weight:600}.po-bcn{font-size:12.5px;font-weight:700;color:#d9731a;margin:2px 0 4px;word-break:keep-all}.po-bcv{color:#d9731a}" +
    ".po-brs{margin:10px 0 2px;padding:12px;border-radius:12px;background:rgba(255,140,40,.09);box-shadow:inset 0 0 0 1px rgba(255,140,40,.35)}.po-brh{font-size:14.5px;font-weight:900}.po-brh small{font-size:12px;color:var(--sub);font-weight:600;margin-left:4px}" +
    ".po-brw b{color:#d9731a}.po-brn{font-size:15px;margin:6px 0}.po-brn small{color:var(--sub)}.po-brs ul{margin:4px 0 6px;padding-left:18px;font-size:13px;line-height:1.55;word-break:keep-all}.po-brs p{margin:4px 0 0;font-size:12.5px;color:var(--sub);line-height:1.5;word-break:keep-all}.po-brs .po-brt2{font-weight:700}" +
    ".po-hero{background:linear-gradient(160deg,rgba(233,196,106,.16),rgba(18,24,38,.4) 60%);border:1px solid var(--line);border-radius:18px;padding:16px 14px;margin-bottom:6px}" +
    ".po-hon{margin:-2px 0 6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.po-hon small{font-size:12.5px;color:var(--sub)}.po-lbs .hon-chip{display:flex;width:max-content;margin:2px 0 0;font-size:12.5px}" +
    ".po-k{font-size:13px;color:var(--sub)}.po-big{font-size:44px;font-weight:900;letter-spacing:-1px;line-height:1.1;margin:4px 0}" +
    ".po-sub{font-size:13.5px;color:var(--sub)}.po-sub b{color:var(--text)}" +
    ".po-cmp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 8px}.po-cmp>div{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px}" +
    ".po-cmp small{display:block;font-size:12.5px;color:var(--sub)}.po-cmp b{font-size:16px}.po-cmp em{display:block;font-style:normal;font-size:12.5px;margin-top:2px}" +
    ".po-ksum{font-size:12.5px;color:var(--sub);margin:2px 0 8px}" +
    ".po-kg{display:grid;grid-template-columns:1fr 1fr;gap:6px}" +
    ".po-kc{display:flex;align-items:center;gap:4px;min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:7px 8px;cursor:pointer}" +
    ".po-kc i{font-style:normal;font-size:12.5px;flex:none}.po-kc b{font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".po-kc small{flex:none;font-size:12.5px;font-weight:700}.po-k0{color:var(--sub);font-weight:400;font-size:12.5px}" +
    ".po-kl{font-size:12.5px;color:var(--accent,#e9c46a);margin-top:8px;cursor:pointer}" +
    "em.w{color:#4dd47a;font-style:normal}em.l{color:#8a94a8;font-style:normal}" +
    ".po-ch{margin-top:6px}.po-w{font-size:12.5px;color:var(--sub);margin-top:4px}" +
    ".po-follow .dn-w{margin-bottom:10px}.po-in label{font-size:13px;color:var(--sub)}" +
    ".po-amt{display:flex;align-items:center;gap:6px;margin-top:4px}.po-amt input{flex:1;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:10px 12px;font:inherit;font-size:22px;font-weight:800;text-align:right;min-width:0}" +
    ".po-q,.po-mode{display:flex;gap:6px;margin-top:8px}.po-q button,.po-mode button{flex:1;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 4px;font:inherit;font-size:13px;cursor:pointer}" +
    ".po-mode button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:800}" +
    ".po-r{border-top:1px solid var(--line);padding:10px 0}.po-r:first-child{margin-top:12px}" +
    ".po-rh{display:flex;align-items:center;gap:7px}.po-rh i{width:10px;height:10px;border-radius:3px;flex:none}.po-rh b{flex:1;font-size:15px}.po-rh .pct{color:var(--sub);font-size:13px}.po-rh .am{font-weight:800;min-width:64px;text-align:right}" +
    ".po-it{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;padding:4px 0 0 17px}.po-it .tk small{color:var(--dim)}.po-it .v{color:var(--sub);white-space:nowrap}.po-it .v b{color:var(--text)}" +
    ".po-hv{display:flex;align-items:center;gap:8px;margin:8px 0 2px;flex-wrap:wrap}.po-hv button{font:inherit;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text)}.po-hv button.on{background:#4dd47a;color:#0b0f17;border-color:transparent}.po-hv small{font-size:12.5px;color:var(--sub)}" +
    ".po-hvl{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:var(--sub);padding:3px 0 2px 17px}.po-hin{width:52px;font:inherit;font-size:14px;font-weight:800;text-align:right;padding:3px 6px;margin:0 3px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--text)}.po-hvl .hv-d{white-space:nowrap;min-width:0}.po-hvl .hv-d small{font-size:12px;white-space:normal;word-break:keep-all;display:block;text-align:right}.hv-b{color:#4dd47a}.hv-s{color:#e66767}.hv-k{color:var(--sub)}" +
    ".po-hvx{margin-top:10px;padding:8px 10px;border-radius:10px;background:rgba(230,103,103,.08);font-size:12.5px;line-height:1.7}.po-hvx .hv-rm{font:inherit;font-size:12.5px;border:0;background:transparent;color:var(--dim);padding:0 2px}.po-hvs{margin-top:8px;font-size:13px;font-weight:800;text-align:right}.po-hvs small{font-weight:600;color:var(--sub)}" +
    ".po-cp{display:flex;align-items:center;gap:10px;margin-top:10px}.po-cp span{font-size:13px;color:#4dd47a}" +
    ".po-tli{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px}.po-tli:last-of-type{border-bottom:0}.po-tli .d{font-weight:800;min-width:42px}.po-tli em{background:#e9c46a;color:#111;border-radius:6px;padding:0 6px;font-style:normal;font-size:12.5px;font-weight:800}" +
    ".po-cr{display:grid;grid-template-columns:1fr 34% 58px;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}.po-cr:last-child{border-bottom:0}" +
    ".po-cr .n{font-size:13.5px}.po-cr .n i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}.po-cr .n small{color:var(--sub)}.po-cr .n em{display:block;font-style:normal;font-size:12.5px;color:var(--dim)}" +
    ".po-cr .bar{position:relative;height:10px;background:var(--panel2);border-radius:5px}.po-cr .bar span{position:absolute;top:0;bottom:0;border-radius:5px}" +
    ".po-cr .bar .p{left:50%;background:#e66767}.po-cr .bar .m{right:50%;background:#3987e5}.po-cr>b{text-align:right;font-size:13px}" +
    ".po-sg{font-size:12.5px;font-weight:800;border-radius:5px;padding:0 5px;margin-left:3px}.po-sg.g{background:rgba(77,212,122,.18);color:#4dd47a}.po-sg.b{background:rgba(57,135,229,.2);color:#7cb0ff}.po-sg.w{background:rgba(255,184,77,.18);color:#ffb84d}.po-cr .n em.sgt{color:var(--sub)}" +
    ".po-vs2{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:6px;margin-bottom:8px}.po-vs2>div{background:var(--panel2);border-radius:12px;padding:8px;text-align:center}.po-vs2>div.k{background:rgba(255,107,107,.13);border:1px solid rgba(255,107,107,.4)}" +
    ".po-vs2 small{display:block;font-size:12.5px;color:var(--sub)}.po-vs2 b{font-size:19px}.po-vs2 em{display:block;font-style:normal;font-size:12.5px}" +
    ".po-ks{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:6px 0}.po-ks b{color:var(--text)}.po-ks .warn{color:#ffb84d}" +
    ".po-kh{font-size:12.5px;font-weight:800;color:var(--sub);margin:12px 0 2px}.po-kp{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}.po-kp small{color:var(--dim)}.po-kp em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".po-itn{font-size:12.5px;color:var(--dim);padding:2px 0 0 17px}.po-rk{background:rgba(255,107,107,.06);border-radius:10px;padding:10px 6px}" +
    ".po-mx table{width:100%;border-collapse:collapse;font-size:12.5px}.po-mx td,.po-mx th{white-space:nowrap}.po-mx th{font-size:12.5px;color:var(--sub);font-weight:600;text-align:right;padding:3px}.po-mx th:first-child{text-align:left}" +
    ".po-mx td{text-align:right;padding:8px 3px;border-top:1px solid var(--line);vertical-align:top}.po-mx td:first-child{text-align:left;font-weight:800;white-space:nowrap}.po-mx td small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}" +
    ".po-sra{font-style:normal;font-size:12px;color:var(--sub);margin-left:2px}.po-sr.op{background:color-mix(in srgb,#e9c46a 10%,var(--panel2))}" +
    ".po-hb{margin:2px 0 8px;padding:10px;border-radius:12px;background:var(--panel2);border:1px solid var(--line)}.po-hbh{font-size:13.5px;margin-bottom:6px}.po-hbh small{display:block;font-size:12px;color:var(--sub)}" +
    ".po-hbbar{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1px;margin:0 0 6px}.po-hbbar i{display:block}" +
    ".po-hbr{padding:6px 0;border-top:1px solid var(--line)}.po-hbr:first-of-type{border-top:0}.po-hbc{display:flex;align-items:center;gap:6px;font-size:13.5px}.po-hbc i{width:9px;height:9px;border-radius:2px;flex:none}.po-hbc b{flex:1;min-width:0}.po-hbc span{font-weight:800;font-variant-numeric:tabular-nums}" +
    ".po-hbl{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 0 15px}.po-hbi{display:inline-flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:3px 7px;font-size:12.5px;line-height:1.3;cursor:pointer}.po-hbi small{font-size:11.5px;color:var(--sub)}.po-hbe{font-size:12.5px;color:var(--sub)}" +
    ".po-hbx{display:block;margin:8px auto 0;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:6px 18px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".po-mx td em{display:block;font-style:normal;font-size:12.5px}.po-mx tr[data-pf]{cursor:pointer}.po-mx tr.on td{background:rgba(233,196,106,.08)}.po-mx tr.mkt td{color:var(--sub);font-size:12.5px}" +
    ".po-cbuy{margin:10px 0 8px;padding:10px 12px;border-radius:14px;background:rgba(77,212,122,.08);border:1px solid rgba(77,212,122,.35)}.po-cbh{font-weight:800;font-size:14px}.po-cbh small{font-weight:400;color:var(--sub);font-size:12.5px;margin-left:4px}.po-cbuy .cn-buy:last-of-type{border-bottom:0}.po-cbn{font-size:12.5px;color:var(--sub);margin-top:4px}" +
    ".cn-buy{display:flex;align-items:center;gap:10px;padding:10px 2px;border-bottom:1px solid var(--line);cursor:pointer}.cn-buy .pct{font-size:18px;min-width:46px}.cn-buy .nm{flex:1;min-width:0;font-weight:700}.cn-buy .nm small{display:block;font-weight:400;color:var(--sub);font-size:12.5px;margin-top:2px}.cn-buy .q{text-align:right}.cn-buy .q b{font-size:17px;display:block}.cn-buy .q small{color:var(--sub);font-size:12.5px}.cn-vr{margin:8px 0 2px;font-size:12.5px}.cn-vr small{color:var(--sub);margin-left:4px}.cn-n2{font-size:12.5px;color:var(--sub);margin:6px 0 8px}.cn-d>summary{cursor:pointer;font-size:13px;font-weight:700;padding:8px 0}" +
    ".my-pk{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px}.my-pk button{border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px}.my-pk button.on{color:var(--text);border-color:#38bdf8;background:rgba(56,189,248,.14)}" +
    ".po-vr{margin:4px 0 6px;font-size:12.5px;color:var(--text)}.po-vr small{color:var(--sub);margin-left:4px}.po-pf2{margin:12px 0 8px}.po-hero.kick{background:linear-gradient(160deg,rgba(255,107,107,.16),rgba(18,24,38,.4) 60%)}.po-hero.conc{background:linear-gradient(160deg,rgba(77,212,122,.16),rgba(18,24,38,.4) 60%)}.po-hero.mine{background:linear-gradient(160deg,rgba(244,114,182,.16),rgba(18,24,38,.4) 60%)}" +
    ".po-go{font-style:normal;color:var(--c,#e9c46a);font-weight:800;margin-left:2px}.po-it[data-op],.po-kp[data-op],.po-tk{cursor:pointer}.po-tk{text-decoration:underline dotted;text-underline-offset:2px;color:var(--text)}" +
    ".po-it[data-op]:active,.po-kp[data-op]:active{background:rgba(255,255,255,.05)}" +
    ".po-lbs button{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;min-width:0;overflow:hidden}.po-lbs .po-big{font-size:20px;line-height:1.2;white-space:nowrap}" +
    ".po-lbs .po-hs{display:block;width:100%;min-height:20px;margin:3px 0 6px}.po-lbs .po-hs .hon-chip{background:none!important;border:0!important;padding:0!important;display:inline-flex;align-items:center;gap:3px;width:auto;max-width:100%;margin:0;font-size:12.5px;white-space:nowrap;overflow:hidden}" +
    ".po-lbs .po-hs .hon-chip b{font-size:12.5px!important;line-height:1}.po-lbs .po-hs .hon-chip i{font-style:normal;opacity:.7}.po-lbs .po-hn{font-size:12.5px;color:var(--sub);white-space:nowrap}" +
    ".po-lbs em{margin-top:auto!important;width:100%;white-space:nowrap}.po-lbs em b{font-size:12.5px!important}" +
    ".po-lbs{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:6px}.po-lbs button{text-align:left;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:12px;padding:8px 10px;font:inherit;cursor:pointer}" +
    ".po-lbs button.on{border-color:#e9c46a;background:rgba(233,196,106,.1)}.po-lbs button.k.on{border-color:#ff6b6b;background:rgba(255,107,107,.1)}.po-lbs small{display:block;font-size:12.5px;color:var(--sub)}.po-lbs b{font-size:20px}" +
    ".po-lbs em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);margin-top:2px}.po-lbs em b{font-size:12.5px;color:var(--text)}.po-wbar{display:block;height:5px;border-radius:3px;background:var(--panel);margin:3px 0 2px;overflow:hidden}.po-wbar i{display:block;height:100%;background:#4dd47a}" +
    ".cn-rg{border-radius:12px;padding:10px 12px;margin-bottom:10px}.cn-rg.g{background:rgba(77,212,122,.12)}.cn-rg.r{background:rgba(255,107,107,.12)}.cn-l{font-weight:800;font-size:17px}.cn-s{font-size:12.5px;color:var(--sub);margin-top:3px}.cn-w{font-size:12.5px;color:#ffb84d;margin-top:4px}" +
    ".cn-h{font-weight:800;font-size:13.5px;margin:12px 0 6px}.cn-h small{font-weight:400;color:var(--sub);font-size:12.5px;margin-left:4px}" +
    ".cn-r{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--line)}.cn-r>b{font-size:17px;min-width:44px}.cn-r>span{flex:1;font-size:14px}.cn-r small{display:block;color:var(--sub);font-size:12.5px}.cn-r em{font-style:normal;font-weight:700;font-size:13px}" +
    ".cn-v{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}.cn-v div{background:var(--panel2);border-radius:9px;padding:6px 2px;text-align:center}.cn-v div.me{outline:2px solid #4dd47a}.cn-v small{display:block;font-size:12.5px;color:var(--sub)}.cn-v b{font-size:13px}" +
    ".cn-t{width:100%;border-collapse:collapse;font-size:12.5px}.cn-t th{color:var(--sub);font-weight:400;text-align:right;padding:4px}.cn-t td{text-align:right;padding:5px 4px;border-top:1px solid var(--line)}.cn-t td:first-child,.cn-t th:first-child{text-align:left}.cn-t tr.me td{font-weight:800}.cn-t small{color:var(--sub);font-weight:400}" +
    ".cn-n{font-size:12.5px;margin:6px 0 0}.cn-yr{display:flex;gap:3px;align-items:flex-end;margin-top:10px;height:62px}.cn-yr div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:1px;position:relative}" +
    ".cn-yr i{display:block;width:40%;border-radius:2px}.cn-yr i.a{background:#4dd47a}.cn-yr i.a.m{background:#4dd47a;opacity:.4}.cn-yr i.b{background:#7c9cff;opacity:.6}.cn-yr div{flex-direction:row;align-items:flex-end}.cn-yr span{position:absolute;bottom:-14px;font-size:12.5px;color:var(--sub)}.cn-yr em{position:absolute;top:-2px;font-size:8px;font-style:normal}.cn-yr em.w{color:#4dd47a}.cn-yr em.l{color:var(--sub)}" +
    ".cn-lg{display:flex;gap:12px;font-size:12.5px;color:var(--sub);margin-top:18px}.cn-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:3px;vertical-align:-1px}.cn-lg i.a{background:#4dd47a}.cn-lg i.b{background:#7c9cff;opacity:.6}" +
    ".cn-d{margin-top:10px;font-size:12.5px}.cn-d summary{cursor:pointer;color:var(--acc);font-weight:700}.cn-d p{margin:6px 0;line-height:1.55}" +
    ".po-chips{display:flex;gap:5px;overflow-x:auto;margin:10px 0 4px;scrollbar-width:none}.po-chips::-webkit-scrollbar{display:none}.po-chips button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;cursor:pointer}.po-chips button.on{background:var(--text);color:var(--bg,#111);border-color:transparent;font-weight:800}" +
    ".po-rr{display:grid;grid-template-columns:16px minmax(0,1fr) 14% 54px 58px;align-items:center;gap:6px;padding:7px 2px;border-bottom:1px solid var(--line);font-size:13.5px;cursor:pointer}.po-rr:last-child{border-bottom:0}" +
    ".po-rr .no{font-size:12.5px;color:var(--dim);text-align:right}.po-rr .n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.po-rr .n small{display:block;font-size:12.5px;color:var(--dim);white-space:normal;line-height:1.3}" +
    ".po-rr .dot{display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid var(--dim);margin-right:5px;vertical-align:0}.po-rr.sel .dot{border-color:transparent}" +
    ".po-rr .bar{position:relative;height:9px;background:var(--panel2);border-radius:5px}.po-rr .bar span{position:absolute;top:0;bottom:0;border-radius:5px}.po-rr .bar .p{left:50%;background:#e66767}.po-rr .bar .m{right:50%;background:#3987e5}" +
    ".po-rr .bar.z::before{content:\"\";position:absolute;left:50%;top:-2px;bottom:-2px;width:1.5px;background:var(--sub);opacity:.7}.po-rr .bar.z .m{background:#4dd47a}.po-rr .bar.z .p{background:#e66767}.po-rr .bar .ov{position:absolute;top:-6px;font-size:13px;font-weight:900;color:var(--sub);line-height:1}.po-rr .bar .ov.r{right:-2px}.po-rr .bar .ov.l{left:-2px}" +
    ".po-rkh{display:inline-flex;align-items:center;gap:6px;margin-left:auto;margin-right:10px;font-size:12.5px}.po-rkh em{font-style:normal;color:var(--sub)}.po-rkh em.w{color:#4dd47a}.po-rkh em.l{color:var(--dim)}.po-rks{display:block}" +
    ".po-rr .v{text-align:right;font-size:13px}.po-rr .d{text-align:right;font-size:12.5px}.po-rr .d.w{color:#4dd47a}.po-rr .d.l{color:var(--dim)}" +
    ".po-rr.me{background:rgba(233,196,106,.1);border-radius:10px;border-bottom-color:transparent;margin:2px 0}.po-rr.me.k{background:rgba(255,107,107,.1)}.po-rr.me.on{outline:1.5px solid #e9c46a}.po-rr.me.k.on{outline-color:#ff6b6b}" +
    ".po-cmp.n4{grid-template-columns:repeat(2,1fr)}.po-cmp.n1{grid-template-columns:1fr}.po-cmp.n2{grid-template-columns:repeat(2,1fr)}" +
    ".po-pe details{border-bottom:1px solid var(--line);padding:8px 0}.po-pe details:last-of-type{border-bottom:0}.po-pe summary{cursor:pointer;font-size:14px;list-style:none}.po-pe summary::-webkit-details-marker{display:none}.po-pe summary em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".po-per{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:6px 0 6px 6px;border-top:1px dashed var(--line);font-size:13.5px;cursor:pointer}.po-per .n small{display:block;font-size:12.5px;color:var(--dim)}" +
    ".po-per .r{text-align:right}.po-per .r small{display:block;font-size:12.5px;color:var(--sub)}.po-per.mine{background:rgba(77,212,122,.07);border-radius:8px}.po-fx{color:var(--dim)}" +
    ".po-cr .n em.pvs{color:var(--sub)}.po-cr .n em.pvs b.w{color:#4dd47a}.po-cr .n em.pvs b.l{color:#ff8a8a}" +
    ".po-pe details .po-per.more{display:none}.po-pe details.all .po-per.more{display:grid}.po-more{display:block;width:100%;margin-top:6px;border:1px dashed var(--line);background:none;color:var(--sub);border-radius:8px;padding:6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".po-per.nb .n{opacity:.8}.po-sg.n{background:rgba(138,148,168,.18);color:#aab3c5}" +
    ".po-rule{background:rgba(124,156,255,.08);border:1px solid rgba(124,156,255,.25);border-radius:12px;padding:10px 12px;margin:8px 0;font-size:13px;line-height:1.6}.po-rule>b{font-size:13.5px}.po-rule small{display:block;color:var(--sub);font-size:12.5px;margin-bottom:4px}.po-rl{color:var(--c,#e9c46a);font-weight:700;margin-top:4px;cursor:pointer}" +
    ".po-pf3{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 2px}.po-pf3 span{font-size:12.5px;border-radius:999px;padding:3px 9px;border:1px solid var(--line)}.po-pf3 .on{background:rgba(77,212,122,.12);color:#4dd47a;border-color:transparent}.po-pf3 .wait{color:var(--sub)}.po-pf3 .trial{background:rgba(255,184,77,.14);color:#ffb84d;border-color:transparent}" +
    ".po-tg{font-size:13px;letter-spacing:-1px}" +
    ".po-won{font-size:14px;margin:2px 0 4px}.po-won b{font-size:16px}.po-won small{display:block;color:var(--sub);font-size:12.5px}" +
    ".po-cw{display:block;font-size:12.5px;font-weight:600;opacity:.85}" +
    ".po-ctg{display:flex;align-items:center;gap:6px;margin:10px 0 4px}.po-ctg button{font:inherit;font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--sub)}.po-ctg button.on{background:var(--text);color:var(--bg);border-color:transparent}.po-ctg small{margin-left:auto;font-size:12.5px;color:var(--sub)}" +
    ".po-mk{display:flex;gap:12px;font-size:12.5px;color:var(--sub);margin-top:2px}.po-mk i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}" +
        ".po-sum{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:12px 12px 6px;margin:4px 0 10px}" +
    ".po-win{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 2px 10px}.po-wl{font-size:12.5px;font-weight:800;color:var(--sub);margin-right:2px}" +
    ".po-win button{border:1px solid var(--line,#2a3142);background:transparent;color:var(--sub);border-radius:999px;padding:5px 10px;font-size:12.5px;cursor:pointer}.po-win button small{opacity:.7;font-size:12.5px}" +
    ".po-win button.on{background:var(--acc,#7c9cff);border-color:var(--acc,#7c9cff);color:#fff;font-weight:700}.po-wd input{border:1px solid var(--line,#2a3142);background:transparent;color:inherit;border-radius:8px;padding:4px 6px;font-size:12.5px;color-scheme:dark light}" +
    ".po-wn{flex-basis:100%;font-size:12.5px;color:var(--sub)}.po-wn b{color:#ffb84d}" +
    ".po-wdd summary{list-style:none;cursor:pointer;border:1px solid var(--line,#2a3142);color:var(--sub);border-radius:999px;padding:5px 10px;font-size:12.5px}.po-wdd summary::-webkit-details-marker{display:none}.po-wdd[open]{flex-basis:100%;display:flex;align-items:center;gap:8px}.po-wdd[open] summary{color:var(--text)}.po-wd input{font-family:inherit}" +
    /* 10/15 A11-3 문지르기 */
    ".po-scr{margin-top:12px;padding:12px 12px 10px;border-radius:14px;background:var(--panel2);border:1px solid var(--line)}.po-scrh{font-size:13px;font-weight:800}.po-scrh small{font-weight:400;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    "#poscrr{-webkit-appearance:none;appearance:none;width:100%;height:30px;background:transparent;margin:6px 0 0;cursor:pointer}" +
    "#poscrr::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(90deg,rgba(124,156,255,.25),rgba(124,156,255,.6))}#poscrr::-moz-range-track{height:6px;border-radius:3px;background:rgba(124,156,255,.4)}" +
    "#poscrr::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;margin-top:-10px;border-radius:50%;background:#fff;border:3px solid var(--acc,#7c9cff);box-shadow:0 2px 8px rgba(0,0,0,.35)}#poscrr::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid var(--acc,#7c9cff)}" +
    ".po-scrt{display:flex;justify-content:space-between;font-size:12.5px;color:var(--dim)}.po-scro{margin-top:6px}.po-scd{font-size:14px}.po-scd em{font-style:normal;font-weight:800;margin-left:4px}.po-scd em.w{color:#4dd47a}.po-scd em.l{color:#7cb0ff}" +
    ".po-scv{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:4px;font-size:13px;color:var(--sub)}.po-scv span{white-space:nowrap}.po-scv span.on{color:var(--text);font-weight:700}.po-scv b{font-variant-numeric:tabular-nums}" +
    /* 10/15 A11-4 내 선택 효과 */
    ".po-myfx{font-size:12.5px;color:var(--sub);padding:0 4px 8px 30px;margin-top:-4px}.po-myfx b{font-size:13.5px;margin:0 2px}.po-myfx b.w,.po-fx b.w,.po-fxr b.w{color:#4dd47a}.po-myfx b.l,.po-fx b.l,.po-fxr b.l{color:#7cb0ff}.po-myfx small{font-size:12.5px}" +
    ".po-fx{margin:8px 0 6px;padding:10px 12px;border-radius:12px;background:rgba(244,114,182,.08);border:1px solid rgba(244,114,182,.25)}.po-fxh{font-size:14px;font-weight:800;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px}.po-fxh b{font-size:18px}.po-fxh small{font-weight:400;font-size:12.5px;color:var(--sub)}" +
    ".po-fxd{font-size:12.5px;color:var(--sub);margin-top:3px}.po-fxb{margin-top:6px}.po-fxb summary{cursor:pointer;font-size:12.5px;color:var(--acc,#7c9cff);font-weight:700}" +
    ".po-fxr{display:grid;grid-template-columns:40px minmax(0,1fr) 64px;align-items:center;gap:8px;font-size:12.5px;padding:3px 0}.po-fxr span{color:var(--sub)}.po-fxr b{text-align:right;font-variant-numeric:tabular-nums}" +
    ".po-fxbar{position:relative;height:8px;background:var(--panel2);border-radius:4px}.po-fxbar::before{content:\"\";position:absolute;left:50%;top:-2px;bottom:-2px;width:1.5px;background:var(--sub);opacity:.6}.po-fxbar i{position:absolute;top:0;bottom:0;border-radius:4px}.po-fxbar i.g{left:50%;background:#4dd47a}.po-fxbar i.n{right:50%;background:#3987e5}" +
    /* 10/15 A11-5 등수 한 줄 띠 */
    ".po-rkb{background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:10px 12px}.po-rkbh{font-size:12.5px;font-weight:800;color:var(--sub)}.po-rkbh small{font-weight:400;font-size:12.5px;margin-left:4px}" +
    ".po-rkbr{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:5px;margin:7px 0 6px}.po-rkbr button{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:6px 2px;font:inherit;font-size:12.5px;min-width:0;overflow:hidden;cursor:pointer;white-space:nowrap}.po-rkbr button b{font-size:16px;color:var(--text);margin:0 1px}.po-rkbr button.on{border-color:#e9c46a;background:rgba(233,196,106,.12);color:var(--text);font-weight:800}" +
    ".po-rkbs{font-size:12.5px;color:var(--sub);margin-top:2px}.po-rkbs b{color:var(--text)}.po-rkbs .w{color:#4dd47a}.po-rkbs .l{color:#7cb0ff}.po-rkbo{margin-top:6px;font-size:12.5px;color:var(--sub);display:flex;align-items:center;gap:6px;flex-wrap:wrap}" +
    ".po-sh{font-size:13px;font-weight:800;color:var(--sub);display:flex;justify-content:space-between;margin:0 2px 4px}.po-sh small{font-weight:400;font-size:12.5px}" +
    ".po-shb{margin-left:6px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:2px 9px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".po-sr{display:grid;grid-template-columns:1fr auto 92px;align-items:center;gap:10px;width:100%;background:none;border:0;border-top:1px solid var(--line);color:var(--text);font:inherit;padding:11px 4px;text-align:left;cursor:pointer;border-radius:0}" +
    ".po-sr:first-of-type{border-top:0}.po-sr>span{font-size:15px;font-weight:700}.po-sr>b{font-size:18px;font-weight:900;letter-spacing:-.3px}.po-sr>em{font-style:normal;font-size:12.5px;font-weight:800;text-align:right}" +
    ".po-sr>em.w{color:#4dd47a}.po-sr>em.l{color:#7cb0ff}.po-sr.on{background:rgba(233,196,106,.1);border-radius:12px;border-top-color:transparent}.po-sr.on+.po-sr{border-top-color:transparent}" +
    ".po-sr.kick.on{background:rgba(255,107,107,.1)}.po-sr.conc.on{background:rgba(77,212,122,.1)}.po-sr.sp{cursor:default;color:var(--sub)}.po-sr.sp>span{font-weight:500;font-size:13.5px}.po-sr.sp>b{font-size:15px;font-weight:700}.po-sr.sp>em{color:var(--dim);font-weight:400}" +
    ".po-gap{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:6px 0 2px}.po-gap small{width:100%;font-size:12.5px;color:var(--sub)}.po-gap b{font-size:44px;font-weight:900;letter-spacing:-1.2px;line-height:1.05}.po-gap em{font-style:normal;font-size:15px;font-weight:800}" +
    ".po-gap.w b,.po-gap.w em{color:#4dd47a}.po-gap.l b,.po-gap.l em{color:#7cb0ff}.po-rl2{font-size:14px;color:var(--sub);margin-bottom:6px}.po-rl2 b{font-size:15px}" +
    ".po-rank{display:flex;align-items:center;justify-content:space-between;margin:12px 2px 4px;font-size:13px}.po-rn{font-size:24px;font-weight:900;color:var(--text)}.po-rn small{font-size:12.5px;color:var(--sub);font-weight:600;margin-left:2px}" +
    ".po-gapr{text-align:center;color:var(--dim);font-size:13px;line-height:1;padding:2px 0;letter-spacing:3px}" +
    ".po-all{display:block;width:100%;margin-top:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:9px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}" +
    ".po-rr:not(.me) .bar span{background:var(--dim)!important;opacity:.45}.po-rr:not(.me):not(.sel) .v{font-weight:600}" +
    ".po-sb{display:flex;height:22px;border-radius:8px;overflow:hidden;gap:2px;margin:4px 0 8px}.po-sb i{display:block;min-width:4px;cursor:pointer}" +
    ".po-sbl{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;margin-bottom:12px}.po-sbl span{cursor:pointer;white-space:nowrap}.po-sbl span.z{color:var(--dim)}.po-sbl i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:0}" +
    ".po-follow .po-q button,.po-follow .po-mode button{padding:6px 2px;font-size:12.5px;border-radius:999px}.po-follow .po-mode{margin-top:6px}" +
    ".po-rcp{margin-top:14px;background:var(--panel2);border-radius:14px;padding:12px 12px 10px;border:1px dashed var(--line)}" +
    ".po-rch{font-weight:900;font-size:15px;display:flex;justify-content:space-between;align-items:baseline;padding-bottom:8px;border-bottom:2px solid var(--line)}.po-rch small{font-weight:600;font-size:12.5px;color:var(--sub)}" +
    ".po-rcp .po-r{border-top:1px dashed var(--line)}.po-rcp .po-r:first-child{margin-top:0;border-top:0}.po-rcp .po-rh .am{font-variant-numeric:tabular-nums}.po-rcp .po-it .v b{font-size:15px}" +
    ".po-rcp .po-cp{display:block;margin-top:10px;padding-top:10px;border-top:2px solid var(--line)}.po-rcp #pocopy{display:block;width:100%;padding:12px;font-size:15px;font-weight:900;border-radius:12px;background:#e9c46a;color:#111;border:0}.po-rcp .po-cp span{display:block;text-align:center;margin-top:6px}" +
    ".po-r.flash{animation:flash 1.6s ease}" +
    ".po-tl{position:relative;padding-left:18px!important}.po-tl:before{content:'';position:absolute;left:21px;top:20px;bottom:20px;width:2px;background:var(--line)}" +
    ".po-tli{position:relative;display:block;padding:8px 0 8px 18px;border-bottom:0;cursor:pointer}.po-tli:before{content:'';position:absolute;left:-1px;top:13px;width:10px;height:10px;border-radius:50%;background:var(--panel2);border:2px solid var(--dim)}" +
    ".po-tli.now:before{background:#e9c46a;border-color:#e9c46a;box-shadow:0 0 0 4px rgba(233,196,106,.2)}.po-tli .d{display:block;font-size:13px;min-width:0}" +
    ".po-tli .t{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;color:var(--sub);font-size:13px;margin-top:1px}.po-tli.open .t{-webkit-line-clamp:unset;color:var(--text)}" +
    ".po-tli .d:after{content:' ▾';color:var(--dim);font-weight:400;font-size:12.5px}.po-tli.open .d:after{content:' ▴'}" +
    ".po-vcs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}.po-vc{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:7px 10px;font:inherit;font-size:12.5px;cursor:pointer;text-align:left}" +
    ".po-vc b{font-size:13px}.po-vc small{display:block;font-size:12.5px;color:var(--sub)}.po-vc.g{background:rgba(77,212,122,.12);border-color:rgba(77,212,122,.4)}.po-vc.g small{color:#4dd47a;font-weight:800}" +
    ".po-vc.b{background:rgba(57,135,229,.1);border-color:rgba(57,135,229,.35)}.po-vc.b small{color:#7cb0ff;font-weight:800}.po-vc.on{outline:2px solid var(--text)}" +
    ".po-vd{font-size:12.5px;color:var(--sub);line-height:1.6}.po-vd:not(:empty){background:var(--panel2);border-radius:10px;padding:8px 10px;margin:4px 0 6px}.po-vd b{color:var(--text)}" +
    ".po-stk{position:sticky;top:var(--hh,140px);z-index:6;margin:0 -16px 10px;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}" +
    ".po-stk .fold-jump{position:static!important;margin:0!important;background:none!important;backdrop-filter:none!important}" +
    ".po-mini{display:none;width:100%;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);font:inherit;font-size:11px;padding:6px 4px;gap:2px;justify-content:space-between;align-items:center;cursor:pointer;white-space:nowrap;overflow:hidden}" +
    ".po-stk.mini-on .po-mini{display:flex}.po-mini b{font-weight:900}.po-mini .sp{color:var(--sub)}.po-mini i{margin-left:0;flex:none;font-style:normal;color:var(--dim);font-size:12px}.po-mini span{flex:0 0 auto;letter-spacing:-.4px}@media(max-width:430px){.po-mini i{display:none}.po-mini span{letter-spacing:-.6px}}" +
    ".po-inf{padding:0!important;margin:0 0 10px}.po-inf>summary{list-style:none;cursor:pointer;padding:12px 14px;font-weight:800;font-size:14px;display:flex;justify-content:space-between;align-items:center}.po-inf>summary::-webkit-details-marker{display:none}" +
    ".po-inf>summary small{font-weight:400;color:var(--sub);font-size:12.5px}.po-inf>summary:after{content:'▾';color:var(--dim);margin-left:6px}.po-inf[open]>summary:after{content:'▴'}" +
    ".po-infb{padding:0 14px 12px;font-size:13.5px;line-height:1.65}.po-infb>div{padding:8px 10px;border-radius:10px;margin-top:6px;background:var(--panel2);border-left:3px solid #e9c46a}.po-infb>div.k{border-left-color:#ff6b6b}.po-infb>div.c{border-left-color:#4dd47a}.po-infb>div.m{border-left-color:#f472b6}.po-infb u{text-decoration:none;font-weight:800}" +
    ".po-sr.mine.on{background:rgba(244,114,182,.12)}.po-lbs.n4{grid-template-columns:repeat(2,minmax(0,1fr))}" +
    ".my-sv{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 8px}.my-sv::-webkit-scrollbar{display:none}.my-sv button{flex:none;font:inherit;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-sv button.on{background:#f472b6;border-color:#f472b6;color:#111}.my-sv button i{font-style:normal;font-size:12.5px;vertical-align:2px}.my-sv button.nw{border-style:dashed;color:var(--sub)}" +
    ".my-top{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;margin:0 0 8px}.my-top>b{font-size:16px}.my-top small.dt{color:#ffb84d;font-size:12.5px}.my-top small.ok{color:#4dd47a;font-size:12.5px}.my-acts{display:flex;gap:5px;margin-left:auto;flex-wrap:wrap}.my-acts button{font:inherit;font-size:12.5px;font-weight:700;padding:5px 10px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-acts button.pri{background:#f472b6;border-color:#f472b6;color:#111}" +
    ".my-sl{display:flex;flex-direction:column}.my-si{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--line)}.my-si .nm{flex:1;min-width:0}.my-si .nm b{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.my-si .nm small{display:block;font-size:12.5px;color:var(--sub)}.my-si .r{font-size:13.5px;min-width:50px;text-align:right}.my-wv{font-size:13px;font-weight:800;min-width:44px;text-align:right;color:#f472b6}" +
    ".my-x{height:28px;border-radius:8px;border:1px solid var(--line);background:none;color:var(--sub);font:inherit;font-size:12.5px;padding:0 9px;flex:none}.my-si.ed{flex-wrap:wrap}.my-ctl{display:flex;align-items:center;gap:8px;margin-left:auto}.my-si.ed .my-ctl{flex-basis:100%;justify-content:flex-end}" +
    ".my-sp{display:inline-grid;grid-template-columns:34px 58px 12px 34px;align-items:center;gap:4px}.my-sp.sm{grid-template-columns:28px 46px 10px 28px}.my-sp button{height:32px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:17px;font-weight:700;padding:0}.my-sp.sm button{height:28px;font-size:15px}.my-sp.sm .my-in{height:28px;font-size:13px}.my-sp b{font-size:12.5px;color:var(--sub)}" +
    ".my-seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}.my-seg button{font:inherit;font-size:12.5px;font-weight:700;padding:5px 14px;border:0;background:none;color:var(--sub)}.my-seg button.on{background:#f472b6;color:#111}" +
    ".my-edit{display:block;width:100%;margin:10px 0 2px;padding:11px;border-radius:12px;border:1px solid #f472b6;background:rgba(244,114,182,.1);color:var(--text);font:inherit;font-size:14px;font-weight:800}.my-edit.done{background:#f472b6;color:#111}" +
    ".my-add{position:relative}.my-add input[type=search]{width:100%;box-sizing:border-box;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);font:inherit;font-size:16px;padding:0 12px}" +
    ".my-res{display:flex;flex-direction:column;gap:2px;margin-top:4px}.my-res button{text-align:left;font:inherit;font-size:14px;padding:8px 10px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-res button small{color:var(--sub)}.my-res button[disabled]{opacity:.5}.my-hint{font-size:12.5px;color:var(--sub);padding:6px 2px}" +
    ".my-d0{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;margin-top:8px;font-size:13px;font-weight:700}.my-d0 input{font:inherit;font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text)}.my-d0 small{font-weight:400;color:var(--sub);font-size:12.5px}" +
    ".my-sb{display:flex;height:16px;border-radius:6px;overflow:hidden;gap:2px;margin:2px 0 6px}.my-sb i{display:block}.my-lg{font-size:12.5px;color:var(--sub);margin-bottom:6px}" +
    ".my-warn{font-size:12.5px;color:#ffb84d;background:rgba(255,184,77,.1);border-radius:8px;padding:6px 9px;margin:6px 0}" +
    ".my-h{font-weight:800;font-size:13.5px;margin:12px 0 6px;display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap}" +
    ".my-st{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:5px 0;border-top:1px dashed var(--line)}.my-st .n{font-size:14px;font-weight:700}.my-st .n i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px}" +
    ".my-in{width:100%;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);font:inherit;font-size:16px;font-weight:800;text-align:center;padding:0}" +
    ""+
    ".my-all{display:flex;gap:6px;align-items:center;margin-bottom:6px}.my-all button{font:inherit;font-size:12.5px;font-weight:700;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-all small{margin-left:auto;color:var(--sub);font-size:12.5px}" +
    ".my-k{position:relative;display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 6px;border-top:1px solid var(--line);cursor:pointer;border-radius:10px}.my-k input{position:absolute;opacity:0;pointer-events:none}" +
    ".my-k .ck{width:24px;height:24px;border-radius:7px;border:2px solid var(--dim);display:flex;align-items:center;justify-content:center;font-weight:900;color:#111}.my-k.on .ck{background:#f472b6;border-color:#f472b6}.my-k.on{background:rgba(244,114,182,.08)}" +
    ".my-k .nm b{font-size:14px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.my-k .nm small{display:block;font-size:12.5px;color:var(--sub)}.my-k .r{font-size:14px}" +
    ".po-dt{width:100%;border-collapse:collapse;font-size:13.5px}.po-dt th{font-size:12.5px;color:var(--sub);text-align:right;font-weight:600;padding:4px}.po-dt th:first-child,.po-dt td:first-child{text-align:left}.po-dt td{text-align:right;padding:6px 4px;border-top:1px solid var(--line)}.po-dt td em{display:block;font-size:12.5px}";
  document.head.appendChild(css);
})();
;
