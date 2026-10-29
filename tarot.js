/* CH Investing — 🃏 타로 (10/29 사용자: 「타로점 넣자 · 꿈보다 해몽이라 질문에 맞게 해석하는 게 관건 · 돈 안 들게 · 투자 말고도 다 촘촘하게」)
   돈 안 드는 구조: ① 질문을 휴대폰 안에서 읽음(주제 10가지 + 묻는 방식 5가지 + 대상 이름) → ② 카드 78장 × 주제 11개 × 정/역 해석 창고(tarot/topics.json)에서 고름
   → ③ 세 장(또는 1·5장)의 흐름·무늬·숫자·메이저 수·역방향 수로 결론(예·아니오 / 시기 / 방법 / A·B 선택 / 투자 판단)
   ④ 더 깊게: 「✨ Claude 심화 해석 문구」 복사 → Claude 채팅에 붙여 넣기(구독 안, API 비용 없음)
   카드 그림: 라이더-웨이트(1909, 저작권 만료) · 위키미디어 공용에서 불러옴, 실패하면 글자 카드
   데이터: tarot/deck.json(기본 뜻) · tarot/topics.json(주제별 해석) — 탭을 열 때만 받음 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function josa(w, a, b){ w = String(w || ""); var c = w.charCodeAt(w.length - 1) - 44032; if (c < 0 || c > 11171){ return /[0-9]$/.test(w) ? ("2459".indexOf(w.slice(-1)) >= 0 ? b : a) : b; } return (c % 28) ? a : b; }
  function shuffle(a){ for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(s){ var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  var DECK = null, TOP = null, LOAD = null;
  function load(){
    if (LOAD) return LOAD;
    var j = function(u){ return fetch(u).then(function(r){ if (!r.ok) throw new Error(u); return r.json(); }); };
    LOAD = Promise.all([j("tarot/deck.json?v=1"), j("tarot/topics.json?v=2")]).then(function(a){ DECK = a[0]; TOP = a[1]; return true; }, function(err){ LOAD = null; throw err; });
    return LOAD;
  }
  var WIKI = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  function imgURL(c, alt){ return WIKI + encodeURIComponent(alt || c.img) + "?width=360"; }
  var SUIT = {major: {ko: "메이저", el: "운명", sj: null, col: "#c9a227", ic: "✶"}, wands: {ko: "완드", el: "불", sj: "화", col: "#e0602f", ic: "🔥"},
              cups: {ko: "컵", el: "물", sj: "수", col: "#3c8fb0", ic: "💧"}, swords: {ko: "소드", el: "공기", sj: "금", col: "#8fa0b5", ic: "🗡️"}, pentacles: {ko: "펜타클", el: "흙", sj: "토", col: "#c49a22", ic: "🪙"}};

  /* ───────── ① 질문 읽기 ───────── */
  var TOPICS = [
    {k: "투자", ic: "📈", w: /들고 갈|들고갈|더 살|추가 매수|팔지 말|삼성|하이닉스|엔비디아|테슬라|애플|마이크로소프트|구글|알파벳|아마존|메타|팔란티어|브로드컴|AMD|TSMC|카카오|네이버|현대차|기아|LG|셀트리온|에코프로|포스코|한화|두산|SK|리플|솔라나|[A-Z]{2,5}\b|전자|바이오|증권|홀딩스|에너지|반도체|2차전지|조선|방산|주식|종목|매수|매도|사도|살까|사야|팔아|팔까|팔지|손절|익절|물타|코인|비트|이더|펀드|ETF|etf|채권|주가|상승|하락|오를|떨어|오르|투자|포트|나스닥|코스피|코스닥|S&P|배당|공모주|청약주|레버리지|인버스|ELS|주린|수익률|본전|추매|불타기|존버|장기투자|단타|매매|리밸런싱|금 시세|달러|환율/},
    {k: "재물", ic: "💰", w: /돈|월급|대출|빚|저축|적금|예금|빌려|갚|로또|복권|재물|금전|지출|용돈|보너스|성과급|연봉|부자|수입|생활비|카드값|횡재|재테크|상속|유산/},
    {k: "연애", ic: "💘", w: /연애|썸|고백|남친|여친|남자친구|여자친구|애인|짝사랑|재회|헤어|이별|소개팅|그 사람|그사람|좋아하|사랑|데이트|연락|카톡 답|밀당|전 남친|전 여친|전애인|호감/},
    {k: "결혼", ic: "💍", w: /결혼|남편|아내|와이프|부부|시댁|시어머니|처가|장모|육아|자녀|아들|딸|임신|출산|아기|가족|부모님|엄마|아빠|이혼|상견례|신혼|며느리|사위|집안/},
    {k: "직장", ic: "💼", w: /직장|회사|이직|취업|취직|승진|상사|팀장|부장|연봉 협상|면접|퇴사|부서|인사|발령|입사|합류|커리어|일자리|알바|프로젝트|평가|정규직|계약직|PB|지점/},
    {k: "사업", ic: "🏪", w: /사업|창업|가게|장사|매출|계약|거래처|동업|확장|오픈|개업|프랜차이즈|자영업|쇼핑몰|스타트업|폐업|납품|수주|영업/},
    {k: "시험", ic: "📚", w: /시험|합격|불합격|자격증|공부|수능|입시|대학|성적|토익|고시|면허|점수|붙을|떨어질까|재수|편입|대학원|논문|학교/},
    {k: "건강", ic: "🩺", w: /건강|아프|아픈|수술|다이어트|몸|컨디션|운동|잠|불면|스트레스|병원|회복|체중|살 빼|피곤|검진|치료/},
    {k: "관계", ic: "🤝", w: /친구|동료|사이|다툼|싸움|싸웠|화해|오해|사람들|모임|인간관계|서운|절교|뒷담|손절할|친해|멀어|사과/},
    {k: "이사", ic: "🏠", w: /이사|집|아파트|부동산|전세|월세|매매|청약|분양|이민|유학|여행|이동|해외|오피스텔|빌라|땅|토지|재건축|갭투자|이주/}
  ];
  var TOPIC_IC = {}; TOPICS.forEach(function(t){ TOPIC_IC[t.k] = t.ic; }); TOPIC_IC["일반"] = "🔮";
  function topicOf(q){
    var best = "일반", bs = 0;
    TOPICS.forEach(function(t, i){ var m = q.match(new RegExp(t.w.source, "g")), n = m ? m.length : 0; if (n > bs){ bs = n; best = t.k; } });
    return best;
  }
  function kindOf(q){
    if (/까\s*말까/.test(q)) return "yn";
    if (/아니면|\bvs\b|VS|대신|어느 쪽|어느쪽|어디가 나|뭐가 나|중에 (뭐|어느|어디|누가)|중 (뭐|어느|어디|누가)|중에서|둘 중/.test(q)) return "choice";
    if (/언제|몇 월|몇월|시기|타이밍|얼마나 걸|올해 안|연내|곧/.test(q)) return "when";
    if (/어떻게|방법|왜|뭘 해|무엇을 해|뭐부터|어떡해|해결/.test(q)) return "how";
    if (/(될까|할까|까요|을까|ㄹ까|맞을까|괜찮|좋을까|있을까|없을까|되나|하나요|인가요|일까|나요\??)\s*[?？]?\s*$/.test(q) || /\?$/.test(q)) return "yn";
    return "flow";
  }
  var STOP = /^(나|내|내가|저|제가|우리|지금|오늘|내일|올해|요즘|이번|다음|그냥|진짜|혹시|이거|저거|이번에|앞으로|계속|정말|과연|좀|더|어때|어떨까|운이|운세|요새|마음|사람|생각|어떻게|무엇|뭐)$/;
  function stripJ(w){ return w.replace(/(을|를|은|는|이|가|에|에서|으로|로|랑|이랑|하고|과|와|도|만|의|한테|께|에게)$/, ""); }
  function objOf(q){
    var m = q.match(/(그 사람|그사람|그 친구|그 남자|그 여자|걔|그분)/); if (m) return m[1];
    var tok = q.replace(/[?？!.,~]/g, " ").split(/\s+/).filter(Boolean);
    for (var i = 0; i < tok.length && i < 4; i++){ var w = stripJ(tok[i]); if (w.length >= 2 && !STOP.test(w) && !/^(사도|팔까|될까|할까|살까|어떻게|언제|왜)/.test(w)) return w; }
    return "";
  }
  function choiceOf(q){
    var m = q.match(/(.+?)\s*(?:아니면|vs|VS|대신)\s*(.+?)(?:\s|[?？]|$)/) || q.match(/(\S+?)(?:이랑|랑|하고|과|와)\s+(\S+?)\s*중/);
    if (!m) return null;
    var a = stripJ(m[1].trim().split(/\s+/).slice(-1)[0] || ""), b = stripJ(m[2].trim().split(/\s+/)[0] || "");
    b = b.replace(/(중|중에|중에서|할까|살까|갈까|일까|좋을까|나을까)$/, "");
    return a && b && a !== b ? [a, b] : null;
  }
  function readQ(q){
    q = String(q || "").trim();
    var t = topicOf(q), k = q ? kindOf(q) : "flow", o = objOf(q), c = k === "choice" ? choiceOf(q) : null;
    if (k === "choice" && !c) k = "yn";
    return {q: q, topic: t, kind: k, obj: o, ch: c};
  }
  var KIND_KO = {yn: "해도 될까? (예·아니오)", when: "언제? (시기)", how: "어떻게? (방법)", choice: "A냐 B냐? (선택)", flow: "흐름 보기"};

  /* ───────── 펼치기 ───────── */
  var SPREADS = [
    {id: "one", n: 1, nm: "한 장 — 빠른 답", note: "가볍게 한 장으로 바로 답을 봐요.", pos: ["답"]},
    {id: "act", n: 3, nm: "상황 · 행동 · 결과", note: "무엇을 할지 정할 때 가장 실용적이에요.", pos: ["지금 상황", "해야 할 행동", "결과"]},
    {id: "time", n: 3, nm: "과거 · 현재 · 미래", note: "흐름을 볼 때 — 어디서 와서 어디로 가는지.", pos: ["과거", "현재", "미래"]},
    {id: "rel", n: 3, nm: "나 · 상대 · 관계", note: "사람 사이의 일 — 두 마음과 그 사이.", pos: ["내 마음", "상대 마음", "둘의 관계"]},
    {id: "cause", n: 3, nm: "원인 · 걸림돌 · 열쇠", note: "왜 안 풀리는지 파고들 때.", pos: ["원인", "걸림돌", "열쇠"]},
    {id: "inv", n: 3, nm: "💹 오를 힘 · 조심할 것 · 결론", note: "종목 · 매매 판단을 볼 때.", pos: ["오를 힘", "조심할 것", "결론"]},
    {id: "invt", n: 3, nm: "💹 지금 · 3개월 뒤 · 1년 뒤", note: "보유할지, 얼마나 길게 볼지.", pos: ["지금", "3개월 뒤", "1년 뒤"]},
    {id: "choice", n: 3, nm: "A를 고르면 · B를 고르면 · 놓친 것", note: "두 갈래 중 고를 때.", pos: ["A를 고르면", "B를 고르면", "내가 놓친 것"]},
    {id: "five", n: 5, nm: "다섯 장 깊이 보기", note: "현재 · 막는 것 · 뿌리 · 가까운 미래 · 결과까지 촘촘히.", pos: ["지금", "막는 것", "뿌리(원인)", "가까운 미래", "결과"]}
  ];
  function spOf(id){ return SPREADS.filter(function(s){ return s.id === id; })[0] || SPREADS[1]; }
  function suggest(Q){
    if (Q.kind === "choice") return "choice";
    if (Q.topic === "투자") return Q.kind === "when" || /들고|보유|존버|장기|얼마나/.test(Q.q) ? "invt" : "inv";
    if (Q.topic === "연애" || Q.topic === "관계" || Q.topic === "결혼") return Q.kind === "how" ? "cause" : "rel";
    if (Q.kind === "how") return "cause";
    if (Q.kind === "when" || Q.kind === "flow") return "time";
    return "act";
  }

  /* ───────── ② 해석 ───────── */
  function en(c, rev){ var x = c.e; return Math.max(0, Math.min(10, rev ? (x >= 5 ? x - 3 : x + 2) : x)); }
  function txtOf(c, rev, topic){
    var T = TOP[c.id] || {}, key = rev ? "r" : "u";
    if (topic === "일반") return (T.일반 && T.일반[key]) || "";
    return (T[topic] && T[topic][key]) || (T.일반 && T.일반[key]) || "";
  }
  function ynOf(c, rev){ var T = TOP[c.id]; if (T && T.yn && T.yn[rev ? "r" : "u"] != null) return +T.yn[rev ? "r" : "u"]; var x = en(c, rev); return x >= 8 ? 2 : x >= 6 ? 1 : x >= 4 ? 0 : x >= 2 ? -1 : -2; }
  function invOf(c, rev){ var T = TOP[c.id]; return (T && T.inv && T.inv[rev ? "r" : "u"]) || (ynOf(c, rev) >= 1 ? "보유" : "관망"); }
  function oneOf(c, rev){ var T = TOP[c.id]; return (T && T.one && T.one[rev ? "r" : "u"]) || c.h[rev ? 1 : 0]; }
  var INV_V = {매도: -2, 익절: -1, 관망: 0, 보유: 0.6, 분할매수: 1.3, 매수: 2};
  var NUMV = {"에이스": 1, "시종": 11, "기사": 12, "여왕": 13, "왕": 14};
  function numOf(c){ return NUMV[c.n] || (+c.n || 0); }
  function linkLine(P, a, b, ea, eb){
    if (a.c.s === b.c.s && b.c.s !== "major") return "앞 장과 같은 " + SUIT[b.c.s].ko + "가 이어져요. 같은 영역이 반복되니 여기가 이 질문의 몸통이에요.";
    if (b.c.s === "major" && a.c.s !== "major") return "여기서 메이저 카드가 나왔어요. 내 뜻만으로는 안 되는 큰 흐름이 이 자리에 걸려 있어요.";
    if (eb >= ea + 3) return P[0] + "보다 기운이 확 올라가요. 이 자리에서 숨통이 트여요.";
    if (ea >= eb + 3) return P[0] + "보다 기운이 뚝 떨어져요. 이 자리가 아픈 곳이에요.";
    if (b.r && !a.r) return "앞 장은 똑바로 섰는데 이 장은 뒤집혔어요. 흐름이 여기서 한 번 꺾여요.";
    if (!b.r && a.r) return "막혀 있던 앞 장과 달리 이 장은 바로 섰어요. 여기서 풀리기 시작해요.";
    return P[0] + "에서 " + P[1] + (/[가-힣]$/.test(P[1]) && (P[1].charCodeAt(P[1].length - 1) - 44032) % 28 && (P[1].charCodeAt(P[1].length - 1) - 44032) % 28 !== 8 ? "으로" : "로") + " 자연스럽게 이어져요.";
  }
  function timing(cards){
    var cnt = {}, maj = 0, nums = [];
    cards.forEach(function(x){ cnt[x.c.s] = (cnt[x.c.s] || 0) + 1; if (x.c.s === "major") maj++; var n = numOf(x.c); if (n && n <= 10) nums.push(n); });
    var dom = Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a]; })[0], n = nums.length ? Math.round(nums.reduce(function(a, b){ return a + b; }, 0) / nums.length) : 3;
    var unit = {wands: ["주", "빠르게 — 몇 주 안"], swords: ["일", "갑자기 — 며칠~2주 안"], cups: ["주", "마음이 먼저 — 몇 주~두 달"], pentacles: ["달", "천천히 — 몇 달"], major: ["달", "큰 흐름을 따라 — 한 계절 이상"]}[dom];
    var revN = cards.filter(function(x){ return x.r; }).length, late = revN >= Math.ceil(cards.length / 2);
    var val = unit[0] === "일" ? Math.max(3, n * 2) + "일" : unit[0] === "주" ? Math.max(1, n) + "주" : Math.max(1, Math.round(n * (dom === "major" ? 1.5 : 1))) + "달";
    return {dom: dom, val: val, note: unit[1], late: late};
  }
  function readAll(Q, sp, picked){
    var P = sp.pos, ens = picked.map(function(x){ return en(x.c, x.r); }), score = Math.round(ens.reduce(function(a, b){ return a + b; }, 0) / ens.length * 10);
    var obj = Q.obj, A = Q.ch ? Q.ch[0] : "A", B = Q.ch ? Q.ch[1] : "B";
    var cards = picked.map(function(x, i){
      var pos = P[i].replace("A를", A + josa(A, "을", "를")).replace("B를", B + josa(B, "을", "를"));
      return {pos: pos, c: x.c, r: x.r, e: ens[i], one: oneOf(x.c, x.r), body: txtOf(x.c, x.r, Q.topic), act: x.c.ad[x.r ? 1 : 0], yn: ynOf(x.c, x.r), inv: invOf(x.c, x.r),
              link: i ? linkLine([P[i - 1], P[i]], {c: picked[i - 1].c, r: picked[i - 1].r}, {c: x.c, r: x.r}, ens[i - 1], ens[i]) : ""};
    });
    // 무늬·숫자·메이저 패턴
    var cnt = {}, majN = 0, revN = 0, aces = 0, courts = 0;
    cards.forEach(function(x){ cnt[x.c.s] = (cnt[x.c.s] || 0) + 1; if (x.c.s === "major") majN++; if (x.r) revN++; if (x.c.n === "에이스") aces++; if (/시종|기사|여왕|왕/.test(x.c.n)) courts++; });
    var pat = [];
    if (majN >= 2) pat.push(["✶", "메이저 카드가 " + majN + "장 — 작은 일이 아니라 인생의 큰 흐름이 걸린 질문이에요."]);
    else if (majN === 0 && cards.length >= 3) pat.push(["✋", "메이저 카드가 없어요 — 운명보다 내 선택과 노력으로 바꿀 수 있는 일이에요."]);
    var dom = Object.keys(cnt).filter(function(k){ return k !== "major" && cnt[k] >= 2; })[0];
    if (dom) pat.push([SUIT[dom].ic, SUIT[dom].ko + "가 " + cnt[dom] + "장 — " + {wands: "열정·행동이 열쇠예요. 생각보다 움직임이 답이에요.", cups: "마음·감정이 핵심이에요. 머리보다 마음이 원하는 걸 보세요.", swords: "생각·말·결정이 핵심이에요. 걱정은 줄이고 판단은 또렷하게.", pentacles: "돈·현실·몸이 핵심이에요. 숫자와 실제 조건부터 확인하세요."}[dom]]);
    if (revN >= Math.ceil(cards.length * 0.6)) pat.push(["↩️", "뒤집힌 카드가 " + revN + "장 — 아직 막힌 곳이 많아요. 서두르지 말고 때를 기다려요."]);
    else if (revN === 0 && cards.length >= 3) pat.push(["⬆️", "모든 카드가 바로 섰어요 — 흐름이 막힘없이 열려 있어요."]);
    if (aces) pat.push(["🌱", "에이스가 나왔어요 — 새로운 시작의 씨앗이 이미 있어요."]);
    if (courts >= 2) pat.push(["👥", "인물 카드가 " + courts + "장 — 이 일의 열쇠는 사람이에요. 누구와 함께하느냐가 결과를 바꿔요."]);
    // 결론
    var ynS = cards.reduce(function(a, x, i){ return a + x.yn * (i === cards.length - 1 ? 1.4 : 1); }, 0) / (cards.length + 0.4);
    var verdict, vcol, vic;
    if (ynS >= 1.1){ verdict = "예 — 해 볼 만해요"; vcol = "#38c172"; vic = "🟢"; }
    else if (ynS >= 0.35){ verdict = "조건부 예 — 준비하면 돼요"; vcol = "#7cc46a"; vic = "🟡"; }
    else if (ynS > -0.5){ verdict = "아직 — 조금 더 지켜봐요"; vcol = "#e9b949"; vic = "🟠"; }
    else { verdict = "아니오 — 지금은 멈춤"; vcol = "#e5533d"; vic = "🔴"; }
    var concl = {score: score, yn: ynS, verdict: verdict, vcol: vcol, vic: vic, pat: pat};
    if (sp.id !== "choice" && (Q.topic === "투자" || sp.id === "inv" || sp.id === "invt")){
      var iv = cards.reduce(function(a, x, i){ return a + (INV_V[x.inv] || 0) * (i === cards.length - 1 ? 1.5 : 1); }, 0) / (cards.length + 0.5);
      concl.inv = iv; concl.invLbl = iv >= 1.4 ? "매수" : iv >= 0.75 ? "분할매수" : iv >= 0.2 ? "보유" : iv > -0.6 ? "관망" : iv > -1.3 ? "익절" : "매도";
    }
    if (Q.kind === "when" || sp.id === "time" || sp.id === "invt") concl.time = timing(cards);
    if (sp.id === "choice" && cards.length >= 2){
      var sa = cards[0].e + cards[0].yn * 1.5, sb = cards[1].e + cards[1].yn * 1.5;
      concl.choice = {a: A, b: B, sa: sa, sb: sb, win: Math.abs(sa - sb) < 1.2 ? null : (sa > sb ? A : B)};
    }
    var worst = cards.slice().sort(function(a, b){ return a.e - b.e; })[0], best = cards.slice().sort(function(a, b){ return b.e - a.e; })[0];
    concl.todo = [cards[Math.min(1, cards.length - 1)].act, cards[cards.length - 1].act].filter(function(v, i, a){ return a.indexOf(v) === i; });
    concl.caution = worst.pos + "의 " + worst.c.nm + (worst.r ? "(역)" : "") + josa(worst.c.nm + (worst.r ? "역" : ""), "이", "가") + " 이번 점의 약한 고리예요. " + worst.c.h[worst.r ? 1 : 0] + ".";
    concl.strong = best.pos + "의 " + best.c.nm + (best.r ? "(역)" : "") + josa(best.c.nm, "이", "가") + " 가장 든든한 힘이에요 — " + best.one;
    var subj = obj ? "「" + obj + "」" : "이 질문";
    concl.head = Q.kind === "choice" && concl.choice ? (concl.choice.win ? "카드는 「" + concl.choice.win + "」 쪽에 더 힘을 실어요" : "두 갈래의 힘이 비슷해요 — 기준을 하나 정하면 답이 보여요")
      : Q.kind === "when" && concl.time ? subj + (obj ? josa(obj, "은", "는") : "은") + " " + concl.time.note.split(" — ")[1] + (concl.time.late ? ", 조금 늦게" : "") + " 움직여요"
      : Q.kind === "how" ? subj + "의 열쇠는 「" + cards[cards.length - 1].c.nm + (cards[cards.length - 1].r ? "(역)" : "") + "」 — " + cards[cards.length - 1].act
      : concl.invLbl ? subj + " — 카드의 판단은 「" + concl.invLbl + "」 쪽이에요"
      : subj + "에 대한 답은 「" + verdict.split(" — ")[0] + "」이에요";
    return {cards: cards, concl: concl};
  }

  /* ───────── 사주와 잇기 ───────── */
  function sajuLink(picked){
    try {
      var L = ls("sj_people") || [], id = ls("sj_sel"), p = L.filter(function(x){ return x.id === id; })[0] || L[0];
      if (!p || !window.SJ) return null;
      var R = SJ.calc({name: p.name, sex: p.sex, cal: p.cal, y: p.y, m: p.m, d: p.d, leap: p.leap, hh: p.hh, mi: p.mi, city: p.city}), t = SJ.todayKST(), D = SJ.dayLuck(R, t.y, t.m, t.d);
      var cnt = {}; picked.forEach(function(x){ var el = SUIT[x.c.s].sj; if (el) cnt[el] = (cnt[el] || 0) + 1; });
      var top = Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a]; })[0], KO = {목: "나무", 화: "불", 토: "흙", 금: "쇠", 수: "물"};
      var line = !top ? "메이저 카드만 나와 오행으로 따지기 어려워요 — 큰 흐름을 따르는 날이에요." :
        top === R.yong ? "카드에 가장 많은 기운이 " + KO[top] + "(" + p.name + " 님에게 가장 필요한 기운)이에요. 사주와 카드가 같은 쪽을 가리켜요 ✨" :
        top === R.hui ? "카드의 " + KO[top] + " 기운이 " + p.name + " 님을 도와주는 기운이에요. 흐름이 내 편이에요." :
        top === R.gi ? "카드의 " + KO[top] + " 기운은 " + p.name + " 님에게 조심할 기운이에요. 결정은 한 번 더 확인하세요." :
        "카드의 " + KO[top] + " 기운은 " + p.name + " 님에게 무난한 기운이에요.";
      return {name: p.name, today: D.score, line: line};
    } catch(x) { return null; }
  }

  /* ───────── 스타일 ───────── */
  function css(){
    if (document.getElementById("tr-css")) return;
    var st = document.createElement("style"); st.id = "tr-css";
    st.textContent = [
      ".tr-hero{position:relative;overflow:hidden;border-radius:22px;padding:18px 16px;margin-bottom:12px;color:#f3e9d2;background:radial-gradient(circle at 20% 0%,#4a3a8a,#1b1538 55%,#0f0c22);border:1px solid #c9a22755}",
      ".tr-hero .tw{position:absolute;border-radius:50%;background:#fff;animation:trtw 2.8s ease-in-out infinite}@keyframes trtw{0%,100%{opacity:.15}50%{opacity:.9}}",
      ".tr-hero h2{margin:0 0 4px;font-size:20px;letter-spacing:-.4px;color:#ffe7a8}.tr-hero p{margin:0;font-size:13px;opacity:.85}",
      ".tr-q{width:100%;box-sizing:border-box;min-height:74px;border-radius:14px;border:1.5px solid #c9a22766;background:rgba(255,255,255,.06);color:#fff;font:inherit;font-size:16px;padding:12px;margin-top:12px;resize:none}",
      ".tr-q{font-size:16px!important;line-height:1.5;caret-color:#ffe7a8;-webkit-user-select:text;user-select:text;outline:none;transition:border-color .2s,box-shadow .2s;overflow-y:auto}.tr-q:focus{border-color:#ffe08a;box-shadow:0 0 0 3px rgba(255,224,138,.18)}",
      ".tr-q::placeholder{color:#cfc4ec99}.tr-ex{display:flex;gap:6px;overflow-x:auto;padding:8px 0 2px;scrollbar-width:none}.tr-ex::-webkit-scrollbar{display:none}",
      ".tr-ex button{flex:none;border:1px solid #c9a22755;background:rgba(255,255,255,.07);color:#f3e9d2;border-radius:16px;padding:6px 11px;font:inherit;font-size:12.5px;cursor:pointer}",
      ".tr-read{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.tr-read span{background:rgba(201,162,39,.18);border:1px solid #c9a22766;color:#ffe7a8;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700}",
      ".tr-tp{display:flex;gap:6px;overflow-x:auto;padding:4px 0 0;scrollbar-width:none}.tr-tp::-webkit-scrollbar{display:none}.tr-tp button{flex:none;border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:14px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}.tr-tp button.on{background:#c9a227;color:#111;border-color:#c9a227;font-weight:800}",
      ".tr-sps{display:grid;gap:7px}.tr-sp{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:13px;padding:10px 12px;font:inherit;cursor:pointer}",
      ".tr-sp b{font-size:14.5px}.tr-sp small{display:block;color:var(--dim);font-size:12px;margin-top:2px}.tr-sp.on{border-color:#c9a227;box-shadow:inset 3px 0 0 #c9a227;background:color-mix(in srgb,#c9a227 12%,var(--panel2))}.tr-sp .rec{float:right;font-size:11px;background:#c9a227;color:#111;border-radius:10px;padding:1px 7px;font-weight:800}",
      ".tr-table{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;padding:4px 2px}.tr-back{aspect-ratio:.6;border-radius:8px;cursor:pointer;position:relative;border:0;padding:0;width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;",
      "background:radial-gradient(circle at 50% 45%,#ffe7a8 0 6%,transparent 7%),repeating-linear-gradient(45deg,#2a2160 0 6px,#211a4f 6px 12px);box-shadow:inset 0 0 0 2px #c9a227,inset 0 0 0 4px #1b1538,0 2px 6px rgba(0,0,0,.35);transition:transform .25s,opacity .3s}",
      ".tr-back:active{transform:scale(.94)}.tr-back.gone{opacity:0;transform:translateY(-30px) scale(.6);pointer-events:none}.tr-table.shuf .tr-back{animation:trsh .55s ease-in-out}@keyframes trsh{30%{transform:translate(var(--dx),var(--dy)) rotate(var(--dr))}}",
      ".tr-slots{display:flex;gap:8px;justify-content:center;margin:12px 0 4px;flex-wrap:wrap}.tr-slot{width:64px;aspect-ratio:.6;border:1.5px dashed #c9a22799;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:10.5px;color:var(--dim);text-align:center;padding:3px;box-sizing:border-box}",
      ".tr-slot.on{border-style:solid;background:linear-gradient(160deg,#2a2160,#1b1538);color:#ffe7a8}",
      ".tr-cards{display:grid;gap:12px}.tr-c{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:start}.tr-face{position:relative;width:96px;aspect-ratio:.58;border-radius:10px;overflow:hidden;background:linear-gradient(160deg,#f5ecd6,#e6d6ad);box-shadow:0 4px 14px rgba(0,0,0,.35);transform-style:preserve-3d}",
      ".tr-face img{width:100%;height:100%;object-fit:cover;display:block}.tr-face.rv img,.tr-face.rv .nf{transform:rotate(180deg)}.tr-face .nf{display:none;position:absolute;inset:0;align-items:center;justify-content:center;flex-direction:column;text-align:center;color:#3a2a10;font-weight:800;font-size:13px;padding:6px}",
      ".tr-face.nofig .nf{display:flex}.tr-face.nofig img{display:none}.tr-face .nf i{font-style:normal;font-size:26px}.tr-rv{position:absolute;right:4px;top:4px;background:#e5533d;color:#fff;font-size:10.5px;font-weight:800;border-radius:6px;padding:1px 5px}",
      ".tr-flip{animation:trflip .8s cubic-bezier(.3,1.3,.5,1) both}@keyframes trflip{from{transform:rotateY(90deg) scale(.8);opacity:0}}",
      ".tr-c .pos{font-size:11.5px;color:#c9a227;font-weight:800;letter-spacing:.5px}.tr-c .nm{font-size:16px;font-weight:800;margin:1px 0 2px}.tr-c .one{font-size:13px;color:var(--sub);margin-bottom:6px}",
      ".tr-c .bd{font-size:14px;line-height:1.62}.tr-c .ln{font-size:12.5px;color:var(--dim);margin:6px 0 0;padding-left:8px;border-left:2px solid #c9a22766}",
      ".tr-c .kw{display:flex;gap:4px;flex-wrap:wrap;margin:4px 0}.tr-c .kw span{font-size:11px;background:var(--panel2);border-radius:8px;padding:1px 7px;color:var(--sub)}",
      ".tr-v{border-radius:20px;padding:16px;margin-bottom:12px;color:#fff;position:relative;overflow:hidden}.tr-v .h{font-size:19px;font-weight:900;line-height:1.4;letter-spacing:-.3px}.tr-v .s{font-size:13px;opacity:.92;margin-top:6px}",
      ".tr-meter{position:relative;height:12px;border-radius:8px;background:linear-gradient(90deg,#e5533d,#f08a4b,#e9b949,#7cc46a,#38c172);margin:16px 4px 4px}.tr-meter i{position:absolute;top:-6px;width:4px;height:24px;border-radius:3px;background:var(--text);box-shadow:0 0 0 2px var(--panel)}",
      ".tr-ml{display:flex;justify-content:space-between;font-size:11px;color:var(--dim);margin:0 2px}",
      ".tr-pat{display:grid;gap:6px}.tr-pat div{display:flex;gap:8px;font-size:13.5px;line-height:1.5}",
      ".tr-act{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 12px}.tr-act button{flex:1;min-width:46%;border:0;border-radius:13px;padding:12px 8px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;background:var(--panel2);color:var(--text);border:1px solid var(--line)}",
      ".tr-act button.k{background:linear-gradient(135deg,#fee500,#f7c600);color:#3a1d1d;border:0}.tr-act button.c{background:linear-gradient(135deg,#7b5cff,#c86bff);color:#fff;border:0}",
      ".tr-go{width:100%;border:0;border-radius:14px;padding:14px;font:inherit;font-weight:900;font-size:16px;cursor:pointer;background:linear-gradient(135deg,#c9a227,#ffe08a);color:#1b1538;box-shadow:0 6px 18px rgba(201,162,39,.35)}",
      ".tr-go:disabled{opacity:.45}.tr-his button{display:flex;width:100%;gap:10px;align-items:center;text-align:left;border:0;background:var(--panel2);border-radius:12px;padding:9px 11px;margin-bottom:6px;color:var(--text);font:inherit;cursor:pointer}",
      ".tr-tip,#trR .lk-tip{display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:1.5;margin:6px 0}",
      ".tr-his small{color:var(--dim)}.tr-day{display:grid;grid-template-columns:70px 1fr;gap:12px;align-items:center}"
    ].join("\n");
    document.head.appendChild(st);
  }
  function tw(n, seed){ var h = ""; for (var i = 0; i < n; i++){ var a = hash(seed + i); h += '<i class="tw" style="left:' + (a % 100) + '%;top:' + ((a >> 7) % 100) + '%;width:' + (1 + (a >> 3) % 3) + 'px;height:' + (1 + (a >> 3) % 3) + 'px;animation-delay:' + ((a >> 5) % 28) / 10 + 's"></i>'; } return h; }
  function face(c, rev, cls){
    var alt = c.alt ? "this.dataset.t?this.parentNode.classList.add('nofig'):(this.dataset.t=1,this.src='" + imgURL(c, c.alt) + "')" : "this.parentNode.classList.add('nofig')";
    return '<div class="tr-face ' + (rev ? "rv " : "") + (cls || "") + '"><img src="' + imgURL(c) + '" alt="' + e(c.nm) + '" loading="lazy" decoding="async" onerror="' + alt + '"><div class="nf"><i>' + SUIT[c.s].ic + '</i>' + e(c.nm) + '<small style="font-weight:500">' + e(c.en) + '</small></div>' + (rev ? '<span class="tr-rv">역</span>' : "") + '</div>';
  }

  /* ───────── 화면 ───────── */
  var ST = {q: "", topic: null, sp: null, picked: [], table: [], res: null, Q: null};
  var EX = [["📈", "삼성전자 지금 사도 될까?"], ["📈", "엔비디아 계속 들고 갈까?"], ["💰", "올해 돈이 모일까?"], ["💘", "그 사람 마음은 어떨까?"], ["💍", "결혼 올해 할 수 있을까?"], ["💼", "이직 언제 하는 게 좋을까?"],
            ["🏪", "가게 확장해도 될까?"], ["📚", "이번 시험 붙을 수 있을까?"], ["🩺", "요즘 컨디션 어떻게 챙길까?"], ["🤝", "친구랑 화해할 수 있을까?"], ["🏠", "올해 이사 가도 괜찮을까?"], ["⚖️", "국내주식 아니면 미국주식?"]];
  function root(){ return document.getElementById("trR"); }
  function render(){
    var R = root(); if (!R) return; css();
    if (!DECK){ R.innerHTML = '<div class="loading">카드를 섞는 중…</div>'; load().then(render, function(){ R.innerHTML = '<div class="card">카드 자료를 받지 못했어요. 인터넷 연결을 확인하고 다시 열어 주세요.</div>'; }); return; }
    if (ST.res) return renderResult();
    // 10/29 사용자 「질문칸에 글씨 입력이 잘 안 돼 · 어색해」 — 예전엔 글자를 칠 때마다 화면 전체를 새로 그려 입력칸이 바뀌면서 한글 조합이 끊기고 커서가 튐
    //   → 입력칸(위 카드)은 한 번만 그리고, 아래(주제·펼치기·카드)만 따로 다시 그림. 한글 조합 중에는 아무것도 안 건드림
    var h = '<div class="tr-hero">' + tw(16, "h") + '<h2>🃏 타로 — 물어보세요</h2><p>질문을 적으면 주제를 읽고, 그 질문에 맞춰 카드를 풀어 드려요.</p>' +
      '<textarea class="tr-q" id="trQ" maxlength="120" rows="2" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="예) 삼성전자 지금 사도 될까?&#10;예) 그 사람이랑 다시 잘 될까?">' + e(ST.q) + '</textarea>' +
      '<div class="tr-ex">' + EX.map(function(x){ return '<button type="button" data-ex="' + e(x[1]) + '">' + x[0] + ' ' + e(x[1]) + '</button>'; }).join("") + '</div>' +
      '<div class="tr-read" id="trRead"></div></div><div id="trBelow"></div>' +
      '<p class="sj-note">🃏 질문 읽기 · 해석은 모두 휴대폰 안에서 해요(인터넷 · API 비용 없음). 카드 그림은 1909년 라이더-웨이트 타로(저작권 만료)예요. 재미와 자기 성찰용이고, 투자 · 건강 · 법률 결정의 근거가 아니에요.</p>';
    R.innerHTML = h; bindTop(); renderBelow();
  }
  function renderBelow(){
    var R = root(), B = R && R.querySelector("#trBelow"); if (!B) return;
    var Q = readQ(ST.q); if (ST.topic) Q.topic = ST.topic; ST.Q = Q;
    var spId = ST.sp || suggest(Q), sp = spOf(spId), rec = suggest(Q);
    var h = '<div class="card"><h3>질문 주제 <small style="font-weight:500;color:var(--dim)">자동으로 골랐어요 · 눌러서 바꾸기</small></h3><div class="tr-tp" id="trTp">' +
      ["일반"].concat(TOPICS.map(function(t){ return t.k; })).map(function(k){ return '<button type="button" data-t="' + k + '" class="' + (k === Q.topic ? "on" : "") + '">' + TOPIC_IC[k] + ' ' + (k === "결혼" ? "결혼·가족" : k === "직장" ? "직장·이직" : k === "시험" ? "시험·공부" : k === "이사" ? "이사·집" : k === "관계" ? "인간관계" : k) + '</button>'; }).join("") + '</div></div>';
    h += '<div class="card"><h3>펼치는 방법 <button type="button" class="sj-btn g" id="trSpT" style="padding:6px 10px;font-size:12.5px">' + (ST.spOpen ? "접기 ▴" : "다른 방법 " + (SPREADS.length - 1) + "가지 ▾") + '</button></h3><div class="tr-sps">' + SPREADS.filter(function(s){ return ST.spOpen || s.id === spId; }).map(function(s){ return '<button type="button" class="tr-sp' + (s.id === spId ? " on" : "") + '" data-sp="' + s.id + '">' + (s.id === rec ? '<span class="rec">이 질문에 추천</span>' : "") + '<b>' + s.nm + '</b> <small style="display:inline;color:#c9a227">' + s.n + '장</small><small>' + s.note + '</small></button>'; }).join("") + '</div></div>';
    if (!ST.table.length) ST.table = shuffle(DECK.slice()).slice(0, 24).map(function(c){ return {c: c, r: Math.random() < 0.38}; });
    h += '<div class="card"><h3>마음속으로 질문을 떠올리며 ' + sp.n + '장 고르세요 <button type="button" class="sj-btn g" id="trShuf" style="padding:6px 10px;font-size:12.5px">🔀 섞기</button></h3>' +
      '<div class="tr-slots">' + sp.pos.map(function(p, i){ var x = ST.picked[i]; return '<div class="tr-slot' + (x ? " on" : "") + '">' + (x ? "✓<br>" : "") + e(p.replace("A를", (Q.ch ? Q.ch[0] : "A") + "를").replace("B를", (Q.ch ? Q.ch[1] : "B") + "를")) + '</div>'; }).join("") + '</div>' +
      '<div class="tr-table" id="trTable">' + ST.table.map(function(x, i){ var on = ST.picked.indexOf(x) >= 0; return '<button type="button" class="tr-back' + (on ? " gone" : "") + '" data-i="' + i + '" style="--dx:' + ((hash("x" + i) % 40) - 20) + 'px;--dy:' + ((hash("y" + i) % 24) - 12) + 'px;--dr:' + ((hash("r" + i) % 30) - 15) + 'deg" aria-label="카드"></button>'; }).join("") + '</div>' +
      '<button type="button" class="tr-go" id="trGo" style="margin-top:14px"' + (ST.picked.length < sp.n ? " disabled" : "") + '>' + (ST.picked.length < sp.n ? (sp.n - ST.picked.length) + "장 더 골라 주세요" : "🔮 카드 펼치기") + '</button></div>';
    h += dailyCard() + history();
    B.innerHTML = h; bindBelow(); readChips();
  }
  function readChips(){
    var Q = readQ(ST.q); if (ST.topic) Q.topic = ST.topic; var b = document.getElementById("trRead"); if (!b) return;
    b.innerHTML = ST.q ? '<span>' + TOPIC_IC[Q.topic] + ' ' + Q.topic + ' 질문</span><span>' + KIND_KO[Q.kind] + '</span>' + (Q.ch ? '<span>⚖️ ' + e(Q.ch[0]) + ' vs ' + e(Q.ch[1]) + '</span>' : Q.obj ? '<span>🎯 ' + e(Q.obj) + '</span>' : "") : '<span>✍️ 질문을 적으면 여기서 읽어 드려요 (안 적어도 돼요)</span>';
  }
  function bindTop(){
    var R = root(), q = R.querySelector("#trQ"), tmr = null, comp = false;
    var settle = function(){                               // 입력이 멈추면: 읽은 결과 칩 + (주제·추천이 바뀌었으면) 아래만 다시
      if (comp) return;
      var before = ST.Q ? (ST.Q.topic + "|" + suggest(ST.Q)) : "", nq = readQ(ST.q); if (ST.topic) nq.topic = ST.topic;
      readChips();
      if (nq.topic + "|" + suggest(nq) !== before){ if (!ST.spLock && ST.picked.length === 0) ST.sp = null; renderBelow(); }
    };
    q.addEventListener("compositionstart", function(){ comp = true; });
    q.addEventListener("compositionend", function(){ comp = false; ST.q = q.value; clearTimeout(tmr); tmr = setTimeout(settle, 350); });
    q.addEventListener("input", function(){ ST.q = q.value; clearTimeout(tmr); tmr = setTimeout(settle, comp ? 900 : 350); });
    q.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing){ ev.preventDefault(); q.blur(); settle(); } });
    q.addEventListener("blur", function(){ comp = false; ST.q = q.value; settle(); });
    var grow = function(){ q.style.height = "auto"; q.style.height = Math.min(160, Math.max(74, q.scrollHeight + 2)) + "px"; }; q.addEventListener("input", grow); grow();
    [].forEach.call(R.querySelectorAll("[data-ex]"), function(b){ b.onclick = function(){ ST.q = b.dataset.ex; q.value = ST.q; grow(); ST.topic = null; ST.sp = null; ST.spLock = false; ST.picked = []; renderBelow(); }; });
  }
  function bindBelow(){
    var R = root();
    [].forEach.call(R.querySelectorAll("[data-t]"), function(b){ b.onclick = function(){ ST.topic = b.dataset.t; renderBelow(); }; });
    [].forEach.call(R.querySelectorAll("[data-sp]"), function(b){ b.onclick = function(){ ST.sp = b.dataset.sp; ST.spLock = true; ST.spOpen = false; ST.picked = ST.picked.slice(0, spOf(ST.sp).n); renderBelow(); }; });
    var spt = R.querySelector("#trSpT"); if (spt) spt.onclick = function(){ ST.spOpen = !ST.spOpen; renderBelow(); };
    var sh = R.querySelector("#trShuf"); if (sh) sh.onclick = function(){ ST.table = []; ST.picked = []; renderBelow(); var t = root().querySelector("#trTable"); if (t){ t.classList.add("shuf"); try { navigator.vibrate && navigator.vibrate([10, 40, 10]); } catch(x) {} } };
    [].forEach.call(R.querySelectorAll(".tr-back"), function(b){ b.onclick = function(){
      var sp = spOf(ST.sp || suggest(ST.Q)), x = ST.table[+b.dataset.i];
      if (ST.picked.indexOf(x) >= 0 || ST.picked.length >= sp.n) return;
      ST.picked.push(x); ST.sp = sp.id; b.classList.add("gone"); try { navigator.vibrate && navigator.vibrate(8); } catch(z) {}
      var slots = R.querySelectorAll(".tr-slot"), s = slots[ST.picked.length - 1]; if (s){ s.classList.add("on"); s.innerHTML = "✓<br>" + s.textContent; }
      var go = R.querySelector("#trGo"); go.disabled = ST.picked.length < sp.n; go.textContent = ST.picked.length < sp.n ? (sp.n - ST.picked.length) + "장 더 골라 주세요" : "🔮 카드 펼치기";
      if (ST.picked.length === sp.n) try { go.scrollIntoView({block: "center", behavior: "smooth"}); } catch(z) {}
    }; });
    var go = R.querySelector("#trGo"); if (go) go.onclick = function(){ var sp = spOf(ST.sp || suggest(ST.Q)); if (ST.picked.length < sp.n) return; ST.sp = sp.id; doRead(); };
    var dc = R.querySelector("#trDay"); if (dc) dc.onclick = function(){ var c = dayPick(); ST.q = ""; ST.topic = "일반"; ST.sp = "one"; ST.picked = [c]; doRead(); };
    [].forEach.call(R.querySelectorAll("[data-his]"), function(b){ b.onclick = function(){ var H = ls("tr_his") || [], it = H[+b.dataset.his]; if (!it) return;
      ST.q = it.q; ST.topic = it.t; ST.sp = it.sp; ST.picked = it.cards.map(function(x){ return {c: DECK[x[0]], r: !!x[1]}; }); doRead(true); }; });
  }
  function dayPick(){
    var t = window.SJ ? SJ.todayKST() : {y: 0, m: 0, d: 0}, who = (ls("sj_sel") || "me"), a = hash("day" + who + t.y + t.m + t.d);
    return {c: DECK[a % 78], r: (a >> 8) % 100 < 30};
  }
  function dailyCard(){
    var x = dayPick(), seen = ls("tr_day") === dayKey();
    return '<div class="card"><h3>☀️ 오늘의 한 장</h3><div class="tr-day"><div style="width:70px">' + (seen ? face(x.c, x.r) : '<div class="tr-back" style="pointer-events:none"></div>') + '</div><div>' +
      (seen ? '<b>' + e(x.c.nm) + (x.r ? " (역)" : "") + '</b><div style="font-size:13.5px;color:var(--sub);margin-top:3px">' + e(oneOf(x.c, x.r)) + '</div>' : '<b>하루에 한 장, 오늘의 메시지</b><div style="font-size:13px;color:var(--sub);margin-top:3px">하루 동안 같은 카드가 나와요.</div>') +
      '<button class="sj-btn g" id="trDay" style="margin-top:8px;padding:8px 12px;font-size:13px">' + (seen ? "자세히 보기" : "🃏 오늘의 카드 뒤집기") + '</button></div></div></div>';
  }
  function dayKey(){ var t = window.SJ ? SJ.todayKST() : {y: 0, m: 0, d: 0}; return (ls("sj_sel") || "me") + t.y + t.m + t.d; }
  function history(){
    var H = ls("tr_his") || []; if (!H.length) return "";
    return '<div class="card"><h3>🗂 최근 본 점 <small style="font-weight:500;color:var(--dim)">이 휴대폰에만 저장</small></h3><div class="tr-his">' + H.slice(0, 8).map(function(it, i){
      return '<button data-his="' + i + '"><span style="font-size:20px">' + (TOPIC_IC[it.t] || "🔮") + '</span><span style="flex:1;min-width:0"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(it.q || "질문 없이 뽑은 점") + '</b><small>' + e(it.d) + ' · ' + e(it.v) + '</small></span></button>'; }).join("") + '</div></div>';
  }
  function doRead(fromHis){
    var Q = readQ(ST.q); if (ST.topic) Q.topic = ST.topic;
    var sp = spOf(ST.sp); ST.Q = Q;
    ST.res = readAll(Q, sp, ST.picked); ST.res.sp = sp; ST.res.Q = Q; ST.res.sj = sajuLink(ST.picked);
    if (sp.id === "one" && !ST.q) ls("tr_day", dayKey());
    if (!fromHis){
      var H = ls("tr_his") || [], t = window.SJ ? SJ.todayKST() : null;
      H.unshift({q: ST.q, t: Q.topic, sp: sp.id, cards: ST.picked.map(function(x){ return [x.c.id, x.r ? 1 : 0]; }), v: ST.res.concl.invLbl ? "판단 " + ST.res.concl.invLbl : ST.res.concl.verdict.split(" — ")[0], d: t ? t.m + "/" + t.d : ""});
      ls("tr_his", H.slice(0, 20));
    }
    render(); window.scrollTo({top: 0, behavior: "smooth"});
  }
  function renderResult(){
    var R = root(), res = ST.res, Q = res.Q, sp = res.sp, C = res.concl;
    var h = '<div class="tr-hero">' + tw(14, "r") + '<div style="font-size:12px;color:#c9a227;font-weight:800;letter-spacing:1px">' + TOPIC_IC[Q.topic] + ' ' + Q.topic + ' · ' + e(sp.nm.replace(/💹 /, "").replace("A를", Q.ch ? Q.ch[0] + josa(Q.ch[0], "을", "를") : "A를").replace("B를", Q.ch ? Q.ch[1] + josa(Q.ch[1], "을", "를") : "B를")) + '</div>' +
      '<h2 style="margin-top:6px">' + (Q.q ? "「" + e(Q.q) + "」" : "질문 없이 뽑은 점") + '</h2><p>' + KIND_KO[Q.kind] + (Q.obj ? " · 대상 " + e(Q.obj) : "") + '</p></div>';
    // 결론 카드
    var col = C.invLbl ? ({매수: "#38c172", 분할매수: "#7cc46a", 보유: "#e9b949", 관망: "#e9b949", 익절: "#f08a4b", 매도: "#e5533d"})[C.invLbl] : C.vcol;
    var pos = C.invLbl ? Math.max(0, Math.min(100, (C.inv + 2) / 4 * 100)) : Math.max(0, Math.min(100, (C.yn + 2) / 4 * 100));
    h += '<div class="tr-v" style="background:linear-gradient(140deg,' + col + ',' + col + 'aa 60%,#1b1538)">' + tw(10, "v") + '<div style="font-size:12px;opacity:.85;font-weight:800">🔮 카드의 결론</div><div class="h">' + e(C.head) + '</div>' +
      '<div class="s">' + (C.invLbl ? "📊 카드 판단: <b>" + C.invLbl + "</b> · 세 장 기운 " + C.score + "점" : C.vic + " " + e(C.verdict) + " · 카드 기운 " + C.score + "점") + '</div></div>';
    h += '<div class="card"><h3>' + (C.choice ? "두 갈래 비교" : C.invLbl ? "매도 ↔ 매수 눈금" : "아니오 ↔ 예 눈금") + '</h3>' + (C.choice ? "" : '<div class="tr-meter"><i style="left:calc(' + pos.toFixed(0) + '% - 2px)"></i></div><div class="tr-ml">' +
      (C.invLbl ? "<span>매도</span><span>익절</span><span>관망</span><span>보유</span><span>분할매수</span><span>매수</span>" : "<span>아니오</span><span>아직</span><span>조건부 예</span><span>예</span>") + '</div>') +
      (C.choice ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">' + [[C.choice.a, C.choice.sa], [C.choice.b, C.choice.sb]].map(function(x){ var w = C.choice.win === x[0];
        return '<div style="border-radius:12px;padding:10px;text-align:center;background:' + (w ? "#38c17233" : "var(--panel2)") + ';border:1.5px solid ' + (w ? "#38c172" : "var(--line)") + '"><b style="font-size:15px">' + e(x[0]) + '</b><div style="font-size:22px;font-weight:900;margin-top:2px">' + Math.round(Math.max(5, Math.min(99, x[1] * 7.5 + 20))) + '</div><small style="color:var(--dim)">' + (w ? "👑 더 힘 있음" : "카드 점수") + '</small></div>'; }).join("") + '</div>' : "") +
      (C.time ? '<div style="margin-top:14px;padding:12px;border-radius:12px;background:var(--panel2)"><div style="font-size:12px;color:var(--dim)">⏳ 카드로 본 시기</div><div style="font-size:18px;font-weight:900;margin-top:2px">약 ' + C.time.val + ' 안팎' + (C.time.late ? " (조금 늦게)" : "") + '</div><div style="font-size:13px;color:var(--sub);margin-top:2px">' + SUIT[C.time.dom].ic + ' ' + SUIT[C.time.dom].ko + ' 기운이 많아 ' + C.time.note + '. 카드 숫자의 평균으로 셌어요.</div></div>' : "") + '</div>';
    // 카드별
    h += '<div class="card"><h3>카드 한 장씩</h3><div class="tr-cards">' + res.cards.map(function(x, i){
      return '<div class="tr-c">' + face(x.c, x.r, "tr-flip").replace('class="tr-face', 'style="animation-delay:' + (i * 0.25) + 's" class="tr-face') + '<div><div class="pos">' + (i + 1) + ' · ' + e(x.pos) + '</div><div class="nm">' + e(x.c.nm) + (x.r ? ' <span style="color:#e5533d;font-size:13px">역방향</span>' : "") + '</div>' +
        '<div class="kw">' + x.c.k.map(function(k){ return '<span>' + e(k) + '</span>'; }).join("") + '<span style="background:' + SUIT[x.c.s].col + '33;color:' + SUIT[x.c.s].col + '">' + SUIT[x.c.s].ic + ' ' + SUIT[x.c.s].ko + '</span></div>' +
        '<div class="one">“' + e(x.one) + '”</div><div class="bd">' + e(x.body) + '</div>' + (x.link ? '<div class="ln">↳ ' + e(x.link) + '</div>' : "") + '</div></div>'; }).join("") + '</div></div>';
    // 패턴 · 할 일
    h += '<div class="card"><h3>카드가 함께 말하는 것</h3><div class="tr-pat">' + C.pat.map(function(p){ return '<div><span>' + p[0] + '</span><span>' + e(p[1]) + '</span></div>'; }).join("") +
      '<div><span>💪</span><span>' + e(C.strong) + '</span></div><div><span>⚠️</span><span>' + e(C.caution) + '</span></div></div></div>';
    h += '<div class="card"><h3>그래서, 이렇게 해 보세요</h3>' + C.todo.map(function(t){ return '<div class="lk-tip"><span>✅</span><span>' + e(t) + '</span></div>'; }).join("") +
      (res.sj ? '<div style="margin-top:10px;padding:11px;border-radius:12px;background:var(--panel2);font-size:13.5px;line-height:1.55"><b>🔮 사주와 함께 보면</b> (' + e(res.sj.name) + ' 님 · 오늘 운세 ' + res.sj.today + '점)<br>' + e(res.sj.line) + '</div>' : "") +
      (Q.topic === "투자" ? '<p class="sj-note" style="margin-top:10px">📈 투자 질문은 카드보다 숫자가 먼저예요. 실제 판단은 🌐 시황 · 종목리포트를 꼭 함께 보세요.</p>' : Q.topic === "건강" ? '<p class="sj-note" style="margin-top:10px">🩺 몸이 걱정되면 카드보다 병원 상담이 먼저예요.</p>' : "") + '</div>';
    h += '<div class="tr-act"><button class="k" id="trShare">💬 카톡으로 보내기</button><button class="c" id="trClaude">✨ Claude 심화 해석 문구</button><button id="trCopy">📋 글로 복사</button><button id="trAgain">🔄 새로 묻기</button></div>' +
      (Q.topic === "투자" ? '<div class="sj-btns" style="margin-bottom:12px"><button class="sj-btn g" id="trMkt">🌐 진짜 시장은 시황에서 보기</button></div>' : "") +
      '<p class="sj-note">✨ 「Claude 심화 해석 문구」를 눌러 Claude 채팅에 붙여 넣으면, 질문 문장 그대로 더 깊은 맞춤 해석을 받을 수 있어요(쓰고 있는 Claude 안에서 · API 비용 없음). 타로는 재미와 자기 성찰용이에요.</p>';
    R.innerHTML = h;
    var txt = plain(), b = function(id, f){ var x = R.querySelector(id); if (x) x.onclick = f; };
    b("#trShare", function(){ if (navigator.share) navigator.share({title: "타로", text: txt}).catch(function(){}); else copy(txt, this); });
    b("#trCopy", function(){ copy(txt, this); });
    b("#trClaude", function(){ copy(prompt(), this); });
    b("#trAgain", function(){ ST.res = null; ST.picked = []; ST.table = []; ST.q = ""; ST.topic = null; ST.sp = null; ST.spLock = false; render(); window.scrollTo({top: 0, behavior: "smooth"}); });
    b("#trMkt", function(){ if (window.go) go("market"); });
  }
  function plain(){
    var res = ST.res, Q = res.Q, C = res.concl;
    return "🃏 타로 — " + (Q.q || "질문 없이 뽑은 점") + "\n" + TOPIC_IC[Q.topic] + " " + Q.topic + " · " + res.sp.nm.replace(/💹 /, "") + "\n\n🔮 " + C.head + "\n" + (C.invLbl ? "카드 판단: " + C.invLbl : C.verdict) + (C.time ? "\n⏳ 시기: 약 " + C.time.val + " 안팎" : "") + "\n\n" +
      res.cards.map(function(x, i){ return (i + 1) + ". " + x.pos + " — " + x.c.nm + (x.r ? " (역)" : "") + "\n   " + x.body; }).join("\n") +
      "\n\n✅ " + C.todo.join("\n✅ ") + "\n⚠️ " + C.caution + "\n\n(재미로 보는 타로 · CH Investing)";
  }
  function prompt(){
    var res = ST.res, Q = res.Q;
    return "타로 리딩을 해석해 줘. 내 질문 문장에 딱 맞춰서, 카드 자리(포지션) 의미와 카드끼리의 흐름까지 엮어 깊게 풀어 줘. 쉬운 말로, 마지막엔 결론 한 줄 · 해야 할 일 3가지 · 조심할 것 1가지.\n\n" +
      "[질문] " + (Q.q || "(질문 없음 — 오늘의 흐름)") + "\n[주제] " + Q.topic + " / [묻는 방식] " + KIND_KO[Q.kind] + "\n[펼치기] " + res.sp.nm.replace(/💹 /, "") + "\n" +
      res.cards.map(function(x, i){ return "[" + (i + 1) + ". " + x.pos + "] " + x.c.nm + " (" + x.c.en + ")" + (x.r ? " — 역방향" : " — 정방향"); }).join("\n") +
      (res.sj ? "\n[참고] 내 사주 용신 기운과의 관계: " + res.sj.line : "") + (Q.topic === "투자" ? "\n※ 투자 질문이니 재미 해석과 함께, 실제 확인해야 할 체크리스트도 같이 알려 줘." : "");
  }
  function copy(t, btn){
    var ok = function(){ if (btn){ var o = btn.innerHTML; btn.innerHTML = "✅ 복사됐어요"; setTimeout(function(){ btn.innerHTML = o; }, 2200); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb); else fb();
    function fb(){ var a = document.createElement("textarea"); a.value = t; a.style.cssText = "position:fixed;left:-9999px"; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); ok(); } catch(x) {} a.remove(); }
  }
  window.tarotView = function(){ return '<div id="trR" class="no-clp tidy-x ez-no" data-noemo="1"><div class="loading">카드를 섞는 중…</div></div>'; };
  window.tarotInit = function(){ render(); };
  window.TAROT_TEST = {readQ: readQ, readAll: readAll, spOf: spOf, suggest: suggest, load: load, deck: function(){ return DECK; }};
})();
