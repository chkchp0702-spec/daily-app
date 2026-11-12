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
    if (tab === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }   // 💬 11/10 #10
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
    [/고객.*(물|질문)|뭐라고 (답|말)|팔아야|사도 돼/, [["💬 고객이 이렇게 물으면 · 오늘 숫자로 채운 답", "@qa", ""]]], [/달력|일정|실적 ?발표|이번 ?주/, [["📅 이번 주 경제 지표·실적 일정", "home", "#mncal"]]], [/배당|분배금|월배당|고배당/, [["💰 배당비교 · 종목·ETF 배당 나란히 (100만원 기준 · 언제 들어오나)", "divc", "#dvbody"]]], [/수급|외국인|외인|기관|순매수|쌍끌이/, [["🧲 국내 수급 · 외국인·기관 집중 매수", "flow", "#flrank"]]], [/확률|오를까|오르나|내릴까/, [["🎲 다음 장 오를 확률 · 한국장 기준", "prob", "#prbody"]]], [/제안서|제안|성향/, [["📝 고객 제안서 만들기 · 4단계", "prop", ".pp-pf"]]],
    [/한 ?장|보내|카톡/, [["📨 고객에게 한 장 보내기", "send", "#hub"]]], [/운세|사주|타로|로또/, [["🔮 오늘의 운세 · 사주 · 타로", "luck", "#main"]]],
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
  /* 🔎 11/12 사용자 「어플 디자인을 자주 바꿔서 원하는 메뉴 찾기 힘드니, 메뉴 검색창도 하나 만들자」
     메뉴 이름·옛 이름(나침반·보내기·고래 …)·하는 일(배당, 풀버전, 나라별 섹터 …)·초성(ㅂㄷ)으로 찾음 → 누르면 그 화면·그 칸으로 바로
     길 안내(「🏠 오늘 › 시장 흐름」)는 nav2.js 의 지금 탭 묶음에서 그때그때 읽어서 — 화면 배치가 또 바뀌어도 맞게 나옴 */
  var MENU = [
    ["home", "", "🏠 오늘", "홈 첫화면 신호등 오늘한장 pb요약 아침 요약 5개 시장 업종 지도 오늘의 숫자"],
    ["market", "", "🌐 시황 리포트", "시황 리포트 아침 시황 주도 섹터 테마 돈 몰리는 곳 일정 카톡 요약 전략 대시보드"],
    ["market", "@pdf", "📄 시황 풀버전 PDF", "풀버전 전체 리포트 pdf 요약본 시황 리포트 원문 보고서"],
    ["sector", "", "🧭 시장 흐름 · 나라별 섹터", "나침반 나라별 섹터 업종 섹터 등락 로테이션 한국 미국 일본 중국 홍콩 5개 시장 국면 장 분위기 대장주 히트맵 모닝 섹터 브리핑"],
    ["feed", "", "📰 피드", "뉴스 블로그 텔레그램 네이버 블룸버그 기사"],
    ["send", "", "📨 고객에게 한 장", "보내기 한장 카톡 문자 고객 그림 오늘 한 장 하락장 안내 이름 넣기"],
    ["@qa", "", "💬 고객이 이렇게 물으면", "고객 질문 답 20개 팔아야 사도 돼 상담"],
    ["prop", "", "📝 제안서", "제안서 투자제안 pdf ppt 심의 위험고지 성향 연금 irp dc 국고채 미국채 브라질 els 폼 회차 고르기 모의투자"],
    ["bond", "", "🏦 채권", "채권 국고채 미국채 브라질 국채 ntn 금리 만기 채권 전망 보고서 회사채"],
    ["fund", "", "📦 펀드", "펀드 사모 라인업 운용사 공모"],
    ["els", "", "🎯 ELS", "els elb 청약 낙인 ki 조기상환 관제탑"],
    ["divc", "", "💰 배당비교", "배당 배당률 배당금 백만원 언제 배당 고배당 etf 비교"],
    ["onepager", "", "🔍 종목 찾기 · 종목리포트", "종목 검색 종목리포트 원페이저 티커 차트"],
    ["flow", "", "🧲 수급", "수급 외국인 기관 순매수 집중 매수 연기금"],
    ["lab", "", "🔬 연구실", "연구실 연구 신호 더보기 숨은 메뉴"],
    ["port", "", "💼 포트", "포트 자산배분 배분표 비중 공격 킥 집중 기본 포트 설계기 세금 뭘 얼마나 사"],
    ["score", "", "📊 성적표", "성적표 채점 수익률 예고 맞음 틀림"],
    ["prob", "", "🎲 오를 확률", "시장확률 확률 내일 오를 확률 닮은 날"],
    ["whale", "", "🐋 큰손", "고래 큰손 whale 기관 유명 투자자 13f 보유"],
    ["cup", "", "☕ 컵 차트", "컵 컵앤핸들 돌파"],
    ["gap", "", "📈 갭 상승", "갭 상승 돌파"],
    ["screen", "", "🔎 종목 거르기", "거르기 스크리너 거름망"],
    ["sigmore", "", "🗂 신호 더 보기", "더 보기 예측 채점 상세 매집"],
    ["@bubble", "", "🕰 버블 시계 · 🐻 하락장 계기판", "버블 시계 하락장 계기판 현금 비중 곰 신용 경보 언제 다시 사나 바닥 신호 채권형"],
    ["@season", "", "🧭 계절 시계", "계절 시계 5개국 지수 흐름 3개월 뒤"],
    ["@sigprob", "", "🎯 신호 확률판", "신호 확률판 경고 신호 바닥 신호 확률"],
    ["@analog", "", "🔁 닮은 장", "닮은 장 비슷한 과거 백테스트"],
    ["@bt40", "", "📏 40주선 백테스트", "40주 이동평균 백테스트"],
    ["luck", "", "🔮 오늘의 운세", "운세 오늘의 운세 투자운"],
    ["saju", "", "📜 사주 리포트", "사주 별자리"],
    ["tarot", "", "🃏 타로", "타로 카드"],
    ["lotto", "", "🎱 로또", "로또 번호"],
    ["@wlbtn", "", "★ 관심종목", "관심종목 즐겨찾기 내 종목 별"],
    ["@uibtn", "", "⚙️ 보기 설정", "설정 글자 크기 글씨 화면 색 다크 밝게"],
    ["alarm", "", "🔔 알림", "알림 푸시 켜기 끄기"],
    ["idea", "", "💬 의견함", "의견 바라는 점 건의"],
    ["@help", "", "🙋 뭐 보면 돼요?", "도움말 사용법 처음 궁금"]
  ];
  var CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  function cho(t){ return String(t).replace(/[가-힣]/g, function(c){ return CHO.charAt(Math.floor((c.charCodeAt(0) - 0xAC00) / 588)); }); }
  function nz(t){ return String(t || "").toLowerCase().replace(/[\s·›\-_]/g, "").replace(/[^\w가-힣ㄱ-ㅎ]/g, ""); }
  function navName(k){ var N = window.__navMap; return (N && N.lab && N.lab[k]) || null; }
  function menuPath(k){
    if (k === "@qa") return "📨 고객에게 한 장 › 질문 답";
    if (/^@(bubble|season|sigprob|analog)$/.test(k)) return "🏠 오늘 › 자세히 보기 안";
    if (k === "@bt40") return "🔬 연구실 › 연구";
    if (/^@(wlbtn|uibtn)$/.test(k)) return "맨 위 오른쪽";
    if (k === "@help") return "꼬마 얼굴 누르기";
    var N = window.__navMap, G = (N && N.groups) || [];
    for (var i = 0; i < G.length; i++) if (G[i].tabs.indexOf(k) >= 0){ var g = G[i], nm = navName(k);
      if (g.tabs.length < 2) return "아래 탭 " + g.ic + " " + g.t;
      return (g.hide ? "🔬 연구실" : "아래 탭 " + g.ic + " " + g.t) + " › 위쪽 칸 「" + String(nm || k).replace(/^\S+\s/, "") + "」"; }
    return "🔬 연구실 안";
  }
  function msearch(q){
    var a = nz(q); if (!a) return [];
    var isCho = /^[ㄱ-ㅎ]+$/.test(a), out = [];
    MENU.forEach(function(m, i){
      var nm = navName(m[0]), t = nz(m[2] + " " + (m[1] ? "" : nm || "")), kw = nz(m[3]), sc = 0;
      if (isCho){ var ct = cho(t), ck = cho(kw); sc = ct.indexOf(a) === 0 ? 6 : ct.indexOf(a) >= 0 ? 4 : ck.indexOf(a) >= 0 ? 2 : 0; }
      else sc = t.indexOf(a) === 0 ? 10 : t.indexOf(a) >= 0 ? 8 : kw.indexOf(a) >= 0 ? 5 : (a.length >= 2 && a.split("").every(function(c){ return kw.indexOf(c) >= 0; }) && kw.indexOf(a.slice(0, 2)) >= 0 ? 1 : 0);
      if (sc) out.push({i: i, sc: sc}); });
    return out.sort(function(x, y){ return y.sc - x.sc || x.i - y.i; }).slice(0, 6).map(function(o){ var m = MENU[o.i]; return {k: m[0], sel: m[1], t: m[1] ? m[2] : (navName(m[0]) && !/^@/.test(m[0]) && m[2].indexOf("·") < 0 ? navName(m[0]) : m[2]), sc: o.sc}; });
  }
  function menuGo(k, sel){
    close();
    try { if (window.ntfyUse) ntfyUse("menu_find"); } catch(z) {}
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }
    if (k.charAt(0) === "@" && window.__hubGo){ __hubGo(k);
      var tid = {"@bubble": "bubble", "@season": "season", "@sigprob": "sigprob", "@analog": "analog"}[k];   // 위 카드가 늦게 그려지며 밀리면 다시 맞춤
      if (tid) [1500, 3000, 4500].forEach(function(t){ setTimeout(function(){ var x = document.getElementById(tid); if (x){ var r = x.getBoundingClientRect(); if (Math.abs(r.top - 70) > 120) window.scrollTo({top: Math.max(0, r.top + window.scrollY - 70), behavior: "smooth"}); } }, t); });
      return; }
    if (typeof window.go === "function"){ window.go(k); window.scrollTo(0, 0); }   // ⚠ 이 파일 안의 go() 는 종목 열기라 window.go 로
    if (sel === "@pdf"){ var t0 = Date.now(); (function f(){ var b = [].filter.call(document.querySelectorAll("#main .fold, #main button, #main summary"), function(x){ return /전체 리포트/.test(x.textContent); })[0];
      if (b){ var hid = b.closest(".ez-cap-hid") || (b.classList.contains("ez-cap-hid") ? b : null); if (hid) hid.classList.remove("ez-cap-hid");   // 「더 보기」 밑에 숨어 있어도 꺼내서
        b.scrollIntoView({behavior: "smooth", block: "center"}); b.classList.add("ms-hi"); setTimeout(function(){ b.classList.remove("ms-hi"); }, 2600); return; }
      if (Date.now() - t0 < 8000) setTimeout(f, 250); })(); }
  }
  function menuHTML(list){
    return list.length ? '<div class="gs-mn"><div class="gs-ah">📍 메뉴 <small>누르면 바로 그 화면으로</small></div>' + list.map(function(m, j){
      return '<button type="button" data-mn="' + j + '"><b>' + e(m.t) + '</b><small>' + e(menuPath(m.k)) + '</small></button>'; }).join("") + '</div>' : '';
  }
  var MCHIP = [["시황 풀버전", "market", "@pdf"], ["나라별 섹터", "sector", ""], ["고객에게 한 장", "send", ""], ["제안서", "prop", ""], ["배당비교", "divc", ""], ["채권", "bond", ""], ["포트", "port", ""], ["버블 시계", "@bubble", ""]];
  function mchipHTML(){ return '<div class="gs-ask gs-mc"><div class="gs-ah">📍 자주 찾는 메뉴 <small>위 칸에 메뉴 이름·하는 일을 쳐도 돼요 (예: 배당, 풀버전, ㅅㅎ)</small></div><div class="gs-ac">' +
    MCHIP.map(function(c, i){ return '<button type="button" data-mc="' + i + '">' + e(c[0]) + '</button>'; }).join("") + '</div></div>'; }
  function open(mode){
    if (document.getElementById("gsq")) return;
    var o = document.createElement("div"); o.id = "gsq";
    o.innerHTML = '<div class="gs-box"><div class="gs-row"><input aria-label="종목명·코드" id="gsin" type="search" placeholder="메뉴·종목·질문 (예: 배당, 섹터, 삼전, ㅅㅅㅈㅈ)" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="gs-x" aria-label="닫기">✕</button></div>' +
      '<div id="gsmc">' + mchipHTML() + '</div><div id="gsask"></div><div id="gsres" class="gs-res"><div class="gs-hint">종목 목록 불러오는 중…</div></div></div>';
    document.body.appendChild(o); document.body.classList.add("gs-open");
    o.addEventListener("click", function(ev){ if (ev.target === o) close(); });
    o.querySelector(".gs-x").onclick = close;
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres");
    var ask = document.getElementById("gsask"), aOn = null, mc = document.getElementById("gsmc"), ML = [];
    function drawAsk(){ ask.innerHTML = askHTML(aOn); ask.style.display = inp.value.trim() ? "none" : ""; mc.style.display = inp.value.trim() ? "none" : ""; }
    mc.onclick = function(ev){ var t = ev.target.closest && ev.target.closest("[data-mc]"); if (!t) return; var c = MCHIP[+t.dataset.mc]; menuGo(c[1], c[2]); };
    res.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-mn]"); if (!t) return; var m = ML[+t.dataset.mn]; if (m) menuGo(m.k, m.sel); });
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
      ML = msearch(q0); var mh = menuHTML(ML);
      var qa = qAnswers(q0), qh = mh + (qa.length ? '<div class="gs-qa"><div class="gs-ah">💬 이 질문의 답 <small>누르면 그 카드로</small></div>' + qa.map(function(d, j){ return '<button type="button" data-qa="' + j + '">' + e(d[0]) + '</button>'; }).join("") + '</div>' : '');
      if (!ready){ res.innerHTML = qh || '<div class="gs-hint">종목 목록 불러오는 중…</div>'; bindQa(qa); return; }
      var q = stripQ(q0) || q0;
      var r0 = opSearch(q), fz = r0.fz || {}, r = r0.slice(0, qa.length ? 6 : 12), FL = window.FLAG || {};   // 🔎 11/12 줄임말·초성·한/영·철자 표시
      res.innerHTML = qh + (r.length ? r.map(function(x){
        return '<button data-s="' + e(x.sym) + '">' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b>' + (x.etf ? ' <span class="gs-etf">ETF</span>' : '') + (fz[x.sym] ? ' <span class="fzb">' + e(typeof fz[x.sym] === "string" ? fz[x.sym] : "비슷한 발음") + '</span>' : '') +
          '<small>' + e(window.V && V.cd ? V.cd(x.sym) : x.sym) + (x.built ? '' : ' · 준비 중') + '</small></button>'; }).join("")
        : (qa.length || ML.length ? '' : '<div class="gs-hint">「' + e(q0) + '」 — 찾는 메뉴·종목·질문이 없어요 · 예: 「브라질 국채 지금 어때」「하락장이면?」</div>'));
      [].forEach.call(res.querySelectorAll("button[data-s]"), function(b){ b.onclick = function(){ go(b.dataset.s); }; });
      bindQa(qa);
    }
    function bindQa(qa){ [].forEach.call(res.querySelectorAll("button[data-qa]"), function(b){ b.onclick = function(){ var d = qa[+b.dataset.qa]; try { if (window.ntfyUse) ntfyUse("ask_free"); } catch(z) {} if (d[1] === "@op") go(d[2]); else jump(d[1], d[2]); }; }); }
    inp.oninput = function(){ draw(); ask.style.display = mc.style.display = inp.value.trim() ? "none" : ""; };
    inp.onkeydown = function(ev){
      if (ev.key === "Escape") close();
      if (ev.key === "Enter"){ var mm = msearch(inp.value.trim()); if (mm.length && mm[0].sc >= 8){ menuGo(mm[0].k, mm[0].sel); return; } var qa = qAnswers(inp.value.trim()); if (qa.length && qa[0][1] !== "@op"){ jump(qa[0][1], qa[0][2]); return; } if (ready){ var r = opSearch(stripQ(inp.value.trim()) || inp.value.trim())[0]; if (r) go(r.sym); } }
    };
  }
  window.gsOpen = open;
  window.__menuFind = msearch;
  function bar(){
    var k = typeof cur !== "undefined" ? cur : null, m = document.getElementById("main");
    if (!m || ["home", "lab", "send"].indexOf(k) < 0 || document.getElementById("msbar")) return;
    var b = document.createElement("button"); b.type = "button"; b.id = "msbar";
    b.innerHTML = '<span>🔎</span><b>메뉴 찾기</b><small>배당 · 나라별 섹터 · 시황 풀버전 · 종목 …</small>';
    b.onclick = function(){ open(); };
    m.insertBefore(b, m.firstChild);
  }
  function watch(){ var m = document.getElementById("main"); if (!m){ setTimeout(watch, 500); return; } new MutationObserver(function(){ if (!document.getElementById("msbar")) bar(); }).observe(m, {childList: true}); bar(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
  window.__gsAsk = {list: ASK, jump: jump};   // 11/05 📋 받은 글 → 답장 한 장(ux1105b)이 답 카드 칩을 같이 씀
  function addBtn(){
    var top = document.querySelector("header .top"); if (!top || document.getElementById("gsbtn")) return;
    var b = document.createElement("button"); b.id = "gsbtn"; b.setAttribute("aria-label", "메뉴·종목 찾기"); b.innerHTML = "🔍";
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
    ".gs-mn{padding:10px 10px 6px;border-bottom:1px solid var(--line)}.gs-mn button{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px 12px;margin-top:6px;font:inherit;font-size:15px;cursor:pointer}.gs-mn button b{font-weight:800}.gs-mn button small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}" +
    ".gs-mc{border-bottom:1px solid var(--line)}" +
    "#msbar{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 12px;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:14px;padding:12px 14px;font:inherit;text-align:left;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.05)}#msbar span{font-size:17px}#msbar b{font-size:15px;font-weight:800;flex:none}#msbar small{color:var(--sub);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}" +
    ".ms-hi{outline:3px solid #3182f6;outline-offset:3px;border-radius:12px;transition:outline-color .4s}" +
    ".gs-ag button small{display:block;font-weight:500;color:var(--sub);font-size:12px;margin-top:1px}.gs-ag button:active{background:var(--panel2)}.gs-an{font-size:11.5px;color:var(--sub);margin:0;padding:8px 12px;line-height:1.45}";
  document.head.appendChild(css);
})();
