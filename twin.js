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
