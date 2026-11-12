/* 🧭 11/12 계절 시계 — 사용자 「5개 국가 각각의 지수들을 백테스트 해서 현금 비중을 늘려야 할 때·주식 비중을 늘려야 할 때를 시계나 보기 쉬운 그림으로」
   market-strategy-report/market/season.json (src/season_bt.py · 평일 07:20·16:50) → 🏠 오늘 홈, 🫧 버블 경보판 아래 카드
   시계 = 주가 흐름 계절 6칸(달력 아님 — 11/12 사용자 「실제 달력 부분은 빼자」) · 칸 색 = 3개월 뒤 올라 있던 비율 · 바늘 = 지금 계절
   🧭 11/12 A11/12-1 계절 띠(사용자 「1번 진행」): 지수 9줄 글자 목록 → 지수마다 지난 2년 주별 계절 색 띠 한 줄(season.json trail · 만드는 쪽 변경 없음)
      띠를 누르면 그 주 계절·몇 주째 풍선 · 이름·오른쪽 글자를 누르면 지금처럼 시계·성적 펼침
      「그냥 들기」 글자 → 「계절은 참고만」·「🏁 시장별 방식」(한국·미국은 🏁 시장별 방식을 따름 — 같은 화면 한 목소리) */
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
  // 🧭 11/12 사용자 「실제 달력 부분은 빼자」 → 시계 = 주가 흐름 계절 6칸(달력 아님) · 칸 색 = 그 계절에서 3개월 뒤 올라 있던 비율 · 바늘 = 지금 계절
  var ORD = ["spring", "summer", "hot", "autumn", "winter", "base"];
  function ucls(v){ return v == null ? "z" : v >= 65 ? "g2" : v >= 57 ? "g1" : v >= 50 ? "z" : v >= 45 ? "r1" : "r2"; }
  function dial(m){
    var by = {}; (m.states || []).forEach(function(x){ by[x.st] = x; });
    var g = "", cur = ORD.indexOf(m.now.st);
    ORD.forEach(function(k, i){
      var a0 = i * 60 + 1.5, a1 = i * 60 + 58.5, x = by[k] || {}, ep = pt(37, i * 60 + 30);
      g += '<path class="sc-m ' + ucls(x.up60) + (i === cur ? " cur" : "") + '" d="' + wedge(20, 52, a0, a1) + '"/><text class="sc-me" x="' + ep[0] + '" y="' + (+ep[1] - 1) + '">' + SN[k][0] + '</text><text class="sc-ml" x="' + ep[0] + '" y="' + (+ep[1] + 9) + '">' + (x.up60 != null ? x.up60 + "%" : "–") + '</text>';
    });
    var ang = cur * 60 + Math.min(54, 6 + (m.now.days || 0) * 1.2), np = pt(52, ang), nb = pt(6, ang);
    var s = SN[m.now.st] || ["", "", ""];
    return '<svg class="sc-svg" viewBox="0 0 120 120" role="img" aria-label="' + e(m.name) + ' 흐름 시계 — 지금 ' + e(s[1]) + '">' + g +
      (cur >= 0 ? '<line class="sc-nd" x1="' + nb[0] + '" y1="' + nb[1] + '" x2="' + np[0] + '" y2="' + np[1] + '"/><circle class="sc-nd" cx="60" cy="60" r="3.2"/>' : '') + '</svg>';
  }
  // 🧭 A11/12-1 계절 띠 — trail = [[주 날짜, 계절 번호(ORD 순)], …] 지난 104주
  var BM = {kospi: "흔들리면 전부 현금", kosdaq: "버블 시계 6시면 전부 현금", sp500: "흔들리면 절반만 채권", nasdaq: "그냥 들고 있기"};   // 🏁 시장별 방식(home2.js METH 와 같은 이름)
  var SC = {spring: "#8ccf6a", summer: "#f0c64a", hot: "#f08a3c", autumn: "#a8744a", winter: "#3f78d1", base: "#9ccbee"};
  function runs(t){ var R = []; (t || []).forEach(function(x, i){ var k = ORD[x[1]]; if (R.length && R[R.length - 1].k === k) R[R.length - 1].n++; else R.push({k: k, d: x[0], i: i, n: 1}); }); return R; }
  function band(m){
    var t = m.trail || [], N = t.length; if (!N) return '<span class="sc-band"></span>';
    var g = runs(t).map(function(r){ var a = (r.i / N * 100).toFixed(2), b = ((r.i + r.n) / N * 100).toFixed(2); return SC[r.k] + " " + a + "% " + b + "%"; }).join(",");
    return '<span class="sc-band" data-scb="' + e(m.key) + '" role="img" aria-label="' + e(m.name) + ' 지난 2년 계절 띠" style="background:linear-gradient(90deg,' + g + ')"><i></i></span>';
  }
  function md2(d){ var x = String(d).split("-"); return (+x[1]) + "/" + (+x[2]); }
  function axis(ms){
    var t = (ms[0] && ms[0].trail) || [], N = t.length, h = "";
    t.forEach(function(x, i){ var mo = x[0].slice(5, 7), pm = i ? t[i - 1][0].slice(5, 7) : ""; if (i && mo !== pm && (mo === "01" || mo === "07") && i / N < 0.78) h += '<i style="left:' + (i / N * 100).toFixed(1) + '%">' + (mo === "01" ? "’" + x[0].slice(2, 4) : "7월") + '</i>'; });
    return '<div class="sc-ax"><span></span><span class="sc-axb">' + h + '<i class="r">지금</i></span><span></span></div>';
  }
  function tip(el, ev){
    var S = window.__seasonData, k = el.dataset.scb, m = S && (S.markets || []).filter(function(x){ return x.key === k; })[0]; if (!m) return;
    var t = m.trail || [], N = t.length, rc = el.getBoundingClientRect(), f = Math.max(0, Math.min(0.999, (ev.clientX - rc.left) / rc.width)), i = Math.floor(f * N);
    var R = runs(t), j = 0; R.forEach(function(r, q){ if (i >= r.i && i < r.i + r.n) j = q; });
    var r = R[j], p = R[j - 1], nx = R[j + 1], s = SN[r.k];
    var txt = '<b>' + e(m.name) + ' · ' + s[0] + ' ' + s[1] + '</b> ' + md2(r.d) + ' 주부터 ' + (nx ? r.n + '주 → 다음 ' + SN[nx.k][0] + ' ' + SN[nx.k][1] : '지금까지 ' + r.n + '주째') + (p ? ' <small>(그 전 ' + SN[p.k][0] + ' ' + SN[p.k][1] + ' ' + p.n + '주)</small>' : '');
    var card = el.closest(".sc"), tp = card && card.querySelector(".sc-tip"); if (!tp) return;
    tp.innerHTML = txt; tp.hidden = false;
    var row = el.closest(".sc-r"); row.parentNode.insertBefore(tp, row.nextSibling);
    clearTimeout(tp._t); tp._t = setTimeout(function(){ tp.hidden = true; }, 6000);
  }
  document.addEventListener("click", function(ev){
    var el = ev.target.closest && ev.target.closest(".sc-band[data-scb]"); if (el){ ev.preventDefault(); ev.stopPropagation(); tip(el, ev); return; }
    var a = ev.target.closest && ev.target.closest("[data-scbm]"); if (a){ ev.preventDefault(); var b = document.querySelector("#h2bear .bm") || document.getElementById("h2bear"); if (b) b.scrollIntoView({behavior: "smooth", block: "start"}); }
  }, true);
  function row(m){
    var b = m.best, M = m.meta && m.meta.all, s = SN[m.now.st] || ["", "", ""];
    var st = (m.states || []).filter(function(x){ return x.st === m.now.st; })[0] || {};
    var hold = b.k === "hold", w = b.w_now;
    var tb = (m.methods || []).map(function(x){ return '<tr class="' + (x.k === b.k ? "pk" : "") + '"><td>' + (x.both ? "✅ " : "") + e(SHORT[x.k] || x.name) + '</td><td>' + x.cagr + '%</td><td>' + mn(x.mdd) + '%</td><td>' + x.w_now + '%</td></tr>'; }).join("");
    var bm = BM[m.key];
    return '<details class="sc-r"><summary class="sc-bs"><span class="sc-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small class="sc-w w' + (hold ? "h" : w >= 100 ? 2 : w > 0 ? 1 : 0) + '">' + (hold ? (bm ? "🏁 시장별 방식" : "계절은 참고만") : "주식 " + w + "%") + '</small></span>' +
      band(m) + '<span class="sc-st"><b>' + s[0] + ' ' + e(s[1]) + '</b><small>' + m.now.days + '일째</small></span></summary>' +
      '<div class="sc-x"><div class="sc-d">' + dial(m) + '<ul class="sc-f">' +
        '<li><small>지금 ' + e(s[1]) + '일 때 3개월 뒤 올라 있던 비율</small><b>' + (st.up60 != null ? st.up60 + "%" : "–") + '</b><em>평균 ' + (st.avg60 > 0 ? "+" : "") + mn(st.avg60) + '%</em></li>' +
        '<li><small>200일선보다 · 1년 고점보다</small><b>' + (m.now.g200 > 0 ? "+" : "") + mn(m.now.g200) + '% · ' + mn(m.now.dd) + '%</b></li>' +
        '<li><small>이 계절이었던 날</small><b>전체의 ' + (st.share != null ? st.share : "–") + '%</b></li></ul></div>' +
      '<p class="sc-v">' + (hold ? '<b>이 시계로는 못 이김</b> — 주가 흐름 방식 ' + ((m.methods || []).length - 1) + '개 중 앞 절반·뒤 절반 둘 다 그냥 들고 있기(연 ' + b.cagr + '% · 가장 크게 잃은 폭 ' + mn(b.mdd) + '%)를 이긴 게 없어요.' + (bm ? ' <a class="sc-bm" href="#h2bear" data-scbm="1">→ ' + e(m.name) + ' 판단은 🏁 시장별 방식 「' + e(bm) + '」을 따라요 ›</a>' : ' 계절은 참고로만 보세요.')
        : '<b>' + e(b.name) + '</b> — 연 ' + b.cagr + '% (그냥 들고 있기 ' + M.hold_cagr + '%) · 가장 크게 잃은 폭 ' + mn(b.mdd) + '% (' + mn(M.hold_mdd) + '%) · 1년에 ' + b.sw_y + '번 바꿈 · 지금 <b>주식 ' + w + '%</b>') + '</p>' +
      '<details class="sc-t"><summary>방식 ' + (m.methods || []).length + '개 성적 보기 (' + e(String(M.from).slice(0, 4)) + '~)</summary><table><tr><th>방식</th><th>연수익</th><th>최대 낙폭</th><th>지금 주식</th></tr>' + tb + '</table><small>✅ = 앞 절반·뒤 절반 둘 다 그냥 들고 있기를 이김 · 현금 연 2% · 바꿀 때 0.1%</small></details></div></details>';
  }
  window.__seasonCard = function(S){
    if (!S || !S.markets) return "";
    var ms = S.markets.filter(function(m){ return m.best && m.states; }); if (!ms.length) return "";
    var cnt = {}; ms.forEach(function(m){ cnt[m.now.st] = (cnt[m.now.st] || 0) + 1; });
    var lead = ORD.filter(function(k){ return cnt[k]; }).map(function(k){ return SN[k][0] + " " + SN[k][1] + " " + cnt[k] + "곳"; }).join(" · ");
    var hold = ms.filter(function(m){ return m.best.k === "hold"; }), win = ms.filter(function(m){ return m.best.k !== "hold"; });
    var out = axis(ms) + ms.map(row).join("") + '<div class="sc-tip" hidden></div>';
    var rec = ms.filter(function(m){ return m.now.days <= 10; }).sort(function(a, b){ return a.now.days - b.now.days; }).map(function(m){ return FL[m.nat] + " " + m.name + " " + SN[m.now.st][0] + " " + SN[m.now.st][1] + " " + m.now.days + "일째"; });
    return '<section class="card sc" id="season" data-cz="done"><div class="sc-h">🧭 계절 시계 <small>' + e(String(S.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="sc-lead">지수 ' + ms.length + '개 지금 — ' + e(lead) + '</p>' + out + (rec.length ? '<p class="sc-rec">🔄 최근 계절이 바뀐 곳 — ' + e(rec.join(" · ")) + '</p>' : '') +
      '<p class="sc-sum">여기서 계절은 달력이 아니라 <b>주가 흐름에 붙인 이름</b>이에요(200일선·50일선 위냐 아래냐). 흐름만 보고 주식·현금을 오가는 방식 ' + ((ms[0].methods || []).length - 1) + '개를 다시 돌려 보니, ' + (win.length ? '<b>' + win.map(function(m){ return m.name; }).join("·") + '</b>에서만 꾸준히 통했고 ' : '') + '나머지 ' + hold.length + '개는 그냥 들고 있기를 못 이겼어요 — 그래서 한국·미국은 🏁 시장별 방식을 따르고, 계절은 <b>흐름이 어디쯤인지</b> 보는 데 써요.</p>' +
      '<div class="sc-lg"><span>띠 = 지난 2년, 주마다 그 주의 계절 · 띠를 누르면 몇 주째인지</span>' + ORD.map(function(k){ return '<span><i style="background:' + SC[k] + '"></i>' + SN[k][1] + '</span>'; }).join("") + '</div>' +
      '<div class="sc-lg"><span>이름을 누르면 시계 — 칸 색 = 그 계절에서 3개월 뒤 올라 있던 비율</span><span><i class="g2"></i>65%↑</span><span><i class="g1"></i>57%↑</span><span><i class="z"></i>50%↑</span><span><i class="r1"></i>45%↑</span><span><i class="r2"></i>그 아래</span></div>' +
      '<p class="sc-note">읽는 법: 시계는 🌱 봄(바닥에서 올라옴) → ☀️ 여름(오름) → 🔥 늦여름(과열) → 🍂 가을(꺾임) → ❄️ 겨울(내림) → 🌤 늦겨울(바닥 다지기) 순서로 돌고, 바늘이 지금 자리예요. 과거 통계로 확률을 보려는 것이지 맞히는 게 아니에요. 가격지수(배당 제외) · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".sc-h{font-size:17px;font-weight:900}.sc-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.sc-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.sc-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.sc-sum b{color:var(--text,inherit)}" +
    ".sc-g{margin:12px 0 2px;font-size:12.5px;font-weight:800;color:var(--sub)}.sc-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.sc-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}.sc-r>summary::-webkit-details-marker{display:none}" +
    ".sc-n{min-width:0}.sc-n b{font-size:14.5px;font-weight:900}.sc-n small{display:block;font-size:12px;color:var(--sub);font-weight:700;margin-top:1px;word-break:keep-all}.sc-w{flex:0 0 auto;text-align:right}.sc-w b{display:inline-block;font-size:13.5px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap}.sc-w.w2 b{background:rgba(48,164,108,.16);color:#1f8a57}.sc-w.w1 b{background:rgba(240,160,60,.2);color:#b86a00}.sc-w.w0 b{background:rgba(229,72,77,.15);color:#d13438}.sc-w.wh b{background:rgba(127,127,127,.16);color:var(--sub)}.sc-m.cur{stroke:var(--text,#111);stroke-width:2}.sc-me{font-size:11px;text-anchor:middle}.sc-w i{display:block;font-style:normal;font-size:10.5px;color:var(--sub);font-weight:700;margin-top:2px}" +
    ".sc-x{margin-top:10px}.sc-d{display:flex;gap:10px;align-items:center}.sc-svg{width:132px;height:132px;flex:0 0 auto}.sc-m.g2{fill:#30a46c}.sc-m.g1{fill:#9bd8b7}.sc-m.z{fill:rgba(127,127,127,.28)}.sc-m.r1{fill:#f3b0a4}.sc-m.r2{fill:#e5484d}" +
    ".sc-ml{font-size:8px;font-weight:800;text-anchor:middle;fill:#1b1f24}.sc-o.on{fill:#1f8a57}.sc-o.half{fill:#e0a030}.sc-o.off{fill:rgba(127,127,127,.25)}.sc-nd{stroke:var(--text,#111);stroke-width:2.4;stroke-linecap:round;fill:var(--text,#111)}.sc-ce{font-size:15px;text-anchor:middle}.sc-cn{font-size:8.5px;font-weight:800;text-anchor:middle;fill:var(--text,#111)}" +
    ".sc-f{list-style:none;margin:0;padding:0;flex:1;min-width:0}.sc-f li{padding:4px 0}.sc-f li+li{border-top:1px solid rgba(127,127,127,.18)}.sc-f small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;line-height:1.3;word-break:keep-all}.sc-f b{font-size:15px;font-weight:900}.sc-f em{font-style:normal;font-size:11.5px;color:var(--sub);margin-left:5px}" +
    ".sc-v,.sc-c{margin:8px 0 0;font-size:13px;line-height:1.55;word-break:keep-all}.sc-c{padding:8px 10px;border-radius:10px;background:rgba(240,160,60,.13)}" +
    ".sc-t{margin-top:8px}.sc-t>summary{cursor:pointer;font-size:12.5px;font-weight:800;color:var(--accent,#3182f6)}.sc-t table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11.5px}.sc-t th,.sc-t td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.sc-t th:first-child,.sc-t td:first-child{text-align:left;white-space:normal;word-break:keep-all}.sc-t tr.pk td{font-weight:900}.sc-t small{display:block;margin-top:4px;font-size:11px;color:var(--sub);line-height:1.4}" +
    ".sc-lg{display:flex;flex-wrap:wrap;gap:4px 10px;margin:12px 0 0;font-size:11px;color:var(--sub);font-weight:700}.sc-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}.sc-lg .g2{background:#30a46c}.sc-lg .g1{background:#9bd8b7}.sc-lg .z{background:rgba(127,127,127,.28)}.sc-lg .r1{background:#f3b0a4}.sc-lg .r2{background:#e5484d}.sc-lg .o{background:#1f8a57;height:4px;vertical-align:2px}" +
    ".sc-note{margin:8px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    /* 🧭 A11/12-1 계절 띠 */
    ".sc-rec{margin:10px 0 6px;font-size:12.5px;font-weight:800;line-height:1.45;word-break:keep-all}" +
    ".sc-ax,.sc-r>summary.sc-bs{display:grid;grid-template-columns:98px minmax(0,1fr) 54px;gap:7px;align-items:center}.sc-r>summary.sc-bs{justify-content:normal}" +
    ".sc-ax{margin:10px 0 -2px;padding:0 12px;font-size:10px;font-weight:800;color:var(--sub)}.sc-axb{position:relative;height:13px}.sc-axb i{position:absolute;top:0;font-style:normal;transform:translateX(-50%);white-space:nowrap}.sc-axb i.r{right:0;transform:none}" +
    ".sc-r{padding:7px 12px;margin-top:5px}.sc-bs .sc-n b{font-size:13px;white-space:nowrap}.sc-bs .sc-n{white-space:nowrap;overflow:hidden}.sc-bs .sc-n small.sc-w{display:block;text-align:left;background:none;padding:0;font-size:10.5px;font-weight:800;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sc-bs small.sc-w.w2{color:#1f8a57}.sc-bs small.sc-w.w1{color:#b86a00}.sc-bs small.sc-w.w0{color:#d13438}.sc-bs small.sc-w.wh{color:var(--sub)}" +
    ".sc-band{position:relative;display:block;height:18px;border-radius:5px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(127,127,127,.18)}.sc-band i{position:absolute;right:-3px;top:-3px;bottom:-3px;width:3px;border-radius:2px;background:var(--text,#111)}" +
    ".sc-st{text-align:right;min-width:0}.sc-st b{display:block;font-size:12.5px;font-weight:900;white-space:nowrap}.sc-st small{display:block;font-size:10.5px;font-weight:700;color:var(--sub)}" +
    ".sc-tip{margin:6px 0 2px;padding:8px 10px;border-radius:10px;font-size:12.5px;line-height:1.5;background:rgba(49,130,246,.12);word-break:keep-all}.sc-tip small{color:var(--sub)}" +
    ".sc-bm{display:inline;color:var(--accent,#3182f6);font-weight:800;text-decoration:none}";
  document.head.appendChild(css);
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__seasonData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
