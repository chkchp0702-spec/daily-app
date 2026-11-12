/* 🧭 11/12 계절 시계 — 사용자 「5개 국가 각각의 지수들을 백테스트 해서 현금 비중을 늘려야 할 때·주식 비중을 늘려야 할 때를 시계나 보기 쉬운 그림으로」
   market-strategy-report/market/season.json (src/season_bt.py · 평일 07:20·16:50) → 🏠 오늘 홈, 🫧 버블 경보판 아래 카드
   시계 = 12달(1월이 1시 · 12월이 12시) · 칸 색 = 그 달 평균 수익 · 바늘 = 오늘 · 가운데 = 지금 추세 계절 · 바깥 띠 = 채택 방식이 주식을 드는 달 */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/season.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return String(v).replace("-", "−"); }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"}, CN = {kr: "한국", jp: "일본", cn: "중국", hk: "홍콩", us: "미국"};
  var SN = {spring: ["🌱", "봄", "바닥에서 올라오는 중"], summer: ["☀️", "여름", "오르는 추세"], hot: ["🔥", "늦여름", "과열"], autumn: ["🍂", "가을", "꺾이는 중"], winter: ["❄️", "겨울", "내리는 추세"], base: ["🌤", "늦겨울", "바닥 다지는 중"]};
  var SHORT = {hold: "그냥 들고 있기", hal0: "11~4월만 주식", hal: "5~10월엔 절반만", halma: "11~4월 주식 · 여름엔 추세 좋을 때 절반", halma2: "11~4월 주식 · 여름엔 추세 좋을 때만",
               deep: "10개월선 위면 주식 · 많이 싸면 절반", floor: "하락장엔 현금 → 바닥 신호마다 담기", ma10: "10개월선 위면 주식", ma10h: "10개월선 아래면 절반", step2: "신호 2개 계단", step3: "신호 3개 계단",
               mom12: "1년 전보다 높으면 주식", ddl: "−10% 절반 · −20% 현금", season: "계절표", bear: "하락장이면 현금", halbear: "11~4월 + 하락장 아님", halbear2: "달력·하락장 둘 다 보기"};
  function pt(r, deg){ var a = (deg - 90) * Math.PI / 180; return [(60 + r * Math.cos(a)).toFixed(1), (60 + r * Math.sin(a)).toFixed(1)]; }
  function wedge(r0, r1, a0, a1){ var p = pt(r1, a0), q = pt(r1, a1), s = pt(r0, a1), t = pt(r0, a0); return "M" + p + "A" + r1 + " " + r1 + " 0 0 1 " + q + "L" + s + "A" + r0 + " " + r0 + " 0 0 0 " + t + "Z"; }
  function mcls(v){ return v >= 1.5 ? "g2" : v >= 0.3 ? "g1" : v > -0.3 ? "z" : v > -1 ? "r1" : "r2"; }
  // 채택 방식이 그 달에 주식을 드나 (달력 방식만 고정 · 나머지는 null)
  function calW(k, m){ var win = m >= 11 || m <= 4; if (k === "hold") return 1; if (k === "hal0") return win ? 1 : 0; if (k === "hal") return win ? 1 : 0.5; if (k === "halma" || k === "halma2") return win ? 1 : 0.4; return null; }
  function dial(m, now){
    var g = "", k;
    for (k = 1; k <= 12; k++){
      var c = m.cal[k - 1], a0 = k * 30 - 15 + 1, a1 = k * 30 + 15 - 1, lp = pt(34, k * 30), w = calW(m.best.k, k);
      g += '<path class="sc-m ' + mcls(c.avg) + '" d="' + wedge(22, 46, a0, a1) + '"/>' + '<text class="sc-ml" x="' + lp[0] + '" y="' + (+lp[1] + 3) + '">' + k + '</text>';
      if (w != null) g += '<path class="sc-o ' + (w >= 1 ? "on" : w > 0 ? "half" : "off") + '" d="' + wedge(49, 53, a0, a1) + '"/>';
    }
    var days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), ang = (now.getMonth() + 1) * 30 - 15 + 30 * (now.getDate() - 0.5) / days, np = pt(47, ang), nb = pt(20, ang);
    var s = SN[m.now.st] || ["", "", ""];
    return '<svg class="sc-svg" viewBox="0 0 120 120" role="img" aria-label="' + e(m.name) + ' 달력 시계 — 지금 ' + (now.getMonth() + 1) + '월 · ' + e(s[1]) + '">' + g +
      '<line class="sc-nd" x1="' + nb[0] + '" y1="' + nb[1] + '" x2="' + np[0] + '" y2="' + np[1] + '"/><circle class="sc-nd" cx="' + np[0] + '" cy="' + np[1] + '" r="2.6"/>' +
      '<text class="sc-ce" x="60" y="59">' + s[0] + '</text><text class="sc-cn" x="60" y="71">' + e(s[1]) + '</text></svg>';
  }
  function row(m, now){
    var b = m.best, M = m.meta && m.meta.all, mo = now.getMonth() + 1, c = m.cal[mo - 1], s = SN[m.now.st] || ["", "", ""];
    var st = (m.states || []).filter(function(x){ return x.st === m.now.st; })[0] || {};
    var hold = b.k === "hold", w = b.w_now;
    var by = {}; (m.methods || []).forEach(function(x){ by[x.k] = x; });
    var bear = by.bear, mix = by.halbear2, clash = !hold && /^hal/.test(b.k) && bear && bear.w_now !== w && mix;
    var tb = (m.methods || []).map(function(x){ return '<tr class="' + (x.k === b.k ? "pk" : "") + '"><td>' + (x.both ? "✅ " : "") + e(SHORT[x.k] || x.name) + '</td><td>' + x.cagr + '%</td><td>' + mn(x.mdd) + '%</td><td>' + x.w_now + '%</td></tr>'; }).join("");
    return '<details class="sc-r"><summary><span class="sc-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>' + s[0] + ' ' + e(s[1]) + ' · ' + e(SHORT[b.k] || b.name) + '</small></span>' +
      '<span class="sc-w w' + (w >= 100 ? 2 : w > 0 ? 1 : 0) + '"><b>주식 ' + w + '%</b>' + (clash ? '<i>🐻와 엇갈림</i>' : '') + '</span></summary>' +
      '<div class="sc-x"><div class="sc-d">' + dial(m, now) + '<ul class="sc-f">' +
        '<li><small>' + mo + '월에 오른 해</small><b>' + c.up + '%</b><em>평균 ' + (c.avg > 0 ? "+" : "") + mn(c.avg) + '%</em></li>' +
        '<li><small>지금 ' + e(s[1]) + '일 때 3개월 뒤 올라 있던 비율</small><b>' + (st.up60 != null ? st.up60 + "%" : "–") + '</b><em>평균 ' + (st.avg60 > 0 ? "+" : "") + mn(st.avg60) + '%</em></li>' +
        '<li><small>11~4월 합 / 5~10월 합</small><b>' + (m.halves.winter > 0 ? "+" : "") + mn(m.halves.winter) + '% / ' + (m.halves.summer > 0 ? "+" : "") + mn(m.halves.summer) + '%</b></li></ul></div>' +
      '<p class="sc-v">' + (hold ? '<b>그냥 들고 있기가 최선</b> — 방식 ' + (m.methods || []).length + '개 중 앞 절반·뒤 절반 둘 다 이긴 게 없어요. 연 ' + b.cagr + '% · 가장 크게 잃은 폭 ' + mn(b.mdd) + '%'
        : '<b>' + e(b.name) + '</b> — 연 ' + b.cagr + '% (그냥 들고 있기 ' + M.hold_cagr + '%) · 가장 크게 잃은 폭 ' + mn(b.mdd) + '% (' + mn(M.hold_mdd) + '%) · 1년에 ' + b.sw_y + '번 바꿈') + '</p>' +
      (clash ? '<p class="sc-c">🐻 하락장 계기판은 지금 현금이라 엇갈려요. 둘을 겹쳐 「하나만 좋으면 절반」으로 가면 지금 <b>주식 ' + mix.w_now + '%</b> — 과거 연 ' + mix.cagr + '% · 가장 크게 잃은 폭 ' + mn(mix.mdd) + '%</p>' : '') +
      '<details class="sc-t"><summary>방식 ' + (m.methods || []).length + '개 성적 보기 (' + e(String(M.from).slice(0, 4)) + '~)</summary><table><tr><th>방식</th><th>연수익</th><th>최대 낙폭</th><th>지금 주식</th></tr>' + tb + '</table><small>✅ = 앞 절반·뒤 절반 둘 다 그냥 들고 있기를 이김 · 현금 연 2% · 바꿀 때 0.1%</small></details></div></details>';
  }
  window.__seasonCard = function(S){
    if (!S || !S.markets) return "";
    var ms = S.markets.filter(function(m){ return m.best && m.cal; }); if (!ms.length) return "";
    var now = new Date(), mo = now.getMonth() + 1, win = mo >= 11 || mo <= 4;
    var hal = ms.filter(function(m){ return /^hal/.test(m.best.k); }), hold = ms.filter(function(m){ return m.best.k === "hold"; });
    var cs = function(a){ var o = []; a.forEach(function(m){ if (o.indexOf(CN[m.nat]) < 0) o.push(CN[m.nat]); }); return o.join("·"); };
    var lead = hal.length ? "지금 " + mo + "월 — " + cs(hal) + "은 " + (win ? "주식을 드는 철(11~4월)" : "쉬는 철(5~10월)") + (hold.length ? " · " + cs(hold) + "은 철을 안 가림" : "") : "";
    var out = "", last = "";
    ms.forEach(function(m){ if (m.nat !== last){ out += '<div class="sc-g">' + FL[m.nat] + ' ' + CN[m.nat] + '</div>'; last = m.nat; } out += row(m, now); });
    return '<section class="card sc" id="season" data-cz="done"><div class="sc-h">🧭 계절 시계 <small>' + e(String(S.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="sc-lead">' + e(lead) + '</p>' +
      '<p class="sc-sum">지수 ' + ms.length + '개를 방식 ' + ((ms[0].methods || []).length) + '개로 다시 돌려 보니, <b>' + hal.length + '개 지수</b>에서 「11~4월엔 주식 · 5~10월엔 현금」 달력이 통했어요. ' + (hold.length ? cs(hold) + '은 어떤 방식도 그냥 들고 있기를 꾸준히 못 이겼어요.' : '') + '</p>' + out +
      '<div class="sc-lg"><span><i class="g2"></i>많이 오른 달</span><span><i class="g1"></i>오른 달</span><span><i class="z"></i>제자리</span><span><i class="r1"></i>내린 달</span><span><i class="r2"></i>많이 내린 달</span><span><i class="o"></i>바깥 띠 = 주식 드는 달</span></div>' +
      '<p class="sc-note">읽는 법: 시계 숫자는 달(1~12월) · 칸 색은 그 달 평균 · 바늘은 오늘 · 가운데는 지금 추세(200일선·50일선). 과거 통계로 확률을 높이려는 것이지 맞히는 게 아니에요. 방식을 여러 개 돌려 고른 결과라 우연이 섞였을 수 있고, 달력은 미국·일본에선 안 통했어요. 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".sc-h{font-size:17px;font-weight:900}.sc-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.sc-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.sc-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.sc-sum b{color:var(--text,inherit)}" +
    ".sc-g{margin:12px 0 2px;font-size:12.5px;font-weight:800;color:var(--sub)}.sc-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.sc-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}.sc-r>summary::-webkit-details-marker{display:none}" +
    ".sc-n{min-width:0}.sc-n b{font-size:14.5px;font-weight:900}.sc-n small{display:block;font-size:12px;color:var(--sub);font-weight:700;margin-top:1px;word-break:keep-all}.sc-w{flex:0 0 auto;text-align:right}.sc-w b{display:inline-block;font-size:13.5px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap}.sc-w.w2 b{background:rgba(48,164,108,.16);color:#1f8a57}.sc-w.w1 b{background:rgba(240,160,60,.2);color:#b86a00}.sc-w.w0 b{background:rgba(229,72,77,.15);color:#d13438}.sc-w i{display:block;font-style:normal;font-size:10.5px;color:var(--sub);font-weight:700;margin-top:2px}" +
    ".sc-x{margin-top:10px}.sc-d{display:flex;gap:10px;align-items:center}.sc-svg{width:132px;height:132px;flex:0 0 auto}.sc-m.g2{fill:#30a46c}.sc-m.g1{fill:#9bd8b7}.sc-m.z{fill:rgba(127,127,127,.28)}.sc-m.r1{fill:#f3b0a4}.sc-m.r2{fill:#e5484d}" +
    ".sc-ml{font-size:8px;font-weight:800;text-anchor:middle;fill:#1b1f24}.sc-o.on{fill:#1f8a57}.sc-o.half{fill:#e0a030}.sc-o.off{fill:rgba(127,127,127,.25)}.sc-nd{stroke:var(--text,#111);stroke-width:2.4;stroke-linecap:round;fill:var(--text,#111)}.sc-ce{font-size:15px;text-anchor:middle}.sc-cn{font-size:8.5px;font-weight:800;text-anchor:middle;fill:var(--text,#111)}" +
    ".sc-f{list-style:none;margin:0;padding:0;flex:1;min-width:0}.sc-f li{padding:4px 0}.sc-f li+li{border-top:1px solid rgba(127,127,127,.18)}.sc-f small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;line-height:1.3;word-break:keep-all}.sc-f b{font-size:15px;font-weight:900}.sc-f em{font-style:normal;font-size:11.5px;color:var(--sub);margin-left:5px}" +
    ".sc-v,.sc-c{margin:8px 0 0;font-size:13px;line-height:1.55;word-break:keep-all}.sc-c{padding:8px 10px;border-radius:10px;background:rgba(240,160,60,.13)}" +
    ".sc-t{margin-top:8px}.sc-t>summary{cursor:pointer;font-size:12.5px;font-weight:800;color:var(--accent,#3182f6)}.sc-t table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11.5px}.sc-t th,.sc-t td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.sc-t th:first-child,.sc-t td:first-child{text-align:left;white-space:normal;word-break:keep-all}.sc-t tr.pk td{font-weight:900}.sc-t small{display:block;margin-top:4px;font-size:11px;color:var(--sub);line-height:1.4}" +
    ".sc-lg{display:flex;flex-wrap:wrap;gap:4px 10px;margin:12px 0 0;font-size:11px;color:var(--sub);font-weight:700}.sc-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}.sc-lg .g2{background:#30a46c}.sc-lg .g1{background:#9bd8b7}.sc-lg .z{background:rgba(127,127,127,.28)}.sc-lg .r1{background:#f3b0a4}.sc-lg .r2{background:#e5484d}.sc-lg .o{background:#1f8a57;height:4px;vertical-align:2px}" +
    ".sc-note{margin:8px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}";
  document.head.appendChild(css);
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__seasonData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
