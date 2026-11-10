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
    ["하락장", "고점보다 20% 넘게 빠진 장 (종가 기준). 이때는 현금을 늘리고 새로 사지 않는 게 앱의 규칙임."],
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
    r.innerHTML = [["wlbtn", "★", "관심종목"], ["opbtn", "📨", "화면 한 장"], ["uibtn", "⚙", "보기 설정"], ["@role", "👤", "나는 누구?"]].map(function(x){ return '<button type="button" data-tool="' + x[0] + '"><span>' + x[1] + '</span>' + x[2] + '</button>'; }).join("");
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
