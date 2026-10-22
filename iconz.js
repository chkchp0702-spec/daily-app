/* 🔣 아이콘 풀이 (10/22 사용자 「설정 칸에 아이콘 풀이도 — 모든 아이콘 쉽게 설명」)
   ⚙️ 보기 설정 › 「🔣 아이콘 풀이」 → 아래에서 올라오는 칸(용어 풀이와 같은 모양) · 묶음별 · 위 찾기 칸으로 거르기 */
(function(){
  var G = [
    ["📍 화면 위·아래 버튼", [
      ["🏠", "오늘 — 오늘 꼭 볼 것만 모은 첫 화면"],
      ["🌐", "시장 · 시황 — 매일 아침 시장 전략 리포트"],
      ["🧭", "나침반 — 한국·미국·일본·중국·홍콩 5개 시장을 한눈에"],
      ["🎲", "시장확률 — 다음 장이 오를 확률(아직 검증 중이라 약하게만 말해요)"],
      ["💼", "포트 — 시황대로 투자했다면 얼마 벌었나"],
      ["📊", "성적표 — 앱이 한 말이 맞았는지 채점"],
      ["🎯", "신호 — 고래·컵·갭 같은 종목 신호 모음 (ELS 탭과 「집중」에도 쓰여요)"],
      ["🛍️", "상품 — 채권·펀드·ELS"],
      ["📰", "피드 — 매일 읽는 블로그·텔레그램·뉴스"],
      ["🔍", "종목 검색 — 이름이나 코드로 찾기"],
      ["⭐", "관심 종목 — 별표 해 둔 종목 모아 보기"],
      ["⚙️", "보기 설정 — 화면 밝기·글자 크기·순서 (지금 이 칸)"],
      ["🧒", "꼬마 얼굴 — 누르면 그 화면·카드를 꼬마가 설명해 줘요"],
      ["🔴", "CH 옆 작은 점 — 오늘 시장 날씨 색(초록 맑음 · 노랑 흐림 · 빨강 비)"],
      ["⟳", "몇 분 전 — 자료가 마지막으로 바뀐 시각"],
      ["←", "뒤로 — 앞 화면으로"]
    ]],
    ["🎨 색과 표시", [
      ["빨강 숫자", "올랐다 (+)"],
      ["파랑 숫자", "내렸다 (−)"],
      ["회색 밑줄", "누르면 그 화면으로 이동"],
      ["▲ ▼", "올라감 · 내려감 (지난번 본 값과 비교할 때도)"],
      ["🟢", "좋음 · 켬 · 사기 · 상승장"],
      ["🔴", "나쁨 · 끔 · 팔기 · 상승장 아님"],
      ["🟡", "보통 · 절반만 팔기"],
      ["⚪", "중립 · 판단 없음"],
      ["✓ ✅", "맞았다 · 확인됨"],
      ["✗ ❌", "틀렸다 · 기각(써 봤는데 안 됨)"],
      ["⚠️", "주의 — 기준에 못 미치거나 조심할 것"],
      ["⏳", "기다리는 중 · 자료가 늦어짐"],
      ["🆕", "새로 생김"],
      ["👑", "1등"],
      ["▾ ▴", "펼치기 · 접기"],
      ["›", "자세히 보기 · 그 화면으로"]
    ]],
    ["🌤 오늘 날씨와 시간", [
      ["☀️", "맑음 — 크게 오른 날"],
      ["🌤", "구름 조금 — 조금 오른 날"],
      ["☁️ ⛅", "흐림 — 큰 움직임 없음 · 신호가 엇갈림"],
      ["🌧", "비 — 내린 날"],
      ["⛈", "폭풍 — 크게 내린 날"],
      ["🌫", "보류 — 판단할 신호가 적음"],
      ["🌅", "아침판 — 밤사이 미국 + 오늘 볼 것"],
      ["🌞", "장중판 — 지금 한국 장"],
      ["🌆", "저녁판 — 오늘 마감 + 내일 확률"],
      ["🌙", "밤판 — 미국 장"],
      ["🗓", "주말판"]
    ]],
    ["💼 포트", [
      ["💼", "기본 포트 — 시황 배분표대로(S&P500 반 + 나스닥 반이 뼈대)"],
      ["⚡", "공격(킥) 포트 — 기본에 검증된 신호 종목을 조금 섞은 것"],
      ["🎯", "집중 포트 — 오르는 장일 때만 몰아서 담기"],
      ["🙋", "내 포트 — 내가 정한 비중"],
      ["🎛", "설계기 — 비중을 밀면 2008년부터 다시 계산"],
      ["🏁", "경주 · 비교 — 시장(S&P500 등)과 누가 앞서나"],
      ["📋", "따라하기 — 지금 뭘 얼마나 담으면 되나"],
      ["🔁", "비중 바뀐 날"],
      ["🧩", "칸별 — 어느 칸이 벌고 잃었나"],
      ["🦴", "뼈대 · 변동성 맞춤 — 시장이 많이 흔들리면 주식을 줄임"],
      ["🅿️", "빈 자리 주차 — 신호가 없을 땐 그 돈을 지수에 넣어 둠"],
      ["🛑", "멈춤 — 이 신호가 많이 잃어 한동안 새로 안 삼"],
      ["✂", "반 크기 — 손실이 나서 절반만 삼"],
      ["⛔", "브레이크 — 공격 칸이 많이 빠져 새로 안 삼"]
    ]],
    ["🐋 신호 출처 (종목 앞 작은 표시)", [
      ["🐋", "고래 — 큰 펀드·유명 투자자가 새로 산 종목"],
      ["☕", "컵 — 컵 모양으로 바닥을 다지고 오르려는 차트"],
      ["📈", "갭 — 전날보다 훌쩍 높게 시작해 지키는 종목"],
      ["🤫", "조용한 매집 — 가격은 그대로인데 거래가 늘어남"],
      ["📊", "실적 갭 · 실적 표류 — 실적 발표 뒤 움직임"],
      ["🏔", "신고가 — 52주(1년) 최고가를 새로 씀"],
      ["🩹", "급락 반등 — 크게 빠진 뒤 튀어 오름"],
      ["🔌", "고객사 → 납품사 — 큰 고객이 좋으면 납품하는 회사도"],
      ["🕵", "내부자 매수 — 임원이 자기 돈으로 삼"],
      ["🔗", "선행 — 먼저 움직이는 종목을 따라감"],
      ["🤝", "신호 합의 — 여러 신호에 같이 뜸"],
      ["🌱", "조용한 신고가 — 거래 없이 신고가"],
      ["🏆", "섹터 1등주 · 오늘의 배지"],
      ["🎰 🐸", "거름망 — 너무 튄 종목·불안한 종목 걸러냄"],
      ["📰", "뉴스 없는 갭 (피드 탭에선 뉴스·글)"]
    ]],
    ["🧪 검증 · 정직", [
      ["🧪", "시험 중 — 절반 크기로 먼저 해 봄"],
      ["👻", "그림자 — 실제론 안 사고 「샀다면」만 채점"],
      ["🧾", "정직 계산 · 시도 장부 — 비용까지 뺀 성적, 시험한 조합 수"],
      ["📡", "실측 — 공개된 기준가로 직접 계산"],
      ["🧮", "추정 — 기준가가 없어 비슷한 것으로 계산"],
      ["📷", "사진 값 — 받은 화면 사진 그대로"],
      ["🔮", "예고 — 시황 리포트가 한 예상(다음 날 채점)"],
      ["🗳", "내 표 — 예고에 👍👎 던지기"],
      ["👁", "내 눈 — 내가 「볼 만함」 찍은 종목 성적"],
      ["🌙", "밤 연구 — 매일 밤 규칙을 시험"]
    ]],
    ["🧠 시장 분석", [
      ["🧠 💭", "두뇌 · 지금 생각 — 뉴스·글을 읽고 매시간 고치는 판단"],
      ["🫀", "심리 계기판 — VIX·선물·옵션·신용"],
      ["😱", "공포 · 급락 — 「그날 팔았다면?」"],
      ["🌡️", "체감 온도 — 공포·탐욕"],
      ["🧲", "오늘과 닮은 날 — 과거에 비슷했던 날"],
      ["🔥", "강함 · 과열 (오늘 탭에선 연속 방문)"],
      ["🧊", "계속 약함"],
      ["🍂", "힘 빠지는 중"],
      ["🚀", "박스 돌파"],
      ["🕳", "갭 메움 — 뛴 만큼 다시 내려옴"],
      ["🌉", "미국 밤 → 한국 아침"],
      ["🏛", "연기금 · 프로그램 매매"],
      ["🛰 💵", "선행 지표 · 자금 흐름"],
      ["🪙", "크립토(코인) 공포·탐욕"],
      ["🕸 ⚔ 🚨 💸 🕰", "고래 겹침 · 고래끼리 · 고래 매도 경보 · 고래보다 싸게 · 고래 타임라인"],
      ["🧬", "매집의 생애"],
      ["🌗", "미국 시간외 가격"],
      ["🗺", "섹터 지도"],
      ["📜", "국면 기록"]
    ]],
    ["🛍️ 상품", [
      ["🏦", "채권"],
      ["📦", "펀드"],
      ["🎯", "ELS"],
      ["🔒 🔓", "사모 라인업 잠금 · 열림"],
      ["🎬", "과거 재생 — 2006년부터 매일 가입했다면"],
      ["📌", "담아 두기 — 내 ELS 지금 어디쯤"],
      ["⚖️", "세 갈래 길 — 같은 돈으로 채권·ELS·포트 비교"],
      ["🧺", "구성 엿보기 — 펀드가 담은 종목"],
      ["💵", "달러 상품"]
    ]],
    ["🌏 나라", [
      ["🇰🇷", "한국"], ["🇺🇸", "미국"], ["🇯🇵", "일본"], ["🇨🇳", "중국"], ["🇭🇰", "홍콩"], ["🇧🇷", "브라질"], ["🇦🇺", "호주"], ["🌏", "해외 · 동종주"]
    ]],
    ["🔧 기타 버튼", [
      ["📤", "공유 — 카톡 등으로 보내기"],
      ["🔔", "알림 켜기·끄기"],
      ["💬", "의견함 — 앱에 바라는 점"],
      ["📖", "용어 풀이"],
      ["👆", "카드를 길게 누르면 꼬마가 요약"],
      ["📅", "날짜 · 일정"],
      ["📝", "기록 · 메모"]
    ]]
  ];
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function open(){
    var old = document.getElementById("icz"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "icz";
    d.innerHTML = '<div class="gl-in"><div class="gl-t"><b>🔣 아이콘 풀이</b><button class="icz-x" aria-label="닫기">✕</button></div>' +
      '<input class="icz-q" type="search" placeholder="찾기 (예: 고래, 빨강, 🧪)">' +
      G.map(function(g){ return '<div class="icz-g"><div class="icz-h">' + e(g[0]) + '</div>' + g[1].map(function(x){ var t = /[가-힣]/.test(x[0]), c = /빨강/.test(x[0]) ? " up" : /파랑/.test(x[0]) ? " dn" : /밑줄/.test(x[0]) ? " ul" : "";
        return '<div class="icz-r"><span class="' + (t ? "t" + c : "") + '">' + (t && c && c !== " ul" ? (c === " up" ? "+2.3%" : "−1.8%") : t && c === " ul" ? "포트 ›" : e(x[0])) + '</span><p>' + (t && c ? "<b>" + e(x[0]) + "</b> — " : "") + e(x[1]) + '</p></div>'; }).join("") + '</div>'; }).join("") +
      '<p class="icz-n">숫자·말은 「사라·팔라」는 뜻이 아니에요.</p></div>';
    d.onclick = function(ev){ if (ev.target === d || ev.target.closest(".icz-x")) d.remove(); };
    var q = d.querySelector(".icz-q");
    q.oninput = function(){ var v = q.value.trim();
      [].forEach.call(d.querySelectorAll(".icz-g"), function(g){ var any = 0;
        [].forEach.call(g.querySelectorAll(".icz-r"), function(r){ var ok = !v || r.textContent.indexOf(v) >= 0; r.style.display = ok ? "" : "none"; if (ok) any = 1; });
        g.style.display = any ? "" : "none"; }); };
    document.body.appendChild(d);
  }
  window.chIcons = open;
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-icons]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); open(); }, true);
  // ⚙️ 보기 설정 칸에 단추 넣기 (📖 용어 풀이 다음)
  function addBtn(){ var g = document.querySelector("#uiset .us-go"); if (!g || g.querySelector("[data-icons]")) return;
    var b = document.createElement("button"); b.setAttribute("data-icons", "1"); b.textContent = "🔣 아이콘 풀이";
    var gl = g.querySelector("[data-gloss]"); g.insertBefore(b, gl ? gl.nextSibling : g.firstChild); }
  new MutationObserver(function(){ if (document.getElementById("uiset")) addBtn(); }).observe(document.documentElement, {childList: true, subtree: true});
  var st = document.createElement("style");
  st.textContent = "#icz{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}" +
    ".icz-q{width:100%;box-sizing:border-box;margin:2px 0 8px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:15px}" +
    ".icz-h{position:sticky;top:-14px;background:var(--panel);font-weight:800;font-size:14px;padding:10px 0 6px;margin-top:6px;border-bottom:1px solid var(--line);z-index:1}" +
    ".icz-r{display:grid;grid-template-columns:76px 1fr;gap:10px;align-items:center;padding:8px 2px;border-bottom:1px dashed var(--line)}.icz-r:last-child{border-bottom:0}" +
    ".icz-r span{font-size:20px;text-align:center;line-height:1.2;word-break:keep-all}.icz-r p{margin:0;font-size:14px;line-height:1.5;color:var(--text)}" +
    ".icz-r span.t{font-size:15px;font-weight:800}.icz-r span.up{color:var(--up)}.icz-r span.dn{color:var(--down)}.icz-r span.ul{color:var(--sub);text-decoration:underline;text-underline-offset:3px;font-weight:600}" +
    ".icz-n{font-size:12px;color:var(--sub);margin:12px 0 0;text-align:center}";
  document.head.appendChild(st);
})();
