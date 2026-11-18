/* 🧊 11/18 냉정 분석 6차 「만드는 속도 vs 쓰이는 속도」 — 사용자 「1,2,3,4,5,6,7,8,14 진행해」
   새 화면은 없음(2주 동결) — 있는 것을 찾기 쉽게·다시 쓰기 쉽게만.
   ① 🆕 새로 생긴 것 (홈 · 최근 7일 추가 기능 3줄 · 누르거나 ✕ 하면 사라짐 · localStorage nw18)
   ② 📌 내 바로가기 4칸 (홈 맨 위 · 자주 연 화면이 저절로 · 길게 누르면 고정 · localStorage sc18)
   ③ 🗺 섹터 지도 미리보기 (홈 「할 수 있는 일」 첫 줄 — ux1112b.js mapHtml 이 __secTile() 을 부름)
   ⑥ 👀 제안서 「완성본 먼저」 · ⑦ 🔁 「지난번 그대로」 (제안서 맨 위 · propose.js __prop.sample/apply · localStorage pp_hist — 고객 이름은 이 휴대폰에만)
   ⑧ 🧾 세무계산기 결과 → 고객에게 한 장 (1080px 그림 · 받는 분·심의필 번호 칸 · localStorage tx_sim)
   ⑭ 💼 포트: 규칙·지금 판정 먼저, 성적은 접어 둠 (자동 검진 때는 펼친 채)
   ④ 재방문 측정은 usage.py(주 단위 익명 번호) · ⑭ 무게는 tools/bundle.py(묶음 나누기)·sw.js
   끄기: index.html 📦list 에서 이 줄을 빼고 ux1112b.js 의 11/18 줄을 되돌림 */
(function(){
  var D = document;
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function lj(k, d){ try { var v = JSON.parse(ls(k) || "null"); return v == null ? d : v; } catch(x){ return d; } }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function toast(m){ var d = D.createElement("div"); d.className = "ch-toast"; d.textContent = m; D.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2800); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function goTo(k){ if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); } }
  var AUTO = !!navigator.webdriver && ls("x18test") !== "1";   // 자동 검진(health.py·ui_audit)은 예전처럼 펼친 화면을 봄

  /* ═════════ ② 내 바로가기 4칸 ═════════ */
  var SCN = {market: ["🌐", "시황"], sector: ["🧭", "섹터 지도"], feed: ["📰", "피드"], send: ["📨", "한 장"], prop: ["📝", "제안서"], bond: ["🏦", "채권"], fund: ["📦", "펀드"], els: ["🎯", "ELS"],
    divc: ["💰", "배당비교"], onepager: ["🔍", "종목"], flow: ["🧲", "수급"], port: ["💼", "포트"], score: ["📊", "성적표"], sigall: ["🎯", "신호"], tax: ["🧾", "세금 계산"], diag: ["🩻", "포트 진단"],
    lab: ["🔬", "연구실"], luck: ["🔮", "운세"], prob: ["🎲", "오를 확률"], whale: ["🐋", "큰손"], cup: ["☕", "컵 차트"], gap: ["📈", "갭 상승"], screen: ["🔎", "종목 찾기"]};
  var SCDEF = ["sector", "divc", "prop", "tax"];
  function scGet(){ var o = lj("sc18", {}); if (!o || typeof o !== "object") o = {}; o.cnt = o.cnt || {}; o.pin = (o.pin || []).filter(function(k){ return SCN[k]; }).slice(0, 4); return o; }
  function scList(){ var o = scGet(), out = o.pin.slice();
    Object.keys(o.cnt).filter(function(k){ return SCN[k] && o.cnt[k] >= 2 && out.indexOf(k) < 0; }).sort(function(a, b){ return o.cnt[b] - o.cnt[a]; }).forEach(function(k){ if (out.length < 4) out.push(k); });
    SCDEF.forEach(function(k){ if (out.length < 4 && out.indexOf(k) < 0) out.push(k); });
    return {keys: out.slice(0, 4), pin: o.pin}; }
  var scLast = "";
  function scCount(){ var c = cur(); if (!c || c === scLast) return; scLast = c; if (c === "home" || !SCN[c] || AUTO) return; var o = scGet(); o.cnt[c] = Math.min(999, (o.cnt[c] || 0) + 1); ls("sc18", JSON.stringify(o)); }
  function scHtml(){ var L = scList();
    return '<p class="x18-h">내 바로가기 <small>자주 여는 화면이 저절로 · 길게 누르면 고정</small></p><div class="sc18-g">' + L.keys.map(function(k){
      return '<button type="button" data-sc18="' + k + '"' + (L.pin.indexOf(k) >= 0 ? ' class="pin"' : '') + '><span>' + SCN[k][0] + '</span><b>' + SCN[k][1] + '</b></button>'; }).join("") + '</div>'; }
  function scPin(k){ var o = scGet(), i = o.pin.indexOf(k);
    if (i >= 0){ o.pin.splice(i, 1); toast("고정을 풀었어요"); } else { if (o.pin.length >= 4) o.pin.pop(); o.pin.unshift(k); toast("📌 " + SCN[k][1] + " 고정했어요"); }
    ls("sc18", JSON.stringify(o)); homePaint(true); }
  var lpT = null, lpDone = false;
  D.addEventListener("pointerdown", function(ev){ var t = ev.target.closest && ev.target.closest("[data-sc18]"); if (!t) return; lpDone = false; clearTimeout(lpT);
    lpT = setTimeout(function(){ lpDone = true; try { navigator.vibrate && navigator.vibrate(12); } catch(x) {} scPin(t.dataset.sc18); }, 600); }, true);
  ["pointerup", "pointercancel", "pointerleave", "scroll"].forEach(function(n){ D.addEventListener(n, function(){ clearTimeout(lpT); }, true); });
  D.addEventListener("contextmenu", function(ev){ if (ev.target.closest && ev.target.closest("[data-sc18]")) ev.preventDefault(); });

  /* ═════════ ① 새로 생긴 것 ═════════ */
  var NEWS = [
    ["n1118a", "2026-11-18", "🧾", "세무계산기 → 연말 절세 한 장", "결과를 고객에게 그림 한 장으로", "tax"],
    ["n1118b", "2026-11-18", "📝", "제안서 — 완성본 먼저 · 지난번 그대로", "견본을 먼저 보고, 지난 제안서는 이름만 바꿔 다시", "prop"],
    ["n1117b", "2026-11-17", "🗓", "섹터 지도 1·3·6개월", "기간을 바꾸면 섹터 카드 전체가 같이 바뀜", "sector"],
    ["n1117c", "2026-11-17", "🏦", "포트 설계기 — 채권·종목 섞어 보기", "미국채·브라질국채·종목을 넣어 과거 성적 다시 계산", "@design"],
    ["n1117d", "2026-11-17", "💸", "연금·IRP 월 출금 계획", "제안서에 매달 꺼내 쓸 금액을 넣으면 계획표가 붙음", "prop"],
    ["n1116a", "2026-11-16", "🩻", "포트 진단 한 장", "고객 보유 종목 → 쏠림 · 배당 · 고점 대비", "diag"],
    ["n1116b", "2026-11-16", "🖼", "고객 질문 답을 그림 한 장으로", "「지금 팔아야 해요?」 답을 카톡 그림으로", "@qa"]
  ];
  function nwSeen(){ var o = lj("nw18", {}); return o && typeof o === "object" ? o : {}; }
  function nwList(){ var s = nwSeen(), lim = new Date(kst().getTime() - 7 * 864e5).toISOString().slice(0, 10);
    return NEWS.filter(function(n){ return n[1] >= lim && !s[n[0]]; }); }
  var nwAll = false;
  function nwHtml(){ var L = nwList(); if (!L.length) return "";
    var show = nwAll ? L : L.slice(0, 3);
    return '<p class="x18-h">새로 생긴 것 <small>' + L.length + '개 · 최근 7일</small><button type="button" class="nw18-x" data-nw18x="1" aria-label="다 봤어요">다 봤어요 ✕</button></p><div class="nw18-l">' + show.map(function(n){
      return '<button type="button" data-nw18="' + n[0] + '"><span>' + n[2] + '</span><b>' + e(n[3]) + ' <small>' + e(n[4]) + '</small></b><i>›</i></button>'; }).join("") +
      (L.length > show.length ? '<button type="button" class="nw18-m" data-nw18m="1">' + (L.length - show.length) + '개 더 ▾</button>' : '') + '</div>'; }
  function nwGo(id){ var n = NEWS.filter(function(x){ return x[0] === id; })[0]; if (!n) return;
    var s = nwSeen(); s[id] = 1; ls("nw18", JSON.stringify(s));
    var k = n[5];
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); else goTo("send"); return; }
    if (k === "@design"){ goTo("port"); var c = 0; (function seek(){ var z = D.getElementById("podz"), more = D.getElementById("ezcapb");
      if (z && z.classList.contains("ez-cap-hid") && more) more.click();
      if (z && z.getBoundingClientRect().height > 0){ z.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++c < 30) setTimeout(seek, 300); })(); return; }
    goTo(k); }

  /* ═════════ ③ 섹터 지도 미리보기 (ux1112b.js mapHtml → __secTile) ═════════ */
  var SEC = null, SECT = 0;
  function secLoad(){ if (Date.now() - SECT < 300000 || !window.getJSON || typeof M === "undefined") return; SECT = Date.now();
    try { var it = ((M.cats && M.cats.sector) || [])[0]; if (!it || (it.files || []).indexOf("compass.json") < 0) return;
      getJSON(file("sector", it.id, "compass.json"), {ttl: 300000}).then(function(C){ var m = C && C.markets && C.markets.KR; if (!m || !m.sectors) return;
        var ix = (m.index || [])[0] || {}, b20 = +ix.chg20 || 0, b5 = +ix.chg5 || 0;
        var ss = m.sectors.filter(function(x){ return x.r20 != null && x.r5 != null; }).map(function(x){ return {n: String(x.name || "").replace(/\(.*$/, "").split("·")[0].trim(), x: x.r20 - b20, y: x.r5 - b5}; });
        if (ss.length < 4) return;
        SEC = {ss: ss, date: m.date || C.date, ix: ix.name || "코스피"}; }).catch(function(){}); } catch(x) {} }
  window.__secTile = function(){
    secLoad(); if (!SEC) return "";
    var ss = SEC.ss, W = 108, H = 72, P = 6, lim = function(a){ var v = a.map(Math.abs).sort(function(p, q){ return p - q; }); return Math.max(1, v[Math.floor(v.length * 0.85)] || 1); };
    var mx = lim(ss.map(function(o){ return o.x; })), my = lim(ss.map(function(o){ return o.y; }));
    var X = function(v){ v = Math.max(-mx, Math.min(mx, v)); return P + (v + mx) / (2 * mx) * (W - 2 * P); }, Y = function(v){ v = Math.max(-my, Math.min(my, v)); return P + (my - v) / (2 * my) * (H - 2 * P); };
    var sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="sec18-sv" aria-hidden="true"><rect x="' + X(0) + '" y="' + P + '" width="' + (W - P - X(0)) + '" height="' + (Y(0) - P) + '" fill="#e66767" opacity=".13"/>' +
      '<rect x="' + P + '" y="' + Y(0) + '" width="' + (X(0) - P) + '" height="' + (H - P - Y(0)) + '" fill="#3987e5" opacity=".13"/>' +
      '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="currentColor" opacity=".25"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + P + '" y2="' + (H - P) + '" stroke="currentColor" opacity=".25"/>' +
      ss.map(function(o){ var hot = o.x > 0 && o.y > 0, cold = o.x < 0 && o.y < 0; return '<circle cx="' + X(o.x).toFixed(1) + '" cy="' + Y(o.y).toFixed(1) + '" r="3" fill="' + (hot ? "#e0524a" : cold ? "#3f7fe0" : "#9aa3b5") + '"/>'; }).join("") + '</svg>';
    var by = ss.slice().sort(function(a, b){ return b.x - a.x; }), up = by.slice(0, 2).map(function(o){ return o.n; }), dn = by.slice(-2).reverse().map(function(o){ return o.n; });
    return '<button type="button" class="jm-t sec18" data-jm="sector">' + sv + '<span class="sec18-t"><b>오늘 섹터 지도</b><small>🇰🇷 한 달 ' + e(SEC.ix) + '보다 강한 곳 <u class="up">' + e(up.join(" · ")) + '</u></small><small>약한 곳 <u class="dn">' + e(dn.join(" · ")) + '</u></small><em>' + md(SEC.date) + ' 기준 · 5개 시장 보기 ›</em></span></button>'; };

  /* ═════════ 홈에 얹기 (①·②) ═════════ */
  function homePaint(force){
    if (cur() !== "home"){ return; }
    var hero = D.getElementById("ezhero"); if (!hero) return;
    var box = D.getElementById("x18home");
    if (!box){ box = D.createElement("section"); box.id = "x18home"; box.className = "no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    if (hero.previousElementSibling !== box) hero.insertAdjacentElement("beforebegin", box);
    var nh = AUTO ? "" : nwHtml(), h = '<div class="sc18">' + scHtml() + '</div>' + (nh ? '<div class="nw18">' + nh + '</div>' : '');
    if (force || box._h !== h){ box.innerHTML = h; box._h = h; }
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-sc18],[data-nw18],[data-nw18x],[data-nw18m]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.sc18){ if (lpDone){ lpDone = false; return; } goTo(t.dataset.sc18); return; }
    if (t.dataset.nw18){ nwGo(t.dataset.nw18); return; }
    if (t.dataset.nw18m){ nwAll = true; homePaint(true); return; }
    if (t.dataset.nw18x){ var s = nwSeen(); nwList().forEach(function(n){ s[n[0]] = 1; }); ls("nw18", JSON.stringify(s)); homePaint(true); }
  });

  /* ═════════ ⑥ 완성본 먼저 · ⑦ 지난번 그대로 (제안서) ═════════ */
  function b64e(str){ return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  var SAMP = [
    ["pension", "🌴 은퇴 준비", "개인연금 3억 · 매달 150만원 꺼내 쓰기", {v: 1, s: ["pension"], p: 3, a: {pension: 30000}, o: {pension: {w: 150, c: "1101"}}}],
    ["gl_stock", "🚀 성장형", "국내+해외 주식 1억", {v: 1, s: ["gl_stock"], p: 5, a: {gl_stock: 10000}, o: {gl_stock: {c: "1111"}}}],
    ["ktb", "🛡 안정형", "국고채 2억", {v: 1, s: ["ktb"], p: 1, a: {ktb: 20000}, o: {}}]
  ];
  function won(w){ var man = Math.round(w / 10000); if (!man) return ""; if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만" : ""); } return man.toLocaleString("ko-KR") + "만"; }
  function hist(){ var a = lj("pp_hist", []); return Array.isArray(a) ? a.filter(function(x){ return x && x.code && x.names; }).slice(0, 6) : []; }
  D.addEventListener("click", function(ev){   // 만들 때마다 「지난번」으로 기억 (심의 요청서는 빼고)
    var t = ev.target.closest && ev.target.closest("#ppw [data-mk], #ppw #ppshow"); if (!t || !window.__prop) return;
    if (t.dataset.mk && /^rev/.test(t.dataset.mk)) return;
    try { var code = __prop.code(); if (!code) return; var I = __prop.info(); if (!I.total) return;
      var a = hist().filter(function(x){ return !(x.code === code && x.cust === I.cust); });
      a.unshift({code: code, cust: I.cust, names: I.names.join(" · "), total: I.total, prof: I.prof, at: today()}); ls("pp_hist", JSON.stringify(a.slice(0, 6))); } catch(x) {}
  }, true);
  function ppStep(i){ var n = 0; (function seek(){ var b = D.querySelector('#ezwiz [data-st="' + i + '"]'); if (b){ b.click(); return; } if (++n < 20) setTimeout(seek, 150); })(); }
  function ppApply(code, cust, step, msg){ if (!window.__prop || !__prop.apply(code, cust)){ toast("불러오지 못했어요 — 잠시 뒤 다시 눌러 주세요"); return; }
    ppStep(step); if (msg) toast(msg); }
  var ppOpen = true, ppThumbT = null;
  function ppHtml(){
    var H = hist(), S = SAMP.filter(function(s){ return __prop.has(s[0]); });
    var h = "";
    if (H.length) h += '<p class="x18-h">지난번 그대로 <small>이 휴대폰에만 기억</small></p><div class="pp18-l">' + H.slice(0, 3).map(function(x, i){
      return '<div class="pp18-r"><button type="button" data-pp18h="' + i + '"><b>' + e(x.cust || "고객님") + '</b><small>' + e(x.names) + (won(x.total) ? " · " + won(x.total) : "") + (x.prof ? " · " + e(x.prof) : "") + ' · ' + md(x.at) + '</small></button>' +
        '<button type="button" class="alt" data-pp18n="' + i + '">이름만 바꿔</button></div>'; }).join("") + '</div>';
    if (S.length) h += '<p class="x18-h">완성본 먼저 보기 <small>이렇게 나와요 · 누르면 이 틀로 시작</small></p>' +
      '<div class="pp18-s">' + S.map(function(s, i){ return '<button type="button" class="pp18-c" data-pp18s="' + i + '"><span class="pp18-th" data-th="' + i + '"><i class="loading">그리는 중…</i></span><b>' + s[1] + '</b><small>' + e(s[2]) + '</small><em>이 틀로 만들기 ›</em></button>'; }).join("") + '</div>';
    return h; }
  function ppThumbs(){ clearTimeout(ppThumbT); var S = SAMP.filter(function(s){ return __prop.has(s[0]); }), i = 0;
    (function one(){ var el = D.querySelector('#pp18 [data-th="' + i + '"]'); if (!el || i >= S.length) return;
      var html = ""; try { html = __prop.sample(b64e(JSON.stringify(S[i][3]))); } catch(x) {}
      if (html){ var w = el.clientWidth || 200, sc = w / 1080; el.innerHTML = '<div class="pp18-in" style="transform:scale(' + sc + ');transform-origin:0 0;width:1080px">' + html.replace(/\sid="[^"]*"/g, "") + '</div>'; }
      else el.innerHTML = '<i class="loading">견본을 못 그렸어요</i>';
      i++; ppThumbT = setTimeout(one, 120); })(); }
  function ppPaint(){
    var box = D.getElementById("pp18");
    if (cur() !== "prop" || AUTO){ if (box) box.remove(); return; }
    var w = D.getElementById("ppw"); if (!w || !window.__prop || !__prop.ready() || !w.querySelector(".pp-pf")) return;
    var on = D.querySelector("#ezwiz .ezw-s button.on"), st = on ? +on.dataset.st : 0;
    if (st >= 2){ if (box) box.hidden = true; return; }
    if (!box){ box = D.createElement("section"); box.id = "pp18"; box.className = "card no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box.hidden = false;
    var anchor = D.getElementById("ezwiz") || w; if (anchor.previousElementSibling !== box) anchor.parentNode.insertBefore(box, anchor);
    var key = JSON.stringify(hist()) + "|" + ppOpen + "|" + SAMP.map(function(s){ return __prop.has(s[0]) ? 1 : 0; }).join("");
    if (box._k === key) return; box._k = key;
    var h = ppHtml(); if (!h){ box.hidden = true; return; }
    box.innerHTML = h; if (ppOpen) ppThumbs();
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pp18 [data-pp18h],#pp18 [data-pp18n],#pp18 [data-pp18s],#pp18 [data-pp18o]"); if (!t) return; ev.stopPropagation();
    var H = hist(), S = SAMP.filter(function(s){ return window.__prop && __prop.has(s[0]); }), x;
    if (t.dataset.pp18h != null && (x = H[+t.dataset.pp18h])){ ppApply(x.code, x.cust, 3, "지난번 그대로 불러왔어요 — 📱 한 장 · PDF 중 하나만 누르면 끝"); return; }
    if (t.dataset.pp18n != null && (x = H[+t.dataset.pp18n])){ ppApply(x.code, "", 2, "상품·금액은 그대로 — 고객 이름만 넣어 주세요"); return; }
    if (t.dataset.pp18o != null){ if (+t.dataset.pp18o < 0){ ppOpen = true; var b = D.getElementById("pp18"); if (b) b._k = ""; ppPaint(); return; } x = S[+t.dataset.pp18o]; }
    if (t.dataset.pp18s != null) x = S[+t.dataset.pp18s];
    if (x) ppApply(b64e(JSON.stringify(x[3])), "", 3, "견본을 불러왔어요 — 아래 미리 보기 확인 · 이름·금액은 3단계에서 바꿔요");
  });

  /* ═════════ ⑧ 세무계산기 결과 → 고객에게 한 장 ═════════ */
  var W = 1080, MX = 60, CW = W - MX * 2;
  var INK = "#141414", SUB = "#6a6f7a", MUT = "#9aa0ab", LINE = "#e6e8ec", RED = "#d6453d", GRN = "#1f9d6b", BLUE = "#3182f6", BG = "#f7f7f5", TILE = "#ffffff";
  var F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  function font(g, w, s){ g.font = w + " " + s + "px " + F; }
  function rr(g, x, y, w, h, r, fill){ g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }
  function lines(g, text, w, max){
    var out = [], line = "", toks = String(text == null ? "" : text).split(/(\s+)/);
    toks.forEach(function(tk){ if (!tk) return;
      if (g.measureText(line + tk).width <= w){ line += tk; return; }
      if (/^\s+$/.test(tk)){ if (line){ out.push(line); line = ""; } return; }
      if (line.trim()){ out.push(line.replace(/\s+$/, "")); line = ""; }
      while (g.measureText(tk).width > w){ var i = 1; while (i < tk.length && g.measureText(tk.slice(0, i + 1)).width <= w) i++; out.push(tk.slice(0, i)); tk = tk.slice(i); }
      line = tk; });
    if (line.trim()) out.push(line.replace(/\s+$/, ""));
    if (max && out.length > max){ out = out.slice(0, max); var l = out[max - 1]; while (l.length > 1 && g.measureText(l + "…").width > w) l = l.slice(0, -1); out[max - 1] = l + "…"; }
    return out; }
  function para(g, text, x, y, w, lh, max){ var L = lines(g, text, w, max); L.forEach(function(t, i){ g.fillText(t, x, y + i * lh); }); return L.length * lh; }
  function fit(g, text, w){ var t = String(text); if (g.measureText(t).width <= w) return t; while (t.length > 1 && g.measureText(t + "…").width > w) t = t.slice(0, -1); return t + "…"; }
  function tx(el){ return String((el && (el.innerText || el.textContent)) || "").replace(/\s+/g, " ").trim(); }
  function pctOf(el, prop){ var m = /([\d.]+)%/.exec((el && el.style && el.style[prop]) || ""); return m ? Math.max(0, Math.min(100, +m[1])) / 100 : null; }
  function taxCanvas(o){
    var c = D.createElement("canvas"); c.width = W; c.height = 6000; var g = c.getContext("2d"); g.textBaseline = "alphabetic"; g.fillStyle = BG; g.fillRect(0, 0, W, 6000);
    var d = kst(), ds = (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + "일월화수목금토"[d.getUTCDay()] + ")", y;
    var cl = String(o.client || "").trim(); if (cl) cl = /님$/.test(cl) ? cl : cl + " 고객님";
    if (cl){ g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, cl + "께", CW * 0.55), MX, 72); }
    g.textAlign = "right"; g.fillStyle = SUB; font(g, 600, 22); g.fillText(fit(g, ds + (o.pb ? " · " + o.pb + " 드림" : ""), CW * (cl ? 0.42 : 1)), W - MX, 70); g.textAlign = "left"; y = 112;
    g.fillStyle = INK; font(g, 900, 50); y += para(g, o.title, MX, y + 50, CW, 62, 2) + 14;
    if (o.inputs){ g.fillStyle = SUB; font(g, 500, 25); y += para(g, "넣은 값 — " + o.inputs, MX, y + 28, CW, 36, 3) + 16; }
    y += 10;
    o.nodes.forEach(function(n){
      if (n.k === "sec"){ y += 14; g.fillStyle = INK; font(g, 800, 32); g.fillText(fit(g, n.t, CW), MX, y + 34); y += 54; return; }
      if (n.k === "gauge"){
        rr(g, MX, y, CW, 150 + 0, 24, TILE); var bx = MX + 32, bw = CW - 64, by = y + 62;
        rr(g, bx, by, bw, 18, 9, LINE); if (n.w != null) rr(g, bx, by, Math.max(18, bw * n.w), 18, 9, n.red ? RED : BLUE);
        n.marks.forEach(function(m){ var px = bx + bw * m.x; g.fillStyle = INK; g.fillRect(px - 1.5, by - 10, 3, 38); g.fillStyle = SUB; font(g, 600, 20); g.textAlign = m.x > 0.7 ? "right" : m.x < 0.2 ? "left" : "center"; g.fillText(m.t, px, by - 20); g.textAlign = "left"; });
        g.fillStyle = INK; font(g, 700, 27); g.fillText(fit(g, n.t, bw), bx, by + 66); y += 150 + 16; return; }
      if (n.k === "big"){
        font(g, 500, 23); var sl = n.sub ? lines(g, n.sub, CW - 64, 4) : [], h = 132 + sl.length * 32 + (sl.length ? 8 : 0);
        rr(g, MX, y, CW, h, 24, TILE); rr(g, MX, y + 22, 8, h - 44, 4, n.tone === "bad" ? RED : n.tone === "good" ? GRN : BLUE);
        g.fillStyle = SUB; font(g, 600, 24); g.fillText(fit(g, n.lab, CW - 64), MX + 32, y + 46);
        g.fillStyle = n.tone === "bad" ? RED : n.tone === "good" ? GRN : INK; font(g, 900, 54); g.fillText(fit(g, n.val, CW - 64), MX + 32, y + 108);
        g.fillStyle = SUB; font(g, 500, 23); sl.forEach(function(t, i){ g.fillText(t, MX + 32, y + 150 + i * 32); });
        y += h + 16; return; }
      if (n.k === "bars"){
        var rh = 62, h2 = 28 + n.rows.length * rh + 12; rr(g, MX, y, CW, h2, 24, TILE);
        n.rows.forEach(function(r, i){ var ry = y + 28 + i * rh, lw = 330, vw = 250, bx2 = MX + 32 + lw + 12, bw2 = CW - 64 - lw - vw - 24;
          g.fillStyle = r.best ? INK : SUB; font(g, r.best ? 800 : 600, 24); g.fillText(fit(g, r.lab, lw), MX + 32, ry + 30);
          rr(g, bx2, ry + 12, bw2, 20, 10, LINE); if (r.w > 0) rr(g, bx2, ry + 12, Math.max(10, bw2 * r.w), 20, 10, r.best ? BLUE : "#aab4c8");
          g.textAlign = "right"; g.fillStyle = r.best ? BLUE : INK; font(g, 800, 25); g.fillText(fit(g, r.val, vw), W - MX - 32, ry + 31); g.textAlign = "left"; });
        y += h2 + 16; return; }
      if (n.k === "tips"){
        y += 10; g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, n.t, CW), MX, y + 32); y += 54;
        n.items.forEach(function(t){ g.fillStyle = BLUE; g.beginPath(); g.arc(MX + 10, y + 18, 6, 0, 6.3); g.fill(); g.fillStyle = INK; font(g, 500, 25); y += para(g, t, MX + 34, y + 27, CW - 34, 37, 4) + 14; });
        y += 6; return; }
      if (n.k === "note"){ g.fillStyle = SUB; font(g, 500, 23); y += para(g, n.t, MX, y + 26, CW, 34, 4) + 14; return; }
    });
    var foot = (o.asof ? o.asof + " 세법 · " : "") + "넣은 값만으로 한 어림 계산 — 개인별 공제·세대 사정에 따라 실제 세금·보험료는 달라요 · 신고 전 세무사·홈택스·건강보험공단 확인 · 세무 자문·투자 권유 아님" + (o.sim ? " · " + o.sim : "");
    var H = Math.max(1350, y + 190), o2 = D.createElement("canvas"); o2.width = W; o2.height = H; var g2 = o2.getContext("2d"); g2.textBaseline = "alphabetic"; g2.fillStyle = BG; g2.fillRect(0, 0, W, H);
    g2.drawImage(c, 0, 0, W, y, 0, 0, W, y); g2.fillStyle = LINE; g2.fillRect(MX, H - 150, CW, 2); g2.fillStyle = MUT; font(g2, 500, 21); para(g2, foot, MX, H - 112, CW, 29, 4);
    return o2; }
  function taxNodes(out){
    var N = []; [].forEach.call(out.children, function(el){
      var cn = el.className || "";
      if (el.id === "tx18" || /hub-h|tx-base|tx-wait/.test(cn) || el.tagName === "DETAILS") return;
      if (/tx-sec/.test(cn)){ N.push({k: "sec", t: tx(el)}); return; }
      if (/\btx-g\b/.test(cn)){ var u = el.querySelector(".tx-gt u"); N.push({k: "gauge", w: pctOf(u, "width"), red: !!(u && /\br\b/.test(u.className)), t: tx(el.querySelector("p")),
        marks: [].map.call(el.querySelectorAll(".tx-gt i"), function(i){ return {x: pctOf(i, "left") || 0, t: tx(i)}; })}); return; }
      if (/tx-big/.test(cn)){ N.push({k: "big", lab: tx(el.querySelector("small")), val: tx(el.querySelector("b")), sub: tx(el.querySelector("span")), tone: /tx-bad/.test(cn) ? "bad" : /tx-good|tx-ok/.test(cn) ? "good" : ""}); return; }
      if (/tx-bars/.test(cn)){ N.push({k: "bars", rows: [].map.call(el.querySelectorAll(".tx-b"), function(r){ return {lab: tx(r.querySelector("span")), val: tx(r.querySelector("b")), w: pctOf(r.querySelector("u"), "width") || 0, best: /tx-best/.test(r.className)}; })}); return; }
      if (/tx-th/.test(cn)){ N.push({k: "tips", t: tx(el), items: []}); return; }
      if (/tx-tip/.test(cn)){ var last = N[N.length - 1]; if (!last || last.k !== "tips"){ last = {k: "tips", t: "같이 볼 것", items: []}; N.push(last); }
        [].slice.call(el.querySelectorAll("li"), 0, 5).forEach(function(li){ last.items.push(tx(li)); }); return; }
      var t = tx(el); if (t && !/더 정확하게|칸에 넣/.test(t)) N.push({k: "note", t: t});
    });
    return N.filter(function(n){ return n.k !== "tips" || n.items.length; }); }
  function taxInputs(c, v){ var out = [];
    (c.segs || []).forEach(function(s){ var o = s.opts.filter(function(x){ return x[0] === v[s.id]; })[0]; if (o) out.push(o[1]); });
    c.fields.forEach(function(f){ if ((f.on && !f.on(v)) || !v[f.id]) return; out.push(f.label.replace(/^그중 /, "") + " " + (f.unit ? v[f.id] + f.unit : Number(v[f.id]).toLocaleString("ko-KR") + "만원")); });
    return out.join(" · "); }
  function simGet(){ var o = lj("tx_sim", {}); return o && typeof o === "object" ? o : {}; }
  function simLine(){ var s = simGet(); if (!s.no) return ""; if (s.to && s.to < today()) return ""; return "심의필 " + s.no + (s.to ? " (유효 ~" + s.to.replace(/-/g, ".") + ")" : ""); }
  function recent(){ var a = lj("op_clients", []); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 6) : []; }
  function taxSheet(){
    var T = window.__tax, out = D.getElementById("txout"); if (!T || !out) return;
    var k = ls("txsel"), c = T.calcs.filter(function(x){ return x.k === k; })[0]; if (!c || !out.querySelector(".tx-big,.tx-bars")){ toast("숫자를 먼저 넣어 주세요"); return; }
    var old = D.getElementById("opch"); if (old) old.remove();
    var s = simGet(), exp = s.no && s.to && s.to < today(), box = D.createElement("div"); box.id = "opch";
    box.innerHTML = '<div class="opc-s"><h3>📨 ' + c.ic + ' ' + e(c.t) + ' — 고객에게 한 장</h3>' +
      '<label class="opc-n">💌 받는 분 <input id="tx18c" maxlength="20" placeholder="고객 이름 (비워도 돼요)"></label>' +
      (recent().length ? '<div class="tx18-rc">' + recent().map(function(n){ return '<button type="button" data-tx18c="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<label class="opc-n">✍️ 보내는 사람 <input id="tx18p" maxlength="30" placeholder="내 이름 (예: 김OO PB)" value="' + e(ls("pbname") || "") + '"></label>' +
      '<label class="opc-n">⚖️ 심의필 번호 <input id="tx18n" maxlength="40" placeholder="예: 제2026-0000호 (받은 것만)" value="' + e(s.no || "") + '"></label>' +
      '<label class="opc-n">유효기간 끝 <input id="tx18t" type="date" value="' + e(s.to || "") + '"></label>' +
      '<p class="tx18-w" id="tx18w">' + (exp ? "⏰ 심의필 유효기간이 지났어요 — 번호 없이 만들어져요" : s.no ? "✅ 그림 아래에 심의필 번호가 찍혀요" : "⚠️ 심의필 번호가 없어요 — 고객에게 보내기 전에 준법감시 심의를 받아 번호를 넣어 주세요") + '</p>' +
      '<button class="opc-go" data-tx18go="1">한 장 만들기</button><button class="opc-x" data-x="1">닫기</button></div>';
    D.body.appendChild(box);
    box.addEventListener("click", function(ev){ var t = ev.target;
      if (t === box || t.closest("[data-x]")){ box.remove(); return; }
      var rc = t.closest("[data-tx18c]"); if (rc){ D.getElementById("tx18c").value = rc.dataset.tx18c; return; }
      if (!t.closest("[data-tx18go]")) return;
      var client = D.getElementById("tx18c").value.trim().slice(0, 20), pb = D.getElementById("tx18p").value.trim().slice(0, 30);
      ls("pbname", pb); ls("tx_sim", JSON.stringify({no: D.getElementById("tx18n").value.trim().slice(0, 40), to: D.getElementById("tx18t").value || ""}));
      if (client){ var a = recent().filter(function(x){ return x !== client; }); a.unshift(client); ls("op_clients", JSON.stringify(a.slice(0, 8))); }
      box.remove(); toast("한 장 만드는 중…");
      var cv; try { cv = taxCanvas({client: client, pb: pb, title: c.ic + " " + c.t, inputs: taxInputs(c, T.state[c.k] || {}), nodes: taxNodes(out), asof: T.law && T.law.asof, sim: simLine()}); } catch(x){ console.error("tax18", x); toast("그림을 만들지 못했어요"); return; }
      var fname = (client ? client.replace(/[^\w가-힣]+/g, "") + "님_" : "") + "절세_" + c.t.replace(/[^\w가-힣]+/g, "") + "_" + today().slice(5).replace("-", "") + ".png";
      var done = false, end = function(b){ if (done) return; done = true; if (!b){ toast("그림을 만들지 못했어요 — 다시 눌러 주세요"); return; } var f = new File([b], fname, {type: "image/png"});
        if (window.__onepage && __onepage.ready) __onepage.ready([f], "절세 한 장"); else { var a2 = D.createElement("a"); a2.href = URL.createObjectURL(f); a2.download = fname; a2.click(); } };
      setTimeout(function(){ end(null); }, 8000); try { cv.toBlob(function(b){ end(b); }, "image/png"); } catch(x){ end(null); }
    });
  }
  function taxPaint(){
    if (cur() !== "tax") return; var out = D.getElementById("txout"); if (!out || out.hidden) return;
    var has = !!out.querySelector(".tx-big,.tx-bars"), b = D.getElementById("tx18");
    if (!has){ if (b) b.remove(); return; }
    if (b && b.parentNode === out && !b.nextElementSibling) return;
    if (!b){ b = D.createElement("button"); b.type = "button"; b.id = "tx18"; b.className = "hub-cta"; b.setAttribute("data-j", "opch"); b.innerHTML = '📨 이 결과를 고객에게 한 장으로<small>받는 분 이름 · 심의필 번호를 넣을 수 있어요</small>'; }
    out.appendChild(b);
  }
  D.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("#tx18"); if (!t) return; ev.stopPropagation(); taxSheet(); });

  /* ═════════ ⑭ 포트 — 성적은 접어 둠 ═════════ */
  var pfOpen = false;
  function portPaint(){
    if (cur() !== "port"){ pfOpen = false; return; }
    var sum = D.getElementById("posum"), win = D.querySelector("#pobody > .po-win"); if (!sum) return;
    var b = D.getElementById("pf18"), off = !pfOpen && !AUTO;
    sum.classList.toggle("pf18-off", off); if (win) win.classList.toggle("pf18-off", off);
    if (AUTO){ if (b) b.remove(); return; }
    if (!b){ b = D.createElement("button"); b.type = "button"; b.id = "pf18"; }
    if (sum.previousElementSibling !== b) sum.parentNode.insertBefore(b, sum);   // 성적 카드 바로 앞(다른 스크립트가 카드 순서를 바꿔도 따라감)
    var h = pfOpen ? '📊 성적 접기 ▴' : '📊 성적 보기 ▾<small>10/2부터 · 시장과 비교 — 규칙과 지금 판정은 위에</small>'; if (b._h !== h){ b.innerHTML = h; b._h = h; }
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pf18, #pobody .po-stk button, #pobody .po-stk a"); if (!t) return;
    if (t.id === "pf18"){ ev.stopPropagation(); pfOpen = !pfOpen; portPaint(); return; }
    if (!pfOpen && /성적|비교/.test(t.textContent || "")){ pfOpen = true; portPaint(); }
  }, true);

  /* ═════════ 모양 ═════════ */
  var st = D.createElement("style");
  st.textContent =
    "#x18home{margin:0 0 12px}.x18-h{margin:4px 4px 8px;font-size:15px;font-weight:800;display:flex;align-items:baseline;gap:6px}.x18-h small{font-size:12.5px;font-weight:500;color:var(--sub);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sc18-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.sc18-g button{position:relative;font:inherit;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:10px 4px 9px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}" +
    ".sc18-g button:active{transform:scale(.97)}.sc18-g span{font-size:22px;line-height:1}.sc18-g b{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.sc18-g button.pin{border-color:#3182f6}.sc18-g button.pin:after{content:'';position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;background:#3182f6}" +
    ".nw18{margin-top:10px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:10px 12px 2px}.nw18 .x18-h{margin:0 2px 2px}.nw18-x{font:inherit;font-size:12.5px;font-weight:600;color:var(--sub);background:transparent;border:0;padding:4px 2px;cursor:pointer;flex:none}" +
    ".nw18-l button{display:grid;grid-template-columns:26px 1fr 14px;column-gap:8px;align-items:center;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:8px 2px;cursor:pointer}.nw18-l button:first-child{border-top:0}" +
    ".nw18-l span{font-size:18px;text-align:center}.nw18-l b{display:block;font-size:15px;font-weight:700;min-width:0;white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis}.nw18-l b small{display:inline!important;white-space:nowrap!important;font-size:13px;font-weight:500;color:var(--sub);margin-left:4px}.nw18-l i{font-style:normal;color:var(--sub);font-size:18px}" +
    ".nw18-l button.nw18-m{display:block;text-align:center;font-size:13px;font-weight:700;color:var(--sub);padding:7px 2px}" +
    /* 섹터 타일 */
    ".jm-t.sec18{flex-direction:row;align-items:center;gap:12px;min-height:0;width:100%;margin:0 0 8px;padding:12px 14px}.sec18-sv{width:108px;height:72px;flex:none;border-radius:10px;background:var(--panel2,rgba(127,127,127,.08));color:var(--sub)}" +
    ".sec18-t{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.sec18-t small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sec18-t u{text-decoration:none;font-weight:700}.sec18-t u.up{color:#e0524a}.sec18-t u.dn{color:#3f7fe0}.jm-t.sec18 em{margin-top:2px;padding-top:2px;min-height:0}" +
    /* 제안서 */
    "#pp18{padding:14px 14px 12px;margin-bottom:12px}#pp18 .x18-h{margin:2px 2px 8px}#pp18 .x18-h+*{margin-bottom:12px}#pp18>*:last-child{margin-bottom:0}" +
    ".pp18-r{display:flex;gap:8px;align-items:stretch;border-top:1px solid var(--line);padding:8px 0}.pp18-r:first-child{border-top:0;padding-top:0}.pp18-r button{font:inherit;color:var(--text);background:transparent;border:0;cursor:pointer;text-align:left;min-width:0}" +
    ".pp18-r button:first-child{flex:1;display:flex;flex-direction:column;gap:2px;padding:4px 2px}.pp18-r b{font-size:15.5px;font-weight:800}.pp18-r small{font-size:13px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pp18-r button.alt{flex:none;font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:12px;padding:0 12px;color:var(--sub)}" +
    ".pp18-chips{display:flex;flex-direction:column;gap:8px}.pp18-chips button{font:inherit;color:var(--text);background:var(--panel2,transparent);border:1px solid var(--line);border-radius:14px;padding:10px 12px;cursor:pointer;text-align:left;display:flex;align-items:baseline;gap:8px;min-width:0}.pp18-chips b{font-size:15px;font-weight:800;flex:none}.pp18-chips small{font-size:13px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pp18-open{display:block;width:100%;font:inherit;font-size:14px;font-weight:700;color:#3182f6;background:transparent;border:0;padding:8px 0 2px;cursor:pointer}" +
    ".pp18-s{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:4px}.pp18-c{flex:none;width:62%;max-width:240px;scroll-snap-align:start;font:inherit;color:var(--text);background:transparent;border:1px solid var(--line);border-radius:16px;padding:8px 8px 10px;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:3px}" +
    ".pp18-th{display:block;position:relative;height:270px;overflow:hidden;border-radius:10px;background:#fff;margin-bottom:6px;pointer-events:none}.pp18-th:after{content:'';position:absolute;left:0;right:0;bottom:0;height:46px;background:linear-gradient(rgba(255,255,255,0),#fff)}.pp18-th .loading{display:block;padding:20px 8px;font-style:normal;font-size:13px;color:#888;text-align:center}" +
    ".pp18-c b{font-size:15px;font-weight:800}.pp18-c small{font-size:13px;color:var(--sub);line-height:1.35}.pp18-c em{font-style:normal;font-size:13px;font-weight:700;color:#3182f6;margin-top:2px}" +
    /* 세무 한 장 */
    "#tx18{margin-top:14px}#tx18 small{display:block;font-size:12.5px;font-weight:500;opacity:.85;margin-top:2px}.tx18-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 8px}.tx18-rc button{font:inherit;font-size:13px;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);padding:4px 10px;cursor:pointer}.tx18-w{margin:4px 2px 10px;font-size:13px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    /* 포트 성적 접기 */
    ".pf18-off{display:none!important}#pf18{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:13px 12px;margin:10px 0;cursor:pointer}#pf18 small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:3px}";
  D.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; [scCount, homePaint, ppPaint, taxPaint, portPaint].forEach(function(f){ try { f(); } catch(x){ console.warn("ux1118", x); } }); }
  function soon(){ if (!q) q = setTimeout(tick, 180); }
  function start(){ tick(); try { new MutationObserver(soon).observe(D.body, {childList: true, subtree: true}); } catch(x) {} setInterval(tick, 3000); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  window.__ux1118 = {news: NEWS, taxNodes: taxNodes, taxCanvas: taxCanvas};   // 점검용
})();
