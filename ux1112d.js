/* 🎯 11/12 신호 확률판 — 사용자 「어떤 신호가 왔을 때 현금 비중을 늘리는지 · 어떤 바닥 신호들이 왔을 때 주식 비중을 늘리는지 — 확률을 좀 높여줘」
   market-strategy-report/market/prob.json (src/prob_bt.py · 평일 07:20·16:50) → 🏠 오늘 홈, 🧭 계절 시계 아래
   신호마다 「켜진 날 뒤에 실제로 얼마나 자주 빠졌나/올랐나」를 9개 지수에서 센 것 · 앞(~2012)·뒤(2013~) 둘 다 통한 신호만 「믿을 만」 */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/prob.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"};
  function bar(p, base){
    if (p == null) return "";
    var hot = base != null && p >= base + 8, cool = base != null && p <= base - 5;
    return '<span class="sp-bar"><i class="' + (hot ? "h" : cool ? "c" : "") + '" style="width:' + Math.max(3, Math.min(100, p)) + '%"></i>' + (base != null ? '<u style="left:' + Math.min(100, base) + '%"></u>' : '') + '</span>';
  }
  function pick(v){ return v ? (v.p_mk != null ? v.p_mk : v.p) : null; }
  function row(m, P){
    var d = m.t.down, c = m.t.crash, pd = pick(d), pc = pick(c), nm = P.wn || {};
    var word = pd == null ? "" : pd >= (d.base_mk || d.base) + 8 ? "평소보다 높음" : pd <= (d.base_mk || d.base) - 5 ? "평소보다 낮음" : "평소 수준";
    var own = ((P.targets.down.per_market[m.key] || {}).top || []).concat(((P.targets.crash.per_market[m.key] || {}).top || []));
    var seen = {}, ownL = own.filter(function(x){ if (seen[x.k]) return false; seen[x.k] = 1; return true; }).slice(0, 5);
    var on = {}; (d.on || []).concat(c ? c.on : [], d.own_on || [], c ? c.own_on : []).forEach(function(k){ on[k] = 1; });
    return '<details class="sp-r"><summary><span class="sp-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>고점보다 ' + String(m.dd).replace("-", "−") + '% · 경고 ' + d.n + '/' + d.of + '개 켜짐</small></span>' +
      '<span class="sp-p"><b>' + (pd != null ? pd + "%" : "–") + '</b><small>평소 ' + Math.round(d.base_mk || d.base) + '% · ' + e(word) + '</small>' + bar(pd, d.base_mk || d.base) + '</span></summary>' +
      '<div class="sp-x"><p><b>6개월 안에 10% 넘게 더 빠질 확률</b> ' + (pd != null ? pd + "%" : "–") + ' (이 지수 평소 ' + Math.round(d.base_mk || d.base) + '%' + (d.p_mk_ep ? ' · 이런 때가 과거 ' + d.p_mk_ep + '번' : '') + ')</p>' +
        (c ? '<p><b>1년 안에 20% 넘게 더 빠질 확률</b> ' + (pc != null ? pc + "%" : "–") + ' (이 지수 평소 ' + Math.round(c.base_mk || c.base) + '%)</p>' : '') +
        '<p class="sp-ch"><b>지금 켜진 경고</b> ' + (Object.keys(on).length ? Object.keys(on).map(function(k){ return '<i class="on">🔴 ' + e(nm[k] || k) + '</i>'; }).join("") : '<i>없음</i>') + '</p>' +
        (ownL.length ? '<p class="sp-own"><b>이 지수에서 잘 맞았던 경고</b> (앞·뒤 기간 둘 다)</p><ul class="sp-ul">' + ownL.map(function(x){ return '<li>' + (on[x.k] ? "🔴 " : "⚪ ") + e(x.name) + ' <em>켜지면 ' + x.p_on + '% · ' + x.lift + '배</em></li>'; }).join("") + '</ul>'
          : '<p class="sp-own">이 지수만 따로 보면 앞·뒤 기간 둘 다 통한 경고 신호가 없어요 — 전체 지수 통계로 봤어요.</p>') +
      '</div></details>';
  }
  function sigRows(T){
    return (T.signals || []).filter(function(x){ return !x.thin; }).slice(0, 8).map(function(x){
      return '<tr class="' + (x.good ? "pk" : "") + '"><td>' + (x.good ? "✅ " : "") + e(x.name) + '</td><td>' + x.p_on + '%</td><td>' + x.lift + '배</td><td>' + (x.lift_a == null ? "–" : x.lift_a) + ' / ' + (x.lift_b == null ? "–" : x.lift_b) + '</td></tr>'; }).join("");
  }
  // 📦 11/12 나라별 「다른 자료」(싼지 비싼지 · 빚 · 심리 · 자금) — market/alt.json (src/alt_bt.py)
  var TGN = {down: "6개월 안 −10%", crash: "1년 안 −20%", up12: "1년 뒤 플러스", good: "6개월 좋은 매수 자리", up12_deep: "1년 뒤 플러스(고점 −20% 아래서)", good_deep: "6개월 좋은 매수 자리(고점 −20% 아래서)"};
  function altHtml(A){
    if (!A || !A.markets) return "";
    var onW = [], onB = [];
    var rows = A.markets.map(function(m){
      var gs = (m.signals || []).filter(function(r){ return r.good && r.good.length; });
      var li = gs.map(function(r){
        var tg = r.good[0], v = r.t[tg];
        if (r.now) (r.side === "W" ? onW : onB).push(m.name);
        return '<li class="' + (r.now ? "on" : "") + '">' + (r.side === "W" ? "🚨" : "🌱") + ' <b>' + e(r.name) + '</b>' + (r.now ? ' <i>지금 켜짐</i>' : '') + '<em>' + e(TGN[tg] || tg) + ' ' + v.p_on + '% (평소 ' + v.base + '%) · ' + v.years + '개 해에 걸쳐 · ' + String(v.from).slice(0, 4) + '년~</em></li>'; }).join("");
      var x = m.x5 || {};
      return '<div class="sp-am"><div class="sp-amh">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>5년 평균선보다 ' + (x.gap > 0 ? "+" : "") + String(x.gap).replace("-", "−") + '% · 자기 과거 중 ' + (x.pct >= 50 ? "비싼 쪽 상위 " + (100 - x.pct) : "싼 쪽 하위 " + x.pct) + '%</small></div>' +
        (li ? '<ul class="sp-al">' + li + '</ul>' : '<p class="sp-an">통과한 신호 없음 (' + (m.signals || []).length + '개 시험)</p>') + '</div>';
    }).join("");
    var uq = function(a){ return a.filter(function(x, i){ return a.indexOf(x) === i; }); };
    return '<details class="sp-t" open><summary>📦 나라별 다른 자료 — 싼지 비싼지 · 빚 · 심리 · 자금</summary>' +
      '<p>주가 말고 다른 종류의 자료로 만든 신호 <b>' + A.n_tested + '개 중 ' + A.n_good + '개</b>가 앞·뒤 기간 둘 다 통했어요. ' +
        (uq(onW).length ? '지금 🚨 경고가 켜진 곳: <b>' + e(uq(onW).join(" · ")) + '</b>. ' : '') + (uq(onB).length ? '지금 🌱 바닥 쪽이 켜진 곳: <b>' + e(uq(onB).join(" · ")) + '</b>.' : '지금 🌱 바닥 쪽이 켜진 곳은 없어요.') + '</p>' + rows +
      '<small>자료: 🇺🇸 CAPE·PER·PBR·개인 심리(AAII) · 🇰🇷 예탁금·신용잔고·반대매매(금융투자협회)·외국인 매매·환율 · 🇨🇳 PER·PBR·주식−채권 금리차·시총÷GDP·융자잔고·북향 자금 · 🇭🇰 남향 자금 · 전부 5년 평균선. 「비싸다·싸다」는 그날까지 자기 과거와 비교(미래 값 안 봄). 못 받은 것: 🇰🇷 코스피 PER·PBR(KRX 로그인 필요) · 🇯🇵 닛케이 PER·PBR 과거 · 🇺🇸 신용융자·실업률(막힘)</small></details>';
  }
  window.__sigProbCard = function(P){
    if (!P || !P.targets || !P.now) return "";
    var T = P.targets, D = T.down, C = T.crash, G = T.good, U = T.up12;
    var ms = P.now.filter(function(m){ return m.t && m.t.down; }); if (!ms.length) return "";
    var hi = ms.filter(function(m){ var d = m.t.down, p = pick(d); return p != null && p >= (d.base_mk || d.base) + 8; });
    var lead = hi.length ? "지금 경고가 평소보다 높은 곳 — " + hi.map(function(m){ return m.name; }).join(" · ") : "지금 평소보다 경고가 높은 지수는 없어요";
    var auc = D.oos_gb || D.oos_logit || {};
    var inDD = ms.filter(function(m){ return m.t.good; });
    return '<section class="card sp" id="sigprob" data-cz="done"><div class="sp-h">🎯 신호 확률판 <small>' + e(String(P.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="sp-lead">' + e(lead) + '</p>' +
      '<p class="sp-sum">신호가 켜진 날 뒤에 실제로 얼마나 자주 빠졌는지를 9개 지수 약 30년치로 센 숫자예요. <b>숫자 = 앞으로 6개월 안에 지금보다 10% 넘게 더 빠진 적이 있던 비율</b> · 세로 줄은 그 지수의 평소 값.</p>' +
      ms.map(function(m){ return row(m, P); }).join("") +
      altHtml(window.__altData) +
      '<details class="sp-t"><summary>🚨 어떤 신호에 현금을 늘리나 — 경고 신호 성적</summary>' +
        '<p>경고 ' + (D.signals || []).length + '개 중 <b>앞·뒤 기간 둘 다 통한 건 ' + (D.good || []).length + '개</b>예요. 켜져도 평소 ' + D.base + '% → 50% 안팎으로, 조금 올라가는 정도예요.</p>' +
        '<table><tr><th>신호 (6개월 안 −10%)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(D) + '</table>' +
        '<p>믿을 만한 신호가 겹치면: ' + (D.ladder_good || []).map(function(x){ return (x.lo === x.hi ? x.lo : x.lo + "개↑").toString().replace(/^(\d+)$/, "$1개") + " " + (x.p == null ? "–" : x.p + "%"); }).join(" → ") + '</p>' +
        '<table><tr><th>신호 (1년 안 −20% 큰 하락)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(C) + '</table>' +
        '<small>평소 = ' + D.base + '% (6개월 −10%) · ' + C.base + '% (1년 −20%) · ✅ = 앞(~2012)·뒤(2013~) 둘 다 1.15배 넘고 지수 3분의 2 넘게 같은 방향</small></details>' +
      '<details class="sp-t"><summary>🌱 어떤 바닥 신호에 주식을 늘리나 — 바닥 신호 성적</summary>' +
        '<p><b>바닥 신호 ' + (G.signals || []).length + '개 중 앞·뒤 기간 둘 다 통한 건 ' + (G.good || []).length + '개예요.</b> 고점보다 20% 넘게 빠진 날에 샀을 때 평소 확률은 — 6개월 뒤 좋은 자리(플러스이고 그 사이 −10% 더 안 빠짐) <b>' + G.base + '%</b> · 1년 뒤 플러스 <b>' + U.base + '%</b>. 신호가 켜지길 기다려도 이 숫자가 꾸준히 올라가지 않았어요.</p>' +
        '<table><tr><th>신호 (6개월 좋은 매수 자리)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(G) + '</table>' +
        (inDD.length ? '<p>지금 고점 −20% 아래: ' + inDD.map(function(m){ return e(m.name); }).join(" · ") + ' — 과거 같은 깊이에서 1년 뒤 플러스였던 비율 ' + inDD.map(function(m){ var u = m.t.up12; return e(m.name) + " " + (u && u.base_mk != null ? Math.round(u.base_mk) + "%" : "–"); }).join(" · ") + '</p>' : '') +
        '</details>' +
      '<p class="sp-note">얼마나 믿을 수 있나: 해마다 그 전 자료만으로 맞히게 하는 시험에서 맞히는 힘은 ' + (auc.auc != null ? auc.auc : "–") + '이었어요(0.5 = 동전 던지기 · 1 = 다 맞힘). 큰 하락(−20%)은 ' + ((C.oos_logit || {}).auc != null ? C.oos_logit.auc : "–") + '. 즉 「확률이 조금 기운다」 정도이고 맞히는 도구는 아니에요. 날마다 겹치는 표본이라 독립된 사건 수는 훨씬 적어요 · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".sp-h{font-size:17px;font-weight:900}.sp-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.sp-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.sp-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.sp-sum b{color:var(--text,inherit)}" +
    ".sp-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.sp-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px}.sp-r>summary::-webkit-details-marker{display:none}" +
    ".sp-n{min-width:0;flex:1}.sp-n b{font-size:14.5px;font-weight:900}.sp-n small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px}.sp-p{flex:0 0 46%;text-align:right}.sp-p>b{font-size:17px;font-weight:900}.sp-p>small{font-size:11px;color:var(--sub);font-weight:700;margin-left:5px}" +
    ".sp-bar{display:block;position:relative;height:7px;border-radius:99px;background:rgba(127,127,127,.18);margin-top:4px;overflow:visible}.sp-bar i{display:block;height:100%;border-radius:99px;background:#9aa3b2}.sp-bar i.h{background:#e5484d}.sp-bar i.c{background:#30a46c}.sp-bar u{position:absolute;top:-3px;width:2px;height:13px;background:var(--text,#111);border-radius:1px}" +
    ".sp-x{margin-top:8px;font-size:13px;line-height:1.55;word-break:keep-all}.sp-x p{margin:4px 0 0}.sp-ch i{display:inline-block;font-style:normal;font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:999px;background:rgba(127,127,127,.12);color:var(--sub);margin:2px 3px 0 0}.sp-ch i.on{background:rgba(229,72,77,.13);color:#d13438}" +
    ".sp-own{color:var(--sub);font-size:12.5px}.sp-ul{margin:4px 0 0;padding:0;list-style:none;font-size:12.5px}.sp-ul li{padding:2px 0}.sp-ul em{font-style:normal;color:var(--sub);margin-left:4px}" +
    ".sp-t{margin-top:10px;border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px}.sp-t>summary{cursor:pointer;font-size:13.5px;font-weight:900;list-style:none}.sp-t>summary::-webkit-details-marker{display:none}.sp-t p{margin:8px 0 6px;font-size:13px;line-height:1.55;word-break:keep-all}" +
    ".sp-t table{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0 8px}.sp-t th,.sp-t td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.sp-t th:first-child,.sp-t td:first-child{text-align:left;white-space:normal;word-break:keep-all}.sp-t tr.pk td{font-weight:900}.sp-t small{display:block;font-size:11px;color:var(--sub);line-height:1.4}" +
    ".sp-am{margin-top:10px;padding-top:8px;border-top:1px solid rgba(127,127,127,.18)}.sp-amh b{font-size:13.5px;font-weight:900}.sp-amh small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px}" +
    ".sp-al{list-style:none;margin:6px 0 0;padding:0}.sp-al li{font-size:12.5px;line-height:1.45;padding:4px 0;word-break:keep-all}.sp-al li b{font-weight:800}.sp-al li em{display:block;font-style:normal;color:var(--sub);font-size:11.5px}.sp-al li i{font-style:normal;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:99px;background:rgba(229,72,77,.14);color:#d13438;margin-left:3px}.sp-an{margin:4px 0 0!important;font-size:12px!important;color:var(--sub)}" +
    ".sp-note{margin:10px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}";
  document.head.appendChild(css);
  fetch(RAW.replace("prob.json", "alt.json") + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(A){
    if (!A) return; window.__altData = A; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__sigProbData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
