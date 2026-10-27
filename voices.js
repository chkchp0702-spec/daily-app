/* 🗣 목소리 경주 — 10/27 A10/27-1 (사용자 「1번만 하자」)
   「누구 말을 따랐어야 했나」: 앱 안 목소리마다 「처음 부른 날 종가에 같은 돈을 넣고 지금까지 들고 있었다면」 곡선을
   💼 포트 탭(🏁 시장 비교 바로 밑)에서 🙋 내 포트·코스피·S&P500 선과 한 그림으로.
   목소리: 📣 피드 채널 11곳 · 🔎 아침 거르기 거름망 4종 · ⚡ 킥이 고른 종목 (자료: market-strategy-report feeds/voices_race.json —
           src/voices_race.py · 평일 07:25·16:10, feed-score 작업 뒤) + 👁 내 눈(휴대폰 eyeScr — 같은 규칙으로 여기서 계산, 종가는 그 파일의 px 표)
   규칙: 한 종목은 처음 부른 날 한 번만 삼 · 판 적 없음 · 부를 때마다 같은 돈 → 넣은 돈 대비 % · 그림자 = 같은 날 같은 돈을 그 나라 지수에(지수 대비 %p)
         · 각 나라 돈(환율 뺌) · 포트·지수 선은 시작일에 한 번 넣고 그대로(포트는 포트 탭과 같은 달러 기준)
   원칙: 언급 = 추천 아님(「팔아라」 글도 「부른 날 샀다면」으로 셈) · 숫자를 지어내지 않음 · 종목 5개 밑 목소리는 순위에서 뺌 · 사라·팔라는 말 없음. */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var BEN = {KR: "^KS11", US: "^GSPC", JP: "^N225", HK: "^HSI", CN: "000001.SS"};
  var PAL = ["#f4a261", "#7ee0b5", "#9b7cff", "#5ac8fa", "#ffd166", "#ff8fc7", "#b9e769", "#3dd6c6"];
  var MINN = 5;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function kn(c){ c = String(c || ""); return /^\d{6}\.K[SQ]$/.test(c) ? c.slice(0, 6) : c; }
  function mkOf(s){ return /\.K[SQ]$/.test(s) || /^\d{6}$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /\.(SS|SZ)$/.test(s) ? "CN" : "US"; }

  var ST = {p: null, D: null, sort: ls("vrSort") === "ex" ? "ex" : "ret", sel: {}, open: null};
  function load(){
    if (!ST.p) ST.p = getJSON(RAWM + "feeds/voices_race.json?h=" + Math.floor(Date.now() / 1800e3), {ttl: 1800e3})
      .then(function(D){ return D && D.dates && D.voices ? D : null; }).catch(function(){ return null; });
    return ST.p;
  }

  /* ── 👁 내 눈: 휴대폰 기록(eyeScr)으로 같은 규칙 ── */
  function firstIdx(arr, cal, d){ if (!arr) return -1; for (var j = 0; j < cal.length; j++) if (cal[j] >= d && arr[j] != null) return j; return -1; }
  function ffill(arr){ var o = [], l = null; for (var j = 0; j < arr.length; j++){ if (arr[j] != null) l = arr[j]; o.push(l); } return o; }
  function eyeVoice(D){
    var E = ls("eyeScr"); if (!E || typeof E !== "object") return null;
    var first = {}; Object.keys(E).sort().forEach(function(d){ (E[d] || []).forEach(function(s){ if (!(s in first)) first[s] = d; }); });
    var cal = D.dates, X = D.px || {}, C = X.c || {}, M = X.meta || {}, B = X.bench || {}, pos = [], miss = 0, FF = {};
    var ff = function(k, a){ if (!FF[k]) FF[k] = ffill(a || []); return FF[k]; };
    Object.keys(first).forEach(function(s0){
      var s = C[s0] ? s0 : C[s0 + ".KS"] ? s0 + ".KS" : C[s0 + ".KQ"] ? s0 + ".KQ" : null;
      if (!s){ miss++; return; }
      var i = firstIdx(C[s], cal, first[s0]); if (i < 0){ miss++; return; }
      var mk = (M[s] || [])[1] || mkOf(s), b = BEN[mk] || "^GSPC", bi = firstIdx(B[b], cal, cal[i]);
      if (bi < 0){ miss++; return; }
      pos.push({s: s, n: (M[s] || [])[0] || s, ei: i, px: C[s][i], b: b, bpx: B[b][bi], mk: mk});
    });
    if (!pos.length) return {k: "eye", empty: true, n: 0, miss: miss};
    var curve = [], shadow = null;
    for (var j = 0; j < cal.length; j++){
      var rs = 0, bs = 0, n = 0;
      pos.forEach(function(p){ if (p.ei > j) return; var c = ff(p.s, C[p.s])[j], bc = ff(p.b, B[p.b])[j]; if (c == null || bc == null) return; rs += c / p.px - 1; bs += bc / p.bpx - 1; n++; });
      curve.push(n ? Math.round(rs / n * 10000) / 100 : null);
      if (j === cal.length - 1) shadow = n ? Math.round(bs / n * 10000) / 100 : null;
    }
    var picks = pos.map(function(p){ var c = ff(p.s, C[p.s])[cal.length - 1]; return [p.s, p.n, cal[p.ei], c ? Math.round((c / p.px - 1) * 1000) / 10 : null, p.mk]; })
      .sort(function(a, b){ return (b[3] == null ? -1e9 : b[3]) - (a[3] == null ? -1e9 : a[3]); });
    var r = curve[curve.length - 1];
    return {k: "eye", name: "내 눈 (👁 찍은 것)", ic: "👁", kind: "eye", n: pos.length, miss: miss, first: cal[Math.min.apply(null, pos.map(function(p){ return p.ei; }))],
      ret: r, shadow: shadow, ex: r != null && shadow != null ? Math.round((r - shadow) * 100) / 100 : null,
      up: picks.filter(function(x){ return x[3] > 0; }).length, curve: curve, picks: picks};
  }

  /* ── 포트·지수 선(시작일에 넣고 그대로) ── */
  function portLine(cal, start, pd, L){
    if (!pd || !L) return null;
    var at = function(d){ var v = null; for (var i = 0; i < pd.length && pd[i] <= d; i++) if (L[i] != null) v = L[i]; return v; };
    var v0 = at(start); if (v0 == null) return null;
    return cal.map(function(d){ var v = at(d); return v == null ? null : Math.round(((1 + v / 100) / (1 + v0 / 100) - 1) * 10000) / 100; });
  }
  function refs(D){
    var out = [], PL = window.__poLines || {}, mine = portLine(D.dates, D.start, PL.dates, PL.mine), base = portLine(D.dates, D.start, PL.dates, PL.base);
    if (mine) out.push({k: "ref:mine", ic: "🙋", name: PL.mineName || "내 포트", line: mine, col: "#f472b6", w: 3, dash: ""});
    else if (base) out.push({k: "ref:base", ic: "💼", name: "기본 포트", line: base, col: "#e9c46a", w: 3, dash: ""});
    var Ls = D.lines || {};
    if (Ls["코스피"]) out.push({k: "ref:kospi", ic: "🇰🇷", name: "코스피", line: Ls["코스피"], col: "#8a94a8", w: 1.6, dash: "5 4"});
    if (Ls["S&P500"]) out.push({k: "ref:spx", ic: "🇺🇸", name: "S&P500", line: Ls["S&P500"], col: "#c9d1e0", w: 1.6, dash: "2 3"});
    out.forEach(function(r){ var z = r.line.filter(function(v){ return v != null; }); r.ret = z.length ? z[z.length - 1] : null; });
    return out;
  }
  function last(a){ for (var i = a.length - 1; i >= 0; i--) if (a[i] != null) return a[i]; return null; }

  /* ── 그리기 ── */
  function svg(cal, lines){
    var W = 340, H = 196, L = 34, R = 8, T = 10, Bm = 22, all = [0];
    lines.forEach(function(l){ l.line.forEach(function(v){ if (v != null) all.push(v); }); });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = Math.max(0.5, (hi - lo) * 0.08); lo -= pad; hi += pad;
    var n = cal.length, X = function(i){ return L + (n > 1 ? i / (n - 1) : 0) * (W - L - R); }, Y = function(v){ return T + (hi - v) / (hi - lo) * (H - T - Bm); };
    var step = Math.pow(10, Math.floor(Math.log10((hi - lo) / 3 || 1))), tick = [1, 2, 5, 10].map(function(m){ return m * step; }).filter(function(t){ return (hi - lo) / t <= 5; })[0] || step * 10;
    var s = '<svg class="vr-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="목소리별 같은 돈 곡선">';
    for (var t = Math.ceil(lo / tick) * tick; t <= hi; t += tick){ var y = Y(t).toFixed(1);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="vr-g' + (Math.abs(t) < 1e-9 ? ' z' : '') + '"/><text x="' + (L - 4) + '" y="' + (+y + 3) + '" text-anchor="end" class="vr-t">' + (t > 0 ? "+" : t < 0 ? "−" : "") + Math.abs(+t.toFixed(4)) + '%</text>'; }
    s += '<text x="' + L + '" y="' + (H - 6) + '" class="vr-t">' + md(cal[0]) + '</text><text x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end" class="vr-t">' + md(cal[n - 1]) + '</text>';
    lines.forEach(function(l){
      var d = "", pen = false;
      l.line.forEach(function(v, i){ if (v == null){ pen = false; return; } d += (pen ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); pen = true; });
      if (!d) return;
      s += '<path d="' + d + '" fill="none" stroke="' + l.col + '" stroke-width="' + (l.w || 2) + '"' + (l.dash ? ' stroke-dasharray="' + l.dash + '"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>';
      var li = -1; for (var i = l.line.length - 1; i >= 0; i--) if (l.line[i] != null){ li = i; break; }
      if (li >= 0) s += '<circle cx="' + X(li).toFixed(1) + '" cy="' + Y(l.line[li]).toFixed(1) + '" r="2.8" fill="' + l.col + '"/>';
    });
    return s + '</svg>';
  }

  function draw(el){
    var D = ST.D, cal = D.dates;
    var VS = D.voices.slice(), eye = eyeVoice(D);
    if (eye && !eye.empty) VS.push(eye);
    var key = ST.sort === "ex" ? "ex" : "ret", val = function(v){ return v[key] == null ? -1e9 : v[key]; };
    var big = VS.filter(function(v){ return v.n >= MINN && v.ret != null; }).sort(function(a, b){ return val(b) - val(a); });
    var small = VS.filter(function(v){ return !(v.n >= MINN && v.ret != null); });
    big.forEach(function(v, i){ v.col = v.col || PAL[i % PAL.length]; });
    var RF = refs(D);
    var shown = big.filter(function(v, i){ return i < 3 || ST.sel[v.k]; });
    if (eye && !eye.empty && eye.n >= MINN && shown.indexOf(eye) < 0) shown.push(eye);
    var lines = shown.map(function(v){ return {line: v.curve, col: v.col, w: v.k === "eye" ? 2.6 : 2}; }).concat(RF.map(function(r){ return {line: r.line, col: r.col, w: r.w, dash: r.dash}; }));
    var top = big[0], wk = Math.max(1, Math.round((new Date(cal[cal.length - 1]) - new Date(D.start)) / 864e5 / 7));
    var head = '<div class="vr-hd">' + (top ? '🥇 <b>' + e(top.ic + " " + top.name) + '</b> <b class="' + cl(top[key]) + '">' + sg(top[key]) + (key === "ex" ? '%p' : '%') + '</b>' : '') +
      RF.map(function(r){ return ' · ' + r.ic + ' ' + e(r.name) + ' <b class="' + cl(r.ret) + '">' + sg(r.ret) + '%</b>'; }).join("") + '</div>' +
      '<div class="vr-sub">' + md(D.start) + '부터 ' + wk + '주째 · 부를 때마다 같은 돈 · 넣은 돈 대비 · ' + md(cal[cal.length - 1]) + ' 종가까지</div>';
    var chips = '<div class="vr-ch"><button type="button" data-vrs="ret" class="' + (key === "ret" ? "on" : "") + '">💰 그냥 수익률</button><button type="button" data-vrs="ex" class="' + (key === "ex" ? "on" : "") + '">🏳 지수 대비</button></div>';
    var lg = '<div class="vr-lg">' + shown.map(function(v){ return '<span><i style="background:' + v.col + '"></i>' + e(v.ic + " " + v.name) + '</span>'; }).join("") +
      RF.map(function(r){ return '<span><i class="ln" style="border-color:' + r.col + (r.dash ? ';border-top-style:dashed' : '') + '"></i>' + e(r.ic + " " + r.name) + '</span>'; }).join("") + '</div>';
    var tag = function(v){ return v.kind === "ch" ? "피드 채널" : v.kind === "scr" ? "아침 거르기" : v.kind === "kick" ? "킥" : v.kind === "eye" ? "휴대폰 기록" : ""; };
    var row = function(v, i){
      var on = shown.indexOf(v) >= 0, op = ST.open === v.k;
      var h = '<div class="vr-r' + (on ? " on" : "") + (op ? " op" : "") + (v.k === "eye" ? " me" : "") + '" data-vrk="' + e(v.k) + '"><span class="no">' + (i + 1) + '</span>' +
        '<span class="nm"><i style="background:' + (on ? v.col : "transparent") + ';border-color:' + v.col + '"></i><b>' + e(v.ic + " " + v.name) + '</b><small>' + tag(v) + ' · 종목 ' + v.n + '개 중 ' + v.up + '개 오름' + (v.first > D.start ? ' · ' + md(v.first) + '부터' : '') + '</small></span>' +
        '<span class="v"><b class="' + cl(v.ret) + '">' + sg(v.ret) + '%</b><small class="' + cl(v.ex) + '">지수 대비 ' + sg(v.ex) + '%p</small></span></div>';
      if (op){
        var P = v.picks || [], top = P.slice(0, 4), bot = P.length > 7 ? P.slice(-3) : P.slice(4);
        var pk = function(x){ return '<a href="javascript:void 0" data-vrop="' + e(kn(x[0])) + '">' + e(x[1]) + ' <em>' + md(x[2]) + '</em> <b class="' + cl(x[3]) + '">' + sg(x[3], 1) + '%</b></a>'; };
        h += '<div class="vr-pk"><small>가장 많이 오른 것</small>' + top.map(pk).join("") + (bot.length ? '<small>가장 많이 내린 것</small>' + bot.map(pk).join("") : '') +
          '<small class="vr-pn">날짜 = 처음 부른 뒤 산 날 · 그 뒤 ' + md(cal[cal.length - 1]) + ' 종가까지' + (v.miss ? ' · 시세 없는 ' + v.miss + '개 뺌' : '') + '</small></div>';
      }
      return h;
    };
    var eyeHint = !eye ? '<div class="vr-eh">👁 아침 거르기에서 「볼 만함」을 누르면 <b>내 눈</b>도 여기서 같이 달려요.</div>' :
      eye.empty ? '<div class="vr-eh">👁 찍은 종목의 시세를 아직 못 찾았어요(다음 갱신 뒤).</div>' :
      eye.n < MINN ? '<div class="vr-eh">👁 내 눈: 찍은 종목 ' + eye.n + '개 <b class="' + cl(eye.ret) + '">' + sg(eye.ret) + '%</b> — 5개부터 순위에 들어가요.</div>' : '';
    el.innerHTML = head + chips + svg(cal, lines) + lg +
      '<div class="vr-l">' + big.map(function(v, i){ return ST.all || i < 8 || ST.open === v.k || v.k === "eye" ? row(v, i) : ""; }).join("") + '</div>' +
      (big.length > 8 ? '<button type="button" class="vr-more" data-vrall="1">' + (ST.all ? '접기 ▴' : '＋' + (big.length - 8) + '곳 더 보기 ▾') + '</button>' : '') + eyeHint +
      (small.length ? '<div class="vr-sm">종목 5개 밑이라 순위에서 뺌: ' + small.filter(function(v){ return v.k !== "eye"; }).map(function(v){ return e(v.ic + " " + v.name) + ' ' + v.n + '개 ' + sg(v.ret) + '%'; }).join(" · ") + '</div>' : '') +
      '<p class="vr-n">줄을 누르면 그래프에 넣고 빼고, 그 목소리가 부른 종목이 열려요. 목소리 = 종목을 <b>처음 부른 날 종가에 같은 돈</b>을 넣고 판 적 없이 들고 있었다면(같은 종목은 한 번만 · 한국은 15:30 넘은 글이면 다음 날 종가). ' +
      '「지수 대비」 = 같은 날 같은 돈을 그 나라 지수에 넣은 것과의 차이. 각 나라 돈 기준(환율 뺌). 포트·지수 선은 ' + md(D.start) + '에 한 번 넣고 그대로(포트는 포트 탭과 같은 달러 기준). ' +
      '<b>언급 = 추천 아님</b> — 「팔아라」 글도 「부른 날 샀다면」으로 셈. 과거 계산 · 참고용.</p>';
  }

  function mount(){
    var el = document.getElementById("vrace"); if (!el) return;
    if (el.offsetParent === null) return;          // 접힌 칸 안 — 펼칠 때 받기
    if (el.dataset.on) return; el.dataset.on = "1";
    load().then(function(D){
      var el2 = document.getElementById("vrace"); if (!el2) return;
      if (!D){ el2.innerHTML = '<small class="mut">경주 자료 준비 중 — 평일 07:25·16:10 갱신 뒤 보여요.</small>'; return; }
      ST.D = D; draw(el2);
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target;
    var s = t.closest && t.closest("[data-vrs]");
    if (s){ ST.sort = s.getAttribute("data-vrs"); ls("vrSort", ST.sort); var el = document.getElementById("vrace"); if (el && ST.D) draw(el); return; }
    if (t.closest && t.closest("[data-vrall]")){ ST.all = !ST.all; var ea = document.getElementById("vrace"); if (ea && ST.D) draw(ea); return; }
    var o = t.closest && t.closest("[data-vrop]");
    if (o){ ev.preventDefault(); ev.stopPropagation(); if (window.openOP) openOP(o.getAttribute("data-vrop")); return; }
    var r = t.closest && t.closest("[data-vrk]");
    if (r){ var k = r.getAttribute("data-vrk"); ST.sel[k] = !ST.sel[k]; ST.open = ST.open === k ? null : k;
      var el3 = document.getElementById("vrace"); if (el3 && ST.D) draw(el3); return; }
    soon();                                          // 접힌 칸을 펼쳤을 수 있음
  }, true);

  var T = null;
  function tick(){ T = null; try { mount(); } catch(x) { console.error(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 250); }
  var css = document.createElement("style");
  css.textContent =
    ".vr-w{min-height:40px}.vr-hd{font-size:13.5px;line-height:1.55;word-break:keep-all}.vr-hd b.up{color:var(--up)}.vr-hd b.dn{color:var(--down)}" +
    ".vr-sub{font-size:12.5px;color:var(--sub);margin:2px 0 6px;word-break:keep-all}" +
    ".vr-ch{display:flex;gap:6px;margin:4px 0 2px}.vr-ch button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:4px 11px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".vr-ch button.on{background:var(--acc);border-color:var(--acc);color:#0b0f17;font-weight:700}" +
    ".vr-svg{display:block;width:100%;height:auto;margin:6px 0 2px}.vr-g{stroke:var(--line);stroke-width:1}.vr-g.z{stroke:var(--sub);stroke-dasharray:3 3}.vr-t{fill:var(--sub);font-size:9.5px}" +
    ".vr-lg{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:12.5px;margin:0 0 6px}.vr-lg span{white-space:nowrap}.vr-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".vr-lg i.ln{width:14px;height:0;border-radius:0;border-top:2px solid;vertical-align:3px;background:none}" +
    ".vr-l{border-top:1px solid var(--line)}.vr-r{display:grid;grid-template-columns:20px 1fr auto;gap:6px;align-items:center;padding:7px 2px;border-bottom:1px solid var(--line);cursor:pointer}" +
    ".vr-r .no{font-size:12.5px;color:var(--sub);text-align:center}.vr-r .nm{min-width:0}.vr-r .nm i{display:inline-block;width:9px;height:9px;border-radius:50%;border:2px solid;margin-right:5px;vertical-align:-1px}" +
    ".vr-r .nm b{font-size:13.5px;word-break:keep-all}.vr-r .nm small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".vr-r .v{text-align:right}.vr-r .v b{display:block;font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.vr-r .v small{display:block;font-size:12.5px;white-space:nowrap;color:var(--sub)}" +
    ".vr-r .v b.up,.vr-r .v small.up{color:var(--up)}.vr-r .v b.dn,.vr-r .v small.dn{color:var(--down)}.vr-r.me{background:color-mix(in srgb,#ffd166 10%,transparent)}.vr-r.op{border-bottom:0}" +
    ".vr-pk{padding:2px 4px 8px 28px;border-bottom:1px solid var(--line)}.vr-pk small{display:block;font-size:12.5px;color:var(--sub);margin:6px 0 2px}.vr-pk small.vr-pn{margin-top:6px;word-break:keep-all}" +
    ".vr-pk a{display:flex;gap:6px;align-items:baseline;font-size:12.5px;padding:3px 0;color:var(--text);text-decoration:none}.vr-pk a em{font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".vr-pk a b{margin-left:auto;font-variant-numeric:tabular-nums}.vr-pk a b.up{color:var(--up)}.vr-pk a b.dn{color:var(--down)}" +
    ".vr-eh{font-size:12.5px;margin:8px 0 0;padding:7px 9px;border-radius:9px;background:var(--panel2);word-break:keep-all}.vr-eh b.up{color:var(--up)}.vr-eh b.dn{color:var(--down)}" +
    ".vr-more{display:block;width:100%;margin:6px 0 0;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".vr-sm{font-size:12.5px;color:var(--sub);margin:8px 0 0;word-break:keep-all}.vr-n{font-size:12.5px;color:var(--sub);margin:8px 0 0;line-height:1.5;word-break:keep-all}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
  window.__voices = {eyeVoice: eyeVoice, portLine: portLine, state: ST};   // 검사용
})();
