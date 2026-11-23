/* 📨 11/23 A11/23-1 「한 장은 '오늘 실제로 나갈 그림'으로 연다」 — 사용자 「네 추천대로」
   근거(집계 11/18~20): 📨 한 장 화면 477번 열림 · 「고객에게 한 장 보내기」 누름 53(13%) · 228번은 5초 안에 떠남 — 첫 칸이 홈과 똑같은 결론 카드 복사본이고 그림은 누르기 전엔 못 봤음
   ① 📨 한 장 화면 첫 칸 = 보내기를 누르면 실제로 만들어지는 1080px 「시장 한 장」(onepage.js mkMarket → draw)을 열자마자 그림으로 · 밑에 단추 하나 「📨 보내기」
      받는 분 칸(넣으면 그림 맨 위 「○○ 고객님께」가 바로 다시 그려짐 · 최근 8명 칩 · 보낸 뒤 비움 — onepage.js 원칙 그대로) · 그림을 누르면 크게(확대·스크롤)
      고객 질문 25개 · 「다른 것도 한 장으로」는 접은 채(머리를 누르면 펼침)
      자료를 못 받으면 예전 첫 칸(결론 상자 + 보내기 단추)으로 그대로
   ② 홈 「▾ 오늘 자세히 보기」 안 🛡 카드의 「오늘의 결론」 상자는 맨 위 신호등 상자와 글자까지 같아 숨김 · 대신 신호등 상자 안 결론 두 줄 밑에 「포트는 해외 ETF 위주…」 꼬리 문구를 보이게(같은 카드 세 번 → 한 번)
   끄기: index.html 📦list 에서 이 줄을 빼면 전부 예전대로 */
(function(){
  var D = document;
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function toast(m){ var d = D.createElement("div"); d.className = "ch-toast"; d.textContent = m; D.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2800); }
  function OP(){ var o = window.__onepage; return o && o._mkMarket && o._safeDraw && o._share && o._client ? o : null; }

  /* ═════════ ① 📨 한 장 화면 — 첫 칸을 실제 그림으로 ═════════ */
  var CACHE = {C: null, at: 0, cv: null, cl: "", nm: ""};   // 시장 자료 C 는 2분, 그림은 받는 분·보내는 사람이 같으면 재사용
  function firstCard(){
    var o = OP(), nm = o ? o._pbname() : "", R = o ? o._cliRecent() : [];
    return '<section class="card hub-c x23-c" data-cz="done" data-xc="1" data-noemo="1">' +
      '<p class="hub-h">고객에게 한 장 <small id="x23st">오늘 그림 만드는 중…</small></p>' +
      '<div class="x23-pv" id="x23pv" role="button" aria-label="그림 크게 보기"><div class="x23-sk"><i></i><i></i><i></i></div></div>' +
      '<label class="x23-n">💌 받는 분 <input id="x23cl" maxlength="20" placeholder="고객 이름 (비워도 돼요)" autocomplete="off" enterkeyhint="done"></label>' +
      (R.length ? '<div class="x23-rc">' + R.map(function(n){ return '<button type="button" data-x23cl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<button type="button" class="hub-cta x23-go" id="x23go" disabled>📨 보내기</button>' +
      '<p class="hub-n x23-f"><span id="x23nm">' + (nm ? '보내는 사람 ' + e(nm) : '보내는 사람 없음') + '</span> <button type="button" class="x23-lk" data-x23="nm">바꾸기</button> · <button type="button" class="x23-lk" data-x23="more">⭐ 종목·상품도 같이 보내기 ›</button></p>' +
      '</section>';
  }
  var V0 = window.hubView, I0 = window.hubInit;
  window.hubView = function(key){
    var h = V0 ? V0(key) : "";
    if (key !== "send" || !h || !OP()) return h;
    var a = h.indexOf('<section class="card hub-c" data-cz="done"><p class="hub-h">고객에게 한 장</p>'); if (a < 0) return h;
    var b = h.indexOf("</section>", a); if (b < 0) return h;
    h = h.slice(0, a) + firstCard() + h.slice(b + 10);
    // 나머지 두 카드(고객 질문 · 다른 것도 한 장으로)는 접은 채 — 머리는 보이고 누르면 펼침
    h = h.replace(/<section class="card hub-c" data-cz="done"><p class="hub-h">(고객이 이렇게 물으면|다른 것도 한 장으로)/g, '<section class="card hub-c" data-cz="done" data-x23fold="1"><p class="hub-h x23-th">$1');
    h = h.replace(/(<p class="hub-h x23-th">[^<]*(?:<small[^>]*><\/small>)?)<\/p>/g, '$1<i class="x23-car">▾</i></p>');
    return h;
  };
  window.hubInit = function(key){
    if (I0) I0(key);
    if (key !== "send" || !D.getElementById("x23pv")) return;
    bind(); build();
  };
  function bind(){
    var o = OP(); if (!o) return;
    o._client("");
    var I = D.getElementById("x23cl"), T = null;
    if (I) I.addEventListener("input", function(){ var v = I.value.trim().slice(0, 20); o._client(v); chips(); clearTimeout(T); T = setTimeout(function(){ paint(); }, 450); });
    if (I) I.addEventListener("keydown", function(ev){ if (ev.key === "Enter"){ I.blur(); } });
  }
  function chips(){ var o = OP(), v = o ? o._client() : ""; [].forEach.call(D.querySelectorAll("[data-x23cl]"), function(b){ b.classList.toggle("on", b.dataset.x23cl === v); }); }
  function st(t){ var s = D.getElementById("x23st"); if (s) s.textContent = t; }
  function fallback(){   // 자료를 못 받음 → 예전 첫 칸(결론 상자 + 예전 보내기 길)
    var pv = D.getElementById("x23pv"), g = D.getElementById("x23go"); if (!pv) return;
    pv.innerHTML = '<div data-vd></div>'; pv.classList.add("x23-fb"); st("오늘 그림은 잠시 뒤 — 결론은 아래");
    if (g){ g.disabled = false; g.textContent = "📨 고객에게 한 장 보내기"; g.dataset.fb = "1"; }
  }
  function build(){
    var o = OP(); if (!o){ fallback(); return; }
    var now = Date.now(), p = CACHE.C && now - CACHE.at < 120000 ? Promise.resolve(CACHE.C) : o._mkMarket().then(function(C){ if (C && !C.refuse){ CACHE.C = C; CACHE.at = Date.now(); } return C; });
    var t0 = Date.now();
    p.then(function(C){
      if (cur() !== "send" || !D.getElementById("x23pv")) return;
      if (!C || C.refuse){ fallback(); return; }
      paint(); st((C.title || "오늘 시장 한 장") + " · " + (C.label || ""));
    }).catch(function(x){ console.warn(x); fallback(); });
  }
  function paint(){   // 자료 C 로 1080px 그림을 그려 첫 칸에 — 받는 분·보내는 사람이 같으면 그린 것 재사용
    var o = OP(), C = CACHE.C, pv = D.getElementById("x23pv"), g = D.getElementById("x23go"); if (!o || !C || !pv) return;
    var cl = o._client(), nm = o._pbname();
    var cv = CACHE.cv && CACHE.cl === cl && CACHE.nm === nm && CACHE.cv.width ? CACHE.cv : null;
    if (!cv){ try { cv = o._safeDraw(C, nm); } catch(x){ console.warn(x); fallback(); return; } CACHE.cv = cv; CACHE.cl = cl; CACHE.nm = nm; }
    if (pv.firstChild !== cv){ pv.innerHTML = ""; pv.appendChild(cv); pv.classList.remove("x23-fb"); }
    if (g){ g.disabled = false; g.textContent = cl ? "📨 " + cl + " 고객님께 보내기" : "📨 보내기"; delete g.dataset.fb; }
  }
  function send(){
    var o = OP(), g = D.getElementById("x23go"); if (!o) return;
    if (g && g.dataset.fb){ (o.chooser || o.go)(null); return; }   // 예전 길
    var C = CACHE.C, cv = CACHE.cv; if (!C || !cv || !cv.width){ build(); return; }
    var fresh; try { fresh = o._safeDraw(C, o._pbname()); } catch(x){ fresh = cv; }   // 보내는 건 새로 구움(미리보기 캔버스는 화면에 남김)
    toast("한 장 준비 중…");
    var p = o._share(fresh, C.title); o._cliDone();
    var I = D.getElementById("x23cl"); if (I){ I.value = ""; } chips(); CACHE.cv = null;   // 보낸 뒤 받는 분은 비움(다른 고객에게 잘못 가지 않게) → 다음 그림은 이름 없이
    if (p && p.then) p.then(function(){ setTimeout(paint, 200); }, function(x){ console.warn(x); toast("만들지 못했어요"); });
  }
  function big(){   // 그림을 누르면 크게 — 가로 2배 · 손가락으로 끌어 봄
    var cv = CACHE.cv; if (!cv || !cv.width) return;
    var old = D.getElementById("x23big"); if (old) old.remove();
    var box = D.createElement("div"); box.id = "x23big"; box.className = "no-clp"; box.setAttribute("data-cz", "done");
    var url; try { url = cv.toDataURL("image/jpeg", 0.85); } catch(x){ return; }
    box.innerHTML = '<div class="x23-bs"><img src="' + url + '" alt="오늘 시장 한 장"></div><button type="button" class="x23-bx">✕ 닫기</button>';
    box.addEventListener("click", function(ev){ if (ev.target.closest(".x23-bx") || ev.target === box) box.remove(); });
    D.body.appendChild(box);
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#x23go,[data-x23cl],[data-x23],#x23pv,.x23-th"); if (!t) return;
    ev.stopPropagation();
    if (t.id === "x23go"){ send(); return; }
    if (t.id === "x23pv"){ if (!t.classList.contains("x23-fb")) big(); return; }
    if (t.dataset.x23cl != null){ var I = D.getElementById("x23cl"), on = (OP() ? OP()._client() : "") !== t.dataset.x23cl; if (I){ I.value = on ? t.dataset.x23cl : ""; I.dispatchEvent(new Event("input")); } return; }
    if (t.dataset.x23 === "nm"){ var o = OP(), n = prompt("한 장 위에 넣을 내 이름 (예: 김OO PB · 비워도 돼요)", o ? o._pbname() : ""); if (n == null) return; try { localStorage.setItem("pbname", n.trim().slice(0, 30)); } catch(x) {} var s = D.getElementById("x23nm"); if (s) s.textContent = n.trim() ? "보내는 사람 " + n.trim().slice(0, 30) : "보내는 사람 없음"; CACHE.cv = null; paint(); return; }
    if (t.dataset.x23 === "more"){ var o2 = OP(); if (o2) (o2.chooser || o2.go)(null); return; }
    if (t.classList.contains("x23-th")){ var c = t.parentNode; if (c.hasAttribute("data-x23fold")) c.removeAttribute("data-x23fold"); else c.setAttribute("data-x23fold", "1"); return; }
  }, true);

  /* ═════════ ② 홈 — 자세히 보기 안 같은 결론 상자 숨김 · 신호등 상자 꼬리 문구 보이기 ═════════ */
  var st_ = D.createElement("style");
  st_.textContent =
    "#ezhero ~ #hmbody .h2-num > [data-vd]{display:none!important}" +
    "#ezhero .vd-mini .vd-n{display:block!important;margin:6px 0 0;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all;opacity:.9}" +
    /* 한 장 화면 */
    ".x23-c .hub-h small{font-weight:500}" +
    ".x23-pv{position:relative;margin:2px 0 10px;border-radius:14px;overflow:auto;-webkit-overflow-scrolling:touch;max-height:min(62vh,540px);background:#f7f7f5;border:1px solid var(--line);min-height:200px;cursor:zoom-in}.x23-pv:not(.x23-fb):after{content:'아래로 끌면 더 · 누르면 크게';position:sticky;bottom:0;display:block;text-align:center;font-size:11.5px;padding:22px 0 6px;color:#555;background:linear-gradient(rgba(247,247,245,0),rgba(247,247,245,.95) 55%);pointer-events:none}" +
    ".x23-pv canvas{display:block;width:100%;height:auto}.x23-pv.x23-fb{background:transparent;border:0;cursor:default;min-height:0}.x23-pv.x23-fb .vd{margin:0}" +
    ".x23-sk{padding:18px 16px}.x23-sk i{display:block;height:14px;border-radius:7px;background:rgba(127,127,127,.18);margin:0 0 12px;animation:x23p 1.2s infinite}.x23-sk i:nth-child(2){width:70%}.x23-sk i:nth-child(3){width:45%}" +
    "@keyframes x23p{0%,100%{opacity:.5}50%{opacity:1}}" +
    ".x23-n{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub);margin:0 0 8px}.x23-n input{flex:1;min-width:0;font:inherit;font-size:15px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text)}" +
    ".x23-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 10px}.x23-rc button{font:inherit;font-size:13px;font-weight:700;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text)}.x23-rc button.on{border-color:var(--acc,#7c9cff);background:rgba(124,156,255,.18)}" +
    ".x23-go:disabled{opacity:.5}.x23-f{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px}.x23-lk{font:inherit;font-size:12.5px;color:var(--sub);background:none;border:0;padding:0;text-decoration:underline;text-underline-offset:2px}" +
    ".hub-c[data-x23fold] > :not(.x23-th){display:none!important}.x23-th{cursor:pointer;position:relative;padding-right:22px}.x23-th .x23-car{position:absolute;right:0;top:0;font-style:normal;color:var(--sub);font-size:14px}.hub-c:not([data-x23fold]) .x23-th .x23-car{transform:rotate(180deg)}" +
    "#x23big{position:fixed;inset:0;z-index:100004;background:rgba(0,0,0,.88);display:flex;flex-direction:column}.x23-bs{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 10px) 10px 10px}.x23-bs img{display:block;width:200%;max-width:none;border-radius:8px}" +
    ".x23-bx{flex:none;margin:8px 16px calc(env(safe-area-inset-bottom) + 14px);font:inherit;font-size:15px;font-weight:800;padding:12px;border-radius:14px;border:0;background:#fff;color:#141a26}";
  D.head.appendChild(st_);
})();
