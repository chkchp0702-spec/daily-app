/* 📦 app.b07.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 7/7 (ux1109.js … ux1118.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
/* ======== ux1109.js ======== */
/* 🧊 11/09 사용자 「냉정하고 객관적으로 효용성·편리성 판단해서 개선 — 누구나 쉽게 효과적으로」 → 아이디어 17 「다 반영해」
   이 파일: ① 뭐 살까? 첫 카드 = 「지금 이렇게 담으면 돼요」(열어 둠) → 성적은 두 번째
           ② 성적 카드 맨 위 정직 한 줄 (S&P보다 몇 %p · 끌어내린 칸 · 최근 바꾼 것) — 쉬운·전체 화면 모두
           ⑥ 쉬운 화면: 탭당 카드 5개까지(첫 카드는 열어 둠) · 나머지는 「＋ n개 더 보기」 한 줄 — 전체 메뉴는 그대로
           ⑦ 제안서 머리의 「AI 안 씀 · 0원」 꼬리표 숨김(동료는 뜻 모름)
           ⑧ 쉬운 화면 머리 아이콘 5→2 (조이·검색만 · ★·⚙·📨 은 🙋 뭐 보지? 안으로)
           ⑮ 쉬운 화면: 어려운 말이 처음 나올 때 점선 밑줄 → 누르면 조이 한 줄
   (③④⑤⑩⑫⑬⑯ 는 ux1105c.js 첫 화면 · ⑨ ux1015b.js · ⑪ home2.js · ⑭ gsearch.js · ⑰ onepage.js)
   원칙: 지우지 않음 — 숨기기·옮기기·이름 바꾸기만. 숫자는 자료 그대로. */
(function(){
  var D = document.documentElement;
  function EZ(){ return D.getAttribute("data-ez") === "easy"; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pp(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1); }
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var HJ = null, HT = 0;
  function homeJ(){
    if (HJ && Date.now() - HT < 300000) return Promise.resolve(HJ);
    if (!window.getJSON) return Promise.resolve(null);
    return getJSON(RM + "home.json?" + Math.floor(Date.now() / 300000), {ttl: 300000}).then(function(j){ HJ = j; HT = Date.now(); return j; }).catch(function(){ return HJ; });
  }

  /* ── ① 뭐 살까? 순서 + 열어 두기 (쉬운 화면) ── */
  function portOrder(){
    if (cur() !== "port" || !EZ()) return;
    var body = document.getElementById("pobody"), fol = document.getElementById("pofollow"), win = body && body.querySelector(":scope > .po-win");
    if (!body || !fol || fol.parentNode !== body) return;
    var ref = win || document.getElementById("posum"); if (!ref) return;
    if (fol.nextElementSibling !== ref){ body.insertBefore(fol, ref); }
    if (!fol.dataset.ez1){ fol.dataset.ez1 = "1"; fol.classList.add("open"); }
  }

  /* ── ② 정직 한 줄 ── */
  function honest(){
    if (cur() !== "port") return;
    var sum = document.getElementById("posum"); if (!sum || sum.querySelector(".ez-hon")) return;
    if (sum.dataset.ezh === "wait") return; sum.dataset.ezh = "wait";
    homeJ().then(function(H){
      sum.dataset.ezh = "";
      var P = H && H.port; if (!P || P.base == null || P.spy == null || sum.querySelector(".ez-hon") || !document.body.contains(sum)) return;
      var gap = P.base - P.spy, weak = (P.weak || []).map(function(x){ return String(x).replace(/^🧭\s*/, "").replace(/ 코어$/, ""); }).slice(0, 3);
      var c = P.change || {}, ch = c.why ? String(c.why).split(" — ")[0].split(" · ")[0].replace(/^🧭\s*/, "").replace(/\(.*?\)/g, "").trim() : "";
      var d = document.createElement("div"); d.className = "ez-hon " + (gap >= 0 ? "ok" : "bad");
      d.innerHTML = '<b>' + (gap >= 0 ? "📈 S&P500보다 " + pp(gap) + "%p 앞" : "📉 S&P500보다 " + pp(gap) + "%p 뒤") + '</b>' +
        (gap < 0 && weak.length ? '<span>끌어내린 칸: ' + e(weak.join(" · ")) + '</span>' : '') +
        (ch ? '<span>최근 바꾼 것: ' + e(String(c.date || "").slice(5).replace("-", "/")) + ' ' + e(ch.slice(0, 48)) + '</span>' : '') +
        '<button type="button" class="ez-hon-go">왜? 칸별 보기 ›</button>';
      var sh = sum.querySelector(".po-sh"); if (sh) sh.insertAdjacentElement("afterend", d); else sum.insertBefore(d, sum.firstChild);
      d.querySelector(".ez-hon-go").onclick = function(ev){ ev.stopPropagation(); var f = document.getElementById("poct"); if (!f) return;
        f.classList.remove("ez-cap-hid"); f.classList.add("open"); f.scrollIntoView({behavior: "smooth", block: "start"}); };
    });
  }

  /* ── ⑥ 쉬운 화면: 카드 5개 상한 · 첫 카드 열기 ── */
  var NOCAP = {home: 1, divc: 1, prop: 1, luck: 1, saju: 1, tarot: 1, lotto: 1, onepager: 1, alarm: 1, idea: 1};
  var CAP = 5, MORE = {};
  try { MORE = JSON.parse(sessionStorage.getItem("ezcapmore") || "{}") || {}; } catch(x) {}
  function blocks(root){
    var sel = ".card, .fold, details.card, #podz, #pohero";
    return [].filter.call(root.querySelectorAll(sel), function(c){
      if (c.classList.contains("hero") || c.id === "ezcapb" || c.offsetParent === null && !c.classList.contains("ez-cap-hid")) return false;
      var p = c.parentElement && c.parentElement.closest(sel + ", .fold-b, #sheet, .xs-list, #posum"); return !p || !root.contains(p);
    });
  }
  function openFirst(c){
    if (c.dataset.ezf) return; c.dataset.ezf = "1";
    if (c.classList.contains("fold")) { c.classList.add("open"); return; }
    if (c.classList.contains("cz-on")){ var h = c.querySelector(":scope > .cz-h"); if (h) h.click(); else c.classList.remove("cz-on"); }
  }
  function cap(){
    var t = cur(), main = document.getElementById("main"), btn = document.getElementById("ezcapb");
    if (!main || !EZ() || NOCAP[t] || MORE[t]){
      if (btn) btn.remove(); [].forEach.call(document.querySelectorAll(".ez-cap-hid"), function(x){ x.classList.remove("ez-cap-hid"); }); return;
    }
    var L = blocks(main); if (L.length <= CAP + 1){ if (btn) btn.remove(); [].forEach.call(document.querySelectorAll(".ez-cap-hid"), function(x){ x.classList.remove("ez-cap-hid"); }); return; }
    // 포트 탭은 성적 덩어리(#posum)가 카드 모양이 아니라 목록에 안 잡힘 → 「담으면」 + 성적 + 3장
    var first = L[0]; if (first && main.dataset.ezft !== t){ main.dataset.ezft = t; openFirst(first); }
    var show = t === "port" ? CAP - 1 : CAP;
    L.forEach(function(c, i){ c.classList.toggle("ez-cap-hid", i >= show); });
    var last = L[show - 1], n = L.length - show;
    if (!btn){ btn = document.createElement("button"); btn.type = "button"; btn.id = "ezcapb";
      btn.onclick = function(){ MORE[cur()] = 1; try { sessionStorage.setItem("ezcapmore", JSON.stringify(MORE)); } catch(x) {} cap(); }; }
    btn.innerHTML = '＋ ' + n + '개 더 보기 <small>' + e(L.slice(show, show + 3).map(function(c){ return title(c); }).filter(Boolean).join(" · ")) + (n > 3 ? " …" : "") + '</small>';
    if (last && last.nextElementSibling !== btn) last.insertAdjacentElement("afterend", btn);
    for (var x = btn.nextElementSibling; x; x = x.nextElementSibling){ if (x.classList.contains("sec")) x.classList.add("ez-cap-hid"); }   // 카드 없이 남는 제목 줄도 같이
  }
  function title(c){
    var h = c.querySelector(":scope > .cz-h span, :scope > .sec, :scope > summary, :scope > h3, :scope > .fold-h");
    var t = (h ? h.textContent : (c.innerText || "").split("\n")[0]) || "";
    t = t.replace(/펼치기 ▾|접기 ▴/g, "").replace(/\s+/g, " ").trim();
    return t.length > 14 ? t.slice(0, 13) + "…" : t;
  }

  /* ── ⑦ 제안서 꼬리표 ── */
  function propChip(){
    if (cur() !== "prop") return;
    [].forEach.call(document.querySelectorAll("#main > .hero .chip, #main > .hero span"), function(x){ if (/AI 안 씀/.test(x.textContent)) x.style.display = "none"; });
  }

  /* ── ⑮ 어려운 말 점선 밑줄 (쉬운 화면) ── */
  var TERMS = [
    ["하락장", "고점보다 20% 넘게 빠진 장 (종가 기준). 이때 얼마나 들고 있을지는 🔁 닮은 장 규칙이 시장마다 정함 (예: 코스피는 50일선 넘으면 사기 · 코스닥은 절반 들고 감)."],
    ["닮은 장 규칙", "지금 장과 숫자가 닮았던 과거 12번을 찾아, 그때 2년 뒤 가장 나았던 방식을 지금 규칙으로 씀 (11/12부터)."],
    ["조정", "고점보다 10~20% 빠진 상태. 하락장의 앞 단계 — 현금을 조금(10%) 늘림."],
    ["바닥 신호", "하락장이 끝나 가는지 보는 4가지 체크 (저점 다지기·20일선 회복·공포 진정·외국인 순매수). 켜진 개수만큼 다시 담음."],
    ["장기 평균선", "최근 200거래일(약 10개월) 평균 가격. 지수가 그 위면 큰 흐름이 위."],
    ["200일선", "최근 200거래일(약 10개월) 평균 가격. 지수가 그 위면 큰 흐름이 위."],
    ["20일선", "최근 20거래일(약 한 달) 평균 가격. 짧은 흐름을 볼 때 씀."],
    ["손절", "정해 둔 만큼(공격 포트는 −5%) 빠지면 더 잃기 전에 파는 것."],
    ["%p", "퍼센트포인트 — 두 수익률의 차이. 내 −8%와 시장 −4%의 차이는 4%p."],
    ["S&P500", "미국 대표 500개 회사 지수. 앱의 「시장」 기준선."],
    ["나스닥100", "미국 기술주 중심 100개 회사 지수."],
    ["선물", "앞으로 사고팔 값을 미리 정하는 거래. 밤사이 미국 선물로 다음 날 분위기를 미리 봄."],
    ["VIX", "미국 주식의 「공포 지수」. 20 아래면 차분, 30 넘으면 겁먹은 장."],
    ["ELS", "주가가 정해진 선 아래로 크게 안 빠지면 약속한 이자를 주는 상품. 낙인선을 깨면 손실 날 수 있음."],
    ["낙인", "ELS에서 기초자산이 이 선 아래로 떨어지면 원금 손실 가능성이 생기는 선."],
    ["헤알", "브라질 돈. 브라질 국채는 금리가 높지만 헤알 값이 떨어지면 원화 수익이 줄어듦."],
    ["듀레이션", "채권 값이 금리에 얼마나 민감한지. 클수록 금리 내릴 때 더 많이 오름."],
    ["리츠", "빌딩·물류센터 등에 투자해 임대료를 나눠 주는 상품."],
    ["반대매매", "빌린 돈으로 산 주식이 담보보다 떨어지면 증권사가 강제로 파는 것. 급락을 키움."],
    ["순매수", "산 금액에서 판 금액을 뺀 것. 플러스면 더 많이 산 것."],
    ["배분표", "시황리포트가 매일 정하는 자산별 비중표 (주식·금·현금 몇 %)."],
    ["공격 포트", "기본 포트에 성과가 확인된 신호(큰손·컵·갭) 종목을 10~20% 섞어 시장을 이기려는 포트."],
    ["집중 포트", "오르는 장이라고 볼 때만 S&P·나스닥 뼈대 + 공격 종목에 몰아서 담는 포트."],
    ["기본 포트", "시황리포트 자산배분표대로 담은 포트. 주식 칸은 S&P500 반 + 나스닥 반이 뼈대."],
    ["큰손", "기관·유명 투자자 40곳. 분기마다 공시(13F)하는 보유 종목 변화를 따라감."],
    ["컵", "컵앤핸들 차트 — 바닥을 둥글게 다진 뒤 전 고점을 뚫으려는 모양."],
    ["심의필", "고객에게 보내는 자료가 회사 준법 심의를 통과했다는 번호."]
  ];
  var TRE = new RegExp("(" + TERMS.map(function(t){ return t[0].replace(/[.*+?^${}()|[\]\\%&]/g, "\\$&"); }).sort(function(a, b){ return b.length - a.length; }).join("|") + ")");
  var TDEF = {}; TERMS.forEach(function(t){ TDEF[t[0]] = t[1]; });
  var USED = {}, UTAB = "", SCAN = 0;
  var SKIP = "button,a,input,textarea,select,svg,canvas,script,style,summary,.cz-h,.fold-h,.sec,.ez-term,#bnav,header,.ezw-s,.ez-nums,.gs-box,#ezsheet,#eztour,.po-sb,.po-sbl,code,pre,.chip,label";
  function terms(){
    if (!EZ()) return;
    var t = cur(), main = document.getElementById("main"); if (!main || t === "luck" || t === "saju" || t === "tarot" || t === "lotto") return;
    if (UTAB !== t){ UTAB = t; USED = {}; [].forEach.call(main.querySelectorAll(".ez-term"), function(u){ USED[u.dataset.t] = 1; }); }
    var w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {acceptNode: function(n){
      if (!n.nodeValue || n.nodeValue.length < 2 || n.__ezt) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement; if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
      if (p.offsetParent === null) return NodeFilter.FILTER_REJECT;   // 접힌 칸은 펼칠 때
      return NodeFilter.FILTER_ACCEPT; }}), n, k = 0, todo = [];
    while ((n = w.nextNode()) && k++ < 2500){ n.__ezt = 1; var m = TRE.exec(n.nodeValue); if (m && !USED[m[1]]){ USED[m[1]] = 1; todo.push([n, m]); } }
    todo.forEach(function(x){
      var n2 = x[0], m2 = x[1], i = m2.index, s = n2.nodeValue;
      var u = document.createElement("u"); u.className = "ez-term"; u.dataset.t = m2[1]; u.textContent = m2[1];
      var after = document.createTextNode(s.slice(i + m2[1].length)); after.__ezt = 1;
      n2.nodeValue = s.slice(0, i); n2.parentNode.insertBefore(u, n2.nextSibling); u.parentNode.insertBefore(after, u.nextSibling);
    });
  }
  document.addEventListener("click", function(ev){
    var u = ev.target.closest && ev.target.closest(".ez-term"); if (!u) return;
    ev.preventDefault(); ev.stopPropagation();
    var d = TDEF[u.dataset.t]; if (!d) return;
    if (window.gdSay) gdSay("📖 " + u.dataset.t, [d]); else alert(d);
  }, true);

  /* ── ⑧ 머리 아이콘 다이어트 — ★·⚙·📨 을 🙋 안으로 (시트가 열릴 때 줄 하나 덧붙임) ── */
  function sheetRow(){
    var s = document.querySelector("#ezsheet .ezs-in"); if (!s || s.querySelector(".ezs-tools") || !EZ()) return;
    var r = document.createElement("div"); r.className = "ezs-tools";
    r.innerHTML = [["wlbtn", "★", "관심종목"], ["opbtn", "📨", "화면 한 장"], ["uibtn", "⚙", "보기 설정"]].map(function(x){ return '<button type="button" data-tool="' + x[0] + '"><span>' + x[1] + '</span>' + x[2] + '</button>'; }).join("");
    var mode = s.querySelector(".ezs-mode"); s.insertBefore(r, mode || null);
    r.onclick = function(ev){ var b = ev.target.closest("[data-tool]"); if (!b) return; var k = b.dataset.tool, sh = document.getElementById("ezsheet"); if (sh) sh.remove();
      if (k === "@role"){ if (window.__ezRole) __ezRole(true); return; }
      var o = document.getElementById(k); if (o) o.click(); };
  }

  /* ── 공통 ── */
  var q = 0, lastTab = "";
  function tick(){ q = 0;
    var t = cur(); if (t !== lastTab){ lastTab = t; }
    try { portOrder(); } catch(x) {}
    try { honest(); } catch(x) {}
    try { cap(); } catch(x) { console.warn("ez cap", x); }
    try { propChip(); } catch(x) {}
    try { sheetRow(); } catch(x) {}
    clearTimeout(SCAN); SCAN = setTimeout(function(){ try { terms(); } catch(x) { console.warn("ez terms", x); } }, 700);
  }
  function soon(){ if (!q) q = setTimeout(tick, 250); }
  function start(){ tick(); try { new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var tg = ms[i].target; if (tg.id === "ezcapb" || (tg.closest && tg.closest("#ezcapb"))) continue; soon(); return; } }).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
    document.addEventListener("click", function(){ setTimeout(soon, 120); }, true); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  var R = "html[data-ez=easy]", st = document.createElement("style");
  st.textContent =
    R + " #wlbtn," + R + " #opbtn," + R + " #uibtn," + R + " #stamp{display:none!important}" +
    ".ez-cap-hid{display:none!important}" +
    "#ezcapb{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;color:var(--text);background:var(--panel);border:1px dashed var(--line);border-radius:16px;padding:12px;margin:4px 0 14px;cursor:pointer}#ezcapb small{display:block;font-weight:500;font-size:12.5px!important;color:var(--sub);margin-top:2px}" +
    ".ez-hon{margin:6px 0 8px;padding:9px 11px;border-radius:12px;font-size:13.5px;line-height:1.45}.ez-hon.bad{background:rgba(49,130,246,.09)}.ez-hon.ok{background:rgba(240,68,82,.08)}" +
    ".ez-hon b{display:block;font-size:14.5px}.ez-hon span{display:block;color:var(--sub);word-break:keep-all}.ez-hon-go{margin-top:4px;font:inherit;font-size:13px;font-weight:700;color:#3182f6;background:none;border:0;padding:0;cursor:pointer}" +
    "u.ez-term{text-decoration:none;border-bottom:1.5px dotted currentColor;cursor:help}" +
    ".ezs-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.ezs-tools button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:12.5px;font-weight:700;color:var(--sub);background:none;border:1px solid var(--line);border-radius:12px;padding:8px 2px;cursor:pointer}.ezs-tools span{font-size:18px}";
  document.head.appendChild(st);
})();
;
/* ======== ux1109b.js ======== */
/* 🌱 11/09 A11/9-1 (+ 같은 날 오후: 시장별 다시 사기 규칙 — 머리는 그 규칙 단계 기준, 규칙에 안 쓰는 신호는 「참고」) 「신호가 켜지면 — 바닥 신호 4개의 과거 성적표」 (사용자 「다 진행해」)
   bear.json 시장마다 hist(src/bear_gate.py --bt → market/bear_sig_bt.json, 2000년부터 과거 🐻 하락장마다)를
   🐻 하락장 계기판 체크리스트(오늘 홈 · 쉬운 화면 「지금 규칙」 펼침)에 붙인다.
   ─ 머리: 신호 2·3·4개가 처음 켜진 날 → 6개월 뒤 코스피가 올라 있던 때 / 내려 있던 때 · 그날 뒤 바닥이 더 남아 있던 때 (「n번 중 m번」으로만)
   ─ 신호 줄 밑: 바닥 뒤 보통 며칠 · 바닥보다 몇 % 위에서 켜짐 · 「켜졌다가 더 빠진 적」은 누르면
   ─ 오늘 켜진 신호는 「🟢 켜짐」 · 이번 하락장에서 켜졌다 꺼진 횟수 한 줄
   숫자는 자료 그대로 · 평균·확률 % 안 씀 · 매수 권유 문구 없음 · 계산은 만드는 쪽(이 파일은 그리기만) */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pc(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(Math.round(v)) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  var NUM = ["①", "②", "③", "④"];

  // 🌱 11/09 오후 시장별 다시 사기 규칙(사용자 「네 추천대로」): 머리는 「그 규칙의 단계에 처음 닿은 날」 뒤 6개월
  function stageLine(s, nm, merged){
    if (!s) return "";
    var lab = merged ? "①+④(+② 대개 같은 날) 켜져 다시 산 날" : s.lv === "out" ? "하락장 판정이 풀려 다시 산 날" : s.lv === "10" ? "① 저점 다지기 + ④ 50일선 위 → 현금 10%" : "② 20일선까지 → 현금 0%";
    if (!s.hit) return '<li><b>' + e(lab) + '</b> — 과거 하락장 ' + s.eps + '번 안에선 닿은 적 없음</li>';
    var r6n = (s.pos6 || 0) + (s.neg6 || 0);
    return '<li><b>' + e(lab) + '</b> → 6개월 뒤 ' + e(nm) + ' 올라 있던 때 <b class="bs-u">' + s.pos6 + '번</b> · 내려 있던 때 <b class="bs-d">' + s.neg6 + '번</b>' +
      (r6n < s.hit ? ' <small>(' + (s.hit - r6n) + '번은 6개월이 아직 안 지남)</small>' : '') +
      '<br><small>보통 바닥 ' + Math.round(s.after) + '거래일 뒤 · 바닥보다 ' + pc(s.up) + ' 위에서 · 그 뒤 바닥이 더 남아 있던 때 ' + s.early + '번' + (s.worst_more ? ' (가장 깊게 ' + e(s.worst_more.y) + '년 ' + pc(s.worst_more.more) + ' 더)' : '') + '</small></li>';
  }

  // 체크리스트 한 줄 밑에 붙는 과거 한 줄 (k = 0~3)
  window.__bearSigLine = function(m, k){
    var h = m && m.hist, s = h && h.sig && h.sig[k], c = m && m.checks && m.checks[k]; if (!s) return "";
    var fresh = (m.fresh || []).indexOf(k) >= 0, on = c && c.on, ref = c && c.use === false;
    var main = !s.on ? '과거 하락장 ' + s.eps + '번: 바닥 뒤엔 한 번도 안 켜짐'
      : '과거 ' + s.eps + '번 중 ' + s.on + '번 · 보통 바닥 <b>' + Math.round(s.after) + '거래일</b> 뒤 · 바닥보다 <b>' + pc(s.up) + '</b> 위에서 켜짐';
    var fk = s.fake_eps ? '<details class="bs-f"><summary>켜졌다가 더 빠진 적 ' + s.eps + '번 중 ' + s.fake_eps + '번</summary><p>하락장 ' + s.fake_eps + '번에서 모두 ' + s.fake_n + '회 켜졌다가, 그 뒤 더 낮은 바닥이 나왔어요' +
      (s.fake_worst ? ' · 가장 깊게 ' + e(s.fake_worst.y) + '년 켜진 뒤 ' + pc(s.fake_worst.more) + ' 더 빠짐' : '') + '.' + (k === 3 && h.note4 ? ' ' + e(h.note4) + '.' : '') + '</p></details>'
      : (s.on ? '<small class="bs-ok">켜졌다가 더 빠진 적 없음</small>' : '');
    return '<div class="bs-l' + (on && !ref ? " on" : "") + '">' + (on && !ref ? '<b class="bs-on">🟢 ' + (fresh ? "오늘 " : "") + '켜짐</b> · ' : '') + '📜 ' + main + fk + '</div>';
  };

  // 체크리스트 위에 붙는 머리 (그 시장 다시 사기 규칙의 단계에 처음 닿은 날 뒤 6개월)
  window.__bearSigHead = function(m){
    var h = m && m.hist; if (!h || !h.stages || !h.stages.length) return "";
    var nm = m.name || "", S = h.stages, eps = S[0].eps, F_ = h.rule !== "E", OFF_ = h.rule === "OFF" || !!m.analog;   // 🔁 11/12 닮은 장 규칙이 정하면 이 과거 기록은 예전 규칙 참고
    var merged = !F_ && S.length === 2 && S[1].same_prev === S[1].hit && S[0].hit === S[1].hit;
    var now = h.now && h.now.fake ? h.now.fake.map(function(n, i){ return n && (!m.checks || !m.checks[i] || m.checks[i].use !== false) ? NUM[i] + ' ' + n + '회' : ""; }).filter(Boolean) : [];
    return '<div class="bs-h"><div class="bs-ht">📜 ' + (OFF_ ? '참고 — ' : '이 규칙대로였다면 — ') + '과거 ' + e(nm) + ' 하락장 ' + (eps || "") + '번 <small>' + e(String(h.from || "").slice(0, 4)) + '년부터 · 종가</small></div><ul class="bs-ul">' +
      (merged ? stageLine(S[1], nm, true) : S.map(function(s){ return stageLine(s, nm); }).join("")) + '</ul>' +
      (h.now && !F_ ? '<p class="bs-now">이번 하락장(' + md(h.now.in) + '부터 ' + h.now.len + '거래일): ' + (now.length ? '켜졌다가 도로 꺼진 조건 ' + now.join(" · ") : '아직 켜졌다 꺼진 조건 없음') + '</p>' : '') +
      (m.analog ? '<p class="bs-now">지금은 🔁 닮은 장 규칙(' + e(m.analog.rule) + ')이 정해요 — 위 기록은 예전 규칙 참고예요</p>' : OFF_ ? '<p class="bs-now">이 시장은 현금 규칙을 꺼 뒀어요 — 위 줄은 「판정이 풀린 날」 기준 참고예요</p>' : F_ ? '<p class="bs-now">이 시장은 바닥 신호로 미리 다시 사지 않아요 — 늦게 사는 대신 「바닥이 더 남았는데 산」 일이 없어요</p>' : '') +
      '<p class="bs-n">하락장 수가 적어 「몇 번 중 몇 번」으로만 봐요 · 과거일 뿐 앞날 보장 아님 · 사라·팔라는 뜻 아님' + (h.note4 ? ' · ' + e(h.note4) : '') + '</p></div>';
  };

  var css = document.createElement("style");
  css.textContent =
    ".bs-h{margin:8px 0 6px;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08));box-shadow:inset 0 0 0 1px var(--line,rgba(127,127,127,.25))}" +
    ".bs-ht{font-size:14px;font-weight:900}.bs-ht small{font-size:12px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".bs-h ul{margin:6px 0 4px;padding-left:16px;font-size:13.5px;line-height:1.55;word-break:keep-all}.bs-h li{margin:3px 0}.bs-h li small{color:var(--sub);font-size:12.5px}" +
    ".bs-u{color:var(--up)}.bs-d{color:var(--down)}" +
    ".bs-now{margin:4px 0 0;font-size:13px;font-weight:700;word-break:keep-all}.bs-n{margin:4px 0 0;font-size:12px;color:var(--sub);line-height:1.5;word-break:keep-all}" +
    ".bs-l{display:block;width:100%;margin:3px 0 2px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all;font-weight:500}.bs-l b{color:var(--text)}.bs-l.on{color:var(--text)}.bs-on{color:#1f9d55!important}" +
    ".bs-f{margin-top:2px}.bs-f summary{cursor:pointer;list-style:none;color:var(--acc,#3182f6);font-weight:700}.bs-f summary::-webkit-details-marker{display:none}.bs-f p{margin:3px 0 0}.bs-ok{display:block;color:var(--sub)}" +
    ".bg-ck li .bs-l{grid-column:2}.bg-ck li .bs-l b{color:var(--text);font-weight:800}.bg-ck li .bs-l b.bs-on{color:#1f9d55}.bg-ck li .bs-l small{font-size:12.5px}" +
    ".ez-rule li .bs-l{margin-left:22px;width:auto}.ez-rule li .bs-l small{margin-left:0!important;display:block}.ez-rule .bs-h ul.bs-ul{list-style:disc;padding-left:16px;margin:6px 0 4px}.ez-rule .bs-h li{font-size:13.5px}.ez-rule .bs-h li small{display:inline;margin-left:0}.ez-rule .bs-h p{margin:4px 0 0}" +
    ".bs-h ul.bs-ul{list-style:disc}.ez-ref,.bg-ref{font-style:normal;font-size:11px;font-weight:700;color:var(--sub);border:1px solid var(--line);border-radius:6px;padding:0 4px;margin-left:4px}";
  document.head.appendChild(css);
})();
;
/* ======== ux1110.js ======== */
/* 📨 11/10 A11/10-1 「이번 하락장 반등 날 n번, 그 뒤엔」 — 반등 날에만 뜨는 기록 카드 (사용자 「네 추천 진행시켜」)
   코스피가 🐻 하락장이고 오늘 +3% 넘게 오른 날에만:
   ─ 🔰 쉬운 첫 화면 「그래서 오늘은」 밑 · 전체 메뉴 🏠 🛡 결론 카드 밑(계기판 위) · 📨 고객 한 장(시장) 한 줄
   ─ 「7/8 하락장 시작 뒤 +3% 넘게 오른 날 n번 — 그 뒤 20거래일 안에 그날까지 저점을 다시 깬 때 m번 · 안 깬 때 k번 · 미정 j번」 + 이번 하락장만의 점 띠
   ─ n < 3 이면 안 띄움 · 과거 하락장 겹치기 없음 · 확률 % 없음 · 「규칙은 그대로, 이건 기록」
   계산은 만드는 쪽(market-strategy-report src/bear_gate.py rebounds() → bear.json 코스피 칸 rebounds) — 이 파일은 그리기만 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function sg(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }

  // bear.json(전체) 또는 코스피 칸 → 오늘 보여 줄 정보 (없으면 null)
  function info(B, chg){
    var m = B && B.markets ? B.markets.filter(function(x){ return x.key === "kospi"; })[0] : B;
    var R = m && m.rebounds;
    if (!m || m.state !== "🐻" || !R || !(R.n >= (R.min || 3))) return null;
    chg = chg == null ? null : +String(chg).replace("−", "-");
    if (chg == null || isNaN(chg) || chg < (R.up || 3)) return null;
    var k = kst(), wd = k.getUTCDay(), hm = k.getUTCHours() * 60 + k.getUTCMinutes();
    if (wd === 0 || wd === 6 || hm < 9 * 60) return null;     // 장 열기 전엔 「오늘」 등락이 아님
    var td = today(), pts = R.pts || [], inPts = pts.some(function(p){ return p.d === td; });
    var last = pts[pts.length - 1];
    return {m: m, R: R, chg: chg, td: td, inPts: inPts, last: last};
  }

  function lastLine(p){
    if (!p) return "";
    var t = "가장 최근 " + md(p.d) + " " + sg(p.r1) + " → ";
    if (p.out === "broke") t += p.bd + "거래일 뒤 저점 다시 깸";
    else if (p.out === "held") t += "20거래일 동안 안 깸" + (p.r20 != null ? " (20일 뒤 " + sg(p.r20) + ")" : "");
    else t += "아직 " + p.left + "거래일 남음 · 미정";
    return t;
  }

  // 이번 하락장만의 점 띠 (날짜 비례 · 안 깸 = 빨강 · 다시 깸 = 파랑 · 미정 = 회색 · 오늘 = 빈 동그라미)
  function strip(I){
    var R = I.R, t0 = Date.parse(R.from), t1 = Date.parse(I.td), W = 300, L = 8, Rr = 292;
    if (!(t1 > t0)) return "";
    var x = function(d){ return L + (Date.parse(d) - t0) / (t1 - t0) * (Rr - L); };
    var col = {held: "var(--up,#e66767)", broke: "var(--down,#3987e5)", open: "var(--dim,#8a93a5)"};
    var dots = (R.pts || []).map(function(p){ return '<circle cx="' + x(p.d).toFixed(1) + '" cy="14" r="5" fill="' + col[p.out] + '"><title>' + e(md(p.d) + " " + sg(p.r1)) + '</title></circle>'; }).join("");
    var now = I.inPts ? "" : '<circle cx="' + Rr + '" cy="14" r="5" fill="none" stroke="var(--text,#e8ecf4)" stroke-width="1.6"/>';
    return '<svg class="rbx-sv" viewBox="0 0 ' + W + ' 28" preserveAspectRatio="none" aria-hidden="true"><line x1="' + L + '" y1="14" x2="' + Rr + '" y2="14" stroke="var(--line,rgba(127,127,127,.35))" stroke-width="1.5"/>' + dots + now + '</svg>' +
      '<div class="rbx-ax"><span>' + e(md(R.from)) + ' 하락장 시작</span><span>오늘</span></div>' +
      '<div class="rbx-lg"><i style="background:var(--up,#e66767)"></i>안 깸 <i style="background:var(--down,#3987e5)"></i>다시 깸' + (R.open ? ' <i style="background:var(--dim,#8a93a5)"></i>미정' : '') + (I.inPts ? '' : ' <i class="o"></i>오늘') + '</div>';
  }

  function main(I){
    var R = I.R;
    return md(R.from) + " 하락장 시작 뒤 <b>+" + (R.up || 3) + "% 넘게 오른 날 " + R.n + "번</b> — 그 뒤 " + (R.nd || 20) + "거래일 안에 그날까지의 저점을 " +
      '다시 깬 때 <b class="rbx-d">' + R.broke + "번</b> · 안 깬 때 <b class=\"rbx-u\">" + R.held + "번</b>" + (R.open ? " · 아직 " + (R.nd || 20) + "일 안 지나 미정 " + R.open + "번" : "");
  }

  // 화면 카드 (where: "ez" 쉬운 화면 · "home" 전체 메뉴 홈)
  window.__rebCard = function(B, chg, where){
    var I = info(B, chg); if (!I) return "";
    return '<section class="rbx-c' + (where === "ez" ? " ez" : " card") + '" id="rbcard" data-cz="done">' +
      '<div class="rbx-h">📈 이번 하락장 반등 날 ' + I.R.n + '번, 그 뒤엔 <small>오늘 코스피 ' + sg(I.chg) + '</small></div>' +
      '<p class="rbx-m">' + main(I) + '</p>' +
      (I.last ? '<p class="rbx-s">' + e(lastLine(I.last)) + (I.inPts ? '' : ' · 오늘 ' + sg(I.chg) + '은 마감 뒤 ' + (I.R.n + 1) + '번째로 들어가요') + '</p>' : '') +
      strip(I) +
      '<p class="rbx-n">규칙은 그대로, 이건 기록 · 종가 기준 · 이번 하락장 안에서만 셈 · 사라·팔라는 뜻 아님</p></section>';
  };

  // 📨 고객 한 장 한 줄 ({h, t, tone, max} · onepage.js note 블록)
  window.__rebNote = function(B, chg){
    var I = info(B, chg); if (!I) return null;
    var R = I.R;
    return {h: "📈 이번 하락장 반등 날 " + R.n + "번, 그 뒤엔",
      t: md(R.from) + " 하락장 시작 뒤 +" + (R.up || 3) + "% 넘게 오른 날 " + R.n + "번 중 " + (R.nd || 20) + "거래일 안에 저점을 다시 깬 때 " + R.broke + "번 · 안 깬 때 " + R.held + "번" + (R.open ? " · 미정 " + R.open + "번" : "") + " — 반등 하루로 판단하지 않고 정한 규칙대로 가요 (종가 기준 기록)",
      tone: "dark", max: 3};
  };

  var css = document.createElement("style");
  css.textContent =
    ".rbx-c{margin:10px 0;padding:12px 14px;border-radius:14px;background:var(--panel,rgba(127,127,127,.08));box-shadow:inset 0 0 0 1px var(--line,rgba(127,127,127,.25))}" +
    ".rbx-c.card{margin:10px 0}" +
    ".rbx-h{font-size:15px;font-weight:900;line-height:1.35;word-break:keep-all}.rbx-h small{display:block;margin-top:2px;font-size:12px;font-weight:700;color:var(--up,#e66767)}" +
    ".rbx-m{margin:6px 0 2px;font-size:14px;line-height:1.55;word-break:keep-all}.rbx-u{color:var(--up,#e66767)}.rbx-d{color:var(--down,#3987e5)}" +
    ".rbx-s{margin:2px 0 6px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".rbx-sv{display:block;width:100%;height:28px}" +
    ".rbx-ax{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-top:-2px}" +
    ".rbx-lg{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin-top:4px;font-size:12px;color:var(--sub)}.rbx-lg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:3px}.rbx-lg i.o{background:none;box-shadow:inset 0 0 0 1.5px var(--text,#e8ecf4)}" +
    ".rbx-n{margin:6px 0 0;font-size:12px;color:var(--sub);line-height:1.5;word-break:keep-all}";
  document.head.appendChild(css);
})();
;
/* ======== ux1110b.js ======== */
/* 🫧 11/10 버블 경보판 — 「주식보다 채권이 먼저 운다」 (사용자: 전병서 11/11 「AI 버블, 지금 몇 시인가」를 올리며 「네 두뇌에 생각을 더해 · 이 글부터 바로 반영」)
   🏠 오늘 홈 🐻 하락장 계기판 바로 아래 카드 한 장:
   ─ 머리: 🔴·🟠·🟢 개수 띠 + 결론 한 줄(신용 경보 켜짐이면 「출구 설계: 현금 도는 기업·전력/데이터·외상 없는 삽 장수」)
   ─ 📅 분수령 날짜(엔비디아 실적 · FOMC) D-day
   ─ 펼치면: 신용 / 바늘 / 완충 묶음별 칸 — 자동(야후 종가) · 손(두뇌가 출처와 함께 갱신) 꼬리표
   계산은 만드는 쪽(market-strategy-report src/bubble_gate.py → market/bubble.json) — 이 파일은 그리기만 */
/* 🕰 11/11 버블 시계(A11/11-1 · 사용자 「둘 다 진행」) — 머리 띠 자리에 시계 하나: 전병서 순서 4단계(💳 신용 → 📈 금리·규제·유가 → 🧊 주식 속살·현금 도피 → 🛟 완충 꺼짐)
   칸 점수 🔴1·🟠½·🟢0 · 단계마다 3시간 · 앞 단계가 ¾ 넘게 울어야 다음 단계로 · 테두리 11칸(누르면 그 칸 근거) · 어제 마지막 시각 → 지금(bubble_log) · 계산은 결과 보기 전 등록 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function dday(d){
    var t = Date.parse(String(d).slice(0, 10) + "T00:00:00+09:00"), n = Date.parse(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + "T00:00:00+09:00");
    var k = Math.round((t - n) / 864e5); return k === 0 ? "오늘" : k > 0 ? "D-" + k : "";
  }
  var GN = {"신용": "💳 신용 — 채권이 먼저 우는 곳", "바늘": "📌 바늘 — 풍선 곁에 모인 것", "완충": "🛟 완충 — 버텨 주는 것"};
  var SC = {"🔴": "r", "🟠": "o", "🟢": "g"};

  // 🕰 버블 시계 — 순서는 전병서 「지금 몇 시인가」 틀(주식보다 신용이 먼저 운다)
  var CQ = [
    {t: "💳 신용", k: ["fcf", "bonds", "cds", "credit"]},
    {t: "📈 금리·규제·유가", k: ["rate", "policy", "geo"]},
    {t: "🧊 주식 속살·현금 도피", k: ["breadth", "flow"]},
    {t: "🛟 완충 꺼짐", k: ["buffer", "recession"]}
  ];
  var PT = {"🔴": 1, "🟠": 0.5, "🟢": 0};
  var KN = {fcf: "빅테크 현금흐름", bonds: "회사채", cds: "AI CDS", credit: "신용스프레드", rate: "금리", policy: "규제", geo: "유가", breadth: "평균 종목", flow: "현금 도피", buffer: "완충", recession: "경기"};
  function clockOf(st){   // st = {key: "🔴"...} → {h, label, q:[{t, comp, r, o, n}]}
    var h = 0, stop = false, q = CQ.map(function(Q){
      var ks = Q.k.filter(function(k){ return st[k] != null; }), sum = 0, r = 0, o = 0;
      ks.forEach(function(k){ sum += PT[st[k]] || 0; if (st[k] === "🔴") r++; if (st[k] === "🟠") o++; });
      return {t: Q.t, comp: ks.length ? sum / ks.length : 0, r: r, o: o, n: ks.length};
    });
    // 🕰 11/11 구조 손질(사용자 「구조를 손봐」): 순서 문(앞 단계 ¾) 없앰 — 과거 위기 때 금리가 내려 2단계가 못 채워 바늘이 4시 반에 묶였음(닷컴·금융위기) → 네 단계가 운 만큼 그냥 더함
    q.forEach(function(x){ h += 3 * x.comp; });
    var hh = Math.round(h * 2) / 2, w = Math.floor(hh), half = hh - w >= 0.5;
    var label = hh <= 0 ? "12시 · 조용" : hh >= 12 ? "12시 · 다 울었음" : "약 " + w + "시" + (half ? " 반" : "");
    if (hh > 0 && hh < 1) label = "약 12시 반";
    return {h: h, hh: hh, label: label, q: q};
  }
  function stOf(B){ var st = {}; (B.items || []).forEach(function(x){ if (x.key) st[x.key] = x.state; }); return st; }
  window.__bubClock = function(B){ try { return B && B.items ? clockOf(stOf(B)) : null; } catch(x) { return null; } };
  // 🕰 11/11 정직 표기 — 「🟠 3 / 3칸」이 꽉 찬 것처럼 읽혀서: 시계에 실제로 찬 만큼(절반·¾…)을 씀 · 앞 단계에 막힌 단계는 「⏸ 대기」
  function frac(c){ var F = [[1/4, "¼"], [1/3, "⅓"], [1/2, "절반"], [2/3, "⅔"], [3/4, "¾"]]; for (var i = 0; i < F.length; i++) if (Math.abs(c - F[i][0]) < 0.01) return F[i][1]; return Math.round(c * 100) + "%"; }
  function cnt(x){ return (x.r ? "🔴" + x.r : "") + (x.o ? (x.r ? " " : "") + "🟠" + x.o : ""); }
  function word(x){
    if (!x.n) return "자료 없음";
    if (x.wait) return x.comp > 0 ? cnt(x) + " · ⏸ 대기" : "조용";
    return x.comp >= 0.999 ? "다 울었음" : x.comp > 0 ? cnt(x) + " · " + frac(x.comp) : "조용";
  }
  function pt(a, r){ var t = a * Math.PI / 180; return (60 + r * Math.sin(t)).toFixed(1) + " " + (60 - r * Math.cos(t)).toFixed(1); }
  function clockSVG(B, C){
    var byK = {}; (B.items || []).forEach(function(x){ if (x.key) byK[x.key] = x; });
    var arcs = "", R = 47;
    CQ.forEach(function(Q, qi){
      var a0 = qi * 90, n = Q.k.length, step = 90 / n;
      Q.k.forEach(function(k, i){
        var x = byK[k], s0 = a0 + i * step + 2.2, s1 = a0 + (i + 1) * step - 2.2;
        arcs += '<path class="bck ' + (x ? (SC[x.state] || "n") : "n") + (C.q[qi] && C.q[qi].wait ? " w" : "") + '" data-bbk="' + k + '" d="M' + pt(s0, R) + ' A' + R + ' ' + R + ' 0 0 1 ' + pt(s1, R) + '"><title>' + e(x ? x.name + " " + x.state : k) + '</title></path>';
      });
    });
    var nums = [[0, "12"], [90, "3"], [180, "6"], [270, "9"]].map(function(z){ var p = pt(z[0], 33).split(" "); return '<text x="' + p[0] + '" y="' + (+p[1] + 4) + '">' + z[1] + '</text>'; }).join("") +
      '<text x="60" y="38" class="bck-12">출발·터짐</text>';   // 12시 = 출발점이자 한 바퀴 끝(다 울었음)
    var ang = C.hh / 12 * 360, tip = pt(ang, 38).split(" ");
    return '<svg class="bck-svg" viewBox="0 0 120 120" role="img" aria-label="버블 시계 ' + e(C.label) + '"><circle cx="60" cy="60" r="56" class="bck-face"/>' + arcs + nums +
      '<line x1="60" y1="60" x2="' + tip[0] + '" y2="' + tip[1] + '" class="bck-hand"/><circle cx="60" cy="60" r="4.5" class="bck-hub"/></svg>';
  }
  function dur(h){ var m = Math.round(h * 60); return m >= 60 ? (m / 60) + '시간' : m + '분'; }
  function chgLine(B, C){   // 어제 마지막 기록 → 지금
    var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bubble_log.json?t=" + Math.floor(Date.now() / 6e5);
    fetch(RAW).then(function(r){ return r.ok ? r.json() : null; }).then(function(L){
      var el = document.getElementById("bck-chg"); if (!el || !L || !L.length) return;
      var today = String(B.at || "").slice(0, 10), prev = null;
      for (var i = L.length - 1; i >= 0; i--) if (String(L[i].at || "").slice(0, 10) < today){ prev = L[i]; break; }
      if (!prev){ el.textContent = "어제 기록 없음 — 오늘부터 바늘 흐름을 적어요"; return; }
      var P = clockOf(prev.states || {}), d = C.hh - P.hh;
      // 왜 움직였나 — 바뀐 칸(최대 2개)을 「유가 🟢→🟠」처럼
      var ps = prev.states || {}, cs = stOf(B), why = [];
      CQ.forEach(function(Q){ Q.k.forEach(function(k){ if (ps[k] && cs[k] && ps[k] !== cs[k] && why.length < 2) why.push((KN[k] || k) + " " + ps[k] + "→" + cs[k]); }); });
      el.innerHTML = e(md(prev.at)) + ' 마지막 <b>' + e(P.label.replace(/^약 /, "")) + '</b> → 지금 <b>' + e(C.label.replace(/^약 /, "")) + '</b>' + (d > 0 ? ' <em class="up">▲' + dur(d) + '</em>' : d < 0 ? ' <em class="dn">▼' + dur(-d) + '</em>' : ' · 그대로') +
        (why.length ? '<small class="bck-why">' + e(why.join(" · ")) + '</small>' : '');
    }).catch(function(){});
  }
  // 🕰 11/11 「과거엔?」 — 기계 칸만으로 1999년부터 다시 돌린 시계(market/bubble_bt.json · src/bubble_bt.py)
  function pastLine(){
    var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/", t = "?t=" + Math.floor(Date.now() / 36e5);
    var gj = function(f){ return fetch(RM + f + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); };
    Promise.all([gj("bubble_bt.json"), gj("best_bt.json")]).then(function(Z){
      var R = Z[0], BT = Z[1], el = document.getElementById("bck-past"); if (!el || !R || !R.markets) return;
      var M = {}; R.markets.forEach(function(m){ M[m.key] = m; });
      var li = [];
      var fc = (R.free_crises || []).filter(function(c){ return !/지금/.test(c.name); }).map(function(c){ return c.name.replace(/ (\d{4}).*$/, " $1") + " " + c.max + "시"; }).join(" · ");
      if (fc) li.push('<li><b>과거 위기 때 바늘</b> — ' + e(fc) + (R.free_dist && R.free_dist["6"] != null ? ' · 6시를 넘은 날은 전체의 ' + R.free_dist["6"] + '%뿐' : '') + ' → <b>6시부터 조심, 9시면 위기 한복판</b>으로 읽어요.</li>');
      // 🏁 11/11 시장별 1등 방식 (best_bt.json — 앞·뒤 모두 보유를 이긴 것 중 전체 연수익 1등)
      var NMB = {"dd10": "고점 −10%", "dd15": "고점 −15%", "dd20": "고점 −20%", "ma200": "200일선 아래", "clock4.5": "버블 시계 4.5시", "clock6": "버블 시계 6시", "credit200": "신용 경보+200일선 아래",
                 "release": "판정 풀림", "floor3": "바닥 신호 3개", "floor14": "바닥 ①④", "ma200up": "200일선 위로", "off": "신호 꺼짐", "cash": "현금", "bond": "중기국채"};
      var nmb = function(k){ return /^current\+/.test(k) ? "지금 규칙 + " + (NMB[k.slice(8)] || k.slice(8)) : k === "current" ? "지금 규칙" : (NMB[k] || k); };
      if (BT && BT.markets) BT.markets.forEach(function(m){
        var b = m.best, flag = /kos/.test(m.key) ? "🇰🇷 " : "🇺🇸 ";
        li.push('<li><b>' + flag + e(m.name) + '</b> — ' + (b ? e(nmb(b.ent)) + ' → ' + e(nmb(b.exit)) + ' · ' + e(NMB[b.alt] || b.alt) + ' ' + Math.round(b.frac * 100) + '% · 연 ' + b.full.cagr + '% (그냥 들고 있기 ' + m.hold.cagr + '%) · 최대 낙폭 ' + String(b.full.mdd).replace('-', '−') + '% (' + String(m.hold.mdd).replace('-', '−') + '%)' : '판 ' + m.n + '개 중 앞·뒤 모두 보유를 이긴 방식이 없어 <b>그냥 들고 있기</b>') + '</li>');
      });
      el.innerHTML = '<summary>🕰 과거엔? — 1999년부터 다시 돌려 봄</summary><ul>' + li.join("") + '</ul><small>손 칸(FCF·CDS·규제)은 옛 자료가 없어 기계 칸으로 만든 대리 시계라 앱 시계보다 낮게 나와요 · 2012년까지 고르고 2013년부터 확인 · ' + e(String(R.at || "").slice(5, 10).replace("-", "/")) + ' 계산 · 매수·매도 추천 아님</small>';
      el.hidden = false;
    });
  }
  function clockBlock(B){
    var C = clockOf(stOf(B)); if (!C) return "";
    setTimeout(function(){ chgLine(B, C); pastLine(); }, 0);
    var rows = C.q.map(function(x, i){ return '<li class="' + (x.wait && x.comp > 0 ? "w" : x.comp >= 0.75 ? "r" : x.comp > 0 ? "o" : "g") + '"><span>' + e(x.t) + '</span><b>' + e(word(x)) + '</b></li>'; }).join("");
    return '<div class="bck">' + clockSVG(B, C) + '<div class="bck-t"><div class="bck-k">🕰 버블 시계</div><div class="bck-big">지금 ' + e(C.label) + '</div><ol>' + rows + '</ol><div class="bck-chg" id="bck-chg">어제와 비교 중…</div></div></div>' +
      '<p class="bck-ru">순서: 전병서 「AI 버블, 지금 몇 시인가」 틀(채권·신용이 주식보다 먼저 울어요) · 테두리는 단계마다 3시간씩(12→3 신용 · 3→6 금리·규제·유가 · 6→9 주식 속살·현금 도피 · 9→12 완충) · 바늘 = 네 단계가 운 만큼을 다 더한 것(🔴 1 · 🟠 ½) — 전부 울면 한 바퀴 돌아 12시 · 「절반」은 그 단계 3시간 중 절반 · 바늘 위치는 「어느 단계냐」가 아니라 「얼마나 많이 우나」예요(어느 칸이 우는지는 테두리 색) · 11/11 손질: 앞 단계가 ¾ 울어야 다음 단계를 더하던 규칙을 없앰(과거 위기 때 바늘이 4시 반에 묶였음) · 테두리 칸을 누르면 그 칸 근거 · 생각의 틀 — 사라·팔라는 뜻 아님</p><details class="bck-past" id="bck-past" hidden></details>';
  }

  window.__bubCard = function(B){
    if (!B || !B.items || !B.items.length) return "";
    var n = (B.red || 0) + (B.orange || 0) + (B.green || 0) || B.items.length;
    var bar = [["r", B.red], ["o", B.orange], ["g", B.green]].map(function(x){ return x[1] ? '<i class="bbx-b' + x[0] + '" style="flex:' + x[1] + '"></i>' : ""; }).join("");
    var cnt = '<span class="bbx-n"><b class="r">🔴 ' + (B.red || 0) + '</b><b class="o">🟠 ' + (B.orange || 0) + '</b><b class="g">🟢 ' + (B.green || 0) + '</b>' + (B.credit_on ? '<em>신용 경보 켜짐</em>' : '') + '</span>';
    var dates = (B.dates || []).slice(0, 3).map(function(d){ var dd = dday(d.d); return '<li><b>' + e(md(d.d)) + (dd ? ' <em>' + dd + '</em>' : '') + '</b><span>' + e(d.t) + '<small>' + e(d.why) + '</small></span></li>'; }).join("");
    var groups = {}; B.items.forEach(function(x){ (groups[x.grp || "바늘"] = groups[x.grp || "바늘"] || []).push(x); });
    var det = ["신용", "바늘", "완충"].filter(function(g){ return groups[g]; }).map(function(g){
      return '<div class="bbx-g"><div class="bbx-gh">' + e(GN[g] || g) + '</div><ul>' + groups[g].map(function(x){
        return '<li class="' + (SC[x.state] || "") + '" data-bbk="' + e(x.key || "") + '"><i>' + e(x.state) + '</i><div><b>' + e(x.name) + ' <small>기준: ' + e(x.th) + '</small></b><p>' + e(x.now) + '</p><small class="bbx-src">' +
          (x.auto ? '<em class="a">자동</em> 야후 종가 · ' + e(String(x.at || "").slice(5, 16).replace("-", "/")) : '<em>손</em> ' + e(x.src) + ' · ' + e(md(x.at))) + '</small></div></li>';
      }).join("") + '</ul></div>';
    }).join("");
    var fr = B.frame ? '<details class="bbx-f"><summary>이 틀은 어디서? — ' + e(B.frame.title) + '</summary><ul>' + (B.frame.lines || []).map(function(l){ return '<li>' + e(l) + '</li>'; }).join("") + '</ul></details>' : "";
    return '<section class="card bbx" id="bubble" data-cz="done">' +
      '<div class="bbx-h">🫧 버블 경보판 <small>' + e(md(B.at)) + ' ' + e(String(B.at || "").slice(11, 16)) + ' · 주식보다 채권이 먼저 울어요</small></div>' +
      clockBlock(B) + cnt +
      '<p class="bbx-lead' + (B.credit_on || B.red >= 3 ? " warn" : "") + '">' + e(B.lead) + '</p>' + (B.sub ? '<p class="bbx-sub">' + e(B.sub) + '</p>' : '') +
      (dates ? '<ul class="bbx-d">' + dates + '</ul>' : '') +
      '<details class="bbx-det"><summary>' + n + '칸 펼치기 · 무엇이 울고 있나</summary>' + det + fr +
      '<p class="note bbx-ru">자동 칸 기준 — 신용: 하이일드÷국채(HYG/IEF) 20일 −1.5%↓ 🔴 · −0.5%↓ 🟠 / 10년물 5% 위 5일 연속 🔴 · 4.75%↑ 🟠 / 브렌트 100$ 🔴 · 90$ 🟠 / 평균 종목(동일가중 S&P) 1년 고점 −15% 🔴 · −8% 🟠 / ' +
      '현금 도피 = 나스닥100 하루 −5%↓ + 방어주도 하락 + 신용 악화 🔴 · 방어주가 기술주보다 20일 +3%p = 업종 갈아타기 🟠. 생각의 틀이에요 — 포트 비중·현금 규칙은 이 판 혼자 바꾸지 않아요(현금은 🐻 계기판) · 매수·매도 추천 아님.</p></details></section>';
  };

  var css = document.createElement("style");
  css.textContent =
    ".bbx{padding:16px 16px 14px!important}.bbx-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bbx-h small{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--sub)}" +
    ".bbx-bar{display:flex;gap:3px;height:8px;margin:12px 0 8px;border-radius:6px;overflow:hidden}.bbx-bar i{display:block;min-width:6px}.bbx-br{background:#e5484d}.bbx-bo{background:#f59e0b}.bbx-bg{background:#30a46c}" +
    ".bbx-n{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font-size:13px}.bbx-n b{font-weight:800}.bbx-n em{font-style:normal;font-size:12px;font-weight:800;color:#e5484d;padding:2px 8px;border-radius:999px;background:rgba(229,72,77,.12)}" +
    ".bbx-lead{margin:10px 0 0;font-size:14px;font-weight:700;line-height:1.5;word-break:keep-all}.bbx-lead.warn{color:var(--text)}.bbx-sub{margin:4px 0 0;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    ".bbx-d{list-style:none;margin:12px 0 0;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08))}.bbx-d li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.4}.bbx-d li+li{margin-top:8px}" +
    ".bbx-d li>b{flex:0 0 64px;font-weight:900}.bbx-d li>b em{display:block;font-style:normal;font-size:11px;color:#f59e0b}.bbx-d li>span{flex:1;min-width:0;font-weight:700;word-break:keep-all}.bbx-d small{display:block;font-weight:500;color:var(--sub);font-size:12px;margin-top:2px}" +
    ".bbx-det{margin-top:12px}.bbx-det>summary,.bbx-f>summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--accent,#3987e5);list-style:none}.bbx-det>summary::-webkit-details-marker,.bbx-f>summary::-webkit-details-marker{display:none}" +
    ".bbx-g{margin-top:12px}.bbx-gh{font-size:12px;font-weight:800;color:var(--sub);margin-bottom:6px}.bbx-g ul{list-style:none;margin:0;padding:0}" +
    ".bbx-g li{display:flex;gap:8px;padding:9px 10px;border-radius:10px;background:var(--panel,rgba(127,127,127,.06))}.bbx-g li+li{margin-top:6px}.bbx-g li.r{box-shadow:inset 3px 0 0 #e5484d}.bbx-g li.o{box-shadow:inset 3px 0 0 #f59e0b}.bbx-g li.g{box-shadow:inset 3px 0 0 #30a46c}" +
    ".bbx-g li>i{font-style:normal;flex:0 0 auto}.bbx-g li>div{flex:1;min-width:0}.bbx-g li b{font-size:13px;font-weight:800}.bbx-g li b small{font-weight:600;color:var(--sub);font-size:11px;margin-left:4px}" +
    ".bbx-g li p{margin:3px 0 0;font-size:13px;line-height:1.45;word-break:keep-all;overflow-wrap:anywhere}.bbx-src{display:block;margin-top:3px;font-size:11px;color:var(--sub)}.bbx-src em{font-style:normal;font-weight:800;padding:0 5px;border-radius:5px;background:rgba(127,127,127,.18)}.bbx-src em.a{background:rgba(57,135,229,.18)}" +
    ".bbx-f{margin-top:12px}.bbx-f ul{margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.5;word-break:keep-all}.bbx-f li+li{margin-top:4px}.bbx-ru{margin-top:12px!important}";
  css.textContent +=
    ".bck{display:flex;gap:12px;align-items:center;margin:12px 0 8px}.bck-svg{flex:0 0 112px;width:112px;height:112px}" +
    ".bck-face{fill:var(--panel,rgba(127,127,127,.08));stroke:rgba(127,127,127,.25);stroke-width:1}.bck-svg text{font-size:10px;font-weight:800;fill:var(--sub);text-anchor:middle}" +
    ".bck-svg path.bck{fill:none;stroke-width:9;cursor:pointer}.bck-svg path.r{stroke:#e5484d}.bck-svg path.o{stroke:#f59e0b}.bck-svg path.g{stroke:#30a46c}.bck-svg path.n{stroke:rgba(127,127,127,.35)}.bck-svg path.w{opacity:.32;stroke-dasharray:3 2}.bck-svg text.bck-12{font-size:6.5px;font-weight:700;opacity:.8}" +
    ".bck-past{margin:0 0 10px;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08))}.bck-past>summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--accent,#3987e5);list-style:none}.bck-past>summary::-webkit-details-marker{display:none}" +
    ".bck-past ul{margin:8px 0 6px;padding-left:16px;font-size:12.5px;line-height:1.5;word-break:keep-all}.bck-past li+li{margin-top:5px}.bck-past>small{display:block;font-size:11px;color:var(--sub);line-height:1.4;word-break:keep-all}" +
    ".bck-t ol li.w b{color:var(--sub)}.bck-why{display:block;margin-top:2px;font-size:11px;color:var(--sub)}" +
    ".bck-hand{stroke:var(--text,#111);stroke-width:3.2;stroke-linecap:round}.bck-hub{fill:var(--text,#111)}" +
    ".bck-t{flex:1;min-width:0}.bck-k{font-size:12px;font-weight:800;color:var(--sub)}.bck-big{font-size:21px;font-weight:900;letter-spacing:-.4px;margin:1px 0 6px}" +
    ".bck-t ol{list-style:none;margin:0;padding:0;font-size:12px;line-height:1.35}.bck-t ol li{display:flex;justify-content:space-between;gap:6px}.bck-t ol li+li{margin-top:2px}.bck-t ol li span{color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bck-t ol li b{font-weight:800;white-space:nowrap}" +
    ".bck-t ol li.r b{color:#e5484d}.bck-t ol li.o b{color:#d97706}.bck-t ol li.g b{color:#30a46c}" +
    ".bck-chg{margin-top:6px;font-size:12px;color:var(--sub)}.bck-chg b{color:var(--text)}.bck-chg em{font-style:normal;font-weight:800}.bck-chg em.up{color:#e5484d}.bck-chg em.dn{color:#30a46c}" +
    ".bck-ru{margin:0 0 8px;font-size:11px;line-height:1.45;color:var(--sub);word-break:keep-all}.bbx-g li.bck-hl{outline:2px solid var(--accent,#3987e5);outline-offset:1px}";
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest(".bck-svg [data-bbk]"); if (!t) return;
    var card = t.closest(".bbx"); if (!card) return;
    var det = card.querySelector(".bbx-det"); if (det) det.open = true;
    var li = card.querySelector('.bbx-g li[data-bbk="' + t.getAttribute("data-bbk") + '"]'); if (!li) return;
    li.scrollIntoView({behavior: "smooth", block: "center"}); li.classList.add("bck-hl"); setTimeout(function(){ li.classList.remove("bck-hl"); }, 1800);
  }, true);
  document.head.appendChild(css);
  if (window.__h2apply) try { __h2apply(); } catch(x) {}
})();
;
/* ======== ux1112.js ======== */
/* 🧭 11/12 계절 시계 — 사용자 「5개 국가 각각의 지수들을 백테스트 해서 현금 비중을 늘려야 할 때·주식 비중을 늘려야 할 때를 시계나 보기 쉬운 그림으로」
   market-strategy-report/market/season.json (src/season_bt.py · 평일 07:20·16:50) → 🏠 오늘 홈, 🫧 버블 경보판 아래 카드
   시계 = 주가 흐름 계절 6칸(달력 아님 — 11/12 사용자 「실제 달력 부분은 빼자」) · 칸 색 = 3개월 뒤 올라 있던 비율 · 바늘 = 지금 계절
   🧭 11/12 A11/12-1 계절 띠(사용자 「1번 진행」): 지수 9줄 글자 목록 → 지수마다 지난 2년 주별 계절 색 띠 한 줄(season.json trail · 만드는 쪽 변경 없음)
      띠를 누르면 그 주 계절·몇 주째 풍선 · 이름·오른쪽 글자를 누르면 지금처럼 시계·성적 펼침
      「그냥 들기」 글자 → 「계절은 참고만」·「🏁 시장별 방식」(한국·미국은 🏁 시장별 방식을 따름 — 같은 화면 한 목소리) */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/season.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return String(v).replace("-", "−"); }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"}, CN = {kr: "한국", jp: "일본", cn: "중국", hk: "홍콩", us: "미국"};
  var SN = {spring: ["🌱", "봄", "바닥에서 올라오는 중"], summer: ["☀️", "여름", "오르는 추세"], hot: ["🔥", "늦여름", "과열"], autumn: ["🍂", "가을", "꺾이는 중"], winter: ["❄️", "겨울", "내리는 추세"], base: ["🌤", "늦겨울", "바닥 다지는 중"]};
  var SHORT = {hold: "그냥 들고 있기", hal0: "11~4월만 주식", hal: "5~10월엔 절반만", halma: "11~4월 주식 · 여름엔 추세 좋을 때 절반", halma2: "11~4월 주식 · 여름엔 추세 좋을 때만",
               deep: "10개월선 위면 주식 · 많이 싸면 절반", floor: "하락장엔 현금 → 바닥 신호마다 담기", ma10: "10개월선 위면 주식", ma10h: "10개월선 아래면 절반", step2: "신호 2개 계단", step3: "신호 3개 계단",
               mom12: "1년 전보다 높으면 주식", ddl: "−10% 절반 · −20% 현금", season: "계절표", bear: "하락장이면 현금", halbear: "11~4월 + 하락장 아님", halbear2: "달력·하락장 둘 다 보기"};
  function pt(r, deg){ var a = (deg - 90) * Math.PI / 180; return [(60 + r * Math.cos(a)).toFixed(1), (60 + r * Math.sin(a)).toFixed(1)]; }
  function wedge(r0, r1, a0, a1){ var p = pt(r1, a0), q = pt(r1, a1), s = pt(r0, a1), t = pt(r0, a0); return "M" + p + "A" + r1 + " " + r1 + " 0 0 1 " + q + "L" + s + "A" + r0 + " " + r0 + " 0 0 0 " + t + "Z"; }
  function mcls(v){ return v >= 1.5 ? "g2" : v >= 0.3 ? "g1" : v > -0.3 ? "z" : v > -1 ? "r1" : "r2"; }
  // 🧭 11/12 사용자 「실제 달력 부분은 빼자」 → 시계 = 주가 흐름 계절 6칸(달력 아님) · 칸 색 = 그 계절에서 3개월 뒤 올라 있던 비율 · 바늘 = 지금 계절
  var ORD = ["spring", "summer", "hot", "autumn", "winter", "base"];
  function ucls(v){ return v == null ? "z" : v >= 65 ? "g2" : v >= 57 ? "g1" : v >= 50 ? "z" : v >= 45 ? "r1" : "r2"; }
  function dial(m){
    var by = {}; (m.states || []).forEach(function(x){ by[x.st] = x; });
    var g = "", cur = ORD.indexOf(m.now.st);
    ORD.forEach(function(k, i){
      var a0 = i * 60 + 1.5, a1 = i * 60 + 58.5, x = by[k] || {}, ep = pt(37, i * 60 + 30);
      g += '<path class="sc-m ' + ucls(x.up60) + (i === cur ? " cur" : "") + '" d="' + wedge(20, 52, a0, a1) + '"/><text class="sc-me" x="' + ep[0] + '" y="' + (+ep[1] - 1) + '">' + SN[k][0] + '</text><text class="sc-ml" x="' + ep[0] + '" y="' + (+ep[1] + 9) + '">' + (x.up60 != null ? x.up60 + "%" : "–") + '</text>';
    });
    var ang = cur * 60 + Math.min(54, 6 + (m.now.days || 0) * 1.2), np = pt(52, ang), nb = pt(6, ang);
    var s = SN[m.now.st] || ["", "", ""];
    return '<svg class="sc-svg" viewBox="0 0 120 120" role="img" aria-label="' + e(m.name) + ' 흐름 시계 — 지금 ' + e(s[1]) + '">' + g +
      (cur >= 0 ? '<line class="sc-nd" x1="' + nb[0] + '" y1="' + nb[1] + '" x2="' + np[0] + '" y2="' + np[1] + '"/><circle class="sc-nd" cx="60" cy="60" r="3.2"/>' : '') + '</svg>';
  }
  // 🧭 A11/12-1 계절 띠 — trail = [[주 날짜, 계절 번호(ORD 순)], …] 지난 104주
  var BM = {kospi: "흔들리면 전부 현금", kosdaq: "버블 시계 6시면 전부 현금", sp500: "흔들리면 절반만 채권", nasdaq: "그냥 들고 있기"};   // 🏁 시장별 방식(home2.js METH 와 같은 이름)
  var SC = {spring: "#8ccf6a", summer: "#f0c64a", hot: "#f08a3c", autumn: "#a8744a", winter: "#3f78d1", base: "#9ccbee"};
  function runs(t){ var R = []; (t || []).forEach(function(x, i){ var k = ORD[x[1]]; if (R.length && R[R.length - 1].k === k) R[R.length - 1].n++; else R.push({k: k, d: x[0], i: i, n: 1}); }); return R; }
  function band(m){
    var t = m.trail || [], N = t.length; if (!N) return '<span class="sc-band"></span>';
    var g = runs(t).map(function(r){ var a = (r.i / N * 100).toFixed(2), b = ((r.i + r.n) / N * 100).toFixed(2); return SC[r.k] + " " + a + "% " + b + "%"; }).join(",");
    return '<span class="sc-band" data-scb="' + e(m.key) + '" role="img" aria-label="' + e(m.name) + ' 지난 2년 계절 띠" style="background:linear-gradient(90deg,' + g + ')"><i></i></span>';
  }
  function md2(d){ var x = String(d).split("-"); return (+x[1]) + "/" + (+x[2]); }
  function axis(ms){
    var t = (ms[0] && ms[0].trail) || [], N = t.length, h = "";
    t.forEach(function(x, i){ var mo = x[0].slice(5, 7), pm = i ? t[i - 1][0].slice(5, 7) : ""; if (i && mo !== pm && (mo === "01" || mo === "07") && i / N < 0.78) h += '<i style="left:' + (i / N * 100).toFixed(1) + '%">' + (mo === "01" ? "’" + x[0].slice(2, 4) : "7월") + '</i>'; });
    return '<div class="sc-ax"><span></span><span class="sc-axb">' + h + '<i class="r">지금</i></span><span></span></div>';
  }
  function tip(el, ev){
    var S = window.__seasonData, k = el.dataset.scb, m = S && (S.markets || []).filter(function(x){ return x.key === k; })[0]; if (!m) return;
    var t = m.trail || [], N = t.length, rc = el.getBoundingClientRect(), f = Math.max(0, Math.min(0.999, (ev.clientX - rc.left) / rc.width)), i = Math.floor(f * N);
    var R = runs(t), j = 0; R.forEach(function(r, q){ if (i >= r.i && i < r.i + r.n) j = q; });
    var r = R[j], p = R[j - 1], nx = R[j + 1], s = SN[r.k];
    var txt = '<b>' + e(m.name) + ' · ' + s[0] + ' ' + s[1] + '</b> ' + md2(r.d) + ' 주부터 ' + (nx ? r.n + '주 → 다음 ' + SN[nx.k][0] + ' ' + SN[nx.k][1] : '지금까지 ' + r.n + '주째') + (p ? ' <small>(그 전 ' + SN[p.k][0] + ' ' + SN[p.k][1] + ' ' + p.n + '주)</small>' : '');
    var card = el.closest(".sc"), tp = card && card.querySelector(".sc-tip"); if (!tp) return;
    tp.innerHTML = txt; tp.hidden = false;
    var row = el.closest(".sc-r"); row.parentNode.insertBefore(tp, row.nextSibling);
    clearTimeout(tp._t); tp._t = setTimeout(function(){ tp.hidden = true; }, 6000);
  }
  document.addEventListener("click", function(ev){
    var el = ev.target.closest && ev.target.closest(".sc-band[data-scb]"); if (el){ ev.preventDefault(); ev.stopPropagation(); tip(el, ev); return; }
    var a = ev.target.closest && ev.target.closest("[data-scbm]"); if (a){ ev.preventDefault(); var b = document.querySelector("#h2bear .bm") || document.getElementById("h2bear"); if (b) b.scrollIntoView({behavior: "smooth", block: "start"}); }
  }, true);
  function row(m){
    var b = m.best, M = m.meta && m.meta.all, s = SN[m.now.st] || ["", "", ""];
    var st = (m.states || []).filter(function(x){ return x.st === m.now.st; })[0] || {};
    var hold = b.k === "hold", w = b.w_now;
    var tb = (m.methods || []).map(function(x){ return '<tr class="' + (x.k === b.k ? "pk" : "") + '"><td>' + (x.both ? "✅ " : "") + e(SHORT[x.k] || x.name) + '</td><td>' + x.cagr + '%</td><td>' + mn(x.mdd) + '%</td><td>' + x.w_now + '%</td></tr>'; }).join("");
    var bm = BM[m.key];
    return '<details class="sc-r"><summary class="sc-bs"><span class="sc-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small class="sc-w w' + (hold ? "h" : w >= 100 ? 2 : w > 0 ? 1 : 0) + '">' + (hold ? (bm ? "🏁 시장별 방식" : "계절은 참고만") : "주식 " + w + "%") + '</small></span>' +
      band(m) + '<span class="sc-st"><b>' + s[0] + ' ' + e(s[1]) + '</b><small>' + m.now.days + '일째</small></span></summary>' +
      '<div class="sc-x"><div class="sc-d">' + dial(m) + '<ul class="sc-f">' +
        '<li><small>지금 ' + e(s[1]) + '일 때 3개월 뒤 올라 있던 비율</small><b>' + (st.up60 != null ? st.up60 + "%" : "–") + '</b><em>평균 ' + (st.avg60 > 0 ? "+" : "") + mn(st.avg60) + '%</em></li>' +
        '<li><small>200일선보다 · 1년 고점보다</small><b>' + (m.now.g200 > 0 ? "+" : "") + mn(m.now.g200) + '% · ' + mn(m.now.dd) + '%</b></li>' +
        '<li><small>이 계절이었던 날</small><b>전체의 ' + (st.share != null ? st.share : "–") + '%</b></li></ul></div>' +
      '<p class="sc-v">' + (hold ? '<b>이 시계로는 못 이김</b> — 주가 흐름 방식 ' + ((m.methods || []).length - 1) + '개 중 앞 절반·뒤 절반 둘 다 그냥 들고 있기(연 ' + b.cagr + '% · 가장 크게 잃은 폭 ' + mn(b.mdd) + '%)를 이긴 게 없어요.' + (bm ? ' <a class="sc-bm" href="#h2bear" data-scbm="1">→ ' + e(m.name) + ' 판단은 🏁 시장별 방식 「' + e(bm) + '」을 따라요 ›</a>' : ' 계절은 참고로만 보세요.')
        : '<b>' + e(b.name) + '</b> — 연 ' + b.cagr + '% (그냥 들고 있기 ' + M.hold_cagr + '%) · 가장 크게 잃은 폭 ' + mn(b.mdd) + '% (' + mn(M.hold_mdd) + '%) · 1년에 ' + b.sw_y + '번 바꿈 · 지금 <b>주식 ' + w + '%</b>') + '</p>' +
      '<details class="sc-t"><summary>방식 ' + (m.methods || []).length + '개 성적 보기 (' + e(String(M.from).slice(0, 4)) + '~)</summary><table><tr><th>방식</th><th>연수익</th><th>최대 낙폭</th><th>지금 주식</th></tr>' + tb + '</table><small>✅ = 앞 절반·뒤 절반 둘 다 그냥 들고 있기를 이김 · 현금 연 2% · 바꿀 때 0.1%</small></details></div></details>';
  }
  window.__seasonCard = function(S){
    if (!S || !S.markets) return "";
    var ms = S.markets.filter(function(m){ return m.best && m.states; }); if (!ms.length) return "";
    var cnt = {}; ms.forEach(function(m){ cnt[m.now.st] = (cnt[m.now.st] || 0) + 1; });
    var lead = ORD.filter(function(k){ return cnt[k]; }).map(function(k){ return SN[k][0] + " " + SN[k][1] + " " + cnt[k] + "곳"; }).join(" · ");
    var hold = ms.filter(function(m){ return m.best.k === "hold"; }), win = ms.filter(function(m){ return m.best.k !== "hold"; });
    var out = axis(ms) + ms.map(row).join("") + '<div class="sc-tip" hidden></div>';
    var rec = ms.filter(function(m){ return m.now.days <= 10; }).sort(function(a, b){ return a.now.days - b.now.days; }).map(function(m){ return FL[m.nat] + " " + m.name + " " + SN[m.now.st][0] + " " + SN[m.now.st][1] + " " + m.now.days + "일째"; });
    return '<section class="card sc" id="season" data-cz="done"><div class="sc-h">🧭 계절 시계 <small>' + e(String(S.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="sc-lead">지수 ' + ms.length + '개 지금 — ' + e(lead) + '</p>' + out + (rec.length ? '<p class="sc-rec">🔄 최근 계절이 바뀐 곳 — ' + e(rec.join(" · ")) + '</p>' : '') +
      '<p class="sc-sum">여기서 계절은 달력이 아니라 <b>주가 흐름에 붙인 이름</b>이에요(200일선·50일선 위냐 아래냐). 흐름만 보고 주식·현금을 오가는 방식 ' + ((ms[0].methods || []).length - 1) + '개를 다시 돌려 보니, ' + (win.length ? '<b>' + win.map(function(m){ return m.name; }).join("·") + '</b>에서만 꾸준히 통했고 ' : '') + '나머지 ' + hold.length + '개는 그냥 들고 있기를 못 이겼어요 — 그래서 한국·미국은 🏁 시장별 방식을 따르고, 계절은 <b>흐름이 어디쯤인지</b> 보는 데 써요.</p>' +
      '<div class="sc-lg"><span>띠 = 지난 2년, 주마다 그 주의 계절 · 띠를 누르면 몇 주째인지</span>' + ORD.map(function(k){ return '<span><i style="background:' + SC[k] + '"></i>' + SN[k][1] + '</span>'; }).join("") + '</div>' +
      '<div class="sc-lg"><span>이름을 누르면 시계 — 칸 색 = 그 계절에서 3개월 뒤 올라 있던 비율</span><span><i class="g2"></i>65%↑</span><span><i class="g1"></i>57%↑</span><span><i class="z"></i>50%↑</span><span><i class="r1"></i>45%↑</span><span><i class="r2"></i>그 아래</span></div>' +
      '<p class="sc-note">읽는 법: 시계는 🌱 봄(바닥에서 올라옴) → ☀️ 여름(오름) → 🔥 늦여름(과열) → 🍂 가을(꺾임) → ❄️ 겨울(내림) → 🌤 늦겨울(바닥 다지기) 순서로 돌고, 바늘이 지금 자리예요. 과거 통계로 확률을 보려는 것이지 맞히는 게 아니에요. 가격지수(배당 제외) · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".sc-h{font-size:17px;font-weight:900}.sc-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.sc-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.sc-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.sc-sum b{color:var(--text,inherit)}" +
    ".sc-g{margin:12px 0 2px;font-size:12.5px;font-weight:800;color:var(--sub)}.sc-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.sc-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}.sc-r>summary::-webkit-details-marker{display:none}" +
    ".sc-n{min-width:0}.sc-n b{font-size:14.5px;font-weight:900}.sc-n small{display:block;font-size:12px;color:var(--sub);font-weight:700;margin-top:1px;word-break:keep-all}.sc-w{flex:0 0 auto;text-align:right}.sc-w b{display:inline-block;font-size:13.5px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap}.sc-w.w2 b{background:rgba(48,164,108,.16);color:#1f8a57}.sc-w.w1 b{background:rgba(240,160,60,.2);color:#b86a00}.sc-w.w0 b{background:rgba(229,72,77,.15);color:#d13438}.sc-w.wh b{background:rgba(127,127,127,.16);color:var(--sub)}.sc-m.cur{stroke:var(--text,#111);stroke-width:2}.sc-me{font-size:11px;text-anchor:middle}.sc-w i{display:block;font-style:normal;font-size:10.5px;color:var(--sub);font-weight:700;margin-top:2px}" +
    ".sc-x{margin-top:10px}.sc-d{display:flex;gap:10px;align-items:center}.sc-svg{width:132px;height:132px;flex:0 0 auto}.sc-m.g2{fill:#30a46c}.sc-m.g1{fill:#9bd8b7}.sc-m.z{fill:rgba(127,127,127,.28)}.sc-m.r1{fill:#f3b0a4}.sc-m.r2{fill:#e5484d}" +
    ".sc-ml{font-size:8px;font-weight:800;text-anchor:middle;fill:#1b1f24}.sc-o.on{fill:#1f8a57}.sc-o.half{fill:#e0a030}.sc-o.off{fill:rgba(127,127,127,.25)}.sc-nd{stroke:var(--text,#111);stroke-width:2.4;stroke-linecap:round;fill:var(--text,#111)}.sc-ce{font-size:15px;text-anchor:middle}.sc-cn{font-size:8.5px;font-weight:800;text-anchor:middle;fill:var(--text,#111)}" +
    ".sc-f{list-style:none;margin:0;padding:0;flex:1;min-width:0}.sc-f li{padding:4px 0}.sc-f li+li{border-top:1px solid rgba(127,127,127,.18)}.sc-f small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;line-height:1.3;word-break:keep-all}.sc-f b{font-size:15px;font-weight:900}.sc-f em{font-style:normal;font-size:11.5px;color:var(--sub);margin-left:5px}" +
    ".sc-v,.sc-c{margin:8px 0 0;font-size:13px;line-height:1.55;word-break:keep-all}.sc-c{padding:8px 10px;border-radius:10px;background:rgba(240,160,60,.13)}" +
    ".sc-t{margin-top:8px}.sc-t>summary{cursor:pointer;font-size:12.5px;font-weight:800;color:var(--accent,#3182f6)}.sc-t table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11.5px}.sc-t th,.sc-t td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.sc-t th:first-child,.sc-t td:first-child{text-align:left;white-space:normal;word-break:keep-all}.sc-t tr.pk td{font-weight:900}.sc-t small{display:block;margin-top:4px;font-size:11px;color:var(--sub);line-height:1.4}" +
    ".sc-lg{display:flex;flex-wrap:wrap;gap:4px 10px;margin:12px 0 0;font-size:11px;color:var(--sub);font-weight:700}.sc-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}.sc-lg .g2{background:#30a46c}.sc-lg .g1{background:#9bd8b7}.sc-lg .z{background:rgba(127,127,127,.28)}.sc-lg .r1{background:#f3b0a4}.sc-lg .r2{background:#e5484d}.sc-lg .o{background:#1f8a57;height:4px;vertical-align:2px}" +
    ".sc-note{margin:8px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    /* 🧭 A11/12-1 계절 띠 */
    ".sc-rec{margin:10px 0 6px;font-size:12.5px;font-weight:800;line-height:1.45;word-break:keep-all}" +
    ".sc-ax,.sc-r>summary.sc-bs{display:grid;grid-template-columns:98px minmax(0,1fr) 54px;gap:7px;align-items:center}.sc-r>summary.sc-bs{justify-content:normal}" +
    ".sc-ax{margin:10px 0 -2px;padding:0 12px;font-size:10px;font-weight:800;color:var(--sub)}.sc-axb{position:relative;height:13px}.sc-axb i{position:absolute;top:0;font-style:normal;transform:translateX(-50%);white-space:nowrap}.sc-axb i.r{right:0;transform:none}" +
    ".sc-r{padding:7px 12px;margin-top:5px}.sc-bs .sc-n b{font-size:13px;white-space:nowrap}.sc-bs .sc-n{white-space:nowrap;overflow:hidden}.sc-bs .sc-n small.sc-w{display:block;text-align:left;background:none;padding:0;font-size:10.5px;font-weight:800;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sc-bs small.sc-w.w2{color:#1f8a57}.sc-bs small.sc-w.w1{color:#b86a00}.sc-bs small.sc-w.w0{color:#d13438}.sc-bs small.sc-w.wh{color:var(--sub)}" +
    ".sc-band{position:relative;display:block;height:18px;border-radius:5px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(127,127,127,.18)}.sc-band i{position:absolute;right:-3px;top:-3px;bottom:-3px;width:3px;border-radius:2px;background:var(--text,#111)}" +
    ".sc-st{text-align:right;min-width:0}.sc-st b{display:block;font-size:12.5px;font-weight:900;white-space:nowrap}.sc-st small{display:block;font-size:10.5px;font-weight:700;color:var(--sub)}" +
    ".sc-tip{margin:6px 0 2px;padding:8px 10px;border-radius:10px;font-size:12.5px;line-height:1.5;background:rgba(49,130,246,.12);word-break:keep-all}.sc-tip small{color:var(--sub)}" +
    ".sc-bm{display:inline;color:var(--accent,#3182f6);font-weight:800;text-decoration:none}";
  document.head.appendChild(css);
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__seasonData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
;
/* ======== ux1111.js ======== */
/* 🔭 11/11 신호 탭 「지켜보는 중」 모드 (A11/11-2 · 사용자 「둘 다 진행」)
   코스피가 🐻 하락장(현금 100% · 새로 사지 않기)인 동안 신호 탭(🐋 고래 · ☕ 컵 · 📈 갭 · 🔎 거르기 · ⚡ 단타 · 🤫 매집)이 같은 말을 하도록:
   ─ 머리에 「🐻 지금은 지켜보는 중」 띠 (첫 화면 「국내 주식 → 새로 사지 않기」와 한 목소리)
   ─ 🇰🇷 한국 종목 이름 옆에 「🔭 지켜봄」 꼬리표 — 카드는 숨기지 않음 · 미국·일본 종목은 그대로
   ─ 「🔭 하락장 동안 쌓인 한국 신호 n개」 목록(만드는 쪽 bear_watch.py → archive/x/bear_watch.json · 앱은 그리기만)
   ─ 판정이 풀리면 14일 동안 「하락장 동안 쌓인 신호 n개 ›」 한 줄만 (수익률 계산 없음 · 종목별 성적은 그 종목 화면 🧵)
   판정은 market/bear.json 코스피 칸 그대로(매시간) · 매수·매도 권유 아님 */
(function(){
  var SIG = {whale: 1, cup: 1, gap: 1, screen: 1, danta: 1, accum: 1, sigmore: 1};
  var RAWB = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bear.json";
  var KRA = /openOP\('(\d{6})(?:\.K[SQ])?'\)|m\.stock\.naver\.com\/domestic\/stock\/(\d{6})/;
  var KQ = null, BEAR = null, W = null, got = 0;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function tb(){ return Math.floor(Date.now() / 6e5); }
  function gj(u){ return fetch(u + (u.indexOf("?") < 0 ? "?" : "&") + "t=" + tb(), {cache: "no-store"}).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }
  function load(){
    if (got && Date.now() - got < 6e5) return Promise.resolve();
    return Promise.all([gj(RAWB), gj("archive/x/bear_watch.json")]).then(function(r){
      var k = r[0] && (r[0].markets || []).filter(function(m){ return m.key === "kospi"; })[0];
      BEAR = k || null; KQ = r[0] && (r[0].markets || []).filter(function(m){ return m.key === "kosdaq"; })[0] || null; W = r[1]; got = Date.now();
    });
  }
  function tab(){ return (typeof window.cur !== "undefined" && window.cur) || (location.hash || "").slice(1); }
  function isSig(){ return !!SIG[tab()] || !!document.querySelector("#main #sgleg"); }
  function bearOn(){ return BEAR && BEAR.state === "🐻"; }
  function endedRecent(){
    if (!W || !W.ended || bearOn()) return false;
    return (Date.now() - Date.parse(W.ended + "T00:00:00+09:00")) / 864e5 <= 14;
  }
  function row(r){
    return '<li><button type="button" data-bwc="' + e(r.c) + '"><div><b>' + e(r.n) + '</b> <small>' + e(r.c) + '</small></div><span>' + e((r.s || []).join(" · ")) + '</span>' +
      '<em>' + (r.first === r.last ? md(r.first) : md(r.first) + "~" + md(r.last)) + ' · ' + r.days + '일</em></button></li>';
  }
  function list(){
    if (!W || !W.rows || !W.rows.length) return "";
    W.rows.forEach(function(r){ if ((r.s || []).indexOf('☕ 컵 돌파') >= 0) r.s = r.s.filter(function(x){ return x !== '☕ 컵'; }); });
    var L = W.last_day, today = W.rows.filter(function(r){ return r.last === L; }), rest = W.rows.filter(function(r){ return r.last !== L; });
    return '<details class="bw-d"><summary>🔭 하락장 동안 쌓인 한국 신호 <b>' + W.n + '개</b>' + (W.new_last ? ' <i>' + md(L) + ' 새로 ' + W.new_last + '</i>' : '') + ' <u>▾</u></summary>' +
      (today.length ? '<div class="bw-gh">' + md(L) + '에 뜬 ' + today.length + '개</div><ul>' + today.map(row).join("") + '</ul>' : '') +
      (rest.length ? '<details class="bw-more"><summary>그 전에 떴던 ' + rest.length + '개 ▾</summary><ul>' + rest.slice(0, 80).map(row).join("") + '</ul>' + (rest.length > 80 ? '<p class="bw-n">＋ ' + (rest.length - 80) + '개 더(오래된 것)</p>' : '') + '</details>' : '') +
      '<p class="bw-n">' + md(W.rec_from) + '부터 앱 기록(하락장 시작 ' + md(W.from) + ') · ☕ 컵 · 📈 갭 · ⚡ 단타 · 🤫 매집에 뜬 🇰🇷 종목 · 누르면 그 종목 화면 · 수익률은 계산하지 않아요 — 종목별 성적은 그 종목 화면 🧵 · 기록일 뿐 사라는 뜻 아님</p></details>';
  }
  function banner(){
    if (bearOn()){
      return '<section class="bw-b" id="bw-b"><div class="bw-h">🐻 지금은 <b>지켜보는 중</b></div>' +
        '<p>코스피 하락장(고점 ' + e(BEAR.dd) + '% · ' + md(BEAR.asof) + ' 종가 판정) — 국내 주식은 ' + (BEAR.analog ? '코스피 <b>' + e(BEAR.analog.next) + '</b>' + (KQ && KQ.analog ? ' · 코스닥은 주식 ' + KQ.analog.stock + '%' : '') : '판정 풀릴 때까지 <b>새로 사지 않기</b>') + '. 이 탭의 🇰🇷 한국 종목엔 <span class="bw-tg">🔭 지켜봄</span> 꼬리표만 붙여 기록해요 · 미국·일본 종목은 그대로.</p>' + list() + '</section>';
    }
    if (endedRecent()){
      return '<section class="bw-b ok" id="bw-b"><div class="bw-h">✅ 코스피 하락장 판정 풀림 <small>' + md(W.ended) + '</small></div>' + list() + '</section>';
    }
    return "";
  }
  function apply(){
    var M = document.getElementById("main"); if (!M) return;
    var on = isSig() && (bearOn() || endedRecent());
    document.documentElement.classList.toggle("bw-on", !!(on && bearOn()));
    var old = document.getElementById("bw-b");
    if (!on){ if (old) old.remove(); return; }
    if (!old){
      var html = banner(); if (!html) return;
      var box = document.createElement("div"); box.innerHTML = html; var b = box.firstChild;
      var leg = M.querySelector("#sgleg"), hero = M.querySelector(".hero");
      if (hero && hero.parentNode === M) hero.insertAdjacentElement("afterend", b);
      else if (leg) leg.insertAdjacentElement("afterend", b);
      else M.insertBefore(b, M.firstChild);
    }
    if (!bearOn()) return;
    M.querySelectorAll("a[href]:not([data-bw])").forEach(function(a){
      a.setAttribute("data-bw", "1");
      if (a.closest("#bw-b")) return;
      if (KRA.test(a.getAttribute("href") || "")) a.classList.add("bw-kr");
    });
  }
  var T = 0;   // 모아서 한 번(계속 바뀌는 화면이 있어도 0.3초 안에 꼭 돌게 — 늦추기만 하면 굶음)
  function run(){ T = 0; if (!isSig()){ apply(); return; } load().then(apply); }
  function soon(){ if (!T) T = setTimeout(run, 300); }
  function boot(){
    var M = document.getElementById("main"); if (!M){ setTimeout(boot, 300); return; }
    new MutationObserver(function(ms){
      for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && t.closest("#bw-b")) continue; soon(); return; }
    }).observe(M, {childList: true, subtree: true});
    window.addEventListener("hashchange", soon); soon();
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-bwc]"); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    if (typeof window.openOP === "function") window.openOP(b.getAttribute("data-bwc"));
  }, true);

  var css = document.createElement("style");
  css.textContent =
    ".bw-b{margin:10px 0 12px;padding:13px 14px;border-radius:16px;background:rgba(229,72,77,.08);box-shadow:inset 0 0 0 1px rgba(229,72,77,.28)}.bw-b.ok{background:rgba(48,164,108,.08);box-shadow:inset 0 0 0 1px rgba(48,164,108,.3)}" +
    ".bw-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bw-h small{font-size:12px;color:var(--sub);font-weight:700;margin-left:4px}.bw-b>p{margin:6px 0 0;font-size:13px;line-height:1.5;word-break:keep-all}" +
    ".bw-tg{display:inline-block;font-size:11px;font-weight:800;padding:0 6px;border-radius:6px;background:rgba(127,127,127,.18);white-space:nowrap}" +
    ".bw-d{margin-top:10px}.bw-d>summary,.bw-more>summary{cursor:pointer;list-style:none;font-size:13px;font-weight:800;color:var(--accent,#3987e5)}.bw-d>summary::-webkit-details-marker,.bw-more>summary::-webkit-details-marker{display:none}" +
    ".bw-d>summary i{font-style:normal;font-size:11px;font-weight:800;color:#e5484d;margin-left:4px}.bw-d>summary u{text-decoration:none}" +
    ".bw-gh{margin:10px 0 4px;font-size:12px;font-weight:800;color:var(--sub)}.bw-d ul{list-style:none;margin:0;padding:0}.bw-d li+li{margin-top:4px}" +
    ".bw-d li button{all:unset;box-sizing:border-box;display:grid;grid-template-columns:1fr auto;gap:1px 8px;width:100%;padding:7px 10px;border-radius:10px;background:var(--panel,rgba(127,127,127,.07));cursor:pointer;font-size:13px}" +
    ".bw-d li div{grid-column:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bw-d li b{font-weight:800}.bw-d li small{color:var(--sub);font-size:11px}.bw-d li span{grid-column:1;font-size:12px;color:var(--sub)}.bw-d li em{grid-column:2;grid-row:1/3;align-self:center;font-style:normal;font-size:11px;color:var(--sub);white-space:nowrap}" +
    ".bw-more{margin-top:8px}.bw-n{margin:8px 0 0;font-size:11px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    "html.bw-on #main a.bw-kr::after{content:'🔭 지켜봄';display:inline-block;margin-left:5px;padding:0 5px;border-radius:6px;font-size:10px;font-weight:800;line-height:16px;vertical-align:1px;color:var(--sub);background:rgba(127,127,127,.18);white-space:nowrap}";
  document.head.appendChild(css);
  boot();
})();
;
/* ======== ux1112b.js ======== */
/* CH Investing — 🧊 11/12 냉정 분석 4차 「왜 계속 복잡한가」 → 사용자 「네 의견대로 다 진행해」
   진단: ① 숨기기·옮기기만 7번, 지운 것 0 ② 숨기면 「뭐가 있는지 모름」, 꺼내면 「복잡」 ③ 쉬운 화면/전체 메뉴 = 지도 두 장 ④ 연구실·PB 도구·고객용이 한 앱
   처방(이 파일 ux1112b.js — ux1112.js 는 🧭 계절 시계 + nav2.js GROUPS + ux1105c.js EZ()):
     A. 화면 하나 — 쉬운/전체 두 모드 없음
     B. 아래 탭 = 할 일 5칸: 오늘 · 보내기 · 제안서 · 상품 · 종목
     C. 🔬 연구실(#lab) — 포트·성적표·확률·신호·운세를 지우지 않고 한곳에
     D. 첫 화면 「할 수 있는 일」 지도 — 타일마다 무엇을 해 주는지 한 문장 + 오늘 살아 있는 숫자
     F. 디자인: 카드 한 종류 · 강조색 하나 · 위 작은 탭 알약 모양
   되돌리기: GitHub 브랜치 backup-before-job5-1112 */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function gj(u){ if (!window.getJSON) return Promise.resolve(null); return getJSON(u + "?" + Math.floor(Date.now() / 300000), {ttl: 300000}).catch(function(){ return null; }); }
  function hm(s){ var m = /(\d\d):(\d\d)/.exec(String(s || "")); return m ? m[1] + ":" + m[2] : ""; }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  var S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  function sv(p){ return '<svg class="ds-ic jm-ic" viewBox="0 0 24 24" ' + S + ' aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    market: sv('<path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>'),
    send:   sv('<path d="M21 3 10.5 13.5"/><path d="M21 3l-6.5 18-4-7.5L3 9.5z"/>'),
    prop:   sv('<path d="M14 3.5H6.5A2.5 2.5 0 0 0 4 6v12a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18V9.5z"/><path d="M14 3.5v6h6"/><path d="m8.5 15.5 2.2-2.2 1.8 1.8 3-3"/>'),
    prod:   sv('<rect x="3.5" y="7" width="17" height="13" rx="2.5"/><path d="M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7"/>'),
    stock:  sv('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    lab:    sv('<path d="M9.5 3.5h5"/><path d="M10.5 3.5v6L5 18.5a1.5 1.5 0 0 0 1.3 2.2h11.4a1.5 1.5 0 0 0 1.3-2.2l-5.5-9v-6"/><path d="M8 15h8"/>')
  };

  /* ───────── D. 첫 화면 「할 수 있는 일」 지도 ───────── */
  var JOBS = [
    ["market",   "market", "시황 리포트",     "오늘 어디로 돈이 몰리는지"],
    ["send",     "send",   "고객에게 한 장", "오늘 시장 그림 · 고객 질문 답"],
    ["prop",     "prop",   "제안서 만들기",   "이름·금액만 넣으면 PDF·PPT"],
    ["bond",     "prod",   "상품 찾기",       "채권 · 펀드 · ELS · 배당"],
    ["onepager", "stock",  "종목 보기",       "검색 · 리포트 · 수급"],
    ["lab",      "lab",    "연구실",          "포트 · 신호 · 세금 계산 · 운세"]
  ];
  var LIVE = {}, LT = 0;
  function liveNow(){
    try { var it = ((window.M && M.cats && M.cats.market) || [])[0]; if (it && it.id) LIVE.market = md(it.id) + " 올라옴"; } catch(x) {}
    try { var n = 0, W = (window.store && store.wl) || {}; for (var k in W) n++; LIVE.onepager = n ? "내 종목 " + n + "개" : "2만 종목·ETF"; } catch(x) {}
    LIVE.lab = "깊이 보고 싶을 때";
  }
  function live(){
    if (Date.now() - LT < 120000) return; LT = Date.now();
    Promise.all([gj("archive/x/pbbrief.json"), gj("archive/x/proposal.json"), gj("archive/x/products.json"), gj(RM + "qa.json")]).then(function(r){
      var b = r[0], p = r[1], d = r[2], q = r[3];
      if (b && (b.one || b.talk)) LIVE.send = (hm(b.asof) || "오늘") + " 준비됨";
      if (p && p.forms) LIVE.prop = "기본폼 " + p.forms.length + "종";
      if (d){ var el = (d.els || []).length, kb = (d.krw || []).length; LIVE.bond = el ? "ELS " + el + "개 청약" : kb ? "채권 " + kb + "개" : ""; }
      QA = q || QA; paint(); hubPaint();
    });
  }
  function mapHtml(){
    return '<p class="jm-h">할 수 있는 일 <small>아래 탭과 같아요</small></p>' + (window.__secTile ? __secTile() : "") + '<div class="jm-g">' + JOBS.map(function(j){
      return '<button type="button" class="jm-t' + (j[0] === "lab" ? " jm-lab" : "") + '" data-jm="' + j[0] + '">' + IC[j[1]] + '<b>' + j[2] + '</b><small>' + j[3] + '</small><em>' + e(LIVE[j[0]] || "") + '</em></button>'; }).join("") + '</div>';
  }
  function paint(){ var m = document.getElementById("jobmap"); if (!m) return; var h = mapHtml(); if (m._h !== h){ m.innerHTML = h; m._h = h; } }
  function map(){
    var m = document.getElementById("jobmap");
    if (cur() !== "home"){ return; }
    var hero = document.getElementById("ezhero"); if (!hero) return;
    if (!m){ m = document.createElement("section"); m.id = "jobmap"; m.setAttribute("data-noemo", "1"); m.setAttribute("data-cz", "done"); }
    if (hero.nextElementSibling !== m) hero.insertAdjacentElement("afterend", m);
    live(); liveNow(); paint();
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-jm]"); if (!t) return; ev.stopPropagation();
    if (typeof window.go === "function"){ go(t.dataset.jm); window.scrollTo(0, 0); }
  });

  /* ───────── B·C. 📨 보내기 · 🔬 연구실 화면 ───────── */
  var QA = null;
  var LABS = [
    ["💼 내 포트", [["port", "💼", "포트", "지금 뭘 얼마나 담나"], ["score", "📊", "성적표", "맞았나 틀렸나"]]],
    ["🎯 신호", [["sigall", "🎯", "신호 한눈에", "큰손 · 컵 · 갭 · 오를 확률 한 화면"], ["screen", "🔎", "종목 찾기", "매일 아침 거름망"], ["sigmore", "🗂", "더 보기", "예측 채점 · 상세"]]],
    ["🧪 연구", [["@bubble", "🕰", "버블 시계 · 하락장 계기판", "오늘 탭 「자세히 보기」 안"], ["@season", "🧭", "계절 시계", "5개국 지수 흐름 · 3개월 뒤 확률"], ["@analog", "🔁", "닮은 장 백테스트", "지금과 닮았던 때 12번 · 그 뒤 2년"], ["@sigprob", "🎯", "신호 확률판", "경고·바닥 신호가 켜지면 실제로 몇 %"], ["@bt40", "📏", "40주선 백테스트", "지수·대표 주식"]]],
    ["🧾 세금", [["tax", "🧾", "세무계산기", "금융소득·건보료 · 연금 · 퇴직 · 해외주식 · ISA"]]],
    ["🔮 재미", [["luck", "🔮", "오늘의 운세", "생일만 넣으면"], ["saju", "📜", "사주 리포트", "PDF 저장"], ["tarot", "🃏", "타로", "질문 → 카드"], ["lotto", "🎱", "로또", "번호 분석"]]],
    ["⚙️ 앱", [["@wlbtn", "★", "관심종목", "담아 둔 종목"], ["@uibtn", "⚙️", "보기 설정", "글자 크기 · 화면 색"], ["alarm", "🔔", "알림", "켜고 끄기"], ["idea", "💬", "의견함", "바라는 점 남기기"], ["@help", "🙋", "뭐 보면 돼요?", "궁금한 것 → 그 화면으로"]]]
  ];
  window.hubView = function(key){
    if (key === "lab") return '<div id="hub" class="hub hub-lab" data-noemo="1">' + LABS.map(function(g){
      return '<section class="card hub-c" data-cz="done"><p class="hub-h">' + g[0] + '</p><div class="hub-l">' + g[1].map(function(x){
        return '<button type="button" data-hub="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small><i>›</i></button>'; }).join("") + '</div></section>'; }).join("") +
      '<p class="hub-n">깊이 보는 화면을 한곳에 모았어요 · 지운 것은 없어요</p></div>';
    return '<div id="hub" class="hub hub-send" data-noemo="1">' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">고객에게 한 장</p><p class="hub-p" id="hubone">오늘 시장을 그림 한 장으로 — 받는 분 이름을 넣으면 그 고객만을 위한 한 장이 돼요.</p>' +
        '<button type="button" class="hub-cta" data-hub="@one">📨 고객에게 한 장 보내기</button></section>' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">고객이 이렇게 물으면 <small id="hubqn"></small></p><div class="hub-q" id="hubq"><p class="hub-p">불러오는 중…</p></div>' +
        '<button type="button" class="hub-sub" data-hub="@qa">질문 전부 보기 ›</button></section>' +
      '<section class="card hub-c" data-cz="done"><p class="hub-h">다른 것도 한 장으로</p><div class="hub-l">' +
        [["diag", "🩻", "포트 진단 한 장", "고객 보유 종목 → 쏠림 · 배당 · 고점 대비"], ["tax", "🧾", "연말 절세 한 장", "세무계산기 결과 → 그림 한 장 (금융소득·건보료·연금·퇴직·해외주식)"], ["bond", "🏦", "채권 전망도 한 장", "국고채 · 미국채 · 브라질국채"], ["prop", "📝", "제안서", "성향 → 상품 → 금액 → PDF·PPT"], ["onepager", "🔍", "종목 한 장", "종목을 찾아 위 📨 누르기"]].map(function(x){
          return '<button type="button" data-hub="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small><i>›</i></button>'; }).join("") + '</div>' +
        '<p class="hub-n">어느 화면에서든 맨 위 📨 를 누르면 그 화면이 한 장이 돼요</p></section></div>';
  };
  function hubPaint(){
    if (cur() !== "send") return;
    var q = document.getElementById("hubq"), n = document.getElementById("hubqn");
    if (q && QA && QA.items && QA.items.length){
      q.innerHTML = QA.items.slice(0, 5).map(function(x){ return '<button type="button" data-hub="@qa"><b>' + e(x.q) + '</b><small>' + e(x.a) + '</small></button>'; }).join("");
      if (n) n.textContent = md(QA.date) + " " + (QA.edition || "") + " · " + QA.items.length + "개";
    } else if (q && QA === 0) q.innerHTML = '<p class="hub-p">오늘 답이 아직 안 올라왔어요</p>';
  }
  window.hubInit = function(key){
    if (key !== "send") return;
    hubPaint();
    gj(RM + "qa.json").then(function(q){ QA = q || QA || 0; hubPaint(); });
    // 🧭 11/16 사용자 「왜 두 개의 시황 한 장이 내용이 약간 다르지?」 — 여기만 아침 시황 한 줄(pbbrief.one, 「10:00 장중 기준」이라 붙었지만 실제는 11/13 종가 판정)을 따로 써서
    //   오늘 탭 결론 두 줄(verdict.js)과 문구가 달랐음 → 같은 결론 상자(data-vd)를 그대로 씀
    var o = document.getElementById("hubone"); if (o && !o.querySelector("[data-vd]")) o.innerHTML = '<div data-vd></div><small>받는 분 이름을 넣으면 그 고객만을 위한 한 장이 돼요</small>';
  };
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#hub [data-hub]"); if (!t) return; ev.stopPropagation();
    hubGo(t.dataset.hub);
  });
  window.__hubGo = hubGo;   // 🔎 11/12 메뉴 찾기(gsearch.js)도 같은 길로
  function hubGo(k){
    if (k === "@one"){ if (window.__onepage) (__onepage.chooser || __onepage.go)(null); return; }
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }
    if (k === "@wlbtn" || k === "@uibtn"){ var o = document.getElementById(k.slice(1)); if (o) o.click(); return; }
    if (k === "@help"){ if (window.__ezHelp) __ezHelp(); return; }
    if (k === "@bt40"){ location.href = "bt40.html"; return; }
    if (k === "@bubble" || k === "@season" || k === "@sigprob" || k === "@analog"){ var tid = k === "@season" ? "season" : k === "@sigprob" ? "sigprob" : k === "@analog" ? "analog" : "bubble"; if (typeof window.go === "function") go("home");
      var n = 0; (function seek(){ var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open");
        if (hb && !hb.classList.contains("ez-open") && op) op.click();
        var x = document.getElementById(tid); if (x){ x.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++n < 30) setTimeout(seek, 300); })(); return; }
    if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); }
  }

  /* ───────── 아래 탭 아이콘(보내기·종목) — design.js 는 이름으로 찾는데 새 이름이 없어서 ───────── */
  function icons(){
    var b = document.getElementById("bnav"); if (!b) return;
    [].forEach.call(b.querySelectorAll("button[data-g]"), function(x){ var i = x.querySelector(".i"), g = x.dataset.g;
      if (i && (g === "send" || g === "stock") && !i.querySelector("svg")) i.innerHTML = IC[g].replace(" jm-ic", ""); });
  }

  /* ───────── F. 디자인 ───────── */
  var st = document.createElement("style");
  st.textContent =
    /* 지도 */
    "#jobmap{margin:0 0 12px}.jm-h{margin:6px 4px 8px;font-size:15px;font-weight:800}.jm-h small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".jm-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".jm-t{font:inherit;text-align:left;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:13px 14px 12px;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-height:112px;min-width:0}" +
    ".jm-t:active{transform:scale(.98)}.jm-t .jm-ic{width:24px;height:24px;color:#3182f6;margin-bottom:6px}" +
    ".jm-t b{font-size:16px;font-weight:800;letter-spacing:-.3px}.jm-t small{font-size:13px;color:var(--sub);line-height:1.35;word-break:keep-all}" +
    ".jm-t em{font-style:normal;font-size:12.5px;font-weight:700;color:#3182f6;margin-top:auto;padding-top:6px;min-height:22px;word-break:keep-all}" +
    ".jm-t.jm-lab{background:transparent;border-style:dashed}.jm-t.jm-lab .jm-ic,.jm-t.jm-lab em{color:var(--sub)}" +
    /* 허브 */
    ".hub .hub-c{padding:16px 16px 14px}.hub .hub-c>.hub-h{margin:0 0 10px;font-size:16px;font-weight:800;display:flex;align-items:baseline;gap:8px}.hub .hub-c>.hub-h small{font-size:12.5px;font-weight:500;color:var(--sub)}" +
    ".hub-p{margin:0 0 12px;font-size:15px;line-height:1.5;word-break:keep-all}.hub-p small{color:var(--sub);font-size:13px}" +
    ".hub-cta{display:block;width:100%;font:inherit;font-size:17px;font-weight:800;padding:14px 12px;border:0;border-radius:14px;background:#3182f6;color:#fff;cursor:pointer}.hub-cta:active{transform:scale(.98)}" +
    ".hub-sub{display:block;width:100%;font:inherit;font-size:14.5px;font-weight:700;padding:11px;margin-top:8px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);cursor:pointer}" +
    ".hub-q button{display:block;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:11px 2px;cursor:pointer}.hub-q button:first-child{border-top:0;padding-top:2px}" +
    ".hub-q b{display:block;font-size:15.5px;font-weight:700}.hub-q small{display:block;font-size:13px;color:var(--sub);line-height:1.4;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".hub-l button{display:grid;grid-template-columns:30px 1fr 14px;column-gap:8px;align-items:center;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:11px 2px;cursor:pointer}.hub-l button:first-child{border-top:0}" +
    ".hub-l span{grid-row:1/3;font-size:21px;text-align:center}.hub-l b{font-size:15.5px;font-weight:700}.hub-l small{grid-column:2;font-size:13px;color:var(--sub)}.hub-l i{grid-row:1/3;grid-column:3;font-style:normal;color:var(--sub);font-size:18px}" +
    ".hub-n{margin:10px 2px 0;font-size:12.5px;color:var(--sub);text-align:center}" +
    "html[data-tab=send] #main>.hero,html[data-tab=lab] #main>.hero,html[data-tab=diag] #main>.hero,html[data-tab=sigall] #main>.hero{display:none!important}" +
    /* 위 작은 탭 — 알약 하나로 통일(탭마다 다른 색 대신 글자색 하나) */
    ".tabs.sub .tab-lab{color:var(--sub)!important;font-weight:600!important}" +
    /* ⚙ 설정은 머리줄에 다시(11/09 에 🙋 안으로 넣었는데 🙋 가 없어져서) */
    "html[data-ez=easy] body header #uibtn{display:inline-flex!important;align-items:center;justify-content:center}" +
    /* 아래 탭 5칸 — 고르게 */
    "#bnav{display:flex}#bnav>button{flex:1 1 0;min-width:0}";
  document.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; try { map(); } catch(x) { console.warn("jobmap", x); } try { icons(); } catch(x) {}
    try { document.documentElement.setAttribute("data-tab", cur()); } catch(x) {} }
  function soon(){ if (!q) q = setTimeout(tick, 150); }
  function start(){ tick(); try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {} setInterval(tick, 3000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
;
/* ======== ux1112c.js ======== */
/* CH Investing — ⬆ 언제나 접기 · ← 언제나 뒤로 (11/12 사용자 「언제나 접기, 뒤로 버튼 좀 만들어 좀」)
   ① ← 뒤로: 어느 화면에서든 늘 보이게 (첫 화면·스크롤 중에도 숨지 않음) — 동작은 그대로(goBack: 보던 곳 → 탭 첫 화면 → 오늘 → 맨 위)
   ② ▴ 접기(떠 있는 버튼): 지금 보고 있는 펼친 칸(details · 오늘 「자세히 보기」 · 「전체 보기」 카드)이 화면에 있으면 뒤로 버튼 옆에 나타남
      누르면 그 칸을 접고 그 칸 머리로 돌아감
   ③ 길게 펼친 칸(details) 맨 아래에도 「▴ 접기」 한 줄 */
(function(){
  "use strict";
  var FB = null, TGT = null, T = 0;
  function vis(el){ return el && el.offsetParent !== null && el.getClientRects().length; }
  // 펼쳐진 칸들 → {el, close}
  function opens(){
    var L = [];
    [].forEach.call(document.querySelectorAll("details[open]"), function(d){
      if (!vis(d) || d.offsetHeight < 140 || d.closest("#sheet .sh-top")) return;
      L.push({el: d, close: function(){ d.open = false; }, head: d.querySelector(":scope > summary") || d});
    });
    var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open");
    if (hb && op && hb.classList.contains("ez-open") && vis(hb)) L.push({el: hb, close: function(){ op.click(); }, head: op});
    [].forEach.call(document.querySelectorAll(".xs-cl"), function(b){
      var c = b.parentNode; if (!c || c.classList.contains("xs-clamp") || !/접기/.test(b.textContent) || !vis(c)) return;
      L.push({el: c, close: function(){ b.click(); }, head: c});
    });
    [].forEach.call(document.querySelectorAll("[data-ezclamp].ez-open1"), function(c){ if (vis(c)) L.push({el: c, close: function(){ c.classList.remove("ez-open1"); }, head: c}); });
    return L;
  }
  // 화면 가운데를 지나는 펼친 칸 중 가장 안쪽(작은) 것
  function pick(){
    var vh = window.innerHeight, best = null;
    opens().forEach(function(o){
      var r = o.el.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.35 && (!best || o.el.offsetHeight < best.el.offsetHeight)) best = o;
    });
    return best;
  }
  function upd(){
    T = 0;
    if (!FB) return;
    TGT = pick();
    FB.classList.toggle("on", !!TGT);
    var b = document.getElementById("backbtn");
    if (b){ b.classList.add("on"); b.classList.remove("root", "hid"); }
  }
  function soon(){ if (!T) T = setTimeout(upd, 120); }
  function make(){
    if (FB || !document.body) return;
    FB = document.createElement("button"); FB.id = "foldbtn"; FB.type = "button"; FB.setAttribute("aria-label", "접기");
    FB.innerHTML = "▴<span>접기</span>";
    FB.onclick = function(){
      var o = TGT || pick(); if (!o) return;
      var h = o.head; o.close();
      setTimeout(function(){ try { (h && vis(h) ? h : o.el).scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} soon(); }, 30);
    };
    document.body.appendChild(FB);
    upd();
  }
  // ③ 펼친 details 맨 아래 「▴ 접기」
  document.addEventListener("toggle", function(ev){
    var d = ev.target; if (!d || d.tagName !== "DETAILS") return;
    if (d.open && !d.querySelector(":scope > .fold-end")){
      setTimeout(function(){
        if (!d.open || d.offsetHeight < 320 || d.querySelector(":scope > .fold-end")) return;
        var b = document.createElement("button"); b.type = "button"; b.className = "fold-end"; b.textContent = "▴ 접기";
        b.onclick = function(e){ e.preventDefault(); e.stopPropagation(); d.open = false; var s = d.querySelector(":scope > summary") || d; try { s.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} };
        d.appendChild(b);
      }, 60);
    }
    soon();
  }, true);
  window.addEventListener("scroll", soon, {passive: true});
  window.addEventListener("resize", soon);
  document.addEventListener("click", function(){ setTimeout(soon, 80); }, true);
  window.addEventListener("popstate", function(){ setTimeout(soon, 200); });
  // 뒤로 버튼을 숨기는 다른 규칙(첫 화면 · 스크롤 내릴 때 · 쉬운 첫 화면)보다 이기게
  var css = document.createElement("style");
  css.textContent =
    "html body #backbtn,html body #backbtn.root,html.fab-hide body #backbtn,html body #backbtn.hid,html.ez-home[data-ez] body #backbtn,html[data-ez][data-tab] body #backbtn.root.on,html[data-ui][data-ez] body #backbtn.root,html[data-wow][data-wow][data-wow] body #backbtn.root,html[data-wow][data-wow][data-wow] body #backbtn{display:flex!important;opacity:1!important;transform:none!important;pointer-events:auto!important}" +
    "#foldbtn{position:fixed;right:118px;bottom:calc(env(safe-area-inset-bottom) + 74px);z-index:80;display:none;align-items:center;gap:6px;border:1px solid var(--line,rgba(127,127,127,.3));" +
      "background:rgba(18,24,38,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--text,#fff);font:inherit;font-size:18px;font-weight:800;padding:9px 14px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.35)}" +
    "#foldbtn span{font-size:14px}#foldbtn.on{display:flex}#foldbtn:active{transform:scale(.96)}" +
    ":root[data-ui=light] #foldbtn{background:#fff;color:#141a26;border-color:#dde2ea}" +
    ".fold-end{display:block;width:100%;margin:10px 0 2px;padding:9px;border:0;border-radius:10px;background:rgba(127,127,127,.1);color:var(--sub,#888);font:inherit;font-size:13px;font-weight:800;cursor:pointer}";
  document.head.appendChild(css);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", make); else make();
  setInterval(function(){ if (!document.hidden) soon(); }, 1500);
})();
;
/* ======== ux1112d.js ======== */
/* 🎯 11/12 신호 확률판 — 사용자 「어떤 신호가 왔을 때 현금 비중을 늘리는지 · 어떤 바닥 신호들이 왔을 때 주식 비중을 늘리는지 — 확률을 좀 높여줘」
   market-strategy-report/market/prob.json (src/prob_bt.py · 평일 07:20·16:50) → 🏠 오늘 홈, 🧭 계절 시계 아래
   신호마다 「켜진 날 뒤에 실제로 얼마나 자주 빠졌나/올랐나」를 9개 지수에서 센 것 · 앞(~2012)·뒤(2013~) 둘 다 통한 신호만 「믿을 만」 */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/prob.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"};
  function bar(p, base){
    if (p == null) return "";
    var hot = base != null && p >= base + 8, cool = base != null && p <= base - 5;
    return '<span class="sp-bar"><i class="' + (hot ? "h" : cool ? "c" : "") + '" style="width:' + Math.max(3, Math.min(100, p)) + '%"></i>' + (base != null ? '<u style="left:' + Math.min(100, base) + '%"></u>' : '') + '</span>';
  }
  function pick(v){ return v ? (v.p_mk != null ? v.p_mk : v.p) : null; }
  function row(m, P){
    var d = m.t.down, c = m.t.crash, pd = pick(d), pc = pick(c), nm = P.wn || {};
    var word = pd == null ? "" : pd >= (d.base_mk || d.base) + 8 ? "평소보다 높음" : pd <= (d.base_mk || d.base) - 5 ? "평소보다 낮음" : "평소 수준";
    var own = ((P.targets.down.per_market[m.key] || {}).top || []).concat(((P.targets.crash.per_market[m.key] || {}).top || []));
    var seen = {}, ownL = own.filter(function(x){ if (seen[x.k]) return false; seen[x.k] = 1; return true; }).slice(0, 5);
    var on = {}; (d.on || []).concat(c ? c.on : [], d.own_on || [], c ? c.own_on : []).forEach(function(k){ on[k] = 1; });
    return '<details class="sp-r"><summary><span class="sp-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>고점보다 ' + String(m.dd).replace("-", "−") + '% · 경고 ' + d.n + '/' + d.of + '개 켜짐</small></span>' +
      '<span class="sp-p"><b>' + (pd != null ? pd + "%" : "–") + '</b><small>평소 ' + Math.round(d.base_mk || d.base) + '% · ' + e(word) + '</small>' + bar(pd, d.base_mk || d.base) + '</span></summary>' +
      '<div class="sp-x"><p><b>6개월 안에 10% 넘게 더 빠질 확률</b> ' + (pd != null ? pd + "%" : "–") + ' (이 지수 평소 ' + Math.round(d.base_mk || d.base) + '%' + (d.p_mk_ep ? ' · 이런 때가 과거 ' + d.p_mk_ep + '번' : '') + ')</p>' +
        (c ? '<p><b>1년 안에 20% 넘게 더 빠질 확률</b> ' + (pc != null ? pc + "%" : "–") + ' (이 지수 평소 ' + Math.round(c.base_mk || c.base) + '%)</p>' : '') +
        '<p class="sp-ch"><b>지금 켜진 경고</b> ' + (Object.keys(on).length ? Object.keys(on).map(function(k){ return '<i class="on">🔴 ' + e(nm[k] || k) + '</i>'; }).join("") : '<i>없음</i>') + '</p>' +
        (ownL.length ? '<p class="sp-own"><b>이 지수에서 잘 맞았던 경고</b> (앞·뒤 기간 둘 다)</p><ul class="sp-ul">' + ownL.map(function(x){ return '<li>' + (on[x.k] ? "🔴 " : "⚪ ") + e(x.name) + ' <em>켜지면 ' + x.p_on + '% · ' + x.lift + '배</em></li>'; }).join("") + '</ul>'
          : '<p class="sp-own">이 지수만 따로 보면 앞·뒤 기간 둘 다 통한 경고 신호가 없어요 — 전체 지수 통계로 봤어요.</p>') +
      '</div></details>';
  }
  function sigRows(T){
    return (T.signals || []).filter(function(x){ return !x.thin; }).slice(0, 8).map(function(x){
      return '<tr class="' + (x.good ? "pk" : "") + '"><td>' + (x.good ? "✅ " : "") + e(x.name) + '</td><td>' + x.p_on + '%</td><td>' + x.lift + '배</td><td>' + (x.lift_a == null ? "–" : x.lift_a) + ' / ' + (x.lift_b == null ? "–" : x.lift_b) + '</td></tr>'; }).join("");
  }
  // 📦 11/12 나라별 「다른 자료」(싼지 비싼지 · 빚 · 심리 · 자금) — market/alt.json (src/alt_bt.py)
  var TGN = {down: "6개월 안 −10%", crash: "1년 안 −20%", up12: "1년 뒤 플러스", good: "6개월 좋은 매수 자리", up12_deep: "1년 뒤 플러스(고점 −20% 아래서)", good_deep: "6개월 좋은 매수 자리(고점 −20% 아래서)"};
  function altHtml(A){
    if (!A || !A.markets) return "";
    var onW = [], onB = [];
    var rows = A.markets.map(function(m){
      var gs = (m.signals || []).filter(function(r){ return r.good && r.good.length; });
      var li = gs.map(function(r){
        var tg = r.good[0], v = r.t[tg];
        if (r.now) (r.side === "W" ? onW : onB).push(m.name);
        return '<li class="' + (r.now ? "on" : "") + '">' + (r.side === "W" ? "🚨" : "🌱") + ' <b>' + e(r.name) + '</b>' + (r.now ? ' <i>지금 켜짐</i>' : '') + '<em>' + e(TGN[tg] || tg) + ' ' + v.p_on + '% (평소 ' + v.base + '%) · ' + v.years + '개 해에 걸쳐 · ' + String(v.from).slice(0, 4) + '년~</em></li>'; }).join("");
      var x = m.x5 || {};
      return '<div class="sp-am"><div class="sp-amh">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>5년 평균선보다 ' + (x.gap > 0 ? "+" : "") + String(x.gap).replace("-", "−") + '% · 자기 과거 중 ' + (x.pct >= 50 ? "비싼 쪽 상위 " + (100 - x.pct) : "싼 쪽 하위 " + x.pct) + '%</small></div>' +
        (li ? '<ul class="sp-al">' + li + '</ul>' : '<p class="sp-an">통과한 신호 없음 (' + (m.signals || []).length + '개 시험)</p>') + '</div>';
    }).join("");
    var uq = function(a){ return a.filter(function(x, i){ return a.indexOf(x) === i; }); };
    return '<details class="sp-t" open><summary>📦 나라별 다른 자료 — 싼지 비싼지 · 빚 · 심리 · 자금</summary>' +
      '<p>주가 말고 다른 종류의 자료로 만든 신호 <b>' + A.n_tested + '개 중 ' + A.n_good + '개</b>가 앞·뒤 기간 둘 다 통했어요. ' +
        (uq(onW).length ? '지금 🚨 경고가 켜진 곳: <b>' + e(uq(onW).join(" · ")) + '</b>. ' : '') + (uq(onB).length ? '지금 🌱 바닥 쪽이 켜진 곳: <b>' + e(uq(onB).join(" · ")) + '</b>.' : '지금 🌱 바닥 쪽이 켜진 곳은 없어요.') + '</p>' + rows +
      '<small>자료: 🇺🇸 CAPE·PER·PBR·개인 심리(AAII) · 🇰🇷 예탁금·신용잔고·반대매매(금융투자협회)·외국인 매매·환율 · 🇨🇳 PER·PBR·주식−채권 금리차·시총÷GDP·융자잔고·북향 자금 · 🇭🇰 남향 자금 · 전부 5년 평균선. 「비싸다·싸다」는 그날까지 자기 과거와 비교(미래 값 안 봄). 못 받은 것: 🇰🇷 코스피 PER·PBR(KRX 로그인 필요) · 🇯🇵 닛케이 PER·PBR 과거 · 🇺🇸 신용융자·실업률(막힘)</small></details>';
  }
  window.__sigProbCard = function(P){
    if (!P || !P.targets || !P.now) return "";
    var T = P.targets, D = T.down, C = T.crash, G = T.good, U = T.up12;
    var ms = P.now.filter(function(m){ return m.t && m.t.down; }); if (!ms.length) return "";
    var hi = ms.filter(function(m){ var d = m.t.down, p = pick(d); return p != null && p >= (d.base_mk || d.base) + 8; });
    var lead = hi.length ? "지금 경고가 평소보다 높은 곳 — " + hi.map(function(m){ return m.name; }).join(" · ") : "지금 평소보다 경고가 높은 지수는 없어요";
    var auc = D.oos_gb || D.oos_logit || {};
    var inDD = ms.filter(function(m){ return m.t.good; });
    return '<section class="card sp" id="sigprob" data-cz="done"><div class="sp-h">🎯 신호 확률판 <small>' + e(String(P.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="sp-lead">' + e(lead) + '</p>' +
      '<p class="sp-sum">신호가 켜진 날 뒤에 실제로 얼마나 자주 빠졌는지를 9개 지수 약 30년치로 센 숫자예요. <b>숫자 = 앞으로 6개월 안에 지금보다 10% 넘게 더 빠진 적이 있던 비율</b> · 세로 줄은 그 지수의 평소 값.</p>' +
      ms.map(function(m){ return row(m, P); }).join("") +
      altHtml(window.__altData) +
      '<details class="sp-t"><summary>🚨 어떤 신호에 현금을 늘리나 — 경고 신호 성적</summary>' +
        '<p>경고 ' + (D.signals || []).length + '개 중 <b>앞·뒤 기간 둘 다 통한 건 ' + (D.good || []).length + '개</b>예요. 켜져도 평소 ' + D.base + '% → 50% 안팎으로, 조금 올라가는 정도예요.</p>' +
        '<table><tr><th>신호 (6개월 안 −10%)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(D) + '</table>' +
        '<p>믿을 만한 신호가 겹치면: ' + (D.ladder_good || []).map(function(x){ return (x.lo === x.hi ? x.lo : x.lo + "개↑").toString().replace(/^(\d+)$/, "$1개") + " " + (x.p == null ? "–" : x.p + "%"); }).join(" → ") + '</p>' +
        '<table><tr><th>신호 (1년 안 −20% 큰 하락)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(C) + '</table>' +
        '<small>평소 = ' + D.base + '% (6개월 −10%) · ' + C.base + '% (1년 −20%) · ✅ = 앞(~2012)·뒤(2013~) 둘 다 1.15배 넘고 지수 3분의 2 넘게 같은 방향</small></details>' +
      '<details class="sp-t"><summary>🌱 어떤 바닥 신호에 주식을 늘리나 — 바닥 신호 성적</summary>' +
        '<p><b>바닥 신호 ' + (G.signals || []).length + '개 중 앞·뒤 기간 둘 다 통한 건 ' + (G.good || []).length + '개예요.</b> 고점보다 20% 넘게 빠진 날에 샀을 때 평소 확률은 — 6개월 뒤 좋은 자리(플러스이고 그 사이 −10% 더 안 빠짐) <b>' + G.base + '%</b> · 1년 뒤 플러스 <b>' + U.base + '%</b>. 신호가 켜지길 기다려도 이 숫자가 꾸준히 올라가지 않았어요.</p>' +
        '<table><tr><th>신호 (6개월 좋은 매수 자리)</th><th>켜지면</th><th>평소 대비</th><th>앞 / 뒤</th></tr>' + sigRows(G) + '</table>' +
        (inDD.length ? '<p>지금 고점 −20% 아래: ' + inDD.map(function(m){ return e(m.name); }).join(" · ") + ' — 과거 같은 깊이에서 1년 뒤 플러스였던 비율 ' + inDD.map(function(m){ var u = m.t.up12; return e(m.name) + " " + (u && u.base_mk != null ? Math.round(u.base_mk) + "%" : "–"); }).join(" · ") + '</p>' : '') +
        '</details>' +
      '<p class="sp-note">얼마나 믿을 수 있나: 해마다 그 전 자료만으로 맞히게 하는 시험에서 맞히는 힘은 ' + (auc.auc != null ? auc.auc : "–") + '이었어요(0.5 = 동전 던지기 · 1 = 다 맞힘). 큰 하락(−20%)은 ' + ((C.oos_logit || {}).auc != null ? C.oos_logit.auc : "–") + '. 즉 「확률이 조금 기운다」 정도이고 맞히는 도구는 아니에요. 날마다 겹치는 표본이라 독립된 사건 수는 훨씬 적어요 · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".sp-h{font-size:17px;font-weight:900}.sp-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.sp-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.sp-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.sp-sum b{color:var(--text,inherit)}" +
    ".sp-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.sp-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px}.sp-r>summary::-webkit-details-marker{display:none}" +
    ".sp-n{min-width:0;flex:1}.sp-n b{font-size:14.5px;font-weight:900}.sp-n small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px}.sp-p{flex:0 0 46%;text-align:right}.sp-p>b{font-size:17px;font-weight:900}.sp-p>small{font-size:11px;color:var(--sub);font-weight:700;margin-left:5px}" +
    ".sp-bar{display:block;position:relative;height:7px;border-radius:99px;background:rgba(127,127,127,.18);margin-top:4px;overflow:visible}.sp-bar i{display:block;height:100%;border-radius:99px;background:#9aa3b2}.sp-bar i.h{background:#e5484d}.sp-bar i.c{background:#30a46c}.sp-bar u{position:absolute;top:-3px;width:2px;height:13px;background:var(--text,#111);border-radius:1px}" +
    ".sp-x{margin-top:8px;font-size:13px;line-height:1.55;word-break:keep-all}.sp-x p{margin:4px 0 0}.sp-ch i{display:inline-block;font-style:normal;font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:999px;background:rgba(127,127,127,.12);color:var(--sub);margin:2px 3px 0 0}.sp-ch i.on{background:rgba(229,72,77,.13);color:#d13438}" +
    ".sp-own{color:var(--sub);font-size:12.5px}.sp-ul{margin:4px 0 0;padding:0;list-style:none;font-size:12.5px}.sp-ul li{padding:2px 0}.sp-ul em{font-style:normal;color:var(--sub);margin-left:4px}" +
    ".sp-t{margin-top:10px;border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px}.sp-t>summary{cursor:pointer;font-size:13.5px;font-weight:900;list-style:none}.sp-t>summary::-webkit-details-marker{display:none}.sp-t p{margin:8px 0 6px;font-size:13px;line-height:1.55;word-break:keep-all}" +
    ".sp-t table{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0 8px}.sp-t th,.sp-t td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.sp-t th:first-child,.sp-t td:first-child{text-align:left;white-space:normal;word-break:keep-all}.sp-t tr.pk td{font-weight:900}.sp-t small{display:block;font-size:11px;color:var(--sub);line-height:1.4}" +
    ".sp-am{margin-top:10px;padding-top:8px;border-top:1px solid rgba(127,127,127,.18)}.sp-amh b{font-size:13.5px;font-weight:900}.sp-amh small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px}" +
    ".sp-al{list-style:none;margin:6px 0 0;padding:0}.sp-al li{font-size:12.5px;line-height:1.45;padding:4px 0;word-break:keep-all}.sp-al li b{font-weight:800}.sp-al li em{display:block;font-style:normal;color:var(--sub);font-size:11.5px}.sp-al li i{font-style:normal;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:99px;background:rgba(229,72,77,.14);color:#d13438;margin-left:3px}.sp-an{margin:4px 0 0!important;font-size:12px!important;color:var(--sub)}" +
    ".sp-note{margin:10px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}";
  document.head.appendChild(css);
  fetch(RAW.replace("prob.json", "alt.json") + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(A){
    if (!A) return; window.__altData = A; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__sigProbData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
;
/* ======== ux1112e.js ======== */
/* 🔁 11/12 닮은 장 백테스트 — 사용자 「이번엔 지금 장과 유사했던 때들로만 백테스트 · 성격이 다른 장들까지 다 넣으니 확률이 안 올라간 것 같아」
   market-strategy-report/market/analog.json (src/analog_bt.py · 평일 07:40) → 🏠 오늘 홈, 🎯 신호 확률판 아래 · 🔬 연구실 바로가기
   지수마다: 지금과 닮았던 때 12번 → 그 뒤 2년 길(그림) · 더 빠졌나 · 방식 16개 성적 */
(function(){
  "use strict";
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/analog.json";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return v == null ? "–" : String(v).replace("-", "−"); }
  function sg(v){ return v == null ? "–" : (v > 0 ? "+" : "") + mn(v) + "%"; }
  var FL = {kr: "🇰🇷", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"};
  var SHORT = {lump: "지금 다 사기", cash: "계속 현금", dca6: "6개월 나눠 사기", dca12: "12개월 나눠 사기", dip: "더 빠질 때마다 사기", half200: "절반 지금 + 절반 200일선 회복 때", third: "3분의 1씩 나눠(지금·50일선·200일선)",
               floor: "바닥 신호마다 3분의 1씩", bear: "하락장이면 현금 · 풀리면 주식", ma10: "10개월선 위로 올라오면 사기", ddl: "−10% 절반 · −20% 현금", deep: "10개월선 + 많이 싸면 절반", mom12: "1년 전보다 높으면 주식",
               step3: "신호 3개 계단", a200: "200일선 위로 올라오면 사기", a50: "50일선 위로 올라오면 사기"};
  function verdict(m){
    var f = m.fwd, L = {}; m.rules.forEach(function(r){ L[r.k] = r; });
    var lump = L.lump, n = f.n;
    if (lump.beat_cash >= Math.ceil(n * 0.75) && lump.y2_med >= 15) return ["buy", "사는 쪽이 유리했음", "닮은 때 " + n + "번 중 " + lump.beat_cash + "번, 지금 사서 2년 들고 있는 게 현금보다 나았어요"];
    if (f.more10 >= Math.ceil(n * 0.75) && lump.beat_cash <= n / 2) return ["wait", "더 기다리는 쪽이 유리했음", "닮은 때 " + n + "번 중 " + f.more10 + "번, 그 뒤 10% 넘게 더 빠졌어요"];
    return ["mid", "반반 — 나눠서", "닮은 때 " + n + "번 중 " + lump.beat_cash + "번만 지금 사는 게 현금보다 나았어요"];
  }
  function chart(m){
    var W = 300, H = 130, pl = 30, pr = 6, pt = 8, pb = 18, all = [], k;
    m.episodes.forEach(function(ep){ ep.path.forEach(function(v){ all.push(v); }); });
    var lo = Math.min(-10, Math.min.apply(null, all)), hi = Math.max(10, Math.min(150, Math.max.apply(null, all)));
    var X = function(i){ return pl + i * (W - pl - pr) / 24; }, Y = function(v){ return pt + (hi - Math.min(hi, v)) * (H - pt - pb) / (hi - lo); };
    var g = '<line class="an-z" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '"/>';
    [lo, 0, hi].forEach(function(v){ g += '<text class="an-ax" x="' + (pl - 4) + '" y="' + (Y(v) + 3).toFixed(1) + '" text-anchor="end">' + (v > 0 ? "+" : "") + mn(Math.round(v)) + '%</text>'; });
    [[0, "지금"], [12, "1년 뒤"], [24, "2년 뒤"]].forEach(function(t){ g += '<text class="an-ax" x="' + X(t[0]).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="' + (t[0] === 0 ? "start" : t[0] === 24 ? "end" : "middle") + '">' + t[1] + '</text>'; });
    m.episodes.forEach(function(ep){ g += '<polyline class="an-l ' + ((ep.y2 != null ? ep.y2 : ep.y1) > 0 ? "u" : "d") + '" points="' + ep.path.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") + '"/>'; });
    var med = [];
    for (k = 0; k <= 24; k++){ var vs = m.episodes.filter(function(ep){ return ep.path.length > k; }).map(function(ep){ return ep.path[k]; }).sort(function(a, b){ return a - b; }); if (vs.length < 4) break; med.push(vs.length % 2 ? vs[(vs.length - 1) / 2] : (vs[vs.length / 2 - 1] + vs[vs.length / 2]) / 2); }
    g += '<polyline class="an-m" points="' + med.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") + '"/>';
    return '<svg class="an-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + e(m.name) + ' 닮은 때 ' + m.episodes.length + '번의 그 뒤 2년">' + g + '</svg>';
  }
  function row(m){
    var f = m.fwd, n = f.n, v = verdict(m), now = m.now, best = m.rules[0], L = {}; m.rules.forEach(function(r){ L[r.k] = r; });
    var show = m.rules.slice(0, 5); ["lump", "cash"].forEach(function(k){ if (show.indexOf(L[k]) < 0) show.push(L[k]); });
    var tb = show.map(function(r, i){ return '<tr class="' + (i === 0 ? "pk" : "") + '"><td>' + e(SHORT[r.k] || r.name) + '</td><td>' + sg(r.y2_med) + '</td><td>' + sg(r.y2_worst) + '</td><td>' + r.beat_cash + '/' + r.n + '</td></tr>'; }).join("");
    var eps = m.episodes.map(function(ep){ return '<li>' + (FL[ep.nat] || "") + ' ' + e(ep.name) + ' <b>' + e(ep.date.slice(0, 7).replace("-", "년 ") + "월") + '</b><em>더 ' + mn(ep.more) + '% · 1년 뒤 ' + sg(ep.y1) + ' · 2년 뒤 ' + sg(ep.y2) + '</em></li>'; }).join("");
    var sens = (m.sens || []).map(function(s){ return "닮은 때 " + s.n + "번으로 보면 1등 「" + (SHORT[s.top[0][0]] || s.top[0][0]) + "」 · 지금 다 사기 " + sg(s.lump[0]) + " (현금보다 " + s.lump[1] + "/" + s.n + ")"; }).join(" / ");
    return '<details class="an-r"><summary><span class="an-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>2년 새 ' + sg(now.run) + ' 오른 뒤 고점보다 ' + mn(now.dd) + '% · ' + now.since + '일째</small></span>' +
      '<span class="an-v ' + v[0] + '"><b>' + e(v[1]) + '</b></span></summary>' +
      '<div class="an-x"><p class="an-why">' + e(v[2]) + '</p>' + chart(m) +
      '<p class="an-cap">가는 선 = 닮았던 때 하나하나(그날 샀다면) · 굵은 선 = 가운데 길</p>' +
      '<ul class="an-f"><li><small>그 뒤 가장 깊이 더 빠진 폭(가운데값)</small><b>' + mn(f.more_med) + '%</b></li><li><small>10% 넘게 더 빠진 때</small><b>' + f.more10 + '/' + n + '번</b></li><li><small>바닥까지 걸린 기간</small><b>약 ' + Math.max(1, Math.round(f.to_low_med / 21)) + '개월</b></li><li><small>1년 뒤 플러스 · 2년 뒤 플러스</small><b>' + f.y1_up + '/' + n + ' · ' + f.y2_up + '/' + n + '번</b></li></ul>' +
      '<p class="an-b"><b>가장 나았던 방식 — ' + e(SHORT[best.k] || best.name) + '</b> · 2년 뒤 가운데값 ' + sg(best.y2_med) + ' · 가장 나빴던 때 ' + sg(best.y2_worst) + ' · 현금보다 나았던 때 ' + best.beat_cash + '/' + best.n + '번</p>' +
      '<table><tr><th>방식(닮은 날부터 2년)</th><th>가운데</th><th>최악</th><th>현금보다</th></tr>' + tb + '</table>' +
      '<details class="an-e"><summary>닮았던 때 ' + n + '번 보기</summary><ul>' + eps + '</ul><small>' + e(sens) + '</small></details></div></details>';
  }
  function pickHtml(A){
    var P = A.markets.filter(function(m){ return m.pick; }); if (!P.length) return "";
    var rows = P.map(function(m){ var p = m.pick;
      return '<li class="' + (p.ok ? "" : "no") + '"><span>' + FL[m.nat] + ' <b>' + e(m.name) + '</b></span>' +
        (p.ok ? '<em>주식 ' + p.stock + '%</em><small><b>' + e(SHORT[p.k] || p.rule) + '</b> · 다음: ' + e(p.next) + '</small>'
              : '<em class="no">정하지 않음</em><small>통하는 방식이 없었어요 — 한 번에 사지 말고 나눠 사기만 참고</small>') + '</li>'; }).join("");
    return '<div class="an-pk"><div class="an-pkh">📌 지금 규칙 <small>닮은 장에서 2년 뒤 가운데값이 가장 좋았던 방식</small></div><ul>' + rows + '</ul>' +
      '<p>고른 방식이 우연인지 보려고 닮은 때 하나를 빼고 고른 뒤 그 하나에 적용해 봤어요(12번 반복). 그 결과가 계속 현금(2년 약 ' + (A.cash2 || 4) + '%)보다 못한 곳은 정하지 않았어요. 🇰🇷🇺🇸 네 시장은 하락장 계기판의 현금 몫에 그대로 반영돼요. 💼 기본 포트는 S&P500 200일선 규칙이 먼저예요 · 🔁 닮은 장 규칙은 국내 주식과 시장별 참고용 · 고르는 방식이 바뀌면 알림이 가요.</p></div>';
  }
  window.__analogCard = function(A){
    if (!A || !A.markets || !A.markets.length) return "";
    var by = {buy: [], wait: [], mid: []}; A.markets.forEach(function(m){ by[verdict(m)[0]].push(m.name); });
    var lead = [by.wait.length ? "더 기다리는 쪽: " + by.wait.join("·") : "", by.buy.length ? "사는 쪽: " + by.buy.join("·") : "", by.mid.length ? "나눠서: " + by.mid.join("·") : ""].filter(Boolean).join(" / ");
    return '<section class="card an" id="analog" data-cz="done"><div class="an-h">🔁 닮은 장 백테스트 <small>' + e(String(A.at || "").slice(5, 16).replace("-", "/")) + ' · 종가 기준</small></div>' +
      '<p class="an-lead">' + e(lead) + '</p>' +
      '<p class="an-sum">지금 장과 <b>닮았던 때만</b> 골라 그 뒤 2년을 봤어요. 닮았다 = 고점 전 급등 폭 · 고점에서 빠진 폭 · 고점 뒤 며칠째 · 200일선·5년 평균선과의 거리 · 출렁임이 지금과 가까운 날(9개 지수 + 나스닥100 + 반도체 지수 · 1985년~ · 지수마다 12번).</p>' +
      pickHtml(A) + A.markets.map(row).join("") +
      '<p class="an-note">닮은 때가 12번뿐이라 「12번 중 몇 번」으로만 읽어 주세요. 닮음의 기준에 싼지 비싼지(PER·CAPE)·금리는 들어 있지 않아요. 현금 연 2% · 바꿀 때 0.1% · 가격지수(배당 제외) · 매수·매도 추천 아님</p></section>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".an-pk{margin:6px 0 10px;padding:10px 12px;border-radius:14px;background:var(--bg2,rgba(127,127,127,.08))}.an-pkh{font-size:15px;font-weight:900}.an-pkh small{display:block;font-size:12px;font-weight:600;color:var(--sub);margin-top:2px}.an-pk ul{list-style:none;margin:8px 0 6px;padding:0}.an-pk li{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:7px 0;border-top:1px solid var(--line,rgba(127,127,127,.18));font-size:14px}.an-pk li em{font-style:normal;font-weight:900}.an-pk li em.no{color:var(--sub);font-weight:700}.an-pk li small{grid-column:1/-1;font-size:12.5px;line-height:1.45;color:var(--sub);word-break:keep-all}.an-pk li small b{color:var(--text)}.an-pk p{margin:0;font-size:12px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".an-h{font-size:17px;font-weight:900}.an-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:6px}.an-lead{margin:6px 0 4px;font-size:15px;font-weight:800;line-height:1.45;word-break:keep-all}.an-sum{margin:0 0 8px;font-size:13px;line-height:1.55;color:var(--sub);word-break:keep-all}.an-sum b{color:var(--text,inherit)}" +
    ".an-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.an-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}.an-r>summary::-webkit-details-marker{display:none}" +
    ".an-n{min-width:0}.an-n b{font-size:14.5px;font-weight:900}.an-n small{display:block;font-size:11.5px;color:var(--sub);font-weight:700;margin-top:1px;word-break:keep-all}.an-v{flex:0 0 auto}.an-v b{display:inline-block;font-size:12.5px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap}" +
    ".an-v.buy b{background:rgba(48,164,108,.16);color:#1f8a57}.an-v.wait b{background:rgba(229,72,77,.15);color:#d13438}.an-v.mid b{background:rgba(240,160,60,.2);color:#b86a00}" +
    ".an-x{margin-top:8px}.an-why{margin:0 0 6px;font-size:13px;font-weight:700;line-height:1.5;word-break:keep-all}.an-svg{width:100%;height:auto;display:block}.an-l{fill:none;stroke-width:1;opacity:.55}.an-l.u{stroke:#30a46c}.an-l.d{stroke:#e5484d}.an-m{fill:none;stroke:var(--text,#111);stroke-width:2.6;stroke-linejoin:round}.an-z{stroke:rgba(127,127,127,.5);stroke-dasharray:3 3}.an-ax{font-size:8.5px;fill:var(--sub,#888);font-weight:700}" +
    ".an-cap{margin:2px 0 6px;font-size:11px;color:var(--sub)}.an-f{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}.an-f li{background:rgba(127,127,127,.08);border-radius:10px;padding:6px 8px}.an-f small{display:block;font-size:11px;color:var(--sub);font-weight:700;line-height:1.3;word-break:keep-all}.an-f b{font-size:15px;font-weight:900}" +
    ".an-b{margin:10px 0 4px;font-size:13px;line-height:1.55;word-break:keep-all}.an-x table{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0}.an-x th,.an-x td{padding:4px 3px;text-align:right;border-bottom:1px solid rgba(127,127,127,.15);white-space:nowrap}.an-x th:first-child,.an-x td:first-child{text-align:left;white-space:normal;word-break:keep-all}.an-x tr.pk td{font-weight:900}" +
    ".an-e{margin-top:6px}.an-e>summary{cursor:pointer;font-size:12.5px;font-weight:800;color:var(--accent,#3182f6)}.an-e ul{list-style:none;margin:6px 0;padding:0;font-size:12px}.an-e li{padding:3px 0;word-break:keep-all}.an-e li em{display:block;font-style:normal;color:var(--sub);font-size:11.5px}.an-e small{display:block;font-size:11px;color:var(--sub);line-height:1.45;word-break:keep-all}" +
    ".an-note{margin:10px 0 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}";
  document.head.appendChild(css);
  fetch(RAW + "?t=" + Math.floor(Date.now() / 18e5)).then(function(r){ return r.ok ? r.json() : null; }).then(function(S){
    if (!S) return; window.__analogData = S; if (window.__h2apply) try { __h2apply(); } catch(x) {}
  }).catch(function(){});
})();
;
/* ======== ux1113.js ======== */
/* 📏 11/13 A11/13-1 「선이 내려오는 날 — 가격이 가만히 있어도 50일선·장기선이 지금 값에 닿는 날짜」 (사용자 「진행」)
   규칙의 기준선(50일선·200일선)은 지난 n개 종가의 평균이라 옛 종가가 하루씩 빠지며 스스로 움직임 →
   만드는 쪽 bear_gate.py 가 bear.json markets[]/more[] 에 meet 칸(최근 60일 가격·선 + 「오늘 종가 그대로면」 선의 앞길 + 닿는 거래일·날짜)을 붙이고 앱은 그리기만.
   붙는 곳: ① 🏠 「📏 언제 다시 사나 ▾」 펼침 — 그림(가격선·선 두 가닥 + 그대로면 점선)과 「오늘 당장이면 +x% ↔ 그대로면 약 n거래일 뒤」 한 문장(본체)
           ② 🐻 계기판 시장 줄·체크리스트·🌏 일본·중국·홍콩 줄 — 한 토막씩(글자만)
   예측 아님 · 산수 · 「닿음 ≠ 사기」(규칙 조건은 종가 기준 그대로) · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return String(v).replace("-", "−"); }
  function pct(v){ return (v > 0 ? "+" : "") + mn(v) + "%"; }
  function num(v){ return v == null ? "–" : mn(Math.round(v).toLocaleString("en-US")); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  var LN = {m50: "50일선", m200: "장기 평균선(200일)", dd20: "고점 −20% 선"};
  function lname(L){ return LN[L.k] || L.k; }

  /* 한 문장 — 두 날 사이 */
  function sentence(L, short){
    var ln = lname(L), lv = num(L.lv);
    if (L.k === "dd20") return "📏 " + ln + "(" + lv + ")까지 " + pct(L.need) + " · 이 선은 움직이지 않아요";
    var slope = L.slope != null ? " · 선은 요즘 하루 약 " + (L.slope > 0 ? "+" : "") + mn(L.slope) + "p" : "";
    if (L.above){   // 가격이 선 위 — 선이 올라와 닿으면 「아래로」 시작
      return "📏 지금 " + ln.replace(/\(.*\)/, "") + "(" + lv + ")보다 " + pct(-L.need) + " 위" + (L.days ? " · 가격이 그대로면 약 " + L.days + "거래일 뒤(" + md(L.date) + ") 선이 올라와 닿아요" : " · 가격이 그대로면 " + (L.proj ? L.proj.length : 130) + "거래일 안엔 안 닿아요") + slope + (short ? "" : " · 예측 아님, 산수");
    }
    var a = "오늘 당장이면 " + pct(L.need) + "(" + lv + ")";
    var b = L.days ? "가격이 그대로면 약 " + L.days + "거래일 뒤(" + md(L.date) + ") 선이 내려와 닿아요" : "가격이 그대로면 " + (L.proj ? L.proj.length : 130) + "거래일 안엔 안 닿아요 — 가격이 올라야 만나요";
    return "📏 " + ln + " — " + a + " ↔ " + b + (short ? "" : " · 실제는 이 사이 어딘가" + slope + " · 예측 아님, " + L.n + "개 종가 평균의 산수");
  }

  /* 그림 — 최근 60일 가격선·선 + 오른쪽 「그대로면」 점선 두 가닥 + 닿는 점 */
  function chart(L, name){
    var H = L.hist || []; if (H.length < 10) return "";
    var P = L.px, proj = (L.proj || []).slice(0, L.days || Math.min(60, (L.proj || []).length));
    if (!L.days && proj.length > 60) proj = proj.slice(0, 60);
    var N = H.length + proj.length, W = 340, HT = 128, pl = 6, pr = 64, pt = 12, pb = 20;
    var vals = [P]; H.forEach(function(h){ vals.push(h[0], h[1]); }); proj.forEach(function(v){ vals.push(v); });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
    function X(i){ return pl + (W - pl - pr) * i / Math.max(1, N - 1); }
    function Y(v){ return pt + (HT - pt - pb) * (1 - (v - lo) / (hi - lo)); }
    var px = H.map(function(h, i){ return X(i).toFixed(1) + "," + Y(h[0]).toFixed(1); }).join(" ");
    var ma = H.map(function(h, i){ return X(i).toFixed(1) + "," + Y(h[1]).toFixed(1); }).join(" ");
    var i0 = H.length - 1, xt = X(i0);
    var ppx = proj.length ? [xt.toFixed(1) + "," + Y(P).toFixed(1)].concat(proj.map(function(v, j){ return X(i0 + j + 1).toFixed(1) + "," + Y(P).toFixed(1); })).join(" ") : "";
    var pma = proj.length ? [xt.toFixed(1) + "," + Y(H[i0][1]).toFixed(1)].concat(proj.map(function(v, j){ return X(i0 + j + 1).toFixed(1) + "," + Y(v).toFixed(1); })).join(" ") : "";
    var xe = X(N - 1), ye = Y(P);
    var meet = L.days ? '<circle class="mt-dot" cx="' + xe.toFixed(1) + '" cy="' + ye.toFixed(1) + '" r="4"/><text class="mt-t mt-td" x="' + (xe + 6).toFixed(1) + '" y="' + (ye - 6).toFixed(1) + '">약 ' + e(md(L.date)) + '</text><text class="mt-t" x="' + (xe + 6).toFixed(1) + '" y="' + (ye + 8).toFixed(1) + '">' + L.days + '거래일 뒤</text>' : '';
    var lab = '<text class="mt-t" x="' + (xt + 4).toFixed(1) + '" y="' + (Y(H[i0][1]) + (H[i0][1] > P ? -5 : 11)).toFixed(1) + '">' + e(lname(L).replace(/\(.*\)/, "")) + ' ' + e(num(L.lv)) + '</text>' +
              '<text class="mt-t" x="' + (xt + 4).toFixed(1) + '" y="' + (ye + (H[i0][1] > P ? 11 : -5)).toFixed(1) + '">지금 ' + e(num(P)) + '</text>';
    return '<svg class="mt-svg" viewBox="0 0 ' + W + ' ' + HT + '" role="img" aria-label="' + e(name) + ' 가격과 ' + e(lname(L)) + ' — 가격이 그대로면 선이 닿는 날">' +
      '<line class="mt-ax" x1="' + xt.toFixed(1) + '" y1="' + pt + '" x2="' + xt.toFixed(1) + '" y2="' + (HT - pb) + '"/>' +
      '<polyline class="mt-ma" points="' + ma + '"/><polyline class="mt-px" points="' + px + '"/>' +
      (proj.length ? '<polyline class="mt-ma mt-dash" points="' + pma + '"/><polyline class="mt-px mt-dash" points="' + ppx + '"/>' : '') + meet + lab +
      '<text class="mt-t mt-x" x="' + pl + '" y="' + (HT - 5) + '">' + H.length + '거래일 전</text><text class="mt-t mt-x" x="' + xt.toFixed(1) + '" y="' + (HT - 5) + '" text-anchor="middle">오늘</text>' +
      (proj.length ? '<text class="mt-t mt-x" x="' + xe.toFixed(1) + '" y="' + (HT - 5) + '" text-anchor="end">그대로면 →</text>' : '') + '</svg>';
  }

  /* ① 📏 언제 다시 사나 펼침 — 한국 시장 전부(그림 + 문장) */
  function block(m){
    var M = (m.meet && m.meet.lines) || []; if (!M.length) return "";
    return '<div class="mt-box"><div class="mt-h">' + (m.nat === "kr" ? "🇰🇷" : m.nat === "us" ? "🇺🇸" : "") + ' <b>' + e(m.name) + '</b> <small>선이 내려오는 날 · ' + e(md(m.meet.asof)) + ' 종가</small></div>' +
      M.map(function(L){ return (L.k === "dd20" ? "" : chart(L, m.name)) + '<p class="mt-s">' + e(sentence(L)) + '</p>'; }).join("") + '</div>';
  }
  window.__meetHtml = function(w, BR){
    var A = ((BR && BR.markets) || []).filter(function(m){ return m.nat === "kr" && m.meet && m.meet.lines && m.meet.lines.length; });
    if (!A.length && w && w.meet) A = [w];
    if (!A.length) return "";
    return '<div class="mt-wrap">' + A.map(block).join("") + '<p class="mt-n">선은 지난 50·200개 종가의 평균이라 옛 종가가 빠지면서 날마다 움직여요 — 「그대로면」은 오늘 종가가 안 변한다는 가정의 산수(예측 아님) · 닿았다고 사는 게 아니라 규칙 조건(종가 기준)은 그대로 · 휴장일 안 셈 · 사라·팔라는 뜻 아님</p></div>';
  };
  /* 요약 줄 꼬리 「· 그대로면 약 1/8」 */
  window.__meetTail = function(w){
    var L = ((w && w.meet && w.meet.lines) || []).filter(function(x){ return x.days && !x.above; })[0];
    return L ? " · 그대로면 약 " + md(L.date) : "";
  };
  /* ② 한 토막(글자만) — 계기판 체크리스트·시장별 방식 줄·🌏 줄 */
  window.__meetLine = function(m, cls){
    var M = (m && m.meet && m.meet.lines) || []; if (!M.length) return "";
    return M.map(function(L){ return '<p class="' + (cls || "mt-line") + '">' + e(sentence(L, true)) + '</p>'; }).join("");
  };

  var css = document.createElement("style"); css.id = "ux1113css";
  css.textContent =
    ".mt-wrap{margin:8px 0 4px}.mt-box{margin:0 0 10px;padding:8px 10px;border:1px solid var(--line,#e5e7eb);border-radius:12px}" +
    ".mt-h{font-size:13px;margin-bottom:4px}.mt-h small{color:var(--sub,#888);font-weight:600;margin-left:4px}" +
    ".mt-svg{width:100%;height:auto;display:block;margin:2px 0 4px}.mt-px{fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}.mt-ma{fill:none;stroke:#2f80ed;stroke-width:2;stroke-linejoin:round}" +
    ".mt-dash{stroke-dasharray:4 3;stroke-width:1.6;opacity:.85}.mt-ax{stroke:rgba(127,127,127,.5);stroke-dasharray:2 3}.mt-dot{fill:#e5484d}" +
    ".mt-t{font-size:9.5px;fill:var(--sub,#888);font-weight:700}.mt-td{fill:#e5484d;font-size:10.5px}.mt-x{font-size:9px;font-weight:600}" +
    ".mt-s{margin:2px 0 6px;font-size:13px;line-height:1.5;word-break:keep-all}.mt-n{margin:2px 0 0;font-size:11.5px;color:var(--sub,#888);line-height:1.45;word-break:keep-all}" +
    ".mt-line{margin:4px 0 0;font-size:12.5px;line-height:1.5;word-break:keep-all;color:var(--text,#111)}.bmm .mt-line{display:block;margin:2px 0 0;font-size:11.5px;color:var(--sub,#888)}" +
    ":root[data-ui=light] .mt-ma{stroke:#2f80ed}:root:not([data-ui=light]) .mt-ma{stroke:#5aa0ff}";
  document.head.appendChild(css);
})();
;
/* ======== ux1116.js ======== */
/* 🧊 11/16 냉정 분석 5차 — 사용자 「1,5 진행하고 8번은 후자만 진행」
   ① 🩻 포트 진단 한 장 (#diag · 한 장 탭 위 작은 탭) — 고객 보유 종목·금액 → 쏠림 · 나라 · 업종 · 배당 · 1년 고점 대비를 그림 한 장(1080px)으로.
      자료: opdata d/(종목) · x/(ETF) · p/(종가) · archive/x/dv(배당 이력, 배당비교와 같은 식). 입력은 이 휴대폰(localStorage dg_rows)에만.
      사실만 적음(「~하세요」 없음 · 투자 권유 아님). 사모·비상장은 「그 밖의 자산」으로 금액만.
   ⑤ 🖼 고객 질문 답 → 그림 한 장 — 「💬 고객이 이렇게 물으면」 답 아래 단추(mine.js data-qimg → __qaImg).
      글이 길어 근거는 꼬리표 + 첫 문장만, 「그래서 이렇게」·「바뀌는 조건」까지. 받는 분 이름 칸.
   ⑧ 🎯 신호 한눈에 (#sigall) — 큰손·컵·갭·오를 확률을 한 화면에 5줄씩. 네 화면은 지우지 않고 「전체 보기」로(nav2.js sigd 묶음 · 위 작은 탭 「‹ 신호」).
   끄기: index.html 📦list 에서 이 줄을 빼고 nav2.js·ux1112b.js 의 11/16 줄을 되돌림 */
(function(){
  var D = document, RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function toast(m){ var d = D.createElement("div"); d.className = "ch-toast"; d.textContent = m; D.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 600000}) : fetch(u).then(function(r){ if (!r.ok) throw 0; return r.json(); })).catch(function(){ return null; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function won(man){   // 만원 → 「1억 2,500만원」
    man = Math.round(man); if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만원" : " 원"); }
    return man.toLocaleString("ko-KR") + "만원"; }
  function isUS(sym){ return /^[A-Z][A-Z0-9.\-]{0,6}$/.test(sym) && !/\.(KS|KQ|T|SS|SZ|HK)$/.test(sym); }
  function idxMap(){ return (typeof opLoadIdx === "function" ? opLoadIdx() : Promise.resolve([])).then(function(L){ var m = {}; (L || []).forEach(function(r){ m[r.sym] = r; }); return m; }).catch(function(){ return {}; }); }
  function pbname(){ var n = ls("pbname"); if (n != null) return n; n = prompt("한 장 위에 넣을 내 이름 (예: 김OO PB · 비워도 돼요)", "") || ""; ls("pbname", n.trim().slice(0, 30)); return ls("pbname") || ""; }
  function recent(){ try { var a = JSON.parse(ls("op_clients") || "[]"); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 8) : []; } catch(x){ return []; } }
  function saveCl(c){ c = String(c || "").trim(); if (!c) return; var a = recent().filter(function(x){ return x !== c; }); a.unshift(c); ls("op_clients", JSON.stringify(a.slice(0, 8))); }

  /* ═════════ 그림 도구 (1080px · onepage.js 와 같은 색·글꼴) ═════════ */
  var W = 1080, MX = 60, CW = W - MX * 2;
  var INK = "#141414", SUB = "#6a6f7a", MUT = "#9aa0ab", LINE = "#e6e8ec", UP = "#d6453d", DN = "#2f6fdd", ACC = "#1f2d4d", BLUE = "#3182f6", BG = "#f7f7f5", TILE = "#ffffff";
  var F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  var PAL = ["#1f2d4d", "#3b5bdb", "#d9a441", "#4aa37a", "#b0567e", "#8a94a8", "#c9ced8"];
  function font(g, w, s){ g.font = w + " " + s + "px " + F; }
  function rr(g, x, y, w, h, r, fill){ g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }
  function lines(g, text, w, max){   // 낱말(띄어쓰기) 단위로 줄바꿈 — 긴 낱말만 글자 단위
    var out = [], line = "", toks = String(text == null ? "" : text).split(/(\s+)/);
    toks.forEach(function(tk){
      if (!tk) return;
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
  function canvas(h){ var c = D.createElement("canvas"); c.width = W; c.height = h; var g = c.getContext("2d"); g.textBaseline = "alphabetic"; g.fillStyle = BG; g.fillRect(0, 0, W, h); return [c, g]; }
  function head(g, client, name){   // 맨 위 한 줄 — 「○○ 고객님께」 · 날짜 · 보내는 사람
    var d = kst(), ds = d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + "일월화수목금토"[d.getUTCDay()] + ")";
    var cl = String(client || "").trim(); if (cl) cl = /님$/.test(cl) ? cl : cl + " 고객님";
    if (!cl){ g.fillStyle = MUT; font(g, 600, 24); g.fillText(ds, MX, 70); if (name){ g.textAlign = "right"; g.fillStyle = SUB; font(g, 700, 24); g.fillText(name, W - MX, 70); g.textAlign = "left"; } return 100; }
    g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, cl + "께", CW * 0.55), MX, 72);
    g.textAlign = "right"; g.fillStyle = SUB; font(g, 600, 22); g.fillText(fit(g, ds.replace(/^\d+년 /, "") + (name ? " · " + name + " 드림" : ""), CW * 0.42), W - MX, 70); g.textAlign = "left"; return 104; }
  function foot(c, y, note){   // 내용만큼만 잘라 내고 맨 아래 안내 줄
    var H = Math.max(1350, y + 150), o = canvas(H), g = o[1]; g.drawImage(c, 0, 0, W, y, 0, 0, W, y);
    g.fillStyle = LINE; g.fillRect(MX, H - 104, CW, 2); g.fillStyle = MUT; font(g, 500, 21);
    para(g, (note ? note + " · " : "") + "참고용 자료 · 투자 권유 아님 · 과거 성과는 미래 수익을 보장하지 않아요 · 투자 판단과 책임은 본인에게 있어요", MX, H - 68, CW, 28, 3);
    return o[0]; }
  function sec(g, y, t, sub){ g.fillStyle = INK; font(g, 800, 32); g.fillText(t, MX, y + 34); if (sub){ var w = g.measureText(t).width; g.fillStyle = MUT; font(g, 500, 22); g.fillText(fit(g, sub, CW - w - 20), MX + w + 16, y + 32); } return 56; }
  function toFile(c, fname){ return new Promise(function(ok){ var done = false, end = function(b){ if (done) return; done = true; ok(b ? new File([b], fname, {type: b.type || "image/png"}) : null); };
    setTimeout(function(){ end(null); }, 8000); try { c.toBlob(function(b){ end(b); }, "image/png"); } catch(x){ end(null); } }); }
  function send(c, fname, title){ return toFile(c, fname).then(function(f){ if (!f){ toast("그림을 만들지 못했어요 — 다시 눌러 주세요"); return; }
    if (window.__onepage && __onepage.ready) __onepage.ready([f], title); else { var a = D.createElement("a"); a.href = URL.createObjectURL(f); a.download = fname; a.click(); } }); }

  /* ═════════ ⑤ 고객 질문 답 → 그림 한 장 ═════════ */
  function firstSent(t, lim){   // 첫 문장(들)만 — lim 글자 안에서 문장 끝으로
    t = String(t || "").replace(/\s+/g, " ").trim(); if (t.length <= lim) return t;
    var cut = -1, re = /(요|다|음|함|임)\.(\s|$)|[.!?](\s|$)| — /g, m;
    while ((m = re.exec(t))){ var p = m[0] === " — " ? m.index : m.index + m[0].replace(/\s+$/, "").length; if (p > lim) break; if (p >= 24) cut = p; }
    if (cut > 0) return t.slice(0, cut).trim();
    var s = t.slice(0, lim), sp = s.lastIndexOf(" "); return (sp > lim * 0.6 ? s.slice(0, sp) : s) + "…"; }
  function qaCanvas(x, A, client, name){
    var o = canvas(4200), c = o[0], g = o[1], y = head(g, client, name) + 6;
    // 질문
    rr(g, MX, y, 64, 64, 18, BLUE); g.fillStyle = "#fff"; font(g, 800, 38); g.textAlign = "center"; g.fillText("Q", MX + 32, y + 46); g.textAlign = "left";
    g.fillStyle = INK; font(g, 800, 50); var ql = lines(g, x.q, CW - 84, 3); ql.forEach(function(t, i){ g.fillText(t, MX + 84, y + 50 + i * 62); }); y += Math.max(64, ql.length * 62) + 30;
    // 결론
    font(g, 700, 34); var al = lines(g, x.a, CW - 72, 9), ah = al.length * 50 + 96;
    rr(g, MX, y, CW, ah, 26, ACC); g.fillStyle = "rgba(255,255,255,.66)"; font(g, 700, 22); g.fillText("결론", MX + 36, y + 46);
    g.fillStyle = "#fff"; font(g, 700, 34); al.forEach(function(t, i){ g.fillText(t, MX + 36, y + 94 + i * 50); }); y += ah + 38;
    // 근거
    var P = (x.pts || []).slice(0, 4);
    if (P.length){ y += sec(g, y, "근거 " + P.length + "가지");
      P.forEach(function(p, i){
        font(g, 500, 28); var tl = lines(g, firstSent(p.t, 118), CW - 108, 4), h = 50 + tl.length * 40 + 30;
        rr(g, MX, y, CW, h, 20, TILE);
        rr(g, MX + 24, y + 24, 44, 44, 22, "#eef3ff"); g.fillStyle = BLUE; font(g, 800, 24); g.textAlign = "center"; g.fillText(String(i + 1), MX + 46, y + 55); g.textAlign = "left";
        g.fillStyle = INK; font(g, 800, 28); g.fillText(fit(g, p.k || "", CW - 108), MX + 84, y + 54);
        g.fillStyle = "#3d424d"; font(g, 500, 28); tl.forEach(function(t, k){ g.fillText(t, MX + 84, y + 96 + k * 40); });
        y += h + 12; }); y += 22; }
    // 그래서 이렇게
    var Aa = (x.act || []).slice(0, 3);
    if (Aa.length){ y += sec(g, y, "그래서 이렇게");
      Aa.forEach(function(a){ font(g, 500, 28); var tl = lines(g, a[1], CW - 60, 3), h = 58 + tl.length * 40 + 22;
        rr(g, MX, y, CW, h, 20, "#eef3ff"); g.fillStyle = BLUE; font(g, 800, 26); g.fillText(fit(g, a[0], CW - 60), MX + 30, y + 46);
        g.fillStyle = INK; font(g, 600, 28); tl.forEach(function(t, k){ g.fillText(t, MX + 30, y + 88 + k * 40); }); y += h + 12; }); y += 22; }
    // 바뀌는 조건
    if (x.flip){ font(g, 500, 27); var fl = lines(g, firstSent(x.flip, 130), CW - 60, 4), fh = 62 + fl.length * 38 + 22;
      rr(g, MX, y, CW, fh, 20, "#fff6dd"); g.fillStyle = "#8a5a00"; font(g, 800, 26); g.fillText("이 답이 바뀌는 조건", MX + 30, y + 46);
      g.fillStyle = "#4a3a12"; font(g, 500, 27); fl.forEach(function(t, k){ g.fillText(t, MX + 30, y + 88 + k * 38); }); y += fh + 20; }
    var bs = (A && A.date ? Number(A.date.slice(5, 7)) + "/" + Number(A.date.slice(8)) + " " + (A.edition || "") + " 시황 기준" : "");
    return foot(c, y, bs.trim());
  }
  window.__qaImg = function(x, A){
    var old = D.getElementById("qimgs"); if (old) old.remove();
    var R = recent(), d = D.createElement("div"); d.id = "qimgs"; d.className = "no-clp"; d.setAttribute("data-xc", "1"); d.setAttribute("data-cz", "done");
    d.innerHTML = '<div class="qi-in"><b>🖼 답을 그림 한 장으로</b><p>' + e(x.q) + '</p>' +
      '<label>💌 받는 분 <input id="qicl" maxlength="20" placeholder="고객 이름 (비워도 돼요)" autocomplete="off"></label>' +
      (R.length ? '<div class="qi-rc">' + R.map(function(n){ return '<button type="button" data-qicl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<div class="qi-b"><button type="button" class="qi-x">닫기</button><button type="button" class="qi-go">그림 만들기</button></div></div>';
    D.body.appendChild(d);
    d.addEventListener("click", function(ev){ ev.stopPropagation();
      var t = ev.target; if (t === d || (t.closest && t.closest(".qi-x"))){ d.remove(); return; }
      var r = t.closest && t.closest("[data-qicl]"); if (r){ D.getElementById("qicl").value = r.dataset.qicl; return; }
      if (t.closest && t.closest(".qi-go")){ var cl = D.getElementById("qicl").value.trim().slice(0, 20), nm = pbname(); saveCl(cl); d.remove();
        try { send(qaCanvas(x, A, cl, nm), (cl ? cl + "_" : "") + "질문답_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", "고객 질문 답 한 장"); } catch(z){ console.error(z); toast("그림을 만들지 못했어요"); } }
    });
  };

  /* ═════════ ① 포트 진단 한 장 ═════════ */
  var SECKO = {technology: "IT", it: "IT", financial_services: "금융", financials: "금융", financial: "금융", healthcare: "헬스케어", health_care: "헬스케어", consumer_cyclical: "경기소비재", consumer_discretionary: "경기소비재",
    consumer_defensive: "필수소비재", consumer_staples: "필수소비재", industrials: "산업재", basic_materials: "소재", materials: "소재", energy: "에너지", utilities: "유틸리티", real_estate: "부동산", realestate: "부동산",
    communication_services: "통신·미디어", communication: "통신·미디어" };
  function secKo(k){ var n = String(k || "").toLowerCase().replace(/[\s\-]+/g, "_"); return SECKO[n] || (k ? String(k) : "기타"); }
  var MKN = {KR: "한국", US: "미국", JP: "일본", CN: "중국", HK: "홍콩"};
  function etfRegion(t, mkt){ t = String(t || "");
    if (/미국|S&P|나스닥|NASDAQ|다우|필라델피아|Russell|러셀|U\.S\.|\bUS\b|Treasury|미국채/i.test(t)) return "미국";
    if (/차이나|중국|항셍|CSI|과창판|심천|China|Hang Seng/i.test(t)) return "중국·홍콩";
    if (/일본|닛케이|TOPIX|Japan|Nikkei/i.test(t)) return "일본";
    if (/인도|India|Nifty/i.test(t)) return "인도";
    if (/글로벌|선진국|전세계|World|Global|ACWI|신흥국|Emerging/i.test(t)) return "글로벌";
    if (/유럽|유로|Europe|Euro/i.test(t)) return "유럽";
    return mkt === "HK" || mkt === "CN" ? "중국·홍콩" : (MKN[mkt] || "기타"); }
  function etfClass(t, assets){ t = String(t || "");
    var b = 0; (assets || []).forEach(function(a){ if (/bond|채권/i.test(a.k)) b += +a.w || 0; });
    if (b >= 60 || /채권|국고채|국채|회사채|단기자금|머니마켓|CD금리|KOFR|Treasury|Bond|종합채|통안/i.test(t)) return "채권·현금";
    if (/금현물|골드|Gold|금선물|KRX금/i.test(t)) return "금";
    return "주식"; }
  var DVC = {}, PSC = {};
  function dvOf(sym){ var sh = opShard(sym); if (!DVC[sh]) DVC[sh] = gj("archive/x/dv/" + sh + ".json?d=" + kst().toISOString().slice(0, 10), 3600e3); return DVC[sh].then(function(j){ return (j && j[sym]) || null; }); }
  function pxOf(sym){ var sh = opShard(sym); if (window.OPP && OPP[sh]) return Promise.resolve(OPP[sh][sym] || null); if (!PSC[sh]) PSC[sh] = gj(OPD + "p/" + sh + ".json", 1800e3); return PSC[sh].then(function(j){ return (j && j[sym]) || null; }); }
  function yieldOf(y0, price, rec){   // 배당비교(divc.js)와 같은 식: 지난 1년 지급 합 ÷ 지금 가격 · 이력이 없으면 자료 배당률(15% 넘으면 못 믿어 버림)
    var h = rec && rec.h ? rec.h.slice().sort(function(a, b){ return a[0] < b[0] ? -1 : 1; }) : [];
    if (h.length && price){ var lim = Date.now() - 400 * 864e5, sum = 0; h.forEach(function(x){ if (Date.parse(x[0]) >= lim) sum += +x[1] || 0; }); var yy = sum / price * 100; if (yy >= 0 && yy < 40) return yy; }
    return y0 != null && y0 >= 0 && y0 <= 15 ? y0 : null; }
  function loadOne(row, IX){
    if (row.t !== "s") return Promise.resolve({row: row, name: row.n, cls: row.t === "c" ? "채권·현금" : row.t === "b" ? "채권·현금" : "기타", region: row.t === "o" ? "기타" : "한국", sec: null, y: null, off: null, ok: true, kind: row.t});
    var sym = row.s, r = IX[sym] || {}, etf = !!r.etf;
    return Promise.all([gj(OPD + (etf ? "x/" : "d/") + opFile(sym) + ".json", 3600e3), pxOf(sym), dvOf(sym)]).then(function(z){
      var d = z[0] || {}, p = z[1], price = p ? p[1] : (d.price != null ? d.price : null), o = {row: row, name: r.name || row.n, sym: sym, etf: etf, ok: !!z[0], kind: "s"};
      if (etf){ var t = (r.name || "") + " " + (d.name || "") + " " + (d.index || "") + " " + (d.category || "");
        o.cls = etfClass(t, d.assets); o.region = etfRegion(t, r.mkt);
        o.secs = o.cls === "주식" ? (d.sectors || []).filter(function(s){ return +s.w > 0; }).map(function(s){ return [secKo(s.k), +s.w]; }) : [];
        o.y = yieldOf(d.div_yield != null ? +d.div_yield : null, price, z[2]);
        o.off = d.w52_hi && price ? (price / d.w52_hi - 1) * 100 : null; o.tag = o.cls === "주식" ? "ETF" : "ETF · " + o.cls;
      } else { o.cls = "주식"; o.region = MKN[r.mkt] || "기타"; o.sec = d.sector ? secKo(d.sector) : null; o.tag = d.industry_ko || o.sec || "";
        o.y = yieldOf(d.dividend_yield != null ? d.dividend_yield * 100 : null, price, z[2]);
        o.off = d.week52_high && price ? (price / d.week52_high - 1) * 100 : null; }
      if (o.off != null && (o.off > 0.5 || o.off < -95)) o.off = o.off > 0 ? 0 : null;
      return o; });
  }
  function analyze(rows){
    return idxMap().then(function(IX){ return Promise.all(rows.map(function(r){ return loadOne(r, IX); })); }).then(function(L){
      var tot = 0; L.forEach(function(o){ tot += o.row.a; });
      L.forEach(function(o){ o.w = o.row.a / tot * 100; }); L.sort(function(a, b){ return b.w - a.w; });
      function agg(fn){ var m = {}; L.forEach(function(o){ (fn(o) || []).forEach(function(kv){ m[kv[0]] = (m[kv[0]] || 0) + kv[1]; }); }); return Object.keys(m).map(function(k){ return [k, m[k]]; }).sort(function(a, b){ return b[1] - a[1]; }); }
      var R = {L: L, tot: tot, n: L.length};
      R.cls = agg(function(o){ return [[o.cls, o.w]]; });
      R.eq = 0; L.forEach(function(o){ if (o.cls === "주식") R.eq += o.w; });
      R.region = agg(function(o){ return o.cls === "주식" ? [[o.region, o.w]] : []; });
      R.sec = agg(function(o){ if (o.cls !== "주식") return []; if (o.secs && o.secs.length){ var s = 0; o.secs.forEach(function(x){ s += x[1]; }); return o.secs.map(function(x){ return [x[0], o.w * x[1] / s]; }); } return [[o.sec || "기타", o.w]]; });
      var S = L.filter(function(o){ return o.kind === "s" && !o.etf; });   // 쏠림은 개별 종목 기준(ETF 는 이미 여러 종목)
      R.top1 = S[0] || null; R.top3 = 0; S.slice(0, 3).forEach(function(o){ R.top3 += o.w; });
      var dv = 0, dcov = 0; L.forEach(function(o){ if (o.y != null){ dv += o.row.a * o.y / 100; dcov += o.w; } }); R.div = dv; R.divY = dv / tot * 100; R.divCov = dcov;
      var os = 0, ow = 0, deep = 0; L.forEach(function(o){ if (o.cls === "주식" && o.off != null){ os += o.off * o.w; ow += o.w; if (o.off <= -30) deep++; } }); R.off = ow ? os / ow : null; R.offCov = ow; R.deep = deep;
      R.miss = L.filter(function(o){ return o.kind === "s" && !o.ok; }).map(function(o){ return o.name; });
      R.pts = points(R); return R; });
  }
  function points(R){
    var P = [], t = R.top1, bond = 0, gold = 0; R.cls.forEach(function(c){ if (c[0] === "채권·현금") bond = c[1]; if (c[0] === "금") gold = c[1]; });
    if (t && t.w >= 30) P.push(["쏠림", t.name + " 한 종목이 전체의 " + Math.round(t.w) + "% — 이 종목이 −20% 움직이면 전체가 −" + (t.w * 0.2).toFixed(1) + "% 움직임"]);
    else if (t && R.top3 >= 60) P.push(["쏠림", "큰 종목 3개가 전체의 " + Math.round(R.top3) + "% — 세 종목이 성적을 거의 결정함"]);
    else if (t) P.push(["쏠림", "가장 큰 종목도 " + Math.round(t.w) + "% — 한 종목 쏠림은 크지 않음"]);
    var s = R.sec[0]; if (s && R.eq > 0 && s[0] !== "기타"){ var sp = s[1] / R.eq * 100; if (sp >= 50) P.push(["업종", "주식의 " + Math.round(sp) + "%가 " + s[0] + " 한 업종 — 같이 오르고 같이 빠지는 구조"]); else P.push(["업종", "가장 큰 업종은 " + s[0] + "(주식의 " + Math.round(sp) + "%) — 업종은 나뉘어 있는 편"]); }
    var g = R.region[0]; if (g && R.eq > 0){ var gp = g[1] / R.eq * 100; if (gp >= 80) P.push(["나라", "주식의 " + Math.round(gp) + "%가 " + g[0] + " — " + (g[0] === "한국" ? "원화·한국 시장 한 곳에 묶여 있음" : g[0] === "미국" ? "달러 자산이라 환율도 같이 움직임" : "한 나라에 묶여 있음")]);
      else P.push(["나라", R.region.slice(0, 3).map(function(x){ return x[0] + " " + Math.round(x[1] / R.eq * 100) + "%"; }).join(" · ") + " (주식 안에서)"]); }
    P.push(["완충", bond + gold < 0.5 ? "채권·현금·금이 0% — 주식이 빠질 때 받쳐 줄 칸이 없음" : "채권·현금 " + Math.round(bond) + "%" + (gold >= 0.5 ? " · 금 " + Math.round(gold) + "%" : "") + " — 주식 " + Math.round(R.eq) + "%가 빠질 때 받쳐 주는 몫"]);
    if (R.off != null && R.offCov >= 20) P.push(["지금 위치", "보유 주식은 1년 고점보다 평균 " + sg(R.off, 0) + (R.deep ? " · " + R.deep + "개는 −30% 넘게 내려와 있음" : "")]);
    if (R.divCov >= 20) P.push(["배당", "지난 1년 배당 그대로면 한 해 약 " + won(R.div) + "(세전 · 배당률 " + R.divY.toFixed(1) + "%)" + (R.divY < 1 ? " — 배당보다 값 오르기를 보는 구성" : "")]);
    return P.slice(0, 6); }
  function stack(g, y, title, items, base){   // 가로로 쌓은 막대 + 범례
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(title, MX, y + 24); var x = MX, by = y + 40, tot = 0; items.forEach(function(i){ tot += i[1]; });
    if (!tot) return 0;
    items = items.slice(0, 5).concat(items.length > 5 ? [["그 외", items.slice(5).reduce(function(a, b){ return a + b[1]; }, 0)]] : []);
    g.save(); g.beginPath(); if (g.roundRect) g.roundRect(MX, by, CW, 40, 12); else g.rect(MX, by, CW, 40); g.clip();
    items.forEach(function(i, k){ var w = CW * i[1] / tot; g.fillStyle = PAL[k % PAL.length]; g.fillRect(x, by, w + 1, 40); x += w; }); g.restore();
    var lx = MX, ly = by + 76; font(g, 600, 24);
    items.forEach(function(i, k){ var t = i[0] + " " + Math.round(i[1] / (base || tot) * 100) + "%", w = g.measureText(t).width + 44; if (lx + w > W - MX){ lx = MX; ly += 38; }
      rr(g, lx, ly - 19, 20, 20, 6, PAL[k % PAL.length]); g.fillStyle = INK; font(g, 600, 24); g.fillText(t, lx + 28, ly); lx += w + 14; });
    return ly - y + 30; }
  function diagCanvas(R, client, name){
    var o = canvas(4600), c = o[0], g = o[1], y = head(g, client, name) + 10;
    g.fillStyle = INK; font(g, 800, 54); g.fillText("포트폴리오 진단", MX, y + 50); y += 78;
    g.fillStyle = SUB; font(g, 500, 26); g.fillText("보유 " + R.n + "개 · 총 " + won(R.tot) + " · " + (kst().getUTCMonth() + 1) + "/" + kst().getUTCDate() + " 최근 종가 기준", MX, y + 26); y += 56;
    // 숫자 3칸
    var K = [["가장 큰 종목", R.top1 ? Math.round(R.top1.w) + "%" : "–", R.top1 ? R.top1.name : "개별 종목 없음", R.top1 && R.top1.w >= 30 ? UP : INK],
             ["주식 비중", Math.round(R.eq) + "%", "주식 외 " + Math.round(100 - R.eq) + "%", INK],
             ["한 해 배당(세전)", R.divCov >= 20 ? "약 " + won(R.div).replace(/만원$/, "만") : "–", R.divCov >= 20 ? "배당률 " + R.divY.toFixed(1) + "%" : "자료 부족", INK]];
    var kw = (CW - 28) / 3; K.forEach(function(k, i){ var x = MX + i * (kw + 14); rr(g, x, y, kw, 168, 22, TILE);
      g.fillStyle = SUB; font(g, 600, 22); g.fillText(k[0], x + 22, y + 42);
      g.fillStyle = k[3]; var fs = 50; font(g, 800, fs); while (g.measureText(k[1]).width > kw - 40 && fs > 28){ fs -= 2; font(g, 800, fs); } g.fillText(k[1], x + 22, y + 104);
      g.fillStyle = MUT; font(g, 500, 21); g.fillText(fit(g, k[2], kw - 40), x + 22, y + 142); }); y += 168 + 40;
    // 종목별 비중
    y += sec(g, y, "무엇을 얼마나", "비중 큰 순서 · 오른쪽은 1년 고점 대비");
    var show = R.L.slice(0, 10), mx = show[0].w;
    show.forEach(function(o){
      g.fillStyle = INK; font(g, 700, 28); var nm = fit(g, o.name, 430); g.fillText(nm, MX, y + 30);
      var sub = [o.sym && isUS(o.sym) ? o.sym : "", o.tag || (o.kind === "c" ? "현금·예금" : o.kind === "b" ? "채권" : o.kind === "o" ? "그 밖의 자산" : "")].filter(Boolean).join(" · ");
      g.fillStyle = MUT; font(g, 500, 21); g.fillText(fit(g, sub, 430), MX, y + 60);
      var bx = MX + 450, bw = 300; rr(g, bx, y + 14, bw, 26, 8, "#eceef2"); rr(g, bx, y + 14, Math.max(6, bw * o.w / mx), 26, 8, o.cls === "주식" ? ACC : "#d9a441");
      g.fillStyle = INK; font(g, 800, 28); g.fillText(Math.round(o.w) + "%", bx + bw + 16, y + 38);
      g.textAlign = "right"; g.fillStyle = o.off == null ? MUT : o.off <= -30 ? DN : SUB; font(g, 600, 24); g.fillText(o.off == null ? "–" : o.off > -0.5 ? "고점 근처" : sg(o.off, 0), W - MX, y + 38); g.textAlign = "left";
      g.fillStyle = LINE; g.fillRect(MX, y + 78, CW, 1); y += 84; });
    if (R.L.length > 10){ var rest = 0; R.L.slice(10).forEach(function(o){ rest += o.w; }); g.fillStyle = SUB; font(g, 500, 23); g.fillText("그 외 " + (R.L.length - 10) + "개 · 합쳐서 " + Math.round(rest) + "%", MX, y + 26); y += 44; }
    y += 30;
    // 어디에 · 무엇으로
    y += sec(g, y, "어디에 들어 있나");
    y += stack(g, y, "자산", R.cls) + 8;
    if (R.region.length) y += stack(g, y, "나라 (주식 안에서)", R.region) + 8;
    var S5 = R.sec.filter(function(s){ return s[1] > 0; });
    if (S5.length && !(S5.length === 1 && S5[0][0] === "기타")) y += stack(g, y, "업종 (주식 안에서 · ETF 는 속을 풀어서)", S5) + 8;
    y += 26;
    // 점검
    y += sec(g, y, "눈에 띄는 점");
    R.pts.forEach(function(p){ font(g, 500, 28); var tl = lines(g, p[1], CW - 190, 3), h = Math.max(1, tl.length) * 40 + 40;
      rr(g, MX, y, CW, h, 18, TILE); rr(g, MX + 20, y + 20, 126, 40, 12, "#eef3ff"); g.fillStyle = BLUE; font(g, 800, 22); g.textAlign = "center"; g.fillText(p[0], MX + 83, y + 48); g.textAlign = "left";
      g.fillStyle = INK; font(g, 500, 28); tl.forEach(function(t, k){ g.fillText(t, MX + 166, y + 50 + k * 40); }); y += h + 10; });
    y += 14;
    if (R.vd){ var vl = String(R.vd).split("\n").map(function(t){ return t.replace(/^[^\s가-힣A-Za-z]+\s*/, ""); }); font(g, 500, 25); var all = []; vl.forEach(function(t){ all = all.concat(lines(g, t, CW - 60, 3)); });
      var vh = 64 + all.length * 36 + 22; rr(g, MX, y, CW, vh, 20, "#fff6dd"); g.fillStyle = "#8a5a00"; font(g, 800, 24); g.fillText("참고 · 지금 시장 판정" + (R.vdAsof ? " (" + R.vdAsof + " 종가)" : ""), MX + 30, y + 44);
      g.fillStyle = "#4a3a12"; font(g, 500, 25); all.forEach(function(t, k){ g.fillText(t, MX + 30, y + 84 + k * 36); }); y += vh + 10; }
    return foot(c, y, "입력한 금액과 최근 종가로 어림한 값 · 배당은 지난 1년 지급 기준");
  }

  /* 입력 화면 */
  var ROWS = [], LASTR = null;
  function load(){ try { var a = JSON.parse(ls("dg_rows") || "[]"); ROWS = Array.isArray(a) ? a.filter(function(r){ return r && r.n && r.t; }).slice(0, 40) : []; } catch(x){ ROWS = []; } }
  function save(){ ls("dg_rows", JSON.stringify(ROWS)); }
  function rowsHTML(){
    if (!ROWS.length) return '<p class="dg-e">아직 없어요 — 아래에서 종목을 찾아 넣어 주세요</p>';
    return ROWS.map(function(r, i){ return '<div class="dg-r"><div class="dg-nm"><b>' + e(r.n) + '</b>' + (r.t === "s" ? (isUS(r.s) ? '<small>' + e(r.s) + '</small>' : '') : '<small>' + (r.t === "c" ? "현금·예금" : r.t === "b" ? "채권" : "그 밖의 자산") + '</small>') + '</div>' +
      '<label><input type="text" inputmode="numeric" data-dga="' + i + '" value="' + (r.a ? Number(r.a).toLocaleString("ko-KR") : "") + '" placeholder="금액" aria-label="' + e(r.n) + ' 금액(만원)"><span>만원</span></label><button type="button" data-dgx="' + i + '" aria-label="' + e(r.n) + ' 빼기">✕</button></div>'; }).join(""); }
  function sumLine(){ var t = 0; ROWS.forEach(function(r){ t += +r.a || 0; }); return ROWS.length ? ROWS.length + "개 · 합계 " + won(t) : ""; }
  function diagView(){
    load(); var R = recent();
    return '<div id="dg" data-noemo="1"><section class="card hub-c no-clp" data-cz="done" data-xc="1"><p class="hub-h">포트 진단 한 장</p>' +
      '<p class="hub-p">고객이 가진 종목과 금액을 넣으면 쏠림 · 나라 · 업종 · 배당 · 고점 대비를 그림 한 장으로 만들어요. 넣은 내용은 이 휴대폰에만 남아요.</p>' +
      '<label class="dg-cl">💌 받는 분 <input id="dgcl" maxlength="20" placeholder="고객 이름 (비워도 돼요)" autocomplete="off"></label>' +
      (R.length ? '<div class="qi-rc">' + R.map(function(n){ return '<button type="button" data-dgcl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<div id="dgrows">' + rowsHTML() + '</div><p class="dg-sum" id="dgsum">' + sumLine() + '</p>' +
      '<div class="dg-add"><input id="dgq" placeholder="종목·ETF 찾아 넣기 (예: 삼전, 엔비디아, KODEX 200)" autocomplete="off" enterkeyhint="search" aria-label="종목 찾기"><div id="dgsug"></div></div>' +
      '<div class="dg-ch"><button type="button" data-dgadd="c">＋ 현금·예금</button><button type="button" data-dgadd="b">＋ 채권</button><button type="button" data-dgadd="o">＋ 그 밖의 자산</button></div>' +
      '<details class="dg-p"><summary>여러 종목 한 번에 붙여 넣기</summary><textarea id="dgta" rows="5" placeholder="한 줄에 하나씩 · 이름 금액(만원)&#10;삼성전자 3000&#10;엔비디아 2000&#10;KODEX 200 1500&#10;예금 2000"></textarea><button type="button" class="hub-sub" data-dgpaste="1">넣기</button></details>' +
      '<button type="button" class="hub-cta" data-dggo="1">진단하기</button>' +
      '<button type="button" class="dg-clr" data-dgclr="1">전부 지우기</button>' + '</section><div id="dgout"></div>' +
      '<p class="hub-n">금액은 대략이면 돼요 · 비중으로 계산해요 · 사모·비상장은 「그 밖의 자산」으로</p></div>';
  }
  function redraw(){ var b = D.getElementById("dgrows"); if (b) b.innerHTML = rowsHTML(); var s = D.getElementById("dgsum"); if (s) s.textContent = sumLine(); save(); }
  function addStock(r, amt){ if (ROWS.some(function(x){ return x.t === "s" && x.s === r.sym; })){ toast("이미 넣은 종목이에요"); return false; } if (ROWS.length >= 40){ toast("40개까지 넣을 수 있어요"); return false; } ROWS.push({t: "s", s: r.sym, n: r.name, a: amt || 0}); return true; }
  function sug(){ var q = D.getElementById("dgq"), box = D.getElementById("dgsug"); if (!q || !box) return; var v = q.value.trim(); if (!v){ box.innerHTML = ""; return; }
    idxMap().then(function(){ if (q.value.trim() !== v) return; var L = (typeof opSearch === "function" ? opSearch(v, 6) : []) || []; L = L.slice(0, 6);
      box.innerHTML = L.length ? L.map(function(r){ return '<button type="button" data-dgpick="' + e(r.sym) + '"><b>' + e(r.name) + '</b><small>' + e(r.sym.replace(/\.(KS|KQ)$/, "")) + (r.etf ? " · ETF" : "") + '</small></button>'; }).join("") : '<p class="dg-e">못 찾았어요 — 「＋ 그 밖의 자산」으로 넣을 수 있어요</p>'; }); }
  function paste(){ var ta = D.getElementById("dgta"); if (!ta) return; var txt = ta.value; if (!txt.trim()) return;
    idxMap().then(function(){ var ok = 0, bad = [];
      txt.split(/\n+/).forEach(function(line){ line = line.trim(); if (!line) return;
        var m = /^(.*?)[\s,\t:]+([\d,.]+)\s*(억|만원|만)?\s*$/.exec(line), nm = m ? m[1].trim() : line, amt = m ? parseFloat(m[2].replace(/,/g, "")) * (m[3] === "억" ? 10000 : 1) : 0;
        if (!nm) return;
        if (/^(현금|예금|예수금|MMF|CMA|적금)$/i.test(nm)){ ROWS.push({t: "c", n: nm, a: amt}); ok++; return; }
        if (/채권|국채|국고채|회사채|브라질/.test(nm) && !/ETF|KODEX|TIGER|ACE|SOL|RISE|PLUS/i.test(nm)){ ROWS.push({t: "b", n: nm, a: amt}); ok++; return; }
        var hit = (typeof opFind === "function" && opFind(nm)) || ((typeof opSearch === "function" ? opSearch(nm, 1) : [])[0]);
        if (hit && addStock(hit, amt)) ok++; else if (!hit) bad.push(nm); });
      ta.value = bad.join("\n"); redraw(); toast(ok + "개 넣었어요" + (bad.length ? " · 못 찾은 " + bad.length + "개는 칸에 남겼어요" : "")); }); }
  function run(){
    var rows = ROWS.filter(function(r){ return +r.a > 0; }), out = D.getElementById("dgout"); if (!out) return;
    if (!rows.length){ toast("종목과 금액을 넣어 주세요"); return; }
    out.innerHTML = '<section class="card hub-c" data-cz="done"><div class="loading">진단하는 중…</div></section>';
    var cl = (D.getElementById("dgcl") || {}).value || "";
    Promise.all([analyze(rows), window.__vdLoad ? __vdLoad().catch(function(){ return null; }) : null]).then(function(z){
      var R = z[0], vd = z[1]; if (vd && vd.text && rows.some(function(r){ return r.t === "s"; })){ R.vd = vd.text; R.vdAsof = vd.asof ? Number(vd.asof.slice(5, 7)) + "/" + Number(vd.asof.slice(8)) : ""; }
      LASTR = R; var c = diagCanvas(R, cl.trim(), ls("pbname") || ""), url;
      try { url = c.toDataURL("image/png"); } catch(x){ url = ""; }
      out.innerHTML = '<section class="card hub-c no-clp" data-cz="done" data-xc="1"><p class="hub-h">진단 결과</p>' +
        '<ul class="dg-pt">' + R.pts.map(function(p){ return '<li><b>' + e(p[0]) + '</b>' + e(p[1]) + '</li>'; }).join("") + '</ul>' +
        (R.miss.length ? '<p class="dg-e">자료를 못 받은 종목: ' + e(R.miss.join(", ")) + ' — 비중에는 들어가고 업종·배당에서는 빠졌어요</p>' : '') +
        '<button type="button" class="hub-cta" data-dgsend="1">📨 한 장으로 보내기</button>' +
        (url ? '<img class="dg-img" src="' + url + '" alt="포트 진단 한 장 미리 보기">' : '') + '</section>';
      try { out.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {}
    }).catch(function(x){ console.error(x); out.innerHTML = '<section class="card hub-c"><p class="dg-e">진단하지 못했어요 — 잠시 뒤 다시 눌러 주세요</p></section>'; });
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#dg [data-dgx],#dg [data-dgadd],#dg [data-dgpick],#dg [data-dgpaste],#dg [data-dggo],#dg [data-dgsend],#dg [data-dgclr],#dg [data-dgcl]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.dgx != null){ ROWS.splice(+t.dataset.dgx, 1); redraw(); return; }
    if (t.dataset.dgadd){ var k = t.dataset.dgadd, n = k === "c" ? "현금·예금" : k === "b" ? "채권" : (prompt("자산 이름 (예: 사모펀드, 비상장 주식, 부동산 펀드)", "") || "").trim().slice(0, 20); if (!n) return;
      if (k !== "o" && ROWS.some(function(x){ return x.t === k; })){ toast("이미 있어요 — 금액만 고쳐 주세요"); return; } ROWS.push({t: k, n: n, a: 0}); redraw(); var ins = D.querySelectorAll("#dgrows input"); if (ins.length) ins[ins.length - 1].focus(); return; }
    if (t.dataset.dgpick){ idxMap().then(function(IX){ var r = IX[t.dataset.dgpick]; if (r && addStock(r, 0)){ redraw(); var q = D.getElementById("dgq"); if (q) q.value = ""; D.getElementById("dgsug").innerHTML = ""; var ins = D.querySelectorAll("#dgrows input"); if (ins.length) ins[ins.length - 1].focus(); } }); return; }
    if (t.dataset.dgpaste){ paste(); return; }
    if (t.dataset.dgclr){ if (confirm("넣은 종목을 전부 지울까요?")){ ROWS = []; redraw(); var o2 = D.getElementById("dgout"); if (o2) o2.innerHTML = ""; } return; }
    if (t.dataset.dgcl){ var I = D.getElementById("dgcl"); if (I) I.value = I.value === t.dataset.dgcl ? "" : t.dataset.dgcl; return; }
    if (t.dataset.dggo){ run(); return; }
    if (t.dataset.dgsend && LASTR){ var cl = ((D.getElementById("dgcl") || {}).value || "").trim().slice(0, 20), nm = pbname(); saveCl(cl);
      send(diagCanvas(LASTR, cl, nm), (cl ? cl + "_" : "") + "포트진단_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", "포트 진단 한 장"); }
  });
  D.addEventListener("input", function(ev){ var t = ev.target; if (!t || !t.closest) return;
    if (t.id === "dgq"){ clearTimeout(sug.t); sug.t = setTimeout(sug, 180); return; }
    if (t.dataset && t.dataset.dga != null && t.closest("#dg")){ var v = parseFloat(String(t.value).replace(/[^\d.]/g, "")) || 0, r = ROWS[+t.dataset.dga]; if (r){ r.a = v; save(); var s = D.getElementById("dgsum"); if (s) s.textContent = sumLine(); } } });
  D.addEventListener("blur", function(ev){ var t = ev.target; if (t && t.dataset && t.dataset.dga != null){ var r = ROWS[+t.dataset.dga]; if (r && r.a) t.value = Number(r.a).toLocaleString("ko-KR"); } }, true);

  /* ═════════ ⑧ 🎯 신호 한눈에 ═════════ */
  function sigView(){
    return '<div id="sga" data-noemo="1">' +
      [["prob", "오를 확률", "5개 시장 · 오늘 장"], ["whale", "큰손", "기관·유명 투자자가 담는 종목"], ["cup", "컵 차트", "돌파 후보"], ["gap", "갭 상승", "갭 뒤 버티는 종목"]].map(function(s){
        return '<section class="card hub-c sgx-c" data-cz="done" id="sg-' + s[0] + '"><p class="hub-h ez-no">' + s[1] + ' <small>' + s[2] + '</small></p><div class="sgx-b"><div class="loading">불러오는 중…</div></div><button type="button" class="hub-sub ez-no" data-sgall="' + s[0] + '">' + s[1] + ' 전체 보기 ›</button></section>'; }).join("") +
      '<p class="hub-n">신호는 살펴볼 후보예요 · 사라는 뜻이 아니에요</p></div>'; }
  function put(k, html, sub){ var b = D.querySelector("#sg-" + k + " .sgx-b"); if (b) b.innerHTML = html || '<p class="dg-e">오늘 자료가 아직 없어요</p>'; if (sub){ var s = D.querySelector("#sg-" + k + " .hub-h small"); if (s) s.textContent = sub; } }
  function row(sym, name, mid, right, cls){ return '<button type="button" class="sgx-r" data-sgop="' + e(sym) + '"><span class="sgx-n"><b>' + e(name) + '</b>' + (isUS(sym) ? '<small>' + e(sym) + '</small>' : '') + '</span><span class="sgx-m">' + e(mid || "") + '</span><em class="' + (cls || "") + '">' + e(right || "") + '</em></button>'; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0].id : null; }
  function sigInit(){
    gj("archive/x/prob.json?" + Math.floor(Date.now() / 300000), 300000).then(function(p){ if (!p || !p.markets) return put("prob", "");
      var h = '<div class="sgx-p">' + ["KR", "US", "JP", "CN", "HK"].map(function(k){ var m = p.markets[k]; if (!m) return ""; var v = m.p1, ext = v >= 0.85 || v <= 0.15;
        return '<div><span>' + e(m.flag || "") + ' ' + e(m.name) + '</span><b class="' + (ext ? "" : v >= 0.55 ? "up" : v <= 0.45 ? "down" : "") + '">' + (ext ? "극단" : Math.round(v * 100) + "%") + '</b><small>1주 ' + Math.round(m.p5 * 100) + '%</small></div>'; }).join("") + '</div>' +
        '<p class="sgx-t">' + (p.date ? Number(p.date.slice(5, 7)) + "/" + Number(p.date.slice(8)) + " " + (p.t || "") + " · " : "") + '오늘 종가가 어제보다 높을 확률 · 85% 넘거나 15% 밑은 「극단」이라 참고하지 않아요</p>';
      put("prob", h); });
    Promise.all([gj("archive/x/whale_pick.json?" + Math.floor(Date.now() / 600000)), idxMap()]).then(function(z){ var w = z[0]; if (!w || !(w.rank || []).length) return put("whale", "");
      put("whale", w.rank.slice(0, 5).map(function(r){ return row(r.s, r.n || r.s, String((r.why || [""])[0]).replace(/^[^\s가-힣A-Za-z0-9]+\s*/, "").split(" · ").slice(0, 2).join(" · "), r.tot != null ? Math.round(r.tot) + "점" : "", ""); }).join(""), "점수 높은 순 5개 · " + String(w.at || "").slice(5).replace("-", "/")); });
    ["cup", "gap"].forEach(function(cat){ var id = latest(cat); if (!id) return put(cat, "");
      Promise.all([gj("archive/" + cat + "/" + id + "/cards.json"), idxMap()]).then(function(z){ var d = z[0], IX = z[1]; if (!d || !(d.top || []).length) return put(cat, "");
        var T = d.top.slice().sort(function(a, b){ return (b.score || 0) - (a.score || 0); }).slice(0, 5);
        put(cat, T.map(function(c){ var nm = (IX[c.code] && IX[c.code].name) || String(c.name || c.code).replace(/\s*-\s*(Common|Class|Ordinary).*$/i, "").replace(/,? (Inc|Corp|Ltd|Co)\.?.*$/i, "");
          var mid = cat === "cup" ? (c.brk ? "돌파" : c.dist != null && c.dist > -5 ? "돌파 임박" : "기준가까지 " + Math.abs(c.dist).toFixed(1) + "%") + (c.weeks ? " · " + Math.round(c.weeks) + "주 컵" : "") : "갭 " + sg(c.gap, 0) + (c.after != null ? " · " + Math.round(c.after) + "일째" : "") + (c.hold ? " · 버팀" : "");
          return row(c.code, nm, mid, c.score != null ? Math.round(c.score) + "점" : "", ""); }).join(""), (cat === "cup" ? "돌파 후보 " : "후보 ") + (d.total || d.top.length) + "개 중 5개 · " + id.slice(5).replace("-", "/")); }); });
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#sga [data-sgall],#sga [data-sgop]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.sgall){ if (typeof window.go === "function"){ go(t.dataset.sgall); window.scrollTo(0, 0); } return; }
    if (t.dataset.sgop && window.openOP) openOP(t.dataset.sgop);
  });

  /* ═════════ 화면 연결 (index.html go → hubView/hubInit) ═════════ */
  var V0 = window.hubView, I0 = window.hubInit;
  window.hubView = function(key){ if (key === "diag") return diagView(); if (key === "sigall") return sigView(); return V0 ? V0(key) : ""; };
  window.hubInit = function(key){ if (key === "sigall"){ sigInit(); return; } if (key === "diag") return; if (I0) I0(key); };

  var st = D.createElement("style");
  st.textContent =
    "#dg .hub-p{margin:0 0 12px;font-size:14.5px;line-height:1.55;color:var(--sub);word-break:keep-all}" +
    ".dg-cl,.qi-in label{display:flex;align-items:center;gap:8px;font-size:14.5px;font-weight:700;margin:0 0 8px;white-space:nowrap}" +
    ".dg-cl input,.qi-in label input,#dgq,#dgta{flex:1;min-width:0;width:100%;font:inherit;font-size:16px;padding:11px 12px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);box-sizing:border-box}" +
    ".qi-rc{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.qi-rc button{font:inherit;font-size:13.5px;padding:6px 11px;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);cursor:pointer}" +
    "#dgrows{margin:6px 0 4px;border-top:1px solid var(--line)}" +
    ".dg-r{display:grid;grid-template-columns:minmax(0,1fr) 132px 40px;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}" +
    ".dg-nm{min-width:0}.dg-nm b{display:block;font-size:15.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dg-nm small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".dg-r label{display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:10px;padding:0 9px}.dg-r label input{flex:1;min-width:0;width:100%;font:inherit;font-size:16px;font-weight:700;text-align:right;padding:9px 0;border:0;background:transparent;color:var(--text);font-variant-numeric:tabular-nums}.dg-r label span{font-size:12.5px;color:var(--sub);white-space:nowrap}" +
    ".dg-r>button{font:inherit;font-size:15px;width:40px;height:40px;border:0;border-radius:10px;background:transparent;color:var(--sub);cursor:pointer}" +
    ".dg-sum{margin:6px 2px 12px;font-size:13.5px;font-weight:700;color:var(--sub);text-align:right;min-height:18px;font-variant-numeric:tabular-nums}" +
    ".dg-e{margin:10px 2px;font-size:13.5px;color:var(--sub);line-height:1.5}" +
    ".dg-add{position:relative}#dgsug button{display:flex;justify-content:space-between;align-items:baseline;gap:10px;width:100%;font:inherit;text-align:left;padding:11px 4px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer}#dgsug b{font-size:15px;font-weight:700}#dgsug small{font-size:12.5px;color:var(--sub);white-space:nowrap}" +
    ".dg-ch{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.dg-ch button{font:inherit;font-size:13.5px;font-weight:600;padding:8px 12px;border:1px dashed var(--line);border-radius:999px;background:transparent;color:var(--text);cursor:pointer}" +
    ".dg-p{margin:4px 0 14px}.dg-p summary{font-size:14px;font-weight:700;color:var(--sub);padding:8px 2px;cursor:pointer}.dg-p textarea{margin-top:6px;line-height:1.5;resize:vertical}" +
    ".dg-clr{display:block;margin:10px auto 0;font:inherit;font-size:13px;color:var(--sub);background:transparent;border:0;text-decoration:underline;cursor:pointer;padding:8px}" +
    ".dg-pt{list-style:none;margin:0 0 14px;padding:0}.dg-pt li{padding:10px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.55;word-break:keep-all}.dg-pt li:last-child{border-bottom:0}.dg-pt b{display:inline-block;font-size:12px;font-weight:800;color:#3182f6;background:rgba(49,130,246,.12);border-radius:7px;padding:2px 7px;margin-right:8px}" +
    ".dg-img{display:block;width:100%;height:auto;margin-top:14px;border-radius:14px;border:1px solid var(--line)}" +
    "#qimgs{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}" +
    ".qi-in{width:100%;max-width:520px;background:var(--panel,#121826);color:var(--text);border-radius:20px 20px 0 0;padding:20px 18px calc(18px + env(safe-area-inset-bottom))}.qi-in>b{font-size:17px}.qi-in>p{margin:6px 0 14px;font-size:14px;color:var(--sub);line-height:1.5}" +
    ".qi-b{display:flex;gap:8px;margin-top:6px}.qi-b button{flex:1;font:inherit;font-size:16px;font-weight:800;padding:13px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer}.qi-b .qi-go{flex:2;border:0;background:#3182f6;color:#fff}" +
    ".mn-qc.qa-img{border-color:rgba(49,130,246,.6);color:#3182f6;font-weight:800}" +
    "#sga .hub-h small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".sgx-r{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:10px 2px;cursor:pointer}.sgx-r:first-child{border-top:0}" +
    ".sgx-n{min-width:0}.sgx-n b{display:block;font-size:15px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sgx-n small{display:block;font-size:12px;color:var(--sub)}.sgx-m{font-size:12.5px;color:var(--sub);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.sgx-r em{font-style:normal;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".sgx-p{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.sgx-p>div{text-align:center;padding:10px 2px;border:1px solid var(--line);border-radius:12px;min-width:0}.sgx-p span{display:block;font-size:12px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgx-p b{display:block;font-size:19px;font-weight:800;margin:3px 0 1px;font-variant-numeric:tabular-nums}.sgx-p b.up{color:var(--up)}.sgx-p b.down{color:var(--down)}.sgx-p small{font-size:11.5px;color:var(--sub)}" +
    ".sgx-t{margin:9px 2px 0;font-size:12.5px;color:var(--sub);line-height:1.5}";
  D.head.appendChild(st);
})();
;
/* ======== tax.js ======== */
/* CH Investing — 🧾 11/16 세무계산기 (🔬 연구실 › 세무계산기 · #tax)
   사용자: 「세무계산기 카테고리 — 통합으로 진행 · 연구실에 넣고 · 항목 선택하면 필요값만 입력하면 계산 결과 나오는 형태로」
   항목 6개(한 화면 · 고르면 그 항목 입력칸만 보임 · 넣는 즉시 계산):
     ① 2,000만 경보기 — 금융소득종합과세 + 건강보험료(피부양자·지역·직장) 통합 + 고배당 분리과세 비교
     ② 연금계좌 세액공제   ③ 퇴직소득세(일시금 vs 연금)   ④ 연금 받을 때 세금   ⑤ 해외주식 양도세   ⑥ ISA 절세
   ★ 세법 숫자는 전부 아래 LAW 한 곳에만 있음 — 해가 바뀌거나 법이 바뀌면 LAW 만 고칠 것 (기준: 2026년 귀속)
   ★ 11/16 밤 3차: 사용자 「기억값으로 어림이라니… 철저하게 다시」 → 계산에 쓰는 숫자를 전부 법령·국세청·공단 원문과 대조(기억값 0) · 공식 예시로 맞춰 보는 검산 파일 tools/tax_check.js
     [소득세] 세율 §55(시행 2026) · 근로소득공제 §47·연금소득공제 §47의2(시행규칙 별지 40호(1) 2026.3.20 표) · 근로소득세액공제 §59 · 연금계좌세액공제 §59의3 · 표준세액공제 §59의4⑨
              금융소득 2,000만 §14③6 · 배당가산 10% §17③(2024.1.1 이후) · 고배당 분리과세(국세청 2026.3.9 보도자료) · 사적연금 1,500만 §14③9·15% 선택 §64의4
              연금 원천징수 5·4·3%·종신 3%·이연퇴직 70·60·50%(국세청 「연금소득 원천징수 방법」 · 2026.1.1 이후 수령분) · 연금수령한도·기산연차 시행령 §40의2 · 인출순서 §40의3
              퇴직 근속연수공제·환산급여공제 §48(국세청 「퇴직소득세 계산방법」) · 해외주식 기본공제 250만 §118의7·세율 20% · 증여 후 1년 이월과세 §97의2 · RIA 조특법 §91의26
     [건보]  보험료율 7.19%·장기요양 0.9448%·점수당 211.5원·상한 4,591,740·하한 20,160(공단 「2026년 달라지는 제도」·고시 2025-222호) · 재산 60등급 시행령 별표 4(공단 게시표와 대조)
              소득 평가(이자·배당·사업·기타 100% / 근로·연금 50% / 이자·배당 1,000만 이하 제외) 시행규칙 §44 · 보수 외 2,000만 시행령 §41④ · 피부양자 시행규칙 별표 1의2
     [4대보험] 국민연금 9.5%(본인 4.75%)·기준소득월액 상한 637만(~2026.6)·659만(2026.7~) · 고용보험 본인 0.9%
     [증여]  배우자 6억·직계존비속 5천만(미성년 2천만) 상증법 §53 / [ISA] 200·400만·9.9%·서민형 5,000만/3,800만·전환 10%(300만)
   11/16 밤 사용자 「정말 이리 간단한거야? 다른 고려할 요인들 없는지 면밀히 살펴」 → 2차: 배당 Gross-up·배당세액공제 / 4대보험 반영한 과세표준 어림·직접 입력 /
     지역 재산분(60등급)·상한·최저 / 연금공제 결정세액 한도·사업자 / 퇴직 연금수령한도·원금 먼저 인출·수익률 / RIA 50% 공제 / 부양가족 100만·세대 합산·부부 동반 탈락 안내
     기본 화면은 그대로 필수 1~2칸 — 추가 칸은 「＋ 더 정확하게」를 눌러야 보임(adv)
   넣은 금액은 어디에도 저장·전송하지 않음(화면을 떠나면 사라짐) — 마지막에 고른 항목만 이 휴대폰에 기억.
   화면 연결: index.html go("tax") → hubView/hubInit (ux1116.js 와 같은 방식) · nav2.js GROUPS(tax · lab:1) · ux1112b.js LABS · gsearch.js MENU */
(function(){
  var D = document;
  var LAW = {
    asof: "2026년 기준",
    br: [[1400, .06], [5000, .15], [8800, .24], [15000, .35], [30000, .38], [50000, .40], [100000, .42], [Infinity, .45]],   // 종합소득세율(만원)
    local: 1.1,                 // 지방소득세 10% 포함
    finLine: 2000,              // 금융소득종합과세 기준
    wh: .14,                    // 이자·배당 원천징수(소득세)
    gross: .10,                 // 배당가산(Gross-up) — 국내 회사 배당 중 2,000만 초과분 · 같은 금액을 배당세액공제
    ins4: {np: .0475, npMax: (637 * 6 + 659 * 6) * .0475, ei: .009},   // 근로자 보험료 본인 부담: 국민연금 4.75%(기준소득월액 상한 1~6월 637만·7~12월 659만 → 연 369.36만) / 고용 0.9% / 건보는 hi 에서
    div: [[2000, .14], [30000, .20], [500000, .25], [Infinity, .30]],   // 고배당기업 배당 분리과세(2026~2028 지급분)
    hi: {rate: .0719, ltc: .9448 / 7.19, finIn: 1000, depLine: 2000, depLow: 1000, propMid: 54000, propMax: 90000, empFree: 2000, half: .5,
         cap: 4591740, floor: 20160, floorM: 28, propDed: 10000, pt: 211.5,   // 월 상한·지역 최저(소득월액 28만 이하)·재산 기본공제 1억·점수당 금액
         /* 재산보험료부과점수 60등급(시행령 별표 4 · 기본공제 뒤 금액 상한(만원), 점수) — 2022.9 이후 구간 고정, 점수당 금액만 해마다 바뀜 */
         grade: [[450,22],[900,44],[1350,66],[1800,97],[2250,122],[2700,146],[3150,171],[3600,195],[4050,219],[4500,244],[5020,268],[5590,294],[6220,320],[6930,344],[7710,365],[8590,386],[9570,412],[10700,439],[11900,465],[13300,490],
                 [14800,516],[16400,535],[18300,559],[20400,586],[22700,611],[25300,637],[28100,659],[31300,681],[34900,706],[38800,731],[43200,757],[48100,785],[53600,812],[59700,841],[66500,881],[74000,921],[82400,961],[91800,1001],[103000,1041],[114000,1091],
                 [127000,1141],[142000,1191],[158000,1241],[176000,1291],[196000,1341],[218000,1391],[242000,1451],[270000,1511],[300000,1571],[330000,1641],[363000,1711],[399300,1781],[439230,1851],[483153,1921],[531468,1991],[584615,2061],[643077,2131],[707385,2201],[778124,2271],[Infinity,2341]]},
    pen: {save: 600, all: 900, wageLine: 5500, incLine: 4500, hiRate: .165, loRate: .132, isaRate: .1, isaMax: 300},
    pay: {line: 1500, sep: .165, r: [[70, .055], [80, .044], [999, .033]], life: .033},
    ret: {keep: [[10, .7], [20, .6], [999, .5]]},                       // 연금 수령 연차별 내는 비율(20년 초과 50%는 2026~)
    ovs: {ded: 250, rate: .22, ria: .5},   // RIA(국내시장 복귀계좌) 2026년 8~12월 결제분 공제율 50% · 2026년 한시
    isa: {free: {n: 200, s: 400}, rate: .099, normal: .154}
  };
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function prog(x, br){ var t = 0, lo = 0; x = Math.max(0, x); for (var i = 0; i < br.length; i++){ var hi = br[i][0]; if (x > lo) t += (Math.min(x, hi) - lo) * br[i][1]; lo = hi; } return t; }
  function itax(x){ return prog(x, LAW.br); }
  function mrate(x){ for (var i = 0; i < LAW.br.length; i++) if (x <= LAW.br[i][0]) return LAW.br[i][1]; return .45; }
  function wageDed(w){ var d = w <= 500 ? w * .7 : w <= 1500 ? 350 + (w - 500) * .4 : w <= 4500 ? 750 + (w - 1500) * .15 : w <= 10000 ? 1200 + (w - 4500) * .05 : 1475 + (w - 10000) * .02; return Math.min(d, 2000, w); }
  function penDed(p){ var d = p <= 350 ? p : p <= 700 ? 350 + (p - 350) * .4 : p <= 1400 ? 490 + (p - 700) * .2 : 630 + (p - 1400) * .1; return Math.min(d, 900, p); }
  /* 금액 표시 — 넣는 단위는 만원 */
  function won(x){ if (Math.abs(x) < 0.05) return "0원"; var neg = x < 0; x = Math.abs(x); var s;
    if (x >= 9999.5){ var m = Math.round(x), uk = Math.floor(m / 10000), r = m % 10000; s = uk.toLocaleString() + "억" + (r ? " " + r.toLocaleString() + "만" : "") + " 원"; }
    else if (x >= 100) s = Math.round(x).toLocaleString() + "만 원";
    else s = (Math.round(x * 10) / 10).toLocaleString() + "만 원";
    return (neg ? "−" : "") + s; }
  function wonM(man){ return Math.round(man * 10000 / 10) * 10; }                    // 만원 → 원(10원 단위)
  function wn(v){ return v.toLocaleString() + "원"; }
  function pct(r, d){ return (r * 100).toFixed(d == null ? 1 : d).replace(/\.0$/, "") + "%"; }
  function ins4(w){ var I = LAW.ins4; return Math.min(w * I.np, I.npMax) + w * LAW.hi.rate / 2 * (1 + LAW.hi.ltc) + w * I.ei; }   // 근로자 보험료 본인 부담(만원) = 연금보험료공제 + 건강·고용보험료 특별소득공제 — 1년 내내 근무·비과세 급여 없음 가정
  function fl10(x){ return Math.floor(x / 10) * 10; }
  function propPts(base){ var x = (base || 0) - LAW.hi.propDed; if (x <= 0) return 0; var G = LAW.hi.grade; for (var i = 0; i < G.length; i++) if (x <= G[i][0]) return G[i][1]; return 2341; }
  /* 지역가입자 월 보험료(원): 소득분(소득월액 28만 이하는 최저보험료) + 재산분, 상한, 장기요양 포함 → {inc, prop, tot} */
  function hiLocal(yearMan, propBase){ var H = LAW.hi, m = Math.max(0, yearMan) / 12, inc = m <= H.floorM ? H.floor : m * 10000 * H.rate, pr = propPts(propBase) * H.pt, sum = inc + pr, k = sum > H.cap ? H.cap / sum : 1;
    var hi = fl10(Math.min(sum, H.cap)), tot = hi + fl10(hi * H.ltc), a = sum > 0 ? Math.round(tot * inc / sum / 10) * 10 : 0;   // 건보료·장기요양 각각 10원 미만 버림(공단 방식)
    return {inc: a, prop: tot - a, tot: tot}; }
  function hiExtra(yearMan){ var H = LAW.hi; var hi = fl10(Math.min(H.cap, Math.max(0, yearMan) / 12 * 10000 * H.rate)); return hi + fl10(hi * H.ltc); }   // 직장가입자 소득월액 보험료(월 · 원)

  /* ───────── 결과 그리기 도구 ───────── */
  function big(lab, val, sub, tone){ return '<div class="tx-big' + (tone ? " tx-" + tone : "") + '"><small>' + lab + '</small><b>' + val + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; }
  function bars(rows){ var mx = 0; rows.forEach(function(r){ if (r[1] > mx) mx = r[1]; });
    return '<div class="tx-bars">' + rows.map(function(r){ var w = mx > 0 ? Math.max(r[1] > 0 ? 3 : 0, r[1] / mx * 100) : 0;
      return '<div class="tx-b' + (r[3] ? " tx-best" : "") + '"><span>' + r[0] + '</span><i><u style="width:' + w.toFixed(1) + '%"></u></i><b>' + (r[2] || won(r[1])) + '</b></div>'; }).join("") + '</div>'; }
  function tips(t, a){ a = a.filter(Boolean); return a.length ? '<p class="tx-th">' + t + '</p><ul class="tx-tip">' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul>' : ''; }
  function basis(a){ return '<details class="tx-base"><summary>계산 기준 · 가정 보기</summary><ul>' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul></details>'; }
  function head(t, s){ return '<p class="hub-h">' + t + (s ? ' <small>' + s + '</small>' : '') + '</p>'; }

  /* ───────── 계산기 6개 ─────────
     field: {id, label, sub, req, ph, unit, max, on(v) 보일 조건, adv: 1 → 「더 정확하게」를 눌러야 보이는 칸} */
  var CALCS = [
    { k: "alarm", ic: "🚨", t: "2,000만 경보기", d: "금융소득 세금 + 건보료 한 번에",
      segs: [{id: "ins", label: "건강보험", opts: [["emp", "직장가입자"], ["dep", "피부양자"], ["loc", "지역가입자"]]}],
      fields: [
        {id: "fin", label: "이자·배당 합계", sub: "1년 · 세전", req: 1, ph: "예: 2500"},
        {id: "wage", label: "연봉(총급여)", sub: "세전", ph: "예: 8000", on: function(v){ return v.ins === "emp"; }},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "예: 1200", on: function(v){ return v.ins !== "emp"; }},
        {id: "dv", label: "그중 국내 회사 주식 배당", sub: "ETF·펀드·해외·이자는 빼고", ph: "선택", adv: 1},
        {id: "hd", label: "그중 고배당기업 배당", sub: "분리과세 신청할 수 있는 배당", ph: "선택", adv: 1},
        {id: "biz", label: "사업·임대 등 다른 소득", sub: "경비 뺀 금액", ph: "선택", adv: 1, on: function(v){ return v.ins !== "dep"; }},
        {id: "prop", label: "재산세 과세표준", sub: "주택은 공시가의 약 60%", ph: "선택", adv: 1, on: function(v){ return v.ins !== "emp"; }},
        {id: "tb", label: "다른 소득의 과세표준", sub: "원천징수영수증에 있는 값 · 알면 직접", ph: "선택", adv: 1}
      ],
      run: function(v){
        var F = v.fin || 0; if (!F) return null;
        var H = LAW.hi, HD = Math.min(v.hd || 0, F), DV = Math.min(F, Math.max(v.dv || 0, HD)), ins = v.ins, wage = v.wage || 0, pen = v.pen || 0, biz = ins === "dep" ? 0 : (v.biz || 0), prop = ins === "emp" ? 0 : (v.prop || 0);
        var est = Math.max(0, (ins === "emp" ? Math.max(0, wage - wageDed(wage) - ins4(wage)) : Math.max(0, pen - penDed(pen))) + biz - 150), O = v.tb ? v.tb : est;
        /* 금융소득 f(그중 Gross-up 대상 국내 배당 d)에 붙는 소득세 — 2,000만 초과분만 합산 · 배당가산 10% 더했다가 같은 금액을 세액공제 · 14% 원천징수세액보다 작을 수 없음 */
        function ft(f, d){ if (f <= LAW.finLine) return f * LAW.wh;
          var ex = f - LAW.finLine, g = Math.min(d, ex) * LAW.gross;
          return Math.max(itax(O + ex + g) + LAW.finLine * LAW.wh - g, itax(O) + f * LAW.wh) - itax(O); }
        var gen = ft(F, DV) * LAW.local, wh = F * LAW.wh * LAW.local, extra = Math.max(0, gen - wh), sep = HD > 0 ? (prog(HD, LAW.div) + ft(F - HD, DV - HD)) * LAW.local : null;
        var h = "", over = F > LAW.finLine;
        var mx = Math.min(4000, Math.max(3000, F * 1.15)), pos = Math.min(100, F / mx * 100);
        h += '<div class="tx-g"><div class="tx-gt"><u style="width:' + pos.toFixed(1) + '%" class="' + (over ? "r" : F > H.finIn ? "y" : "g") + '"></u>' +
          '<i class="up" style="left:' + (H.finIn / mx * 100).toFixed(1) + '%"><em>1,000만 · 건보료 선</em></i><i style="left:' + (LAW.finLine / mx * 100).toFixed(1) + '%"><em>2,000만 · 종합과세 선</em></i></div>' +
          '<p>지금 <b>' + won(F) + '</b> — ' + (over ? '2,000만 선을 <b class="tx-r">' + won(F - LAW.finLine) + '</b> 넘음' : F > H.finIn ? '2,000만 선까지 <b>' + won(LAW.finLine - F) + '</b> 남음' : '1,000만 선까지 <b>' + won(H.finIn - F) + '</b> 남음') + '</p></div>';
        /* ① 세금 */
        h += '<p class="tx-sec">① 세금</p>';
        if (!over) h += big("금융소득 세금", won(wh), "15.4% 떼고 끝 · 더 낼 세금 없음", "ok");
        else if (extra < 0.05) h += big("더 낼 세금", "0원", "종합과세 대상이지만 다른 소득이 적어 이미 뗀 15.4%(" + won(wh) + ")로 끝 · 5월 신고는 해야 함", "ok");
        else h += big("5월에 더 낼 세금", won(extra), "이미 뗀 " + won(wh) + " + 추가 " + won(extra) + " = 모두 " + won(gen) + " · 초과분에 붙는 세율 약 " + pct(mrate(O + F - LAW.finLine) * LAW.local), "bad");
        if (over && extra >= 0.05 && !v.dv && !v.hd) h += '<p class="tx-n tx-s">전부 이자·ETF 분배금으로 본 값 — 국내 회사 배당이 섞여 있으면 「더 정확하게」에 넣기 (배당세액공제로 세금이 줄어듦)</p>';
        if (sep != null && over){ var gain = gen - sep;
          h += bars([["그냥 종합과세", gen, null, gain <= 0.05], ["고배당 분리과세 신청", sep, null, gain > 0.05]]) +
            '<p class="tx-n">' + (gain > 0.05 ? '고배당 배당 ' + won(HD) + '을 분리과세로 신청하면 <b class="tx-a">' + won(gain) + '</b> 덜 냄 (5월 신고 때 신청서를 내야 적용)' : gain < -0.05 ? '다른 소득이 적어 분리과세를 고르면 오히려 <b class="tx-r">' + won(-gain) + '</b> 더 냄 — 신청하지 않는 쪽이 유리' : '이 경우는 분리과세를 골라도 세금 차이가 없음') + '</p>'; }
        else if (sep != null) h += '<p class="tx-n">2,000만 이하라 고배당 분리과세를 골라도 세금은 같음(14%)</p>';
        /* ② 건보료 */
        var Fh = F > H.finIn ? F : 0, msg = "", pp = propPts(prop);
        h += '<p class="tx-sec">② 건강보험료</p>';
        if (ins === "emp"){ var ext = Fh + biz, add = ext > H.empFree ? hiExtra(ext - H.empFree) : 0;
          h += add ? big("월급 말고 더 내는 건보료", "월 " + wn(add), "연 " + wn(add * 12) + " · 월급 외 소득 " + won(ext) + " 중 2,000만 넘는 " + won(ext - H.empFree) + "에 부과 · 전액 본인 부담", "bad")
                   : big("더 내는 건보료", "없음", "월급 외 소득 " + won(ext) + " — 2,000만 이하" + (F <= H.finIn && F > 0 ? " (이자·배당 1,000만 이하는 아예 안 봄)" : ""), "ok");
        } else if (ins === "dep"){ var tot = Fh + pen, why = [];
          if (tot > H.depLine) why.push("소득 합계 " + won(tot) + " — 2,000만 초과");
          if (prop > H.propMax) why.push("재산세 과세표준 " + won(prop) + " — 9억 초과");
          else if (prop > H.propMid && tot > H.depLow) why.push("재산 과표 5.4억~9억 구간인데 소득 " + won(tot) + " — 1,000만 초과");
          if (why.length){ var L = hiLocal(Fh + pen * H.half, prop);
            h += big("피부양자 탈락", "월 " + wn(L.tot) + (prop ? "" : " +α"), "지역가입자로 바뀜 · 연 " + wn(L.tot * 12) + (prop ? " · 소득분 " + wn(L.inc) + " + 재산분 " + wn(L.prop) : " · 소득분만 계산 — 집·땅이 있으면 「더 정확하게」에 재산세 과세표준을 넣어야 재산분까지 나옴"), "bad") +
              '<p class="tx-n">탈락 이유: ' + why.join(" · ") + '</p><p class="tx-n tx-s">부부는 한 사람만 소득 기준을 넘어도 둘 다 탈락 · 지역보험료는 같은 세대 가족의 소득·재산을 합쳐서 계산</p>';
          } else { var room = (prop > H.propMid ? H.depLow : H.depLine) - tot;
            h += big("피부양자 유지", "보험료 0원", "소득 합계 " + won(tot) + " · 기준선까지 " + won(room) + " 남음" + (F <= H.finIn ? " · 이자·배당 1,000만 이하는 0원으로 봄" : ""), "ok");
            if (F <= H.finIn && pen + H.finIn > (prop > H.propMid ? H.depLow : H.depLine)) msg = "⚠ 이자·배당이 1,000만을 1원이라도 넘으면 전액이 소득에 잡혀 바로 탈락함";
            h += '<p class="tx-n tx-s">배우자가 소득 기준을 넘으면 함께 탈락 · 사업자등록이 있고 사업소득이 있으면 금액과 상관없이 탈락</p>'; }
        } else { var N = hiLocal(Fh + pen * H.half + biz, prop), Lo = hiLocal(pen * H.half + biz, prop);
          h += big("지역 건보료", "월 " + wn(N.tot) + (prop ? "" : " +α"), "연 " + wn(N.tot * 12) + (prop ? " · 소득분 " + wn(N.inc) + " + 재산분 " + wn(N.prop) : " · 소득분만 — 재산분은 「더 정확하게」에 재산세 과세표준을 넣으면 나옴"), Fh ? "bad" : "ok");
          if (Fh) h += bars([["지금", N.tot, "월 " + wn(N.tot)], ["이자·배당 1,000만 이하면", Lo.tot, "월 " + wn(Lo.tot), 1]]) + '<p class="tx-n">이자·배당을 1,000만 이하로 맞추면 <b class="tx-a">연 ' + wn((N.tot - Lo.tot) * 12) + '</b> 줄어듦</p>';
          else if (F > 0) msg = "⚠ 이자·배당이 1,000만을 넘는 순간 전액이 잡혀 월 약 " + wn(hiLocal(H.finIn + pen * H.half + biz, prop).tot - Lo.tot) + " 이상 오름";
          h += '<p class="tx-n tx-s">같은 세대 가족의 소득·재산을 합쳐서 계산 — 본인 것만 넣었다면 실제는 더 많을 수 있음</p>'; }
        if (msg) h += '<p class="tx-n tx-w">' + msg + '</p>';
        h += tips("줄이는 방법 · 같이 볼 것", [
          F > H.finIn * .7 ? "이자·배당 나는 상품을 <b>ISA·연금저축·IRP</b> 안으로 — 그 안 수익은 2,000만·건보료 계산에서 빠짐" : "",
          F > H.finIn * .7 ? "<b>받는 해를 나누기</b> — ELS 상환·채권 만기·예금 만기가 한 해에 몰리지 않게 (ELS·펀드·국내 상장 해외 ETF 수익도 배당소득)" : "",
          over ? "<b>가족 명의로 나누기</b> — 배우자 6억·성인 자녀 5천만(10년)까지 증여세 없음 · 2,000만은 사람마다 따로 셈" : "",
          F > H.finIn * .7 ? "이자 대신 <b>매매차익이 큰 상품</b> — 국내 주식 차익·저쿠폰 채권의 차익은 금융소득에 안 들어감" : "",
          over ? "2,000만을 넘은 사람은 <b>가족의 연말정산 부양가족 공제에서 빠지고</b>, 3년간 ISA 새 가입이 막힘" : "",
          HD > 0 ? "고배당 분리과세 배당의 건보료: 법령에는 부과 근거가 있고 지금 실무는 분리과세 금융소득을 빼고 있음 — <b>공단 방침이 아직 확정 안내 전</b>이라 여기서는 포함해 계산(보수적)" : ""]);
        h += basis(["금융소득종합과세(소득세법 §14·§62): 2,000만 초과분만 다른 소득과 합쳐 누진세율(6~45% · §55) · 14% 원천징수세액과 비교해 큰 쪽 · 지방소득세 10% 포함",
          "다른 소득 과세표준 약 " + won(O) + (v.tb ? " (직접 넣은 값)" : " — " + (ins === "emp" ? "연봉 − 근로소득공제 − 국민연금·건강·고용보험료(법정 요율) − 본인 기본공제 150만" : "공적연금 − 연금소득공제 − 본인 기본공제 150만") + "으로 계산 = 다른 공제가 하나도 없을 때의 값 · 부양가족·카드 등 공제가 더 있으면 세금은 더 적음 → 원천징수영수증의 과세표준을 「과세표준」 칸에 넣으면 정확"),
          "국내 회사 배당은 2,000만 초과분에 10%를 더해(Gross-up · §17③) 계산한 뒤 같은 금액을 세액공제(§56) — 「국내 회사 주식 배당」 칸에 넣은 금액만 반영 · 2,000만은 이자·ETF 분배금부터 채운다고 봄",
          "해외 주식 배당은 현지에서 뗀 세금(미국 15%)을 외국납부세액으로 빼 줌 — 여기서는 국내와 같이 15.4%를 뗐다고 봄",
          "고배당 분리과세: 2,000만 이하 14% · 3억 이하 20% · 50억 이하 25% · 초과 30% · 신청하면 그 배당은 2,000만 판정에서도 빠짐 · 2026년 1월 1일 이후 받은 배당부터(한시) · 고배당기업 여부는 거래소 KIND 공시 (국세청 2026.3.9)",
          "건보료율 7.19% + 장기요양(0.9448% ÷ 7.19% = 건보료의 약 13.14%) · 이자·배당은 1,000만 초과 시 전액 · 공적연금은 자격 판정 100%, 보험료 계산 50%(시행규칙 §44) · 월 상한 4,591,740원 · 지역 최저 20,160원(소득월액 28만 이하)",
          "재산분(시행령 별표 4): (재산세 과세표준 − 1억) → 60등급 점수 × 211.5원 · 전월세는 (보증금+월세×40)×30%를 재산으로 봄(여기서는 넣은 과세표준만)",
          "피부양자(시행규칙 별표 1의2): 소득 합계 2,000만 이하 · 재산 과표 5.4억 이하(9억 이하는 소득 1,000만 이하) · 부부 모두 충족 · 사업소득 요건(등록 시 1원 · 미등록 500만 초과 · 주택임대는 금액 무관)은 따로 확인",
          "건보료는 올해 소득이 내년 11월 ~ 그다음 해 10월 보험료에 반영됨(시행령 §41)"]);
        return h; } },

    { k: "pen", ic: "🏦", t: "연금 세액공제", d: "연금저축·IRP 넣으면 얼마 환급",
      segs: [{id: "who", label: "소득 종류", opts: [["emp", "근로자"], ["biz", "사업자·기타"]]}],
      fields: [
        {id: "wage", label: "연봉(총급여)", sub: "세전", req: 1, ph: "예: 7000", on: function(v){ return v.who !== "biz"; }},
        {id: "inc", label: "종합소득금액", sub: "수입 − 경비", req: 1, ph: "예: 6000", on: function(v){ return v.who === "biz"; }},
        {id: "save", label: "연금저축 올해 넣은(넣을) 돈", ph: "예: 400"},
        {id: "irp", label: "IRP 올해 넣은(넣을) 돈", sub: "본인 추가 납입분 · DC 추가 납입 포함", ph: "예: 0"},
        {id: "isa", label: "ISA 만기 → 연금으로 옮긴 돈", ph: "선택", adv: 1},
        {id: "det", label: "작년 결정세액(소득세)", sub: "원천징수영수증 · 알면 직접", ph: "선택", adv: 1}
      ],
      run: function(v){
        var P = LAW.pen, emp = v.who !== "biz", w = emp ? (v.wage || 0) : (v.inc || 0); if (!w) return null;
        var s = v.save || 0, ir = v.irp || 0, isa = v.isa || 0, rate = (emp ? w <= P.wageLine : w <= P.incLine) ? P.hiRate : P.loRate;
        var sOk = Math.min(s, P.save), base = Math.min(sOk + ir, P.all), isaOk = Math.min(isa * P.isaRate, P.isaMax), tot = base + isaOk, back = tot * rate, room = P.all - base, lost = s - sOk;
        /* 낸 세금(결정세액)보다 많이는 못 돌려받음 — 근로자만 어림 */
        var cap = null; if (emp){ var b0 = Math.max(0, w - wageDed(w) - ins4(w) - 150), c0 = itax(b0), wc = Math.min(c0 <= 130 ? c0 * .55 : 71.5 + (c0 - 130) * .3, w <= 3300 ? 74 : w <= 7000 ? Math.max(66, 74 - (w - 3300) * .008) : w <= 12000 ? Math.max(50, 66 - (w - 7000) * .5) : Math.max(20, 50 - (w - 12000) * .5));
          cap = Math.max(0, c0 - wc) * LAW.local; }
        if (v.det) cap = v.det * LAW.local;
        var real = cap != null ? Math.min(back, cap) : back, cut = cap != null && back > cap + 0.05;
        var h = big("돌려받는 세금", won(real), "공제 대상 " + won(tot) + " × " + pct(rate) + (isaOk ? " (ISA 전환분 " + won(isaOk) + " 포함)" : "") + (cut ? " = " + won(back) + "이지만 낸 세금이 그보다 적음" : ""), real > 0 ? "ok" : "");
        if (cut) h += '<p class="tx-n tx-w">⚠ ' + (v.det ? '넣은 결정세액 기준으로 1년에 내는 세금이 ' + won(cap) + '(지방소득세 포함)이라 그 이상은 못 돌려받음.' : '이 연봉에서 1년에 내는 세금은 많아야 ' + won(cap) + ' — 그 이상은 못 돌려받음. 부양가족·카드 공제가 있으면 더 적으니 원천징수영수증의 「결정세액」을 「더 정확하게」에 넣어 확인.') + ' 공제 못 받은 납입액은 다음 해로 넘겨 공제받거나 나중에 세금 없이 찾을 수 있음</p>';
        h += '<div class="tx-lim"><div class="tx-lt"><u style="width:' + (base / P.all * 100).toFixed(1) + '%"></u><i style="left:' + (P.save / P.all * 100).toFixed(1) + '%"><em>연금저축만 600만</em></i></div><p>한도 900만 중 <b>' + won(base) + '</b> 채움' + (room > 0 ? ' · <b class="tx-a">' + won(room) + '</b> 더 넣을 수 있음' : ' · 한도 다 채움') + '</p></div>';
        if (room > 0 && !cut){ var more = cap != null ? Math.min(back + room * rate, cap) : back + room * rate;
          h += bars([["지금", real], ["한도까지 채우면", more, null, 1]]) + '<p class="tx-n">' + won(room) + ' 더 넣으면 <b class="tx-a">' + won(more - real) + '</b> 더 돌려받음 (12월 31일 입금분까지)' + (cap != null && back + room * rate > cap + 0.05 ? ' — 낸 세금 한도(약 ' + won(cap) + ')에 걸려 다 채워도 여기까지' : '') + '</p>'; }
        h += tips("체크", [
          lost > 0 ? "연금저축 " + won(s) + " 중 <b>600만 넘는 " + won(lost) + "은 공제 안 됨</b> — 그만큼은 IRP로 넣어야 공제됨" : "",
          emp && w > P.wageLine && w <= P.wageLine * 1.06 ? "연봉이 5,500만을 조금 넘어 공제율이 13.2% — 5,500만 이하면 16.5%" : "",
          "맞벌이는 <b>공제율 16.5%인 쪽(연봉 5,500만 이하)</b>이 넣는 게 유리 — 단, 낸 세금이 충분한지 먼저 확인",
          !isa ? "ISA 만기 자금을 60일 안에 연금계좌로 옮기면 옮긴 돈의 10%(최대 300만)를 한도와 별도로 더 공제" : "",
          "받을 때는 연금소득세 3.3~5.5% — 지금 13.2~16.5% 돌려받고 나중에 낮은 세율로 내는 구조 · 55세 전에 깨면 16.5%"]);
        h += basis(["공제율(소득세법 §59의3): 총급여 5,500만 이하(근로소득만) · 종합소득금액 4,500만 이하 15% · 초과 12% — 지방소득세 10%를 더해 16.5% · 13.2%",
          "한도: 연금저축 600만 · IRP 합쳐 900만 · 넣는 것 자체는 연 1,800만까지",
          v.det ? "낸 세금 한도 = 넣은 결정세액 " + won(v.det) + " + 지방소득세 10%" : emp ? "낸 세금 한도(" + won(cap) + ") = 연봉 − 근로소득공제(§47) − 국민연금·건강·고용보험료(법정 요율) − 본인 기본공제 150만 → 산출세액 − 근로소득세액공제(§59) · 다른 공제가 하나도 없을 때의 최대치 · 실제는 원천징수영수증 「결정세액」" : "사업자는 낸 세금(결정세액) 한도를 넣은 값으로만 봄 — 종합소득세 결정세액보다 많이는 못 돌려받음",
          "회사가 넣어 주는 퇴직연금(DB·DC 회사 부담분)은 해당 없음"]);
        return h; } },

    { k: "ret", ic: "🧳", t: "퇴직소득세", d: "한 번에 vs 연금 · 중간정산 합산",
      segs: [{id: "mid", label: "퇴직금 중간정산 받은 적", opts: [["n", "없음"], ["y", "있음"]]}],
      fields: [
        {id: "pay", label: "퇴직금", sub: "이번에 받는 돈 · 세전 · 명예퇴직금·위로금 포함", req: 1, ph: "예: 30000"},
        {id: "yrs", label: "근속연수", unit: "년", req: 1, ph: "예: 25", max: 60, on: function(v){ return v.mid !== "y"; }},
        {id: "yrs2", label: "중간정산 다음 날부터 근속", sub: "1년 안 되는 달은 1년으로", unit: "년", req: 1, ph: "예: 10", max: 60, on: function(v){ return v.mid === "y"; }},
        {id: "mpay", label: "중간정산 때 받은 퇴직금", sub: "원천징수영수증 「퇴직급여」", req: 1, ph: "예: 16000", on: function(v){ return v.mid === "y"; }},
        {id: "myr", label: "중간정산 때 근속연수", sub: "원천징수영수증 「근속연수」", unit: "년", req: 1, ph: "예: 23", max: 60, on: function(v){ return v.mid === "y"; }},
        {id: "mtax", label: "중간정산 때 낸 퇴직소득세", sub: "원천징수영수증 「퇴직소득세」 · 지방소득세 빼고 · 홈택스 지급명세서에도 있음", req: 1, ph: "예: 492", on: function(v){ return v.mid === "y"; }},
        {id: "mon", label: "입사일 ~ 퇴직일 전체 개월 수", sub: "두 기간이 겹치거나 끊긴 달이 있으면 · 겹친 달은 한 번만", unit: "개월", ph: "선택", max: 720, adv: 1, on: function(v){ return v.mid === "y"; }},
        {id: "span", label: "연금으로 나눠 받을 기간", unit: "년", ph: "기본 20", max: 50},
        {id: "ror", label: "IRP 예상 수익률", sub: "1년 · 넣으면 원금이 빨리 나오는 것까지 계산", unit: "%", ph: "선택", max: 15, adv: 1}
      ],
      run: function(v){
        var mid = v.mid === "y", p = v.pay || 0, n = Math.ceil((mid ? v.yrs2 : v.yrs) || 0); if (!p || !n) return null;
        var mp = v.mpay || 0, my = Math.ceil(v.myr || 0), mt = v.mtax || 0; if (mid && (!mp || !my || !v.mtax)) return null;
        var Y = Math.max(1, Math.round(v.span || 20)), r = (v.ror || 0) / 100;
        /* 퇴직소득세(국세 · 만원) — 소득세법 §48·§55 · 국세청 「퇴직소득세 계산방법」(2020년 이후 퇴직 · 근속연수공제는 2023년 이후 표) */
        function rt(pp, nn){ var a = nn <= 5 ? 100 * nn : nn <= 10 ? 500 + 200 * (nn - 5) : nn <= 20 ? 1500 + 250 * (nn - 10) : 4000 + 300 * (nn - 20), c = Math.max(0, pp - a) * 12 / nn,
            b = c <= 800 ? c : c <= 7000 ? 800 + (c - 800) * .6 : c <= 10000 ? 4520 + (c - 7000) * .55 : c <= 30000 ? 6170 + (c - 10000) * .45 : 15170 + (c - 30000) * .35, q = Math.max(0, c - b);
          return {d1: a, conv: c, d2: b, base: q, t: itax(q) * nn / 12, n: nn, p: pp}; }
        var R = rt(p, n), M = null, N = 0, addT = 0, useM = false;
        if (mid){ N = v.mon ? Math.ceil(v.mon / 12) : n + my;   // 정산 근속 = 두 근속 월수 합 − 중복 월수 (1년 미만 올림) — 시행령 §203 · 국세청 「퇴직소득 세액정산」
          M = rt(p + mp, N); addT = Math.max(0, M.t - mt); useM = addT < R.t - 0.0005; }
        var tax = (useM ? addT : R.t) * LAW.local, d1 = (useM ? M : R).d1, conv = (useM ? M : R).conv, d2 = (useM ? M : R).d2, base = (useM ? M : R).base;
        function keep(k){ for (var j = 0; j < LAW.ret.keep.length; j++) if (k <= LAW.ret.keep[j][0]) return LAW.ret.keep[j][1]; return .5; }
        /* yy년 동안 매년 같은 금액을 받는다고 보고 한 해씩 계산: 퇴직금 원금이 먼저 나옴 · 10년째까지는 연금수령한도(잔액÷(11−연차)×120%) 안만 감면 · 한도 넘는 부분은 감면 없음 */
        function sim(yy){ var bal = p, pr = p, t = 0, A = r > 0 ? p * r / (1 - Math.pow(1 + r, -yy)) : p / yy, done = 0, xs = 0;
          for (var k = 1; k <= yy && bal > 0.001; k++){ var wd = k === yy ? bal : Math.min(A, bal), lim = k <= 10 ? bal / (11 - k) * 1.2 : Infinity, q = Math.min(wd, lim);
            var a = Math.min(pr, q); t += tax * a / p * keep(k); pr -= a;
            var b = Math.min(pr, wd - q); if (b > 0.001){ t += tax * b / p; pr -= b; xs += b; }
            if (pr <= 0.001 && !done) done = k;
            bal = (bal - wd) * (1 + r); }
          return {tax: t, done: done || yy, A: A, xs: xs}; }
        var rows = [["한 번에 받기", tax, null, 0]], seen = {}, S = sim(Y);
        [10, 20, 30, Y].sort(function(a, b){ return a - b; }).forEach(function(y){ if (seen[y]) return; seen[y] = 1; rows.push([y + "년 연금", y === Y ? S.tax : sim(y).tax, null, 0]); });
        var mn = rows.reduce(function(a, x){ return x[1] < a[1] ? x : a; }, rows[0]); mn[3] = 1;
        /* 11/17 사용자 「퇴직소득세 항목에서 금액·세율 순이 아니라 반대로 — 세율을 더 강조」 → 이번 퇴직금 대비 실효세율을 크게, 금액은 작게 */
        function er(t){ var x = p ? t / p : 0; return pct(x, x > 0 && x < .01 ? 2 : 1); }
        function rw(t){ return er(t) + ' <small class="tx-am">' + won(t) + '</small>'; }
        rows.forEach(function(x){ x[2] = rw(x[1]); });
        var h = "";
        if (mid){ var sepT = R.t * LAW.local, mrgT = addT * LAW.local, gap = sepT - mrgT;
          h += big((useM ? "합산 특례 세율" : "이번 퇴직금 세율") + " · 실효", er(tax), "세금 " + won(tax) + (useM ? " · 따로 계산하면 " + er(sepT) + "(" + won(sepT) + ") → " + er(gap) + "p 낮춤 · " + won(gap) + " 덜 냄" : " · 합산 특례가 오히려 불리 — 따로 계산이 유리"), tax > 0 ? "bad" : "ok") +
            bars([["따로 계산 (중간정산 뒤 " + n + "년만)", sepT, rw(sepT), !useM], ["합산 특례 (" + N + "년 · 퇴직금 " + won(p + mp) + ")", mrgT, rw(mrgT), useM]]) +
            '<p class="tx-n">합산 특례: 두 퇴직금을 합쳐 ' + N + '년으로 계산한 세금 ' + won(M.t * LAW.local) + ' − 중간정산 때 낸 ' + won(mt * LAW.local) + '(지방소득세 포함) = ' + won(mrgT) + '</p>';
          if (M.t < mt - 0.05) h += '<p class="tx-n tx-s">합쳐 계산한 세금이 그때 낸 세금보다 적어도 차액은 돌려받지 못함(추가 0원) — 중간정산금을 IRP로 옮겨 세금을 미뤄 둔 경우만 일부 환급(시행령 §203②)</p>';
          if (useM) h += '<p class="tx-n">회사에 <b>중간정산 때 원천징수영수증을 내며 정산을 요청</b>해야 적용 — 안 내면 회사는 따로 계산으로 뗌 (소득세법 §148)</p>';
          h += '<p class="tx-sec">이번 퇴직금 ' + won(p) + ' — 한 번에 vs 연금</p>'; }
        h += big((mid ? "한 번에 받으면" : "한 번에 받으면 세율") + " · 실효", er(tax), "세금 " + won(tax) + " · 실제 받는 돈 " + won(p - tax), tax > 0 ? "bad" : "ok");
        if (tax > 0.05){ h += bars(rows) + '<p class="tx-n">IRP로 옮겨 ' + Y + '년 동안 나눠 받으면 세율 <b class="tx-a">' + er(tax) + ' → ' + er(S.tax) + '</b> (' + pct(1 - S.tax / tax, 0) + ' 감면) — 세금 ' + won(S.tax) + ', ' + won(tax - S.tax) + ' 덜 냄</p>';
          h += '<p class="tx-n">세전 연 ' + won(S.A) + ' · 월 ' + won(S.A / 12) + ' 꼴' + (r > 0 ? ' (수익률 ' + pct(r) + ' 가정)' : ' (운용 수익 빼고)') + '</p>';
          if (S.xs > 0.05) h += '<p class="tx-n tx-w">⚠ ' + Y + '년은 너무 짧음 — 처음 10년은 해마다 찾을 수 있는 한도가 있어 넘는 ' + won(S.xs) + '은 감면을 못 받음. 한도 안에서만 받으려면 10년 이상으로</p>';
          if (r > 0 && S.done < Y) h += '<p class="tx-n">퇴직금 원금은 <b>' + S.done + '년째</b>에 다 나옴 — 그 뒤 ' + (Y - S.done) + '년은 운용 수익을 받는 것이라 연금소득세(3.3~5.5%)가 붙고 <b>연 1,500만 계산에 들어감</b></p>'; }
        else h += '<p class="tx-n">근속연수 공제가 커서 세금이 거의 없음 — 한 번에 받아도 부담 없음</p>';
        h += tips("체크", [
          tax > 0.05 ? "받는 연차가 길수록 유리 — 1~10년째 30% · 11~20년째 40% · <b>21년째부터 50%</b> 감면(2026년 수령분부터)" : "",
          tax > 0.05 ? "연차는 <b>실제로 받은 해</b>만 셈 — 55세에 최소 금액이라도 받기 시작하면 연차가 먼저 쌓임" : "",
          tax > 0.05 ? "IRP로 옮기면 세금을 나중에 내므로 <b>세금 낼 돈까지 굴릴 수 있음</b> (과세이연) · 받은 뒤 60일 안에 넣어도 됨" : "",
          "55세 이후 · 연금수령한도 안에서 받아야 감면 — 중간에 한꺼번에 찾으면 남은 세금을 그때 다 냄",
          "퇴직금 원금으로 받는 연금은 <b>연 1,500만 한도와 상관없고</b> 금융소득·건보료에도 안 잡힘 — 운용 수익과 세액공제 받은 돈은 한도에 들어가니 계좌를 따로 두면 관리가 쉬움"]);
        h += basis([(mid ? (useM ? "합산 특례로 계산(퇴직금 " + won(p + mp) + " · " + N + "년) — " : "따로 계산(퇴직금 " + won(p) + " · " + n + "년) — ") : "") + "2023년 이후 퇴직 기준(소득세법 §48 · 국세청 퇴직소득세 계산방법) — 근속연수공제 " + won(d1) + " → 환산급여 " + won(conv) + " → 환산급여공제 " + won(d2) + " → 과세표준 " + won(base),
          mid ? "중간정산 뒤 퇴직하면 근속연수는 중간정산 다음 날부터 셈(국세청 원천세과-233) · 합산 특례(소득세법 §148·시행령 §203): 이미 받은 퇴직금과 합쳐 세금을 다시 계산한 뒤 그때 낸 세금을 뺌 · 정산 근속 = 두 근속 월수 합 − 겹친 월수(1년 미만 올림)" + (v.mon ? "" : " — 여기서는 두 근속연수를 더함(각각 올림한 연수라 실제보다 최대 1년 길 수 있음 → 「더 정확하게」에 전체 개월 수)") : "",
          mid ? "중간정산 때 낸 세금은 넣은 값(당시 세법) 그대로 빼고, 합산 세금은 지금 세법(2023년 이후 근속연수공제)으로 계산 · 명예퇴직금처럼 처음 입사일부터 근속을 세는 퇴직금이 섞이면 겹친 기간 처리가 달라짐(국세청 서면1팀-510)" : "",
          "세액 = 과세표준 × 기본세율(6~45%) × 근속연수 ÷ 12 · 지방소득세 10% 포함 · 근속 1년 미만은 1년으로 올림",
          "연금 수령: 해마다 같은 금액 · 연금 계좌에서는 세액공제 안 받은 돈 → 퇴직금 → 세액공제 받은 돈·수익 순서로 나옴 · IRP에 퇴직금만 있다고 봄",
          "연금수령한도(시행령 §40의2) = 그해 1월 1일 계좌 평가액 ÷ (11 − 연금수령연차) × 120% · 11년차부터 한도 없음 · 한도 연차는 55세 이후 「받을 수 있게 된 해」부터 안 받아도 올라감(2013년 3월 전 계좌는 6년차부터) — 여기서는 받기 시작한 해를 1년차로 봄(가장 불리한 경우)",
          "감면 70·60·50%는 「실제로 받은 해」만 세는 연차 기준(국세청 연금소득 원천징수 방법 · 20년 초과 50%는 2026.1.1 이후 수령분)",
          "IRP 운용 수익에 붙는 세금과 수수료는 뺐음 · 임원 퇴직금 한도 초과분·비과세 퇴직급여는 안 넣음"].filter(Boolean));
        return h; } },

    { k: "pay", ic: "👵", t: "연금 받을 때 세금", d: "1,500만 선 · 얼마씩 받을까",
      segs: [{id: "life", label: "받는 방식", opts: [["n", "기간 정해서"], ["y", "종신형"]]}],
      fields: [
        {id: "age", label: "받는 나이", unit: "세", req: 1, ph: "예: 60", max: 110},
        {id: "amt", label: "연금저축·IRP에서 받는 돈", sub: "1년 · 세액공제 받은 돈+수익 · 퇴직금 원금은 빼고", req: 1, ph: "예: 1800"},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "선택", adv: 1},
        {id: "oth", label: "그 밖의 소득", sub: "사업·임대·근로 소득금액", ph: "선택", adv: 1}
      ],
      run: function(v){
        var P = LAW.pay, age = v.age || 0, A = v.amt || 0; if (!age || !A) return null;
        var pub = v.pen || 0, oth = v.oth || 0, r = P.r[0][1];
        for (var i = 0; i < P.r.length; i++) if (age < P.r[i][0]){ r = P.r[i][1]; break; }
        if (v.life === "y") r = Math.min(r, P.life);
        var h = "", low = Math.min(A, P.line) * r;
        if (age < 55) h += '<p class="tx-n tx-w">⚠ 55세 전에는 연금으로 못 받음 — 찾으면 기타소득세 16.5%</p>';
        if (A <= P.line){
          h += big("연금 세금", won(A * r), pct(r) + "만 떼고 끝 · 실제 받는 돈 월 " + won((A - A * r) / 12), "ok") +
            '<div class="tx-lim"><div class="tx-lt"><u style="width:' + (A / P.line * 100).toFixed(1) + '%"></u></div><p>1,500만 선까지 <b>' + won(P.line - A) + '</b> 남음 (월 ' + won(P.line / 12) + '까지 낮은 세율)</p></div>';
        } else {
          var b0 = Math.max(0, pub - penDed(pub) + oth - 150), b1 = Math.max(0, pub + A - penDed(pub + A) + oth - 150);
          var sep = A * P.sep, tot = (itax(b1) - itax(b0)) * LAW.local, best = Math.min(sep, tot);
          h += big("연금 세금", won(best), "1,500만을 " + won(A - P.line) + " 넘어 낮은 세율(" + pct(r) + ")을 못 씀 · " + (tot < sep ? "종합과세" : "16.5% 분리과세") + "가 유리", "bad");
          h += bars([["16.5% 분리과세", sep, null, sep <= tot], ["종합과세(다른 소득과 합산)", tot, null, tot < sep], ["1,500만까지만 받으면", low, null, 0]]);
          h += '<p class="tx-n">연 1,500만(월 125만)까지만 받으면 세금 ' + won(low) + ' — 지금보다 <b class="tx-a">' + won(best - low) + '</b> 덜 냄</p>';
          if (!pub && !oth) h += '<p class="tx-n tx-s">다른 소득이 없다고 본 값 — 국민연금·임대소득 등이 있으면 「더 정확하게」에 넣어야 종합과세 쪽이 맞게 나옴</p>';
        }
        h += tips("체크", [
          A > P.line ? "<b>1원이라도 넘으면 전액</b>이 높은 세율 — 받는 기간을 늘려 연 1,500만 이하로 맞추기" : "",
          "1,500만은 <b>연금저축·IRP 여러 계좌를 다 합쳐서</b> 셈 — 퇴직금 원금·세액공제 안 받은 원금·국민연금은 빠지고, 퇴직금을 굴려 생긴 수익은 들어감",
          v.life !== "y" && age < 80 ? "종신형으로 계약하면 나이와 상관없이 3.3% (2026년 수령분부터)" : "",
          age < 70 ? "늦게 받을수록 세율이 내려감 — 70세부터 4.4% · 80세부터 3.3%" : "",
          "해마다 찾을 수 있는 한도(연금수령한도)를 넘겨 찾은 돈은 연금이 아니라 <b>기타소득 16.5%</b>",
          "연금 받는 분이 <b>자녀의 부양가족 공제 대상</b>이면 종합과세를 고르지 말 것 — 분리과세로 끝내야 공제가 유지됨(종합과세면 연 약 517만 초과 수령 시 탈락)",
          "연금저축·IRP 연금은 지금은 건보료가 안 붙음(공적연금만 반영) — 제도가 바뀔 수 있음"]);
        h += basis(["사적연금(연금저축·IRP 중 세액공제 받은 돈과 운용 수익) 연 1,500만 이하(소득세법 §14③9): 70세 미만 5% · 80세 미만 4% · 80세 이상 3% · 종신형 3%(2026.1.1 이후 수령분) — 지방소득세 10%를 더해 5.5 · 4.4 · 3.3% · 겹치면 낮은 쪽",
          "1,500만 초과(§64의4): 전액을 15%(지방소득세 포함 16.5%) 분리과세 또는 종합과세 중 선택 — 종합과세는 연금소득공제(공적+사적 합쳐 최대 900만)와 본인 기본공제 150만만 반영한 어림",
          "국민연금은 2002년 이후 낸 보험료에서 나온 부분만 과세 대상 — 넣은 금액 전부를 과세 대상으로 보고 계산(보수적)",
          "의료비 등 부득이한 사유로 찾는 돈은 한도와 상관없이 3.3~5.5%"]);
        return h; } },

    { k: "ovs", ic: "🌎", t: "해외주식 양도세", d: "올해 얼마 · 손실로 줄이기",
      fields: [
        {id: "gain", label: "올해 판 종목의 이익 합계", sub: "원화 기준 · 수수료 뺀 뒤", req: 1, ph: "예: 3000"},
        {id: "loss", label: "올해 판 종목의 손실 합계", ph: "예: 500"},
        {id: "un", label: "아직 안 판 종목의 평가손실", sub: "연말 전에 팔 수 있는 것", ph: "선택"},
        {id: "ria", label: "그중 RIA 계좌에서 판(팔) 이익", sub: "국내시장 복귀계좌 · 2026년만", ph: "선택", adv: 1}
      ],
      run: function(v){
        var L = LAW.ovs, g = v.gain || 0; if (!g) return null;
        var l = Math.abs(v.loss || 0), u = Math.abs(v.un || 0), ria = Math.min(v.ria || 0, g), cut = ria * L.ria, net = g - l;
        var tax0 = Math.max(0, net - L.ded) * L.rate, tax = Math.max(0, net - cut - L.ded) * L.rate, tax2 = Math.max(0, net - u - cut - L.ded) * L.rate, riaOn = Date.now() < Date.UTC(2026, 11, 31, 15);
        var h = big("내년 5월에 낼 세금", won(tax), tax > 0 ? "순이익 " + won(net) + (cut ? " − RIA 공제 " + won(cut) : "") + " − 기본공제 250만 = " + won(net - cut - L.ded) + " × 22%" : "순이익 " + won(net) + (cut ? " − RIA 공제 " + won(cut) : "") + " — 250만 공제 안이라 세금 없음 (신고는 해야 함)", tax > 0 ? "bad" : "ok");
        if (cut > 0 && tax0 > tax) h += bars([["RIA 없이", tax0], ["RIA 공제 반영", tax, null, 1]]) + '<p class="tx-n">RIA 계좌에서 판 이익 ' + won(ria) + '의 50%를 공제받아 <b class="tx-a">' + won(tax0 - tax) + '</b> 덜 냄 — 판 돈을 1년간 RIA 안에서 국내 주식·펀드에 둬야 유지됨</p>';
        if (u > 0 && tax > 0) h += bars([["지금대로", tax], ["손실 종목도 팔면", tax2, null, 1]]) + '<p class="tx-n">평가손실 ' + won(u) + '을 올해 안에 팔아 확정하면 <b class="tx-a">' + won(tax - tax2) + '</b> 덜 냄 — 다시 사도 됨</p>';
        else if (tax > 0) h += '<p class="tx-n">손실 난 해외 종목이 있다면 올해 안에 팔아 이익과 상계 — 손실 100만마다 세금 22만 줄어듦</p>';
        else if (net - cut < L.ded && net > 0) h += '<p class="tx-n">공제가 <b class="tx-a">' + won(L.ded - (net - cut)) + '</b> 남음 — 이익 난 종목을 그만큼 팔았다 다시 사면 취득가를 세금 없이 높일 수 있음</p>';
        h += tips("체크", [
          "<b>결제일 기준</b> — 12월 마지막 주에 판 건 내년으로 넘어갈 수 있음 · 나라마다 마감일이 다르니 증권사 공지 확인",
          riaOn && !ria && tax > 0 ? "<b>RIA(국내시장 복귀계좌)</b>: 2025년 12월 23일에 갖고 있던 해외주식을 RIA로 옮겨 12월 31일(결제)까지 팔면 그 이익의 50% 공제 — 매도금액 5,000만 한도 · 판 돈은 1년간 국내 주식·펀드 · 다른 계좌에서 해외주식을 새로 사면 그만큼 깎임" : "",
          "250만 공제는 <b>1년에 한 번 · 사람마다</b> — 해외주식·국내 과세 주식(대주주·장외) 합쳐서",
          "배우자·자녀 계좌에서 판 이익(손실 뺀 뒤)이 <b>100만을 넘으면 연말정산 부양가족 공제에서 빠짐</b> — 250만이 아니라 100만이 기준",
          tax > 0 ? "배우자에게 증여(10년 6억 공제) 뒤 팔기는 <b>1년 넘게 가진 뒤 팔아야</b> 효과 있음 (2025년 증여분부터)" : "",
          "양도세는 금융소득 2,000만·건보료 계산에 안 들어감 · 배당은 따로 과세(미국 15% 현지 원천징수 · 금융소득에 포함)"]);
        h += basis(["세율 22% = 양도소득세 20% + 지방소득세 2% · 기본공제 연 250만(소득세법 §118의7)",
          "같은 해 해외주식끼리 이익·손실 합산 · 손실은 다음 해로 못 넘김",
          "이익은 판 날·산 날 각각의 환율로 원화 환산한 차이 — 환율이 올라 생긴 이익도 과세 · 같은 종목을 나눠 샀으면 증권사 방식(선입선출·이동평균)에 따라 이익이 달라짐",
          "RIA(조특법 §91의26): 공제액 = RIA 안 양도소득 × 공제율(결제일 5/31까지 100% · 7/31까지 80% · 12/31까지 50%) × 조정비율(다른 계좌에서 해외주식을 순매수하면 줄어듦) — 여기서는 12월 50%·조정 없음으로 계산",
          "세금이 없어도 신고 대상 · 신고·납부를 안 하면 무신고·납부지연 가산세가 붙음",
          "국내 상장 해외 ETF는 양도세가 아니라 배당소득세(15.4%) — 이 계산기 대상 아님"]);
        return h; } },

    { k: "isa", ic: "🧺", t: "ISA 절세", d: "일반 계좌보다 얼마 아끼나",
      segs: [{id: "kind", label: "가입 유형", opts: [["n", "일반형"], ["s", "서민형·농어민"]]}],
      fields: [
        {id: "pf", label: "만기까지 예상 순이익", sub: "이자·배당·ETF 분배금·해외 ETF 차익 (손실 뺀 뒤)", req: 1, ph: "예: 1000"},
        {id: "mv", label: "만기 때 연금계좌로 옮길 돈", ph: "선택", adv: 1}
      ],
      run: function(v){
        var I = LAW.isa, p = v.pf || 0; if (!p) return null;
        var free = I.free[v.kind === "s" ? "s" : "n"], n = p * I.normal, t = Math.max(0, p - free) * I.rate, mv = v.mv || 0, cr = Math.min(mv * LAW.pen.isaRate, LAW.pen.isaMax);
        var h = big("ISA로 아끼는 세금", won(n - t), "일반 계좌 " + won(n) + " → ISA " + won(t), "ok") + bars([["일반 계좌 (15.4%)", n], ["ISA", t, null, 1]]);
        h += '<p class="tx-n">' + won(Math.min(p, free)) + '까지 세금 0' + (p > free ? ' · 넘는 ' + won(p - free) + '은 9.9%로 끝' : ' — 비과세 한도 ' + won(free - p) + ' 남음') + '</p>';
        if (cr > 0) h += '<p class="tx-n">만기에 ' + won(mv) + '을 연금계좌로 옮기면 <b class="tx-a">' + won(cr * LAW.pen.loRate) + '~' + won(cr * LAW.pen.hiRate) + '</b> 추가 환급 (옮긴 돈의 10% · 최대 300만 공제)</p>';
        h += tips("체크", [
          "ISA 안 수익은 <b>금융소득 2,000만·건보료 계산에서 빠짐</b> — 9.9% 떼고 끝",
          "이익과 손실을 <b>합쳐서</b> 순이익에만 과세 — 일반 계좌는 이익에만 과세",
          "국내 주식·국내 주식형 ETF 매매차익은 원래 세금이 없어 ISA 효과가 없음 — 배당·이자·해외 ETF·ELS 쪽이 효과 큼",
          "비과세 한도는 <b>계좌를 닫을 때 한 번</b> 적용 — 3년 채운 뒤 해지하고 다시 가입하면 한도를 또 쓸 수 있음",
          "3년은 채워야 혜택(그 전에 깨면 15.4%) · 넣은 원금까지는 중간에 찾아도 됨",
          "직전 3년 안에 금융소득종합과세 대상이었으면 가입 불가"]);
        h += basis(["비과세 한도(조특법 §91의18): 일반형 200만 · 서민형·농어민형 400만 · 초과분 9.9% 분리과세 (지방소득세 포함)",
          "납입 한도: 연 2,000만 · 총 1억 (안 쓴 한도는 다음 해로 넘어감)",
          "일반 계좌 세율은 15.4%로 봄 — 해외 ETF 분배금의 현지 세금은 따로",
          "2026년 세제개편안(국회 심의 중)이 통과되면 2027년부터 한도 이월 폐지 · 총 계약 5년 · 국내 투자용 「생산적 금융 ISA」(연 2,000만·총 2억 · 이자·배당 전액 비과세)가 따로 생김 — 확정되면 이 계산기에 반영",
          "서민형: 총급여 5,000만(종합소득 3,800만) 이하"]);
        return h; } }
  ];

  /* ───────── 화면 ───────── */
  var ST = {};   // 항목별로 넣은 값(메모리에만)
  CALCS.forEach(function(c){ ST[c.k] = {}; (c.segs || []).forEach(function(s){ ST[c.k][s.id] = s.opts[0][0]; }); });
  function sel(){ var k = ls("txsel"); return CALCS.filter(function(c){ return c.k === k; })[0] || null; }
  function pickHtml(c0){ return '<div class="tx-pick">' + CALCS.map(function(c){ return '<button type="button" data-txk="' + c.k + '" data-j="txform"' + (c0 && c0.k === c.k ? ' class="on"' : '') + '><span>' + c.ic + '</span><b>' + c.t + '</b><small>' + c.d + '</small></button>'; }).join("") + '</div>'; }
  function formHtml(c){ var v = ST[c.k];
    return head(c.ic + " " + c.t, LAW.asof) +
      (c.segs || []).map(function(s){ return '<div class="tx-seg" role="group" aria-label="' + s.label + '"><em>' + s.label + '</em><div>' + s.opts.map(function(o){ return '<button type="button" data-txs="' + s.id + '" data-v="' + o[0] + '"' + (v[s.id] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join("") + '</div></div>'; }).join("") +
      (function(){ var show = c.fields.filter(function(f){ return !f.on || f.on(v); }), adv = show.filter(function(f){ return f.adv; }), open = v._adv || adv.some(function(f){ return v[f.id]; });
        function one(f){ return '<label class="tx-f"><span>' + f.label + (f.req && !f.sub ? '' : '<small>' + (f.req ? '' : '<s>선택</s>') + (f.sub || '') + '</small>') + '</span><i><input data-txf="' + f.id + '" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" maxlength="' + (f.unit ? 3 : 10) + '" placeholder="' + e(f.ph || "") + '" value="' + (v[f.id] ? (f.unit ? v[f.id] : Number(v[f.id]).toLocaleString()) : "") + '"><em>' + (f.unit || "만원") + '</em></i></label>'; }
        return show.filter(function(f){ return !f.adv; }).map(one).join("") +
          (adv.length ? (open ? '<p class="tx-advh">더 정확하게 <small>아는 것만 넣으면 됨</small></p>' + adv.map(one).join("") : '<button type="button" class="tx-adv" data-txadv="1">＋ 더 정확하게 <small>' + adv.map(function(f){ return f.label.replace(/^그중 /, ""); }).join(" · ") + '</small></button>') : ''); })() +
      '<button type="button" class="tx-clr" data-txclr="1">입력 지우기</button>';
  }
  function outHtml(c){ var h = null; try { h = c.run(ST[c.k]); } catch(x){ console.error("tax", x); h = '<p class="tx-n">계산하지 못했어요 — 숫자를 다시 확인해 주세요</p>'; }
    if (h == null){ var vv = ST[c.k], need = c.fields.filter(function(f){ return f.req && (!f.on || f.on(vv)); }).map(function(f){ return f.label; });
      return '<p class="tx-wait"><b>' + need.join(" · ") + '</b>만 넣으면 바로 계산돼요<small>나머지는 넣을수록 정확해져요 · 단위는 만원</small></p>'; }
    return head("결과", "넣는 즉시 다시 계산") + h; }
  function view(){ var c = sel();
    return '<div id="tx" data-noemo="1"><section class="card hub-c no-clp" data-cz="done" data-xc="1">' + head("세무계산기", "항목을 고르고 숫자만 넣으면 끝") + pickHtml(c) + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txform"' + (c ? '' : ' hidden') + '>' + (c ? formHtml(c) : '') + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txout"' + (c ? '' : ' hidden') + '>' + (c ? outHtml(c) : '') + '</section>' +
      '<p class="hub-n">' + LAW.asof + ' · 세율·공제·한도는 법령·국세청·건강보험공단 원문과 대조한 값 (2026-11-16)<br>개인별 공제·세대 합산은 넣은 값만 반영 — 신고 전 세무사·홈택스·공단 확인 · 넣은 금액은 저장되지 않아요</p></div>'; }
  function paintOut(){ var c = sel(), o = D.getElementById("txout"); if (c && o){ o.hidden = false; o.innerHTML = outHtml(c); } }
  function paintForm(){ var c = sel(), f = D.getElementById("txform"); if (c && f){ f.hidden = false; f.innerHTML = formHtml(c); } paintOut(); }
  function choose(k, scroll){ ls("txsel", k);
    [].forEach.call(D.querySelectorAll("#tx [data-txk]"), function(b){ b.classList.toggle("on", b.dataset.txk === k); });
    paintForm();
    if (scroll){ var f = D.getElementById("txform"); try { f.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} } }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#tx [data-txk], #tx [data-txs], #tx [data-txclr], #tx [data-txadv]"); if (!t) return;
    var c = sel();
    if (t.dataset.txk){ choose(t.dataset.txk, true); return; }
    if (!c) return;
    if (t.dataset.txs){ ST[c.k][t.dataset.txs] = t.dataset.v; paintForm(); return; }
    if (t.dataset.txadv){ ST[c.k]._adv = 1; paintForm(); return; }
    if (t.dataset.txclr){ var keep = {}; (c.segs || []).forEach(function(s){ keep[s.id] = ST[c.k][s.id]; }); ST[c.k] = keep; paintForm(); }
  });
  D.addEventListener("input", function(ev){
    var t = ev.target; if (!t || !t.dataset || !t.dataset.txf || !t.closest("#tx")) return;
    var c = sel(); if (!c) return;
    var f = c.fields.filter(function(x){ return x.id === t.dataset.txf; })[0] || {};
    var raw = String(t.value).replace(/[０-９]/g, function(ch){ return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); }).replace(/[^0-9]/g, ""), n = raw ? parseInt(raw, 10) : 0;
    if (f.max && n > f.max) n = f.max;
    ST[c.k][f.id] = n;
    var show = raw ? (f.unit ? String(n) : n.toLocaleString()) : ""; if (t.value !== show) t.value = show;
    paintOut();
  });
  D.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && ev.target && ev.target.dataset && ev.target.dataset.txf) ev.target.blur(); });

  /* 화면 연결 (index.html go → hubView/hubInit) */
  var V0 = window.hubView, I0 = window.hubInit;
  window.hubView = function(key){ if (key === "tax") return view(); return V0 ? V0(key) : ""; };
  window.hubInit = function(key){ if (key === "tax") return; if (I0) I0(key); };
  window.__tax = {calcs: CALCS, state: ST, law: LAW, choose: choose};   // 점검용

  var st = D.createElement("style");
  st.textContent =
    "html[data-tab=tax] #main>.hero{display:none!important}" +
    ".tx-pick{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".tx-pick button{font:inherit;text-align:left;color:var(--text);background:transparent;border:1px solid var(--line);border-radius:14px;padding:11px 12px 10px;cursor:pointer;display:flex;flex-direction:column;gap:1px;min-width:0}" +
    ".tx-pick button:active{transform:scale(.98)}.tx-pick button.on{border-color:#3182f6;background:rgba(49,130,246,.10);box-shadow:inset 0 0 0 1px #3182f6}" +
    ".tx-pick span{font-size:20px;line-height:1.2}.tx-pick b{font-size:15px;font-weight:800;letter-spacing:-.3px;word-break:keep-all}.tx-pick small{font-size:12.5px;color:var(--sub);line-height:1.35;word-break:keep-all}" +
    ".tx-seg{margin:0 0 12px}.tx-seg>em{display:block;font-style:normal;font-size:13px;font-weight:700;color:var(--sub);margin:0 2px 6px}.tx-seg>div{display:flex;gap:6px}" +
    ".tx-seg button{flex:1 1 0;min-width:0;font:inherit;font-size:14.5px;font-weight:700;padding:10px 4px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);cursor:pointer;word-break:keep-all}" +
    ".tx-seg button.on{background:#3182f6;border-color:#3182f6;color:#fff}" +
    ".tx-f{display:grid;grid-template-columns:minmax(0,1fr) 142px;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}" +
    ".tx-f>span{font-size:15px;font-weight:700;line-height:1.35;word-break:keep-all;min-width:0}.tx-f>span small{display:block;font-size:12.5px;font-weight:500;color:var(--sub)}.tx-f>span s{text-decoration:none;font-size:11.5px;font-weight:600;border:1px solid var(--line);border-radius:6px;padding:0 5px;margin-right:5px;white-space:nowrap}" +
    ".tx-f>i{font-style:normal;display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:12px;padding:0 10px;min-width:0}.tx-f>i:focus-within{border-color:#3182f6}" +
    ".tx-f input{flex:1;min-width:0;width:100%;font:inherit;font-size:17px;font-weight:700;text-align:right;padding:11px 0;border:0;outline:0;background:transparent;color:var(--text);font-variant-numeric:tabular-nums}.tx-f input::placeholder{font-size:13px;font-weight:500;color:var(--sub);opacity:.7}" +
    ".tx-f>i em{font-style:normal;font-size:13px;color:var(--sub);white-space:nowrap}" +
    ".tx-adv{display:block;width:100%;font:inherit;font-size:14.5px;font-weight:700;text-align:left;color:#3182f6;background:transparent;border:0;border-top:1px solid var(--line);padding:13px 0 6px;cursor:pointer;word-break:keep-all}.tx-adv small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px;line-height:1.4}" +
    ".tx-advh{margin:0;padding:13px 0 8px;border-top:1px solid var(--line);font-size:14.5px;font-weight:800;color:#3182f6}.tx-advh small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".tx-s{font-size:13px!important;color:var(--sub)}" +
    ".tx-clr{display:block;margin:8px 0 0 auto;font:inherit;font-size:13px;color:var(--sub);background:transparent;border:0;text-decoration:underline;cursor:pointer;padding:8px 2px}" +
    ".tx-wait{margin:6px 0;font-size:15px;line-height:1.55;text-align:center;color:var(--sub);word-break:keep-all}.tx-wait b{color:var(--text)}.tx-wait small{display:block;font-size:12.5px;margin-top:4px}" +
    ".tx-sec{margin:18px 0 8px;font-size:13.5px;font-weight:800;color:var(--sub)}" +
    ".tx-big{border-radius:16px;padding:14px 16px;margin:0 0 10px;background:rgba(128,128,128,.10)}.tx-big small{display:block;font-size:13.5px;font-weight:700;color:var(--sub)}" +
    ".tx-big b{display:block;font-size:28px;font-weight:800;letter-spacing:-.6px;line-height:1.25;font-variant-numeric:tabular-nums;word-break:keep-all}.tx-big span{display:block;font-size:13.5px;color:var(--sub);line-height:1.5;margin-top:3px;word-break:keep-all}" +
    ".tx-big.tx-ok{background:rgba(49,130,246,.10)}.tx-big.tx-ok b{color:#3182f6}.tx-big.tx-bad{background:rgba(240,68,82,.10)}.tx-big.tx-bad b{color:#f04452}" +
    ".tx-bars{margin:12px 0 4px}.tx-b{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:baseline;margin:0 0 10px}.tx-b>span{font-size:13.5px;font-weight:600;color:var(--sub);word-break:keep-all}.tx-b>b{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".tx-b>i{grid-column:1/3;display:block;height:12px;border-radius:6px;background:rgba(128,128,128,.14);overflow:hidden}.tx-b>i u{display:block;height:100%;border-radius:6px;background:rgba(128,128,128,.55);text-decoration:none}" +
    ".tx-b>b .tx-am{font-size:12.5px;font-weight:600;color:var(--sub);margin-left:4px}.tx-b.tx-best>span{color:var(--text);font-weight:800}.tx-b.tx-best>b{color:#3182f6}.tx-b.tx-best>i u{background:#3182f6}" +
    ".tx-n{margin:6px 2px 10px;font-size:14.5px;line-height:1.55;word-break:keep-all}.tx-a{color:#3182f6}.tx-r{color:#f04452}.tx-w{color:#f04452;font-weight:700}" +
    ".tx-g{margin:4px 0 6px}.tx-gt,.tx-lt{position:relative;height:14px;border-radius:7px;background:rgba(128,128,128,.14);margin:26px 0 26px}.tx-lt{margin-top:6px}.tx-gt i.up em{top:auto;bottom:22px}" +
    ".tx-gt u,.tx-lt u{display:block;height:100%;border-radius:7px;background:#3182f6;text-decoration:none;max-width:100%}.tx-gt u.y{background:#f5a623}.tx-gt u.r{background:#f04452}" +
    ".tx-gt i,.tx-lt i{position:absolute;top:-3px;width:2px;height:20px;background:var(--text);opacity:.75}.tx-gt i em,.tx-lt i em{position:absolute;top:22px;left:50%;transform:translateX(-50%);font-style:normal;font-size:11.5px;font-weight:700;line-height:1.25;color:var(--sub);text-align:center;white-space:nowrap;opacity:1}" +
    ".tx-g p,.tx-lim p{margin:0 2px 4px;font-size:14.5px;line-height:1.5;word-break:keep-all}.tx-lim{margin:10px 0 6px}" +
    ".tx-th{margin:16px 0 4px;font-size:13.5px;font-weight:800;color:var(--sub)}.tx-tip{list-style:none;margin:0;padding:0}.tx-tip li{position:relative;padding:8px 0 8px 16px;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.55;word-break:keep-all}.tx-tip li:last-child{border-bottom:0}.tx-tip li:before{content:'';position:absolute;left:2px;top:17px;width:6px;height:6px;border-radius:50%;background:#3182f6}" +
    ".tx-base{margin:12px 0 0;border-top:1px solid var(--line)}.tx-base summary{font-size:13.5px;font-weight:700;color:var(--sub);padding:11px 2px 4px;cursor:pointer}.tx-base ul{margin:4px 0 0;padding:0 0 0 16px}.tx-base li{font-size:12.5px;color:var(--sub);line-height:1.55;margin:0 0 5px;word-break:keep-all}" +
    "@media (max-width:340px){.tx-seg button{font-size:13px;padding:10px 2px;white-space:nowrap;letter-spacing:-.5px}.tx-f{grid-template-columns:minmax(0,1fr) 118px}.tx-big b{font-size:24px}}";
  D.head.appendChild(st);
})();
;
/* ======== ux1118.js ======== */
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
;
