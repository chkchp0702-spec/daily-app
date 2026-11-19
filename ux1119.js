/* 🌅 11/19 아침 시황 업그레이드 — 사용자 「매일 아침 시황리포트를 냉정·객관적으로 분석해 업그레이드 · PB·고객이 아침에 보고 전략·리밸런싱에 쓰게 · 우와」 → 「전부 다 진행」
   자료: market-strategy-report src/morning.py → market/morning.json (리포트 새 1·2쪽과 같은 숫자)
   ④ 넘겨 보는 카드 5장 (#mo19) — 오늘 홈 첫 칸 아래 · 시황 탭 맨 위. 결론 → 달라진 것 → 돈의 흐름 → 행동(성향별) → 오늘 장 준비
      그 아래 접힌 두 줄: ⑨ 우리 조언 성적표 · ⑩ 우리가 틀렸다면
   ⑦ 고객 포트 대입 (#dg19) — 🩻 포트 진단 결과 아래에 「오늘 리포트 기준이면」 PB용 처방(주식 % · 한국 주식 · 업종 · 완충) — 그림 한 장(고객용)에는 넣지 않음
   새 화면 없음(12/1까지 동결 약속) — 있는 화면 맨 위에 얹기만.
   끄기: index.html 📦list 에서 이 줄을 빼면 끝 */
(function(){
  var D = document, RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 300000}) : fetch(u).then(function(r){ if (!r.ok) throw 0; return r.json(); })).catch(function(){ return null; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v == null ? "" : v >= 0 ? "u" : "d"; }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function won(man){ man = Math.round(Math.abs(man)); if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만원" : "원"); } return man.toLocaleString("ko-KR") + "만원"; }
  function goTo(k){ if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); } }
  var MO = null, MOT = 0;
  function load(){ if (MO && Date.now() - MOT < 300000) return Promise.resolve(MO);
    return gj(RM + "morning.json?" + Math.floor(Date.now() / 300000)).then(function(j){ if (j && j.changes){ MO = j; MOT = Date.now(); } return MO; }); }
  function fresh(M){ if (!M || !M.date) return false; return (kst() - new Date(M.date + "T00:00:00Z")) < 4 * 864e5; }

  /* ═════════ ④ 카드 5장 ═════════ */
  var PK = ["안정추구형", "위험중립형", "성장형"];
  function pIdx(){ var v = +(ls("mo19p") || 1); return v >= 0 && v <= 2 ? v : 1; }
  function acCard(c){
    var cls = c.dir === "up" ? "u" : c.dir === "hold" ? "h" : "d";
    return '<div class="m19a ' + cls + (c.small ? " sm" : "") + '"><b>' + e(c.name) + ' <i>' + e(c.sym) + '</i></b>' +
      (c.kr && c.kr !== "—" ? '<small>🇰🇷 ' + e(c.kr) + (c.pct ? ' · 지금 ' + c.pct + '%' : '') + '</small>' : (c.pct ? '<small>지금 ' + c.pct + '%</small>' : '')) +
      (c.chg ? '<em>' + e(c.chg) + '</em>' : c.dir === "avoid" ? '<em class="dd">새로 사지 않기</em>' : '') +
      '<p>' + e(c.why) + '</p>' + (c.cond ? '<p class="f"><b>틀리면</b> ' + e(c.cond) + '</p>' : '') +
      (c.hit && c.hit.n ? '<span class="ht ' + (c.hit.rate < 40 ? "bad" : c.hit.rate >= 60 ? "ok" : "") + '">이 칸 조언 ' + Math.round(c.hit.n * c.hit.rate / 100) + '/' + c.hit.n + ' 맞음' + (c.small ? ' → 작게' : '') + '</span>' : '') + '</div>'; }
  function deck(M){
    var C = M.changes || {}, A = M.actions || {}, F = M.flowmap || {}, P = (M.persona || {}).items || [], pi = pIdx(), p = P[pi] || {};
    var ttl = function(n, t, s){ return '<div class="m19k"><span>' + n + '/5</span>' + t + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
    var c1 = '<div class="m19c c1">' + ttl(1, "오늘의 결론", M.edition ? e(md(M.date) + " " + M.edition) : "") +
      '<p class="m19big">' + e((M.cards && M.cards[0] && M.cards[0].t) || "") + '</p>' +
      ((M.cards && M.cards[0] && M.cards[0].s) ? '<p class="m19so">→ ' + e(M.cards[0].s) + '</p>' : '') + '<p class="m19sw">옆으로 넘기면 달라진 것 · 돈의 흐름 · 할 일 ›</p></div>';
    var c2 = '<div class="m19c">' + ttl(2, "어제와 달라진 것", C.prev_date ? md(C.prev_date) + " 대비" : "") +
      '<p class="m19big">' + (C.none ? '<b class="ok">오늘은 바꿀 것 없음</b> — 어제 배분 그대로' : e(C.head)) + '</p>' +
      (C.items || []).map(function(i){ return '<div class="m19ch ' + i.lv + '"><b>' + e(i.ic + " " + i.t) + '</b><small>' + e(i.s) + (i.lv === "watch" ? " · 오늘 밤 바뀔 수 있음" : "") + '</small></div>'; }).join("") + '</div>';
    var mx = 1; (F["in"] || []).concat(F.out || []).forEach(function(r){ mx = Math.max(mx, Math.abs(r.rs5 || 0)); });
    var c3 = '<div class="m19c">' + ttl(3, "돈의 흐름 지도", md(F.asof) + " 종가") +
      '<div class="m19ct">' + (F.countries || []).map(function(c){ var k = c.label === "돈이 들어오는 곳" ? "in" : c.label === "빠지는 곳" ? "out" : "mid";
        return '<div class="' + k + '"><b>' + e(c.flag) + '</b><span class="' + cl(c.chg5) + '">' + sg(c.chg5) + '</span><small>' + e(c.name) + '</small></div>'; }).join("") + '</div>' +
      '<div class="m19dv">' + (F["in"] || []).slice(0, 4).concat((F.out || []).slice(0, 3)).map(function(r){ var w = Math.abs(r.rs5) / mx * 50;
        return '<div><span>' + (r.rs5 >= 0 ? "🔥 " : "🧊 ") + e(r.name) + '</span><i><s style="' + (r.rs5 >= 0 ? "left:50%;background:var(--up,#d6453d)" : "right:50%;background:var(--down,#2f6fdd)") + ';width:' + w.toFixed(1) + '%"></s></i><b class="' + cl(r.rs5) + '">' + (r.rs5 > 0 ? "+" : "") + r.rs5.toFixed(1) + '</b></div>'; }).join("") +
      '</div><p class="m19n">미국 섹터·테마 5일 S&amp;P500 대비(%p) · 🇰🇷 어제 업종: ' + (F.kr_in || []).slice(0, 2).map(function(x){ return e(x.name) + " " + sg(x.r1); }).join(" · ") + '</p></div>';
    var c4 = '<div class="m19c">' + ttl(4, "오늘 할 일", "") +
      '<div class="m19pp">' + P.map(function(x, i){ return '<button type="button" data-mo19p="' + i + '" class="' + (i === pi ? "on" : "") + '">' + e(x.ic + " " + x.k) + '</button>'; }).join("") + '</div>' +
      (p.k ? '<div class="m19bar">' + [["stock", "주식", "#d6453d"], ["bond", "채권", "#2f6fdd"], ["gold", "금", "#c99a2e"], ["cash", "현금", "#8a94a8"]].map(function(k){ return p[k[0]] > 0 ? '<i style="flex:' + p[k[0]] + ';background:' + k[2] + '">' + (p[k[0]] >= 12 ? k[1] + " " + p[k[0]] : "") + '</i>' : ''; }).join("") + '</div>' +
        '<p class="m19n">' + e(p.chg) + ' · ' + e(p.kr) + '</p>' : '') +
      '<div class="m19g"><p class="u">늘릴 것</p>' + ((A.up || []).map(acCard).join("") || '<p class="m19e">오늘은 없음</p>') +
      '<p class="d">줄일 · 피할 것</p>' + ((A.down || []).map(acCard).join("") || '<p class="m19e">오늘은 없음</p>') +
      '<p class="h">그대로 둘 것</p>' + (A.hold || []).slice(0, 2).map(acCard).join("") + '</div>' +
      '<button type="button" class="m19go" data-mo19go="diag">🩻 내 고객 포트에 대입해 보기 ›</button></div>';
    var OV = M.overnight || {}, T = (M.triggers || []).slice(0, 4);
    var c5 = '<div class="m19c">' + ttl(5, "오늘 장 준비", "") +
      T.map(function(t){ return '<div class="m19t' + (t.near ? " nr" : "") + '"><div><b>' + e(t.signal) + '</b><small>→ ' + e(t.claim) + '</small></div><i><s style="width:' + Math.round((t.fill || 0) * 100) + '%"></s></i><em>' + e(t.dist) + '</em></div>'; }).join("") +
      '<p class="m19s">밤사이 미국 → 오늘 한국</p>' + (OV.up || []).slice(0, 2).concat((OV.down || []).slice(0, 1)).map(function(x){
        return '<div class="m19o"><b>' + (x.r1 > 0 ? "🔥" : "🧊") + ' ' + e(x.name) + ' <span class="' + cl(x.r1) + '">' + sg(x.r1, 2) + '</span></b><small>' + (x.kr || []).slice(0, 3).map(function(k){ return e(k.name); }).join(" · ") + '</small></div>'; }).join("") +
      '<div class="m19tm">' + (OV.times || []).slice(0, 3).map(function(t){ return '<span><b>' + e(t.t) + '</b>' + e(t.what) + '</span>'; }).join("") + '</div></div>';
    var S = M.score || {}, SA = S.all || {}, CW = M.counter || {};
    var tail = '<details class="m19d"><summary>📊 우리 조언 성적표 <b>' + (SA.win || 0) + '/' + (SA.n || 0) + '</b> <small>5거래일 뒤 S&amp;P500 대비 · 대기 ' + (S.pending || 0) + '</small></summary>' +
      '<div class="m19sc">' + (S.by_list || []).map(function(v){ return '<span class="' + (v.rate >= 60 ? "ok" : v.rate < 40 ? "bad" : "") + '">' + e(v.name) + ' <b>' + v.win + '/' + v.n + '</b></span>'; }).join("") + '</div>' +
      '<p class="m19n">' + ((S.weak || []).length ? '⚠️ ' + e(S.weak.join(", ")) + ' 칸은 적중 40% 아래 — 이 칸 조언은 작게 · ' : '') + e(S.rule || "") + '</p></details>' +
      '<details class="m19d"><summary>🗣 우리가 틀렸다면 <small>가장 강한 반론 1개</small></summary><p class="m19cw">' + e(CW.claim || "") + '</p>' +
      (CW.watch ? '<p class="m19n">📏 가장 가까운 「틀렸다」 신호: <b>' + e(CW.watch.signal) + '</b> · 남은 거리 <b>' + e(CW.watch.dist) + '</b></p>' : '') + '</details>';
    return '<p class="m19h">🌅 오늘 아침 30초 <small>' + e(md(M.date)) + ' ' + e(M.edition || "") + ' · 옆으로 넘겨 보기</small></p>' +
      '<div class="m19w" id="m19w">' + c1 + c2 + c3 + c4 + c5 + '</div><div class="m19dot" id="m19dot">' + [0, 1, 2, 3, 4].map(function(i){ return '<i data-mo19d="' + i + '"' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join("") + '</div>' + tail;
  }
  function place(){
    var k = cur(), box = D.getElementById("mo19"), anchor = null, where = "after";
    if (k === "home"){ anchor = D.getElementById("ezhero"); }
    else if (k === "market"){ anchor = D.getElementById("live"); where = "before"; }
    if (!anchor || !MO || !fresh(MO)){ if (box && (!anchor || k !== box._k)) box.remove(); return; }
    if (!box){ box = D.createElement("section"); box.id = "mo19"; box.className = "card no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box._k = k;
    if (where === "after"){ if (anchor.nextElementSibling !== box) anchor.insertAdjacentElement("afterend", box); }
    else if (anchor.previousElementSibling !== box) anchor.insertAdjacentElement("beforebegin", box);
    var key = MO.at + "|" + pIdx();
    if (box._h === key) return; box._h = key;
    var sl = D.getElementById("m19w"), x = sl ? sl.scrollLeft : 0;
    box.innerHTML = deck(MO);
    var w = D.getElementById("m19w"); if (w){ w.scrollLeft = x; w.addEventListener("scroll", dots, {passive: true}); }
  }
  function dots(){ var w = D.getElementById("m19w"), d = D.getElementById("m19dot"); if (!w || !d) return;
    var i = Math.round(w.scrollLeft / Math.max(1, w.clientWidth * 0.88)); [].forEach.call(d.children, function(x, k){ x.classList.toggle("on", k === i); });
    if (i >= 1 && !dots.used){ dots.used = 1; try { window.__track && __track("mo19swipe"); } catch(x) {} } }

  /* ═════════ ⑦ 고객 포트 대입 (포트 진단 결과 아래) ═════════ */
  var SECMAP = {IGV: "IT", SMH: "IT", SKYY: "IT", CIBR: "IT", IGM: "IT", XLK: "IT", XLE: "에너지", XOP: "에너지", XLV: "헬스케어", IHI: "헬스케어", XBI: "헬스케어",
    XLF: "금융", KBE: "금융", KRE: "금융", IAI: "금융", KBWB: "금융", XLP: "필수소비재", XLY: "경기소비재", XRT: "경기소비재", GRID: "유틸리티", XLU: "유틸리티",
    XLI: "산업재", ITA: "산업재", PAVE: "산업재", COPX: "소재", XME: "소재", XLB: "소재", GDX: "소재", XLC: "통신·미디어", XLRE: "부동산"};
  function rx(R, M){
    var P = (M.persona || {}).items || [], pi = pIdx(), p = P[pi] || {}, A = M.actions || {}, out = [];
    var tot = R.tot || 0, eq = R.eq || 0, bond = 0, gold = 0;
    (R.cls || []).forEach(function(c){ if (c[0] === "채권·현금") bond = c[1]; if (c[0] === "금") gold = c[1]; });
    if (p.k){ var dlt = eq - p.stock;
      out.push(["주식 비중", "지금 " + Math.round(eq) + "% → " + p.k + " 기준 " + p.stock + "%" + (Math.abs(dlt) < 3 ? " — 거의 맞음" : " — " + (dlt > 0 ? "줄일" : "늘릴") + " 몫 약 " + won(tot * Math.abs(dlt) / 100) + " (" + Math.round(Math.abs(dlt)) + "%p)")]); }
    var kr = 0; (R.region || []).forEach(function(g){ if (g[0] === "한국") kr = g[1]; });
    var ks = (M.persona || {}).kospi_stock;
    if (kr >= 5 && ks != null && ks < 50) out.push(["한국 주식", "전체의 " + Math.round(kr) + "%(약 " + won(tot * kr / 100) + ") — 오늘 규칙은 코스피 주식 " + ks + "%(하락장). 한 번에 말고 반등 때 나눠 해외 ETF(TIGER 미국나스닥100 133690)로 옮길 후보"]);
    else if (kr >= 5) out.push(["한국 주식", "전체의 " + Math.round(kr) + "% — 오늘 규칙상 줄일 이유 없음"]);
    var sec = {}; (R.sec || []).forEach(function(s){ sec[s[0]] = s[1]; });
    (A.down || []).forEach(function(c){ var s = SECMAP[c.sym]; if (s && sec[s] >= 3) out.push(["줄이자 칸", s + " " + Math.round(sec[s]) + "% 보유 — 오늘 리포트는 " + c.name + " " + (c.dir === "avoid" ? "새로 사지 않기" : "줄이기") + " (" + (c.why || "").slice(0, 50) + ")"]); });
    (A.up || []).forEach(function(c){ var s = SECMAP[c.sym]; if (!s) return; var h = sec[s] || 0;
      out.push(["늘리자 칸", c.name + "(" + c.sym + ") — 고객 " + s + " " + Math.round(h) + "% · " + (h < 5 ? "비어 있음 → 작게 담을 후보 " + (c.kr && c.kr !== "—" ? c.kr : c.sym) : "이미 담겨 있음 → 더 늘릴 필요 적음") + (c.small ? " · ⚠️ 이 칸 조언 적중 낮음 → 작게" : "")]); });
    var buf = bond + gold, tb = p.k ? (p.bond || 0) + (p.gold || 0) + (p.cash || 0) : null;
    if (tb != null) out.push(["완충(채권·현금·금)", "지금 " + Math.round(buf) + "% → " + p.k + " 기준 " + tb + "%" + (gold < 1 && (p.gold || 0) > 0 ? " · 금 " + p.gold + "%(TIGER KRX금현물 0072R0) 없음" : "")]);
    return out;
  }
  function diagPaint(){
    if (cur() !== "diag") return;
    var out = D.getElementById("dgout"), R = window.__dgLast; if (!out || !R || !MO || !out.querySelector(".dg-pt")) return;
    var box = D.getElementById("dg19");
    var key = (R.tot || 0) + "|" + (R.n || 0) + "|" + pIdx() + "|" + MO.at;
    if (box && box._k === key && out.contains(box)) return;
    if (!box){ box = D.createElement("section"); box.id = "dg19"; box.className = "card hub-c no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box._k = key;
    var P = (MO.persona || {}).items || [], L = rx(R, MO);
    box.innerHTML = '<p class="hub-h">🌅 오늘 리포트 기준이면 <small>PB용 · ' + e(md(MO.date)) + ' 아침판 · 그림 한 장엔 안 들어감</small></p>' +
      '<div class="m19pp">' + P.map(function(x, i){ return '<button type="button" data-mo19p="' + i + '" class="' + (i === pIdx() ? "on" : "") + '">' + e(x.ic + " " + x.k) + '</button>'; }).join("") + '</div>' +
      '<ul class="dg19">' + L.map(function(x){ return '<li><b>' + e(x[0]) + '</b>' + e(x[1]) + '</li>'; }).join("") + '</ul>' +
      '<p class="m19n">💼 기본 포트를 성향대로 줄인 예시와 오늘 행동 카드에 견준 것 · 매수·매도 권유 아님 · 성향에 맞는 상품만(제안서 성향 규칙)</p>';
    out.appendChild(box);
  }

  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-mo19p],[data-mo19go],[data-mo19d]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.mo19p != null){ ls("mo19p", t.dataset.mo19p); var b = D.getElementById("mo19"); if (b) b._h = ""; var g = D.getElementById("dg19"); if (g) g._k = ""; tick(); return; }
    if (t.dataset.mo19go){ goTo(t.dataset.mo19go); return; }
    if (t.dataset.mo19d != null){ var w = D.getElementById("m19w"), c = w && w.children[+t.dataset.mo19d]; if (c) w.scrollTo({left: c.offsetLeft - w.offsetLeft, behavior: "smooth"}); }
  });

  var st = D.createElement("style");
  st.textContent =
    "#mo19{padding:14px 0 10px;overflow:hidden}#mo19 .m19h{margin:0 16px 8px;font-size:16px;font-weight:800;color:var(--text)}#mo19 .m19h small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".m19w{display:flex;align-items:flex-start;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 16px 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.m19w::-webkit-scrollbar{display:none}" +
    ".m19c{flex:0 0 88%;scroll-snap-align:center;border:1px solid var(--line);border-radius:18px;padding:14px 14px 12px;background:var(--panel);box-sizing:border-box;min-height:260px;word-break:keep-all}" +
    ".m19c.c1{background:linear-gradient(160deg,#1f2d4d,#2c4a86);color:#fff;border:0}.m19c.c1 .m19k,.m19c.c1 .m19k small{color:#c9d6ea}.m19c.c1 .m19so{color:#ffd27a}" +
    ".m19k{font-size:13px;font-weight:800;color:var(--sub);margin-bottom:8px}.m19k span{display:inline-block;font-size:11px;border:1px solid currentColor;border-radius:999px;padding:0 7px;margin-right:6px;opacity:.8}.m19k small{font-weight:500;margin-left:6px}" +
    ".m19big{font-size:19px;font-weight:800;line-height:1.42;margin:0 0 10px}.m19big .ok{color:#1f9d55}.m19so{font-size:15px;line-height:1.5;font-weight:700;margin:0}.m19sw{margin:14px 0 0;font-size:12.5px;opacity:.7}" +
    ".m19ch{border-radius:12px;padding:9px 11px;margin-bottom:7px;background:rgba(127,127,127,.08);border-left:4px solid #8a94a8}.m19ch.big{border-left-color:#d6453d;background:rgba(214,69,61,.08)}.m19ch.watch{border-left-color:#e3a21a;background:rgba(227,162,26,.1)}" +
    ".m19ch b{display:block;font-size:16px}.m19ch small{display:block;font-size:13px;color:var(--sub);margin-top:2px;line-height:1.4}" +
    ".m19ct{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px}.m19ct div{border-radius:10px;padding:6px 2px;text-align:center;background:rgba(127,127,127,.08)}.m19ct div.in{background:rgba(214,69,61,.12)}.m19ct div.out{background:rgba(47,111,221,.1)}" +
    ".m19ct b{display:block;font-size:18px}.m19ct span{display:block;font-size:13.5px;font-weight:800}.m19ct small{font-size:11.5px;color:var(--sub)}" +
    ".m19dv div{display:grid;grid-template-columns:104px 1fr 40px;gap:6px;align-items:center;font-size:13px;margin-bottom:4px}.m19dv span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.m19dv i{position:relative;height:10px;border-radius:5px;background:rgba(127,127,127,.12)}" +
    ".m19dv s{position:absolute;top:0;height:10px;border-radius:5px;text-decoration:none}.m19dv b{text-align:right;font-size:12.5px}" +
    "#mo19 .m19g>p.u{color:var(--up,#d6453d)}#mo19 .m19g>p.d{color:var(--down,#2f6fdd)}#mo19 b.u,#mo19 span.u{color:var(--up,#d6453d)}#mo19 b.d,#mo19 span.d{color:var(--down,#2f6fdd)}" +
    ".m19n{font-size:12.5px;color:var(--sub);line-height:1.45;margin:8px 0 0}.m19pp{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}.m19pp button{font:inherit;font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);padding:5px 10px;cursor:pointer}.m19pp button.on{background:#3182f6;border-color:#3182f6;color:#fff}" +
    ".m19bar{display:flex;height:22px;border-radius:7px;overflow:hidden}.m19bar i{display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;font-style:normal;white-space:nowrap}" +
    ".m19g>p{font-size:13px;font-weight:800;margin:12px 0 5px}.m19g>p.h{color:var(--sub)}.m19e{font-size:13px;color:var(--sub);font-weight:500!important}" +
    ".m19a{border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin-bottom:6px;border-left:4px solid #8a94a8}.m19a.u{border-left-color:#d6453d}.m19a.d{border-left-color:#2f6fdd}.m19a.sm{border-style:dashed;opacity:.85}" +
    ".m19a b{font-size:15px}.m19a b i{font-style:normal;font-size:11px;background:#1f2d4d;color:#fff;border-radius:5px;padding:1px 6px;margin-left:5px;vertical-align:2px}.m19a small{display:block;font-size:12px;color:var(--sub);margin-top:1px}" +
    ".m19a em{display:block;font-style:normal;font-size:13px;font-weight:800;color:#b07500;margin-top:2px}.m19a em.dd{color:var(--down,#2f6fdd)}.m19a p{font-size:13px;line-height:1.45;margin:3px 0 0}.m19a p.f{color:var(--sub)}.m19a p.f b{font-size:13px;color:var(--up,#d6453d)}" +
    ".m19a .ht{display:inline-block;font-size:11.5px;font-weight:800;border-radius:6px;padding:1px 7px;margin-top:5px;background:rgba(127,127,127,.12)}.m19a .ht.bad{background:rgba(214,69,61,.12);color:#d6453d}.m19a .ht.ok{background:rgba(31,157,85,.12);color:#1f9d55}" +
    ".m19go{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;padding:11px;border:0;border-radius:12px;background:#3182f6;color:#fff;margin-top:10px;cursor:pointer}" +
    ".m19t{display:grid;grid-template-columns:1fr 64px 52px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px dashed var(--line)}.m19t b{display:block;font-size:13.5px;line-height:1.35}.m19t small{font-size:12px;color:var(--sub)}" +
    ".m19t i{height:9px;border-radius:5px;background:rgba(127,127,127,.15);overflow:hidden}.m19t s{display:block;height:9px;background:#8a94a8;text-decoration:none}.m19t.nr s{background:#d6453d}.m19t em{font-style:normal;font-weight:800;font-size:13px;text-align:right}.m19t.nr em{color:#d6453d}" +
    ".m19s{font-size:13px;font-weight:800;margin:10px 0 4px}.m19o{padding:4px 0}.m19o b{font-size:14px}.m19o small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".m19tm{display:flex;flex-direction:column;gap:4px;margin-top:8px}.m19tm span{font-size:12.5px;line-height:1.4;background:rgba(127,127,127,.08);border-radius:8px;padding:5px 8px}.m19tm b{margin-right:6px}" +
    ".m19dot{display:flex;justify-content:center;gap:6px;margin:4px 0 6px}.m19dot i{width:7px;height:7px;border-radius:50%;background:var(--line);cursor:pointer}.m19dot i.on{background:#3182f6;width:18px;border-radius:4px}" +
    ".m19d{margin:4px 16px 0;border-top:1px solid var(--line);padding:9px 0 2px}.m19d summary{font-size:14.5px;font-weight:800;cursor:pointer;list-style:none}.m19d summary::-webkit-details-marker{display:none}.m19d summary small{font-size:12px;font-weight:500;color:var(--sub);margin-left:4px}" +
    ".m19sc{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.m19sc span{font-size:12.5px;border-radius:8px;padding:3px 8px;background:rgba(127,127,127,.1)}.m19sc span.bad{background:rgba(214,69,61,.12)}.m19sc span.ok{background:rgba(31,157,85,.12)}" +
    ".m19cw{font-size:14px;font-weight:700;line-height:1.5;margin:8px 0 0}" +
    ".dg19{list-style:none;margin:0;padding:0}.dg19 li{font-size:14px;line-height:1.5;padding:7px 0;border-bottom:1px solid var(--line)}.dg19 li b{display:block;font-size:12.5px;color:var(--sub)}";
  D.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; [place, diagPaint].forEach(function(f){ try { f(); } catch(x){ console.warn("ux1119", x); } }); }
  function soon(){ if (!q) q = setTimeout(tick, 200); }
  function start(){ load().then(tick); try { new MutationObserver(soon).observe(D.body, {childList: true, subtree: true}); } catch(x) {} setInterval(function(){ load().then(tick); }, 60000); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  window.__ux1119 = {load: load, deck: deck, rx: rx};   // 점검용
})();
