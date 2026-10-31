/* CH Investing — 🏠 오늘 v2 시안 (10/31 사용자: 「오늘 카테고리 임팩트가 약해 — 우와 소리 나고, 오늘이 좋아서 다른 카테고리도 열어 보게」)
   10/31 13:00 「싹 바꿔서 적용」 → 모든 사람 기본으로 켬 · 예전 홈으로 돌아가기: 주소 끝에 ?home2=0 (다시 켜기 ?home2=1)
   ① 📍 스토리 링 — 맨 위 동그라미 8개(밤사이 미국 · 한국 · 돈 몰리는 곳 · 큰손 · 차트 신호 · 상품 · 내 포트 · 운세).
      오늘 안 본 건 무지개 테두리. 누르면 꽉 찬 화면 스토리(넘기기·자동 6초) → 마지막에 「○○ 탭에서 자세히」
   ② 🌏 5개 시장 타일 — 큰 숫자 + 5일 흐름 · 누르면 나침반
   ③ ✨ 오늘의 발견 — 옆으로 넘기는 큰 카드: 카테고리마다 가장 눈에 띄는 숫자 하나(큰손이 함께 산 종목 · 컵 돌파 임박 · 브라질 국채 · ELS · 펀드 1위 · 제안서 · 피드 · 운세)
   ④ 🗺 업종 지도 — 한국(장중·마감) 또는 미국 업종을 넓이·색으로 한눈에
   나머지(오늘 한 줄 · 1탭 예측 · 내 포트 · 바뀐 것)는 그대로 아래에. 숫자는 전부 앱이 이미 받는 자료 그대로 — 지어내지 않음 */
(function(){
  var ON_K = "home2";
  try { var qm = /[?&]home2=(\d)/.exec(location.search); if (qm) localStorage.setItem(ON_K, qm[1]); } catch(x) {}
  function on(){ try { return localStorage.getItem(ON_K) !== "0"; } catch(x) { return true; } }   // 10/31 13:00 사용자 「이렇게 싹 바꿔서 적용」 → 모두 기본으로 켬 (예전 홈은 ?home2=0)
  window.home2On = on;
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  var WDK = ["일", "월", "화", "수", "목", "금", "토"];
  function wd(d){ return d ? WDK[new Date(String(d).slice(0, 10) + "T00:00:00Z").getUTCDay()] : ""; }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function q5(){ return "?" + Math.floor(Date.now() / 300000); }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 300000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0] : null; }
  function arc(cat, name){ var it = latest(cat); return it && (it.files || []).indexOf(name) >= 0 ? gj("archive/" + cat + "/" + it.id + "/" + name) : Promise.resolve(null); }
  function short(n){ var t = String(n || "").replace(/\s+(Common Stock|Ordinary Shares|Class [A-Z]).*$/i, "").replace(/\s+-\s.*$/, ""); return t.replace(/,?\s*(Inc\.?|Corporation|Corp\.?|Ltd\.?|Holdings|plc)$/i, "").trim(); }
  function nm(code, name){ var m = window.SIGNM || {}; return m[code] || (name && /[가-힣]/.test(name) ? name : short(name)) || code; }
  function nmT(code, name){ var k = nm(code, name); return k === code ? code : k; }
  function goTab(t){ var p = String(t).split("~"); if (window.goTo) goTo(p[0], p[1]); else go(p[0]); }
  function heatBg(v, a){ var x = Math.min(1, Math.abs(v || 0) / 3); a = a == null ? 1 : a; return v > 0 ? "rgba(214,69,61," + (0.18 + x * 0.72) * a + ")" : v < 0 ? "rgba(47,111,221," + (0.18 + x * 0.72) * a + ")" : "rgba(140,148,168," + 0.35 * a + ")"; }
  var JOEY = {joy: "img/kid_joy.jpg?v=1", umb: "img/kid_umb.jpg?v=1", thumb: "img/kid_thumb.jpg?v=1", globe: "img/kid_globe.jpg?v=1", piggy: "img/kid_piggy.jpg?v=1", detect: "img/kid_detect.jpg?v=1", wow: "img/guide_src.jpg?v=1", think: "img/kid_think.jpg?v=1", wave: "img/kid_wave.jpg?v=1", night: "img/kid_night.jpg?v=1"};

  /* ───────── 자료 한 번에 ───────── */
  var D = null, DT = 0;
  function load(){
    if (D && Date.now() - DT < 120000) return Promise.resolve(D);
    var sec = latest("sector");
    return Promise.all([
      gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/live_us.json" + q5(), 120000), gj("archive/x/live_jp.json" + q5(), 120000),
      gj("archive/x/live_cn.json" + q5(), 120000), gj("archive/x/live_hk.json" + q5(), 120000),
      gj(RAWM + "market/home.json" + q5()), sec ? gj("archive/sector/" + sec.id + "/compass.json") : null,
      gj("archive/x/whale_pick.json" + q5()), gj("archive/x/whale_x.json" + q5()), arc("cup", "cards.json"), arc("gap", "cards.json"),
      gj("archive/x/products.json" + q5(), 600000), gj("archive/x/prob.json" + q5()), gj(RAWM + "feeds/hot.json" + q5()), null,
      window.SIGNMP || null
    ]).then(function(r){
      D = {kr: r[0], us: r[1], jp: r[2], cn: r[3], hk: r[4], H: r[5] || {}, C: r[6], wp: r[7], wx: r[8], cup: r[9], gap: r[10], pd: r[11], pb: r[12], hot: r[13], feed: r[14]};
      DT = Date.now(); return D;
    });
  }
  function ix(J, n){ return J ? ((J.index || []).filter(function(x){ return x.name === n; })[0] || null) : null; }
  function liveNow(J){ return J && J.date === today() && J.t && J.t < "15:31"; }

  /* ───────── 이야기(스토리) 만들기 — 장면마다 {bg, joey, title, sub, html, cta:[탭, 글]} ───────── */
  function seenKey(id){ return "h2_seen_" + id; }
  function seen(id){ return ls(seenKey(id)) === today(); }
  function markSeen(id){ ls(seenKey(id), today()); }
  function bigNum(v, unit){ return '<div class="s2-big ' + cls(v) + '">' + sg(v) + (unit ? '<small>' + unit + '</small>' : '') + '</div>'; }
  function bars(rows){   // [{n, v, s}]
    var mx = Math.max.apply(null, rows.map(function(r){ return Math.abs(r.v); }).concat([0.5]));
    return '<div class="s2-bars">' + rows.map(function(r){ var w = Math.abs(r.v) / mx * 46;
      return '<div class="s2-br"><span class="n">' + e(r.n) + (r.s ? '<small>' + e(r.s) + '</small>' : '') + '</span><span class="t"><i class="z"></i><i class="b ' + (r.v >= 0 ? "u" : "d") + '" style="' + (r.v >= 0 ? "left:50%" : "right:50%") + ';width:' + w.toFixed(1) + '%"></i></span><b class="' + cls(r.v) + '">' + sg(r.v) + '</b></div>'; }).join("") + '</div>'; }
  function stories(d){
    var S = [], H = d.H || {}, P = H.port || {};
    // 🌙 밤사이 미국
    var sp = ix(d.us, "S&P500"), nq = ix(d.us, "나스닥");
    if (sp){
      var usd = d.us.t && d.us.t < "12:00" ? new Date(Date.parse(d.us.date + "T00:00:00Z") - 864e5).toISOString().slice(0, 10) : d.us.date;
      var secs = (d.us.sectors || []).filter(function(s){ return s.n >= 5; }).slice().sort(function(a, b){ return b.r - a.r; });
      var big = (d.us.value || []).slice(0, 3);
      S.push({id: "us", ic: "🇺🇸", lab: "밤사이 미국", grad: ["#1b2a52", "#3b5bdb"], slides: [
        {joey: sp.chg >= 0 ? JOEY.joy : JOEY.umb, title: "밤사이 미국 " + md(usd) + "(" + wd(usd) + ")", html: '<div class="s2-k">S&amp;P500</div>' + bigNum(sp.chg) + '<div class="s2-row"><span>나스닥 <b class="' + cls(nq && nq.chg) + '">' + sg(nq && nq.chg) + '</b></span><span>오른 종목 <b>' + (d.us.up || 0) + '</b>/' + (d.us.total || 0) + '</span></div>' +
          '<div class="s2-gauge"><i style="width:' + Math.round((d.us.up || 0) / Math.max(1, d.us.total || 1) * 100) + '%"></i></div><p class="s2-p">' + (sp.chg <= -1.5 ? "크게 흔들린 밤이에요. 하루 급락은 흔히 되돌림이 나와요." : sp.chg >= 1.5 ? "시원하게 오른 밤이에요." : "큰 방향 없이 지나간 밤이에요.") + '</p>'},
        secs.length ? {joey: JOEY.globe, title: "미국에서 돈이 간 곳 · 빠진 곳", html: bars(secs.slice(0, 3).concat(secs.slice(-3)).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, ""), v: s.r}; }))} : null,
        big.length ? {joey: JOEY.detect, title: "거래가 가장 몰린 종목", html: '<div class="s2-list">' + big.map(function(x, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(x.n) + '<small>' + e(x.s) + '</small></b><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></div>'; }).join("") + '</div>'} : null
      ].filter(Boolean), cta: ["sector", "🧭 시장 흐름에서 5개 시장 보기"]});
    }
    // 🇰🇷 한국
    var ks = ix(d.kr, "코스피"), kq = ix(d.kr, "코스닥");
    if (ks){
      var live = liveNow(d.kr), ksec = (d.kr.sectors || []).filter(function(s){ return s.n >= 5; }).slice().sort(function(a, b){ return b.r - a.r; });
      var ups = d.kr.total ? Math.round((d.kr.up || 0) / d.kr.total * 100) : null;
      S.push({id: "kr", ic: "🇰🇷", lab: live ? "지금 한국" : "한국 마감", grad: ["#4a1c2a", "#d6453d"], slides: [
        {joey: ks.chg >= 0 ? JOEY.joy : JOEY.umb, title: (live ? "지금 코스피 · " + d.kr.t : "코스피 " + md(d.kr.date) + "(" + wd(d.kr.date) + ") 마감"), html: '<div class="s2-k">코스피 ' + Math.round(ks.last || 0).toLocaleString() + '</div>' + bigNum(ks.chg) +
          '<div class="s2-row"><span>코스닥 <b class="' + cls(kq && kq.chg) + '">' + sg(kq && kq.chg) + '</b></span><span>오른 종목 <b>' + (ups == null ? "–" : ups + "%") + '</b></span></div><div class="s2-gauge"><i style="width:' + (ups || 0) + '%"></i></div>'},
        ksec.length ? {joey: JOEY.globe, title: "업종 1등 · 꼴등", html: bars(ksec.slice(0, 3).concat(ksec.slice(-3)).map(function(s){ return {n: (s.icon || "") + " " + s.name.replace(/\(.*?\)/g, ""), v: s.r}; }))} : null,
        (d.kr.value || []).length ? {joey: JOEY.detect, title: "돈이 가장 몰린 종목", html: '<div class="s2-list">' + d.kr.value.slice(0, 4).map(function(x, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(x.n) + '<small>거래 ' + Math.round(x.v || 0).toLocaleString() + '억</small></b><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></div>'; }).join("") + '</div>'} : null
      ].filter(Boolean), cta: ["market", "🌐 시황에서 오늘 전략 보기"]});
    }
    // 🔥 돈 몰리는 곳 (집중 테마)
    var F = H.focus || [];
    if (F.length) S.push({id: "focus", ic: "🔥", lab: "돈 몰리는 곳", grad: ["#4a2a10", "#f08c00"], slides: F.slice(0, 3).map(function(t){
      return {joey: JOEY.thumb, title: "돈이 몰리는 테마", html: '<div class="s2-k">' + e(t.stage || "") + '</div><div class="s2-big2">' + e(t.name) + '</div><div class="s2-row"><span>5일 <b class="' + cls(t.r5) + '">' + sg(t.r5) + '</b></span><span>S&amp;P보다 20일 <b class="' + cls(t.rs20) + '">' + sg(t.rs20) + '</b></span></div>' +
        ((t.stars || []).length ? '<div class="s2-chips">' + t.stars.slice(0, 3).map(function(s){ return '<span>★ ' + e(s.name) + ' <small>' + e(s.t) + '</small></span>'; }).join("") + '</div>' : '') + (t.do ? '<p class="s2-p">' + e(t.do) + '</p>' : '')}; }), cta: ["market~mkfo", "🎯 오늘 집중 자세히"]});
    // 🐋 큰손
    var pk = d.wp && d.wp.pick, cons = (d.wx && d.wx.consensus) || [];
    if (pk || cons.length) S.push({id: "whale", ic: "🐋", lab: "큰손", grad: ["#0b3b3a", "#12b886"], slides: [
      pk ? {joey: JOEY.detect, title: "오늘의 큰손 픽", html: '<div class="s2-k">고래 점수 ' + Math.round(pk.tot) + '점</div><div class="s2-big2">' + e(pk.n) + ' <small>' + e(pk.s) + '</small></div><div class="s2-row"><span>20일 <b class="' + cls(pk.r20) + '">' + sg(pk.r20) + '</b></span><span>어제 <b class="' + cls(pk.r1) + '">' + sg(pk.r1) + '</b></span></div><ul class="s2-ul">' + (pk.why || []).slice(0, 3).map(function(w){ return '<li>' + e(w) + '</li>'; }).join("") + '</ul>'} : null,
      cons.length ? {joey: JOEY.wow, title: "유명 투자자들이 함께 산 종목", html: '<div class="s2-list">' + cons.slice(0, 3).map(function(c, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(c.t)) + ' <em>' + e(c.t) + '</em><small>' + e((c.by || []).slice(0, 3).join(" · ")) + (c.n > 3 ? " 외 " + (c.n - 3) : "") + '</small></b><span>' + c.n + '명</span></div>'; }).join("") + '</div><p class="s2-p">' + e(d.wx.quarter || "") + ' 공시 기준 · 지금 가격은 그때보다 ' + sg(cons[0].vs) + '</p>'} : null
    ].filter(Boolean), cta: ["whale", "🐋 고래 탭에서 40명 보기"]});
    // ☕📈 차트 신호
    var cupT = d.cup && d.cup.top || [], gapT = d.gap && d.gap.top || [];
    var near = cupT.filter(function(c){ return c.dist != null && c.dist > -5 && c.dist <= 3; }).sort(function(a, b){ return (b.brk ? 1 : 0) - (a.brk ? 1 : 0) || Math.abs(a.dist) - Math.abs(b.dist); });
    if (cupT.length || gapT.length) S.push({id: "chart", ic: "☕", lab: "차트 신호", grad: ["#3d2a10", "#e8a33d"], slides: [
      cupT.length ? {joey: JOEY.detect, title: "컵 모양 — 막 돌파했거나 곧 돌파", html: '<div class="s2-k">후보 ' + (d.cup.total || cupT.length) + '개 중 ' + near.length + '개</div><div class="s2-list">' + (near.length ? near : cupT).slice(0, 4).map(function(c, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(c.code, c.name)) + ' <em>' + e(String(c.code).replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "")) + '</em><small>' + e(c.sector && c.sector !== "미분류" ? c.sector : c.mkt) + ' · ' + (c.shape || "") + ' 컵 · 깊이 ' + Math.round(c.depth || 0) + '%</small></b><span class="' + (c.brk ? "up" : "") + '">' + (c.brk ? "🚀 돌파" : "−" + Math.abs(c.dist).toFixed(1) + "%") + '</span></div>'; }).join("") + '</div><p class="s2-p">숫자 = 돌파 가격(피벗)까지 남은 거리</p>'} : null,
      gapT.length ? {joey: JOEY.wow, title: "힘차게 뛰어오른 갭", html: '<div class="s2-list">' + gapT.slice(0, 4).map(function(g, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(g.code, g.name)) + ' <em>' + e(String(g.code).replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "")) + '</em><small>' + md(g.gday) + ' 갭 · 그 뒤 ' + sg(g.after, 0) + ' · ' + (g.hold ? "갭 지키는 중" : "갭 메움") + '</small></b><span class="up">+' + (+g.gap).toFixed(1) + '%</span></div>'; }).join("") + '</div>'} : null
    ].filter(Boolean), cta: ["cup", "☕ 컵 탭에서 차트 보기"]});
    // 🛍️ 상품
    var pd = d.pd || {}, slides = [];
    var brl = (pd.anb || []).slice().sort(function(a, b){ return (b.r || 0) - (a.r || 0); })[0];
    var kb = (pd.krw || []).slice().sort(function(a, b){ return (b.after || 0) - (a.after || 0); })[0];
    var el = (pd.els || []).filter(function(x){ return !x.e || x.e >= today(); }).sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    var fd = (pd.funds || []).filter(function(f){ return f.m1 != null && f.m1 < 50 && f.buy !== "1"; }).sort(function(a, b){ return b.m1 - a.m1; });
    if (brl || kb) slides.push({joey: JOEY.piggy, title: "지금 살 수 있는 채권", html: (brl ? '<div class="s2-k">🇧🇷 브라질 국채 ' + e(brl.code) + ' · ' + String(brl.mat).slice(0, 4) + '년 만기</div><div class="s2-big up">연 ' + (+brl.r).toFixed(1) + '%</div>' : '') + (kb ? '<div class="s2-row"><span>🇰🇷 원화 채권 세후 최고 <b>' + (+kb.after).toFixed(2) + '%</b></span></div><p class="s2-p">' + e(kb.btype || kb.kind || "") + ' · ' + String(kb.mat).slice(0, 4) + '년 만기 · ' + e(kb.risk || "") + '</p>' : '') + '<p class="s2-p mut">브라질 국채는 헤알화 환율에 따라 원화 수익이 크게 달라져요</p>'});
    if (el.length) slides.push({joey: JOEY.thumb, title: "지금 청약 중인 ELS·ELB", html: '<div class="s2-k">' + el.length + '개 청약 중</div><div class="s2-big up">연 ' + (+el[0].cpn).toFixed(1) + '%</div><p class="s2-p">' + e(el[0].n) + ' · ' + e(el[0].ua || "") + '</p><div class="s2-row"><span>' + (el[0].loss ? "원금 손실 가능" : "원금 지급형") + '</span><span>마감 <b>' + md(el[0].e) + '</b></span></div>'});
    if (fd.length) slides.push({joey: JOEY.joy, title: "한 달 수익률 1등 펀드", html: '<div class="s2-big2">' + e(fd[0].n.replace(/\[.*?\]/g, "").slice(0, 26)) + '</div><div class="s2-big up">' + sg(fd[0].m1) + '<small>1개월</small></div><p class="s2-p">' + e(fd[0].co) + ' · ' + e(fd[0].st || fd[0].t || "") + ' · 1년 ' + sg(fd[0].y1) + '</p>'});
    if (slides.length) S.push({id: "prod", ic: "🛍️", lab: "상품", grad: ["#10304a", "#1c7ed6"], slides: slides, cta: ["bond", "🏦 상품 탭에서 비교하기"]});
    // 💼 내 포트
    if (P.base != null) S.push({id: "port", ic: "💼", lab: "내 포트", grad: ["#3a3010", "#e9c46a"], slides: [{joey: P.conc > P.spy ? JOEY.joy : JOEY.piggy, title: md(P.start) + "부터 내 포트 vs S&P500",
      html: bars([{n: "🎯 집중", v: P.conc}, {n: "⚡ 공격", v: P.kick}, {n: "💼 기본", v: P.base}, {n: "🇺🇸 S&P500", v: P.spy}].filter(function(x){ return x.v != null; }).sort(function(a, b){ return b.v - a.v; })) +
        '<p class="s2-p">' + (P.d1 != null ? md(P.d1_date) + " 하루 기본 " + sg(P.d1) + " · S&P " + sg(P.d1_spy) + ". " : "") + '세계 지수 ' + P.n_bench + '곳 중 ' + P.beat_kick + '곳을 앞섰어요.</p>'}], cta: ["port", "💼 포트에서 담을 비중 보기"]});
    // 🔮 운세 (생일 저장된 사람)
    var L = window.luckToday && luckToday();
    if (L && L.inv != null) S.push({id: "luck", ic: "🔮", lab: "운세", grad: ["#2b1747", "#9c6ade"], slides: [{joey: JOEY.wave, title: e(L.name) + " 님 오늘", html: '<div class="s2-k">오늘 점수 ' + L.sc + '점</div><div class="s2-big2">📈 투자운 ' + L.inv + '점</div>' + (L.word ? '<p class="s2-p">「' + e(L.word) + '」</p>' : '') + '<p class="s2-p mut">재미로 보는 참고예요 — 투자 판단의 근거가 아니에요</p>'}], cta: ["luck", "🔮 오늘의 운세 전부 보기"]});
    return S;
  }

  /* ───────── ① 스토리 링 ───────── */
  function ringsHtml(S){
    return '<div class="h2-rings" id="h2rings">' + S.map(function(s, i){ return '<button type="button" class="h2-ring' + (seen(s.id) ? " seen" : "") + '" data-st="' + i + '"><span class="o"><span class="i">' + s.ic + '</span></span><small>' + e(s.lab) + '</small></button>'; }).join("") + '</div>';
  }
  /* ───────── 스토리 보기 ───────── */
  var SV = null;
  function openStory(S, si){
    closeStory();
    var box = document.createElement("div"); box.id = "h2sv"; document.body.appendChild(box);
    SV = {S: S, si: si, k: 0, t: 0, box: box, paused: false};
    document.documentElement.classList.add("h2-lock");
    box.addEventListener("click", function(ev){
      var t = ev.target;
      if (t.closest("[data-x]")){ closeStory(); return; }
      var c = t.closest("[data-cta]"); if (c){ var tab = c.getAttribute("data-cta"); closeStory(); goTab(tab); return; }
      var w = box.clientWidth; if (ev.clientX < w * 0.3) step(-1); else step(1);
    });
    var y0 = null;
    box.addEventListener("touchstart", function(ev){ y0 = ev.touches[0].clientY; SV && (SV.paused = true); }, {passive: true});
    box.addEventListener("touchend", function(ev){ if (SV) SV.paused = false; if (y0 != null && ev.changedTouches[0].clientY - y0 > 90) closeStory(); y0 = null; }, {passive: true});
    draw();
  }
  function closeStory(){ if (!SV) return; clearInterval(SV.t); SV.box.remove(); SV = null; document.documentElement.classList.remove("h2-lock"); var r = document.getElementById("h2rings"); if (r) paintRings(); }
  function paintRings(){ [].forEach.call(document.querySelectorAll(".h2-ring"), function(b){ var s = (CUR_S || [])[+b.dataset.st]; if (s) b.classList.toggle("seen", seen(s.id)); }); }
  function step(dlt){
    if (!SV) return; var st = SV.S[SV.si];
    SV.k += dlt;
    if (SV.k < 0){ if (SV.si > 0){ SV.si--; SV.k = SV.S[SV.si].slides.length - 1; } else SV.k = 0; }
    else if (SV.k >= st.slides.length){ if (SV.si < SV.S.length - 1){ SV.si++; SV.k = 0; } else { closeStory(); return; } }
    draw();
  }
  function draw(){
    var st = SV.S[SV.si], sl = st.slides[SV.k]; markSeen(st.id);
    var last = SV.k === st.slides.length - 1;
    SV.box.style.background = "linear-gradient(160deg," + st.grad[0] + "," + st.grad[1] + ")";
    SV.box.innerHTML = '<div class="sv-bars">' + st.slides.map(function(_, i){ return '<i class="' + (i < SV.k ? "done" : i === SV.k ? "now" : "") + '"><b></b></i>'; }).join("") + '</div>' +
      '<div class="sv-top"><span class="sv-ic">' + st.ic + '</span><div><b>' + st.ic + ' ' + e(st.lab) + '</b><small>' + (SV.si + 1) + ' / ' + SV.S.length + ' 이야기</small></div><button type="button" data-x="1" aria-label="닫기">✕</button></div>' +
      '<div class="sv-body"><img class="sv-hero" src="' + sl.joey + '" alt=""><h2>' + sl.title + '</h2>' + sl.html + '</div>' +
      '<div class="sv-foot"><button type="button" class="sv-cta' + (last ? " hot" : "") + '" data-cta="' + e(st.cta[0]) + '">' + e(st.cta[1]) + ' ›</button><small>화면 오른쪽 = 다음 · 왼쪽 = 이전 · 아래로 밀면 닫기</small></div>';
    clearInterval(SV.t);
    var t0 = Date.now(), dur = 6500, bar = SV.box.querySelector(".sv-bars i.now b");
    SV.t = setInterval(function(){
      if (!SV) return; if (SV.paused){ t0 += 100; return; }
      var p = Math.min(1, (Date.now() - t0) / dur); if (bar) bar.style.width = (p * 100) + "%";
      if (p >= 1){ clearInterval(SV.t); step(1); }
    }, 100);
  }

  /* ───────── ② 5개 시장 타일 ───────── */
  function worldHtml(d){
    var C = d.C && d.C.markets || {};
    var MK = [["KR", "🇰🇷", "코스피", d.kr, "코스피"], ["US", "🇺🇸", "S&P500", d.us, "S&P500"], ["JP", "🇯🇵", "닛케이", d.jp, "닛케이 225"], ["CN", "🇨🇳", "상해", d.cn, "상해종합"], ["HK", "🇭🇰", "항셍", d.hk, "항셍"]];
    var t = MK.map(function(m){ var x = ix(m[3], m[4]), c = C[m[0]], c5 = c && (c.index || [])[0] && c.index[0].chg5; if (!x) return "";
      var lv = liveNow(m[3]) && m[0] !== "US";
      return '<button type="button" class="h2-w' + (m[0] === "KR" || m[0] === "US" ? " big" : "") + '" data-goto="sector" style="background:' + heatBg(x.chg) + '"><span class="f">' + m[1] + '</span><small>' + m[2] + '</small><b>' + sg(x.chg) + '</b><em>' + (lv ? "● " + e(m[3].t) : wd(m[0] === "US" && m[3].t < "12:00" ? new Date(Date.parse(m[3].date + "T00:00:00Z") - 864e5).toISOString() : m[3].date) + " 마감") + '</em>' + (c5 != null ? '<em>5일 ' + sg(c5) + '</em>' : '') + '</button>'; }).join("");
    return '<section class="card h2-world"><div class="h2-hd"><b>🌏 5개 시장 지금</b><span class="mut">누르면 시장 흐름 ›</span></div><div class="h2-wg">' + t + '</div></section>';
  }

  /* ───────── ③ 오늘의 발견 ───────── */
  function discHtml(d){
    var C = [], pk = d.wp && d.wp.pick, cons = (d.wx && d.wx.consensus) || [], cupT = d.cup && d.cup.top || [], gapT = d.gap && d.gap.top || [], pd = d.pd || {};
    if (cons.length) C.push({tab: "whale", c: ["#0b3b3a", "#12b886"], ic: "🐋", k: "유명 투자자 " + cons[0].n + "명이 함께 산", big: nm(cons[0].t), sub: cons[0].t + " · " + (cons[0].by || []).slice(0, 2).join(" · ") + " 등", go: "큰손 40명 보기"});
    if (pk) C.push({tab: "whale", c: ["#083344", "#0ca678"], ic: "🐳", k: "오늘의 큰손 픽 · " + Math.round(pk.tot) + "점", big: pk.n, sub: pk.s + " · 20일 " + sg(pk.r20), go: "왜 골랐나"});
    var near = cupT.filter(function(c){ return c.dist != null && c.dist > -5 && c.dist <= 3; }).sort(function(a, b){ return Math.abs(a.dist) - Math.abs(b.dist); });
    if (cupT.length){ var c0 = near[0] || cupT[0]; C.push({tab: "cup", c: ["#3d2a10", "#e8a33d"], ic: "☕", k: "컵 모양 " + (d.cup.total || cupT.length) + "개 중 " + (c0.brk ? "막 돌파" : "돌파 가장 가까운"), big: nm(c0.code, c0.name), sub: String(c0.code).replace(/\.(KS|KQ|T|HK)$/, "") + " · " + (c0.brk ? "돌파 가격 넘음 🚀" : "돌파까지 " + Math.abs(c0.dist).toFixed(1) + "%"), go: "차트 보기"}); }
    if (gapT.length) C.push({tab: "gap", c: ["#2b1747", "#9c6ade"], ic: "📈", k: "갭 점수 1위", big: nm(gapT[0].code, gapT[0].name), sub: String(gapT[0].code).replace(/\.(KS|KQ|T|HK)$/, "") + " · 갭 +" + (+gapT[0].gap).toFixed(1) + "% · " + md(gapT[0].gday), go: "갭 보기"});
    var brl = (pd.anb || []).slice().sort(function(a, b){ return (b.r || 0) - (a.r || 0); })[0];
    if (brl) C.push({tab: "bond", c: ["#0b3d1f", "#2f9e44"], ic: "🇧🇷", k: "브라질 국채 지금 금리", big: "연 " + (+brl.r).toFixed(1) + "%", sub: brl.code + " · " + brl.mat.slice(0, 4) + "년 만기 · 헤알화 환율 따라 달라져요", go: "채권 비교"});
    var el = (pd.els || []).filter(function(x){ return !x.e || x.e >= today(); }).sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    if (el.length){ var dd = el[0].e ? Math.round((Date.parse(el[0].e) - Date.parse(today())) / 864e5) : null; C.push({tab: "els", c: ["#4a2a10", "#f08c00"], ic: "🎯", k: "청약 중 ELS·ELB " + el.length + "개 중 최고", big: "연 " + (+el[0].cpn).toFixed(1) + "%", sub: (el[0].ua || "") + (dd != null ? " · 마감 " + (dd <= 0 ? "오늘" : "D-" + dd) : ""), go: "ELS 보기"}); }
    var fd = (pd.funds || []).filter(function(f){ return f.m1 != null && f.m1 < 50 && f.buy !== "1"; }).sort(function(a, b){ return b.m1 - a.m1; });
    if (fd.length) C.push({tab: "fund", c: ["#1b2a52", "#3b5bdb"], ic: "📦", k: "펀드 1,800개 중 한 달 1등", big: sg(fd[0].m1), sub: fd[0].n.replace(/\[.*?\]/g, "").slice(0, 24), go: "펀드 순위"});
    C.push({tab: "prop", c: ["#18263f", "#4c6ef5"], ic: "📝", k: "오늘 시황에 맞춘 제안서", big: "9종 준비", sub: "고객 이름·금액만 넣으면 한 장·PDF·PPT", go: "제안서 만들기"});
    var hot = d.hot && d.hot.items ? Object.keys(d.hot.items).map(function(k){ return d.hot.items[k]; }).filter(function(x){ return x.lv === 1; }).sort(function(a, b){ return a.at < b.at ? 1 : -1; }) : [];
    if (hot.length) C.push({tab: "feed", c: ["#3a1d1d", "#e03131"], ic: "📰", k: "피드 🔴 핵심 · " + md(hot[0].at), big: hot[0].why.split(/ — |—/)[0].slice(0, 28), sub: (hot[0].why.split(/ — |—/)[1] || "").slice(0, 40), go: "피드 보기"});
    var L = window.luckToday && luckToday();
    C.push({tab: "luck", c: ["#2b1747", "#c2255c"], ic: "🔮", k: L ? L.name + " 님 오늘 투자운" : "오늘의 운세 · 타로", big: L && L.inv != null ? L.inv + "점" : "생일만 넣으면", sub: L ? "재미로 보는 오늘 기운" : "점수 · 행운의 색 · 투자운까지", go: "운세 보기"});
    return '<section class="h2-disc"><div class="h2-hd"><b>✨ 오늘의 발견</b><span class="mut">옆으로 넘겨 보세요 · ' + C.length + '가지</span></div><div class="h2-dc" id="h2dc">' + C.map(function(x){
      return '<button type="button" class="h2-d" data-goto="' + x.tab + '" style="background:linear-gradient(150deg,' + x.c[0] + ',' + x.c[1] + ')"><span class="ic">' + x.ic + '</span><small>' + e(x.k) + '</small><b>' + e(x.big) + '</b><em>' + e(x.sub) + '</em><span class="go">' + e(x.go) + ' ›</span></button>'; }).join("") + '</div></section>';
  }

  /* ───────── ④ 업종 지도 (넓이 = 종목 수 · 색 = 오늘 등락) ───────── */
  function squarify(items, x, y, w, h){
    var out = [], tot = items.reduce(function(a, b){ return a + b.w; }, 0), rest = items.slice();
    function worst(row, s){ var sum = row.reduce(function(a, b){ return a + b.a; }, 0), mx = Math.max.apply(null, row.map(function(r){ return r.a; })), mn = Math.min.apply(null, row.map(function(r){ return r.a; })); return Math.max(s * s * mx / (sum * sum), sum * sum / (s * s * mn)); }
    rest.forEach(function(it){ it.a = it.w / tot * w * h; });
    while (rest.length){
      var s = Math.min(w, h), row = [rest[0]], i = 1;
      while (i < rest.length && worst(row.concat([rest[i]]), s) <= worst(row, s)){ row.push(rest[i]); i++; }
      var sum = row.reduce(function(a, b){ return a + b.a; }, 0);
      if (w >= h){ var cw = sum / h, yy = y; row.forEach(function(r){ var rh = r.a / cw; out.push({it: r, x: x, y: yy, w: cw, h: rh}); yy += rh; }); x += cw; w -= cw; }
      else { var ch = sum / w, xx = x; row.forEach(function(r){ var rw = r.a / ch; out.push({it: r, x: xx, y: y, w: rw, h: ch}); xx += rw; }); y += ch; h -= ch; }
      rest = rest.slice(row.length);
    }
    return out;
  }
  function mapHtml(d){
    var useKr = d.kr && d.kr.sectors && (liveNow(d.kr) || !(d.us && d.us.sectors) || (kst().getUTCHours() >= 9 && kst().getUTCHours() < 22 && [0, 6].indexOf(kst().getUTCDay()) < 0));
    var J = useKr ? d.kr : d.us; if (!J || !J.sectors) return "";
    var it = J.sectors.filter(function(s){ return s.n >= 5; }).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, ""), ic: s.icon || "", v: s.r, w: Math.pow(s.n, 0.8)}; }).sort(function(a, b){ return b.w - a.w; }).slice(0, 15);
    if (it.length < 6) return "";
    var W = 100, Hh = 78, R = squarify(it, 0, 0, W, Hh);
    var cells = R.map(function(r){ var big = r.w * r.h > 380, mid = r.w * r.h > 150;
      return '<div class="h2-tm" style="left:' + r.x.toFixed(2) + '%;top:' + (r.y / Hh * 100).toFixed(2) + '%;width:' + r.w.toFixed(2) + '%;height:' + (r.h / Hh * 100).toFixed(2) + '%;background:' + heatBg(r.it.v) + '">' + (mid ? '<span>' + (big ? e(r.it.ic) + " " : "") + e(r.it.n.split("·")[0]) + '</span>' : '') + (r.w * r.h > 70 && r.w > 9 ? '<b>' + sg(r.it.v) + '</b>' : '') + '</div>'; }).join("");
    var when = useKr ? (liveNow(d.kr) ? "지금 " + d.kr.t : md(d.kr.date) + " 마감") : "미국 " + (d.us.t && d.us.t < "12:00" ? md(new Date(Date.parse(d.us.date + "T00:00:00Z") - 864e5).toISOString()) : md(d.us.date)) + " 마감";
    return '<section class="card h2-map" data-goto="sector"><div class="h2-hd"><b>🗺 ' + (useKr ? "🇰🇷 한국" : "🇺🇸 미국") + ' 업종 지도</b><span class="mut">' + e(when) + ' · 넓이 = 종목 수</span></div><div class="h2-tmw">' + cells + '</div><div class="h2-lg"><span class="dn">■ 내림</span><span>색이 진할수록 많이 움직임</span><span class="up">오름 ■</span></div></section>';
  }

  /* ───────── 붙이기 ───────── */
  var CUR_S = null, BUSY = false;
  function apply(){
    if (!on() || typeof cur === "undefined" || cur !== "home") return;
    var b = document.getElementById("hmbody"); if (!b || BUSY) return;
    var hero = document.getElementById("tdhero"); if (!hero) return;
    if (b.getAttribute("data-h2") === String(DT) && document.getElementById("h2rings")) return reorder(b);
    BUSY = true;
    load().then(function(d){
      BUSY = false; if (!d || cur !== "home") return;
      var S = stories(d); CUR_S = S;
      ["h2rings", "h2world", "h2disc", "h2map"].forEach(function(id){ var x = document.getElementById(id); if (x) x.remove(); });
      var mk = function(id, html){ var w = document.createElement("div"); w.id = id; w.innerHTML = html; return w; };
      var rings = mk("h2ringsw", ringsHtml(S)); rings.id = "h2ringsw";
      var old = document.getElementById("h2ringsw"); if (old) old.remove();
      b.insertBefore(rings, b.firstChild);
      var world = mk("h2world", worldHtml(d)), disc = mk("h2disc", discHtml(d)), map = mk("h2map", mapHtml(d));
      hero.insertAdjacentElement("afterend", world); world.insertAdjacentElement("afterend", disc);
      var pl = b.querySelector("section.card.pl"); (pl || disc).insertAdjacentElement("afterend", map);
      b.setAttribute("data-h2", String(DT));
      [].forEach.call(rings.querySelectorAll("[data-st]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); openStory(S, +x.dataset.st); }; });
      reorder(b);
    }).catch(function(x){ BUSY = false; console.warn("home2", x); });
  }
  function reorder(b){   // v2에선 「오늘 한 장」·「바뀐 것」·5개 시장과 겹치는 띠는 아래로 / 숨김
    var hm = document.getElementById("hmlive"); if (hm) hm.classList.add("h2-hide");
    var more = b.querySelector(".hm-more"); if (more) more.classList.add("h2-hide");   // 아래 바로가기 줄 → 「오늘의 발견」이 대신
    var pb = document.getElementById("pbcard"), mp = document.getElementById("h2map");
    if (pb && mp && pb.previousElementSibling !== mp && pb.compareDocumentPosition(mp) & Node.DOCUMENT_POSITION_FOLLOWING) mp.insertAdjacentElement("afterend", pb);
  }
  var T = 0;
  try { new MutationObserver(function(ms){
    if (!on()) return;
    for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && t.closest("#h2ringsw,#h2world,#h2disc,#h2map,#h2sv")) continue; if (T) return; T = setTimeout(function(){ T = 0; apply(); }, 200); return; }
  }).observe(document.getElementById("main") || document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (on() && !document.hidden && typeof cur !== "undefined" && cur === "home"){ DT = 0; var b = document.getElementById("hmbody"); if (b) b.removeAttribute("data-h2"); apply(); } }, 5 * 60e3);

  var css = document.createElement("style");
  css.textContent =
    ".h2-hide{display:none!important}html.h2-lock{overflow:hidden}" +
    ".h2-hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 2px 10px}.h2-hd b{font-size:16.5px;letter-spacing:-.3px}.h2-hd .mut{font-size:12px}" +
    /* 링 */
    ".h2-rings{display:flex;gap:12px;overflow-x:auto;padding:4px 4px 12px;margin:0 -4px;scrollbar-width:none}.h2-rings::-webkit-scrollbar{display:none}" +
    ".h2-ring{flex:none;display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:0;padding:0;font:inherit;color:var(--text);cursor:pointer;width:64px}" +
    ".h2-ring .o{width:62px;height:62px;border-radius:50%;padding:3px;background:conic-gradient(#f08c00,#e03131,#c2255c,#7048e8,#1c7ed6,#12b886,#f08c00);display:block}" +
    ".h2-ring.seen .o{background:var(--line)}.h2-ring .i{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;background:var(--panel);border:3px solid var(--bg);font-size:27px}" +
    ".h2-ring small{font-size:11.5px;font-weight:700;letter-spacing:-.4px;white-space:nowrap}.h2-ring:active .o{transform:scale(.94)}" +
    /* 세계 */
    ".h2-wg{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.h2-wg .h2-w{grid-column:span 2}.h2-wg .h2-w.big{grid-column:span 3;padding:12px 12px 10px}.h2-w.big b{font-size:30px;letter-spacing:-1.2px}.h2-w.big small{font-size:13px}.h2-w.big em{font-size:12px}.h2-w{display:flex;flex-direction:column;align-items:flex-start;gap:1px;border:0;border-radius:14px;padding:9px 7px 8px;font:inherit;color:#fff;text-align:left;cursor:pointer;min-width:0}" +
    ".h2-w .f{font-size:18px}.h2-w small{font-size:11px;font-weight:700;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.h2-w b{font-size:16.5px;font-weight:900;letter-spacing:-.6px;margin:2px 0}.h2-w em{font-style:normal;font-size:10.5px;opacity:.88;white-space:nowrap}" +
    /* 발견 */
    ".h2-disc{margin:14px 0}.h2-dc{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 2px 6px;scrollbar-width:none}.h2-dc::-webkit-scrollbar{display:none}" +
    ".h2-d{flex:none;width:74%;max-width:300px;min-height:178px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:flex-start;gap:4px;border:0;border-radius:22px;padding:16px 16px 14px;color:#fff;font:inherit;text-align:left;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.18);position:relative;overflow:hidden}" +
    ".h2-d .ic{font-size:30px;line-height:1}.h2-d small{font-size:12.5px;font-weight:700;opacity:.9;margin-top:4px}.h2-d b{font-size:25px;font-weight:900;letter-spacing:-.8px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".h2-d em{font-style:normal;font-size:12.5px;opacity:.88;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.h2-d .go{margin-top:auto;padding-top:8px;font-size:13px;font-weight:800;background:rgba(255,255,255,.18);border-radius:999px;padding:5px 11px}" +
    ".h2-d:after{content:'';position:absolute;right:-30px;top:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)}.h2-d:active{transform:scale(.98)}" +
    /* 지도 */
    ".h2-map{cursor:pointer}.h2-tmw{position:relative;width:100%;aspect-ratio:100/78;border-radius:14px;overflow:hidden}.h2-tm{position:absolute;box-sizing:border-box;border:1.5px solid var(--panel);padding:4px 5px;color:#fff;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}" +
    ".h2-tm span{font-size:12px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.h2-tm b{font-size:13.5px;font-weight:900;white-space:nowrap}.h2-lg{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-top:6px}" +
    /* 스토리 */
    "#h2sv{position:fixed;inset:0;z-index:100050;color:#fff;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 10px) 18px calc(env(safe-area-inset-bottom) + 16px);user-select:none;-webkit-user-select:none;animation:svIn .22s ease}@keyframes svIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}" +
    ".sv-bars{display:flex;gap:4px}.sv-bars i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden}.sv-bars i b{display:block;height:100%;width:0;background:#fff}.sv-bars i.done b{width:100%}" +
    ".sv-top{display:flex;align-items:center;gap:10px;margin-top:12px}.sv-top img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.7)}.sv-top div{flex:1}.sv-top b{display:block;font-size:15px}.sv-top small{font-size:12px;opacity:.75}.sv-top button{background:none;border:0;color:#fff;font-size:24px;padding:4px 8px}" +
    ".sv-ic{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:22px}" +
    ".sv-hero{width:118px;height:118px;border-radius:34px;object-fit:cover;box-shadow:0 14px 36px rgba(0,0,0,.35);border:3px solid rgba(255,255,255,.55);margin-bottom:8px;animation:svPop .45s cubic-bezier(.2,1.4,.4,1)}@keyframes svPop{from{transform:scale(.6) rotate(-6deg);opacity:0}to{transform:none;opacity:1}}" +
    ".s2-list b em{font-style:normal;font-size:12px;font-weight:700;opacity:.7;margin-left:4px}" +
    ".sv-body{flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:10px 4px}.sv-body h2{font-size:21px;font-weight:800;letter-spacing:-.5px;margin:0 0 4px;opacity:.95}" +
    ".s2-k{font-size:15px;font-weight:700;opacity:.85}.s2-big{font-size:68px;font-weight:900;letter-spacing:-2.5px;line-height:1}.s2-big small{font-size:16px;font-weight:700;margin-left:6px;letter-spacing:0;opacity:.85}.s2-big2{font-size:34px;font-weight:900;letter-spacing:-1px;line-height:1.2}.s2-big2 small{font-size:15px;opacity:.8}" +
    "#h2sv .up{color:#ffb4ae}#h2sv .dn{color:#a9c8ff}#h2sv .s2-big.up{color:#fff;text-shadow:0 0 30px rgba(255,90,80,.7)}#h2sv .s2-big.dn{color:#fff;text-shadow:0 0 30px rgba(80,140,255,.8)}" +
    ".s2-row{display:flex;gap:16px;flex-wrap:wrap;font-size:15px}.s2-row b{font-weight:800}.s2-gauge{height:10px;border-radius:5px;background:rgba(80,140,255,.55);overflow:hidden}.s2-gauge i{display:block;height:100%;background:#ff6b6b}" +
    ".s2-p{font-size:15px;line-height:1.55;opacity:.92;margin:4px 0 0}.s2-ul{margin:4px 0 0;padding-left:18px;font-size:14px;line-height:1.55;opacity:.92}.s2-chips{display:flex;flex-wrap:wrap;gap:6px}.s2-chips span{background:rgba(255,255,255,.16);border-radius:999px;padding:6px 11px;font-size:14px;font-weight:700}.s2-chips small{opacity:.75}" +
    ".s2-list>div{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.15)}.s2-list .r{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex:none}.s2-list b{flex:1;min-width:0;font-size:17px}.s2-list b small{display:block;font-size:12.5px;font-weight:500;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s2-list>div>span:last-child{font-size:16px;font-weight:800}" +
    ".s2-bars{display:flex;flex-direction:column;gap:9px}.s2-br{display:grid;grid-template-columns:minmax(0,1.1fr) 1fr auto;gap:10px;align-items:center}.s2-br .n{font-size:15px;font-weight:700;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s2-br .t{position:relative;height:14px;background:rgba(255,255,255,.12);border-radius:7px;overflow:hidden}.s2-br .z{position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.5)}.s2-br .b{position:absolute;top:2px;bottom:2px;border-radius:5px}.s2-br .b.u{background:#ff6b6b}.s2-br .b.d{background:#5c9dff}.s2-br>b{font-size:15px;font-weight:800;min-width:56px;text-align:right}" +
    ".sv-foot{display:flex;flex-direction:column;align-items:center;gap:8px}.sv-cta{width:100%;font:inherit;font-size:16px;font-weight:800;padding:15px;border-radius:16px;border:1.5px solid rgba(255,255,255,.45);background:rgba(255,255,255,.12);color:#fff}.sv-cta.hot{background:#fff;color:#1d2433;border-color:#fff}.sv-foot small{font-size:11.5px;opacity:.6}";
  document.head.appendChild(css);
})();
