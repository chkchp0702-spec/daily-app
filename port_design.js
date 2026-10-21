/* 🎛 포트 설계기 — 10/21 A10/21-1 (사용자 「다 좋다 다 진행해」)
   💼 포트 탭: S&P·나스닥·금 막대를 손가락으로 밀면(나머지는 현금·단기채) 2008년부터 매일 굴린 셈으로
   연 수익·최대 낙폭·최악의 해·「1,000만원 → ○○만원」 곡선이 휴대폰에서 바로 다시 계산됨.
   토글 두 개 = 💼 기본 규칙 그대로(🛡 S&P 200일선 아래면 주식 줄이기 · 📉 20일 변동성 맞춤 목표 15%) → 끄고 켤 때 보험값이 숫자 두 개로.
   종목 하나를 0~20% 섞어 볼 수 있음(일봉 있는 18개 · 종목 화면 「💼 이 종목 5% 넣어 보면」 단추가 여기로).
   자료: archive/x/port_px/(SPY·QQQ·GLD·BIL 배당 포함 수정종가, port_px.py 가 7일마다) · 종목은 archive/x/els_px(종가)
   검사: port_px/check.json(파이썬이 같은 자료·같은 규칙으로 낸 값)과 이 엔진 값이 같아야 「✓ 파이썬과 같음」.
   원칙: 과거 계산 · 미래 보장 아님 · 사라는 말 없음 · 세금·환전 비용 빼지 않음. */
(function(){
  var ETF = ["SPY", "QQQ", "GLD", "BIL"], PX = {}, IDX = null, IDXW = null, EIDX = null, CHK = null, CHKOK = null;
  var ST = {w: {SPY: 47.5, QQQ: 47.5, GLD: 5}, reg: 1, vol: 1, st: "", stw: 5, prev: null, last: null, ms: 0};
  try { var sv = JSON.parse(localStorage.getItem("pdz") || "null"); if (sv && sv.w) ["w", "reg", "vol", "st", "stw"].forEach(function(k){ if (sv[k] !== undefined) ST[k] = sv[k]; }); } catch(x) {}
  function keep(){ try { localStorage.setItem("pdz", JSON.stringify({w: ST.w, reg: ST.reg, vol: ST.vol, st: ST.st, stw: ST.stw})); } catch(x) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function won(v){ var m = v / 1e4; return m >= 1e4 ? (m / 1e4).toFixed(m >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  var STK = ["삼성전자", "SK하이닉스", "현대차", "한국전력", "엔비디아", "애플", "브로드컴", "AMD", "마이크론", "인텔", "테슬라", "팔란티어", "KOSPI200", "NIKKEI225", "EUROSTOXX50", "HSCEI"];
  var LAB = {"KOSPI200": "코스피200", "NIKKEI225": "니케이225", "EUROSTOXX50": "유로스탁스50", "HSCEI": "항셍중국"};
  function lab(n){ return LAB[n] || n; }
  var COLS = {SPY: "#3987e5", QQQ: "#d95926", GLD: "#c9a227", X: "#d55181", BIL: "#8a94a8"};

  /* ── 자료 ── */
  function dec(j){ var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, d = new Int32Array(j.dd.length), c = new Float64Array(j.c.length);
    for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; d[i] = t; c[i] = j.c[i]; } return {d: d, c: c}; }
  function idx(){
    if (!IDXW) IDXW = Promise.all([
      getJSON("archive/x/port_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/els_px/index.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; }),
      getJSON("archive/x/port_px/check.json?" + Math.floor(Date.now() / 3600e3), {ttl: 3600e3}).catch(function(){ return null; })
    ]).then(function(r){ IDX = r[0] && r[0].assets ? r[0] : {assets: {}}; EIDX = r[1] && r[1].assets ? r[1] : {assets: {}}; CHK = r[2]; return IDX; });
    return IDXW;
  }
  function px(k){
    if (PX[k]) return PX[k];
    var a = IDX && IDX.assets[k], b = !a && EIDX && EIDX.assets[k];
    if (!a && !b) return Promise.resolve(null);
    var u = a ? "archive/x/port_px/" + a.f + "?" + String(a.at || IDX.updated || "").replace(/\D/g, "") : "archive/x/els_px/" + b.f + "?" + String(EIDX.updated || "").replace(/\D/g, "");
    PX[k] = getJSON(u, {ttl: 864e5}).then(function(j){ return j && j.dd ? dec(j) : null; }).catch(function(){ return null; });
    return PX[k];
  }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }

  /* ── 엔진 (port_px.py engine 과 같은 규칙 · 첫날은 BIL 상장 뒤 201거래일) ── */
  function align(ser){   // 모든 자산이 있는 날만
    var ks = Object.keys(ser), base = ser[ks[0]], ptr = {}, D = [], C = {};
    ks.forEach(function(k){ ptr[k] = 0; C[k] = []; });
    for (var i = 0; i < base.d.length; i++){
      var t = base.d[i], ok = true;
      for (var j = 1; j < ks.length; j++){ var s = ser[ks[j]]; while (ptr[ks[j]] < s.d.length && s.d[ptr[ks[j]]] < t) ptr[ks[j]]++; if (ptr[ks[j]] >= s.d.length || s.d[ptr[ks[j]]] !== t){ ok = false; break; } }
      if (!ok) continue;
      D.push(t); C[ks[0]].push(base.c[i]); for (var j2 = 1; j2 < ks.length; j2++) C[ks[j2]].push(ser[ks[j2]].c[ptr[ks[j2]]]);
    }
    return {D: D, C: C};
  }
  var ALN = {};
  function engine(A, w, o){   // w: {SPY,QQQ,GLD,BIL,X?} 합 1 · o: {reg, vol, start}
    o = o || {}; var D = A.D, n = D.length, K = Object.keys(w), C = A.C, tgt = 15, floor = 0.30, band = 0.05, cost = 0.001;
    var R = {}; K.concat(["SPY"]).forEach(function(k){ if (R[k]) return; var c = C[k], r = new Float64Array(n); for (var i = 1; i < n; i++) r[i] = c[i] / c[i - 1] - 1; R[k] = r; });
    var spy = C.SPY, reg = new Uint8Array(n), s = 0, cur = 0, run = 0;
    for (var i = 0; i < n; i++){ s += spy[i]; if (i >= 200) s -= spy[i - 200];
      var v = i >= 199 && spy[i] > s / 200 ? 1 : 0;
      if (v !== cur){ run++; if (run >= 3){ cur = v; run = 0; } } else run = 0;
      reg[i] = cur; }
    var eq = w.SPY + w.QQQ, ws = eq > 0 ? w.SPY / eq : 0.5, wq = eq > 0 ? w.QQQ / eq : 0.5, sc = new Float64Array(n);
    for (var i2 = 0; i2 < n; i2++){
      if (i2 < 20){ sc[i2] = 1; continue; }
      var m = 0, q = 0, a;
      for (var j = i2 - 19; j <= i2; j++) m += ws * R.SPY[j] + wq * R.QQQ[j];
      m /= 20;
      for (var j3 = i2 - 19; j3 <= i2; j3++){ a = ws * R.SPY[j3] + wq * R.QQQ[j3] - m; q += a * a; }
      var sd = Math.sqrt(q / 19) * Math.sqrt(252) * 100;
      sc[i2] = sd > 0 ? Math.min(1, Math.max(floor, tgt / sd)) : 1;
    }
    var f = 0.63 / 0.95, wx = w.X || 0;
    function tg(i){
      var on = o.reg ? reg[i] : 1, b = {SPY: w.SPY, QQQ: w.QQQ, GLD: w.GLD, BIL: w.BIL};
      if (!on){ var fr = (w.SPY + w.QQQ) * (1 - f); b = {SPY: w.SPY * f, QQQ: w.QQQ * f, GLD: w.GLD + fr * 0.1875, BIL: w.BIL + fr * 0.8125}; }
      var k = o.vol ? sc[i] : 1, ee = (b.SPY + b.QQQ) * k, out = {SPY: b.SPY * k, QQQ: b.QQQ * k, GLD: b.GLD};
      if (wx) out.X = wx;
      out.BIL = 1 - ee - b.GLD - wx; return out;
    }
    var st = o.start ? Date.parse(o.start + "T00:00:00Z") / 864e5 : 0, i0 = 0;
    while (i0 < n && D[i0] < st) i0++;
    i0 = Math.max(i0, 201); if (i0 >= n - 260) return null;
    var W = null, lastEq = 0, nav = 1, NV = new Float64Array(n - i0), sp = new Float64Array(n - i0), spv = 1, turn = 0, expo = 0;
    for (var t = i0; t < n; t++){
      if (!W){ W = tg(t - 1); lastEq = W.SPY + W.QQQ; }
      var r = 0, sum = 0, nw = {};
      for (var k in W){ r += W[k] * R[k][t]; nw[k] = W[k] * (1 + R[k][t]); sum += nw[k]; }
      for (var k2 in nw) W[k2] = nw[k2] / sum;
      var T = tg(t - 1), newm = day2s(D[t - 1]).slice(5, 7) !== day2s(D[t]).slice(5, 7);
      if (newm || (o.reg && reg[t - 1] !== reg[t - 2]) || Math.abs(T.SPY + T.QQQ - lastEq) > band){
        var tv = 0; for (var k3 in T) tv += Math.abs(T[k3] - (W[k3] || 0)); tv /= 2;
        W = T; lastEq = T.SPY + T.QQQ; r -= tv * cost; turn += tv;
      }
      nav *= 1 + r; NV[t - i0] = nav; spv *= 1 + R.SPY[t]; sp[t - i0] = spv; expo += W.SPY + W.QQQ;
    }
    var ycnt = 0, yrs = (D[n - 1] - D[i0]) / 365.25, pk = 0, mdd = 0, mddAt = 0, spk = 0, smdd = 0, Y = {}, py = null, yv = 1, ysp = 1;
    for (var u = 0; u < NV.length; u++){
      if (NV[u] > pk) pk = NV[u]; var dd = NV[u] / pk - 1; if (dd < mdd){ mdd = dd; mddAt = u; }
      if (sp[u] > spk) spk = sp[u]; var sd2 = sp[u] / spk - 1; if (sd2 < smdd) smdd = sd2;
      var y = day2s(D[i0 + u]).slice(0, 4);
      if (y !== py){ if (py) Y[py] = [(NV[u - 1] / yv - 1) * 100, (sp[u - 1] / ysp - 1) * 100, ycnt]; yv = u ? NV[u - 1] : 1; ysp = u ? sp[u - 1] : 1; py = y; ycnt = 0; }
      ycnt++;
    }
    if (py) Y[py] = [(NV[NV.length - 1] / yv - 1) * 100, (sp[sp.length - 1] / ysp - 1) * 100, ycnt];
    var full = Object.keys(Y).filter(function(y){ return Y[y][2] >= 120; });   // 반년 넘게 굴린 해만 (2008 은 3월부터라 넣음)
    var worst = full.sort(function(a, b){ return Y[a][0] - Y[b][0]; })[0];
    return {from: day2s(D[i0]), to: day2s(D[n - 1]), yrs: yrs, cagr: (Math.pow(nav, 1 / yrs) - 1) * 100, mdd: mdd * 100, mddAt: day2s(D[i0 + mddAt]), end: nav,
      sp_cagr: (Math.pow(spv, 1 / yrs) - 1) * 100, sp_mdd: smdd * 100, sp_end: spv, worst: worst, Y: Y, nv: NV, sp: sp, D: D, i0: i0, expo: expo / NV.length * 100, turn: turn / yrs * 100};
  }
  function wts(){   // 화면 % → 엔진 비중(합 1, 종목은 다른 칸에서 비율대로 떼어 옴)
    var s = ST.w.SPY / 100, q = ST.w.QQQ / 100, g = ST.w.GLD / 100, c = Math.max(0, 1 - s - q - g), x = ST.st ? ST.stw / 100 : 0, k = 1 - x;
    var w = {SPY: s * k, QQQ: q * k, GLD: g * k, BIL: c * k}; if (x) w.X = x; return w;
  }
  function series(){
    var ks = ETF.slice(), names = {SPY: "SPY", QQQ: "QQQ", GLD: "GLD", BIL: "BIL"};
    if (ST.st) ks.push("X");
    return Promise.all(ks.map(function(k){ return px(k === "X" ? ST.st : k); })).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var key = ks.join(",") + (ST.st || ""); if (ALN[key]) return ALN[key];
      var o = {}; ks.forEach(function(k, i){ o[k] = ss[i]; }); ALN[key] = align(o); return ALN[key];
    });
  }
  var START = "2007-06-01";   // BIL(현금) 상장(2007-05-30) + 200일선 준비 → 실제 시작 2008-03 · 2008 폭락·2009 바닥을 다 넣음
  function runAll(A){
    var w = wts(), o = {reg: ST.reg, vol: ST.vol, start: START};
    var t0 = performance.now(), main = engine(A, w, o);
    var alt = {reg: ST.reg ? engine(A, w, {reg: 0, vol: ST.vol, start: START}) : engine(A, w, {reg: 1, vol: ST.vol, start: START}),
               vol: ST.vol ? engine(A, w, {reg: ST.reg, vol: 0, start: START}) : engine(A, w, {reg: ST.reg, vol: 1, start: START})};
    ST.ms = performance.now() - t0;
    return {m: main, alt: alt};
  }
  function verify(){   // check.json 과 같은 숫자인지 (4자산만)
    if (CHKOK !== null || !CHK || !CHK.runs) return Promise.resolve(CHKOK);
    return Promise.all(ETF.map(px)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var A = align({SPY: ss[0], QQQ: ss[1], GLD: ss[2], BIL: ss[3]}), ok = 0, n = 0;
      CHK.runs.forEach(function(r){ var x = engine(A, r.w, {reg: r.reg ? 1 : 0, vol: r.vol ? 1 : 0, start: r.from}); n++;
        if (x && Math.abs(x.cagr - r.cagr) < 0.03 && Math.abs(x.mdd - r.mdd) < 0.15) ok++; else console.warn("pdz check", r.name, r.cagr, r.mdd, x && x.cagr, x && x.mdd); });
      CHKOK = {ok: ok, n: n}; return CHKOK;
    });
  }

  /* ── 화면 ── */
  function sl(k, lb){ return '<label class="pz-sl"><span><i style="background:' + COLS[k] + '"></i>' + lb + ' <b id="pzv' + k + '">' + ST.w[k] + '%</b></span><input type="range" min="0" max="100" step="5" value="' + ST.w[k] + '" data-pz="' + k + '"></label>'; }
  function barH(){
    var w = wts(), seg = function(k, v){ return v > 0.0005 ? '<i style="flex:' + v.toFixed(4) + ';background:' + COLS[k] + '"></i>' : ''; };
    return '<div class="pz-bar">' + seg("SPY", w.SPY) + seg("QQQ", w.QQQ) + seg("GLD", w.GLD) + seg("X", w.X || 0) + seg("BIL", w.BIL) + '</div>' +
      '<div class="pz-lg">S&P ' + r1(w.SPY) + ' · 나스닥 ' + r1(w.QQQ) + ' · 금 ' + r1(w.GLD) + (w.X ? ' · <span style="color:' + COLS.X + '">' + e(lab(ST.st)) + ' ' + r1(w.X) + '</span>' : '') + ' · 현금 ' + r1(w.BIL) + '</div>';
  }
  function r1(v){ return (Math.round(v * 1000) / 10) + "%"; }
  function head(my){
    var stk = STK.filter(function(n){ return EIDX && EIDX.assets[n]; });
    return '<div class="pz-pre"><button data-pre="base">💼 기본 비중</button>' + (my ? '<button data-pre="mine">🙋 내 포트 비중</button>' : '') + '<button data-pre="spy">S&P 100%</button><button data-pre="6040">S&P 60 · 금 20 · 현금 20</button></div>' +
      sl("SPY", "S&P500") + sl("QQQ", "나스닥100") + sl("GLD", "금") +
      '<div id="pzbar">' + barH() + '</div>' +
      '<div class="pz-tg"><button data-tg="reg" class="' + (ST.reg ? "on" : "") + '">🛡 200일선 방어 <b>' + (ST.reg ? "켬" : "끔") + '</b></button><button data-tg="vol" class="' + (ST.vol ? "on" : "") + '">📉 변동성 맞춤 <b>' + (ST.vol ? "켬" : "끔") + '</b></button></div>' +
      '<details class="pz-st"' + (ST.st ? " open" : "") + '><summary>➕ 종목 하나 섞어 보기 ' + (ST.st ? '<b>' + e(lab(ST.st)) + ' ' + ST.stw + '%</b>' : '<span class="mut">(지금 없음)</span>') + '</summary>' +
        '<div class="pz-sc">' + stk.map(function(n){ var y = ((EIDX.assets[n] || {}).from || "").slice(0, 4); return '<button data-stk="' + e(n) + '" class="' + (ST.st === n ? "on" : "") + '">' + e(lab(n)) + (y > "2007" ? '<small>' + y + '~</small>' : '') + '</button>'; }).join("") + '</div>' +
        '<label class="pz-sl"><span>비중 <b id="pzstv">' + ST.stw + '%</b></span><input type="range" min="5" max="20" step="5" value="' + ST.stw + '" id="pzstw"></label>' +
        '<p class="note" style="margin:2px 0 0">종목은 다른 칸에서 비율대로 떼어 와요 · 방어 규칙 밖(그대로 둠) · 그 나라 통화 종가(배당 빠짐) · 상장이 늦으면 그때부터.</p></details>';
  }
  function curve(r){
    var W = 340, H = 150, P = 4, N = r.nv.length, step = Math.max(1, Math.floor(N / 170)), lo = Infinity, hi = -Infinity;
    for (var i = 0; i < N; i++){ var a = Math.log(r.nv[i]), b = Math.log(r.sp[i]); if (a < lo) lo = a; if (b < lo) lo = b; if (a > hi) hi = a; if (b > hi) hi = b; }
    lo = Math.min(lo, 0); var X = function(i){ return P + (W - 2 * P - 40) * i / (N - 1); }, Yf = function(v){ return H - 16 - (H - 26) * (Math.log(v) - lo) / (hi - lo || 1); };
    var path = function(arr){ var s = ""; for (var i = 0; i < N; i += step) s += (s ? "L" : "M") + X(i).toFixed(1) + "," + Yf(arr[i]).toFixed(1); return s + "L" + X(N - 1).toFixed(1) + "," + Yf(arr[N - 1]).toFixed(1); };
    var g = "", mult = [0.5, 1, 2, 3, 4, 6, 8, 12, 16];
    mult.forEach(function(m){ var lv = Math.log(m); if (lv < lo - 0.01 || lv > hi + 0.01) return; var y = Yf(m).toFixed(1);
      g += '<line x1="' + P + '" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" class="pz-gl"/><text x="' + (W - 38) + '" y="' + (+y + 3) + '" class="pz-gt">' + m + '배</text>'; });
    var yt = "", lastY = null;
    for (var j = 0; j < N; j++){ var yy = day2s(r.D[r.i0 + j]).slice(0, 4); if (yy !== lastY && +yy % 4 === 0 && j > 20){ yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + yy + '</text>'; } lastY = yy; }
    var mi = r.D.indexOf ? -1 : -1;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pz-cv" role="img" aria-label="설계한 포트와 S&P500 곡선">' + g + yt +
      '<path d="' + path(r.sp) + '" class="pz-ls"/><path d="' + path(r.nv) + '" class="pz-lm"/>' +
      '<circle cx="' + X(N - 1).toFixed(1) + '" cy="' + Yf(r.nv[N - 1]).toFixed(1) + '" r="3" class="pz-dm"/></svg>' +
      '<div class="pz-key"><span><i class="m"></i>설계한 포트</span><span><i class="s"></i>S&P500(배당 포함, 그대로 들고 있기)</span><span class="mut">눈금은 배수(로그)</span></div>';
  }
  function yearsH(r){
    var ys = Object.keys(r.Y).sort();
    return '<div class="pz-yr">' + ys.map(function(y){ var v = r.Y[y][0], s = r.Y[y][1], a = Math.min(1, Math.abs(v) / 35);
      return '<div title="' + y + ' 설계 ' + sg(v) + '% · S&P ' + sg(s) + '%" style="background:color-mix(in srgb,var(' + (v >= 0 ? "--up" : "--down") + ') ' + Math.round(15 + a * 70) + '%,transparent)"><small>' + y.slice(2) + '</small><b>' + (Math.abs(v) < 0.5 ? "0" : (v > 0 ? "+" : "−") + Math.abs(v).toFixed(0)) + '</b></div>'; }).join("") + '</div>' +
      '<p class="note" style="margin:3px 0 0">해마다 수익률(%) · 처음·마지막 해는 일부 기간 · 칸을 누르면 S&P 와 비교</p>';
  }
  function insur(R){
    var m = R.m, out = [];
    [["reg", "🛡 200일선 방어"], ["vol", "📉 변동성 맞춤"]].forEach(function(t){
      var a = R.alt[t[0]]; if (!a || !m) return; var on = ST[t[0]];
      var dc = a.cagr - m.cagr, dm = a.mdd - m.mdd;
      out.push('<div class="pz-in"><b>' + t[1] + '</b> ' + (on ? '끄면' : '켜면') + ' 연 <b class="' + cl(dc) + '">' + sg(dc, 1) + '%p</b> · 최대 낙폭 ' + sg(m.mdd, 0) + '% → <b class="' + (dm < -0.5 ? "dn" : dm > 0.5 ? "up" : "") + '">' + sg(a.mdd, 0) + '%</b>' +
        '<small>' + (on ? (dc > 0.1 && dm < -0.5 ? '= 이 보험값: 해마다 ' + dc.toFixed(1) + '%p 내고 낙폭 ' + Math.abs(dm).toFixed(0) + '%p 덜 맞음' : dc <= 0.1 && dm < -0.5 ? '= 끄면 덜 벌고 더 맞음 — 공짜 보험' : '') : (dc < -0.1 && dm > 0.5 ? '= 켜면 해마다 ' + Math.abs(dc).toFixed(1) + '%p 내고 낙폭 ' + dm.toFixed(0) + '%p 덜 맞음' : dc >= -0.1 && dm > 0.5 ? '= 켜면 덜 맞고 더 벎 — 공짜 보험' : '')) + '</small></div>');
    });
    return out.join("");
  }
  function delta(c, p){
    if (!c || !p) return "";
    var a = c.cagr - p.cagr, b = c.mdd - p.mdd;
    if (Math.abs(a) < 0.05 && Math.abs(b) < 0.3) return "";
    return '<div class="pz-dl">방금 바꾸기 전보다 · 연 <b class="' + cl(a) + '">' + sg(a, 1) + '%p</b> · 최대 낙폭 <b class="' + (b > 0 ? "up" : "dn") + '">' + sg(b, 1) + '%p</b></div>';
  }
  function result(){
    if (!ST.last) return '<div class="loading">20년 치 계산 중…</div>';
    if (ST.last.err) return '<div class="empty">' + e(ST.last.err) + '</div>';
    var R = ST.last.R, r = R.m, A = amt();
    return '<div class="pz-big"><div><small>연 수익</small><b class="' + cl(r.cagr) + '">' + sg(r.cagr, 1) + '%</b><em>S&P ' + sg(r.sp_cagr, 1) + '%</em></div>' +
      '<div><small>최대 낙폭</small><b class="dn">' + sg(r.mdd, 0) + '%</b><em>' + r.mddAt.slice(0, 7).replace("-", ".") + ' · S&P ' + sg(r.sp_mdd, 0) + '%</em></div>' +
      '<div><small>최악의 해</small><b class="' + cl(r.Y[r.worst][0]) + '">' + sg(r.Y[r.worst][0], 0) + '%</b><em>' + r.worst + (r.Y[r.worst][2] < 240 ? '(일부)' : '') + ' · S&P ' + sg(r.Y[r.worst][1], 0) + '%</em></div></div>' +
      delta(r, ST.prev) +
      '<div class="pz-won">💰 ' + won(A) + '원 → <b>' + won(A * r.end) + '원</b> <small>S&P 그대로였다면 ' + won(A * r.sp_end) + '원 · ' + r.from.slice(0, 7).replace("-", ".") + ' ~ ' + r.to.slice(2).replace(/-/g, ".") + ' (' + r.yrs.toFixed(0) + '년)</small></div>' +
      curve(r) + insur(R) + yearsH(r) +
      '<p class="note pz-ms">휴대폰에서 ' + (r.nv.length * 3).toLocaleString() + '일 치를 ' + (ST.ms < 1000 ? ST.ms.toFixed(0) + 'ms' : (ST.ms / 1000).toFixed(1) + '초') + ' 만에 다시 셈 · 평균 주식 ' + r.expo.toFixed(0) + '%' +
        (CHKOK ? (CHKOK.ok === CHKOK.n ? ' · <b class="pz-ok">✓ 파이썬 검사 ' + CHKOK.n + '개와 같은 숫자</b>' : ' · ⚠️ 파이썬 검사 ' + CHKOK.ok + '/' + CHKOK.n + ' 맞음') : '') + '</p>';
  }
  function paint(){ var r = document.getElementById("pzres"); if (r) r.innerHTML = result(); bindRes(); var b = document.getElementById("pzbar"); if (b) b.innerHTML = barH(); }
  var RUN = 0;
  function calc(){
    var my = ++RUN;
    series().then(function(A){
      if (my !== RUN) return;
      if (!A){ ST.last = {err: "일봉을 못 받은 자산이 있어요. 잠시 뒤 다시 열어 주세요."}; paint(); return; }
      var R = null; try { R = runAll(A); } catch(x) { console.warn(x); }
      if (ST.last && ST.last.R && ST.last.R.m) ST.prev = ST.last.R.m;
      ST.last = R && R.m ? {R: R} : {err: "같이 거래된 날이 너무 적어 계산할 수 없어요(상장이 늦은 종목일 때)."};
      paint();
      verify().then(function(v){ if (v && my === RUN) paint(); });
    });
  }
  var MY = null;
  function draw(box){
    if (!box) return;
    if (!IDX){ box.innerHTML = '<div class="loading">포트 설계기 자료 불러오는 중…</div>'; idx().then(function(){ draw(document.getElementById(box.id)); }); return; }
    if (!ETF.every(function(k){ return IDX.assets[k]; })){ box.innerHTML = '<div class="sec">🎛 포트 설계기</div><section class="card"><div class="empty">20년 치 일봉 자료 준비 중 — 상품 작업이 한 번 돈 뒤 채워져요.</div></section>'; return; }
    box.innerHTML = '<div class="sec">🎛 포트 설계기 <small class="mut">비중을 밀면 2008년부터 다시 계산 · 휴대폰에만 저장</small></div><section class="card pz">' +
      '<p class="pz-sub">💼 기본 포트 규칙 그대로(200일선 방어 · 변동성 맞춤 · 달마다 맞춤 · 비용 0.1%) 비중만 내 맘대로 — 2008년 폭락까지 다 넣어 매일 굴린 셈이에요.</p>' + head(MY) +
      '<div class="pz-res" id="pzres">' + result() + '</div>' +
      '<p class="note" style="margin:8px 0 0">과거 계산이고 미래를 보장하지 않아요 · 배당 포함 ETF 값(SPY·QQQ·GLD·BIL) · 세금·환전 비용은 빼지 않음 · 사라는 뜻이 아니에요.</p></section>';
    bind(box);
    if (!ST.last) calc(); else bindRes();
    if (window.__pdzFocus){ window.__pdzFocus = 0; setTimeout(function(){ box.scrollIntoView({block: "start", behavior: "smooth"}); }, 120); }
  }
  function bindRes(){
    [].forEach.call(document.querySelectorAll(".pz-yr>div"), function(d){ d.onclick = function(ev){ ev.stopPropagation(); if (window.P && P.toast) P.toast(d.title); }; });
  }
  function bind(box){
    [].forEach.call(box.querySelectorAll("input[data-pz]"), function(x){
      var k = x.getAttribute("data-pz");
      var sync = function(){ var v = +x.value, o = 0; ["SPY", "QQQ", "GLD"].forEach(function(j){ if (j !== k) o += ST.w[j]; });
        if (v + o > 100){ v = 100 - o; x.value = v; } ST.w[k] = v; var t = document.getElementById("pzv" + k); if (t) t.textContent = v + "%"; var b = document.getElementById("pzbar"); if (b) b.innerHTML = barH(); };
      x.oninput = sync; x.onchange = function(){ sync(); keep(); calc(); };
      x.addEventListener("click", function(ev){ ev.stopPropagation(); });
    });
    [].forEach.call(box.querySelectorAll("[data-pre]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var p = b.getAttribute("data-pre");
      ST.w = p === "base" ? {SPY: 47.5, QQQ: 47.5, GLD: 5} : p === "spy" ? {SPY: 100, QQQ: 0, GLD: 0} : p === "6040" ? {SPY: 60, QQQ: 0, GLD: 20} : {SPY: MY.spx, QQQ: MY.ndx, GLD: MY.gold};
      if (p === "base"){ ST.reg = 1; ST.vol = 1; }
      keep(); draw(box); calc(); }; });
    [].forEach.call(box.querySelectorAll("[data-tg]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var k = b.getAttribute("data-tg"); ST[k] = ST[k] ? 0 : 1;
      b.classList.toggle("on", !!ST[k]); b.querySelector("b").textContent = ST[k] ? "켬" : "끔"; keep(); calc(); }; });
    [].forEach.call(box.querySelectorAll("[data-stk]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var n = b.getAttribute("data-stk"); ST.st = ST.st === n ? "" : n; keep(); draw(box); calc(); }; });
    var sw = document.getElementById("pzstw");
    if (sw){ sw.oninput = function(){ ST.stw = +sw.value; document.getElementById("pzstv").textContent = ST.stw + "%"; var b = document.getElementById("pzbar"); if (b) b.innerHTML = barH(); };
      sw.onchange = function(){ sw.oninput(); keep(); if (ST.st) calc(); }; sw.addEventListener("click", function(ev){ ev.stopPropagation(); }); }
    [].forEach.call(box.querySelectorAll("details.pz-st summary"), function(s){ s.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
  }
  window.portDesign = function(box, my){ MY = my && (my.spx + my.ndx + my.gold) > 0 ? my : null; draw(box); };
  // ⚖️ A10/21-3 세 갈래 길이 같은 엔진을 씀: 💼 기본 규칙 n년 굴림 분포
  window.__pdz = {
    ready: function(){ return idx().then(function(){ return Promise.all(ETF.map(px)); }).then(function(ss){ return ss.every(Boolean) ? align({SPY: ss[0], QQQ: ss[1], GLD: ss[2], BIL: ss[3]}) : null; }); },
    engine: engine, wts: function(){ var w = wts(); return w.X ? null : w; }, cfg: function(){ return {reg: ST.reg, vol: ST.vol, w: ST.w, st: ST.st}; }
  };

  /* 📄 종목 화면: 「💼 이 종목 5% 넣어 보면」 */
  var CODE = {"005930": "삼성전자", "000660": "SK하이닉스", "005380": "현대차", "015760": "한국전력", "NVDA": "엔비디아", "AAPL": "애플", "AVGO": "브로드컴", "AMD": "AMD", "MU": "마이크론", "INTC": "인텔", "TSLA": "테슬라", "PLTR": "팔란티어"};
  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){
    return OLD(sym).then(function(h){
      var n = CODE[String(sym || "").split(".")[0].toUpperCase()];
      if (n) setTimeout(function(){ var el = document.getElementById("opsig"); if (!el || el.querySelector(".pz-go")) return;
        var b = document.createElement("button"); b.className = "pz-go"; b.type = "button";
        b.innerHTML = '💼 이 종목 5% 넣어 보면 <small>포트 설계기 · 2008년부터 다시 계산 ›</small>';
        b.onclick = function(ev){ ev.stopPropagation(); ST.st = n; ST.stw = 5; ST.last = null; keep(); window.__pdzFocus = 1; if (window.go) go("port"); };
        el.appendChild(b); }, 80);
      return h;
    });
  };

  var css = document.createElement("style");
  css.textContent =
    ".pz-sub{margin:-2px 0 8px;font-size:12px;color:var(--sub)}.pz-pre{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px}" +
    ".pz-pre button,.pz-sc button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-sc{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.pz-sc button small{margin-left:3px;font-size:10px;color:var(--sub)}.pz-sc button.on{background:#d55181;color:#fff;border-color:transparent;font-weight:700}.pz-sc button.on small{color:#fde}" +
    ".pz-sl{display:flex;align-items:center;gap:10px;margin:2px 0;font-size:13px}.pz-sl span{min-width:118px;display:flex;align-items:center;gap:5px}.pz-sl span i{width:9px;height:9px;border-radius:2px;display:inline-block}.pz-sl input{flex:1;accent-color:#e9c46a;height:30px}" +
    ".pz-bar{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:1px;margin:6px 0 3px}.pz-lg{font-size:11.5px;color:var(--sub)}" +
    ".pz-tg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0 4px}.pz-tg button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:10px;padding:8px 6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-tg button b{display:block;font-size:12px}.pz-tg button.on{border-color:#e9c46a;color:var(--text);background:color-mix(in srgb,#e9c46a 14%,var(--panel2))}.pz-tg button.on b{color:#e9c46a}" +
    ".pz-st{margin:8px 0 0;font-size:13px}.pz-st summary{cursor:pointer;color:var(--sub)}.pz-st summary b{color:var(--text)}" +
    ".pz-res{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".pz-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.pz-big>div{background:var(--panel2);border-radius:10px;padding:8px 6px;text-align:center}.pz-big small,.pz-big em{display:block;font-size:11px;color:var(--sub);font-style:normal}" +
    ".pz-big b{display:block;font-size:22px;font-variant-numeric:tabular-nums;margin:1px 0}.pz-big b.up,.pz-in b.up,.pz-dl b.up{color:var(--up)}.pz-big b.dn,.pz-in b.dn,.pz-dl b.dn{color:var(--down)}" +
    ".pz-dl{font-size:12px;color:var(--sub);margin:6px 0 0}.pz-won{margin:10px 0 2px;font-size:14px}.pz-won b{font-size:17px}.pz-won small{display:block;font-size:11.5px;color:var(--sub)}" +
    ".pz-cv{width:100%;height:auto;display:block;margin:4px 0 0}.pz-gl{stroke:var(--line);stroke-width:1}.pz-gt{fill:var(--sub);font-size:9.5px}.pz-ls{fill:none;stroke:#7c9cff;stroke-width:1.4;stroke-dasharray:3 2;opacity:.85}.pz-lm{fill:none;stroke:#e9c46a;stroke-width:2.2}.pz-dm{fill:#e9c46a}" +
    ".pz-key{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11px;color:var(--sub);margin:2px 0 8px}.pz-key i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:4px;vertical-align:middle}.pz-key i.m{background:#e9c46a}.pz-key i.s{background:#7c9cff}" +
    ".pz-in{font-size:13px;padding:7px 9px;border-radius:9px;background:var(--panel2);margin:5px 0}.pz-in small{display:block;font-size:11.5px;color:var(--sub);margin-top:1px}" +
    ".pz-yr{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:3px;margin-top:8px}.pz-yr>div{border-radius:6px;padding:3px 0;text-align:center;cursor:pointer}.pz-yr small{display:block;font-size:9.5px;color:var(--sub)}.pz-yr b{font-size:12px;font-variant-numeric:tabular-nums}" +
    ".pz-ms{margin:8px 0 0;font-size:11px}.pz-ok{color:#3fb950}" +
    ".pz-go{display:block;width:100%;text-align:left;margin:8px 0 0;border:1px dashed #e9c46a;background:color-mix(in srgb,#e9c46a 10%,var(--panel));color:var(--text);border-radius:10px;padding:9px 11px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}.pz-go small{display:block;font-weight:400;font-size:11.5px;color:var(--sub)}";
  document.head.appendChild(css);
})();
