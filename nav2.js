/* CH Investing — 화면 정리 (10/11 사용자: "보기 좋게 심플하게 · 상위 하위 · 펼치기 접기 · 중복은 빼도 됨 · 돋보기가 있는데 종목 카테고리가 있는 것도")
   ① 아래 탭 바 5개(오늘·시장·포트·신호·피드) → 위에는 그 묶음의 작은 탭만 (14칸 격자 대신)
   ② 📄 종목 탭은 🔍 검색으로, 🔔 알림·💬 의견함은 ⚙️ 안으로 (주소 #onepager·#alarm·#idea 는 그대로 열림)
   ③ 탭 머리(큰 소개 카드)는 한 줄로 — 소개 글은 머리를 누르면
   ④ 뒤로 버튼은 돌아갈 곳이 있을 때만 */
(function(){
  var GROUPS = [
    {k: "home", ic: "🏠", t: "오늘", tabs: ["home"]},
    {k: "mkt",  ic: "🌐", t: "시장", tabs: ["market", "sector", "prob"]},
    {k: "inv",  ic: "💼", t: "포트", tabs: ["port", "score"]},
    {k: "sig",  ic: "🎯", t: "신호", tabs: ["whale", "cup", "gap", "screen", "sigmore"]},   // 10/12: 🤫 매집·⚡ 단타는 메뉴에서 뺌 — 알림(앱·텔레그램)으로만. 알림을 누르면 그 화면은 그대로 열림
    {k: "prod", ic: "🛍️", t: "상품", tabs: ["bond", "fund", "els"]},   // 10/16 사용자: 상품 카테고리 — 채권·펀드·ELS
    {k: "prop", ic: "📝", t: "제안서", tabs: ["prop"]},                 // 10/28 사용자: 제안서 카테고리 — 기본폼 9종 → 한 장·PDF·PPT
    {k: "luck", ic: "🔮", t: "운세", tabs: ["luck", "saju", "tarot", "lotto"]},   // 10/28 사용자: 사주 리포트 · 오늘의 운세
    {k: "feed", ic: "📰", t: "피드", tabs: ["feed"]}
  ];
  var LAB = {market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", port: "💼 포트", score: "📊 성적표", whale: "🐋 고래", cup: "☕ 컵", gap: "📈 갭", accum: "🤫 매집", danta: "⚡ 단타", screen: "🔎 거르기", sigmore: "🗂 더 보기", bond: "🏦 채권", fund: "📦 펀드", els: "🎯 ELS", luck: "🔮 오늘의 운세", saju: "📜 사주 리포트", tarot: "🃏 타로", lotto: "🎱 로또", prop: "📝 제안서"};
  function grpOf(k){ for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].tabs.indexOf(k) >= 0) return GROUPS[i]; return null; }
  function last(g){ var m = (window.store && store.gl) || {}; return m[g.k] && g.tabs.indexOf(m[g.k]) >= 0 ? m[g.k] : g.tabs[0]; }

  function bar(){
    var b = document.getElementById("bnav");
    if (!b){
      b = document.createElement("nav"); b.id = "bnav";
      b.innerHTML = GROUPS.map(function(g){ return '<button data-g="' + g.k + '"><span class="i">' + g.ic + '</span><span>' + g.t + '</span></button>'; }).join("");
      document.body.appendChild(b);
      [].forEach.call(b.children, function(x){ x.onclick = function(){
        var g = GROUPS.filter(function(y){ return y.k === x.dataset.g; })[0], gc = grpOf(cur);
        if (gc === g){ window.scrollTo({top: 0, behavior: "smooth"}); return; }   // 지금 묶음을 또 누르면 맨 위로
        go(last(g)); }; });
    }
    var gc = grpOf(cur);
    [].forEach.call(b.children, function(x){ x.classList.toggle("on", !!gc && x.dataset.g === gc.k); });
  }
  window.drawTabs = function(){
    var nav = document.getElementById("tabs"); if (!nav) return;
    var g = grpOf(cur);
    if (cur && cur !== "onepager"){ store.lastTab = cur; }
    try { updBack(); } catch(x) {}
    if (g){ store.gl = store.gl || {}; store.gl[g.k] = cur; try { save(); } catch(x) {} }
    if (g && g.tabs.length > 1){
      nav.className = "tabs sub";
      nav.innerHTML = g.tabs.map(function(k){ var c = CATS.filter(function(x){ return x.key === k; })[0] || {};
        return '<button class="tab' + (k === cur ? " on" : "") + '" style="--c:' + c.color + '" data-k="' + k + '">' + (LAB[k] || c.name) + '</button>'; }).join("");
      [].forEach.call(nav.children, function(b){ b.onclick = function(){ if (b.dataset.k !== cur) go(b.dataset.k); }; });
      var on = nav.querySelector(".on"); if (on && on.scrollIntoView) try { on.scrollIntoView({inline: "center", block: "nearest"}); } catch(x) {}
      if (window.subBadges) try { subBadges(nav); } catch(x) {}   // 📱 A12-5 신호 탭 숫자 배지
    } else { nav.className = "tabs sub none"; nav.innerHTML = ""; }
    bar();
    setTimeout(function(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }, 0);   // 접기 칩이 헤더 바로 아래 붙게
  };

  // ⑦ 뒤로: 홈이 아니면 늘 보이게 (알림 링크로 종목 화면을 바로 열었을 때도) — 더 돌아갈 기록이 없으면 보던 탭 → 오늘로
  window.updBack = function(){ var b = document.getElementById("backbtn"); if (!b) return; b.classList.add("on");
    b.classList.toggle("root", !(navD() > 0 || !!document.getElementById("sheet") || (window.cur && cur !== "home"))); };
  var _goBack = window.goBack;
  window.goBack = function(){
    if (document.getElementById("sheet") || navD() > 0) return _goBack();
    var t = (cur === "onepager" && store.lastTab && store.lastTab !== "onepager") ? store.lastTab : "home";
    if (cur !== t) go(t); else window.scrollTo({top: 0, behavior: "smooth"});
  };
  // ③ 탭 머리: 누르면 소개 글
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest("#main > .hero"); if (!h || ev.target.closest("button,a")) return;
    h.classList.toggle("show");
  });

  // ④ 긴 카드 접기는 simple.js(clampLong)가 함 — 알림·링크로 그 안의 카드에 갈 땐 펼쳐서
  window.unclamp = function(el){ var c = el && el.closest && el.closest(".xs-clamp"); if (c){ c.classList.remove("xs-clamp"); var b = c.querySelector(":scope > .xs-cl"); if (b) b.textContent = "접기 ▴"; } };


  // ⑤ 차트 글씨가 겹치면 비켜 쓰기 (섹터 시계·지도·되감기 — 10/11 사용자: "겹치면 비켜써")
  function declutter(svg){
    var ts = [].slice.call(svg.querySelectorAll("text.rotl"));
    var fw = svg.closest(".famw"), ff = fw ? fw.dataset.ff || "" : "";
    if (!svg.getBoundingClientRect().width) return;                          // 안 보이는 카드 — 보일 때 다시
    ts = ts.filter(function(t){ var g = t.closest("[data-fam]"); return !g || (ff ? g.dataset.fam === ff : !!g.closest("[data-top]") || !fw); });
    var sig = ff + "#" + ts.map(function(t){ return (t.dataset.x0 || t.getAttribute("x")) + "," + (t.dataset.y0 || t.getAttribute("y")); }).join("|");
    if (!ts.length || svg.dataset.dc === sig) return;
    var boxes = [];
    try {        // 점(동그라미)도 피해서
      [].forEach.call(svg.querySelectorAll("circle"), function(c){ var r = +c.getAttribute("r"), g = c.closest("[data-fam]"); if (ff && g && g.dataset.fam !== ff) return; if (r >= 3 && r <= 9){ var cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy"); boxes.push({x: cx - r, y: cy - r, w: 2 * r, h: 2 * r}); } });
    } catch(x) {}
    try {        // 구역 이름(🔥 계속 강함 등)도 피해서
      [].forEach.call(svg.querySelectorAll("text.rotq"), function(q){ var b = q.getBBox(); if (b.width) boxes.push({x: b.x, y: b.y, w: b.width, h: b.height}); });
    } catch(x) {}
    [].forEach.call(svg.querySelectorAll(".dc-ln"), function(l){ l.remove(); });
    ts.sort(function(a, b){ return (+a.getAttribute("y")) - (+b.getAttribute("y")); });
    var over = function(b){ return boxes.some(function(o){ return b.x < o.x + o.w + 1 && o.x < b.x + b.w + 1 && b.y < o.y + o.h && o.y < b.y + b.h; }); };
    var W = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 9999;
    for (var i = 0; i < ts.length; i++){
      var t = ts[i];
      if (t.dataset.x0){ t.setAttribute("x", t.dataset.x0); t.setAttribute("y", t.dataset.y0); t.removeAttribute("text-anchor"); }
      var bb; try { bb = t.getBBox(); } catch(x) { return; }
      if (!bb.width) return;                                  // 아직 안 보이는 카드 — 보일 때 다시
      var x0 = +t.getAttribute("x"), y0 = +t.getAttribute("y"); t.dataset.x0 = x0; t.dataset.y0 = y0;
      var dy = bb.y - y0, dx = bb.x - x0, L = -(bb.width + 14), put = null;
      var tries = [[0, 0], [L, 0], [0, -11], [0, 11], [L, -11], [L, 11], [0, -22], [0, 22], [L, -22], [L, 22], [0, -33], [0, 33], [L, -33], [L, 33], [0, -44], [0, 44]];
      for (var j = 0; j < tries.length; j++){
        var b = {x: x0 + dx + tries[j][0], y: y0 + dy + tries[j][1], w: bb.width, h: bb.height};
        if (b.x < 0 || b.x + b.w > W) continue;
        if (!over(b)){ put = tries[j]; boxes.push(b); break; }
      }
      if (!put){ boxes.push({x: bb.x, y: bb.y, w: bb.width, h: bb.height}); continue; }
      if (put[0] || put[1]){
        t.setAttribute("x", x0 + put[0]); t.setAttribute("y", y0 + put[1]);
        if (Math.abs(put[1]) > 0){
          var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
          ln.setAttribute("class", "dc-ln"); ln.setAttribute("x1", x0 - 6); ln.setAttribute("y1", y0 - 4);
          ln.setAttribute("x2", put[0] ? x0 + put[0] + bb.width + 1 : x0 - 1); ln.setAttribute("y2", y0 + put[1] - 4);
          t.parentNode.insertBefore(ln, t);
        }
      }
    }
    svg.dataset.dc = sig;
  }
  // ⑧ 모든 카드 제목: 누르면 설명 칸(닫기 ✕) + 관련 화면 바로가기 (10/11 사용자: "모든 타이틀들이 설명이나 연동 화면으로 가게 · 되돌아오거나 닫기")
  //    국면 신호판 점수 설명(plus6)과 같은 모양. 카드 안의 「읽는 법」 글(p.note)은 이 칸 안으로 옮겨 카드를 가볍게.
  var DESC = [
    // 🎲 시장확률 — 🌡️ 시장 심리 온도 (10/28 · 옛 이름 공포·탐욕)
    [/시장 심리 온도/, "시장 사람들이 지금 얼마나 들떠 있는지를 0~100으로 나타내요. 지수 추세·변동성(VIX)·회사채·안전자산·위험선호 같은 7가지를 지난 1년과 비교한 순위예요. 그래서 「무섭다」가 아니라 「1년 중 몇 번째로 들떠 있나」로 읽어야 해요. 많이 오른 해엔 잠깐 쉬어도 낮게 나와요. 2007년 이후 기록으론 가장 움츠린 구간 뒤가 오히려 조금 더 잘 올랐어요. CNN 공포·탐욕 지수는 원래 이름 그대로 아래에 같이 보여 줘요."],
    // 🏠 오늘 — ☀️ 오늘 한 장 (10/28 · 옛 이름 PB 한 장)
    [/오늘 한 장/, "지금 시장을 고객에게 설명할 때 쓸 한 장이에요. 맨 위 줄은 나라별 흐름(횡보·상승·하락)과 오늘 가장 중요한 이유, 「고객에게 할 말」은 그대로 읽어 줘도 되는 3~4줄이에요. 장중엔 매시간 새로 써요(옆 시각이 마지막으로 쓴 때). 「📨 보내기」를 누르면 이 내용으로 「지금 시장 한 장」 그림을 만들어 카톡 등으로 보낼 수 있어요. 투자 참고용이고 매수 추천이 아니에요."],
    // 📝 제안서 (10/29 사용자 「제안서 카테고리의 조이는 설명이 거의 없어」 — 자세한 건 propose.js 의 JOY 글)
    [/오늘의 기본폼/, "매일 아침 시황에 맞춰 미리 만들어 둔 제안서 틀 9가지예요. 고를 상품을 누르면 아래 칸이 열려요."],
    [/누구에게 · 누가/, "제안서 표지에 들어갈 고객 이름과 제안자(나)·소속을 넣는 칸이에요."],
    [/상품별 금액/, "고른 상품마다 금액과 위험 정도·환전 여부·꼭 넣을 종목을 정하는 칸이에요."],
    [/^📤 만들기|^만들기/, "고객에게 바로 보여 주거나, 한 장 그림·PDF·PPT로 만들어 보내는 칸이에요."],
    // 🌐 시황
    [/오늘의 킥/, "오늘 짧게 노려 볼 기회(킥)와 그 이유예요. 킥 포트에 실제로 담기는 건 성과가 확인된 신호뿐이에요."],
    [/전일 미국장/, "어젯밤 미국장에서 중요했던 움직임과 오늘 한국장에 줄 영향이에요."],
    [/오늘의 집중/, "오늘 돈이 가는 길 → 그걸 담는 방법 → 오늘 할 행동을 한 장으로 정리했어요."],
    [/돈이 몰리는 곳/, "지금 돈(거래·상승)이 몰리는 섹터·테마예요."],
    [/숫자 복기/, "이번 주에 앱의 신호들(컵·갭·매집·고래·킥 등)이 실제로 얼마나 벌었는지 숫자로 되돌아보는 표예요."],
    [/밤사이 가장 크게/, "우리가 자는 동안 미국·세계 시장에서 평소보다 크게 움직인 것 3개를 골라, 오늘 한국장에 줄 영향을 같이 적었어요."],
    [/일정판/, "이번 주 경제 발표·실적 일정이에요. 내 관심종목이나 신호 종목의 실적이 있으면 따로 표시돼요."],
    [/오늘 할 일/, "오늘 시황을 보고 할 일을 정리한 목록이에요. 체크하면 이 휴대폰에 기억돼요."],
    [/리포트에 나온 종목/, "오늘 시황 리포트에 나온 종목들이에요. 이름을 누르면 그 종목의 종목리포트로 가요."],
    [/지난 시황 검색/, "지난 시황 리포트를 낱말로 찾아요. 예: 「금리」, 「반도체」."],
    [/실시간 시장판/, "지수·환율·금리·원자재의 지금 값과 오늘 등락이에요."],
    [/오늘의 숫자/, "오늘 시황의 핵심 숫자들이에요."],
    [/경우의 수/, "시황 리포트가 본 앞으로의 시나리오와 각각의 확률이에요. 확률이 바뀌면 순서도 바뀌어요."],
    [/킥 포함 자산 배분/, "기본 배분에서 현금 일부를 떼어, 성과가 확인된 신호(킥)에 담은 배분이에요. 기본과 킥을 같은 날 같은 기준으로 비교해요."],
    [/자산 배분/, "시황 리포트 기준으로 지금 주식·채권·금·현금을 얼마씩 담을지 정리한 표예요. 예시이며 매수 추천은 아니에요."],
    [/최근 흐름/, "최근 리포트들의 판단이 어떻게 바뀌어 왔는지 한 줄씩 보여줘요."],
    [/규칙 발동/, "미리 정해 둔 매매 규칙 중 오늘 조건이 맞아 켜진 것이 있는지 확인해요."],
    [/오늘의 판단/, "오늘 시황의 결론 한 줄과 그 이유예요."],
    [/어제 예고/, "어제 리포트가 예고한 것이 오늘 맞았는지 채점한 결과예요."],
    [/다가오는 일정/, "앞으로 시장을 흔들 수 있는 발표·행사 일정이에요."],
    [/이러면 틀린 것/, "오늘 판단이 틀렸다고 볼 신호예요. 이게 나오면 생각을 바꿔요 — 고집하지 않기 위한 장치."],
    [/카톡 요약/, "카톡으로 보내기 좋게 줄인 오늘 시황 요약이에요."],
    [/적중률/, "시황 리포트의 예고가 실제로 맞은 비율을 계속 쌓아 채점한 기록이에요."],
    [/대응표/, "시나리오마다 내가 어떻게 할지 미리 적어 두는 칸이에요. 미리 정해 두면 장이 흔들려도 덜 흔들려요."],
    [/리포트대로 굴렸다면/, "리포트의 배분을 그대로 들고 있었다면 1억이 지금 얼마가 됐을지 계산한 거예요."],
    [/금리 한 장 지도/, "미국 10년 금리와 코스피를 한 그림에 놓고, 금리가 주식을 누르는지 보는 지도예요."],
    [/킥 되감기/, "그날 썼던 킥(짧게 노린 기회)이 그 뒤 실제로 맞았는지 자동으로 붙여 보는 기록이에요."],
    // 🧭 나침반
    [/국면 신호판/, "경기 사이클(6~18개월 뒤 경기)과 시장 타이밍(1~3개월 뒤 주가) 두 점수로 지금이 어떤 국면인지 보여줘요. 점수를 누르면 신호별 설명이 나와요."],
    [/5개 시장 한눈에/, "한국·미국·일본·중국·홍콩 5개 시장에서 오늘 오른 종목과 내린 종목 비율을 한 줄씩 비교해요."],
    [/세계 시장 하루 흐름/, "해가 뜨는 순서(일본 → 한국 → 중국 → 홍콩 → 미국)로 시장마다 오른 종목 비율을 원으로 보여줘요."],
    [/누가 누구를 따라가나/, "5개 시장의 지수가 하루하루 얼마나 같이 움직였는지(상관) 보여줘요. 1이면 똑같이, 0이면 상관없이 움직여요."],
    [/제일 강할까/, "체감 온도 점수로 5개 시장을 줄 세웠어요. 높을수록 사람들이 사고 싶어 하는 시장이에요."],
    [/국면 전환 예보/, "지수와 20일선·60일선의 위치·기울기로 상승장·횡보장·하락장을 판정하고(급락 — 20일 −8%·20일 고점 대비 −10% — 은 바로 하락장), 지금 속도면 언제 바뀔지 예보해요."],
    [/로테이션 시계/, "섹터마다 한 달 흐름과 이번 주 흐름으로 시계 위 자리를 정해요. 돈은 보통 시계 방향으로 돌아요."],
    [/로테이션 지도/, "가로 = 한 달 강도, 세로 = 이번 주 강도. 어느 섹터로 돈이 들어오고 빠지는지 한 장으로 봐요."],
    [/이 업종·종목을 보자/, "오늘 등락·1주 흐름·업종 안 오른 종목 비율로 고른 업종 3곳과 대장주예요."],
    [/체감 온도/, "오늘 하루 오른 종목 비율·신고가·지수 위치를 섞어 시장 분위기를 0(차가움)~100(뜨거움)으로 나타내요. CNN 방식 공포·탐욕은 시장확률 탭에 있어요."],
    [/오른 종목 · 내린 종목/, "오늘 오른 종목과 내린 종목 수예요. 지수가 대형주 위주라서, 이 숫자가 보통 종목의 실제 체감이에요."],
    [/대표 지수/, "나라별 대표 지수 차트예요. 차트를 누르고 옆으로 밀면 그날 값이 나와요."],
    [/포트 비교 지수/, "내 포트가 이겨야 할 시장 14곳의 지수예요. 포트 탭의 「시장 14곳과 비교」와 같은 목록이에요."],
    [/상승 − 하락/, "매일 오른 종목 수에서 내린 종목 수를 뺀 값의 흐름이에요. 시장의 체력을 봐요."],
    [/섹터 등락/, "시가총액 가중으로 본 섹터별 오늘 등락이에요. 섹터를 누르면 그 섹터 종목이 나와요."],
    [/52주 신고가/, "1년 중 가장 높은 값을 오늘 새로 쓴 종목이에요. 큰 회사 순."],
    [/많이 오른 대형주/, "오늘 많이 오른 큰 회사들이에요."],
    [/약한 업종/, "오늘 가장 약했던 업종이에요."],
    [/히트맵/, "섹터별로 기간(1주·1개월·3개월 등) 수익률을 색으로 보여줘요. 빨강 = 오름, 파랑 = 내림."],
    [/국면 기록/, "최근 60거래일 동안 시장 국면(상승·횡보·하락)이 어떻게 바뀌어 왔는지 기록이에요."],
    [/흐름 되감기/, "최근 15거래일 동안 섹터들이 지도 위에서 어떻게 움직였는지 다시 돌려 봐요. 섹터를 고르면 그것만 돌려요."],
    [/신고가 vs 신저가/, "신고가 종목과 신저가 종목의 비율 흐름이에요. 지수는 오르는데 이 선이 내려가면 몇 종목만 끄는 장이에요."],
    [/환율·금리에 민감/, "환율·금리가 움직일 때 같이 움직인 업종이에요. 환율·금리 뉴스가 나오면 어느 업종이 영향을 받을지 봐요."],
    [/미국 → 한국/, "미국에서 강한 업종을 한국 같은 업종이 따라왔는지 봐요. 덜 따라온 곳은 따라잡을 여지를 볼 만해요."],
    // 💼 포트
    [/시장 \d+곳과 비교/, "내 포트(기본·킥)를 세계 주요 지수 14곳과 같은 날부터 달러 기준으로 비교해요. 목표는 S&P500을 이기는 것."],
    [/킥 칸 속/, "킥 칸 안에 무엇이 들어 있고, 손절·익절 규칙과 수익이 어떤지 보여줘요."],
    [/이렇게 담으면/, "지금 배분표대로 담으려면 무엇을 몇 주 사면 되는지 금액을 넣어 계산해 줘요."],
    [/비중 바뀐 날/, "배분 비중이나 상품이 바뀐 날과 그 이유의 기록이에요."],
    [/해외 동종주/, "미국에서 강한 섹터마다 한국·일본·대만 등 해외 같은 업종 종목을 달러 수익·위험 대비로 비교해, 이기는 쪽을 포트에 담아요."],
    [/벌고 잃었나/, "포트의 칸(자산)마다 시작일부터 수익에 얼마나 더하고 뺐는지(기여 %p)와 지금 신호예요."],
    [/날짜별 성적/, "날짜마다 성적(수익률)을 차례로 보여줘요."],
    // 📊 성적표
    [/규칙 검증/, "포트 규칙(국면 현금·칸 기울이기·추세 브레이크)을 2008년부터 미국 섹터 ETF에 매일 적용해 본 결과예요. 나아진 규칙만 킥 포트에 켜요."],
    // 🐋 고래
    [/고래 지수 vs/, "고래(유명 펀드)들이 많이 든 종목으로 만든 지수와 S&P500의 1년 수익률을 비교해요."],
    [/TOP 10/, "고래 보유·최근 매수·가격 위치를 점수로 매긴 오늘의 상위 10종목이에요."],
    [/오늘의 신호/, "오늘 새로 생긴 고래 관련 신호예요."],
    [/함께 든 종목/, "여러 고래가 같이 들고 있는 종목이에요. 많이 겹칠수록 믿음이 모인 종목."],
    [/행동별 이후 성적/, "고래가 새로 산·늘린·줄인·판 종목이 그 뒤 실제로 얼마나 올랐는지 비교해요."],
    [/이것 하나/, "매일 하나씩 고른 「오늘 이것 하나」가 그 뒤 얼마나 올랐는지 기록이에요."],
    [/수익률 상위 고래/, "1년 수익률이 높은 고래 순이에요. 누르면 그 고래의 보유 종목."],
    [/합의 매수/, "같은 분기에 여러 고래가 새로 산 종목이에요."],
    [/고래보다 싸게/, "고래가 산 분기의 마지막 날 가격보다 지금 더 싼 종목이에요."],
    [/따라하기 수익곡선/, "고래의 큰 신규 매수를 공시일에 따라 샀다면 수익이 어땠는지 곡선으로 보여줘요."],
    [/분기 타임라인/, "고래별로 분기마다 무엇을 사고팔았는지 시간 순서로 보여줘요."],
    [/13F 공시 카운트다운/, "미국 기관이 보유 내역(13F)을 내는 마감까지 남은 날과 아직 안 낸 곳이에요."],
    [/매도 경보/, "여러 고래가 정리하거나 크게 줄인 종목이에요. 들고 있다면 한 번 점검."],
    [/확신도/, "비중을 크게 새로 담았거나 크게 늘린 고래 순이에요. 돈을 크게 건 쪽을 보여줘요."],
    [/내부자도 사는 중/, "최근 90일 동안 회사 임원·대주주가 자기 돈으로 장에서 산 기록이에요."],
    [/관심종목을 가진 고래/, "내 ⭐ 관심종목을 들고 있는 고래와 그 비중이에요."],
    [/그대로 따라 사기/, "고래들이 많이 든 상위 15종목을 그 비중대로 산다면 어떻게 되는지 보여줘요."],
    [/새로 산 종목, 그 뒤/, "고래가 새로 산 종목을 공시일에 샀다면 지금까지 수익이 어떤지 모았어요. 그 고래를 얼마나 믿을지의 근거."],
    [/겹침 지도/, "고래들의 보유 종목이 얼마나 겹치는지 그림으로 보여줘요. 가까울수록 같은 이야기에 베팅 중."],
    [/고래 vs 고래/, "고래 두 곳을 골라 보유 종목과 성적을 나란히 비교해요."],
    // ☕ 컵 · 📈 갭
    [/돌파 후 추적/, "컵 돌파가 난 종목이 그 뒤 성공(+20%)했는지 실패(−8%)했는지 따라가 봐요."],
    [/잘 맞던 조건/, "지금까지 성적이 좋았던 조건만 남겨 고른 종목이에요."],
    [/매수 계획/, "금액과 손절 폭을 넣으면 몇 주를 살지 계산해 줘요."],
    [/주봉 컵/, "몇 달~1년 넘게 만든 큰 컵 모양이에요. 일봉 컵보다 큰 그림."],
    [/돌파 임박/, "돌파선(왼쪽 고점)까지 3% 안으로 다가온 종목이에요."],
    [/이중 신호/, "컵과 갭 신호가 동시에 나온 종목이에요. 두 신호가 겹치면 더 볼 만해요."],
    [/컵 지도|갭 지도/, "오늘 신호가 어느 나라·섹터에 몰렸는지 보여주는 표예요. 숫자를 누르면 그 종목만 남아요."],
    [/^나라별/, "나라별 신호 수예요. 누르면 그 나라 종목만 보여요."],
    [/많이 나온 섹터/, "신호가 많이 나온 섹터예요. 누르면 그 섹터 종목만 보여요."],
    [/신호 성적표/, "이 화면의 신호가 처음 나온 날 샀다면 그 뒤 성적이 어땠는지 모은 표예요."],
    [/섹터별 신호 수/, "섹터마다 신호가 몇 개 나왔고 성적이 어땠는지 보여줘요."],
    [/메움 레이스/, "최근 갭이 갭 전 자리까지 되돌아오는지(메움) 경주처럼 보여줘요. 멀리 남은 종목이 강한 종목."],
    [/갭 크기 × 거래량/, "갭 크기와 거래량을 한 그림에 놓았어요. 오른쪽 위(크게 + 거래 많이)가 가장 믿을 만한 갭."],
    [/밤 갭/, "미국 대장주가 밤에 크게 갭이 나면 다음 날 한국 짝꿍 종목이 어떻게 움직였는지 2년 기록이에요."],
    [/갭 유형별/, "갭 종류(돌파·실적·소진 의심 등)마다 갭을 메운 비율이에요."],
    [/메움 확률표/, "갭 크기·거래량 조합마다 5일·20일 안에 갭을 메운 확률이에요. 낮을수록 잘 버틴 조합."],
    [/연속 갭/, "최근 20일 안에 위로 갭이 2번 넘게 난 종목이에요. 사는 힘이 강하다는 뜻."],
    [/실적 다음날 갭/, "실적 발표 다음 날 생긴 갭과, 실적을 앞둔 후보예요."],
    [/장 전 갭 후보/, "미국 장이 열리기 전 거래에서 갭이 날 것 같은 관심 종목이에요."],
    [/메움 추적/, "갭을 지킨 종목과 메운 종목의 그 뒤 수익을 비교해요."],
    // 🤫 매집
    [/매집 강도/, "가격은 조용한데 거래·수급이 쌓이는 정도를 점수로 매긴 순위예요."],
    [/관심이 식는/, "매집 조건에서 빠지거나 거래가 줄어든 종목이에요. 들고 있다면 점검."],
    [/박스 돌파/, "최근 20일 고점 위로 올라선 매집 종목이에요."],
    [/외국인·기관 순매수/, "최근 5일 동안 외국인·기관이 산 양이에요. 매집과 같이 나오면 더 믿을 만해요."],
    [/매집 달력/, "최근 8일 매집 점수를 달력처럼 보여줘요. 진할수록 점수가 높아요."],
    [/매집 종목 섹터/, "매집 종목이 어느 섹터에 몰려 있는지 보여줘요."],
    [/거래량 이상 종목/, "거래량이 그 전 석 달보다 크게 늘었는데 가격은 제자리인 종목이에요. 참고용 — 과거 검증에서 매수 신호로는 안 통했어요."],
    [/기간별 돌파/, "매집이 며칠째였는지에 따라 그 뒤 박스 돌파에 성공한 비율이에요."],
    [/숨소리/, "가격은 조용한데 거래량이 쌓이는 모습을 60일 그림으로 보여줘요."],
    [/누가 모으나/, "최근 10일 동안 개인·외국인·기관 중 누가 샀는지 보여줘요."],
    [/오래 모으는/, "매집이 오래된 순이에요. 같은 기간대의 과거 돌파율을 같이 적었어요."],
    [/매집의 생애/, "매집 → 돌파 → 상승의 평균 흐름과 지금 종목의 위치를 보여줘요."],
    // ⚡ 단타
    [/전광판/, "오늘 뜬 단타 알람과 지금 값이에요. 막대 = 장중 최저~최고, 흰 점 = 지금."],
    [/스스로 배운/, "쌓인 1분 자료와 실제 알람 결과로 단타 알람이 스스로 고친 규칙이에요."],
    [/성적 대시보드/, "단타 알람 전체의 승률과 평균 수익이에요."],
    [/손절·익절 라인/, "알람이 정한 손절가·목표가와 실제 움직임을 비교해요."],
    [/가상 매매 일지/, "알람마다 1주씩 샀다면 어땠는지 규칙대로 계산한 일지예요."],
    [/잘 맞는 시간대/, "몇 시에 뜬 알람이 잘 맞았는지 보여줘요."],
    [/손절 난 알람/, "손절까지 간 알람들의 공통점을 찾아봐요."],
    [/오늘 같은 장/, "오늘처럼 코스닥이 움직인 날에 알람 성적이 어땠는지 보여줘요."],
    [/유형별 가장 잘 된/, "알람 유형마다 가장 잘 된 알람이에요."],
    // 기타
    [/간밤 글로벌/, "간밤 미국·유럽 증시와 환율·금리·원자재가 어떻게 끝났는지 요약이에요."],
    [/전일 섹터 등락/, "어제 섹터별 등락이에요."],
    [/장중 나침반/, "장이 열려 있는 동안 5개 시장의 섹터 흐름을 몇 분마다 새로 보여줘요."],
    [/장중 섹터 발동/, "장중에 갑자기 강해진 섹터 기록이에요."],
    [/대장주/, "이 섹터에서 시가총액이 가장 큰 종목들이에요. 이름을 누르면 종목리포트."],
    [/오늘 많이 오른 종목/, "이 섹터에서 오늘 많이 오른 종목이에요."],
    [/구성 종목|테마 종목/, "이 섹터·테마에 속한 종목 목록이에요. 이름을 누르면 종목리포트."],
    [/한국 같은 섹터|관련주/, "같은 업종의 다른 나라 종목이에요. 이름을 누르면 종목리포트."],
    [/내 알림|알림 받기|알림 개수/, "휴대폰으로 받을 알림을 고르는 칸이에요."],
    [/종목 찾기/, "종목 이름이나 코드로 찾아 종목리포트를 열어요."],
    [/의견 남기기/, "앱에 바라는 점을 남기는 칸이에요. 운영자만 볼 수 있어요."]
  ];
  // 관련 화면 바로가기 [제목 규칙, 버튼 글, 갈 곳(탭~카드)]
  var LINKS = [
    [/킥/, "⚡ 킥 포트 보기", "port~pokick"],
    [/자산 배분|리포트대로 굴렸다면|이렇게 담으면/, "📋 포트에서 따라하기", "port~pofollow"],
    [/포트 비교 지수|시장 \d+곳과 비교/, "🏁 포트 vs 시장 14곳", "port~pocmp"],
    [/포트 비교 지수|시장 \d+곳과 비교/, "📈 나침반 지수 차트", "sector"],
    [/적중률|어제 예고|신호 성적표|성적 대시보드|규칙 검증|숫자 복기/, "📊 성적표", "score"],
    [/규칙 검증/, "⚡ 규칙이 켜진 킥 포트", "port~pokick"],
    [/국면|공포·탐욕|심리 온도|경우의 수|오늘의 판단/, "🧭 국면 신호판", "sector"],
    [/섹터|업종|로테이션|히트맵|돈이 몰리는 곳/, "🧭 나침반 섹터", "sector"],
    [/해외 동종주|벌고 잃었나/, "🧭 나침반 섹터", "sector"],
    [/이중 신호/, "☕ 컵", "cup"], [/이중 신호/, "📈 갭", "gap"],
    [/고래|13F|내부자/, "🐋 고래", "whale"],
    [/매집|외국인·기관/, "🤫 매집", "accum"],
    [/돌파 임박|박스 돌파|국면 기록|시간대|전광판|매도 경보|관심종목 알림/, "🔔 알림 켜기", "alarm"],
    [/밤사이|일정판|다가오는 일정|오늘 할 일|오늘의 판단/, "🎯 오늘의 집중", "market~mkfo"],
    [/리포트에 나온 종목|종목 찾기/, "📰 피드", "feed"],
    [/국면 신호판|국면 전환 예보|국면 기록/, "🧪 국면 규칙 검증", "score~scrbt"],
    [/섹터 등락|로테이션|히트맵|미국 → 한국/, "🌏 포트의 섹터별 동종주", "port~popeers"],
    [/52주 신고가|신고가 vs/, "☕ 컵 (돌파 후보)", "cup"],
    [/비중 바뀐 날|날짜별 성적/, "🌐 시황 판단", "market"],
    [/날짜별 성적/, "📊 성적표", "score"]
  ];
  function ttText(h){ var c = h.cloneNode(true); [].forEach.call(c.querySelectorAll(".mut,button,select,input,.fchev,.tt-i,a.btn,.gd-b,.gd-i"), function(x){ x.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim(); }
  var KEEPV = /추천 아님|변경 없음|종목은 없어요|넘은 비율|브라이어|보류 \d+건|도달은/;
  function titles(){
    var hs = document.querySelectorAll("#main section.card > h3, #sheet section.card > h3, #main section.card > .mk-lab, #main .fold > .fold-h");
    [].forEach.call(hs, function(h){
      if (h.dataset.tt) return;
      var c = h.closest(".fold") || h.closest("section.card");
      if (!c || c.id === "xs-more" || c.matches(".hm-c,.sc-c,.xs-more") || h.closest("[data-goto],[data-op]")) return;
      var t = ttText(h); if (!t) return;
      h.dataset.tt = "1";
      if (h.classList.contains("fold-h")){                 // 💼 포트 접기 머리: 머리 누르면 접기 그대로, ⓘ 만 설명
        var ib = document.createElement("button"); ib.type = "button"; ib.className = "tt-i"; ib.textContent = "ⓘ";
        var ch = h.querySelector(".fchev"); h.insertBefore(ib, ch || null);
      } else h.classList.add("tt-h");
      // 카드의 「읽는 법」 글을 설명 칸으로 (조작 버튼·현재 상태 글은 카드에 그대로)
      var ns = [].filter.call(c.querySelectorAll(c.matches(".fold") ? ":scope > .fold-b > section > p.note, :scope > .fold-b > p.note" : ":scope > p.note"), function(n){
        return !n.dataset.nt && n.textContent.trim() && !n.querySelector("button,a,input,select,textarea,label") && !KEEPV.test(n.textContent); });
      if (ns.length){ ns.forEach(function(n){ n.dataset.nt = "1"; n.classList.add("tt-note"); }); }
      h._tt = {t: t, ns: ns};
    });
  }
  function ttOpen(h){
    var c = h.closest(".fold") || h.closest("section.card"), box = h.nextElementSibling;
    if (box && box.classList.contains("tt-x")){ var o = box.hidden; box.hidden = !o; h.classList.toggle("tt-on", o); return; }
    var info = h._tt || {t: ttText(h), ns: []}, t = info.t;
    var sub = h.querySelector(".mut"); sub = sub ? sub.textContent.replace(/\s+/g, " ").trim() : "";
    var d = DESC.filter(function(x){ return x[0].test(t); })[0];
    var seen = {}, ls = LINKS.filter(function(x){ if (!x[0].test(t)) return false; var tab = x[2].split("~")[0];
      if (tab === cur && x[2].indexOf("~") < 0) return false; if (x[2].split("~")[1] && document.getElementById(x[2].split("~")[1]) && c.contains(document.getElementById(x[2].split("~")[1]))) return false;
      if (seen[x[2]]) return false; seen[x[2]] = 1; return true; }).slice(0, 3);
    box = document.createElement("div"); box.className = "tt-x";
    box.innerHTML = '<div class="ttx-h"><div><small>ⓘ 이 카드는</small><b></b>' + (sub ? '<em></em>' : '') + '</div><button class="ttx-x" type="button">닫기 ✕</button></div>' +
      (d ? '<p class="ttx-what"></p>' : '') + '<div class="ttx-n"></div>' +
      (ls.length ? '<div class="ttx-go"><small>관련 화면</small>' + ls.map(function(x){ return '<button type="button" class="ttx-l" data-goto="' + x[2] + '">' + x[1] + ' ›</button>'; }).join("") + '</div>' : '') +
      '<div class="ttx-bt"><button class="ttx-sh" type="button">📤 이 카드 공유</button><button class="ttx-x ttx-x2" type="button">설명 닫기 ▴</button></div>';
    box.querySelector("b").textContent = t;
    if (sub) box.querySelector("em").textContent = sub;
    if (d) box.querySelector(".ttx-what").textContent = d[1];
    var nb = box.querySelector(".ttx-n");
    (info.ns || []).forEach(function(n){ if (n.parentNode){ n.classList.remove("tt-note"); nb.appendChild(n); } });
    if (!nb.children.length) nb.remove(); else nb.insertAdjacentHTML("afterbegin", "<small>읽는 법</small>");
    if (!d){ var p0 = document.createElement("p"); p0.className = "ttx-what"; p0.textContent = sub || t; box.insertBefore(p0, box.children[1]); }
    h.parentNode.insertBefore(box, h.nextSibling);
    h.classList.add("tt-on");
    if (window.unclamp) unclamp(h);
    box.classList.add("ttx-in");
  }
  document.addEventListener("click", function(ev){
    var t = ev.target; if (!t.closest) return;
    var x = t.closest(".ttx-x");
    if (x){ ev.stopPropagation(); var bx = x.closest(".tt-x"), h = bx.previousElementSibling; bx.hidden = true; if (h) h.classList.remove("tt-on");
      if (x.classList.contains("ttx-x2") && h){ var y = h.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 12;
        if (h.getBoundingClientRect().top < 0) window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); }
      return; }
    var sh = t.closest(".ttx-sh");
    if (sh){ ev.stopPropagation(); var bx2 = sh.closest(".tt-x"), h2 = bx2.previousElementSibling, c2 = h2 && (h2.closest(".fold") || h2.closest("section.card"));
      var title = (h2 && h2._tt && h2._tt.t) || "", body = "";
      if (c2){ var all = (c2.innerText || "").replace(bx2.innerText || "", ""), seen = {}, out = [];
        all.split("\n").map(function(l){ return l.replace(/\s+/g, " ").trim(); }).forEach(function(l){
          if (!l || l === title || l.indexOf(title) === 0 || /^(ⓘ|전체 보기|접기|더 보기|자세히)/.test(l) || seen[l]) return; seen[l] = 1;
          if (out.length && (l.length <= 6 || out[out.length - 1].length <= 3)) out[out.length - 1] += " · " + l; else out.push(l); });
        body = out.slice(0, 6).join("\n"); }
      chShare("CH Investing", "📌 " + title + (body ? "\n" + body.slice(0, 260) : "") + "\n\n※ 투자 참고용 · 매수 추천 아님", cur); return; }
    var ib = t.closest(".tt-i"); if (ib){ ev.stopPropagation(); ttOpen(ib.closest(".fold-h")); return; }
    var h = t.closest("h3.tt-h, .mk-lab.tt-h"); if (!h) return;
    if (t.closest("button,a,input,select,label,textarea,[data-op],[data-goto]")) return;
    ttOpen(h);
  }, true);

  // ⑨ 공유 (10/13 「더 자주 열게」 ⑧) — 휴대폰 공유창(카톡 등) · 안 되면 복사
  window.chShare = function(title, text, hash){
    var url = "https://chkchp0702-spec.github.io/daily-app/" + (hash ? "#" + hash : "");
    var toast = function(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.setAttribute("role", "status"); d.setAttribute("aria-live", "polite"); d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); };
    var copy = function(){ var all = text + "\n" + url;
      if (navigator.clipboard) navigator.clipboard.writeText(all).then(function(){ toast("복사했어요 — 카톡 대화창에 붙여넣기 하세요"); }, function(){ prompt("길게 눌러 복사하세요", all); });
      else prompt("길게 눌러 복사하세요", all); };
    if (navigator.share) navigator.share({title: title, text: text, url: url}).catch(function(e){ if (e && e.name !== "AbortError") copy(); });
    else copy();
  };
  // ⑥ 나침반: 설명 글은 「ⓘ 설명」을 눌러야 보이게 (10/11 사용자: "지우지 말고 밑에 누르면 설명 부분 나오게 · 나침반이 복잡해 보여")
  var NOTE_TABS = {sector: 1};
  function notes(){
    [].forEach.call(document.querySelectorAll("#sheet details.cpx-d:not([data-op1])"), function(d){ d.dataset.op1 = "1"; d.open = true; });   // 칩으로 열면 바로 펼친 채로
    if (!NOTE_TABS[cur]) return;
    [].forEach.call(document.querySelectorAll("#main p.note, #main .rb-help, #sheet p.note"), function(n){
      if (n.dataset.nt || !n.textContent.trim()) return;
      n.dataset.nt = "1"; n.classList.add("nt-h");
      var b = document.createElement("button"); b.className = "nt-b"; b.type = "button"; b.textContent = "ⓘ 설명";
      b.onclick = function(ev){ ev.stopPropagation(); var o = n.classList.toggle("nt-h"); b.textContent = o ? "ⓘ 설명" : "ⓘ 설명 접기"; };
      n.parentNode.insertBefore(b, n);
    });
  }
  // 세부 섹터 계열 고르기 (시계·지도·되감기 같이)
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".famc [data-ffam]"); if (!b) return;
    var f = b.dataset.ffam; try { store.secf = f; save(); } catch(x) {}
    [].forEach.call(document.querySelectorAll(".famw"), function(w){ w.dataset.ff = f; });
    [].forEach.call(document.querySelectorAll(".famc [data-ffam]"), function(x){ x.classList.toggle("on", x.dataset.ffam === f); });
    setTimeout(function(){ [].forEach.call(document.querySelectorAll(".famw svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 30);
  });
  var DCT = null;
  new MutationObserver(function(){ if (DCT) return; DCT = setTimeout(function(){ DCT = null; try { titles(); } catch(x) {} notes();
    [].forEach.call(document.querySelectorAll("svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 200); })
    .observe(document.body, {childList: true, subtree: true});

  var css = document.createElement("style");
  css.textContent =
    // 위: 묶음 안의 작은 탭 (가로로 밀기)
    "header .tabs.sub{display:flex!important;gap:6px;overflow-x:auto;padding:0 12px 10px;scrollbar-width:none;grid-template-columns:none}" +
    "header .tabs.sub::-webkit-scrollbar{display:none}header .tabs.sub.none{display:none!important}" +
    "header .tabs.sub .tab{flex:none;flex-direction:row;padding:7px 14px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:-.3px;gap:0;min-width:auto}" +
    "header .tabs.sub .tab.on{background:var(--c);color:#111;border-color:transparent}" +
    ".top{padding-bottom:8px!important}.brand{font-size:20px!important}" +
    // 아래 탭 바
    "#bnav{position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;background:rgba(11,15,23,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);" +
    "border-top:1px solid var(--line);padding:4px 4px calc(env(safe-area-inset-bottom) + 4px)}" +
    "#bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;color:var(--sub);font:inherit;font-size:12.5px;padding:5px 0 3px;cursor:pointer;position:relative}" +
    "#bnav button .i{font-size:21px;line-height:1.15;filter:grayscale(.6);opacity:.75}" +
    "#bnav button.on{color:var(--text);font-weight:800}#bnav button.on .i{filter:none;opacity:1}" +
    "#bnav button.on:before{content:'';position:absolute;top:-4px;left:30%;right:30%;height:3px;border-radius:0 0 3px 3px;background:var(--c,#7c9cff)}" +
    ":root[data-ui=light] #bnav{background:rgba(255,255,255,.94);border-top-color:#dde2ea}" +
    "#backbtn{bottom:calc(env(safe-area-inset-bottom) + 74px)!important}#main{padding-bottom:120px!important}footer{padding-bottom:110px!important}" +
    // 탭 머리 한 줄
    "#main > .hero{background:none!important;border:0!important;box-shadow:none!important;padding:2px 4px 8px!important;margin:0 0 4px!important;cursor:pointer}" +
    "#main > .hero h1{display:inline;font-size:19px!important;letter-spacing:-.4px}" +
    "#main > .hero .meta{display:inline-flex!important;margin:0 0 0 8px!important;vertical-align:2px;gap:4px!important}" +
    "#main > .hero .meta .chip{font-size:12.5px;padding:2px 7px}" +
    "#main > .hero p{display:none}#main > .hero.show p{display:block;margin-top:6px}" +
    "#main > .hero h1:after{content:' ⓘ';font-size:12.5px;color:var(--dim);font-weight:400}" +
    // 카드 제목 설명 칸
    "h3.tt-h{justify-content:flex-start!important;gap:6px}h3.tt-h>.mut{margin-left:auto}h3.tt-h,.mk-lab.tt-h{cursor:pointer;-webkit-tap-highlight-color:transparent}h3.tt-h:after,.mk-lab.tt-h:after{content:'ⓘ';margin-left:4px;font-size:12.5px;color:var(--dim);font-weight:400;flex:none}" +
    "h3.tt-h.tt-on:after,.mk-lab.tt-h.tt-on:after{content:'ⓘ ▴';color:var(--text)}.tt-note{display:none!important}" +
    ".tt-i{flex:none;border:0;background:none;color:var(--dim);font:inherit;font-size:13px;padding:2px 6px;cursor:pointer}" +
    ".tt-x{margin:2px 0 12px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);padding:12px 12px 10px;font-size:13px;line-height:1.55;color:var(--text);font-weight:400;text-align:left}" +
    ".tt-x.ttx-in{animation:rbxIn .2s ease-out}@keyframes rbxIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}" +
    ".ttx-h{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;border-left:4px solid var(--c,#7c9cff);padding-left:10px}" +
    ".ttx-h small{display:block;color:var(--sub);font-size:12.5px}.ttx-h b{display:block;font-size:15.5px;font-weight:800;color:var(--text)}.ttx-h em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".ttx-x{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ttx-what{margin:10px 0 6px}.ttx-n{background:var(--panel);border-radius:10px;padding:8px 10px;margin:6px 0}.ttx-n>small,.ttx-go>small{display:block;color:var(--sub);font-size:12.5px;font-weight:700;margin-bottom:2px}" +
    ".ttx-n p.note{margin:4px 0 0!important;font-size:12.5px;color:var(--text)}" +
    ".ttx-go{margin:8px 0 2px;display:flex;flex-wrap:wrap;gap:6px}.ttx-go>small{flex-basis:100%}" +
    ".ttx-l{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ttx-bt{display:flex;gap:6px;margin-top:10px}.ttx-bt .ttx-x2{flex:1;margin:0}.ttx-sh{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ch-toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 90px);transform:translateX(-50%);z-index:99;background:var(--text);color:var(--bg);border-radius:12px;padding:10px 14px;font-size:13.5px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center}" +
    ".ttx-x2{display:block;width:100%;margin-top:10px;padding:9px}" +
    // 나침반 접기·설명
    ".nt-h{display:none!important}.nt-b{display:inline-block;border:0;background:none;color:var(--sub);font:inherit;font-size:12.5px;padding:4px 2px;margin:2px 0;cursor:pointer}" +
    "details.cpx-d>summary,.rb-det>summary{cursor:pointer;font-weight:800;font-size:15px;list-style:none;padding:2px 0}details.cpx-d>summary::-webkit-details-marker,.rb-det>summary::-webkit-details-marker{display:none}" +
    "details.cpx-d>summary:after,.rb-det>summary:after{content:' ▾';color:var(--dim);font-weight:400}details.cpx-d[open]>summary:after,.rb-det[open]>summary:after{content:' ▴'}" +
    "details.cpx-d>summary .mut{display:block;font-size:12.5px;font-weight:400;margin-top:2px}details.cpx-d[open]>summary{margin-bottom:10px}" +
    ".rb-det{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.rb-det>summary{font-size:14px;color:var(--sub)}" +
    // 계열 고르기
    ".famc{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin:6px 0 2px;padding-bottom:2px}.famc::-webkit-scrollbar{display:none}" +
    ".famc button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}.famc button.on{background:var(--text);color:var(--bg);border-color:transparent}" +
    ".famw[data-ff=it] [data-fam]:not([data-fam=it]),.famw[data-ff=hc] [data-fam]:not([data-fam=hc]),.famw[data-ff=ind] [data-fam]:not([data-fam=ind]),.famw[data-ff=fin] [data-fam]:not([data-fam=fin])," +
    ".famw[data-ff=con] [data-fam]:not([data-fam=con]),.famw[data-ff=com] [data-fam]:not([data-fam=com]),.famw[data-ff=mat] [data-fam]:not([data-fam=mat]),.famw[data-ff=re] [data-fam]:not([data-fam=re]){display:none}" +
    ".famw[data-ff=''] [data-fam]:not([data-top]) .rotl,.famw:not([data-ff]) [data-fam]:not([data-top]) .rotl{display:none}" +   // 전체일 땐 움직임 큰 10곳만 이름
    // 겹친 글씨 비켜 쓴 선 · 밝은 화면의 카드 창 머리
    "svg .dc-ln{stroke:var(--sub);stroke-width:.8;opacity:.6}" +
    ":root[data-ui=light] .sh-top{background:rgba(255,255,255,.94)!important}:root[data-ui=light] .sh-top b{color:#141a26}" +
    // 날짜 칩 한 줄로 작게
    "#main .dates{margin-bottom:10px}#main .date{padding:5px 11px!important;border-radius:999px!important;font-size:12.5px!important;line-height:1.3}" +
    "#main .date b{display:inline!important;font-size:13.5px!important;margin-right:3px}" +
    "#backbtn.root{display:none!important}#backbtn{padding:9px 14px!important;font-size:14px!important}" +
    // 🫥 10/31 B7: 읽으려고 아래로 내리는 동안엔 「보내기」「뒤로」를 아래로 숨김 — 글자를 가리지 않게 (위로 살짝 올리거나 맨 위·맨 아래면 다시)
    "#backbtn,#opbtn{transition:transform .25s ease,opacity .25s ease!important}" +
    "html.fab-hide #backbtn,html.fab-hide #opbtn{transform:translateY(140%)!important;opacity:0!important;pointer-events:none!important}" +
    "";
  document.head.appendChild(css);
  (function(){
    var D = document.documentElement, lastY = window.scrollY;
    window.addEventListener("scroll", function(){
      var y = window.scrollY, dy = y - lastY, end = y + window.innerHeight >= document.documentElement.scrollHeight - 40;
      if (y < 80 || end || dy < -6) D.classList.remove("fab-hide");
      else if (dy > 6) D.classList.add("fab-hide");
      if (Math.abs(dy) > 6) lastY = y;
    }, {passive: true});
  })();
  if (window.cur) try { window.drawTabs(); } catch(x) {}
})();
