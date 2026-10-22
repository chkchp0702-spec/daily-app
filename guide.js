/* 🧒 꼬마 안내원 (10/22 사용자: 둘째 아들을 닮은 3D 캐릭터로 앱 각 카테고리 설명 — Kling 영상 대신 비용 0원 안내 카드)
   · 머리 「CH Investing」 옆 작은 얼굴 버튼 하나 → 누르면 지금 보고 있는 묶음(오늘·시장·포트·신호·상품·피드)을 말풍선으로 설명
   · 처음 보는 묶음에선 얼굴 버튼에 작은 링이 한 번만 반짝 — 한 번 열면 조용히
   · 앱을 처음 연 사람에게만 인사 카드 한 번 (다시 안 뜸)
   · 대사는 아래 SAY 만 고치면 됨 (화면이 바뀌어도 다시 찍을 필요 없음) */
(function(){
  var IMG = "img/guide.jpg?v=1", BODY = "img/guide_body.jpg?v=1";
  var GRP = {home: "home", market: "mkt", sector: "mkt", prob: "mkt", port: "inv", score: "inv",
             whale: "sig", cup: "sig", gap: "sig", screen: "sig", sigmore: "sig", accum: "sig", danta: "sig",
             bond: "prod", fund: "prod", els: "prod", feed: "feed"};
  var NAME = {intro: "👋 인사", home: "🏠 오늘", mkt: "🌐 시장", inv: "💼 포트", sig: "🎯 신호", prod: "🛍️ 상품", feed: "📰 피드"};
  var SAY = {
    intro: ["안녕하세요! 저는 CH 인베스팅 길잡이예요.", "어려운 투자 이야기, 제가 쉽게 알려 줄게요.", "궁금할 땐 위에 있는 제 얼굴을 눌러 주세요!"],
    home: ["여기는 「오늘」이에요.", "오늘 꼭 알아야 할 것만 한 장에 모았어요.", "카드를 누르면 그 탭으로 바로 가요.", "바쁠 땐 여기만 봐도 돼요!"],
    mkt: ["「시장」에서는 어느 나라, 어느 업종으로 돈이 몰리는지 봐요.", "🌐 시황은 매일 아침 시황 리포트예요.", "🧭 나침반은 한국·미국·일본·중국·홍콩을 한눈에 보여 줘요.", "🎲 시장확률은 오늘 장이 오를 확률이에요!"],
    inv: ["「포트」는 시황 리포트대로 투자했다면 얼마 벌었을지 보여 줘요.", "뭘 얼마나 사야 하는지도 바로 보여요.", "📊 성적표에서는 우리 신호들이 잘 맞았는지 매일 채점해요.", "시장보다 잘했는지 늘 정직하게 비교해요!"],
    sig: ["「신호」에는 차트와 큰손이 보내는 신호가 모여요.", "🐋 고래는 큰 펀드가 새로 산 종목이에요.", "☕ 컵은 컵 모양 차트, 📈 갭은 힘차게 뛰어오른 종목이에요.", "성적이 확인된 신호만 포트에 들어가요!"],
    prod: ["「상품」에서는 채권, 펀드, ELS를 한곳에서 비교해요.", "🏦 채권은 만기 순서로도 볼 수 있어요.", "하루 세 번 새 정보로 바뀌어요!"],
    feed: ["「피드」는 매일 읽는 블로그와 텔레그램 글을 모아 둔 곳이에요.", "주요 뉴스도 15분마다 들어와요.", "중요한 글은 시황 리포트에도 들어가요!"]
  };
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function seen(){ return ls("gd_seen") || {}; }
  function mark(g){ var s = seen(); s[g] = 1; ls("gd_seen", s); }
  function curGrp(){ var k = (typeof cur !== "undefined" && cur) || (window.store && store.tab) || "home"; return GRP[k] || "home"; }

  var css = document.createElement("style");
  css.textContent =
    "#gdbtn{width:28px;height:28px;padding:0;margin:0 0 0 8px;border:1.5px solid var(--line);border-radius:50%;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat;cursor:pointer;position:relative;flex:none;vertical-align:middle}" +
    "#gdbtn.new:after{content:'';position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--acc);animation:gdring 1.6s ease-out 3}" +
    "@keyframes gdring{0%{opacity:.9;transform:scale(.85)}100%{opacity:0;transform:scale(1.35)}}" +
    "#gdq{position:fixed;inset:0;z-index:9998;background:rgba(5,8,14,.55);display:flex;align-items:flex-end;justify-content:center;animation:gdfade .2s ease}" +
    "@keyframes gdfade{from{opacity:0}to{opacity:1}}" +
    "#gdq .gd-sh{width:100%;max-width:560px;background:var(--panel);border:1px solid var(--line);border-bottom:0;border-radius:22px 22px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 14px);animation:gdup .28s cubic-bezier(.2,.8,.2,1)}" +
    "@keyframes gdup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}" +
    "#gdq .gd-row{display:flex;gap:12px;align-items:flex-end}" +
    "#gdq .gd-kid{width:104px;height:170px;flex:none;border-radius:16px;background:#f3e6d6 url(" + BODY + ") center top/cover no-repeat;animation:gdhop 2.4s ease-in-out infinite}" +
    "@keyframes gdhop{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}" +
    "#gdq .gd-bub{flex:1;min-height:150px;background:var(--panel2);border:1px solid var(--line);border-radius:16px 16px 16px 4px;padding:12px 14px;font-size:15px;line-height:1.55;color:var(--text)}" +
    "#gdq .gd-t{font-size:12px;color:var(--sub);margin-bottom:6px}" +
    "#gdq .gd-l{opacity:0;transform:translateY(4px);transition:opacity .35s,transform .35s;margin:0 0 5px}" +
    "#gdq .gd-l.on{opacity:1;transform:none}" +
    "#gdq .gd-ft{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;align-items:center}" +
    "#gdq .gd-ft button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    "#gdq .gd-ft button.on{color:var(--text);border-color:var(--acc)}" +
    "#gdq .gd-x{margin-left:auto;color:var(--text)!important}" +
    "@media (prefers-reduced-motion:reduce){#gdq .gd-kid,#gdbtn.new:after{animation:none}}";
  document.head.appendChild(css);

  var timer = null;
  function open(g){
    close();
    var q = document.createElement("div"); q.id = "gdq";
    var L = SAY[g] || SAY.home;
    q.innerHTML = '<div class="gd-sh" role="dialog" aria-label="꼬마 안내원"><div class="gd-row"><div class="gd-kid" aria-hidden="true"></div><div class="gd-bub"><div class="gd-t">' + NAME[g] + ' 설명</div>' +
      L.map(function(s){ return '<p class="gd-l">' + s + '</p>'; }).join("") + '</div></div><div class="gd-ft">' +
      ["home", "mkt", "inv", "sig", "prod", "feed"].map(function(k){ return '<button data-g="' + k + '"' + (k === g ? ' class="on"' : '') + '>' + NAME[k] + '</button>'; }).join("") +
      '<button class="gd-x">닫기</button></div></div>';
    document.body.appendChild(q);
    var ps = q.querySelectorAll(".gd-l"), i = 0;
    function next(){ if (i < ps.length) ps[i++].classList.add("on"); if (i >= ps.length) { clearInterval(timer); timer = null; } }
    next(); timer = setInterval(next, 1100);
    q.onclick = function(e){
      var b = e.target.closest && e.target.closest("button");
      if (e.target === q || (b && b.classList.contains("gd-x"))) return close();
      if (b && b.dataset.g) return open(b.dataset.g);
      if (timer) { while (i < ps.length) next(); }      // 말풍선을 누르면 남은 줄을 한 번에
    };
    if (g !== "intro") { mark(g); var bt = document.getElementById("gdbtn"); if (bt) bt.classList.remove("new"); }
  }
  function close(){ if (timer) { clearInterval(timer); timer = null; } var q = document.getElementById("gdq"); if (q) q.remove(); }
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") close(); });

  function addBtn(){
    var brand = document.querySelector("header .top .brand"); if (!brand) return;
    var b = document.getElementById("gdbtn");
    if (!b){
      b = document.createElement("button"); b.id = "gdbtn"; b.setAttribute("aria-label", "꼬마 안내원 — 이 화면 설명");
      b.onclick = function(e){ e.stopPropagation(); open(curGrp()); };
      brand.parentNode.insertBefore(b, brand.nextSibling);
    }
    b.classList.toggle("new", !seen()[curGrp()]);
  }
  // 탭을 옮길 때마다 링 상태만 다시 (go 를 감쌈)
  function hook(){
    if (typeof window.go !== "function" || window.go.__gd) return;
    var g0 = window.go;
    window.go = function(){ var r = g0.apply(this, arguments); try { addBtn(); } catch(x) {} return r; };
    window.go.__gd = 1;
  }
  function init(){
    addBtn(); hook();
    if (!ls("gd_intro")) setTimeout(function(){ if (document.getElementById("gdq")) return; ls("gd_intro", 1); open("intro"); }, 1500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  setTimeout(function(){ addBtn(); hook(); }, 900);
  window.gdOpen = open;
})();
