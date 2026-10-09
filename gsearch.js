/* 🔍 어디서든 종목 검색 (10/9) — 헤더 🔍 를 누르고 종목명·코드를 치면 바로 종목리포트로.
   한글 이름·영문·티커·6자리 코드 모두 (종목리포트 검색과 같은 목록 · 약 2만 종목 + ETF) */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function close(){ var o = document.getElementById("gsq"); if (o) o.remove(); document.body.classList.remove("gs-open"); }
  function go(sym){ close(); if (window.openOP) openOP(sym); }
  function open(){
    if (document.getElementById("gsq")) return;
    var o = document.createElement("div"); o.id = "gsq";
    o.innerHTML = '<div class="gs-box"><div class="gs-row"><input id="gsin" type="search" placeholder="종목명·코드 (예: 삼성전자, 엔비디아, 005930, TSLA)" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="gs-x" aria-label="닫기">✕</button></div>' +
      '<div id="gsres" class="gs-res"><div class="gs-hint">종목 목록 불러오는 중…</div></div></div>';
    document.body.appendChild(o); document.body.classList.add("gs-open");
    o.addEventListener("click", function(ev){ if (ev.target === o) close(); });
    o.querySelector(".gs-x").onclick = close;
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres");
    setTimeout(function(){ inp.focus(); }, 30);
    var ready = false;
    (window.opLoadIdx ? opLoadIdx() : Promise.reject()).then(function(){ ready = true; res.innerHTML = '<div class="gs-hint">이름이나 코드를 치면 바로 찾아요 · 엔터 = 첫 번째 종목</div>'; if (inp.value) draw(); })
      .catch(function(){ res.innerHTML = '<div class="gs-hint">목록을 못 불러왔어요. 잠시 뒤 다시.</div>'; });
    function draw(){
      if (!ready) return;
      var q = inp.value.trim(); if (!q){ res.innerHTML = ""; return; }
      var r = opSearch(q).slice(0, 12), FL = window.FLAG || {};
      res.innerHTML = r.length ? r.map(function(x){
        return '<button data-s="' + e(x.sym) + '">' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b>' + (x.etf ? ' <span class="gs-etf">ETF</span>' : '') +
          '<small>' + e(window.V && V.cd ? V.cd(x.sym) : x.sym) + (x.built ? '' : ' · 준비 중') + '</small></button>'; }).join("")
        : '<div class="gs-hint">「' + e(q) + '」 — 찾는 종목이 없어요</div>';
      [].forEach.call(res.querySelectorAll("button[data-s]"), function(b){ b.onclick = function(){ go(b.dataset.s); }; });
    }
    inp.oninput = draw;
    inp.onkeydown = function(ev){
      if (ev.key === "Escape") close();
      if (ev.key === "Enter" && ready){ var r = opSearch(inp.value.trim())[0]; if (r) go(r.sym); }
    };
  }
  window.gsOpen = open;
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
    ".gs-res button:active{background:var(--panel2)}.gs-res small{display:block;color:var(--sub);font-size:12px;margin-top:1px}" +
    ".gs-etf{font-size:10.5px;background:#5ac8fa;color:#111;border-radius:5px;padding:0 5px;font-weight:800}.gs-hint{padding:14px;color:var(--sub);font-size:13.5px}";
  document.head.appendChild(css);
})();
