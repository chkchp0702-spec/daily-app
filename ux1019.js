/* 🎲 10/19 「오늘, 확률로 말하면」 — 🏠 오늘 탭 맨 위 한 장
   사용자 10/19: "시황두뇌랑 시장확률을 이렇게 열심히 돌리고 있는데 틀려도 좋으니 확률적으로 이렇다 라고
   오늘 카테고리 처음에 좀 강하게 얘기를 해라 · 쉽고 직관적이게 · 그때 그때 바꿔서"
   자료: archive/x/prob.json(🎲 매시간) · market/home.json brain(🧠 매시간) · brain/state.json theses
   시간대에 따라 주인공 시장이 바뀐다: 한국 장 전·장중 = 🇰🇷 코스피 · 저녁·밤 = 🇺🇸 미국. 숫자는 prob.json 그대로(새 계산 없음). */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function J(u){ return getJSON(u + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }
  function pct(p){ return Math.round(p * 100); }
  function ten(p){ return Math.max(0, Math.min(10, Math.round(p * 10))); }
  /* 세게 말하기 — 확률 → 한 마디 (틀려도 좋다는 전제) */
  // ⚡ 10/19: 장이 아직 많이 남았으면(남은 시간 40%↑) 「거의 확실히」라고 하지 않음 — 10:18 「12% 거의 확실히 내린다」 뒤 10:23 플러스 전환
  /* 🔒 10/19 사용자 「너의 확률이 이리 개판」 → 「ㅇㅇ 적용해」: 다음 날 방향 성적이 동전보다 확실히 나아지기 전(20건↑ · 적중 55%↑)엔
     세게 말하지 않는다 — 「반반」·「약간 ○○ 쪽」까지만. 성적은 prob.json score.all.d1 (매일 채점) */
  var PROVEN = false, WEAK = false;
  function gate(P){ var d = P && P.score && P.score.all && P.score.all.d1 || {}; PROVEN = (d.n || 0) >= 20 && (d.hit || 0) >= 55; WEAK = (d.n || 0) >= 20 && (d.hit || 0) < 50; return d; }
  function word(p, soft){
    /* 🩶 10/31 A4: 실전 적중이 동전(50%)보다 못한 동안엔 색을 빼고 「참고」로 — 큰 빨강·파랑 제목이 믿을 만해 보이지 않게 */
    if (WEAK){
      if (p >= 0.55) return {t: "약간 오를 쪽 · 참고만", c: "flat"};
      if (p <= 0.45) return {t: "약간 내릴 쪽 · 참고만", c: "flat"};
      return {t: "반반 — 동전 던지기", c: "flat"};
    }
    if (!PROVEN){
      if (p >= 0.60) return {t: "오를 쪽 (검증 전)", c: "up"};
      if (p >= 0.55) return {t: "약간 오를 쪽", c: "up"};
      if (p <= 0.40) return {t: "내릴 쪽 (검증 전)", c: "dn"};
      if (p <= 0.45) return {t: "약간 내릴 쪽", c: "dn"};
      return {t: "반반 — 동전 던지기", c: "flat"};
    }
    if (soft && p >= 0.70) return {t: "오른다 쪽에 세게", c: "up2"};
    if (soft && p <= 0.30) return {t: "내린다 쪽에 세게", c: "dn2"};
    if (p >= 0.70) return {t: "거의 확실히 오른다", c: "up2"};
    if (p >= 0.60) return {t: "오른다 쪽에 세게", c: "up"};
    if (p >= 0.55) return {t: "오를 쪽", c: "up"};
    if (p > 0.45)  return {t: "반반 — 동전 던지기", c: "flat"};
    if (p > 0.40)  return {t: "내릴 쪽", c: "dn"};
    if (p > 0.30)  return {t: "내린다 쪽에 세게", c: "dn"};
    return {t: "거의 확실히 내린다", c: "dn2"};
  }
  function kst(){ var d = new Date(Date.now() + 9 * 3600e3); return {m: d.getUTCHours() * 60 + d.getUTCMinutes(), day: d.getUTCDay(), ymd: d.toISOString().slice(0, 10)}; }
  /* 지금 시각의 주인공 — 한국 장 전·장중(06:00~15:30) 🇰🇷 · 그 뒤 🇺🇸 · 주말은 다음 주 월요일 이야기 */
  /* 10/31 A2: 금요일 밤에도 「내일 코스피」라던 것 → 실제 다음 장 요일 (prob.json next_day) */
  function nextKr(kr, K){
    var nd = kr && kr.next_day; if (!nd) return K.day === 0 || K.day === 6 ? "월요일" : "내일";
    var dd = Math.round((Date.parse(nd + "T00:00:00Z") - Date.parse(K.ymd + "T00:00:00Z")) / 864e5);
    return dd === 1 ? "내일" : dd === 0 ? "오늘" : ["일", "월", "화", "수", "목", "금", "토"][new Date(nd + "T00:00:00Z").getUTCDay()] + "요일";
  }
  function lead(P, K){
    var M = P.markets || {}, kr = M.KR, us = M.US, wk = K.day === 0 || K.day === 6;
    if (!wk && K.m >= 6 * 60 && K.m < 15 * 60 + 30 && kr) return {mk: kr, when: kr.open_now && kr.intra_chg != null ? "오늘 종가" : "오늘", other: us, otherWhen: "오늘 밤 미국"};
    if (us) return {mk: us, when: wk ? "다음 미국 장" : (K.m >= 22 * 60 + 30 || K.m < 6 * 60 ? "지금 미국 장" : "오늘 밤 미국"), other: kr, otherWhen: nextKr(kr, K) + " 코스피"};
    return kr ? {mk: kr, when: "내일", other: null} : null;
  }
  function anchorLine(mk){
    var a = (mk.methods || []).filter(function(x){ return x.anchor && x.p1 != null; })[0];
    if (!a) return "";
    var ev = String(a.ev || "").split("→")[0].replace(/\(.*?\)/g, "").trim();
    return ev ? a.ic + " " + ev : "";
  }

  /* ⚡ 10/19 사용자: 「두뇌가 확률을 얘기했으면 실시간으로 — 지금 반등이 나오고 있고 종가 플러스 확률이 올라가고 있고 어느 섹터가 강하니
     이쪽을 보자 · 장이 계속 밀리니 어디 섹터는 특히 조심하고 현금 비중을 어느 선까지 — 확률적으로 직관적으로」
     장중 나침반(10분마다) 흐름으로: ① 종가 플러스 확률이 어떻게 움직였나 ② 지금 볼 곳 / 조심할 곳(섹터·대형주) ③ 🎯 집중 ★종목 지금 ④ 규칙에 있는 대응만(현금 선 · 급락일 쉬기) */
  function pc2(v){ return (v > 0 ? "+" : "") + v.toFixed(1) + "%"; }
  function cl2(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function nowBlock(mk, L, lv, F, FL, CONC){
    if (!L || !window.probAt || !mk) return "";
    if (L.date && L.date !== kst().ymd) return "";                                          // 오늘 나침반만
    var closed = false;
    if (!lv){                                                                               // ⚡ 확률 재계산이 없어도 섹터·종목은 늘 보이게 (10/19 「섹터랑 종목 또 사라짐」)
      var ix = L.index && L.index[0]; if (!ix || ix.chg == null || !L.t) return "";
      var r0 = probAt(mk, ix.chg, L.t); closed = !r0 || /CLOSE/i.test(ix.status || "") || kst().m >= 15 * 60 + 30;
      lv = {t: L.t, chg: ix.chg, p1: r0 ? r0.p1 : (ix.chg > 0 ? 0.99 : ix.chg < 0 ? 0.01 : 0.5)};
    }
    var sn = (L.snaps || []).filter(function(x){ return x && x[3] != null; });
    var pts = sn.map(function(x){ var r = probAt(mk, x[3], x[0]); return r ? [x[0], r.p1] : null; }).filter(Boolean);
    pts = pts.filter(function(x){ return x[0] < lv.t; }); pts.push([lv.t, lv.p1]);
    var nowM = (function(t){ var a = t.split(":"); return +a[0] * 60 + +a[1]; })(lv.t);
    var ago = pts.filter(function(x){ var a = x[0].split(":"); return nowM - (+a[0] * 60 + +a[1]) >= 50; }).slice(-1)[0] || pts[0];
    var d = lv.p1 - ago[1], first = pts[0];
    // 흐름 막대: 시각별 확률 (50% 선 위 빨강 · 아래 파랑)
    var W = 150, H = 34, n = pts.length, xs = function(i){ return n > 1 ? 4 + i * (W - 8) / (n - 1) : W / 2; }, ys = function(p){ return 4 + (1 - p) * (H - 8); };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" class="pl-spark"><line x1="0" x2="' + W + '" y1="' + ys(0.5) + '" y2="' + ys(0.5) + '" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="3 3"/>' +
      '<polyline fill="none" stroke="currentColor" stroke-width="2" points="' + pts.map(function(x, i){ return xs(i).toFixed(1) + "," + ys(x[1]).toFixed(1); }).join(" ") + '"/>' +
      '<circle cx="' + xs(n - 1).toFixed(1) + '" cy="' + ys(lv.p1).toFixed(1) + '" r="3" fill="currentColor"/></svg>';
    var chg = lv.chg, mood;
    if (closed) mood = "🔔 마감 — 코스피 " + pc2(chg);
    else if (d >= 0.10 && lv.p1 >= 0.5) mood = "📈 반등이 붙는 중 — 오를 쪽으로 기울고 있어요";
    else if (d >= 0.10) mood = "↗ 낙폭을 줄이는 중 — 아직은 내릴 쪽";
    else if (d <= -0.10 && lv.p1 <= 0.5) mood = "📉 계속 밀리는 중 — 내릴 쪽으로 기울고 있어요";
    else if (d <= -0.10) mood = "↘ 오름폭을 반납하는 중 — 아직은 오를 쪽";
    else mood = "↔ 1시간 전과 비슷 — 큰 변화 없이 버티는 중";
    var up = L.up || 0, dn = L.down || 0, br = Math.round(up / Math.max(1, up + dn) * 100), br0 = first && sn[0] ? Math.round(sn[0][1] / Math.max(1, sn[0][1] + sn[0][2]) * 100) : null;
    var ss = (L.sectors || []).filter(function(x){ return x.r != null; }).sort(function(a, b){ return b.r - a.r; });
    var bigs = function(x, best){ return (x.big || []).filter(function(t){ return t.r != null && (best ? t.r > 0 : t.r < 0); }).sort(function(a, b){ return best ? b.r - a.r : a.r - b.r; }).slice(0, 1)
      .map(function(t){ return '<a data-op="' + e(t.s) + '">' + e(t.n) + ' <b class="' + cl2(t.r) + '">' + pc2(t.r) + '</b></a>'; }).join(" · "); };
    var good = ss.filter(function(x){ return x.r >= 0.3 && (x.up || 0) >= (x.down || 0); }).slice(0, 2);
    var bad = ss.slice().reverse().filter(function(x){ return x.r <= -0.3; }).slice(0, 1);
    var row = function(ic, lab, list, best){ return list.length ? '<div class="pl-nw"><span class="pl-k">' + ic + ' ' + lab + '</span><div>' + list.map(function(x){ var b = bigs(x, best);
      return '<div class="pl-sr"><b>' + e(x.name) + ' <span class="' + cl2(x.r) + '">' + pc2(x.r) + '</span></b>' + (b ? ' <span class="pl-sm">· ' + b + '</span>' : '') + '</div>'; }).join("") + '</div></div>' : ''; };
    // 🎯 오늘 집중 ★·관심 국내 종목의 지금 값
    var fl = FL && FL.px || {}, st = [];
    ((F && F.themes) || []).forEach(function(t){ (t.kr || []).forEach(function(k){ var q = fl[k.t]; if (q && q.r != null) st.push({n: k.name, t: k.t, r: q.r, star: /★/.test(k.act || ""), th: t.name}); }); });
    st.sort(function(a, b){ return b.r - a.r; });
    var foc = st.length ? '<div class="pl-nw"><span class="pl-k">🎯 집중 종목</span><div class="pl-sm">' + st.slice(0, 3).map(function(x){ return (x.star ? "★ " : "") + '<a data-op="' + e(x.t) + '">' + e(x.n) + ' <b class="' + cl2(x.r) + '">' + pc2(x.r) + '</b></a>'; }).join(" · ") + '</div></div>' : '';
    // 대응 — 규칙에 있는 것만
    var act = [];
    if (closed) {}
    else if (chg <= -3) act.push("⛔ 코스피 −3%↓ — 우리 규칙: 오늘은 신규 진입 쉬기");
    else if (d <= -0.10 && chg < -1) act.push("🛑 밀리는 장 — " + (bad[0] ? e(bad[0].name) + "·" : "") + "약한 쪽은 비중 늘리지 않기");
    else if (d >= 0.10 && lv.p1 >= 0.55 && good[0]) act.push("👀 반등 주도 " + e(good[0].name) + (good[1] ? "·" + e(good[1].name) : "") + " 쪽을 먼저 본다 (추격보다 눌림)");
    var R = CONC && CONC.regime;
    if (R) act.push("💼 현금 규칙: " + (R.up ? "🟢 S&P 200일선 위 → 현금 0%" : "🔴 S&P 200일선 아래 → 현금 26%"));
    return '<div class="pl-now"><div class="pl-nh"><b>' + (closed ? '🇰🇷 오늘 장 마감 ' : '⚡ 지금 장 ') + e(lv.t) + '</b> <span class="pl-sm mut">코스피 <span class="' + cl2(chg) + '">' + pc2(chg) + '</span> · 오른 종목 ' + br + '%' + (br0 != null ? ' (개장 ' + br0 + '%)' : '') + '</span></div>' +
      '<div class="pl-tr ' + (lv.p1 >= 0.5 ? "up" : "dn") + '">' + svg + '<span>' + e(mood) + '</span></div>' +
      row("👀", "볼 곳", good, true) + row("⚠️", "조심", bad, false) + foc +
      (act.length ? '<div class="pl-act">' + act.map(function(x){ return '<div>' + x + '</div>'; }).join("") + '</div>' : '') + '</div>';
  }
  // ⚡ 섹터·대형주·집중 종목 칸은 확률 재계산 여부·주인공 시장(밤엔 🇺🇸)과 상관없이, 오늘 한국 나침반이 있으면 늘 붙임 · 오류가 나도 카드 전체는 살림
  function safeNow(P, L, LV, lv){
    try {
      var kr = L.mk.mk === "KR" ? L.mk : (P.markets && P.markets.KR);
      return nowBlock(kr, LV.KR, L.mk.mk === "KR" ? lv : null, LV.F, LV.FL, LV.CONC) || "";
    } catch(x){ if (window.console) console.warn("nowBlock", x); return ""; }
  }
  function build(P, B, T, LV){
    var K = kst(), L = lead(P, K); if (!L) return "";
    LV = LV || {};
    var SC = gate(P);
    // ⚡ 장중이면 장중 나침반(10분마다)의 지금 등락으로 확률을 다시 계산 (problive.js)
    var lv = window.probLive ? probLive(L.mk, LV[L.mk.mk], P) : null;
    if (lv) L.mk = Object.assign({}, L.mk, {p1: lv.p1, intra_chg: lv.chg});
    if (L.other && window.probLive){ var lo = probLive(L.other, LV[L.other.mk], P); if (lo) L.other = Object.assign({}, L.other, {p1: lo.p1}); }
    var soft = L.mk.open_now && (lv ? lv.rem > 0.4 : true);
    var mk = L.mk, p1 = mk.p1, p5 = mk.p5, w1 = word(p1, soft), w5 = word(p5);
    var strong = PROVEN && (p1 >= 0.6 || p1 <= 0.4);
    var head = e(mk.flag + " " + mk.ixn + " " + L.when) + " → <em>" + e(w1.t) + "</em>";
    var ten1 = ten(p1), ten5 = ten(p5);
    var nums = '<span class="pl-ten ' + w1.c + '" title="오를 확률 ' + pct(p1) + '%">' + "●".repeat(ten1) + "○".repeat(10 - ten1) + ' <b>10번 중 ' + ten1 + '번 오름</b> (' + pct(p1) + '%)</span>';
    var anc = lv ? "⚡ 지금 " + mk.ixn + " " + (lv.chg > 0 ? "+" : "") + lv.chg.toFixed(2) + "% (" + lv.t + " 장중 나침반) · 장 남은 시간 " + Math.round(lv.rem * 100) + "% · 남은 흔들림 " + Math.round(lv.vr * 100) + "% · 하루 흔들림 " + (lv.sig * 100).toFixed(1) + "%" : anchorLine(mk);
    var band = !lv && mk.band1 && mk.band1.length === 2 ? "예상 폭 " + mk.band1[0] + "% ~ +" + mk.band1[1] + "%" : "";
    var wk5 = '<div class="pl-row"><span class="pl-k">일주일 뒤</span><b class="' + w5.c + '">' + e(w5.t) + '</b> <small>10번 중 ' + ten5 + '번 (' + pct(p5) + '%)</small></div>';
    var oth = L.other ? '<div class="pl-row"><span class="pl-k">' + e(L.otherWhen) + '</span><b class="' + word(L.other.p1).c + '">' + e(word(L.other.p1).t) + '</b> <small>' + pct(L.other.p1) + '%</small></div>' : "";
    // 🧠 두뇌 — 국면 + 가장 확신하는 논지 하나
    var th = (T && T.theses || []).slice().sort(function(a, b){ return (b.conf || 0) - (a.conf || 0); })[0];
    var br = (B && (B.regime || B.summary)) ? '<div class="pl-row pl-br"><span class="pl-k">🧠 두뇌</span><div><b>' + e(String(B.regime || "").split(" / ")[0]) + '</b>' +
      (th ? '<small>「' + e(th.t) + '」 확신 ' + pct(th.conf || 0) + '%</small>' : (B.summary ? '<small>' + e(String(B.summary).split(" — ")[0]) + '</small>' : '')) + '</div></div>' : "";
    var sc = P.score && P.score.all && P.score.all.d1 || {}, hit = sc.n ? " · 지금까지 다음 날 방향 " + Math.round(sc.hit / 100 * sc.n) + "/" + sc.n + " 맞음" : "";
    var stale = P.date && P.date !== K.ymd && K.m >= 9 * 60 ? ' <span class="pl-old">(' + e(P.date.slice(5).replace("-", "/")) + ' 계산)</span>' : "";
    /* 🧹 10/21 「오늘 한 장」: 결론 한 줄 + 국면·한 문장 + 볼 곳 — 확률 숫자·10칸 점·검증 경고·일주일 뒤·다른 시장은 🎲 시장확률 탭·📊 성적표로 */
    var reg = B && B.regime ? String(B.regime).split(" / ")[0] : "";
    var one = th ? th.t : (B && B.summary ? String(B.summary).split(/ — |\. /)[0] : "");
    if (one.length > 60) one = one.slice(0, 58) + "…";
    var nowH = safeNow(P, L, LV, lv), look = nowH || focusBlock(LV.HF);
    return '<section class="card pl ' + w1.c + '" data-goto="prob" role="button">' +
      '<div class="pl-top"><span class="pl-ic">🎲</span><div class="pl-h"><small>오늘 한 줄 · ' + e(lv ? lv.t : (P.t || "")) + stale + '</small><div class="pl-head">' + head + '</div></div><span class="pl-go">자세히 ›</span></div>' +
      (reg || one ? '<div class="pl-one">' + (reg ? '<span class="pl-reg">' + e(reg) + '</span>' : '') + e(one) + '</div>' : '') +
      look +
      '<div class="pl-foot">' + (PROVEN ? '' : '아직 검증 중이라 약하게만 말해요 · ') + '사라·팔라는 뜻 아님</div></section>';
  }
  /* 장 전·주말엔 장중 나침반이 없으니 「볼 곳」은 오늘 집중 테마(market/home.json focus)로 */
  function focusBlock(F){
    if (!F || !F.length) return "";
    return '<div class="pl-now"><div class="pl-nh"><b>👀 오늘 볼 곳</b> <span class="pl-sm mut">돈이 몰리는 테마</span></div>' + F.slice(0, 2).map(function(t){
      return '<div class="pl-nw"><span class="pl-k">' + e(t.name) + '</span><div class="pl-sm">' + e(t.stage || "") + (t.r5 != null ? ' · 5일 ' + pc2(t.r5) : '') +
        ((t.stars || []).length ? '<div>' + t.stars.slice(0, 3).map(function(x){ return '★ <a data-op="' + e(x.t) + '">' + e(x.name) + '</a>'; }).join(" · ") + '</div>' : '') + '</div></div>'; }).join("") + '</div>';
  }
  function mount(){
    var body = document.getElementById("hmbody"); if (!body) return;
    var LJ = function(k){ return J("archive/x/live_" + k + ".json").catch(function(){ return null; }); };
    var NL = function(u){ return J(u).catch(function(){ return null; }); };
    Promise.all([J("archive/x/prob.json"), J(RAWM + "market/home.json").catch(function(){ return null; }), J(RAWM + "brain/state.json").catch(function(){ return null; }), LJ("kr"), LJ("us"),
                 NL(RAWM + "market/focus.json"), NL("archive/x/focus_live.json"), NL(RAWM + "market/conc.json")]).then(function(a){
      var html = build(a[0], a[1] && a[1].brain, a[2], {KR: a[3], US: a[4], F: a[5], FL: a[6], CONC: a[7], HF: a[1] && a[1].focus}); if (!html) return;
      var b2 = document.getElementById("hmbody"); if (!b2) return;
      var old = b2.querySelector(".pl"); if (old) old.remove();
      var anchor = b2.querySelector(".hm-live") || b2.querySelector(".hm-day");
      var box = document.createElement("div"); box.innerHTML = html; var el = box.firstChild;
      if (anchor && anchor.nextSibling) b2.insertBefore(el, anchor.nextSibling); else b2.appendChild(el);
    }).catch(function(x){ if (window.console) console.warn("probline", x); });
  }
  // 10/19 사용자 「장 중에도 카드 계속 바꿀 거지?」 → 오늘 탭을 열어 둔 동안 3분마다 다시 받아 그 자리에서 바꿈(🎲 계산은 장중 약 30분마다 · 🧠 두뇌는 매시간)
  setInterval(function(){ if (document.visibilityState === "visible" && document.getElementById("hmbody") && document.querySelector("#hmbody .pl")) mount(); }, 180000);
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "visible" && document.getElementById("hmbody")) mount(); });
  var prev = window.hmAfter;
  window.hmAfter = function(H){ if (prev) try { prev(H); } catch(x){ if (window.console) console.warn("hmAfter", x); } mount(); };
  var st = document.createElement("style");
  st.textContent = [
    ".pl{padding:12px 14px!important;cursor:pointer;border-width:1px;position:relative}",
    ".pl-now{margin:10px 0 4px;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,var(--text) 5%,var(--panel));border:1px solid var(--line)}",
    ".pl-nh{margin-bottom:4px}.pl-tr{display:flex;gap:8px;align-items:center;font-size:13.5px;line-height:1.4;margin:2px 0 6px}.pl-tr.up{color:#e5484d}.pl-tr.dn{color:#3987e5}.pl-tr span{color:var(--text)}.pl-spark{flex:none}",
    ".pl-nw{display:flex;gap:8px;font-size:13.5px;line-height:1.45;padding:4px 0;border-top:1px dashed var(--line)}.pl-nw .pl-k{flex:none;width:78px}.pl-nw a{color:inherit;text-decoration:none;cursor:pointer}",
    ".pl-sm{font-size:12.5px;display:inline}.pl-sr .pl-sm+div.pl-sm,.pl-sr div.pl-sm{display:block}.pl-sr{margin-bottom:3px}",
    ".pl-act{margin-top:6px;font-size:13px;line-height:1.5;border-top:1px dashed var(--line);padding-top:5px}",
    ".pl-warn{margin:8px 0 4px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#ffb84d 22%,var(--panel));border:1px solid rgba(255,184,77,.6);font-size:13.5px;line-height:1.45}",
    ".pl.up,.pl.up2{background:color-mix(in srgb,#ff6b6b 10%,var(--panel));border-color:rgba(255,107,107,.45)}",
    ".pl.dn,.pl.dn2{background:color-mix(in srgb,#3987e5 12%,var(--panel));border-color:rgba(57,135,229,.5)}",
    ".pl.flat{background:var(--panel)}.pl.strong{border-width:2px}",
    ".pl-top{display:flex;align-items:flex-start;gap:10px}.pl-ic{font-size:24px;width:38px;height:38px;border-radius:11px;background:var(--panel2);display:flex;align-items:center;justify-content:center;flex:none}",
    ".pl-h{flex:1;min-width:0}.pl-h>small{display:block;font-size:12.5px;color:var(--sub);margin-bottom:2px}.pl-old{color:#ffb84d}",
    ".pl-head{font-size:17px;font-weight:800;line-height:1.3;letter-spacing:-.3px}.pl-head em{font-style:normal;font-size:20px}",
    ".pl.up .pl-head em,.pl.up2 .pl-head em{color:#ff8a8a}.pl.dn .pl-head em,.pl.dn2 .pl-head em{color:#7cb0ff}.pl.flat .pl-head em{color:var(--text)}",
    ".pl-go{color:var(--sub);font-size:12.5px;white-space:nowrap;margin-top:4px}",
    ".pl-nums{margin:8px 0 4px;font-size:13px}.pl-ten{letter-spacing:1px}.pl-ten b{letter-spacing:0;margin-left:4px}.pl-ten.up,.pl-ten.up2{color:#ff8a8a}.pl-ten.dn,.pl-ten.dn2{color:#7cb0ff}.pl-ten.flat{color:var(--sub)}",
    ".pl-why{font-size:12.5px;color:var(--sub);line-height:1.45;margin-bottom:6px}",
    ".pl-row{display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-top:1px dashed var(--line);font-size:13.5px;line-height:1.4}.pl-row:first-of-type{border-top:0}",
    ".pl-k{flex:none;width:92px;color:var(--sub);font-size:12.5px;font-weight:700;padding-top:1px}.pl-row b.up,.pl-row b.up2{color:#ff8a8a}.pl-row b.dn,.pl-row b.dn2{color:#7cb0ff}.pl-row small{color:var(--sub);font-size:12.5px}",
    ".pl-br>div{flex:1;min-width:0}.pl-br small{display:block;line-height:1.4;margin-top:1px}",
    ".pl-foot{margin-top:7px;font-size:12.5px;color:var(--dim);line-height:1.4}",
    ".pl-one{font-size:13.5px;line-height:1.5;margin:6px 0 2px;color:var(--text)}.pl-reg{display:inline-block;font-size:12.5px;font-weight:700;padding:1px 7px;border-radius:9px;margin-right:6px;background:var(--panel2);color:var(--sub)}",
    "html[data-ui=light] .pl.up .pl-head em,html[data-ui=light] .pl.up2 .pl-head em,html[data-ui=light] .pl-ten.up,html[data-ui=light] .pl-ten.up2,html[data-ui=light] .pl-row b.up,html[data-ui=light] .pl-row b.up2{color:#d6453d}",
    "html[data-ui=light] .pl.dn .pl-head em,html[data-ui=light] .pl.dn2 .pl-head em,html[data-ui=light] .pl-ten.dn,html[data-ui=light] .pl-ten.dn2,html[data-ui=light] .pl-row b.dn,html[data-ui=light] .pl-row b.dn2{color:#2c6fd1}"
  ].join("");
  document.head.appendChild(st);
})();
