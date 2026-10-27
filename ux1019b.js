/* 🧵 10/19 A10/19-2 「이 종목, 앱 성적표」 — 종목 화면 「이 종목에 뜬 신호」 밑 세로 타임라인 (사용자 「다 적용해」)
   앱이 이 종목에 한 말(알림 · 킥 진입/청산 · 그림자 장부 · 컵·갭·매집 신호 · 시황에 이름 나옴)을 날짜순으로 꿰고,
   값이 있는 점마다 「그때 값 → 지금 ±%」, 맨 끝에 「앱이 한 말 N번 · 그 뒤 오른 것 M번 · 평균 ±%」.
   자료(새 계산 없음): archive/x/push_log.json · market/kick.json(open·hold·closed·closed_all·shadow_log) · archive/x/market_x.json chips · archive/x/perf_cup/gap/accum.json
   숫자는 지어내지 않음 — 그때 값이 없는 점(시황 언급)은 채점에서 뺌. 사라는 말 없음. */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function J(u, t){ return getJSON(u + "?" + Math.floor(Date.now() / (t || 300000)), {ttl: t || 300000}).catch(function(){ return null; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : "") + v.toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v == null || isNaN(v) ? "" : v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return String(d || "").slice(5, 10).replace("-", "/"); }
  function sameFn(sym){
    var code = sym.split(".")[0], kr = /^\d{6}$/.test(code);
    return function(c){ c = String(c || ""); if (!c) return false; if (c === sym) return true; var cc = c.split(".")[0]; return kr ? cc === code : (cc === code && (c.indexOf(".") < 0 || sym.indexOf(".") < 0)); };
  }
  function fmtPx(v, sym){ if (v == null) return ""; var kr = /\.K[SQ]$|^\d{6}$/.test(sym); return kr ? Math.round(v).toLocaleString() : (v >= 100 ? v.toFixed(0) : v.toFixed(2)); }

  function build(sym, box){
    var same = sameFn(sym), st = (window.M && M.updated) || "";
    Promise.all([J("archive/x/push_log.json"), J(RAWM + "market/kick.json"), J("archive/x/market_x.json"), J("archive/x/perf_cup.json"), J("archive/x/perf_gap.json"), J("archive/x/perf_accum.json"),
                 (window.V && V.price ? V.price(/\.K[SQ]$/.test(sym) ? sym.slice(0, 6) : sym) : Promise.resolve(null)).catch(function(){ return null; })]).then(function(r){
      var PL = r[0] || [], K = r[1] || {}, MX = (r[2] || {}).chips || {}, PF = [[r[3], "☕ 컵"], [r[4], "📈 갭"], [r[5], "🤫 매집"]], q = r[6], now = q && q[1];
      var ev = [];   // {d, t(시각), ic, who, txt, px, dir(+1 = 오르면 맞음), tab}
      // 📣 알림
      (Array.isArray(PL) ? PL : []).forEach(function(p){ var hit = (p.syms || []).filter(function(s){ return same(s[0]); })[0]; if (!hit) return;
        ev.push({d: (p.t || "").slice(0, 10), t: (p.t || "").slice(11, 16), ic: "🔔", who: "알림", txt: (p.title || "").replace(/^(🔴|🟡|⚪)\s*/, ""), px: hit[1] != null ? +hit[1] : null, dir: /갭|컵|고래|매집|돌파|매수/.test(p.title || "") && !/팔기|손절|주의|하락/.test(p.title || "") ? 1 : 0, tab: p.tab}); });
      // ⚡ 킥 장부
      var kk = function(x, kind){ if (!x || !same(x.code || x.sym)) return;
        ev.push({d: x.d0, ic: "⚡", who: "킥 진입", txt: (x.src_name || x.kind || x.src || "") + (x.tags ? " " + x.tags : ""), px: x.entry, dir: 1, done: kind === "closed" ? x.r : null, tab: "port~pokick"});
        if (kind === "closed") ev.push({d: x.d1, ic: x.r >= 0 ? "🟢" : "🔴", who: "킥 청산", txt: (x.why || "") + " · " + sg(x.r) + (x.exit ? " · " + fmtPx(x.exit, sym) : ""), px: null, dir: 0, tab: "port~pokick"});
        else ev.push({d: K.asof || K.at, ic: "💼", who: "킥 보유 중", txt: (x.days != null ? x.days + "일째 · " : "") + "지금 " + sg(x.r) + (x.stop ? " · 손절선 " + fmtPx(x.stop, sym) : ""), px: null, dir: 0, tab: "port~pokick", live: true}); };
      (K.open || []).forEach(function(x){ kk(x, "open"); }); (K.hold || []).forEach(function(x){ kk(x, "hold"); });
      var seen = {}; (K.closed || []).concat(K.closed_all || []).forEach(function(x){ var id = (x.code || x.sym) + "|" + x.d0; if (seen[id]) return; seen[id] = 1; kk(x, "closed"); });
      // 🪂 그림자 장부
      Object.keys(K.shadow_log || {}).forEach(function(id){ var s = K.shadow_log[id]; if (!s || !same(s.code)) return;
        ev.push({d: s.d, ic: "🪂", who: "그림자 " + (s.src || ""), txt: (s.done ? "끝 " : "진행 중 ") + sg(s.r), px: null, dir: 1, sh: s.r, tab: ""}); });
      // 🌐 시황에 이름
      Object.keys(MX).sort().forEach(function(dk){ var row = (MX[dk] || []).filter(function(c){ return same(c[0]); })[0]; if (!row) return;
        ev.push({d: dk.slice(0, 10), ic: "🌐", who: "시황에 이름", txt: row[2] > 1 ? row[2] + "번 언급" : "언급", px: null, dir: 0, tab: "market"}); });
      // ☕📈🤫 신호 성적
      PF.forEach(function(z){ var P = z[0]; if (!P || !P.signals) return; P.signals.filter(function(s){ return same(s.code); }).forEach(function(s){
        if (ev.some(function(x){ return x.d === s.d0 && x.ic === "⚡"; })) return;
        ev.push({d: s.d0, ic: z[1].slice(0, 2).trim(), who: z[1].slice(2).trim() + " 신호", txt: (s.days != null ? s.days + "일 지남 · " : "") + "그 뒤 " + sg(s.now), px: s.p0 || null, dir: 1, sh: s.now, tab: ""}); }); });
      ev = ev.filter(function(x){ return x.d; }).sort(function(a, b){ return (a.d + (a.t || "")) < (b.d + (b.t || "")) ? -1 : 1; });
      if (!ev.length){ box.innerHTML = ""; return; }
      // 채점: 값이 있고 방향(오름 기대)이 있는 점만 → 지금(또는 청산값)과 비교
      var calls = ev.filter(function(x){ return x.dir === 1 && (x.px != null && now != null || x.sh != null || x.done != null); });
      var res = calls.map(function(x){ return x.done != null ? x.done : x.sh != null ? x.sh : (now / x.px - 1) * 100; });
      var closedBy = {}; ev.forEach(function(x){ if (x.ic === "🔴" || x.ic === "🟢") closedBy[x.d] = x; });
      var li = ev.map(function(x){
        var chip = "";
        if (x.done != null) chip = '<em class="' + cl(x.done) + '">' + fmtPx(x.px, sym) + ' → 청산 ' + sg(x.done) + '</em>';
        else if (x.px != null && now != null && !x.live){ var rr = (now / x.px - 1) * 100; chip = '<em class="' + cl(rr) + '">' + fmtPx(x.px, sym) + ' → 지금 ' + sg(rr) + '</em>'; }
        else if (x.px != null) chip = '<em>' + fmtPx(x.px, sym) + '</em>';
        return '<li><span class="a2d">' + e(md(x.d)) + (x.t ? '<small>' + e(x.t) + '</small>' : '') + '</span><span class="a2i">' + x.ic + '</span><span class="a2b">' + (x.tab ? '<a href="javascript:go(\'' + e(x.tab) + '\')">' : '<span>') + '<b>' + e(x.who) + '</b> ' + e(x.txt) + (x.tab ? '</a>' : '</span>') + chip + '</span></li>'; });
      var fold = li.length > 8;
      var h = '<section class="card tlc"><h3>🧵 이 종목, 앱 성적표 <span class="mut">앱이 한 말 ' + ev.length + '번</span></h3><ul class="a2tl' + (fold ? ' fold' : '') + '">' + li.join("") + '</ul>' +
        (fold ? '<button class="btn a2more">앞의 ' + (li.length - 8) + '개 더 보기 ▾</button>' : '');
      if (res.length){ var win = res.filter(function(v){ return v > 0; }).length, avg = res.reduce(function(a, b){ return a + b; }, 0) / res.length;
        h += '<div class="a2s">오르는 쪽으로 말한 ' + res.length + '번 중 그 뒤 오른 것 <b>' + win + '번</b> · 평균 <b class="' + cl(avg) + '">' + sg(avg) + '</b>' + (now != null ? ' <span class="mut">(청산한 건 청산값, 나머진 지금 값 기준)</span>' : '') + '</div>'; }
      h += '<p class="note" style="margin:6px 0 0">알림·킥 장부·그림자 장부·신호 성적표·시황 언급을 종목 하나로 모은 것 — 과거 기록이라 미래 보장이 아니고, 사라는 뜻도 아니에요.</p></section>';
      box.innerHTML = h;
      var mb = box.querySelector(".a2more"); if (mb) mb.onclick = function(){ box.querySelector(".a2tl").classList.remove("fold"); mb.remove(); };
    }).catch(function(){ box.innerHTML = ""; });
  }

  var css = document.createElement("style");
  css.textContent = ".tlc h3 .mut{font-weight:400;font-size:12.5px}.a2tl{list-style:none;margin:6px 0 0;padding:0;position:relative}.a2tl:before{content:'';position:absolute;left:66px;top:6px;bottom:6px;width:2px;background:color-mix(in srgb,var(--sub) 30%,transparent)}" +
    ".a2tl li{display:flex;align-items:flex-start;gap:8px;padding:5px 0;margin:0;font-size:12.5px;line-height:1.45;background:none}.a2tl li:before,.a2tl li:after{display:none;content:none}.a2tl.fold li{display:none}.a2tl.fold li:nth-last-child(-n+8){display:flex}" +
    ".a2d{width:48px;flex:none;text-align:right;color:var(--sub);font-variant-numeric:tabular-nums}.a2d small{display:block;font-size:12.5px;color:var(--dim)}.a2i{width:22px;height:22px;flex:none;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:12.5px;position:relative;z-index:1;border:1px solid color-mix(in srgb,var(--sub) 35%,transparent)}" +
    ".a2b{flex:1;min-width:0}.a2b a{color:inherit;text-decoration:none}.a2b b{color:var(--text)}.a2b em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);font-variant-numeric:tabular-nums}.a2b em.up{color:var(--up)}.a2b em.dn{color:var(--dn)}" +
    ".a2more{margin:4px 0 0 66px;font-size:12.5px}.a2s{margin-top:8px;padding:7px 9px;border-radius:9px;background:color-mix(in srgb,var(--panel) 60%,var(--bg));font-size:12.5px;color:var(--sub)}.a2s b{color:var(--text)}.a2s b.up{color:var(--up)}.a2s b.dn{color:var(--dn)}";
  document.head.appendChild(css);

  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){
    return OLD(sym).then(function(h){
      setTimeout(function(){ var el = $("opsig"); if (!el) return; var bx = document.createElement("div"); el.appendChild(bx); build(sym, bx); }, 60);
      return h;
    });
  };
})();
