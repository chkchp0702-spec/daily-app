/* CH Investing — 🪟 매끄럽게 열고 닫기 (10/15)
   사용자: "누르는 칸이나 탭이 있으면 매끄럽게 연결하고 다시 닫을 수 있게"
   ① 카드·줄·칩을 누르면(data-goto) 지금 화면은 그대로 두고, 그 화면을 아래에서 올라오는 「창」으로 연다.
      닫기 = ✕ · 위 손잡이를 아래로 끌기 · 바깥(어두운 곳) 누르기 · 휴대폰 뒤로가기 · 오른쪽 아래 「뒤로」 → 보던 자리 그대로.
      창 안에서 「전체 화면 ⤢」 를 누르면 그 탭으로 완전히 넘어감.
   ② 아래 탭 바·위 작은 탭으로 화면을 바꿀 때 살짝 밀려 들어오는 움직임.
   창 속은 같은 앱을 ?embed=1 로 연 것 (머리·아래 탭 없이) — 화면 코드를 따로 고칠 필요 없음. */
(function(){
  var EMBED = /[?&]embed=1/.test(location.search);
  var D = document.documentElement;

  /* ---------- 창 안 (embed) ---------- */
  if (EMBED){
    D.classList.add("embed");
    var s = document.createElement("style");
    s.textContent = ".embed header,.embed #bnav,.embed #backbtn,.embed #tabs,.embed .tabs,.embed #netbar,.embed .a2hs{display:none!important}" +
      ".embed body{padding-top:6px!important;padding-bottom:30px!important}.embed #main{padding-top:0!important;margin-top:0!important}" +
      ".embed #main > .hero{display:none!important}";
    document.head.appendChild(s);
    // 창 안에서 또 누르면 창 안에서 그대로 이동 (창을 겹겹이 열지 않음) · 부모에 제목 알려 주기
    var tell = function(){ try { parent.postMessage({peek: "title", t: (document.querySelector("#main > .hero h1") || {}).textContent || ""}, "*"); } catch(x) {} };
    new MutationObserver(function(){ clearTimeout(tell.t); tell.t = setTimeout(tell, 120); }).observe(document.body || D, {childList: true, subtree: true});
    return;
  }

  /* ---------- ① 창 ---------- */
  var LAB = {home: "🏠 오늘", market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", port: "💼 포트", score: "📊 성적표",
             whale: "🐋 고래", cup: "☕ 컵", gap: "📈 갭", screen: "🔎 거르기", feed: "📰 피드", accum: "🤫 매집", danta: "⚡ 단타", alarm: "🔔 알림", idea: "💬 의견함", onepager: "📄 종목"};
  var PK = null, SAVED = null;
  function peekOpen(target){
    if (PK) return;
    var p = target.split("~"), tab = p[0];
    var wrap = document.createElement("div");
    wrap.id = "peek";
    wrap.innerHTML = '<div class="pk-bg"></div><div class="pk-sh"><div class="pk-top"><i class="pk-grip"></i>' +
      '<b class="pk-t">' + (LAB[tab] || "") + '</b><button type="button" class="pk-full">전체 화면 ⤢</button><button type="button" class="pk-x" aria-label="닫기">✕</button></div>' +
      '<div class="pk-load"><i></i></div><iframe class="pk-f" src="index.html?embed=1#' + encodeURIComponent(tab) + (p[1] ? "~" + encodeURIComponent(p[1]) : "") + '"></iframe></div>';
    document.body.appendChild(wrap);
    D.classList.add("peek-on");
    var f = wrap.querySelector(".pk-f");
    f.addEventListener("load", function(){ setTimeout(function(){ wrap.classList.add("ready"); }, 250); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ wrap.classList.add("on"); }); });
    PK = {el: wrap, target: target};
    // 휴대폰 뒤로가기로 닫히게: 지금 기록을 「창 아래」로 표시해 두고 창 기록 하나를 얹음
    try {
      SAVED = history.state;
      history.replaceState(Object.assign({}, SAVED || {}, {t: "xs", _pk: 1}), "");
      history.pushState({t: "peek", d: ((SAVED && SAVED.d) || 0) + 1}, "", location.pathname + location.hash);
    } catch(x) {}
    wrap.querySelector(".pk-x").onclick = function(){ peekClose(); };
    wrap.querySelector(".pk-bg").onclick = function(){ peekClose(); };
    wrap.querySelector(".pk-full").onclick = function(){ var t = PK.target; peekClose(true, function(){ var q = t.split("~"); if (window.goTo) goTo(q[0], q[1]); else go(q[0]); }); };
    drag(wrap.querySelector(".pk-top"), wrap.querySelector(".pk-sh"));
  }
  function peekClose(fromNav, after){
    if (!PK) return;
    var el = PK.el; PK = null;
    el.classList.remove("on"); D.classList.remove("peek-on");
    setTimeout(function(){ el.remove(); if (after) after(); }, 260);
    if (!fromNav || fromNav === true){
      // 얹은 기록 하나를 걷어 냄 (뒤로가기 한 번 = 창 닫힘)
      try { if (history.state && history.state.t === "peek"){ history.back(); } } catch(x) {}
    }
  }
  window.addEventListener("popstate", function(ev){
    if (PK){ peekClose("nav"); }
    if (ev.state && ev.state._pk){                    // 창 아래 기록으로 돌아옴 → 원래 기록으로 되돌려 둠 (화면은 그대로)
      try { history.replaceState(SAVED, ""); } catch(x) {}
      if (window.updBack) try { updBack(); } catch(x) {}
    }
  });
  // 손잡이를 아래로 끌어 닫기
  function drag(handle, sheet){
    var y0 = null, dy = 0;
    handle.addEventListener("touchstart", function(e){ y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = "none"; }, {passive: true});
    handle.addEventListener("touchmove", function(e){ if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = "translateY(" + dy + "px)"; }, {passive: true});
    handle.addEventListener("touchend", function(){ sheet.style.transition = ""; if (dy > 90) peekClose(); else sheet.style.transform = ""; y0 = null; });
  }
  // 창 안 제목
  window.addEventListener("message", function(ev){ if (!PK || !ev.data || ev.data.peek !== "title" || !ev.data.t) return; var t = PK.el.querySelector(".pk-t"); if (t) t.textContent = ev.data.t.trim(); });
  // 「뒤로」 버튼도 창부터 닫기
  function wrapBack(){ var cur_ = window.goBack; if (cur_ && !cur_.__pk){ var w = function(){ if (PK){ peekClose(); return; } return cur_.apply(this, arguments); }; w.__pk = 1; window.goBack = w; } }
  wrapBack(); window.addEventListener("load", function(){ setTimeout(wrapBack, 300); });

  // 카드·줄·칩 누르기 → 창 (종목 이름 data-op 은 지금처럼 종목 화면) · 같은 탭 안 이동은 그대로
  document.addEventListener("click", function(ev){
    if (ev.defaultPrevented || !ev.target.closest) return;
    if (ev.target.closest("[data-op], a[href], input, select, label, textarea, [data-share], .hm-sh")) return;
    var t = ev.target.closest("[data-goto]"); if (!t) return;
    // 10/19: 카드 안의 단추·링크(접기·펼치기·전체 보기 등)를 누르면 카드 전체 이동(data-goto)을 하지 않음
    var ctl = ev.target.closest("button,a,summary,input,select,label,.fold"); if (ctl && !ctl.hasAttribute("data-goto") && t !== ctl && t.contains(ctl)) return;
    var btn = ev.target.closest("button");
    if (btn && btn !== t && !btn.hasAttribute("data-goto") && t.contains(btn)) return;     // 카드 안 자기 버튼(👍·공유 등)은 그대로
    var g = t.getAttribute("data-goto") || ""; var tab = g.split("~")[0];
    if (!tab || tab === window.cur) return;                       // 같은 탭 안 → 원래대로 (그 카드로 스크롤)
    if (t.closest(".ttx,.tip,#sheet")) return;                    // 설명 풍선·옛 시트 안 링크는 원래대로
    ev.preventDefault(); ev.stopPropagation();
    peekOpen(g);
  }, true);

  /* ---------- ② 탭 바꿀 때 밀려 들어오는 움직임 ---------- */
  var ORDER = ["home", "market", "sector", "prob", "port", "score", "whale", "cup", "gap", "screen", "feed"];
  function hookGo(){
    if (typeof window.go !== "function" || window.go.__pk) return;
    var g0 = window.go;
    var w = function(key){
      var from = window.cur, r = g0.apply(this, arguments);
      try {
        var m = document.getElementById("main");
        if (m && from && from !== key){
          var dir = ORDER.indexOf(key) >= ORDER.indexOf(from) ? 1 : -1;
          m.style.setProperty("--pk-dx", (dir * 22) + "px");
          m.classList.remove("pg-in"); void m.offsetWidth; m.classList.add("pg-in");
        }
      } catch(x) {}
      return r;
    };
    w.__pk = 1; window.go = w;
  }
  hookGo(); window.addEventListener("load", hookGo);

  var st = document.createElement("style");
  st.textContent =
    "#peek{position:fixed;inset:0;z-index:9000;pointer-events:none}" +
    "#peek .pk-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);opacity:0;transition:opacity .25s;pointer-events:auto}" +
    "#peek.on .pk-bg{opacity:1}" +
    "#peek .pk-sh{position:absolute;left:0;right:0;bottom:0;height:92vh;height:92dvh;background:var(--bg);border-radius:18px 18px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.35);transform:translateY(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto}" +
    "#peek.on .pk-sh{transform:translateY(0)}" +
    "#peek .pk-top{position:relative;display:flex;align-items:center;gap:8px;padding:16px 12px 10px;border-bottom:1px solid var(--line);touch-action:none}" +
    "#peek .pk-grip{position:absolute;left:50%;top:6px;width:38px;height:5px;margin-left:-19px;border-radius:3px;background:var(--line)}" +
    "#peek .pk-t{flex:1;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "#peek .pk-full{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:6px 11px;font:inherit;font-size:12.5px;font-weight:700}" +
    "#peek .pk-x{width:34px;height:34px;border-radius:50%;border:0;background:var(--panel2,var(--panel));color:var(--text);font-size:16px;font-weight:700}" +
    "#peek .pk-f{flex:1;width:100%;border:0;background:var(--bg);opacity:0;transition:opacity .2s}" +
    "#peek.ready .pk-f{opacity:1}#peek.ready .pk-load{display:none}" +
    "#peek .pk-load{position:absolute;top:50%;left:50%;width:28px;height:28px;margin:-14px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--acc,#7c9cff);animation:pkspin .8s linear infinite}" +
    "@keyframes pkspin{to{transform:rotate(360deg)}}" +
    ".peek-on body{overflow:hidden}" +
    "#main.pg-in{animation:pgin .24s cubic-bezier(.2,.8,.2,1)}" +
    "@keyframes pgin{from{opacity:.0;transform:translateX(var(--pk-dx,16px))}to{opacity:1;transform:none}}" +
    // 누를 수 있는 것은 누를 때 살짝 눌림 — 연결된다는 느낌
    "[data-goto],.hm-chi,.hm-c,.sc-c{transition:transform .12s,background-color .12s;-webkit-tap-highlight-color:transparent}" +
    "[data-goto]:active,.hm-chi:active{transform:scale(.985);background-color:color-mix(in srgb,var(--acc,#7c9cff) 8%,transparent)}" +
    "@media (prefers-reduced-motion: reduce){#main.pg-in{animation:none}#peek .pk-sh{transition:none}}";
  document.head.appendChild(st);
})();
