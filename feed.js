/* 📰 내 피드 (10/9) — 매일 보는 네이버 블로그 + 텔레그램 채널을 한 곳에
   자료: market-strategy-report/feeds/my_feed.json (매시간 :40 수집)
   · 위: 출처 칩(누르면 그 출처만) · 🎯 집중 연결 · 📌 모아 둔 글 · 검색
   · 🎯 = 오늘의 집중 테마·종목 이름이 들어간 글, 📝 = 아침 시황리포트가 인용한 글
   · 글을 누르면 펼침, 📌 로 모아 두기(이 기기에만), 「원문」으로 블로그·텔레그램 열기 */
(function(){
  var RAWF = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var S = {d: null, f: "ALL", q: "", kw: [], used: {}, open: {}};
  var PIN = {};
  try { PIN = JSON.parse(localStorage.getItem("feedpin") || "{}"); } catch(e) {}
  function savePin(){ try { localStorage.setItem("feedpin", JSON.stringify(PIN)); } catch(e) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  var WDS = ["일","월","화","수","목","금","토"];
  function dayLab(d){
    var t = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    var y = new Date(Date.now() + 9 * 3600e3 - 86400e3).toISOString().slice(0, 10);
    var w = WDS[new Date(d + "T00:00:00+09:00").getDay()];
    return (d === t ? "오늘" : d === y ? "어제" : d.slice(5).replace("-", "/")) + " (" + w + ")";
  }

  window.feedView = function(){
    setTimeout(function(){ if (window.brainCard) brainCard(document.getElementById("fdbrain"), true); }, 0);
    return '<div id="fdbrain"></div><div class="fd-top"><div class="fd-src" id="fdsrc"></div>' +
      '<input id="fdq" class="fd-q" type="search" placeholder="🔎 검색 (예: 반도체, TSMC, 금리)"></div>' +
      '<div id="fdbody"><div class="loading">블로그·텔레그램 불러오는 중…</div></div>';
  };

  window.feedInit = function(){
    var t = Date.now();
    Promise.all([
      fetch(RAWF + "feeds/my_feed.json?" + t).then(function(r){ return r.json(); }),
      fetch(RAWF + "market/focus.json?" + t).then(function(r){ return r.json(); }).catch(function(){ return null; }),
      fetch(RAWF + "feeds/used.json?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })
    ]).then(function(a){
      S.d = a[0];
      S.kw = keywords(a[1]);
      S.used = {};
      if (a[2] && a[2].items) a[2].items.forEach(function(u){ S.used[u.id] = u.why || "시황리포트 인용"; });
      S.usedDate = a[2] && a[2].date;
      S.usedInfo = a[2] || null;
      draw();
    }).catch(function(){ var b = document.getElementById("fdbody"); if (b) b.innerHTML = '<div class="empty">피드를 아직 못 가져왔어요. 잠시 뒤 다시 열어 주세요.</div>'; });
    var q = document.getElementById("fdq");
    if (q) q.oninput = function(){ S.q = q.value.trim().toLowerCase(); list(); };
  };

  // 🎯 오늘의 집중에서 테마·종목 이름 뽑기 → 글에 들어 있으면 표시
  function keywords(F){
    var k = [];
    if (!F) return k;
    (F.themes || []).forEach(function(t){
      (t.name || "").split(/[·\/,()\s]+/).forEach(function(w){ if (w.length >= 2) k.push({w: w, t: t.name}); });
      (t.us || []).concat(t.kr || []).forEach(function(x){
        var n = (x.name || "").replace(/\(.*\)/, "").trim();
        if (n.length >= 2) k.push({w: n, t: t.name});
        if (x.t && /^[A-Z]{2,5}$/.test(x.t)) k.push({w: x.t, t: t.name, exact: 1});
      });
    });
    return k;
  }
  function hits(it){
    var s = (it.title + " " + it.text), out = [];
    S.kw.forEach(function(k){
      var ok = k.exact ? new RegExp("(^|[^A-Za-z])" + k.w + "([^A-Za-z]|$)").test(s) : s.indexOf(k.w) >= 0;
      if (ok && out.indexOf(k.w) < 0) out.push(k.w);
    });
    return out.slice(0, 4);
  }

  function draw(){
    var d = S.d, srcEl = document.getElementById("fdsrc");
    if (!srcEl) return;
    d.items.forEach(function(it){ it._h = hits(it); });
    var nF = d.items.filter(function(i){ return i._h.length; }).length;
    var nP = d.items.filter(function(i){ return PIN[i.id]; }).length;
    var nU = d.items.filter(function(i){ return S.used[i.id]; }).length;
    var chips = [{k: "ALL", t: "전체 " + d.items.length}];
    if (nU) chips.push({k: "USED", t: "📝 리포트 인용 " + nU});
    chips.push({k: "FOCUS", t: "🎯 집중 연결 " + nF});
    chips.push({k: "PIN", t: "📌 " + nP});
    d.sources.forEach(function(s){ chips.push({k: s.id, t: (s.kind === "tg" ? "✈️ " : "🅽 ") + s.name.replace(/\s*\(.*\)/, "") + " " + s.n, bad: !s.ok}); });
    var chip = function(c){ return '<button class="fd-chip' + (S.f === c.k ? " on" : "") + (c.bad ? " bad" : "") + '" data-fk="' + e(c.k) + '">' + e(c.t) + '</button>'; };
    var nTop = chips.length - d.sources.length;
    srcEl.innerHTML = '<div class="fd-row">' + chips.slice(0, nTop).map(chip).join("") + '</div><div class="fd-row">' + chips.slice(nTop).map(chip).join("") + '</div>' +
      '<div class="fd-meta">' + e(d.at.slice(5).replace("-", "/")) + ' 모음 · 매시간 :40 · 7일치</div>' +
      (S.usedInfo && S.usedInfo.date ? '<div class="fd-sel">📝 ' + e(S.usedInfo.date.slice(5).replace("-", "/")) + ' 시황리포트: 글 <b>' + (S.usedInfo.read || "–") + '개</b> 읽고 <b>' + nU + '개</b> 골라 반영' +
        (S.usedInfo.skip ? '<small>안 쓴 이유: ' + e(S.usedInfo.skip) + '</small>' : '') + '</div>' : '');
    [].forEach.call(srcEl.querySelectorAll("[data-fk]"), function(b){ b.onclick = function(){ S.f = b.getAttribute("data-fk"); draw(); }; });
    list();
  }

  function pass(it){
    if (S.f === "FOCUS" && !it._h.length) return false;
    if (S.f === "PIN" && !PIN[it.id]) return false;
    if (S.f === "USED" && !S.used[it.id]) return false;
    if (["ALL", "FOCUS", "PIN", "USED"].indexOf(S.f) < 0 && it.src !== S.f) return false;
    if (S.q && (it.title + " " + it.text + " " + it.name).toLowerCase().indexOf(S.q) < 0) return false;
    return true;
  }

  function list(){
    var b = document.getElementById("fdbody"); if (!b || !S.d) return;
    var its = S.d.items.filter(pass), news = {};
    (S.d.new || []).forEach(function(i){ news[i] = 1; });
    if (!its.length){ b.innerHTML = '<div class="empty">' + (S.f === "PIN" ? "📌 모아 둔 글이 없어요. 글 오른쪽 📌 를 눌러 모아 두세요." : "해당하는 글이 없어요.") + '</div>'; return; }
    var h = "", day = "";
    its.forEach(function(it){
      var dd = (it.at || it.first).slice(0, 10);
      if (dd !== day){ day = dd; h += '<div class="fd-day">' + dayLab(dd) + '</div>'; }
      var long = it.text.length > 260, op = S.open[it.id];
      var body = e(it.text).replace(/\n/g, "<br>");
      S.kw.length && it._h.forEach(function(w){ body = body.split(e(w)).join('<mark>' + e(w) + '</mark>'); });
      h += '<div class="fd-it' + (it.kind === "tg" ? " fd-tg" : " fd-bl") + '" data-fid="' + e(it.id) + '">' +
        '<div class="fd-hd"><span class="fd-sn">' + (it.kind === "tg" ? "✈️" : "🅽") + " " + e(it.name.replace(/\s*\(.*\)/, "")) + '</span>' +
        '<span class="fd-tm">' + e((it.at || "").slice(11)) + '</span>' + (news[it.id] ? '<span class="fd-new">새 글</span>' : "") +
        '<button class="fd-pin' + (PIN[it.id] ? " on" : "") + '" data-pin="' + e(it.id) + '">📌</button></div>' +
        (it.kind === "blog" ? '<div class="fd-ti">' + e(it.title) + '</div>' : "") +
        (S.used[it.id] ? '<div class="fd-used">📝 오늘 시황리포트: ' + e(S.used[it.id]) + '</div>' : "") +
        (it._h.length ? '<div class="fd-hit">🎯 ' + it._h.map(e).join(" · ") + '</div>' : "") +
        '<div class="fd-tx' + (long && !op ? " cl" : "") + '">' + body + '</div>' +
        (it.files && it.files.length ? '<div class="fd-fl">📎 ' + it.files.map(e).join("<br>📎 ") + '</div>' : "") +
        (it.imgs && it.imgs.length && op ? '<div class="fd-im">' + it.imgs.map(function(u){ return '<img loading="lazy" referrerpolicy="no-referrer" src="' + e(u) + '">'; }).join("") + '</div>' : "") +
        '<div class="fd-ft">' + (long || (it.imgs && it.imgs.length) ? '<span class="fd-more">' + (op ? "접기 ▲" : "펼치기 ▼" + (it.imgs && it.imgs.length ? " · 사진 " + it.imgs.length : "")) + '</span>' : "<span></span>") +
        '<a class="fd-go" href="' + e(it.link) + '" target="_blank" rel="noopener">원문 ↗</a></div></div>';
    });
    b.innerHTML = h;
    [].forEach.call(b.querySelectorAll(".fd-it"), function(el){
      el.onclick = function(ev){
        if (ev.target.closest("a")) return;
        var pin = ev.target.closest("[data-pin]");
        var id = el.getAttribute("data-fid");
        if (pin){ if (PIN[id]) delete PIN[id]; else PIN[id] = 1; savePin(); pin.classList.toggle("on", !!PIN[id]); return; }
        if (window.getSelection && String(window.getSelection()).length) return;
        S.open[id] = !S.open[id]; var y = window.scrollY; list(); window.scrollTo(0, y);
      };
    });
  }

  var css = document.createElement("style");
  css.textContent =
    ".fd-top{padding:2px 0 6px}" +
    ".fd-src{display:flex;flex-wrap:wrap;gap:6px}.fd-row{display:flex;gap:6px;overflow-x:auto;width:100%;padding-bottom:2px;scrollbar-width:none}.fd-row::-webkit-scrollbar{display:none}" +
    ".fd-chip{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;flex:none}" +
    ".fd-chip.on{background:var(--c,#f4a261);color:#111;border-color:transparent;font-weight:700}" +
    ".fd-chip.bad{opacity:.5;text-decoration:line-through}" +
    ".fd-sel{width:100%;margin-top:6px;padding:8px 10px;border-radius:10px;background:rgba(124,156,255,.12);font-size:13px;color:var(--text)}.fd-sel small{display:block;color:var(--sub);font-size:12px;margin-top:2px}" +
    ".fd-meta{width:100%;font-size:11.5px;color:var(--dim);margin-top:2px}" +
    ".fd-q{width:100%;margin-top:8px;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:9px 11px;font:inherit;font-size:15px}" +
    ".fd-day{margin:14px 2px 6px;font-size:13px;font-weight:700;color:var(--sub)}" +
    ".fd-it{background:var(--panel);border:1px solid var(--line);border-left:3px solid #4aa3ff;border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer}" +
    ".fd-it.fd-bl{border-left-color:#03c75a}" +
    ".fd-hd{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--sub)}" +
    ".fd-sn{font-weight:700;color:var(--text)}.fd-tm{color:var(--dim)}" +
    ".fd-new{background:#ff6b6b;color:#fff;border-radius:6px;padding:1px 6px;font-size:10.5px;font-weight:700}" +
    ".fd-pin{margin-left:auto;background:none;border:0;font-size:16px;opacity:.25;cursor:pointer;padding:0 2px}.fd-pin.on{opacity:1}" +
    ".fd-ti{font-weight:700;font-size:15.5px;margin:6px 0 2px}" +
    ".fd-used{font-size:12.5px;color:#7c9cff;margin:4px 0}" +
    ".fd-hit{font-size:12.5px;color:#ffb84d;margin:4px 0}" +
    ".fd-tx{font-size:14px;line-height:1.55;margin-top:5px;word-break:break-word}" +
    ".fd-tx.cl{display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}" +
    ".fd-tx mark{background:rgba(255,184,77,.25);color:inherit;border-radius:3px;padding:0 2px}" +
    ".fd-fl{font-size:12.5px;color:var(--sub);margin-top:6px}" +
    ".fd-im{display:flex;gap:6px;overflow-x:auto;margin-top:8px}.fd-im img{height:150px;border-radius:8px;flex:none}" +
    ".fd-ft{display:flex;justify-content:space-between;align-items:center;margin-top:7px;font-size:12.5px}" +
    ".fd-more{color:var(--sub)}.fd-go{color:var(--c,#f4a261);text-decoration:none;font-weight:700}";
  document.head.appendChild(css);
})();
