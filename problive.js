/* ⚡ 10/19 장중 확률 다시 계산 — 사용자 「지금 거래서 플러스 전환했다…. 대단하다 진짜….」
   🎲 prob.json 은 매시간이라, 10:18 「코스피 −1.79% → 12% 거의 확실히 내린다」가 10:23 +0.54% 반전 뒤에도 남았음.
   prob.py 가 넘긴 재료(ic: 흔들림 sig · 시각별 남은 흔들림 vh · 다른 방법 기울기 dev)에 장중 나침반(live_xx.json, 10분마다)의 지금 등락을 넣어 같은 식을 앱에서 다시 계산.
   window.probLive(m, L) → {p1, chg, t, rem} 또는 null (장 밖·자료 없음·나침반이 더 오래됨) */
(function(){
  function cdf(x){ var t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989423 * Math.exp(-x * x / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; }
  function lg(p){ return Math.log(p / (1 - p)); }
  function sg(x){ return 1 / (1 + Math.exp(-x)); }
  function loc(tz){
    try { var f = new Intl.DateTimeFormat("en-US", {timeZone: tz, hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(new Date()), o = {};
      f.forEach(function(x){ o[x.type] = x.value; });
      return {m: (+o.hour % 24) * 60 + (+o.minute), wd: o.weekday, ymd: o.year + "-" + o.month + "-" + o.day}; } catch(x) { return null; }
  }
  // 같은 식으로 「그 시각·그 등락이었다면」 확률 (장중 흐름 그리기용) — el = 장 시작 뒤 분
  function core(c, chg, el){
    var o = Math.floor(c.open / 100) * 60 + c.open % 100, cl = Math.floor(c.close / 100) * 60 + c.close % 100, tot = cl - o;
    if (el < 0 || el > tot) return null;
    var rem = Math.max(0.02, 1 - el / tot), vr = rem;
    if (c.vh){ var pts = [[0, 1]].concat(c.vh).concat([[tot, 0.003]]);
      for (var i = 0; i < pts.length - 1; i++) if (el >= pts[i][0] && el <= pts[i + 1][0]){ var a = pts[i], b = pts[i + 1]; vr = Math.max(0.003, a[1] + (b[1] - a[1]) * (el - a[0]) / ((b[0] - a[0]) || 1)); break; } }
    var pi = Math.min(0.99, Math.max(0.01, cdf(Math.log(1 + chg / 100) / (c.sig * Math.sqrt(vr)))));
    return {p1: Math.round(Math.min(0.99, Math.max(0.01, sg(lg(pi) + (c.dev || 0)))) * 1000) / 1000, rem: rem, vr: vr};
  }
  window.probAt = function(m, chg, hhmm){
    var c = m && m.ic; if (!c || chg == null || !hhmm) return null;
    var o = Math.floor(c.open / 100) * 60 + c.open % 100, t = hhmm.split(":");
    return core(c, chg, (+t[0]) * 60 + (+t[1]) - o);
  };
  window.probLive = function(m, L, P){
    var c = m && m.ic; if (!c || !L || !L.index || !L.index[0] || L.index[0].chg == null) return null;
    var T = loc(c.tz); if (!T || T.wd === "Sat" || T.wd === "Sun") return null;
    var o = Math.floor(c.open / 100) * 60 + c.open % 100, cl = Math.floor(c.close / 100) * 60 + c.close % 100, tot = cl - o, el = T.m - o;
    if (el < 0 || el > tot) return null;
    var K = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    if (L.date && L.date !== K && L.date !== T.ymd) return null;                       // 오늘 나침반이 아님
    // 🎲 계산이 휴대폰에 받아 둔 나침반보다 새것이면 🎲 값을 그대로 쓰되 null 을 돌려주지 않음
    // (10/19 12:24 — null 이면 오늘 확률 카드의 ⚡ 지금 장·섹터·집중 종목이 통째로 사라졌음)
    var pNew = P && P.date === K && P.t && L.t && L.t <= P.t && m.p1 != null && m.intra_chg != null;
    var rem = Math.max(0.02, 1 - el / tot), vr = rem;
    if (c.vh){ var pts = [[0, 1]].concat(c.vh).concat([[tot, 0.003]]);
      for (var i = 0; i < pts.length - 1; i++) if (el >= pts[i][0] && el <= pts[i + 1][0]){ var a = pts[i], b = pts[i + 1]; vr = Math.max(0.003, a[1] + (b[1] - a[1]) * (el - a[0]) / ((b[0] - a[0]) || 1)); break; } }
    if (pNew) return {p1: m.p1, chg: m.intra_chg, t: P.t, rem: rem, vr: vr, sig: c.sig, src: "prob"};
    var chg = L.index[0].chg, pi = cdf(Math.log(1 + chg / 100) / (c.sig * Math.sqrt(vr)));
    pi = Math.min(0.99, Math.max(0.01, pi));
    var p1 = Math.min(0.99, Math.max(0.01, sg(lg(pi) + (c.dev || 0))));
    return {p1: Math.round(p1 * 1000) / 1000, chg: chg, t: L.t, rem: rem, vr: vr, sig: c.sig};
  };
})();
