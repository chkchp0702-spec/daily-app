/* CH Investing — 10/15 앱 아이디어 A9-1·A9-3·A9-4 (사용자 「다 적용해」)
   A9-1 🌞 장중 띠 — 홈 날짜 줄 아래 한 줄: 장중판 = 🇰🇷 코스피·코스닥 지금 값, 저녁판 = 🇺🇸 선물, 밤·아침판 = 🇺🇸 지수 (1분마다 · 누르면 시장 탭 실시간 시장판)
   A9-3 ⟳ 신선도 칩 — 「08:56 기준」 → 「⟳ 41분 전」(1시간 안 초록 · 3시간 안 노랑 · 넘으면 빨강) · 누르면 자료별 신선도(건강검진 health.json) · 머리엔 버전만(시각 글자는 뺌) · 버전은 ⚙️ 맨 아래에도
   A9-4 🪄 숫자 차오름 + 「지난번 본 값」 배지 — 이 휴대폰 안(localStorage ch_seen)에만 · 아이폰 「동작 줄이기」면 움직임 없음
   보고 숫자는 화면에 이미 있는 값만 씀 — 새 계산·매수 권유 없음 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; return (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 2 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kst(s){ var t = Date.parse(String(s || "").trim().replace(" ", "T") + (String(s).length <= 16 ? ":00" : "") + "+09:00"); return isNaN(t) ? null : t; }
  function ago(ms){ var m = Math.round(ms / 60000); if (m < 1) return "방금"; if (m < 60) return m + "분 전"; return Math.floor(m / 60) + "시간 전"; }
  function todayKST(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- A9-3 ⟳ 신선도 칩 ---------- */
  function fresh(H){
    var c = document.getElementById("hmfresh"); if (!c) return;
    var t = kst(H.at); if (t == null) return;
    var paint = function(){
      var age = Date.now() - t;
      c.className = "hm-fresh " + (age < 0 ? "g" : age <= 3600e3 ? "g" : age <= 3 * 3600e3 ? "y" : "r");
      c.textContent = age > 3 * 3600e3 ? "⟳ " + ago(age) + " · 자료가 늦어요" : "⟳ " + (age < 0 ? "방금" : ago(age));
      c.title = "홈 요약 만든 때 " + String(H.at || "").slice(5) + " — 누르면 자료별";
    };
    paint(); clearInterval(fresh.tm); fresh.tm = setInterval(function(){ if (!document.body.contains(c)) return clearInterval(fresh.tm); paint(); }, 60000);
    c.onclick = function(ev){ ev.stopPropagation(); freshSheet(H); };
  }
  function freshSheet(H){
    var old = document.getElementById("frsheet"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "frsheet";
    d.innerHTML = '<b>⟳ 자료 신선도</b><div class="fr-l"><div class="fr-r"><span>🏠 홈 요약</span><em>' + e(ago(Date.now() - kst(H.at))) + '</em></div><div class="mut">불러오는 중…</div></div>' +
      '<small>홈 요약은 매시간 · 실시간 숫자(🌞 띠)는 1분마다 새로 받아요</small><div class="fr-v">앱 v' + e(window.APPV || "") + '</div>';
    document.body.appendChild(d);
    var close = function(ev){ if (!d.contains(ev.target)){ d.remove(); document.removeEventListener("click", close, true); } };
    setTimeout(function(){ document.addEventListener("click", close, true); }, 0);
    if (typeof getJSON !== "function") return;
    getJSON("archive/x/health.json?" + Math.floor(Date.now() / 300000)).then(function(Hx){
      // 건강검진이 잰 때 기준 나이(그 뒤로 더하지 않음 — 건강검진이 늦게 돌면 부풀려 보여서) · 잰 때를 같이 적음
      var rows = (Hx.data || []).map(function(x){
        var h = x.age_h || 0, lim = x.lim || 3, c = h <= 1 ? "g" : h <= lim ? "y" : "r";
        return '<div class="fr-r"><span>' + e(x.name) + '</span><em class="' + c + '">' + e(ago(h * 3600e3)) + '</em></div>'; }).join("");
      var l = d.querySelector(".fr-l"); if (l) l.innerHTML = l.firstElementChild.outerHTML + '<div class="fr-h">🩺 건강검진 ' + e(String(Hx.at || "").slice(5).replace("-", "/")) + ' 잰 것</div>' + (rows || '<div class="mut">건강검진 자료 없음</div>') +
        ((Hx.problems || []).length ? '<div class="fr-p">⚠️ ' + e(Hx.problems[0]) + '</div>' : '');
    }).catch(function(){ var l = d.querySelector(".fr-l .mut"); if (l) l.textContent = "건강검진 자료를 못 받았어요"; });
  }

  /* ---------- A9-1 🌞 장중 띠 ---------- */
  function live(){
    var el = document.getElementById("hmlive"); if (!el || typeof getJSON !== "function") return;
    var ed = el.dataset.ed, mn = Math.floor(Date.now() / 60000);
    var J = function(n){ return getJSON("archive/x/" + n + ".json?" + mn).catch(function(){ return null; }); };
    var show = function(html, stale, title){ el.innerHTML = html; el.hidden = false; el.classList.toggle("stale", !!stale); el.title = title || ""; };
    var usClose = function(){ return J("live_us").then(function(U){
      if (!U || !(U.index || []).length) { el.hidden = true; return; }
      var at = U.at || null, age = at ? Date.now() - at : 9e9, sess = String(U.sess || U.date || "");
      var nyOpen = ed === "night" && age < 15 * 60000;
      show('<span class="lv-f">🇺🇸 ' + (nyOpen ? "장중" : (sess ? sess.slice(5).replace("-", "/") + " 마감" : "마감")) + '</span>' +
        U.index.slice(0, 2).map(function(x){ return '<span>' + e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
        (U.total ? '<span class="lv-m">오른 종목 ' + U.up + '/' + U.total + '</span>' : '') + '<span class="lv-t">' + e(U.t || "") + ' ›</span>',
        ed === "night" && !nyOpen && new Date(Date.now() + 9 * 3600e3).getUTCHours() < 5, "미국 지수 · 누르면 시장 탭 실시간 시장판");
    }); };
    if (ed === "day"){
      J("live_kr").then(function(L){
        if (!L || L.date !== todayKST() || !(L.index || []).length) return usClose();   // 주말·휴장 → 미국 마감
        var t = kst(L.date + " " + L.t), age = t ? Date.now() - t : 9e9;
        var m = new Date(Date.now() + 9 * 3600e3), mm = m.getUTCHours() * 60 + m.getUTCMinutes();
        var stale = age > 10 * 60000 && mm < 15 * 60 + 40;
        show('<span class="lv-f">🇰🇷 ' + (stale ? "멈춤?" : "지금") + '</span>' +
          L.index.slice(0, 2).map(function(x){ return '<span>' + e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
          (L.total ? '<span class="lv-m">오른 종목 ' + L.up + '/' + L.total + '</span>' : '') + '<span class="lv-t">' + e(L.t) + ' ›</span>',
          stale, "한국 장중 · " + L.t + " 값" + (stale ? " (10분 넘게 안 바뀜)" : "") + " · 누르면 시장 탭 실시간 시장판");
      });
    } else if (ed === "eve"){
      J("live_us_pre").then(function(P){
        if (!P || !(P.fut || []).length) return usClose();
        var age = P.at ? Date.now() - P.at : 9e9, nm = function(n){ return String(n).replace("100 선물", " 선물"); };
        show('<span class="lv-f">🇺🇸 선물</span>' + P.fut.slice(0, 2).map(function(x){ return '<span>' + e(nm(x.name)) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg) + '</b></span>'; }).join("") +
          (P.tone ? '<span class="lv-m">' + e(P.tone) + '</span>' : '') + '<span class="lv-t">' + e(P.t || "") + ' ›</span>',
          age > 30 * 60000, (P.phase_lab || "미국 장 전") + " · 누르면 시장 탭 실시간 시장판");
      });
    } else usClose();
    el.onclick = function(ev){ ev.stopPropagation(); if (window.goTo) goTo("market", "live"); };
    clearTimeout(live.tm); live.tm = setTimeout(function(){ if (document.getElementById("hmlive") === el) live(); }, 60000);
  }

  /* ---------- A9-4 🪄 숫자 차오름 + 지난번 본 값 ---------- */
  var SEEN = {}; try { SEEN = JSON.parse(localStorage.getItem("ch_seen") || "{}") || {}; } catch(x) {}
  var animated = {};
  function nums(){
    var now = Date.now(), changed = false;
    [].forEach.call(document.querySelectorAll("#hmbody [data-num]"), function(el){
      var k = el.dataset.k, v = parseFloat(el.dataset.num); if (!k || isNaN(v)) return;
      var d = el.dataset.d != null ? +el.dataset.d : 2, u = el.dataset.u || "%", nos = el.dataset.nosign;
      var fmt = function(x){ return nos ? (+x).toFixed(d) + u : sg(x, d); };
      var final = el.textContent, p = SEEN[k];
      var diff = p && Math.abs(p.v - v) >= Math.pow(10, -d) / 2;
      if (diff && now - p.t > 5 * 60000){
        var b = document.createElement("i"); b.className = "hm-was " + (v > p.v ? "u" : "d");
        b.textContent = (v > p.v ? "▲" : "▼") + " 지난번 " + fmt(p.v); b.title = "이 휴대폰에서 지난번 본 값 (" + new Date(p.t + 9 * 3600e3).toISOString().slice(5, 16).replace("T", " ").replace("-", "/") + ")";
        el.parentNode.appendChild(b);
        var c = el.closest(".card"); if (c && !RM){ c.classList.remove("hm-pulse"); void c.offsetWidth; c.classList.add("hm-pulse"); }
      }
      if (!p || diff || now - p.t > 5 * 60000){ SEEN[k] = {v: v, t: now}; changed = true; }
      if (RM || (animated[k] && !diff)) return;
      animated[k] = 1;
      var t0 = null, dur = 600;
      (function step(ts){
        if (!document.body.contains(el)) return;
        if (t0 == null) t0 = ts; var q = Math.min(1, (ts - t0) / dur), ez = 1 - Math.pow(1 - q, 3);
        el.textContent = q >= 1 ? final : fmt(v * ez);
        if (q < 1) requestAnimationFrame(step);
      })(performance.now());
    });
    if (changed) try { localStorage.setItem("ch_seen", JSON.stringify(SEEN)); } catch(x) {}
  }

  window.hmAfter = function(H){ fresh(H); live(); nums(); };

  var css = document.createElement("style");
  css.textContent =
    
    ".hm-fresh{border-radius:999px;padding:1px 8px;font-size:12.5px;font-weight:800;white-space:nowrap;cursor:pointer;background:var(--panel2);border:1px solid var(--line)}" +
    ".hm-fresh.g{color:#4dd47a;border-color:rgba(77,212,122,.35)}.hm-fresh.y{color:#ffb84d;border-color:rgba(255,184,77,.4)}.hm-fresh.r{color:#ff8a8a;border-color:rgba(255,138,138,.45);background:rgba(255,107,107,.1)}" +
    ".hm-live{display:flex;flex-wrap:wrap;align-items:center;gap:3px 10px;margin:-4px 0 10px;padding:7px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line);font-size:12.5px;cursor:pointer;line-height:1.5}" +
    ".hm-live[hidden]{display:none}.hm-live span{white-space:nowrap}.hm-live b{font-weight:800}.hm-live .lv-f{font-weight:800}.hm-live .lv-m{color:var(--sub)}.hm-live .lv-t{margin-left:auto;color:var(--dim);font-size:12.5px}" +
    ".hm-live.stale{opacity:.6;filter:grayscale(.8)}.hm-live:active{opacity:.75}" +
    "#frsheet{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 64px);z-index:60;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px 16px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-size:13px;max-width:460px;margin:0 auto}" +
    "#frsheet>b{display:block;font-size:15px;margin-bottom:8px}.fr-r{display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid var(--line)}.fr-r:first-child{border-top:0}.fr-r em{font-style:normal;font-weight:800}" +
    ".fr-h{margin:8px 0 2px;font-size:12.5px;color:var(--sub);font-weight:700}.fr-r em.g{color:#4dd47a}.fr-r em.y{color:#ffb84d}.fr-r em.r{color:#ff8a8a}.fr-p{margin-top:6px;color:#ffb84d;font-size:12.5px}#frsheet small{display:block;margin-top:8px;color:var(--sub);font-size:12.5px}.fr-v{margin-top:6px;color:var(--dim);font-size:12.5px;text-align:right}" +
    ".hm-was{display:block;font-style:normal;font-size:12.5px;font-weight:700;margin-top:1px;color:var(--sub);line-height:1.3}.hm-was.u{color:#ff8a8a}.hm-was.d{color:#7cb0ff}" +
    ".hm-l .hm-was,.hm-c small .hm-was{display:inline;margin-left:4px}" +
    "@keyframes hmPulse{0%{box-shadow:inset 3px 0 0 0 var(--acc,#7c9cff),0 0 0 0 color-mix(in srgb,var(--acc,#7c9cff) 45%,transparent)}100%{box-shadow:inset 3px 0 0 0 transparent,0 0 0 10px transparent}}" +
    ".card.hm-pulse{animation:hmPulse 1.5s ease-out 1}" +
    ".us-ver{margin:10px 0 2px;font-size:12.5px;color:var(--dim);text-align:right}" +
    ":root[data-ui=light] .hm-fresh.g{color:#1f8b4c}:root[data-ui=light] .hm-fresh.y{color:#b26b00}:root[data-ui=light] .hm-fresh.r{color:#c0392b}" +
    ":root[data-ui=light] .fr-r em.g{color:#1f8b4c}:root[data-ui=light] .fr-r em.y{color:#b26b00}:root[data-ui=light] .fr-r em.r,:root[data-ui=light] .fr-p{color:#c0392b}:root[data-ui=light] #frsheet{box-shadow:0 12px 40px rgba(0,0,0,.18)}" +
    ":root[data-ui=light] .hm-was.u{color:#d63031}:root[data-ui=light] .hm-was.d{color:#2f6fd0}";
  document.head.appendChild(css);
})();
