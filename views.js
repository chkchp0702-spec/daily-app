/* C. Investing — 탭별 화면 (그림·차트 우선, PDF는 아래 접어두기) */
(function(){
  var e = V.e, rich = V.rich, sgn = V.sgn, cls = V.cls, fmt = V.fmt;

  function card(title, body, extra){ return '<section class="card"><h3>' + title + (extra || "") + '</h3>' + body + '</section>'; }
  function sec(t){ return '<div class="sec">' + t + '</div>'; }
  function fold(title, url){
    var id = "f" + Math.random().toString(36).slice(2, 8);
    setTimeout(function(){ var b = document.getElementById(id); if (b) b.onclick = function(){ b.outerHTML = pdfCard(title, url); }; }, 0);
    return '<button class="fold" id="' + id + '">📄 ' + e(title) + ' 펼치기</button>';
  }
  function opBtn(code, label){ return '<a class="btn op" href="javascript:openOP(\'' + e(code).replace(/'/g, "") + '\')">' + (label || "원페이지") + '</a>'; }
  function chip(t, c){ return '<span class="chip2 ' + (c || "") + '">' + t + '</span>'; }
  function after(el){ V.fillSparks(el); }

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
    if (txt) getText(file("market", it.id, txt)).then(function(t){ $("mtxt") && ($("mtxt").textContent = t); });
    if (has("review.md")) getText(file("market", it.id, "review.md")).then(function(t){ $("mrev") && ($("mrev").innerHTML = window.marked ? marked.parse(t) : "<pre class=\"txt\">" + e(t) + "</pre>"); });
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
      $("mhead").innerHTML = '<section class="hero2"><div class="hero2-k">' + e(d.edition_label || "") + ' · ' + e(d.basis || "") + '</div>' +
        '<div class="hero2-t">' + rich(d.one_liner || "") + '</div>' +
        ((d.decision && d.decision.badges) ? '<div class="hero2-b">' + d.decision.badges.map(function(b){ return chip(e(b), "c"); }).join("") + '</div>' : "") + '</section>';
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
  RENDER.danta = function(it, el){
    Promise.all([getJSON(file("danta", it.id, "alerts.json")), getJSON("archive/danta/summary.json?" + (M.updated || "")).catch(function(){ return []; })]).then(function(r){
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
      h += '<div class="list">' + rows.map(function(x){
        var ex = x.exit ? chip(e(x.exit), /손절|이탈/.test(x.exit) ? "cool" : "hot") : "";
        return '<div class="st"><div class="row"><div class="nm"><a href="https://m.stock.naver.com/domestic/stock/' + e(x.code) + '/total" target="_blank">' + e(x.name) + '</a><span class="cd">' + e(x.code) + '</span></div>' +
          '<span class="tm">' + e(x.time) + '</span></div>' +
          '<div class="row" style="margin:6px 0 2px;justify-content:flex-start;gap:6px;flex-wrap:wrap">' + chip(e(x.type), "c") + ex + '<span class="tm">알람가 ' + won(x.price) + '원 · 당일 ' + sgn(x.chg) + '%</span></div>' +
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
      getJSON("archive/whale/hero_log.json?" + (M.updated || "")).catch(function(){ return null; })
    ]).then(function(r){
      var d = r[0], idx = r[1], rk = r[2], BT = r[3], HERO = r[4], sg = d.signals || {}, h = "";
      // 영웅 종목
      if (sg.hero){
        var sc = (sg.top10_score || {})[sg.hero];
        h += '<section class="hero2 whale-hero"><div class="hero2-k">오늘 이것 하나</div><div class="row"><div><div class="big-t">' + e(sg.hero) + '</div>' +
             (sc != null ? '<div class="mut">고래 점수 ' + sc + '</div>' : '') + '</div>' + opBtn(sg.hero, "원페이지 →") + '</div>' +
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
        return {label: '<span class="rk">' + (i + 1) + '</span>' + e(t[0]) + (st && st !== "관찰" ? ' <span class="chip2 ' + (stCls[st] || "") + '" style="font-size:10px;padding:1px 6px">' + e(st) + '</span>' : ''),
                v: t[1], text: t[1], attr: ' onclick="openOP(\'' + e(t[0]) + '\')"', tip: "<b>" + e(t[0]) + "</b> 점수 " + t[1] + (st ? " · " + e(st) : "") + "<br>누르면 원페이지"}; }), {color: "#199e70"}) +
        '<p class="note">상태: 관찰 → 접근(고래 평단 근처) → <b>매수 검토</b>(여러 신호가 겹침)</p>');
      // 신호 묶음
      var groups = [["big", "큰 신규 매수", "hot"], ["mov", "많이 움직인 종목", "c"], ["near", "평단 근처", ""], ["rebound", "반등", "c"], ["warn", "주의", "cool"]];
      var gh = groups.filter(function(g){ return sg[g[0]] && sg[g[0]].length; }).map(function(g){
        return '<div class="sig"><small>' + g[1] + '</small><div>' + sg[g[0]].slice(0, 10).map(function(t){ var s = typeof t === "string" ? t : (t.t || t.ticker || t[0] || ""); return '<a class="chip2 ' + g[2] + '" href="javascript:openOP(\'' + e(s) + '\')">' + e(s) + '</a>'; }).join("") + '</div></div>'; }).join("");
      if (gh) h += card("오늘의 신호", gh);
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
        var best = function(arr){ return (arr || []).slice().sort(function(a, b){ return (b.ret_1y || 0) - (a.ret_1y || 0); }).slice(0, 8); };
        var bars = function(arr){ return V.dbars(best(arr).map(function(m){ return {label: e(m.name) + '<small>' + e(m.quarter || "") + '</small>', v: m.ret_1y, text: sgn(m.ret_1y) + "%", tip: "<b>" + e(m.name) + "</b><br>1년 " + sgn(m.ret_1y) + "% · 어제 " + sgn(m.ret_1d) + "%"}; })); };
        h += card("수익률 상위 고래 <span class='mut'>1년</span>", '<div class="seg2" id="wseg"><button class="on" data-k="i">기관</button><button data-k="p">유명인</button></div><div id="wrk">' + bars(rk.institutions) + '</div>');
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
  function marketBars(by){
    var ks = Object.keys(by || {}).sort(function(a, b){ return by[b] - by[a]; });
    return V.hbars(ks.map(function(k){ return {label: (V.FLAGS[k] || "") + " " + (V.MKT[k] || k), v: by[k], text: by[k] + "개"}; }));
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
      var L = list.filter(function(x){ return sel === "ALL" || x.mkt === sel; });
      var box = $(boxId); if (!box) return;
      box.innerHTML = '<div class="cgrid">' + L.slice(0, shown).map(render).join("") + '</div>' +
        (L.length > shown ? '<button class="more" id="' + boxId + 'm">더 보기 (' + (L.length - shown) + '개 남음)</button>' : "");
      if ($(boxId + "m")) $(boxId + "m").onclick = function(){ shown += 12; draw(); };
      after(box);
    }
    return {draw: draw, set: function(k){ sel = k; shown = 12; draw(); }};
  }
  function stat(label, v){ return '<div><small>' + label + '</small><b>' + v + '</b></div>'; }

  /* ======================= 컵차트 ======================= */
  RENDER.cup = function(it, el){
    var pdf = it.files.indexOf("report.pdf") >= 0 ? fold("컵앤핸들 PDF 리포트", file("cup", it.id, "report.pdf")) : "";
    if (it.files.indexOf("cards.json") < 0){ el.innerHTML = pdfCard("컵앤핸들 리포트", file("cup", it.id, "report.pdf")); return; }
    getJSON(file("cup", it.id, "cards.json")).then(function(d){
      var cupCard = function(c){
        var near = c.dist != null && c.dist > -5 && c.dist <= 0;
        return '<div class="cc"><div class="row"><div class="nm2">' + (V.FLAGS[c.mkt] || "") + ' <b>' + e(c.name) + '</b><span class="cd">' + e(c.code) + '</span></div>' +
          (c.brk ? chip("돌파", "hot") : near ? chip("돌파 임박", "c") : chip("기준가까지 " + sgn(-c.dist) + "%", "")) + '</div>' +
          '<div class="sp-box" data-spark="' + e(c.code) + '"' + (c.pivot ? ' data-ref="' + c.pivot + '" data-label="매수기준 ' + fmt(c.pivot) + '"' : '') + '></div>' +
          '<div class="st4">' + stat("컵 깊이", c.depth != null ? c.depth.toFixed(0) + "%" : "–") + stat("기간", c.weeks != null ? c.weeks.toFixed(0) + "주" : "–") +
          stat("손잡이", c.handle != null ? c.handle.toFixed(0) + "%" : "–") + stat("주가강도", c.rs != null ? c.rs.toFixed(0) : "–") + '</div>' +
          (c.point ? '<p class="pt">' + e(c.point) + '</p>' : '') +
          '<div class="row"><span class="tm">' + e(c.sector || "") + (c.shape ? " · " + e(c.shape) : "") + (c.streak > 1 ? " · " + c.streak + "일째" : "") + '</span>' + opBtn(c.code) + '</div></div>';
      };
      var h = '<div class="sum3"><div class="kv"><small>컵 패턴 종목</small><b>' + d.total.toLocaleString() + '</b></div><div class="kv"><small>사상최고가 돌파</small><b class="up">' + d.ath.length + '</b></div>' +
              '<div class="kv"><small>돌파 완료</small><b>' + d.top.filter(function(c){ return c.brk; }).length + '<span class="mut"> / 상위 ' + d.top.length + '</span></b></div></div>';
      h += '<div class="g2">' + card("나라별", marketBars(d.by_mkt)) + card("많이 나온 섹터", V.hbars(d.by_sec.filter(function(x){ return x[0] !== "미분류" && x[0] !== "-"; }).slice(0, 6).map(function(s){ return {label: e(s[0]), v: s[1], text: s[1]}; }), {color: "#c98500"})) + '</div>';
      if (d.ath.length) h += sec("★ 사상최고가 돌파") + '<div class="cgrid">' + d.ath.map(cupCard).join("") + '</div>';
      h += sec("컵 점수 상위 " + d.top.length) + filterSeg("cseg", d.top, function(k){ P.set(k); }) + '<div id="cbox"></div>' + pdf;
      el.innerHTML = h;
      var P = pager("cbox", d.top, cupCard); P.draw();
      after(el);
    }).catch(function(){ el.innerHTML = pdfCard("컵앤핸들 리포트", file("cup", it.id, "report.pdf")); });
  };

  /* ======================= 갭차트 ======================= */
  RENDER.gap = function(it, el){
    var pdf = it.files.indexOf("report.pdf") >= 0 ? fold("갭 돌파 PDF 리포트", file("gap", it.id, "report.pdf")) : "";
    if (it.files.indexOf("cards.json") < 0){ el.innerHTML = pdfCard("갭 돌파 리포트", file("gap", it.id, "report.pdf")); return; }
    getJSON(file("gap", it.id, "cards.json")).then(function(d){
      var gapCard = function(c){
        return '<div class="cc"><div class="row"><div class="nm2">' + (V.FLAGS[c.mkt] || "") + ' <b>' + e(c.name) + '</b><span class="cd">' + e(c.code) + '</span></div>' +
          chip("갭 +" + (c.gap != null ? c.gap.toFixed(1) : "–") + "%", "hot") + '</div>' +
          '<div class="sp-box" data-spark="' + e(c.code) + '"' + (c.boxlo && c.boxhi ? ' data-band="' + c.boxlo + ',' + c.boxhi + '"' : '') + (c.gopen ? ' data-ref="' + c.gopen + '" data-label="갭 시가 ' + fmt(c.gopen) + '"' : '') + '></div>' +
          '<div class="st4">' + stat("갭 날짜", (c.gday || "").slice(5).replace("-", "/")) + stat("거래량", c.vol != null ? c.vol.toFixed(1) + "배" : "–") +
          stat("박스", c.boxw != null ? c.boxw.toFixed(0) + "주" : "–") + stat("주가강도", c.rs != null ? c.rs.toFixed(0) : "–") + '</div>' +
          '<div class="tags">' + (c.full ? chip("완전돌파", "c") : "") + (c.hold ? chip("갭 유지", "") : chip("갭 메움", "cool")) + (c.fresh ? chip("막 돌파", "hot") : "") + (c.new ? chip("NEW", "c") : "") + '</div>' +
          (c.point ? '<p class="pt">' + e(c.point) + '</p>' : '') +
          '<div class="row"><span class="tm">' + e(c.sector || "") + (c.streak > 1 ? " · " + c.streak + "일째" : "") + '</span>' + opBtn(c.code) + '</div></div>';
      };
      var held = d.top.filter(function(c){ return c.hold; }).length;
      var h = '<div class="sum3"><div class="kv"><small>갭 돌파 종목</small><b>' + d.total.toLocaleString() + '</b></div>' +
              '<div class="kv"><small>상위 평균 갭</small><b class="up">+' + (d.top.reduce(function(a, c){ return a + (c.gap || 0); }, 0) / (d.top.length || 1)).toFixed(1) + '%</b></div>' +
              '<div class="kv"><small>갭 유지</small><b>' + held + '<span class="mut"> / ' + d.top.length + '</span></b>' + V.progress(held, d.top.length || 1, V.UP) + '</div></div>';
      h += '<div class="g2">' + card("나라별", marketBars(d.by_mkt)) + card("많이 나온 섹터", V.hbars(d.by_sec.filter(function(x){ return x[0] !== "미분류" && x[0] !== "-"; }).slice(0, 6).map(function(s){ return {label: e(s[0]), v: s[1], text: s[1]}; }), {color: "#9085e9"})) + '</div>';
      h += '<p class="note" style="margin:0 2px 10px">차트의 옅은 띠 = 갭 전 박스(횡보 구간), 점선 = 갭 시가</p>';
      h += sec("갭 점수 상위 " + d.top.length) + filterSeg("gseg", d.top, function(k){ P.set(k); }) + '<div id="gbox"></div>' + pdf;
      el.innerHTML = h;
      var P = pager("gbox", d.top, gapCard); P.draw();
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
        h += sec("🎯 오늘 이 섹터를 보자") + top.top.map(function(x, i){
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
        h += card("섹터 히트맵 <span class='mut'>기간별 수익률</span>", '<div class="hm"><table><thead><tr><th></th>' + cols_.map(function(c){ return '<th>' + e(c) + '</th>'; }).join("") + '</tr></thead><tbody>' +
          rows.map(function(x){ return '<tr><th>' + e(x[key0]) + '</th>' + cols_.map(function(c){ var v = x[c] === "" ? null : +x[c];
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
      var h = '<div class="sum3"><div class="kv"><small>매집 종목</small><b>' + rows.length + '</b></div><div class="kv"><small>강한 매집</small><b class="up">' + strong + '</b></div><div class="kv"><small>분배 의심</small><b class="dn">' + dist + '</b></div></div>';
      h += card("매집 점수 순위", V.hbars(rows.slice(0, 10).map(function(r){ return {label: (V.FLAGS[r.mkt] || "") + " " + e(r.name.length > 18 ? r.name.slice(0, 17) + "…" : r.name), v: r.score || 0, text: r.score != null ? r.score.toFixed(0) : "–",
        color: r.dist ? V.DN : r.tag === "강한 매집" ? V.UP : "#d55181", attr: ' onclick="openOP(\'' + e(r.code) + '\')"', tip: "<b>" + e(r.name) + "</b><br>" + e(r.tag) + " · 거래량 " + fmt(r.vol) + "배 · 한달 " + sgn(r.m1) + "%"}; }), {max: 100}) +
        '<div class="lg"><span><i style="background:' + V.UP + '"></i>강한 매집</span><span><i style="background:#d55181"></i>매집·중립</span><span><i style="background:' + V.DN + '"></i>분배 의심</span></div>');
      h += sec("종목 카드") + filterSeg("aseg", rows, function(k){ P.set(k); }) + '<div id="abox"></div>';
      el.innerHTML = h;
      var aCard = function(r){
        var link = r.mkt === "KR" ? "https://m.stock.naver.com/domestic/stock/" + r.code + "/total" : "https://finance.yahoo.com/quote/" + r.code;
        return '<div class="cc"><div class="row"><div class="nm2">' + (V.FLAGS[r.mkt] || "") + ' <a href="' + link + '" target="_blank"><b>' + e(r.name) + '</b></a><span class="cd">' + e(r.code) + '</span></div>' +
          chip(r.dist ? "분배 의심" : e(r.tag), r.dist ? "cool" : r.tag === "강한 매집" ? "hot" : "c") + '</div>' +
          '<div class="sp-box" data-spark="' + e(r.code) + '"></div>' +
          '<div class="st4">' + stat("매집점수", r.score != null ? r.score.toFixed(0) : "–") + stat("거래량", r.vol != null ? r.vol.toFixed(1) + "배" : "–") + stat("한달 가격", '<span class="' + cls(r.m1) + '">' + sgn(r.m1) + '%</span>') + stat("주가강도", r.rs != null ? r.rs.toFixed(0) : "–") + '</div>' +
          '<div class="row"><span class="tm">' + (r.sector && r.sector !== "미분류" ? e(r.sector) : (V.MKT[r.mkt] || "")) + (r.days > 1 ? " · 매집 " + r.days + "일째" : "") + '</span>' + opBtn(r.code) + '</div></div>';
      };
      var P = pager("abox", rows, aCard); P.draw();
    }).catch(function(){ el.innerHTML = '<div class="empty">자료를 못 불러왔어요.</div>'; });
  };
})();
