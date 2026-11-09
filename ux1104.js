/* 11/04 사용자 「둘 다 진행해」 — 📱 앱 아이디어 A11/4-1 · A11/4-2
   ① 🪜 금 가는 순서표 (A11/4-1) — 💼 포트 탭 🎛 설계기 위: 코스피200이 지금보다 더 빠지면 내 돈에서 「무엇이 먼저 깨지나」를 순서대로.
      📌 내 ELS(관제탑) 다음 평가 배리어·KI · 📦 담아 둔 펀드 −10% · 💼 설계기 포트 −10%·2008년 뒤 가장 깊은 낙폭 · 📝 제안서 주식·연금 폼 −10%.
      「같이 움직이는 크기」= 최근 1년 주간(5거래일) 등락으로 잰 코스피200 대비 비율(β) — 대략. 지금 위치는 KODEX200 10분 시세(live_px).
      막대를 끌면 그 깊이에서 깨진 것·대략 손실이 바로 바뀜.
   ② 🔢 숫자로 찾기 (A11/4-2) — 머리 🔍 에 「5%」「3년」「1000만원」「1년 +10%」를 치면 종목 대신 상품:
      채권(세전 매수금리) · ELS(조건 맞으면 연 쿠폰 · 청약 중) · 펀드(지난 1년) 를 위험 낮은 순으로 한 줄씩 → 「📲 크게 보기」 한 장 → 📨 그림으로 보내기.
      「1000만원」 → ⚖️ 세 갈래 길(💼 주문서 투자금과 같은 칸) · 「1년 +10%」 → 📝 주식·연금 폼 중 과거 1년 +10% 넘긴 비율 순.
   원칙: 과거 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」) · 사모(pv) 빼기. */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function pc(v, d){ return v == null || isNaN(v) ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function s2day(s){ return Date.parse(String(s).slice(0, 10) + "T00:00:00Z") / 864e5; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function won(v){ var m = v / 1e4, a = Math.abs(m); return a >= 1e4 ? (m / 1e4).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function ls(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(x) { return null; } }
  function J(u, t){ t = t || 600000; return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / t), {ttl: t}).catch(function(){ return null; }); }
  function stop(el){ el.addEventListener("click", function(ev){ ev.stopPropagation(); }); }

  /* ════════════ 공통: 날짜 맞추기 · 같이 움직이는 크기(β) ════════════ */
  function join(a, b){   // a, b: {d:[day], c:[close]} → 둘 다 있는 날
    var m = {}, D = [], A = [], B = []; for (var i = 0; i < b.d.length; i++) m[b.d[i]] = b.c[i];
    for (var j = 0; j < a.d.length; j++){ var v = m[a.d[j]]; if (v != null && a.c[j] > 0 && v > 0){ D.push(a.d[j]); A.push(a.c[j]); B.push(v); } }
    return {d: D, a: A, b: B};
  }
  // 최근 1년(약 260거래일) 겹치지 않는 5거래일 등락으로 β = cov(x, k) / var(k) · 끝에서부터 거꾸로 묶음
  function beta5(x, k){
    var n = x.length, rx = [], rk = [];
    for (var i = n - 1; i - 5 >= 0 && n - 1 - i < 260; i -= 5){ rx.push(x[i] / x[i - 5] - 1); rk.push(k[i] / k[i - 5] - 1); }
    var N = rx.length; if (N < 30) return null;
    var mx = 0, mk = 0; for (var j = 0; j < N; j++){ mx += rx[j]; mk += rk[j]; } mx /= N; mk /= N;
    var c = 0, v = 0, vx = 0; for (var q = 0; q < N; q++){ c += (rx[q] - mx) * (rk[q] - mk); v += (rk[q] - mk) * (rk[q] - mk); vx += (rx[q] - mx) * (rx[q] - mx); }
    return v > 0 ? {b: c / v, r: vx > 0 ? c / Math.sqrt(v * vx) : 0, n: N} : null;
  }
  var LABU = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LABU[n] || n; }

  /* ── 코스피200 기준선: 일봉(KODEX200 · els_px) + 지금(live_px 069500 10분 시세) ── */
  var KB = null, KBT = 0;
  function kbase(){
    if (KB && Date.now() - KBT < 300000) return KB;
    var EM = window.__elsMy; if (!EM) return Promise.resolve(null);
    KBT = Date.now();
    KB = EM.load().then(function(){ return Promise.all([EM.epx("KOSPI200"), J("archive/x/live_px.json", 300000), J("archive/x/els_px/index.json", 3600e3)]); }).then(function(r){
      var s = r[0]; if (!s || s.d.length < 300) return null;
      var d = Array.prototype.slice.call(s.d), c = Array.prototype.slice.call(s.c), lv = r[1], td = today(), tdd = s2day(td), live = null;
      var q = lv && lv.q && lv.q["069500"];
      if (lv && lv.date === td && q && q[0] > 0){
        if (d[d.length - 1] === tdd){ d.pop(); c.pop(); }   // 아침에 받아 둔 오늘 값은 버리고 지금 값으로
        d.push(tdd); c.push(+q[0]); live = {t: lv.t, chg: +q[1]};
      }
      var n = c.length, hi = 0, hiAt = n - 1; for (var i = Math.max(0, n - 20); i < n; i++) if (c[i] > hi){ hi = c[i]; hiAt = i; }
      var chg = live ? live.chg : (c[n - 1] / c[n - 2] - 1) * 100;
      return {d: d, c: c, now: c[n - 1], at: day2s(d[n - 1]), live: live, chg: chg, hi: hi, hiAt: day2s(d[hiAt]), dd: (c[n - 1] / hi - 1) * 100, idx: r[2], lvq: lv && lv.date === td ? lv.q : null};
    }).catch(function(x){ console.warn(x); return null; });
    return KB;
  }
  var BC = {};
  function betaOf(name, K, dn){   // ELS 기초자산 일봉(els_px) 기준 · dn = 기준 시장 이름
    if (name === dn) return Promise.resolve({b: 1, r: 1, n: 0});
    var key = dn + "|" + name; if (BC[key]) return BC[key];
    BC[key] = window.__elsMy.epx(name).then(function(s){ if (!s) return null; var j = join(s, K); return beta5(j.a, j.b); }).catch(function(){ return null; });
    return BC[key];
  }
  // 기준 시장: 🇰🇷 코스피200(지금 = KODEX200 10분 시세) · 🇺🇸 S&P500(마지막 종가)
  var DRV = {KOSPI200: {ic: "🇰🇷", nm: "코스피200", sh: "코스피"}, "S&P500": {ic: "🇺🇸", nm: "S&P500", sh: "S&P"}};
  function drvName(){ var v = null; try { v = localStorage.getItem("ldDrv"); } catch(x) {} return DRV[v] ? v : "KOSPI200"; }
  function dbase(dn){
    if (dn === "KOSPI200") return kbase();
    return kbase().then(function(K0){ return window.__elsMy.epx(dn).then(function(s){
      if (!s || s.d.length < 300) return null;
      var d = Array.prototype.slice.call(s.d), c = Array.prototype.slice.call(s.c), n = c.length, hi = 0, hiAt = n - 1;
      for (var i = Math.max(0, n - 20); i < n; i++) if (c[i] > hi){ hi = c[i]; hiAt = i; }
      return {d: d, c: c, now: c[n - 1], at: day2s(d[n - 1]), live: null, chg: (c[n - 1] / c[n - 2] - 1) * 100, hi: hi, hiAt: day2s(d[hiAt]), dd: (c[n - 1] / hi - 1) * 100, idx: K0 && K0.idx, lvq: K0 && K0.lvq, k200: K0};
    }); });
  }

  /* ════════════ ① 🪜 금 가는 순서표 ════════════ */
  var FT = {"주식형": 1, "주식혼합형": 0.5, "채권혼합형": 0.3};
  var FREG = [[/중국/, "HSCEI"], [/일본/, "NIKKEI225"], [/유럽/, "EUROSTOXX50"], [/정보기술|나스닥|기술/, "NASDAQ100"], [/북미|미국|글로벌주식|글로벌 공격|헬스케어|에너지|섹터|테마/, "S&P500"]];
  var LD = {busy: 0, sig: "", R: null, m: 0};
  var MAX = -30;
  function myEls(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function myFunds(){ var a = ls("xrFunds"); return Array.isArray(a) ? a : []; }

  function fundBeta(f, P, FH, K, dn){   // 돌려줌 {b, how} · {zero} · {na: 이유}
    if (!P) return Promise.resolve({na: "펀드 자료 없음"});
    var t = P.t || "", st = P.st || "";
    if (/채권형|MMF/.test(t) && !/혼합/.test(t)) return Promise.resolve({zero: 1, how: t});
    if (/^해외/.test(t)){
      if (!/주식/.test(t)) return Promise.resolve({na: t + " — 지수로 셀 수 없음"});
      var reg = FREG.filter(function(x){ return x[0].test(st); })[0]; if (!reg) return Promise.resolve({na: st + " — 비교할 지수 자료 없음"});
      var k = /혼합/.test(t) ? 0.5 : 1;
      return betaOf(reg[1], K, dn).then(function(B){ return B ? {b: B.b * k, how: lab(reg[1]) + "처럼" + (k < 1 ? " × 주식 몫 ½" : "")} : {na: "지수 자료 없음"}; });
    }
    var H = FH && FH.items && FH.items[P.c], eqS = null, how = "";
    if (H && H.h && H.h.length){
      var cov = 0, eq = 0; H.h.forEach(function(h){ cov += +h[1] || 0; if (h[2] === "주식") eq += +h[1] || 0; });
      if (cov >= 25){ eqS = eq / cov; how = "상위 보유 " + Math.round(cov) + "% 중 주식 " + Math.round(eqS * 100) + "%"; }
    }
    if (eqS == null && FT[t] != null && /K200|인덱스/.test(st)){ eqS = 1; how = "코스피200 인덱스"; }
    if (eqS == null) return Promise.resolve({na: "상위 보유 자료가 적어 추정 못 함"});
    return betaOf("KOSPI200", K, dn).then(function(B){ return B ? {b: eqS * B.b, how: how + " · 국내 주식은 코스피200처럼"} : {na: "코스피200 자료 없음"}; });
  }

  function ldRun(){
    var EM = window.__elsMy, PD = window.__pdz, dn = drvName(), DV = DRV[dn];
    if (!EM || !PD || !PD.ready) return Promise.resolve(null);
    return dbase(dn).then(function(K){
      if (!K) return null;
      var K2 = dn === "KOSPI200" ? K : K.k200;   // ELS 지금 값 맞추기는 늘 코스피200·한국 종목 10분 시세로
      var Kd = {d: K.d, c: K.c};
      var A0 = amt(), C = PD.cfg(), w = PD.wts();
      var ev = [], st = [], out = [], nb = {}, sep = DV.sh + "와 거의 따로";
      LD.port = null;
      /* 💼 설계기 포트 · 📝 제안서 폼 — 같은 미국 ETF 일봉(port_px) */
      var pPort = PD.ready().then(function(A){
        if (!A) return;
        var D = Array.prototype.slice.call(A.D), bk = {};
        ["SPY", "QQQ", "GLD"].forEach(function(k){ var j = join({d: D, c: Array.prototype.slice.call(A.C[k])}, Kd); bk[k] = beta5(j.a, j.b); });
        var ww = w || (function(){ var s = C.w.SPY / 100, q = C.w.QQQ / 100, g = C.w.GLD / 100; return {SPY: s, QQQ: q, GLD: g, BIL: Math.max(0, 1 - s - q - g)}; })();
        var r = PD.engine(A, ww, {reg: C.reg, vol: C.vol, start: ""});
        if (r){
          var pd = [], pc_ = []; for (var u = 0; u < r.nv.length; u++){ pd.push(r.D[r.i0 + u]); pc_.push(r.nv[u]); }
          var jp = join({d: pd, c: pc_}, Kd), bp = beta5(jp.a, jp.b);
          var pk = 0; for (var i = 0; i < r.nv.length; i++) if (r.nv[i] > pk) pk = r.nv[i];
          var ddp = r.nv[r.nv.length - 1] / pk - 1, nm = "💼 설계기 포트" + (w ? "" : "(기본 비중)");
          if (bp && bp.b > 0.05){
            ev.push({g: "port", t: nm + " −10%", s: won(A0) + "원이면 " + won(A0 * 0.1) + "원 줄어듦", m: -10 / bp.b, b: bp.b});
            var y = (1 + r.mdd / 100) / (1 + ddp) - 1;
            if (y < 0) ev.push({g: "port", t: nm + " 2008년 뒤 가장 깊었던 낙폭 수준", s: "그때 고점 대비 " + sg(r.mdd, 1) + "%(" + r.mddAt.slice(0, 7).replace("-", ".") + ") · 지금 고점 대비 " + sg(ddp * 100, 1) + "% · " + won(A0) + "원이면 " + won(A0 * -y) + "원 더 줄어듦", m: y * 100 / bp.b, b: bp.b});
            LD.port = {b: bp.b, A: A0, nm: nm};
          } else out.push(nm + " — " + sep + "(같이 움직이는 크기 " + (bp ? bp.b.toFixed(2) : "–") + ")");
        }
        return Promise.all([J("archive/x/proposal.json", 3600e3), J("archive/x/port_px/KOSPI.json", 864e5)]).then(function(rr){
          var P = rr[0], KJ = rr[1], bK = null;
          if (KJ && KJ.dd){ var t = s2day(KJ.d0), dd = [], cc = []; for (var z = 0; z < KJ.dd.length; z++){ t += KJ.dd[z]; dd.push(t); cc.push(+KJ.c[z]); } var jk = join({d: dd, c: cc}, Kd); bK = beta5(jk.a, jk.b); }
          ((P && P.forms) || []).forEach(function(f){
            var W = f.sim && f.sim.bt && f.sim.bt.w; if (!W) return;
            var b = 0, ok = true; Object.keys(W).forEach(function(k){ var x = +W[k] / 100; if (k === "BIL") return; var B = k === "KOSPI" ? bK : bk[k]; if (B) b += x * B.b; else ok = false; });
            if (!ok) return;
            var nm = "📝 " + f.title.replace(/ 포트폴리오$/, "") + " 폼";
            if (b > 0.05) ev.push({g: "form", t: nm + " −10%", s: "1억 넣었다면 1,000만원 줄어듦", m: -10 / b, b: b, key: f.key});
            else out.push(nm + " — " + sep);
          });
        });
      });
      /* 📦 담아 둔 펀드 */
      var F = myFunds(), pFund = F.length ? Promise.all([J("archive/x/products.json", 3600e3), J("archive/x/fund_hold.json", 3600e3)]).then(function(r){
        var PM = {}; ((r[0] && r[0].funds) || []).forEach(function(f){ PM[f.c] = f; });
        return Promise.all(F.map(function(f){ return fundBeta(f, PM[f.id], r[1], Kd, dn).then(function(B){
          var nm = String(f.nm || PM[f.id] && PM[f.id].n || f.id).replace(/증권.*$|투자신탁.*$/, "").slice(0, 22), a = +f.amt || 0;
          if (B.zero) out.push("📦 " + nm + " — " + B.how);
          else if (B.na) out.push("📦 " + nm + " — " + B.na);
          else if (B.b > 0.05) ev.push({g: "fund", t: "📦 " + nm + " −10%", s: (a ? won(a) + "원이면 " + won(a * 0.1) + "원 줄어듦 · " : "") + B.how, m: -10 / B.b, b: B.b, amt: a});
          else out.push("📦 " + nm + " — " + sep);
        }); }));
      }) : Promise.resolve();
      /* 📌 내 ELS — 다음 평가 배리어 · KI (가장 먼저 닿는 기초자산 기준) */
      var L = myEls(), pEls = L.length ? EM.load().then(function(){
        return Promise.all(L.map(function(it){
          var q = EM.parseKey(it.key), nm = String(it.nm || "").slice(0, 22), a = +it.amt || 0;
          return Promise.all(q.ua.map(EM.epx)).then(function(ss){
            if (ss.some(function(x){ return !x; })){ out.push("📌 " + nm + " — 기초자산 일봉 없음"); return; }
            var G = EM.align(ss); G.K = G.C.map(EM.sparse); var M = EM.monitor(it, G);
            if (!M || M.wait){ st.push("📌 " + nm + " — 기준가가 아직 안 정해짐"); return; }
            if (M.done){ st.push("📌 " + nm + " — " + (M.done.k + 1) + "차 평가에서 상환 조건을 넘음"); return; }
            // 지금 값으로: 코스피200 = KODEX200 10분 시세 · 한국 종목 = live_px · 나머지 = 마지막 종가
            var idx = (K.idx && K.idx.assets) || {}, cur = M.cur.slice();
            q.ua.forEach(function(u, i){
              var lastC = G.C[i][G.C[i].length - 1], nowV = null;
              if (u === "KOSPI200") nowV = K2 && K2.now;
              else { var f = idx[u] && idx[u].f, cd = f && /^(\d{6})_K[SQ]\.json$/.exec(f); if (cd && K.lvq && K.lvq[cd[1]]) nowV = +K.lvq[cd[1]][0]; }
              if (nowV > 0 && lastC > 0) cur[i] = M.cur[i] * nowV / lastC;
            });
            return Promise.all(q.ua.map(function(u){ return betaOf(u, Kd, dn); })).then(function(BS){
              function first(level){   // level: 기준가 대비 비율 → 기준 시장 몇 % 에서 처음 닿나
                var best = null, who = null, now = false;
                q.ua.forEach(function(u, i){ if (cur[i] < level){ now = true; return; } var B = BS[i]; if (!B || B.b <= 0.05) return;
                  var mm = (level / cur[i] - 1) * 100 / B.b; if (best == null || mm > best){ best = mm; who = u; } });
                return {now: now, m: best, who: who};
              }
              if (M.next){
                var br = first(M.next.bar / 100);
                if (br.now) st.push("📌 " + nm + " — 지금 " + (M.next.k + 1) + "차 배리어(" + M.next.bar + ") 밑 · 이대로면 " + md(day2s(M.next.t)) + " 평가에 상환 안 됨");
                else if (br.m != null) ev.push({g: "els", t: "📌 " + nm + " · " + (M.next.k + 1) + "차 배리어 " + M.next.bar + " 밑", s: lab(br.who) + "가 먼저 닿음 · " + md(day2s(M.next.t)) + " 평가 때 이 아래면 이번엔 상환 안 됨", m: br.m, amt: a});
                else out.push("📌 " + nm + " 배리어 — " + sep);
              }
              if (q.ki != null){
                if (M.kt) st.push("📌 " + nm + " — KI " + q.ki + " 이미 닿음(만기에 못 넘으면 손실)");
                else { var kr = first(q.ki / 100);
                  if (kr.now) st.push("📌 " + nm + " — 지금 KI " + q.ki + " 밑(장중 · 종가로 확인)");
                  else if (kr.m != null) ev.push({g: "els", t: "📌 " + nm + " · KI " + q.ki + " 닿음", s: lab(kr.who) + "가 먼저 닿음 · 만기에 못 넘으면 원금 손실" + (a ? " · " + won(a) + "원 걸림" : ""), m: kr.m, amt: a, ki: 1});
                  else out.push("📌 " + nm + " KI — " + sep); }
              }
            });
          });
        }));
      }) : Promise.resolve();
      // 다른 시장도 같이 보여 주기(대략): 기준이 코스피면 S&P, S&P 면 코스피200
      var other = dn === "KOSPI200" ? "S&P500" : "KOSPI200", pOth = betaOf(other, Kd, dn).then(function(B){ nb.oth = B ? {b: B.b, nm: DRV[other].nm} : null; });
      return Promise.all([pPort, pFund, pEls, pOth]).then(function(){
        ev.sort(function(x, y){ return y.m - x.m; });
        return {K: K, dn: dn, ev: ev, st: st, out: out, nb: nb, els: L.length, funds: F.length, A: A0};
      });
    });
  }

  function ldH(R){
    if (!R) return '<div class="empty">일봉·설계기 자료를 아직 못 받았어요.</div>';
    var K = R.K, ev = R.ev, m = LD.m, DV = DRV[R.dn];
    var inR = ev.filter(function(x){ return x.m >= MAX; }), far = ev.filter(function(x){ return x.m < MAX; });
    var nx = inR[0];
    var tg = '<div class="ld-drv">어느 시장이 빠지면 ' + Object.keys(DRV).map(function(k){ return '<button type="button" data-ldd="' + e(k) + '" class="' + (k === R.dn ? "on" : "") + '">' + DRV[k].ic + ' ' + DRV[k].nm + '</button>'; }).join("") + '</div>';
    var head = '<div class="ld-now"><div><small>' + DV.nm + ' ' + (K.live ? '지금' : '마지막') + '</small><b class="' + (K.chg < 0 ? "dn" : "up") + '">' + sg(K.chg, 1) + '%</b><em>' + (K.live ? K.live.t + ' · KODEX200 시세' : md(K.at) + ' 종가') + '</em></div>' +
      '<div><small>20거래일 고점(' + md(K.hiAt) + ') 대비</small><b class="' + (K.dd < -0.05 ? "dn" : "") + '">' + sg(K.dd, 1) + '%</b><em>여기서 더 빠지면 ↓</em></div>' +
      '<div class="ld-nx"><small>다음 금까지</small><b>' + (nx ? sg(nx.m, 1) + '%' : '–') + '</b><em>' + (nx ? e(nx.t.replace(/^\S+\s/, "")) : DV.sh + ' −30% 안에선 없음') + '</em></div></div>';
    var rows = '<div class="ld-ld">' +
      '<div class="ld-r ld-me"><span class="ld-l"><b>0%</b><small>지금</small></span><i class="ld-dot"></i><span class="ld-t"><b>📍 지금 여기</b><small>' + DV.nm + (K.live ? ' 오늘 ' : ' ' + md(K.at) + ' ') + sg(K.chg, 1) + '% · 20거래일 고점 대비 ' + sg(K.dd, 1) + '%</small></span></div>' +
      (inR.length ? inR.map(function(x){ var on = m < 0 && x.m >= m;
        return '<div class="ld-r' + (on ? ' on' : '') + (x.ki ? ' ki' : '') + '" data-g="' + x.g + '"><span class="ld-l"><b>' + sg(x.m, 1) + '%</b><small>고점 ' + sg(((1 + K.dd / 100) * (1 + x.m / 100) - 1) * 100, 0) + '%</small></span><i class="ld-dot"></i>' +
          '<span class="ld-t"><b>' + e(x.t) + '</b><small>' + e(x.s) + (x.b ? ' · 같이 움직이는 크기 ' + x.b.toFixed(2) : '') + '</small></span></div>'; }).join("")
        : '<div class="ld-r"><span class="ld-l"><b>−30%</b></span><i class="ld-dot"></i><span class="ld-t"><b>' + DV.sh + '이 30% 더 빠져도 먼저 깨지는 게 없어요</b><small>담아 둔 것이 ' + DV.sh + '와 따로 움직이거나, 여유가 커요</small></span></div>') +
      '</div>';
    var tail = (far.length ? '<p class="ld-far">' + DV.sh + ' −30% 안에선 안 닿음: ' + far.map(function(x){ return e(x.t) + '(' + sg(x.m, 0) + '%)'; }).join(" · ") + '</p>' : '') +
      (R.st.length ? '<div class="ld-st"><b>⚠️ 이미 걸린 것</b>' + R.st.map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') +
      (R.out.length ? '<p class="ld-far">따로 움직여 뺀 것: ' + R.out.map(e).join(" · ") + '</p>' : '') +
      (!R.els ? '<p class="ld-hint">📌 상품 → ELS 「내 ELS 관제탑」에 담은 ELS 가 있으면 <b>다음 평가 배리어·KI 가 어디서 깨지나</b>도 여기 같이 서요.</p>' : '') +
      (!R.funds ? '<p class="ld-hint">📦 「🎛 포트 설계기」를 펼쳐 「🔬 내 돈 속 진짜 종목」에서 펀드를 담으면 그 펀드도 같이 서요.</p>' : '');
    var sl = '<div class="ld-sl"><label>👆 ' + DV.nm + '이 지금보다 <b id="ldmv">' + sg(m, 1) + '%</b> 더 빠지면 <input type="range" id="ldm" min="' + MAX + '" max="0" step="0.5" value="' + m + '" aria-label="더 빠지면"></label><div id="ldsum">' + ldSum(R, m) + '</div></div>';
    return tg + head + sl + rows + tail +
      '<p class="note" style="margin:8px 0 0">대략 — 「같이 움직이는 크기」= 최근 1년 주간(5거래일) 등락으로 잰 「' + DV.nm + '이 1% 움직일 때 같이 움직인 %」(위기 때는 더 커질 수 있음) · 미국 ETF·지수는 달러 기준(환율 빼고) · 펀드는 상위 보유 주식 비중 · ELS 는 기준가 대비 지금 값(코스피200·한국 종목은 10분 시세, 나머지는 마지막 종가) · 과거 계산 · 미래 보장 아님 · 사라·팔라는 뜻 아님</p>';
  }
  function ldSum(R, m){
    if (!(m < 0)) return '<small class="mut">막대를 왼쪽으로 끌면 그 깊이에서 무엇이 깨지는지 · 대략 얼마 줄어드는지 바로 보여요</small>';
    var K = R.K, br = R.ev.filter(function(x){ return x.m >= m; }), O = R.nb.oth, P = LD.port, lossF = 0;
    R.ev.forEach(function(x){ if (x.g === "fund" && x.amt) lossF += x.amt * x.b * -m / 100; });
    var ki = br.filter(function(x){ return x.ki; }).length, bar = br.filter(function(x){ return x.g === "els" && !x.ki; }).length;
    return '<div class="ld-sm"><span>고점 대비 <b class="dn">' + sg(((1 + K.dd / 100) * (1 + m / 100) - 1) * 100, 1) + '%</b></span>' + (O ? '<span>' + O.nm + ' 대략 <b class="dn">' + sg(O.b * m, 1) + '%</b></span>' : '') +
      '<span>깨진 것 <b>' + br.length + '</b>개</span>' + (P ? '<span>💼 포트 대략 <b class="dn">−' + won(P.A * P.b * -m / 100) + '원</b></span>' : '') + (lossF ? '<span>📦 펀드 대략 <b class="dn">−' + won(lossF) + '원</b></span>' : '') +
      (bar || ki ? '<span>📌 배리어 밑 ' + bar + ' · KI ' + ki + '</span>' : '') + '</div>';
  }
  function ldBind(b){
    [].forEach.call(b.querySelectorAll("[data-ldd]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); try { localStorage.setItem("ldDrv", x.getAttribute("data-ldd")); } catch(z) {} LD.m = 0; ldPaint(); }; });
    var r = document.getElementById("ldm"); if (!r) return; stop(r);
    r.oninput = function(){ LD.m = +r.value; var v = document.getElementById("ldmv"); if (v) v.textContent = sg(LD.m, 1) + "%";
      var s = document.getElementById("ldsum"); if (s && LD.R) s.innerHTML = ldSum(LD.R, LD.m);
      var ev = LD.R ? LD.R.ev.filter(function(x){ return x.m >= MAX; }) : [];
      [].forEach.call(b.querySelectorAll(".ld-ld .ld-r[data-g]"), function(row, i){ var x = ev[i]; row.classList.toggle("on", !!x && LD.m < 0 && x.m >= LD.m); }); };
  }
  function ldPaint(){
    var b = document.getElementById("ldbody"); if (!b || LD.busy) return;
    LD.busy = 1;
    ldRun().then(function(R){ LD.busy = 0; LD.R = R; var b2 = document.getElementById("ldbody"); if (!b2) return; b2.innerHTML = ldH(R); ldBind(b2); }, function(x){ LD.busy = 0; console.warn(x); });
  }
  function ldSig(){ var P = window.__pdz; return JSON.stringify([drvName(), P && P.cfg ? P.cfg() : 0, amt(), myEls().map(function(x){ return [x.id, x.amt, x.base]; }), myFunds().map(function(f){ return [f.id, f.amt]; })]); }
  function portMount(){
    var pz = document.querySelector("#podz section.card.pz"); if (!pz) return;
    if (!document.getElementById("ldsec")){
      var s = document.createElement("section"); s.className = "card ld4 no-clp"; s.id = "ldsec"; s.dataset.xc = "1";
      s.innerHTML = '<h3 class="ld-hd">🪜 금 가는 순서표</h3><small class="ld-sub">코스피200이 더 빠지면 내 돈에서 무엇이 먼저 깨지나 — 📌 ELS · 📦 펀드 · 💼 포트 · 📝 제안서 폼</small><div id="ldbody"><div class="loading">순서 세우는 중…</div></div>';
      var pd = document.getElementById("podz");   // 설계기 덩어리(접힘) 바로 위 — 포트 탭의 다른 카드처럼 제목 한 줄로 접히고 누르면 펼침
      pd.parentNode.insertBefore(s, pd); LD.sig = ldSig(); ldPaint();
      var fj = document.querySelector("#pobody .fold-jump, .fold-jump");
      if (fj && !fj.querySelector("[data-ldj]")){ var bt = document.createElement("button"); bt.setAttribute("data-ldj", "1"); bt.textContent = "🪜 금"; fj.appendChild(bt);
        bt.onclick = function(){ var el = document.getElementById("ldsec"); if (!el) return; el.classList.remove("cz-on"); var y = el.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 50; window.scrollTo({top: y, behavior: "smooth"}); }; }
      return;
    }
    var sg_ = ldSig(); if (sg_ !== LD.sig){ LD.sig = sg_; clearTimeout(portMount.t); portMount.t = setTimeout(ldPaint, 500); }
  }
  // 장중엔 10분마다 다시(지금 위치가 움직임)
  setInterval(function(){ if (document.getElementById("ldbody") && !document.hidden){ KB = null; ldPaint(); } }, 600000);

  /* ════════════ ② 🔢 숫자로 찾기 ════════════ */
  var NS = {P: null, E: null, PR: null};
  function nsData(){
    if (!NS.P) NS.P = Promise.all([J("archive/x/products.json", 1800e3), J("archive/x/els_all.json", 1800e3), J("archive/x/proposal.json", 3600e3)]).then(function(r){ NS.PR = r[2]; return {p: r[0], e: r[1], pr: r[2]}; });
    return NS.P;
  }
  // 「5%」「3년」「18개월」「1000만원」「1억」「5천만」「1년 +10%」 — 숫자 말고 다른 글자가 남으면 종목 검색으로 둠
  function parse(q0){
    var q = String(q0 || "").replace(/,/g, "").trim(); if (!q || !/\d/.test(q)) return null;
    var o = {}, rest = q, m;
    m = /1\s*년\s*(?:에\s*)?\+?\s*(\d+(?:\.\d+)?)\s*%/.exec(rest); if (m){ o.goal = +m[1]; rest = rest.replace(m[0], " "); }
    m = /(\d+(?:\.\d+)?)\s*(억|천만|백만|만)\s*원?/.exec(rest); if (m){ o.amt = +m[1] * {"억": 1e8, "천만": 1e7, "백만": 1e6, "만": 1e4}[m[2]]; rest = rest.replace(m[0], " "); }
    else { m = /(\d{6,})\s*원/.exec(rest); if (m){ o.amt = +m[1]; rest = rest.replace(m[0], " "); } }
    m = /(\d+(?:\.\d+)?)\s*%/.exec(rest); if (m){ o.rate = +m[1]; rest = rest.replace(m[0], " "); }
    m = /(\d+(?:\.\d+)?)\s*(년|개월|달)/.exec(rest); if (m){ o.yrs = m[2] === "년" ? +m[1] : +m[1] / 12; rest = rest.replace(m[0], " "); }
    rest = rest.replace(/연|이상|넘는|넘게|넘|짜리|안팎|정도|쯤|만기|이자|금리|수익|수익률|상품|으로|로|에|이면|이|원|\+|~|\s/g, "");
    if (/[A-Za-z가-힣0-9]/.test(rest)) return null;
    if (o.goal == null && o.amt == null && o.rate == null && o.yrs == null) return null;
    if (o.rate != null && (o.rate <= 0 || o.rate > 30)) return null;
    return o;
  }
  var RK = {"매우낮은위험": 0, "낮은위험": 1, "보통위험": 2, "다소높은위험": 3, "높은위험": 4, "매우높은위험": 5};
  var BK = {"국채": 0, "공사채·지방채": 1, "회사채": 2, "신종·후순위": 3};
  function yTo(s){ return (s2day(s) - s2day(today())) / 365.25; }
  function ytxt(y){ var a = Math.floor(y), mo = Math.round((y - a) * 12); if (mo === 12){ a++; mo = 0; } return (a ? a + "년" : "") + (mo ? " " + mo + "개월" : "") || "1개월 안"; }
  function within(y, H){ return Math.abs(y - H) <= Math.max(0.25, H * 0.15); }
  function uaClean(u){   // 공시 글에서 기초자산 칸에 긴 문장이 들어온 경우가 있음 → 짧은 이름만, 아니면 「설명서 확인」
    var t = String(u || "").replace(/\s*지수/g, "").replace(/\s*보통주\s*\(\d{6}\)/g, "").replace(/\(\d{6}\)/g, "").trim();
    if (!t || t.length > 40 || /산출기관|발행인|경우/.test(t)) return "기초자산은 설명서 확인";
    return t;
  }
  function pick(D, o){
    var td = today(), P = D.p || {}, R = {bond: [], els: [], fund: []};
    // 채권: 원화(세전 매수금리 buy · 세후 after) + 미국채·호주국채(달러·호주달러 기준 만기수익률)
    (P.krw || []).forEach(function(b){ if (!(b.buy > 0) || !b.mat) return; var y = yTo(b.mat); if (y <= 0) return;
      if (o.rate != null && b.buy < o.rate) return; if (o.yrs != null && !within(y, o.yrs)) return;
      R.bond.push({k: "bond", nm: b.name, r: b.buy, aft: b.after, y: y, risk: b.risk, rk: RK[b.risk] == null ? 9 : RK[b.risk], bk: BK[b.kind] == null ? 5 : BK[b.kind], kind: b.kind, cur: "원화"}); });
    [["ust", "달러"], ["aud", "호주달러"]].forEach(function(z){ ((P[z[0]] && P[z[0]].items) || []).forEach(function(b){ if (!(b.ytm > 0) || !b.mat) return; var y = yTo(b.mat); if (y <= 0) return;
      if (o.rate != null && b.ytm < o.rate) return; if (o.yrs != null && !within(y, o.yrs)) return;
      R.bond.push({k: "bond", nm: (b.kind || "") + " " + b.name, r: b.ytm, y: y, risk: "환율 따로", rk: 1.5, bk: 0.5, kind: b.kind, cur: z[1]}); }); });
    R.bond.sort(function(a, b){ return (a.cur !== "원화") - (b.cur !== "원화") || a.rk - b.rk || a.bk - b.bk || (o.rate != null ? a.r - b.r : b.r - a.r); });   // 원화 먼저(환율 위험 없음) → 위험 낮은 순 → 조건에 가장 가까운 금리
    // ELS·ELB: 청약 중(마감 ≥ 오늘) · 조건 맞으면 연 쿠폰
    (((D.e && D.e.items) || [])).forEach(function(x){ if (!x.e || x.e < td || !(x.cpn > 0) || x.pv === true) return; var y = x.mat ? yTo(x.mat) : null;
      if (o.rate != null && x.cpn < o.rate) return; if (o.yrs != null && (y == null || !within(y, o.yrs))) return;
      var elb = x.kind === "ELB" || x.nolos;
      R.els.push({k: "els", nm: String(x.nm || "").replace(/\s*\(.*$/, "").replace(/파생결합증권|주가연계증권|파생결합사채|주가연계파생결합사채/g, "").replace(/\s+/g, " ").trim() || x.id, iss: String(x.iss || "").replace(/주식회사|\(주\)/g, "").trim(),
        r: x.cpn, y: y, ua: uaClean(x.ua), ki: x.ki, bars: x.bars, e: x.e, elb: elb, ord: elb ? 0 : 1, kio: x.ki == null ? (elb ? 0 : 99) : x.ki}); });
    R.els.sort(function(a, b){ return a.ord - b.ord || a.kio - b.kio || (o.rate != null ? a.r - b.r : b.r - a.r); });
    // 펀드: 지난 1년 수익률(과거) · 만기가 없으니 「n년」만 친 경우는 뺌
    if (o.rate != null) (P.funds || []).forEach(function(f){ if (f.pv || f.y1 == null || (f.aum || 0) < 10) return;
      if (/채권형|MMF/.test(f.t || "") && !/혼합/.test(f.t) && f.y1 > 12) return;   // 채권·MMF 인데 1년 +12% 넘으면 자료 이상으로 보고 뺌
      if (f.y1 < o.rate || f.y1 > 300) return;
      R.fund.push({k: "fund", nm: f.n, r: f.y1, t: f.t, st: f.st, rk: f.rk, co: f.co, c: f.c}); });
    R.fund.sort(function(a, b){ return (b.rk || 0) - (a.rk || 0) || a.r - b.r; });   // rk 6 = 매우 낮은 위험 → 조건에 가장 가까운 것
    return R;
  }
  function rowTxt(x, o){
    var A = o.amt;
    if (x.k === "bond") return {h: "🏦 채권", nm: x.nm, big: (x.cur === "원화" ? "세전 연 " : x.cur + " 기준 연 ") + pc(x.r, 2), sub: (x.aft != null ? "세후 " + pc(x.aft, 2) + " · " : "") + "남은 기간 " + ytxt(x.y) + " · " + (x.kind || "") + " · " + x.risk,
      mean: x.cur === "원화" ? "만기까지 들고 있으면 받는 금리(발행한 곳이 갚는다는 전제)" : "만기까지 들고 있으면 받는 금리 — 원화로는 환율에 따라 달라짐", won: A && x.cur === "원화" ? won(A * x.r / 100) + "원/년(세전)" : ""};
    if (x.k === "els") return {h: x.elb ? "🎯 ELB(원금 지급형)" : "🎯 ELS", nm: x.nm + (x.iss ? " · " + x.iss : ""), big: "조건 맞으면 연 " + pc(x.r, 1), sub: String(x.ua || "") + (x.ki != null ? " · KI " + x.ki : "") + (x.y != null ? " · 최장 " + ytxt(x.y) : "") + " · 청약 " + md(x.e) + " 마감",
      mean: x.elb ? "원금은 지급 · 조건 못 맞추면 최저 수익" : "조건 못 맞추면 원금 손실 가능 — 쿠폰은 약속된 최대치", won: A ? "조건 맞으면 " + won(A * x.r / 100) + "원/년" : ""};
    return {h: "📦 펀드", nm: x.nm.replace(/증권.*$|투자신탁.*$/, "").trim() + (x.co ? " · " + x.co : ""), big: "지난 1년 " + sg(x.r, 1) + "%", sub: (x.t || "") + (x.st ? " · " + x.st : "") + (x.rk ? " · 위험 " + x.rk + "등급(6 = 가장 낮음)" : ""),
      mean: "지나간 1년 결과일 뿐 — 앞으로 보장 아님 · 원금 손실 가능", won: A ? "지난 1년이었다면 " + (x.r >= 0 ? "+" : "−") + won(Math.abs(A * x.r / 100)) + "원" : ""};
  }
  function title(o){
    var a = []; if (o.rate != null) a.push("연 " + o.rate + "% 넘는"); if (o.yrs != null) a.push(ytxt(o.yrs).trim() + " 안팎"); return a.join(" · ") + " 상품";
  }
  function goalForms(PR, g){
    return ((PR && PR.forms) || []).map(function(f){ var G = f.sim && f.sim.bt && f.sim.bt.growth; if (!G || !G.vals || G.vals.length < 30) return null;
      var v = G.vals, n = 0, k = 0, best = -1e9, worst = 1e9; for (var i = 0; i + 12 < v.length; i++){ var r = (v[i + 12] / v[i] - 1) * 100; n++; if (r >= g) k++; if (r > best) best = r; if (r < worst) worst = r; }
      return {key: f.key, t: f.title.replace(/ 포트폴리오$/, ""), ic: f.icon || "📝", n: n, k: k, p: k / n * 100, from: G.labels[0], worst: worst}; }).filter(Boolean).sort(function(a, b){ return b.p - a.p; });
  }
  function jump(tab, sel){
    var o = document.getElementById("gsq"); if (o) o.remove(); document.body.classList.remove("gs-open");
    if (!window.goTo){ if (window.go) go(tab); return; }
    if (sel && sel.charAt(0) === "#"){ goTo(tab, sel.slice(1)); return; }
    goTo(tab); if (!sel) return;
    var t0 = Date.now(); (function f(){ var el = document.querySelector(sel); if (el){ if (!el.id) el.id = "nsj" + Math.random().toString(36).slice(2, 7); goTo(tab, el.id); return; } if (Date.now() - t0 < 8000) setTimeout(f, 200); })();
  }
  var CUR = null;
  function nsHTML(o, D){
    var h = "";
    if (o.rate != null || o.yrs != null){
      var R = pick(D, o), top = [R.bond[0], R.els[0], R.fund[0]].filter(Boolean);
      CUR = {o: o, R: R, top: top};
      h += '<div class="ns-hd">🔢 <b>' + e(title(o)) + '</b><small>채권 ' + R.bond.length + ' · ELS ' + R.els.length + (o.rate != null ? ' · 펀드 ' + R.fund.length : ' · 펀드는 만기가 없어 뺌') + ' — 위험 낮은 것부터 한 줄씩</small></div>';
      h += top.length ? '<div class="ns-top">' + top.map(function(x){ var T = rowTxt(x, o); return '<div class="ns-c"><small>' + T.h + '</small><b class="ns-big">' + e(T.big) + '</b><span class="ns-nm">' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' + (T.won ? '<u>' + e(T.won) + '</u>' : '') + '</div>'; }).join("") + '</div>' +
        '<div class="ns-act"><button type="button" data-ns="big">📲 크게 보기 · 한 장</button></div>' : '<div class="gs-hint">조건에 맞는 상품이 지금 목록에 없어요.</div>';
      [["bond", "🏦 채권", R.bond, "bond"], ["els", "🎯 ELS·ELB(청약 중)", R.els, "els"], ["fund", "📦 펀드(지난 1년)", R.fund, "fund"]].forEach(function(z){
        if (!z[2].length) return;
        h += '<details class="ns-more"><summary>' + z[1] + ' ' + z[2].length + '개 더 보기</summary>' + z[2].slice(0, 8).map(function(x){ var T = rowTxt(x, o); return '<div class="ns-r"><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><small>' + e(T.sub) + '</small></div>'; }).join("") +
          '<button type="button" class="ns-go" data-nsj="' + z[3] + '">' + z[1] + ' 탭에서 보기 ›</button></details>';
      });
    }
    if (o.goal != null){
      var GF = goalForms(D.pr, o.goal);
      h += '<div class="ns-hd">🎯 <b>1년에 +' + o.goal + '% 넘었던 비율</b><small>📝 제안서 주식·연금 폼 · 매달 시작했다면 그 뒤 1년</small></div>' +
        (GF.length ? GF.map(function(g){ return '<button type="button" class="ns-g" data-nsf="' + e(g.key) + '"><span>' + e(g.ic) + ' <b>' + e(g.t) + '</b><small>' + g.from.replace("-", ".") + '~ · ' + g.n + '번 중 ' + g.k + '번 · 가장 나쁜 1년 ' + sg(g.worst, 1) + '%</small></span><b class="ns-p">' + Math.round(g.p) + '%</b></button>'; }).join("") +
          '<p class="ns-n">과거 계산 · 미래 보장 아님 · 채권·ELS 폼은 확정·조건 수익이라 뺌 · 누르면 그 폼으로</p>' : '<div class="gs-hint">폼 자료를 못 받았어요.</div>');
    }
    if (false && o.amt != null){   // 11/05 세 갈래 길 뺌
      h += '<div class="ns-hd">💰 <b>' + won(o.amt) + '원</b><small>같은 돈을 채권·ELS·포트에 나눠 보면</small></div>' +
        '<button type="button" class="ns-g" data-nsa="' + o.amt + '"><span>⚖️ <b>' + won(o.amt) + '원으로 세 갈래 길 열기</b><small>채권 한 점 · ELS · 포트 3년 범위 — 💼 주문서 투자금도 같은 칸이라 ' + won(o.amt) + '원으로 바뀌어요(지금 ' + won(amt()) + '원)</small></span><b class="ns-p">›</b></button>';
    }
    return h + '<p class="ns-n">참고용 · 투자 권유 아님 · 세금·수수료 전 · 숫자는 미래에셋 판매 목록(채권·펀드)·DART 청약 공시(ELS) 그대로</p>';
  }
  function chipsHTML(){
    return '<div class="ns-chips"><small>🔢 숫자로 찾기</small>' + ["5%", "3년", "4% 3년", "1년 +10%"].map(function(x){ return '<button type="button" data-nsc="' + e(x) + '">' + e(x) + '</button>'; }).join("") + '</div>';
  }
  function hook(){
    var o = document.getElementById("gsq"); if (!o || o.dataset.ns) return; o.dataset.ns = "1";
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres"), ask = document.getElementById("gsask"); if (!inp || !res) return;
    inp.placeholder = "종목명·코드 · 숫자도 돼요 (예: 삼성전자, 5%, 3년)";
    var box = document.createElement("div"); box.id = "gsnum"; res.parentNode.insertBefore(box, res);
    function draw(){
      var q = inp.value.trim(), P = parse(q);
      if (!q){ box.innerHTML = chipsHTML(); res.style.display = ""; return; }
      if (!P){ box.innerHTML = ""; res.style.display = ""; return; }
      res.style.display = "none"; if (ask) ask.style.display = "none";
      box.innerHTML = '<div class="gs-hint">상품 목록 불러오는 중…</div>';
      nsData().then(function(D){ if (inp.value.trim() !== q) return; box.innerHTML = nsHTML(P, D); });
    }
    inp.addEventListener("input", draw);
    inp.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && parse(inp.value.trim())){ ev.stopImmediatePropagation(); ev.preventDefault(); inp.blur(); } }, true);
    box.addEventListener("click", function(ev){
      var t = ev.target.closest && ev.target.closest("button"); if (!t) return; ev.stopPropagation();
      if (t.dataset.nsc){ inp.value = t.dataset.nsc; draw(); try { if (window.ntfyUse) ntfyUse("num_chip"); } catch(z) {} return; }
      if (t.dataset.ns === "big"){ bigOpen(); return; }
      if (t.dataset.nsj){ jump(t.dataset.nsj, "#pdbody"); return; }
      if (t.dataset.nsf){ jump("prop", '.pp-f[data-k="' + t.dataset.nsf + '"]'); return; }
      if (t.dataset.nsa){ try { var s = JSON.parse(localStorage.getItem("portSet") || "{}"); s.amt = +t.dataset.nsa; localStorage.setItem("portSet", JSON.stringify(s)); } catch(z) {} jump("bond", "#pd3w"); return; }
    });
    draw();
  }
  /* 📲 크게 보기 — 고객에게 폰을 건넬 때(큰 글씨) · 📨 그림 한 장으로 보내기 */
  var DISC = "투자 권유 아님 · 과거 수익률은 미래를 보장하지 않음 · ELS·펀드는 원금 손실 가능 · 세금·수수료 전 · 상품 설명서를 꼭 확인";
  function bigOpen(){
    if (!CUR || !CUR.top.length) return;
    var old = document.getElementById("nsbig"); if (old) old.remove();
    var o = CUR.o, d = document.createElement("div"); d.id = "nsbig"; d.className = "no-clp";
    d.innerHTML = '<div class="nb-in"><div class="nb-top"><small>' + md(today()) + ' · 참고용</small><button type="button" class="nb-x" aria-label="닫기">✕</button></div>' +
      '<h2>' + e(title(o)) + '</h2><p class="nb-s">' + (o.amt ? won(o.amt) + '원 기준 · ' : '') + '위험이 낮은 것부터 한 가지씩</p>' +
      CUR.top.map(function(x){ var T = rowTxt(x, o); return '<div class="nb-c"><small>' + T.h + '</small><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' + (T.won ? '<u>' + e(T.won) + '</u>' : '') + '</div>'; }).join("") +
      '<p class="nb-d">' + DISC + '</p><button type="button" class="nb-send">📨 이 한 장 보내기</button></div>';
    document.body.appendChild(d);
    d.querySelector(".nb-x").onclick = function(){ d.remove(); };
    d.querySelector(".nb-send").onclick = function(){ sendImg(); };
  }
  function wrap(g, t, maxW){ var out = [], line = ""; String(t).split(/(\s+)/).forEach(function(w){ var tt = line + w; if (g.measureText(tt).width > maxW && line.trim()){ out.push(line.trim()); line = w.trim(); } else line = tt; }); if (line.trim()) out.push(line.trim()); return out; }
  function sendImg(){
    if (!CUR) return;
    var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d"), o = CUR.o;
    var F = "-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText(md(today()) + " · 참고용 상품 비교", 64, 90);
    g.fillStyle = "#111827"; g.font = "800 58px " + F; g.fillText(title(o), 64, 170);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText((o.amt ? won(o.amt) + "원 기준 · " : "") + "위험이 낮은 것부터 한 가지씩", 64, 222);
    var y = 270, cols = {bond: "#2563eb", els: "#d97706", fund: "#059669"};
    CUR.top.forEach(function(x){
      var T = rowTxt(x, o), h0 = y;
      g.fillStyle = "#f3f4f6"; g.beginPath(); if (g.roundRect) g.roundRect(48, y, W - 96, 300, 28); else g.rect(48, y, W - 96, 300); g.fill();
      g.fillStyle = cols[x.k]; g.fillRect(48, y + 24, 10, 252);
      g.fillStyle = "#374151"; g.font = "700 30px " + F; g.fillText(T.h, 88, y + 58);
      g.fillStyle = "#111827"; g.font = "800 56px " + F; g.fillText(T.big, 88, y + 126);
      g.fillStyle = "#111827"; g.font = "600 30px " + F; wrap(g, T.nm, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 172); });
      g.fillStyle = "#4b5563"; g.font = "500 26px " + F; wrap(g, T.sub, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 212); });
      g.fillStyle = "#b45309"; g.font = "500 26px " + F; wrap(g, T.mean + (T.won ? " · " + T.won : ""), W - 190).slice(0, 2).forEach(function(l, i){ g.fillText(l, 88, y + 250 + i * 32); });
      y = h0 + 320;
    });
    g.fillStyle = "#6b7280"; g.font = "500 24px " + F; wrap(g, DISC, W - 128).forEach(function(l, i){ g.fillText(l, 64, H - 110 + i * 34); });
    c.toBlob(function(b){
      if (!b) return;
      var f = new File([b], "상품비교_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"});
      if (window.__onepage && __onepage.ready) __onepage.ready([f], "상품 비교 한 장");
      else { var a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); }
    }, "image/png");
  }
  window.__u1104 = {parse: parse, pick: pick, goalForms: goalForms, ldRun: ldRun, beta5: beta5, kbase: kbase, nsData: nsData, rowTxt: rowTxt, ytxt: ytxt, title: title};   // 11/05 ux1105b 가 rowTxt·ytxt 를 같이 씀   // 검사용

  var T = null;
  function tick(){ T = null; try { portMount(); } catch(x) { console.warn(x); } try { hook(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".ld4 h3.ld-hd{margin:0;font-size:16px}.ld4 .ld-sub{display:block;color:var(--sub);font-size:12.5px;margin-top:2px;word-break:keep-all}" +
    ".ld-now{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px;margin:10px 0 8px}.ld-now>div{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:8px 9px;min-width:0}" +
    ".ld-now small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all}.ld-now b{display:block;font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}.ld-now em{display:block;font-style:normal;font-size:11.5px;color:var(--sub);word-break:keep-all}" +
    ".ld-now .ld-nx{border-color:var(--down,#4b8bff)}.ld-now b.dn,.ld-sm b.dn{color:var(--down)}.ld-now b.up{color:var(--up)}" +
    ".ld-drv{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12.5px;color:var(--sub);margin:10px 0 0}.ld-drv button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 11px;font:inherit;font-size:13px;cursor:pointer}.ld-drv button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}" +
    ".ld-sl{margin:4px 0 10px}.ld-sl label{display:block;font-size:13.5px}.ld-sl input{width:100%;margin:6px 0 2px}.ld-sm{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub)}.ld-sm b{color:var(--text);font-variant-numeric:tabular-nums}" +
    ".ld-ld{position:relative;margin:4px 0 0;padding-left:2px}.ld-ld:before{content:'';position:absolute;left:79px;top:10px;bottom:10px;width:2px;background:var(--line)}" +
    ".ld-r{display:grid;grid-template-columns:70px 16px 1fr;gap:6px;align-items:start;padding:6px 0;position:relative}.ld-l{text-align:right;font-variant-numeric:tabular-nums}.ld-l b{display:block;font-size:14.5px;white-space:nowrap}.ld-l small{display:block;font-size:11px;color:var(--sub);white-space:nowrap}" +
    ".ld-dot{width:12px;height:12px;border-radius:50%;background:var(--panel);border:2px solid var(--sub);margin:4px 0 0 2px;font-style:normal;z-index:1}.ld-t{min-width:0}.ld-t b{display:block;font-size:14px;word-break:keep-all}.ld-t small{display:block;font-size:12px;color:var(--sub);word-break:keep-all}" +
    ".ld-me .ld-dot{background:#ffb84d;border-color:#ffb84d}.ld-me .ld-l b{color:#ffb84d}.ld-0 .ld-l b{color:var(--sub)}" +
    ".ld-r.on{background:rgba(255,159,67,.14);border-radius:10px}.ld-r.on .ld-dot{background:#ff9f43;border-color:#ff9f43}.ld-r.ki .ld-t b:after{content:' ⚠️'}" +
    ".ld-far,.ld-hint{font-size:12.5px;color:var(--sub);margin:8px 0 0;word-break:keep-all}.ld-hint b{color:var(--text)}.ld-st{margin:8px 0 0;font-size:12.5px;border:1px solid var(--line);border-radius:10px;padding:7px 9px}.ld-st div{margin-top:3px;word-break:keep-all}" +
    "#gsnum .ns-chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--line)}#gsnum .ns-chips small{font-size:12.5px;font-weight:800;margin-right:2px}" +
    "#gsnum .ns-chips button{border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 11px;font:inherit;font-size:13.5px;cursor:pointer}" +
    "#gsnum{max-height:72vh;overflow-y:auto}.ns-hd{padding:10px 12px 4px;font-size:14.5px}.ns-hd small{display:block;color:var(--sub);font-size:12px;margin-top:1px;word-break:keep-all}" +
    ".ns-top{display:flex;flex-direction:column;gap:6px;padding:4px 10px}.ns-c{border:1px solid var(--line);border-radius:12px;padding:9px 11px;background:var(--panel2)}.ns-c small{font-size:12px;color:var(--sub);font-weight:700}" +
    ".ns-c .ns-big{display:block;font-size:19px;font-variant-numeric:tabular-nums}.ns-c .ns-nm{display:block;font-size:13.5px;font-weight:700;word-break:keep-all}.ns-c em,.ns-c i,.ns-c u{display:block;font-style:normal;font-size:12px;color:var(--sub);text-decoration:none;word-break:keep-all}.ns-c i{color:#d99a2b}.ns-c u{color:var(--text);font-weight:700}" +
    ".ns-act{padding:6px 10px}.ns-act button,.ns-go{width:100%;border:0;border-radius:12px;padding:11px;font:inherit;font-size:14.5px;font-weight:800;background:var(--c,#7c9cff);color:#111;cursor:pointer}" +
    ".ns-more{margin:4px 10px;border:1px solid var(--line);border-radius:12px;padding:6px 10px}.ns-more summary{font-size:13.5px;font-weight:700;cursor:pointer}.ns-r{padding:6px 0;border-top:1px solid var(--line);font-size:13px}.ns-r b{display:block;font-variant-numeric:tabular-nums}.ns-r span{display:block;word-break:keep-all}.ns-r small{display:block;color:var(--sub);font-size:12px;word-break:keep-all}" +
    ".ns-go{margin:6px 0 2px;background:var(--panel);color:var(--text);border:1px solid var(--line)}" +
    ".gs-box .ns-g{display:flex;width:calc(100% - 20px);margin:4px 10px;align-items:center;gap:8px;text-align:left;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text);padding:9px 11px;font:inherit;cursor:pointer}" +
    ".ns-g span{flex:1;min-width:0;font-size:14px}.ns-g small{display:block;color:var(--sub);font-size:12px;word-break:keep-all}.ns-g .ns-p{font-size:19px;font-variant-numeric:tabular-nums}.ns-n{font-size:11.5px;color:var(--sub);padding:6px 12px 10px;margin:0;line-height:1.45}" +
    "#nsbig{position:fixed;inset:0;z-index:10000;background:var(--bg,#0b0f17);overflow-y:auto;padding:calc(env(safe-area-inset-top) + 12px) 16px calc(env(safe-area-inset-bottom) + 20px)}" +
    ".nb-in{max-width:560px;margin:0 auto}.nb-top{display:flex;justify-content:space-between;align-items:center;color:var(--sub);font-size:14px}.nb-x{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;font-size:20px;padding:6px 14px}" +
    "#nsbig h2{font-size:30px;line-height:1.25;margin:14px 0 4px;word-break:keep-all}.nb-s{color:var(--sub);font-size:17px;margin:0 0 14px}" +
    ".nb-c{border:1px solid var(--line);background:var(--panel);border-radius:18px;padding:16px 16px 14px;margin:0 0 12px}.nb-c small{font-size:16px;color:var(--sub);font-weight:800}.nb-c b{display:block;font-size:32px;margin:4px 0;font-variant-numeric:tabular-nums}" +
    ".nb-c span{display:block;font-size:18px;font-weight:700;word-break:keep-all}.nb-c em,.nb-c i,.nb-c u{display:block;font-style:normal;text-decoration:none;font-size:15.5px;color:var(--sub);margin-top:4px;word-break:keep-all}.nb-c i{color:#d99a2b}.nb-c u{color:var(--text);font-weight:800}" +
    ".nb-d{font-size:14px;color:var(--sub);line-height:1.5;word-break:keep-all}.nb-send{width:100%;border:0;border-radius:14px;padding:15px;font:inherit;font-size:17px;font-weight:800;background:var(--c,#7c9cff);color:#111;margin-top:6px}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
