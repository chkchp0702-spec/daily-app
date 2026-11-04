/* 🎲 1만 번 돌려보기 (11/04 사용자: 틱톡 「AI 주식 자동매매 1만 번 시뮬레이션 승률」 보고 「너 이거 돼?」 → 「넣어봐」)
   📊 성적표 맨 위 카드. 영상보다 정직하게 — 지어낸 승률이 아니라 「실제로 있었던 것」만 무작위로 다시 뽑음.
   ① 💼 기본 포트: 2008년부터 매일 굴린 💼 기본 규칙(포트 설계기 엔진 · S&P 200일선 · 변동성 맞춤)과 S&P500 의 하루 수익을
      21거래일(한 달) 덩어리째 12개 뽑아 1년을 만듦 → 1만 번. 같은 덩어리를 둘 다에 써서(같은 시장) 공정하게 비교.
   ② ☕ 컵 · 📈 갭: 앱이 10/6부터 실제로 낸 신호의 「5거래일 뒤 수익」에서 거래 비용 0.3%를 뺀 값을, 같은 날 지수(한국 = 코스피, 나머지 = S&P500)
      5일 수익과 짝지어 둠 → 「1년 = 신호 48번 × 매번 100만 원」을 1만 번 뽑음.
   숫자는 날마다 같은 씨앗(seed)이라 열 때마다 흔들리지 않음 · 「🔁 다시 돌리기」는 새 씨앗.
   원칙: 과거 계산 · 미래 보장 아님 · 표본이 적으면 크게 경고 · 사라는 말 없음. */
(function(){
  var N = 10000, SEL = "port", SEED = 0, CACHE = {};
  try { var s0 = localStorage.getItem("mc_sel"); if (s0) SEL = s0; } catch(x) {}
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kday(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function rng(seed){ var a = seed >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedOf(){ var d = kday().replace(/-/g, ""); return (+d * 2654435761 + SEED * 97) >>> 0; }
  function pct(a, p){ var b = Array.prototype.slice.call(a).sort(function(x, y){ return x - y; }); var i = Math.min(b.length - 1, Math.max(0, Math.floor(p * (b.length - 1)))); return b[i]; }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(d == null ? 1 : d); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function man(v){ var a = Math.abs(v); return (v < 0 ? "−" : v > 0 ? "+" : "") + (a >= 1e4 ? (a / 1e4).toFixed(1) + "억" : Math.round(a).toLocaleString()) + "만"; }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }

  /* ── ① 💼 기본 포트 ── */
  function portData(){
    if (CACHE.port) return Promise.resolve(CACHE.port);
    if (!window.__pdz) return Promise.resolve(null);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var r = __pdz.engine(A, {SPY: .475, QQQ: .475, GLD: .05, BIL: 0}, {reg: 1, vol: 1, start: "2007-06-01"}); if (!r) return null;
      var n = r.nv.length, rp = new Float64Array(n - 1), rs = new Float64Array(n - 1);
      for (var i = 1; i < n; i++){ rp[i - 1] = r.nv[i] / r.nv[i - 1] - 1; rs[i - 1] = r.sp[i] / r.sp[i - 1] - 1; }
      // 실제 있었던 모든 1년(252거래일) 구간 — 시뮬레이션과 나란히 보여 줄 「진짜」
      var real = 0, rn = 0; for (var j = 0; j + 252 < n; j += 5){ rn++; if (r.nv[j + 252] / r.nv[j] > r.sp[j + 252] / r.sp[j]) real++; }
      CACHE.port = {rp: rp, rs: rs, from: r.from, to: r.to, real: rn ? real / rn * 100 : null, cagr: r.cagr, sp_cagr: r.sp_cagr, mdd: r.mdd, sp_mdd: r.sp_mdd};
      return CACHE.port;
    });
  }
  function runPort(P){
    var R = rng(seedOf()), n = P.rp.length, B = 21, K = 12, out = new Float64Array(N), spo = new Float64Array(N), ex = new Float64Array(N), win = 0, pos = 0;
    for (var s = 0; s < N; s++){
      var a = 1, b = 1;
      for (var k = 0; k < K; k++){ var st = Math.floor(R() * (n - B)); for (var t = st; t < st + B; t++){ a *= 1 + P.rp[t]; b *= 1 + P.rs[t]; } }
      out[s] = (a - 1) * 100; spo[s] = (b - 1) * 100; ex[s] = out[s] - spo[s]; if (a > b) win++; if (a > 1) pos++;
    }
    return {kind: "port", win: win / N * 100, pos: pos / N * 100, med: pct(out, .5), smed: pct(spo, .5), p10: pct(out, .1), sp10: pct(spo, .1), p1: pct(out, .01), sp1: pct(spo, .01), exmed: pct(ex, .5), ex: ex, n: n};
  }

  /* ── ② 신호 (컵 · 갭) ── */
  function bench(){
    if (CACHE.bench) return Promise.resolve(CACHE.bench);
    return Promise.all([gj("archive/x/port_px/SPY.json"), gj("archive/x/port_px/KOSPI.json")]).then(function(a){
      function mk(j){ if (!j) return null; var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, m = {}, L = []; for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; L.push(t); m[t] = i; } return {m: m, L: L, c: j.c}; }
      CACHE.bench = {US: mk(a[0]), KR: mk(a[1])}; return CACHE.bench;
    });
  }
  function r5bench(B, d0){   // d0 종가에 사서 5거래일 뒤 — 그날이 쉬면 다음 거래일
    if (!B) return null; var t = Date.parse(d0 + "T00:00:00Z") / 864e5, i = null;
    for (var k = 0; k < 6 && i == null; k++) if (B.m[t + k] != null) i = B.m[t + k];
    if (i == null || i + 5 >= B.c.length) return null; return (B.c[i + 5] / B.c[i] - 1) * 100;
  }
  var COST = 0.3;
  function sigData(kind){
    if (CACHE[kind]) return Promise.resolve(CACHE[kind]);
    return Promise.all([gj("archive/x/perf_" + kind + ".json"), bench()]).then(function(a){
      var J = a[0], B = a[1]; if (!J || !J.signals) return null;
      var S = J.signals.filter(function(x){ return x.r5 != null; }), r = [], x = [], days = {};
      S.forEach(function(s){ var net = s.r5 - COST, b = r5bench(s.mkt === "KR" ? B.KR : B.US, s.d0); r.push(net); x.push(b == null ? null : net - b); days[s.d0] = 1; });
      CACHE[kind] = {r: r, x: x, nd: Object.keys(days).length, first: J.first, n: r.length}; return CACHE[kind];
    });
  }
  function runSig(D){
    var R = rng(seedOf() ^ 0x9e37), T = 48, AMT = 100, n = D.r.length, out = new Float64Array(N), ex = new Float64Array(N), win = 0, pos = 0;
    var xs = []; for (var i = 0; i < n; i++) if (D.x[i] != null) xs.push(i);
    for (var s = 0; s < N; s++){
      var a = 0, b = 0;
      for (var k = 0; k < T; k++){ var j = Math.floor(R() * n); a += D.r[j]; if (xs.length){ var q = xs[Math.floor(R() * xs.length)]; b += D.x[q]; } }
      out[s] = a / 100 * AMT; ex[s] = b / 100 * AMT; if (a > 0) pos++; if (b > 0) win++;
    }
    var wr = D.r.filter(function(v){ return v > 0; }).length / Math.max(1, n) * 100, avg = D.r.reduce(function(p, v){ return p + v; }, 0) / Math.max(1, n);
    return {kind: "sig", pos: pos / N * 100, win: xs.length ? win / N * 100 : null, med: pct(out, .5), p10: pct(out, .1), p90: pct(out, .9), p1: pct(out, .01), ex: ex, exmed: pct(ex, .5), wr: wr, avg: avg, T: T, AMT: AMT, n: n, nd: D.nd};
  }

  /* ── 그리기 ── */
  function hist(ex, unit){
    var lo = pct(ex, .01), hi = pct(ex, .99); if (hi - lo < 1e-9){ lo -= 1; hi += 1; }
    var NB = 28, w = (hi - lo) / NB, H = new Array(NB).fill(0), mx = 0;
    for (var i = 0; i < ex.length; i++){ var b = Math.floor((ex[i] - lo) / w); if (b < 0 || b >= NB) continue; H[b]++; }
    mx = Math.max.apply(null, H.concat([1]));
    var W = 300, Ht = 92, bw = W / NB, z = lo < 0 && hi > 0 ? (0 - lo) / (hi - lo) * W : null;
    var bars = H.map(function(h, k){ var mid = lo + (k + .5) * w, hh = h / mx * (Ht - 4); return '<rect x="' + (k * bw + .6).toFixed(1) + '" y="' + (Ht - hh).toFixed(1) + '" width="' + (bw - 1.2).toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="1.5" class="' + (mid >= 0 ? "u" : "d") + '"/>'; }).join("");
    return '<svg class="mc-h" viewBox="0 0 ' + W + ' ' + (Ht + 18) + '" role="img" aria-label="1만 번 결과 분포">' + bars +
      (z != null ? '<line x1="' + z.toFixed(1) + '" y1="0" x2="' + z.toFixed(1) + '" y2="' + Ht + '" class="z"/><text x="' + z.toFixed(1) + '" y="' + (Ht + 14) + '" text-anchor="middle">0</text>' : '') +
      '<text x="0" y="' + (Ht + 14) + '">' + e(unit === "pp" ? sg(lo, 0) + "%p" : man(lo)) + '</text><text x="' + W + '" y="' + (Ht + 14) + '" text-anchor="end">' + e(unit === "pp" ? sg(hi, 0) + "%p" : man(hi)) + '</text></svg>';
  }
  function body(R, P){
    if (R.kind === "port"){
      return '<div class="mc-big"><small>1년 뒤 S&amp;P500을 이길 확률</small><b class="' + (R.win >= 50 ? "up" : "dn") + '">' + Math.round(R.win) + '%</b><p>💼 기본 포트(S&amp;P 반·나스닥 반 + 금 5% · 200일선·변동성 규칙)를 1년씩 <b>1만 번</b> 굴린 결과예요.</p></div>' +
        '<div class="mc-g"><div><small>보통의 해</small><b class="' + cl(R.med) + '">' + sg(R.med) + '%</b><em>S&amp;P ' + sg(R.smed) + '%</em></div>' +
        '<div><small>운 나쁜 10%</small><b class="' + cl(R.p10) + '">' + sg(R.p10) + '%</b><em>S&amp;P ' + sg(R.sp10) + '%</em></div>' +
        '<div><small>최악 1%</small><b class="' + cl(R.p1) + '">' + sg(R.p1) + '%</b><em>S&amp;P ' + sg(R.sp1) + '%</em></div></div>' +
        '<div class="mc-ht"><small>S&amp;P500보다 몇 %p 더(덜) 벌었나 · 1만 번</small>' + hist(R.ex, "pp") + '</div>' +
        '<ul class="mc-n"><li>✅ 실제로 있었던 모든 1년 구간(' + e(P.from.slice(0, 4)) + '~' + e(P.to.slice(0, 4)) + ')에선 <b>' + (P.real == null ? "–" : Math.round(P.real) + "%") + '</b> 이겼어요 — 1만 번 결과와 비교해 보세요.</li>' +
        '<li>🛡 이 포트의 강점은 「덜 잃기」예요. 보통의 해엔 S&amp;P와 비슷하거나 덜 벌지만, 운 나쁜 해엔 덜 빠져요.</li>' +
        '<li>방법: 2008년부터 실제 하루 수익을 <b>한 달 덩어리째 12개</b> 무작위로 뽑아 1년을 만듦(포트·S&amp;P 같은 덩어리) · 매매 비용 포함 · 세금·환전 비용 제외.</li></ul>';
    }
    var warn = R.nd < 60 ? '<div class="mc-w">⚠️ 아직 <b>' + R.nd + '일치 · ' + R.n + '번</b> 기록뿐이에요. 표본이 적어서 이 숫자는 크게 흔들려요 — 「이런 식으로 재요」 정도로만 보세요.</div>' : '';
    return warn + '<div class="mc-big"><small>1년 동안 신호마다 100만 원씩 ' + R.T + '번 — 돈을 벌 확률</small><b class="' + (R.pos >= 50 ? "up" : "dn") + '">' + Math.round(R.pos) + '%</b><p>앱이 실제로 낸 신호의 <b>5일 뒤 수익(비용 0.3% 뺌)</b>을 무작위로 뽑아 <b>1만 번</b> 굴린 결과예요.</p></div>' +
      '<div class="mc-g"><div><small>가운데</small><b class="' + cl(R.med) + '">' + man(R.med) + '</b><em>48번 합계</em></div>' +
      '<div><small>운 나쁜 10%</small><b class="' + cl(R.p10) + '">' + man(R.p10) + '</b><em>좋은 10% ' + man(R.p90) + '</em></div>' +
      '<div><small>지수보다 나음</small><b class="' + cl((R.win || 0) - 50) + '">' + (R.win == null ? "–" : Math.round(R.win) + "%") + '</b><em>같은 날 지수 대비</em></div></div>' +
      '<div class="mc-ht"><small>같은 날 지수(한국 = 코스피 · 나머지 = S&amp;P500)를 샀을 때보다 · 1만 번</small>' + hist(R.ex, "man") + '</div>' +
      '<ul class="mc-n"><li>실제 기록: ' + R.n + '번 중 <b>' + Math.round(R.wr) + '%</b>가 5일 뒤 플러스 · 평균 <b class="' + cl(R.avg) + '">' + sg(R.avg, 2) + '%</b>(비용 뺀 값)</li>' +
      (R.win != null && R.win - R.pos > 20 ? '<li>⚠️ 이 기간엔 지수 자체가 빠져서 「지수보다 나음」이 높게 나와요. 오른 장에서도 그런지는 기록이 더 쌓여야 알 수 있어요.</li>' : '') +
      '<li>그래서 지금은 이 신호를 ⚡ 공격 포트에 「성과가 확인될 때만」 넣어요. 기록이 쌓일수록 이 카드 숫자가 진짜에 가까워져요.</li>' +
      '<li>방법: 신호 하나 = 그날 종가에 사서 5거래일 뒤 팔기 · 한 번에 100만 원 · 겹쳐 사는 건 따지지 않음(단순화).</li></ul>';
  }
  var LAB = {port: "💼 기본 포트", cup: "☕ 컵 차트", gap: "📈 갭 상승"};
  function paint(box){
    box.innerHTML = '<h3>🎲 1만 번 돌려보기 <span class="mut">실제 기록을 무작위로 다시 뽑기</span></h3>' +
      '<div class="mc-seg">' + Object.keys(LAB).map(function(k){ return '<button type="button" data-mc="' + k + '" class="' + (k === SEL ? "on" : "") + '">' + LAB[k] + '</button>'; }).join("") + '</div>' +
      '<div id="mcb"><div class="loading">1만 번 굴리는 중…</div></div>' +
      '<div class="mc-f"><button type="button" id="mcre">🔁 다시 돌리기</button><small>과거 계산 · 미래 보장 아님 · 사라는 뜻 아님</small></div>';
    [].forEach.call(box.querySelectorAll("[data-mc]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); SEL = b.dataset.mc; try { localStorage.setItem("mc_sel", SEL); } catch(x) {} paint(box); }; });
    var re = box.querySelector("#mcre"); if (re) re.onclick = function(ev){ ev.stopPropagation(); SEED++; paint(box); };
    var pr = SEL === "port" ? portData() : sigData(SEL);
    pr.then(function(P){
      var b = box.querySelector("#mcb"); if (!b) return;
      if (!P || (P.n != null && P.n < 10)){ b.innerHTML = '<p class="note">자료를 아직 못 불러왔어요. 잠시 뒤 다시 열어 주세요.</p>'; return; }
      setTimeout(function(){ var t0 = Date.now(), R = SEL === "port" ? runPort(P) : runSig(P); b.innerHTML = body(R, P); b.setAttribute("data-ms", String(Date.now() - t0)); }, 30);
    }).catch(function(){ var b = box.querySelector("#mcb"); if (b) b.innerHTML = '<p class="note">계산하지 못했어요.</p>'; });
  }
  function mount(){
    if ((typeof cur === "undefined" ? "" : cur) !== "score") return;
    var m = document.getElementById("main"); if (!m || document.getElementById("mc10k")) return;
    var box = document.createElement("section"); box.className = "card mc no-clp"; box.id = "mc10k"; box.setAttribute("data-xc", "1"); box.setAttribute("data-xs", "keep");
    var hero = m.querySelector(":scope > .hero"); if (hero) hero.insertAdjacentElement("afterend", box); else m.insertBefore(box, m.firstChild);
    paint(box);
  }
  var T = 0;
  new MutationObserver(function(){ if (T) return; T = setTimeout(function(){ T = 0; mount(); }, 120); }).observe(document.documentElement, {childList: true, subtree: true});
  window.mc10k = {runPort: runPort, runSig: runSig, portData: portData, sigData: sigData};

  var css = document.createElement("style");
  css.textContent =
    ".mc-seg{display:flex;gap:6px;margin:0 0 14px;overflow-x:auto;scrollbar-width:none}.mc-seg::-webkit-scrollbar{display:none}" +
    ".mc-seg button{flex:none;font:inherit;font-size:15px;font-weight:700;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--sub)}.mc-seg button.on{background:var(--text);color:var(--bg);border-color:transparent}" +
    ".mc-big small{display:block;font-size:14px;font-weight:700;color:var(--sub)}.mc-big>b{display:block;font-size:clamp(44px,13vw,58px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin:2px 0 6px}.mc-big>b.up{color:var(--up,#f04452)}.mc-big>b.dn{color:var(--down,#3182f6)}.mc-big p b{color:var(--text);font-weight:800}" +
    ".mc-big p{margin:0 0 14px;font-size:15px;line-height:1.55;color:var(--sub);word-break:keep-all}" +
    ".mc-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}.mc-g>div{background:var(--panel2);border-radius:14px;padding:10px 10px 9px;min-width:0}" +
    ".mc-g small{display:block;font-size:13px;color:var(--sub);font-weight:600;line-height:1.3;word-break:keep-all}.mc-g b{display:block;font-size:19px;font-weight:900;letter-spacing:-.6px;margin:3px 0 2px;white-space:nowrap}.mc-g em{display:block;font-style:normal;font-size:13px;color:var(--dim);line-height:1.3;word-break:keep-all}" +
    ".mc-g b.up{color:var(--up,#f04452)}.mc-g b.dn{color:var(--down,#3182f6)}" +
    ".mc-ht small{display:block;font-size:13.5px;color:var(--sub);margin-bottom:4px}.mc-h{width:100%;height:auto;display:block}.mc-h rect.u{fill:var(--up,#f04452);opacity:.85}.mc-h rect.d{fill:var(--down,#3182f6);opacity:.85}.mc-h .z{stroke:var(--text);stroke-width:1.2;stroke-dasharray:3 3}.mc-h text{fill:var(--dim);font-size:11px}" +
    ".mc-n{margin:12px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:var(--sub)}.mc-n li{margin:3px 0}.mc-n b{color:var(--text)}" +
    ".mc-w{background:color-mix(in srgb,#f59f00 14%,var(--panel));border:1px solid color-mix(in srgb,#f59f00 40%,transparent);border-radius:14px;padding:10px 12px;font-size:14px;line-height:1.5;margin-bottom:12px}" +
    ".mc-f{display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap}.mc-f button{font:inherit;font-size:15px;font-weight:800;padding:10px 16px;border-radius:999px;border:0;background:var(--acc,#3182f6);color:#fff}.mc-f small{font-size:13px;color:var(--dim)}";
  document.head.appendChild(css);
})();
