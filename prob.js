/* CH Investing — 🎲 시장확률: 내일·일주일 뒤 오를 확률 (5개 시장, 10가지 방법 결합) · archive/x/prob.json (prob.yml 매시간)
   10/14 사용자 「다 합쳐서 확률로 만들어서 나침반 옆에 '시장확률' — 누르면 설명 나오고, 어떤 방법들인지 나오고 접고 · 다섯 개 시장 다」 */
(function(){
  var e = V.e, cls = V.cls;
  var ORDER = ["KR", "US", "JP", "CN", "HK"], SEL = null, OPEN = {};
  try { OPEN = JSON.parse(localStorage.getItem("probopen") || "{}"); } catch(x) {}
  function P(name){ return getJSON("archive/x/" + name + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }
  function pc(p){ return p == null ? "–" : Math.round(p * 100) + "%"; }
  function sg(v, d){ return v == null ? "–" : (v > 0 ? "+" : "") + Number(v).toFixed(d == null ? 1 : d) + "%"; }
  function tcls(p){ return p == null ? "" : p >= 0.57 ? "up" : p <= 0.43 ? "dn" : ""; }
  function md(d){ return d ? d.slice(5).replace("-", "/") : ""; }
  // 확률 막대: 가운데 50, 왼쪽(파랑) 내릴 쪽 · 오른쪽(빨강) 오를 쪽
  function pbar(p, big){
    if (p == null) return '<div class="pb' + (big ? " big" : "") + '"><i class="pm" style="left:50%"></i></div>';
    var x = Math.min(95, Math.max(5, p * 100));
    return '<div class="pb' + (big ? " big" : "") + '"><i class="pf ' + (p >= 0.5 ? "u" : "d") + '" style="left:' + Math.min(50, x) + '%;width:' + Math.abs(x - 50) + '%"></i><i class="pm" style="left:' + x + '%"></i></div>';
  }
  function ep(v){ return v == null ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(1) + "%p"; }
  function ecls(v){ return v == null ? "" : v >= 1 ? "up" : v <= -1 ? "dn" : ""; }
  var STR = {"강": "🔥 강한 신호", "보통": "👀 보통 신호", "약": "💤 약한 신호"};
  // 확대 막대: 40~60% 구간만 그려 작은 차이도 보이게 (평소 = 점선)
  function zbar(p, pb){
    var z = function(v){ return Math.min(100, Math.max(0, (v - 0.4) / 0.2 * 100)); };
    var x = z(p), b = z(pb);
    return '<div class="zb"><i class="zf ' + (p >= pb ? "u" : "d") + '" style="left:' + Math.min(x, b) + '%;width:' + Math.abs(x - b) + '%"></i><i class="zn" style="left:' + b + '%"></i><i class="pm" style="left:' + x + '%"></i></div><div class="zl"><span>40%</span><span>평소 ' + pc(pb) + '</span><span>60%</span></div>';
  }
  function votes(v){
    if (!v) return "";
    var dots = new Array(v.up + 1).join('<i class="u"></i>') + new Array(v.flat + 1).join('<i></i>') + new Array(v.down + 1).join('<i class="d"></i>');
    return '<div class="pv"><span class="pvd">' + dots + '</span><small>방법 ' + (v.up + v.down + v.flat) + '개 중 <b class="up">' + v.up + ' 오를 쪽</b> · <b class="dn">' + v.down + ' 내릴 쪽</b> · ' + v.flat + ' 평소</small></div>';
  }
  function tailCard(m){
    if (!m.tail) return "";
    var mx = Math.max.apply(null, m.tail.map(function(t){ return Math.max(t.now, t.norm); }).concat([0.05]));
    return '<div class="sub2">📏 큰 움직임 확률 <span class="mut">지금 변동성 ' + m.sig_now + '% vs 평소 ' + m.sig_norm + '% (하루 1σ)</span></div>' + m.tail.map(function(t){
      var r = t.norm ? t.now / t.norm : 1, up = /오름/.test(t.k);
      return '<div class="pt"><div class="row"><span>' + e(t.k) + '</span><b class="' + (up ? "up" : "dn") + '">' + pc(t.now) + '</b></div>' +
        '<div class="ptb"><i class="' + (up ? "u" : "d") + '" style="width:' + (t.now / mx * 100).toFixed(0) + '%"></i><i class="ptn" style="left:' + (t.norm / mx * 100).toFixed(0) + '%"></i></div>' +
        '<small class="mut">평소 ' + pc(t.norm) + ' · <b class="' + (r >= 1.15 ? (up ? "up" : "dn") : "") + '">' + (r >= 1.05 ? "평소의 " + r.toFixed(1) + "배" : r <= 0.95 ? "평소보다 적음 (" + r.toFixed(1) + "배)" : "평소와 비슷") + '</b></small></div>'; }).join("");
  }
  function strip(D){
    return '<div class="pr5">' + ORDER.filter(function(k){ return D.markets[k]; }).map(function(k){ var m = D.markets[k];
      return '<button class="pr5c' + (k === SEL ? " on" : "") + '" data-m="' + k + '"><b>' + m.flag + ' ' + e(m.name) + '</b>' +
        '<span class="pr5p ' + ecls(m.e1) + '">' + ep(m.e1).replace("%p", "") + '<small>%p</small></span>' + (m.pb1 != null ? zbar(m.p1, m.pb1).split('<div class="zl">')[0] : pbar(m.p1)) + '<small>' + pc(m.p1) + ' · 주 ' + ep(m.e5) + '</small></button>'; }).join("") + '</div>';
  }
  // 10/14 사용자 「각 시장 밑에 오르고 내릴 섹터 확률도, 그 안에 종목들 확률도」 → archive/x/prob_sec.json (prob_sec.yml)
  var SECX = null, SOPEN = {}, SALL = {};
  function secCard(mk){
    var S = SECX && SECX.markets && SECX.markets[mk];
    if (!S) return '<section class="card"><h3>🧭 섹터·종목 확률</h3><p class="note" style="margin:0">아직 계산 전이에요 — 하루 4번(장 마감 뒤) 새로 계산해요.</p></section>';
    var b5 = S.base.y5, br = S.base.yr5, all = SALL[mk], secs = S.sectors || [];
    var show = all || secs.length <= 9 ? secs : secs.slice(0, 5).concat([null]).concat(secs.slice(-3));
    var row = function(x){
      if (!x) return '<div class="ps-gap">⋯</div>';
      var e5 = (x.p5 - b5) * 100, er = (x.pr5 - br) * 100, op = SOPEN[mk + x.k];
      return '<div class="ps-r' + (op ? " open" : "") + '" data-sk="' + e(x.k) + '"><div class="ps-h"><span class="hm-i">' + x.icon + '</span><b>' + e(x.name) + '</b><small class="mut">' + x.n + '종목</small>' +
        '<span class="ps-v"><b class="' + ecls(e5) + '">' + ep(e5) + '</b><small>오를 ' + pc(x.p5) + '</small></span><i class="fchev">▾</i></div>' +
        '<div class="ps-bar">' + zbar(x.p5, b5).split('<div class="zl">')[0] + '</div>' +
        '<small class="ps-sub">시장보다 나을 확률 <b class="' + ecls(er) + '">' + pc(x.pr5) + '</b> (평소 ' + pc(br) + ') · 지난 5일 ' + sg(x.r5) + ' · 오를 쪽 종목 ' + x.up5 + '/' + x.n + '</small>' +
        (op ? '<div class="ps-st">' + x.st.map(function(t, i){ var te = (t.p5 - b5) * 100, tr = (t.pr5 - br) * 100;
          return '<a class="ps-t" href="javascript:openOP(\'' + e(t.s).replace(/'/g, "") + '\')"><span class="ps-tn"><b>' + e(t.n) + '</b><em class="tk">' + e(V.cd ? V.cd(t.s) : t.s) + '</em></span>' +
            '<span class="ps-tv"><b class="' + ecls(te) + '">' + ep(te) + '</b><small>시장보다 <span class="' + ecls(tr) + '">' + pc(t.pr5) + '</span> · 내일 ' + pc(t.p1) + '</small></span></a>'; }).join("") + '</div>' : '') + '</div>';
    };
    var RL = {"믿을 만": ["✅", "s3"], "약함": ["👀", "s2"], "동전 수준": ["💤", "s1"]}[S.rel] || ["", ""];
    return '<section class="card"><h3>🧭 섹터·종목 확률 <span class="mut">일주일 · 평소보다 · ' + e(S.last.slice(5).replace("-", "/")) + ' 마감 기준</span></h3>' +
      (S.rel ? '<div class="pr-sg"><span class="pr-bd ' + RL[1] + '">' + RL[0] + ' 모델 ' + e(S.rel) + '</span><small class="mut">검증 AUC ' + S.auc.y5 + (S.rel === "믿을 만" ? '' : ' — 확률을 평소 쪽으로 눌러 보여 줘요(순위는 그대로)') + '</small></div>' : '') +
      show.map(row).join("") +
      (secs.length > 9 ? '<button class="fold ps-all" data-mk="' + mk + '">' + (all ? "줄이기 ▴" : "섹터 " + secs.length + "개 모두 보기 ▾") + '</button>' : '') +
      '<p class="note">큰 숫자 = 그 섹터(종목)가 일주일 뒤 오를 확률이 이 시장 평소(' + pc(b5) + ')보다 얼마나 높고 낮은지. 섹터를 누르면 종목 — 「시장보다」 높은 순. ' + S.n + '종목 · 검증 AUC 일주일 ' + (S.auc.y5 != null ? S.auc.y5 : "–") + ' · 시장 대비 ' + (S.auc.yr5 != null ? S.auc.yr5 : "–") + ' (0.5 = 동전, 0.55 넘으면 쓸 만)</p></section>';
  }
  function mcard(m, D){
    var open = OPEN[m.mk];
    var h = '<section class="card pr-c"><h3>' + m.flag + ' ' + e(m.name) + ' <span class="mut">' + e(m.ixn) + ' ' + V.fmt(m.last) + ' <b class="' + cls(m.chg) + '">' + sg(m.chg, 2) + '</b> · ' + md(m.base_date) + (m.open_now ? ' 장중' : ' 마감') + ' 기준</span></h3>' +
      (m.strength ? '<div class="pr-sg"><span class="pr-bd s' + ({"강": 3, "보통": 2, "약": 1}[m.strength]) + '">' + STR[m.strength] + '</span>' + votes(m.votes) + '</div>' : '') +
      '<div class="pr-two"><div><small>내일(' + md(m.next_day) + ') · 평소보다</small><b class="' + ecls(m.e1) + '">' + ep(m.e1) + '</b><em>오를 확률 ' + pc(m.p1) + ' (평소 ' + pc(m.pb1) + ') · 68% 폭 ' + sg(m.band1[0]) + ' ~ ' + sg(m.band1[1]) + '</em>' + (m.pb1 != null ? zbar(m.p1, m.pb1) : pbar(m.p1, 1)) + '</div>' +
      '<div><small>일주일(5일) · 평소보다</small><b class="' + ecls(m.e5) + '">' + ep(m.e5) + '</b><em>오를 확률 ' + pc(m.p5) + ' (평소 ' + pc(m.pb5) + ') · 68% 폭 ' + sg(m.band5[0]) + ' ~ ' + sg(m.band5[1]) + '</em>' + (m.pb5 != null ? zbar(m.p5, m.pb5) : pbar(m.p5, 1)) + '</div></div>' +
      tailCard(m) +
      '<p class="note pr-st">' + e(m.state) + (m.widen > 1 ? ' · 📣 이벤트로 폭 ×' + m.widen : '') + (m.open_now ? ' · 장중이라 오늘 봉이 아직 움직여요 — 마감 뒤 확률이 기록·채점돼요' : '') + '</p>';
    // 방법들 (접기)
    var rows = (m.methods || []).map(function(x){
      var has = x.p1 != null && x.w;
      return '<div class="pr-m' + (has ? "" : " off") + '"><div class="pr-mh"><span class="hm-i">' + x.ic + '</span><b>' + e(x.name) + '</b>' +
        (has ? '<span class="pr-mp"><span class="' + tcls(x.p1) + '">' + pc(x.p1) + '</span><small>주 ' + pc(x.p5) + '</small></span>' : '<span class="pr-mp mut">기울기 없음</span>') +
        (has ? '<span class="pr-w mut">×' + x.w + '</span>' : '') + '</div>' + (has ? pbar(x.p1) : '') + '<small class="pr-ev">' + e(x.ev) + '</small></div>';
    }).join("");
    h += '<button class="fold pr-f' + (open ? " open" : "") + '" data-f="' + m.mk + '">🧩 왜 이 숫자인가 — 방법 ' + (m.methods || []).length + '가지 <i class="fchev">▾</i></button>' +
      '<div class="pr-ms" style="' + (open ? "" : "display:none") + '">' + rows + '<p class="note">결합 = 각 방법의 확률을 로그오즈로 가중 평균(×는 가중치) → 평소와의 차이를 ×' + (D.shrink || 0.6) + ' 로 줄여 과신을 막음. 「기울기 없음」은 이번엔 조건에 안 걸린 방법.</p></div>';
    // 채점 (시장별)
    var S = D.score && D.score[m.mk];
    if (S && (S.d1.n || S.d5.n)){
      h += '<div class="sub2">🎯 이 시장 채점 <span class="mut">마감 뒤 실제 결과로</span></div><div class="x4">' +
        '<div><small>내일 예측</small><b>' + (S.d1.n ? S.d1.hit + '%' : '–') + '</b><small class="mut">' + S.d1.n + '건 · 브라이어 ' + (S.d1.brier != null ? S.d1.brier : '–') + '</small></div>' +
        '<div><small>일주일 예측</small><b>' + (S.d5.n ? S.d5.hit + '%' : '–') + '</b><small class="mut">' + S.d5.n + '건 · 브라이어 ' + (S.d5.brier != null ? S.d5.brier : '–') + '</small></div></div>' +
        (S.recent && S.recent.length ? '<div class="pr-rc">' + S.recent.slice().reverse().map(function(r){
          return '<span>' + md(r.d) + ' <b class="' + tcls(r.p1) + '">' + pc(r.p1) + '</b> → ' + (r.r1 != null ? '<b class="' + cls(r.r1) + '">' + sg(r.r1) + '</b>' : '<i class="mut">대기</i>') +
            ' · 주 <b class="' + tcls(r.p5) + '">' + pc(r.p5) + '</b> → ' + (r.r5 != null ? '<b class="' + cls(r.r5) + '">' + sg(r.r5) + '</b>' : '<i class="mut">대기</i>') + '</span>'; }).join("") + '</div>' : '');
    } else h += '<p class="note">🎯 채점은 마감 뒤 첫 기록부터 쌓여요 — 내일 예측은 다음 날, 일주일 예측은 5거래일 뒤 실제 결과와 맞춰 봐요.</p>';
    return h + '</section>';
  }
  function howCard(D){
    var open = OPEN._how;
    return '<button class="fold pr-f' + (open ? " open" : "") + '" data-f="_how">📖 시장확률이란 — 어떻게 계산하나 <i class="fchev">▾</i></button>' +
      '<section class="card pr-how" style="' + (open ? "" : "display:none") + '"><p class="note" style="margin:0 0 10px">' + e(D.note || "") + '</p>' +
      (D.how || []).map(function(x, i){ return '<div class="pr-hw"><span class="rk">' + (i + 1) + '</span><div><b>' + e(x[0]) + '</b><small>' + e(x[1]) + '</small></div></div>'; }).join("") +
      '<p class="note">브라이어 점수 = (확률 − 결과)² 의 평균. 0 이면 완벽, 0.25 면 늘 50% 라고 한 것과 같음. 「오를 쪽」이라 한 날들이 실제로 그만큼 올랐는지(보정표)가 100건 넘게 쌓이면 ×0.6 수축을 보정표로 바꿔요.</p></section>';
  }
  function allScore(D){
    var A = D.score && D.score.all; if (!A || !(A.d1.n || A.d5.n)) return '';
    var bk = function(s){ return (s.buckets || []).map(function(b){ return '<span>' + e(b.k) + ' <small>' + b.n + '건</small> 말한 ' + b.pred + '% → 실제 ' + b.real + '%</span>'; }).join(""); };
    return '<section class="card"><h3>🎯 전체 채점 <span class="mut">5개 시장 합산</span></h3><div class="x4">' +
      '<div><small>내일 적중</small><b>' + (A.d1.n ? A.d1.hit + '%' : '–') + '</b><small class="mut">' + A.d1.n + '건</small></div><div><small>내일 브라이어</small><b>' + (A.d1.brier != null ? A.d1.brier : '–') + '</b><small class="mut">0.25 = 동전</small></div>' +
      '<div><small>일주일 적중</small><b>' + (A.d5.n ? A.d5.hit + '%' : '–') + '</b><small class="mut">' + A.d5.n + '건</small></div><div><small>일주일 브라이어</small><b>' + (A.d5.brier != null ? A.d5.brier : '–') + '</b><small class="mut"></small></div></div>' +
      (A.d1.buckets && A.d1.buckets.length ? '<div class="sub2">보정표 (내일)</div><div class="pr-rc">' + bk(A.d1) + '</div>' : '') + '</section>';
  }
  function draw(D){
    var b = document.getElementById("prbody"); if (!b) return;
    var ks = ORDER.filter(function(k){ return D.markets[k]; });
    if (!ks.length){ b.innerHTML = '<div class="empty"><div class="big">🎲</div>시장확률 자료가 아직 없어요.</div>'; return; }
    if (!SEL || !D.markets[SEL]) SEL = ks[0];
    var h = '<section class="card"><h3>🎲 내일 · 평소보다 <span class="mut">' + e(D.t) + ' 기준 · 매시간</span></h3>' + strip(D) +
      '<p class="note">큰 숫자 = 그 시장 「평소」(2000년 이후 오른 날 비율)보다 오를 확률이 얼마나 높고 낮은지. 내일 방향은 프로도 55% 넘기 어려워서 ±2%p 면 의미 있는 기울기, ±4%p 면 강한 편이에요. 막대는 40~60% 구간을 확대한 것.</p></section>';
    h += mcard(D.markets[SEL], D) + secCard(SEL) + allScore(D) + howCard(D);
    b.innerHTML = h;
    [].forEach.call(b.querySelectorAll(".pr5c[data-m]"), function(x){ x.onclick = function(){ SEL = x.dataset.m; draw(D); window.scrollTo({top: 0, behavior: "smooth"}); }; });
    [].forEach.call(b.querySelectorAll(".ps-r .ps-h"), function(x){ x.onclick = function(){ var k = SEL + x.parentNode.dataset.sk; SOPEN[k] = !SOPEN[k]; var y = window.scrollY; draw(D); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".ps-all"), function(x){ x.onclick = function(){ SALL[x.dataset.mk] = !SALL[x.dataset.mk]; var y = window.scrollY; draw(D); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".pr-f[data-f]"), function(x){ x.onclick = function(){ var k = x.dataset.f, nx = x.nextElementSibling; OPEN[k] = !OPEN[k]; x.classList.toggle("open", OPEN[k]); if (nx) nx.style.display = OPEN[k] ? "" : "none"; try { localStorage.setItem("probopen", JSON.stringify(OPEN)); } catch(z) {} }; });
  }
  window.probView = function(){ return '<div id="prbody"><div class="loading">확률 계산 자료 불러오는 중…</div></div>'; };
  window.probInit = function(){
    P("prob_sec.json").then(function(j){ SECX = j; }).catch(function(){}).then(function(){ return P("prob.json"); }).then(draw).catch(function(){ var b = document.getElementById("prbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">🎲</div>시장확률이 아직 안 올라왔어요.<br>다음 시간 계산 때 채워져요.</div>'; });
  };
  (function(){ var st = document.createElement("style"); st.textContent =
    ".pr5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:2px 0 8px}" +
    ".pr5c{display:flex;flex-direction:column;gap:3px;align-items:stretch;text-align:left;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:10px;padding:6px 5px;font:inherit;cursor:pointer;min-width:0}" +
    ".pr5c.on{outline:2px solid var(--acc,#7c9cff)}.pr5c b{font-size:12px;white-space:nowrap}.pr5c small{font-size:10.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pr5p{font-size:16px;font-weight:800;white-space:nowrap}.pr5p small{font-size:10px;font-weight:600;margin-left:1px}.pr5p.up{color:var(--up)}.pr5p.dn{color:var(--down)}" +
    ".pb{position:relative;height:6px;border-radius:3px;background:rgba(124,156,255,.22);overflow:visible;margin:3px 0}.pb.big{height:10px;margin:8px 0 2px}" +
    ".pb:before{content:'';position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:var(--sub);opacity:.6}" +
    ".pb .pf{position:absolute;top:0;height:100%;border-radius:3px}.pb .pf.u{background:var(--up)}.pb .pf.d{background:var(--down)}" +
    ".pb .pm{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}.pb.big .pm{width:14px;height:14px}" +
    ".pr-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pr-two>div{background:var(--panel2,rgba(255,255,255,.03));border-radius:12px;padding:10px}.pr-two small{display:block;font-size:11.5px;color:var(--sub)}" +
    ".pr-two b{display:block;font-size:30px;font-weight:800;line-height:1.15;margin:2px 0}.pr-two b.up{color:var(--up)}.pr-two b.dn{color:var(--down)}.pr-two em{display:block;font-style:normal;font-size:11px;color:var(--sub)}" +
    ".pr-st{margin-top:10px}.pr-f{margin:12px 0 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer}.pr-f .fchev{transition:transform .15s;font-style:normal}.pr-f.open .fchev{transform:rotate(180deg)}" +
    ".pr-ms{margin-top:8px}.pr-m{padding:9px 2px;border-bottom:1px solid var(--line)}.pr-m:last-of-type{border:0}.pr-m.off{opacity:.6}" +
    ".pr-mh{display:flex;align-items:center;gap:7px;font-size:13.5px}.pr-mh .hm-i{font-size:16px}.pr-mp{margin-left:auto;font-weight:800;font-size:14px}.pr-mp small{font-weight:500;color:var(--sub);margin-left:5px}.pr-mp .up{color:var(--up)}.pr-mp .dn{color:var(--down)}.pr-w{font-size:11px}" +
    ".pr-ev{display:block;font-size:11.5px;color:var(--sub);line-height:1.5;margin-top:3px;word-break:keep-all}" +
    ".pr-rc{display:flex;flex-direction:column;gap:4px;font-size:12px;margin-top:6px}.pr-rc span{padding:5px 8px;border-radius:8px;background:var(--panel2,rgba(255,255,255,.03))}.pr-rc .up{color:var(--up)}.pr-rc .dn{color:var(--down)}" +
    ".zb{position:relative;height:10px;border-radius:5px;background:rgba(124,156,255,.18);margin:8px 0 2px}.pr5c .zb{height:6px;margin:3px 0}" +
    ".zb .zf{position:absolute;top:0;height:100%;border-radius:5px}.zb .zf.u{background:var(--up)}.zb .zf.d{background:var(--down)}" +
    ".zb .zn{position:absolute;top:-3px;bottom:-3px;width:0;border-left:2px dashed var(--sub)}" +
    ".zb .pm{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}.pr5c .zb .pm{width:9px;height:9px}" +
    ".zl{display:flex;justify-content:space-between;font-size:10px;color:var(--sub)}" +
    ".pr-sg{display:flex;align-items:center;gap:10px;margin:0 0 10px;flex-wrap:wrap}.pr-bd{font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--panel2,#2a3142)}" +
    ".pr-bd.s3{background:color-mix(in srgb,var(--up) 22%,transparent)}.pr-bd.s2{background:color-mix(in srgb,#ffb84d 22%,transparent)}" +
    ".pv{display:flex;flex-direction:column;gap:2px}.pvd{display:flex;gap:3px}.pvd i{width:10px;height:10px;border-radius:50%;background:#6b7385}.pvd i.u{background:var(--up)}.pvd i.d{background:var(--down)}.pv small{font-size:11px;color:var(--sub)}" +
    ".pt{padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.pt:last-child{border:0}.pt .row{display:flex;justify-content:space-between}" +
    ".ptb{position:relative;height:8px;border-radius:4px;background:rgba(124,156,255,.15);margin:5px 0 3px}.ptb i.u,.ptb i.d{display:block;height:100%;border-radius:4px}.ptb i.u{background:var(--up)}.ptb i.d{background:var(--down)}" +
    ".ptb .ptn{position:absolute;top:-3px;bottom:-3px;width:0;border-left:2px dashed var(--text)}.pt small{font-size:11px}" +
    ".ps-r{padding:9px 0;border-bottom:1px solid var(--line)}.ps-r:last-of-type{border:0}.ps-h{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13.5px}.ps-h .hm-i{font-size:16px}" +
    ".ps-v{margin-left:auto;text-align:right;line-height:1.15}.ps-v b{display:block;font-size:15px}.ps-v small{font-size:10.5px;color:var(--sub)}.ps-v .up{color:var(--up)}.ps-v .dn{color:var(--down)}" +
    ".ps-r .fchev{font-style:normal;color:var(--sub);transition:transform .15s}.ps-r.open .fchev{transform:rotate(180deg)}.ps-bar .zb{height:6px;margin:5px 0 3px}.ps-sub{font-size:11px;color:var(--sub)}.ps-sub .up{color:var(--up)}.ps-sub .dn{color:var(--down)}" +
    ".ps-gap{text-align:center;color:var(--sub);padding:2px 0;letter-spacing:4px}.ps-all{margin-top:8px}" +
    ".ps-st{margin:8px 0 2px;border-radius:10px;background:var(--panel2,rgba(255,255,255,.03));padding:2px 8px}.ps-t{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none}.ps-t:last-child{border:0}" +
    ".ps-tn{flex:1;min-width:0;overflow:hidden}.ps-tn b{font-size:13px;white-space:nowrap}.ps-tn .tk{margin-left:5px;font-style:normal;font-size:10.5px;color:var(--sub)}.ps-tv{text-align:right;line-height:1.2}.ps-tv b{font-size:13.5px}.ps-tv small{display:block;font-size:10.5px;color:var(--sub)}.ps-tv .up{color:var(--up)}.ps-tv .dn{color:var(--down)}" +
    ".pr-how{margin-top:8px}.pr-hw{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.pr-hw:last-of-type{border:0}.pr-hw small{display:block;color:var(--sub);font-size:11.5px;line-height:1.5;margin-top:2px;word-break:keep-all}";
    document.head.appendChild(st); })();
})();
