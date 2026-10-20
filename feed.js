/* 📰 내 피드 (10/9) — 매일 보는 네이버 블로그 + 텔레그램 채널을 한 곳에
   자료: market-strategy-report/feeds/my_feed.json (매시간 :40 수집) · feeds/feed_score.json (📣 채널 성적표, 10/20)
   · 위: 출처 칩(누르면 그 출처만) · 🎯 집중 연결 · 📌 모아 둔 글 · 검색
   · 🎯 = 오늘의 집중 테마·종목 이름이 들어간 글, 📝 = 아침 시황리포트가 인용한 글
   · 글을 누르면 펼침, 📌 로 모아 두기(이 기기에만), 「원문」으로 블로그·텔레그램 열기 */
(function(){
  var RAWF = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var S = {d: null, f: "ALL", q: "", kw: [], used: {}, open: {}, gopen: {}};
  var PIN = {};
  try { PIN = JSON.parse(localStorage.getItem("feedpin") || "{}"); } catch(e) {}
  function savePin(){ try { localStorage.setItem("feedpin", JSON.stringify(PIN)); } catch(e) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  var IC = {tg: "✈️", blog: "🅽", news: "🌐", ai: "🧠"};
  function K_OF(i){ return i.kind === "news" ? "news" : i.kind === "ai" ? "ai" : "mine"; }
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
      fetch(RAWF + "feeds/used.json?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
      fetch(RAWF + "feeds/feed_score.json?" + Math.floor(t / 600000)).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })
    ]).then(function(a){
      S.sc = a[3] && a[3].ch ? a[3] : null;
      S.d = a[0];
      S.kw = keywords(a[1]);
      S.used = {};
      if (a[2] && a[2].items) a[2].items.forEach(function(u){ S.used[u.id] = u.why || "시황리포트 인용"; });
      S.usedDate = a[2] && a[2].date;
      S.usedInfo = a[2] || null;
      draw();
    }).catch(function(){ var b = document.getElementById("fdbody"); if (b) b.innerHTML = '<div class="empty">피드를 아직 못 가져왔어요. 잠시 뒤 다시 열어 주세요.</div>'; });
    var q = document.getElementById("fdq");
    if (q) q.oninput = function(){ S.q = q.value.trim().toLowerCase(); S.lim = 40; list(); };
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
    if (S.sc) chips.push({k: "SCORE", t: "📣 채널 성적표"});
    var cnt = function(k){ return d.items.filter(function(i){ return K_OF(i) === k; }).length; };
    [["K:mine", "📝 블로그·텔레그램"], ["K:news", "🌐 뉴스"], ["K:ai", "🧠 AI가 찾은 글"]].forEach(function(x){ var n = cnt(x[0].slice(2)); if (n) chips.push({k: x[0], t: x[1] + " " + n}); });
    // 출처 칩: 고른 묶음(📝/🌐/🧠)의 출처만 (10/10 뉴스 50곳 — 한 줄에 다 늘어놓지 않게)
    var cur = S.f.indexOf("K:") === 0 ? S.f.slice(2) : (function(){ var x = d.sources.filter(function(s){ return s.id === S.f; })[0]; return x ? K_OF(x) : "mine"; })();
    var SRC = d.sources.filter(function(s){ return K_OF(s) === cur; }).sort(function(x, y){ return (y.n || 0) - (x.n || 0); });
    SRC.forEach(function(s){ var g = scOf(s.id); chips.push({k: s.id, t: IC[s.kind] + " " + s.name.replace(/\s*\(.*\)/, "") + " " + s.n + (g && g.n5 >= MINN ? " · 📣" + g.up5 + "%" : ""), bad: !s.ok}); });
    var chip = function(c){ return '<button class="fd-chip' + (S.f === c.k ? " on" : "") + (c.bad ? " bad" : "") + '" data-fk="' + e(c.k) + '">' + e(c.t) + '</button>'; };
    var nTop = chips.length - SRC.length;
    srcEl.innerHTML = '<div class="fd-row">' + chips.slice(0, nTop).map(chip).join("") + '</div><div class="fd-row">' + chips.slice(nTop).map(chip).join("") + '</div>' +
      '<div class="fd-meta">' + e(d.at.slice(5).replace("-", "/")) + ' 모음 · 매시간 :40 · 7일치</div>' +
      (S.usedInfo && S.usedInfo.date ? '<div class="fd-sel">📝 ' + e(S.usedInfo.date.slice(5).replace("-", "/")) + ' 시황리포트: 글 <b>' + (S.usedInfo.read || "–") + '개</b> 읽고 <b>' + nU + '개</b> 골라 반영' +
        (S.usedInfo.skip ? '<small>안 쓴 이유: ' + e(S.usedInfo.skip) + '</small>' : '') + '</div>' : '');
    [].forEach.call(srcEl.querySelectorAll("[data-fk]"), function(b){ b.onclick = function(){ S.f = b.getAttribute("data-fk"); S.lim = 40; draw(); }; });
    list();
  }

  function pass(it){
    if (S.f === "SCORE") return false;
    if (S.f === "FOCUS" && !it._h.length) return false;
    if (S.f === "PIN" && !PIN[it.id]) return false;
    if (S.f === "USED" && !S.used[it.id]) return false;
    if (/^K:/.test(S.f)){ if (K_OF(it) !== S.f.slice(2)) return false; }
    else if (["ALL", "FOCUS", "PIN", "USED", "SCORE"].indexOf(S.f) < 0 && it.src !== S.f) return false;
    if (S.q && (it.title + " " + it.text + " " + it.name).toLowerCase().indexOf(S.q) < 0) return false;
    return true;
  }

  function card(it, news){
      var long = it.text.length > 150, op = S.open[it.id];
      var body = e(it.text).replace(/\n/g, "<br>");
      S.kw.length && it._h.forEach(function(w){ body = body.split(e(w)).join('<mark>' + e(w) + '</mark>'); });
      return '<div class="fd-it fd-' + (it.kind || "bl") + '" data-fid="' + e(it.id) + '">' +
        '<div class="fd-hd"><span class="fd-sn">' + (IC[it.kind] || "🅽") + " " + e(it.name.replace(/\s*\(.*\)/, "")) + (it.press ? ' <small class="fd-press">· ' + e(it.press) + '</small>' : '') + '</span>' +
        '<span class="fd-tm">' + e((it.at || "").slice(11)) + '</span>' + (news[it.id] ? '<span class="fd-new">새 글</span>' : "") + scTag(it) +
        '<button class="fd-pin' + (PIN[it.id] ? " on" : "") + '" data-pin="' + e(it.id) + '">📌</button></div>' +
        (it.kind !== "tg" ? '<div class="fd-ti">' + e(it.title) + '</div>' : "") +
        (S.used[it.id] ? '<div class="fd-used">📝 오늘 시황리포트: ' + e(S.used[it.id]) + '</div>' : "") +
        (it._h.length ? '<div class="fd-hit">🎯 ' + it._h.map(e).join(" · ") + '</div>' : "") + stkTags(it) +
        '<div class="fd-tx' + (long && !op ? " cl" : "") + '">' + body + '</div>' +
        (it.files && it.files.length ? '<div class="fd-fl">📎 ' + it.files.map(e).join("<br>📎 ") + '</div>' : "") +
        (it.imgs && it.imgs.length && op ? '<div class="fd-im">' + it.imgs.map(function(u){ return '<img loading="lazy" referrerpolicy="no-referrer" src="' + e(u) + '">'; }).join("") + '</div>' : "") +
        '<div class="fd-ft">' + (long || (it.imgs && it.imgs.length) ? '<span class="fd-more">' + (op ? "접기 ▲" : "펼치기 ▼" + (it.imgs && it.imgs.length ? " · 사진 " + it.imgs.length : "")) + '</span>' : "<span></span>") +
        '<a class="fd-go" href="' + e(it.link) + '" target="_blank" rel="noopener">원문 ↗</a></div></div>';
  }

  /* 🧵 A13-2 (10/15): 같은 채널(텔레그램·블로그) 글이 1시간 안에 연달아 오면 카드 한 장으로 묶음.
     닫힌 묶음 = 머리(채널 · N개 · 시각~시각) + 글마다 첫 줄 · 누르면 글 카드가 하나씩 펼쳐짐(📌 는 글마다 그대로)
     뉴스·AI 글은 안 묶음 · 🎯 집중 연결 · 📝 리포트 인용이 든 글이 있으면 묶음 머리에 표시 */
  function tms(it){
    var s = String(it.at || it.first || "");
    if (s.length < 16) return null;
    var t = Date.parse(s.slice(0, 10) + "T" + s.slice(11, 16) + ":00+09:00");
    return isNaN(t) ? null : t;
  }
  function grp(its){
    var out = [], cur = null;
    its.forEach(function(it){
      var p = cur && cur[cur.length - 1], tp = p && tms(p), ti = tms(it);
      var ok = p && (it.kind === "tg" || it.kind === "blog") && it.kind === p.kind && it.src === p.src &&
        String(it.at || it.first).slice(0, 10) === String(p.at || p.first).slice(0, 10) &&
        tp != null && ti != null && Math.abs(tp - ti) <= 3600e3;
      if (ok) cur.push(it); else { cur = [it]; out.push(cur); }
    });
    return out;
  }
  function firstLine(it){
    var t = it.kind === "tg" ? "" : (it.title || "");
    if (!t) t = (String(it.text || "").split(/\n+/).filter(function(x){ return x.trim(); })[0] || it.title || "").trim();
    t = t.replace(/^[\s•·▪◦\-*>]+/, "") || t;
    return t.length > 70 ? t.slice(0, 70) + "…" : t;
  }
  function grpCard(g, news){
    var a = g[0], z = g[g.length - 1], gid = a.id, op = S.gopen[gid];
    var t2 = String(a.at || "").slice(11, 16), t1 = String(z.at || "").slice(11, 16);
    var nNew = g.filter(function(i){ return news[i.id]; }).length;
    var nPin = g.filter(function(i){ return PIN[i.id]; }).length;
    var nUsed = g.filter(function(i){ return S.used[i.id]; }).length;
    var hit = []; g.forEach(function(i){ (i._h || []).forEach(function(w){ if (hit.indexOf(w) < 0) hit.push(w); }); });
    return '<div class="fd-grp fd-' + (a.kind || "bl") + (op ? " op" : "") + '">' +
      '<div class="fd-ghd" data-gid="' + e(gid) + '">' +
        '<div class="fd-hd"><span class="fd-sn">' + (IC[a.kind] || "🅽") + " " + e(a.name.replace(/\s*\(.*\)/, "")) + '</span>' +
        '<span class="fd-gn">' + g.length + '개</span><span class="fd-tm">' + e(t1 === t2 ? t2 : t1 + "~" + t2) + '</span>' + scTag(a) +
        (nNew ? '<span class="fd-new">새 글' + (nNew > 1 ? " " + nNew : "") + '</span>' : "") +
        (nPin ? '<span class="fd-gp">📌' + (nPin > 1 ? nPin : "") + '</span>' : "") + '</div>' +
        (nUsed ? '<div class="fd-used">📝 오늘 시황리포트 인용 ' + nUsed + '개</div>' : "") +
        (hit.length ? '<div class="fd-hit">🎯 ' + hit.slice(0, 4).map(e).join(" · ") + '</div>' : "") +
        (op ? "" : '<ul class="fd-gl">' + g.map(function(i){ return '<li>' + (S.used[i.id] ? "📝 " : "") + e(firstLine(i)) + '</li>'; }).join("") + '</ul>') +
        '<div class="fd-ft"><span class="fd-more">' + (op ? "묶음 접기 ▲" : "하나씩 보기 ▼") + '</span><span></span></div>' +
      '</div>' +
      (op ? '<div class="fd-gin">' + g.map(function(i){ return card(i, news); }).join("") + '</div>' : "") +
    '</div>';
  }

  /* 🗣 A10/20-2 (10/20): 내 채널 성적표 — feeds/feed_score.json (market-strategy-report src/feed_score.py · 평일 07:25·16:10)
     채널 글이 이름을 부른 종목을 「글 날짜 뒤 첫 거래일 종가 → 5·20거래일 뒤」로 채점. 사라/팔아라는 안 가림 — 「언급 뒤 올랐나」만.
     5일 채점 MINN 개 전엔 % 대신 「쌓는 중」 · 매수 추천 아님 */
  var MINN = 10;
  function scOf(src){ return S.sc && S.sc.ch ? S.sc.ch[src] || null : null; }
  function pct(v, d){ return v == null ? "–" : (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 1 : d) + "%"; }
  function scTag(it){
    if (it.kind !== "tg" && it.kind !== "blog") return "";
    var g = scOf(it.src); if (!g || !g.n5) return "";
    return g.n5 >= MINN ? '<span class="fd-sc" title="이 채널이 부른 종목, 5거래일 뒤 오른 비율 (' + g.n5 + '건)">📣 5일 적중 ' + g.up5 + '%</span>' : '<span class="fd-sc mut">📣 채점 ' + g.n5 + '/' + MINN + '</span>';
  }
  function stkTags(it){
    var L = S.sc && S.sc.post ? S.sc.post[it.id] : null; if (!L || !L.length) return "";
    return '<div class="fd-stk">🏷 ' + L.map(function(x){ return '<span data-fop="' + e(x[1]) + '">' + e(x[0]) + '</span>'; }).join("") + '</div>';
  }
  function dots(arr){ return (arr || []).slice(0, 12).map(function(r){ var v = r.r5; return '<i class="' + (v == null ? "" : v > 0 ? "su" : "sd") + '" title="' + e(r.d.slice(5).replace("-", "/") + " " + r.n + (v != null ? " " + pct(v) : " 채점 전")) + '"></i>'; }).join(""); }
  function scoreView(){
    var sc = S.sc, ch = sc.ch, ks = Object.keys(ch);
    var ord = SCORD || "ex";   // 시장 전체가 빠진 기간엔 「오른 비율」보다 「지수 대비」가 고르는 눈을 더 정직하게 보여 줌
    ks.sort(function(a, b){ var A = ch[a], B = ch[b], ra = (A.n5 || 0) >= MINN, rb = (B.n5 || 0) >= MINN;
      if (ord === "n") return (B.n || 0) - (A.n || 0);
      if (ra !== rb) return ra ? -1 : 1;
      return ord === "ex" ? (B.ex5 == null ? -99 : B.ex5) - (A.ex5 == null ? -99 : A.ex5) : (B.up5 || 0) - (A.up5 || 0) || (B.avg5 || 0) - (A.avg5 || 0); });
    var bs = sc.base || {};
    var h = '<section class="card fd-scc" data-xc="1"><h3>📣 내 채널 성적표 <span class="mut">최근 ' + (sc.win_days || 90) + '일 언급 · ' + e(String(sc.updated || "").slice(5).replace("-", "/")) + '</span></h3>' +
      '<p class="note" style="margin:0 0 8px">채널 글이 이름을 부른 종목을 <b>글 날짜 뒤 첫 거래일 종가</b>로 잡고 <b>5거래일·20거래일 뒤</b> 값과 비교했어요. 「사라·팔아라」는 가리지 않고 <b>언급 뒤 올랐나</b>만 셌어요. 같은 채널·종목·날은 1번, 종목이 7개 넘게 나온 목록 글은 뺐어요.' +
      (bs.n5 ? ' 모든 채널 합쳐 5일 뒤 오른 비율 <b>' + bs.up5 + '%</b>(' + bs.n5 + '건) — 이 숫자보다 높아야 「고르는 눈」이 있는 셈.' : '') + '</p>' +
      '<div class="fd-sord">' + [["ex", "지수 대비순"], ["hit", "오른 비율순"], ["n", "언급 많은 순"]].map(function(x){ return '<button data-sord="' + x[0] + '"' + (ord === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join("") + '</div>';
    h += ks.map(function(k, i){ var g = ch[k], ok = (g.n5 || 0) >= MINN;
      var src = (S.d.sources || []).filter(function(s){ return s.id === k; })[0] || {};
      return '<div class="fd-scr" data-fk="' + e(k) + '"><div class="fd-scn"><b>' + (ok && ord !== "n" ? (i + 1) + ". " : "") + (IC[src.kind] || "") + " " + e(String(g.name || k).replace(/\s*\(.*\)/, "")) + '</b><span class="mut">언급 ' + g.n + (g.top && g.top.length ? ' · ' + g.top.slice(0, 3).map(e).join("·") : '') + '</span></div>' +
        '<div class="fd-scv">' + (ok ? '<span>5일 뒤 오름 <b class="' + (g.up5 >= (bs.up5 || 50) ? "up" : "dn") + '">' + g.up5 + '%</b></span><span>평균 <b class="' + (g.avg5 > 0 ? "up" : "dn") + '">' + pct(g.avg5) + '</b></span>' + (g.ex5 != null ? '<span>지수 대비 <b class="' + (g.ex5 > 0 ? "up" : "dn") + '">' + pct(g.ex5) + 'p</b></span>' : '') :
          '<span class="mut">5일 채점 ' + (g.n5 || 0) + '/' + MINN + ' — 쌓는 중</span>') + (g.pend ? '<span class="mut">채점 기다림 ' + g.pend + '</span>' : '') +
        ((g.n20 || 0) >= MINN ? '<span>20일 오름 <b>' + g.up20 + '%</b> ' + pct(g.avg20) + '</span>' : (g.n20 ? '<span class="mut">20일 ' + g.n20 + '건</span>' : '')) + '</div>' +
        '<div class="fd-scd">' + dots(g.last) + '</div></div>'; }).join("");
    h += '<p class="note" style="margin:8px 0 0">점 = 최근 채점된 언급 12개(빨강 5일 뒤 오름 · 파랑 내림) · 줄을 누르면 그 채널 글만 · 과거 기록일 뿐 앞으로를 보장하지 않고, 매수 추천도 아니에요.</p></section>';
    return h;
  }
  var SCORD = null;
  function bindScore(b){
    [].forEach.call(b.querySelectorAll("[data-sord]"), function(x){ x.onclick = function(){ SCORD = x.getAttribute("data-sord"); list(); }; });
    [].forEach.call(b.querySelectorAll(".fd-scr[data-fk]"), function(x){ x.onclick = function(){ S.f = x.getAttribute("data-fk"); S.lim = 40; draw(); window.scrollTo(0, 0); }; });
  }

  function list(){
    var b = document.getElementById("fdbody"); if (!b || !S.d) return;
    if (S.f === "SCORE"){ b.innerHTML = scoreView(); bindScore(b); return; }
    var its = S.d.items.filter(pass), news = {};
    (S.d.new || []).forEach(function(i){ news[i] = 1; });
    if (!its.length){ b.innerHTML = '<div class="empty">' + (S.f === "PIN" ? "📌 모아 둔 글이 없어요. 글 오른쪽 📌 를 눌러 모아 두세요." : "해당하는 글이 없어요.") + '</div>'; return; }
    var h = "", day = "", all = its.length;
    S.lim = S.lim || 40; its = its.slice(0, S.lim);          // 처음엔 40개만 — 끝없이 긴 화면 대신 「더 보기」
    grp(its).forEach(function(g){
      var dd = (g[0].at || g[0].first).slice(0, 10);
      if (dd !== day){ day = dd; h += '<div class="fd-day">' + dayLab(dd) + '</div>'; }
      h += g.length > 1 ? grpCard(g, news) : card(g[0], news);
    });
    if (all > its.length) h += '<button class="fd-lim" id="fdlim">더 보기 ▾ <small>' + (all - its.length) + '개 남음</small></button>';
    b.innerHTML = h;
    var lb = document.getElementById("fdlim"); if (lb) lb.onclick = function(){ var y = window.scrollY; S.lim += 60; list(); window.scrollTo(0, y); };
    [].forEach.call(b.querySelectorAll("[data-gid]"), function(el){
      el.onclick = function(ev){
        if (ev.target.closest("a")) return;
        if (window.getSelection && String(window.getSelection()).length) return;
        var id = el.getAttribute("data-gid"); S.gopen[id] = !S.gopen[id];
        var y = window.scrollY; list(); window.scrollTo(0, y);
      };
    });
    [].forEach.call(b.querySelectorAll(".fd-it"), function(el){
      el.onclick = function(ev){
        if (ev.target.closest("a")) return;
        var op = ev.target.closest("[data-fop]");
        if (op){ ev.stopPropagation(); if (window.openOP) openOP(op.getAttribute("data-fop")); return; }
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
    ".fd-it.fd-news{border-left-color:#8a94a8}.fd-it.fd-ai{border-left-color:#7c9cff;background:linear-gradient(160deg,rgba(124,156,255,.08),var(--panel) 60%)}.fd-press{font-weight:400;color:var(--sub)}" +
    ".fd-it.fd-bl,.fd-it.fd-blog{border-left-color:#03c75a}" +
    ".fd-hd{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--sub)}" +
    ".fd-sn{font-weight:700;color:var(--text)}.fd-tm{color:var(--dim)}" +
    ".fd-new{background:#ff6b6b;color:#fff;border-radius:6px;padding:1px 6px;font-size:10.5px;font-weight:700}" +
    ".fd-pin{margin-left:auto;background:none;border:0;font-size:16px;opacity:.25;cursor:pointer;padding:0 2px}.fd-pin.on{opacity:1}" +
    ".fd-ti{font-weight:700;font-size:15.5px;margin:6px 0 2px}" +
    ".fd-used{font-size:12.5px;color:#7c9cff;margin:4px 0}" +
    ".fd-hit{font-size:12.5px;color:#ffb84d;margin:4px 0}" +
    ".fd-tx{font-size:14px;line-height:1.55;margin-top:5px;word-break:break-word}" +
    ".fd-lim{display:block;width:100%;margin:6px 0 14px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}.fd-lim small{color:var(--sub);font-weight:400;margin-left:4px}" +
    ".fd-tx.cl{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}" +
    ".fd-tx mark{background:rgba(255,184,77,.25);color:inherit;border-radius:3px;padding:0 2px}" +
    ".fd-fl{font-size:12.5px;color:var(--sub);margin-top:6px}" +
    ".fd-im{display:flex;gap:6px;overflow-x:auto;margin-top:8px}.fd-im img{height:150px;border-radius:8px;flex:none}" +
    ".fd-ft{display:flex;justify-content:space-between;align-items:center;margin-top:7px;font-size:12.5px}" +
    ".fd-grp{background:var(--panel);border:1px solid var(--line);border-left:3px solid #4aa3ff;border-radius:12px;margin-bottom:8px;box-shadow:3px 3px 0 -1px var(--panel2),3px 3px 0 0 var(--line)}" +
    ".fd-grp.fd-blog{border-left-color:#03c75a}.fd-ghd{padding:10px 12px;cursor:pointer}" +
    ".fd-gn{background:rgba(74,163,255,.16);color:var(--text);border-radius:6px;padding:1px 6px;font-size:11.5px;font-weight:700}" +
    ".fd-gp{margin-left:auto;font-size:13px}" +
    ".fd-gl{list-style:none;margin:7px 0 0;padding:0}.fd-gl li{font-size:14px;line-height:1.5;padding:3px 0 3px 12px;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fd-gl li:before{content:'';position:absolute;left:2px;top:.75em;width:4px;height:4px;border-radius:50%;background:var(--sub)}" +
    ".fd-gl li+li{border-top:1px dashed var(--line)}" +
    ".fd-gin{padding:0 8px 2px}.fd-gin .fd-it{border-left-width:1px;margin-bottom:6px}" +
    ".fd-sc{background:rgba(255,184,77,.16);color:#ffb84d;border-radius:6px;padding:1px 6px;font-size:10.5px;font-weight:700;white-space:nowrap}.fd-sc.mut{background:rgba(138,148,168,.15);color:var(--sub);font-weight:400}" +
    ".fd-stk{display:flex;flex-wrap:wrap;gap:4px;margin:5px 0 0;font-size:12px;color:var(--sub);align-items:center}.fd-stk span{border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--text);cursor:pointer}" +
    ".fd-sord{display:flex;gap:6px;margin:0 0 6px}.fd-sord button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer}.fd-sord button.on{color:var(--text);border-color:#ffb84d;font-weight:700}" +
    ".fd-scr{padding:9px 2px;border-top:1px solid var(--line);cursor:pointer}.fd-scn{display:flex;flex-direction:column;gap:1px}.fd-scn b{font-size:14.5px}.fd-scn .mut{font-size:11.5px}" +
    ".fd-scv{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin-top:3px}.fd-scv b.up{color:var(--up)}.fd-scv b.dn{color:var(--dn)}.fd-scv b{color:var(--text)}" +
    ".fd-scd{display:flex;gap:3px;margin-top:5px}.fd-scd i{width:9px;height:9px;border-radius:50%;background:rgba(138,148,168,.4)}.fd-scd i.su{background:#ff5a5a}.fd-scd i.sd{background:#4d8dff}" +
    ".fd-more{color:var(--sub)}.fd-go{color:var(--c,#f4a261);text-decoration:none;font-weight:700}";
  document.head.appendChild(css);
})();
