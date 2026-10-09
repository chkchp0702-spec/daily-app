/* 💼 포트 (10/9) — 「시황리포트 배분표대로 투자했다면」
   자료: market-strategy-report/market/port.json (src/port.py, 매시간 갱신)
   ① 지금까지 성적(S&P·코스피·60/40 비교) ② 따라하기: 금액 넣으면 칸별·상품별 얼마/몇 주 ③ 비중 바뀐 날 ④ 칸별 기여 ⑤ 날짜별 성적 */
(function(){
  var URL_P = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/port.json";
  var COL = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9", "#2ab3c0", "#8a94a8", "#6fbf4a", "#e0a43a"];
  var URL_K = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/kick.json";
  var P = null, K = null, S = {amt: 10000000, mode: "us", pf: "base"};
  try { var sv = JSON.parse(localStorage.getItem("portSet") || "{}"); if (sv.amt) S.amt = sv.amt; if (sv.mode) S.mode = sv.mode; if (sv.pf) S.pf = sv.pf; } catch(e) {}
  function keep(){ try { localStorage.setItem("portSet", JSON.stringify(S)); } catch(e) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null) return "–"; d = d == null ? 2 : d; return (v > 0 ? "+" : "") + v.toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function won(v){ if (v >= 1e8) return (v / 1e8).toFixed(v >= 1e9 ? 1 : 2).replace(/\.?0+$/, "") + "억"; if (v >= 1e4) return Math.round(v / 1e4).toLocaleString("ko-KR") + "만"; return Math.round(v).toLocaleString("ko-KR"); }
  function md(d){ return d ? d.slice(5).replace("-", "/") : ""; }

  window.portView = function(){ return '<div id="pobody"><div class="loading">포트 불러오는 중…</div></div>'; };
  window.portInit = function(){
    var t = Date.now();
    Promise.all([fetch(URL_P + "?" + t).then(function(r){ if (!r.ok) throw 0; return r.json(); }),
                 fetch(URL_K + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })])
      .then(function(a){ P = a[0]; K = a[1]; draw(); })
      .catch(function(){ var b = document.getElementById("pobody"); if (b) b.innerHTML = '<div class="empty"><div class="big">💼</div>포트 계산이 아직 안 올라왔어요.<br>다음 자동 수집(매시간) 때 채워져요.</div>'; });
  };

  function draw(){
    var b = document.getElementById("pobody"); if (!b || !P) return;
    var st = P.stat, ex = st.ret - st.spy;
    var h = '<section class="po-hero"><div class="po-k">시황리포트 배분표대로 ' + md(P.start) + '부터 투자했다면</div>' +
      '<div class="po-big ' + cls(st.ret) + '">' + sg(st.ret) + '</div>' +
      '<div class="po-sub">' + st.days + '거래일 · S&P500 대비 <b class="' + cls(ex) + '">' + sg(ex) + 'p</b> · 가장 크게 빠졌을 때 <b>' + sg(st.mdd) + '</b></div>' +
      '<div class="po-cmp">' + [["S&P500", st.spy], ["코스피", st.kospi], ["주식60·채권40", st.mix]].map(function(x){
        return '<div><small>' + x[0] + '</small><b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b><em class="' + (st.ret >= x[1] ? "w" : "l") + '">' + (st.ret >= x[1] ? "포트가 앞섬" : "포트가 뒤짐") + '</em></div>'; }).join("") + '</div>' +
      '<div class="po-ch">' + V.lines([
        {name: "💼 포트", color: "#e9c46a", vals: P.nav},
        {name: "S&P500", color: "#7c9cff", vals: P.bench["S&P500"], dash: 1},
        {name: "코스피", color: "#e66767", vals: P.bench["코스피"], dash: 1},
        {name: "60·40", color: "#8a94a8", vals: P.bench["주식60·채권40"], dash: 1}
      ], P.dates.map(md), {h: 190, unit: "%", zero: 1, nodots: P.dates.length > 12}) + '</div>' +
      '<div class="po-w">S&P를 이긴 날 <b>' + st.win + ' / ' + st.days + '</b>' + (st.best ? ' · 가장 좋았던 날 ' + md(st.best.d) + ' <b class="up">' + sg(st.best.r) + '</b>' : '') + (st.worst ? ' · 가장 나빴던 날 ' + md(st.worst.d) + ' <b class="dn">' + sg(st.worst.r) + '</b>' : '') + '</div></section>';

    if (K) h += kickHtml();

    // ② 따라하기
    var segs = P.hold.map(function(x, i){ return {label: x.name, v: x.pct, color: COL[i % COL.length]}; });
    h += '<div class="sec">📋 지금 이렇게 담으면 돼요 <small class="mut">' + md(P.changes[0] && P.changes[0].date) + ' 배분표 기준</small></div>' +
      '<section class="card po-follow">' + V.donut(segs, P.hold.length + "칸", "비중") +
      '<div class="po-in"><label>내 투자금</label><div class="po-amt"><input id="poamt" inputmode="numeric" value="' + S.amt.toLocaleString("ko-KR") + '"><span>원</span></div>' +
      '<div class="po-q">' + [3e6, 1e7, 3e7, 1e8].map(function(v){ return '<button data-v="' + v + '">' + won(v) + '</button>'; }).join("") + '</div>' +
      (K ? '<div class="po-mode po-pf"><button data-p="base" class="' + (S.pf === "base" ? "on" : "") + '">💼 기본 포트</button><button data-p="kick" class="' + (S.pf === "kick" ? "on" : "") + '">⚡ 킥 포함</button></div>' : '') +
      '<div class="po-mode"><button data-m="us" class="' + (S.mode === "us" ? "on" : "") + '">🇺🇸 미국 ETF로</button><button data-m="kr" class="' + (S.mode === "kr" ? "on" : "") + '">🇰🇷 한국 상장 ETF로</button></div></div>' +
      '<div id="porows"></div><div class="po-cp"><button class="btn" id="pocopy">📋 주문 목록 복사</button><span id="pocpst"></span></div>' +
      '<p class="note">환율 ' + (P.fx ? P.fx.toLocaleString("ko-KR") + "원" : "–") + ' · 주 수는 ' + md(P.asof) + ' 종가 기준 내림. 한국 ETF가 없는 칸은 미국 상품으로 적었어요. ' +
      '<b>비중이 바뀐 날(아래 「비중 바뀐 날」)에만 고치면</b> 돼요.</p></section>';

    // ③ 비중 바뀐 날
    h += '<div class="sec">🔁 비중 바뀐 날</div><section class="card po-tl">' + P.changes.map(function(c, i){
      return '<div class="po-tli"><span class="d">' + md(c.date) + '</span><span class="t">' + e(c.why || "") + (i === 0 ? ' <em>지금</em>' : '') + '</span></div>'; }).join("") +
      (P.changes.length < 2 ? '<p class="note" style="margin:6px 0 0">' + md(P.start) + ' 이후 배분표가 그대로예요. 리포트가 비중을 바꾸면 여기에 쌓이고 알림이 가요.</p>' : '') + '</section>';

    // ④ 칸별 기여
    var mx = Math.max.apply(null, P.hold.map(function(x){ return Math.abs(x.contrib) || 0.01; }));
    h += '<div class="sec">🧩 어느 칸이 벌고 잃었나 <small class="mut">' + md(P.start) + '부터 기여 %p · 칸별 신호(S&P 대비·20일선)</small></div><section class="card po-ct">' +
      P.hold.slice().sort(function(a, b){ return b.contrib - a.contrib; }).map(function(x){
        var i = P.hold.indexOf(x), w = Math.abs(x.contrib) / mx * 50;
        var us = x.us.map(function(u){ return u.t + " " + sg(u.since, 1); }).join(" · ");
        var sgc = /^강함/.test(x.sig || "") ? "g" : /^약함/.test(x.sig || "") ? "b" : /^꺾이/.test(x.sig || "") ? "w" : "";
        return '<div class="po-cr"><div class="n"><i style="background:' + COL[i % COL.length] + '"></i>' + e(x.name) + ' <small>' + x.pct + '%</small>' + (sgc ? ' <span class="po-sg ' + sgc + '">' + e(x.sig.split(" — ")[0]) + '</span>' : '') + '<em>' + e(us) + '</em>' + (sgc ? '<em class="sgt">' + e((x.sig.split(" — ")[1] || "")) + '</em>' : '') + '</div>' +
          '<div class="bar"><span class="' + (x.contrib >= 0 ? "p" : "m") + '" style="width:' + w.toFixed(1) + '%"></span></div><b class="' + cls(x.contrib) + '">' + sg(x.contrib) + 'p</b></div>'; }).join("") + '</section>';

    // ⑤ 날짜별
    h += '<div class="sec">📅 날짜별 성적</div><section class="card"><table class="po-dt"><tr><th>날짜(미국)</th><th>💼 포트</th><th>S&P500</th><th></th></tr>' +
      P.daily.slice().reverse().slice(0, 15).map(function(d){ var w = d.r >= d.spy;
        return '<tr><td>' + md(d.d) + '</td><td class="' + cls(d.r) + '">' + sg(d.r) + '</td><td class="' + cls(d.spy) + '">' + sg(d.spy) + '</td><td>' + (w ? '<em class="w">이김</em>' : '<em class="l">짐</em>') + '</td></tr>'; }).join("") + '</table></section>' +
      '<p class="note">' + e(P.note) + ' 계산 ' + e(P.at) + (P.miss && P.miss.length ? ' · 시세 없음: ' + e(P.miss.join(", ")) : '') + '</p>';
    b.innerHTML = h;
    rows();
    var inp = document.getElementById("poamt");
    inp.oninput = function(){ var v = +inp.value.replace(/[^\d]/g, "") || 0; S.amt = v; keep(); rows(); };
    inp.onblur = function(){ inp.value = S.amt.toLocaleString("ko-KR"); };
    [].forEach.call(b.querySelectorAll(".po-q button"), function(x){ x.onclick = function(){ S.amt = +x.dataset.v; inp.value = S.amt.toLocaleString("ko-KR"); keep(); rows(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(x){ x.onclick = function(){ S.mode = x.dataset.m; keep();
      [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(x){ x.onclick = function(){ S.pf = x.dataset.p; keep();
      [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    document.getElementById("pocopy").onclick = copy;
  }

  // 칸마다 무엇을 얼마나
  function kickW(){ return (K && S.pf === "kick") ? K.open.reduce(function(a, o){ return a + (o.w || 0); }, 0) : 0; }
  function plan(){
    var kw = kickW(), out;
    out = P.hold.map(function(x, i){
      var pct = x.pct - (kw && /현금/.test(x.name) ? kw : 0);
      x = Object.assign({}, x, {pct: Math.round(pct * 10) / 10});
      var amt = S.amt * x.pct / 100, items = [];
      var kr = (x.kr || []).filter(function(k){ return k.etf; });
      if (S.mode === "kr" && kr.length){
        var k = kr[0];
        items.push({nm: k.name, code: k.code, amt: amt, sh: k.px ? Math.floor(amt / k.px) : null, px: k.px, cur: "원"});
      } else {
        var us = x.us.filter(function(u){ return u.px; }), each = us.length ? amt / us.length : 0;
        us.forEach(function(u){ var usd = P.fx ? each / P.fx : null;
          items.push({nm: u.t, code: u.t, amt: each, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$", r1: u.r1}); });
      }
      return {x: x, i: i, amt: amt, items: items};
    });
    if (kw) out.push({x: {name: "⚡ 킥 슬리브", pct: Math.round(kw * 10) / 10}, i: -1, amt: S.amt * kw / 100, kick: 1, items: K.open.map(function(o){
      var a = S.amt * o.w / 100, kr = /^\d{6}\.K[SQ]$/.test(o.code), us = /^[A-Z.\-]+$/.test(o.code);
      var usd = us && P.fx ? a / P.fx : null;
      return {nm: nm(o.name), code: o.code, amt: a, usd: usd, cur: us ? "$" : kr ? "원" : "현지", sh: us ? (usd ? Math.floor(usd / o.now) : null) : kr ? Math.floor(a / o.now) : null,
              note: "손절 " + pr(o.stop) + " · 절반 익절 " + pr(o.take)}; })});
    return out;
  }
  function rows(){
    var box = document.getElementById("porows"); if (!box) return;
    box.innerHTML = plan().map(function(p){
      return '<div class="po-r' + (p.kick ? ' po-rk' : '') + '"><div class="po-rh"><i style="background:' + (p.kick ? "#ff6b6b" : COL[p.i % COL.length]) + '"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        p.items.map(function(it){
          return '<div class="po-it"><span class="tk">' + e(it.nm) + (it.code !== it.nm ? ' <small>' + e(it.code) + '</small>' : '') + '</span>' +
            '<span class="v">' + (it.cur === "$" ? (it.usd != null ? '$' + Math.round(it.usd).toLocaleString("en-US") + ' · ' : '') : won(it.amt) + '원 · ') +
            (it.sh != null ? '<b>' + it.sh.toLocaleString("ko-KR") + '주</b>' : it.cur === "현지" ? '현지 통화로' : '가격 확인') + '</span></div>' +
            (it.note ? '<div class="po-itn">' + e(it.note) + '</div>' : ''); }).join("") +
          (p.kick && !p.items.length ? '<div class="po-itn">지금 빈 자리 — 신호가 뜨면 3%씩 들어가요 (그때까지 현금)</div>' : '') + '</div>';
    }).join("");
  }
  function nm(x){ return String(x || "").replace(/,? (Inc\.?|Corp\.?|Corporation|Ltd\.?|Company|plc|N\.V\.|S\.A\.|ASA)?\s*(Common Stock|Ordinary Shares|Class [A-Z].*|American Depositary.*)$/i, "").replace(/,? (Inc\.?|Corporation|Corp\.?|Ltd\.?)$/i, "").trim(); }
  function pr(v){ return v == null ? "–" : (+v).toLocaleString("ko-KR", {maximumFractionDigits: v >= 1000 ? 0 : 2}); }
  function kickHtml(){
    var ks = K.stat, d = ks.kick - ks.base, rows2;
    var h = '<div class="sec">⚔️ 기본 포트 vs ⚡ 킥 포트 <small class="mut">현금 15%p 를 「확인된 돌파」에만 3%씩</small></div><section class="card po-vs">' +
      '<div class="po-vs2"><div><small>💼 기본</small><b class="' + cls(ks.base) + '">' + sg(ks.base) + '</b></div><div class="k"><small>⚡ 킥 포함</small><b class="' + cls(ks.kick) + '">' + sg(ks.kick) + '</b><em class="' + (d >= 0 ? "w" : "l") + '">기본보다 ' + sg(d) + 'p</em></div><div><small>S&P500</small><b class="' + cls(ks.spy) + '">' + sg(ks.spy) + '</b></div></div>' +
      V.lines([{name: "⚡ 킥", color: "#ff6b6b", vals: K.kick}, {name: "💼 기본", color: "#e9c46a", vals: K.base}, {name: "S&P500", color: "#7c9cff", vals: P.bench["S&P500"], dash: 1}],
        K.dates.map(md), {h: 170, unit: "%", zero: 1, nodots: K.dates.length > 12}) +
      '<div class="po-ks"><span>슬리브 자체 <b class="' + cls(K.sleeve) + '">' + sg(K.sleeve) + '</b></span><span>자리 <b>' + ks.slots + '</b></span><span>끝난 거래 <b>' + ks.trades + '</b>' +
      (ks.win != null ? ' · 이긴 비율 <b>' + ks.win + '%</b>' : '') + '</span>' + (ks.avg_win != null ? '<span>이길 때 <b class="up">' + sg(ks.avg_win, 1) + '</b> · 질 때 <b class="dn">' + sg(ks.avg_loss, 1) + '</b></span>' : '') +
      (ks.paused ? '<span class="warn">⛔ 브레이크 중 (새 진입 멈춤)</span>' : '') + '</div>';
    h += '<div class="po-kh">지금 들고 있는 것</div>' + (K.open.length ? K.open.map(function(o){
      return '<div class="po-kp"><div><b>' + e(nm(o.name)) + '</b> <small>' + e(o.code) + '</small>' + (o.whale ? ' <span class="po-sg g">🐋</span>' : '') + (o.half ? ' <span class="po-sg w">절반 익절</span>' : '') +
        '<em>' + e(o.src) + ' · ' + md(o.d0) + ' 진입 ' + pr(o.entry) + ' · ' + o.days + '일째 · 손절 ' + pr(o.stop) + '</em></div><b class="' + cls(o.r) + '">' + sg(o.r, 1) + '</b></div>'; }).join("")
      : '<div class="po-itn">빈 자리 — 다음 확인된 돌파를 기다리는 중</div>');
    if (K.closed.length) h += '<div class="po-kh">끝난 거래</div>' + K.closed.slice(0, 8).map(function(c){
      return '<div class="po-kp"><div><b>' + e(nm(c.name)) + '</b> <small>' + e(c.code) + '</small><em>' + md(c.d0) + '→' + md(c.d1) + ' · ' + c.days + '일 · ' + e(c.why) + '</em></div><b class="' + cls(c.r) + '">' + sg(c.r, 1) + '</b></div>'; }).join("");
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
    ".po-k{font-size:13px;color:var(--sub)}.po-big{font-size:44px;font-weight:900;letter-spacing:-1px;line-height:1.1;margin:4px 0}" +
    ".po-sub{font-size:13.5px;color:var(--sub)}.po-sub b{color:var(--text)}" +
    ".po-cmp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 8px}.po-cmp>div{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px}" +
    ".po-cmp small{display:block;font-size:11.5px;color:var(--sub)}.po-cmp b{font-size:16px}.po-cmp em{display:block;font-style:normal;font-size:11px;margin-top:2px}" +
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
    ".po-dt{width:100%;border-collapse:collapse;font-size:13.5px}.po-dt th{font-size:12px;color:var(--sub);text-align:right;font-weight:600;padding:4px}.po-dt th:first-child,.po-dt td:first-child{text-align:left}.po-dt td{text-align:right;padding:6px 4px;border-top:1px solid var(--line)}";
  document.head.appendChild(css);
})();
