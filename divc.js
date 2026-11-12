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
      LAST = R;
      out.innerHTML = head(R) + bars(R) + cal(R) + table(R) + details(R) + sendCard() + note(R);
      bindSend();
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


  /* ───────── 📨 고객에게 보내기 — 한 장(카톡 그림) · PDF 풀버전(A4 4쪽) · PPT(그림판 4쪽) ─────────
     11/12 사용자 「배당비교 결과 나오면 제안서처럼 한 장·전체 PDF 등등 카톡으로 보낼 수 있게」
     휴대폰 안에서 그림을 새로 그림(lib/html2pdf · lib/pptxgen) · 서버·돈 안 씀 · 앱 이름 안 넣음 · 받는 분 이름은 휴대폰에만 */
  var LAST = null, BUSY = false;
  var AMTS = [[1000000, "100만원"], [10000000, "1,000만원"], [50000000, "5,000만원"], [100000000, "1억원"]];
  var FONT = '"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo","Noto Sans KR","Noto Sans CJK KR",sans-serif';
  var INK = "#141a26", SUB = "#5b6576", LN = "#e3e7ee", NAVY = "#13284b", GOLD = "#e0a82e", WIN = "#14895f";
  var PW = 794, PH = 1123;
  function lsg(k){ try { return localStorage.getItem(k); } catch(x){ return null; } }
  function lss(k, v){ try { localStorage.setItem(k, v); } catch(x) {} }
  function ME(){ try { return JSON.parse(lsg("propme") || "{}") || {}; } catch(x){ return {}; } }
  function amt(){ var a = +lsg("divc_amt"); return AMTS.some(function(x){ return x[0] === a; }) ? a : 10000000; }
  function amtLab(a){ var f = AMTS.filter(function(x){ return x[0] === a; })[0]; return f ? f[1] : won(a); }
  function recent(){ try { var a = JSON.parse(lsg("op_clients") || "[]"); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 8) : []; } catch(x){ return []; } }
  function saveCli(c){ c = String(c || "").trim(); if (!c) return; var a = recent().filter(function(x){ return x !== c; }); a.unshift(c); lss("op_clients", JSON.stringify(a.slice(0, 8))); }
  function cliLab(c){ c = String(c || "").replace(/\s+/g, " ").trim(); return !c ? "" : /님$/.test(c) ? c : c + " 고객님"; }
  // 짧은 원: 1만 미만 그대로 · 1만 넘으면 「3.1만」 · 100만 넘으면 「123만」
  function wk(v){ if (!v) return ""; if (v < 1e4) return (Math.round(v / 10) * 10).toLocaleString("ko-KR"); if (v < 1e6) return (Math.round(v / 1e3) / 10).toFixed(1).replace(/\.0$/, "") + "만"; return Math.round(v / 1e4).toLocaleString("ko-KR") + "만"; }
  function todayK(){ var d = new Date(Date.now() + 9 * 3600e3); return d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일"; }
  function tkName(o){ return /[가-힣]/.test(o.name) ? V.cd(o.sym) : o.name; }   // 이름 밑 둘째 줄 (미국 종목 = 티커 / 영어 이름)
  function main1(o){ return lab(o); }
  // 기준 금액에 맞춰 늘린 숫자
  function sc(R, A){ var f = A / BASE; return R.map(function(o){ return {o: o, ann: o.ann != null ? o.ann * f : null, net: o.net != null ? o.net * f : null, per: o.per != null ? o.per * f : null, mo: o.mo ? o.mo.map(function(v){ return v * f; }) : null}; }); }
  function monthsAhead(){ var now = new Date(), ms = []; for (var i = 0; i < 12; i++){ var d = new Date(now.getFullYear(), now.getMonth() + i, 1); ms.push({m: d.getMonth() + 1, y: d.getFullYear()}); } return ms; }

  function sendCard(){
    var R = recent(), me = ME(), pb = lsg("pbname") || me.pb || "", a = amt();
    return '<section class="card dv-send" id="dvsend"><h3>📨 고객에게 보내기 <span class="mut">카톡 · PDF · PPT</span></h3>' +
      '<label class="dv-f">💌 받는 분<input id="dvcl" maxlength="20" placeholder="고객 이름 (예: 홍길동 · 비워도 돼요)" autocomplete="off"></label>' +
      (R.length ? '<div class="dv-rc">' + R.map(function(n){ return '<button type="button" data-dvcl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<label class="dv-f">✍️ 보내는 사람<input id="dvpb" maxlength="30" placeholder="내 이름 (예: 김OO PB · 비워도 돼요)" value="' + e(pb) + '"></label>' +
      '<div class="dv-f2">💵 얼마 기준으로<div class="dv-am">' + AMTS.map(function(x){ return '<button type="button" data-dvam="' + x[0] + '"' + (x[0] === a ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join("") + '</div></div>' +
      '<div class="dv-mk"><button type="button" data-dvmk="png" class="main">📱 고객에게 한 장<small>카톡 전송용 그림 1장</small></button>' +
      '<button type="button" data-dvmk="pdf">📄 PDF 풀버전<small>A4 4쪽 · 차트·표·종목별</small></button>' +
      '<button type="button" data-dvmk="ppt">📊 PPT<small>4쪽 · 안 깨지는 그림판</small></button></div>' +
      simUI() +
      '<p class="dv-st" id="dvst">이름을 넣으면 맨 위에 「○○ 고객님께」로 들어가요 · 받는 분 이름은 이 휴대폰에만 남아요</p></section>';
  }
  function bindSend(){
    var box = document.getElementById("dvsend"); if (!box) return;
    var I = box.querySelector("#dvcl"), P = box.querySelector("#dvpb");
    if (P) P.oninput = function(){ lss("pbname", P.value.trim().slice(0, 30)); };
    [["dvsno", "no"], ["dvsfr", "from"], ["dvsto", "to"]].forEach(function(q){ var el = box.querySelector("#" + q[0]); if (el) el.oninput = el.onchange = function(){ simSet(q[1], el.value.trim()); simRefresh(); }; });
    box.onclick = function(ev){
      var t = ev.target, c = t.closest && t.closest("[data-dvcl]"), am = t.closest && t.closest("[data-dvam]"), mk = t.closest && t.closest("[data-dvmk]");
      if (c){ var on = I.value.trim() !== c.dataset.dvcl; I.value = on ? c.dataset.dvcl : ""; [].forEach.call(box.querySelectorAll("[data-dvcl]"), function(b){ b.classList.toggle("on", on && b === c); }); return; }
      if (am){ lss("divc_amt", am.dataset.dvam); [].forEach.call(box.querySelectorAll("[data-dvam]"), function(b){ b.classList.toggle("on", b === am); }); return; }
      if (mk) make(mk.dataset.dvmk, mk);
    };
    if (I) I.oninput = function(){ [].forEach.call(box.querySelectorAll("[data-dvcl]"), function(b){ b.classList.toggle("on", b.dataset.dvcl === I.value.trim()); }); };
  }
  function opts(){ var I = document.getElementById("dvcl"), P = document.getElementById("dvpb"), me = ME();
    return {cl: I ? I.value.trim().slice(0, 20) : "", pb: P ? P.value.trim().slice(0, 30) : (lsg("pbname") || ""), org: me.org || "", A: amt()}; }

  /* ── 그림 찍기 (제안서와 같은 방식) ── */
  var HOST = null, IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function host(){ if (!HOST || !document.body.contains(HOST)){ HOST = document.createElement("div"); HOST.setAttribute("aria-hidden", "true");
    HOST.style.cssText = "position:fixed;left:-20000px;top:0;z-index:-1;pointer-events:none;background:#fff;color:" + INK + ";color-scheme:light"; document.body.appendChild(HOST); } return HOST; }
  function lib(src, key){ return new Promise(function(ok, no){ if (window[key]) return ok(); var s = document.createElement("script"); s.src = src; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("도구를 못 받음")); }; document.head.appendChild(s); }); }
  function snap(html, w, scale){
    var H = host(); H.innerHTML = html; var el = H.firstChild;
    var h = Math.ceil(el.getBoundingClientRect().height);
    return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [w, h], orientation: "portrait", hotfixes: ["px_scaling"]},
      html2canvas: {scale: scale, backgroundColor: "#ffffff", useCORS: true, logging: false, scrollX: 0, scrollY: 0, windowWidth: w, width: w, height: h,
        onclone: function(d){ try { d.documentElement.removeAttribute("data-ui"); d.documentElement.style.colorScheme = "light"; } catch(x) {} }}}).from(el).toCanvas().get("canvas")
      .then(function(c){ H.innerHTML = ""; return c; });
  }
  function fname(o, ext){ return ((o.cl ? o.cl + "님_" : "") + "배당비교_" + LAST.map(main1).slice(0, 3).join("_") + "_" + ymd(new Date()).slice(5).replace("-", "")).replace(/[\\/:*?"<>|\s·&]+/g, "_").slice(0, 60) + "." + ext; }
  function deliver(blob, name, mime, title){
    var f = new File([blob], name, {type: mime});
    if (window.__onepage && __onepage.ready){ __onepage.ready([f], title); return; }
    try { if (navigator.canShare && navigator.canShare({files: [f]})){ navigator.share({files: [f]}).catch(function(){}); return; } } catch(x) {}
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 30000);
  }
  function make(kind, btn){
    if (BUSY || !LAST) return; BUSY = true;
    var o = opts(), st = document.getElementById("dvst"), old = btn.innerHTML; if (kind === "rev") o.cl = "";
    btn.disabled = true; btn.innerHTML = "⏳ 만드는 중…<small>몇 초 걸려요</small>";
    var pl = kind === "rev" ? [reqPage(o)].concat(pages(LAST, o)) : null;
    var p = lib("lib/html2pdf.bundle.min.js", "html2pdf").then(function(){
      if (kind === "png") return snap(onePage(LAST, o), 1080, IOS ? 1 : 1.3).then(function(c){ return new Promise(function(r){ c.toBlob(function(b){ c.width = c.height = 0; r(b); }, "image/png"); }); });
      var imgs = [];
      return (pl || pages(LAST, o)).reduce(function(pr, html){ return pr.then(function(){ return snap(html, PW, IOS ? 1.6 : 2).then(function(c){ imgs.push(c.toDataURL("image/jpeg", 0.9)); c.width = c.height = 0; }); }); }, Promise.resolve()).then(function(){
        if (kind === "pdf" || kind === "rev") return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [PW, PH], orientation: "portrait", hotfixes: ["px_scaling"]}}).from(document.createElement("div")).toPdf().get("pdf").then(function(pdf){
          imgs.forEach(function(u, i){ if (i) pdf.addPage([PW, PH], "portrait"); pdf.addImage(u, "JPEG", 0, 0, PW, PH); }); return pdf.output("blob"); });
        return lib("lib/pptxgen.bundle.js?v=1", "PptxGenJS").then(function(){
          var P = new PptxGenJS(); P.defineLayout({name: "A4P", width: 8.27, height: 11.69}); P.layout = "A4P"; P.title = (o.cl ? cliLab(o.cl) + " " : "") + "배당 비교";
          imgs.forEach(function(u){ P.addSlide().addImage({data: u, x: 0, y: 0, w: 8.27, h: 11.69}); });
          return P.write({outputType: "blob"}); });
      });
    });
    var mime = kind === "png" ? "image/png" : kind === "pdf" || kind === "rev" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    p.then(function(blob){
      var name = kind === "rev" ? ("심의요청_배당비교_" + DV_VER + (o.pb ? "_" + o.pb : "")).replace(/[\\/:*?"<>|\s·]+/g, "_") + ".pdf" : fname(o, kind === "png" ? "png" : kind === "pdf" ? "pdf" : "pptx");
      if (kind !== "rev") saveCli(o.cl); deliver(blob, name, mime, kind === "png" ? "배당 비교 한 장" : kind === "pdf" ? "배당 비교 PDF" : kind === "rev" ? "배당 비교 심의 요청서" : "배당 비교 PPT");
      if (st) st.textContent = "✓ 다 만들었어요 · " + name + " · " + Math.max(1, Math.round(blob.size / 1024)) + "KB" + (kind !== "rev" && !simState().ok ? " · ⚠️ 심의필 없이 만들었어요 — 고객에게 보내기 전에 심의필을 넣어 주세요" : "");
      try { if (window.ntfyUse) ntfyUse("divc_" + kind); } catch(x) {}
    }).catch(function(err){ if (st) st.textContent = "만들지 못했어요 · " + String((err && (err.message || err)) || "").slice(0, 80); try { console.error(err); } catch(x) {} })
      .then(function(){ BUSY = false; btn.disabled = false; btn.innerHTML = old; });
  }

  /* ── 그림 조각 (흰 바탕) ── */
  function dot(c, s){ s = s || 12; return '<i style="display:inline-block;width:' + s + 'px;height:' + s + 'px;border-radius:50%;background:' + c + ';flex:0 0 ' + s + 'px"></i>'; }
  function nm2(o, fs, fs2){ return '<div style="min-width:0"><div style="font-size:' + fs + 'px;font-weight:800;color:' + INK + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(o)) + '</div><div style="font-size:' + fs2 + 'px;color:' + SUB + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(tkName(o)) + (o.etf ? ' · ETF' : '') + '</div></div>'; }
  function band(o, W, title, sub, k){
    var cl = cliLab(o.cl), big = W > 900;
    return '<div style="background:linear-gradient(135deg,' + NAVY + ' 0%,#1f4a86 100%);color:#fff;padding:' + (big ? '48px 48px 40px' : '34px 48px 28px') + ';position:relative">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;font-size:' + (big ? 24 : 15) + 'px;color:rgba(255,255,255,.78)">' +
        '<div style="font-weight:800;color:' + (cl ? '#fff' : 'rgba(255,255,255,.78)') + ';font-size:' + (cl ? (big ? 32 : 19) : (big ? 24 : 15)) + 'px">' + (cl ? '💌 ' + e(cl) + '께' : todayK()) + '</div>' +
        '<div style="text-align:right;line-height:1.45">' + (cl ? todayK() + '<br>' : '') + (o.org ? e(o.org) + ' · ' : '') + (o.pb ? e(o.pb) + (cl ? ' 드림' : '') : '') + '</div></div>' +
      '<div style="margin-top:' + (big ? 26 : 18) + 'px;font-size:' + (big ? 21 : 13) + 'px;font-weight:800;color:' + GOLD + ';letter-spacing:.06em">DIVIDEND COMPARISON' + (k ? ' · ' + k : '') + '</div>' +
      '<div style="font-size:' + (big ? 54 : 32) + 'px;font-weight:900;line-height:1.2;margin-top:6px">' + title + '</div>' +
      (sub ? '<div style="font-size:' + (big ? 24 : 15) + 'px;color:rgba(255,255,255,.82);margin-top:8px;line-height:1.5">' + sub + '</div>' : '') + '</div>';
  }
  function hTitle(t, s, big){ return '<div style="display:flex;align-items:baseline;gap:10px;margin:' + (big ? '40px 0 16px' : '26px 0 12px') + '"><div style="font-size:' + (big ? 32 : 20) + 'px;font-weight:900;color:' + INK + '">' + t + '</div>' + (s ? '<div style="font-size:' + (big ? 20 : 12.5) + 'px;color:' + SUB + '">' + s + '</div>' : '') + '</div>'; }
  function ranked(S){ return S.slice().sort(function(a, b){ return (b.o.y || 0) - (a.o.y || 0); }); }
  function heroBox(S, A, big){
    var ok = ranked(S).filter(function(s){ return s.o.y > 0; }), b = ok[0], lo = ok[ok.length - 1];
    if (!b) return '<div style="padding:24px;border-radius:18px;background:#f5f7fb;font-size:' + (big ? 26 : 16) + 'px">배당 자료가 없음</div>';
    var nx = S.filter(function(s){ return s.o.nextPay; }).sort(function(x, y){ return x.o.nextPay - y.o.nextPay; })[0];
    return '<div style="border-radius:' + (big ? 26 : 16) + 'px;background:linear-gradient(135deg,#fff8e6,#fff3d1);border:2px solid #f3d58a;padding:' + (big ? '30px 34px' : '20px 24px') + ';display:flex;gap:' + (big ? 26 : 18) + 'px;align-items:center">' +
      '<div style="font-size:' + (big ? 84 : 52) + 'px;line-height:1">🥇</div><div style="flex:1;min-width:0">' +
        '<div style="font-size:' + (big ? 22 : 13.5) + 'px;color:#8a6410;font-weight:800">배당 가장 많이 주는 것</div>' +
        '<div style="font-size:' + (big ? 44 : 27) + 'px;font-weight:900;color:' + INK + ';line-height:1.25;margin-top:2px;word-break:keep-all">' + e(main1(b.o)) + (main1(b.o) !== b.o.name ? '<span style="display:block;font-size:' + (big ? 20 : 12.5) + 'px;font-weight:600;color:' + SUB + ';margin-top:2px">' + e(b.o.name) + '</span>' : '') + '</div>' +
        '<div style="font-size:' + (big ? 26 : 16) + 'px;color:' + INK + ';margin-top:6px;line-height:1.5">' + amtLab(A) + ' 넣으면 1년에 <b style="color:#b7790b;font-size:' + (big ? 36 : 22) + 'px">' + won(b.ann) + '</b> (배당률 ' + pc(b.o.y) + ')</div>' +
        (lo && lo !== b ? '<div style="font-size:' + (big ? 21 : 13) + 'px;color:' + SUB + ';margin-top:4px">' + e(main1(lo.o)) + '보다 1년에 ' + won(b.ann - lo.ann) + ' 더 받음' + (nx ? ' · 다음 입금은 ' + e(main1(nx.o)) + ' ' + md(nx.o.nextPay) + '쯤' : '') + '</div>' : '') +
      '</div></div>';
  }
  function barsH(S, A, big){
    var L = ranked(S), mx = Math.max.apply(null, L.map(function(s){ return s.ann || 0; })) || 1, fs = big ? 24 : 14.5;
    return L.map(function(s, i){ var w = s.ann ? Math.max(2, s.ann / mx * 100) : 0;
      return '<div style="display:flex;align-items:center;gap:' + (big ? 16 : 12) + 'px;padding:' + (big ? '14px 0' : '9px 0') + ';border-bottom:1px solid ' + LN + '">' +
        '<div style="width:' + (big ? 34 : 22) + 'px;font-size:' + fs + 'px;font-weight:900;color:' + (i === 0 ? '#b7790b' : SUB) + ';text-align:center">' + (i + 1) + '</div>' + dot(s.o.c, big ? 16 : 11) +
        '<div style="width:' + (big ? 250 : 170) + 'px">' + nm2(s.o, fs, big ? 17 : 11) + '</div>' +
        '<div style="flex:1;height:' + (big ? 30 : 18) + 'px;background:#eef1f6;border-radius:99px;overflow:hidden"><div style="height:100%;width:' + w + '%;background:' + s.o.c + ';border-radius:99px"></div></div>' +
        '<div style="width:' + (big ? 210 : 140) + 'px;text-align:right"><div style="font-size:' + (big ? 30 : 17) + 'px;font-weight:900;color:' + INK + '">' + (s.ann ? won(s.ann) : (s.o.stale ? '중단' : '없음')) + '</div>' +
          '<div style="font-size:' + (big ? 18 : 11.5) + 'px;color:' + SUB + '">' + (s.o.y ? pc(s.o.y) : '–') + (s.net ? ' · 세후 ' + wonS(s.net) : '') + '</div></div></div>'; }).join("");
  }
  function heat(S, big){   // 앞으로 12달 × 종목 — 칸 색 진하기 = 그 달 들어오는 돈
    var L = S.filter(function(s){ return s.mo; }); if (!L.length) return '';
    var ms = monthsAhead(), mx = Math.max.apply(null, L.map(function(s){ return Math.max.apply(null, s.mo); })) || 1, lw = big ? 230 : 150, fs = big ? 15.5 : 9.5, ch = big ? 50 : 30;
    var head = '<div style="display:flex;gap:' + (big ? 4 : 3) + 'px;margin-left:' + lw + 'px;margin-bottom:4px">' + ms.map(function(m, k){ return '<div style="flex:1;text-align:center;font-size:' + (big ? 18 : 11) + 'px;font-weight:' + (k === 0 ? 900 : 600) + ';color:' + (k === 0 ? INK : SUB) + '">' + (m.m === 1 && k ? "'" + String(m.y).slice(2) + ' ' : '') + m.m + '월</div>'; }).join("") + '</div>';
    var rows = L.map(function(s){
      return '<div style="display:flex;align-items:center;gap:' + (big ? 4 : 3) + 'px;margin-bottom:' + (big ? 4 : 3) + 'px"><div style="width:' + (lw - 8) + 'px;margin-right:8px;display:flex;align-items:center;gap:7px;min-width:0">' + dot(s.o.c, big ? 13 : 9) + '<div style="font-size:' + (big ? 19 : 12) + 'px;font-weight:800;color:' + INK + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(s.o)) + '</div></div>' +
        s.mo.map(function(v){ var a = v ? 0.18 + 0.82 * v / mx : 0;
          return '<div style="flex:1;height:' + ch + 'px;border-radius:' + (big ? 9 : 6) + 'px;background:' + (v ? hexA(s.o.c, a) : '#f2f4f8') + ';display:flex;align-items:center;justify-content:center;font-size:' + fs + 'px;font-weight:800;color:' + (a > 0.55 ? '#fff' : INK) + '">' + (v ? wk(v) : '') + '</div>'; }).join("") + '</div>'; }).join("");
    return head + rows;
  }
  // 캡처 때 앱의 밝은 글자색이 새어 들지 않게 — 본문 칸마다 글자색을 직접 박음 (색을 이미 정한 칸은 그대로)
  function fixC(h){ return h.replace(/style="([^"]*)"/g, function(m, st){ return /(^|;)\s*color:/.test(st) ? m : 'style="color:' + INK + ';' + st + '"'; }); }
  function hexA(h, a){ var n = parseInt(h.slice(1), 16); return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a.toFixed(2) + ")"; }
  function stack(S, big){   // 모두 같은 금액씩 담으면 매달 들어오는 돈 (쌓은 막대)
    var L = S.filter(function(s){ return s.mo; }); if (!L.length) return '';
    var ms = monthsAhead(), tot = ms.map(function(_, k){ return L.reduce(function(a, s){ return a + s.mo[k]; }, 0); }), mx = Math.max.apply(null, tot) || 1, H = big ? 260 : 210;
    return '<div style="display:flex;align-items:flex-end;gap:8px;height:' + (H + 44) + 'px;padding-top:6px">' + ms.map(function(m, k){
      var segs = L.map(function(s){ var v = s.mo[k]; return v ? '<div style="height:' + (v / mx * H).toFixed(1) + 'px;background:' + s.o.c + '"></div>' : ''; }).join("");
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;height:100%">' +
        '<div style="font-size:11px;font-weight:800;text-align:center;color:' + INK + ';margin-bottom:3px">' + (tot[k] ? wk(tot[k]) : '') + '</div>' +
        '<div style="display:flex;flex-direction:column-reverse;border-radius:6px 6px 0 0;overflow:hidden;min-height:2px;background:' + (tot[k] ? 'transparent' : '#eef1f6') + '">' + segs + '</div>' +
        '<div style="font-size:12px;text-align:center;color:' + (k === 0 ? INK : SUB) + ';font-weight:' + (k === 0 ? 900 : 600) + ';margin-top:5px;border-top:1.5px solid ' + INK + ';padding-top:4px">' + m.m + '월</div></div>'; }).join("") + '</div>';
  }
  function legend(S, fs){ return '<div style="display:flex;flex-wrap:wrap;gap:6px 16px;font-size:' + fs + 'px;color:' + INK + '">' + S.map(function(s){ return '<span style="display:inline-flex;align-items:center;gap:6px">' + dot(s.o.c, fs * 0.75) + e(main1(s.o)) + '</span>'; }).join("") + '</div>'; }
  var RISK = ["이 자료는 투자 판단을 돕기 위한 참고 자료이며, 투자 권유나 수익 보장이 아님.",
    "배당률은 최근 1년 실제 배당 ÷ 현재 가격으로 계산한 값이며, 과거 배당이 미래 배당을 보장하지 않음. 배당은 회사·운용사 결정에 따라 줄거나 멈출 수 있음.",
    "배당 입금 달·금액은 지난 일정으로 본 예상이며 실제와 다를 수 있음. 해외 상품은 환율에 따라 원화 금액이 달라짐.",
    "세후 금액은 국내 15.4%·미국 15% 원천징수 기준 대략값이며, 금융소득 연 2,000만원 초과 시 종합과세 등 개인 상황에 따라 달라짐.",
    "주식·ETF는 원금 손실이 날 수 있으며 예금자보호법에 따라 보호되지 않음. 투자 전 상품설명서·약관을 꼭 확인할 것."];
  function riskBox(fs, n){ return '<div style="border-top:2px solid ' + INK + ';padding-top:10px;font-size:' + fs + 'px;line-height:1.6;color:' + SUB + '"><b style="color:' + INK + '">⚠️ 꼭 알아 두실 점</b>' + RISK.slice(0, n || RISK.length).map(function(t){ return '<div>· ' + t + '</div>'; }).join("") + (simLine() ? '<div style="margin-top:6px;font-weight:800;color:' + INK + '">' + e(simLine()) + '</div>' : '') + '</div>'; }


  /* ⚖️ 심의필 (11/12 사용자 「필요해 만들어」) — 제안서 심의필과 따로 · 위험고지 문구(RISK)가 바뀌면 DV_VER 를 올림 → 예전 번호는 「다시 심의」 */
  var DV_VER = "2026.11.12-1";
  function SIM(){ try { return JSON.parse(lsg("divc_sim") || "{}") || {}; } catch(x){ return {}; } }
  function simSet(k, v){ var m = SIM(); m[k] = v; m.ver = DV_VER; lss("divc_sim", JSON.stringify(m)); }
  function tdy(){ return ymd(new Date(Date.now() + 9 * 3600e3 + new Date().getTimezoneOffset() * 6e4)); }
  function dt(v){ return String(v || "").replace(/-/g, "."); }
  function simState(){ var m = SIM(), no = (m.no || "").trim();
    if (!no) return {ok: false, t: "⚠️ 심의필 없음", why: "아직 번호가 없음 — 「📝 심의 요청서」를 만들어 준법감시에 내고, 받은 번호를 넣어 주세요"};
    if (m.ver && m.ver !== DV_VER) return {ok: false, t: "🔄 문구 바뀜 · 다시 심의", why: "위험고지 문구가 바뀌었음(" + DV_VER + ") — 새 요청서로 다시 심의받아 주세요"};
    if (m.to && m.to < tdy()) return {ok: false, t: "⏰ 유효기간 지남", why: "유효기간(" + dt(m.to) + ")이 지났음 — 다시 심의받아 주세요"};
    var left = m.to ? Math.round((pd(m.to) - pd(tdy())) / DAY) : null;
    return {ok: true, warn: left != null && left <= 30, t: left != null && left <= 30 ? "⏳ 심의필 " + left + "일 남음" : "✅ 심의필 등록됨", why: ""}; }
  function simText(){ var m = SIM(), no = (m.no || "").trim(); return no ? (/^제/.test(no) ? no : "제 " + no) + (/호$/.test(no) ? "" : "호") + (m.from || m.to ? " (" + dt(m.from) + "~" + dt(m.to) + ")" : "") : ""; }
  function simLine(){ return simState().ok ? "미래에셋증권 준법감시인 심사필 " + simText() : ""; }
  function simUI(){ var m = SIM(), st = simState();
    return '<details class="dv-sim"' + (st.ok ? '' : ' open') + '><summary>⚖️ 심의필 <span class="dv-sb ' + (st.ok ? (st.warn ? 'w' : 'g') : 'r') + '" id="dvsb">' + st.t + '</span></summary>' +
      '<p class="dv-st" id="dvsw" style="margin-top:4px">' + (st.why || "한 장·PDF·PPT 맨 아래에 심사필 번호가 찍혀요") + '</p>' +
      '<label class="dv-f">번호<input id="dvsno" maxlength="40" placeholder="예: 제2026-0000호" value="' + e(m.no || "") + '"></label>' +
      '<div class="dv-sd"><label>시작<input id="dvsfr" type="date" value="' + e(m.from || "") + '"></label><label>끝<input id="dvsto" type="date" value="' + e(m.to || "") + '"></label></div>' +
      '<button type="button" data-dvmk="rev" class="dv-rv">📝 심의 요청서 PDF<small>요청서 1쪽 + 위험고지 문구 전문 + 지금 비교 견본 4쪽 별첨</small></button>' +
      '<p class="dv-st">심의 순서: ① 요청서 PDF 만들기 → ② 준법감시에 제출 → ③ 받은 번호·기간을 위에 넣기 · 위험고지 문구 버전 ' + DV_VER + '</p></details>'; }
  function simRefresh(){ var st = simState(), b = document.getElementById("dvsb"), w = document.getElementById("dvsw");
    if (b){ b.textContent = st.t; b.className = "dv-sb " + (st.ok ? (st.warn ? "w" : "g") : "r"); } if (w) w.textContent = st.why || "한 장·PDF·PPT 맨 아래에 심사필 번호가 찍혀요"; }
  function reqPage(o){
    var names = LAST.map(function(x){ return e(x.name) + (tkName(x) !== main1(x) ? " (" + e(V.cd(x.sym)) + ")" : ""); });
    var row = function(k, v){ return '<tr><td style="width:150px;padding:9px 12px;background:#f5f7fb;border:1px solid ' + LN + ';font-weight:800;font-size:13px">' + k + '</td><td style="padding:9px 12px;border:1px solid ' + LN + ';font-size:13px;line-height:1.55">' + v + '</td></tr>'; };
    var body = '<div style="font-size:26px;font-weight:900;margin:8px 0 4px">광고·홍보물 심의 요청서</div><div style="font-size:13px;color:' + SUB + ';margin-bottom:16px">고객 배포용 배당 비교 자료 (한 장 그림 · PDF · PPT)</div>' +
      '<table style="border-collapse:collapse;width:100%">' +
      row("요청일", todayK()) + row("요청자", (o.org ? e(o.org) + " · " : "") + (e(o.pb) || "(이름)")) +
      row("자료명", "종목·ETF 배당 비교 (고객 맞춤 · 고객 이름 자동 기재)") +
      row("배포 방식", "카카오톡·문자 1:1 전송 (그림 1장 / PDF 4쪽 / PPT 4쪽) · 불특정 다수 게시 없음") +
      row("내용", "비교 종목의 배당률(최근 1년 실제 배당 ÷ 현재가), 기준 금액당 1년 배당(세전·세후 대략), 배당 주기·입금 예상 달, 1년 전 대비 배당 증감, 주가 1년·주가+배당 1년 수익률 — 매 작성 시점 시세로 자동 계산") +
      row("바뀌는 부분", "종목·ETF 종류와 개수(2~8개), 기준 금액(100만~1억원), 고객 이름, 작성일 시세 · 문구 틀과 위험고지는 고정") +
      row("견본 종목", names.join(", ")) + row("위험고지 버전", DV_VER) + row("희망 사용 기간", "심의일로부터 1년") + '</table>' +
      '<div style="font-size:17px;font-weight:900;margin:22px 0 8px">위험고지 문구 (자료 하단에 그대로 표기)</div>' +
      '<div style="border:1.5px solid ' + LN + ';border-radius:12px;padding:12px 16px;font-size:12.5px;line-height:1.7">' + RISK.map(function(t, i){ return '<div>' + (i + 1) + '. ' + t + '</div>'; }).join("") + '</div>' +
      '<div style="font-size:12px;color:' + SUB + ';margin-top:14px;line-height:1.6">· 별첨: 위 견본 종목으로 만든 PDF 4쪽 (한 장 그림은 PDF 1·2·3쪽 내용을 줄인 것)<br>· 심사필 번호는 받은 뒤 자료 하단에 「미래에셋증권 준법감시인 심사필 제 ○○호 (유효기간)」로 표기함</div>' +
      '<div style="margin-top:28px;display:flex;justify-content:flex-end;gap:12px">' + ["요청자", "부점장", "준법감시인"].map(function(t){ return '<div style="width:110px;border:1px solid ' + LN + ';text-align:center"><div style="background:#f5f7fb;font-size:12px;font-weight:800;padding:5px">' + t + '</div><div style="height:58px"></div></div>'; }).join("") + '</div>';
    return '<div style="width:' + PW + 'px;height:' + PH + 'px;background:#fff;font-family:' + FONT + ';position:relative;overflow:hidden">' + fixC('<div style="padding:40px 48px">' + body + '</div>') + '</div>';
  }
  // 📱 한 장 (1080 폭 · 카톡)
  function onePage(R, o){
    var S = sc(R, o.A), W = 1080, M = 48;
    var info = [["주는 횟수", function(s){ return s.o.fq ? (s.o.stale ? "중단?" : s.o.fq.k) : "–"; }], ["입금 달(대략)", function(s){ return s.o.payM && !s.o.stale ? (s.o.payM.length >= 12 ? "매달" : s.o.payM.length >= 9 ? "거의 매달 (" + s.o.payM.length + "번)" : s.o.payM.join("·") + "월") : "–"; }],
      ["다음 입금", function(s){ return s.o.nextPay ? md(s.o.nextPay) + "쯤" : "–"; }], ["주가+배당 1년", function(s){ return sg(s.o.tot); }]];
    var cols = S.length, lw = 190, cw = (W - 2 * M - lw) / cols;
    var tbl = '<div style="border:1.5px solid ' + LN + ';border-radius:20px;overflow:hidden"><div style="display:flex;background:#f5f7fb">' + '<div style="width:' + lw + 'px"></div>' +
      S.map(function(s){ return '<div style="width:' + cw + 'px;padding:12px 6px;text-align:center;font-size:' + (cols > 5 ? 16 : 19) + 'px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:3px solid ' + s.o.c + '">' + e(main1(s.o)) + '</div>'; }).join("") + '</div>' +
      info.map(function(r){ return '<div style="display:flex;border-top:1px solid ' + LN + '"><div style="width:' + lw + 'px;padding:13px 16px;font-size:19px;color:' + SUB + ';font-weight:700">' + r[0] + '</div>' +
        S.map(function(s){ var t = r[1](s); return '<div style="width:' + cw + 'px;padding:13px 4px;text-align:center;font-size:' + (cols > 5 ? 16 : 20) + 'px;font-weight:800;color:' + (/^\+/.test(t) ? "#d33a2c" : /^−/.test(t) ? "#2563c9" : INK) + '">' + e(t) + '</div>'; }).join("") + '</div>'; }).join("") + '</div>';
    var sub = S.length + '개 비교 · ' + amtLab(o.A) + '씩 넣었다고 보면 · 세전';
    return '<div style="width:' + W + 'px;background:#fff;font-family:' + FONT + ';color:' + INK + '">' + band(o, W, "1년 배당, 누가 더 줄까", sub) +
      fixC('<div style="padding:34px ' + M + 'px 40px">' + heroBox(S, o.A, true) +
        hTitle("📊 1년에 받는 배당", amtLab(o.A) + " 기준 · 많은 순", true) + barsH(S, o.A, true) +
        hTitle("📅 언제 들어오나", "앞으로 12달 · 입금 예상 · 진할수록 많이", true) + heat(S, true) +
        hTitle("🧾 한눈에 비교", "", true) + tbl +
        '<div style="margin-top:28px">' + riskBox(15.5, 5) + '</div></div>') + '</div>';
  }
  // 📄 A4 4쪽
  function page(o, k, title, sub, body){
    return '<div style="width:' + PW + 'px;height:' + PH + 'px;background:#fff;font-family:' + FONT + ';color:' + INK + ';position:relative;overflow:hidden">' + band(o, PW, title, sub, k) +
      fixC('<div style="padding:4px 48px 0">' + body + '</div>') +
      '<div style="position:absolute;left:48px;right:48px;bottom:22px;display:flex;justify-content:space-between;font-size:10.5px;color:' + SUB + ';border-top:1px solid ' + LN + ';padding-top:8px"><span>' + todayK() + ' 기준' + (o.org ? ' · ' + e(o.org) : '') + (o.pb ? ' · ' + e(o.pb) : '') + (simLine() ? ' · ' + e(simLine()) : '') + '</span><span>' + k + ' / 4</span></div></div>';
  }
  function pages(R, o){
    var S = sc(R, o.A), A = o.A, names = S.map(function(s){ return e(main1(s.o)); }).join(" · ");
    var ok = ranked(S).filter(function(s){ return s.o.y > 0; }), b = ok[0];
    var live = R.filter(function(x){ return x.fq && !x.stale; }), mxn = Math.max.apply(null, live.map(function(x){ return x.fq.n; }).concat([0])), often = live.filter(function(x){ return x.fq.n === mxn; });
    var gro = R.filter(function(x){ return x.gr != null && !x.spec; }).sort(function(x, y){ return y.gr - x.gr; })[0];
    var tr = R.filter(function(x){ return x.tot != null; }).sort(function(x, y){ return y.tot - x.tot; })[0];
    var pts = [];
    if (b) pts.push(["💰", "배당 가장 많음", e(main1(b.o)) + " — " + amtLab(A) + "이면 1년 " + won(b.ann) + " (" + pc(b.o.y) + ")"]);
    if (often.length) pts.push(["📅", "가장 자주 줌", often.length < R.length ? often.map(function(x){ return e(main1(x)); }).join(" · ") + " (" + often[0].fq.k + ")" : "모두 " + often[0].fq.k]);
    if (gro && gro.gr > 0) pts.push(["🌱", "배당 가장 많이 늘림", e(main1(gro)) + " — 1년 전보다 1주당 배당 " + sg(gro.gr)]);
    if (tr) pts.push(["📈", "주가+배당 1년 1등", e(main1(tr)) + " " + sg(tr.tot) + " — 배당만 보지 말고 같이 봐야 함"]);
    var p1 = heroBox(S, A, false) +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">' + pts.map(function(p){ return '<div style="border:1.5px solid ' + LN + ';border-radius:14px;padding:12px 14px"><div style="font-size:12.5px;color:' + SUB + ';font-weight:800">' + p[0] + ' ' + p[1] + '</div><div style="font-size:14px;font-weight:700;line-height:1.45;margin-top:3px">' + p[2] + '</div></div>'; }).join("") + '</div>' +
      hTitle("📊 1년에 받는 배당", amtLab(A) + " 기준 · 많은 순 · 세전 (세후 함께)") + barsH(S, A, false) +
      '<div style="margin-top:14px;font-size:11.5px;color:' + SUB + ';line-height:1.6">배당률 = 최근 1년 실제 받은 배당 ÷ 지금 가격 (기록이 없으면 증권사 자료 배당률) · 세후 = 국내 15.4% · 미국 15% 원천징수 기준</div>';
    var totY = S.reduce(function(a, s){ return a + (s.ann || 0); }, 0), totN = S.reduce(function(a, s){ return a + (s.net || 0); }, 0);
    var nxL = S.filter(function(s){ return s.o.nextPay; }).sort(function(x, y){ return x.o.nextPay - y.o.nextPay; });
    var p2 = hTitle("📅 모두 " + amtLab(A) + "씩 담으면 매달 들어오는 돈", "앞으로 12달 · 입금 예상") + legend(S, 13) + stack(S, false) +
      '<div style="display:flex;gap:10px;margin-top:14px">' + [["총 투자", won(A * S.length)], ["1년 배당 (세전)", won(totY)], ["1년 배당 (세후·대략)", totN ? won(totN) : "–"], ["한 달 평균", won(totY / 12)]].map(function(x, i){
        return '<div style="flex:1;border-radius:12px;padding:10px 12px;background:' + (i === 1 ? '#fff6dd' : '#f5f7fb') + '"><div style="font-size:11.5px;color:' + SUB + ';font-weight:700">' + x[0] + '</div><div style="font-size:17px;font-weight:900;margin-top:2px">' + x[1] + '</div></div>'; }).join("") + '</div>' +
      hTitle("🗓 종목별 입금 달력", amtLab(A) + " 기준 · 진할수록 많이") + heat(S, false) +
      (nxL.length ? hTitle("⏭ 다음 배당 순서", "배당락 → 입금 (대략)") + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 14px">' + nxL.map(function(s){ return '<div style="display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 0;border-bottom:1px solid ' + LN + '">' + dot(s.o.c, 9) + '<b style="color:' + INK + ';flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(s.o)) + '</b><span style="color:' + SUB + '">' + md(s.o.next) + ' → </span><b>' + md(s.o.nextPay) + '쯤</b><span style="color:' + SUB + ';width:70px;text-align:right">' + (s.per ? wonS(s.per) : '') + '</span></div>'; }).join("") + '</div>' : '');
    var rows = [
      ["배당률", function(x){ return x.o.y; }, function(v){ return pc(v); }, 1], [amtLab(A) + " → 1년", function(x){ return x.ann; }, function(v){ return wonS(v); }, 1],
      ["1번 받을 때", function(x){ return x.per; }, function(v){ return wonS(v); }], ["세후 1년(대략)", function(x){ return x.net; }, function(v){ return wonS(v); }, 1],
      ["주는 횟수", function(x){ return x.o.fq && !x.o.stale ? x.o.fq.n : null; }, function(v, x){ return x.o.fq ? (x.o.stale ? "중단?" : x.o.fq.k) : "–"; }, 1],
      ["배당락 달", null, function(v, x){ return x.o.exM && !x.o.stale ? (x.o.exM.length >= 12 ? "매달" : x.o.exM.length >= 9 ? "거의 매달" : x.o.exM.join("·") + "월") : "–"; }],
      ["입금 달(대략)", null, function(v, x){ return x.o.payM && !x.o.stale ? (x.o.payM.length >= 12 ? "매달" : x.o.payM.length >= 9 ? "거의 매달" : x.o.payM.join("·") + "월") : "–"; }],
      ["다음 배당락", null, function(v, x){ return x.o.next ? md(x.o.next) + "쯤" : "–"; }],
      ["1년 전보다 배당", function(x){ return x.o.spec ? null : x.o.gr; }, function(v){ return sg(v); }, 1],
      ["1주 가격", null, function(v, x){ return fmtPx(x.o.price, x.o.cur); }], ["1주당 1년 배당", null, function(v, x){ return x.o.ps ? fmtPx(x.o.ps, x.o.cur) : "–"; }],
      ["주가 1년", function(x){ return x.o.r1y; }, function(v){ return sg(v); }, 1], ["주가+배당 1년", function(x){ return x.o.tot; }, function(v){ return sg(v); }, 1]];
    var n = S.length, lw = 128, cw = (PW - 96 - lw) / n, tf = n > 5 ? 11.5 : 13;
    function bst(f, hi){ var v = S.map(f).filter(function(x){ return x != null && isFinite(x); }); return v.length < 2 ? null : hi ? Math.max.apply(null, v) : Math.min.apply(null, v); }
    var p3 = hTitle("🧾 나란히 비교", "초록 = 가장 좋은 쪽") + '<div style="border:1.5px solid ' + LN + ';border-radius:14px;overflow:hidden">' +
      '<div style="display:flex;background:#f5f7fb"><div style="width:' + lw + 'px"></div>' + S.map(function(s){ return '<div style="width:' + cw + 'px;padding:10px 4px 8px;text-align:center;border-bottom:3px solid ' + s.o.c + '"><div style="font-size:' + tf + 'px;font-weight:900;color:' + INK + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(main1(s.o)) + '</div><div style="font-size:' + (tf - 2.5) + 'px;color:' + SUB + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(tkName(s.o)) + '</div></div>'; }).join("") + '</div>' +
      rows.map(function(rw, ri){ var bv = rw[1] && rw[3] != null ? bst(rw[1], rw[3]) : null;
        return '<div style="display:flex;border-top:1px solid ' + LN + ';background:' + (ri % 2 ? '#fbfcfe' : '#fff') + '"><div style="width:' + lw + 'px;padding:10px 12px;font-size:12px;color:' + SUB + ';font-weight:700">' + rw[0] + '</div>' +
          S.map(function(s){ var v = rw[1] ? rw[1](s) : null, w = bv != null && v === bv, t = rw[2](v, s); return '<div style="width:' + cw + 'px;padding:10px 3px;text-align:center;font-size:' + tf + 'px;font-weight:' + (w ? 900 : 700) + ';color:' + (w ? WIN : INK) + ';background:' + (w ? 'rgba(20,137,95,.08)' : 'transparent') + '">' + e(t) + '</div>'; }).join("") + '</div>'; }).join("") + '</div>' +
      hTitle("💡 이렇게 읽으면 됨") + '<div style="display:grid;gap:8px">' + [
        ["배당률이 높다 ≠ 수익이 크다", "주가가 빠지면 배당을 받아도 손해일 수 있음 — 「주가+배당 1년」 줄을 같이 봐야 함"],
        ["자주 주는 것 = 생활비용", "월배당은 매달 현금이 필요할 때 편리함 · 분기·연 배당은 한 번에 크게 들어옴"],
        ["배당이 늘어나는 곳", "「1년 전보다 배당」이 플러스면 회사가 배당을 키우는 중이라는 뜻 — 오래 들고 갈수록 유리"]].map(function(x){
          return '<div style="border-left:4px solid ' + GOLD + ';background:#fffbf0;border-radius:0 12px 12px 0;padding:10px 14px"><div style="font-size:14px;font-weight:900">' + x[0] + '</div><div style="font-size:12.5px;color:' + SUB + ';line-height:1.5;margin-top:2px">' + x[1] + '</div></div>'; }).join("") + '</div>';
    var cards = S.map(function(s){ var x = s.o, sp = x.spark || [], mx = Math.max.apply(null, sp.map(function(z){ return z[1]; }).concat([0])) || 1;
      var bars = sp.length ? '<div style="display:flex;align-items:flex-end;gap:3px;height:54px;margin:8px 0 2px">' + sp.map(function(z, k){ return '<div style="flex:1;height:' + Math.max(3, z[1] / mx * 54).toFixed(1) + 'px;background:' + x.c + ';opacity:' + (k === sp.length - 1 ? 1 : .5) + ';border-radius:3px 3px 0 0"></div>'; }).join("") + '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:9.5px;color:' + SUB + '"><span>' + sp[0][0].slice(2, 7).replace("-", ".") + '</span><span>최근 ' + sp.length + '번</span><span>' + sp[sp.length - 1][0].slice(2, 7).replace("-", ".") + '</span></div>' : '<div style="font-size:11.5px;color:' + SUB + ';padding:16px 0">배당 기록 모으는 중</div>';
      var kv = [];
      if (x.lastEx) kv.push(["지난 배당", ymd(x.lastEx).slice(2).replace(/-/g, ".") + " · 1주 " + fmtPx(x.lastAmt, x.cur)]);
      if (x.next) kv.push(["다음 예상", md(x.next) + " → 입금 " + md(x.nextPay) + "쯤"]);
      if (s.per) kv.push(["한 번에", "약 " + won(s.per) + " (" + amtLab(A) + ")"]);
      if (x.gr != null) kv.push(["1년 전보다", x.spec ? "특별배당 섞임" : sg(x.gr)]);
      return '<div style="border:1.5px solid ' + LN + ';border-top:4px solid ' + x.c + ';border-radius:12px;padding:10px 12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' + nm2(x, 14, 10.5) + '<div style="text-align:right;flex:0 0 auto"><div style="font-size:16px;font-weight:900">' + (x.y ? pc(x.y) : '–') + '</div><div style="font-size:10.5px;color:' + SUB + '">' + (x.fq ? (x.stale ? '중단?' : x.fq.k) : '') + '</div></div></div>' + bars +
        kv.map(function(k){ return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-top:1px dashed ' + LN + '"><span style="color:' + SUB + '">' + k[0] + '</span><b>' + e(k[1]) + '</b></div>'; }).join("") + '</div>'; }).join("");
    var p4 = hTitle("📈 종목별 배당 흐름", "최근 배당 막대 · 진한 막대 = 가장 최근") + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + cards + '</div>' +
      '<div style="position:absolute;left:48px;right:48px;bottom:56px">' + riskBox(10.5) + '</div>';
    return [page(o, 1, "1년 배당, 누가 더 줄까", names + " · " + amtLab(A) + " 기준", p1),
            page(o, 2, "언제, 얼마나 들어오나", "앞으로 12달 입금 예상 · " + amtLab(A) + " 기준", p2),
            page(o, 3, "숫자로 나란히", "배당률 · 주기 · 세후 · 주가까지 한 표에", p3),
            page(o, 4, "종목별 배당 흐름", "지난 배당과 다음 배당 · 알아 둘 점", p4)];
  }

  window.divcView = view;
  window.__divc = {onePage: function(o){ return onePage(LAST, o); }, pages: function(o){ return pages(LAST, o); }, last: function(){ return LAST; }};
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
    ".dv-send h3{margin-bottom:12px}.dv-f{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub);margin:0 0 10px;white-space:nowrap}.dv-f input{flex:1;min-width:0;font:inherit;font-size:15px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text)}" +
    ".dv-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-4px 0 10px}.dv-rc button,.dv-am button{font:inherit;font-size:13px;font-weight:700;padding:6px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);cursor:pointer}.dv-rc button.on,.dv-am button.on{border-color:var(--acc,#7c9cff);background:rgba(124,156,255,.18)}" +
    ".dv-f2{font-size:13px;color:var(--sub);margin:2px 0 12px}.dv-am{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}.dv-am button{padding:8px 0}" +
    ".dv-mk{display:grid;gap:8px}.dv-mk button{text-align:left;font:inherit;font-size:16px;font-weight:800;padding:13px 14px;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2,transparent);color:var(--text);cursor:pointer}.dv-mk button small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px}.dv-mk button.main{background:#fee500;color:#191919;border-color:#fee500}.dv-mk button.main small{color:#5a4f00}.dv-mk button[disabled]{opacity:.6}" +
    ".dv-st{font-size:12px;color:var(--sub);line-height:1.5;margin:10px 2px 0;word-break:keep-all}" +
    ".dv-sim{margin:12px 0 0;border:1px solid var(--line);border-radius:14px;padding:10px 12px}.dv-sim summary{cursor:pointer;font-size:14.5px;font-weight:800;list-style:none;display:flex;align-items:center;gap:8px}.dv-sim summary::-webkit-details-marker{display:none}.dv-sim[open] summary{margin-bottom:6px}" +
    ".dv-sb{font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;margin-left:auto}.dv-sb.g{background:rgba(25,158,112,.18);color:#3fcf9a}.dv-sb.w{background:rgba(201,133,0,.2);color:#f2c14e}.dv-sb.r{background:rgba(217,89,38,.2);color:#ff8a65}" +
    ".dv-sd{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 10px}.dv-sd label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub)}.dv-sd input{font:inherit;font-size:14px;padding:8px 9px;border-radius:10px;border:1px solid var(--line);background:var(--panel2,transparent);color:var(--text);min-width:0}" +
    ".dv-rv{display:block;width:100%;text-align:left;font:inherit;font-size:15px;font-weight:800;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--panel2,transparent);color:var(--text);cursor:pointer}.dv-rv small{display:block;font-size:12px;font-weight:500;color:var(--sub);margin-top:2px}" +
    "@media(max-width:360px){.dv-ns{grid-template-columns:repeat(3,1fr)}}";
    document.head.appendChild(st); })();
})();
