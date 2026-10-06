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
    }).catch(function(){});
  });
})();
