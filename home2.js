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
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var k = d == null ? 1 : d, a = Math.abs(+v).toFixed(k); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }   // 🎨 11/04: 「−0.0%」 안 나오게
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
      gj("archive/x/products.json" + q5(), 600000), gj("archive/x/prob.json" + q5()), gj(RAWM + "feeds/hot.json" + q5()), gj("archive/x/pbbrief.json" + q5(), 300000),   // 🎨 11/04: 오늘 한 줄(pbbrief)
      window.SIGNMP || null, gj(RAWM + "market/bear.json" + q5()), gj(RAWM + "market/bubble.json" + q5())   // 🐻 11/09 하락장 계기판 · 🫧 11/10 버블 경보판
    ]).then(function(r){
      D = {kr: r[0], us: r[1], jp: r[2], cn: r[3], hk: r[4], H: r[5] || {}, C: r[6], wp: r[7], wx: r[8], cup: r[9], gap: r[10], pd: r[11], pb: r[12], hot: r[13], brief: r[14], bear: r[16], bub: r[17]};
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

  /* ───────── ⑰ 오늘의 숫자 — 그날 제일 중요한 숫자 하나 + 한 줄 이유 (🎨 11/04 사용자 「오늘 한 줄을 맨 위 큰 글씨로」) ─────────
     한국 장중 = 코스피 지금 · 장 끝난 뒤 = 코스피 마감 · 아침 9시 전 = 밤사이 S&P500. 오를 확률이 70% 넘거나 30% 아래면 그게 더 눈에 띄니 그걸로. 한 줄은 pbbrief(오늘 한 장)의 one 그대로 */
  /* 🔍 11/05 A1 「홈 첫 줄은 결론 한 문장」 — 확률 하나로 겁주지 않게: 오늘 할 일(지키기·지켜보기·담기) + 숫자 2개, 확률은 작게(극단값이면 꼬리표) */
  function numHtml(d){
    var ks = ix(d.kr, "코스피"), sp = ix(d.us, "S&P500"), h = kst().getUTCHours() + kst().getUTCMinutes() / 60, wk = [0, 6].indexOf(kst().getUTCDay()) < 0;
    var pk = d.pb && d.pb.markets && d.pb.markets.KR, p1 = pk && pk.p1 != null ? Math.round(pk.p1 * 100) : null;
    try { var lv_ = pk && window.probLive && probLive(pk, d.kr, d.pb); if (lv_ && lv_.p1 != null) p1 = Math.round(lv_.p1 * 100); } catch(x) {}
    var kLive = ks && wk && h >= 8.9 && h < 15.6 && liveNow(d.kr);
    var kv = ks ? +ks.chg : null, sv = sp ? +sp.chg : null;
    var fut = null; try { var tk = (d.brief && d.brief.talk) || []; tk.forEach(function(t){ var m = /S&P500 선물 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t); if (m) fut = +m[1].replace("−", "-"); }); } catch(x) {}
    // 오늘의 결론 — 한국 하락이 크거나 확률이 낮으면 「지키는 날」, 반대면 「담는 날」, 그 밖엔 「지켜보는 날」
    var px_ = p1 != null && (p1 <= 15 || p1 >= 85);   // 🎲 11/10 #2: 극단 확률은 판정에도 화면에도 안 씀 (−45% 하락장 다음 날 「99%」)
    var down = (kv != null && kv <= -1.5) || (p1 != null && !px_ && p1 <= 30), up = (kv != null && kv >= 1.5) || (p1 != null && !px_ && p1 >= 70);
    var V = down && !up ? {ic: "🛡", t: "오늘은 지키는 날", c: "dn", s: "서둘러 팔기보다 비중·현금 점검"} : up && !down ? {ic: "🚀", t: "오늘은 담는 날", c: "up", s: "계획한 분할 매수를 진행할 때"} : {ic: "👀", t: "오늘은 지켜보는 날", c: "", s: "큰 결정은 미루고 흐름 확인"};
    if (down && fut != null && fut >= 0.8) V.s = "미국 선물 " + sg(fut) + " — 반등 기대도 있음 · 추격 매도 금지";
    /* 🐻 11/09 「쉬운 화면은 🔴 조심하는 장인데 여기는 🚀 담는 날?」 — 하루 등락·확률보다 하락장 계기판(종가 판정)이 먼저.
       🐻 하락장: 바닥 신호 0~1개면 절대 「담는 날」 아님(오늘 반등 = 현금 맞출 기회) · 2개↑면 「조금 담는 날」(신호마다 1/3씩)
       🟡 조정: 「담는 날」 → 「지켜보는 날」로 낮춤 */
    var BM = {}; ((d.bear && d.bear.markets) || []).forEach(function(m){ BM[m.key] = m; });
    var bw = [BM.kospi, BM.sp500].filter(function(m){ return m && m.state === "🐻"; })[0], yw = [BM.kospi, BM.sp500].filter(function(m){ return m && m.state === "🟡"; })[0];
    if (bw){
      var bn = bw.n || 0, nm = bw.name + " 하락장(고점 " + sg(bw.dd) + ")";
      if (bn >= 2) V = {ic: "🌱", t: "오늘은 조금 담는 날", c: "", s: nm + " · 바닥 신호 " + bn + "/4 — 현금 " + bw.cash + "%는 남기고 나눠서만"};
      else V = {ic: "🛡", t: "오늘은 지키는 날", c: "dn", s: nm + " · 바닥 신호 " + bn + "/4 — " + (up ? "오늘 반등은 현금 " + bw.cash + "% 맞출 기회 · 새로 사기는 신호 2개부터" : "현금 " + bw.cash + "%까지 · 투매는 금지")};
    } else if (yw && V.c === "up"){
      V = {ic: "👀", t: "오늘은 지켜보는 날", c: "", s: yw.name + " 조정(고점 " + sg(yw.dd) + ") · 오늘 강해도 추격 말고 계획대로 나눠서"};
    }
    var one = d.brief && d.brief.one ? String(d.brief.one).split(" ｜ ").pop() : "";   // 🧭 11/10 앞 절반(하락장 판정)은 바로 위 「오늘의 결론」과 같은 말
    var nums = [];
    if (ks) nums.push({l: "🇰🇷 코스피" + (kLive ? " 지금" : " " + md(d.kr.date)), v: kv});
    if (fut != null && kLive) nums.push({l: "🇺🇸 S&P 선물", v: fut}); else if (sp) nums.push({l: "🇺🇸 S&P500", v: sv});
    var pr = p1 == null ? "" : px_ ? '<span class="h2-np x" data-goto="prob">🎲 오늘은 확률이 극단으로 튀는 날 — 숫자는 참고하지 않아요 ›</span>' : '<span class="h2-np" data-goto="prob">🎲 ' + (pk && pk.open_now ? "오늘" : "다음 장") + ' 오를 확률 <b>' + p1 + '%</b></span>';
    return '<section class="card h2-num wow-big no-clp" data-xc="1" data-cz="done" data-goto="sector"><div class="h2-vd ' + V.c + '"><span>' + V.ic + '</span><b>' + V.t + '</b></div>' +
      '<div class="h2-vs">' + e(V.s) + '</div><div data-vd></div>' + (one ? '<p>' + e(one) + '</p>' : '') +
      '<div class="h2-nn">' + nums.map(function(n){ return '<div><small>' + e(n.l) + '</small><b class="' + cls(n.v) + '">' + sg(n.v) + '</b></div>'; }).join("") + '</div>' + pr + '<div data-flow></div></section>';
  }
  /* ⑳ 하루 흐름 작은 선 — live_*.json 의 snaps([시각, 오른 수, 내린 수, 지수 등락, …]) */
  function spark(J){
    var S = J && J.snaps; if (!S || S.length < 3) return "";
    var v = S.map(function(s){ return +s[3]; }).filter(function(x){ return !isNaN(x); }); if (v.length < 3) return "";
    var mn = Math.min.apply(null, v.concat([0])), mx = Math.max.apply(null, v.concat([0])), rg = (mx - mn) || 1, W = 100, H = 28;
    var pts = v.map(function(x, i){ return (i / (v.length - 1) * W).toFixed(1) + "," + (H - 2 - (x - mn) / rg * (H - 4)).toFixed(1); }).join(" ");
    var zero = (H - 2 - (0 - mn) / rg * (H - 4)).toFixed(1);
    return '<svg class="h2-sp" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="' + zero + '" x2="100" y2="' + zero + '"/><polyline points="' + pts + '"/></svg>';
  }

  /* ───────── ② 5개 시장 타일 ───────── */
  function worldHtml(d){
    var C = d.C && d.C.markets || {};
    var MK = [["KR", "🇰🇷", "코스피", d.kr, "코스피"], ["US", "🇺🇸", "S&P500", d.us, "S&P500"], ["JP", "🇯🇵", "닛케이", d.jp, "닛케이 225"], ["CN", "🇨🇳", "상해", d.cn, "상해종합"], ["HK", "🇭🇰", "항셍", d.hk, "항셍"]];
    var t = MK.map(function(m){ var x = ix(m[3], m[4]), c = C[m[0]], c5 = c && (c.index || [])[0] && c.index[0].chg5; if (!x) return "";
      var lv = liveNow(m[3]) && m[0] !== "US";
      return '<button type="button" class="h2-w' + (m[0] === "KR" || m[0] === "US" ? " big" : "") + '" data-goto="sector" style="background:' + heatBg(x.chg) + '"><span class="f">' + m[1] + '</span><small>' + m[2] + '</small><b>' + sg(x.chg) + '</b><em>' + (lv ? "● " + e(m[3].t) : wd(m[0] === "US" && m[3].t < "12:00" ? new Date(Date.parse(m[3].date + "T00:00:00Z") - 864e5).toISOString() : m[3].date) + " 마감") + '</em>' + (c5 != null ? '<em>5일 ' + sg(c5) + '</em>' : '') + (lv ? spark(m[3]) : '') + '</button>'; }).join("");
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
    if (L && L.inv != null) C.push({tab: "luck", c: ["#2b1747", "#c2255c"], ic: "🔮", k: L ? L.name + " 님 오늘 투자운" : "오늘의 운세 · 타로", big: L && L.inv != null ? L.inv + "점" : "생일만 넣으면", sub: L ? "재미로 보는 오늘 기운" : "점수 · 행운의 색 · 투자운까지", go: "운세 보기"});
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
  /* 🗺 11/05 사용자 「깔끔하게 쫌」 — 칸이 15개라 글자가 잘리고 겹쳤음 → 큰 업종 9개 + 「그 밖」 한 칸 · 칸 안 그림 없앰 ·
     글자 크기는 칸의 실제 크기에 맞춰(fitMap) — 좁으면 이름은 빼고 숫자만, 아주 작으면 둘 다 뺌(누르면 보임) */
  function mapHtml(d){
    var useKr = d.kr && d.kr.sectors && (liveNow(d.kr) || !(d.us && d.us.sectors) || (kst().getUTCHours() >= 9 && kst().getUTCHours() < 22 && [0, 6].indexOf(kst().getUTCDay()) < 0));
    var J = useKr ? d.kr : d.us; if (!J || !J.sectors) return "";
    var all = J.sectors.filter(function(s){ return s.n >= 5; }).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, "").split(/[·\/]/)[0].trim(), ic: s.icon || "", v: s.r, w: Math.pow(s.n, 0.6), cnt: s.n, big: (s.big || []).slice(0, 3), up: s.up, down: s.down}; }).sort(function(a, b){ return b.w - a.w; });
    if (all.length < 6) return "";
    var it = all.slice(0, 12);   // 종목 수가 많은 큰 업종 12개만 (작은 업종은 시장 흐름 탭에)
    var W = 100, Hh = 78, R = squarify(it, 0, 0, W, Hh);
    var cells = R.map(function(r, k){
      return '<div class="h2-tm" data-k="' + k + '" style="left:' + r.x.toFixed(2) + '%;top:' + (r.y / Hh * 100).toFixed(2) + '%;width:' + r.w.toFixed(2) + '%;height:' + (r.h / Hh * 100).toFixed(2) + '%;background:' + heatBg(r.it.v) + '"><span>' + e(r.it.n) + '</span><b>' + sg(r.it.v) + '</b></div>'; }).join("");
    var when = useKr ? (liveNow(d.kr) ? "지금 " + d.kr.t : md(d.kr.date) + " 마감") : "미국 " + (d.us.t && d.us.t < "12:00" ? md(new Date(Date.parse(d.us.date + "T00:00:00Z") - 864e5).toISOString()) : md(d.us.date)) + " 마감";
    MAPIT = R.map(function(r){ return r.it; });
    return '<section class="card h2-map"><div class="h2-hd h2-mh" data-goto="sector"><b>' + (useKr ? "🇰🇷 한국" : "🇺🇸 미국") + ' 업종 지도</b><span class="mut">' + e(when) + ' · 큰 업종 ' + it.length + '개 · 칸을 누르면 대표 종목</span></div><div class="h2-tmw" data-nofs>' + cells + '</div><div class="h2-pick" id="h2pick"></div><div class="h2-lg" data-nofs><span class="dn">■ 내림</span><span class="up">오름 ■</span></div></section>';
  }
  function fitMap(){
    [].forEach.call(document.querySelectorAll(".h2-tm"), function(c){
      var w = c.clientWidth, h = c.clientHeight, sp = c.querySelector("span"), b = c.querySelector("b"); if (!w || !sp || !b) return;
      var vl = (b.textContent || "").length, nl = Math.max(2, (sp.textContent || "").length);
      var vf = Math.max(10, Math.min(20, h / 2.6, (w - 12) / (vl * 0.7))), nf = Math.max(10, Math.min(14, h / 4, (w - 8) / (nl * 0.95)));
      b.style.setProperty("font-size", vf.toFixed(1) + "px", "important"); sp.style.setProperty("font-size", nf.toFixed(1) + "px", "important");
      sp.style.display = (w >= 54 && h >= 46) ? "" : "none";
      b.style.display = (w >= 36 && h >= 22) ? "" : "none";
      b.dataset.wfs = sp.dataset.wfs = "1"; b.dataset.f13 = sp.dataset.f13 = "1";
    });
  }
  window.addEventListener("resize", function(){ setTimeout(fitMap, 100); });
  function mapPick(k){   // ⑲ 🎨 11/04 업종 칸 터치 → 대표 종목 3개 (사용자 「지금은 보기만 함」)
    var it = MAPIT[k], box = document.getElementById("h2pick"); if (!it || !box) return;
    [].forEach.call(document.querySelectorAll(".h2-tm.on"), function(x){ x.classList.remove("on"); });
    if (box.dataset.k === String(k)){ box.innerHTML = ""; box.dataset.k = ""; return; }
    var t = document.querySelector('.h2-tm[data-k="' + k + '"]'); if (t) t.classList.add("on");
    box.dataset.k = String(k);
    box.innerHTML = '<div class="h2-ph"><b>' + e(it.ic + " " + it.n) + ' <span class="' + cls(it.v) + '">' + sg(it.v) + '</span></b><small>' + (it.rest ? '' : '오른 ' + (it.up || 0) + ' · 내린 ' + (it.down || 0)) + '</small></div>' + (it.rest ? '<p class="note" style="margin:0 0 6px">' + e(it.rest.join(" · ")) + '</p>' : '') +
      (it.big.length ? it.big.map(function(x){ return '<button type="button" class="h2-pr" data-op="' + e(x.s) + '"><b>' + e(x.n) + '</b><em>' + e(String(x.s).replace(/\.(KS|KQ)$/, "")) + '</em><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></button>'; }).join("") : '<p class="note">대표 종목 자료가 없어요.</p>');
  }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest(".h2-tm[data-k]"); if (!t || !t.closest("#h2map")) return; ev.stopPropagation(); ev.preventDefault(); mapPick(+t.dataset.k); }, true);
  /* ㉑ 고객에게 보낼 한 장 미리보기 — 홈에서 바로 「보내기」 (onepage.js 의 고르기 창을 엶) */
  /* 🔍 11/05 A3 「한 장」 3개(고객에게 보낼 한 장 · ☀️ 오늘 한 장 · 📨 이번 주 한 장)를 카드 하나로 — 위 탭 3칸 */
  var CLT = "c";
  function clientHtml(d){
    var b = d.brief; if (!b || !b.one) return "";
    var tk = (b.talk || []).slice(0, 2), A = b.advice || {};
    var fri = (function(){ var k = kst(), w = k.getUTCDay(), hh = k.getUTCHours(); return (w === 5 && hh >= 15) || w === 6 || w === 0; })();
    var pane = {
      c: '<div class="h2-clp"><div class="h2-clt">' + e(b.one) + '</div>' + (tk.length ? '<ul>' + tk.map(function(x){ return '<li>' + e(x) + '</li>'; }).join("") + '</ul>' : '') + (A.read ? '<p>' + e(A.read) + '</p>' : '') + '</div>' +
         '<button type="button" class="h2-clb" data-clgo="op">📨 카톡으로 보내기 — 한 장 고르기</button>',
      p: '<div class="h2-clp">' + (b.regime ? '<div class="h2-clr">' + e(b.regime) + '</div>' : '') + '<ul>' + (b.talk || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("") + '</ul>' +
         ((b.events || []).length ? '<div class="h2-cle"><b>📅 오늘 일정</b>' + b.events.map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') +
         ((A.plan || []).length ? '<div class="h2-cle"><b>🧭 대응</b>' + A.plan.slice(0, 2).map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') + '</div>' +
         '<button type="button" class="h2-clb alt" data-clgo="pb">☀️ PB용 한 장 그림으로 받기</button>',
      w: '<div class="h2-clp"><div class="h2-clt">' + (fri ? "이번 주 한 장이 준비됐어요" : "금요일 장이 끝나면 이번 주 한 장이 열려요") + '</div><p>' + (fri ? "이번 주 지수·업종·포트 흐름을 고객용 그림 한 장으로 만들어 드려요." : "지금 눌러도 지난 금요일까지의 주간 요약으로 만들 수 있어요.") + '</p></div>' +
         '<button type="button" class="h2-clb" data-clgo="wk">📨 이번 주 한 장 만들기</button>'
    };
    if (fri && CLT === "c" && !ls("h2_clt_pick")) CLT = "w";
    var tabs = [["c", "👥 고객용"], ["p", "📋 PB 요약"], ["w", "📅 이번 주"]];
    return '<section class="card h2-cl no-clp" data-cz="done" data-xc="1"><div class="h2-hd"><b>📨 오늘의 한 장</b><span class="mut">' + e(b.label || "") + '</span></div>' +
      '<div class="h2-clt3">' + tabs.map(function(t){ return '<button type="button" data-clt="' + t[0] + '"' + (CLT === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>'; }).join("") + '</div>' +
      '<div class="h2-clw">' + tabs.map(function(t){ return '<div data-clp="' + t[0] + '"' + (CLT === t[0] ? '' : ' hidden') + '>' + pane[t[0]] + '</div>'; }).join("") + '</div></section>';
  }
  function clientBind(root){
    [].forEach.call(root.querySelectorAll("[data-clt]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); CLT = x.dataset.clt; ls("h2_clt_pick", 1);
      [].forEach.call(root.querySelectorAll("[data-clt]"), function(y){ y.classList.toggle("on", y === x); });
      [].forEach.call(root.querySelectorAll("[data-clp]"), function(y){ y.hidden = y.dataset.clp !== CLT; }); }; });
    [].forEach.call(root.querySelectorAll("[data-clgo]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var k = x.dataset.clgo;
      if (k === "wk"){ if (window.__weekSend) __weekSend(); else if (window.toast) window.toast("잠시 뒤 다시 눌러 주세요"); return; }
      if (k === "pb"){ var pc = document.querySelector("#pbcard .pb-ft button, #pbcard [data-pbsend], #pbcard button"); if (pc){ pc.click(); return; } }
      var ob = document.getElementById("opbtn"); if (ob) ob.click(); else if (window.goTo) goTo("home"); }; });
  }

  /* ───────── 붙이기 ───────── */
  var CUR_S = null, BUSY = false;
  /* 🐻 11/09 하락장 계기판 — 사용자 「하락장이면 현금 늘리라 권하고, 바닥이면 이 조건 충족 시 비중 늘리자 — 네가 설명하고 이끌어」
     market/bear.json(src/bear_gate.py, 종가 기계 판정): 시장별 🟢/🟡/🐻 · 현금 권고 · 🌱 바닥 신호 4개. 결론 한 줄 + 펼치면 체크리스트 */
  /* 🏁 11/11 사용자 「각 시장에 고친 방식을 적용하고 신호, 설명창도 추가」 — 시장마다 채택한 방식(best_bt 1등) · 지금 켜진 신호 · 누르면 쉬운 설명 */
  var METH = {
    kospi: {t: "흔들리면 전부 현금", how: "하락장(고점 −20%) · 신용 경보 + 200일선 아래 · 버블 시계 4시 반 — 셋 중 하나라도 켜지면 주식 몫 전부 현금",
            back: "바닥이 다져지고(저점 10일 넘게 안 깨짐) 50일선 위로 올라오면 다시 주식 (하락장은 판정이 풀릴 때)",
            why: "1999년부터 다시 돌려 보니 1년 수익 9.7% → 10.7% · 가장 크게 잃은 폭 −29% → −26% (그냥 들고 있기 8.8% · −56%)",
            note: "2013년 뒤만 보면 이전 규칙보다 조금 낮았어요(9.1% → 7.9%) — 2000·2008 같은 큰 하락을 피한 덕이 커요"},
    kosdaq: {t: "버블 시계 6시면 전부 현금", how: "버블 시계가 6시를 넘으면 주식 몫 전부 현금",
            back: "신저가가 나온 뒤 바닥 신호가 4개 중 3개 켜지면 다시 주식",
            why: "그냥 들고 있으면 1년 −0.8%(손해)였는데 이 방식은 +4.7% · 가장 크게 잃은 폭 −72% → −51%", note: ""},
    sp500: {t: "흔들리면 절반만 채권", how: "고점 −10%(조정) · 또는 신용 경보 + 200일선 아래 — 켜지면 주식 몫 절반을 채권형(중기국채)으로",
            back: "신저가가 나온 뒤 바닥 신호가 켜지면 다시 주식 (신저가 없이 회복하면 바로 복귀)",
            why: "1년 수익 8.6% → 9.4% · 가장 크게 잃은 폭 −55% → −40% · 현금으로 빼면 2013년 뒤엔 손해였고 채권 절반이 가장 나았어요", note: ""},
    nasdaq: {t: "그냥 들고 있기", how: "신호가 와도 팔지 않아요", back: "—",
            why: "200가지 넘게 돌려 봤는데 2012년까지와 2013년 뒤를 둘 다 이긴 방식이 없었어요 — 크게 빠져도 빨리 회복해서 팔면 손해", note: "크게 흔들리는 시장이라 처음부터 비중을 적당히 두는 게 방패예요"}
  };
  function methHtml(B){
    var FL = {kr: "🇰🇷", us: "🇺🇸"};
    var rows = (B.markets || []).map(function(m){
      var D = METH[m.key]; if (!D) return "";
      var b = m.best || {}, ck = m.checks || [], nb = ck.filter(function(c){ return c.on; }).length;
      var sig = [];
      if (m.key === "kospi") sig = [["하락장", m.state === "🐻"], ["신용 경보", !!(m.clock && m.clock.kospi_on)], ["시계 4시 반", !!b.on]];
      else if (m.key === "kosdaq") sig = [["시계 6시", !!b.on]];
      else if (m.key === "sp500") sig = [["고점 −10%", !!(m.b50 && m.b50.on)], ["신용 경보+200일선", !!b.on]];
      var out = m.cash || 0, to = m.to || "현금";
      var now = m.key === "nasdaq" ? "주식 그대로" : out ? "주식 " + (100 - out) + "% · " + to + " " + out + "%" : "주식 100%";
      var backNow = out && m.key !== "nasdaq" ? '<div class="bm-back">🌱 다시 사는 신호 <b>' + nb + '/4</b> — ' + e(D.back) + '</div>' : "";
      return '<details class="bm-r' + (out ? " on" : "") + '"><summary><span class="bm-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>' + e(D.t) + '</small></span>' +
        '<span class="bm-now"><b>' + e(now) + '</b>' + (sig.length ? '<span class="bm-sg">' + sig.map(function(x){ return '<i class="' + (x[1] ? "on" : "") + '">' + (x[1] ? "🔴 " : "⚪ ") + e(x[0]) + '</i>'; }).join("") + '</span>' : '') + '</span></summary>' +
        '<div class="bm-x"><p><b>언제 옮기나</b> ' + e(D.how) + '</p>' + (m.key !== "nasdaq" ? '<p><b>언제 다시 사나</b> ' + e(D.back) + '</p>' : '') +
        '<p><b>왜 이 방식</b> ' + e(D.why) + '</p>' + (D.note ? '<p class="bm-note">' + e(D.note) + '</p>' : '') +
        (b.since && b.on ? '<p class="bm-note">' + e((sig.filter(function(x){ return x[0].indexOf("시계") >= 0 || x[0].indexOf("신용") >= 0; })[0] || ["신호"])[0]) + ' 켜진 날 ' + e(md(b.since)) + ' · 대리 버블 시계 지금 ' + (b.h_free != null ? b.h_free + "시" : "–") + '</p>' : '') +
        '</div>' + backNow + '</details>';
    }).join("");
    return '<div class="bm"><div class="bm-h">🏁 시장별 방식 <small>1999년부터 200여 가지를 돌려 고른 1등 · 누르면 설명</small></div>' + rows + '</div>';
  }
  function bearHtml(d){
    var B = d.bear; if (!B || !B.markets || !B.markets.length) return "";
    var M_ = B.markets, bad = M_.filter(function(m){ return m.state !== "🟢"; });
    var FL = {kr: "🇰🇷", us: "🇺🇸"}, NM = {"🟢": "정상", "🟡": "조정", "🐻": "하락장"};
    var chips = M_.map(function(m){ return '<span class="bg-c s' + (m.state === "🐻" ? 3 : m.state === "🟡" ? 2 : 1) + '">' + FL[m.nat] + ' ' + e(m.name) + ' <b>' + m.state + ' ' + NM[m.state] + '</b><small>' + sg(m.dd, 0) + '</small></span>'; }).join("");
    var lead = bad.length ? B.lead : "네 시장 모두 정상 — 현금을 따로 늘릴 때 아님";
    var det = bad.map(function(m){
      var ladder = m.state === "🐻" ? [30, 30, 20, 10, 0] : [10, 10, 5, 0, 0];
      return '<div class="bg-m"><div class="bg-mh">' + FL[m.nat] + ' <b>' + e(m.name) + '</b> ' + m.state + ' ' + NM[m.state] + ' · 고점보다 ' + sg(m.dd) + ' · 지금 권고 현금 <b>' + m.cash + '%</b></div>' +
        (m.rule && m.rule.id === "OFF" ? '<div class="bg-n">⏸ 이 시장은 현금 규칙을 꺼 뒀어요 — 2013년 이후엔 어떤 현금 규칙도 그냥 보유를 못 이겼어요 · 판정과 아래 신호는 참고</div>'
          : m.rule && !m.nuse ? '<div class="bg-n">🌱 ' + e(m.rule.name) + ' · 아래 신호는 참고</div>'
          : '<div class="bg-n">🌱 다시 사는 조건 <b>' + m.n + '/' + (m.nuse || 4) + '</b> — ' + e(m.rule ? m.rule.name : "켜질수록 3분의 1씩 다시 사기") + '</div>') +   // 🌱 11/09 시장별 다시 사기 규칙
        (window.__bearSigHead ? __bearSigHead(m) : '') +   // 🌱 11/09 A11/9-1 과거 성적표 (ux1109b.js)
        '<ul class="bg-ck">' + (m.checks || []).map(function(c, k){ return '<li class="' + (c.on ? "on" : "") + '"><i>' + (c.on ? "✅" : "⬜") + '</i><b>' + e(c.k) + (c.use === false ? ' <em class="bg-ref">참고</em>' : '') + '</b><small>' + e(c.d) + '</small>' + (window.__bearSigLine ? __bearSigLine(m, k) : '') + '</li>'; }).join("") + '</ul>' +
        '<div class="bg-lad">' + (m.ladder ? m.ladder.map(function(x){ return [x[0], x[1]]; }) : [[ladder[0], "신호 0~1개"], [ladder[2], "2개"], [ladder[3], "3개"], [ladder[4], "4개"]]).map(function(x, i, A){ var now = m.ladder && m.ladder.length ? x[0] === m.cash : Math.max(0, m.n - 1) === i; return '<span class="' + (now ? "now" : "") + '"><small>' + e(x[1]) + '</small><b>' + e(m.to || '현금') + ' ' + x[0] + '%</b></span>'; }).join("") + '</div>' +
        '<p class="bg-ad">' + e(m.advice) + '</p></div>';
    }).join("");
    return '<section class="card h2-bear" id="bear" data-cz="done"><div class="bg-h">🐻 하락장 계기판 <small>' + e(md(B.at)) + ' ' + e(String(B.at || "").slice(11, 16)) + ' · 종가 판정</small></div>' +
      '<div class="bg-cs">' + chips + '</div><p class="bg-lead' + (bad.length ? " warn" : "") + '">' + e(lead) + '</p>' + methHtml(B) +
      (bad.length ? '<details class="bg-d"><summary>무엇을 보면 다시 사나 · 체크리스트 펼치기</summary>' + det +
        '<p class="note bg-ru">판정: 고점보다 −10% 조정 · −20% 하락장 (종가) · 현금 권고(11/11부터): 위 🏁 시장별 방식 — 1999년부터 200여 가지를 돌려 2012년까지·2013년 뒤 둘 다 그냥 들고 있기를 이긴 것 중 수익 1등(best_bt). 판정 규칙은 결과 보기 전 등록 · 매수·매도 추천 아님 — 고객 성향·기간에 맞춰 판단.</p></details>' : '') +
      '</section>';
  }
  function apply(){
    if (!on() || typeof cur === "undefined" || cur !== "home") return;
    var b = document.getElementById("hmbody"); if (!b || BUSY) return;
    // 🧊 11/09 ⑪ 쉬운 화면에서 「오늘 자세히 보기」를 안 열었으면 무거운 자료(상품 0.9MB·나침반 0.7MB 등)를 받지 않음 — 열 때 받음
    if (document.documentElement.getAttribute("data-ez") === "easy" && !b.classList.contains("ez-open")) return;
    var hero = document.getElementById("tdhero"); if (!hero) return;
    if (b.getAttribute("data-h2") === String(DT) && document.getElementById("h2rings")) return reorder(b);
    BUSY = true;
    load().then(function(d){
      BUSY = false; if (!d || cur !== "home") return;
      var S = stories(d); CUR_S = S;
      ["h2rings", "h2world", "h2disc", "h2map", "h2num", "h2cl"].forEach(function(id){ var x = document.getElementById(id); if (x) x.remove(); });
      var mk = function(id, html){ var w = document.createElement("div"); w.id = id; w.innerHTML = html; return w; };
      var rings = mk("h2ringsw", ringsHtml(S)); rings.id = "h2ringsw";
      var old = document.getElementById("h2ringsw"); if (old) old.remove();
      b.insertBefore(rings, b.firstChild);
      var num = mk("h2num", numHtml(d)); b.insertBefore(num, b.firstChild);   // ⑰ 오늘의 숫자 맨 위
      var ob = document.getElementById("h2bear"); if (ob) ob.remove(); var bh = bearHtml(d); if (bh) num.insertAdjacentElement("afterend", mk("h2bear", bh));   // 🐻 11/09 결론 바로 아래
      var obb = document.getElementById("h2bub"); if (obb) obb.remove(); try { var bbh = window.__bubCard ? __bubCard(d.bub) : ""; if (bbh) (document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2bub", bbh)); } catch(x) {}   // 🫧 11/10 버블 경보판 — 계기판 바로 아래 (ux1110b.js)
      var orb = document.getElementById("h2reb"); if (orb) orb.remove();   // 📨 11/10 A11/10-1 반등 날 기록 — 🛡 결론 밑 · 계기판 위 (ux1110.js · 반등 날에만)
      try { var kx_ = ix(d.kr, "코스피"), rh = window.__rebCard && kx_ && d.kr && d.kr.date === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) ? __rebCard(d.bear, kx_.chg, "home") : ""; if (rh) num.insertAdjacentElement("afterend", mk("h2reb", rh)); } catch(x) {}
      var world = mk("h2world", worldHtml(d)), disc = mk("h2disc", discHtml(d)), map = mk("h2map", mapHtml(d)), cl = mk("h2cl", clientHtml(d));
      rings.insertAdjacentElement("afterend", world); world.insertAdjacentElement("afterend", hero);   // 날씨판은 타일 아래로
      hero.insertAdjacentElement("afterend", disc);
      var pl = b.querySelector("section.card.pl"); (pl || disc).insertAdjacentElement("afterend", map); map.insertAdjacentElement("afterend", cl);
      clientBind(cl);
      setTimeout(fitMap, 30); setTimeout(fitMap, 600);
      world.querySelector(".card") && world.querySelector(".card").setAttribute("data-cz", "done"); map.querySelector(".card") && map.querySelector(".card").setAttribute("data-cz", "done");
      b.setAttribute("data-h2", String(DT));
      [].forEach.call(rings.querySelectorAll("[data-st]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); openStory(S, +x.dataset.st); }; });
      reorder(b);
    }).catch(function(x){ BUSY = false; console.warn("home2", x); });
  }
  window.__h2apply = function(){ try { apply(); } catch(x) {} };
  function reorder(b){   // v2에선 「오늘 한 장」·「바뀐 것」·5개 시장과 겹치는 띠는 아래로 / 숨김
    var hm = document.getElementById("hmlive"); if (hm) hm.classList.add("h2-hide");
    var more = b.querySelector(".hm-more"); if (more) more.classList.add("h2-hide");   // 아래 바로가기 줄 → 「오늘의 발견」이 대신
    var nm_ = document.getElementById("h2num"); if (nm_ && b.firstElementChild !== nm_) b.insertBefore(nm_, b.firstChild);
    var br_ = document.getElementById("h2bear"); if (nm_ && br_ && nm_.nextElementSibling !== br_) nm_.insertAdjacentElement("afterend", br_);
    var bb_ = document.getElementById("h2bub"), ba_ = br_ || nm_; if (ba_ && bb_ && ba_.nextElementSibling !== bb_) ba_.insertAdjacentElement("afterend", bb_);
    var hz = document.getElementById("tdhero"), wz = document.getElementById("h2world"); if (hz && wz && wz.nextElementSibling !== hz) wz.insertAdjacentElement("afterend", hz);
    // 🔍 11/05 A3: ☀️ 오늘 한 장 · 📨 이번 주 한 장 카드는 「📨 오늘의 한 장」 탭으로 합쳤으니 홈에선 숨김(보내기 단추는 그대로 씀)
    var pb = document.getElementById("pbcard"); if (pb && document.getElementById("h2cl")) pb.classList.add("h2-hide");
    var w1 = document.getElementById("wk1"); if (w1 && document.getElementById("h2cl")) w1.classList.add("h2-hide");
    // 🔍 11/05 A2: 홈은 4장만 펼침 — 나머지는 제목 한 줄(펼치기). 날씨판·발견·바뀐 것 등에 제목을 달아 둠(calm.js 가 접음)
    var hz2 = document.getElementById("tdhero"); if (hz2 && !hz2.dataset.czt) hz2.dataset.czt = "🌤 지금 시장 날씨";
    var dz = document.querySelector("#h2disc .h2-disc"); if (dz && !dz.dataset.czt){ dz.dataset.czt = "✨ 오늘의 발견"; dz.classList.add("card"); }
    var vt = b.querySelector(".hb-vote"); if (vt) vt.setAttribute("data-cz", "done");
  }
  var T = 0;
  try { new MutationObserver(function(ms){
    if (!on()) return;
    for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && t.closest("#h2ringsw,#h2world,#h2disc,#h2map,#h2sv,#h2bear,#h2bub")) continue; if (T) return; T = setTimeout(function(){ T = 0; apply(); }, 200); return; }
  }).observe(document.getElementById("main") || document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (on() && !document.hidden && typeof cur !== "undefined" && cur === "home"){ DT = 0; var b = document.getElementById("hmbody"); if (b) b.removeAttribute("data-h2"); apply(); } }, 5 * 60e3);

  var css = document.createElement("style");
  css.textContent =
    ".h2-hide{display:none!important}html.h2-lock{overflow:hidden}" +
    ".h2-bear{padding:16px 16px 14px!important}.bg-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bg-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".bg-cs{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 8px}.bg-c{display:inline-flex;align-items:baseline;gap:4px;font-size:13.5px;border-radius:12px;padding:7px 10px;background:var(--panel2)}.bg-c b{font-weight:800}.bg-c small{font-size:12px;color:var(--sub);font-weight:700}" +
    ".bg-c.s3{background:rgba(47,111,221,.14);box-shadow:inset 0 0 0 1.5px rgba(47,111,221,.45)}.bg-c.s2{background:rgba(240,180,60,.16)}.bg-c.s1{opacity:.85}" +
    ".bg-lead{margin:0;font-size:15.5px;line-height:1.5;font-weight:700;word-break:keep-all;text-wrap:pretty}.bg-lead.warn{color:var(--text)}" +
    ".bg-d{margin-top:10px}.bg-d summary{cursor:pointer;font-size:14px;font-weight:800;color:var(--accent,#3182f6);list-style:none}.bg-d summary::-webkit-details-marker{display:none}.bg-d summary:after{content:' ▾'}.bg-d[open] summary:after{content:' ▴'}" +
    ".bg-m{background:var(--panel2);border-radius:14px;padding:12px;margin-top:10px}.bg-mh{font-size:14.5px;line-height:1.5;word-break:keep-all}.bg-n{font-size:14px;font-weight:700;margin:6px 0 4px}" +
    ".bg-ck{list-style:none;margin:0;padding:0}.bg-ck li{display:grid;grid-template-columns:22px 1fr;column-gap:4px;padding:5px 0;border-top:1px solid var(--line,rgba(0,0,0,.06));font-size:14px}.bg-ck li i{font-style:normal;grid-row:span 2}.bg-ck li b{font-weight:700}.bg-ck li small{color:var(--sub);font-size:12.5px;word-break:keep-all}.bg-ck li.on b{color:var(--up,#f04452)}" +
    ".bg-lad{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:8px 0 6px}.bg-lad span{text-align:center;border-radius:10px;padding:6px 2px;background:var(--panel,#fff);opacity:.6}.bg-lad span.now{opacity:1;box-shadow:inset 0 0 0 2px var(--accent,#3182f6)}.bg-lad small{display:block;font-size:11.5px;color:var(--sub);font-weight:700}.bg-lad b{font-size:14px;font-weight:900}" +
    ".bm{margin:12px 0 4px}.bm-h{font-size:14px;font-weight:900;margin-bottom:6px}.bm-h small{display:block;font-size:11.5px;font-weight:600;color:var(--sub);margin-top:1px}" +
    ".bm-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.bm-r.on{box-shadow:inset 3px 0 0 #e5484d}.bm-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.bm-r>summary::-webkit-details-marker{display:none}" +
    ".bm-n{min-width:0}.bm-n b{font-size:14px;font-weight:900}.bm-n small{display:block;font-size:12px;color:var(--sub);font-weight:700;margin-top:1px}.bm-now{text-align:right;flex:0 0 auto;max-width:58%}.bm-now>b{font-size:13.5px;font-weight:900;white-space:nowrap}" +
    ".bm-sg{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:3px;margin-top:4px}.bm-sg i{font-style:normal;font-size:11px;font-weight:700;padding:1px 6px;border-radius:999px;background:rgba(127,127,127,.12);color:var(--sub);white-space:nowrap}.bm-sg i.on{background:rgba(229,72,77,.14);color:#e5484d}" +
    ".bm-x{margin-top:8px;font-size:13px;line-height:1.55;word-break:keep-all}.bm-x p{margin:4px 0 0}.bm-x b{font-weight:800;margin-right:4px}.bm-note{color:var(--sub);font-size:12px}.bm-back{margin-top:6px;font-size:12.5px;font-weight:600;word-break:keep-all}.bm-back b{color:#30a46c}" +
    ".bg-ad{margin:4px 0 0;font-size:14px;line-height:1.5;font-weight:600;word-break:keep-all}.bg-ru{font-size:12px;margin:10px 0 0}" +
    /* 🔍 11/05 A1 오늘의 결론 · A3 한 장 탭 */
    ".h2-vd{display:flex;align-items:center;gap:8px;margin:0 0 2px}.h2-num .h2-vd span{font-size:28px}.h2-num .h2-vd b{display:inline;margin:0;font-size:clamp(26px,8vw,32px);font-weight:900;letter-spacing:-1px;line-height:1.15}.h2-num .h2-vd.dn b{color:var(--down,#3182f6)}.h2-num .h2-vd.up b{color:var(--up,#f04452)}" +
    ".h2-vs{font-size:14.5px;font-weight:700;color:var(--sub);margin:2px 0 10px}" +
    ".h2-nn{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 8px}.h2-num .h2-nn div{background:var(--panel2);border-radius:14px;padding:10px 12px}.h2-num .h2-nn small{display:block;font-size:13px;font-weight:700;color:var(--sub)}.h2-num .h2-nn b{display:block;font-size:26px;font-weight:900;letter-spacing:-.8px;margin-top:2px}.h2-num .h2-nn b.up{color:var(--up,#f04452)}.h2-num .h2-nn b.dn{color:var(--down,#3182f6)}" +
    ".h2-np{display:inline-flex;align-items:center;gap:4px;font-size:13.5px;color:var(--sub);cursor:pointer}.h2-num .h2-np b{display:inline;font-size:inherit;margin:0;letter-spacing:0;line-height:inherit;color:var(--text)}.h2-np em{font-style:normal;font-size:12px;font-weight:800;color:#b7791f;background:rgba(240,180,60,.18);border-radius:999px;padding:2px 8px}" +
    ".h2-clt3{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:var(--panel2);border-radius:12px;padding:4px;margin-bottom:10px}.h2-clt3 button{font:inherit;font-size:14px;font-weight:800;border:0;border-radius:9px;padding:9px 4px;background:transparent;color:var(--sub)}.h2-clt3 button.on{background:var(--panel);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.12)}" +
    ".h2-clr{font-size:14px;font-weight:700;margin-bottom:6px}.h2-cle{margin-top:10px;font-size:14px;line-height:1.5}.h2-cle b{display:block;font-size:14px;margin-bottom:2px}.h2-cle div{padding:2px 0;color:var(--text)}.h2-clb.alt{background:var(--panel2);color:var(--text);border:1px solid var(--line)}" +
    /* ⑰ 오늘의 숫자 */
    ".h2-num{cursor:pointer;padding:22px 20px 18px!important}.h2-num small{display:block;font-size:14px;font-weight:700;color:var(--sub);letter-spacing:-.2px}.h2-num b{display:block;font-size:clamp(40px,12vw,54px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin:4px 0 6px}" +
    ".h2-num b.up{color:var(--up,#f04452)}.h2-num b.dn{color:var(--down,#3182f6)}.h2-num p{margin:0;font-size:16.5px;line-height:1.5;font-weight:600;word-break:keep-all;text-wrap:pretty}.h2-nsub{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.h2-nsub span{font-size:13px;font-weight:700;color:var(--sub);background:var(--panel2);border-radius:999px;padding:4px 10px}" +
    /* ⑳ 타일 안 하루 흐름 */
    ".h2-w{position:relative;overflow:hidden}.h2-sp{position:absolute;left:0;right:0;bottom:0;width:100%;height:30%;opacity:.5}.h2-sp line{stroke:#fff;stroke-width:.6;stroke-dasharray:2 2;vector-effect:non-scaling-stroke}.h2-sp polyline{fill:none;stroke:#fff;stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}" +
    /* ⑲ 지도 터치 */
    ".h2-tm.on{outline:3px solid #fff;outline-offset:-3px;z-index:2}.h2-pick{margin-top:8px}.h2-ph{display:flex;justify-content:space-between;align-items:baseline;padding:8px 2px 4px}.h2-ph b{font-size:16.5px}.h2-ph small{color:var(--sub);font-size:13px}" +
    ".h2-pr{display:flex;align-items:center;gap:8px;width:100%;font:inherit;text-align:left;padding:10px 4px;border:0;border-top:1px solid var(--line);background:transparent;color:var(--text)}.h2-pr b{font-size:15.5px;font-weight:700}.h2-pr em{font-style:normal;font-size:13px;color:var(--dim)}.h2-pr span{margin-left:auto;font-weight:800;font-size:15.5px}" +
    /* ㉑ 고객 한 장 */
    ".h2-clp{background:var(--panel2);border-radius:14px;padding:14px 16px;margin-bottom:12px}.h2-clt{font-size:17px;font-weight:800;letter-spacing:-.3px;line-height:1.4;margin-bottom:8px}.h2-clp ul{margin:0;padding-left:18px;font-size:14px;line-height:1.55;color:var(--sub)}.h2-clp p{margin:8px 0 0;font-size:14px;line-height:1.55;color:var(--sub)}" +
    ".h2-clb{display:block;width:100%;font:inherit;font-size:16px;font-weight:800;padding:14px;border-radius:14px;border:0;background:#fee500;color:#191600}" +
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
    ".h2-tm span{font-size:12px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;opacity:.95}.h2-tm b{font-size:13.5px;font-weight:900;white-space:nowrap;letter-spacing:-.5px;line-height:1.15;max-width:100%;overflow:hidden}" +
    ".h2-mh{display:block!important}.h2-mh b{display:block;font-size:18px}.h2-mh .mut{display:block;font-size:13px;margin-top:2px}.h2-lg{justify-content:space-between}.h2-lg{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-top:6px}" +
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
