/* CH Investing — 💰 배당비교 (포트 묶음 · 포트·성적표 옆)
   11/10 사용자 「비슷한 상품의 배당 비교 — 몇 개 비교할지 묻고 → 그만큼 칸 → 종목·ETF 넣고 비교 →
                 뭐는 얼마 뭐는 얼마 · 퍼센트와 백만원 기준 얼마 · 그림으로 보기 편하게 · 언제 배당 주는지도」
   자료: 배당률·가격 = opdata(d/ 주식 · x/ ETF · p/ 가격 · p/fx 환율) · 배당 기록 = archive/x/dv/<샤드>.json (div_cal.yml 주 1회 + 매달 1·16일)
   계산은 휴대폰 안에서 — 주기(월·분기·반기·연)·배당 달·다음 배당 예상·최근 1년 배당률·100만원 기준 금액 */
(function(){
  var e = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var BASE = 1000000, DAY = 864e5;
  var COL = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9", "#2bb3c0", "#8a8f99"];
  var ST = {n: 0, pick: [], done: false};
  try { var s0 = JSON.parse(localStorage.getItem("divc") || "null"); if (s0 && s0.pick) ST = {n: s0.n || s0.pick.length, pick: s0.pick, done: false}; } catch(x) {}
  function keep(){ try { localStorage.setItem("divc", JSON.stringify({n: ST.n, pick: ST.pick})); } catch(x) {} }
  var DV = {};   // 샤드 → 배당 기록

  function won(v){ return v == null || !isFinite(v) ? "–" : Math.round(v).toLocaleString("ko-KR") + "원"; }
  function wonS(v){ if (v == null || !isFinite(v)) return "–"; return (Math.round(v / 10) * 10).toLocaleString("ko-KR") + "원"; }
  function pc(v, d){ return v == null || !isFinite(v) ? "–" : v.toFixed(d == null ? 2 : d) + "%"; }
  function sg(v){ return v == null || !isFinite(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }
  function md(d){ return (d.getMonth() + 1) + "/" + d.getDate(); }
  function ymd(d){ return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function pd(s){ var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtPx(v, c){ if (v == null) return "–"; if (c === "KRW") return Math.round(v).toLocaleString("ko-KR") + "원";
    var sym = {USD: "$", JPY: "¥", HKD: "HK$", CNY: "¥"}[c] || ""; return sym + (v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(2)) + (sym ? "" : " " + c); }
  function idxRow(sym){ return (window.OPIDX || []).filter(function(x){ return x.sym === sym; })[0]; }
  function nmOf(r){ return r ? r.name : ""; }

  // ── 입금 예상(대략): 배당락 → 실제 돈 들어오는 날 ──
  function payOf(ex, mkt, etf, fq){
    var d = new Date(ex.getTime());
    if (mkt === "US") return new Date(d.getTime() + 10 * DAY);
    if (mkt === "KR"){
      if (etf) return new Date(d.getTime() + 5 * DAY);                                   // 월말 기준 → 다음 달 초
      if (d.getMonth() === 11 || fq.n === 1) return new Date(d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear(), 3, 20);   // 결산 배당 → 4월
      return new Date(d.getTime() + 45 * DAY);                                           // 분기·반기 → 한 달 반쯤 뒤
    }
    if (mkt === "JP") return new Date(d.getTime() + 80 * DAY);
    return new Date(d.getTime() + 30 * DAY);
  }
  function freqOf(h){
    if (h.length < 2) return {k: "연 1회", n: 1, g: 365};
    var L = h.slice(-9), gs = [];
    for (var i = 1; i < L.length; i++) gs.push((pd(L[i][0]) - pd(L[i - 1][0])) / DAY);
    gs.sort(function(a, b){ return a - b; }); var m = gs[Math.floor(gs.length / 2)];
    return m <= 45 ? {k: "월배당", n: 12, g: m} : m <= 125 ? {k: "분기배당", n: 4, g: m} : m <= 250 ? {k: "반기배당", n: 2, g: m} : {k: "연 1회", n: 1, g: m};
  }

  // ── 한 종목 자료 모으기 ──
  function load(sym){
    var r = idxRow(sym), sh = opShard(sym), etf = !!(r && r.etf);
    var det = getJSON(OPD + (etf ? "x/" : "d/") + opFile(sym) + ".json").catch(function(){ return null; });
    var px = (OPP[sh] ? Promise.resolve(OPP[sh]) : getJSON(OPD + "p/" + sh + ".json").then(function(j){ OPP[sh] = j; return j; }).catch(function(){ return {}; }));
    var dv = DV[sh] ? Promise.resolve(DV[sh]) : getJSON("archive/x/dv/" + sh + ".json?d=" + new Date().toISOString().slice(0, 10)).then(function(j){ DV[sh] = j; return j; }).catch(function(){ return null; });
    return Promise.all([det, px, dv]).then(function(z){
      var d = z[0] || {}, p = (z[1] || {})[sym], dvs = z[2], rec = dvs ? dvs[sym] : null;
      var cur = d.currency || d.cur || (r && r.mkt === "KR" ? "KRW" : "USD");
      var price = p ? p[1] : (d.price != null ? d.price : null);
      var y0 = etf ? (d.div_yield != null ? +d.div_yield : null) : (d.dividend_yield != null ? d.dividend_yield * 100 : null);
      var o = {sym: sym, r: r, etf: etf, mkt: r ? r.mkt : "", name: nmOf(r) || d.name || sym, cur: cur, price: price, y0: y0, has: !!rec, h: rec && rec.h ? rec.h.slice().sort(function(a, b){ return a[0] < b[0] ? -1 : 1; }) : []};
      o.r1y = p && p[6] && p[6][0] ? (p[1] / p[6][0] - 1) * 100 : null;
      an(o);
      return o;
    });
  }
  function an(o){
    var now = new Date(), h = o.h;
    o.y = o.y0; o.src = "data";
    if (h.length){
      var fq = freqOf(h); o.fq = fq;
      var last = pd(h[h.length - 1][0]);
      o.stale = (now - last) / DAY > fq.g * 1.8 + 45;                       // 한동안 안 줌 → 중단?
      var N = h.slice(-fq.n), P = h.slice(-2 * fq.n, -fq.n);
      var sum = N.reduce(function(a, x){ return a + x[1]; }, 0), psum = P.length === fq.n ? P.reduce(function(a, x){ return a + x[1]; }, 0) : null;
      o.ps = sum;                                                            // 1주당 1년 배당 (현지 돈)
      o.gr = psum ? (sum / psum - 1) * 100 : null;                           // 1년 전보다 배당
      var am = N.map(function(x){ return x[1]; }).sort(function(a, b){ return a - b; }), mid = am[Math.floor(am.length / 2)];
      o.spec = fq.n >= 2 && am[am.length - 1] > mid * 2.5;                  // 특별배당 섞임
      var yy = o.price ? sum / o.price * 100 : null;
      if (yy != null && yy > 0 && yy < 40 && !o.stale){ o.y = yy; o.src = "hist"; }
      else if (o.stale) o.y = 0;
      o.lastEx = last; o.lastAmt = h[h.length - 1][1];
      // 다음 배당락 예상
      var nx = new Date(last.getTime()); while (nx < now) nx = new Date(nx.getTime() + fq.g * DAY);
      o.next = o.stale ? null : nx; o.nextPay = o.next ? payOf(o.next, o.mkt, o.etf, fq) : null;
      // 배당 받는 달(배당락) · 입금 달(대략)
      var exM = {}, payM = {}; N.forEach(function(x){ var dd = pd(x[0]); exM[dd.getMonth() + 1] = 1; payM[payOf(dd, o.mkt, o.etf, fq).getMonth() + 1] = 1; });
      o.exM = Object.keys(exM).map(Number).sort(function(a, b){ return a - b; });
      o.payM = Object.keys(payM).map(Number).sort(function(a, b){ return a - b; });
      // 앞으로 12달 100만원 기준 입금 (지난 1년 일정 그대로 1년 밀어서)
      var y12 = o.y || 0, ann = BASE * y12 / 100, mo = new Array(12).fill(0), m0 = new Date(now.getFullYear(), now.getMonth(), 1);
      if (sum > 0 && !o.stale) N.forEach(function(x){
        var ex = pd(x[0]); while (payOf(ex, o.mkt, o.etf, fq) < m0) ex = new Date(ex.getFullYear() + 1, ex.getMonth(), ex.getDate());
        var pdt = payOf(ex, o.mkt, o.etf, fq), k = (pdt.getFullYear() - m0.getFullYear()) * 12 + pdt.getMonth() - m0.getMonth();
        if (k >= 0 && k < 12) mo[k] += ann * x[1] / sum;
      });
      o.mo = mo; o.spark = h.slice(-12);
      // 다음 배당락 = 지난 1년 일정을 1년 밀어 본 것 중 오늘 뒤 가장 가까운 날 (달력 막대와 같은 기준)
      if (!o.stale){ var cand = N.map(function(x){ var ex = pd(x[0]); while (ex < now) ex = new Date(ex.getFullYear() + 1, ex.getMonth(), ex.getDate()); return ex; })
        .filter(function(d){ return d - last > 20 * DAY; }).sort(function(a, b){ return a - b; })[0];
        if (cand && cand < o.next) { o.next = cand; o.nextPay = payOf(cand, o.mkt, o.etf, fq); } }
    }
    o.ann = o.y != null ? BASE * o.y / 100 : null;                         // 100만원 → 1년 (세전)
    o.per = o.ann != null && o.fq ? o.ann / o.fq.n : null;                  // 1회
    o.tax = o.mkt === "KR" ? 15.4 : o.mkt === "US" ? 15 : null;
    o.net = o.ann != null && o.tax != null ? o.ann * (1 - o.tax / 100) : null;
    o.tot = o.r1y != null && o.y != null ? o.r1y + o.y : null;
  }

  // ── 화면 ──
  function view(){ return '<div id="dvbody"></div>'; }
  function draw(){
    var b = document.getElementById("dvbody"); if (!b) return;
    if (!ST.n){ b.innerHTML = stepN(); bind(); return; }
    b.innerHTML = stepN(true) + slots() + '<div id="dvres"></div>';
    bind();
    if (ST.done) run();
  }
  function stepN(small){
    var opts = [2, 3, 4, 5, 6, 8];
    return '<section class="card dv-ask' + (small ? ' sm' : '') + '"><h3>' + (small ? '몇 개 비교' : '① 몇 개를 비교할까요?') + '</h3>' +
      (small ? '' : '<p class="dv-p">종목이나 ETF를 고를 칸 수예요. 비슷한 상품끼리 넣으면 배당을 한눈에 비교해 드려요.</p>') +
      '<div class="dv-ns">' + opts.map(function(n){ return '<button type="button" data-dvn="' + n + '"' + (ST.n === n ? ' class="on"' : '') + '>' + n + '개</button>'; }).join("") + '</div>' +
      (small ? '' : '<p class="dv-sub">바로 해 보기</p><div class="dv-ex">' + PRE.map(function(p, i){ return '<button type="button" data-dvpre="' + i + '">' + e(p[0]) + '<small>' + e(p[1].join(" · ")) + '</small></button>'; }).join("") + '</div>') +
      '</section>';
  }
  var PRE = [["🇺🇸 미국 배당 ETF", ["SCHD", "JEPI", "TIGER 미국배당다우존스"]],
             ["🇰🇷 국내 배당주", ["KB금융", "하나금융지주", "SK텔레콤", "KT&G"]],
             ["💵 월배당 커버드콜", ["JEPI", "JEPQ", "QYLD"]]];
  function slots(){
    var full = ST.pick.filter(Boolean).length;
    return '<section class="card dv-sl"><h3>② 비교할 종목·ETF 넣기 <span class="mut">' + full + ' / ' + ST.n + '</span></h3>' +
      Array.apply(null, {length: ST.n}).map(function(_, i){ var s = ST.pick[i], r = s && idxRow(s);
        return '<div class="dv-slot" data-i="' + i + '"><i style="background:' + COL[i] + '">' + (i + 1) + '</i>' +
          (s ? '<div class="dv-got"><b>' + (V.FLAGS[r && r.mkt] || "") + ' ' + e(r ? r.name : s) + (r && r.etf ? ' <span class="etfb">ETF</span>' : '') + '</b><small>' + e(V.cd(s)) + '</small></div><button type="button" class="dv-x" data-dvx="' + i + '" aria-label="지우기">✕</button>'
             : '<div class="dv-in"><input type="text" data-dvq="' + i + '" placeholder="종목·ETF 이름이나 코드" autocomplete="off" enterkeyhint="search" aria-label="' + (i + 1) + '번째 종목"><div class="sug dv-sug" id="dvsug' + i + '"></div></div>') + '</div>'; }).join("") +
      '<button type="button" id="dvgo" class="dv-go"' + (full >= 2 ? '' : ' disabled') + '>' + (full >= 2 ? '💰 ' + full + '개 배당 비교하기' : '두 개 이상 넣으면 비교할 수 있어요') + '</button></section>';
  }
  function bind(){
    var b = document.getElementById("dvbody"); if (!b) return;
    [].forEach.call(b.querySelectorAll("[data-dvn]"), function(x){ x.onclick = function(){ var n = +x.dataset.dvn; ST.n = n; ST.pick = ST.pick.slice(0, n); ST.done = false; keep(); draw();
      var f = document.querySelector("[data-dvq]"); if (f) setTimeout(function(){ f.focus(); f.scrollIntoView({block: "center", behavior: "smooth"}); }, 50); }; });
    [].forEach.call(b.querySelectorAll("[data-dvpre]"), function(x){ x.onclick = function(){ var P = PRE[+x.dataset.dvpre][1];
      opLoadIdx().then(function(){ var L = P.map(function(q){ var r = opSearch(q)[0]; return r ? r.sym : null; }).filter(Boolean);
        ST.n = L.length; ST.pick = L; ST.done = true; keep(); draw(); }); }; });
    [].forEach.call(b.querySelectorAll("[data-dvx]"), function(x){ x.onclick = function(){ ST.pick[+x.dataset.dvx] = null; ST.done = false; keep(); draw();
      var f = document.querySelector('[data-dvq="' + x.dataset.dvx + '"]'); if (f) f.focus(); }; });
    [].forEach.call(b.querySelectorAll("[data-dvq]"), function(q){
      var i = +q.dataset.dvq, box = document.getElementById("dvsug" + i);
      var pick = function(sym){ ST.pick[i] = sym; ST.done = false; keep(); draw();
        var nx = document.querySelector("[data-dvq]"); if (nx) setTimeout(function(){ nx.focus(); }, 30); else { var g = document.getElementById("dvgo"); if (g) g.scrollIntoView({block: "center", behavior: "smooth"}); } };
      q.oninput = function(){ opLoadIdx().then(function(){
        var all = opSearch(q.value, 40).filter(function(r){ return ST.pick.indexOf(r.sym) < 0; }), res = all.slice(0, 30);
        box.innerHTML = res.map(function(r){ return '<button type="button" data-s="' + e(r.sym) + '">' + (V.FLAGS[r.mkt] || "") + ' <b>' + e(r.name) + '</b>' + (r.etf ? '<span class="etfb">ETF</span>' : '') + '<small>' + e(V.cd(r.sym)) + '</small></button>'; }).join("") + (res.length >= 8 ? '<p class="dv-more">' + res.length + (all.length > 30 ? '개+' : '개') + ' 찾음 · 위아래로 넘겨 보세요' + (all.length > 30 ? ' (더 자세히 쳐 보세요)' : '') + '</p>' : '');
        [].forEach.call(box.children, function(x){ x.onclick = function(){ pick(x.dataset.s); }; }); }); };
      q.onkeydown = function(ev){ if (ev.key === "Enter"){ opLoadIdx().then(function(){ var r = opSearch(q.value).filter(function(r){ return ST.pick.indexOf(r.sym) < 0; })[0]; if (r) pick(r.sym); }); } };
    });
    var g = document.getElementById("dvgo"); if (g) g.onclick = function(){ ST.done = true; run(); };
  }

  function run(){
    var out = document.getElementById("dvres"); if (!out) return;
    var L = ST.pick.filter(Boolean); if (L.length < 2) return;
    out.innerHTML = '<div class="loading">배당 자료 모으는 중…</div>';
    opLoadIdx().then(function(){ return Promise.all(L.map(load)); }).then(function(R){
      R.forEach(function(o, i){ o.c = COL[ST.pick.indexOf(o.sym) >= 0 ? ST.pick.indexOf(o.sym) : i]; });
      out.innerHTML = head(R) + bars(R) + cal(R) + table(R) + details(R) + note(R);
      [].forEach.call(out.querySelectorAll("[data-dvop]"), function(x){ x.onclick = function(){ if (window.openOP) openOP(x.dataset.dvop); }; });
      setTimeout(function(){ var h = document.getElementById("dvhead"); if (h) h.scrollIntoView({behavior: "smooth", block: "start"}); }, 60);
    }).catch(function(){ out.innerHTML = '<div class="empty">자료를 못 불러왔어요. 잠시 뒤 다시 눌러 주세요.</div>'; });
  }
  // 짧은 이름: 한글 이름은 그대로, 영어 이름(미국·해외 ETF 등)은 티커 — 칸이 좁은 그림·표용
  function lab(o){ return /[가-힣]/.test(o.name) ? o.name : V.cd(o.sym); }
  function nm(o, short){ var n = short ? lab(o) : o.name; if (short && n.length > 12) n = n.slice(0, 11) + "…"; return e(n); }
  function tk(o){ return '<em class="tk">' + e(V.cd(o.sym)) + '</em>'; }
  function sub2(o){ var t = lab(o) === V.cd(o.sym) ? o.name : V.cd(o.sym); return '<em class="tk">' + e(t) + '</em>'; }   // 이름이 티커면 아래엔 영어 이름

  // ① 한 줄 결론
  function head(R){
    var ok = R.filter(function(o){ return o.y != null && o.y > 0; }).sort(function(a, b){ return b.y - a.y; });
    var best = ok[0], low = ok[ok.length - 1], live = R.filter(function(o){ return o.fq && !o.stale; }), mxn = Math.max.apply(null, live.map(function(o){ return o.fq.n; }).concat([0])), often = live.filter(function(o){ return o.fq.n === mxn; });
    var nxt = R.filter(function(o){ return o.nextPay; }).sort(function(a, b){ return a.nextPay - b.nextPay; })[0];
    var t = best ? '<p class="dv-big">🥇 <span style="color:' + best.c + '">' + nm(best) + '</span> ' + tk(best) + '</p>' +
      '<p class="dv-say">배당 가장 많음 — 100만원 넣으면 1년에 <b>' + won(best.ann) + '</b> (배당률 ' + pc(best.y) + ')' + (low && low !== best ? ' · ' + e(lab(low)) + '보다 <b>' + won(best.ann - low.ann) + '</b> 더' : '') + '</p>' : '<p class="dv-big">배당 자료가 없어요</p>';
    var chips = [];
    if (often.length && often.length < R.length) chips.push("📅 가장 자주(" + often[0].fq.k + "): " + often.map(lab).join(" · "));
    else if (often.length) chips.push("📅 모두 " + often[0].fq.k);
    if (nxt) chips.push("⏭ 다음 입금: " + lab(nxt) + " " + md(nxt.nextPay) + "쯤");
    var gro = R.filter(function(o){ return o.gr != null && !o.spec; }).sort(function(a, b){ return b.gr - a.gr; })[0];
    if (gro && gro.gr > 0) chips.push("🌱 1년 전보다 배당 가장 많이 늘림: " + lab(gro) + " " + sg(gro.gr));
    return '<section class="card dv-hd" id="dvhead"><h3>💰 한눈에 <span class="mut">100만원 기준 · 세전</span></h3>' + t +
      (chips.length ? '<div class="dv-chips">' + chips.map(function(c){ return '<span>' + e(c) + '</span>'; }).join("") + '</div>' : '') + '</section>';
  }
  // ② 막대: 100만원 → 1년 배당
  function bars(R){
    var L = R.slice().sort(function(a, b){ return (b.y || 0) - (a.y || 0); }), mx = Math.max.apply(null, L.map(function(o){ return o.ann || 0; })) || 1;
    return '<section class="card" data-xc="1"><h3>📊 100만원 넣으면 1년에 받는 배당</h3>' + L.map(function(o){
      var w = o.ann ? Math.max(2, o.ann / mx * 100) : 0;
      return '<div class="dv-bar" data-dvop="' + e(o.sym) + '"><div class="dv-bl"><b>' + nm(o, 1) + '</b>' + sub2(o) + '</div>' +
        '<div class="dv-bt"><div class="dv-bf" style="width:' + w + '%;background:' + o.c + '"></div></div>' +
        '<div class="dv-bv"><b>' + (o.ann ? wonS(o.ann) : '없음') + '</b><small>' + (o.y ? pc(o.y) : (o.stale ? '최근 중단' : '–')) + '</small></div></div>'; }).join("") +
      '<p class="dv-ft">세후(국내 15.4% · 미국 15%): ' + L.filter(function(o){ return o.net; }).map(function(o){ return e(lab(o)) + ' ' + wonS(o.net); }).join(" · ") + '</p></section>';
  }
  // ③ 달력: 앞으로 12달, 언제 얼마 들어오나
  function cal(R){
    var L = R.filter(function(o){ return o.mo; }); if (!L.length) return '';
    var now = new Date(), ms = []; for (var i = 0; i < 12; i++){ var d = new Date(now.getFullYear(), now.getMonth() + i, 1); ms.push(d.getMonth() + 1); }
    var mx = Math.max.apply(null, L.map(function(o){ return Math.max.apply(null, o.mo); })) || 1;
    var W = 340, lw = 0, cw = W / 12, H = 34;
    var rows = L.map(function(o){
      var bars = o.mo.map(function(v, k){ if (!v) return '<rect x="' + (k * cw + cw / 2 - 1.5) + '" y="' + (H - 3) + '" width="3" height="3" rx="1.5" fill="var(--line)"/>';
        var h = Math.max(4, v / mx * (H - 4)); return '<rect x="' + (k * cw + 3) + '" y="' + (H - h) + '" width="' + (cw - 6) + '" height="' + h + '" rx="3" fill="' + o.c + '"/>'; }).join("");
      return '<div class="dv-cr"><div class="dv-cn"><i style="background:' + o.c + '"></i><b>' + nm(o, 1) + '</b><span>' + (o.fq ? o.fq.k : '') + (o.nextPay ? ' · 다음 ' + md(o.nextPay) + '쯤' : '') + '</span></div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dv-cs" preserveAspectRatio="none" aria-hidden="true">' + bars + '</svg></div>';
    }).join("");
    var axis = '<div class="dv-ax">' + ms.map(function(m, k){ return '<span' + (k === 0 ? ' class="now"' : (m === 1 ? ' class="ny"' : '')) + '>' + m + '</span>'; }).join("") + '</div>';
    return '<section class="card" data-xc="1"><h3>📅 언제 들어오나 <span class="mut">앞으로 12달 · 100만원 기준 · 입금 예상</span></h3>' + axis + rows +
      '<p class="dv-ft">막대가 클수록 그 달에 많이 들어와요. 지난 1년 배당 일정 그대로 간다고 본 예상이에요 (입금일은 대략).</p></section>';
  }
  // ④ 비교 표
  function table(R){
    function best(f, hi){ var v = R.map(f).filter(function(x){ return x != null && isFinite(x); }); if (v.length < 2) return null; return hi ? Math.max.apply(null, v) : Math.min.apply(null, v); }
    var rows = [
      ["배당률", function(o){ return o.y; }, function(v){ return pc(v); }, 1],
      ["100만원 → 1년", function(o){ return o.ann; }, function(v){ return wonS(v); }, 1],
      ["1번 받을 때", function(o){ return o.per; }, function(v){ return wonS(v); }, 0],
      ["세후 1년", function(o){ return o.net; }, function(v){ return wonS(v); }, 1],
      ["주는 횟수", function(o){ return o.fq && !o.stale ? o.fq.n : null; }, function(v, o){ return o.fq ? (o.stale ? "중단?" : o.fq.k) : "–"; }, 1],
      ["배당락 달", null, function(v, o){ return o.exM && !o.stale ? (o.exM.length >= 12 ? "매달" : o.exM.join("·") + "월") : "–"; }],
      ["입금 달(대략)", null, function(v, o){ return o.payM && !o.stale ? (o.payM.length >= 12 ? "매달" : o.payM.join("·") + "월") : "–"; }],
      ["다음 배당락", null, function(v, o){ return o.next ? md(o.next) + "쯤" : "–"; }],
      ["1년 전보다 배당", function(o){ return o.spec ? null : o.gr; }, function(v){ return sg(v); }, 1],
      ["1주 가격", null, function(v, o){ return fmtPx(o.price, o.cur); }],
      ["1주당 1년 배당", null, function(v, o){ return o.ps ? fmtPx(o.ps, o.cur) : "–"; }],
      ["주가 1년", function(o){ return o.r1y; }, function(v){ return sg(v); }, 1],
      ["주가+배당 1년", function(o){ return o.tot; }, function(v){ return sg(v); }, 1]
    ];
    var h = '<section class="card" data-xc="1"><h3>🧾 나란히 비교 <span class="mut">초록 = 가장 좋은 쪽</span></h3><div class="dv-tw"><table class="dv-t"><thead><tr><th></th>' +
      R.map(function(o){ return '<th data-dvop="' + e(o.sym) + '"><i style="background:' + o.c + '"></i>' + nm(o, 1) + sub2(o) + '</th>'; }).join("") + '</tr></thead><tbody>' +
      rows.map(function(rw){ var b = rw[1] && rw[3] != null ? best(rw[1], rw[3]) : null;
        return '<tr><td>' + rw[0] + '</td>' + R.map(function(o){ var v = rw[1] ? rw[1](o) : null; return '<td' + (b != null && v === b ? ' class="win"' : '') + '>' + rw[2](v, o) + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div></section>';
    return h;
  }
  // ⑤ 종목별 배당 흐름 (접힘)
  function details(R){
    return '<section class="card" data-xc="1"><h3>📈 종목별 배당 흐름 <span class="mut">눌러서 펼치기</span></h3>' + R.map(function(o){
      var sp = '';
      if (o.spark && o.spark.length){
        var mx = Math.max.apply(null, o.spark.map(function(x){ return x[1]; })) || 1, n = o.spark.length, W = 300, H = 56, bw = W / n;
        sp = '<svg viewBox="0 0 ' + W + ' ' + (H + 14) + '" class="dv-sp" aria-hidden="true">' + o.spark.map(function(x, k){ var hh = Math.max(2, x[1] / mx * H);
          return '<rect x="' + (k * bw + 2) + '" y="' + (H - hh) + '" width="' + (bw - 4) + '" height="' + hh + '" rx="2" fill="' + o.c + '" opacity="' + (k === n - 1 ? 1 : .55) + '"/>' +
            (k === 0 || k === n - 1 || n <= 6 ? '<text x="' + (k * bw + bw / 2) + '" y="' + (H + 12) + '" text-anchor="middle" font-size="10" fill="var(--sub)">' + x[0].slice(2, 7).replace("-", ".") + '</text>' : ''); }).join("") + '</svg>';
      }
      var lines = [];
      if (o.fq) lines.push(["주기", o.stale ? "최근 배당이 끊겼어요 (마지막 " + ymd(o.lastEx) + ")" : o.fq.k + " · 1년에 " + o.fq.n + "번"]);
      if (o.lastEx) lines.push(["지난 배당", ymd(o.lastEx) + " · 1주당 " + fmtPx(o.lastAmt, o.cur)]);
      if (o.next) lines.push(["다음 예상", "배당락 " + md(o.next) + "쯤 → 입금 " + md(o.nextPay) + "쯤"]);
      if (o.per) lines.push(["100만원이면", "1번에 약 " + won(o.per) + " · 1년 " + won(o.ann)]);
      if (o.gr != null) lines.push(["1년 전보다", o.spec ? "특별배당이 섞여 비교 어려움" : "1주당 배당 " + sg(o.gr)]);
      if (!o.has) lines.push(["안내", o.y ? "배당 일정 자료를 모으는 중이라 배당률만 보여요" : "최근 배당 기록이 없어요"]);
      return '<details class="dv-d"><summary><i style="background:' + o.c + '"></i><b>' + nm(o, 1) + '</b>' + sub2(o) + '<span>' + (o.y ? pc(o.y) : '–') + '</span></summary>' + sp +
        '<div class="dv-kv">' + lines.map(function(l){ return '<div><small>' + l[0] + '</small><b>' + e(l[1]) + '</b></div>'; }).join("") + '</div>' +
        '<button type="button" class="dv-op" data-dvop="' + e(o.sym) + '">📄 종목리포트 보기 ›</button></details>'; }).join("") + '</section>';
  }
  function note(R){
    return '<p class="dv-note">배당률 = 최근 1년 실제 받은 배당 ÷ 지금 가격 (기록이 없으면 증권사 자료 배당률). 다음 배당·입금 달은 지난 일정으로 본 예상이라 회사·운용사 결정에 따라 바뀔 수 있어요. 배당이 많다고 수익이 큰 건 아니에요 — 「주가+배당 1년」도 같이 보세요.</p>' +
      '<div class="dv-again"><button type="button" id="dvre">🔄 다른 종목으로 다시</button></div>';
  }

  window.divcView = view;
  window.divcInit = function(){
    draw();
    document.getElementById("dvbody").addEventListener("click", function(ev){ if (ev.target && ev.target.id === "dvre"){ ST = {n: 0, pick: [], done: false}; keep(); draw(); window.scrollTo({top: 0, behavior: "smooth"}); } });
    opLoadIdx().then(function(){ setTimeout(function(){ try { phonIndex(); } catch(x) {} }, 300); if (ST.n && ST.pick.filter(Boolean).length) draw(); }).catch(function(){});
  };

  (function(){ var st = document.createElement("style"); st.textContent =
    ".dv-p{font-size:14px;color:var(--sub);line-height:1.55;margin:0 0 12px;word-break:keep-all}.dv-sub{font-size:12.5px;color:var(--sub);font-weight:700;margin:16px 0 6px}" +
    ".dv-ns{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.dv-ns button{border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:12px 0;font:inherit;font-size:15px;font-weight:700;cursor:pointer}" +
    ".dv-ns button.on{background:var(--text);color:var(--panel);border-color:var(--text)}.dv-ask.sm{padding:12px 16px}.dv-ask.sm h3{font-size:13px;color:var(--sub);margin:0 0 8px}.dv-ask.sm .dv-ns button{padding:7px 0;font-size:13.5px}" +
    ".dv-ex{display:grid;gap:6px}.dv-ex button{text-align:left;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:10px 12px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}.dv-ex small{display:block;font-weight:400;font-size:12.5px;color:var(--sub);margin-top:2px}" +
    ".dv-slot{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}.dv-slot>i{flex:0 0 26px;height:26px;border-radius:50%;color:#fff;font-style:normal;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin-top:8px}" +
    ".dv-in{flex:1;min-width:0;position:relative}.dv-in input{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);border-radius:12px;padding:11px 12px;font:inherit;font-size:16px}" +
    ".dv-sug{max-height:330px;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.dv-sug button{display:flex;width:100%;text-align:left}.dv-more{font-size:12px;color:var(--sub);margin:6px 4px 2px;text-align:center}.dv-got{flex:1;min-width:0;padding-top:4px}.dv-got b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-got small{color:var(--sub);font-size:12.5px}" +
    ".dv-x{flex:0 0 36px;height:36px;border:0;background:none;color:var(--sub);font-size:16px;cursor:pointer;margin-top:2px}" +
    ".dv-go{display:block;width:100%;margin-top:14px;border:0;border-radius:14px;padding:14px;font:inherit;font-size:16px;font-weight:800;background:var(--acc,#3b7ddd);color:#fff;cursor:pointer}.dv-go[disabled]{background:var(--panel2);color:var(--dim,#888);cursor:default;font-weight:600;font-size:14px}" +
    ".dv-big{font-size:21px;font-weight:800;line-height:1.35;margin:2px 0 6px;word-break:keep-all}.dv-say{font-size:15px;line-height:1.55;margin:0;word-break:keep-all;color:var(--sub)}.dv-say b{color:var(--text)}" +
    ".dv-chips{display:flex;flex-direction:column;gap:6px;margin-top:12px}.dv-chips span{font-size:13px;background:var(--panel2,rgba(127,127,127,.08));border-radius:10px;padding:8px 10px;line-height:1.4;word-break:keep-all}" +
    ".dv-bar{display:grid;grid-template-columns:minmax(0,38%) 1fr auto;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--line);cursor:pointer}.dv-bar:last-of-type{border:0}" +
    ".dv-bl b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-bl .tk{display:block;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-bt{height:14px;background:var(--panel2,rgba(127,127,127,.1));border-radius:7px;overflow:hidden}.dv-bf{height:100%;border-radius:7px}" +
    ".dv-bv{text-align:right;min-width:64px}.dv-bv b{display:block;font-size:15.5px;font-weight:800;white-space:nowrap}.dv-bv small{font-size:12px;color:var(--sub)}" +
    ".dv-ft{font-size:12px;color:var(--sub);line-height:1.55;margin:10px 0 0;word-break:keep-all}" +
    ".dv-ax{display:grid;grid-template-columns:repeat(12,1fr);font-size:11px;color:var(--sub);text-align:center;margin:0 0 4px}.dv-ax .now{color:var(--text);font-weight:800}.dv-ax .ny{border-left:1px dashed var(--line)}" +
    ".dv-cr{padding:6px 0 8px;border-bottom:1px solid var(--line)}.dv-cr:last-of-type{border:0}.dv-cn{display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;min-width:0}.dv-cn i,.dv-t th i,.dv-d summary i{flex:0 0 9px;width:9px;height:9px;border-radius:50%;display:inline-block}" +
    ".dv-cn b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.dv-cn span{color:var(--sub);font-size:12px;white-space:nowrap;margin-left:auto}.dv-cs{width:100%;height:34px;display:block}" +
    ".dv-tw{overflow-x:auto;margin:0 -16px;padding:0 16px;-webkit-overflow-scrolling:touch}.dv-t{border-collapse:collapse;font-size:13px;min-width:100%}.dv-t th,.dv-t td{padding:8px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}" +
    ".dv-t th{font-size:12.5px;vertical-align:bottom;cursor:pointer;max-width:110px;overflow:hidden;text-overflow:ellipsis}.dv-t th i{margin-right:4px}.dv-t th .tk{display:block;font-weight:400;max-width:110px;overflow:hidden;text-overflow:ellipsis}" +
    ".dv-t td:first-child,.dv-t th:first-child{text-align:left;position:sticky;left:0;background:var(--panel);color:var(--sub);font-weight:600;z-index:1}.dv-t td.win{color:#199e70;font-weight:800}" +
    ".dv-d{border-bottom:1px solid var(--line);padding:4px 0}.dv-d:last-of-type{border:0}.dv-d summary{display:flex;align-items:center;gap:7px;padding:9px 0;cursor:pointer;list-style:none;font-size:14.5px}.dv-d summary::-webkit-details-marker{display:none}" +
    ".dv-d summary b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.dv-d summary .tk{font-size:11.5px;flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dv-d summary b{flex:0 0 auto;max-width:55%}.dv-d summary span{margin-left:auto;font-weight:800;white-space:nowrap;flex:0 0 auto}.dv-sp{width:100%;height:auto;display:block;margin:4px 0 8px}" +
    ".dv-kv div{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:13px;border-top:1px dashed var(--line)}.dv-kv small{color:var(--sub);flex:0 0 auto;font-size:12.5px}.dv-kv b{text-align:right;font-weight:600;word-break:keep-all}" +
    ".dv-op{display:block;width:100%;margin:8px 0 6px;border:1px solid var(--line);background:none;color:var(--text);border-radius:10px;padding:9px;font:inherit;font-size:13px;cursor:pointer}" +
    ".dv-note{font-size:12px;color:var(--sub);line-height:1.6;margin:4px 8px 10px;word-break:keep-all}.dv-again{text-align:center;margin:0 0 18px}.dv-again button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:10px 18px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}" +
    "@media(max-width:360px){.dv-ns{grid-template-columns:repeat(3,1fr)}}";
    document.head.appendChild(st); })();
})();
