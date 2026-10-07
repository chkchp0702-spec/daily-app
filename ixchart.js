/* CH Investing — 나침반 「📈 대표 지수」 고퀄 차트 (10/7)
   나라별 대표 지수: 미국 다우·S&P500·나스닥 / 일본 닛케이 / 한국 코스피·코스닥 / 홍콩 HSCEI / 중국 상해·심천·과창판
   1개월·3개월 = 캔들, 6개월·1년 = 면적선. 20일선·60일선, 거래량, 기간 최고·최저, 마지막 값 표시.
   차트를 누르고 옆으로 움직이면 그날 값(시·고·저·종, 전일 대비, 기간 시작 대비)이 나온다. */
(function(){
  var PREF = {US: ["^DJI", "^GSPC", "^IXIC"], KR: ["^KS11", "^KQ11"], JP: ["^N225"], HK: ["^HSCE"], CN: ["000001.SS", "399001.SZ", "000688.SS"]};
  var SHORT = {"^DJI": "다우", "^GSPC": "S&P 500", "^IXIC": "나스닥", "^KS11": "코스피", "^KQ11": "코스닥", "^N225": "닛케이 225",
               "^HSCE": "HSCEI (H지수)", "^HSI": "항셍", "000001.SS": "상해종합", "399001.SZ": "심천성분", "000688.SS": "과창판 50"};
  var PER = [["1D", "오늘", 0], ["1M", "1개월", 22], ["3M", "3개월", 65], ["6M", "6개월", 130], ["1Y", "1년", 9999]];
  var UP = "#e66767", DN = "#3987e5", MA20 = "#f2b84b", MA60 = "#a48cff";
  var D = {}, SEQ = 0, JN = 0;
  // 실시간: 동방재부 1분 시세 (JSONP, 앱에서 바로) — 코스닥만 없어서 우리 장중 자료(10분)로
  var EM = {"^DJI": "100.DJIA", "^GSPC": "100.SPX", "^IXIC": "100.NDX", "^KS11": "100.KS11", "^N225": "100.N225", "^HSCE": "100.HSCEI", "^HSI": "100.HSI",
            "000001.SS": "1.000001", "399001.SZ": "0.399001", "000688.SS": "1.000688"};
  var SES = {US: {tz: "America/New_York", o: 570, c: 960, city: "뉴욕 "}, KR: {tz: "Asia/Seoul", o: 540, c: 930}, JP: {tz: "Asia/Tokyo", o: 540, c: 930, ls: 690, le: 750},
             HK: {tz: "Asia/Hong_Kong", o: 570, c: 960, ls: 720, le: 780}, CN: {tz: "Asia/Shanghai", o: 570, c: 900, ls: 690, le: 780}};
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
    return '<div class="ixc" id="' + id + '">' +
      '<div class="ixc-h"><div><div class="ixc-n">' + e(SHORT[ix.sym] || ix.name) + '</div><div class="ixc-d mut">' + e(String(ix.date || "").slice(5).replace("-", "/")) + ' 종가</div></div>' +
      '<div class="ixc-v"><b>' + fmt(ix.last) + '</b><span class="' + cls(ix.chg1) + '">' + (ix.chg1 > 0 ? "▲ " : ix.chg1 < 0 ? "▼ " : "") + pct(ix.chg1) + '</span></div></div>' +
      '<div class="ixc-pp">' + ppHtml(o) + '</div>' +
      '<div class="ixc-w">' + svg + '<div class="ixc-tip"></div></div>' +
      '<div class="ixc-ch">' + [["1주", ix.chg5], ["1개월", ix.chg20], ["올해", ix.chgYtd]].map(function(p){ return '<span><small>' + p[0] + '</small><b class="' + cls(p[1]) + '">' + pct(p[1]) + '</b></span>'; }).join("") +
        '<span class="ixc-52"><small>52주 위치</small><em><i style="left:' + Math.max(0, Math.min(100, pos)).toFixed(1) + '%"></i></em></span></div>' +
      (ix.regime && k.reg ? '<div class="note" style="margin-top:6px">' + k.reg(ix.regime) + ' ' + e(ix.why || "") + '</div>' : '') +
      '</div>';
  }

  // 나라 하나 → 「📈 대표 지수」 카드
  window.IXC = function(m, mk, reg){
    var list = (PREF[mk] || []).map(function(s){ return (m.index || []).filter(function(x){ return x.sym === s; })[0]; }).filter(Boolean);
    if (!list.length) list = (m.index || []).slice();
    if (!list.length) return "";
    var P = per();
    return '<section class="card ixc-card"><h3>📈 대표 지수 <span class="mut">차트를 누르고 옆으로 밀면 그날 값</span></h3>' +
      '<div class="seg2 ixc-seg">' + PER.map(function(p){ return '<button data-p="' + p[0] + '"' + (p[0] === P[0] ? ' class="on"' : '') + '>' + p[1] + '</button>'; }).join("") + '</div>' +
      list.map(function(ix){ return block(ix, {reg: reg, mk: mk}); }).join("") + '</section>';
  };
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
    ".ixc-seg{margin:2px 0 4px}.ixc{padding:14px 0 12px;border-top:1px solid var(--line)}.ixc-seg+.ixc{border-top:0}" +
    ".ixc-h{display:flex;justify-content:space-between;align-items:flex-end}.ixc-n{font-weight:800;font-size:16px;letter-spacing:-.2px}.ixc-d{font-size:11px;margin-top:1px}" +
    ".ixc-v{text-align:right}.ixc-v b{display:block;font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.4px;line-height:1.1}.ixc-v span{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}" +
    ".ixc-pp{display:flex;align-items:center;gap:6px;font-size:12px;margin:6px 0 2px}.ixc-pp b{font-variant-numeric:tabular-nums}.ixc-lg{margin-left:auto;color:var(--sub);font-size:11px;display:flex;align-items:center;gap:4px}" +
    ".ixc-lg i{display:inline-block;width:14px;height:2px;border-radius:1px;margin-left:6px}.ixc-lg i.dsh{height:0;border-top:2px dashed;background:none!important}" +
    ".ixc-w{position:relative;margin:0 -2px}.ixc-svg{display:block;width:100%;height:auto;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:crosshair}" +
    ".ixc-svg .ixg{stroke:var(--line);stroke-width:.7}.ixc-svg .ixg.v{stroke-dasharray:2 4;opacity:.6}.ixc-svg .ixt{fill:var(--dim);font-size:9.5px;font-variant-numeric:tabular-nums}" +
    ".ixc-svg .ixm{fill:var(--sub);font-size:9.5px;font-weight:700;paint-order:stroke;stroke:var(--panel);stroke-width:3px}.ixc-svg .ixp{fill:#fff;font-size:10px;font-weight:800;font-variant-numeric:tabular-nums}" +
    ".ixc-svg .ixx-l{stroke:var(--text);stroke-width:.8;stroke-dasharray:3 3;opacity:.7}.ixc-svg .ixx-d{stroke:#fff;stroke-width:1.5}" +
    ".ixc-tip{display:none;position:absolute;top:6px;z-index:3;min-width:118px;padding:7px 9px;border-radius:10px;background:rgba(18,24,38,.94);border:1px solid var(--line);box-shadow:0 6px 20px rgba(0,0,0,.35);font-size:11.5px;line-height:1.45;pointer-events:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}" +
    ".ixc-tip .big{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums}.ixc-tip .mut{font-size:10.5px}" +
    ".ixc-ch{display:grid;grid-template-columns:1fr 1fr 1fr 1.4fr;gap:6px;margin-top:8px}.ixc-ch span{background:var(--panel2);border-radius:9px;padding:6px 8px;text-align:center}.ixc-ch small{display:block;font-size:10.5px;color:var(--sub)}.ixc-ch b{font-size:13px;font-variant-numeric:tabular-nums}" +
    ".ixc-52 em{position:relative;display:block;height:6px;margin:6px 2px 2px;border-radius:3px;background:linear-gradient(90deg," + DN + "," + "#8a94a8," + UP + ");opacity:.85}.ixc-52 em i{position:absolute;top:-3px;width:4px;height:12px;margin-left:-2px;border-radius:2px;background:#fff;box-shadow:0 0 0 1.5px #0b0f17}";
  css.textContent += ".ixc-on{color:#3ddc84;font-weight:800}.ixc-svg .ixlive{animation:ixpulse 1.6s ease-out infinite;transform-box:fill-box;transform-origin:center}@keyframes ixpulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}";
  document.head.appendChild(css);
})();
