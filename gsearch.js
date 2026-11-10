/* 🔍 어디서든 종목 검색 (10/9) — 헤더 🔍 를 누르고 종목명·코드를 치면 바로 종목리포트로.
   한글 이름·영문·티커·6자리 코드 모두 (종목리포트 검색과 같은 목록 · 약 2만 종목 + ETF) */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function close(){ var o = document.getElementById("gsq"); if (o) o.remove(); document.body.classList.remove("gs-open"); }
  function go(sym){ close(); if (window.openOP) openOP(sym); }
  /* 💬 고객이 물으면 (11/2 A11/2-3) — 상담 자리에서 고객이 자주 묻는 말 → 앱 안에서 그 답이 있는 카드 2~3장으로 바로.
     자유 입력·AI 없음(0원) · 사람이 고른 대응표 · 누르면 그 탭의 그 카드로 스크롤·반짝(goTo 그대로) → 떠 있는 「📨 보내기」로 그 화면 한 장 */
  var ASK = [
    ["금리 내리면?", [["🗺 금리 한 장 지도 · 미 10년 금리 vs 코스피", "market", "#p4map"], ["🏛 국고채 · 지금 금리 · 만기까지 받는 돈", "bond", "#pdbody"]]],
    ["ELS 괜찮아요?", [["🎬 청약 중 ELS · 과거엔 몇 번 끝났나", "els", "#pdbody"], ["📌 내 ELS 관제탑 · 낙인까지 거리", "els", "#elsmy"]]],
    ["지금 들어가도?", [["🎲 다음 장 오를 확률 · 오늘과 닮은 날", "prob", "#prbody"], ["🧭 장 분위기판 · 지금 어느 국면", "sector", "#rbboard"], ["⏳ 장 분위기 전환 예보", "sector", "#cpd"]]],
    ["급락인데 팔까요?", [["😱 그날 겁먹고 팔았다면 · 포트 설계기 안", "port", "#podz"], ["⏳ 장 분위기 전환 예보", "sector", "#cpd"], ["🎲 다음 장 오를 확률", "prob", "#prbody"]]],
    ["요즘 뭐가 세요?", [["🔥 오늘 장중 섹터 발동", "sector", "#tlog"], ["🌍 세계 시장 하루 흐름", "sector", "#cptop"], ["🗺 오늘 업종 지도", "home", ".h2-map"]]],
    ["환율은요?", [["📊 실시간 시장판 · 원/달러", "market", "#live"], ["💵 미국채 · 달러 채권 목록", "bond", "#pdbody"]]],
    ["연금은 뭘로?", [["🌱 개인연금 폼", "prop", '.pp-f[data-k="pension"]'], ["🏢 DC 폼", "prop", '.pp-f[data-k="dc"]'], ["🛡️ IRP 폼", "prop", '.pp-f[data-k="irp"]']]],
    ["목표 금액 되나요?", [["🎯 목표에서 거꾸로 · 폼마다 과거에 닿은 비율", "prop", ".pp-gl"], ["🎛 포트 설계기 · 비중 바꿔 다시 계산", "port", "#podz"]]],
    ["섞으면 어때요?", [["🧪 폼 둘 넘게 고르면 · 섞은 과거", "prop", ".pp-grid"]]],
    ["내 포트 괜찮아요?", [["🏁 시장 14곳과 비교", "port", "#pocmp"], ["🔬 내 돈 속 진짜 종목", "port", "#xrsec"], ["🎛 포트 설계기", "port", "#podz"]]],
    ["큰손들은 뭐 사요?", [["🐋 큰손 픽 · 오늘의 신호", "whale", "#wbody"], ["🎯 큰손이 새로 산 종목 · 그 뒤 성적", "whale", "#p4ws"], ["🔥 돈 몰리는 곳 · 집중 성적", "market", "#mkfo"]]],
    ["이번 주 일정은?", [["📅 이번 주 일정판 · 실적·지표", "market", "#pms"], ["🌙 밤사이 가장 크게 움직인 3가지", "market", "#pmo"]]]
  ];
  function settle(id){   // 탭이 늦게 그려지며 자리가 밀리면 한 번 더 맞춤
    [1300, 2600].forEach(function(t){ setTimeout(function(){ var el = document.getElementById(id); if (!el) return;
      var hd = document.querySelector("header"), jb = document.querySelector(".fold-jump"), off = (hd ? hd.offsetHeight : 0) + (jb ? jb.offsetHeight : 0) + 8, r = el.getBoundingClientRect();
      if (r.top < off - 30 || r.top > window.innerHeight * 0.45) window.scrollTo({top: Math.max(0, r.top + window.scrollY - off), behavior: "smooth"}); }, t); });
  }
  function jump(tab, sel){
    close();
    if (!window.goTo){ if (window.go) go(tab); return; }
    if (sel.charAt(0) === "#" && sel.indexOf(" ") < 0){ goTo(tab, sel.slice(1)); settle(sel.slice(1)); return; }
    goTo(tab);
    var t0 = Date.now();
    (function f(){ var el = document.querySelector(sel);
      if (el){ if (!el.id) el.id = "ask" + Math.random().toString(36).slice(2, 7); goTo(tab, el.id); settle(el.id); return; }
      if (Date.now() - t0 < 8000) setTimeout(f, 200); })();
  }
  /* 🧊 11/09 ⑭ 질문형 검색 — 「브라질 국채 지금 어때」「삼성전자 컵이야?」처럼 쳐도 답 카드로. 사람이 고른 낱말표 · AI 없음(0원) */
  var QW = [
    [/브라질|헤알/, [["🇧🇷 브라질 국채 · 금리·헤알 · 전망 보고서", "bond", "#pdbody"]]],
    [/미국채|미 국채|달러 ?채권/, [["🇺🇸 미국채 · 지금 금리 · 전망", "bond", "#pdbody"]]],
    [/하락장|폭락|급락|바닥|현금/, [["🐻 하락장 계기판 · 바닥 신호", "home", "#bear"]].concat(ASK[3][1].slice(0, 2))],
    [/금리|국채|채권/, ASK[0][1]], [/els|ELS|이엘에스/i, ASK[1][1]], [/들어가|살까|사도|타이밍|매수/, ASK[2][1]], [/팔까|손절|매도/, ASK[3][1]],
    [/섹터|업종|테마|요즘|세요|센 ?거/, ASK[4][1]], [/환율|달러|원화/, ASK[5][1]], [/연금|irp|IRP|DC|퇴직/i, ASK[6][1]], [/목표|모으|노후/, ASK[7][1]],
    [/포트|비중|배분|뭐 ?사/, [["💼 지금 이렇게 담으면 돼요 · 비중", "port", "#porec"]].concat(ASK[9][1].slice(0, 2))], [/큰손|고래|기관|연기금/, ASK[10][1]], [/일정|cpi|CPI|실적|fomc|FOMC|고용/, ASK[11][1]],
    [/수급|외국인|외인|기관|순매수|쌍끌이/, [["🧲 국내 수급 · 외국인·기관 집중 매수", "flow", "#flrank"]]], [/확률|오를까|오르나|내릴까/, [["🎲 다음 장 오를 확률 · 한국장 기준", "prob", "#prbody"]]], [/제안서|제안|성향/, [["📝 고객 제안서 만들기 · 4단계", "prop", ".pp-pf"]]],
    [/한 ?장|보내|카톡/, [["📨 고객에게 오늘 한 장 · 홈", "home", "#ezhero"]]], [/운세|사주|타로|로또/, [["🔮 오늘의 운세 · 사주 · 타로", "luck", "#main"]]],
    [/펀드|사모/, [["🧺 펀드 · 사모 라인업", "fund", "#pdbody"]]], [/컵|cup/i, [["☕ 컵 차트 · 돌파 임박", "cup", "#main"]]], [/갭/, [["📈 갭 상승 · 오늘 갭 지도", "gap", "#main"]]]
  ];
  var QSTOP = /(지금|요즘|오늘|어때요?|어떤가요?|어떻게|괜찮아요?|이야|인가요?|일까|이에요|예요|봐|보여|줘|좀|\?|？|컵(이야|인가|이에요)?|사도 ?돼|살까|팔까)/g;
  function stripQ(q){ return String(q).replace(QSTOP, " ").replace(/\s+/g, " ").trim(); }
  function qAnswers(q){
    if (!q || q.length < 2) return [];
    var out = [], seen = {};
    QW.forEach(function(w){ if (w[0].test(q)) w[1].forEach(function(d){ var k = d[1] + d[2]; if (!seen[k] && out.length < 4){ seen[k] = 1; out.push(d); } }); });
    if (/컵/.test(q) && window.opSearch){ var st = stripQ(q), r = st ? opSearch(st)[0] : null; if (r) out.unshift(["☕ " + r.name + " — 종목리포트에서 컵 여부·차트", "@op", r.sym]); }
    return out.slice(0, 4);
  }
  function askHTML(on){
    return '<div class="gs-ask"><div class="gs-ah">💬 고객이 물으면 <small>누르면 답이 있는 카드로</small></div><div class="gs-ac">' +
      ASK.map(function(a, i){ return '<button type="button" data-ask="' + i + '"' + (i === on ? ' class="on"' : '') + '>' + e(a[0]) + '</button>'; }).join("") + '</div>' +
      (on != null && ASK[on] ? '<div class="gs-ag">' + ASK[on][1].map(function(d, j){ return '<button type="button" data-aj="' + on + '_' + j + '">' + e(d[0]) + '<small>' + e({home: "오늘", market: "시장", sector: "시장 · 분위기", prob: "시장 · 확률", port: "포트", bond: "상품 · 채권", fund: "상품 · 펀드", els: "상품 · ELS", prop: "제안서", whale: "신호 · 큰손"}[d[1]] || d[1]) + ' ›</small></button>'; }).join("") +
        '<p class="gs-an">카드로 간 뒤 아래 「📨 보내기」를 누르면 그 화면을 한 장으로 보낼 수 있어요 · 참고용 · 사라·팔라는 뜻 아님</p></div>' : '') + '</div>';
  }
  function open(){
    if (document.getElementById("gsq")) return;
    var o = document.createElement("div"); o.id = "gsq";
    o.innerHTML = '<div class="gs-box"><div class="gs-row"><input aria-label="종목명·코드" id="gsin" type="search" placeholder="종목·질문 (예: 삼성전자, 브라질 국채 어때)" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="gs-x" aria-label="닫기">✕</button></div>' +
      '<div id="gsask"></div><div id="gsres" class="gs-res"><div class="gs-hint">종목 목록 불러오는 중…</div></div></div>';
    document.body.appendChild(o); document.body.classList.add("gs-open");
    o.addEventListener("click", function(ev){ if (ev.target === o) close(); });
    o.querySelector(".gs-x").onclick = close;
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres");
    var ask = document.getElementById("gsask"), aOn = null;
    function drawAsk(){ ask.innerHTML = askHTML(aOn); ask.style.display = inp.value.trim() ? "none" : ""; }
    ask.onclick = function(ev){ var t = ev.target.closest && ev.target.closest("button"); if (!t) return;
      if (t.dataset.ask != null){ aOn = aOn === +t.dataset.ask ? null : +t.dataset.ask; drawAsk(); try { if (window.ntfyUse) ntfyUse("ask_chip"); } catch(z) {} return; }
      if (t.dataset.aj){ var q = t.dataset.aj.split("_"), d = ASK[+q[0]][1][+q[1]]; jump(d[1], d[2]); } };
    drawAsk();
    setTimeout(function(){ inp.focus(); }, 30);
    var ready = false;
    (window.opLoadIdx ? opLoadIdx() : Promise.reject()).then(function(){ ready = true; res.innerHTML = '<div class="gs-hint">이름이나 코드를 치면 바로 찾아요 · 엔터 = 첫 번째 종목</div>'; if (inp.value) draw(); })
      .catch(function(){ res.innerHTML = '<div class="gs-hint">목록을 못 불러왔어요. 잠시 뒤 다시.</div>'; });
    function draw(){
      var q0 = inp.value.trim(); if (!q0){ res.innerHTML = ""; return; }
      var qa = qAnswers(q0), qh = qa.length ? '<div class="gs-qa"><div class="gs-ah">💬 이 질문의 답 <small>누르면 그 카드로</small></div>' + qa.map(function(d, j){ return '<button type="button" data-qa="' + j + '">' + e(d[0]) + '</button>'; }).join("") + '</div>' : '';
      if (!ready){ res.innerHTML = qh || '<div class="gs-hint">종목 목록 불러오는 중…</div>'; bindQa(qa); return; }
      var q = stripQ(q0) || q0;
      var r = opSearch(q).slice(0, qa.length ? 6 : 12), FL = window.FLAG || {};
      res.innerHTML = qh + (r.length ? r.map(function(x){
        return '<button data-s="' + e(x.sym) + '">' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b>' + (x.etf ? ' <span class="gs-etf">ETF</span>' : '') +
          '<small>' + e(window.V && V.cd ? V.cd(x.sym) : x.sym) + (x.built ? '' : ' · 준비 중') + '</small></button>'; }).join("")
        : (qa.length ? '' : '<div class="gs-hint">「' + e(q0) + '」 — 찾는 종목·질문이 없어요 · 예: 「브라질 국채 지금 어때」「하락장이면?」</div>'));
      [].forEach.call(res.querySelectorAll("button[data-s]"), function(b){ b.onclick = function(){ go(b.dataset.s); }; });
      bindQa(qa);
    }
    function bindQa(qa){ [].forEach.call(res.querySelectorAll("button[data-qa]"), function(b){ b.onclick = function(){ var d = qa[+b.dataset.qa]; try { if (window.ntfyUse) ntfyUse("ask_free"); } catch(z) {} if (d[1] === "@op") go(d[2]); else jump(d[1], d[2]); }; }); }
    inp.oninput = function(){ draw(); ask.style.display = inp.value.trim() ? "none" : ""; };
    inp.onkeydown = function(ev){
      if (ev.key === "Escape") close();
      if (ev.key === "Enter"){ var qa = qAnswers(inp.value.trim()); if (qa.length && qa[0][1] !== "@op"){ jump(qa[0][1], qa[0][2]); return; } if (ready){ var r = opSearch(stripQ(inp.value.trim()) || inp.value.trim())[0]; if (r) go(r.sym); } }
    };
  }
  window.gsOpen = open;
  window.__gsAsk = {list: ASK, jump: jump};   // 11/05 📋 받은 글 → 답장 한 장(ux1105b)이 답 카드 칩을 같이 씀
  function addBtn(){
    var top = document.querySelector("header .top"); if (!top || document.getElementById("gsbtn")) return;
    var b = document.createElement("button"); b.id = "gsbtn"; b.setAttribute("aria-label", "종목 검색"); b.innerHTML = "🔍";
    b.onclick = open;
    var ref = document.getElementById("wlbtn") || document.getElementById("stamp");
    top.insertBefore(b, ref);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addBtn); else addBtn();
  setTimeout(addBtn, 800);
  var css = document.createElement("style");
  css.textContent =
    "#gsbtn{margin-left:auto;margin-right:6px;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:6px 10px;font:inherit;font-size:15px;cursor:pointer}" +
    "#gsbtn + #wlbtn{margin-left:0}" +
    "#gsq{position:fixed;inset:0;z-index:9999;background:rgba(5,8,14,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);padding:calc(env(safe-area-inset-top) + 10px) 12px 12px}" +
    ".gs-box{max-width:560px;margin:0 auto;background:var(--panel);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.5)}" +
    ".gs-row{display:flex;gap:8px;padding:10px;border-bottom:1px solid var(--line)}" +
    "#gsin{flex:1;min-width:0;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:11px 12px;font:inherit;font-size:16px}" +
    ".gs-x{border:0;background:none;color:var(--sub);font-size:18px;padding:0 6px;cursor:pointer}" +
    ".gs-res{max-height:65vh;overflow-y:auto}.gs-res button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);padding:11px 14px;font:inherit;font-size:15px;cursor:pointer}" +
    ".gs-res button:active{background:var(--panel2)}.gs-res small{display:block;color:var(--sub);font-size:12.5px;margin-top:1px}" +
    ".gs-etf{font-size:12.5px;background:#5ac8fa;color:#111;border-radius:5px;padding:0 5px;font-weight:800}.gs-hint{padding:14px;color:var(--sub);font-size:13.5px}" +
    ".gs-qa{padding:10px 10px 6px;border-bottom:1px solid var(--line)}.gs-qa button{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px 12px;margin-top:6px;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}" +
    ".gs-ask{padding:10px 10px 4px;border-bottom:1px solid var(--line)}.gs-ah{font-size:13.5px;font-weight:800;margin:0 2px 7px}.gs-ah small{font-weight:500;color:var(--sub);font-size:12px;margin-left:4px}" +
    ".gs-ac{display:flex;flex-wrap:wrap;gap:6px}.gs-ac button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:7px 11px;font:inherit;font-size:13.5px;cursor:pointer}" +
    ".gs-ac button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}" +
    ".gs-ag{margin:8px 0 4px;border:1px solid var(--line);border-radius:12px;overflow:hidden}.gs-ag button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);padding:10px 12px;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}" +
    ".gs-ag button small{display:block;font-weight:500;color:var(--sub);font-size:12px;margin-top:1px}.gs-ag button:active{background:var(--panel2)}.gs-an{font-size:11.5px;color:var(--sub);margin:0;padding:8px 12px;line-height:1.45}";
  document.head.appendChild(css);
})();
