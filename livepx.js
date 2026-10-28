/* 💹 지금 가격 덧입히기 (10/28 사용자 「하이닉스 지금 거의 10% 올랐는데…. 정확한 시세 좀 쓰고」)
   종목 가격 조각(p/*.json)은 하루 한 번 종가라, 장중엔 어제 값이 보였음.
   → live.py 가 10분마다 쓰는 archive/x/live_px.json(한국 전 종목·ETF) + wl_live.json(⭐ 관심종목 · 미국 포함)으로
     [날짜, 가격, 전일, 1년고, 1년저, 시작, 주간] 을 지금 값으로 바꿔 줌. 바뀐 배열엔 .lv = "13:50" 이 붙음. */
(function(){
  var D = {kr: null, wl: null}, at = 0, P = null;
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function gj(u){ return fetch(u + "?" + Math.floor(Date.now() / 240000)).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }
  function load(){
    if (P && Date.now() - at < 4 * 60e3) return P;
    at = Date.now();
    P = Promise.all([gj("archive/x/live_px.json"), gj("archive/x/wl_live.json")]).then(function(r){ D.kr = r[0] || D.kr; D.wl = r[1] || D.wl; return D; });
    return P;
  }
  function apply(sym, p){
    if (!p || !p.length) return p;
    var c = String(sym || ""), k = /^\d{6}/.test(c) ? c.slice(0, 6) : c, td = today(), q = null, t = "";
    var K = D.kr && D.kr.date === td && D.kr.q ? D.kr.q[k] : null;
    if (K && K[0]){ q = {p: +K[0], prev: K[1] != null ? +K[0] / (1 + K[1] / 100) : +p[2]}; t = D.kr.t || ""; }
    else {
      var w = D.wl && D.wl.q ? D.wl.q[k] : null;
      if (w && w.p && w.t && w.t.slice(0, 10) >= String(p[0])){
        var ago = (kst() - new Date(w.t.replace(" ", "T") + ":00Z")) / 60e3;
        if (ago < 45){ q = {p: +w.p, prev: w.prev ? +w.prev : +p[1]}; t = w.t.slice(11, 16); }
      }
    }
    if (!q || !(q.p > 0)) return p;
    var o = p.slice(), wk = (p[6] || []).slice();
    o[0] = td; o[1] = q.p; o[2] = q.prev; o[3] = Math.max(+p[3] || q.p, q.p); o[4] = Math.min(+p[4] || q.p, q.p);
    if (wk.length) wk[wk.length - 1] = q.p; o[6] = wk; o.lv = t || "장중";
    return o;
  }
  window.LIVEPX = {load: load, apply: apply};
  load();
  setInterval(function(){ if (!document.hidden) load(); }, 5 * 60e3);
})();
