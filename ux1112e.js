/* 🔁 11/12 닮은 장 백테스트 — 사용자 「이번엔 지금 장과 유사했던 때들로만 백테스트 · 성격이 다른 장들까지 다 넣으니 확률이 안 올라간 것 같아」
   market-strategy-report/market/analog.json (src/analog_bt.py · 평일 07:40) → 🏠 오늘 홈, 🎯 신호 확률판 아래 · 🔬 연구실 바로가기
   지수마다: 지금과 닮았던 때 12번 → 그 뒤 2년 길(그림) · 더 빠졌나 · 방식 16개 성적 */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/analog.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return v == null ? "–" : String(v).replace("-", "−"); }
  function sg(v){ return v == null ? "–" : (v > 0 ? "+" : "") + mn(v) + "%"; }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"};
  var SHORT = {lump: "지금 다 사기", cash: "계속 현금", dca6: "6개월 나눠 사기", dca12: "12개월 나눠 사기", dip: "더 빠질 때마다 사기", half200: "절반 지금 + 절반 200일선 회복 때", third: "3분의 1씩 나눠(지금·50일선·200일선)",
               floor: "바닥 신호마다 3분의 1씩", bear: "하락장이면 현금 · 풀리면 주식", ma10: "10개월선 위로 올라오면 사기", ddl: "−10% 절반 · −20% 현금", deep: "10개월선 + 많이 싸면 절반", mom12: "1년 전보다 높으면 주식",
               step3: "신호 3개 계단", a200: "200일선 위로 올라오면 사기", a50: "50일선 위로 올라오면 사기"};
  function verdict(m){
    var f = m.fwd, L = {}; m.rules.forEach(function(r){ L[r.k] = r; });
    var lump = L.lump, n = f.n;
    if (lump.beat_cash >= Math.ceil(n * 0.75) && lump.y2_med >= 15) return ["buy", "사는 쪽이 유리했음", "닮은 때 " + n + "번 중 " + lump.beat_cash + "번, 지금 사서 2년 들고 있는 게 현금보다 나았어요"];
    if (f.more10 >= Math.ceil(n * 0.75) && lump.beat_cash <= n / 2) return ["wait", "더 기다리는 쪽이 유리했음", "닮은 때 " + n + "번 중 " + f.more10 + "번, 그 뒤 10% 넘게 더 빠졌어요"];
    return ["mid", "반반 — 나눠서", "닮은 때 " + n + "번 중 " + lump.beat_cash + "번만 지금 사는 게 현금보다 나았어요"];
  }
  function chart(m){
    var W = 300, H = 130, pl = 30, pr = 6, pt = 8, pb = 18, all = [], k;
    m.episodes.forEach(function(ep){ ep.path.forEach(function(v){ all.push(v); }); });
    var lo = Math.min(-10, Math.min.apply(null, all)), hi = Math.max(10, Math.min(150, Math.max.apply(null, all)));
    var X = function(i){ return pl + i * (W - pl - pr) / 24; }, Y = function(v){ return pt + (hi - Math.min(hi, v)) * (H - pt - pb) / (hi - lo); };
    var g = '<line class="an-z" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '"/>';
    [lo, 0, hi].forEach(function(v){ g += '<text class="an-ax" x="' + (pl - 4) + '" y="' + (Y(v) + 3).toFixed(1) + '" text-anchor="end">' + (v > 0 ? "+" : "") + mn(Math.round(v)) + '%</text>'; });
    [[0, "지금"], [12, "1년 뒤"], [24, "2년 뒤"]].forEach(function(t){ g += '<text class="an-ax" x="' + X(t[0]).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="' + (t[0] === 0 ? "start" : t[0] === 24 ? "end" : "middle") + '">' + t[1] + '</text>'; });
    m.episodes.forEach(function(ep){ g += '<polyline class="an-l ' + ((ep.y2 != null ? ep.y2 : ep.y1) > 0 ? "u" : "d") + '" points="' + ep.path.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") + '"/>'; });
    var med = [];
    for (k = 0; k <= 24; k++){ var vs = m.episodes.filter(function(ep){ return ep.path.length > k; }).map(function(ep){ return ep.path[k]; }).sort(function(a, b){ return a - b; }); if (vs.length < 4) break; med.push(vs.length % 2 ? vs[(vs.length - 1) / 2] : (vs[vs.length / 2 - 1] + vs[vs.length / 2]) / 2); }
    g += '<polyline class="an-m" points="' + med.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") + '"/>';
    return '<svg class="an-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + e(m.name) + ' 닮은 때 ' + m.episodes.length + '번의 그 뒤 2년">' + g + '</svg>';
  }
  function row(m){
    var f = m.fwd, n = f.n, v = verdict(m), now = m.now, best = m.rules[0], L = {}; m.rules.forEach(function(r){ L[r.k] = r; });
    var show = m.rules.slice(0, 5); ["lump", "cash"].forEach(function(k){ if (show.indexOf(L[k]) < 0) show.push(L[k]); });
    var tb = show.map(function(r, i){ return '<tr class="' + (i === 0 ? "pk" : "") + '"><td>' + e(SHORT[r.k] || r.name) + '</td><td>' + sg(r.y2_med) + '</td><td>' + sg(r.y2_worst) + '</td><td>' + r.beat_cash + '/' + r.n + '</td></tr>'; }).join("");
    var eps = m.episodes.map(function(ep){ return '<li>' + (FL[ep.nat] || "") + ' ' + e(ep.name) + ' <b>' + e(ep.date.slice(0, 7).replace("-", "년 ") + "월") + '</b><em>더 ' + mn(ep.more) + '% · 1년 뒤 ' + sg(ep.y1) + ' · 2년 뒤 ' + sg(ep.y2) + '</em></li>'; }).join("");
    var sens = (m.sens || []).map(function(s){ return "닮은 때 " + s.n + "번으로 보면 1등 「" + (SHORT[s.top[0][0]] || s.top[0][0]) + "」 · 지금 다 사기 " + sg(s.lump[0]) + " (현금보다 " + s.lump[1] + "/" + s.n + ")"; }).join(" / ");
    return '<details class="an-r"><summary><span class="an-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>2년 새 ' + sg(now.run) + ' 오른 뒤 고점보다 ' + mn(now.dd) + '% · ' + now.since + '일째</small></span>' +
      '<span class="an-v ' + v[0] + '"><b>' + e(v[1]) + '</b></span></summary>' +
      '<div class="an-x"><p class="an-why">' + e(v[2]) + '</p>' + chart(m) +
      '<p class="an-cap">가는 선 = 닮았던 때 하나하나(그날 샀다면) · 굵은 선 = 가운데 길</p>' +
      '<ul class="an-f"><li><small>그 뒤 가장 깊이 더 빠진 폭(가운데값)</small><b>' + mn(f.more_med) + '%</b></li><li><small>10% 넘게 더 빠진 때</small><b>' + f.more10 + '/' + n + '번</b></li><li><small>바닥까지 걸린 기간</small><b>약 ' + Math.max(1, Math.round(f.to_low_med / 21)) + '개월</b></li><li><small>1년 뒤 플러스 · 2년 뒤 플러스</small><b>' + f.y1_up + '/' + n + ' · ' + f.y2_up + '/' + n + '번</b></li></ul>' +
      '<p class="an-b"><b>가장 나았던 방식 — ' + e(SHORT[best.k] || best.name) + '</b> · 2년 뒤 가운데값 ' + sg(best.y2_med) + ' · 가장 나빴던 때 ' + sg(best.y2_worst) + ' · 현금보다 나았던 때 ' + best.beat_cash + '/' + best.n + '번</p>' +
      '<table><tr><th>방식(닮은 날부터 2년)</th><th>가운데</th><th>최악</th><th>현금보다</th></tr>' + tb + '</table>' +
      '<details class="an-e"><summary>닮았던 때 ' + n + '번 보기</summary><ul>' + eps + '</ul><small>' + e(sens) + '</small></details></div></details>';
  }
  window.__analogCard = function(A){
    if (!A || !A.markets || !A.markets.length) return "";
    var by = {buy: [], wait: [], mid: []}; A.markets.forEach(function(m){ by[verdict(m)[0]].push(m.name); });
    var lead = [by.wait.length ? "더 기다리는 쪽: " + by.wait.join("·") : "", by.buy.length ? "사는 쪽: " + by.buy.join("·") : "", by.mid.length ? "나눠서: " + by.mid.join("·") : ""].filter(Boolean).join(" / ");
    return '<section class="card an" id="analog" data-cz="done"><div class="an-h">🔁 닮은 장 백테스트 <small>' + e(String(A.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="an-lead">' + e(lead) + '</p>' +
      '<p class="an-sum">지금 장과 <b>닮았던 때만</b> 골라 그 뒤 2년을 봤어요. 닮았다 = 고점 전 급등 폭 · 고점에서 빠진 폭 · 고점 뒤 며칠째 · 200일선·5년 평균선과의 거리 · 출렁임이 지금과 가까운 날(9개 지수 + 나스닥100 + 반도체 지수 · 1985년~ · 지수마다 12번).</p>' +
      A.markets.map(row).join("") +
      '<p class="an-note">닮은 때가 12번뿐이라 「12번 중 몇 번」으로만 읽어 주세요. 닮음의 기준에 싼지 비싼지(PER·CAPE)·금리는 들어 있지 않아요. 현금 연 2% · 바꿀 때 0.1% · 가격지수(배당 제외) · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".an-h{font-size:17px;font-weight:900}.an-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.an-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.an-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.an-sum b{color:var(--text,inherit)}" +
    ".an-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.an-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}.an-r>summary::-webkit-details-marker{display:none}" +
    ".an-n{min-width:0}.an-n b{font-size:14.5px;font-weight:900}.an-n small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px;word-break:keep-all}.an-v{flex:0 0 auto}.an-v b{display:inline-block;font-size:12.5px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap}" +
    ".an-v.buy b{background:rgba(48,164,108,.16);color:#1f8a57}.an-v.wait b{background:rgba(229,72,77,.15);color:#d13438}.an-v.mid b{background:rgba(240,160,60,.2);color:#b86a00}" +
    ".an-x{margin-top:8px}.an-why{margin:0 0 6px;font-size:13px;font-weight:700;line-height:1.5;word-break:keep-all}.an-svg{width:100%;height:auto;display:block}.an-l{fill:none;stroke-width:1;opacity:.55}.an-l.u{stroke:#30a46c}.an-l.d{stroke:#e5484d}.an-m{fill:none;stroke:var(--text,#111);stroke-width:2.6;stroke-linejoin:round}.an-z{stroke:rgba(127,127,127,.5);stroke-dasharray:3 3}.an-ax{font-size:8.5px;fill:var(--sub,#888);font-weight:700}" +
    ".an-cap{margin:2px 0 6px;font-size:11px;color:var(--sub)}.an-f{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}.an-f li{background:rgba(127,127,127,.08);border-radius:10px;padding:6px 8px}.an-f small{display:block;font-size:11px;color:var(--sub);font-weight:700;line-height:1.3;word-break:keep-all}.an-f b{font-size:15px;font-weight:900}" +
    ".an-b{margin:10px 0 4px;font-size:13px;line-height:1.55;word-break:keep-all}.an-x table{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0}.an-x th,.an-x td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.an-x th:first-child,.an-x td:first-child{text-align:left;white-space:normal;word-break:keep-all}.an-x tr.pk td{font-weight:900}" +
    ".an-e{margin-top:6px}.an-e>summary{cursor:pointer;font-size:12.5px;font-weight:800;color:var(--accent,#3182f6)}.an-e ul{list-style:none;margin:6px 0;padding:0;font-size:12px}.an-e li{padding:3px 0;word-break:keep-all}.an-e li em{display:block;font-style:normal;color:var(--sub);font-size:11.5px}.an-e small{display:block;font-size:11px;color:var(--sub);line-height:1.45;word-break:keep-all}" +
    ".an-note{margin:10px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}";
  document.head.appendChild(css);
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__analogData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
