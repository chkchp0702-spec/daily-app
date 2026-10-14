/* CH Investing — 🎞 아침 30초 스토리 (10/14 A9-4, 사용자 「다 해 보자」)
   홈 날짜 줄의 「▶ 30초」 → 전체 화면에 카드 한 장씩: 어제 결과 → 포트 → 킥 → 오늘 집중 → 🔮 오늘 예고
   · 위에 진행 막대(장 수만큼) · 화면 오른쪽 톡 = 다음, 왼쪽 톡 = 앞 · 6초 자동 넘김 · 마지막 장에 📤 공유
   · 넘기기는 「톡」만(아이폰 가장자리 스와이프 = 뒤로가기와 안 부딪히게) · ✕ 로 닫음 · 홈 카드 HTML 을 그대로 복사하니 새 자료 없음 */
(function(){
  var SEC = 6000, timer = null, idx = 0, pages = [], box = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function pick(){
    var b = document.getElementById("hmbody"); if (!b) return [];
    var out = [], q = function(sel){ return b.querySelector(sel); };
    var grade = q('section[data-goto="market"]'), port = q('section[data-goto="port~pohero"]'), kick = q('section[data-goto="port~pokick"]'), focus = q('section[data-goto="market~mkfo"]');
    if (grade){ var g = grade.cloneNode(true); var wn = g.querySelector(".hm-wn"); if (wn) wn.remove(); var vs = g.querySelector(".hm-vs"); if (vs) vs.remove(); out.push({t: "어제 예고 → 오늘 결과", el: g}); }
    if (port) out.push({t: "포트", el: port.cloneNode(true)});
    if (kick) out.push({t: "킥", el: kick.cloneNode(true)});
    if (focus) out.push({t: "오늘 집중", el: focus.cloneNode(true)});
    if (grade){ var wn2 = grade.querySelector(".hm-wn"); if (wn2){ var s = document.createElement("section"); s.className = "card hm-c";
      s.innerHTML = '<div class="hm-h"><span class="hm-i">🔮</span><div><b>오늘의 예고</b><small>내일 아침 채점 · 👍👎 로 내 표도</small></div></div>'; s.appendChild(wn2.cloneNode(true)); out.push({t: "오늘의 예고", el: s}); } }
    out.forEach(function(p){ [].forEach.call(p.el.querySelectorAll(".hm-sh, .hm-go"), function(x){ x.remove(); }); p.el.removeAttribute("data-goto"); });
    return out;
  }
  function draw(){
    var p = pages[idx]; if (!p) return close();
    box.querySelector(".st-bar").innerHTML = pages.map(function(_, i){ return '<i class="' + (i < idx ? "done" : i === idx ? "on" : "") + '"></i>'; }).join("");
    var body = box.querySelector(".st-body"); body.innerHTML = ""; body.appendChild(p.el.cloneNode(true)); body.scrollTop = 0;
    box.querySelector(".st-n").textContent = (idx + 1) + " / " + pages.length + " · " + p.t;
    var ft = box.querySelector(".st-ft"); ft.innerHTML = idx === pages.length - 1 ? '<button class="hm-sh" data-share="port">📤 카톡으로 공유</button><button class="st-done">다 봤어요 ✓</button>' : '<span class="mut">화면을 톡 치면 다음 · 왼쪽은 앞</span>';
    var dn = ft.querySelector(".st-done"); if (dn) dn.onclick = function(ev){ ev.stopPropagation(); close(); };
    arm();
  }
  function arm(){ clearTimeout(timer); timer = setTimeout(function(){ if (idx < pages.length - 1){ idx++; draw(); } else clearTimeout(timer); }, SEC); }
  function close(){ clearTimeout(timer); if (box){ box.remove(); box = null; } document.documentElement.classList.remove("st-lock"); }
  window.hmStory = function(){
    close();
    pages = pick();
    if (!pages.length){ if (window.P && window.P.toast) window.P.toast("아직 보여 줄 카드가 없어요"); return; }
    idx = 0;
    box = document.createElement("div"); box.id = "hmst";
    box.innerHTML = '<div class="st-bar"></div><div class="st-top"><span class="st-n"></span><button class="st-x" aria-label="닫기">✕</button></div><div class="st-body"></div><div class="st-ft"></div>';
    document.body.appendChild(box);
    document.documentElement.classList.add("st-lock");
    box.querySelector(".st-x").onclick = function(ev){ ev.stopPropagation(); close(); };
    // 톡: 오른쪽 70% = 다음, 왼쪽 30% = 앞 — 버튼·표(👍👎)·공유는 그대로 눌림
    box.addEventListener("click", function(ev){
      if (ev.target.closest("button, [data-share], [data-vote], a")) return;
      ev.preventDefault(); ev.stopPropagation();
      var x = (ev.clientX || 0) / Math.max(1, window.innerWidth);
      if (x < 0.3){ if (idx > 0){ idx--; draw(); } else arm(); }
      else { if (idx < pages.length - 1){ idx++; draw(); } else close(); }
    }, true);
    draw();
  };
  var st = document.createElement("style");
  st.textContent = [
    "#hmst{position:fixed;inset:0;z-index:80;background:var(--bg);display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 10px) 12px calc(env(safe-area-inset-bottom) + 12px)}",
    ".st-lock,.st-lock body{overflow:hidden}",
    ".st-bar{display:flex;gap:4px;height:4px;margin:0 2px 10px}.st-bar i{flex:1;background:var(--line);border-radius:2px;overflow:hidden;position:relative}.st-bar i.done{background:var(--text)}",
    ".st-bar i.on::after{content:'';position:absolute;left:0;top:0;bottom:0;width:0;background:var(--text);animation:stfill " + SEC + "ms linear forwards}@keyframes stfill{to{width:100%}}",
    ".st-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.st-n{font-size:12.5px;color:var(--sub);font-weight:700}",
    ".st-x{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;width:32px;height:32px;font-size:15px;cursor:pointer}",
    ".st-body{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column}.st-body .card{margin:auto 0;font-size:1.06em}.st-body .hm-big b{font-size:24px}.st-body .hm-h b{font-size:18px}",
    ".st-ft{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:8px;font-size:12px;color:var(--sub)}.st-ft .hm-sh{margin:0}",
    ".st-done{border:0;background:var(--acc,#7c9cff);color:#111;border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}"
  ].join("\n");
  document.head.appendChild(st);
})();
