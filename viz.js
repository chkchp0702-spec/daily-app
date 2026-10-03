/* C. Investing — 차트·그림 도우미 (SVG/HTML, 외부 라이브러리 없음)
   색: 상승 빨강 / 하락 파랑 (한국식), 범주 색은 고정 순서 (검증된 다크 팔레트) */
var V = (function(){
  var UP = "#e66767", DN = "#3987e5", MID = "#2a3142";
  var CAT = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9"];
  var FLAGS = {US:"🇺🇸", KR:"🇰🇷", JP:"🇯🇵", CN:"🇨🇳", HK:"🇭🇰"};
  var MKT = {US:"미국", KR:"한국", JP:"일본", CN:"중국", HK:"홍콩"};

  function e(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  /* 원본 리포트의 강조 태그(b, em, i, br)만 살린다 */
  function rich(s){ return e(s).replace(/&lt;(\/?)(b|em|i|strong)&gt;/g, "<$1$2>").replace(/&lt;br\s*\/?&gt;/g, "<br>"); }
  function sgn(v, d){ if (v == null || isNaN(v)) return "–"; d = d == null ? 1 : d; return (v > 0 ? "+" : "") + (+v).toFixed(d); }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function fmt(v){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v);
    return a >= 1000 ? Math.round(v).toLocaleString("en-US") : a >= 100 ? (+v).toFixed(1) : (+v).toFixed(2); }

  /* ---------- 탭/터치 툴팁: data-tip 이 있는 요소 ---------- */
  var tipEl = null;
  function showTip(t, x, y){
    if (!tipEl){ tipEl = document.createElement("div"); tipEl.className = "vtip"; document.body.appendChild(tipEl); }
    tipEl.innerHTML = t; tipEl.style.display = "block";
    var w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    var L = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8);
    var T = y - h - 14; if (T < 8) T = y + 18;
    tipEl.style.left = L + "px"; tipEl.style.top = T + "px";
  }
  function hideTip(){ if (tipEl) tipEl.style.display = "none"; }
  function onTip(ev){
    var t = ev.target.closest && ev.target.closest("[data-tip]");
    if (!t){ hideTip(); return; }
    var p = ev.touches ? ev.touches[0] : ev;
    showTip(t.getAttribute("data-tip"), p.clientX, p.clientY);
  }
  document.addEventListener("pointerover", function(ev){ if (ev.pointerType === "mouse") onTip(ev); });
  document.addEventListener("pointerdown", onTip);
  window.addEventListener("scroll", hideTip, {passive:true});

  /* ---------- 작은 가격 그래프 ---------- */
  // opt: {w,h, ref:{v,label}, band:[lo,hi], mark:index, color}
  function spark(vals, opt){
    opt = opt || {};
    vals = (vals || []).filter(function(v){ return v != null && !isNaN(v); });
    var W = opt.w || 300, H = opt.h || 70, pad = 4;
    if (vals.length < 2) return '<div class="spark-empty">차트 준비 중</div>';
    var ext = vals.slice();
    if (opt.ref) ext.push(opt.ref.v);
    if (opt.band) ext.push(opt.band[0], opt.band[1]);
    var lo = Math.min.apply(null, ext), hi = Math.max.apply(null, ext), r = (hi - lo) || 1;
    lo -= r * 0.06; hi += r * 0.06; r = hi - lo;
    var st = (W - pad * 2) / (vals.length - 1);
    var y = function(v){ return pad + (hi - v) / r * (H - pad * 2); };
    var pts = vals.map(function(v, i){ return [pad + i * st, y(v)]; });
    var line = pts.map(function(p){ return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    var up = vals[vals.length - 1] >= vals[0], c = opt.color || (up ? UP : DN), last = pts[pts.length - 1];
    var id = "g" + Math.random().toString(36).slice(2, 8);
    var s = '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".28"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></linearGradient></defs>';
    if (opt.band) s += '<rect x="0" width="' + W + '" y="' + y(opt.band[1]).toFixed(1) + '" height="' + Math.max(1, y(opt.band[0]) - y(opt.band[1])).toFixed(1) + '" fill="#ffffff" opacity=".06"/>';
    s += '<polygon points="' + pts[0][0].toFixed(1) + ',' + H + ' ' + line + ' ' + last[0].toFixed(1) + ',' + H + '" fill="url(#' + id + ')"/>' +
         '<polyline points="' + line + '" fill="none" stroke="' + c + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>';
    if (opt.ref) s += '<line x1="0" x2="' + W + '" y1="' + y(opt.ref.v).toFixed(1) + '" y2="' + y(opt.ref.v).toFixed(1) + '" stroke="#e8ecf4" stroke-opacity=".55" stroke-dasharray="4 4" stroke-width="1" vector-effect="non-scaling-stroke"/>';
    if (opt.mark != null && pts[opt.mark]) s += '<line x1="' + pts[opt.mark][0].toFixed(1) + '" x2="' + pts[opt.mark][0].toFixed(1) + '" y1="0" y2="' + H + '" stroke="#e8ecf4" stroke-opacity=".35" stroke-width="1" vector-effect="non-scaling-stroke"/>';
    s += '</svg><span class="spark-dot" style="left:' + (last[0] / W * 100).toFixed(2) + '%;top:' + (last[1] / H * 100).toFixed(2) + '%;background:' + c + '"></span>';
    if (opt.ref && opt.ref.label) s += '<span class="spark-ref" style="top:' + (y(opt.ref.v) / H * 100).toFixed(2) + '%">' + e(opt.ref.label) + '</span>';
    return '<div class="sparkw" style="height:' + H + 'px">' + s + '</div>';
  }

  /* ---------- 가로 막대 (크기) ---------- */
  // rows: [{label, v, text, sub, tip, color, onclick}] — opt: {max, color, unit}
  function hbars(rows, opt){
    opt = opt || {};
    var mx = opt.max || Math.max.apply(null, rows.map(function(r){ return Math.abs(r.v) || 0; }).concat([1e-9]));
    return '<div class="hb">' + rows.map(function(r){
      var w = Math.max(2, Math.abs(r.v) / mx * 100);
      return '<div class="hb-row"' + (r.tip ? ' data-tip="' + e(r.tip) + '"' : '') + (r.attr || '') + '>' +
        '<div class="hb-l">' + r.label + (r.sub ? '<small>' + e(r.sub) + '</small>' : '') + '</div>' +
        '<div class="hb-t"><div class="hb-f" style="width:' + w.toFixed(1) + '%;background:' + (r.color || opt.color || "var(--c)") + '"></div></div>' +
        '<div class="hb-v">' + (r.text != null ? r.text : fmt(r.v) + (opt.unit || "")) + '</div></div>';
    }).join("") + '</div>';
  }

  /* ---------- 가운데 0 기준 막대 (상승/하락) ---------- */
  function dbars(rows, opt){
    opt = opt || {};
    var mx = opt.max || Math.max.apply(null, rows.map(function(r){ return Math.abs(r.v) || 0; }).concat([1e-9]));
    return '<div class="db">' + rows.map(function(r){
      var w = Math.abs(r.v) / mx * 50, pos = r.v >= 0;
      return '<div class="db-row"' + (r.tip ? ' data-tip="' + e(r.tip) + '"' : '') + (r.attr || '') + '><div class="db-l">' + r.label + '</div>' +
        '<div class="db-t"><span class="db-z"></span><div class="db-f" style="' + (pos ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) + '%;background:' + (pos ? UP : DN) + '"></div></div>' +
        '<div class="db-v ' + cls(r.v) + '">' + (r.text != null ? r.text : sgn(r.v) + (opt.unit == null ? "%" : opt.unit)) + '</div></div>';
    }).join("") + '</div>';
  }

  /* ---------- 세로 막대 (날짜별, 상승/하락) ---------- */
  // rows: [{label, v, tip, top}]
  function cols(rows, opt){
    opt = opt || {};
    var H = opt.h || 120;
    var hi = Math.max(0, Math.max.apply(null, rows.map(function(r){ return r.v || 0; })));
    var lo = Math.min(0, Math.min.apply(null, rows.map(function(r){ return r.v || 0; })));
    var rng = (hi - lo) || 1;
    // 값 라벨 자리 (위·아래 14px) 를 남기고 그린다
    var P = 16, plot = H - P * 2;
    var Y = function(v){ return P + (hi - v) / rng * plot; };
    var z = Y(0);
    return '<div class="vc" style="height:' + H + 'px"><span class="vc-z" style="top:' + z.toFixed(1) + 'px"></span>' + rows.map(function(r){
      var v = r.v || 0, y1 = Y(v), top = Math.min(z, y1), h = Math.max(1, Math.abs(y1 - z));
      var lab = r.top ? '<span class="vc-n" style="top:' + (v >= 0 ? (top - 14) : (top + h + 2)).toFixed(1) + 'px">' + e(r.top) + '</span>' : '';
      return '<div class="vc-c"' + (r.tip ? ' data-tip="' + e(r.tip) + '"' : '') + '><div class="vc-b" style="top:' + top.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px;background:' + (r.color || (v >= 0 ? UP : DN)) + '"></div>' +
             lab + '<span class="vc-x">' + e(r.label) + '</span></div>';
    }).join("") + '</div>';
  }

  /* ---------- 선 그래프 (여러 줄, 축 하나) ---------- */
  // series: [{name, color, vals:[...]}], labels: [...]
  function lines(series, labels, opt){
    opt = opt || {};
    var W = 340, H = opt.h || 170, L = 6, R = 52, T = 10, B = 22;
    var all = [];
    series.forEach(function(s){ s.vals.forEach(function(v){ if (v != null) all.push(v); }); });
    if (!all.length || labels.length < 2) return '<div class="spark-empty">데이터가 더 쌓이면 그려져요</div>';
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), r = (hi - lo) || 1;
    lo -= r * 0.1; hi += r * 0.1; r = hi - lo;
    var n = labels.length, x = function(i){ return L + i * (W - L - R) / (n - 1); }, y = function(v){ return T + (hi - v) / r * (H - T - B); };
    var s = '<svg class="lc" viewBox="0 0 ' + W + ' ' + H + '">';
    for (var g = 0; g < 3; g++){ var gv = lo + r * (g + 0.5) / 3; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(gv).toFixed(1) + '" y2="' + y(gv).toFixed(1) + '" class="lc-g"/>' +
      '<text x="' + (W - R + 4) + '" y="' + (y(gv) + 3).toFixed(1) + '" class="lc-a">' + fmt(gv) + (opt.unit || "") + '</text>'; }
    if (opt.zero && lo < 0 && hi > 0) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" class="lc-z"/>';
    s += '<text x="' + L + '" y="' + (H - 6) + '" class="lc-a">' + e(labels[0]) + '</text><text x="' + (W - R) + '" y="' + (H - 6) + '" class="lc-a" text-anchor="end">' + e(labels[n - 1]) + '</text>';
    var ends = [];
    series.forEach(function(sr){
      var p = []; sr.vals.forEach(function(v, i){ if (v != null) p.push([x(i), y(v), v]); });
      if (!p.length) return;
      s += '<polyline points="' + p.map(function(q){ return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ") + '" fill="none" stroke="' + sr.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
      p.forEach(function(q){ s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="2.5" fill="' + sr.color + '" stroke="#121826" stroke-width="1.5"/>'; });
      ends.push([p[p.length - 1][1], sr]);
    });
    // 끝 라벨 (겹치지 않게)
    ends.sort(function(a, b){ return a[0] - b[0]; });
    for (var k = 1; k < ends.length; k++) if (ends[k][0] - ends[k - 1][0] < 12) ends[k][0] = ends[k - 1][0] + 12;
    // 탭 영역 (날짜별)
    for (var i = 0; i < n; i++){
      var tip = "<b>" + e(labels[i]) + "</b>" + series.map(function(sr){ return sr.vals[i] == null ? "" : '<br><i style="background:' + sr.color + '"></i>' + e(sr.name) + " " + fmt(sr.vals[i]) + (opt.unit || ""); }).join("");
      var x0 = i === 0 ? 0 : (x(i - 1) + x(i)) / 2, x1 = i === n - 1 ? W - R : (x(i) + x(i + 1)) / 2;
      s += '<rect x="' + x0.toFixed(1) + '" y="0" width="' + (x1 - x0).toFixed(1) + '" height="' + (H - B) + '" fill="transparent" data-tip="' + e(tip) + '"/>';
    }
    s += '</svg>';
    var leg = series.length > 1 ? '<div class="lg">' + series.map(function(sr){ var lv = sr.vals.filter(function(v){ return v != null; }).pop();
      return '<span><i style="background:' + sr.color + '"></i>' + e(sr.name) + ' <b>' + fmt(lv) + (opt.unit || "") + '</b></span>'; }).join("") + '</div>' : "";
    return leg + s;
  }

  /* ---------- 도넛 ---------- */
  function donut(segs, center, sub){
    var tot = segs.reduce(function(a, s){ return a + s.v; }, 0) || 1, a0 = -Math.PI / 2, R = 46, r = 30, s = "";
    segs.forEach(function(sg){
      var a1 = a0 + sg.v / tot * Math.PI * 2, gap = 0.025;
      var A = a0 + gap, Bn = a1 - gap; if (Bn < A) Bn = A + 0.001;
      var big = Bn - A > Math.PI ? 1 : 0;
      var p = function(rad, ang){ return (60 + rad * Math.cos(ang)).toFixed(2) + "," + (60 + rad * Math.sin(ang)).toFixed(2); };
      s += '<path d="M' + p(R, A) + ' A' + R + ',' + R + ' 0 ' + big + ' 1 ' + p(R, Bn) + ' L' + p(r, Bn) + ' A' + r + ',' + r + ' 0 ' + big + ' 0 ' + p(r, A) + 'Z" fill="' + sg.color + '" data-tip="' + e("<b>" + sg.label + "</b> " + sg.v + "%") + '"/>';
      a0 = a1;
    });
    return '<div class="dn-w"><svg viewBox="0 0 120 120" class="dnut">' + s + '<text x="60" y="58" text-anchor="middle" class="dn-c">' + e(center) + '</text><text x="60" y="73" text-anchor="middle" class="dn-s">' + e(sub || "") + '</text></svg>' +
      '<div class="dn-l">' + segs.map(function(sg){ return '<div><i style="background:' + sg.color + '"></i><span>' + e(sg.label) + '</span><b>' + sg.v + '%</b></div>'; }).join("") + '</div></div>';
  }

  /* ---------- 진행 막대 ---------- */
  function progress(n, of, color){
    var w = of ? Math.min(100, n / of * 100) : 0;
    return '<div class="pg"><div class="pg-f" style="width:' + w.toFixed(1) + '%;background:' + (color || "var(--c)") + '"></div></div>';
  }

  /* ---------- 단타 알람: 최저~최고 범위 막대 ---------- */
  function range(lo, hi, now){
    if (lo == null || hi == null) return "";
    var a = Math.min(lo, 0, now == null ? 0 : now), b = Math.max(hi, 0, now == null ? 0 : now);
    if (b - a < 2){ var m = (a + b) / 2; a = m - 1; b = m + 1; }
    var X = function(v){ return ((v - a) / (b - a) * 100).toFixed(1) + "%"; };
    return '<div class="rg"><div class="rg-t"></div>' +
      '<div class="rg-r" style="left:' + X(lo) + ';width:calc(' + X(hi) + ' - ' + X(lo) + ')"></div>' +
      '<span class="rg-z" style="left:' + X(0) + '"><em>알람가</em></span>' +
      (now != null ? '<span class="rg-n ' + cls(now) + '" style="left:' + X(now) + '"><em class="' + (parseFloat(X(now)) > 78 ? "r" : parseFloat(X(now)) < 22 ? "l" : "") + '">현재 ' + sgn(now) + '%</em></span>' : '') +
      '<span class="rg-e" style="left:0">' + sgn(lo) + '%</span><span class="rg-e" style="right:0">' + sgn(hi) + '%</span></div>';
  }

  /* ---------- 히트맵 색 (가운데 회색, 위 빨강, 아래 파랑) ---------- */
  function heat(v, mx){
    if (v == null || isNaN(v)) return "transparent";
    var t = Math.max(-1, Math.min(1, v / (mx || 1)));
    var mix = function(c1, c2, k){ var a = [1, 3, 5].map(function(i){ return parseInt(c1.substr(i, 2), 16); }), b = [1, 3, 5].map(function(i){ return parseInt(c2.substr(i, 2), 16); });
      return "rgb(" + a.map(function(x, i){ return Math.round(x + (b[i] - x) * k); }).join(",") + ")"; };
    return t >= 0 ? mix(MID, "#c94a4a", Math.sqrt(t)) : mix(MID, "#2f6fd0", Math.sqrt(-t));
  }

  /* ---------- 가격 데이터 (원페이지 DB의 주간 종가) ---------- */
  var PRICE = {}, PEND = {};
  var OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function fnv(str){ var h = 0x811c9dc5, b = new TextEncoder().encode(str); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function shard(sym){ var x = (fnv(sym) % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  function loadShard(sh){
    if (PRICE[sh]) return Promise.resolve(PRICE[sh]);
    if (!PEND[sh]) PEND[sh] = fetch(OPD + "p/" + sh + ".json").then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; }).then(function(j){ PRICE[sh] = j; return j; });
    return PEND[sh];
  }
  // 코드 → [날짜, 종가, 전일, 1년고, 1년저, 시작일, [주간종가]] (한국 6자리는 .KS → .KQ 순서로)
  function price(code){
    var c = String(code || "");
    var cands = /^\d{6}$/.test(c) ? [c + ".KS", c + ".KQ"] : [c];
    return Promise.all(cands.map(function(s){ return loadShard(shard(s)).then(function(j){ return j[s]; }); }))
      .then(function(r){ for (var i = 0; i < r.length; i++) if (r[i]) return r[i]; return null; });
  }
  /* 화면의 [data-spark] 자리에 차트 채우기: data-spark=코드, data-ref=기준가, data-band="lo,hi", data-label */
  function fillSparks(root){
    [].forEach.call((root || document).querySelectorAll("[data-spark]:not([data-done])"), function(el){
      el.setAttribute("data-done", "1");
      price(el.getAttribute("data-spark")).then(function(p){
        if (!p){ el.innerHTML = '<div class="spark-empty">가격 없음</div>'; return; }
        var ref = el.getAttribute("data-ref"), band = el.getAttribute("data-band");
        var o = {h: +(el.getAttribute("data-h") || 64)};
        if (ref) o.ref = {v: +ref, label: el.getAttribute("data-label") || ""};
        if (band){ var b = band.split(","); o.band = [+b[0], +b[1]]; }
        var vals = p[6].slice(); vals[vals.length - 1] = p[1];
        var chg = (vals[vals.length - 1] / vals[0] - 1) * 100;
        el.innerHTML = spark(vals, o) + '<div class="spark-cap"><span>1년</span><b class="' + cls(chg) + '">' + sgn(chg) + '%</b><span>' + p[0].slice(5).replace("-", "/") + ' 종가 ' + fmt(p[1]) + '</span></div>';
      });
    });
  }

  return {e:e, rich:rich, sgn:sgn, cls:cls, fmt:fmt, UP:UP, DN:DN, CAT:CAT, FLAGS:FLAGS, MKT:MKT,
          spark:spark, hbars:hbars, dbars:dbars, cols:cols, lines:lines, donut:donut, progress:progress, range:range, heat:heat,
          price:price, fillSparks:fillSparks, hideTip:hideTip};
})();
