/* CH Investing — 🧭 나침반: 5개 시장 등락·지수 흐름·국면·강한 섹터 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls;
  var ORDER = ["US", "KR", "JP", "CN", "HK"];
  var REG = {"상승장": {c:"up", i:"▲"}, "하락장": {c:"dn", i:"▼"}, "횡보장": {c:"fl", i:"◆"}};
  var CPSEL = null;

  function card(title, body, extra){ return '<section class="card">' + (title ? '<h3>' + title + (extra || "") + '</h3>' : '') + body + '</section>'; }
  function sec(t){ return '<div class="sec">' + t + '</div>'; }
  function num(n){ return (n || 0).toLocaleString("ko-KR"); }
  function pct(v){ return v == null ? "–" : sgn(v) + "%"; }
  function sChip(x){ // 종목 칩 → 누르면 종목리포트
    return '<a class="cp-st" href="javascript:openOP(\'' + e(x.s).replace(/'/g, "") + '\')"><b>' + e(x.n) + '</b><em class="tk">' + e(V.cd(x.s)) + '</em><span class="' + cls(x.r1) + '">' + pct(x.r1) + '</span></a>';
  }
  function regChip(lab, big){
    var r = REG[lab] || REG["횡보장"];
    return '<span class="cp-rg ' + r.c + (big ? " big" : "") + '">' + r.i + " " + e(lab) + '</span>';
  }
  function bbar(m, h){ // 상승 / 보합 / 하락 막대 (2px 간격)
    var t = Math.max(1, m.up + m.flat + m.down);
    return '<div class="cp-bb' + (h ? " tall" : "") + '" data-tip="' + e("<b>" + m.name + "</b> 상승 " + num(m.up) + " · 보합 " + num(m.flat) + " · 하락 " + num(m.down)) + '">' +
      '<i class="u" style="flex:' + m.up + '"></i><i class="f" style="flex:' + m.flat + '"></i><i class="d" style="flex:' + m.down + '"></i></div>';
  }

  function overview(C){
    return card("🌏 5개 시장 한눈에 <span class='mut'>오늘 오른 종목 vs 내린 종목</span>",
      '<div class="cp-ov">' + ORDER.filter(function(k){ return C.markets[k]; }).map(function(k){
        var m = C.markets[k], ix = m.index[0], r = m.up / Math.max(1, m.up + m.down) * 100;
        return '<button class="cp-row' + (k === CPSEL ? " on" : "") + '" data-m="' + k + '">' +
          '<div class="cp-h"><span class="cp-f">' + m.flag + '</span><b>' + e(m.name) + '</b>' + regChip(m.regime) +
          '<span class="cp-ix">' + (ix ? e(ix.name) + ' <b class="' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</b>' : '') + '</span></div>' +
          bbar(m) +
          '<div class="cp-n"><span class="up">▲ ' + num(m.up) + '</span><span class="mut">상승 비율 ' + r.toFixed(0) + '%</span><span class="dn">▼ ' + num(m.down) + '</span></div></button>';
      }).join("") + '</div>');
  }

  function fgGauge(fg){
    if (!fg) return "";
    var a = Math.PI * (1 - fg.score / 100), cx = 110, cy = 100, R = 82;
    var segs = [["#2f6fd0", 0, 20], ["#5b8fd8", 20, 40], ["#6b7385", 40, 60], ["#d98a7a", 60, 80], ["#e05555", 80, 100]];
    var arc = function(p0, p1, c){ var a0 = Math.PI * (1 - p0 / 100), a1 = Math.PI * (1 - p1 / 100);
      return '<path d="M' + (cx + R * Math.cos(a0)).toFixed(1) + ',' + (cy - R * Math.sin(a0)).toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + (cx + R * Math.cos(a1)).toFixed(1) + ',' + (cy - R * Math.sin(a1)).toFixed(1) + '" stroke="' + c + '" stroke-width="16" fill="none"/>'; };
    var s = '<svg viewBox="0 0 220 120" class="fgsv">' + segs.map(function(x){ return arc(x[1] + 0.8, x[2] - 0.8, x[0]); }).join("") +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + (R - 22) * Math.cos(a)).toFixed(1) + '" y2="' + (cy - (R - 22) * Math.sin(a)).toFixed(1) + '" stroke="#e8ecf4" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="#e8ecf4"/><text x="' + cx + '" y="' + (cy - 26) + '" text-anchor="middle" class="fgn">' + fg.score + '</text>' +
      '<text x="18" y="116" class="fgl">공포</text><text x="202" y="116" text-anchor="end" class="fgl">탐욕</text></svg>';
    return '<div class="fgw">' + s + '<div class="fgt">' + e(fg.label) + '</div><div class="fgp">' + fg.parts.map(function(p){
      return '<div><span>' + e(p[0]) + '</span><span class="xbar"><i style="width:' + p[1] + '%;background:' + (p[1] >= 60 ? V.UP : p[1] <= 40 ? V.DN : "#6b7385") + '"></i></span><b>' + e(p[2]) + '</b></div>'; }).join("") + '</div></div>';
  }
  function strength(C){
    var ks = ORDER.filter(function(k){ return C.markets[k]; });
    var rows = ks.map(function(k){ var m = C.markets[k], ix = m.index[0] || {};
      var sc = m.fg ? m.fg.score : (m.breadth10 || 50);
      return {k: k, m: m, sc: sc, c20: ix.chg20}; }).sort(function(a, b){ return b.sc - a.sc; });
    return card("🏁 지금 어느 시장이 제일 강할까 <span class='mut'>공포·탐욕 점수 순</span>", rows.map(function(r, i){
      return '<div class="xr"><span class="rk">' + (i + 1) + '</span><b>' + r.m.flag + " " + e(r.m.name) + '</b>' + regChip(r.m.regime) +
        '<span class="xbar" style="flex:1"><i style="width:' + r.sc + '%;background:' + (r.sc >= 60 ? V.UP : r.sc <= 40 ? V.DN : "#6b7385") + '"></i></span><b>' + r.sc + '</b><span class="mut">20일 ' + pct(r.c20) + '</span></div>'; }).join("") +
      '<p class="note">점수 = 오른 종목 비율·신고가 비율·지수 위치·20일 수익률(미국은 VIX까지) 평균. 높을수록 사람들이 사고 싶어 하는 시장.</p>');
  }
  function rotation(m){
    var ss = m.sectors.filter(function(x){ return x.r5 != null && x.r20 != null; });
    if (ss.length < 4) return "";
    var W = 330, H = 250, P = 26, mx = Math.max.apply(null, ss.map(function(x){ return Math.abs(x.r20); }).concat([1])) * 1.15, my = Math.max.apply(null, ss.map(function(x){ return Math.abs(x.r5); }).concat([1])) * 1.15;
    var X = function(v){ return P + (v + mx) / (2 * mx) * (W - 2 * P); }, Y = function(v){ return P + (my - v) / (2 * my) * (H - 2 * P); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="rotsv">' +
      '<rect x="' + X(0) + '" y="' + P + '" width="' + (W - P - X(0)) + '" height="' + (Y(0) - P) + '" fill="#e66767" opacity=".08"/>' +
      '<rect x="' + P + '" y="' + Y(0) + '" width="' + (X(0) - P) + '" height="' + (H - P - Y(0)) + '" fill="#3987e5" opacity=".08"/>' +
      '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="#3a4358"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + P + '" y2="' + (H - P) + '" stroke="#3a4358"/>' +
      '<text x="' + (W - P - 2) + '" y="' + (P + 12) + '" text-anchor="end" class="rotq u">🔥 계속 강함</text><text x="' + (P + 2) + '" y="' + (P + 12) + '" class="rotq">🌱 새로 뜨는 중</text>' +
      '<text x="' + (W - P - 2) + '" y="' + (H - P - 6) + '" text-anchor="end" class="rotq">🍂 힘 빠지는 중</text><text x="' + (P + 2) + '" y="' + (H - P - 6) + '" class="rotq d">🧊 계속 약함</text>' +
      '<text x="' + (W - P) + '" y="' + (H - 6) + '" text-anchor="end" class="rota">1개월 수익률 →</text><text x="6" y="' + (P - 8) + '" class="rota">↑ 1주 수익률</text>';
    ss.forEach(function(x, i){ var cx = X(x.r20), cy = Y(x.r5);
      s += '<g data-csec="' + e(x.k) + '" style="cursor:pointer" data-tip="' + e("<b>" + x.icon + " " + x.name + "</b><br>1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20) + " · 오늘 " + pct(x.r1)) + '"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="13" fill="transparent"/>' +
        '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="' + V.CAT[i % 6] + '" stroke="#121826" stroke-width="2"/>' +
        '<text x="' + (cx + 7).toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) + '" class="rotl">' + e(x.name) + '</text></g>'; });
    s += '</svg>';
    return card("🔄 섹터 로테이션 지도 <span class='mut'>돈이 어디로 움직이나</span>", s +
      '<p class="note">오른쪽 위 = 한 달 내내 강하고 이번 주도 강함 · 왼쪽 위 = 한 달은 약했는데 이번 주 살아남 (새로 뜨는 곳) · 오른쪽 아래 = 한 달 강했지만 이번 주 식음.</p>');
  }
  function highs(m){
    if (!m.high_list || !m.high_list.length) return "";
    return card("🏔️ 52주 신고가 <span class='mut'>" + num(m.highs) + "종목 · 큰 회사 순</span>", '<div class="cp-sts">' + m.high_list.map(sChip).join("") + '</div>' +
      (m.high_inds && m.high_inds.length ? '<div class="sub2">신고가가 많이 나온 업종 <span class="mut">누르면 종목</span></div>' + V.hbars(m.high_inds.map(function(x){ return {label: e(x[0]) + ' <span class="hgo">›</span>', v: x[1], text: x[1] + "개", color: "#e66767", attr: ' data-ind="' + e(x[0]) + '" data-im="high" style="cursor:pointer"'}; })) : ""));
  }

  function detail(k, C){
    var m = C.markets[k], ix = m.index[0], h = "";
    var hiTxt = '<span class="chip2 hot">52주 신고가 ' + num(m.highs) + '</span><span class="chip2 cool">52주 신저가 ' + num(m.lows) + '</span>' +
      (m.limit_up != null ? '<span class="chip2 c">' + (k === "KR" ? "상한가" : "상한가(+10%)") + ' ' + num(m.limit_up) + '</span>' : '');
    // 1) 국면 히어로
    h += '<section class="card cp-hero h-' + ((REG[m.regime] || REG["횡보장"]).c) + '">' +
      '<div class="row"><div><div class="mut">' + m.flag + " " + e(m.name) + " · " + e(m.date) + ' 마감</div>' +
      '<div class="cp-big">' + regChip(m.regime, true) + '</div></div>' +
      (ix ? '<div class="cp-ixb"><small>' + e(ix.name) + '</small><b>' + V.fmt(ix.last) + '</b><span class="' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</span></div>' : '') + '</div>' +
      (ix ? '<p class="note">📐 ' + e(ix.why) + '</p>' : '') +
      '<p class="cp-sum">' + e(m.summary) + '</p></section>';
    if (m.fg) h += card("😨😀 공포·탐욕 지수 <span class='mut'>" + e(m.name) + "</span>", fgGauge(m.fg));
    // 2) 등락 종목 수
    var t = Math.max(1, m.up + m.flat + m.down);
    h += card("오늘 오른 종목 · 내린 종목 <span class='mut'>" + num(m.total) + "종목</span>",
      '<div class="cp-3"><div><small>상승</small><b class="up">' + num(m.up) + '</b><em>' + (m.up / t * 100).toFixed(0) + '%</em></div>' +
      '<div><small>보합</small><b>' + num(m.flat) + '</b><em>' + (m.flat / t * 100).toFixed(0) + '%</em></div>' +
      '<div><small>하락</small><b class="dn">' + num(m.down) + '</b><em>' + (m.down / t * 100).toFixed(0) + '%</em></div></div>' +
      bbar(m, true) + '<div style="margin-top:10px">' + hiTxt + '</div>' +
      '<p class="note">종목 하나하나의 중간값 등락 <b class="' + cls(m.median1) + '">' + pct(m.median1) + '</b> — 지수가 대형주 위주라면 이 숫자가 "보통 종목"의 실제 체감이에요.</p>');
    // 3) 지수 흐름
    if (m.index.length){
      var ixTabs = m.index.length > 1 ? '<div class="seg2" id="cpix">' + m.index.map(function(x, i){ return '<button' + (i ? '' : ' class="on"') + ' data-i="' + i + '">' + e(x.name) + '</button>'; }).join("") + '</div>' : '';
      h += card("지수 흐름 <span class='mut'>최근 60거래일 · 점선 = 20일 평균</span>", ixTabs + '<div id="cpixb">' + ixBody(m.index[0]) + '</div>');
    }
    // 4) 등락 종목 수 흐름
    if (m.breadth_hist.length > 3){
      h += card("상승 − 하락 종목 수 흐름 <span class='mut'>최근 " + m.breadth_hist.length + "거래일</span>",
        V.cols(m.breadth_hist.map(function(b, i, a){ return {label: (i % 5 === 4 || i === a.length - 1) ? b[0] : "", v: b[1] - b[2],
          tip: "<b>" + b[0] + "</b><br>상승 " + num(b[1]) + " · 하락 " + num(b[2]) + "<br>차이 " + (b[1] - b[2] > 0 ? "+" : "") + num(b[1] - b[2])}; }), {h: 130}) +
        '<p class="note">막대가 위(빨강)면 오른 종목이 더 많은 날, 아래(파랑)면 내린 종목이 더 많은 날.' +
        (m.breadth10 != null ? ' 최근 10일 평균 상승 비율 <b>' + m.breadth10 + '%</b> — ' + (m.breadth10 >= 55 ? "시장 전체가 같이 오르는 중" : m.breadth10 <= 45 ? "시장 전체가 같이 약한 중" : "종목마다 엇갈리는 중") + '.' : '') + '</p>');
    }
    // 5) 섹터
    if (m.sectors.length){
      h += card("섹터 등락 <span class='mut'>시가총액 가중 · 섹터를 누르면 종목</span>",
        '<div class="seg2" id="cpsk"><button class="on" data-k="r1">오늘</button><button data-k="r5">1주</button><button data-k="r20">1개월</button></div><div id="cpsb">' + secBars(m, "r1") + '</div>');
    }
    h += rotation(m) + highs(m);
    // 6) 강한 업종
    if (m.strong.length){
      h += sec("🔥 오늘 강한 업종 TOP " + Math.min(5, m.strong.length) + " <span class='mut'>업종 이름을 누르면 전체 종목</span>") +
        m.strong.slice(0, 5).map(function(x, i){
          return '<section class="card cp-ind"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n" data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b></div>' +
            '<b class="' + cls(x.r1) + ' cp-r">' + pct(x.r1) + '</b></div>' +
            '<div class="cp-mini"><span class="up">▲' + x.up + '</span><span class="dn">▼' + x.down + '</span><span class="mut">' + x.n + '종목 · 1주 ' + pct(x.r5) + '</span></div>' +
            '<div class="cp-sts">' + x.lead.map(sChip).join("") + '</div></section>';
        }).join("");
    }
    // 7) 대표 종목
    h += card("⭐ 오늘 많이 오른 대형주", '<div class="cp-sts">' + m.leaders.map(sChip).join("") + '</div>' +
      (m.laggards.length ? '<div class="sub2">많이 내린 대형주</div><div class="cp-sts">' + m.laggards.map(sChip).join("") + '</div>' : '') +
      '<div class="sub2">시가총액 TOP 10</div><div class="cp-sts">' + m.top_cap.map(sChip).join("") + '</div>');
    if (m.weak && m.weak.length){
      h += card("🧊 약한 업종", m.weak.map(function(x){ return '<div class="cp-wk"><b data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b><span class="' + cls(x.r1) + '">' + pct(x.r1) + '</span><div class="cp-sts">' + x.lead.slice(-2).map(sChip).join("") + '</div></div>'; }).join(""));
    }
    if (window.CPX) try { h += window.CPX(m, k, C); } catch(err) { console.error(err); }
    if (window.CPX2) try { var cut = h.indexOf("</section>") + 10; h = h.slice(0, cut) + window.CPX2(m, k, C) + h.slice(cut); } catch(err) { console.error(err); }
    return h;
  }

  function ixBody(ix){
    var a = V.lines([{name: ix.name, color: V.CAT[0], vals: ix.close}, {name: "20일 평균", color: "#8a94a8", dash: 1, vals: ix.ma20}], ix.dates, {h: 170, nodots: 1});
    var t = '<div class="cp-chg">' + [["1일", ix.chg1], ["1주", ix.chg5], ["1개월", ix.chg20], ["올해", ix.chgYtd]].map(function(p){
      return '<div><small>' + p[0] + '</small><b class="' + cls(p[1]) + '">' + pct(p[1]) + '</b></div>'; }).join("") + '</div>';
    var pos = ix.hi52 > ix.lo52 ? (ix.last - ix.lo52) / (ix.hi52 - ix.lo52) * 100 : 50;
    var w = '<div class="cp-52"><span>52주 최저 ' + V.fmt(ix.lo52) + '</span><div class="cp-52t"><i style="left:' + pos.toFixed(1) + '%"></i></div><span>최고 ' + V.fmt(ix.hi52) + '</span></div>';
    return a + t + w + '<p class="note">' + regChip(ix.regime) + " " + e(ix.why) + '</p>';
  }

  function secBars(m, k){
    var rows = m.sectors.slice().sort(function(a, b){ return (b[k] || 0) - (a[k] || 0); });
    return V.dbars(rows.map(function(x){
      return {label: x.icon + " " + e(x.name) + ' <span class="hgo">›</span>', v: x[k] || 0, attr: ' data-csec="' + e(x.k) + '" style="cursor:pointer"',
        tip: "<b>" + x.name + "</b> 오늘 " + pct(x.r1) + " · 1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20) + "<br>▲" + x.up + " ▼" + x.down + "<br>대표: " + x.big.map(function(s){ return s.n + " " + pct(s.r1); }).join(", ")};
    }));
  }

  function wire(C){
    [].forEach.call(document.querySelectorAll(".cp-row"), function(b){ b.onclick = function(){
      CPSEL = b.dataset.m; store.cpm = CPSEL; save();
      [].forEach.call(document.querySelectorAll(".cp-row"), function(x){ x.classList.toggle("on", x === b); });
      [].forEach.call(document.querySelectorAll("#cpseg button"), function(x){ x.classList.toggle("on", x.dataset.m === CPSEL); });
      $("cpd").innerHTML = detail(CPSEL, C); wireD(C);
      $("cpseg").scrollIntoView({behavior: "smooth", block: "start"});
    }; });
    [].forEach.call(document.querySelectorAll("#cpseg button"), function(b){ b.onclick = function(){
      CPSEL = b.dataset.m; store.cpm = CPSEL; save();
      [].forEach.call(document.querySelectorAll("#cpseg button"), function(x){ x.classList.toggle("on", x === b); });
      [].forEach.call(document.querySelectorAll(".cp-row"), function(x){ x.classList.toggle("on", x.dataset.m === CPSEL); });
      $("cpd").innerHTML = detail(CPSEL, C); wireD(C);
    }; });
    wireD(C);
  }
  function wireD(C){
    var m = C.markets[CPSEL];
    [].forEach.call(document.querySelectorAll("#cpsk button"), function(b){ b.onclick = function(){
      [].forEach.call(document.querySelectorAll("#cpsk button"), function(x){ x.classList.toggle("on", x === b); });
      $("cpsb").innerHTML = secBars(m, b.dataset.k); }; });
    [].forEach.call(document.querySelectorAll("#cpix button"), function(b){ b.onclick = function(){
      [].forEach.call(document.querySelectorAll("#cpix button"), function(x){ x.classList.toggle("on", x === b); });
      $("cpixb").innerHTML = ixBody(m.index[+b.dataset.i]); }; });
  }

  var OLD = RENDER.sector;
  RENDER.sector = function(it, el){
    if (it.files.indexOf("compass.json") < 0){ OLD(it, el); return; }
    el.innerHTML = '<div id="cpbox"><div class="loading">나침반 불러오는 중…</div></div><div id="cpold"></div>';
    getJSON(file("sector", it.id, "compass.json")).then(function(C){
      var ks = ORDER.filter(function(k){ return C.markets[k]; });
      if (!ks.length){ $("cpbox").innerHTML = ""; return; }
      CPSEL = ks.indexOf(store.cpm) >= 0 ? store.cpm : (ks.indexOf("KR") >= 0 ? "KR" : ks[0]);
      $("cpbox").innerHTML = '<div id="cplive"></div>' + overview(C) + '<div id="cptop"></div>' + strength(C) +
        '<div class="seg2 cp-seg" id="cpseg">' + ks.map(function(k){ return '<button data-m="' + k + '"' + (k === CPSEL ? ' class="on"' : '') + '>' + C.markets[k].flag + " " + e(C.markets[k].name) + '</button>'; }).join("") + '</div>' +
        '<div id="cpd">' + detail(CPSEL, C) + '</div>';
      wire(C);
      if (window.CPLIVE) try { CPLIVE($("cplive"), C); } catch(err) { console.error(err); }
      if (window.CPTOP) try { $("cptop").innerHTML = CPTOP(C); } catch(err) { console.error(err); }
    }).catch(function(){ $("cpbox").innerHTML = '<div class="empty">나침반 자료를 못 불러왔어요.</div>'; });
    // 모닝 섹터 브리핑: 그날 것이 없으면(휴장·주말) 가장 최근 브리핑을 이어서 보여주기
    var rest = it.files.filter(function(f){ return f !== "compass.json"; });
    var hasBrief = rest.indexOf("briefing.txt") >= 0 || rest.indexOf("top.json") >= 0;
    var h = "";
    if (rest.length) h += sec(hasBrief ? "☀️ 모닝 섹터 브리핑" : "🗺️ 섹터 히트맵") + '<div id="cpoldb"></div>';
    var prev = null;
    if (!hasBrief) prev = (M.cats.sector || []).filter(function(x){ return x.id <= it.id && (x.files.indexOf("briefing.txt") >= 0 || x.files.indexOf("top.json") >= 0); })[0];
    if (prev) h += sec("☀️ 모닝 섹터 브리핑 <span class='mut'>" + prev.id.slice(5).replace("-", "/") + " · 가장 최근 (이날은 브리핑이 없었어요)</span>") + '<div id="cpoldp"></div>';
    $("cpold").innerHTML = h;
    var showPrev = function(){ if (prev && $("cpoldp")) OLD({id: prev.id, files: prev.files.filter(function(f){ return f !== "compass.json"; })}, $("cpoldp")); };
    if (rest.length){
      OLD({id: it.id, files: rest}, $("cpoldb"));
      if (prev){   // 화면 안 id 가 겹치지 않게: 첫 묶음이 다 그려지면 id 를 바꾸고 다음 묶음 그리기
        var n = 0, t = setInterval(function(){
          var b = $("cpoldb"); if (!b){ clearInterval(t); return; }
          if (!b.querySelector(".loading") || ++n > 40){ clearInterval(t);
            [].forEach.call(b.querySelectorAll("[id]"), function(x){ x.id = x.id + "_0"; }); showPrev(); }
        }, 150);
      }
    } else showPrev();
  };
})();
