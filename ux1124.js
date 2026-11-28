/* 🔦 11/24 바닥 점검표 15칸 — 코스피·코스닥 (사용자: 「코스피 코스닥 바닥 신호인지를 심층분석 · 모든 방법을 동원해서」 → 「둘 다 진행」)
   「팔 사람은 다 팔았나」(투매·청산 8칸) 와 「살 사람이 들어왔나」(확인 7칸) 를 따로 세어 한 줄 판정 + 펼치면 15칸.
   계산은 만드는 쪽(market-strategy-report src/floor_check.py → bear.json 코스피·코스닥 칸의 floor) — 이 파일은 그리기만.
   붙는 곳: 🐻 하락장 계기판 시장 줄 안, 📜 과거 성적표 바로 위 (새 화면 없음 · 12/1까지 새 화면 동결 지킴)
   규칙(현금·주식 비중)은 안 바꿈 · 기록 · 과거 빈도는 앞날 보장 아님 · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var IC = {on: "✔", half: "△", off: "✖", na: "?"}, NM = {on: "켜짐", half: "반쯤", off: "꺼짐", na: "자료 확인 중"};   // 🩹 11/24 na = 숫자가 말이 안 돼 빼고 센 칸
  function dots(cells){ return cells.map(function(c){ return '<i class="fc-' + c.st + '" title="' + e(c.k) + '"></i>'; }).join(""); }
  function rows(cells){
    return cells.map(function(c){
      return '<li class="fc-' + c.st + '"><span class="fc-i" aria-label="' + NM[c.st] + '">' + IC[c.st] + '</span><b>' + e(c.k) + '</b><small>' + e(c.d) + (c.asof ? ' <em>' + e(c.asof) + ' 기준</em>' : '') + (c.bad ? ' <em class="fc-bad">자료 확인 중 · ' + e(c.bad) + ' — 셈에서 뺌</em>' : '') + '</small></li>';
    }).join("");
  }
  function floorHtml(m){
    var f = m && m.floor; if (!f || !f.cells || !f.cells.length) return "";
    var S = f.cells.filter(function(c){ return c.g === "sell"; }), C = f.cells.filter(function(c){ return c.g === "conf"; });
    var nS = S.filter(function(c){ return c.st !== "na"; }).length, nC = C.filter(function(c){ return c.st !== "na"; }).length;
    var past = (f.past && f.past.lines || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("");
    var d = String(f.asof || "").slice(5).replace("-", "/").replace(/^0/, "");
    return '<div class="fc"><div class="fc-h">🔦 ' + e(f.name || m.name || "") + ' 바닥 점검표 <small>' + e(d) + ' 종가 · ' + f.cells.length + '칸</small></div>' +
      '<div class="fc-v fc-' + e(f.lv) + '">' + e(f.head) + '</div>' +
      '<div class="fc-g"><span>팔 사람은 다 팔았나</span><span class="fc-dots">' + dots(S) + '</span><b>' + f.sell_on + '/' + nS + '</b></div>' +
      '<div class="fc-g"><span>살 사람이 들어왔나</span><span class="fc-dots">' + dots(C) + '</span><b>' + f.conf_on + '/' + nC + '</b></div>' +
      (f.chg && f.chg.k && f.chg.k.length ? '<p class="fc-chg">🔄 ' + e(String(f.chg.d || "").slice(5).replace("-", "/")) + ' 바뀐 칸: ' + e(f.chg.k.join(" · ")) + '</p>' : '') +
      '<details class="fc-d"><summary>' + f.cells.length + '칸 펼치기</summary>' +
        '<div class="fc-t">투매·청산 — 팔 사람은 다 팔았나</div><ul class="fc-ul">' + rows(S) + '</ul>' +
        '<div class="fc-t">확인 — 살 사람이 들어왔나</div><ul class="fc-ul">' + rows(C) + '</ul>' +
        '<div class="fc-pol" data-pol="' + e(m.key || "") + '" data-polfull="1">' + polHtml(m.key, 1) + '</div>' +
        '<p class="fc-n">확인 5칸↑ = 🟢 바닥 확인 쪽 · 확인 3칸↑ + 투매 4칸↑ = 🟡 가능성 높아짐 · 투매 4칸↑ = 🟠 바닥 구간일 수 있음(확인 전)</p>' +
        (past ? '<div class="fc-t">과거 채점 — 같은 판정이 켜졌던 때의 그 뒤</div><ul class="fc-past">' + past + '</ul>' : '') +
        '<p class="fc-n">' + e(f.note || "규칙은 그대로 · 기록 · 매수·매도 추천 아님") + '</p></details></div>';
  }
  window.__floorHtml = floorHtml;
  /* 11/24 사용자 「왜 바닥점검표가 코스피만 있냐 — 코스닥 s&p500 나스닥100 다 만들어」
     → 처음엔 📜 과거 성적표 머리(__bearSigHead)에만 붙여서, 첫 화면 「지금 규칙」(가장 나쁜 시장 한 곳 = 코스피)과 깊숙한 체크리스트에서만 보였음.
     이제 시장 줄마다 불리는 __meetLine 에 붙임 → 🐻 계기판의 코스피·코스닥·S&P500·나스닥 줄을 펼치면 각각 보임.
     같은 시장에서 두 머리가 잇달아 불리면(체크리스트 펼침) 한 번만 그림. */
  /* 첫 화면 「지금 규칙」 펼침 — 네 시장 한 표(줄마다 판정·n/8·n/7 · 누르면 그 시장 15칸). ux1105c.js ruleHtml 이 부름. */
  /* 🌏 11/24 사용자 「여기에도 넣으라고」 — 하락장 계기판의 나머지 9개 지수(일본·중국·홍콩·기술 지수)도 이 표에. 칸 수는 지수마다 다름(그 나라에서 받는 자료만) */
  /* 💡 11/28 사용자 「너무 천편일률적 — 인사이트를 줘 · 시장마다의 차이도」 → 「다 진행」
     ① 줄마다 「이 시장만의 다른 점」 한 줄 — 13곳 칸을 서로 견줘 남들과 다른 칸·빠진 깊이·빚·다음 선까지 거리 (숫자는 bear.json 그대로 · 새 판정 없음)
     ② 맨 위 한눈 요약 3줄 — 살 사람이 가장 돌아온 곳 · 가장 많이 판 곳 · 다음 선에 가장 가까운 곳
     ③ 🏛 정부 움직임(말 ▸ 제도 ▸ 돈) — archive/x/policy.json (두뇌가 고침 · 참고용 · n/8·n/7 셈과 판정에는 안 넣음 · 10일 넘게 묵으면 감춤) */
  function num(s, re){ var x = String(s == null ? "" : s).match(re); return x ? parseFloat(x[1].replace("−", "-")) : null; }
  function cellOf(f, k){ for (var i = 0; i < f.cells.length; i++) if (f.cells[i].k === k) return f.cells[i]; return null; }
  function sg(x, d){ var a = Math.abs(x); return (x >= 0 ? "+" : "−") + a.toFixed(d != null ? d : (a < 10 ? 1 : 0)) + "%"; }
  function depOf(m){ if (m.close > 0 && m.m200 > 0) return (m.close / m.m200 - 1) * 100; var c = cellOf(m.floor, "깊이"); return c ? num(c.d, /200일선보다\s*([-−]?\d+(?:\.\d+)?)%/) : null; }
  function debtOf(m){ var c = cellOf(m.floor, "빚 청산"); return c && c.st !== "na" ? num(c.d, /\(([-−]\d+(?:\.\d+)?)%\)/) : null; }
  function gateOf(m){   // 다음에 넘어야 할 선과 거기까지 남은 %
    if (!(m.close > 0)) return null;
    if (m.m50 > 0 && m.close < m.m50) return {k: "50일선", g: (m.m50 / m.close - 1) * 100};
    if (m.m200 > 0 && m.close < m.m200) return {k: "200일선", g: (m.m200 / m.close - 1) * 100, up: m.m50 > 0 ? "50일선 위" : ""};
    return (m.m200 > 0) ? {k: "200일선", g: 0, over: 1} : null;
  }
  function ctx(all){
    var C = {n: all.length, dep: {}, debt: {}, on: {}, has: {}};
    all.forEach(function(m){
      var d = depOf(m), b = debtOf(m); if (d != null) C.dep[m.key] = d; if (b != null) C.debt[m.key] = b;
      m.floor.cells.forEach(function(c){ if (c.st === "na") return; C.has[c.k] = (C.has[c.k] || 0) + 1; if (c.st !== "off") C.on[c.k] = (C.on[c.k] || 0) + 1; });
    });
    var dv = Object.keys(C.dep).map(function(k){ return C.dep[k]; }), bv = Object.keys(C.debt).map(function(k){ return C.debt[k]; });
    C.depMin = dv.length > 2 ? Math.min.apply(null, dv) : null; C.depMax = dv.length > 2 ? Math.max.apply(null, dv) : null;
    C.debtMin = bv.length > 1 ? Math.min.apply(null, bv) : null; C.debtMinN = bv.filter(function(v){ return v === C.debtMin; }).length;
    return C;
  }
  var GOOD = {"저점 다지기": function(c){ var n = num(c.d, /뒤\s*(\d+)거래일째/); return "저점을 " + (n != null ? n + "거래일째 " : "") + "지킴"; },
              "20일선·50일선 회복": function(c){ return c.st === "on" ? "20·50일선 위로 올라옴" : "20일선 위로 올라옴"; },
              "200일선 회복": function(c){ return c.st === "on" ? "200일선 회복" : "200일선 근처"; },
              "외국인 매도 멈춤": function(c){ var n = num(c.d, /(\d+)일 연속 순매수/); return c.st === "on" ? "외국인이 돌아옴" : "외국인이 사기 시작" + (n ? "(" + n + "일)" : ""); },
              "본토 자금 들어옴": function(){ return "본토 돈이 들어오는 중"; },
              "신용 감소 멈춤": function(){ return "빚 줄이기가 멈춤"; }, "살 돈(예탁금)": function(){ return "살 돈이 다시 늘어남"; }},
      LACK = {"급락일": "투매다운 급락은 없었음", "과매도": "과매도까지는 안 감", "싼가": "아직 싸지 않음", "깊이": "덜 빠진 편", "값은 신저가인데 힘은 덜 빠짐": "저점에서 파는 힘이 아직 셈", "빚 청산": "빚이 덜 털림"};
  function diffParts(m, C){
    var f = m.floor, out = [], N = C.n || 1;
    f.cells.forEach(function(c){   // 남들은 꺼졌는데 여기만 켜진 확인 칸
      if (m._real && (c.k === "저점 다지기" || c.k === "20일선·50일선 회복" || c.k === "200일선 회복")) return;   // 실제 지수로 아래에서 따로 말함
      if (c.g === "conf" && c.st !== "off" && c.st !== "na" && GOOD[c.k] && (C.on[c.k] || 0) / N <= 0.4 && out.length < 2) out.push({t: GOOD[c.k](c), up: 1});
    });
    var R = m._real;
    if (R && R.low60 && R.low60.d){
      var la = String(R.low60.d).split("-"), ld = (+la[1]) + "/" + (+la[2]), n = R.low60.days;
      out.push(n >= 10 ? {t: "저점(" + ld + ") 뒤 " + n + "거래일째 지킴", up: 1} : {t: ld + " 새 저점 뒤 " + n + "거래일째"});
      if (R.m20 > 0 && R.close > R.m20) out.push({t: "20일선 위로 올라옴", up: 1});
    }
    var lk = 0;
    f.cells.forEach(function(c){   // 남들은 켜졌는데 여기만 꺼진 투매 칸
      if (c.g === "sell" && c.st === "off" && LACK[c.k] && C.has[c.k] > 2 && (C.on[c.k] || 0) / C.has[c.k] >= 0.7 && lk < 1){ out.push({t: LACK[c.k]}); lk++; }
    });
    var d = C.dep[m.key];
    if (d != null) out.push({t: (d === C.depMin ? N + "곳 중 가장 깊이 빠짐 · " : d === C.depMax ? N + "곳 중 가장 덜 빠짐 · " : "") + "200일선 " + sg(d)});
    var b = C.debt[m.key];
    if (b != null && (m.nat === "kr" || (b === C.debtMin && C.debtMinN === 1))) out.push({t: "빚 " + sg(b, 0) + (b === C.debtMin && C.debtMinN === 1 ? " · 가장 많이 털림" : "")});
    var g = gateOf(m);
    if (g) out.push({t: g.over ? "200일선 위" : (g.up ? g.up + " · " : "") + (g.g < 1 ? g.k + " 코앞(" + sg(g.g, 2) + ")" : g.k + "까지 " + sg(g.g)), gate: 1});
    if (R && m._srv > 0 && Math.abs(m._srv / m.close - 1) > 0.02) out.push({t: "실제 지수 " + cm(m.close) + " 기준 (계기판 값은 " + cm(m._srv) + ")", warn: 1});
    return out;
  }
  function diffHtml(m, C){
    var a = []; try { a = diffParts(m, C); } catch (_) {}
    var late = '';
    return '<span class="fa-x">' + (a.length ? '<span class="fa-xi">💡</span>' + a.map(function(x){ return '<span class="' + (x.up ? "fa-up" : x.gate ? "fa-gt" : x.warn ? "fa-wn" : "") + '">' + e(x.t) + '</span>'; }).join('<i> · </i>') : '') + late +
      '<span class="fa-p" data-pol="' + e(m.key || "") + '">' + polHtml(m.key, 0) + '</span></span>';
  }
  function lateTxt(all){   // 켜짐·꺼짐 칸이 종가보다 하루 늦은 시장이 있으면 한 번만 알림
    var md = function(x){ return String(x).slice(5).replace("-", "/").replace(/^0/, ""); }, L = all.filter(function(m){ return m.floor.asof && m.asof && String(m.floor.asof) < String(m.asof); });
    return L.length ? '<br>⏱ ' + (L.length === all.length ? "모든 시장" : L.length + "곳(" + e(L.slice(0, 2).map(function(m){ return m.floor.name || m.name; }).join("·")) + (L.length > 2 ? " 등" : "") + ")") + '의 켜짐·꺼짐 칸은 ' + e(md(L[0].floor.asof)) + ' 종가 기준 · 선까지 거리는 ' + e(md(L[0].asof)) + ' 종가' : '';
  }
  function topHtml(all, C){
    try {
      var nm = function(m){ return e(m.floor.name || m.name); };
      var cnt = function(m, g){ return m.floor.cells.filter(function(c){ return c.g === g && c.st !== "na"; }).length || 1; };
      var byC = all.slice().sort(function(x, y){ return y.floor.conf_on / cnt(y, "conf") - x.floor.conf_on / cnt(x, "conf"); });
      var byS = all.slice().sort(function(x, y){ return y.floor.sell_on / cnt(y, "sell") - x.floor.sell_on / cnt(x, "sell"); });
      var gs = all.map(function(m){ return {m: m, g: gateOf(m)}; }).filter(function(x){ return x.g && !x.g.over; }).sort(function(x, y){ return x.g.g - y.g.g; });
      var L = [];
      if (byC[0] && byC[0].floor.conf_on > 0) L.push(['🙋 살 사람이 가장 돌아온 곳', byC.slice(0, 2).map(function(m){ return '<b>' + nm(m) + '</b> ' + m.floor.conf_on + '/' + cnt(m, "conf"); }).join(' · ')]);
      if (byS[0]) L.push(['🧹 팔 사람이 가장 많이 판 곳', byS.slice(0, 2).map(function(m){ return '<b>' + nm(m) + '</b> ' + m.floor.sell_on + '/' + cnt(m, "sell"); }).join(' · ')]);
      if (gs.length) L.push(['🚪 다음 선에 가장 가까운 곳', gs.slice(0, 3).map(function(x){ return '<b>' + nm(x.m) + '</b> ' + x.g.k + ' ' + sg(x.g.g, x.g.g < 1 ? 2 : 1); }).join(' · ')]);
      return L.length ? '<div class="fa-top">' + L.map(function(x){ return '<p><span>' + x[0] + '</span>' + x[1] + '</p>'; }).join("") + '<p class="fa-topn">같은 🟠 라도 속은 다름 — 줄마다 💡 가 그 시장만의 다른 점' + lateTxt(all) + '</p></div>' : '';
    } catch (_) { return ""; }
  }
  /* 📏 11/28 사용자 「다른 곳 시세라도 가져와」 — 중국·홍콩은 실제 지수(archive/x/live_ix.json · ix_real.py · 텐센트)로 선까지 거리·저점 지킨 날을 그림.
     서버 계기판 값이 지수와 2% 넘게 다르면 그 사실도 한 줄. 판정(🟠)·칸 수·주식 몫은 서버 것 그대로 — 여기서 새로 판정하지 않음. 5일 넘게 묵으면 안 씀. */
  var IXR = null, lastBR = null;
  try { IXR = JSON.parse(localStorage.getItem("ch-ixr") || "null"); } catch (_) {}
  function ixOk(){ if (!IXR || !IXR.ix || !IXR.at) return false; var t = Date.parse(String(IXR.at).replace(" ", "T") + ":00+09:00"); return !(t > 0) || Date.now() - t < 5 * 864e5; }
  function withReal(m){
    var r = ixOk() ? IXR.ix[m.key] : null;
    if (!r || !(r.close > 0) || (m.asof && String(r.asof) < String(m.asof))) return m;
    var o = {}, k; for (k in m) o[k] = m[k];
    o._srv = m.close; o._real = r; o.close = r.close; o.asof = r.asof; if (r.m50 > 0) o.m50 = r.m50; if (r.m200 > 0) o.m200 = r.m200; if (r.m20 > 0) o.m20 = r.m20;
    return o;
  }
  function cm(x){ return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function ixGet(){
    try {
      var u = "archive/x/live_ix.json", p = window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); });
      Promise.resolve(p).then(function(j){
        if (!j || !j.ix) return; var was = IXR && IXR.at; IXR = j; try { localStorage.setItem("ch-ixr", JSON.stringify(j)); } catch (_) {}
        if (was === j.at || !lastBR) return;
        var el = document.querySelector(".fa"); if (!el) return;       // 이미 그려진 표가 있으면 새 값으로 다시 그림
        var nh = floorAll(lastBR), box = el.parentNode, swap = function(){ var t = document.createElement("div"); t.innerHTML = nh; if (t.firstChild && el.isConnected) box.replaceChild(t.firstChild, el); };
        if (window.__keepOpen) __keepOpen(box, swap); else if (!el.querySelector("details[open]")) swap();   // 🩹 11/28 펼친 줄은 그대로 · 보던 자리 그대로
      }).catch(function(){});
    } catch (_) {}
  }
  setTimeout(ixGet, 900);
  /* 🏛 정부 움직임 — 말(1) ▸ 제도(2) ▸ 돈(3) */
  var POL = null, STG = ["", "말", "제도", "돈"];
  try { POL = JSON.parse(localStorage.getItem("ch-pol") || "null"); } catch (_) {}
  function polOk(){ if (!POL || !POL.markets || !POL.at) return false; var t = Date.parse(String(POL.at).replace(" ", "T") + ":00+09:00"); return !(t > 0) || Date.now() - t < 10 * 864e5; }
  function polHtml(key, full){
    if (!key || !polOk()) return ""; var p = POL.markets[key]; if (!p) return "";
    var s = +p.stage || 0, steps = [1, 2, 3].map(function(i){ return '<i class="' + (i <= s ? "on" : "") + '">' + STG[i] + '</i>'; }).join('<u>▸</u>');
    if (!full) return '<span class="fa-pc">🏛 정부 ' + (s ? steps : '<i>직접 대책 확인 못 함</i>') + '</span>';
    return '<div class="fc-t">참고 — 🏛 정부 움직임 <small>(셈·판정에 안 넣음)</small></div><p class="fc-pd"><span class="fa-pc">' + (s ? steps : '<i>직접 대책 확인 못 함</i>') + '</span> ' + e(p.d || "") + ' <em>' + e(p.asof || String(POL.at).slice(5, 10).replace("-", "/")) + ' 기준 · 두뇌가 뉴스로 고침</em></p>';
  }
  function paintPol(){
    try { [].forEach.call(document.querySelectorAll("[data-pol]"), function(el){ el.innerHTML = polHtml(el.getAttribute("data-pol"), el.getAttribute("data-polfull") ? 1 : 0); }); } catch (_) {}
  }
  function polGet(){
    try {
      var u = "archive/x/policy.json", p = window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); });
      Promise.resolve(p).then(function(j){ if (j && j.markets){ POL = j; try { localStorage.setItem("ch-pol", JSON.stringify(j)); } catch (_) {} paintPol(); } }).catch(function(){});
    } catch (_) {}
  }
  setTimeout(polGet, 1200);
  var FL = {kr: "🇰🇷", us: "🇺🇸", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰"}, allT = 0, TECH = {star50: 1, chinext: 1, hstech: 1, sox: 1};
  function floorAll(BR){
    var ok = function(m){ return m.floor && m.floor.cells && m.floor.cells.length; };
    var ms = ((BR && BR.markets) || []).filter(ok), mo = ((BR && BR.more) || []).filter(ok);
    if (!ms.length && !mo.length) return "";
    allT = Date.now();
    lastBR = BR; ms = ms.map(withReal); mo = mo.map(withReal);
    var all = ms.concat(mo), CX = ctx(all);
    setTimeout(paintPol, 0);
    var grp = [[null, ms], ["일본 · 중국 · 홍콩", mo.filter(function(m){ return !TECH[m.key]; })], ["기술 지수", mo.filter(function(m){ return TECH[m.key]; })]];
    return '<div class="fa"><div class="fa-h">🔦 바닥 점검표 <small>시장 ' + (ms.length + mo.length) + '곳 · 누르면 칸마다</small></div>' + topHtml(all, CX) + grp.filter(function(g){ return g[1].length; }).map(function(g){ return (g[0] ? '<div class="fa-sub">' + g[0] + '</div>' : '') + g[1].map(function(m){ return faRow(m, CX); }).join(""); }).join("") + '</div>';
  }
  function faRow(m, CX){
      var f = m.floor, ns = f.cells.filter(function(c){ return c.g === "sell" && c.st !== "na"; }).length, nc = f.cells.filter(function(c){ return c.g === "conf" && c.st !== "na"; }).length;
      return '<details class="fa-r fc-' + e(f.lv) + '"><summary><span class="fa-n">' + (FL[m.nat] || "") + ' <b>' + e(f.name || m.name) + '</b></span>' +
        '<span class="fa-v">' + e(String(f.head || "").replace(" · 확인 전", "")) + '</span>' +
        '<span class="fa-c">팔 사람 <b>' + f.sell_on + '/' + ns + '</b> · 살 사람 <b>' + f.conf_on + '/' + nc + '</b></span>' + diffHtml(m, CX) + '</summary>' + floorHtml(m) + '</details>';
  }
  window.__floorAll = floorAll;
  var lastM = null, lastT = 0;
  var prevMeet = window.__meetLine;
  window.__meetLine = function(m, cls){ var a = ""; try { a = floorHtml(m); if (a){ lastM = m; lastT = Date.now(); } } catch (_) {} return a + (prevMeet ? prevMeet(m, cls) : ""); };
  var prev = window.__bearSigHead;
  window.__bearSigHead = function(m){ var a = ""; try { if (!(lastM === m && Date.now() - lastT < 40) && !(Date.now() - allT < 40)) a = floorHtml(m); lastM = null; allT = 0; } catch (_) {} return a + (prev ? prev(m) : ""); };
  var css = document.createElement("style");
  css.textContent =
    ".fc{margin:8px 0 8px;padding:10px 10px 8px;border:1px solid var(--line,#e5e7eb);border-radius:12px;display:block;width:100%;box-sizing:border-box;text-align:left}" +
    ".fc-h{font-size:13px;font-weight:800;margin-bottom:6px}.fc-h small{font-size:11.5px;font-weight:600;color:var(--sub,#888);margin-left:4px}" +
    ".fc-v{font-size:15px;font-weight:900;line-height:1.4;padding:7px 9px;border-radius:9px;margin-bottom:8px;word-break:keep-all;background:rgba(127,127,127,.12);color:var(--text,#111)}" +
    ".fc-v.fc-orange{background:rgba(245,158,11,.16)}.fc-v.fc-yellow{background:rgba(234,179,8,.20)}.fc-v.fc-green{background:rgba(34,160,90,.18)}" +
    ".fc-g{display:grid;grid-template-columns:118px 1fr auto;column-gap:8px;align-items:center;margin:5px 0;font-size:12.5px;font-weight:700}" +
    ".fc-g span:first-child{word-break:keep-all}.fc-g b{font-size:14px;white-space:nowrap}" +
    ".fc-dots{display:flex;gap:4px;flex-wrap:nowrap;min-width:0}.fc-dots i{flex:1 1 0;max-width:22px;height:10px;border-radius:5px;background:rgba(127,127,127,.22);display:block}" +
    ".fc-dots i.fc-na{background:transparent;border:1px dashed rgba(127,127,127,.45)}.fc-bad{color:#b45309!important;white-space:normal!important}.fc-dots i.fc-on{background:#22a05a}.fc-dots i.fc-half{background:#f0b429}" +
    ".fc-chg{margin:6px 0 2px;font-size:12px;line-height:1.5;color:var(--text,#111);word-break:keep-all}" +
    ".fc-d{margin-top:4px}.fc-d summary{font-size:12px;color:var(--sub,#888);cursor:pointer;padding:6px 0;min-height:24px}" +
    ".fc-t{font-size:12px;font-weight:800;margin:8px 0 4px;color:var(--text,#111)}" +
    ".fc-ul{list-style:none;margin:0;padding:0}.fc-ul li{display:grid;grid-template-columns:20px 1fr;grid-template-areas:'i k' 'i d';column-gap:6px;padding:5px 0;border-top:1px solid var(--line,rgba(127,127,127,.18))}" +
    ".fc-ul li:first-child{border-top:0}.fc-i{grid-area:i;font-size:13px;font-weight:900;line-height:1.5;color:var(--sub,#888)}" +
    ".fc-ul li.fc-on .fc-i{color:#22a05a}.fc-ul li.fc-half .fc-i{color:#d99a0b}" +
    ".fc-ul b{grid-area:k;font-size:13px;line-height:1.5;word-break:keep-all}.fc-ul small{grid-area:d;font-size:11.5px;line-height:1.5;color:var(--sub,#888);word-break:keep-all;display:block}" +
    ".fc-ul small em{font-style:normal;opacity:.8;white-space:nowrap}" +
    ".fc-past{margin:2px 0 0;padding-left:16px}.fc-past li{font-size:11.5px;line-height:1.55;color:var(--sub,#888);margin:2px 0;word-break:keep-all;display:list-item}" +
    ".fa-sub{margin:10px 2px 2px;font-size:12px;font-weight:800;color:var(--sub,#888)}.fa{margin:8px 0}.fa-h{font-size:13px;font-weight:800;margin-bottom:4px}.fa-h small{font-size:11.5px;font-weight:600;color:var(--sub,#888);margin-left:4px}" +
    ".fa-r{border:1px solid var(--line,#e5e7eb);border-radius:11px;margin:5px 0;padding:0 9px;display:block}.fa-r>summary{display:grid;grid-template-columns:1fr auto;grid-template-areas:'n c' 'v v' 'x x';gap:2px 8px;align-items:center;padding:8px 0;cursor:pointer;list-style:none;min-height:44px}" +
    ".fa-r>summary::-webkit-details-marker{display:none}.fa-r>summary::after,.fa-r>summary::before{content:none!important;display:none!important}.fa-v::after{content:' ▾';font-weight:600;color:var(--sub,#888)}.fa-r[open] .fa-v::after{content:' ▴'}.fa-n{grid-area:n;font-size:13.5px;white-space:nowrap}.fa-c{grid-area:c;font-size:11.5px;color:var(--sub,#888);white-space:nowrap;text-align:right}.fa-c b{color:var(--text,#111);font-size:12.5px}" +
    ".fa-v{grid-area:v;font-size:12.5px;font-weight:800;word-break:keep-all}.fa-r[open]>summary{border-bottom:1px solid var(--line,rgba(127,127,127,.18))}.fa-r .fc{border:0;padding:8px 0 6px;margin:0}.fa-r .fc-h,.fa-r .fc-v{display:none}" +
    ".fa-x{grid-area:x;display:block;font-size:12px;line-height:1.55;font-weight:600;color:var(--text,#111);word-break:keep-all;margin-top:2px}.fa-x i{font-style:normal;color:var(--sub,#888);font-weight:400}.fa-xi{margin-right:3px}" +
    ".fa-up{color:#16803f}.fa-gt{font-weight:800}.fa-wn{color:#b45309;font-weight:600}.fa-late{display:block;font-style:normal;font-weight:500;font-size:11px;color:#b45309}.fa-p{display:block}.fa-p:empty{display:none}" +
    ".fa-pc{display:inline-flex;align-items:center;gap:3px;font-size:11.5px;font-weight:600;color:var(--sub,#888);margin-top:3px}.fa-pc i{font-style:normal;padding:1px 6px;border-radius:8px;border:1px solid rgba(127,127,127,.35);color:var(--sub,#888);font-weight:600}.fa-pc i.on{background:#1d4ed8;border-color:#1d4ed8;color:#fff;font-weight:800}.fa-pc u{text-decoration:none;opacity:.6}" +
    ".fa-top{margin:4px 0 8px;padding:8px 10px;border-radius:11px;background:rgba(29,78,216,.07)}.fa-top p{margin:3px 0;font-size:12.5px;line-height:1.5;word-break:keep-all;color:var(--text,#111)}.fa-top p span{display:block;font-size:11.5px;font-weight:700;color:var(--sub,#888)}.fa-top p.fa-topn{font-size:11px;color:var(--sub,#888);margin-top:6px}" +
    ".fc-pol:empty{display:none}.fc-pd{margin:2px 0 0;font-size:11.5px;line-height:1.6;color:var(--text,#111);word-break:keep-all}.fc-pd em{font-style:normal;color:var(--sub,#888);white-space:nowrap}.fc-t small{font-weight:600;color:var(--sub,#888)}" +
    ".fc-n{margin:8px 0 0;font-size:11px;line-height:1.5;color:var(--sub,#888);word-break:keep-all}";
  document.head.appendChild(css);
})();
