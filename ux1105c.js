/* 🔰 11/05 사용자 「여전히 어플이 너무 복잡하고 어떻게 쓰는지 모르겠다는 의견 — 더 심플하고 쉬워서 우와」 → 13가지 「다 진행해」
   원칙: 아무것도 지우지 않음 — 숨기기 · 옮기기 · 이름 바꾸기만. 「☰ 전체 메뉴」 한 번이면 지금까지의 화면이 그대로 다 나옴.
   ① 첫 화면 = 신호등 한 장 + 한 문장 + 버튼 하나 (나머지 오늘 화면은 「오늘 자세히 보기 ▾」 아래)
   ② 쉬운 화면(기본) ⇄ 전체 메뉴 — 쉬운 화면은 아래 탭 3개 + ☰ 전체 · 끄기: localStorage ezmode = "pro" (주소 ?ez=0 / 다시 ?ez=1)
   ③ 탭 이름을 질문으로 — 오늘 어때? · 뭐 살까? · 고객 제안
   ④ 접기 — 쉬운 화면에선 신호·상품 탭 카드도 처음엔 제목 한 줄(calm.js 가 window.__ezFold 를 봄)
   ⑤ 용어 — easy.js 에 200일선 → 장기 평균선 더함 · 판단은 🟢🟡🔴 하나
   ⑥ 🙋 뭐 보지? (아래 탭 바) — 어느 화면에서든 8가지 중 고르면 그 화면으로
   ⑦ 하루 카드 3장 — 첫 화면에 ☀️ 아침 · ⚡ 장중 · 🌙 마감 중 지금이 어디인지 (앱 알림은 push.js 다이어트 그대로 하루 2번)
   ⑧ 제안서 4단계 — 성향 → 상품 → 이름·금액 → 만들기, 지금 할 단계를 위에 띄우고 누르면 그 칸으로
   ⑨ 화면당 큰 버튼 하나 — 첫 화면은 「📨 고객에게 오늘 한 장」
   ⑩ 큰 글씨 — 첫 화면 18px 이상 · 운세·사주·타로·로또는 맨 아래 서랍
   ⑪ 첫 방문 3장 안내(한 번만) ⑫ 막히는 곳 재기 — 5초 안에 떠난 화면 · 뒤로 누른 화면을 사용 현황(usage.js)에 같이 셈
   ⑬ 첫 화면 맨 위 「🔄 15:07 장중 갱신」
   숫자는 pbbrief(오늘 한 장) 자료 그대로 — 지어내지 않음 · 사라·팔라는 말 없음 */
(function(){
  var D = document.documentElement, K = "ezmode";
  try { var qm = /[?&]ez=(\d)/.exec(location.search); if (qm) localStorage.setItem(K, qm[1] === "0" ? "pro" : "easy"); } catch(x) {}
  function EZ(){ try { return !(navigator.webdriver && localStorage.getItem(K) === "pro"); } catch(x) { return true; } }   // (자동 검진(health.py·ui_audit)만 예전처럼 카드를 펼친 화면으로 봄 — 사람에겐 늘 한 화면)  🧊 11/12 한 화면 — 쉬운/전체 두 모드를 없앰(지도 두 장 → 한 장). 예전 전체 메뉴에만 있던 화면은 아래 5칸과 🔬 연구실로
  function setMode(m){ try { localStorage.setItem(K, m); } catch(x) {} apply(); if (typeof window.go === "function" && window.cur) go(m === "easy" && !inEasy(window.cur) ? "home" : window.cur); }
  window.ezMode = function(m){ if (m) setMode(m === "pro" ? "pro" : "easy"); return EZ() ? "easy" : "pro"; };
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function num(s){ return s == null ? null : +String(s).replace("−", "-"); }
  function sg(v){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(1); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  /* 🧊 11/09 ⑫ 첫 방문 「나는 누구?」 1탭 — PB / 투자자 / 구경 → 첫 화면 큰 버튼(오늘 할 일)과 🙋 순서가 바뀜 */
  function ROLE(){ return ls("ez_role") || ""; }
  var ROLES = [["pb", "👔", "PB", "고객에게 보낼 것 먼저"], ["inv", "📈", "투자자", "뭘 살지 먼저"], ["look", "👀", "구경", "가볍게 둘러보기"]];
  window.__ezRole = function(force){ if (force){ ls("ez_role", null); try { localStorage.removeItem("ez_role"); } catch(x) {} HB = 0; if (cur() !== "home" && window.go) go("home"); setTimeout(tick, 50); } return ROLE(); };
  function roleHtml(){
    return '<div class="ez-role"><b>어떤 분이세요?</b><small>고르면 첫 화면이 맞춰져요 · 🙋 에서 언제든 바꿈</small><div>' +
      ROLES.map(function(r){ return '<button type="button" data-role="' + r[0] + '"><span>' + r[1] + '</span>' + r[2] + '<small>' + r[3] + '</small></button>'; }).join("") + '</div></div>';
  }
  document.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-role]"); if (!b) return; ev.stopPropagation(); ls("ez_role", b.dataset.role); HB = 0; tick(); });
  // ⑬ 오늘 할 일 1개 — 역할·장 상태에 맞춘 행동 하나
  function todo(o){
    var r = ROLE();
    if (r === "inv") return '<button type="button" class="ez-cta' + (o.red ? ' red' : '') + '" data-ezgo="port">' + (o.red ? '💼 하락장 규칙대로 비중 확인하기' : '💼 지금 뭘 얼마나 사나 보기') + '</button>';
    if (r === "look") return '<button type="button" class="ez-cta" data-ezask="1">🙋 궁금한 것 골라 보기</button>';
    // 🧩 11/12 사용자 「통일성이 없지? 고객에게 한 장으로 통일하자」 — 이름·색 하나로 (하락장이면 한 장 안에 하락장 안내가 저절로 들어감)
    return '<button type="button" class="ez-cta" data-pbsend="1">📨 고객에게 한 장 보내기</button>';
  }
  document.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-ezask]"); if (!b) return; ev.stopPropagation(); help(); });
  var EASY_TABS = {home: 1, port: 1, score: 1, prop: 1, luck: 1, saju: 1, tarot: 1, lotto: 1};
  function inEasy(k){ return !!EASY_TABS[k]; }

  /* ── ④ calm.js 가 쉬운 화면에서 더 접을 탭 ── */
  window.__ezFold = function(tab){ return EZ() && /^(whale|cup|gap|screen|sigmore|bond|fund|els|feed)$/.test(tab || ""); };

  /* ── ② ③ 아래 탭 바 ── */
  function bar(){   // 🧊 11/12 아래 탭은 nav2.js 의 할 일 5칸 그대로 — 예전 「☰ 전체 메뉴」 단추는 치움
    var all = document.getElementById("ezall"); if (all) all.remove();
  }

  /* ── ① ⑦ ⑨ ⑬ 첫 화면 한 장 ── */
  var B = null, BT = 0;
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function gj5(u, ttl){ if (!window.getJSON) return Promise.resolve(null); var q5 = Math.floor(Date.now() / 300000); return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + q5, {ttl: ttl || 300000}).catch(function(){ return null; }); }
  function brief(){
    if (B && Date.now() - BT < 300000) return Promise.resolve(B);
    var p = window.__pbbrief ? window.__pbbrief() : gj5("archive/x/pbbrief.json");
    // 🧊 11/09: 신호등 판정에 🐻 하락장 계기판 · 적중률(scores) · 지수 값(live_kr·선물) · 바뀐 것(home.json) 같이
    return Promise.all([Promise.resolve(p).catch(function(){ return null; }), gj5(RM + "bear.json"), gj5(RM + "scores.json", 900000), gj5("archive/x/live_kr.json", 120000), gj5("archive/x/live_us_pre.json", 120000), gj5(RM + "home.json"), gj5(RM + "bubble.json", 900000)])
      .then(function(r){ var d = r[0]; if (d){ d = Object.assign({}, d, {_bear: r[1], _sc: r[2], _kr: r[3], _fut: r[4], _home: r[5], _bub: r[6]}); B = d; BT = Date.now(); } return d || B; }).catch(function(){ return B; });
  }
  window.__ezBrief = function(){ return B; };
  function read(b){
    var t = (b.talk || []).join(" · "), plan = ((b.advice && b.advice.plan) || []).join(" "), m;
    var o = {};
    if ((m = /코스피 ([\d,]+(?:\.\d+)?)\(([+−\-]?\d+(?:\.\d+)?)%\)/.exec(t))) { o.kv = m[1]; o.k = num(m[2]); }
    else if ((m = /코스피 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) o.k = num(m[1]);
    if ((m = /코스닥 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) o.q = num(m[1]);
    if ((m = /S&P500 선물 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) { o.s = num(m[1]); o.sl = "S&P500 선물"; }
    else if ((m = /S&P500 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t))) { o.s = num(m[1]); o.sl = "S&P500"; }
    o.up = /200일 평균 위|200일선 위/.test(plan) ? true : /200일 평균 아래|200일선 아래/.test(plan) ? false : null;
    // 🧊 11/09 ⑩ 지수 값은 실시간 표(live_kr · 선물)에서 — 세 칸 모두 「%+값」
    var KR = b._kr, today_ = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    if (KR && KR.date === today_ && KR.index){ KR.index.forEach(function(x){ if (x.name === "코스피"){ o.k = x.chg; o.kv = Math.round(x.last).toLocaleString(); } if (x.name === "코스닥"){ o.q = x.chg; o.qv = (Math.round(x.last * 10) / 10).toLocaleString(); } }); }
    var FU = b._fut && b._fut.date === today_ ? (b._fut.fut || []).filter(function(f){ return f.name === "S&P500 선물"; })[0] : null;
    if (FU && o.sl === "S&P500 선물"){ o.s = FU.chg; o.sv = Math.round(FU.last).toLocaleString(); }
    // 🧊 11/09 ④ 하락장 계기판(종가 판정)이 신호등의 바탕 — 코스피·S&P 중 하나라도 🐻면 🔴, 🟡(조정)이면 🟡. 오늘 등락은 작은 글로만
    var BM = {}; ((b._bear && b._bear.markets) || []).forEach(function(m){ BM[m.key] = m; }); o.bear = BM;
    var kb = BM.kospi, sb = BM.sp500, day = o.k != null ? "오늘 코스피 " + sg(o.k) : o.s != null ? "오늘 " + o.sl + " " + sg(o.s) : "";
    var big = o.k != null ? o.k : o.s;
    if ((kb && kb.state === "🐻") || (sb && sb.state === "🐻")){ var w = kb && kb.state === "🐻" ? kb : sb;
      o.L = ["r", "🔴", "조심하는 장", w.name + " 하락장 · 고점보다 " + sg(w.dd) + (day ? " · " + day : "")]; o.red = w; }
    else if (o.up === false) o.L = ["r", "🔴", "조심하는 장", "큰 흐름이 아래로 꺾여 있어요"];
    else if ((kb && kb.state === "🟡") || (sb && sb.state === "🟡")){ var w2 = kb && kb.state === "🟡" ? kb : sb;
      o.L = ["y", "🟡", "흔들리는 장", w2.name + " 조정 · 고점보다 " + sg(w2.dd) + (day ? " · " + day : "")]; o.yel = w2; }
    else if ((o.k != null && o.k <= -2) || (o.s != null && o.s <= -1.5)) o.L = ["y", "🟡", "흔들리는 날", o.up ? "큰 흐름은 아직 위예요" : "오늘은 크게 출렁여요"];
    else if (big != null && big >= 0.5) o.L = ["g", "🟢", "좋은 날", o.up ? "큰 흐름도 위예요" : "오늘은 오르고 있어요"];
    else o.L = ["g", "🟢", "무난한 날", o.up ? "큰 흐름은 위예요" : "크게 움직이지 않아요"];
    // ⑤ 장 시작 30분(09:00~09:30)은 노이즈 — 「전날 마감 기준」 꼬리표 · 뉴스 톤과 신호등이 엇갈리면 ⚠ 한 줄
    var hm = new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 16), wd = new Date(Date.now() + 9 * 3600e3).getUTCDay();
    o.early = wd > 0 && wd < 6 && hm >= "09:00" && hm < "09:30";
    var bad = /투매|급락|폭락|공포|패닉|충격|손실|붕괴|매도 폭탄|반대매매/.test(String(b.one || "")), good = /급등|랠리|신고가|폭등|환호/.test(String(b.one || ""));
    o.mix = (o.L[0] === "g" && bad) ? "뉴스는 나쁜데 지수는 버티는 중 — 엇갈릴 땐 서두르지 않기" : (o.L[0] === "r" && good) ? "뉴스는 좋은데 큰 흐름은 아직 아래 — 하루 반등에 서두르지 않기" : "";
    var rd = String((b.advice && b.advice.read) || "").split(/(?:[.!?])\s+/).map(function(x){ return /[.!?]$/.test(x) ? x : x + "."; }).filter(function(x){ return x.trim(); });
    o.act = rd.length ? rd[rd.length - 1] : (((b.advice && b.advice.plan) || [])[1] || "");
    var md = String(b.mode || b.label || "");
    o.ph = /마감|장 끝|저녁/.test(md) ? 2 : /장중/.test(md) ? 1 : 0;
    return o;
  }
  // ③ 적중률 한 줄 — 신호등 바로 밑 (시황 예고 채점 · scores.json)
  function hitHtml(S){
    var r = S && (S.rows || []).filter(function(x){ return x.k === "report"; })[0]; if (!r || !r.n) return "";
    var hi = ((r.cal && r.cal.buckets) || []).filter(function(x){ return /^[789]0%/.test(x.bucket); }), hn = 0, hh = 0; hi.forEach(function(x){ hn += x.n; hh += x.hit; });
    return '<p class="ez-hit" data-ezgo="score">🎯 시황 예고 적중 <b>' + r.rate + '%</b> (' + r.n + '건)' + (hn >= 10 ? ' · 「70% 이상」이라 한 예고는 <b>' + Math.round(hh / hn * 100) + '%</b>' : '') + ' <i>성적표 ›</i></p>';
  }
  // ④ 🔴이 되면 / 🔴일 때 — 규칙을 미리 (하락장 계기판 · 바닥 신호)
  function ruleHtml(o, BR){
    var w = o.red || o.yel, M = (BR && BR.markets) || [];
    if (w){
      var ck = (w.checks || []), F_ = w.rule && w.rule.id === "F", nu = w.nuse || ck.length, on = ck.filter(function(c){ return c.on && (c.use == null || c.use); }).length;   // 🌱 11/09 시장별 다시 사기 규칙
      var tail = (w.analog ? '다음: ' + w.analog.next : w.rule && w.rule.id === "OFF" ? '현금 규칙 꺼 둠' : (w.rule && !w.nuse) || F_ ? '판정 풀릴 때까지' : '다시 사는 조건 ' + on + '/' + nu) + (window.__meetTail ? __meetTail(w) : '');   // 📏 11/13 A11/13-1 꼬리 「그대로면 약 1/8」(ux1113.js)
      return '<details class="ez-rule"><summary>' + (o.red ? '🔴 지금 규칙 · ' + (w.to || '현금') + ' ' + (w.cash || 0) + '%까지 · ' + tail : '🟡 지금 규칙 · ' + tail) + '</summary>' +
        '<p>' + e(w.advice || (BR && BR.lead) || "") + '</p>' + (window.__meetHtml ? __meetHtml(w, BR) : '') + (window.__bearSigHead ? __bearSigHead(w) : '') + '<ul>' + ck.map(function(c, k){ return '<li class="' + (c.on ? "on" : "") + '">' + (c.on ? "✅" : "⬜") + ' ' + e(c.k) + (c.use === false ? ' <em class="ez-ref">참고</em>' : '') + ' <small>' + e(c.d) + '</small>' + (window.__bearSigLine ? __bearSigLine(w, k) : '') + '</li>'; }).join("") + '</ul>' +
        '<p class="ez-rule-n">' + (w.rule ? '다시 사는 규칙(' + e(w.name) + '): ' + e(w.rule.name) : '') + ' · 종가 판정 · 사라·팔라는 뜻 아님</p></details>';
    }
    return '<details class="ez-rule"><summary>🔴이 되면 이렇게 바뀌어요</summary><p>코스피나 S&P500이 고점보다 <b>−20%</b>(종가)면 🔴 하락장, <b>−10%</b>면 🟡 조정이에요. 얼마나 들고 있을지는 🔁 닮은 장 규칙이 시장마다 정해요(지금 장과 닮았던 과거 12번에서 가장 나았던 방식).</p>' +
      '<p>지금: ' + M.map(function(m){ return m.state + ' ' + e(m.name) + ' ' + sg(m.dd); }).join(" · ") + '</p><p class="ez-rule-n">⚡ 공격 포트는 종목마다 −5%면 손절 · 판정은 종가</p></details>';
  }
  function redAct(w){ if (w.analog) return w.name + " 하락장 — " + w.analog.rule + " · 지금 주식 " + w.analog.stock + "% · 다음: " + w.analog.next; return w.name + " 하락장 — 현금 " + (w.cash || 30) + "%까지 늘리고 새로 사지 않기. 단, 이미 크게 빠졌으니 투매는 금지 · 반등 때 나눠 덜기."; }
  // ⑯ 비중이 바뀐 날 「달라진 것 1개 + 이유 1줄」 (home.json port.change)
  function chgHtml(H){
    var c = H && H.port && H.port.change; if (!c || !c.why) return "";
    var td = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), ago = (Date.parse(td) - Date.parse(c.date)) / 864e5; if (!(ago >= 0 && ago <= 2)) return "";
    var parts = String(c.why).split(" — "), first = parts[0].split(" · ")[0].replace(/^🧭\s*/, ""), why = (parts[0].split(" · ")[1] || "").replace(/\(.*$/, "").trim();
    return '<div class="ez-chg" data-ezgo="port"><small>🔁 ' + (ago === 0 ? "오늘" : String(c.date).slice(5).replace("-", "/")) + ' 포트에서 달라진 것</small><p>' + e(first.slice(0, 60)) + '</p>' + (why ? '<em>이유: ' + e(why.slice(0, 70)) + '</em>' : '') + '</div>';
  }
  /* 🧹 11/11 첫 화면 간결화 9가지 (사용자 「첫 화면이 좀 어수선 — 더 간결하게」 → 「다 진행해」) — 지운 기능 없음 · 자리만 옮김
     ① 한 장 규칙: 신호등(결론 포함) · 숫자 3개 · 버튼 하나 = 스크롤 없이 한 화면
     ② 신호등 + 🧭 결론 합침(국내·해외 두 줄이 신호등 안으로) ③ 🐻 규칙·🫧 버블은 경보일 때만 신호등 밑 한 줄
     ④ 나머지(뉴스·수급·적중률·달라진 것·내 종목·대형주·이번 주·고객 질문)는 「한 줄 목록」 — 누르면 펼침
     ⑤ 맨 위 회색 한 줄 ⑥ 첫 화면 색은 신호등 색 하나 · 이모지 줄당 하나 ⑦ 시간대별로 목록 맨 위가 바뀜(아침 뉴스·이번 주 / 장중 수급·대형주 / 마감 성적·달라진 것)
     ⑧ 자리 미리 잡기(늦게 오는 칸 높이 고정) ⑨ 첫 화면엔 버튼 하나 — 머리줄 📨 · 떠 있는 단추 숨김 */
  var PHN = ["아침", "장중", "마감"];
  function warnHtml(o, BR, BU){
    var s = "";
    if (o.red || o.yel) s += ruleHtml(o, BR).replace(/<summary>(?:🔴|🟡) 지금 규칙 · (?:현금 \d+%까지 · )?/, "<summary>📏 언제 다시 사나 · ");   // 🐻 경보일 때만 규칙 한 줄(펼치면 다시 사는 조건) — 현금 % 는 바로 위 결론 줄과 같은 말이라 뺌
    if (BU && (BU.credit_on || (BU.red || 0) >= 3)) { var CK = window.__bubClock ? __bubClock(BU) : null;   // 🕰 11/11 버블 시계 한 줄
      s += '<button type="button" class="ez-warn" data-ezbub="1">' + (CK ? '🫧 버블 시계 ' + e(CK.label) + (BU.credit_on ? ' · 신용 경보' : '') : '🫧 버블 경보 켜짐' + (BU.flow ? ' · ' + e(BU.flow) : '')) + ' <i>›</i></button>'; }
    if (o.mix) s += '<p class="ez-warn ez-warn-y">⚠ ' + e(o.mix) + '</p>';
    return s;
  }
  function heroHtml(b){
    var o = read(b), N = [];
    if (o.k != null) N.push(["코스피", o.kv || "", o.k]);
    if (o.q != null) N.push(["코스닥", o.qv || "", o.q]);
    if (o.s != null) N.push([o.sl, o.sv || "", o.s]);
    return '<p class="ez-top">' + e(String(b.asof || b.at || "").slice(11, 16) || b.label || "") + ' 갱신 · ' + PHN[o.ph] + (o.early ? ' · 09:30 전이라 전날 마감 기준' : '') + '</p>' +
      '<div class="ez-light ' + o.L[0] + '"><div class="ez-lh"><b>' + o.L[1] + '</b><div><strong>' + e(o.L[2]) + '</strong><em>' + e(o.L[3].replace(/ · 오늘 .*$/, "")) + '</em></div></div>' +
        '<div data-vd class="vd-mini"></div>' +   /* 🧭 결론 두 줄(verdict.js)이 신호등 안으로 */
        warnHtml(o, b._bear, b._bub) + '</div>' +
      (window.__rebCard ? __rebCard(b._bear, o.k, "ez") : '') +   // 📨 반등 날에만
      (N.length ? '<div class="ez-nums">' + N.slice(0, 3).map(function(n){ return '<div><small>' + e(n[0]) + '</small><b class="' + cl(n[2]) + '">' + sg(n[2]) + '</b>' + (n[1] ? '<em>' + e(n[1]) + '</em>' : '') + '</div>'; }).join("") + '</div>' : '') +
      todo(o);   /* 🧊 11/12 「어떤 분이세요?」 질문 없앰 — 안 고른 사람은 한 장 보내기 */
  }
  // ④ ⑦ 한 줄 목록 — 시간대(아침 0 · 장중 1 · 마감 2)마다 맨 위가 바뀜
  var ROWORD = {act: [1, 2, 4], news: [0, 3, 5], flow: [3, 0, 2], hit: [5, 5, 0], chg: [4, 4, 1], rule: [6, 6, 6]};
  var MNORD = {mncal: [0, 3, 3], mnwhy: [2, 0, 1], mnwl: [1, 1, 2], mnqa: [3, 2, 0]};
  function rowsHtml(b){
    var o = read(b), ph = o.ph, R = [];
    function row(k, h){ R.push('<div class="ez-row" style="order:' + ROWORD[k][ph] + '">' + h + '</div>'); }
    if (o.act && !o.red) row("act", '<button type="button" class="ez-r ez-clamp" data-ezclamp="1"><small>그래서 오늘은</small>' + e(o.act) + '</button>');
    if (b.one) row("news", '<button type="button" class="ez-r ez-clamp" data-ezclamp="1"><small>오늘 뉴스</small>' + e(String(b.one).split(" ｜ ").pop()) + '</button>');
    row("flow", '<div data-flow class="ez-flow"><span class="ez-r ez-ph">외국인·기관 수급 불러오는 중…</span></div>');
    var S = b._sc && (b._sc.rows || []).filter(function(x){ return x.k === "report"; })[0];
    if (S && S.n) row("hit", '<button type="button" class="ez-r" data-ezgo="score"><small>시황 예고 적중</small><b>' + S.rate + '%</b> · ' + S.n + '건 <i>›</i></button>');
    var c = b._home && b._home.port && b._home.port.change;
    if (c && c.why){ var td = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), ago = (Date.parse(td) - Date.parse(c.date)) / 864e5;
      if (ago >= 0 && ago <= 2) row("chg", '<button type="button" class="ez-r ez-clamp" data-ezgo="port"><small>' + (ago === 0 ? "오늘" : String(c.date).slice(5).replace("-", "/")) + ' 포트에서 달라진 것</small>' + e(String(c.why).split(" — ")[0].split(" · ")[0].replace(/^🧭\s*/, "").slice(0, 60)) + ' <i>›</i></button>'); }
    if (!o.red && !o.yel) row("rule", ruleHtml(o, b._bear).replace('class="ez-rule"', 'class="ez-rule ez-r"'));
    return '<p class="ez-rh">오늘 한 줄씩 <small>' + ["아침엔 뉴스·일정 먼저", "장중엔 수급·대형주 먼저", "마감엔 성적·달라진 것 먼저"][ph] + '</small></p><div class="ez-rows">' + R.join("") + '</div>';
  }
  window.__ezPh = function(){ return B ? read(B).ph : 0; };
  var HB = 0;
  function home(){
    var main = document.getElementById("main"), hb = document.getElementById("hmbody");
    var h = document.getElementById("ezhero"), more = document.getElementById("ezmore"), pl = document.getElementById("ezpro");
    if (cur() !== "home" || !main || !hb){ return; }
    if (!EZ()){
      if (h) h.remove(); if (more) more.remove(); hb.classList.remove("ez-open"); var rw0 = document.getElementById("ezrows"); if (rw0) rw0.remove();
      if (!pl){ pl = document.createElement("button"); pl.id = "ezpro"; pl.type = "button"; pl.textContent = "🔰 쉬운 화면으로 보기"; pl.onclick = function(){ setMode("easy"); }; hb.parentNode.insertBefore(pl, hb); }
      return;
    }
    if (pl) pl.remove();
    if (!h){ h = document.createElement("section"); h.id = "ezhero"; h.className = "ez-hero"; h.setAttribute("data-noemo", "1"); h.innerHTML = '<div class="ez-load ez-skel"><i></i><i></i><i></i></div>'; hb.parentNode.insertBefore(h, hb); HB = 0; }
    if (!more){
      more = document.createElement("div"); more.id = "ezmore";
      more.innerHTML = '<button type="button" class="ez-open">▾ 오늘 자세히 보기 <small>5개 시장 · 오늘의 발견 · 업종 지도 · 1탭 예측</small></button>' +
        '';   /* 🧊 11/12 🎁 더보기(운세·사주·타로·로또) 서랍은 🔬 연구실로 */
      h.insertAdjacentElement("afterend", more);
      more.querySelector(".ez-open").onclick = function(){ var o = hb.classList.toggle("ez-open"), btn = this, t0 = btn.getBoundingClientRect().top, end = Date.now() + 3000, stop = function(){ end = 0; };
        /* 🔧 11/10 자가 업그레이드: 신호등이 막 그려진 뒤 바로 누르면 위 칸(🧭 결론·🧲 수급 등)이 늦게 채워지며 단추가 아래로 밀리던 것(건강검진 383→1802px) → 3초 동안 단추 자리를 붙잡음 · 손가락으로 움직이면 바로 놓음 */
        addEventListener("touchstart", stop, {once: true, passive: true}); addEventListener("wheel", stop, {once: true, passive: true});
        (function pin(){ if (!btn.isConnected) return; var d = btn.getBoundingClientRect().top - t0; if (Math.abs(d) > 2) scrollBy(0, d); if (Date.now() < end) requestAnimationFrame(pin); })(); if (o && window.__h2apply) setTimeout(window.__h2apply, 30); this.innerHTML = o ? "▴ 접기" : '▾ 오늘 자세히 보기 <small>5개 시장 · 오늘의 발견 · 업종 지도 · 1탭 예측</small>'; };   /* 🔧 11/05 자가 업그레이드: 펼칠 때 화면을 hb 맨 위로 끌어 「▴ 접기」가 화면 밖(383→−189px)으로 튀던 것 → 누른 단추 제자리, 내용은 바로 아래 */
    }
    // 🧹 11/11 ④ 한 줄 목록은 신호등 상자 바로 아래(내 종목·대형주·이번 주·고객 질문 칸 #mnbox 보다 위)
    var rw = document.getElementById("ezrows");
    if (!rw){ rw = document.createElement("section"); rw.id = "ezrows"; rw.setAttribute("data-noemo", "1"); rw.innerHTML = '<p class="ez-rh">오늘 한 줄씩</p><div class="ez-rows"><div class="ez-row"><span class="ez-r ez-ph">불러오는 중…</span></div></div>'; }
    var jm_ = document.getElementById("jobmap"), an_ = jm_ && jm_.previousElementSibling === h ? jm_ : h;   // 🧊 11/12 「할 수 있는 일」 지도(ux1112.js)가 신호등 바로 아래 · 한 줄 목록은 그 아래
    if (an_.nextElementSibling !== rw) an_.insertAdjacentElement("afterend", rw);
    mnFold();
    if (Date.now() - HB > 60000){ HB = Date.now();
      brief().then(function(b){ var x = document.getElementById("ezhero"), y = document.getElementById("ezrows"); if (!x) return; var ok = b && (b.one || b.talk);
        x.innerHTML = ok ? heroHtml(b) : '<div class="ez-load">아직 오늘 자료가 안 올라왔어요 · 아래 「오늘 자세히 보기」를 눌러 주세요</div>';
        if (y) y.innerHTML = ok ? rowsHtml(b) : '';   /* 참고용 문구는 화면 맨 아래 공통 고지가 맡음 */
        x.classList.add("ez-done"); }); }
  }

  /* 🧹 11/11 ④ ⑦ 내 종목·대형주·이번 주·고객 질문(#mnbox, mine.js) — 쉬운 첫 화면에선 제목 한 줄씩, 누르면 펼침 · 시간대별 순서 */
  var MNOPEN = {};
  function mnFold(){
    var m = document.getElementById("mnbox"); if (!m || !EZ()) return;
    var ph = window.__ezPh ? __ezPh() : 0;
    [].forEach.call(m.children, function(c){ if (!c.id) return; c.classList.add("ez-f"); c.classList.toggle("ez-x", !!MNOPEN[c.id]); if (MNORD[c.id]) c.style.order = MNORD[c.id][ph]; });
  }
  document.addEventListener("click", function(ev){
    if (!EZ() || !ev.target.closest) return;
    var h = ev.target.closest("#mnbox .ez-f > h3");
    if (h && !ev.target.closest(".gd,.gdk,[data-gd],img")){ var c = h.parentNode; MNOPEN[c.id] = !MNOPEN[c.id]; c.classList.toggle("ez-x", MNOPEN[c.id]); ev.stopPropagation(); return; }
    var k = ev.target.closest("[data-ezclamp]"); if (k){ k.classList.toggle("ez-open1"); return; }
    var bb = ev.target.closest("[data-ezbub]"); if (bb){ ev.stopPropagation();   // 🫧 버블 경보 → 「오늘 자세히 보기」를 열고 버블 경보판으로
      var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open"); if (hb && !hb.classList.contains("ez-open") && op) op.click();
      var n = 0; (function seek(){ var x = document.getElementById("bubble"); if (x){ x.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++n < 20) setTimeout(seek, 250); })(); }
  }, true);
  function homeFlag(){ D.classList.toggle("ez-home", EZ() && cur() === "home"); }

  /* ── ⑥ 🙋 뭐 보면 돼요? ── */
  var ASK = [
    ["home", "🌤", "오늘 장 어때요?", "신호등 한 장"],
    ["sector", "🌏", "미국·중국·일본은요?", "5개 시장 한눈에"],
    ["port", "💼", "지금 뭘 얼마나 사요?", "포트 비중 그대로"],
    ["prop", "📝", "고객 제안서 만들기", "성향 → 상품 → 금액 → 끝"],
    ["@send", "📨", "고객에게 한 장 보내기", "카톡용 그림 한 장"],
    ["@qa", "💬", "고객이 이렇게 물으면?", "오늘 시황으로 쓴 답 25개 · 🔥 이슈 5개"],
    ["bond", "🏦", "채권·ELS 금리 보기", "상품 한곳에서"],
    ["flow", "🧲", "외국인·기관은 뭘 사요?", "국내 수급 한눈에"],
    ["prob", "🎲", "오늘 오를 확률은?", "한국장 기준"],
    ["luck", "🔮", "오늘의 운세", "운세·사주·타로"]
  ];
  function help(){
    var old = document.getElementById("ezsheet"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "ezsheet";
    var ord = ROLE() === "inv" ? ["port", "prob", "flow", "home", "sector", "bond", "prop", "@send", "@qa", "luck"] : ROLE() === "look" ? ["home", "sector", "flow", "prob", "luck", "port", "bond", "prop", "@send", "@qa"] : null;
    var AS = ord ? ASK.slice().sort(function(a, b){ return ord.indexOf(a[0]) - ord.indexOf(b[0]); }) : ASK;
    d.innerHTML = '<div class="ezs-in"><div class="ezs-h"><img src="img/kid_think.jpg?v=1" alt=""><div><b>뭐 보면 돼요?</b><small>궁금한 걸 누르면 그 화면으로 데려가요</small></div><button type="button" class="ezs-x" aria-label="닫기">✕</button></div>' +
      '<div class="ezs-g">' + AS.map(function(a){ return '<button type="button" data-ask="' + a[0] + '"><span>' + a[1] + '</span><b>' + e(a[2]) + '</b><small>' + e(a[3]) + '</small></button>'; }).join("") + '</div>' +
      '<button type="button" class="ezs-mode">🔬 연구실 — 포트 · 신호 · 성적표 · 운세</button></div>';
    document.body.appendChild(d);
    d.addEventListener("click", function(ev){
      var t = ev.target;
      if (t === d || (t.closest && t.closest(".ezs-x"))) { d.remove(); return; }
      if (t.closest && t.closest(".ezs-mode")) { d.remove(); if (typeof window.go === "function") go("lab"); return; }
      var a = t.closest && t.closest("[data-ask]"); if (!a) return; d.remove();
      var k = a.dataset.ask;
      if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); return; }
      if (k === "@send"){ if (window.__onepage) (__onepage.chooser || __onepage.go)(null); return; }
      if (typeof window.go === "function") go(k); window.scrollTo(0, 0);
    });
  }
  window.__ezHelp = function(){ help(); };
  function askBtn(){   // 아래 탭 바 안 「🙋 뭐 보지?」 — 화면을 가리지 않게(떠 있는 단추 대신)
    var b = document.getElementById("ezask"), nav = document.getElementById("bnav"), all = document.getElementById("ezall");
    if (b) b.remove(); return;   // 🧊 11/12 🙋 는 첫 화면 「할 수 있는 일」 지도가 대신함(도움말 창은 🔬 연구실·구경 버튼에서 그대로 열림)
    if (b && b.nextSibling === all) return;
    if (!b){ b = document.createElement("button"); b.id = "ezask"; b.type = "button"; b.innerHTML = '<span class="i">🙋</span><span>뭐 보지?</span>'; b.onclick = help; }
    nav.insertBefore(b, all || null);
  }

  /* ── ⑧ 제안서 4단계 ── */
  var VIEW = 0, LASTAT = -1;
  function stepCards(w){   // 🧊 11/09 ⑦ 단계별 카드 — 성향·상품(기본폼) / 이름·금액 / 고지·만들기
    var top = w.querySelector(".pp-top"), cu = document.getElementById("ppcust"), sim = w.querySelector(".pp-sim"), mk = document.getElementById("ppshow");
    var amt = [].filter.call(w.querySelectorAll(":scope > section.card"), function(c){ return /상품별 금액/.test((c.innerText || "").slice(0, 30)); })[0];
    cu = cu && cu.closest("section.card"); mk = mk && mk.closest("section.card");
    return [[top], [top], [cu, amt], [sim, mk]];
  }
  function stepShow(w){
    var SC = stepCards(w), on = [].concat(SC[VIEW] || []);
    [].forEach.call(w.querySelectorAll(":scope > section.card"), function(c){ c.classList.toggle("ezw-off", EZ() && on.indexOf(c) < 0); });
    var nv = document.getElementById("ezwnav");
    if (!EZ()){ if (nv) nv.remove(); return; }
    if (!nv){ nv = document.createElement("div"); nv.id = "ezwnav"; }
    if (nv.parentNode !== w.parentNode || w.nextSibling !== nv) w.parentNode.insertBefore(nv, w.nextSibling);
    var k = String(VIEW); if (nv.dataset.k === k) return; nv.dataset.k = k;
    nv.innerHTML = (VIEW > 0 ? '<button type="button" data-wv="' + (VIEW - 1) + '">◂ 이전</button>' : '<span></span>') +
      (VIEW < 3 ? '<button type="button" class="go" data-wv="' + (VIEW === 0 ? 1 : VIEW + 1) + '">다음 ▸ ' + ["", "", "이름·금액", "만들기"][VIEW === 0 ? 2 : VIEW + 1] + '</button>' : '<span></span>');
    nv.onclick = function(ev){ var b = ev.target.closest("[data-wv]"); if (!b) return; VIEW = +b.dataset.wv; if (VIEW === 1) VIEW = 2; z_k(); wiz(); window.scrollTo({top: 0, behavior: "smooth"}); };
  }
  function z_k(){ var z = document.getElementById("ezwiz"); if (z) z.dataset.k = ""; }
  function wiz(){
    if (cur() !== "prop" || !EZ()) { var o = document.getElementById("ezwiz"); if (o && cur() !== "prop") o.remove(); if (o && !EZ()) o.remove();
      var nv0 = document.getElementById("ezwnav"); if (nv0 && (cur() !== "prop" || !EZ())) nv0.remove(); [].forEach.call(document.querySelectorAll(".ezw-off"), function(c){ if (!EZ() || cur() !== "prop") c.classList.remove("ezw-off"); });
      if (cur() !== "prop"){ VIEW = 0; LASTAT = -1; } return; }
    var w = document.getElementById("ppw"); if (!w || !w.querySelector(".pp-pf")) return;
    var S = [
      ["🧭", "성향", ".pp-pf", !!w.querySelector(".pp-pg button.on")],
      ["📦", "상품", ".pp-grid", !!w.querySelector(".pp-f.on")],
      ["💰", "이름·금액", "#ppcust", !!((document.getElementById("ppcust") || {}).value) && [].some.call(w.querySelectorAll("input[data-ak]"), function(i){ return +i.value > 0; })],
      ["📤", "만들기", "#ppshow", false]
    ];
    var at = 0; while (at < 3 && S[at][3]) at++;
    if (LASTAT < 0) VIEW = Math.min(at, 1); else if (at === 1 && LASTAT === 0 && VIEW === 0) VIEW = 1;   // 성향 고르면 같은 카드의 상품으로
    LASTAT = at;
    var MSG = ["고객 투자성향부터 골라 주세요", "보낼 상품을 골라 주세요 (여러 개 가능)", "고객 이름과 금액을 넣어 주세요", "📱 한 장 · PDF · PPT 중 하나만 누르면 끝!"];
    var key = S.map(function(s){ return s[3] ? 1 : 0; }).join("") + at + "v" + VIEW;
    stepShow(w);
    var z = document.getElementById("ezwiz");
    if (z && z.dataset.k === key && z.parentNode === w.parentNode) return;
    if (!z){ z = document.createElement("div"); z.id = "ezwiz"; }
    if (z.parentNode !== w.parentNode || z.nextSibling !== w) w.parentNode.insertBefore(z, w);
    z.dataset.k = key;
    var vs = VIEW === 1 && !S[0][3] ? 0 : VIEW;   // 보고 있는 단계
    z.innerHTML = '<div class="ezw-s">' + S.map(function(s, i){ return '<button type="button" data-st="' + i + '" class="' + (i === vs || (vs === 0 && i === 1 && VIEW === 1) ? "on" : s[3] ? "ok" : "") + '"><b>' + (s[3] ? "✓" : i + 1) + '</b><span>' + s[0] + ' ' + s[1] + '</span></button>'; }).join("") + '</div>' +
      '<p class="ezw-m"><b>' + (vs + 1) + '단계</b> ' + e(MSG[vs]) + '</p>';
    z.querySelectorAll("[data-st]").forEach(function(btn){ btn.onclick = function(){ var i = +btn.dataset.st, s = S[i]; VIEW = i; z.dataset.k = ""; wiz();
      var t = w.querySelector(s[2]) || document.querySelector(s[2]); if (!t) { window.scrollTo({top: 0, behavior: "smooth"}); return; }
      var c = t.closest(".card") || t; if (c.classList.contains("cz-on")) c.click();
      c.scrollIntoView({behavior: "smooth", block: "center"}); c.classList.remove("ezw-hl"); void c.offsetWidth; c.classList.add("ezw-hl"); }; });
  }

  /* ── ⑪ 첫 방문 3장 ── */
  var TOURON = false;
  function tour(){
    if (!EZ() || TOURON || ls("ez_tour") || navigator.webdriver || /[?&]embed=1/.test(location.search)) return;
    if (cur() !== "home" || !document.querySelector("#ezhero .ez-light") || document.getElementById("wowob") || document.getElementById("gdq") || document.getElementById("uxob")) return;
    if (!ls("wow_ob")) return;   // wow.js 첫 인사가 먼저
    /* 🧊 11/12 「나는 누구?」 질문은 없앰 */
    TOURON = true; ls("ux_ob3", 1);   // ux1105 의 옛 3곳 안내(지금은 접혀 있는 칸을 가리킴)는 대신함
    var T = [
      ["#ezhero .ez-light", "1 / 3", "이것만 보면 돼요", "🟢 좋은 날 · 🟡 흔들리는 장 · 🔴 조심하는 장 — 하락장 계기판(종가)으로 판정해요. 바로 밑 「규칙」을 누르면 언제 바뀌는지 나와요."],
      ["#ezhero .ez-cta", "2 / 3", "오늘 할 일은 이것 하나", ROLE() !== "inv" && ROLE() !== "look" ? "누르면 오늘 시장을 그림 한 장으로 만들어 카톡으로 보낼 수 있어요." : ROLE() === "inv" ? "누르면 지금 뭘 얼마나 담으면 되는지(비중·주문서)로 가요." : "누르면 궁금한 것 8가지 중에서 골라 볼 수 있어요."],
      ["#jobmap", "3 / 3", "할 수 있는 일은 이게 전부", "보내기 · 제안서 · 상품 · 종목 — 아래 탭과 같아요. 포트·신호·운세 같은 깊은 화면은 🔬 연구실에 모아 뒀어요."]
    ], k = 0;
    var m = document.createElement("div"); m.id = "eztour"; document.body.appendChild(m);
    function end(){ ls("ez_tour", 1); m.remove(); TOURON = false; window.scrollTo({top: 0, behavior: "smooth"}); }
    function draw(){
      var t = T[k], el = document.querySelector(t[0]); if (!el){ if (++k < T.length) return draw(); return end(); }
      if (t[0] !== "#ezask") el.scrollIntoView({block: "center"});
      setTimeout(function(){
        var r = el.getBoundingClientRect(), below = r.top < innerHeight / 2;
        m.innerHTML = '<div class="ezt-hole" style="top:' + (r.top - 6) + 'px;left:' + (r.left - 6) + 'px;width:' + (r.width + 12) + 'px;height:' + (r.height + 12) + 'px"></div>' +
          '<div class="ezt-tip" style="' + (below ? "top:" + Math.min(innerHeight - 200, r.bottom + 14) : "bottom:" + Math.min(innerHeight - 200, innerHeight - r.top + 14)) + 'px"><small>' + t[1] + '</small><b>' + t[2] + '</b><p>' + t[3] + '</p><div><button type="button" data-x>건너뛰기</button><button type="button" class="go" data-n>' + (k === T.length - 1 ? "시작하기" : "다음") + '</button></div></div>';
      }, 260);
    }
    m.addEventListener("click", function(ev){ var t = ev.target; if (t.closest("[data-n]")){ if (++k >= T.length) end(); else draw(); } else if (t.closest("[data-x]")) end(); });
    draw();
  }

  /* ── ⑫ 막히는 곳 재기 (usage.js 의 하루 주머니에 같이 넣음 · 화면 이름만) ── */
  var NM = {home: "오늘", market: "시황", sector: "시장 흐름", prob: "오를 확률", flow: "수급", port: "포트", divc: "배당비교", score: "성적표", whale: "큰손", cup: "컵 차트", gap: "갭 상승", screen: "종목 찾기", sigmore: "신호 더 보기", bond: "채권", fund: "펀드", els: "ELS", prop: "제안서", luck: "운세", saju: "사주", tarot: "타로", lotto: "로또", feed: "피드", onepager: "종목리포트"};
  function bagAdd(label){
    try { var day = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), b = JSON.parse(localStorage.getItem("us_tap") || "null");
      if (!b || b.day !== day) b = {day: day, taps: {}, views: {}, n: 0};
      b.taps[label] = (b.taps[label] || 0) + 1; b.n++; localStorage.setItem("us_tap", JSON.stringify(b)); } catch(x) {}
  }
  var lastK = "", lastAt = 0;
  function watchView(){
    var k = cur(); if (!k || k === lastK) return;
    if (lastK && Date.now() - lastAt < 5000 && !document.hidden) bagAdd("⏱ 5초 안에 떠남 · " + (NM[lastK] || lastK));
    lastK = k; lastAt = Date.now();
  }
  document.addEventListener("click", function(ev){ var t = ev.target; if (t && t.closest && t.closest("#backbtn")) bagAdd("↩ 뒤로 · " + (NM[cur()] || cur())); }, true);

  /* ── 공통 ── */
  function toast(t){ var x = document.createElement("div"); x.className = "ez-toast"; x.textContent = t; document.body.appendChild(x); setTimeout(function(){ x.classList.add("out"); }, 2400); setTimeout(function(){ x.remove(); }, 2900); }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-ezgo]"); if (!t) return; ev.stopPropagation(); if (window.go) go(t.dataset.ezgo); window.scrollTo(0, 0); });
  function apply(){
    D.setAttribute("data-ez", EZ() ? "easy" : "pro");
    if (EZ()) ls("ux_ob3", 1);
    var h = document.getElementById("ezhero"); if (!EZ() && h) h.remove();
    tick();
  }
  var q = 0;
  function tick(){ q = 0;
    try { bar(); } catch(x) {}
    try { askBtn(); } catch(x) {}
    try { homeFlag(); home(); } catch(x) { console.warn("ez home", x); }
    try { wiz(); } catch(x) {}
    try { watchView(); } catch(x) {}
    if (cur() === "home") setTimeout(tour, 1800);
  }
  function soon(){ if (!q) q = setTimeout(tick, 200); }
  function start(){ apply(); try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {} setInterval(tick, 3000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  /* ── 모양 ── */
  var R = "html[data-ez=easy]";
  var st = document.createElement("style");
  st.textContent =
    /* ② 아래 탭: 쉬운 화면엔 오늘 · 포트 · 제안서 + ☰ */
    /* 🧊 11/12 아래 탭 숨김 규칙 없앰 — nav2.js 5칸 */
    "html[data-ez=pro] #ezall{display:none}#ezall .i{font-size:20px}" +
    /* ① 첫 화면: 머리 카드·예전 오늘 화면은 「자세히」 아래 */
    R + "[data-tab=home] #main>.hero{display:none!important}" +
    R + " #hmbody:not(.ez-open){display:none!important}" +
    ".ez-hero{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:18px 18px 16px;margin:4px 0 12px;font-size:17px;line-height:1.5}" +
    ".ez-load{padding:24px 0;text-align:center;color:var(--sub);font-size:16px}" +
    ".ez-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px!important;color:var(--sub);margin-bottom:12px}" +
    ".ez-ph{display:flex;gap:4px}.ez-ph i{font-style:normal;font-size:12.5px!important;padding:3px 8px;border-radius:99px;background:var(--panel2,rgba(127,127,127,.12));opacity:.55}.ez-ph i.on{opacity:1;font-weight:800;color:var(--text);box-shadow:inset 0 0 0 1.5px var(--c,#7c9cff)}" +
    ".ez-light{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:18px;margin-bottom:12px}" +
    ".ez-light.g{background:rgba(46,204,113,.13)}.ez-light.y{background:rgba(242,201,76,.16)}.ez-light.r{background:rgba(240,68,82,.13)}" +
    ".ez-light>b{font-size:46px;line-height:1}.ez-light small{display:block;font-size:13px!important;color:var(--sub)}.ez-light strong{display:block;font-size:27px;font-weight:900;letter-spacing:-.5px;line-height:1.2}.ez-light em{display:block;font-style:normal;font-size:15px!important;color:var(--sub)}" +
    ".ez-one{font-size:19px;font-weight:800;line-height:1.45;margin:0 2px 12px;word-break:keep-all}" +
    ".ez-nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:8px;margin-bottom:12px}.ez-nums div{background:var(--panel2,rgba(127,127,127,.1));border-radius:14px;padding:10px 8px;text-align:center}" +
    ".ez-nums small{display:block;font-size:13px!important;color:var(--sub)}.ez-nums b{display:block;font-size:22px;font-weight:900}.ez-nums em{display:block;font-style:normal;font-size:12.5px!important;color:var(--sub)}" +
    ".ez-hero .up{color:var(--up,#f04452)}.ez-hero .dn{color:var(--down,#3182f6)}" +
    ".ez-act{border-left:4px solid var(--c,#7c9cff);padding:2px 0 2px 12px;margin:0 0 14px}.ez-act small{font-size:13px!important;color:var(--sub)}.ez-act p{margin:2px 0 0;font-size:17px;font-weight:700;line-height:1.5;word-break:keep-all}" +
    ".ez-cta{display:block;width:100%;font:inherit;font-size:18px;font-weight:900;padding:15px 12px;border:0;border-radius:16px;background:#3182f6;color:#fff;cursor:pointer}.ez-cta:active{transform:scale(.98)}" +
    ".ez-early{font-style:normal;font-size:11.5px!important;font-weight:700;color:#b7791f;background:rgba(242,201,76,.2);padding:1px 6px;border-radius:99px;margin-left:4px}" +
    ".ez-hit{margin:-4px 2px 10px;font-size:13.5px!important;color:var(--sub);cursor:pointer}.ez-hit b{color:var(--text)}.ez-hit i{font-style:normal;color:#3182f6;font-weight:700}" +
    ".ez-rule{margin:0 0 12px;border:1px solid var(--line);border-radius:14px;padding:9px 12px;font-size:14.5px}.ez-rule summary{font-weight:800;cursor:pointer;list-style:none}.ez-rule summary::after{content:' ▾';color:var(--sub)}.ez-rule[open] summary::after{content:' ▴'}" +
    ".ez-rule p{margin:8px 0 0;line-height:1.5;word-break:keep-all}.ez-rule ul{margin:8px 0 0;padding:0;list-style:none}.ez-rule li{padding:3px 0;font-size:14px}.ez-rule li small{display:block;color:var(--sub);font-size:12.5px!important;margin-left:22px}.ez-rule-n{font-size:12.5px!important;color:var(--sub)}" +
    ".ez-mix{margin:0 2px 10px;padding:8px 10px;border-radius:12px;background:rgba(242,201,76,.16);font-size:14.5px!important;font-weight:700;word-break:keep-all}" +
    ".ez-chg{margin:0 0 14px;padding:10px 12px;border-radius:14px;background:var(--panel2,rgba(127,127,127,.1));cursor:pointer}.ez-chg small{font-size:12.5px!important;color:var(--sub);font-weight:700}.ez-chg p{margin:2px 0 0;font-size:15.5px;font-weight:800;word-break:keep-all}.ez-chg em{display:block;font-style:normal;font-size:13px!important;color:var(--sub);margin-top:2px}" +
    ".ez-cta.red{background:#e5484d}.ez-todo{margin:0 2px 6px;font-size:13px!important;font-weight:800;color:var(--sub)}" +
    ".ez-role{margin:0 0 4px;padding:12px;border-radius:16px;border:1.5px solid #3182f6;background:rgba(49,130,246,.06)}.ez-role>b{display:block;font-size:17px}.ez-role>small{display:block;font-size:12.5px!important;color:var(--sub);margin-bottom:8px}" +
    ".ez-role>div{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.ez-role button{display:flex;flex-direction:column;align-items:center;gap:1px;font:inherit;font-size:15px;font-weight:800;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 4px;cursor:pointer}.ez-role button span{font-size:22px}.ez-role button small{font-size:11.5px!important;font-weight:500;color:var(--sub);text-align:center;word-break:keep-all}" +
    ".ezw-off{display:none!important}#ezwnav{display:flex;justify-content:space-between;gap:8px;margin:8px 0 16px}#ezwnav button{flex:1;font:inherit;font-size:16px;font-weight:800;border:1px solid var(--line);border-radius:14px;padding:13px 10px;background:var(--panel);color:var(--text);cursor:pointer}#ezwnav button.go{background:#3182f6;color:#fff;border-color:#3182f6}#ezwnav span{flex:1}" +
    ".ez-note{margin:8px 0 0;font-size:12.5px!important;color:var(--dim,var(--sub));text-align:center}" +
    "#ezmore{margin:0 0 12px}#ezmore .ez-open{display:block;width:100%;font:inherit;font-size:16px;font-weight:800;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:13px 12px;cursor:pointer}#ezmore .ez-open small{display:block;font-size:13px!important;font-weight:500;color:var(--sub);margin-top:2px}" +
    ".ez-drawer{margin-top:12px}.ez-drawer>small{font-size:13px!important;color:var(--sub);font-weight:700}.ez-drawer>div{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}.ez-drawer button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:14px;font-weight:700;color:var(--sub);background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 4px;cursor:pointer}.ez-drawer button span{font-size:20px}" +
    R + " #hmbody.ez-open #uxluck{display:none}" +
    "#ezpro{display:block;width:100%;font:inherit;font-size:14px;font-weight:700;color:var(--sub);background:transparent;border:1px dashed var(--line);border-radius:12px;padding:9px;margin:0 0 10px;cursor:pointer}" +
    /* ⑥ 🙋 */
    "#ezask .i{font-size:20px}html[data-ez=pro] #ezask{display:none}" +
    "#ezsheet{position:fixed;inset:0;z-index:9990;background:rgba(8,12,20,.55);display:flex;align-items:flex-end}" +
    ".ezs-in{width:100%;max-width:560px;margin:0 auto;background:var(--panel,#fff);border-radius:22px 22px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 16px);max-height:88vh;overflow:auto}" +
    ".ezs-h{display:flex;align-items:center;gap:10px;margin-bottom:12px}.ezs-h img{width:46px;height:46px;border-radius:50%;object-fit:cover}.ezs-h b{display:block;font-size:20px}.ezs-h small{font-size:13.5px!important;color:var(--sub)}.ezs-h>div{flex:1}" +
    ".ezs-x{font:inherit;font-size:18px;background:none;border:0;color:var(--sub);padding:6px 8px;cursor:pointer}" +
    ".ezs-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ezs-g button{display:grid;grid-template-columns:30px 1fr;column-gap:8px;align-items:center;text-align:left;font:inherit;color:var(--text);background:var(--panel2,rgba(127,127,127,.1));border:1px solid var(--line);border-radius:16px;padding:10px 10px;cursor:pointer}.ezs-g span{font-size:22px;grid-row:1/3}.ezs-g b{display:block;font-size:15px;line-height:1.3;word-break:keep-all}.ezs-g small{font-size:13px!important;color:var(--sub);line-height:1.3}" +
    ".ezs-mode{display:block;width:100%;margin-top:12px;font:inherit;font-size:15px;font-weight:700;color:var(--sub);background:none;border:1px dashed var(--line);border-radius:14px;padding:11px;cursor:pointer}" +
    /* ⑧ 제안서 단계 */
    "#ezwiz{position:sticky;top:var(--hh,56px);z-index:30;background:var(--bg);padding:8px 0 6px;margin:0 0 6px}" +
    ".ezw-s{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.ezw-s button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:12.5px;color:var(--sub);background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:7px 2px;cursor:pointer}" +
    ".ezw-s b{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;background:var(--panel2,rgba(127,127,127,.15))}" +
    ".ezw-s button.on{color:var(--text);font-weight:800;border-color:#3182f6;box-shadow:0 0 0 1.5px #3182f6}.ezw-s button.on b{background:#3182f6;color:#fff}.ezw-s button.ok b{background:#2ecc71;color:#fff}" +
    ".ezw-m{margin:7px 2px 0;font-size:15px!important;font-weight:700}.ezw-m b{color:#3182f6;margin-right:4px}" +
    "@keyframes ezhl{0%{box-shadow:0 0 0 0 rgba(49,130,246,.7)}100%{box-shadow:0 0 0 14px rgba(49,130,246,0)}}.ezw-hl{animation:ezhl 1s ease-out 2}" +
    /* ⑪ 안내 */
    "#eztour{position:fixed;inset:0;z-index:9998}.ezt-hole{position:fixed;border-radius:18px;box-shadow:0 0 0 9999px rgba(8,12,20,.68);border:2px solid #fee500;pointer-events:none;transition:all .25s}" +
    ".ezt-tip{position:fixed;left:16px;right:16px;background:#fff;color:#191f28;border-radius:18px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.3)}.ezt-tip small{font-size:12.5px;color:#6b7684;font-weight:700}.ezt-tip b{display:block;font-size:20px;margin:2px 0 4px}.ezt-tip p{margin:0 0 12px;font-size:16px;line-height:1.5;color:#333d4b}" +
    ".ezt-tip div{display:flex;gap:8px;justify-content:flex-end}.ezt-tip button{font:inherit;font-size:15px;font-weight:700;border:0;border-radius:12px;padding:10px 16px;background:#f2f4f6;color:#4e5968}.ezt-tip button.go{background:#3182f6;color:#fff}" +
    ".ez-toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 130px);transform:translateX(-50%);z-index:9999;background:rgba(25,31,40,.94);color:#fff;font-size:14.5px;font-weight:700;padding:11px 16px;border-radius:14px;max-width:90vw;text-align:center;transition:opacity .4s}.ez-toast.out{opacity:0}";
  document.head.appendChild(st);
  /* 🧹 11/11 첫 화면 간결화 — 모양 (위 규칙을 덮어씀) */
  var st2 = document.createElement("style");
  st2.textContent =
    ".ez-hero{padding:14px 14px 14px;min-height:420px}.ez-hero.ez-done{min-height:0}" +   /* ⑧ 자리 미리 잡기 */
    ".ez-skel{display:flex;flex-direction:column;gap:12px;padding:6px 0}.ez-skel i{display:block;border-radius:16px;background:var(--panel2,rgba(127,127,127,.12));animation:ezsk 1.2s ease-in-out infinite alternate}.ez-skel i:nth-child(1){height:230px}.ez-skel i:nth-child(2){height:72px}.ez-skel i:nth-child(3){height:56px}@keyframes ezsk{to{opacity:.45}}" +
    ".ez-hero .ez-top{display:block;margin:0 2px 10px;font-size:12.5px!important;color:var(--dim,var(--sub));font-weight:600}" +   /* ⑤ 회색 한 줄 */
    ".ez-light{display:block;padding:14px 14px 10px;margin-bottom:10px}.ez-lh{display:flex;align-items:center;gap:12px}" +
    ".ez-light .ez-lh>b{font-size:40px;line-height:1}.ez-light strong{font-size:26px}.ez-light em{font-size:14.5px!important}" +
    /* ② 결론 두 줄 — 신호등 안, 상자·제목 없이 */
    ".vd-mini{margin:10px 0 0;min-height:58px}.vd-mini .vd-in{border:0;background:transparent;padding:0}.vd-mini .vd-h,.vd-mini .vd-n,.vd-mini .vd-l b small{display:none!important}" +
    ".vd-mini .vd-r{padding:6px 0;border-top:1px solid rgba(127,127,127,.18);gap:8px}.vd-mini .vd-f{font-size:17px}.vd-mini .vd-l{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px}" +
    ".vd-mini .vd-l b{display:inline;font-size:13.5px!important;font-weight:700!important;color:var(--sub)!important}.vd-mini .vd-r em{display:inline;margin:0;font-size:15px!important;color:var(--text)!important}" +
    /* ③ 경보 한 줄 */
    ".ez-light .ez-rule{margin:6px 0 0;border:0;border-top:1px solid rgba(127,127,127,.18);border-radius:0;padding:8px 0 0;font-size:14px;background:transparent}" +
    ".ez-warn{display:block;width:100%;text-align:left;font:inherit;font-size:14px;font-weight:800;color:var(--text);background:transparent;border:0;border-top:1px solid rgba(127,127,127,.18);padding:8px 0 0;margin:6px 0 0;cursor:pointer;word-break:keep-all}.ez-warn i{font-style:normal;color:var(--sub)}" +
    ".ez-warn-y{font-weight:700;color:var(--sub);cursor:default}" +
    ".ez-nums{margin-bottom:10px;gap:6px}.ez-nums div{padding:8px 6px}.ez-nums b{font-size:20px}.ez-nums em{font-size:12px!important}" +
    ".ez-cta{font-size:17px;padding:14px 12px}.ez-cta.red{background:#e5484d}" +
    /* ④ 한 줄 목록 */
    "#ezrows{background:var(--panel);border:1px solid var(--line);border-radius:22px 22px 0 0;border-bottom:0;padding:12px 14px 4px;margin:0}" +
    "html[data-ez=easy] #ezrows+#mnbox{background:var(--panel);border:1px solid var(--line);border-top:0;border-radius:0 0 22px 22px;padding:0 14px 8px;margin:0 0 12px;display:flex;flex-direction:column}" +
    ".ez-rh{margin:0 2px 4px;font-size:15px;font-weight:800}.ez-rh small{font-size:12px!important;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".ez-rows{display:flex;flex-direction:column}.ez-row{border-top:1px solid var(--line)}.ez-row:first-child{border-top:0}" +
    ".ez-r{display:block;width:100%;text-align:left;font:inherit;font-size:15px;line-height:1.45;font-weight:600;color:var(--text);background:transparent;border:0;padding:11px 2px;cursor:pointer;word-break:keep-all;min-height:46px}" +
    ".ez-r small{display:block;font-size:12px!important;font-weight:700;color:var(--sub);margin-bottom:1px}.ez-r i{font-style:normal;color:var(--sub);float:right}.ez-r b{font-weight:900}" +
    ".ez-clamp{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.ez-clamp.ez-open1{-webkit-line-clamp:unset;display:block}" +
    ".ez-ph{color:var(--sub);font-weight:500}.ez-flow{min-height:46px}.ez-flow .fl-line{display:block;width:100%;text-align:left;font:inherit;font-size:15px;line-height:1.45;font-weight:600;color:var(--text);background:transparent;border:0;padding:11px 2px;word-break:keep-all;cursor:pointer}.ez-flow .fl-line i{font-style:normal;color:var(--sub);float:right}" +
    ".ez-rows .ez-rule.ez-r{border:0;border-radius:0;padding:11px 2px;background:transparent;font-size:15px}.ez-rows .ez-rule summary{font-weight:600}" +
    "#ezrows .ez-note{margin:4px 0 6px;font-size:12px!important}" +
    /* ④ #mnbox 칸 — 제목 한 줄 · 누르면 펼침 */
    "html[data-ez=easy] #mnbox .ez-f{background:transparent!important;border:0!important;border-top:1px solid var(--line)!important;border-radius:0!important;box-shadow:none!important;margin:0!important;padding:0!important}" +
    "html[data-ez=easy] #mnbox .ez-f>h3{margin:0!important;padding:12px 2px!important;font-size:15px!important;font-weight:700!important;cursor:pointer;display:flex;align-items:center;gap:6px}" +
    "html[data-ez=easy] #mnbox .ez-f>h3::after{content:'▾';margin-left:auto;color:var(--sub);font-size:13px}html[data-ez=easy] #mnbox .ez-f.ez-x>h3::after{content:'▴'}" +
    "html[data-ez=easy] #mnbox .ez-f>h3 .mut{font-size:12px!important;color:var(--sub);font-weight:500}" +
    "html[data-ez=easy] #mnbox .ez-f:not(.ez-x)>:not(h3){display:none!important}html[data-ez=easy] #mnbox .ez-f.ez-x{padding-bottom:10px!important}" +
    "html[data-ez=easy] #mnbox:empty{min-height:0}" +
    /* ⑨ 첫 화면엔 버튼 하나 — 머리줄 📨 · 뒤로 숨김 */
    "html.ez-home[data-ez=easy] body header .top #opbtn,html.ez-home[data-ez=easy] body #opbtn,html.ez-home[data-ez=easy] body #backbtn{display:none!important}";
  document.head.appendChild(st2);
})();
