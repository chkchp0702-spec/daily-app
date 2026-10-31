/* ☀️ 오늘 한 장 카드 (10/28 사용자 「PB 한 장 → 오늘 한 장」으로 이름 바꿈) · 옛 이름 👔 PB 한 장 (10/28 사용자 「1·2번 내용은 장중 한 시간마다 갱신 · 알람은 그대로」)
   pbbrief.py 가 아침 1번 + 장중 매시간 쓰는 archive/x/pbbrief.json → 🏠 오늘 날씨판 바로 아래 카드. 10분마다 새 글이면 바꿔 그림.
   「📨 고객에게」 를 누르면 이 글로 「지금 시장 한 장」 그림을 만들어 공유(onepage.js). 알림(푸시)은 아침 한 번뿐. */
(function(){
  var P = null, at = 0;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function load(force){
    if (!force && P && Date.now() - at < 10 * 60e3) return Promise.resolve(P);
    at = Date.now();
    return fetch("archive/x/pbbrief.json?" + Math.floor(Date.now() / 300000)).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if (j) P = j; return P; }).catch(function(){ return P; });
  }
  window.__pbbrief = function(){ return load(); };
  function html(j){
    var old = j.asof && j.asof.slice(0, 10) !== kst();
    return '<section class="card pbc no-clp" id="pbcard" data-xc="1" data-cz="done" data-sig="' + e(j.at || "") + '"><h3>☀️ 오늘 한 장 <span class="mut">' + e(j.label || "") + (old ? ' · 지난 자료' : '') + '</span></h3>' +
      (j.regime ? '<div class="pb-reg">🧭 ' + e(j.regime) + (j.one ? ' — ' + e(j.one) : '') + '</div>' : '') +
      '<div class="pb-talk"><small>' + (j.mode === "주말" || j.mode === "휴장" ? "🗓 지난 장 마감 정리" : "💬 고객에게 할 말") + '</small>' + (j.talk || []).map(function(t){ return '<p>· ' + e(t) + '</p>'; }).join("") + '</div>' +
      (j.events && j.events.length ? '<div class="pb-ev">📅 ' + e(j.events.join(" · ")) + '</div>' : '') +
      '<div class="pb-ft"><button type="button" data-pbsend="1">📨 이 내용 보내기</button><span class="mut">' + (j.mode === "주말" || j.mode === "휴장" ? "장이 쉬는 날엔 마지막 마감으로 정리해요" : "장중 매시간 새로 써요 · 알림은 아침 한 번") + '</span></div></section>';
  }
  function mount(){
    var b = document.getElementById("hmbody"); if (!b) return;
    load().then(function(j){
      var b2 = document.getElementById("hmbody"), old = document.getElementById("pbcard"); if (!b2) return;
      if (!j || !(j.talk || []).length){ if (old) old.remove(); return; }
      if (old){ if (old.dataset.sig !== (j.at || "")) old.outerHTML = html(j); return; }
      var hero = b2.querySelector(":scope > #tdhero, :scope > .hero"), box = document.createElement("div"); box.innerHTML = html(j); var c = box.firstChild;
      if (hero && hero.nextSibling) b2.insertBefore(c, hero.nextSibling); else b2.insertBefore(c, b2.firstChild);
    });
  }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-pbsend]"); if (!t) return; ev.stopPropagation(); if (window.__onepage) (__onepage.chooser || __onepage.go)(null); }, true);
  var css = document.createElement("style");
  css.textContent = ".pbc{border:1.5px solid rgba(124,156,255,.45)!important}.pb-reg{font-size:13px;color:var(--sub,#aab);margin:0 0 8px;line-height:1.45}" +
    ".pb-talk small{display:block;font-size:12px;color:var(--mut,#8a94a8);margin-bottom:4px}.pb-talk p{margin:0 0 6px;font-size:14.5px;line-height:1.5;word-break:keep-all}" +
    ".pb-ev{font-size:13px;color:var(--text);background:var(--panel2);border-radius:10px;padding:7px 10px;margin-top:4px;line-height:1.45}" +
    ".pb-ft{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap;font-size:12px}.pb-ft button{font:inherit;font-size:13px;font-weight:700;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { mount(); } catch(x) {} }, 350); }
  try { new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t && t.closest && t.closest("#pbcard")) return; } soon(); }).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (!document.hidden){ at = 0; mount(); } }, 10 * 60e3);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden){ at = 0; mount(); } });
  soon();
})();
