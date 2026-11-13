/* 🎛 포트 설계기 — 10/21 A10/21-1 (사용자 「다 좋다 다 진행해」)
   💼 포트 탭: S&P·나스닥·금 막대를 손가락으로 밀면(나머지는 현금·단기채) 2008년부터 매일 굴린 셈으로
   연 수익·최대 낙폭·최악의 해·「1,000만원 → ○○만원」 곡선이 휴대폰에서 바로 다시 계산됨.
   토글 두 개 = 💼 기본 규칙 그대로(🛡 S&P 200일선 아래면 주식 줄이기 · 📉 20일 변동성 맞춤 목표 15%) → 끄고 켤 때 보험값이 숫자 두 개로.
   종목 하나를 0~20% 섞어 볼 수 있음(일봉 있는 18개 · 종목 화면 「💼 이 종목 5% 넣어 보면」 단추가 여기로).
   자료: archive/x/port_px/(SPY·QQQ·GLD·BIL 배당 포함 수정종가, port_px.py 가 7일마다) · 종목은 archive/x/els_px(종가)
   검사: port_px/check.json(파이썬이 같은 자료·같은 규칙으로 낸 값)과 이 엔진 값이 같아야 「✓ 파이썬과 같음」.
   원칙: 과거 계산 · 미래 보장 아님 · 사라는 말 없음 · 위 곡선은 세전 — 11/05 🧾 세금 칸(달러 직투 양도세 vs 국내 ETF 배당소득세·금융종합과세)에서 뗀 값을 따로 보임. */
(function(){
  var ETF = ["SPY", "QQQ", "GLD", "BIL"], PX = {}, IDX = null, IDXW = null, EIDX = null, CHK = null, CHKOK = null;
  // 11/03 사용자 「거치식과 적립식을 구분 · 적립식이면 한 달에 얼마·며칠에 넣는지로 계산 · 거치식 누르면 적립식 칸은 닫히게」
  //   mode: lump(거치식) | dca(적립식) · dm 매달 넣는 돈(만원) · dd 매월 며칠(1~28, 31 = 말일) · d0 처음에 한 번(만원, 선택)
  var ST = {w: {SPY: 47.5, QQQ: 47.5, GLD: 5}, reg: 1, vol: 1, st: "", stw: 5, from: "", prev: null, last: null, ms: 0, pn: null, mode: "lump", dm: 100, dd: 1, d0: 0,
    tx: "gen", brg: 26.4, brb: 44, of: 2000, txo: 1};   // 🧾 11/05 세금: tx 탭(gen 일반 | big 금융소득종합과세 대상자) · brg/brb 종합소득 세율(지방세 포함 %) · of 다른 금융소득(만원/년) · txo 펼침
  var KEEP = ["w", "reg", "vol", "st", "stw", "from", "mode", "dm", "dd", "d0", "tx", "brg", "brb", "of", "txo"];
  try { var sv = JSON.parse(localStorage.getItem("pdz") || "null"); if (sv && sv.w) KEEP.forEach(function(k){ if (sv[k] !== undefined) ST[k] = sv[k]; }); } catch(x) {}
  function keep(){ try { var o = {}; KEEP.forEach(function(k){ o[k] = ST[k]; }); localStorage.setItem("pdz", JSON.stringify(o)); } catch(x) {} }
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
    i0 = Math.max(i0, 201); if (i0 >= n - 5) return null;   // 10/21 사용자 「날짜를 직접 넣어서」 — 짧은 기간도
    var W = null, lastEq = 0, nav = 1, NV = new Float64Array(n - i0), sp = new Float64Array(n - i0), spv = 1, turn = 0, expo = 0, WY = {};   // WY: 해마다 자산별 평균 비중(🧾 세금 — 분배금 계산용)
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
      var yk = String(new Date(D[t] * 864e5).getUTCFullYear()), wy = WY[yk] || (WY[yk] = {n: 0});
      wy.n++; for (var k4 in W) wy[k4] = (wy[k4] || 0) + W[k4];
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
    var full = Object.keys(Y).filter(function(y){ return Y[y][2] >= 120; });
    var tot = (nav - 1) * 100, sptot = (spv - 1) * 100;   // 반년 넘게 굴린 해만 (2008 은 3월부터라 넣음)
    var worst = full.sort(function(a, b){ return Y[a][0] - Y[b][0]; })[0];
    return {from: day2s(D[i0]), to: day2s(D[n - 1]), yrs: yrs, tot: tot, sptot: sptot, cagr: (Math.pow(nav, 1 / yrs) - 1) * 100, mdd: mdd * 100, mddAt: day2s(D[i0 + mddAt]), end: nav,
      sp_cagr: (Math.pow(spv, 1 / yrs) - 1) * 100, sp_mdd: smdd * 100, sp_end: spv, worst: worst, Y: Y, nv: NV, sp: sp, D: D, i0: i0, expo: expo / NV.length * 100, turn: turn / yrs * 100, WY: WY};
  }
  /* 💵 적립식 — 설계한 포트(매일 굴린 값 nv)와 S&P(sp)를 「매월 dd일(그날이 쉬면 다음 거래일 · 그달에 그날이 없으면 그달 마지막 거래일) 종가」에 dm 만원씩 산 셈 */
  function dcaCalc(r){
    var N = r.nv.length, m = (ST.dm || 0) * 1e4, z = (ST.d0 || 0) * 1e4, dd = ST.dd || 1;
    var un = 0, us = 0, inv = 0, cnt = 0, V = new Float64Array(N), S = new Float64Array(N), I = new Float64Array(N), flows = [], sflows = [];
    var buy = function(u, a){ if (!(a > 0)) return; un += a / r.nv[u]; us += a / r.sp[u]; inv += a; flows.push([r.D[r.i0 + u], -a]); };
    if (z > 0) buy(0, z);
    var curM = null, did = false, lastU = -1;
    for (var u = 0; u < N; u++){
      var ds = day2s(r.D[r.i0 + u]), mo = ds.slice(0, 7), dom = +ds.slice(8, 10);
      if (mo !== curM){
        if (curM && !did && lastU >= 0 && m > 0){ buy(lastU, m); cnt++; for (var b = lastU; b < u; b++){ V[b] = un * r.nv[b]; S[b] = us * r.sp[b]; I[b] = inv; } }   // 그달에 그날이 없었으면 마지막 거래일에
        curM = mo; did = false;
      }
      if (!did && dom >= dd && m > 0){ buy(u, m); cnt++; did = true; }
      lastU = u; V[u] = un * r.nv[u]; S[u] = us * r.sp[u]; I[u] = inv;
    }
    if (!inv) return null;
    var endV = un * r.nv[N - 1], endS = us * r.sp[N - 1], tEnd = r.D[r.i0 + N - 1];
    // 돈을 넣은 때를 감안한 연 수익(내부수익률) — 반으로 나눠 찾기
    var irr = function(endVal){ var f = function(y){ var s = endVal; flows.forEach(function(x){ s += x[1] * Math.pow(1 + y, (tEnd - x[0]) / 365.25); }); return s; };
      var lo = -0.95, hi = 3; if (f(lo) * f(hi) > 0) return null; for (var k = 0; k < 80; k++){ var md = (lo + hi) / 2; if (f(lo) * f(md) <= 0) hi = md; else lo = md; } return (lo + hi) / 2 * 100; };
    var yrs = (tEnd - flows[0][0]) / 365.25;
    return {inv: inv, cnt: cnt, end: endV, sEnd: endS, ret: (endV / inv - 1) * 100, sRet: (endS / inv - 1) * 100, irr: yrs >= 1 ? irr(endV) : null, sIrr: yrs >= 1 ? irr(endS) : null, V: V, S: S, I: I, first: day2s(flows[0][0])};
  }
  function dcaCurve(r, c){
    var W = 340, H = 140, P = 4, N = c.V.length, step = Math.max(1, Math.floor(N / 170)), hi = 0;
    for (var i = 0; i < N; i++) hi = Math.max(hi, c.V[i], c.S[i], c.I[i]);
    var X = function(i){ return P + (W - 2 * P - 40) * i / (N - 1); }, Yf = function(v){ return H - 16 - (H - 26) * v / (hi || 1); };
    var path = function(arr){ var s2 = ""; for (var i = 0; i < N; i += step) s2 += (s2 ? "L" : "M") + X(i).toFixed(1) + "," + Yf(arr[i]).toFixed(1); return s2 + "L" + X(N - 1).toFixed(1) + "," + Yf(arr[N - 1]).toFixed(1); };
    var g = ""; [0.25, 0.5, 0.75, 1].forEach(function(f){ var v = hi * f, y = Yf(v).toFixed(1); g += '<line x1="' + P + '" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" class="pz-gl"/><text x="' + (W - 38) + '" y="' + (+y + 3) + '" class="pz-gt">' + won(v) + '</text>'; });
    var yt = "", lastY = null, ystep = r.yrs > 12 ? 4 : r.yrs > 6 ? 2 : 1;
    for (var j = 0; j < N; j++){ var yy = day2s(r.D[r.i0 + j]).slice(0, 4); if (r.yrs >= 2 && yy !== lastY && +yy % ystep === 0 && j > 20) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + yy + '</text>'; lastY = yy; }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pz-cv" role="img" aria-label="적립식 넣은 돈과 평가금">' + g + yt +
      '<path d="' + path(c.I) + '" class="pz-li"/><path d="' + path(c.S) + '" class="pz-ls"/><path d="' + path(c.V) + '" class="pz-lm"/></svg>' +
      '<div class="pz-key"><span><i class="m"></i>설계한 포트 평가금</span><span><i class="s"></i>S&P500에 같은 날 넣었다면</span><span><i class="i"></i>넣은 돈 합계</span></div>';
  }
  function dcaH(r){
    var c = dcaCalc(r);
    if (!c) return '<div class="empty">매달 넣을 돈을 적어 주세요.</div>';
    var pf = c.end - c.inv, sp = c.sEnd - c.inv, ddL = ST.dd >= 31 ? "말일" : ST.dd + "일";
    return '<div class="pz-dca"><div class="pz-dcah">💵 적립식 · 매달 ' + won(ST.dm * 1e4) + '원 · 매월 ' + ddL + (ST.d0 > 0 ? ' · 처음 ' + won(ST.d0 * 1e4) + '원' : '') + ' <span class="mut">' + c.first.replace(/-/g, ".") + '부터 ' + c.cnt + '번 넣음</span></div>' +
      '<div class="pz-big"><div><small>넣은 돈</small><b>' + won(c.inv) + '</b><em>' + c.cnt + '번' + (ST.d0 > 0 ? ' + 처음 한 번' : '') + '</em></div>' +
        '<div><small>지금 평가금</small><b class="' + cl(pf) + '">' + won(c.end) + '</b><em>' + (pf >= 0 ? '+' : '−') + won(Math.abs(pf)) + '원</em></div>' +
        '<div><small>수익률</small><b class="' + cl(c.ret) + '">' + sg(c.ret, 1) + '%</b><em>' + (c.irr != null ? '연 ' + sg(c.irr, 1) + '%' : '1년 안 됨') + '</em></div></div>' +
      '<div class="pz-won">📈 S&P500에 같은 날 같은 돈을 넣었다면 <b>' + won(c.sEnd) + '원</b> <small>수익률 ' + sg(c.sRet, 1) + '%' + (c.sIrr != null ? ' · 연 ' + sg(c.sIrr, 1) + '%' : '') + ' · 설계한 포트가 ' + (c.end >= c.sEnd ? '앞섬 +' : '뒤짐 −') + won(Math.abs(c.end - c.sEnd)) + '원</small></div>' +
      dcaCurve(r, c) +
      '<p class="note" style="margin:2px 0 6px">연 % = 돈을 넣은 때를 감안한 연평균 수익(내부수익률) · 매월 그날 종가에 삼(쉬는 날이면 다음 거래일, 그달에 그날이 없으면 마지막 거래일) </p></div>';
  }

  /* 🧾 11/05 세금 뗀 실제 수익 (사용자 「원화로 달러 사서 미국을 사면 세금이 나오잖아 — 양도세가 얼마라서 실제 수익률이 얼마다 ·
     금융종합소득세 과세 대상자 탭을 만들어서 국내에서 ETF로 샀을 때 세금 얼마고 실제 수익률이 얼마다」)
     같은 포트를 ① 💵 원화 → 달러로 바꿔 미국 ETF 직접(SPY·QQQ·GLD·BIL) ② 🇰🇷 국내 상장 같은 지수 ETF(환노출)로 산 셈.
     · 💵 직투: 미국 배당 15% 원천징수(해마다) · 팔 때 (원화 기준 차익 − 연 250만원) × 22% 분리과세 · 환전 0.1%씩(우대 가정)
     · 🇰🇷 국내 ETF: 분배금·매매차익 = 배당소득 15.4% · 그해 금융소득(이자·배당)이 2천만원 넘는 몫은 종합과세(고른 세율, 15.4%보다 낮으면 15.4%)
     · 직투 배당도 금융소득 → 대상자면 2천만 넘는 몫은 고른 세율(외국납부 15% 공제 → 최소 15%)
     · 원화 값 = 포트 값(달러) × 그날 원/달러(USDKRW.json) · 분배금 = 해마다 자산별 평균 비중 × 그해 분배금 수익률(div.json)
     근사: 끝에 한 번에 판 셈(달마다 맞추며 판 차익 과세는 미룬 셈) · 구간 세율 한 칸으로 · 보수·과표기준가 차이·건보료 빼지 않음 */
  var TXD = null, TXW = null;
  var BR = [[6.6, "1,400만↓"], [16.5, "5,000만↓"], [26.4, "8,800만↓"], [38.5, "1.5억↓"], [41.8, "3억↓"], [44, "5억↓"], [46.2, "10억↓"], [49.5, "10억↑"]];
  var DYF = {SPY: 1.8, QQQ: 0.7, GLD: 0, BIL: 1.5, X: 0};   // div.json 이 아직 없을 때만
  function txLoad(){
    if (!TXW) TXW = idx().then(function(){
      var dv = IDX.assets.DIV;
      return Promise.all([px("USDKRW"), dv ? getJSON("archive/x/port_px/div.json?" + String(dv.at || "").replace(/\D/g, ""), {ttl: 864e5}).catch(function(){ return null; }) : null]);
    }).then(function(x){ TXD = {fx: x[0], div: x[1] && x[1].y ? x[1].y : null}; return TXD; }).catch(function(){ TXD = {fx: null, div: null}; return TXD; });
    return TXW;
  }
  function fxOf(r){
    if (r.fxA) return r.fxA;
    var N = r.nv.length, a = new Float64Array(N), f = TXD && TXD.fx;
    if (!f){ for (var i = 0; i < N; i++) a[i] = 1; r.fxA = a; r.fxNo = 1; return a; }
    for (var u = 0, j = 0; u < N; u++){ var t = r.D[r.i0 + u]; while (j + 1 < f.d.length && f.d[j + 1] <= t) j++; a[u] = f.c[j]; }
    r.fxA = a; return a;
  }
  function dyOf(k, y){ var d = TXD && TXD.div && TXD.div[k]; return d && d[y] != null ? Math.max(0, d[y]) : DYF[k] || 0; }
  function flowsOf(r){   // [u, 원] — 거치식 = 첫날 한 번 · 적립식 = dcaCalc 와 같은 날
    var N = r.nv.length, out = [];
    if (ST.mode !== "dca"){ out.push([0, amt()]); return out; }
    var m = (ST.dm || 0) * 1e4, z = (ST.d0 || 0) * 1e4, dd = ST.dd || 1, curM = null, did = false, lastU = -1;
    if (z > 0) out.push([0, z]);
    for (var u = 0; u < N; u++){
      var ds = day2s(r.D[r.i0 + u]), mo = ds.slice(0, 7), dom = +ds.slice(8, 10);
      if (mo !== curM){ if (curM && !did && lastU >= 0 && m > 0) out.push([lastU, m]); curM = mo; did = false; }
      if (!did && dom >= dd && m > 0){ out.push([u, m]); did = true; }
      lastU = u;
    }
    out.sort(function(a, b){ return a[0] - b[0]; });
    return out;
  }
  function sim(r, kind, fl, br, other){
    var N = r.nv.length, fx = fxOf(r), fxc = kind === "us" ? 0.001 : 0, base = kind === "us" ? 0.15 : 0.154, hi = Math.max(br / 100, base);
    var B = Math.max(0, 2e7 - other), units = 0, up = 0, basis = 0, inv = 0, usdIn = 0, usdU = 0, divTax = 0, divTot = 0, divOver = 0, brem = B, fi = 0, yrOf = function(u){ return new Date(r.D[r.i0 + u] * 864e5).getUTCFullYear(); };
    for (var u = 0; u < N; u++){
      var U = r.nv[u] * fx[u];
      while (fi < fl.length && fl[fi][0] === u){ var a = fl[fi][1]; units += a * (1 - fxc) / U; up += a / U; basis += a; inv += a; usdIn += a / fx[u]; usdU += a / fx[u] / r.nv[u]; fi++; }
      var y = yrOf(u), endY = u === N - 1 || yrOf(u + 1) !== y;
      if (endY){
        var w = r.WY && r.WY[y], py = 0;
        if (w && w.n) for (var k in w) if (k !== "n") py += w[k] / w.n * dyOf(k === "X" ? "X" : k, String(y)) / 100;
        if (w) py *= Math.min(1, w.n / 252);
        brem = B;
        if (py > 0 && units > 0){
          var V = units * U, dv = V * py, inb = Math.min(dv, brem), t = inb * base + (dv - inb) * hi;
          brem -= inb; divOver += dv - inb; units *= 1 - t / V; basis += dv - t; divTax += t; divTot += dv;
        }
      }
    }
    var Ve = units * r.nv[N - 1] * fx[N - 1], pre = up * r.nv[N - 1] * fx[N - 1], o = {kind: kind, inv: inv, pre: pre, divTax: divTax, divTot: divTot, divOver: divOver};
    if (kind === "us"){
      var Vs = Ve * (1 - fxc); o.fxCost = inv * fxc + Ve * fxc; o.gain = Vs - basis; o.saleTax = Math.max(0, o.gain - 2.5e6) * 0.22; o.net = Vs - o.saleTax;
    } else {
      o.fxCost = 0; o.gain = Ve - basis; var g = Math.max(0, o.gain), inb2 = Math.min(g, brem); o.over = g - inb2; o.saleTax = inb2 * 0.154 + o.over * Math.max(br / 100, 0.154); o.net = Ve - o.saleTax;
    }
    o.tax = o.divTax + o.saleTax; o.ret = (o.net / inv - 1) * 100; o.preRet = (pre / inv - 1) * 100;
    o.usdRet = (usdU * r.nv[N - 1] / usdIn - 1) * 100; o.fx0 = inv / usdIn; o.fx1 = fx[N - 1];
    // 연 % — 거치식은 연평균, 적립식은 넣은 때를 감안한 내부수익률
    var tEnd = r.D[r.i0 + N - 1], yrs = (tEnd - r.D[r.i0 + fl[0][0]]) / 365.25;
    if (yrs >= 1){
      if (fl.length === 1) o.ann = (Math.pow(o.net / inv, 1 / yrs) - 1) * 100, o.preAnn = (Math.pow(pre / inv, 1 / yrs) - 1) * 100;
      else { var irr = function(end){ var f = function(q){ var s2 = end; fl.forEach(function(x){ s2 -= x[1] * Math.pow(1 + q, (tEnd - r.D[r.i0 + x[0]]) / 365.25); }); return s2; };
          var lo = -0.95, hi2 = 3; if (f(lo) * f(hi2) > 0) return null; for (var i = 0; i < 80; i++){ var md = (lo + hi2) / 2; if (f(lo) * f(md) <= 0) hi2 = md; else lo = md; } return (lo + hi2) / 2 * 100; };
        o.ann = irr(o.net); o.preAnn = irr(pre); }
    }
    return o;
  }
  function taxH(r){
    if (!TXD){ txLoad().then(function(){ var el = document.getElementById("pzres"); if (el && ST.last && ST.last.R){ el.innerHTML = result(); bindRes(); } }); return '<div class="pz-tx"><div class="loading">🧾 세금 계산 자료 불러오는 중…</div></div>'; }
    var big = ST.tx === "big", br = big ? ST.brb : ST.brg, other = big ? (ST.of || 0) * 1e4 : 0, fl = flowsOf(r);
    if (!fl.length) return "";
    var us = sim(r, "us", fl, br, other), kr = sim(r, "kr", fl, br, other), fx = fxOf(r), best = us.net >= kr.net ? us : kr, gap = Math.abs(us.net - kr.net);
    var nm = {us: "💵 달러로 직접", kr: "🇰🇷 국내 상장 ETF"}, sub = {us: "원화 → 달러 환전 후 SPY·QQQ·GLD·BIL", kr: "같은 지수 환노출 ETF(원화)"};
    var mx = Math.max(us.pre, kr.pre, us.inv) || 1;
    var bar = function(o){ var n = Math.max(0, o.net), t = o.tax, f = o.fxCost || 0;
      return '<div class="pz-txb"><i class="n" style="width:' + (n / mx * 100).toFixed(1) + '%"></i><i class="t" style="width:' + (t / mx * 100).toFixed(1) + '%"></i>' + (f > 0 ? '<i class="f" style="width:' + Math.max(0.6, f / mx * 100).toFixed(1) + '%"></i>' : '') + '<em style="left:' + (o.inv / mx * 100).toFixed(1) + '%"></em></div>'; };
    var card = function(o){
      var lost = o.preRet - o.ret, win = o === best && gap >= 1e4;
      return '<div class="pz-txc' + (win ? ' win' : '') + '"><div class="pz-txn">' + nm[o.kind] + (win ? ' <span class="pz-txw">👑 더 남음</span>' : '') + '<small>' + sub[o.kind] + '</small></div>' +
        '<div class="pz-txv"><small>세금 떼고 손에 쥐는 돈</small><b>' + won(o.net) + '원</b></div>' +
        '<div class="pz-txr"><span>실제 수익률</span><b class="' + cl(o.ret) + '">' + sg(o.ret, 1) + '%</b>' + (o.ann != null ? '<em>연 ' + sg(o.ann, 1) + '%</em>' : '<em>1년 안 됨</em>') + '</div>' +
        bar(o) +
        '<div class="pz-txl"><span>세전 수익</span><b class="' + cl(o.pre - o.inv) + '">' + (o.pre >= o.inv ? '+' : '−') + won(Math.abs(o.pre - o.inv)) + '</b></div>' +
        '<div class="pz-txl"><span>' + (o.kind === "us" ? '배당 세금(미국 15%' + (big && o.divOver > 0 ? '+종합' : '') + ')' : '분배금 세금(15.4%' + (big && o.divOver > 0 ? '+종합' : '') + ')') + '</span><b class="dn">−' + won(o.divTax) + '</b></div>' +
        '<div class="pz-txl"><span>' + (o.kind === "us" ? '양도세 22% <small>(250만 공제)</small>' : '매매차익 세금 ' + (o.over > 0 ? '<small>(15.4% + 종합 ' + Math.max(br, 15.4) + '%)</small>' : '15.4%')) + '</span><b class="dn">−' + won(o.saleTax) + '</b></div>' +
        (o.kind === "us" ? '<div class="pz-txl"><span>환전 비용 <small>(0.1%씩)</small></span><b class="dn">−' + won(o.fxCost) + '</b></div>' : '') +
        '<div class="pz-txl tot"><span>세금으로 깎인 수익</span><b class="dn">−' + Math.max(0, lost).toFixed(1) + '%p</b></div></div>';
    };
    var per = r.from.replace(/-/g, ".") + ' ~ ' + r.to.slice(2).replace(/-/g, "."), lump = fl.length === 1;
    var fxl = r.fxNo ? '<div class="pz-txx">⏳ 원/달러 일봉은 오늘 저녁 상품 작업 뒤 들어와요 — 지금은 환율이 그대로였던 셈</div>' :
      '<div class="pz-txu"><div><small>달러로는</small><b class="' + cl(us.usdRet) + '">' + sg(us.usdRet, 1) + '%</b></div><div class="op">×</div>' +
      '<div><small>' + (lump ? '환율 ' : '평균 산 환율 ') + Math.round(us.fx0).toLocaleString() + ' → ' + Math.round(us.fx1).toLocaleString() + '원</small><b class="' + cl(us.fx1 - us.fx0) + '">' + sg((us.fx1 / us.fx0 - 1) * 100, 1) + '%</b></div><div class="op">→</div>' +
      '<div><small>원화 세전</small><b class="' + cl(us.preRet) + '">' + sg(us.preRet, 1) + '%</b></div></div>';
    var warn = "";
    if (!big && kr.over > 0) warn = '<div class="pz-txx">⚠️ 국내 ETF는 판 해에 차익 ' + won(Math.max(0, kr.gain)) + '원이 금융소득으로 잡혀 2천만원 넘는 ' + won(kr.over) + '원은 종합과세(' + Math.max(br, 15.4) + '%) — 몇 해에 나눠 팔면 세금이 줄어요.</div>';
    if (big) warn = '<div class="pz-txx ok">💡 대상자는 국내 ETF 차익·분배금이 다른 소득과 합쳐 높은 세율을 맞지만, 해외 직투 양도세는 22% 분리과세라 종합과세에 안 섞여요' + (best.kind === "us" ? ' — 그래서 이 조건에선 직투가 유리' : '') + '. 연금저축·IRP·ISA에 담으면 과세를 미루거나 낮출 수 있어요.</div>';
    var chips = '<div class="pz-txk"><span>' + (big ? '내 종합소득 세율 <small>(지방세 포함 · 과세표준 구간)</small>' : '2천만원 넘을 때 적용할 내 세율 <small>(지방세 포함)</small>') + '</span><div>' +
      BR.map(function(b){ return '<button data-br="' + b[0] + '" class="' + (+br === b[0] ? "on" : "") + '">' + b[0] + '%<small>' + b[1] + '</small></button>'; }).join("") + '</div></div>' +
      (big ? '<label class="pz-txo">다른 금융소득(이자·배당) 연 <input type="number" inputmode="numeric" min="0" step="100" id="pztxof" value="' + (ST.of || 0) + '"> 만원 <small>2천만원 넘으면 이 포트 소득 전부 종합과세</small></label>' : '');
    var sumL = (lump ? won(us.inv) + '원 한 번에' : '적립식 ' + won(us.inv) + '원') + ' · ' + nm[best.kind].split(" ")[0] + ' ' + sg(best.ret, 1) + '%';
    return '<details class="pz-tx" id="pztx"' + (ST.txo ? ' open' : '') + '><summary><b>🧾 세금 떼면 실제 수익률</b><span>💵 직투 <b class="' + cl(us.ret) + '">' + sg(us.ret, 1) + '%</b> · 🇰🇷 국내 ETF <b class="' + cl(kr.ret) + '">' + sg(kr.ret, 1) + '%</b> <small>세전 ' + sg(us.preRet, 1) + '%</small></span></summary>' +
      '<div class="pz-txt"><button data-tx="gen" class="' + (!big ? "on" : "") + '">🙂 일반<small>금융소득 연 2천만원 이하</small></button><button data-tx="big" class="' + (big ? "on" : "") + '">💼 금융소득종합과세 대상자<small>이자·배당 연 2천만원 초과</small></button></div>' +
      chips +
      '<div class="pz-txp">📅 ' + per + ' · ' + (lump ? won(us.inv) + '원을 첫날 한 번에' : '넣은 돈 ' + won(us.inv) + '원 · ' + fl.length + '번') + '</div>' + fxl +
      '<div class="pz-txg">' + card(us) + card(kr) + '</div>' +
      '<div class="pz-txkey"><span><i class="n"></i>손에 쥐는 돈</span><span><i class="t"></i>세금</span><span><i class="f"></i>환전</span><span><i class="e"></i>넣은 돈</span></div>' +
      (gap >= 1e4 ? '<div class="pz-txwin">👑 이 조건이면 <b>' + nm[best.kind] + '</b>이 <b>' + won(gap) + '원</b> 더 남아요 <small>(' + (best === us ? '국내 ETF' : '달러 직투') + '보다 수익률 ' + Math.abs(us.ret - kr.ret).toFixed(1) + '%p)</small></div>' : '<div class="pz-txwin">두 방법 차이가 거의 없어요</div>') +
      warn +
      (ST.st ? '<p class="note" style="margin:4px 0 0">섞은 종목(' + e(lab(ST.st)) + ')도 같은 방식으로 셈(근사 · 배당 빠짐).</p>' : '') +
      '<p class="note pz-txnote">가정 · 💵 양도세 = (원화로 본 차익 − 연 250만원) × 22%, 끝에 한 번에 판 셈(달마다 맞추며 판 차익 과세는 미룬 셈) · 미국 배당 15% 원천징수 · 환전 우대 0.1%씩 · 🇰🇷 국내 상장 해외 ETF 매매차익·분배금은 배당소득 15.4%, 그해 금융소득 2천만원 넘는 몫은 종합과세(구간 세율 한 칸으로 근사) · 분배금 = 해마다 실제 분배금 수익률' + (TXD.div ? '' : '(자료 준비 중 — 평균값)') + ' · 보수·과표기준가 차이·건강보험료(금융소득 1천만원 넘으면 영향)는 빼지 않음 · 2026년 세법 기준, 바뀔 수 있음 · 세무 상담이 아니에요.</p></details>';
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
  var START0 = "2007-06-01";   // BIL(현금) 상장(2007-05-30) + 200일선 준비 → 실제 시작 2008-03 · 2008 폭락·2009 바닥을 다 넣음
  function first(A){ return A && A.D.length > 201 ? day2s(A.D[201]) : "2008-03-17"; }   // 200일선·변동성 준비가 끝난 첫날
  function startOf(A){ var f = first(A), last = A ? day2s(A.D[A.D.length - 6]) : "";
    if (!ST.from) return f;
    var p = PER[ST.from]; if (p){ var t = new Date(Date.now() + 9 * 3600e3); if (p === "ytd") return (t.getUTCFullYear()) + "-01-01" > f ? t.getUTCFullYear() + "-01-01" : f;
      t.setUTCMonth(t.getUTCMonth() - p); var d = t.toISOString().slice(0, 10); return d > f ? d : f; }
    var d2 = ST.from < f ? f : ST.from; return last && d2 > last ? last : d2; }
  var PER = {"10y": 120, "5y": 60, "3y": 36, "1y": 12, "6m": 6, "ytd": "ytd"};
  var LASTA = null;
  function runAll(A){
    LASTA = A;
    var START = startOf(A), w = wts(), o = {reg: ST.reg, vol: ST.vol, start: START};
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
      '<div class="pz-dt"><div class="pz-dth">📅 언제부터 <b id="pzfrom">' + e(ST.from && !PER[ST.from] ? ST.from.replace(/-/g, ".") : "") + '</b> <span class="mut">그날 종가에 샀다면 → 지금까지</span></div>' +
        '<div class="pz-dc">' + [["", "처음(2008.03)"], ["10y", "10년"], ["5y", "5년"], ["3y", "3년"], ["1y", "1년"], ["6m", "6개월"], ["ytd", "올해"]].map(function(x){ return '<button data-fr="' + x[0] + '" class="' + (ST.from === x[0] ? "on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>' +
        '<label class="pz-di">직접 <input type="date" id="pzdate" min="2008-03-17" max="' + new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + '" value="' + e(ST.from && !PER[ST.from] ? ST.from : "") + '"><small>주말·휴일이면 다음 거래일부터</small></label></div>' +
      '<div class="pz-md"><div class="pz-dth">💵 넣는 방식</div><div class="pz-dc"><button data-md="lump" class="' + (ST.mode !== "dca" ? "on" : "") + '">거치식 · 한 번에</button><button data-md="dca" class="' + (ST.mode === "dca" ? "on" : "") + '">적립식 · 매달</button></div>' +
        (ST.mode === "dca" ? '<div class="pz-dcf"><label>매달 <input type="number" inputmode="numeric" min="1" step="10" id="pzdm" value="' + (ST.dm || "") + '"> 만원</label>' +
          '<label>매월 <select id="pzdd">' + Array.apply(null, Array(28)).map(function(_, i){ return '<option value="' + (i + 1) + '"' + (+ST.dd === i + 1 ? " selected" : "") + '>' + (i + 1) + '일</option>'; }).join("") + '<option value="31"' + (+ST.dd >= 31 ? " selected" : "") + '>말일</option></select> 에 넣기</label>' +
          '<label>처음에 한 번 <input type="number" inputmode="numeric" min="0" step="100" id="pzd0" value="' + (ST.d0 || "") + '" placeholder="0"> 만원 <small>(선택)</small></label>' +
          '<small class="pz-dcn">시작은 위 「언제부터」 날짜 · 그날 종가에 사서 지금까지</small></div>' : '<small class="pz-dcn">시작 날짜에 ' + won(amt()) + '원을 한 번에 넣은 셈 (금액은 💼 내 포트 금액)</small>') + '</div>' +
      '<div class="pz-tg"><button data-tg="reg" class="' + (ST.reg ? "on" : "") + '">🛡 200일선 방어 <b>' + (ST.reg ? "켬" : "끔") + '</b></button><button data-tg="vol" class="' + (ST.vol ? "on" : "") + '">📉 변동성 맞춤 <b>' + (ST.vol ? "켬" : "끔") + '</b></button></div>' +
      '<details class="pz-st"' + (ST.st ? " open" : "") + '><summary>➕ 종목 하나 섞어 보기 ' + (ST.st ? '<b>' + e(lab(ST.st)) + ' ' + ST.stw + '%</b>' : '<span class="mut">(지금 없음)</span>') + '</summary>' +
        '<div class="pz-sc">' + stk.map(function(n){ var y = ((EIDX.assets[n] || {}).from || "").slice(0, 4); return '<button data-stk="' + e(n) + '" class="' + (ST.st === n ? "on" : "") + '">' + e(lab(n)) + (y > "2007" ? '<small>' + y + '~</small>' : '') + '</button>'; }).join("") + '</div>' +
        '<label class="pz-sl"><span>비중 <b id="pzstv">' + ST.stw + '%</b></span><input type="range" min="5" max="20" step="5" value="' + ST.stw + '" id="pzstw"></label>' +
        '<p class="note" style="margin:2px 0 0">종목은 다른 칸에서 비율대로 떼어 와요 · 방어 규칙 밖(그대로 둠) · 그 나라 통화 종가(배당 빠짐) · 상장이 늦으면 그때부터.</p></details>';
  }
  function curve(r, PN){
    var W = 340, H = 150, P = 4, N = r.nv.length, step = Math.max(1, Math.floor(N / 170)), lo = Infinity, hi = -Infinity;
    for (var i = 0; i < N; i++){ var a = Math.log(r.nv[i]), b = Math.log(r.sp[i]); if (a < lo) lo = a; if (b < lo) lo = b; if (a > hi) hi = a; if (b > hi) hi = b; }
    lo = Math.min(lo, 0); var X = function(i){ return P + (W - 2 * P - 40) * i / (N - 1); }, Yf = function(v){ return H - 16 - (H - 26) * (Math.log(v) - lo) / (hi - lo || 1); };
    var path = function(arr){ var s = ""; for (var i = 0; i < N; i += step) s += (s ? "L" : "M") + X(i).toFixed(1) + "," + Yf(arr[i]).toFixed(1); return s + "L" + X(N - 1).toFixed(1) + "," + Yf(arr[N - 1]).toFixed(1); };
    var span = hi - lo, g = "", mult = span > 0.9 ? [0.5, 1, 2, 3, 4, 6, 8, 12, 16] : span > 0.35 ? [0.6, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5] : [0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4];
    mult.forEach(function(m){ var lv = Math.log(m); if (lv < lo - 0.01 || lv > hi + 0.01) return; var y = Yf(m).toFixed(1);
      g += '<line x1="' + P + '" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" class="pz-gl"/><text x="' + (W - 38) + '" y="' + (+y + 3) + '" class="pz-gt">' + (span > 0.9 ? m + '배' : (m >= 1 ? '+' : '−') + Math.round(Math.abs(m - 1) * 100) + '%') + '</text>'; });
    var yt = "", lastY = null;
    var ystep = r.yrs > 12 ? 4 : r.yrs > 6 ? 2 : 1, lastM = null;
    for (var j = 0; j < N; j++){ var ds = day2s(r.D[r.i0 + j]), yy = ds.slice(0, 4), mm = ds.slice(0, 7);
      if (r.yrs >= 2){ if (yy !== lastY && +yy % ystep === 0 && j > 20) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + yy + '</text>'; }
      else if (mm !== lastM && j > 5 && (+ds.slice(5, 7)) % (r.yrs > 1 ? 3 : r.yrs > 0.4 ? 2 : 1) === 1) yt += '<text x="' + X(j).toFixed(1) + '" y="' + (H - 3) + '" class="pz-gt" text-anchor="middle">' + (+ds.slice(5, 7) === 1 ? yy.slice(2) + '.' : '') + (+ds.slice(5, 7)) + '월</text>';
      lastY = yy; lastM = mm; }
    var mi = r.D.indexOf ? -1 : -1;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pz-cv" role="img" aria-label="설계한 포트와 S&P500 곡선">' + g + yt +
      '<path d="' + path(r.sp) + '" class="pz-ls"/><path d="' + path(r.nv) + '" class="pz-lm"/>' +
      (PN && PN.alts ? PN.alts.map(function(a, k){ return a.path ? '<path d="' + path(a.path) + '" class="pz-pn pz-pn' + k + '"/>' : ''; }).join("") +
        '<circle cx="' + X(PN.s).toFixed(1) + '" cy="' + Yf(r.nv[PN.s]).toFixed(1) + '" r="4.5" class="pz-pnd"/><text x="' + Math.min(W - 70, Math.max(8, X(PN.s) - 10)).toFixed(1) + '" y="' + Math.max(10, Yf(r.nv[PN.s]) + 16).toFixed(1) + '" class="pz-pnt">😱 ' + PN.lab + '</text>' : '') +
      '<circle cx="' + X(N - 1).toFixed(1) + '" cy="' + Yf(r.nv[N - 1]).toFixed(1) + '" r="3" class="pz-dm"/></svg>' +
      '<div class="pz-key"><span><i class="m"></i>설계한 포트</span><span><i class="s"></i>S&P500(배당 포함, 그대로 들고 있기)</span>' + (PN && PN.alts ? '<span><i class="p"></i>😱 그날 팔았다면</span>' : '') + '<span class="mut">눈금은 배수(로그)</span></div>';
  }
  /* 😱 10/22 A10/22-1 패닉 비용 — S&P 가 고점에서 15% 넘게 빠진 구간마다 「가장 크게 빠진 날」 종가에 전부 팔고(현금·단기채 BIL)
     20·60·120거래일 뒤 다시 같은 비중으로 샀다면 지금 돈이 얼마 달라졌나 + 반대로 그날 투자금의 10% 를 더 넣었다면(그 돈은 원래 현금) */
  function panicEps(r){
    var sp = r.sp, N = sp.length, pk = sp[0], pki = 0, eps = [], cur = null;
    for (var u = 1; u < N; u++){
      if (sp[u] > pk){ if (cur && cur.dd <= -0.15) eps.push(cur); pk = sp[u]; pki = u; cur = null; continue; }
      var dd = sp[u] / pk - 1, r1 = sp[u] / sp[u - 1] - 1;
      if (!cur) cur = {dd: dd, worst: r1, s: u};
      if (dd < cur.dd) cur.dd = dd;
      if (r1 < cur.worst){ cur.worst = r1; cur.s = u; }
    }
    if (cur && cur.dd <= -0.15) eps.push(cur);
    return eps.filter(function(x){ return x.s + 20 < N; }).map(function(x){ var ds = day2s(r.D[r.i0 + x.s]); return {s: x.s, d: ds, dd: x.dd * 100, r1: x.worst * 100, lab: ds.slice(0, 7).replace("-", ".")}; });
  }
  function panicCalc(r, ep){
    var A = LASTA, bil = A && A.C.BIL; if (!bil) return null;
    var N = r.nv.length, s = ep.s, end = r.nv[N - 1], B = function(u){ return bil[r.i0 + u]; };
    var alts = [20, 60, 120].map(function(h){
      if (s + h >= N) return {h: h, na: 1};
      var k = (r.nv[s] / r.nv[s + h]) * (B(s + h) / B(s)), path = new Float64Array(N);
      for (var u = 0; u < N; u++) path[u] = u <= s ? r.nv[u] : u <= s + h ? r.nv[s] * B(u) / B(s) : r.nv[u] * k;
      return {h: h, path: path, end: end * k, back: day2s(r.D[r.i0 + s + h])};
    });
    var add = 1 - (r.nv[s] / end) * (B(N - 1) / B(s));   // 그날 가진 돈의 10% 를 포트에 더 넣은 것 − 현금으로 둔 것, 지금 돈 대비 (× 0.1 은 화면에서)
    return {s: s, lab: ep.lab, alts: alts, add: add, end: end};
  }
  function panicH(r){
    var eps = panicEps(r);
    if (!eps.length) return '<div class="pz-pnx" id="pzpanic"><div class="pz-pnh">😱 그날 겁먹고 팔았다면 <span class="mut">패닉 비용</span></div><p class="note" style="margin:4px 0 0">이 기간엔 S&P 가 고점에서 15% 넘게 빠진 적이 없어요 — 「처음(2008.03)」으로 보면 2008·2020·2022·2025 가 나와요.</p></div>';
    var sel = eps.filter(function(x){ return x.d === ST.pn; })[0] || eps[eps.length - 1], P = panicCalc(r, sel), A = amt();
    if (!P) return "";
    ST.pnObj = P;
    var rows = P.alts.map(function(a){
      if (a.na) return '<div class="pz-pnr"><span>' + a.h + '거래일 뒤 복귀</span><b class="mut">아직 그만큼 안 지남</b></div>';
      var dv = A * (a.end / P.end - 1), dp = (a.end / P.end - 1) * 100;
      return '<div class="pz-pnr"><span><i class="pz-pk pz-pk' + P.alts.indexOf(a) + '"></i>' + a.h + '거래일 뒤 ' + a.back.slice(2).replace(/-/g, ".") + ' 복귀</span><b class="' + cl(dv) + '">' + (dv >= 0 ? "+" : "−") + won(Math.abs(dv)) + '원</b><em>' + sg(dp, 1) + '%</em></div>'; });
    var ad = A * 0.1 * P.add;
    return '<div class="pz-pnx" id="pzpanic"><div class="pz-pnh">😱 그날 겁먹고 팔았다면 <span class="mut">패닉 비용 · 지금 돈 ' + won(A) + '원 기준</span></div>' +
      '<div class="pz-pnc">' + eps.map(function(x){ return '<button data-pn="' + x.d + '" class="' + (x === sel ? "on" : "") + '">' + x.lab + '<small>S&P ' + sg(x.r1, 1) + '%</small></button>'; }).join("") + '</div>' +
      '<p class="pz-pns"><b>' + sel.d.replace(/-/g, ".") + '</b> — S&P 고점에서 ' + sg(sel.dd, 0) + '% 빠진 구간 중 가장 크게 빠진 날(' + sg(sel.r1, 1) + '%). 그날 종가에 이 포트를 전부 팔고 현금(단기채)으로 있다가 다시 샀다면, 지금 ' + won(A) + '원이 그대로 들고 있던 것보다:</p>' +
      rows.join("") +
      '<div class="pz-pnr pz-pnb"><span>↔ 반대로 그날 가진 돈의 10% 를 더 넣었다면</span><b class="' + cl(ad) + '">' + (ad >= 0 ? "+" : "−") + won(Math.abs(ad)) + '원</b><em>현금으로 둔 것보다</em></div>' +
      '<p class="note" style="margin:4px 0 0">곡선의 점선 = 그날 팔았다면 · 이 포트 규칙(방어·변동성 맞춤) 그대로 · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p></div>';
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
      var sh = m.yrs < 1, dc = sh ? a.tot - m.tot : a.cagr - m.cagr, dm = a.mdd - m.mdd;   // 1년 안 = 기간 수익 차이
      out.push('<div class="pz-in"><b>' + t[1] + '</b> ' + (on ? '끄면' : '켜면') + (sh ? ' 기간 수익 ' : ' 연 ') + '<b class="' + cl(dc) + '">' + sg(dc, 1) + '%p</b> · 최대 낙폭 ' + sg(m.mdd, 0) + '% → <b class="' + (dm < -0.5 ? "dn" : dm > 0.5 ? "up" : "") + '">' + sg(a.mdd, 0) + '%</b>' +
        '<small>' + (on ? (dc > 0.1 && dm < -0.5 ? '= 이 보험값: ' + (sh ? '이 기간 ' : '해마다 ') + dc.toFixed(1) + '%p 내고 낙폭 ' + Math.abs(dm).toFixed(0) + '%p 덜 맞음' : dc <= 0.1 && dm < -0.5 ? '= 끄면 덜 벌고 더 맞음 — 공짜 보험' : '') : (dc < -0.1 && dm > 0.5 ? '= 켜면 ' + (sh ? '이 기간 ' : '해마다 ') + Math.abs(dc).toFixed(1) + '%p 내고 낙폭 ' + dm.toFixed(0) + '%p 덜 맞음' : dc >= -0.1 && dm > 0.5 ? '= 켜면 덜 맞고 더 벎 — 공짜 보험' : '')) + '</small></div>');
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
    ST.pnObj = null;
    if (!ST.last) return '<div class="loading">계산 중…</div>';
    if (ST.last.err) return '<div class="empty">' + e(ST.last.err) + '</div>';
    var R = ST.last.R, r = R.m, A = amt();
    var lng = r.yrs >= 1, wy = r.yrs >= 2 && r.worst && r.Y[r.worst];
    return (ST.mode === "dca" ? dcaH(r) + '<div class="pz-sel">📊 포트 자체 성적 <span class="mut">한 번에 넣었을 때 기준 · 적립식도 같은 포트를 사는 것</span></div>' : '') + '<div class="pz-per">📅 <b>' + r.from.replace(/-/g, ".") + '</b>부터 지금까지 <b class="' + cl(r.tot) + '">' + sg(r.tot, 1) + '%</b> <span>S&P ' + sg(r.sptot, 1) + '% · ' + (r.tot - r.sptot >= 0 ? '앞섬 ' : '뒤짐 ') + sg(r.tot - r.sptot, 1) + '%p</span></div>' +
      '<div class="pz-big">' + (lng ? '<div><small>연 수익</small><b class="' + cl(r.cagr) + '">' + sg(r.cagr, 1) + '%</b><em>S&P ' + sg(r.sp_cagr, 1) + '%</em></div>' : '<div><small>기간 수익</small><b class="' + cl(r.tot) + '">' + sg(r.tot, 1) + '%</b><em>S&P ' + sg(r.sptot, 1) + '%</em></div>') +
      '<div><small>최대 낙폭</small><b class="dn">' + sg(r.mdd, 0) + '%</b><em>' + r.mddAt.slice(0, 7).replace("-", ".") + ' · S&P ' + sg(r.sp_mdd, 0) + '%</em></div>' +
      (wy ? '<div><small>최악의 해</small><b class="' + cl(wy[0]) + '">' + sg(wy[0], 0) + '%</b><em>' + r.worst + (wy[2] < 240 ? '(일부)' : '') + ' · S&P ' + sg(wy[1], 0) + '%</em></div>' :
        '<div><small>S&P보다</small><b class="' + cl(r.tot - r.sptot) + '">' + sg(r.tot - r.sptot, 1) + '%p</b><em>같은 기간</em></div>') + '</div>' +
      delta(r, ST.prev) +
      (ST.mode === "dca" ? '' : '<div class="pz-won">💰 ' + won(A) + '원 → <b>' + won(A * r.end) + '원</b> <small>S&P 그대로였다면 ' + won(A * r.sp_end) + '원 · ' + r.from.slice(0, 7).replace("-", ".") + ' ~ ' + r.to.slice(2).replace(/-/g, ".") + ' (' + (r.yrs >= 1.5 ? r.yrs.toFixed(0) + '년' : Math.round(r.yrs * 12) + '개월') + ')</small></div>') +
      (function(){ try { return taxH(r); } catch(x) { console.warn(x); return ""; } })() +
      (function(){ var ph = ""; try { ph = panicH(r); } catch(x) { console.warn(x); } return curve(r, ST.pnObj) + insur(R) + ph; })() + yearsH(r) +
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
    box.innerHTML = '<div class="sec">🎛 포트 설계기 <small class="mut">비중·날짜를 바꾸면 그때부터 지금까지 다시 계산 · 휴대폰에만 저장</small></div><section class="card pz">' +
      '<p class="pz-sub">💼 기본 포트 규칙 그대로(200일선 방어 · 변동성 맞춤 · 달마다 맞춤 · 비용 0.1%) 비중과 시작 날짜는 내 맘대로 — 그날 종가에 사서 매일 굴린 셈이에요(처음 = 2008년 3월, 폭락까지 다 넣음).</p>' + head(MY) +
      '<div class="pz-res" id="pzres">' + result() + '</div>' +
      '<p class="note" style="margin:8px 0 0">과거 계산이고 미래를 보장하지 않아요 · 배당 포함 ETF 값(SPY·QQQ·GLD·BIL) · 세금·환전 비용은 🧾 세금 칸에서 따로 뗌 · 사라는 뜻이 아니에요.</p></section>';
    bind(box);
    if (!ST.last) calc(); else bindRes();
    if (window.__pdzFocus){ window.__pdzFocus = 0; setTimeout(function(){ box.scrollIntoView({block: "start", behavior: "smooth"}); }, 120); }
    if (window.__pdzPanic){ window.__pdzPanic = 0; var tries = 0, fp = function(){ var z = document.getElementById("podz"), p = document.getElementById("pzpanic"); if (z && z.classList.contains("cz-on")){ var hz = z.querySelector(".cz-h"); if (hz) hz.click(); else z.classList.remove("cz-on"); }   // calm.js 가 접어 둔 설계기 펼치기
      if (p && p.getBoundingClientRect().height) window.scrollTo({top: scrollY + p.getBoundingClientRect().top - 130, behavior: "smooth"}); else if (tries++ < 30) setTimeout(fp, 200); }; setTimeout(fp, 400); }
  }
  function bindRes(){
    [].forEach.call(document.querySelectorAll("#pzpanic [data-pn]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.pn = b.getAttribute("data-pn"); var r = document.getElementById("pzres"); if (r){ r.innerHTML = result(); bindRes(); } }; });
    var rr = function(){ var el = document.getElementById("pzres"); if (el){ el.innerHTML = result(); bindRes(); } };
    var tx = document.getElementById("pztx");
    if (tx){ tx.addEventListener("toggle", function(){ ST.txo = tx.open ? 1 : 0; keep(); });
      tx.querySelector("summary").addEventListener("click", function(ev){ ev.stopPropagation(); }); }
    [].forEach.call(document.querySelectorAll("#pztx [data-tx]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.tx = b.getAttribute("data-tx"); keep(); rr(); }; });
    [].forEach.call(document.querySelectorAll("#pztx [data-br]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST[ST.tx === "big" ? "brb" : "brg"] = +b.getAttribute("data-br"); keep(); rr(); }; });
    var of = document.getElementById("pztxof");
    if (of){ of.addEventListener("click", function(ev){ ev.stopPropagation(); });
      of.onchange = function(){ ST.of = Math.max(0, Math.round(+of.value || 0)); keep(); rr(); }; }
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
    [].forEach.call(box.querySelectorAll("[data-fr]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); ST.from = b.getAttribute("data-fr");
      [].forEach.call(box.querySelectorAll("[data-fr]"), function(x){ x.classList.toggle("on", x === b); }); var di = document.getElementById("pzdate"); if (di) di.value = ""; var f = document.getElementById("pzfrom"); if (f) f.textContent = ""; keep(); calc(); }; });
    var di = document.getElementById("pzdate");
    if (di){ di.addEventListener("click", function(ev){ ev.stopPropagation(); });
      di.onchange = function(){ var v = di.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return; ST.from = v;
        [].forEach.call(box.querySelectorAll("[data-fr]"), function(x){ x.classList.remove("on"); }); var f = document.getElementById("pzfrom"); if (f) f.textContent = v.replace(/-/g, "."); keep(); calc(); }; }
    [].forEach.call(box.querySelectorAll("details.pz-st summary"), function(s){ s.addEventListener("click", function(ev){ ev.stopPropagation(); }); });
    // 💵 넣는 방식 — 계산(엔진)은 그대로, 결과 칸만 다시 그림 · 거치식이면 적립식 칸은 닫힘
    [].forEach.call(box.querySelectorAll("[data-md]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var md = b.getAttribute("data-md"); if (ST.mode === md) return; ST.mode = md; keep(); draw(box); }; });
    var rp = function(){ var r = document.getElementById("pzres"); if (r){ r.innerHTML = result(); bindRes(); } };
    [["pzdm", "dm"], ["pzd0", "d0"], ["pzdd", "dd"]].forEach(function(q){ var el = document.getElementById(q[0]); if (!el) return;
      el.addEventListener("click", function(ev){ ev.stopPropagation(); });
      var f = function(){ var v = Math.max(0, Math.round(+el.value || 0)); if (q[1] === "dm" && !v) return; ST[q[1]] = q[1] === "dd" ? (v || 1) : v; keep(); rp(); };
      el.onchange = f; if (el.tagName === "INPUT") el.oninput = function(){ clearTimeout(el._t); el._t = setTimeout(f, 500); }; });
  }
  window.portDesign = function(box, my){ MY = my && (my.spx + my.ndx + my.gold) > 0 ? my : null; draw(box); };
  // ⚖️ A10/21-3 세 갈래 길이 같은 엔진을 씀: 💼 기본 규칙 n년 굴림 분포
  window.__pdz = {
    ready: function(){ return idx().then(function(){ return Promise.all(ETF.map(px)); }).then(function(ss){ return ss.every(Boolean) ? align({SPY: ss[0], QQQ: ss[1], GLD: ss[2], BIL: ss[3]}) : null; }); },
    panic: function(){ ST.from = ""; ST.last = null; keep(); window.__pdzFocus = 1; window.__pdzPanic = 1; },
    tax: {sim: sim, flowsOf: flowsOf, taxH: taxH, set: function(x){ TXD = x; TXW = Promise.resolve(x); }}, engine: engine, wts: function(){ var w = wts(); return w.X ? null : w; }, cfg: function(){ return {reg: ST.reg, vol: ST.vol, w: ST.w, st: ST.st}; }
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
    ".pz-sub{margin:-2px 0 8px;font-size:12.5px;color:var(--sub)}.pz-pre{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px}" +
    ".pz-pre button,.pz-sc button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-sc{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.pz-sc button small{margin-left:3px;font-size:12.5px;color:var(--sub)}.pz-sc button.on{background:#d55181;color:#fff;border-color:transparent;font-weight:700}.pz-sc button.on small{color:#fde}" +
    ".pz-sl{display:flex;align-items:center;gap:10px;margin:2px 0;font-size:13px}.pz-sl span{min-width:118px;display:flex;align-items:center;gap:5px}.pz-sl span i{width:9px;height:9px;border-radius:2px;display:inline-block}.pz-sl input{flex:1;accent-color:#e9c46a;height:30px}" +
    ".pz-bar{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:1px;margin:6px 0 3px}.pz-lg{font-size:12.5px;color:var(--sub)}" +
    ".pz-dt{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed var(--line)}.pz-dth{font-size:13px;font-weight:700}.pz-dth .mut{font-weight:400;font-size:12.5px}.pz-dth b{color:#e9c46a}" +
    ".pz-dc{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.pz-dc button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}.pz-dc button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:700}" +
    ".pz-di{display:flex;align-items:center;gap:8px;font-size:12.5px;flex-wrap:wrap}.pz-di input{font:inherit;font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.pz-di small{font-size:12.5px;color:var(--sub)}" +
    ".pz-per{font-size:14px;margin:0 0 8px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#e9c46a 12%,var(--panel2))}.pz-per b{font-variant-numeric:tabular-nums}.pz-per b.up{color:var(--up)}.pz-per b.dn{color:var(--down)}.pz-per span{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pz-tg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0 4px}.pz-tg button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:10px;padding:8px 6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".pz-tg button b{display:block;font-size:12.5px}.pz-tg button.on{border-color:#e9c46a;color:var(--text);background:color-mix(in srgb,#e9c46a 14%,var(--panel2))}.pz-tg button.on b{color:#e9c46a}" +
    ".pz-st{margin:8px 0 0;font-size:13px}.pz-st summary{cursor:pointer;color:var(--sub)}.pz-st summary b{color:var(--text)}" +
    ".pz-md{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed var(--line)}.pz-dcf{display:grid;gap:7px;margin:4px 0 2px;font-size:13.5px}.pz-dcf label{display:flex;align-items:center;gap:6px;flex-wrap:wrap}" +
    ".pz-dcf input,.pz-dcf select{font:inherit;font-size:16px;width:110px;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);color-scheme:light dark}.pz-dcf select{width:auto}.pz-dcf small,.pz-dcn{font-size:12.5px;color:var(--sub)}" +
    ".pz-dca .pz-big b{font-size:19px;white-space:nowrap}.pz-sel{font-size:14px;font-weight:800;margin:6px 0 6px;padding-top:8px;border-top:1px dashed var(--line)}.pz-sel .mut{font-weight:400;font-size:12.5px}.pz-dca{margin:0 0 10px}.pz-dcah{font-size:14px;font-weight:800;margin:0 0 6px}.pz-dcah .mut{display:block;font-weight:400;font-size:12.5px}.pz-li{fill:none;stroke:#8a94a8;stroke-width:1.4}.pz-key i.i{background:#8a94a8}" +
    ".pz-res{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}" +
    ".pz-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.pz-big>div{background:var(--panel2);border-radius:10px;padding:8px 6px;text-align:center}.pz-big small,.pz-big em{display:block;font-size:12.5px;color:var(--sub);font-style:normal}" +
    ".pz-big b{display:block;font-size:22px;font-variant-numeric:tabular-nums;margin:1px 0}.pz-big b.up,.pz-in b.up,.pz-dl b.up{color:var(--up)}.pz-big b.dn,.pz-in b.dn,.pz-dl b.dn{color:var(--down)}" +
    ".pz-dl{font-size:12.5px;color:var(--sub);margin:6px 0 0}.pz-won{margin:10px 0 2px;font-size:14px}.pz-won b{font-size:17px}.pz-won small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pz-cv{width:100%;height:auto;display:block;margin:4px 0 0}.pz-gl{stroke:var(--line);stroke-width:1}.pz-gt{fill:var(--sub);font-size:9.5px}.pz-ls{fill:none;stroke:#7c9cff;stroke-width:1.4;stroke-dasharray:3 2;opacity:.85}.pz-lm{fill:none;stroke:#e9c46a;stroke-width:2.2}.pz-dm{fill:#e9c46a}" +
    ".pz-key{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:2px 0 8px}.pz-key i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:4px;vertical-align:middle}.pz-key i.m{background:#e9c46a}.pz-key i.s{background:#7c9cff}" +
    ".pz-in{font-size:13px;padding:7px 9px;border-radius:9px;background:var(--panel2);margin:5px 0}.pz-in small{display:block;font-size:12.5px;color:var(--sub);margin-top:1px}" +
    ".pz-yr{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:3px;margin-top:8px}.pz-yr>div{border-radius:6px;padding:3px 0;text-align:center;cursor:pointer}.pz-yr small{display:block;font-size:12.5px;color:var(--sub)}.pz-yr b{font-size:12.5px;font-variant-numeric:tabular-nums}" +
    ".pz-ms{margin:8px 0 0;font-size:12.5px}.pz-ok{color:#3fb950}" +
    ".pz-pn{fill:none;stroke-width:1.3;stroke-dasharray:4 3}.pz-pn0{stroke:#ff8fa3}.pz-pn1{stroke:#c77dff}.pz-pn2{stroke:#8a94a8}.pz-pnd{fill:none;stroke:#ff6b6b;stroke-width:2}.pz-pnt{fill:#ff6b6b;font-size:10px;font-weight:700}" +
    ".pz-key i.p{background:repeating-linear-gradient(90deg,#ff8fa3 0 4px,transparent 4px 7px)}" +
    ".pz-pnx{margin:10px 0 4px;padding:10px;border-radius:12px;background:color-mix(in srgb,#ff6b6b 9%,var(--panel2))}.pz-pnh{font-size:14.5px;font-weight:800}.pz-pnh .mut{font-weight:400;font-size:12.5px}" +
    ".pz-pnc{display:flex;flex-wrap:wrap;gap:5px;margin:7px 0}.pz-pnc button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:4px 9px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;text-align:center}.pz-pnc button small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}.pz-pnc button.on{background:#ff6b6b;color:#fff;border-color:transparent}.pz-pnc button.on small{color:#ffe}" +
    ".pz-pns{font-size:12.5px;color:var(--sub);margin:2px 0 6px;word-break:keep-all}.pz-pns b{color:var(--text)}" +
    ".pz-pnr{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:baseline;padding:6px 0;border-top:1px solid var(--line);font-size:13px}.pz-pnr b{font-size:16px;font-variant-numeric:tabular-nums;white-space:nowrap}.pz-pnr b.up{color:var(--up)}.pz-pnr b.dn{color:var(--down)}.pz-pnr em{font-style:normal;font-size:12.5px;color:var(--sub);white-space:nowrap;min-width:46px;text-align:right}" +
    ".pz-pk{display:inline-block;width:12px;height:0;border-top:2px dashed;margin-right:5px;vertical-align:middle}.pz-pk0{color:#ff8fa3}.pz-pk1{color:#c77dff}.pz-pk2{color:#8a94a8}.pz-pnb{font-weight:700;grid-template-columns:auto 1fr}.pz-pnb span{grid-column:1/-1}.pz-pnb em{text-align:left}" +
    ".pz-tx{margin:12px 0 6px;padding:10px;border-radius:12px;background:color-mix(in srgb,#3fb950 7%,var(--panel2));border:1px solid color-mix(in srgb,#3fb950 25%,var(--line))}" +
    ".pz-tx>summary{cursor:pointer;list-style:none;display:flex;flex-direction:column;gap:2px}.pz-tx>summary::-webkit-details-marker{display:none}.pz-tx>summary>b{font-size:15px}.pz-tx>summary>b::after{content:' ›';color:var(--sub);font-weight:400}.pz-tx[open]>summary>b::after{content:' ⌄'}" +
    ".pz-tx>summary span{font-size:13px;color:var(--sub)}.pz-tx>summary span b{font-size:15px;font-variant-numeric:tabular-nums}.pz-tx b.up{color:var(--up)}.pz-tx b.dn{color:var(--down)}.pz-tx>summary small{font-size:12.5px;margin-left:4px}" +
    ".pz-txt{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0 8px}.pz-txt button{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:10px;padding:8px 6px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;word-break:keep-all}.pz-txt button small{display:block;font-weight:400;font-size:12px}" +
    ".pz-txt button.on{background:#3fb950;color:#fff;border-color:transparent}.pz-txt button.on small{color:#e8ffe9}" +
    ".pz-txk{font-size:12.5px;margin:0 0 6px}.pz-txk>span{display:block;color:var(--sub);margin-bottom:4px}.pz-txk>span small{font-size:12px}.pz-txk>div{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}" +
    ".pz-txk button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;padding:4px 2px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums}.pz-txk button small{display:block;font-weight:400;font-size:11.5px;color:var(--sub)}.pz-txk button.on{background:#e9c46a;color:#111;border-color:transparent}.pz-txk button.on small{color:#4a3d10}" +
    ".pz-txo{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;margin:6px 0}.pz-txo input{font:inherit;font-size:16px;width:96px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--text);color-scheme:light dark}.pz-txo small{width:100%;font-size:12px;color:var(--sub)}" +
    ".pz-txp{font-size:12.5px;color:var(--sub);margin:8px 0 4px}" +
    ".pz-txu{display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;gap:4px;background:var(--panel);border-radius:10px;padding:7px 6px;text-align:center;margin:0 0 8px}.pz-txu>div{min-width:0}.pz-txu small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all;line-height:1.3}.pz-txu b{font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.pz-txu .op{color:var(--sub);font-weight:700}" +
    ".pz-txg{display:grid;grid-template-columns:1fr 1fr;gap:6px}.pz-txc{background:var(--panel);border-radius:11px;padding:9px 8px;border:1.5px solid transparent;min-width:0}.pz-txc.win{border-color:#e9c46a}" +
    ".pz-txn{font-size:13.5px;font-weight:800;word-break:keep-all}.pz-txn small{display:block;font-weight:400;font-size:11.5px;color:var(--sub);margin-top:1px}.pz-txw{display:inline-block;font-size:11px;font-weight:700;background:#e9c46a;color:#111;border-radius:999px;padding:0 6px;vertical-align:1px}" +
    ".pz-txv{margin:7px 0 2px}.pz-txv small{display:block;font-size:11.5px;color:var(--sub)}.pz-txv b{font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".pz-txr{display:flex;align-items:baseline;gap:5px;flex-wrap:wrap;font-size:12px;color:var(--sub)}.pz-txr b{font-size:18px;font-variant-numeric:tabular-nums}.pz-txr em{font-style:normal}" +
    ".pz-txb{position:relative;display:flex;height:9px;border-radius:5px;overflow:hidden;background:color-mix(in srgb,var(--line) 60%,transparent);margin:7px 0 5px}.pz-txb i{display:block;height:100%}.pz-txb i.n,.pz-txkey i.n{background:#e9c46a}.pz-txb i.t,.pz-txkey i.t{background:#ff6b6b}.pz-txb i.f,.pz-txkey i.f{background:#8a94a8}" +
    ".pz-txb em{position:absolute;top:-1px;bottom:-1px;width:2px;background:var(--text);opacity:.7}.pz-txkey i.e{background:var(--text);width:2px!important;opacity:.7}" +
    ".pz-txl{display:flex;justify-content:space-between;gap:4px;font-size:12px;color:var(--sub);padding:2px 0;border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.pz-txl small{font-size:11px}.pz-txl b{font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--text)}.pz-txl b.up{color:var(--up)}.pz-txl b.dn{color:var(--down)}.pz-txl.tot{font-weight:700}" +
    ".pz-txkey{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;color:var(--sub);margin:6px 0 2px}.pz-txkey i{display:inline-block;width:12px;height:8px;border-radius:2px;margin-right:4px;vertical-align:middle}" +
    ".pz-txwin{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#e9c46a 16%,var(--panel));font-size:13.5px;word-break:keep-all}.pz-txwin small{display:block;font-size:12px;color:var(--sub)}" +
    ".pz-txx{margin:6px 0 0;padding:7px 9px;border-radius:9px;background:color-mix(in srgb,#ff6b6b 10%,var(--panel));font-size:12.5px;word-break:keep-all}.pz-txx.ok{background:color-mix(in srgb,#3fb950 10%,var(--panel))}.pz-txnote{margin:8px 0 0;font-size:12px;word-break:keep-all}" +
    "@media (max-width:370px){.pz-txg{grid-template-columns:1fr}.pz-txk>div{grid-template-columns:repeat(2,1fr)}}" +
    ".pz-go{display:block;width:100%;text-align:left;margin:8px 0 0;border:1px dashed #e9c46a;background:color-mix(in srgb,#e9c46a 10%,var(--panel));color:var(--text);border-radius:10px;padding:9px 11px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}.pz-go small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}";
  document.head.appendChild(css);
})();
