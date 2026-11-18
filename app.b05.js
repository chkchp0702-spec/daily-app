/* 📦 app.b05.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 5/7 (twin.js … today.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
/* ======== twin.js ======== */
/* 🧲 오늘과 닮은 날 — 과거 쌍둥이 5일 · 10/21 A10/21-2 (사용자 「다 좋다 다 진행해」)
   🎲 시장확률 › 🇰🇷 한국 카드의 「상태 한 줄」 자리를 바꿔 끼움: 오늘 모양(오늘 등락 · 전날 등락 · 5일 · 어제까지 20일 · 200일선 · 흔들림)과
   조건이 가장 많이 겹치는 2000년 이후 날짜 5개 + 「그날 → 20거래일 뒤」 코스피 선 5개를 겹쳐 그림 + 5일 중 몇 번 올랐나·최악.
   날짜를 누르면 그 날짜 한 줄(그 무렵 큰 사건 — 아래 EV 표, 모르면 비움).
   자료: archive/x/port_px/KOSPI.json(port_px.py · ^KS11 2000~ 종가) + 장중이면 prob.json 의 지금 등락(liveFix 뒤 m.intra_chg).
   원칙: 「닮은 정도 %」는 안 씀 — 조건 6개 중 몇 개가 같은지만. 같은 시기 날짜가 몰리지 않게 20거래일 띄움. 과거 이야기 · 미래 보장 아님. */
(function(){
  var KP = null, KW = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function load(){
    if (!KW) KW = getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return getJSON("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), {ttl: 3600e3});
    }).then(function(j){
      if (!j || !j.dd) return null;
      var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(day2s(t)); c.push(+j.c[i]); }
      KP = {d: d, c: c}; return KP;
    }).catch(function(){ return null; });
    return KW;
  }
  // 그 무렵 큰 사건 (달 단위 · 확실한 것만)
  var EV = {"2000-04": "닷컴 거품 붕괴 — 기술주 급락", "2000-05": "닷컴 거품 붕괴", "2001-09": "9·11 테러", "2003-03": "이라크 전쟁 개전", "2004-04": "중국 긴축 쇼크",
    "2004-05": "중국 긴축 쇼크", "2006-05": "신흥국 급락(미 금리 인상 우려)", "2006-06": "신흥국 급락(미 금리 인상 우려)", "2007-02": "중국 상하이 급락(2·27)", "2007-03": "중국 급락 뒤",
    "2007-08": "서브프라임 사태 시작", "2008-01": "서브프라임 확산 · 세계 증시 급락", "2008-09": "리먼 브러더스 파산", "2008-10": "금융위기 한가운데", "2008-11": "금융위기", "2008-12": "금융위기",
    "2009-03": "금융위기 바닥", "2010-05": "그리스 재정위기 · 플래시 크래시", "2010-11": "연평도 포격", "2011-08": "미국 신용등급 강등", "2011-09": "유럽 재정위기", "2011-10": "유럽 재정위기",
    "2013-06": "버냉키 「테이퍼」 발언", "2015-08": "중국 위안화 절하 충격", "2016-01": "중국 증시 급락 · 유가 폭락", "2016-02": "유가 바닥", "2016-06": "브렉시트 투표",
    "2016-11": "미국 대선(트럼프 당선)", "2018-02": "미국 변동성 급등", "2018-10": "미·중 무역분쟁 · 미 금리 급등", "2019-08": "미·중 무역분쟁 격화", "2020-02": "코로나 폭락 시작",
    "2020-03": "코로나 폭락", "2020-04": "코로나 뒤 반등", "2022-06": "미 물가 급등 · 금리 인상 가속", "2022-09": "강달러 · 영국 국채 혼란", "2023-03": "실리콘밸리은행 파산",
    "2024-08": "엔 캐리 청산 폭락(8·5)", "2024-12": "비상계엄 사태", "2025-04": "미국 상호관세 충격"};
  function feats(c, i){
    if (i < 251) return null;
    var r = function(a, b){ return (c[a] / c[b] - 1) * 100; }, s = 0;
    for (var k = i - 199; k <= i; k++) s += c[k];
    var sd = function(n){ var m = 0, q = 0, x; for (var k = i - n + 1; k <= i; k++) m += c[k] / c[k - 1] - 1; m /= n; for (var k2 = i - n + 1; k2 <= i; k2++){ x = c[k2] / c[k2 - 1] - 1 - m; q += x * x; } return Math.sqrt(q / (n - 1)); };
    return {r1: r(i, i - 1), r0: r(i - 1, i - 2), r5: r(i, i - 5), r20: r(i - 1, i - 21), up200: c[i] > s / 200, vr: sd(20) / sd(250)};
  }
  var CONDS = [
    ["r1", "오늘", function(a, b){ return a.r1 * b.r1 > 0 && Math.abs(a.r1 - b.r1) <= Math.max(1, 0.35 * Math.abs(a.r1)); }, function(f){ return sg(f.r1) + "%"; }],
    ["r0", "전날", function(a, b){ return a.r0 * b.r0 > 0 && Math.abs(a.r0 - b.r0) <= Math.max(1, 0.35 * Math.abs(a.r0)); }, function(f){ return sg(f.r0) + "%"; }],
    ["r5", "5일", function(a, b){ return Math.abs(a.r5 - b.r5) <= Math.max(2.5, 0.3 * Math.abs(a.r5)); }, function(f){ return sg(f.r5) + "%"; }],
    ["r20", "어제까지 20일", function(a, b){ return Math.abs(a.r20 - b.r20) <= Math.max(4, 0.3 * Math.abs(a.r20)); }, function(f){ return sg(f.r20) + "%"; }],
    ["up200", "200일선", function(a, b){ return a.up200 === b.up200; }, function(f){ return f.up200 ? "위" : "아래"; }],
    ["vr", "흔들림", function(a, b){ return Math.abs(a.vr - b.vr) <= Math.max(0.25, 0.3 * a.vr); }, function(f){ return "평소 ×" + f.vr.toFixed(1); }]];
  function dist(a, b){ return Math.abs(a.r1 - b.r1) / 2 + Math.abs(a.r0 - b.r0) / 2 + Math.abs(a.r5 - b.r5) / 5 + Math.abs(a.r20 - b.r20) / 8 + Math.abs(a.vr - b.vr) * 2 + (a.up200 === b.up200 ? 0 : 2); }
  function find(m){
    var d = KP.d.slice(), c = KP.c.slice(), live = false;
    // 오늘 봉: 장중이면 마지막 마감(base_date) 뒤를 지우고 지금 값으로 · 마감 뒤엔 파일 그대로(늦으면 prob 의 마감 값 붙임)
    var bd = m.base_date || d[d.length - 1];
    while (d.length && d[d.length - 1] > bd){ d.pop(); c.pop(); }
    if (d[d.length - 1] === bd && m.last) c[c.length - 1] = +m.last;
    else if (d[d.length - 1] < bd && m.last){ d.push(bd); c.push(+m.last); }
    if (m.open_now && m.intra_chg != null){ d.push(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)); c.push(c[c.length - 1] * (1 + m.intra_chg / 100)); live = true; }
    var T = c.length - 1, ft = feats(c, T); if (!ft) return null;
    var cand = [];
    for (var i = 251; i <= T - 21; i++){ var f = feats(c, i), n = 0, hit = {};
      CONDS.forEach(function(q){ if (q[2](ft, f)){ n++; hit[q[0]] = 1; } });
      if (n >= 3) cand.push({i: i, n: n, dx: dist(ft, f), f: f, hit: hit}); }
    cand.sort(function(a, b){ return b.n - a.n || a.dx - b.dx; });
    var pick = [];
    for (var j = 0; j < cand.length && pick.length < 5; j++){ var x = cand[j]; if (pick.every(function(p){ return Math.abs(p.i - x.i) >= 20; })) pick.push(x); }
    pick.forEach(function(p){ p.d = d[p.i]; p.path = []; for (var k = 0; k <= 20; k++) p.path.push((c[p.i + k] / c[p.i] - 1) * 100); p.r5 = p.path[5]; p.r20 = p.path[20]; });
    return {ft: ft, live: live, today: d[T], pick: pick, n: T - 271};
  }
  var COL = ["#e9c46a", "#f4a261", "#7c9cff", "#3dd6c6", "#d55181"];
  function svg(R){
    var W = 340, H = 140, lo = 0, hi = 0;
    R.pick.forEach(function(p){ p.path.forEach(function(v){ if (v < lo) lo = v; if (v > hi) hi = v; }); });
    lo = Math.floor(lo / 5) * 5 - 1; hi = Math.ceil(hi / 5) * 5 + 1;
    var X = function(k){ return 26 + (W - 70) * k / 20; }, Y = function(v){ return 8 + (H - 26) * (hi - v) / (hi - lo); };
    var g = "";
    for (var v = Math.ceil(lo / 5) * 5; v <= hi; v += 5){ g += '<line x1="26" x2="' + (W - 44) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" class="tw-gl' + (v === 0 ? " z" : "") + '"/><text x="22" y="' + (Y(v) + 3).toFixed(1) + '" class="tw-gt" text-anchor="end">' + (v > 0 ? "+" : "") + v + '</text>'; }
    [0, 5, 10, 15, 20].forEach(function(k){ g += '<text x="' + X(k).toFixed(1) + '" y="' + (H - 3) + '" class="tw-gt" text-anchor="middle">' + (k ? k + '일' : '그날') + '</text>'; });
    var ls = R.pick.map(function(p, i){ return '<path d="' + p.path.map(function(v, k){ return (k ? "L" : "M") + X(k).toFixed(1) + "," + Y(v).toFixed(1); }).join("") + '" stroke="' + COL[i] + '" class="tw-l" data-tw="' + i + '"/>' +
      '<text x="' + (X(20) + 4).toFixed(1) + '" y="' + (Y(p.path[20]) + 3).toFixed(1) + '" fill="' + COL[i] + '" class="tw-et">' + sg(p.path[20], 0) + '</text>'; }).join("");
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="tw-sv" role="img" aria-label="닮은 날 5개의 그 뒤 20거래일 코스피">' + g + ls + '</svg>';
  }
  function html(R){
    var ft = R.ft, P = R.pick;
    if (!P.length) return '<p class="note">조건 3개 넘게 겹치는 과거 날이 없어요 — 오늘은 2000년 이후 처음 보는 모양이에요.</p>';
    var up20 = P.filter(function(p){ return p.r20 > 0; }).length, avg = P.reduce(function(a, p){ return a + p.r20; }, 0) / P.length, worst = P.slice().sort(function(a, b){ return a.r20 - b.r20; })[0], best = P.slice().sort(function(a, b){ return b.r20 - a.r20; })[0];
    var up5 = P.filter(function(p){ return p.r5 > 0; }).length, yrs = {}; P.forEach(function(p){ yrs[p.d.slice(0, 4)] = 1; });
    return '<div class="tw-h">🧲 <b>오늘과 닮은 날</b> <span class="mut">2000년 이후 코스피 · 조건 6개 중 많이 겹치는 순 · ' + (R.live ? '지금 장중 값' : R.today.slice(5).replace("-", "/") + ' 마감') + ' 기준</span></div>' +
      '<div class="tw-cd">' + CONDS.map(function(q){ return '<span><small>' + q[1] + '</small>' + q[3](ft) + '</span>'; }).join("") + '</div>' +
      svg(R) +
      '<div class="tw-sum">20거래일 뒤 <b>' + P.length + '번 중 ' + up20 + '번 오름</b> · 평균 <b class="' + cl(avg) + '">' + sg(avg) + '%</b> · 최악 <b class="dn">' + sg(worst.r20) + '%</b>(' + worst.d.slice(2).replace(/-/g, ".") + ') · 최고 <b class="up">' + sg(best.r20) + '%</b>' +
        '<small>5거래일 뒤로는 ' + up5 + '번 오름' + (Object.keys(yrs).length === 1 ? ' · ⚠️ 5개가 다 ' + Object.keys(yrs)[0] + '년 — 표본 한 해' : '') + '</small></div>' +
      '<div class="tw-ls">' + P.map(function(p, i){ var ev = EV[p.d.slice(0, 7)];
        return '<button class="tw-r" data-tw="' + i + '"><i style="background:' + COL[i] + '"></i><span class="tw-d"><b>' + p.d.replace(/-/g, ".") + '</b><small>' + p.n + '/6 같음' + (ev ? ' · ' + e(ev) : '') + '</small></span>' +
          '<span class="tw-v"><small>5일</small><b class="' + cl(p.r5) + '">' + sg(p.r5) + '</b></span><span class="tw-v"><small>20일</small><b class="' + cl(p.r20) + '">' + sg(p.r20) + '</b></span></button>' +
          '<div class="tw-x" data-twx="' + i + '" hidden>그날 ' + CONDS.map(function(q){ return '<span class="' + (p.hit[q[0]] ? "y" : "n") + '">' + q[1] + ' ' + q[3](p.f) + '</span>'; }).join("") + '</div>'; }).join("") + '</div>' +
      '<p class="note tw-n">「닮음」은 조건 일치 개수일 뿐이에요 — 날짜 5개라 표본이 작고, 과거 이야기일 뿐 다음을 보장하지 않아요 · 줄을 누르면 그날 조건(같은 것 굵게).</p>';
  }
  window.twinKR = function(box, m){
    if (!box) return;
    box.innerHTML = '<div class="loading">닮은 날 찾는 중…</div>';
    load().then(function(K){
      if (!K){ box.innerHTML = '<p class="note pr-st">' + e(m.state || "") + '</p>'; return; }
      var R = null; try { R = find(m); } catch(x) { console.warn(x); }
      if (!R){ box.innerHTML = '<p class="note pr-st">' + e(m.state || "") + '</p>'; return; }
      box.innerHTML = html(R);
      [].forEach.call(box.querySelectorAll(".tw-r"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var i = b.getAttribute("data-tw"), x = box.querySelector('[data-twx="' + i + '"]'), on = x.hidden;
        x.hidden = !on; b.classList.toggle("on", on);
        [].forEach.call(box.querySelectorAll("path.tw-l"), function(p){ p.classList.toggle("dim", on && p.getAttribute("data-tw") !== i); }); }; });
    });
  };
  var css = document.createElement("style");
  css.textContent =
    ".tw-h{font-size:13.5px;margin:12px 0 6px}.tw-h .mut{font-size:12.5px}" +
    ".tw-cd{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:0 0 6px}.tw-cd span{background:var(--panel2);border-radius:8px;padding:4px 6px;font-size:12.5px;font-weight:700;font-variant-numeric:tabular-nums}.tw-cd small{display:block;font-size:12.5px;font-weight:400;color:var(--sub)}" +
    ".tw-sv{width:100%;height:auto;display:block}.tw-gl{stroke:var(--line);stroke-width:1}.tw-gl.z{stroke:var(--sub);stroke-dasharray:3 3}.tw-gt{fill:var(--sub);font-size:9.5px}.tw-l{fill:none;stroke-width:2;transition:opacity .15s}.tw-l.dim{opacity:.15}.tw-et{font-size:12.5px;font-weight:700}" +
    ".tw-sum{font-size:13px;margin:4px 0 6px}.tw-sum b.up{color:var(--up)}.tw-sum b.dn{color:var(--down)}.tw-sum small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".tw-r{display:flex;align-items:center;gap:8px;width:100%;border:0;border-top:1px solid var(--line);background:none;color:var(--text);font:inherit;text-align:left;padding:7px 0;cursor:pointer}.tw-r i{width:10px;height:10px;border-radius:50%;flex:none}" +
    ".tw-d{flex:1;min-width:0}.tw-d b{font-size:13px;font-variant-numeric:tabular-nums}.tw-d small{display:block;font-size:12.5px;color:var(--sub)}.tw-v{width:56px;text-align:right}.tw-v small{display:block;font-size:12.5px;color:var(--sub)}.tw-v b{font-size:13px;font-variant-numeric:tabular-nums}" +
    ".tw-v b.up{color:var(--up)}.tw-v b.dn{color:var(--down)}.tw-x{font-size:12.5px;color:var(--sub);padding:0 0 7px 18px}.tw-x span{margin-right:6px}.tw-x span.y{color:var(--text);font-weight:700}.tw-n{margin:6px 0 0}";
  document.head.appendChild(css);
})();
;
/* ======== threeway.js ======== */
/* ⚖️ 같은 돈, 세 갈래 길 — 채권·ELS·포트 3년 경주 · 10/21 A10/21-3 (사용자 「다 좋다 다 진행해」)
   🛍 상품 탭(채권·펀드·ELS) 맨 위 카드 하나: 같은 투자금을 3년 동안
     🇰🇷 채권 = 지금 파는 「매우 낮은 위험」 국채·공사채 중 남은 만기가 3년에 가장 가까운 것의 매수수익률(세전)로 → 금액 한 점
     🎯 ELS = 🎛 ELS 설계기 조건 그대로, 2006년부터 매 거래일 가입한 셈(els_design.js 엔진) × 그 조건에 가장 가까운 실제 청약 상품의 연 수익률
            일찍 끝나면 남은 기간은 위 채권 금리로 굴린 셈 · 만기에 손실이 아니면 원금만(더미 쿠폰은 안 넣음 — 보수적으로)
     💼 포트 = 🎛 포트 설계기 비중 + 💼 기본 규칙(port_design.js 엔진), 2008년부터 모든 3년(756거래일) 구간 · 달러 기준(환율 빼고)
   → 3년 뒤 금액의 범위(최악 · 열에 하나 · 가운데 · 열에 아홉 · 최고)를 같은 눈금에 나란히.
   투자금은 💼 포트 주문서와 같은 칸(portSet.amt)을 씀. 원칙: 실제 상품 값만 · 지어내지 않음 · 과거 계산 · 보장 아님 · 세금·수수료 전 · 사라는 말 없음. */
(function(){
  var H = 3, OPEN = 1, BOX = null, DATA = null, PORT = null, ELS = null, BUSY = 0;
  try { var o = localStorage.getItem("tw3open"); if (o != null) OPEN = +o; } catch(x) {}
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function getAmt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function setAmt(v){ try { var s = JSON.parse(localStorage.getItem("portSet") || "{}"); s.amt = v; localStorage.setItem("portSet", JSON.stringify(s)); } catch(x) {} }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 2).replace(/\.?0+$/, "") + "억" : Math.round(m).toLocaleString() + "만"; }
  function q(arr, p){ var i = (arr.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return arr[lo] + (arr[hi] - arr[lo]) * (i - lo); }
  function sum5(a){ a = a.slice().sort(function(x, y){ return x - y; }); return {min: a[0], p10: q(a, 0.1), p50: q(a, 0.5), p90: q(a, 0.9), max: a[a.length - 1], loss: a.filter(function(v){ return v < 0.9995; }).length / a.length * 100, n: a.length}; }

  function bond(D){
    var L = (D.krw || []).filter(function(r){ return /매우낮은/.test(r.risk || "") && (r.kind === "국채" || r.kind === "공사채·지방채") && r.buy > 0; })
      .map(function(r){ return {r: r, y: r.yrs + r.days / 365}; }).filter(function(x){ return x.y >= 2.5 && x.y <= 3.6; });
    L.sort(function(a, b){ return Math.abs(a.y - H) - Math.abs(b.y - H) || (a.r.kind === "국채" ? -1 : 1); });
    var b = L[0]; return b ? {name: b.r.name, kind: b.r.kind, y: b.r.buy, after: b.r.after, yrs: b.y, end: Math.pow(1 + b.r.buy / 100, H)} : null;
  }
  function portDist(){
    if (!window.__pdz) return Promise.resolve(null);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var c = __pdz.cfg(), w = __pdz.wts() || {SPY: .475, QQQ: .475, GLD: .05, BIL: 0};
      var r = __pdz.engine(A, w, {reg: c.reg, vol: c.vol, start: "2007-06-01"}); if (!r) return null;
      var N = r.nv.length, L = 756, ends = [];
      for (var i = 0; i + L < N; i++) ends.push(r.nv[i + L] / r.nv[i]);
      var s = sum5(ends); s.from = r.from; s.w = w; s.reg = c.reg; s.vol = c.vol; s.custom = !!__pdz.wts() && !(Math.abs(w.SPY - .475) < 1e-6 && Math.abs(w.QQQ - .475) < 1e-6 && Math.abs(w.GLD - .05) < 1e-6);
      return s;
    });
  }
  function elsDist(yb){
    var Z = window.__elsDz, API = window.__elsApi; if (!Z || !API) return Promise.resolve(null);
    return Promise.all([Z.ready(), API.load ? API.load() : null]).then(function(){ return Z.run(); }).then(function(st){
      if (!st || !st.raw) return {err: "설계기 조건으로 재생할 수 없어요(기초자산 일봉 부족)."};
      var nr = Z.near(), p = nr && nr[0]; if (!p || p.cpn == null) return {err: "이 조건과 비슷한 지금 청약 중 상품이 없어 연 수익률을 못 정해요 — 🎛 설계에서 조건을 바꿔 보세요."};
      var S = Z.st(), cyc = S.cyc, n = Z.bars().length, mat = n * cyc / 12, R = st.raw, cp = +p.cpn / 100, g = 1 + yb / 100, ends = [];
      for (var j = 0; j < R.done.length; j++){
        var k = R.done[j], amt, t;
        if (k >= 0){ t = (k + 1) * cyc / 12; amt = 1 + cp * t; }
        else { t = mat; var lossy = R.hasKi ? R.ki[j] : true; amt = lossy ? R.last[j] : 1; }
        ends.push(amt * Math.pow(g, Math.max(0, H - t)));
      }
      var s = sum5(ends); s.cpn = +p.cpn; s.iss = p.iss; s.pn = p.n; s.ua = S.ua.map(Z.lab).join("·"); s.br = Z.bars().join("-"); s.ki = S.ki; s.mat = mat; s.from = st.from;
      s.early = st.k[0]; return s;
    }).catch(function(){ return {err: "ELS 자료를 못 받았어요."}; });
  }

  function fan(rows, A){
    var lo = Infinity, hi = -Infinity;
    rows.forEach(function(r){ if (!r.s) return; if (r.s.min != null){ lo = Math.min(lo, r.s.min); hi = Math.max(hi, r.s.max); } else { lo = Math.min(lo, r.s.end); hi = Math.max(hi, r.s.end); } });
    lo = Math.min(lo, 1); hi = Math.max(hi, 1);
    var pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
    var W = 340, X = function(v){ return 8 + (W - 16) * (v - lo) / (hi - lo); }, rowH = 50, Hh = rows.length * rowH + 30;
    var g = '<line x1="' + X(1).toFixed(1) + '" x2="' + X(1).toFixed(1) + '" y1="4" y2="' + (Hh - 16) + '" class="t3-one"/><text x="' + X(1).toFixed(1) + '" y="' + (Hh - 4) + '" class="t3-gt" text-anchor="' + (X(1) < 50 ? "start" : "middle") + '">원금 ' + won(A) + '</text>';
    var tk = [], st = (hi - lo) > 2 ? 0.5 : 0.25;
    for (var v = Math.ceil(lo / st) * st; v <= hi; v += st){ if (Math.abs(v - 1) < 1e-9) continue; tk.push(v); }
    tk = tk.filter(function(v){ return Math.abs(X(v) - X(1)) > 46; });
    tk.forEach(function(v){ g += '<line x1="' + X(v).toFixed(1) + '" x2="' + X(v).toFixed(1) + '" y1="4" y2="' + (Hh - 18) + '" class="t3-gl"/><text x="' + X(v).toFixed(1) + '" y="' + (Hh - 4) + '" class="t3-gt" text-anchor="middle">' + won(A * v) + '</text>'; });
    rows.forEach(function(r, i){
      var y = 24 + i * rowH, s = r.s;
      g += '<text x="8" y="' + (y - 10) + '" class="t3-lb" fill="' + r.c + '">' + r.t + '</text>';
      if (!s) return;
      if (s.min == null){ g += '<path d="M' + X(s.end).toFixed(1) + ',' + (y - 7) + 'l7,7l-7,7l-7,-7z" fill="' + r.c + '"/><text x="' + (X(s.end) + 10).toFixed(1) + '" y="' + (y + 4) + '" class="t3-v" fill="' + r.c + '">' + won(A * s.end) + '</text>'; return; }
      g += '<line x1="' + X(s.min).toFixed(1) + '" x2="' + X(s.max).toFixed(1) + '" y1="' + y + '" y2="' + y + '" stroke="' + r.c + '" stroke-width="2" opacity=".55"/>' +
        '<rect x="' + X(s.p10).toFixed(1) + '" y="' + (y - 7) + '" width="' + Math.max(2, X(s.p90) - X(s.p10)).toFixed(1) + '" height="14" rx="7" fill="' + r.c + '" opacity=".35"/>' +
        '<line x1="' + X(s.min).toFixed(1) + '" x2="' + X(s.min).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" stroke="' + r.c + '" stroke-width="2"/><line x1="' + X(s.max).toFixed(1) + '" x2="' + X(s.max).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" stroke="' + r.c + '" stroke-width="2"/>' +
        '<circle cx="' + X(s.p50).toFixed(1) + '" cy="' + y + '" r="5.5" fill="' + r.c + '" stroke="var(--panel)" stroke-width="2"/>' +
        '<text x="' + X(s.p50).toFixed(1) + '" y="' + (y + 20) + '" class="t3-v" text-anchor="middle" fill="' + r.c + '">' + won(A * s.p50) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + Hh + '" class="t3-sv" role="img" aria-label="3년 뒤 금액 범위 비교">' + g + '</svg>';
  }
  function lane(ic, t, s, A, sub){
    if (!s) return '<div class="t3-l"><b>' + ic + ' ' + t + '</b><small class="mut">계산 중…</small></div>';
    if (s.err) return '<div class="t3-l"><b>' + ic + ' ' + t + '</b><small class="mut">' + e(s.err) + '</small></div>';
    if (s.min == null) return '<div class="t3-l"><b>' + ic + ' ' + t + ' <span>' + won(A * s.end) + '원</span></b><small>' + sub + '</small></div>';
    var tight = s.p90 - s.p10 < 0.005;
    return '<div class="t3-l"><b>' + ic + ' ' + t + ' <span>가운데 ' + won(A * s.p50) + '원</span></b>' +
      (tight ? '<small>열에 여덟 넘게가 <b>' + won(A * s.p50) + '</b> 언저리(일찍 끝나 같은 금액) · 최악 <b class="dn">' + won(A * s.min) + '</b> · 최고 ' + won(A * s.max) + ' · 3년 뒤 원금 밑 <b class="' + (s.loss >= 1 ? "dn" : "") + '">' + (s.loss < 0.5 && s.loss > 0 ? "1% 미만" : s.loss.toFixed(0) + "%") + '</b></small>' :
      '<small>열에 하나는 <b>' + won(A * s.p10) + '</b> 아래 · 열에 아홉은 <b>' + won(A * s.p90) + '</b> 아래 · 최악 <b class="dn">' + won(A * s.min) + '</b> · 최고 ' + won(A * s.max) + ' · 3년 뒤 원금 밑 <b class="' + (s.loss >= 1 ? "dn" : "") + '">' + (s.loss < 0.5 && s.loss > 0 ? "1% 미만" : s.loss.toFixed(0) + "%") + '</b></small>') +
      '<small class="mut">' + sub + '</small></div>';
  }
  function html(){
    var A = getAmt(), B = DATA ? bond(DATA) : null;
    if (!OPEN) return '<button class="t3-hd fold" data-t3t="1">⚖️ 같은 ' + won(A) + '원, 세 갈래 길 — 채권·ELS·포트 3년 뒤 <i class="fchev">▾</i></button>';
    var rows = [{c: "#3fb950", t: "🇰🇷 채권", s: B ? {end: B.end} : null}, {c: "#f4a261", t: "🎯 ELS", s: ELS && !ELS.err ? ELS : null}, {c: "#e9c46a", t: "💼 포트", s: PORT}];
    return '<button class="t3-hd fold open" data-t3t="1">⚖️ 같은 ' + won(A) + '원, 세 갈래 길 — 채권·ELS·포트 3년 뒤 <i class="fchev">▾</i></button>' +
      '<section class="card t3"><div class="t3-amt">투자금 ' + [1e7, 3e7, 5e7, 1e8].map(function(v){ return '<button data-t3a="' + v + '" class="' + (v === A ? "on" : "") + '">' + won(v) + '</button>'; }).join("") + '<small>💼 포트 주문서와 같은 칸</small></div>' +
      fan(rows, A) +
      '<div class="t3-key"><span><i class="d"></i>점 = 가운데</span><span><i class="b"></i>굵은 띠 = 열에 하나 ~ 열에 아홉</span><span><i class="w"></i>가는 선 = 최악 ~ 최고</span></div>' +
      lane("🇰🇷", "채권", B ? {end: B.end} : {err: "3년 안팎 「매우 낮은 위험」 채권을 못 찾았어요."}, A, B ? e(B.name) + ' · 남은 ' + B.yrs.toFixed(1) + '년 · 매수수익률 연 ' + B.y.toFixed(2) + '%(세후 ' + (B.after != null ? B.after.toFixed(2) + '%' : '–') + ') · 만기까지 들고 있으면 이 값에 거의 고정' : '') +
      lane("🎯", "ELS", ELS, A, ELS && !ELS.err ? '🎛 설계기 조건 ' + e(ELS.ua) + ' · ' + e(ELS.br) + (ELS.ki != null ? ' · KI ' + ELS.ki : ' · 노낙인') + ' · 연 ' + ELS.cpn.toFixed(2) + '%(가장 가까운 실제 상품 · ' + e(ELS.iss) + ') · ' + e(ELS.from) + '~ 가입 ' + ELS.n.toLocaleString() + '번 · 일찍 끝나면 남은 기간은 채권 금리로' : '') +
      lane("💼", "포트", PORT, A, PORT ? (PORT.custom ? '🎛 포트 설계기 비중' : '💼 기본 포트 비중') + ' · ' + (PORT.reg ? '200일선 방어' : '방어 끔') + ' · ' + (PORT.vol ? '변동성 맞춤' : '맞춤 끔') + ' · ' + PORT.from.slice(0, 7).replace("-", ".") + '~ 모든 3년 구간 ' + PORT.n.toLocaleString() + '개 · 달러 기준(환율 빼고)' : '') +
      '<p class="note t3-n">셋은 위험이 달라요 — 띠가 넓을수록 결과가 크게 갈렸다는 뜻. 과거 계산이고 미래를 보장하지 않아요 · 세금·수수료 전 · 비교용일 뿐 가입·매수하라는 뜻이 아니에요. 조건은 🎯 ELS › 🎛 설계, 💼 포트 › 🎛 포트 설계기에서 바꾸면 여기도 따라 바뀌어요.</p></section>';
  }
  function paint(){
    if (!BOX || !document.body.contains(BOX)) return;
    BOX.innerHTML = html();
    [].forEach.call(BOX.querySelectorAll("[data-t3t]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); OPEN = OPEN ? 0 : 1; try { localStorage.setItem("tw3open", OPEN); } catch(x) {} paint(); if (OPEN) calc(); }; });
    [].forEach.call(BOX.querySelectorAll("[data-t3a]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); setAmt(+b.getAttribute("data-t3a")); paint(); }; });
  }
  function calc(){
    if (!OPEN || BUSY) return; BUSY = 1;
    var B = DATA && bond(DATA), yb = B ? B.y : 3.5;
    Promise.all([portDist(), elsDist(yb)]).then(function(r){ PORT = r[0]; ELS = r[1]; BUSY = 0; paint(); }, function(){ BUSY = 0; });
  }
  var T = null;
  window.__tw3 = function(){ if (!BOX || !OPEN) return; clearTimeout(T); T = setTimeout(function(){ ELS = null; calc(); }, 250); };   // 설계기에서 조건을 바꾸면
  window.threeWay = function(box, D){ BOX = box; DATA = D; paint(); calc(); };

  var css = document.createElement("style");
  css.textContent =
    ".t3-hd{margin:0 0 8px;display:flex;justify-content:space-between;align-items:center;width:100%;cursor:pointer;font-weight:700}.t3-hd .fchev{font-style:normal;transition:transform .15s}.t3-hd.open .fchev{transform:rotate(180deg)}" +
    ".t3-amt{display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:12.5px;margin:0 0 6px}.t3-amt button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer}.t3-amt button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:700}.t3-amt small{color:var(--sub);font-size:12.5px}" +
    ".t3-sv{width:100%;height:auto;display:block;margin:2px 0}.t3-gl{stroke:var(--line);stroke-width:1}.t3-one{stroke:var(--sub);stroke-width:1;stroke-dasharray:3 3}.t3-gt{fill:var(--sub);font-size:9.5px}.t3-v{font-size:12.5px;font-weight:700}.t3-lb{font-size:12.5px;font-weight:700}" +
    ".t3-key{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:12.5px;color:var(--sub);margin:0 0 6px}.t3-key i{display:inline-block;margin-right:4px;vertical-align:middle;background:var(--sub)}.t3-key i.d{width:8px;height:8px;border-radius:50%}.t3-key i.b{width:16px;height:7px;border-radius:4px;opacity:.5}.t3-key i.w{width:16px;height:2px}" +
    ".t3-l{padding:7px 0;border-top:1px solid var(--line);font-size:13px}.t3-l>b span{float:right;font-variant-numeric:tabular-nums}.t3-l small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.45}.t3-l small b{color:var(--text)}.t3-l small b.dn{color:var(--down)}.t3-n{margin:6px 0 0}";
  document.head.appendChild(css);
})();
;
/* ======== tidy.js ======== */
/* CH Investing — 🧹 한눈에 보기 (10/14 밤)
   사용자: "글이 많으면 가독성이 떨어져. 내용을 없애라는 게 아니고, 심플한 틀을 유지하되 추가 내용·설명은 탭하면 나오고 다시 접게 — 전체 다"
   그려진 화면을 살펴보고 덧입힌다 (다른 화면 코드는 그대로):
   ① 설명 글(.note · 카드 속 작은 회색 설명 줄)  → 「ⓘ 첫 마디…」 한 줄로. 누르면 펼침, 다시 누르면 접힘
   ② 목록이 길면(같은 모양 줄 8개 넘음) → 6개만 + 「＋N개 더 보기」 / 「접기」
   ③ 종목 칩 줄이 길면(10개 넘음) → 8개만 + 「＋N」
   ④ ⚙️ 설정의 「🧹 한눈에 보기」 끄면 예전처럼 다 펼침 (휴대폰에 기억)
   지키는 것: 숫자 한 줄짜리 짧은 설명(40자 아래)·경고(⚠)·장중 표시 같은 핵심 줄은 그대로 보임. 펼친 것은 다시 그려져도 펼친 채로. */
(function(){
  var OFF = false;
  try { OFF = localStorage.getItem("tidyOff") === "1"; } catch(x) {}
  var OPEN = {}, MORE = {};
  // 설명 글로 보는 칸 (10/14 밤 탭별 점검으로 모음: 홈 어제 예고 풀이 · 시장 집중 근거 · 국면 신호판 풀이 · 포트 설명 · 성적 풀이 · 거르기 종목 풀이 · 피드 본문)
  // 10/15 A10-2: 「→ 결론」 줄(.mk-so)은 설명이 아니라 카드의 결론이라 뺌 — ux1015b.js 가 2줄까지 보이고 눌러 펼침
  var NOTE_SEL = [".note", ".pr-ev", ".ps-sub", ".pr-eb", ".sc-few", ".wp-why > div", ".hero2 .mut", ".card small.mut", ".card p.mut", ".card .sub-note",
    ".hm-gr small", ".fo-why", ".fo-lag", ".fo-stop", ".fo-sub .mut", ".rb-bt", ".rb-r > p", ".cp-sum", ".cn-n", ".cn-n2", ".cn-d > p", ".tm-n",
    ".sc-li", ".st .tm", ".fd-tx", ".br-bi em", ".xp-in > p"].join(", ");
  var KEEP = ".keep, .lvoff, .pr-st, .tidy-keep, .clp-btn, nav *, header *, #bnav *, .tabs *, .ch-toast, .tip, .tt-x";
  var ROWS = ".xr, .ss-r, .sc-li, .lv-r, .pt, .ps-t, .pr-hw, .wp-r, .hl, .fd-it, .fd-grp, .feed-item, .op-row, .mg-r, .row-item";

  function txt(el){ return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function key(el){ return txt(el).slice(0, 48); }
  function important(t){ return /^(⚠|❗|🚨|경고|오류|실패|지금은 장중|휴장|지연)/.test(t); }   // 맨 앞이 경고일 때만 그대로 둠

  // ① 설명 줄 → 한 줄 접기
  function foldNote(el){
    if (el.dataset.td) return;
    if (el.matches(KEEP) || el.closest(".tidy-x,.clp-open,[contenteditable],form,.sheet-top,.sh-top")) return;
    if (el.querySelector("button,input,select,svg,canvas,table,img,a[href^='javascript'],[data-goto],.btn")) return;
    if (el.parentElement && el.parentElement.closest("[data-td='n']")) return;     // 바깥이 이미 접힘
    var t = txt(el);
    if (t.length < 46 || important(t)) return;
    el.dataset.td = "n";
    // clamp.js 가 먼저 「더 보기」를 붙였으면 걷어 냄 (한 가지 방식으로만)
    var nx = el.nextElementSibling;
    if (nx && nx.classList.contains("clp-btn")) nx.remove();
    el.classList.remove("clp"); el.style.maxHeight = ""; el.dataset.clp = "1";
    var k = key(el);
    el.classList.add("td-n");
    var set = function(o){ el.classList.toggle("td-open", o); el.setAttribute("aria-expanded", o ? "true" : "false"); };
    set(!!OPEN[k]);
    el.addEventListener("click", function(ev){
      if (OFF) return;
      if (ev.target.closest("a,button")) return;
      ev.stopPropagation();
      OPEN[k] = !OPEN[k]; set(OPEN[k]);
    });
  }

  // ② 같은 모양 줄이 길게 이어지면 6개만
  function foldRows(box){
    if (box.dataset.tdr) return;
    var kids = [].filter.call(box.children, function(c){ return c.matches(ROWS); });
    if (kids.length <= 8) return;
    box.dataset.tdr = "1";
    var k = (box.closest("section,.card") ? key(box.closest("section,.card").querySelector("h3,h2,.sub2") || box) : "") + "|" + key(kids[0]).slice(0, 16);
    var extra = kids.slice(6);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "td-more";
    var set = function(o){ extra.forEach(function(c){ c.classList.toggle("td-hide", !o); }); btn.textContent = o ? "접기 ▴" : "＋" + extra.length + "개 더 보기 ▾"; };
    btn.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); MORE[k] = !MORE[k]; set(MORE[k]);
      if (!MORE[k]){ var r = box.getBoundingClientRect(); if (r.top < 0) box.scrollIntoView({block: "start", behavior: "smooth"}); } };
    extra[extra.length - 1].insertAdjacentElement("afterend", btn);
    set(!!MORE[k]);
  }

  // ③ 칩 줄
  function foldChips(box){
    if (box.dataset.tdc) return;
    var kids = [].filter.call(box.children, function(c){ return c.matches("a,span,button") && !c.classList.contains("td-chipmore"); });
    if (kids.length <= 10) return;
    box.dataset.tdc = "1";
    var k = "c|" + key(box).slice(0, 30);
    var extra = kids.slice(8);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "td-chipmore";
    var set = function(o){ extra.forEach(function(c){ c.classList.toggle("td-hide", !o); }); btn.textContent = o ? "접기" : "＋" + extra.length; };
    btn.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); MORE[k] = !MORE[k]; set(MORE[k]); };
    box.appendChild(btn);
    set(!!MORE[k]);
  }

  function scan(){
    if (OFF) return;
    var root = document.querySelectorAll("#main, #sheet");
    [].forEach.call(root, function(r){
      [].forEach.call(r.querySelectorAll(NOTE_SEL), function(el){ try { if (el.offsetParent !== null || el.closest("[hidden]") === null) foldNote(el); } catch(x) {} });
      var boxes = new Set();
      [].forEach.call(r.querySelectorAll(ROWS), function(el){ if (el.parentElement) boxes.add(el.parentElement); });
      boxes.forEach(function(b){ try { foldRows(b); } catch(x) {} });
      [].forEach.call(r.querySelectorAll(".cp-sts, .chips, .sc-gb > div"), function(b){ try { foldChips(b); } catch(x) {} });
    });
  }

  // ④ 설정 스위치 — ⚙️ 안 (있으면) · 없으면 전역 함수로
  window.tidyScan = function(){ scan(); };
  window.tidySet = function(on){ OFF = !on; try { localStorage.setItem("tidyOff", OFF ? "1" : "0"); } catch(x) {}
    document.documentElement.classList.toggle("td-off", OFF); if (!OFF) scan(); };
  document.documentElement.classList.toggle("td-off", OFF);
  function addSwitch(){
    var host = document.querySelector("#uiset");
    if (!host || host.querySelector(".td-sw")) return;
    var d = document.createElement("label"); d.className = "td-sw";
    d.innerHTML = '<input type="checkbox"' + (OFF ? "" : " checked") + '> 🧹 한눈에 보기 <small>설명·긴 목록을 접어 두기</small>';
    d.querySelector("input").onchange = function(){ window.tidySet(this.checked); };
    host.appendChild(d);
  }

  var st = document.createElement("style");
  st.textContent =
    // 설명 한 줄: 앞에 ⓘ, 한 줄 말줄임, 누르면 전체
    ":root:not(.td-off) .td-n{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;line-clamp:1;position:relative;overflow:hidden;min-width:0;max-width:100%;box-sizing:border-box;word-break:break-all;cursor:pointer;padding-left:18px !important;-webkit-tap-highlight-color:transparent;opacity:.85}" +
    ":root:not(.td-off) .td-n::before{content:'ⓘ';position:absolute;left:2px;top:0;font-style:normal;color:var(--acc,#7c9cff);font-weight:700}" +
    ":root:not(.td-off) .td-n.td-open{display:block;-webkit-line-clamp:unset;line-clamp:unset;overflow:visible;word-break:keep-all;opacity:1}" +
    ":root:not(.td-off) .td-n.td-open::after{content:' 접기 ▴';color:var(--acc,#7c9cff);font-weight:700;font-size:.95em}" +
    ":root:not(.td-off) .td-hide{display:none !important}" +
    ".td-off .td-more,.td-off .td-chipmore{display:none}" +
    ".td-more{display:block;width:100%;margin:6px 0 2px;padding:8px;border:1px dashed var(--line);border-radius:10px;background:transparent;color:var(--sub);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".td-chipmore{display:inline-flex;align-items:center;padding:4px 10px;border:1px dashed var(--line);border-radius:999px;background:transparent;color:var(--sub);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".td-sw{display:flex;align-items:center;gap:8px;padding:10px 4px;font-size:14px}.td-sw small{color:var(--sub);font-size:12.5px}" +
    // 숨 쉴 틈: 카드 안 설명과 다음 덩어리 사이 여백을 살짝 넓힘
    ":root:not(.td-off) .card .sub2{margin-top:16px}";
  document.head.appendChild(st);

  var t = null;
  function later(){ if (t) return; t = setTimeout(function(){ t = null; try { scan(); addSwitch(); } catch(e) {} }, 350); }
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length){ later(); return; } })
    .observe(document.body || document.documentElement, {childList: true, subtree: true});
  window.addEventListener("hashchange", later);
  later();
})();
;
/* ======== smooth.js ======== */
/* CH Investing — 🪟 매끄럽게 열고 닫기 (10/15)
   사용자: "누르는 칸이나 탭이 있으면 매끄럽게 연결하고 다시 닫을 수 있게"
   ① 카드·줄·칩을 누르면(data-goto) 지금 화면은 그대로 두고, 그 화면을 아래에서 올라오는 「창」으로 연다.
      닫기 = ✕ · 위 손잡이를 아래로 끌기 · 바깥(어두운 곳) 누르기 · 휴대폰 뒤로가기 · 오른쪽 아래 「뒤로」 → 보던 자리 그대로.
      창 안에서 「전체 화면 ⤢」 를 누르면 그 탭으로 완전히 넘어감.
   ② 아래 탭 바·위 작은 탭으로 화면을 바꿀 때 살짝 밀려 들어오는 움직임.
   창 속은 같은 앱을 ?embed=1 로 연 것 (머리·아래 탭 없이) — 화면 코드를 따로 고칠 필요 없음. */
(function(){
  var EMBED = /[?&]embed=1/.test(location.search);
  var D = document.documentElement;

  /* ---------- 창 안 (embed) ---------- */
  if (EMBED){
    D.classList.add("embed");
    var s = document.createElement("style");
    s.textContent = ".embed header,.embed #bnav,.embed #backbtn,.embed #tabs,.embed .tabs,.embed #netbar,.embed .a2hs{display:none!important}" +
      ".embed body{padding-top:6px!important;padding-bottom:30px!important}.embed #main{padding-top:0!important;margin-top:0!important}" +
      ".embed #main > .hero{display:none!important}";
    document.head.appendChild(s);
    // 창 안에서 또 누르면 창 안에서 그대로 이동 (창을 겹겹이 열지 않음) · 부모에 제목 알려 주기
    var tell = function(){ try { parent.postMessage({peek: "title", t: (document.querySelector("#main > .hero h1") || {}).textContent || ""}, "*"); } catch(x) {} };
    new MutationObserver(function(){ clearTimeout(tell.t); tell.t = setTimeout(tell, 120); }).observe(document.body || D, {childList: true, subtree: true});
    return;
  }

  /* ---------- ① 창 ---------- */
  var LAB = {home: "🏠 오늘", market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", port: "💼 포트", score: "📊 성적표",
             whale: "🐋 고래", cup: "☕ 컵", gap: "📈 갭", screen: "🔎 거르기", feed: "📰 피드", accum: "🤫 매집", danta: "⚡ 단타", alarm: "🔔 알림", idea: "💬 의견함", onepager: "📄 종목"};
  var PK = null, SAVED = null;
  function peekOpen(target){
    if (PK) return;
    var p = target.split("~"), tab = p[0];
    var wrap = document.createElement("div");
    wrap.id = "peek";
    wrap.innerHTML = '<div class="pk-bg"></div><div class="pk-sh"><div class="pk-top"><i class="pk-grip"></i>' +
      '<b class="pk-t">' + (LAB[tab] || "") + '</b><button type="button" class="pk-full">전체 화면 ⤢</button><button type="button" class="pk-x" aria-label="닫기">✕</button></div>' +
      '<div class="pk-load"><i></i></div><iframe class="pk-f" src="index.html?embed=1&v=' + encodeURIComponent(window.APPV || "") + '#' + encodeURIComponent(tab) + (p[1] ? "~" + encodeURIComponent(p[1]) : "") + '"></iframe></div>';
    document.body.appendChild(wrap);
    D.classList.add("peek-on");
    var f = wrap.querySelector(".pk-f");
    f.addEventListener("load", function(){ setTimeout(function(){ wrap.classList.add("ready"); }, 250); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ wrap.classList.add("on"); }); });
    PK = {el: wrap, target: target};
    // 휴대폰 뒤로가기로 닫히게: 지금 기록을 「창 아래」로 표시해 두고 창 기록 하나를 얹음
    try {
      SAVED = history.state;
      history.replaceState(Object.assign({}, SAVED || {}, {t: "xs", _pk: 1}), "");
      history.pushState({t: "peek", d: ((SAVED && SAVED.d) || 0) + 1}, "", location.pathname + location.hash);
    } catch(x) {}
    wrap.querySelector(".pk-x").onclick = function(){ peekClose(); };
    wrap.querySelector(".pk-bg").onclick = function(){ peekClose(); };
    wrap.querySelector(".pk-full").onclick = function(){ var t = PK.target; peekClose(true, function(){ var q = t.split("~"); if (window.goTo) goTo(q[0], q[1]); else go(q[0]); }); };
    drag(wrap.querySelector(".pk-top"), wrap.querySelector(".pk-sh"));
  }
  function peekClose(fromNav, after){
    if (!PK) return;
    var el = PK.el; PK = null;
    el.classList.remove("on"); D.classList.remove("peek-on");
    setTimeout(function(){ el.remove(); if (after) after(); }, 260);
    if (!fromNav || fromNav === true){
      // 얹은 기록 하나를 걷어 냄 (뒤로가기 한 번 = 창 닫힘)
      try { if (history.state && history.state.t === "peek"){ history.back(); } } catch(x) {}
    }
  }
  window.addEventListener("popstate", function(ev){
    if (PK){ peekClose("nav"); }
    if (ev.state && ev.state._pk){                    // 창 아래 기록으로 돌아옴 → 원래 기록으로 되돌려 둠 (화면은 그대로)
      try { history.replaceState(SAVED, ""); } catch(x) {}
      if (window.updBack) try { updBack(); } catch(x) {}
    }
  });
  // 손잡이를 아래로 끌어 닫기
  function drag(handle, sheet){
    var y0 = null, dy = 0;
    handle.addEventListener("touchstart", function(e){ y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = "none"; }, {passive: true});
    handle.addEventListener("touchmove", function(e){ if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = "translateY(" + dy + "px)"; }, {passive: true});
    handle.addEventListener("touchend", function(){ sheet.style.transition = ""; if (dy > 90) peekClose(); else sheet.style.transform = ""; y0 = null; });
  }
  // 창 안 제목
  window.addEventListener("message", function(ev){ if (!PK || !ev.data || ev.data.peek !== "title" || !ev.data.t) return; var t = PK.el.querySelector(".pk-t"); if (t) t.textContent = ev.data.t.trim(); });
  // 「뒤로」 버튼도 창부터 닫기
  function wrapBack(){ var cur_ = window.goBack; if (cur_ && !cur_.__pk){ var w = function(){ if (PK){ peekClose(); return; } return cur_.apply(this, arguments); }; w.__pk = 1; window.goBack = w; } }
  wrapBack(); window.addEventListener("load", function(){ setTimeout(wrapBack, 300); });

  // 카드·줄·칩 누르기 → 창 (종목 이름 data-op 은 지금처럼 종목 화면) · 같은 탭 안 이동은 그대로
  document.addEventListener("click", function(ev){
    if (ev.defaultPrevented || !ev.target.closest) return;
    if (ev.target.closest("[data-op], a[href], input, select, label, textarea, [data-share], .hm-sh, .cz.cz-on")) return;   // 🔧 11/05: 접힌 카드(calm.js)는 누르면 펼치기만 — 카드 자체가 data-goto 인 🏠 「내 포트」 띠는 펼침+💼 창이 같이 열렸음
    var t = ev.target.closest("[data-goto]"); if (!t) return;
    // 10/19: 카드 안의 단추·링크(접기·펼치기·전체 보기 등)를 누르면 카드 전체 이동(data-goto)을 하지 않음
    var ctl = ev.target.closest("button,a,summary,input,select,label,.fold"); if (ctl && !ctl.hasAttribute("data-goto") && t !== ctl && t.contains(ctl)) return;
    var btn = ev.target.closest("button");
    if (btn && btn !== t && !btn.hasAttribute("data-goto") && t.contains(btn)) return;     // 카드 안 자기 버튼(👍·공유 등)은 그대로
    var g = t.getAttribute("data-goto") || ""; var tab = g.split("~")[0];
    if (!tab || tab === window.cur) return;                       // 같은 탭 안 → 원래대로 (그 카드로 스크롤)
    if (t.closest(".ttx,.tip,#sheet")) return;                    // 설명 풍선·옛 시트 안 링크는 원래대로
    ev.preventDefault(); ev.stopPropagation();
    peekOpen(g);
  }, true);

  /* ---------- ② 탭 바꿀 때 밀려 들어오는 움직임 ---------- */
  var ORDER = ["home", "market", "sector", "prob", "port", "score", "whale", "cup", "gap", "screen", "feed"];
  function hookGo(){
    if (typeof window.go !== "function" || window.go.__pk) return;
    var g0 = window.go;
    var w = function(key){
      var from = window.cur, r = g0.apply(this, arguments);
      try {
        var m = document.getElementById("main");
        if (m && from && from !== key){
          var dir = ORDER.indexOf(key) >= ORDER.indexOf(from) ? 1 : -1;
          m.style.setProperty("--pk-dx", (dir * 22) + "px");
          m.classList.remove("pg-in"); void m.offsetWidth; m.classList.add("pg-in");
        }
      } catch(x) {}
      return r;
    };
    w.__pk = 1; window.go = w;
  }
  hookGo(); window.addEventListener("load", hookGo);

  var st = document.createElement("style");
  st.textContent =
    "#peek{position:fixed;inset:0;z-index:9000;pointer-events:none}" +
    "#peek .pk-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);opacity:0;transition:opacity .25s;pointer-events:auto}" +
    "#peek.on .pk-bg{opacity:1}" +
    "#peek .pk-sh{position:absolute;left:0;right:0;bottom:0;height:92vh;height:92dvh;background:var(--bg);border-radius:18px 18px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.35);transform:translateY(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto}" +
    "#peek.on .pk-sh{transform:translateY(0)}" +
    "#peek .pk-top{position:relative;display:flex;align-items:center;gap:8px;padding:16px 12px 10px;border-bottom:1px solid var(--line);touch-action:none}" +
    "#peek .pk-grip{position:absolute;left:50%;top:6px;width:38px;height:5px;margin-left:-19px;border-radius:3px;background:var(--line)}" +
    "#peek .pk-t{flex:1;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "#peek .pk-full{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:6px 11px;font:inherit;font-size:12.5px;font-weight:700}" +
    "#peek .pk-x{width:34px;height:34px;border-radius:50%;border:0;background:var(--panel2,var(--panel));color:var(--text);font-size:16px;font-weight:700}" +
    "#peek .pk-f{flex:1;width:100%;border:0;background:var(--bg);opacity:0;transition:opacity .2s}" +
    "#peek.ready .pk-f{opacity:1}#peek.ready .pk-load{display:none}" +
    "#peek .pk-load{position:absolute;top:50%;left:50%;width:28px;height:28px;margin:-14px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--acc,#7c9cff);animation:pkspin .8s linear infinite}" +
    "@keyframes pkspin{to{transform:rotate(360deg)}}" +
    ".peek-on body{overflow:hidden}" +
    "#main.pg-in{animation:pgin .24s cubic-bezier(.2,.8,.2,1)}" +
    "@keyframes pgin{from{opacity:.0;transform:translateX(var(--pk-dx,16px))}to{opacity:1;transform:none}}" +
    // 누를 수 있는 것은 누를 때 살짝 눌림 — 연결된다는 느낌
    "[data-goto],.hm-chi,.hm-c,.sc-c{transition:transform .12s,background-color .12s;-webkit-tap-highlight-color:transparent}" +
    "[data-goto]:active,.hm-chi:active{transform:scale(.985);background-color:color-mix(in srgb,var(--acc,#7c9cff) 8%,transparent)}" +
    "@media (prefers-reduced-motion: reduce){#main.pg-in{animation:none}#peek .pk-sh{transition:none}}";
  document.head.appendChild(st);
})();
;
/* ======== calm.js ======== */
/* CH Investing — 🧹 차분하게 (10/21 사용자 「앱이 너무 복잡하고 산만하다는 지적 — 다 진행해」)
   ② 결론 → 근거 2층: 시황·나침반·포트·시장확률 탭은 맨 위 결론 카드만 펼치고, 나머지 카드는 제목 한 줄로 접음(누르면 펼침 · 휴대폰에 기억)
   ③ 이모지 줄이기: 카드 제목은 이모지 1개까지 · 본문의 꾸밈 이모지는 뺌(🟢🔴·나라 국기·신호 출처 🐋☕📈 같은 뜻 있는 표시는 그대로) · 📖 용어 풀이
   ④ 정직 계산 칩(검증 숫자)은 📊 성적표에서만 — 다른 탭에선 숨김
   ⑤ 숫자·날짜 한 규칙: 등락(부호 있는 %)은 소수 1자리 · 금리·수익률은 2자리까지 · 올해 날짜는 10/19 식
   다른 화면 코드는 건드리지 않고, 그려진 뒤 살펴보고 덧입힘. 숫자는 표기만 바꾸고 값은 그대로. */
(function(){
  var D = document.documentElement;
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }

  /* ---------- 지금 탭 표시 (④ CSS 용) ---------- */
  var _dt = window.drawTabs;
  window.drawTabs = function(){ var r = _dt ? _dt.apply(this, arguments) : undefined; try { D.setAttribute("data-tab", window.cur || ""); } catch(x) {} return r; };

  /* ---------- ② 결론 → 근거 ---------- */
  // 탭별 「결론」 카드(제목에 이 말) — 이것만 펼쳐 둠. 나머지 맨 위 단계 카드는 제목 한 줄
  var KEEP = {
    market: /오늘 할 일|아침판/,
    sector: /국면 신호판|장중 나침반/,
    port:   /부터 성적/,
    score:  /^$/,             // 11/05 성적표(포트 묶음)도 전부 접음
    prob:   /오를 확률/,
    whale:  /TOP 10/,          // ⑥ 신호 탭: 오늘 볼 것 하나만 펼치고 나머지 상세는 한 단계 아래로
    cup:    /돌파 임박/,
    gap:    /오늘 갭 지도/,
    home:   /5개 시장|업종 지도|오늘의 한 장|1탭 예측/   // 🔍 11/05 A2 홈은 4장만 펼침(나머지는 제목 한 줄)
  };
  // 11/05 사용자 「시장·포트에서 펼쳐져 있는 것들 처음엔 닫아 놓고 — 펼치기 했을 때만 보이게」
  //   · 결론 카드(오늘 할 일·성적 등)도 처음엔 접음 · 펼친 기억은 이번 방문(sessionStorage) 동안만 → 다음에 앱을 열면 다시 전부 접힘
  var ALL_FOLD = {market: 1, sector: 1, prob: 1, port: 1, score: 1};   // 시장·포트 묶음만 결론 카드까지 접음
  var OPEN = {}; try { OPEN = JSON.parse(sessionStorage.getItem("czopen") || "{}") || {}; } catch(x) {}
  try { localStorage.removeItem("czopen"); } catch(x) {}
  function keepOpen(){ try { sessionStorage.setItem("czopen", JSON.stringify(OPEN)); } catch(x) {} }
  var EMO = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})[️‍\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}]*/gu;
  function titleOf(c){
    if (c.dataset && c.dataset.czt) return c.dataset.czt;
    if (c.id === "tdhero") return "🌤 지금 시장 날씨";
    var h = c.querySelector(":scope > h3, :scope > .hm-h b, :scope > .sc-h b, :scope > summary, :scope > .sec");
    var t = (h ? h.textContent : String(c.innerText || "").split("\n").filter(function(x){ return x.trim(); })[0] || "").replace(/ⓘ/g, "").replace(/\s+/g, " ").trim();
    if (!t || /^[\d+\-−.,%\s]+$/.test(t)) return "";      // 숫자만 있는 타일은 제목 아님
    return t.length > 38 ? t.slice(0, 36) + "…" : t;
  }
  var EXTRA = {port: ", #pohero, #podz", home: ", #tdhero"};   // 포트 탭은 카드 모양이 아닌 큰 덩어리도 접음
  function topCards(root, tab){
    return [].filter.call(root.querySelectorAll(".card" + (EXTRA[tab] || "")), function(c){
      if (c.tagName === "DETAILS" || c.classList.contains("xs-more") || c.classList.contains("hero")) return false;
      var p = c.parentElement && c.parentElement.closest(".card, .fold, #sheet, #xs-more, .xs-list, #pohero, #podz"); return !p;
    });
  }
  function fold(){
    var tab = window.cur, EZF = !!(window.__ezFold && window.__ezFold(tab)), re = KEEP[tab] || (EZF ? /^$/ : null), main = document.getElementById("main"); if (!re || !main) return;   // 🔰 11/05 쉬운 화면: 신호·상품·피드 탭도 전부 접음 (ux1105c.js)
    var cards = topCards(main, tab), seen = false;
    cards.forEach(function(c){
      if (c.dataset.cz === "done" || c.classList.contains("xs-hid")) return;
      var t = titleOf(c);
      if (!(ALL_FOLD[tab] || EZF) && !seen && re.test(t)){ seen = true; c.dataset.cz = "done"; return; }
      if (!(ALL_FOLD[tab] || EZF) && re.test(t)){ c.dataset.cz = "done"; return; }
      if (!t){ c.dataset.cz = "done"; return; }
      if (c.offsetHeight < 140) return;                                     // 아직 짧은(그리는 중일 수 있는) 카드는 다음에 다시 봄
      c.dataset.cz = "done"; var key = tab + ":" + t.replace(EMO, "").slice(0, 24);
      var hd = document.createElement("div"); hd.className = "cz-h"; hd.innerHTML = '<span></span><i>펼치기 ▾</i>'; hd.firstChild.textContent = t;
      var ft = document.createElement("button"); ft.className = "cz-f"; ft.textContent = "접기 ▴";
      c.insertBefore(hd, c.firstChild); c.appendChild(ft); c.classList.add("cz"); c.dataset.czk = key;
      if (!OPEN[key]) c.classList.add("cz-on");
    });
  }
  // 제목 줄(.sec) + 바로 다음 덩어리 모양(시황 「오늘의 숫자」 타일 묶음 등) — 덩어리만 접고 제목 줄에 펼치기
  function secFold(){
    var tab = window.cur; if (!KEEP[tab]) return;
    [].forEach.call(document.querySelectorAll("#main .sec"), function(sc){
      var nx = sc.nextElementSibling; if (sc.dataset.cz || !nx || !/kpis/.test(nx.className)) return;
      sc.dataset.cz = "1"; var key = tab + ":sec:" + sc.textContent.replace(EMO, "").trim().slice(0, 20);
      var tg = document.createElement("i"); tg.className = "cz-st"; sc.appendChild(tg);
      var set = function(o){ nx.style.display = o ? "" : "none"; tg.textContent = o ? "접기 ▴" : "펼치기 ▾"; };
      set(!!OPEN[key]); sc.style.cursor = "pointer";
      sc.addEventListener("click", function(ev){ ev.preventDefault(); ev.stopPropagation(); var o = nx.style.display === "none"; set(o); if (o) OPEN[key] = 1; else delete OPEN[key]; keepOpen(); }, true);
    });
  }
  // 펼치기·접기 — 한 곳에서만 받음(10/21: 예전엔 여기서 가로챈 뒤 제목 줄 click() 을 다시 불러 아무것도 안 열렸음)
  function czOpen(c, o){
    var key = c.dataset.czk; c.classList.toggle("cz-on", !o);
    if (key){ if (o) OPEN[key] = 1; else delete OPEN[key]; keepOpen(); }
    if (!o){ var y = c.getBoundingClientRect().top; if (y < 0) window.scrollBy(0, y - 80); }
  }
  document.addEventListener("click", function(ev){
    if (!ev.target.closest) return;
    var f = ev.target.closest(".cz-f");
    if (f){ var c1 = f.closest(".cz"); if (c1){ ev.preventDefault(); ev.stopPropagation(); czOpen(c1, false); } return; }
    var c = ev.target.closest(".cz.cz-on"); if (!c) return;          // 접힌 카드는 어디를 눌러도 펼침(카드 이동 대신)
    ev.preventDefault(); ev.stopPropagation(); czOpen(c, true);
  }, true);
  // 알림·링크로 접힌 카드 안을 찾아가면 펼쳐서 보여 줌
  var _goTo = window.goTo;
  if (_goTo) window.goTo = function(tab, anchor){
    var r = _goTo.apply(this, arguments);
    if (anchor){ var t0 = Date.now(); (function f(){ var el = document.getElementById(anchor); if (el){ var c = el.closest(".cz.cz-on"); if (c) c.classList.remove("cz-on"); return; } if (Date.now() - t0 < 6000) setTimeout(f, 200); })(); }
    return r;
  };

  /* ---------- ③ 이모지 줄이기 ---------- */
  // 꾸밈으로만 쓰인 것 — 본문에서 뺌. 뜻이 있는 표시(🟢🔴🟡⚪ · ✅❌ · ⚠️ · ★ · 국기 · 신호 출처 🐋☕📈🤫 · 포트 표시 💼⚡🎯🙋)는 그대로
  var DECOR = /(?:🔥|🧊|💡|👀|📌|🧭|🌙|☀️?|🌞|🌅|🌆|🗺️?|🏁|🧮|🧪|📊|📅|🗓️?|🔔|💬|📤|🧾|🧵|🪄|🗳️?|🔮|🎞️?|🕰️?|🎛️?|📋|🔁|🧩|🌏|🌍|🌐|🔗|🏷️?|🏔️?|📜|💱|🌡️?|🕐|🔄|⏳|⏱️?|⏰|📏|🔢|✂️?|🧹|🆕|💭|🗣️?|📖|📘|📢|📣|🎲|🧠|🚀|💧|🪙|🏆|🎉|👆|👉|🙌|✨|📉|🛑|⛔|🚨|💸|🤝|💪|🧑‍💼|🕸️?|⚔️?|🌉|🕳️?|🌱|🛍️?|📦|🏦|📰|🔎|🔍|🐣|🍀|🌈|🎈|📍|🧲|⚖️?|📝|🗂️?|📂|👻|🧱|🪪|🛰️?|😱|💰|🩹|🦴|🔒|🔓|🔑)\s?/gu;
  var SKIPSEL = "script,style,svg,input,textarea,select,button,.seg2,.tabs,#bnav,header,.hm-i,.pl-ic,.sc-h .hm-i,.cz-h,.hm-more,[data-noemo],.chip,.hm-chip,.sgx-t,.pd-v,.date,.dates";
  function thinTitles(root){
    [].forEach.call(root.querySelectorAll("h3, .hm-h b, .sec, summary"), function(h){
      if (h.dataset.emo) return; h.dataset.emo = "1";
      var n = 0;
      walk(h, function(tn){ var v = tn.nodeValue, out = v.replace(EMO, function(m){ n++; return n > 1 ? "" : m; }); if (out !== v) tn.nodeValue = out.replace(/\s{2,}/g, " "); });
    });
  }
  function walk(root, fn){
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: function(n){ var p = n.parentElement; return !p || p.closest(SKIPSEL) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }});
    var a = [], x; while ((x = w.nextNode())) a.push(x); a.forEach(fn);
  }

  /* ---------- ⑤ 숫자·날짜 ---------- */
  var Y = String(new Date(Date.now() + 9 * 3600e3).getUTCFullYear());
  function fmtText(v, decor){
    var o = v;
    if (decor) o = o.replace(DECOR, "");
    // 등락(부호 있는 %) → 소수 1자리 (0.0 이 되면 2자리 그대로)
    o = o.replace(/([+\-−])(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2,})%(?!p)/g, function(m, s, a, b){ var x = (+(a.replace(/,/g, "") + "." + b)).toFixed(1); return x === "0.0" ? m : s + x + "%"; });
    // 금리·수익률(부호 없음)·%p → 2자리까지 (표면금리는 그대로)
    o = o.replace(/(표면\s*)?(\d+)\.(\d{3,})(%p?)/g, function(m, pre, a, b, u){ return pre ? m : (+(a + "." + b)).toFixed(2) + u; });
    // 올해 날짜 2026-10-19 → 10/19 · 10-19 → 10/19
    o = o.replace(new RegExp("(^|[^\\d-])" + Y + "-(\\d{2})-(\\d{2})(?![\\d])", "g"), function(m, p, mo, d){ return p + mo + "/" + d; });
    o = o.replace(/(^|[\s(·])(0[1-9]|1[0-2])-([0-2]\d|3[01])(?=[\s)·,]|$)(?![%시일개년월주배건종p])/g, function(m, p, mo, d){ return p + mo + "/" + d; });
    return o;
  }
  function normalize(root){
    var tab = window.cur || "", prod = /^(bond|fund|els|onepager)$/.test(tab);
    walk(root, function(tn){
      var p = tn.parentElement; if (!p || p.closest("[data-num]") && p.closest(".hm-big")) return;   // 홈 숫자 차오름 중인 칸은 그 코드가 맡음
      var v = tn.nodeValue; if (!v || v.length < 2) return;
      if (!v.replace(EMO, "").trim()) return;                    // 이모지만 있는 칸 = 아이콘 자리 → 그대로
      var decor = !p.closest("h3, .hm-h b, .sec, summary");      // 제목은 thinTitles 가 맡음
      var o = prod ? (decor ? v.replace(DECOR, "") : v) : fmtText(v, decor);
      if (o !== v) tn.nodeValue = o;
    });
  }

  /* ---------- 한 번에 돌리기 (그려질 때마다 · 잠깐 모아서) ---------- */
  var T = null, busy = false;
  function pass(){
    T = null; if (busy || ls("calm") === "off") return; busy = true;
    try { var m = document.getElementById("main"); if (m){ thinTitles(m); normalize(m); fold(); secFold(); } var sh = document.getElementById("sheet"); if (sh){ thinTitles(sh); normalize(sh); } }
    catch(x){ if (window.console) console.warn("calm", x); }
    busy = false;
  }
  function soon(){ if (!T) T = setTimeout(pass, 260); }
  function start(){
    var mo = new MutationObserver(function(){ if (!busy) soon(); });
    mo.observe(document.body, {childList: true, subtree: true, characterData: true});
    soon();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();

  /* ---------- 📖 용어 풀이 ---------- */
  var G = [
    ["기본 포트", "시황리포트 자산배분표대로 담은 포트. 주식 칸은 S&P500 반 + 나스닥 반이 뼈대."],
    ["공격(킥) 포트", "기본 포트에 성과가 확인된 신호(고래·컵·갭) 종목을 10~20% 섞어 시장을 이기려는 포트."],
    ["집중 포트", "오르는 장이라고 볼 때만 S&P·나스닥 뼈대 + 공격(킥) 종목에 몰아서 담는 포트."],
    ["내 포트", "내가 직접 정한 비중으로 굴린 셈 치는 포트."],
    ["고래", "기관·유명 투자자 40곳. 분기마다 공시(13F)하는 보유 종목 변화를 따라감."],
    ["컵", "컵앤핸들 차트 — 바닥을 둥글게 다진 뒤 손잡이를 지나 전 고점을 뚫으려는 모양."],
    ["갭", "전날 종가보다 크게 뛰어 시작해 차트에 빈칸(갭)이 생긴 종목."],
    ["나침반", "5개 시장(한·미·일·중·홍)의 오른 종목 수·지수·섹터 흐름을 한 화면에."],
    ["국면", "지금 시장이 상승장·조정·하락장 중 어디쯤인지. 🟢 상승장 / 🔴 아님."],
    ["두뇌", "매시간 뉴스·블로그·텔레그램을 읽고 시장 판단과 논지(이렇게 될 것)를 고치는 자동 분석."],
    ["시장확률", "여러 방법을 합쳐 계산한 「다음 장 오를 확률」. 매일 종가로 채점하고, 검증되기 전엔 약하게만 말함."],
    ["200일선", "최근 200거래일 평균 가격. 지수가 그 위면 상승 추세로 보고 현금을 줄임."],
    ["정직 계산", "다음 날 가격에 사고 수수료·세금·환전 비용까지 뺀 성적. 📊 성적표에서 봄."],
    ["예고 채점", "아침 시황리포트가 낸 예고(예: 코스피 5,400 위 마감)를 다음 날 맞았는지 채점."]
  ];
  function gloss(){
    var old = document.getElementById("gloss"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "gloss";
    d.innerHTML = '<div class="gl-in"><div class="gl-t"><b>📖 용어 풀이</b><button aria-label="닫기">✕</button></div>' + G.map(function(x){ return '<div class="gl-r"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join("") + '</div>';
    d.onclick = function(ev){ if (ev.target === d || ev.target.closest("button")) d.remove(); };
    document.body.appendChild(d);
  }
  window.chGloss = gloss;
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-gloss]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); gloss(); }, true);

  /* ---------- 모양 ---------- */
  var st = document.createElement("style");
  st.textContent = [
    // ② 접힌 카드
    ".card.cz{position:relative}.cz-h{display:none}.cz-f{display:block;margin:10px auto 0;background:none;border:0;color:var(--sub);font-size:12.5px;padding:4px 10px;cursor:pointer}",
    ".cz.cz-on{padding:12px 14px!important;cursor:pointer;background:var(--panel);border:1px solid var(--line);border-radius:16px;margin-bottom:12px}.cz.cz-on>*{display:none!important}.cz.cz-on>.cz-h{display:flex!important}" +
    // 11/05 사용자 「빈칸 뭐니」: 펼쳐 있을 때 너무 길어 「전체 보기」(xs-clamp) 처리된 카드가 접히면, 아래를 흐리게 덮던 150px 막(::after)이 제목 줄까지 덮어 빈 카드로 보였음 → 접힌 카드엔 덮개·높이 제한 없음
    ".cz.cz-on::after{display:none!important}.cz.cz-on.xs-clamp{max-height:none!important;overflow:visible!important}",
    ".cz-h{align-items:center;gap:8px;font-weight:700;font-size:14.5px;line-height:1.35}.cz-h span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cz-h i{flex:none;font-style:normal;font-weight:400;font-size:12.5px;color:var(--sub)}",
    // 포트 탭 묶음(.fold)이 다른 「.fold」 단추 모양을 물려받아 상자 안 상자로 보이던 것 정리
    ".cz-st{float:right;font-style:normal;font-weight:400;font-size:12.5px;color:var(--sub);margin-left:8px}",
    "#pobody>.fold{padding:0;border:0;background:none;margin:0 0 8px}#pobody>.fold.open{margin-bottom:14px}#pobody>.fold:not(.open) .fold-h{margin:0}",
    // 홈: 큰 「🏠 오늘」 머리·날짜(위 머리에 이미 있음) 숨김 → 첫 화면에 오늘 한 줄이 바로
    "html[data-tab=home] #main>.hero{display:none}html[data-tab=home] .hm-day .hm-date{display:none}html[data-tab=home] .hm-day{margin-top:10px}",
    // ④ 정직 칩은 성적표에서만
    "html:not([data-tab=score]) .hon-chip,html:not([data-tab=score]) .hon-tag,html:not([data-tab=score]) .hon-line{display:none!important}",
    // 홈 아래 바로가기 줄
    ".hm-more{display:flex;flex-wrap:wrap;gap:8px;margin:4px 2px 18px}.hm-more a{flex:1 1 auto;text-align:center;font-size:12.5px;padding:9px 10px;border-radius:12px;background:var(--panel);border:1px solid var(--line);color:var(--sub);text-decoration:none;cursor:pointer;white-space:nowrap}",
    // 🗂 신호 › 더 보기
    ".sm-t{padding:9px 0;border-top:1px dashed var(--line)}.sm-t:first-of-type{border-top:0}.sm-tb{display:flex;gap:10px;align-items:flex-start}.sm-tb b{flex:1;font-size:14px;line-height:1.45}.sm-t small{display:block;font-size:12.5px;color:var(--sub);line-height:1.45;margin-top:3px}",
    ".sm-c{flex:none;width:64px;text-align:right}.sm-c i{display:block;height:5px;border-radius:3px;background:#7c9cff;margin:6px 0 2px auto;max-width:64px}.sm-c em{font-style:normal;font-size:12.5px;color:var(--sub)}",
    ".sm-go{display:flex;align-items:center;gap:10px;padding:11px 2px;border-top:1px solid var(--line);cursor:pointer}.sm-go:first-of-type{border-top:0}.sm-go>span{font-size:20px;width:30px;text-align:center}.sm-go div{flex:1}.sm-go b{display:block;font-size:14.5px}.sm-go small{font-size:12.5px;color:var(--sub)}.sm-go i{font-style:normal;color:var(--sub)}",
    // 📖 용어 풀이
    "#gloss{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}",
    ".gl-in{width:100%;max-width:560px;max-height:82vh;overflow:auto;background:var(--panel);border-radius:18px 18px 0 0;padding:14px 16px calc(18px + env(safe-area-inset-bottom))}",
    ".gl-t{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:16px}.gl-t button{background:none;border:0;color:var(--sub);font-size:18px;padding:4px 8px}",
    ".gl-r{padding:9px 0;border-top:1px solid var(--line);font-size:13.5px;line-height:1.5}.gl-r b{display:block;margin-bottom:1px}.gl-r span{color:var(--sub)}"
  ].join("");
  document.head.appendChild(st);
})();
;
/* ======== ux1022.js ======== */
/* 10/22 사용자 「세 개 다 좋아 실행해」 — 📱 앱 아이디어 A10/22-1·2·3
   ① 😱 급락 뒤 홈 한 줄 「그날 팔았다면」 (A10/22-1 · 설계기 쪽은 port_design.js)
      코스피가 하루 −3.5% 넘게 빠진 날이 최근 3거래일 안에 있으면 「오늘 한 줄」 밑에 카드 하나:
      2000년 이후 같은 급락일 종가에 팔고 20·60·120거래일 뒤 돌아왔다면 → 놓친 지수 수익(평균·몇 번 중 몇 번 손해·최악),
      반대로 그날 10% 더 샀다면 → 그 10% 의 수익. 자료: archive/x/port_px/KOSPI.json(^KS11 2000~) — 계산은 휴대폰에서.
   ② 📌 내 ELS 관제탑 (A10/22-2) — 🎯 ELS 탭 맨 위. 청약 중 상품을 「담아 두기」(실제·가상 같은 단추, 휴대폰에만 저장) →
      기초자산마다 기준가 대비 · 다음 평가 D-day · 배리어까지 여유 · KI 까지 거리, 그리고 2006~ 일봉으로
      「과거에 이 위치였던 가입일들은 다음 평가 때 상환 ○% · 결국 손실 ○%」. 두 개 넘으면 「같이 깨진 비율(겹침)」.
      자료: archive/x/els_px(7일마다 일봉) + els_px/last.json(매 실행 최근 종가 · els_replay.py) · els_replay.json by_id(조건키) · els_all.json · products.json
   ③ 👁 내 눈 vs 거름망 (A10/22-3) — 🔎 아침 거르기 카드마다 「👁 볼 만함」 한 번(안 누른 건 넘긴 것).
      다음 날부터 화면 맨 위 한 줄 + 📊 성적표 카드: 찍은 것 vs 안 찍은 것(그날 거름망 전체) 「그날 종가 → 가장 최근 종가」 평균.
      값은 opdata p/ (종목 종가 · 매일 아침) — 날짜가 그날보다 뒤인 것만 셈. 휴대폰에만 저장.
   원칙: 과거·지난 값 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」). */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function s2day(s){ return Date.parse(s + "T00:00:00Z") / 864e5; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function lb(a, v){ var lo = 0, hi = a.length; while (lo < hi){ var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
  function addM(t, m){ var x = new Date(t * 864e5), y = x.getUTCFullYear(), mo = x.getUTCMonth() + m, dd = x.getUTCDate();
    var ny = y + Math.floor(mo / 12), nm = ((mo % 12) + 12) % 12, last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
    return Date.UTC(ny, nm, Math.min(dd, last)) / 864e5; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function goTab(t){ if (typeof window.go === "function") go(t); else location.hash = t; }

  /* ═════════ ① 😱 급락 뒤 「그날 팔았다면」 ═════════ */
  var KP = null, KW = null;
  // 10/23: 파일(어제까지 종가)은 한 번만 받고, 실시간 코스피(live_kr, 장중 2분마다 갱신)는 부를 때마다 새로 얹음 → 장중 급락도 바로 반영
  function kospi(){
    if (!KW) KW = getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return getJSON("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), {ttl: 3600e3});
    }).then(function(j){
      if (!j || !j.dd) return null;
      var t = s2day(j.d0), d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(day2s(t)); c.push(+j.c[i]); }
      KP = {d: d, c: c}; return KP;
    }).catch(function(){ KW = null; return null; });
    return KW.then(function(B){
      if (!B) return null;
      return getJSON("archive/x/live_kr.json?" + Math.floor(Date.now() / 60000), {ttl: 60000}).then(function(L){
        var K = {d: B.d.slice(), c: B.c.slice(), live: null};
        var ix = L && L.date && L.date <= kst() ? (L.index || []).filter(function(x){ return x.name === "코스피"; })[0] : null;
        if (ix && ix.last > 0){
          // 오늘 칸을 실시간 값으로 · 10/23: 파일에 전날 종가가 빠져 있으면(야후가 10/22 를 건너뜀) 실시간 등락률로 되살려 끼움 — 안 그러면 이틀치가 하루로 잡힘
          if (K.d[K.d.length - 1] === L.date){ K.d.pop(); K.c.pop(); }
          if (K.d[K.d.length - 1] < L.date){
            var pv = ix.chg != null ? +ix.last / (1 + ix.chg / 100) : null, pd = new Date(L.date + "T00:00:00Z");
            do { pd.setUTCDate(pd.getUTCDate() - 1); } while (pd.getUTCDay() === 0 || pd.getUTCDay() === 6);
            var pds = pd.toISOString().slice(0, 10), lc = K.c[K.c.length - 1];
            if (pv && pds > K.d[K.d.length - 1] && Math.abs(pv / lc - 1) > 0.0005){ K.d.push(pds); K.c.push(pv); }   // 휴장일이면 값이 같아 넣지 않음
            K.d.push(L.date); K.c.push(+ix.last);
          }
          if (L.date === kst() && ix.status !== "CLOSE") K.live = {t: L.t || "", d: L.date}; }
        return K;
      }, function(){ return {d: B.d, c: B.c, live: null}; });
    });
  }
  var CUT = -3.5;
  function panicStats(K){
    var c = K.c, d = K.d, n = c.length, drops = [];
    for (var i = 1; i < n; i++) if ((c[i] / c[i - 1] - 1) * 100 <= CUT) drops.push(i);
    var trig = null;   // 최근 3거래일 안 급락(가장 최근)
    for (var j = Math.max(1, n - 3); j < n; j++){ var r = (c[j] / c[j - 1] - 1) * 100; if (r <= CUT) trig = {i: j, d: d[j], r: r}; }
    if (!trig) return null;
    var H = [20, 60, 120].map(function(h){
      var rs = [], worst = null;
      drops.forEach(function(i){ if (i + h >= n) return; var r = (c[i + h] / c[i] - 1) * 100; rs.push(r); if (!worst || r < worst.r) worst = {r: r, d: d[i]}; });
      if (!rs.length) return {h: h, n: 0};
      var s = 0, up = 0; rs.forEach(function(x){ s += x; if (x > 0) up++; });
      var so = rs.slice().sort(function(a, b){ return a - b; });
      return {h: h, n: rs.length, avg: s / rs.length, med: so[Math.floor(so.length / 2)], up: up, worst: worst};
    });
    var now = null;   // 오늘이 며칠째 연속 하락인가(오늘 −1.5% 넘게 · 앞날들도 −1.5% 넘게, 최대 5일) → 「이틀 동안 −x%」
    if (d[n - 1] === kst() && n > 2){
      var st = n - 1;
      while (st > n - 5 && (c[st - 1] / c[st - 2] - 1) * 100 <= -1.5) st--;
      var k = n - st, rn = (c[n - 1] / c[n - 2] - 1) * 100;
      if (k >= 2 && rn <= -1.5){
        var r2 = (c[n - 1] / c[st - 1] - 1) * 100, cut2 = Math.ceil(r2), hs = [], seen = -999;   // 같은 날 수(k일) 동안 그만큼 빠진 날들 → 120거래일 뒤
        for (var q = k; q < n - 1; q++){ var rr = (c[q] / c[q - k] - 1) * 100; if (rr <= cut2 && q - seen > k){ seen = q; if (q + 120 < n) hs.push((c[q + 120] / c[q] - 1) * 100); } }
        var av = null, upn = 0; if (hs.length){ av = 0; hs.forEach(function(x){ av += x; if (x > 0) upn++; }); av /= hs.length; }
        now = {r: rn, prev: (c[n - 2] / c[n - 3] - 1) * 100, r2: r2, k: k, cut2: cut2, n: hs.length, avg: av, up: upn};
      }
    }
    return {trig: trig, drops: drops.length, H: H, from: d[0].slice(0, 4), today: d[n - 1] === kst(), live: K.live, now: now};
  }
  function kday(k){ return ({2: "이틀", 3: "사흘", 4: "나흘", 5: "닷새"})[k] || k + "일"; }
  function panicHome(S){
    var A = amt(), T = S.trig, h120 = S.H[2], h20 = S.H[0];
    var rows = S.H.filter(function(x){ return x.n; }).map(function(x){
      return '<div class="pnh-r"><span>' + x.h + '거래일 뒤 돌아옴</span><b class="' + cl(-x.avg) + '">' + sg(-x.avg, 1) + '%p</b><em>' + x.n + '번 중 <b>' + x.up + '</b>번 손해</em></div>'; }).join("");
    var add = h120 && h120.n ? A * 0.1 * h120.avg / 100 : null;
    return '<div class="pnh-h"><b>😱 ' + (T.d === kst() ? (S.live ? "오늘(장중 " + S.live.t + ")" : "오늘") : md(T.d)) + ' 코스피 ' + sg(T.r, 1) + '%' + (S.now && T.d === kst() ? ' · ' + kday(S.now.k) + ' 동안 ' + sg(S.now.r2, 1) + '%' : '') + ' — 그날 팔았다면?</b><small>' + S.from + '년 이후 하루 ' + Math.abs(CUT) + '% 넘게 빠진 날 ' + S.drops + '번 · 그날 종가에 팔고 다시 샀을 때 지수를 그대로 들고 있던 것보다</small></div>' +
      (S.now ? '<div class="pnh-r pnh-now"><span>🔴 ' + (S.now.k === 2 ? '어제 ' + sg(S.now.prev, 1) + '%에 이어 ' : S.now.k + '일째 하락 · ') + '오늘' + (S.live ? '(장중 ' + S.live.t + ')' : '') + ' ' + sg(S.now.r, 1) + '% → ' + kday(S.now.k) + ' 동안 ' + sg(S.now.r2, 1) + '%</span>' + (S.now.n ? '<b class="' + cl(S.now.avg) + '">' + sg(S.now.avg, 1) + '%</b><em>2000년 이후 ' + kday(S.now.k) + ' 새 ' + Math.abs(S.now.cut2) + '% 넘게 빠진 ' + S.now.n + '번 · 120거래일 뒤 평균 · ' + S.now.up + '번 오름</em>' : '<em>같은 낙폭 과거 사례 부족</em>') + '</div>' : '') +
      rows +
      (add != null ? '<div class="pnh-r pnh-b"><span>↔ 반대로 그날 ' + won(A * 0.1) + '원(10%) 더 샀다면 120거래일 뒤</span><b class="' + cl(add) + '">' + (add >= 0 ? "+" : "−") + won(Math.abs(add)) + '원</b><em>평균 · 최악 ' + sg(h120.worst.r, 0) + '%(' + h120.worst.d.slice(0, 7).replace("-", ".") + ')</em></div>' : '') +
      '<div class="pnh-go">💼 내 포트 설계로 2008·2020·2022·2025 낙폭에서 보기 ›</div>' +
      '<p class="note" style="margin:4px 0 0">코스피 지수 기준(개별 종목 아님 · 현금 이자 뺌) · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p>';
  }
  var HPB = 0;
  function homePanic(){
    var b = document.getElementById("hmbody"); if (!b || HPB) return;
    var pl = b.querySelector("section.card.pl"); if (!pl || document.getElementById("hmpanic")) return;
    HPB = 1;
    kospi().then(function(K){
      HPB = 0; if (!K) return;
      var S = panicStats(K); if (!S) return;
      var b2 = document.getElementById("hmbody"), pl2 = b2 && b2.querySelector("section.card.pl"); if (!pl2 || document.getElementById("hmpanic")) return;
      var s = document.createElement("section"); s.className = "card hmpn"; s.id = "hmpanic"; s.setAttribute("role", "button");
      s.innerHTML = panicHome(S); s.dataset.sig = psig(S); pl2.parentNode.insertBefore(s, pl2.nextSibling);
      s.onclick = function(ev){ ev.stopPropagation(); if (window.__pdz && __pdz.panic) __pdz.panic(); goTab("port"); };
    }).catch(function(){ HPB = 0; });
  }
  function psig(S){ return S.trig.d + "|" + S.trig.r.toFixed(1) + "|" + (S.now ? S.now.r.toFixed(1) + S.now.k : "") + "|" + (S.live ? S.live.t : ""); }
  // 장중엔 2분마다 다시 계산 → 숫자가 바뀌면 카드를 새로 그림(급락이 새로 생기거나 사라져도)
  setInterval(function(){
    if (document.hidden || !document.getElementById("hmbody")) return;
    var h = +new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 13); if (h < 9 || h > 16) return;
    kospi().then(function(K){
      if (!K) return; var S = panicStats(K), old = document.getElementById("hmpanic");
      if (!S){ if (old) old.remove(); return; }
      if (old && old.dataset.sig === psig(S)) return;
      if (old) old.remove(); HPB = 0; homePanic();
    }).catch(function(){});
  }, 120000);
  window.__panicStats = function(){ return kospi().then(function(K){ return K && panicStats(K); }); };   // 검사용

  /* ═════════ ② 📌 내 ELS 관제탑 ═════════ */
  var EPX = {}, EIDX = null, ELAST = null, EW = null;
  function eload(){
    if (!EW) EW = Promise.all([
      getJSON("archive/x/els_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/els_px/last.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; }),
      getJSON("archive/x/els_replay.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; }),
      getJSON("archive/x/els_all.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })
    ]).then(function(r){ EIDX = r[0] && r[0].assets ? r[0] : {assets: {}}; ELAST = r[1] && r[1].assets ? r[1] : null; return {rep: r[2] || {by_id: {}}, all: r[3] || {items: []}}; });
    return EW;
  }
  function epx(n){   // 7일마다 일봉 + last.json 최근 종가(겹치는 날 값으로 맞춰 이어 붙임)
    if (EPX[n]) return EPX[n];
    var a = EIDX && EIDX.assets[n]; if (!a) return Promise.resolve(null);
    EPX[n] = getJSON("archive/x/els_px/" + a.f + "?" + String(EIDX.updated || "").replace(/\D/g, ""), {ttl: 864e5}).then(function(j){
      if (!j || !j.dd) return null;
      var t = s2day(j.d0), d = [], c = [];
      for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d.push(t); c.push(+j.c[i]); }
      var L = ELAST && ELAST.assets[n], tail = 0;
      if (L && L.length){
        var lastD = d[d.length - 1], k = null;
        for (var q = 0; q < L.length; q++) if (s2day(L[q][0]) === lastD){ k = c[c.length - 1] / L[q][1]; break; }
        if (k){ L.forEach(function(x){ var tt = s2day(x[0]); if (tt > lastD){ d.push(tt); c.push(x[1] * k); tail++; } }); }
      }
      return {d: Int32Array.from(d), c: Float64Array.from(c), tail: tail};
    }).catch(function(){ return null; });
    return EPX[n];
  }
  function align(ss){
    var base = ss[0], m = ss.length, D = [], C = ss.map(function(){ return []; }), ptr = ss.map(function(){ return 0; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true, vals = [base.c[i]];
      for (var a = 1; a < m; a++){ var s = ss[a]; while (ptr[a] < s.d.length && s.d[ptr[a]] < t) ptr[a]++; if (ptr[a] >= s.d.length || s.d[ptr[a]] !== t){ ok = false; break; } vals.push(s.c[ptr[a]]); }
      if (!ok) continue; D.push(t); for (var a2 = 0; a2 < m; a2++) C[a2].push(vals[a2]);
    }
    return {D: Int32Array.from(D), C: C.map(function(x){ return Float64Array.from(x); })};
  }
  function sparse(arr){ var n = arr.length, K = [arr], k = 1; while ((1 << k) <= n){ var p = K[k - 1], q = new Float64Array(n - (1 << k) + 1), h = 1 << (k - 1); for (var i = 0; i < q.length; i++) q[i] = p[i] < p[i + h] ? p[i] : p[i + h]; K.push(q); k++; } return K; }
  function rmin(K, a, b){ if (b < a) return Infinity; var k = 31 - Math.clz32(b - a + 1), x = K[k][a], y = K[k][b - (1 << k) + 1]; return x < y ? x : y; }
  function parseKey(key){ var p = String(key).split("|"); return {ua: p[0].split("+"), bars: p[1].split("-").map(Number), cyc: +p[2], ki: p[3] === "none" ? null : +p[3], pp: p[4] === "pp"}; }
  // 가입일 s 에서 끝까지 (els_replay replay 와 같은 규칙: 평가일마다 가장 못한 자산이 배리어 위면 상환 · 끝까지 못 넘으면 KI 닿았으면 손실(KI 없으면 손실))
  function simAt(G, q, s){
    var D = G.D, T = D.length, n = q.bars.length, m = G.C.length, ev = [];
    for (var k = 0; k < n; k++){ var tt = addM(D[s], q.cyc * (k + 1)); if (tt > D[T - 1]) return null; ev.push(Math.min(lb(D, tt), T - 1)); }
    for (var k2 = 0; k2 < n; k2++){ var w = Infinity; for (var a = 0; a < m; a++){ var r = G.C[a][ev[k2]] / G.C[a][s]; if (r < w) w = r; } if (w >= q.bars[k2] / 100) return {k: k2, ev: ev}; }
    var touched = false; if (q.ki != null) for (var a2 = 0; a2 < m; a2++) if (rmin(G.K[a2], s, ev[n - 1]) / G.C[a2][s] < q.ki / 100){ touched = true; break; }
    return {k: -1, loss: q.ki != null ? touched : true, ev: ev};
  }
  function worstAt(G, s, p){ var w = Infinity, wa = 0; for (var a = 0; a < G.C.length; a++){ var r = G.C[a][p] / G.C[a][s]; if (r < w){ w = r; wa = a; } } return {w: w, a: wa}; }
  function kiTouched(G, q, s, p){ if (q.ki == null) return false; for (var a = 0; a < G.C.length; a++) if (rmin(G.K[a], s, p) / G.C[a][s] < q.ki / 100) return true; return false; }
  function monitor(it, G){
    var q = parseKey(it.key), D = G.D, T = D.length, b = lb(D, s2day(it.base));
    if (b >= T) return {wait: 1, q: q};
    var L = T - 1, n = q.bars.length, evT = [];
    for (var k = 0; k < n; k++) evT.push(addM(D[b], q.cyc * (k + 1)));
    var passed = evT.filter(function(t){ return t <= D[L]; }).length;
    // 지나간 평가에서 이미 상환됐나
    for (var k2 = 0; k2 < passed; k2++){ var p = Math.min(lb(D, evT[k2]), L), w = worstAt(G, b, p).w; if (w >= q.bars[k2] / 100) return {done: {k: k2, d: day2s(D[p]), w: w}, q: q}; }
    var cur = G.C.map(function(c, a){ return c[L] / c[b]; }), W = worstAt(G, b, L), kt = kiTouched(G, q, b, L);
    var out = {q: q, b: b, L: L, cur: cur, w: W.w, wa: W.a, kt: kt, next: passed < n ? {k: passed, t: evT[passed], bar: q.bars[passed]} : null, mat: day2s(evT[n - 1]), last: day2s(D[L]), base: day2s(D[b])};
    if (!out.next) return out;
    // 과거에 이 위치: 경과일이 같고(같은 평가 차례 앞) · 가장 못한 자산이 지금과 ±tol 안 · KI 닿음 여부 같음 · 그때까지 상환 안 됨
    var E = D[L] - D[b], nS = 0, nNext = 0, nEarly = 0, nMat = 0, nLoss = 0, tol = 0.05, cand = [];
    for (var tries = 0; tries < 3; tries++){
      cand = [];
      for (var s = 0; s < T; s++){
        if (s >= b - 5 && s <= L) break;
        var pp = lb(D, D[s] + E); if (pp >= T) break;
        var sim = simAt(G, q, s); if (!sim) break;
        if (sim.k >= 0 && sim.k < passed) continue;          // 그 위치 전에 이미 끝남
        var ww = worstAt(G, s, pp).w; if (Math.abs(ww - W.w) > tol) continue;
        if (q.ki != null && kiTouched(G, q, s, pp) !== kt) continue;
        cand.push(sim);
      }
      if (cand.length >= 30) break;
      tol = tol === 0.05 ? 0.08 : 0.12;
    }
    cand.forEach(function(x){ nS++; if (x.k === passed) nNext++; if (x.k >= 0) nEarly++; else if (x.loss) nLoss++; else nMat++; });
    out.hist = {n: nS, next: nNext, early: nEarly, mat: nMat, loss: nLoss, tol: tol, from: day2s(D[0]).slice(0, 4)};
    return out;
  }
  function overlap(items, GS){   // 담은 것 둘 넘으면: 모두가 있는 날 가입했다면 하나가 손실일 때 다른 것도 손실인 비율
    var names = []; items.forEach(function(it){ parseKey(it.key).ua.forEach(function(u){ if (names.indexOf(u) < 0) names.push(u); }); });
    return Promise.all(names.map(epx)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var G = align(ss); if (G.D.length < 600) return null; G.K = G.C.map(sparse);
      var subs = items.map(function(it){ var q = parseKey(it.key), idx = q.ua.map(function(u){ return names.indexOf(u); });
        return {q: q, G: {D: G.D, C: idx.map(function(i){ return G.C[i]; }), K: idx.map(function(i){ return G.K[i]; })}}; });
      var any = 0, both = 0, tot = 0, ones = items.map(function(){ return 0; });
      for (var s = 0; s < G.D.length; s++){
        var rs = subs.map(function(x){ return simAt(x.G, x.q, s); });
        if (rs.some(function(r){ return !r; })) break;
        tot++; var L = rs.map(function(r){ return r.k < 0 && r.loss; }), c = L.filter(Boolean).length;
        L.forEach(function(v, i){ if (v) ones[i]++; });
        if (c >= 1) any++; if (c >= 2) both++;
      }
      return tot >= 200 ? {tot: tot, any: any, both: both, ones: ones, from: day2s(G.D[0]).slice(0, 7)} : null;
    });
  }
  var LABU = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LABU[n] || n; }
  function my(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function nextWeekday(s){ var t = s2day(s) + 1; for (var i = 0; i < 5; i++){ var w = new Date(t * 864e5).getUTCDay(); if (w > 0 && w < 6) break; t++; } return day2s(t); }
  function cands(R){
    var by = (R.rep && R.rep.by_id) || {}, out = [], API = window.__elsApi, Dd = API && API.D && API.D();
    ((Dd && Dd.els) || []).forEach(function(x){ var k = by[x.isin]; if (k && (x.pp || 0) < 100) out.push({id: x.isin, nm: x.n, iss: "미래에셋증권", key: k, e: x.e, cpn: x.cpn}); });
    ((R.all && R.all.items) || []).forEach(function(x){ var k = by[x.id]; if (k && x.kind !== "ELB" && !x.nolos) out.push({id: x.id, nm: String(x.nm || "").replace(/\s*\[.*$/, "").replace(/파생결합증권\(주가연계증권\)/, "ELS"), iss: String(x.iss || "").replace(/주식회사|\(주\)/g, "").trim(), key: k, e: x.e, cpn: x.cpn}); });
    var seen = {}; return out.filter(function(c){ if (seen[c.id]) return false; seen[c.id] = 1; return parseKey(c.key).ua.every(function(u){ return EIDX && EIDX.assets[u]; }); });
  }
  function condTxt(q){ return q.ua.map(lab).join("·") + ' · ' + q.bars.join("-") + ' · ' + q.cyc + '개월마다 · KI ' + (q.ki == null ? "없음" : q.ki); }
  var EM = {open: 0, q: "", busy: 0};
  function itemH(it, M){
    var q = parseKey(it.key), head = '<div class="em-ih"><div><b>' + e(it.nm) + '</b>' + (it.virt ? ' <span class="em-v">🧪 가상</span>' : '') + '<small>' + e(it.iss || "") + ' · ' + e(condTxt(q)) + '</small></div><button class="em-x" data-emx="' + e(it.id) + '" aria-label="빼기">✕</button></div>';
    var dt = '<label class="em-dt">기준일 <input type="date" data-emd="' + e(it.id) + '" value="' + e(it.base) + '"><button data-emt="' + e(it.id) + '">오늘로</button></label>';
    if (!M) return '<div class="em-it">' + head + '<div class="mut em-l">기초자산 일봉 자료가 없어요(18개 밖).</div>' + dt + '</div>';
    if (M.wait) return '<div class="em-it">' + head + '<div class="em-l">⏳ 기준가가 아직 안 정해졌어요 — <b>' + md(it.base) + '</b> 종가가 기준(발행일이 다르면 아래 날짜를 고쳐 주세요).</div>' + dt + '</div>';
    if (M.done) return '<div class="em-it">' + head + '<div class="em-l em-ok">✅ ' + (M.done.k + 1) + '차 평가(' + md(M.done.d) + ')에서 가장 못한 자산 ' + Math.round(M.done.w * 100) + '% ≥ ' + q.bars[M.done.k] + ' — 상환 조건을 넘었어요(증권사 공지로 확인).</div>' + dt + '</div>';
    var bars = q.ua.map(function(u, i){ var r = M.cur[i] * 100, pos = Math.max(0, Math.min(100, (r - 40) / (130 - 40) * 100));
      return '<div class="em-ua"><span>' + e(lab(u)) + (i === M.wa ? ' <i>가장 못함</i>' : '') + '</span><div class="em-tr"><i class="em-bar" style="left:' + ((M.next ? M.next.bar : q.bars[q.bars.length - 1]) - 40) / 0.9 + '%"></i>' + (q.ki != null ? '<i class="em-ki" style="left:' + (q.ki - 40) / 0.9 + '%"></i>' : '') + '<i class="em-dot ' + cl(r - 100) + '" style="left:' + pos + '%"></i></div><b class="' + cl(r - 100) + '">' + sg(r - 100, 1) + '%</b></div>'; }).join("");
    var nx = M.next, dd = nx ? Math.round(nx.t - s2day(kst())) : null, gap = nx ? M.w * 100 - nx.bar : null;
    var H = M.hist, hist = H && H.n >= 10 ? '<div class="em-hs">🕰 과거에 이 위치(가장 못한 자산 ' + Math.round(M.w * 100) + '% ±' + Math.round(H.tol * 100) + ' · 같은 차례' + (q.ki != null ? ' · KI ' + (M.kt ? '닿음' : '안 닿음') : '') + ')였던 가입일 <b>' + H.n.toLocaleString() + '</b>번 →' +
        '<div class="em-hb"><span style="flex:' + H.next + '" class="a"></span><span style="flex:' + (H.early - H.next) + '" class="b"></span><span style="flex:' + H.mat + '" class="c"></span><span style="flex:' + H.loss + '" class="d"></span></div>' +
        '<div class="em-hl"><span><i class="a"></i>다음 평가 상환 <b>' + Math.round(H.next / H.n * 100) + '%</b></span><span><i class="b"></i>그 뒤 상환 ' + Math.round((H.early - H.next) / H.n * 100) + '%</span>' + (H.mat ? '<span><i class="c"></i>만기 원금 ' + Math.round(H.mat / H.n * 100) + '%</span>' : '') + '<span><i class="d"></i>손실 <b>' + Math.round(H.loss / H.n * 100) + '%</b></span></div></div>'
      : '<div class="em-hs mut">🕰 과거에 이 위치였던 가입일이 ' + (H ? H.n : 0) + '번뿐이라 비율은 안 보여 줘요.</div>';
    return '<div class="em-it">' + head +
      '<div class="em-k"><div><small>다음 평가</small><b>' + (nx ? (nx.k + 1) + '차 · D-' + dd : '만기 지남') + '</b><em>' + (nx ? md(day2s(nx.t)) + ' · 배리어 ' + nx.bar : '') + '</em></div>' +
        '<div><small>배리어까지</small><b class="' + (gap >= 0 ? "up" : "dn") + '">' + (gap == null ? "–" : sg(gap, 1) + '%p') + '</b><em>' + (gap == null ? '' : gap >= 0 ? '지금이면 상환' : '더 올라야 상환') + '</em></div>' +
        '<div><small>' + (q.ki != null ? 'KI ' + q.ki + '까지' : 'KI') + '</small><b class="' + (M.kt ? "dn" : "") + '">' + (q.ki == null ? '없음' : M.kt ? '닿음' : sg(q.ki - M.w * 100, 0) + '%p') + '</b><em>' + (q.ki != null && !M.kt ? '여기까지 빠지면 손실 위험' : q.ki != null ? '만기에 못 넘으면 손실' : '만기 배리어 밑이면 손실') + '</em></div></div>' +
      bars + '<div class="em-lg"><span><i class="em-bar"></i>다음 배리어</span>' + (q.ki != null ? '<span><i class="em-ki"></i>KI</span>' : '') + '<span class="mut">기준가 ' + md(M.base) + ' → ' + md(M.last) + ' 종가</span></div>' + hist + dt + '</div>';
  }
  function emDraw(){
    var box = document.getElementById("elsmy"); if (!box) return;
    var L = my();
    box.innerHTML = '<div class="em-hd"><b>📌 내 ELS 관제탑</b><small>' + (L.length ? L.length + '개 · 휴대폰에만 저장' : '들고 있거나 지켜볼 ELS 를 담아 두면 매일 「지금 어디쯤」') + '</small></div>' +
      (L.length ? '<div id="emov"></div><div id="emlist"><div class="loading">계산 중…</div></div>' : '<p class="em-in">청약한 ELS(또는 지켜볼 상품)를 담아 두면 — 기초자산마다 기준가 대비 · 다음 평가까지 D-day · 배리어까지 여유 · KI 까지 거리, 그리고 <b>2006년부터 「과거에 이 위치였던 가입일들은 어떻게 끝났나」</b>를 매일 보여 줘요. 두 개 넘게 담으면 「같이 손실로 끝난 비율」도.</p>') +
      '<button class="em-add" id="emadd">' + (EM.open ? '닫기 ▴' : '＋ 담아 두기') + '</button><div id="empick"' + (EM.open ? '' : ' hidden') + '></div>' +
      '<p class="note" style="margin:6px 0 0">과거 계산 · 미래 보장 아님 · 기본 스텝다운 기준(월지급·리자드 빼고) · 실제 상환은 증권사 공지로 확인 · 사라는 뜻이 아니에요.</p>';
    document.getElementById("emadd").onclick = function(ev){ ev.stopPropagation(); EM.open = !EM.open; emDraw(); };
    if (EM.open) pickDraw();
    if (!L.length) return;
    eload().then(function(){
      return Promise.all(L.map(function(it){ var q = parseKey(it.key); return Promise.all(q.ua.map(epx)).then(function(ss){
        if (ss.some(function(x){ return !x; })) return null; var G = align(ss); G.K = G.C.map(sparse); var t0 = performance.now(), M = null; try { M = monitor(it, G); } catch(x) { console.warn(x); } if (M) M.ms = performance.now() - t0; return M; }); }));
    }).then(function(MS){
      var el = document.getElementById("emlist"); if (!el) return;
      el.innerHTML = L.map(function(it, i){ return itemH(it, MS[i]); }).join("");
      bindItems(el);
      var live = L.filter(function(it, i){ var M = MS[i]; return M && !M.wait && !M.done; });
      var ov = document.getElementById("emov");
      if (ov && live.length >= 2){ ov.innerHTML = '<div class="em-ov mut">🔗 겹침 계산 중…</div>';
        overlap(live).then(function(O){ var o = document.getElementById("emov"); if (!o) return;
          if (!O){ o.innerHTML = ''; return; }
          if (O.any < 20){ o.innerHTML = '<div class="em-ov">🔗 ' + O.from.replace("-", ".") + '~ 매 거래일 ' + live.length + '개를 같이 가입했다면 ' + O.tot.toLocaleString() + '번 중 하나라도 손실로 끝난 게 ' + O.any + '번뿐 — 겹침(같이 깨진 비율)을 셀 만큼 손실이 없었어요.</div>'; return; }
          var p = O.any ? Math.round(O.both / O.any * 100) : 0;
          o.innerHTML = '<div class="em-ov"><div class="em-ovb"><b>' + p + '%</b><small>겹침</small></div><div>' + O.from.replace("-", ".") + '~ 매 거래일 ' + live.length + '개를 같이 가입했다면 <b>' + O.tot.toLocaleString() + '</b>번 중 하나라도 손실 ' + O.any.toLocaleString() + '번 — 그중 <b>' + p + '%</b>는 ' + (live.length > 2 ? '두 개 넘게' : '둘 다') + ' 같이 손실' +
            '<small>' + (p >= 60 ? '기초자산이 겹쳐 나눠 들어도 위험이 잘 안 나뉘어요' : p >= 30 ? '꽤 같이 움직여요' : '위험이 꽤 나뉘어 있어요') + ' · 따로따로 손실: ' + live.map(function(it, i){ return e(String(it.nm).slice(0, 12)) + ' ' + Math.round(O.ones[i] / O.tot * 100) + '%'; }).join(" · ") + '</small></div></div>'; });
      } else if (ov) ov.innerHTML = '';
    });
  }
  function save(L){ ls("elsmy", L); }
  function bindItems(el){
    [].forEach.call(el.querySelectorAll("[data-emx]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var id = b.getAttribute("data-emx"); save(my().filter(function(x){ return x.id !== id; })); emDraw(); }; });
    [].forEach.call(el.querySelectorAll("[data-emd]"), function(i){ i.addEventListener("click", function(ev){ ev.stopPropagation(); }); i.onchange = function(){ var id = i.getAttribute("data-emd"), v = i.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return; save(my().map(function(x){ if (x.id === id) x.base = v; return x; })); emDraw(); }; });
    [].forEach.call(el.querySelectorAll("[data-emt]"), function(b){ b.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); var id = b.getAttribute("data-emt"); save(my().map(function(x){ if (x.id === id){ x.base = kst(); x.virt = 1; } return x; })); emDraw(); }; });
  }
  function pickDraw(){
    var el = document.getElementById("empick"); if (!el) return;
    el.innerHTML = '<div class="loading">청약 중 상품 불러오는 중…</div>';
    eload().then(function(R){
      var el2 = document.getElementById("empick"); if (!el2) return;
      var C = cands(R), have = {}; my().forEach(function(x){ have[x.id] = 1; });
      var qv = EM.q.trim(), list = C.filter(function(c){ return !qv || (c.nm + c.iss + c.key).toLowerCase().indexOf(qv.toLowerCase()) >= 0; });
      el2.innerHTML = '<input aria-label="상품·증권사·기초자산" class="em-q" id="emq" placeholder="🔎 상품·증권사·기초자산 (예: 삼성전자, KB)" value="' + e(EM.q) + '">' +
        '<div class="em-pl">' + (list.length ? list.slice(0, 40).map(function(c){ var q = parseKey(c.key);
          return '<div class="em-pr"><div><b>' + e(c.nm) + '</b><small>' + e(c.iss) + ' · ' + e(condTxt(q)) + (c.cpn != null ? ' · 연 ' + c.cpn + '%' : '') + ' · 청약 마감 ' + md(c.e) + '</small></div>' +
            (have[c.id] ? '<span class="mut">담음</span>' : '<button data-emp="' + e(c.id) + '">📌 담기</button>') + '</div>'; }).join("") : '<div class="empty">맞는 상품이 없어요 — 자료가 있는 기초자산(18개) 상품만 담을 수 있어요.</div>') + '</div>' +
        '<p class="note" style="margin:4px 0 0">기준일은 청약 마감 다음 평일(보통 발행일)로 잡아요 · 다르면 담은 뒤 고칠 수 있고 「오늘로」를 누르면 오늘 가입한 셈(🧪 가상)이에요.</p>';
      var qi = document.getElementById("emq");
      qi.addEventListener("click", function(ev){ ev.stopPropagation(); });
      qi.oninput = function(){ EM.q = qi.value; clearTimeout(pickDraw.t); pickDraw.t = setTimeout(function(){ pickDraw(); var n = document.getElementById("emq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); };
      [].forEach.call(el2.querySelectorAll("[data-emp]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var c = C.filter(function(x){ return x.id === b.getAttribute("data-emp"); })[0]; if (!c) return;
        var L = my(); L.push({id: c.id, nm: c.nm, iss: c.iss, key: c.key, base: nextWeekday(c.e || kst()), at: kst()}); save(L); EM.open = 0; emDraw(); }; });
    });
  }
  function elsMount(){
    var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== "els" || document.getElementById("elsmy")) return;
    if (root.querySelector(".loading") && !root.querySelector("#pdbody")) return;
    var box = document.createElement("section"); box.className = "card em no-clp"; box.id = "elsmy"; box.dataset.xc = "1";   // 길어도 「전체 보기」로 자르지 않음(simple.js)
    root.insertBefore(box, root.firstChild); emDraw();
  }
  // 펼친 미래에셋 ELS 카드 안에도 「📌 관제탑에 담기」
  function elsPinBtn(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot[data-k=els] .pd-e.on > .pd-x:not([data-em])"), function(p){
      p.setAttribute("data-em", "1"); var row = p.parentNode, o = __pdObj(row.dataset.x); o = o && o.o; if (!o || !o.isin) return;
      eload().then(function(R){ var k = R.rep && R.rep.by_id && R.rep.by_id[o.isin]; if (!k || (o.pp || 0) >= 100) return;
        var have = my().some(function(x){ return x.id === o.isin; }), b = document.createElement("button"); b.className = "em-add em-pin"; b.type = "button";
        b.textContent = have ? "📌 관제탑에 담겨 있어요" : "📌 내 ELS 관제탑에 담아 두기"; b.disabled = have;
        b.onclick = function(ev){ ev.stopPropagation(); var L = my(); if (!L.some(function(x){ return x.id === o.isin; })) L.push({id: o.isin, nm: o.n, iss: "미래에셋증권", key: k, base: nextWeekday(o.e || kst()), at: kst()}); save(L);
          b.textContent = "📌 담았어요 — 맨 위 관제탑"; b.disabled = true; var m = document.getElementById("elsmy"); if (m){ emDraw(); } };
        p.appendChild(b); });
    });
  }
  window.__elsMy = {monitor: monitor, simAt: simAt, parseKey: parseKey, align: align, sparse: sparse, epx: epx, load: eload};   // 검사용

  /* ═════════ ③ 👁 내 눈 vs 거름망 ═════════ */
  // 저장: eyeScr = {"2026-10-22": ["SYM", …]} (그날 「볼 만함」 누른 것) · 그날 목록 전체는 화면에서 본 screens.json 을 다시 받음
  function eyes(){ var o = ls("eyeScr"); return o && typeof o === "object" ? o : {}; }
  function shard(sym){ if (typeof window.opShard === "function") return opShard(sym); var h = 0x811c9dc5, b = new TextEncoder().encode(sym); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } var x = (h % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  var PSH = {};
  function pShard(sh){ if (!PSH[sh]) PSH[sh] = getJSON(OPD + "p/" + sh + ".json", {ttl: 3600e3}).catch(function(){ return {}; }); return PSH[sh]; }
  function lastPx(sym){ var c = /^\d{6}$/.test(sym) ? [sym + ".KS", sym + ".KQ"] : [sym];
    return Promise.all(c.map(function(s){ return pShard(shard(s)).then(function(j){ return j && j[s]; }); })).then(function(r){ for (var i = 0; i < r.length; i++) if (r[i]) return r[i]; return null; }); }
  var SCR = {};
  function scrDay(d){ if (!SCR[d]) SCR[d] = getJSON("archive/screen/" + d + "/screens.json", {ttl: 3600e3}).catch(function(){ SCR[d] = null; return null; }); return SCR[d]; }
  function rowsOf(D){ var m = {}; ["quiet", "lead", "hush", "triple"].forEach(function(k){ (D && D[k] || []).forEach(function(r){ if (r && r.s && r.c != null && !m[r.s]) m[r.s] = {s: r.s, n: r.n, c: +r.c}; }); }); return m; }
  function scoreDay(d, picks){
    var key = "eyeSc:" + d;
    return scrDay(d).then(function(D){
      if (!D) return null;
      var R = rowsOf(D), syms = Object.keys(R), sd = D.date || d;
      return Promise.all(syms.map(function(s){ return lastPx(s).then(function(p){ return p && p[0] > sd && p[1] > 0 ? {s: s, r: (p[1] / R[s].c - 1) * 100, at: p[0]} : null; }); })).then(function(rs){
        var P = {}; picks.forEach(function(s){ P[s] = 1; });
        var a = [], b = [], at = ""; rs.forEach(function(x){ if (!x) return; (P[x.s] ? a : b).push(x); if (x.at > at) at = x.at; });
        var avg = function(L){ if (!L.length) return null; var s = 0; L.forEach(function(x){ s += x.r; }); return s / L.length; };
        var all = a.concat(b), out = {d: d, n_pick: a.length, n_skip: b.length, pick: avg(a), skip: avg(b), all: avg(all), at: at,
          jump: b.filter(function(x){ return x.r >= 10; }).sort(function(x, y){ return y.r - x.r; }).slice(0, 2).map(function(x){ return {s: x.s, n: R[x.s].n, r: x.r}; })};
        ls(key, out); return out;
      });
    });
  }
  function eyeScores(){
    var E = eyes(), days = Object.keys(E).filter(function(d){ return (E[d] || []).length && d < kst(); }).sort().slice(-20);
    return Promise.all(days.map(function(d){ return scoreDay(d, E[d]); })).then(function(L){ return L.filter(function(x){ return x && x.n_pick; }); });
  }
  function eyeSum(L){
    var np = 0, sp = 0, sa = 0, na = 0, win = 0;
    L.forEach(function(x){ np += x.n_pick; sp += x.pick * x.n_pick; sa += x.all * (x.n_pick + x.n_skip); na += x.n_pick + x.n_skip; if (x.pick > x.all) win++; });
    return {days: L.length, np: np, pick: np ? sp / np : null, all: na ? sa / na : null, win: win};
  }
  var SCR_SEL = "";
  function scrMount(){
    if (!document.getElementById("scrk")) return;
    var root = document.getElementById("scrk").parentNode, date = curScrDate();
    if (!date) return;
    if (!root.querySelector("#eyesum")){ var s = document.createElement("div"); s.id = "eyesum"; s.className = "eye-sum"; root.insertBefore(s, root.firstChild); eyeTop(); }
    var E = eyes(), mine = E[date] || [];
    [].forEach.call(root.querySelectorAll(".list .st"), function(st){
      if (st.querySelector(".eye-b")) return;
      var a = st.querySelector(".nm a"), m = a && /openOP\('([^']+)'\)/.exec(a.getAttribute("href") || ""); if (!m) return;
      var sym = m[1].replace(/\\'/g, "'"), on = mine.indexOf(sym) >= 0, b = document.createElement("button");
      b.type = "button"; b.className = "eye-b" + (on ? " on" : ""); b.textContent = on ? "👁 볼 만함 ✓" : "👁 볼 만함"; b.dataset.s = sym;
      b.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); var E2 = eyes(), L = E2[date] || [], i = L.indexOf(sym);
        if (i >= 0) L.splice(i, 1); else L.push(sym); E2[date] = L; ls("eyeScr", E2);
        var on2 = L.indexOf(sym) >= 0; b.classList.toggle("on", on2); b.textContent = on2 ? "👁 볼 만함 ✓" : "👁 볼 만함"; eyeTop(); };
      st.appendChild(b);
    });
  }
  function curScrDate(){ var d = window.curDate; return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }   // 고른 날짜 칩(index.html 전역 curDate)
  function eyeTop(){
    var el = document.getElementById("eyesum"); if (!el) return;
    var date = curScrDate(), E = eyes(), today = (E[date] || []).length;
    var head = '<div class="eye-h"><b>👁 내 눈 vs 거름망</b><small>' + (date ? md(date) + ' 볼 만함 ' + today + '개 찍음' : '') + ' · 안 누른 건 넘긴 것으로 셈</small></div>';
    el.innerHTML = head + '<div class="eye-l mut">채점 불러오는 중…</div>';
    eyeScores().then(function(L){
      var el2 = document.getElementById("eyesum"); if (!el2) return;
      if (!L.length){ el2.innerHTML = head + '<div class="eye-l">카드마다 「👁 볼 만함」을 누르면 <b>다음 날 아침부터</b> 「찍은 것 vs 거름망 전체」를 그날 종가 → 가장 최근 종가로 채점해요.</div>'; return; }
      var x = L[L.length - 1], S = eyeSum(L), dif = x.pick - x.all, sd = S.pick - S.all;
      el2.innerHTML = head +
        '<div class="eye-l">' + md(x.d) + ' 찍은 <b>' + x.n_pick + '개</b> <b class="' + cl(x.pick) + '">' + sg(x.pick, 1) + '%</b> · 안 찍은 ' + x.n_skip + '개 ' + sg(x.skip, 1) + '%</div>' +
        '<div class="eye-k">내 눈이 거름망보다 <b class="' + cl(dif) + '">' + sg(dif, 1) + '%p</b></div>' +
        '<div class="eye-s">거름망 전체 ' + sg(x.all, 1) + '% · ' + md(x.d) + ' 종가 → ' + md(x.at) + ' 종가' + (L.length > 1 ? ' · 쌓인 ' + S.days + '일 ' + S.np + '개 평균 ' + sg(sd, 1) + '%p (' + S.win + '/' + S.days + '일 이김)' : '') + '</div>' +
        (x.jump.length ? '<div class="eye-j">😬 넘긴 것 중 크게 뛴 것: ' + x.jump.map(function(j){ return '<a href="javascript:openOP(\'' + e(j.s) + '\')">' + e(j.n || j.s) + '</a> ' + sg(j.r, 0) + '%'; }).join(" · ") + '</div>' : '');
    });
  }
  // 📊 성적표 카드
  function scoreMount(){
    var m = document.getElementById("main"); if (!m || document.getElementById("eyescore")) return;
    var anchor = m.querySelector(".sc-c"); if (!anchor || (window.cur && cur !== "score")) return;
    var E = eyes(); if (!Object.keys(E).some(function(d){ return (E[d] || []).length; })) return;
    var s = document.createElement("section"); s.className = "card sc-c"; s.id = "eyescore"; s.dataset.goto = "screen";
    s.innerHTML = '<div class="sc-h"><div><b>👁 내 눈 — 아침 거르기</b><small>내가 「볼 만함」 찍은 종목 vs 그날 거름망 전체</small></div></div><div class="eye-l mut">채점 불러오는 중…</div>';
    anchor.parentNode.insertBefore(s, anchor);
    eyeScores().then(function(L){
      var el = document.getElementById("eyescore"); if (!el) return;
      if (!L.length){ el.querySelector(".eye-l").innerHTML = '찍은 다음 날부터 채점돼요.'; return; }
      var S = eyeSum(L), d = S.pick - S.all;
      el.innerHTML = '<div class="sc-h"><div><b>👁 내 눈 — 아침 거르기</b><small>찍은 날 종가 → 가장 최근 종가 · ' + S.days + '일 · ' + S.np + '개</small></div><div class="eye-big"><b class="' + cl(d) + '">' + sg(d, 1) + '%p</b><small>거름망보다</small></div></div>' +
        '<div class="eye-dots">' + L.map(function(x){ var v = x.pick - x.all; return '<i class="' + (v > 0 ? "w" : "l") + '" title="' + x.d + ' ' + sg(v, 1) + '%p"></i>'; }).join("") + '</div>' +
        '<div class="eye-l mut">찍은 것 평균 ' + sg(S.pick, 1) + '% · 거름망 전체 ' + sg(S.all, 1) + '% · 이긴 날 ' + S.win + '/' + S.days + (S.days < 10 ? ' · 10일 쌓이기 전엔 참고만' : '') + '</div>';
    });
  }

  /* ── 붙이기 ── */
  var T = null;
  function tick(){ T = null; try { homePanic(); } catch(x) { console.warn(x); } try { elsMount(); elsPinBtn(); } catch(x) { console.warn(x); } try { scrMount(); } catch(x) { console.warn(x); } try { scoreMount(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".hmpn{cursor:pointer}.pnh-h b{display:block;font-size:var(--fs-h,17px);font-weight:800;word-break:keep-all}.pnh-h small{display:block;font-size:12.5px;color:var(--sub);margin:3px 0 4px;word-break:keep-all}" +
    ".pnh-r{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:baseline;padding:7px 0;border-top:1px solid var(--line);font-size:13.5px}.pnh-r>b{font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap}.pnh-r b.up{color:var(--up)}.pnh-r b.dn{color:var(--down)}" +
    ".pnh-r em{font-style:normal;font-size:12.5px;color:var(--sub);white-space:nowrap;text-align:right}.pnh-r em b{color:var(--text);font-size:12.5px}.pnh-b{grid-template-columns:auto 1fr}.pnh-b span{grid-column:1/-1;font-weight:700;word-break:keep-all}.pnh-b em{text-align:left;white-space:normal}.pnh-go{margin-top:6px;font-size:13px;font-weight:700;color:var(--acc,#7c9cff)}" +
    ".em-hd b{display:block;font-size:var(--fs-h,17px);font-weight:800}.em-hd small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px}.em-in{font-size:13px;color:var(--sub);margin:8px 0;word-break:keep-all}.em-in b{color:var(--text)}" +
    ".em-add{display:block;width:100%;margin:8px 0 0;border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}.em-add:disabled{opacity:.7}" +
    ".em-q{width:100%;box-sizing:border-box;margin:8px 0 4px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:14px}" +
    ".em-pl{max-height:360px;overflow:auto}.em-pr{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}.em-pr b{font-size:13.5px}.em-pr small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".em-pr button{flex:none;border:0;background:#f4a261;color:#111;border-radius:999px;padding:6px 11px;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer}" +
    ".em-it{margin:10px 0 0;padding:10px 0 0;border-top:1px solid var(--line)}.em-ih{display:flex;justify-content:space-between;gap:8px}.em-ih b{font-size:14.5px}.em-ih small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".em-x{flex:none;border:0;background:none;color:var(--sub);font-size:16px;cursor:pointer;padding:0 4px;height:28px}.em-v{font-size:12.5px;padding:1px 6px;border-radius:999px;background:var(--panel2);color:var(--sub)}" +
    ".em-k{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.em-k>div{background:var(--panel2);border-radius:10px;padding:7px 4px;text-align:center}.em-k small,.em-k em{display:block;font-size:12.5px;color:var(--sub);font-style:normal;word-break:keep-all}" +
    ".em-k b{display:block;font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap;margin:1px 0}.em-k b.up,.em-ua b.up{color:var(--up)}.em-k b.dn,.em-ua b.dn{color:var(--down)}" +
    ".em-ua{display:grid;grid-template-columns:88px 1fr 58px;gap:8px;align-items:center;font-size:12.5px;margin:5px 0}.em-ua span i{font-style:normal;font-size:12.5px;color:#ff6b6b;display:block}.em-ua>b{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".pnh-now{background:rgba(255,80,80,.08);border-radius:8px;padding:6px 8px}.em-tr{position:relative;height:8px;border-radius:4px;background:var(--panel2)}.em-tr i{position:absolute;top:-3px;bottom:-3px;width:2px}.em-bar{background:#3fb950}.em-ki{background:#ff6b6b}.em-tr .em-dot{width:12px;height:12px;top:-2px;bottom:auto;border-radius:50%;margin-left:-6px;background:var(--text);border:2px solid var(--panel)}" +
    ".em-lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub)}.em-lg i{display:inline-block;width:2px;height:10px;margin-right:4px;vertical-align:middle}" +
    ".em-hs{font-size:12.5px;margin:8px 0 0;word-break:keep-all}.em-hb{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1px;margin:5px 0 3px}.em-hb .a,.em-hl i.a{background:#3fb950}.em-hb .b,.em-hl i.b{background:#8fd19e}.em-hb .c,.em-hl i.c{background:#8a94a8}.em-hb .d,.em-hl i.d{background:#ff6b6b}" +
    ".em-hl{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:12.5px;color:var(--sub)}.em-hl b{color:var(--text)}.em-hl i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:3px}" +
    ".em-dt{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--sub);margin:8px 0 0}.em-dt input{font:inherit;font-size:13px;padding:3px 6px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.em-dt button{border:1px solid var(--line);background:none;color:var(--sub);border-radius:999px;padding:3px 8px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".em-l{font-size:13px;margin:6px 0 0;word-break:keep-all}.em-ok{color:#3fb950}" +
    ".em-ov{display:flex;gap:10px;align-items:center;margin:10px 0 0;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,#f4a261 12%,var(--panel2));font-size:12.5px;word-break:keep-all}.em-ov small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}" +
    ".em-ovb{flex:none;text-align:center;min-width:54px}.em-ovb b{display:block;font-size:24px;font-variant-numeric:tabular-nums}.em-ovb small{margin:0}" +
    ".eye-b{display:block;margin:8px 0 0 auto;border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:3px 9px;font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap}.eye-b.on{background:#7ee0b5;color:#0b2;border-color:transparent;font-weight:800;color:#063}" +
    ".eye-sum{margin:0 0 10px;padding:10px 12px;border-radius:14px;background:var(--panel)}.eye-h b{font-size:15px}.eye-h small{display:block;font-size:12.5px;color:var(--sub)}.eye-l{font-size:13px;margin-top:5px;word-break:keep-all}.eye-s{font-size:12.5px;color:var(--sub);margin-top:2px;word-break:keep-all}.eye-l b.up,.eye-k b.up,.eye-big b.up{color:var(--up)}.eye-l b.dn,.eye-k b.dn,.eye-big b.dn{color:var(--down)}" +
    ".eye-k{margin-top:4px;font-size:14px;font-weight:700}.eye-j{margin-top:4px;font-size:12.5px;color:var(--sub)}.eye-big{margin-left:auto;text-align:right}.eye-big b{display:block;font-size:24px;font-variant-numeric:tabular-nums}.eye-big small{font-size:12.5px;color:var(--sub)}" +
    ".eye-dots{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0 2px}.eye-dots i{width:10px;height:10px;border-radius:50%}.eye-dots i.w{background:#3fb950}.eye-dots i.l{background:#ff6b6b}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
/* ======== ux1023.js ======== */
/* 10/23 사용자 「1,2,3 다 진행하고 내 돈 전체 비상 훈련도 진행」 — 📱 앱 아이디어 A10/23-1·2·3 + 🧯 비상 훈련
   ① 🐇🐢 누가 먼저 말했나 (A10/23-1) — 📄 종목 화면 「🧵 앱 성적표」 위: 피드 채널마다 이 종목 이름을 처음 부른 때를 주가 선 위 점으로 +
      「그 뒤 ±%」 · 📣 채널 성적표 줄마다 「🐇 먼저 m/n · 평균 n일 늦음」.
      자료: market-strategy-report feeds/lead.json (src/feed_score.py · 평일 07:25·16:10 — 시세는 야후 일봉)
   ② 🧬 DNA 쌍둥이 (A10/23-2) — 📄 종목 화면 DNA 레이더 밑: 다섯 축(성장·수익성·싸다·주가 힘·전문가)이 가장 가까운 종목 5개, 업종 무관 ·
      덩치(시총) ±1 단계 안 · 같은 회사(우선주·ADR·두 종류 주식)는 뺌. 자료: opdata/dna.json (opdb/dna.py · opprice 뒤)
   ③ 🔬 내 돈 속 진짜 종목 (A10/23-3) — 💼 포트 설계기 밑: 설계기 비중(S&P·나스닥·금·현금·종목) × 투자금 + 📌 담아 둔 펀드(금액)를
      구성 종목까지 풀어 「내 돈의 ○%는 사실 상위 7종목」 · 「나스닥 몫 중 S&P 에도 든 종목 ○%」 · 슬라이더를 밀면 같이 움직임.
      자료: archive/x/etf_hold.json (etf_hold.py · 하루 한 번 · SSGA·Invesco 공식 구성표) · archive/x/fund_hold.json (펀드 보유 상위)
   ④ 🧯 내 돈 전체 비상 훈련 — 💼 포트 설계기 밑: 지금 설계기 포트(투자금) + 📌 내 ELS 관제탑에 담은 ELS(금액)를
      2008·2011·2018·2020·2022·2025 S&P 큰 낙폭에 그대로 되돌려 「포트 −○원 · 회복까지 ○일 · 그 무렵 가입한 ELS 는 KI 닿음 ○% · 결국 손실 ○%」.
      「못 견딜 금액」을 넣으면 몇 번 넘었는지만(비중 제안 없음).
   원칙: 과거 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」). */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function s2day(s){ return Date.parse(String(s).slice(0, 10) + "T00:00:00Z") / 864e5; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function won(v){ var m = v / 1e4, a = Math.abs(m); return a >= 1e4 ? (m / 1e4).toFixed(a >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function J(u, t){ return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / (t || 600000)), {ttl: t || 600000}).catch(function(){ return null; }); }
  function stop(el){ el.addEventListener("click", function(ev){ ev.stopPropagation(); }); }
  function names(){ var m = {}; (window.OPIDX || []).forEach(function(x){ m[x.sym] = x.name; }); return m; }
  var FLAG = {KR: "🇰🇷", US: "🇺🇸", JP: "🇯🇵", CN: "🇨🇳", HK: "🇭🇰"};
  function mkOf(s){ return /\.K[SQ]$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /\.(SS|SZ)$/.test(s) ? "CN" : "US"; }
  function sameSym(a, b){ a = String(a || ""); b = String(b || ""); if (a === b) return true; var ca = a.split(".")[0], cb = b.split(".")[0]; return /^\d{6}$/.test(ca) && ca === cb; }

  /* ═════════ ① 🐇🐢 누가 먼저 말했나 ═════════ */
  var LD = null;
  function lead(){ if (!LD) LD = J(RAWM + "feeds/lead.json", 600000).then(function(j){ if (!j) LD = null; return j; }); return LD; }
  function leadOf(L, sym){ if (!L || !L.s) return null; if (L.s[sym]) return L.s[sym]; for (var k in L.s) if (sameSym(k, sym)) return L.s[k]; return null; }
  var LCOL = ["#f4a261", "#7ee0b5", "#5ac8fa", "#c792ea", "#ffd166", "#ff8fa3", "#8ab4f8", "#b5e48c", "#f7a072", "#9aa5b1", "#e9c46a"];
  function leadChart(x, since){
    var px = x.px || []; if (px.length < 2) return "";
    var W = 340, H = 118, L = 8, R = 8, T = 10, B = 20, t0 = s2day(px[0][0]), t1 = s2day(px[px.length - 1][0]);
    x.first.forEach(function(f){ var t = s2day(f[0]); if (t > t1) t1 = t; });
    var lo = Infinity, hi = -Infinity; px.forEach(function(p){ if (p[1] < lo) lo = p[1]; if (p[1] > hi) hi = p[1]; });
    var pad = (hi - lo) * 0.12 || hi * 0.02; lo -= pad; hi += pad;
    var X = function(t){ return L + (t - t0) / Math.max(1, t1 - t0) * (W - L - R); }, Y = function(v){ return T + (hi - v) / (hi - lo) * (H - T - B); };
    var at = function(d){ var t = s2day(d), v = px[0][1]; for (var i = 0; i < px.length; i++){ if (s2day(px[i][0]) <= t) v = px[i][1]; else break; } return v; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ld-svg" role="img" aria-label="주가 선 위 채널별 첫 언급">';
    var ts = s2day(since);
    if (ts > t0 && ts < t1) s += '<line x1="' + X(ts).toFixed(1) + '" x2="' + X(ts).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" class="ld-since"/><text x="' + (X(ts) + 3).toFixed(1) + '" y="' + (T + 8) + '" class="ld-tx">기록 시작</text>';
    s += '<polyline fill="none" class="ld-line" points="' + px.map(function(p){ return X(s2day(p[0])).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
    var stk = {};   // 같은 날 여러 채널이면 점을 위로 쌓음
    x.first.forEach(function(f, i){ var k = f[0], j = stk[k] = (stk[k] || 0) + 1, cx = X(s2day(f[0])), cy0 = Y(at(f[0])), cy = cy0 - (j - 1) * 12 * (cy0 > H / 2 ? 1 : -1);
      if (j > 1) s += '<line x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + cy0.toFixed(1) + '" y2="' + cy.toFixed(1) + '" stroke="var(--sub)" stroke-width=".8"/>';
      s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="6" fill="' + LCOL[i % LCOL.length] + '" stroke="var(--panel)" stroke-width="1.5"/><text x="' + cx.toFixed(1) + '" y="' + (cy + 3.2).toFixed(1) + '" text-anchor="middle" class="ld-n">' + (i + 1) + '</text>'; });
    s += '<text x="' + L + '" y="' + (H - 5) + '" class="ld-tx">' + md(px[0][0]) + '</text><text x="' + (W - R) + '" y="' + (H - 5) + '" text-anchor="end" class="ld-tx">' + md(px[px.length - 1][0]) + ' 종가</text></svg>';
    return s;
  }
  function leadCard(L, x){
    var F = x.first, n = F.length, d0 = s2day(F[0][0]);
    var rows = F.map(function(f, i){
      var lag = Math.round(s2day(f[0]) - d0), ic = i === 0 ? "🐇" : (i === n - 1 && n > 2 ? "🐢" : "");
      return '<div class="ld-r"><i style="background:' + LCOL[i % LCOL.length] + '">' + (i + 1) + '</i><span class="ld-d">' + md(f[0]) + (f[1] ? '<small>' + e(f[1]) + '</small>' : '') + '</span>' +
        '<span class="ld-c">' + ic + ' ' + (f[4] ? '<a href="' + e(f[4]) + '" target="_blank" rel="noopener">' + e(String(f[3]).replace(/\s*\(.*\)/, "")) + ' ↗</a>' : e(f[3])) +
        '<small>' + (i === 0 ? (x.pre ? '기록 첫날부터 부름' : '가장 먼저') : (lag === 0 ? '같은 날' : '+' + lag + '일 늦음')) + '</small></span>' +
        '<b class="' + cl(f[5]) + '">' + (f[5] == null ? '<span class="mut">채점 전</span>' : sg(f[5], 1) + '%') + '</b></div>'; }).join("");
    var gap = n >= 2 ? Math.round(s2day(F[1][0]) - d0) : null, last = n >= 2 ? Math.round(s2day(F[n - 1][0]) - d0) : null;
    var lc = L.ch && L.ch[F[0][2]];
    var head = n === 1 ? '채널 1곳만 불렀어요 · 언급 ' + x.cnt + '번' : '채널 ' + n + '곳 · 언급 ' + x.cnt + '번 · 둘째 채널까지 ' + (gap === 0 ? '같은 날' : gap + '일') + (last ? ' · 마지막은 ' + last + '일 뒤' : '');
    return '<section class="card ldc"><h3>🐇🐢 누가 먼저 말했나 <span class="mut">' + head + '</span></h3>' + leadChart(x, L.since) +
      '<div class="ld-rs">' + rows + '</div>' +
      '<p class="ld-s">숫자 = 그 채널이 처음 부른 날(또는 뒤 첫 거래일) 종가 → ' + md((x.last || [])[0]) + ' 종가' +
        (lc && lc.n >= 5 ? ' · 🐇 ' + e(String(lc.name).replace(/\s*\(.*\)/, "")) + '은(는) 여러 채널이 부른 종목 ' + lc.n + '개 중 <b>' + lc.first + '번</b> 가장 먼저' : '') + '</p>' +
      '<p class="note" style="margin:4px 0 0">피드 기록이 ' + md(L.since) + '부터라 ' + (x.pre ? '<b>이 종목은 그날 이미 불렸어요 — 실제로는 더 먼저 말한 곳이 있을 수 있어요</b>' : '그 전 언급은 몰라요') + ' · 사람 글(텔레그램·블로그)만 · 먼저 말한 채널이 더 낫다는 뜻도, 사라는 뜻도 아니에요.</p></section>';
  }
  function leadMount(){
    var el = document.getElementById("opsig"); if (!el || el.querySelector(".ldc") || el.dataset.ld === CURSYM) return;
    var sym = CURSYM; if (!sym) return; el.dataset.ld = sym;
    lead().then(function(L){
      var x = leadOf(L, sym), el2 = document.getElementById("opsig"); if (!x || !el2 || CURSYM !== sym || el2.querySelector(".ldc")) return;
      var w = document.createElement("div"); w.innerHTML = leadCard(L, x); var sec = w.firstChild;
      var t = el2.querySelector(".tlc"); if (t) t.parentNode.insertBefore(sec, t); else el2.appendChild(sec);
    });
  }
  // 📣 채널 성적표 줄마다 「🐇 먼저」
  function feedLead(){
    var rs = document.querySelectorAll(".fd-scr[data-fk]:not([data-ld])"); if (!rs.length) return;
    lead().then(function(L){ if (!L || !L.ch) return;
      [].forEach.call(document.querySelectorAll(".fd-scr[data-fk]:not([data-ld])"), function(r){
        r.setAttribute("data-ld", "1"); var c = L.ch[r.getAttribute("data-fk")], v = r.querySelector(".fd-scv"); if (!v) return;
        var s = document.createElement("span"); s.className = "ld-fs";
        s.innerHTML = c && c.n ? '🐇 먼저 <b>' + c.first + '/' + c.n + '</b>' + (c.lag != null ? ' · 뒤따를 땐 평균 ' + c.lag + '일 늦음' : '') : '<span class="mut">🐇 여러 채널이 부른 종목 없음</span>';
        v.appendChild(s); });
      var h = document.querySelector(".fd-scc h3"); if (h && !document.getElementById("ldnote")){ var p = document.createElement("p"); p.id = "ldnote"; p.className = "note"; p.style.margin = "0 0 6px";
        p.innerHTML = '🐇 먼저 m/n = 2개 넘는 채널이 부른 종목 n개 중 이 채널이 가장 먼저 부른 수 (' + md(L.since) + ' 기록 첫날에 이미 불린 종목은 뺌 · 둘째 채널까지 보통 ' + (L.gap_med == null ? '–' : L.gap_med + '일') + ') · 종목 화면에 「누가 먼저 말했나」'; h.parentNode.insertBefore(p, h.nextSibling); }
    });
  }

  /* ═════════ ② 🧬 DNA 쌍둥이 ═════════ */
  var DNA = null;
  function dna(){ if (!DNA) DNA = J(OPD + "dna.json", 3600e3).then(function(j){ if (!j || !j.rows) { DNA = null; return null; } var m = {}; j.rows.forEach(function(r){ m[r[0]] = r; }); j.by = m; return j; }); return DNA; }
  function twinsOf(D, me){
    var out = [], same = function(a, b){ return (a[11] && a[11] === b[11]) || (a[7] && a[7] === b[7] && b[10] && Math.abs(Math.log(a[10] / b[10])) < 0.14); };
    D.rows.forEach(function(r){
      if (r[0] === me[0] || Math.abs(r[6] - me[6]) > 1 || same(r, me) || (r[8] && r[8] === me[8])) return;
      var d = 0; for (var i = 1; i <= 5; i++) d += (r[i] - me[i]) * (r[i] - me[i]);
      out.push([Math.sqrt(d), r]); });
    out.sort(function(a, b){ return a[0] - b[0]; });
    var pick = [];
    for (var k = 0; k < out.length && pick.length < 5; k++){ var r = out[k][1]; if (pick.some(function(p){ return same(p[1], r); })) continue; pick.push(out[k]); }
    return pick;
  }
  function mini(me, r){
    var W = 64, c = 32, R = 26, pt = function(i, v){ var a = -Math.PI / 2 + i * 2 * Math.PI / 5; return (c + R * v / 100 * Math.cos(a)).toFixed(1) + "," + (c + R * v / 100 * Math.sin(a)).toFixed(1); };
    var poly = function(x){ return [1, 2, 3, 4, 5].map(function(i){ return pt(i - 1, x[i]); }).join(" "); };
    return '<svg viewBox="0 0 ' + W + ' ' + W + '" class="dt-rd"><polygon points="' + [0, 1, 2, 3, 4].map(function(i){ return pt(i, 100); }).join(" ") + '" fill="none" stroke="var(--line)"/>' +
      '<polygon points="' + poly(me) + '" fill="none" stroke="#8a94a8" stroke-dasharray="3 2" stroke-width="1.4"/><polygon points="' + poly(r) + '" fill="#5ac8fa" fill-opacity=".28" stroke="#5ac8fa" stroke-width="1.6"/></svg>';
  }
  function dnaCard(D, me){
    var T = twinsOf(D, me), N = names(), AX = D.axes;
    if (!T.length) return '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이</div><p class="note">덩치가 비슷한 종목 중 다섯 축이 다 있는 게 없어요.</p></div>';
    T.sort(function(a, b){ return b[1][3] - a[1][3] || a[0] - b[0]; });   // 같은 DNA 안에서 더 싼 것 먼저
    var word = function(d){ return d < 20 ? "아주 닮음" : d < 40 ? "닮음" : d < 60 ? "조금 닮음" : "멀리 닮음"; };
    var rows = T.map(function(z){ var r = z[1], df = [];
      for (var i = 1; i <= 5; i++) df.push([AX[i - 1], r[i] - me[i]]);
      df.sort(function(a, b){ return Math.abs(b[1]) - Math.abs(a[1]); });
      var diff = df.slice(0, 2).filter(function(x){ return Math.abs(x[1]) >= 8; }).map(function(x){ return '<span class="' + (x[1] > 0 ? "dt-p" : "dt-m") + '">' + x[0] + ' ' + (x[1] > 0 ? "↑" : "↓") + Math.abs(x[1]) + '</span>'; }).join("");
      var nm = N[r[0]] || r[8] || r[0];
      return '<a class="dt-r" href="javascript:openOP(\'' + e(r[0]) + '\')">' + mini(me, r) + '<span class="dt-b"><b>' + FLAG[mkOf(r[0])] + ' ' + e(String(nm).slice(0, 18)) + '</b><small>' + e(r[7] || "") + ' · PER ' + r[9] + '배 · ' + word(z[0]) + '</small>' +
        '<span class="dt-df">' + (diff || '<span class="mut">다섯 축이 거의 같음</span>') + '</span></span></a>'; }).join("");
    var mine = '<span class="dt-me">이 종목 ' + AX.map(function(a, i){ return a + ' ' + me[i + 1]; }).join(" · ") + '</span>';
    return '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이 <span class="mut">숫자가 가장 닮은 5개 · 업종 상관없이 · 더 싼 것 먼저</span></div>' + mine + rows +
      '<p class="note">점선 = 이 종목 · 파란 칸 = 쌍둥이 · ↑↓ = 이 종목보다 높고 낮은 축(싸다 ↑ = 업종 대비 PER 더 낮음) · 🌏 동종주(같은 업종)와 달리 업종을 안 봐요 · 덩치(시총) 약 3배 안 · 우선주·ADR 같은 같은 회사는 뺌 · 「신호」 축은 뺌 · 적자 등 PER 없는 종목은 빠짐 · PER 은 오늘 종가로 맞춤(' + e(String(D.updated || "").slice(5, 16)) + ') · 숫자 비교일 뿐 사라는 뜻이 아니에요.</p></div>';
  }
  function dnaMount(){
    var w = document.querySelector("#opsig .opx .rd-w"); if (!w || !CURSYM) return;
    var host = w.parentNode; if (host.querySelector(".dnt") || host.dataset.dn === CURSYM) return;
    var sym = CURSYM; host.dataset.dn = sym;
    var idx = typeof opLoadIdx === "function" && !window.OPIDX ? opLoadIdx().catch(function(){}) : Promise.resolve();
    Promise.all([dna(), idx]).then(function(r){
      var D = r[0], w2 = document.querySelector("#opsig .opx .rd-w"); if (!w2 || CURSYM !== sym || w2.parentNode.querySelector(".dnt")) return;
      var me = D && (D.by[sym] || D.by[sym + ".KS"] || D.by[sym + ".KQ"]);
      var box = document.createElement("div");
      box.innerHTML = !D ? '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이</div><p class="note">쌍둥이 자료를 아직 못 받았어요 — 잠시 뒤 다시 열어 주세요.</p></div>'
        : !me ? '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이</div><p class="note">이 종목은 다섯 축 자료(매출 2년·PER·1년 가격·애널리스트 목표가) 중 빠진 게 있어서 쌍둥이를 못 찾아요.</p></div>' : dnaCard(D, me);
      w2.parentNode.insertBefore(box.firstChild, w2.nextSibling);
    });
  }

  /* ═════════ ③ 🔬 내 돈 속 진짜 종목 ═════════ */
  var EH = null, FH = null, PRODF = null;
  function etfH(){ if (!EH) EH = J("archive/x/etf_hold.json", 3600e3).then(function(j){ if (!j) EH = null; return j; }); return EH; }
  function fundH(){ if (!FH) FH = Promise.all([J("archive/x/fund_hold.json", 3600e3), J("archive/x/products.json", 3600e3)]).then(function(r){ if (!r[0]) { FH = null; return null; } PRODF = (r[1] && r[1].funds) || []; return r[0]; }); return FH; }
  function nn(s){ return String(s || "").toUpperCase().replace(/\(.*?\)/g, " ").replace(/[^A-Z0-9가-힣 ]/g, " ").replace(/\b(CORP(ORATION)?|INC|CO|LTD|PLC|NV|SA|AG|SE|CLASS [ABC]|CL [ABC]|COM|COMMON|STOCK|SHS|ORD|THE|HOLDINGS?|GROUP|ADR|SPON(SORED)?|NEW)\b/g, " ").replace(/\s+/g, " ").trim(); }
  var KO = {"NVDA": "엔비디아", "AAPL": "애플", "MSFT": "마이크로소프트", "AMZN": "아마존", "GOOGL": "알파벳 A", "GOOG": "알파벳 C", "META": "메타", "AVGO": "브로드컴", "TSLA": "테슬라", "BRK-B": "버크셔 B", "NFLX": "넷플릭스", "AMD": "AMD", "COST": "코스트코", "PLTR": "팔란티어", "MU": "마이크론", "JPM": "JP모건", "LLY": "일라이 릴리", "WMT": "월마트", "V": "비자", "ORCL": "오라클"};
  function myFunds(){ var a = ls("xrFunds"); return Array.isArray(a) ? a : []; }
  var XR = {open: 0, q: "", sig: ""};
  function xrCalc(E, FHd){
    var C = window.__pdz && __pdz.cfg ? __pdz.cfg() : null; if (!C) return null;
    var A = amt(), w = C.w, SX = C.sx || [], x = SX.reduce(function(t, o){ return t + (+o.w || 0) / 100; }, 0), BD = C.bd || {}, bt = 0; for (var bk in BD) bt += BD[bk] / 100;   // 🏦 11/17 섞은 채권만큼 떼어 냄
    var k = Math.max(0, 1 - x - bt);
    var parts = {SPY: A * w.SPY / 100 * k, QQQ: A * w.QQQ / 100 * k, GLD: A * w.GLD / 100 * k, BIL: A * Math.max(0, 100 - w.SPY - w.QQQ - w.GLD) / 100 * k};
    var M = {}, add = function(key, nm, v, src){ if (!(v > 0)) return; var o = M[key] || (M[key] = {nm: nm, v: 0, s: {}}); o.v += v; o.s[src] = (o.s[src] || 0) + v; };
    var et = (E && E.etf) || {}, byName = {};
    ["SPY", "QQQ"].forEach(function(f){ ((et[f] || {}).top || []).forEach(function(h){ byName[nn(h[1])] = h[0]; }); });
    var expand = function(f, v, src){ var H = et[f]; if (!H || !H.top){ add("~" + f, f === "SPY" ? "S&P500 (구성 자료 없음)" : "나스닥100 (구성 자료 없음)", v, src); return; }
      H.top.forEach(function(h){ add(h[0], KO[h[0]] || h[1], v * h[2] / 100, src); }); if (H.rest > 0) add("~" + f + "r", (f === "SPY" ? "S&P500 나머지 " : "나스닥100 나머지 ") + Math.max(0, H.n - H.top.length) + "종목", v * H.rest / 100, src); };
    expand("SPY", parts.SPY, "S"); expand("QQQ", parts.QQQ, "Q"); add("~GLD", "금", parts.GLD, "G"); add("~BIL", "현금·단기채", parts.BIL, "C");
    SX.forEach(function(o){ var v = A * (+o.w || 0) / 100; if (!o.e && !/^\^/.test(o.s)) add(o.s, KO[o.s] || o.n, v, "X"); else add("~X" + o.s, o.n, v, "X"); });   // ➕ 11/18 섞은 종목 — 개별 종목은 종목으로(미국 종목은 S&P·나스닥 속 같은 종목과 합침)
    var BDN = {IEF: "미국채 10년", TLT: "미국채 30년", BRBOND: "브라질국채"}; for (var bk2 in BD) add("~B" + bk2, BDN[bk2] || bk2, A * BD[bk2] / 100, "B");
    var tot = A, F = myFunds(), fmiss = 0;
    F.forEach(function(f){
      var fa = +f.amt || 0; if (!(fa > 0)) return; tot += fa;
      var h = FHd && FHd.items && FHd.items[f.id]; if (!h){ add("~F" + f.id, f.nm + " (구성 자료 없음)", fa, "F"); fmiss++; return; }
      var s = 0;
      h.h.forEach(function(r){ var v = fa * r[1] / 100; s += r[1];
        if (/S&P\s*500/i.test(r[0]) && /ETF|INDEX|TRUST/i.test(r[0])) return expand("SPY", v, "F");
        if (/NASDAQ[\s-]*100|\bQQQ\b/i.test(r[0])) return expand("QQQ", v, "F");
        if (r[2] === "주식"){ var t = byName[nn(r[0])]; add(t || "n:" + nn(r[0]), t ? (KO[t] || r[0]) : r[0], v, "F"); }
        else if (r[2] === "채권") add("~BOND", "채권(펀드 속)", v, "F");
        else if (/예금|CASH|증거금|콜론|\bRP\b|현금|예탁|USD CALL|미수|미지급/i.test(r[0])) add("~CASHF", "현금·기타(펀드 속)", v, "F");
        else add("~FF" + nn(r[0]), r[0].slice(0, 22) + " (펀드 속 다른 펀드 — 더 못 풂)", v, "F"); });
      if (s < 99.5) add("~Fr" + f.id, f.nm.slice(0, 14) + " — 공개 안 된 " + Math.round(100 - s) + "%", fa * (100 - s) / 100, "F");
    });
    var L = Object.keys(M).map(function(k2){ var o = M[k2]; o.k = k2; return o; });
    var stocks = L.filter(function(o){ return o.k.charAt(0) !== "~"; }).sort(function(a, b){ return b.v - a.v; });
    var top7 = stocks.slice(0, 7), t7 = top7.reduce(function(s, o){ return s + o.v; }, 0);
    // 나스닥 몫 중 S&P 에도 든 종목 비중
    var ov = null; if (et.SPY && et.QQQ && et.SPY.top && et.QQQ.top && et.SPY.top.length >= 400){ var inS = {}; et.SPY.top.forEach(function(h){ inS[h[0]] = 1; inS[h[0].replace("-", ".")] = 1; });
      ov = 0; et.QQQ.top.forEach(function(h){ if (inS[h[0]] || (h[0] === "GOOG" && inS.GOOGL) || (h[0] === "GOOGL" && inS.GOOG)) ov += h[2]; }); }
    var both = parts.SPY > 0 && parts.QQQ > 0 ? stocks.filter(function(o){ return o.s.S && o.s.Q; }).reduce(function(s, o){ return s + o.v; }, 0) : 0;
    return {A: A, tot: tot, top7: top7, t7: t7, ov: ov, both: both, nStock: stocks.length, F: F, fmiss: fmiss, E: E, parts: parts, cfg: C};
  }
  var SCOL = {S: "#3987e5", Q: "#d95926", F: "#9b6bd6", X: "#d55181"};
  function xrH(R){
    if (!R) return '<div class="loading">계산 중…</div>';
    var max = R.top7.length ? R.top7[0].v : 1;
    var bars = R.top7.map(function(o){ var seg = ["S", "Q", "F", "X"].map(function(s){ return o.s[s] ? '<i style="flex:' + (o.s[s] / max).toFixed(4) + ';background:' + SCOL[s] + '"></i>' : ''; }).join("");
      return '<div class="xr-r"><span>' + e(String(o.nm).slice(0, 14)) + '</span><div class="xr-b">' + seg + '<i style="flex:' + Math.max(0, 1 - o.v / max).toFixed(4) + '"></i></div><b>' + (o.v / R.tot * 100).toFixed(1) + '%</b><em>' + won(o.v) + '원</em></div>'; }).join("");
    var E = R.E && R.E.etf || {}, srcs = ["SPY", "QQQ"].filter(function(f){ return E[f]; }).map(function(f){ return (f === "SPY" ? "S&P500" : "나스닥100") + " " + E[f].src + " " + md(E[f].asof); }).join(" · ");
    return '<div class="xr-k"><div><small>내 돈 ' + won(R.tot) + '원 중</small><b>' + (R.t7 / R.tot * 100).toFixed(1) + '%</b><em>상위 7종목</em></div>' +
      '<div><small>종목 수</small><b>' + R.nStock.toLocaleString() + '</b><em>풀어 보니</em></div>' +
      '<div><small>나스닥 몫 중</small><b>' + (R.ov == null ? '–' : Math.round(R.ov) + '%') + '</b><em>S&P 에도 든 종목</em></div></div>' +
      (R.top7.length ? '<div class="xr-lg">' + [["S", "S&P500"], ["Q", "나스닥100"], ["F", "펀드"], ["X", "종목"]].filter(function(z){ return R.top7.some(function(o){ return o.s[z[0]]; }); }).map(function(z){ return '<span><i style="background:' + SCOL[z[0]] + '"></i>' + z[1] + ' 몫</span>'; }).join("") + '</div>' + bars : '<p class="empty">주식 비중이 0 이에요 — 설계기 막대를 밀어 보세요.</p>') +
      (R.both > 0 ? '<p class="xr-s">S&P 와 나스닥에 나눠 담았지만, <b>두 곳에 다 든 종목</b>에 들어간 돈이 <b>' + won(R.both) + '원(' + (R.both / R.tot * 100).toFixed(0) + '%)</b> — 이름은 둘이어도 같은 회사를 두 번 사고 있어요.</p>' : '') +
      '<div class="xr-f"><b>📌 펀드 더하기</b> <small>금액을 넣으면 그 펀드 속 보유 종목까지 같이 풀어요(휴대폰에만 저장)</small>' +
        R.F.map(function(f){ return '<div class="xr-fr"><span>' + e(f.nm.slice(0, 26)) + '</span><input type="number" inputmode="numeric" min="0" step="100" placeholder="만원" value="' + (f.amt ? Math.round(f.amt / 1e4) : "") + '" data-xfa="' + e(f.id) + '"><small>만원</small><button data-xfx="' + e(f.id) + '" aria-label="빼기">✕</button></div>'; }).join("") +
        '<button class="em-add" id="xradd">' + (XR.open ? '닫기 ▴' : '＋ 펀드 담기') + '</button><div id="xrpick"' + (XR.open ? '' : ' hidden') + '></div></div>' +
      '<p class="note" style="margin:6px 0 0">설계기 비중 × 투자금(' + won(R.A) + '원 · 💼 주문서 칸)' + (R.cfg.st ? ' · 종목 ' + e(R.cfg.st) + ' ' + R.cfg.stw + '%' : '') + ' · 막대를 밀면 같이 바뀌어요 · ' + (srcs || '구성표 아직 없음 — 상품 작업이 하루 한 번 받아요') + ' · 펀드는 운용사 공개 보유 상위(금투협)만 · 같은 이름 통일은 글자 맞춤이라 일부 안 합쳐질 수 있어요 · 사라는 뜻이 아니에요.</p>';
  }
  function xrPaint(){
    var b = document.getElementById("xrbody"); if (!b) return;
    Promise.all([etfH(), fundH()]).then(function(r){ var b2 = document.getElementById("xrbody"); if (!b2) return; var R = xrCalc(r[0], r[1]); b2.innerHTML = xrH(R); xrBind(b2, r[1]); });
  }
  function xrBind(b, FHd){
    [].forEach.call(b.querySelectorAll("[data-xfa]"), function(i){ stop(i); i.onchange = function(){ var id = i.getAttribute("data-xfa"), v = Math.max(0, +i.value || 0) * 1e4; ls("xrFunds", myFunds().map(function(f){ if (f.id === id) f.amt = v; return f; })); xrPaint(); drPaint(); }; });
    [].forEach.call(b.querySelectorAll("[data-xfx]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var id = x.getAttribute("data-xfx"); ls("xrFunds", myFunds().filter(function(f){ return f.id !== id; })); xrPaint(); drPaint(); }; });
    var ad = document.getElementById("xradd"); if (ad) ad.onclick = function(ev){ ev.stopPropagation(); XR.open = !XR.open; xrPaint(); };
    if (XR.open) xrPick(FHd);
  }
  function xrPick(FHd){
    var el = document.getElementById("xrpick"); if (!el) return;
    var have = {}; myFunds().forEach(function(f){ have[f.id] = 1; });
    var items = (FHd && FHd.items) || {}, q = XR.q.trim().toLowerCase();
    var L = (PRODF || []).filter(function(f){ return items[f.c] && (!q || (f.n + f.co + f.t).toLowerCase().indexOf(q) >= 0); });
    var seen = {}; L = L.filter(function(f){ var k = f.n.replace(/\s*종류.*$|\s*Class.*$|\(.*?\)\s*[A-Za-z-]*$/i, ""); if (seen[k]) return false; seen[k] = 1; return true; });
    el.innerHTML = '<input aria-label="펀드 이름·운용사" class="em-q" id="xrq" placeholder="🔎 펀드 이름·운용사 (예: 미국, 반도체, 미래에셋)" value="' + e(XR.q) + '"><div class="em-pl">' +
      (L.length ? L.slice(0, 40).map(function(f){ return '<div class="em-pr"><div><b>' + e(f.n) + '</b><small>' + e(f.co) + ' · ' + e(f.t || "") + ' · 보유 상위 ' + items[f.c].h.length + '개 공개(' + e(String(items[f.c].d).replace(/(\d{4})(\d\d)(\d\d)/, "$1.$2.$3")) + ')</small></div>' +
        (have[f.c] ? '<span class="mut">담음</span>' : '<button data-xfp="' + e(f.c) + '">📌 담기</button>') + '</div>'; }).join("") : '<div class="empty">맞는 펀드가 없어요 — 보유 종목이 공개된 펀드만 담을 수 있어요.</div>') + '</div>';
    var qi = document.getElementById("xrq"); stop(qi);
    qi.oninput = function(){ XR.q = qi.value; clearTimeout(xrPick.t); xrPick.t = setTimeout(function(){ xrPick(FHd); var n = document.getElementById("xrq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); };
    [].forEach.call(el.querySelectorAll("[data-xfp]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var id = b.getAttribute("data-xfp"), f = L.filter(function(x){ return x.c === id; })[0]; if (!f) return;
      var F = myFunds(); F.push({id: id, nm: f.n, amt: 1e7}); ls("xrFunds", F); XR.open = 0; xrPaint(); drPaint(); }; });
  }

  /* ═════════ ④ 🧯 내 돈 전체 비상 훈련 ═════════ */
  var DR = {busy: 0, sig: "", res: null};
  function episodes(r){   // S&P 가 고점에서 15% 넘게 빠진 구간: 고점·바닥·회복
    var sp = r.sp, N = sp.length, pk = 0, out = [], cur = null;
    for (var u = 1; u < N; u++){
      if (sp[u] >= sp[pk]){ if (cur && cur.dd <= -0.15){ cur.rec = u; out.push(cur); } pk = u; cur = null; continue; }
      var dd = sp[u] / sp[pk] - 1; if (!cur) cur = {pk: pk, tr: u, dd: dd};
      if (dd < cur.dd){ cur.dd = dd; cur.tr = u; }
    }
    if (cur && cur.dd <= -0.15){ cur.rec = null; out.push(cur); }
    return out;
  }
  function portEp(r, ep){   // 같은 구간 이 포트: 고점(S&P 고점 날) 대비 가장 낮은 값 · 그날 · 다시 고점 값까지 거래일
    var nv = r.nv, N = nv.length, base = nv[ep.pk], lo = base, lu = ep.pk, end = ep.rec == null ? N - 1 : Math.min(N - 1, ep.rec + 260);
    for (var u = ep.pk; u <= (ep.rec == null ? N - 1 : ep.rec); u++) if (nv[u] < lo){ lo = nv[u]; lu = u; }
    var back = null; for (var v = lu; v < N; v++) if (nv[v] >= base){ back = v - ep.pk; break; }
    var spBack = ep.rec == null ? null : ep.rec - ep.pk;
    return {dd: (lo / base - 1) * 100, tr: day2s(r.D[r.i0 + lu]), back: back, spBack: spBack, sp: ep.dd * 100, pkD: day2s(r.D[r.i0 + ep.pk]), trD: day2s(r.D[r.i0 + ep.tr]), recD: ep.rec == null ? null : day2s(r.D[r.i0 + ep.rec]), pkT: r.D[r.i0 + ep.pk], trT: r.D[r.i0 + ep.tr]};
  }
  function lbI(a, v){ var lo = 0, hi = a.length; while (lo < hi){ var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
  function rminA(K, a, b){ if (b < a) return Infinity; var k = 31 - Math.clz32(b - a + 1), x = K[k][a], y = K[k][b - (1 << k) + 1]; return x < y ? x : y; }
  function elsEp(G, q, EM, pkT, trT){   // 그 구간 고점 전 1년 안 매 거래일 가입했다면: 바닥까지 KI 닿음 · 끝까지 손실 · 손실 크기
    var D = G.D, s0 = lbI(D, pkT - 365), s1 = lbI(D, pkT), tE = lbI(D, trT); if (s1 >= D.length) s1 = D.length - 1; if (tE >= D.length) tE = D.length - 1;
    var n = 0, ki = 0, done = 0, loss = 0, lsum = 0, worst = 0;
    for (var s = s0; s <= s1; s++){
      n++;
      if (q.ki != null){ for (var a = 0; a < G.C.length; a++) if (rminA(G.K[a], s, tE) / G.C[a][s] < q.ki / 100){ ki++; break; } }
      var sim = EM.simAt(G, q, s); if (!sim) continue; done++;
      if (sim.k < 0 && sim.loss){ var p = sim.ev[sim.ev.length - 1], w = Infinity; for (var a2 = 0; a2 < G.C.length; a2++){ var r = G.C[a2][p] / G.C[a2][s]; if (r < w) w = r; } loss++; lsum += (w - 1) * 100; if ((w - 1) * 100 < worst) worst = (w - 1) * 100; }
    }
    return n ? {n: n, ki: ki, done: done, loss: loss, avg: loss ? lsum / loss : null, worst: worst} : null;
  }
  function myEls(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function drRun(){
    if (!window.__pdz || !__pdz.ready) return Promise.resolve(null);
    var C = __pdz.cfg(), w = __pdz.wts();
    var sig = JSON.stringify([C, amt(), myEls().map(function(x){ return [x.id, x.amt]; })]);
    if (DR.res && DR.sig === sig) return Promise.resolve(DR.res);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var r = __pdz.engine(A, w || (function(){ var s = C.w.SPY / 100, q = C.w.QQQ / 100, g = C.w.GLD / 100; return {SPY: s, QQQ: q, GLD: g, BIL: Math.max(0, 1 - s - q - g)}; })(), {reg: C.reg, vol: C.vol, start: ""});
      if (!r) return null;
      var EPS = episodes(r).map(function(ep){ return portEp(r, ep); });
      var L = myEls().filter(function(x){ return +x.amt > 0; }), EM = window.__elsMy;
      if (!L.length || !EM) return {r: r, eps: EPS, els: [], C: C, stk: !w};
      return EM.load().then(function(){
        return Promise.all(L.map(function(it){ var q = EM.parseKey(it.key); return Promise.all(q.ua.map(EM.epx)).then(function(ss){
          if (ss.some(function(x){ return !x; })) return {it: it, na: 1};
          var G = EM.align(ss); G.K = G.C.map(EM.sparse);
          return {it: it, q: q, per: EPS.map(function(ep){ return G.D[0] <= ep.pkT - 365 ? elsEp(G, q, EM, ep.pkT, ep.trT) : null; }), from: day2s(G.D[0])}; }); }));
      }).then(function(ELS){ return {r: r, eps: EPS, els: ELS, C: C, stk: !w}; });
    }).then(function(R){ DR.res = R; DR.sig = sig; return R; });
  }
  function drH(R){
    if (!R) return '<div class="empty">설계기 일봉을 아직 못 받았어요.</div>';
    var A = amt(), E = R.els || [], lim = +(ls("drLim") || 0), over = 0;
    var Etot = E.reduce(function(s, x){ return s + (+x.it.amt || 0); }, 0);
    var cards = R.eps.map(function(p, i){
      var pl = A * p.dd / 100, el = 0, eh = "";
      E.forEach(function(x){ if (x.na){ eh += '<div class="dr-e mut">' + e(x.it.nm.slice(0, 16)) + ' — 기초자산 일봉 없음</div>'; return; }
        var s = x.per[i]; if (!s){ eh += '<div class="dr-e mut">' + e(x.it.nm.slice(0, 16)) + ' — 그때 기초자산 자료 없음(' + x.from.slice(0, 4) + '~)</div>'; return; }
        var lr = s.done ? s.loss / s.done : null, exp = lr != null && s.avg != null ? +x.it.amt * lr * s.avg / 100 : 0; el += exp;
        eh += '<div class="dr-e"><b>' + e(x.it.nm.slice(0, 22)) + '</b> 고점 전 1년 안 가입한 날 ' + s.n + '번 → ' + (x.q.ki != null ? '바닥까지 <b class="' + (s.ki ? "dn" : "") + '">KI 닿음 ' + Math.round(s.ki / s.n * 100) + '%</b> · ' : '') +
          (s.done ? '끝까지 가 보니 손실 <b class="' + (s.loss ? "dn" : "") + '">' + Math.round(s.loss / s.done * 100) + '%</b>' + (s.loss ? '(손실이면 평균 ' + sg(s.avg, 0) + '%)' : '') + (s.done < s.n ? ' <span class="mut">· 만기 전 ' + (s.n - s.done) + '번 뺌</span>' : '') : '<span class="mut">아직 만기 전</span>') +
          (exp ? ' → 평균 <b class="dn">' + won(exp) + '원</b>' : '') + '</div>'; });
      var tot = pl + el; if (lim > 0 && -tot >= lim) over++;
      return '<div class="dr-c' + (lim > 0 && -tot >= lim ? ' over' : '') + '"><div class="dr-h"><b>' + p.pkD.slice(0, 7).replace("-", ".") + ' ~ ' + p.trD.slice(2, 7).replace("-", ".") + '</b><span>S&P ' + sg(p.sp, 0) + '%</span></div>' +
        '<div class="dr-m"><div><small>💼 내 포트</small><b class="dn">' + (pl < 0 ? "−" : "+") + won(Math.abs(pl)) + '원</b><em>' + sg(p.dd, 1) + '% · 바닥 ' + md(p.tr) + '</em></div>' +
          '<div><small>회복까지</small><b>' + (p.back == null ? '아직' : p.back + '일') + '</b><em>' + (p.back == null ? '고점 못 되찾음' : '거래일' + (p.spBack ? ' · S&P ' + p.spBack + '일' : '')) + '</em></div>' +
          (E.length ? '<div><small>합계(ELS 평균)</small><b class="dn">' + (tot < 0 ? "−" : "+") + won(Math.abs(tot)) + '원</b><em>' + sg(tot / (A + Etot) * 100, 1) + '%</em></div>' : '') + '</div>' + eh + '</div>'; }).join("");
    return '<p class="dr-in">지금 설계기 포트(' + won(A) + '원 · ' + (R.C.reg ? '🛡 방어 켬' : '🛡 방어 끔') + ' · ' + (R.C.vol ? '📉 변동성 맞춤 켬' : '📉 끔') + ')' + (Etot ? ' + 📌 ELS ' + E.length + '개(' + won(Etot) + '원)' : '') + '를 과거 큰 낙폭(S&P 고점에서 15% 넘게)에 그대로 넣어 봤어요.' + (R.stk ? ' <span class="mut">(설계기의 종목 칸은 빼고 셈)</span>' : '') + '</p>' +
      cards +
      '<div class="dr-lim"><label>😣 이만큼 잃으면 못 견딜 것 같다 <input type="number" inputmode="numeric" min="0" step="100" id="drlim" placeholder="만원" value="' + (lim ? Math.round(lim / 1e4) : "") + '"> 만원</label>' +
        (lim > 0 ? '<b' + (over ? ' class="dn"' : '') + '>' + R.eps.length + '번 중 ' + over + '번 넘었어요</b>' : '<small class="mut">넣으면 몇 번 넘었는지만 보여 줘요(비중을 고르라는 말은 안 해요)</small>') + '</div>' +
      drElsAmt() +
      '<p class="note" style="margin:6px 0 0">포트 = 설계기와 같은 엔진(배당 포함 SPY·QQQ·GLD·BIL · 규칙 그대로) · 손실 = S&P 고점 날 대비 가장 낮은 날 · 회복 = 그 고점 값을 되찾기까지 거래일 · ELS = 그 고점 전 1년 안 매 거래일 같은 조건으로 가입했다면(기본 스텝다운 · 손실 크기 = 만기 때 가장 못한 자산) · 「합계」의 ELS 는 평균(손실 비율 × 손실 크기) · 킥·종목·세금은 빼고 · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p>';
  }
  function drElsAmt(){
    var L = myEls(); if (!L.length) return '<p class="dr-in mut">🎯 상품 → ELS 탭 「📌 내 ELS 관제탑」에 담은 ELS 가 있으면 여기서 금액을 넣어 같이 셀 수 있어요.</p>';
    return '<div class="dr-ea"><b>📌 ELS 금액</b>' + L.map(function(x){ return '<div class="xr-fr"><span>' + e(String(x.nm).slice(0, 24)) + '</span><input type="number" inputmode="numeric" min="0" step="100" placeholder="만원" value="' + (x.amt ? Math.round(x.amt / 1e4) : "") + '" data-dra="' + e(x.id) + '"><small>만원</small></div>'; }).join("") + '</div>';
  }
  function drPaint(){
    var b = document.getElementById("drbody"); if (!b || DR.busy) return;
    DR.busy = 1;
    drRun().then(function(R){ DR.busy = 0; var b2 = document.getElementById("drbody"); if (!b2) return; b2.innerHTML = drH(R); drBind(b2); }, function(x){ DR.busy = 0; console.warn(x); });
  }
  function drBind(b){
    var li = document.getElementById("drlim"); if (li){ stop(li); li.onchange = function(){ ls("drLim", Math.max(0, +li.value || 0) * 1e4); var b2 = document.getElementById("drbody"); if (b2 && DR.res){ b2.innerHTML = drH(DR.res); drBind(b2); } }; }
    [].forEach.call(b.querySelectorAll("[data-dra]"), function(i){ stop(i); i.onchange = function(){ var id = i.getAttribute("data-dra"), v = Math.max(0, +i.value || 0) * 1e4; ls("elsmy", myEls().map(function(x){ if (x.id === id) x.amt = v; return x; })); drPaint(); }; });
  }

  /* ── 포트 탭에 붙이기 (설계기 카드 밑) ── */
  function portMount(){
    var pz = document.querySelector("#podz section.card.pz"); if (!pz) return;
    if (!document.getElementById("xrsec")){
      var s = document.createElement("section"); s.className = "card xr no-clp"; s.id = "xrsec"; s.dataset.xc = "1";
      s.innerHTML = '<div class="xr-hd"><b>🔬 내 돈 속 진짜 종목</b><small>설계기 비중 · 펀드까지 구성 종목으로 풀어 보기</small></div><div id="xrbody"><div class="loading">구성표 불러오는 중…</div></div>';
      pz.parentNode.insertBefore(s, pz.nextSibling); xrPaint();
    }
    if (!document.getElementById("drsec")){
      var d = document.createElement("section"); d.className = "card dr no-clp"; d.id = "drsec"; d.dataset.xc = "1";
      d.innerHTML = '<div class="xr-hd"><b>🧯 내 돈 전체 비상 훈련</b><small>지금 포트 + 담아 둔 ELS 를 과거 폭락에 그대로</small></div><div id="drbody"><div class="loading">2008년부터 다시 굴리는 중…</div></div>';
      var x = document.getElementById("xrsec"); x.parentNode.insertBefore(d, x.nextSibling); drPaint();
    }
    var C = window.__pdz && __pdz.cfg ? JSON.stringify(__pdz.cfg()) + amt() : "";
    if (C && C !== XR.sig){ var first = !XR.sig; XR.sig = C; if (!first){ xrPaint(); clearTimeout(portMount.t); portMount.t = setTimeout(drPaint, 400); } }
  }
  // 슬라이더를 미는 동안에도 🔬 를 같이 움직임(계산이 가벼움 · 🧯 는 손을 뗄 때)
  document.addEventListener("input", function(ev){ var t = ev.target; if (t && t.matches && t.matches("#podz input[data-pz], #podz #pzstw")){ clearTimeout(xrPaint.t); xrPaint.t = setTimeout(xrPaint, 60); } }, true);

  /* ── 종목 화면: 지금 열린 종목 ── */
  var CURSYM = "";
  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){ CURSYM = sym; return OLD(sym); };
  window.__u1023 = {lead: lead, dna: dna, twinsOf: twinsOf, xrCalc: function(){ return Promise.all([etfH(), fundH()]).then(function(r){ return xrCalc(r[0], r[1]); }); }, drRun: drRun, episodes: episodes};   // 검사용

  var T = null;
  function tick(){ T = null; try { leadMount(); } catch(x) { console.warn(x); } try { dnaMount(); } catch(x) { console.warn(x); } try { feedLead(); } catch(x) { console.warn(x); } try { portMount(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".ldc h3 .mut{font-size:12.5px;font-weight:500}.ld-svg{width:100%;height:auto;display:block;margin:4px 0 2px}.ld-line{stroke:var(--text);stroke-width:1.6;opacity:.75}.ld-since{stroke:var(--sub);stroke-dasharray:3 3;stroke-width:1}" +
    ".ld-tx{font-size:9.5px;fill:var(--sub)}.ld-n{font-size:8px;font-weight:800;fill:#111}" +
    ".ld-r{display:grid;grid-template-columns:20px 44px 1fr auto;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:13px}.ld-r>i{width:18px;height:18px;border-radius:50%;font-style:normal;font-size:12.5px;font-weight:800;color:#111;display:flex;align-items:center;justify-content:center}" +
    ".ld-d{font-variant-numeric:tabular-nums;color:var(--sub);font-size:12.5px}.ld-d small{display:block;font-size:12.5px;color:var(--dim)}.ld-c a{color:var(--text);text-decoration:none;font-weight:700}.ld-c small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".ld-r>b{font-variant-numeric:tabular-nums;white-space:nowrap;font-size:14px}.ld-r b.up,.ld-s b.up{color:var(--up)}.ld-r b.dn{color:var(--down)}.ld-s{font-size:12.5px;color:var(--sub);margin:6px 0 0;word-break:keep-all}.ld-s b{color:var(--text)}" +
    ".ld-fs{font-size:12.5px;color:var(--sub)}.ld-fs b{color:var(--text)}" +
    ".dnt{margin-top:10px}.dt-me{display:block;font-size:12.5px;color:var(--sub);margin:2px 0 4px;word-break:keep-all}.dt-r{display:flex;gap:10px;align-items:center;padding:7px 0;border-top:1px solid var(--line);color:inherit;text-decoration:none}" +
    ".dt-rd{width:58px;height:58px;flex:none}.dt-b{min-width:0;flex:1}.dt-b b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dt-b small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".dt-df{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}.dt-df span{font-size:12.5px;padding:1px 7px;border-radius:999px;background:var(--panel2)}.dt-df .dt-p{color:var(--up)}.dt-df .dt-m{color:var(--down)}" +
    ".xr-hd b{display:block;font-size:var(--fs-h,17px);font-weight:800}.xr-hd small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px}" +
    ".xr-k{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0 8px}.xr-k>div{background:var(--panel2);border-radius:10px;padding:7px 4px;text-align:center}.xr-k small,.xr-k em{display:block;font-size:12.5px;color:var(--sub);font-style:normal;word-break:keep-all}.xr-k b{display:block;font-size:20px;font-variant-numeric:tabular-nums;white-space:nowrap;margin:1px 0}" +
    ".xr-lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:2px 0 4px}.xr-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".xr-r{display:grid;grid-template-columns:86px 1fr 46px 52px;gap:6px;align-items:center;font-size:12.5px;margin:5px 0}.xr-r span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xr-r b{text-align:right;font-variant-numeric:tabular-nums}.xr-r em{font-style:normal;font-size:12.5px;color:var(--sub);text-align:right;white-space:nowrap}" +
    ".xr-b{display:flex;height:10px;border-radius:5px;overflow:hidden;background:var(--panel2)}.xr-b i{display:block;height:100%}" +
    ".xr-s{font-size:12.5px;margin:8px 0 0;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#d95926 10%,var(--panel2));word-break:keep-all}" +
    ".xr-f{margin-top:10px;padding-top:8px;border-top:1px solid var(--line)}.xr-f>small{display:block;font-size:12.5px;color:var(--sub)}.xr-f>b,.dr-ea>b{font-size:14px}" +
    ".xr-fr{display:grid;grid-template-columns:1fr 84px auto auto;gap:6px;align-items:center;font-size:12.5px;margin:6px 0}.xr-fr span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.xr-fr input,.dr-lim input{font:inherit;font-size:14px;padding:4px 6px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--text);width:100%;box-sizing:border-box;text-align:right}" +
    ".xr-fr small{font-size:12.5px;color:var(--sub)}.xr-fr button{border:0;background:none;color:var(--sub);font-size:15px;cursor:pointer}" +
    ".dr-in{font-size:12.5px;color:var(--sub);margin:8px 0 6px;word-break:keep-all}.dr-c{margin:8px 0 0;padding:9px 10px;border-radius:12px;background:var(--panel2)}.dr-c.over{box-shadow:inset 0 0 0 1.5px var(--down)}" +
    ".dr-h{display:flex;justify-content:space-between;font-size:13.5px}.dr-h span{color:var(--sub);font-size:12.5px}.dr-m{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;margin:6px 0 2px}" +
    ".dr-m small,.dr-m em{display:block;font-size:12.5px;color:var(--sub);font-style:normal}.dr-m b{display:block;font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap}.dr-m b.dn,.dr-e b.dn,.dr-lim b.dn{color:var(--down)}.dr-lim b.up{color:var(--up)}" +
    ".dr-e{font-size:12.5px;margin-top:5px;word-break:keep-all}.dr-lim{margin:10px 0 0;font-size:13px}.dr-lim label{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.dr-lim input{width:96px}.dr-lim b,.dr-lim small{display:block;margin-top:4px}.dr-ea{margin-top:10px}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
/* ======== ux1026.js ======== */
/* 10/26 사용자 「다 진행해」 — 📱 앱 아이디어 A10/26-1·2·3
   ① 🎯 어느 쪽이 먼저 닿나 (A10/26-1) — 📄 종목 화면 📝 내 메모 밑: 매수가(없으면 지금 값)·목표가·손절가의 「비율」로
      2006년부터 매 거래일 들어갔다면 목표가가 먼저 닿은 비율 · 손절가가 먼저 · 기간 안 둘 다 아님 · 걸린 날 중앙값.
      같은 비율을 그 시장 지수에 넣은 기준선, 목표·손절 슬라이더, 20·60·120거래일 칩.
      자료: archive/x/memo_px/<코드>.json (memo_px.py · 매시간 watch 뒤 — 관심종목(목표가 알림 때문에 이미 올라가는 코드)만 2006~ 일봉)
   ② 📐 오늘 등락 세 조각 (A10/26-2) — 📄 종목 화면 「지금은」 밑: 최근 마감 등락 = 시장 + 업종(이 종목 뺀 시총 가중, 시장보다) + 이 종목만.
      「이 종목만」이 ±2% 넘으면 그 무렵 뉴스 3개. 20거래일은 한 줄.
      자료: opdata compass.json markets[시장].ind_r (opdb/compass.py · 업종마다 종목 수·시총 합·등락) · q/ 일봉 60일 · sec.json(업종·시총)
   ③ 🗺 거르기 한 장 지도 (A10/26-3) — 🔎 아침 거르기 맨 위: 가로 = 52주 고점 대비 · 세로 = 20일 수익 · 크기 = 거래대금 ·
      테두리 색 = 거름망 4종 · 👁 찍은 것 ★. 지난 거르기에 처음 걸린 날 위치의 작은 점을 「그 뒤 지금까지」 오름(빨강)/내림(파랑)으로.
      자료: archive/screen/<날짜>/screens.json · opdata screen_px.json (opdb/screens.py screen_px · 지난 거르기 종목의 최근 종가)
   원칙: 과거 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」·「준비 중」). */
(function(){
  var OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function J(u, t){ return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + "h=" + Math.floor(Date.now() / (t || 600000)), {ttl: t || 600000}).catch(function(){ return null; }); }
  function kn(c){ c = String(c || ""); return /^\d{6}(\.K[SQ])?$/.test(c) ? c.slice(0, 6) : c; }
  function mkOf(s){ return /^\d{6}$/.test(s) || /\.K[SQ]$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /\.(SS|SZ)$/.test(s) ? "CN" : "US"; }
  function fnv(str){ var h = 0x811c9dc5, b = new TextEncoder().encode(str); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function shard(sym){ var x = (fnv(sym) % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  function fname(s){ return String(s).replace(/[^A-Za-z0-9._-]/g, "_"); }
  function median(a){ if (!a.length) return null; var b = a.slice().sort(function(x, y){ return x - y; }), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  function wl(){ try { return (window.PL && PL.WL && PL.WL()) || (store && store.wl) || {}; } catch(x) { return {}; } }
  function nowPx(sym){ return window.V && V.price ? V.price(kn(sym)).catch(function(){ return null; }) : Promise.resolve(null); }

  /* ═════════ ① 🎯 어느 쪽이 먼저 닿나 ═════════ */
  var BASEIX = {US: ["^GSPC", "S&P500"], KR: ["^KS11", "코스피"], KQ: ["^KQ11", "코스닥"], JP: ["^N225", "닛케이"], HK: ["^HSI", "항셍"], CN: ["000001.SS", "상해종합"]};
  var MPX = {};
  function memoPx(code){ var f = fname(code); if (!MPX[f]) MPX[f] = J("archive/x/memo_px/" + f + ".json", 3600e3).then(function(j){ if (!j || !j.c) MPX[f] = null; return j && j.c ? j : null; }); return MPX[f]; }
  // 매 거래일 종가에 들어가 → 다음 날부터 H 거래일 안: 고가 ≥ 목표 / 저가 ≤ 손절 (같은 날 둘 다면 손절로 — 보수적으로)
  function firstHit(P, tp, sp, H){
    var c = P.c, h = P.h, l = P.l, n = c.length, T = 0, S = 0, N = 0, days = [], both = 0;
    for (var i = 0; i + H < n; i++){
      var up = c[i] * (1 + tp), dn = c[i] * (1 - sp), got = 0;
      for (var j = i + 1; j <= i + H; j++){
        var hs = l[j] <= dn, ht = h[j] >= up;
        if (hs || ht){ if (hs){ S++; if (ht) both++; } else T++; days.push(j - i); got = 1; break; }
      }
      if (!got) N++;
    }
    var tot = T + S + N;
    return tot ? {n: tot, t: T / tot * 100, s: S / tot * 100, x: N / tot * 100, med: median(days), both: both} : null;
  }
  var MM = {};     // 종목별 슬라이더 상태 (화면 안에서만)
  function memoMount(){
    var memo = document.getElementById("opmemo"); if (!memo) return;
    var sec = memo.closest("section") || memo.parentNode, st = sec.querySelector(".vd [data-star]");
    var sym = st ? st.getAttribute("data-star") : null; if (!sym) return;
    var k = kn(sym), w = wl()[k] || {}, sig = k + "|" + (w.buy || "") + "|" + (w.tgt || "") + "|" + (w.stop || "");
    var box = sec.querySelector(".mfh");
    if (box && box.dataset.sig === sig) return;
    if (!w.tgt && !w.stop){ if (box) box.remove(); return; }
    if (!box){ box = document.createElement("div"); box.className = "mfh"; memo.parentNode.insertBefore(box, memo.nextSibling); }
    box.dataset.sig = sig;
    if (!w.tgt || !w.stop){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">목표가와 손절가를 <b>둘 다</b> 적으면, 과거 이 종목에 같은 비율로 들어갔을 때 어느 쪽이 먼저 닿았는지 보여 드려요.</p>'; return; }
    box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">불러오는 중…</p>';
    var mk = mkOf(sym), bi = BASEIX[/\.KQ$/.test(sym) ? "KQ" : mk] || BASEIX.US;
    Promise.all([memoPx(k), memoPx(bi[0]), w.buy ? Promise.resolve(null) : nowPx(sym)]).then(function(r){
      if (!box.isConnected || box.dataset.sig !== sig) return;
      var P = r[0], B = r[1], base = +w.buy || (r[2] && r[2][1]);
      if (!base){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">기준 값(매수가)을 몰라 계산을 못 해요 — 매수가를 적어 주세요.</p>'; return; }
      var tp0 = +w.tgt / base - 1, sp0 = 1 - +w.stop / base;
      if (!(tp0 > 0) || !(sp0 > 0) || sp0 >= 0.95){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">목표가는 ' + (w.buy ? "매수가" : "지금 값") + '보다 위, 손절가는 아래여야 계산할 수 있어요.</p>'; return; }
      if (!P){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">📥 이 종목 2006년부터의 일봉을 받는 중이에요 — 관심종목이 동기화된 뒤 다음 감시(장중 매시간 · 저녁 8시)에 받아요. 그 뒤 다시 열면 보여요.</p>'; return; }
      var S0 = MM[k] && MM[k].sig === sig ? MM[k] : (MM[k] = {sig: sig, tp: Math.round(tp0 * 1000) / 10, sp: Math.round(sp0 * 1000) / 10, H: 60});
      function draw(){
        var tp = S0.tp / 100, sp = S0.sp / 100, R = firstHit(P, tp, sp, S0.H), RB = B ? firstHit(B, tp, sp, S0.H) : null;
        var yrs = ((P.t[P.t.length - 1] || 0) / 365.25), mine = Math.abs(S0.tp - tp0 * 100) < 0.05 && Math.abs(S0.sp - sp0 * 100) < 0.05;
        var h = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나 <small>과거 되감기 · ' + e(P.d0.slice(0, 4)) + '년부터 매 거래일</small></div>';
        if (!R){ box.innerHTML = h + '<p class="mfh-n">일봉이 짧아(' + P.c.length + '일) 계산을 못 해요.</p>'; return; }
        h += '<p class="mfh-q">' + (w.buy ? "매수가" : "지금 값") + ' 기준 <b class="up">목표 +' + S0.tp.toFixed(1) + '%</b> · <b class="dn">손절 −' + S0.sp.toFixed(1) + '%</b> 비율로 ' + S0.H + '거래일 안에' + (mine ? '' : ' <span class="mfh-x">(슬라이더 값)</span>') + '</p>' +
          '<div class="mfh-bar"><i class="a" style="width:' + R.t + '%"></i><i class="b" style="width:' + R.s + '%"></i><i class="c" style="width:' + R.x + '%"></i></div>' +
          '<div class="mfh-k"><div><small>🎯 목표 먼저</small><b class="g">' + R.t.toFixed(0) + '%</b></div><div><small>🛑 손절 먼저</small><b class="r">' + R.s.toFixed(0) + '%</b></div><div><small>둘 다 아님</small><b>' + R.x.toFixed(0) + '%</b></div></div>' +
          '<p class="mfh-l">닿은 경우 걸린 날 가운데 값 <b>' + (R.med == null ? "–" : R.med + "거래일") + '</b>' + (RB ? ' · 기준선 ' + e(bi[1]) + '에 같은 비율이면 목표 먼저 <b>' + RB.t.toFixed(0) + '%</b> · 손절 먼저 <b>' + RB.s.toFixed(0) + '%</b>' : '') + '</p>' +
          '<label class="mfh-s"><span>🎯 목표 +<b>' + S0.tp.toFixed(1) + '</b>%</span><input type="range" min="1" max="100" step="0.5" value="' + Math.min(100, S0.tp) + '" data-k="tp"></label>' +
          '<label class="mfh-s"><span>🛑 손절 −<b>' + S0.sp.toFixed(1) + '</b>%</span><input type="range" min="1" max="50" step="0.5" value="' + Math.min(50, S0.sp) + '" data-k="sp"></label>' +
          '<div class="mfh-c">' + [20, 60, 120].map(function(x){ return '<button type="button" data-h="' + x + '" class="' + (x === S0.H ? "on" : "") + '">' + x + '거래일</button>'; }).join("") +
          (mine ? '' : '<button type="button" data-r="1">↺ 내 메모 값</button>') + '</div>' +
          '<p class="mfh-n">표본 ' + R.n.toLocaleString() + '번(약 ' + yrs.toFixed(0) + '년' + (yrs < 5 ? " — 짧아요" : "") + ') · 고가·저가로 확인, 같은 날 둘 다 닿은 ' + R.both + '번은 손절로 셈 · 배당·분할 반영 일봉. 과거 계산이고 미래를 보장하지 않아요 — 사라·팔라는 뜻이 아니에요.</p>';
        box.innerHTML = h;
        [].forEach.call(box.querySelectorAll("input[type=range]"), function(inp){
          inp.oninput = function(){ S0[inp.dataset.k] = +inp.value; var b = inp.parentNode.querySelector("b"); if (b) b.textContent = (+inp.value).toFixed(1); };
          inp.onchange = function(){ S0[inp.dataset.k] = +inp.value; draw(); };
        });
        [].forEach.call(box.querySelectorAll(".mfh-c button"), function(b){ b.onclick = function(){ if (b.dataset.r){ S0.tp = Math.round(tp0 * 1000) / 10; S0.sp = Math.round(sp0 * 1000) / 10; } else S0.H = +b.dataset.h; draw(); }; });
      }
      draw();
    });
  }

  /* ═════════ ② 📐 오늘 등락 세 조각 ═════════ */
  var SECJ = null, QS = {};
  function secAll(){ return SECJ || (SECJ = getJSON(OPD + "sec.json").catch(function(){ SECJ = null; return {}; })); }
  function qShard(sh){ if (!QS[sh]) QS[sh] = getJSON(OPD + "q/" + sh + ".json", {ttl: 3600e3}).catch(function(){ QS[sh] = null; return {}; }); return QS[sh]; }
  function qOf(sym){ return qShard(shard(sym)).then(function(j){ return j && j[sym]; }); }
  function newsOf(sym){ return getJSON(OPD + "n/" + fname(sym) + ".json").catch(function(){ return []; }); }
  function addD(d, n){ var t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
  function ixFor(sym, R){ var mk = mkOf(sym), ix = R.ix || {}, pick = mk === "KR" ? (/\.KQ$/.test(sym) ? "^KQ11" : "^KS11") : mk === "US" ? "^GSPC" : mk === "JP" ? "^N225" : mk === "HK" ? "^HSI" : (/\.SZ$/.test(sym) ? "399001.SZ" : "000001.SS");
    if (ix[pick]) return [pick, ix[pick]]; for (var k in ix) return [k, ix[k]]; return null; }
  var IXNM = {"^GSPC": "S&P500", "^KS11": "코스피", "^KQ11": "코스닥", "^N225": "닛케이", "^HSI": "항셍", "000001.SS": "상해종합", "399001.SZ": "선전성분", "^IXIC": "나스닥"};
  function wfall(parts, tot){
    // 폭포 막대: 0 → 시장 → +업종 → +이 종목만 = 합
    var W = 340, H = 64, L = 8, R = 8, mx = 0.5, run = 0, pts = [];
    parts.forEach(function(p){ pts.push([run, run + p[1]]); run += p[1]; mx = Math.max(mx, Math.abs(run)); });
    pts.forEach(function(q){ mx = Math.max(mx, Math.abs(q[0]), Math.abs(q[1])); });
    var X = function(v){ return L + (v + mx) / (2 * mx) * (W - L - R); }, bh = 12, s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dcp-svg" role="img" aria-label="등락 나누기">';
    s += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="2" y2="' + (H - 2) + '" class="dcp-z"/>';
    parts.forEach(function(p, i){ var a = X(pts[i][0]), b = X(pts[i][1]), y = 4 + i * (bh + 4);
      s += '<rect x="' + Math.min(a, b).toFixed(1) + '" y="' + y + '" width="' + Math.max(1.5, Math.abs(b - a)).toFixed(1) + '" height="' + bh + '" rx="3" fill="' + p[2] + '"/>';
      if (i) s += '<line x1="' + a.toFixed(1) + '" x2="' + a.toFixed(1) + '" y1="' + (y - 4) + '" y2="' + y + '" class="dcp-k"/>'; });
    return s + '</svg>';
  }
  function decompMount(){
    var vd = document.querySelector("#main .vd"); if (!vd) return;
    var st = vd.querySelector("[data-star]"), sym = st && st.getAttribute("data-star"); if (!sym) return;
    if (/^\d{6}$/.test(sym)) return;             // 거래소 접미사가 없는 코드는 아래에서 .KS/.KQ 로 찾음
    var host = vd.parentNode; if (!host || host.querySelector(".dcp") || host.dataset.dcp === sym) return;
    host.dataset.dcp = sym;
    var mk = mkOf(sym);
    Promise.all([getJSON(OPD + "compass.json").catch(function(){ return null; }), secAll(), qOf(sym)]).then(function(r){
      var C = r[0], SEC = r[1] || {}, Q = r[2], m = C && C.markets && C.markets[mk], R = m && m.ind_r;
      if (!R || !R.i || !Q || !host.isConnected || host.querySelector(".dcp")) return;
      var meta = SEC[sym] || [], ind = meta[1], cap = +meta[2] || 0, IR = ind ? R.i[ind] : null, ixp = ixFor(sym, R);
      // 이 종목: 업종 집계와 같은 마감일의 종가
      var d0 = Q[0], t = Q[1], c = Q[2], i = -1;
      for (var a = t.length - 1; a >= 0; a--) if (addD(d0, t[a]) === R.d){ i = a; break; }
      if (i < 1) return;
      var s1 = (c[i] / c[i - 1] - 1) * 100, s20 = i >= 20 ? (c[i] / c[i - 20] - 1) * 100 : null;
      var mx1 = ixp && ixp[1][0] != null ? +ixp[1][0] : null, mx20 = ixp && ixp[1][1] != null ? +ixp[1][1] : null;
      var ex1 = null, ex20 = null, nx = 0;
      if (IR && IR[0] - 1 >= 2 && cap > 0 && IR[1] - cap > IR[1] * 0.02){ ex1 = (IR[2] * IR[1] - s1 * cap) / (IR[1] - cap); nx = IR[0] - 1;
        if (IR[3] && IR[4] != null && s20 != null && IR[3] - cap > IR[3] * 0.02) ex20 = (IR[4] * IR[3] - s20 * cap) / (IR[3] - cap); }
      else if (IR && cap <= 0 && IR[0] >= 3){ ex1 = IR[2]; nx = IR[0]; if (IR[4] != null) ex20 = IR[4]; }
      if (mx1 == null) return;
      var parts = [["🌐 시장(" + (IXNM[ixp[0]] || ixp[0]) + ")", mx1, "#8a94a8"]];
      if (ex1 != null) parts.push(["🏭 업종(" + ind + ")", ex1 - mx1, "#e9c46a"]);
      parts.push(["🎯 이 종목만", s1 - (ex1 != null ? ex1 : mx1), "#5ac8fa"]);
      var own = parts[parts.length - 1][1];
      var h = '<div class="dcp-h">📐 ' + md(R.d) + ' 등락 세 조각 <b class="' + cl(s1) + '">' + sg(s1) + '%</b> <small>' + md(R.d) + ' 마감 기준</small></div>' + wfall(parts, s1) +
        '<div class="dcp-l">' + parts.map(function(p, k){ return '<span><i style="background:' + p[2] + '"></i>' + e(p[0]) + ' <b class="' + cl(p[1]) + '">' + sg(p[1]) + (k ? '%p' : '%') + '</b></span>'; }).join("") + '</div>';
      var big = parts.slice().sort(function(x, y){ return Math.abs(y[1]) - Math.abs(x[1]); })[0];
      h += '<p class="dcp-t">' + (Math.abs(s1) < 0.3 ? "거의 안 움직인 날이에요." : "가장 큰 몫은 <b>" + e(big[0].replace(/^\S+ /, "")) + "</b>" + (big[0].indexOf("이 종목만") >= 0 ? " — 시장·업종과 따로 움직였어요." : big[0].indexOf("업종") >= 0 ? " — 같은 업종이 다 같이 움직였어요." : " — 시장 전체가 움직인 날이에요.")) + '</p>';
      if (s20 != null && mx20 != null){
        var o20 = s20 - (ex20 != null ? ex20 : mx20);
        h += '<p class="dcp-t">📅 20거래일 <b class="' + cl(s20) + '">' + sg(s20) + '%</b> = 시장 ' + sg(mx20) + '%' + (ex20 != null ? ' · 업종 ' + sg(ex20 - mx20) + '%p' : '') + ' · 이 종목만 <b class="' + cl(o20) + '">' + sg(o20) + '%p</b></p>';
      }
      h += '<p class="dcp-n">업종 = ' + (ex1 != null ? e(ind) + ' ' + nx + '종목(이 종목 뺀 시가총액 가중)' : '자료 없음') + ' · 시장 = ' + e(IXNM[ixp[0]] || ixp[0]) + ' 지수' + (ixp[1][2] && ixp[1][2] !== R.d ? ' (' + md(ixp[1][2]) + ')' : '') + ' · 장중 값은 마감 뒤 반영</p>';
      var box = document.createElement("div"); box.className = "dcp"; box.innerHTML = h + (Math.abs(own) >= 2 ? '<div class="dcp-nw" id="dcpnw"><small>🗞 이 종목만 ' + sg(own) + '%p — 그 무렵 소식 불러오는 중…</small></div>' : '');
      vd.parentNode.insertBefore(box, vd.nextSibling);
      if (Math.abs(own) >= 2) newsOf(sym).then(function(N){
        var el = box.querySelector("#dcpnw"); if (!el) return;
        var lo = addD(R.d, -3), hi = addD(R.d, 1);
        var L = (N || []).filter(function(x){ return x && x.date && x.date >= lo && x.date <= hi; }).slice(0, 3);
        el.innerHTML = '<small>🗞 이 종목만 ' + sg(own) + '%p — ' + md(lo) + '~' + md(R.d) + ' 소식' + (L.length ? '' : ' 없음 (📰 피드·종목 뉴스를 확인해 보세요)') + '</small>' +
          L.map(function(x){ return '<a href="' + e(x.link) + '" target="_blank" rel="noopener">' + e(x.title) + ' <em>' + e(x.publisher || "") + ' · ' + md(x.date) + '</em></a>'; }).join("");
      });
    });
  }

  /* ═════════ ③ 🗺 거르기 한 장 지도 ═════════ */
  var GRP = {quiet: ["🤫", "조용한 돈 유입", "#f4a261"], lead: ["🏆", "섹터 1등주", "#e9c46a"], hush: ["🌱", "조용한 신고가", "#7ee0b5"], triple: ["🐋", "고래+임원+차트", "#c792ea"]};
  var SCR = {};
  function scrDay(d){ if (!SCR[d]) SCR[d] = getJSON("archive/screen/" + d + "/screens.json", {ttl: 3600e3}).catch(function(){ SCR[d] = null; return null; }); return SCR[d]; }
  function curScrDate(){ var d = window.curDate; return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }
  function eyesOn(d){ var o = ls("eyeScr"); return (o && o[d]) || []; }
  var MAP = {past: true, sel: null, date: null, data: null};
  function rowsOf(D){ var out = [], seen = {}; Object.keys(GRP).forEach(function(k){ (D && D[k] || []).forEach(function(r){ if (!r || !r.s || seen[r.s] || r.hi == null || r.r20 == null) return; seen[r.s] = 1; out.push({s: r.s, n: r.n, m: r.m, g: k, hi: +r.hi, r20: +r.r20, tv: +r.tv || 0, c: +r.c}); }); }); return out; }
  function mapData(date){
    var ids = ((window.M && M.cats && M.cats.screen) || []).map(function(x){ return x.id; }).filter(function(x){ return /^\d{4}-\d{2}-\d{2}$/.test(x) && x <= date; }).sort();
    var past = ids.filter(function(x){ return x < date; }).slice(-20);
    return Promise.all([scrDay(date), J(OPD + "screen_px.json", 1800e3)].concat(past.map(scrDay))).then(function(r){
      var today = rowsOf(r[0]), PX = (r[1] && r[1].px) || {}, first = {};
      past.forEach(function(d, k){ var D = r[k + 2]; if (!D) return; var sd = D.date || d;
        rowsOf(D).forEach(function(x){ if (first[x.s]) return; var p = PX[x.s]; x.d = sd; if (p && p[0] > sd && p[1] > 0 && x.c > 0){ x.after = (p[1] / x.c - 1) * 100; x.at = p[0]; } first[x.s] = x; }); });
      var P = Object.keys(first).map(function(s){ return first[s]; }).filter(function(x){ return x.after != null; });
      return {today: today, past: P, ndays: past.length, at: r[1] && r[1].at};
    });
  }
  function mapSvg(Dt){
    var W = 340, H = 236, L = 34, R = 8, T = 10, B = 30, today = Dt.today, past = MAP.past ? Dt.past : [];
    var all = today.concat(past), xs = all.map(function(x){ return x.hi; }), ys = all.map(function(x){ return x.r20; });
    if (!all.length) return "";
    var srt = function(a){ return a.slice().sort(function(p, q){ return p - q; }); }, q = function(a, f){ var b = srt(a); return b[Math.max(0, Math.min(b.length - 1, Math.floor(f * (b.length - 1))))]; };
    var x0 = Math.min(-5, Math.floor(q(xs, 0.03) / 5) * 5), x1 = Math.max(0, Math.ceil(q(xs, 1) / 5) * 5);
    var y0 = Math.min(-10, Math.floor(q(ys, 0.03) / 10) * 10), y1 = Math.max(10, Math.ceil(q(ys, 0.97) / 10) * 10);
    var X = function(v){ return L + (Math.max(x0, Math.min(x1, v)) - x0) / (x1 - x0) * (W - L - R); }, Y = function(v){ return T + (y1 - Math.max(y0, Math.min(y1, v))) / (y1 - y0) * (H - T - B); };
    var tvs = srt(today.map(function(x){ return x.tv; })), tvMax = tvs[tvs.length - 1] || 1;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="smap-svg" role="img" aria-label="거르기 지도">';
    var xs_ = x1 - x0 > 30 ? 10 : 5;
    for (var gx = Math.ceil(x0 / xs_) * xs_; gx <= x1; gx += xs_) s += '<line x1="' + X(gx).toFixed(1) + '" x2="' + X(gx).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" class="smap-g"/><text x="' + X(gx).toFixed(1) + '" y="' + (H - B + 13) + '" class="smap-t" text-anchor="' + (gx + xs_ > x1 ? "end" : "middle") + '">' + (gx ? gx : "고점") + '</text>';
    var ys_ = (y1 - y0) > 80 ? 20 : 10;
    for (var gy = Math.ceil(y0 / ys_) * ys_; gy <= y1; gy += ys_) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(gy).toFixed(1) + '" y2="' + Y(gy).toFixed(1) + '" class="smap-g' + (gy ? '' : ' z') + '"/><text x="' + (L - 4) + '" y="' + (Y(gy) + 3.5).toFixed(1) + '" class="smap-t" text-anchor="end">' + (gy > 0 ? "+" : "") + gy + '</text>';
    s += '<text x="' + ((L + W - R) / 2) + '" y="' + (H - 4) + '" class="smap-t" text-anchor="middle">← 52주 고점에서 먼 · 고점 대비 % · 가까운 →</text>';
    past.forEach(function(x){ s += '<circle cx="' + X(x.hi).toFixed(1) + '" cy="' + Y(x.r20).toFixed(1) + '" r="2.4" class="smap-p ' + (x.after > 0 ? "u" : x.after < 0 ? "d" : "") + '"/>'; });
    var mine = eyesOn(MAP.date);
    today.slice().sort(function(a, b){ return b.tv - a.tv; }).forEach(function(x, i){
      var rr = 3.5 + 7 * Math.sqrt(x.tv / tvMax), sel = MAP.sel === x.s, cx = X(x.hi).toFixed(1), cy = Y(x.r20).toFixed(1);
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr.toFixed(1) + '" class="smap-c' + (sel ? " on" : "") + '" style="stroke:' + GRP[x.g][2] + '" data-s="' + e(x.s) + '"/>';
      if (mine.indexOf(x.s) >= 0) s += '<text x="' + cx + '" y="' + (+cy + 4) + '" class="smap-star" text-anchor="middle">★</text>';
    });
    // 누르기 쉽게 투명 큰 점
    today.forEach(function(x){ s += '<circle cx="' + X(x.hi).toFixed(1) + '" cy="' + Y(x.r20).toFixed(1) + '" r="11" fill="transparent" data-s="' + e(x.s) + '" style="cursor:pointer"/>'; });
    return s + '<text x="' + (L + 3) + '" y="' + (T + 9) + '" class="smap-t">20일 수익 %</text></svg>';
  }
  function corners(P){
    if (P.length < 40) return "";
    var q = [[0, 0], [0, 0], [0, 0], [0, 0]];
    P.forEach(function(x){ var k = (x.hi >= -5 ? 1 : 0) + (x.r20 >= 10 ? 2 : 0); q[k][1]++; if (x.after > 0) q[k][0]++; });
    var lab = ["고점에서 멀고 · 20일 약함", "고점 가깝고 · 20일 약함", "고점에서 멀고 · 20일 강함", "고점 가깝고 · 20일 강함"];
    return '<div class="smap-q">' + [2, 3, 0, 1].map(function(k){ var n = q[k][1]; return '<div><small>' + lab[k] + '</small>' + (n >= 15 ? '<b>' + Math.round(q[k][0] / n * 100) + '%</b><em>' + q[k][0] + '/' + n + ' 오름</em>' : '<em>표본 ' + n + ' — 적음</em>') + '</div>'; }).join("") + '</div>';
  }
  function mapDraw(box){
    var Dt = MAP.data; if (!Dt) return;
    var up = Dt.past.filter(function(x){ return x.after > 0; }).length;
    var h = '<div class="smap-h"><b>🗺 한 장 지도</b><small>' + md(MAP.date) + ' ' + Dt.today.length + '종목 · 점 크기 = 거래대금 · 테두리 = 거름망' + (eyesOn(MAP.date).length ? ' · ★ = 👁 찍은 것' : '') + '</small></div>' +
      mapSvg(Dt) +
      '<div class="smap-lg">' + Object.keys(GRP).filter(function(k){ return Dt.today.some(function(x){ return x.g === k; }); }).map(function(k){ return '<span><i style="border-color:' + GRP[k][2] + '"></i>' + GRP[k][0] + ' ' + GRP[k][1] + '</span>'; }).join("") +
      (Dt.past.length ? '<span><i class="p u"></i><i class="p d"></i>지난 ' + Dt.ndays + '일 처음 걸린 날 자리 → 그 뒤 오름·내림</span>' : '') + '</div>';
    if (Dt.past.length) h += '<div class="smap-tg"><button type="button" class="' + (MAP.past ? "on" : "") + '">' + (MAP.past ? "지난 점 숨기기" : "지난 점 보기") + '</button><span>지난 ' + Dt.ndays + '일 ' + Dt.past.length + '종목 중 그 뒤 오른 것 <b>' + up + '</b> (' + Math.round(up / Dt.past.length * 100) + '%)' + (Dt.at ? ' · 종가 ' + e(Dt.at.slice(5, 10).replace("-", "/")) : '') + '</span></div>' + (MAP.past ? corners(Dt.past) : '');
    else h += '<p class="smap-n">지난 거르기 「그 뒤」 종가는 다음 전 종목 가격 갱신(새벽 5시 47분·오후 4시 20분) 뒤부터 칠해져요.</p>';
    var sx = MAP.sel && Dt.today.filter(function(x){ return x.s === MAP.sel; })[0];
    h += '<div class="smap-i">' + (sx ? GRP[sx.g][0] + ' <b>' + e(sx.n) + '</b> · 고점 ' + sg(sx.hi) + '% · 20일 ' + sg(sx.r20) + '% <a href="javascript:void 0" data-go="' + e(sx.s) + '" data-g="' + sx.g + '">카드로 ↓</a> <a href="javascript:openOP(\'' + e(sx.s).replace(/'/g, "") + '\')">종목리포트</a>' : '<span class="mut">점을 누르면 이름이 나와요</span>') + '</div>' +
      '<p class="smap-n">위치 = 걸린 날 숫자 · 지난 점 색 = 처음 걸린 날 종가 → 가장 최근 종가. 표본이 짧아 「이 자리가 오른다」는 뜻은 아니에요 — 사라는 뜻이 아니에요.</p>';
    box.innerHTML = h;
    [].forEach.call(box.querySelectorAll("[data-s]"), function(c){ c.addEventListener("click", function(ev){ ev.stopPropagation(); MAP.sel = c.getAttribute("data-s"); mapDraw(box); }); });
    var tg = box.querySelector(".smap-tg button"); if (tg) tg.onclick = function(){ MAP.past = !MAP.past; mapDraw(box); };
    var go = box.querySelector("[data-go]"); if (go) go.onclick = function(){
      var s = go.getAttribute("data-go"), g = go.getAttribute("data-g"), btn = document.querySelector('#scrk button[data-k="' + g + '"]');
      if (btn && !btn.classList.contains("on")) btn.click();
      setTimeout(function(){ var a = [].filter.call(document.querySelectorAll("#main .list .st .nm a"), function(x){ return (x.getAttribute("href") || "").indexOf("'" + s + "'") >= 0; })[0];
        if (a){ var st = a.closest(".st"); st.scrollIntoView({behavior: "smooth", block: "center"}); st.classList.add("smap-fl"); setTimeout(function(){ st.classList.remove("smap-fl"); }, 1800); } }, 120);
    };
  }
  function mapMount(){
    var k = document.getElementById("scrk"); if (!k) return;
    var root = k.parentNode, date = curScrDate(); if (!date) return;
    var box = root.querySelector(".smap");
    if (box && box.dataset.d === date){ if (!box.firstChild && MAP.data && MAP.date === date) mapDraw(box); return; }
    if (!box){ box = document.createElement("div"); box.className = "smap"; var eye = root.querySelector("#eyesum"); root.insertBefore(box, eye ? eye.nextSibling : k); }
    box.dataset.d = date;
    if (MAP.data && MAP.date === date){ mapDraw(box); return; }
    box.innerHTML = '<div class="smap-h"><b>🗺 한 장 지도</b><small>불러오는 중…</small></div>';
    MAP.date = date; MAP.sel = null;
    mapData(date).then(function(Dt){ if (MAP.date !== date) return; MAP.data = Dt; var b2 = document.querySelector(".smap"); if (b2 && b2.dataset.d === date) mapDraw(b2); });
  }

  /* ═════════ 붙이기 ═════════ */
  var T = null;
  function tick(){ T = null; try { memoMount(); } catch(x) { console.error(x); } try { decompMount(); } catch(x) { console.error(x); } try { mapMount(); } catch(x) { console.error(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 250); }
  var css = document.createElement("style");
  css.textContent =
    ".mfh{margin:10px 0 0;padding:10px 12px;border-radius:12px;background:var(--panel2)}.mfh-h{font-weight:800;font-size:14.5px}.mfh-h small{font-weight:400;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    ".mfh-q{font-size:12.5px;margin:5px 0 6px;word-break:keep-all}.mfh-x{color:var(--sub);font-size:12.5px}.mfh-bar{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1px;background:var(--line)}" +
    ".mfh-bar .a{background:#3fb950}.mfh-bar .b{background:#ff6b6b}.mfh-bar .c{background:#6b7385}" +
    ".mfh-k{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0 4px}.mfh-k>div{background:var(--panel);border-radius:10px;padding:6px 4px;text-align:center}.mfh-k small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".mfh-k b{display:block;font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}.mfh-k b.g{color:#3fb950}.mfh-k b.r{color:#ff6b6b}" +
    ".mfh-l{font-size:12.5px;margin:4px 0 6px;word-break:keep-all}.mfh-s{display:flex;align-items:center;gap:8px;font-size:12.5px;margin:4px 0}.mfh-s span{flex:none;width:108px;white-space:nowrap}.mfh-s input{flex:1;min-width:0}" +
    ".mfh-c{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 2px}.mfh-c button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".mfh-c button.on{background:#f4a261;border-color:#f4a261;color:#111;font-weight:700}.mfh-n{font-size:12.5px;color:var(--sub);margin:6px 0 0;word-break:keep-all}" +
    ".dcp{margin:10px 0 2px;padding:10px 12px;border-radius:12px;background:var(--panel2)}.dcp-h{font-weight:800;font-size:14px}.dcp-h small{font-weight:400;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    ".dcp-svg{display:block;width:100%;height:auto;margin:6px 0 2px}.dcp-z{stroke:var(--sub);stroke-width:1;stroke-dasharray:2 2}.dcp-k{stroke:var(--sub);stroke-width:1}" +
    ".dcp-l{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:12.5px}.dcp-l span{white-space:nowrap}.dcp-l i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".dcp-t{font-size:12.5px;margin:6px 0 0;word-break:keep-all}.dcp-n{font-size:12.5px;color:var(--sub);margin:5px 0 0;word-break:keep-all}" +
    ".dcp-nw{margin:8px 0 0;padding-top:7px;border-top:1px solid var(--line)}.dcp-nw small{display:block;font-size:12.5px;color:var(--sub);margin-bottom:3px}" +
    ".dcp-nw a{display:block;font-size:12.5px;padding:4px 0;color:var(--text);text-decoration:none;word-break:keep-all}.dcp-nw a em{font-style:normal;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    ".smap{margin:0 0 10px;padding:10px 12px;border-radius:14px;background:var(--panel)}.smap-h b{font-size:15px}.smap-h small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".smap-svg{display:block;width:100%;height:auto;margin:6px 0 4px;touch-action:manipulation}.smap-g{stroke:var(--line);stroke-width:1}.smap-g.z{stroke:var(--sub);stroke-dasharray:3 3}" +
    ".smap-t{fill:var(--sub);font-size:9.5px}.smap-p{fill:#6b7385;opacity:.55}.smap-p.u{fill:var(--up)}.smap-p.d{fill:var(--down)}" +
    ".smap-c{fill:color-mix(in srgb,var(--panel) 55%,transparent);stroke-width:2}.smap-c.on{stroke-width:3.5;fill:color-mix(in srgb,var(--text) 18%,transparent)}.smap-star{font-size:10px;fill:#ffd166;pointer-events:none}" +
    ".smap-lg{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:12.5px;color:var(--sub)}.smap-lg i{display:inline-block;width:9px;height:9px;border-radius:50%;border:2px solid;margin-right:4px;vertical-align:-1px}" +
    ".smap-lg i.p{border:0;width:6px;height:6px;margin-right:2px}.smap-lg i.p.u{background:var(--up)}.smap-lg i.p.d{background:var(--down);margin-right:4px}" +
    ".smap-tg{display:flex;align-items:center;gap:8px;font-size:12.5px;margin:8px 0 0;word-break:keep-all}.smap-tg button{flex:none;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".smap-q{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0 0}.smap-q>div{background:var(--panel2);border-radius:9px;padding:5px 8px}.smap-q small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".smap-q b{font-size:16px;margin-right:5px;font-variant-numeric:tabular-nums}.smap-q em{font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".smap-i{font-size:12.5px;margin:8px 0 0;min-height:18px;word-break:keep-all}.smap-i a{margin-left:6px;font-weight:700}.smap-n{font-size:12.5px;color:var(--sub);margin:6px 0 0;word-break:keep-all}" +
    ".smap-fl{outline:2px solid #f4a261;outline-offset:2px;transition:outline-color 1.5s}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
/* ======== voices.js ======== */
/* 🗣 목소리 경주 — 10/27 A10/27-1 (사용자 「1번만 하자」)
   「누구 말을 따랐어야 했나」: 앱 안 목소리마다 「처음 부른 날 종가에 같은 돈을 넣고 지금까지 들고 있었다면」 곡선을
   💼 포트 탭(🏁 시장 비교 바로 밑)에서 🙋 내 포트·코스피·S&P500 선과 한 그림으로.
   목소리: 📣 피드 채널 11곳 · 🔎 아침 거르기 거름망 4종 · ⚡ 킥이 고른 종목 (자료: market-strategy-report feeds/voices_race.json —
           src/voices_race.py · 평일 07:25·16:10, feed-score 작업 뒤) + 👁 내 눈(휴대폰 eyeScr — 같은 규칙으로 여기서 계산, 종가는 그 파일의 px 표)
   규칙: 한 종목은 처음 부른 날 한 번만 삼 · 판 적 없음 · 부를 때마다 같은 돈 → 넣은 돈 대비 % · 그림자 = 같은 날 같은 돈을 그 나라 지수에(지수 대비 %p)
         · 각 나라 돈(환율 뺌) · 포트·지수 선은 시작일에 한 번 넣고 그대로(포트는 포트 탭과 같은 달러 기준)
   원칙: 언급 = 추천 아님(「팔아라」 글도 「부른 날 샀다면」으로 셈) · 숫자를 지어내지 않음 · 종목 5개 밑 목소리는 순위에서 뺌 · 사라·팔라는 말 없음. */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var BEN = {KR: "^KS11", US: "^GSPC", JP: "^N225", HK: "^HSI", CN: "000001.SS"};
  var PAL = ["#f4a261", "#7ee0b5", "#9b7cff", "#5ac8fa", "#ffd166", "#ff8fc7", "#b9e769", "#3dd6c6"];
  var MINN = 5;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function kn(c){ c = String(c || ""); return /^\d{6}\.K[SQ]$/.test(c) ? c.slice(0, 6) : c; }
  function mkOf(s){ return /\.K[SQ]$/.test(s) || /^\d{6}$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /\.(SS|SZ)$/.test(s) ? "CN" : "US"; }

  var ST = {p: null, D: null, sort: ls("vrSort") === "ex" ? "ex" : "ret", sel: {}, open: null};
  function load(){
    if (!ST.p) ST.p = getJSON(RAWM + "feeds/voices_race.json?h=" + Math.floor(Date.now() / 1800e3), {ttl: 1800e3})
      .then(function(D){ return D && D.dates && D.voices ? D : null; }).catch(function(){ return null; });
    return ST.p;
  }

  /* ── 👁 내 눈: 휴대폰 기록(eyeScr)으로 같은 규칙 ── */
  function firstIdx(arr, cal, d){ if (!arr) return -1; for (var j = 0; j < cal.length; j++) if (cal[j] >= d && arr[j] != null) return j; return -1; }
  function ffill(arr){ var o = [], l = null; for (var j = 0; j < arr.length; j++){ if (arr[j] != null) l = arr[j]; o.push(l); } return o; }
  function eyeVoice(D){
    var E = ls("eyeScr"); if (!E || typeof E !== "object") return null;
    var first = {}; Object.keys(E).sort().forEach(function(d){ (E[d] || []).forEach(function(s){ if (!(s in first)) first[s] = d; }); });
    var cal = D.dates, X = D.px || {}, C = X.c || {}, M = X.meta || {}, B = X.bench || {}, pos = [], miss = 0, FF = {};
    var ff = function(k, a){ if (!FF[k]) FF[k] = ffill(a || []); return FF[k]; };
    Object.keys(first).forEach(function(s0){
      var s = C[s0] ? s0 : C[s0 + ".KS"] ? s0 + ".KS" : C[s0 + ".KQ"] ? s0 + ".KQ" : null;
      if (!s){ miss++; return; }
      var i = firstIdx(C[s], cal, first[s0]); if (i < 0){ miss++; return; }
      var mk = (M[s] || [])[1] || mkOf(s), b = BEN[mk] || "^GSPC", bi = firstIdx(B[b], cal, cal[i]);
      if (bi < 0){ miss++; return; }
      pos.push({s: s, n: (M[s] || [])[0] || s, ei: i, px: C[s][i], b: b, bpx: B[b][bi], mk: mk});
    });
    if (!pos.length) return {k: "eye", empty: true, n: 0, miss: miss};
    var curve = [], shadow = null;
    for (var j = 0; j < cal.length; j++){
      var rs = 0, bs = 0, n = 0;
      pos.forEach(function(p){ if (p.ei > j) return; var c = ff(p.s, C[p.s])[j], bc = ff(p.b, B[p.b])[j]; if (c == null || bc == null) return; rs += c / p.px - 1; bs += bc / p.bpx - 1; n++; });
      curve.push(n ? Math.round(rs / n * 10000) / 100 : null);
      if (j === cal.length - 1) shadow = n ? Math.round(bs / n * 10000) / 100 : null;
    }
    var picks = pos.map(function(p){ var c = ff(p.s, C[p.s])[cal.length - 1]; return [p.s, p.n, cal[p.ei], c ? Math.round((c / p.px - 1) * 1000) / 10 : null, p.mk]; })
      .sort(function(a, b){ return (b[3] == null ? -1e9 : b[3]) - (a[3] == null ? -1e9 : a[3]); });
    var r = curve[curve.length - 1];
    return {k: "eye", name: "내 눈 (👁 찍은 것)", ic: "👁", kind: "eye", n: pos.length, miss: miss, first: cal[Math.min.apply(null, pos.map(function(p){ return p.ei; }))],
      ret: r, shadow: shadow, ex: r != null && shadow != null ? Math.round((r - shadow) * 100) / 100 : null,
      up: picks.filter(function(x){ return x[3] > 0; }).length, curve: curve, picks: picks};
  }

  /* ── 포트·지수 선(시작일에 넣고 그대로) ── */
  function portLine(cal, start, pd, L){
    if (!pd || !L) return null;
    var at = function(d){ var v = null; for (var i = 0; i < pd.length && pd[i] <= d; i++) if (L[i] != null) v = L[i]; return v; };
    var v0 = at(start); if (v0 == null) return null;
    return cal.map(function(d){ var v = at(d); return v == null ? null : Math.round(((1 + v / 100) / (1 + v0 / 100) - 1) * 10000) / 100; });
  }
  function refs(D){
    var out = [], PL = window.__poLines || {}, mine = portLine(D.dates, D.start, PL.dates, PL.mine), base = portLine(D.dates, D.start, PL.dates, PL.base);
    if (mine) out.push({k: "ref:mine", ic: "🙋", name: PL.mineName || "내 포트", line: mine, col: "#f472b6", w: 3, dash: ""});
    else if (base) out.push({k: "ref:base", ic: "💼", name: "기본 포트", line: base, col: "#e9c46a", w: 3, dash: ""});
    var Ls = D.lines || {};
    if (Ls["코스피"]) out.push({k: "ref:kospi", ic: "🇰🇷", name: "코스피", line: Ls["코스피"], col: "#8a94a8", w: 1.6, dash: "5 4"});
    if (Ls["S&P500"]) out.push({k: "ref:spx", ic: "🇺🇸", name: "S&P500", line: Ls["S&P500"], col: "#c9d1e0", w: 1.6, dash: "2 3"});
    out.forEach(function(r){ var z = r.line.filter(function(v){ return v != null; }); r.ret = z.length ? z[z.length - 1] : null; });
    return out;
  }
  function last(a){ for (var i = a.length - 1; i >= 0; i--) if (a[i] != null) return a[i]; return null; }

  /* ── 그리기 ── */
  function svg(cal, lines){
    var W = 340, H = 196, L = 34, R = 8, T = 10, Bm = 22, all = [0];
    lines.forEach(function(l){ l.line.forEach(function(v){ if (v != null) all.push(v); }); });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = Math.max(0.5, (hi - lo) * 0.08); lo -= pad; hi += pad;
    var n = cal.length, X = function(i){ return L + (n > 1 ? i / (n - 1) : 0) * (W - L - R); }, Y = function(v){ return T + (hi - v) / (hi - lo) * (H - T - Bm); };
    var step = Math.pow(10, Math.floor(Math.log10((hi - lo) / 3 || 1))), tick = [1, 2, 5, 10].map(function(m){ return m * step; }).filter(function(t){ return (hi - lo) / t <= 5; })[0] || step * 10;
    var s = '<svg class="vr-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="목소리별 같은 돈 곡선">';
    for (var t = Math.ceil(lo / tick) * tick; t <= hi; t += tick){ var y = Y(t).toFixed(1);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="vr-g' + (Math.abs(t) < 1e-9 ? ' z' : '') + '"/><text x="' + (L - 4) + '" y="' + (+y + 3) + '" text-anchor="end" class="vr-t">' + (t > 0 ? "+" : t < 0 ? "−" : "") + Math.abs(+t.toFixed(4)) + '%</text>'; }
    s += '<text x="' + L + '" y="' + (H - 6) + '" class="vr-t">' + md(cal[0]) + '</text><text x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end" class="vr-t">' + md(cal[n - 1]) + '</text>';
    lines.forEach(function(l){
      var d = "", pen = false;
      l.line.forEach(function(v, i){ if (v == null){ pen = false; return; } d += (pen ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); pen = true; });
      if (!d) return;
      s += '<path d="' + d + '" fill="none" stroke="' + l.col + '" stroke-width="' + (l.w || 2) + '"' + (l.dash ? ' stroke-dasharray="' + l.dash + '"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>';
      var li = -1; for (var i = l.line.length - 1; i >= 0; i--) if (l.line[i] != null){ li = i; break; }
      if (li >= 0) s += '<circle cx="' + X(li).toFixed(1) + '" cy="' + Y(l.line[li]).toFixed(1) + '" r="2.8" fill="' + l.col + '"/>';
    });
    return s + '</svg>';
  }

  function draw(el){
    var D = ST.D, cal = D.dates;
    var VS = D.voices.slice(), eye = eyeVoice(D);
    if (eye && !eye.empty) VS.push(eye);
    var key = ST.sort === "ex" ? "ex" : "ret", val = function(v){ return v[key] == null ? -1e9 : v[key]; };
    var big = VS.filter(function(v){ return v.n >= MINN && v.ret != null; }).sort(function(a, b){ return val(b) - val(a); });
    var small = VS.filter(function(v){ return !(v.n >= MINN && v.ret != null); });
    big.forEach(function(v, i){ v.col = v.col || PAL[i % PAL.length]; });
    var RF = refs(D);
    var shown = big.filter(function(v, i){ return i < 3 || ST.sel[v.k]; });
    if (eye && !eye.empty && eye.n >= MINN && shown.indexOf(eye) < 0) shown.push(eye);
    var lines = shown.map(function(v){ return {line: v.curve, col: v.col, w: v.k === "eye" ? 2.6 : 2}; }).concat(RF.map(function(r){ return {line: r.line, col: r.col, w: r.w, dash: r.dash}; }));
    var top = big[0], wk = Math.max(1, Math.round((new Date(cal[cal.length - 1]) - new Date(D.start)) / 864e5 / 7));
    var head = '<div class="vr-hd">' + (top ? '🥇 <b>' + e(top.ic + " " + top.name) + '</b> <b class="' + cl(top[key]) + '">' + sg(top[key]) + (key === "ex" ? '%p' : '%') + '</b>' : '') +
      RF.map(function(r){ return ' · ' + r.ic + ' ' + e(r.name) + ' <b class="' + cl(r.ret) + '">' + sg(r.ret) + '%</b>'; }).join("") + '</div>' +
      '<div class="vr-sub">' + md(D.start) + '부터 ' + wk + '주째 · 부를 때마다 같은 돈 · 넣은 돈 대비 · ' + md(cal[cal.length - 1]) + ' 종가까지</div>';
    var chips = '<div class="vr-ch"><button type="button" data-vrs="ret" class="' + (key === "ret" ? "on" : "") + '">💰 그냥 수익률</button><button type="button" data-vrs="ex" class="' + (key === "ex" ? "on" : "") + '">🏳 지수 대비</button></div>';
    var lg = '<div class="vr-lg">' + shown.map(function(v){ return '<span><i style="background:' + v.col + '"></i>' + e(v.ic + " " + v.name) + '</span>'; }).join("") +
      RF.map(function(r){ return '<span><i class="ln" style="border-color:' + r.col + (r.dash ? ';border-top-style:dashed' : '') + '"></i>' + e(r.ic + " " + r.name) + '</span>'; }).join("") + '</div>';
    var tag = function(v){ return v.kind === "ch" ? "피드 채널" : v.kind === "scr" ? "아침 거르기" : v.kind === "kick" ? "킥" : v.kind === "eye" ? "휴대폰 기록" : ""; };
    var row = function(v, i){
      var on = shown.indexOf(v) >= 0, op = ST.open === v.k;
      var h = '<div class="vr-r' + (on ? " on" : "") + (op ? " op" : "") + (v.k === "eye" ? " me" : "") + '" data-vrk="' + e(v.k) + '"><span class="no">' + (i + 1) + '</span>' +
        '<span class="nm"><i style="background:' + (on ? v.col : "transparent") + ';border-color:' + v.col + '"></i><b>' + e(v.ic + " " + v.name) + '</b><small>' + tag(v) + ' · 종목 ' + v.n + '개 중 ' + v.up + '개 오름' + (v.first > D.start ? ' · ' + md(v.first) + '부터' : '') + '</small></span>' +
        '<span class="v"><b class="' + cl(v.ret) + '">' + sg(v.ret) + '%</b><small class="' + cl(v.ex) + '">지수 대비 ' + sg(v.ex) + '%p</small></span></div>';
      if (op){
        var P = v.picks || [], top = P.slice(0, 4), bot = P.length > 7 ? P.slice(-3) : P.slice(4);
        var pk = function(x){ return '<a href="javascript:void 0" data-vrop="' + e(kn(x[0])) + '">' + e(x[1]) + ' <em>' + md(x[2]) + '</em> <b class="' + cl(x[3]) + '">' + sg(x[3], 1) + '%</b></a>'; };
        h += '<div class="vr-pk"><small>가장 많이 오른 것</small>' + top.map(pk).join("") + (bot.length ? '<small>가장 많이 내린 것</small>' + bot.map(pk).join("") : '') +
          '<small class="vr-pn">날짜 = 처음 부른 뒤 산 날 · 그 뒤 ' + md(cal[cal.length - 1]) + ' 종가까지' + (v.miss ? ' · 시세 없는 ' + v.miss + '개 뺌' : '') + '</small></div>';
      }
      return h;
    };
    var eyeHint = !eye ? '<div class="vr-eh">👁 아침 거르기에서 「볼 만함」을 누르면 <b>내 눈</b>도 여기서 같이 달려요.</div>' :
      eye.empty ? '<div class="vr-eh">👁 찍은 종목의 시세를 아직 못 찾았어요(다음 갱신 뒤).</div>' :
      eye.n < MINN ? '<div class="vr-eh">👁 내 눈: 찍은 종목 ' + eye.n + '개 <b class="' + cl(eye.ret) + '">' + sg(eye.ret) + '%</b> — 5개부터 순위에 들어가요.</div>' : '';
    el.innerHTML = head + chips + svg(cal, lines) + lg +
      '<div class="vr-l">' + big.map(function(v, i){ return ST.all || i < 8 || ST.open === v.k || v.k === "eye" ? row(v, i) : ""; }).join("") + '</div>' +
      (big.length > 8 ? '<button type="button" class="vr-more" data-vrall="1">' + (ST.all ? '접기 ▴' : '＋' + (big.length - 8) + '곳 더 보기 ▾') + '</button>' : '') + eyeHint +
      (small.length ? '<div class="vr-sm">종목 5개 밑이라 순위에서 뺌: ' + small.filter(function(v){ return v.k !== "eye"; }).map(function(v){ return e(v.ic + " " + v.name) + ' ' + v.n + '개 ' + sg(v.ret) + '%'; }).join(" · ") + '</div>' : '') +
      '<p class="vr-n">줄을 누르면 그래프에 넣고 빼고, 그 목소리가 부른 종목이 열려요. 목소리 = 종목을 <b>처음 부른 날 종가에 같은 돈</b>을 넣고 판 적 없이 들고 있었다면(같은 종목은 한 번만 · 한국은 15:30 넘은 글이면 다음 날 종가). ' +
      '「지수 대비」 = 같은 날 같은 돈을 그 나라 지수에 넣은 것과의 차이. 각 나라 돈 기준(환율 뺌). 포트·지수 선은 ' + md(D.start) + '에 한 번 넣고 그대로(포트는 포트 탭과 같은 달러 기준). ' +
      '<b>언급 = 추천 아님</b> — 「팔아라」 글도 「부른 날 샀다면」으로 셈. 과거 계산 · 참고용.</p>';
  }

  function mount(){
    var el = document.getElementById("vrace"); if (!el) return;
    if (el.offsetParent === null) return;          // 접힌 칸 안 — 펼칠 때 받기
    if (el.dataset.on) return; el.dataset.on = "1";
    load().then(function(D){
      var el2 = document.getElementById("vrace"); if (!el2) return;
      if (!D){ el2.innerHTML = '<small class="mut">경주 자료 준비 중 — 평일 07:25·16:10 갱신 뒤 보여요.</small>'; return; }
      ST.D = D; draw(el2);
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target;
    var s = t.closest && t.closest("[data-vrs]");
    if (s){ ST.sort = s.getAttribute("data-vrs"); ls("vrSort", ST.sort); var el = document.getElementById("vrace"); if (el && ST.D) draw(el); return; }
    if (t.closest && t.closest("[data-vrall]")){ ST.all = !ST.all; var ea = document.getElementById("vrace"); if (ea && ST.D) draw(ea); return; }
    var o = t.closest && t.closest("[data-vrop]");
    if (o){ ev.preventDefault(); ev.stopPropagation(); if (window.openOP) openOP(o.getAttribute("data-vrop")); return; }
    var r = t.closest && t.closest("[data-vrk]");
    if (r){ var k = r.getAttribute("data-vrk"); ST.sel[k] = !ST.sel[k]; ST.open = ST.open === k ? null : k;
      var el3 = document.getElementById("vrace"); if (el3 && ST.D) draw(el3); return; }
    soon();                                          // 접힌 칸을 펼쳤을 수 있음
  }, true);

  var T = null;
  function tick(){ T = null; try { mount(); } catch(x) { console.error(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 250); }
  var css = document.createElement("style");
  css.textContent =
    ".vr-w{min-height:40px}.vr-hd{font-size:13.5px;line-height:1.55;word-break:keep-all}.vr-hd b.up{color:var(--up)}.vr-hd b.dn{color:var(--down)}" +
    ".vr-sub{font-size:12.5px;color:var(--sub);margin:2px 0 6px;word-break:keep-all}" +
    ".vr-ch{display:flex;gap:6px;margin:4px 0 2px}.vr-ch button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:4px 11px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".vr-ch button.on{background:var(--acc);border-color:var(--acc);color:#0b0f17;font-weight:700}" +
    ".vr-svg{display:block;width:100%;height:auto;margin:6px 0 2px}.vr-g{stroke:var(--line);stroke-width:1}.vr-g.z{stroke:var(--sub);stroke-dasharray:3 3}.vr-t{fill:var(--sub);font-size:9.5px}" +
    ".vr-lg{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:12.5px;margin:0 0 6px}.vr-lg span{white-space:nowrap}.vr-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".vr-lg i.ln{width:14px;height:0;border-radius:0;border-top:2px solid;vertical-align:3px;background:none}" +
    ".vr-l{border-top:1px solid var(--line)}.vr-r{display:grid;grid-template-columns:20px 1fr auto;gap:6px;align-items:center;padding:7px 2px;border-bottom:1px solid var(--line);cursor:pointer}" +
    ".vr-r .no{font-size:12.5px;color:var(--sub);text-align:center}.vr-r .nm{min-width:0}.vr-r .nm i{display:inline-block;width:9px;height:9px;border-radius:50%;border:2px solid;margin-right:5px;vertical-align:-1px}" +
    ".vr-r .nm b{font-size:13.5px;word-break:keep-all}.vr-r .nm small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".vr-r .v{text-align:right}.vr-r .v b{display:block;font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.vr-r .v small{display:block;font-size:12.5px;white-space:nowrap;color:var(--sub)}" +
    ".vr-r .v b.up,.vr-r .v small.up{color:var(--up)}.vr-r .v b.dn,.vr-r .v small.dn{color:var(--down)}.vr-r.me{background:color-mix(in srgb,#ffd166 10%,transparent)}.vr-r.op{border-bottom:0}" +
    ".vr-pk{padding:2px 4px 8px 28px;border-bottom:1px solid var(--line)}.vr-pk small{display:block;font-size:12.5px;color:var(--sub);margin:6px 0 2px}.vr-pk small.vr-pn{margin-top:6px;word-break:keep-all}" +
    ".vr-pk a{display:flex;gap:6px;align-items:baseline;font-size:12.5px;padding:3px 0;color:var(--text);text-decoration:none}.vr-pk a em{font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".vr-pk a b{margin-left:auto;font-variant-numeric:tabular-nums}.vr-pk a b.up{color:var(--up)}.vr-pk a b.dn{color:var(--down)}" +
    ".vr-eh{font-size:12.5px;margin:8px 0 0;padding:7px 9px;border-radius:9px;background:var(--panel2);word-break:keep-all}.vr-eh b.up{color:var(--up)}.vr-eh b.dn{color:var(--down)}" +
    ".vr-more{display:block;width:100%;margin:6px 0 0;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".vr-sm{font-size:12.5px;color:var(--sub);margin:8px 0 0;word-break:keep-all}.vr-n{font-size:12.5px;color:var(--sub);margin:8px 0 0;line-height:1.5;word-break:keep-all}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
  window.__voices = {eyeVoice: eyeVoice, portLine: portLine, state: ST};   // 검사용
})();
;
/* ======== ux1104.js ======== */
/* 11/04 사용자 「둘 다 진행해」 — 📱 앱 아이디어 A11/4-1 · A11/4-2
   ① 🪜 금 가는 순서표 (A11/4-1) — 💼 포트 탭 🎛 설계기 위: 코스피200이 지금보다 더 빠지면 내 돈에서 「무엇이 먼저 깨지나」를 순서대로.
      📌 내 ELS(관제탑) 다음 평가 배리어·KI · 📦 담아 둔 펀드 −10% · 💼 설계기 포트 −10%·2008년 뒤 가장 깊은 낙폭 · 📝 제안서 주식·연금 폼 −10%.
      「같이 움직이는 크기」= 최근 1년 주간(5거래일) 등락으로 잰 코스피200 대비 비율(β) — 대략. 지금 위치는 KODEX200 10분 시세(live_px).
      막대를 끌면 그 깊이에서 깨진 것·대략 손실이 바로 바뀜.
   ② 🔢 숫자로 찾기 (A11/4-2) — 머리 🔍 에 「5%」「3년」「1000만원」「1년 +10%」를 치면 종목 대신 상품:
      채권(세전 매수금리) · ELS(조건 맞으면 연 쿠폰 · 청약 중) · 펀드(지난 1년) 를 위험 낮은 순으로 한 줄씩 → 「📲 크게 보기」 한 장 → 📨 그림으로 보내기.
      「1000만원」 → ⚖️ 세 갈래 길(💼 주문서 투자금과 같은 칸) · 「1년 +10%」 → 📝 주식·연금 폼 중 과거 1년 +10% 넘긴 비율 순.
   원칙: 과거 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」) · 사모(pv) 빼기. */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function pc(v, d){ return v == null || isNaN(v) ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function s2day(s){ return Date.parse(String(s).slice(0, 10) + "T00:00:00Z") / 864e5; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function won(v){ var m = v / 1e4, a = Math.abs(m); return a >= 1e4 ? (m / 1e4).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function ls(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(x) { return null; } }
  function J(u, t){ t = t || 600000; return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / t), {ttl: t}).catch(function(){ return null; }); }
  function stop(el){ el.addEventListener("click", function(ev){ ev.stopPropagation(); }); }

  /* ════════════ 공통: 날짜 맞추기 · 같이 움직이는 크기(β) ════════════ */
  function join(a, b){   // a, b: {d:[day], c:[close]} → 둘 다 있는 날
    var m = {}, D = [], A = [], B = []; for (var i = 0; i < b.d.length; i++) m[b.d[i]] = b.c[i];
    for (var j = 0; j < a.d.length; j++){ var v = m[a.d[j]]; if (v != null && a.c[j] > 0 && v > 0){ D.push(a.d[j]); A.push(a.c[j]); B.push(v); } }
    return {d: D, a: A, b: B};
  }
  // 최근 1년(약 260거래일) 겹치지 않는 5거래일 등락으로 β = cov(x, k) / var(k) · 끝에서부터 거꾸로 묶음
  function beta5(x, k){
    var n = x.length, rx = [], rk = [];
    for (var i = n - 1; i - 5 >= 0 && n - 1 - i < 260; i -= 5){ rx.push(x[i] / x[i - 5] - 1); rk.push(k[i] / k[i - 5] - 1); }
    var N = rx.length; if (N < 30) return null;
    var mx = 0, mk = 0; for (var j = 0; j < N; j++){ mx += rx[j]; mk += rk[j]; } mx /= N; mk /= N;
    var c = 0, v = 0, vx = 0; for (var q = 0; q < N; q++){ c += (rx[q] - mx) * (rk[q] - mk); v += (rk[q] - mk) * (rk[q] - mk); vx += (rx[q] - mx) * (rx[q] - mx); }
    return v > 0 ? {b: c / v, r: vx > 0 ? c / Math.sqrt(v * vx) : 0, n: N} : null;
  }
  var LABU = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LABU[n] || n; }

  /* ── 코스피200 기준선: 일봉(KODEX200 · els_px) + 지금(live_px 069500 10분 시세) ── */
  var KB = null, KBT = 0;
  function kbase(){
    if (KB && Date.now() - KBT < 300000) return KB;
    var EM = window.__elsMy; if (!EM) return Promise.resolve(null);
    KBT = Date.now();
    KB = EM.load().then(function(){ return Promise.all([EM.epx("KOSPI200"), J("archive/x/live_px.json", 300000), J("archive/x/els_px/index.json", 3600e3)]); }).then(function(r){
      var s = r[0]; if (!s || s.d.length < 300) return null;
      var d = Array.prototype.slice.call(s.d), c = Array.prototype.slice.call(s.c), lv = r[1], td = today(), tdd = s2day(td), live = null;
      var q = lv && lv.q && lv.q["069500"];
      if (lv && lv.date === td && q && q[0] > 0){
        if (d[d.length - 1] === tdd){ d.pop(); c.pop(); }   // 아침에 받아 둔 오늘 값은 버리고 지금 값으로
        d.push(tdd); c.push(+q[0]); live = {t: lv.t, chg: +q[1]};
      }
      var n = c.length, hi = 0, hiAt = n - 1; for (var i = Math.max(0, n - 20); i < n; i++) if (c[i] > hi){ hi = c[i]; hiAt = i; }
      var chg = live ? live.chg : (c[n - 1] / c[n - 2] - 1) * 100;
      return {d: d, c: c, now: c[n - 1], at: day2s(d[n - 1]), live: live, chg: chg, hi: hi, hiAt: day2s(d[hiAt]), dd: (c[n - 1] / hi - 1) * 100, idx: r[2], lvq: lv && lv.date === td ? lv.q : null};
    }).catch(function(x){ console.warn(x); return null; });
    return KB;
  }
  var BC = {};
  function betaOf(name, K, dn){   // ELS 기초자산 일봉(els_px) 기준 · dn = 기준 시장 이름
    if (name === dn) return Promise.resolve({b: 1, r: 1, n: 0});
    var key = dn + "|" + name; if (BC[key]) return BC[key];
    BC[key] = window.__elsMy.epx(name).then(function(s){ if (!s) return null; var j = join(s, K); return beta5(j.a, j.b); }).catch(function(){ return null; });
    return BC[key];
  }
  // 기준 시장: 🇰🇷 코스피200(지금 = KODEX200 10분 시세) · 🇺🇸 S&P500(마지막 종가)
  var DRV = {KOSPI200: {ic: "🇰🇷", nm: "코스피200", sh: "코스피"}, "S&P500": {ic: "🇺🇸", nm: "S&P500", sh: "S&P"}};
  function drvName(){ var v = null; try { v = localStorage.getItem("ldDrv"); } catch(x) {} return DRV[v] ? v : "KOSPI200"; }
  function dbase(dn){
    if (dn === "KOSPI200") return kbase();
    return kbase().then(function(K0){ return window.__elsMy.epx(dn).then(function(s){
      if (!s || s.d.length < 300) return null;
      var d = Array.prototype.slice.call(s.d), c = Array.prototype.slice.call(s.c), n = c.length, hi = 0, hiAt = n - 1;
      for (var i = Math.max(0, n - 20); i < n; i++) if (c[i] > hi){ hi = c[i]; hiAt = i; }
      return {d: d, c: c, now: c[n - 1], at: day2s(d[n - 1]), live: null, chg: (c[n - 1] / c[n - 2] - 1) * 100, hi: hi, hiAt: day2s(d[hiAt]), dd: (c[n - 1] / hi - 1) * 100, idx: K0 && K0.idx, lvq: K0 && K0.lvq, k200: K0};
    }); });
  }

  /* ════════════ ① 🪜 금 가는 순서표 ════════════ */
  var FT = {"주식형": 1, "주식혼합형": 0.5, "채권혼합형": 0.3};
  var FREG = [[/중국/, "HSCEI"], [/일본/, "NIKKEI225"], [/유럽/, "EUROSTOXX50"], [/정보기술|나스닥|기술/, "NASDAQ100"], [/북미|미국|글로벌주식|글로벌 공격|헬스케어|에너지|섹터|테마/, "S&P500"]];
  var LD = {busy: 0, sig: "", R: null, m: 0};
  var MAX = -30;
  function myEls(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function myFunds(){ var a = ls("xrFunds"); return Array.isArray(a) ? a : []; }

  function fundBeta(f, P, FH, K, dn){   // 돌려줌 {b, how} · {zero} · {na: 이유}
    if (!P) return Promise.resolve({na: "펀드 자료 없음"});
    var t = P.t || "", st = P.st || "";
    if (/채권형|MMF/.test(t) && !/혼합/.test(t)) return Promise.resolve({zero: 1, how: t});
    if (/^해외/.test(t)){
      if (!/주식/.test(t)) return Promise.resolve({na: t + " — 지수로 셀 수 없음"});
      var reg = FREG.filter(function(x){ return x[0].test(st); })[0]; if (!reg) return Promise.resolve({na: st + " — 비교할 지수 자료 없음"});
      var k = /혼합/.test(t) ? 0.5 : 1;
      return betaOf(reg[1], K, dn).then(function(B){ return B ? {b: B.b * k, how: lab(reg[1]) + "처럼" + (k < 1 ? " × 주식 몫 ½" : "")} : {na: "지수 자료 없음"}; });
    }
    var H = FH && FH.items && FH.items[P.c], eqS = null, how = "";
    if (H && H.h && H.h.length){
      var cov = 0, eq = 0; H.h.forEach(function(h){ cov += +h[1] || 0; if (h[2] === "주식") eq += +h[1] || 0; });
      if (cov >= 25){ eqS = eq / cov; how = "상위 보유 " + Math.round(cov) + "% 중 주식 " + Math.round(eqS * 100) + "%"; }
    }
    if (eqS == null && FT[t] != null && /K200|인덱스/.test(st)){ eqS = 1; how = "코스피200 인덱스"; }
    if (eqS == null) return Promise.resolve({na: "상위 보유 자료가 적어 추정 못 함"});
    return betaOf("KOSPI200", K, dn).then(function(B){ return B ? {b: eqS * B.b, how: how + " · 국내 주식은 코스피200처럼"} : {na: "코스피200 자료 없음"}; });
  }

  function ldRun(){
    var EM = window.__elsMy, PD = window.__pdz, dn = drvName(), DV = DRV[dn];
    if (!EM || !PD || !PD.ready) return Promise.resolve(null);
    return dbase(dn).then(function(K){
      if (!K) return null;
      var K2 = dn === "KOSPI200" ? K : K.k200;   // ELS 지금 값 맞추기는 늘 코스피200·한국 종목 10분 시세로
      var Kd = {d: K.d, c: K.c};
      var A0 = amt(), C = PD.cfg(), w = PD.wts();
      var ev = [], st = [], out = [], nb = {}, sep = DV.sh + "와 거의 따로";
      LD.port = null;
      /* 💼 설계기 포트 · 📝 제안서 폼 — 같은 미국 ETF 일봉(port_px) */
      var pPort = PD.ready().then(function(A){
        if (!A) return;
        var D = Array.prototype.slice.call(A.D), bk = {};
        ["SPY", "QQQ", "GLD"].forEach(function(k){ var j = join({d: D, c: Array.prototype.slice.call(A.C[k])}, Kd); bk[k] = beta5(j.a, j.b); });
        var ww = w || (function(){ var s = C.w.SPY / 100, q = C.w.QQQ / 100, g = C.w.GLD / 100; return {SPY: s, QQQ: q, GLD: g, BIL: Math.max(0, 1 - s - q - g)}; })();
        var r = PD.engine(A, ww, {reg: C.reg, vol: C.vol, start: ""});
        if (r){
          var pd = [], pc_ = []; for (var u = 0; u < r.nv.length; u++){ pd.push(r.D[r.i0 + u]); pc_.push(r.nv[u]); }
          var jp = join({d: pd, c: pc_}, Kd), bp = beta5(jp.a, jp.b);
          var pk = 0; for (var i = 0; i < r.nv.length; i++) if (r.nv[i] > pk) pk = r.nv[i];
          var ddp = r.nv[r.nv.length - 1] / pk - 1, nm = "💼 설계기 포트" + (w ? "" : "(기본 비중)");
          if (bp && bp.b > 0.05){
            ev.push({g: "port", t: nm + " −10%", s: won(A0) + "원이면 " + won(A0 * 0.1) + "원 줄어듦", m: -10 / bp.b, b: bp.b});
            var y = (1 + r.mdd / 100) / (1 + ddp) - 1;
            if (y < 0) ev.push({g: "port", t: nm + " 2008년 뒤 가장 깊었던 낙폭 수준", s: "그때 고점 대비 " + sg(r.mdd, 1) + "%(" + r.mddAt.slice(0, 7).replace("-", ".") + ") · 지금 고점 대비 " + sg(ddp * 100, 1) + "% · " + won(A0) + "원이면 " + won(A0 * -y) + "원 더 줄어듦", m: y * 100 / bp.b, b: bp.b});
            LD.port = {b: bp.b, A: A0, nm: nm};
          } else out.push(nm + " — " + sep + "(같이 움직이는 크기 " + (bp ? bp.b.toFixed(2) : "–") + ")");
        }
        return Promise.all([J("archive/x/proposal.json", 3600e3), J("archive/x/port_px/KOSPI.json", 864e5)]).then(function(rr){
          var P = rr[0], KJ = rr[1], bK = null;
          if (KJ && KJ.dd){ var t = s2day(KJ.d0), dd = [], cc = []; for (var z = 0; z < KJ.dd.length; z++){ t += KJ.dd[z]; dd.push(t); cc.push(+KJ.c[z]); } var jk = join({d: dd, c: cc}, Kd); bK = beta5(jk.a, jk.b); }
          ((P && P.forms) || []).forEach(function(f){
            var W = f.sim && f.sim.bt && f.sim.bt.w; if (!W) return;
            var b = 0, ok = true; Object.keys(W).forEach(function(k){ var x = +W[k] / 100; if (k === "BIL") return; var B = k === "KOSPI" ? bK : bk[k]; if (B) b += x * B.b; else ok = false; });
            if (!ok) return;
            var nm = "📝 " + f.title.replace(/ 포트폴리오$/, "") + " 폼";
            if (b > 0.05) ev.push({g: "form", t: nm + " −10%", s: "1억 넣었다면 1,000만원 줄어듦", m: -10 / b, b: b, key: f.key});
            else out.push(nm + " — " + sep);
          });
        });
      });
      /* 📦 담아 둔 펀드 */
      var F = myFunds(), pFund = F.length ? Promise.all([J("archive/x/products.json", 3600e3), J("archive/x/fund_hold.json", 3600e3)]).then(function(r){
        var PM = {}; ((r[0] && r[0].funds) || []).forEach(function(f){ PM[f.c] = f; });
        return Promise.all(F.map(function(f){ return fundBeta(f, PM[f.id], r[1], Kd, dn).then(function(B){
          var nm = String(f.nm || PM[f.id] && PM[f.id].n || f.id).replace(/증권.*$|투자신탁.*$/, "").slice(0, 22), a = +f.amt || 0;
          if (B.zero) out.push("📦 " + nm + " — " + B.how);
          else if (B.na) out.push("📦 " + nm + " — " + B.na);
          else if (B.b > 0.05) ev.push({g: "fund", t: "📦 " + nm + " −10%", s: (a ? won(a) + "원이면 " + won(a * 0.1) + "원 줄어듦 · " : "") + B.how, m: -10 / B.b, b: B.b, amt: a});
          else out.push("📦 " + nm + " — " + sep);
        }); }));
      }) : Promise.resolve();
      /* 📌 내 ELS — 다음 평가 배리어 · KI (가장 먼저 닿는 기초자산 기준) */
      var L = myEls(), pEls = L.length ? EM.load().then(function(){
        return Promise.all(L.map(function(it){
          var q = EM.parseKey(it.key), nm = String(it.nm || "").slice(0, 22), a = +it.amt || 0;
          return Promise.all(q.ua.map(EM.epx)).then(function(ss){
            if (ss.some(function(x){ return !x; })){ out.push("📌 " + nm + " — 기초자산 일봉 없음"); return; }
            var G = EM.align(ss); G.K = G.C.map(EM.sparse); var M = EM.monitor(it, G);
            if (!M || M.wait){ st.push("📌 " + nm + " — 기준가가 아직 안 정해짐"); return; }
            if (M.done){ st.push("📌 " + nm + " — " + (M.done.k + 1) + "차 평가에서 상환 조건을 넘음"); return; }
            // 지금 값으로: 코스피200 = KODEX200 10분 시세 · 한국 종목 = live_px · 나머지 = 마지막 종가
            var idx = (K.idx && K.idx.assets) || {}, cur = M.cur.slice();
            q.ua.forEach(function(u, i){
              var lastC = G.C[i][G.C[i].length - 1], nowV = null;
              if (u === "KOSPI200") nowV = K2 && K2.now;
              else { var f = idx[u] && idx[u].f, cd = f && /^(\d{6})_K[SQ]\.json$/.exec(f); if (cd && K.lvq && K.lvq[cd[1]]) nowV = +K.lvq[cd[1]][0]; }
              if (nowV > 0 && lastC > 0) cur[i] = M.cur[i] * nowV / lastC;
            });
            return Promise.all(q.ua.map(function(u){ return betaOf(u, Kd, dn); })).then(function(BS){
              function first(level){   // level: 기준가 대비 비율 → 기준 시장 몇 % 에서 처음 닿나
                var best = null, who = null, now = false;
                q.ua.forEach(function(u, i){ if (cur[i] < level){ now = true; return; } var B = BS[i]; if (!B || B.b <= 0.05) return;
                  var mm = (level / cur[i] - 1) * 100 / B.b; if (best == null || mm > best){ best = mm; who = u; } });
                return {now: now, m: best, who: who};
              }
              if (M.next){
                var br = first(M.next.bar / 100);
                if (br.now) st.push("📌 " + nm + " — 지금 " + (M.next.k + 1) + "차 배리어(" + M.next.bar + ") 밑 · 이대로면 " + md(day2s(M.next.t)) + " 평가에 상환 안 됨");
                else if (br.m != null) ev.push({g: "els", t: "📌 " + nm + " · " + (M.next.k + 1) + "차 배리어 " + M.next.bar + " 밑", s: lab(br.who) + "가 먼저 닿음 · " + md(day2s(M.next.t)) + " 평가 때 이 아래면 이번엔 상환 안 됨", m: br.m, amt: a});
                else out.push("📌 " + nm + " 배리어 — " + sep);
              }
              if (q.ki != null){
                if (M.kt) st.push("📌 " + nm + " — KI " + q.ki + " 이미 닿음(만기에 못 넘으면 손실)");
                else { var kr = first(q.ki / 100);
                  if (kr.now) st.push("📌 " + nm + " — 지금 KI " + q.ki + " 밑(장중 · 종가로 확인)");
                  else if (kr.m != null) ev.push({g: "els", t: "📌 " + nm + " · KI " + q.ki + " 닿음", s: lab(kr.who) + "가 먼저 닿음 · 만기에 못 넘으면 원금 손실" + (a ? " · " + won(a) + "원 걸림" : ""), m: kr.m, amt: a, ki: 1});
                  else out.push("📌 " + nm + " KI — " + sep); }
              }
            });
          });
        }));
      }) : Promise.resolve();
      // 다른 시장도 같이 보여 주기(대략): 기준이 코스피면 S&P, S&P 면 코스피200
      var other = dn === "KOSPI200" ? "S&P500" : "KOSPI200", pOth = betaOf(other, Kd, dn).then(function(B){ nb.oth = B ? {b: B.b, nm: DRV[other].nm} : null; });
      return Promise.all([pPort, pFund, pEls, pOth]).then(function(){
        ev.sort(function(x, y){ return y.m - x.m; });
        return {K: K, dn: dn, ev: ev, st: st, out: out, nb: nb, els: L.length, funds: F.length, A: A0};
      });
    });
  }

  function ldH(R){
    if (!R) return '<div class="empty">일봉·설계기 자료를 아직 못 받았어요.</div>';
    var K = R.K, ev = R.ev, m = LD.m, DV = DRV[R.dn];
    var inR = ev.filter(function(x){ return x.m >= MAX; }), far = ev.filter(function(x){ return x.m < MAX; });
    var nx = inR[0];
    var tg = '<div class="ld-drv">어느 시장이 빠지면 ' + Object.keys(DRV).map(function(k){ return '<button type="button" data-ldd="' + e(k) + '" class="' + (k === R.dn ? "on" : "") + '">' + DRV[k].ic + ' ' + DRV[k].nm + '</button>'; }).join("") + '</div>';
    var head = '<div class="ld-now"><div><small>' + DV.nm + ' ' + (K.live ? '지금' : '마지막') + '</small><b class="' + (K.chg < 0 ? "dn" : "up") + '">' + sg(K.chg, 1) + '%</b><em>' + (K.live ? K.live.t + ' · KODEX200 시세' : md(K.at) + ' 종가') + '</em></div>' +
      '<div><small>20거래일 고점(' + md(K.hiAt) + ') 대비</small><b class="' + (K.dd < -0.05 ? "dn" : "") + '">' + sg(K.dd, 1) + '%</b><em>여기서 더 빠지면 ↓</em></div>' +
      '<div class="ld-nx"><small>다음 금까지</small><b>' + (nx ? sg(nx.m, 1) + '%' : '–') + '</b><em>' + (nx ? e(nx.t.replace(/^\S+\s/, "")) : DV.sh + ' −30% 안에선 없음') + '</em></div></div>';
    var rows = '<div class="ld-ld">' +
      '<div class="ld-r ld-me"><span class="ld-l"><b>0%</b><small>지금</small></span><i class="ld-dot"></i><span class="ld-t"><b>📍 지금 여기</b><small>' + DV.nm + (K.live ? ' 오늘 ' : ' ' + md(K.at) + ' ') + sg(K.chg, 1) + '% · 20거래일 고점 대비 ' + sg(K.dd, 1) + '%</small></span></div>' +
      (inR.length ? inR.map(function(x){ var on = m < 0 && x.m >= m;
        return '<div class="ld-r' + (on ? ' on' : '') + (x.ki ? ' ki' : '') + '" data-g="' + x.g + '"><span class="ld-l"><b>' + sg(x.m, 1) + '%</b><small>고점 ' + sg(((1 + K.dd / 100) * (1 + x.m / 100) - 1) * 100, 0) + '%</small></span><i class="ld-dot"></i>' +
          '<span class="ld-t"><b>' + e(x.t) + '</b><small>' + e(x.s) + (x.b ? ' · 같이 움직이는 크기 ' + x.b.toFixed(2) : '') + '</small></span></div>'; }).join("")
        : '<div class="ld-r"><span class="ld-l"><b>−30%</b></span><i class="ld-dot"></i><span class="ld-t"><b>' + DV.sh + '이 30% 더 빠져도 먼저 깨지는 게 없어요</b><small>담아 둔 것이 ' + DV.sh + '와 따로 움직이거나, 여유가 커요</small></span></div>') +
      '</div>';
    var tail = (far.length ? '<p class="ld-far">' + DV.sh + ' −30% 안에선 안 닿음: ' + far.map(function(x){ return e(x.t) + '(' + sg(x.m, 0) + '%)'; }).join(" · ") + '</p>' : '') +
      (R.st.length ? '<div class="ld-st"><b>⚠️ 이미 걸린 것</b>' + R.st.map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') +
      (R.out.length ? '<p class="ld-far">따로 움직여 뺀 것: ' + R.out.map(e).join(" · ") + '</p>' : '') +
      (!R.els ? '<p class="ld-hint">📌 상품 → ELS 「내 ELS 관제탑」에 담은 ELS 가 있으면 <b>다음 평가 배리어·KI 가 어디서 깨지나</b>도 여기 같이 서요.</p>' : '') +
      (!R.funds ? '<p class="ld-hint">📦 「🎛 포트 설계기」를 펼쳐 「🔬 내 돈 속 진짜 종목」에서 펀드를 담으면 그 펀드도 같이 서요.</p>' : '');
    var sl = '<div class="ld-sl"><label>👆 ' + DV.nm + '이 지금보다 <b id="ldmv">' + sg(m, 1) + '%</b> 더 빠지면 <input type="range" id="ldm" min="' + MAX + '" max="0" step="0.5" value="' + m + '" aria-label="더 빠지면"></label><div id="ldsum">' + ldSum(R, m) + '</div></div>';
    return tg + head + sl + rows + tail +
      '<p class="note" style="margin:8px 0 0">대략 — 「같이 움직이는 크기」= 최근 1년 주간(5거래일) 등락으로 잰 「' + DV.nm + '이 1% 움직일 때 같이 움직인 %」(위기 때는 더 커질 수 있음) · 미국 ETF·지수는 달러 기준(환율 빼고) · 펀드는 상위 보유 주식 비중 · ELS 는 기준가 대비 지금 값(코스피200·한국 종목은 10분 시세, 나머지는 마지막 종가) · 과거 계산 · 미래 보장 아님 · 사라·팔라는 뜻 아님</p>';
  }
  function ldSum(R, m){
    if (!(m < 0)) return '<small class="mut">막대를 왼쪽으로 끌면 그 깊이에서 무엇이 깨지는지 · 대략 얼마 줄어드는지 바로 보여요</small>';
    var K = R.K, br = R.ev.filter(function(x){ return x.m >= m; }), O = R.nb.oth, P = LD.port, lossF = 0;
    R.ev.forEach(function(x){ if (x.g === "fund" && x.amt) lossF += x.amt * x.b * -m / 100; });
    var ki = br.filter(function(x){ return x.ki; }).length, bar = br.filter(function(x){ return x.g === "els" && !x.ki; }).length;
    return '<div class="ld-sm"><span>고점 대비 <b class="dn">' + sg(((1 + K.dd / 100) * (1 + m / 100) - 1) * 100, 1) + '%</b></span>' + (O ? '<span>' + O.nm + ' 대략 <b class="dn">' + sg(O.b * m, 1) + '%</b></span>' : '') +
      '<span>깨진 것 <b>' + br.length + '</b>개</span>' + (P ? '<span>💼 포트 대략 <b class="dn">−' + won(P.A * P.b * -m / 100) + '원</b></span>' : '') + (lossF ? '<span>📦 펀드 대략 <b class="dn">−' + won(lossF) + '원</b></span>' : '') +
      (bar || ki ? '<span>📌 배리어 밑 ' + bar + ' · KI ' + ki + '</span>' : '') + '</div>';
  }
  function ldBind(b){
    [].forEach.call(b.querySelectorAll("[data-ldd]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); try { localStorage.setItem("ldDrv", x.getAttribute("data-ldd")); } catch(z) {} LD.m = 0; ldPaint(); }; });
    var r = document.getElementById("ldm"); if (!r) return; stop(r);
    r.oninput = function(){ LD.m = +r.value; var v = document.getElementById("ldmv"); if (v) v.textContent = sg(LD.m, 1) + "%";
      var s = document.getElementById("ldsum"); if (s && LD.R) s.innerHTML = ldSum(LD.R, LD.m);
      var ev = LD.R ? LD.R.ev.filter(function(x){ return x.m >= MAX; }) : [];
      [].forEach.call(b.querySelectorAll(".ld-ld .ld-r[data-g]"), function(row, i){ var x = ev[i]; row.classList.toggle("on", !!x && LD.m < 0 && x.m >= LD.m); }); };
  }
  function ldPaint(){
    var b = document.getElementById("ldbody"); if (!b || LD.busy) return;
    LD.busy = 1;
    ldRun().then(function(R){ LD.busy = 0; LD.R = R; var b2 = document.getElementById("ldbody"); if (!b2) return; b2.innerHTML = ldH(R); ldBind(b2); }, function(x){ LD.busy = 0; console.warn(x); });
  }
  function ldSig(){ var P = window.__pdz; return JSON.stringify([drvName(), P && P.cfg ? P.cfg() : 0, amt(), myEls().map(function(x){ return [x.id, x.amt, x.base]; }), myFunds().map(function(f){ return [f.id, f.amt]; })]); }
  function portMount(){
    var pz = document.querySelector("#podz section.card.pz"); if (!pz) return;
    if (!document.getElementById("ldsec")){
      var s = document.createElement("section"); s.className = "card ld4 no-clp"; s.id = "ldsec"; s.dataset.xc = "1";
      s.innerHTML = '<h3 class="ld-hd">🪜 금 가는 순서표</h3><small class="ld-sub">코스피200이 더 빠지면 내 돈에서 무엇이 먼저 깨지나 — 📌 ELS · 📦 펀드 · 💼 포트 · 📝 제안서 폼</small><div id="ldbody"><div class="loading">순서 세우는 중…</div></div>';
      var pd = document.getElementById("podz");   // 설계기 덩어리(접힘) 바로 위 — 포트 탭의 다른 카드처럼 제목 한 줄로 접히고 누르면 펼침
      pd.parentNode.insertBefore(s, pd); LD.sig = ldSig(); ldPaint();
      var fj = document.querySelector("#pobody .fold-jump, .fold-jump");
      if (fj && !fj.querySelector("[data-ldj]")){ var bt = document.createElement("button"); bt.setAttribute("data-ldj", "1"); bt.textContent = "🪜 금"; fj.appendChild(bt);
        bt.onclick = function(){ var el = document.getElementById("ldsec"); if (!el) return; el.classList.remove("cz-on"); var y = el.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 50; window.scrollTo({top: y, behavior: "smooth"}); }; }
      return;
    }
    var sg_ = ldSig(); if (sg_ !== LD.sig){ LD.sig = sg_; clearTimeout(portMount.t); portMount.t = setTimeout(ldPaint, 500); }
  }
  // 장중엔 10분마다 다시(지금 위치가 움직임)
  setInterval(function(){ if (document.getElementById("ldbody") && !document.hidden){ KB = null; ldPaint(); } }, 600000);

  /* ════════════ ② 🔢 숫자로 찾기 ════════════ */
  var NS = {P: null, E: null, PR: null};
  function nsData(){
    if (!NS.P) NS.P = Promise.all([J("archive/x/products.json", 1800e3), J("archive/x/els_all.json", 1800e3), J("archive/x/proposal.json", 3600e3)]).then(function(r){ NS.PR = r[2]; return {p: r[0], e: r[1], pr: r[2]}; });
    return NS.P;
  }
  // 「5%」「3년」「18개월」「1000만원」「1억」「5천만」「1년 +10%」 — 숫자 말고 다른 글자가 남으면 종목 검색으로 둠
  function parse(q0){
    var q = String(q0 || "").replace(/,/g, "").trim(); if (!q || !/\d/.test(q)) return null;
    var o = {}, rest = q, m;
    m = /1\s*년\s*(?:에\s*)?\+?\s*(\d+(?:\.\d+)?)\s*%/.exec(rest); if (m){ o.goal = +m[1]; rest = rest.replace(m[0], " "); }
    m = /(\d+(?:\.\d+)?)\s*(억|천만|백만|만)\s*원?/.exec(rest); if (m){ o.amt = +m[1] * {"억": 1e8, "천만": 1e7, "백만": 1e6, "만": 1e4}[m[2]]; rest = rest.replace(m[0], " "); }
    else { m = /(\d{6,})\s*원/.exec(rest); if (m){ o.amt = +m[1]; rest = rest.replace(m[0], " "); } }
    m = /(\d+(?:\.\d+)?)\s*%/.exec(rest); if (m){ o.rate = +m[1]; rest = rest.replace(m[0], " "); }
    m = /(\d+(?:\.\d+)?)\s*(년|개월|달)/.exec(rest); if (m){ o.yrs = m[2] === "년" ? +m[1] : +m[1] / 12; rest = rest.replace(m[0], " "); }
    rest = rest.replace(/연|이상|넘는|넘게|넘|짜리|안팎|정도|쯤|만기|이자|금리|수익|수익률|상품|으로|로|에|이면|이|원|\+|~|\s/g, "");
    if (/[A-Za-z가-힣0-9]/.test(rest)) return null;
    if (o.goal == null && o.amt == null && o.rate == null && o.yrs == null) return null;
    if (o.rate != null && (o.rate <= 0 || o.rate > 30)) return null;
    return o;
  }
  var RK = {"매우낮은위험": 0, "낮은위험": 1, "보통위험": 2, "다소높은위험": 3, "높은위험": 4, "매우높은위험": 5};
  var BK = {"국채": 0, "공사채·지방채": 1, "회사채": 2, "신종·후순위": 3};
  function yTo(s){ return (s2day(s) - s2day(today())) / 365.25; }
  function ytxt(y){ var a = Math.floor(y), mo = Math.round((y - a) * 12); if (mo === 12){ a++; mo = 0; } return (a ? a + "년" : "") + (mo ? " " + mo + "개월" : "") || "1개월 안"; }
  function within(y, H){ return Math.abs(y - H) <= Math.max(0.25, H * 0.15); }
  function uaClean(u){   // 공시 글에서 기초자산 칸에 긴 문장이 들어온 경우가 있음 → 짧은 이름만, 아니면 「설명서 확인」
    var t = String(u || "").replace(/\s*지수/g, "").replace(/\s*보통주\s*\(\d{6}\)/g, "").replace(/\(\d{6}\)/g, "").trim();
    if (!t || t.length > 40 || /산출기관|발행인|경우/.test(t)) return "기초자산은 설명서 확인";
    return t;
  }
  function pick(D, o){
    var td = today(), P = D.p || {}, R = {bond: [], els: [], fund: []};
    // 채권: 원화(세전 매수금리 buy · 세후 after) + 미국채·호주국채(달러·호주달러 기준 만기수익률)
    (P.krw || []).forEach(function(b){ if (!(b.buy > 0) || !b.mat) return; var y = yTo(b.mat); if (y <= 0) return;
      if (o.rate != null && b.buy < o.rate) return; if (o.yrs != null && !within(y, o.yrs)) return;
      R.bond.push({k: "bond", nm: b.name, r: b.buy, aft: b.after, y: y, risk: b.risk, rk: RK[b.risk] == null ? 9 : RK[b.risk], bk: BK[b.kind] == null ? 5 : BK[b.kind], kind: b.kind, cur: "원화"}); });
    [["ust", "달러"], ["aud", "호주달러"]].forEach(function(z){ ((P[z[0]] && P[z[0]].items) || []).forEach(function(b){ if (!(b.ytm > 0) || !b.mat) return; var y = yTo(b.mat); if (y <= 0) return;
      if (o.rate != null && b.ytm < o.rate) return; if (o.yrs != null && !within(y, o.yrs)) return;
      R.bond.push({k: "bond", nm: (b.kind || "") + " " + b.name, r: b.ytm, y: y, risk: "환율 따로", rk: 1.5, bk: 0.5, kind: b.kind, cur: z[1]}); }); });
    R.bond.sort(function(a, b){ return (a.cur !== "원화") - (b.cur !== "원화") || a.rk - b.rk || a.bk - b.bk || (o.rate != null ? a.r - b.r : b.r - a.r); });   // 원화 먼저(환율 위험 없음) → 위험 낮은 순 → 조건에 가장 가까운 금리
    // ELS·ELB: 청약 중(마감 ≥ 오늘) · 조건 맞으면 연 쿠폰
    (((D.e && D.e.items) || [])).forEach(function(x){ if (!x.e || x.e < td || !(x.cpn > 0) || x.pv === true) return; var y = x.mat ? yTo(x.mat) : null;
      if (o.rate != null && x.cpn < o.rate) return; if (o.yrs != null && (y == null || !within(y, o.yrs))) return;
      var elb = x.kind === "ELB" || x.nolos;
      R.els.push({k: "els", nm: String(x.nm || "").replace(/\s*\(.*$/, "").replace(/파생결합증권|주가연계증권|파생결합사채|주가연계파생결합사채/g, "").replace(/\s+/g, " ").trim() || x.id, iss: String(x.iss || "").replace(/주식회사|\(주\)/g, "").trim(),
        r: x.cpn, y: y, ua: uaClean(x.ua), ki: x.ki, bars: x.bars, e: x.e, elb: elb, ord: elb ? 0 : 1, kio: x.ki == null ? (elb ? 0 : 99) : x.ki}); });
    R.els.sort(function(a, b){ return a.ord - b.ord || a.kio - b.kio || (o.rate != null ? a.r - b.r : b.r - a.r); });
    // 펀드: 지난 1년 수익률(과거) · 만기가 없으니 「n년」만 친 경우는 뺌
    if (o.rate != null) (P.funds || []).forEach(function(f){ if (f.pv || f.y1 == null || (f.aum || 0) < 10) return;
      if (/채권형|MMF/.test(f.t || "") && !/혼합/.test(f.t) && f.y1 > 12) return;   // 채권·MMF 인데 1년 +12% 넘으면 자료 이상으로 보고 뺌
      if (f.y1 < o.rate || f.y1 > 300) return;
      R.fund.push({k: "fund", nm: f.n, r: f.y1, t: f.t, st: f.st, rk: f.rk, co: f.co, c: f.c}); });
    R.fund.sort(function(a, b){ return (b.rk || 0) - (a.rk || 0) || a.r - b.r; });   // rk 6 = 매우 낮은 위험 → 조건에 가장 가까운 것
    return R;
  }
  function rowTxt(x, o){
    var A = o.amt;
    if (x.k === "bond") return {h: "🏦 채권", nm: x.nm, big: (x.cur === "원화" ? "세전 연 " : x.cur + " 기준 연 ") + pc(x.r, 2), sub: (x.aft != null ? "세후 " + pc(x.aft, 2) + " · " : "") + "남은 기간 " + ytxt(x.y) + " · " + (x.kind || "") + " · " + x.risk,
      mean: x.cur === "원화" ? "만기까지 들고 있으면 받는 금리(발행한 곳이 갚는다는 전제)" : "만기까지 들고 있으면 받는 금리 — 원화로는 환율에 따라 달라짐", won: A && x.cur === "원화" ? won(A * x.r / 100) + "원/년(세전)" : ""};
    if (x.k === "els") return {h: x.elb ? "🎯 ELB(원금 지급형)" : "🎯 ELS", nm: x.nm + (x.iss ? " · " + x.iss : ""), big: "조건 맞으면 연 " + pc(x.r, 1), sub: String(x.ua || "") + (x.ki != null ? " · KI " + x.ki : "") + (x.y != null ? " · 최장 " + ytxt(x.y) : "") + " · 청약 " + md(x.e) + " 마감",
      mean: x.elb ? "원금은 지급 · 조건 못 맞추면 최저 수익" : "조건 못 맞추면 원금 손실 가능 — 쿠폰은 약속된 최대치", won: A ? "조건 맞으면 " + won(A * x.r / 100) + "원/년" : ""};
    return {h: "📦 펀드", nm: x.nm.replace(/증권.*$|투자신탁.*$/, "").trim() + (x.co ? " · " + x.co : ""), big: "지난 1년 " + sg(x.r, 1) + "%", sub: (x.t || "") + (x.st ? " · " + x.st : "") + (x.rk ? " · 위험 " + x.rk + "등급(6 = 가장 낮음)" : ""),
      mean: "지나간 1년 결과일 뿐 — 앞으로 보장 아님 · 원금 손실 가능", won: A ? "지난 1년이었다면 " + (x.r >= 0 ? "+" : "−") + won(Math.abs(A * x.r / 100)) + "원" : ""};
  }
  function title(o){
    var a = []; if (o.rate != null) a.push("연 " + o.rate + "% 넘는"); if (o.yrs != null) a.push(ytxt(o.yrs).trim() + " 안팎"); return a.join(" · ") + " 상품";
  }
  function goalForms(PR, g){
    return ((PR && PR.forms) || []).map(function(f){ var G = f.sim && f.sim.bt && f.sim.bt.growth; if (!G || !G.vals || G.vals.length < 30) return null;
      var v = G.vals, n = 0, k = 0, best = -1e9, worst = 1e9; for (var i = 0; i + 12 < v.length; i++){ var r = (v[i + 12] / v[i] - 1) * 100; n++; if (r >= g) k++; if (r > best) best = r; if (r < worst) worst = r; }
      return {key: f.key, t: f.title.replace(/ 포트폴리오$/, ""), ic: f.icon || "📝", n: n, k: k, p: k / n * 100, from: G.labels[0], worst: worst}; }).filter(Boolean).sort(function(a, b){ return b.p - a.p; });
  }
  function jump(tab, sel){
    var o = document.getElementById("gsq"); if (o) o.remove(); document.body.classList.remove("gs-open");
    if (!window.goTo){ if (window.go) go(tab); return; }
    if (sel && sel.charAt(0) === "#"){ goTo(tab, sel.slice(1)); return; }
    goTo(tab); if (!sel) return;
    var t0 = Date.now(); (function f(){ var el = document.querySelector(sel); if (el){ if (!el.id) el.id = "nsj" + Math.random().toString(36).slice(2, 7); goTo(tab, el.id); return; } if (Date.now() - t0 < 8000) setTimeout(f, 200); })();
  }
  var CUR = null;
  function nsHTML(o, D){
    var h = "";
    if (o.rate != null || o.yrs != null){
      var R = pick(D, o), top = [R.bond[0], R.els[0], R.fund[0]].filter(Boolean);
      CUR = {o: o, R: R, top: top};
      h += '<div class="ns-hd">🔢 <b>' + e(title(o)) + '</b><small>채권 ' + R.bond.length + ' · ELS ' + R.els.length + (o.rate != null ? ' · 펀드 ' + R.fund.length : ' · 펀드는 만기가 없어 뺌') + ' — 위험 낮은 것부터 한 줄씩</small></div>';
      h += top.length ? '<div class="ns-top">' + top.map(function(x){ var T = rowTxt(x, o); return '<div class="ns-c"><small>' + T.h + '</small><b class="ns-big">' + e(T.big) + '</b><span class="ns-nm">' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' + (T.won ? '<u>' + e(T.won) + '</u>' : '') + '</div>'; }).join("") + '</div>' +
        '<div class="ns-act"><button type="button" data-ns="big">📲 크게 보기 · 한 장</button></div>' : '<div class="gs-hint">조건에 맞는 상품이 지금 목록에 없어요.</div>';
      [["bond", "🏦 채권", R.bond, "bond"], ["els", "🎯 ELS·ELB(청약 중)", R.els, "els"], ["fund", "📦 펀드(지난 1년)", R.fund, "fund"]].forEach(function(z){
        if (!z[2].length) return;
        h += '<details class="ns-more"><summary>' + z[1] + ' ' + z[2].length + '개 더 보기</summary>' + z[2].slice(0, 8).map(function(x){ var T = rowTxt(x, o); return '<div class="ns-r"><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><small>' + e(T.sub) + '</small></div>'; }).join("") +
          '<button type="button" class="ns-go" data-nsj="' + z[3] + '">' + z[1] + ' 탭에서 보기 ›</button></details>';
      });
    }
    if (o.goal != null){
      var GF = goalForms(D.pr, o.goal);
      h += '<div class="ns-hd">🎯 <b>1년에 +' + o.goal + '% 넘었던 비율</b><small>📝 제안서 주식·연금 폼 · 매달 시작했다면 그 뒤 1년</small></div>' +
        (GF.length ? GF.map(function(g){ return '<button type="button" class="ns-g" data-nsf="' + e(g.key) + '"><span>' + e(g.ic) + ' <b>' + e(g.t) + '</b><small>' + g.from.replace("-", ".") + '~ · ' + g.n + '번 중 ' + g.k + '번 · 가장 나쁜 1년 ' + sg(g.worst, 1) + '%</small></span><b class="ns-p">' + Math.round(g.p) + '%</b></button>'; }).join("") +
          '<p class="ns-n">과거 계산 · 미래 보장 아님 · 채권·ELS 폼은 확정·조건 수익이라 뺌 · 누르면 그 폼으로</p>' : '<div class="gs-hint">폼 자료를 못 받았어요.</div>');
    }
    if (false && o.amt != null){   // 11/05 세 갈래 길 뺌
      h += '<div class="ns-hd">💰 <b>' + won(o.amt) + '원</b><small>같은 돈을 채권·ELS·포트에 나눠 보면</small></div>' +
        '<button type="button" class="ns-g" data-nsa="' + o.amt + '"><span>⚖️ <b>' + won(o.amt) + '원으로 세 갈래 길 열기</b><small>채권 한 점 · ELS · 포트 3년 범위 — 💼 주문서 투자금도 같은 칸이라 ' + won(o.amt) + '원으로 바뀌어요(지금 ' + won(amt()) + '원)</small></span><b class="ns-p">›</b></button>';
    }
    return h + '<p class="ns-n">참고용 · 투자 권유 아님 · 세금·수수료 전 · 숫자는 미래에셋 판매 목록(채권·펀드)·DART 청약 공시(ELS) 그대로</p>';
  }
  function chipsHTML(){
    return '<div class="ns-chips"><small>🔢 숫자로 찾기</small>' + ["5%", "3년", "4% 3년", "1년 +10%"].map(function(x){ return '<button type="button" data-nsc="' + e(x) + '">' + e(x) + '</button>'; }).join("") + '</div>';
  }
  function hook(){
    var o = document.getElementById("gsq"); if (!o || o.dataset.ns) return; o.dataset.ns = "1";
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres"), ask = document.getElementById("gsask"); if (!inp || !res) return;
    inp.placeholder = "종목명·코드 · 숫자도 돼요 (예: 삼성전자, 5%, 3년)";
    var box = document.createElement("div"); box.id = "gsnum"; res.parentNode.insertBefore(box, res);
    function draw(){
      var q = inp.value.trim(), P = parse(q);
      if (!q){ box.innerHTML = chipsHTML(); res.style.display = ""; return; }
      if (!P){ box.innerHTML = ""; res.style.display = ""; return; }
      res.style.display = "none"; if (ask) ask.style.display = "none";
      box.innerHTML = '<div class="gs-hint">상품 목록 불러오는 중…</div>';
      nsData().then(function(D){ if (inp.value.trim() !== q) return; box.innerHTML = nsHTML(P, D); });
    }
    inp.addEventListener("input", draw);
    inp.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && parse(inp.value.trim())){ ev.stopImmediatePropagation(); ev.preventDefault(); inp.blur(); } }, true);
    box.addEventListener("click", function(ev){
      var t = ev.target.closest && ev.target.closest("button"); if (!t) return; ev.stopPropagation();
      if (t.dataset.nsc){ inp.value = t.dataset.nsc; draw(); try { if (window.ntfyUse) ntfyUse("num_chip"); } catch(z) {} return; }
      if (t.dataset.ns === "big"){ bigOpen(); return; }
      if (t.dataset.nsj){ jump(t.dataset.nsj, "#pdbody"); return; }
      if (t.dataset.nsf){ jump("prop", '.pp-f[data-k="' + t.dataset.nsf + '"]'); return; }
      if (t.dataset.nsa){ try { var s = JSON.parse(localStorage.getItem("portSet") || "{}"); s.amt = +t.dataset.nsa; localStorage.setItem("portSet", JSON.stringify(s)); } catch(z) {} jump("bond", "#pd3w"); return; }
    });
    draw();
  }
  /* 📲 크게 보기 — 고객에게 폰을 건넬 때(큰 글씨) · 📨 그림 한 장으로 보내기 */
  var DISC = "투자 권유 아님 · 과거 수익률은 미래를 보장하지 않음 · ELS·펀드는 원금 손실 가능 · 세금·수수료 전 · 상품 설명서를 꼭 확인";
  function bigOpen(){
    if (!CUR || !CUR.top.length) return;
    var old = document.getElementById("nsbig"); if (old) old.remove();
    var o = CUR.o, d = document.createElement("div"); d.id = "nsbig"; d.className = "no-clp";
    d.innerHTML = '<div class="nb-in"><div class="nb-top"><small>' + md(today()) + ' · 참고용</small><button type="button" class="nb-x" aria-label="닫기">✕</button></div>' +
      '<h2>' + e(title(o)) + '</h2><p class="nb-s">' + (o.amt ? won(o.amt) + '원 기준 · ' : '') + '위험이 낮은 것부터 한 가지씩</p>' +
      CUR.top.map(function(x){ var T = rowTxt(x, o); return '<div class="nb-c"><small>' + T.h + '</small><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' + (T.won ? '<u>' + e(T.won) + '</u>' : '') + '</div>'; }).join("") +
      '<p class="nb-d">' + DISC + '</p><button type="button" class="nb-send">📨 이 한 장 보내기</button></div>';
    document.body.appendChild(d);
    d.querySelector(".nb-x").onclick = function(){ d.remove(); };
    d.querySelector(".nb-send").onclick = function(){ sendImg(); };
  }
  function wrap(g, t, maxW){ var out = [], line = ""; String(t).split(/(\s+)/).forEach(function(w){ var tt = line + w; if (g.measureText(tt).width > maxW && line.trim()){ out.push(line.trim()); line = w.trim(); } else line = tt; }); if (line.trim()) out.push(line.trim()); return out; }
  function sendImg(){
    if (!CUR) return;
    var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d"), o = CUR.o;
    var F = "-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText(md(today()) + " · 참고용 상품 비교", 64, 90);
    g.fillStyle = "#111827"; g.font = "800 58px " + F; g.fillText(title(o), 64, 170);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText((o.amt ? won(o.amt) + "원 기준 · " : "") + "위험이 낮은 것부터 한 가지씩", 64, 222);
    var y = 270, cols = {bond: "#2563eb", els: "#d97706", fund: "#059669"};
    CUR.top.forEach(function(x){
      var T = rowTxt(x, o), h0 = y;
      g.fillStyle = "#f3f4f6"; g.beginPath(); if (g.roundRect) g.roundRect(48, y, W - 96, 300, 28); else g.rect(48, y, W - 96, 300); g.fill();
      g.fillStyle = cols[x.k]; g.fillRect(48, y + 24, 10, 252);
      g.fillStyle = "#374151"; g.font = "700 30px " + F; g.fillText(T.h, 88, y + 58);
      g.fillStyle = "#111827"; g.font = "800 56px " + F; g.fillText(T.big, 88, y + 126);
      g.fillStyle = "#111827"; g.font = "600 30px " + F; wrap(g, T.nm, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 172); });
      g.fillStyle = "#4b5563"; g.font = "500 26px " + F; wrap(g, T.sub, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 212); });
      g.fillStyle = "#b45309"; g.font = "500 26px " + F; wrap(g, T.mean + (T.won ? " · " + T.won : ""), W - 190).slice(0, 2).forEach(function(l, i){ g.fillText(l, 88, y + 250 + i * 32); });
      y = h0 + 320;
    });
    g.fillStyle = "#6b7280"; g.font = "500 24px " + F; wrap(g, DISC, W - 128).forEach(function(l, i){ g.fillText(l, 64, H - 110 + i * 34); });
    c.toBlob(function(b){
      if (!b) return;
      var f = new File([b], "상품비교_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"});
      if (window.__onepage && __onepage.ready) __onepage.ready([f], "상품 비교 한 장");
      else { var a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); }
    }, "image/png");
  }
  window.__u1104 = {parse: parse, pick: pick, goalForms: goalForms, ldRun: ldRun, beta5: beta5, kbase: kbase, nsData: nsData, rowTxt: rowTxt, ytxt: ytxt, title: title};   // 11/05 ux1105b 가 rowTxt·ytxt 를 같이 씀   // 검사용

  var T = null;
  function tick(){ T = null; try { portMount(); } catch(x) { console.warn(x); } try { hook(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".ld4 h3.ld-hd{margin:0;font-size:16px}.ld4 .ld-sub{display:block;color:var(--sub);font-size:12.5px;margin-top:2px;word-break:keep-all}" +
    ".ld-now{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px;margin:10px 0 8px}.ld-now>div{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:8px 9px;min-width:0}" +
    ".ld-now small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all}.ld-now b{display:block;font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}.ld-now em{display:block;font-style:normal;font-size:11.5px;color:var(--sub);word-break:keep-all}" +
    ".ld-now .ld-nx{border-color:var(--down,#4b8bff)}.ld-now b.dn,.ld-sm b.dn{color:var(--down)}.ld-now b.up{color:var(--up)}" +
    ".ld-drv{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12.5px;color:var(--sub);margin:10px 0 0}.ld-drv button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 11px;font:inherit;font-size:13px;cursor:pointer}.ld-drv button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}" +
    ".ld-sl{margin:4px 0 10px}.ld-sl label{display:block;font-size:13.5px}.ld-sl input{width:100%;margin:6px 0 2px}.ld-sm{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub)}.ld-sm b{color:var(--text);font-variant-numeric:tabular-nums}" +
    ".ld-ld{position:relative;margin:4px 0 0;padding-left:2px}.ld-ld:before{content:'';position:absolute;left:79px;top:10px;bottom:10px;width:2px;background:var(--line)}" +
    ".ld-r{display:grid;grid-template-columns:70px 16px 1fr;gap:6px;align-items:start;padding:6px 0;position:relative}.ld-l{text-align:right;font-variant-numeric:tabular-nums}.ld-l b{display:block;font-size:14.5px;white-space:nowrap}.ld-l small{display:block;font-size:11px;color:var(--sub);white-space:nowrap}" +
    ".ld-dot{width:12px;height:12px;border-radius:50%;background:var(--panel);border:2px solid var(--sub);margin:4px 0 0 2px;font-style:normal;z-index:1}.ld-t{min-width:0}.ld-t b{display:block;font-size:14px;word-break:keep-all}.ld-t small{display:block;font-size:12px;color:var(--sub);word-break:keep-all}" +
    ".ld-me .ld-dot{background:#ffb84d;border-color:#ffb84d}.ld-me .ld-l b{color:#ffb84d}.ld-0 .ld-l b{color:var(--sub)}" +
    ".ld-r.on{background:rgba(255,159,67,.14);border-radius:10px}.ld-r.on .ld-dot{background:#ff9f43;border-color:#ff9f43}.ld-r.ki .ld-t b:after{content:' ⚠️'}" +
    ".ld-far,.ld-hint{font-size:12.5px;color:var(--sub);margin:8px 0 0;word-break:keep-all}.ld-hint b{color:var(--text)}.ld-st{margin:8px 0 0;font-size:12.5px;border:1px solid var(--line);border-radius:10px;padding:7px 9px}.ld-st div{margin-top:3px;word-break:keep-all}" +
    "#gsnum .ns-chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--line)}#gsnum .ns-chips small{font-size:12.5px;font-weight:800;margin-right:2px}" +
    "#gsnum .ns-chips button{border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 11px;font:inherit;font-size:13.5px;cursor:pointer}" +
    "#gsnum{max-height:72vh;overflow-y:auto}.ns-hd{padding:10px 12px 4px;font-size:14.5px}.ns-hd small{display:block;color:var(--sub);font-size:12px;margin-top:1px;word-break:keep-all}" +
    ".ns-top{display:flex;flex-direction:column;gap:6px;padding:4px 10px}.ns-c{border:1px solid var(--line);border-radius:12px;padding:9px 11px;background:var(--panel2)}.ns-c small{font-size:12px;color:var(--sub);font-weight:700}" +
    ".ns-c .ns-big{display:block;font-size:19px;font-variant-numeric:tabular-nums}.ns-c .ns-nm{display:block;font-size:13.5px;font-weight:700;word-break:keep-all}.ns-c em,.ns-c i,.ns-c u{display:block;font-style:normal;font-size:12px;color:var(--sub);text-decoration:none;word-break:keep-all}.ns-c i{color:#d99a2b}.ns-c u{color:var(--text);font-weight:700}" +
    ".ns-act{padding:6px 10px}.ns-act button,.ns-go{width:100%;border:0;border-radius:12px;padding:11px;font:inherit;font-size:14.5px;font-weight:800;background:var(--c,#7c9cff);color:#111;cursor:pointer}" +
    ".ns-more{margin:4px 10px;border:1px solid var(--line);border-radius:12px;padding:6px 10px}.ns-more summary{font-size:13.5px;font-weight:700;cursor:pointer}.ns-r{padding:6px 0;border-top:1px solid var(--line);font-size:13px}.ns-r b{display:block;font-variant-numeric:tabular-nums}.ns-r span{display:block;word-break:keep-all}.ns-r small{display:block;color:var(--sub);font-size:12px;word-break:keep-all}" +
    ".ns-go{margin:6px 0 2px;background:var(--panel);color:var(--text);border:1px solid var(--line)}" +
    ".gs-box .ns-g{display:flex;width:calc(100% - 20px);margin:4px 10px;align-items:center;gap:8px;text-align:left;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text);padding:9px 11px;font:inherit;cursor:pointer}" +
    ".ns-g span{flex:1;min-width:0;font-size:14px}.ns-g small{display:block;color:var(--sub);font-size:12px;word-break:keep-all}.ns-g .ns-p{font-size:19px;font-variant-numeric:tabular-nums}.ns-n{font-size:11.5px;color:var(--sub);padding:6px 12px 10px;margin:0;line-height:1.45}" +
    "#nsbig{position:fixed;inset:0;z-index:10000;background:var(--bg,#0b0f17);overflow-y:auto;padding:calc(env(safe-area-inset-top) + 12px) 16px calc(env(safe-area-inset-bottom) + 20px)}" +
    ".nb-in{max-width:560px;margin:0 auto}.nb-top{display:flex;justify-content:space-between;align-items:center;color:var(--sub);font-size:14px}.nb-x{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;font-size:20px;padding:6px 14px}" +
    "#nsbig h2{font-size:30px;line-height:1.25;margin:14px 0 4px;word-break:keep-all}.nb-s{color:var(--sub);font-size:17px;margin:0 0 14px}" +
    ".nb-c{border:1px solid var(--line);background:var(--panel);border-radius:18px;padding:16px 16px 14px;margin:0 0 12px}.nb-c small{font-size:16px;color:var(--sub);font-weight:800}.nb-c b{display:block;font-size:32px;margin:4px 0;font-variant-numeric:tabular-nums}" +
    ".nb-c span{display:block;font-size:18px;font-weight:700;word-break:keep-all}.nb-c em,.nb-c i,.nb-c u{display:block;font-style:normal;text-decoration:none;font-size:15.5px;color:var(--sub);margin-top:4px;word-break:keep-all}.nb-c i{color:#d99a2b}.nb-c u{color:var(--text);font-weight:800}" +
    ".nb-d{font-size:14px;color:var(--sub);line-height:1.5;word-break:keep-all}.nb-send{width:100%;border:0;border-radius:14px;padding:15px;font:inherit;font-size:17px;font-weight:800;background:var(--c,#7c9cff);color:#111;margin-top:6px}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
/* ======== mc.js ======== */
/* 🎲 1만 번 돌려보기 (11/04 사용자: 틱톡 「AI 주식 자동매매 1만 번 시뮬레이션 승률」 보고 「너 이거 돼?」 → 「넣어봐」)
   📊 성적표 맨 위 카드. 영상보다 정직하게 — 지어낸 승률이 아니라 「실제로 있었던 것」만 무작위로 다시 뽑음.
   ① 💼 기본 포트: 2008년부터 매일 굴린 💼 기본 규칙(포트 설계기 엔진 · S&P 200일선 · 변동성 맞춤)과 S&P500 의 하루 수익을
      21거래일(한 달) 덩어리째 12개 뽑아 1년을 만듦 → 1만 번. 같은 덩어리를 둘 다에 써서(같은 시장) 공정하게 비교.
   ② ☕ 컵 · 📈 갭: 앱이 10/6부터 실제로 낸 신호의 「5거래일 뒤 수익」에서 거래 비용 0.3%를 뺀 값을, 같은 날 지수(한국 = 코스피, 나머지 = S&P500)
      5일 수익과 짝지어 둠 → 「1년 = 신호 48번 × 매번 100만 원」을 1만 번 뽑음.
   숫자는 날마다 같은 씨앗(seed)이라 열 때마다 흔들리지 않음 · 「🔁 다시 돌리기」는 새 씨앗.
   원칙: 과거 계산 · 미래 보장 아님 · 표본이 적으면 크게 경고 · 사라는 말 없음. */
(function(){
  var N = 10000, SEL = "port", SEED = 0, CACHE = {};
  try { var s0 = localStorage.getItem("mc_sel"); if (s0) SEL = s0; } catch(x) {}
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kday(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function rng(seed){ var a = seed >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedOf(){ var d = kday().replace(/-/g, ""); return (+d * 2654435761 + SEED * 97) >>> 0; }
  function pct(a, p){ var b = Array.prototype.slice.call(a).sort(function(x, y){ return x - y; }); var i = Math.min(b.length - 1, Math.max(0, Math.floor(p * (b.length - 1)))); return b[i]; }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(d == null ? 1 : d); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function man(v){ var a = Math.abs(v); return (v < 0 ? "−" : v > 0 ? "+" : "") + (a >= 1e4 ? (a / 1e4).toFixed(1) + "억" : Math.round(a).toLocaleString()) + "만"; }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }

  /* ── ① 💼 기본 포트 ── */
  function portData(){
    if (CACHE.port) return Promise.resolve(CACHE.port);
    if (!window.__pdz) return Promise.resolve(null);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var r = __pdz.engine(A, {SPY: .475, QQQ: .475, GLD: .05, BIL: 0}, {reg: 1, vol: 1, start: "2007-06-01"}); if (!r) return null;
      var n = r.nv.length, rp = new Float64Array(n - 1), rs = new Float64Array(n - 1);
      for (var i = 1; i < n; i++){ rp[i - 1] = r.nv[i] / r.nv[i - 1] - 1; rs[i - 1] = r.sp[i] / r.sp[i - 1] - 1; }
      // 실제 있었던 모든 1년(252거래일) 구간 — 시뮬레이션과 나란히 보여 줄 「진짜」
      var real = 0, rn = 0; for (var j = 0; j + 252 < n; j += 5){ rn++; if (r.nv[j + 252] / r.nv[j] > r.sp[j + 252] / r.sp[j]) real++; }
      CACHE.port = {rp: rp, rs: rs, from: r.from, to: r.to, real: rn ? real / rn * 100 : null, cagr: r.cagr, sp_cagr: r.sp_cagr, mdd: r.mdd, sp_mdd: r.sp_mdd};
      return CACHE.port;
    });
  }
  function runPort(P){
    var R = rng(seedOf()), n = P.rp.length, B = 21, K = 12, out = new Float64Array(N), spo = new Float64Array(N), ex = new Float64Array(N), win = 0, pos = 0;
    for (var s = 0; s < N; s++){
      var a = 1, b = 1;
      for (var k = 0; k < K; k++){ var st = Math.floor(R() * (n - B)); for (var t = st; t < st + B; t++){ a *= 1 + P.rp[t]; b *= 1 + P.rs[t]; } }
      out[s] = (a - 1) * 100; spo[s] = (b - 1) * 100; ex[s] = out[s] - spo[s]; if (a > b) win++; if (a > 1) pos++;
    }
    return {kind: "port", win: win / N * 100, pos: pos / N * 100, med: pct(out, .5), smed: pct(spo, .5), p10: pct(out, .1), sp10: pct(spo, .1), p1: pct(out, .01), sp1: pct(spo, .01), exmed: pct(ex, .5), ex: ex, n: n};
  }

  /* ── ② 신호 (컵 · 갭) ── */
  function bench(){
    if (CACHE.bench) return Promise.resolve(CACHE.bench);
    return Promise.all([gj("archive/x/port_px/SPY.json"), gj("archive/x/port_px/KOSPI.json")]).then(function(a){
      function mk(j){ if (!j) return null; var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, m = {}, L = []; for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; L.push(t); m[t] = i; } return {m: m, L: L, c: j.c}; }
      CACHE.bench = {US: mk(a[0]), KR: mk(a[1])}; return CACHE.bench;
    });
  }
  function r5bench(B, d0){   // d0 종가에 사서 5거래일 뒤 — 그날이 쉬면 다음 거래일
    if (!B) return null; var t = Date.parse(d0 + "T00:00:00Z") / 864e5, i = null;
    for (var k = 0; k < 6 && i == null; k++) if (B.m[t + k] != null) i = B.m[t + k];
    if (i == null || i + 5 >= B.c.length) return null; return (B.c[i + 5] / B.c[i] - 1) * 100;
  }
  var COST = 0.3;
  function sigData(kind){
    if (CACHE[kind]) return Promise.resolve(CACHE[kind]);
    return Promise.all([gj("archive/x/perf_" + kind + ".json"), bench()]).then(function(a){
      var J = a[0], B = a[1]; if (!J || !J.signals) return null;
      var S = J.signals.filter(function(x){ return x.r5 != null; }), r = [], x = [], days = {};
      S.forEach(function(s){ var net = s.r5 - COST, b = r5bench(s.mkt === "KR" ? B.KR : B.US, s.d0); r.push(net); x.push(b == null ? null : net - b); days[s.d0] = 1; });
      CACHE[kind] = {r: r, x: x, nd: Object.keys(days).length, first: J.first, n: r.length}; return CACHE[kind];
    });
  }
  function runSig(D){
    var R = rng(seedOf() ^ 0x9e37), T = 48, AMT = 100, n = D.r.length, out = new Float64Array(N), ex = new Float64Array(N), win = 0, pos = 0;
    var xs = []; for (var i = 0; i < n; i++) if (D.x[i] != null) xs.push(i);
    for (var s = 0; s < N; s++){
      var a = 0, b = 0;
      for (var k = 0; k < T; k++){ var j = Math.floor(R() * n); a += D.r[j]; if (xs.length){ var q = xs[Math.floor(R() * xs.length)]; b += D.x[q]; } }
      out[s] = a / 100 * AMT; ex[s] = b / 100 * AMT; if (a > 0) pos++; if (b > 0) win++;
    }
    var wr = D.r.filter(function(v){ return v > 0; }).length / Math.max(1, n) * 100, avg = D.r.reduce(function(p, v){ return p + v; }, 0) / Math.max(1, n);
    return {kind: "sig", pos: pos / N * 100, win: xs.length ? win / N * 100 : null, med: pct(out, .5), p10: pct(out, .1), p90: pct(out, .9), p1: pct(out, .01), ex: ex, exmed: pct(ex, .5), wr: wr, avg: avg, T: T, AMT: AMT, n: n, nd: D.nd};
  }

  /* ── 그리기 ── */
  function hist(ex, unit){
    var lo = pct(ex, .01), hi = pct(ex, .99); if (hi - lo < 1e-9){ lo -= 1; hi += 1; }
    var NB = 28, w = (hi - lo) / NB, H = new Array(NB).fill(0), mx = 0;
    for (var i = 0; i < ex.length; i++){ var b = Math.floor((ex[i] - lo) / w); if (b < 0 || b >= NB) continue; H[b]++; }
    mx = Math.max.apply(null, H.concat([1]));
    var W = 300, Ht = 92, bw = W / NB, z = lo < 0 && hi > 0 ? (0 - lo) / (hi - lo) * W : null;
    var bars = H.map(function(h, k){ var mid = lo + (k + .5) * w, hh = h / mx * (Ht - 4); return '<rect x="' + (k * bw + .6).toFixed(1) + '" y="' + (Ht - hh).toFixed(1) + '" width="' + (bw - 1.2).toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="1.5" class="' + (mid >= 0 ? "u" : "d") + '"/>'; }).join("");
    return '<svg class="mc-h" viewBox="0 0 ' + W + ' ' + (Ht + 18) + '" role="img" aria-label="1만 번 결과 분포">' + bars +
      (z != null ? '<line x1="' + z.toFixed(1) + '" y1="0" x2="' + z.toFixed(1) + '" y2="' + Ht + '" class="z"/><text x="' + z.toFixed(1) + '" y="' + (Ht + 14) + '" text-anchor="middle">0</text>' : '') +
      '<text x="0" y="' + (Ht + 14) + '">' + e(unit === "pp" ? sg(lo, 0) + "%p" : man(lo)) + '</text><text x="' + W + '" y="' + (Ht + 14) + '" text-anchor="end">' + e(unit === "pp" ? sg(hi, 0) + "%p" : man(hi)) + '</text></svg>';
  }
  function body(R, P){
    if (R.kind === "port"){
      return '<div class="mc-big"><small>1년 뒤 S&amp;P500을 이길 확률</small><b class="' + (R.win >= 50 ? "up" : "dn") + '">' + Math.round(R.win) + '%</b><p>💼 기본 포트(S&amp;P 반·나스닥 반 + 금 5% · 200일선·변동성 규칙)를 1년씩 <b>1만 번</b> 굴린 결과예요.</p></div>' +
        '<div class="mc-g"><div><small>보통의 해</small><b class="' + cl(R.med) + '">' + sg(R.med) + '%</b><em>S&amp;P ' + sg(R.smed) + '%</em></div>' +
        '<div><small>운 나쁜 10%</small><b class="' + cl(R.p10) + '">' + sg(R.p10) + '%</b><em>S&amp;P ' + sg(R.sp10) + '%</em></div>' +
        '<div><small>최악 1%</small><b class="' + cl(R.p1) + '">' + sg(R.p1) + '%</b><em>S&amp;P ' + sg(R.sp1) + '%</em></div></div>' +
        '<div class="mc-ht"><small>S&amp;P500보다 몇 %p 더(덜) 벌었나 · 1만 번</small>' + hist(R.ex, "pp") + '</div>' +
        '<ul class="mc-n"><li>✅ 실제로 있었던 모든 1년 구간(' + e(P.from.slice(0, 4)) + '~' + e(P.to.slice(0, 4)) + ')에선 <b>' + (P.real == null ? "–" : Math.round(P.real) + "%") + '</b> 이겼어요 — 1만 번 결과와 비교해 보세요.</li>' +
        '<li>🛡 이 포트의 강점은 「덜 잃기」예요. 보통의 해엔 S&amp;P와 비슷하거나 덜 벌지만, 운 나쁜 해엔 덜 빠져요.</li>' +
        '<li>방법: 2008년부터 실제 하루 수익을 <b>한 달 덩어리째 12개</b> 무작위로 뽑아 1년을 만듦(포트·S&amp;P 같은 덩어리) · 매매 비용 포함 · 세금·환전 비용 제외.</li></ul>';
    }
    var warn = R.nd < 60 ? '<div class="mc-w">⚠️ 아직 <b>' + R.nd + '일치 · ' + R.n + '번</b> 기록뿐이에요. 표본이 적어서 이 숫자는 크게 흔들려요 — 「이런 식으로 재요」 정도로만 보세요.</div>' : '';
    return warn + '<div class="mc-big"><small>1년 동안 신호마다 100만 원씩 ' + R.T + '번 — 돈을 벌 확률</small><b class="' + (R.pos >= 50 ? "up" : "dn") + '">' + Math.round(R.pos) + '%</b><p>앱이 실제로 낸 신호의 <b>5일 뒤 수익(비용 0.3% 뺌)</b>을 무작위로 뽑아 <b>1만 번</b> 굴린 결과예요.</p></div>' +
      '<div class="mc-g"><div><small>가운데</small><b class="' + cl(R.med) + '">' + man(R.med) + '</b><em>48번 합계</em></div>' +
      '<div><small>운 나쁜 10%</small><b class="' + cl(R.p10) + '">' + man(R.p10) + '</b><em>좋은 10% ' + man(R.p90) + '</em></div>' +
      '<div><small>지수보다 나음</small><b class="' + cl((R.win || 0) - 50) + '">' + (R.win == null ? "–" : Math.round(R.win) + "%") + '</b><em>같은 날 지수 대비</em></div></div>' +
      '<div class="mc-ht"><small>같은 날 지수(한국 = 코스피 · 나머지 = S&amp;P500)를 샀을 때보다 · 1만 번</small>' + hist(R.ex, "man") + '</div>' +
      '<ul class="mc-n"><li>실제 기록: ' + R.n + '번 중 <b>' + Math.round(R.wr) + '%</b>가 5일 뒤 플러스 · 평균 <b class="' + cl(R.avg) + '">' + sg(R.avg, 2) + '%</b>(비용 뺀 값)</li>' +
      (R.win != null && R.win - R.pos > 20 ? '<li>⚠️ 이 기간엔 지수 자체가 빠져서 「지수보다 나음」이 높게 나와요. 오른 장에서도 그런지는 기록이 더 쌓여야 알 수 있어요.</li>' : '') +
      '<li>그래서 지금은 이 신호를 ⚡ 공격 포트에 「성과가 확인될 때만」 넣어요. 기록이 쌓일수록 이 카드 숫자가 진짜에 가까워져요.</li>' +
      '<li>방법: 신호 하나 = 그날 종가에 사서 5거래일 뒤 팔기 · 한 번에 100만 원 · 겹쳐 사는 건 따지지 않음(단순화).</li></ul>';
  }
  var LAB = {port: "💼 기본 포트", cup: "☕ 컵 차트", gap: "📈 갭 상승"};
  function paint(box){
    box.innerHTML = '<h3>🎲 1만 번 돌려보기 <span class="mut">실제 기록을 무작위로 다시 뽑기</span></h3>' +
      '<div class="mc-seg">' + Object.keys(LAB).map(function(k){ return '<button type="button" data-mc="' + k + '" class="' + (k === SEL ? "on" : "") + '">' + LAB[k] + '</button>'; }).join("") + '</div>' +
      '<div id="mcb"><div class="loading">1만 번 굴리는 중…</div></div>' +
      '<div class="mc-f"><button type="button" id="mcre">🔁 다시 돌리기</button><small>과거 계산 · 미래 보장 아님 · 사라는 뜻 아님</small></div>';
    [].forEach.call(box.querySelectorAll("[data-mc]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); SEL = b.dataset.mc; try { localStorage.setItem("mc_sel", SEL); } catch(x) {} paint(box); }; });
    var re = box.querySelector("#mcre"); if (re) re.onclick = function(ev){ ev.stopPropagation(); SEED++; paint(box); };
    var pr = SEL === "port" ? portData() : sigData(SEL);
    pr.then(function(P){
      var b = box.querySelector("#mcb"); if (!b) return;
      if (!P || (P.n != null && P.n < 10)){ b.innerHTML = '<p class="note">자료를 아직 못 불러왔어요. 잠시 뒤 다시 열어 주세요.</p>'; return; }
      setTimeout(function(){ var t0 = Date.now(), R = SEL === "port" ? runPort(P) : runSig(P); b.innerHTML = body(R, P); b.setAttribute("data-ms", String(Date.now() - t0)); }, 30);
    }).catch(function(){ var b = box.querySelector("#mcb"); if (b) b.innerHTML = '<p class="note">계산하지 못했어요.</p>'; });
  }
  function mount(){
    if ((typeof cur === "undefined" ? "" : cur) !== "score") return;
    var m = document.getElementById("main"); if (!m || document.getElementById("mc10k")) return;
    var box = document.createElement("section"); box.className = "card mc no-clp"; box.id = "mc10k"; box.setAttribute("data-xc", "1"); box.setAttribute("data-xs", "keep");
    var hero = m.querySelector(":scope > .hero"); if (hero) hero.insertAdjacentElement("afterend", box); else m.insertBefore(box, m.firstChild);
    paint(box);
  }
  var T = 0;
  new MutationObserver(function(){ if (T) return; T = setTimeout(function(){ T = 0; mount(); }, 120); }).observe(document.documentElement, {childList: true, subtree: true});
  window.mc10k = {runPort: runPort, runSig: runSig, portData: portData, sigData: sigData};

  var css = document.createElement("style");
  css.textContent =
    ".mc-seg{display:flex;gap:6px;margin:0 0 14px;overflow-x:auto;scrollbar-width:none}.mc-seg::-webkit-scrollbar{display:none}" +
    ".mc-seg button{flex:none;font:inherit;font-size:15px;font-weight:700;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--sub)}.mc-seg button.on{background:var(--text);color:var(--bg);border-color:transparent}" +
    ".mc-big small{display:block;font-size:14px;font-weight:700;color:var(--sub)}.mc-big>b{display:block;font-size:clamp(44px,13vw,58px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin:2px 0 6px}.mc-big>b.up{color:var(--up,#f04452)}.mc-big>b.dn{color:var(--down,#3182f6)}.mc-big p b{color:var(--text);font-weight:800}" +
    ".mc-big p{margin:0 0 14px;font-size:15px;line-height:1.55;color:var(--sub);word-break:keep-all}" +
    ".mc-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}.mc-g>div{background:var(--panel2);border-radius:14px;padding:10px 10px 9px;min-width:0}" +
    ".mc-g small{display:block;font-size:13px;color:var(--sub);font-weight:600;line-height:1.3;word-break:keep-all}.mc-g b{display:block;font-size:19px;font-weight:900;letter-spacing:-.6px;margin:3px 0 2px;white-space:nowrap}.mc-g em{display:block;font-style:normal;font-size:13px;color:var(--dim);line-height:1.3;word-break:keep-all}" +
    ".mc-g b.up{color:var(--up,#f04452)}.mc-g b.dn{color:var(--down,#3182f6)}" +
    ".mc-ht small{display:block;font-size:13.5px;color:var(--sub);margin-bottom:4px}.mc-h{width:100%;height:auto;display:block}.mc-h rect.u{fill:var(--up,#f04452);opacity:.85}.mc-h rect.d{fill:var(--down,#3182f6);opacity:.85}.mc-h .z{stroke:var(--text);stroke-width:1.2;stroke-dasharray:3 3}.mc-h text{fill:var(--dim);font-size:11px}" +
    ".mc-n{margin:12px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:var(--sub)}.mc-n li{margin:3px 0}.mc-n b{color:var(--text)}" +
    ".mc-w{background:color-mix(in srgb,#f59f00 14%,var(--panel));border:1px solid color-mix(in srgb,#f59f00 40%,transparent);border-radius:14px;padding:10px 12px;font-size:14px;line-height:1.5;margin-bottom:12px}" +
    ".mc-f{display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap}.mc-f button{font:inherit;font-size:15px;font-weight:800;padding:10px 16px;border-radius:999px;border:0;background:var(--acc,#3182f6);color:#fff}.mc-f small{font-size:13px;color:var(--dim)}";
  document.head.appendChild(css);
})();
;
/* ======== iconz.js ======== */
/* 🔣 아이콘 풀이 (10/22 사용자 「설정 칸에 아이콘 풀이도 — 모든 아이콘 쉽게 설명」)
   ⚙️ 보기 설정 › 「🔣 아이콘 풀이」 → 아래에서 올라오는 칸(용어 풀이와 같은 모양) · 묶음별 · 위 찾기 칸으로 거르기 */
(function(){
  var G = [
    ["📍 화면 위·아래 버튼", [
      ["🏠", "오늘 — 오늘 꼭 볼 것만 모은 첫 화면"],
      ["🌐", "시장 · 시황 — 매일 아침 시장 전략 리포트"],
      ["🧭", "나침반 — 한국·미국·일본·중국·홍콩 5개 시장을 한눈에"],
      ["🎲", "시장확률 — 다음 장이 오를 확률(아직 검증 중이라 약하게만 말해요)"],
      ["💼", "포트 — 시황대로 투자했다면 얼마 벌었나"],
      ["📊", "성적표 — 앱이 한 말이 맞았는지 채점"],
      ["🎯", "신호 — 고래·컵·갭 같은 종목 신호 모음 (ELS 탭과 「집중」에도 쓰여요)"],
      ["🛍️", "상품 — 채권·펀드·ELS"],
      ["📰", "피드 — 매일 읽는 블로그·텔레그램·뉴스"],
      ["🔍", "종목 검색 — 이름이나 코드로 찾기"],
      ["⭐", "관심 종목 — 별표 해 둔 종목 모아 보기"],
      ["⚙️", "보기 설정 — 화면 밝기·글자 크기·순서 (지금 이 칸)"],
      ["🧒", "조이(Joey) 얼굴 — 어플 안내자. 누르면 그 화면·카드를 설명해 줘요"],
      ["🔴", "CH 옆 작은 점 — 오늘 시장 날씨 색(초록 맑음 · 노랑 흐림 · 빨강 비)"],
      ["⟳", "몇 분 전 — 자료가 마지막으로 바뀐 시각"],
      ["←", "뒤로 — 앞 화면으로"]
    ]],
    ["🎨 색과 표시", [
      ["빨강 숫자", "올랐다 (+)"],
      ["파랑 숫자", "내렸다 (−)"],
      ["회색 밑줄", "누르면 그 화면으로 이동"],
      ["▲ ▼", "올라감 · 내려감 (지난번 본 값과 비교할 때도)"],
      ["🟢", "좋음 · 켬 · 사기 · 상승장"],
      ["🔴", "나쁨 · 끔 · 팔기 · 상승장 아님"],
      ["🟡", "보통 · 절반만 팔기"],
      ["⚪", "중립 · 판단 없음"],
      ["✓ ✅", "맞았다 · 확인됨"],
      ["✗ ❌", "틀렸다 · 기각(써 봤는데 안 됨)"],
      ["⚠️", "주의 — 기준에 못 미치거나 조심할 것"],
      ["⏳", "기다리는 중 · 자료가 늦어짐"],
      ["🆕", "새로 생김"],
      ["👑", "1등"],
      ["▾ ▴", "펼치기 · 접기"],
      ["›", "자세히 보기 · 그 화면으로"]
    ]],
    ["🌤 오늘 날씨와 시간", [
      ["☀️", "맑음 — 크게 오른 날"],
      ["🌤", "구름 조금 — 조금 오른 날"],
      ["☁️ ⛅", "흐림 — 큰 움직임 없음 · 신호가 엇갈림"],
      ["🌧", "비 — 내린 날"],
      ["⛈", "폭풍 — 크게 내린 날"],
      ["🌫", "보류 — 판단할 신호가 적음"],
      ["🌅", "아침판 — 밤사이 미국 + 오늘 볼 것"],
      ["🌞", "장중판 — 지금 한국 장"],
      ["🌆", "저녁판 — 오늘 마감 + 내일 확률"],
      ["🌙", "밤판 — 미국 장"],
      ["🗓", "주말판"]
    ]],
    ["💼 포트", [
      ["💼", "기본 포트 — 시황 배분표대로(S&P500 반 + 나스닥 반이 뼈대)"],
      ["⚡", "공격(킥) 포트 — 기본에 검증된 신호 종목을 조금 섞은 것"],
      ["🎯", "집중 포트 — 오르는 장일 때만 몰아서 담기"],
      ["🙋", "내 포트 — 내가 정한 비중"],
      ["🎛", "설계기 — 비중을 밀면 2008년부터 다시 계산"],
      ["🏁", "경주 · 비교 — 시장(S&P500 등)과 누가 앞서나"],
      ["📋", "따라하기 — 지금 뭘 얼마나 담으면 되나"],
      ["🔁", "비중 바뀐 날"],
      ["🧩", "칸별 — 어느 칸이 벌고 잃었나"],
      ["🦴", "뼈대 · 변동성 맞춤 — 시장이 많이 흔들리면 주식을 줄임"],
      ["🅿️", "빈 자리 주차 — 신호가 없을 땐 그 돈을 지수에 넣어 둠"],
      ["🛑", "멈춤 — 이 신호가 많이 잃어 한동안 새로 안 삼"],
      ["✂", "반 크기 — 손실이 나서 절반만 삼"],
      ["⛔", "브레이크 — 공격 칸이 많이 빠져 새로 안 삼"]
    ]],
    ["🐋 신호 출처 (종목 앞 작은 표시)", [
      ["🐋", "고래 — 큰 펀드·유명 투자자가 새로 산 종목"],
      ["☕", "컵 — 컵 모양으로 바닥을 다지고 오르려는 차트"],
      ["📈", "갭 — 전날보다 훌쩍 높게 시작해 지키는 종목"],
      ["🤫", "조용한 매집 — 가격은 그대로인데 거래가 늘어남"],
      ["📊", "실적 갭 · 실적 표류 — 실적 발표 뒤 움직임"],
      ["🏔", "신고가 — 52주(1년) 최고가를 새로 씀"],
      ["🩹", "급락 반등 — 크게 빠진 뒤 튀어 오름"],
      ["🔌", "고객사 → 납품사 — 큰 고객이 좋으면 납품하는 회사도"],
      ["🕵", "내부자 매수 — 임원이 자기 돈으로 삼"],
      ["🔗", "선행 — 먼저 움직이는 종목을 따라감"],
      ["🤝", "신호 합의 — 여러 신호에 같이 뜸"],
      ["🌱", "조용한 신고가 — 거래 없이 신고가"],
      ["🏆", "섹터 1등주 · 오늘의 배지"],
      ["🎰 🐸", "거름망 — 너무 튄 종목·불안한 종목 걸러냄"],
      ["📰", "뉴스 없는 갭 (피드 탭에선 뉴스·글)"]
    ]],
    ["🧪 검증 · 정직", [
      ["🧪", "시험 중 — 절반 크기로 먼저 해 봄"],
      ["👻", "그림자 — 실제론 안 사고 「샀다면」만 채점"],
      ["🧾", "정직 계산 · 시도 장부 — 비용까지 뺀 성적, 시험한 조합 수"],
      ["📡", "실측 — 공개된 기준가로 직접 계산"],
      ["🧮", "추정 — 기준가가 없어 비슷한 것으로 계산"],
      ["📷", "사진 값 — 받은 화면 사진 그대로"],
      ["🔮", "예고 — 시황 리포트가 한 예상(다음 날 채점)"],
      ["🗳", "내 표 — 예고에 👍👎 던지기"],
      ["👁", "내 눈 — 내가 「볼 만함」 찍은 종목 성적"],
      ["🌙", "밤 연구 — 매일 밤 규칙을 시험"]
    ]],
    ["🧠 시장 분석", [
      ["🧠 💭", "두뇌 · 지금 생각 — 뉴스·글을 읽고 매시간 고치는 판단"],
      ["🫀", "심리 계기판 — VIX·선물·옵션·신용"],
      ["😱", "공포 · 급락 — 「그날 팔았다면?」"],
      ["🌡️", "체감 온도 — 공포·탐욕"],
      ["🧲", "오늘과 닮은 날 — 과거에 비슷했던 날"],
      ["🔥", "강함 · 과열 (오늘 탭에선 연속 방문)"],
      ["🧊", "계속 약함"],
      ["🍂", "힘 빠지는 중"],
      ["🚀", "박스 돌파"],
      ["🕳", "갭 메움 — 뛴 만큼 다시 내려옴"],
      ["🌉", "미국 밤 → 한국 아침"],
      ["🏛", "연기금 · 프로그램 매매"],
      ["🛰 💵", "선행 지표 · 자금 흐름"],
      ["🪙", "크립토(코인) 공포·탐욕"],
      ["🕸 ⚔ 🚨 💸 🕰", "고래 겹침 · 고래끼리 · 고래 매도 경보 · 고래보다 싸게 · 고래 타임라인"],
      ["🧬", "매집의 생애"],
      ["🌗", "미국 시간외 가격"],
      ["🗺", "섹터 지도"],
      ["📜", "국면 기록"]
    ]],
    ["🛍️ 상품", [
      ["🏦", "채권"],
      ["📦", "펀드"],
      ["🎯", "ELS"],
      ["🔒 🔓", "사모 라인업 잠금 · 열림"],
      ["🎬", "과거 재생 — 2006년부터 매일 가입했다면"],
      ["📌", "담아 두기 — 내 ELS 지금 어디쯤"],
      ["🧺", "구성 엿보기 — 펀드가 담은 종목"],
      ["💵", "달러 상품"]
    ]],
    ["🌏 나라", [
      ["🇰🇷", "한국"], ["🇺🇸", "미국"], ["🇯🇵", "일본"], ["🇨🇳", "중국"], ["🇭🇰", "홍콩"], ["🇧🇷", "브라질"], ["🇦🇺", "호주"], ["🌏", "해외 · 동종주"]
    ]],
    ["🔧 기타 버튼", [
      ["📤", "공유 — 카톡 등으로 보내기"],
      ["🔔", "알림 켜기·끄기"],
      ["💬", "의견함 — 앱에 바라는 점"],
      ["📖", "용어 풀이"],
      ["👆", "카드를 길게 누르면 조이가 요약"],
      ["📅", "날짜 · 일정"],
      ["📝", "기록 · 메모"]
    ]]
  ];
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function open(){
    var old = document.getElementById("icz"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "icz";
    d.innerHTML = '<div class="gl-in"><div class="gl-t"><b>🔣 아이콘 풀이</b><button class="icz-x" aria-label="닫기">✕</button></div>' +
      '<input aria-label="찾기" class="icz-q" type="search" placeholder="찾기 (예: 고래, 빨강, 🧪)">' +
      G.map(function(g){ return '<div class="icz-g"><div class="icz-h">' + e(g[0]) + '</div>' + g[1].map(function(x){ var t = /[가-힣]/.test(x[0]), c = /빨강/.test(x[0]) ? " up" : /파랑/.test(x[0]) ? " dn" : /밑줄/.test(x[0]) ? " ul" : "";
        return '<div class="icz-r"><span class="' + (t ? "t" + c : "") + '">' + (t && c && c !== " ul" ? (c === " up" ? "+2.3%" : "−1.8%") : t && c === " ul" ? "포트 ›" : e(x[0])) + '</span><p>' + (t && c ? "<b>" + e(x[0]) + "</b> — " : "") + e(x[1]) + '</p></div>'; }).join("") + '</div>'; }).join("") +
      '<p class="icz-n">숫자·말은 「사라·팔라」는 뜻이 아니에요.</p></div>';
    d.onclick = function(ev){ if (ev.target === d || ev.target.closest(".icz-x")) d.remove(); };
    var q = d.querySelector(".icz-q");
    q.oninput = function(){ var v = q.value.trim();
      [].forEach.call(d.querySelectorAll(".icz-g"), function(g){ var any = 0;
        [].forEach.call(g.querySelectorAll(".icz-r"), function(r){ var ok = !v || r.textContent.indexOf(v) >= 0; r.style.display = ok ? "" : "none"; if (ok) any = 1; });
        g.style.display = any ? "" : "none"; }); };
    document.body.appendChild(d);
  }
  window.chIcons = open;
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-icons]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); open(); }, true);
  // ⚙️ 보기 설정 칸에 단추 넣기 (📖 용어 풀이 다음)
  function addBtn(){ var g = document.querySelector("#uiset .us-go"); if (!g || g.querySelector("[data-icons]")) return;
    var b = document.createElement("button"); b.setAttribute("data-icons", "1"); b.textContent = "🔣 아이콘 풀이";
    var gl = g.querySelector("[data-gloss]"); g.insertBefore(b, gl ? gl.nextSibling : g.firstChild); }
  new MutationObserver(function(){ if (document.getElementById("uiset")) addBtn(); }).observe(document.documentElement, {childList: true, subtree: true});
  var st = document.createElement("style");
  st.textContent = "#icz{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}" +
    ".icz-q{width:100%;box-sizing:border-box;margin:2px 0 8px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:15px}" +
    ".icz-h{position:sticky;top:-14px;background:var(--panel);font-weight:800;font-size:14px;padding:10px 0 6px;margin-top:6px;border-bottom:1px solid var(--line);z-index:1}" +
    ".icz-r{display:grid;grid-template-columns:76px 1fr;gap:10px;align-items:center;padding:8px 2px;border-bottom:1px dashed var(--line)}.icz-r:last-child{border-bottom:0}" +
    ".icz-r span{font-size:20px;text-align:center;line-height:1.2;word-break:keep-all}.icz-r p{margin:0;font-size:14px;line-height:1.5;color:var(--text)}" +
    ".icz-r span.t{font-size:15px;font-weight:800}.icz-r span.up{color:var(--up)}.icz-r span.dn{color:var(--down)}.icz-r span.ul{color:var(--sub);text-decoration:underline;text-underline-offset:3px;font-weight:600}" +
    ".icz-n{font-size:12.5px;color:var(--sub);margin:12px 0 0;text-align:center}";
  document.head.appendChild(st);
})();
;
/* ======== today.js ======== */
/* 🏠 오늘 탭 10가지 (10/22 사용자 「오늘 카테고리 더 임팩트·신선·우와·레이아웃·눈에 확 — 다해」)
   ① 🌤 날씨판 — 맨 위 한 장면: 오늘 숫자로 배경·날씨가 바뀌고 꼬마가 그날 표정으로 한마디
   ② 🔥 히어로 숫자 — 지금 가장 중요한 숫자 하나를 크게 + 그날 장중 선을 배경으로 · 「2000년 이후 이만큼 움직인 날 N번」
   ③ ⚡ 카운트업 — 날씨판 숫자가 0 에서 촤르륵
   ④ 🎞 「그날 팔았다면?」 → 세 컷 만화 (숫자 표는 「숫자로 자세히」 접기 안에 그대로)
   ⑤ 🏁 내 포트 경주 트랙 — 기본·공격·집중·S&P 레인 + 하루하루 S&P 이긴 날 점 띠 (선 그래프는 「선으로 보기」)
   ⑥ 🧭 바뀐 것 → 세로 타임라인 · 바뀐 칩은 색이 들어오며 등장
   ⑦ 🌙 시간대별 첫 장면 — 아침(밤사이 미국)·장중(지금 코스피)·저녁(오늘 마감 + 내일 확률)·밤(미국 선물)
   ⑧ 🏆 오늘의 배지 — 어제 S&P 이김 · 예고 적중 · 시장 절반 넘게 앞섬 · 연속 방문
   ⑨ 👆 카드를 길게 누르면 꼬마가 한 줄씩 요약 (window.gdSay · guide.js)
   ⑩ 🎨 색 규칙 — 오름 빨강 · 내림 파랑 · 바로가기는 회색 밑줄 (파랑 = 내림 하나로)
   원칙: 숫자는 자료 그대로(지어내지 않음) · 사라·팔라는 말 없음 · 자료가 없으면 그 칸은 안 보임 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function gj(u, ttl){ return typeof getJSON === "function" ? getJSON(u, {ttl: ttl || 120000}).catch(function(){ return null; }) : Promise.resolve(null); }
  var q2 = function(){ return "?" + Math.floor(Date.now() / 120000); };

  /* ── ⑦ 시간대 ── */
  function slot(){ var t = kst(), m = t.getUTCHours() * 60 + t.getUTCMinutes(), wd = t.getUTCDay();
    if (wd === 0 || wd === 6) return "week";
    if (m >= 6 * 60 && m < 9 * 60) return "morn";
    if (m >= 9 * 60 && m < 15 * 60 + 30) return "day";
    if (m >= 15 * 60 + 30 && m < 22 * 60 + 30) return "eve";
    return "night"; }
  var SLOT = {morn: ["🌅", "아침판"], day: ["🌞", "장중판"], eve: ["🌆", "저녁판"], night: ["🌙", "밤판"], week: ["🗓", "주말판"]};

  /* ── ① 날씨 ── */
  var WX = {
    sun:   {ic: "☀️", w: "맑음",      kid: "img/kid_joy.jpg?v=1", acc: "", say: "기분 좋은 날이에요"},
    part:  {ic: "🌤", w: "구름 조금", kid: "img/kid_thumb.jpg?v=1",  acc: "",   say: "살짝 맑아요"},
    cloud: {ic: "☁️", w: "흐림",      kid: "img/kid_globe.jpg?v=1", acc: "",   say: "큰 움직임 없이 흐려요"},
    rain:  {ic: "🌧", w: "비",        kid: "img/kid_umb.jpg?v=1", acc: "", say: "비가 와요, 서두르지 말아요"},
    storm: {ic: "⛈", w: "폭풍",      kid: "img/kid_worry.jpg?v=1", acc: "⛈", say: "폭풍우예요 — 오늘은 숫자보다 마음을 지켜요"}
  };
  function wxOf(r){ return r == null ? "cloud" : r >= 1.5 ? "sun" : r >= 0.3 ? "part" : r > -0.3 ? "cloud" : r > -1.5 ? "rain" : "storm"; }

  /* ── 자료 ── */
  var KP = null;
  function kospiHist(){
    if (KP) return KP;
    KP = gj("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), 600000).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return gj("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), 3600e3);
    }).then(function(j){
      if (!j || !j.dd) return null;
      var c = j.c.map(Number), rs = [];
      for (var i = 1; i < c.length; i++) rs.push((c[i] / c[i - 1] - 1) * 100);
      return {rs: rs, from: String(j.d0).slice(0, 4)};
    }).catch(function(){ return null; });
    return KP;
  }
  function load(){
    return Promise.all([gj(RAW + "home.json" + q2()), gj("archive/x/live_kr.json" + q2()), gj("archive/x/live_us_pre.json" + q2()), gj("archive/x/prob.json" + q2()), kospiHist()]);
  }

  /* ── ①②⑦ 장면 고르기 ── */
  function scene(H, LK, US, PB){
    var s = slot(), P = (H && H.port) || {}, td = today();
    var kr = LK && LK.date === td ? (LK.index || []).filter(function(x){ return x.name === "코스피"; })[0] : null;
    var kq = LK && LK.date === td ? (LK.index || []).filter(function(x){ return x.name === "코스닥"; })[0] : null;
    var es = US && US.date === td ? (US.fut || []).filter(function(x){ return x.s === "ES=F"; })[0] : null;
    var krp = PB && PB.markets && PB.markets.KR;
    var S = {slot: s, P: P, kr: kr, kq: kq, es: es};
    // 큰 숫자 하나
    if (s === "day" && kr) S.big = {lab: "🇰🇷 지금 코스피", sh: "지금 코스피", v: kr.chg, krx: 1, sub: (LK.up != null ? "오른 종목 " + Math.round(LK.up / Math.max(1, LK.total) * 100) + "%" : "") + " · " + e(LK.t) + " 기준"};
    else if (s === "eve" && kr) S.big = {lab: "🇰🇷 오늘 코스피 마감", sh: "코스피 마감", v: kr.chg, krx: 1, sub: kq ? "코스닥 " + sg(kq.chg, 1) + "%" : ""};
    else if ((s === "night" || s === "eve") && es) S.big = {lab: "🇺🇸 S&P500 선물", sh: "S&P 선물", v: es.chg, sub: "미국 장 열기 전 · " + e(US.t) + " 기준"};
    else if (P.d1_spy != null) S.big = {lab: "🇺🇸 밤사이 S&P500", sh: "밤사이 S&P", v: P.d1_spy, sub: md(P.d1_date) + " 미국 종가"};
    else if (kr) S.big = {lab: "🇰🇷 코스피", sh: "코스피", v: kr.chg, krx: 1, sub: ""};
    S.wx = wxOf(S.big ? S.big.v : null);
    // 장중 선 (코스피 등락 % — snaps 네 번째 칸)
    S.line = LK && LK.date === td && (LK.snaps || []).length > 3 ? LK.snaps.map(function(x){ return +x[3]; }).filter(function(v){ return !isNaN(v); }) : null;
    // 내일 확률(저녁·주말) — 실전 성적이 쌓이기 전이라 말은 약하게
    if ((s === "eve" || s === "week") && krp && krp.p1 != null){
      var hit = PB.score && PB.score.all && PB.score.all.d1 ? PB.score.all.d1.hit : null;
      S.prob = {p: Math.round(krp.p1 * 100), tone: krp.tone1 || "", day: nextLab(krp.next_day), hit: hit, weak: hit != null && hit < 50}; }
    // 꼬마 한마디
    var W = WX[S.wx], b = S.big;
    var lead = s === "morn" ? "좋은 아침이에요! " : s === "eve" ? "오늘 장 끝! " : s === "night" ? "밤이에요 🌙 " : s === "week" ? "주말이에요 🗓 " : "";
    S.say = lead + (b ? b.sh + " " + sg(b.v, 1) + "% · " : "") + W.say;
    if (s === "morn" && (H.focus || []).length) S.say2 = "오늘 볼 곳: " + H.focus.map(function(t){ return t.name; }).slice(0, 2).join(" · ");
    else if (S.prob && (S.prob.p >= 85 || S.prob.p <= 15)) S.say2 = S.prob.day + " 코스피 확률은 극단값 — 오늘은 참고하지 않아요";   // 🎲 11/10 #2
    else if (S.prob && !S.prob.weak) S.say2 = S.prob.day + " 코스피 오를 확률 " + S.prob.p + "% (" + S.prob.tone + " · 아직 검증 중)";
    else if (S.prob) S.say2 = S.prob.day + " 코스피는 " + S.prob.tone + " · 실전 적중 " + Math.round(S.prob.hit) + "%라 참고만";   // 10/31 A4: 성적 낮을 땐 숫자 빼고 회색으로
    return S;
  }

  /* 10/31 A2: 「내일」이 주말·휴장이면 실제 다음 장 요일로 */
  function nextLab(nd){
    if (!nd) return "다음 장";
    var t = Date.parse(today() + "T00:00:00Z"), n = Date.parse(nd + "T00:00:00Z");
    if (isNaN(n)) return "다음 장";
    var dd = Math.round((n - t) / 864e5);
    if (dd === 1) return "내일";
    if (dd === 0) return "오늘";
    return ["일", "월", "화", "수", "목", "금", "토"][new Date(n).getUTCDay()] + "요일(" + nd.slice(5).replace("-", "/") + ")";
  }

  /* ── ⑧ 배지 ── */
  function streak(){
    var V = ls("td_visits") || [], d = today();
    if (V[V.length - 1] !== d){ V.push(d); V = V.slice(-60); ls("td_visits", V); }
    var n = 1, t = Date.parse(d + "T00:00:00Z");
    for (var i = V.length - 2; i >= 0; i--){ t -= 864e5; var dd = new Date(t).toISOString().slice(0, 10);
      while (new Date(t).getUTCDay() === 0 || new Date(t).getUTCDay() === 6){ if (V[i] === dd) break; t -= 864e5; dd = new Date(t).toISOString().slice(0, 10); }
      if (V[i] === dd) n++; else break; }
    return n;
  }
  function badges(H){
    var P = (H && H.port) || {}, G = H && H.grade, out = [];
    if (P.d1 != null && P.d1_spy != null && P.d1 > P.d1_spy) out.push(["🏆", "어제 S&P 이김", "내 포트(기본) " + sg(P.d1, 2) + "% vs S&P " + sg(P.d1_spy, 2) + "% (" + md(P.d1_date) + ")"]);
    if (G && (G.items || []).length){ var ok = G.items.filter(function(x){ return x.cls === "ok"; }).length, n = G.items.filter(function(x){ return x.cls === "ok" || x.cls === "no"; }).length;
      if (n && ok / n >= 0.6) out.push(["🎯", "예고 " + ok + "/" + n + " 적중", md(G.prev || G.date) + " 시황 예고 채점"]); }
    if (P.n_bench && P.beat_kick != null && P.beat_kick * 2 > P.n_bench) out.push(["📈", "시장 " + P.n_bench + "곳 중 " + P.beat_kick + "곳 앞섬", md(P.start) + "부터 · 공격(킥) 기준"]);
    var st = streak(); if (st >= 2) out.push(["🔥", st + "일 연속", "평일 기준 연속으로 앱을 연 날"]);
    return out.slice(0, 3);
  }

  /* ── ② 장중 선 배경 svg ── */
  function bgLine(L){
    if (!L || L.length < 4) return "";
    var mn = Math.min.apply(null, L.concat([0])), mx = Math.max.apply(null, L.concat([0])), r = (mx - mn) || 1, W = 300, Hh = 90;
    var pts = L.map(function(v, i){ return (i / (L.length - 1) * W).toFixed(1) + "," + (8 + (mx - v) / r * (Hh - 16)).toFixed(1); }).join(" ");
    var z = (8 + mx / r * (Hh - 16)).toFixed(1);
    return '<svg class="tz-bg" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + z + '" y2="' + z + '" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>' +
      '<polyline points="0,' + Hh + ' ' + pts + ' ' + W + ',' + Hh + '" fill="rgba(255,255,255,.10)" stroke="none"/><polyline class="tz-bgl" points="' + pts + '" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
  }

  /* ── ①② 날씨판 그리기 ── */
  function rankLine(S, K){
    var b = S.big; if (!b || !b.krx || !K || Math.abs(b.v) < 1.5) return "";
    var r = b.v, n = K.rs.filter(function(x){ return r < 0 ? x <= r : x >= r; }).length, pct = n / K.rs.length * 100;
    return '<div class="tz-rank">' + K.from + '년 이후 하루 ' + Math.abs(r).toFixed(1) + '% 넘게 ' + (r < 0 ? "빠진" : "오른") + ' 날 <b>' + n + '번</b> · 상위 ' + (pct < 1 ? pct.toFixed(1) : Math.round(pct)) + '%</div>';
  }
  function hero(H, LK, US, PB, K){
    var S = scene(H, LK, US, PB), W = WX[S.wx], P = S.P, sl = SLOT[S.slot], b = S.big;
    var mini = [];
    if (S.kr && !(b && b.krx)) mini.push(["🇰🇷 코스피", S.kr.chg, S.kr.status === "CLOSE" ? "마감" : "지금"]);   // 10/31 A2: 큰 숫자와 같은 건 작은 칸에서 뺌
    var bigUS = b && /S&P/.test(b.sh || "");
    if (S.es && S.slot !== "morn" && S.slot !== "week" && !/선물/.test(b && b.sh || "")) mini.push(["🇺🇸 S&P 선물", S.es.chg, "지금"]);
    else if (P.d1_spy != null && !bigUS) mini.push(["🇺🇸 S&P500", P.d1_spy, md(P.d1_date)]);
    if (bigUS && P.d1_qqq != null) mini.push(["🇺🇸 나스닥", P.d1_qqq, md(P.d1_date)]);
    if (P.d1 != null) mini.push(["💼 내 포트", P.d1, md(P.d1_date)]);
    var BG = badges(H);
    var rw = !!(b && b.krx && S.line && S.line.length >= 4);   // 🎞 되감기 (A10/30-3)
    var h = '<div class="tz-sky ' + S.wx + (rw ? ' tz-rwok' : '') + '">' + (S.wx === "rain" || S.wx === "storm" ? '<i class="tz-rain" aria-hidden="true"></i>' : S.wx === "sun" ? '<i class="tz-sun" aria-hidden="true"></i>' : '') + bgLine(S.line) +
      '<div class="tz-top"><span class="tz-wx">' + W.ic + ' <b>' + W.w + '</b></span><span class="tz-sl">' + sl[0] + ' ' + sl[1] + '</span></div>' +
      '<div class="tz-main">' +
        '<div class="tz-kid" style="background-image:url(' + (S.slot === "night" && S.wx !== "storm" ? "img/kid_night.jpg?v=1" : W.kid) + ')"' + ' aria-hidden="true">' + (W.acc ? '<i>' + W.acc + '</i>' : '') + '</div>' +
        '<div class="tz-num">' + (b ? '<small>' + e(b.lab) + '</small><b class="tz-cnt" data-v="' + b.v + '">' + sg(b.v, 2) + '%</b><em>' + e(b.sub || "") + '</em>' : '<small>오늘</small><b>–</b>') + '</div>' +
      '</div>' +
      rankLine(S, K) +
      '<div class="tz-say"><b>' + e(S.say) + '</b>' + (S.say2 ? '<small>' + e(S.say2) + '</small>' : '') + '</div>' +
      (mini.length ? '<div class="tz-mini">' + mini.map(function(m){ return '<div><small>' + m[0] + '</small><b class="tz-cnt" data-v="' + m[1] + '">' + sg(m[1], 2) + '%</b><em>' + e(m[2]) + '</em></div>'; }).join("") + '</div>' : '') +
      (BG.length ? '<div class="tz-bdg">' + BG.map(function(x){ return '<span title="' + e(x[2]) + '" data-why="' + e(x[2]) + '">' + x[0] + ' ' + e(x[1]) + '</span>'; }).join("") + '</div>' : '') +
      '<div class="tz-hint">' + (rw ? '⏪ 카드를 옆으로 밀면 오늘 하루가 되감겨요' : '👆 카드를 길게 누르면 조이가 요약해 줘요') + '</div>' +
    '</div>';
    return h;
  }
  /* ── 🎞 오늘 하루 되감기 (A10/30-3 · 10/30 사용자 「1,3번 진행해」) ──
     장중 선이 깔린 큰 카드를 옆으로 밀면 그 시각(10분마다 저장된 snaps)의 코스피 % · 오른/내린 종목 수 · 코스닥 · 가장 센/약한 업종으로 바뀜
     손을 떼면 지금으로 돌아옴 · 세로로 움직이면 그냥 스크롤 · 숫자는 live_kr.json snaps 그대로(지어내지 않음) */
  var RWX = 0;
  function rewind(d, LK){
    var sky = d.querySelector(".tz-sky.tz-rwok"); if (!sky || !LK || LK.date !== today()) return;
    var sn = (LK.snaps || []).filter(function(x){ return x && x[3] != null && !isNaN(+x[3]); }); if (sn.length < 4) return;
    var nb = sky.querySelector(".tz-num b"), lab = sky.querySelector(".tz-num small"), sub = sky.querySelector(".tz-num em"); if (!nb || !lab) return;
    var L = sn.map(function(x){ return +x[3]; }), mn = Math.min.apply(null, L.concat([0])), mx = Math.max.apply(null, L.concat([0])), rr = (mx - mn) || 1, last = sn[sn.length - 1];
    var cur = document.createElement("i"); cur.className = "tz-rwc"; cur.innerHTML = '<i class="tz-rwd"></i>'; sky.appendChild(cur);
    var tip = document.createElement("div"); tip.className = "tz-rwt"; sky.appendChild(tip);
    var o = null, st = null, idx = -1;
    function show(i){
      if (i === idx) return; idx = i; var s = sn[i], v = +s[3], n = sn.length;
      if (!o) o = {nb: nb.textContent, nc: nb.className, lab: lab.innerHTML, sub: sub ? sub.innerHTML : ""};
      nb.textContent = sg(v, 2) + "%"; nb.className = "tz-cnt " + cl(v);
      lab.textContent = "⏪ " + s[0] + " 코스피";
      var tot = (+s[1] || 0) + (+s[2] || 0);
      if (sub) sub.textContent = "오른 종목 " + s[1] + " · 내린 " + s[2] + (tot ? " (오른 비율 " + Math.round(s[1] / tot * 100) + "%)" : "") + " · 코스닥 " + sg(+s[4], 1) + "%";
      var x = n > 1 ? i / (n - 1) * 100 : 50, y = 58 + (8 + (mx - v) / rr * 74) / 90 * 42;
      cur.style.left = x + "%"; cur.firstChild.style.top = y + "%"; sky.classList.add("tz-rwon");
      var aft = +last[3] - v;
      tip.innerHTML = (s[5] ? '<span>🔥 ' + e(s[5]) + ' <b>' + sg(+s[6], 1) + '%</b></span><span>🧊 ' + e(s[7]) + ' <b>' + sg(+s[8], 1) + '%</b></span>' : '') +
        (i < n - 1 ? '<span>그 뒤 ' + e(last[0]) + '까지 <b>' + sg(aft, 1) + '%p</b></span>' : '<span>지금</span>');
      try { navigator.vibrate && navigator.vibrate(4); } catch(z) {}
    }
    function back(){ if (!o) return; nb.textContent = o.nb; nb.className = o.nc; lab.innerHTML = o.lab; if (sub) sub.innerHTML = o.sub; o = null; idx = -1; sky.classList.remove("tz-rwon"); }
    function at(ev){ var r = sky.getBoundingClientRect(), f = Math.max(0, Math.min(1, (ev.clientX - r.left) / (r.width || 1))); return Math.round(f * (sn.length - 1)); }
    sky.addEventListener("pointerdown", function(ev){ if (ev.button > 0) return; st = {x: ev.clientX, y: ev.clientY, m: null, id: ev.pointerId}; });
    sky.addEventListener("pointermove", function(ev){
      if (!st || ev.pointerId !== st.id) return;
      var dx = ev.clientX - st.x, dy = ev.clientY - st.y;
      if (!st.m){ if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)){ st.m = "rw"; try { sky.setPointerCapture(ev.pointerId); } catch(z) {} } else if (Math.abs(dy) > 12){ st = null; return; } }
      if (st.m === "rw"){ ev.preventDefault(); show(at(ev)); }
    });
    function end(ev){ if (st && st.m === "rw"){ RWX = Date.now(); setTimeout(back, 900); } st = null; }
    sky.addEventListener("pointerup", end); sky.addEventListener("pointercancel", end);
  }

  /* ── ③ 카운트업 ── */
  function countUp(root){
    [].forEach.call(root.querySelectorAll(".tz-cnt:not([data-done])"), function(el){
      el.setAttribute("data-done", "1");
      var v = parseFloat(el.dataset.v); if (isNaN(v) || RM) return;
      var t0 = null, dur = 900;
      (function step(ts){ if (!document.body.contains(el)) return; if (t0 == null) t0 = ts;
        var q = Math.min(1, (ts - t0) / dur), ez = 1 - Math.pow(1 - q, 3);
        el.textContent = sg(v * ez, 2) + "%"; el.className = "tz-cnt " + cl(v);
        if (q < 1) requestAnimationFrame(step); })(performance.now());
    });
  }

  /* ── ④ 세 컷 만화 ── */
  function comic(){
    var s = document.getElementById("hmpanic"); if (!s || s.dataset.td) return;
    var h = s.querySelector(".pnh-h b"), r1 = s.querySelector(".pnh-r:not(.pnh-b):not(.pnh-now)"), rn = s.querySelector(".pnh-now"), rb = s.querySelector(".pnh-b"); if (!h || !r1) return;
    s.dataset.td = "1";
    var tt = h.textContent.replace(/^😱\s*/, "").split(" — ")[0];
    var c1 = r1.children, lab1 = c1[0] ? c1[0].textContent : "", v1 = c1[1] ? c1[1].textContent : "", n1 = c1[2] ? c1[2].textContent : "";
    var vb = rb && rb.children[1] ? rb.children[1].textContent : null, lb = rb && rb.children[0] ? rb.children[0].textContent.replace(/^↔\s*반대로\s*/, "") : "";
    var keep = document.createElement("details"); keep.className = "tz-raw";
    keep.innerHTML = '<summary>숫자로 자세히 ▾</summary>';
    var czh = s.querySelector(':scope > .cz-h'), czf = s.querySelector(':scope > .cz-f');   // 🔧 11/17 🩺 「#home 빈 카드 hmpanic」 — 접기(calm.js)가 먼저 붙인 제목 줄까지 「숫자로 자세히」 속에 넣어 접힌 카드가 빈 칸으로 보이던 것 → 제목 줄·접기 단추는 밖에 둠
    if (czh) czh.remove(); if (czf) czf.remove();
    while (s.firstChild) keep.appendChild(s.firstChild);
    var pan = function(img, cap, big, cls_, small){ return '<div class="tz-pan"><div class="tz-pk" style="background-image:url(' + img + ')"></div><div class="tz-pt"><small>' + cap + '</small><b class="' + (cls_ || "") + '">' + big + '</b>' + (small ? '<em>' + small + '</em>' : '') + '</div></div>'; };
    var neg1 = /^−|^-/.test(v1.trim());
    s.insertAdjacentHTML("afterbegin", '<div class="tz-ch"><b>🎞 ' + e(tt) + ' — 그날 팔았다면?</b><small>2000년 이후 같은 급락일로 되짚은 세 컷</small></div>' +
      '<div class="tz-comic">' +
        pan("img/kid_worry.jpg?v=1", "① " + e(tt.replace(/\s*[−-][\d.]+%.*$/, "")), e((tt.match(/[−-][\d.]+%/) || [""])[0]), "dn", "😱 깜짝 놀라 팔고 싶어져요") +
        pan("img/kid_piggy.jpg?v=1", "② 팔고 " + e(lab1.replace(/\s*뒤\s*돌아옴$/, "")) + " 뒤 돌아왔다면", e(v1), neg1 ? "dn" : "up", e(n1) + (neg1 ? " — 놓친 몫" : "")) +
        (vb ? pan(/^\+/.test(vb) ? "img/kid_joy.jpg?v=1" : "img/kid_umb.jpg?v=1", "③ 반대로 " + e(lb.replace(/\s*\d+거래일 뒤$/, "")), e(vb), /^\+/.test(vb) ? "up" : "dn", "120거래일 뒤 평균") : "") +
      '</div>' +
      (rn ? '<div class="tz-now">' + e(rn.children[0] ? rn.children[0].textContent : "") + (rn.children[1] && rn.children[1].tagName === "B" ? '<br>과거엔 120거래일 뒤 평균 <b class="' + rn.children[1].className + '">' + e(rn.children[1].textContent) + '</b>' + (rn.children[2] ? '<small>' + e(rn.children[2].textContent.replace(/ · 120거래일 뒤 평균/, "")) + '</small>' : '') : '') + '</div>' : ''));
    s.appendChild(keep); if (czh) s.insertBefore(czh, s.firstChild); if (czf) s.appendChild(czf);
    keep.addEventListener("click", function(ev){ ev.stopPropagation(); }, true);
  }

  /* ── ⑤ 경주 트랙 ── */
  function race(H){
    var c = document.querySelector('#hmbody section.hm-c[data-goto^="port"]'); if (!c || c.querySelector(".tz-race")) return;
    var P = (H && H.port) || {}, sp = c.querySelector(".hm-sp");
    var L = [["기본", P.base, "#e9b949"], ["공격(킥)", P.kick, "#ff6b6b"], ["집중", P.conc, "#4dd47a"], ["S&P500", P.spy, "#7c9cff"]].filter(function(x){ return x[1] != null; });
    if (L.length < 2) return;
    var vs = L.map(function(x){ return x[1]; }).concat([0]), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), pad = (mx - mn) * 0.12 || 1;
    mn -= pad; mx += pad;
    var X = function(v){ return (v - mn) / (mx - mn) * 100; }, top = Math.max.apply(null, L.map(function(x){ return x[1]; }));
    var dots = "", nW = 0, nT = 0;
    var nav = P.nav || [], spl = P.spy_line || [];
    for (var i = 1; i < Math.min(nav.length, spl.length); i++){ var a = nav[i] - nav[i - 1], b = spl[i] - spl[i - 1], w = a > b; nT++; if (w) nW++; dots += '<i class="' + (w ? "w" : "l") + '"></i>'; }
    var gap = P.base != null && P.spy != null ? P.base - P.spy : null;
    var el = document.createElement("div"); el.className = "tz-race";
    el.innerHTML = '<div class="tz-rh"><b>🏁 ' + md(P.start) + '부터 경주</b>' + (gap != null ? '<span class="' + cl(gap) + '">기본이 S&P보다 ' + sg(gap, 1) + '%p</span>' : '') + '</div>' +
      L.map(function(x){ var me = x[0] !== "S&P500";
        return '<div class="tz-ln"><span class="tz-lb">' + x[0] + '</span><div class="tz-tk"><i class="tz-z" style="left:' + X(0).toFixed(1) + '%"></i><i class="tz-rn' + (me ? " me" : "") + '" data-x="' + X(x[1]).toFixed(1) + '" style="left:' + X(0).toFixed(1) + '%;--c:' + x[2] + '">' + (x[1] === top ? "👑" : "") + '</i></div><b class="' + cl(x[1]) + '">' + sg(x[1], 2) + '%</b></div>'; }).join("") +
      (nT ? '<div class="tz-dw"><small>하루하루 S&P와 승부 — <b>' + nT + '일 중 ' + nW + '일</b> 이김</small><div>' + dots + '</div></div>' : '') +
      (sp ? '<button type="button" class="tz-tg">선으로 보기 ▾</button>' : '');
    if (sp){ sp.parentNode.insertBefore(el, sp); sp.classList.add("tzx-hide"); }
    else c.appendChild(el);
    var tg = el.querySelector(".tz-tg"); if (tg) tg.onclick = function(ev){ ev.stopPropagation(); ev.preventDefault(); var o = sp.classList.toggle("tzx-hide"); tg.textContent = o ? "선으로 보기 ▾" : "선 접기 ▴"; };
    requestAnimationFrame(function(){ setTimeout(function(){ [].forEach.call(el.querySelectorAll(".tz-rn"), function(r){ r.style.left = r.dataset.x + "%"; }); }, 60); });
  }

  /* ── ⑥ 바뀐 것 타임라인 ── */
  function timeline(){ var c = document.querySelector("#hmbody .hm-chg"); if (c && !c.classList.contains("tz-tl")) c.classList.add("tz-tl"); }

  /* ── ⑨ 길게 누르면 꼬마 요약 ── */
  var LP = {t: null, x: 0, y: 0, el: null, fired: 0};
  function summary(card){
    var tEl = card.querySelector(".hm-h b, .pl-h small, .tz-ch b, h3"), title = tEl ? tEl.textContent.replace(/\s+/g, " ").trim() : "이 카드";
    var seen = {}, lines = [];
    String(card.innerText || "").split("\n").forEach(function(l){ l = l.replace(/\s+/g, " ").replace(/[›▾▴]/g, "").trim();
      if (!l || l.length < 4 || seen[l] || l === title || /^(열기|자세히|포트|시황|숫자로 자세히|선으로 보기|선 접기)$/.test(l)) return; seen[l] = 1; lines.push(l); });
    var withNum = lines.filter(function(l){ return /[\d%]/.test(l); }), rest = lines.filter(function(l){ return !/[\d%]/.test(l); });
    var L = withNum.slice(0, 4).concat(rest.slice(0, 2));
    // 짧은 조각(라벨·숫자)은 앞 줄에 붙여 한 문장처럼
    var out = []; L.forEach(function(l){ if (out.length && l.length <= 10) out[out.length - 1] += " · " + l; else out.push(l); });
    return {title: "👆 " + title + " — 요약", lines: out.slice(0, 5)};
  }
  function lpStart(ev){
    var c = ev.target.closest && ev.target.closest("#hmbody section.card"); if (!c || ev.button > 0) return;
    LP.el = c; LP.x = ev.clientX; LP.y = ev.clientY; LP.fired = 0; clearTimeout(LP.t);
    LP.t = setTimeout(function(){ if (!LP.el) return; LP.fired = Date.now(); try { navigator.vibrate && navigator.vibrate(12); } catch(x) {}
      var s = summary(LP.el); if (window.gdSay && s.lines.length) gdSay(s.title, s.lines, "", "img/kid_thumb.jpg?v=1"); LP.el = null; }, 550);
  }
  function lpCancel(ev){ if (!LP.el) return; if (ev && ev.type === "pointermove" && Math.abs(ev.clientX - LP.x) < 10 && Math.abs(ev.clientY - LP.y) < 10) return; clearTimeout(LP.t); LP.el = null; }
  document.addEventListener("pointerdown", lpStart, true);
  ["pointermove", "pointerup", "pointercancel", "scroll"].forEach(function(t){ document.addEventListener(t, lpCancel, true); });
  document.addEventListener("click", function(ev){ if (LP.fired && Date.now() - LP.fired < 800 && ev.target.closest && ev.target.closest("#hmbody")){ ev.stopImmediatePropagation(); ev.preventDefault(); LP.fired = 0; } }, true);
  document.addEventListener("contextmenu", function(ev){ if (ev.target.closest && ev.target.closest("#hmbody section.card")) ev.preventDefault(); }, true);

  /* ── 붙이기 ── */
  var busy = 0, H0 = null, stamp = 0;
  function apply(){
    var b = document.getElementById("hmbody"); if (!b || busy) return;
    timeline(); comic();
    if (H0) race(H0);
    if (document.getElementById("tdhero") && Date.now() - stamp < 120000) return;
    if (!b.querySelector("section.card")) return;
    busy = 1;
    load().then(function(a){
      busy = 0; stamp = Date.now(); H0 = a[0] || H0;
      var b2 = document.getElementById("hmbody"); if (!b2) return;
      var old = document.getElementById("tdhero"), d = document.createElement("div"); d.id = "tdhero"; d.className = "tz-hero"; d.setAttribute("role", "button");
      d.innerHTML = hero(a[0] || {}, a[1], a[2], a[3], a[4]);
      if (old) old.replaceWith(d); else b2.insertBefore(d, b2.firstChild);
      d.onclick = function(ev){ var bd = ev.target.closest && ev.target.closest(".tz-bdg span"); ev.stopPropagation();
        if (Date.now() - RWX < 700) return;   // 되감기 손을 뗀 직후의 눌림은 무시
        if (bd){ if (window.gdSay) gdSay("🏆 오늘의 배지", [bd.textContent, bd.dataset.why], "", "img/kid_gift.jpg?v=1"); return; }
        if (window.goTo) goTo("market", "live"); else if (window.go) go("market"); };
      countUp(d); try { rewind(d, a[1]); } catch(z) {} if (H0) race(H0);
    }, function(){ busy = 0; });
  }
  var tm = null;
  new MutationObserver(function(){ if (tm) return; tm = setTimeout(function(){ tm = null; if (window.cur === "home" || document.getElementById("hmbody")) apply(); }, 150); })
    .observe(document.documentElement, {childList: true, subtree: true});

  /* ── 모양 ── */
  var css = document.createElement("style");
  css.textContent =
    // ① 날씨판
    ".tz-hero{margin:4px 0 14px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".tz-sky{position:relative;overflow:hidden;border-radius:26px;padding:16px 18px 14px;color:#fff;box-shadow:0 10px 30px rgba(20,30,60,.18);isolation:isolate}" +
    ".tz-sky.sun{background:linear-gradient(155deg,#ffb347 0%,#ff7e5f 55%,#e8557a 100%)}" +
    ".tz-sky.part{background:linear-gradient(155deg,#56ccf2 0%,#2f80ed 100%)}" +
    ".tz-sky.cloud{background:linear-gradient(155deg,#94a3b8 0%,#5b6b80 100%)}" +
    ".tz-sky.rain{background:linear-gradient(160deg,#4b6cb7 0%,#1e2f5c 100%)}" +
    ".tz-sky.storm{background:linear-gradient(160deg,#3a3f5c 0%,#14172b 100%)}" +
    ".tz-bg{position:absolute;left:0;right:0;bottom:0;width:100%;height:42%;z-index:-1;opacity:.45}" +
    ".tz-bgl{stroke-dasharray:1200;stroke-dashoffset:1200;animation:tdDraw 1.6s ease-out .2s forwards}@keyframes tdDraw{to{stroke-dashoffset:0}}" +
    ".tz-rain{position:absolute;inset:-40px 0 0;z-index:-1;background:repeating-linear-gradient(105deg,rgba(255,255,255,.0) 0 14px,rgba(255,255,255,.16) 14px 15px);animation:tdRain .7s linear infinite;opacity:.8}" +
    "@keyframes tdRain{from{transform:translateY(-20px)}to{transform:translateY(20px)}}" +
    ".tz-sky.storm:after{content:'';position:absolute;inset:0;z-index:-1;background:#fff;opacity:0;animation:tdFlash 6s infinite}@keyframes tdFlash{0%,92%,100%{opacity:0}93%{opacity:.35}94%{opacity:0}95%{opacity:.2}}" +
    ".tz-sun{position:absolute;right:-60px;top:-60px;width:200px;height:200px;z-index:-1;border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.22) 0 8deg,transparent 8deg 22deg);animation:tdSpin 30s linear infinite}@keyframes tdSpin{to{transform:rotate(360deg)}}" +
    ".tz-top{display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:.95}.tz-wx b{font-weight:800}.tz-sl{background:rgba(255,255,255,.18);padding:3px 10px;border-radius:999px;font-weight:700}" +
    ".tz-main{display:flex;align-items:center;gap:14px;margin-top:10px}" +
    ".tz-kid{flex:none;width:86px;height:110px;border-radius:20px;background:#f3e6d6 center top/cover no-repeat;box-shadow:0 6px 18px rgba(0,0,0,.25);position:relative;animation:tdHop 2.6s ease-in-out infinite}" +
    ".tz-kid i{position:absolute;right:-10px;top:-12px;font-size:30px;font-style:normal;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}" +
    "@keyframes tdHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}" +
    ".tz-num{min-width:0}.tz-num small{display:block;font-size:13px;opacity:.9;font-weight:700}" +
    ".tz-num b{display:block;font-size:52px;line-height:1.05;font-weight:900;letter-spacing:-2px;font-variant-numeric:tabular-nums;color:#fff!important;text-shadow:0 3px 14px rgba(0,0,0,.25)}" +
    ".tz-num em{display:block;font-style:normal;font-size:12.5px;opacity:.85;margin-top:2px}" +
    ".tz-rank{margin-top:10px;font-size:13px;background:rgba(0,0,0,.18);border-radius:12px;padding:7px 11px;display:inline-block}.tz-rank b{font-weight:900}" +
    ".tz-say{margin-top:10px;background:rgba(255,255,255,.95);color:#1d2433;border-radius:16px 16px 16px 4px;padding:10px 13px;font-size:15px;line-height:1.45;box-shadow:0 4px 14px rgba(0,0,0,.12)}.tz-say b{font-weight:800}.tz-say small{display:block;color:#5d667a;font-size:12.5px;margin-top:3px}" +
    ".tz-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.tz-mini div{background:rgba(255,255,255,.14);border-radius:14px;padding:8px 10px;min-width:0}" +
    ".tz-mini small{display:block;font-size:12.5px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tz-mini b{display:block;font-size:20px;font-weight:900;color:#fff!important;font-variant-numeric:tabular-nums;letter-spacing:-.5px}.tz-mini em{font-style:normal;font-size:12.5px;opacity:.8}" +
    ".tz-bdg{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.tz-bdg span{background:rgba(255,255,255,.95);color:#1d2433;border-radius:999px;padding:5px 11px;font-size:12.5px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.12);animation:tdPop .5s cubic-bezier(.2,1.6,.4,1) both}" +
    ".tz-bdg span:nth-child(2){animation-delay:.12s}.tz-bdg span:nth-child(3){animation-delay:.24s}@keyframes tdPop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}" +
    ".tz-hint{margin-top:9px;font-size:12.5px;opacity:.75;text-align:right}" +
    ".tz-sky.tz-rwok{touch-action:pan-y;-webkit-user-select:none;user-select:none}" +
    ".tz-rwc{position:absolute;top:0;bottom:0;width:0;border-left:1.5px dashed rgba(255,255,255,.85);z-index:2;pointer-events:none;display:none}.tz-rwd{position:absolute;left:-6px;width:11px;height:11px;margin-top:-5px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.35)}" +
    ".tz-rwt{position:absolute;top:8px;left:10px;right:10px;z-index:3;pointer-events:none;display:none;flex-wrap:wrap;gap:2px 10px;background:rgba(10,14,30,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:10px;padding:6px 9px;font-size:11.5px;line-height:1.35}.tz-rwt b{font-weight:800}" +
    ".tz-rwon .tz-rwc{display:block}.tz-rwon .tz-rwt{display:flex}.tz-rwon .tz-bg{opacity:.85}" +
    // ④ 세 컷
    ".tz-ch b{display:block;font-size:16px;font-weight:800}.tz-ch small{color:var(--sub);font-size:12.5px}" +
    ".tz-now{margin:8px 0 4px;padding:9px 11px;border-radius:12px;background:rgba(255,80,80,.10);border:1px solid rgba(255,80,80,.35);font-size:14px;font-weight:700;line-height:1.45}.tz-now b{font-size:16px}.tz-now small{display:block;font-weight:500;opacity:.75;font-size:12.5px;margin-top:2px}" +
    ".tz-comic{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 6px}" +
    ".tz-pan{border:2px solid var(--text);border-radius:14px;overflow:hidden;background:var(--panel2);display:flex;flex-direction:column;animation:tdPop .45s both}.tz-pan:nth-child(2){animation-delay:.15s}.tz-pan:nth-child(3){animation-delay:.3s}" +
    ".tz-pk{height:92px;background:#f3e6d6 center 12%/cover no-repeat;border-bottom:2px solid var(--text)}" +
    ".tz-pt{padding:7px 8px 9px;min-width:0}.tz-pt small{display:block;font-size:12.5px;color:var(--sub);line-height:1.3}.tz-pt b{display:block;font-size:clamp(15px,4.6vw,19px);font-weight:900;letter-spacing:-.6px;margin:2px 0;white-space:nowrap}.tz-pt em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);line-height:1.3}" +
    ".tz-raw summary{font-size:12.5px;color:var(--sub);text-decoration:underline;cursor:pointer;list-style:none;margin-top:4px}.tz-raw summary::-webkit-details-marker{display:none}" +
    // ⑤ 경주
    ".tz-race{margin:10px 0 4px;padding:10px 12px;border-radius:16px;background:var(--panel2)}" +
    ".tz-rh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px;margin-bottom:6px}.tz-rh b{font-weight:800}.tz-rh span{font-weight:800}" +
    ".tz-ln{display:grid;grid-template-columns:62px 1fr 64px;align-items:center;gap:8px;margin:7px 0}.tz-lb{font-size:12.5px;color:var(--sub);white-space:nowrap}.tz-ln>b{text-align:right;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums}" +
    ".tz-tk{position:relative;height:14px;border-radius:999px;background:repeating-linear-gradient(90deg,var(--line) 0 6px,transparent 6px 12px);}" +
    ".tz-z{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--sub);opacity:.6;border-radius:2px}" +
    ".tz-rn{position:absolute;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px var(--panel2),0 2px 6px rgba(0,0,0,.25);transition:left 1.1s cubic-bezier(.2,.9,.25,1);font-style:normal;font-size:12.5px;line-height:18px;text-align:center}" +
    ".tz-rn:empty{font-size:0}.tz-rn:not(:empty){width:22px;height:22px;margin:-11px 0 0 -11px;line-height:22px;background:#fff;box-shadow:0 0 0 3px var(--c),0 2px 6px rgba(0,0,0,.25)}" +
    ".tz-dw{margin-top:8px}.tz-dw small{font-size:12.5px;color:var(--sub)}.tz-dw small b{color:var(--text)}.tz-dw div{display:flex;gap:3px;margin-top:4px}.tz-dw i{flex:1;height:10px;border-radius:3px;background:#3987e5;opacity:.75}.tz-dw i.w{background:#e66767;opacity:1}" +
    ".tz-tg{margin-top:6px;border:0;background:none;color:var(--sub);font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;padding:2px 0}.hm-sp.tzx-hide{display:none}" +
    // ⑥ 타임라인
    ".hm-chg.tz-tl .hm-chi{position:relative;padding-left:4px;border-top:0!important}" +
    ".hm-chg.tz-tl .hm-chi>span:first-child{position:relative;z-index:1;width:34px;height:34px;flex:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--panel2);box-shadow:0 0 0 2px var(--line)}" +
    ".hm-chg.tz-tl .hm-chi:not(:last-child)>span:first-child:after{content:'';position:absolute;left:50%;top:36px;width:2px;height:40px;margin-left:-1px;background:var(--line);z-index:-1}" +
    ".hm-chg.tz-tl .hm-chi:first-of-type>span:first-child{box-shadow:0 0 0 2px #3987e5;animation:tdPulse 2s ease-out 2}@keyframes tdPulse{0%{box-shadow:0 0 0 2px #3987e5,0 0 0 0 rgba(57,135,229,.5)}100%{box-shadow:0 0 0 2px #3987e5,0 0 0 12px rgba(57,135,229,0)}}" +
    ".hm-chg.tz-tl .hm-cb s,.hm-chg.tz-tl .hm-chi s{opacity:.55}" +
    ".hm-chg.tz-tl .hm-chi b:last-of-type{animation:tdIn .8s ease-out .3s both}@keyframes tdIn{from{filter:grayscale(1);opacity:.4;transform:translateX(-6px)}to{filter:none;opacity:1;transform:none}}" +
    // ⑩ 색 규칙 — 바로가기는 회색 밑줄 (파랑은 내림에만)
    "#hmbody .hm-nw,#hmbody .pnh-go,#hmbody a[data-goto]:not(.hm-chip),#hmbody .hm-go,#hmbody .pl a{color:var(--sub)!important;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;font-weight:600}" +
    "#hmbody .hm-nw b{color:var(--text)!important}" +
    "@media (max-width:360px){.tz-num b{font-size:42px}.tz-kid{width:72px;height:94px}.tz-pk{height:76px}.tz-pt b{font-size:16px}}" +
    "@media (prefers-reduced-motion:reduce){.tz-kid,.tz-rain,.tz-sun,.tz-sky.storm:after,.tz-bgl,.tz-bdg span,.tz-pan{animation:none!important}.tz-bgl{stroke-dashoffset:0}.tz-rn{transition:none}}";
  document.head.appendChild(css);
})();
;
