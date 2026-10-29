/* CH Investing — 🎱 로또 (10/29 사용자: 「이제까지 우리나라 로또 당첨 번호 다 조사해서 당첨 확률 높이는 조합 만들기」)
   정직한 원칙: 어떤 조합이든 1등 확률은 똑같이 1/8,145,060 — 과거 번호로 다음 번호는 못 맞힘.
   올릴 수 있는 건 「당첨됐을 때 받는 돈」 — 1~3등은 당첨자끼리 나누므로, 남들이 덜 찍는 조합이면 혼자(소수와) 받음.
   그래서 이 화면은 ① 1회부터 전 회차(archive/x/lotto.json · lotto.py 가 토요일마다 받음) ② 회차별 「1등 몇 명이 겹쳤나」로 사람들이 많이 찍는 패턴을 역으로 재서
   ③ 덜 겹치는 조합을 만들고 점수(예상 겹침 배수)를 보여 줌 ④ 번호별 통계(재미) ⑤ 내 번호 당첨 확인 ⑥ 사주·타로 행운 번호(재미). 계산은 전부 휴대폰 안.
   데이터 근거: 판매액 ÷ 1게임 값 = 팔린 게임 수 → 우연이면 1등 기대 인원 = 게임 수 / 8,145,060. 실제 1등 인원 ÷ 기대 인원 = 「겹침 배수」(1이면 무작위, 3이면 남들이 3배 많이 찍은 조합) */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function hash(s){ var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function won(v){ return v >= 1e8 ? (Math.round(v / 1e7) / 10).toFixed(1).replace(/\.0$/, "") + "억" : v >= 1e4 ? Math.round(v / 1e4).toLocaleString("ko-KR") + "만" : Math.round(v).toLocaleString("ko-KR"); }
  var TOTAL = 8145060;
  var D = null, LOADP = null, MODEL = null;
  function load(){ if (LOADP) return LOADP; LOADP = fetch("archive/x/lotto.json?v=" + Math.floor(Date.now() / 3600e3)).then(function(r){ if (!r.ok) throw 0; return r.json(); }).then(function(j){ D = j; MODEL = fit(j.draws); return j; }, function(err){ LOADP = null; throw err; }); return LOADP; }

  /* ───────── 공 색 (동행복권 공 색) ───────── */
  function bcol(n){ return n <= 10 ? "#f5b400" : n <= 20 ? "#2f8de4" : n <= 30 ? "#ef4e4e" : n <= 40 ? "#7f8a99" : "#3cb44b"; }
  function ball(n, sm, dim){ return '<span class="lt-b' + (sm ? " sm" : "") + (dim ? " dim" : "") + '" style="background:' + bcol(n) + '">' + n + '</span>'; }

  /* ───────── 조합의 특징 (사람들이 많이 찍는 패턴) ───────── */
  function price(d){ return d.d < "2004-08-22" ? 2000 : 1000; }   // 1게임 값 (2004-08 이전 2,000원)
  function feats(w){
    var s = w.slice().sort(function(a, b){ return a - b; }), sum = s.reduce(function(a, b){ return a + b; }, 0);
    var bday = s.filter(function(n){ return n <= 31; }).length, lucky = s.filter(function(n){ return n === 3 || n === 7 || n === 8 || n === 9; }).length;
    var consec = 0; for (var i = 1; i < 6; i++) if (s[i] === s[i - 1] + 1) consec++;
    var ld = {}, dec = {}; s.forEach(function(n){ ld[n % 10] = (ld[n % 10] || 0) + 1; dec[Math.floor((n - 1) / 10)] = (dec[Math.floor((n - 1) / 10)] || 0) + 1; });
    var maxLd = Math.max.apply(null, Object.keys(ld).map(function(k){ return ld[k]; })), maxDec = Math.max.apply(null, Object.keys(dec).map(function(k){ return dec[k]; }));
    var odd = s.filter(function(n){ return n % 2; }).length;
    // 용지 줄: 7칸 한 줄 (1~7, 8~14 …) — 세로줄(차 7) · 대각선(차 6·8)로 3개 이상 이어지면 「그림 찍기」
    var line = 0; [6, 7, 8].forEach(function(k){ var run = 1, best = 1; for (var i = 1; i < 6; i++){ if (s[i] - s[i - 1] === k && (k !== 6 && k !== 8 || Math.floor((s[i] - 1) / 7) === Math.floor((s[i - 1] - 1) / 7) + 1)) run++; else run = 1; best = Math.max(best, run); } line = Math.max(line, best); });
    var ar = 0; for (var a = 0; a < 4; a++) for (var b = a + 1; b < 5; b++){ var df = s[b] - s[a]; if (df > 0 && df <= 8 && s.indexOf(s[b] + df) >= 0) ar++; }   // 등차 3개(2·4·6 같은)
    return {sum: sum, bday: bday, lucky: lucky, consec: consec, maxLd: maxLd, maxDec: maxDec, odd: odd, line: line, ar: ar, allLow: s[5] <= 31 ? 1 : 0, hi: s[0] >= 32 ? 1 : 0};
  }
  var BUCKETS = [
    ["bday", "생일 번호(1~31) 개수", function(f){ return f.bday <= 2 ? "0~2개" : f.bday <= 4 ? "3~4개" : f.bday === 5 ? "5개" : "6개 전부"; }],
    ["lucky", "행운수(3·7·8·9)", function(f){ return f.lucky === 0 ? "없음" : f.lucky === 1 ? "1개" : "2개+"; }],
    ["consec", "연속 번호 쌍", function(f){ return f.consec === 0 ? "없음" : f.consec === 1 ? "1쌍" : "2쌍+"; }],
    ["sum", "여섯 수 합", function(f){ return f.sum < 100 ? "100 미만" : f.sum < 130 ? "100~129" : f.sum < 160 ? "130~159" : f.sum < 190 ? "160~189" : "190+"; }],
    ["odd", "홀짝", function(f){ return f.odd === 0 || f.odd === 6 ? "한쪽만" : f.odd === 1 || f.odd === 5 ? "5:1" : "고름"; }],
    ["dec", "같은 10단위 몰림", function(f){ return f.maxDec >= 4 ? "4개+" : f.maxDec === 3 ? "3개" : "2개 이하"; }],
    ["ld", "끝자리 같은 수", function(f){ return f.maxLd >= 3 ? "3개+" : "2개 이하"; }],
    ["line", "용지 줄 그림(세로·대각)", function(f){ return f.line >= 3 ? "3개+" : "없음"; }],
    ["ar", "등차 패턴(2·4·6 식)", function(f){ return f.ar >= 2 ? "있음" : "없음"; }]
  ];
  // 겹침 배수: 3등(5개 맞음 · 228가지)과 4등(4개 · 11,115가지)은 당첨자가 수천~수십만 명이라 우연 흔들림이 작음 → 1등(몇 명)보다 훨씬 믿을 만한 「사람들이 이 근처를 얼마나 찍었나」 신호
  function crowd(d){ var games = d.sales / price(d); if (!games || games < 1e6) return null;
    var r = [], ex3 = games * 228 / TOTAL, ex4 = games * 11115 / TOTAL;
    if (d.c3) r.push(Math.log(d.c3 / ex3)); if (d.c4) r.push(Math.log(d.c4 / ex4));
    if (!r.length) return d.c1 == null ? null : Math.max(0.05, d.c1 / (games / TOTAL));
    return Math.exp(r.reduce(function(a, b){ return a + b; }, 0) / r.length); }
  function crowd1(d){ var games = d.sales / price(d); return games ? d.c1 / (games / TOTAL) : null; }
  /* 모델: 번호 45개 + 패턴 6개의 「인기도」를 ridge 회귀로 추정 (목표값 = 회차별 3·4등 겹침 배수의 로그) → 1등 인원으로 보정(k)
     검증(앱이 열릴 때마다 다시 함): 홀수 회차로 배우고 짝수 회차를 5등분 → 「덜 겹친다고 본 쪽」의 실제 1등 1인당 당첨금이 정말 컸나 */
  function xv(w){ var f = feats(w), v = new Array(51); for (var i = 0; i < 51; i++) v[i] = 0; w.forEach(function(n){ v[n - 1] = 1; });
    v[45] = f.consec >= 1 ? 1 : 0; v[46] = f.consec >= 2 ? 1 : 0; v[47] = f.line >= 3 ? 1 : 0; v[48] = f.ar >= 2 ? 1 : 0; v[49] = f.maxLd >= 3 ? 1 : 0; v[50] = f.maxDec >= 4 ? 1 : 0; return v; }
  function solve(A, b){ var n = b.length; A = A.map(function(r, i){ return r.concat([b[i]]); });
    for (var i = 0; i < n; i++){ var p = i; for (var r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; var t = A[i]; A[i] = A[p]; A[p] = t;
      for (r = 0; r < n; r++){ if (r === i) continue; var f = A[r][i] / A[i][i]; if (!f) continue; for (var c = i; c <= n; c++) A[r][c] -= f * A[i][c]; } }
    return A.map(function(r, i){ return r[n] / r[i]; }); }
  function ridge(rows, lam){ var k = 51, XtX = [], Xty = [], m = 0, i, j; for (i = 0; i < k; i++){ XtX.push(new Array(k).fill(0)); Xty.push(0); }
    rows.forEach(function(r){ m += r.y; }); m /= rows.length;
    rows.forEach(function(r){ var x = r.x; for (i = 0; i < k; i++){ if (!x[i]) continue; Xty[i] += r.y - m; for (j = 0; j < k; j++) if (x[j]) XtX[i][j] += 1; } });
    for (i = 0; i < k; i++) XtX[i][i] += lam; return solve(XtX, Xty); }
  function dot(x, b){ var s = 0; for (var i = 0; i < x.length; i++) if (x[i]) s += b[i]; return s; }
  function y34(d){ var g = d.sales / price(d); if (!g || !d.c3 || !d.c4) return null; return (Math.log(d.c3 / (g * 228 / TOTAL)) + Math.log(d.c4 / (g * 11115 / TOTAL))) / 2; }
  function fit(draws){
    var rows = draws.map(function(d){ var c = crowd(d); return c == null ? null : {c: c, f: feats(d.w), d: d}; }).filter(Boolean);
    var all = rows.map(function(r){ return r.c; }), mean = all.reduce(function(a, b){ return a + b; }, 0) / (all.length || 1);
    var TAB = {};
    BUCKETS.forEach(function(B){ var g = {}; rows.forEach(function(r){ var k = B[2](r.f); (g[k] = g[k] || []).push(r.c); });
      TAB[B[0]] = Object.keys(g).map(function(k){ var m = g[k].reduce(function(a, b){ return a + b; }, 0) / g[k].length; return {k: k, n: g[k].length, m: m}; }); });
    var R = draws.filter(function(d){ return d.n >= 120; }).map(function(d){ return {n: d.n, d: d, y: y34(d), x: xv(d.w)}; }).filter(function(r){ return r.y != null; });
    var b = ridge(R, 10);
    // 1등 인원으로 보정: 실제 1등 수 ~ 포아송(기대 × e^(k·인기도))
    var pts = R.map(function(r){ return {p: dot(r.x, b), c: r.d.c1 || 0, ex: r.d.sales / price(r.d) / TOTAL}; }), best = null;
    for (var k = 0; k <= 8; k += 0.25){ var sc = pts.reduce(function(s, q){ return s + q.c; }, 0), se = pts.reduce(function(s, q){ return s + q.ex * Math.exp(k * q.p); }, 0), a = Math.log(sc / se);
      var L = pts.reduce(function(s, q){ return s + q.c * (a + k * q.p) - q.ex * Math.exp(a + k * q.p); }, 0); if (!best || L > best.L) best = {k: k, L: L}; }
    // 검증: 홀수 회차로 배우고 → 짝수 회차 5등분
    var bo = ridge(R.filter(function(r){ return r.n % 2; }), 10), te = R.filter(function(r){ return !(r.n % 2); }).map(function(r){ return {p: dot(r.x, bo), d: r.d}; }).sort(function(a, b2){ return a.p - b2.p; });
    var val = []; for (var q = 0; q < 5; q++){ var sl = te.slice(Math.floor(q * te.length / 5), Math.floor((q + 1) * te.length / 5)), c = 0, ex = 0, pay = 0, pn = 0;
      sl.forEach(function(r){ c += r.d.c1 || 0; ex += r.d.sales / price(r.d) / TOTAL; if (r.d.c1 > 0){ pay += r.d.p1; pn++; } }); val.push({ratio: c / ex, pay: pn ? pay / pn : 0, n: sl.length}); }
    return {rows: rows, mean: 1, raw: mean, TAB: TAB, n: rows.length, b: b, k: best.k, val: val, nfit: R.length};
  }
  function predict(w){ return {mult: Math.exp(MODEL.k * dot(xv(w), MODEL.b)), f: feats(w)}; }
  function numPop(){ var out = []; for (var n = 1; n <= 45; n++) out.push({n: n, m: Math.exp(MODEL.k * MODEL.b[n - 1])}); return out; }
  function whyList(w){
    var f = feats(w), out = [];
    if (f.bday <= 2) out.push(["✅", "생일 번호(1~31)가 " + f.bday + "개뿐 — 생일로 찍는 사람과 안 겹쳐요"]); else if (f.bday === 6) out.push(["⚠️", "여섯 개가 다 31 이하 — 생일 찍기와 많이 겹쳐요"]);
    if (f.consec === 0) out.push(["✅", "연속 번호 없음"]); else if (f.consec >= 2) out.push(["⚠️", "연속 번호 " + f.consec + "쌍 — 「줄줄이」 찍는 사람과 겹쳐요"]);
    if (f.line >= 3) out.push(["⚠️", "용지에서 한 줄로 이어져요 — 그림 찍기와 겹쳐요"]);
    if (f.ar >= 2) out.push(["⚠️", "등차 패턴(2·4·6 식)이 있어요"]);
    if (f.odd === 0 || f.odd === 6) out.push(["ℹ️", "홀수·짝수가 한쪽뿐 — 드물어 보이지만 확률은 같아요"]);
    if (f.sum >= 130 && f.sum < 190) out.push(["✅", "합 " + f.sum + " — 사람들이 몰리는 낮은 합 구간을 피했어요"]); else if (f.sum < 100) out.push(["⚠️", "합 " + f.sum + " — 낮은 수 위주라 겹치기 쉬워요"]);
    if (f.lucky === 0) out.push(["✅", "3·7·8·9 없음 — 「행운수」 찍기와 안 겹쳐요"]);
    if (MODEL){ var P = numPop(), pop = w.filter(function(n){ return P[n - 1].m >= 1.02; }), un = w.filter(function(n){ return P[n - 1].m <= 0.98; });
      if (un.length >= 3) out.unshift(["✅", "남들이 덜 찍는 번호 " + un.join("·") + " 위주"]); else if (pop.length >= 3) out.unshift(["⚠️", "인기 번호 " + pop.join("·") + "가 많아요"]); }
    return out;
  }
  function pastHit(w){ var set = {}; w.forEach(function(n){ set[n] = 1; }); var best = 0, bestD = null; D.draws.forEach(function(d){ var m = d.w.filter(function(n){ return set[n]; }).length; if (m > best){ best = m; bestD = d; } }); return {m: best, d: bestD}; }

  /* ───────── 조합 만들기 ───────── */
  function rnd(){ return Math.random(); }
  function gen(opts){
    var fixed = opts.fixed || [], ex = {}; (opts.exclude || []).forEach(function(n){ ex[n] = 1; });
    var pool = []; for (var n = 1; n <= 45; n++) if (!ex[n] && fixed.indexOf(n) < 0) pool.push(n);
    var best = [], tries = 2500;
    for (var t = 0; t < tries; t++){
      var p = pool.slice(), w = fixed.slice();
      while (w.length < 6 && p.length){ var i = Math.floor(rnd() * p.length); w.push(p.splice(i, 1)[0]); }
      if (w.length < 6) break;
      w.sort(function(a, b){ return a - b; });
      var f = feats(w); if (opts.strict && (f.consec >= 2 || f.line >= 3 || f.maxLd >= 3 || f.maxDec >= 4 || f.odd === 0 || f.odd === 6)) continue;
      var pr = predict(w), hit = pastHit(w); if (hit.m >= 5) continue;   // 과거 1등과 5개 이상 겹치는 건 피함(그 번호를 다시 찍는 사람 많음)
      best.push({w: w, mult: pr.mult});
    }
    best.sort(function(a, b){ return a.mult - b.mult; });
    var out = [], seen = {};
    var lim = opts.mode === "best" ? best.length : Math.min(best.length, 400);   // 섞어서: 덜 겹치는 상위 400개 중에서 고루
    var cand = opts.mode === "best" ? best : best.slice(0, lim).sort(function(){ return Math.random() - 0.5; });
    for (var k = 0; k < cand.length && out.length < (opts.count || 5); k++){ var key = cand[k].w.join(","); if (seen[key]) continue;
      var tooClose = out.some(function(o){ return o.w.filter(function(n){ return cand[k].w.indexOf(n) >= 0; }).length > 2; }); if (tooClose) continue;   // 서로 3개 이상 겹치지 않게
      seen[key] = 1; out.push(cand[k]); }
    out.sort(function(a, b){ return a.mult - b.mult; });
    return out;
  }
  function luckyNums(){   // 재미: 사주 용신·희신 숫자 + 타로 오늘의 카드 + 오늘 날짜 → 결정적 6개
    try {
      var L = ls("sj_people") || [], id = ls("sj_sel"), p = L.filter(function(x){ return x.id === id; })[0] || L[0], t = window.SJ ? SJ.todayKST() : {y: 0, m: 0, d: 0};
      var seed = "lt" + (p ? p.id : "x") + t.y + t.m + t.d, base = [], why = [];
      if (p && window.SJ && window.SJT){ var R = SJ.calc({name: p.name, sex: p.sex, cal: p.cal, y: p.y, m: p.m, d: p.d, leap: p.leap, hh: p.hh, mi: p.mi, city: p.city}), NUM = SJT.NUMW;
        NUM[R.yong].forEach(function(n){ base.push(n); }); why.push(SJT.EL_KO[R.yong] + " 숫자 " + NUM[R.yong].join("·") + "(" + p.name + " 님 용신)");
        var dl = SJ.dayLuck(R, t.y, t.m, t.d); base.push(((dl.score % 45) || 45)); why.push("오늘 운세 점수 " + dl.score);
        base.push(R.solar.d <= 45 ? R.solar.d : R.solar.d - 30); }
      var a = hash(seed), out = []; base.forEach(function(n){ n = ((n - 1) % 45) + 1; if (out.indexOf(n) < 0) out.push(n); });
      var k = 0; while (out.length < 6){ var n = (hash(seed + k++) % 45) + 1; if (out.indexOf(n) < 0) out.push(n); }
      out = out.slice(0, 6).sort(function(x, y){ return x - y; });
      why.push("나머지는 오늘 날짜로 섞음 · 하루 동안 같은 번호");
      return {w: out, why: why};
    } catch(x) { return null; }
  }

  /* ───────── 통계 ───────── */
  function stats(){
    var draws = D.draws, cnt = {}, last50 = {}; for (var n = 1; n <= 45; n++){ cnt[n] = 0; last50[n] = 0; }
    draws.forEach(function(d, i){ d.w.forEach(function(n){ cnt[n]++; if (i >= draws.length - 50) last50[n]++; }); });
    var exp = draws.length * 6 / 45, arr = []; for (n = 1; n <= 45; n++) arr.push({n: n, c: cnt[n], r: last50[n]});
    var hot = arr.slice().sort(function(a, b){ return b.c - a.c; }).slice(0, 6), cold = arr.slice().sort(function(a, b){ return a.c - b.c; }).slice(0, 6);
    var gap = {}; for (n = 1; n <= 45; n++){ gap[n] = 0; for (var i = draws.length - 1; i >= 0; i--){ if (draws[i].w.indexOf(n) >= 0) break; gap[n]++; } }
    var cold2 = arr.map(function(x){ return {n: x.n, g: gap[x.n]}; }).sort(function(a, b){ return b.g - a.g; }).slice(0, 6);
    var rows = MODEL.rows.filter(function(r){ return r.d.n >= 120; }).map(function(r){ return {c: crowd1(r.d), d: r.d}; }).filter(function(r){ return r.c != null; }), crowdy = rows.slice().sort(function(a, b){ return b.c - a.c; }).slice(0, 5), lonely = rows.filter(function(r){ return r.d.c1 >= 1; }).sort(function(a, b){ return a.c - b.c; }).slice(0, 5), zero = draws.filter(function(d){ return d.c1 === 0; }).length;
    var odd = [0, 0, 0, 0, 0, 0, 0]; draws.forEach(function(d){ odd[feats(d.w).odd]++; });
    var sums = draws.map(function(d){ return feats(d.w).sum; }).sort(function(a, b){ return a - b; });
    return {arr: arr, exp: exp, hot: hot, cold: cold, cold2: cold2, crowdy: crowdy, lonely: lonely, zero: zero, odd: odd, sumMed: sums[Math.floor(sums.length / 2)], sumQ1: sums[Math.floor(sums.length * 0.25)], sumQ3: sums[Math.floor(sums.length * 0.75)]};
  }
  function rank(m, bonus){ return m === 6 ? 1 : m === 5 && bonus ? 2 : m === 5 ? 3 : m === 4 ? 4 : m === 3 ? 5 : 0; }
  function check(w){
    var set = {}; w.forEach(function(n){ set[n] = 1; }); var out = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}, best = null;
    D.draws.forEach(function(d){ var m = d.w.filter(function(n){ return set[n]; }).length, r = rank(m, set[d.b]); if (r){ out[r]++; if (!best || r < best.r) best = {r: r, d: d, m: m}; } });
    return {out: out, best: best};
  }

  /* ───────── 스타일 ───────── */
  function css(){
    if (document.getElementById("lt-css")) return;
    var st = document.createElement("style"); st.id = "lt-css";
    st.textContent = [
      ".lt-b{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;color:#fff;font-weight:900;font-size:16px;margin:2px;box-shadow:inset -3px -4px 6px rgba(0,0,0,.25),0 2px 4px rgba(0,0,0,.25);text-shadow:0 1px 1px rgba(0,0,0,.3)}",
      ".lt-b.sm{width:28px;height:28px;font-size:12.5px;margin:1px}.lt-b.dim{opacity:.35}.lt-balls{display:flex;flex-wrap:wrap;align-items:center;gap:2px}.lt-plus{color:var(--dim);font-weight:800;margin:0 4px}",
      ".lt-hero{position:relative;overflow:hidden;border-radius:22px;padding:18px 16px;margin-bottom:12px;color:#fff;background:radial-gradient(circle at 15% 0%,#2a6b3f,#0f2a1a 60%,#0a1810);border:1px solid #3cb44b55}",
      ".lt-hero h2{margin:0 0 4px;font-size:20px;color:#c8f5c8}.lt-hero p{margin:0;font-size:13px;opacity:.88;line-height:1.55}",
      ".lt-truth{background:color-mix(in srgb,#e9b949 14%,var(--panel));border:1px solid #e9b94966;border-radius:16px;padding:12px 14px;margin-bottom:12px;font-size:13.5px;line-height:1.6}.lt-truth b{color:#e9b949}",
      ".lt-set{border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin-bottom:8px;background:var(--panel2)}.lt-set .top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.lt-set .sc{margin-left:auto;text-align:right;font-size:12px;color:var(--dim)}.lt-set .sc b{display:block;font-size:17px;color:var(--text)}",
      ".lt-why{font-size:12.5px;color:var(--sub);margin-top:6px;line-height:1.5}.lt-why div{display:flex;gap:6px}",
      ".lt-row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.lt-row button{flex:1;min-width:30%;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px 8px;font:inherit;font-weight:700;font-size:13.5px;cursor:pointer}.lt-row button.on{background:#3cb44b;color:#fff;border-color:#3cb44b}",
      ".lt-go{width:100%;border:0;border-radius:14px;padding:14px;font:inherit;font-weight:900;font-size:16px;cursor:pointer;background:linear-gradient(135deg,#3cb44b,#9be58a);color:#0a1810;box-shadow:0 6px 18px rgba(60,180,75,.3)}",
      ".lt-pick{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:4px}.lt-pick button{width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;aspect-ratio:1;border-radius:50%;border:1.5px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-weight:800;font-size:13px;cursor:pointer;padding:0!important;margin:0!important}",
      ".lt-pick button.on{color:#fff;border-color:transparent}.lt-pick button.ex{opacity:.3;text-decoration:line-through}",
      ".lt-bars{display:grid;grid-template-columns:repeat(45,minmax(0,1fr));gap:1px;align-items:end;height:130px}.lt-bars div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:8.5px;color:var(--dim);min-width:0}.lt-bars i{display:block;width:100%;border-radius:2px 2px 0 0}.lt-bars span{height:11px;line-height:11px;overflow:visible;white-space:nowrap}",
      ".lt-tbl{width:100%;border-collapse:collapse;font-size:12.5px}.lt-tbl td,.lt-tbl th{padding:6px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}.lt-tbl th{color:var(--dim);font-weight:600}.lt-tbl td.r{text-align:right;white-space:nowrap}",
      ".lt-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.lt-kpi div{background:var(--panel2);border-radius:12px;padding:9px 6px;text-align:center}.lt-kpi b{display:block;font-size:16px}.lt-kpi small{font-size:11px;color:var(--dim)}",
      ".lt-seg{display:flex;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:10px}.lt-seg button{flex:1;border:0;background:var(--panel2);color:var(--sub);padding:10px 2px;font:inherit;font-size:12.5px;white-space:nowrap;font-weight:700;cursor:pointer}.lt-seg button.on{background:#3cb44b;color:#fff}",
      "#ltR .sj-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:12px;font:inherit;font-weight:700;cursor:pointer;background:var(--panel);color:var(--text);border:1px solid var(--line)}",
      ".lt-mine{border:1px solid var(--line);border-radius:12px;padding:9px 11px;margin-bottom:7px;background:var(--panel2);display:flex;align-items:center;gap:8px;flex-wrap:wrap}.lt-mine small{color:var(--dim);width:100%}.lt-mine .x{margin-left:auto;background:none;border:0;color:var(--dim);font-size:16px;cursor:pointer}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ───────── 화면 ───────── */
  var ST = {view: "make", fixed: [], exclude: [], mode: "mix", strict: true, sets: null, chk: []};
  function root(){ return document.getElementById("ltR"); }
  function render(){
    var R = root(); if (!R) return; css();
    if (!D){ R.innerHTML = '<div class="loading">당첨 번호를 불러오는 중…</div>'; load().then(render, function(){ R.innerHTML = '<div class="card">아직 당첨 번호 자료가 없어요. 토요일 추첨 뒤 자동으로 모이고, 처음 한 번은 1회부터 전부 받아요(몇 분). 잠시 뒤 다시 열어 주세요.</div>'; }); return; }
    var last = D.draws[D.draws.length - 1], S = stats();
    var h = '<div class="lt-hero"><h2>🎱 로또 — 덜 겹치는 번호</h2><p>' + D.count + '회차 전부(1회~' + D.latest + '회) 분석 · ' + e(D.updated) + ' 기준</p>' +
      '<div style="margin-top:12px;font-size:12px;opacity:.8">최신 ' + last.n + '회 (' + last.d + ')</div><div class="lt-balls" style="margin-top:4px">' + last.w.map(function(n){ return ball(n); }).join("") + '<span class="lt-plus">+</span>' + ball(last.b) + '</div>' +
      '<div style="font-size:12.5px;margin-top:8px;opacity:.9">1등 ' + last.c1 + '명 · 1인당 ' + won(last.p1) + '원' + (crowd1(last) != null ? ' · 1등 겹침 <b>' + crowd1(last).toFixed(1) + '배</b>' : "") + '</div></div>';
    h += '<div class="lt-truth"><b>정직하게 —</b> 어떤 번호든 1등 확률은 똑같이 <b>814만 분의 1</b>이에요. 과거 번호로 다음 번호는 못 맞혀요.<br>대신 <b>당첨됐을 때 받는 돈</b>은 바꿀 수 있어요. 1~3등은 당첨자끼리 나누니까, <b>남들이 덜 찍는 조합</b>이면 혼자 받아요. ' + D.count + '회차의 3·4등 당첨자 수(회마다 수천~수십만 명)로 사람들이 많이 찍는 번호·패턴을 재서, 덜 겹치는 조합을 만들어요.</div>';
    h += '<div class="lt-seg">' + [["make", "🎯 번호 만들기"], ["stat", "📊 통계"], ["check", "✅ 당첨 확인"], ["mine", "💾 내 번호"]].map(function(x){ return '<button data-v="' + x[0] + '" class="' + (ST.view === x[0] ? "on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>';
    if (ST.view === "make") h += viewMake(S);
    else if (ST.view === "stat") h += viewStat(S);
    else if (ST.view === "check") h += viewCheck();
    else h += viewMine();
    h += '<p class="sj-note">🎱 자료: 동행복권 공식 회차별 당첨 결과(매주 토요일 자동 수집). 「겹침 배수」는 판매액으로 셈한 기대 1등 인원 대비 실제 인원이에요. 로또는 기대 수익이 마이너스인 놀이예요 — 즐길 만큼만, 생활비는 넣지 마세요. 이 화면은 당첨을 보장하지 않아요.</p>';
    R.innerHTML = h; bind();
  }
  function setCard(x, i, extra){
    var hit = pastHit(x.w), pct = Math.round((1 - x.mult / MODEL.mean) * 100);
    return '<div class="lt-set"><div class="top"><div class="lt-balls">' + x.w.map(function(n){ return ball(n); }).join("") + '</div><div class="sc">예상 겹침<b>' + x.mult.toFixed(2) + '배</b>' + (pct > 0 ? '<span style="color:#3cb44b">평균보다 ' + pct + '% 덜 겹침</span>' : '<span style="color:#f08a4b">평균보다 ' + (-pct) + '% 더 겹침</span>') + '</div></div>' +
      '<div class="lt-why">' + whyList(x.w).slice(0, 3).map(function(w){ return '<div><span>' + w[0] + '</span><span>' + e(w[1]) + '</span></div>'; }).join("") + (hit.d ? '<div><span>🕰</span><span>과거 1등과 최대 ' + hit.m + '개 겹침 (' + hit.d.n + '회)</span></div>' : "") + '</div>' +
      '<div style="display:flex;gap:6px;margin-top:8px"><button class="sj-btn g" data-save="' + x.w.join(",") + '" style="flex:1;padding:8px;font-size:13px">💾 내 번호로 저장</button><button class="sj-btn g" data-copy="' + x.w.join(" ") + '" style="flex:1;padding:8px;font-size:13px">📋 복사</button></div>' + (extra || "") + '</div>';
  }
  function viewMake(S){
    var h = '<div class="card"><h3>어떻게 만들까요?</h3><div class="lt-row">' + [["mix", "🎲 섞어서 5개"], ["best", "🏆 가장 덜 겹치는 5개"]].map(function(x){ return '<button data-mode="' + x[0] + '" class="' + (ST.mode === x[0] ? "on" : "") + '">' + x[1] + '</button>'; }).join("") +
      '<button data-strict="1" class="' + (ST.strict ? "on" : "") + '">🧹 패턴 번호 빼기 ' + (ST.strict ? "켬" : "끔") + '</button></div>' +
      '<div style="font-size:12.5px;color:var(--sub);margin:6px 0 4px">꼭 넣을 번호(초록) · 뺄 번호(두 번 누르면 회색)</div><div class="lt-pick" id="ltPick">' + (function(){ var s = ""; for (var n = 1; n <= 45; n++){ var on = ST.fixed.indexOf(n) >= 0, ex = ST.exclude.indexOf(n) >= 0; s += '<button data-n="' + n + '" class="' + (on ? "on" : ex ? "ex" : "") + '"' + (on ? ' style="background:' + bcol(n) + '"' : "") + '>' + n + '</button>'; } return s; })() + '</div>' +
      '<button class="lt-go" id="ltGo" style="margin-top:12px">🎱 번호 만들기</button></div>';
    if (ST.sets) h += '<div class="card"><h3>만든 번호 <small style="font-weight:500;color:var(--dim)">겹침 배수 낮을수록 혼자 받을 가능성 ↑</small></h3>' + ST.sets.map(function(x, i){ return setCard(x, i); }).join("") + '</div>';
    var LK = luckyNums();
    if (LK){ var pr = predict(LK.w); h += '<div class="card"><h3>🔮 오늘의 행운 번호 <small style="font-weight:500;color:var(--dim)">재미로 — 사주·오늘 운세로</small></h3>' + setCard({w: LK.w, mult: pr.mult}, 0, '<div class="lt-why" style="margin-top:6px">' + LK.why.map(function(w){ return '<div><span>✨</span><span>' + e(w) + '</span></div>'; }).join("") + '</div>') + '</div>'; }
    h += '<div class="card"><h3>사람들은 이렇게 찍어요 <small style="font-weight:500;color:var(--dim)">' + MODEL.n + '회차 겹침 배수로 잰 것</small></h3><table class="lt-tbl"><tr><th>패턴</th><th>회차 수</th><th class="r">겹침 배수</th></tr>' +
      BUCKETS.slice(0, 5).map(function(B){ return MODEL.TAB[B[0]].sort(function(a, b){ return b.m - a.m; }).map(function(x, i){ return '<tr><td>' + (i === 0 ? '<b>' + B[1] + '</b> ' : "") + x.k + '</td><td>' + x.n + '</td><td class="r" style="color:' + (x.m > MODEL.raw * 1.04 ? "#f08a4b" : x.m < MODEL.raw * 0.96 ? "#3cb44b" : "var(--text)") + ';font-weight:800">' + x.m.toFixed(2) + '배</td></tr>'; }).join(""); }).join("") +
      '</table><p class="sj-note">3·4등 당첨자 수로 잰 겹침 배수(평균 ' + MODEL.raw.toFixed(2) + ') · 1보다 크면 그 패턴을 우연보다 많이 찍었다는 뜻이에요. 3·4등은 당첨자가 수천~수십만 명이라 1등보다 훨씬 믿을 만해요.</p></div>' + valCard();
    return h;
  }
  function valCard(){
    var V = MODEL.val, mx = Math.max.apply(null, V.map(function(v){ return v.pay; })), lab = ["가장 덜 겹친다고 본 20%", "덜 겹침", "보통", "더 겹침", "가장 많이 겹친다고 본 20%"];
    return '<div class="card"><h3>🔬 정말 효과가 있었나? <small style="font-weight:500;color:var(--dim)">' + MODEL.nfit + '회차로 검증</small></h3>' +
      '<p style="font-size:13px;margin:0 0 10px;line-height:1.55">홀수 회차로만 「사람들이 좋아하는 번호」를 배우고, 배운 적 없는 짝수 회차의 당첨 조합을 예측 점수 순서로 5묶음으로 나눠 실제 1등 1인당 당첨금을 비교했어요.</p>' +
      V.map(function(v, i){ var c = i < 2 ? "#3cb44b" : i === 2 ? "#e9b949" : "#f08a4b"; return '<div style="display:grid;grid-template-columns:118px 1fr 52px;gap:8px;align-items:center;margin:6px 0;font-size:12.5px"><span>' + lab[i] + '</span><div style="height:16px;background:var(--panel2);border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:' + (v.pay / mx * 100) + '%;background:' + c + '"></i></div><b style="text-align:right">' + (v.pay / 1e8).toFixed(1) + '억</b></div>'; }).join("") +
      '<p class="sj-note">1등 겹침(실제÷기대): ' + V.map(function(v){ return v.ratio.toFixed(2); }).join(" → ") + '. 덜 겹친다고 본 쪽이 1등을 탔을 때 평균 ' + Math.round((V[0].pay / V[4].pay - 1) * 100) + '% 더 받았어요. 차이는 「몇십 %」 수준이고, 당첨 확률 자체는 그대로예요.</p></div>';
  }
  function popCard(){
    var P = numPop(), mx = Math.max.apply(null, P.map(function(x){ return Math.abs(Math.log(x.m)); })) || 1;
    return '<div class="card"><h3>사람들이 좋아하는 번호 <small style="font-weight:500;color:var(--dim)">빨강 = 많이 찍음 · 초록 = 덜 찍음</small></h3><div class="lt-pick">' + P.map(function(x){ var v = Math.log(x.m) / mx, c = v > 0 ? "rgba(239,78,78," + (0.15 + 0.75 * v) + ")" : "rgba(60,180,75," + (0.15 - 0.75 * v) + ")";
      return '<button style="background:' + c + ';color:var(--text);pointer-events:none;border-color:transparent;font-size:12px;line-height:1.05">' + x.n + '<br><small style="font-size:8.5px;font-weight:600">' + (x.m >= 1 ? "+" : "") + Math.round((x.m - 1) * 100) + '%</small></button>'; }).join("") + '</div>' +
      '<p class="sj-note">숫자 아래 %는 그 번호가 들어간 조합을 남들이 평균보다 얼마나 더(덜) 찍는지예요(1등 겹침 기준). 7·3·1~12 같은 작은 수와 「행운수」가 인기, 40번대는 덜 찍혀요. 나올 확률과는 상관없어요.</p></div>';
  }
  function viewStat(S){
    var max = Math.max.apply(null, S.arr.map(function(x){ return x.c; })); S.minC = Math.min.apply(null, S.arr.map(function(x){ return x.c; }));
    var h = '<div class="card"><h3>번호별 나온 횟수 <small style="font-weight:500;color:var(--dim)">' + D.count + '회 · 기대 ' + S.exp.toFixed(0) + '회</small></h3><div class="lt-bars">' + S.arr.map(function(x){ return '<div title="' + x.n + '번 ' + x.c + '회"><i style="height:calc(' + ((x.c - S.minC) / (max - S.minC) * 80 + 15).toFixed(1) + '% - 11px);background:' + bcol(x.n) + '"></i><span>' + (x.n % 5 === 0 || x.n === 1 ? x.n : "") + '</span></div>'; }).join("") + '</div>' +
      '<p class="sj-note" style="margin:4px 0 0">막대 높이는 가장 적게 나온 수(' + S.minC + '회)~가장 많이 나온 수(' + max + '회) 사이를 늘려 그린 것 — 실제 차이는 ±10% 안팎이에요.</p><div class="lt-kpi" style="margin-top:10px"><div><small>많이 나온 수</small><b>' + S.hot.map(function(x){ return x.n; }).join(" · ") + '</b></div><div><small>적게 나온 수</small><b>' + S.cold.map(function(x){ return x.n; }).join(" · ") + '</b></div><div><small>오래 안 나온 수</small><b>' + S.cold2.map(function(x){ return x.n; }).join(" · ") + '</b></div></div>' +
      '<p class="sj-note">⚠️ 많이 나온 수·안 나온 수는 전부 우연이에요. 다음 회차 확률은 45개 모두 똑같아요. 「오래 안 나왔으니 나올 때가 됐다」는 수학적으로 틀린 생각이에요(도박사의 오류).</p></div>';
    h += popCard();
    h += '<div class="card"><h3>1등이 많이 겹친 회차 <small style="font-weight:500;color:var(--dim)">사람들이 많이 찍은 조합</small></h3><table class="lt-tbl">' + S.crowdy.map(function(r){ return '<tr><td style="white-space:nowrap">' + r.d.n + '회<br><small style="color:var(--dim)">' + r.d.d.slice(2) + '</small></td><td><div class="lt-balls">' + r.d.w.map(function(n){ return ball(n, true); }).join("") + '</div></td><td class="r"><b>' + r.d.c1 + '명</b><br><small style="color:#f08a4b">' + r.c.toFixed(1) + '배 · ' + won(r.d.p1) + '</small></td></tr>'; }).join("") + '</table>' +
      '<h3 style="margin-top:14px">1등을 혼자(소수가) 받은 회차 <small style="font-weight:500;color:var(--dim)">덜 겹친 조합</small></h3><table class="lt-tbl">' + S.lonely.map(function(r){ return '<tr><td style="white-space:nowrap">' + r.d.n + '회<br><small style="color:var(--dim)">' + r.d.d.slice(2) + '</small></td><td><div class="lt-balls">' + r.d.w.map(function(n){ return ball(n, true); }).join("") + '</div></td><td class="r"><b>' + r.d.c1 + '명</b><br><small style="color:#3cb44b">' + r.c.toFixed(1) + '배 · ' + won(r.d.p1) + '</small></td></tr>'; }).join("") + '</table><p class="sj-note">1등이 아무도 없던 회차 ' + S.zero + '번(이월).</p></div>';
    h += '<div class="card"><h3>홀짝 · 합</h3><div class="lt-kpi"><div><small>홀3:짝3</small><b>' + Math.round(S.odd[3] / D.count * 100) + '%</b></div><div><small>4:2 또는 2:4</small><b>' + Math.round((S.odd[4] + S.odd[2]) / D.count * 100) + '%</b></div><div><small>한쪽만(6:0)</small><b>' + Math.round((S.odd[0] + S.odd[6]) / D.count * 100) + '%</b></div></div>' +
      '<p style="font-size:13px;margin:10px 0 0">여섯 수의 합은 절반이 <b>' + S.sumQ1 + '~' + S.sumQ3 + '</b> 사이(가운데 ' + S.sumMed + '). 생일 번호로만 찍으면 합이 100 아래로 떨어져 사람들과 겹치기 쉬워요.</p></div>';
    h += '<div class="card"><h3>최근 10회</h3><table class="lt-tbl">' + D.draws.slice(-10).reverse().map(function(d){ return '<tr><td style="white-space:nowrap">' + d.n + '회<br><small style="color:var(--dim)">' + d.d.slice(2) + '</small></td><td><div class="lt-balls">' + d.w.map(function(n){ return ball(n, true); }).join("") + '<span class="lt-plus">+</span>' + ball(d.b, true) + '</div></td><td class="r">' + d.c1 + '명<br><small style="color:var(--dim)">' + won(d.p1) + '</small></td></tr>'; }).join("") + '</table></div>';
    return h;
  }
  function viewCheck(){
    var h = '<div class="card"><h3>내 번호, 지금까지 몇 번 맞았을까? <small style="font-weight:500;color:var(--dim)">6개 고르기</small></h3><div class="lt-pick" id="ltChk">' + (function(){ var s = ""; for (var n = 1; n <= 45; n++){ var on = ST.chk.indexOf(n) >= 0; s += '<button data-c="' + n + '" class="' + (on ? "on" : "") + '"' + (on ? ' style="background:' + bcol(n) + '"' : "") + '>' + n + '</button>'; } return s; })() + '</div>';
    if (ST.chk.length === 6){ var C = check(ST.chk), pr = predict(ST.chk);
      h += '<div class="lt-balls" style="margin:12px 0 8px">' + ST.chk.slice().sort(function(a, b){ return a - b; }).map(function(n){ return ball(n); }).join("") + '</div>' +
        '<div class="lt-kpi"><div><small>1등</small><b>' + C.out[1] + '번</b></div><div><small>2·3등</small><b>' + (C.out[2] + C.out[3]) + '번</b></div><div><small>4·5등</small><b>' + (C.out[4] + C.out[5]) + '번</b></div></div>' +
        (C.best ? '<p style="font-size:13.5px;margin:10px 0 0">가장 좋았던 건 <b>' + C.best.d.n + '회(' + C.best.d.d + ') ' + C.best.r + '등</b> — ' + C.best.m + '개 맞음.</p>' : '<p style="font-size:13.5px;margin:10px 0 0">' + D.count + '회 동안 5등(3개)도 한 번 없었어요. 이것도 그냥 우연이에요.</p>') +
        '<p class="sj-note">이 조합의 예상 1등 겹침은 평균의 ' + pr.mult.toFixed(2) + '배예요. ' + D.count + '회면 한 조합이 5등 될 기대 횟수는 약 ' + (D.count / 45).toFixed(0) + '번이에요.</p>' +
        '<button class="sj-btn g" data-save="' + ST.chk.slice().sort(function(a, b){ return a - b; }).join(",") + '" style="width:100%;margin-top:8px">💾 내 번호로 저장</button>';
    }
    return h + '</div>';
  }
  function viewMine(){
    var M = ls("lt_mine") || [], last = D.draws[D.draws.length - 1];
    if (!M.length) return '<div class="card" style="text-align:center;padding:24px"><div style="font-size:40px">💾</div>저장한 번호가 없어요.<br><small style="color:var(--dim)">「번호 만들기」에서 저장하면 매주 토요일 뒤 자동으로 맞춰 봐요.</small></div>';
    return '<div class="card"><h3>내 번호 <small style="font-weight:500;color:var(--dim)">최신 ' + last.n + '회와 맞춰 봄</small></h3>' + M.map(function(m, i){ var set = {}; last.w.forEach(function(n){ set[n] = 1; }); var hit = m.w.filter(function(n){ return set[n]; }).length, r = rank(hit, last.b === m.w.filter(function(n){ return n === last.b; })[0]);
      return '<div class="lt-mine"><div class="lt-balls">' + m.w.map(function(n){ return ball(n, true, !set[n]); }).join("") + '</div><button class="x" data-del="' + i + '">✕</button><small>' + e(m.at) + ' 저장 · ' + last.n + '회: ' + hit + '개 맞음' + (r ? ' → <b style="color:#3cb44b">' + r + '등!</b>' : "") + '</small></div>'; }).join("") +
      '<p class="sj-note">저장은 이 휴대폰에만 돼요. 실제 구매·당첨 확인은 동행복권 앱으로 하세요.</p></div>';
  }
  function bind(){
    var R = root(), q = function(s){ return [].slice.call(R.querySelectorAll(s)); };
    q("[data-v]").forEach(function(b){ b.onclick = function(){ ST.view = b.dataset.v; render(); window.scrollTo({top: 0, behavior: "smooth"}); }; });
    q("[data-mode]").forEach(function(b){ b.onclick = function(){ ST.mode = b.dataset.mode; render(); }; });
    q("[data-strict]").forEach(function(b){ b.onclick = function(){ ST.strict = !ST.strict; render(); }; });
    q("#ltPick [data-n]").forEach(function(b){ b.onclick = function(){ var n = +b.dataset.n, fi = ST.fixed.indexOf(n), ei = ST.exclude.indexOf(n);
      if (fi >= 0){ ST.fixed.splice(fi, 1); ST.exclude.push(n); } else if (ei >= 0) ST.exclude.splice(ei, 1); else if (ST.fixed.length < 5) ST.fixed.push(n); render(); }; });
    q("#ltChk [data-c]").forEach(function(b){ b.onclick = function(){ var n = +b.dataset.c, i = ST.chk.indexOf(n); if (i >= 0) ST.chk.splice(i, 1); else if (ST.chk.length < 6) ST.chk.push(n); render(); }; });
    var go = R.querySelector("#ltGo"); if (go) go.onclick = function(){ go.textContent = "🎱 섞는 중…"; setTimeout(function(){ ST.sets = gen({fixed: ST.fixed, exclude: ST.exclude, mode: ST.mode, strict: ST.strict, count: 5}); render(); var c = root().querySelector(".lt-set"); if (c) try { c.scrollIntoView({block: "center", behavior: "smooth"}); } catch(x) {} try { navigator.vibrate && navigator.vibrate([8, 30, 8]); } catch(x) {} }, 60); };
    q("[data-save]").forEach(function(b){ b.onclick = function(){ var M = ls("lt_mine") || [], w = b.dataset.save.split(",").map(Number), t = window.SJ ? SJ.todayKST() : {m: 0, d: 0}; if (M.some(function(m){ return m.w.join(",") === w.join(","); })){ b.textContent = "이미 저장됨"; return; } M.unshift({w: w, at: t.m + "/" + t.d}); ls("lt_mine", M.slice(0, 30)); b.textContent = "✅ 저장됐어요"; }; });
    q("[data-copy]").forEach(function(b){ b.onclick = function(){ var t = b.dataset.copy; var ok = function(){ b.textContent = "✅ 복사됐어요"; }; if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, ok); else ok(); }; });
    q("[data-del]").forEach(function(b){ b.onclick = function(){ var M = ls("lt_mine") || []; M.splice(+b.dataset.del, 1); ls("lt_mine", M); render(); }; });
  }
  window.lottoView = function(){ return '<div id="ltR" class="no-clp tidy-x ez-no" data-noemo="1"><div class="loading">불러오는 중…</div></div>'; };
  window.lottoInit = function(){ render(); };
  window.LOTTO_TEST = {feats: feats, fit: fit, gen: gen, load: load, data: function(){ return D; }, model: function(){ return MODEL; }};
})();
