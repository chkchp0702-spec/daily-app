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
  function strip(D){
    return '<div class="pr5">' + ORDER.filter(function(k){ return D.markets[k]; }).map(function(k){ var m = D.markets[k];
      return '<button class="pr5c' + (k === SEL ? " on" : "") + '" data-m="' + k + '"><b>' + m.flag + ' ' + e(m.name) + '</b>' +
        '<span class="pr5p ' + tcls(m.p1) + '">' + pc(m.p1) + '</span>' + pbar(m.p1) + '<small>주 ' + pc(m.p5) + (m.open_now ? ' · 장중' : '') + '</small></button>'; }).join("") + '</div>';
  }
  function mcard(m, D){
    var open = OPEN[m.mk];
    var h = '<section class="card pr-c"><h3>' + m.flag + ' ' + e(m.name) + ' <span class="mut">' + e(m.ixn) + ' ' + V.fmt(m.last) + ' <b class="' + cls(m.chg) + '">' + sg(m.chg, 2) + '</b> · ' + md(m.base_date) + (m.open_now ? ' 장중' : ' 마감') + ' 기준</span></h3>' +
      '<div class="pr-two"><div><small>내일(' + md(m.next_day) + ') 오를 확률</small><b class="' + tcls(m.p1) + '">' + pc(m.p1) + '</b><em>' + e(m.tone1) + ' · 68% 폭 ' + sg(m.band1[0]) + ' ~ ' + sg(m.band1[1]) + '</em>' + pbar(m.p1, 1) + '</div>' +
      '<div><small>일주일(5일) 뒤 오를 확률</small><b class="' + tcls(m.p5) + '">' + pc(m.p5) + '</b><em>' + e(m.tone5) + ' · 68% 폭 ' + sg(m.band5[0]) + ' ~ ' + sg(m.band5[1]) + '</em>' + pbar(m.p5, 1) + '</div></div>' +
      '<p class="note pr-st">' + e(m.state) + (m.widen > 1 ? ' · 📣 이벤트로 폭 ×' + m.widen : '') + (m.open_now ? ' · 장중이라 오늘 봉이 아직 움직여요 — 마감 뒤 확률이 기록·채점돼요' : '') + '</p>';
    // 방법들 (접기)
    var rows = (m.methods || []).map(function(x){
      var has = x.p1 != null && x.w;
      return '<div class="pr-m' + (has ? "" : " off") + '"><div class="pr-mh"><span class="hm-i">' + x.ic + '</span><b>' + e(x.name) + '</b>' +
        (has ? '<span class="pr-mp"><span class="' + tcls(x.p1) + '">' + pc(x.p1) + '</span><small>주 ' + pc(x.p5) + '</small></span>' : '<span class="pr-mp mut">기울기 없음</span>') +
        (has ? '<span class="pr-w mut">×' + x.w + '</span>' : '') + '</div>' + (has ? pbar(x.p1) : '') + '<small class="pr-ev">' + e(x.ev) + '</small></div>';
    }).join("");
    h += '<button class="fold pr-f' + (open ? " open" : "") + '" data-f="' + m.mk + '">🧩 왜 이 숫자인가 — 방법 ' + (m.methods || []).length + '가지 <i class="fchev">▾</i></button>' +
      '<div class="pr-ms" style="' + (open ? "" : "display:none") + '">' + rows + '<p class="note">결합 = 각 방법의 확률을 로그오즈로 가중 평균(×는 가중치) → ×' + (D.shrink || 0.6) + ' 로 50% 쪽에 눌러 과신을 줄임. 「기울기 없음」은 이번엔 조건에 안 걸린 방법.</p></div>';
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
    var h = '<section class="card"><h3>🎲 내일 오를 확률 <span class="mut">' + e(D.t) + ' 기준 · 매시간</span></h3>' + strip(D) +
      '<p class="note">50% 가 동전. 57% 넘으면 「오를 쪽」, 43% 아래면 「내릴 쪽」 — 그 사이는 반반이에요. 막대를 누르면 그 시장을 자세히.</p></section>';
    h += mcard(D.markets[SEL], D) + allScore(D) + howCard(D);
    b.innerHTML = h;
    [].forEach.call(b.querySelectorAll(".pr5c[data-m]"), function(x){ x.onclick = function(){ SEL = x.dataset.m; draw(D); window.scrollTo({top: 0, behavior: "smooth"}); }; });
    [].forEach.call(b.querySelectorAll(".pr-f[data-f]"), function(x){ x.onclick = function(){ var k = x.dataset.f, nx = x.nextElementSibling; OPEN[k] = !OPEN[k]; x.classList.toggle("open", OPEN[k]); if (nx) nx.style.display = OPEN[k] ? "" : "none"; try { localStorage.setItem("probopen", JSON.stringify(OPEN)); } catch(z) {} }; });
  }
  window.probView = function(){ return '<div id="prbody"><div class="loading">확률 계산 자료 불러오는 중…</div></div>'; };
  window.probInit = function(){
    P("prob.json").then(draw).catch(function(){ var b = document.getElementById("prbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">🎲</div>시장확률이 아직 안 올라왔어요.<br>다음 시간 계산 때 채워져요.</div>'; });
  };
  (function(){ var st = document.createElement("style"); st.textContent =
    ".pr5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:2px 0 8px}" +
    ".pr5c{display:flex;flex-direction:column;gap:3px;align-items:stretch;text-align:left;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:10px;padding:6px 5px;font:inherit;cursor:pointer;min-width:0}" +
    ".pr5c.on{outline:2px solid var(--acc,#7c9cff)}.pr5c b{font-size:12px;white-space:nowrap}.pr5c small{font-size:10.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pr5p{font-size:18px;font-weight:800}.pr5p.up{color:var(--up)}.pr5p.dn{color:var(--down)}" +
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
    ".pr-how{margin-top:8px}.pr-hw{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.pr-hw:last-of-type{border:0}.pr-hw small{display:block;color:var(--sub);font-size:11.5px;line-height:1.5;margin-top:2px;word-break:keep-all}";
    document.head.appendChild(st); })();
})();
