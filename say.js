/* CH Investing — 🗣 오늘 첫 화면 「한 목소리」 (11/24 사용자 「오늘을 더 심플하고 가독성 있게 · 통일성 있게 다 같은 말을 하게」 → 냉정 분석 7차 「다 진행 · 3번 네 추천대로」)
   ① 숫자·말의 원본은 market/say.json 하나(market-strategy-report src/say.py) — 주식 몫 · 다시 늘리는 선 · 남은 거리 · 오늘 규칙 한 단어(늘리기·지키기·줄이기)
   ② 첫 화면 = 한 문장 + 지수 2칸 + 주식 몫 3줄(남은 거리 막대 — 장중엔 실시간 값으로 다시 계산) + 한 줄 + 보내기 단추
   ③ 그 아래 = 오늘 왜 움직였나 · (내 종목·대형주·이번 주·고객 질문 한 줄씩) · 근거 더 보기 — 지운 것 없음, 예전 칸은 근거 줄을 누르면 열림
   ④ 순서는 CSS order 로만 바꿈(다른 스크립트가 칸을 끼워 넣는 자리는 그대로 — 서로 자리 다툼 없음) · 새 화면 없음(12/1 동결)
   ⑤ 📨 「이 화면 그대로 고객에게」 = 같은 모델(window.__sayModel)로 한 장을 그림(onepage.js SCREENS.say)
   say.json 을 못 받으면 아무것도 안 바꿈 → 예전 첫 화면 그대로 */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var S = null, K = null, FU = null, FL = "", T0 = 0, OPEN = {};
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function gj(u, ttl){ if (!window.getJSON) return Promise.resolve(null); return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / (ttl || 300000)), {ttl: ttl || 300000}).catch(function(){ return null; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(d == null ? 1 : d); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function n0(v){ return v >= 1000 ? Math.round(v).toLocaleString("en-US") : (Math.round(v * 10) / 10).toLocaleString("en-US"); }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function EZ(){ return !window.ezMode || window.ezMode() === "easy"; }

  function load(){
    if (S && Date.now() - T0 < 120000) return Promise.resolve(S);
    return Promise.all([gj(RM + "say.json"), gj("archive/x/live_kr.json", 120000), gj("archive/x/live_us_pre.json", 120000), window.__flowLine ? window.__flowLine().catch(function(){ return ""; }) : ""])
      .then(function(r){ if (r[0] && r[0].markets){ var first = !S; S = r[0]; T0 = Date.now(); if (first) setTimeout(function(){ try { if (window.__h2apply) __h2apply(true); } catch(x) {} }, 60); } K = r[1] || K; FU = r[2] || FU; FL = r[3] || FL; return S; });
  }
  window.__sayNow = function(){ return S; };
  window.__sayLoad = load;

  /* ── 모델 하나 — 화면과 고객 한 장이 같이 씀 ── */
  function dtxt(d){ return d > 0.05 ? "+" + d.toFixed(1) + "% 남음" : Math.abs(d).toFixed(1) + "% 위"; }   // 말 사전: 거리는 늘 한 방향
  function model(){
    if (!S) return null;
    var td = today(), isT = !!(K && K.date === td && K.index), IX = {};
    if (K && K.index) K.index.forEach(function(x){ IX[x.name] = x; });
    var kp = IX["코스피"], kq = IX["코스닥"], hm = kst().toISOString().slice(11, 16);
    var closed = !isT || String(K.t || "") >= "15:30" || hm >= "15:40";
    var fut = FU && FU.date === td ? (FU.fut || []).filter(function(f){ return f.name === "S&P500 선물"; })[0] : null;
    var rows = S.markets.map(function(r){
      var px = isT && r.key === "kospi" && kp ? kp.last : isT && r.key === "kosdaq" && kq ? kq.last : null;
      var d = px && r.line ? (r.line / px - 1) * 100 : r.dist, live = px != null;
      var o = {key: r.key, name: r.name, share: r.share, share_txt: r.share_txt, cond: r.cond, line_txt: r.line_txt || r.cond, cond2: r.cond2 || "", dist: d, live: live,
        dist_txt: d == null ? "" : dtxt(d), prev_txt: live && r.dist != null && Math.abs(r.dist - d) >= 0.3 ? "어제 " + (r.dist > 0 ? "+" : "−") + Math.abs(r.dist).toFixed(1) + "%" : "",
        fill: d == null ? 0 : Math.max(3, Math.min(100, 100 - d * 3.3)), prev_fill: r.dist == null ? null : Math.max(3, Math.min(100, 100 - r.dist * 3.3)), move: r.move};
      if (r.key === "us" && fut && fut.chg != null && r.close && r.line){ o.fut = fut.chg; o.fut_over = r.close * (1 + fut.chg / 100) > r.line; }
      return o;
    });
    // 한 문장 = 오늘 사실(코스피) + 오늘 규칙 한 단어
    var kr = rows[0] || {}, lead = "", big = isT && kp ? kp.chg : null;
    if (big != null){ var vb = big >= 3 ? (S.markets[0] && S.markets[0].below ? "반등" : "급등") : big <= -3 ? "급락" : big >= 0.5 ? "상승" : big <= -0.5 ? "하락" : "보합"; lead = "코스피 " + sg(big) + " " + vb; }
    var wk = S.word_key, tail = wk === "keep" ? (big != null && big >= 3 ? "규칙은 아직 지키기" : "오늘 규칙은 지키기") : wk === "down" ? "오늘 규칙은 줄이기" : "오늘 규칙은 늘리기";
    var num = "";
    (S.nums || []).some(function(n){
      var ok = n.when === "any" || (n.when === "kospi_up3" && big != null && big >= 3) || (n.when === "kosdaq_up3" && isT && kq && kq.chg >= 3 && !(big >= 3)) || (n.when === "kospi_live" && isT && kr.live);
      if (ok){ num = String(n.t).replace("{live}", kr.dist_txt ? kr.dist_txt.replace(" 남음", "") : ""); if (n.when === "kospi_live" && kr.prev_txt) num += " (" + kr.prev_txt + ")"; }
      return ok; });
    var tiles = [kp, kq].filter(Boolean).map(function(x){ return {n: x.name, chg: x.chg, v: x.name === "코스닥" ? (Math.round(x.last * 10) / 10).toLocaleString("en-US") : Math.round(x.last).toLocaleString("en-US")}; });
    var when = (K && K.date ? (isT ? (closed ? K.t + " 마감" : K.t + " 장중") : md(K.date) + " 마감") : "") + (S.asof ? " · 판정은 " + md(S.asof) + " 종가" : "");
    // 왜 — 업종은 큰 업종 표(live_kr sectors) 하나만 씀(업종 지도·한 장과 같은 분류)
    var secs = ((K && K.sectors) || []).filter(function(x){ return (x.n || 0) >= 30 && x.r != null; }).slice().sort(function(a, b){ return b.r - a.r; });
    var up = (K && K.up) || 0, dn = (K && K.down) || 0, tot = up + dn + ((K && K.flat) || 0), upr = tot > 100 ? Math.round(up / tot * 100) : null;
    var fm = /외국인 ([+−\-][\d,.]+(?:억|조))/.exec(FL || ""), flow = (FL || "").replace(/^코스(?:피|닥) \d+\/\d+ /, "");
    var why = [];
    if (secs.length >= 3){ why.push({k: "강한 업종", h: secs.slice(0, 2).map(function(x){ return e(x.name) + ' <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "), t: secs.slice(0, 2).map(function(x){ return x.name + " " + sg(x.r); }).join(" · ")});
      why.push({k: "약한 업종", h: secs.slice(-2).reverse().map(function(x){ return e(x.name) + ' <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "), t: secs.slice(-2).reverse().map(function(x){ return x.name + " " + sg(x.r); }).join(" · ")}); }
    var V = ((K && K.value) || []).slice(0, 2);
    if (V.length) why.push({k: "돈 몰린 종목", h: V.map(function(x){ return '<u data-op="' + e(x.s) + '">' + e(x.n) + '</u> <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "), t: V.map(function(x){ return x.n + " " + sg(x.r); }).join(" · ")});
    if (flow) why.push({k: "누가 샀나", h: e(flow).replace(/([+][\d,.]+(?:억|조))/g, '<b class="up">$1</b>').replace(/(−[\d,.]+(?:억|조))/g, '<b class="dn">$1</b>'), t: flow, go: "flow"});
    var one = [fm ? "외국인 " + fm[1] : "", secs.length ? "강한 곳 " + secs[0].name + " " + sg(secs[0].r) : "", upr != null ? "오른 종목 " + upr + "%" : ""].filter(Boolean);
    return {word: S.word, word_key: wk, why_word: S.why, lead: lead, tail: tail, num: num, tiles: tiles, rows: rows, when: when, isT: isT, big: big,
      whyTitle: !K || !K.date ? "" : isT ? (big != null && big < 0 ? "오늘 왜 내렸나" : "오늘 왜 올랐나") : md(K.date) + " 장은 이랬어요", why: why, one: one, note: S.note};
  }
  window.__sayModel = function(){ return load().then(model); };

  /* ── 그리기 ── */
  function heroHtml(M){
    var h = '<div class="say-top"><span>' + e(M.when) + '</span></div>' +
      '<div class="say-head w-' + M.word_key + '"><div class="say-bd"><b>' + e(M.word) + '</b><span>' + e(M.why_word || "") + '</span></div>' +
      '<p class="say-h1">' + (M.lead ? e(M.lead) + ',<br>' : '') + e(M.tail) + '</p>' + (M.num ? '<p class="say-num">' + e(M.num) + '</p>' : '') + '</div>';
    if (M.tiles.length) h += '<div class="say-ts">' + M.tiles.map(function(t){ return '<div><small>' + e(t.n) + (M.isT ? '' : ' · 지난 장') + '</small><p><b class="' + cl(t.chg) + '">' + sg(t.chg) + '</b><em>' + e(t.v) + '</em></p></div>'; }).join("") + '</div>';
    h += '<div class="say-sh"><div class="say-shh"><b>지금 주식 몫</b><span>다시 늘리는 선 · 남은 거리</span></div>' + M.rows.map(function(r){
      var full = r.share != null && r.share >= 100;
      return '<button type="button" class="say-r" data-saygo="rule" data-j="1"><span class="say-rn"><b>' + e(r.name) + '</b><strong>' + e(r.share_txt) + '</strong></span>' +
        '<i class="say-bar' + (full ? " full" : "") + '">' + (r.live && r.prev_fill != null && Math.abs(r.prev_fill - r.fill) > 1.5 ? '<u style="left:' + r.prev_fill.toFixed(1) + '%"></u>' : '') + '<i style="width:' + (full ? 100 : r.fill).toFixed(1) + '%"></i></i>' +
        '<span class="say-rc"><span>' + e(r.line_txt) + '</span><em>' + (r.prev_txt ? '<small>' + e(r.prev_txt) + ' → </small>' : '') + (r.fut != null ? '<small>선물 ' + sg(r.fut) + ' · </small>' : '') + e(r.dist_txt) + '</em></span></button>'; }).join("") + '</div>';
    h += '<button type="button" class="say-cta" data-saysend="1">📨 이 화면 고객에게 한 장</button>';
    if (M.why.length) h += '<div class="say-why"><div class="say-shh"><b>' + e(M.whyTitle) + '</b></div>' + M.why.map(function(w){ return '<div class="say-w"' + (w.go ? ' data-ezgo="' + w.go + '"' : '') + '><small>' + e(w.k) + '</small><p>' + w.h + '</p></div>'; }).join("") + '</div>';
    return h;
  }
  function listHtml(){
    var B = window.__ezBrief ? __ezBrief() : null, kp = S.markets[0] || {}, hit = "", bub = "";
    try { var r = B && B._sc && (B._sc.rows || []).filter(function(x){ return x.k === "report"; })[0]; if (r && r.n) hit = "예고 적중 " + r.rate + "%"; } catch(x) {}
    try { var CK = B && B._bub && window.__bubClock ? __bubClock(B._bub) : null; if (CK) bub = "버블 시계 " + CK.label; } catch(x) {}
    var R = [["hero", "판정 자세히 · 언제 다시 사나", kp.line ? kp.line_name + " " + n0(kp.line) : ""], ["mo", "오늘 아침 30초", "카드 5장"], ["rows", "오늘 한 줄씩", hit || "뉴스 · 달라진 것"], ["more", "하락장 계기판 · 버블 시계 · 확률판", bub || "자세히"]];
    return '<div class="say-shh"><b>근거 더 보기</b><span>누르면 그 자리에서 열려요</span></div>' + R.filter(function(x){ return x[0] !== "mo" || document.getElementById("mo19"); }).map(function(x){
      return '<button type="button" class="say-l' + (OPEN[x[0]] ? " on" : "") + '" data-saytog="' + x[0] + '" aria-expanded="' + (OPEN[x[0]] ? "true" : "false") + '"><b>' + x[1] + '</b><span>' + e(x[2]) + '</span><i>' + (OPEN[x[0]] ? "▴" : "›") + '</i></button>'; }).join("");
  }
  var LAST = "";
  function draw(){
    var hero = document.getElementById("ezhero"), hb0 = document.getElementById("hmbody"), P = hero ? hero.parentNode : hb0 ? hb0.parentNode : null, box = document.getElementById("sayhero"), lst = document.getElementById("saylist");
    var on = cur() === "home" && EZ() && (!!S || !FAIL) && !!P;   // 자료가 오기 전에도 자리를 먼저 잡음(왔을 때 화면이 밀리지 않게) · 못 받으면 예전 화면으로
    [].forEach.call(document.querySelectorAll(".say-on"), function(x){ if (!on || x !== P) x.classList.remove("say-on", "say-o-hero", "say-o-mo", "say-o-rows"); });
    if (!on){ if (box && cur() === "home") box.remove(); if (lst && cur() === "home") lst.remove(); return; }
    P.classList.add("say-on"); ["hero", "mo", "rows"].forEach(function(k){ P.classList.toggle("say-o-" + k, !!OPEN[k]); });
    if (!box || box.parentNode !== P){ if (box) box.remove(); box = document.createElement("section"); box.id = "sayhero"; box.setAttribute("data-noemo", "1"); P.insertBefore(box, hero || hb0); LAST = ""; }
    if (!lst || lst.parentNode !== P){ if (lst) lst.remove(); lst = document.createElement("section"); lst.id = "saylist"; lst.setAttribute("data-noemo", "1"); P.insertBefore(lst, hero || hb0); }
    var M = model(); if (!M){ if (!box.firstChild) box.innerHTML = '<div class="say-skel"><i></i><i></i><i></i></div>'; return; }
    var h = heroHtml(M); if (h !== LAST){ box.innerHTML = h; LAST = h; }
    if (!S) return; var l = listHtml(); if (lst.__h !== l){ lst.innerHTML = l; lst.__h = l; }
  }
  var FAIL = false;
  function tick(){ if (cur() !== "home"){ draw(); return; } draw(); load().then(function(x){ FAIL = !x; draw(); }, function(){ FAIL = !S; draw(); }); }

  document.addEventListener("click", function(ev){
    if (!ev.target.closest) return;
    var t = ev.target.closest("[data-saytog]");
    if (t){ ev.stopPropagation(); var k = t.dataset.saytog;
      if (k === "more"){ var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open"); if (op){ if (hb && !hb.classList.contains("ez-open")) op.click(); setTimeout(function(){ op.scrollIntoView({block: "start", behavior: "smooth"}); }, 60); } return; }
      OPEN[k] = !OPEN[k]; var lst = document.getElementById("saylist"); if (lst) lst.__h = ""; draw();
      if (OPEN[k]){ var el = document.getElementById({hero: "ezhero", mo: "mo19", rows: "ezrows"}[k]); if (el) setTimeout(function(){ el.scrollIntoView({block: "nearest", behavior: "smooth"}); }, 60); }
      return; }
    var g = ev.target.closest("[data-saygo]");
    if (g){ ev.stopPropagation(); if (!OPEN.hero){ OPEN.hero = true; var l2 = document.getElementById("saylist"); if (l2) l2.__h = ""; draw(); } var eh = document.getElementById("ezhero"); if (eh) setTimeout(function(){ eh.scrollIntoView({block: "start", behavior: "smooth"}); }, 60); return; }
    var s = ev.target.closest("[data-saysend]");
    if (s){ ev.stopPropagation(); if (window.__onepage && __onepage.sendSay) __onepage.sendSay(); else if (window.__onepage) (__onepage.chooser || __onepage.go)(null); }
  });

  function start(){ tick(); setInterval(tick, 4000); try { var q = 0; new MutationObserver(function(){ if (!q) q = setTimeout(function(){ q = 0; draw(); if (cur() === "home" && !S) tick(); }, 120); }).observe(document.getElementById("main") || document.body, {childList: true}); } catch(x) {} addEventListener("hashchange", function(){ setTimeout(tick, 80); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  var st = document.createElement("style"); st.textContent =
    /* 순서만 바꿈 — 첫 화면 → 한 줄 목록 → 근거 → (열었을 때) 예전 칸 → 나머지는 원래 순서 */
    ".say-on{display:flex;flex-direction:column}.say-on>*{order:50;min-width:0}.say-on>#sayhero{order:1}.say-on>#mnbox{order:2}.say-on>#saylist{order:3}.say-on>#ezhero{order:4}.say-on>#mo19{order:5}.say-on>#ezrows{order:6}" +
    /* 🛡 11/24 「불안정」 — 처음 1~2초 동안 내 종목·대형주·이번 주·고객 질문 칸이 펼쳐진 채 그려졌다 접히며 화면이 1,400px 출렁였음 → 접힌 모양으로 먼저 */
    "html[data-ez=easy] #mnbox>section:not(.ez-x)>:not(h3){display:none!important}" +
    ".say-on>#ezhero,.say-on>#mo19,.say-on>#ezrows{display:none}.say-on.say-o-hero>#ezhero,.say-on.say-o-mo>#mo19,.say-on.say-o-rows>#ezrows{display:block}" +
    "#sayhero{margin:0 0 12px;display:flex;flex-direction:column;gap:8px}#sayhero *{letter-spacing:normal;word-break:keep-all}" +
    ".say-top{font-size:12px;line-height:1.3;color:var(--sub);text-align:right;margin:-4px 2px -2px}" +
    ".say-head{background:#0f1e3d;border-radius:18px;padding:13px 16px}.say-bd{display:flex;gap:8px;align-items:center;margin-bottom:6px}" +
    ".say-bd b{font-size:12px;font-weight:800;border-radius:999px;padding:3px 10px;background:#fde68a;color:#7a4a00}.say-head.w-up .say-bd b{background:#bbf7d0;color:#14532d}.say-head.w-down .say-bd b{background:#fecaca;color:#7f1d1d}" +
    ".say-bd span{font-size:12px;color:#c7d2e5}.say-h1{margin:0;font-size:22px;line-height:1.28;font-weight:900;color:#fff}.say-num{margin:6px 0 0;font-size:13px;line-height:1.45;color:#c7d2e5}" +
    ".say-ts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.say-ts>div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:7px 13px}.say-ts small{font-size:12px;color:var(--sub)}" +
    ".say-ts p{margin:1px 0 0;display:flex;align-items:baseline;gap:8px}.say-ts b{font-size:22px;font-weight:900}.say-ts b.up,.say-one b.up,.say-w b.up{color:var(--up)}.say-ts b.dn,.say-one b.dn,.say-w b.dn{color:var(--down)}.say-ts em{font-style:normal;font-size:13px;color:var(--sub)}" +
    ".say-sh,.say-why,#saylist{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:11px 15px 4px}.say-why{padding-bottom:6px}#saylist{margin:0 0 12px;padding-bottom:4px}" +
    ".say-shh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px}.say-shh b{font-size:15px;font-weight:900;color:var(--text)}.say-shh span{font-size:12px;color:var(--sub)}" +
    ".say-r{display:block;width:100%;text-align:left;font:inherit;color:inherit;background:none;border:0;border-top:1px solid var(--line);padding:8px 0 8px;cursor:pointer}.say-r:first-of-type{border-top:0}" +
    ".say-rn{display:flex;justify-content:space-between;align-items:baseline}.say-rn b{font-size:15px;font-weight:700}.say-rn strong{font-size:17px;font-weight:900}" +
    ".say-bar{display:block;position:relative;height:8px;border-radius:999px;background:var(--panel2);margin:5px 0;overflow:hidden}.say-bar>i{display:block;height:8px;border-radius:999px;background:var(--acc);transition:width .6s}.say-bar.full>i{background:var(--up)}" +
    ".say-bar>u{position:absolute;top:0;bottom:0;width:2px;background:var(--sub);opacity:.7;z-index:1}" +
    ".say-rc{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:12px;line-height:1.4;color:var(--sub)}.say-rc>span{min-width:0}.say-rc em{font-style:normal;font-size:13px;font-weight:800;color:var(--text);text-align:right;flex:0 0 auto;white-space:nowrap}.say-rc small{font-size:11px;font-weight:500;color:var(--sub)}" +
    ".say-one{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:8px 15px;font-size:13px;line-height:1.45}" +
    ".say-cta{display:block;width:calc(100% - 104px);font:inherit;font-size:16px;font-weight:800;color:#fff;background:#2563eb;border:0;border-radius:14px;padding:13px;cursor:pointer}.say-cta:active{transform:scale(.99)}" +
    ".say-w{display:flex;gap:10px;font-size:13px;line-height:1.45;padding:8px 0;border-top:1px solid var(--line)}.say-w small{font-size:13px;color:var(--sub);flex:0 0 78px}.say-w p{margin:0;font-weight:700;flex:1;min-width:0}.say-w u{text-decoration:none}" +
    ".say-l{display:flex;width:100%;align-items:baseline;gap:10px;text-align:left;font:inherit;color:inherit;background:none;border:0;border-top:1px solid var(--line);padding:12px 0;cursor:pointer;min-height:44px}" +
    ".say-l b{font-size:14px;font-weight:700;flex:1;min-width:0}.say-l span{font-size:12px;color:var(--sub);flex:0 0 auto}.say-l i{font-style:normal;color:var(--sub);flex:0 0 auto}.say-l.on b{color:var(--acc)}" +
    ".say-skel{display:flex;flex-direction:column;gap:8px}.say-skel i{display:block;border-radius:18px;background:var(--panel);border:1px solid var(--line);height:150px}.say-skel i:nth-child(2){height:66px}.say-skel i:nth-child(3){height:330px}" +
    ":root[data-ui=light] .say-bar>i{background:#2563eb}";
  document.head.appendChild(st);
})();
