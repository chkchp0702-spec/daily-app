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
                 fetch(URL_C + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })])
      .then(function(a){ P = P0 = a[0]; K = a[1]; PE = a[2]; CN = a[3]; draw(); })
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
      PF.map(function(f){ return '<button class="po-sr' + (S.pf === f.k ? " on" : "") + ' ' + f.k + '" data-pf="' + f.k + '"><span>' + f.ic + ' ' + f.t + '</span><b class="' + cls(f.ret) + '">' + sg(f.ret) + '</b>' + gapB(f.ret) + '</button>'; }).join("") +
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
        '<div class="po-cbn">판정이 바뀌는 날에만 고치면 돼요 · 투자금은 📋 따라하기에서</div></div>' : '') +
      (function(){ var VR = F.k === "kick" ? (K && K.vol_rule) : F.k === "conc" ? (CN && CN.vol_rule) : F.k === "mine" ? null : P.vol_rule; if (!VR || !VR.on) return '';
        return '<div class="po-vr" data-tip="' + e("🦴 변동성 맞춤(" + VR.role + ") — S&P½+나스닥½ 최근 20일 흔들림이 목표 " + VR.target + "%를 넘으면 주식을 그만큼 줄여 현금·단기채로. 바닥 " + VR.floor + "% · 5%p 넘게 바뀔 때만 조정 · " + (VR.from || "").slice(5) + "부터") + '">🦴 변동성 방어(' + e(VR.role) + ') · 주식 <b>' + VR.eq_scale + '%</b> 유지 <small>20일 흔들림 ' + VR.vol20 + '% / 목표 ' + VR.target + '% ⓘ</small></div>'; })() +
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
      '<section class="card po-follow"><div class="po-sb">' + segs.map(function(sg_, i){ return sg_.v > 0 ? '<i data-ix="' + i + '" style="flex:' + sg_.v + ';background:' + sg_.color + '" title="' + e(sg_.label) + '"></i>' : ''; }).join("") + '</div>' +
      '<div class="po-sbl">' + segs.map(function(sg_, i){ return '<span data-ix="' + i + '" class="' + (sg_.v > 0 ? "" : "z") + '"><i style="background:' + sg_.color + '"></i>' + e(sg_.label) + ' <b>' + sg_.v + '%</b></span>'; }).join("") + '</div>' +
      '<div class="po-in"><label>내 투자금</label><div class="po-amt"><input id="poamt" inputmode="numeric" value="' + S.amt.toLocaleString("ko-KR") + '"><span>원</span></div>' +
      '<div class="po-q">' + [3e6, 1e7, 3e7, 1e8].map(function(v){ return '<button data-v="' + v + '">' + won(v) + '</button>'; }).join("") + '</div>' +
      '<div class="po-mode po-pf"><button data-pf="base" class="' + (S.pf === "base" ? "on" : "") + '">💼 기본</button>' + (K ? '<button data-pf="kick" class="' + (S.pf === "kick" ? "on" : "") + '">⚡ 킥 포함</button>' : '') + (CN && CN.now ? '<button data-pf="conc" class="' + (S.pf === "conc" ? "on" : "") + '">🎯 집중+킥</button>' : '') + '<button data-pf="mine" class="' + (S.pf === "mine" ? "on" : "") + '">🙋 내 포트</button></div>' +
      '<div class="po-mode"><button data-m="us" class="' + (S.mode === "us" ? "on" : "") + '">💵 외화 베이스</button><button data-m="kr" class="' + (S.mode === "kr" ? "on" : "") + '">₩ 원화 베이스</button></div></div>' +
      '<div class="po-rcp"><div class="po-rch">🧾 주문서 <small>' + won(S.amt) + '원 · ' + (S.mode === "kr" ? "₩ 원화" : "💵 외화") + '</small></div>' +
      // 10/14 A11-4: 「갖고 있는 주 수」를 넣으면 주문서가 「처음부터 다 사기」 대신 「바꿀 것만」(+n주 사기 · −n주 팔기 · 그대로)
      '<div class="po-hv"><button type="button" id="pohvt" class="' + (S.hv ? "on" : "") + '">' + (S.hv ? "✍️ 갖고 있는 주 수 넣는 중" : "✍️ 갖고 있는 주 수 넣기") + '</button><small>' + (S.hv ? "주문서가 「바꿀 것만」 보여 줘요 · 휴대폰에만 저장" : "넣으면 「바꿀 것만」 보여 줘요") + '</small></div>' +
      '<div id="porows"></div><div id="pohvx"></div>' +
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
      h += '<div class="sec">🧭 섹터 의견 <small class="mut">리포트의 섹터 판단 · 돈은 안 넣고 지수 코어와 비교</small></div><section class="card po-vw">' +
        (VW.pending ? '<p class="cn-n">' + md(VW.since) + ' 첫 거래일부터 채점해요. 코어(S&P½+나스닥½)보다 8주 넘게 나으면 「주식 칸의 절반까지 섹터로」를 제안해요.</p>'
          : '<div class="cn-v" style="grid-template-columns:repeat(3,1fr)"><div class="me"><small>🧭 섹터 의견</small><b class="' + cls(VW.ret) + '">' + sg(VW.ret) + '</b></div><div><small>코어</small><b class="' + cls(VW.core) + '">' + sg(VW.core) + '</b></div><div><small>차이</small><b class="' + cls(VW.edge) + '">' + sg(VW.edge).replace("%", "%p") + '</b></div></div>') +
        '<div class="po-vcs">' + VW.rows.map(function(x, i){ var st = x.ret == null ? "wait" : x.ret - (VW.core || 0) >= 0 ? "g" : "b";
          return '<button class="po-vc ' + st + '" data-vi="' + i + '"><b>' + e(x.name.replace(/\s*\(.*\)$/, "")) + '</b> ' + x.pct + '%<small>' + (x.ret == null ? "대기" : sg(x.ret, 1) + (st === "g" ? " ↑" : " ↓")) + '</small></button>'; }).join("") + '</div>' +
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
    [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ S.pf = x.dataset.pf; keep(); pfJump(x); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(x){ x.onclick = function(){ S.pf = x.dataset.p; keep();
      [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ S.pf = x.dataset.pf; keep(); pfJump(x); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    document.getElementById("pocopy").onclick = copy;
    myBind(b);
    if (window.portDesign) try { portDesign(document.getElementById("podz"), {spx: +MW.spx || 0, ndx: +MW.ndx || 0, gold: +MW.gold || 0}); } catch(x) {}   // 🎛 A10/21-1
    var inf = b.querySelector(".po-inf"); if (inf) inf.addEventListener("toggle", function(){ S.inf = inf.open ? 1 : 0; keep(); });
    var hvt = document.getElementById("pohvt"); if (hvt) hvt.onclick = function(){ S.hv = S.hv ? 0 : 1; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); };   // A11-4
    if (window.foldify) foldify(b);
    // ⑩ 위에 붙는 미니 성적 띠 (접기 바로가기 칩과 한 덩어리) — 요약 카드가 안 보일 때만
    var fj = b.querySelector(".fold-jump");
    if (fj){ var st = document.createElement("div"); st.className = "po-stk"; fj.parentNode.insertBefore(st, fj);
      var mini = document.createElement("button"); mini.className = "po-mini"; mini.type = "button";
      mini.innerHTML = PF.map(function(f){ return '<span>' + f.ic + ' <b class="' + cls(f.ret) + '">' + sg(f.ret) + '</b></span>'; }).join("") + '<span class="sp">S&P <b class="' + cls(spN) + '">' + sg(spN) + '</b></span><i>▲</i>';
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
      if (S.mode === "kr" && n.kr){ var kp = kr && kr.px; items.push({nm: n.kr.name, code: n.kr.code, amt: amt, sh: kp ? Math.floor(amt / kp) : null, px: kp, cur: "원"}); }
      else { var u = px[n.t] || {}, usd = P.fx ? amt / P.fx : null; items.push({nm: n.t, code: n.t, amt: amt, usd: usd, sh: usd && u.px ? Math.floor(usd / u.px) : null, px: u.px, cur: "$"}); }
      return {x: {name: n.name, pct: pct}, i: i, amt: amt, items: items};
    });
    if (kw) out.push({x: {name: "⚡ 킥", pct: Math.round(kw * 10) / 10}, i: -1, amt: S.amt * kw / 100, kick: 1, items: KH.map(function(o){
      var a2 = S.amt * o.w / 100, kr2 = /^\d{6}\.K[SQ]$/.test(o.code), us2 = /^[A-Z\-]+$/.test(o.code), usd2 = us2 && P.fx ? a2 / P.fx : null;
      return {tags: o.tags || "", short: nm(o.name), nm: (o.tags ? o.tags + " " : "") + nm(o.name), code: o.code, amt: a2, usd: usd2, cur: us2 ? "$" : kr2 ? "원" : "현지",
              sh: us2 ? (usd2 && o.now ? Math.floor(usd2 / o.now) : null) : kr2 ? Math.floor(a2 / o.now) : null, note: o.rule || ""}; })});
    return out;
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
      var rb0 = RB ? (RB[x.name] != null ? RB[x.name] : x.pct) : 0, PK = K && K.park && K.park.on;
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
    return '<details class="card po-inf no-clp"' + (S.inf ? " open" : "") + '><summary>ⓘ 포트 4개, 뭐가 달라요? <small>눌러서 열고 닫기</small></summary><div class="po-infb">' +
      '<div><b>💼 기본 포트</b> — 뼈대. S&P500·나스닥100 반반에 금 조금. 시장이 나빠지면 현금을 늘려요. 개별 종목은 없어요.</div>' +
      (K ? '<div class="k"><b>⚡ 킥 포트</b> — <u>기본 뼈대 + 개별 종목 양념</u>. 돈의 약 ' + pc(R.sleeve) + '는 ☕ 컵·📈 갭 같은 신호가 뜬 종목을 최대 ' + (R.slots || "–") + '개, 약 ' + pc(R.whale_sleeve) + '는 🐋 고래가 새로 산 종목 묶음에 담아요. 종목마다 ' +
        (R.stop != null ? Math.round(R.stop * 100) + '% 손절 · ' : '') + (R.take != null ? '+' + Math.round(R.take * 100) + '% 익절 · ' : '') + (R.time ? R.time + '거래일 지나면 정리' : '') + '. 사고파는 일이 잦고, 스캐너가 잘 맞히느냐에 성적이 걸려 있어요.</div>' : '') +
      (CN ? '<div class="c"><b>🎯 집중 포트</b> — <u>지수 두 개에 몰빵 + 날씨 따라 우산</u>. 개별 종목 없이 S&P500·나스닥100만. 판정: ' + e(CR.judge || "S&P500 200일선") + '. ' + e(CR.on || "") + ' / ' + e(CR.off || "") + '. 손은 주 1회 비중 맞출 때와 판정이 바뀐 날에만 가요.</div>' : '') +
      '<div class="m"><b>🙋 내 포트</b> — <u>내가 실제로 담는 그대로</u>. S&P·나스닥·금 비중을 직접 정하고, ⚡ 킥 종목 중 산 것만 ✓ 체크. 성적·비교·그래프는 다른 포트와 똑같이 보여 줘요.</div>' +
      '<p class="note" style="margin:6px 0 0">셋 다 「규칙대로 했다면」 계산이지 매수 추천이 아니에요.</p></div></details>';
  }
  function rows(){
    var box = document.getElementById("porows"); if (!box) return;
    box.innerHTML = plan().map(function(p){
      if (p.kick) return kickRow(p);
      if (!p.x.pct) return '';
      if (p.prod) return '<div class="po-r"><div class="po-rh"><i style="background:#38bdf8"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        p.items.map(function(it){ return '<div class="po-it"><span class="tk">' + e(it.nm) + ' <small>' + r1(it.w) + '%</small></span><span class="v">' + won(it.amt) + '원' + (it.cur && it.cur !== "원" ? ' · ' + e(it.cur) + '로' : '') + '</span></div>'; }).join("") +
        '<div class="po-itn">상품은 상품 탭 · 미래에셋 매매 화면에서 금액으로 사요(채권 단가·펀드 최소금액 확인)</div></div>';                              // 0% 칸은 주문서에서 뺌
      return '<div class="po-r' + (p.kick ? ' po-rk' : '') + '" data-ix="' + p.i + '"><div class="po-rh"><i style="background:' + (p.kick ? "#ff6b6b" : COL[p.i % COL.length]) + '"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        p.items.map(function(it){
          return '<div class="po-it" data-op="' + e(it.code) + '"><span class="tk">' + e(it.nm) + (it.code !== it.nm ? ' <small>' + e(it.code) + '</small>' : '') + ' <i class="po-go">›</i></span>' +
            '<span class="v">' + (it.cur === "$" ? (it.usd != null ? '$' + Math.round(it.usd).toLocaleString("en-US") + ' · ' : '') : won(it.amt) + '원 · ') +
            (it.sh != null ? '<b>' + it.sh.toLocaleString("ko-KR") + '주</b>' : it.cur === "현지" ? '현지 통화로' : '가격 확인') + (it.fx ? ' <small class="po-fx">' + flag(it.code) + ' ' + e(it.fx) + '</small>' : '') + '</span></div>' +
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
        var row = inp.closest(".po-hvl"), code = inp.dataset.code, it = null; plan().forEach(function(p){ p.items.forEach(function(x){ if (x.code === code) it = x; }); });
        if (row && it){ var d = hvDiff(it); row.querySelector(".hv-d").innerHTML = d == null ? '<small>주 수를 넣으면 「바꿀 것」이 나와요</small>' : '→ ' + hvTxt(d); } hvExtra(); };
    });
    // ⚡ 킥 칩(kickRow)에도 보유 수 입력은 없음 — 킥 칸은 종목이 바뀌니 「배분표에 없는 보유분」 줄로 「팔 것」을 알려 줌
    hvExtra();
  }
  function hvExtra(){
    var ex = document.getElementById("pohvx"); if (!ex || !S.hv) return;
    var inPlan = {}; plan().forEach(function(p){ p.items.forEach(function(x){ inPlan[x.code] = 1; }); });
    var left = Object.keys(S.have).filter(function(c){ return !inPlan[c] && hvQty(c) > 0; });
    var sum = hvSummary();
    ex.innerHTML = (left.length ? '<div class="po-hvx"><b>지금 배분표에 없는 보유분</b> → 팔기: ' + left.map(function(c){ return '<span class="po-tk" data-op="' + e(c) + '">' + e(c) + '</span> ' + hvTxt(-hvQty(c)) + ' <button aria-label="닫기" type="button" class="hv-rm" data-rm="' + e(c) + '">✕</button>'; }).join(" · ") + '</div>' : '') +
      (sum ? '<div class="po-hvs">' + sum + '</div>' : '');
    [].forEach.call(ex.querySelectorAll(".hv-rm"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); delete S.have[b.dataset.rm]; keep(); hvExtra(); }; });
  }
  function hvSummary(){
    var buy = 0, sell = 0, keepN = 0, miss = 0;
    plan().forEach(function(p){ p.items.forEach(function(it){ if (it.sh == null) return; var d = hvDiff(it); if (d == null){ miss++; return; } if (d > 0) buy++; else if (d < 0) sell++; else keepN++; }); });
    if (!buy && !sell && !keepN) return "";
    return '바꿀 것 ' + (buy + sell) + '줄 <small>(사기 ' + buy + ' · 팔기 ' + sell + ' · 그대로 ' + keepN + (miss ? ' · 주 수 안 넣음 ' + miss : '') + ')</small>';
  }
  // ⚡ 킥 칸은 간단히: 신호별 개수 한 줄 + 종목 칩(이모티콘·이름·주 수) · 규칙·손절은 「킥」 카드에서
  function kickRow(p){
    var cnt = {}; p.items.forEach(function(it){ (it.tags.match(/\p{Extended_Pictographic}/gu) || ["·"]).forEach(function(t){ cnt[t] = (cnt[t] || 0) + 1; }); });
    var lab = {"🐋": "고래", "☕": "컵", "📈": "갭", "🤫": "매집", "🧪": "시험"};
    var sum = Object.keys(cnt).filter(function(t){ return lab[t]; }).map(function(t){ return t + ' ' + lab[t] + ' ' + cnt[t]; }).join(' · ');
    return '<div class="po-r po-rk"><div class="po-rh"><i style="background:#ff6b6b"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
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
      return '<details' + (ti < 2 || inP ? ' open' : '') + '><summary><b>' + e(T.name) + '</b>' + (inP ? ' <span class="po-sg g">포트 ' + inP + '</span>' : '') +
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
      '<p class="cn-n2">판정이 바뀌는 날(🟢↔🔴)에만 고치면 돼요. 금액·환율 바꾸기는 아래 📋 따라하기에서.</p>' +
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
      var ls = []; plan().forEach(function(p){ p.items.forEach(function(it){ if (it.sh == null) return; var d = hvDiff(it); if (d == null) ls.push("· " + it.nm + " " + it.sh + "주 (지금 주 수 안 넣음)"); else if (d) ls.push("· " + it.nm + " " + (d > 0 ? "+" + d + "주 사기" : "−" + (-d) + "주 팔기")); }); });
      var inPlan = {}; plan().forEach(function(p){ p.items.forEach(function(x){ inPlan[x.code] = 1; }); });
      Object.keys(S.have).forEach(function(c){ if (!inPlan[c] && hvQty(c) > 0) ls.push("· " + c + " −" + hvQty(c) + "주 팔기 (배분표에 없음)"); });
      t = "💼 CH Investing 포트 바꿀 것만 (" + md(P.changes[0] && P.changes[0].date) + " 배분표 · 투자금 " + won(S.amt) + "원)\n" + (ls.length ? ls.join("\n") : "· 바꿀 것 없음 ✓") + "\n※ 매수 추천 아님 · 리포트 배분표와 내 보유분의 차이 계산";
    } else
    t = "💼 CH Investing 포트 따라하기 (" + md(P.changes[0] && P.changes[0].date) + " 배분표 · 투자금 " + won(S.amt) + "원)\n" +
      plan().map(function(p){ return "· " + p.x.name + " " + p.x.pct + "% (" + won(p.amt) + "원): " + p.items.map(function(it){ return it.nm + (it.sh != null ? " " + it.sh + "주" : ""); }).join(", "); }).join("\n") +
      "\n※ 매수 추천 아님 · 리포트 배분표를 그대로 옮긴 계산";
    var ok = function(){ var s = document.getElementById("pocpst"); if (s){ s.textContent = "복사됐어요 ✓"; setTimeout(function(){ s.textContent = ""; }, 2500); } };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok).catch(function(){ prompt("복사하세요", t); });
    else prompt("복사하세요", t);
  }

  var css = document.createElement("style");
  css.textContent =
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
    ".po-hvl{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:var(--sub);padding:3px 0 2px 17px}.po-hin{width:52px;font:inherit;font-size:14px;font-weight:800;text-align:right;padding:3px 6px;margin:0 3px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--text)}.po-hvl .hv-d{white-space:nowrap}.po-hvl .hv-d small{font-size:12.5px}.hv-b{color:#4dd47a}.hv-s{color:#e66767}.hv-k{color:var(--sub)}" +
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
    ".po-rr .no{font-size:12.5px;color:var(--dim);text-align:right}.po-rr .n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.po-rr .n small{display:block;font-size:12.5px;color:var(--dim)}" +
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
    ".po-mini{display:none;width:100%;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);font:inherit;font-size:12px;padding:6px 8px;gap:4px;justify-content:space-between;align-items:center;cursor:pointer;white-space:nowrap;overflow:hidden}" +
    ".po-stk.mini-on .po-mini{display:flex}.po-mini b{font-weight:900}.po-mini .sp{color:var(--sub)}.po-mini i{margin-left:0;flex:none;font-style:normal;color:var(--dim);font-size:12px}.po-mini span{flex:0 1 auto;min-width:0;letter-spacing:-.2px}" +
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
