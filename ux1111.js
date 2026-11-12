/* 🔭 11/11 신호 탭 「지켜보는 중」 모드 (A11/11-2 · 사용자 「둘 다 진행」)
   코스피가 🐻 하락장(현금 100% · 새로 사지 않기)인 동안 신호 탭(🐋 고래 · ☕ 컵 · 📈 갭 · 🔎 거르기 · ⚡ 단타 · 🤫 매집)이 같은 말을 하도록:
   ─ 머리에 「🐻 지금은 지켜보는 중」 띠 (첫 화면 「국내 주식 → 새로 사지 않기」와 한 목소리)
   ─ 🇰🇷 한국 종목 이름 옆에 「🔭 지켜봄」 꼬리표 — 카드는 숨기지 않음 · 미국·일본 종목은 그대로
   ─ 「🔭 하락장 동안 쌓인 한국 신호 n개」 목록(만드는 쪽 bear_watch.py → archive/x/bear_watch.json · 앱은 그리기만)
   ─ 판정이 풀리면 14일 동안 「하락장 동안 쌓인 신호 n개 ›」 한 줄만 (수익률 계산 없음 · 종목별 성적은 그 종목 화면 🧵)
   판정은 market/bear.json 코스피 칸 그대로(매시간) · 매수·매도 권유 아님 */
(function(){
  var SIG = {whale: 1, cup: 1, gap: 1, screen: 1, danta: 1, accum: 1, sigmore: 1};
  var RAWB = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bear.json";
  var KRA = /openOP\('(\d{6})(?:\.K[SQ])?'\)|m\.stock\.naver\.com\/domestic\/stock\/(\d{6})/;
  var KQ = null, BEAR = null, W = null, got = 0;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function tb(){ return Math.floor(Date.now() / 6e5); }
  function gj(u){ return fetch(u + (u.indexOf("?") < 0 ? "?" : "&") + "t=" + tb(), {cache: "no-store"}).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }
  function load(){
    if (got && Date.now() - got < 6e5) return Promise.resolve();
    return Promise.all([gj(RAWB), gj("archive/x/bear_watch.json")]).then(function(r){
      var k = r[0] && (r[0].markets || []).filter(function(m){ return m.key === "kospi"; })[0];
      BEAR = k || null; KQ = r[0] && (r[0].markets || []).filter(function(m){ return m.key === "kosdaq"; })[0] || null; W = r[1]; got = Date.now();
    });
  }
  function tab(){ return (typeof window.cur !== "undefined" && window.cur) || (location.hash || "").slice(1); }
  function isSig(){ return !!SIG[tab()] || !!document.querySelector("#main #sgleg"); }
  function bearOn(){ return BEAR && BEAR.state === "🐻"; }
  function endedRecent(){
    if (!W || !W.ended || bearOn()) return false;
    return (Date.now() - Date.parse(W.ended + "T00:00:00+09:00")) / 864e5 <= 14;
  }
  function row(r){
    return '<li><button type="button" data-bwc="' + e(r.c) + '"><div><b>' + e(r.n) + '</b> <small>' + e(r.c) + '</small></div><span>' + e((r.s || []).join(" · ")) + '</span>' +
      '<em>' + (r.first === r.last ? md(r.first) : md(r.first) + "~" + md(r.last)) + ' · ' + r.days + '일</em></button></li>';
  }
  function list(){
    if (!W || !W.rows || !W.rows.length) return "";
    W.rows.forEach(function(r){ if ((r.s || []).indexOf('☕ 컵 돌파') >= 0) r.s = r.s.filter(function(x){ return x !== '☕ 컵'; }); });
    var L = W.last_day, today = W.rows.filter(function(r){ return r.last === L; }), rest = W.rows.filter(function(r){ return r.last !== L; });
    return '<details class="bw-d"><summary>🔭 하락장 동안 쌓인 한국 신호 <b>' + W.n + '개</b>' + (W.new_last ? ' <i>' + md(L) + ' 새로 ' + W.new_last + '</i>' : '') + ' <u>▾</u></summary>' +
      (today.length ? '<div class="bw-gh">' + md(L) + '에 뜬 ' + today.length + '개</div><ul>' + today.map(row).join("") + '</ul>' : '') +
      (rest.length ? '<details class="bw-more"><summary>그 전에 떴던 ' + rest.length + '개 ▾</summary><ul>' + rest.slice(0, 80).map(row).join("") + '</ul>' + (rest.length > 80 ? '<p class="bw-n">＋ ' + (rest.length - 80) + '개 더(오래된 것)</p>' : '') + '</details>' : '') +
      '<p class="bw-n">' + md(W.rec_from) + '부터 앱 기록(하락장 시작 ' + md(W.from) + ') · ☕ 컵 · 📈 갭 · ⚡ 단타 · 🤫 매집에 뜬 🇰🇷 종목 · 누르면 그 종목 화면 · 수익률은 계산하지 않아요 — 종목별 성적은 그 종목 화면 🧵 · 기록일 뿐 사라는 뜻 아님</p></details>';
  }
  function banner(){
    if (bearOn()){
      return '<section class="bw-b" id="bw-b"><div class="bw-h">🐻 지금은 <b>지켜보는 중</b></div>' +
        '<p>코스피 하락장(고점 ' + e(BEAR.dd) + '% · ' + md(BEAR.asof) + ' 종가 판정) — 국내 주식은 ' + (BEAR.analog ? '코스피 <b>' + e(BEAR.analog.next) + '</b>' + (KQ && KQ.analog ? ' · 코스닥은 주식 ' + KQ.analog.stock + '%' : '') : '판정 풀릴 때까지 <b>새로 사지 않기</b>') + '. 이 탭의 🇰🇷 한국 종목엔 <span class="bw-tg">🔭 지켜봄</span> 꼬리표만 붙여 기록해요 · 미국·일본 종목은 그대로.</p>' + list() + '</section>';
    }
    if (endedRecent()){
      return '<section class="bw-b ok" id="bw-b"><div class="bw-h">✅ 코스피 하락장 판정 풀림 <small>' + md(W.ended) + '</small></div>' + list() + '</section>';
    }
    return "";
  }
  function apply(){
    var M = document.getElementById("main"); if (!M) return;
    var on = isSig() && (bearOn() || endedRecent());
    document.documentElement.classList.toggle("bw-on", !!(on && bearOn()));
    var old = document.getElementById("bw-b");
    if (!on){ if (old) old.remove(); return; }
    if (!old){
      var html = banner(); if (!html) return;
      var box = document.createElement("div"); box.innerHTML = html; var b = box.firstChild;
      var leg = M.querySelector("#sgleg"), hero = M.querySelector(".hero");
      if (hero && hero.parentNode === M) hero.insertAdjacentElement("afterend", b);
      else if (leg) leg.insertAdjacentElement("afterend", b);
      else M.insertBefore(b, M.firstChild);
    }
    if (!bearOn()) return;
    M.querySelectorAll("a[href]:not([data-bw])").forEach(function(a){
      a.setAttribute("data-bw", "1");
      if (a.closest("#bw-b")) return;
      if (KRA.test(a.getAttribute("href") || "")) a.classList.add("bw-kr");
    });
  }
  var T = 0;   // 모아서 한 번(계속 바뀌는 화면이 있어도 0.3초 안에 꼭 돌게 — 늦추기만 하면 굶음)
  function run(){ T = 0; if (!isSig()){ apply(); return; } load().then(apply); }
  function soon(){ if (!T) T = setTimeout(run, 300); }
  function boot(){
    var M = document.getElementById("main"); if (!M){ setTimeout(boot, 300); return; }
    new MutationObserver(function(ms){
      for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && t.closest("#bw-b")) continue; soon(); return; }
    }).observe(M, {childList: true, subtree: true});
    window.addEventListener("hashchange", soon); soon();
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-bwc]"); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    if (typeof window.openOP === "function") window.openOP(b.getAttribute("data-bwc"));
  }, true);

  var css = document.createElement("style");
  css.textContent =
    ".bw-b{margin:10px 0 12px;padding:13px 14px;border-radius:16px;background:rgba(229,72,77,.08);box-shadow:inset 0 0 0 1px rgba(229,72,77,.28)}.bw-b.ok{background:rgba(48,164,108,.08);box-shadow:inset 0 0 0 1px rgba(48,164,108,.3)}" +
    ".bw-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bw-h small{font-size:12px;color:var(--sub);font-weight:700;margin-left:4px}.bw-b>p{margin:6px 0 0;font-size:13px;line-height:1.5;word-break:keep-all}" +
    ".bw-tg{display:inline-block;font-size:11px;font-weight:800;padding:0 6px;border-radius:6px;background:rgba(127,127,127,.18);white-space:nowrap}" +
    ".bw-d{margin-top:10px}.bw-d>summary,.bw-more>summary{cursor:pointer;list-style:none;font-size:13px;font-weight:800;color:var(--accent,#3987e5)}.bw-d>summary::-webkit-details-marker,.bw-more>summary::-webkit-details-marker{display:none}" +
    ".bw-d>summary i{font-style:normal;font-size:11px;font-weight:800;color:#e5484d;margin-left:4px}.bw-d>summary u{text-decoration:none}" +
    ".bw-gh{margin:10px 0 4px;font-size:12px;font-weight:800;color:var(--sub)}.bw-d ul{list-style:none;margin:0;padding:0}.bw-d li+li{margin-top:4px}" +
    ".bw-d li button{all:unset;box-sizing:border-box;display:grid;grid-template-columns:1fr auto;gap:1px 8px;width:100%;padding:7px 10px;border-radius:10px;background:var(--panel,rgba(127,127,127,.07));cursor:pointer;font-size:13px}" +
    ".bw-d li div{grid-column:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bw-d li b{font-weight:800}.bw-d li small{color:var(--sub);font-size:11px}.bw-d li span{grid-column:1;font-size:12px;color:var(--sub)}.bw-d li em{grid-column:2;grid-row:1/3;align-self:center;font-style:normal;font-size:11px;color:var(--sub);white-space:nowrap}" +
    ".bw-more{margin-top:8px}.bw-n{margin:8px 0 0;font-size:11px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    "html.bw-on #main a.bw-kr::after{content:'🔭 지켜봄';display:inline-block;margin-left:5px;padding:0 5px;border-radius:6px;font-size:10px;font-weight:800;line-height:16px;vertical-align:1px;color:var(--sub);background:rgba(127,127,127,.18);white-space:nowrap}";
  document.head.appendChild(css);
  boot();
})();
