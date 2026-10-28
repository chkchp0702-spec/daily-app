/* 📝 제안서 (10/28 사용자)
   「매일 아침 시황이 나오면 그거에 맞게 주식(국내만·해외도)·개인연금·DC·IRP·국고채·미국채·브라질국채·ELS 투자제안서를 미리 만들어
    기본폼을 만들어 놓고 → 고객 이름·제안자 이름·소속·상품 선택·금액 선택을 넣으면 원페이지 전송용과 풀버전 PDF·PPT 까지 나오는 카테고리」
   · 기본폼: proposal.py 가 매일 아침 + 장중 매시간 archive/x/proposal.json 으로 만들어 둠 (AI·API 없음 → 0원)
   · 이 화면: 그 폼에 고객·금액을 끼워 휴대폰에서 바로 그림(PNG)·PDF·PPT 를 만듦 (lib/html2pdf · lib/pptxgen, 서버 안 씀)
   · 문장은 「~임」체 · 중학생도 읽히게 · 그림 위주 · 앱 이름은 안 넣음(고객용) */
(function(){
  var DATA = null, AT = 0;
  var ST = {sel: [], amt: {}, cust: "", busy: false};
  var ME = {};
  try { ME = JSON.parse(localStorage.getItem("propme") || "{}") || {}; } catch(x) {}
  try { var s0 = JSON.parse(localStorage.getItem("propsel") || "{}"); if (s0 && s0.sel) { ST.sel = s0.sel; ST.amt = s0.amt || {}; } } catch(x) {}
  function keep(){ try { localStorage.setItem("propme", JSON.stringify(ME)); localStorage.setItem("propsel", JSON.stringify({sel: ST.sel, amt: ST.amt})); } catch(x) {} }
  var FONT = '"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo","Noto Sans KR","Noto Sans CJK KR",sans-serif';
  var NAVY = "#14304f", INK = "#1d2533", SUB = "#5b6576", LINE = "#e3e7ee", BG = "#f5f7fb", UP = "#d6402f", DN = "#2a62c9";

  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.setAttribute("role", "status"); d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function load(force){
    if (!force && DATA && Date.now() - AT < 120000) return Promise.resolve(DATA);
    return getJSON("archive/x/proposal.json?" + Math.floor(Date.now() / 120000), {ttl: 120000}).then(function(j){ DATA = j; AT = Date.now(); return j; });
  }
  function form(k){ return ((DATA && DATA.forms) || []).filter(function(f){ return f.key === k; })[0]; }
  function today(){ var d = new Date(Date.now() + 9 * 3600e3); return d.toISOString().slice(0, 10); }
  function dlabel(){ var d = new Date(Date.now() + 9 * 3600e3), w = "일월화수목금토"[d.getUTCDay()]; return d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + w + ")"; }

  /* ───────── 금액 ───────── */
  function man(won){   // 원 → 「1억 2,500만원」
    if (won == null || isNaN(won)) return "–";
    var m = Math.round(won / 10000);
    if (m === 0) return Math.round(won).toLocaleString("ko-KR") + "원";
    var eok = Math.floor(m / 10000), r = m % 10000;
    return (eok ? eok + "억" + (r ? " " : "") : "") + (r ? r.toLocaleString("ko-KR") + "만" : "") + "원";
  }
  function amtOf(k){ return (+ST.amt[k] || 0) * 10000; }
  function total(){ return ST.sel.reduce(function(s, k){ return s + amtOf(k); }, 0); }
  function sgn(v, d){ if (v == null) return "–"; return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 2 : d) + "%"; }
  function pc(v){ return (Math.round(v * 10) / 10).toString().replace(/\.0$/, "") + "%"; }

  /* ───────── 그림 (SVG → 그림 주소) ───────── */
  function svgUrl(s){ return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s); }
  function donutSvg(parts, size, thick){
    var r = size / 2, R = r - 2, ri = R - thick, a0 = -Math.PI / 2, out = "", tot = parts.reduce(function(s, p){ return s + (+p.pct || 0); }, 0) || 1;
    parts.forEach(function(p){
      var f = (+p.pct || 0) / tot; if (f <= 0) return;
      var a1 = a0 + f * Math.PI * 2 - (f < 1 ? 0.012 : 0);
      if (f >= 0.999){ out += '<circle cx="' + r + '" cy="' + r + '" r="' + (R - thick / 2) + '" fill="none" stroke="' + p.color + '" stroke-width="' + thick + '"/>'; a0 = a1; return; }
      var big = a1 - a0 > Math.PI ? 1 : 0, c = Math.cos, s = Math.sin;
      out += '<path d="M' + (r + R * c(a0)) + ' ' + (r + R * s(a0)) + ' A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + (r + R * c(a1)) + ' ' + (r + R * s(a1)) +
             ' L' + (r + ri * c(a1)) + ' ' + (r + ri * s(a1)) + ' A' + ri + ' ' + ri + ' 0 ' + big + ' 0 ' + (r + ri * c(a0)) + ' ' + (r + ri * s(a0)) + ' Z" fill="' + p.color + '"/>';
      a0 = a1 + 0.012;
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + out + '</svg>';
  }
  function donut(parts, size, thick, top, bot){
    return '<div style="position:relative;width:' + size + 'px;height:' + size + 'px;flex:none"><img src="' + svgUrl(donutSvg(parts, size, thick)) + '" width="' + size + '" height="' + size + '" style="display:block">' +
      '<div style="position:absolute;left:0;top:0;width:' + size + 'px;height:' + size + 'px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
      (top ? '<div style="font-size:' + Math.round(size * 0.075) + 'px;color:' + SUB + ';font-weight:700">' + e(top) + '</div>' : '') +
      (bot ? '<div style="font-size:' + Math.round(size * 0.115) + 'px;color:' + INK + ';font-weight:800;letter-spacing:-1px;line-height:1.15">' + e(bot) + '</div>' : '') + '</div></div>';
  }
  // 선 그림: series = [{vals, color, dash}] · x 가 있으면 그 간격대로(금리 곡선)
  function lineSvg(series, w, h, x){
    var all = []; series.forEach(function(s){ s.vals.forEach(function(v){ if (v != null) all.push(+v); }); });
    if (all.length < 2) return "";
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all), pad = (mx - mn) * 0.1 || 1; mn -= pad; mx += pad;
    var X = function(i, n){ if (x){ var x0 = x[0], x1 = x[x.length - 1]; return (x[i] - x0) / ((x1 - x0) || 1) * w; } return i / Math.max(1, n - 1) * w; };
    var Y = function(v){ return h - (v - mn) / (mx - mn) * h; };
    var grid = [0.25, 0.5, 0.75].map(function(f){ return '<line x1="0" x2="' + w + '" y1="' + (h * f) + '" y2="' + (h * f) + '" stroke="#e6eaf0" stroke-width="1"/>'; }).join("");
    var body = series.map(function(s, si){
      var pts = []; s.vals.forEach(function(v, i){ if (v != null) pts.push([X(i, s.vals.length), Y(+v)]); });
      if (pts.length < 2) return "";
      var d = pts.map(function(p, i){ return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" "), lp = pts[pts.length - 1];
      return (si === 0 && !s.dash && series.length === 1 ? '<path d="' + d + ' L' + lp[0].toFixed(1) + ' ' + h + ' L' + pts[0][0].toFixed(1) + ' ' + h + ' Z" fill="' + s.color + '" fill-opacity="0.10"/>' : '') +
        '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.dash ? 2 : 2.8) + '"' + (s.dash ? ' stroke-dasharray="6 5"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>' +
        (s.dash ? '' : '<circle cx="' + lp[0] + '" cy="' + lp[1] + '" r="5" fill="' + s.color + '" stroke="#fff" stroke-width="2"/>') +
        (s.dots ? pts.map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="' + s.color + '"/>'; }).join("") : '');
    }).join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + grid + body + '</svg>';
  }
  function fmtv(v, unit){ if (v == null) return "–"; if (unit === "원" && Math.abs(v) >= 1e6) return man(v); return unit === "%" ? (+v).toFixed(2) + "%" : unit === "원" ? (+v).toLocaleString("ko-KR", {maximumFractionDigits: v < 1000 ? 1 : 0}) + "원" : (+v).toLocaleString("ko-KR", {maximumFractionDigits: v < 100 ? 2 : 0}); }
  function chartBox(ch, w, h, fs){
    if (!ch || !ch.vals || ch.vals.length < 2) return "";
    var series = ch.multi ? ch.multi.map(function(m){ return {vals: m.vals, color: m.color}; }) : [{vals: ch.vals, color: ch.color || NAVY, dots: ch.kind === "curve"}].concat(ch.ma ? [{vals: ch.ma, color: "#9aa3b2", dash: 1}] : []);
    var v = ch.vals.filter(function(x){ return x != null; }), lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), last = v[v.length - 1], first = v[0];
    var right = ch.kind === "curve" ? "짧은 쪽 " + fmtv(first, ch.unit) + " → 긴 쪽 " + fmtv(last, ch.unit)
      : ch.multi ? "" : "지금 <b style=\"color:" + INK + "\">" + fmtv(last, ch.unit) + "</b> · " + (ch.unit === "%" ? "1년 " + ((last - first) >= 0 ? "+" : "−") + Math.abs(last - first).toFixed(2) + "%p" : "1년 " + sgn((last / first - 1) * 100, 1));
    var leg = ch.multi ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:6px;font-size:' + Math.round(fs * 0.85) + 'px;color:' + INK + '">' + ch.multi.map(function(m){ var lv = m.vals[m.vals.length - 1]; return '<span><span style="display:inline-block;width:12px;height:4px;border-radius:2px;background:' + m.color + ';vertical-align:middle;margin-right:5px"></span>' + e(m.name) + ' <b>' + sgn(lv - 100, 1) + '</b></span>'; }).join("") + '</div>'
      : ch.ma ? '<div style="font-size:' + Math.round(fs * 0.85) + 'px;color:' + SUB + ';margin-top:4px"><span style="display:inline-block;width:16px;border-top:2px dashed #9aa3b2;vertical-align:middle;margin-right:5px"></span>' + e(ch.mal || "평균선") + ' — 이 선 위면 상승 추세</div>' : '';
    var xl = ch.kind === "curve" ? [ch.labels[0], ch.labels[ch.labels.length - 1]] : [(ch.labels[0] || "").slice(0, 7).replace("-", "."), (ch.labels[ch.labels.length - 1] || "").slice(0, 7).replace("-", ".")];
    return '<div style="font-size:' + fs + 'px;color:' + INK + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:6px"><b style="color:' + INK + '">' + e(ch.title) + '</b><span style="color:' + SUB + ';font-size:' + Math.round(fs * 0.9) + 'px;white-space:nowrap">' + right + '</span></div>' +
      '<img src="' + svgUrl(lineSvg(series, w, h, ch.kind === "curve" ? ch.x : null)) + '" width="' + w + '" height="' + h + '" style="display:block;width:' + w + 'px;height:' + h + 'px">' +
      '<div style="display:flex;justify-content:space-between;color:' + SUB + ';font-size:' + Math.round(fs * 0.82) + 'px;margin-top:4px"><span>' + e(xl[0]) + '</span><span>' + (ch.multi ? "" : "최고 " + fmtv(hi, ch.unit) + " · 최저 " + fmtv(lo, ch.unit)) + '</span><span>' + e(xl[1]) + '</span></div>' + leg + '</div>';
  }
  function hbars(rows, fs, max, lw){   // rows: [label, value, color, right-text, bold]
    max = max || Math.max.apply(null, rows.map(function(r){ return Math.abs(+r[1] || 0); })) || 1;
    return rows.map(function(r){
      return '<div style="display:flex;align-items:center;gap:10px;margin:' + Math.round(fs * 0.45) + 'px 0;font-size:' + fs + 'px;color:' + INK + '">' +
        '<div style="width:' + (lw || 34) + '%;flex:none;color:' + INK + ';font-weight:' + (r[4] ? 800 : 600) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(r[0]) + '</div>' +
        '<div style="flex:1;height:' + Math.round(fs * 1.05) + 'px;background:#eef1f6;border-radius:99px;overflow:hidden"><div style="height:100%;width:' + Math.max(2, Math.min(100, Math.abs(+r[1] || 0) / max * 100)) + '%;background:' + (r[2] || NAVY) + ';border-radius:99px"></div></div>' +
        '<div style="width:24%;flex:none;text-align:right;font-weight:800;color:' + INK + '">' + e(r[3] != null ? r[3] : r[1]) + '</div></div>';
    }).join("");
  }
  // 위아래 막대 (계산서 시나리오 · 연도별) — 플러스 초록, 마이너스 빨강
  function pnBars(items, w, h, fs){   // items: [{l, v, t, hl}]
    if (!items.length) return "";
    var mx = Math.max.apply(null, items.map(function(x){ return Math.abs(x.v); })) || 1, n = items.length, bw = Math.min(90, w / n - 10), mid = h / 2;
    var anyNeg = items.some(function(x){ return x.v < 0; }), base = anyNeg ? mid : h - fs * 1.2;
    var cols = items.map(function(x){
      var bh = Math.max(2, Math.abs(x.v) / mx * (anyNeg ? mid - fs * 1.6 : h - fs * 2.6)), pos = x.v >= 0, col = x.hl ? NAVY : pos ? "#22a06b" : "#e0533d";
      return '<div style="position:relative;width:' + bw + 'px;height:' + h + 'px">' +
        '<div style="position:absolute;left:0;width:' + bw + 'px;' + (pos ? 'bottom:' + (h - base) + 'px' : 'top:' + base + 'px') + ';height:' + bh + 'px;background:' + col + ';border-radius:' + (pos ? '5px 5px 0 0' : '0 0 5px 5px') + '"></div>' +
        '<div style="position:absolute;left:-20px;width:' + (bw + 40) + 'px;text-align:center;font-size:' + Math.round(fs * 0.85) + 'px;font-weight:800;color:' + col + ';' + (pos ? 'bottom:' + (h - base + bh + 3) + 'px' : 'top:' + (base + bh + 3) + 'px') + '">' + e(x.t) + '</div></div>';
    }).join("");
    return '<div style="position:relative"><div style="display:flex;justify-content:space-around;align-items:flex-start;height:' + h + 'px;position:relative">' +
      '<div style="position:absolute;left:0;right:0;top:' + base + 'px;border-top:1px solid #c7ced9"></div>' + cols + '</div>' +
      '<div style="display:flex;justify-content:space-around;font-size:' + Math.round(fs * 0.8) + 'px;color:' + SUB + ';margin-top:4px">' + items.map(function(x){ return '<div style="width:' + (bw + 16) + 'px;text-align:center;line-height:1.3">' + e(x.l) + '</div>'; }).join("") + '</div></div>';
  }

  /* ───────── 계산 ───────── */
  function lines(f, amt){ return (f.alloc || []).map(function(a){ return {a: a, won: amt * (+a.pct || 0) / 100}; }); }
  function taxLine(f){
    if (!f.tax) return null;
    var L = f.tax.limit * 10000;
    return f.tax.rates.map(function(r){ return {rate: r[0], who: r[1], won: L * r[0] / 100, full: Math.round(L * r[0] / 100).toLocaleString("ko-KR") + "원"}; });
  }
  var CUR = {KRW: "원", USD: "달러", BRL: "헤알"};
  function fxOf(p, S){ return p.cur === "KRW" ? 1 : (p.fx || S.fx || 1); }
  // 채권: 만기까지 들고 가면
  function bondCalc(S, amt){
    var rows = (S.picks || []).map(function(p){
      var a = amt * p.pct / 100, fx = fxOf(p, S), ac = a / fx, face = ac / p.p, cpnAll, tax, total;
      if (p.comp5){ var g = Math.pow(1 + p.cpn / 100, 5); cpnAll = face * (g - 1); }
      else cpnAll = face * p.cpn / 100 * p.yrs;
      tax = cpnAll * (p.tax_int || 0) / 100; total = face + cpnAll - tax;
      var krw = total * fx, cagr = Math.pow(krw / a, 1 / p.yrs) - 1;
      var perYear = p.comp5 ? 0 : face * p.cpn / 100 * (1 - (p.tax_int || 0) / 100) * fx;
      var be = p.cur === "KRW" ? null : (a / (total * fx) - 1) * 100;
      return {p: p, a: a, fx: fx, face: face, cpnAll: cpnAll, tax: tax, gain: face - ac, total: total, krw: krw, cagr: cagr * 100, perYear: perYear, be: be};
    });
    var tot = rows.reduce(function(s, r){ return s + r.krw; }, 0);
    var yrs = rows.length ? rows.reduce(function(s, r){ return s + r.p.yrs * r.a; }, 0) / (amt || 1) : 0;
    var fxScen = (S.fx_moves || []).map(function(m){ var k = rows.reduce(function(s, r){ return s + (r.p.cur === "KRW" ? r.krw : r.krw * (1 + m / 100)); }, 0); return {m: m, krw: k, pnl: k - amt, pct: (k / amt - 1) * 100}; });
    var rateScen = (S.rate_moves || []).map(function(d){ var v = rows.reduce(function(s, r){ var inc = r.p.comp5 ? 0 : r.face * r.p.cpn / 100 * (1 - (r.p.tax_int || 0) / 100) / (r.a / r.fx); var pc = -r.p.dur * d / 100 + (r.p.y || 0) / 100 * 0 + inc; return s + r.a * pc; }, 0); return {d: d, pnl: v, pct: v / (amt || 1) * 100}; });
    var years = [], maxY = Math.ceil(Math.max.apply(null, rows.map(function(r){ return r.p.yrs; }).concat([0])));
    for (var y = 1; y <= Math.min(maxY, 30); y++){ var c = rows.reduce(function(s, r){ return s + (y <= Math.ceil(r.p.yrs) ? r.perYear : 0); }, 0); years.push({y: y, v: c}); }
    return {rows: rows, tot: tot, pnl: tot - amt, cagr: amt ? (Math.pow(tot / amt, 1 / (yrs || 1)) - 1) * 100 : 0, yrs: yrs, fxScen: fxScen, rateScen: rateScen, years: years,
            be: (function(){ var kr = 0, fx = 0; rows.forEach(function(r){ if (r.p.cur === "KRW") kr += r.krw; else fx += r.krw; }); return fx ? ((amt - kr) / fx - 1) * 100 : null; })()};
  }
  function elsCalc(S, amt){
    return (S.picks || []).map(function(p){
      var a = amt * p.pct / 100, h = p.hist || {}, k = h.k || [], prev = 0, out = [];
      (p.steps.length ? p.steps : [0, 0, 0, 0, 0, 0]).forEach(function(b, i){
        var cum = k[i] != null ? k[i] : null, pr = cum != null ? Math.max(0, cum - prev) : null; if (cum != null) prev = cum;
        out.push({t: (i + 1) * (p.cyc || 6), bar: b, won: a * (1 + p.cpn / 100 * (i + 1) * (p.cyc || 6) / 12), pr: pr});
      });
      var rest = Math.max(0, 100 - prev), loss = h.loss || 0;
      var tail = p.pp ? [{lab: "원금만 돌려받음 (이자 없음)", won: a, pr: rest}] : [{lab: "만기 손실 (낙인 후 회복 못 함)", won: a * (1 + (h.loss_avg || -40) / 100), pr: loss, worst: h.loss_worst}].concat(rest - loss > 0.05 ? [{lab: "그 밖 (만기 원금 상환 등)", won: a, pr: rest - loss}] : []);
      var ev = out.reduce(function(s, o){ return s + (o.pr || 0) / 100 * o.won; }, 0) + tail.reduce(function(s, o){ return s + (o.pr || 0) / 100 * o.won; }, 0);
      return {p: p, a: a, steps: out, tail: tail, ev: ev, y1: (k[1] != null ? k[1] : null)};
    });
  }
  function eqCalc(S, amt){
    var b = S.bt, g = function(r, y){ return amt * Math.pow(1 + r / 100, y); };
    return {b: b, y1: [{l: "나쁜 해 (하위 10%)", r: b.y1.p10}, {l: "보통 해 (중간)", r: b.y1.p50}, {l: "좋은 해 (상위 10%)", r: b.y1.p90}].map(function(x){ return {l: x.l, r: x.r, won: g(x.r, 1)}; }),
            y5: b.y5 ? [{l: "나쁜 5년", r: b.y5.p10}, {l: "보통 5년", r: b.y5.p50}, {l: "좋은 5년", r: b.y5.p90}].map(function(x){ return {l: x.l, r: x.r, won: g(x.r, 5)}; }) : null,
            mdd: amt * b.mdd / 100};
  }
  function contrib(S, f){
    if (!S || !S.contrib) return null;
    var c = S.contrib * 10000, r = (S.bt.cagr || 6) / 100, r2 = ((S.bt.y5 && S.bt.y5.p10) || 2) / 100;
    var fv = function(rate, y){ var v = 0; for (var i = 0; i < y; i++) v = (v + c) * (1 + rate); return v; };
    return [10, 20].map(function(y){ return {y: y, put: c * y, mid: fv(r, y), low: fv(r2, y), tax165: c * y * 0.165, tax132: c * y * 0.132}; });
  }
  // 한 줄 요약 (한 장·요약 쪽)
  function simLine(f, amt){
    var S = f.sim; if (!S || !amt) return null;
    if (S.kind === "bond"){ var B = bondCalc(S, amt);
      return {big: man(B.tot), lab: "만기까지 들고 가면 받는 돈" + (S.cur === "KRW" ? " (세후)" : " (환율 그대로)"), sub: "이익 " + man(B.pnl) + " · 연 " + B.cagr.toFixed(1) + "% · 평균 " + B.yrs.toFixed(1) + "년" + (B.be != null ? " · 환율이 " + Math.abs(B.be).toFixed(0) + "% 넘게 안 빠지면 이익" : "")}; }
    if (S.kind === "els"){ var E = elsCalc(S, amt), ev = E.reduce(function(s, x){ return s + x.ev; }, 0), y1 = E.reduce(function(s, x){ return s + (x.y1 || 0) * x.a; }, 0) / amt;
      return {big: man(ev - amt), lab: "과거 확률로 본 평균 이익 (가입 금액 대비)", sub: "1년 안에 끝난 비율 약 " + Math.round(y1) + "% · 손실 비율 " + E.filter(function(x){ return !x.p.pp; }).map(function(x){ return ((x.p.hist || {}).loss || 0) + "%"; }).join("·")}; }
    if (S.kind === "equity"){ var Q = eqCalc(S, amt);
      return {big: "연 " + S.bt.cagr + "%", lab: S.bt.from.slice(0, 4) + "년부터 이 비중이었다면 (연평균)", sub: "1년 뒤 보통 " + man(Q.y1[1].won) + " · 나쁜 해 " + man(Q.y1[0].won) + " · 최대 하락 " + S.bt.mdd + "%"}; }
    return null;
  }
  function model(){
    var items = ST.sel.map(function(k){ var f = form(k); return f ? {f: f, amt: amtOf(k)} : null; }).filter(Boolean);
    return {cust: (ST.cust || "").trim(), pb: (ME.pb || "").trim(), org: (ME.org || "").trim(), date: dlabel(), items: items,
            total: items.reduce(function(s, x){ return s + x.amt; }, 0), notice: DATA.notice || [], basis: DATA.basis || ""};
  }
  function titleOf(m){ return m.items.length === 1 ? m.items[0].f.title : m.items.map(function(x){ return x.f.short; }).slice(0, 3).join(" · ") + (m.items.length > 3 ? " 외 " + (m.items.length - 3) : "") + " 포트폴리오"; }
  function custName(m){ return m.cust ? m.cust + " 고객님" : "고객님"; }
  function byLine(m){ return [m.org, m.pb ? m.pb + (/PB|팀장|부장|이사|대리|과장|차장|매니저|상무|센터장|지점장|실장/.test(m.pb) ? "" : " PB") : ""].filter(Boolean).join(" · "); }

  /* ───────── 공통 조각 ───────── */
  // 10/28 아이폰 다크 모드에서 글자가 흐리게(거의 안 보이게) 나오던 것 → 맨 바깥 대신 안쪽 상자에 글자색을 박아 둠
  function wrapInk(html, bg){ return '<div style="color:' + INK + ';background:' + (bg || "transparent") + '">' + html + '</div>'; }
  function kpiTiles(kp, fs, cols){
    kp = (kp || []).filter(function(x){ return x && x.value && x.value !== "–"; });
    return '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:' + Math.round(fs * 0.55) + 'px">' + kp.map(function(x){
      var c = x.tone > 0 ? "#1a8a5a" : x.tone < 0 ? UP : INK;
      return '<div style="background:#fff;border:1px solid ' + LINE + ';border-radius:' + Math.round(fs * 0.6) + 'px;padding:' + Math.round(fs * 0.6) + 'px ' + Math.round(fs * 0.7) + 'px;color:' + INK + '">' +
        '<div style="font-size:' + Math.round(fs * 0.78) + 'px;color:' + SUB + ';font-weight:700">' + e(x.label) + '</div>' +
        '<div style="font-size:' + Math.round(fs * 1.4) + 'px;font-weight:800;color:' + c + ';letter-spacing:-0.5px;margin:2px 0">' + e(x.value) + '</div>' +
        '<div style="font-size:' + Math.round(fs * 0.74) + 'px;color:' + SUB + ';line-height:1.35">' + e(x.sub || "") + '</div></div>';
    }).join("") + '</div>';
  }
  function legend(ls, fs, showWon){
    return ls.map(function(l){ var a = l.a;
      return '<div style="display:flex;align-items:center;gap:' + Math.round(fs * 0.5) + 'px;padding:' + Math.round(fs * 0.45) + 'px 0;border-bottom:1px solid ' + LINE + ';font-size:' + fs + 'px;color:' + INK + '">' +
        '<span style="flex:none;width:' + Math.round(fs * 0.75) + 'px;height:' + Math.round(fs * 0.75) + 'px;border-radius:3px;background:' + a.color + '"></span>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:800;color:' + INK + '">' + e(a.name) + '</div><div style="font-size:' + Math.round(fs * 0.8) + 'px;color:' + SUB + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(a.inst || "") + (a.code && String(a.code).length < 12 ? " (" + e(a.code) + ")" : "") + '</div></div>' +
        '<div style="text-align:right;flex:none"><div style="font-weight:800;color:' + INK + '">' + pc(a.pct) + '</div>' + (showWon ? '<div style="font-size:' + Math.round(fs * 0.82) + 'px;color:' + NAVY + ';font-weight:700">' + man(l.won) + '</div>' : '') + '</div></div>';
    }).join("");
  }
  function tbl(t, fs, opt){
    if (!t || !t.rows || !t.rows.length) return "";
    opt = opt || {};
    return (t.title ? '<div style="font-size:' + (fs + 2) + 'px;font-weight:800;margin:4px 0 8px;color:' + INK + '">' + e(t.title) + '</div>' : '') + '<table style="width:100%;border-collapse:collapse;font-size:' + fs + 'px;color:' + INK + '">' +
      '<tr>' + t.cols.map(function(c, i){ return '<th style="text-align:' + (i && opt.right ? "right" : "left") + ';background:' + NAVY + ';color:#fff;padding:7px 8px;font-weight:700">' + e(c) + '</th>'; }).join("") + '</tr>' +
      t.rows.map(function(r, i){ var hl = opt.hl && opt.hl(r, i); return '<tr style="background:' + (hl ? "#fff6e8" : i % 2 ? "#f7f9fc" : "#fff") + '">' + r.map(function(c, j){ return '<td style="padding:' + (opt.pad || "6px 8px") + ';border-bottom:1px solid ' + LINE + ';vertical-align:top;color:' + INK + ';text-align:' + (j && opt.right ? "right" : "left") + (hl || (opt.bold && opt.bold(j)) ? ';font-weight:800' : '') + '">' + (opt.raw ? c : e(c)) + '</td>'; }).join("") + '</tr>'; }).join("") + '</table>' +
      (t.src ? '<div style="font-size:' + (fs - 1) + 'px;color:' + SUB + ';margin-top:4px">자료: ' + e(t.src) + '</div>' : '');
  }
  function box(inner, extra){ return '<div style="background:' + BG + ';border-radius:14px;padding:16px 18px;color:' + INK + ';' + (extra || "") + '">' + inner + '</div>'; }
  function bullets(arr, fs, color){ return (arr || []).map(function(p){ return '<div style="display:flex;gap:10px;font-size:' + fs + 'px;line-height:1.6;margin-top:7px;color:' + INK + '"><span style="flex:none;color:' + (color || NAVY) + ';font-weight:900">▸</span><span>' + e(p) + '</span></div>'; }).join(""); }

  /* ═════════ ① 원페이지 (전송용 그림 1080px) ═════════ */
  function onePage(m){
    var W = 1080, multi = m.items.length > 1;
    var h = '<div class="ppx" style="width:' + W + 'px;background:' + BG + ';font-family:' + FONT + '">' + '<div style="color:' + INK + ';padding-bottom:28px">';
    h += '<div style="background:linear-gradient(135deg,' + NAVY + ' 0%,#24508a 100%);padding:52px 56px 46px;position:relative;overflow:hidden"><div style="color:#fff;position:relative">' +
      '<div style="position:absolute;right:-150px;top:-140px;width:360px;height:360px;border-radius:50%;background:rgba(255,255,255,.06)"></div>' +
      '<div style="font-size:24px;opacity:.85;font-weight:700;letter-spacing:1px;color:#fff">INVESTMENT PROPOSAL · ' + e(m.date) + '</div>' +
      '<div style="font-size:52px;font-weight:800;letter-spacing:-1.5px;margin-top:14px;line-height:1.2;color:#fff">' + e(custName(m)) + '을 위한<br>' + e(titleOf(m)) + '</div>' +
      (m.total ? '<div style="display:inline-block;margin-top:22px;background:rgba(255,255,255,.14);border-radius:16px;padding:12px 22px;font-size:28px;color:#fff">제안 금액 <b style="font-size:36px">' + man(m.total) + '</b></div>' : '') + '</div></div>';
    if (multi){
      var parts = m.items.map(function(x){ return {pct: m.total ? x.amt / m.total * 100 : 100 / m.items.length, color: x.f.color}; });
      h += '<div style="padding:30px 44px 0"><div style="font-size:31px;font-weight:800;margin-bottom:14px;color:' + INK + '">🧺 전체 나눠 담기</div><div style="background:#fff;border:1px solid ' + LINE + ';border-radius:22px;padding:24px;display:flex;gap:26px;align-items:center">' +
        donut(parts, 250, 50, "합계", m.total ? man(m.total) : m.items.length + "개") + '<div style="flex:1">' +
        m.items.map(function(x){ return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid ' + LINE + ';font-size:26px;color:' + INK + '"><span style="width:20px;height:20px;border-radius:4px;background:' + x.f.color + '"></span><b style="flex:1">' + e(x.f.icon + " " + x.f.short) + '</b><span style="font-weight:800">' + (m.total ? pc(x.amt / m.total * 100) : "") + '</span><span style="width:170px;text-align:right;color:' + NAVY + ';font-weight:800">' + man(x.amt) + '</span></div>'; }).join("") + '</div></div></div>';
    }
    m.items.forEach(function(x){
      var f = x.f, ls = lines(f, x.amt), mk = f.mkt || {}, sl = simLine(f, x.amt), ch = (mk.charts || [])[0];
      h += '<div style="padding:30px 44px 0"><div style="background:#fff;border:1px solid ' + LINE + ';border-radius:22px;overflow:hidden">' +
        '<div style="background:' + f.color + ';padding:20px 26px"><div style="display:flex;align-items:center;gap:14px;color:#fff"><span style="font-size:40px">' + e(f.icon) + '</span><div style="flex:1"><div style="font-size:31px;font-weight:800;color:#fff">' + e(f.title) + '</div><div style="font-size:21px;color:#fff;opacity:.92">' + e(f.sub) + '</div></div>' + (x.amt ? '<div style="font-size:30px;font-weight:800;color:#fff">' + man(x.amt) + '</div>' : '') + '</div></div>' +
        '<div style="padding:20px 26px 0"><div style="font-size:24px;font-weight:800;color:' + SUB + ';margin-bottom:10px">📊 ' + e(mk.title || "시장 지금") + '</div>' + kpiTiles((mk.kpis || []).filter(function(k){ return k.value && k.value !== "–"; }).slice(0, multi ? 3 : 4), 22, multi ? 3 : 4) + '</div>' +
        (ch && !multi ? '<div style="padding:18px 26px 0">' + chartBox(ch, 980, 220, 21) + '</div>' : '') +
        '<div style="padding:22px 26px 6px;font-size:27px;font-weight:800;line-height:1.45;color:' + NAVY + '">' + e(f.headline) + '</div>' +
        '<div style="display:flex;gap:26px;align-items:center;padding:6px 26px 14px">' + donut(f.alloc, multi ? 220 : 270, multi ? 44 : 54, x.amt ? "제안 금액" : "비중", x.amt ? man(x.amt) : "100%") +
        '<div style="flex:1;min-width:0">' + legend(ls, multi ? 22 : 24, !!x.amt) + '</div></div>' +
        (sl ? '<div style="margin:0 26px 16px;background:#eef4ff;border-radius:16px;padding:16px 20px;color:' + INK + '"><div style="font-size:21px;color:' + SUB + ';font-weight:700">🧮 모의 계산 · ' + e(sl.lab) + '</div><div style="font-size:38px;font-weight:800;color:' + NAVY + ';margin:2px 0">' + e(sl.big) + '</div><div style="font-size:21px;color:' + INK + '">' + e(sl.sub) + '</div></div>' : '') +
        (f.tax ? '<div style="margin:0 26px 16px;background:#effaf4;border-radius:14px;padding:12px 18px;font-size:23px;color:' + INK + '">🧾 연 ' + f.tax.limit + '만원 넣으면 세액공제 <b>' + taxLine(f).map(function(t){ return t.full + "(" + t.rate + "%)"; }).join(" / ") + '</b></div>' : '') +
        '<div style="padding:0 26px 22px">' + bullets((mk.view || f.points || []).slice(0, multi ? 2 : 3), multi ? 21 : 23, f.color) + '</div></div></div>';
    });
    h += '<div style="margin:30px 44px 0;padding:22px 26px;border-radius:18px;background:' + NAVY + '"><div style="display:flex;align-items:center;gap:18px;color:#fff"><div style="font-size:44px">🤝</div><div style="flex:1"><div style="font-size:21px;opacity:.8;color:#fff">제안</div><div style="font-size:30px;font-weight:800;color:#fff">' + e(byLine(m) || "담당 PB") + '</div></div><div style="font-size:21px;opacity:.8;text-align:right;color:#fff">' + e(m.date) + '</div></div></div>';
    h += '<div style="padding:18px 48px 0;font-size:17px;line-height:1.55;color:#6b7484">' + m.notice.slice(0, 2).map(e).join(" · ") + '</div></div></div>';
    return h;
  }

  /* ═════════ ② 풀버전 PDF (A4 794×1123 쪽마다) ═════════ */
  var PW = 794, PH = 1123, CW = PW - 96;
  function page(inner, n, of, m, color){
    return '<div class="ppx" style="width:' + PW + 'px;height:' + PH + 'px;background:#fff;font-family:' + FONT + ';position:relative;overflow:hidden"><div style="color:' + INK + ';width:' + PW + 'px;height:' + PH + 'px;position:relative">' +
      '<div style="height:8px;background:' + (color || NAVY) + '"></div>' +
      '<div style="padding:30px 48px 0;color:' + INK + '">' + inner + '</div>' +
      '<div style="position:absolute;left:48px;right:48px;bottom:24px;display:flex;justify-content:space-between;font-size:11px;color:#8a93a3;border-top:1px solid ' + LINE + ';padding-top:9px"><span>' + e(custName(m)) + ' 투자 제안 · ' + e(m.date) + '</span><span>' + e(byLine(m)) + '</span><span>' + n + ' / ' + of + '</span></div></div></div>';
  }
  function hTitle(t, sub, color){ return '<div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:16px"><div style="font-size:25px;font-weight:800;letter-spacing:-0.8px;color:' + (color || NAVY) + '">' + t + '</div>' + (sub ? '<div style="font-size:13.5px;color:' + SUB + ';padding-bottom:4px">' + e(sub) + '</div>' : '') + '</div>'; }
  function secT(t){ return '<div style="font-size:17px;font-weight:800;margin:16px 0 8px;color:' + INK + '">' + t + '</div>'; }

  // 10/28 사용자 「레이아웃에 좀 더 신경쓰자 여백이 너무 많아」 — 쪽을 미리 나누지 않고 덩어리(블록)를 재서 A4에 빈틈없이 채움
  function gap(n){ return '<div style="height:' + (n || 12) + 'px"></div>'; }
  function stat3(cells){ return '<div style="display:flex;gap:10px">' + cells.map(function(c){ return box('<div style="font-size:12.5px;color:' + SUB + ';font-weight:700">' + c[0] + '</div><div style="font-size:24px;font-weight:800;color:' + (c[2] || INK) + ';letter-spacing:-0.5px">' + c[1] + '</div>' + (c[3] ? '<div style="font-size:12.5px;color:' + INK + '">' + c[3] + '</div>' : ''), "flex:1;padding:12px 14px;background:" + (c[4] || BG)); }).join("") + '</div>'; }
  function propBlocks(f, x){
    var ls = lines(f, x.amt), sl = simLine(f, x.amt), B = [];
    B.push('<!--K--><div style="display:flex;align-items:center;gap:14px;margin-bottom:12px"><div style="font-size:40px">' + e(f.icon) + '</div><div><div style="font-size:26px;font-weight:800;letter-spacing:-0.8px;color:' + f.color + '">' + e(f.title) + '</div><div style="font-size:14px;color:' + SUB + '">' + e(f.sub) + '</div></div>' + (x.amt ? '<div style="margin-left:auto;text-align:right"><div style="font-size:12px;color:' + SUB + '">제안 금액</div><div style="font-size:24px;font-weight:800;color:' + NAVY + '">' + man(x.amt) + '</div></div>' : '') + '</div>' +
      '<div style="background:' + f.color + ';border-radius:14px;padding:14px 20px"><div style="color:#fff;font-size:17px;font-weight:800;line-height:1.5">' + e(f.headline) + '</div></div>');
    B.push('<div style="display:flex;gap:22px;align-items:center">' + donut(f.alloc, 210, 42, x.amt ? "제안 금액" : "비중", x.amt ? man(x.amt) : "100%") + '<div style="flex:1;min-width:0">' + legend(ls, 15, !!x.amt) + '</div></div>');
    var why = secT("🤔 왜 이렇게 담나") + (f.points || []).map(function(p, i){ return '<div style="display:flex;gap:10px;font-size:14px;line-height:1.55;padding:5px 0;border-bottom:1px solid ' + LINE + ';color:' + INK + '"><span style="flex:none;width:21px;height:21px;border-radius:50%;background:' + f.color + ';color:#fff;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center">' + (i + 1) + '</span><span>' + e(p) + '</span></div>'; }).join("");
    var side = (sl ? box('<div style="font-size:12.5px;color:' + SUB + ';font-weight:700">🧮 모의 계산 · ' + e(sl.lab) + '</div><div style="font-size:23px;font-weight:800;color:' + NAVY + '">' + e(sl.big) + '</div><div style="font-size:13px;line-height:1.45">' + e(sl.sub) + '</div>', "background:#eef4ff;margin-bottom:10px") : '') +
      box('<div style="font-size:12.5px;color:' + SUB + ';font-weight:700">🙋 이런 분께</div><div style="font-size:13.5px;margin-top:3px;line-height:1.5">' + e(f.fit) + '</div><div style="margin-top:8px">' + (f.tags || []).map(function(t){ return '<span style="display:inline-block;background:#fff;border:1px solid ' + LINE + ';border-radius:99px;padding:2px 9px;font-size:12px;margin:0 5px 5px 0;color:' + INK + '">' + e(t) + '</span>'; }).join("") + '</div>');
    B.push('<div style="display:flex;gap:16px;align-items:flex-start"><div style="flex:1.35;min-width:0">' + why + '</div><div style="flex:1;min-width:0;padding-top:12px">' + side + '</div></div>');
    return B;
  }
  function mktBlocks(f){
    var mk = f.mkt || {}, ch = mk.charts || [], nk = (mk.kpis || []).filter(function(k){ return k.value && k.value !== "–"; }).length, B = [];
    B.push('<!--K-->' + hTitle("📊 " + e(mk.title || "시장 지금"), f.short + " 판단 근거", f.color) + kpiTiles(mk.kpis || [], 15, nk > 4 ? 3 : Math.max(1, nk)));
    if (ch[0] && ch[1]) B.push('<div style="display:flex;gap:10px">' + box(chartBox(ch[0], (CW - 46) / 2, 150, 12.5), "flex:1;padding:12px 13px") + box(chartBox(ch[1], (CW - 46) / 2, 150, 12.5), "flex:1;padding:12px 13px") + '</div>');
    else if (ch[0]) B.push(box(chartBox(ch[0], CW - 36, 190, 14)));
    B.push(secT("🔎 그래서 지금은") + bullets(mk.view, 14, f.color));
    var o = mk.outlook;
    if (o){   // 긴 표는 8줄씩 끊어서 쪽 빈칸을 채움
      var rs = o.rows.slice(0, 24), fs2 = rs.length > 14 ? 11 : 12.5, op = {right: true, pad: rs.length > 14 ? "4px 8px" : "6px 8px"};
      for (var i = 0; i < rs.length; i += 8) B.push((i ? "" : '<!--K-->' + secT("🔭 " + e(o.title))) + tbl({cols: o.cols, rows: rs.slice(i, i + 8), src: i + 8 >= rs.length ? o.src : ""}, fs2, op));
    }
    if (ch[2] && mk.curve) B.push('<div style="display:flex;gap:10px">' + box(chartBox(ch[2], (CW - 46) / 2, 140, 12.5), "flex:1;padding:12px 13px") + box('<div style="font-size:13px;font-weight:800;margin-bottom:4px">' + e(mk.curve.title) + '</div>' + hbars(mk.curve.rows.map(function(r){ return [r[0] + "년", r[1], f.color, r[1].toFixed(2) + "%"]; }), 12, null, 22), "flex:1;padding:12px 13px") + '</div>');
    else if (ch[2]) B.push(box(chartBox(ch[2], CW - 36, 150, 13)));
    else if (mk.curve) B.push(box('<div style="font-size:14px;font-weight:800;margin-bottom:6px">' + e(mk.curve.title) + '</div>' + hbars(mk.curve.rows.map(function(r){ return [r[0] + "년 만기", r[1], f.color, r[1].toFixed(2) + "%"]; }), 13, null, 20)));
    return B;
  }
  function simBlocks(f, amt){
    var S = f.sim; if (!S) return [];
    var A = amt || 100000000, demo = !amt, head = hTitle("🧮 모의투자 계산서", (demo ? "1억원 넣었다고 치면" : man(A) + " 넣으면") + " · " + f.short, f.color), B = [];
    var note = '<div style="font-size:11.5px;color:' + SUB + ';line-height:1.5">※ ' + e(S.note) + '</div>';
    if (S.kind === "bond"){
      var BB = bondCalc(S, A);
      var r1 = BB.rows.map(function(r){ var cu = r.p.cur, u = CUR[cu]; var fm = function(v){ return cu === "KRW" ? man(v) : (Math.round(v)).toLocaleString("ko-KR") + " " + u; };
        return [r.p.slot + "<br><span style='color:" + SUB + ";font-weight:500;font-size:11px'>" + e(r.p.name) + "</span>", man(r.a), fm(r.face) + "<br><span style='color:" + SUB + ";font-size:11px'>(액면)</span>", fm(r.cpnAll - r.tax) + (r.tax ? "<br><span style='color:" + SUB + ";font-size:11px'>세금 " + fm(r.tax) + " 뺌</span>" : "<br><span style='color:#1a8a5a;font-size:11px'>비과세</span>"),
          fm(r.total), "<b>" + man(r.krw) + "</b>", r.p.yrs.toFixed(1) + "년", r.cagr.toFixed(2) + "%"]; });
      B.push('<!--K-->' + head + stat3([["넣는 돈", man(A)], ["만기까지 받는 돈 " + (S.cur === "KRW" ? "(세후)" : "(환율 그대로)"), man(BB.tot), NAVY, "", "#eef4ff"], ["이익 · 연 환산", "+" + man(BB.pnl), "#1a8a5a", "연 " + BB.cagr.toFixed(2) + "% · 평균 " + BB.yrs.toFixed(1) + "년", "#effaf4"]]));
      B.push(tbl({title: "① 만기까지 들고 가면", cols: ["칸", "넣는 돈", "사게 되는 양", "받는 이자", "만기 총액", "원화로", "기간", "연 환산"], rows: r1}, 11.5, {raw: true, right: true}));
      var half = (CW - 16) / 2;
      var fx = BB.fxScen.length ? '<div style="font-size:15px;font-weight:800;margin-bottom:6px">② 환율이 바뀌면 (만기 때 ' + (S.cur === "MIX" ? "헤알·달러" : "달러") + ' 값이 지금보다)</div>' +
        pnBars(BB.fxScen.map(function(s){ return {l: (s.m > 0 ? "+" : s.m < 0 ? "−" : "") + Math.abs(s.m) + "%" + (s.m === 0 ? " 그대로" : ""), v: s.pnl, t: (s.pnl >= 0 ? "+" : "−") + man(Math.abs(s.pnl)), hl: s.m === 0}; }), BB.rateScen.length ? half : CW, 120, 11.5) +
        (BB.be != null ? '<div style="font-size:12.5px;margin-top:6px;color:' + INK + ';line-height:1.45">👉 환율이 만기까지 <b>' + Math.abs(BB.be).toFixed(1) + '%</b> 넘게 떨어지지만 않으면 원화로도 이익임 (연 약 ' + Math.abs((Math.pow(1 + BB.be / 100, 1 / (BB.yrs || 1)) - 1) * 100).toFixed(1) + '%까지 견딤)</div>' : '') : '';
      var rt = BB.rateScen.length ? '<div style="font-size:15px;font-weight:800;margin-bottom:6px">' + (BB.fxScen.length ? "③" : "②") + ' 1년 뒤 팔면 — 금리가 바뀔 때</div>' +
        pnBars(BB.rateScen.map(function(s){ return {l: (s.d > 0 ? "+" : s.d < 0 ? "−" : "") + Math.abs(s.d) + "%p" + (s.d === 0 ? " 그대로" : ""), v: s.pnl, t: (s.pnl >= 0 ? "+" : "−") + man(Math.abs(s.pnl)), hl: s.d === 0}; }), BB.fxScen.length ? half : CW, 120, 11.5) +
        '<div style="font-size:12px;color:' + SUB + ';margin-top:6px;line-height:1.45">1년치 이자 포함 · 금리가 내리면 값이 올라 이익이 커짐 · 만기까지 들고 가면 이 변동은 사라짐' + (S.cur !== "KRW" ? " · 환율 변화는 빼고 계산" : "") + '</div>' : '';
      if (fx && rt) B.push('<div style="display:flex;gap:16px">' + box(fx, "flex:1;padding:12px 13px") + box(rt, "flex:1;padding:12px 13px") + '</div>');
      else if (fx || rt) B.push(box(fx || rt));
      if (BB.years.filter(function(y){ return y.v > 0; }).length > 1) B.push(secT("📅 해마다 받는 이자 (지금 환율·세후)") + pnBars(BB.years.slice(0, 15).map(function(y){ return {l: y.y + "년", v: y.v, t: man(y.v).replace("만원", "만")}; }), CW, 80, 10.5));
      B.push(note);
      return B;
    }
    if (S.kind === "els"){
      var E = elsCalc(S, A);
      B.push('<!--K-->' + head + stat3([["넣는 돈", man(A)], ["과거 확률로 본 기대 회수액", man(E.reduce(function(s, q){ return s + q.ev; }, 0)), NAVY, "", "#eef4ff"], ["6개월에 바로 끝날 확률", Math.round(E.reduce(function(s, q){ return s + (((q.p.hist || {}).k || [])[0] || 0) * q.a; }, 0) / A) + "%", "#1a8a5a", "조건: 처음 값의 85% 이상", "#effaf4"]]));
      E.forEach(function(x, xi){ var p = x.p, h = p.hist;
        var rows = x.steps.map(function(s){ return [s.t + "개월", s.bar ? "처음 값의 " + s.bar + "% 이상" : "–", man(s.won), "+" + man(s.won - x.a), s.pr != null ? s.pr.toFixed(1) + "%" : "–"]; })
          .concat(x.tail.map(function(t){ return [t.lab, "", man(t.won), (t.won - x.a >= 0 ? "+" : "−") + man(Math.abs(t.won - x.a)), t.pr != null ? t.pr.toFixed(1) + "%" : "–"]; }));
        B.push('<div style="display:flex;justify-content:space-between;align-items:baseline;font-size:14.5px;font-weight:800;margin:2px 0 6px"><span style="color:' + (["#3fb28f", "#2f6fdf", "#7b5cff"][xi] || NAVY) + '">' + e(p.slot) + ' · ' + e(p.name) + '</span><span style="font-size:12.5px;color:' + SUB + '">' + e(p.ua) + ' · 연 ' + p.cpn + '%' + (p.ki ? ' · KI ' + p.ki + '%' : ' · 원금지급') + ' · ' + man(x.a) + '</span></div>' +
          tbl({cols: ["끝나는 때", "조건", "받는 돈", "이익", "과거 확률"], rows: rows}, 11, {right: true, pad: "4px 8px", hl: function(r, i){ return i === 0; }}) +
          '<div style="font-size:12px;color:' + SUB + ';margin-top:4px">' + (h ? "과거 " + h.from + "~" + h.to + " 매일 가입했다면 " + (h.n || 0).toLocaleString("ko-KR") + "번 중 · 평균 기대 회수액 <b style='color:" + NAVY + "'>" + man(x.ev) + "</b>" + (h.loss ? " · 손실 날 땐 평균 " + h.loss_avg + "% (최악 " + h.loss_worst + "%)" : "") : "과거 확률 자료 없음") + '</div>');
      });
      B.push(note);
      return B;
    }
    if (S.kind === "equity"){
      var Q = eqCalc(S, A), b = S.bt, cb = contrib(S, f), gv = b.growth.vals.map(function(v){ return v * A; });
      B.push('<!--K-->' + head + stat3([[b.from.slice(0, 4) + "년부터 연평균", "연 " + b.cagr + "%", NAVY, "", "#eef4ff"], ["1년 보유 시 이익 날 확률", b.y1.pos + "%", "#1a8a5a", "5년 보유 시 " + (b.y5 ? b.y5.pos + "%" : "–"), "#effaf4"], ["가장 크게 빠졌을 때", sgn(b.mdd, 1), UP, man(Math.abs(Q.mdd)) + " 줄었다가 회복", "#fff4f2"]]));
      B.push(box(chartBox({title: man(A) + "을 " + b.from.slice(0, 4) + "년에 넣었다면 (매달 비중 맞춤)", unit: "원", labels: b.growth.labels, vals: gv, color: f.color}, CW - 36, 170, 13)));
      var half2 = (CW - 16) / 2;
      B.push('<div style="display:flex;gap:16px">' + box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">① 1년 뒤 (과거 모든 1년 기준)</div>' + pnBars(Q.y1.map(function(q){ return {l: q.l.replace(/ \(.*\)/, ""), v: q.won - A, t: (q.r >= 0 ? "+" : "−") + man(Math.abs(q.won - A)), hl: /보통/.test(q.l)}; }), half2 - 26, 120, 11.5), "flex:1;padding:12px 13px") +
        box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">② 5년 뒤 (연평균으로)</div>' + (Q.y5 ? tbl({cols: ["경우", "연평균", "5년 뒤", "이익"], rows: Q.y5.map(function(q){ return [q.l, sgn(q.r, 1), man(q.won), (q.won - A >= 0 ? "+" : "−") + man(Math.abs(q.won - A))]; })}, 12, {right: true, hl: function(r){ return /보통/.test(r[0]); }}) : ''), "flex:1;padding:12px 13px") + '</div>');
      if (cb) B.push(secT("③ 매년 " + S.contrib + "만원씩 넣으면 (세액공제 포함)") + tbl({cols: ["기간", "넣은 돈", "보통이면", "나쁘면", "돌려받는 세금"], rows: cb.map(function(c){ return [c.y + "년", man(c.put), man(c.mid), man(c.low), man(c.tax132) + "~" + man(c.tax165)]; })}, 12.5, {right: true}));
      B.push(secT("📅 해마다 수익률 (최근 " + b.years.length + "년)") + pnBars(b.years.map(function(y){ return {l: String(y[0]).slice(2) + "년", v: y[1], t: sgn(y[1], 0)}; }), CW, 90, 10.5));
      B.push(note);
      return B;
    }
    return B;
  }
  function detailBlocks(f, x){
    var ls = lines(f, x.amt), B = [];
    var rows = ls.map(function(l){ return [l.a.name, (l.a.inst || "") + (l.a.code && String(l.a.code).length < 12 ? " (" + l.a.code + ")" : ""), pc(l.a.pct), x.amt ? man(l.won) : "–"]; });
    B.push('<!--K-->' + hTitle(e(f.icon) + " 담을 상품 · 꼭 알아 둘 점", f.short, f.color) + tbl({cols: ["칸", "상품", "비중", "금액"], rows: rows}, 12.5) +
      '<div style="font-size:12.5px;color:' + INK + ';margin-top:8px;line-height:1.6">' + ls.map(function(l){ return "· <b>" + e(l.a.name) + "</b>: " + e(l.a.why); }).join("<br>") + '</div>');
    var tax = f.tax ? box('<div style="font-size:14.5px;font-weight:800;margin-bottom:6px">🧾 세액공제 (연 ' + f.tax.limit + '만원 넣을 때)</div>' + taxLine(f).map(function(t){ return '<div style="display:flex;justify-content:space-between;font-size:13.5px;padding:5px 0;border-bottom:1px solid ' + LINE + '"><span>' + e(t.who) + ' · ' + t.rate + '%</span><b style="color:' + NAVY + '">' + t.full + '</b></div>'; }).join("") + '<div style="font-size:11.5px;color:' + SUB + ';margin-top:6px">' + e(f.tax.note) + '</div>', "flex:1;background:#effaf4") : '';
    var split = f.split && x.amt ? box('<div style="font-size:14.5px;font-weight:800;margin-bottom:6px">🪜 나눠 사기 계획 (주식 칸)</div>' + ["오늘", "2주 뒤", "한 달 뒤"].map(function(w, i){ var eqAmt = x.amt * (100 - (f.alloc.filter(function(a){ return a.k === "cd"; })[0] || {pct: 0}).pct) / 100; return '<div style="display:flex;justify-content:space-between;font-size:13.5px;padding:5px 0;border-bottom:1px solid ' + LINE + '"><span>' + (i + 1) + '회차 · ' + w + '</span><b>' + f.split[i] + '% · ' + man(eqAmt * f.split[i] / 100) + '</b></div>'; }).join("") + '<div style="font-size:11.5px;color:' + SUB + ';margin-top:6px">그 사이 돈은 CD금리 ETF에서 이자를 받음</div>', "flex:1") : '';
    var risk = box('<div style="font-size:14.5px;font-weight:800;margin-bottom:4px;color:#b3372a">⚠️ 꼭 알아 둘 점</div>' + (f.risks || []).map(function(r){ return '<div style="font-size:13px;line-height:1.55;padding:2px 0;color:' + INK + '">· ' + e(r) + '</div>'; }).join(""), "flex:1.3;background:#fff4f2");
    var side = tax || split;
    B.push(side ? '<div style="display:flex;gap:12px;align-items:stretch">' + side + risk + '</div>' : risk);
    if (f.table && f.table.rows && f.table.rows.length && !/^(ktb|ust|brl|els)$/.test(f.key)) B.push(tbl({title: f.table.title, cols: f.table.cols, rows: f.table.rows.slice(0, 8)}, 12));
    return B;
  }
  function coverPage(m){
    return '<div class="ppx" style="width:' + PW + 'px;height:' + PH + 'px;background:linear-gradient(160deg,' + NAVY + ' 0%,#1f4d86 60%,#2b6cb0 100%);font-family:' + FONT + ';position:relative;overflow:hidden"><div style="position:absolute;left:0;top:0;width:' + PW + 'px;height:' + PH + 'px;color:#fff">' +
      '<div style="position:absolute;right:-160px;top:-120px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.06)"></div><div style="position:absolute;left:-120px;bottom:-160px;width:420px;height:420px;border-radius:50%;background:rgba(255,255,255,.05)"></div>' +
      '<div style="padding:120px 70px 0;position:relative;color:#fff"><div style="font-size:16px;letter-spacing:4px;opacity:.8;font-weight:700">INVESTMENT PROPOSAL</div>' +
      '<div style="font-size:24px;margin-top:40px;opacity:.92">' + e(custName(m)) + '을 위한</div><div style="font-size:46px;font-weight:800;letter-spacing:-1.5px;line-height:1.25;margin-top:8px;color:#fff">' + e(titleOf(m)) + '<br>투자 제안서</div>' +
      '<div style="width:70px;height:5px;background:#f0b43c;margin:34px 0"></div>' +
      (m.total ? '<div style="font-size:18px;opacity:.88">제안 금액</div><div style="font-size:40px;font-weight:800;margin-top:4px;color:#fff">' + man(m.total) + '</div>' : '') +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:30px">' + m.items.map(function(x){ return '<span style="background:rgba(255,255,255,.16);border-radius:99px;padding:8px 16px;font-size:16px;font-weight:700;color:#fff">' + e(x.f.icon + " " + x.f.short) + (x.amt ? " · " + man(x.amt) : "") + '</span>'; }).join("") + '</div>' +
      '<div style="margin-top:46px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:600px">' + (m.items.length <= 2 ? m.items : []).map(function(x){ var sl = simLine(x.f, x.amt); return '<div style="background:rgba(255,255,255,.1);border-radius:14px;padding:14px 16px;color:#fff"><div style="font-size:13px;opacity:.85">' + e(x.f.short) + (sl ? " · " + e(sl.lab) : "") + '</div><div style="font-size:22px;font-weight:800;margin-top:2px">' + e(sl ? sl.big : x.f.headline.slice(0, 20)) + '</div></div>'; }).join("") + '</div></div>' +
      '<div style="position:absolute;left:70px;right:70px;bottom:70px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,.3);padding-top:22px;color:#fff"><div><div style="font-size:14px;opacity:.8">제안</div><div style="font-size:24px;font-weight:800;margin-top:4px">' + e(byLine(m) || "담당 PB") + '</div></div><div style="font-size:16px;opacity:.88">' + e(m.date) + '</div></div></div></div>';
  }
  function summaryBlocks(m){
    var parts = m.items.map(function(x){ return {pct: m.total ? x.amt / m.total * 100 : 100 / m.items.length, color: x.f.color}; });
    return [hTitle("🧺 제안 한눈에", "상품별 금액과 핵심") + '<div style="display:flex;gap:28px;align-items:center">' + donut(parts, 210, 42, "합계", m.total ? man(m.total) : "") +
      '<div style="flex:1">' + m.items.map(function(x){ return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid ' + LINE + ';font-size:14.5px;color:' + INK + '"><span style="width:14px;height:14px;border-radius:3px;background:' + x.f.color + '"></span><b style="flex:1">' + e(x.f.icon + " " + x.f.title) + '</b><span style="font-weight:800">' + (m.total ? pc(x.amt / m.total * 100) : "") + '</span><span style="width:120px;text-align:right;color:' + NAVY + ';font-weight:800">' + man(x.amt) + '</span></div>'; }).join("") + '</div></div>',
      m.items.map(function(x){ var sl = simLine(x.f, x.amt); return '<div style="display:flex;gap:10px;font-size:13px;line-height:1.5;padding:8px 12px;margin-bottom:6px;background:' + BG + ';border-radius:10px;border-left:5px solid ' + x.f.color + ';color:' + INK + '"><b style="flex:none;width:92px;color:' + x.f.color + '">' + e(x.f.short) + '</b><span style="flex:1">' + e(x.f.headline) + (sl ? '<br><span style="color:' + NAVY + ';font-weight:700">🧮 ' + e(sl.lab) + ' ' + e(sl.big) + '</span>' : '') + '</span></div>'; }).join("")];
  }
  function noticeBlocks(m){
    return [hTitle("📌 투자 전 꼭 확인하실 점") + m.notice.map(function(t, i){ return '<div style="display:flex;gap:12px;font-size:14.5px;line-height:1.6;padding:10px 0;border-bottom:1px solid ' + LINE + ';color:' + INK + '"><b style="color:' + NAVY + '">' + (i + 1) + '</b><span>' + e(t) + '</span></div>'; }).join("") +
      gap(14) + box('<div style="font-size:13.5px;color:' + INK + ';line-height:1.65">이 제안서는 ' + e(m.basis) + ' 자료로 만들었음. 시장 상황에 따라 배분과 상품은 매일 바뀔 수 있음. 모의 계산은 지금 금리·환율과 과거 자료로 계산한 예시이며 실제 결과와 다를 수 있음.</div>') +
      '<div style="margin-top:34px;display:flex;justify-content:space-between;align-items:flex-end;color:' + INK + '"><div><div style="font-size:14px;color:' + SUB + '">제안</div><div style="font-size:24px;font-weight:800;margin-top:6px">' + e(byLine(m) || "담당 PB") + '</div></div><div style="text-align:right"><div style="font-size:14px;color:' + SUB + '">' + e(custName(m)) + ' 확인</div><div style="width:200px;border-bottom:1px solid #9aa3b2;height:40px"></div></div></div>'];
  }
  // 덩어리 높이를 재서 쪽에 채움 · 남는 높이는 덩어리 사이 간격으로 고르게 나눔(너무 벌어지지 않게 최대 26px)
  var BODY_H = PH - 8 - 26 - 58, GAP = 14;
  function measure(blocks){
    var H = host(); H.innerHTML = '<div style="width:' + CW + 'px;font-family:' + FONT + ';color:' + INK + '">' + blocks.map(function(b){ return '<div class="ppb" style="width:' + CW + 'px">' + b + '</div>'; }).join("") + '</div>';
    var hs = [].map.call(H.querySelectorAll(".ppb"), function(n){ return Math.ceil(n.getBoundingClientRect().height); }); H.innerHTML = ""; return hs;
  }
  function pack(groups){   // groups: [{color, blocks:[...], fresh:true}]
    var pages = [];
    var cur = null;
    groups.forEach(function(g){
      var hs = measure(g.blocks);
      if (cur && BODY_H - cur.used < BODY_H * 0.25) cur = null;   // 남은 자리가 적으면 새 상품은 새 쪽에서
      else if (cur) { cur.used += 18; cur.items.push('<div style="height:4px;border-top:3px solid ' + g.color + ';margin-top:4px"></div>'); }
      g.blocks.forEach(function(b, i){
        var h = hs[i], next = b.indexOf("<!--K-->") === 0 && i + 1 < hs.length ? GAP + Math.min(hs[i + 1], 110) : 0;   // 제목 덩어리는 다음 덩어리 일부와 같이
        if (!cur || cur.used + (cur.items.length ? GAP : 0) + h + next > BODY_H){ cur = {color: g.color, items: [], used: 0}; pages.push(cur); }
        cur.used += (cur.items.length ? GAP : 0) + h; cur.items.push(b);
      });
    });
    return pages;
  }
  function pageFrom(p, n, of, m){
    var free = BODY_H - p.used, k = p.items.length > 1 ? Math.min(26, GAP + free / (p.items.length - 1) * 0.5) : GAP;
    if (free > BODY_H * 0.45) k = GAP;   // 반 넘게 비면(마지막 쪽) 벌리지 않음
    return page(p.items.join(gap(Math.round(k))), n, of, m, p.color).replace('padding:30px 48px 0', 'padding:26px 48px 0');
  }
  function fullPages(m){
    var groups = [];
    if (m.items.length > 1) groups.push({color: NAVY, blocks: summaryBlocks(m)});
    m.items.forEach(function(x){ var f = x.f;
      groups.push({color: f.color, blocks: propBlocks(f, x).concat(f.mkt ? mktBlocks(f) : []).concat(simBlocks(f, x.amt)).concat(detailBlocks(f, x))}); });
    groups.push({color: NAVY, blocks: noticeBlocks(m)});
    var pages = pack(groups), of = pages.length + 1;
    return [coverPage(m)].concat(pages.map(function(p, i){ return pageFrom(p, i + 2, of, m); }));
  }

  /* ───────── 그림 찍기 ───────── */
  var HOST = null;
  function host(){ if (!HOST || !document.body.contains(HOST)){ HOST = document.createElement("div"); HOST.id = "ppxhost"; HOST.setAttribute("aria-hidden", "true");
      HOST.style.cssText = "position:fixed;left:-20000px;top:0;z-index:-1;pointer-events:none;color:" + INK + ";background:#fff;color-scheme:light"; document.body.appendChild(HOST); } return HOST; }
  function needLib(){ return new Promise(function(ok, no){ if (window.html2pdf) return ok(); var s = document.createElement("script"); s.src = "lib/html2pdf.bundle.min.js"; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("PDF 도구를 못 받음")); }; document.head.appendChild(s); }); }
  function needPpt(){ return new Promise(function(ok, no){ if (window.PptxGenJS) return ok(); var s = document.createElement("script"); s.src = "lib/pptxgen.bundle.js?v=1"; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("PPT 도구를 못 받음")); }; document.head.appendChild(s); }); }
  function imgsReady(el){ return Promise.all([].map.call(el.querySelectorAll("img"), function(i){ return i.complete && i.naturalWidth ? 1 : new Promise(function(r){ i.onload = i.onerror = function(){ r(); }; setTimeout(r, 3000); }); })); }
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function snap(html, w, scale){
    var H = host(); H.innerHTML = html; var el = H.firstChild;
    return imgsReady(el).then(function(){
      var h = Math.ceil(el.getBoundingClientRect().height);
      return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [w, h], orientation: "portrait", hotfixes: ["px_scaling"]},
        html2canvas: {scale: scale, backgroundColor: "#ffffff", useCORS: true, logging: false, scrollX: 0, scrollY: 0, windowWidth: w, width: w, height: h,
          onclone: function(d){ try { d.documentElement.removeAttribute("data-ui"); d.documentElement.style.colorScheme = "light"; d.body.style.color = INK; d.body.style.background = "#fff"; } catch(x) {} }}}).from(el).toCanvas().get("canvas")
        .then(function(c){ H.innerHTML = ""; return c; });
    });
  }
  function shareBlob(blob, name, mime){
    // 🛠 10/28 아이폰은 누른 바로 그 순간에만 공유창 — PDF·PPT 를 만드는 사이 그 순간이 지나 카톡·문자로 안 열리던 것 → 준비 창의 「카톡·문자로 보내기」를 한 번 더 눌러 보냄
    try { var f0 = new File([blob], name, {type: mime}); if (window.__onepage && __onepage.ready){ __onepage.ready([f0], name); return Promise.resolve(); } } catch(x) {}
    try { var f = new File([blob], name, {type: mime}); if (navigator.canShare && navigator.canShare({files: [f]})) return navigator.share({files: [f], title: name}).catch(function(e2){ if (e2 && e2.name !== "AbortError") dl(blob, name); }); } catch(x) {}
    dl(blob, name); return Promise.resolve();
  }
  function dl(blob, name){ var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 30000); }
  function fname(m, ext){ return ((m.cust || "고객") + "_" + titleOf(m) + "_" + today().slice(5).replace("-", "")).replace(/[\\/:*?"<>|\s·]+/g, "_").slice(0, 60) + "." + ext; }

  function makePng(m){
    return needLib().then(function(){ return snap(onePage(m), 1080, IOS ? 1 : 1.25); }).then(function(c){
      return new Promise(function(r){ c.toBlob(function(b){ c.width = c.height = 0; r(b); }, "image/png"); }); });
  }
  function makePdf(m){
    var pages = fullPages(m), pdf = null;
    return needLib().then(function(){
      return pages.reduce(function(p, html){
        return p.then(function(){ return snap(html, PW, IOS ? 1.6 : 2).then(function(c){
          var url = c.toDataURL("image/jpeg", 0.9); c.width = c.height = 0;
          if (!pdf){ return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [PW, PH], orientation: "portrait", hotfixes: ["px_scaling"]}}).from(document.createElement("div")).toPdf().get("pdf").then(function(P0){ pdf = P0; pdf.addImage(url, "JPEG", 0, 0, PW, PH); }); }
          pdf.addPage([PW, PH], "portrait"); pdf.addImage(url, "JPEG", 0, 0, PW, PH);
        }); });
      }, Promise.resolve());
    }).then(function(){ return pdf.output("blob"); });
  }

  /* ═════════ ③ PPT (16:9 · 맑은 고딕 · PPT 안에서 고칠 수 있는 진짜 차트) ═════════ */
  function hx(c){ return String(c || "#14304f").replace("#", "").toUpperCase(); }
  function makePpt(m){
    return needPpt().then(function(){
      var P = new PptxGenJS(), F = "맑은 고딕";
      P.layout = "LAYOUT_WIDE"; P.theme = {headFontFace: F, bodyFontFace: F}; P.title = custName(m) + " 투자 제안서"; P.author = byLine(m) || "PB";
      function T(s, text, o){ var d = {fontFace: F, fontSize: 14, color: "1D2533", valign: "top", margin: 0}; for (var k in o) d[k] = o[k]; s.addText(text, d); }
      function head(s, t, sub, color){ s.background = {color: "FFFFFF"}; s.addShape(P.ShapeType.rect, {x: 0, y: 0, w: 13.333, h: 0.12, fill: {color: hx(color || NAVY)}, line: {color: hx(color || NAVY)}});
        T(s, t, {x: 0.6, y: 0.32, w: 10, h: 0.6, fontSize: 25, bold: true, color: hx(color || NAVY)}); if (sub) T(s, sub, {x: 0.6, y: 0.92, w: 12, h: 0.35, fontSize: 12, color: "5B6576"});
        T(s, custName(m) + " 투자 제안 · " + m.date + (byLine(m) ? " · " + byLine(m) : ""), {x: 0.6, y: 7.08, w: 12.1, h: 0.28, fontSize: 9, color: "8A93A3"}); }
      function rbox(s, x, y, w, h, fill){ s.addShape(P.ShapeType.roundRect, {x: x, y: y, w: w, h: h, fill: {color: hx(fill || BG)}, line: {color: hx(fill || BG)}, rectRadius: 0.1}); }
      function th(cols){ return cols.map(function(c){ return {text: c, options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}; }); }
      function kpis(s, kp, x, y, w, cols){ kp = (kp || []).filter(function(k){ return k && k.value && k.value !== "–"; }); var cw = (w - 0.15 * (cols - 1)) / cols; (kp || []).forEach(function(k, i){ var xx = x + (i % cols) * (cw + 0.15), yy = y + Math.floor(i / cols) * 1.12;
        rbox(s, xx, yy, cw, 1.0); T(s, k.label, {x: xx + 0.12, y: yy + 0.08, w: cw - 0.2, h: 0.26, fontSize: 9.5, color: "5B6576", bold: true});
        T(s, k.value, {x: xx + 0.12, y: yy + 0.32, w: cw - 0.2, h: 0.38, fontSize: 17, bold: true, color: k.tone > 0 ? "1A8A5A" : k.tone < 0 ? hx(UP) : "1D2533"});
        T(s, k.sub || "", {x: xx + 0.12, y: yy + 0.68, w: cw - 0.2, h: 0.28, fontSize: 8, color: "5B6576"}); }); }
      function lineChart(s, ch, x, y, w, h, color){
        if (!ch || !ch.vals || ch.vals.length < 2) return;
        var step = Math.max(1, Math.floor(ch.vals.length / 70)), data = [];
        var sub = function(arr){ var o = []; for (var i = 0; i < arr.length; i += step) o.push(arr[i]); return o; };
        var lb = sub(ch.labels).map(function(l){ return ch.kind === "curve" ? l : String(l).slice(2, 7).replace("-", "."); });
        if (ch.multi) ch.multi.forEach(function(mm){ data.push({name: mm.name, labels: lb, values: sub(mm.vals)}); });
        else { data.push({name: ch.title, labels: lb, values: sub(ch.vals)}); if (ch.ma) data.push({name: ch.mal || "평균선", labels: lb, values: sub(ch.ma).map(function(v){ return v == null ? null : v; })}); }
        T(s, ch.title, {x: x, y: y, w: w, h: 0.3, fontSize: 12, bold: true});
        s.addChart(P.ChartType.line, data, {x: x - 0.1, y: y + 0.3, w: w + 0.1, h: h - 0.3, chartColors: ch.multi ? ch.multi.map(function(mm){ return hx(mm.color); }) : [hx(ch.color || color), "9AA3B2"], lineDataSymbol: ch.kind === "curve" ? "circle" : "none", lineDataSymbolSize: 5, lineSize: 2,
          catAxisLabelFontFace: F, catAxisLabelFontSize: 8, valAxisLabelFontFace: F, valAxisLabelFontSize: 8, showLegend: !!(ch.multi || ch.ma), legendPos: "b", legendFontFace: F, legendFontSize: 8, catAxisLabelFrequency: Math.max(1, Math.ceil(lb.length / 6)), valGridLine: {color: "EEF1F6", size: 0.5}});
      }
      function colChart(s, title, items, x, y, w, h){
        T(s, title, {x: x, y: y, w: w, h: 0.3, fontSize: 12, bold: true});
        s.addChart(P.ChartType.bar, [{name: title, labels: items.map(function(i){ return i.l; }), values: items.map(function(i){ return Math.round(i.v); })}], {x: x - 0.1, y: y + 0.3, w: w + 0.1, h: h - 0.3, barDir: "col",
          chartColors: items.map(function(i){ return i.v >= 0 ? "22A06B" : "E0533D"; }), showValue: true, dataLabelFormatCode: '#,##0', dataLabelFontFace: F, dataLabelFontSize: 8, catAxisLabelFontFace: F, catAxisLabelFontSize: 8.5, valAxisHidden: true, valGridLine: {style: "none"}, showLegend: false});
      }
      // 표지
      var s = P.addSlide(); s.background = {color: hx(NAVY)};
      s.addShape(P.ShapeType.ellipse, {x: 9.3, y: -1.6, w: 5.6, h: 5.6, fill: {color: "FFFFFF", transparency: 93}, line: {color: "FFFFFF", transparency: 100}});
      T(s, "INVESTMENT PROPOSAL", {x: 0.9, y: 1.1, w: 8, h: 0.4, fontSize: 13, color: "C9D6EA", bold: true, charSpacing: 4});
      T(s, custName(m) + "을 위한", {x: 0.9, y: 1.9, w: 11, h: 0.5, fontSize: 20, color: "E6EDF7"});
      T(s, titleOf(m) + " 투자 제안서", {x: 0.9, y: 2.45, w: 11.5, h: 1.3, fontSize: 36, bold: true, color: "FFFFFF"});
      s.addShape(P.ShapeType.rect, {x: 0.9, y: 3.95, w: 0.8, h: 0.07, fill: {color: "F0B43C"}, line: {color: "F0B43C"}});
      if (m.total) { T(s, "제안 금액", {x: 0.9, y: 4.3, w: 4, h: 0.35, fontSize: 13, color: "C9D6EA"}); T(s, man(m.total), {x: 0.9, y: 4.65, w: 6, h: 0.7, fontSize: 32, bold: true, color: "FFFFFF"}); }
      T(s, m.items.map(function(x){ return x.f.short + (x.amt ? " " + man(x.amt) : ""); }).join("   ·   "), {x: 0.9, y: 5.55, w: 11.5, h: 0.4, fontSize: 13, color: "E6EDF7"});
      T(s, "제안  " + (byLine(m) || "담당 PB"), {x: 0.9, y: 6.55, w: 8, h: 0.4, fontSize: 16, bold: true, color: "FFFFFF"});
      T(s, m.date, {x: 8.9, y: 6.6, w: 3.6, h: 0.35, fontSize: 12, color: "C9D6EA", align: "right"});
      if (m.items.length > 1){ s = P.addSlide(); head(s, "🧺 제안 한눈에", "상품별 금액");
        s.addChart(P.ChartType.doughnut, [{name: "금액", labels: m.items.map(function(x){ return x.f.short; }), values: m.items.map(function(x){ return x.amt || 1; })}],
          {x: 0.5, y: 1.4, w: 5, h: 5.3, holeSize: 58, chartColors: m.items.map(function(x){ return hx(x.f.color); }), showPercent: true, showLegend: true, legendPos: "b", legendFontFace: F, legendFontSize: 11, dataLabelColor: "FFFFFF", dataLabelFontFace: F, dataLabelFontSize: 11});
        s.addTable([th(["상품", "금액", "핵심"])].concat(m.items.map(function(x){ var sl = simLine(x.f, x.amt); return [{text: x.f.icon + " " + x.f.short, options: {bold: true}}, man(x.amt), x.f.headline + (sl ? "\n🧮 " + sl.lab + " " + sl.big : "")]; })),
          {x: 5.8, y: 1.5, w: 7.0, colW: [1.6, 1.3, 4.1], fontFace: F, fontSize: 10, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"}); }
      m.items.forEach(function(x){
        var f = x.f, ls = lines(f, x.amt), mk = f.mkt || {}, S = f.sim, A = x.amt || 100000000, sl = simLine(f, x.amt);
        // 제안
        s = P.addSlide(); head(s, f.icon + " " + f.title, f.sub, f.color);
        rbox(s, 0.6, 1.4, 12.1, 0.72, f.color); T(s, f.headline, {x: 0.8, y: 1.46, w: 11.8, h: 0.6, fontSize: 15, bold: true, color: "FFFFFF", valign: "middle"});
        s.addChart(P.ChartType.doughnut, [{name: "비중", labels: f.alloc.map(function(a){ return a.name; }), values: f.alloc.map(function(a){ return a.pct; })}],
          {x: 0.5, y: 2.3, w: 4.3, h: 4.5, holeSize: 55, chartColors: f.alloc.map(function(a){ return hx(a.color); }), showPercent: true, showLegend: false, dataLabelColor: "FFFFFF", dataLabelFontFace: F, dataLabelFontSize: 11, dataLabelFontBold: true});
        s.addTable([th(["칸", "상품", "비중", "금액"])].concat(ls.map(function(l){ return [{text: l.a.name, options: {bold: true, color: hx(l.a.color)}}, (l.a.inst || "") + (l.a.code && String(l.a.code).length < 12 ? " (" + l.a.code + ")" : ""), {text: pc(l.a.pct), options: {align: "right", bold: true}}, {text: x.amt ? man(l.won) : "–", options: {align: "right"}}]; })),
          {x: 5.0, y: 2.35, w: 7.7, colW: [1.9, 3.7, 0.8, 1.3], fontFace: F, fontSize: 11, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"});
        var yy = 2.45 + 0.38 * (ls.length + 1) + 0.15;
        if (sl){ rbox(s, 5.0, yy, 7.7, 0.85, "#EEF4FF"); T(s, "🧮 " + sl.lab, {x: 5.15, y: yy + 0.06, w: 7.4, h: 0.26, fontSize: 10, color: "5B6576", bold: true}); T(s, sl.big + "   " + sl.sub, {x: 5.15, y: yy + 0.33, w: 7.4, h: 0.45, fontSize: 12.5, bold: true, color: hx(NAVY)}); yy += 1.0; }
        T(s, (f.points || []).map(function(p){ return {text: p, options: {bullet: {code: "2714"}, breakLine: true}}; }), {x: 5.0, y: yy, w: 7.7, h: 6.9 - yy, fontSize: 11.5, paraSpaceAfter: 4});
        // 시장
        if (f.mkt){ s = P.addSlide(); head(s, "📊 " + (mk.title || "시장 지금"), f.short + " 판단 근거", f.color);
          var nk = Math.min(6, (mk.kpis || []).filter(function(k){ return k && k.value && k.value !== "–"; }).length), cols = nk > 4 ? 3 : nk;
          kpis(s, (mk.kpis || []).slice(0, 6), 0.6, 1.4, 6.3, cols || 1);
          var ky = 1.4 + Math.ceil(nk / (cols || 1)) * 1.12 + 0.1;
          T(s, "🔎 그래서 지금은", {x: 0.6, y: ky, w: 6.3, h: 0.3, fontSize: 13, bold: true});
          T(s, (mk.view || []).map(function(v){ return {text: v, options: {bullet: true, breakLine: true}}; }), {x: 0.6, y: ky + 0.35, w: 6.3, h: 6.95 - ky - 0.35, fontSize: 10.5, paraSpaceAfter: 4});
          var chs = mk.charts || [];
          lineChart(s, chs[0], 7.25, 1.4, 5.5, chs[1] ? 2.75 : 5.5, f.color);
          if (chs[1]) lineChart(s, chs[1], 7.25, 4.25, 5.5, 2.7, f.color);
          if (mk.outlook || chs[2]){ s = P.addSlide(); head(s, "🔭 " + (mk.outlook ? mk.outlook.title : "시장 자료"), f.short + " · " + ((mk.outlook || {}).src || ""), f.color);
            if (mk.outlook) s.addTable([th(mk.outlook.cols)].concat(mk.outlook.rows.slice(0, 14).map(function(r){ return r.map(function(c){ return String(c); }); })), {x: 0.6, y: 1.4, w: chs[2] || mk.curve ? 6.6 : 12.1, fontFace: F, fontSize: mk.outlook.rows.length > 10 ? 9 : 11, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
            if (chs[2]) lineChart(s, chs[2], 7.5, 1.4, 5.3, mk.curve ? 2.7 : 5.4, f.color);
            if (mk.curve){ var cy = chs[2] ? 4.3 : 1.4; T(s, mk.curve.title, {x: 7.5, y: cy, w: 5.3, h: 0.3, fontSize: 12, bold: true});
              s.addChart(P.ChartType.bar, [{name: "금리", labels: mk.curve.rows.map(function(r){ return r[0] + "년"; }), values: mk.curve.rows.map(function(r){ return r[1]; })}], {x: 7.4, y: cy + 0.3, w: 5.4, h: 2.4, barDir: "col", chartColors: [hx(f.color)], showValue: true, dataLabelFormatCode: "0.00", dataLabelFontFace: F, dataLabelFontSize: 8, catAxisLabelFontFace: F, catAxisLabelFontSize: 9, valAxisHidden: true, valGridLine: {style: "none"}, showLegend: false}); }
          }
        }
        // 계산서
        if (S){ s = P.addSlide(); head(s, "🧮 모의투자 계산서", (x.amt ? man(A) + " 넣으면" : "1억원 넣었다고 치면") + " · " + f.short, f.color);
          if (S.kind === "bond"){ var B = bondCalc(S, A);
            [["넣는 돈", man(A), "1D2533"], ["만기까지 받는 돈", man(B.tot), hx(NAVY)], ["이익 · 연 환산", "+" + man(B.pnl) + " · 연 " + B.cagr.toFixed(2) + "%", "1A8A5A"]].forEach(function(c, i){ rbox(s, 0.6 + i * 4.1, 1.4, 3.9, 0.95); T(s, c[0], {x: 0.75 + i * 4.1, y: 1.47, w: 3.6, h: 0.26, fontSize: 10, color: "5B6576", bold: true}); T(s, c[1], {x: 0.75 + i * 4.1, y: 1.75, w: 3.7, h: 0.5, fontSize: 18, bold: true, color: c[2]}); });
            s.addTable([th(["칸", "상품", "넣는 돈", "받는 이자(세후)", "원화로", "기간", "연 환산"])].concat(B.rows.map(function(r){ var cu = r.p.cur; return [r.p.slot, r.p.name, man(r.a), cu === "KRW" ? man(r.cpnAll - r.tax) : Math.round(r.cpnAll - r.tax).toLocaleString("ko-KR") + " " + CUR[cu], man(r.krw), r.p.yrs.toFixed(1) + "년", r.cagr.toFixed(2) + "%"]; })),
              {x: 0.6, y: 2.5, w: 12.1, colW: [1.5, 3.4, 1.4, 2.0, 1.5, 0.9, 1.4], fontFace: F, fontSize: 10, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"});
            if (B.fxScen.length) colChart(s, "환율이 바뀌면 — 이익 (원)" + (B.be != null ? " · 환율이 " + Math.abs(B.be).toFixed(1) + "% 넘게 안 빠지면 이익" : ""), B.fxScen.map(function(q){ return {l: "환율 " + (q.m > 0 ? "+" : q.m < 0 ? "−" : "") + Math.abs(q.m) + "%", v: q.pnl}; }), 0.6, 4.0, B.rateScen.length ? 6.0 : 12.1, 2.9);
            if (B.rateScen.length) colChart(s, "1년 뒤 팔면 — 금리가 바뀔 때 이익 (원)", B.rateScen.map(function(q){ return {l: "금리 " + (q.d > 0 ? "+" : q.d < 0 ? "−" : "") + Math.abs(q.d) + "%p", v: q.pnl}; }), B.fxScen.length ? 6.8 : 0.6, 4.0, B.fxScen.length ? 5.9 : 12.1, 2.9);
          } else if (S.kind === "els"){ var EE = elsCalc(S, A);
            var rws = []; EE.forEach(function(q){ q.steps.forEach(function(st, i){ rws.push([i === 0 ? q.p.slot + "\n" + q.p.name : "", st.t + "개월", man(st.won), "+" + man(st.won - q.a), st.pr != null ? st.pr.toFixed(1) + "%" : "–"]); }); q.tail.forEach(function(t){ rws.push(["", t.lab, man(t.won), (t.won - q.a >= 0 ? "+" : "−") + man(Math.abs(t.won - q.a)), t.pr != null ? t.pr.toFixed(1) + "%" : "–"]); }); });
            s.addTable([th(["상품", "끝나는 때", "받는 돈", "이익", "과거 확률"])].concat(rws), {x: 0.6, y: 1.4, w: 7.3, colW: [2.2, 1.9, 1.2, 1.1, 0.9], fontFace: F, fontSize: 8, rowH: 0.19, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
            colChart(s, "평균 기대 이익 (과거 확률 반영)", EE.map(function(q){ return {l: q.p.slot, v: q.ev - q.a}; }), 8.2, 1.4, 4.6, 3.0);
            T(s, S.note, {x: 8.2, y: 4.6, w: 4.6, h: 2.2, fontSize: 9.5, color: "5B6576"});
          } else if (S.kind === "equity"){ var Q = eqCalc(S, A), b = S.bt;
            [["연평균 (" + b.from.slice(0, 4) + "년부터)", "연 " + b.cagr + "%", hx(NAVY)], ["1년 보유 시 이익 확률", b.y1.pos + "%", "1A8A5A"], ["가장 크게 빠졌을 때", b.mdd + "%", hx(UP)]].forEach(function(c, i){ rbox(s, 0.6 + i * 4.1, 1.4, 3.9, 0.95); T(s, c[0], {x: 0.75 + i * 4.1, y: 1.47, w: 3.6, h: 0.26, fontSize: 10, color: "5B6576", bold: true}); T(s, c[1], {x: 0.75 + i * 4.1, y: 1.75, w: 3.7, h: 0.5, fontSize: 20, bold: true, color: c[2]}); });
            lineChart(s, {title: man(A) + "을 " + b.from.slice(0, 4) + "년에 넣었다면", labels: b.growth.labels, vals: b.growth.vals.map(function(v){ return Math.round(v * A / 10000); }), color: f.color}, 0.6, 2.55, 6.2, 4.3, f.color);
            colChart(s, "1년 뒤 이익 (원) — 나쁜·보통·좋은 해", Q.y1.map(function(q){ return {l: q.l.split(" ")[0] + " 해 " + sgn(q.r, 0), v: q.won - A}; }), 7.1, 2.55, 5.7, 2.1);
            colChart(s, "해마다 수익률 (%)", b.years.map(function(y){ return {l: String(y[0]).slice(2), v: y[1]}; }), 7.1, 4.75, 5.7, 2.1);
          }
        }
        // 위험
        s = P.addSlide(); head(s, f.icon + " " + f.short + " — 담을 상품 · 꼭 알아 둘 점", "", f.color);
        s.addTable([th(["칸", "상품", "비중", "금액", "이유"])].concat(ls.map(function(l){ return [{text: l.a.name, options: {bold: true}}, l.a.inst || "", pc(l.a.pct), x.amt ? man(l.won) : "–", l.a.why]; })), {x: 0.6, y: 1.4, w: 12.1, colW: [1.6, 2.8, 0.8, 1.3, 5.6], fontFace: F, fontSize: 9.5, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
        var ry = 1.6 + 0.45 * (ls.length + 1);
        if (f.tax){ rbox(s, 0.6, ry, 5.9, 1.3, "#EFFAF4"); T(s, "🧾 세액공제 (연 " + f.tax.limit + "만원 넣을 때)\n" + taxLine(f).map(function(t){ return t.who + " · " + t.rate + "% → " + t.full; }).join("\n") + "\n" + f.tax.note, {x: 0.75, y: ry + 0.1, w: 5.6, h: 1.1, fontSize: 10}); }
        rbox(s, f.tax ? 6.8 : 0.6, ry, f.tax ? 5.9 : 12.1, 6.9 - ry, "#FFF4F2");
        T(s, "⚠️ 꼭 알아 둘 점", {x: (f.tax ? 6.95 : 0.75), y: ry + 0.1, w: 5.6, h: 0.3, fontSize: 12, bold: true, color: "B3372A"});
        T(s, (f.risks || []).map(function(r){ return {text: r, options: {bullet: true, breakLine: true}}; }), {x: (f.tax ? 6.95 : 0.75), y: ry + 0.45, w: (f.tax ? 5.6 : 11.8), h: 6.9 - ry - 0.55, fontSize: 11, paraSpaceAfter: 4});
      });
      s = P.addSlide(); head(s, "📌 투자 전 꼭 확인하실 점", m.basis);
      T(s, m.notice.concat(["모의 계산은 지금 금리·환율과 과거 자료로 계산한 예시이며 실제 결과와 다를 수 있음"]).map(function(t){ return {text: t, options: {bullet: {type: "number"}, breakLine: true}}; }), {x: 0.8, y: 1.5, w: 11.8, h: 3.6, fontSize: 15, paraSpaceAfter: 10});
      T(s, "제안  " + (byLine(m) || "담당 PB"), {x: 0.8, y: 5.6, w: 6, h: 0.5, fontSize: 20, bold: true, color: hx(NAVY)});
      T(s, custName(m) + " 확인  ______________________", {x: 6.8, y: 5.7, w: 6, h: 0.4, fontSize: 13, color: "5B6576", align: "right"});
      return P.write({outputType: "blob"});
    });
  }

  /* ═════════ 앱 화면 ═════════ */
  var AMTS = [[1000, "1천만"], [3000, "3천만"], [5000, "5천만"], [10000, "1억"], [30000, "3억"]];
  window.propView = function(){ return '<div id="ppw"><div class="loading">오늘 기본폼 불러오는 중…</div></div>'; };
  window.propInit = function(){ load().then(draw).catch(function(){ var w = document.getElementById("ppw"); if (w) w.innerHTML = '<div class="empty"><div class="big">📝</div>오늘 기본폼을 아직 못 받았어요.<br>잠시 뒤 다시 열어 주세요.</div>'; }); };
  function draw(){
    var w = document.getElementById("ppw"); if (!w || !DATA) return;
    ST.sel = ST.sel.filter(function(k){ return !!form(k); });
    var M = DATA.market || {};
    var h = '<section class="card pp-top"><h3>📋 오늘의 기본폼</h3><p class="pp-tip" style="margin-top:-4px">' + e(DATA.basis || "") + '</p>' +
      '<div class="pp-reg"><span class="' + (M.us_up ? "ok" : "no") + '">🇺🇸 ' + (M.us_up ? "상승 추세" : "조심") + '</span><span class="' + (M.kr_up ? "ok" : "no") + '">🇰🇷 ' + (M.kr_up ? "상승 추세" : "회복 전") + '</span><span class="mut">' + e(String(DATA.at || "").slice(5).replace("-", "/")) + ' 갱신</span></div>' +
      '<p class="pp-tip">고를 상품을 누르세요 · 여러 개 함께 골라도 됨</p><div class="pp-grid">' + DATA.forms.map(function(f){ var on = ST.sel.indexOf(f.key) >= 0;
        return '<button type="button" class="pp-f' + (on ? " on" : "") + '" data-k="' + f.key + '" style="--fc:' + f.color + '"><span class="pp-i">' + e(f.icon) + '</span><b>' + e(f.short) + '</b><small>' + e(f.headline.replace(/ 제안임$/, "")) + '</small>' + (on ? '<em>✓</em>' : '') + '</button>'; }).join("") + '</div></section>';
    h += '<section class="card"><h3>✍️ 누구에게 · 누가</h3><div class="pp-in">' +
      '<label>고객 이름<input id="ppcust" maxlength="20" placeholder="예: 홍길동" value="' + e(ST.cust) + '"></label>' +
      '<label>제안자 이름<input id="pppb" maxlength="20" placeholder="예: 김OO PB" value="' + e(ME.pb || "") + '"></label>' +
      '<label>소속<input id="pporg" maxlength="30" placeholder="예: OO WM센터" value="' + e(ME.org || "") + '"></label></div><p class="pp-tip">제안자·소속은 이 휴대폰에 기억해 둠</p></section>';
    h += '<section class="card"><h3>💰 상품별 금액</h3>' + (ST.sel.length ? ST.sel.map(function(k){ var f = form(k), v = ST.amt[k] || "";
        return '<div class="pp-amt" style="--fc:' + f.color + '"><div class="pp-an"><span>' + e(f.icon) + '</span><b>' + e(f.short) + '</b><span class="pp-aw" id="ppw_' + k + '">' + (v ? man(v * 10000) : "") + '</span></div>' +
          '<div class="pp-ar"><input inputmode="numeric" data-ak="' + k + '" placeholder="금액 (만원)" value="' + e(v) + '"><span>만원</span></div>' +
          '<div class="pp-q">' + AMTS.map(function(a){ return '<button type="button" data-qk="' + k + '" data-qv="' + a[0] + '"' + (+v === a[0] ? ' class="on"' : '') + '>' + a[1] + '</button>'; }).join("") + '</div></div>'; }).join("") +
        '<div class="pp-tot">합계 <b id="pptot">' + (total() ? man(total()) : "–") + '</b></div>'
      : '<p class="mut">위에서 상품을 먼저 골라 주세요.</p>') + '</section>';
    h += '<section class="card"><h3>📤 만들기</h3><p class="pp-tip" style="margin-top:-4px">휴대폰에서 바로 만듦 · 돈 안 듦</p><div class="pp-go">' +
      '<button type="button" data-mk="png" class="main">📱 한 장 <small>카톡 전송용 그림</small></button>' +
      '<button type="button" data-mk="pdf">📄 풀버전 PDF <small>표지·시장·상품별 자세히</small></button>' +
      '<button type="button" data-mk="ppt">📊 PPT <small>맑은 고딕 · 차트 수정 가능</small></button></div>' +
      '<div id="ppst" class="mut pp-st"></div><div class="pp-pv-h">👀 한 장 미리 보기</div><div id="pppv" class="pp-pv"></div></section>';
    w.innerHTML = h;
    bind(); preview();
  }
  var pvT = null;
  function preview(){
    clearTimeout(pvT); pvT = setTimeout(function(){
      var box2 = document.getElementById("pppv"); if (!box2) return;
      if (!ST.sel.length){ box2.innerHTML = '<div class="mut" style="padding:18px;text-align:center">상품을 고르면 여기에 바로 보여요</div>'; box2.style.height = "auto"; return; }
      var m = model(), wd = box2.clientWidth || 340, sc = wd / 1080;
      box2.innerHTML = '<div class="pp-pv-in" style="transform:scale(' + sc + ');transform-origin:0 0;width:1080px">' + onePage(m) + '</div>';
      var inner = box2.firstChild; setTimeout(function(){ box2.style.height = Math.ceil(inner.getBoundingClientRect().height) + "px"; }, 30);
    }, 120);
  }
  function bind(){
    var w = document.getElementById("ppw");
    [].forEach.call(w.querySelectorAll(".pp-f"), function(b){ b.onclick = function(){ var k = b.dataset.k, i = ST.sel.indexOf(k); if (i >= 0) ST.sel.splice(i, 1); else ST.sel.push(k); keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    var cu = document.getElementById("ppcust"), pb = document.getElementById("pppb"), og = document.getElementById("pporg");
    if (cu) cu.oninput = function(){ ST.cust = cu.value; preview(); };
    if (pb) pb.oninput = function(){ ME.pb = pb.value.trim(); keep(); preview(); };
    if (og) og.oninput = function(){ ME.org = og.value.trim(); keep(); preview(); };
    [].forEach.call(w.querySelectorAll("[data-ak]"), function(inp){ inp.oninput = function(){ var v = inp.value.replace(/[^\d]/g, ""); if (inp.value !== v) inp.value = v; ST.amt[inp.dataset.ak] = v ? +v : ""; keep(); upAmt(inp.dataset.ak); }; });
    [].forEach.call(w.querySelectorAll("[data-qk]"), function(b){ b.onclick = function(){ var k = b.dataset.qk; ST.amt[k] = +b.dataset.qv; keep(); var inp = w.querySelector('[data-ak="' + k + '"]'); if (inp) inp.value = ST.amt[k];
      [].forEach.call(b.parentNode.children, function(x){ x.classList.toggle("on", x === b); }); upAmt(k); }; });
    [].forEach.call(w.querySelectorAll("[data-mk]"), function(b){ b.onclick = function(){ make(b.dataset.mk, b); }; });
  }
  function upAmt(k){ var s = document.getElementById("ppw_" + k); if (s) s.textContent = ST.amt[k] ? man(ST.amt[k] * 10000) : ""; var t = document.getElementById("pptot"); if (t) t.textContent = total() ? man(total()) : "–"; preview(); }
  var READY = {};
  function make(kind, btn){
    if (!ST.sel.length){ toast("상품을 먼저 골라 주세요"); return; }
    var m = model(), sig = JSON.stringify([kind, ST.sel, ST.amt, ST.cust, ME.pb, ME.org, DATA.at]);
    if (READY[kind] && READY[kind].sig === sig){ var R = READY[kind]; shareBlob(R.blob, R.name, R.mime); return; }   // 두 번째 누름 = 저장·공유 (아이폰은 누른 순간에만 공유창이 열림)
    if (ST.busy) return; ST.busy = true;
    var st = document.getElementById("ppst"), old = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = "⏳ 만드는 중…<small>몇 초 걸려요</small>"; if (st) st.textContent = "";
    var p = kind === "png" ? makePng(m) : kind === "pdf" ? makePdf(m) : makePpt(m);
    var mime = kind === "png" ? "image/png" : kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    p.then(function(blob){
      var name = fname(m, kind === "png" ? "png" : kind === "pdf" ? "pdf" : "pptx");
      READY[kind] = {sig: sig, blob: blob, name: name, mime: mime};
      btn.disabled = false; btn.classList.add("ready");
      btn.innerHTML = "⬇️ " + (kind === "png" ? "한 장" : kind === "pdf" ? "PDF" : "PPT") + " 저장·보내기<small>" + e(name) + " · " + Math.max(1, Math.round(blob.size / 1024)) + "KB</small>";
      if (st) st.textContent = "✓ 다 만들었어요 — 버튼을 한 번 더 누르면 저장·공유 창이 떠요";
      try { if (window.ntfyUse) ntfyUse("propose_" + kind); } catch(x) {}
    }).catch(function(err){ btn.disabled = false; btn.innerHTML = old; if (st) st.textContent = "만들지 못했어요 · " + String((err && (err.message || err)) || "").slice(0, 80); try { console.error(err); } catch(x) {} })
      .then(function(){ ST.busy = false; });
  }
  // 상품·금액·이름이 바뀌면 다 만든 버튼은 다시 「만들기」로
  document.addEventListener("input", function(ev){ if (ev.target && ev.target.closest && ev.target.closest("#ppw")) resetBtns(); });
  document.addEventListener("click", function(ev){ if (ev.target && ev.target.closest && ev.target.closest("#ppw .pp-q button, #ppw .pp-f")) resetBtns(); }, true);
  function resetBtns(){ READY = {}; [].forEach.call(document.querySelectorAll("#ppw [data-mk].ready"), function(b){ b.classList.remove("ready");
    b.innerHTML = {png: "📱 한 장 <small>카톡 전송용 그림</small>", pdf: "📄 풀버전 PDF <small>표지·시장·상품별 자세히</small>", ppt: "📊 PPT <small>맑은 고딕 · 차트 수정 가능</small>"}[b.dataset.mk]; }); var st = document.getElementById("ppst"); if (st) st.textContent = ""; }

  // 시험·다른 화면에서 쓰도록
  window.PROPOSE = {load: load, model: function(){ return model(); }, set: function(o){ if (o.sel) ST.sel = o.sel; if (o.amt) ST.amt = o.amt; if (o.cust != null) ST.cust = o.cust; if (o.pb != null) ME.pb = o.pb; if (o.org != null) ME.org = o.org; },
    png: function(){ return makePng(model()); }, pdf: function(){ return makePdf(model()); }, ppt: function(){ return makePpt(model()); }, onePage: function(){ return onePage(model()); }, pages: function(){ return fullPages(model()); }};

  var css = document.createElement("style");
  css.textContent =
    ".pp-reg{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:2px 0 8px}.pp-reg span{font-size:12.5px;padding:3px 9px;border-radius:99px;border:1px solid var(--line)}" +
    ".pp-reg .ok{background:rgba(34,160,107,.14);color:#2fbf7f;border-color:transparent;font-weight:700}.pp-reg .no{background:rgba(224,83,61,.14);color:#ff7a66;border-color:transparent;font-weight:700}.pp-reg .mut{border:0}" +
    ".pp-tip{font-size:12.5px;color:var(--sub);margin:4px 0 8px}" +
    ".pp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}" +
    ".pp-f{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;background:var(--panel2);border:1.5px solid var(--line);border-radius:14px;padding:10px 9px 9px;color:var(--text);font:inherit;min-width:0}" +
    ".pp-f .pp-i{font-size:20px;line-height:1}.pp-f b{font-size:13.5px;letter-spacing:-.3px}.pp-f small{font-size:10.5px;color:var(--sub);line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}" +
    ".pp-f.on{border-color:var(--fc);box-shadow:inset 0 0 0 1px var(--fc)}.pp-f em{position:absolute;right:7px;top:6px;font-style:normal;font-weight:900;color:#fff;background:var(--fc);width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px}" +
    ".pp-in{display:grid;gap:8px}.pp-in label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub);font-weight:700}" +
    ".pp-in input,.pp-ar input{background:var(--panel2);border:1px solid var(--line);border-radius:12px;color:var(--text);font:inherit;font-size:16px;padding:10px 12px;width:100%;box-sizing:border-box}" +
    ".pp-amt{border-left:4px solid var(--fc);padding:8px 0 10px 11px;margin-bottom:10px}.pp-an{display:flex;align-items:center;gap:6px;font-size:14px}.pp-aw{margin-left:auto;color:var(--sub);font-size:13px}" +
    ".pp-ar{display:flex;align-items:center;gap:8px;margin:6px 0}.pp-ar span{color:var(--sub);font-size:13px;flex:none}" +
    ".pp-q{display:flex;gap:6px;flex-wrap:wrap}.pp-q button{border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:99px;padding:5px 11px;font:inherit;font-size:12.5px}.pp-q button.on{background:var(--fc);color:#fff;border-color:transparent;font-weight:700}" +
    ".pp-tot{text-align:right;font-size:14px;color:var(--sub);border-top:1px solid var(--line);padding-top:8px}.pp-tot b{color:var(--text);font-size:17px;margin-left:6px}" +
    ".pp-go{display:grid;gap:8px}.pp-go button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:13px 14px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:15.5px;font-weight:800}" +
    ".pp-go button small{font-size:11.5px;color:var(--sub);font-weight:500}.pp-go button.main{background:var(--c,#7c9cff);color:#111;border-color:transparent}.pp-go button.main small{color:rgba(0,0,0,.65)}" +
    ".pp-go button.ready{background:#22a06b;color:#fff;border-color:transparent}.pp-go button.ready small{color:rgba(255,255,255,.85)}.pp-go button:disabled{opacity:.7}" +
    ".pp-st{font-size:12.5px;margin:8px 2px 0;min-height:1em}.pp-pv-h{font-size:13px;font-weight:800;margin:14px 0 6px}" +
    ".pp-pv{border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#f5f7fb;position:relative}.pp-pv-in{pointer-events:none}" +
    "@media (min-width:560px){.pp-grid{grid-template-columns:repeat(5,1fr)}.pp-go{grid-template-columns:repeat(3,1fr)}}";
  document.head.appendChild(css);
})();
