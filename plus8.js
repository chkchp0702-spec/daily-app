/* CH Investing — 시황 맨 위: ⚡ 킥 → 🇺🇸 전일 미국장 핵심 멘트 (가장 바깥 겹이라 항상 맨 위) */
(function(){
  var P = PL, e = V.e, rich = V.rich;
  function strip(s){ return String(s || "").replace(/<span[^>]*>|<\/span>/g, ""); }
  P.wrap("market", function(it, a){
    if (it.files.indexOf("data.json") < 0) return;
    getJSON(file("market", it.id, "data.json")).then(function(d){
      var h = "", k = d.kick, s = d.story || {};
      // ① 킥
      if (k && !k.none && k.title){
        h += '<section class="card mk-kick"><div class="mk-lab">⚡ 오늘의 킥</div>' +
          '<div class="mk-t">' + rich(strip(k.title)) + '</div>' +
          (k.so ? '<div class="mk-so">→ ' + rich(strip(k.so)) + '</div>' : '') +
          ((k.rows && k.rows.length) ? '<div class="mk-rows">' + k.rows.slice(0, 6).map(function(r){
            return '<div class="' + (r.hi ? "hi" : "") + '"><span>' + e(r.label) + '</span><b class="' + (r.dir > 0 ? "up" : r.dir < 0 ? "dn" : "") + '">' + e(r.text) + '</b></div>'; }).join("") + '</div>' : '') +
          (k.why ? '<details class="mk-why"><summary>왜 이게 킥인가</summary><p>' + rich(strip(k.why)) + '</p></details>' : '') + '</section>';
      } else if (k && k.none){
        h += '<section class="card mk-kick"><div class="mk-lab">⚡ 오늘의 킥</div><div class="mk-so">오늘은 킥 없음 — ' + rich(strip(k.why || "")) + '</div></section>';
      }
      // ①-2 🔥 지금 주도 테마 (리포트 data.leaders + 아침 자동 레이더 market/sectors.json)
      h += '<section class="card mk-lead2" id="mkld"><div class="mk-lab">🔥 지금 돈이 몰리는 곳</div>' +
        (d.leaders && d.leaders.title ? '<div class="mk-t2">' + rich(strip(d.leaders.title)) + '</div>' + (d.leaders.so ? '<div class="mk-so">→ ' + rich(strip(d.leaders.so)) + '</div>' : '') +
          ((d.leaders.korea || []).length ? '<div class="mk-kr">' + d.leaders.korea.map(function(k){ return '<div>🇰🇷 ' + rich(strip(k)) + '</div>'; }).join("") + '</div>' : '') : '') +
        '<div class="mk-rad"></div></section>';
      // ② 전일 미국장 핵심 멘트
      var us = (d.quotes || []).filter(function(q){ return q.cls === "us"; }).slice(0, 3);
      var bm = String(d.basis || "").match(/미국[^·]*/);
      if (s.title || s.lead || us.length){
        h += '<section class="card mk-us"><div class="mk-lab">🇺🇸 전일 미국장 핵심' + (bm ? ' <span class="mut">' + e(bm[0].trim()) + '</span>' : '') + '</div>' +
          (s.title ? '<div class="mk-t2">' + rich(strip(s.title)) + '</div>' : '') +
          (s.lead ? '<p class="mk-lead">' + rich(strip(s.lead)) + '</p>' : '') +
          (us.length ? '<div class="mk-q">' + us.map(function(q){
            return '<div><small>' + e(String(q.who || "").replace(/^🇺🇸\s*/, "")) + '</small><b>' + rich(strip(q.said)) + '</b>' + (q.so ? '<span>→ ' + rich(strip(q.so).replace(/^\s*→?\s*(<b>)?\s*그래서\?\s*(<\/b>)?\s*/, "")) + '</span>' : '') + '</div>'; }).join("") + '</div>' : '') + '</section>';
      }
      a.innerHTML = h;
      // 아침 자동 레이더 (리포트에 없더라도 숫자는 매일)
      getJSON(RAW + "market-strategy-report/main/market/sectors.json?" + Date.now()).then(function(S){
        var box = document.querySelector("#mkld .mk-rad"); if (!box || !S || !S.rows) return;
        var by = {}; S.rows.forEach(function(r){ by[r.sym] = r; });
        var row = function(r, cold){ var v = r.r5 || 0; return '<div class="rad"><span class="rad-n">' + (cold ? "🧊 " : "") + e(r.name) + ' <small>' + e(r.sym) + '</small>' + (r.streak >= 3 ? ' <em>🔥' + r.streak + '일</em>' : '') + '</span>' +
          '<span class="rad-b"><i style="width:' + Math.min(100, Math.abs(v) * 9).toFixed(0) + '%;background:' + (v >= 0 ? "#e5533b" : "#3b7ddd") + '"></i></span><b class="' + (v >= 0 ? "up" : "dn") + '">' + (v >= 0 ? "+" : "") + v.toFixed(1) + '%</b>' +
          '<small class="rad-20">20일 ' + (r.r20 != null ? (r.r20 >= 0 ? "+" : "") + r.r20.toFixed(1) + "%" : "–") + '</small></div>'; };
        box.innerHTML = '<div class="rad-h">미국 섹터·테마 5일 · ' + e(String(S.asof || "").slice(5).replace("-", "/")) + ' 종가 · S&amp;P ' + ((S.spy && S.spy.r5) >= 0 ? "+" : "") + ((S.spy && S.spy.r5) || 0).toFixed(1) + '%</div>' +
          (S.hot || []).slice(0, 5).map(function(s){ return by[s] ? row(by[s]) : ""; }).join("") +
          (S.cold || []).slice(0, 2).map(function(s){ return by[s] ? row(by[s], true) : ""; }).join("");
      }).catch(function(){});
    }).catch(function(){});
  });
})();
