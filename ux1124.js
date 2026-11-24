/* 🔦 11/24 바닥 점검표 15칸 — 코스피·코스닥 (사용자: 「코스피 코스닥 바닥 신호인지를 심층분석 · 모든 방법을 동원해서」 → 「둘 다 진행」)
   「팔 사람은 다 팔았나」(투매·청산 8칸) 와 「살 사람이 들어왔나」(확인 7칸) 를 따로 세어 한 줄 판정 + 펼치면 15칸.
   계산은 만드는 쪽(market-strategy-report src/floor_check.py → bear.json 코스피·코스닥 칸의 floor) — 이 파일은 그리기만.
   붙는 곳: 🐻 하락장 계기판 시장 줄 안, 📜 과거 성적표 바로 위 (새 화면 없음 · 12/1까지 새 화면 동결 지킴)
   규칙(현금·주식 비중)은 안 바꿈 · 기록 · 과거 빈도는 앞날 보장 아님 · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var IC = {on: "✔", half: "△", off: "✖"}, NM = {on: "켜짐", half: "반쯤", off: "꺼짐"};
  function dots(cells){ return cells.map(function(c){ return '<i class="fc-' + c.st + '" title="' + e(c.k) + '"></i>'; }).join(""); }
  function rows(cells){
    return cells.map(function(c){
      return '<li class="fc-' + c.st + '"><span class="fc-i" aria-label="' + NM[c.st] + '">' + IC[c.st] + '</span><b>' + e(c.k) + '</b><small>' + e(c.d) + (c.asof ? ' <em>' + e(c.asof) + ' 기준</em>' : '') + '</small></li>';
    }).join("");
  }
  function floorHtml(m){
    var f = m && m.floor; if (!f || !f.cells || !f.cells.length) return "";
    var S = f.cells.filter(function(c){ return c.g === "sell"; }), C = f.cells.filter(function(c){ return c.g === "conf"; });
    var past = (f.past && f.past.lines || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("");
    var d = String(f.asof || "").slice(5).replace("-", "/").replace(/^0/, "");
    return '<div class="fc"><div class="fc-h">🔦 ' + e(f.name || m.name || "") + ' 바닥 점검표 <small>' + e(d) + ' 종가 · 15칸</small></div>' +
      '<div class="fc-v fc-' + e(f.lv) + '">' + e(f.head) + '</div>' +
      '<div class="fc-g"><span>팔 사람은 다 팔았나</span><span class="fc-dots">' + dots(S) + '</span><b>' + f.sell_on + '/' + S.length + '</b></div>' +
      '<div class="fc-g"><span>살 사람이 들어왔나</span><span class="fc-dots">' + dots(C) + '</span><b>' + f.conf_on + '/' + C.length + '</b></div>' +
      (f.chg && f.chg.k && f.chg.k.length ? '<p class="fc-chg">🔄 ' + e(String(f.chg.d || "").slice(5).replace("-", "/")) + ' 바뀐 칸: ' + e(f.chg.k.join(" · ")) + '</p>' : '') +
      '<details class="fc-d"><summary>15칸 펼치기</summary>' +
        '<div class="fc-t">투매·청산 — 팔 사람은 다 팔았나</div><ul class="fc-ul">' + rows(S) + '</ul>' +
        '<div class="fc-t">확인 — 살 사람이 들어왔나</div><ul class="fc-ul">' + rows(C) + '</ul>' +
        '<p class="fc-n">확인 5칸↑ = 🟢 바닥 확인 쪽 · 확인 3칸↑ + 투매 4칸↑ = 🟡 가능성 높아짐 · 투매 4칸↑ = 🟠 바닥 구간일 수 있음(확인 전)</p>' +
        (past ? '<div class="fc-t">과거 같은 자리의 그 뒤</div><ul class="fc-past">' + past + '</ul>' : '') +
        '<p class="fc-n">' + e(f.note || "규칙은 그대로 · 기록 · 매수·매도 추천 아님") + '</p></details></div>';
  }
  window.__floorHtml = floorHtml;
  /* 11/24 사용자 「왜 바닥점검표가 코스피만 있냐 — 코스닥 s&p500 나스닥100 다 만들어」
     → 처음엔 📜 과거 성적표 머리(__bearSigHead)에만 붙여서, 첫 화면 「지금 규칙」(가장 나쁜 시장 한 곳 = 코스피)과 깊숙한 체크리스트에서만 보였음.
     이제 시장 줄마다 불리는 __meetLine 에 붙임 → 🐻 계기판의 코스피·코스닥·S&P500·나스닥 줄을 펼치면 각각 보임.
     같은 시장에서 두 머리가 잇달아 불리면(체크리스트 펼침) 한 번만 그림. */
  /* 첫 화면 「지금 규칙」 펼침 — 네 시장 한 표(줄마다 판정·n/8·n/7 · 누르면 그 시장 15칸). ux1105c.js ruleHtml 이 부름. */
  var FL = {kr: "🇰🇷", us: "🇺🇸"}, allT = 0;
  function floorAll(BR){
    var ms = ((BR && BR.markets) || []).filter(function(m){ return m.floor && m.floor.cells && m.floor.cells.length; });
    if (!ms.length) return "";
    allT = Date.now();
    return '<div class="fa"><div class="fa-h">🔦 바닥 점검표 <small>시장 ' + ms.length + '곳 · 누르면 15칸</small></div>' + ms.map(function(m){
      var f = m.floor, ns = f.cells.filter(function(c){ return c.g === "sell"; }).length, nc = f.cells.length - ns;
      return '<details class="fa-r fc-' + e(f.lv) + '"><summary><span class="fa-n">' + (FL[m.nat] || "") + ' <b>' + e(f.name || m.name) + '</b></span>' +
        '<span class="fa-v">' + e(String(f.head || "").replace(" · 확인 전", "")) + '</span>' +
        '<span class="fa-c">팔 사람 <b>' + f.sell_on + '/' + ns + '</b> · 살 사람 <b>' + f.conf_on + '/' + nc + '</b></span></summary>' + floorHtml(m) + '</details>';
    }).join("") + '</div>';
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
    ".fc-dots i.fc-on{background:#22a05a}.fc-dots i.fc-half{background:#f0b429}" +
    ".fc-chg{margin:6px 0 2px;font-size:12px;line-height:1.5;color:var(--text,#111);word-break:keep-all}" +
    ".fc-d{margin-top:4px}.fc-d summary{font-size:12px;color:var(--sub,#888);cursor:pointer;padding:6px 0;min-height:24px}" +
    ".fc-t{font-size:12px;font-weight:800;margin:8px 0 4px;color:var(--text,#111)}" +
    ".fc-ul{list-style:none;margin:0;padding:0}.fc-ul li{display:grid;grid-template-columns:20px 1fr;grid-template-areas:'i k' 'i d';column-gap:6px;padding:5px 0;border-top:1px solid var(--line,rgba(127,127,127,.18))}" +
    ".fc-ul li:first-child{border-top:0}.fc-i{grid-area:i;font-size:13px;font-weight:900;line-height:1.5;color:var(--sub,#888)}" +
    ".fc-ul li.fc-on .fc-i{color:#22a05a}.fc-ul li.fc-half .fc-i{color:#d99a0b}" +
    ".fc-ul b{grid-area:k;font-size:13px;line-height:1.5;word-break:keep-all}.fc-ul small{grid-area:d;font-size:11.5px;line-height:1.5;color:var(--sub,#888);word-break:keep-all;display:block}" +
    ".fc-ul small em{font-style:normal;opacity:.8;white-space:nowrap}" +
    ".fc-past{margin:2px 0 0;padding-left:16px}.fc-past li{font-size:11.5px;line-height:1.55;color:var(--sub,#888);margin:2px 0;word-break:keep-all;display:list-item}" +
    ".fa{margin:8px 0}.fa-h{font-size:13px;font-weight:800;margin-bottom:4px}.fa-h small{font-size:11.5px;font-weight:600;color:var(--sub,#888);margin-left:4px}" +
    ".fa-r{border:1px solid var(--line,#e5e7eb);border-radius:11px;margin:5px 0;padding:0 9px;display:block}.fa-r>summary{display:grid;grid-template-columns:1fr auto;grid-template-areas:'n c' 'v v';gap:2px 8px;align-items:center;padding:8px 0;cursor:pointer;list-style:none;min-height:44px}" +
    ".fa-r>summary::-webkit-details-marker{display:none}.fa-r>summary::after,.fa-r>summary::before{content:none!important;display:none!important}.fa-v::after{content:' ▾';font-weight:600;color:var(--sub,#888)}.fa-r[open] .fa-v::after{content:' ▴'}.fa-n{grid-area:n;font-size:13.5px;white-space:nowrap}.fa-c{grid-area:c;font-size:11.5px;color:var(--sub,#888);white-space:nowrap;text-align:right}.fa-c b{color:var(--text,#111);font-size:12.5px}" +
    ".fa-v{grid-area:v;font-size:12.5px;font-weight:800;word-break:keep-all}.fa-r[open]>summary{border-bottom:1px solid var(--line,rgba(127,127,127,.18))}.fa-r .fc{border:0;padding:8px 0 6px;margin:0}.fa-r .fc-h,.fa-r .fc-v{display:none}" +
    ".fc-n{margin:8px 0 0;font-size:11px;line-height:1.5;color:var(--sub,#888);word-break:keep-all}";
  document.head.appendChild(css);
})();
