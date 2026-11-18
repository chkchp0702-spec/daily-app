/* 📦 app.b01.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 1/7 (views.js … products.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
/* ======== views.js ======== */
/* CH Investing — 탭별 화면 (그림·차트 우선, PDF는 아래 접어두기) */
(function(){
  var e = V.e, rich = V.rich, sgn = V.sgn, cls = V.cls, fmt = V.fmt;

  function card(title, body, extra){ return '<section class="card"><h3>' + title + (extra || "") + '</h3>' + body + '</section>'; }
  function sec(t){ return '<div class="sec">' + t + '</div>'; }
  function fold(title, url){
    var id = "f" + Math.random().toString(36).slice(2, 8);
    setTimeout(function(){ var b = document.getElementById(id); if (b) b.onclick = function(){
      var w = document.createElement("div"); w.innerHTML = pdfCard(title, url); var card = w.firstElementChild;
      var x = document.createElement("button"); x.className = "btn pcl"; x.textContent = "닫기 ✕";
      x.onclick = function(){ var t = document.createElement("div"); t.innerHTML = fold(title, url); var nb = t.firstElementChild; card.parentNode.replaceChild(nb, card);
        var r = nb.getBoundingClientRect(); if (r.top < 0) window.scrollBy(0, r.top - 80); };
      card.querySelector("h3").appendChild(x); b.parentNode.replaceChild(card, b); }; }, 0);
    return '<button class="fold" id="' + id + '">📄 ' + e(title) + ' 펼치기</button>';
  }
  function opBtn(code, label){ return '<a class="btn op" href="javascript:openOP(\'' + e(code).replace(/'/g, "") + '\')">' + (label || "종목리포트") + '</a>'; }
  function chip(t, c){ return '<span class="chip2 ' + (c || "") + '">' + t + '</span>'; }
  function after(el){ V.fillSparks(el); }

  /* 📱 A12-1 (10/15): 컵·갭 카드 이름 — 한글 짧은 이름(archive/x/sig_names.json) · 없으면 영어 꼬리말(Inc.·Common Stock…) 떼기 */
  function cleanNm(n){
    n = String(n || "").replace(/\s+-\s.*$/, "").replace(/\s+-\s*$/, "").replace(/\b(Common Stock|Common Shares|Common stock|Ordinary Shares|Class [A-C]( Ordinary)?( Shares)?|American Depositary Shares?)\b/g, "").trim();
    for (var i = 0; i < 3; i++) n = n.replace(/[,\s]+(Inc\.?|Incorporated|Corporation|Corp\.?|Company( Limited)?|Limited|Ltd\.?|LTD|Co\.?|CO|PLC|plc|N\.V\.|S\.A\.|AG|SE)\s*$/, "").trim();
    return n.replace(/[,\-\s]+$/, "");
  }
  function nmOf(c){ var m = window.SIGNM || {}; return m[c.code] || cleanNm(c.name) || c.code; }
  V.nmOf = nmOf; V.cleanNm = cleanNm;
  window.SIGNMP = window.SIGNMP || getJSON("archive/x/sig_names.json?" + Math.floor(Date.now() / 3600000)).then(function(j){
    window.SIGNM = j || {};
    [].forEach.call(document.querySelectorAll("[data-nmk]"), function(b){ var k = b.getAttribute("data-nmk"); if (window.SIGNM[k]) b.textContent = window.SIGNM[k]; });
    return window.SIGNM;
  }).catch(function(){ window.SIGNM = {}; return {}; });
  function nmB(c){ return '<b data-nmk="' + e(c.code) + '" title="' + e(String(c.name || "").trim()) + '">' + e(nmOf(c)) + '</b>'; }

  /* 📱 A12-4 (10/15): 며칠째 — 정렬 칩 · 3일 안 ● · 20일 넘으면 「식은 신호」 옅게 */
  function ageCls(c){ return c.streak >= 20 ? " old" : ""; }
  function ageDot(c){ return c.streak && c.streak <= 3 ? '<i class="nwdot" title="' + (c.streak <= 1 ? "오늘 처음 들어옴" : c.streak + "일째 — 새로 들어옴") + '">●</i>' : ""; }
  function ageTxt(c){ return c.streak > 1 ? " · " + (c.streak >= 20 ? "🕰 " : "") + c.streak + "일째" : (c.streak === 1 ? " · 🆕 오늘 처음" : ""); }
  function sortSeg(id, list, P){
    list.forEach(function(x, i){ if (x._o == null) x._o = i; });
    setTimeout(function(){ [].forEach.call(document.querySelectorAll("#" + id + " button"), function(b){ b.onclick = function(){
      [].forEach.call(document.querySelectorAll("#" + id + " button"), function(x){ x.classList.toggle("on", x === b); });
      var k = b.dataset.k;
      list.sort(function(a, c){ return k === "new" ? (a.streak || 0) - (c.streak || 0) || a._o - c._o : k === "old" ? (c.streak || 0) - (a.streak || 0) || a._o - c._o : a._o - c._o; });
      P().draw(); }; }); }, 0);
    var n3 = list.filter(function(x){ return x.streak && x.streak <= 3; }).length, n20 = list.filter(function(x){ return x.streak >= 20; }).length;
    return '<div class="seg2 srt" id="' + id + '"><button class="on" data-k="score">점수순</button><button data-k="new">● 새것부터 ' + n3 + '</button><button data-k="old">🕰 오래된 것 ' + n20 + '</button></div>';
  }

  /* ======================= 시황 ======================= */
  var LEDGER = null;
  function ledger(){ return LEDGER ? Promise.resolve(LEDGER) : getJSON("archive/market/ledger.json?" + (M.updated || "")).then(function(j){ LEDGER = j; return j; }).catch(function(){ return null; }); }
  var SC_ORDER = ["A", "B2", "C", "B"];

  RENDER.market = function(it, el){
    var files = it.files, has = function(f){ return files.indexOf(f) >= 0; };
    var txt = files.filter(function(f){ return /\.txt$/.test(f); })[0];
    var pdfs = files.filter(function(f){ return /\.pdf$/.test(f); }).sort(function(a){ return /Summary/i.test(a) ? -1 : 1; });
    var tail = "";
    if (has("review.md")) tail += '<section class="card md" id="mrev">…</section>';
    if (txt) tail += card("카톡 요약", '<div class="txt" id="mtxt">…</div>');
    tail += pdfs.map(function(f){ return fold(/Summary/i.test(f) ? "요약본 PDF" : "전체 리포트 PDF", file("market", it.id, f)); }).join("");
    tail += '<button class="fold" id="dashbtn">📊 전략 대시보드 펼치기</button><div id="dash"></div>';
    el.innerHTML = '<div id="mhead"></div><div id="live"></div><div id="mbody"></div>' + tail;
    marketBoard($("live"));
    if (txt) getText(file("market", it.id, txt)).then(function(t){ $("mtxt") && ($("mtxt").textContent = t); }).catch(function(){ var x = $("mtxt"); if (x) x.innerHTML = '<span class="mut">잠깐 못 불러왔어요 — 새로고침하면 다시 받아요.</span>'; });
    if (has("review.md")) getText(file("market", it.id, "review.md")).then(function(t){ mdInto($("mrev"), t); }).catch(function(){ var x = $("mrev"); if (x) x.innerHTML = '<span class="mut">잠깐 못 불러왔어요 — 새로고침하면 다시 받아요.</span>'; });
    $("dashbtn").onclick = function(){
      $("dashbtn").remove(); $("dash").innerHTML = '<div class="loading">여는 중…</div>';
      getText(RAW + "market-strategy-report/main/docs/index.html").then(function(t){
        $("dash").innerHTML = '<div class="card" style="padding:6px"><iframe class="rep" id="dashf"></iframe></div>';
        var f = $("dashf"); f.onload = function(){ try { var d = f.contentDocument; d.querySelectorAll("a").forEach(function(a){ a.target = "_blank"; }); f.style.height = d.documentElement.scrollHeight + 10 + "px"; } catch(x) {} };
        f.srcdoc = t;
      }).catch(function(){ $("dash").innerHTML = '<div class="loading">대시보드를 못 불러왔어요.</div>'; });
    };
    if (!has("data.json")) return;
    Promise.all([getJSON(file("market", it.id, "data.json")), ledger()]).then(function(r){
      var d = r[0], L = r[1];
      // 1) 오늘의 한 줄
      // A10-4 (10/14): 오늘 결론 한 줄은 얇은 띠로 화면 맨 위(날짜 칩 바로 아래)에 — 판단 칩은 ✅ 할 일 카드에 이미 있어 뺌
      $("mhead").innerHTML = '<section class="hero2 mk-strip"><div class="hero2-k">' + e(d.edition_label || "") + (d.basis ? ' · <span>' + e(d.basis) + '</span>' : '') + '</div>' +
        '<div class="hero2-t">' + rich(d.one_liner || "") + '</div></section>';
      (function(){ var mh = $("mhead"), root = mh && mh.closest("#body"); if (root && root.firstChild !== mh) root.insertBefore(mh, root.firstChild); })();
      var h = "";
      // 2) 핵심 숫자
      if (d.kpis && d.kpis.length) h += sec("오늘의 숫자") + '<div class="kpis2">' + d.kpis.map(function(k){
        return '<div class="kp ' + (k.cls === "up" ? "kp-up" : k.cls === "dn" ? "kp-dn" : "") + '"><small>' + e(k.label) + '</small><b>' + e(k.value) + '</b>' +
               '<span class="' + (k.change_cls === "up" ? "up" : k.change_cls === "dn" ? "dn" : "") + '">' + e(k.change || "") + '</span>' +
               (k.so ? '<p>' + rich(k.so) + '</p>' : '') + '</div>'; }).join("") + '</div>';
      // 3) 경우의 수 확률
      if (L && L.scenarios){
        var sc = L.scenarios.slice().sort(function(a, b){ return SC_ORDER.indexOf(a.code) - SC_ORDER.indexOf(b.code); });
        var hist = L.scenario_history || [], prev = hist.length > 1 ? hist[hist.length - 2] : null;
        var bar = '<div class="stack">' + sc.map(function(s, i){ return '<div style="flex:' + s.pct + ';background:' + V.CAT[i] + '" data-tip="' + e("<b>" + s.code + "</b> " + s.label + " " + s.pct + "%") + '">' + (s.pct >= 10 ? s.pct + "%" : "") + '</div>'; }).join("") + '</div>';
        var rows = sc.map(function(s, i){
          var p0 = prev && prev[s.code] != null ? prev[s.code] : null, dlt = p0 == null ? "" : s.pct - p0;
          var why = d.scenario_desc && d.scenario_desc[s.code];
          return '<div class="scn"><i style="background:' + V.CAT[i] + '"></i><div><b>' + e(s.label) + '</b>' + (why ? '<small>' + e(why) + '</small>' : '') + '</div>' +
                 '<div class="scn-v"><b>' + s.pct + '%</b>' + (dlt ? '<span class="' + (dlt > 0 ? "up" : "dn") + '">' + (dlt > 0 ? "▲" : "▼") + Math.abs(dlt) + '</span>' : (p0 != null ? '<span class="mut">–</span>' : '')) + '</div></div>';
        }).join("");
        h += card("앞으로의 경우의 수", bar + rows + (d.scenario_rule_note ? '<p class="note">' + rich(d.scenario_rule_note) + '</p>' : ""));
      }
      // 4) 자산 배분
      if (L && L.allocation){
        var al = L.allocation.slice().sort(function(a, b){ return b.pct - a.pct; });
        h += card("지금 자산 배분", V.hbars(al.map(function(a){ return {label: e(a.name), v: a.pct, text: a.pct + "%", tip: "<b>" + e(a.name) + "</b> " + a.pct + "%<br>" + e(a.instruments || "")}; }), {max: Math.max.apply(null, al.map(function(a){ return a.pct; })), color: "#3987e5"}) +
                  (d.allocation_note ? '<p class="note">' + rich(d.allocation_note) + '</p>' : ""));
        // ⚡ 킥 포함 자산 배분 (10/10 사용자: "시황에 킥 자산배분 넣고") — 기본 배분에서 현금 일부를 확인된 돌파 종목에 3%씩
        h += '<div id="mkkick"></div>';
        setTimeout(function(){
          fetch("https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/kick.json?" + Math.floor(Date.now() / 300000)).then(function(r){ return r.ok ? r.json() : null; }).then(function(K){
            var box = document.getElementById("mkkick"); if (!box || !K) return;
            var st = K.stat || {}, HL = K.hold || [], kw = HL.reduce(function(s, o){ return s + (o.w || 0); }, 0);
            var nm = function(x){ return String(x || "").replace(/,? (Inc\.?|Corp\.?|Corporation|Company|Ltd\.?|plc|CORP)\b.*$/i, "").replace(/ (Common Stock|Ordinary Shares).*$/i, ""); };
            var sg = function(v){ return v == null ? "–" : (v > 0 ? "+" : "") + (+v).toFixed(1) + "%"; };
            var RB = K.rule && K.rule.base_now, share = RB ? 1 - ((K.rules || {}).sleeve || 0) - ((K.rules || {}).whale_sleeve || 0) : 1, spare = RB ? Math.max(0, (1 - share) * 100 - kw) : 0;
            var rowsK = al.map(function(a){ var k = RB ? Math.round(((RB[a.name] != null ? RB[a.name] : a.pct) * share + (/현금/.test(a.name) ? spare : 0)) * 10) / 10
                                                       : /현금/.test(a.name) ? Math.round((a.pct - kw) * 10) / 10 : a.pct;
              return '<tr><td>' + e(a.name) + '</td><td>' + a.pct + '%</td><td' + (k !== a.pct ? ' class="mk-ch"' : '') + '>' + k + '%</td></tr>'; }).join("") +
              '<tr class="mk-k" data-goto="port~pokick"><td>⚡ 킥 <small>성과 확인된 신호만 · ' + HL.length + '종목</small></td><td>–</td><td><b>' + (Math.round(kw * 10) / 10) + '%</b></td></tr>' +
              HL.map(function(o){ return '<tr class="mk-ko" data-op="' + e(o.code) + '"><td><span class="mk-tg">' + e(o.tags || "") + '</span> ' + e(nm(o.name)) + ' <small>' + e(o.code) + '</small></td><td></td><td>' + (Math.round(o.w * 10) / 10) + '% <small class="' + (o.r >= 0 ? "up" : "dn") + '">' + sg(o.r) + '</small></td></tr>'; }).join("");
            box.outerHTML = card("⚡ 킥 포함 자산 배분 <span class='mut'>기본 vs 킥 — 같은 날 같은 기준</span>",
              '<div class="mk-st"><span>💼 기본 <b class="' + (st.base >= 0 ? "up" : "dn") + '">' + sg(st.base) + '</b></span><span>⚡ 킥 <b class="' + (st.kick >= 0 ? "up" : "dn") + '">' + sg(st.kick) + '</b></span><span>S&P <b>' + sg(st.spy) + '</b></span></div>' +
              '<table class="mk-t"><tr><th></th><th>💼 기본</th><th>⚡ 킥 포함</th></tr>' + rowsK + '</table>' +
              '<p class="note"><a data-goto="port~pofollow">📋 포트에서 따라하기(금액·주 수) ›</a> · ' + (RB ? '🧪 ' + e((K.rule.from || "").slice(5).replace("-", "/")) + '부터 킥 포트는 현금을 국면(「' + e(K.rule.quad || "") + '」 → ' + K.rule.cash + '%)으로 정하고 🐋 고래를 10%로 — 검증 통과한 규칙만. ' : '') + '⚡ 킥 = 기본 배분에서 현금 일부를 떼어 <b>성과가 확인된 신호</b>에만 담은 것 — 🐋 고래 13F 큰 신규 · ☕ 컵 돌파 · 📈 돌파 갭 · 🤫 조용한 매집(표본 20건 차면 자동). 종목 앞 이모티콘이 들어온 이유예요. 자세한 건 💼 포트 탭.</p>');
          }).catch(function(){});
        }, 0);
      }
      // 5) 20일 흐름
      if (L && L.series){
        var fk = L.series.foreign_kospi || [], ty = L.series.us10y || [];
        var two = "";
        if (fk.length) two += '<div class="sub2">코스피 외국인 순매수 (억원)</div>' + V.cols(fk.slice(-20).map(function(x){ return {label: x.date.slice(5).replace("-", "/"), v: x.value, top: Math.round(x.value).toLocaleString(), tip: "<b>" + x.date + "</b><br>" + Math.round(x.value).toLocaleString() + "억 · " + e(x.src || "")}; }), {h: 110});
        if (ty.length) two += '<div class="sub2">미국 10년 금리 (%)</div>' + V.lines([{name: "10년", color: "#d95926", vals: ty.slice(-20).map(function(x){ return x.value; })}], ty.slice(-20).map(function(x){ return x.date.slice(5).replace("-", "/"); }), {h: 140, unit: "%"});
        if (two) h += card("최근 흐름", two);
      }
      // 6) 발동 조건
      if (L && L.conditions){
        h += card("규칙 발동 체크", '<div class="conds">' + L.conditions.map(function(c){
          var on = /발동$/.test(c.state) && !/미발동/.test(c.state), cnt = c.count != null && c.of;
          return '<div class="cond"><div class="cond-h"><span>' + e(c.cond) + '</span>' + chip(e(c.state), on ? "hot" : /진행|절반|시험/.test(c.state) ? "c" : "") + '</div>' +
                 (cnt ? V.progress(c.count, c.of, on ? V.UP : "#3987e5") + '<small>' + c.count + ' / ' + c.of + (c.now ? ' · ' + e(c.now) : '') + '</small>' : (c.now ? '<small>' + e(c.now) + '</small>' : '')) +
                 (c.then ? '<small class="then">→ ' + e(c.then) + '</small>' : '') + '</div>'; }).join("") + '</div>');
      }
      // 7) 판단 이유
      if (d.decision && d.decision.reasons) h += card("오늘의 판단", '<ul class="rs">' + d.decision.reasons.map(function(x){ return "<li>" + rich(x) + "</li>"; }).join("") + '</ul>');
      // 8) 어제 예고 채점 + 기록
      var gr = (d.yesterday_grades || []).map(function(g){ var mk = String(g.mark || "").trim(), m1 = mk.charAt(0), rest = mk.slice(1).trim();
        return '<div class="gr"><span class="gr-m ' + (g.cls === "ok" ? "ok" : g.cls === "no" ? "no" : "") + '">' + e(m1) + '</span><div><b>' + e(g.title) + (rest ? ' <span class="chip2">' + e(rest) + '</span>' : '') + '</b><small>' + rich(g.text) + '</small></div></div>'; }).join("");
      var scd = (d.scorecard_today || []).map(function(s){ var ok = /맞/.test(s.verdict); return '<div class="gr"><span class="gr-m ' + (ok ? "ok" : /틀/.test(s.verdict) ? "no" : "") + '">' + (ok ? "✓" : /틀/.test(s.verdict) ? "✗" : "·") + '</span><div><b>' + rich(s.wrote) + '</b><small>' + rich(s.result) + '</small></div></div>'; }).join("");
      if (gr || scd) h += card("어제 예고 · 오늘 채점", gr + scd);
      // 9) 일정
      if (d.schedule && d.schedule.length) h += card("다가오는 일정", '<div class="tl">' + d.schedule.map(function(s){ return '<div class="tl-i"><span class="tl-w">' + e(s.when) + '</span><div><b>' + rich(s.what) + '</b>' + (s.then ? '<small>→ ' + rich(s.then) + '</small>' : '') + '</div></div>'; }).join("") + '</div>');
      // 10) 틀렸다고 볼 신호
      if (d.falsify && d.falsify.length) h += card("이러면 틀린 것", d.falsify.map(function(f){ return '<div class="gr"><span class="gr-m">!</span><div><b>' + rich(f.claim) + '</b><small>' + rich(f.signal) + (f.dist ? ' · 거리 ' + e(f.dist) : '') + '</small></div></div>'; }).join(""));
      $("mbody").innerHTML = h;
    }).catch(function(){});
  };

  /* ======================= 단타 ======================= */
  // 오늘 알람은 수집(하루 몇 번)을 기다리지 않고 단타 프로그램 원본(tracking.csv)에서 바로 읽기
  function dantaRows(it){
    var td = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    var arc = function(){ return getJSON(file("danta", it.id, "alerts.json")); };
    if (it.id !== td) return arc();
    return dantaLive().then(function(R){
      var k = td.replace(/-/g, "") + "_", n = function(v){ v = parseFloat(v); return isNaN(v) ? null : v; };
      return R.filter(function(r){ return String(r["시각"] || "").indexOf(k) === 0; }).map(function(r){
        var s = r["시각"], ty = (r["유형"] || "").trim();
        return {time: s.slice(9, 11) + ":" + s.slice(11, 13), code: r.code, name: r.name, type: (!ty || /^nan$/i.test(ty)) ? "알람" : ty,
                price: n(r["알람가"]), chg: n(r["당일등락"]), m30: n(r["30분"]), high: n(r["최고"]), low: n(r["최저"]), now: n(r["현재"]),
                exit: r["방금"] ? "방금 뜸" : (r["청산알림"] || "").replace(/nan/ig, "").trim(), stop: n(r["손절"]), t1: n(r["목표1"]), t2: n(r["목표2"])};
      });
    }).catch(function(){ return arc().catch(function(){ return []; }); });
  }
  RENDER.danta = function(it, el){
    Promise.all([dantaRows(it), getJSON("archive/danta/summary.json?" + (M.updated || "")).catch(function(){ return []; })]).then(function(r){
      var rows = r[0], S = r[1];
      rows.sort(function(a, b){ return a.time < b.time ? 1 : -1; });
      var nowv = rows.map(function(x){ return x.now; }).filter(function(v){ return v != null; });
      var avg = nowv.length ? nowv.reduce(function(a, b){ return a + b; }, 0) / nowv.length : null;
      var hiv = rows.map(function(x){ return x.high; }).filter(function(v){ return v != null; });
      var avgHi = hiv.length ? hiv.reduce(function(a, b){ return a + b; }, 0) / hiv.length : null;
      var win = nowv.filter(function(v){ return v > 0; }).length;
      var h = '<div class="warn-test"><div class="wt-i">⚠️</div><div><b>시험 중 · 따라 매매하지 마세요</b>' +
              '<p>아직 성과를 검증하는 단계예요. 알람은 기록·연구용이고, 손실이 날 수 있어요. 투자 판단과 책임은 본인에게 있어요.</p></div></div>' +
              '<div class="sum3"><div class="kv"><small>알람</small><b>' + rows.length + '건</b></div>' +
              '<div class="kv"><small>현재 평균</small><b class="' + cls(avg) + '">' + sgn(avg) + '%</b></div>' +
              '<div class="kv"><small>최고점 평균</small><b class="' + cls(avgHi) + '">' + sgn(avgHi) + '%</b></div>' +
              '<div class="kv"><small>플러스</small><b>' + win + '<span class="mut"> / ' + nowv.length + '</span></b>' + V.progress(win, nowv.length || 1, V.UP) + '</div></div>';
      if (S.length > 1){
        h += card("날짜별 성적 <span class='mut'>현재 수익률 평균</span>", V.cols(S.slice(-20).map(function(s){
          return {label: s.d.slice(5).replace("-", "/"), v: s.now || 0, top: sgn(s.now),
                  tip: "<b>" + s.d + "</b><br>알람 " + s.n + "건 · 플러스 " + s.win + "<br>현재 평균 " + sgn(s.now) + "% · 최고 평균 " + sgn(s.hi) + "%"}; }), {h: 130}) +
          '<div class="lg"><span><i style="background:' + V.UP + '"></i>플러스</span><span><i style="background:' + V.DN + '"></i>마이너스</span><span class="mut">막대를 누르면 자세히</span></div>');
      }
      h += '<div id="bt"></div>' + sec("알람 " + rows.length + "건");
      var qn = rows.filter(function(x){ return x.sent === false; }).length;
      if (qn) h += '<div class="note mut" style="margin:4px 0 8px;font-size:12.5px">🙋 자신 있는 알람만 알림으로 가요 — 오늘 ' + qn + '건은 증거가 모자라 📝 기록만 했어요. 성적이 쌓여 이기는 자리로 확인되면 저절로 알림이 켜져요.</div>';
      if (!rows.length) h += '<div class="empty"><div class="big">⚡</div>오늘은 아직 알람이 없어요.<br><small class="mut">텔레그램으로 알람이 오면 1~5분 안에 여기에도 떠요. 새로고침 해보세요.</small></div>';
      h += '<div class="list">' + rows.map(function(x){
        var ex = x.exit ? chip(e(x.exit), /손절|이탈/.test(x.exit) ? "cool" : "hot") : "";
        var qt = x.sent === false ? '<span class="chip" title="자신 없어 알림은 안 보내고 기록만 한 알람">📝 기록만</span>' : "";
        return '<div class="st' + (x.sent === false ? ' mutey' : '') + '"><div class="row"><div class="nm"><a href="https://m.stock.naver.com/domestic/stock/' + e(x.code) + '/total" target="_blank">' + e(x.name) + '</a><span class="cd">' + e(x.code) + '</span></div>' +
          '<span class="tm">' + e(x.time) + '</span></div>' +
          '<div class="row" style="margin:6px 0 2px;justify-content:flex-start;gap:6px;flex-wrap:wrap">' + chip(e(x.type), "c") + ex + qt + '<span class="tm">알람가 ' + won(x.price) + '원 · 당일 ' + sgn(x.chg) + '%</span></div>' +
          V.range(x.low, x.high, x.now) +
          '<div class="row" style="margin-top:10px"><span class="tm">' + (x.stop ? '🛑 ' + won(x.stop) + ' · 💰 ' + won(x.t1) + (x.t2 ? ' · 💎 ' + won(x.t2) : '') : '30분 후 ' + sgn(x.m30) + '%') + '</span>' + opBtn(x.code) + '</div></div>';
      }).join("") + '</div>';
      el.innerHTML = h;
      backtestCard($("bt"));
    }).catch(function(){ el.innerHTML = '<div class="empty">자료를 못 불러왔어요.</div>'; });
  };

  /* 주간 백테스트 — 막대로 */
  window.backtestCard = function(el){
    if (!el) return;
    fetch("https://api.github.com/repos/chkchp0702-spec/stock-screener/contents/data/backtest").then(function(r){ if (!r.ok) throw 0; return r.json(); }).then(function(list){
      var f = list.filter(function(x){ return /\.csv$/.test(x.name); }).sort(function(a, b){ return a.name < b.name ? 1 : -1; })[0];
      if (!f) throw 0;
      return getText(RAW + "stock-screener/main/data/backtest/" + f.name).then(function(t){
        var rows = parseCSV(t).filter(function(x){ return +x["건수"] >= 5; }).sort(function(a, b){ return (+b["평균"]) - (+a["평균"]); }).slice(0, 8);
        if (!rows.length) throw 0;
        el.innerHTML = card("주간 백테스트 상위 전략 <span class='mut'>" + f.name.slice(0, 8).replace(/(\d{4})(\d\d)(\d\d)/, "$1-$2-$3") + "</span>",
          V.dbars(rows.map(function(x){ return {label: e(x["전략"] || "") + '<small>' + e(x["청산"] || "") + ' · ' + e(x["건수"]) + '건</small>', v: +x["평균"], text: sgn(+x["평균"], 2) + "%"}; })));
      });
    }).catch(function(){ el.innerHTML = ""; });
  };

  /* ======================= 고래 ======================= */
  var WIDX = null, WRANK = null;
  RENDER.whale = function(it, el){
    var has = function(f){ return it.files.indexOf(f) >= 0; };
    var tail = (has("report.html") ? '<button class="fold" id="wrep">🐋 전체 리포트 펼치기</button><div id="wrepbox"></div>' : "") +
               (has("report.pdf") ? fold("PDF 리포트", file("whale", it.id, "report.pdf")) : "");
    el.innerHTML = '<div id="wbody"><div class="loading">불러오는 중…</div></div>' + tail;
    if ($("wrep")) $("wrep").onclick = function(){
      $("wrep").remove(); $("wrepbox").innerHTML = '<div class="card" style="padding:8px"><iframe class="rep" id="wf" src="' + file("whale", it.id, "report.html") + '"></iframe></div>';
      var f = $("wf"); f.onload = function(){ try { f.style.height = f.contentWindow.document.documentElement.scrollHeight + 20 + "px"; } catch(x) {} };
    };
    if (!has("data.json")){ $("wbody").innerHTML = ""; return; }
    Promise.all([
      getJSON(file("whale", it.id, "data.json")),
      WIDX ? Promise.resolve(WIDX) : getJSON("archive/whale/index.json?" + (M.updated || "")).then(function(j){ WIDX = j; return j; }).catch(function(){ return {}; }),
      WRANK ? Promise.resolve(WRANK) : getJSON("archive/whale/ranking.json?" + (M.updated || "")).then(function(j){ WRANK = j; return j; }).catch(function(){ return null; }),
      getJSON("archive/whale/backtest.json?" + (M.updated || "")).catch(function(){ return null; }),
      getJSON("archive/whale/hero_log.json?" + (M.updated || "")).catch(function(){ return null; }),
      getJSON("archive/x/whale_pick.json?" + Math.floor(Date.now() / 300000)).catch(function(){ return null; })
    ]).then(function(r){
      var d = r[0], idx = r[1], rk = r[2], BT = r[3], HERO = r[4], WP = r[5], sg = d.signals || {}, h = "";
      // 10/14 사용자 「고래 픽 기준이 뭐야? 차트·수급·흐름·뉴스로 고래 원픽을」 → 🐋 고래 원픽 (prob_sec.py) · 옛 13F 기준 픽은 아래 한 줄로
      var wp = WP && WP.pick;
      if (wp){
        var PC = {"고래": [25, "#3dd6c6"], "차트": [25, "#7c9cff"], "수급": [15, "#ffb84d"], "흐름": [20, "#c38bff"], "뉴스·실적": [15, "#f4a261"]};
        h += '<section class="hero2 whale-hero"><div class="hero2-k">🐋 고래 원픽 <span class="mut">고래 종목 ' + WP.n_pool + '개 중 · ' + e(WP.at.slice(5)) + '</span></div>' +
             '<div class="row"><div><div class="big-t" style="font-size:24px;line-height:1.25">' + e(wp.n) + ' <span class="mut" style="font-size:13px">' + e(wp.s) + '</span></div><div class="mut">' + wp.tot + '점 / 100 · 지난 20일 ' + (wp.r20 > 0 ? "+" : "") + wp.r20 + '%</div></div>' + opBtn(wp.s, "종목리포트 →") + '</div>' +
             '<div class="wp-parts">' + Object.keys(PC).map(function(k){ var v = wp.parts[k] || 0, mx = PC[k][0];
               return '<div><small>' + k + '</small><span class="xbar" style="flex:1"><i style="width:' + Math.max(0, v / mx * 100).toFixed(0) + '%;background:' + PC[k][1] + '"></i></span><b>' + v.toFixed(0) + '<em>/' + mx + '</em></b></div>'; }).join("") + '</div>' +
             '<div class="wp-why">' + wp.why.map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' +
             '<div class="sp-box" data-spark="' + e(wp.s) + '" data-h="80"></div>' +
             (WP.rank && WP.rank.length > 1 ? '<details class="wp-rk"><summary>2~10위 보기</summary>' + WP.rank.slice(1).map(function(x, i){ return '<a class="wp-r" href="javascript:openOP(\'' + e(x.s) + '\')"><span class="rk">' + (i + 2) + '</span><b>' + e(x.n) + '</b><span class="mut">' + e(x.s) + '</span><b style="margin-left:auto">' + x.tot.toFixed(0) + '점</b></a>'; }).join("") + '</details>' : '') +
             '<p class="note">' + e(WP.how) + (sg.hero && sg.hero !== wp.s ? ' · 옛 기준(13F 점수·실적 임박) 픽: <b>' + e(sg.hero) + '</b>' : '') +
             (WP.log_summ && WP.log_summ.n ? ' · 원픽 성적 ' + WP.log_summ.n + '건 S&P 대비 평균 ' + (WP.log_summ.avg_alpha > 0 ? "+" : "") + WP.log_summ.avg_alpha + '%p, 이긴 비율 ' + WP.log_summ.win + '%' : ' · 성적은 내일부터 쌓여요') + '</p></section>';
      } else if (sg.hero){
        var sc = (sg.top10_score || {})[sg.hero];
        h += '<section class="hero2 whale-hero"><div class="hero2-k">오늘 이것 하나</div><div class="row"><div><div class="big-t">' + e(sg.hero) + '</div>' +
             (sc != null ? '<div class="mut">고래 점수 ' + sc + '</div>' : '') + '</div>' + opBtn(sg.hero, "종목리포트 →") + '</div>' +
             '<div class="sp-box" data-spark="' + e(sg.hero) + '" data-h="80"></div></section>';
      }
      // 고래 지수 vs S&P
      var days = Object.keys(idx || {}).sort();
      if (days.length > 1){
        h += card("고래 지수 vs S&P500 <span class='mut'>1년 수익률</span>", V.lines([
          {name: "고래 40", color: "#199e70", vals: days.map(function(k){ return idx[k].r1y; })},
          {name: "S&P500", color: "#8a94a8", vals: days.map(function(k){ return idx[k].s1y; })}
        ], days.map(function(k){ return k.slice(5).replace("-", "/"); }), {unit: "%", h: 170}));
      }
      // 오늘의 10
      var tops = (sg.top10 || []).map(function(t){ return [t, (sg.top10_score || {})[t] || 0]; });
      var ST = sg.state || {}, stCls = {"매수 검토": "hot", "접근": "c", "보유 점검": "cool"};
      if (tops.length) h += card("오늘의 고래 TOP 10 <span class='mut'>점수 · 상태</span>", V.hbars(tops.map(function(t, i){
        var st = ST[t[0]];
        return {label: '<span class="rk">' + (i + 1) + '</span>' + e(t[0]) + (st && st !== "관찰" ? ' <span class="chip2 ' + (stCls[st] || "") + '" style="font-size:12.5px;padding:1px 6px">' + e(st) + '</span>' : ''),
                v: t[1], text: t[1], attr: ' onclick="openOP(\'' + e(t[0]) + '\')"', tip: "<b>" + e(t[0]) + "</b> 점수 " + t[1] + (st ? " · " + e(st) : "") + "<br>누르면 종목리포트"}; }), {color: "#199e70"}) +
        '<p class="note">상태: 관찰 → 접근(고래 평단 근처) → <b>매수 검토</b>(여러 신호가 겹침)</p>');
      // 신호 묶음 — 📱 A12-2 (10/15): 종목 한 번만 + 묶음 배지 여러 개, 겹친 수 많은 순
      var groups = [["big", "큰 신규 매수", "🆕"], ["mov", "많이 움직임", "💨"], ["near", "평단 근처", "📍"], ["rebound", "반등", "↩️"], ["warn", "주의", "⚠️"]];
      var wsg = {}, word = [];
      groups.forEach(function(g, gi){ (sg[g[0]] || []).slice(0, 10).forEach(function(t){ var s = typeof t === "string" ? t : (t.t || t.ticker || t[0] || ""); if (!s) return;
        if (!wsg[s]){ wsg[s] = []; word.push(s); } if (wsg[s].indexOf(gi) < 0) wsg[s].push(gi); }); });
      word.sort(function(a, b){ return wsg[b].length - wsg[a].length || (wsg[a].indexOf(4) >= 0) - (wsg[b].indexOf(4) >= 0) || word.indexOf(a) - word.indexOf(b); });
      var used = groups.filter(function(g, gi){ return word.some(function(s){ return wsg[s].indexOf(gi) >= 0; }); });
      var multi = word.filter(function(s){ return wsg[s].length >= 2; }), top = multi.filter(function(s){ return wsg[s].length === wsg[multi[0]].length; });
      var gh = word.length ? '<div id="wsig"></div>' + (multi.length ? '<p class="wsg-top">🔥 오늘 <b>' + wsg[multi[0]].length + '묶음</b>에 겹친 이름: ' + top.map(function(s){ return '<a href="javascript:openOP(\'' + e(s) + '\')"><b>' + e(s) + '</b></a>'; }).join(" · ") + (multi.length > top.length ? ' <span class="mut">· 2묶음 이상 ' + multi.length + '개</span>' : '') + '</p>' : '') +
        '<div class="wsg">' + word.map(function(s){ var gs = wsg[s], warn = gs.indexOf(4) >= 0 && gs.length === 1;
          return '<a class="chip2 wsgc' + (gs.length >= 2 ? " hot" : warn ? " cool" : "") + '" data-g="' + gs.map(function(i){ return groups[i][0]; }).join(" ") + '" href="javascript:openOP(\'' + e(s) + '\')" title="' + gs.map(function(i){ return groups[i][1]; }).join(" · ") + '">' + e(s) + ' <span class="wsgi">' + gs.map(function(i){ return groups[i][2]; }).join("") + '</span></a>'; }).join("") + '</div>' +
        '<p class="note wsg-k">' + used.map(function(g){ return g[2] + " " + g[1]; }).join(" · ") + '</p>' : "";
      if (gh) h += card("오늘의 신호 <span class='mut'>" + word.length + "종목 · 겹친 순</span>", gh);
      // 가장 많이 보유
      if (d.hold && d.hold.length){
        var secs = {}; d.hold.forEach(function(x){ secs[x[2]] = (secs[x[2]] || 0) + 1; });
        var secList = Object.keys(secs).sort(function(a, b){ return secs[b] - secs[a]; });
        h += card("고래들이 함께 든 종목 <span class='mut'>보유 곳 수</span>", V.hbars(d.hold.slice(0, 12).map(function(x){
          return {label: e(x[0]) + '<small>' + e(x[2]) + '</small>', v: x[1], text: x[1] + "곳", attr: ' onclick="openOP(\'' + e(x[0]) + '\')"'}; }), {color: "#3987e5"}) +
          '<div class="sub2">섹터 구성 (상위 25종목)</div>' + V.donut(secList.slice(0, 5).map(function(s, i){ return {label: s, v: Math.round(secs[s] / d.hold.length * 100), color: V.CAT[i]}; })
            .concat(secList.length > 5 ? [{label: "기타", v: Math.round(secList.slice(5).reduce(function(a, s){ return a + secs[s]; }, 0) / d.hold.length * 100), color: "#5d667a"}] : []), d.hold.length + "종목", "상위"));
      }
      // 고래 행동별 성적 (검증)
      if (BT && BT.zones){
        var ZN = {bigbuy: ["큰 신규 매수", "포트 2%+ 새로 담음"], chase: ["오른 종목을 삼", "추격 매수"], profit: ["오른 종목을 팖", "차익 실현"],
                  flee: ["떨어진 종목을 팖", "손절·이탈"], contra: ["떨어진 종목을 삼", "역발상 매수"]};
        var zk = Object.keys(ZN).filter(function(k){ return BT.zones[k]; });
        h += card("고래 행동별 이후 성적 <span class='mut'>" + e(BT.quarter || "") + " 공시 후 · S&P " + sgn(BT.bench) + "%</span>",
          V.dbars(zk.map(function(k){ var z = BT.zones[k];
            return {label: e(ZN[k][0]) + '<small>' + e(ZN[k][1]) + ' · ' + z.n + '건 · 승률 ' + Math.round(z.win) + '%</small>', v: z.avg, text: sgn(z.avg) + "%",
                    tip: "<b>" + e(ZN[k][0]) + "</b><br>평균 " + sgn(z.avg) + "% · 승률 " + Math.round(z.win) + "%<br>최고 " + e(z.best) + " " + sgn(z.best_r) + "%"}; })) +
          '<p class="note">고래가 같은 행동을 했던 종목들이 그 뒤 실제로 얼마나 올랐는지 · 같은 기간 S&P500은 ' + sgn(BT.bench) + '%</p>');
      }
      if (HERO){
        var hd = Object.keys(HERO).sort().reverse().slice(0, 7);
        h += card("「오늘 이것 하나」 지난 기록", '<div id="herolog">' + hd.map(function(dd){ var x = HERO[dd];
          return '<div class="hl" data-sym="' + e(x.sym) + '" data-px="' + x.px + '"><span class="tm">' + dd.slice(5).replace("-", "/") + '</span><a href="javascript:openOP(\'' + e(x.sym) + '\')"><b>' + e(x.sym) + '</b></a>' +
                 '<span class="tm">' + fmt(x.px) + ' →</span><b class="hl-r">…</b></div>'; }).join("") + '</div><p class="note">추천일 가격 → 최근 종가 수익률</p>');
      }
      // 투자자 순위
      if (rk){
        var best = function(arr){ return (arr || []).slice().sort(function(a, b){ return (b.ret_1y || 0) - (a.ret_1y || 0); }).slice(0, 20); };
        var bars = function(arr){ return V.dbars(best(arr).map(function(m){ return {label: e(m.name) + ' <span class="mgr-go">보유 종목 ›</span><small>' + e(m.quarter || "") + '</small>', v: m.ret_1y, text: sgn(m.ret_1y) + "%",
          attr: ' data-mgr="' + e(m.name) + '" role="button" onclick="openMgr(this.getAttribute(\'data-mgr\'))"'}; })); };
        h += card("수익률 상위 고래 <span class='mut'>1년 · 누르면 보유 종목</span>", '<div class="seg2" id="wseg"><button class="on" data-k="i">기관</button><button data-k="p">유명인</button></div><div id="wrk">' + bars(rk.institutions) + '</div>');
        setTimeout(function(){ [].forEach.call(document.querySelectorAll("#wseg button"), function(b){ b.onclick = function(){
          [].forEach.call(document.querySelectorAll("#wseg button"), function(x){ x.classList.toggle("on", x === b); });
          $("wrk").innerHTML = bars(b.dataset.k === "i" ? rk.institutions : rk.people); }; }); }, 0);
      }
      $("wbody").innerHTML = h;
      after($("wbody"));
      [].forEach.call(document.querySelectorAll("#herolog .hl"), function(row){
        V.price(row.getAttribute("data-sym")).then(function(p){ var el = row.querySelector(".hl-r"); if (!p){ el.textContent = "–"; return; }
          var r_ = (p[1] / +row.getAttribute("data-px") - 1) * 100; el.textContent = sgn(r_) + "%"; el.className = "hl-r " + cls(r_); }); });
    }).catch(function(){ $("wbody").innerHTML = ""; });
  };

  /* ======================= 컵·갭 공통 ======================= */
  function marketBars(by, seg){
    var ks = Object.keys(by || {}).sort(function(a, b){ return by[b] - by[a]; });
    return V.hbars(ks.map(function(k){ return {label: (V.FLAGS[k] || "") + " " + (V.MKT[k] || k) + (seg ? ' <span class="hgo">›</span>' : ''), v: by[k], text: by[k] + "개",
      attr: seg ? ' data-jump="' + seg + '|' + k + '" style="cursor:pointer"' : ''}; }));
  }
  function secBars(bySec, seg, color){
    return V.hbars(bySec.filter(function(x){ return x[0] !== "미분류" && x[0] !== "-"; }).slice(0, 6).map(function(s){
      return {label: e(s[0]) + (seg ? ' <span class="hgo">›</span>' : ''), v: s[1], text: s[1], attr: seg ? ' data-jump="' + seg + '|ALL|' + e(s[0]) + '" style="cursor:pointer"' : ''}; }), {color: color});
  }
  /* 지도·막대를 누르면 아래 목록을 그 나라·섹터로 거르고 그 자리로 바로 이동 */
  window.PAGERS = window.PAGERS || {};
  function jumpTo(seg, key){
    var P = window.PAGERS[seg]; if (!P) return;
    var m = key.split("|")[0];
    // 뒤로가기로 「누르기 전 자리」에 돌아오도록 기록을 하나 남김 (같은 화면이라 다시 그리지 않음)
    try { history.replaceState(Object.assign({}, history.state || {}, navSnap()), ""); var pg = {}; pg[seg] = key;
      history.pushState({t: "go", key: cur, id: curDate, d: navD() + 1, pg: pg}, "", location.pathname + "#" + cur); updBack(); } catch(e) {}
    [].forEach.call(document.querySelectorAll("#" + seg + " button"), function(b){ b.classList.toggle("on", b.dataset.k === m); });
    P.set(key);
    var t = $(seg); if (t) window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth"});
  }
  window.jumpTo = jumpTo;
  window.mapCard = function(){ return mapCard.apply(null, arguments); };
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-jump]"); if (!t) return;
    var v = t.getAttribute("data-jump"), i = v.indexOf("|"); jumpTo(v.slice(0, i), v.slice(i + 1));
  });
  /* 오늘 지도: 나라 × 섹터 표. 숫자 = 그 나라·섹터 목록으로, 국기 = 그 나라 전체로 */
  function mapCard(icon, what, list, seg, rgb){
    var g = {}, bm = {}, secs = {};
    list.forEach(function(x){ var m = x.mkt, sc = x.sector || "미분류"; g[m] = g[m] || {}; g[m][sc] = (g[m][sc] || 0) + 1; bm[m] = (bm[m] || 0) + 1; if (sc !== "미분류" && sc !== "-") secs[sc] = (secs[sc] || 0) + 1; });
    var mk = Object.keys(bm).sort(function(x, y){ return bm[y] - bm[x]; });
    var sl = Object.keys(secs).sort(function(x, y){ return secs[y] - secs[x]; }).slice(0, 8), mx = 1;
    if (!mk.length || !sl.length) return "";
    mk.forEach(function(m){ sl.forEach(function(s){ mx = Math.max(mx, g[m][s] || 0); }); });
    return card(icon + " 오늘 " + what + " 지도 <span class='mut'>" + list.length + "개 · 숫자를 누르면 그 종목들로</span>",
      '<div class="hm cgmap"><table><thead><tr><th></th>' + mk.map(function(m){ return '<th data-jump="' + seg + '|' + m + '" style="cursor:pointer">' + (V.FLAGS[m] || m) + '</th>'; }).join("") + '</tr></thead><tbody>' +
      sl.map(function(s){ return '<tr><th data-jump="' + seg + '|ALL|' + e(s) + '" style="cursor:pointer">' + e(s) + '</th>' + mk.map(function(m){ var v = g[m][s] || 0;
        return '<td' + (v ? ' data-jump="' + seg + '|' + m + '|' + e(s) + '" style="cursor:pointer;background:rgba(' + rgb + ',' + (.14 + v / mx * .7).toFixed(2) + ')"' : '') + '>' + (v || "") + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>' +
      '<p class="note">진할수록 많은 곳. 숫자 = 그 나라·섹터, 국기 = 그 나라 전체, 섹터 이름 = 모든 나라의 그 섹터.</p>');
  }
  function filterSeg(id, list, cb){
    var mk = {}; list.forEach(function(x){ mk[x.mkt] = (mk[x.mkt] || 0) + 1; });
    setTimeout(function(){ [].forEach.call(document.querySelectorAll("#" + id + " button"), function(b){ b.onclick = function(){
      [].forEach.call(document.querySelectorAll("#" + id + " button"), function(x){ x.classList.toggle("on", x === b); }); cb(b.dataset.k); }; }); }, 0);
    return '<div class="seg2" id="' + id + '"><button class="on" data-k="ALL">전체 ' + list.length + '</button>' + Object.keys(mk).sort(function(a, b){ return mk[b] - mk[a]; }).map(function(k){
      return '<button data-k="' + k + '">' + (V.FLAGS[k] || "") + ' ' + mk[k] + '</button>'; }).join("") + '</div>';
  }
  function pager(boxId, list, render){
    var shown = 12, sel = "ALL";
    function draw(){
      var sp = sel.split("|"), L = list.filter(function(x){ return (sp[0] === "ALL" || x.mkt === sp[0]) && (!sp[1] || (x.sector || "미분류") === sp[1]); });
      var box = $(boxId); if (!box) return;
      box.innerHTML = (sp[1] ? '<div class="pg-f">' + (sp[0] === "ALL" ? "🌐" : (V.FLAGS[sp[0]] || "")) + ' <b>' + e(sp[1]) + '</b> ' + L.length + '개 <button class="btn" id="' + boxId + 'x">✕ 섹터 해제</button></div>' : '') + '<div class="cgrid">' + L.slice(0, shown).map(render).join("") + '</div>' +
        (L.length > shown ? '<button class="more" id="' + boxId + 'm">더 보기 (' + (L.length - shown) + '개 남음)</button>' : "");
      if ($(boxId + "m")) $(boxId + "m").onclick = function(){ shown += 12; draw(); };
      if ($(boxId + "x")) $(boxId + "x").onclick = function(){ sel = sp[0]; shown = 12; draw(); };
      after(box);
    }
    return {draw: draw, set: function(k){ sel = k; shown = 12; draw(); }, get: function(){ return sel; }};
  }
  function stat(label, v){ return '<div><small>' + label + '</small><b>' + v + '</b></div>'; }

  function eyeLine(d, what){
    var y = d && d.eye; if (!y || !y.done) return "";
    return '<p class="eye">👁 차트를 눈으로 확인해 ' + what + '으로 보이는 종목만 담았어요</p>';
  }
  /* ======================= 컵차트 ======================= */
  RENDER.cup = function(it, el){
    var pdf = it.files.indexOf("report.pdf") >= 0 ? fold("컵앤핸들 PDF 리포트", file("cup", it.id, "report.pdf")) : "";
    if (it.files.indexOf("cards.json") < 0){ el.innerHTML = pdfCard("컵앤핸들 리포트", file("cup", it.id, "report.pdf")); return; }
    getJSON(file("cup", it.id, "cards.json")).then(function(d){
      var cupCard = function(c){
        var near = c.dist != null && c.dist > -5 && c.dist <= 0;
        return '<div class="cc' + ageCls(c) + '"><div class="row"><div class="nm2">' + ageDot(c) + (V.FLAGS[c.mkt] || "") + ' ' + nmB(c) + '<span class="cd">' + e(c.code) + '</span></div>' +
          (c.brk ? chip("돌파", "hot") : near ? chip("돌파 임박", "c") : chip("기준가까지 " + sgn(-c.dist) + "%", "")) + '</div>' +
          '<div class="sp-box" data-spark="' + e(c.code) + '"' + (c.pivot ? ' data-ref="' + c.pivot + '" data-label="매수기준 ' + fmt(c.pivot) + '"' : '') + '></div>' +
          '<div class="st4">' + stat("컵 깊이", c.depth != null ? c.depth.toFixed(0) + "%" : "–") + stat("기간", c.weeks != null ? c.weeks.toFixed(0) + "주" : "–") +
          stat("손잡이", c.handle != null ? c.handle.toFixed(0) + "%" : "–") + stat("주가강도", c.rs != null ? c.rs.toFixed(0) : "–") + '</div>' +
          (c.point ? '<p class="pt">' + e(c.point) + '</p>' : '') +
          '<div class="row"><span class="tm">' + e(c.sector || "") + (c.shape ? " · " + e(c.shape) : "") + ageTxt(c) + '</span>' + opBtn(c.code) + '</div></div>';
      };
      var h = '<div class="sum3"><div class="kv"><small>컵 패턴 종목</small><b>' + d.total.toLocaleString() + '</b></div><div class="kv"><small>사상최고가 돌파</small><b class="up">' + d.ath.length + '</b></div>' +
              '<div class="kv"><small>돌파 완료</small><b>' + d.top.filter(function(c){ return c.brk; }).length + '<span class="mut"> / 상위 ' + d.top.length + '</span></b></div></div>';
      h += eyeLine(d, '컵');
      h += mapCard("🗺️", "컵", (d.ath || []).concat(d.top.filter(function(c){ return !(d.ath || []).some(function(x){ return x.code === c.code; }); })), "cseg", "255,184,77");
      h += '<div class="g2">' + card("나라별 <span class='mut'>누르면 그 나라</span>", marketBars(d.by_mkt, "cseg")) + card("많이 나온 섹터 <span class='mut'>누르면 그 섹터</span>", secBars(d.by_sec, "cseg", "#c98500")) + '</div>';
      if (d.ath.length) h += sec("★ 사상최고가 돌파") + '<div class="cgrid">' + d.ath.map(cupCard).join("") + '</div>';
      h += sec("컵 점수 상위 " + d.top.length) + filterSeg("cseg", d.top, function(k){ P.set(k); }) + sortSeg("csrt", d.top, function(){ return P; }) + '<div id="cbox"></div>' + pdf;
      el.innerHTML = h;
      var P = pager("cbox", d.top, cupCard); P.draw(); window.CUPP = P; window.PAGERS.cseg = P;
      after(el);
    }).catch(function(){ el.innerHTML = pdfCard("컵앤핸들 리포트", file("cup", it.id, "report.pdf")); });
  };

  /* ======================= 갭차트 ======================= */
  RENDER.gap = function(it, el){
    var pdf = it.files.indexOf("report.pdf") >= 0 ? fold("갭 돌파 PDF 리포트", file("gap", it.id, "report.pdf")) : "";
    if (it.files.indexOf("cards.json") < 0){ el.innerHTML = pdfCard("갭 돌파 리포트", file("gap", it.id, "report.pdf")); return; }
    getJSON(file("gap", it.id, "cards.json")).then(function(d){
      var gapCard = function(c){
        return '<div class="cc' + ageCls(c) + '"><div class="row"><div class="nm2">' + ageDot(c) + (V.FLAGS[c.mkt] || "") + ' ' + nmB(c) + '<span class="cd">' + e(c.code) + '</span></div>' +
          chip("갭 +" + (c.gap != null ? c.gap.toFixed(1) : "–") + "%", "hot") + '</div>' +
          '<div class="sp-box" data-spark="' + e(c.code) + '"' + (c.boxlo && c.boxhi ? ' data-band="' + c.boxlo + ',' + c.boxhi + '"' : '') + (c.gopen ? ' data-ref="' + c.gopen + '" data-label="갭 시가 ' + fmt(c.gopen) + '"' : '') + '></div>' +
          '<div class="st4">' + stat("갭 날짜", (c.gday || "").slice(5).replace("-", "/")) + stat("거래량", c.vol != null ? c.vol.toFixed(1) + "배" : "–") +
          stat("박스", c.boxw != null ? c.boxw.toFixed(0) + "주" : "–") + stat("주가강도", c.rs != null ? c.rs.toFixed(0) : "–") + '</div>' +
          '<div class="tags">' + (c.full ? chip("완전돌파", "c") : "") + (c.hold ? chip("갭 유지", "") : chip("갭 메움", "cool")) + (c.fresh ? chip("막 돌파", "hot") : "") + (c.new ? chip("NEW", "c") : "") + '</div>' +
          (c.point ? '<p class="pt">' + e(c.point) + '</p>' : '') +
          '<div class="row"><span class="tm">' + e(c.sector || "") + ageTxt(c) + '</span>' + opBtn(c.code) + '</div></div>';
      };
      var held = d.top.filter(function(c){ return c.hold; }).length;
      var h = '<div class="sum3"><div class="kv"><small>갭 돌파 종목</small><b>' + d.total.toLocaleString() + '</b></div>' +
              '<div class="kv"><small>상위 평균 갭</small><b class="up">+' + (d.top.reduce(function(a, c){ return a + (c.gap || 0); }, 0) / (d.top.length || 1)).toFixed(1) + '%</b></div>' +
              '<div class="kv"><small>갭 유지</small><b>' + held + '<span class="mut"> / ' + d.top.length + '</span></b>' + V.progress(held, d.top.length || 1, V.UP) + '</div></div>';
      h += eyeLine(d, '갭 상승');
      h += mapCard("🗺️", "갭", d.top, "gseg", "144,133,233");
      h += '<div class="g2">' + card("나라별 <span class='mut'>누르면 그 나라</span>", marketBars(d.by_mkt, "gseg")) + card("많이 나온 섹터 <span class='mut'>누르면 그 섹터</span>", secBars(d.by_sec, "gseg", "#9085e9")) + '</div>';
      h += '<p class="note" style="margin:0 2px 10px">차트의 옅은 띠 = 갭 전 박스(횡보 구간), 점선 = 갭 시가</p>';
      h += sec("갭 점수 상위 " + d.top.length) + filterSeg("gseg", d.top, function(k){ P.set(k); }) + sortSeg("gsrt", d.top, function(){ return P; }) + '<div id="gbox"></div>' + pdf;
      el.innerHTML = h;
      var P = pager("gbox", d.top, gapCard); P.draw(); window.GAPP = P; window.PAGERS.gseg = P;
    }).catch(function(){ el.innerHTML = pdfCard("갭 돌파 리포트", file("gap", it.id, "report.pdf")); });
  };

  /* ======================= 관심섹터 ======================= */
  function parseBrief(t){
    var plain = t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    var lines = plain.split("\n").map(function(s){ return s.trim(); });
    var out = {global: [], us: [], kr: [], usW: [], krW: [], picks: []}, mode = "";
    var items = function(s){ var r = []; s.replace(/([^,·]+?)\s*([+\-−]\d+(?:\.\d+)?)%/g, function(_, n, v){ r.push([n.trim(), parseFloat(v.replace("−", "-"))]); }); return r; };
    lines.forEach(function(l){
      if (/간밤 글로벌/.test(l)){ mode = "g"; return; }
      if (/미국 섹터/.test(l)){ mode = "us"; return; }
      if (/한국 테마/.test(l)){ mode = "kr"; return; }
      if (/지난 1주/.test(l)){ mode = "w"; return; }
      if (/오늘 이 섹터/.test(l) || /^━/.test(l)){ mode = "x"; return; }
      if (mode === "g" && /%/.test(l) && !/VIX/.test(l)) out.global = out.global.concat(items(l));
      if (mode === "g" && /VIX/.test(l)) out.macro = l;
      if ((mode === "us" || mode === "kr") && /^(강세|약세)/.test(l)) out[mode] = out[mode].concat(items(l.replace(/^(강세|약세)\s*/, "")));
      if (mode === "w"){ var it = items(l.replace(/^\S+\s*(상위|하위)\s*/, "")); if (/🇺🇸/.test(l)) out.usW = out.usW.concat(it); else if (/🇰🇷/.test(l)) out.krW = out.krW.concat(it); }
      if (mode === "x" && /^•/.test(l)) out.picks.push(l.replace(/^•\s*/, ""));
    });
    var dedupe = function(a){ var s = {}; return a.filter(function(x){ if (s[x[0]]) return false; s[x[0]] = 1; return true; }).sort(function(a, b){ return b[1] - a[1]; }); };
    ["us", "kr", "usW", "krW"].forEach(function(k){ out[k] = dedupe(out[k]); });
    return out;
  }
  RENDER.sector = function(it, el){
    var has = function(f){ return it.files.indexOf(f) >= 0; };
    el.innerHTML = '<div id="tlog"></div><div id="sbody"><div class="loading">불러오는 중…</div></div>';
    themeLog($("tlog"), it.id.slice(0, 10));
    var jobs = [
      has("briefing.txt") ? getText(file("sector", it.id, "briefing.txt")) : Promise.resolve(""),
      has("top.json") ? getJSON(file("sector", it.id, "top.json")) : Promise.resolve(null),
      has("returns.csv") ? getText(file("sector", it.id, "returns.csv")) : Promise.resolve("")
    ];
    Promise.all(jobs).then(function(r){
      var t = r[0], top = r[1], ret = r[2], h = "", b = t ? parseBrief(t) : null;
      if (top && top.top && top.top.length){
        var pickMap = {};
        if (b) b.picks.forEach(function(p){ var m = p.match(/^(\S.*?)\s+전일/); if (m) pickMap[m[1].trim()] = p.replace(m[1], "").replace(/^\s*/, ""); });
        var mx = Math.max.apply(null, top.top.map(function(x){ return x.score; }));
        h += sec("🇰🇷 한국 아침 브리핑 픽 <span class='mut'>" + e(String(top.date || it.id).slice(5, 10).replace("-", "/")) + " · 한국 섹터만 · 나라별은 위 「🎯 오늘 이 업종·종목을 보자」</span>") + top.top.map(function(x, i){
          return '<section class="card sect"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n">' + e(x.sector) + '</b></div><span class="mut">점수 ' + x.score.toFixed(2) + '</span></div>' +
            V.progress(Math.max(0, x.score), mx, V.CAT[i % 6]) +
            '<div class="picks">' + (x.picks || []).map(function(p){ return '<a class="pick" href="javascript:openOP(\'' + e(p).replace(/'/g, "") + '\')"><b>' + e(p) + '</b>' + (pickMap[p] ? '<small>' + e(pickMap[p]) + '</small>' : '') + '</a>'; }).join("") + '</div></section>';
        }).join("");
      }
      if (b && b.global.length) h += card("🌍 간밤 글로벌", '<div class="gchips">' + b.global.map(function(g){ return '<div class="gc"><small>' + e(g[0]) + '</small><b class="' + cls(g[1]) + '">' + sgn(g[1]) + '%</b></div>'; }).join("") + '</div>' + (b.macro ? '<p class="note">' + e(b.macro) + '</p>' : ""));
      if (b && (b.us.length || b.kr.length)){
        h += card("전일 섹터 등락", '<div class="seg2" id="sseg"><button class="on" data-k="kr">🇰🇷 한국 테마</button><button data-k="us">🇺🇸 미국 섹터</button>' +
          (b.krW.length || b.usW.length ? '<button data-k="w">📅 1주</button>' : '') + '</div><div id="sdb">' + V.dbars(b.kr.map(function(x){ return {label: e(x[0]), v: x[1]}; })) + '</div>');
        setTimeout(function(){ [].forEach.call(document.querySelectorAll("#sseg button"), function(x){ x.onclick = function(){
          [].forEach.call(document.querySelectorAll("#sseg button"), function(y){ y.classList.toggle("on", y === x); });
          var k = x.dataset.k;
          $("sdb").innerHTML = k === "w" ? '<div class="sub2">🇰🇷 한국</div>' + V.dbars(b.krW.map(function(z){ return {label: e(z[0]), v: z[1]}; })) + '<div class="sub2">🇺🇸 미국</div>' + V.dbars(b.usW.map(function(z){ return {label: e(z[0]), v: z[1]}; }))
                                     : V.dbars(b[k].map(function(z){ return {label: e(z[0]), v: z[1]}; })); }; }); }, 0);
      }
      if (ret){
        var rows = parseCSV(ret), cols_ = Object.keys(rows[0] || {}).filter(function(k){ return k && k !== ""; }).slice(1);
        var key0 = Object.keys(rows[0] || {})[0];
        var mx2 = {}; cols_.forEach(function(c){ mx2[c] = Math.max.apply(null, rows.map(function(x){ return Math.abs(+x[c]) || 0; })) || 1; });
        h += card("섹터 히트맵 <span class='mut'>기간별 수익률 · 섹터를 누르면 종목</span>", '<div class="hm"><table><thead><tr><th></th>' + cols_.map(function(c){ return '<th>' + e(c) + '</th>'; }).join("") + '</tr></thead><tbody>' +
          rows.map(function(x){ return '<tr class="hrow" data-hsec="' + e(x[key0]) + '"><th>' + e(x[key0]) + ' <span class="hgo">›</span></th>' + cols_.map(function(c){ var v = x[c] === "" ? null : +x[c];
            return '<td style="background:' + V.heat(v, mx2[c]) + '" data-tip="' + e("<b>" + x[key0] + "</b> " + c + " " + sgn(v) + "%") + '">' + (v == null ? "" : sgn(v, Math.abs(v) >= 100 ? 0 : 1)) + '</td>'; }).join("") + '</tr>'; }).join("") +
          '</tbody></table></div>');
      }
      if (t) h += '<button class="fold" id="brfb">📝 원문 브리핑 펼치기</button><div id="brfbox"></div>';
      $("sbody").innerHTML = h || '<div class="empty">자료 없음</div>';
      if ($("brfb")) $("brfb").onclick = function(){ $("brfb").remove();
        var safe = e(t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")).replace(/&lt;(\/?)(b|i)&gt;/g, "<$1$2>");
        $("brfbox").innerHTML = card("원문 브리핑", '<div class="txt">' + safe.trim() + '</div>'); };
    });
  };

  /* ======================= 조용한 매집 ======================= */
  RENDER.accum = function(it, el){
    getJSON(file("accum", it.id, "list.json")).then(function(rows){
      var strong = rows.filter(function(r){ return r.tag === "강한 매집"; }).length, dist = rows.filter(function(r){ return r.dist; }).length;
      // 10/12 참고용으로 낮춤: 2012~ 검증에서 매집 신호·점수·「강한 매집」 모두 지수·아무 종목보다 못함 (market-strategy-report brain/accum_lab.md)
      var h = '<div class="sum3"><div class="kv"><small>거래량 이상</small><b>' + rows.length + '</b></div><div class="kv"><small>분배 의심</small><b class="dn">' + dist + '</b></div><div class="kv"><small>미국</small><b>' + rows.filter(function(r){ return r.mkt === "US"; }).length + '</b></div></div>';
      h += card("거래량 이상 종목 <span class='mut'>거래량 배수 순 · 점수는 성과와 무관해서 뺐어요</span>", V.hbars(rows.slice().sort(function(a, b){ return (b.vol || 0) - (a.vol || 0); }).slice(0, 10).map(function(r){ return {label: (V.FLAGS[r.mkt] || "") + " " + e(r.name.length > 14 ? r.name.slice(0, 13) + "…" : r.name) + ' <em class="tk">' + e(V.cd(r.code)) + '</em>', v: r.vol || 0, text: r.vol != null ? r.vol.toFixed(1) + "배" : "–",
        color: r.dist ? V.DN : "#8a93a6", attr: ' onclick="openOP(\'' + e(r.code) + '\')"', tip: "<b>" + e(r.name) + "</b><br>거래량 " + fmt(r.vol) + "배 · 한달 " + sgn(r.m1) + "%"}; })) +
        '<div class="lg"><span><i style="background:#8a93a6"></i>거래량 이상</span><span><i style="background:' + V.DN + '"></i>분배 의심</span></div>');
      h += sec("종목 카드") + filterSeg("aseg", rows, function(k){ P.set(k); }) + '<div id="abox"></div>';
      el.innerHTML = h;
      var aCard = function(r){
        var link = r.mkt === "KR" ? "https://m.stock.naver.com/domestic/stock/" + r.code + "/total" : "https://finance.yahoo.com/quote/" + r.code;
        return '<div class="cc"><div class="row"><div class="nm2">' + (V.FLAGS[r.mkt] || "") + ' <a href="' + link + '" target="_blank"><b>' + e(r.name) + '</b></a><span class="cd">' + e(r.code) + '</span></div>' +
          chip(r.dist ? "분배 의심" : "거래량 이상", r.dist ? "cool" : "c") + '</div>' +
          '<div class="sp-box" data-spark="' + e(r.code) + '"></div>' +
          '<div class="st4">' + stat("거래량", r.vol != null ? r.vol.toFixed(1) + "배" : "–") + stat("한달 가격", '<span class="' + cls(r.m1) + '">' + sgn(r.m1) + '%</span>') + stat("주가강도", r.rs != null ? r.rs.toFixed(0) : "–") + stat("며칠째", r.days ? r.days + "일" : "–") + '</div>' +
          '<div class="row"><span class="tm">' + (r.sector && r.sector !== "미분류" ? e(r.sector) : (V.MKT[r.mkt] || "")) + '</span>' + opBtn(r.code) + '</div></div>';
      };
      var P = pager("abox", rows, aCard); P.draw();
    }).catch(function(){ el.innerHTML = '<div class="empty">자료를 못 불러왔어요.</div>'; });
  };
})();
;
/* ======== ixchart.js ======== */
/* CH Investing — 나침반 「📈 대표 지수」 고퀄 차트 (10/7)
   나라별 대표 지수: 미국 다우·S&P500·나스닥 / 일본 닛케이 / 한국 코스피·코스닥 / 홍콩 HSCEI / 중국 상해·심천·과창판
   1개월·3개월 = 캔들, 6개월·1년 = 면적선. 20일선·60일선, 거래량, 기간 최고·최저, 마지막 값 표시.
   차트를 누르고 옆으로 움직이면 그날 값(시·고·저·종, 전일 대비, 기간 시작 대비)이 나온다. */
(function(){
  var PREF = {US: ["^DJI", "^GSPC", "^IXIC", "^NDX"], KR: ["^KS11", "^KQ11"], JP: ["^N225"], HK: ["^HSI", "^HSCE"], CN: ["000001.SS", "399001.SZ", "000688.SS", "000300.SS"],
              GL: ["ACWI", "URTH", "EEM", "AOR"]};
  var SHORT = {"^DJI": "다우", "^GSPC": "S&P 500", "^IXIC": "나스닥", "^KS11": "코스피", "^KQ11": "코스닥", "^N225": "닛케이 225",
               "^HSCE": "HSCEI (H지수)", "^HSI": "항셍", "000001.SS": "상해종합", "399001.SZ": "심천성분", "000688.SS": "과창판 50",
               "^NDX": "나스닥 100", "000300.SS": "CSI 300", "ACWI": "MSCI 전세계 (ACWI)", "URTH": "MSCI 선진국 (URTH)", "EEM": "MSCI 신흥국 (EEM)", "AOR": "주식·채권 60/40 (AOR)"};
  var PER = [["1D", "오늘", 0], ["1M", "1개월", 22], ["3M", "3개월", 65], ["6M", "6개월", 130], ["1Y", "1년", 9999]];
  var UP = "#e66767", DN = "#3987e5", MA20 = "#f2b84b", MA60 = "#a48cff";
  var D = {}, SEQ = 0, JN = 0;
  // 실시간: 동방재부 1분 시세 (JSONP, 앱에서 바로) — 코스닥만 없어서 우리 장중 자료(10분)로
  var EM = {"^DJI": "100.DJIA", "^GSPC": "100.SPX", "^IXIC": "100.NDX", "^KS11": "100.KS11", "^N225": "100.N225", "^HSCE": "100.HSCEI", "^HSI": "100.HSI",
            "000001.SS": "1.000001", "399001.SZ": "0.399001", "000688.SS": "1.000688",
            "^NDX": "100.NDX100", "000300.SS": "1.000300", "ACWI": "105.ACWI", "URTH": "107.URTH", "EEM": "107.EEM", "AOR": "107.AOR"};
  var SES = {US: {tz: "America/New_York", o: 570, c: 960, city: "뉴욕 "}, KR: {tz: "Asia/Seoul", o: 540, c: 930}, JP: {tz: "Asia/Tokyo", o: 540, c: 930, ls: 690, le: 750},
             GL: {tz: "America/New_York", o: 570, c: 960, city: "뉴욕 "}, HK: {tz: "Asia/Hong_Kong", o: 570, c: 960, ls: 720, le: 780}, CN: {tz: "Asia/Shanghai", o: 570, c: 900, ls: 690, le: 780}};
  function nSlots(S){ return S.c - S.o + 1 - (S.ls ? S.le - S.ls : 0); }
  function slotOf(S, min){ var m = S.ls && min >= S.le ? min - (S.le - S.ls) : (S.ls && min > S.ls ? S.ls : min); return Math.max(0, Math.min(nSlots(S) - 1, m - S.o)); }
  function minOfSlot(S, k){ var m = S.o + k; return S.ls && m > S.ls ? m + (S.le - S.ls) : m; }
  function hm(m){ return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
  function local(ms, tz){   // → {d: "YYYY-MM-DD", m: 분, t: "HH:MM"}
    var p = {}; new Intl.DateTimeFormat("en-CA", {timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false})
      .formatToParts(new Date(ms)).forEach(function(x){ p[x.type] = x.value; });
    var h = +p.hour % 24; return {d: p.year + "-" + p.month + "-" + p.day, m: h * 60 + +p.minute, t: String(h).padStart(2, "0") + ":" + p.minute};
  }
  function jsonp(u){
    return new Promise(function(ok, no){
      var cb = "ixcb" + (++JN), sc = document.createElement("script"), t = setTimeout(function(){ done(); no("timeout"); }, 9000);
      function done(){ clearTimeout(t); window[cb] = function(){}; sc.remove(); }
      window[cb] = function(d){ done(); ok(d); }; sc.onerror = function(){ done(); no("err"); };
      sc.src = u + "&cb=" + cb + "&_=" + Date.now(); document.head.appendChild(sc);
    });
  }
  function dayEM(o){
    var S = SES[o.mk];
    return jsonp("https://push2his.eastmoney.com/api/qt/stock/trends2/get?fields1=f1,f2,f3,f4,f5,f6,f7,f8&fields2=f51,f52,f53,f56&ndays=1&iscr=0&secid=" + EM[o.ix.sym]).then(function(j){
      var dd = j && j.data; if (!dd || !dd.trends || !dd.trends.length) throw "empty";
      var rows = [], date = null, lastMs = 0;
      dd.trends.forEach(function(t){
        var a = t.split(","), ms = Date.parse(a[0].replace(" ", "T") + ":00+08:00"), L = local(ms, S.tz), op = +a[1], cl = +a[2];
        if (!(cl > 0)) return;
        date = date || L.d; lastMs = ms;
        rows.push([L.t, op || cl, Math.max(op || cl, cl), Math.min(op || cl, cl), cl, +a[3] || 0, slotOf(S, L.m)]);
      });
      return {pre: dd.preClose, rows: rows, date: date, lastMs: lastMs};
    });
  }
  function dayLive(o){   // 코스닥: 장중 나침반 자료(10분마다) → 전일 종가 × (1 + 등락률)
    return getJSON("archive/x/live_kr.json?" + Math.floor(Date.now() / 60000)).then(function(Lv){
      var k = (Lv.index || []).map(function(x){ return x.name; }).indexOf("코스닥"); if (k < 0 || !Lv.snaps || !Lv.snaps.length) throw "no";
      var b = o.base, pre = b[b.length - 1][0] >= Lv.date ? b[b.length - 2][4] : b[b.length - 1][4], S = SES.KR;
      var rows = Lv.snaps.map(function(sn){ var m = +sn[0].slice(0, 2) * 60 + +sn[0].slice(3, 5), p = pre * (1 + (sn[3 + k] || 0) / 100); return [sn[0], p, p, p, p, 0, slotOf(S, m)]; });
      var ix = Lv.index[k], lt = rows.length ? rows[rows.length - 1] : null;
      if (ix && ix.last && lt && Math.abs(ix.last - lt[4]) > 1e-6) rows.push([lt[0], ix.last, ix.last, ix.last, ix.last, 0, lt[6]]);
      var last = rows[rows.length - 1];
      return {pre: pre, rows: rows, date: Lv.date, lastMs: Date.parse(Lv.date + "T" + last[0] + ":00+09:00"), slow: 1};
    });
  }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function fmt(v){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v); return v.toLocaleString("ko-KR", {minimumFractionDigits: a >= 10000 ? 0 : 2, maximumFractionDigits: a >= 10000 ? 0 : 2}); }
  function pct(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : "") + v.toFixed(2) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function per(){ var p = (window.store && store.ixp) || "1D"; return PER.filter(function(x){ return x[0] === p; })[0] || PER[1]; }

  // 지수 → 일봉 줄 [날짜, 시, 고, 저, 종, 거래량]
  function rowsOf(ix){
    if (ix.ohlc && ix.ohlc.length > 5) return ix.ohlc;
    var y = String(ix.date || "").slice(0, 4);
    return (ix.close || []).map(function(c, i){ return [y + "-" + String(ix.dates[i]).replace("/", "-"), c, c, c, c, 0]; });   // 옛 자료: 종가만
  }
  function ma(cl, n){ var out = [], s = 0; for (var i = 0; i < cl.length; i++){ s += cl[i]; if (i >= n) s -= cl[i - n]; out.push(i >= n - 1 ? s / n : null); } return out; }

  function draw(id){
    var o = D[id]; if (!o) return "";
    var P = per(), intr = P[0] === "1D";
    if (intr && !(o.day && o.day.rows.length > 1)){ P = PER[1]; intr = false; }      // 장중 자료가 아직 없으면 1개월
    o.P = P;
    var all = intr ? o.day.rows : o.rows, S = SES[o.mk] || SES.KR, n = intr ? nSlots(S) : Math.min(P[2], all.length), off = intr ? 0 : all.length - n, R = intr ? all : all.slice(off);
    var cl = all.map(function(r){ return r[4]; }), m20 = intr ? [] : ma(cl, 20).slice(off), m60 = intr ? [] : ma(cl, 60).slice(off);
    var hasOHLC = !intr && R.some(function(r){ return r[2] !== r[3]; }), candle = hasOHLC && n <= 70, NR = R.length;
    var hasVol = R.some(function(r){ return r[5] > 0; });
    var W = 360, L = 4, RT = 52, T = 16, PH = hasVol ? 158 : 186, VG = 6, VH = hasVol ? 34 : 0, XB = 16, H = T + PH + VG + VH + XB;
    var cw = (W - L - RT) / n, X = intr ? function(i){ return L + cw * (R[i][6] + .5); } : function(i){ return L + cw * (i + .5); };
    var lo = Infinity, hi = -Infinity, iLo = 0, iHi = 0;
    R.forEach(function(r, i){ var a = candle ? r[3] : r[4], b = candle ? r[2] : r[4]; if (a < lo){ lo = a; iLo = i; } if (b > hi){ hi = b; iHi = i; } });
    var vmin = intr ? Math.min(lo, o.day.pre) : lo, vmax = intr ? Math.max(hi, o.day.pre) : hi;
    m20.concat(m60).forEach(function(v){ if (v != null){ vmin = Math.min(vmin, v); vmax = Math.max(vmax, v); } });
    var pad = (vmax - vmin) * .08 || vmax * .01; vmin -= pad; vmax += pad;
    var Y = function(v){ return T + (vmax - v) / (vmax - vmin) * PH; };
    var first = R[0][4], last = R[NR - 1][4], prevStart = intr ? o.day.pre : off > 0 ? all[off - 1][4] : R[0][1] || first;
    var chgP = (last / prevStart - 1) * 100, col = chgP >= 0 ? UP : DN;
    o.view = {R: R, off: off, X: X, Y: Y, cw: cw, W: W, H: H, T: T, PH: PH, prevStart: prevStart, candle: candle, col: col, intr: intr};
    var g = '<defs><linearGradient id="g' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".32"/><stop offset=".75" stop-color="' + col + '" stop-opacity=".05"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient>' +
            '<clipPath id="c' + id + '"><rect x="' + L + '" y="' + T + '" width="' + (W - L - RT) + '" height="' + PH + '"/></clipPath></defs>';
    // 가로 눈금 + 오른쪽 값
    var step = niceStep((vmax - vmin) / 4), s = "";
    for (var v = Math.ceil(vmin / step) * step; v <= vmax; v += step){
      var y = Y(v).toFixed(1);
      s += '<line x1="' + L + '" x2="' + (W - RT) + '" y1="' + y + '" y2="' + y + '" class="ixg"/>' + (Math.abs(y - Y(last)) < 13 ? '' : '<text x="' + (W - RT + 5) + '" y="' + (+y + 3.5) + '" class="ixt">' + fmtAx(v, step) + '</text>');
    }
    // 날짜 눈금
    var ticks = 4, xl = "";
    for (var k = 0; k < ticks; k++){
      var xx, lab;
      if (intr){ var sl = Math.round((n - 1) * k / (ticks - 1)), mm = minOfSlot(S, sl); xx = L + cw * (sl + .5); lab = hm(mm); }
      else { var i = Math.round((n - 1) * (k + .5) / ticks), d = R[i][0]; xx = X(i); lab = P[0] === "1Y" || P[0] === "6M" ? d.slice(2, 4) + "." + (+d.slice(5, 7)) : (+d.slice(5, 7)) + "/" + (+d.slice(8, 10)); }
      xl += '<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + T + '" y2="' + (T + PH) + '" class="ixg v"/><text x="' + xx.toFixed(1) + '" y="' + (H - 3) + '" class="ixt" text-anchor="' + (intr && k === 0 ? "start" : intr && k === ticks - 1 ? "end" : "middle") + '">' + lab + '</text>';
    }
    // 본 그림
    var body = "";
    if (candle){
      var bw = Math.max(1.4, Math.min(9, cw * .64));
      R.forEach(function(r, i){
        var c = r[4] >= r[1] ? UP : DN, x = X(i), yo = Y(r[1]), yc = Y(r[4]), top = Math.min(yo, yc), bh = Math.max(1, Math.abs(yo - yc));
        body += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + Y(r[2]).toFixed(1) + '" y2="' + Y(r[3]).toFixed(1) + '" stroke="' + c + '" stroke-width="1"/>' +
                '<rect x="' + (x - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="' + (bw > 4 ? 1 : 0) + '" fill="' + c + '"' + (r[4] >= r[1] ? '' : '') + '/>';
      });
    } else {
      var pts = R.map(function(r, i){ return X(i).toFixed(1) + "," + Y(r[4]).toFixed(1); });
      var base = intr ? Y(o.day.pre).toFixed(1) : (T + PH);
      if (intr) body += '<line x1="' + L + '" x2="' + (W - RT) + '" y1="' + base + '" y2="' + base + '" stroke="#8a94a8" stroke-width=".9" stroke-dasharray="4 3"/>' +
        '<text x="' + (L + 2) + '" y="' + (+base - 4) + '" class="ixm" style="font-weight:600">전일 ' + fmt(o.day.pre) + '</text>';
      body += '<path d="M' + X(0).toFixed(1) + ',' + base + ' L' + pts.join(" L") + ' L' + X(NR - 1).toFixed(1) + ',' + base + ' Z" fill="url(#g' + id + ')"/>' +
              '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + col + '" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    var line = function(arr, c, dash){ var p = []; arr.forEach(function(v, i){ if (v != null) p.push(X(i).toFixed(1) + "," + Y(v).toFixed(1)); });
      return p.length > 1 ? '<polyline points="' + p.join(" ") + '" fill="none" stroke="' + c + '" stroke-width="1.25" stroke-opacity=".9"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>' : ""; };
    body += line(m60, MA60, "4 3") + line(m20, MA20);
    // 기간 최고·최저
    var mark = function(i, v, up){ var x = X(i), y = Y(v), tx = Math.min(W - RT - 4, Math.max(L + 4, x)), anc = x > (W - RT) * .78 ? "end" : x < W * .18 ? "start" : "middle";
      return '<text x="' + tx.toFixed(1) + '" y="' + (up ? y - 5 : y + 12).toFixed(1) + '" class="ixm" text-anchor="' + anc + '">' + (up ? "최고 " : "최저 ") + fmt(v) + '</text>'; };
    var marks = mark(iHi, hi, true) + mark(iLo, lo, false);
    // 마지막 값 표시
    var yl = Y(last);
    body += '<line x1="' + L + '" x2="' + (W - RT) + '" y1="' + yl.toFixed(1) + '" y2="' + yl.toFixed(1) + '" stroke="' + col + '" stroke-width=".8" stroke-dasharray="2 3" opacity=".8"/>' +
            '<circle cx="' + X(NR - 1).toFixed(1) + '" cy="' + yl.toFixed(1) + '" r="3.2" fill="' + col + '" stroke="#0b0f17" stroke-width="1.5"/>' +
            (intr && o.live ? '<circle class="ixlive" cx="' + X(NR - 1).toFixed(1) + '" cy="' + yl.toFixed(1) + '" r="3.2" fill="none" stroke="' + col + '"/>' : '');
    var pill = '<rect x="' + (W - RT + 1) + '" y="' + (yl - 8.5).toFixed(1) + '" width="' + (RT - 2) + '" height="17" rx="4" fill="' + col + '"/>' +
               '<text x="' + (W - RT / 2) + '" y="' + (yl + 3.8).toFixed(1) + '" class="ixp" text-anchor="middle">' + fmtAx(last, step / 10) + '</text>';
    // 거래량
    var vol = "";
    if (hasVol){
      var vm = Math.max.apply(null, R.map(function(r){ return r[5]; })) || 1, vy = T + PH + VG;
      R.forEach(function(r, i){ var h = r[5] / vm * VH, up = intr ? (i ? r[4] >= R[i - 1][4] : r[4] >= o.day.pre) : r[4] >= r[1];
        if (h > .3) vol += '<rect x="' + (X(i) - Math.max(.6, cw * .32)).toFixed(1) + '" y="' + (vy + VH - h).toFixed(1) + '" width="' + Math.max(1.2, cw * .64).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + (up ? UP : DN) + '" opacity=".38"/>'; });
      vol += '<text x="' + (W - RT + 5) + '" y="' + (vy + 9) + '" class="ixt">거래량</text>';
    }
    o.chgP = chgP;
    return '<svg class="ixc-svg" data-id="' + id + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="aspect-ratio:' + W + '/' + H + '">' + g + s + xl +
      '<g clip-path="url(#c' + id + ')">' + body + '</g>' + marks + vol + pill +
      '<g class="ixx" style="display:none"><line class="ixx-l" y1="' + T + '" y2="' + (T + PH + VG + VH) + '"/><circle class="ixx-d" r="4"/></g>' +
      '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent" class="ixc-hit"/></svg>';
  }
  function niceStep(raw){ var p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
  function fmtAx(v, step){ var d = step >= 1 ? 0 : step >= .1 ? 1 : 2; if (Math.abs(v) >= 10000) d = 0; return v.toLocaleString("ko-KR", {minimumFractionDigits: d, maximumFractionDigits: d}); }

  function block(ix, k){
    var id = "x" + (++SEQ); D[id] = {ix: ix, rows: rowsOf(ix), base: rowsOf(ix), mk: k.mk};
    var svg = draw(id), o = D[id], P = per();
    var pos = ix.hi52 > ix.lo52 ? (ix.last - ix.lo52) / (ix.hi52 - ix.lo52) * 100 : 50;
    var opn = ((window.store && store.ixo) || {})[ix.sym];      // 처음엔 제목 줄만 — 누르면 차트 (10/11 사용자)
    return '<div class="ixc' + (opn ? '' : ' fold') + '" id="' + id + '" data-sym="' + e(ix.sym) + '">' +
      '<div class="ixc-h"><div><div class="ixc-n"><i class="ixc-ar">▸</i>' + e(SHORT[ix.sym] || ix.name) + '</div><div class="ixc-d mut">' + e(String(ix.date || "").slice(5).replace("-", "/")) + ' 종가</div></div>' +
      '<div class="ixc-v"><b>' + fmt(ix.last) + '</b><span class="' + cls(ix.chg1) + '">' + (ix.chg1 > 0 ? "▲ " : ix.chg1 < 0 ? "▼ " : "") + pct(ix.chg1) + '</span></div></div>' +
      '<div class="ixc-pp">' + ppHtml(o) + '</div>' +
      '<div class="ixc-w">' + svg + '<div class="ixc-tip"></div></div>' +
      '<div class="ixc-ch">' + [["1주", ix.chg5], ["1개월", ix.chg20], ["올해", ix.chgYtd]].map(function(p){ return '<span><small>' + p[0] + '</small><b class="' + cls(p[1]) + '">' + pct(p[1]) + '</b></span>'; }).join("") +
        '<span class="ixc-52"><small>52주 위치</small><em><i style="left:' + Math.max(0, Math.min(100, pos)).toFixed(1) + '%"></i></em></span></div>' +
      (ix.regime && k.reg ? '<div class="note" style="margin-top:6px">' + k.reg(ix.regime) + ' ' + e(ix.why || "") + '</div>' : '') +
      '</div>';
  }

  // 나라 하나 → 「📈 대표 지수」 카드
  window.IXC = function(m, mk, reg, title){
    var list = (PREF[mk] || []).map(function(s){ return (m.index || []).filter(function(x){ return x.sym === s; })[0]; }).filter(Boolean);
    if (!list.length) list = (m.index || []).slice();
    if (!list.length) return "";
    var P = per();
    return '<section class="card ixc-card"><h3>' + (title || '📈 대표 지수 <span class="mut">차트를 누르고 옆으로 밀면 그날 값</span>') + '</h3>' +
      '<div class="seg2 ixc-seg">' + PER.map(function(p){ return '<button data-p="' + p[0] + '"' + (p[0] === P[0] ? ' class="on"' : '') + '>' + p[1] + '</button>'; }).join("") + '</div>' +
      list.map(function(ix){ return block(ix, {reg: reg, mk: mk}); }).join("") + '</section>';
  };
  // 🏁 포트 비교 지수 14개 — 포트 「비교」 순위표와 같은 목록, 같은 차트 (10/11)
  var BENCH = [["^GSPC", "US", "us"], ["^KS11", "KR", "kr"], ["AOR", "GL", "gl"], ["^NDX", "US", "us"], ["^DJI", "US", "us"], ["^KQ11", "KR", "kr"],
               ["ACWI", "GL", "gl"], ["URTH", "GL", "gl"], ["EEM", "GL", "gl"], ["^N225", "JP", "as"], ["^HSI", "HK", "as"],
               ["000300.SS", "CN", "as"], ["399001.SZ", "CN", "as"], ["000688.SS", "CN", "as"]];
  var BG = [["all", "전체 14"], ["us", "🇺🇸 미국"], ["kr", "🇰🇷 한국"], ["gl", "🌍 세계·배분"], ["as", "🌏 일본·중화권"]];
  window.IXB = function(C, reg){
    var find = function(sym, mk){ var m = mk === "GL" ? {index: C.bench || []} : (C.markets || {})[mk] || {}; return (m.index || []).filter(function(x){ return x.sym === sym; })[0]; };
    var list = BENCH.map(function(b){ var ix = find(b[0], b[1]); return ix ? {ix: ix, mk: b[1], g: b[2]} : null; }).filter(Boolean);
    if (!list.length) return "";
    var P = per(), G = (window.store && store.ixg) || "all";
    return '<section class="card ixc-card ixb-card" data-g="' + G + '"><h3>🏁 포트 비교 지수 <span class="mut">포트가 이겨야 할 ' + list.length + '개 · 같은 차트</span></h3>' +
      '<div class="seg2 ixb-g">' + BG.map(function(g){ return '<button data-g="' + g[0] + '"' + (g[0] === G ? ' class="on"' : '') + '>' + g[1] + '</button>'; }).join("") + '</div>' +
      '<div class="seg2 ixc-seg">' + PER.map(function(p){ return '<button data-p="' + p[0] + '"' + (p[0] === P[0] ? ' class="on"' : '') + '>' + p[1] + '</button>'; }).join("") + '</div>' +
      list.map(function(x){ return '<div class="ixb-i" data-g="' + x.g + '">' + block(x.ix, {reg: reg, mk: x.mk}) + '</div>'; }).join("") + '</section>';
  };
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".ixb-g button"); if (!b) return;
    if (window.store){ store.ixg = b.dataset.g; if (window.save) try { save(); } catch(x) {} }
    var c = b.closest(".ixb-card"); c.dataset.g = b.dataset.g;
    [].forEach.call(c.querySelectorAll(".ixb-g button"), function(x){ x.classList.toggle("on", x === b); });
  });
  function ppHtml(o){
    var P = o.P || per(), lab = P[1];
    if (P[0] === "1D" && o.day){ var S = SES[o.mk] || SES.KR; lab = o.day.date === local(Date.now(), S.tz).d ? "오늘" : (+o.day.date.slice(5, 7)) + "/" + (+o.day.date.slice(8, 10)) + " 하루"; }
    return '<span class="mut">' + lab + '</span> <b class="' + cls(o.chgP) + '">' + pct(o.chgP) + '</b>' +
      (P[0] === "1D" ? '<span class="ixc-lg">1분 단위 · 점선 = 전일 종가</span>' : '<span class="ixc-lg"><i style="background:' + MA20 + '"></i>20일선 <i class="dsh" style="border-color:' + MA60 + '"></i>60일선</span>');
  }
  function redraw(el){
    var o = D[el.id]; if (!o) return;
    var w = el.querySelector(".ixc-w"); w.innerHTML = draw(el.id) + '<div class="ixc-tip"></div>';
    el.querySelector(".ixc-pp").innerHTML = ppHtml(o);
  }
  // 실시간 반영: 오늘 캔들·머리 숫자·장중 선
  function refresh(el){
    var o = D[el.id]; if (!o || o.busy || !SES[o.mk]) return;
    var src = EM[o.ix.sym] ? dayEM : (o.ix.sym === "^KQ11" ? dayLive : null); if (!src) return;
    o.busy = 1;
    src(o).then(function(day){
      o.busy = 0; if (!day.rows.length) return;
      o.day = day; o.day.slow = day.slow;
      var R = day.rows, last = R[R.length - 1][4], b = o.base.slice(), lb = b[b.length - 1];
      var cdl = [day.date, R[0][1], Math.max.apply(null, R.map(function(r){ return r[2]; })), Math.min.apply(null, R.map(function(r){ return r[3]; })), last, R.reduce(function(a, r){ return a + r[5]; }, 0)];
      if (lb && day.date > lb[0]) b.push(cdl); else if (lb && day.date === lb[0]) b[b.length - 1] = cdl;
      o.rows = b;
      var S = SES[o.mk], now = local(Date.now(), S.tz), lt = local(day.lastMs, S.tz);
      o.live = Date.now() - day.lastMs < (day.slow ? 16 : 6) * 60000 && now.m <= S.c + 5;
      var chg = (last / day.pre - 1) * 100;
      el.querySelector(".ixc-v b").textContent = fmt(last);
      var sp = el.querySelector(".ixc-v span"); sp.className = cls(chg); sp.textContent = (chg > 0 ? "▲ " : chg < 0 ? "▼ " : "") + pct(chg);
      el.querySelector(".ixc-d").innerHTML = o.live ? '<span class="ixc-on">● 실시간</span> ' + (S.city || "") + lt.t + (day.slow ? " · 10분마다" : "")
        : (+day.date.slice(5, 7)) + "/" + (+day.date.slice(8, 10)) + " " + (now.d > day.date || now.m > S.c ? "종가" : S.city + lt.t + " 기준");
      if (!ACT || !el.contains(ACT)) redraw(el);
    }).catch(function(){ o.busy = 0; });
  }
  function tick(){ if (document.hidden) return; [].forEach.call(document.querySelectorAll(".ixc"), refresh); }
  setInterval(tick, 20000);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) tick(); });
  new MutationObserver(function(){ var f = document.querySelector(".ixc:not([data-rt])"); if (f){ [].forEach.call(document.querySelectorAll(".ixc:not([data-rt])"), function(el){ el.dataset.rt = 1; refresh(el); }); } })
    .observe(document.documentElement, {childList: true, subtree: true});

  // 제목 줄 누르면 펼치기·접기 (어느 지수를 열어 뒀는지 기억)
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest(".ixc-h"); if (!h) return;
    var el = h.closest(".ixc"); if (!el) return;
    var f = el.classList.toggle("fold");
    if (window.store){ store.ixo = store.ixo || {}; if (f) delete store.ixo[el.dataset.sym]; else store.ixo[el.dataset.sym] = 1; if (window.save) try { save(); } catch(x) {} }
    if (!f) redraw(el);
  });
  // 기간 바꾸기
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".ixc-seg button"); if (!b) return;
    if (window.store){ store.ixp = b.dataset.p; if (window.save) try { save(); } catch(x) {} }
    var cardEl = b.closest(".ixc-card");
    [].forEach.call(cardEl.querySelectorAll(".ixc-seg button"), function(x){ x.classList.toggle("on", x === b); });
    [].forEach.call(cardEl.querySelectorAll(".ixc"), redraw);
  });

  // 십자선·툴팁
  function show(svg, cx){
    var id = svg.dataset.id, o = D[id]; if (!o || !o.view) return;
    var V0 = o.view, r = svg.getBoundingClientRect(), x = (cx - r.left) / r.width * V0.W;
    var i = 0, bd = 1e9; for (var q = 0; q < V0.R.length; q++){ var dq = Math.abs(V0.X(q) - x); if (dq < bd){ bd = dq; i = q; } }
    var row = V0.R[i]; if (!row) return; var prev = i > 0 ? V0.R[i - 1][4] : (V0.off > 0 ? o.rows[V0.off - 1][4] : null);
    var g = svg.querySelector(".ixx"); g.style.display = "";
    var px = V0.X(i), py = V0.Y(row[4]);
    var l = g.querySelector(".ixx-l"); l.setAttribute("x1", px); l.setAttribute("x2", px);
    var d = g.querySelector(".ixx-d"); d.setAttribute("cx", px); d.setAttribute("cy", py); d.setAttribute("fill", V0.col);
    var tip = svg.parentNode.querySelector(".ixc-tip"), c1 = prev ? (row[4] / prev - 1) * 100 : null, cp = (row[4] / V0.prevStart - 1) * 100;
    tip.innerHTML = V0.intr ? '<b>' + (SES[o.mk].city || "") + row[0] + '</b><div class="big">' + fmt(row[4]) + '</div><div class="mut">전일 대비 <span class="' + cls(cp) + '">' + pct(cp) + '</span></div>' :
      '<b>' + row[0].slice(2).replace(/-/g, ".") + '</b> <span class="' + cls(c1) + '">' + pct(c1) + '</span><div class="big">' + fmt(row[4]) + '</div>' +
      (V0.candle ? '<div class="mut">시 ' + fmt(row[1]) + ' · 고 ' + fmt(row[2]) + ' · 저 ' + fmt(row[3]) + '</div>' : '') +
      '<div class="mut">' + per()[1] + ' 시작 대비 <span class="' + cls(cp) + '">' + pct(cp) + '</span></div>';
    tip.style.display = "block";
    var left = px / V0.W * r.width, tw = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(r.width - tw, left > r.width / 2 ? left - tw - 12 : left + 12)) + "px";
  }
  function hide(svg){ if (!svg.parentNode) return; var g = svg.querySelector(".ixx"); if (g) g.style.display = "none"; var t = svg.parentNode.querySelector(".ixc-tip"); if (t) t.style.display = "none"; }
  var ACT = null;
  document.addEventListener("pointerdown", function(ev){ var s = ev.target.closest && ev.target.closest(".ixc-svg"); if (!s) return; ACT = s; show(s, ev.clientX); });
  document.addEventListener("pointermove", function(ev){ var s = ev.target.closest && ev.target.closest(".ixc-svg"); if (s && (ACT === s || ev.pointerType === "mouse")) show(s, ev.clientX); });
  document.addEventListener("pointerup", function(){ var s = ACT; ACT = null; if (s) setTimeout(function(){ if (ACT !== s) hide(s); }, 2200); });
  document.addEventListener("pointerout", function(ev){ var s = ev.target.closest && ev.target.closest(".ixc-svg"); if (s && ev.pointerType === "mouse" && !s.contains(ev.relatedTarget)) hide(s); });

  var css = document.createElement("style");
  css.textContent =
    ".ixb-g{margin:2px 0 6px;flex-wrap:wrap}.ixb-card:not([data-g=all]) .ixb-i{display:none}" +
    ".ixb-card[data-g=us] .ixb-i[data-g=us],.ixb-card[data-g=kr] .ixb-i[data-g=kr],.ixb-card[data-g=gl] .ixb-i[data-g=gl],.ixb-card[data-g=as] .ixb-i[data-g=as]{display:block}" +
    ".ixc-seg+.ixb-i>.ixc{border-top:0}" +
    ".ixc-seg{margin:2px 0 4px}.ixc{padding:14px 0 12px;border-top:1px solid var(--line)}.ixc-seg+.ixc{border-top:0}" +
    ".ixc.fold>:not(.ixc-h){display:none!important}.ixc.fold{padding:11px 0}.ixc-h{cursor:pointer}" +
    ".ixc-ar{font-style:normal;display:inline-block;width:16px;color:var(--dim);font-size:12.5px;transition:transform .15s}.ixc:not(.fold) .ixc-ar{transform:rotate(90deg)}" +
    ".ixc.fold .ixc-n{font-size:15px}.ixc.fold .ixc-d{display:none}.ixc.fold .ixc-h{align-items:center}" +
    ".ixc.fold .ixc-v{display:flex;align-items:baseline;gap:8px}.ixc.fold .ixc-v b{display:inline;font-size:16px}.ixc.fold .ixc-v span{min-width:62px;text-align:right}" +
    ".ixc-h{display:flex;justify-content:space-between;align-items:flex-end}.ixc-n{font-weight:800;font-size:16px;letter-spacing:-.2px}.ixc-d{font-size:12.5px;margin-top:1px}" +
    ".ixc-v{text-align:right}.ixc-v b{display:block;font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.4px;line-height:1.1}.ixc-v span{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}" +
    ".ixc-pp{display:flex;align-items:center;gap:6px;font-size:12.5px;margin:6px 0 2px}.ixc-pp b{font-variant-numeric:tabular-nums}.ixc-lg{margin-left:auto;color:var(--sub);font-size:12.5px;display:flex;align-items:center;gap:4px}" +
    ".ixc-lg i{display:inline-block;width:14px;height:2px;border-radius:1px;margin-left:6px}.ixc-lg i.dsh{height:0;border-top:2px dashed;background:none!important}" +
    ".ixc-w{position:relative;margin:0 -2px}.ixc-svg{display:block;width:100%;height:auto;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:crosshair}" +
    ".ixc-svg .ixg{stroke:var(--line);stroke-width:.7}.ixc-svg .ixg.v{stroke-dasharray:2 4;opacity:.6}.ixc-svg .ixt{fill:var(--dim);font-size:9.5px;font-variant-numeric:tabular-nums}" +
    ".ixc-svg .ixm{fill:var(--sub);font-size:9.5px;font-weight:700;paint-order:stroke;stroke:var(--panel);stroke-width:3px}.ixc-svg .ixp{fill:#fff;font-size:10px;font-weight:800;font-variant-numeric:tabular-nums}" +
    ".ixc-svg .ixx-l{stroke:var(--text);stroke-width:.8;stroke-dasharray:3 3;opacity:.7}.ixc-svg .ixx-d{stroke:#fff;stroke-width:1.5}" +
    ".ixc-tip{display:none;position:absolute;top:6px;z-index:3;min-width:118px;padding:7px 9px;border-radius:10px;background:rgba(18,24,38,.94);border:1px solid var(--line);box-shadow:0 6px 20px rgba(0,0,0,.35);font-size:12.5px;line-height:1.45;pointer-events:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}" +
    ".ixc-tip .big{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums}.ixc-tip .mut{font-size:12.5px}" +
    ".ixc-ch{display:grid;grid-template-columns:1fr 1fr 1fr 1.4fr;gap:6px;margin-top:8px}.ixc-ch span{background:var(--panel2);border-radius:9px;padding:6px 8px;text-align:center}.ixc-ch small{display:block;font-size:12.5px;color:var(--sub)}.ixc-ch b{font-size:13px;font-variant-numeric:tabular-nums}" +
    ".ixc-52 em{position:relative;display:block;height:6px;margin:6px 2px 2px;border-radius:3px;background:linear-gradient(90deg," + DN + "," + "#8a94a8," + UP + ");opacity:.85}.ixc-52 em i{position:absolute;top:-3px;width:4px;height:12px;margin-left:-2px;border-radius:2px;background:#fff;box-shadow:0 0 0 1.5px #0b0f17}";
  css.textContent += ".ixc-on{color:#3ddc84;font-weight:800}.ixc-svg .ixlive{animation:ixpulse 1.6s ease-out infinite;transform-box:fill-box;transform-origin:center}@keyframes ixpulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}";
  document.head.appendChild(css);
})();
;
/* ======== compass.js ======== */
/* CH Investing — 🧭 나침반: 5개 시장 등락·지수 흐름·국면·강한 섹터 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls;
  var ORDER = ["US", "KR", "JP", "CN", "HK"];
  var REG = {"상승장": {c:"up", i:"▲"}, "하락장": {c:"dn", i:"▼"}, "횡보장": {c:"fl", i:"◆"}, "하락장 속 반등": {c:"up", i:"↗"}, "상승장 속 급락": {c:"dn", i:"↘"}};
  /* 10/16 사용자: 「너 어제부터 이거 자꾸 틀리더라」 — 코스피 +3.8%·오른 종목 89% 인데 「▼ 하락장」.
     선(20·60일) 판정은 며칠 늦게 따라와서, 오늘 크게 반대로 움직인 날은 그걸 앞에 내세움:
     하락장인데 오늘 +2% 이상(또는 +1.2% 이상 + 오른 종목 70%↑) → 「하락장 속 반등」 · 상승장인데 오늘 −2% 이하(또는 −1.2% + 내린 종목 70%↑) → 「상승장 속 급락」 */
  function rd(m){
    var ix = (m && m.index || [])[0], lab = m && m.regime; if (!ix || ix.chg1 == null) return lab;
    var t = (m.up || 0) + (m.down || 0), ur = t ? m.up / t : 0.5, c = ix.chg1;
    if (lab === "하락장" && (c >= 2 || (c >= 1.2 && ur >= 0.7))) return "하락장 속 반등";
    if (lab === "상승장" && (c <= -2 || (c <= -1.2 && ur <= 0.3))) return "상승장 속 급락";
    return lab;
  }
  function rdWhy(m){
    var ix = (m && m.index || [])[0], d = rd(m); if (!ix || d === m.regime) return ix ? ix.why : "";
    var m20 = (ix.ma20 || []).slice(-1)[0], gap = m20 ? (m20 / ix.last - 1) * 100 : null;
    if (d === "하락장 속 반등") return "오늘 " + sgn(ix.chg1) + "% 크게 반등 중이지만 아직 20일선(" + V.fmt(m20) + ") 아래 — " + (gap != null && gap > 0 ? gap.toFixed(1) + "% 더 올라 20일선을 넘어야 하락장이 풀려요" : "20일선을 넘어서 버티면 하락장이 풀려요") + ". 선 기준 판정: " + ix.why;
    return "오늘 " + sgn(ix.chg1) + "% 크게 빠졌지만 선(20·60일) 기준은 아직 상승장 — 이틀 이상 이어지면 판정이 바뀔 수 있어요. 선 기준 판정: " + ix.why;
  }
  window.regDisp = rd;
  var CPSEL = null;

  /* 🗓 11/17 사용자 「섹터 전체에 1개월·3개월·6개월 선택 탭 — 이 줄에 있는 애들 다」
     섹터 묶음(등락·로테이션 지도·시계·되감기·강한/약한 업종·대형주)이 기간 하나를 같이 씀. 어느 카드에서 눌러도 전부 같이 바뀜(store.secp 에 기억).
     가로축 = 고른 기간, 세로축 = 그보다 짧은 기간(1개월→1주 · 3개월→1개월 · 6개월→3개월). 3·6개월 값은 히트맵과 같은 x.heat. */
  var SP = {"1M": {xl: "1개월", yl: "1주", xn: "한 달", yn: "이번 주", tail: "지난 5일"},
            "3M": {xl: "3개월", yl: "1개월", xn: "석 달", yn: "최근 한 달", tail: "지난 5일"},
            "6M": {xl: "6개월", yl: "3개월", xn: "반년", yn: "최근 석 달", tail: "지난 5일"}};
  var PK = ["1M", "3M", "6M"], BARK = "r1", TD = true, SREG = {};
  var nn = function(v){ return v == null || v !== v ? null : v; };
  /* 📏 11/17 사용자 「둘 다 진행해」 ① 지수(코스피 등) 대비 초과수익률 축 — 장 전체가 빠져도 상대적으로 돈이 들어오는 곳이 갈림.
     지수 1년 일봉(index[0].ohlc)에서 섹터 자료와 같은 날짜로 끝나는 같은 길이 수익률을 빼 줌. 「지수 대비」 버튼으로 끄고 켬(store.secx, 기본 켬).
     ② 혼자 멀리 튄 섹터(예: 부동산·리츠 +43%)는 가장자리에 붙이고 ↗ 표시 → 나머지 섹터가 가운데 뭉치지 않게 (SECP.lim) */
  var NX = {"1M": [20, 5], "3M": [63, 20], "6M": [126, 63]}, IXM = {};
  function ixMap(m){ var ix = (m && m.index || [])[0]; if (!ix || !ix.ohlc || ix.ohlc.length < 30) return null;
    var o = ix.ohlc, key = o.length + o[o.length - 1][0] + o[o.length - 1][4], c = IXM[ix.sym || ix.name];
    if (c && c.k === key) return c;
    var by = {}; o.forEach(function(r, i){ by[r[0]] = i; by[r[0].slice(5).replace("-", "/")] = i; });
    return (IXM[ix.sym || ix.name] = {k: key, o: o, by: by, name: ix.name}); }
  function ixRet(m, d, n){ var M = ixMap(m); if (!M) return null; var j = M.by[d]; if (j == null || j - n < 0) return null; return (M.o[j][4] / M.o[j - n][4] - 1) * 100; }
  var SECP = window.SECP = {
    C: null, keys: PK,
    cur: function(){ var p = window.store && store.secp; return SP[p] ? p : "1M"; },
    lab: function(p){ return SP[p || SECP.cur()]; },
    /* m 을 주면 지수 대비(켜져 있을 때) — 지도·시계·되감기만. 막대(등락)는 절대 수익률 그대로 */
    xy: function(x, p, m){ p = p || SECP.cur(); var h = x.heat || {};
      var o = p === "3M" ? {x: nn(h["3M"]), y: nn(x.r20)} : p === "6M" ? {x: nn(h["6M"]), y: nn(h["3M"])} : {x: nn(x.r20), y: nn(x.r5)};
      if (m && SECP.xs(m) && o.x != null && o.y != null){ var bx = ixRet(m, m.date, NX[p][0]), by = ixRet(m, m.date, NX[p][1]);
        if (bx != null && by != null) o = {x: o.x - bx, y: o.y - by}; }
      return o; },
    val: function(x, p){ return SECP.xy(x, p).x; },
    path: function(x, p, m){ p = p || SECP.cur(); var q = p === "1M" ? x.path : (x.pathp || {})[p];   // [[날짜, 세로, 가로], …]
      if (!q || !m || !SECP.xs(m)) return q;
      var out = q.map(function(r){ var by = ixRet(m, r[0], NX[p][1]), bx = ixRet(m, r[0], NX[p][0]); return by == null || bx == null ? null : [r[0], +(r[1] - by).toFixed(2), +(r[2] - bx).toFixed(2)]; });
      return out.every(function(r){ return r; }) ? out : q; },
    xs: function(m){ return !(window.store && store.secx === false) && !!ixMap(m) && ixRet(m, m.date, 5) != null; },
    ixn: function(m){ var M = ixMap(m); return M ? M.name : "지수"; },
    /* 축 반쪽 길이: 혼자 튄 값은 빼고 정함. 반환값 L, 점은 ±L×0.94 안으로 붙이고 넘친 쪽을 화살표로 */
    lim: function(vals){ var a = vals.filter(function(v){ return v != null && isFinite(v); }).map(Math.abs).sort(function(p, q){ return p - q; });
      if (!a.length) return 1.15; var mx = a[a.length - 1], q = a[Math.floor((a.length - 1) * 0.85)], L = Math.max(q * 1.6, 1);
      return mx <= L * 1.3 ? Math.max(mx, 1) * 1.15 : L * 1.15; },
    clip: function(v, L){ var c = L * 0.94; return v > c ? [c, 1] : v < -c ? [-c, -1] : [v, 0]; },
    /* 가장자리에 붙인 점: 바깥쪽을 가리키는 작은 삼각형 (이름은 그림 아래 한 줄로 — 글씨 겹침 방지) */
    tri: function(cx, cy, dx, dy, col){ var a = Math.atan2(-dy, dx), f = function(r, t){ return (cx + r * Math.cos(t)).toFixed(1) + "," + (cy + r * Math.sin(t)).toFixed(1); };
      return '<polygon points="' + f(11, a) + " " + f(6, a + 2.3) + " " + f(6, a - 2.3) + '" fill="' + col + '" opacity=".9"/>'; },
    out: function(L){ return L.length ? '<div class="secp-out">↗ 너무 멀어 가장자리에 붙인 섹터 · ' + L.map(function(o){ return '<span><i style="background:' + o.c + '"></i>' + e(o.n) + ' <b class="' + (o.v >= 0 ? "up" : "dn") + '">' + sgn(o.v, 1) + '%</b></span>'; }).join(" ") + '</div>' : ""; },
    arr: function(dx, dy){ return ({"1,0": "→", "-1,0": "←", "0,1": "↑", "0,-1": "↓", "1,1": "↗", "-1,1": "↖", "1,-1": "↘", "-1,-1": "↙"})[dx + "," + dy] || ""; },
    rp: function(m){ var p = SECP.cur(); if (p === "1M") return p;                                   // 되감기에 쓸 기간 (자료가 아직 없으면 1개월)
      return (m.sectors || []).filter(function(x){ var q = (x.pathp || {})[p]; return q && q.length; }).length >= 4 ? p : "1M"; },
    today: function(){ return TD; },
    /* kind: "p" 기간만 · "b" 섹터 등락(오늘·1주 포함) · "t" 오늘 카드(오늘 포함) */
    tabs: function(kind){ var c = SECP.cur(), on = function(v){ return kind === "b" ? (BARK ? (v === "D" ? BARK === "r1" : v === "W" && BARK === "r5") : v === c) : kind === "t" ? (TD ? v === "D" : v === c) : v === c; };
      var bs = (kind === "b" ? [["D", "오늘"], ["W", "1주"]] : kind === "t" ? [["D", "오늘"]] : []).concat(PK.map(function(k){ return [k, SP[k].xl]; }));
      var xb = (kind || "p") === "p" ? '<button type="button" data-secx="1" class="secx' + (window.store && store.secx === false ? '' : ' on') + '">📏 지수 대비</button>' : '';
      return '<div class="seg2 secp" data-kind="' + (kind || "p") + '">' + bs.map(function(b){ return '<button type="button" data-secp="' + b[0] + '"' + (on(b[0]) ? ' class="on"' : '') + '>' + b[1] + '</button>'; }).join("") + xb + '</div>'; },
    reg: function(n, fn){ SREG[n] = fn; },
    body: function(n, k, html, tag, cls){ tag = tag || "div"; return '<' + tag + (cls ? ' class="' + cls + '"' : '') + ' data-secpb="' + n + '" data-mk="' + e(k) + '">' + html + '</' + tag + '>'; },
    refresh: function(){
      var C = SECP.C; if (!C) return;
      [].forEach.call(document.querySelectorAll("[data-secpb]"), function(el){ var m = C.markets[el.dataset.mk], fn = SREG[el.dataset.secpb]; if (!m || !fn) return;
        try { var h = fn(m, el.dataset.mk, el); if (h != null) el.innerHTML = h; } catch(err) { console.error(err); } });
      [].forEach.call(document.querySelectorAll(".seg2.secp"), function(w){ var t = document.createElement("div"); t.innerHTML = SECP.tabs(w.dataset.kind);
        var nb = t.firstChild.children; [].forEach.call(w.children, function(b, i){ if (nb[i]) b.classList.toggle("on", nb[i].classList.contains("on")); }); });
    }
  };
  document.addEventListener("click", function(ev){
    var x = ev.target.closest && ev.target.closest("[data-secx]"); if (!x) return;
    try { store.secx = store.secx === false ? true : false; save(); } catch(err) {}
    SECP.refresh();
  });
  var cs = document.createElement("style");
  cs.textContent = ".seg2.secp .secx{margin-left:auto}.seg2.secp .secx:not(.on){opacity:.65}.rotsv .clp{stroke-dasharray:2 2}.rot-hd{font-size:12.5px;color:var(--sub);margin:0 2px 6px;line-height:1.5}.secp-out{font-size:12.5px;color:var(--sub);margin:4px 2px 2px;line-height:1.7}.secp-out span{white-space:nowrap;margin-right:8px}.secp-out i{display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 4px 1px 4px;vertical-align:middle}";
  document.head.appendChild(cs);
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-secp]"); if (!b) return;
    var v = b.dataset.secp;
    if (v === "D"){ BARK = "r1"; TD = true; }
    else if (v === "W"){ BARK = "r5"; }
    else if (SP[v]){ BARK = null; TD = false; try { store.secp = v; save(); } catch(x) {} }
    SECP.refresh();
  });

  function card(title, body, extra){ return '<section class="card">' + (title ? '<h3>' + title + (extra || "") + '</h3>' : '') + body + '</section>'; }
  function sec(t){ return '<div class="sec">' + t + '</div>'; }
  function num(n){ return (n || 0).toLocaleString("ko-KR"); }
  function pct(v){ return v == null ? "–" : sgn(v) + "%"; }
  function sChip(x){ // 종목 칩 → 누르면 종목리포트
    return '<a class="cp-st" href="javascript:openOP(\'' + e(x.s).replace(/'/g, "") + '\')"><b>' + e(x.n) + '</b><em class="tk">' + e(V.cd(x.s)) + '</em><span class="' + cls(x.r1) + '">' + pct(x.r1) + '</span></a>';
  }
  function regChip(lab, big){
    var r = REG[lab] || REG["횡보장"];
    return '<span class="cp-rg ' + r.c + (big ? " big" : "") + '">' + r.i + " " + e(lab) + '</span>';
  }
  function bbar(m, h){ // 상승 / 보합 / 하락 막대 (2px 간격)
    var t = Math.max(1, m.up + m.flat + m.down);
    return '<div class="cp-bb' + (h ? " tall" : "") + '" data-tip="' + e("<b>" + m.name + "</b> 상승 " + num(m.up) + " · 보합 " + num(m.flat) + " · 하락 " + num(m.down)) + '">' +
      '<i class="u" style="flex:' + m.up + '"></i><i class="f" style="flex:' + m.flat + '"></i><i class="d" style="flex:' + m.down + '"></i></div>';
  }

  function overview(C){
    return card("🌏 5개 시장 한눈에 <span class='mut'>오늘 오른 종목 vs 내린 종목</span>",
      '<div class="cp-ov">' + ORDER.filter(function(k){ return C.markets[k]; }).map(function(k){
        var m = C.markets[k], ix = m.index[0], r = m.up / Math.max(1, m.up + m.down) * 100;
        return '<button class="cp-row' + (k === CPSEL ? " on" : "") + '" data-m="' + k + '">' +
          '<div class="cp-h"><span class="cp-f">' + m.flag + '</span><b>' + e(m.name) + '</b>' + regChip(rd(m)) +
          '<span class="cp-ix">' + (ix ? e(ix.name) + ' <b class="' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</b>' : '') + '</span></div>' +
          bbar(m) +
          '<div class="cp-n"><span class="up">▲ ' + num(m.up) + '</span><span class="mut"><i class="cp-lb">오른 비율 </i>' + r.toFixed(0) + '%</span><span class="dn">▼ ' + num(m.down) + '</span></div></button>';
      }).join("") + '</div>');
  }

  function fgGauge(fg){
    if (!fg) return "";
    var a = Math.PI * (1 - fg.score / 100), cx = 110, cy = 100, R = 82;
    var segs = [["#2f6fd0", 0, 20], ["#5b8fd8", 20, 40], ["#6b7385", 40, 60], ["#d98a7a", 60, 80], ["#e05555", 80, 100]];
    var arc = function(p0, p1, c){ var a0 = Math.PI * (1 - p0 / 100), a1 = Math.PI * (1 - p1 / 100);
      return '<path d="M' + (cx + R * Math.cos(a0)).toFixed(1) + ',' + (cy - R * Math.sin(a0)).toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + (cx + R * Math.cos(a1)).toFixed(1) + ',' + (cy - R * Math.sin(a1)).toFixed(1) + '" stroke="' + c + '" stroke-width="16" fill="none"/>'; };
    var s = '<svg viewBox="0 0 220 120" class="fgsv">' + segs.map(function(x){ return arc(x[1] + 0.8, x[2] - 0.8, x[0]); }).join("") +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + (R - 22) * Math.cos(a)).toFixed(1) + '" y2="' + (cy - (R - 22) * Math.sin(a)).toFixed(1) + '" stroke="#e8ecf4" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="#e8ecf4"/><text x="' + cx + '" y="' + (cy - 26) + '" text-anchor="middle" class="fgn">' + fg.score + '</text>' +
      '<text x="18" y="116" class="fgl">공포</text><text x="202" y="116" text-anchor="end" class="fgl">탐욕</text></svg>';
    return '<div class="fgw">' + s + '<div class="fgt">' + e(fg.label) + '</div><div class="fgp">' + fg.parts.map(function(p){
      return '<div><span>' + e(p[0]) + '</span><span class="xbar"><i style="width:' + p[1] + '%;background:' + (p[1] >= 60 ? V.UP : p[1] <= 40 ? V.DN : "#6b7385") + '"></i></span><b>' + e(p[2]) + '</b></div>'; }).join("") + '</div></div>';
  }
  function strength(C){
    var ks = ORDER.filter(function(k){ return C.markets[k]; });
    var rows = ks.map(function(k){ var m = C.markets[k], ix = m.index[0] || {};
      var sc = m.fg ? m.fg.score : (m.breadth10 || 50);
      return {k: k, m: m, sc: sc, c20: ix.chg20}; }).sort(function(a, b){ return b.sc - a.sc; });
    return card("🏁 지금 어느 시장이 제일 강할까 <span class='mut'>체감 온도 순</span>", rows.map(function(r, i){
      return '<div class="xr"><span class="rk">' + (i + 1) + '</span><b>' + r.m.flag + " " + e(r.m.name) + '</b>' + regChip(rd(r.m)) +
        '<span class="xbar" style="flex:1"><i style="width:' + r.sc + '%;background:' + (r.sc >= 60 ? V.UP : r.sc <= 40 ? V.DN : "#6b7385") + '"></i></span><b>' + r.sc + '</b><span class="mut">20일 ' + pct(r.c20) + '</span></div>'; }).join("") +
      '<p class="note">점수 = 오른 종목 비율·신고가 비율·지수 위치·20일 수익률(미국은 VIX까지) 평균. 높을수록 사람들이 사고 싶어 하는 시장.</p>');
  }
  function rotSvgNow(m){
    var p = SECP.cur(), L = SP[p];
    var XS = SECP.xs(m), IXN = SECP.ixn(m);
    var ss = m.sectors.map(function(x){ var q = SECP.xy(x, p, m); return {s: x, x: q.x, y: q.y}; }).filter(function(o){ return o.x != null && o.y != null; });
    if (ss.length < 4) return '<div class="empty">' + L.xl + ' 자료가 아직 모자라요 (상장·자료 기간이 짧은 시장).</div>';
    var TOP = V.topSet(ss.map(function(o){ return {k: o.s.k, r5: o.y, r20: o.x, r1: o.s.r1, n: o.s.n, name: o.s.name, p: o.s.p}; }), 10);
    var W = 330, H = 250, P = 26, mx = SECP.lim(ss.map(function(o){ return o.x; })), my = SECP.lim(ss.map(function(o){ return o.y; }));
    var X = function(v){ return P + (v + mx) / (2 * mx) * (W - 2 * P); }, Y = function(v){ return P + (my - v) / (2 * my) * (H - 2 * P); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="rotsv">' +
      '<rect x="' + X(0) + '" y="' + P + '" width="' + (W - P - X(0)) + '" height="' + (Y(0) - P) + '" fill="#e66767" opacity=".08"/>' +
      '<rect x="' + P + '" y="' + Y(0) + '" width="' + (X(0) - P) + '" height="' + (H - P - Y(0)) + '" fill="#3987e5" opacity=".08"/>' +
      '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="#3a4358"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + P + '" y2="' + (H - P) + '" stroke="#3a4358"/>' +
      '<text x="' + (W - P - 2) + '" y="' + (P + 12) + '" text-anchor="end" class="rotq u">🔥 계속 강함</text><text x="' + (P + 2) + '" y="' + (P + 12) + '" class="rotq">🌱 새로 뜨는 중</text>' +
      '<text x="' + (W - P - 2) + '" y="' + (H - P - 6) + '" text-anchor="end" class="rotq">🍂 힘 빠지는 중</text><text x="' + (P + 2) + '" y="' + (H - P - 6) + '" class="rotq d">🧊 계속 약함</text>' +
      '<text x="' + (W - P) + '" y="' + (H - 6) + '" text-anchor="end" class="rota">' + L.xl + (XS ? ' ' + e(IXN) + ' 대비' : ' 수익률') + ' →</text><text x="6" y="' + (P - 8) + '" class="rota">↑ ' + L.yl + (XS ? ' ' + e(IXN) + ' 대비' : ' 수익률') + '</text>';
    var OUT = [];
    ss.forEach(function(o, i){ var x = o.s, h = x.heat || {}, kx = SECP.clip(o.x, mx), ky = SECP.clip(o.y, my), cx = X(kx[0]), cy = Y(ky[0]), ar = SECP.arr(kx[1], ky[1]);
      if (ar) OUT.push({n: x.name, c: V.secCol(x.k, i), v: kx[1] ? o.x : o.y});
      s += '<g data-csec="' + e(x.k) + '" data-fam="' + V.famOf(x) + '"' + (TOP[x.k] ? ' data-top="1"' : '') + ' style="cursor:pointer" data-tip="' + e("<b>" + x.icon + " " + x.name + "</b><br>오늘 " + pct(x.r1) + " · 1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20) + (h["3M"] != null ? "<br>3개월 " + pct(h["3M"]) : "") + (h["6M"] != null ? " · 6개월 " + pct(h["6M"]) : "") +
          (XS ? "<br>" + IXN + " 대비 " + L.yl + " " + pct(o.y) + " · " + L.xl + " " + pct(o.x) : "") + (ar ? "<br>너무 멀어 가장자리에 붙임" : "")) + '"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="13" fill="transparent"/>' +
        '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="' + V.secCol(x.k, i) + '" stroke="' + (ar ? "#e8ecf4" : "#121826") + '" stroke-width="2"' + (ar ? ' class="clp"' : '') + '/>' +
        (ar ? SECP.tri(cx, cy, kx[1], ky[1], V.secCol(x.k, i)) : '<text x="' + (cx + 7).toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) + '" class="rotl" style="fill:' + V.secCol(x.k, i) + '">' + e(V.shortSec(x.name)) + '</text>') + '</g>'; });
    return s + '</svg>' + SECP.out(OUT);
  }
  function rotNote(m){ var L = SECP.lab(), XS = m && SECP.xs(m);
    return (XS ? '<b>가운데 선 = ' + e(SECP.ixn(m)) + '.</b> 오른쪽 = 지수보다 강함, 왼쪽 = 지수보다 약함 (장 전체가 빠져도 상대적으로 강한 곳이 보임). ' : '') +
      '오른쪽 위 = ' + L.xn + ' 내내 강하고 ' + L.yn + '도 강함 · 왼쪽 위 = ' + L.xn + '은 약했는데 ' + L.yn + ' 살아남 (새로 뜨는 곳) · 오른쪽 아래 = ' + L.xn + ' 강했지만 ' + L.yn + ' 식음.' +
      ' <span class="mut">1개월 = 빠른 신호 · 3개월 = 비중 조절용 · 6개월 = 큰 흐름. 삼각형(▶)이 붙은 섹터는 너무 멀리 있어 가장자리에 붙인 것 — 실제 값은 그림 아래 줄.</span>'; }
  SECP.reg("map", function(m){ return rotSvgNow(m); });
  SECP.reg("mapn", function(m){ return rotNote(m); });
  function rotation(m, k){
    if (m.sectors.filter(function(x){ return x.r5 != null && x.r20 != null; }).length < 4) return "";
    var s = '<div class="famw" data-ff="' + ((window.store && store.secf) || "") + '">' + SECP.body("map", k, rotSvgNow(m)) + V.famChips("map") + '</div>';
    return card("🔄 섹터 로테이션 지도 <span class='mut'>돈이 어디로 움직이나</span>", SECP.tabs("p") + s + SECP.body("mapn", k, rotNote(m), "p", "note"));
  }
  function highs(m){
    if (!m.high_list || !m.high_list.length) return "";
    return card("🏔️ 52주 신고가 <span class='mut'>" + (m.live ? md(m.date) + " 마감 · " : "") + num(m.highs) + "종목 · 큰 회사 순</span>", '<div class="cp-sts">' + m.high_list.map(sChip).join("") + '</div>' +
      (m.high_inds && m.high_inds.length ? '<div class="sub2">신고가가 많이 나온 업종 <span class="mut">누르면 종목</span></div>' + V.hbars(m.high_inds.map(function(x){ return {label: e(x[0]) + ' <span class="hgo">›</span>', v: x[1], text: x[1] + "개", color: "#e66767", attr: ' data-ind="' + e(x[0]) + '" data-im="high" style="cursor:pointer"'}; })) : ""));
  }

  // 📅 10/15: 지수는 오늘 장중(5,693 −5.3%)인데 머리말은 「10/14 마감」 — 지수 날짜·장중 여부를 같이 적기
  function md(d){ return d ? (+d.slice(5, 7)) + "/" + (+d.slice(8, 10)) : ""; }
  /* 10/17 사용자 화면: 미국 장이 끝났는데(05:00 KST) 마지막 장중 값(04:59)이 「장중」으로 남음 → 장 끝난 시각이 지났으면 「마감」 */
  function liveDone(m){
    if (!m.live || !m.live.date) return false;
    var d = m.live.date, mo = +d.slice(5, 7), k = m.code || m.mk || "";
    var nm = String(m.name || "");
    var hhmm = /미국/.test(nm) ? null : /홍콩/.test(nm) ? "17:10" : /중국/.test(nm) ? "16:00" : "15:30";
    var close;
    if (hhmm == null){ var x = new Date(Date.parse(d + "T00:00:00Z") + 864e5); close = Date.parse(x.toISOString().slice(0, 10) + "T" + (mo > 3 && mo < 11 ? "05:00" : "06:00") + ":00+09:00"); }
    else close = Date.parse(d + "T" + hhmm + ":00+09:00");
    return Date.now() > close + 3 * 60e3;
  }
  window.cpLiveDone = liveDone;
  function hdDate(m, ix){
    if (m.live) return e(md(m.live.date)) + " " + (liveDone(m) ? "마감" : e(m.live.t || "") + " 장중");
    if (!ix || !ix.date || ix.date <= m.date) return e(m.date) + " 마감";
    return "지수 " + e(ix.date.slice(5).replace("-", "/")) + (ix.live ? " 장중" : " 마감") + " · 종목 " + e(m.date.slice(5).replace("-", "/")) + " 마감";
  }
  function detail(k, C){
    var m = C.markets[k], ix = m.index[0], h = "";
    BARK = "r1"; TD = true;                // 🗓 화면을 새로 그리면 섹터 등락·오늘 카드는 「오늘」부터 (기간 탭을 누르면 같이 바뀜)
    var PD = m.live ? md(m.date) : "";      // 🧭 10/15: 위 숫자는 오늘 장중(live), 아래 업종·종목 카드는 어제 마감 → 카드 제목에 날짜
    // 🧭 10/19 사용자 「진짜 쫌…」: 서버(ixlive)가 섹터·업종·대형주도 live 로 바꿨으면(m.live.cards) 그 카드들은 「HH:MM 장중」, 52주 신고가만 지난 마감
    var HPD = PD, LT = m.live && m.live.cards ? (liveDone(m) ? md(m.live.date) + " 마감" : (m.live.t || "") + " 장중") : "";
    if (LT) PD = "";
    var T = function(t){ return LT ? t.replace("오늘", "오늘 " + LT) : PD ? t.replace("오늘", PD + " 마감") : t; };
    var hiTxt = (HPD ? '<span class="mut" style="margin-right:6px">' + HPD + ' 마감</span>' : '') + '<span class="chip2 hot">52주 신고가 ' + num(m.highs) + '</span><span class="chip2 cool">52주 신저가 ' + num(m.lows) + '</span>' +
      (m.limit_up != null ? '<span class="chip2 c">' + (k === "KR" ? "상한가" : "상한가(+10%)") + ' ' + num(m.limit_up) + '</span>' : '');
    // 1) 국면 히어로
    h += '<section class="card cp-hero h-' + ((REG[rd(m)] || REG["횡보장"]).c) + '">' +
      '<div class="row"><div><div class="mut">' + m.flag + " " + e(m.name) + " · " + hdDate(m, ix) + '</div>' +
      '<div class="cp-big">' + regChip(rd(m), true) + '</div></div>' +
      (ix ? '<div class="cp-ixb"><small>' + e(ix.name) + '</small><b>' + V.fmt(ix.last) + '</b><span class="' + cls(ix.chg1) + '">' + pct(ix.chg1) + '</span></div>' : '') + '</div>' +
      (ix ? '<p class="note">📐 ' + e(rdWhy(m)) + '</p>' : '') +
      '<p class="cp-sum">' + (m.live ? '<span class="mut">' + e(m.live.t || "") + ' 지금 · </span>' : ix && ix.date > m.date ? '<span class="mut">' + e(m.date.slice(5).replace("-", "/")) + ' 종목 · </span>' : '') + e(m.summary) + '</p></section>';
    h += watchCard(m, k);
    if (m.fg) h += card("🌡️ 오늘 시장 체감 온도 <span class='mut'>" + e(m.name) + " · 종목 등락으로</span>", fgGauge(m.fg) +
      '<p class="note">오늘 하루 종목들의 등락·신고가·지수 위치로 잰 「체감 온도」예요. CNN 방식의 <b>공포·탐욕</b>(심리 지표, 미국 심리 + 자기 시장)은 🎲 시장확률 탭에 5개 시장이 같이 있어요.</p>');
    // 2) 등락 종목 수
    var t = Math.max(1, m.up + m.flat + m.down);
    h += card("오늘 오른 종목 · 내린 종목 <span class='mut'>" + (m.live ? (liveDone(m) ? e(md(m.live.date)) + " 마감 · " : e(m.live.t || "") + " 장중 · ") + (m.live.note && /큰/.test(m.live.note) ? "큰 회사 " : "") : "") + num(m.total) + "종목</span>",
      '<div class="cp-3"><div><small>상승</small><b class="up">' + num(m.up) + '</b><em>' + (m.up / t * 100).toFixed(0) + '%</em></div>' +
      '<div><small>보합</small><b>' + num(m.flat) + '</b><em>' + (m.flat / t * 100).toFixed(0) + '%</em></div>' +
      '<div><small>하락</small><b class="dn">' + num(m.down) + '</b><em>' + (m.down / t * 100).toFixed(0) + '%</em></div></div>' +
      bbar(m, true) + '<div style="margin-top:10px">' + hiTxt + '</div>' +
      '<p class="note">종목 하나하나의 중간값 등락 <b class="' + cls(m.median1) + '">' + pct(m.median1) + '</b> — 지수가 대형주 위주라면 이 숫자가 "보통 종목"의 실제 체감이에요.</p>');
    // 3) 지수 흐름
    if (m.index.length && window.IXC){ h += IXC(m, k, regChip);
      // 🏁 포트 비교 지수 (세계·자산배분) — 같은 차트로. 나라 지수(S&P·코스피·닛케이·항셍·CSI300 등)는 각 나라 탭에
      if (window.IXB) h += IXB(C, regChip);      // 🏁 포트 비교 지수 14개 (어느 나라 탭이든 같은 목록)
    }
    else if (m.index.length){
      var ixTabs = m.index.length > 1 ? '<div class="seg2" id="cpix">' + m.index.map(function(x, i){ return '<button' + (i ? '' : ' class="on"') + ' data-i="' + i + '">' + e(x.name) + '</button>'; }).join("") + '</div>' : '';
      h += card("지수 흐름 <span class='mut'>최근 60거래일 · 점선 = 20일 평균</span>", ixTabs + '<div id="cpixb">' + ixBody(m.index[0]) + '</div>');
    }
    // 4) 등락 종목 수 흐름
    if (m.breadth_hist.length > 3){
      h += card("상승 − 하락 종목 수 흐름 <span class='mut'>최근 " + m.breadth_hist.length + "거래일</span>",
        V.cols(m.breadth_hist.map(function(b, i, a){ return {label: (i % 5 === 4 || i === a.length - 1) ? b[0] : "", v: b[1] - b[2],
          tip: "<b>" + b[0] + "</b><br>상승 " + num(b[1]) + " · 하락 " + num(b[2]) + "<br>차이 " + (b[1] - b[2] > 0 ? "+" : "") + num(b[1] - b[2])}; }), {h: 130}) +
        '<p class="note">막대가 위(빨강)면 오른 종목이 더 많은 날, 아래(파랑)면 내린 종목이 더 많은 날.' +
        (m.breadth10 != null ? ' 최근 10일 평균 상승 비율 <b>' + m.breadth10 + '%</b> — ' + (m.breadth10 >= 55 ? "시장 전체가 같이 오르는 중" : m.breadth10 <= 45 ? "시장 전체가 같이 약한 중" : "종목마다 엇갈리는 중") + '.' : '') + '</p>');
    }
    // 5) 섹터
    if (m.sectors.length){
      h += card("섹터 등락 <span class='mut'>" + (LT ? e(LT) + " · 1주·1개월은 지난 마감까지 · " : PD ? PD + " 마감 · " : "") + "시가총액 가중 · 섹터를 누르면 종목</span>",
        SECP.tabs("b") + SECP.body("bars", k, secBars(m, BARK || "p" + SECP.cur())));
    }
    h += rotation(m, k) + highs(m);
    // 6) 강한 업종
    var hasP = !!(m.ind_p && PK.some(function(p){ return m.ind_p[p]; }));      // 🗓 기간별 강한·약한 업종·대형주 (opdb/compass.py period_cards)
    if (m.strong.length){
      h += '<details class="card cpx-d"><summary>🔥 ' + T("오늘") + ' 강한 업종 TOP ' + Math.min(5, m.strong.length) + ' <span class="mut">' + e(m.strong[0].name) + ' ' + pct(m.strong[0].r1).replace(/<[^>]+>/g, "") + ' 외 · 누르면 종목까지</span></summary>' +
        (hasP ? SECP.tabs("t") : "") + SECP.body("strong", k, strongBody(m)) + '</details>';
    }
    // 7) 대표 종목
    h += card("⭐ " + T("오늘") + " 많이 오른 대형주", (hasP ? SECP.tabs("t") : "") + SECP.body("lead", k, leadBody(m)));
    if (m.weak && m.weak.length){
      h += card("🧊 " + (LT ? "오늘 " + e(LT) + " " : PD ? PD + " 마감 " : "") + "약한 업종", (hasP ? SECP.tabs("t") : "") + SECP.body("weak", k, weakBody(m)));
    }
    if (window.CPX) try { h += window.CPX(m, k, C); } catch(err) { console.error(err); }
    if (window.CPX2) try { var cut = h.indexOf("</section>") + 10; h = h.slice(0, cut) + window.CPX2(m, k, C) + h.slice(cut); } catch(err) { console.error(err); }
    return h;
  }

  // 🗓 기간(1·3·6개월)을 골랐고 그 자료가 있으면 기간 기준, 아니면 오늘 기준
  function pdat(m){ if (TD) return null; var p = SECP.cur(), d = m.ind_p && m.ind_p[p]; return d ? {p: p, d: d, l: (m.lead_p || {})[p]} : null; }
  function pChip(x){ return sChip({s: x.s, n: x.n, r1: x.r}); }
  function pHead(q, t){ return '<div class="sub2" style="margin-top:0">' + SP[q.p].xl + ' ' + t + ' <span class="mut">' + e(String(m_date || "").slice(5).replace("-", "/")) + ' 마감까지 · 시가총액 가중</span></div>'; }
  var m_date = "";
  function strongBody(m){
    var q = pdat(m); m_date = m.date;
    if (q && q.d.strong && q.d.strong.length) return pHead(q, "강한 업종 TOP " + q.d.strong.length) + q.d.strong.map(function(x, i){
      return '<section class="card cp-ind"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n" data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b></div>' +
        '<b class="' + cls(x.r) + ' cp-r">' + pct(x.r) + '</b></div>' +
        '<div class="cp-mini"><span class="up">▲' + x.up + '</span><span class="dn">▼' + x.down + '</span><span class="mut">' + x.n + '종목 · ' + SP[q.p].xl + ' 동안</span></div>' +
        '<div class="cp-sts">' + (x.lead || []).map(pChip).join("") + '</div></section>'; }).join("");
    return m.strong.slice(0, 5).map(function(x, i){
      return '<section class="card cp-ind"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n" data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b></div>' +
        '<b class="' + cls(x.r1) + ' cp-r">' + pct(x.r1) + '</b></div>' +
        '<div class="cp-mini"><span class="up">▲' + x.up + '</span><span class="dn">▼' + x.down + '</span><span class="mut">' + x.n + '종목 · 1주 ' + pct(x.r5) + '</span></div>' +
        '<div class="cp-sts">' + x.lead.map(sChip).join("") + '</div></section>';
    }).join("");
  }
  function leadBody(m){
    var q = pdat(m); m_date = m.date;
    if (q && q.l && q.l.up && q.l.up.length) return pHead(q, "많이 오른 대형주") + '<div class="cp-sts">' + q.l.up.map(pChip).join("") + '</div>' +
      (q.l.dn && q.l.dn.length ? '<div class="sub2">' + SP[q.p].xl + ' 많이 내린 대형주</div><div class="cp-sts">' + q.l.dn.map(pChip).join("") + '</div>' : '');
    return '<div class="cp-sts">' + m.leaders.map(sChip).join("") + '</div>' +
      (m.laggards.length ? '<div class="sub2">많이 내린 대형주</div><div class="cp-sts">' + m.laggards.map(sChip).join("") + '</div>' : '') +
      '<div class="sub2">시가총액 TOP 10</div><div class="cp-sts">' + m.top_cap.map(sChip).join("") + '</div>';
  }
  function weakBody(m){
    var q = pdat(m); m_date = m.date;
    if (q && q.d.weak && q.d.weak.length) return pHead(q, "약한 업종") + q.d.weak.map(function(x){ return '<div class="cp-wk"><b data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b><span class="' + cls(x.r) + '">' + pct(x.r) + '</span><div class="cp-sts">' + (x.lag || []).map(pChip).join("") + '</div></div>'; }).join("");
    return m.weak.map(function(x){ return '<div class="cp-wk"><b data-ind="' + e(x.name) + '" style="cursor:pointer">' + e(x.name) + ' <span class="hgo">›</span></b><span class="' + cls(x.r1) + '">' + pct(x.r1) + '</span><div class="cp-sts">' + x.lead.slice(-2).map(sChip).join("") + '</div></div>'; }).join("");
  }
  SECP.reg("strong", strongBody); SECP.reg("lead", leadBody); SECP.reg("weak", weakBody);
  SECP.reg("bars", function(m){ return secBars(m, BARK || "p" + SECP.cur()); });

  // 🎯 오늘 이 업종·종목을 보자 — 고른 나라의 오늘(1일)·1주 힘·오른 종목 비율로 업종 3개 + 대장주
  function watchCard(m, k){
    var L = (m.strong || []).filter(function(x){ return (x.n || 0) >= 4 && x.r1 != null; });
    if (!L.length) return "";
    L = L.map(function(x){ var br = x.n ? x.up / x.n : .5; return {x: x, sc: x.r1 + (x.r5 || 0) * .5 + (br - .5) * 4}; })
         .sort(function(a, b){ return b.sc - a.sc; }).slice(0, 3);
    return '<section class="card cp-watch"><h3>🎯 오늘 이 업종·종목을 보자 <span class="mut">' + m.flag + ' ' + e(m.name) + ' · ' + (m.live && m.live.cards ? e(liveDone(m) ? md(m.live.date) + " 마감" : (m.live.t || "") + " 장중") + ' 기준' : e(String(m.date || "").slice(5).replace("-", "/")) + (m.live ? ' 마감 기준' : '')) + '</span></h3>' +
      L.map(function(o, i){ var x = o.x;
        return '<div class="cw-row"><div class="row"><div class="row" style="gap:10px"><span class="rk big">' + (i + 1) + '</span><b class="sect-n" data-ind="' + e(x.name) + '">' + e(x.name) + ' <span class="hgo">›</span></b></div>' +
          '<span><b class="' + cls(x.r1) + '">' + pct(x.r1) + '</b> <small class="mut">1주 ' + pct(x.r5) + '</small></span></div>' +
          '<div class="cp-mini"><span class="up">▲' + x.up + '</span><span class="dn">▼' + x.down + '</span><span class="mut">' + x.n + '종목 중 ' + Math.round(x.up / Math.max(1, x.n) * 100) + '% 상승</span></div>' +
          '<div class="cp-sts">' + (x.lead || []).slice(0, 4).map(sChip).join("") + '</div></div>'; }).join("") +
      '<p class="note">오늘 등락 + 1주 흐름 + 업종 안에서 오른 종목 비율로 고른 3곳이에요. 종목을 누르면 종목리포트, 업종을 누르면 전체 종목.</p></section>';
  }

  function ixBody(ix){
    var a = V.lines([{name: ix.name, color: V.CAT[0], vals: ix.close}, {name: "20일 평균", color: "#8a94a8", dash: 1, vals: ix.ma20}], ix.dates, {h: 170, nodots: 1});
    var t = '<div class="cp-chg">' + [["1일", ix.chg1], ["1주", ix.chg5], ["1개월", ix.chg20], ["올해", ix.chgYtd]].map(function(p){
      return '<div><small>' + p[0] + '</small><b class="' + cls(p[1]) + '">' + pct(p[1]) + '</b></div>'; }).join("") + '</div>';
    var pos = ix.hi52 > ix.lo52 ? (ix.last - ix.lo52) / (ix.hi52 - ix.lo52) * 100 : 50;
    var w = '<div class="cp-52"><span>52주 최저 ' + V.fmt(ix.lo52) + '</span><div class="cp-52t"><i style="left:' + pos.toFixed(1) + '%"></i></div><span>최고 ' + V.fmt(ix.hi52) + '</span></div>';
    return a + t + w + '<p class="note">' + regChip(ix.regime) + " " + e(ix.why) + '</p>';
  }

  function secBars(m, k){
    var pk = k.charAt(0) === "p" ? k.slice(1) : null, g = function(x){ return pk ? SECP.val(x, pk) : x[k]; };
    var rows = m.sectors.filter(function(x){ return !pk || g(x) != null; }).sort(function(a, b){ return (g(b) || 0) - (g(a) || 0); });
    if (!rows.length) return '<div class="empty">' + SP[pk].xl + ' 자료가 아직 없어요.</div>';
    return V.dbars(rows.map(function(x){ var h = x.heat || {};
      return {label: x.icon + " " + e(x.name) + ' <span class="hgo">›</span>', v: g(x) || 0, attr: ' data-csec="' + e(x.k) + '" style="cursor:pointer"',
        tip: "<b>" + x.name + "</b> 오늘 " + pct(x.r1) + " · 1주 " + pct(x.r5) + " · 1개월 " + pct(x.r20) + (h["3M"] != null ? " · 3개월 " + pct(h["3M"]) : "") + (h["6M"] != null ? " · 6개월 " + pct(h["6M"]) : "") + "<br>▲" + x.up + " ▼" + x.down + "<br>대표: " + x.big.map(function(s){ return s.n + " " + pct(s.r1); }).join(", ")};
    }));
  }

  function wire(C){
    [].forEach.call(document.querySelectorAll(".cp-row"), function(b){ b.onclick = function(){
      CPSEL = b.dataset.m; store.cpm = CPSEL; save();
      [].forEach.call(document.querySelectorAll(".cp-row"), function(x){ x.classList.toggle("on", x === b); });
      [].forEach.call(document.querySelectorAll("#cpseg button"), function(x){ x.classList.toggle("on", x.dataset.m === CPSEL); });
      $("cpd").innerHTML = detail(CPSEL, C); wireD(C);
      $("cpseg").scrollIntoView({behavior: "smooth", block: "start"});
    }; });
    [].forEach.call(document.querySelectorAll("#cpseg button"), function(b){ b.onclick = function(){
      CPSEL = b.dataset.m; store.cpm = CPSEL; save();
      [].forEach.call(document.querySelectorAll("#cpseg button"), function(x){ x.classList.toggle("on", x === b); });
      [].forEach.call(document.querySelectorAll(".cp-row"), function(x){ x.classList.toggle("on", x.dataset.m === CPSEL); });
      $("cpd").innerHTML = detail(CPSEL, C); wireD(C);
    }; });
    wireD(C);
  }
  function wireD(C){
    var m = C.markets[CPSEL];
    [].forEach.call(document.querySelectorAll("#cpix button"), function(b){ b.onclick = function(){
      [].forEach.call(document.querySelectorAll("#cpix button"), function(x){ x.classList.toggle("on", x === b); });
      $("cpixb").innerHTML = ixBody(m.index[+b.dataset.i]); }; });
  }

  var OLD = RENDER.sector;
  RENDER.sector = function(it, el){
    if (it.files.indexOf("compass.json") < 0){ OLD(it, el); return; }
    el.innerHTML = '<div id="cpbox"><div class="loading">나침반 불러오는 중…</div></div><div id="cpold"></div>';
    getJSON(file("sector", it.id, "compass.json")).then(function(C){
      var ks = ORDER.filter(function(k){ return C.markets[k]; });
      if (!ks.length){ $("cpbox").innerHTML = ""; return; }
      SECP.C = C;
      CPSEL = ks.indexOf(store.cpm) >= 0 ? store.cpm : (ks.indexOf("KR") >= 0 ? "KR" : ks[0]);
      $("cpbox").innerHTML = '<div id="cpreg"></div><div id="cplive"></div>' + overview(C) + '<div id="cptop"></div>' + strength(C) +
        '<div class="seg2 cp-seg" id="cpseg">' + ks.map(function(k){ return '<button data-m="' + k + '"' + (k === CPSEL ? ' class="on"' : '') + '>' + C.markets[k].flag + " " + e(C.markets[k].name) + '</button>'; }).join("") + '</div>' +
        '<div id="cpd">' + detail(CPSEL, C) + '</div>';
      wire(C);
      if (window.CPLIVE) try { CPLIVE($("cplive"), C); } catch(err) { console.error(err); }
      if (window.CPREG) try { CPREG($("cpreg")); } catch(err) { console.error(err); }
      if (window.CPTOP) try { $("cptop").innerHTML = CPTOP(C); } catch(err) { console.error(err); }
    }).catch(function(){ $("cpbox").innerHTML = '<div class="empty">나침반 자료를 못 불러왔어요.</div>'; });
    // 모닝 섹터 브리핑: 그날 것이 없으면(휴장·주말) 가장 최근 브리핑을 이어서 보여주기
    var rest = it.files.filter(function(f){ return f !== "compass.json"; });
    var hasBrief = rest.indexOf("briefing.txt") >= 0 || rest.indexOf("top.json") >= 0;
    var h = "";
    if (rest.length) h += sec(hasBrief ? "☀️ 모닝 섹터 브리핑" : "🗺️ 섹터 히트맵") + '<div id="cpoldb"></div>';
    var prev = null;
    if (!hasBrief) prev = (M.cats.sector || []).filter(function(x){ return x.id <= it.id && (x.files.indexOf("briefing.txt") >= 0 || x.files.indexOf("top.json") >= 0); })[0];
    if (prev) h += '<details class="card cpx-d"><summary>☀️ 모닝 섹터 브리핑 <span class="mut">' + prev.id.slice(5).replace("-", "/") + ' · 가장 최근 (이날은 브리핑이 없었어요)</span></summary><div id="cpoldp"></div></details>';
    $("cpold").innerHTML = h;
    var showPrev = function(){ if (prev && $("cpoldp")) OLD({id: prev.id, files: prev.files.filter(function(f){ return f !== "compass.json"; })}, $("cpoldp")); };
    if (rest.length){
      OLD({id: it.id, files: rest}, $("cpoldb"));
      if (prev){   // 화면 안 id 가 겹치지 않게: 첫 묶음이 다 그려지면 id 를 바꾸고 다음 묶음 그리기
        var n = 0, t = setInterval(function(){
          var b = $("cpoldb"); if (!b){ clearInterval(t); return; }
          if (!b.querySelector(".loading") || ++n > 40){ clearInterval(t);
            [].forEach.call(b.querySelectorAll("[id]"), function(x){ x.id = x.id + "_0"; }); showPrev(); }
        }, 150);
      }
    } else showPrev();
  };
})();
;
/* ======== problive.js ======== */
/* ⚡ 10/19 장중 확률 다시 계산 — 사용자 「지금 거래서 플러스 전환했다…. 대단하다 진짜….」
   🎲 prob.json 은 매시간이라, 10:18 「코스피 −1.79% → 12% 거의 확실히 내린다」가 10:23 +0.54% 반전 뒤에도 남았음.
   prob.py 가 넘긴 재료(ic: 흔들림 sig · 시각별 남은 흔들림 vh · 다른 방법 기울기 dev)에 장중 나침반(live_xx.json, 10분마다)의 지금 등락을 넣어 같은 식을 앱에서 다시 계산.
   window.probLive(m, L) → {p1, chg, t, rem} 또는 null (장 밖·자료 없음·나침반이 더 오래됨) */
(function(){
  function cdf(x){ var t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989423 * Math.exp(-x * x / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; }
  function lg(p){ return Math.log(p / (1 - p)); }
  function sg(x){ return 1 / (1 + Math.exp(-x)); }
  function loc(tz){
    try { var f = new Intl.DateTimeFormat("en-US", {timeZone: tz, hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(new Date()), o = {};
      f.forEach(function(x){ o[x.type] = x.value; });
      return {m: (+o.hour % 24) * 60 + (+o.minute), wd: o.weekday, ymd: o.year + "-" + o.month + "-" + o.day}; } catch(x) { return null; }
  }
  // 같은 식으로 「그 시각·그 등락이었다면」 확률 (장중 흐름 그리기용) — el = 장 시작 뒤 분
  function core(c, chg, el){
    var o = Math.floor(c.open / 100) * 60 + c.open % 100, cl = Math.floor(c.close / 100) * 60 + c.close % 100, tot = cl - o;
    if (el < 0 || el > tot) return null;
    var rem = Math.max(0.02, 1 - el / tot), vr = rem;
    if (c.vh){ var pts = [[0, 1]].concat(c.vh).concat([[tot, 0.003]]);
      for (var i = 0; i < pts.length - 1; i++) if (el >= pts[i][0] && el <= pts[i + 1][0]){ var a = pts[i], b = pts[i + 1]; vr = Math.max(0.003, a[1] + (b[1] - a[1]) * (el - a[0]) / ((b[0] - a[0]) || 1)); break; } }
    var pi = Math.min(0.99, Math.max(0.01, cdf((c.k || 1) * Math.log(1 + chg / 100) / (c.sig * Math.sqrt(vr)))));
    return {p1: Math.round(Math.min(0.99, Math.max(0.01, sg(lg(pi) + (c.c0 || 0) + (c.dev || 0)))) * 1000) / 1000, rem: rem, vr: vr};
  }
  window.probAt = function(m, chg, hhmm){
    var c = m && m.ic; if (!c || chg == null || !hhmm) return null;
    var o = Math.floor(c.open / 100) * 60 + c.open % 100, t = hhmm.split(":");
    return core(c, chg, (+t[0]) * 60 + (+t[1]) - o);
  };
  window.probLive = function(m, L, P){
    var c = m && m.ic; if (!c || !L || !L.index || !L.index[0] || L.index[0].chg == null) return null;
    var T = loc(c.tz); if (!T || T.wd === "Sat" || T.wd === "Sun") return null;
    var o = Math.floor(c.open / 100) * 60 + c.open % 100, cl = Math.floor(c.close / 100) * 60 + c.close % 100, tot = cl - o, el = T.m - o;
    if (el < 0 || el > tot) return null;
    var K = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    if (L.date && L.date !== K && L.date !== T.ymd) return null;                       // 오늘 나침반이 아님
    // 🎲 계산이 휴대폰에 받아 둔 나침반보다 새것이면 🎲 값을 그대로 쓰되 null 을 돌려주지 않음
    // (10/19 12:24 — null 이면 오늘 확률 카드의 ⚡ 지금 장·섹터·집중 종목이 통째로 사라졌음)
    var pNew = P && P.date === K && P.t && L.t && L.t <= P.t && m.p1 != null && m.intra_chg != null;
    var rem = Math.max(0.02, 1 - el / tot), vr = rem;
    if (c.vh){ var pts = [[0, 1]].concat(c.vh).concat([[tot, 0.003]]);
      for (var i = 0; i < pts.length - 1; i++) if (el >= pts[i][0] && el <= pts[i + 1][0]){ var a = pts[i], b = pts[i + 1]; vr = Math.max(0.003, a[1] + (b[1] - a[1]) * (el - a[0]) / ((b[0] - a[0]) || 1)); break; } }
    if (pNew) return {p1: m.p1, chg: m.intra_chg, t: P.t, rem: rem, vr: vr, sig: c.sig, src: "prob"};
    var chg = L.index[0].chg, pi = cdf((c.k || 1) * Math.log(1 + chg / 100) / (c.sig * Math.sqrt(vr)));
    pi = Math.min(0.99, Math.max(0.01, pi));
    var p1 = Math.min(0.99, Math.max(0.01, sg(lg(pi) + (c.c0 || 0) + (c.dev || 0))));
    return {p1: Math.round(p1 * 1000) / 1000, chg: chg, t: L.t, rem: rem, vr: vr, sig: c.sig};
  };
})();
;
/* ======== prob.js ======== */
/* CH Investing — 🎲 시장확률: 내일·일주일 뒤 오를 확률 (5개 시장, 10가지 방법 결합) · archive/x/prob.json (prob.yml 매시간)
   10/14 사용자 「다 합쳐서 확률로 만들어서 나침반 옆에 '시장확률' — 누르면 설명 나오고, 어떤 방법들인지 나오고 접고 · 다섯 개 시장 다」 */
(function(){
  var e = V.e, cls = V.cls;
  var ORDER = ["KR", "US", "JP", "CN", "HK"], SEL = null, OPEN = {};
  try { OPEN = JSON.parse(localStorage.getItem("probopen") || "{}"); } catch(x) {}
  function P(name){ return getJSON("archive/x/" + name + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }
  function xtag(p){ return p != null && (p <= 0.15 || p >= 0.85) ? '<i class="pr-xt" title="모형이 드물게 내는 극단값이에요 — 맞아도 틀려도 크게 보이니 참고만">극단값 · 참고만</i>' : ""; }   // 🔍 11/05 D16
  function pc(p){ return p == null ? "–" : Math.round(p * 100) + "%"; }
  function sg(v, d){ return v == null ? "–" : (v > 0 ? "+" : "") + Number(v).toFixed(d == null ? 1 : d) + "%"; }
  function tcls(p){ return p == null ? "" : p >= 0.57 ? "up" : p <= 0.43 ? "dn" : ""; }
  // 10/15 사용자 「시장을 선택하면 자꾸 맨 밑으로 가」 — 다시 그린 뒤 접기·머리 줄이 시간차로 높이를 바꿈 → 0.8초 동안 누른 자리를 화면 같은 높이에 붙잡음(손대면 멈춤)
  function holdAt(sel, y){
    var stop = false, t0 = Date.now(), quit = function(){ stop = true; };
    window.addEventListener("touchstart", quit, {once: true, passive: true}); window.addEventListener("wheel", quit, {once: true, passive: true});
    (function f(){ if (stop) return; var n = document.querySelector(sel); if (n){ var d = n.getBoundingClientRect().top - y; if (Math.abs(d) > 1) window.scrollTo({top: window.scrollY + d, behavior: "instant"}); }
      if (Date.now() - t0 < 800) requestAnimationFrame(f); })();
  }
  function md(d){ return d ? d.slice(5).replace("-", "/") : ""; }
  // 📅 10/15 사용자: 오늘 열리는 장이면 「오늘」 — 예측 날이 한국 날짜로 오늘이면 오늘, 다음 날이면 내일, 더 뒤(주말 끼임)면 요일
  function kd(off){ var t = new Date(Date.now() + 9 * 3600e3 + (off || 0) * 864e5); return t.toISOString().slice(0, 10); }
  function dlab(d){ if (!d) return "다음 장"; if (d <= kd(0)) return "오늘(" + md(d) + ")"; if (d === kd(1)) return "내일(" + md(d) + ")";
    return "다음 장 " + ["일", "월", "화", "수", "목", "금", "토"][new Date(d + "T00:00:00Z").getUTCDay()] + "(" + md(d) + ")"; }
  // 확률 막대: 가운데 50, 왼쪽(파랑) 내릴 쪽 · 오른쪽(빨강) 오를 쪽
  function pbar(p, big){
    if (p == null) return '<div class="prb' + (big ? " big" : "") + '"><i class="pm" style="left:50%"></i></div>';
    var x = Math.min(95, Math.max(5, p * 100));
    return '<div class="prb' + (big ? " big" : "") + '"><i class="pf ' + (p >= 0.5 ? "u" : "d") + '" style="left:' + Math.min(50, x) + '%;width:' + Math.abs(x - 50) + '%"></i><i class="pm" style="left:' + x + '%"></i></div>';
  }

  // ⏱ 10/19 사용자 「이거 한국시각 뭐니… 일일이 못 하니」 — 기준 시각을 오늘/날짜로 분명히, 늦어지면 스스로 「늦어짐」 표시
  function stamp(D){
    var age = D.at ? (Date.now() - D.at) / 60000 : null, day = D.date && D.date !== kd(0) ? md(D.date) + " " : "";
    var s = "한국시각 " + day + e(D.t) + " 기준 · 매시간" + (D.lvT ? " · 열린 시장은 ⚡ " + e(D.lvT) + " 지금 등락으로 다시 계산" : "");
    if (age != null && age > 75) s += ' · <b class="dn">⏳ ' + Math.round(age / 60 * 10) / 10 + '시간째 안 바뀜 — 지킴이가 다시 돌려요</b>';
    return s;
  }
  var NEXT = {KR: "16:20", JP: "16:20", CN: "16:20", HK: "17:40", US: "다음 날 06:40"};
  function secStamp(mk, S){
    var wd = ["일", "월", "화", "수", "목", "금", "토"][new Date(S.last + "T00:00:00Z").getUTCDay()];
    var s = e(md(S.last)) + "(" + wd + ") 마감 기준";
    var wk = new Date(Date.now() + 9 * 3600e3).getUTCDay(); wk = wk > 0 && wk < 6;
    if (S.last < kd(0) && mk !== "US" && wk) s += " · 오늘 장은 마감 뒤 " + NEXT[mk] + " 반영";
    else if (mk === "US" && wk) s += " · 미국 마감 뒤 06:40 반영";
    return s;
  }

  // ⚡ 10/19: 열린 시장은 장중 나침반(10분마다)의 지금 등락으로 오늘 확률(p1)을 다시 계산 (problive.js) — 🎲 계산(매시간) 사이의 반전을 따라감
  function liveFix(D){
    if (!window.probLive || !D || !D.markets) return D;
    var ks = Object.keys(D.markets).filter(function(k){ return D.markets[k].open_now && D.markets[k].ic; });
    return Promise.all(ks.map(function(k){ return P("live_" + k.toLowerCase() + ".json").catch(function(){ return null; }); })).then(function(R){
      ks.forEach(function(k, i){ var lv = probLive(D.markets[k], R[i], D); if (!lv) return;
        var m = D.markets[k], old = m.p1;
        m.p1 = lv.p1; m.intra_chg = lv.chg; m.e1 = m.pb1 != null ? Math.round((lv.p1 - m.pb1) * 1000) / 10 : m.e1;
        m.lv = lv; D.lvT = lv.t;
        (m.methods || []).forEach(function(x){ if (x.k === "intra"){ x.ev = "⚡ " + lv.t + " 지금 " + m.ixn + " " + (lv.chg > 0 ? "+" : "") + lv.chg.toFixed(2) + "% · 장 남은 시간 " + Math.round(lv.rem * 100) + "% · 남은 흔들림 " + Math.round(lv.vr * 100) + "% · 하루 흔들림 " + (lv.sig * 100).toFixed(1) + "% → 다시 계산 " + Math.round(lv.p1 * 100) + "% (🎲 " + D.t + " 계산은 " + Math.round(old * 100) + "%)"; } });
      });
      return D;
    });
  }
  // 🔒 10/19 사용자 「확률이 개판」 → 실전 성적이 동전보다 확실히 낫기 전(20건↑·55%↑)엔 경고를 크게
  function warn(D){
    var d = D.score && D.score.all && D.score.all.d1 || {};
    if ((d.n || 0) >= 20 && (d.hit || 0) >= 55) return "";
    return '<div style="margin:8px 0 2px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#ffb84d 22%,var(--panel));border:1px solid rgba(255,184,77,.6);font-size:13.5px;line-height:1.45">⚠️ <b>아직 동전보다 못함</b> — 실전 채점 다음 날 방향 ' + (d.n ? Math.round(d.hit / 100 * d.n) + '/' + d.n + ' 맞음 (' + Math.round(d.hit) + '%)' : '채점 전') + '. 아래 적중률(57~65%)은 과거 되짚기 성적이고 실전은 아직 못 따라와요 — 이 숫자로 사고팔지 마세요.</div>';
  }
  function ep(v){ return v == null ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(1) + "%p"; }
  // 10/15 사용자 「확률에 마이너스가 말이 되니?」 — 큰 숫자는 확률 그대로(31%), 평소와의 차이는 말로(「평소 54%보다 23%p 낮음」)
  function gapTx(v, pb){ if (v == null) return ""; var a = Math.abs(v).toFixed(Math.abs(v) >= 10 ? 0 : 1); if (Math.abs(v) < 0.5) return "평소" + (pb != null ? "(" + pc(pb) + ")" : "") + "와 비슷"; return (pb != null ? "평소 " + pc(pb) + "보다 " : "평소보다 ") + a + "%p " + (v > 0 ? "높음 ▲" : "낮음 ▼"); }
  // 10/31 사용자 A5: 칸마다 「▼28%p」 대신 말로 — 평소보다 높음/낮음/평소쯤
  function arw(v){ return v == null ? "" : Math.abs(v) < 3 ? "평소쯤" : Math.abs(v) < 10 ? (v > 0 ? "평소보다 ↑" : "평소보다 ↓") : (v > 0 ? "평소보다 크게 ↑" : "평소보다 크게 ↓"); }
  function ecls(v){ return v == null ? "" : v >= 1 ? "up" : v <= -1 ? "dn" : ""; }
  var STR = {"강": "🔥 강한 신호", "보통": "👀 보통 신호", "약": "💤 약한 신호"};
  // 확대 막대: 40~60% 구간만 그려 작은 차이도 보이게 (평소 = 점선)
  function zbar(p, pb){
    // 10/15: 닻(간밤 미국·선물·장중)으로 40~60% 밖까지 가면 막대도 10~90% 로 넓힘
    var wide = p < 0.4 || p > 0.6, lo = wide ? 0.1 : 0.4, sp = wide ? 0.8 : 0.2;
    var z = function(v){ return Math.min(100, Math.max(0, (v - lo) / sp * 100)); };
    var x = z(p), b = z(pb);
    return '<div class="zb"><i class="zf ' + (p >= pb ? "u" : "d") + '" style="left:' + Math.min(x, b) + '%;width:' + Math.abs(x - b) + '%"></i><i class="zn" style="left:' + b + '%"></i><i class="pm" style="left:' + x + '%"></i></div><div class="zl"><span>' + (wide ? "10%" : "40%") + '</span><span>평소 ' + pc(pb) + '</span><span>' + (wide ? "90%" : "60%") + '</span></div>';
  }
  function votes(v){
    if (!v) return "";
    var dots = new Array(v.up + 1).join('<i class="u"></i>') + new Array(v.flat + 1).join('<i></i>') + new Array(v.down + 1).join('<i class="d"></i>');
    return '<div class="pv"><span class="pvd">' + dots + '</span><small>방법 ' + (v.up + v.down + v.flat) + '개 중 <b class="up">' + v.up + ' 오를 쪽</b> · <b class="dn">' + v.down + ' 내릴 쪽</b> · ' + v.flat + ' 평소</small></div>';
  }
  function tailCard(m){
    if (!m.tail) return "";
    var mx = Math.max.apply(null, m.tail.map(function(t){ return Math.max(t.now, t.norm); }).concat([0.05]));
    return '<div class="sub2">📏 큰 움직임 확률 <span class="mut">지금 변동성 ' + m.sig_now + '% vs 평소 ' + m.sig_norm + '% (하루 1σ)</span></div>' + m.tail.map(function(t){
      var r = t.norm ? t.now / t.norm : 1, up = /오름/.test(t.k);
      return '<div class="pt"><div class="row"><span>' + e(t.k) + '</span><b class="' + (up ? "up" : "dn") + '">' + pc(t.now) + '</b></div>' +
        '<div class="ptb"><i class="' + (up ? "u" : "d") + '" style="width:' + (t.now / mx * 100).toFixed(0) + '%"></i><i class="ptn" style="left:' + (t.norm / mx * 100).toFixed(0) + '%"></i></div>' +
        '<small class="mut">평소 ' + pc(t.norm) + ' · <b class="' + (r >= 1.15 ? (up ? "up" : "dn") : "") + '">' + (r >= 1.05 ? "평소의 " + r.toFixed(1) + "배" : r <= 0.95 ? "평소보다 적음 (" + r.toFixed(1) + "배)" : "평소와 비슷") + '</b></small></div>'; }).join("");
  }
  function strip(D){
    return '<div class="pr5">' + ORDER.filter(function(k){ return D.markets[k]; }).map(function(k){ var m = D.markets[k];
      return '<button class="pr5c' + (k === SEL ? " on" : "") + '" data-m="' + k + '"><b>' + m.flag + ' ' + e(m.name) + '</b>' +
        '<span class="pr5p ' + ecls(m.e1) + '">' + Math.round(m.p1 * 100) + '<small>%</small></span>' + (m.pb1 != null ? zbar(m.p1, m.pb1).split('<div class="zl">')[0] : pbar(m.p1)) + '<small class="' + ecls(m.e1) + '">' + (Math.abs(m.e1) < 3 ? "평소쯤" : m.e1 > 0 ? "평소↑" : "평소↓") + '</small></button>'; }).join("") + '</div>';
  }
  // 10/14 사용자 「각 시장 밑에 오르고 내릴 섹터 확률도, 그 안에 종목들 확률도」 → archive/x/prob_sec.json (prob_sec.yml)
  var SECX = null, SOPEN = {}, SALL = {}, REGM = null;
  // 🌡️ 10/28 사용자 「미국 지수 차트를 보면 극공포가 맞아? 바꿔야 하지 않을까」 → 우리 점수는 「지난 1년 안 순위」라 말을 상대 표현으로.
  //   CNN·크립토 공포·탐욕은 원래 이름(극공포 등) 그대로. 숫자·구간·연구 표 계산은 안 바꿈.
  function OL(x){ return x < 20 ? "1년 중 가장 움츠림" : x < 40 ? "평소보다 조심" : x < 60 ? "보통" : x < 80 ? "평소보다 들뜸" : "1년 중 가장 들뜸"; }
  function OS(x){ return x < 20 ? "가장 움츠림" : x < 40 ? "조심" : x < 60 ? "보통" : x < 80 ? "들뜸" : "가장 들뜸"; }
  function OK(k){ return String(k || "").replace(/^극공포/, "1년 중 가장 움츠림").replace(/^공포/, "평소보다 조심").replace(/^중립/, "보통").replace(/^극탐욕/, "1년 중 가장 들뜸").replace(/^탐욕/, "평소보다 들뜸"); }
  function lg(p){ p = Math.min(0.9999, Math.max(0.0001, p)); return Math.log(p / (1 - p)); }
  function sgm(x){ return 1 / (1 + Math.exp(-x)); }
  // 😱 심리 지표 카드 — 우리 공포·탐욕 게이지 · 항목 · 연구 표(구간별 다음 5일 상승 확률)
  function rtable(tb, now, ours){
    if (!tb || !tb.length) return "";
    return '<table class="pr-tb"><tr><th>구간</th><th>날수</th><th>내일↑</th><th>5일↑</th><th>5일 중앙값</th></tr>' + tb.map(function(r){
      return '<tr' + (r.now ? ' class="now"' : '') + '><td>' + (r.now ? '👉 ' : '') + e(ours ? OK(r.k) : r.k) + '</td><td>' + (r.n || 0).toLocaleString() + '</td><td class="' + tcls(r.p1) + '">' + pc(r.p1) + '</td><td class="' + tcls(r.p5) + '">' + pc(r.p5) + '</td><td class="' + cls(r.m5) + '">' + (r.m5 != null ? sg(r.m5, 2) : "–") + '</td></tr>'; }).join("") + '</table>';
  }
  function sentiCard(m, D){
    var R = m.research || {}, S = R.senti;
    if (!S || S.now == null) return "";
    var v = S.now, lab = OL(v), col = v < 20 ? "#2f6fd0" : v < 40 ? "#5b8fd8" : v < 60 ? "#6b7385" : v < 80 ? "#d98a7a" : "#e05555";
    var B = SECX && SECX.markets && SECX.markets[m.mk] && SECX.markets[m.mk].breadth, op = OPEN["_s" + m.mk];
    // 10/15 사용자 「공포탐욕이 왜 미국만 나와? 다른 시장도 다 나오게」 → 맨 위에 5개 시장 공포·탐욕 한 줄 (누르면 그 시장)
    var fl = OS;
    var fc = function(x){ return x < 20 ? "#2f6fd0" : x < 40 ? "#5b8fd8" : x < 60 ? "#6b7385" : x < 80 ? "#d98a7a" : "#e05555"; };
    var strip5 = '<div class="sg5">' + ORDER.filter(function(k){ return D.markets[k] && D.markets[k].research && D.markets[k].research.senti && D.markets[k].research.senti.now != null; }).map(function(k){
        var mm = D.markets[k], x = Math.round(mm.research.senti.now);
        return '<button class="sg5c' + (k === m.mk ? " on" : "") + '" data-m="' + k + '"><small>' + mm.flag + ' ' + e(mm.name) + '</small><b style="color:' + fc(x) + '">' + x + '</b><em style="color:' + fc(x) + '">' + fl(x) + '</em>' +
          '<i class="sg5b"><i style="left:' + x + '%"></i></i></button>'; }).join("") + '</div>';
    var h = '<section class="card"><h3>🌡️ 시장 심리 온도 <span class="mut">지난 1년과 비교 · 매시간</span></h3>' + strip5 +
      '<div class="sub2" style="margin-top:4px">' + m.flag + ' ' + e(m.name) + ' 자세히</div>' +
      '<div class="sg-w"><div class="sg-n" style="color:' + col + '">' + Math.round(v) + '</div><div style="flex:1"><b style="color:' + col + '">' + lab + '</b>' +
      '<div class="sg-b"><i style="left:' + v + '%"></i></div><div class="zl"><span>움츠림</span><span>보통</span><span>들뜸</span></div></div></div>' +
      (function(){ var w = S.how || {}, fl = function(x){ return x < 20 ? "극공포" : x < 40 ? "공포" : x < 60 ? "중립" : x < 80 ? "탐욕" : "극탐욕"; }, t = [];   // 10/15 계산 풀이 + CNN 원본
        var rg = REGM && REGM[m.mk], up = rg && /상승|우위/.test(rg.label || "");
        if (up && v < 40) t.push('💡 ' + m.flag + ' 지수 흐름은 <b>' + e(rg.label) + '</b>인데 심리는 ' + (v < 20 ? '지난 1년 중 가장 식어 있어요' : '평소보다 조심스러워요') + ' — 무섭다기보다 <b>쉬어 가는 중</b>이라는 뜻이에요');
        else if (rg && /하락|약세/.test(rg.label || "") && v >= 60) t.push('💡 ' + m.flag + ' 지수 흐름은 <b>' + e(rg.label) + '</b>인데 심리는 평소보다 들떠 있어요 — 반등 기대가 앞선 상태예요');
        t.push('<span class="mut">이 점수는 「지금이 무서운가」가 아니라 <b>지난 1년 안에서 몇 번째로 들떠 있나</b>예요. 강하게 오른 해엔 잠깐 쉬어도 낮게 나와요.</span>');
        if (w.avg != null) t.push(m.mk === "US" ? '아래 ' + (S.parts || []).length + '개 항목 평균 <b>' + w.avg + '</b>점 → 지난 1년 중 몇 % 자리인지로 바꾸면 <b>' + Math.round(v) + '</b>점'
          : '🇺🇸 미국 심리 <b>' + w.us + '</b> · ' + m.flag + ' ' + e(m.name) + ' 자체 <b>' + w.loc + '</b> → 미국 1/3 · 자기 시장 2/3로 섞어 지난 1년 중 몇 % 자리인지로 바꾸면 <b>' + Math.round(v) + '</b>점');
        if (w.asof) t.push('<span class="mut">항목 기준일 ' + md(w.asof) + ' 마감 — 모든 항목 자료가 다 들어온 마지막 날</span>');
        if (m.open_now && m.intra_chg != null && Math.abs(m.intra_chg) >= 1.5) t.push('⚠️ 오늘 장중 ' + (m.intra_chg > 0 ? '+' : '') + m.intra_chg.toFixed(1) + '%는 아직 안 들어갔어요 — 마감 뒤 다시 계산하면 ' + (m.intra_chg < 0 ? '움츠림 쪽으로' : '들뜸 쪽으로') + ' 움직여요');
        if (w.cnn != null) t.push('📰 CNN 공식 공포·탐욕(미국) <b>' + w.cnn + '</b> (' + fl(w.cnn) + ' · ' + md(w.cnn_d) + ')');
        return t.length ? '<div class="sg-how">' + t.join('<br>') + '</div>' : ''; })() +
      '<div class="sg-ps">' + (S.parts || []).map(function(p){ var loc = /^자기 |코스닥\/코스피|\(반대 · 자국|엔 약세/.test(p.k); return '<div><small>' + (m.mk === "US" ? "🇺🇸 " : loc ? m.flag + " " : "🇺🇸 ") + e(p.k.replace(/^자기 지수/, (m.ixn || "") )) + '</small><span class="xbar" style="flex:1"><i style="width:' + p.v + '%;background:' + (p.v >= 60 ? "var(--up)" : p.v <= 40 ? "var(--down)" : "#6b7385") + '"></i></span><b>' + p.v + '</b></div>'; }).join("") + '</div>' +
      '<div class="sub2">📚 연구: 심리 구간별 그 뒤 성적 <span class="mut">' + e(m.ixn) + ' · ' + e(S.since || "") + '~</span></div>' + rtable(S.table, null, true) +
      '<button class="fold pr-f' + (op ? " open" : "") + '" data-f="_s' + m.mk + '">🔬 다른 심리·폭 지표 연구 표 <i class="fchev">▾</i></button><div style="' + (op ? "" : "display:none") + '">' +
      (R.vterm ? '<div class="sub2">🌡️ VIX ÷ VIX3M 구간별</div>' + rtable(R.vterm) : '') +
      (R.cnn ? '<div class="sub2">📰 CNN 공포·탐욕 구간별</div>' + rtable(R.cnn) : '') +
      (R.crypto ? '<div class="sub2">🪙 크립토 공포·탐욕 구간별 (2018~)</div>' + rtable(R.crypto) : '') +
      (B && B.table ? '<div class="sub2">📊 50일선 위 종목 비율 구간별 (최근 2년 · 지금 ' + B.pct50 + '%' + (B.thrust ? ' · ⚡ 쯔바이크 신호' : '') + ')</div>' + rtable(B.table) : '') + '</div>' +
      '<p class="note">' + e(D.senti_how || "") + ' 항목 막대 = 1년 중 백분위(높을수록 탐욕).</p></section>';
    return h;
  }
  function secCard(mk, M0){
    var S = SECX && SECX.markets && SECX.markets[mk];
    if (!S) return '<section class="card"><h3>🧭 섹터·종목 확률</h3><p class="note" style="margin:0">아직 계산 전이에요 — 하루 4번(장 마감 뒤) 새로 계산해요.</p></section>';
    // 섹터·종목 확률 = 위 시장 카드의 일주일 확률(M0.p5) + 그 섹터·종목만의 기울기(d5) → 시장 카드와 같은 「평소」(M0.pb5) 기준
    var b5 = M0 && M0.pb5 != null ? M0.pb5 : S.base.y5, mp5 = M0 && M0.p5 != null ? M0.p5 : S.base.y5, br = S.base.yr5, all = SALL[mk], secs = S.sectors || [];
    var ab = function(x){ return x.d5 != null ? sgm(lg(mp5) + x.d5) : x.p5; };
    var show = all || secs.length <= 9 ? secs : secs.slice(0, 5).concat([null]).concat(secs.slice(-3));
    var row = function(x){
      if (!x) return '<div class="ps-gap">⋯</div>';
      var a5 = ab(x), e5 = (a5 - b5) * 100, er = (x.pr5 - br) * 100, op = SOPEN[mk + x.k];
      return '<div class="ps-r' + (op ? " open" : "") + '" data-sk="' + e(x.k) + '"><div class="ps-h"><span class="hm-i">' + x.icon + '</span><b>' + e(x.name) + '</b><small class="mut">' + x.n + '종목</small>' +
        '<span class="ps-v"><b class="' + ecls(e5) + '">' + pc(a5) + '</b><small class="' + ecls(e5) + '">' + arw(e5) + '</small></span><i class="fchev">▾</i></div>' +
        '<div class="ps-bar">' + zbar(a5, b5).split('<div class="zl">')[0] + '</div>' +
        '<small class="ps-sub">시장보다 나을 확률 <b class="' + ecls(er) + '">' + pc(x.pr5) + '</b> (평소 ' + pc(br) + ') · 지난 5일 ' + sg(x.r5) + (x.mom ? ' · 🔁 ' + e(x.mom) : '') + '</small>' +
        (op ? '<div class="ps-st">' + x.st.map(function(t, i){ var te = (ab(t) - b5) * 100, tr = (t.pr5 - br) * 100;
          return '<a class="ps-t" href="javascript:openOP(\'' + e(t.s).replace(/'/g, "") + '\')"><span class="ps-tn"><b>' + e(t.n) + '</b><em class="tk">' + e(V.cd ? V.cd(t.s) : t.s) + '</em></span>' +
            '<span class="ps-tv"><b class="' + ecls(te) + '">' + pc(ab(t)) + '</b><small><span class="' + ecls(te) + '">' + arw(te) + '</span> · 시장보다 나을 <span class="' + ecls(tr) + '">' + pc(t.pr5) + '</span></small></span></a>'; }).join("") + '</div>' : '') + '</div>';
    };
    var RL = {"믿을 만": ["✅", "s3"], "약함": ["👀", "s2"], "동전 수준": ["💤", "s1"]}[S.rel] || ["", ""];
    return '<section class="card"><h3>🧭 섹터·종목 확률 <span class="mut">일주일 · 평소보다 · ' + secStamp(mk, S) + '</span></h3>' +
      (S.rel ? '<div class="pr-sg"><span class="pr-bd ' + RL[1] + '">' + RL[0] + ' 모델 ' + e(S.rel) + '</span><small class="mut">검증 AUC ' + S.auc.y5 + (S.rel === "믿을 만" ? '' : ' — 확률을 평소 쪽으로 눌러 보여 줘요(순위는 그대로)') + '</small></div>' : '') +
      show.map(row).join("") +
      (secs.length > 9 ? '<button class="fold ps-all" data-mk="' + mk + '">' + (all ? "줄이기 ▴" : "섹터 " + secs.length + "개 모두 보기 ▾") + '</button>' : '') +
      '<p class="note">큰 숫자 = 그 섹터(종목)가 일주일 뒤 오를 확률이 평소(' + pc(b5) + ')보다 얼마나 높고 낮은지 — 위 시장 확률(' + pc(mp5) + ')에 그 섹터·종목만의 기울기를 더한 값. 섹터를 누르면 종목 — 「시장보다」 높은 순. ' + S.n + '종목 · 검증 AUC 일주일 ' + (S.auc.y5 != null ? S.auc.y5 : "–") + ' · 시장 대비 ' + (S.auc.yr5 != null ? S.auc.yr5 : "–") + ' (0.5 = 동전, 0.55 넘으면 쓸 만)</p></section>';
  }
  function mcard(m, D){
    var open = OPEN[m.mk];
    var h = '<section class="card pr-c"><h3>' + m.flag + ' ' + e(m.name) + ' <span class="mut">' + e(m.ixn) + ' ' + V.fmt(m.last) + ' <b class="' + cls(m.chg) + '">' + sg(m.chg, 2) + '</b> · ' + md(m.base_date) + (m.open_now ? ' 장중' : ' 마감') + ' 기준' + (m.filled ? ' <span title="야후 일봉이 늦어 장중 나침반의 마감 값으로 채움">📅</span>' : '') + '</span></h3>' +
      (m.strength ? '<div class="pr-sg"><span class="pr-bd s' + ({"강": 3, "보통": 2, "약": 1}[m.strength]) + '">' + STR[m.strength] + '</span>' + votes(m.votes) + '</div>' : '') +
      (function(){ var c = (m.comb || {}).p1 || {}, a = c.anchor && (m.methods || []).filter(function(x){ return x.k === c.anchor; })[0]; if (!a) return '';   // 🧭 10/15 닻
        return '<div class="pr-anc">' + a.ic + ' <b>닻 ' + pc(c.p_anchor) + '</b> — ' + e(a.ev) + (c.dev ? ' · 나머지 방법 ' + (c.dev > 0 ? '+' : '') + (c.dev * 25).toFixed(1) + '%p 남짓' : '') + '</div>'; })() +
      '<div class="pr-two"><div><small>' + dlab(m.next_day) + ' · 오를 확률</small><b class="' + ecls(m.e1) + '">' + pc(m.p1) + '</b> + xtag(m.p1)<em><span class="pr-gp ' + ecls(m.e1) + '">' + gapTx(m.e1, m.pb1) + '</span> · 68% 폭 ' + sg(m.band1[0]) + ' ~ ' + sg(m.band1[1]) + '</em>' + (m.pb1 != null ? zbar(m.p1, m.pb1) : pbar(m.p1, 1)) + '</div>' +
      '<div><small>일주일(5일) · 오를 확률</small><b class="' + ecls(m.e5) + '">' + pc(m.p5) + '</b> + xtag(m.p5)<em><span class="pr-gp ' + ecls(m.e5) + '">' + gapTx(m.e5, m.pb5) + '</span> · 68% 폭 ' + sg(m.band5[0]) + ' ~ ' + sg(m.band5[1]) + '</em>' + (m.pb5 != null ? zbar(m.p5, m.pb5) : pbar(m.p5, 1)) + '</div></div>' +
      tailCard(m) +
      (m.mk === "KR" && window.twinKR ? '<div id="twinkr"></div>' : '') +   // 🧲 10/21 A10/21-2 닮은 날 — 한국은 상태 한 줄 자리에 (twin.js)
      (m.mk === "KR" && window.twinKR ? '' : '<p class="note pr-st">' + e(m.state) + (m.widen > 1 ? ' · 📣 이벤트로 폭 ×' + m.widen : '') + (m.open_now ? ' · 장중이라 오늘 봉이 아직 움직여요 — 마감 뒤 확률이 기록·채점돼요' : '') + '</p>');
    // 방법들 (접기)
    // 10/14 밤: 방법을 묶음(가격·심리·자금·선행·폭·일정·판단·모델)으로 · 평소 대비 기울기 · 믿음(표본 크기)
    var GO = ["가격", "심리", "자금", "선행", "폭·수급", "일정", "판단", "모델"], GI = {"가격": "📈", "심리": "😱", "자금": "💵", "선행": "🛰️", "폭·수급": "📊", "일정": "🗓️", "판단": "🧠", "모델": "🤖"};
    var mrow = function(x){
      var has = x.p1 != null && x.w, dv = has ? (x.p1 - m.pb1) * 100 : null;
      return '<div class="pr-m' + (has ? "" : " off") + '"><div class="pr-mh"><span class="hm-i">' + x.ic + '</span><b>' + e(x.name) + '</b>' +
        (has ? '<span class="pr-mp"><span class="' + ecls(dv) + '">' + pc(x.p1) + '</span><small><span class="' + ecls(dv) + '">' + arw(dv) + '</span> · 주 ' + pc(x.p5) + '</small></span>' : '<span class="pr-mp mut">기울기 없음</span>') + '</div>' +
        (has ? zbar(x.p1, m.pb1).split('<div class="zl">')[0] : '') + '<small class="pr-ev">' + e(x.ev) + '</small>' +
        (has && x.eb != null ? '<small class="pr-eb">믿음 ' + Math.round(x.eb * 100) + '%' + (x.n ? ' (표본 ' + x.n.toLocaleString() + '일)' : '') + ' · 가중치 ×' + (x.w_eff != null ? x.w_eff : x.w) + '</small>' : '') + '</div>';
    };
    var grp = {};
    (m.methods || []).forEach(function(x){ (grp[x.grp || "기타"] = grp[x.grp || "기타"] || []).push(x); });
    var rows = GO.concat(Object.keys(grp).filter(function(k){ return GO.indexOf(k) < 0; })).filter(function(k){ return grp[k]; }).map(function(k){
      var xs = grp[k], act = xs.filter(function(x){ return x.p1 != null && x.w; }), up = act.filter(function(x){ return x.p1 > m.pb1 + 0.005; }).length, dn = act.filter(function(x){ return x.p1 < m.pb1 - 0.005; }).length;
      return '<div class="pr-g"><b>' + (GI[k] || "•") + ' ' + e(k) + '</b><small class="mut">' + act.length + '개 · <span class="up">↑' + up + '</span> <span class="dn">↓' + dn + '</span></small></div>' + xs.map(mrow).join("");
    }).join("");
    var CB = m.comb && m.comb.p1;
    h += '<button class="fold pr-f' + (open ? " open" : "") + '" data-f="' + m.mk + '">🧩 왜 이 숫자인가 — 방법 ' + (m.methods || []).length + '가지 <i class="fchev">▾</i></button>' +
      '<div class="pr-ms" style="' + (open ? "" : "display:none") + '">' +
      (CB ? '<div class="pr-cb">⚖️ 근거 <b>' + CB.m + '</b>개 → 서로 겹치는 정도를 빼면 독립 근거 <b>' + CB.meff + '</b>개 몫 → <b class="' + ecls(m.e1) + '">' + gapTx(m.e1, m.pb1) + '</b></div>' : '') +
      rows + '<p class="note">큰 숫자 = 그 방법만 보면 평소보다 몇 %p. 「믿음」= 표본이 많을수록 높음 (n ÷ (n+150)) — 표본이 적은 극단 통계가 혼자 흔들지 못하게. 결합은 아래 📖 설명의 ⚖️ 칸.</p></div>';
    // 채점 (시장별)
    var S = D.score && D.score[m.mk];
    if (S && (S.d1.n || S.d5.n)){
      h += '<div class="sub2">🎯 이 시장 채점 <span class="mut">마감 뒤 실제 결과로</span></div><div class="x4">' +
        '<div><small>내일 예측</small><b>' + (S.d1.n ? S.d1.hit + '%' : '–') + '</b><small class="mut">' + S.d1.n + '건 · 브라이어 ' + (S.d1.brier != null ? S.d1.brier : '–') + '</small></div>' +
        '<div><small>일주일 예측</small><b>' + (S.d5.n ? S.d5.hit + '%' : '–') + '</b><small class="mut">' + S.d5.n + '건 · 브라이어 ' + (S.d5.brier != null ? S.d5.brier : '–') + '</small></div></div>' +
        (S.recent && S.recent.length ? '<div class="pr-rc">' + S.recent.slice().reverse().map(function(r){
          return '<span>' + md(r.d) + ' <b class="' + tcls(r.p1) + '">' + pc(r.p1) + '</b> → ' + (r.r1 != null ? '<b class="' + cls(r.r1) + '">' + sg(r.r1) + '</b>' : '<i class="mut">대기</i>') +
            ' · 주 <b class="' + tcls(r.p5) + '">' + pc(r.p5) + '</b> → ' + (r.r5 != null ? '<b class="' + cls(r.r5) + '">' + sg(r.r5) + '</b>' : '<i class="mut">대기</i>') + '</span>'; }).join("") + '</div>' : '');
    } else h += '<p class="note">🎯 채점은 마감 뒤 첫 기록부터 쌓여요 — 내일 예측은 다음 날, 일주일 예측은 5거래일 뒤 실제 결과와 맞춰 봐요.</p>';
    return h + '</section>';
  }
  function howCard(D){
    var open = OPEN._how, last = null;
    return '<button class="fold pr-f' + (open ? " open" : "") + '" data-f="_how">📖 시장확률이란 — 어떻게 계산하나 (' + (D.how || []).length + '가지) <i class="fchev">▾</i></button>' +
      '<section class="card pr-how" style="' + (open ? "" : "display:none") + '"><p class="note" style="margin:0 0 10px">' + e(D.note || "") + '</p>' +
      '<p class="note" style="margin:0 0 6px"><b>공통 원리</b> — 모든 지표는 같은 방식으로 확률이 돼요: 「지금과 같은 구간이었던 과거 날들의 다음 날·5일 뒤 상승 비율」. 지어낸 가중치가 아니라 이 앱이 매시간 과거 자료로 다시 세는 숫자예요.</p>' +
      (D.how || []).map(function(x, i){ var g = x.length > 2 ? x[0] : "", t = x.length > 2 ? x[1] : x[0], d = x.length > 2 ? x[2] : x[1];
        var hd = g && g !== last ? '<div class="pr-g"><b>' + e(g) + '</b></div>' : ''; last = g;
        return hd + '<div class="pr-hw"><span class="rk">' + (i + 1) + '</span><div><b>' + e(t) + '</b><small>' + e(d) + '</small></div></div>'; }).join("") +
      '<p class="note">브라이어 점수 = (확률 − 결과)² 의 평균. 0 이면 완벽, 0.25 면 늘 50% 라고 한 것과 같음. 「오를 쪽」이라 한 날들이 실제로 그만큼 올랐는지(보정표)는 아래 채점에서.</p></section>';
  }
  function allScore(D){
    var A = D.score && D.score.all; if (!A || !(A.d1.n || A.d5.n)) return '';
    var bk = function(s){ return (s.buckets || []).map(function(b){ return '<span>' + e(b.k) + ' <small>' + b.n + '건</small> 말한 ' + b.pred + '% → 실제 ' + b.real + '%</span>'; }).join(""); };
    return '<section class="card"><h3>🎯 전체 채점 <span class="mut">5개 시장 합산</span></h3><div class="x4">' +
      '<div><small>내일 적중</small><b>' + (A.d1.n ? A.d1.hit + '%' : '–') + '</b><small class="mut">' + A.d1.n + '건</small></div><div><small>내일 브라이어</small><b>' + (A.d1.brier != null ? A.d1.brier : '–') + '</b><small class="mut">0.25 = 동전</small></div>' +
      '<div><small>일주일 적중</small><b>' + (A.d5.n ? A.d5.hit + '%' : '–') + '</b><small class="mut">' + A.d5.n + '건</small></div><div><small>일주일 브라이어</small><b>' + (A.d5.brier != null ? A.d5.brier : '–') + '</b><small class="mut"></small></div></div>' +
      (A.d1.buckets && A.d1.buckets.length ? '<div class="sub2">보정표 (내일)</div><div class="pr-rc">' + bk(A.d1) + '</div>' : '') + '</section>';
  }
  function draw(D){ window.__probD = D;   // 📨 시장확률 한 장이 화면과 같은 값(장중 덧입힌 값)을 쓰게
    var b = document.getElementById("prbody"); if (!b) return;
    var ks = ORDER.filter(function(k){ return D.markets[k]; });
    if (!ks.length){ b.innerHTML = '<div class="empty"><div class="big">🎲</div>시장확률 자료가 아직 없어요.</div>'; return; }
    if (!SEL || !D.markets[SEL]) SEL = ks[0];
    var h = '<section class="card"><h3>🎲 다음 장 · 오를 확률 <span class="mut">' + stamp(D) + '</span></h3>' + strip(D) + warn(D) +
      '<p class="note">큰 숫자 = 다음 장에서 그 시장이 어제보다 오를 확률. ▲▼ = 「평소」(2000년 이후 오른 날 비율)보다 얼마나 높고 낮은지. 🧭 10/15부터 <b>이미 아는 정보를 닻</b>으로 써요 — 아시아는 간밤 미국 장, 미국은 선물 갭, 장이 열려 있으면 지금 등락과 남은 시간. 2012년 이후 걸어가며 검증한 적중률: 한국 62% · 일본 65% · 홍콩 60% · 중국 57% · 미국 64% (예전 52~54%). 60% 넘거나 40% 밑인 날은 67~79% 맞았어요.</p></section>';
    h += mcard(D.markets[SEL], D) + sentiCard(D.markets[SEL], D) + secCard(SEL, D.markets[SEL]) + allScore(D) + howCard(D);
    b.innerHTML = h;
    if (SEL === "KR" && window.twinKR) try { twinKR(document.getElementById("twinkr"), D.markets.KR); } catch(x) {}   // 🧲 A10/21-2
    [].forEach.call(b.querySelectorAll(".pr5c[data-m]"), function(x){ x.onclick = function(){ SEL = x.dataset.m; draw(D); window.scrollTo({top: 0, behavior: "smooth"}); }; });
    [].forEach.call(b.querySelectorAll(".sg5c[data-m]"), function(x){ x.onclick = function(){ var y = x.getBoundingClientRect().top; SEL = x.dataset.m; draw(D);   // 공포·탐욕 띠: 그 자리 그대로 시장만 바꿈
      holdAt('.sg5c[data-m="' + SEL + '"]', y); }; });
    [].forEach.call(b.querySelectorAll(".ps-r .ps-h"), function(x){ x.onclick = function(){ var k = SEL + x.parentNode.dataset.sk; SOPEN[k] = !SOPEN[k]; var y = window.scrollY; draw(D); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".ps-all"), function(x){ x.onclick = function(){ SALL[x.dataset.mk] = !SALL[x.dataset.mk]; var y = window.scrollY; draw(D); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".pr-f[data-f]"), function(x){ x.onclick = function(){ var k = x.dataset.f, nx = x.nextElementSibling; OPEN[k] = !OPEN[k]; x.classList.toggle("open", OPEN[k]); if (nx) nx.style.display = OPEN[k] ? "" : "none"; try { localStorage.setItem("probopen", JSON.stringify(OPEN)); } catch(z) {} }; });
  }
  window.probView = function(){ return '<div id="prbody"><div class="loading">확률 계산 자료 불러오는 중…</div></div>'; };
  window.probInit = function(){
    P("prob_sec.json").then(function(j){ SECX = j; }).catch(function(){}).then(function(){ return P("regime_mk.json").then(function(j){ var ms = j && j.markets; REGM = {};
      (ms ? (ms.length ? ms : Object.keys(ms).map(function(k){ return ms[k]; })) : []).forEach(function(x){ if (x && x.mk) REGM[x.mk] = x; }); }).catch(function(){}); }).then(function(){ return P("prob.json"); }).then(liveFix).then(draw).catch(function(){ var b = document.getElementById("prbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">🎲</div>시장확률이 아직 안 올라왔어요.<br>다음 시간 계산 때 채워져요.</div>'; });
  };
  (function(){ var st = document.createElement("style"); st.textContent =
    ".pr5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:2px 0 8px}" +
    ".pr5c{display:flex;flex-direction:column;gap:3px;align-items:stretch;text-align:left;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:10px;padding:6px 5px;font:inherit;cursor:pointer;min-width:0}" +
    ".pr5c.on{outline:2px solid var(--acc,#7c9cff)}.pr5c b{font-size:12.5px;white-space:nowrap}.pr5c small{font-size:12.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pr5p{font-size:16px;font-weight:800;white-space:nowrap}.pr5p small{font-size:12.5px;font-weight:600;margin-left:1px}.pr5p.up{color:var(--up)}.pr5p.dn{color:var(--down)}" +
    ".prb{position:relative;height:6px;border-radius:3px;background:rgba(124,156,255,.22);overflow:visible;margin:3px 0}.prb.big{height:10px;margin:8px 0 2px}" +
    ".prb:before{content:'';position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:var(--sub);opacity:.6}" +
    ".prb .pf{position:absolute;top:0;height:100%;border-radius:3px}.prb .pf.u{background:var(--up)}.prb .pf.d{background:var(--down)}" +
    ".prb .pm{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}.prb.big .pm{width:14px;height:14px}" +
    ".pr-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pr-two>div{background:var(--panel2,rgba(255,255,255,.03));border-radius:12px;padding:10px}.pr-two small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pr-two b{display:block;font-size:30px;font-weight:800;line-height:1.15;margin:2px 0}.pr-two b.up{color:var(--up)}.pr-two b.dn{color:var(--down)}.pr-two em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".pr-st{margin-top:10px}.pr-f{margin:12px 0 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer}.pr-f .fchev{transition:transform .15s;font-style:normal}.pr-f.open .fchev{transform:rotate(180deg)}" +
    ".pr-ms{margin-top:8px}.pr-m{padding:9px 2px;border-bottom:1px solid var(--line)}.pr-m:last-of-type{border:0}.pr-m.off{opacity:.6}" +
    ".pr-mh{display:flex;align-items:center;gap:7px;font-size:13.5px}.pr-mh .hm-i{font-size:16px}.pr-mp{margin-left:auto;font-weight:800;font-size:14px}.pr-mp small{font-weight:500;color:var(--sub);margin-left:5px}.pr-mp .up{color:var(--up)}.pr-mp .dn{color:var(--down)}.pr-w{font-size:12.5px}" +
    ".pr-ev{display:block;font-size:12.5px;color:var(--sub);line-height:1.5;margin-top:3px;word-break:keep-all}" +
    ".pr-rc{display:flex;flex-direction:column;gap:4px;font-size:12.5px;margin-top:6px}.pr-rc span{padding:5px 8px;border-radius:8px;background:var(--panel2,rgba(255,255,255,.03))}.pr-rc .up{color:var(--up)}.pr-rc .dn{color:var(--down)}" +
    ".zb{position:relative;height:10px;border-radius:5px;background:rgba(124,156,255,.18);margin:8px 0 2px}.pr5c .zb{height:6px;margin:3px 0}" +
    ".zb .zf{position:absolute;top:0;height:100%;border-radius:5px}.zb .zf.u{background:var(--up)}.zb .zf.d{background:var(--down)}" +
    ".zb .zn{position:absolute;top:-3px;bottom:-3px;width:0;border-left:2px dashed var(--sub)}" +
    ".zb .pm{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}.pr5c .zb .pm{width:9px;height:9px}" +
    ".zl{display:flex;justify-content:space-between;font-size:12.5px;color:var(--sub)}" +
    ".sg-how{font-size:12.5px;line-height:1.55;color:var(--sub);background:var(--panel2,#2a3142);border-radius:10px;padding:7px 10px;margin:-4px 0 12px}.sg-how b{color:var(--text)}" +
    ".pr-gp{font-weight:800}.pr-gp.up{color:var(--up)}.pr-gp.dn{color:var(--down)}" +
    ".pr-anc{font-size:12.5px;line-height:1.5;margin:-2px 0 10px;padding:7px 10px;border-radius:10px;background:var(--panel2,#2a3142);color:var(--sub)}.pr-anc b{color:var(--tx,inherit)}" +
    ".pr-sg{display:flex;align-items:center;gap:10px;margin:0 0 10px;flex-wrap:wrap}.pr-bd{font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--panel2,#2a3142)}" +
    ".pr-bd.s3{background:color-mix(in srgb,var(--up) 22%,transparent)}.pr-bd.s2{background:color-mix(in srgb,#ffb84d 22%,transparent)}" +
    ".pv{display:flex;flex-direction:column;gap:2px}.pvd{display:flex;gap:3px}.pvd i{width:10px;height:10px;border-radius:50%;background:#6b7385}.pvd i.u{background:var(--up)}.pvd i.d{background:var(--down)}.pv small{font-size:12.5px;color:var(--sub)}" +
    ".pt{padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.pt:last-child{border:0}.pt .row{display:flex;justify-content:space-between}" +
    ".ptb{position:relative;height:8px;border-radius:4px;background:rgba(124,156,255,.15);margin:5px 0 3px}.ptb i.u,.ptb i.d{display:block;height:100%;border-radius:4px}.ptb i.u{background:var(--up)}.ptb i.d{background:var(--down)}" +
    ".ptb .ptn{position:absolute;top:-3px;bottom:-3px;width:0;border-left:2px dashed var(--text)}.pt small{font-size:12.5px}" +
    ".ps-r{padding:9px 0;border-bottom:1px solid var(--line)}.ps-r:last-of-type{border:0}.ps-h{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13.5px}.ps-h .hm-i{font-size:16px}" +
    ".ps-v{margin-left:auto;text-align:right;line-height:1.15}.ps-v b{display:block;font-size:15px}.ps-v small{font-size:12.5px;color:var(--sub)}.ps-v .up{color:var(--up)}.ps-v .dn{color:var(--down)}" +
    ".ps-r .fchev{font-style:normal;color:var(--sub);transition:transform .15s}.ps-r.open .fchev{transform:rotate(180deg)}.ps-bar .zb{height:6px;margin:5px 0 3px}.ps-sub{font-size:12.5px;color:var(--sub)}.ps-sub .up{color:var(--up)}.ps-sub .dn{color:var(--down)}" +
    ".ps-gap{text-align:center;color:var(--sub);padding:2px 0;letter-spacing:4px}.ps-all{margin-top:8px}" +
    ".ps-st{margin:8px 0 2px;border-radius:10px;background:var(--panel2,rgba(255,255,255,.03));padding:2px 8px}.ps-t{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none}.ps-t:last-child{border:0}" +
    ".ps-tn{flex:1;min-width:0;overflow:hidden}.ps-tn b{font-size:13px;white-space:nowrap}.ps-tn .tk{margin-left:5px;font-style:normal;font-size:12.5px;color:var(--sub)}.ps-tv{text-align:right;line-height:1.2}.ps-tv b{font-size:13.5px}.ps-tv small{display:block;font-size:12.5px;color:var(--sub)}.ps-tv .up{color:var(--up)}.ps-tv .dn{color:var(--down)}" +
    ".pr-g{display:flex;align-items:center;gap:8px;margin:12px 0 2px;padding-bottom:4px;border-bottom:1px solid var(--line);font-size:13px}.pr-g small{margin-left:auto}.pr-g .up{color:var(--up)}.pr-g .dn{color:var(--down)}" +
    ".pr-eb{display:block;font-size:12.5px;color:var(--sub);opacity:.8;margin-top:2px}.pr-m .zb{height:6px;margin:5px 0 3px}" +
    ".pr-cb{font-size:13px;padding:9px 10px;border-radius:10px;background:var(--panel2,rgba(255,255,255,.04));margin:4px 0 4px}.pr-cb .up{color:var(--up)}.pr-cb .dn{color:var(--down)}" +
    ".sg5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:2px 0 8px}.sg5c{border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:10px;padding:6px 4px 7px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0}" +
    ".sg5c.on{outline:2px solid var(--acc,#7c9cff)}.sg5c small{font-size:12.5px;white-space:nowrap;color:var(--sub)}.sg5c b{font-size:20px;font-weight:800;line-height:1.1}.sg5c em{font-style:normal;font-size:12.5px;font-weight:700}" +
    ".sg5b{position:relative;display:block;width:86%;height:5px;border-radius:3px;margin-top:4px;background:linear-gradient(90deg,#2f6fd0,#6b7385 50%,#e05555)}.sg5b i{position:absolute;top:-2px;width:3px;height:9px;border-radius:2px;background:var(--text);transform:translateX(-50%)}" +
    ".sg-w{display:flex;align-items:center;gap:14px}.sg-n{font-size:40px;font-weight:800;line-height:1}.sg-b{position:relative;height:10px;border-radius:5px;margin:8px 0 2px;background:linear-gradient(90deg,#2f6fd0,#5b8fd8,#6b7385,#d98a7a,#e05555)}" +
    ".sg-b i{position:absolute;top:50%;width:14px;height:14px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}" +
    ".sg-ps{display:flex;flex-direction:column;gap:4px;margin:12px 0 4px}.sg-ps>div{display:flex;align-items:center;gap:8px;font-size:12.5px}.sg-ps small{flex:0 0 46%;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sg-ps b{flex:0 0 26px;text-align:right}" +
    ".pr-tb{width:100%;border-collapse:collapse;font-size:12.5px;margin:4px 0}.pr-tb th{color:var(--sub);font-weight:500;text-align:right;padding:4px 3px;border-bottom:1px solid var(--line)}.pr-tb th:first-child,.pr-tb td:first-child{text-align:left}" +
    ".pr-tb td{text-align:right;padding:5px 3px;border-bottom:1px solid var(--line)}.pr-tb tr.now td{background:color-mix(in srgb,var(--acc,#7c9cff) 14%,transparent);font-weight:700}.pr-tb .up{color:var(--up)}.pr-tb .dn{color:var(--down)}" +
    ".pr-how{margin-top:8px}.pr-hw{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.pr-hw:last-of-type{border:0}.pr-hw small{display:block;color:var(--sub);font-size:12.5px;line-height:1.5;margin-top:2px;word-break:keep-all}";
    document.head.appendChild(st); })();
})();
;
/* ======== flow.js ======== */
/* CH Investing — 🧲 수급: 국내 주식 누가 사고 있나 (외국인·기관 집중 매수) · archive/x/flow_kr.json (flow_kr.yml 하루 3번)
   11/10 사용자 「국내 주식 수급 분석, 외국인·기관 집중 매수 종목들 파악해서 그런 칸을」
   · 시총 상위 300 · 하루/5일/20일 순매수 금액 · 시총 대비 세기 · 연속 일수 · 쌍끌이
   · 사는 신호가 아님 — 10/28 10년 검증(기관 따라 사기 2021년 뒤 손해 · 외국인 약한 플러스)을 화면에 같이 적음 */
(function(){
  var e = V.e;
  var ST = {mk: "A", per: "5", who: "f", side: "buy", sort: "amt"};
  try { var s0 = JSON.parse(localStorage.getItem("flowst") || "{}"); for (var k in s0) if (k in ST) ST[k] = s0[k]; } catch(x) {}
  var D = null;
  function keep(){ try { localStorage.setItem("flowst", JSON.stringify(ST)); } catch(x) {} }
  function won(v){ if (v == null) return "–"; var a = Math.abs(v), sg = v > 0 ? "+" : v < 0 ? "−" : "";
    return sg + (a >= 10000 ? (a / 10000).toFixed(a >= 100000 ? 0 : 1) + "조" : a >= 100 ? Math.round(a).toLocaleString() + "억" : a.toFixed(a >= 10 ? 0 : 1) + "억"); }
  function pct(v, d){ return v == null ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? Number(d.slice(5, 7)) + "/" + Number(d.slice(8, 10)) : ""; }
  function sym(s){ return s.c + (s.m === "P" ? ".KS" : ".KQ"); }
  function uni(){ return D.stocks.filter(function(s){ return ST.mk === "A" || s.m === ST.mk; }); }
  function val(s, who, per){ return s[who + per]; }
  function inten(s, who, per){ var v = val(s, who, per); return v != null && s.mc ? v / s.mc * 100 : null; }
  // 20일 하루 순매수 막대(작게) — 위 빨강 = 산 날 · 아래 파랑 = 판 날
  function spark(a, w, H){
    if (!a || !a.length) return "";
    var m = Math.max.apply(null, a.map(Math.abs)) || 1, g = 1; w = w || 3; H = H || 22;
    return '<svg class="fl-sp" width="' + a.length * (w + g) + '" height="' + H + '" aria-hidden="true">' + a.map(function(v, i){
      var h = Math.max(1, Math.abs(v) / m * (H / 2 - 1));
      return '<rect x="' + i * (w + g) + '" y="' + (v >= 0 ? H / 2 - h : H / 2) + '" width="' + w + '" height="' + h + '" fill="var(--' + (v >= 0 ? "up" : "down") + ')"/>'; }).join("") + '</svg>';
  }
  function chips(key, opts){ return '<div class="fl-ch">' + opts.map(function(o){ return '<button type="button" data-fk="' + key + '" data-fv="' + o[0] + '"' + (ST[key] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join("") + '</div>'; }
  function row(s, i, main, sub, sp, tag){
    return '<button type="button" class="fl-r" data-fop="' + sym(s) + '"><i class="fl-n">' + (i + 1) + '</i><span class="fl-nm"><b>' + e(s.n) + '</b><small>' + (tag ? tag + ' · ' : '') + (s.r5 != null ? '주가 5일 <em class="' + cl(s.r5) + '">' + pct(s.r5) + '</em>' : '') + '</small></span>' +
      (sp ? '<span class="fl-spw">' + sp + '</span>' : '') + '<span class="fl-v">' + main + '<small>' + sub + '</small></span></button>';
  }
  function strk(n){ return n ? Math.abs(n) + "일 연속 " + (n > 0 ? "매수" : "매도") : ""; }

  // ── 시장 전체 ──
  function mktCard(){
    var mk = ST.mk === "Q" ? "KOSDAQ" : "KOSPI", R = (D.mkt || {})[mk] || [];
    if (!R.length || R[0].f == null) return "";
    var r = R[0], f20 = 0, i20 = 0, p20 = 0; R.forEach(function(x){ f20 += x.f || 0; i20 += x.i || 0; p20 += x.p || 0; });
    var U = R[0].f != null && Math.abs(R[0].f) > 1e6 ? 1e8 : 1;   // 원 단위면 억으로
    function b(lab, v, v20){ return '<div class="fl-m"><small>' + lab + '</small><b class="' + cl(v) + '">' + won(v / U) + '</b><em>20일 <i class="' + cl(v20) + '">' + won(v20 / U) + '</i></em></div>'; }
    var fs = 0; for (var i = 0; i < R.length; i++){ if ((R[i].f > 0) === (R[0].f > 0) && R[i].f) fs++; else break; }
    var say = (fs <= 1 ? "외국인 " + (r.f > 0 ? "매수" : "매도") + "로 돌아섬" : "외국인 " + fs + "거래일째 " + (r.f > 0 ? "사는 중" : "파는 중")) + " · 20일 합계 " + won(f20 / U) + ". " +
      (r.f < 0 && r.i > 0 ? "기관이 받고 있어요." : r.f < 0 && r.p > 0 ? "개인이 받고 있어요." : r.f > 0 && r.i > 0 ? "외국인·기관이 같이 사요." : r.f > 0 ? "외국인만 사요." : "외국인·기관 모두 팔아요.");
    return '<section class="card fl-mk"><h3>' + (mk === "KOSPI" ? "코스피" : "코스닥") + ' 전체 <span class="mut">' + md(r.d) + ' 하루 순매수</span></h3>' +
      '<p class="fl-say">' + e(say) + '</p><div class="fl-m3">' + b("외국인", r.f, f20) + b("기관", r.i, i20) + b("개인", r.p, p20) + '</div>' +
      (function(){ var d = r.det || {}, L = [["금융투자", d.FINANCIAL_INVESTOR], ["투신", d.MUTUAL_FUND], ["연기금", d.PENSION_FUND], ["사모", d.PRIVATE_EQUITY_FUND], ["보험", d.INSURANCE_COMPANIES]].filter(function(x){ return x[1] != null; });
        return L.length ? '<p class="fl-det"><b>기관 안쪽</b> ' + L.map(function(x){ return x[0] + ' <i class="' + cl(x[1]) + '">' + won(x[1] / U) + '</i>'; }).join(" · ") + '</p>' : ''; })() +
      '<div class="fl-bars"><small>외국인 20일</small>' + spark(R.map(function(x){ return (x.f || 0) / U; }).reverse(), 9, 44) + '</div></section>';
  }

  // ── 집중 매수·매도 순위 ──
  function rankCard(){
    var who = ST.who, per = ST.per, buy = ST.side === "buy", by = ST.sort;
    var L = uni().filter(function(s){ return val(s, who, per) != null && (by === "amt" || s.mc); });
    L.sort(function(a, b){ var x = by === "amt" ? val(a, who, per) : inten(a, who, per), y = by === "amt" ? val(b, who, per) : inten(b, who, per); return buy ? y - x : x - y; });
    L = L.filter(function(s){ return buy ? val(s, who, per) > 0 : val(s, who, per) < 0; }).slice(0, 10);
    var nm = who === "f" ? "외국인" : "기관";
    return '<section class="card" id="flrank"><h3>' + (who === "f" ? "🌍" : "🏛") + ' ' + nm + ' 집중 ' + (buy ? "매수" : "매도") + ' <span class="mut">' + (per === "1" ? "하루" : per + "일 합계") + ' · ' + md(D.day) + ' 마감</span></h3>' +
      '<div class="fl-cr">' + chips("who", [["f", "외국인"], ["i", "기관"]]) + chips("side", [["buy", "많이 산"], ["sell", "많이 판"]]) + '</div>' +
      '<div class="fl-cr">' + chips("per", [["1", "하루"], ["5", "5일"], ["20", "20일"]]) + chips("sort", [["amt", "금액순"], ["int", "덩치 대비"]]) + '</div>' +
      (L.length ? L.map(function(s, i){
        var v = val(s, who, per), it = inten(s, who, per), sk = s[who + "s"];
        return row(s, i, '<b class="' + cl(v) + '">' + won(v) + '</b>', (it != null ? "시총의 " + Math.abs(it).toFixed(2) + "%" : ""), spark(s["s" + who], 2, 22), sk && Math.abs(sk) >= 3 ? strk(sk) : "");
      }).join("") : '<p class="note">해당 종목이 없어요.</p>') +
      '<p class="fl-ft">「덩치 대비」 = 순매수 금액 ÷ 시가총액 — 작은 회사에 큰돈이 들어온 순서 · 작은 막대 = 최근 20일 하루하루(위 빨강 산 날)</p></section>';
  }

  // ── 🏭 업종별 (11/10 #5) ──
  function secCard(){
    var G = (D.secs || []).filter(function(g){ return g.k >= 3; });
    if (G.length < 4) return "";
    var by = function(g){ return (g.f5 || 0) + (g.i5 || 0); };
    var inn = G.filter(function(g){ return by(g) > 0; }).slice(0, 6), out = G.filter(function(g){ return by(g) < 0; }).sort(function(a, b){ return by(a) - by(b); }).slice(0, 4);
    var mx = Math.max.apply(null, inn.concat(out).map(function(g){ return Math.abs(by(g)); })) || 1;
    function bar(g){ var v = by(g), w = Math.max(4, Math.abs(v) / mx * 100);
      return '<div class="fl-sg"><span class="fl-sgn">' + e(g.ic + " " + g.n) + '<small>' + e((g.top || []).slice(0, 2).join(" · ")) + '</small></span><span class="fl-sgb"><i class="' + (v >= 0 ? "u" : "d") + '" style="width:' + w + '%"></i></span><b class="' + cl(v) + '">' + won(v) + '</b></div>'; }
    return '<section class="card" id="flsec"><h3>🏭 돈이 들어간 업종 <span class="mut">외국인+기관 5일 · 시총 상위 300 안</span></h3>' +
      (inn.length ? '<p class="fl-sgh">들어간 곳</p>' + inn.map(bar).join("") : '') + (out.length ? '<p class="fl-sgh">빠진 곳</p>' + out.map(bar).join("") : '') + '</section>';
  }
  // ── 쌍끌이 ──
  function bothCard(){
    var L = uni().filter(function(s){ return s.f5 > 0 && s.i5 > 0 && s.mc; }).map(function(s){ return {s: s, v: s.f5 + s.i5, it: (s.f5 + s.i5) / s.mc * 100}; })
      .sort(function(a, b){ return b.it - a.it; }).slice(0, 8);
    if (!L.length) return "";
    return '<section class="card"><h3>🤝 외국인·기관이 같이 산 종목 <span class="mut">5일 · 덩치 대비 순</span></h3>' +
      L.map(function(o, i){ return row(o.s, i, '<b class="up">' + won(o.v) + '</b>', "외 " + won(o.s.f5) + " · 기 " + won(o.s.i5), ""); }).join("") + '</section>';
  }
  // ── 연속 ──
  function streakCard(){
    var L = [];
    uni().forEach(function(s){ if (s.fs >= 5) L.push({s: s, n: s.fs, w: "외국인", v: s.f5}); if (s.is >= 5) L.push({s: s, n: s.is, w: "기관", v: s.i5}); });
    L.sort(function(a, b){ return b.n - a.n || b.v - a.v; }); L = L.slice(0, 8);
    if (!L.length) return "";
    return '<section class="card"><h3>🔁 하루도 안 쉬고 사는 중 <span class="mut">5거래일 이상 연속</span></h3>' +
      L.map(function(o, i){ return row(o.s, i, '<b>' + (o.n >= 24 ? "24일+" : o.n + "일째") + '</b>', o.w + " · 5일 " + won(o.v), ""); }).join("") + '</section>';
  }
  // ⭐ 내 관심종목 수급 — 내 종목 얘기라 다시 열 이유가 됨 (관심종목에 국내 종목이 있을 때만)
  function wlCard(){
    var wl = (window.store && store.wl) || {}, codes = {}; for (var k in wl){ var c = String(k).replace(/\D/g, "").slice(0, 6); if (c.length === 6) codes[c] = 1; }
    var L = D.stocks.filter(function(s){ return codes[s.c]; });
    if (!L.length) return "";
    return '<section class="card"><h3>⭐ 내 관심종목 수급 <span class="mut">5일 합계</span></h3>' + L.slice(0, 12).map(function(s, i){
      return row(s, i, '<b class="' + cl(s.f5) + '">외 ' + won(s.f5) + '</b>', '기관 <i class="' + cl(s.i5) + '">' + won(s.i5) + '</i>', spark(s.sf, 2, 22), Math.abs(s.fs) >= 3 ? "외국인 " + strk(s.fs) : ""); }).join("") + '</section>';
  }
  function honest(){
    return '<section class="card fl-hon"><h3>📌 먼저 알고 보세요</h3><p><b>「많이 샀다」가 「오른다」는 아니에요.</b> 2016~2026년 10년을 직접 돌려 봤어요(시총 상위 200 · 20일 순매수 상위 10% · 다음 날 진입).</p>' +
      '<div class="fl-tb"><div><span>기관·연기금이 많이 산 종목</span><b class="dn">2021년 뒤 60일 −2.0%p</b></div><div><span>외국인이 많이 산 종목</span><b>+1.6%p (통계로 확실하진 않음)</b></div></div>' +
      '<p>그래서 이 화면은 <b>사는 신호가 아니라</b> 「요즘 큰돈이 어디로 가나」를 고객과 이야기할 재료예요. 외국인 바구니는 10/27부터 실제 성적을 따로 재고 있고, 의미가 생기면 알려 드려요.</p></section>';
  }
  function copyText(){
    var mk = (D.mkt || {}).KOSPI || [], U = mk[0] && Math.abs(mk[0].f) > 1e6 ? 1e8 : 1;
    function top(who, n){ return D.stocks.filter(function(s){ return s[who + "5"] > 0; }).sort(function(a, b){ return b[who + "5"] - a[who + "5"]; }).slice(0, n).map(function(s){ return s.n + "(" + won(s[who + "5"]) + ")"; }).join(", "); }
    return "[" + md(D.day) + " 국내 수급]\n" + (mk[0] && mk[0].f != null ? "코스피 하루: 외국인 " + won(mk[0].f / U) + " · 기관 " + won(mk[0].i / U) + " · 개인 " + won(mk[0].p / U) + "\n" : "") +
      "외국인 5일 순매수 상위: " + top("f", 5) + "\n기관 5일 순매수 상위: " + top("i", 5) + "\n※ 참고용 자료이며 매수 권유가 아닙니다.";
  }
  function draw(){
    var el = document.getElementById("flbody"); if (!el) return;
    if (!D || !D.stocks || !D.stocks.length){ el.innerHTML = '<section class="card"><p class="note" style="margin:0">수급 자료가 아직 안 올라왔어요 — 장 마감 뒤 저녁·다음 날 아침에 채워져요.</p></section>'; return; }
    el.innerHTML = '<div class="fl-top">' + chips("mk", [["A", "전체"], ["P", "코스피"], ["Q", "코스닥"]]) + '<button type="button" id="flcopy">📋 한 줄 복사</button></div>' +
      mktCard() + wlCard() + secCard() + rankCard() + bothCard() + streakCard() + honest() +
      '<p class="fl-src">시총 상위 ' + D.n + '종목 · ' + md(D.day) + ' 마감 기준(종목별 자료는 그날 밤에 나와요) · 금액은 순매수 수량 × 종가로 어림 · 자료: 다음 금융</p>';
    [].forEach.call(el.querySelectorAll("[data-fk]"), function(b){ b.onclick = function(){ var y = b.getBoundingClientRect().top; ST[b.dataset.fk] = b.dataset.fv; keep(); draw();
      var n = document.querySelector('[data-fk="' + b.dataset.fk + '"][data-fv="' + b.dataset.fv + '"]'); if (n) window.scrollBy(0, n.getBoundingClientRect().top - y); }; });
    [].forEach.call(el.querySelectorAll("[data-fop]"), function(b){ b.onclick = function(){ if (window.openOP) openOP(b.dataset.fop); }; });
    var c = document.getElementById("flcopy");
    if (c) c.onclick = function(){ var t = copyText(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ c.textContent = "✅ 복사됨 — 카톡에 붙여 넣기"; }, function(){ window.prompt("길게 눌러 복사하세요", t); }); };
  }
  // ── 🧲 11/10 #3 수급 한 줄 (홈·오늘 한 장·고객 한 장) · #4 종목리포트 수급 칸 ──
  var LP = null;
  function loadF(){ if (D && D.stocks) return Promise.resolve(D); if (LP) return LP;
    LP = getJSON("archive/x/flow_kr.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ D = D || j; window.__flowJ = j; return j; }).catch(function(){ LP = null; return null; }); return LP; }
  function mline(J){
    var R = ((J && J.mkt) || {}).KOSPI || []; if (!R.length || R[0].f == null) return "";
    var r = R[0], U = Math.abs(r.f) > 1e6 ? 1e8 : 1, fs = 0; for (var i = 0; i < R.length; i++){ if (R[i].f && (R[i].f > 0) === (r.f > 0)) fs++; else break; }
    return "코스피 " + md(r.d) + " 외국인 " + won(r.f / U) + (fs >= 2 ? "(" + fs + "일째)" : "") + " · 기관 " + won(r.i / U) + " · 개인 " + won(r.p / U);
  }
  window.__flowLine = function(){ return loadF().then(function(J){ return mline(J); }); };
  function stkHtml(c){
    var s = (D.stocks || []).filter(function(x){ return x.c === c; })[0]; if (!s) return "";
    var rk = D.stocks.slice().sort(function(a, b){ return (b.f5 || 0) - (a.f5 || 0); }).indexOf(s) + 1;
    function lane(lab, a, v5, v20, sk){ return '<div class="fs-l"><span class="fs-lb">' + lab + '</span>' + spark(a, 4, 30) + '<span class="fs-v"><b class="' + cl(v5) + '">5일 ' + won(v5) + '</b><small>20일 ' + won(v20) + (Math.abs(sk) >= 3 ? ' · ' + strk(sk) : '') + '</small></span></div>'; }
    return '<section class="card fs-c no-clp" data-cz="done" data-xc="1"><h3>🧲 누가 사고 있나 <span class="mut">' + md(D.day) + ' 마감 · 최근 20일</span></h3>' +
      lane("🌍 외국인", s.sf, s.f5, s.f20, s.fs || 0) + lane("🏛 기관", s.si, s.i5, s.i20, s.is || 0) +
      '<p class="fs-n">외국인 보유 ' + (s.fr != null ? s.fr.toFixed(1) + "%" : "–") + (s.fr20 != null ? ' (20일 ' + (s.fr20 >= 0 ? "+" : "−") + Math.abs(s.fr20).toFixed(2) + '%p)' : '') + ' · 외국인 5일 순매수 300종목 중 ' + rk + '위 · <a data-goto="flow">수급 전체 ›</a></p></section>';
  }
  function fillAll(){
    var L = document.querySelectorAll("[data-flow]:not([data-flok]), [data-flowstk]:not([data-flok])"); if (!L.length) return;
    loadF().then(function(J){ if (!J) return;
      [].forEach.call(document.querySelectorAll("[data-flow]:not([data-flok])"), function(x){ var t = mline(J); x.setAttribute("data-flok", "1"); if (!t) return;
        x.innerHTML = '<button type="button" class="fl-line" data-goto="flow">🧲 ' + e(t) + ' <i>›</i></button>'; });
      [].forEach.call(document.querySelectorAll("[data-flowstk]:not([data-flok])"), function(x){ x.setAttribute("data-flok", "1"); var m = /^(\d{6})\.K[SQ]$/.exec(x.getAttribute("data-flowstk") || ""); x.innerHTML = m ? stkHtml(m[1]) : ""; });
    });
  }
  var FT = 0; new MutationObserver(function(){ clearTimeout(FT); FT = setTimeout(fillAll, 80); }).observe(document.documentElement, {childList: true, subtree: true});
  (window.requestIdleCallback || function(f){ setTimeout(f, 3000); })(function(){ setTimeout(loadF, 2500); });
  window.flowView = function(){ return '<div id="flbody"><div class="loading">수급 자료 불러오는 중…</div></div>'; };
  window.flowInit = function(){
    D = null; LP = null; loadF().then(function(j){ D = j; draw(); });
  };
  (function(){ var st = document.createElement("style"); st.textContent =
    ".fl-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px}.fl-top .fl-ch{margin:0}" +
    "#flcopy{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:8px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}" +
    ".fl-cr{display:flex;justify-content:space-between;gap:8px;margin:0 0 8px}.fl-cr .fl-ch{margin:0;gap:0;flex-wrap:nowrap;border:1px solid var(--line);border-radius:999px;overflow:hidden}.fl-cr .fl-ch button{border:0;border-radius:0;padding:7px 11px}" +
    ".fl-ch{display:flex;gap:6px;margin:0 0 8px;flex-wrap:wrap}.fl-ch button{border:1px solid var(--line);background:var(--panel2,transparent);color:var(--sub);border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;cursor:pointer;min-height:34px}" +
    ".fl-ch button.on{background:var(--text);color:var(--panel);border-color:var(--text);font-weight:700}" +
    ".fl-say{font-size:15px;font-weight:700;line-height:1.5;margin:2px 0 12px;word-break:keep-all}" +
    ".fl-m3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fl-m{background:var(--panel2,rgba(127,127,127,.08));border-radius:12px;padding:10px 8px;text-align:center;min-width:0}" +
    ".fl-m small{display:block;font-size:12.5px;color:var(--sub)}.fl-m b{display:block;font-size:19px;font-weight:800;line-height:1.3;white-space:nowrap}.fl-m em{font-style:normal;font-size:12px;color:var(--sub);white-space:nowrap}.fl-m i{font-style:normal}" +
    ".fl-det{font-size:12.5px;line-height:1.7;color:var(--sub);margin:10px 0 0;word-break:keep-all}.fl-det b{color:var(--text)}.fl-det i{font-style:normal;font-weight:700}" +
    ".fl-bars{display:flex;align-items:center;justify-content:space-between;margin-top:12px}.fl-bars small{color:var(--sub);font-size:12.5px}" +
    ".fl-r{display:flex;align-items:center;gap:9px;width:100%;padding:10px 0;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);font:inherit;text-align:left;cursor:pointer}.fl-r:last-of-type{border-bottom:0}" +
    ".fl-n{flex:0 0 18px;font-style:normal;font-size:13px;color:var(--sub);text-align:center}.fl-nm{flex:1 1 110px;min-width:110px}.fl-nm b{display:block;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fl-nm small{display:block;font-size:12px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fl-nm em{font-style:normal}" +
    ".fl-spw{flex:0 0 auto;line-height:0}.fl-v{flex:0 0 auto;text-align:right;line-height:1.25}.fl-v b{display:block;font-size:15px;font-weight:800;white-space:nowrap}.fl-v small{display:block;font-size:12px;color:var(--sub);white-space:nowrap}" +
    "#flbody .up{color:var(--up)}#flbody .dn{color:var(--down)}.fl-ft,.fl-src{font-size:12px;color:var(--sub);line-height:1.5;margin:10px 0 0;word-break:keep-all}.fl-src{text-align:center;margin:4px 8px 16px}" +
    ".fl-hon p{font-size:13.5px;line-height:1.6;margin:0 0 8px;word-break:keep-all;color:var(--sub)}.fl-hon p b{color:var(--text)}.fl-tb{margin:0 0 10px}.fl-tb div{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px}.fl-tb div:last-child{border:0}.fl-tb b{text-align:right;white-space:nowrap}" +
    ".fl-sgh{font-size:12px;color:var(--sub);margin:10px 0 2px;font-weight:700}.fl-sg{display:flex;align-items:center;gap:8px;padding:6px 0}.fl-sgn{flex:0 0 42%;min-width:0;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fl-sgn small{display:block;font-size:11.5px;font-weight:400;color:var(--sub);overflow:hidden;text-overflow:ellipsis}.fl-sgb{flex:1;height:10px;border-radius:5px;background:var(--panel2,rgba(127,127,127,.1));overflow:hidden}.fl-sgb i{display:block;height:100%;border-radius:5px}.fl-sgb i.u{background:var(--up)}.fl-sgb i.d{background:var(--down)}.fl-sg b{flex:0 0 auto;font-size:13px;min-width:62px;text-align:right}" +
    ".fl-line{display:block;width:100%;text-align:left;border:0;border-radius:12px;background:var(--panel2,rgba(127,127,127,.08));color:var(--text);font:inherit;font-size:13px;font-weight:600;padding:9px 11px;margin:8px 0 0;cursor:pointer;line-height:1.45;word-break:keep-all}.fl-line i{font-style:normal;color:var(--sub)}" +
    ".fs-c h3{margin-bottom:6px}.fs-l{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}.fs-lb{flex:0 0 64px;font-size:13px;font-weight:700}.fs-v{margin-left:auto;text-align:right;line-height:1.3}.fs-v b{display:block;font-size:14px}.fs-v small{font-size:12px;color:var(--sub)}" +
    ".fs-n{font-size:12.5px;color:var(--sub);margin:8px 0 0;line-height:1.5}.fs-n a{color:var(--acc,#7c9cff);cursor:pointer}#main .fs-c .up{color:var(--up)}#main .fs-c .dn{color:var(--down)}" +
    ".fl-v small i{font-style:normal;font-weight:700}@media(max-width:360px){.fl-spw{display:none}}";
    document.head.appendChild(st); })();
})();
;
/* ======== divc.js ======== */
/* CH Investing — 💰 배당비교 (포트 묶음 · 포트·성적표 옆)
   11/10 사용자 「비슷한 상품의 배당 비교 — 몇 개 비교할지 묻고 → 그만큼 칸 → 종목·ETF 넣고 비교 →
                 뭐는 얼마 뭐는 얼마 · 퍼센트와 백만원 기준 얼마 · 그림으로 보기 편하게 · 언제 배당 주는지도」
   자료: 배당률·가격 = opdata(d/ 주식 · x/ ETF · p/ 가격 · p/fx 환율) · 배당 기록 = archive/x/dv/<샤드>.json (div_cal.yml 주 1회 + 매달 1·16일)
   계산은 휴대폰 안에서 — 주기(월·분기·반기·연)·배당 달·다음 배당 예상·최근 1년 배당률·100만원 기준 금액 */
(function(){
  var e = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var BASE = 1000000, DAY = 864e5;
  var COL = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9", "#2bb3c0", "#8a8f99"];
  var ST = {n: 0, pick: [], done: false};
  try { var s0 = JSON.parse(localStorage.getItem("divc") || "null"); if (s0 && s0.pick) ST = {n: s0.n || s0.pick.length, pick: s0.pick, done: false}; } catch(x) {}
  function keep(){ try { localStorage.setItem("divc", JSON.stringify({n: ST.n, pick: ST.pick})); } catch(x) {} }
  var DV = {};   // 샤드 → 배당 기록

  function won(v){ return v == null || !isFinite(v) ? "–" : Math.round(v).toLocaleString("ko-KR") + "원"; }
  function wonS(v){ if (v == null || !isFinite(v)) return "–"; return (Math.round(v / 10) * 10).toLocaleString("ko-KR") + "원"; }
  function pc(v, d){ return v == null || !isFinite(v) ? "–" : v.toFixed(d == null ? 2 : d) + "%"; }
  function sg(v){ return v == null || !isFinite(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }
  function md(d){ return (d.getMonth() + 1) + "/" + d.getDate(); }
  function ymd(d){ return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function pd(s){ var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtPx(v, c){ if (v == null) return "–"; if (c === "KRW") return Math.round(v).toLocaleString("ko-KR") + "원";
    var sym = {USD: "$", JPY: "¥", HKD: "HK$", CNY: "¥"}[c] || ""; return sym + (v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(2)) + (sym ? "" : " " + c); }
  function idxRow(sym){ return (window.OPIDX || []).filter(function(x){ return x.sym === sym; })[0]; }
  function nmOf(r){ return r ? r.name : ""; }

  // ── 입금 예상(대략): 배당락 → 실제 돈 들어오는 날 ──
  function payOf(ex, mkt, etf, fq){
    var d = new Date(ex.getTime());
    if (mkt === "US") return new Date(d.getTime() + 10 * DAY);
    if (mkt === "KR"){
      if (etf) return new Date(d.getTime() + 5 * DAY);                                   // 월말 기준 → 다음 달 초
      if (d.getMonth() === 11 || fq.n === 1) return new Date(d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear(), 3, 20);   // 결산 배당 → 4월
      return new Date(d.getTime() + 45 * DAY);                                           // 분기·반기 → 한 달 반쯤 뒤
    }
    if (mkt === "JP") return new Date(d.getTime() + 80 * DAY);
    return new Date(d.getTime() + 30 * DAY);
  }
  function freqOf(h){
    if (h.length < 2) return {k: "연 1회", n: 1, g: 365};
    var L = h.slice(-9), gs = [];
    for (var i = 1; i < L.length; i++) gs.push((pd(L[i][0]) - pd(L[i - 1][0])) / DAY);
    gs.sort(function(a, b){ return a - b; }); var m = gs[Math.floor(gs.length / 2)];
    return m <= 45 ? {k: "월배당", n: 12, g: m} : m <= 125 ? {k: "분기배당", n: 4, g: m} : m <= 250 ? {k: "반기배당", n: 2, g: m} : {k: "연 1회", n: 1, g: m};
  }

  // ── 한 종목 자료 모으기 ──
  function load(sym){
    var r = idxRow(sym), sh = opShard(sym), etf = !!(r && r.etf);
    var det = getJSON(OPD + (etf ? "x/" : "d/") + opFile(sym) + ".json").catch(function(){ return null; });
    var px = (OPP[sh] ? Promise.resolve(OPP[sh]) : getJSON(OPD + "p/" + sh + ".json").then(function(j){ OPP[sh] = j; return j; }).catch(function(){ return {}; }));
    var dv = DV[sh] ? Promise.resolve(DV[sh]) : getJSON("archive/x/dv/" + sh + ".json?d=" + new Date().toISOString().slice(0, 10)).then(function(j){ DV[sh] = j; return j; }).catch(function(){ return null; });
    return Promise.all([det, px, dv]).then(function(z){
      var d = z[0] || {}, p = (z[1] || {})[sym], dvs = z[2], rec = dvs ? dvs[sym] : null;
      var cur = d.currency || d.cur || (r && r.mkt === "KR" ? "KRW" : "USD");
      var price = p ? p[1] : (d.price != null ? d.price : null);
      var y0 = etf ? (d.div_yield != null ? +d.div_yield : null) : (d.dividend_yield != null ? d.dividend_yield * 100 : null);
      var o = {sym: sym, r: r, etf: etf, mkt: r ? r.mkt : "", name: nmOf(r) || d.name || sym, cur: cur, price: price, y0: y0, has: !!rec, h: rec && rec.h ? rec.h.slice().sort(function(a, b){ return a[0] < b[0] ? -1 : 1; }) : []};
      o.r1y = p && p[6] && p[6][0] ? (p[1] / p[6][0] - 1) * 100 : null;
      an(o);
      return o;
    });
  }
  function an(o){
    var now = new Date(), h = o.h;
    o.y = o.y0; o.src = "data";
    if (h.length){
      var fq = freqOf(h); o.fq = fq;
      var last = pd(h[h.length - 1][0]);
      o.stale = (now - last) / DAY > fq.g * 1.8 + 45;                       // 한동안 안 줌 → 중단?
      var N = h.slice(-fq.n), P = h.slice(-2 * fq.n, -fq.n);
      var sum = N.reduce(function(a, x){ return a + x[1]; }, 0), psum = P.length === fq.n ? P.reduce(function(a, x){ return a + x[1]; }, 0) : null;
      o.ps = sum;                                                            // 1주당 1년 배당 (현지 돈)
      o.gr = psum ? (sum / psum - 1) * 100 : null;                           // 1년 전보다 배당
      var am = N.map(function(x){ return x[1]; }).sort(function(a, b){ return a - b; }), mid = am[Math.floor(am.length / 2)];
      o.spec = fq.n >= 2 && am[am.length - 1] > mid * 2.5;                  // 특별배당 섞임
      var yy = o.price ? sum / o.price * 100 : null;
      if (yy != null && yy > 0 && yy < 40 && !o.stale){ o.y = yy; o.src = "hist"; }
      else if (o.stale) o.y = 0;
      o.lastEx = last; o.lastAmt = h[h.length - 1][1];
      // 다음 배당락 예상
      var nx = new Date(last.getTime()); while (nx < now) nx = new Date(nx.getTime() + fq.g * DAY);
      o.next = o.stale ? null : nx; o.nextPay = o.next ? payOf(o.next, o.mkt, o.etf, fq) : null;
      // 배당 받는 달(배당락) · 입금 달(대략)
      var exM = {}, payM = {}; N.forEach(function(x){ var dd = pd(x[0]); exM[dd.getMonth() + 1] = 1; payM[payOf(dd, o.mkt, o.etf, fq).getMonth() + 1] = 1; });
      o.exM = Object.keys(exM).map(Number).sort(function(a, b){ return a - b; });
      o.payM = Object.keys(payM).map(Number).sort(function(a, b){ return a - b; });
      // 앞으로 12달 100만원 기준 입금 (지난 1년 일정 그대로 1년 밀어서)
      var y12 = o.y || 0, ann = BASE * y12 / 100, mo = new Array(12).fill(0), m0 = new Date(now.getFullYear(), now.getMonth(), 1);
      if (sum > 0 && !o.stale) N.forEach(function(x){
        var ex = pd(x[0]); while (payOf(ex, o.mkt, o.etf, fq) < m0) ex = new Date(ex.getFullYear() + 1, ex.getMonth(), ex.getDate());
        var pdt = payOf(ex, o.mkt, o.etf, fq), k = (pdt.getFullYear() - m0.getFullYear()) * 12 + pdt.getMonth() - m0.getMonth();
        if (k >= 0 && k < 12) mo[k] += ann * x[1] / sum;
      });
      o.mo = mo; o.spark = h.slice(-12);
      // 다음 배당락 = 지난 1년 일정을 1년 밀어 본 것 중 오늘 뒤 가장 가까운 날 (달력 막대와 같은 기준)
      if (!o.stale){ var cand = N.map(function(x){ var ex = pd(x[0]); while (ex < now) ex = new Date(ex.getFullYear() + 1, ex.getMonth(), ex.getDate()); return ex; })
        .filter(function(d){ return d - last > 20 * DAY; }).sort(function(a, b){ return a - b; })[0];
        if (cand && cand < o.next) { o.next = cand; o.nextPay = payOf(cand, o.mkt, o.etf, fq); } }
    }
    o.ann = o.y != null ? BASE * o.y / 100 : null;                         // 100만원 → 1년 (세전)
    o.per = o.ann != null && o.fq ? o.ann / o.fq.n : null;                  // 1회
    o.tax = o.mkt === "KR" ? 15.4 : o.mkt === "US" ? 15 : null;
    o.net = o.ann != null && o.tax != null ? o.ann * (1 - o.tax / 100) : null;
    o.tot = o.r1y != null && o.y != null ? o.r1y + o.y : null;
  }

  // ── 화면 ──
  function view(){ return '<div id="dvbody"></div>'; }
  function draw(){
    var b = document.getElementById("dvbody"); if (!b) return;
    if (!ST.n){ b.innerHTML = stepN(); bind(); return; }
    b.innerHTML = stepN(true) + slots() + '<div id="dvres"></div>';
    bind();
    if (ST.done) run();
  }
  function stepN(small){
    var opts = [2, 3, 4, 5, 6, 8];
    return '<section class="card dv-ask' + (small ? ' sm' : '') + '"><h3>' + (small ? '몇 개 비교' : '① 몇 개를 비교할까요?') + '</h3>' +
      (small ? '' : '<p class="dv-p">종목이나 ETF를 고를 칸 수예요. 비슷한 상품끼리 넣으면 배당을 한눈에 비교해 드려요.</p>') +
      '<div class="dv-ns">' + opts.map(function(n){ return '<button type="button" data-dvn="' + n + '"' + (ST.n === n ? ' class="on"' : '') + '>' + n + '개</button>'; }).join("") + '</div>' +
      (small ? '' : '<p class="dv-sub">바로 해 보기</p><div class="dv-ex">' + PRE.map(function(p, i){ return '<button type="button" data-dvpre="' + i + '">' + e(p[0]) + '<small>' + e(p[1].join(" · ")) + '</small></button>'; }).join("") + '</div>') +
      '</section>';
  }
  var PRE = [["🇺🇸 미국 배당 ETF", ["SCHD", "JEPI", "TIGER 미국배당다우존스"]],
             ["🇰🇷 국내 배당주", ["KB금융", "하나금융지주", "SK텔레콤", "KT&G"]],
             ["💵 월배당 커버드콜", ["JEPI", "JEPQ", "QYLD"]]];
  function slots(){
    var full = ST.pick.filter(Boolean).length;
    return '<section class="card dv-sl"><h3>② 비교할 종목·ETF 넣기 <span class="mut">' + full + ' / ' + ST.n + '</span></h3>' +
      Array.apply(null, {length: ST.n}).map(function(_, i){ var s = ST.pick[i], r = s && idxRow(s);
        return '<div class="dv-slot" data-i="' + i + '"><i style="background:' + COL[i] + '">' + (i + 1) + '</i>' +
          (s ? '<div class="dv-got"><b>' + (V.FLAGS[r && r.mkt] || "") + ' ' + e(r ? r.name : s) + (r && r.etf ? ' <span class="etfb">ETF</span>' : '') + '</b><small>' + e(V.cd(s)) + '</small></div><button type="button" class="dv-x" data-dvx="' + i + '" aria-label="지우기">✕</button>'
             : '<div class="dv-in"><input type="text" data-dvq="' + i + '" placeholder="종목·ETF 이름이나 코드" autocomplete="off" enterkeyhint="search" aria-label="' + (i + 1) + '번째 종목"><div class="sug dv-sug" id="dvsug' + i + '"></div></div>') + '</div>'; }).join("") +
      '<button type="button" id="dvgo" class="dv-go"' + (full >= 2 ? '' : ' disabled') + '>' + (full >= 2 ? '💰 ' + full + '개 배당 비교하기' : '두 개 이상 넣으면 비교할 수 있어요') + '</button></section>';
  }
  function bind(){
    var b = document.getElementById("dvbody"); if (!b) return;
    [].forEach.call(b.querySelectorAll("[data-dvn]"), function(x){ x.onclick = function(){ var n = +x.dataset.dvn; ST.n = n; ST.pick = ST.pick.slice(0, n); ST.done = false; keep(); draw();
      var f = document.querySelector("[data-dvq]"); if (f) setTimeout(function(){ f.focus(); f.scrollIntoView({block: "center", behavior: "smooth"}); }, 50); }; });
    [].forEach.call(b.querySelectorAll("[data-dvpre]"), function(x){ x.onclick = function(){ var P = PRE[+x.dataset.dvpre][1];
      opLoadIdx().then(function(){ var L = P.map(function(q){ var r = opSearch(q)[0]; return r ? r.sym : null; }).filter(Boolean);
        ST.n = L.length; ST.pick = L; ST.done = true; keep(); draw(); }); }; });
    [].forEach.call(b.querySelectorAll("[data-dvx]"), function(x){ x.onclick = function(){ ST.pick[+x.dataset.dvx] = null; ST.done = false; keep(); draw();
      var f = document.querySelector('[data-dvq="' + x.dataset.dvx + '"]'); if (f) f.focus(); }; });
    [].forEach.call(b.querySelectorAll("[data-dvq]"), function(q){
      var i = +q.dataset.dvq, box = document.getElementById("dvsug" + i);
      var pick = function(sym){ ST.pick[i] = sym; ST.done = false; keep(); draw();
        var nx = document.querySelector("[data-dvq]"); if (nx) setTimeout(function(){ nx.focus(); }, 30); else { var g = document.getElementById("dvgo"); if (g) g.scrollIntoView({block: "center", behavior: "smooth"}); } };
      q.oninput = function(){ opLoadIdx().then(function(){
        var all = opSearch(q.value, 40).filter(function(r){ return ST.pick.indexOf(r.sym) < 0; }), res = all.slice(0, 30);
        box.innerHTML = res.map(function(r){ return '<button type="button" data-s="' + e(r.sym) + '">' + (V.FLAGS[r.mkt] || "") + ' <b>' + e(r.name) + '</b>' + (r.etf ? '<span class="etfb">ETF</span>' : '') + '<small>' + e(V.cd(r.sym)) + '</small></button>'; }).join("") + (res.length >= 8 ? '<p class="dv-more">' + res.length + (all.length > 30 ? '개+' : '개') + ' 찾음 · 위아래로 넘겨 보세요' + (all.length > 30 ? ' (더 자세히 쳐 보세요)' : '') + '</p>' : '');
        [].forEach.call(box.children, function(x){ x.onclick = function(){ pick(x.dataset.s); }; }); }); };
      q.onkeydown = function(ev){ if (ev.key === "Enter"){ opLoadIdx().then(function(){ var r = opSearch(q.value).filter(function(r){ return ST.pick.indexOf(r.sym) < 0; })[0]; if (r) pick(r.sym); }); } };
    });
    var g = document.getElementById("dvgo"); if (g) g.onclick = function(){ ST.done = true; run(); };
  }

  function run(){
    var out = document.getElementById("dvres"); if (!out) return;
    var L = ST.pick.filter(Boolean); if (L.length < 2) return;
    out.innerHTML = '<div class="loading">배당 자료 모으는 중…</div>';
    opLoadIdx().then(function(){ return Promise.all(L.map(load)); }).then(function(R){
      R.forEach(function(o, i){ o.c = COL[ST.pick.indexOf(o.sym) >= 0 ? ST.pick.indexOf(o.sym) : i]; });
      LAST = R;
      out.innerHTML = head(R) + bars(R) + cal(R) + table(R) + details(R) + sendCard() + note(R);
      bindSend();
      [].forEach.call(out.querySelectorAll("[data-dvop]"), function(x){ x.onclick = function(){ if (window.openOP) openOP(x.dataset.dvop); }; });
      setTimeout(function(){ var h = document.getElementById("dvhead"); if (h) h.scrollIntoView({behavior: "smooth", block: "start"}); }, 60);
    }).catch(function(){ out.innerHTML = '<div class="empty">자료를 못 불러왔어요. 잠시 뒤 다시 눌러 주세요.</div>'; });
  }
  // 짧은 이름: 한글 이름은 그대로, 영어 이름(미국·해외 ETF 등)은 티커 — 칸이 좁은 그림·표용
  function lab(o){ return /[가-힣]/.test(o.name) ? o.name : V.cd(o.sym); }
  function nm(o, short){ var n = short ? lab(o) : o.name; if (short && n.length > 12) n = n.slice(0, 11) + "…"; return e(n); }
  function tk(o){ return '<em class="tk">' + e(V.cd(o.sym)) + '</em>'; }
  function sub2(o){ var t = lab(o) === V.cd(o.sym) ? o.name : V.cd(o.sym); return '<em class="tk">' + e(t) + '</em>'; }   // 이름이 티커면 아래엔 영어 이름

  // ① 한 줄 결론
  function head(R){
    var ok = R.filter(function(o){ return o.y != null && o.y > 0; }).sort(function(a, b){ return b.y - a.y; });
    var best = ok[0], low = ok[ok.length - 1], live = R.filter(function(o){ return o.fq && !o.stale; }), mxn = Math.max.apply(null, live.map(function(o){ return o.fq.n; }).concat([0])), often = live.filter(function(o){ return o.fq.n === mxn; });
    var nxt = R.filter(function(o){ return o.nextPay; }).sort(function(a, b){ return a.nextPay - b.nextPay; })[0];
    var t = best ? '<p class="dv-big">🥇 <span style="color:' + best.c + '">' + nm(best) + '</span> ' + tk(best) + '</p>' +
      '<p class="dv-say">배당 가장 많음 — 100만원 넣으면 1년에 <b>' + won(best.ann) + '</b> (배당률 ' + pc(best.y) + ')' + (low && low !== best ? ' · ' + e(lab(low)) + '보다 <b>' + won(best.ann - low.ann) + '</b> 더' : '') + '</p>' : '<p class="dv-big">배당 자료가 없어요</p>';
    var chips = [];
    if (often.length && often.length < R.length) chips.push("📅 가장 자주(" + often[0].fq.k + "): " + often.map(lab).join(" · "));
    else if (often.length) chips.push("📅 모두 " + often[0].fq.k);
    if (nxt) chips.push("⏭ 다음 입금: " + lab(nxt) + " " + md(nxt.nextPay) + "쯤");
    var gro = R.filter(function(o){ return o.gr != null && !o.spec; }).sort(function(a, b){ return b.gr - a.gr; })[0];
    if (gro && gro.gr > 0) chips.push("🌱 1년 전보다 배당 가장 많이 늘림: " + lab(gro) + " " + sg(gro.gr));
    return '<section class="card dv-hd" id="dvhead"><h3>💰 한눈에 <span class="mut">100만원 기준 · 세전</span></h3>' + t +
      (chips.length ? '<div class="dv-chips">' + chips.map(function(c){ return '<span>' + e(c) + '</span>'; }).join("") + '</div>' : '') + '</section>';
  }
  // ② 막대: 100만원 → 1년 배당
  function bars(R){
    var L = R.slice().sort(function(a, b){ return (b.y || 0) - (a.y || 0); }), mx = Math.max.apply(null, L.map(function(o){ return o.ann || 0; })) || 1;
    return '<section class="card" data-xc="1"><h3>📊 100만원 넣으면 1년에 받는 배당</h3>' + L.map(function(o){
      var w = o.ann ? Math.max(2, o.ann / mx * 100) : 0;
      return '<div class="dv-bar" data-dvop="' + e(o.sym) + '"><div class="dv-bl"><b>' + nm(o, 1) + '</b>' + sub2(o) + '</div>' +
        '<div class="dv-bt"><div class="dv-bf" style="width:' + w + '%;background:' + o.c + '"></div></div>' +
        '<div class="dv-bv"><b>' + (o.ann ? wonS(o.ann) : '없음') + '</b><small>' + (o.y ? pc(o.y) : (o.stale ? '최근 중단' : '–')) + '</small></div></div>'; }).join("") +
      '<p class="dv-ft">세후(국내 15.4% · 미국 15%): ' + L.filter(function(o){ return o.net; }).map(function(o){ return e(lab(o)) + ' ' + wonS(o.net); }).join(" · ") + '</p></section>';
  }
  // ③ 달력: 앞으로 12달, 언제 얼마 들어오나
  function cal(R){
    var L = R.filter(function(o){ return o.mo; }); if (!L.length) return '';
    var now = new Date(), ms = []; for (var i = 0; i < 12; i++){ var d = new Date(now.getFullYear(), now.getMonth() + i, 1); ms.push(d.getMonth() + 1); }
    var mx = Math.max.apply(null, L.map(function(o){ return Math.max.apply(null, o.mo); })) || 1;
    var W = 340, lw = 0, cw = W / 12, H = 34;
    var rows = L.map(function(o){
      var bars = o.mo.map(function(v, k){ if (!v) return '<rect x="' + (k * cw + cw / 2 - 1.5) + '" y="' + (H - 3) + '" width="3" height="3" rx="1.5" fill="var(--line)"/>';
        var h = Math.max(4, v / mx * (H - 4)); return '<rect x="' + (k * cw + 3) + '" y="' + (H - h) + '" width="' + (cw - 6) + '" height="' + h + '" rx="3" fill="' + o.c + '"/>'; }).join("");
      return '<div class="dv-cr"><div class="dv-cn"><i style="background:' + o.c + '"></i><b>' + nm(o, 1) + '</b><span>' + (o.fq ? o.fq.k : '') + (o.nextPay ? ' · 다음 ' + md(o.nextPay) + '쯤' : '') + '</span></div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dv-cs" preserveAspectRatio="none" aria-hidden="true">' + bars + '</svg></div>';
    }).join("");
    var axis = '<div class="dv-ax">' + ms.map(function(m, k){ return '<span' + (k === 0 ? ' class="now"' : (m === 1 ? ' class="ny"' : '')) + '>' + m + '</span>'; }).join("") + '</div>';
    return '<section class="card" data-xc="1"><h3>📅 언제 들어오나 <span class="mut">앞으로 12달 · 100만원 기준 · 입금 예상</span></h3>' + axis + rows +
      '<p class="dv-ft">막대가 클수록 그 달에 많이 들어와요. 지난 1년 배당 일정 그대로 간다고 본 예상이에요 (입금일은 대략).</p></section>';
  }
  // ④ 비교 표
  function table(R){
    function best(f, hi){ var v = R.map(f).filter(function(x){ return x != null && isFinite(x); }); if (v.length < 2) return null; return hi ? Math.max.apply(null, v) : Math.min.apply(null, v); }
    var rows = [
      ["배당률", function(o){ return o.y; }, function(v){ return pc(v); }, 1],
      ["100만원 → 1년", function(o){ return o.ann; }, function(v){ return wonS(v); }, 1],
      ["1번 받을 때", function(o){ return o.per; }, function(v){ return wonS(v); }, 0],
      ["세후 1년", function(o){ return o.net; }, function(v){ return wonS(v); }, 1],
      ["주는 횟수", function(o){ return o.fq && !o.stale ? o.fq.n : null; }, function(v, o){ return o.fq ? (o.stale ? "중단?" : o.fq.k) : "–"; }, 1],
      ["배당락 달", null, function(v, o){ return o.exM && !o.stale ? (o.exM.length >= 12 ? "매달" : o.exM.join("·") + "월") : "–"; }],
      ["입금 달(대략)", null, function(v, o){ return o.payM && !o.stale ? (o.payM.length >= 12 ? "매달" : o.payM.join("·") + "월") : "–"; }],
      ["다음 배당락", null, function(v, o){ return o.next ? md(o.next) + "쯤" : "–"; }],
      ["1년 전보다 배당", function(o){ return o.spec ? null : o.gr; }, function(v){ return sg(v); }, 1],
      ["1주 가격", null, function(v, o){ return fmtPx(o.price, o.cur); }],
      ["1주당 1년 배당", null, function(v, o){ return o.ps ? fmtPx(o.ps, o.cur) : "–"; }],
      ["주가 1년", function(o){ return o.r1y; }, function(v){ return sg(v); }, 1],
      ["주가+배당 1년", function(o){ return o.tot; }, function(v){ return sg(v); }, 1]
    ];
    var h = '<section class="card" data-xc="1"><h3>🧾 나란히 비교 <span class="mut">초록 = 가장 좋은 쪽</span></h3><div class="dv-tw"><table class="dv-t"><thead><tr><th></th>' +
      R.map(function(o){ return '<th data-dvop="' + e(o.sym) + '"><i style="background:' + o.c + '"></i>' + nm(o, 1) + sub2(o) + '</th>'; }).join("") + '</tr></thead><tbody>' +
      rows.map(function(rw){ var b = rw[1] && rw[3] != null ? best(rw[1], rw[3]) : null;
        return '<tr><td>' + rw[0] + '</td>' + R.map(function(o){ var v = rw[1] ? rw[1](o) : null; return '<td' + (b != null && v === b ? ' class="win"' : '') + '>' + rw[2](v, o) + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div></section>';
    return h;
  }
  // ⑤ 종목별 배당 흐름 (접힘)
  function details(R){
    return '<section class="card" data-xc="1"><h3>📈 종목별 배당 흐름 <span class="mut">눌러서 펼치기</span></h3>' + R.map(function(o){
      var sp = '';
      if (o.spark && o.spark.length){
        var mx = Math.max.apply(null, o.spark.map(function(x){ return x[1]; })) || 1, n = o.spark.length, W = 300, H = 56, bw = W / n;
        sp = '<svg viewBox="0 0 ' + W + ' ' + (H + 14) + '" class="dv-sp" aria-hidden="true">' + o.spark.map(function(x, k){ var hh = Math.max(2, x[1] / mx * H);
          return '<rect x="' + (k * bw + 2) + '" y="' + (H - hh) + '" width="' + (bw - 4) + '" height="' + hh + '" rx="2" fill="' + o.c + '" opacity="' + (k === n - 1 ? 1 : .55) + '"/>' +
            (k === 0 || k === n - 1 || n <= 6 ? '<text x="' + (k * bw + bw / 2) + '" y="' + (H + 12) + '" text-anchor="middle" font-size="10" fill="var(--sub)">' + x[0].slice(2, 7).replace("-", ".") + '</text>' : ''); }).join("") + '</svg>';
      }
      var lines = [];
      if (o.fq) lines.push(["주기", o.stale ? "최근 배당이 끊겼어요 (마지막 " + ymd(o.lastEx) + ")" : o.fq.k + " · 1년에 " + o.fq.n + "번"]);
      if (o.lastEx) lines.push(["지난 배당", ymd(o.lastEx) + " · 1주당 " + fmtPx(o.lastAmt, o.cur)]);
      if (o.next) lines.push(["다음 예상", "배당락 " + md(o.next) + "쯤 → 입금 " + md(o.nextPay) + "쯤"]);
      if (o.per) lines.push(["100만원이면", "1번에 약 " + won(o.per) + " · 1년 " + won(o.ann)]);
      if (o.gr != null) lines.push(["1년 전보다", o.spec ? "특별배당이 섞여 비교 어려움" : "1주당 배당 " + sg(o.gr)]);
      if (!o.has) lines.push(["안내", o.y ? "배당 일정 자료를 모으는 중이라 배당률만 보여요" : "최근 배당 기록이 없어요"]);
      return '<details class="dv-d"><summary><i style="background:' + o.c + '"></i><b>' + nm(o, 1) + '</b>' + sub2(o) + '<span>' + (o.y ? pc(o.y) : '–') + '</span></summary>' + sp +
        '<div class="dv-kv">' + lines.map(function(l){ return '<div><small>' + l[0] + '</small><b>' + e(l[1]) + '</b></div>'; }).join("") + '</div>' +
        '<button type="button" class="dv-op" data-dvop="' + e(o.sym) + '">📄 종목리포트 보기 ›</button></details>'; }).join("") + '</section>';
  }
  function note(R){
    return '<p class="dv-note">배당률 = 최근 1년 실제 받은 배당 ÷ 지금 가격 (기록이 없으면 증권사 자료 배당률). 다음 배당·입금 달은 지난 일정으로 본 예상이라 회사·운용사 결정에 따라 바뀔 수 있어요. 배당이 많다고 수익이 큰 건 아니에요 — 「주가+배당 1년」도 같이 보세요.</p>' +
      '<div class="dv-again"><button type="button" id="dvre">🔄 다른 종목으로 다시</button></div>';
  }


  /* ───────── 📨 고객에게 보내기 — 한 장(카톡 그림) · PDF 풀버전(A4 4쪽) · PPT(그림판 4쪽) ─────────
     11/12 사용자 「배당비교 결과 나오면 제안서처럼 한 장·전체 PDF 등등 카톡으로 보낼 수 있게」
     휴대폰 안에서 그림을 새로 그림(lib/html2pdf · lib/pptxgen) · 서버·돈 안 씀 · 앱 이름 안 넣음 · 받는 분 이름은 휴대폰에만 */
  var LAST = null, BUSY = false;
  var AMTS = [[1000000, "100만원"], [10000000, "1,000만원"], [50000000, "5,000만원"], [100000000, "1억원"]];
  var FONT = '"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo","Noto Sans KR","Noto Sans CJK KR",sans-serif';
  var INK = "#141a26", SUB = "#5b6576", LN = "#e3e7ee", NAVY = "#13284b", GOLD = "#e0a82e", WIN = "#14895f";
  var PW = 794, PH = 1123;
  function lsg(k){ try { return localStorage.getItem(k); } catch(x){ return null; } }
  function lss(k, v){ try { localStorage.setItem(k, v); } catch(x) {} }
  function ME(){ try { return JSON.parse(lsg("propme") || "{}") || {}; } catch(x){ return {}; } }
  function amt(){ var a = +lsg("divc_amt"); return AMTS.some(function(x){ return x[0] === a; }) ? a : 10000000; }
  function amtLab(a){ var f = AMTS.filter(function(x){ return x[0] === a; })[0]; return f ? f[1] : won(a); }
  function recent(){ try { var a = JSON.parse(lsg("op_clients") || "[]"); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 8) : []; } catch(x){ return []; } }
  function saveCli(c){ c = String(c || "").trim(); if (!c) return; var a = recent().filter(function(x){ return x !== c; }); a.unshift(c); lss("op_clients", JSON.stringify(a.slice(0, 8))); }
  function cliLab(c){ c = String(c || "").replace(/\s+/g, " ").trim(); return !c ? "" : /님$/.test(c) ? c : c + " 고객님"; }
  // 짧은 원: 1만 미만 그대로 · 1만 넘으면 「3.1만」 · 100만 넘으면 「123만」
  function wk(v){ if (!v) return ""; if (v < 1e4) return (Math.round(v / 10) * 10).toLocaleString("ko-KR"); if (v < 1e6) return (Math.round(v / 1e3) / 10).toFixed(1).replace(/\.0$/, "") + "만"; return Math.round(v / 1e4).toLocaleString("ko-KR") + "만"; }
  function todayK(){ var d = new Date(Date.now() + 9 * 3600e3); return d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일"; }
  function tkName(o){ return /[가-힣]/.test(o.name) ? V.cd(o.sym) : o.name; }   // 이름 밑 둘째 줄 (미국 종목 = 티커 / 영어 이름)
  function main1(o){ return lab(o); }
  // 기준 금액에 맞춰 늘린 숫자
  function sc(R, A){ var f = A / BASE; return R.map(function(o){ return {o: o, ann: o.ann != null ? o.ann * f : null, net: o.net != null ? o.net * f : null, per: o.per != null ? o.per * f : null, mo: o.mo ? o.mo.map(function(v){ return v * f; }) : null}; }); }
  function monthsAhead(){ var now = new Date(), ms = []; for (var i = 0; i < 12; i++){ var d = new Date(now.getFullYear(), now.getMonth() + i, 1); ms.push({m: d.getMonth() + 1, y: d.getFullYear()}); } return ms; }

  function sendCard(){
    var R = recent(), me = ME(), pb = lsg("pbname") || me.pb || "", a = amt();
    return '<section class="card dv-send" id="dvsend"><h3>📨 고객에게 보내기 <span class="mut">카톡 · PDF · PPT</span></h3>' +
      '<label class="dv-f">💌 받는 분<input id="dvcl" maxlength="20" placeholder="고객 이름 (예: 홍길동 · 비워도 돼요)" autocomplete="off"></label>' +
      (R.length ? '<div class="dv-rc">' + R.map(function(n){ return '<button type="button" data-dvcl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<label class="dv-f">✍️ 보내는 사람<input id="dvpb" maxlength="30" placeholder="내 이름 (예: 김OO PB · 비워도 돼요)" value="' + e(pb) + '"></label>' +
      '<div class="dv-f2">💵 얼마 기준으로<div class="dv-am">' + AMTS.map(function(x){ return '<button type="button" data-dvam="' + x[0] + '"' + (x[0] === a ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join("") + '</div></div>' +
      '<div class="dv-mk"><button type="button" data-dvmk="png" class="main">📱 고객에게 한 장<small>카톡 전송용 그림 1장</small></button>' +
      '<button type="button" data-dvmk="pdf">📄 PDF 풀버전<small>A4 4쪽 · 차트·표·종목별</small></button>' +
      '<button type="button" data-dvmk="ppt">📊 PPT<small>4쪽 · 안 깨지는 그림판</small></button></div>' +
      simUI() +
      '<p class="dv-st" id="dvst">이름을 넣으면 맨 위에 「○○ 고객님께」로 들어가요 · 받는 분 이름은 이 휴대폰에만 남아요</p></section>';
  }
  function bindSend(){
    var box = document.getElementById("dvsend"); if (!box) return;
    var I = box.querySelector("#dvcl"), P = box.querySelector("#dvpb");
    if (P) P.oninput = function(){ lss("pbname", P.value.trim().slice(0, 30)); };
    [["dvsno", "no"], ["dvsfr", "from"], ["dvsto", "to"]].forEach(function(q){ var el = box.querySelector("#" + q[0]); if (el) el.oninput = el.onchange = function(){ simSet(q[1], el.value.trim()); simRefresh(); }; });
    box.onclick = function(ev){
      var t = ev.target, c = t.closest && t.closest("[data-dvcl]"), am = t.closest && t.closest("[data-dvam]"), mk = t.closest && t.closest("[data-dvmk]");
      if (c){ var on = I.value.trim() !== c.dataset.dvcl; I.value = on ? c.dataset.dvcl : ""; [].forEach.call(box.querySelectorAll("[data-dvcl]"), function(b){ b.classList.toggle("on", on && b === c); }); return; }
      if (am){ lss("divc_amt", am.dataset.dvam); [].forEach.call(box.querySelectorAll("[data-dvam]"), function(b){ b.classList.toggle("on", b === am); }); return; }
      if (mk) make(mk.dataset.dvmk, mk);
    };
    if (I) I.oninput = function(){ [].forEach.call(box.querySelectorAll("[data-dvcl]"), function(b){ b.classList.toggle("on", b.dataset.dvcl === I.value.trim()); }); };
  }
  function opts(){ var I = document.getElementById("dvcl"), P = document.getElementById("dvpb"), me = ME();
    return {cl: I ? I.value.trim().slice(0, 20) : "", pb: P ? P.value.trim().slice(0, 30) : (lsg("pbname") || ""), org: me.org || "", A: amt()}; }

  /* ── 그림 찍기 (제안서와 같은 방식) ── */
  var HOST = null, IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function host(){ if (!HOST || !document.body.contains(HOST)){ HOST = document.createElement("div"); HOST.setAttribute("aria-hidden", "true");
    HOST.style.cssText = "position:fixed;left:-20000px;top:0;z-index:-1;pointer-events:none;background:#fff;color:" + INK + ";color-scheme:light"; document.body.appendChild(HOST); } return HOST; }
  function lib(src, key){ return new Promise(function(ok, no){ if (window[key]) return ok(); var s = document.createElement("script"); s.src = src; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("도구를 못 받음")); }; document.head.appendChild(s); }); }
  function snap(html, w, scale){
    var H = host(); H.innerHTML = html; var el = H.firstChild;
    var h = Math.ceil(el.getBoundingClientRect().height);
    return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [w, h], orientation: "portrait", hotfixes: ["px_scaling"]},
      html2canvas: {scale: scale, backgroundColor: "#ffffff", useCORS: true, logging: false, scrollX: 0, scrollY: 0, windowWidth: w, width: w, height: h,
        onclone: function(d){ try { d.documentElement.removeAttribute("data-ui"); d.documentElement.style.colorScheme = "light"; } catch(x) {} }}}).from(el).toCanvas().get("canvas")
      .then(function(c){ H.innerHTML = ""; return c; });
  }
  function fname(o, ext){ return ((o.cl ? o.cl + "님_" : "") + "배당비교_" + LAST.map(main1).slice(0, 3).join("_") + "_" + ymd(new Date()).slice(5).replace("-", "")).replace(/[\\/:*?"<>|\s·&]+/g, "_").slice(0, 60) + "." + ext; }
  function deliver(blob, name, mime, title){
    var f = new File([blob], name, {type: mime});
    if (window.__onepage && __onepage.ready){ __onepage.ready([f], title); return; }
    try { if (navigator.canShare && navigator.canShare({files: [f]})){ navigator.share({files: [f]}).catch(function(){}); return; } } catch(x) {}
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 30000);
  }
  function make(kind, btn){
    if (BUSY || !LAST) return; BUSY = true;
    var o = opts(), st = document.getElementById("dvst"), old = btn.innerHTML; if (kind === "rev") o.cl = "";
    btn.disabled = true; btn.innerHTML = "⏳ 만드는 중…<small>몇 초 걸려요</small>";
    var pl = kind === "rev" ? [reqPage(o)].concat(pages(LAST, o)) : null;
    var p = lib("lib/html2pdf.bundle.min.js", "html2pdf").then(function(){
      if (kind === "png") return snap(onePage(LAST, o), 1080, IOS ? 1 : 1.3).then(function(c){ return new Promise(function(r){ c.toBlob(function(b){ c.width = c.height = 0; r(b); }, "image/png"); }); });
      var imgs = [];
      return (pl || pages(LAST, o)).reduce(function(pr, html){ return pr.then(function(){ return snap(html, PW, IOS ? 1.6 : 2).then(function(c){ imgs.push(c.toDataURL("image/jpeg", 0.9)); c.width = c.height = 0; }); }); }, Promise.resolve()).then(function(){
        if (kind === "pdf" || kind === "rev") return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [PW, PH], orientation: "portrait", hotfixes: ["px_scaling"]}}).from(document.createElement("div")).toPdf().get("pdf").then(function(pdf){
          imgs.forEach(function(u, i){ if (i) pdf.addPage([PW, PH], "portrait"); pdf.addImage(u, "JPEG", 0, 0, PW, PH); }); return pdf.output("blob"); });
        return lib("lib/pptxgen.bundle.js?v=1", "PptxGenJS").then(function(){
          var P = new PptxGenJS(); P.defineLayout({name: "A4P", width: 8.27, height: 11.69}); P.layout = "A4P"; P.title = (o.cl ? cliLab(o.cl) + " " : "") + "배당 비교";
          imgs.forEach(function(u){ P.addSlide().addImage({data: u, x: 0, y: 0, w: 8.27, h: 11.69}); });
          return P.write({outputType: "blob"}); });
      });
    });
    var mime = kind === "png" ? "image/png" : kind === "pdf" || kind === "rev" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    p.then(function(blob){
      var name = kind === "rev" ? ("심의요청_배당비교_" + DV_VER + (o.pb ? "_" + o.pb : "")).replace(/[\\/:*?"<>|\s·]+/g, "_") + ".pdf" : fname(o, kind === "png" ? "png" : kind === "pdf" ? "pdf" : "pptx");
      if (kind !== "rev") saveCli(o.cl); deliver(blob, name, mime, kind === "png" ? "배당 비교 한 장" : kind === "pdf" ? "배당 비교 PDF" : kind === "rev" ? "배당 비교 심의 요청서" : "배당 비교 PPT");
      if (st) st.textContent = "✓ 다 만들었어요 · " + name + " · " + Math.max(1, Math.round(blob.size / 1024)) + "KB" + (kind !== "rev" && !simState().ok ? " · ⚠️ 심의필 없이 만들었어요 — 고객에게 보내기 전에 심의필을 넣어 주세요" : "");
      try { if (window.ntfyUse) ntfyUse("divc_" + kind); } catch(x) {}
    }).catch(function(err){ if (st) st.textContent = "만들지 못했어요 · " + String((err && (err.message || err)) || "").slice(0, 80); try { console.error(err); } catch(x) {} })
      .then(function(){ BUSY = false; btn.disabled = false; btn.innerHTML = old; });
  }

  /* ── 그림 조각 (흰 바탕) ── */
  function dot(c, s){ s = s || 12; return '<i style="display:inline-block;width:' + s + 'px;height:' + s + 'px;border-radius:50%;background:' + c + ';flex:0 0 ' + s + 'px"></i>'; }
  function nm2(o, fs, fs2){ return '<div style="min-width:0"><div style="font-size:' + fs + 'px;font-weight:800;color:' + INK + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(o)) + '</div><div style="font-size:' + fs2 + 'px;color:' + SUB + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(tkName(o)) + (o.etf ? ' · ETF' : '') + '</div></div>'; }
  function band(o, W, title, sub, k){
    var cl = cliLab(o.cl), big = W > 900;
    return '<div style="background:linear-gradient(135deg,' + NAVY + ' 0%,#1f4a86 100%);color:#fff;padding:' + (big ? '48px 48px 40px' : '34px 48px 28px') + ';position:relative">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;font-size:' + (big ? 24 : 15) + 'px;color:rgba(255,255,255,.78)">' +
        '<div style="font-weight:800;color:' + (cl ? '#fff' : 'rgba(255,255,255,.78)') + ';font-size:' + (cl ? (big ? 32 : 19) : (big ? 24 : 15)) + 'px">' + (cl ? '💌 ' + e(cl) + '께' : todayK()) + '</div>' +
        '<div style="text-align:right;line-height:1.45">' + (cl ? todayK() + '<br>' : '') + (o.org ? e(o.org) + ' · ' : '') + (o.pb ? e(o.pb) + (cl ? ' 드림' : '') : '') + '</div></div>' +
      '<div style="margin-top:' + (big ? 26 : 18) + 'px;font-size:' + (big ? 21 : 13) + 'px;font-weight:800;color:' + GOLD + ';letter-spacing:.06em">DIVIDEND COMPARISON' + (k ? ' · ' + k : '') + '</div>' +
      '<div style="font-size:' + (big ? 54 : 32) + 'px;font-weight:900;line-height:1.2;margin-top:6px">' + title + '</div>' +
      (sub ? '<div style="font-size:' + (big ? 24 : 15) + 'px;color:rgba(255,255,255,.82);margin-top:8px;line-height:1.5">' + sub + '</div>' : '') + '</div>';
  }
  function hTitle(t, s, big){ return '<div style="display:flex;align-items:baseline;gap:10px;margin:' + (big ? '40px 0 16px' : '26px 0 12px') + '"><div style="font-size:' + (big ? 32 : 20) + 'px;font-weight:900;color:' + INK + '">' + t + '</div>' + (s ? '<div style="font-size:' + (big ? 20 : 12.5) + 'px;color:' + SUB + '">' + s + '</div>' : '') + '</div>'; }
  function ranked(S){ return S.slice().sort(function(a, b){ return (b.o.y || 0) - (a.o.y || 0); }); }
  function heroBox(S, A, big){
    var ok = ranked(S).filter(function(s){ return s.o.y > 0; }), b = ok[0], lo = ok[ok.length - 1];
    if (!b) return '<div style="padding:24px;border-radius:18px;background:#f5f7fb;font-size:' + (big ? 26 : 16) + 'px">배당 자료가 없음</div>';
    var nx = S.filter(function(s){ return s.o.nextPay; }).sort(function(x, y){ return x.o.nextPay - y.o.nextPay; })[0];
    return '<div style="border-radius:' + (big ? 26 : 16) + 'px;background:linear-gradient(135deg,#fff8e6,#fff3d1);border:2px solid #f3d58a;padding:' + (big ? '30px 34px' : '20px 24px') + ';display:flex;gap:' + (big ? 26 : 18) + 'px;align-items:center">' +
      '<div style="font-size:' + (big ? 84 : 52) + 'px;line-height:1">🥇</div><div style="flex:1;min-width:0">' +
        '<div style="font-size:' + (big ? 22 : 13.5) + 'px;color:#8a6410;font-weight:800">배당 가장 많이 주는 것</div>' +
        '<div style="font-size:' + (big ? 44 : 27) + 'px;font-weight:900;color:' + INK + ';line-height:1.25;margin-top:2px;word-break:keep-all">' + e(main1(b.o)) + (main1(b.o) !== b.o.name ? '<span style="display:block;font-size:' + (big ? 20 : 12.5) + 'px;font-weight:600;color:' + SUB + ';margin-top:2px">' + e(b.o.name) + '</span>' : '') + '</div>' +
        '<div style="font-size:' + (big ? 26 : 16) + 'px;color:' + INK + ';margin-top:6px;line-height:1.5">' + amtLab(A) + ' 넣으면 1년에 <b style="color:#b7790b;font-size:' + (big ? 36 : 22) + 'px">' + won(b.ann) + '</b> (배당률 ' + pc(b.o.y) + ')</div>' +
        (lo && lo !== b ? '<div style="font-size:' + (big ? 21 : 13) + 'px;color:' + SUB + ';margin-top:4px">' + e(main1(lo.o)) + '보다 1년에 ' + won(b.ann - lo.ann) + ' 더 받음' + (nx ? ' · 다음 입금은 ' + e(main1(nx.o)) + ' ' + md(nx.o.nextPay) + '쯤' : '') + '</div>' : '') +
      '</div></div>';
  }
  function barsH(S, A, big){
    var L = ranked(S), mx = Math.max.apply(null, L.map(function(s){ return s.ann || 0; })) || 1, fs = big ? 24 : 14.5;
    return L.map(function(s, i){ var w = s.ann ? Math.max(2, s.ann / mx * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:' + (big ? 16 : 12) + 'px;padding:' + (big ? '14px 0' : '9px 0') + ';border-bottom:1px solid ' + LN + '">' +
        '<div style="width:' + (big ? 34 : 22) + 'px;font-size:' + fs + 'px;font-weight:900;color:' + (i === 0 ? '#b7790b' : SUB) + ';text-align:center">' + (i + 1) + '</div>' + dot(s.o.c, big ? 16 : 11) +
        '<div style="width:' + (big ? 250 : 170) + 'px">' + nm2(s.o, fs, big ? 17 : 11) + '</div>' +
        '<div style="flex:1;height:' + (big ? 30 : 18) + 'px;background:#eef1f6;border-radius:99px;overflow:hidden"><div style="height:100%;width:' + w + '%;background:' + s.o.c + ';border-radius:99px"></div></div>' +
        '<div style="width:' + (big ? 210 : 140) + 'px;text-align:right"><div style="font-size:' + (big ? 30 : 17) + 'px;font-weight:900;color:' + INK + '">' + (s.ann ? won(s.ann) : (s.o.stale ? '중단' : '없음')) + '</div>' +
          '<div style="font-size:' + (big ? 18 : 11.5) + 'px;color:' + SUB + '">' + (s.o.y ? pc(s.o.y) : '–') + (s.net ? ' · 세후 ' + wonS(s.net) : '') + '</div></div></div>'; }).join("");
  }
  function heat(S, big){   // 앞으로 12달 × 종목 — 칸 색 진하기 = 그 달 들어오는 돈
    var L = S.filter(function(s){ return s.mo; }); if (!L.length) return '';
    var ms = monthsAhead(), mx = Math.max.apply(null, L.map(function(s){ return Math.max.apply(null, s.mo); })) || 1, lw = big ? 230 : 150, fs = big ? 15.5 : 9.5, ch = big ? 50 : 30;
    var head = '<div style="display:flex;gap:' + (big ? 4 : 3) + 'px;margin-left:' + lw + 'px;margin-bottom:4px">' + ms.map(function(m, k){ return '<div style="flex:1;text-align:center;font-size:' + (big ? 18 : 11) + 'px;font-weight:' + (k === 0 ? 900 : 600) + ';color:' + (k === 0 ? INK : SUB) + '">' + (m.m === 1 && k ? "'" + String(m.y).slice(2) + ' ' : '') + m.m + '월</div>'; }).join("") + '</div>';
    var rows = L.map(function(s){
      return '<div style="display:flex;align-items:center;gap:' + (big ? 4 : 3) + 'px;margin-bottom:' + (big ? 4 : 3) + 'px"><div style="width:' + (lw - 8) + 'px;margin-right:8px;display:flex;align-items:center;gap:7px;min-width:0">' + dot(s.o.c, big ? 13 : 9) + '<div style="font-size:' + (big ? 19 : 12) + 'px;font-weight:800;color:' + INK + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(s.o)) + '</div></div>' +
        s.mo.map(function(v){ var a = v ? 0.18 + 0.82 * v / mx : 0;
          return '<div style="flex:1;height:' + ch + 'px;border-radius:' + (big ? 9 : 6) + 'px;background:' + (v ? hexA(s.o.c, a) : '#f2f4f8') + ';display:flex;align-items:center;justify-content:center;font-size:' + fs + 'px;font-weight:800;color:' + (a > 0.55 ? '#fff' : INK) + '">' + (v ? wk(v) : '') + '</div>'; }).join("") + '</div>'; }).join("");
    return head + rows;
  }
  // 캡처 때 앱의 밝은 글자색이 새어 들지 않게 — 본문 칸마다 글자색을 직접 박음 (색을 이미 정한 칸은 그대로)
  function fixC(h){ return h.replace(/style="([^"]*)"/g, function(m, st){ return /(^|;)\s*color:/.test(st) ? m : 'style="color:' + INK + ';' + st + '"'; }); }
  function hexA(h, a){ var n = parseInt(h.slice(1), 16); return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a.toFixed(2) + ")"; }
  function stack(S, big){   // 모두 같은 금액씩 담으면 매달 들어오는 돈 (쌓은 막대)
    var L = S.filter(function(s){ return s.mo; }); if (!L.length) return '';
    var ms = monthsAhead(), tot = ms.map(function(_, k){ return L.reduce(function(a, s){ return a + s.mo[k]; }, 0); }), mx = Math.max.apply(null, tot) || 1, H = big ? 260 : 210;
    return '<div style="display:flex;align-items:flex-end;gap:8px;height:' + (H + 44) + 'px;padding-top:6px">' + ms.map(function(m, k){
      var segs = L.map(function(s){ var v = s.mo[k]; return v ? '<div style="height:' + (v / mx * H).toFixed(1) + 'px;background:' + s.o.c + '"></div>' : ''; }).join("");
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;height:100%">' +
        '<div style="font-size:11px;font-weight:800;text-align:center;color:' + INK + ';margin-bottom:3px">' + (tot[k] ? wk(tot[k]) : '') + '</div>' +
        '<div style="display:flex;flex-direction:column-reverse;border-radius:6px 6px 0 0;overflow:hidden;min-height:2px;background:' + (tot[k] ? 'transparent' : '#eef1f6') + '">' + segs + '</div>' +
        '<div style="font-size:12px;text-align:center;color:' + (k === 0 ? INK : SUB) + ';font-weight:' + (k === 0 ? 900 : 600) + ';margin-top:5px;border-top:1.5px solid ' + INK + ';padding-top:4px">' + m.m + '월</div></div>'; }).join("") + '</div>';
  }
  function legend(S, fs){ return '<div style="display:flex;flex-wrap:wrap;gap:6px 16px;font-size:' + fs + 'px;color:' + INK + '">' + S.map(function(s){ return '<span style="display:inline-flex;align-items:center;gap:6px">' + dot(s.o.c, fs * 0.75) + e(main1(s.o)) + '</span>'; }).join("") + '</div>'; }
  var RISK = ["이 자료는 투자 판단을 돕기 위한 참고 자료이며, 투자 권유나 수익 보장이 아님.",
    "배당률은 최근 1년 실제 배당 ÷ 현재 가격으로 계산한 값이며, 과거 배당이 미래 배당을 보장하지 않음. 배당은 회사·운용사 결정에 따라 줄거나 멈출 수 있음.",
    "배당 입금 달·금액은 지난 일정으로 본 예상이며 실제와 다를 수 있음. 해외 상품은 환율에 따라 원화 금액이 달라짐.",
    "세후 금액은 국내 15.4%·미국 15% 원천징수 기준 대략값이며, 금융소득 연 2,000만원 초과 시 종합과세 등 개인 상황에 따라 달라짐.",
    "주식·ETF는 원금 손실이 날 수 있으며 예금자보호법에 따라 보호되지 않음. 투자 전 상품설명서·약관을 꼭 확인할 것."];
  function riskBox(fs, n){ return '<div style="border-top:2px solid ' + INK + ';padding-top:10px;font-size:' + fs + 'px;line-height:1.6;color:' + SUB + '"><b style="color:' + INK + '">⚠️ 꼭 알아 두실 점</b>' + RISK.slice(0, n || RISK.length).map(function(t){ return '<div>· ' + t + '</div>'; }).join("") + (simLine() ? '<div style="margin-top:6px;font-weight:800;color:' + INK + '">' + e(simLine()) + '</div>' : '') + '</div>'; }


  /* ⚖️ 심의필 (11/12 사용자 「필요해 만들어」) — 제안서 심의필과 따로 · 위험고지 문구(RISK)가 바뀌면 DV_VER 를 올림 → 예전 번호는 「다시 심의」 */
  var DV_VER = "2026.11.12-1";
  function SIM(){ try { return JSON.parse(lsg("divc_sim") || "{}") || {}; } catch(x){ return {}; } }
  function simSet(k, v){ var m = SIM(); m[k] = v; m.ver = DV_VER; lss("divc_sim", JSON.stringify(m)); }
  function tdy(){ return ymd(new Date(Date.now() + 9 * 3600e3 + new Date().getTimezoneOffset() * 6e4)); }
  function dt(v){ return String(v || "").replace(/-/g, "."); }
  function simState(){ var m = SIM(), no = (m.no || "").trim();
    if (!no) return {ok: false, t: "⚠️ 심의필 없음", why: "아직 번호가 없음 — 「📝 심의 요청서」를 만들어 준법감시에 내고, 받은 번호를 넣어 주세요"};
    if (m.ver && m.ver !== DV_VER) return {ok: false, t: "🔄 문구 바뀜 · 다시 심의", why: "위험고지 문구가 바뀌었음(" + DV_VER + ") — 새 요청서로 다시 심의받아 주세요"};
    if (m.to && m.to < tdy()) return {ok: false, t: "⏰ 유효기간 지남", why: "유효기간(" + dt(m.to) + ")이 지났음 — 다시 심의받아 주세요"};
    var left = m.to ? Math.round((pd(m.to) - pd(tdy())) / DAY) : null;
    return {ok: true, warn: left != null && left <= 30, t: left != null && left <= 30 ? "⏳ 심의필 " + left + "일 남음" : "✅ 심의필 등록됨", why: ""}; }
  function simText(){ var m = SIM(), no = (m.no || "").trim(); return no ? (/^제/.test(no) ? no : "제 " + no) + (/호$/.test(no) ? "" : "호") + (m.from || m.to ? " (" + dt(m.from) + "~" + dt(m.to) + ")" : "") : ""; }
  function simLine(){ return simState().ok ? "미래에셋증권 준법감시인 심사필 " + simText() : ""; }
  function simUI(){ var m = SIM(), st = simState();
    return '<details class="dv-sim"' + (st.ok ? '' : ' open') + '><summary>⚖️ 심의필 <span class="dv-sb ' + (st.ok ? (st.warn ? 'w' : 'g') : 'r') + '" id="dvsb">' + st.t + '</span></summary>' +
      '<p class="dv-st" id="dvsw" style="margin-top:4px">' + (st.why || "한 장·PDF·PPT 맨 아래에 심사필 번호가 찍혀요") + '</p>' +
      '<label class="dv-f">번호<input id="dvsno" maxlength="40" placeholder="예: 제2026-0000호" value="' + e(m.no || "") + '"></label>' +
      '<div class="dv-sd"><label>시작<input id="dvsfr" type="date" value="' + e(m.from || "") + '"></label><label>끝<input id="dvsto" type="date" value="' + e(m.to || "") + '"></label></div>' +
      '<button type="button" data-dvmk="rev" class="dv-rv">📝 심의 요청서 PDF<small>요청서 1쪽 + 위험고지 문구 전문 + 지금 비교 견본 4쪽 별첨</small></button>' +
      '<p class="dv-st">심의 순서: ① 요청서 PDF 만들기 → ② 준법감시에 제출 → ③ 받은 번호·기간을 위에 넣기 · 위험고지 문구 버전 ' + DV_VER + '</p></details>'; }
  function simRefresh(){ var st = simState(), b = document.getElementById("dvsb"), w = document.getElementById("dvsw");
    if (b){ b.textContent = st.t; b.className = "dv-sb " + (st.ok ? (st.warn ? "w" : "g") : "r"); } if (w) w.textContent = st.why || "한 장·PDF·PPT 맨 아래에 심사필 번호가 찍혀요"; }
  function reqPage(o){
    var names = LAST.map(function(x){ return e(x.name) + (tkName(x) !== main1(x) ? " (" + e(V.cd(x.sym)) + ")" : ""); });
    var row = function(k, v){ return '<tr><td style="width:150px;padding:9px 12px;background:#f5f7fb;border:1px solid ' + LN + ';font-weight:800;font-size:13px">' + k + '</td><td style="padding:9px 12px;border:1px solid ' + LN + ';font-size:13px;line-height:1.55">' + v + '</td></tr>'; };
    var body = '<div style="font-size:26px;font-weight:900;margin:8px 0 4px">광고·홍보물 심의 요청서</div><div style="font-size:13px;color:' + SUB + ';margin-bottom:16px">고객 배포용 배당 비교 자료 (한 장 그림 · PDF · PPT)</div>' +
      '<table style="border-collapse:collapse;width:100%">' +
      row("요청일", todayK()) + row("요청자", (o.org ? e(o.org) + " · " : "") + (e(o.pb) || "(이름)")) +
      row("자료명", "종목·ETF 배당 비교 (고객 맞춤 · 고객 이름 자동 기재)") +
      row("배포 방식", "카카오톡·문자 1:1 전송 (그림 1장 / PDF 4쪽 / PPT 4쪽) · 불특정 다수 게시 없음") +
      row("내용", "비교 종목의 배당률(최근 1년 실제 배당 ÷ 현재가), 기준 금액당 1년 배당(세전·세후 대략), 배당 주기·입금 예상 달, 1년 전 대비 배당 증감, 주가 1년·주가+배당 1년 수익률 — 매 작성 시점 시세로 자동 계산") +
      row("바뀌는 부분", "종목·ETF 종류와 개수(2~8개), 기준 금액(100만~1억원), 고객 이름, 작성일 시세 · 문구 틀과 위험고지는 고정") +
      row("견본 종목", names.join(", ")) + row("위험고지 버전", DV_VER) + row("희망 사용 기간", "심의일로부터 1년") + '</table>' +
      '<div style="font-size:17px;font-weight:900;margin:22px 0 8px">위험고지 문구 (자료 하단에 그대로 표기)</div>' +
      '<div style="border:1.5px solid ' + LN + ';border-radius:12px;padding:12px 16px;font-size:12.5px;line-height:1.7">' + RISK.map(function(t, i){ return '<div>' + (i + 1) + '. ' + t + '</div>'; }).join("") + '</div>' +
      '<div style="font-size:12px;color:' + SUB + ';margin-top:14px;line-height:1.6">· 별첨: 위 견본 종목으로 만든 PDF 4쪽 (한 장 그림은 PDF 1·2·3쪽 내용을 줄인 것)<br>· 심사필 번호는 받은 뒤 자료 하단에 「미래에셋증권 준법감시인 심사필 제 ○○호 (유효기간)」로 표기함</div>' +
      '<div style="margin-top:28px;display:flex;justify-content:flex-end;gap:12px">' + ["요청자", "부점장", "준법감시인"].map(function(t){ return '<div style="width:110px;border:1px solid ' + LN + ';text-align:center"><div style="background:#f5f7fb;font-size:12px;font-weight:800;padding:5px">' + t + '</div><div style="height:58px"></div></div>'; }).join("") + '</div>';
    return '<div style="width:' + PW + 'px;height:' + PH + 'px;background:#fff;font-family:' + FONT + ';position:relative;overflow:hidden">' + fixC('<div style="padding:40px 48px">' + body + '</div>') + '</div>';
  }
  // 📱 한 장 (1080 폭 · 카톡)
  function onePage(R, o){
    var S = sc(R, o.A), W = 1080, M = 48;
    var info = [["주는 횟수", function(s){ return s.o.fq ? (s.o.stale ? "중단?" : s.o.fq.k) : "–"; }], ["입금 달(대략)", function(s){ return s.o.payM && !s.o.stale ? (s.o.payM.length >= 12 ? "매달" : s.o.payM.length >= 9 ? "거의 매달 (" + s.o.payM.length + "번)" : s.o.payM.join("·") + "월") : "–"; }],
      ["다음 입금", function(s){ return s.o.nextPay ? md(s.o.nextPay) + "쯤" : "–"; }], ["주가+배당 1년", function(s){ return sg(s.o.tot); }]];
    var cols = S.length, lw = 190, cw = (W - 2 * M - lw) / cols;
    var tbl = '<div style="border:1.5px solid ' + LN + ';border-radius:20px;overflow:hidden"><div style="display:flex;background:#f5f7fb">' + '<div style="width:' + lw + 'px"></div>' +
      S.map(function(s){ return '<div style="width:' + cw + 'px;padding:12px 6px;text-align:center;font-size:' + (cols > 5 ? 16 : 19) + 'px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:3px solid ' + s.o.c + '">' + e(main1(s.o)) + '</div>'; }).join("") + '</div>' +
      info.map(function(r){ return '<div style="display:flex;border-top:1px solid ' + LN + '"><div style="width:' + lw + 'px;padding:13px 16px;font-size:19px;color:' + SUB + ';font-weight:700">' + r[0] + '</div>' +
        S.map(function(s){ var t = r[1](s); return '<div style="width:' + cw + 'px;padding:13px 4px;text-align:center;font-size:' + (cols > 5 ? 16 : 20) + 'px;font-weight:800;color:' + (/^\+/.test(t) ? "#d33a2c" : /^−/.test(t) ? "#2563c9" : INK) + '">' + e(t) + '</div>'; }).join("") + '</div>'; }).join("") + '</div>';
    var sub = S.length + '개 비교 · ' + amtLab(o.A) + '씩 넣었다고 보면 · 세전';
    return '<div style="width:' + W + 'px;background:#fff;font-family:' + FONT + ';color:' + INK + '">' + band(o, W, "1년 배당, 누가 더 줄까", sub) +
      fixC('<div style="padding:34px ' + M + 'px 40px">' + heroBox(S, o.A, true) +
        hTitle("📊 1년에 받는 배당", amtLab(o.A) + " 기준 · 많은 순", true) + barsH(S, o.A, true) +
        hTitle("📅 언제 들어오나", "앞으로 12달 · 입금 예상 · 진할수록 많이", true) + heat(S, true) +
        hTitle("🧾 한눈에 비교", "", true) + tbl +
        '<div style="margin-top:28px">' + riskBox(15.5, 5) + '</div></div>') + '</div>';
  }
  // 📄 A4 4쪽
  function page(o, k, title, sub, body){
    return '<div style="width:' + PW + 'px;height:' + PH + 'px;background:#fff;font-family:' + FONT + ';color:' + INK + ';position:relative;overflow:hidden">' + band(o, PW, title, sub, k) +
      fixC('<div style="padding:4px 48px 0">' + body + '</div>') +
      '<div style="position:absolute;left:48px;right:48px;bottom:22px;display:flex;justify-content:space-between;font-size:10.5px;color:' + SUB + ';border-top:1px solid ' + LN + ';padding-top:8px"><span>' + todayK() + ' 기준' + (o.org ? ' · ' + e(o.org) : '') + (o.pb ? ' · ' + e(o.pb) : '') + (simLine() ? ' · ' + e(simLine()) : '') + '</span><span>' + k + ' / 4</span></div></div>';
  }
  function pages(R, o){
    var S = sc(R, o.A), A = o.A, names = S.map(function(s){ return e(main1(s.o)); }).join(" · ");
    var ok = ranked(S).filter(function(s){ return s.o.y > 0; }), b = ok[0];
    var live = R.filter(function(x){ return x.fq && !x.stale; }), mxn = Math.max.apply(null, live.map(function(x){ return x.fq.n; }).concat([0])), often = live.filter(function(x){ return x.fq.n === mxn; });
    var gro = R.filter(function(x){ return x.gr != null && !x.spec; }).sort(function(x, y){ return y.gr - x.gr; })[0];
    var tr = R.filter(function(x){ return x.tot != null; }).sort(function(x, y){ return y.tot - x.tot; })[0];
    var pts = [];
    if (b) pts.push(["💰", "배당 가장 많음", e(main1(b.o)) + " — " + amtLab(A) + "이면 1년 " + won(b.ann) + " (" + pc(b.o.y) + ")"]);
    if (often.length) pts.push(["📅", "가장 자주 줌", often.length < R.length ? often.map(function(x){ return e(main1(x)); }).join(" · ") + " (" + often[0].fq.k + ")" : "모두 " + often[0].fq.k]);
    if (gro && gro.gr > 0) pts.push(["🌱", "배당 가장 많이 늘림", e(main1(gro)) + " — 1년 전보다 1주당 배당 " + sg(gro.gr)]);
    if (tr) pts.push(["📈", "주가+배당 1년 1등", e(main1(tr)) + " " + sg(tr.tot) + " — 배당만 보지 말고 같이 봐야 함"]);
    var p1 = heroBox(S, A, false) +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">' + pts.map(function(p){ return '<div style="border:1.5px solid ' + LN + ';border-radius:14px;padding:12px 14px"><div style="font-size:12.5px;color:' + SUB + ';font-weight:800">' + p[0] + ' ' + p[1] + '</div><div style="font-size:14px;font-weight:700;line-height:1.45;margin-top:3px">' + p[2] + '</div></div>'; }).join("") + '</div>' +
      hTitle("📊 1년에 받는 배당", amtLab(A) + " 기준 · 많은 순 · 세전 (세후 함께)") + barsH(S, A, false) +
      '<div style="margin-top:14px;font-size:11.5px;color:' + SUB + ';line-height:1.6">배당률 = 최근 1년 실제 받은 배당 ÷ 지금 가격 (기록이 없으면 증권사 자료 배당률) · 세후 = 국내 15.4% · 미국 15% 원천징수 기준</div>';
    var totY = S.reduce(function(a, s){ return a + (s.ann || 0); }, 0), totN = S.reduce(function(a, s){ return a + (s.net || 0); }, 0);
    var nxL = S.filter(function(s){ return s.o.nextPay; }).sort(function(x, y){ return x.o.nextPay - y.o.nextPay; });
    var p2 = hTitle("📅 모두 " + amtLab(A) + "씩 담으면 매달 들어오는 돈", "앞으로 12달 · 입금 예상") + legend(S, 13) + stack(S, false) +
      '<div style="display:flex;gap:10px;margin-top:14px">' + [["총 투자", won(A * S.length)], ["1년 배당 (세전)", won(totY)], ["1년 배당 (세후·대략)", totN ? won(totN) : "–"], ["한 달 평균", won(totY / 12)]].map(function(x, i){
        return '<div style="flex:1;border-radius:12px;padding:10px 12px;background:' + (i === 1 ? '#fff6dd' : '#f5f7fb') + '"><div style="font-size:11.5px;color:' + SUB + ';font-weight:700">' + x[0] + '</div><div style="font-size:17px;font-weight:900;margin-top:2px">' + x[1] + '</div></div>'; }).join("") + '</div>' +
      hTitle("🗓 종목별 입금 달력", amtLab(A) + " 기준 · 진할수록 많이") + heat(S, false) +
      (nxL.length ? hTitle("⏭ 다음 배당 순서", "배당락 → 입금 (대략)") + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 14px">' + nxL.map(function(s){ return '<div style="display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 0;border-bottom:1px solid ' + LN + '">' + dot(s.o.c, 9) + '<b style="color:' + INK + ';flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(s.o)) + '</b><span style="color:' + SUB + '">' + md(s.o.next) + ' → </span><b>' + md(s.o.nextPay) + '쯤</b><span style="color:' + SUB + ';width:70px;text-align:right">' + (s.per ? wonS(s.per) : '') + '</span></div>'; }).join("") + '</div>' : '');
    var rows = [
      ["배당률", function(x){ return x.o.y; }, function(v){ return pc(v); }, 1], [amtLab(A) + " → 1년", function(x){ return x.ann; }, function(v){ return wonS(v); }, 1],
      ["1번 받을 때", function(x){ return x.per; }, function(v){ return wonS(v); }], ["세후 1년(대략)", function(x){ return x.net; }, function(v){ return wonS(v); }, 1],
      ["주는 횟수", function(x){ return x.o.fq && !x.o.stale ? x.o.fq.n : null; }, function(v, x){ return x.o.fq ? (x.o.stale ? "중단?" : x.o.fq.k) : "–"; }, 1],
      ["배당락 달", null, function(v, x){ return x.o.exM && !x.o.stale ? (x.o.exM.length >= 12 ? "매달" : x.o.exM.length >= 9 ? "거의 매달" : x.o.exM.join("·") + "월") : "–"; }],
      ["입금 달(대략)", null, function(v, x){ return x.o.payM && !x.o.stale ? (x.o.payM.length >= 12 ? "매달" : x.o.payM.length >= 9 ? "거의 매달" : x.o.payM.join("·") + "월") : "–"; }],
      ["다음 배당락", null, function(v, x){ return x.o.next ? md(x.o.next) + "쯤" : "–"; }],
      ["1년 전보다 배당", function(x){ return x.o.spec ? null : x.o.gr; }, function(v){ return sg(v); }, 1],
      ["1주 가격", null, function(v, x){ return fmtPx(x.o.price, x.o.cur); }], ["1주당 1년 배당", null, function(v, x){ return x.o.ps ? fmtPx(x.o.ps, x.o.cur) : "–"; }],
      ["주가 1년", function(x){ return x.o.r1y; }, function(v){ return sg(v); }, 1], ["주가+배당 1년", function(x){ return x.o.tot; }, function(v){ return sg(v); }, 1]];
    var n = S.length, lw = 128, cw = (PW - 96 - lw) / n, tf = n > 5 ? 11.5 : 13;
    function bst(f, hi){ var v = S.map(f).filter(function(x){ return x != null && isFinite(x); }); return v.length < 2 ? null : hi ? Math.max.apply(null, v) : Math.min.apply(null, v); }
    var p3 = hTitle("🧾 나란히 비교", "초록 = 가장 좋은 쪽") + '<div style="border:1.5px solid ' + LN + ';border-radius:14px;overflow:hidden">' +
      '<div style="display:flex;background:#f5f7fb"><div style="width:' + lw + 'px"></div>' + S.map(function(s){ return '<div style="width:' + cw + 'px;padding:10px 4px 8px;text-align:center;border-bottom:3px solid ' + s.o.c + '"><div style="font-size:' + tf + 'px;font-weight:900;color:' + INK + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(s.o)) + '</div><div style="font-size:' + (tf - 2.5) + 'px;color:' + SUB + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(tkName(s.o)) + '</div></div>'; }).join("") + '</div>' +
      rows.map(function(rw, ri){ var bv = rw[1] && rw[3] != null ? bst(rw[1], rw[3]) : null;
        return '<div style="display:flex;border-top:1px solid ' + LN + ';background:' + (ri % 2 ? '#fbfcfe' : '#fff') + '"><div style="width:' + lw + 'px;padding:10px 12px;font-size:12px;color:' + SUB + ';font-weight:700">' + rw[0] + '</div>' +
          S.map(function(s){ var v = rw[1] ? rw[1](s) : null, w = bv != null && v === bv, t = rw[2](v, s); return '<div style="width:' + cw + 'px;padding:10px 3px;text-align:center;font-size:' + tf + 'px;font-weight:' + (w ? 900 : 700) + ';color:' + (w ? WIN : INK) + ';background:' + (w ? 'rgba(20,137,95,.08)' : 'transparent') + '">' + e(t) + '</div>'; }).join("") + '</div>'; }).join("") + '</div>' +
      hTitle("💡 이렇게 읽으면 됨") + '<div style="display:grid;gap:8px">' + [
        ["배당률이 높다 ≠ 수익이 크다", "주가가 빠지면 배당을 받아도 손해일 수 있음 — 「주가+배당 1년」 줄을 같이 봐야 함"],
        ["자주 주는 것 = 생활비용", "월배당은 매달 현금이 필요할 때 편리함 · 분기·연 배당은 한 번에 크게 들어옴"],
        ["배당이 늘어나는 곳", "「1년 전보다 배당」이 플러스면 회사가 배당을 키우는 중이라는 뜻 — 오래 들고 갈수록 유리"]].map(function(x){
          return '<div style="border-left:4px solid ' + GOLD + ';background:#fffbf0;border-radius:0 12px 12px 0;padding:10px 14px"><div style="font-size:14px;font-weight:900">' + x[0] + '</div><div style="font-size:12.5px;color:' + SUB + ';line-height:1.5;margin-top:2px">' + x[1] + '</div></div>'; }).join("") + '</div>';
    var cards = S.map(function(s){ var x = s.o, sp = x.spark || [], mx = Math.max.apply(null, sp.map(function(z){ return z[1]; }).concat([0])) || 1;
      var bars = sp.length ? '<div style="display:flex;align-items:flex-end;gap:3px;height:54px;margin:8px 0 2px">' + sp.map(function(z, k){ return '<div style="flex:1;height:' + Math.max(3, z[1] / mx * 54).toFixed(1) + 'px;background:' + x.c + ';opacity:' + (k === sp.length - 1 ? 1 : .5) + ';border-radius:3px 3px 0 0"></div>'; }).join("") + '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:9.5px;color:' + SUB + '"><span>' + sp[0][0].slice(2, 7).replace("-", ".") + '</span><span>최근 ' + sp.length + '번</span><span>' + sp[sp.length - 1][0].slice(2, 7).replace("-", ".") + '</span></div>' : '<div style="font-size:11.5px;color:' + SUB + ';padding:16px 0">배당 기록 모으는 중</div>';
      var kv = [];
      if (x.lastEx) kv.push(["지난 배당", ymd(x.lastEx).slice(2).replace(/-/g, ".") + " · 1주 " + fmtPx(x.lastAmt, x.cur)]);
      if (x.next) kv.push(["다음 예상", md(x.next) + " → 입금 " + md(x.nextPay) + "쯤"]);
      if (s.per) kv.push(["한 번에", "약 " + won(s.per) + " (" + amtLab(A) + ")"]);
      if (x.gr != null) kv.push(["1년 전보다", x.spec ? "특별배당 섞임" : sg(x.gr)]);
      return '<div style="border:1.5px solid ' + LN + ';border-top:4px solid ' + x.c + ';border-radius:12px;padding:10px 12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' + nm2(x, 14, 10.5) + '<div style="text-align:right;flex:0 0 auto"><div style="font-size:16px;font-weight:900">' + (x.y ? pc(x.y) : '–') + '</div><div style="font-size:10.5px;color:' + SUB + '">' + (x.fq ? (x.stale ? '중단?' : x.fq.k) : '') + '</div></div></div>' + bars +
        kv.map(function(k){ return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-top:1px dashed ' + LN + '"><span style="color:' + SUB + '">' + k[0] + '</span><b>' + e(k[1]) + '</b></div>'; }).join("") + '</div>'; }).join("");
    var p4 = hTitle("📈 종목별 배당 흐름", "최근 배당 막대 · 진한 막대 = 가장 최근") + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + cards + '</div>' +
      '<div style="position:absolute;left:48px;right:48px;bottom:56px">' + riskBox(10.5) + '</div>';
    return [page(o, 1, "1년 배당, 누가 더 줄까", names + " · " + amtLab(A) + " 기준", p1),
            page(o, 2, "언제, 얼마나 들어오나", "앞으로 12달 입금 예상 · " + amtLab(A) + " 기준", p2),
            page(o, 3, "숫자로 나란히", "배당률 · 주기 · 세후 · 주가까지 한 표에", p3),
            page(o, 4, "종목별 배당 흐름", "지난 배당과 다음 배당 · 알아 둘 점", p4)];
  }

  window.divcView = view;
  window.__divc = {onePage: function(o){ return onePage(LAST, o); }, pages: function(o){ return pages(LAST, o); }, last: function(){ return LAST; }};
  window.divcInit = function(){
    draw();
    document.getElementById("dvbody").addEventListener("click", function(ev){ if (ev.target && ev.target.id === "dvre"){ ST = {n: 0, pick: [], done: false}; keep(); draw(); window.scrollTo({top: 0, behavior: "smooth"}); } });
    opLoadIdx().then(function(){ setTimeout(function(){ try { phonIndex(); } catch(x) {} }, 300); if (ST.n && ST.pick.filter(Boolean).length) draw(); }).catch(function(){});
  };

  (function(){ var st = document.createElement("style"); st.textContent =
    ".dv-p{font-size:14px;color:var(--sub);line-height:1.55;margin:0 0 12px;word-break:keep-all}.dv-sub{font-size:12.5px;color:var(--sub);font-weight:700;margin:16px 0 6px}" +
    ".dv-ns{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.dv-ns button{border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:12px 0;font:inherit;font-size:15px;font-weight:700;cursor:pointer}" +
    ".dv-ns button.on{background:var(--text);color:var(--panel);border-color:var(--text)}.dv-ask.sm{padding:12px 16px}.dv-ask.sm h3{font-size:13px;color:var(--sub);margin:0 0 8px}.dv-ask.sm .dv-ns button{padding:7px 0;font-size:13.5px}" +
    ".dv-ex{display:grid;gap:6px}.dv-ex button{text-align:left;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:10px 12px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}.dv-ex small{display:block;font-weight:400;font-size:12.5px;color:var(--sub);margin-top:2px}" +
    ".dv-slot{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}.dv-slot>i{flex:0 0 26px;height:26px;border-radius:50%;color:#fff;font-style:normal;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin-top:8px}" +
    ".dv-in{flex:1;min-width:0;position:relative}.dv-in input{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:11px 12px;font:inherit;font-size:16px}" +
    ".dv-sug{max-height:330px;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.dv-sug button{display:flex;width:100%;text-align:left}.dv-more{font-size:12px;color:var(--sub);margin:6px 4px 2px;text-align:center}.dv-got{flex:1;min-width:0;padding-top:4px}.dv-got b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-got small{color:var(--sub);font-size:12.5px}" +
    ".dv-x{flex:0 0 36px;height:36px;border:0;background:none;color:var(--sub);font-size:16px;cursor:pointer;margin-top:2px}" +
    ".dv-go{display:block;width:100%;margin-top:14px;border:0;border-radius:14px;padding:14px;font:inherit;font-size:16px;font-weight:800;background:var(--acc,#3b7ddd);color:#fff;cursor:pointer}.dv-go[disabled]{background:var(--panel2);color:var(--dim,#888);cursor:default;font-weight:600;font-size:14px}" +
    ".dv-big{font-size:21px;font-weight:800;line-height:1.35;margin:2px 0 6px;word-break:keep-all}.dv-say{font-size:15px;line-height:1.55;margin:0;word-break:keep-all;color:var(--sub)}.dv-say b{color:var(--text)}" +
    ".dv-chips{display:flex;flex-direction:column;gap:6px;margin-top:12px}.dv-chips span{font-size:13px;background:var(--panel2,rgba(127,127,127,.08));border-radius:10px;padding:8px 10px;line-height:1.4;word-break:keep-all}" +
    ".dv-bar{display:grid;grid-template-columns:minmax(0,38%) 1fr auto;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--line);cursor:pointer}.dv-bar:last-of-type{border:0}" +
    ".dv-bl b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-bl .tk{display:block;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-bt{height:14px;background:var(--panel2,rgba(127,127,127,.1));border-radius:7px;overflow:hidden}.dv-bf{height:100%;border-radius:7px}" +
    ".dv-bv{text-align:right;min-width:64px}.dv-bv b{display:block;font-size:15.5px;font-weight:800;white-space:nowrap}.dv-bv small{font-size:12px;color:var(--sub)}" +
    ".dv-ft{font-size:12px;color:var(--sub);line-height:1.55;margin:10px 0 0;word-break:keep-all}" +
    ".dv-ax{display:grid;grid-template-columns:repeat(12,1fr);font-size:11px;color:var(--sub);text-align:center;margin:0 0 4px}.dv-ax .now{color:var(--text);font-weight:800}.dv-ax .ny{border-left:1px dashed var(--line)}" +
    ".dv-cr{padding:6px 0 8px;border-bottom:1px solid var(--line)}.dv-cr:last-of-type{border:0}.dv-cn{display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;min-width:0}.dv-cn i,.dv-t th i,.dv-d summary i{flex:0 0 9px;width:9px;height:9px;border-radius:50%;display:inline-block}" +
    ".dv-cn b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.dv-cn span{color:var(--sub);font-size:12px;white-space:nowrap;margin-left:auto}.dv-cs{width:100%;height:34px;display:block}" +
    ".dv-tw{overflow-x:auto;margin:0 -16px;padding:0 16px;-webkit-overflow-scrolling:touch}.dv-t{border-collapse:collapse;font-size:13px;min-width:100%}.dv-t th,.dv-t td{padding:8px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}" +
    ".dv-t th{font-size:12.5px;vertical-align:bottom;cursor:pointer;max-width:110px;overflow:hidden;text-overflow:ellipsis}.dv-t th i{margin-right:4px}.dv-t th .tk{display:block;font-weight:400;max-width:110px;overflow:hidden;text-overflow:ellipsis}" +
    ".dv-t td:first-child,.dv-t th:first-child{text-align:left;position:sticky;left:0;background:var(--panel);color:var(--sub);font-weight:600;z-index:1}.dv-t td.win{color:#199e70;font-weight:800}" +
    ".dv-d{border-bottom:1px solid var(--line);padding:4px 0}.dv-d:last-of-type{border:0}.dv-d summary{display:flex;align-items:center;gap:7px;padding:9px 0;cursor:pointer;list-style:none;font-size:14.5px}.dv-d summary::-webkit-details-marker{display:none}" +
    ".dv-d summary b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.dv-d summary .tk{font-size:11.5px;flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-d summary b{flex:0 0 auto;max-width:55%}.dv-d summary span{margin-left:auto;font-weight:800;white-space:nowrap;flex:0 0 auto}.dv-sp{width:100%;height:auto;display:block;margin:4px 0 8px}" +
    ".dv-kv div{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:13px;border-top:1px dashed var(--line)}.dv-kv small{color:var(--sub);flex:0 0 auto;font-size:12.5px}.dv-kv b{text-align:right;font-weight:600;word-break:keep-all}" +
    ".dv-op{display:block;width:100%;margin:8px 0 6px;border:1px solid var(--line);background:none;color:var(--text);border-radius:10px;padding:9px;font:inherit;font-size:13px;cursor:pointer}" +
    ".dv-note{font-size:12px;color:var(--sub);line-height:1.6;margin:4px 8px 10px;word-break:keep-all}.dv-again{text-align:center;margin:0 0 18px}.dv-again button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:10px 18px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}" +
    ".dv-send h3{margin-bottom:12px}.dv-f{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub);margin:0 0 10px;white-space:nowrap}.dv-f input{flex:1;min-width:0;font:inherit;font-size:15px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text)}" +
    ".dv-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-4px 0 10px}.dv-rc button,.dv-am button{font:inherit;font-size:13px;font-weight:700;padding:6px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);cursor:pointer}.dv-rc button.on,.dv-am button.on{border-color:var(--acc,#7c9cff);background:rgba(124,156,255,.18)}" +
    ".dv-f2{font-size:13px;color:var(--sub);margin:2px 0 12px}.dv-am{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}.dv-am button{padding:8px 0}" +
    ".dv-mk{display:grid;gap:8px}.dv-mk button{text-align:left;font:inherit;font-size:16px;font-weight:800;padding:13px 14px;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2,transparent);color:var(--text);cursor:pointer}.dv-mk button small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px}.dv-mk button.main{background:#fee500;color:#191919;border-color:#fee500}.dv-mk button.main small{color:#5a4f00}.dv-mk button[disabled]{opacity:.6}" +
    ".dv-st{font-size:12px;color:var(--sub);line-height:1.5;margin:10px 2px 0;word-break:keep-all}" +
    ".dv-sim{margin:12px 0 0;border:1px solid var(--line);border-radius:14px;padding:10px 12px}.dv-sim summary{cursor:pointer;font-size:14.5px;font-weight:800;list-style:none;display:flex;align-items:center;gap:8px}.dv-sim summary::-webkit-details-marker{display:none}.dv-sim[open] summary{margin-bottom:6px}" +
    ".dv-sb{font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;margin-left:auto}.dv-sb.g{background:rgba(25,158,112,.18);color:#3fcf9a}.dv-sb.w{background:rgba(201,133,0,.2);color:#f2c14e}.dv-sb.r{background:rgba(217,89,38,.2);color:#ff8a65}" +
    ".dv-sd{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 10px}.dv-sd label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub)}.dv-sd input{font:inherit;font-size:14px;padding:8px 9px;border-radius:10px;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);min-width:0}" +
    ".dv-rv{display:block;width:100%;text-align:left;font:inherit;font-size:15px;font-weight:800;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--panel2,transparent);color:var(--text);cursor:pointer}.dv-rv small{display:block;font-size:12px;font-weight:500;color:var(--sub);margin-top:2px}" +
    "@media(max-width:360px){.dv-ns{grid-template-columns:repeat(3,1fr)}}";
    document.head.appendChild(st); })();
})();
;
/* ======== verdict.js ======== */
/* CH Investing — 🧭 오늘의 결론 하나로 (11/10 냉정 분석 3차 #1)
   문제: 첫 화면 「현금 100%까지」(코스피 하락장) ↔ 뭐 살까? 「현금 0%」(S&P 기준 배분표) ↔ 계기판 「🟢 S&P 정상」 — 판정 3개가 따로 놀아 PB가 그대로 못 전함.
   풀이: 둘 다 맞는 말임. 포트(배분표)는 해외 ETF 위주라 국내 주식 칸이 없음 → 「국내 주식」과 「해외 주식(포트)」을 나눠 한 줄씩.
   쓰는 곳: 쉬운 화면 첫 상자 · 전체 메뉴 홈 첫 카드 · 뭐 살까? 첫 카드 · 오늘 한 장  →  자리에 <div data-vd></div> 만 두면 여기서 채움 */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var V = null, P = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v){ return v == null ? "" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(0) + "%"; }
  var ST = {"🐻": ["dn", "하락장"], "🟡": ["yl", "조정"], "🟢": ["up", "정상"]};
  function load(){
    if (P) return P;
    var t = Math.floor(Date.now() / 600000);
    P = Promise.all([getJSON(RM + "bear.json?" + t, {ttl: 600000}).catch(function(){ return null; }), getJSON(RM + "port.json?" + t, {ttl: 600000}).catch(function(){ return null; })])
      .then(function(r){ V = build(r[0], r[1]); setTimeout(function(){ P = null; }, 600000); return V; });
    return P;
  }
  function build(B, PO){
    if (!B || !B.markets) return null;
    var M = {}; B.markets.forEach(function(m){ M[m.key] = m; });
    var k = M.kospi, s = M.sp500, cash = null;
    try { (PO.hold || []).forEach(function(h){ if (/현금/.test(h.name)) cash = (cash || 0) + (+h.pct || 0); }); } catch(x) {}
    if (!k || !s) return null;
    function line(m, isPort){
      var st = ST[m.state] || ["", m.state];
      var act = isPort
        ? (m.cash ? "주식 줄이고 " + (m.to || "현금") + " " + m.cash + "%까지" : "배분표 그대로" + (cash != null ? " · 현금 " + Math.round(cash) + "%" : ""))
        : (m.to ? (m.cash ? "주식 몫 " + m.cash + "% " + m.to + "으로 · 바닥 신호 3개면 복귀" : "배분표 그대로") : m.state === "🐻" ? "현금 " + (m.cash || 30) + "%까지 · 새로 사지 않기" : m.state === "🟡" ? "현금 " + (m.cash || 10) + "% · 추격 금지" : "현금 늘릴 필요 없음");
      return {c: st[0], st: m.state + " " + st[1], dd: m.dd, act: act, idx: m.name};
    }
    var o = {kr: line(k, false), us: line(s, true), asof: k.asof || s.asof};
    // 🔁 11/12 닮은 장 규칙 — 국내 주식 줄은 코스피·코스닥을 따로 (사용자 「코스닥 사라고 하고 이러면 이상하지 않니?」)
    function an(m){ var a = m && m.analog; if (!a) return null; return m.name + " 주식 " + a.stock + "%" + (a.stock < 100 ? " · " + a.next.replace(/ 위로 올라오면.*$/, a.stock ? " 넘으면 더 사기" : " 넘으면 사기").replace(/^월말 종가가 /, "") : ""); }
    var ka = an(k), qa = an(M.kosdaq);
    if (ka || qa) o.kr.act = [ka, qa].filter(Boolean).join(" / ");
    if (s.analog) o.us.act = s.analog.stock >= 100 ? "배분표 그대로" + (cash != null ? " · 현금 " + Math.round(cash) + "%" : "") : "주식 " + s.analog.stock + "% · " + s.analog.next;
    o.split = k.state !== s.state;
    o.text = "🇰🇷 국내 주식: " + o.kr.st + " → " + o.kr.act + "\n🌏 해외 주식(포트): S&P500 " + o.us.st + " → " + o.us.act;
    return o;
  }
  function html(o){
    if (!o) return "";
    function row(f, lab, idx, L){ return '<div class="vd-r ' + L.c + '"><span class="vd-f">' + f + '</span><span class="vd-l"><b>' + lab + ' <small>' + e(idx) + ' ' + e(L.st) + ' · 고점 ' + sg(L.dd) + '</small></b><em>→ ' + e(L.act) + '</em></span></div>'; }
    return '<div class="vd-in"><div class="vd-h">🧭 오늘의 결론 <small>' + (o.asof ? Number(o.asof.slice(5, 7)) + "/" + Number(o.asof.slice(8)) + " 종가 판정" : "종가 판정") + '</small></div>' +
      row("🇰🇷", "국내 주식", o.kr.idx, o.kr) + row("🌏", "해외 주식(포트)", o.us.idx, o.us) +
      (o.split ? '<p class="vd-n">포트는 해외 ETF 위주라 국내 판정과 따로 움직여요 — 국내 주식 가진 고객은 🇰🇷 줄, 해외·연금 ETF는 🌏 줄</p>' : '') + '</div>';
  }
  function fill(){
    var L = document.querySelectorAll("[data-vd]:not([data-vdok])"); if (!L.length) return;
    load().then(function(o){ if (!o) return; [].forEach.call(document.querySelectorAll("[data-vd]:not([data-vdok])"), function(x){ x.innerHTML = html(o); x.setAttribute("data-vdok", "1"); x.classList.add("vd"); }); });
  }
  window.__vdText = function(){ return load().then(function(o){ return o ? o.text : ""; }); };
  window.__vd = function(){ return V; };
  window.__vdLoad = load;
  var t = 0; new MutationObserver(function(){ clearTimeout(t); t = setTimeout(fill, 60); }).observe(document.documentElement, {childList: true, subtree: true});
  (function(){ var st = document.createElement("style"); st.textContent =
    ".vd{margin:10px 0;text-align:left}.vd .vd-in *{letter-spacing:normal}.vd .vd-h,.vd .vd-h small{font-size:13px!important;line-height:1.4!important}.vd .vd-h small{font-size:12px!important}.vd .vd-l b{font-size:14px!important;line-height:1.35!important;font-weight:800!important}.vd .vd-l b small{font-size:12px!important;font-weight:500!important}.vd .vd-r em{font-size:14px!important}.vd .vd-n{font-size:12px!important;line-height:1.5!important;color:var(--sub)!important;margin:6px 0 0!important}.vd .vd-f{font-size:20px!important}" +
    ".vd-in{border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:var(--panel)}" +
    ".vd-h{font-size:13px;font-weight:800;margin:0 0 4px;display:flex;justify-content:space-between;align-items:baseline}.vd-h small{font-weight:500;color:var(--sub);font-size:12px}" +
    ".vd-r{display:flex;align-items:center;gap:9px;padding:7px 0;border-top:1px solid var(--line)}.vd-f{font-size:20px;flex:0 0 auto}" +
    ".vd-l{flex:1;min-width:0}.vd-l b{display:block;font-size:14px;line-height:1.35;color:var(--text)}.vd-l b small{font-size:12px;font-weight:500;color:var(--sub);white-space:nowrap}" +
    ".vd-r em{display:block;font-style:normal;font-size:14px;font-weight:800;margin-top:2px;word-break:keep-all;line-height:1.4}" +
    ".vd-r.dn em{color:var(--down)}.vd-r.yl em{color:#d08a00}.vd-r.up em{color:var(--text)}" +
    ".vd-n{margin:6px 0 0;font-size:12px;line-height:1.5;color:var(--sub);word-break:keep-all}";
    document.head.appendChild(st); })();
})();
;
/* ======== mine.js ======== */
/* CH Investing — 홈 4장 (11/10 냉정 분석 3차 · 사용자 「모든 걸 허락하고 다 실행」)
   #7 ⭐ 내 종목 — 관심종목 등락·수급·뉴스·실적일 한 화면 (네이버증권식 · 「내 것」이 있어야 매일 옴)
   #8 ⚡ 왜 움직였나 — 오늘 ±5% 넘게 움직인 대형주·관심종목에 이유 한 줄 (뉴스 제목 · 없으면 수급)
   #9 📅 이번 주 — 경제 지표(미·한·중·일 중요) + 대형주·포트·관심종목 실적 (cal_week.json)
   #10 💬 고객 질문 10 — 「지금 팔아야 해요?」 같은 질문에 오늘 숫자로 채운 답 + 카톡 복사
   자리: 쉬운 화면 = 첫 상자 바로 아래 · 전체 메뉴 = 첫 결론 카드 아래. 고객 제안 탭 맨 위·🙋·검색에서도 💬 를 엶. AI·돈 안 씀. */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kd(off){ return new Date(Date.now() + 9 * 3600e3 + (off || 0) * 864e5).toISOString().slice(0, 10); }
  function md(d){ return d ? Number(d.slice(5, 7)) + "/" + Number(d.slice(8, 10)) : ""; }
  function wd(d){ return ["일", "월", "화", "수", "목", "금", "토"][new Date(d + "T00:00:00Z").getUTCDay()]; }
  function won(v){ if (v == null) return "–"; var a = Math.abs(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + (a >= 10000 ? (a / 10000).toFixed(1) + "조" : Math.round(a).toLocaleString() + "억"); }
  function px(v, kr){ return v == null ? "" : kr ? Math.round(v).toLocaleString() + "원" : "$" + (+v).toFixed(v >= 100 ? 1 : 2); }
  function gj(u, ttl){ return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / (ttl || 300000)), {ttl: ttl || 300000}).catch(function(){ return null; }); }
  function EZ(){ return document.documentElement.getAttribute("data-ez") === "easy"; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function wl(){ var W = (window.store && store.wl) || {}, L = []; for (var k in W) L.push({k: k, n: (W[k] && W[k].n) || k}); return L; }
  function code6(k){ var m = /^(\d{6})/.exec(String(k)); return m ? m[1] : null; }
  function tick(k){ return String(k).replace(/\.(KS|KQ)$/, ""); }

  var DATA = null, DT = 0;
  function load(){
    if (DATA && Date.now() - DT < 120000) return Promise.resolve(DATA);
    return Promise.all([gj("archive/x/wl_live.json", 120000), gj("archive/x/live_px.json", 120000), gj("archive/x/flow_kr.json", 600000), gj("archive/x/cal_week.json", 900000), gj("archive/x/earn_cal.json", 900000)])
      .then(function(r){ DATA = {wl: r[0] || {}, px: r[1] || {}, fl: r[2] || {}, cal: r[3] || {}, ec: r[4] || {}}; DT = Date.now(); return DATA; });
  }
  function flowOf(D, c){ return c ? ((D.fl.stocks || []).filter(function(s){ return s.c === c; })[0] || null) : null; }
  function earnOf(D, k){
    var t = tick(k).toUpperCase(), lim = kd(14), a = (D.cal.earn || []).filter(function(x){ return x.s === t && x.d >= kd(0) && x.d <= lim; })[0];
    if (a) return a.d; var b = ((D.ec.items || []).filter(function(x){ return (x.s === k || x.s === t || tick(x.s) === t) && x.d >= kd(0) && x.d <= lim; })[0]); return b ? b.d : null;
  }

  /* ── #7 ⭐ 내 종목 ── */
  function mineHtml(D){
    var L = wl();
    if (!L.length) return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnwl"><h3>⭐ 내 종목</h3><p class="mn-e">자주 보는 종목을 ⭐ 담아 두면 여기서 매일 <b>등락 · 외국인·기관 수급 · 뉴스 · 실적일</b>을 한 번에 봐요.</p><button type="button" class="mn-btn" data-goto="onepager">🔎 종목 찾아서 ⭐ 담기</button></section>';
    var Q = D.wl.q || {}, P = (D.px.q || {}), live = D.px.date === kd(0);
    var rows = L.slice(0, 12).map(function(o){
      var c = code6(o.k), q = Q[c || tick(o.k)] || Q[o.k] || null, p = null, ch = null;
      if (c && P[c]){ p = P[c][0]; ch = P[c][1]; } else if (q){ p = q.p; ch = q.chg; }
      var f = flowOf(D, c), nw = q && (q.news || [])[0], ed = earnOf(D, o.k), nm = (q && q.n && !/^\d/.test(q.n) ? q.n : o.n) || o.k;
      var sub = [];
      if (f && f.f5 != null) sub.push('🧲 외 <i class="' + cl(f.f5) + '">' + won(f.f5) + '</i> · 기 <i class="' + cl(f.i5) + '">' + won(f.i5) + '</i> (5일)');
      if (ed) sub.push('📅 실적 ' + md(ed) + '(' + wd(ed) + ')');
      var why = ch != null && Math.abs(ch) >= 5 && nw ? '<p class="mn-why">' + (ch > 0 ? "🚀" : "🧊") + ' 왜? ' + e(nw.t) + '</p>' : (nw ? '<p class="mn-nw">📰 ' + e(nw.t) + '</p>' : '');
      return {ch: ch == null ? 0 : Math.abs(ch), h: '<button type="button" class="mn-r" data-mnop="' + e(o.k) + '"><span class="mn-n"><b>' + e(String(nm).slice(0, 18)) + '</b><small>' + e(tick(o.k)) + '</small></span>' + (ch == null ? '<span class="mn-p"><small>시세 다음 갱신 때</small></span>' : '<span class="mn-p"><b class="' + cl(ch) + '">' + sg(ch) + '</b><small>' + px(p, !!c) + '</small></span>') +
        (sub.length ? '<span class="mn-s">' + sub.join(" · ") + '</span>' : '') + why + '</button>'};
    });
    rows.sort(function(a, b){ return b.ch - a.ch; });   // 많이 움직인 것 먼저
    var lim = EZ() ? 4 : 6;
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnwl"><h3>⭐ 내 종목 <span class="mut">' + L.length + '개 · ' + (live ? e(D.px.t || "") + " 실시간" : "마지막 장") + '</span></h3>' +
      rows.slice(0, lim).map(function(r){ return r.h; }).join("") + (rows.length > lim ? '<details class="mn-more"><summary>＋ ' + (rows.length - lim) + '개 더</summary>' + rows.slice(lim).map(function(r){ return r.h; }).join("") + '</details>' : '') + '</section>';
  }

  /* ── #8 ⚡ 왜 움직였나 ── */
  function whyHtml(D){
    var W = (D.wl.why || []).filter(function(w){ return w.day === kd(0); });
    if (!W.length) return "";
    var lim = EZ() ? 3 : 5;
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnwhy"><h3>⚡ 크게 움직인 대형주 — 왜?</h3>' + W.slice(0, lim).map(function(w){
      var f = flowOf(D, w.c), nw = (w.news || [])[0];
      var why = nw ? e(nw.t) : (f && f.f5 != null ? '관련 뉴스 없음 — 외국인 5일 ' + won(f.f5) + ' · 기관 ' + won(f.i5) : '관련 뉴스 없음 — 업종·수급 영향일 수 있어요');
      return '<button type="button" class="mn-r" data-mnop="' + e(w.s) + '"><span class="mn-n"><b>' + e(w.n) + '</b><small>' + e(w.c) + '</small></span><span class="mn-p"><b class="' + cl(w.r) + '">' + sg(w.r) + '</b><small>' + px(w.p, true) + '</small></span><p class="mn-why">' + why + '</p></button>'; }).join("") +
      '<p class="mn-ft">뉴스 제목은 네이버 증권 · 제목이 이유를 다 말해 주진 않아요</p></section>';
  }

  /* ── #9 📅 이번 주 ── */
  function calHtml(D){
    var C = D.cal || {}, t0 = kd(0), mine = {}; wl().forEach(function(o){ mine[tick(o.k).toUpperCase()] = 1; });
    var ev = (C.econ || []).filter(function(x){ return x.d >= t0; }).map(function(x){ return {d: x.d, t: x.t, h: x.f + ' ' + e(x.n) + (x.fc ? ' <small>예상 ' + e(x.fc) + (x.pv ? ' · 이전 ' + e(x.pv) : '') + '</small>' : ''), s: x.f === "🇺🇸" ? 1 : 2}; });
    var er = (C.earn || []).filter(function(x){ return x.d >= t0 && x.d <= kd(7); }).map(function(x){ var my = mine[x.s] || x.w; return {d: x.d, t: x.tm === "장 전" ? "장 전" : x.tm === "장 뒤" ? "장 뒤" : "", h: (my ? "⭐" : "💼") + ' ' + e(x.n.replace(/,? (Inc|Corporation|Corp|Ltd|Holdings|Co)\.?$/i, "")) + ' <small>' + e(x.s) + ' 실적</small>', s: my ? 0 : 3}; });
    var all = ev.concat(er).sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : a.s - b.s; });
    if (!all.length) return "";
    var lim = EZ() ? 4 : 6, days = {};
    function row(x){ var first = !days[x.d]; days[x.d] = 1; return '<div class="mn-cal' + (x.d === t0 ? " today" : "") + '"><span class="mn-cd">' + (first ? (x.d === t0 ? "오늘" : md(x.d) + "(" + wd(x.d) + ")") : "") + '</span><span class="mn-ct">' + (x.t || "") + '</span><span class="mn-ce">' + x.h + '</span></div>'; }
    var h = all.slice(0, lim).map(row).join(""); days = {}; all.slice(0, lim).forEach(function(x){ days[x.d] = 1; });
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mncal"><h3>📅 이번 주 <span class="mut">한국 시각</span></h3>' + h +
      (all.length > lim ? '<details class="mn-more"><summary>＋ ' + (all.length - lim) + '개 더</summary>' + all.slice(lim).map(row).join("") + '</details>' : '') +
      '<p class="mn-ft">⭐ 내 종목 · 💼 대형주·포트 실적 · 미국 장 뒤 실적은 한국 다음 날 아침에 반영 · 일정은 바뀔 수 있어요</p></section>';
  }

  /* ── #10 💬 고객 질문 (11/10 10개 → 11/11 20개 → 11/12 25개 = 기본 20 + 🔥 이슈 5) ── */
  var QD = null;
  function qload(){
    if (QD) return Promise.resolve(QD);
    return Promise.all([gj(RM + "bear.json", 600000), gj(RM + "port.json", 600000), gj("archive/x/flow_kr.json", 600000), gj("archive/x/wl_live.json", 120000), gj("archive/x/live_kr.json", 120000), gj("archive/x/products.json", 1800000), gj(RM + "qa.json", 300000)])
      .then(function(r){ QD = {B: r[0] || {}, P: r[1] || {}, F: r[2] || {}, W: r[3] || {}, L: r[4] || {}, PR: r[5] || {}, QA: r[6] || null}; setTimeout(function(){ QD = null; }, 600000); return QD; });
  }
  function qa(Q){
    var M = {}; (Q.B.markets || []).forEach(function(m){ M[m.key] = m; });
    var k = M.kospi || {}, s = M.sp500 || {}, nq = M.nasdaq || {}, QD = M.kosdaq || null;
    var hold = Q.P.hold || [], pc = function(re){ var t = 0; hold.forEach(function(h){ if (re.test(h.name)) t += +h.pct || 0; }); return Math.round(t * 10) / 10; };
    var cash = pc(/현금/), gold = pc(/^금/), core = pc(/코어/);
    var R = (Q.F.mkt || {}).KOSPI || [], r0 = R[0] || {}, U = Math.abs(r0.f || 0) > 1e6 ? 1e8 : 1, fs = 0; for (var i = 0; i < R.length; i++){ if (R[i].f && (R[i].f > 0) === (r0.f > 0)) fs++; else break; }
    var f20 = 0; R.forEach(function(x){ f20 += (x.f || 0) / U; });
    var topSell = (Q.F.stocks || []).slice().sort(function(a, b){ return (a.f5 || 0) - (b.f5 || 0); }).slice(0, 3).map(function(x){ return x.n; }).join(", ");
    var topBuy = (Q.F.stocks || []).slice().sort(function(a, b){ return (b.f5 || 0) - (a.f5 || 0); }).slice(0, 3).map(function(x){ return x.n; }).join(", ");
    var st = function(m){ return m.state === "🐻" ? "하락장" : m.state === "🟡" ? "조정" : "정상 흐름"; };
    var rb = k.rebounds || {}, bn = k.n || 0;
    var big = ((Q.L.date === kd(0) ? Q.L.value : null) || []).slice(0, 3).sort(function(a, b){ return Math.abs(b.r) - Math.abs(a.r); })[0];
    var bigWhy = big ? ((Q.W.why || []).filter(function(w){ return w.c === big.s.slice(0, 6); })[0] || {}) : {}, bf = big ? (Q.F.stocks || []).filter(function(x){ return x.c === big.s.slice(0, 6); })[0] : null;
    var fx = Q.W.fx || {}, krw = (Q.PR.krw || []).filter(function(b){ return b.kind === "국채" && b.after; }).sort(function(a, b){ return b.after - a.after; })[0], y10 = ((Q.PR.ust_hist || {}).y10 || []).slice(-1)[0];
    var y10p = ((Q.PR.ust_hist || {}).y10 || []).slice(-21)[0];
    var out = [];
    out.push(["지금 팔아야 해요?", k.state === "🐻"
      ? "국내 주식은 코스피가 고점보다 " + sg(k.dd, 0) + "로 하락장이에요. " + (k.analog ? "규칙상 코스피 몫은 주식 " + k.analog.stock + "%(" + k.analog.next + ")" + (QD && QD.analog ? ", 코스닥 몫은 주식 " + QD.analog.stock + "%예요" : "예요") + ". 줄일 때도" : "규칙은 국내 주식 몫을 현금 " + (k.cash || 100) + "%까지 줄이는 쪽이지만,") + " 이미 많이 빠진 뒤라 한 번에 던지지 않고 반등 때 나눠서 줄이는 게 원칙이에요. 해외 ETF(S&P500 " + st(s) + ")는 배분 그대로 가져가요."
      : "코스피는 " + st(k) + "(고점 " + sg(k.dd, 0) + "), S&P500은 " + st(s) + "이에요. 규칙상 서둘러 팔 구간은 아니고, 정해 둔 비중에서 크게 벗어난 것만 맞추면 돼요."]);
    out.push(["지금 사도 돼요?", k.state === "🐻"
      ? (k.analog ? "국내 주식은 지금 장과 닮았던 때를 보고 정한 규칙을 따라요. 코스피는 주식 " + k.analog.stock + "% — " + k.analog.next + "." + (QD && QD.analog ? " 코스닥은 주식 " + QD.analog.stock + "% — " + QD.analog.next + "." : "") : "국내 주식은 판정이 풀릴 때(고점 −10% 위 + 200일선 위)까지 새로 사지 않는 규칙이에요. 바닥 신호는 지금 " + bn + "/4개 — 2개 넘게 켜지면 나눠서 담기 시작해요.") + " 해외 ETF는 배분표대로 나눠서 담아도 되는 구간이에요."
      : "한 번에 사기보다 2~3번 나눠서 담는 걸 권해요. 지금 배분표는 지수 ETF(S&P500·나스닥) " + core + "% · 금 " + gold + "% · 현금 " + cash + "%예요."]);
    if (big) out.push([big.n + " 왜 " + (big.r >= 0 ? "올라요?" : "빠져요?"), big.n + "는 오늘 " + sg(big.r) + "예요. " + ((bigWhy.news || [])[0] ? "관련 뉴스: 「" + bigWhy.news[0].t + "」. " : "") +
      (bf ? "최근 5일 외국인 " + won(bf.f5) + ", 기관 " + won(bf.i5) + " 순매수였어요." : "") + " 하루 등락보다는 실적·업황 흐름으로 판단하는 게 좋아요."]);
    if (r0.f != null) out.push(["외국인은 왜 " + (r0.f >= 0 ? "사요?" : "팔아요?"), "코스피에서 외국인은 " + Number(r0.d.slice(5, 7)) + "/" + Number(r0.d.slice(8)) + " 하루 " + won(r0.f / U) + (fs >= 2 ? "(" + fs + "일째)" : "") + ", 최근 20일 합계 " + won(f20) + "예요. 5일 동안 가장 많이 판 종목은 " + topSell + ", 많이 산 종목은 " + topBuy + "예요. " +
      "다만 10년치를 돌려 보면 외국인·기관을 따라 사는 건 수익으로 이어지지 않았어요 — 흐름 참고용이에요."]);
    out.push(["미국 주식은 괜찮아요?", "S&P500은 고점보다 " + sg(s.dd, 1) + "로 " + st(s) + "이고, " + (s.close && s.m200 ? (s.close > s.m200 ? "장기 평균선(200일) 위에 있어요." : "장기 평균선(200일) 아래로 내려왔어요.") : "") + " 나스닥은 " + sg(nq.dd, 1) + "(" + st(nq) + "). 규칙상 해외 ETF 비중은 " + (s.cash ? "주식 몫 " + s.cash + "%를 " + (s.to || "현금") + "으로 옮기는 구간이에요(바닥 신호 3개 켜지면 복귀)." : "그대로 유지하는 구간이에요.")]);
    if (k.state === "🐻") out.push(["코스피 바닥은 언제예요?", "바닥을 미리 맞히는 방법은 없어요. 대신 규칙으로 봐요 — 이번 하락장(" + md(rb.from) + "~)에서 하루 +3% 넘는 반등이 " + (rb.n || 0) + "번 있었고 그중 " + (rb.broke || 0) + "번은 20일 안에 저점을 다시 깼어요. " + (k.analog ? "규칙상 다음 단계: " + k.analog.next + " (지금 장과 닮았던 과거 12번에서 가장 나았던 방식)." : "바닥 신호 4개 중 " + bn + "개가 켜져 있고, 2개가 넘으면 나눠 담기를 시작해요.")]);
    out.push(["현금은 얼마나 들고 있어야 해요?", "국내 주식 몫은 " + (k.analog ? "코스피 현금 " + k.cash + "%" + (QD && QD.analog ? " · 코스닥 현금 " + QD.cash + "%" : "") + "(🔁 닮은 장 규칙)" : k.cash ? "지금 규칙상 현금 " + k.cash + "%까지" : "따로 현금을 늘릴 필요는 없어요") + ". 해외 ETF 포트는 현금 " + cash + "% · 금 " + gold + "%예요. 고객 성향(안정형일수록 더 많이)에 맞춰 조절해요."]);
    if (gold) out.push(["금 지금 사도 돼요?", "지금 배분표의 금 비중은 " + gold + "%예요. 금은 주식이 흔들릴 때 덜 빠지는 방패 역할이라 한 번에 크게보다 정해 둔 비중만큼 나눠서 담아요."]);
    var br = (Q.PR.td || []).filter(function(t){ return /Prefixado 2032/.test(t.n); })[0], bfx = ((Q.PR.brl || {}).fx || []), bf1 = bfx.slice(-1)[0], bf0 = bfx.slice(-22)[0];
    if (krw || y10 || br) out.push(["채권 금리 지금 어때요? (한국·미국·브라질)", (krw ? "🇰🇷 국고채는 세후 기준 최고 " + krw.after.toFixed(2) + "%(" + krw.name + ") 수준이에요. " : "") + (y10 ? "🇺🇸 미국 10년 국채 금리는 " + (+y10[1]).toFixed(2) + "%" + (y10p ? "(한 달 전 " + (+y10p[1]).toFixed(2) + "%)" : "") + "예요. " : "") +
      (br ? "🇧🇷 브라질 국채(헤알, 2032년 만기)는 " + br.r.toFixed(2) + "%" + (bf1 && bf0 ? ", 헤알/원은 " + bf1[1].toFixed(1) + "원(한 달 " + sg((bf1[1] / bf0[1] - 1) * 100) + ")" : "") + " — 금리보다 환율 위험을 먼저 봐야 해요(중개 상품이라 고객 요청이 있을 때만 안내·제안 가능). " : "") + "주식이 흔들릴 때 채권 비중을 갖고 있으면 전체 변동이 줄어요."]);
    if (fx.p) out.push(["환율 어디로 가요?", "원/달러는 지금 " + (Math.round(fx.p * 10) / 10).toLocaleString() + "원(" + sg(fx.chg, 2) + ")이에요. 환율 방향은 아무도 맞히기 어려워서, 달러 자산은 한 번에 바꾸기보다 몇 번에 나눠 환전하는 게 원칙이에요."]);
    return out.slice(0, 10);
  }
  /* 💬 11/10 사용자 「답변이 영 시원치 않다 — 네 시황을 반영해서 우와 할 정도로 늘 답해」
     → 답은 매일 아침 시황리포트를 쓰는 Claude 가 그날 시황으로 직접 씀(market-strategy-report market/qa.json · RULES 1-N · 검산 src/qa.py).
       결론 한 문장 → 근거 3(오늘 숫자) → 고객 유형별 행동 → 이 답이 바뀌는 조건 → 다음에 볼 것. 4일 넘게 안 올라오면 예전 틀 답으로 대신. */
  function rich(Q){ var A = Q.QA; if (!A || !(A.items || []).length || !A.date) return null; return (Date.parse(kd(0)) - Date.parse(A.date)) / 864e5 <= 4 ? A : null; }
  function nowStrip(Q){
    var p = [], ix = (Q.L.index || [])[0], fx = Q.W.fx;
    if (ix && Q.L.date) p.push("코스피 " + Math.round(ix.last).toLocaleString() + " <b class=\"" + cl(ix.chg) + "\">" + sg(ix.chg) + "</b>" + (Q.L.date === kd(0) ? "" : " (" + md(Q.L.date) + ")"));
    if (fx && fx.p) p.push("원/달러 " + (Math.round(fx.p * 10) / 10).toLocaleString() + "원");
    var r = ((Q.F.mkt || {}).KOSPI || [])[0]; if (r && r.f != null){ var U = Math.abs(r.f) > 1e6 ? 1e8 : 1; p.push("외국인 <b class=\"" + cl(r.f) + "\">" + won(r.f / U) + "</b> (" + md(r.d) + ")"); }
    return p.length ? '<div class="qa-now">⚡ 지금 · ' + p.join(" · ") + '</div>' : "";
  }
  /* 🙌 11/11 사용자 「질문 20개까지 · 각 답변 닫기 버튼 · 뒤로 버튼 — 편의성」
     → 답마다 「✕ 답 닫기」 · 하나 열면 다른 답은 접힘 · 시트 머리(늘 위에 붙어 있음)에 「← 뒤로」(답이 열려 있으면 「← 질문 목록」) · 휴대폰 뒤로 키도 같은 순서(답 → 시트)
       · 20개라 갈래 칩(전체·주식·금리·환율·상품·연금 — qa.json 의 g)과 질문 번호(Q1~) */
  // 🔥 11/12 사용자 「이슈 질문을 5개로 하고 총 25개」 — qa.json 의 "hot": true = 그날 이슈(매시간 갈아 끼움) · 칩 「🔥 오늘 이슈」로 따로 보기
  var QG = [["all", "전체"], ["hot", "🔥 오늘 이슈"], ["주식", "📈 주식"], ["금리", "💱 금리·환율"], ["상품", "🧺 상품·연금"]];
  var CLS = '<button type="button" class="mn-qc qa-cl" data-qclose="1">✕ 답 닫기</button>';
  function richItem(x, i, open){
    return '<details class="mn-q qa-r" data-g="' + e(x.g || "") + '"' + (x.hot ? ' data-hot="1"' : '') + (open ? " open" : "") + '><summary data-n="' + (i + 1) + '">' + (x.hot ? '<span class="qa-hot">🔥 이슈</span>' : '') + e(x.q) + '<em>' + e(x.a) + '</em></summary><div class="qa-body">' +
      '<p class="qa-a">' + e(x.a) + '</p>' +
      '<ol class="qa-pts">' + (x.pts || []).map(function(p){ return '<li><b>' + e(p.k) + '</b>' + e(p.t) + '</li>'; }).join("") + '</ol>' +
      ((x.act || []).length ? '<div class="qa-act"><small>그래서 이렇게</small>' + x.act.map(function(a){ return '<div><b>' + e(a[0]) + '</b><span>' + e(a[1]) + '</span></div>'; }).join("") + '</div>' : '') +
      (x.flip ? '<p class="qa-flip"><b>🔁 이 답이 바뀌는 조건</b>' + e(x.flip) + '</p>' : '') +
      (x.watch ? '<p class="qa-watch">👀 다음에 볼 것 · ' + e(x.watch) + '</p>' : '') +
      (x.src ? '<p class="qa-src">근거: ' + e(x.src) + '</p>' : '') +
      '<div class="qa-btn"><button type="button" class="mn-qc" data-qcopy="' + i + '" data-qm="s">📋 카톡용(짧게)</button><button type="button" class="mn-qc" data-qcopy="' + i + '" data-qm="f">📋 전체 복사</button><button type="button" class="mn-qc qa-img" data-qimg="' + i + '">🖼 그림 한 장</button>' + CLS + '</div></div></details>';
  }
  function qaChips(Q){
    var A = rich(Q); if (!A) return "";
    var n = {}; A.items.forEach(function(x){ if (x.g) n[x.g] = (n[x.g] || 0) + 1; if (x.hot) n.hot = (n.hot || 0) + 1; });
    if (Object.keys(n).length < 2) return "";
    return '<div class="qa-chips">' + QG.filter(function(g){ return g[0] === "all" || n[g[0]]; }).map(function(g){ return '<button type="button" data-qg="' + g[0] + '"' + (g[0] === "all" ? ' class="on"' : '') + '>' + g[1] + ' ' + (g[0] === "all" ? A.items.length : n[g[0]]) + '</button>'; }).join("") + '</div>';
  }
  function qaN(Q){ var A = rich(Q); return A ? A.items.length : qa(Q).length; }
  function qaList(Q, lim){
    var A = rich(Q);
    if (A) return (lim ? "" : '<p class="qa-meta">📝 ' + md(A.date) + ' ' + e(A.edition || "") + ' 시황으로 쓴 답 · ' + e(String(A.at || "").slice(5).replace("-", "/")) + ' 갱신' + (A.date !== kd(0) ? ' · <b>지난 시황 기준</b>' : '') + '</p>' + nowStrip(Q)) +
      A.items.slice(0, lim || A.items.length).map(function(x, i){ return richItem(x, i, false); }).join("");
    var L = qa(Q);
    return L.slice(0, lim || L.length).map(function(x, i){ return '<details class="mn-q"><summary>' + e(x[0]) + '</summary><p>' + e(x[1]) + '</p><div class="qa-btn"><button type="button" class="mn-qc" data-qcopy="' + i + '">📋 카톡용 복사</button>' + CLS + '</div></details>'; }).join("");
  }
  var NUM = ["①", "②", "③", "④"];
  function copyQ(i, mode){ qload().then(function(Q){
    var A = rich(Q), t, tail = "\n\n※ 참고용 자료이며 투자 권유가 아닙니다. 투자 판단과 책임은 본인에게 있습니다.";
    if (A){ var x = A.items[i]; if (!x) return;
      t = "Q. " + x.q + "\n\n" + x.a + "\n\n" + (x.pts || []).map(function(p, k){ return NUM[k] + " " + p.t; }).join("\n");
      if (mode === "f") t += ((x.act || []).length ? "\n\n[그래서 이렇게]\n" + x.act.map(function(a){ return "· " + a[0] + ": " + a[1]; }).join("\n") : "") + (x.flip ? "\n\n[이 답이 바뀌는 조건]\n" + x.flip : "");
      t += (x.watch ? "\n\n👀 다음에 볼 것: " + x.watch : "") + "\n(" + md(A.date) + " 기준)" + tail;
    } else { var y = qa(Q)[i]; if (!y) return; t = "Q. " + y[0] + "\nA. " + y[1] + tail; }
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ try { toast("📋 복사했어요 — 카톡에 붙여 넣기"); } catch(x2) {} }, function(){ window.prompt("길게 눌러 복사하세요", t); }); }); }
  function qaCard(){
    return '<section class="card mn-c no-clp" data-cz="done" data-xc="1" id="mnqa"><h3>💬 고객이 이렇게 물으면 <span class="mut">오늘 시황으로 쓴 답</span></h3><div id="mnqab"><div class="loading">불러오는 중…</div></div><button type="button" class="mn-btn" data-qaall="1" id="mnqaall">💬 질문 모두 보기</button></section>';
  }
  var QSAVED = null;
  function qaOpenAns(d){ return d.querySelector("details.mn-q[open]"); }
  function qaBk(){ var d = document.getElementById("qasheet"), b = d && d.querySelector(".qa-bk"); if (b) b.textContent = qaOpenAns(d) ? "← 질문 목록" : "← 뒤로"; }
  function qaShut(){                                   // 시트 통째로 닫기 (✕ · 바깥 누르기 · 화면 이동)
    var d = document.getElementById("qasheet"); if (!d) return; d.remove();
    window.removeEventListener("hashchange", qaShut);
    try { if (history.state && history.state.t === "qa") history.back(); } catch(z) {}      // 얹어 둔 기록 하나 걷기
  }
  function qaBack(){                                   // ← 뒤로: 답이 열려 있으면 답만 닫고, 아니면 시트를 닫음
    try { if (history.state && history.state.t === "qa"){ history.back(); return; } } catch(z) {}
    var d = document.getElementById("qasheet"); if (!d) return; var o = qaOpenAns(d);
    if (o){ o.open = false; qaBk(); } else qaShut();
  }
  window.addEventListener("popstate", function(ev){    // 휴대폰 뒤로 키 = ← 뒤로 와 같은 순서 (smooth.js 미리 보기 창과 같은 방식)
    var d = document.getElementById("qasheet");
    if (d){
      var o = qaOpenAns(d);
      if (o){ o.open = false; qaBk(); try { history.pushState({t: "qa", d: ((QSAVED && QSAVED.d) || 0) + 1}, "", location.pathname + location.hash); } catch(z) {} return; }
      d.remove(); window.removeEventListener("hashchange", qaShut);
    }
    if (ev.state && ev.state._qa){ try { history.replaceState(QSAVED, ""); } catch(z) {} if (window.updBack) try { updBack(); } catch(z) {} }
  });
  window.__qaOpen = function(){
    if (document.getElementById("qasheet")) return;
    var d = document.createElement("div"); d.id = "qasheet";
    d.innerHTML = '<div class="qa-in"><div class="qa-h"><div class="qa-ht"><button type="button" class="qa-bk" aria-label="뒤로">← 뒤로</button><b>💬 고객이 이렇게 물으면</b><button type="button" class="qa-x" aria-label="닫기">✕</button></div><small>질문을 누르면 결론 → 근거 3개 → 행동 → 바뀌는 조건</small><div class="qa-cb"></div></div><div class="qa-b"><div class="loading">불러오는 중…</div></div><p class="mn-ft">참고용 · 고객 성향과 기간에 맞춰 조정하세요 · 투자 권유 아님</p></div>';
    document.body.appendChild(d);
    try { QSAVED = history.state;
      history.replaceState(Object.assign({}, QSAVED || {}, {t: "xs", _qa: 1}), "");
      history.pushState({t: "qa", d: ((QSAVED && QSAVED.d) || 0) + 1}, "", location.pathname + location.hash); } catch(z) {}
    window.addEventListener("hashchange", qaShut);
    d.onclick = function(ev){
      if (ev.target === d || ev.target.closest(".qa-x")){ qaShut(); return; }
      if (ev.target.closest(".qa-bk")){ qaBack(); return; }
      var c = ev.target.closest("[data-qg]"); if (!c) return;
      var g = c.dataset.qg; [].forEach.call(d.querySelectorAll("[data-qg]"), function(b){ b.classList.toggle("on", b === c); });
      [].forEach.call(d.querySelectorAll(".qa-b details.mn-q"), function(x){ var hide = g === "hot" ? !x.dataset.hot : g !== "all" && x.dataset.g !== g; x.hidden = hide; if (hide) x.open = false; });
      qaBk(); d.querySelector(".qa-in").scrollTop = 0;
    };
    qload().then(function(Q){ var c = d.querySelector(".qa-cb"); if (c) c.innerHTML = qaChips(Q); var b = d.querySelector(".qa-b"); if (b) b.innerHTML = qaList(Q); var n = d.querySelector(".qa-in"); if (n) n.scrollTop = 0; });
  };
  // 답 하나를 열면 같은 묶음의 다른 답은 접고, 연 질문이 화면 위로 오게
  document.addEventListener("toggle", function(ev){
    var t = ev.target; if (!t || !t.classList || !t.classList.contains("mn-q")) return;
    if (t.open){
      var sm = t.querySelector("summary"), y0 = sm ? sm.getBoundingClientRect().top : 0, sh = !!t.closest("#qasheet");
      [].forEach.call(t.parentNode.querySelectorAll("details.mn-q[open]"), function(o){ if (o !== t) o.open = false; });
      // 🔧 11/12 자가 업그레이드: 위에 열려 있던 답이 접히면 새로 연 질문이 그만큼 위로 끌려 올라가 화면 밖으로 나가던 것(🩺 「지금 사도 돼요?」 367→−80px) → 누른 질문을 손가락 밑 그 자리에 붙잡음
      try { var dy = sm ? sm.getBoundingClientRect().top - y0 : 0; if (Math.abs(dy) > 1){ var sc = t.closest(".qa-in"); if (sc) sc.scrollTop += dy; else window.scrollBy(0, dy); } } catch(z) {}
      // 🔧 11/11 자가 업그레이드: 홈 카드에선 연 질문이 이미 화면 위쪽 60% 안에 있으면 그대로 둠(전엔 「nearest」가 긴 답을 맞추느라 질문을 378→72px 로 끌어올림 — 🩺 건강검진 튐)
      setTimeout(function(){ try { if (!t.open) return; if (sh){ t.scrollIntoView({block: "start", behavior: "smooth"}); return; }
        var y = t.querySelector("summary").getBoundingClientRect().top; if (y < 0 || y > innerHeight * 0.6) t.scrollIntoView({block: "start", behavior: "smooth"}); } catch(z) {} }, 80);
    }
    qaBk();
  }, true);

  /* ── 붙이기 ── */
  function mount(){
    if (cur() !== "home") return;
    var hb = document.getElementById("hmbody"); if (!hb) return;
    var host = document.getElementById("mnbox");
    var anchor = EZ() ? document.getElementById("ezhero") : hb.querySelector(".h2-num");
    if (!anchor) return;
    if (!host || host.dataset.ez !== String(EZ())){
      if (host) host.remove();
      host = document.createElement("div"); host.id = "mnbox"; host.dataset.ez = String(EZ());
      anchor.insertAdjacentElement("afterend", host); host.dataset.t = "0";
    }
    if (Date.now() - (+host.dataset.t || 0) < 90000) return;
    host.dataset.t = String(Date.now());
    load().then(function(D){ var h = document.getElementById("mnbox"); if (!h) return;
      h.innerHTML = mineHtml(D) + whyHtml(D) + calHtml(D) + qaCard();
      qload().then(function(Q){ var b = document.getElementById("mnqab"); if (b) b.innerHTML = qaList(Q, EZ() ? 2 : 3); var a = document.getElementById("mnqaall"); if (a) a.textContent = "💬 " + qaN(Q) + "개 모두 보기"; });
    });
  }
  function propBtn(){
    if (cur() !== "prop") return; var m = document.getElementById("main"); if (!m || document.getElementById("qaprop")) return;
    var hero = m.querySelector(".hero"); if (!hero) return;
    var b = document.createElement("button"); b.type = "button"; b.id = "qaprop"; b.className = "mn-btn qa-prop"; b.innerHTML = "💬 고객이 이렇게 물으면? <small>오늘 시황으로 쓴 답 20개 · 갈래별로 보기 · 카톡 복사</small>";
    b.onclick = window.__qaOpen; hero.insertAdjacentElement("afterend", b);
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-mnop],[data-qcopy],[data-qimg],[data-qaall],[data-qclose]"); if (!t) return;
    ev.stopPropagation();
    if (t.dataset.mnop != null){ if (window.openOP) openOP(t.dataset.mnop); return; }
    if (t.dataset.qcopy != null){ copyQ(+t.dataset.qcopy, t.dataset.qm); return; }
    if (t.dataset.qimg != null){ var qi = +t.dataset.qimg; qload().then(function(Q){ var A = rich(Q), x = A && A.items[qi]; if (x && window.__qaImg) __qaImg(x, A); else try { toast("그림 한 장은 오늘 시황으로 쓴 답에서만 돼요"); } catch(z) {} }); return; }   // 🖼 11/16 답을 그림 한 장으로 (ux1116.js)
    if (t.dataset.qclose){ var dt = t.closest("details"); if (dt){ var y0 = t.getBoundingClientRect().top; dt.open = false;   // 🔧 11/11: 닫은 질문이 「✕ 답 닫기」를 누른 그 자리에 오게(손가락 밑) — 시트 안이면 시트를, 아니면 화면을 굴림
        try { var dy = dt.getBoundingClientRect().top - y0, sc = dt.closest(".qa-in"); if (sc) sc.scrollTop += dy; else window.scrollBy(0, dy); } catch(z) {} } return; }
    if (t.dataset.qaall) window.__qaOpen();
  }, true);
  var MT = 0; new MutationObserver(function(){ clearTimeout(MT); MT = setTimeout(function(){ try { mount(); propBtn(); } catch(x) {} }, 120); }).observe(document.documentElement, {childList: true, subtree: true});
  setInterval(function(){ try { var h = document.getElementById("mnbox"); if (h) h.dataset.t = "0"; mount(); } catch(x) {} }, 180000);

  (function(){ var st = document.createElement("style"); st.textContent =
    "#mnbox .mn-c{margin-top:12px}.mn-c h3 .mut{font-size:12px}.mn-e{font-size:14px;line-height:1.6;color:var(--sub);margin:0 0 10px;word-break:keep-all}.mn-e b{color:var(--text)}" +
    ".mn-btn{display:block;width:100%;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px}.mn-btn small{display:block;font-weight:400;font-size:12px;color:var(--sub);margin-top:2px}" +
    ".qa-prop{margin:0 0 12px;text-align:left;padding:12px 14px;border-color:rgba(124,156,255,.5)}" +
    ".mn-r{display:flex;flex-wrap:wrap;align-items:center;gap:2px 10px;width:100%;padding:10px 0;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);font:inherit;text-align:left;cursor:pointer}.mn-r:last-of-type{border-bottom:0}" +
    ".mn-n{flex:1;min-width:0}.mn-n b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mn-n small{display:block;font-size:12px;color:var(--sub)}" +
    ".mn-p{flex:0 0 auto;text-align:right;line-height:1.25}.mn-p b{display:block;font-size:16px;font-weight:800}.mn-p small{font-size:12px;color:var(--sub)}" +
    ".mn-s{flex:1 0 100%;font-size:12.5px;color:var(--sub);margin-top:3px}.mn-s i{font-style:normal;font-weight:700}" +
    ".mn-why,.mn-nw{flex:1 0 100%;margin:4px 0 0;font-size:13px;line-height:1.45;word-break:keep-all;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.mn-why{font-weight:700}.mn-nw{color:var(--sub)}" +
    "#mnbox .up{color:var(--up)}#mnbox .dn{color:var(--down)}.mn-ft{font-size:12px;color:var(--sub);margin:8px 0 0;line-height:1.5}" +
    ".mn-more summary{cursor:pointer;font-size:13px;color:var(--sub);padding:8px 0 2px;list-style:none;text-align:center}.mn-more summary::-webkit-details-marker{display:none}" +
    ".mn-cal{display:flex;gap:8px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px}.mn-cal:last-of-type{border-bottom:0}.mn-cal.today .mn-cd{color:var(--up);font-weight:800}" +
    ".mn-cd{flex:0 0 66px;white-space:nowrap;font-size:12.5px;font-weight:700;color:var(--sub)}.mn-ct{flex:0 0 46px;font-size:12px;color:var(--sub);white-space:nowrap}.mn-ce{flex:1;min-width:0;line-height:1.4;word-break:keep-all}.mn-ce small{color:var(--sub);font-size:12px}" +
    ".mn-q{border-bottom:1px solid var(--line);padding:2px 0}.mn-q summary{cursor:pointer;font-size:14.5px;font-weight:700;padding:9px 0;list-style:none}.mn-q summary::-webkit-details-marker{display:none}.mn-q summary:before{content:'Q. ';color:var(--acc,#7c9cff)}" +
    ".mn-q p{margin:0 0 8px;font-size:14px;line-height:1.65;color:var(--text);word-break:keep-all}.mn-qc{border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;margin:0 0 8px;cursor:pointer}" +
    ".qa-r summary em{display:block;font-style:normal;font-weight:500;font-size:13px;line-height:1.5;color:var(--sub);margin-top:3px;word-break:keep-all}.qa-r[open] summary em{display:none}.qa-r summary:before{content:'Q' attr(data-n) '. ';color:var(--acc,#7c9cff)}" +
    ".qa-body{padding:0 0 12px}.qa-a{font-size:16px!important;font-weight:800;line-height:1.55!important;margin:2px 0 10px!important;padding:11px 13px;border-radius:12px;background:color-mix(in srgb,var(--acc,#7c9cff) 13%,transparent);word-break:keep-all}" +
    ".qa-pts{list-style:none;margin:0 0 10px;padding:0;counter-reset:q}.qa-pts li{counter-increment:q;position:relative;padding:8px 0 8px 30px;border-bottom:1px solid var(--line);font-size:14px;line-height:1.6;word-break:keep-all}.qa-pts li:last-child{border-bottom:0}" +
    ".qa-pts li:before{content:counter(q);position:absolute;left:0;top:9px;width:21px;height:21px;border-radius:50%;background:var(--text);color:var(--panel,#fff);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}" +
    ".qa-pts li b{display:inline-block;font-size:12px;font-weight:800;padding:1px 7px;border-radius:999px;border:1px solid var(--line);margin-right:6px;vertical-align:1px;white-space:nowrap}" +
    ".qa-act{border:1px solid var(--line);border-radius:12px;padding:9px 12px;margin:0 0 10px}.qa-act small{display:block;font-size:12px;font-weight:800;color:var(--sub);margin-bottom:2px}.qa-act div{padding:6px 0;border-bottom:1px dashed var(--line);font-size:13.5px;line-height:1.5;word-break:keep-all}.qa-act div:last-child{border-bottom:0}" +
    ".qa-act div b{display:block;font-size:13px}.qa-act div span{color:var(--text)}" +
    ".qa-flip{font-size:13.5px!important;line-height:1.6!important;margin:0 0 8px!important;padding:9px 12px;border-radius:12px;background:color-mix(in srgb,#f0a020 14%,transparent);word-break:keep-all}.qa-flip b{display:block;font-size:12.5px;margin-bottom:2px}" +
    ".qa-watch{font-size:13px!important;margin:0 0 4px!important;line-height:1.5!important;color:var(--text)}.qa-src{font-size:12px!important;color:var(--sub)!important;margin:0 0 8px!important;line-height:1.5!important}.qa-btn{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.qa-btn .mn-qc{margin:0;min-height:34px}.qa-btn .qa-cl{margin-left:auto;border-color:var(--text);font-weight:800}.mn-q>.qa-btn{margin:0 0 10px}.mn-q[hidden]{display:none}" +
    ".qa-meta{font-size:12.5px;color:var(--sub);margin:0 0 6px;line-height:1.5}.qa-meta b{color:var(--up)}.qa-now{font-size:13px;line-height:1.5;padding:8px 11px;border-radius:10px;background:var(--panel2,rgba(127,127,127,.08));margin:0 0 6px}.qa-now .up{color:var(--up)}.qa-now .dn{color:var(--down)}" +
    "#qasheet{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}.qa-in{background:var(--bg,var(--panel));width:100%;max-width:560px;max-height:88vh;overflow:auto;border-radius:20px 20px 0 0;padding:16px 16px calc(20px + env(safe-area-inset-bottom))}" +
    "#qasheet .qa-in{padding-top:0}.qa-h{position:sticky;top:0;z-index:3;background:var(--bg,var(--panel));margin:0 -16px 8px;padding:12px 16px 9px;border-bottom:1px solid var(--line);border-radius:20px 20px 0 0}.qa-ht{display:flex;align-items:center;gap:8px;margin-bottom:3px}" +
    ".qa-ht b{flex:1;min-width:0;font-size:16.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qa-h small{display:block;color:var(--sub);font-size:12.5px}" +
    ".qa-bk{flex:0 0 auto;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);height:36px;padding:0 12px;border-radius:999px;font:inherit;font-size:13.5px;font-weight:800;white-space:nowrap;cursor:pointer}" +
    ".qa-x{flex:0 0 auto;border:0;background:var(--panel2,rgba(127,127,127,.14));color:var(--text);width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer}" +
    ".qa-hot{display:inline-block;margin-right:6px;font-size:12px;font-weight:800;color:#fff;background:#f04452;border-radius:6px;padding:1px 6px;vertical-align:1px}" +
    ".qa-chips{display:flex;gap:6px;overflow-x:auto;padding-top:8px;scrollbar-width:none}.qa-chips::-webkit-scrollbar{display:none}.qa-chips button{flex:0 0 auto;border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:999px;height:32px;padding:0 12px;font:inherit;font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer}" +
    ".qa-chips button.on{background:var(--text);color:var(--bg,var(--panel,#fff));border-color:var(--text)}#qasheet .mn-q{scroll-margin-top:148px}#mnqab .mn-q{scroll-margin-top:70px}";
    document.head.appendChild(st); })();
})();
;
/* ======== products.js ======== */
/* CH Investing — 🛍️ 상품: 미래에셋증권이 지금 파는 채권 · 펀드 · ELS (archive/x/products.json, products.yml 하루 3번 · 🇧🇷 브라질 실시간 금리·달러채 archive/x/brl_live.json 평일 20분마다)
   10/16 사용자: 「상품 카테고리 — 국채·미국채·브라질국채 / 펀드·사모펀드(수익률 순위) / ELS — 하위 3개 · 기존 카테고리 형식과 비슷하게」
   세 탭: bond(🏦 채권) · fund(📦 펀드) · els(🎯 ELS). 숫자는 미래에셋 공개 화면에서 받은 그대로 — 사라는 뜻 아님. */
(function(){
  var e = V.e, cls = V.cls, fmt = V.fmt;
  var SEL = {}, PER = "m3";
  try { SEL = JSON.parse(localStorage.getItem("prodsel") || "{}"); PER = localStorage.getItem("prodper") || "m3"; } catch(x) {}
  function keep(){ try { localStorage.setItem("prodsel", JSON.stringify(SEL)); localStorage.setItem("prodper", PER); } catch(x) {} }
  function card(t, b, x, id){ return '<section class="card"' + (id ? ' id="' + id + '"' : '') + '>' + (t ? '<h3>' + t + (x || "") + '</h3>' : '') + b + '</section>'; }
  function P(){
    // 🇧🇷 10/21: 브라질 실시간 금리(archive/x/brl_live.json, 평일 20분마다)를 함께 — 못 받아도 상품 화면은 그대로
    return Promise.all([getJSON("archive/x/products.json?" + Math.floor(Date.now() / 300000), {ttl: 300000}),
      getJSON("archive/x/brl_live.json?" + Math.floor(Date.now() / 60000), {ttl: 60000}).catch(function(){ return null; })])
      .then(function(a){ var D = a[0]; if (D && a[1]) D.live = a[1]; return D; });
  }
  function pc(v, d){ return v == null ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function sg(v, d){ return v == null ? "–" : '<b class="' + cls(v) + '">' + (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 1 : d) + "%</b>"; }
  function md(d){ return d ? String(d).slice(5).replace("-", "/") : ""; }
  function yrs(r){ return r.yrs + "년" + (r.days ? " " + r.days + "일" : ""); }
  function seg(id, items, on){ return '<div class="seg2" id="' + id + '">' + items.map(function(x){ return '<button' + (x[0] === on ? ' class="on"' : '') + ' data-k="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>'; }
  function bindSeg(id, fn){ var n = document.getElementById(id); if (!n) return; [].forEach.call(n.children, function(b){ b.onclick = function(){ [].forEach.call(n.children, function(x){ x.classList.toggle("on", x === b); }); fn(b.dataset.k); }; }); }
  function holdAt(sel, y){
    var stop = false, t0 = Date.now(), quit = function(){ stop = true; };
    window.addEventListener("touchstart", quit, {once: true, passive: true}); window.addEventListener("wheel", quit, {once: true, passive: true});
    (function f(){ if (stop) return; var n = document.querySelector(sel); if (n){ var d = n.getBoundingClientRect().top - y; if (Math.abs(d) > 1) window.scrollTo({top: window.scrollY + d, behavior: "instant"}); }
      if (Date.now() - t0 < 800) requestAnimationFrame(f); })();
  }
  function line1(vals, labels, opt){ return V.lines([{name: opt.name, color: opt.color || "#7c9cff", vals: vals}], labels, {h: opt.h || 150, endLabels: true, nolegend: true, nodots: true}); }
  function hist(h, n){ h = h || []; return h.slice(-(n || 260)); }
  function lbl(h){ return h.map(function(x){ return x[0].slice(2, 4) + "년 " + (+x[0].slice(5, 7)) + "월"; }); }
  function vals(h){ return h.map(function(x){ return x[1]; }); }
  /* 📘 상품 설명 — 10/16 사용자 「상품들에 대한 자세한 설명도 탭, 접기로」. 중학생도 읽히게 · 사라는 말 없음 */
  var DOC = {
    gov: ["🇰🇷 국고채·국민주택채권이 뭐예요?", "<b>국고채</b>는 대한민국 정부가 돈을 빌리면서 써 주는 차용증이에요. 나라가 망하지 않는 한 이자와 원금을 돌려주니까 우리나라에서 가장 안전한 채권으로 쳐요. <b>국민주택채권</b>은 집을 살 때 의무로 사는 채권이 시장에 나온 것인데 역시 정부가 보증해요.<br><br>" +
      "<b>이름 읽는 법</b> — 「국고채권 01500-5003(20-2)」= 표면금리 1.500%, 만기 2050년 3월, 2020년 두 번째 발행. 표면금리가 낮은 옛날 채권은 값이 싸서(단가 6,049원 = 액면 10,000원짜리를 6,049원에) 만기에 10,000원을 받는 몫이 커요. 이게 <b>세후 수익률</b>이 높은 이유 — 이자(과세)는 적고 차익(비과세)이 크니까.<br><br>" +
      "<b>어떻게 보나</b> — ① <b>세후 수익률</b>: 세금 떼고 1년에 손에 쥐는 비율. ② <b>은행 예금으로 치면</b>: 같은 돈을 예금에 넣었을 때 필요한 세전 금리(비교용). ③ <b>잔존기간</b>: 만기까지 남은 시간 — 길수록 금리가 조금만 움직여도 값이 크게 흔들려요(20년 남은 채권은 금리 1%p 오르면 값이 15% 안팎 빠질 수 있음).<br><br>" +
      "<b>조심할 것</b> — 만기까지 들고 있으면 처음 계산한 수익률 그대로지만, 중간에 팔면 그날 시장 금리로 값이 정해져요. 예금자보호는 없어요(대신 정부 신용). 매수 단위·수수료는 매매 화면에서."],
    ust: ["🇺🇸 미국채가 뭐예요?", "미국 정부가 발행한 채권으로, 세계에서 가장 많이 거래되는 안전자산이에요. 달러로 사고 달러로 이자를 받아요.<br><br>" +
      "<b>이름 읽는 법</b> — 「T 1 1/8 10/31/26」= 미국 국채(T), 표면금리 1.125%(1 1/8), 만기 2026년 10월 31일. <b>시세 수익률</b>이 지금 가격에 사서 만기까지 들면 얻는 연 수익률(달러 기준·세전).<br><br>" +
      "<b>수익은 두 가지</b> — ① 채권 수익률(달러) ② 환율. 1,350원에 사서 1,250원에 돌려받으면 7% 손해, 1,450원이면 7% 이득이 더해져요. 환차익은 비과세, 이자는 15.4% 과세. 표면금리가 낮은 종목(0.375%, 1.125%)은 이자 대신 싸게 사서 만기에 액면을 받는 몫이 커서 세금 면에서 유리해요.<br><br>" +
      "<b>만기 고르기</b> — 1~2년짜리는 금리 변동에 둔감하고 환율만 보면 되고, 10년 넘는 것(2040·2050)은 미국 금리가 내리면 값이 크게 오르고 오르면 크게 빠져요(금리 하락에 거는 투자). 미래에셋은 매일 아침 「미국채 시장동향·판매정보」에 파는 종목과 시세를 올려요. 호주국채도 같은 방식(AUD)."],
    bru: ["🇧🇷 달러표시 브라질국채(글로벌본드)가 뭐예요?", "브라질 정부가 <b>미국 달러</b>로 빌린 채권이에요(국제 시장 발행 · 「글로벌본드」). 헤알 국채와 같은 나라가 갚지만 이자·원금을 <b>달러</b>로 받아요.<br><br>" +
      "<b>헤알 국채와 뭐가 다른가</b> — ① 금리: 헤알 국채는 연 12~13%대, 달러채는 연 5~7%대 — 헤알 환율 위험이 빠진 만큼 낮아요. ② 환율: 헤알이 아니라 <b>원/달러</b>만 신경 쓰면 돼요(미국채와 같은 환율 위험). ③ 위험: 브라질 신용(BB, 투기등급)은 그대로 — 같은 만기 미국채보다 더 주는 몫(<b>가산금리</b>)이 그 위험값이에요.<br><br>" +
      "<b>어떻게 보나</b> — 「시세 수익률」은 지금 가격에 사서 만기까지 들면 얻는 연 수익률(달러·세전). 「미국채 +x%p」가 크게 벌어지면 시장이 브라질 위험을 더 무섭게 본다는 뜻(가격↓), 좁혀지면 그 반대.<br><br>" +
      "<b>세금</b> — 헤알 국채의 개인 비과세(한-브라질 조세협약)가 달러채에도 똑같이 적용되는지는 사기 전에 미래에셋에 꼭 확인하세요. 아래 계산서는 보수적으로 이자 15.4% 과세로 계산했어요. 장외 최소 거래 단위가 큰 종목(액면 20만 달러 등)이 많아 소액은 어려울 수 있어요."],
    brl: ["🇧🇷 브라질국채가 뭐예요?", "브라질 정부가 헤알(BRL)로 발행한 채권이에요. 금리가 연 10%를 넘는 대신 ① 헤알 환율이 크게 흔들리고 ② 신용등급이 BB(투기등급)라 위험이 커요.<br><br>" +
      "<b>왜 인기였나</b> — 한국-브라질 조세협약으로 <b>개인은 이자·매매차익·환차익 모두 비과세</b>예요(법인은 과세). 금융소득종합과세에 안 잡혀서 자산가들이 많이 샀어요. 단, 협약·법이 바뀌면 달라질 수 있어요.<br><br>" +
      "<b>여기서는 이표채(NTN-F)만</b> — 6개월마다(1월·7월 1일) 연 10% 이자를 주는 고정금리 채권이에요. 지금 시장 금리가 10%보다 높으면 액면보다 싸게, 낮으면 비싸게 거래돼요. 할인채(LTN)·물가채(NTN-B)는 목록에서 뺐어요.<br><br>" +
      "<b>환율이 전부</b> — 금리 12%를 받아도 헤알이 12% 떨어지면 원화로는 0이에요. 헤알/원이 쌀 때(아래 차트 낮은 쪽) 사면 환차익이 더해지고, 비쌀 때 사면 금리를 다 까먹을 수 있어요. 2011년 1헤알=700원이던 게 지금 260원대 — 긴 하락이었어요.<br><br>" +
      "<b>미래에셋에서는</b> — 판매가 아니라 <b>단순중개</b>: 홈페이지에 종목표가 없고 MAPS(해외채권 중개)나 영업점에서 종목·금리를 받아요. 수수료 연환산 오프라인 30bp·온라인 15bp. 아래 종목·금리는 브라질 재무부가 매일 공개하는 Tesouro Direto 기준이라 미래에셋 중개 금리와는 조금 다를 수 있어요."],
    oth: ["공사채·회사채·신종자본증권이 뭐예요?", "<b>공사채</b>는 한국전력·도로공사·수자원공사처럼 정부가 뒤에 있는 공기업이 발행한 채권(국채보다 금리 조금 높고 거의 안전). <b>지방채</b>는 서울·부산 같은 지자체(도시철도공채 등). <b>회사채</b>는 일반 기업 — 신용등급(AAA~BBB)이 낮을수록 금리가 높고 부도 위험이 있어요.<br><br>" +
      "<b>신종자본증권·조건부자본증권(코코본드)</b> — 은행·금융지주가 발행하는 「만기 없는(영구) 채권」이에요. 금리가 높은 대신 ① 은행이 부실해지면 원금이 <b>상각(0원)</b>되거나 주식으로 바뀌고 ② 이자 지급이 중단될 수 있고 ③ 보통 5년 뒤 「콜」로 갚지만 안 갚을 수도 있어요. 그래서 「매우높은위험」 표시가 붙어요. 2023년 크레디트스위스 사태 때 실제로 0원이 됐어요.<br><br>" +
      "<b>어떻게 보나</b> — 세후 수익률이 국고채보다 얼마나 높은지(그 차이가 위험의 값), 잔존기간, 위험 등급. 「후순위」는 회사가 망하면 다른 채권자보다 늦게 받는다는 뜻."],
    fund: ["📦 펀드가 뭐예요? (공모 · 사모 · 재간접)", "<b>펀드</b>는 여러 사람 돈을 모아 전문가(운용사)가 대신 투자하는 바구니예요. 바구니 값(기준가)이 매일 바뀌고, 수익률 = 기준가가 얼마나 올랐나.<br><br>" +
      "<b>공모펀드</b> — 누구나 1만원부터 살 수 있고, 금융투자협회에 매일 기준가·수익률을 공시해요. 미래에셋 펀드검색에 1,700여 개.<br>" +
      "<b>사모펀드</b> — 49인 이하(일반투자자)에게만 비공개로 파는 펀드. 일반투자자는 최소 3억원, 운용 전략·보유 종목을 공개 안 해도 되고 규제가 느슨해서 헤지펀드(롱숏·멀티전략)·Pre-IPO·메자닌·코스닥벤처 같은 투자를 해요. 성적을 공개할 의무가 없어서 인터넷에는 성적표가 없어요.<br>" +
      "<b>🔒 사모 라인업</b> — 미래에셋증권이 파는 주요 사모펀드 라인업 화면(사내용)을 옮긴 거라 비밀번호로 잠가 두었어요. 전략별(롱·롱숏·멀티·Pre-IPO·메자닌·공모주하이일드·코스닥벤처·PE)로 걸러 보고, 펀드를 누르면 전략 설명과 연도별 성적이 나와요.<br><br>" +
      "<b>수익률 읽는 법</b> — 기간(3개월·1년·3년)마다 순위가 완전히 달라져요. 1년 +80%는 「작년에 좋았다」지 「내년에도」가 아니에요. 같은 유형끼리 비교(주식형 vs 주식형)하고, <b>순자산</b>이 너무 작은 펀드(10억 미만)는 수익률이 왜곡되기 쉬워 뺐어요. <b>위험 등급</b> 1(매우높음)~6(매우낮음). 수수료 「선취」는 살 때 떼고, 「총보수」는 매년 떼요(온라인 클래스 e 가 보통 싸요).<br><br>" +
      "<b>사모 성적 읽는 법</b> — 운용사 기준가로 계산한 값이라 결산 때 이익을 나눠 주고 기준가가 1,000 근처로 돌아가는 펀드(멀티전략 하우스에 흔함)는 기준가 숫자가 아니라 <b>연도별 수익률</b>로 보세요. Pre-IPO·PE는 평가가 드물게 바뀌어 한동안 0%였다가 한 번에 뛰어요. 달러 펀드는 달러 기준. 「손익차등형 2종」은 후순위(레버리지)라 등락이 커요."],
    els: ["🎯 ELS · ELB · DLS가 뭐예요?", "<b>ELS(주가연계증권)</b>는 「정해진 조건만 지키면 연 X% 줄게」라는 증권사와의 약속이에요. 기초자산(KOSPI200·삼성전자 같은 지수나 주식)이 <b>많이 안 떨어지면</b> 이자를 받고, <b>많이 떨어지면</b> 그만큼 손실이에요. 주식처럼 오르는 만큼 버는 게 아니라, 「안 떨어지는 데」 거는 투자.<br><br>" +
      "<b>스텝다운 읽기</b> — 「85-85-85-80-75-70, KI 45」: 6개월마다 평가해서 기초자산이 처음의 85%(1·2·3차), 80%(4차), 75%(5차), 70%(만기) 위면 그때 이자와 함께 끝(조기상환). 숫자가 낮을수록 상환되기 쉬워요. <b>KI(녹인) 45</b>: 3년 중 한 번이라도 45% 아래로 떨어지면 만기 때 떨어진 만큼 손실(최대 −100%). 기초자산이 여럿이면 <b>가장 못한 것</b> 기준이라 개수가 많을수록 위험해요(그래서 금리도 높음).<br><br>" +
      "<b>ELB</b>는 원금지급형 — 조건이 안 맞아도 원금은 증권사가 줘요(다만 증권사가 망하면 못 받음 · 예금자보호 없음). <b>DLS</b>는 기초자산이 금리·환율·원유 같은 것. <b>월지급식</b>은 매달 이자를 주고, <b>주식지급형</b>은 손실 때 현금 대신 주식으로 줘요.<br><br>" +
      "<b>조심할 것</b> — 연 20%짜리는 그만큼 떨어질 확률이 높다는 뜻(기초자산이 변동성 큰 개별주). 「고난도 상품」은 청약 뒤 숙려기간(하루)이 있어 취소할 수 있어요. <b>모인 돈/한도</b>는 인기 — 한도를 넘으면 배정이 줄어요. 중도 해지는 평가금액의 95% 안팎만 받아요."]
  };
  function doc(k){ var d = DOC[k]; return d ? '<details class="card cpx-d pd-doc"><summary>📘 ' + e(d[0]) + ' <span class="mut">누르면 설명</span></summary><p>' + d[1] + '</p></details>' : ""; }
  var WARN = '<p class="note">미래에셋증권 홈페이지에 공개된 숫자를 그대로 옮긴 거예요. 사라는 뜻이 아니고, 실제 매수 조건(금리·수수료·세금)은 매매 화면에서 다시 확인하세요.</p>';

  /* ───────── 🏦 채권 ───────── */
  function bondView(D){
    var k = SEL.bond || "gov", K = D.krw || [], U = D.ust || {}, A = D.aud || {}, B = D.brl || {};
    var gov = K.filter(function(r){ return r.kind === "국채"; }), oth = K.filter(function(r){ return r.kind !== "국채"; });
    var top = function(a, f){ return a.slice().sort(function(x, y){ return (y[f] || 0) - (x[f] || 0); })[0]; };
    var g1 = top(gov, "after"), u1 = (U.items || []).slice().sort(function(x, y){ return (y.ytm || 0) - (x.ytm || 0); })[0], brl = (B.fx || []).slice(-1)[0], brl0 = (B.fx || []).slice(-2)[0];
    var h = '<div class="mg-kv">' +
      '<div><small>🇰🇷 국고채 세후 최고</small><b class="up">' + (g1 ? pc(g1.after) : "–") + '</b><em>' + (g1 ? e(g1.name) + " · " + yrs(g1) : "") + '</em></div>' +
      '<div><small>🇺🇸 미국채 10년 금리</small><b>' + (U.y10 != null ? pc(U.y10) : "–") + '</b><em>' + (U.y10_prev != null ? "전일 " + pc(U.y10_prev) + " · 환율 " + fmt(U.fx) : "") + '</em></div>' +
      '<div><small>🇺🇸 판매 미국채 최고 수익률</small><b>' + (u1 ? pc(u1.ytm) : "–") + '</b><em>' + (u1 ? e(u1.name) + " · 만기 " + e(u1.mat) : "") + '</em></div>' +
      '<div><small>🇧🇷 헤알/원 환율</small><b>' + (brl ? fmt(brl[1]) : "–") + '</b><em>' + (brl && brl0 ? "하루 " + V.sgn((brl[1] / brl0[1] - 1) * 100, 2) + "% · " + md(brl[0]) : "") + '</em></div></div>';
    h += seg("pdseg", [["gov", "🇰🇷 국채"], ["ust", "🇺🇸 미국채"], ["brl", "🇧🇷 브라질(헤알)"], ["bru", "🇧🇷 브라질(달러)"], ["oth", "공사채·회사채"]], k) + sortBar() + '<div id="pdbody">' + boSlot(k) + bondBody(D, k) + '</div>';
    if (D.notice && D.notice.length) h += '<details class="card cpx-d"><summary>📢 채권 공지 <span class="mut">미래에셋 · 최근 ' + D.notice.length + '건</span></summary>' +
      D.notice.map(function(n){ return '<a class="pd-nt" href="' + e(n.url) + '" target="_blank" rel="noopener"><span class="mut">' + e(n.date || "") + '</span>' + e(n.title) + '</a>'; }).join("") + '</details>';
    return h + WARN;
  }
  /* 🧾 10/16 사용자: 「펀드나 채권 누르면 각각에 대한 설명 혹은 모의 투자계산서 나오게 탭 접기」 — 행을 누르면 그 밑에 설명 + 계산서가 펼쳐짐 */
  var OBJ = {}, OBN = 0, AMT = 1000;
  try { AMT = +localStorage.getItem("prodamt") || 1000; } catch(x) {}
  function reg(kind, o){ var id = "x" + (++OBN); OBJ[id] = {k: kind, o: o}; return ' data-x="' + id + '"'; }
  window.__pdObj = function(id){ return OBJ[id]; };   // 📌 10/22 A10/22-2 관제탑 「담아 두기」 단추(ux1022.js)
  /* 📅 10/21 사용자 「채권 솔팅할 때 만기순으로도 조회 가능하게 탭」 — 채권 모든 칸(국채·미국채·브라질 헤알/달러·공사채)에 같은 정렬 탭
     y = 수익률 높은 순(기본) · m = 만기 빠른 순 · M = 만기 먼 순. 고른 값은 이 기기에 기억 */
  var BSL = {y: "수익률 높은 순", m: "만기 빠른 순", M: "만기 먼 순"};
  function bsk(){ return BSL[SEL.bsort] ? SEL.bsort : "y"; }
  function bs(a, yk, mk){ var k = bsk(); mk = mk || "mat";
    return a.slice().sort(function(x, y){
      if (k === "y") return (y[yk] == null ? -1e9 : y[yk]) - (x[yk] == null ? -1e9 : x[yk]) || String(x[mk]).localeCompare(String(y[mk]));
      var c = String(x[mk] || "").localeCompare(String(y[mk] || "")); return (k === "m" ? c : -c) || (y[yk] || 0) - (x[yk] || 0); }); }
  function sortBar(){ return '<div class="pd-sort"><span class="mut">정렬</span>' + seg("pdbsort", [["y", "💰 수익률순"], ["m", "📅 만기 빠른순"], ["M", "📅 만기 먼순"]], bsk()) + '</div>'; }
  function bondRows(rows, hi){
    if (!rows.length) return '<div class="empty">지금 파는 상품이 없어요.</div>';
    var mx = Math.max.apply(null, rows.map(function(r){ return r.after || 0; }).concat([0.1]));
    return '<div class="pd-list">' + rows.map(function(r, i){
      return '<div class="pd-it pd-tap"' + reg("krw", r) + '><div class="pd-h"><span class="rk">' + (i + 1) + '</span><div class="pd-n"><b>' + e(r.name) + '</b><small>' + e(r.risk) + ' · 잔존 ' + yrs(r) + ' · ' + (/^9999/.test(r.mat) ? '영구채(콜 가능)' : '만기 ' + e(r.mat)) + '</small></div>' +
        '<div class="pd-v"><b class="up">' + pc(r.after) + '</b><small>세후 수익률</small></div></div>' +
        '<div class="pd-bar"><i style="width:' + ((r.after || 0) / mx * 100).toFixed(0) + '%"></i></div>' +
        '<div class="pd-row"><span>매수금리 <b>' + pc(r.buy, 3) + '</b></span><span>은행 예금으로 치면 <b>' + pc(r.bank) + '</b></span><span>단가 <b>' + fmt(r.px) + '</b></span></div></div>';
    }).join("") + '</div>';
  }
  function bondBody(D, k){
    var K = D.krw || [], U = D.ust || {}, A = D.aud || {}, B = D.brl || {}, H = D.ust_hist || {};
    if (k === "gov"){
      var g = bs(K.filter(function(r){ return r.kind === "국채"; }), "after");
      return doc("gov") + card("🇰🇷 국고채·국민주택채권 <span class='mut'>장외채권 · " + (bsk() === "y" ? "세후 수익률 높은" : BSL[bsk()].replace(" 순", "")) + " 순 · " + g.length + "개</span>",
        '<p class="note" style="margin:0 0 10px">「세후 수익률」은 이자 세금(15.4%)을 뗀 뒤 1년에 실제로 손에 쥐는 비율, 「은행 예금으로 치면」은 같은 돈을 예금했을 때 필요한 세전 금리예요. 만기가 긴 국채는 중간에 팔면 값이 크게 움직여요.</p>' + bondRows(g));
    }
    if (k === "ust"){
      var y = hist(H.y10, 260), fx = hist(H.usdkrw, 260), items = bs(U.items || [], "ytm");
      var h = doc("ust") + card("🇺🇸 미래에셋이 파는 미국채 <span class='mut'>" + e(U.date ? md(U.date) + " 판매정보 · " : "") + BSL[bsk()] + "</span>",
        (items.length ? '<div class="pd-list">' + items.map(function(r){
          var yr = Math.max(0, (new Date(r.mat) - Date.now()) / 365.25 / 864e5);
          return '<div class="pd-it pd-tap"' + reg("ust", Object.assign({fx: U.fx}, r)) + '><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' (약 ' + yr.toFixed(1) + '년) · 표면금리 ' + pc(r.cpn, 3) + ' · ' + e(r.cur) + '</small></div>' +
            '<div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>시세 수익률(세전)</small></div></div></div>'; }).join("") + '</div>' : '<div class="empty">오늘 판매정보가 아직 없어요.</div>') +
        '<p class="note">미국채는 달러로 사요 — 수익률은 달러 기준이고, 원화로 바꾸면 환율만큼 더해지거나 빠져요. 이자는 과세(15.4%), 표면금리가 낮은 채권은 이자 대신 싸게 사서 만기에 액면을 받는 몫이 커요. 매일 아침 미래에셋이 올리는 「미국채 시장동향·판매정보」 글에서 가져왔어요' + (U.url ? ' (<a href="' + e(U.url) + '" target="_blank" rel="noopener">원문</a>)' : '') + '.</p>');
      h += ustAll(D);
      h += card("미국 10년 국채 금리 <span class='mut'>1년 · 야후</span>", (y.length > 5 ? line1(vals(y), lbl(y), {name: "10년", color: "#e66767", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 10년 금리 ' + (U.y10 != null ? '<b>' + pc(U.y10) + '</b> (전일 ' + pc(U.y10_prev) + ')' : '–') + '. 금리가 오르면 이미 산 채권 값은 내려가고, 내리면 올라가요 — 만기가 길수록 더 크게.</p>');
      h += card("원/달러 환율 <span class='mut'>1년</span>", (fx.length > 5 ? line1(vals(fx), lbl(fx), {name: "원/달러", color: "#7c9cff", h: 130}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 ' + (U.fx != null ? '<b>' + fmt(U.fx) + '원</b> (전일 ' + fmt(U.fx_prev) + ')' : '–') + '. 달러가 싸질 때 사 두면 환차익, 비쌀 때 사면 환손실이 더해져요.</p>');
      if (A.items && A.items.length) h += '<details class="card cpx-d"><summary>🇦🇺 호주국채도 팔아요 <span class="mut">' + A.items.length + '개 · 10년 ' + pc(A.y10) + '</span></summary><div class="pd-list">' + bs(A.items, "ytm").map(function(r){
        return '<div class="pd-it pd-tap"' + reg("aud", Object.assign({fx: A.fx}, r)) + '><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' · 표면 ' + pc(r.cpn) + ' · AUD</small></div><div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>수익률</small></div></div></div>'; }).join("") +
        '</div><p class="note">호주달러 환율 ' + fmt(A.fx) + '원 · 신용등급 AAA · 이자 과세.</p></details>';
      return h;
    }
    if (k === "bru") return bruBody(D);
    if (k === "brl"){
      var f = hist(B.fx, 260), ub = hist(B.usdbrl, 260), last = f.slice(-1)[0], first = f[0];
      var yr1 = last && first ? (last[1] / first[1] - 1) * 100 : null;
      /* 10/16 사용자 「브라질국채는 할인채랑 물가채 빼」 — LTN(할인채)·NTN-B/NTN-C(물가채) 숨김, 이표채 NTN-F 만 (LFT 는 접어서) */
      var T = (D.td || []).filter(function(x){ return x.code === "NTN-F"; }), TH = {}; Object.keys(D.td_hist || {}).forEach(function(k){ if (/^NTN-F/.test(k)) TH[k] = D.td_hist[k]; });
      var grp = {}; T.forEach(function(x){ (grp[x.kind] = grp[x.kind] || []).push(x); });
      var h = doc("brl") + liveStrip(D) + card("🇧🇷 브라질국채 <span class='mut'>미래에셋 · 단순중개</span>",
        '<div class="pd-brl"><div><small>이자 세금</small><b class="up">비과세</b><em>개인 · 한-브라질 조세협약</em></div><div><small>신용등급</small><b>BB</b><em>투기등급 (국제)</em></div><div><small>통화</small><b>BRL</b><em>헤알 · USD 표시도</em></div><div><small>종류</small><b>NTN-F</b><em>이표채 · 연 10% · 6개월마다 이자</em></div></div>' +
        '<p class="note">미래에셋은 브라질국채를 「판매」가 아니라 <b>단순중개</b>로 다뤄요 — 홈페이지에 매일 파는 종목표가 올라오지 않고, MAPS(해외채권 중개 화면)나 영업점에서 종목·금리를 받아요. 수수료 연환산 오프라인 30bp · 온라인 15bp. 아래 종목·금리는 <b>브라질 재무부(Tesouro Direto)</b>가 매일 공개하는 값이라 미래에셋 중개 호가와는 조금 다를 수 있어요.</p>');
      var AN = D.anb || [], fxb = last ? last[1] : null;
      var brow = function(x){
        var yr = Math.max(0, (new Date(x.mat) - Date.now()) / 365.25 / 864e5);
        return '<div class="pd-it pd-tap"' + reg("brl", Object.assign({fx: fxb}, x)) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.code) + ' ' + e(x.mat.slice(0, 7).replace("-", "/")) + '</b><small>만기 ' + e(x.mat) + ' (약 ' + yr.toFixed(1) + '년) · 단가 R$ ' + fmt(x.pu) + '</small></div>' +
          '<div class="pd-v"><b class="up">' + (x.code === "NTN-B" || x.code === "NTN-C" ? (x.code === "NTN-B" ? "IPCA+" : "IGPM+") : x.code === "LFT" ? "Selic+" : "") + (x.r != null ? x.r.toFixed(x.code === "LFT" ? 3 : 2) + "%" : "–") + '</b><small>' + (x.code === "LTN" || x.code === "NTN-F" ? "연 금리(헤알·고정)" : x.code === "LFT" ? "Selic 가산" : "물가 + 연") + '</small></div></div></div>'; };
      if (AN.length){
        var ag = {}; AN.forEach(function(x){ (ag[x.code] = ag[x.code] || []).push(x); });
        h += card("브라질 이표채(NTN-F) 전 종목 <span class='mut'>" + AN.filter(function(x){ return x.code === "NTN-F"; }).length + "개 · ANBIMA " + e(AN[0].asof) + "</span>",
          ["NTN-F"].filter(function(c){ return ag[c]; }).map(function(c){ return '<div class="sub2">' + e(c) + ' <span class="mut">' + e(ag[c][0].kind) + ' · ' + ag[c].length + '개 · ' + BSL[bsk()] + '</span></div><div class="pd-list">' + bs(ag[c], "r").map(brow).join("") + '</div>'; }).join("") +
          '<p class="note">브라질 금융시장협회(ANBIMA)가 매일 내는 <b>유통시장 지표금리</b> — 시장에서 실제로 거래되는 고정금리 이표채(NTN-F) 전부예요 — 할인채(LTN)·물가채(NTN-B)는 뺐어요. 미래에셋 중개 호가는 이것과 조금 달라요. 종목을 누르면 만기까지 현금흐름이 나와요.</p>') +
          (ag.LFT ? '<details class="card cpx-d"><summary>LFT (Selic 변동금리) ' + ag.LFT.length + '개 <span class="mut">한국 투자자는 거의 안 사요</span></summary><div class="pd-list">' + bs(ag.LFT, "r").map(brow).join("") + '</div></details>' : '');
      } else if (T.length){
        h += card("만기별 브라질 국채 <span class='mut'>" + T.length + "개 · 브라질 재무부</span>", '<div class="pd-list">' + bs(T, "r").map(function(x){ return brow({code: x.code, kind: x.kind, mat: x.mat, pu: x.px, r: x.r, asof: x.asof}); }).join("") + '</div>');
      }
      Object.keys(TH).forEach(function(nm){ var hh = hist(TH[nm], 260); if (hh.length > 5) h += card("브라질 국채 금리 · " + e(nm) + " <span class='mut'>1년 · 연 %</span>", line1(vals(hh), lbl(hh), {name: nm, color: "#d95926", h: 130})); });
      h += card("헤알/원 환율 <span class='mut'>1년 · 원/달러 ÷ 헤알/달러</span>", (f.length > 5 ? line1(vals(f), lbl(f), {name: "헤알/원", color: "#199e70", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
          '<p class="note">지금 <b>' + (last ? fmt(last[1]) + "원" : "–") + '</b>' + (yr1 != null ? ' · 1년 ' + sg(yr1) : '') + '. 브라질국채 수익은 「채권 금리 + 환율」이라 헤알이 싸질 때 사면 환차익 몫이 커지고, 비쌀 때 사면 금리를 받아도 환손실이 더 클 수 있어요.</p>') +
        card("헤알/달러 <span class='mut'>1년 · 숫자가 커지면 헤알 약세</span>", (ub.length > 5 ? line1(vals(ub), lbl(ub), {name: "헤알/달러", color: "#c98500", h: 120}) : '<div class="spark-empty">자료 준비 중</div>'));
      return h;
    }
    var o = bs((D.krw || []).filter(function(r){ return r.kind !== "국채"; }), "after");
    var kinds = {}; o.forEach(function(r){ kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
    return doc("oth") + card("공사채·회사채·신종자본증권 <span class='mut'>장외채권 · " + (bsk() === "y" ? "세후 수익률 높은" : BSL[bsk()].replace(" 순", "")) + " 순 · " + o.length + "개</span>",
      '<div style="margin-bottom:8px">' + Object.keys(kinds).map(function(x){ return '<span class="chip2">' + e(x) + ' ' + kinds[x] + '</span>'; }).join("") + '</div>' +
      '<p class="note" style="margin:0 0 10px">「매우높은위험」으로 표시된 조건부자본증권(신종·후순위)은 은행이 어려워지면 원금을 날릴 수 있어서 금리가 높아요. 위험 등급을 꼭 같이 보세요.</p>' + bondRows(o));
  }

  /* 🇧🇷 10/21 사용자 「달러표시 브라질국채도 다른 것들과 똑같이 · 구분해서 · 실시간 금리 잘 반영」
     archive/x/brl_live.json (brl_live.py · 평일 20분마다): 글로벌본드 전 종목 시세·수익률(TradingView — BONDS.com 실시간 우선) · 같은 만기 미국채 대비 가산금리 · 헤알 10년·환율(CNBC) */
  function ago(at){ if (!at) return ""; var t = Date.parse(at.replace(" ", "T") + ":00+09:00"); if (isNaN(t)) return at; var m = Math.round((Date.now() - t) / 60000); return m < 1 ? "방금" : m < 60 ? m + "분 전" : m < 1440 ? Math.round(m / 60) + "시간 전" : md(at.slice(0, 10)); }
  function qv(q, k){ return q && q[k] ? q[k] : {}; }
  function liveStrip(D){
    var L = D.live; if (!L || !L.q) return "";
    var b = qv(L.q, "BR10Y"), u = qv(L.q, "US10Y"), r = qv(L.q, "BRL="), w = qv(L.q, "KRW=");
    var cell = function(t, v, c, unit, sub){ return '<div><small>' + t + '</small><b>' + (v != null ? (+v).toFixed(unit === "%" ? 3 : 2) + (unit === "%" ? "%" : "") : "–") + '</b><em>' + (c != null ? '<span class="' + cls(c) + '">' + (c > 0 ? "+" : "") + (+c).toFixed(unit === "%" ? 3 : 2) + (unit === "%" ? "%p" : "") + '</span> ' : '') + (sub || "") + '</em></div>'; };
    return '<div class="pd-live"><div class="pd-lh"><span class="pd-dot"></span>실시간 금리 <span class="mut">' + e(ago(L.q_at || L.at)) + ' 받음 · 평일 20분마다</span></div><div class="mg-kv">' +
      cell("🇧🇷 헤알 국채 10년", b.v, b.chg, "%", b.cpn ? "표면 " + e(b.cpn) : "") + cell("🇺🇸 미국채 10년", u.v, u.chg, "%", "") +
      cell("헤알/원", L.brlkrw, null, "", "원/달러 ÷ 헤알/달러") + cell("원/달러", w.v, w.chg, "", "헤알/달러 " + (r.v != null ? (+r.v).toFixed(3) : "–")) + '</div></div>';
  }
  function bruBody(D){
    var L = D.live || {}, A = bs(L.usd || [], "ytm"), w = qv(L.q, "KRW="), fx = w.v || (D.ust || {}).fx, now = Date.now();
    var h = doc("bru") + liveStrip(D);
    h += card("🇧🇷 달러표시 브라질국채 <span class='mut'>글로벌본드 · " + A.length + "개 · 달러</span>",
      '<div class="pd-brl"><div><small>통화</small><b>USD</b><em>이자·원금 모두 달러</em></div><div><small>신용등급</small><b>BB</b><em>투기등급 (국제)</em></div><div><small>이자</small><b>6개월마다</b><em>고정 표면금리</em></div><div><small>세금</small><b>확인 필요</b><em>헤알 국채 비과세와 같은지 창구 확인</em></div></div>' +
      '<p class="note">미래에셋은 브라질국채를 <b>단순중개</b>(MAPS·영업점)로 다뤄요 — 달러채도 주문 가능 종목·최소 단위·호가는 창구에서 확인하세요. 아래 시세는 국제 채권시장 값이라 미래에셋 중개 호가와 조금 달라요.</p>');
    if (!A.length) return h + card("", '<div class="empty">달러채 시세를 아직 못 받았어요. 20분 안에 다시 들어와요.</div>');
    var sps = A.map(function(x){ return x.sp; }).filter(function(v){ return v != null; });
    var avg = sps.length ? sps.reduce(function(a, b){ return a + b; }, 0) / sps.length : null;
    var mx = Math.max.apply(null, A.map(function(x){ return x.ytm || 0; }).concat([0.1]));
    var row = function(x){
      var yr = Math.max(0, (new Date(x.mat) - now) / 365.25 / 864e5);
      return '<div class="pd-it pd-tap"' + reg("bru", {fx: fx, name: x.name, mat: x.mat, cpn: x.cpn || 0, ytm: x.ytm, cur: "USD", sp: x.sp, src: x.src}) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.name) + '</b><small>만기 ' + e(x.mat) + ' (약 ' + yr.toFixed(1) + '년) · 가격 ' + (+x.px).toFixed(2) + (x.chg != null ? ' <span class="' + cls(x.chg) + '">' + (x.chg > 0 ? "+" : "") + (+x.chg).toFixed(2) + '</span>' : '') + '</small></div>' +
        '<div class="pd-v"><b class="up">' + pc(x.ytm) + '</b><small>' + (x.sp != null ? '미국채 +' + x.sp.toFixed(2) + '%p' : '시세 수익률') + '</small></div></div>' +
        '<div class="pd-bar"><i style="width:' + ((x.ytm || 0) / mx * 100).toFixed(0) + '%"></i></div>' +
        '<div class="pd-row"><span>같은 만기 미국채 <b>' + pc(x.ust) + '</b></span><span>' + e(x.src) + '</span><span class="mut">' + e(x.isin) + '</span></div></div>'; };
    h += card("전 종목 <span class='mut'>" + BSL[bsk()] + " · 수익률 = 달러·세전</span>",
      '<div class="pd-list">' + A.map(row).join("") + '</div>' +
      '<p class="note">「미국채 +x%p」= 같은 만기 미국 국채(재무부 ' + e(md(L.curve)) + ' 곡선)보다 더 주는 금리, 곧 <b>브라질 위험값</b>이에요' + (avg != null ? ' — 지금 평균 <b>+' + avg.toFixed(2) + '%p</b>' : '') + '. 이 값이 벌어지면 브라질 달러채 값이 빠지고, 좁혀지면 올라요. 시세는 BONDS.com 실시간이 있으면 그 값, 없으면 유럽 거래소들(15분 지연)의 가운데 값 · ' + e(ago(L.usd_at || L.at)) + ' 받음. 종목을 누르면 모의 투자계산서가 나와요.</p>');
    var HH = Object.keys(L.hist || {}).sort().map(function(d){ return [d, L.hist[d]]; });
    var s1 = HH.filter(function(x){ return x[1].sp10 != null; }).map(function(x){ return [x[0], x[1].sp10]; });
    var s2 = HH.filter(function(x){ return x[1].brl10 != null && x[1].usd10 != null; });
    if (s1.length > 5) h += card("10년 달러채 가산금리 흐름 <span class='mut'>미국채보다 +%p</span>", line1(vals(s1), lbl(s1), {name: "가산금리", color: "#d95926", h: 130}));
    if (s2.length > 5) h += card("헤알 10년 − 달러 10년 <span class='mut'>%p</span>", line1(vals(s2.map(function(x){ return [x[0], x[1].brl10 - x[1].usd10]; })), lbl(s2), {name: "헤알 − 달러", color: "#199e70", h: 120}) + '<p class="note">두 금리 차이 = 시장이 헤알 약세(환율 위험)에 요구하는 몫이에요.</p>');
    else h += '<p class="note" style="margin:6px 4px 12px">📈 가산금리·헤알 대비 흐름 그래프는 10/21부터 하루 한 점씩 쌓여요(일주일쯤 뒤부터 보여요).</p>';
    var b = qv(L.q, "BR10Y"), bm = A.reduce(function(p, x){ var t = Math.abs((new Date(x.mat) - now) / 365.25 / 864e5 - 10); return !p || t < p[0] ? [t, x] : p; }, null);
    if (b.v != null && bm) h += card("헤알로 살까, 달러로 살까 <span class='mut'>10년 근처 · 지금</span>",
      '<div class="mg-kv"><div><small>🇧🇷 헤알 국채 10년</small><b>' + pc(b.v, 3) + '</b><em>헤알 환율 위험 포함</em></div><div><small>🇧🇷 달러채 ' + e(bm[1].mat.slice(0, 4)) + '년 만기</small><b>' + pc(bm[1].ytm) + '</b><em>원/달러 위험만</em></div></div>' +
      '<p class="note">차이 <b>' + (b.v - bm[1].ytm).toFixed(2) + '%p</b> — 헤알이 달러 대비 1년에 그만큼보다 덜 약해지면 헤알 국채가, 더 약해지면 달러채가 유리해요(세금 차이 제외).</p>');
    return h;
  }

  /* 🇺🇸 미국채 전 종목 — 10/16 사용자 「미국채 종류 훨씬 더 많을껴 다 찾고」. 미국 재무부 MSPD(월말 전 종목) + 일일 수익률 곡선으로 추정한 수익률 */
  var UK = [["", "전체"], ["N", "Note(2~10년물)"], ["B", "Bond(20·30년물)"], ["TIPS", "물가연동(TIPS)"], ["Bill", "T-Bill(1년 이하)"], ["FRN", "변동금리(FRN)"]];
  var UKN = {N: "Note", B: "Bond", TIPS: "물가연동 TIPS", Bill: "T-Bill", FRN: "변동금리 FRN"};
  var UBK = [[0, 1, "1년 이내"], [1, 3, "1~3년"], [3, 7, "3~7년"], [7, 15, "7~15년"], [15, 25, "15~25년"], [25, 99, "25년 넘게"]];
  function ustAll(D){
    var UA = D.ust_all, U = D.ust || {}; if (!UA || !UA.items || !UA.items.length) return "";
    var f = SEL.ustk || "", it = UA.items.filter(function(x){ return !f || x.k === f; }), now = Date.now();
    var mq = {}; (U.items || []).forEach(function(x){ mq[(+x.cpn).toFixed(3) + x.mat] = x.ytm; });
    var gaps = UA.items.filter(function(x){ return x.mir && x.y != null && mq[(+x.cpn).toFixed(3) + x.mat] != null; }).map(function(x){ return mq[(+x.cpn).toFixed(3) + x.mat] - x.y; });
    var gap = gaps.length ? gaps.reduce(function(a, b){ return a + b; }, 0) / gaps.length : null;
    var row = function(x){
      var yr = Math.max(0, (new Date(x.mat) - now) / 365.25 / 864e5), mqy = mq[(+(x.cpn || 0)).toFixed(3) + x.mat];
      return '<div class="pd-it pd-tap"' + reg("ust", {fx: U.fx, name: x.nm, mat: x.mat, cpn: x.cpn || 0, ytm: mqy != null ? mqy : x.y, est: mqy == null, tips: x.k === "TIPS", frn: x.k === "FRN", cur: "USD"}) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.nm) + (x.mir ? ' <span class="chip2 hot" style="margin:0">미래에셋 판매</span>' : '') + '</b><small>' + e(UKN[x.k]) + ' · 만기 ' + e(x.mat) + ' (약 ' + yr.toFixed(1) + '년)' + (x.cpn != null ? ' · 표면 ' + pc(x.cpn, 3) : '') + (x.px ? ' · 가격 약 ' + x.px.toFixed(1) : '') + (x.out ? ' · 잔액 $' + fmt(x.out) + 'B' : '') + '</small></div>' +
        '<div class="pd-v"><b class="up">' + (mqy != null ? pc(mqy) : x.y != null ? pc(x.y) : '변동') + '</b><small>' + (mqy != null ? '미래에셋 시세' : x.k === "TIPS" ? '실질(추정)' : x.y != null ? '추정 수익률' : '3개월물+α') + '</small></div></div></div>'; };
    var groups = UBK.map(function(b){ var a = it.filter(function(x){ var t = (new Date(x.mat) - now) / 365.25 / 864e5; return t >= b[0] && t < b[1]; }); return [b, bs(a, "y")]; }).filter(function(g){ return g[1].length; });
    if (bsk() === "M") groups.reverse();
    return card("🇺🇸 미국채 전 종목 <span class='mut'>" + UA.n + "개 · 미국 재무부</span>",
      '<div class="seg2 wrap" id="pdustk">' + UK.map(function(x){ var n = UA.items.filter(function(r){ return !x[0] || r.k === x[0]; }).length; return '<button' + (x[0] === f ? ' class="on"' : '') + ' data-k="' + x[0] + '">' + x[1] + ' <span class="mut">' + n + '</span></button>'; }).join("") + '</div>' +
      groups.map(function(g, i){ var ys = g[1].map(function(x){ return x.y; }).filter(function(v){ return v != null; }), nm = g[1].filter(function(x){ return x.mir; }).length;
        return '<details class="pd-grp"><summary><b>' + g[0][2] + '</b> <span class="mut">' + g[1].length + '개' + (ys.length ? ' · ' + Math.min.apply(null, ys).toFixed(2) + '~' + Math.max.apply(null, ys).toFixed(2) + '%' : '') + (nm ? ' · 미래에셋 판매 ' + nm : '') + '</span></summary><div class="pd-list">' + g[1].map(row).join("") + '</div></details>'; }).join("") +
      '<p class="note">지금 시장에서 거래되는 미국 국채 <b>전부</b>예요(재무부 월말 명세서 ' + e(UA.mspd) + ' 기준 · 그 뒤 새로 나온 건 다음 달에). 종목별 실시간 시세는 공개 안 돼서, 수익률은 재무부가 매일 내는 <b>수익률 곡선(' + e(UA.curve) + ')을 만기에 맞춰 끼워 넣은 추정치</b>예요' + (gap != null ? ' — 미래에셋이 실제로 파는 종목은 추정보다 평균 <b>' + V.sgn(gap) + '%p</b> 다르게 나와요(표면금리 낮은 옛 채권이 더 비싸게 거래되고, 매도 호가 차이가 있어서)' : '') + '. 「미래에셋 판매」 표시는 미래에셋 시세 그대로. 다른 종목도 미래에셋 해외채권(MAPS)·영업점에서 주문할 수 있는지는 따로 확인하세요. TIPS 수익률은 물가를 뺀 실질 수익률(5년 미만은 5년 값).</p>');
  }

  /* ───────── 📦 펀드 ───────── */
  var PERS = [["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"], ["y3", "3년"]], PN = {m3: "3개월", m6: "6개월", y1: "1년", y3: "3년"};
  function fname(n){ return String(n || "").replace(/\s*\((?:수수료|운용|보수)[^)]*\)\s*/g, "").replace(/\s*(종류|클래스|Class|class|CLASS)\s*[A-Za-z][-A-Za-z0-9]*\s*(\([^)]*\))?\s*$/, ""); }
  function frow(x, i, per){
    var v = x[per];
    return '<div class="pd-it pd-f pd-tap"' + reg("fund", Object.assign({per: per}, x)) + '><div class="pd-h"><span class="rk">' + (i + 1) + '</span><div class="pd-n"><b>' + e(fname(x.n)) + '</b><small>' + e(x.co || "") + ' · ' + e(x.t || "") + (x.st ? ' · ' + e(x.st) : '') + (x.rk ? ' · 위험 ' + x.rk + '등급' : '') + '</small></div>' +
      '<div class="pd-v">' + (v == null ? '<b class="mut">–</b>' : sg(v)) + '<small>' + PN[per] + '</small></div></div>' +
      '<div class="pd-row"><span>3개월 ' + sg(x.m3) + '</span><span>1년 ' + sg(x.y1) + '</span><span>3년 ' + sg(x.y3) + '</span><span>순자산 <b>' + (x.aum != null ? fmt(x.aum) + '억' : '–') + '</b></span></div></div>';
  }
  /* 🔒 사모 라인업 — 10/16 사용자 「사모펀드 다 빼고 이 리스트(미래에셋 사모 주요펀드 라인업)에 있는것만 · 수익률 top30 위주 · 나머지는 펼치기 접기」
     사내용 자료라 평문은 저장소에 없음: archive/x/pv_lineup.enc (AES-256-GCM · PBKDF2) 를 비밀번호로 이 기기에서만 풂 */
  var PVL = null, PVERR = "", PVBUSY = false;
  function b64u(s){ var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function pvUnlock(pw){
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error("이 브라우저는 암호 풀기를 지원하지 않아요"));
    return getJSON("archive/x/pv_lineup.enc?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(E){
      return crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]).then(function(k){
        return crypto.subtle.deriveKey({name: "PBKDF2", salt: b64u(E.s), iterations: E.it, hash: "SHA-256"}, k, {name: "AES-GCM", length: 256}, false, ["decrypt"]);
      }).then(function(key){ return crypto.subtle.decrypt({name: "AES-GCM", iv: b64u(E.i)}, key, b64u(E.c)); });
    }).then(function(buf){ PVL = JSON.parse(new TextDecoder().decode(buf)); return pvLive(PVL); });
  }
  /* 📡 10/16 사용자 「수익률 매일매일 업데이트 해서 채우고」 — 라인업 중 금융투자협회에 기준가를 공시하는 펀드(이름으로 찾아 둔 k)만 매일 갱신 가능.
     archive/x/pv_kofia.json(products.yml 하루 3번)의 최신 기준가 ÷ 10/15 기준가(kb) 비율로 이어 붙임:
     1일·1주·1개월·3개월 = 금투협 값 그대로 · 6개월·1년·올해 = 10/15 표 값 × 그 뒤 변화 (금투협 6개월·1년은 분배·결산으로 기준가가 리셋돼 틀림) */
  function pvLive(L){
    return P().then(function(D){ L.bm = D && D.bm && D.bm.length ? D.bm : []; L.bmasof = L.bm.length ? L.bm[0].asof : null; }, function(){ L.bm = []; }).then(function(){
      var q_ = "?" + Math.floor(Date.now() / 600000), g_ = function(f){ return getJSON("archive/x/" + f + q_, {ttl: 600000}).catch(function(){ return null; }); };
      return Promise.all([g_("pv_nav.json"), g_("pv_kofia.json"), g_("pv_pub.json"), g_("pv_basket.json")]);
    }).then(function(a){
      var H = a[0], K = a[1], n = 0;
      if (L.asof) ANCHOR = L.asof;
      L.kasof = H && H.d ? H.d[H.d.length - 1] : K ? K.asof : null;
      L.rows.forEach(function(o){
        if (!o.k || !o.kb) return;
        var lev = /손익차등|[12]종/.test(o.n), c = H && H.v && H.v[o.k] ? navCalc(H.d, H.v[o.k], lev) : null, q = K && K.i ? K.i[o.k] : null;
        // ✅ 검산: 10/15 까지의 기록만으로 계산한 값이 10/15 화면 값과 5%p 넘게 다르면 그 기간은 직접 계산을 안 믿음(분배·손익차등 구조 등)
        var bad = {};
        if (c && H){ var cut = H.d.filter(function(d){ return d <= o.kd; }).length, c0 = cut > 2 ? navCalc(H.d.slice(0, cut), H.v[o.k].slice(0, cut), lev) : null;
          [["m1", "m1"], ["m3", "m3"], ["m6", "m6"], ["y1", "y1"], ["ytd", "ytd"]].forEach(function(pp){ var sv = pp[0] === "ytd" ? (o.y || {})["2026"] : o[pp[0]], cv = c0 ? c0[pp[1]] : null;
            if (cv == null || sv == null || Math.abs(cv - sv) > 5) bad[pp[0]] = 1; }); }
        var lastNav = c ? c.last : q ? q[0] : null, asof = c ? c.asof : K ? K.asof : null;
        if (!lastNav || !(asof > o.kd)) return;
        var ra = lastNav / o.kb, chain = ra > 0.7 && ra < 1.4 ? function(v){ return v == null ? null : Math.round(((1 + v / 100) * ra - 1) * 10000) / 100; } : function(){ return null; };
        var src = {};
        ["d1", "w1", "m1", "m3", "m6", "y1"].forEach(function(p){
          if (c && c[p] != null && !bad[p]){ o[p] = c[p]; src[p] = "calc"; }
          else if (q && (p === "d1" || p === "w1") && q[p === "d1" ? 1 : 2] != null){ o[p] = q[p === "d1" ? 1 : 2]; src[p] = "kofia"; }
          else { o[p] = chain(o[p]); src[p] = "chain"; }
        });
        o.y = o.y || {};
        if (c && c.ytd != null && !bad.ytd){ o.y["2026"] = c.ytd; src.ytd = "calc"; } else if (o.y["2026"] != null){ o.y["2026"] = chain(o.y["2026"]); src.ytd = "chain"; }
        if (o.nav != null && ra > 0.7 && ra < 1.4) o.nav = Math.round(o.nav * ra * 100) / 100;
        o.live = {asof: asof, ch: Math.round((ra - 1) * 10000) / 100, src: src, resets: c ? c.resets : []};
        o.wk = c ? c.wk : null; n++;
      });
      L.nlive = n;
      try { pvEstimate(L, H, a[2], a[3], L.bm); } catch(z) { console.error(z); }
      L.rows.forEach(function(o){ o.oc = openClose(o); });
      return L;
    }).catch(function(){ return L; });
  }
  /* 기준가 기록으로 직접 계산 — 결산(기준가가 1,000 근처로 리셋, 한 칸에 −15% 넘게)은 그 칸만 빼고 이어 붙임 */
  function navCalc(ds, arr, noReset){
    var pts = []; ds.forEach(function(d, i){ if (arr[i] != null && arr[i] > 0) pts.push([d, arr[i]]); });
    if (pts.length < 2) return null;
    var f = [1], resets = [];
    for (var i = 1; i < pts.length; i++){ var r = pts[i][1] / pts[i - 1][1]; if (!noReset && r < 0.85 && Math.abs(pts[i][1] - 1000) < 60){ r = 1; resets.push(pts[i][0]); } f.push(f[i - 1] * r); }
    var L_ = pts.length - 1, T = function(d){ return Date.parse(d + "T00:00:00Z"); }, now = T(pts[L_][0]);
    var at = function(days, slack){ var t = now - days * 864e5, j = -1; for (var i = 0; i < L_; i++) if (T(pts[i][0]) <= t) j = i; if (j < 0 || t - T(pts[j][0]) > (slack || 8) * 864e5) return null; return Math.round((f[L_] / f[j] - 1) * 10000) / 100; };
    var out = {last: pts[L_][1], asof: pts[L_][0], resets: resets,
      d1: now - T(pts[L_ - 1][0]) <= 4 * 864e5 ? Math.round((f[L_] / f[L_ - 1] - 1) * 10000) / 100 : null,
      w1: at(7, 4), m1: at(30.4), m3: at(91.3), m6: at(182.6), y1: at(365.25)};
    var y0 = pts[L_][0].slice(0, 4) + "-01-01", j = -1; for (var k = 0; k < L_; k++) if (pts[k][0] < y0) j = k;
    out.ytd = j >= 0 && T(y0) - T(pts[j][0]) <= 10 * 864e5 ? Math.round((f[L_] / f[j] - 1) * 10000) / 100 : null;
    var wk = {}, wl = [];                          // 주마다 마지막 점 → 주간 수익률
    pts.forEach(function(p, i){ var dt = new Date(T(p[0])), th = new Date(dt); th.setUTCDate(dt.getUTCDate() + 3 - ((dt.getUTCDay() + 6) % 7)); wk[th.toISOString().slice(0, 10)] = i; });
    Object.keys(wk).forEach(function(kk){ wl.push(wk[kk]); }); wl.sort(function(a, b){ return a - b; });
    out.wk = []; for (var w = 1; w < wl.length; w++){ var i0 = wl[w - 1], i1 = wl[w]; if (T(pts[i1][0]) - T(pts[i0][0]) <= 10 * 864e5) out.wk.push([pts[i1][0], Math.round((f[i1] / f[i0] - 1) * 10000) / 100]); }
    out.wk = out.wk.slice(-13);
    return out;
  }
  /* 🧮 10/16 사용자 「어떻게 해서든 찾으라고 · 아니면 구성 종목으로 네가 계산해」 — 금투협에 기준가가 없는 펀드의 추정
     후보 줄: ① 같은 운용사 공모펀드 기준가(사모재간접 = 그 운용사 사모펀드를 담은 공모펀드 포함, pv_pub.json)
              ② 운용사 바스켓(5% 넘게 가진 종목을 평가금액 비중으로, pv_hold.yml → pv_basket.json) ③ 같은 전략 실측 펀드 평균 ④ 코스피·코스닥
     → 10/15 화면의 1주·1개월·3개월·6개월·1년 성적과 같은 기간 후보 수익률로 민감도 b 를 맞추고(로그 수익률 최소제곱, 원점 지남),
       오차가 가장 작은 후보로 10/15 뒤 변화 = (1 + 후보 변화)^b − 1 을 이어 붙임. 시장 줄(②④)은 펀드 기준가가 전날 종가라 하루 앞 날짜로 맞춤 */
  var ANCHOR = "2026-10-15";        // 화면 사진 날짜 — pvLive 가 PVL.asof 로 바꿈 (10/22: 새 사진 받을 때마다 자동)
  function amd(){ return String(ANCHOR).slice(5).replace("-", "/"); }   // 사진 날짜 「10/22」 (xpanel 안 md 가림 피함)
  var SLACK = {w1: 3, m1: 5, m3: 8, m6: 12, y1: 15};   // 10/22 학습: 기간 시작점이 이만큼보다 멀면 안 씀(옛 9일 → 1주가 2주로 늘어 −10%p 넘게 틀렸음)
  function serNav(ds, arr){ var d = [], f = [], prev = null, acc = 1;
    for (var i = 0; i < ds.length; i++){ var v = arr[i]; if (v == null || !(v > 0)) continue; if (prev != null){ var r = v / prev; if (r < 0.85 && Math.abs(v - 1000) < 60) r = 1; acc *= r; } d.push(ds[i]); f.push(acc); prev = v; }
    return d.length > 3 ? {d: d, f: f, nav: true} : null; }
  function serMkt(ds, vs){ return ds && ds.length > 3 ? {d: ds, f: vs, nav: false} : null; }
  function sAt(S, date, strict, slack){ var T = Date.parse(date + "T00:00:00Z"), j = -1; for (var i = 0; i < S.d.length; i++){ if (strict ? S.d[i] < date : S.d[i] <= date) j = i; else break; }
    if (j < 0 || T - Date.parse(S.d[j] + "T00:00:00Z") > (slack || 9) * 864e5) return null; return S.f[j]; }
  function sAgo(date, days){ return new Date(Date.parse(date + "T00:00:00Z") - days * 864e5).toISOString().slice(0, 10); }
  function sWin(S, end, days, slack){ var st = !S.nav, a = sAt(S, end, st, 4), b = sAt(S, sAgo(end, days), st, slack); return a != null && b != null ? a / b - 1 : null; }
  var WINS = [["w1", 7], ["m1", 30.4], ["m3", 91.3], ["m6", 182.6], ["y1", 365.25]];
  function fitCand(o, S){
    var xs = [], ys = [];
    // 10/22 학습: 지금 사진 + 지난 사진(o.hx)의 기간 성적을 모두 식으로 씀 → 사진이 쌓일수록 민감도·후보 고르기가 실제에 맞춰짐
    var snaps = [[ANCHOR, o]]; Object.keys(o.hx || {}).forEach(function(d){ if (d !== ANCHOR) snaps.push([d, o.hx[d]]); });
    snaps.forEach(function(sn){ WINS.forEach(function(w){ var fr = sn[1][w[0]], cr = sWin(S, sn[0], w[1], SLACK[w[0]]); if (fr == null || cr == null || fr <= -99 || cr <= -0.99) return; xs.push(Math.log(1 + cr)); ys.push(Math.log(1 + fr / 100)); }); });
    if (xs.length < 3) return null;
    var sxy = 0, sxx = 0; xs.forEach(function(x, i){ sxy += x * ys[i]; sxx += x * x; }); if (sxx < 1e-5) return null;
    var b = Math.max(0, Math.min(3, sxy / sxx)), se = 0; xs.forEach(function(x, i){ se += Math.pow(ys[i] - b * x, 2); });
    return {b: b, err: Math.sqrt(se / xs.length) * 100, n: xs.length};
  }
  function pvEstimate(L, H, PUB, BK, bm){
    var live = L.rows.filter(function(o){ return o.live && o.k && H && H.v && H.v[o.k]; });
    var peer = {};                                     // 같은 전략 실측 펀드 평균 줄 (pv_nav 날짜 기준)
    live.forEach(function(o){ var S = serNav(H.d, H.v[o.k]); if (!S) return; (peer[o.s] = peer[o.s] || []).push(S); });
    var peerSer = function(s){ var P_ = peer[s]; if (!P_ || P_.length < 2) return null; var d = [], f = [];
      H.d.forEach(function(dd){ var a = [], base; P_.forEach(function(S){ var v = sAt(S, dd), z = sAt(S, ANCHOR); if (v != null && z) a.push(v / z); }); if (a.length >= 2){ d.push(dd); f.push(a.reduce(function(x, y){ return x + y; }, 0) / a.length); } });
      return d.length > 3 ? {d: d, f: f, nav: true} : null; };
    var pubBy = {}; if (PUB && PUB.v) Object.keys(PUB.v).forEach(function(c){ var nm = (PUB.n || {})[c]; if (!nm) return; (pubBy[nm[1]] = pubBy[nm[1]] || []).push(c); });
    var n = 0;
    L.rows.forEach(function(o){
      if (o.live || (o.k && o.kb && o.kd >= ANCHOR)) return;      // 11/05: 사진 날짜 = 금투협 마지막 날짜인 날엔 실측 펀드를 추정으로 바꾸지 않음(다음 기준가부터 📡)
      var C = [];
      if (o.mg && pubBy[o.mg]) pubBy[o.mg].slice(0, 40).forEach(function(c){ var S = serNav(PUB.d, PUB.v[c]); if (S) C.push([S, "같은 운용사 공모펀드 「" + fname(PUB.n[c][0]) + "」 기준가", "pub"]); });
      if (o.mg && BK && BK[o.mg]){ var S2 = serMkt(BK[o.mg].d, BK[o.mg].v); if (S2) C.push([S2, "운용사 바스켓(5% 넘게 가진 " + BK[o.mg].n + "종목 · 평가금액 비중)", "bk"]); }
      var S3 = peerSer(o.s); if (S3) C.push([S3, "같은 전략(" + (SSHORT[o.s] || o.s) + ") 실측 펀드 " + peer[o.s].length + "개 평균", "peer"]);
      (bm || []).forEach(function(b){ var S4 = b.s ? serMkt(b.s.d, b.s.v) : null; if (S4) C.push([S4, b.n + " 지수", "ix"]); });
      var best = null;
      C.forEach(function(c){ var ft = fitCand(o, c[0]); if (ft && (!best || ft.err < best.ft.err)) best = {c: c, ft: ft}; });
      if (!best || best.ft.err > 10) return;
      // 10/27 학습: 지수(ix)로 맞춘 추정은 실제보다 2배쯤 크게 움직였음(10/15→22·10/22→27 두 번 다) → 민감도 절반으로
      // 11/05 학습: 같은 운용사 공모펀드(pub)로 맞춘 민감도가 1을 넘으면(타임폴리오 위드타임 1.5배 등) 실제보다 크게 움직임 → 1로 상한(세 구간 중 두 구간 개선)
      var S = best.c[0], st = !S.nav, b = Math.min(best.c[2] === "pub" ? 1 : 3, best.ft.b) * (best.c[2] === "ix" ? 0.5 : 1), z = sAt(S, ANCHOR, st, 4), lastD = S.d[S.d.length - 1], last = S.f[S.f.length - 1];
      if (!z) return;
      var tf = function(r){ return r == null ? null : Math.round((Math.exp(b * Math.log(1 + r)) - 1) * 10000) / 100; };
      var since = last / z - 1, est = tf(since);
      var chain = function(v){ return v == null ? null : Math.round(((1 + v / 100) * (1 + est / 100) - 1) * 10000) / 100; };
      if (lastD > ANCHOR && Math.abs(since) > 1e-9){
        ["m1", "m3", "m6", "y1"].forEach(function(p){ o[p] = chain(o[p]); });
        if (o.y && o.y["2026"] != null) o.y["2026"] = chain(o.y["2026"]);
        if (o.nav != null) o.nav = Math.round(o.nav * (1 + est / 100) * 100) / 100;
        var w1 = S.f.length > 5 ? sWin(S, lastD, 7, SLACK.w1) : null, d1 = S.f.length > 1 && Date.parse(S.d[S.d.length - 1]) - Date.parse(S.d[S.d.length - 2]) <= 4 * 864e5 ? S.f[S.f.length - 1] / S.f[S.f.length - 2] - 1 : null;
        o.w1 = tf(w1); o.d1 = tf(d1);
      }
      // 주간 수익률(추정)
      var wk = {}, wl = []; S.d.forEach(function(d, i){ var dt = new Date(Date.parse(d + "T00:00:00Z")); dt.setUTCDate(dt.getUTCDate() + 3 - ((dt.getUTCDay() + 6) % 7)); wk[dt.toISOString().slice(0, 10)] = i; });
      Object.keys(wk).sort().forEach(function(k){ wl.push(wk[k]); });
      o.wk = []; for (var w = 1; w < wl.length; w++){ var i0 = wl[w - 1], i1 = wl[w]; if (Date.parse(S.d[i1]) - Date.parse(S.d[i0]) <= 10 * 864e5) o.wk.push([S.d[i1], tf(S.f[i1] / S.f[i0] - 1)]); }
      o.wk = o.wk.slice(-13); o.wkEst = true;
      o.est = {by: best.c[1], kind: best.c[2], b: Math.round(b * 100) / 100, err: Math.round(best.ft.err * 10) / 10, n: best.ft.n, ch: est, asof: lastD, mkt: st, tried: C.length};
      n++;
    });
    L.nest = n;
  }
  /* 🔐 폐쇄형·개방형 — 10/16 사용자 「폐쇄형 개방형 구분해서 볼 수 있게」. 사모펀드 약관은 공개되지 않아 이름·전략으로 판정(화면에 「추정」 표시)
     폐쇄형: 이름에 만기형·폐쇄·Pre-IPO·PEF·Secondary·SPAC·사모대출 / 전략이 Pre-IPO·메자닌·국내 PE·해외 PE·VC·PD
     개방형: 롱·롱숏·멀티·재간접 헤지펀드(보통 월·분기 환매) · 코스닥벤처·공모주하이일드는 대개 폐쇄형(만기 3년 안팎) */
  function openClose(o){
    var n = o.n, s = o.s;
    if (/만기형|폐쇄|Pre-?IPO|PEF|PE |Secondary|SPAC|스팩|사모대출|PMF|프라이빗|비상장|메자닌|IPO\s*Selection/i.test(n)) return "폐쇄형";
    if (/Pre-IPO|Mezzanine|PE|VC|PD|코스닥벤처|하이일드/.test(s)) return "폐쇄형";
    return "개방형";
  }
  var PVP = [["w1", "1주"], ["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"], ["ytd", "올해"]], PVPN = {d1: "1일", w1: "1주", m1: "1개월", m3: "3개월", m6: "6개월", y1: "1년", ytd: "올해(2026)"};
  var SG = [["", "전체"], ["Long", "롱"], ["Long/Short", "롱숏"], ["Multi", "멀티전략"], ["Fund of Fund", "재간접"], ["Pre-IPO", "Pre-IPO"], ["Mezzanine", "메자닌"], ["하이일드", "공모주하이일드"], ["코스닥벤처", "코스닥벤처"], ["PE", "PE·VC·사모대출"], ["USD", "💵 달러"]];
  var SSHORT = {"Equity Hedge (Long)": "롱", "Equity Hedge (Long · USD)": "롱·달러", "Equity Hedge (Long/Short)": "롱숏", "Equity Hedge (Multi-Strategy)": "멀티전략", "Equity Hedge (Fund of Fund)": "헤지 재간접", "Event-Driven (Pre-IPO)": "Pre-IPO·공모주", "Event-Driven (Mezzanine)": "메자닌", "Event-Driven (공모주 하이일드)": "공모주 하이일드", "Event-Driven (코스닥벤처)": "코스닥벤처", "국내형 PE": "국내 PE", "Global VC": "해외 VC", "Global PE (원화)": "해외 PE(원화)", "Global PE (USD)": "해외 PE(달러)", "Global PD (USD)": "해외 사모대출(달러)"};
  function sgOk(x, f){
    if (!f) return true;
    if (f === "USD") return x.usd;
    if (f === "Long") return x.s === "Equity Hedge (Long)" || x.s === "Equity Hedge (Long · USD)";
    if (f === "PE") return /PE|VC|PD/.test(x.s);
    return x.s.indexOf(f) >= 0;
  }
  function pvv(x, p){ return p === "ytd" ? (x.y || {})["2026"] : x[p]; }
  function pvname(n){ return String(n).replace(/\s*(일반\s*사모\s*(증권|혼합자산)?\s*투자\s*신탁|전문투자형\s*사모\s*투자\s*신탁|사모\s*증권\s*투자\s*신탁|일반\s*사모)\s*/g, " ").replace(/\s+/g, " ").trim(); }
  function pvlrow(x, i, p){
    var v = pvv(x, p), cur = x.usd ? "$" : "";
    return '<div class="pd-it pd-p pd-tap"' + reg("pvl", Object.assign({per: p}, x)) + '><div class="pd-h">' + (i != null ? '<span class="rk">' + (i + 1) + '</span>' : '') + '<div class="pd-n"><b>' + e(pvname(x.n)) + '</b><small>' + e(SSHORT[x.s] || x.s) + (x.d ? ' · 설정 ' + e(x.d.slice(0, 7).replace("-", ".")) : '') + (x.nav != null ? ' · 기준가 ' + cur + fmt(x.nav) : '') + (/손익차등/.test(x.n) ? ' · <span class="chip2 hot" style="margin:0">손익차등</span>' : '') + ' · ' + e(x.oc || openClose(x)) + (x.live ? ' · <span class="pd-lv">📡 실측 ' + e(md(x.live.asof)) + '</span>' : x.est ? ' · <span class="pd-es">🧮 추정 ' + e(md(x.est.asof)) + '</span>' : ' · <span class="mut">📷 ' + amd() + '</span>') + '</small></div>' +
      '<div class="pd-v">' + (v == null ? '<b class="mut">–</b>' : sg(v)) + '<small>' + PVPN[p] + '</small></div></div>' +
      '<div class="pd-row"><span>1주 ' + sg(x.w1) + '</span><span>1개월 ' + sg(x.m1) + '</span><span>3개월 ' + sg(x.m3) + '</span><span>6개월 ' + sg(x.m6) + '</span><span>1년 ' + sg(x.y1) + '</span><span>올해 ' + sg((x.y || {})["2026"]) + '</span></div></div>';
  }
  function pvBody(){
    if (!PVL){
      var saved = ""; try { saved = localStorage.getItem("pvk") || ""; } catch(z) {}
      return card("🔒 미래에셋 사모 라인업 <span class='mut'>잠김</span>",
        (saved && !PVERR ? '<div class="loading">여는 중…</div>' :
        '<p class="note" style="margin:0 0 10px">미래에셋증권 사내용 「사모 주요펀드 라인업 및 성과현황」을 옮긴 자료라 비밀번호로 잠가 두었어요. 한 번 열면 이 기기에서는 다음부터 자동으로 열려요.</p>' +
        '<div class="pd-pw"><input aria-label="비밀번호" id="pvpw" type="password" autocomplete="current-password" placeholder="비밀번호" class="pd-q" style="margin:0"><button id="pvgo">열기</button></div>' +
        (PVERR ? '<div class="pd-err">⚠️ ' + e(PVERR) + '</div>' : '')));
    }
    var p = SEL.pvp || "y1", f = SEL.pvs || "", oc = SEL.pvoc || "", L = PVL.rows.filter(function(x){ return sgOk(x, f) && (!oc || (x.oc || openClose(x)) === oc); });
    var has = L.filter(function(x){ return pvv(x, p) != null; }).sort(function(a, b){ return pvv(b, p) - pvv(a, p); }), none = L.filter(function(x){ return pvv(x, p) == null; });
    var top = has.slice(0, 30), rest = has.slice(30), med = has.length ? pvv(has[Math.floor(has.length / 2)], p) : null;
    var bm = (PVL.bm || []).map(function(b){ var v = pvv(b, p); return v == null ? "" : '<span>' + e(b.n) + ' ' + sg(v) + '</span>'; }).join("");
    return card("🔒 미래에셋 사모 라인업 수익률 TOP 30 <span class='mut'>" + PVPN[p] + " · " + has.length + "개 중</span>",
      seg("pdpvp", PVP, p) + seg("pdpvoc", [["", "전체"], ["개방형", "🔓 개방형 " + PVL.rows.filter(function(x){ return (x.oc || openClose(x)) === "개방형"; }).length], ["폐쇄형", "🔒 폐쇄형 " + PVL.rows.filter(function(x){ return (x.oc || openClose(x)) === "폐쇄형"; }).length]], oc) + '<div class="seg2 wrap" id="pdpvs">' + SG.map(function(x){ var n = PVL.rows.filter(function(r){ return sgOk(r, x[0]); }).length; return '<button' + (x[0] === f ? ' class="on"' : '') + ' data-k="' + x[0] + '">' + x[1] + ' <span class="mut">' + n + '</span></button>'; }).join("") + '</div>' +
      '<div class="pd-row" style="margin:0 0 10px">비교 기준선 ' + (bm || '–') + (med != null ? '<span>라인업 가운데 ' + sg(med) + '</span>' : '') + '</div>' +
      (top.length ? '<div class="pd-list">' + top.map(function(x, i){ return pvlrow(x, i, p); }).join("") + '</div>' : '<div class="empty">이 조건에 수익률이 있는 펀드가 없어요.</div>')) +
      (rest.length ? '<details class="card cpx-d"><summary>나머지 ' + rest.length + '개 펼치기 <span class="mut">31위~</span></summary><div class="pd-list">' + rest.map(function(x, i){ return pvlrow(x, i + 30, p); }).join("") + '</div></details>' : '') +
      (none.length ? '<details class="card cpx-d"><summary>' + PVPN[p] + ' 수익률 없음 ' + none.length + '개 <span class="mut">새로 만든 펀드 등</span></summary><div class="pd-list">' + none.map(function(x){ return pvlrow(x, null, p); }).join("") + '</div></details>' : '') +
      '<p class="note">' + e(PVL.src) + '. 비교 기준선 KOSPI·KOSDAQ는 지수 종가로 직접 계산(엑셀 값 안 씀). 수익률은 기준가 기준(세전·보수 차감 후), 달러 펀드는 달러 기준이에요. <b>📡 표시 ' + (PVL.nlive || 0) + '개</b>는 금융투자협회 공시 기준가를 매일 쌓아 수익률을 직접 계산, <b>🧮 추정 ' + (PVL.nest || 0) + '개</b>는 기준가가 공개되지 않아 같은 운용사 공모펀드·운용사 보유 종목 바스켓·같은 전략 실측 펀드·지수 중 과거 성적에 가장 잘 맞는 것으로 매일 추정(' + e(md(PVL.kasof || "")) + ') — 나머지는 금투협에 기준가를 안 올리는 펀드라 ' + amd() + ' 화면 값이에요(새 화면 사진·엑셀을 주시면 갱신). 펀드를 누르면 전략 설명·연도별 성적·모의 계산이 펼쳐져요. <a href="#" id="pvlock">이 기기에서 잠그기</a></p>';
  }
  /* 🏢 운용사별 — 11/05 사용자 「공모랑 사모펀드 운용사별로 검색할 수 있는 탭 만들어」
     공모 = 미래에셋 펀드검색 전체(x.co) · 사모 = 🔒 라인업(잠금 풀렸을 때만, o.mg — 없으면 이름 앞머리로. 확실한 계열만 운용사 이름으로 붙이고 나머지는 「이름 기준」 표시) */
  var MGMAP = [[/^미래에셋/, "미래에셋자산운용"], [/^KB\s/, "KB자산운용"], [/^신한\s/, "신한자산운용"], [/^삼성/, "삼성자산운용"], [/^대신\s/, "대신자산운용"]];
  var MGBRAND = ["WWG", "TCK", "The황소", "Blue 라이언", "아너스", "CK", "AH", "리딩", "NB", "W"];
  function mgNorm(n){ return String(n || "").replace(/투자일임$/, "").replace(/\s+/g, "").trim(); }
  function pvMgr(o){
    if (o.mg) return [mgNorm(o.mg), false];
    for (var i = 0; i < MGMAP.length; i++) if (MGMAP[i][0].test(o.n)) return [MGMAP[i][1], false];
    for (var j = 0; j < MGBRAND.length; j++) if (String(o.n).indexOf(MGBRAND[j]) === 0) return [MGBRAND[j], true];
    return [String(o.n).split(/\s|일반|전문/)[0] || "기타", true];
  }
  function mgShort(n){ return String(n).replace(/(자산운용|투자신탁운용|투자자산운용|자산운용사)$/, "") || n; }
  function mgIndex(D){
    var M = {}, add = function(nm, k, x, g){ var m = M[nm] = M[nm] || {n: nm, pub: [], pv: [], guess: false}; m[k].push(x); if (g) m.guess = true; };
    (D.funds || []).forEach(function(x){ if (x.co) add(mgNorm(x.co), "pub", x); });
    if (PVL) PVL.rows.forEach(function(o){ var g = pvMgr(o); add(g[0], "pv", o, g[1]); });
    return Object.keys(M).map(function(k){ return M[k]; });
  }
  function mgSrch(s){ return String(s || "").toLowerCase().replace(/[\s·()\[\]_\-]/g, ""); }
  function mgAvg(a){ var v = a.filter(function(v){ return v != null && v > -99; }); return v.length ? v.reduce(function(s, x){ return s + x; }, 0) / v.length : null; }
  function mgList(D){
    var per = PER, q = mgSrch(SEL.mq), Q = String(SEL.mq || "").split(/\s+/).map(mgSrch).filter(Boolean), kind = SEL.mk || "", srt = SEL.ms || "n";
    var A = mgIndex(D).map(function(m){
      // 띄어쓰기로 나눈 낱말이 모두 (운용사 이름 + 펀드 이름)에 들어 있으면 맞음 — 「머스트 10호」·「타임 EH」처럼
      var mn = mgSrch(m.n) + mgSrch(mgShort(m.n)), ok = function(x){ var t = mn + "|" + mgSrch(x.n); return Q.every(function(w){ return t.indexOf(w) >= 0; }); };
      var hitN = Q.length && Q.every(function(w){ return mn.indexOf(w) >= 0; }), pub = m.pub, pv = m.pv;
      if (Q.length && !hitN){ pub = pub.filter(ok); pv = pv.filter(ok); }
      if (kind === "pub") pv = []; if (kind === "pv") pub = [];
      return {n: m.n, guess: m.guess, pub: pub, pv: pv, hitN: hitN, cnt: pub.length + pv.length, avg: mgAvg(pub.map(function(x){ return x[per]; }).concat(pv.map(function(o){ return pvv(o, per === "y3" ? "y1" : per); })))};
    }).filter(function(m){ return m.cnt > 0; });
    A.sort(srt === "r" ? function(a, b){ return (b.avg == null ? -1e9 : b.avg) - (a.avg == null ? -1e9 : a.avg); } : function(a, b){ return b.cnt - a.cnt || (b.avg || 0) - (a.avg || 0); });
    var nPub = A.reduce(function(s, m){ return s + m.pub.length; }, 0), nPv = A.reduce(function(s, m){ return s + m.pv.length; }, 0);
    var row = function(m){
      var by = function(a, pv){ return a.slice().sort(function(x, y){ var u = pv ? pvv(x, per) : x[per], w = pv ? pvv(y, per) : y[per]; return (w == null ? -1e9 : w) - (u == null ? -1e9 : u); }); };
      var pvs = by(m.pv, true), pbs = by(m.pub, false), best = pbs.concat(pvs).filter(function(x){ return (m.pv.indexOf(x) >= 0 ? pvv(x, per) : x[per]) != null; })[0];
      var bestV = best ? (m.pv.indexOf(best) >= 0 ? pvv(best, per) : best[per]) : null;
      var body = (pvs.length ? '<div class="sub2">🔒 사모 ' + pvs.length + '개</div><div class="pd-list">' + pvs.map(function(x, i){ return pvlrow(x, i, per === "y3" ? "y1" : per); }).join("") + '</div>' : '') +
        (pbs.length ? '<div class="sub2">📦 공모 ' + pbs.length + '개</div><div class="pd-list">' + pbs.slice(0, 20).map(function(x, i){ return frow(x, i, per); }).join("") + '</div>' +
          (pbs.length > 20 ? '<details class="pd-mmore"><summary>공모 나머지 ' + (pbs.length - 20) + '개 펼치기</summary><div class="pd-list">' + pbs.slice(20).map(function(x, i){ return frow(x, i + 20, per); }).join("") + '</div></details>' : '') : '') +
        (m.guess ? '<p class="note" style="margin:6px 2px 0">운용사 이름은 펀드 이름 앞머리 기준이라 실제 운용사와 다를 수 있어요(약관에서 확인).</p>' : '');
      return '<details class="pd-mg"' + (q && A.length <= 3 ? ' open' : '') + '><summary><div class="pd-mgh"><div class="pd-n"><b>' + e(mgShort(m.n)) + (m.guess ? ' <span class="mut" style="font-weight:400;font-size:12px">이름 기준</span>' : '') + '</b><small>' +
        (m.pub.length ? '📦 공모 ' + m.pub.length : '') + (m.pub.length && m.pv.length ? ' · ' : '') + (m.pv.length ? '🔒 사모 ' + m.pv.length : '') +
        (best && m.pub.length + m.pv.length > 1 ? ' · 1등 ' + e((m.pv.indexOf(best) >= 0 ? pvname(best.n) : fname(best.n)).slice(0, 22)) + ' ' + sg(bestV) : '') + '</small></div>' +
        '<div class="pd-v">' + (m.avg == null ? '<b class="mut">–</b>' : sg(m.avg)) + '<small>평균 ' + PN[per] + '</small></div></div></summary><div class="pd-mgb">' + body + '</div></details>';
    };
    var lim = SEL.mall ? A.length : 30;
    return '<p class="pd-mgc">' + (q ? '「' + e(SEL.mq) + '」 ' : '') + '운용사 <b>' + A.length + '</b>곳 · 공모 <b>' + nPub.toLocaleString() + '</b> · 사모 <b>' + nPv + '</b></p>' +
      (A.length ? A.slice(0, lim).map(row).join("") : '<div class="empty">찾는 운용사·펀드가 없어요. 이름 일부만 넣어 보세요(예: 타임, 머스트, VIP).</div>') +
      (A.length > lim ? '<button class="pd-mall" id="pdmall">운용사 ' + (A.length - lim) + '곳 더 보기</button>' : '');
  }
  function mgBody(D){
    return card("🏢 운용사별 찾기 <span class='mut'>공모 + 사모</span>",
      '<input id="pdmq" class="pd-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="운용사·펀드 이름 (예: 타임폴리오, 머스트, 삼성)" value="' + e(SEL.mq || "") + '">' +
      seg("pdmk", [["", "전체"], ["pub", "📦 공모"], ["pv", "🔒 사모"]], SEL.mk || "") +
      '<div class="pd-sort"><span class="mut">기간</span>' + seg("pdper", PERS, PER) + '</div>' +
      '<div class="pd-sort"><span class="mut">순서</span>' + seg("pdms", [["n", "펀드 많은 순"], ["r", "평균 수익률 순"]], SEL.ms || "n") + '</div>' +
      (PVL ? '' : '<a href="#" id="pdmpv" class="pd-mpv">🔒 사모는 「사모 라인업」에서 비밀번호로 열면 함께 보여요 ›</a>') +
      '<p class="note" style="margin:6px 2px 0">운용사를 누르면 그 운용사의 사모·공모 펀드가 수익률 순으로 펼쳐지고, 펀드를 누르면 상세가 열려요. 평균은 그 운용사 펀드들의 단순 평균(클래스가 여러 개면 각각 셈)이라 참고용이에요. 사모 3년 수익률은 없어서 1년으로 보여 줘요.</p>') +
      '<div id="pdmlist">' + mgList(D) + '</div>';   // 목록은 카드 밖 — 긴 카드 「전체 보기」 접기에 안 걸리게
  }
  function fundView(D){
    var F = (D.funds || []).filter(function(x){ return x.t; }), k = SEL.fund || "pv";
    if (k === "mir") k = SEL.fund = "pv";
    var h = '<div class="mg-kv"><div><small>🔒 미래에셋 사모 라인업</small><b>' + (PVL ? PVL.rows.length + '개' : '잠김') + '</b><em>' + (PVL ? e(PVL.asof) + ' 사내 화면' : '비밀번호로 열기') + '</em></div>' +
      '<div><small>공모펀드 (미래에셋 펀드검색)</small><b>' + F.length.toLocaleString() + '개</b><em>순자산 10억↑ 수익률 순위</em></div></div>';
    h += seg("pdseg", [["pv", "🔒 사모 라인업"], ["mgr", "🏢 운용사별"], ["all", "🏆 공모 TOP 20"], ["type", "유형별 TOP"]], k) + '<div id="pdbody">' + fundBody(D, k) + '</div>';
    return doc("fund") + h + WARN;
  }
  function fundBody(D, k){
    var F = (D.funds || []).filter(function(x){ return x.t; }), per = PER;
    var by = function(a, p){ p = p || per; return a.filter(function(x){ return x[p] != null; }).sort(function(x, y){ return y[p] - x[p]; }); };
    if (k === "pv" || k === "mir") return pvBody();
    if (k === "mgr") return mgBody(D);
    if (k === "all"){
      var big = by(F.filter(function(x){ return (x.aum || 0) >= 10; })), top = big.slice(0, 20), bot = big.slice(-10).reverse();
      return card("🏆 공모펀드 수익률 TOP 20 <span class='mut'>" + PN[per] + " · 순자산 10억 이상 " + big.length + "개 중</span>", seg("pdper", PERS, per) + '<div class="pd-list">' + top.map(function(x, i){ return frow(x, i, per); }).join("") + '</div>') +
        '<details class="card cpx-d"><summary>📉 ' + PN[per] + ' 가장 많이 빠진 10개</summary><div class="pd-list">' + bot.map(function(x, i){ return frow(x, i, per); }).join("") + '</div></details>';
    }
    var types = {}; F.forEach(function(x){ if ((x.aum || 0) >= 10 && x[per] != null){ (types[x.t] = types[x.t] || []).push(x); } });
    var order = Object.keys(types).sort(function(a, b){ return types[b].length - types[a].length; });
    return seg("pdper", PERS, per) + order.map(function(t){
      var a = by(types[t]), avg = a.reduce(function(s, x){ return s + x[per]; }, 0) / a.length;
      return '<details class="card cpx-d"' + (t === order[0] ? " open" : "") + '><summary>' + e(t) + ' <span class="mut">' + a.length + '개 · 평균 ' + V.sgn(avg) + '%</span></summary><div class="pd-list">' + a.slice(0, 5).map(function(x, i){ return frow(x, i, per); }).join("") + '</div></details>';
    }).join("");
  }
  function fundSheet(x){
    if (!x) return;
    navPush({t: "fund", c: x.c}); closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    var u = "https://securities.miraeasset.com/hks/hks4116/p11.do?fd_cd=" + encodeURIComponent(x.c);
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b>' + e(fname(x.n)) + '</b></div><div class="sh-body">' +
      '<div class="mg-kv"><div><small>' + PN[PER] + ' 수익률</small>' + (x[PER] == null ? '<b>–</b>' : '<b class="' + cls(x[PER]) + '">' + V.sgn(x[PER]) + '%</b>') + '</div><div><small>순자산</small><b>' + (x.aum != null ? fmt(x.aum) + '억' : '–') + '</b></div>' +
      '<div><small>운용사</small><b style="font-size:14px">' + e(x.co || "–") + '</b></div><div><small>위험</small><b>' + (x.rk ? x.rk + '등급' : '–') + '</b><em>1 매우높음 ~ 6 매우낮음</em></div></div>' +
      card("기간별 수익률", V.dbars([["1주", x.w1], ["1개월", x.m1], ["3개월", x.m3], ["6개월", x.m6], ["1년", x.y1], ["3년", x.y3], ["5년", x.y5]].filter(function(r){ return r[1] != null; }).map(function(r){ return {label: r[0], v: r[1]}; }))) +
      card("정보", '<div class="pd-row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>유형 <b>' + e(x.t || "") + (x.st ? " · " + e(x.st) : "") + '</b></span><span>클래스 <b>' + e(x.cls || "–") + '</b></span><span>총보수 <b>' + (x.fee != null ? x.fee + "%" : "–") + '</b>' + (x.sfee ? ' · 선취 ' + x.sfee + '%' : '') + '</span><span>설정일 <b>' + e(x.est ? x.est.slice(0, 4) + "-" + x.est.slice(4, 6) + "-" + x.est.slice(6, 8) : "–") + '</b></span><span>기준가 날짜 <b>' + e(x.d ? x.d.slice(0, 4) + "-" + x.d.slice(4, 6) + "-" + x.d.slice(6, 8) : "–") + '</b></span></div>' +
        '<p class="note"><a href="' + u + '" target="_blank" rel="noopener">미래에셋 상품 상세 열기 ↗</a></p>') +
      '<p class="note" style="padding:0 4px 90px">' + e(x.n) + '</p></div>';
    document.body.appendChild(sh); document.body.classList.add("sheet-open"); try { updBack(); } catch(z) {}
  }

  /* 🎬 ELS 과거 재생 — 10/19 A10/19-1: els_replay.py(els_dart·products 작업)가 기초자산 일봉으로 「2006년부터 매 거래일 가입한 셈」 돌린 결과(archive/x/els_replay.json).
     숫자가 없는 상품(개별주 이름 사전에 없음·조건을 못 읽음)은 띠를 안 그림. 과거 계산 · 미래 보장 아님 · 사라는 말 없음. */
  var ELSREP = null, ELSREPW = null;
  function elsRep(id){
    if (!ELSREP){ if (!ELSREPW) ELSREPW = getJSON("archive/x/els_replay.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ ELSREP = j && j.stats ? j : {stats: {}, by_id: {}}; if (window.__pdRedraw) window.__pdRedraw(); }).catch(function(){ ELSREP = {stats: {}, by_id: {}}; });
      return null; }
    var k = (ELSREP.by_id || {})[id]; return k ? (ELSREP.stats || {})[k] || null : null;
  }
  function repBand(st, full){
    if (!st || !st.k || !st.k.length) return "";
    var n = st.k.length, cyc = st.cyc || 6, mo = function(m){ return m % 12 === 0 ? (m / 12) + "년" : m + "개월"; };
    var first = st.k[0], second = n > 1 ? st.k[1] : null, early = st.k[n - 2] != null ? st.k[n - 2] : st.k[0], all = st.k[n - 1];
    var matOk = st.mat_ok || 0, loss = st.loss || 0;
    var segs = [[all, "var(--up)", "상환"], [matOk, "#a3a3a3", "만기 원금"], [loss, "var(--dn)", "손실"]];
    var bar = '<span class="pd-rpb">' + segs.map(function(sg){ return sg[0] > 0 ? '<i style="width:' + sg[0] + '%;background:' + sg[1] + '" title="' + sg[2] + ' ' + sg[0] + '%"></i>' : ''; }).join("") + '</span>';
    var txt = '<b>' + mo(cyc) + ' 만에 끝 ' + first.toFixed(0) + '%</b>' + (second != null ? ' · ' + mo(cyc * 2) + ' 안 ' + second.toFixed(0) + '%' : '') + ' · 만기 평가 때 상환 ' + Math.max(0, all - early).toFixed(0) + '%' +
      (matOk ? ' · 만기에 ' + (st.ki_touch != null ? '원금+이자(KI 안 닿음) ' : '원금만 ') + matOk.toFixed(0) + '%' : '') +
      ' · <b class="' + (loss || st.loss_avg != null ? 'dn' : '') + '">손실로 끝 ' + (loss < 0.5 && st.loss_avg != null ? '1% 미만' : loss.toFixed(0) + '%') + '</b>' + ((loss || st.loss_avg != null) && st.loss_yrs && st.loss_yrs.length ? '(' + st.loss_yrs.join('·') + ' 가입분)' : '') +
      (st.loss_avg != null ? ' 평균 ' + st.loss_avg.toFixed(0) + '%' : '');
    var wk = st.worst ? Object.keys(st.worst).sort(function(a, b){ return st.worst[b] - st.worst[a]; }) : [];
    var tail = (st.ki_touch != null ? ' · KI 닿은 적 ' + st.ki_touch.toFixed(0) + '%' : '') + (wk.length ? ' · 1차에 발목 잡은 건 주로 <b>' + e(wk[0]) + '</b> ' + st.worst[wk[0]] + '%' : '');
    return '<div class="pd-rep' + (full ? ' full' : '') + '"><div class="pd-rph">🎬 과거 재생 <span class="mut">' + e(st.from) + '~' + e(st.to) + ' 매 거래일 가입 ' + st.n.toLocaleString() + '회 · 기본 스텝다운 기준</span></div>' + bar + '<div class="pd-rpt">' + txt + tail + '</div>' +
      (full ? '<p class="note" style="margin:4px 0 0">기초자산 일봉으로 이 조건(배리어·주기·KI)만 그대로 돌린 과거 계산 — 월지급·리자드·조기상환 뒤 재투자는 안 넣었고, 만기까지 결과가 난 가입일만 셌어요. 미래 보장이 아니고 사라는 뜻도 아니에요.</p>' : '') + '</div>';
  }

  window.__elsApi = {repBand: function(st, f){ return repBand(st, f); }, repMini: function(st){ return repMini(st); }, rep: function(){ return ELSREP; }, D: function(){ return DATA; }, load: function(){ elsRep(""); return ELSREPW || Promise.resolve(); }};   // 🎛 설계기(els_design.js)에서 씀
  function repMini(st){ if (!st || !st.k || !st.k.length) return ""; var cyc = st.cyc || 6, mo = cyc % 12 === 0 ? (cyc / 12) + "년" : cyc + "개월"; return '<span class="pd-rpm"><span>🎬 과거 ' + mo + ' 상환 ' + st.k[0].toFixed(0) + '%</span><b class="' + (st.loss || st.loss_avg != null ? 'dn' : '') + '">과거 손실 ' + ((st.loss || 0) < 0.5 && st.loss_avg != null ? '1% 미만' : (st.loss || 0).toFixed(0) + '%') + '</b></span>'; }

  /* ───────── 🎯 ELS ───────── */
  function dday(d){ if (!d) return ""; var n = Math.round((new Date(d + "T23:59:59+09:00") - Date.now()) / 864e5); return n < 0 ? "마감" : n === 0 ? "오늘 마감" : "D-" + n; }
  function elsRow(x, done){
    var t = x.t, pp = (x.pp || 0) >= 100;
    return '<div class="pd-it pd-e pd-tap"' + reg("els", x) + '><div class="pd-h"><div class="pd-n"><b>' + e(x.n) + '</b><small><span class="chip2 ' + (pp ? "cool" : "hot") + '">' + e(t) + (pp ? " · 원금지급" : " · 원금 비보장") + '</span>' + (x.hi ? '<span class="chip2">고난도</span>' : '') + (x.monthly ? '<span class="chip2">월지급</span>' : '') + (x.dl_e ? '<span class="chip2">숙려 ' + e(md(x.dl_e)) + '까지</span>' : '') + '</small></div>' +
      '<div class="pd-v"><b class="up">' + pc(x.cpn) + '</b><small>연 수익률(세전)</small></div></div>' +
      '<div class="pd-row"><span>기초자산 <b>' + e(x.ua || "–") + '</b></span></div>' +
      '<div class="pd-row"><span>구조 <b>' + e(x.kind || "") + '</b> ' + e(x.desc || "") + '</span></div>' + repBand(elsRep(x.isin)) +
      '<div class="pd-row"><span>만기 <b>' + e(x.mat || "–") + '</b> · ' + e(x.cyc || "") + '마다 상환 기회</span><span>최대 손실 <b class="' + ((x.loss || 0) < 0 ? "dn" : "") + '">' + (x.loss != null ? x.loss + "%" : "–") + '</b></span>' + (x.ki ? '<span>KI <b>' + x.ki + '</b></span>' : '') + '</div>' +
      '<div class="pd-row"><span>청약 ' + e(md(x.s)) + ' ~ ' + e(md(x.e)) + (done ? '' : ' <b class="' + (/오늘|D-[12]$/.test(dday(x.e)) ? "dn" : "") + '">' + dday(x.e) + '</b>') + '</span><span>모인 돈 <b>' + fmt(x.amt) + '억</b> / 한도 ' + fmt(x.lim) + '억' + (x.cr != null ? ' (' + (x.cr * 100).toFixed(1) + '%)' : '') + '</span></div></div>';
  }
  function elsView(D){
    var L = (D.els || []).slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); }), k = SEL.els || "open";
    var pp = L.filter(function(x){ return (x.pp || 0) >= 100; }), np = L.filter(function(x){ return (x.pp || 0) < 100; });
    var ua = {}; L.forEach(function(x){ String(x.ua || "").split(/,\s*/).forEach(function(u){ if (u) ua[u] = (ua[u] || 0) + 1; }); });
    var h = '<div class="mg-kv"><div><small>지금 청약 중</small><b>' + L.length + '개</b><em>ELS ' + np.length + ' · ELB(원금지급) ' + pp.length + '</em></div><div><small>최고 연 수익률</small><b class="up">' + (L[0] ? pc(L[0].cpn) : "–") + '</b><em>' + (L[0] ? e(L[0].n) : "") + '</em></div>' +
      '<div><small>청약 마감</small><b>' + (L.length ? e(md(L.map(function(x){ return x.e; }).sort()[0])) : "–") + '</b><em>' + (L.length ? dday(L.map(function(x){ return x.e; }).sort()[0]) : "") + '</em></div><div><small>많이 쓰는 기초자산</small><b style="font-size:14px">' + Object.keys(ua).sort(function(a, b){ return ua[b] - ua[a]; }).slice(0, 3).map(e).join(", ") + '</b></div></div>';
    h += seg("pdseg", [["open", "🟢 청약 중 " + L.length], ["design", "🎛 설계"], ["cmp", "🏁 타사 비교"], ["done", "최근 청약 완료"]], k) + '<div id="pdbody">' + elsBody(D, k) + '</div>';
    h = doc("els") + h;
    h += '<details class="card cpx-d"><summary>📘 ELS 구조 빨리 읽기</summary><p class="note" style="margin:0">「85-85-85-80-75-70, KI 45」= 6개월마다 기초자산이 처음의 85%·85%·85%·80%·75%·70% 위에 있으면 그때 수익과 함께 끝. <b>KI 45</b>는 중간에 한 번이라도 45% 아래로 떨어지면 만기 때 떨어진 만큼 손실(최대 −100%). 기초자산이 여럿이면 <b>가장 못한 것</b> 기준. ELB는 원금을 증권사가 지급(증권사 신용 위험은 남음). 「고난도」 상품은 숙려기간이 있어 청약 뒤 하루 더 생각할 시간을 줘요.</p></details>';
    return h + WARN;
  }
  function elsBody(D, k){
    if (k === "cmp") return elsCmp(D);
    if (k === "design"){ elsRep(""); return '<div id="elsdz"><div class="loading">설계기 준비 중…</div></div>'; }   // 🎛 10/20 A10/20-1 (els_design.js)
    if (k === "done"){
      var L = (D.els_done || []).slice(0, 40);
      return card("최근 청약 완료 <span class='mut'>" + L.length + "개 · 조건 참고용</span>", L.length ? '<div class="pd-list">' + L.map(function(x){ return elsRow(x, true); }).join("") + '</div>' : '<div class="empty">자료가 없어요.</div>');
    }
    var L = (D.els || []).slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    var np = L.filter(function(x){ return (x.pp || 0) < 100; }), pp = L.filter(function(x){ return (x.pp || 0) >= 100; });
    return (np.length ? card("🎯 ELS · 원금 비보장 <span class='mut'>연 수익률 높은 순 · " + np.length + "개</span>", '<div class="pd-list">' + np.map(function(x){ return elsRow(x); }).join("") + '</div>') : '') +
      (pp.length ? card("🛡️ ELB · 원금지급형 <span class='mut'>" + pp.length + "개</span>", '<div class="pd-list">' + pp.map(function(x){ return elsRow(x); }).join("") + '</div>') : '') +
      (!L.length ? '<div class="empty">지금 청약 중인 상품이 없어요.</div>' : '');
  }


  /* 🏁 ELS 타사 비교 — 10/16 사용자 「Els도 타사들꺼랑 비교해 보기 편하게 · Els 나올때마다 똑같이 계속 비교」
     archive/x/els_all.json ← els_dart.yml(평일 08:23·14:53): 모든 증권사가 DART 에 낸 ELS·ELB 공모 서류의 회차별 조건 */
  var ELSALL = null, ELSWAIT = null;
  var UAN = [[/코스피\s*200|KOSPI\s*200/i, "KOSPI200"], [/S&P\s*500/i, "S&P500"], [/유로\s*스탁스\s*50|EURO\s*STOXX\s*50/i, "EUROSTOXX50"], [/니(케|께)이\s*225|NIKKEI\s*225/i, "NIKKEI225"],
             [/항셍\s*중국(\s*기업)?|HSCEI|H-?지수/i, "HSCEI"], [/항셍\s*(지수)?$|HSI$/i, "HSI"], [/나스닥\s*100|NASDAQ\s*100/i, "NASDAQ100"], [/코스닥\s*150|KOSDAQ\s*150/i, "KOSDAQ150"], [/테슬라|Tesla/i, "테슬라"], [/마이크론|Micron/i, "마이크론"], [/팔란티어|Palantir/i, "팔란티어"], [/엔비디아|NVIDIA/i, "엔비디아"], [/애플|Apple/i, "애플"], [/아마존|Amazon/i, "아마존"], [/마이크로소프트|Microsoft/i, "마이크로소프트"], [/알파벳|Alphabet|구글/i, "알파벳"], [/메타\s*플랫폼|Meta\s*Platforms/i, "메타"], [/브로드컴|Broadcom/i, "브로드컴"], [/어드밴스드\s*마이크로|Advanced\s*Micro|\bAMD\b/i, "AMD"], [/TSMC|Taiwan\s*Semiconductor/i, "TSMC"], [/코인베이스|Coinbase/i, "코인베이스"], [/넷플릭스|Netflix/i, "넷플릭스"], [/일라이\s*릴리|Eli\s*Lilly/i, "일라이릴리"]];
  function uaKey(s){
    var t = String(s || ""), out = [];
    UAN.forEach(function(u){ var re = new RegExp(u[0].source, "gi"); if (re.test(t)){ out.push(u[1]); t = t.replace(new RegExp(u[0].source, "gi"), " "); } });
    t.replace(/\([^)]*\)|\[[^\]]*\]|지수/g, " ").split(/보통주|우선주|,|\/|·|및|\n|\s{2,}/).forEach(function(x){ x = x.replace(/\s+/g, "").trim(); var x2 = x.replace(/Technolog(y|ies)|Inc\.?|Corp(oration)?\.?|Ltd\.?|Co\.|Class[A-Z]?|Platforms|Holdings|테크놀로지|테크놀러지|테크/gi, ""); if (x2.length >= 2) out.push(x); });
    return out.filter(function(x, i){ return out.indexOf(x) === i; }).sort().join(" + ");
  }
  function barSeq(a){ a = a || []; for (var L = 1; L <= a.length / 2; L++){ if (a.length % L) continue; var ok = true; for (var i = L; i < a.length; i++) if (a[i] !== a[i % L]){ ok = false; break; } if (ok) return a.slice(0, L); } return a; }
  function elsCmp(D){
    if (!ELSALL){ if (!ELSWAIT) ELSWAIT = getJSON("archive/x/els_all.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ ELSALL = j; if (window.__pdRedraw) window.__pdRedraw(); }).catch(function(){ ELSALL = {items: [], err: 1}; if (window.__pdRedraw) window.__pdRedraw(); });
      return '<div class="loading">전체 증권사 ELS 불러오는 중…</div>'; }
    var today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    var A = (ELSALL.items || []).filter(function(x){ return x.cpn != null && (x.e || "9999") >= today; });
    if (!A.length) return card("🏁 ELS 타사 비교", '<div class="empty">' + (ELSALL.err ? '자료 준비 중 — 첫 수집 뒤 채워져요.' : '지금 청약 중인 타사 ELS 자료가 없어요.') + '</div>');
    var mir = function(x){ return /미래에셋/.test(x.iss || ""); };
    A.forEach(function(x){ x.uk = uaKey(x.ua); });
    var f = SEL.elsk || "ELS", L = A.filter(function(x){ return f === "all" || x.kind === f; });
    var iss = {}; L.forEach(function(x){ var k = (x.iss || "").replace(/주식회사|\(주\)/g, "").trim(); (iss[k] = iss[k] || []).push(x.cpn); });
    var isl = Object.keys(iss).map(function(k){ var a = iss[k]; return [k, a.length, a.reduce(function(p, c){ return p + c; }, 0) / a.length, Math.max.apply(null, a)]; }).sort(function(a, b){ return b[2] - a[2]; });
    var row = function(x, hi){ return '<tr class="' + (mir(x) ? 'me' : '') + '"><td><b>' + e((x.iss || "").replace(/주식회사|\(주\)/g, "").trim()) + '</b><br><span class="mut">' + e((x.nm.match(/제\s*\[?\d+\]?\s*회/) || [""])[0].replace(/[\[\]\s]/g, "")) + (x.risk ? ' · ' + e(x.risk.replace(/\(.*$/, "")) : '') + '</span></td>' +
      '<td><b class="up">' + pc(x.cpn) + '</b><br><span class="mut">' + (x.kind === "ELB" || x.nolos ? '원금지급' : x.loss != null ? '최대 ' + x.loss + '%' : '원금 비보장') + '</span></td>' +
      '<td>' + (x.bars && x.bars.length ? e(barSeq(x.bars).join("-")) : '–') + (x.ki ? '<br><span class="mut">KI ' + x.ki + '</span>' : '') + repMini(elsRep(x.id)) + '</td>' +
      '<td>' + e(/^\d{4}-/.test(x.mat || "") ? md(x.mat) : (x.mat || "")) + '<br><span class="mut">마감 ' + e(md(x.e || "")) + '</span></td></tr>'; };
    var tblh = '<table class="pd-ec"><tr><th>발행사</th><th>연 수익률</th><th>배리어 · KI</th><th>만기 · 청약</th></tr>';
    var h = '<div class="mg-kv"><div><small>청약 중 전체 (DART)</small><b>' + L.length + '개</b><em>발행사 ' + isl.length + '곳 · ' + e(ELSALL.updated || "") + '</em></div>' +
      '<div><small>가장 높은 연 수익률</small><b class="up">' + pc(Math.max.apply(null, L.map(function(x){ return x.cpn; }))) + '</b><em>' + e((L.slice().sort(function(a, b){ return b.cpn - a.cpn; })[0] || {}).iss || "") + '</em></div></div>' +
      seg("pdelsk", [["ELS", "ELS(원금 비보장)"], ["ELB", "ELB(원금지급)"], ["all", "전체"]], f);
    // ① 미래에셋 청약 중 상품마다: 같은 기초자산 타사
    var M = (D.els || []).filter(function(x){ return f === "all" || (f === "ELB" ? (x.pp || 0) >= 100 : (x.pp || 0) < 100); });
    if (M.length) h += card("🟠 미래에셋 청약 중 상품 vs 같은 기초자산 타사", M.map(function(m){
      var k = uaKey(m.ua), S = L.filter(function(x){ return x.uk === k && !mir(x); }).sort(function(a, b){ return b.cpn - a.cpn; });
      var better = S.filter(function(x){ return x.cpn > m.cpn; }).length;
      var mr = elsRep(m.isin), lossOf = function(st){ return st ? (st.loss || 0) + (st.loss_avg != null && !(st.loss >= 0.5) ? 0.4 : 0) : null; };   // 🎬 10/19: 미래에셋도 같은 과거 재생 · 타사와 「손실로 끝」 비교
      var SR = S.map(function(x){ return elsRep(x.id); }).filter(function(st){ return st; });
      var safer = mr ? SR.filter(function(st){ return lossOf(st) < lossOf(mr) - 0.05; }).length : 0, riskier = mr ? SR.filter(function(st){ return lossOf(st) > lossOf(mr) + 0.05; }).length : 0;
      var mrow = L.filter(function(x){ return mir(x) && x.uk === k && Math.abs(x.cpn - m.cpn) < 0.006; })[0] ||
        {iss: "미래에셋증권", nm: (String(m.n).match(/\d+[a-z]?\)?$/) ? "제" + String(m.n).match(/(\d+)[a-z]?$/)[1] + "회" : ""), cpn: m.cpn, kind: (m.pp || 0) >= 100 ? "ELB" : "ELS", nolos: (m.pp || 0) >= 100, loss: m.loss,
         bars: String(m.desc || "").split(",")[0].split("(")[0].split("-").map(function(b){ return parseFloat(b); }).filter(function(b){ return !isNaN(b); }), ki: m.ki, mat: m.mat, e: m.e, id: m.isin};   // DART 목록에 없는 회차 → 우리 상품 자료로 주황 줄
      return '<div class="pd-ecm"><div class="sub2">' + e(m.n) + ' <span class="mut">' + e(k) + '</span></div><p class="note" style="margin:0 0 6px">미래에셋 <b class="up">연 ' + pc(m.cpn) + '</b>' + (m.ki ? ' · KI ' + m.ki : '') + ' · 「' + e(m.desc || "") + '」 — ' +
        (S.length ? '같은 기초자산 타사 ' + S.length + '개 중 미래에셋보다 수익률 높은 곳 <b>' + better + '개</b>' + (better ? ' (최고 ' + pc(S[0].cpn) + ' ' + e(S[0].iss) + ')' : ' — 미래에셋이 가장 높거나 같아요') : '지금 같은 기초자산 조합의 타사 청약이 없어요') + '</p>' +
        (mr ? repBand(mr) + (SR.length ? '<div class="pd-rcmp">🎬 과거 재생 숫자가 있는 같은 기초자산 타사 ' + SR.length + '개 중 「손실로 끝」 비율이 미래에셋보다 <b>낮은 곳 ' + safer + '개</b> · 높은 곳 ' + riskier + '개 · 같은 수준 ' + (SR.length - safer - riskier) + '개' + (S.length > SR.length ? ' <span class="mut">(나머지 ' + (S.length - SR.length) + '개는 서류에서 배리어·주기를 다 못 읽어 계산 안 함)</span>' : '') + '</div>' : '') : '<div class="pd-rcmp">🎬 과거 재생: 이 상품 기초자산 시세를 아직 못 받아 계산 전이에요(다음 자료 갱신 때 채워짐).</div>') +
        (S.length ? tblh + (mrow ? row(mrow) : '') + S.slice(0, 8).map(function(x){ return row(x); }).join("") + '</table>' : '') + '</div>'; }).join("") +
      '<p class="note">수익률만 보지 말고 KI(낮을수록 안전)·첫 조기상환 배리어(높을수록 상환이 어려움)·만기를 같이 비교하세요. 같은 기초자산이라도 구조가 다르면 수익률이 달라요.</p>');
    // ② 발행사별 평균
    h += card("🏢 발행사별 평균 연 수익률 <span class='mut'>청약 중 · " + (f === "all" ? "전체" : f) + "</span>", '<div class="pd-hl">' + isl.map(function(r){ var mx = isl[0][2] || 1;
      return '<div><span class="n">' + e(r[0]) + ' <em>' + r[1] + '개 · 최고 ' + r[3].toFixed(2) + '%</em></span><span class="xbar"><i style="width:' + (r[2] / mx * 100).toFixed(0) + '%;background:' + (/미래에셋/.test(r[0]) ? '#f59e0b' : 'var(--c)') + '"></i></span><b>' + r[2].toFixed(2) + '%</b></div>'; }).join("") + '</div>');
    // ③ 기초자산 조합별 전체
    var G = {}; L.forEach(function(x){ (G[x.uk] = G[x.uk] || []).push(x); });
    var gk = Object.keys(G).sort(function(a, b){ return G[b].length - G[a].length; });
    h += '<div class="sec" style="margin-top:6px">기초자산 조합별 전체 <span class="mut">' + gk.length + '가지 · 연 수익률 높은 순</span></div>' + gk.map(function(k, i){ var a = G[k].sort(function(x, y){ return y.cpn - x.cpn; });
      return '<details class="card cpx-d"' + (i < 2 ? ' open' : '') + '><summary>' + e(k || "기타") + ' <span class="mut">' + a.length + '개 · ' + pc(a[a.length - 1].cpn) + '~' + pc(a[0].cpn) + (a.some(mir) ? ' · 🟠 미래에셋 있음' : '') + '</span></summary>' + tblh + a.map(function(x){ return row(x); }).join("") + '</table></details>'; }).join("");
    return h + '<p class="note">금융감독원 DART 「일괄신고추가서류(주가연계증권·주가연계파생결합사채)」를 회차마다 읽어 뽑은 조건이에요(' + e(ELSALL.updated || "") + ' · 평일 하루 두 번 새로 냄). 서류 문장을 자동으로 읽은 거라 배리어·KI 가 빠지거나 다르게 읽힐 수 있어요 — 청약 전엔 각 증권사 투자설명서로 확인하세요. 🟠 = 미래에셋.</p>';
  }
  /* ───────── 🧾 누르면 펼쳐지는 설명·모의 투자계산서 ───────── */
  function W(v){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v), s = v < 0 ? "−" : ""; return a >= 1e8 ? s + (a / 1e8).toFixed(2).replace(/\.?0+$/, "") + "억원" : s + Math.round(a / 1e4).toLocaleString() + "만원"; }
  function amtBar(){ return '<div class="pd-amt"><span class="mut">투자금</span>' + [500, 1000, 3000, 5000, 10000].map(function(a){ return '<button data-amt="' + a + '"' + (a === AMT ? ' class="on"' : '') + '>' + (a >= 10000 ? (a / 10000) + "억" : a.toLocaleString() + "만") + '</button>'; }).join("") + '</div>'; }
  function tbl(rows){ return '<table class="pd-tb">' + rows.map(function(r){ return '<tr><td>' + r[0] + '</td><td class="' + (r[2] || "") + '">' + r[1] + '</td></tr>'; }).join("") + '</table>'; }
  function pvf(y, n, c){ return c / y * (1 - Math.pow(1 + y, -n)) + 100 / Math.pow(1 + y, n); }       // 연 이표 c(%), 수익률 y, n년 → 액면 100 당 값
  function dur(y, n, c){ var P = pvf(y, n, c), d = 0; for (var t = 1; t <= Math.ceil(n); t++){ var cf = (t <= n ? c : 0) + (t === Math.ceil(n) ? 100 : 0); d += t * cf / Math.pow(1 + y, t); } return d / P / (1 + y); }   // 수정 듀레이션(근사)
  function bondCalc(A, px, y, n, cpnKnown, taxFree){
    // A 원, 단가 px(액면 10,000 당), 세전 수익률 y(%), 잔존 n 년. 이표 c 는 이름에서 알면 그것, 아니면 단가·수익률로 역산
    var yy = y / 100, c = cpnKnown != null ? cpnKnown : Math.max(0, (px / 100 - 100 / Math.pow(1 + yy, n)) * yy / (1 - Math.pow(1 + yy, -n)));
    var face = A / px * 10000, cpnY = face * c / 100, cpnAll = cpnY * n, tax = taxFree ? 0 : cpnAll * 0.154, gain = face - A;
    var tot = face + cpnAll - tax, cagr = n > 0 ? (Math.pow(tot / A, 1 / n) - 1) * 100 : 0, D = dur(yy, n, c);
    return {c: c, face: face, cpnY: cpnY, cpnAll: cpnAll, tax: tax, gain: gain, tot: tot, cagr: cagr, D: D};
  }
  /* 📅 만기까지 현금흐름 — 10/16 사용자 「모의투자계산서는 만기까지 현금흐름 다 나오게」 */
  function addM(d, m){ var x = new Date(d.getTime()); var day = x.getUTCDate(); x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + m); var last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate(); x.setUTCDate(Math.min(day, last)); return x; }
  function ymd(d){ return d.toISOString().slice(0, 10); }
  function sched(mat, freq){   // 만기에서 거꾸로 freq 개월씩 → 오늘 이후 지급일
    var m = new Date(mat + "T00:00:00Z"), now = new Date(), out = [];
    var eom = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate() === m.getUTCDate();   // 말일 만기(9/30 등)면 이자일도 말일
    for (var k = 0; k < 400; k++){ var d = addM(m, -freq * k); if (eom) d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)); if (d <= now) break; out.unshift(d); }
    return out;
  }
  function cfTable(rows, cur, fx, note){
    // rows: [날짜, 내용, 세전, 세금, 세후(받는 돈)] — 외화면 cur/fx 로 원화 환산 열 추가
    var cum = 0, fmtC = function(v){ return v == null ? "" : cur ? Math.round(v).toLocaleString() : Math.abs(v) >= 1e8 ? W(v) : Math.round(v).toLocaleString() + "원"; };
    var krw = function(v){ return Math.abs(v) >= 1e8 ? W(v) : Math.round(v).toLocaleString() + "원"; };
    var body = rows.map(function(r){ cum += r[4]; return '<tr><td>' + e(r[0]) + '</td><td>' + r[1] + (r[3] ? '<br><span class="mut">세전 ' + fmtC(r[2]) + ' · 세금 −' + fmtC(r[3]) + '</span>' : '') + '</td><td><b>' + fmtC(r[4]) + '</b>' + (cur && fx ? '<br><span class="mut">≈ ' + krw(r[4] * fx) + '</span>' : '') + '</td></tr>'; }).join("");
    var tg = rows.reduce(function(s, r){ return s + r[2]; }, 0), tt = rows.reduce(function(s, r){ return s + (r[3] || 0); }, 0);
    return '<div class="sub2">📅 만기까지 현금흐름 <span class="mut">' + rows.length + '번' + (cur ? ' · ' + cur : '') + '</span></div><div class="pd-cfw"><table class="pd-cf"><tr><th>날짜</th><th>내용</th><th>받는 돈</th></tr>' + body +
      '<tr class="sum"><td>합계</td><td>' + (tt ? '<span class="mut">세전 ' + fmtC(tg) + ' · 세금 −' + fmtC(tt) + '</span>' : '') + '</td><td><b>' + fmtC(cum) + '</b>' + (cur && fx ? '<br><span class="mut">≈ ' + krw(cum * fx) + '</span>' : '') + '</td></tr></table></div>' + (note ? '<p class="note">' + note + '</p>' : '');
  }
  function xpanel(R){
    var k = R.k, o = R.o, A = AMT * 1e4, h = "";
    if (k === "krw"){
      var m = /(\d{5})-/.exec(o.name), cpn = o.cpn != null ? o.cpn : m ? +m[1] / 1000 : null, n = o.yrs + o.days / 365, b = bondCalc(A, o.px, o.pre, n, cpn, false);
      if (/복리/.test(o.ctype || (/국민주택/.test(o.name) ? "복리" : ""))){ var _iss = new Date(o.issue + "T00:00:00Z"), _t = (new Date(o.mat + "T00:00:00Z") - _iss) / 365.25 / 864e5, _fin = b.face * Math.pow(1 + b.c / 100, _t), _ih = _fin - b.face * Math.pow(1 + b.c / 100, _t - n);
        b.cpnAll = _ih; b.tax = _ih * 0.154; b.tot = b.face + (_fin - b.face) - b.tax; b.gain = b.face - A; }
      var why = o.kind === "국채" ? "대한민국 정부가 갚는 채권이라 부도 걱정은 거의 없어요." : o.kind === "공사채·지방채" ? "공기업·지자체가 발행 — 사실상 정부가 뒤에 있어 국채 다음으로 안전해요." : o.kind === "신종·후순위" ? "은행·금융지주의 만기 없는 채권 — 금리가 높은 대신 은행이 부실해지면 원금이 0이 될 수 있고(상각), 콜(보통 5년)을 안 할 수도 있어요." : "일반 회사가 발행 — 신용등급이 낮을수록 금리가 높고 부도 위험이 있어요.";
      h += '<p>' + why + ' ' + (cpn != null ? '표면금리 ' + cpn.toFixed(3) + '%로 ' + e(o.issue.slice(0, 7)) + '에 발행, ' : '') + (o.px < 9000 ? '액면 10,000원짜리를 <b>' + fmt(o.px) + '원</b>에 싸게 사서 만기에 10,000원을 받는 몫이 커요 — 그 차익은 개인 비과세라 세후 수익률이 좋아요. ' : '단가가 액면(10,000원)에 가까워 수익 대부분이 이자(과세)예요. ') +
        (n >= 10 ? '잔존 ' + n.toFixed(1) + '년으로 길어서 시장 금리가 1%p 움직이면 값이 약 <b>' + (b.D).toFixed(0) + '%</b> 움직여요(중간에 팔 때 얘기 · 만기까지 들면 상관없음).' : '잔존 ' + n.toFixed(1) + '년 — 금리가 1%p 움직여도 값은 약 ' + b.D.toFixed(1) + '% 정도만 흔들려요.') + '</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">만기까지 들고 있을 때</span></div>' + amtBar() + tbl([
        ["산 금액", W(A)], ["받는 액면(만기 원금)", W(b.face) + ' <span class="mut">(' + fmt(o.px) + '원에 ' + Math.round(b.face / 1e4).toLocaleString() + '만원어치)</span>'],
        ["이자 (연 " + b.c.toFixed(2) + "% × " + n.toFixed(1) + "년)", W(b.cpnAll)], ["이자 세금 15.4%", "−" + W(b.tax), "dn"], ["만기 차익 (액면 − 산 금액 · 비과세)", (b.gain >= 0 ? "+" : "") + W(b.gain), b.gain >= 0 ? "up" : "dn"],
        ["<b>만기에 손에 쥐는 돈</b> <span class='mut'>이자 재투자 없이 합산</span>", "<b>" + W(b.tot) + "</b> <span class='mut'>" + V.sgn((b.tot / A - 1) * 100, 0) + "%</span>", "up"], ["미래에셋 표기 세후 수익률(연·복리)", pc(o.after)],
        ["1년 뒤 금리 +1%p 때 팔면", "약 " + W(A * (1 - b.D / 100) + b.cpnY * 0.846), "dn"], ["1년 뒤 금리 −1%p 때 팔면", "약 " + W(A * (1 + b.D / 100) + b.cpnY * 0.846), "up"]]);
      // 현금흐름: 이표채 = 주기마다 이자, 복리채 = 만기에 원리금 한 번, 할인채 = 만기에 액면
      var ct = o.ctype || (/국민주택/.test(o.name) ? "복리채" : "이표채"), fq = o.freq || (o.kind === "국채" ? 6 : 3), rows = [];
      if (/복리/.test(ct)){
        var iss = new Date(o.issue + "T00:00:00Z"), matd = new Date(o.mat + "T00:00:00Z"), tTot = (matd - iss) / 365.25 / 864e5, tHeld = n;
        var fin = b.face * Math.pow(1 + b.c / 100, tTot), intHeld = b.face * (Math.pow(1 + b.c / 100, tTot) - Math.pow(1 + b.c / 100, tTot - tHeld));
        rows.push([o.mat, "원금 + 복리 이자 (연 " + b.c.toFixed(2) + "% · 발행부터 " + tTot.toFixed(1) + "년)", fin, intHeld * 0.154, fin - intHeld * 0.154]);
      } else if (/할인/.test(ct)){
        rows.push([o.mat, "액면 상환", b.face, 0, b.face]);
      } else {
        var ds = sched(o.mat, fq), cp = b.face * (b.c / 100) * fq / 12;
        ds.forEach(function(d, i){ var last = i === ds.length - 1; rows.push([ymd(d), last ? "마지막 이자 + 원금" : (i + 1) + "회차 이자", cp + (last ? b.face : 0), cp * 0.154, cp * 0.846 + (last ? b.face : 0)]); });
      }
      h += cfTable(rows, "", null, e(ct) + ' · 이자 ' + fq + '개월마다 · 표면금리 ' + b.c.toFixed(3) + '% · ' + e(o.redeem || "만기일시상환") + '. 첫 이자는 실제로는 산 날부터 보유한 기간만큼만 과세(보유기간 과세)라 세금이 조금 다를 수 있어요. 매수 단위·수수료는 매매 화면 기준.');
    }
    else if (k === "ust" && (o.frn || o.ytm == null)){
      h += '<p><b>변동금리채(FRN)</b> — 이자가 매주 13주 T-Bill 금리 + 고정 가산(스프레드)으로 바뀌고 3개월마다 들어와요. 금리가 올라도 값이 거의 안 흔들려 사실상 「달러 예금 + 미국 정부 신용」이에요. 만기 ' + e(o.mat) + '. 수익은 단기 금리와 환율에 달려 있어 고정 계산서는 만들지 않았어요.</p>';
    }
    else if (k === "ust" || k === "aud" || k === "bru"){
      if (o.tips) h += '<p><b>물가연동국채(TIPS)</b> — 원금이 미국 소비자물가(CPI)만큼 불어나고, 그 불어난 원금에 표면금리 이자를 줘요. 아래 수익률은 <b>물가를 뺀 실질 수익률</b>이라 실제 달러 수익은 「실질 수익률 + 물가상승률」이에요(계산서는 물가 0% 가정 — 실제로는 그만큼 더).</p>';
      if (o.est) h += '<p class="note">이 종목 수익률은 재무부 수익률 곡선으로 추정한 값이에요(실제 호가와 0.1~0.5%p 다를 수 있음). 아래 계산서도 그 추정치 기준.</p>';
      var cur = k === "aud" ? "호주달러" : "달러", fx = o.fx || 1, n = Math.max(0.1, (new Date(o.mat) - Date.now()) / 365.25 / 864e5), yy = o.ytm / 100, c = o.cpn || 0, P = pvf(yy, n, c);
      var A_f = A / fx, face = A_f / P * 100, cpnAll = face * c / 100 * n, tax = cpnAll * 0.154, tot = face + cpnAll - tax;
      var D = dur(yy, n, c);
      h += '<p>' + (k === "ust" ? "미국 정부가 갚는 달러 채권이에요. " : k === "bru" ? "브라질 정부(BB · 투기등급)가 갚는 달러 채권이에요" + (o.sp != null ? " — 같은 만기 미국채보다 연 " + o.sp.toFixed(2) + "%p 더 줘요(브라질 위험값). " : ". ") : "호주 정부(AAA)가 갚는 호주달러 채권이에요. ") + '표면금리 ' + pc(c, 3) + ', 지금 가격에 사면 연 <b>' + pc(o.ytm) + '</b>(' + cur + ' 기준·세전). ' + (c < 2 ? '표면금리가 낮아 이자 대신 싸게 사서(100당 약 ' + P.toFixed(1) + ') 만기에 액면을 받는 몫이 커요 — 그 차익은 비과세라 세금 면에서 좋아요. ' : '') +
        (n >= 8 ? '만기가 ' + n.toFixed(1) + '년 남아 금리가 1%p 내리면 값이 약 ' + D.toFixed(0) + '% 오르고, 오르면 그만큼 빠져요(금리 하락에 거는 투자). ' : '만기가 ' + n.toFixed(1) + '년으로 짧아 금리보다 환율이 수익을 좌우해요. ') + '환차익은 비과세, 이자는 15.4%' + (k === "bru" ? '(브라질 달러채도 헤알 국채처럼 비과세인지는 창구 확인 — 비과세면 아래 세금 줄이 0이 돼요)' : '') + '.</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">환율 ' + fmt(fx) + '원 기준 · 만기 보유</span></div>' + amtBar() + tbl([
        ["산 금액", W(A) + ' <span class="mut">= ' + Math.round(A_f).toLocaleString() + ' ' + cur + '</span>'], ["만기 원금 (액면)", Math.round(face).toLocaleString() + " " + cur], ["이자 합계 (" + n.toFixed(1) + "년)", Math.round(cpnAll).toLocaleString() + " " + cur], ["이자 세금 15.4%", "−" + Math.round(tax).toLocaleString() + " " + cur, "dn"],
        ["<b>만기에 받는 " + cur + "</b>", "<b>" + Math.round(tot).toLocaleString() + " " + cur + "</b>"],
        ["환율 그대로 (" + fmt(fx) + ")", W(tot * fx) + " <span class='mut'>" + V.sgn((tot * fx / A - 1) * 100) + "%</span>", "up"],
        ["환율 10% 하락 (" + fmt(fx * 0.9) + ")", W(tot * fx * 0.9) + " <span class='mut'>" + V.sgn((tot * fx * 0.9 / A - 1) * 100) + "%</span>", tot * 0.9 >= A / fx ? "" : "dn"],
        ["환율 10% 상승 (" + fmt(fx * 1.1) + ")", W(tot * fx * 1.1) + " <span class='mut'>" + V.sgn((tot * fx * 1.1 / A - 1) * 100) + "%</span>", "up"],
        ["1년 뒤 금리 ±1%p 때 값", "약 " + V.sgn(-D) + "% / " + V.sgn(D) + "%"]]);
      var dsu = sched(o.mat, 6), cpu = face * c / 100 / 2, ru = [];
      dsu.forEach(function(d, i){ var last = i === dsu.length - 1; ru.push([ymd(d), last ? "마지막 이자 + 원금" : (i + 1) + "회차 이자", cpu + (last ? face : 0), cpu * 0.154, cpu * 0.846 + (last ? face : 0)]); });
      if (!c) ru = [[o.mat, "액면 상환 (무이표)", face, 0, face]];
      h += cfTable(ru, cur, fx, '이자는 6개월마다 ' + cur + '로 들어와요(원화 환산은 지금 환율 ' + fmt(fx) + '원 그대로 가정). 환전·매매 수수료는 뺐어요.');
    }
    else if (k === "brl"){
      var fx = o.fx || 1, n = Math.max(0.05, (new Date(o.mat) - Date.now()) / 365.25 / 864e5), r = o.r || 0, code = o.code, IP = 4.5;
      var A_b = A / fx, units = A_b / (o.pu || 1000), rows = [], md = new Date(o.mat + "T00:00:00Z");
      var t_ = function(d){ return Math.max(0, (d - Date.now()) / 365.25 / 864e5); };
      if (code === "LTN"){ rows.push([o.mat, "액면 R$1,000 × " + units.toFixed(2) + "개", units * 1000, 0, units * 1000]); }
      else if (code === "NTN-F"){
        var cpf = 1000 * (Math.pow(1.10, 0.5) - 1), dsf = sched(o.mat, 6);
        dsf.forEach(function(d, i){ var last = i === dsf.length - 1; rows.push([ymd(d), last ? "마지막 이자 + 액면" : (i + 1) + "회차 이자 (연 10%)", units * (cpf + (last ? 1000 : 0)), 0, units * (cpf + (last ? 1000 : 0))]); });
      } else if (code === "NTN-B" || code === "NTN-C"){
        // VNA(물가로 불어난 원금) 추정: 지금 단가 = VNA × Σ 할인된 실질 현금흐름(실질 금리 r)
        var real = code === "NTN-B" ? Math.pow(1.06, 0.5) - 1 : Math.pow(1.12, 0.5) - 1, dsb = sched(o.mat, 6), pct = 0;
        dsb.forEach(function(d, i){ var tt = t_(d); pct += (real + (i === dsb.length - 1 ? 1 : 0)) / Math.pow(1 + r / 100, tt); });
        var vna0 = (o.pu || 0) / (pct || 1);
        dsb.forEach(function(d, i){ var last = i === dsb.length - 1, vna = vna0 * Math.pow(1 + IP / 100, t_(d)), cf = vna * (real + (last ? 1 : 0)); rows.push([ymd(d), last ? "마지막 이자 + 원금(물가 반영)" : (i + 1) + "회차 이자 (실질 연 " + (code === "NTN-B" ? 6 : 12) + "%)", units * cf, 0, units * cf]); });
      } else {   // LFT
        rows.push([o.mat, "원금 × Selic 누적 (Selic 연 10.5% 가정 · 실제는 변동)", units * (o.pu || 0) * Math.pow(1 + 0.105, n), 0, units * (o.pu || 0) * Math.pow(1 + 0.105, n)]);
      }
      var totb = rows.reduce(function(s_, x){ return s_ + x[4]; }, 0);
      h += '<p>' + (code === "LTN" ? "이자 없이 싸게(R$ " + fmt(o.pu) + ") 사서 만기에 액면 R$1,000을 받는 <b>할인채(LTN)</b>예요." : code === "NTN-F" ? "6개월마다 이자(연 10%, 매년 1월·7월 1일)를 주는 <b>이표채(NTN-F)</b>예요. 지금 단가 R$ " + fmt(o.pu) + "는 시장 금리 " + r.toFixed(2) + "%를 반영한 값." : code === "LFT" ? "Selic(브라질 기준금리)만큼 불어나는 <b>변동금리채(LFT)</b> — 금리 위험은 거의 없고 환율만 남아요." : "<b>물가채(" + code + ")</b> — 원금이 브라질 물가(IPCA)만큼 불어나고 그 위에 실질 연 " + (code === "NTN-B" ? "6%" : "12%") + " 이자를 6개월마다 줘요. 시장 실질금리 " + r.toFixed(2) + "%.") +
        ' 개인은 이자·차익·환차익 모두 <b>비과세</b>. 헤알/원 환율이 결과를 다 바꿔요.</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">헤알/원 ' + fmt(fx) + ' 기준 · 만기 보유 · 세금 0' + (code === "NTN-B" || code === "NTN-C" ? ' · 브라질 물가 연 ' + IP + '% 가정' : '') + '</span></div>' + amtBar() + tbl([
        ["산 금액", W(A) + ' <span class="mut">= R$ ' + Math.round(A_b).toLocaleString() + ' (' + units.toFixed(2) + '개)</span>'], ["만기까지 받는 헤알 합계", "R$ " + Math.round(totb).toLocaleString()],
        ["환율 그대로 (" + fmt(fx) + "원)", W(totb * fx) + " <span class='mut'>" + V.sgn((totb * fx / A - 1) * 100) + "%</span>", "up"],
        ["헤알 20% 약세 (" + fmt(fx * 0.8) + "원)", W(totb * fx * 0.8) + " <span class='mut'>" + V.sgn((totb * fx * 0.8 / A - 1) * 100) + "%</span>", totb * 0.8 >= A_b ? "" : "dn"],
        ["헤알 40% 약세 (" + fmt(fx * 0.6) + "원)", W(totb * fx * 0.6) + " <span class='mut'>" + V.sgn((totb * fx * 0.6 / A - 1) * 100) + "%</span>", totb * 0.6 >= A_b ? "" : "dn"],
        ["헤알 20% 강세 (" + fmt(fx * 1.2) + "원)", W(totb * fx * 1.2) + " <span class='mut'>" + V.sgn((totb * fx * 1.2 / A - 1) * 100) + "%</span>", "up"]]);
      h += cfTable(rows, "헤알(R$)", fx, 'ANBIMA 지표금리·단가 기준이라 미래에셋 중개 호가와 수수료(연 0.15~0.30%)에 따라 달라요. 원화 환산은 지금 환율 그대로 가정 — 실제로는 받는 날의 환율. 받은 이자를 다시 투자하지 않은 단순 합계예요.');
    }
    else if (k === "fund" || k === "pv"){
      var isPv = k === "pv", sfee = isPv ? 0 : (o.sfee || 0), fee = o.fee;
      var pers = isPv ? [["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"]] : [["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"], ["y3", "3년"], ["y5", "5년"]];
      var net = A * (1 - sfee / 100);
      h += '<p>' + (isPv ? '<b>' + e(o.co) + '</b>의 ' + e(o.t) + ' 사모펀드 — 설정 ' + e((o.est || "").slice(0, 4)) + '년, 설정액 ' + fmt(o.amt) + '억, 기준가 ' + fmt(o.nav) + '. 49인 이하에게 비공개로 팔리는 펀드라 일반 창구에서는 못 사고 판매사·최소금액(보통 3억)이 따로 있어요. 수익률은 금투협 기준가 비교값이라 분배금·결산은 빠져 있어요.' :
        '<b>' + e(o.co) + '</b>의 ' + e(o.t) + (o.st ? '(' + e(o.st) + ')' : '') + ' 공모펀드 — 순자산 ' + fmt(o.aum) + '억, 위험 ' + (o.rk || "–") + '등급(1 매우높음~6 매우낮음), 설정 ' + e((o.est || "").slice(0, 4)) + '년. ' + (o.cls ? '클래스 「' + e(o.cls) + '」: ' : '') + (sfee ? '살 때 <b>선취 ' + sfee + '%</b>를 떼고, ' : '선취 수수료 없이, ') + (fee != null ? '매년 총보수 <b>' + fee + '%</b>가 기준가에서 빠져요(아래 수익률엔 이미 반영).' : '')) + '</p>';
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">「그때 샀다면 지금」 · 과거 수익률 그대로</span></div>' + amtBar() + tbl([["산 금액", W(A)]].concat(sfee ? [["선취 수수료 " + sfee + "%", "−" + W(A - net), "dn"]] : []).concat(pers.filter(function(p){ return o[p[0]] != null; }).map(function(p){
        var v = net * (1 + o[p[0]] / 100); return [p[1] + " 전 샀다면 지금", W(v) + " <span class='mut'>" + V.sgn(o[p[0]]) + "%</span>", v >= A ? "up" : "dn"]; })).concat(fee != null && !isPv ? [["매년 나가는 보수 (" + fee + "%)", "약 " + W(A * fee / 100) + "/년"]] : []));
      if (!isPv) h += '<div class="pd-hold" data-hold="' + e(o.c) + '"><div class="sub2">🧺 펀드 구성 <span class="mut">불러오는 중…</span></div></div>';
      else h += '<p class="note">🧺 사모펀드는 보유 종목을 공개하지 않아요 — 분기마다 투자자에게만 자산운용보고서로 알려 줘요.</p>';
      h += '<p class="note">이익에 15.4% 세금(국내 주식 매매차익은 비과세, 해외·채권·배당은 과세)이 붙고, 환매는 신청 뒤 2~10일 걸려요. 과거 수익률이 앞으로도 같다는 뜻은 아니에요.' + (!isPv ? ' <a href="https://securities.miraeasset.com/hks/hks4116/p11.do?fd_cd=' + encodeURIComponent(o.c) + '" target="_blank" rel="noopener">미래에셋 상품 상세 ↗</a>' : '') + '</p>';
    }
    else if (k === "els"){
      var cpn = o.cpn || 0, pp = (o.pp || 0) >= 100, half = A * cpn / 100 / 2, t = 0.154;
      h += '<p>' + (pp ? '<b>원금지급형(ELB)</b> — 조건이 안 맞아도 원금은 미래에셋증권이 줘요(증권사 신용 위험만). ' : '<b>원금 비보장</b> — ') + '기초자산 <b>' + e(o.ua) + '</b>' + (String(o.ua || "").split(",").length > 1 ? '(여럿이면 가장 못한 것 기준)' : '') + ', 「' + e(o.desc) + '」. ' + (o.ki ? 'KI ' + o.ki + ': 3년 중 한 번이라도 처음의 ' + o.ki + '% 아래로 가면 만기 때 떨어진 만큼 손실. ' : '') + (o.monthly ? '매달 이자를 주는 월지급식. ' : '') + (o.hi ? '고난도 상품이라 청약 뒤 숙려기간에 취소할 수 있어요.' : '') + '</p>' + repBand(elsRep(o.isin), true);
      h += '<div class="sub2">🧾 모의 투자계산서 <span class="mut">연 ' + pc(cpn) + ' · 세전/세후</span></div>' + amtBar() + tbl([["산 금액", W(A)],
        ["6개월 만에 조기상환", W(A + half * (1 - t)) + " <span class='mut'>이자 " + W(half) + " − 세금</span>", "up"], ["1년 만에 조기상환", W(A + 2 * half * (1 - t)), "up"], ["만기(" + e(o.mat) + ")까지 가서 상환", W(A + 6 * half * (1 - t)) + " <span class='mut'>세전 " + W(A + 6 * half) + "</span>", "up"]].concat(pp ? [] : [
        ["KI 뚫고 만기에 기초자산 −40%", W(A * 0.6), "dn"], ["KI 뚫고 만기에 기초자산 −60%", W(A * 0.4), "dn"]]));
      var bars = String(o.desc || "").split(",")[0].split("-").map(function(x){ return parseFloat(x); }).filter(function(x){ return !isNaN(x); });
      var cycm = parseInt(o.cyc) || 6, start = new Date((o.e || ymd(new Date())) + "T00:00:00Z"), er = [];
      bars.forEach(function(bv, i){ var d = addM(start, cycm * (i + 1)), cp = A * cpn / 100 * cycm * (i + 1) / 12;
        er.push([ymd(d), (i === bars.length - 1 ? "만기 평가" : (i + 1) + "차 조기상환 평가") + " — 기초자산이 처음의 <b>" + bv + "%</b> 이상이면", A + cp, cp * 0.154, A + cp * 0.846]); });
      if (er.length){
        var ets = '<div class="sub2">📅 상환 일정 · 회차별 받는 돈 <span class="mut">그 회차에 조건을 맞추면 그때 끝</span></div><div class="pd-cfw"><table class="pd-cf"><tr><th>평가일<br><span class="mut">(예상)</span></th><th>조건</th><th>받는 돈</th></tr>' +
          er.map(function(r){ return '<tr><td>' + e(r[0]) + '</td><td>' + r[1] + '<br><span class="mut">세전 ' + W(r[2]) + ' · 세금 −' + W(r[3]) + '</span></td><td><b>' + W(r[4]) + '</b></td></tr>'; }).join("") +
          (pp ? '' : '<tr class="sum"><td>만기</td><td>' + (o.ki ? 'KI ' + o.ki + '% 아래로 한 번이라도 갔고 만기에 ' + bars[bars.length - 1] + '% 미만이면' : '만기 조건 미달이면') + ' — 떨어진 만큼 손실 (−40%면)</td><td><b class="dn">' + W(A * 0.6) + '</b></td></tr>') + '</table></div>';
        h += ets + (o.monthly ? '<p class="note">월지급식: 위와 별도로 매달 기초자산이 월지급 배리어 위면 월 이자(연 ' + pc(cpn) + ' ÷ 12)가 들어와요.</p>' : '');
      }
      h += '<p class="note">평가일은 청약 마감 뒤 ' + cycm + '개월 간격으로 잡은 예상일이라 실제 날짜는 투자설명서 기준. 이자 15.4% 과세(금융소득종합과세 대상). 중도 해지는 평가금액의 95% 안팎. 배정은 청약 경쟁에 따라 줄 수 있어요.</p>';
    }
    else if (k === "pvl"){
      var S = (PVL && PVL.S || {})[o.s] || [o.s, "", "", ""], usd = o.usd, bm = (PVL && PVL.bm) || [], kospi = bm[0] || {}, kosdaq = bm[1] || {};
      h += '<div class="sub2">📘 ' + e(S[0]) + ' <span class="mut">' + e(o.s) + '</span></div><p>' + e(S[1]) + '</p><p>🧺 <b>' + e(S[2].split(" — ")[0]) + '</b> — ' + e(S[2].split(" — ").slice(1).join(" — ")) + '</p><p>👀 ' + e(S[3]) + '</p>';
      if (o.live){ var SN = {d1: "1일", w1: "1주", m1: "1개월", m3: "3개월", m6: "6개월", y1: "1년", ytd: "올해"}, cs = [], ch_ = [];
        Object.keys(SN).forEach(function(k){ var v = o.live.src[k]; if (v === "calc" || v === "kofia") cs.push(SN[k]); else if (v === "chain") ch_.push(SN[k]); });
        h += '<p class="pd-lvp">📡 금융투자협회 공시 기준가로 ' + e(o.live.asof) + '까지 <b>직접 계산</b> — ' + (cs.length ? cs.join("·") + '은 기준가 기록으로' : '') + (ch_.length ? (cs.length ? ', ' : '') + ch_.join("·") + '은 아직 기록이 짧아 ' + amd() + ' 값에 그 뒤 변화(' + V.sgn(o.live.ch) + '%)를 이어 붙였어요(기록이 쌓이면 자동으로 직접 계산)' : '') + '.' + (o.live.resets && o.live.resets.length ? ' 결산으로 기준가가 리셋된 날(' + o.live.resets.map(function(d){ return d.slice(5); }).join(", ") + ')은 빼고 이어 붙였어요.' : '') + '</p>'; }
      else if (o.est) h += '<p class="pd-lvp">🧮 <b>추정</b> — 이 펀드는 기준가가 어디에도 공개되지 않아 <b>' + e(o.est.by) + '</b>로 계산했어요. 후보 ' + o.est.tried + '개 중 ' + amd() + ' 화면의 기간 성적(' + o.est.n + '개 기간)과 가장 잘 맞음: 민감도 ' + o.est.b + '배, 평균 오차 ±' + o.est.err + '%p(' + (o.est.err < 3 ? '잘 맞음' : o.est.err < 6 ? '보통' : '느슨함 — 참고만') + '). ' + amd() + ' 뒤 ' + (o.est.ch != null ? V.sgn(o.est.ch) + '%' : '변화 없음') + ' (' + e(o.est.asof) + (o.est.mkt ? ' 종가' : ' 기준가') + '까지). 1일·1주·주간 수익률은 이 추정 줄 그대로 · 1개월~올해는 ' + amd() + ' 값에 이어 붙임. 실제 기준가와 다를 수 있어요.</p>';
      else h += '<p class="pd-lvp">📷 ' + amd() + ' 화면 값 — 기준가가 공개되지 않고, 과거 성적과 잘 맞는 추정 후보(같은 운용사 공모펀드·보유 종목 바스켓·같은 전략 펀드·지수)도 없어서 그대로 뒀어요.</p>';
      h += '<p class="pd-lvp">' + ((o.oc || openClose(o)) === "폐쇄형" ? '🔒 <b>폐쇄형(추정)</b> — 만기 전엔 보통 환매가 안 돼요.' : '🔓 <b>개방형(추정)</b> — 보통 월·분기마다 환매 신청이 가능해요(환매 주기·수수료는 약관 확인).') + ' 사모펀드 약관은 공개되지 않아 이름·전략으로 구분했어요.</p>';
      if (o.m) h += '<div class="sub2">🏢 운용사</div><p>' + e(o.m) + '</p>';
      h += '<div class="pd-pvh" data-pvhold="' + e(o.mg || "") + '"><div class="sub2">🧺 구성 엿보기 <span class="mut">불러오는 중…</span></div></div>';
      if (o.h && o.h.length) h += '<div style="margin:2px 0 8px">' + o.h.map(function(t){ return '<span class="chip2">' + e(t) + '</span>'; }).join("") + '</div>';
      h += '<p class="note">가입은 미래에셋 PB·영업점(일반투자자 최소 3억, 전문투자자 요건)이에요.</p>';
      h += '<div class="sub2">📊 기간 수익률 <span class="mut">' + (usd ? '달러 기준 · ' : '') + '옆은 ' + (PVL && PVL.bmasof ? e(PVL.bmasof.slice(5).replace('-', '/')) + ' 마감' : '10/15 화면의') + ' KOSPI / KOSDAQ</span></div>' + tbl([["d1", "1일"], ["w1", "1주"], ["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"]].map(function(p){
        var v = o[p[0]]; return [p[1] + ' <span class="mut">' + (kospi[p[0]] != null ? V.sgn(kospi[p[0]]) + '%' : '–') + ' / ' + (kosdaq[p[0]] != null ? V.sgn(kosdaq[p[0]]) + '%' : '–') + '</span>', v == null ? '–' : V.sgn(v) + '%', v == null ? '' : v >= 0 ? 'up' : 'dn']; }));
      if (o.wk && o.wk.length){ var bw = {}; ((kospi.wk) || []).forEach(function(w){ bw[w[0].slice(0, 10)] = w[1]; });
        var wkOf = function(d){ var t = Date.parse(d + "T00:00:00Z"); var best = null; Object.keys(bw).forEach(function(x){ var dd = Math.abs(Date.parse(x + "T00:00:00Z") - t); if (dd <= 4 * 864e5 && (best == null || dd < best[0])) best = [dd, x]; }); return best ? bw[best[1]] : null; };
        h += '<div class="sub2">📆 주간 수익률 <span class="mut">' + (o.wkEst ? '🧮 추정' : '기준가로 직접 계산') + ' · 최근 ' + o.wk.length + '주 · 옆은 그 주 코스피</span></div>' + tbl(o.wk.slice().reverse().map(function(w){ var kb = wkOf(w[0]);
          return [e(w[0].slice(5).replace("-", "/")) + ' 주 <span class="mut">' + (kb != null ? '코스피 ' + V.sgn(kb) + '%' : '') + '</span>', V.sgn(w[1]) + '%', w[1] >= 0 ? 'up' : 'dn']; })) +
          '<p class="note" style="margin:4px 0 0">펀드 기준가는 전날 종가로 계산돼서 코스피보다 하루 늦게 움직여요.</p>'; }
      var ys = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"].filter(function(y){ return (o.y || {})[y] != null; });
      if (ys.length) h += '<div class="sub2">📅 연도별 수익률 <span class="mut">2026은 ' + (o.live ? e(o.live.asof.slice(5).replace('-', '/')) : amd()) + '까지 · 첫해는 설정일부터</span></div>' + V.dbars(ys.map(function(y){ return {label: y + '년', v: o.y[y]}; })) + (kospi.y ? '<p class="pd-bm">같은 해 코스피 ' + ys.filter(function(y){ return kospi.y[y] != null; }).map(function(y){ return y + ' <b class="' + cls(kospi.y[y]) + '">' + V.sgn(kospi.y[y], 1) + '%</b>'; }).join(' · ') + '</p>' : '');
      var pers = [["m1", "1개월"], ["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"]].filter(function(p){ return o[p[0]] != null; });
      var chain = null, y0 = ys[0]; if (ys.length >= 2){ chain = 1; ys.forEach(function(y){ chain *= 1 + o.y[y] / 100; }); }
      h += '<div class="sub2">🧾 모의 계산 <span class="mut">「그때 넣었다면 지금」 · 과거 성적 그대로</span></div>' + amtBar() + tbl([["넣은 돈", W(A) + (usd ? ' <span class="mut">(달러로 바꿔 넣는 펀드 · 환율 변화 제외)</span>' : '')]].concat(pers.map(function(p){
        var v = A * (1 + o[p[0]] / 100); return [p[1] + " 전에 넣었다면", W(v) + " <span class='mut'>" + V.sgn(o[p[0]]) + "%</span>", v >= A ? "up" : "dn"]; })).concat(chain ? [[y0 + "년부터 연도별 성적 이어 붙이면", W(A * chain) + " <span class='mut'>" + V.sgn((chain - 1) * 100, 0) + "%</span>", chain >= 1 ? "up" : "dn"]] : []));
      h += '<p class="note">수익률은 보수를 뗀 기준가 기준(세전)이에요. 이익에는 배당소득세 15.4%(국내 상장주식 매매차익은 비과세)가 붙고, 사모펀드는 환매 주기(월·분기)나 폐쇄형 만기가 있어 바로 못 뺄 수 있어요. 과거 성적이 앞으로도 같다는 뜻은 아니에요.</p>';
    }
    return h + '<button class="pd-close" data-close>닫기 ▲</button>';
  }

  /* 🧺 사모 「구성 엿보기」 — 10/16 사용자 「사모펀드들 안에 구성종목 어캐든 찾아서 다 집어넣어」
     펀드별 보유 종목은 공개되지 않음 → 공개된 것 중 가장 가까운 두 가지를 운용사 단위로:
     ① DART 5% 대량보유 보고(archive/x/pv_hold.json · pv_hold.yml 매일) ② 같은 운용사 공모펀드의 보유 상위(fund_hold.json) */
  var PVH = null, DATA = null;
  function fillPvHold(pnl){
    var box = pnl && pnl.querySelector("[data-pvhold]"); if (!box) return;
    var mg = box.dataset.pvhold;
    if (!mg){ box.innerHTML = '<div class="sub2">🧺 구성 엿보기</div><p class="note">해외 사모·재간접처럼 국내 상장 주식을 직접 담지 않거나 운용사 공개 자료를 못 찾은 펀드예요. 위 「담는 것」이 이 전략의 일반적인 구성이고, 실제 내역은 가입자에게 분기마다 오는 자산운용보고서에만 나와요.</p>'; return; }
    Promise.all([PVH ? Promise.resolve(PVH) : getJSON("archive/x/pv_hold.json?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(j){ PVH = j; return j; }).catch(function(){ return null; }),
                 HOLD ? Promise.resolve(HOLD) : getJSON("archive/x/fund_hold.json?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(j){ HOLD = j; return j; }).catch(function(){ return null; })]).then(function(a){
      var H = a[0], FH = a[1], L = H && H.mg ? H.mg[mg] : null;
      var h = '<div class="sub2">🧺 구성 엿보기 <span class="mut">' + e(mg) + ' · 운용사 단위 공개 자료</span></div>' +
        '<p class="note" style="margin:0 0 6px">사모펀드는 펀드별 보유 종목을 공개하지 않아요. 대신 <b>이 운용사 전체</b>(모든 펀드·일임 합계)가 공개해야 하는 것을 모았어요 — 이 펀드가 꼭 담고 있다는 뜻은 아니에요.</p>';
      if (L && L.length){
        var on = L.filter(function(x){ return x.r == null || x.r >= 5; }).sort(function(x, y){ return (y.val || 0) - (x.val || 0) || (y.r || 0) - (x.r || 0); }), off = L.filter(function(x){ return x.r != null && x.r < 5; });
        var tv = on.reduce(function(a, x){ return a + (x.val || 0); }, 0), mw = Math.max.apply(null, on.map(function(x){ return x.w || 0; }).concat([1]));
        h += '<div class="sub2" style="margin-top:4px">① 5% 넘게 가진 상장사 <span class="mut">DART 대량보유 ' + on.length + '곳' + (tv ? ' · 평가 약 ' + fmt(Math.round(tv)) + '억원' : '') + '</span></div>' +
          '<div class="pd-pvl"><div class="hd"><span class="n">종목</span><b>비중</b><small>지분율</small></div>' + on.slice(0, 30).map(function(x){
          var dd = x.r != null && x.r0 != null ? x.r - x.r0 : null;
          return '<div><span class="n">' + (x.mk ? '<em>' + e(x.mk === "유" ? "코스피" : x.mk === "코" ? "코스닥" : x.mk) + '</em> ' : '') + e(x.nm) + '</span><b>' + (x.w != null ? x.w.toFixed(1) + '%' : '–') + '</b><small>' + (x.r != null ? x.r.toFixed(2) + '%' : '–') + '</small>' +
            (x.w != null ? '<span class="xbar"><i style="width:' + (x.w / mw * 100).toFixed(0) + '%;background:var(--c)"></i></span>' : '') +
            '<span class="d mut">' + (x.val != null ? '평가 약 ' + fmt(x.val) + '억 · ' : '') + (dd != null ? '지분 ' + (dd > 0 ? '▲' : dd < 0 ? '▼' : '') + Math.abs(dd).toFixed(2) + '%p · ' : '신규 보고 · ') + '보고 ' + e(x.date || "") + (x.purp && x.purp !== "단순투자" ? ' · ' + e(x.purp) : '') + '</span></div>'; }).join("") + '</div>' +
          (off.length ? '<p class="note" style="margin:4px 0 0">최근 5% 밑으로 줄인 곳: ' + off.slice(0, 12).map(function(x){ return e(x.nm) + ' ' + x.r.toFixed(1) + '%'; }).join(" · ") + '</p>' : '') +
          '<p class="note" style="margin:4px 0 0">「비중」 = 보고된 보유 주식 수 × 최근 종가로 잰 평가금액을, 이 운용사가 5% 넘게 가진 종목들 합계로 나눈 비율이에요(5% 밑 종목·채권·현금은 몰라서 빠짐 — 펀드 실제 비중과 달라요). 「지분율」 = 그 회사 주식 중 운용사가 가진 비율. 주식 수는 보고서 기준일 값(1%p 넘게 바뀌면 다시 보고). 금융감독원 DART · ' + e(H.updated || "") + ' 수집.</p>';
      } else h += '<p class="note">① DART 5% 대량보유 보고: ' + (H ? '최근 2년 안에 이 운용사 이름으로 낸 보고서가 없어요(5% 넘게 가진 상장사가 없거나 등록 이름이 달라 못 찾음).' : '자료 준비 중 — 첫 수집 뒤 채워져요.') + '</p>';
      var F = ((DATA || {}).funds || []).filter(function(f){ return f.co === mg && FH && FH.items && FH.items[f.c] && FH.items[f.c].h && FH.items[f.c].h.length; }).sort(function(x, y){ return (y.aum || 0) - (x.aum || 0); });
      if (F.length){ var f = F[0], x = FH.items[f.c], mx = Math.max.apply(null, x.h.map(function(r){ return r[1]; }));
        h += '<div class="sub2">② 같은 운용사 공모펀드 보유 상위 <span class="mut">' + e(fname(f.n)) + '</span></div><div class="pd-hl">' + x.h.slice(0, 10).map(function(r){ return '<div><span class="n">' + e(r[0]) + (r[2] ? ' <em>' + e(r[2]) + '</em>' : '') + '</span><span class="xbar"><i style="width:' + (r[1] / mx * 100).toFixed(0) + '%;background:var(--c)"></i></span><b>' + r[1].toFixed(1) + '%</b></div>'; }).join("") + '</div>' +
          '<p class="note" style="margin:4px 0 0">같은 하우스의 공모펀드라 스타일이 비슷한 경우가 많지만 사모펀드와 종목·비중은 달라요. ' + e(x.d ? x.d.slice(0, 4) + "-" + x.d.slice(4, 6) : "") + ' 기준.</p>';
      }
      box.innerHTML = h;
    });
  }
  /* 🧺 펀드 구성 — archive/x/fund_hold.json (미래에셋 펀드 상세 「보유 상위 종목」) 을 누를 때만 받음 */
  var HOLD = null;
  var ACOL = {"주식": "#e66767", "채권": "#3987e5", "유동성": "#9aa4b5", "펀드": "#9085e9", "파생": "#c98500", "기타": "#6b7280"};
  function fillHold(pnl){
    var box = pnl && pnl.querySelector("[data-hold]"); if (!box) return;
    (HOLD ? Promise.resolve(HOLD) : getJSON("archive/x/fund_hold.json?" + Math.floor(Date.now() / 3600000), {ttl: 3600000}).then(function(j){ HOLD = j; return j; })).then(function(H){
      var x = (H.items || {})[box.dataset.hold];
      if (!x || !x.h || !x.h.length){ box.innerHTML = '<div class="sub2">🧺 펀드 구성</div><p class="note">이 펀드는 보유 종목 자료가 아직 없어요(작은 펀드·신규 펀드는 공시가 늦어요).</p>'; return; }
      var at = {}, sum = 0; x.h.forEach(function(r){ var t = r[2] || "기타"; if (t === "유동성" && /사모|투자신탁|펀드/.test(r[0])) t = "펀드"; at[t] = (at[t] || 0) + r[1]; sum += r[1]; });
      if (sum < 99.5) at["나머지(상위 밖)"] = 100 - sum;
      var segs = Object.keys(at).sort(function(a, b){ return at[b] - at[a]; }).map(function(k, i){ return {label: k, v: Math.round(at[k] * 10) / 10, color: ACOL[k] || V.CAT[i % 6]}; });
      var mx = Math.max.apply(null, x.h.map(function(r){ return r[1]; }));
      box.innerHTML = '<div class="sub2">🧺 펀드 구성 <span class="mut">보유 상위 ' + x.h.length + '개 · ' + e(x.d ? x.d.slice(0, 4) + "-" + x.d.slice(4, 6) + "-" + x.d.slice(6, 8) : "") + ' 기준</span></div>' +
        '<div class="pd-stack">' + segs.map(function(sg_){ return '<i style="flex:' + sg_.v + ';background:' + sg_.color + '" title="' + e(sg_.label) + ' ' + sg_.v + '%"></i>'; }).join("") + '</div>' +
        '<div class="pd-leg">' + segs.map(function(sg_){ return '<span><i style="background:' + sg_.color + '"></i>' + e(sg_.label) + ' <b>' + sg_.v.toFixed(1) + '%</b></span>'; }).join("") + '</div>' +
        '<div class="pd-hl">' + x.h.map(function(r){ return '<div><span class="n">' + e(r[0]) + (r[2] ? ' <em>' + e(r[2]) + '</em>' : '') + '</span><span class="xbar"><i style="width:' + (r[1] / mx * 100).toFixed(0) + '%;background:var(--c)"></i></span><b>' + r[1].toFixed(1) + '%</b></div>'; }).join("") + '</div>' +
        '<p class="note">미래에셋 펀드 상세의 「보유 상위 종목」(보통 한두 달 전 기준)이에요. 재간접 펀드는 안에 담은 펀드 이름이 보여요.</p>';
    }).catch(function(){ box.innerHTML = '<div class="sub2">🧺 펀드 구성</div><p class="note">구성 자료를 못 불러왔어요.</p>'; });
  }


  /* 💼 포트 「🙋 내 포트」에 상품을 넣을 수 있게 (10/16 사용자 「포트에 주식 부분에 상품 부분을 더한 포트 · 비교 방식, 넣는 방식 등은 같게」)
     port.js 가 부름 — 채권·ELS 는 연 수익률(y)로 날마다 쌓고, 펀드는 기간 수익률(per)을 이어 붙여 길을 만든다 */
  window.prodCatalog = function(){
    var sv = ""; try { sv = localStorage.getItem("pvk") || ""; } catch(z) {}
    var pv = PVL ? Promise.resolve(PVL) : sv ? pvUnlock(sv).catch(function(){ return null; }) : Promise.resolve(null);
    return Promise.all([P(), pv]).then(function(a){
      var D = a[0], L = a[1], out = [], ds = function(d){ return d && d.length === 8 ? d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8) : d; };
      (D.krw || []).forEach(function(r){ if (r.after != null) out.push({id: "krw:" + r.name, g: "krw", name: r.name, sub: (r.kind || "") + " · 세후 " + pc(r.after) + " · 만기 " + r.mat, y: r.after, cur: "원"}); });
      var U = D.ust || {}, mq = {}; (U.items || []).forEach(function(x){ mq[(+x.cpn).toFixed(3) + x.mat] = x.ytm; });
      ((D.ust_all || {}).items || []).forEach(function(x){ if (x.k === "FRN" || x.k === "TIPS" || x.y == null) return; var q = mq[(+(x.cpn || 0)).toFixed(3) + x.mat];
        out.push({id: "ust:" + x.cu, g: "ust", name: x.nm + (x.mir ? " ★" : ""), sub: "만기 " + x.mat + " · " + (q != null ? "미래에셋 시세 " + pc(q) : "추정 " + pc(x.y)) + " · 달러", y: q != null ? q : x.y, cur: "달러", mir: !!x.mir}); });
      (D.anb || []).forEach(function(x){ if (x.code !== "NTN-F" || x.r == null) return; out.push({id: "brl:" + x.mat, g: "brl", name: "브라질 NTN-F " + x.mat.slice(0, 7), sub: "연 " + x.r.toFixed(2) + "% · 헤알 · 비과세", y: x.r, cur: "헤알"}); });
      ((D.live || {}).usd || []).forEach(function(x){ out.push({id: "bru:" + x.isin, g: "brl", name: x.name + " (달러)", sub: "연 " + pc(x.ytm) + " · 달러 · 미국채 +" + (x.sp != null ? x.sp.toFixed(2) : "–") + "%p", y: x.ytm, cur: "달러"}); });
      (D.funds || []).forEach(function(x){ if (!x.t || (x.aum || 0) < 10 || x.y1 == null) return; out.push({id: "fund:" + x.c, g: "fund", name: fname(x.n), sub: (x.co || "") + " · 1년 " + V.sgn(x.y1) + "% · 순자산 " + fmt(x.aum) + "억", per: {w1: x.w1, m1: x.m1, m3: x.m3, m6: x.m6, y1: x.y1}, asof: ds(x.d), cur: "원", rank: x.y1}); });
      if (L) L.rows.forEach(function(x, i){ out.push({id: "pvl:" + i + ":" + x.n.slice(0, 12), g: "pvl", name: pvname(x.n), sub: (SSHORT[x.s] || x.s) + " · 1년 " + (x.y1 != null ? V.sgn(x.y1) + "%" : "–") + (x.usd ? " · 달러" : ""), per: {d1: x.d1, w1: x.w1, m1: x.m1, m3: x.m3, m6: x.m6, y1: x.y1}, asof: L.asof, cur: x.usd ? "달러" : "원", rank: x.y1}); });
      (D.els || []).forEach(function(x){ if (x.cpn == null) return; out.push({id: "els:" + x.n, g: "els", name: x.n, sub: (x.ua || "") + " · 연 " + pc(x.cpn) + ((x.pp || 0) >= 100 ? " · 원금지급" : " · 원금 비보장"), y: x.cpn, cur: "원"}); });
      return {items: out, pvl: !!L};
    });
  };

  /* ───────── 공통 ───────── */
  // 🔧 11/16 자가 업그레이드: 오류 줄의 영어 내부 이름(ust_all 등)·HTTP 기술 문구를 한글 이름만 남김 (health #bond·#fund·#els)
  var ERRKO = {krw: "원화채권", ust: "미국채(미래에셋)", aud: "호주채", notice: "채권 공지", funds: "공모펀드", els: "ELS", els_done: "지난 ELS", td: "브라질 국채", td_hist: "브라질 국채 기록", anb: "브라질 채권 시세", ust_all: "미국채 전체 목록", bm: "기준 지수"};
  function errKo(L){ var seen = {}; return (L || []).map(function(x){ var k = String(x).split(":")[0].trim(); return ERRKO[k] || k.replace(/[A-Za-z_]{3,}\S*/g, "").trim() || "일부 자료"; }).filter(function(n){ if (seen[n]) return false; seen[n] = 1; return true; }).join(" · ").slice(0, 120); }
  function boSlot(k){ return /^(gov|ust|brl|bru)$/.test(k || "gov") ? '<div class="bo-slot" data-bo="' + (k || "gov") + '"></div>' : ""; }   // 📄 11/05 채권 전망 보고서(bond_outlook.js) 자리
  var VIEW = {bond: bondView, fund: fundView, els: elsView}, BODY = {bond: function(D, k){ return boSlot(k) + bondBody(D, k); }, fund: fundBody, els: elsBody};
  window.prodView = function(key){ return '<div id="pdroot" data-k="' + key + '"><div class="loading">미래에셋 상품 자료 불러오는 중…</div></div>'; };
  window.prodInit = function(key){
    P().then(function(D){
      var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== key) return; DATA = D;
      var full = function(){ var r = document.getElementById("pdroot"); if (!r || r.dataset.k !== key) return;
        r.innerHTML = (D.errors && D.errors.length ? '<p class="note" style="margin:0 0 8px">⚠️ 일부 자료를 못 받았어요: ' + e(errKo(D.errors)) + ' — 지난 값을 보여 줘요.</p>' : '') + (false && window.threeWay && key === "bond" ? '<div id="pd3w"></div>' : '') + VIEW[key](D);   // 🎨 11/04: 세 갈래 길은 상품 첫 화면(채권)에만 — 채권·펀드 중복 카드 분리
        if (false && window.threeWay && key === "bond") try { threeWay(document.getElementById("pd3w"), D); } catch(x) {}   // ⚖️ 10/21 A10/21-3 세 갈래 길
        bindSeg("pdseg", function(k){ SEL[key] = k; keep(); redraw(); }); bindInner(); };
      window.__pdRedraw = function(){ redraw(); };
      var redraw = function(){ var b = document.getElementById("pdbody"); if (!b) return; var y = b.getBoundingClientRect().top; b.innerHTML = BODY[key](D, SEL[key] || {bond: "gov", fund: "pv", els: "open"}[key]); holdAt("#pdbody", y); bindInner(); };
      var bindInner = function(){
        var dz = document.getElementById("elsdz"); if (dz && window.elsDesign) elsDesign(dz);
        bindSeg("pdper", function(k){ PER = k; keep(); redraw(); });
        bindSeg("pdustk", function(k){ SEL.ustk = k; keep(); redraw(); });
        bindSeg("pdbsort", function(k){ SEL.bsort = k; keep(); redraw(); });
        bindSeg("pdelsk", function(k){ SEL.elsk = k; keep(); redraw(); });
        bindSeg("pdpvp", function(k){ SEL.pvp = k; keep(); redraw(); });
        bindSeg("pdpvs", function(k){ SEL.pvs = k; keep(); redraw(); });
        bindSeg("pdpvoc", function(k){ SEL.pvoc = k; keep(); redraw(); });
        bindSeg("pdmk", function(k){ SEL.mk = k; keep(); redraw(); });
        bindSeg("pdms", function(k){ SEL.ms = k; keep(); redraw(); });
        var mq = document.getElementById("pdmq"), ml = document.getElementById("pdmlist"), mt = null;
        var mgAll = function(){ var b = document.getElementById("pdmall"); if (b) b.onclick = function(){ SEL.mall = 1; ml.innerHTML = mgList(D); mgAll(); }; };
        if (mq && ml){ mq.oninput = function(){ clearTimeout(mt); mt = setTimeout(function(){ SEL.mq = mq.value.trim(); SEL.mall = 0; keep(); ml.innerHTML = mgList(D); mgAll(); }, 180); }; mgAll(); }
        var mpv = document.getElementById("pdmpv"); if (mpv) mpv.onclick = function(ev){ ev.preventDefault(); SEL.fund = "pv"; keep(); full(); };
        var go = document.getElementById("pvgo"), pw = document.getElementById("pvpw");
        var tryOpen = function(v, quiet){ if (PVBUSY || !v) return; PVBUSY = true; if (go) go.textContent = "여는 중…";
          pvUnlock(v).then(function(){ PVERR = ""; try { localStorage.setItem("pvk", v); } catch(z) {} PVBUSY = false; full(); })
            .catch(function(err){ PVBUSY = false; PVERR = quiet ? "" : (err && err.message && /브라우저/.test(err.message) ? err.message : "비밀번호가 맞지 않아요."); try { if (quiet && err && err.name === "OperationError") localStorage.removeItem("pvk"); } catch(z) {} redraw(); }); };
        if (go && pw){ go.onclick = function(){ tryOpen(pw.value.trim()); }; pw.onkeydown = function(ev){ if (ev.key === "Enter") tryOpen(pw.value.trim()); }; }
        if (!PVL && !PVBUSY && document.querySelector("#pdbody .loading")){ var sv = ""; try { sv = localStorage.getItem("pvk") || ""; } catch(z) {} if (sv) tryOpen(sv, true); }
        if (!PVL && !PVBUSY && mq && !window.__pvTried){ window.__pvTried = 1; var sv2 = ""; try { sv2 = localStorage.getItem("pvk") || ""; } catch(z) {} if (sv2) tryOpen(sv2, true); }   // 운용사별 탭에서도 저장된 비밀번호로 사모 자동 열기
        var lk = document.getElementById("pvlock"); if (lk) lk.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); PVL = null; try { localStorage.removeItem("pvk"); } catch(z) {} full(); };
      };
      full();
      root.addEventListener("click", function(ev){
        var amt = ev.target.closest && ev.target.closest("[data-amt]");
        if (amt){ ev.stopPropagation(); AMT = +amt.dataset.amt; try { localStorage.setItem("prodamt", AMT); } catch(z) {}
          var row = amt.closest(".pd-tap"), pnl = row && row.querySelector(":scope > .pd-x"); if (pnl){ var y = row.getBoundingClientRect().top; pnl.innerHTML = xpanel(OBJ[row.dataset.x]); fillHold(pnl); fillPvHold(pnl); holdAt('[data-x="' + row.dataset.x + '"]', y); } return; }
        var cl = ev.target.closest && ev.target.closest("[data-close]");
        if (cl){ ev.stopPropagation(); var r0 = cl.closest(".pd-tap"), p0 = r0 && r0.querySelector(":scope > .pd-x"); if (p0){ p0.remove(); r0.classList.remove("on"); var t0 = r0.getBoundingClientRect().top; if (t0 < 60) window.scrollTo({top: window.scrollY + t0 - 70, behavior: "smooth"}); } return; }
        if (ev.target.closest("a[href]")) return;
        var row = ev.target.closest && ev.target.closest(".pd-tap"); if (!row || !OBJ[row.dataset.x]) return;
        var pnl = row.querySelector(":scope > .pd-x");
        if (pnl){ pnl.remove(); row.classList.remove("on"); return; }
        pnl = document.createElement("div"); pnl.className = "pd-x no-clp"; setTimeout(function(){ fillHold(pnl); fillPvHold(pnl); }, 0); pnl.innerHTML = xpanel(OBJ[row.dataset.x]); row.appendChild(pnl); row.classList.add("on");
        try { if (window.unclamp) unclamp(row); } catch(z) {}   // 긴 카드 접기(전체 보기)가 펼친 계산서를 가리지 않게
      });
      var st = document.getElementById("pdstamp"); if (st) st.textContent = D.updated || "";
    }).catch(function(err){ console.error(err); var r = document.getElementById("pdroot"); if (r) r.innerHTML = '<div class="empty">상품 자료를 못 불러왔어요. 다음 수집 때 채워져요.</div>'; });
  };
  var css = document.createElement("style");
  css.textContent = ".pd-mg{background:var(--panel2);border-radius:14px;margin:0 0 8px;overflow:hidden}.pd-mg>summary{list-style:none;cursor:pointer;padding:11px 12px}.pd-mg>summary::-webkit-details-marker{display:none}.pd-mg[open]>summary{border-bottom:1px solid var(--line)}.pd-mgh{display:flex;align-items:center;gap:10px}.pd-mgh .pd-n b{font-size:15px}.pd-mgb{padding:4px 8px 10px}.pd-mgb .pd-it{background:var(--panel)}.pd-mgb .sub2{margin:10px 4px 6px}.pd-mgc{font-size:12.5px;color:var(--sub);margin:4px 2px 8px}.pd-mgc b{color:var(--text)}.pd-mall{display:block;width:100%;margin:4px 0 0;padding:11px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--text);font-weight:700}.pd-mmore{margin-top:8px}.pd-mmore>summary{cursor:pointer;font-size:13px;color:var(--sub);padding:6px 4px}#pdmq{margin:0 0 10px}.pd-mpv{display:block;font-size:12.5px;color:var(--sub);margin:2px 2px 10px;text-decoration:none}" +
    ".pd-list{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}.pd-list>*{min-width:0}.pd-x{min-width:0;overflow:hidden}.pd-it{display:block;background:var(--panel2);border-radius:14px;padding:11px 12px;color:var(--text);text-decoration:none}" +
    ".pd-h{display:flex;align-items:center;gap:10px}.pd-n{flex:1;min-width:0}.pd-n b{display:block;font-size:14px;line-height:1.35;word-break:keep-all;overflow-wrap:anywhere}.pd-n small{overflow-wrap:anywhere}.pd-it{overflow:hidden}.pd-n small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px;line-height:1.5}" +
    ".pd-v{text-align:right;flex:none}.pd-v b{display:block;font-size:19px;letter-spacing:-.3px}.pd-v small{display:block;color:var(--dim);font-size:12.5px}" +
    ".pd-it .rk{flex:none;width:22px;height:22px;border-radius:7px;background:var(--panel);color:var(--sub);font-size:12.5px;font-weight:800;display:inline-flex;align-items:center;justify-content:center}" +
    ".pd-bar{height:5px;border-radius:3px;background:var(--panel);margin:8px 0 6px;overflow:hidden}.pd-bar i{display:block;height:100%;background:var(--up);border-radius:3px}" +
    ".pd-row{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin-top:6px;line-height:1.6}.pd-row b{color:var(--text)}" +
    ".pd-rep{margin:7px 0 2px;padding:7px 9px;border-radius:10px;background:color-mix(in srgb,var(--panel) 60%,var(--bg))}.pd-rph{font-size:12.5px;font-weight:700;color:var(--text)}.pd-rph .mut{font-weight:400}.pd-rpb{display:flex;height:7px;border-radius:4px;overflow:hidden;background:color-mix(in srgb,var(--sub) 25%,transparent);margin:5px 0 4px}.pd-rpb i{display:block;height:100%}.pd-rpt{font-size:12.5px;color:var(--sub);line-height:1.55}.pd-rpt b{color:var(--text)}.pd-rpt b.dn,.pd-rpm b.dn{color:var(--dn)}.pd-rpm{display:block;margin-top:3px;font-size:12.5px;color:var(--sub);line-height:1.35}.pd-rpm>span,.pd-rpm>b{display:block;word-break:keep-all;overflow-wrap:anywhere}.pd-ec td{vertical-align:top}.pd-rcmp{font-size:12.5px;color:var(--sub);line-height:1.5;margin:2px 0 8px}.pd-rcmp b{color:var(--text)}" +
    ".pd-e .chip2{margin:4px 4px 0 0}.pd-nt{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none;font-size:13px;line-height:1.45}.pd-nt .mut{flex:none;width:78px}" +
    ".pd-sort{display:flex;align-items:center;gap:8px;margin:-2px 0 10px}.pd-sort>.mut{flex:none;font-size:12.5px}.pd-sort .seg2{flex:1;margin:0}.pd-sort .seg2 button{font-size:12.5px;padding:6px 4px}" +
    ".pd-live{border:1px solid rgba(25,158,112,.35);border-radius:14px;padding:10px 10px 2px;margin:0 0 12px;background:linear-gradient(160deg,rgba(25,158,112,.08),transparent 70%)}.pd-lh{display:flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;margin:0 2px 8px}.pd-lh .mut{font-weight:400;font-size:12.5px}" +
    ".pd-dot{width:8px;height:8px;border-radius:50%;background:#19c37d;box-shadow:0 0 0 0 rgba(25,195,125,.6);animation:pdpulse 1.8s infinite}@keyframes pdpulse{0%{box-shadow:0 0 0 0 rgba(25,195,125,.55)}70%{box-shadow:0 0 0 7px rgba(25,195,125,0)}100%{box-shadow:0 0 0 0 rgba(25,195,125,0)}}" +
    ".pd-brl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px}.pd-brl div{background:var(--panel2);border-radius:12px;padding:10px 12px}.pd-brl small{display:block;color:var(--sub);font-size:12.5px}.pd-brl b{font-size:18px}.pd-brl em{display:block;font-style:normal;font-size:12.5px;color:var(--dim)}" +
    "#pdper{margin-top:-4px}.pd-doc p{margin:0;font-size:13.5px;line-height:1.7;color:var(--text);word-break:keep-all}.pd-doc summary{font-weight:700}" +
    ".pd-tap{cursor:pointer}.pd-tap.on{background:color-mix(in srgb,var(--c) 10%,var(--panel2));outline:1px solid color-mix(in srgb,var(--c) 40%,transparent)}.pd-x{margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".pd-x p{margin:0 0 6px;font-size:13px;line-height:1.65;color:var(--text);word-break:keep-all}.pd-x .note{color:var(--sub);font-size:12.5px}.pd-x .sub2{margin:10px 0 6px}" +
    ".pd-amt{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:0 0 8px}.pd-amt button{border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px}.pd-amt button.on{color:var(--text);border-color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent)}" +
    ".pd-tb{width:100%;border-collapse:collapse;font-size:12.5px}.pd-tb td{padding:5px 0;border-bottom:1px solid var(--line);vertical-align:top}.pd-tb td:first-child{color:var(--sub);padding-right:8px;width:50%}.pd-tb td:last-child{text-align:right;font-weight:600}.pd-tb td.up{color:var(--up)}.pd-tb td.dn{color:var(--down)}" +
    ".pd-cfw{max-height:360px;overflow:auto;border:1px solid var(--line);border-radius:10px;margin:0 0 6px}.pd-cf{width:100%;border-collapse:collapse;font-size:12.5px;table-layout:fixed}.pd-cf th:nth-child(1),.pd-cf td:nth-child(1){width:25%}.pd-cf th:nth-child(3),.pd-cf td:nth-child(3){width:31%}.pd-cf th{position:sticky;top:0;background:var(--panel);color:var(--sub);font-weight:600;padding:6px 5px;text-align:right;white-space:nowrap}.pd-cf th:nth-child(-n+2){text-align:left}" +
    ".pd-cf td{padding:6px 5px;border-top:1px solid var(--line);text-align:right;vertical-align:top}.pd-cf td:nth-child(1){text-align:left;color:var(--sub);font-size:12.5px;word-break:break-all}.pd-cf td:nth-child(2){text-align:left;word-break:keep-all}.pd-cf td:nth-child(3){white-space:nowrap}.pd-cf .mut{font-size:12.5px}.pd-cf td.dn{color:var(--down)}.pd-cf tr.sum td{background:var(--panel);font-weight:700}" +
    ".pd-stack{display:flex;height:12px;border-radius:6px;overflow:hidden;gap:2px;margin:4px 0 6px}.pd-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin-bottom:8px}.pd-leg i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px}" +
    ".pd-hl div{display:grid;grid-template-columns:minmax(0,1fr) 56px 44px;gap:8px;align-items:center;font-size:12.5px;padding:4px 0;border-bottom:1px solid var(--line)}.pd-hl .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pd-hl em{font-style:normal;color:var(--dim);font-size:12.5px}.pd-hl b{text-align:right}" +
    ".pd-grp{border-top:1px solid var(--line);padding:6px 0}.pd-grp>summary{cursor:pointer;padding:6px 2px;font-size:14px}.pd-grp>.pd-list{margin:4px 0 6px}.seg2.wrap{flex-wrap:wrap;overflow:visible}.pd-pw{display:flex;gap:8px}.pd-pw button{flex:none;border:0;border-radius:12px;padding:0 16px;background:var(--c);color:#fff;font:inherit;font-weight:700}.pd-close{display:block;width:100%;margin:10px 0 0;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--sub);font:inherit;font-size:13px}.pd-lv{color:var(--c);font-weight:600}.pd-ec{width:100%;border-collapse:collapse;font-size:12.5px;table-layout:fixed;margin:0 0 6px}.pd-ec th{color:var(--sub);font-weight:600;text-align:left;padding:5px 4px;border-bottom:1px solid var(--line)}.pd-ec td{padding:6px 4px;border-bottom:1px solid var(--line);vertical-align:top;word-break:keep-all;overflow-wrap:anywhere}.pd-ec .mut{font-size:12.5px}.pd-ec tr.me td{background:rgba(245,158,11,.12)}.pd-ecm{padding:4px 0 8px;border-bottom:1px dashed var(--line);margin-bottom:8px}.pd-es{color:#c98500;font-weight:600}.pd-lvp{font-size:12.5px!important;color:var(--sub)!important;margin:0 0 8px!important}.pd-pvl div{display:grid;grid-template-columns:minmax(0,1fr) 54px 58px;gap:2px 8px;align-items:baseline;font-size:12.5px;padding:5px 0;border-bottom:1px solid var(--line)}.pd-pvl .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pd-pvl em{font-style:normal;font-size:12.5px;color:var(--dim)}.pd-pvl b{text-align:right}.pd-pvl small{text-align:right;font-size:12.5px}.pd-pvl .d{grid-column:1/-1;font-size:12.5px;margin-top:-2px}.pd-pvl .xbar{grid-column:1/-1;height:4px;display:block;width:100%}.pd-pvl .hd{font-size:12.5px;color:var(--dim);padding:2px 0}.pd-pvl .hd b{font-weight:500}.pd-bm{font-size:12.5px;color:var(--sub);margin:4px 0 0;line-height:1.7}.pd-err{color:var(--down);font-size:13px;font-weight:600;margin:8px 2px 0}.pd-q{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:9px 12px;font:inherit;font-size:14px;margin:0 0 10px}";
  document.head.appendChild(css);
})();
;
