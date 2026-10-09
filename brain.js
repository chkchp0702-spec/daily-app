/* 🧠 시황 두뇌 카드 (10/9) — 매시간 검토가 쌓는 brain/state.json 을 피드·포트 탭 위에 보여 준다 */
(function(){
  var U = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/brain/state.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function card(B, full){
    if (!B || !B.last_review) return '<section class="card br"><div class="br-h">🧠 지금 생각 <small>매시간 검토 · 첫 검토 준비 중</small></div></section>';
    var th = (B.theses || []).slice().sort(function(a, b){ return (b.conf || 0) - (a.conf || 0); });
    var sc = B.scorecard || {};
    var h = '<section class="card br"><div class="br-h">🧠 지금 생각 <small>' + e(B.last_review.slice(5).replace("-", "/")) + ' 검토' + (B.regime ? ' · ' + e(B.regime) : '') +
      (sc.made ? ' · 논지 채점 ' + (sc.right || 0) + '/' + ((sc.right || 0) + (sc.wrong || 0)) : '') + '</small></div>' +
      '<div class="br-s">' + e(B.summary) + '</div>';
    if (th.length) h += '<div class="br-t">' + th.slice(0, full ? 5 : 3).map(function(t){
      var c = Math.round((t.conf || 0) * 100);
      return '<div class="br-ti"><div class="br-bar"><i style="width:' + c + '%"></i></div><div><b>' + e(t.t) + '</b> <small>' + c + '%</small>' +
        (full ? '<em>' + e(t.why || "") + (t.breaks ? ' · 깨지면: ' + e(t.breaks) : '') + '</em>' : '') + '</div></div>'; }).join("") + '</div>';
    var bets = (B.bets || []).filter(function(x){ return x.status === "열림"; }).slice(0, full ? 5 : 2), bs = (sc.bets || {});
    if (bets.length || bs.made) h += '<div class="br-b"><div class="br-bh">⚡ 선제 아이디어 <small>채점 ' + (bs.win || 0) + '승 ' + (bs.loss || 0) + '패' + (bs.avg != null ? ' · 평균 ' + (bs.avg > 0 ? '+' : '') + bs.avg + '%' : '') + '</small></div>' +
      bets.map(function(x){ return '<div class="br-bi"><b>' + e(x.name || x.t) + '</b> <span class="' + (x.dir === "오름" ? "up" : "dn") + '">' + e(x.dir) + '</span> <small>' + e(x.entry) + ' → ' + e(x.target) + ' · 손절 ' + e(x.stop) + ' · ' + e(x.horizon) + '</small>' +
        (full ? '<em>' + e(x.edge || x.why || "") + '</em>' : '') + '</div>'; }).join("") + '</div>';
    var pi = B.port_ideas || [];
    if (pi.length) h += '<div class="br-p">💼 포트 제안 · ' + pi.slice(0, 4).map(function(p){ return '<b>' + e(p["칸"] || p.k || "") + '</b> ' + e(p["제안"] || p.s || "") + (p["얼마"] && +p["얼마"] !== 0 ? ' ' + e((+p["얼마"] > 0 ? '+' : '') + p["얼마"]) + '%p' : ''); }).join(" · ") + '</div>';
    if (full && (B.watch || []).length) h += '<div class="br-w">👀 ' + B.watch.slice(0, 4).map(e).join("<br>👀 ") + '</div>';
    return h + '<div class="br-n">아침 시황리포트가 이 생각을 채점하고 포트에 반영해요 · 매수 추천 아님</div></section>';
  }
  window.brainCard = function(box, full){
    if (!box) return;
    fetch(U + "?" + Date.now()).then(function(r){ return r.ok ? r.json() : null; }).then(function(B){ box.innerHTML = card(B, full); }).catch(function(){});
  };
  var css = document.createElement("style");
  css.textContent =
    ".br{border:1px solid rgba(124,156,255,.35);background:linear-gradient(160deg,rgba(124,156,255,.12),rgba(18,24,38,.3) 70%);margin-bottom:10px}" +
    ".br-h{font-weight:800;font-size:15px}.br-h small{font-weight:400;color:var(--sub);font-size:12px;margin-left:4px}" +
    ".br-s{font-size:14px;line-height:1.55;margin:6px 0 4px}" +
    ".br-ti{display:flex;gap:8px;align-items:flex-start;padding:5px 0;font-size:13px}.br-ti small{color:var(--sub)}.br-ti em{display:block;font-style:normal;font-size:11.5px;color:var(--sub)}" +
    ".br-bar{flex:none;width:34px;height:6px;border-radius:3px;background:var(--panel2);margin-top:7px;overflow:hidden}.br-bar i{display:block;height:100%;background:#7c9cff}" +
    ".br-b{margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3)}.br-bh{font-size:13px;font-weight:800}.br-bh small{font-weight:400;color:var(--sub);margin-left:4px}" +
    ".br-bi{font-size:13px;padding:4px 0}.br-bi small{color:var(--sub)}.br-bi em{display:block;font-style:normal;font-size:11.5px;color:var(--sub)}" +
    ".br-p{font-size:12.5px;margin-top:6px;padding:7px 9px;border-radius:9px;background:rgba(233,196,106,.1)}.br-w{font-size:12.5px;color:var(--sub);margin-top:6px;line-height:1.6}" +
    ".br-n{font-size:11px;color:var(--dim);margin-top:6px}";
  document.head.appendChild(css);
})();
