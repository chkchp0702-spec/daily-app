/* 💼 포트 (10/9) — 「시황리포트 배분표대로 투자했다면」
   자료: market-strategy-report/market/port.json (src/port.py, 매시간 갱신)
   ① 지금까지 성적(S&P·코스피·60/40 비교) ② 따라하기: 금액 넣으면 칸별·상품별 얼마/몇 주 ③ 비중 바뀐 날 ④ 칸별 기여 ⑤ 날짜별 성적 */
(function(){
  var URL_P = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/port.json";
  var COL = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9", "#2ab3c0", "#8a94a8", "#6fbf4a", "#e0a43a"];
  var URL_K = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/kick.json";
  var URL_C = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/conc.json";   // 🎯 집중 포트 (10/11)
  var CN = null;
  var P = null, K = null, PE = null, S = {amt: 10000000, mode: "us", pf: "base", bg: "전체", bsel: ["S&P500", "코스피", "코스닥", "MSCI 전세계"]};
  var URL_PE = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/peers.json";
  try { var sv = JSON.parse(localStorage.getItem("portSet") || "{}"); ["amt", "mode", "pf", "bg"].forEach(function(k){ if (sv[k]) S[k] = sv[k]; }); if (sv.bsel && sv.bsel.length) S.bsel = sv.bsel; } catch(e) {}
  // 비교 지수 색 (늘 같은 색)
  var BCOL = {"S&P500": "#7c9cff", "나스닥100": "#b38cff", "다우": "#5fa8d3", "코스피": "#8fd3ff", "코스닥": "#4dd4c6", "MSCI 전세계": "#ffb84d",
              "MSCI 선진국": "#e0a43a", "MSCI 신흥국": "#d98b5f", "니케이225": "#ff8fab", "항셍": "#e66767", "중국 CSI300": "#c96b6b", "심천성분": "#e07a5f", "과창판50": "#f2a65a", "주식60·채권40": "#8a94a8"};
  var BGRP = ["전체", "미국", "한국", "MSCI", "중국", "아시아", "자산배분"];
  function keep(){ try { localStorage.setItem("portSet", JSON.stringify(S)); } catch(e) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null) return "–"; d = d == null ? 2 : d; return (v > 0 ? "+" : "") + v.toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function won(v){ if (v >= 1e8) return (v / 1e8).toFixed(v >= 1e9 ? 1 : 2).replace(/\.?0+$/, "") + "억"; if (v >= 1e4) return Math.round(v / 1e4).toLocaleString("ko-KR") + "만"; return Math.round(v).toLocaleString("ko-KR"); }
  function md(d){ return d ? d.slice(5).replace("-", "/") : ""; }
  // 🧾 정직 계산 (10/11) — 기본: port.json honest.base(주 1회 리밸런싱·비용) · 킥: kick.json honest.ret(다음 날 진입·비용). 없으면 숨김
  function honV(f){ if (f.k === "conc") return null; return f.k === "kick" ? (K && K.honest ? K.honest.ret : null) : ((P.honest && P.honest.base != null) ? P.honest.base : (P.stat || {}).base_honest); }
  function honC(f){ var v = honV(f); return v == null || !window.HON ? "" : HON.chip(v, {d: 2, note: f.k === "kick" ? (K.honest || {}).note : (P.honest || {}).note}); }

  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pobody [data-op], #pobrain [data-op]");
    if (t && window.openOP){ ev.preventDefault(); ev.stopPropagation(); openOP(t.getAttribute("data-op")); }
  }, true);
  window.portView = function(){ return '<div id="pobody"><div class="loading">포트 불러오는 중…</div></div>'; };
  window.portInit = function(){
    var t = Date.now();
    Promise.all([fetch(URL_P + "?" + t).then(function(r){ if (!r.ok) throw 0; return r.json(); }),
                 fetch(URL_K + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_PE + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_C + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })])
      .then(function(a){ P = a[0]; K = a[1]; PE = a[2]; CN = a[3]; draw(); })
      .catch(function(){ var b = document.getElementById("pobody"); if (b) b.innerHTML = '<div class="empty"><div class="big">💼</div>포트 계산이 아직 안 올라왔어요.<br>다음 자동 수집(매시간) 때 채워져요.</div>'; });
  };

  function draw(){
    var b = document.getElementById("pobody"); if (!b || !P) return;
    var B = P.bench, mk = [["S&P500", "S&P500"], ["코스피", "코스피"], ["주식60·채권40", "60·40"]];
    // 두 포트 (같은 날짜 줄)
    var PF = [{k: "base", ic: "💼", t: "기본 포트", s: "킥 없음 · 배분표 그대로", s2: "킥 없음", line: P.nav, color: "#e9c46a"}];
    if (K) PF.push({k: "kick", ic: "⚡", t: "킥 포트", s: (K.rule && K.rule.base_now ? "국면 현금 + 🐋 고래 10% + 확인된 돌파 🧪" : "현금 15%p → 성과 확인된 신호만 🐋☕📈🤫"), s2: "킥 " + Math.round((((K.rules || {}).sleeve || 0) + ((K.rules || {}).whale_sleeve || 0)) * 100) + "% 포함", line: K.kick, color: "#ff6b6b"});
    if (CN && CN.nav && CN.nav.length){   // 🎯 집중 — 포트와 같은 날짜 줄에 맞춤
      var cm = {}; (CN.dates || []).forEach(function(d, i){ cm[d] = CN.nav[i]; });
      var lastv = 0, cl = P.dates.map(function(d){ if (cm[d] != null) lastv = cm[d]; return lastv; });
      PF.push({k: "conc", ic: "🎯", t: "집중 포트", s: "오르는 시장이면 주식 100% · 아니면 절반", s2: (CN.regime && CN.regime.up ? "🟢 상승장" : "🔴 상승장 아님"), line: cl, color: "#4dd47a"});
    }
    PF.forEach(function(f){
      var v = f.line, n = v.length, peak = -1e9, mdd = 0, win = 0, best = null, worst = null;
      for (var i = 0; i < n; i++){ var x = 1 + v[i] / 100; peak = Math.max(peak, x); mdd = Math.min(mdd, (x / peak - 1) * 100);
        if (i){ var r = ((1 + v[i] / 100) / (1 + v[i - 1] / 100) - 1) * 100, sp = ((1 + B["S&P500"][i] / 100) / (1 + B["S&P500"][i - 1] / 100) - 1) * 100;
          if (r >= sp) win++; if (!best || r > best.r) best = {d: P.dates[i], r: r}; if (!worst || r < worst.r) worst = {d: P.dates[i], r: r}; } }
      f.ret = v[n - 1]; f.mdd = mdd; f.win = win; f.days = n - 1; f.best = best; f.worst = worst;
    });
    if (!PF.some(function(f){ return f.k === S.pf; })) S.pf = "base";
    var F = PF.filter(function(f){ return f.k === S.pf; })[0] || PF[0];
    // 비교 지수 목록 (port.json bench_meta — 달러 기준, 현지 통화도)
    var BM = (P.bench_meta || Object.keys(B).map(function(n){ return {name: n, group: "", ok: true}; })).filter(function(m){ return m.ok !== false && B[m.name]; })
      .map(function(m){ var v = B[m.name]; return {name: m.name, group: m.group || "", ret: v[v.length - 1], local: m.local, r1: m.r1}; });
    S.bsel = S.bsel.filter(function(n){ return B[n]; }); if (!S.bsel.length) S.bsel = ["S&P500"];
    var beat = function(f){ return BM.filter(function(m){ return f.ret >= m.ret; }).length; };
    var bmx = Math.max.apply(null, BM.map(function(m){ return Math.abs(m.ret); }).concat(PF.map(function(f){ return Math.abs(f.ret); }), [0.5]));
    var rowsB = BM.filter(function(m){ return S.bg === "전체" || m.group === S.bg; }).map(function(m){ return {b: m, ret: m.ret}; })
      .concat(PF.map(function(f){ return {f: f, ret: f.ret}; })).sort(function(a, b){ return b.ret - a.ret; });
    var h = '<div class="sec">🏁 시장 ' + BM.length + '곳과 비교 <small class="mut">' + md(P.start) + '부터 · 달러 기준</small></div><section class="card po-lb">' +
      '<div class="po-lbs">' + PF.map(function(f){ var w = beat(f);
        return '<button data-pf="' + f.k + '" class="' + (S.pf === f.k ? "on" : "") + (f.k === "kick" ? " k" : "") + '"><small>' + f.ic + ' ' + f.t + '</small><b class="' + cls(f.ret) + '">' + sg(f.ret) + '</b>' + honC(f) +
          '<em><span class="po-wbar"><i style="width:' + (w / BM.length * 100).toFixed(0) + '%"></i></span>' + BM.length + '곳 중 <b>' + w + '</b>곳 이김</em></button>'; }).join("") + '</div>' +
      '<div class="po-chips">' + BGRP.filter(function(g){ return g === "전체" || BM.some(function(m){ return m.group === g; }); }).map(function(g){
        return '<button data-bg="' + g + '" class="' + (S.bg === g ? "on" : "") + '">' + g + '</button>'; }).join("") + '</div>' +
      '<div class="po-rk">' + rowsB.map(function(x, i){
        var v = x.ret, w = Math.abs(v) / bmx * 50;
        var bar = '<div class="bar"><span class="' + (v >= 0 ? "p" : "m") + '" style="width:' + w.toFixed(1) + '%"></span></div>';
        if (x.f) return '<div class="po-rr me' + (x.f.k === "kick" ? " k" : "") + (S.pf === x.f.k ? " on" : "") + '" data-pf="' + x.f.k + '"><span class="no">' + (i + 1) + '</span><span class="n">' + x.f.ic + ' <b>' + x.f.t + '</b></span>' + bar + '<b class="v ' + cls(v) + '">' + sg(v) + '</b><span class="d"></span></div>';
        var m = x.b, on = S.bsel.indexOf(m.name) >= 0, d = F.ret - m.ret;
        return '<div class="po-rr' + (on ? " sel" : "") + '" data-bn="' + e(m.name) + '"><span class="no">' + (i + 1) + '</span><span class="n"><i class="dot" style="' + (on ? "background:" + (BCOL[m.name] || "#8a94a8") : "") + '"></i>' + e(m.name) +
          '<small>' + e(m.group) + (m.local != null && Math.abs(m.local - m.ret) >= 0.05 ? ' · 현지 ' + sg(m.local, 1) : '') + '</small></span>' + bar +
          '<b class="v ' + cls(v) + '">' + sg(v) + '</b><span class="d ' + (d >= 0 ? "w" : "l") + '">' + (d >= 0 ? "앞섬 " : "뒤짐 ") + sg(d, 1).replace("%", "p") + '</span></div>'; }).join("") + '</div>' +
      '<p class="note" style="margin:6px 0 0">지수 줄을 누르면 아래 그래프에 넣고 빼요(최대 5개). 「앞섬·뒤짐」은 ' + F.ic + ' ' + F.t + ' 기준. 포트와 같은 달러 기준이라 코스피·니케이처럼 현지 통화와 다를 땐 「현지」 수익률을 함께 적었어요.</p></section>';
    var ex = F.ret - B["S&P500"][B["S&P500"].length - 1];
    var cmp = S.bsel.slice(0, 4);
    h += (PF.length > 1 ? '<div class="po-mode po-pf2">' + PF.map(function(f){ return '<button data-pf="' + f.k + '" class="' + (S.pf === f.k ? "on" : "") + '">' + f.ic + ' ' + f.t + '</button>'; }).join("") + '</div>' : '') +
      '<section class="po-hero' + (F.k === "kick" ? " kick" : "") + '"><div class="po-k">' + F.ic + ' <b>' + F.t + '</b> · ' + F.s + ' · ' + md(P.start) + '부터</div>' +
      '<div class="po-big ' + cls(F.ret) + '">' + sg(F.ret) + '</div>' + (honV(F) != null ? '<div class="po-hon">' + honC(F) + '<small>' + (F.k === "kick" ? "돌파 칸은 다음 거래일 종가에 사고 비용을 뺀 값" : "주 1회만 비중을 맞추고 그때 비용을 뺀 값") + '</small></div>' : '') +
      '<div class="po-won">💰 ' + won(S.amt) + '원 넣었다면 <b class="' + cls(F.ret) + '">' + (F.ret >= 0 ? "+" : "−") + won(Math.abs(S.amt * F.ret / 100)) + '원</b>' +
        ' <small>S&P였다면 ' + (B["S&P500"][B["S&P500"].length - 1] >= 0 ? "+" : "−") + won(Math.abs(S.amt * B["S&P500"][B["S&P500"].length - 1] / 100)) + '원 · 금액은 📋 따라하기 투자금 기준</small></div>' +
      '<div class="po-sub">' + F.days + '거래일 · S&P500 대비 <b class="' + cls(ex) + '">' + sg(ex) + 'p</b> · 시장 ' + BM.length + '곳 중 <b>' + beat(F) + '</b>곳보다 앞섬 · 가장 크게 빠졌을 때 <b>' + sg(F.mdd) + '</b></div>' +
      '<div class="po-cmp n' + cmp.length + '">' + cmp.map(function(n){ var x = B[n][B[n].length - 1];
        return '<div style="border-top:3px solid ' + (BCOL[n] || "#8a94a8") + '"><small>' + e(n) + '</small><b class="' + cls(x) + '">' + sg(x) + '</b><em class="' + (F.ret >= x ? "w" : "l") + '">' + (F.ret >= x ? "포트가 앞섬" : "포트가 뒤짐") + '</em></div>'; }).join("") + '</div>' +
      '<div class="po-ch">' + V.lines([{name: F.ic + " " + F.t, color: F.color, vals: F.line}].concat(S.bsel.map(function(n){ return {name: n, color: BCOL[n] || "#8a94a8", vals: B[n], dash: 1}; })),
        P.dates.map(md), {h: 200, unit: "%", zero: 1, nodots: P.dates.length > 12, marks: marks(F)}) + '</div>' +
      '<div class="po-mk"><span><i style="background:#ffb84d"></i>비중·상품 바뀐 날</span>' + (F.k === "kick" ? '<span><i style="background:#4dd47a"></i>킥 사기</span><span><i style="background:#ff6b6b"></i>킥 팔기</span>' : '') + '</div>' +
      '<div class="po-w">S&P를 이긴 날 <b>' + F.win + ' / ' + F.days + '</b>' + (F.best ? ' · 가장 좋았던 날 ' + md(F.best.d) + ' <b class="up">' + sg(F.best.r) + '</b>' : '') + (F.worst ? ' · 가장 나빴던 날 ' + md(F.worst.d) + ' <b class="dn">' + sg(F.worst.r) + '</b>' : '') + '</div></section>';

    if (CN && CN.regime) h += concHtml();
    if (K && S.pf === "kick") h += kickHtml();

    // ② 따라하기
    var segs = P.hold.map(function(x, i){ return {label: x.name, v: x.pct, color: COL[i % COL.length]}; });
    h += '<div class="sec">📋 지금 이렇게 담으면 돼요 <small class="mut">' + md(P.changes[0] && P.changes[0].date) + ' 배분표 기준</small></div>' +
      '<section class="card po-follow">' + V.donut(segs, P.hold.length + "칸", "비중") +
      '<div class="po-in"><label>내 투자금</label><div class="po-amt"><input id="poamt" inputmode="numeric" value="' + S.amt.toLocaleString("ko-KR") + '"><span>원</span></div>' +
      '<div class="po-q">' + [3e6, 1e7, 3e7, 1e8].map(function(v){ return '<button data-v="' + v + '">' + won(v) + '</button>'; }).join("") + '</div>' +
      (K ? '<div class="po-mode po-pf"><button data-pf="base" class="' + (S.pf === "base" ? "on" : "") + '">💼 기본 포트</button><button data-pf="kick" class="' + (S.pf === "kick" ? "on" : "") + '">⚡ 킥 포함</button></div>' : '') +
      '<div class="po-mode"><button data-m="us" class="' + (S.mode === "us" ? "on" : "") + '">💵 외화 베이스</button><button data-m="kr" class="' + (S.mode === "kr" ? "on" : "") + '">₩ 원화 베이스</button></div></div>' +
      '<div id="porows"></div><div class="po-cp"><button class="btn" id="pocopy">📋 주문 목록 복사</button><span id="pocpst"></span></div>' +
      '<p class="note">환율 ' + (P.fx ? P.fx.toLocaleString("ko-KR") + "원" : "–") + ' · 주 수는 ' + md(P.asof) + ' 종가 기준 내림. <b>외화 베이스</b> = 미국 ETF를 달러로 · <b>원화 베이스</b> = 같은 걸 담은 한국 상장 ETF로 바꿔 원화로. 원화 상품이 없는 칸과 해외 개별 종목(🇭🇰 등)은 원화 베이스에서도 외화예요. ' +
      '<b>비중이 바뀐 날(아래 「비중 바뀐 날」)에만 고치면</b> 돼요.</p></section>';

    // ③ 비중 바뀐 날
    h += '<div class="sec">🔁 비중 바뀐 날</div><section class="card po-tl">' + P.changes.map(function(c, i){
      return '<div class="po-tli"><span class="d">' + md(c.date) + '</span><span class="t">' + e(c.why || "") + (i === 0 ? ' <em>지금</em>' : '') + '</span></div>'; }).join("") +
      (P.changes.length < 2 ? '<p class="note" style="margin:6px 0 0">' + md(P.start) + ' 이후 배분표가 그대로예요. 리포트가 비중을 바꾸면 여기에 쌓이고 알림이 가요.</p>' : '') + '</section>';

    // 🌏 해외 동종주 (market/peers.json) — 미국 강세 섹터와 같은 일을 하는 일·중·홍·대만·한국 종목을 달러 기준으로 비교
    if (PE && PE.themes && PE.themes.length) h += peersHtml();

    // ④ 칸별 기여
    var mx = Math.max.apply(null, P.hold.map(function(x){ return Math.abs(x.contrib) || 0.01; }));
    h += '<div class="sec">🧩 어느 칸이 벌고 잃었나 <small class="mut">' + md(P.start) + '부터 기여 %p · 칸별 신호(S&P 대비·20일선)</small></div><section class="card po-ct">' +
      P.hold.slice().sort(function(a, b){ return b.contrib - a.contrib; }).map(function(x){
        var i = P.hold.indexOf(x), w = Math.abs(x.contrib) / mx * 50;
        var us = x.us.map(function(u){ return '<span class="po-tk" data-op="' + e(u.t) + '">' + e(u.t) + '</span> ' + sg(u.since, 1); }).join(" · ");
        var sgc = /^강함/.test(x.sig || "") ? "g" : /^약함/.test(x.sig || "") ? "b" : /^꺾이/.test(x.sig || "") ? "w" : "";
        return '<div class="po-cr"><div class="n"><i style="background:' + COL[i % COL.length] + '"></i>' + e(x.name) + ' <small>' + x.pct + '%</small>' + (sgc ? ' <span class="po-sg ' + sgc + '">' + e(x.sig.split(" — ")[0]) + '</span>' : '') + '<em>' + us + '</em>' + (sgc ? '<em class="sgt">' + e((x.sig.split(" — ")[1] || "")) + '</em>' : '') + pvs(x.pick_vs) + '</div>' +
          '<div class="bar"><span class="' + (x.contrib >= 0 ? "p" : "m") + '" style="width:' + w.toFixed(1) + '%"></span></div><b class="' + cls(x.contrib) + '">' + sg(x.contrib) + 'p<small class="po-cw">' + (x.contrib >= 0 ? "+" : "−") + won(Math.abs(S.amt * x.contrib / 100)) + '원</small></b></div>'; }).join("") + '</section>';

    // ⑤ 날짜별
    var CNm = {}; if (CN && CN.dates) CN.dates.forEach(function(d, i){ CNm[d] = i; });
    h += '<div class="sec">📅 날짜별 성적</div><section class="card"><table class="po-dt"><tr><th>날짜(미국)</th><th>💼 기본</th>' + (K ? '<th>⚡ 킥</th>' : '') + (CN ? '<th>🎯 집중</th>' : '') + '<th>S&P500</th></tr>' +
      P.daily.slice().reverse().slice(0, 15).map(function(d){
        var j = K ? K.dates.indexOf(d.d) : -1, kr = j > 0 ? ((1 + K.kick[j] / 100) / (1 + K.kick[j - 1] / 100) - 1) * 100 : null;
        var tag = function(x){ return x == null ? '' : (x >= d.spy ? ' <em class="w">이김</em>' : ' <em class="l">짐</em>'); };
        var ci = CNm[d.d], cr = ci > 0 ? ((1 + CN.nav[ci] / 100) / (1 + CN.nav[ci - 1] / 100) - 1) * 100 : (ci === 0 ? CN.nav[0] : null);
        return '<tr><td>' + md(d.d) + '</td><td class="' + cls(d.r) + '">' + sg(d.r) + tag(d.r) + '</td>' + (K ? '<td class="' + cls(kr) + '">' + sg(kr) + tag(kr) + '</td>' : '') + (CN ? '<td class="' + cls(cr) + '">' + sg(cr) + tag(cr) + '</td>' : '') + '<td class="' + cls(d.spy) + '">' + sg(d.spy) + '</td></tr>'; }).join("") + '</table></section>' +
      '<p class="note">' + e(P.note) + ' 계산 ' + e(P.at) + (P.miss && P.miss.length ? ' · 시세 없음: ' + e(P.miss.join(", ")) : '') + '</p>';
    b.innerHTML = h;
    rows();
    var inp = document.getElementById("poamt");
    inp.oninput = function(){ var v = +inp.value.replace(/[^\d]/g, "") || 0; S.amt = v; keep(); rows(); };
    inp.onblur = function(){ inp.value = S.amt.toLocaleString("ko-KR"); };
    [].forEach.call(b.querySelectorAll(".po-q button"), function(x){ x.onclick = function(){ S.amt = +x.dataset.v; inp.value = S.amt.toLocaleString("ko-KR"); keep(); rows(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(x){ x.onclick = function(){ S.mode = x.dataset.m; keep();
      [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ S.pf = x.dataset.pf; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(x){ x.onclick = function(){ S.pf = x.dataset.p; keep();
      [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ S.pf = x.dataset.pf; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    document.getElementById("pocopy").onclick = copy;
    if (window.foldify) foldify(b);
    [].forEach.call(b.querySelectorAll("[data-bn]"), function(x){ x.onclick = function(){ var n = x.dataset.bn, i = S.bsel.indexOf(n);
      if (i >= 0){ if (S.bsel.length > 1) S.bsel.splice(i, 1); } else { S.bsel.push(n); if (S.bsel.length > 5) S.bsel.shift(); }
      keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll("[data-bg]"), function(x){ x.onclick = function(){ S.bg = x.dataset.bg; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
  }

  // ② 그래프 표시: 비중·상품 바뀐 날(노랑) · 킥 사기(초록)·팔기(빨강) — 「그때 그 판단이 맞았나」를 눈으로
  function marks(F){
    var out = [], idx = function(d){ var i = P.dates.indexOf(d); if (i < 0) for (var j = 0; j < P.dates.length; j++) if (P.dates[j] >= d){ i = j; break; } return i; };
    (P.changes || []).forEach(function(c){ var i = idx(c.date); if (i > 0) out.push({i: i, color: "#ffb84d", t: "🔁 " + md(c.date) + " 비중·상품 바뀜"}); });
    if (F.k === "kick" && K) (K.events || []).forEach(function(ev){ if (ev.k !== "사기" && ev.k !== "팔기") return; var i = idx(ev.d); if (i >= 0) out.push({i: i, color: ev.k === "사기" ? "#4dd47a" : "#ff6b6b", t: (ev.k === "사기" ? "🟢 사기 " : "🔴 팔기 ") + nm(ev.name) + (ev.r != null ? " " + sg(ev.r, 1) : "")}); });
    return out;
  }
  // 칸마다 무엇을 얼마나
  function wRows(){ return (K && K.whale && K.whale.rows || []).filter(function(r){ return r.on; }); }
  function kHold(){ return K && K.hold ? K.hold : (K ? K.open.map(function(o){ return {code: o.code, name: o.name, tags: "", w: o.w, r: o.r, now: o.now, rule: "손절 " + pr(o.stop)}; }) : []); }
  function kickW(){ return (K && S.pf === "kick") ? kHold().reduce(function(a, o){ return a + (o.w || 0); }, 0) : 0; }
  function plan(){
    var kw = kickW(), out;
    // 🧪 10/12부터 킥 포트: 기본 칸은 규칙 비중(국면 현금) × (1 − 돌파 − 고래), 킥에서 안 쓴 자리는 현금
    var RB = (kw && K.rule && K.rule.base_now) ? K.rule.base_now : null;
    var share = RB ? 1 - ((K.rules || {}).sleeve || 0) - ((K.rules || {}).whale_sleeve || 0) : 1;
    var spare = RB ? Math.max(0, (1 - share) * 100 - kw) : 0;
    out = P.hold.map(function(x, i){
      var pct = RB ? (RB[x.name] != null ? RB[x.name] : x.pct) * share + (/현금/.test(x.name) ? spare : 0) : x.pct - (kw && /현금/.test(x.name) ? kw : 0);
      x = Object.assign({}, x, {pct: Math.round(pct * 10) / 10});
      var amt = S.amt * x.pct / 100, items = [];
      var kr = (x.kr || []).filter(function(k){ return k.etf; });
      if (S.mode === "kr" && kr.length){
        var k = kr[0];
        items.push({nm: k.name, code: k.code, amt: amt, sh: k.px ? Math.floor(amt / k.px) : null, px: k.px, cur: "원"});
      } else {
        var us = x.us.filter(function(u){ return u.px; }), each = us.length ? amt / us.length : 0;
        us.forEach(function(u){
          if (u.cur && u.cur !== "달러"){      // 🌏 미국 밖 종목: 원화 환산가(krw)로 주 수
            items.push({nm: u.name || u.t, code: u.t, amt: each, sh: u.krw ? Math.floor(each / u.krw) : null, px: u.px, cur: "원", fx: u.cur, r1: u.r1}); return; }
          var usd = P.fx ? each / P.fx : null;
          items.push({nm: u.name || u.t, code: u.t, amt: each, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$", r1: u.r1}); });
      }
      return {x: x, i: i, amt: amt, items: items};
    });
    if (kw) out.push({x: {name: "⚡ 킥", pct: Math.round(kw * 10) / 10}, i: -1, amt: S.amt * kw / 100, kick: 1, items: kHold().map(function(o){
      var a = S.amt * o.w / 100, kr = /^\d{6}\.K[SQ]$/.test(o.code), us = /^[A-Z\-]+$/.test(o.code);
      var usd = us && P.fx ? a / P.fx : null;
      return {tags: o.tags || "", short: nm(o.name), nm: (o.tags ? o.tags + " " : "") + nm(o.name), code: o.code, amt: a, usd: usd, cur: us ? "$" : kr ? "원" : "현지", sh: us ? (usd && o.now ? Math.floor(usd / o.now) : null) : kr ? Math.floor(a / o.now) : null,
              note: o.rule || ""}; })});
    return out;
  }
  function rows(){
    var box = document.getElementById("porows"); if (!box) return;
    box.innerHTML = plan().map(function(p){
      if (p.kick) return kickRow(p);
      return '<div class="po-r' + (p.kick ? ' po-rk' : '') + '"><div class="po-rh"><i style="background:' + (p.kick ? "#ff6b6b" : COL[p.i % COL.length]) + '"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        p.items.map(function(it){
          return '<div class="po-it" data-op="' + e(it.code) + '"><span class="tk">' + e(it.nm) + (it.code !== it.nm ? ' <small>' + e(it.code) + '</small>' : '') + ' <i class="po-go">›</i></span>' +
            '<span class="v">' + (it.cur === "$" ? (it.usd != null ? '$' + Math.round(it.usd).toLocaleString("en-US") + ' · ' : '') : won(it.amt) + '원 · ') +
            (it.sh != null ? '<b>' + it.sh.toLocaleString("ko-KR") + '주</b>' : it.cur === "현지" ? '현지 통화로' : '가격 확인') + (it.fx ? ' <small class="po-fx">' + flag(it.code) + ' ' + e(it.fx) + '</small>' : '') + '</span></div>' +
            (it.note ? '<div class="po-itn">' + e(it.note) + '</div>' : ''); }).join("") +
          (p.kick && !p.items.length ? '<div class="po-itn">지금 빈 자리 — 신호가 뜨면 3%씩 들어가요 (그때까지 현금)</div>' : '') + '</div>';
    }).join("");
  }
  // ⚡ 킥 칸은 간단히: 신호별 개수 한 줄 + 종목 칩(이모티콘·이름·주 수) · 규칙·손절은 「킥」 카드에서
  function kickRow(p){
    var cnt = {}; p.items.forEach(function(it){ (it.tags.match(/\p{Extended_Pictographic}/gu) || ["·"]).forEach(function(t){ cnt[t] = (cnt[t] || 0) + 1; }); });
    var lab = {"🐋": "고래", "☕": "컵", "📈": "갭", "🤫": "매집", "🧪": "시험"};
    var sum = Object.keys(cnt).filter(function(t){ return lab[t]; }).map(function(t){ return t + ' ' + lab[t] + ' ' + cnt[t]; }).join(' · ');
    return '<div class="po-r po-rk"><div class="po-rh"><i style="background:#ff6b6b"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
      (p.items.length ? '<div class="po-ksum">' + p.items.length + '종목 · 한 종목 약 ' + won(p.amt / p.items.length) + '원' + (sum ? ' · ' + sum : '') + '</div><div class="po-kg">' +
        p.items.map(function(it){
          var q = it.sh ? it.sh.toLocaleString("ko-KR") + '주' : it.cur === "현지" ? won(it.amt) + '원' : '<span class="po-k0">1주 안 됨</span>';
          return '<span class="po-kc" data-op="' + e(it.code) + '"><i>' + e(it.tags.replace(/🧪/g, "")) + '</i><b>' + e(it.short) + '</b><small>' + q + '</small></span>'; }).join("") + '</div>' +
        '<div class="po-kl" data-goto="port~pokick">손절·익절 규칙과 수익은 ⚡ 킥 카드에서 ›</div>'
      : '<div class="po-itn">지금 빈 자리 — 신호가 뜨면 3%씩 들어가요 (그때까지 현금)</div>') + '</div>';
  }
  function nm(x){ return String(x || "").replace(/,? (Inc\.?|Corp\.?|Corporation|Ltd\.?|Company|plc|N\.V\.|S\.A\.|ASA)?\s*(Common Stock|Ordinary Shares|Class [A-Z].*|American Depositary.*)$/i, "").replace(/,? (Inc\.?|Corporation|Corp\.?|Ltd\.?)$/i, "").trim(); }
  function pr(v){ return v == null ? "–" : (+v).toLocaleString("ko-KR", {maximumFractionDigits: v >= 1000 ? 0 : 2}); }
  function flag(t){ t = String(t || ""); return /\.T$/.test(t) ? "🇯🇵" : /\.K[SQ]$/.test(t) ? "🇰🇷" : /\.HK$/.test(t) ? "🇭🇰" : /\.(SS|SZ)$/.test(t) ? "🇨🇳" : "🇺🇸"; }
  function pvs(v){
    if (!v) return '';
    if (v.pending || v.edge == null) return '<em class="pvs">🌏 ' + md(v.since) + ' 고른 상품 — 다음 거래일부터 원래 상품(' + e((v.base || []).join("·")) + ')과 비교</em>';
    return '<em class="pvs">🌏 고른 상품 ' + sg(v.pick, 1) + ' vs 원래 ' + e((v.base || []).join("·")) + ' ' + sg(v.base_r, 1) + ' → <b class="' + (v.edge >= 0 ? "w" : "l") + '">' + (v.edge >= 0 ? "앞섬 " : "뒤짐 ") + sg(v.edge, 1).replace("%", "p") + '</b> · ' + v.days + '일</em>';
  }
  function peersHtml(){
    var held = {}; P.hold.forEach(function(x){ (x.picks || []).forEach(function(t){ held[t] = x.name; }); });
    var vc = function(v){ return /편입/.test(v) ? "g" : /매매 불가/.test(v) ? "n" : /과열/.test(v) ? "w" : /약함/.test(v) ? "b" : ""; };
    var h = '<div class="sec">🌏 미국 강세 섹터 × 해외 동종주 <small class="mut">3개월 달러 수익 · 위험 대비 · 과열 — 이기는 쪽을 포트에 담아요</small></div><section class="card po-pe">';
    h += PE.themes.map(function(T, ti){
      var et = T.etf || {}, all = T.rows || [], rows = all;
      var inP = rows.filter(function(r){ return held[r.t]; }).length;
      return '<details' + (ti < 2 || inP ? ' open' : '') + '><summary><b>' + e(T.name) + '</b>' + (inP ? ' <span class="po-sg g">포트 ' + inP + '</span>' : '') +
        '<em>' + (/^미국/.test(et.t || "") ? '' : '미국 기준 ') + e(et.t || "") + ' 3개월 <b class="' + cls(et.r3) + '">' + sg(et.r3, 0) + '</b></em></summary>' +
        rows.map(function(r, ri){ var mine = held[r.t];
          return '<div class="po-per' + (mine ? " mine" : "") + (ri >= 8 && !mine ? " more" : "") + (r.nobuy ? " nb" : "") + '" data-op="' + e(r.t) + '"><span class="n">' + flag(r.t) + ' ' + e(r.name) + (mine ? ' <span class="po-sg g">✓ 담음</span>' : '') +
            '<small>' + e(r.t) + ' · 1개월 ' + sg(r.r1, 0) + ' · 낙폭 ' + sg(r.mdd, 0) + (r.ma50 ? ' · 50일선 위' : ' · 50일선 아래') + (r.nobuy ? ' · 🔒 ' + e(r.nobuy) : '') + '</small></span>' +
            '<span class="r"><b class="' + cls(r.r3) + '">' + sg(r.r3, 0) + '</b><small>vs 미국 ' + (r.ex3 >= 0 ? "+" : "") + Math.round(r.ex3) + 'p</small></span>' +
            '<span class="po-sg ' + vc(r.verdict || "") + '">' + e(r.verdict || "") + '</span></div>'; }).join("") +
          (all.length > 8 ? '<button class="po-more" onclick="this.parentNode.classList.toggle(\'all\');this.textContent=this.parentNode.classList.contains(\'all\')?\'접기\':\'전체 ' + all.length + '개 보기\'">전체 ' + all.length + '개 보기</button>' : '') + '</details>'; }).join("");
    return h + '<p class="note">' + e(PE.note || "") + ' · ' + e(PE.at || "") + ' · 「✓ 담음」 = 지금 포트 칸의 상품. 🔒 = 창업판·과창판이라 비교만 해요. 리포트가 매일 아침 이 표로 칸마다 가장 나은 상품을 고르고 바꾸면 「비중 바뀐 날」에 남아요.</p></section>';
  }
  // 🎯 집중 포트 카드 (10/11 사용자: "선택과 집중 — 오르는 시장이면 벌 때 벌어야, 단 오르는 시장 판단이 먼저")
  function concHtml(){
    var R = CN.regime, up = R.up, bt = CN.bt || {}, o = bt.oos || {}, so = bt.spy_oos || {}, ii = bt.is || {}, cu = bt.cur_oos || {};
    var h = '<div class="sec">🎯 집중 포트 <small class="mut">오르는 시장이면 벌 때 번다 · 검증한 규칙 그대로</small></div><section class="card cn-c">' +
      '<div class="cn-rg ' + (up ? "g" : "r") + '"><div class="cn-l">' + (up ? "🟢 오르는 시장" : "🔴 오르는 시장 아님") + '</div>' +
        '<div class="cn-s">S&P500 ' + (R.spx || 0).toLocaleString("en-US") + ' · 200일선보다 <b>' + sg(R.gap, 1) + '</b> · ' + md(R.since) + '부터' +
        (R.kospi_up != null ? ' · 코스피 ' + (R.kospi_up ? "🟢" : "🔴") + ' (' + sg(R.kospi_gap, 1) + ')' : '') + '</div>' +
        (R.raw_today !== up ? '<div class="cn-w">⚠ 오늘 종가는 반대쪽 — 3거래일 이어지면 판정이 바뀌어요</div>' : '') + '</div>' +
      '<div class="cn-h">지금 담을 것 <small>' + won(S.amt) + '원 기준 · 다음 거래일 종가</small></div>' +
      (CN.now || []).map(function(x){ return '<div class="cn-r"><b>' + x.pct + '%</b><span>' + e(x.name) + ' <small>' + (x.t === "BIL" ? "SGOV" : '<span class="po-tk" data-op="' + e(x.t) + '">' + e(x.t) + '</span>') + ' · ₩ ' + e(x.kr.name) + ' ' + e(x.kr.code) + '</small></span><em>' + won(S.amt * x.pct / 100) + '원</em></div>'; }).join("") +
      '<div class="cn-h">' + md(CN.start) + '부터 <small>비용 포함 · 달러 기준</small></div>' +
      '<div class="cn-v">' + [["🎯 집중", CN.ret], ["💼 기본", CN.base], ["⚡ 킥", CN.kick], ["S&P500", CN.spy_ret], ["나스닥100", CN.qqq_ret]].map(function(x){
        return '<div' + (x[0] === "🎯 집중" ? ' class="me"' : '') + '><small>' + x[0] + '</small><b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b></div>'; }).join("") + '</div>';
    if (o.cagr != null){
      h += '<div class="cn-h">검증 — 규칙 고를 때 안 본 ' + e((bt.period || [])[0] || "").slice(0, 4) + '~' + e((bt.period || [])[1] || "").slice(0, 4) + ' <small>다음 날 체결·비용 포함</small></div>' +
        '<table class="cn-t"><tr><th></th><th>연수익</th><th>최대 낙폭</th><th>이긴 해</th></tr>' +
        '<tr class="me"><td>🎯 이 규칙</td><td class="up">' + sg(o.cagr, 1) + '</td><td>' + sg(o.mdd, 0) + '</td><td>' + o.beat_years + '/' + o.years + '</td></tr>' +
        '<tr><td>S&P500</td><td>' + sg(so.cagr, 1) + '</td><td>' + sg(so.mdd, 0) + '</td><td>–</td></tr>' +
        (cu.cagr != null ? '<tr><td>현금 26% 늘 들기<br><small>지금 기본 포트 닮은꼴</small></td><td class="dn">' + sg(cu.cagr, 1) + '</td><td>' + sg(cu.mdd, 0) + '</td><td>' + cu.beat_years + '/' + cu.years + '</td></tr>' : '') + '</table>' +
        '<p class="cn-n">S&P보다 연 <b class="' + cls(o.ex) + '">' + sg(o.ex, 1) + 'p</b> · 낙폭은 ' + Math.abs((o.mdd || 0) - (so.mdd || 0)).toFixed(0) + '%p 작게' + (ii.ex != null ? ' · 규칙 고른 2008~2016에서도 ' + sg(ii.ex, 1) + 'p' : '') + '</p>';
      if (bt.yr){
        var ys = Object.keys(bt.yr).filter(function(y){ return y >= "2017"; });
        var mx = Math.max.apply(null, ys.map(function(y){ return Math.max(Math.abs(bt.yr[y][0]), Math.abs(bt.yr[y][1])); }).concat([1]));
        h += '<div class="cn-yr">' + ys.map(function(y){ var a = bt.yr[y][0], b2 = bt.yr[y][1], w = a >= b2;
          return '<div><span>' + y.slice(2) + '</span><i class="a ' + (a < 0 ? "m" : "") + '" style="height:' + (Math.abs(a) / mx * 34).toFixed(0) + 'px"></i><i class="b" style="height:' + (Math.abs(b2) / mx * 34).toFixed(0) + 'px"></i><em class="' + (w ? "w" : "l") + '">' + (w ? "●" : "○") + '</em></div>'; }).join("") + '</div>' +
          '<div class="cn-lg"><span><i class="a"></i>🎯 규칙</span><span><i class="b"></i>S&P500</span><span>● 이긴 해</span></div>';
      }
    }
    h += '<details class="cn-d"><summary>왜 이 규칙인가 · 규칙 그대로</summary><p>' +
      '「강한 섹터 2~3개에 몰기」는 2017년 이후 576가지 조합 중 2~7%만 S&P를 이겼어요(섹터를 늦게 타고 늦게 내림 + 비용). 지는 가장 큰 이유는 상승장에서도 현금·금을 크게 들고 있는 것이었어요. ' +
      '그래서 「섹터」가 아니라 「시장에 싣는 양」에 집중합니다. 상승장 판정은 평균 수익을 올리기보다 나쁜 꼬리(20일 최악 10%: −3.6% vs −7%)를 절반으로 줄여요.</p>' +
      '<p><b>판정</b> ' + e(CN.rule.judge) + '<br>' + e(CN.rule.on) + '<br>' + e(CN.rule.off) + '<br><small>' + e(CN.rule.how) + '</small></p>' +
      ((R.flips || []).length ? '<p><b>판정이 바뀐 날</b><br>' + R.flips.map(function(f){ return (f.up ? "🟢 " : "🔴 ") + e(f.d); }).join(" · ") + '</p>' : '') +
      '<p class="mut">' + e(CN.note) + ' 계산 ' + e(CN.at) + '</p></details></section>';
    return h;
  }

  function kickHtml(){
    var ks = K.stat, d = ks.kick - ks.base, rows2;
    var h = '<div class="sec">⚡ 킥 칸 속 <small class="mut">킥 포트에만 있는 ' + Math.round((((K.rules || {}).sleeve || 0) + ((K.rules || {}).whale_sleeve || 0)) * 100) + '% · 기본 포트보다 ' + sg(d) + 'p</small></div><section class="card po-vs">' +
      '<div class="po-ks">' + (K.whale ? '<span>🐋 들어온 고래 종목 <b class="' + cls(K.whale.ret) + '">' + sg(K.whale.ret) + '</b></span><span>☕📈 돌파 종목 <b class="' + cls(K.sleeve) + '">' + sg(K.sleeve) + '</b></span>' : '<span>슬리브 <b class="' + cls(K.sleeve) + '">' + sg(K.sleeve) + '</b></span>') + '<span>자리 <b>' + ks.slots + '</b></span><span>끝난 거래 <b>' + ks.trades + '</b>' +
      (ks.win != null ? ' · 이긴 비율 <b>' + ks.win + '%</b>' : '') + '</span>' + (ks.avg_win != null ? '<span>이길 때 <b class="up">' + sg(ks.avg_win, 1) + '</b> · 질 때 <b class="dn">' + sg(ks.avg_loss, 1) + '</b></span>' : '') +
      (ks.paused ? '<span class="warn">⛔ 브레이크 중 (새 진입 멈춤)</span>' : '') + '</div>';
    if (K.rule && K.rule.base_now){
      var R = K.rule, P0 = {}; P.hold.forEach(function(x){ P0[x.name] = x.pct; });
      var cashN = Object.keys(R.base_now).filter(function(n){ return /현금/.test(n); })[0];
      h += '<div class="po-rule"><b>🧪 ' + md(R.from) + '부터 킥 포트 규칙</b> <small>검증을 통과한 것만 · 💼 기본 포트(리포트 그대로)와 S&P500에 견줘요</small>' +
        '<div>① 현금 = 국면 「' + e(R.quad || "") + '」 → <b>' + R.cash + '%</b>' + (cashN ? ' <span class="mut">(리포트 ' + P0[cashN] + '%)</span>' : '') + '</div>' +
        '<div>② 🐋 고래 바스켓 <b>' + Math.round((R.whale_sleeve || 0) * 100) + '%</b> <span class="mut">(전 6%)</span> · 돌파 ' + Math.round(((K.rules || {}).sleeve || 0) * 100) + '%</div>' +
        '<div class="mut">③ 강한 칸 기울이기 · ④ 추세 브레이크는 2008년~ 검증에서 효과가 없어 꺼 둠 · 📊 실적 갭은 그림자 채점부터</div>' +
        '<div class="po-rl" data-goto="score~scrbt">검증 결과 보기 ›</div></div>';
    }
    if (K.proof) h += '<div class="po-pf3">' + [["whale", "🐋 고래"], ["cup", "☕ 컵"], ["gap", "📈 갭"], ["accum", "🤫 매집"], ["earn", "📊 실적"]].map(function(x){ var p = K.proof[x[0]] || {};
      var ho = p.honest, ht = ho && ho.n && ho.avg != null ? "<br>🧾 정직 " + (ho.avg > 0 ? "+" : "") + ho.avg.toFixed(1) + "% · " + ho.n + "건" + (ho.pf != null ? " · 손익비 " + ho.pf : "") + (ho.pf != null && ho.pf < 1.5 ? " ⚠ 정직 기준 미달" : "") + (ho.insample ? " · 같은 자료로 맞춘 값" : "") : p.fixed ? "<br>4분기 표본·고정 판정" : "";
      return '<span class="' + (p.trial ? "trial" : p.on ? "on" : "wait") + '" data-tip="' + e((p.why || "") + ht) + '">' + x[1] + ' ' + (p.trial ? '🧪 시험 ½' : p.on ? '✓' : '⏳ ' + (p.n || 0) + '/20') + (ho && ho.n && ho.avg != null ? ' <small class="' + cls(ho.avg) + '">정직 ' + sg(ho.avg, 1) + '</small>' : '') + '</span>'; }).join("") + '</div>';
    if (K.shadow_stat && Object.keys(K.shadow_stat).length) h += '<div class="po-itn" style="padding-left:0">👻 못 들어온 신호도 「들어갔다면」으로 계속 채점 — ' + Object.keys(K.shadow_stat).map(function(k){ var v = K.shadow_stat[k];
      return e(v.tag || k) + ' ' + v.n + '건 평균 ' + sg(v.avg, 1); }).join(" · ") + ' (20건·손익비 1.5 넘으면 자동 편입)</div>';
    var HL = kHold();
    h += '<div class="po-kh">지금 들고 있는 것 <small>' + HL.length + '종목</small></div>' + (HL.length ? HL.map(function(o){
      return '<div class="po-kp" data-op="' + e(o.code) + '"><div><span class="po-tg">' + e(o.tags || "") + '</span> <b>' + e(nm(o.name)) + ' <i class="po-go">›</i></b> <small>' + e(o.code) + ' · ' + (Math.round(o.w * 10) / 10) + '%</small>' + (o.half ? ' <span class="po-sg w">절반 익절</span>' : '') +
        '<em>' + md(o.d0) + ' 진입 ' + pr(o.entry) + ' · ' + e(o.rule || "") + (o.by && o.by.length ? ' · ' + e(o.by.join(", ")) : '') + '</em></div><b class="' + cls(o.r) + '">' + sg(o.r, 1) + '<small class="po-cw">' + (o.r >= 0 ? "+" : "−") + won(Math.abs(S.amt * o.w / 100 * o.r / 100)) + '원</small></b></div>'; }).join("")
      : '<div class="po-itn">빈 자리 — 확인된 신호를 기다리는 중</div>');
    if (K.tags) h += '<p class="po-itn" style="padding-left:0">' + Object.keys(K.tags).map(function(k){ return k + ' ' + e(K.tags[k]); }).join(" · ") + '</p>';
    if (K.closed.length) h += '<div class="po-kh">끝난 거래</div>' + K.closed.slice(0, 8).map(function(c){
      return '<div class="po-kp" data-op="' + e(c.code) + '"><div><b>' + e(nm(c.name)) + ' <i class="po-go">›</i></b> <small>' + e(c.code) + '</small><em>' + md(c.d0) + '→' + md(c.d1) + ' · ' + c.days + '일 · ' + e(c.why) + '</em></div><b class="' + cls(c.r) + '">' + sg(c.r, 1) + '</b></div>'; }).join("");
    h += '<p class="note">' + e(K.note) + '</p></section>';
    return h;
  }
  function copy(){
    var t = "💼 CH Investing 포트 따라하기 (" + md(P.changes[0] && P.changes[0].date) + " 배분표 · 투자금 " + won(S.amt) + "원)\n" +
      plan().map(function(p){ return "· " + p.x.name + " " + p.x.pct + "% (" + won(p.amt) + "원): " + p.items.map(function(it){ return it.nm + (it.sh != null ? " " + it.sh + "주" : ""); }).join(", "); }).join("\n") +
      "\n※ 매수 추천 아님 · 리포트 배분표를 그대로 옮긴 계산";
    var ok = function(){ var s = document.getElementById("pocpst"); if (s){ s.textContent = "복사됐어요 ✓"; setTimeout(function(){ s.textContent = ""; }, 2500); } };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok).catch(function(){ prompt("복사하세요", t); });
    else prompt("복사하세요", t);
  }

  var css = document.createElement("style");
  css.textContent =
    ".po-hero{background:linear-gradient(160deg,rgba(233,196,106,.16),rgba(18,24,38,.4) 60%);border:1px solid var(--line);border-radius:18px;padding:16px 14px;margin-bottom:6px}" +
    ".po-hon{margin:-2px 0 6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.po-hon small{font-size:11px;color:var(--sub)}.po-lbs .hon-chip{display:flex;width:max-content;margin:2px 0 0;font-size:10.5px}" +
    ".po-k{font-size:13px;color:var(--sub)}.po-big{font-size:44px;font-weight:900;letter-spacing:-1px;line-height:1.1;margin:4px 0}" +
    ".po-sub{font-size:13.5px;color:var(--sub)}.po-sub b{color:var(--text)}" +
    ".po-cmp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 8px}.po-cmp>div{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px}" +
    ".po-cmp small{display:block;font-size:11.5px;color:var(--sub)}.po-cmp b{font-size:16px}.po-cmp em{display:block;font-style:normal;font-size:11px;margin-top:2px}" +
    ".po-ksum{font-size:12.5px;color:var(--sub);margin:2px 0 8px}" +
    ".po-kg{display:grid;grid-template-columns:1fr 1fr;gap:6px}" +
    ".po-kc{display:flex;align-items:center;gap:4px;min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:7px 8px;cursor:pointer}" +
    ".po-kc i{font-style:normal;font-size:12px;flex:none}.po-kc b{font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".po-kc small{flex:none;font-size:12px;font-weight:700}.po-k0{color:var(--sub);font-weight:400;font-size:11px}" +
    ".po-kl{font-size:12.5px;color:var(--accent,#e9c46a);margin-top:8px;cursor:pointer}" +
    "em.w{color:#4dd47a;font-style:normal}em.l{color:#8a94a8;font-style:normal}" +
    ".po-ch{margin-top:6px}.po-w{font-size:12.5px;color:var(--sub);margin-top:4px}" +
    ".po-follow .dn-w{margin-bottom:10px}.po-in label{font-size:13px;color:var(--sub)}" +
    ".po-amt{display:flex;align-items:center;gap:6px;margin-top:4px}.po-amt input{flex:1;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:10px 12px;font:inherit;font-size:22px;font-weight:800;text-align:right;min-width:0}" +
    ".po-q,.po-mode{display:flex;gap:6px;margin-top:8px}.po-q button,.po-mode button{flex:1;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 4px;font:inherit;font-size:13px;cursor:pointer}" +
    ".po-mode button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:800}" +
    ".po-r{border-top:1px solid var(--line);padding:10px 0}.po-r:first-child{margin-top:12px}" +
    ".po-rh{display:flex;align-items:center;gap:7px}.po-rh i{width:10px;height:10px;border-radius:3px;flex:none}.po-rh b{flex:1;font-size:15px}.po-rh .pct{color:var(--sub);font-size:13px}.po-rh .am{font-weight:800;min-width:64px;text-align:right}" +
    ".po-it{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;padding:4px 0 0 17px}.po-it .tk small{color:var(--dim)}.po-it .v{color:var(--sub);white-space:nowrap}.po-it .v b{color:var(--text)}" +
    ".po-cp{display:flex;align-items:center;gap:10px;margin-top:10px}.po-cp span{font-size:13px;color:#4dd47a}" +
    ".po-tli{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px}.po-tli:last-of-type{border-bottom:0}.po-tli .d{font-weight:800;min-width:42px}.po-tli em{background:#e9c46a;color:#111;border-radius:6px;padding:0 6px;font-style:normal;font-size:11px;font-weight:800}" +
    ".po-cr{display:grid;grid-template-columns:1fr 34% 58px;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}.po-cr:last-child{border-bottom:0}" +
    ".po-cr .n{font-size:13.5px}.po-cr .n i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}.po-cr .n small{color:var(--sub)}.po-cr .n em{display:block;font-style:normal;font-size:11px;color:var(--dim)}" +
    ".po-cr .bar{position:relative;height:10px;background:var(--panel2);border-radius:5px}.po-cr .bar span{position:absolute;top:0;bottom:0;border-radius:5px}" +
    ".po-cr .bar .p{left:50%;background:#e66767}.po-cr .bar .m{right:50%;background:#3987e5}.po-cr>b{text-align:right;font-size:13px}" +
    ".po-sg{font-size:10.5px;font-weight:800;border-radius:5px;padding:0 5px;margin-left:3px}.po-sg.g{background:rgba(77,212,122,.18);color:#4dd47a}.po-sg.b{background:rgba(57,135,229,.2);color:#7cb0ff}.po-sg.w{background:rgba(255,184,77,.18);color:#ffb84d}.po-cr .n em.sgt{color:var(--sub)}" +
    ".po-vs2{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:6px;margin-bottom:8px}.po-vs2>div{background:var(--panel2);border-radius:12px;padding:8px;text-align:center}.po-vs2>div.k{background:rgba(255,107,107,.13);border:1px solid rgba(255,107,107,.4)}" +
    ".po-vs2 small{display:block;font-size:11.5px;color:var(--sub)}.po-vs2 b{font-size:19px}.po-vs2 em{display:block;font-style:normal;font-size:11px}" +
    ".po-ks{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:6px 0}.po-ks b{color:var(--text)}.po-ks .warn{color:#ffb84d}" +
    ".po-kh{font-size:12.5px;font-weight:800;color:var(--sub);margin:12px 0 2px}.po-kp{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}.po-kp small{color:var(--dim)}.po-kp em{display:block;font-style:normal;font-size:11.5px;color:var(--sub)}" +
    ".po-itn{font-size:11.5px;color:var(--dim);padding:2px 0 0 17px}.po-rk{background:rgba(255,107,107,.06);border-radius:10px;padding:10px 6px}" +
    ".po-mx table{width:100%;border-collapse:collapse;font-size:12.5px}.po-mx td,.po-mx th{white-space:nowrap}.po-mx th{font-size:11px;color:var(--sub);font-weight:600;text-align:right;padding:3px}.po-mx th:first-child{text-align:left}" +
    ".po-mx td{text-align:right;padding:8px 3px;border-top:1px solid var(--line);vertical-align:top}.po-mx td:first-child{text-align:left;font-weight:800;white-space:nowrap}.po-mx td small{display:block;font-weight:400;font-size:10.5px;color:var(--sub)}" +
    ".po-mx td em{display:block;font-style:normal;font-size:10.5px}.po-mx tr[data-pf]{cursor:pointer}.po-mx tr.on td{background:rgba(233,196,106,.08)}.po-mx tr.mkt td{color:var(--sub);font-size:12px}" +
    ".po-pf2{margin:12px 0 8px}.po-hero.kick{background:linear-gradient(160deg,rgba(255,107,107,.16),rgba(18,24,38,.4) 60%)}" +
    ".po-go{font-style:normal;color:var(--c,#e9c46a);font-weight:800;margin-left:2px}.po-it[data-op],.po-kp[data-op],.po-tk{cursor:pointer}.po-tk{text-decoration:underline dotted;text-underline-offset:2px;color:var(--text)}" +
    ".po-it[data-op]:active,.po-kp[data-op]:active{background:rgba(255,255,255,.05)}" +
    ".po-lbs{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:6px}.po-lbs button{text-align:left;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:12px;padding:8px 10px;font:inherit;cursor:pointer}" +
    ".po-lbs button.on{border-color:#e9c46a;background:rgba(233,196,106,.1)}.po-lbs button.k.on{border-color:#ff6b6b;background:rgba(255,107,107,.1)}.po-lbs small{display:block;font-size:11.5px;color:var(--sub)}.po-lbs b{font-size:20px}" +
    ".po-lbs em{display:block;font-style:normal;font-size:11.5px;color:var(--sub);margin-top:2px}.po-lbs em b{font-size:12px;color:var(--text)}.po-wbar{display:block;height:5px;border-radius:3px;background:var(--panel);margin:3px 0 2px;overflow:hidden}.po-wbar i{display:block;height:100%;background:#4dd47a}" +
    ".cn-rg{border-radius:12px;padding:10px 12px;margin-bottom:10px}.cn-rg.g{background:rgba(77,212,122,.12)}.cn-rg.r{background:rgba(255,107,107,.12)}.cn-l{font-weight:800;font-size:17px}.cn-s{font-size:12.5px;color:var(--sub);margin-top:3px}.cn-w{font-size:12px;color:#ffb84d;margin-top:4px}" +
    ".cn-h{font-weight:800;font-size:13.5px;margin:12px 0 6px}.cn-h small{font-weight:400;color:var(--sub);font-size:11.5px;margin-left:4px}" +
    ".cn-r{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--line)}.cn-r>b{font-size:17px;min-width:44px}.cn-r>span{flex:1;font-size:14px}.cn-r small{display:block;color:var(--sub);font-size:11.5px}.cn-r em{font-style:normal;font-weight:700;font-size:13px}" +
    ".cn-v{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}.cn-v div{background:var(--panel2);border-radius:9px;padding:6px 2px;text-align:center}.cn-v div.me{outline:2px solid #4dd47a}.cn-v small{display:block;font-size:10.5px;color:var(--sub)}.cn-v b{font-size:13px}" +
    ".cn-t{width:100%;border-collapse:collapse;font-size:12.5px}.cn-t th{color:var(--sub);font-weight:400;text-align:right;padding:4px}.cn-t td{text-align:right;padding:5px 4px;border-top:1px solid var(--line)}.cn-t td:first-child,.cn-t th:first-child{text-align:left}.cn-t tr.me td{font-weight:800}.cn-t small{color:var(--sub);font-weight:400}" +
    ".cn-n{font-size:12.5px;margin:6px 0 0}.cn-yr{display:flex;gap:3px;align-items:flex-end;margin-top:10px;height:62px}.cn-yr div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:1px;position:relative}" +
    ".cn-yr i{display:block;width:40%;border-radius:2px}.cn-yr i.a{background:#4dd47a}.cn-yr i.a.m{background:#4dd47a;opacity:.4}.cn-yr i.b{background:#7c9cff;opacity:.6}.cn-yr div{flex-direction:row;align-items:flex-end}.cn-yr span{position:absolute;bottom:-14px;font-size:9.5px;color:var(--sub)}.cn-yr em{position:absolute;top:-2px;font-size:8px;font-style:normal}.cn-yr em.w{color:#4dd47a}.cn-yr em.l{color:var(--sub)}" +
    ".cn-lg{display:flex;gap:12px;font-size:11px;color:var(--sub);margin-top:18px}.cn-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:3px;vertical-align:-1px}.cn-lg i.a{background:#4dd47a}.cn-lg i.b{background:#7c9cff;opacity:.6}" +
    ".cn-d{margin-top:10px;font-size:12.5px}.cn-d summary{cursor:pointer;color:var(--acc);font-weight:700}.cn-d p{margin:6px 0;line-height:1.55}" +
    ".po-chips{display:flex;gap:5px;overflow-x:auto;margin:10px 0 4px;scrollbar-width:none}.po-chips::-webkit-scrollbar{display:none}.po-chips button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;cursor:pointer}.po-chips button.on{background:var(--text);color:var(--bg,#111);border-color:transparent;font-weight:800}" +
    ".po-rr{display:grid;grid-template-columns:16px minmax(0,1fr) 14% 54px 58px;align-items:center;gap:6px;padding:7px 2px;border-bottom:1px solid var(--line);font-size:13.5px;cursor:pointer}.po-rr:last-child{border-bottom:0}" +
    ".po-rr .no{font-size:11px;color:var(--dim);text-align:right}.po-rr .n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.po-rr .n small{display:block;font-size:10.5px;color:var(--dim)}" +
    ".po-rr .dot{display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid var(--dim);margin-right:5px;vertical-align:0}.po-rr.sel .dot{border-color:transparent}" +
    ".po-rr .bar{position:relative;height:9px;background:var(--panel2);border-radius:5px}.po-rr .bar span{position:absolute;top:0;bottom:0;border-radius:5px}.po-rr .bar .p{left:50%;background:#e66767}.po-rr .bar .m{right:50%;background:#3987e5}" +
    ".po-rr .v{text-align:right;font-size:13px}.po-rr .d{text-align:right;font-size:10.5px}.po-rr .d.w{color:#4dd47a}.po-rr .d.l{color:var(--dim)}" +
    ".po-rr.me{background:rgba(233,196,106,.1);border-radius:10px;border-bottom-color:transparent;margin:2px 0}.po-rr.me.k{background:rgba(255,107,107,.1)}.po-rr.me.on{outline:1.5px solid #e9c46a}.po-rr.me.k.on{outline-color:#ff6b6b}" +
    ".po-cmp.n4{grid-template-columns:repeat(2,1fr)}.po-cmp.n1{grid-template-columns:1fr}.po-cmp.n2{grid-template-columns:repeat(2,1fr)}" +
    ".po-pe details{border-bottom:1px solid var(--line);padding:8px 0}.po-pe details:last-of-type{border-bottom:0}.po-pe summary{cursor:pointer;font-size:14px;list-style:none}.po-pe summary::-webkit-details-marker{display:none}.po-pe summary em{display:block;font-style:normal;font-size:11.5px;color:var(--sub)}" +
    ".po-per{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:6px 0 6px 6px;border-top:1px dashed var(--line);font-size:13.5px;cursor:pointer}.po-per .n small{display:block;font-size:10.5px;color:var(--dim)}" +
    ".po-per .r{text-align:right}.po-per .r small{display:block;font-size:10.5px;color:var(--sub)}.po-per.mine{background:rgba(77,212,122,.07);border-radius:8px}.po-fx{color:var(--dim)}" +
    ".po-cr .n em.pvs{color:var(--sub)}.po-cr .n em.pvs b.w{color:#4dd47a}.po-cr .n em.pvs b.l{color:#ff8a8a}" +
    ".po-pe details .po-per.more{display:none}.po-pe details.all .po-per.more{display:grid}.po-more{display:block;width:100%;margin-top:6px;border:1px dashed var(--line);background:none;color:var(--sub);border-radius:8px;padding:6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".po-per.nb .n{opacity:.8}.po-sg.n{background:rgba(138,148,168,.18);color:#aab3c5}" +
    ".po-rule{background:rgba(124,156,255,.08);border:1px solid rgba(124,156,255,.25);border-radius:12px;padding:10px 12px;margin:8px 0;font-size:13px;line-height:1.6}.po-rule>b{font-size:13.5px}.po-rule small{display:block;color:var(--sub);font-size:11.5px;margin-bottom:4px}.po-rl{color:var(--c,#e9c46a);font-weight:700;margin-top:4px;cursor:pointer}" +
    ".po-pf3{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 2px}.po-pf3 span{font-size:11.5px;border-radius:999px;padding:3px 9px;border:1px solid var(--line)}.po-pf3 .on{background:rgba(77,212,122,.12);color:#4dd47a;border-color:transparent}.po-pf3 .wait{color:var(--sub)}.po-pf3 .trial{background:rgba(255,184,77,.14);color:#ffb84d;border-color:transparent}" +
    ".po-tg{font-size:13px;letter-spacing:-1px}" +
    ".po-won{font-size:14px;margin:2px 0 4px}.po-won b{font-size:16px}.po-won small{display:block;color:var(--sub);font-size:11.5px}" +
    ".po-cw{display:block;font-size:10.5px;font-weight:600;opacity:.85}" +
    ".po-mk{display:flex;gap:12px;font-size:11px;color:var(--sub);margin-top:2px}.po-mk i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}" +
    ".po-dt{width:100%;border-collapse:collapse;font-size:13.5px}.po-dt th{font-size:12px;color:var(--sub);text-align:right;font-weight:600;padding:4px}.po-dt th:first-child,.po-dt td:first-child{text-align:left}.po-dt td{text-align:right;padding:6px 4px;border-top:1px solid var(--line)}.po-dt td em{display:block;font-size:10.5px}";
  document.head.appendChild(css);
})();
