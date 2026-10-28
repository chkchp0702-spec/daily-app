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
  setTimeout(maybe, 2500);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) maybe(); });

  // ---------- 보기: 설정 ⚙️ › 📈 사용 현황 ----------
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ return s ? s.slice(5).replace("-", "/") : ""; }
  function show(){
    var box = document.createElement("div"); box.id = "usgx"; box.innerHTML = '<div class="usg-s"><div class="loading">사용 현황 불러오는 중…</div></div>';
    box.addEventListener("click", function(ev){ if (ev.target === box) box.remove(); });
    document.body.appendChild(box);
    fetch("archive/x/usage.json?" + Math.floor(Date.now() / 600000)).then(function(r){ return r.ok ? r.json() : null; }).then(function(U){
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
        '<p class="note">기기 번호(난수)·날짜·처음 연 화면만 모아요. 이름·관심종목·메모는 안 보내요. 목표: 4주 뒤 「주 3회 이상」 늘리기.</p><button class="btn" id="usgc">닫기</button>';
      var c = document.getElementById("usgc"); if (c) c.onclick = function(){ box.remove(); };
    }).catch(function(){ box.firstChild.innerHTML = '<h3>📈 사용 현황</h3><p class="note">불러오지 못했어요.</p><button class="btn" onclick="document.getElementById(\'usgx\').remove()">닫기</button>'; });
  }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-usage]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); show(); }, true);
  function addBtn(){ var g = document.querySelector("#uiset .us-go"); if (!g || g.querySelector("[data-usage]")) return;
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
