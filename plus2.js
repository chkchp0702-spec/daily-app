/* CH Investing — 2차 업그레이드: 시황 · 고래 · 컵 · 갭 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt;
  var P = PL, X = P.X, card = P.card, chip = P.chip, pct = P.pct, opA = P.opA, kn = P.kn, md = P.md;

  /* ======================= 🌐 시황 ======================= */
  var TYP = {sp500: 1, nasdaq: 1.3, dow: 0.9, kospi: 1.2, kosdaq: 1.4, vix: 7, us10y: 1.5, usdkrw: 0.45, dxy: 0.4, wti: 2.2, gold: 1, samsung: 2, hynix: 2.6, nvidia: 2.8, micron: 3.3};
  function overnight(el){
    getJSON(RAW + "market-strategy-report/main/market/latest.json?" + Date.now()).then(function(d){
      var it = d.items || {}, rows = Object.keys(TYP).filter(function(k){ return it[k] && it[k].change_pct != null; }).map(function(k){
        return {k: k, nm: (it[k].name || k), c: it[k].change_pct, z: Math.abs(it[k].change_pct) / TYP[k], v: it[k].value}; });
      rows.sort(function(a, b){ return b.z - a.z; });
      var top = rows.slice(0, 3);
      if (!top.length) return;
      var word = function(z){ return z >= 2 ? "평소의 " + z.toFixed(1) + "배 · 크게 움직임" : z >= 1 ? "평소보다 큼" : "평소 수준"; };
      el.innerHTML = card("🌙 밤사이 가장 크게 움직인 3가지 <span class='mut'>" + e(d.fetched_kst || "") + "</span>", top.map(function(x, i){
        return '<div class="xtd"><span class="n">' + (i + 1) + '</span><div><b>' + e(x.nm) + ' <span class="' + cls(x.k === "vix" || x.k === "us10y" || x.k === "usdkrw" ? -x.c : x.c) + '">' + pct(x.c) + '</span></b>' +
          '<small class="mut" style="display:block">' + word(x.z) + (x.k === "vix" ? " · 공포지수라 오르면 나쁜 신호" : x.k === "usdkrw" ? " · 환율↑ = 원화 약세 (외국인 매도 압력)" : x.k === "us10y" ? " · 금리↑ = 성장주 부담" : "") + '</small></div></div>'; }).join("") +
        '<p class="note">"평소" = 그 자산이 하루에 보통 움직이는 폭. 같은 −1%라도 VIX·유가보다 S&P500의 −1%가 더 큰 사건이에요.</p>');
    }).catch(function(){});
  }
  function schedBoard(el, d){
    X("earn_cal.json").then(function(EC){
      var wl = P.WL(), t = P.today(), end = P.dAdd(t, 7);
      var ev = ((d && d.schedule) || []).slice(0, 5).map(function(s){ return {w: s.when, t: s.what, then: s.then, k: "시장"}; });
      var ec = ((EC && EC.items) || []).filter(function(x){ return x.d >= t && x.d <= end; });
      ec.sort(function(a, b){ return (wl[kn(b.s)] ? 1 : 0) - (wl[kn(a.s)] ? 1 : 0) || (a.d < b.d ? -1 : 1); });
      if (!ev.length && !ec.length) return;
      var dd = function(x){ var n = P.dDiff(x, t); return n === 0 ? "오늘" : n === 1 ? "내일" : "D-" + n; };
      el.innerHTML = card("📅 이번 주 일정판 <span class='mut'>시장 일정 + 내 종목·신호 종목 실적</span>",
        (ev.length ? '<div class="tl">' + ev.map(function(s){ return '<div class="tl-i"><span class="tl-w">' + e(s.w) + '</span><div><b>' + V.rich(s.t) + '</b>' + (s.then ? '<small>→ ' + V.rich(s.then) + '</small>' : '') + '</div></div>'; }).join("") + '</div>' : '') +
        (ec.length ? '<div class="sub2">실적·배당락 (7일 안)</div><div class="xt">' + ec.slice(0, 12).map(function(x){
          return '<div class="xr' + (wl[kn(x.s)] ? " star" : "") + '"><b class="dday">' + dd(x.d) + '</b>' + opA(x.s, (wl[kn(x.s)] ? "★ " : "") + '<b>' + e(String(x.n).slice(0, 16)) + '</b>') +
            '<span class="mut">' + e(x.kind) + ' ' + md(x.d) + '</span><span class="mut">' + e((x.why || []).join("·")) + '</span></div>'; }).join("") + '</div>' : '') +
        '<p class="note">★ = 내 관심종목. 실적 날짜는 매주 토요일에 새로 받아요 (회사 사정으로 바뀔 수 있음).</p>');
    });
  }
  function hitRate(el){
    getJSON("archive/market/ledger.json?" + (M.updated || "")).then(function(L){
      var sc = (L && L.scorecard) || [];
      if (!sc.length) return;
      var V_ = {"맞음": 1, "반반": 0.5, "틀림": 0};
      var by = {}, tot = {"맞음": 0, "반반": 0, "틀림": 0, "보류": 0};
      sc.forEach(function(s){ var v = (s.verdict || "").trim(); var k = /맞/.test(v) ? "맞음" : /반/.test(v) ? "반반" : /틀/.test(v) ? "틀림" : "보류"; tot[k]++;
        var d = s.date || "?"; by[d] = by[d] || {n: 0, s: 0}; if (k !== "보류"){ by[d].n++; by[d].s += V_[k]; } });
      var judged = tot["맞음"] + tot["반반"] + tot["틀림"], rate = judged ? (tot["맞음"] + tot["반반"] * 0.5) / judged * 100 : null;
      var days = Object.keys(by).sort().slice(-14);
      var cal = (L.calibration || []).filter(function(c){ return c.outcome != null; });
      var brier = cal.length ? cal.reduce(function(a, c){ return a + Math.pow(c.p - (c.outcome ? 1 : 0), 2); }, 0) / cal.length : null;
      el.innerHTML = card("🎯 시황 적중률 누적 <span class='mut'>채점 " + judged + "건</span>",
        '<div class="x4"><div><small>적중률</small><b class="' + (rate >= 60 ? "up" : rate < 40 ? "dn" : "") + '">' + (rate == null ? "–" : rate.toFixed(0) + "%") + '</b></div><div><small>맞음</small><b class="up">' + tot["맞음"] + '</b></div><div><small>반반</small><b>' + tot["반반"] + '</b></div><div><small>틀림</small><b class="dn">' + tot["틀림"] + '</b></div></div>' +
        (days.length > 1 ? '<div class="sub2">날짜별 적중률</div>' + V.cols(days.map(function(d){ var b = by[d], r = b.n ? b.s / b.n * 100 : 0; return {label: md(d), v: r - 50, top: b.n ? Math.round(r) + "%" : "–", tip: "<b>" + d + "</b><br>" + b.n + "건 채점 · 적중 " + Math.round(r) + "%"}; }), {h: 100}) + '<p class="note">막대가 위면 50% 넘게 맞힌 날.</p>' : '') +
        '<div class="sub2">확률을 걸고 한 예고 <span class="mut">' + (L.calibration || []).length + '개 · 결과 나온 것 ' + cal.length + '개</span></div>' +
        '<p class="note" style="margin-top:0">' + (brier != null ? "확률 정확도(브라이어 점수) " + brier.toFixed(2) + " — 0에 가까울수록 확률을 잘 건 것, 0.25면 동전 던지기 수준." : "결과가 나오면 '45%라고 한 일이 실제로 45% 정도 일어났나'를 채점해요.") + '</p>' +
        (tot["보류"] ? '<p class="note">보류 ' + tot["보류"] + '건은 아직 판정 전.</p>' : ''));
    }).catch(function(){});
  }
  function scenarioPlan(el){
    getJSON("archive/market/ledger.json?" + (M.updated || "")).then(function(L){
      if (!L || !L.scenarios) return;
      var plan = store.scn || {};
      var sc = L.scenarios.slice().sort(function(a, b){ return b.pct - a.pct; });
      var cands = (L.candidates || []);
      var look = cands.filter(function(c){ return !/피할/.test(c.name); }), avoid = cands.filter(function(c){ return /피할/.test(c.name); });
      el.innerHTML = card("🗺️ 시나리오별 내 대응표 <span class='mut'>미리 적어두면 흔들리지 않아요</span>", sc.map(function(s, i){
        return '<div class="scp"><div class="row"><b>' + e(s.label) + '</b><span class="chip2 ' + (i === 0 ? "c" : "") + '">' + s.pct + '%</span></div>' +
          '<textarea data-scn="' + e(s.code) + '" rows="2" placeholder="이렇게 되면 나는… (예: 반도체 비중 줄이고 현금 20%)">' + e(plan[s.code] || "") + '</textarea></div>'; }).join("") +
        (look.length || avoid.length ? '<div class="sub2">리포트가 꼽은 후보</div><div class="xcs">' + look.map(function(c){ return '<div><b>👀 ' + e(c.name) + ' ' + chip(e(c.tag || ""), "c") + '</b><small>' + e(c.instruments || "") + (c.cond ? " · " + e(c.cond) : "") + '</small></div>'; }).join("") +
          avoid.map(function(c){ return '<div class="av"><b>🚫 ' + e(c.name.replace(/^피할 것:\s*/, "")) + '</b><small>' + e(c.cond || "") + '</small></div>'; }).join("") + '</div>' : '') +
        '<p class="note">적은 내용은 이 휴대폰에만 저장돼요. 확률이 바뀌면 위 막대 순서도 바뀌어요.</p>');
      [].forEach.call(el.querySelectorAll("[data-scn]"), function(t){ t.oninput = function(){ store.scn = store.scn || {}; store.scn[t.dataset.scn] = t.value; save(); }; });
    }).catch(function(){});
  }
  function weekReview(el, open){
    var t = P.today(), from = P.dAdd(t, -7);
    Promise.all([getJSON("archive/market/ledger.json?" + (M.updated || "")).catch(function(){ return null; }), X("perf_cup.json"), X("perf_gap.json"), X("perf_accum.json"), X("danta_stats.json"), X("push_log.json"), P.compassNow()]).then(function(r){
      var L = r[0], h = "";
      var sc = ((L && L.scorecard) || []).filter(function(s){ return (s.date || "") >= from; });
      var ok = sc.filter(function(s){ return /맞/.test(s.verdict); }).length, no = sc.filter(function(s){ return /틀/.test(s.verdict); }).length;
      h += '<div class="x4"><div><small>시황 예고</small><b>' + ok + '<span class="mut">/' + (ok + no) + '</span></b><em>맞음/채점</em></div>';
      [["☕ 컵", r[1]], ["📈 갭", r[2]], ["🤫 매집", r[3]]].forEach(function(z){
        var s = ((z[1] && z[1].signals) || []).filter(function(x){ return x.d0 >= from; });
        var a = s.length ? s.reduce(function(q, x){ return q + (x.now || 0); }, 0) / s.length : null;
        h += '<div><small>' + z[0] + ' 신호</small><b class="' + cls(a) + '">' + pct(a) + '</b><em>' + s.length + '개 평균</em></div>';
      });
      h += '</div>';
      var S = r[4], eq = (S && S.equity) || [];
      var wk = eq.filter(function(x){ return (t.slice(0, 4) + "/" + x[0]).replace(/\//g, "-") >= from; });
      var dsum = wk.reduce(function(q, x){ return q + (x[1] || 0); }, 0);
      var lg = (r[5] || []).filter(function(x){ return x.t.slice(0, 10) >= from; });
      var C = r[6];
      h += '<div class="xt">' +
        '<div class="xr"><span>⚡ 단타 가상 매매 (이번 주)</span><b class="' + cls(dsum) + '" style="margin-left:auto">' + pct(dsum) + '</b><span class="mut">' + wk.length + '일</span></div>' +
        '<div class="xr"><span>🔔 보낸 알림</span><b style="margin-left:auto">' + lg.length + '개</b></div>' +
        (C && C.markets ? '<div class="xr"><span>🧭 지금 국면</span><span style="margin-left:auto">' + Object.keys(C.markets).map(function(k){ var m = C.markets[k]; return m.flag + (m.regime || "").slice(0, 2); }).join(" ") + '</span></div>' : '') + '</div>';
      var best = [];
      [r[1], r[2], r[3]].forEach(function(Pf){ ((Pf && Pf.signals) || []).filter(function(x){ return x.d0 >= from; }).forEach(function(x){ best.push(x); }); });
      best.sort(function(a, b){ return (b.now || 0) - (a.now || 0); });
      if (best.length) h += '<div class="sub2">이번 주 신호 중 가장 잘 간 / 못 간</div><div class="cp-sts">' + best.slice(0, 3).map(function(x){ return opA(x.code, '<span class="cp-st"><b>' + e(x.name) + '</b><span class="up">' + pct(x.now) + '</span></span>'); }).join("") +
        best.slice(-2).reverse().map(function(x){ return opA(x.code, '<span class="cp-st"><b>' + e(x.name) + '</b><span class="dn">' + pct(x.now) + '</span></span>'); }).join("") + '</div>';
      var body = card("🗓️ 이번 주 숫자 복기 <span class='mut'>" + md(from) + " ~ " + md(t) + "</span>", h + '<p class="note">리포트 회고(글)와 별개로, 앱의 모든 신호를 숫자로 한 번에 돌아봐요. 신호 수익률은 처음 나온 날 종가 기준.</p>');
      el.innerHTML = open ? body : '<details class="pfold"><summary>🗓️ 이번 주 숫자 복기 펼치기</summary>' + body + '</details>';
    });
  }
  P.wrap("market", function(it, a){
    var isLatest = (M.cats.market || [])[0] && M.cats.market[0].id === it.id;
    var isWeek = /WEEK|WK|MONTH/.test(it.id);
    a.innerHTML = '<div id="pmw"></div><div id="pmo"></div><div id="pms"></div>';
    if (isWeek) weekReview($("pmw"), true);
    if (isLatest) overnight($("pmo"));
    var has = it.files.indexOf("data.json") >= 0;
    (has ? getJSON(file("market", it.id, "data.json")).catch(function(){ return null; }) : Promise.resolve(null)).then(function(d){ if (isLatest || isWeek) schedBoard($("pms"), d); });
  }, function(it, b){
    b.innerHTML = '<div id="pmh"></div><div id="pmp"></div><div id="pmw2"></div>';
    hitRate($("pmh")); scenarioPlan($("pmp"));
    if (!/WEEK|WK|MONTH/.test(it.id)) weekReview($("pmw2"), false);
  });

  /* ======================= 🐋 고래 ======================= */
  function qEnd(q){ var p = String(q || "").split(" "); var m = {Q1: "03-31", Q2: "06-30", Q3: "09-30", Q4: "12-31"}[p[0]]; return m ? p[1] + "-" + m : null; }
  function nextQ(q){ var p = q.split(" "), n = +p[0][1], y = +p[1]; return n === 4 ? "Q1 " + (y + 1) : "Q" + (n + 1) + " " + y; }
  P.wrap("whale", null, function(it, b){
    Promise.all([X("whale_plus.json"), X("whale_holdings.json"), X("whale_x.json")]).then(function(r){
      var W = r[0], WH = r[1], WX = r[2], h = "", wl = P.WL();
      // ④ 13F 공시 카운트다운
      if (WH && WH.m){
        var qs = {}; Object.keys(WH.m).forEach(function(n){ var q = WH.m[n].q; if (q) qs[q] = (qs[q] || 0) + 1; });
        var latestQ = Object.keys(qs).sort(function(a, b){ return qEnd(a) < qEnd(b) ? 1 : -1; })[0];
        if (latestQ){
          var t = P.today(), target = nextQ(latestQ), due = P.dAdd(qEnd(target), 45);
          if (t > due){ target = nextQ(target); due = P.dAdd(qEnd(target), 45); }
          var names = Object.keys(WH.m), filed = names.filter(function(n){ return WH.m[n].q === target; }), wait = names.filter(function(n){ return WH.m[n].q !== target; });
          var left = P.dDiff(due, t), open_ = t > qEnd(target);
          h += card("⏳ 13F 공시 카운트다운 <span class='mut'>" + e(target) + " 보유 내역</span>",
            '<div class="x4"><div><small>마감까지</small><b>' + (open_ ? "D-" + left : "–") + '</b><em>' + md(due) + '</em></div><div><small>제출</small><b class="up">' + filed.length + '</b><em>/ ' + names.length + '</em></div>' +
            '<div><small>분기 끝</small><b>' + md(qEnd(target)) + '</b></div><div><small>지금 자료</small><b>' + e(latestQ) + '</b></div></div>' + V.progress(filed.length, names.length || 1, "#3dd6c6") +
            (filed.length ? '<div class="sub2">벌써 낸 고래</div><div class="cp-sts">' + filed.map(function(n){ return '<a class="cp-st" data-mgr="' + e(n) + '"><b>' + e(n) + '</b><span class="up">' + md(WH.m[n].filed) + '</span></a>'; }).join("") + '</div>' : '') +
            '<p class="note">미국 기관은 분기가 끝나고 45일 안에 13F를 내요. ' + (open_ ? "마감 전후로 고래들의 새 보유 내역이 한꺼번에 들어와요." : e(target) + "이 끝나면(" + md(qEnd(target)) + ") 카운트다운이 시작돼요.") + ' 아직 안 낸 곳 ' + wait.length + '곳.</p>');
        }
      }
      // ① 매도 경보
      if (W && W.sells && W.sells.length) h += card("🚨 고래 매도 경보 <span class='mut'>여러 고래가 정리·크게 줄인 종목</span>", '<div class="xt">' + W.sells.slice(0, 12).map(function(s){
        return '<div class="xr' + (wl[kn(s.t)] ? " star" : "") + '">' + opA(s.t, (wl[kn(s.t)] ? "★ " : "") + '<b>' + e(s.t) + '</b>') + '<span class="dn">정리 ' + s.n + '</span>' + (s.red ? '<span class="mut">축소 ' + s.red + '</span>' : '') +
          '<span class="mut xs" data-tip="' + e("<b>" + s.t + "</b><br>정리: " + s.by.join(", ") + (s.rby.length ? "<br>축소: " + s.rby.join(", ") : "")) + '">' + e(s.by.slice(0, 2).join(", ")) + (s.by.length > 2 ? "…" : "") + '</span></div>'; }).join("") + '</div>' +
        '<p class="note">합의 매수의 반대예요. ★는 내 관심종목 — 들고 있다면 한 번 점검해 보세요. 이름을 길게 누르면 고래 목록.</p>');
      // ③ 확신도
      if (W && W.conviction && W.conviction.length) h += card("💪 고래 확신도 <span class='mut'>비중 × 새로 샀나/얼마나 늘렸나</span>", V.hbars(W.conviction.slice(0, 12).map(function(c){
        return {label: '<b>' + e(c.t) + '</b> <span class="mut">' + c.buy + '명' + (c.sell ? ' · 판 ' + c.sell : '') + '</span>', v: Math.max(0, c.sc), text: c.sc.toFixed(1), color: "#3dd6c6", attr: ' onclick="openOP(\'' + e(c.t) + '\')"',
                tip: "<b>" + e(c.t) + " " + e(c.nm || "") + "</b><br>" + c.who.map(function(w){ return e(w[0]) + " " + e(w[1]) + " (비중 " + w[2] + "%)"; }).join("<br>")}; })) +
        '<p class="note">포트폴리오 5%를 새로 담은 고래 1명 = 5점, 비중 4%를 50% 늘린 고래 = 2점. 숫자만 많은 "합의"보다 돈을 크게 건 쪽을 보여줘요.</p>');
      // ② 내부자 매수
      if (W && W.insider){
        var ks = Object.keys(W.insider);
        var cons = {}; ((WX && WX.consensus) || []).forEach(function(c){ cons[c.t] = c.n; });
        if (ks.length) h += card("🧑‍💼 내부자도 사는 중 <span class='mut'>최근 90일 임원·대주주 장내 매수</span>", ks.map(function(t){
          var rows = W.insider[t], tot = rows.reduce(function(a, x){ return a + (x.val || 0); }, 0);
          return '<div class="xfl"><div class="row">' + opA(t, '<b>' + e(t) + '</b>') + '<span>' + (cons[t] ? chip("고래 " + cons[t] + "명 + 내부자", "hot") : chip("내부자 " + rows.length + "건", "c")) + '<b class="up">$' + (tot >= 1e6 ? (tot / 1e6).toFixed(1) + "M" : Math.round(tot / 1e3) + "K") + '</b></span></div>' +
            '<div class="mut" style="font-size:12px">' + rows.slice(0, 3).map(function(x){ return md(x.d) + " " + e(x.who) + (x.title ? " (" + e(x.title) + ")" : "") + " " + e(x.px); }).join("<br>") + '</div></div>'; }).join("") +
          '<p class="note">회사 사정을 가장 잘 아는 사람이 자기 돈으로 산 기록 (openinsider.com · SEC Form 4). ' + W.insider_checked + '종목 확인.</p>');
        else if (W.insider_checked) h += card("🧑‍💼 내부자 매수", '<p class="note" style="margin:0">고래가 산 종목 ' + W.insider_checked + '개를 확인했는데, 최근 90일 내부자 장내 매수는 없었어요.</p>');
      }
      // ⑤ 고래 vs 관심종목
      var mine = Object.keys(wl), hold = P.whaleHolders(WH);
      var rows = mine.filter(function(k){ return hold[k]; });
      h += card("⭐ 내 관심종목을 가진 고래", rows.length ? rows.map(function(k){
        return '<div class="xfl"><div class="row">' + opA(wl[k].s || k, '<b>' + e(wl[k].n || k) + '</b>') + '<span class="mut">' + hold[k].length + '곳</span></div><div class="cp-sts">' + hold[k].slice(0, 6).map(function(x){
          return '<a class="cp-st" data-mgr="' + e(x[0]) + '"><b>' + e(x[0]) + '</b><span class="mut">' + x[1].toFixed(1) + '%</span>' + (x[2] === "new" ? '<span class="up">신규</span>' : x[2] === "up" ? '<span class="up">추가</span>' : x[2] === "down" ? '<span class="dn">축소</span>' : '') + '</a>'; }).join("") + '</div></div>'; }).join("")
        : '<p class="note" style="margin:0">' + (mine.length ? "담은 종목을 상위 30종목에 넣은 고래가 아직 없어요." : "⭐ 관심종목을 담으면, 그 종목을 가진 고래와 비중을 여기서 보여줘요.") + '</p>');
      b.insertAdjacentHTML("afterbegin", h);
    });
  });

  /* ======================= ☕ 컵 ======================= */
  function handleQ(c){
    // 손잡이 품질: 깊이 8~12% 적당 · 컵 깊이 15~35% · 기간 7주↑ · 주가강도 · 매집강도
    var s = 100, why = [];
    if (c.handle != null){ if (c.handle > 15){ s -= 30; why.push("손잡이가 깊음"); } else if (c.handle > 12){ s -= 12; why.push("손잡이 약간 깊음"); } else if (c.handle < 2){ s -= 8; why.push("손잡이가 거의 없음"); } }
    if (c.depth != null){ if (c.depth > 45){ s -= 25; why.push("컵이 너무 깊음"); } else if (c.depth > 35){ s -= 10; why.push("컵 깊이 큰 편"); } else if (c.depth < 12){ s -= 15; why.push("컵이 얕음"); } }
    if (c.weeks != null && c.weeks < 7){ s -= 15; why.push("기간이 짧음"); }
    if (c.rs != null){ if (c.rs >= 80) s += 5; else if (c.rs < 50){ s -= 15; why.push("주가강도 약함"); } }
    if (c.acc != null && c.acc >= 60) s += 5;
    s = Math.max(0, Math.min(100, Math.round(s)));
    return {s: s, why: why};
  }
  function plan(c){
    if (!c.pivot) return null;
    var hl = c.handle != null ? c.pivot * (1 - c.handle / 100) : null, st8 = c.pivot * 0.92;
    var useH = hl && hl > st8 && hl < c.pivot * 0.97;          // 손잡이가 3% 넘게 파였을 때만 손잡이 저점을 손절선으로
    var stop = useH ? hl : st8, t1 = c.pivot * 1.2, risk = (c.pivot - stop) / c.pivot * 100;
    return {buy: c.pivot, stop: stop, t1: t1, risk: risk, rr: 20 / risk, stopWhy: useH ? "손잡이 저점" : "돌파가 −8%"};
  }
  function qty(pl){ var a = store.acct || {}; if (!a.cap || !a.risk) return ""; var lossPer = pl.buy - pl.stop; if (lossPer <= 0) return "";
    var n = Math.floor(a.cap * a.risk / 100 / lossPer); return n > 0 ? '<span class="mut">→ ' + n.toLocaleString() + '주 (손절 시 −' + (a.cap * a.risk / 100).toLocaleString() + ')</span>' : ""; }
  P.wrap("cup", function(it, a, o){
    if (it.files.indexOf("cards.json") < 0) return;
    Promise.all([getJSON(file("cup", it.id, "cards.json")), X("perf_cup.json"), X("wcup.json")]).then(function(r){
      var d = r[0], Pf = r[1], WC = r[2], h = "", by = {};
      (d.ath || []).concat(d.top || []).forEach(function(c){ by[c.code] = c; });
      // ② 손잡이 품질 + ④ 매수 계획 — 카드마다
      P.each(o, ".cc", function(cc){
        var sp = cc.querySelector("[data-spark]"), c = sp && by[sp.getAttribute("data-spark")]; if (!c) return;
        var q = handleQ(c), pl = plan(c);
        var st4 = cc.querySelector(".st4");
        var html = '<div class="hq"><span class="hq-b ' + (q.s >= 80 ? "g" : q.s >= 60 ? "m" : "b") + '">모양 점수 ' + q.s + '</span><span class="mut">' + e(q.why.slice(0, 2).join(" · ") || "교과서에 가까운 모양") + '</span></div>';
        if (pl) html += '<div class="bp"><div><small>돌파가</small><b>' + fmt(pl.buy) + '</b></div><div><small>손절 <em>' + pl.stopWhy + '</em></small><b class="dn">' + fmt(pl.stop) + '</b></div>' +
          '<div><small>1차 목표 +20%</small><b class="up">' + fmt(pl.t1) + '</b></div><div><small>손익비</small><b>1 : ' + pl.rr.toFixed(1) + '</b></div></div>' + (qty(pl) ? '<div class="bpq">' + qty(pl) + '</div>' : '');
        if (st4) st4.insertAdjacentHTML("afterend", html);
      });
      // ① 돌파 후 추적
      var t = P.today(), sig = ((Pf && Pf.signals) || []).filter(function(s){ return s.bst && s.brkd && P.dDiff(t, s.brkd) <= 45; });
      sig.sort(function(x, y){ return x.brkd < y.brkd ? 1 : -1; });
      if (sig.length){
        var cnt = (Pf && Pf.post) || {};
        h += card("🧭 돌파 후 추적 <span class='mut'>최근 45일 돌파 " + sig.length + "종목</span>",
          '<div class="x4"><div><small>진행 중</small><b>' + (cnt["진행"] || 0) + '</b></div><div><small>성공 +20%</small><b class="up">' + (cnt["성공"] || 0) + '</b></div><div><small>실패 −8%</small><b class="dn">' + (cnt["실패"] || 0) + '</b></div>' +
          '<div><small>성공률</small><b>' + ((cnt["성공"] || 0) + (cnt["실패"] || 0) ? Math.round((cnt["성공"] || 0) / ((cnt["성공"] || 0) + (cnt["실패"] || 0)) * 100) + "%" : "–") + '</b></div></div>' +
          '<div class="xt">' + sig.slice(0, 12).map(function(s){
            return '<div class="xr">' + opA(s.code, (V.FLAGS[s.mkt] || "") + ' <b>' + e(s.name.slice(0, 14)) + '</b>') + '<span class="mut">' + md(s.brkd) + ' 돌파 · ' + (s.bdays || 0) + '일째</span>' +
              '<b class="' + cls(s.bnow) + '">' + pct(s.bnow) + '</b>' + chip(s.bst, s.bst === "성공" ? "hot" : s.bst === "실패" ? "cool" : "c") + '</div>'; }).join("") + '</div>' +
          '<p class="note">돌파가 기준: 종가가 돌파가 −8% 아래로 가면 <b>실패</b>(윌리엄 오닐의 손절 규칙), 고점이 +20%를 넘으면 <b>성공</b>. 숫자 = 돌파가 대비 지금.</p>');
      }
      // ③ 성적표 기반 필터
      if (Pf && Pf.stats){
        var S = Pf.stats, base = (S.all.now || {}).avg || 0;
        var goodM = Object.keys(S.by_mkt || {}).filter(function(k){ var x = S.by_mkt[k].now; return x.n >= 5 && x.avg != null && x.avg >= base; });
        var bs = S.by_score || {}, goodS = Object.keys(bs).sort(function(x, y){ return ((bs[y].now || {}).avg || -99) - ((bs[x].now || {}).avg || -99); })[0];
        var secA = {}; (Pf.signals || []).forEach(function(s){ if (s.sector){ (secA[s.sector] = secA[s.sector] || []).push(s.now || 0); } });
        var goodSec = Object.keys(secA).filter(function(k){ return secA[k].length >= 3 && secA[k].reduce(function(a, b){ return a + b; }, 0) / secA[k].length > base; });
        var inB = function(c){ var sc = c.score || 0; return goodS === "90점 이상" ? sc >= 90 : goodS === "80~89점" ? sc >= 80 && sc < 90 : goodS === "80점 미만" ? sc < 80 : true; };
        var list = (d.top || []).filter(function(c){ return goodM.indexOf(c.mkt) >= 0 && inB(c) && (!goodSec.length || goodSec.indexOf(c.sector) >= 0 || !c.sector); });
        h += '<details class="card pfold2"><summary>🎯 잘 맞던 조건만 보기 <span class="mut">' + list.length + '종목</span></summary>' +
          '<p class="note" style="margin-top:6px">지금까지 성적표에서 평균(' + pct(base) + ')보다 잘 간 조건: <b>' + (goodM.map(function(k){ return (V.FLAGS[k] || "") + (V.MKT[k] || k); }).join(", ") || "나라 –") + '</b> · <b>' + e(goodS || "점수 –") + '</b>' + (goodSec.length ? ' · 섹터 ' + e(goodSec.slice(0, 5).join(", ")) : '') + '</p>' +
          (list.length ? '<div class="xt">' + list.slice(0, 20).map(function(c){ var q = handleQ(c);
            return '<div class="xr">' + opA(c.code, (V.FLAGS[c.mkt] || "") + ' <b>' + e(c.name.slice(0, 15)) + '</b>') + '<span class="mut">' + (c.score || 0).toFixed(0) + '점</span><span class="mut">모양 ' + q.s + '</span><b class="' + (c.brk ? "up" : "") + '">' + (c.brk ? "돌파" : "+" + (-c.dist).toFixed(1) + "%") + '</b></div>'; }).join("") + '</div>' : '<p class="note">조건에 맞는 종목이 오늘은 없어요.</p>') +
          '<p class="note">신호가 쌓일수록 조건이 바뀌어요. 과거에 잘 맞았다고 앞으로도 맞는 건 아니에요.</p></details>';
      }
      // 계좌 설정 (수량 계산)
      var A_ = store.acct || {};
      h += '<details class="card pfold2"><summary>🧮 매수 계획 — 몇 주 살까 <span class="mut">' + (A_.cap ? "설정됨" : "설정하기") + '</span></summary>' +
        '<div class="mf3" style="margin-top:8px"><label>투자금(원)<input id="acap" type="number" inputmode="numeric" value="' + (A_.cap || "") + '" placeholder="10000000"></label><label>한 번에 감수할 손실 %<input id="arisk" type="number" inputmode="decimal" step="0.1" value="' + (A_.risk || "") + '" placeholder="1"></label><label>&nbsp;<button class="btn al-sub" id="asave" style="width:100%;justify-content:center">저장</button></label></div>' +
        '<p class="note">카드마다 돌파가·손절가·목표가가 나와요. 여기 적으면 "손절 나도 투자금의 ○%만 잃는 수량"까지 계산해요 (원화 종목 기준, 해외는 현지 통화).</p></details>';
      // ⑤ 주봉 컵
      if (WC && WC.items && WC.items.length) h += card("🗓️ 주봉 컵 <span class='mut'>큰 회사 " + WC.n_scan + "개 중 · 3년 주간 차트</span>", '<div class="wcg">' + WC.items.slice(0, 12).map(function(c){
        return '<div class="wc">' + opA(c.s, (V.FLAGS[c.mkt] || "") + ' <b>' + e(String(c.n).slice(0, 16)) + '</b>') + '<div class="wc-sp">' + V.spark(c.spark, {h: 54, ref: {v: c.pivot, label: ""}, mark: c.li}) + '</div>' +
          '<div class="mut">컵 ' + c.weeks + '주 · 깊이 ' + c.depth + '% · 손잡이 ' + c.hw + '주 ' + c.hd + '%</div><div class="row"><b class="' + (c.dist >= 0 ? "up" : "") + '">' + (c.dist >= 0 ? "돌파 +" + c.dist.toFixed(1) : "돌파선까지 +" + (-c.dist).toFixed(1)) + '%</b>' + P.starBtn(c.s, c.n) + '</div></div>'; }).join("") + '</div>' +
        '<p class="note">일봉 컵보다 큰 그림 — 몇 달~1년 넘게 만든 컵이에요. 점선 = 돌파선(왼쪽 고점), 세로선 = 컵 시작. 매일 한 번 계산.</p>');
      a.insertAdjacentHTML("beforeend", h);
      var sv = $("asave"); if (sv) sv.onclick = function(){ store.acct = {cap: +$("acap").value || null, risk: +$("arisk").value || null}; save(); P.toast("저장했어요 — 화면을 다시 열면 수량이 보여요"); };
    });
  });

  /* ======================= 📈 갭 ======================= */
  var GT = {"돌파 갭": ["hot", "긴 횡보(박스)를 뚫은 갭 — 가장 믿을 만한 유형"], "실적 갭": ["c", "실적 발표 직후 갭 — 회사 가치가 바뀐 신호"], "진행 갭": ["", "오르는 중간에 나온 갭"], "소진 의심": ["cool", "이미 많이 오른 뒤의 갭 — 끝물일 수 있음"]};
  function gtypeOf(c, sigT){
    if (sigT) return sigT;
    if ((c.boxw || 0) >= 4) return "돌파 갭";
    return "진행 갭";
  }
  function gb(c){ var g = c.gap || 0; return g < 5 ? "갭 5% 미만" : g < 10 ? "갭 5~10%" : "갭 10% 이상"; }
  function vb(c){ return (c.vol || 0) < 3 ? "거래량 3배 미만" : "거래량 3배 이상"; }
  P.wrap("gap", function(it, a, o){
    Promise.all([it.files.indexOf("cards.json") >= 0 ? getJSON(file("gap", it.id, "cards.json")) : Promise.resolve(null), X("perf_gap.json"), X("gap_open.json"), X("gap_plus.json"), X("earn_cal.json")]).then(function(r){
      var d = r[0], Pf = r[1], GO = r[2], GP = r[3], EC = r[4], h = "", by = {}, sigT = {};
      ((d && d.top) || []).forEach(function(c){ by[c.code] = c; });
      ((Pf && Pf.signals) || []).forEach(function(s){ if (s.gtype && !sigT[s.code]) sigT[s.code] = s.gtype; });
      var FT = (Pf && Pf.fill_tbl) || {};
      // ① 유형 + ② 메움 확률 — 카드마다
      P.each(o, ".cc", function(cc){
        var sp = cc.querySelector("[data-spark]"), c = sp && by[sp.getAttribute("data-spark")]; if (!c) return;
        var t = gtypeOf(c, sigT[c.code]), f = FT[gb(c) + "|" + vb(c)];
        var tags = cc.querySelector(".tags");
        var html = '<div class="gq">' + chip("🏷 " + t, (GT[t] || [""])[0]) + (f && f.n5 >= 5 ? '<span class="mut">비슷한 갭(' + gb(c).replace("갭 ", "") + '·' + vb(c).replace("거래량 ", "") + ') 5일 안 메움 <b class="' + (f.f5 >= 50 ? "dn" : "up") + '">' + f.f5 + '%</b> (' + f.n5 + '건)</span>' : '') + '</div>';
        if (tags) tags.insertAdjacentHTML("afterend", html);
      });
      // ③ 첫 30분
      var t0 = P.today();
      ["kr", "us"].forEach(function(k){ var g = GO && GO[k]; if (!g || !g.items || !g.items.length) return;
        var fresh = g.t.slice(0, 10) >= P.dAdd(t0, -1);
        if (!fresh) return;
        var hold = g.items.filter(function(x){ return x.hold; }).length;
        h += card("⏱️ " + (k === "kr" ? "🇰🇷 한국" : "🇺🇸 미국") + " 장 시작 후 갭 확인 <span class='mut'>" + e(g.t.slice(5)) + "</span>",
          '<div class="x2"><div><small>갭 지킴 (박스 위)</small><b class="up">' + hold + '</b></div><div><small>무너짐</small><b class="dn">' + (g.items.length - hold) + '</b></div></div><div class="xt">' + g.items.map(function(x){
            return '<div class="xr" style="flex-wrap:wrap;row-gap:2px">' + opA(x.code, '<b>' + e(String(x.name).slice(0, 14)) + '</b>') + (x.chg != null ? '<span class="' + cls(x.chg) + '">' + pct(x.chg) + '</span>' : '') +
              '<span style="margin-left:auto">' + chip(x.hold ? "지킴" : "무너짐", x.hold ? "hot" : "cool") + (x.above_open ? '' : chip("시가 아래", "")) + '</span>' +
              '<small class="mut" style="flex-basis:100%">장중 저가 ' + fmt(x.low) + ' · 갭 전 박스 상단 ' + fmt(x.boxhi) + '</small></div>'; }).join("") + '</div>' +
          '<p class="note">갭은 첫 30분이 중요해요. 장중 저가가 갭 전 박스 위면 "지킴". 시가 아래로 밀리면 힘이 약한 신호.</p>');
      });
      // ① 유형별 성적
      if (Pf && Pf.by_type){
        var bt = Pf.by_type, ks = Object.keys(bt).filter(function(k){ return bt[k].n >= 2; });
        if (ks.length) h += card("🏷 갭 유형별 성적 <span class='mut'>지금까지 · 메움 비율</span>", V.dbars(ks.map(function(k){ var s = bt[k].now || {};
          return {label: e(k) + ' <span class="mut">' + bt[k].n + '건 · 승률 ' + (s.win == null ? "–" : s.win + "%") + ' · 메움 ' + bt[k].fill + '%</span>', v: s.avg || 0, text: pct(s.avg), tip: "<b>" + e(k) + "</b><br>" + e((GT[k] || ["", ""])[1])}; })) +
          '<div class="cp-sts">' + Object.keys(GT).map(function(k){ return '<span class="cp-st" style="display:block;width:100%"><b>' + e(k) + '</b> <span class="mut">' + e(GT[k][1]) + '</span></span>'; }).join("") + '</div>' +
          '<p class="note">실적 갭은 미국 종목만 판별해요(실적 발표일 자료). 소진 의심 = 갭 전 20일 동안 이미 +25% 넘게 오른 경우.</p>');
      }
      // ② 메움 확률표
      var fk = Object.keys(FT);
      if (fk.length){
        var G = ["갭 5% 미만", "갭 5~10%", "갭 10% 이상"], Vb = ["거래량 3배 미만", "거래량 3배 이상"];
        h += card("🕳️ 갭 메움 확률표 <span class='mut'>5일 안 / 20일 안</span>", '<table class="cmpt ft"><tr><th></th>' + Vb.map(function(v){ return '<th>' + v.replace("거래량 ", "") + '</th>'; }).join("") + '</tr>' + G.map(function(g){
          return '<tr><td>' + g.replace("갭 ", "") + '</td>' + Vb.map(function(v){ var x = FT[g + "|" + v]; return '<td>' + (x && x.n5 ? '<b class="' + (x.f5 >= 50 ? "dn" : "up") + '">' + x.f5 + '%</b><small> / ' + (x.f20 == null ? "–" : x.f20 + "%") + '</small><em>' + x.n + '건</em>' : '–') + '</td>'; }).join("") + '</tr>'; }).join("") + '</table>' +
          '<p class="note">"메움" = 갭 전 박스 상단까지 되돌아옴. 숫자가 낮을수록 갭이 잘 버틴 조합이에요. 각 카드에도 비슷한 조합의 확률을 붙였어요.</p>');
      }
      // ④ 연속 갭
      if (GP && GP.multi && GP.multi.length) h += card("🔁 연속 갭 <span class='mut'>최근 20일에 위로 갭 2번 이상</span>", '<div class="xt">' + GP.multi.slice(0, 12).map(function(x){
        return '<div class="xr">' + opA(x.code, '<b>' + e(String(x.name).slice(0, 14)) + '</b>') + '<span class="chip2 hot">' + x.n + '번</span><span class="mut">' + x.gaps.map(function(g){ return md(g.d) + (g.held ? "" : "↩"); }).join(" ") + '</span><b class="' + cls(x.r20) + '">' + pct(x.r20) + '</b></div>'; }).join("") + '</div>' +
        '<p class="note">갭이 연달아 나오면 사는 힘이 강하다는 뜻 (↩ = 그날 갭을 일부 메움). 숫자 = 20일 수익률. 다만 3~4번째 갭은 소진일 수 있어요.</p>');
      // ⑤ 실적 갭 모음 + 실적 앞둔 후보
      var eg = ((Pf && Pf.signals) || []).filter(function(s){ return s.gtype === "실적 갭"; }).slice(0, 10);
      var gapSet = {}; ((d && d.top) || []).forEach(function(c){ gapSet[kn(c.code)] = c; });
      var soon = ((EC && EC.items) || []).filter(function(x){ return x.kind === "실적" && (x.why || []).some(function(w){ return w === "갭" || w === "컵"; }) && x.d >= t0; }).slice(0, 10);
      if (eg.length || soon.length) h += card("📊 실적 다음날 갭 <span class='mut'>실적이 만든 갭 · 실적 앞둔 후보</span>",
        (eg.length ? '<div class="xt">' + eg.map(function(s){ return '<div class="xr">' + opA(s.code, '<b>' + e(s.name.slice(0, 14)) + '</b>') + '<span class="mut">' + md(s.gday) + ' 갭 +' + (s.gap || 0).toFixed(0) + '%</span><b class="' + cls(s.now) + '">' + pct(s.now) + '</b>' + (s.filled ? chip("메움", "cool") : chip("유지", "hot")) + '</div>'; }).join("") + '</div>' : '<p class="note" style="margin-top:0">아직 실적 갭으로 판별된 신호가 없어요.</p>') +
        (soon.length ? '<div class="sub2">곧 실적 발표하는 컵·갭 후보</div><div class="cp-sts">' + soon.map(function(x){ return opA(x.s, '<span class="cp-st"><b>' + e(String(x.n).slice(0, 12)) + '</b><span class="mut">' + md(x.d) + ' · ' + e(x.why.join("·")) + '</span></span>'); }).join("") + '</div>' : '') +
        '<p class="note">실적 갭은 이후에도 같은 방향으로 가는 경향(실적 발표 후 표류)이 알려져 있어요. 실적 전에 사는 건 도박에 가까워요.</p>');
      a.insertAdjacentHTML("beforeend", h);
    });
  });
})();
