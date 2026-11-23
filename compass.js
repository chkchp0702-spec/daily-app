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
  /* 📏 11/17 사용자 「둘 다 진행해」 ① 지수(코스피 등) 대비 초과수익률 축 — 장 전체가 빠져도 상대적으로 돈이 들어오는 곳이 갈림.
     지수 1년 일봉(index[0].ohlc)에서 섹터 자료와 같은 날짜로 끝나는 같은 길이 수익률을 빼 줌. 「지수 대비」 버튼으로 끄고 켬(store.secx, 기본 켬).
     ② 혼자 멀리 튄 섹터(예: 부동산·리츠 +43%)는 가장자리에 붙이고 ↗ 표시 → 나머지 섹터가 가운데 뭉치지 않게 (SECP.lim) */
  var NX = {"1M": [20, 5], "3M": [63, 20], "6M": [126, 63]}, IXM = {};
  function ixMap(m){ var ix = (m && m.index || [])[0]; if (!ix || !ix.ohlc || ix.ohlc.length < 30) return null;
    var o = ix.ohlc, key = o.length + o[o.length - 1][0] + o[o.length - 1][4], c = IXM[ix.sym || ix.name];
    if (c && c.k === key) return c;
    var by = {}; o.forEach(function(r, i){ by[r[0]] = i; by[r[0].slice(5).replace("-", "/")] = i; });
    return (IXM[ix.sym || ix.name] = {k: key, o: o, by: by, name: ix.name}); }
  function ixRet(m, d, n){ var M = ixMap(m); if (!M) return null; var j = M.by[d]; if (j == null || j - n < 0) return null; return (M.o[j][4] / M.o[j - n][4] - 1) * 100; }
  var SECP = window.SECP = {
    C: null, keys: PK,
    cur: function(){ var p = window.store && store.secp; return SP[p] ? p : "1M"; },
    lab: function(p){ return SP[p || SECP.cur()]; },
    /* m 을 주면 지수 대비(켜져 있을 때) — 지도·시계·되감기만. 막대(등락)는 절대 수익률 그대로 */
    xy: function(x, p, m){ p = p || SECP.cur(); var h = x.heat || {};
      var o = p === "3M" ? {x: nn(h["3M"]), y: nn(x.r20)} : p === "6M" ? {x: nn(h["6M"]), y: nn(h["3M"])} : {x: nn(x.r20), y: nn(x.r5)};
      if (m && SECP.xs(m) && o.x != null && o.y != null){ var bx = ixRet(m, m.date, NX[p][0]), by = ixRet(m, m.date, NX[p][1]);
        if (bx != null && by != null) o = {x: o.x - bx, y: o.y - by}; }
      return o; },
    val: function(x, p){ return SECP.xy(x, p).x; },
    path: function(x, p, m){ p = p || SECP.cur(); var q = p === "1M" ? x.path : (x.pathp || {})[p];   // [[날짜, 세로, 가로], …]
      if (!q || !m || !SECP.xs(m)) return q;
      var out = q.map(function(r){ var by = ixRet(m, r[0], NX[p][1]), bx = ixRet(m, r[0], NX[p][0]); return by == null || bx == null ? null : [r[0], +(r[1] - by).toFixed(2), +(r[2] - bx).toFixed(2)]; });
      return out.every(function(r){ return r; }) ? out : q; },
    xs: function(m){ return !(window.store && store.secx === false) && !!ixMap(m) && ixRet(m, m.date, 5) != null; },
    ixn: function(m){ var M = ixMap(m); return M ? M.name : "지수"; },
    /* 축 반쪽 길이: 혼자 튄 값은 빼고 정함. 반환값 L, 점은 ±L×0.94 안으로 붙이고 넘친 쪽을 화살표로 */
    lim: function(vals){ var a = vals.filter(function(v){ return v != null && isFinite(v); }).map(Math.abs).sort(function(p, q){ return p - q; });
      if (!a.length) return 1.15; var mx = a[a.length - 1], q = a[Math.floor((a.length - 1) * 0.85)], L = Math.max(q * 1.6, 1);
      return mx <= L * 1.3 ? Math.max(mx, 1) * 1.15 : L * 1.15; },
    clip: function(v, L){ var c = L * 0.94; return v > c ? [c, 1] : v < -c ? [-c, -1] : [v, 0]; },
    /* 가장자리에 붙인 점: 바깥쪽을 가리키는 작은 삼각형 (이름은 그림 아래 한 줄로 — 글씨 겹침 방지) */
    tri: function(cx, cy, dx, dy, col){ var a = Math.atan2(-dy, dx), f = function(r, t){ return (cx + r * Math.cos(t)).toFixed(1) + "," + (cy + r * Math.sin(t)).toFixed(1); };
      return '<polygon points="' + f(11, a) + " " + f(6, a + 2.3) + " " + f(6, a - 2.3) + '" fill="' + col + '" opacity=".9"/>'; },
    out: function(L){ return L.length ? '<div class="secp-out">↗ 너무 멀어 가장자리에 붙인 섹터 · ' + L.map(function(o){ return '<span><i style="background:' + o.c + '"></i>' + e(o.n) + ' <b class="' + (o.v >= 0 ? "up" : "dn") + '">' + sgn(o.v, 1) + '%</b></span>'; }).join(" ") + '</div>' : ""; },
    arr: function(dx, dy){ return ({"1,0": "→", "-1,0": "←", "0,1": "↑", "0,-1": "↓", "1,1": "↗", "-1,1": "↖", "1,-1": "↘", "-1,-1": "↙"})[dx + "," + dy] || ""; },
    rp: function(m){ var p = SECP.cur(); if (p === "1M") return p;                                   // 되감기에 쓸 기간 (자료가 아직 없으면 1개월)
      return (m.sectors || []).filter(function(x){ var q = (x.pathp || {})[p]; return q && q.length; }).length >= 4 ? p : "1M"; },
    today: function(){ return TD; },
    /* kind: "p" 기간만 · "b" 섹터 등락(오늘·1주 포함) · "t" 오늘 카드(오늘 포함) */
    tabs: function(kind){ var c = SECP.cur(), on = function(v){ return kind === "b" ? (BARK ? (v === "D" ? BARK === "r1" : v === "W" && BARK === "r5") : v === c) : kind === "t" ? (TD ? v === "D" : v === c) : v === c; };
      var bs = (kind === "b" ? [["D", "오늘"], ["W", "1주"]] : kind === "t" ? [["D", "오늘"]] : []).concat(PK.map(function(k){ return [k, SP[k].xl]; }));
      var xb = (kind || "p") === "p" ? '<button type="button" data-secx="1" class="secx' + (window.store && store.secx === false ? '' : ' on') + '">📏 지수 대비</button>' : '';
      return '<div class="seg2 secp" data-kind="' + (kind || "p") + '">' + bs.map(function(b){ return '<button type="button" data-secp="' + b[0] + '"' + (on(b[0]) ? ' class="on"' : '') + '>' + b[1] + '</button>'; }).join("") + xb + '</div>'; },
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
    var x = ev.target.closest && ev.target.closest("[data-secx]"); if (!x) return;
    try { store.secx = store.secx === false ? true : false; save(); } catch(err) {}
    SECP.refresh();
  });
  var cs = document.createElement("style");
  cs.textContent = ".seg2.secp .secx{margin-left:auto}.seg2.secp .secx:not(.on){opacity:.65}.rotsv .clp{stroke-dasharray:2 2}.rot-hd{font-size:12.5px;color:var(--sub);margin:0 2px 6px;line-height:1.5}.secp-out{font-size:12.5px;color:var(--sub);margin:4px 2px 2px;line-height:1.7}.secp-out span{white-space:nowrap;margin-right:8px}.secp-out i{display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 4px 1px 4px;vertical-align:middle}";
  document.head.appendChild(cs);
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
    var XS = SECP.xs(m), IXN = SECP.ixn(m);
    var ss = m.sectors.map(function(x){ var q = SECP.xy(x, p, m); return {s: x, x: q.x, y: q.y}; }).filter(function(o){ return o.x != null && o.y != null; });
    if (ss.length < 4) return '<div class="empty">' + L.xl + ' 자료가 아직 모자라요 (상장·자료 기간이 짧은 시장).</div>';
    var TOP = V.topSet(ss.map(function(o){ return {k: o.s.k, r5: o.y, r20: o.x, r1: o.s.r1, n: o.s.n, name: o.s.name, p: o.s.p}; }), 10);
    var W = 330, H = 250, P = 26, mx = SECP.lim(ss.map(function(o){ return o.x; })), my = SECP.lim(ss.map(function(o){ return o.y; }));
    var X = function(v){ return P + (v + mx) / (2 * mx) * (W - 2 * P); }, Y = function(v){ return P + (my - v) / (2 * my) * (H - 2 * P); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="rotsv">' +
      '<rect x="' + X(0) + '" y="' + P + '" width="' + (W - P - X(0)) + '" height="' + (Y(0) - P) + '" fill="#e66767" opacity=".08"/>' +
      '<rect x="' + P + '" y="' + Y(0) + '" width="' + (X(0) - P) + '" height="' + (H - P - Y(0)) + '" fill="#3987e5" opacity=".08"/>' +
      '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="#3a4358"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + P + '" y2="' + (H - P) + '" stroke="#3a4358"/>' +
      '<text x="' + (W - P - 2) + '" y="' + (P + 12) + '" text-anchor="end" class="rotq u">🔥 계속 강함</text><text x="' + (P + 2) + '" y="' + (P + 12) + '" class="rotq">🌱 새로 뜨는 중</text>' +
      '<text x="' + (W - P - 2) + '" y="' + (H - P - 6) + '" text-anchor="end" class="rotq">🍂 힘 빠지는 중</text><text x="' + (P + 2) + '" y="' + (H - P - 6) + '" class="rotq d">🧊 계속 약함</text>' +
      '<text x="' + (W - P) + '" y="' + (H - 6) + '" text-anchor="end" class="rota">' + L.xl + (XS ? ' ' + e(IXN) + ' 대비' : ' 수익률') + ' →</text><text x="6" y="' + (P - 8) + '" class="rota">↑ ' + L.yl + (XS ? ' ' + e(IXN) + ' 대비' : ' 수익률') + '</text>';
    var OUT = [];
    ss.forEach(function(o, i){ var x = o.s, h = x.heat || {}, kx = SECP.clip(o.x, mx), ky = SECP.clip(o.y, my), cx = X(kx[0]), cy = Y(ky[0]), ar = SECP.arr(kx[1], ky[1]);
      if (ar) OUT.push({n: x.name, c: V.secCol(x.k, i), v: kx[1] ? o.x : o.y});
      s += '<g data-csec="' + e(x.k) + '" data-fam="' + V.famOf(x) + '"' + (TOP[x.k] ? ' data-top="1"' : '') + ' style="cursor:pointer" data-tip="' + e("<b>" + x.icon + " " + x.name + "</b><br>오늘 " + pct(x.r1) + " · 1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20) + (h["3M"] != null ? "<br>3개월 " + pct(h["3M"]) : "") + (h["6M"] != null ? " · 6개월 " + pct(h["6M"]) : "") +
          (XS ? "<br>" + IXN + " 대비 " + L.yl + " " + pct(o.y) + " · " + L.xl + " " + pct(o.x) : "") + (ar ? "<br>너무 멀어 가장자리에 붙임" : "")) + '"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="13" fill="transparent"/>' +
        '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="' + V.secCol(x.k, i) + '" stroke="' + (ar ? "#e8ecf4" : "#121826") + '" stroke-width="2"' + (ar ? ' class="clp"' : '') + '/>' +
        (ar ? SECP.tri(cx, cy, kx[1], ky[1], V.secCol(x.k, i)) : '<text x="' + (cx + 7).toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) + '" class="rotl" style="fill:' + V.secCol(x.k, i) + '">' + e(V.shortSec(x.name)) + '</text>') + '</g>'; });
    return s + '</svg>' + SECP.out(OUT);
  }
  function rotNote(m){ var L = SECP.lab(), XS = m && SECP.xs(m);
    return (XS ? '<b>가운데 선 = ' + e(SECP.ixn(m)) + '.</b> 오른쪽 = 지수보다 강함, 왼쪽 = 지수보다 약함 (장 전체가 빠져도 상대적으로 강한 곳이 보임). ' : '') +
      '오른쪽 위 = ' + L.xn + ' 내내 강하고 ' + L.yn + '도 강함 · 왼쪽 위 = ' + L.xn + '은 약했는데 ' + L.yn + ' 살아남 (새로 뜨는 곳) · 오른쪽 아래 = ' + L.xn + ' 강했지만 ' + L.yn + ' 식음.' +
      ' <span class="mut">1개월 = 빠른 신호 · 3개월 = 비중 조절용 · 6개월 = 큰 흐름. 삼각형(▶)이 붙은 섹터는 너무 멀리 있어 가장자리에 붙인 것 — 실제 값은 그림 아래 줄.</span>'; }
  SECP.reg("map", function(m){ return rotSvgNow(m); });
  SECP.reg("mapn", function(m){ return rotNote(m); });
  function rotation(m, k){
    if (m.sectors.filter(function(x){ return x.r5 != null && x.r20 != null; }).length < 4) return "";
    var s = '<div class="famw" data-ff="' + ((window.store && store.secf) || "") + '">' + SECP.body("map", k, rotSvgNow(m)) + V.famChips("map") + '</div>';
    return card("🔄 섹터 로테이션 지도 <span class='mut'>돈이 어디로 움직이나</span>", SECP.tabs("p") + s + SECP.body("mapn", k, rotNote(m), "p", "note"));
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
    // 🩹 11/23 사용자 「섹터 보기에서 자꾸 화면이 아무것도 안 나와」: compass.json(860KB)은 장중 10분마다 새로 올라가
    // 그 사이(배포 중 404·끊김·덜 받은 글)엔 「못 불러왔어요」 한 줄만 남던 것 → 2.5초 뒤 한 번 더 · 그래도 안 되면 바로 전 날짜 나침반을 보여 주고 「🔄 다시 받기」
    var cpGet = function(id){ return getJSON(file("sector", id, "compass.json")); };
    var cpPrev = (M.cats.sector || []).filter(function(x){ return x.id < it.id && x.files.indexOf("compass.json") >= 0; })[0];
    var cpNote = "";
    cpGet(it.id).catch(function(){ return new Promise(function(r){ setTimeout(r, 2500); }).then(function(){ return cpGet(it.id); }); })
      .catch(function(err){ if (!cpPrev) throw err; cpNote = cpPrev.id.slice(5, 10).replace("-", "/"); return cpGet(cpPrev.id); })
      .then(function(C){
      if (!$("cpbox")) return;   // 🛡 11/19 받는 사이 다른 탭으로 넘어가면 칸이 없음 → null 에 innerHTML 오류(휴대폰 실사용 오류)
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
      if (cpNote) cpRetryBar('⚠️ 오늘 자료를 잠깐 못 받아 <b>' + cpNote + '</b> 나침반을 보여 줘요', true);
    }).catch(function(err){ console.error(err); cpRetryBar('나침반 자료를 잠깐 못 불러왔어요 (인터넷이 느리거나 자료를 올리는 중)', false); });
    function cpRetryBar(msg, top){
      var b = $("cpbox"); if (!b) return;
      var h = '<div class="empty cp-retry" style="padding:14px 12px">' + msg + '<br><button type="button" class="btn" data-cpretry="1" style="margin-top:8px">🔄 다시 받기</button></div>';
      if (top) b.insertAdjacentHTML("afterbegin", h); else b.innerHTML = h;
      var x = b.querySelector("[data-cpretry]"); if (x) x.onclick = function(){ if (window.getJSONdrop) getJSONdrop(); RENDER.sector(it, el); };
    }
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
