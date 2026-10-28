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
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
      (top ? '<div style="font-size:' + Math.round(size * 0.075) + 'px;color:' + SUB + ';font-weight:700">' + e(top) + '</div>' : '') +
      (bot ? '<div style="font-size:' + Math.round(size * 0.12) + 'px;color:' + INK + ';font-weight:800;letter-spacing:-1px;line-height:1.15">' + e(bot) + '</div>' : '') + '</div></div>';
  }
  function lineSvg(vals, w, h, color){
    var v = vals.filter(function(x){ return x != null; }); if (v.length < 2) return "";
    var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), pad = (mx - mn) * 0.08 || 1; mn -= pad; mx += pad;
    var pts = vals.map(function(x, i){ return x == null ? null : [i / (vals.length - 1) * w, h - (x - mn) / (mx - mn) * h]; }).filter(Boolean);
    var d = pts.map(function(p, i){ return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = d + " L" + w + " " + h + " L0 " + h + " Z", last = pts[pts.length - 1];
    var grid = [0.25, 0.5, 0.75].map(function(f){ return '<line x1="0" x2="' + w + '" y1="' + (h * f) + '" y2="' + (h * f) + '" stroke="#e8ecf2" stroke-width="1"/>'; }).join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + grid +
      '<path d="' + area + '" fill="' + color + '" fill-opacity="0.10"/><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="5" fill="' + color + '" stroke="#fff" stroke-width="2"/></svg>';
  }
  function lineBox(ch, w, h, color, fs){
    if (!ch || !ch.vals || ch.vals.length < 2) return "";
    var v = ch.vals.filter(function(x){ return x != null; }), lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), last = v[v.length - 1], first = v[0];
    var f = function(x){ return ch.unit === "%" ? x.toFixed(2) + "%" : Math.round(x).toLocaleString("ko-KR") + (ch.unit || ""); };
    var chg = (last / first - 1) * 100;
    return '<div style="font-size:' + fs + 'px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><b style="color:' + INK + '">' + e(ch.title) + '</b><span style="color:' + SUB + '">지금 <b style="color:' + INK + '">' + f(last) + '</b> · 1년 ' + (ch.unit === "%" ? ((last - first) >= 0 ? "+" : "−") + Math.abs(last - first).toFixed(2) + "%p" : sgn(chg, 1)) + '</span></div>' +
      '<img src="' + svgUrl(lineSvg(ch.vals, w, h, color)) + '" width="' + w + '" height="' + h + '" style="display:block;width:' + w + 'px;height:' + h + 'px">' +
      '<div style="display:flex;justify-content:space-between;color:' + SUB + ';font-size:' + Math.round(fs * 0.85) + 'px;margin-top:4px"><span>' + e((ch.labels[0] || "").slice(0, 7).replace("-", ".")) + '</span><span>최고 ' + f(hi) + ' · 최저 ' + f(lo) + '</span><span>' + e((ch.labels[ch.labels.length - 1] || "").slice(0, 7).replace("-", ".")) + '</span></div></div>';
  }
  function hbars(rows, fs, max){   // rows: [label, value, color, right-text, highlight]
    max = max || Math.max.apply(null, rows.map(function(r){ return +r[1] || 0; })) || 1;
    return rows.map(function(r){
      return '<div style="display:flex;align-items:center;gap:10px;margin:' + Math.round(fs * 0.45) + 'px 0;font-size:' + fs + 'px">' +
        '<div style="width:34%;flex:none;color:' + INK + ';font-weight:' + (r[4] ? 800 : 600) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(r[0]) + '</div>' +
        '<div style="flex:1;height:' + Math.round(fs * 1.05) + 'px;background:#eef1f6;border-radius:99px;overflow:hidden"><div style="height:100%;width:' + Math.max(2, Math.min(100, (+r[1] || 0) / max * 100)) + '%;background:' + (r[2] || NAVY) + ';border-radius:99px"></div></div>' +
        '<div style="width:22%;flex:none;text-align:right;font-weight:800;color:' + INK + '">' + e(r[3] != null ? r[3] : r[1]) + '</div></div>';
    }).join("");
  }
  function vbars(ch, w, h, fs){   // 세로 막대 (국고채 곡선 · ELS 이자)
    var vals = ch.vals || [], n = vals.length; if (!n) return "";
    var mx = Math.max.apply(null, vals), mn = Math.min(0, Math.min.apply(null, vals)), bw = Math.max(4, w / n - 4);
    var cols = vals.map(function(v, i){ var hl = ch.hl && ch.hl[i]; var bh = Math.max(3, (v - mn) / (mx - mn || 1) * (h - fs * 1.6));
      return '<div style="width:' + bw + 'px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end">' +
        (hl ? '<div style="font-size:' + Math.round(fs * 0.8) + 'px;font-weight:800;color:' + NAVY + ';white-space:nowrap">' + (+v).toFixed(ch.unit === "%" && v < 30 ? 1 : 0) + '</div>' : '') +
        '<div style="width:100%;height:' + bh + 'px;border-radius:4px 4px 0 0;background:' + (hl ? "#f08a3c" : "#c9d3e3") + '"></div></div>'; }).join("");
    return '<div style="font-size:' + fs + 'px;color:' + INK + ';font-weight:700;margin-bottom:6px">' + e(ch.title) + '</div>' +
      '<div style="display:flex;align-items:flex-end;justify-content:space-between;height:' + h + 'px;border-bottom:1px solid ' + LINE + '">' + cols + '</div>' +
      '<div style="display:flex;justify-content:space-between;font-size:' + Math.round(fs * 0.8) + 'px;color:' + SUB + ';margin-top:4px"><span>' + e(ch.labels[0]) + '</span><span><span style="display:inline-block;width:10px;height:10px;background:#f08a3c;border-radius:2px"></span> 제안에 담은 것</span><span>' + e(ch.labels[n - 1]) + '</span></div>';
  }

  /* ───────── 계산 ───────── */
  function lines(f, amt){ return (f.alloc || []).map(function(a){ return {a: a, won: amt * (+a.pct || 0) / 100}; }); }
  function income(f, amt){   // 연 예상 이자 (채권·ELS)
    if (f.avg == null) return null;
    var lab = {ktb: "예상 연 이자 (세후)", ust: "예상 연 이자 (달러 기준)", brl: "예상 연 이자 (현지 통화 기준)", els: "조건 충족 시 연 이자"}[f.key];
    return lab ? {lab: lab, won: amt * f.avg / 100, pct: f.avg} : null;
  }
  function taxLine(f){
    if (!f.tax) return null;
    var L = f.tax.limit * 10000;
    return f.tax.rates.map(function(r){ return {rate: r[0], who: r[1], won: L * r[0] / 100, full: Math.round(L * r[0] / 100).toLocaleString("ko-KR") + "원"}; });
  }
  function model(){
    var items = ST.sel.map(function(k){ var f = form(k); return f ? {f: f, amt: amtOf(k)} : null; }).filter(Boolean);
    return {cust: (ST.cust || "").trim(), pb: (ME.pb || "").trim(), org: (ME.org || "").trim(), date: dlabel(), items: items,
            total: items.reduce(function(s, x){ return s + x.amt; }, 0), M: DATA.market || {}, notice: DATA.notice || [], basis: DATA.basis || ""};
  }
  function titleOf(m){ return m.items.length === 1 ? m.items[0].f.title : m.items.map(function(x){ return x.f.short; }).slice(0, 3).join(" · ") + (m.items.length > 3 ? " 외 " + (m.items.length - 3) : "") + " 포트폴리오"; }
  function custName(m){ return m.cust ? m.cust + " 고객님" : "고객님"; }
  function byLine(m){ return [m.org, m.pb ? m.pb + (/PB|팀장|부장|이사|대리|과장|차장|매니저|상무|센터장|지점장/.test(m.pb) ? "" : " PB") : ""].filter(Boolean).join(" · "); }

  /* ═════════ ① 원페이지 (전송용 그림 1080px) ═════════ */
  function kpiTiles(M, n, fs, cols){
    var k = (M.kpis || []).slice(0, n);
    return '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:' + Math.round(fs * 0.5) + 'px">' + k.map(function(x){
      var c = x.chg == null ? SUB : x.chg > 0 ? UP : x.chg < 0 ? DN : SUB;
      return '<div style="background:#fff;border:1px solid ' + LINE + ';border-radius:' + Math.round(fs * 0.6) + 'px;padding:' + Math.round(fs * 0.55) + 'px ' + Math.round(fs * 0.6) + 'px">' +
        '<div style="font-size:' + Math.round(fs * 0.72) + 'px;color:' + SUB + ';font-weight:700">' + e(x.label) + (x.asof ? ' <span style="font-weight:500">' + e(x.asof) + '</span>' : '') + '</div>' +
        '<div style="font-size:' + Math.round(fs * 1.25) + 'px;font-weight:800;color:' + INK + ';letter-spacing:-0.5px">' + e(x.value) + '</div>' +
        '<div style="font-size:' + Math.round(fs * 0.78) + 'px;font-weight:800;color:' + c + '">' + (x.chg == null ? "&nbsp;" : (x.chg > 0 ? "▲ " : x.chg < 0 ? "▼ " : "") + Math.abs(x.chg).toFixed(2) + "%") + '</div></div>';
    }).join("") + '</div>';
  }
  function trendRows(M, fs){
    return (M.trend || []).map(function(t, i){ var ok = i === 0 ? M.us_up : M.kr_up;
      return '<div style="display:flex;gap:10px;align-items:flex-start;font-size:' + fs + 'px;line-height:1.45;margin-top:' + Math.round(fs * 0.4) + 'px;color:' + INK + '">' +
        '<span style="flex:none;margin-top:' + Math.round(fs * 0.25) + 'px;width:' + Math.round(fs * 0.7) + 'px;height:' + Math.round(fs * 0.7) + 'px;border-radius:50%;background:' + (ok ? "#22a06b" : "#e0533d") + '"></span><span>' + e(t.replace(/^🇺🇸 |^🇰🇷 /, "")) + '</span></div>'; }).join("");
  }
  function legend(ls, fs, showWon){
    return ls.map(function(l){ var a = l.a;
      return '<div style="display:flex;align-items:center;gap:' + Math.round(fs * 0.5) + 'px;padding:' + Math.round(fs * 0.45) + 'px 0;border-bottom:1px solid ' + LINE + ';font-size:' + fs + 'px">' +
        '<span style="flex:none;width:' + Math.round(fs * 0.75) + 'px;height:' + Math.round(fs * 0.75) + 'px;border-radius:3px;background:' + a.color + '"></span>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:800;color:' + INK + '">' + e(a.name) + '</div><div style="font-size:' + Math.round(fs * 0.78) + 'px;color:' + SUB + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(a.inst || "") + (a.code && String(a.code).length < 12 ? " (" + e(a.code) + ")" : "") + '</div></div>' +
        '<div style="text-align:right;flex:none"><div style="font-weight:800;color:' + INK + '">' + pc(a.pct) + '</div>' + (showWon ? '<div style="font-size:' + Math.round(fs * 0.8) + 'px;color:' + NAVY + ';font-weight:700">' + man(l.won) + '</div>' : '') + '</div></div>';
    }).join("");
  }
  function onePage(m){
    var W = 1080, fs = 27, M = m.M, multi = m.items.length > 1;
    var h = '<div class="ppx" style="width:' + W + 'px;background:' + BG + ';font-family:' + FONT + ';color:' + INK + ';padding-bottom:28px">';
    // 머리
    h += '<div style="background:linear-gradient(135deg,' + NAVY + ' 0%,#24508a 100%);color:#fff;padding:52px 56px 46px;position:relative;overflow:hidden">' +
      '<div style="position:absolute;right:-90px;top:-90px;width:360px;height:360px;border-radius:50%;background:rgba(255,255,255,.06)"></div>' +
      '<div style="position:absolute;right:120px;bottom:-140px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.05)"></div>' +
      '<div style="font-size:24px;opacity:.85;font-weight:700;letter-spacing:1px">INVESTMENT PROPOSAL · ' + e(m.date) + '</div>' +
      '<div style="font-size:52px;font-weight:800;letter-spacing:-1.5px;margin-top:14px;line-height:1.2">' + e(custName(m)) + '을 위한<br>' + e(titleOf(m)) + '</div>' +
      (m.total ? '<div style="display:inline-block;margin-top:22px;background:rgba(255,255,255,.14);border-radius:16px;padding:12px 22px;font-size:28px">제안 금액 <b style="font-size:36px">' + man(m.total) + '</b></div>' : '') +
      '</div>';
    // 시장
    h += '<div style="padding:34px 44px 0"><div style="font-size:31px;font-weight:800;margin-bottom:14px">📊 오늘 시장 한눈에</div>' + kpiTiles(M, 4, fs, 4) +
      '<div style="background:#fff;border:1px solid ' + LINE + ';border-radius:18px;padding:12px 22px 16px;margin-top:14px">' + trendRows(M, 25) +
      (M.lead ? '<div style="font-size:24px;color:' + SUB + ';margin-top:10px">💰 돈이 몰리는 곳: <b style="color:' + INK + '">' + e(M.lead) + '</b></div>' : '') + '</div></div>';
    // 여러 상품이면 전체 나눔
    if (multi){
      var parts = m.items.map(function(x, i){ return {pct: m.total ? x.amt / m.total * 100 : 100 / m.items.length, color: x.f.color}; });
      h += '<div style="padding:30px 44px 0"><div style="font-size:31px;font-weight:800;margin-bottom:14px">🧺 전체 나눠 담기</div><div style="background:#fff;border:1px solid ' + LINE + ';border-radius:22px;padding:24px;display:flex;gap:26px;align-items:center">' +
        donut(parts, 260, 52, "합계", m.total ? man(m.total) : m.items.length + "개") + '<div style="flex:1">' +
        m.items.map(function(x){ return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid ' + LINE + ';font-size:26px"><span style="width:20px;height:20px;border-radius:4px;background:' + x.f.color + '"></span><b style="flex:1">' + e(x.f.icon + " " + x.f.short) + '</b><span style="font-weight:800">' + (m.total ? pc(x.amt / m.total * 100) : "") + '</span><span style="width:170px;text-align:right;color:' + NAVY + ';font-weight:800">' + man(x.amt) + '</span></div>'; }).join("") +
        '</div></div></div>';
    }
    // 상품별
    m.items.forEach(function(x){
      var f = x.f, ls = lines(f, x.amt), inc = income(f, x.amt);
      h += '<div style="padding:30px 44px 0"><div style="background:#fff;border:1px solid ' + LINE + ';border-radius:22px;overflow:hidden">' +
        '<div style="background:' + f.color + ';color:#fff;padding:20px 26px;display:flex;align-items:center;gap:14px"><span style="font-size:40px">' + e(f.icon) + '</span><div style="flex:1"><div style="font-size:31px;font-weight:800">' + e(f.title) + '</div><div style="font-size:21px;opacity:.9">' + e(f.sub) + '</div></div>' + (x.amt ? '<div style="font-size:30px;font-weight:800">' + man(x.amt) + '</div>' : '') + '</div>' +
        '<div style="padding:22px 26px 10px;font-size:27px;font-weight:800;line-height:1.45;color:' + NAVY + '">' + e(f.headline) + '</div>' +
        '<div style="display:flex;gap:26px;align-items:center;padding:6px 26px 18px">' + donut(f.alloc, multi ? 230 : 290, multi ? 44 : 56, inc ? "연 " + inc.pct.toFixed(2) + "%" : "비중", inc ? (x.amt ? man(inc.won) : "") : "100%") +
        '<div style="flex:1;min-width:0">' + legend(ls, multi ? 22 : 24, !!x.amt) + '</div></div>' +
        (inc && x.amt ? '<div style="margin:0 26px 18px;background:#f1f6ff;border-radius:14px;padding:12px 18px;font-size:24px">💡 ' + e(inc.lab) + ' 약 <b style="color:' + NAVY + '">' + man(inc.won) + '</b> (연 ' + inc.pct.toFixed(2) + '%)</div>' : '') +
        (f.tax ? '<div style="margin:0 26px 18px;background:#effaf4;border-radius:14px;padding:12px 18px;font-size:24px">🧾 연 ' + f.tax.limit + '만원 넣으면 세액공제 <b>' + taxLine(f).map(function(t){ return t.full + "(" + t.rate + "%)"; }).join(" / ") + '</b></div>' : '') +
        '<div style="padding:0 26px 20px">' + (f.points || []).slice(0, multi ? 2 : 3).map(function(p){ return '<div style="display:flex;gap:10px;font-size:' + (multi ? 22 : 24) + 'px;line-height:1.5;margin-top:8px;color:' + INK + '"><span style="color:' + f.color + ';font-weight:900">✓</span><span>' + e(p) + '</span></div>'; }).join("") + '</div>' +
        '</div></div>';
    });
    // 일정·서명
    if ((M.watch || []).length) h += '<div style="padding:30px 44px 0"><div style="font-size:31px;font-weight:800;margin-bottom:12px">📅 앞으로 지켜볼 일정</div><div style="background:#fff;border:1px solid ' + LINE + ';border-radius:18px;padding:8px 22px">' +
      M.watch.slice(0, 3).map(function(w){ return '<div style="display:flex;gap:16px;padding:12px 0;border-bottom:1px solid ' + LINE + ';font-size:24px"><b style="flex:none;width:170px;color:' + NAVY + '">' + e(w[0]) + '</b><span>' + e(w[1]) + '</span></div>'; }).join("") + '</div></div>';
    h += '<div style="margin:30px 44px 0;padding:22px 26px;border-radius:18px;background:' + NAVY + ';color:#fff;display:flex;align-items:center;gap:18px"><div style="font-size:44px">🤝</div><div style="flex:1"><div style="font-size:21px;opacity:.8">제안</div><div style="font-size:30px;font-weight:800">' + e(byLine(m) || "담당 PB") + '</div></div><div style="font-size:21px;opacity:.8;text-align:right">' + e(m.date) + '</div></div>';
    h += '<div style="padding:18px 48px 0;font-size:17px;line-height:1.55;color:#8a93a3">' + m.notice.slice(0, 2).map(e).join(" · ") + '</div></div>';
    return h;
  }

  /* ═════════ ② 풀버전 PDF (A4 794×1123 쪽마다) ═════════ */
  var PW = 794, PH = 1123;
  function page(inner, n, of, m, color){
    return '<div class="ppx" style="width:' + PW + 'px;height:' + PH + 'px;background:#fff;font-family:' + FONT + ';color:' + INK + ';position:relative;overflow:hidden">' +
      '<div style="height:8px;background:' + (color || NAVY) + '"></div>' +
      '<div style="padding:34px 48px 0">' + inner + '</div>' +
      '<div style="position:absolute;left:48px;right:48px;bottom:26px;display:flex;justify-content:space-between;font-size:11px;color:#98a1b0;border-top:1px solid ' + LINE + ';padding-top:10px"><span>' + e(custName(m)) + ' 투자 제안 · ' + e(m.date) + '</span><span>' + e(byLine(m)) + '</span><span>' + n + ' / ' + of + '</span></div></div>';
  }
  function hTitle(t, sub, color){ return '<div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:18px"><div style="font-size:26px;font-weight:800;letter-spacing:-0.8px;color:' + (color || NAVY) + '">' + t + '</div>' + (sub ? '<div style="font-size:13px;color:' + SUB + ';padding-bottom:4px">' + e(sub) + '</div>' : '') + '</div>'; }
  function box(inner, extra){ return '<div style="background:' + BG + ';border-radius:14px;padding:16px 18px;' + (extra || "") + '">' + inner + '</div>'; }
  function tbl(t, fs){
    if (!t || !t.rows || !t.rows.length) return "";
    return '<div style="font-size:' + (fs + 1) + 'px;font-weight:800;margin:4px 0 8px">' + e(t.title || "") + '</div><table style="width:100%;border-collapse:collapse;font-size:' + fs + 'px">' +
      '<tr>' + t.cols.map(function(c){ return '<th style="text-align:left;background:' + NAVY + ';color:#fff;padding:7px 8px;font-weight:700">' + e(c) + '</th>'; }).join("") + '</tr>' +
      t.rows.map(function(r, i){ return '<tr style="background:' + (i % 2 ? "#f7f9fc" : "#fff") + '">' + r.map(function(c){ return '<td style="padding:6px 8px;border-bottom:1px solid ' + LINE + ';vertical-align:top">' + e(c) + '</td>'; }).join("") + '</tr>'; }).join("") + '</table>';
  }
  function chartHtml(f, w, fs){
    var ch = f.chart || {};
    if (ch.type === "line") return lineBox(ch, w, 150, f.color, fs) + (ch.chart2 ? '<div style="height:14px"></div>' + lineBox(ch.chart2, w, 120, "#7b5cff", fs) : "");
    if (ch.type === "bar" && ch.labels && ch.labels.length > 6) return vbars(ch, w, 170, fs);
    if (ch.type === "bar") return '<div style="font-size:' + fs + 'px;font-weight:700;margin-bottom:4px">' + e(ch.title) + '</div>' + hbars(ch.labels.map(function(l, i){ return [l, ch.vals[i], f.color, ch.vals[i] + (ch.unit || "")]; }), fs, 100);
    // 도넛형 폼: 위험·안전 나눔 또는 칸별 막대
    var risky = (f.alloc || []).filter(function(a){ return a.kind === "위험"; }).reduce(function(s, a){ return s + a.pct; }, 0);
    return '<div style="font-size:' + fs + 'px;font-weight:700;margin-bottom:4px">칸별 비중</div>' + hbars(f.alloc.map(function(a){ return [a.name, a.pct, a.color, pc(a.pct)]; }), fs, 100) +
      (ch.split ? '<div style="margin-top:12px;font-size:' + fs + 'px"><div style="display:flex;height:26px;border-radius:8px;overflow:hidden;font-weight:800;color:#fff;font-size:' + (fs - 1) + 'px"><div style="width:' + risky + '%;background:#e0533d;display:flex;align-items:center;justify-content:center">위험자산 ' + pc(risky) + '</div><div style="flex:1;background:#3fb28f;display:flex;align-items:center;justify-content:center">안전자산 ' + pc(100 - risky) + '</div></div><div style="color:' + SUB + ';margin-top:5px;font-size:' + (fs - 1) + 'px">법정 한도: 위험자산 70% 이하</div></div>' : '');
  }
  function fullPages(m){
    var P = [], M = m.M;
    // 표지
    P.push(function(n, of){ return '<div class="ppx" style="width:' + PW + 'px;height:' + PH + 'px;background:linear-gradient(160deg,' + NAVY + ' 0%,#1f4d86 60%,#2b6cb0 100%);font-family:' + FONT + ';position:relative;overflow:hidden"><div style="position:absolute;inset:0;color:#fff">' +
      '<div style="position:absolute;right:-160px;top:-120px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.06)"></div><div style="position:absolute;left:-120px;bottom:-160px;width:420px;height:420px;border-radius:50%;background:rgba(255,255,255,.05)"></div>' +
      '<div style="padding:120px 70px 0;position:relative"><div style="font-size:16px;letter-spacing:4px;opacity:.8;font-weight:700">INVESTMENT PROPOSAL</div>' +
      '<div style="font-size:24px;margin-top:40px;opacity:.9">' + e(custName(m)) + '을 위한</div><div style="font-size:46px;font-weight:800;letter-spacing:-1.5px;line-height:1.25;margin-top:8px">' + e(titleOf(m)) + '<br>투자 제안서</div>' +
      '<div style="width:70px;height:5px;background:#f0b43c;margin:34px 0"></div>' +
      (m.total ? '<div style="font-size:18px;opacity:.85">제안 금액</div><div style="font-size:40px;font-weight:800;margin-top:4px">' + man(m.total) + '</div>' : '') +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:30px">' + m.items.map(function(x){ return '<span style="background:rgba(255,255,255,.14);border-radius:99px;padding:8px 16px;font-size:16px;font-weight:700">' + e(x.f.icon + " " + x.f.short) + (x.amt ? " · " + man(x.amt) : "") + '</span>'; }).join("") + '</div></div>' +
      '<div style="position:absolute;left:70px;right:70px;bottom:70px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,.25);padding-top:22px"><div><div style="font-size:14px;opacity:.75">제안</div><div style="font-size:24px;font-weight:800;margin-top:4px">' + e(byLine(m) || "담당 PB") + '</div></div><div style="font-size:16px;opacity:.85">' + e(m.date) + '</div></div></div></div>'; });
    // 시장
    P.push(function(n, of){
      var sc = (M.scen || []);
      var inner = hTitle("📊 오늘 시장 한눈에", M.date ? M.date + " " + (M.edition || "") + " 시황 기준" : "") + kpiTiles(M, 6, 17, 3) +
        '<div style="height:16px"></div>' + box('<div style="font-size:16px;font-weight:800;margin-bottom:2px">🧭 큰 흐름</div>' + trendRows(M, 15)) +
        (M.one ? '<div style="height:14px"></div>' + box('<div style="font-size:16px;font-weight:800;margin-bottom:6px">📰 어제·오늘 한 줄</div><div style="font-size:15px;line-height:1.6">' + e(M.one) + '</div>' + (M.talk || []).map(function(t){ return '<div style="font-size:13.5px;line-height:1.6;color:' + SUB + ';margin-top:4px">· ' + e(t) + '</div>'; }).join("")) : '') +
        (sc.length ? '<div style="height:14px"></div>' + box('<div style="font-size:16px;font-weight:800;margin-bottom:4px">🔮 앞으로 시나리오 (가능성)</div>' + hbars(sc.map(function(s){ return [s.label, s.pct, s.color || NAVY, s.pct + "%"]; }), 14, 100)) : '') +
        (M.lead ? '<div style="height:14px"></div>' + box('<div style="font-size:16px;font-weight:800;margin-bottom:6px">💰 요즘 돈이 몰리는 곳</div><div style="font-size:14.5px;line-height:1.6">' + e(M.lead) + '</div>') : '') +
        ((M.watch || []).length ? '<div style="height:14px"></div>' + box('<div style="font-size:16px;font-weight:800;margin-bottom:4px">📅 지켜볼 일정</div>' + M.watch.map(function(w){ return '<div style="display:flex;gap:14px;padding:6px 0;font-size:14px;border-bottom:1px solid ' + LINE + '"><b style="flex:none;width:110px;color:' + NAVY + '">' + e(w[0]) + '</b><span>' + e(w[1]) + '</span></div>'; }).join("")) : '');
      return page(inner, n, of, m);
    });
    // 요약 (여러 상품)
    if (m.items.length > 1) P.push(function(n, of){
      var parts = m.items.map(function(x){ return {pct: m.total ? x.amt / m.total * 100 : 100 / m.items.length, color: x.f.color}; });
      var inner = hTitle("🧺 제안 한눈에", "상품별 금액과 핵심") + '<div style="display:flex;gap:30px;align-items:center;margin-bottom:22px">' + donut(parts, 230, 46, "합계", m.total ? man(m.total) : "") +
        '<div style="flex:1">' + m.items.map(function(x){ return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid ' + LINE + ';font-size:15px"><span style="width:14px;height:14px;border-radius:3px;background:' + x.f.color + '"></span><b style="flex:1">' + e(x.f.icon + " " + x.f.title) + '</b><span style="font-weight:800">' + (m.total ? pc(x.amt / m.total * 100) : "") + '</span><span style="width:120px;text-align:right;color:' + NAVY + ';font-weight:800">' + man(x.amt) + '</span></div>'; }).join("") + '</div></div>' +
        (m.items.length > 4 ? m.items.map(function(x){ return '<div style="display:flex;gap:10px;font-size:12.5px;line-height:1.45;padding:7px 10px;margin-bottom:6px;background:' + BG + ';border-radius:10px;border-left:5px solid ' + x.f.color + '"><b style="flex:none;width:92px;color:' + x.f.color + '">' + e(x.f.short) + '</b><span>' + e(x.f.headline) + '</span></div>'; }).join("")
          : m.items.map(function(x){ return box('<div style="font-size:15px;font-weight:800;color:' + x.f.color + '">' + e(x.f.icon + " " + x.f.short) + '</div><div style="font-size:14px;line-height:1.55;margin-top:4px">' + e(x.f.headline) + '</div>', "margin-bottom:10px;border-left:5px solid " + x.f.color); }).join(""));
      return page(inner, n, of, m);
    });
    // 상품마다 두 쪽
    m.items.forEach(function(x){
      var f = x.f, ls = lines(f, x.amt), inc = income(f, x.amt);
      P.push(function(n, of){
        var inner = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px"><div style="font-size:42px">' + e(f.icon) + '</div><div><div style="font-size:26px;font-weight:800;letter-spacing:-0.8px;color:' + f.color + '">' + e(f.title) + '</div><div style="font-size:13.5px;color:' + SUB + '">' + e(f.sub) + '</div></div></div>' +
          '<div style="background:' + f.color + ';color:#fff;border-radius:14px;padding:16px 20px;font-size:17px;font-weight:800;line-height:1.5">' + e(f.headline) + '</div>' +
          '<div style="display:flex;gap:26px;align-items:center;margin:22px 0 10px">' + donut(f.alloc, 250, 50, inc ? "연 " + inc.pct.toFixed(2) + "%" : (x.amt ? "제안 금액" : "비중"), inc && x.amt ? man(inc.won) : (x.amt ? man(x.amt) : "100%")) +
          '<div style="flex:1;min-width:0">' + legend(ls, 15, !!x.amt) + '</div></div>' +
          (inc && x.amt ? box('💡 ' + e(inc.lab) + ' 약 <b style="color:' + NAVY + '">' + man(inc.won) + '</b> (연 ' + inc.pct.toFixed(2) + '%) — 금리·조건이 바뀌면 달라짐', "font-size:14px;margin-bottom:12px;background:#f1f6ff") : '') +
          '<div style="font-size:17px;font-weight:800;margin:14px 0 6px">🤔 왜 이렇게 담나</div>' +
          (f.points || []).map(function(p, i){ return '<div style="display:flex;gap:10px;font-size:14.5px;line-height:1.6;padding:7px 0;border-bottom:1px solid ' + LINE + '"><span style="flex:none;width:22px;height:22px;border-radius:50%;background:' + f.color + ';color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center">' + (i + 1) + '</span><span>' + e(p) + '</span></div>'; }).join("") +
          '<div style="display:flex;gap:12px;margin-top:16px">' + box('<div style="font-size:13px;color:' + SUB + ';font-weight:700">🙋 이런 분께</div><div style="font-size:14px;margin-top:4px;line-height:1.5">' + e(f.fit) + '</div>', "flex:1") +
          box('<div style="font-size:13px;color:' + SUB + ';font-weight:700">🏷️ 특징</div><div style="margin-top:6px">' + (f.tags || []).map(function(t){ return '<span style="display:inline-block;background:#fff;border:1px solid ' + LINE + ';border-radius:99px;padding:3px 10px;font-size:12.5px;margin:0 6px 6px 0">' + e(t) + '</span>'; }).join("") + '</div>', "flex:1") + '</div>';
        return page(inner, n, of, m, f.color);
      });
      P.push(function(n, of){
        var rows = ls.map(function(l){ return [l.a.name, (l.a.inst || "") + (l.a.code && String(l.a.code).length < 12 ? " (" + l.a.code + ")" : ""), pc(l.a.pct), x.amt ? man(l.won) : "–"]; });
        var inner = hTitle(e(f.icon) + " " + e(f.short) + " — 자세히", "무엇을 얼마나", f.color) +
          tbl({title: "🧾 담을 상품과 금액", cols: ["칸", "상품", "비중", "금액"], rows: rows}, 12.5) +
          '<div style="font-size:12px;color:' + SUB + ';margin-top:6px;line-height:1.5">' + ls.map(function(l){ return "· " + e(l.a.name) + ": " + e(l.a.why); }).join("<br>") + '</div>' +
          '<div style="height:16px"></div>' + box(chartHtml(f, PW - 96 - 36, 13)) +
          (f.tax ? '<div style="height:12px"></div>' + box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">🧾 세액공제 계산 (연 ' + f.tax.limit + '만원 넣을 때)</div>' + taxLine(f).map(function(t){ return '<div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0;border-bottom:1px solid ' + LINE + '"><span>' + e(t.who) + ' · ' + t.rate + '%</span><b style="color:' + NAVY + '">' + t.full + ' 돌려받음</b></div>'; }).join("") + '<div style="font-size:12px;color:' + SUB + ';margin-top:6px">' + e(f.tax.note) + '</div>', "background:#effaf4") : '') +
          (f.split && x.amt ? '<div style="height:12px"></div>' + box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">🪜 나눠 사기 계획</div>' + ["오늘", "2주 뒤", "한 달 뒤"].map(function(w, i){ return '<div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0;border-bottom:1px solid ' + LINE + '"><span>' + (i + 1) + '회차 · ' + w + '</span><b>' + f.split[i] + '% · ' + man(x.amt * (100 - (f.alloc.filter(function(a){ return a.k === "cd"; })[0] || {pct: 0}).pct) / 100 * f.split[i] / 100) + '</b></div>'; }).join("") + '<div style="font-size:12px;color:' + SUB + ';margin-top:6px">주식 칸 금액을 3번에 나눔 — 그 사이 돈은 CD금리 ETF에서 이자를 받음</div>') : '') +
          (f.table && f.table.rows && f.table.rows.length && f.key !== "kr_stock" && !(f.tax || f.split) ? '<div style="height:14px"></div>' + tbl({title: f.table.title, cols: f.table.cols, rows: f.table.rows.slice(0, f.key === "els" ? 7 : 8)}, f.key === "els" ? 10.5 : 11.5) : '') +
          '<div style="height:14px"></div>' + box('<div style="font-size:15px;font-weight:800;margin-bottom:4px;color:#b3372a">⚠️ 꼭 알아 둘 점</div>' + (f.risks || []).map(function(r){ return '<div style="font-size:13px;line-height:1.55;padding:3px 0">· ' + e(r) + '</div>'; }).join(""), "background:#fff4f2");
        return page(inner, n, of, m, f.color);
      });
    });
    // 유의사항
    P.push(function(n, of){
      var inner = hTitle("📌 투자 전 꼭 확인하실 점") + m.notice.map(function(t, i){ return '<div style="display:flex;gap:12px;font-size:15px;line-height:1.65;padding:12px 0;border-bottom:1px solid ' + LINE + '"><b style="color:' + NAVY + '">' + (i + 1) + '</b><span>' + e(t) + '</span></div>'; }).join("") +
        '<div style="height:24px"></div>' + box('<div style="font-size:14px;color:' + SUB + ';line-height:1.7">이 제안서는 ' + e(m.basis) + ' 자료로 만들었음. 시장 상황에 따라 배분과 상품은 매일 바뀔 수 있음.</div>') +
        '<div style="margin-top:60px;display:flex;justify-content:space-between;align-items:flex-end"><div><div style="font-size:14px;color:' + SUB + '">제안</div><div style="font-size:24px;font-weight:800;margin-top:6px">' + e(byLine(m) || "담당 PB") + '</div></div><div style="text-align:right"><div style="font-size:14px;color:' + SUB + '">' + e(custName(m)) + ' 확인</div><div style="width:200px;border-bottom:1px solid #9aa3b2;height:40px"></div></div></div>';
      return page(inner, n, of, m);
    });
    var of = P.length;
    return P.map(function(fn, i){ return fn(i + 1, of); });
  }

  /* ───────── 그림 찍기 ───────── */
  var HOST = null;
  function host(){ if (!HOST || !document.body.contains(HOST)){ HOST = document.createElement("div"); HOST.id = "ppxhost"; HOST.setAttribute("aria-hidden", "true");
      HOST.style.cssText = "position:fixed;left:-20000px;top:0;z-index:-1;pointer-events:none;"; document.body.appendChild(HOST); } return HOST; }
  function needLib(){ return new Promise(function(ok, no){ if (window.html2pdf) return ok(); var s = document.createElement("script"); s.src = "lib/html2pdf.bundle.min.js"; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("PDF 도구를 못 받음")); }; document.head.appendChild(s); }); }
  function needPpt(){ return new Promise(function(ok, no){ if (window.PptxGenJS) return ok(); var s = document.createElement("script"); s.src = "lib/pptxgen.bundle.js?v=1"; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("PPT 도구를 못 받음")); }; document.head.appendChild(s); }); }
  function imgsReady(el){ return Promise.all([].map.call(el.querySelectorAll("img"), function(i){ return i.complete && i.naturalWidth ? 1 : new Promise(function(r){ i.onload = i.onerror = function(){ r(); }; setTimeout(r, 3000); }); })); }
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function snap(html, w, scale){
    var H = host(); H.innerHTML = html; var el = H.firstChild;
    return imgsReady(el).then(function(){
      var h = Math.ceil(el.getBoundingClientRect().height);
      return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [w, h], orientation: "portrait", hotfixes: ["px_scaling"]},
        html2canvas: {scale: scale, backgroundColor: "#ffffff", useCORS: true, logging: false, scrollX: 0, scrollY: 0, windowWidth: w, width: w, height: h}}).from(el).toCanvas().get("canvas")
        .then(function(c){ H.innerHTML = ""; return c; });
    });
  }
  function shareBlob(blob, name, mime){
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
      return pages.reduce(function(p, html, i){
        return p.then(function(){ return snap(html, PW, IOS ? 1.6 : 2).then(function(c){
          var url = c.toDataURL("image/jpeg", 0.9); c.width = c.height = 0;
          if (!pdf){ return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [PW, PH], orientation: "portrait", hotfixes: ["px_scaling"]}}).from(document.createElement("div")).toPdf().get("pdf").then(function(P0){ pdf = P0; pdf.addImage(url, "JPEG", 0, 0, PW, PH); }); }
          pdf.addPage([PW, PH], "portrait"); pdf.addImage(url, "JPEG", 0, 0, PW, PH);
        }); });
      }, Promise.resolve());
    }).then(function(){ return pdf.output("blob"); });
  }

  /* ═════════ ③ PPT (16:9 · 맑은 고딕 · 차트는 PPT 안에서 고칠 수 있는 진짜 차트) ═════════ */
  function hx(c){ return String(c || "#14304f").replace("#", "").toUpperCase(); }
  function makePpt(m){
    return needPpt().then(function(){
      var P = new PptxGenJS(), F = "맑은 고딕", M = m.M;
      P.layout = "LAYOUT_WIDE"; P.theme = {headFontFace: F, bodyFontFace: F}; P.title = custName(m) + " 투자 제안서"; P.author = byLine(m) || "PB";
      function T(s, text, o){ var d = {fontFace: F, fontSize: 14, color: "1D2533", valign: "top", margin: 0}; for (var k in o) d[k] = o[k]; s.addText(text, d); }
      function head(s, t, sub, color){ s.background = {color: "FFFFFF"}; s.addShape(P.ShapeType.rect, {x: 0, y: 0, w: 13.333, h: 0.12, fill: {color: hx(color || NAVY)}, line: {color: hx(color || NAVY)}});
        T(s, t, {x: 0.6, y: 0.35, w: 9.5, h: 0.6, fontSize: 26, bold: true, color: hx(color || NAVY)}); if (sub) T(s, sub, {x: 0.6, y: 0.95, w: 12, h: 0.35, fontSize: 12, color: "5B6576"});
        T(s, custName(m) + " 투자 제안 · " + m.date + (byLine(m) ? " · " + byLine(m) : ""), {x: 0.6, y: 7.05, w: 12.1, h: 0.3, fontSize: 9, color: "98A1B0"}); }
      function rbox(s, x, y, w, h, fill){ s.addShape(P.ShapeType.roundRect, {x: x, y: y, w: w, h: h, fill: {color: hx(fill || BG)}, line: {color: hx(fill || BG)}, rectRadius: 0.12}); }
      // 표지
      var s = P.addSlide(); s.background = {color: hx(NAVY)};
      s.addShape(P.ShapeType.ellipse, {x: 9.3, y: -1.6, w: 5.6, h: 5.6, fill: {color: "FFFFFF", transparency: 93}, line: {color: "FFFFFF", transparency: 100}});
      T(s, "INVESTMENT PROPOSAL", {x: 0.9, y: 1.1, w: 8, h: 0.4, fontSize: 13, color: "C9D6EA", bold: true, charSpacing: 4});
      T(s, custName(m) + "을 위한", {x: 0.9, y: 1.9, w: 11, h: 0.5, fontSize: 20, color: "E6EDF7"});
      T(s, titleOf(m) + " 투자 제안서", {x: 0.9, y: 2.45, w: 11.5, h: 1.3, fontSize: 38, bold: true, color: "FFFFFF"});
      s.addShape(P.ShapeType.rect, {x: 0.9, y: 3.95, w: 0.8, h: 0.07, fill: {color: "F0B43C"}, line: {color: "F0B43C"}});
      if (m.total) { T(s, "제안 금액", {x: 0.9, y: 4.3, w: 4, h: 0.35, fontSize: 13, color: "C9D6EA"}); T(s, man(m.total), {x: 0.9, y: 4.65, w: 6, h: 0.7, fontSize: 32, bold: true, color: "FFFFFF"}); }
      T(s, m.items.map(function(x){ return x.f.short + (x.amt ? " " + man(x.amt) : ""); }).join("   ·   "), {x: 0.9, y: 5.55, w: 11.5, h: 0.4, fontSize: 13, color: "E6EDF7"});
      T(s, "제안  " + (byLine(m) || "담당 PB"), {x: 0.9, y: 6.55, w: 8, h: 0.4, fontSize: 16, bold: true, color: "FFFFFF"});
      T(s, m.date, {x: 8.9, y: 6.6, w: 3.6, h: 0.35, fontSize: 12, color: "C9D6EA", align: "right"});
      // 시장
      s = P.addSlide(); head(s, "📊 오늘 시장 한눈에", (M.date || "") + " " + (M.edition || "") + " 시황 기준");
      (M.kpis || []).slice(0, 6).forEach(function(k, i){ var x = 0.6 + (i % 3) * 2.15, y = 1.45 + Math.floor(i / 3) * 1.25;
        rbox(s, x, y, 2.0, 1.1); T(s, k.label + (k.asof ? " " + k.asof : ""), {x: x + 0.15, y: y + 0.1, w: 1.8, h: 0.3, fontSize: 10, color: "5B6576", bold: true});
        T(s, k.value, {x: x + 0.15, y: y + 0.38, w: 1.8, h: 0.4, fontSize: 19, bold: true});
        T(s, k.chg == null ? "" : (k.chg > 0 ? "▲ " : k.chg < 0 ? "▼ " : "") + Math.abs(k.chg).toFixed(2) + "%", {x: x + 0.15, y: y + 0.76, w: 1.8, h: 0.28, fontSize: 11, bold: true, color: k.chg > 0 ? hx(UP) : k.chg < 0 ? hx(DN) : "5B6576"}); });
      rbox(s, 0.6, 4.05, 6.3, 2.8);
      T(s, "🧭 큰 흐름", {x: 0.8, y: 4.15, w: 6, h: 0.35, fontSize: 14, bold: true});
      T(s, (M.trend || []).map(function(t){ return {text: t, options: {bullet: true, breakLine: true}}; }).concat(M.one ? [{text: "어제·오늘: " + M.one, options: {bullet: true, breakLine: true}}] : []).concat(M.lead ? [{text: "돈이 몰리는 곳: " + M.lead, options: {bullet: true}}] : []), {x: 0.8, y: 4.55, w: 5.9, h: 2.2, fontSize: 12, paraSpaceAfter: 6, valign: "top"});
      if ((M.scen || []).length){ T(s, "🔮 앞으로 시나리오 (가능성 %)", {x: 7.3, y: 1.45, w: 5.4, h: 0.35, fontSize: 14, bold: true});
        s.addChart(P.ChartType.bar, [{name: "가능성", labels: M.scen.map(function(c){ return c.label; }), values: M.scen.map(function(c){ return c.pct; })}],
          {x: 7.2, y: 1.85, w: 5.6, h: 2.4, barDir: "bar", chartColors: M.scen.map(function(c){ return hx(c.color); }), showValue: true, dataLabelFormatCode: '0"%"', dataLabelFontFace: F, dataLabelFontSize: 11, catAxisLabelFontFace: F, catAxisLabelFontSize: 11, valAxisHidden: true, valGridLine: {style: "none"}, catAxisOrientation: "maxMin", showLegend: false, barGapWidthPct: 60}); }
      if ((M.watch || []).length){ T(s, "📅 지켜볼 일정", {x: 7.3, y: 4.45, w: 5.4, h: 0.35, fontSize: 14, bold: true});
        s.addTable(M.watch.map(function(w){ return [{text: w[0], options: {bold: true, color: hx(NAVY)}}, w[1]]; }), {x: 7.3, y: 4.85, w: 5.5, colW: [1.4, 4.1], fontFace: F, fontSize: 11, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", rowH: 0.42}); }
      // 요약
      if (m.items.length > 1){ s = P.addSlide(); head(s, "🧺 제안 한눈에", "상품별 금액");
        s.addChart(P.ChartType.doughnut, [{name: "금액", labels: m.items.map(function(x){ return x.f.short; }), values: m.items.map(function(x){ return x.amt || 1; })}],
          {x: 0.5, y: 1.4, w: 5, h: 5, holeSize: 58, chartColors: m.items.map(function(x){ return hx(x.f.color); }), showPercent: true, showLegend: true, legendPos: "b", legendFontFace: F, legendFontSize: 11, dataLabelColor: "FFFFFF", dataLabelFontFace: F, dataLabelFontSize: 11});
        s.addTable([[{text: "상품", options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}, {text: "금액", options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}, {text: "핵심", options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}]].concat(
          m.items.map(function(x){ return [{text: x.f.icon + " " + x.f.short, options: {bold: true}}, man(x.amt), x.f.headline]; })), {x: 5.8, y: 1.5, w: 7.0, colW: [1.6, 1.4, 4.0], fontFace: F, fontSize: 10.5, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"}); }
      // 상품마다
      m.items.forEach(function(x){
        var f = x.f, ls = lines(f, x.amt), inc = income(f, x.amt);
        s = P.addSlide(); head(s, f.icon + " " + f.title, f.sub, f.color);
        rbox(s, 0.6, 1.45, 12.1, 0.75, f.color); T(s, f.headline, {x: 0.8, y: 1.52, w: 11.8, h: 0.6, fontSize: 15, bold: true, color: "FFFFFF", valign: "middle"});
        s.addChart(P.ChartType.doughnut, [{name: "비중", labels: f.alloc.map(function(a){ return a.name; }), values: f.alloc.map(function(a){ return a.pct; })}],
          {x: 0.5, y: 2.35, w: 4.4, h: 4.5, holeSize: 55, chartColors: f.alloc.map(function(a){ return hx(a.color); }), showPercent: true, showLegend: false, dataLabelColor: "FFFFFF", dataLabelFontFace: F, dataLabelFontSize: 11, dataLabelFontBold: true});
        if (inc && x.amt) T(s, inc.lab + "\n" + man(inc.won), {x: 1.5, y: 4.2, w: 2.4, h: 0.8, fontSize: 11, bold: true, align: "center", color: hx(NAVY), valign: "middle"});
        s.addTable([[{text: "칸", options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}, {text: "상품", options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}, {text: "비중", options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}, align: "right"}}, {text: "금액", options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}, align: "right"}}]].concat(
          ls.map(function(l){ return [{text: l.a.name, options: {bold: true, color: hx(l.a.color)}}, (l.a.inst || "") + (l.a.code && String(l.a.code).length < 12 ? " (" + l.a.code + ")" : ""), {text: pc(l.a.pct), options: {align: "right", bold: true}}, {text: x.amt ? man(l.won) : "–", options: {align: "right"}}]; })),
          {x: 5.1, y: 2.45, w: 7.6, colW: [1.9, 3.6, 0.8, 1.3], fontFace: F, fontSize: 11, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"});
        T(s, (f.points || []).map(function(p){ return {text: p, options: {bullet: {code: "2714"}, breakLine: true}}; }), {x: 5.1, y: 2.55 + 0.38 * (ls.length + 1) + 0.25, w: 7.6, h: 6.85 - (2.55 + 0.38 * (ls.length + 1) + 0.25), fontSize: 12, paraSpaceAfter: 5});
        // 자세히
        s = P.addSlide(); head(s, f.icon + " " + f.short + " — 자세히", "근거 그림 · 꼭 알아 둘 점", f.color);
        var ch = f.chart || {};
        if (ch.type === "line" && ch.vals && ch.vals.length > 2){
          var step = Math.max(1, Math.floor(ch.vals.length / 60)), lb = [], vv = [];
          for (var i = 0; i < ch.vals.length; i += step){ lb.push((ch.labels[i] || "").slice(2, 7).replace("-", ".")); vv.push(ch.vals[i]); }
          T(s, ch.title, {x: 0.6, y: 1.4, w: 7, h: 0.35, fontSize: 13, bold: true});
          s.addChart(P.ChartType.line, [{name: ch.title, labels: lb, values: vv}], {x: 0.5, y: 1.75, w: 7.2, h: 2.6, chartColors: [hx(f.color)], lineDataSymbol: "none", lineSize: 2, catAxisLabelFontFace: F, catAxisLabelFontSize: 9, valAxisLabelFontFace: F, valAxisLabelFontSize: 9, showLegend: false, catAxisLabelFrequency: Math.ceil(lb.length / 6), valGridLine: {color: "EEF1F6", size: 0.5}});
          if (ch.chart2){ var c2 = ch.chart2, lb2 = [], v2 = []; for (var j = 0; j < c2.vals.length; j += step){ lb2.push((c2.labels[j] || "").slice(2, 7).replace("-", ".")); v2.push(c2.vals[j]); }
            T(s, c2.title, {x: 0.6, y: 4.45, w: 7, h: 0.35, fontSize: 13, bold: true});
            s.addChart(P.ChartType.line, [{name: c2.title, labels: lb2, values: v2}], {x: 0.5, y: 4.8, w: 7.2, h: 2.1, chartColors: ["7B5CFF"], lineDataSymbol: "none", lineSize: 2, catAxisLabelFontFace: F, catAxisLabelFontSize: 9, valAxisLabelFontFace: F, valAxisLabelFontSize: 9, showLegend: false, catAxisLabelFrequency: Math.ceil(lb2.length / 6), valGridLine: {color: "EEF1F6", size: 0.5}}); }
        } else if (ch.type === "bar" && ch.vals){
          T(s, ch.title, {x: 0.6, y: 1.4, w: 7, h: 0.35, fontSize: 13, bold: true});
          s.addChart(P.ChartType.bar, [{name: ch.title, labels: ch.labels, values: ch.vals}], {x: 0.5, y: 1.75, w: 7.2, h: 3.0, barDir: ch.labels.length > 6 ? "col" : "bar", chartColors: [hx(f.color)], showValue: ch.labels.length <= 12, dataLabelFontFace: F, dataLabelFontSize: 9, dataLabelFormatCode: "0.0", catAxisLabelFontFace: F, catAxisLabelFontSize: ch.labels.length > 12 ? 7 : 10, valAxisHidden: true, valGridLine: {style: "none"}, showLegend: false, catAxisOrientation: ch.labels.length > 6 ? "minMax" : "maxMin"});
        } else {
          T(s, "칸별 비중", {x: 0.6, y: 1.4, w: 7, h: 0.35, fontSize: 13, bold: true});
          s.addChart(P.ChartType.bar, [{name: "비중", labels: f.alloc.map(function(a){ return a.name; }), values: f.alloc.map(function(a){ return a.pct; })}], {x: 0.5, y: 1.75, w: 7.2, h: 3.0, barDir: "bar", chartColors: [hx(f.color)], showValue: true, dataLabelFormatCode: '0.0"%"', dataLabelFontFace: F, dataLabelFontSize: 10, catAxisLabelFontFace: F, catAxisLabelFontSize: 10, valAxisHidden: true, valGridLine: {style: "none"}, showLegend: false, catAxisOrientation: "maxMin"});
        }
        var yR = 1.4;
        if (f.tax){ rbox(s, 8.0, yR, 4.75, 1.45, "#effaf4"); T(s, "🧾 세액공제 (연 " + f.tax.limit + "만원 넣을 때)", {x: 8.15, y: yR + 0.1, w: 4.5, h: 0.3, fontSize: 12, bold: true});
          T(s, taxLine(f).map(function(t){ return t.who + " · " + t.rate + "% → " + t.full; }).join("\n") + "\n" + f.tax.note, {x: 8.15, y: yR + 0.45, w: 4.5, h: 0.95, fontSize: 10.5}); yR += 1.6; }
        if (inc && x.amt){ rbox(s, 8.0, yR, 4.75, 0.75, "#f1f6ff"); T(s, "💡 " + inc.lab + " 약 " + man(inc.won) + " (연 " + inc.pct.toFixed(2) + "%)", {x: 8.15, y: yR + 0.12, w: 4.5, h: 0.5, fontSize: 12, bold: true, color: hx(NAVY), valign: "middle"}); yR += 0.9; }
        rbox(s, 8.0, yR, 4.75, 6.85 - yR, "#fff4f2");
        T(s, "⚠️ 꼭 알아 둘 점", {x: 8.15, y: yR + 0.1, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: "B3372A"});
        T(s, (f.risks || []).map(function(r){ return {text: r, options: {bullet: true, breakLine: true}}; }), {x: 8.15, y: yR + 0.45, w: 4.5, h: 6.85 - yR - 0.55, fontSize: 10.5, paraSpaceAfter: 4});
        if (f.table && f.table.rows && f.table.rows.length && ch.type !== "line"){
          var tr = [f.table.cols.map(function(c){ return {text: c, options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}; })].concat(f.table.rows.slice(0, f.key === "els" ? 3 : 5).map(function(r){ return r.map(function(c){ return String(c).slice(0, 28); }); }));
          s.addTable(tr, {x: 0.6, y: 4.9, w: 7.1, fontFace: F, fontSize: 8.5, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
        } else if (f.table && f.table.rows && f.table.rows.length && ch.type === "line" && !ch.chart2){
          var tr2 = [f.table.cols.map(function(c){ return {text: c, options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}; })].concat(f.table.rows.slice(0, 6));
          s.addTable(tr2, {x: 0.6, y: 4.55, w: 7.1, fontFace: F, fontSize: 9, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
        }
      });
      // 유의사항
      s = P.addSlide(); head(s, "📌 투자 전 꼭 확인하실 점", m.basis);
      T(s, m.notice.map(function(t){ return {text: t, options: {bullet: {type: "number"}, breakLine: true}}; }), {x: 0.8, y: 1.5, w: 11.8, h: 3.2, fontSize: 15, paraSpaceAfter: 10});
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
