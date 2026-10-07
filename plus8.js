/* CH Investing — 시황 맨 위: ⚡ 킥 → 🇺🇸 전일 미국장 핵심 멘트 (가장 바깥 겹이라 항상 맨 위) */
(function(){
  var P = PL, e = V.e, rich = V.rich;
  function strip(s){ return String(s || "").replace(/<span[^>]*>|<\/span>/g, ""); }
  function pc(v){ return v == null ? '<b>–</b>' : '<b class="' + (v >= 0 ? "up" : "dn") + '">' + (v >= 0 ? "+" : "") + Number(v).toFixed(1) + '%</b>'; }
  // 관련주 → 종목리포트 → 뒤로 하면 보던 관련주 창으로 다시
  var RET = null;
  window.addEventListener("popstate", function(){
    if (!RET) return;
    var n = 0, t = setInterval(function(){
      if (!RET || ++n > 25){ clearInterval(t); return; }
      if (cur !== "market" || !document.getElementById("mkld") || document.getElementById("sheet")) return;
      clearInterval(t); var o = RET; RET = null; themeSheet(o.r, o.S); }, 80);
  });

  // 🎯 오늘의 집중 그리기 — F: market/focus.json, L: archive/x/focus_live.json (장중, 없으면 null)
  var ST_IC = {"초입": "🌱", "주도": "🚀", "과열": "🔥", "꺾임": "🍂"};
  function spark(v, w, h){
    if (!v || v.length < 2) return "";
    var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), rg = (mx - mn) || 1, col = v[v.length - 1] >= 0 ? "#e66767" : "#3987e5";
    var pts = v.map(function(x, i){ return (i * (w - 2) / (v.length - 1) + 1).toFixed(1) + "," + (h - 2 - (x - mn) / rg * (h - 4)).toFixed(1); }).join(" ");
    var z = mn < 0 && mx > 0 ? (h - 2 - (0 - mn) / rg * (h - 4)).toFixed(1) : null;
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + (z ? '<line x1="0" x2="' + w + '" y1="' + z + '" y2="' + z + '" stroke="#5d667a" stroke-dasharray="2 3" stroke-width=".8"/>' : '') +
      '<polyline fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" points="' + pts + '"/></svg>';
  }
  function man(v){ var a = Math.abs(v); return (v >= 0 ? "+" : "−") + (a >= 1e4 ? (a / 1e4).toFixed(a >= 1e5 ? 0 : 1) + "만" : Math.round(a).toLocaleString()) + "주"; }
  function focusHtml(F, L){
    var px = (L && L.px) || {}, liveOn = L && L.date && L.at;
    var tagc = function(a){ return a === "추격 금지" ? "r" : a === "눌림 대기" ? "o" : /★/.test(a) ? "g" : "x"; };
    var usOpen = (function(){ var a = (L && L.at) || "", h = +a.slice(0, 2); return a && (h >= 22 || h < 6); })();
    var chip = function(x, flag){ var nm = x.name || x.t, q = px[x.t]; if (q && flag === "🇺🇸" && !usOpen) q = {lv: q.lv, d: q.d};
      var pos = x.pos ? '<small class="fo-pos">' + e(x.pos.k) + ' ' + (q && q.lv ? (q.d >= 0 ? "+" : "") + q.d.toFixed(1) : (x.pos.d != null ? (x.pos.d >= 0 ? "+" : "") + x.pos.d.toFixed(1) : "")) + '%</small>' : '';
      var now = q && q.r != null ? '<small class="fo-now ' + (q.r >= 0 ? "up" : "dn") + '">지금 ' + (q.r >= 0 ? "+" : "") + q.r.toFixed(1) + '%</small>' : '';
      return '<a class="fo-st" href="javascript:openOP(\'' + e(x.t).replace(/'/g, "") + '\')"><span class="fo-nm">' + flag + ' <b>' + e(nm.length > 13 ? nm.slice(0, 12) + "…" : nm) + '</b>' + (x.star ? ' <em>★' + e(x.star) + '</em>' : '') + pos + '</span>' +
        '<span>' + now + (x.r5 != null ? pc(x.r5) : '') + ' <i class="fo-t ' + tagc(x.act || "") + '">' + e(x.act || "") + '</i></span></a>'; };
    var al = (L && L.alerts || []).slice(-4).reverse();
    var h = (al.length ? '<div class="fo-al">' + al.map(function(a){ return '<div class="' + (a.k === "돌파" ? "ok" : "ng") + '">' + (a.k === "돌파" ? "✅" : "⚠️") + ' <b>' + e(a.name) + '</b> ' + e(a.msg) + ' <small>' + e(a.at) + '</small></div>'; }).join("") + '</div>' : '') +
      (liveOn ? '<div class="fo-live"><span class="ixc-on">●</span> 장중 추적 ' + e(L.at) + ' · 10분마다 · 기준가 돌파/20일선 이탈은 알림 탭 「🎯」 구독하면 휴대폰으로</div>' : '');
    h += '<div class="fo-sub" style="margin-top:2px">① 돈의 길 — 5개 시장 1주</div><div class="fo-cs">' + (F.countries || []).map(function(c, i){
      return '<div class="fo-c' + (i === 0 && c.label ? " fo-top" : "") + '"><div class="fo-n">' + c.flag + " " + e(c.name) + '</div><div class="fo-v">' + pc(c.chg5) + '</div><small>' + (c.label ? e(c.label) : "1주 " + e(c.ix || "")) + '</small>' +
        ((c.hot || [])[0] ? '<small class="fo-h">▲ ' + e(c.hot[0].name) + '</small>' : '') + '</div>'; }).join("") + '</div>';
    h += F.themes.slice(0, 2).map(function(t, i){
      var sg = t.stage || {}, fl = t.flow, lg = t.lag, sp = t.supply;
      return '<div class="fo-th"><div class="fo-tt"><b>' + (i ? "③" : "②") + " " + e(t.name) + '</b> <small>' + e(t.sym) + '</small>' + (t.streak >= 3 ? ' <em>🔥' + t.streak + '일</em>' : '') +
          '<span>5일 ' + pc(t.r5) + ' · 20일 ' + pc(t.r20) + '</span></div>' +
        (sg.s ? '<div class="fo-stg s-' + e(sg.c || "x") + '"><b>' + (ST_IC[sg.s] || "") + " " + e(sg.s) + '</b> ' + e(sg.do || "") + '</div>' : '') +
        (fl ? '<div class="fo-fl">' + spark(fl.rs, 92, 26) + '<div><b>💧 ' + e(fl.lab) + '</b><small>S&amp;P 대비 20일 흐름 ' + pc(fl.rs[fl.rs.length - 1]) + ' · 거래대금 ' + fl.dv + '배</small></div></div>' : '') +
        (t.why_auto ? '<div class="fo-why">' + e(t.why_auto) + '</div>' : '') +
        (lg ? '<div class="fo-lag">🔗 ' + e(lg.txt) + (lg.today ? '<br><b>' + e(lg.today) + '</b>' : '') + '</div>' : '') +
        '<div class="fo-sub">ETF</div>' + chip({t: t.sym, name: t.sym + " (미국)", r5: t.r5, act: t.etf_us.act}, "🇺🇸") + (t.etf_kr || []).slice(0, 2).map(function(x){ return chip(x, "🇰🇷"); }).join("") +
        '<div class="fo-sub">종목 <span class="mut">★ = 우리 컵·갭·매집에도 걸림 · 작은 글씨 = 매수 자리까지 · 오른쪽 = 5일</span></div>' + (t.us || []).slice(0, 4).map(function(x){ return chip(x, "🇺🇸"); }).join("") + (t.kr || []).slice(0, 4).map(function(x){ return chip(x, "🇰🇷"); }).join("") +
        (sp ? '<div class="fo-sup">🏦 한국 연결주 5일 수급 · 외국인 <b class="' + (sp.frg >= 0 ? "up" : "dn") + '">' + man(sp.frg) + '</b> · 기관 <b class="' + (sp.org >= 0 ? "up" : "dn") + '">' + man(sp.org) + '</b> <small>(' + sp.n + '종목)</small></div>' : '') +
        (t.stop ? '<div class="fo-stop">⛔ <b>이게 깨지면</b> ' + e(t.stop) + '</div>' : '') + '</div>'; }).join("");
    var sc = F.score || {};
    h += (F.avoid && F.avoid.length ? '<div class="fo-av">🧊 빠지는 곳: ' + F.avoid.slice(0, 3).map(function(a){ return e(a.name) + " " + pc(a.r5); }).join(" · ") + '</div>' : '');
    if (sc.bad) h += '<div class="fo-bad">⚠️ 집중 성적이 나빠요 — 최근 5번 중 3번 이상 S&amp;P에 짐<br>' + (sc.week || []).slice(0, 3).map(function(x){ return e(x.asof.slice(5)) + " " + e(x.name) + " " + pc(x.res) + " → " + e(x.lesson || ""); }).join("<br>") + '</div>';
    h += '<details class="fo-wk"><summary>📒 집중 성적 ' + (sc.n ? '<b>' + sc.hit + '/' + sc.n + '</b> · 평균 S&amp;P 대비 ' + pc(sc.avg_ex) : '— 10/7부터 기록, 5거래일 뒤 채점') + ' <span class="mut">· 눌러서 회고</span></summary>' +
      ((sc.week || []).length ? (sc.week || []).map(function(x){ var w = Math.min(100, Math.abs(x.ex || 0) * 8);
        return '<div class="fo-wr"><span>' + e(x.asof.slice(5)) + ' <b>' + e(x.name) + '</b></span><span class="fo-wb"><i style="width:' + w + '%;background:' + ((x.ex || 0) >= 0 ? "#e66767" : "#3987e5") + '"></i></span><span>' + pc(x.ex) + 'p</span>' + (x.lesson ? '<small>' + e(x.lesson) + '</small>' : '') + '</div>'; }).join("")
        : '<div class="mut" style="font-size:12px;padding:6px 0">아직 채점된 집중이 없어요. 채점 대기: ' + (sc.open || []).map(function(x){ return e(x.asof.slice(5)) + " " + e(x.name); }).join(" · ") + '</div>') + '</details>';
    h += '<div class="mut" style="font-size:11px;margin-top:6px">단계 🌱초입=모아가기 · 🚀주도=눌림 매수 · 🔥과열=추격 금지 · 🍂꺾임=끝났나? / 종목 ★관심 = 테마+차트 자리 · 눌림 대기 = 5일 +15%↑ · 추격 금지 = 하루 +8%↑. 매수 권유가 아니라 볼 곳을 좁히는 표예요.</div>';
    return h;
  }
  // 테마 → 관련주 보조 창
  function themeSheet(r, S){
    if (!r) return;
    if (window.closeSheet && document.getElementById("sheet")) closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button class="sh-x" onclick="goBack()">✕</button><b></b></div><div class="sh-body"><div class="empty">불러오는 중…</div></div>';
    sh.querySelector("b").textContent = "🔥 " + r.name + " 관련주";
    document.body.appendChild(sh); document.body.classList.add("sheet-open");
    try { history.pushState({t: "xs", d: navD() + 1}, "", location.pathname + "#" + cur); } catch(x) {}
    if (window.updBack) updBack();
    var mem = r.members || {us: (r.lead || []), kr: []};
    var draw = function(){
      var nm = {}; (window.OPIDX || []).forEach(function(x){ nm[x.sym] = x; });
      var list = function(L, kr){
        if (!L || !L.length) return '<div class="mut" style="font-size:12.5px;padding:6px 0">아직 없음</div>';
        return '<div class="th-h"><span>종목</span><span>1일</span><span>5일</span><span>20일</span></div>' + L.map(function(m){
          var o = nm[m.t], name = kr ? (o ? o.name : m.n) : (o ? o.name : m.t);
          return '<div class="th-r' + (o ? " go" : "") + '"' + (o ? ' data-op="' + e(m.t) + '"' : '') + '><span class="th-n">' + e(name) + ' <small>' + e(kr ? m.t.replace(/\.K[SQ]$/, "") : m.t) + '</small>' + (o ? ' <i>›</i>' : '') + '</span>' + pc(m.r1) + pc(m.r5) + pc(m.r20) + '</div>'; }).join("");
      };
      var spy = S.spy || {};
      var h = '<section class="card"><div class="th-k">' +
        '<div><small>5일</small>' + pc(r.r5) + '</div><div><small>20일</small>' + pc(r.r20) + '</div><div><small>60일</small>' + pc(r.r60) + '</div>' +
        '<div><small>S&amp;P 대비 5일</small>' + pc(r.rs5) + '</div></div>' +
        '<div class="mut" style="font-size:12px;margin-top:8px">' + e(r.sym) + ' · 순위 ' + (r.rank || "–") + '위' + (r.rank_chg ? ' (' + (r.rank_chg > 0 ? "▲" : "▼") + Math.abs(r.rank_chg) + ')' : '') +
        (r.streak >= 3 ? ' · 🔥 S&amp;P보다 강한 날 ' + r.streak + '일 연속' : '') + (r.off_hi != null ? ' · 52주 고점 대비 ' + Number(r.off_hi).toFixed(1) + '%' : '') + ' · ' + e(String(S.asof || "").slice(5).replace("-", "/")) + ' 종가</div></section>' +
        '<section class="card"><h3>🇺🇸 미국 관련주 <span class="mut">5일 순</span></h3>' + list(mem.us) + '</section>' +
        '<section class="card"><h3>🇰🇷 한국 관련주 <span class="mut">5일 순</span></h3>' + list(mem.kr, true) + '</section>' +
        '<div class="mut" style="font-size:11.5px;text-align:center;margin:6px 0 30px">이름을 누르면 종목리포트로 가요</div>';
      var b = sh.querySelector(".sh-body"); b.innerHTML = h;
      [].forEach.call(b.querySelectorAll("[data-op]"), function(el){ el.onclick = function(){ RET = {r: r, S: S}; openOP(el.dataset.op); }; });
    };
    (window.opLoadIdx ? opLoadIdx() : Promise.resolve()).then(draw, draw);
  }
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
      // ①-1 🎯 오늘의 집중 (market-strategy-report/market/focus.json — 돈의 길 → 담는 법 → 행동)
      h += '<section class="card mk-focus" id="mkfo"><div class="mk-lab">🎯 오늘의 집중 <span class="mut">돈의 길 → 담는 법 → 행동</span></div><div class="fo-b"><div class="loading">불러오는 중…</div></div></section>';
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
      // 🎯 집중 채우기 (단계·흐름 선·시차·자리·수급 + 장중 추적)
      getJSON(RAW + "market-strategy-report/main/market/focus.json?" + Date.now()).then(function(F){
        var box = document.querySelector("#mkfo .fo-b"); if (!box) return;
        if (!F || !F.themes || !F.themes.length){ box.innerHTML = '<div class="mut">오늘 집중 자료가 아직 없어요.</div>'; return; }
        window.__FO = F;
        box.innerHTML = focusHtml(F, null);
        var live = function(){ getJSON("archive/x/focus_live.json?" + Math.floor(Date.now() / 60000)).then(function(L){
          if (!L || !document.getElementById("mkfo")) return;
          var b = document.querySelector("#mkfo .fo-b"); if (b) b.innerHTML = focusHtml(F, L); }).catch(function(){}); };
        live(); clearInterval(window.__FOT); window.__FOT = setInterval(function(){ if (!document.getElementById("mkfo")) return clearInterval(window.__FOT); if (!document.hidden) live(); }, 120000);
      }).catch(function(){ var box = document.querySelector("#mkfo .fo-b"); if (box) box.innerHTML = '<div class="mut">집중 자료를 못 불러왔어요.</div>'; });
      // 아침 자동 레이더 (리포트에 없더라도 숫자는 매일)
      getJSON(RAW + "market-strategy-report/main/market/sectors.json?" + Date.now()).then(function(S){
        var box = document.querySelector("#mkld .mk-rad"); if (!box || !S || !S.rows) return;
        var by = {}; S.rows.forEach(function(r){ by[r.sym] = r; });
        var row = function(r, cold){ var v = r.r5 || 0; return '<div class="rad" data-s="' + e(r.sym) + '"><span class="rad-n">' + (cold ? "🧊 " : "") + e(r.name) + ' <small>' + e(r.sym) + '</small>' + (r.streak >= 3 ? ' <em>🔥' + r.streak + '일</em>' : '') + '</span>' +
          '<span class="rad-b"><i style="width:' + Math.min(100, Math.abs(v) * 9).toFixed(0) + '%;background:' + (v >= 0 ? "#e5533b" : "#3b7ddd") + '"></i></span><b class="' + (v >= 0 ? "up" : "dn") + '">' + (v >= 0 ? "+" : "") + v.toFixed(1) + '%</b>' +
          '<small class="rad-20">20일 ' + (r.r20 != null ? (r.r20 >= 0 ? "+" : "") + r.r20.toFixed(1) + "%" : "–") + '</small></div>'; };
        box.innerHTML = '<div class="rad-h">미국 섹터·테마 5일 · ' + e(String(S.asof || "").slice(5).replace("-", "/")) + ' 종가 · S&amp;P ' + ((S.spy && S.spy.r5) >= 0 ? "+" : "") + ((S.spy && S.spy.r5) || 0).toFixed(1) + '%</div>' +
          (S.hot || []).slice(0, 5).map(function(s){ return by[s] ? row(by[s]) : ""; }).join("") +
          (S.cold || []).slice(0, 2).map(function(s){ return by[s] ? row(by[s], true) : ""; }).join("") +
          '<div class="rad-tip">테마를 누르면 관련주가 나와요 ›</div>';
        [].forEach.call(box.querySelectorAll(".rad[data-s]"), function(el){ el.onclick = function(){ themeSheet(by[el.dataset.s], S); }; });
      }).catch(function(){});
    }).catch(function(){});
  });
})();
