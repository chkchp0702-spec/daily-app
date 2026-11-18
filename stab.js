/* 🛡 11/18 안정도 (사용자 「어플 안정도를 좀 높여 포괄적으로」) — 묶음 맨 끝에서 읽힘
   ① 화면 그리기 보호: go()(탭 열기)가 그리다 오류를 내면 전엔 화면이 반쯤 그려진 채 멈추거나 비었음
      → 오류를 수집(early.js chErr)하고, 맨 위에 「⚠ 이 화면 일부를 못 그렸어요 · 다시 그리기」 띠. 이미 그려진 것은 그대로 둠.
   ② 끝없는 「불러오는 중…」 막기: 화면에 보이는 「불러오는 중」이 30초 넘게 그대로면 「⏳ 오래 걸려요 · 다시 시도」 단추로 바꿈
      (자료가 안 오거나 그리기가 중간에 멈춘 경우 — 전엔 하염없이 돌았음).
   ③ 화면 지킴이 반복 오류 막기: 모든 보정 스크립트는 그대로 */
(function(){
  if (typeof window.go !== "function" || window.go.__stab) return;
  var G = window.go;
  function bar(msg){
    var m = document.getElementById("main"); if (!m) return;
    var old = document.getElementById("stabbar"); if (old) old.remove();
    var b = document.createElement("div"); b.id = "stabbar";
    b.style.cssText = "margin:8px 12px;padding:10px 12px;border-radius:12px;background:rgba(255,170,0,.14);border:1px solid rgba(255,170,0,.45);font-size:13px;line-height:1.45";
    b.innerHTML = "⚠ " + msg + ' <button type="button" class="btn" style="margin-left:6px">다시 그리기</button>';
    b.querySelector("button").onclick = function(){ b.remove(); try { if (window.getJSONdrop) getJSONdrop(); G(window.cur, (typeof curDate !== "undefined" && window.M && M.cats && M.cats[window.cur]) ? curDate : undefined); } catch(e) { location.reload(); } };
    m.insertBefore(b, m.firstChild);
  }
  var guarded = function(key, id){
    try { return G.apply(this, arguments); }
    catch(e){
      if (window.chErr) chErr("render", (e && e.message) || e, (e && e.stack && (/([^\/\s(]+\.js)/.exec(e.stack) || [])[1]) || "", " · " + key);
      try { bar("이 화면 일부를 못 그렸어요"); } catch(z) {}
    }
  };
  guarded.__stab = 1;
  try { window.go = guarded; go = guarded; } catch(e) {}

  // ② 「불러오는 중」 지킴이
  var seen = typeof WeakMap === "function" ? new WeakMap() : null;
  if (!seen) return;
  setInterval(function(){
    if (document.hidden) return;
    var L = document.querySelectorAll("#main .loading, #main .ez-skel, #main .wow-sk, #main .ez-ph"), now = Date.now();   // 🛡 11/18 16시: 회색 뼈대·「불러오는 중」 글자도
    for (var i = 0; i < L.length; i++){
      var el = L[i]; if (!el.offsetParent || el.__stabDone) continue;
      var t = seen.get(el); if (!t){ seen.set(el, now); continue; }
      if (now - t < 25000) continue;
      el.__stabDone = 1;
      if (window.chErr) chErr("stuck", "30초 넘게 불러오는 중", "", " · " + (window.cur || "") + " · " + String(el.textContent || "").slice(0, 20));
      el.innerHTML = '⏳ 오래 걸려요 (인터넷이 느리거나 자료가 아직 없어요) <button type="button" class="btn" style="margin-left:6px">다시 시도</button>';
      el.querySelector("button").onclick = function(){ try { if (window.getJSONdrop) getJSONdrop(); G(window.cur, (typeof curDate !== "undefined" && window.M && M.cats && M.cats[window.cur]) ? curDate : undefined); } catch(e) { location.reload(); } };
    }
  }, 3000);
})();
