/* 📈 사용 현황 (10/28 사용자 「동료 PB」가 자주 쓰게 — 1단계: 먼저 잰다)
   앱을 열 때 익명 신호 하나: 기기 번호(이름 없음·난수) · 날짜 · 처음 연 탭 · 앱 버전. 하루에 한 기기 1번 + 30분 넘게 닫았다 다시 열면 1번.
   ntfy 공개 주제(chkchp-ch-open)로 보내고, 서버(usage.py, 2시간마다)가 모아 archive/x/usage.json 에 날짜별로 쌓음.
   관심종목·메모·이름은 보내지 않음. 설정 ⚙️ › 「📈 사용 현황」에서 봄. */
(function(){
  var TOPIC = "chkchp-ch-open", KEY = "us_last";
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function dev(){ var d = ls("us_dev"); if (!d){ d = Math.random().toString(36).slice(2, 10); ls("us_dev", d); } return d; }
  function ping(){
    var d = kst(), tab = (typeof cur !== "undefined" && cur) || (location.hash || "#home").slice(1) || "home";
    var body = {d: dev(), day: d, tab: String(tab).slice(0, 12), v: (typeof APPV !== "undefined" ? APPV : ""), t: new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 16)};
    try { fetch("https://ntfy.sh/" + TOPIC, {method: "POST", body: JSON.stringify(body), headers: {"Title": "open"}, keepalive: true}).catch(function(){}); } catch(x) {}
    ls(KEY, String(Date.now()));
  }
  function maybe(){ var last = +ls(KEY) || 0; if (Date.now() - last > 30 * 60e3) ping(); }

  // ---------- 🎯 11/04 누른 것 · 본 화면 (사용자 「들어온 사람들이 어디를 제일 많이 봤니」) ----------
  //   이름·관심종목·입력한 글은 안 보냄. 단추·카드의 「짧은 이름」만 세서 모았다가 한 번에(앱을 내릴 때 · 10분마다) 보냄.
  var TK = "us_tap", NAMES = {home: "오늘", market: "시황", sector: "시장 흐름", prob: "오를 확률", flow: "수급", port: "포트", score: "성적표", whale: "큰손", cup: "컵 차트", gap: "갭 상승", screen: "종목 찾기", sigmore: "신호 더 보기",
    bond: "채권", fund: "펀드", els: "ELS", prop: "제안서", luck: "오늘의 운세", saju: "사주", tarot: "타로", lotto: "로또", feed: "피드", onepager: "종목리포트", alarm: "알림", idea: "의견함"};
  function bag(){ var b = null; try { b = JSON.parse(localStorage.getItem(TK) || "null"); } catch(x) {} if (!b || b.day !== kst()) b = {day: kst(), taps: {}, views: {}, n: 0}; return b; }
  function put(b){ try { localStorage.setItem(TK, JSON.stringify(b)); } catch(x) {} }
  function add(kind, label){ if (!label) return; var b = bag(), m = kind === "v" ? b.views : b.taps; label = String(label).replace(/\s+/g, " ").trim().slice(0, kind === "v" ? 14 : 28); if (!label) return; m[label] = (m[label] || 0) + 1; b.n++; put(b); }
  var lastView = "";
  function view(){ var c = (typeof cur !== "undefined" && cur) || ""; if (!c || c === lastView) return; lastView = c; add("v", NAMES[c] || c); }
  function labelOf(t){
    if (t.closest("input,textarea,select,[contenteditable]")) return null;
    var g = t.closest("#bnav button"); if (g) return "아래탭 · " + ((g.children[1] && g.children[1].textContent) || g.textContent).trim();
    if (t.closest("#gdbtn,.gd-b,.gd-i")) return "조이 설명";
    if (t.closest("#opbtn,#h2clb")) return "📨 보내기";
    if (t.closest("#gsbtn")) return "🔍 검색"; if (t.closest("#wlbtn")) return "⭐ 관심종목"; if (t.closest("#uibtn")) return "⚙️ 설정";
    var r = t.closest(".h2-ring"); if (r) return "스토리 · " + ((r.querySelector("small") || r).textContent || "").trim();
    var d = t.closest(".h2-d"); if (d) return "오늘의 발견 · " + (d.getAttribute("data-goto") ? (NAMES[d.getAttribute("data-goto")] || d.getAttribute("data-goto")) : "");
    if (t.closest(".h2-tm")) return "업종 지도 칸"; if (t.closest(".h2-w")) return "5개 시장 타일"; if (t.closest(".h2-num")) return "오늘의 숫자"; if (t.closest("#tdhero")) return "날씨판";
    var tab = t.closest("header .tabs .tab, .tabs.sub .tab"); if (tab) return "위탭 · " + (tab.textContent || "").replace(/[^\s가-힣A-Za-z0-9·]/g, "").trim();
    var op = t.closest("[data-op]"); if (op) return "종목 열기";   // 종목 이름은 안 보냄
    var gt = t.closest("[data-goto]"); if (gt) return "→ " + (NAMES[String(gt.getAttribute("data-goto")).split("~")[0]] || gt.getAttribute("data-goto"));
    var bt = t.closest("button,summary,.fold,a,[role=button]"); if (!bt || bt.closest("#gdq,#wowob,#usgx")) return null;
    var tx = (bt.innerText || bt.textContent || "").replace(/[\d,.%+−\-]+/g, "#").replace(/\s+/g, " ").trim();   // 숫자는 # 로(값 말고 단추 이름만)
    if (!tx || tx.length < 2) return null;
    var c = (typeof cur !== "undefined" && cur) || ""; return (NAMES[c] || c) + " · " + tx.slice(0, 20);
  }
  document.addEventListener("click", function(ev){ try { var t = ev.target; if (!t || !t.closest) return; add("t", labelOf(t)); } catch(x) {} }, true);
  function flush(){
    var b = bag(); if (!b.n) return;
    var body = {k: "tap", d: dev(), day: b.day, v: (typeof APPV !== "undefined" ? APPV : ""), taps: b.taps, views: b.views};
    var s = JSON.stringify(body); if (s.length > 3800){ var ks = Object.keys(b.taps).sort(function(a, c){ return b.taps[c] - b.taps[a]; }).slice(0, 40), t2 = {}; ks.forEach(function(k){ t2[k] = b.taps[k]; }); body.taps = t2; s = JSON.stringify(body); }
    try { fetch("https://ntfy.sh/" + TOPIC, {method: "POST", body: s, headers: {"Title": "tap"}, keepalive: true}).catch(function(){}); } catch(x) {}
    put({day: b.day, taps: {}, views: {}, n: 0});
  }
  setInterval(view, 1500); setTimeout(view, 3000);
  setInterval(function(){ if (!document.hidden) flush(); }, 10 * 60e3);
  document.addEventListener("visibilitychange", function(){ if (document.hidden) flush(); });
  window.addEventListener("pagehide", flush);
  setTimeout(maybe, 2500);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) maybe(); });

  // ---------- 보기: 설정 ⚙️ › 📈 사용 현황 ----------
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ return s ? s.slice(5).replace("-", "/") : ""; }
  function show(){
    var box = document.createElement("div"); box.id = "usgx"; box.innerHTML = '<div class="usg-s"><div class="loading">사용 현황 불러오는 중…</div></div>';
    box.addEventListener("click", function(ev){ if (ev.target === box) box.remove(); });
    document.body.appendChild(box);
    fetch("archive/x/usage.json?" + Math.floor(Date.now() / 600000)).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(J){   // 🔒 11/04 운영자 전용 — 잠근 몫(parts)을 하나씩 열어 더함
        if (!J) return null; if (J.days) return J;
        if (!J.parts) return null; if (!window.__opOpen) throw "locked";
        return Promise.all(J.parts.map(function(p){ return window.__opOpen(p).catch(function(x){ if (x === "locked") throw x; return null; }); })).then(function(L){
          var U = {days: {}, at: J.at};
          L.forEach(function(P){ if (!P || !P.days) return; Object.keys(P.days).forEach(function(d){ var S = P.days[d], T = U.days[d] || (U.days[d] = {dev: {}, tabs: {}, opens: 0, ver: {}, taps: {}, views: {}, tapdev: {}});
            ["dev", "tabs", "ver", "taps", "views"].forEach(function(f){ var o = S[f] || {}; Object.keys(o).forEach(function(k){ T[f][k] = (T[f][k] || 0) + o[k]; }); });
            T.opens += S.opens || 0; var W = S.tapdev || {}; Object.keys(W).forEach(function(k){ var a = T.tapdev[k] || (T.tapdev[k] = {}); Object.keys(W[k] || {}).forEach(function(x){ a[x] = 1; }); }); }); });
          return U; }); })
      .then(function(U){
      var s = box.firstChild;
      if (!U || !U.days){ s.innerHTML = '<h3>📈 사용 현황</h3><p class="note">아직 모인 기록이 없어요. 2시간마다 모아요.</p><button class="btn" id="usgc">닫기</button>'; return; }
      var days = Object.keys(U.days).sort(), last = days.slice(-14), w7 = days.slice(-7), p7 = days.slice(-14, -7);
      var uniq = function(ds){ var s_ = {}; ds.forEach(function(d){ Object.keys(U.days[d].dev || {}).forEach(function(k){ s_[k] = 1; }); }); return Object.keys(s_).length; };
      var cnt = {}; w7.forEach(function(d){ Object.keys(U.days[d].dev || {}).forEach(function(k){ cnt[k] = (cnt[k] || 0) + 1; }); });
      var devs = Object.keys(cnt), loyal = devs.filter(function(k){ return cnt[k] >= 3; }).length;
      var tabs = {}; w7.forEach(function(d){ var T = U.days[d].tabs || {}; Object.keys(T).forEach(function(k){ tabs[k] = (tabs[k] || 0) + T[k]; }); });
      var tt = Object.keys(tabs).sort(function(a, b){ return tabs[b] - tabs[a]; }).slice(0, 5);
      var mx = Math.max.apply(null, last.map(function(d){ return Object.keys(U.days[d].dev || {}).length; }).concat([1]));
      s.innerHTML = '<h3>📈 사용 현황 <span class="mut">익명 · ' + e(md(U.at || "")) + ' 기준</span></h3>' +
        '<div class="usg-k"><div><b>' + uniq(w7) + '</b><small>이번 7일 쓴 기기</small></div><div><b>' + loyal + '</b><small>주 3회 이상</small></div><div><b>' + (uniq(p7) ? (uniq(w7) >= uniq(p7) ? "+" : "") + (uniq(w7) - uniq(p7)) : "–") + '</b><small>지난 7일 대비</small></div></div>' +
        '<div class="usg-b">' + last.map(function(d){ var n = Object.keys(U.days[d].dev || {}).length; return '<div title="' + e(md(d)) + ' ' + n + '기기"><i style="height:' + Math.round(n / mx * 44) + 'px"></i><small>' + e(d.slice(8)) + '</small></div>'; }).join("") + '</div>' +
        '<p class="note" style="margin:6px 0 2px">날짜별 쓴 기기 수(최근 14일)</p>' +
        (tt.length ? '<div class="usg-t">' + tt.map(function(k){ return '<span>' + e(k) + ' <b>' + tabs[k] + '</b></span>'; }).join("") + '</div><p class="note" style="margin:4px 0 0">이번 7일 처음 연 화면</p>' : '') +
        (function(){ var T = (U.days[days[days.length - 1]] || {}), V = T.views || {}, P = T.taps || {}, W = T.tapdev || {};
          var vk = Object.keys(V).sort(function(a, b){ return V[b] - V[a]; }).slice(0, 8), pk = Object.keys(P).sort(function(a, b){ return P[b] - P[a]; }).slice(0, 10);
          if (!vk.length && !pk.length) return '<p class="note" style="margin:10px 0 0">🎯 누른 것 기록은 11/4 오후부터 모여요.</p>';
          var mv = Math.max.apply(null, vk.map(function(k){ return V[k]; }).concat([1]));
          return '<h4 style="margin:14px 0 6px;font-size:15px">👀 ' + e(md(days[days.length - 1])) + ' 많이 본 화면</h4>' + vk.map(function(k){ return '<div style="display:flex;align-items:center;gap:8px;margin:4px 0;font-size:14px"><span style="width:84px;flex:none">' + e(k) + '</span><i style="height:10px;border-radius:5px;background:var(--acc,#7c9cff);width:' + Math.round(V[k] / mv * 60) + '%"></i><b>' + V[k] + '</b></div>'; }).join("") +
            (pk.length ? '<h4 style="margin:14px 0 6px;font-size:15px">👆 많이 누른 것</h4><ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7">' + pk.map(function(k){ var nd = W[k] ? Object.keys(W[k]).length : 0; return '<li>' + e(k) + ' <b>' + P[k] + '번</b>' + (nd ? ' <span class="mut">· ' + nd + '명</span>' : '') + '</li>'; }).join("") + '</ol>' : ''); })() +
        '<p class="note">기기 번호(난수)·날짜·처음 연 화면만 모아요. 이름·관심종목·메모는 안 보내요. 목표: 4주 뒤 「주 3회 이상」 늘리기.</p><button class="btn" id="usgc">닫기</button>';
      var c = document.getElementById("usgc"); if (c) c.onclick = function(){ box.remove(); };
    }).catch(function(x){ box.firstChild.innerHTML = '<h3>📈 사용 현황</h3><p class="note">' + (x === "locked" ? '🔒 운영자만 볼 수 있어요. 💬 의견함 › 🔐 운영자에서 비밀번호를 넣은 휴대폰에서만 열려요.' : '불러오지 못했어요.') + '</p><button class="btn" onclick="document.getElementById(\'usgx\').remove()">닫기</button>'; });
  }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-usage]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); show(); }, true);
  function addBtn(){ var g = document.querySelector("#uiset .us-go"); if (!g || g.querySelector("[data-usage]")) return;
    if (!(window.__opHas && __opHas())) return;   // 🔒 11/04 운영자 비밀번호가 있는 폰에만 단추가 보임
    var b = document.createElement("button"); b.setAttribute("data-usage", "1"); b.textContent = "📈 사용 현황";
    var ic = g.querySelector("[data-icons]"); g.insertBefore(b, ic ? ic.nextSibling : g.firstChild); }
  new MutationObserver(function(){ if (document.getElementById("uiset")) addBtn(); }).observe(document.documentElement, {childList: true, subtree: true});
  var st = document.createElement("style");
  st.textContent = "#usgx{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}" +
    ".usg-s{width:100%;max-width:520px;max-height:80vh;overflow:auto;background:var(--panel);color:var(--text);border-radius:18px 18px 0 0;padding:16px 16px 28px;box-sizing:border-box}.usg-s h3{margin:0 0 10px;font-size:17px}" +
    ".usg-k{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 12px}.usg-k div{background:var(--panel2);border-radius:12px;padding:10px 8px;text-align:center}.usg-k b{display:block;font-size:24px;font-weight:800}.usg-k small{color:var(--mut,#8a94a8);font-size:11.5px}" +
    ".usg-b{display:flex;gap:4px;align-items:flex-end;height:64px;padding:0 2px}.usg-b div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}.usg-b i{display:block;width:100%;min-height:2px;border-radius:4px 4px 0 0;background:var(--acc,#7c9cff)}.usg-b small{font-size:10px;color:var(--mut,#8a94a8);margin-top:3px}" +
    ".usg-t{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.usg-t span{background:var(--panel2);border-radius:999px;padding:4px 10px;font-size:12.5px}.usg-s .btn{margin-top:10px;width:100%}";
  document.head.appendChild(st);
})();
