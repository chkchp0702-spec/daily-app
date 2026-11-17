/* CH Investing — 🧭 나침반: 5개 시장 등락·지수 흐름·국면·강한 섹터 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls;
  var ORDER = ["US", "KR", "JP", "CN", "HK"];
  var REG = {"상승장": {c:"up", i:"▲"}, "하락장": {c:"dn", i:"▼"}, "횡보장": {c:"fl", i:"◆"}, "하락장 속 반등": {c:"up", i:"↗"}, "상승장 속 급락": {c:"dn", i:"↘"}};
  /* 10/16 사용자: 「너 어제부터 이거 자꾸 틀리더라」 — 코스피 +3.8%·오른 종목 89% 인데 「▼ 하락장」.
     선(20·60일) 판정은 며칠 늦게 따라와서, 오늘 크게 반대로 움직인 날은 그걸 앞에 내세움:
     하락장인데 오늘 +2% 이상(또는 +1.2% 이상 + 오른 종목 70%↑) → 「하락장 속 반등」 · 상승장인데 오늘 −2% 이하(또는 −1.2% + 내린 종목 70%↑) → 「상승장 속 급락」 */
  function rd(m){
    var ix = (m && m.index || [])[0], lab = m && m.regime; if (!ix || ix.chg1 == null) return lab;
    var t = (m.up || 0) + (m.down || 0), ur = t ? m.up / t : 0.5, c = ix.chg1;
    if (lab === "하락장" && (c >= 2 || (c >= 1.2 && ur >= 0.7))) return "하락장 속 반등";
    if (lab === "상승장" && (c <= -2 || (c <= -1.2 && ur <= 0.3))) return "상승장 속 급락";
    return lab;
  }
  function rdWhy(m){
    var ix = (m && m.index || [])[0], d = rd(m); if (!ix || d === m.regime) return ix ? ix.why : "";
    var m20 = (ix.ma20 || []).slice(-1)[0], gap = m20 ? (m20 / ix.last - 1) * 100 : null;
    if (d === "하락장 속 반등") return "오늘 " + sgn(ix.chg1) + "% 크게 반등 중이지만 아직 20일선(" + V.fmt(m20) + ") 아래 — " + (gap != null && gap > 0 ? gap.toFixed(1) + "% 더 올라 20일선을 넘어야 하락장이 풀려요" : "20일선을 넘어서 버티면 하락장이 풀려요") + ". 선 기준 판정: " + ix.why;
    return "오늘 " + sgn(ix.chg1) + "% 크게 빠졌지만 선(20·60일) 기준은 아직 상승장 — 이틀 이상 이어지면 판정이 바뀔 수 있어요. 선 기준 판정: " + ix.why;
  }
  window.regDisp = rd;
  var CPSEL = null;

  /* 🗓 11/17 사용자 「섹터 전체에 1개월·3개월·6개월 선택 탭 — 이 줄에 있는 애들 다」
     섹터 묶음(등락·로테이션 지도·시계·되감기·강한/약한 업종·대형주)이 기간 하나를 같이 씀. 어느 카드에서 눌러도 전부 같이 바뀜(store.secp 에 기억).
     가로축 = 고른 기간, 세로축 = 그보다 짧은 기간(1개월→1주 · 3개월→1개월 · 6개월→3개월). 3·6개월 값은 히트맵과 같은 x.heat. */
  var SP = {"1M": {xl: "1개월", yl: "1주", xn: "한 달", yn: "이번 주", tail: "지난 5일"},
            "3M": {xl: "3개월", yl: "1개월", xn: "석 달", yn: "최근 한 달", tail: "지난 5일"},
            "6M": {xl: "6개월", yl: "3개월", xn: "반년", yn: "최근 석 달", tail: "지난 5일"}};
  var PK = ["1M", "3M", "6M"], BARK = "r1", TD = true, SREG = {};
  var nn = function(v){ return v == null || v !== v ? null : v; };
  var SECP = window.SECP = {
    C: null, keys: PK,
    cur: function(){ var p = window.store && store.secp; return SP[p] ? p : "1M"; },
    lab: function(p){ return SP[p || SECP.cur()]; },
    xy: function(x, p){ p = p || SECP.cur(); var h = x.heat || {};
      return p === "3M" ? {x: nn(h["3M"]), y: nn(x.r20)} : p === "6M" ? {x: nn(h["6M"]), y: nn(h["3M"])} : {x: nn(x.r20), y: nn(x.r5)}; },
    val: function(x, p){ return SECP.xy(x, p).x; },
    path: function(x, p){ p = p || SECP.cur(); return p === "1M" ? x.path : (x.pathp || {})[p]; },   // [[날짜, 세로, 가로], …]
    rp: function(m){ var p = SECP.cur(); if (p === "1M") return p;                                   // 되감기에 쓸 기간 (자료가 아직 없으면 1개월)
      return (m.sectors || []).filter(function(x){ var q = (x.pathp || {})[p]; return q && q.length; }).length >= 4 ? p : "1M"; },
    today: function(){ return TD; },
    /* kind: "p" 기간만 · "b" 섹터 등락(오늘·1주 포함) · "t" 오늘 카드(오늘 포함) */
    tabs: function(kind){ var c = SECP.cur(), on = function(v){ return kind === "b" ? (BARK ? (v === "D" ? BARK === "r1" : v === "W" && BARK === "r5") : v === c) : kind === "t" ? (TD ? v === "D" : v === c) : v === c; };
      var bs = (kind === "b" ? [["D", "오늘"], ["W", "1주"]] : kind === "t" ? [["D", "오늘"]] : []).concat(PK.map(function(k){ return [k, SP[k].xl]; }));
      return '<div class="seg2 secp" data-kind="' + (kind || "p") + '">' + bs.map(function(b){ return '<button type="button" data-secp="' + b[0] + '"' + (on(b[0]) ? ' class="on"' : '') + '>' + b[1] + '</button>'; }).join("") + '</div>'; },
    reg: function(n, fn){ SREG[n] = fn; },
    body: function(n, k, html, tag, cls){ tag = tag || "div"; return '<' + tag + (cls ? ' class="' + cls + '"' : '') + ' data-secpb="' + n + '" data-mk="' + e(k) + '">' + html + '</' + tag + '>'; },
    refresh: function(){
      var C = SECP.C; if (!C) return;
      [].forEach.call(document.querySelectorAll("[data-secpb]"), function(el){ var m = C.markets[el.dataset.mk], fn = SREG[el.dataset.secpb]; if (!m || !fn) return;
        try { var h = fn(m, el.dataset.mk, el); if (h != null) el.innerHTML = h; } catch(err) { console.error(err); } });
      [].forEach.call(document.querySelectorAll(".seg2.secp"), function(w){ var t = document.createElement("div"); t.innerHTML = SECP.tabs(w.dataset.kind);
        var nb = t.firstChild.children; [].forEach.call(w.children, function(b, i){ if (nb[i]) b.classList.toggle("on", nb[i].classList.contains("on")); }); });
    }
  };
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-secp]"); if (!b) return;
    var v = b.dataset.secp;
    if (v === "D"){ BARK = "r1"; TD = true; }
    else if (v === "W"){ BARK = "r5"; }
    else if (SP[v]){ BARK = null; TD = false; try { store.secp = v; save(); } catch(x) {} }
    SECP.refresh();
  });

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
          '<div class="cp-h"><span class="cp-f">' + m.flag + '</span><b>' + e(m.name) + '</b>' + regChip(rd(m)) +
          '<span class="cp-ix">' + (ix ? e(ix.name) + ' <b class="' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</b>' : '') + '</span></div>' +
          bbar(m) +
          '<div class="cp-n"><span class="up">▲ ' + num(m.up) + '</span><span class="mut"><i class="cp-lb">오른 비율 </i>' + r.toFixed(0) + '%</span><span class="dn">▼ ' + num(m.down) + '</span></div></button>';
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
    return card("🏁 지금 어느 시장이 제일 강할까 <span class='mut'>체감 온도 순</span>", rows.map(function(r, i){
      return '<div class="xr"><span class="rk">' + (i + 1) + '</span><b>' + r.m.flag + " " + e(r.m.name) + '</b>' + regChip(rd(r.m)) +
        '<span class="xbar" style="flex:1"><i style="width:' + r.sc + '%;background:' + (r.sc >= 60 ? V.UP : r.sc <= 40 ? V.DN : "#6b7385") + '"></i></span><b>' + r.sc + '</b><span class="mut">20일 ' + pct(r.c20) + '</span></div>'; }).join("") +
      '<p class="note">점수 = 오른 종목 비율·신고가 비율·지수 위치·20일 수익률(미국은 VIX까지) 평균. 높을수록 사람들이 사고 싶어 하는 시장.</p>');
  }
  function rotSvgNow(m){
    var p = SECP.cur(), L = SP[p];
    var ss = m.sectors.map(function(x){ var q = SECP.xy(x, p); return {s: x, x: q.x, y: q.y}; }).filter(function(o){ return o.x != null && o.y != null; });
    if (ss.length < 4) return '<div class="empty">' + L.xl + ' 자료가 아직 모자라요 (상장·자료 기간이 짧은 시장).</div>';
    var TOP = V.topSet(ss.map(function(o){ return {k: o.s.k, r5: o.y, r20: o.x, r1: o.s.r1, n: o.s.n, name: o.s.name, p: o.s.p}; }), 10);
    var W = 330, H = 250, P = 26, mx = Math.max.apply(null, ss.map(function(o){ return Math.abs(o.x); }).concat([1])) * 1.15, my = Math.max.apply(null, ss.map(function(o){ return Math.abs(o.y); }).concat([1])) * 1.15;
    var X = function(v){ return P + (v + mx) / (2 * mx) * (W - 2 * P); }, Y = function(v){ return P + (my - v) / (2 * my) * (H - 2 * P); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="rotsv">' +
      '<rect x="' + X(0) + '" y="' + P + '" width="' + (W - P - X(0)) + '" height="' + (Y(0) - P) + '" fill="#e66767" opacity=".08"/>' +
      '<rect x="' + P + '" y="' + Y(0) + '" width="' + (X(0) - P) + '" height="' + (H - P - Y(0)) + '" fill="#3987e5" opacity=".08"/>' +
      '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="#3a4358"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + P + '" y2="' + (H - P) + '" stroke="#3a4358"/>' +
      '<text x="' + (W - P - 2) + '" y="' + (P + 12) + '" text-anchor="end" class="rotq u">🔥 계속 강함</text><text x="' + (P + 2) + '" y="' + (P + 12) + '" class="rotq">🌱 새로 뜨는 중</text>' +
      '<text x="' + (W - P - 2) + '" y="' + (H - P - 6) + '" text-anchor="end" class="rotq">🍂 힘 빠지는 중</text><text x="' + (P + 2) + '" y="' + (H - P - 6) + '" class="rotq d">🧊 계속 약함</text>' +
      '<text x="' + (W - P) + '" y="' + (H - 6) + '" text-anchor="end" class="rota">' + L.xl + ' 수익률 →</text><text x="6" y="' + (P - 8) + '" class="rota">↑ ' + L.yl + ' 수익률</text>';
    ss.forEach(function(o, i){ var x = o.s, cx = X(o.x), cy = Y(o.y), h = x.heat || {};
      s += '<g data-csec="' + e(x.k) + '" data-fam="' + V.famOf(x) + '"' + (TOP[x.k] ? ' data-top="1"' : '') + ' style="cursor:pointer" data-tip="' + e("<b>" + x.icon + " " + x.name + "</b><br>오늘 " + pct(x.r1) + " · 1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20) + (h["3M"] != null ? "<br>3개월 " + pct(h["3M"]) : "") + (h["6M"] != null ? " · 6개월 " + pct(h["6M"]) : "")) + '"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="13" fill="transparent"/>' +
        '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="' + V.secCol(x.k, i) + '" stroke="#121826" stroke-width="2"/>' +
        '<text x="' + (cx + 7).toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) + '" class="rotl" style="fill:' + V.secCol(x.k, i) + '">' + e(V.shortSec(x.name)) + '</text></g>'; });
    return s + '</svg>';
  }
  function rotNote(){ var L = SECP.lab();
    return '오른쪽 위 = ' + L.xn + ' 내내 강하고 ' + L.yn + '도 강함 · 왼쪽 위 = ' + L.xn + '은 약했는데 ' + L.yn + ' 살아남 (새로 뜨는 곳) · 오른쪽 아래 = ' + L.xn + ' 강했지만 ' + L.yn + ' 식음.' +
      ' <span class="mut">1개월 = 빠른 신호 · 3개월 = 비중 조절용 · 6개월 = 큰 흐름.</span>'; }
  SECP.reg("map", function(m){ return rotSvgNow(m); });
  SECP.reg("mapn", function(){ return rotNote(); });
  function rotation(m, k){
    if (m.sectors.filter(function(x){ return x.r5 != null && x.r20 != null; }).length < 4) return "";
    var s = '<div class="famw" data-ff="' + ((window.store && store.secf) || "") + '">' + SECP.body("map", k, rotSvgNow(m)) + V.famChips("map") + '</div>';
    return card("🔄 섹터 로테이션 지도 <span class='mut'>돈이 어디로 움직이나</span>", SECP.tabs("p") + s + SECP.body("mapn", k, rotNote(), "p", "note"));
  }
  function highs(m){
    if (!m.high_list || !m.high_list.length) return "";
    return card("🏔️ 52주 신고가 <span class='mut'>" + (m.live ? md(m.date) + " 마감 · " : "") + num(m.highs) + "종목 · 큰 회사 순</span>", '<div class="cp-sts">' + m.high_list.map(sChip).join("") + '</div>' +
      (m.high_inds && m.high_inds.length ? '<div class="sub2">신고가가 많이 나온 업종 <span class="mut">누르면 종목</span></div>' + V.hbars(m.high_inds.map(function(x){ return {label: e(x[0]) + ' <span class="hgo">›</span>', v: x[1], text: x[1] + "개", color: "#e66767", attr: ' data-ind="' + e(x[0]) + '" data-im="high" style="cursor:pointer"'}; })) : ""));
  }

  // 📅 10/15: 지수는 오늘 장중(5,693 −5.3%)인데 머리말은 「10/14 마감」 — 지수 날짜·장중 여부를 같이 적기
  function md(d){ return d ? (+d.slice(5, 7)) + "/" + (+d.slice(8, 10)) : ""; }
  /* 10/17 사용자 화면: 미국 장이 끝났는데(05:00 KST) 마지막 장중 값(04:59)이 「장중」으로 남음 → 장 끝난 시각이 지났으면 「마감」 */
  function liveDone(m){
    if (!m.live || !m.live.date) return false;
    var d = m.live.date, mo = +d.slice(5, 7), k = m.code || m.mk || "";
    var nm = String(m.name || "");
    var hhmm = /미국/.test(nm) ? null : /홍콩/.test(nm) ? "17:10" : /중국/.test(nm) ? "16:00" : "15:30";
    var close;
    if (hhmm == null){ var x = new Date(Date.parse(d + "T00:00:00Z") + 864e5); close = Date.parse(x.toISOString().slice(0, 10) + "T" + (mo > 3 && mo < 11 ? "05:00" : "06:00") + ":00+09:00"); }
    else close = Date.parse(d + "T" + hhmm + ":00+09:00");
    return Date.now() > close + 3 * 60e3;
  }
  window.cpLiveDone = liveDone;
  function hdDate(m, ix){
    if (m.live) return e(md(m.live.date)) + " " + (liveDone(m) ? "마감" : e(m.live.t || "") + " 장중");
    if (!ix || !ix.date || ix.date <= m.date) return e(m.date) + " 마감";
    return "지수 " + e(ix.date.slice(5).replace("-", "/")) + (ix.live ? " 장중" : " 마감") + " · 종목 " + e(m.date.slice(5).replace("-", "/")) + " 마감";
  }
  function detail(k, C){
    var m = C.markets[k], ix = m.index[0], h = "";
    BARK = "r1"; TD = true;                // 🗓 화면을 새로 그리면 섹터 등락·오늘 카드는 「오늘」부터 (기간 탭을 누르면 같이 바뀜)
    var PD = m.live ? md(m.date) : "";      // 🧭 10/15: 위 숫자는 오늘 장중(live), 아래 업종·종목 카드는 어제 마감 → 카드 제목에 날짜
    // 🧭 10/19 사용자 「진짜 쫌…」: 서버(ixlive)가 섹터·업종·대형주도 live 로 바꿨으면(m.live.cards) 그 카드들은 「HH:MM 장중」, 52주 신고가만 지난 마감
    var HPD = PD, LT = m.live && m.live.cards ? (liveDone(m) ? md(m.live.date) + " 마감" : (m.live.t || "") + " 장중") : "";
    if (LT) PD = "";
    var T = function(t){ return LT ? t.replace("오늘", "오늘 " + LT) : PD ? t.replace("오늘", PD + " 마감") : t; };
    var hiTxt = (HPD ? '<span class="mut" style="margin-right:6px">' + HPD + ' 마감</span>' : '') + '<span class="chip2 hot">52주 신고가 ' + num(m.highs) + '</span><span class="chip2 cool">52주 신저가 ' + num(m.lows) + '</span>' +
      (m.limit_up != null ? '<span class="chip2 c">' + (k === "KR" ? "상한가" : "상한가(+10%)") + ' ' + num(m.limit_up) + '</span>' : '');
    // 1) 국면 히어로
    h += '<section class="card cp-hero h-' + ((REG[rd(m)] || REG["횡보장"]).c) + '">' +
      '<div class="row"><div><div class="mut">' + m.flag + " " + e(m.name) + " · " + hdDate(m, ix) + '</div>' +
      '<div class="cp-big">' + regChip(rd(m), true) + '</div></div>' +
      (ix ? '<div class="cp-ixb"><small>' + e(ix.name) + '</small><b>' + V.fmt(ix.last) + '</b><span class="' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</span></div>' : '') + '</div>' +
      (ix ? '<p class="note">📐 ' + e(rdWhy(m)) + '</p>' : '') +
      '<p class="cp-sum">' + (m.live ? '<span class="mut">' + e(m.live.t || "") + ' 지금 · </span>' : ix && ix.date > m.date ? '<span class="mut">' + e(m.date.slice(5).replace("-", "/")) + ' 종목 · </span>' : '') + e(m.summary) + '</p></section>';
    h += watchCard(m, k);
    if (m.fg) h += card("🌡️ 오늘 시장 체감 온도 <span class='mut'>" + e(m.name) + " · 종목 등락으로</span>", fgGauge(m.fg) +
      '<p class="note">오늘 하루 종목들의 등락·신고가·지수 위치로 잰 「체감 온도」예요. CNN 방식의 <b>공포·탐욕</b>(심리 지표, 미국 심리 + 자기 시장)은 🎲 시장확률 탭에 5개 시장이 같이 있어요.</p>');
    // 2) 등락 종목 수
    var t = Math.max(1, m.up + m.flat + m.down);
    h += card("오늘 오른 종목 · 내린 종목 <span class='mut'>" + (m.live ? (liveDone(m) ? e(md(m.live.date)) + " 마감 · " : e(m.live.t || "") + " 장중 · ") + (m.live.note && /큰/.test(m.live.note) ? "큰 회사 " : "") : "") + num(m.total) + "종목</span>",
      '<div class="cp-3"><div><small>상승</small><b class="up">' + num(m.up) + '</b><em>' + (m.up / t * 100).toFixed(0) + '%</em></div>' +
      '<div><small>보합</small><b>' + num(m.flat) + '</b><em>' + (m.flat / t * 100).toFixed(0) + '%</em></div>' +
      '<div><small>하락</small><b class="dn">' + num(m.down) + '</b><em>' + (m.down / t * 100).toFixed(0) + '%</em></div></div>' +
      bbar(m, true) + '<div style="margin-top:10px">' + hiTxt + '</div>' +
      '<p class="note">종목 하나하나의 중간값 등락 <b class="' + cls(m.median1) + '">' + pct(m.median1) + '</b> — 지수가 대형주 위주라면 이 숫자가 "보통 종목"의 실제 체감이에요.</p>');
    // 3) 지수 흐름
    if (m.index.length && window.IXC){ h += IXC(m, k, regChip);
      // 🏁 포트 비교 지수 (세계·자산배분) — 같은 차트로. 나라 지수(S&P·코스피·닛케이·항셍·CSI300 등)는 각 나라 탭에
      if (window.IXB) h += IXB(C, regChip);      // 🏁 포트 비교 지수 14개 (어느 나라 탭이든 같은 목록)
    }
    else if (m.index.length){
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
      h += card("섹터 등락 <span class='mut'>" + (LT ? e(LT) + " · 1주·1개월은 지난 마감까지 · " : PD ? PD + " 마감 · " : "") + "시가총액 가중 · 섹터를 누르면 종목</span>",
        SECP.tabs("b") + SECP.body("bars", k, secBars(m, BARK || "p" + SECP.cur())));
    }
    h += rotation(m, k) + highs(m);
    // 6) 강한 업종
    var hasP = !!(m.ind_p && PK.some(function(p){ return m.ind_p[p]; }));      // 🗓 기간별 강한·약한 업종·대형주 (opdb/compass.py period_cards)
    if (m.strong.length){
      h += '<details class="card cpx-d"><summary>🔥 ' + T("오늘") + ' 강한 업종 TOP ' + Math.min(5, m.strong.length) + ' <span class="mut">' + e(m.strong[0].name) + ' ' + pct(m.strong[0].r1).replace(/<[^>]+>/g, "") + ' 외 · 누르면 종목까지</span></summary>' +
        (hasP ? SECP.tabs("t") : "") + SECP.body("strong", k, strongBody(m)) + '</details>';
    }
    // 7) 대표 종목
    h += card("⭐ " + T("오늘") + " 많이 오른 대형주", (hasP ? SECP.tabs("t") : "") + SECP.body("lead", k, leadBody(m)));
    if (m.weak && m.weak.length){
      h += card("🧊 " + (LT ? "오늘 " + e(LT) + " " : PD ? PD + " 마감 " : "") + "약한 업종", (hasP ? SECP.tabs("t") : "") + SECP.body("weak", k, weakBody(m)));
    }
    if (window.CPX) try { h += window.CPX(m, k, C); } catch(err) { console.error(err); }
    if (window.CPX2) try { var cut = h.indexOf("</section>") + 10; h = h.slice(0, cut) + window.CPX2(m, k, C) + h.slice(cut); } catch(err) { console.error(err); }
    return h;
  }

  // 🗓 기간(1·3·6개월)을 골랐고 그 자료가 있으면 기간 기준, 아니면 오늘 기준
  function pdat(m){ if (TD) return null; var p = SECP.cur(), d = m.ind_p && m.ind_p[p]; return d ? {p: p, d: d, l: (m.lead_p || {})[p]} : null; }
  function pChip(x){ return sChip({s: x.s, n: x.n, r1: x.r}); }
  function pHead(q, t){ return '<div class="sub2" style="margin-top:0">' + SP[q.p].xl + ' ' + t + ' <span class="mut">' + e(String(m_date || "").slice(5).replace("-", "/")) + ' 마감까지 · 시가총액 가중</span></div>'; }
  var m_date = "";
  function strongBody(m){
    var q = pdat(m); m_date = m.date;
    if (q && q.d.strong && q.d.strong.length) return pHead(q, "강한 업종 TOP " + q.d.strong.length) + q.d.strong.map(function(x, i){
      return '<section class="card cp-ind"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n" data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b></div>' +
        '<b class="' + cls(x.r) + ' cp-r">' + pct(x.r) + '</b></div>' +
        '<div class="cp-mini"><span class="up">▲' + x.up + '</span><span class="dn">▼' + x.down + '</span><span class="mut">' + x.n + '종목 · ' + SP[q.p].xl + ' 동안</span></div>' +
        '<div class="cp-sts">' + (x.lead || []).map(pChip).join("") + '</div></section>'; }).join("");
    return m.strong.slice(0, 5).map(function(x, i){
      return '<section class="card cp-ind"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n" data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b></div>' +
        '<b class="' + cls(x.r1) + ' cp-r">' + pct(x.r1) + '</b></div>' +
        '<div class="cp-mini"><span class="up">▲' + x.up + '</span><span class="dn">▼' + x.down + '</span><span class="mut">' + x.n + '종목 · 1주 ' + pct(x.r5) + '</span></div>' +
        '<div class="cp-sts">' + x.lead.map(sChip).join("") + '</div></section>';
    }).join("");
  }
  function leadBody(m){
    var q = pdat(m); m_date = m.date;
    if (q && q.l && q.l.up && q.l.up.length) return pHead(q, "많이 오른 대형주") + '<div class="cp-sts">' + q.l.up.map(pChip).join("") + '</div>' +
      (q.l.dn && q.l.dn.length ? '<div class="sub2">' + SP[q.p].xl + ' 많이 내린 대형주</div><div class="cp-sts">' + q.l.dn.map(pChip).join("") + '</div>' : '');
    return '<div class="cp-sts">' + m.leaders.map(sChip).join("") + '</div>' +
      (m.laggards.length ? '<div class="sub2">많이 내린 대형주</div><div class="cp-sts">' + m.laggards.map(sChip).join("") + '</div>' : '') +
      '<div class="sub2">시가총액 TOP 10</div><div class="cp-sts">' + m.top_cap.map(sChip).join("") + '</div>';
  }
  function weakBody(m){
    var q = pdat(m); m_date = m.date;
    if (q && q.d.weak && q.d.weak.length) return pHead(q, "약한 업종") + q.d.weak.map(function(x){ return '<div class="cp-wk"><b data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b><span class="' + cls(x.r) + '">' + pct(x.r) + '</span><div class="cp-sts">' + (x.lag || []).map(pChip).join("") + '</div></div>'; }).join("");
    return m.weak.map(function(x){ return '<div class="cp-wk"><b data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b><span class="' + cls(x.r1) + '">' + pct(x.r1) + '</span><div class="cp-sts">' + x.lead.slice(-2).map(sChip).join("") + '</div></div>'; }).join("");
  }
  SECP.reg("strong", strongBody); SECP.reg("lead", leadBody); SECP.reg("weak", weakBody);
  SECP.reg("bars", function(m){ return secBars(m, BARK || "p" + SECP.cur()); });

  // 🎯 오늘 이 업종·종목을 보자 — 고른 나라의 오늘(1일)·1주 힘·오른 종목 비율로 업종 3개 + 대장주
  function watchCard(m, k){
    var L = (m.strong || []).filter(function(x){ return (x.n || 0) >= 4 && x.r1 != null; });
    if (!L.length) return "";
    L = L.map(function(x){ var br = x.n ? x.up / x.n : .5; return {x: x, sc: x.r1 + (x.r5 || 0) * .5 + (br - .5) * 4}; })
         .sort(function(a, b){ return b.sc - a.sc; }).slice(0, 3);
    return '<section class="card cp-watch"><h3>🎯 오늘 이 업종·종목을 보자 <span class="mut">' + m.flag + ' ' + e(m.name) + ' · ' + (m.live && m.live.cards ? e(liveDone(m) ? md(m.live.date) + " 마감" : (m.live.t || "") + " 장중") + ' 기준' : e(String(m.date || "").slice(5).replace("-", "/")) + (m.live ? ' 마감 기준' : '')) + '</span></h3>' +
      L.map(function(o, i){ var x = o.x;
        return '<div class="cw-row"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n" data-ind="' + e(x.name) + '">' + e(x.name) + ' <span class="hgo">›</span></b></div>' +
          '<span><b class="' + cls(x.r1) + '">' + pct(x.r1) + '</b> <small class="mut">1주 ' + pct(x.r5) + '</small></span></div>' +
          '<div class="cp-mini"><span class="up">▲' + x.up + '</span><span class="dn">▼' + x.down + '</span><span class="mut">' + x.n + '종목 중 ' + Math.round(x.up / Math.max(1, x.n) * 100) + '% 상승</span></div>' +
          '<div class="cp-sts">' + (x.lead || []).slice(0, 4).map(sChip).join("") + '</div></div>'; }).join("") +
      '<p class="note">오늘 등락 + 1주 흐름 + 업종 안에서 오른 종목 비율로 고른 3곳이에요. 종목을 누르면 종목리포트, 업종을 누르면 전체 종목.</p></section>';
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
    var pk = k.charAt(0) === "p" ? k.slice(1) : null, g = function(x){ return pk ? SECP.val(x, pk) : x[k]; };
    var rows = m.sectors.filter(function(x){ return !pk || g(x) != null; }).sort(function(a, b){ return (g(b) || 0) - (g(a) || 0); });
    if (!rows.length) return '<div class="empty">' + SP[pk].xl + ' 자료가 아직 없어요.</div>';
    return V.dbars(rows.map(function(x){ var h = x.heat || {};
      return {label: x.icon + " " + e(x.name) + ' <span class="hgo">›</span>', v: g(x) || 0, attr: ' data-csec="' + e(x.k) + '" style="cursor:pointer"',
        tip: "<b>" + x.name + "</b> 오늘 " + pct(x.r1) + " · 1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20) + (h["3M"] != null ? " · 3개월 " + pct(h["3M"]) : "") + (h["6M"] != null ? " · 6개월 " + pct(h["6M"]) : "") + "<br>▲" + x.up + " ▼" + x.down + "<br>대표: " + x.big.map(function(s){ return s.n + " " + pct(s.r1); }).join(", ")};
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
      SECP.C = C;
      CPSEL = ks.indexOf(store.cpm) >= 0 ? store.cpm : (ks.indexOf("KR") >= 0 ? "KR" : ks[0]);
      $("cpbox").innerHTML = '<div id="cpreg"></div><div id="cplive"></div>' + overview(C) + '<div id="cptop"></div>' + strength(C) +
        '<div class="seg2 cp-seg" id="cpseg">' + ks.map(function(k){ return '<button data-m="' + k + '"' + (k === CPSEL ? ' class="on"' : '') + '>' + C.markets[k].flag + " " + e(C.markets[k].name) + '</button>'; }).join("") + '</div>' +
        '<div id="cpd">' + detail(CPSEL, C) + '</div>';
      wire(C);
      if (window.CPLIVE) try { CPLIVE($("cplive"), C); } catch(err) { console.error(err); }
      if (window.CPREG) try { CPREG($("cpreg")); } catch(err) { console.error(err); }
      if (window.CPTOP) try { $("cptop").innerHTML = CPTOP(C); } catch(err) { console.error(err); }
    }).catch(function(){ $("cpbox").innerHTML = '<div class="empty">나침반 자료를 못 불러왔어요.</div>'; });
    // 모닝 섹터 브리핑: 그날 것이 없으면(휴장·주말) 가장 최근 브리핑을 이어서 보여주기
    var rest = it.files.filter(function(f){ return f !== "compass.json"; });
    var hasBrief = rest.indexOf("briefing.txt") >= 0 || rest.indexOf("top.json") >= 0;
    var h = "";
    if (rest.length) h += sec(hasBrief ? "☀️ 모닝 섹터 브리핑" : "🗺️ 섹터 히트맵") + '<div id="cpoldb"></div>';
    var prev = null;
    if (!hasBrief) prev = (M.cats.sector || []).filter(function(x){ return x.id <= it.id && (x.files.indexOf("briefing.txt") >= 0 || x.files.indexOf("top.json") >= 0); })[0];
    if (prev) h += '<details class="card cpx-d"><summary>☀️ 모닝 섹터 브리핑 <span class="mut">' + prev.id.slice(5).replace("-", "/") + ' · 가장 최근 (이날은 브리핑이 없었어요)</span></summary><div id="cpoldp"></div></details>';
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
