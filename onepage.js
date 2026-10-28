/* 📨 고객에게 보내기 — 한 장 (10/28 사용자 「동료 PB」 ② · 09:57 「CH Investing 지우고 · 내용 조합·압축 · 그림 · 심플」)
   🏠·🌐 → 지금(오늘) 시장 한 장 · 💼 → 오늘의 자산배분 한 장 · 🏦·🎯·📦 → 펼친 상품 한 장.
   화면 캡처가 아니라 앱 자료(실시간 시세·국면·배분·과거 재생)를 골라 캔버스에 새로 그림(1080×1350 PNG):
   숫자 타일 · 업종 막대 · 배분 막대 · 성과 선 · 만기 시간표 · ELS 계단 · 수익률 막대. 앱 이름은 넣지 않음(PB 이름만). 🔒 사모 라인업은 절대 안 들어감. */
(function(){
  var TABS = {home: "시장", market: "시장", port: "포트", bond: "상품", els: "상품", fund: "상품"};
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function strip(t){ return String(t || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function q(){ return "?" + Math.floor(Date.now() / 300000); }
  function pbname(){ var n = ls("pbname"); if (n != null) return n; n = prompt("한 장 아래에 넣을 이름 (예: 홍길동 PB · 비워도 돼요)", "") || ""; ls("pbname", n.trim().slice(0, 30)); return ls("pbname") || ""; }
  function pct(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0] : null; }
  function yrs(mat){ var t = (new Date(mat + "T00:00:00Z") - kst()) / 365.25 / 864e5; return t > 0 ? t : 0; }
  function num(s){ var m = /[−\-]?\d+(\.\d+)?/.exec(String(s || "").replace("−", "-")); return m ? +m[0] : null; }

  /* ───────────── 내용 ───────────── */
  // 🌐 시장: 숫자 타일(코스피·코스닥·오른 종목·S&P 선물) + 업종 막대 + 국면 칩 + 할 말 3줄 + 오늘 일정 + 배분 한 줄
  function mkMarket(){
    var it = latest("market");
    return Promise.all([window.__pbbrief ? __pbbrief() : null, gj("archive/x/live_kr.json" + q()), gj("archive/x/live_us_pre.json" + q()), it ? gj(file("market", it.id, "data.json")) : null, gj(RAWM + "ledger/ledger.json"), gj(RAWM + "market/home.json")]).then(function(r){
      var PB = r[0], L = r[1], U = r[2], D = r[3] || {}, LG = r[4], HM = r[5] || {};
      var live = !!(L && L.date === today() && L.index && L.index.length), liveMode = !!(PB && PB.mode === "장중" && live);
      var ix = {}; (live ? L.index : []).forEach(function(x){ ix[x.name] = x; });
      var kpis = [];
      if (live){ kpis.push({l: "코스피", v: pct(ix["코스피"] && ix["코스피"].chg), s: ix["코스피"] && ix["코스피"].last ? Math.round(ix["코스피"].last).toLocaleString() : ""});
        kpis.push({l: "코스닥", v: pct(ix["코스닥"] && ix["코스닥"].chg), s: ix["코스닥"] && ix["코스닥"].last ? Math.round(ix["코스닥"].last).toLocaleString() : ""});
        if (L.total) kpis.push({l: "오른 종목", v: Math.round(L.up / L.total * 100) + "%", s: L.limit_up ? "상한가 " + L.limit_up : "", neutral: true}); }
      var fut = U && U.date === today() ? (U.fut || []) : [], mac = U && U.date === today() ? (U.macro || []) : [], wd = U && U.date === today() ? (U.world || []) : [];
      var F = function(arr, nm){ return arr.filter(function(f){ return f.name === nm; })[0]; };
      var es = F(fut, "S&P500 선물"), nq = F(fut, "나스닥100 선물");
      if (es) kpis.push({l: "S&P500 선물", v: pct(es.chg), s: nq ? "나스닥 " + pct(nq.chg) : ""});
      var k2 = [];
      [["닛케이225", "닛케이"], ["항셍", "항셍"]].forEach(function(w){ var x = F(wd, w[0]); if (x) k2.push({l: w[1] + (x.st === "prev" ? " (전일)" : ""), v: pct(x.chg)}); });
      [["원/달러", "원/달러"], ["WTI", "유가 WTI"], ["금", "금"], ["미 10년물 국채 선물", "미 10년 국채"]].forEach(function(w){ var x = F(mac, w[0]); if (x && k2.length < 4) k2.push({l: w[1], v: pct(x.chg), s: x.last && w[0] === "원/달러" ? Math.round(x.last).toLocaleString() + "원" : ""}); });
      var sec = live ? (L.sectors || []).filter(function(s){ return s.n >= 5; }) : [];
      var hi = sec.slice().sort(function(a, b){ return b.r - a.r; }).slice(0, 4), lo = sec.slice().sort(function(a, b){ return a.r - b.r; }).slice(0, 2).reverse();
      var bars = hi.concat(lo).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, "").slice(0, 9), v: s.r}; });
      var themes = live ? (L.themes || []).slice(0, 3).map(function(t){ return {n: t.name.replace(/\(.*?\)/g, "").slice(0, 10), v: t.r, s: (t.lead || []).slice(0, 3).map(function(x){ return x.n; }).join(" · ")}; }) : [];
      var vol = live ? (L.value || []).slice(0, 5).map(function(x){ return {n: x.n, v: x.r, s: x.v ? Math.round(x.v / 100) / 10 + "천억" : ""}; }) : [];
      var talk = (PB && PB.asof && PB.asof.slice(0, 10) === today() && PB.talk && PB.talk.length ? PB.talk : ((D.kakao || {}).lines || []).map(strip)).slice(0, 4);
      if (live) talk = talk.filter(function(t){ return !/^한국/.test(t); });
      if (bars.length >= 4) talk = talk.filter(function(t){ return !/^돈이 가는 곳/.test(t); });
      talk = talk.slice(0, 3);
      var reg = (PB && PB.regime) || "";
      var chips = reg ? reg.split("·").map(function(x){ return x.trim(); }).filter(Boolean) : [];
      var ev = (PB && PB.events) || [];
      var al = (LG && LG.allocation || []).filter(function(a){ return a.pct > 0; });
      if (!al.length) (D.allocation_seen || []).forEach(function(a, i){ var m = /([\d.]+)/.exec(a.verdict || ""); if (m && +m[1] > 0) al.push({name: ["S&P500", "나스닥100", "금", "현금"][i] || "", pct: +m[1]}); });
      var fc = (HM.focus || []).slice(0, 3).map(function(f){ return {n: f.name + " (" + f.sym + ")", v: f.rs20 != null ? f.rs20 : f.r5, s: (f.stage || "") + " · " + (f.do || "").split(" — ")[0] + ((f.etf_kr || [])[0] ? " · 국내 " + f.etf_kr[0].name : "")}; });
      var lab = liveMode ? (PB.label || "장중") : (PB && PB.label) || (md(D.date) + " 아침");
      return {kind: "market", title: liveMode ? "지금 시장 한 장" : "오늘 시장 한 장", sub: lab + (D.one_liner ? " · " + strip(D.one_liner).split(" — ")[0].slice(0, 44) : ""),
        kpis: kpis.slice(0, 4), kpis2: k2.slice(0, 4), chips: chips, events: ev,
        bars: bars.length >= 4 ? {title: "업종 — 돈이 가는 곳 / 약한 곳", items: bars} : null,
        themes: themes.length ? {title: "오늘 뜨는 테마 — 대장주", items: themes} : null,
        vol: vol.length ? {title: "거래대금 많은 종목 (억원)", items: vol} : null,
        focus: fc.length ? {title: "미국 — 돈이 몰리는 ETF (20일 S&P 대비 %p)", items: fc} : null,
        bullets: talk, alloc: al.length ? al.map(function(a){ return {n: a.name.replace(" 코어", ""), pct: a.pct}; }) : null,
        note: liveMode ? "장중 시세는 10~15분 늦을 수 있어요" : null};
    });
  }
  // 💼 포트: 배분 막대(큰) + 국면 + 성과 선(배분 vs S&P) + 담는 상품
  function mkPort(){
    var it = latest("market");
    return Promise.all([gj(RAWM + "ledger/ledger.json"), gj(RAWM + "market/home.json"), it ? gj(file("market", it.id, "data.json")) : null]).then(function(r){
      var LG = r[0], H = r[1], D = r[2] || {};
      var al = (LG && LG.allocation || []).filter(function(a){ return a.pct > 0; });
      if (!al.length){ var NM = ["S&P500 코어", "나스닥100 코어", "금", "현금·단기채"], IN = ["TIGER 미국S&P500 360750", "TIGER 미국나스닥100 133690", "TIGER KRX금현물 0072R0", "TIGER CD금리 499660"];
        (D.allocation_seen || []).forEach(function(a, i){ var m = /([\d.]+)/.exec(a.verdict || ""); if (m && +m[1] > 0) al.push({name: NM[i] || "", pct: +m[1], instruments: IN[i] || ""}); }); }
      if (!al.length) return null;
      var P = (H && H.port) || {}, nav = null, spy = null;
      try { nav = typeof P.nav === "string" ? JSON.parse(P.nav) : P.nav; spy = typeof P.spy_line === "string" ? JSON.parse(P.spy_line) : P.spy_line; } catch(x) {}
      var badge = D.decision && D.decision.badges ? strip(D.decision.badges[0]) : "";
      var why = (D.allocation_seen || []).map(function(a, i){ return {n: ["S&P500", "나스닥100", "금", "현금"][i] || "", s: strip(a.seen), v: strip(a.verdict)}; }).filter(function(x){ return x.s; });
      var sch = (D.schedule || []).slice(0, 3).map(function(x){ return {n: strip(x.when), s: strip(x.what)}; });
      return {kind: "port", title: "오늘의 자산배분 제안", why: why.length ? {title: "오늘 국면 근거 — 본 것 → 판정", items: why} : null, sched: sch.length ? {title: "앞으로 볼 일정", items: sch} : null, sub: (P.asof ? md(P.asof) + " 기준 · " : "") + "지수 ETF 뼈대 · 레버리지 없음",
        chips: badge ? [badge] : [], alloc: al.map(function(a){ return {n: a.name.replace(" 코어", ""), pct: a.pct, s: strip(a.instruments).split("/")[0].trim()}; }),
        line: nav && spy && nav.length > 3 ? {a: nav, b: spy, la: "이 배분", lb: "S&P500", from: md(P.start)} : null,
        kpis: P.start ? [{l: md(P.start) + "부터 이 배분", v: pct(P.base)}, {l: "같은 기간 S&P500", v: pct(P.spy)}] : [],
        bullets: ((D.kakao || {}).lines || []).map(strip).filter(function(x){ return /^포트/.test(x); }).slice(0, 1),
        note: "시장 국면(S&P500 200일선)에 따라 비중이 바뀌는 규칙 · 개별 종목 추천 아님"};
    });
  }
  function selected(){ var row = document.querySelector("#pdroot .pd-tap.on"); if (!row || !window.__pdObj) return null; var R = __pdObj(row.dataset.x); return R && R.o ? R : null; }
  function mkProduct(R){
    var k = R.k, o = R.o;
    if (k === "pv" || k === "pvl" || (o && o.pv === true)) return Promise.resolve({refuse: "사내 사모 라인업은 고객용 한 장에 넣지 않아요"});
    if (k === "krw"){
      var y = yrs(o.mat), A = 1000;
      var kp = [{l: "세후 수익률 (연)", v: o.after != null ? o.after.toFixed(2) + "%" : "–", big: true}, {l: "예금으로 치면", v: o.bank != null ? o.bank.toFixed(2) + "%" : "–", neutral: true}, {l: "표면금리", v: o.cpn != null ? o.cpn + "%" : "–", neutral: true}];
      var tiles = [{l: "1,000만원 넣으면", v: o.after != null ? "약 " + Math.round(A * o.after / 100 * y).toLocaleString() + "만원" : "–", s: "만기까지 세후 이자 합 (대략)"}, {l: "한 해 세후 이자", v: o.after != null ? "약 " + Math.round(A * o.after / 100) + "만원" : "–", s: o.freq ? "한 번에 약 " + Math.round(A * (o.cpn || 0) / 100 / (12 / o.freq) * 0.846) + "만원씩" : ""}, {l: "이자 받는 주기", v: o.freq ? o.freq + "개월마다" : (o.ctype || "–"), s: o.redeem || "만기일시상환"}];
      var RK = {"매우낮은위험": 1, "낮은위험": 2, "보통위험": 3, "다소높은위험": 4, "높은위험": 5, "매우높은위험": 6};
      return gj("archive/x/products.json" + q()).then(function(PD){
        var same = ((PD && PD.krw) || []).filter(function(b){ return b.kind === o.kind && b.after != null; }).sort(function(a, b){ return b.after - a.after; });
        var rank = same.findIndex(function(b){ return b.code === o.code; }), med = same.length ? same[Math.floor(same.length / 2)].after : null;
        var cmp = same.length >= 3 ? {title: "같은 종류(" + o.kind + ") 세후 수익률 — 이 채권은 " + (rank + 1) + "위 / " + same.length + "개", items: [{n: "이 채권", v: o.after}, {n: "같은 종류 중간값", v: med}, {n: "같은 종류 최고", v: same[0].after}, {n: "같은 종류 최저", v: same[same.length - 1].after}], plain: true} : null;
        return {kind: "bond", title: o.name, sub: "원화 채권 · " + o.kind + (o.risk ? " · " + o.risk : "") + (o.issue ? " · 발행 " + o.issue.slice(0, 7).replace("-", ".") : ""), kpis: kp, tiles: tiles, risk: RK[o.risk] || null, riskTitle: "위험 등급 (" + (o.risk || "") + ")",
          timeline: {from: today(), to: o.mat, freq: o.freq, label: y < 1 ? "만기까지 " + Math.round(y * 12) + "개월" : "만기까지 " + y.toFixed(1) + "년"}, cmp: cmp,
          bullets: [o.kind === "국채" ? "대한민국 정부가 갚는 채권이라 부도 걱정은 거의 없어요" : o.kind === "공사채·지방채" ? "공기업·지자체가 발행 — 사실상 정부가 뒤에 있어요" : o.kind === "신종·후순위" ? "은행·금융사가 발행 — 이자가 높은 대신 갚는 순서가 뒤예요" : "회사가 발행한 채권 — 회사가 갚을 힘(신용등급)이 핵심이에요",
            (o.freq ? "이자는 " + o.freq + "개월마다 통장으로, 원금은 만기에 돌려받아요" : "이자와 원금을 만기에 한 번에 받아요"), "「예금으로 치면」은 같은 돈을 예금에 넣었을 때 필요한 세전 금리예요", "중간에 팔 수도 있어요 — 그날 시장 가격으로"],
          note: "세후 수익률은 매수 시점 가격 기준 · 중도 매도 시 가격이 바뀔 수 있어요"};
      });
    }
    if (k === "ust" || k === "aud" || k === "brl"){
      var y2 = yrs(o.mat);
      return Promise.resolve({kind: "bond", title: o.name, sub: (o.kind || "해외 국채") + " · " + (o.cur || ""), kpis: [{l: "만기수익률 (연 · " + (o.cur || "") + ")", v: o.ytm != null ? o.ytm + "%" : "–", big: true}, {l: "표면금리", v: o.cpn != null ? o.cpn + "%" : "–", neutral: true}],
        timeline: {from: today(), to: o.mat, freq: 6, label: "만기까지 " + y2.toFixed(1) + "년"}, bullets: ["원화로 바꾸면 환율만큼 더하거나 빠져요"], note: "환율 변동에 따라 원화 수익이 달라져요"});
    }
    if (k === "els"){
      var bars = (String(o.desc || "").split("(")[0].match(/\d+/g) || []).map(Number), ua = String(o.ua || "").split(/,\s*/).filter(Boolean);
      return gj("archive/x/els_replay.json" + q()).then(function(Rp){
        var key = Rp && Rp.by_id && Rp.by_id[o.isin], st = key && Rp.stats && Rp.stats[key];
        var C = {kind: "els", title: o.n, sub: (o.t || "ELS") + " · " + (o.kind || "") + " · 만기 " + (o.mat || "") + " · " + (o.cyc || "") + "마다 평가", chips: ua,
          kpis: [{l: "연 수익률 (조건 충족 시)", v: o.cpn != null ? o.cpn + "%" : "–", big: true}, {l: "낙인(KI)", v: o.ki != null ? o.ki + "%" : (o.pp >= 100 ? "원금지급형" : "없음"), neutral: true}, {l: "청약 마감", v: o.e ? md(o.e) : "–", neutral: true}],
          steps: bars.length ? {bars: bars, ki: o.ki} : null, note: "조건 미충족 시 원금 손실 가능 · 과거 계산은 미래를 보장하지 않아요"};
        var cycM = parseInt(o.cyc) || 6, bar0 = bars[0], barL = bars[bars.length - 1];
        C.bullets = [cycM + "개월마다 평가 — 기초자산 모두가 처음 가격의 " + bar0 + "% 위면 연 " + (o.cpn != null ? o.cpn : "–") + "% 쿠폰과 함께 상환",
          o.ki != null ? "만기까지 한 번도 " + o.ki + "%(낙인) 아래로 안 가면 마지막 평가는 " + barL + "%만 넘어도 상환" : "만기 평가는 " + barL + "% — 못 넘으면 그만큼 손실",
          "가장 많이 빠진 기초자산 하나가 기준 — 두세 개 중 하나만 무너져도 조건 미충족"];
        if (st && st.n && st.k){ C.prob = {k: st.k, n: st.n};
          var worst = st.worst ? Object.keys(st.worst).sort(function(a, b){ return st.worst[b] - st.worst[a]; })[0] : null;
          C.tiles = [{l: "손실로 끝난 경우", v: (st.loss != null ? st.loss.toFixed(1) : "–") + "%", s: st.loss_avg != null ? "평균 " + st.loss_avg.toFixed(0) + "% · 최악 " + (st.loss_worst || 0).toFixed(0) + "%" : "손실 사례 없음"},
            {l: "1년 안 상환", v: Math.round(st.k[Math.min(st.k.length - 1, Math.max(0, Math.round(12 / cycM) - 1))]) + "%", s: st.from + "년~ " + st.n.toLocaleString() + "번 재생"},
            {l: "발목 잡은 기초자산", v: worst ? worst.slice(0, 8) : "–", s: worst ? "손실 사례의 " + st.worst[worst] + "%" : ""}]; }
        return C;
      });
    }
    if (k === "fund"){
      var rr_ = [["1개월", o.m1], ["3개월", o.m3], ["6개월", o.m6], ["1년", o.y1], ["3년", o.y3], ["5년", o.y5]].filter(function(x){ return x[1] != null; });
      return gj("archive/x/products.json" + q()).then(function(PD){
        var same = ((PD && PD.funds) || []).filter(function(f){ return f.t === o.t && f.y1 != null; }).sort(function(a, b){ return b.y1 - a.y1; });
        var rank = same.findIndex(function(f){ return f.c === o.c; });
        var since = o.est ? String(o.est).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2") : "";
        return {kind: "fund", title: o.n, sub: (o.co || "") + " · " + (o.t || "") + (o.st ? " · " + o.st : "") + (since ? " · 설정 " + since : ""), chips: o.rk ? ["위험 " + o.rk + "등급 (1 높음 ~ 6 낮음)"] : [],
          kpis: [{l: "1년 수익률", v: pct(o.y1), big: true}, {l: "총보수 (연)", v: o.fee != null ? o.fee + "%" : "–", neutral: true}, {l: "선취 수수료", v: o.sfee ? o.sfee + "%" : "없음", neutral: true}],
          tiles: rank >= 0 ? [{l: (o.t || "같은 유형") + " " + same.length + "개 중", v: (rank + 1) + "위", s: "1년 수익률 기준"}, {l: "같은 유형 가운데", v: pct(same[Math.floor(same.length / 2)].y1), s: "1년 수익률 중간값"}] : null,
          risk: o.rk ? +o.rk : null,
          bars: rr_.length ? {title: "기간별 수익률 (보수 차감 후)", items: rr_.map(function(x){ return {n: x[0], v: x[1]}; })} : null,
          bullets: [/채권/.test(o.t || "") ? "채권에 투자해 이자를 쌓는 펀드 — 금리가 오르면 잠깐 흔들릴 수 있어요" : /주식/.test(o.t || "") ? (/해외/.test(o.t) ? "해외 주식에 투자하는 펀드 — 시장과 환율에 따라 움직여요" : "주식에 투자하는 펀드 — 시장이 빠지면 같이 빠져요") : "여러 자산에 나눠 투자하는 펀드예요", "수익률은 보수를 뺀 뒤 숫자예요 · 환매는 보통 며칠 걸려요"],
          note: "기준일 " + (o.d ? String(o.d).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3") : "") + " · 과거 성과는 미래 수익을 보장하지 않아요"};
      });
    }
    return Promise.resolve(null);
  }

  /* ───────────── 그리기 ───────────── */
  var W = 1080, H = 1620, MX = 60, CW = W - MX * 2;
  var INK = "#141414", SUB = "#6a6f7a", MUT = "#9aa0ab", LINE = "#e6e8ec", UP = "#d6453d", DN = "#2f6fdd", ACC = "#1f2d4d", BG = "#f7f7f5", TILE = "#ffffff";
  var F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  function font(g, w, s){ g.font = w + " " + s + "px " + F; }
  function rr(g, x, y, w, h, r, fill){ g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }
  function cls(v){ var n = typeof v === "number" ? v : num(v); return n == null || n === 0 ? INK : n > 0 ? UP : DN; }
  function wrap(g, text, x, y, w, lh, max){
    var out = [], line = "", ch = String(text).split("");
    for (var i = 0; i < ch.length; i++){ var t = line + ch[i]; if (g.measureText(t).width > w && line){ out.push(line); line = ch[i]; } else line = t; }
    if (line) out.push(line);
    if (out.length > (max || 3)){ out = out.slice(0, max || 3); out[out.length - 1] = out[out.length - 1].replace(/.{2}$/, "…"); }
    out.forEach(function(l, i){ g.fillText(l, x, y + i * lh); });
    return out.length * lh;
  }
  function bKpis(g, y, K){
    if (!K || !K.length) return 0;
    var n = Math.min(K.length, 4), gap = 16, w = (CW - gap * (n - 1)) / n, big = K.some(function(k){ return k.big; }), h = big ? 150 : 126;
    K.slice(0, n).forEach(function(k, i){
      var x = MX + i * (w + gap);
      rr(g, x, y, w, h, 20, TILE);
      g.fillStyle = SUB; font(g, 600, 23); wrap(g, k.l, x + 20, y + 40, w - 36, 26, 1);
      var vs = k.big ? 58 : 44, vy = y + (k.big ? 112 : 96);
      g.fillStyle = k.neutral ? INK : cls(k.v); font(g, 800, vs); var vw = g.measureText(k.v).width;
      if (vw > w - 40){ font(g, 800, Math.floor(vs * (w - 40) / vw)); vw = g.measureText(k.v).width; }
      g.fillText(k.v, x + 20, vy);
      if (k.s){ g.fillStyle = MUT; font(g, 500, 21); if (vw + 14 + g.measureText(k.s).width < w - 36) g.fillText(k.s, x + 20 + vw + 12, vy); else g.fillText(k.s, x + 20, vy + 26); }
    });
    return h + 24;
  }
  function bChips(g, y, C){
    if (!C || !C.length) return 0;
    var x = MX; font(g, 600, 24);
    C.forEach(function(c){ var w = g.measureText(c).width + 32; if (x + w > W - MX) return; rr(g, x, y, w, 44, 22, "#e9ecf3"); g.fillStyle = ACC; g.fillText(c, x + 16, y + 30); x += w + 10; });
    return 44 + 22;
  }
  function bBars(g, y, B){
    if (!B || !B.items || !B.items.length) return 0;
    var items = B.items, n = items.length, rowH = 44, lw = 230, bx = MX + lw + 16, bw = CW - lw - 16 - 120;
    var h = 36 + n * rowH + 14; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(B.title, MX + 22, y + 32);
    var mx = Math.max.apply(null, items.map(function(i){ return Math.abs(i.v); }).concat([0.1])), zero = B.plain ? bx : bx + bw / 2;
    items.forEach(function(it, i){
      var yy = y + 36 + i * rowH + 10;
      g.fillStyle = INK; font(g, 600, 24); wrap(g, it.n, MX + 22, yy + 24, lw - 10, 26, 1);
      var len = Math.abs(it.v) / mx * (B.plain ? bw - 6 : bw / 2 - 6);
      g.fillStyle = "#eef0f4"; g.fillRect(bx, yy + 8, bw, 20);
      g.fillStyle = B.plain ? (i === 0 ? ACC : "#9aa0ab") : it.v >= 0 ? UP : DN; g.fillRect(it.v >= 0 ? zero : zero - len, yy + 8, Math.max(2, len), 20);
      g.fillStyle = B.plain ? INK : cls(it.v); font(g, 800, 26); g.textAlign = "right"; g.fillText(B.plain ? (+it.v).toFixed(2) + "%" : pct(it.v), W - MX - 22, yy + 26); g.textAlign = "left";
    });
    return h + 24;
  }
  var COLS = ["#1f2d4d", "#3b5bdb", "#d9a441", "#8a94a8"];
  function bAlloc(g, y, A, big){
    if (!A || !A.length) return 0;
    if (!big){
      var h = 36 + 56 + 6; rr(g, MX, y, CW, h, 20, TILE);
      g.fillStyle = SUB; font(g, 700, 24); g.fillText("오늘의 자산배분 제안", MX + 22, y + 32);
      var x = MX + 22, bw = CW - 44, yy = y + 46;
      A.forEach(function(a, i){ var w = bw * a.pct / 100; g.fillStyle = COLS[i % 4]; g.fillRect(x, yy, w, 22); x += w; });
      x = MX + 22; font(g, 600, 21);
      A.forEach(function(a, i){ g.fillStyle = COLS[i % 4]; g.fillRect(x, yy + 34, 14, 14); g.fillStyle = INK; var t = a.n + " " + a.pct + "%"; g.fillText(t, x + 20, yy + 47); x += g.measureText(t).width + 40; });
      return h + 24;
    }
    var h2 = 20 + A.length * 84 + 10; rr(g, MX, y, CW, h2, 20, TILE);
    A.forEach(function(a, i){
      var yy = y + 20 + i * 84;
      g.fillStyle = INK; font(g, 700, 30); g.fillText(a.n, MX + 22, yy + 30);
      g.fillStyle = COLS[i % 4]; font(g, 800, 36); g.textAlign = "right"; g.fillText(a.pct + "%", W - MX - 22, yy + 32); g.textAlign = "left";
      g.fillStyle = "#eef0f4"; g.fillRect(MX + 22, yy + 42, CW - 44, 14); g.fillStyle = COLS[i % 4]; g.fillRect(MX + 22, yy + 42, (CW - 44) * a.pct / 100, 14);
      if (a.s){ g.fillStyle = MUT; font(g, 500, 21); g.fillText(a.s, MX + 22, yy + 76); }
    });
    return h2 + 24;
  }
  function bLine(g, y, L){
    if (!L) return 0;
    var h = 250; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText((L.from ? L.from + "부터 " : "") + L.la + " vs " + L.lb, MX + 22, y + 32);
    var x0 = MX + 22, x1 = W - MX - 22, y0 = y + 56, y1 = y + h - 44, all = L.a.concat(L.b), mn = Math.min.apply(null, all), mx = Math.max.apply(null, all); if (mx === mn) mx = mn + 1;
    var X = function(i, n){ return x0 + (x1 - x0) * i / Math.max(1, n - 1); }, Y = function(v){ return y1 - (v - mn) / (mx - mn) * (y1 - y0); };
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke();
    [[L.b, "#9aa0ab", 4], [L.a, ACC, 6]].forEach(function(s){ var v = s[0]; g.strokeStyle = s[1]; g.lineWidth = s[2]; g.lineJoin = "round"; g.beginPath(); v.forEach(function(p, i){ i ? g.lineTo(X(i, v.length), Y(p)) : g.moveTo(X(i, v.length), Y(p)); }); g.stroke(); });
    font(g, 700, 22); g.fillStyle = ACC; g.fillText("— " + L.la + " " + pct(L.a[L.a.length - 1]), x0, y + h - 14); g.fillStyle = "#9aa0ab"; g.textAlign = "right"; g.fillText("— " + L.lb + " " + pct(L.b[L.b.length - 1]), x1, y + h - 14); g.textAlign = "left";
    return h + 24;
  }
  function bTiles(g, y, T){
    if (!T || !T.length) return 0;
    var n = T.length, gap = 16, w = (CW - gap * (n - 1)) / n, h = 150;
    T.forEach(function(t, i){ var x = MX + i * (w + gap); rr(g, x, y, w, h, 20, TILE);
      g.fillStyle = SUB; font(g, 600, 23); g.fillText(t.l, x + 22, y + 40);
      g.fillStyle = INK; font(g, 800, 36); wrap(g, t.v, x + 22, y + 90, w - 44, 40, 1);
      if (t.s){ g.fillStyle = MUT; font(g, 500, 21); wrap(g, t.s, x + 22, y + 126, w - 44, 24, 1); } });
    return h + 24;
  }
  function bTimeline(g, y, T){
    if (!T || !T.to) return 0;
    var h = 150; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("언제까지 · " + T.label, MX + 22, y + 32);
    var x0 = MX + 50, x1 = W - MX - 50, yy = y + 84, t0 = Date.parse(T.from + "T00:00:00Z"), t1 = Date.parse(T.to + "T00:00:00Z");
    g.strokeStyle = "#dfe3ea"; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.stroke();
    if (T.freq && t1 > t0 && (t1 - t0) / 2592e6 / T.freq <= 24){ var d = new Date(t1), k = 0; while (k < 400){ d.setUTCMonth(d.getUTCMonth() - T.freq); k++; if (d.getTime() <= t0) break; var x = x0 + (x1 - x0) * (d.getTime() - t0) / (t1 - t0); g.fillStyle = "#d9a441"; g.beginPath(); g.arc(x, yy, 8, 0, 7); g.fill(); } }
    g.fillStyle = ACC; g.beginPath(); g.arc(x0, yy, 13, 0, 7); g.fill(); g.beginPath(); g.arc(x1, yy, 13, 0, 7); g.fill();
    g.fillStyle = INK; font(g, 600, 22); g.fillText("오늘 " + md(T.from), x0 - 30, yy + 46); g.textAlign = "right"; g.fillText("만기 " + T.to, x1 + 30, yy + 46); g.textAlign = "left";
    if (T.freq){ g.fillStyle = MUT; font(g, 500, 20); g.textAlign = "center"; g.fillText((t1 - t0) / 2592e6 / T.freq <= 24 ? "● 이자 받는 날" : T.freq + "개월마다 이자", (x0 + x1) / 2, yy + 46); g.textAlign = "left"; }
    return h + 24;
  }
  function bSteps(g, y, S){
    if (!S || !S.bars || !S.bars.length) return 0;
    var h = 300; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("조기상환 조건 — 평가일에 기초자산이 이 선 위면 상환", MX + 22, y + 32);
    var n = S.bars.length, x0 = MX + 80, x1 = W - MX - 30, y0 = y + 66, y1 = y + h - 54, lo = Math.min(S.ki != null ? S.ki : 100, Math.min.apply(null, S.bars)) - 15, hi = 106;
    var Y = function(v){ return y1 - (v - lo) / (hi - lo) * (y1 - y0); }, cw = (x1 - x0) / n;
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, Y(100)); g.lineTo(x1, Y(100)); g.stroke(); g.fillStyle = MUT; font(g, 500, 20); g.fillText("기준 100", MX + 18, Y(100) + 7);
    S.bars.forEach(function(b, i){ var x = x0 + i * cw; g.fillStyle = "#dbe4ff"; g.fillRect(x + 6, Y(b), cw - 12, y1 - Y(b)); g.strokeStyle = "#3b5bdb"; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 6, Y(b)); g.lineTo(x + cw - 6, Y(b)); g.stroke();
      g.fillStyle = "#3b5bdb"; font(g, 800, 24); g.textAlign = "center"; g.fillText(b + "%", x + cw / 2, Y(b) - 10); g.fillStyle = MUT; font(g, 500, 20); g.fillText(i + 1 === n ? "만기" : (i + 1) + "차", x + cw / 2, y1 + 30); g.textAlign = "left"; });
    if (S.ki != null){ g.strokeStyle = UP; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(x0, Y(S.ki)); g.lineTo(x1, Y(S.ki)); g.stroke(); g.setLineDash([]); g.fillStyle = UP; font(g, 700, 20); g.fillText("낙인 " + S.ki, MX + 18, Y(S.ki) + 7); }
    return h + 24;
  }
  function bProb(g, y, P){
    if (!P || !P.k) return 0;
    var h = 134; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("과거 재생 — 각 평가일까지 상환될 누적 확률 (" + P.n.toLocaleString() + "번)", MX + 22, y + 32);
    var n = P.k.length, x0 = MX + 22, bw = (CW - 44 - (n - 1) * 10) / n;
    P.k.forEach(function(v, i){ var x = x0 + i * (bw + 10); g.fillStyle = "#eef0f4"; g.fillRect(x, y + 50, bw, 22); g.fillStyle = "#3b5bdb"; g.fillRect(x, y + 50, bw * v / 100, 22);
      g.fillStyle = INK; font(g, 700, 21); g.textAlign = "center"; g.fillText(Math.round(v) + "%", x + bw / 2, y + 100); g.fillStyle = MUT; font(g, 500, 18); g.fillText(i + 1 === n ? "만기" : (i + 1) + "차", x + bw / 2, y + 124); g.textAlign = "left"; });
    return h + 24;
  }
  function bRows(g, y, R, mode){   // 이름 · 값(%) · 작은 설명  — 테마·거래대금·집중 ETF·국면 근거·일정
    if (!R || !R.items || !R.items.length) return 0;
    var items = R.items.slice(0, 5), rowH = mode === "text" ? 66 : 62, h = 40 + items.length * rowH + 6; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(R.title, MX + 22, y + 32);
    items.forEach(function(it, i){
      var yy = y + 40 + i * rowH;
      g.fillStyle = INK; font(g, 700, 27); wrap(g, it.n, MX + 22, yy + 28, mode === "text" ? 200 : CW - 180, 30, 1);
      if (it.v != null && mode !== "text"){ g.fillStyle = cls(it.v); font(g, 800, 28); g.textAlign = "right"; g.fillText(typeof it.v === "number" ? pct(it.v) : it.v, W - MX - 22, yy + 29); g.textAlign = "left"; }
      if (mode === "text"){ g.fillStyle = INK; font(g, 600, 25); wrap(g, it.s + (it.v ? "  →  " + it.v : ""), MX + 232, yy + 28, CW - 260, 30, 2); }
      else if (it.s){ g.fillStyle = MUT; font(g, 500, 22); wrap(g, it.s, MX + 22, yy + 54, CW - 60, 24, 1); }
      if (i < items.length - 1){ g.fillStyle = LINE; g.fillRect(MX + 22, yy + rowH - 4, CW - 44, 1); }
    });
    return h + 24;
  }
  function bRisk(g, y, r, title){
    if (!r) return 0;
    var h = 96; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(title || "위험 등급", MX + 22, y + 32);
    var x0 = MX + 160, bw = (CW - 200) / 6;
    for (var i = 1; i <= 6; i++){ var x = x0 + (i - 1) * bw; g.fillStyle = i === r ? (i <= 2 ? UP : i <= 4 ? "#d9a441" : "#3fb950") : "#eef0f4"; rr(g, x + 3, y + 48, bw - 6, 26, 8, g.fillStyle); g.fillStyle = i === r ? "#fff" : MUT; font(g, 700, 20); g.textAlign = "center"; g.fillText(i === 1 ? "1 높음" : i === 6 ? "6 낮음" : String(i), x + bw / 2, y + 67); g.textAlign = "left"; }
    return h + 24;
  }
  function bBullets(g, y, B, title){
    if (!B || !B.length) return 0;
    var lines = B.slice(0, 4), lh = 40, est = 0; font(g, 600, 29);
    lines.forEach(function(t){ est += Math.min(3, Math.ceil(g.measureText("·  " + t).width / (CW - 60))) * lh + 12; });
    var h = (title ? 44 : 18) + est + 4; rr(g, MX, y, CW, h, 20, TILE);
    var yy = y + (title ? 44 : 18);
    if (title){ g.fillStyle = SUB; font(g, 700, 24); g.fillText(title, MX + 22, y + 32); }
    lines.forEach(function(t){ g.fillStyle = INK; font(g, 600, 29); yy += wrap(g, "·  " + t, MX + 22, yy + 30, CW - 60, lh, 3) + 12; });
    return h + 24;
  }
  function bEvents(g, y, E){
    if (!E || !E.length) return 0;
    var t = "📅 오늘  " + E.join("  ·  "); font(g, 600, 25);
    var n = Math.min(2, Math.ceil(g.measureText(t).width / (CW - 44))), h = 20 + n * 34; rr(g, MX, y, CW, h, 16, "#eef1f7");
    g.fillStyle = ACC; wrap(g, t, MX + 22, y + 36, CW - 44, 34, 2);
    return h + 24;
  }
  function draw(C, name){
    var c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d");
    g.fillStyle = BG; g.fillRect(0, 0, W, H);
    var d = kst(), y = 70;
    g.fillStyle = MUT; font(g, 600, 24); g.fillText(d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일", MX, y);
    if (name){ g.textAlign = "right"; g.fillStyle = SUB; font(g, 700, 24); g.fillText(name, W - MX, y); g.textAlign = "left"; }
    y += 20; g.fillStyle = INK; font(g, 800, 52); y += wrap(g, C.title, MX, y + 52, CW, 60, 2);
    if (C.sub){ g.fillStyle = SUB; font(g, 500, 26); y += wrap(g, C.sub, MX, y + 36, CW, 34, 2) + 6; }
    y += 24;
    var blocks;
    if (C.kind === "market") blocks = [["kpis", C.kpis], ["kpis", C.kpis2], ["chips", C.chips], ["events", C.events], ["bars", C.bars], ["bullets", C.bullets, "고객에게 할 말"], ["rows", C.themes], ["rows", C.focus], ["alloc", C.alloc, false], ["rows", C.vol]];
    else if (C.kind === "port") blocks = [["chips", C.chips], ["alloc", C.alloc, true], ["line", C.line], ["kpis", C.kpis], ["rows", C.why, "text"], ["bullets", C.bullets], ["rows", C.sched, "text"]];
    else if (C.kind === "bond") blocks = [["kpis", C.kpis], ["timeline", C.timeline], ["tiles", C.tiles], ["risk", C.risk, C.riskTitle], ["bars", C.cmp], ["bullets", C.bullets]];
    else if (C.kind === "els") blocks = [["chips", C.chips], ["kpis", C.kpis], ["steps", C.steps], ["prob", C.prob], ["tiles", C.tiles], ["bullets", C.bullets]];
    else blocks = [["chips", C.chips], ["kpis", C.kpis], ["risk", C.risk], ["bars", C.bars], ["tiles", C.tiles], ["bullets", C.bullets]];
    var FN = {kpis: bKpis, chips: bChips, bars: bBars, bullets: bBullets, events: bEvents, alloc: bAlloc, line: bLine, tiles: bTiles, timeline: bTimeline, steps: bSteps, prob: bProb, rows: bRows, risk: bRisk};
    var c2 = document.createElement("canvas"); c2.width = W; c2.height = H; var g2 = c2.getContext("2d");   // 먼저 재 보고 들어갈 때만 그림
    blocks.forEach(function(b){ if (!b[1]) return; var hh = FN[b[0]](g2, 0, b[1], b[2]) || 0; if (!hh || y + hh > H - 104) return; FN[b[0]](g, y, b[1], b[2]); y += hh; });
    g.fillStyle = LINE; g.fillRect(MX, H - 96, CW, 2);
    g.fillStyle = MUT; font(g, 500, 21);
    wrap(g, (C.note ? C.note + " · " : "") + "참고용 자료 · 과거 성과는 미래 수익을 보장하지 않아요 · 투자 판단과 책임은 본인에게 있어요", MX, H - 58, CW, 28, 2);
    return c;
  }

  /* ───────────── 공유 ───────────── */
  function share(c, title){
    return new Promise(function(res){ c.toBlob(function(b){ res(b); }, "image/png"); }).then(function(b){
      if (!b) throw new Error("blob");
      var f = new File([b], (title || "한장").replace(/[^\w가-힣]+/g, "_").slice(0, 30) + "_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", {type: "image/png"});
      if (navigator.canShare && navigator.canShare({files: [f]})) return navigator.share({files: [f], title: title}).catch(function(e){ if (e && e.name !== "AbortError") throw e; });
      var u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = f.name; a.target = "_blank"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 30000);
      toast("그림을 저장했어요 — 사진에서 보내세요");
    });
  }
  function go(R){
    var k = cur(), p = R ? mkProduct(R) : (k === "port" ? mkPort() : (k === "home" || k === "market") ? mkMarket() : null);
    if (!p){ if (TABS[k] === "상품") toast("보낼 상품을 하나 펼친 뒤 눌러 주세요"); else toast("이 화면은 한 장으로 못 만들어요"); return; }
    toast("한 장 만드는 중…");
    p.then(function(C){
      if (!C){ toast("자료를 못 가져왔어요"); return; }
      if (C.refuse){ toast(C.refuse); return; }
      var nm = pbname(); return share(draw(C, nm), C.title);
    }).catch(function(e){ console.warn(e); toast("만들지 못했어요"); });
  }

  /* ───────────── 단추 ───────────── */
  function fab(){
    var k = cur(), b = document.getElementById("opbtn");
    if (!TABS[k] || document.getElementById("sheet")){ if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement("button"); b.id = "opbtn"; b.type = "button"; b.innerHTML = "📨 <span>고객에게</span>"; b.setAttribute("aria-label", "고객에게 보내기 — 한 장");
    b.onclick = function(ev){ ev.stopPropagation(); go(TABS[cur()] === "상품" ? selected() : null); };
    document.body.appendChild(b);
  }
  function rowBtns(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot .pd-tap.on > .pd-x:not([data-op1])"), function(p){
      p.setAttribute("data-op1", "1"); var row = p.parentNode, R = __pdObj(row.dataset.x); if (!R || !R.o) return;
      if (R.k === "pv" || R.k === "pvl" || R.o.pv === true) return;
      var b = document.createElement("button"); b.className = "em-add op-row"; b.type = "button"; b.textContent = "📨 이 상품 고객에게 보내기";
      b.onclick = function(ev){ ev.stopPropagation(); go(R); }; p.appendChild(b);
    });
  }
  var css = document.createElement("style");
  css.textContent = "#opbtn{position:fixed;left:16px;bottom:calc(env(safe-area-inset-bottom) + 74px);z-index:80;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:rgba(18,24,38,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--text);font:inherit;font-size:14px;font-weight:800;padding:9px 14px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.45)}" +
    "#opbtn span{font-size:14px}:root[data-ui=light] #opbtn{background:#fff;color:#141a26;border-color:#dde2ea}#opbtn:active{transform:scale(.96)}.op-row{margin-top:8px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { fab(); } catch(x) {} try { rowBtns(); } catch(x) {} }, 300); }
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
  window.addEventListener("hashchange", soon);
  window.__onepage = {go: go, draw: draw, _mkProduct: mkProduct, _mkPort: mkPort, _mkMarket: mkMarket};
  soon();
})();
