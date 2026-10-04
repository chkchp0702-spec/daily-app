/* CH Investing — 업그레이드 묶음: 신호 성적표·차트 그림·고래 합의·매집 수급·단타 대시보드·시황 할 일/검색 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt, rich = V.rich;
  var XC = {};
  function X(name){ if (!XC[name]) XC[name] = getJSON("archive/x/" + name + "?" + (M.updated || "")).catch(function(){ XC[name] = null; return null; }); return XC[name]; }
  function card(title, body, extra){ return '<section class="card">' + (title ? '<h3>' + title + (extra || "") + '</h3>' : '') + body + '</section>'; }
  function sec(t){ return '<div class="sec">' + t + '</div>'; }
  function chip(t, c){ return '<span class="chip2 ' + (c || "") + '">' + t + '</span>'; }
  function pct(v){ return v == null ? "–" : sgn(v) + "%"; }
  function opA(code, inner, noTk){ return '<a class="xo" href="javascript:openOP(\'' + e(code).replace(/'/g, "") + '\')">' + inner + (noTk || inner.indexOf(V.cd(code)) >= 0 ? '' : ' <em class="tk">' + e(V.cd(code)) + '</em>') + '</a>'; }
  function wrap(key, top, bottom){
    var OLD = RENDER[key];
    RENDER[key] = function(it, el){
      el.innerHTML = '<div class="xa"></div><div class="xo2"></div><div class="xb"></div>';
      var a = el.querySelector(".xa"), o = el.querySelector(".xo2"), b = el.querySelector(".xb");
      OLD(it, o);
      if (top) try { top(it, a, o); } catch(err) {}
      if (bottom) try { bottom(it, b, o); } catch(err) {}
    };
  }
  function latest(cat, fname){
    var L = (M.cats[cat] || []).filter(function(x){ return x.files.indexOf(fname) >= 0; });
    return L.length ? getJSON(file(cat, L[0].id, fname)).catch(function(){ return null; }) : Promise.resolve(null);
  }
  function compassNow(){
    var L = (M.cats.sector || []).filter(function(x){ return x.files.indexOf("compass.json") >= 0; });
    return L.length ? getJSON(file("sector", L[0].id, "compass.json")).catch(function(){ return null; }) : Promise.resolve(null);
  }
  var RG = {"상승장": "▲", "하락장": "▼", "횡보장": "◆"};

  /* ---------- 성적표 (컵·갭·매집 공통) ---------- */
  function scoreboard(P, label){
    if (!P || !P.signals || !P.signals.length) return card("📊 " + label + " 성적표", '<p class="note">신호가 쌓이면 여기에 성적이 나와요. (' + (P ? P.days + "일치 기록" : "준비 중") + ')</p>');
    var A = P.stats.all, tile = function(k, nm){ var s = A[k] || {}; return '<div><small>' + nm + '</small><b class="' + cls(s.avg) + '">' + pct(s.avg) + '</b><em>승률 ' + (s.win == null ? "–" : s.win + "%") + ' · ' + (s.n || 0) + '건</em></div>'; };
    var h = '<div class="x4">' + tile("r5", "5일 뒤") + tile("r20", "20일 뒤") + tile("r60", "60일 뒤") + tile("now", "지금까지") + '</div>';
    var bs = P.stats.by_score || {}, rows = Object.keys(bs).map(function(k){ var s = bs[k][P.stats.all.r20.n >= 10 ? "r20" : "now"]; return {label: e(k) + ' <span class="mut">승률 ' + (s.win == null ? "–" : s.win + "%") + '</span>', v: s.avg || 0, text: pct(s.avg), tip: "<b>" + k + "</b> " + s.n + "건 · 평균 " + pct(s.avg) + " · 승률 " + s.win + "%"}; });
    if (rows.length) h += '<div class="sub2">점수별 평균 수익률 (' + (P.stats.all.r20.n >= 10 ? "20일 뒤" : "지금까지") + ')</div>' + V.dbars(rows, {unit: ""});
    var bm = P.stats.by_mkt || {}, mr = Object.keys(bm).map(function(k){ var s = bm[k].now; return {label: (V.FLAGS[k] || "") + " " + e(V.MKT[k] || k) + ' <span class="mut">승률 ' + (s.win == null ? "–" : s.win + "%") + '</span>', v: s.avg || 0, text: pct(s.avg)}; });
    if (mr.length > 1) h += '<div class="sub2">나라별 (지금까지)</div>' + V.dbars(mr, {unit: ""});
    if (P.brk) h += '<p class="note">신호 뒤 실제로 매수 기준가(피벗)를 넘은 비율 <b>' + P.brk.rate + '%</b> (' + P.brk.n + '건)</p>';
    h += '<div class="sub2">최근 신호 ' + Math.min(15, P.signals.length) + '개</div><div class="xt">' + P.signals.slice(0, 15).map(function(s){
      return '<div class="xr">' + opA(s.code, (V.FLAGS[s.mkt] || "") + ' <b>' + e(s.name.length > 16 ? s.name.slice(0, 15) + "…" : s.name) + '</b>') +
        '<span class="mut">' + s.d0.slice(5).replace("-", "/") + '</span><b class="' + cls(s.now) + '">' + pct(s.now) + '</b><span class="mut">최고 ' + pct(s.maxup) + '</span>' +
        (s.filled != null ? (s.filled ? chip("메움", "cool") : chip("유지", "")) : s.brk != null ? (s.brk ? chip("돌파", "hot") : "") : "") + '</div>';
    }).join("") + '</div>';
    h += '<p class="note">' + P.first + '부터 ' + P.days + '일치 기록 · 신호 = 목록에 처음 나온 날 종가로 샀다고 가정 · 수수료 제외</p>';
    return card("📊 " + label + " 성적표 <span class='mut'>신호 " + P.signals.length + "개</span>", h);
  }
  function sectorPerf(P){
    if (!P || !P.signals) return "";
    var by = {};
    P.signals.forEach(function(s){ var k = s.sector && s.sector !== "미분류" && s.sector !== "-" ? s.sector : null; if (!k) return; (by[k] = by[k] || []).push(s.now); });
    var rows = Object.keys(by).filter(function(k){ return by[k].length >= 2; }).map(function(k){ var v = by[k], a = v.reduce(function(x, y){ return x + y; }, 0) / v.length;
      return {label: e(k) + ' <span class="mut">' + v.length + '</span>', v: a, tip: "<b>" + k + "</b> 신호 " + v.length + "개 · 지금까지 평균 " + pct(a)}; })
      .sort(function(a, b){ return b.v - a.v; }).slice(0, 10);
    return rows.length ? card("🧩 섹터별 신호 수 · 성적 <span class='mut'>숫자 = 신호 수</span>", V.dbars(rows)) : "";
  }

  /* ---------- 컵 그림: 컵·손잡이·돌파선 ---------- */
  function cupSvg(vals, c){
    var W = 320, H = 120, P = 6, n = vals.length;
    var piv = c.pivot, bot = piv && c.depth != null ? piv * (1 - c.depth / 100) : null, hnd = piv && c.handle != null ? piv * (1 - c.handle / 100) : null;
    var ext = vals.concat([piv, bot].filter(function(x){ return x; }));
    var lo = Math.min.apply(null, ext), hi = Math.max.apply(null, ext), r = (hi - lo) || 1; lo -= r * .08; hi += r * .08; r = hi - lo;
    var x = function(i){ return P + i * (W - P * 2) / (n - 1); }, y = function(v){ return P + (hi - v) / r * (H - P * 2); };
    var wk = Math.min(n - 1, Math.round(c.weeks || 0)), x0 = x(n - 1 - wk), hw = Math.min(5, Math.max(2, Math.round(wk / 6)));
    var s = '<svg class="cupsv" viewBox="0 0 ' + W + ' ' + H + '">';
    if (wk > 2) s += '<rect x="' + x0.toFixed(1) + '" y="0" width="' + (x(n - 1) - x0).toFixed(1) + '" height="' + H + '" fill="rgba(255,184,77,.10)" rx="6"/>';
    if (hnd) s += '<rect x="' + x(n - 1 - hw).toFixed(1) + '" y="' + y(piv).toFixed(1) + '" width="' + (x(n - 1) - x(n - 1 - hw)).toFixed(1) + '" height="' + Math.max(2, y(hnd) - y(piv)).toFixed(1) + '" fill="rgba(144,133,233,.35)" rx="3"/>';
    if (bot) s += '<line x1="' + x0.toFixed(1) + '" x2="' + x(n - 1) + '" y1="' + y(bot).toFixed(1) + '" y2="' + y(bot).toFixed(1) + '" stroke="#ffb84d" stroke-opacity=".7" stroke-dasharray="2 3"/>';
    var line = vals.map(function(v, i){ return x(i).toFixed(1) + "," + y(v).toFixed(1); }).join(" ");
    s += '<polyline points="' + line + '" fill="none" stroke="#e8ecf4" stroke-width="1.8" stroke-linejoin="round"/>';
    if (piv) s += '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + y(piv).toFixed(1) + '" y2="' + y(piv).toFixed(1) + '" stroke="' + V.UP + '" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<text x="' + (P + 2) + '" y="' + (y(piv) - 4).toFixed(1) + '" class="cupl up">돌파선 ' + fmt(piv) + '</text>';
    var last = vals[n - 1];
    s += '<circle cx="' + x(n - 1).toFixed(1) + '" cy="' + y(last).toFixed(1) + '" r="4" fill="' + (piv && last >= piv ? V.UP : "#ffb84d") + '" stroke="#121826" stroke-width="2"/></svg>';
    return s;
  }
  function upgradeCups(root, byCode){
    var go = function(){
      [].forEach.call(root.querySelectorAll(".cc .sp-box[data-spark]:not([data-cup])"), function(b){
        var c = byCode[b.getAttribute("data-spark")]; if (!c) return;
        b.setAttribute("data-cup", "1");
        V.price(c.code).then(function(p){
          if (!p || !p[6] || p[6].length < 8) return;
          var vals = p[6].slice(); vals[vals.length - 1] = p[1];
          var dtxt = c.dist == null ? "–" : c.dist >= 0 ? "돌파선 위 +" + c.dist.toFixed(1) + "%" : "돌파선까지 +" + (-c.dist).toFixed(1) + "%";
          b.innerHTML = cupSvg(vals, c) + '<div class="cupk"><span><i class="k1"></i>컵 ' + Math.round(c.weeks || 0) + '주</span><span><i class="k2"></i>바닥 −' + (c.depth || 0).toFixed(0) + '%</span><span><i class="k3"></i>손잡이 −' + (c.handle || 0).toFixed(0) + '%</span><span><i class="k4"></i>돌파선</span></div>' +
            '<div class="spark-cap"><span>주간 종가 1년</span><b class="' + (c.dist != null && c.dist >= 0 ? "up" : "") + '">' + dtxt + '</b><span>' + p[0].slice(5).replace("-", "/") + ' ' + fmt(p[1]) + '</span></div>';
          b.setAttribute("data-done", "1");
        });
      });
    };
    go(); new MutationObserver(go).observe(root, {childList: true, subtree: true});
  }

  /* ======================= ☕ 컵 ======================= */
  wrap("cup", function(it, a, o){
    if (it.files.indexOf("cards.json") < 0) return;
    Promise.all([getJSON(file("cup", it.id, "cards.json")), latest("gap", "cards.json"), compassNow()]).then(function(r){
      var d = r[0], g = r[1], C = r[2], gapSet = {};
      ((g && g.top) || []).forEach(function(x){ gapSet[x.code] = 1; });
      var reg = function(m){ return C && C.markets && C.markets[m] ? C.markets[m].regime : null; };
      var all = (d.ath || []).concat(d.top || []), by = {};
      all.forEach(function(c){ by[c.code] = c; });
      upgradeCups(o, by);
      var near = (d.top || []).filter(function(c){ return c.dist != null && c.dist >= -3 && c.dist < 0 && !c.brk; })
        .sort(function(x, y){ return (reg(y.mkt) === "상승장") - (reg(x.mkt) === "상승장") || y.dist - x.dist; });
      var dual = all.filter(function(c){ return gapSet[c.code]; });
      var h = "";
      if (C && C.markets) h += '<div class="xreg">' + ["US", "KR", "JP", "CN", "HK"].filter(function(k){ return C.markets[k]; }).map(function(k){ var m = C.markets[k];
        return '<span class="xrg ' + (m.regime === "상승장" ? "u" : m.regime === "하락장" ? "d" : "") + '">' + m.flag + " " + RG[m.regime] + " " + e(m.regime) + '</span>'; }).join("") + '</div>' +
        '<p class="note" style="margin:0 2px 10px">🧭 나침반 국면 — <b>상승장</b>인 시장의 신호를 먼저, ★로 표시해요.</p>';
      if (near.length) h += card("🎯 돌파 임박 <span class='mut'>돌파선까지 3% 이내</span>", '<div class="xt">' + near.slice(0, 12).map(function(c){
        var hot = reg(c.mkt) === "상승장";
        return '<div class="xr' + (hot ? " star" : "") + '">' + opA(c.code, (hot ? "★ " : "") + (V.FLAGS[c.mkt] || "") + ' <b>' + e(c.name.length > 16 ? c.name.slice(0, 15) + "…" : c.name) + '</b>') +
          '<span class="xbar"><i style="width:' + Math.max(4, 100 + c.dist / 3 * 100).toFixed(0) + '%"></i></span><b class="up">' + sgn(-c.dist) + '%</b>' + (gapSet[c.code] ? chip("갭도", "hot") : "") + '</div>'; }).join("") + '</div>' +
        '<p class="note">막대가 꽉 찰수록 돌파선에 가까워요. 🔔 알림 탭에서 "컵 돌파 임박"을 구독하면 휴대폰으로 받아요.</p>');
      if (dual.length) h += card("✨ 이중 신호 <span class='mut'>컵 + 갭 동시</span>", '<div class="cp-sts">' + dual.map(function(c){ return opA(c.code, '<span class="cp-st"><b>' + (V.FLAGS[c.mkt] || "") + " " + e(c.name) + '</b><em class="tk">' + e(V.cd(c.code)) + '</em><span class="up">컵·갭</span></span>'); }).join("") + '</div>');
      a.innerHTML = h;
    });
  }, function(it, b){
    X("perf_cup.json").then(function(P){ b.innerHTML = scoreboard(P, "컵 신호") + sectorPerf(P); });
  });

  /* ======================= 📈 갭 ======================= */
  function gapGauge(c){
    var g = Math.min(100, (c.gap || 0) / 15 * 100), v = Math.min(100, (c.vol || 0) / 10 * 100), s = c.score || 0;
    return '<div class="ggz"><div><small>갭 크기</small><span class="xbar"><i style="width:' + g.toFixed(0) + '%;background:' + V.UP + '"></i></span><b>' + (c.gap != null ? c.gap.toFixed(1) + "%" : "–") + '</b></div>' +
      '<div><small>거래량</small><span class="xbar"><i style="width:' + v.toFixed(0) + '%;background:#c98500"></i></span><b>' + (c.vol != null ? c.vol.toFixed(1) + "배" : "–") + '</b></div>' +
      '<div><small>강도 점수</small><span class="xbar"><i style="width:' + Math.min(100, s).toFixed(0) + '%;background:#9085e9"></i></span><b>' + (c.score != null ? c.score.toFixed(0) : "–") + '</b></div></div>';
  }
  wrap("gap", function(it, a, o){
    Promise.all([it.files.indexOf("cards.json") >= 0 ? getJSON(file("gap", it.id, "cards.json")) : Promise.resolve(null), latest("cup", "cards.json"), X("premarket.json")]).then(function(r){
      var d = r[0], cu = r[1], pm = r[2], cupSet = {}, by = {}, h = "";
      ((cu && cu.top) || []).concat((cu && cu.ath) || []).forEach(function(x){ cupSet[x.code] = 1; });
      if (d) ((d.top) || []).forEach(function(c){ by[c.code] = c; });
      // 카드마다 강도 게이지 + 이중 신호 표시
      var go = function(){ [].forEach.call(o.querySelectorAll(".cc .sp-box[data-spark]:not([data-gg])"), function(bx){
        var c = by[bx.getAttribute("data-spark")]; if (!c) return; bx.setAttribute("data-gg", "1");
        bx.insertAdjacentHTML("afterend", gapGauge(c) + (cupSet[c.code] ? '<div class="tags">' + chip("✨ 컵 신호도", "hot") + '</div>' : ""));
      }); };
      go(); new MutationObserver(go).observe(o, {childList: true, subtree: true});
      if (pm && pm.items){
        var fresh = (pm.updated || "").slice(0, 10) === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
        h += card("🌅 미국 장 전 갭 후보 <span class='mut'>" + e(pm.et) + " (뉴욕) · 관심 " + pm.n_watch + "종목 중</span>", (pm.items.length ? '<div class="xt">' + pm.items.slice(0, 12).map(function(x){
          return '<div class="xr">' + opA(x.s, '<b>' + e(x.s) + '</b> <span class="mut">' + e((x.n || "").slice(0, 14)) + '</span>') + '<span class="mut">' + e(x.why.join("·")) + '</span><b class="' + cls(x.gap) + '">' + pct(x.gap) + '</b></div>'; }).join("") + '</div>' : '<p class="note">±2% 넘게 움직이는 종목이 없어요.</p>') +
          '<p class="note">' + (fresh ? "오늘 미국 장 시작 전 가격 기준이에요." : "지난 장 전 기록이에요. 미국 장 전(한국 밤 9~10시)에 새로 계산돼요.") + ' 관심 = 컵·갭·매집·고래·대형주 목록.</p>');
      }
      var dual = d ? (d.top || []).filter(function(c){ return cupSet[c.code]; }) : [];
      if (dual.length) h += card("✨ 이중 신호 <span class='mut'>갭 + 컵 동시</span>", '<div class="cp-sts">' + dual.map(function(c){ return opA(c.code, '<span class="cp-st"><b>' + (V.FLAGS[c.mkt] || "") + " " + e(c.name) + '</b><em class="tk">' + e(V.cd(c.code)) + '</em><span class="up">갭·컵</span></span>'); }).join("") + '</div>');
      a.innerHTML = h;
    });
  }, function(it, b){
    X("perf_gap.json").then(function(P){
      var h = "";
      if (P && P.fill && P.fill.n){
        var F = P.fill;
        h += card("🕳️ 갭 메움 추적 <span class='mut'>갭 전 박스 상단까지 되돌아왔나</span>",
          '<div class="x4"><div><small>5일 안 메움</small><b>' + (F.f5 == null ? "–" : F.f5 + "%") + '</b></div><div><small>20일 안 메움</small><b>' + (F.f20 == null ? "–" : F.f20 + "%") + '</b></div>' +
          '<div><small>지금 갭 유지</small><b class="up">' + (F.now == null ? "–" : (100 - F.now) + "%") + '</b></div><div><small>신호</small><b>' + F.n + '</b></div></div>' +
          V.dbars([{label: "갭 유지한 종목", v: F.held_ret || 0}, {label: "갭 메운 종목", v: F.fill_ret || 0}]) +
          '<p class="note">갭을 지킨 종목과 메운 종목의 지금까지 평균 수익률이에요. 차이가 크면 "갭 유지"가 중요한 신호라는 뜻.</p>');
      }
      b.innerHTML = h + scoreboard(P, "갭 신호") + sectorPerf(P);
    });
  });

  /* ======================= 🤫 조용한 매집 ======================= */
  wrap("accum", function(it, a){
    Promise.all([X("accum_x.json"), getJSON(file("accum", it.id, "list.json")).catch(function(){ return []; })]).then(function(r){
      var Xa = r[0], rows = r[1], by = {}, h = "";
      if (!Xa) return;
      rows.forEach(function(x){ by[x.code] = x; });
      var items = (Xa.items || []).filter(function(x){ return by[x.code]; });
      var brk = items.filter(function(x){ return x.brk; }), near = items.filter(function(x){ return !x.brk && x.to_brk != null && x.to_brk <= 5; }).sort(function(p, q){ return p.to_brk - q.to_brk; });
      if (brk.length || near.length) h += card("🚀 박스 돌파 <span class='mut'>최근 20일 고점 위로</span>", (brk.length ? '<div class="cp-sts">' + brk.map(function(x){ var r0 = by[x.code];
        return opA(x.code, '<span class="cp-st"><b>' + (V.FLAGS[r0.mkt] || "") + " " + e(r0.name.slice(0, 14)) + '</b><em class="tk">' + e(V.cd(x.code)) + '</em><span class="up">돌파</span></span>'); }).join("") + '</div>' : '<p class="note">오늘 돌파한 종목은 없어요.</p>') +
        (near.length ? '<div class="sub2">돌파까지 5% 이내</div><div class="xt">' + near.map(function(x){ var r0 = by[x.code];
          return '<div class="xr">' + opA(x.code, (V.FLAGS[r0.mkt] || "") + ' <b>' + e(r0.name.slice(0, 16)) + '</b>') + '<span class="xbar"><i style="width:' + Math.max(4, 100 - x.to_brk * 20).toFixed(0) + '%"></i></span><b class="up">+' + x.to_brk.toFixed(1) + '%</b></div>'; }).join("") + '</div>' : '') +
        '<p class="note">🔔 알림 탭에서 "매집 돌파"를 구독하면 돌파하는 날 휴대폰으로 받아요.</p>');
      var fl = items.filter(function(x){ return x.flow && x.flow.length; });
      if (fl.length) h += card("🇰🇷 외국인·기관 순매수 <span class='mut'>최근 5일 합계 (주)</span>", fl.map(function(x){ var r0 = by[x.code], f5 = x.flow.slice(0, 5);
        var F = f5.reduce(function(s, d){ return s + d.f; }, 0), O = f5.reduce(function(s, d){ return s + d.o; }, 0);
        var both = F > 0 && O > 0;
        return '<div class="xfl"><div class="row">' + opA(x.code, '<b>' + e(r0.name) + '</b>') + (both ? chip("둘 다 매수 ✓", "hot") : F > 0 || O > 0 ? chip("한쪽 매수", "c") : chip("둘 다 매도", "cool")) + '</div>' +
          '<div class="x2"><div><small>외국인</small><b class="' + cls(F) + '">' + (F > 0 ? "+" : "") + Math.round(F).toLocaleString() + '</b></div><div><small>기관</small><b class="' + cls(O) + '">' + (O > 0 ? "+" : "") + Math.round(O).toLocaleString() + '</b></div></div>' +
          '<div class="xfd">' + f5.slice().reverse().map(function(d){ return '<i class="' + (d.f + d.o > 0 ? "u" : "d") + '" title="' + e(d.d) + '"></i>'; }).join("") + '<span class="mut">← 날짜별 외국인+기관 (빨강 = 순매수)</span></div></div>'; }).join("") +
        '<p class="note">조용한 매집 + 외국인·기관이 같이 사면 신호가 더 믿을 만해요.</p>');
      // 달력 히트맵
      var days = Xa.days || [], cal = Xa.calendar || {}, codes = Object.keys(cal).sort(function(p, q){ return Object.keys(cal[q].days).length - Object.keys(cal[p].days).length; }).slice(0, 15);
      if (days.length && codes.length) h += card("🗓️ 매집 달력 <span class='mut'>최근 " + days.length + "일 · 진할수록 점수 높음</span>",
        '<div class="xcal"><div class="xcr"><span></span>' + days.map(function(d){ return '<em>' + (days.length <= 12 || d.slice(8) % 3 === 0 ? d.slice(8) : "") + '</em>'; }).join("") + '</div>' +
        codes.map(function(c){ var x = cal[c]; return '<div class="xcr">' + opA(c, e((x.name || c).slice(0, 8)), 1) + days.map(function(d){ var v = x.days[d];
          return '<i style="background:' + (v == null ? "#1b2232" : "rgba(213,81,145," + (0.25 + Math.min(1, (v - 50) / 50) * 0.75).toFixed(2) + ")") + '" data-tip="' + e("<b>" + (x.name || c) + "</b> " + d + (v != null ? " · 점수 " + v : " · 없음")) + '"></i>'; }).join("") + '</div>'; }).join("") + '</div>');
      if (Xa.sectors && Xa.sectors.length) h += card("🧩 매집 종목 섹터", V.hbars(Xa.sectors.slice(0, 8).map(function(s){ return {label: e(s[0]), v: s[1], text: s[1] + "개"}; }), {color: "#d55181"}));
      a.innerHTML = h;
    });
  }, function(it, b){ X("perf_accum.json").then(function(P){ b.innerHTML = scoreboard(P, "매집 신호"); }); });

  /* ======================= ⚡ 단타 ======================= */
  wrap("danta", null, function(it, b, o){
    Promise.all([X("danta_stats.json"), getJSON(file("danta", it.id, "alerts.json")).catch(function(){ return []; })]).then(function(r){
      var S = r[0], rows = r[1]; if (!S) return;
      var slot = function(t){ var hh = +(t || "0").slice(0, 2); return hh <= 9 ? "09시" : hh === 10 ? "10시" : hh <= 12 ? "11~12시" : "13시 이후"; };
      // 오늘 알람에 품질 등급 붙이기
      var q = S.quality || {};
      var go = function(){ [].forEach.call(o.querySelectorAll(".list .st:not([data-q])"), function(st, i){
        st.setAttribute("data-q", "1");
        var nm = st.querySelector(".nm a"), tm = st.querySelector(".tm"), ty = st.querySelector(".chip2.c");
        if (!ty || !tm) return;
        var k = ty.textContent + "|" + slot(tm.textContent), g = q[k];
        if (g) ty.insertAdjacentHTML("afterend", '<span class="chip2 g' + g.grade + '" data-tip="' + e("<b>품질 " + g.grade + "</b><br>같은 유형·시간대 과거 " + g.n + "건<br>승률 " + g.win + "% · 가상 매매 평균 " + pct(g.pnl)) + '">품질 ' + g.grade + '</span>');
      }); };
      go(); new MutationObserver(go).observe(o, {childList: true, subtree: true});
      var A = S.all, h = "";
      h += card("📊 단타 성적 대시보드 <span class='mut'>전체 " + A.n + "건</span>",
        '<div class="x4"><div><small>승률(마감)</small><b>' + A.win + '%</b></div><div><small>평균</small><b class="' + cls(A.avg) + '">' + pct(A.avg) + '</b></div><div><small>목표1 도달</small><b class="up">' + A.hit1 + '%</b></div><div><small>손절 도달</small><b class="dn">' + A.hits + '%</b></div></div>' +
        '<div class="sub2">유형별 승률</div>' + V.hbars(Object.keys(S.by_type).map(function(k){ var s = S.by_type[k]; return {label: e(k) + ' <span class="mut">' + s.n + '</span>', v: s.win || 0, text: s.win + "%", color: (s.win || 0) >= 50 ? V.UP : V.DN,
          tip: "<b>" + k + "</b> " + s.n + "건<br>승률 " + s.win + "% · 평균 " + pct(s.avg) + "<br>목표1 " + s.hit1 + "% · 손절 " + s.hits + "% · 장중 최고 평균 " + pct(s.hi)}; }), {max: 100}) +
        '<div class="sub2">시간대별 승률</div>' + V.hbars(Object.keys(S.by_slot).map(function(k){ var s = S.by_slot[k]; return {label: e(k) + ' <span class="mut">' + s.n + '</span>', v: s.win || 0, text: s.win + "%", color: (s.win || 0) >= 50 ? V.UP : V.DN,
          tip: "<b>" + k + "</b> " + s.n + "건 · 승률 " + s.win + "% · 평균 " + pct(s.avg)}; }), {max: 100}) +
        '<p class="note">오늘 알람 옆 <b>품질 A/B/C</b> = 같은 유형·같은 시간대 과거 승률로 매긴 등급 (A: 승률 55%↑·평균 플러스).</p>');
      h += card("🎯 손절·익절 라인 vs 실제 <span class='mut'>알람이 낸 손절가·목표가</span>",
        V.hbars([{label: "목표1까지 올라감", v: A.hit1, text: A.hit1 + "%", color: V.UP}, {label: "손절가까지 내려감", v: A.hits, text: A.hits + "%", color: V.DN}, {label: "둘 다 아님", v: Math.max(0, 100 - A.hit1 - A.hits), text: Math.max(0, 100 - A.hit1 - A.hits) + "%", color: "#4a5266"}], {max: 100}) +
        '<p class="note">장중 최고점 평균은 <b class="up">' + pct(A.hi) + '</b>인데 목표1(보통 +5% 안팎) 도달은 ' + A.hit1 + '%뿐 — 목표를 ' + (A.hi != null && A.hi < 4 ? "더 가깝게(+" + Math.max(1.5, A.hi).toFixed(1) + "% 근처) 잡는 게 현실적" : "그대로 둬도 될 만함") + '이에요.</p>');
      if (S.equity && S.equity.length > 1) h += card("📒 가상 매매 일지 <span class='mut'>알람마다 1주씩 샀다면</span>",
        V.lines([{name: "누적 수익(%)", color: V.CAT[0], vals: S.equity.map(function(x){ return x[2]; })}], S.equity.map(function(x){ return x[0]; }), {h: 150, zero: 1, unit: "%"}) +
        '<p class="note">규칙: 알람가에 사서 → 손절가 닿으면 손절(보수적으로 먼저 계산) → 목표1 닿으면 익절 → 아니면 장 마감 가격. 하루 평균을 더해 간 곡선이에요.</p>' +
        '<div class="xt">' + (S.journal || []).slice(0, 12).map(function(j){ return '<div class="xr"><span class="mut">' + j.d.slice(5).replace("-", "/") + " " + e(j.time || "") + '</span>' + opA(j.code, '<b>' + e(j.name) + '</b>') +
          '<span class="mut">' + e(j.type) + '</span><b class="' + cls(j.pnl) + '">' + pct(j.pnl) + '</b>' + (j.hits ? chip("손절", "cool") : j.hit1 ? chip("익절", "hot") : chip("마감", "")) + '</div>'; }).join("") + '</div>');
      b.innerHTML = h;
    });
  });

  /* ======================= 🐋 고래 ======================= */
  wrap("whale", null, function(it, b){
    X("whale_x.json").then(function(W){
      if (!W) return;
      var h = "";
      if (W.consensus && W.consensus.length) h += card("🤝 합의 매수 <span class='mut'>" + e(W.quarter) + "에 새로 담은 고래 수</span>",
        V.hbars(W.consensus.slice(0, 12).map(function(c){ return {label: '<b>' + e(c.t) + '</b>', v: c.n, text: c.n + "명", color: "#3dd6c6", attr: ' onclick="openOP(\'' + e(c.t) + '\')"',
          tip: "<b>" + c.t + "</b> 새로 산 고래 " + c.n + "<br>" + c.by.map(e).join(", ") + (c.vs != null ? "<br>분기말 대비 지금 " + pct(c.vs) : "")}; })) +
        '<p class="note">같은 분기에 여러 고래가 새로 산 종목일수록 "합의"가 강해요. 막대를 누르면 이름, 길게 보면 고래 목록.</p>');
      if (W.cheap && W.cheap.length) h += card("💸 고래보다 싸게 <span class='mut'>고래 기준가(분기말 가격)보다 지금이 낮은 종목</span>",
        '<div class="xt">' + W.cheap.slice(0, 10).map(function(c){ return '<div class="xr">' + opA(c.t, '<b>' + e(c.t) + '</b>') + '<span class="mut">고래 ' + (c.n || "–") + '명 · 기준 ' + fmt(c.qe) + '</span><span class="mut">지금 ' + fmt(c.last) + '</span><b class="dn">' + pct(c.vs) + '</b></div>'; }).join("") + '</div>' +
        '<p class="note">13F는 정확한 매수가를 알려주지 않아서, 고래가 산 분기의 마지막 날 가격을 기준가로 썼어요.</p>');
      var F = W.follow || {};
      if (F.curve && F.curve.length > 1) h += card("📈 고래 따라하기 수익곡선 <span class='mut'>큰 신규 포지션을 공시일에 사서 다음 공시일까지</span>",
        V.lines([{name: "고래 따라하기", color: "#3dd6c6", vals: F.curve.map(function(x){ return x[1]; })}, {name: "S&P 500(SPY)", color: "#8a94a8", vals: F.curve.map(function(x){ return x[2]; })}],
          F.curve.map(function(x){ return x[0].slice(2, 7).replace("-", "/"); }), {h: 170}) +
        '<div class="xt">' + F.legs.map(function(l){ return '<div class="xr"><b>' + e(l.q) + '</b><span class="mut">' + l.n + '종목 · 승률 ' + l.win + '%</span><b class="' + cls(l.ret) + '">' + pct(l.ret) + '</b><span class="mut">SPY ' + pct(l.spy) + '</span></div>'; }).join("") + '</div>' +
        '<p class="note">100에서 시작. 13F 공시(분기말 +46일)에 같은 비중으로 사서 다음 공시일까지 들고 있는 단순 규칙이에요. 마지막 줄은 진행 중.</p>');
      var T = W.timeline || {}, names = (W.groups.inst || []).concat(W.groups.ppl || []).filter(function(n){ return T[n]; });
      if (names.length) h += card("🕰️ 고래별 분기 타임라인", '<select id="wtl" class="xsel">' + names.map(function(n){ return '<option>' + e(n) + '</option>'; }).join("") + '</select><div id="wtlb"></div>');
      b.innerHTML = h;
      var drawT = function(n){ $("wtlb").innerHTML = (T[n] || []).map(function(r){
        return '<div class="xtl"><div class="row"><b>' + e(r.q) + '</b><span class="mut">보유 ' + r.n + ' · <span class="up">+' + r.na + '</span> / <span class="dn">−' + r.nd + '</span></span></div>' +
          (r.add.length ? '<div class="cp-sts">' + r.add.slice(0, 12).map(function(t){ return opA(t, '<span class="cp-st"><b>' + e(t) + '</b><span class="up">신규</span></span>'); }).join("") + '</div>' : '') +
          (r.drop.length ? '<div class="cp-sts">' + r.drop.slice(0, 8).map(function(t){ return '<span class="cp-st"><b>' + e(t) + '</b><span class="dn">정리</span></span>'; }).join("") + '</div>' : '') + '</div>'; }).join(""); };
      if ($("wtl")){ var sel = $("wtl"); if (store.wtl && T[store.wtl]) sel.value = store.wtl; sel.onchange = function(){ store.wtl = sel.value; save(); drawT(sel.value); }; drawT(sel.value); }
    });
  });

  /* ======================= 🌐 시황: 오늘 할 일 · 종목 칩 · 검색 ======================= */
  wrap("market", function(it, a){
    var has = function(f){ return it.files.indexOf(f) >= 0; };
    Promise.all([has("data.json") ? getJSON(file("market", it.id, "data.json")).catch(function(){ return null; }) : Promise.resolve(null), X("market_x.json")]).then(function(r){
      var d = r[0], MX = r[1], h = "";
      if (d && (d.checks || d.candidates_signal)){
        var cs = d.candidates_signal || {}, ks = Object.keys(cs);
        h += '<section class="card xtodo"><h3>✅ 오늘 할 일</h3>' +
          (d.decision && d.decision.badges ? '<div style="margin-bottom:8px">' + d.decision.badges.map(function(x){ return chip(e(x), "c"); }).join("") + '</div>' : '') +
          (d.checks || []).slice(0, 3).map(function(c, i){ return '<div class="xtd"><span class="n">' + (i + 1) + '</span><div>' + rich(c) + '</div></div>'; }).join("") +
          (ks.length ? '<div class="sub2">볼 것 · 피할 것</div><div class="xcs">' + ks.map(function(k){ var avoid = /피할/.test(k);
            return '<div class="' + (avoid ? "av" : "") + '"><b>' + (avoid ? "🚫 " : "👀 ") + e(k.replace(/^피할 것:\s*/, "")) + '</b><small>' + e(cs[k]) + '</small></div>'; }).join("") + '</div>' : '') + '</section>';
      }
      var chips = MX && MX.chips && MX.chips[it.id];
      if (chips && chips.length) h += card("🏷️ 오늘 리포트에 나온 종목 <span class='mut'>누르면 종목리포트</span>", '<div class="cp-sts" id="mchips">' + chips.map(function(c){
        return '<a class="cp-st" href="javascript:openOP(\'' + e(c[0]) + '\')" data-pc="' + e(c[0]) + '"><b>' + e(c[1].length > 12 ? c[1].slice(0, 11) + "…" : c[1]) + '</b><em class="tk">' + e(V.cd(c[0])) + '</em><span class="mut">…</span></a>'; }).join("") + '</div>');
      h += '<details class="card xsrch"><summary>🔎 지난 시황 검색</summary><div class="reqrow" style="margin-top:10px"><input id="msq" placeholder="예: 삼성전자, 금리, 외국인" enterkeyhint="search"></div><div id="msr"></div></details>';
      a.innerHTML = h;
      [].forEach.call(document.querySelectorAll("#mchips [data-pc]"), function(x){ V.price(x.getAttribute("data-pc")).then(function(p){
        var s = x.querySelector("span"); if (!p){ s.textContent = ""; return; } var c = (p[1] / p[2] - 1) * 100; s.className = cls(c); s.textContent = fmt(p[1]) + " " + sgn(c) + "%"; }); });
      var q = $("msq"), T = null;
      if (q) q.onkeydown = function(ev){ if (ev.key === "Enter"){ q.blur(); search(q.value); } };
      if (q) q.oninput = function(){ clearTimeout(T); T = setTimeout(function(){ if (q.value.trim().length >= 2) search(q.value); }, 500); };
    });
  });
  var MSC = null;
  function marketTexts(){
    if (MSC) return MSC;
    var L = (M.cats.market || []).slice(0, 60);
    MSC = Promise.all(L.map(function(x){
      var f = x.files.indexOf("kakao.txt") >= 0 ? "kakao.txt" : x.files.indexOf("data.json") >= 0 ? "data.json" : x.files.filter(function(z){ return /\.(txt|md)$/.test(z); })[0];
      if (!f) return Promise.resolve(null);
      return getText(file("market", x.id, f)).then(function(t){ return {id: x.id, t: t.replace(/<[^>]+>/g, " ").replace(/\\n/g, " ").replace(/\s+/g, " ")}; }).catch(function(){ return null; });
    })).then(function(r){ return r.filter(Boolean); });
    return MSC;
  }
  function search(qs){
    var box = $("msr"); if (!box) return;
    qs = qs.trim(); if (qs.length < 2) return;
    box.innerHTML = '<div class="loading">찾는 중…</div>';
    marketTexts().then(function(docs){
      var res = [];
      docs.forEach(function(d){ var i = d.t.indexOf(qs), n = 0, k = i; while (k >= 0){ n++; k = d.t.indexOf(qs, k + qs.length); }
        if (i >= 0) res.push({id: d.id, n: n, snip: d.t.slice(Math.max(0, i - 40), i + qs.length + 60)}); });
      box.innerHTML = res.length ? '<div class="mut" style="margin:8px 0">' + res.length + '개 리포트에서 찾았어요</div>' + res.map(function(r){
        return '<button class="xsr" data-id="' + e(r.id) + '"><b>' + e(dateLabel(r.id).replace(/<[^>]+>/g, " ")) + ' <span class="mut">' + e(r.id) + ' · ' + r.n + '번</span></b><small>…' + e(r.snip).split(e(qs)).join("<mark>" + e(qs) + "</mark>") + '…</small></button>'; }).join("")
        : '<div class="mut" style="margin:8px 0">"' + e(qs) + '"이(가) 나온 리포트가 없어요.</div>';
      [].forEach.call(box.querySelectorAll(".xsr"), function(b){ b.onclick = function(){ go("market", b.dataset.id); }; });
    });
  }
})();
