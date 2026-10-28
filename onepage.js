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
  function kospiHist(){   // 최근 25거래일 코스피 종가 (port_px) — 한 달 흐름 선
    return gj("archive/x/port_px/index.json" + q()).then(function(ix){ var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return gj("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, "")).then(function(j){ if (!j || !j.dd) return null; var c = j.c.slice(-25).map(Number); return c; }); }).catch(function(){ return null; });
  }
  // 🌐 시장 한 장 — 고객이 한눈에: 코스피 큰 숫자+오늘 흐름+한 달 흐름 · 세계 시장 타일 · 업종 열지도 · 시장 온도(오른 종목) · 테마 · 환율·유가·금 · 일정 · 자산배분
  function mkMarket(){
    var it = latest("market");
    return Promise.all([window.__pbbrief ? __pbbrief() : null, gj("archive/x/live_kr.json" + q()), gj("archive/x/live_us_pre.json" + q()), it ? gj(file("market", it.id, "data.json")) : null, gj(RAWM + "ledger/ledger.json"), kospiHist()]).then(function(r){
      var PB = r[0], L = r[1], U = r[2], D = r[3] || {}, LG = r[4], KH = r[5];
      var live = !!(L && L.date === today() && L.index && L.index.length), liveMode = !!(PB && PB.mode === "장중" && live);
      var ix = {}; (live ? L.index : []).forEach(function(x){ ix[x.name] = x; });
      var ks = ix["코스피"] || {}, kq = ix["코스닥"] || {};
      var snaps = live ? (L.snaps || []).map(function(x){ return {t: x[0], k: x[3], q: x[4]}; }) : [];
      var hero = live ? {name: "코스피", last: ks.last, chg: ks.chg, sub: "코스닥 " + pct(kq.chg) + (kq.last ? " · " + Math.round(kq.last).toLocaleString() : ""), intra: snaps.length >= 3 ? snaps : null, hist: KH, t: L.t} : null;
      var fut = U && U.date === today() ? (U.fut || []) : [], mac = U && U.date === today() ? (U.macro || []) : [], wd = U && U.date === today() ? (U.world || []) : [];
      var F = function(arr, nm){ return arr.filter(function(f){ return f.name === nm; })[0]; };
      var world = [];
      var es = F(fut, "S&P500 선물"), nq = F(fut, "나스닥100 선물");
      if (es) world.push({f: "🇺🇸", n: "미국 선물", v: es.chg, s: nq ? "나스닥 " + pct(nq.chg) : ""});
      [["🇯🇵", "닛케이225", "일본"], ["🇭🇰", "항셍", "홍콩"], ["🇨🇳", "상해종합", "중국"], ["🇪🇺", "유로스톡스50", "유럽"], ["🇮🇳", "인도 니프티", "인도"]].forEach(function(w){ var x = F(wd, w[1]); if (x && world.length < 6) world.push({f: w[0], n: w[2] + (x.st === "prev" ? " · 전일" : ""), v: x.chg}); });
      var heat = live ? (L.sectors || []).filter(function(x){ return x.n >= 5; }).map(function(x){ var nm = x.name.replace(/\(.*?\)/g, ""); if (nm.length > 6) nm = nm.split("·")[0]; return {n: nm.slice(0, 7), ic: x.icon || "", v: x.r}; }) : [];
      var gauge = live && L.total ? {up: L.up, down: L.down, flat: L.flat, total: L.total, lu: L.limit_up || 0, ld: L.limit_dn || 0} : null;
      var themes = live ? (L.themes || []).slice(0, 3).map(function(t){ return {n: t.name.replace(/\(.*?\)/g, "").slice(0, 10), v: t.r, s: (t.lead || []).slice(0, 3).map(function(x){ return x.n; }).join(" · ")}; }) : [];
      var k2 = [];
      [["원/달러", "원/달러"], ["WTI", "유가 WTI"], ["금", "금"], ["미 10년물 국채 선물", "미 10년 국채"]].forEach(function(w){ var x = F(mac, w[0]); if (x) k2.push({l: w[1], v: pct(x.chg), s: x.last && w[0] === "원/달러" ? Math.round(x.last).toLocaleString() + "원" : ""}); });
      var reg = (PB && PB.regime) || "";
      var chips = reg ? reg.split("·").map(function(x){ return x.trim(); }).filter(Boolean) : [];
      var ev = (PB && PB.events) || [];
      var al = (LG && LG.allocation || []).filter(function(a){ return a.pct > 0; });
      if (!al.length) (D.allocation_seen || []).forEach(function(a, i){ var m = /([\d.]+)/.exec(a.verdict || ""); if (m && +m[1] > 0) al.push({name: ["S&P500", "나스닥100", "금", "현금"][i] || "", pct: +m[1]}); });
      var lab = live ? (L.t || "") + " 장중" : (PB && PB.label) || (md(D.date) + " 아침");
      var top2 = heat.slice().sort(function(a, b){ return b.v - a.v; }).slice(0, 2).map(function(x){ return x.n; }).join("·");
      var word = !live ? "" : ks.chg >= 3 ? "급등" : ks.chg >= 1 ? "강세" : ks.chg > -1 ? "보합" : ks.chg > -3 ? "약세" : "급락";
      var head = live ? "코스피 " + pct(ks.chg) + " " + word + (top2 ? " · " + top2 + " 주도" : "") + (gauge ? " · 종목 " + Math.round(gauge.up / gauge.total * 100) + "% 상승" : "") : (D.one_liner ? strip(D.one_liner).split(" — ")[0].slice(0, 44) : "");
      return {kind: "market", title: liveMode ? "지금 시장 한 장" : "오늘 시장 한 장", sub: lab + (head ? " · " + head : ""),
        advice: PB && PB.advice && PB.asof && PB.asof.slice(0, 10) === today() ? Object.assign({}, PB.advice, {watch: liveWatch(PB.advice.watch)}) : null,
        hero: hero, world: world.length ? world : null, heat: heat.length >= 8 ? heat : null, gauge: gauge, chips: chips, events: ev,
        themes: themes.length ? {title: "오늘 뜨는 테마 — 대장주", items: themes} : null, kpis2: k2.slice(0, 4),
        alloc: al.length ? al.map(function(a){ return {n: a.name.replace(" 코어", ""), pct: a.pct}; }) : null,
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
        bullets: ["주식 비중은 미국 대표 지수(S&P500·나스닥100) ETF로, 시장이 꺾이면(S&P500이 200일 평균 아래) 주식을 줄이고 금·현금을 늘려요", "레버리지·개별 종목 없이 한국에서 살 수 있는 ETF만 써요"],
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
  var W = 1080, H = 1620, MX = 60, CW = W - MX * 2;   // 시장 한 장은 1920 (코멘트까지)
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
  function nLines(g, text, w, max){ var n = 0, line = "", ch = String(text).split(""); for (var i = 0; i < ch.length; i++){ var t = line + ch[i]; if (g.measureText(t).width > w && line){ n++; line = ch[i]; } else line = t; } if (line) n++; return Math.min(n, max || 3); }
  function liveWatch(W_){   // 이미 지난 오늘 일정(「09시 …」)은 빼기
    var hh = kst().getUTCHours();
    return (W_ || []).map(function(w){ if (w[0] !== "오늘") return w; var parts = String(w[1]).split(" · ").filter(function(x){ var m = /^(\d{1,2})시/.exec(x.trim()); return !m || +m[1] > hh; }); return parts.length ? [w[0], parts.join(" · ")] : null; }).filter(Boolean);
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
  function bHero(g, y, Hh){
    if (!Hh) return 0;
    var h = 300; rr(g, MX, y, CW, h, 24, TILE);
    g.fillStyle = SUB; font(g, 600, 26); g.fillText(Hh.name + (Hh.t ? "  " + Hh.t : ""), MX + 28, y + 46);
    g.fillStyle = cls(Hh.chg); font(g, 800, 96); var v = pct(Hh.chg); g.fillText(v, MX + 28, y + 150);
    g.fillStyle = INK; font(g, 700, 34); g.fillText(Hh.last ? Math.round(Hh.last).toLocaleString() : "", MX + 28, y + 200);
    g.fillStyle = SUB; font(g, 500, 24); g.fillText(Hh.sub || "", MX + 28, y + 240);
    // 오른쪽: 오늘 흐름(10분마다) 또는 한 달 흐름
    var x0 = MX + 470, x1 = W - MX - 28, y0 = y + 60, y1 = y + 236;
    var ser = Hh.intra ? Hh.intra.map(function(p){ return p.k; }) : null, lab = "오늘 흐름 (전일 대비 %)";
    if (!ser && Hh.hist && Hh.hist.length > 5){ ser = Hh.hist; lab = "최근 한 달 흐름"; }
    if (ser){
      var mn = Math.min.apply(null, ser), mx = Math.max.apply(null, ser); if (Hh.intra){ mn = Math.min(mn, 0); mx = Math.max(mx, 0); } if (mx === mn) mx = mn + 1;
      var X = function(i){ return x0 + (x1 - x0) * i / Math.max(1, ser.length - 1); }, Y = function(v){ return y1 - (v - mn) / (mx - mn) * (y1 - y0); };
      g.fillStyle = SUB; font(g, 600, 22); g.fillText(lab, x0, y + 44);
      if (Hh.intra){ g.strokeStyle = LINE; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke(); g.setLineDash([]); }
      var col = ser[ser.length - 1] >= (Hh.intra ? 0 : ser[0]) ? UP : DN;
      g.beginPath(); ser.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.lineTo(X(ser.length - 1), y1); g.lineTo(x0, y1); g.closePath(); g.fillStyle = col === UP ? "rgba(214,69,61,.12)" : "rgba(47,111,221,.12)"; g.fill();
      g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = "round"; g.beginPath(); ser.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(X(ser.length - 1), Y(ser[ser.length - 1]), 8, 0, 7); g.fill();
      g.fillStyle = MUT; font(g, 500, 20); g.fillText(Hh.intra ? Hh.intra[0].t : "한 달 전", x0, y1 + 28); g.textAlign = "right"; g.fillText(Hh.intra ? Hh.intra[Hh.intra.length - 1].t : "오늘", x1, y1 + 28); g.textAlign = "left";
      if (!Hh.intra){ var r1 = (ser[ser.length - 1] / ser[0] - 1) * 100; g.fillStyle = cls(r1); font(g, 700, 22); g.textAlign = "right"; g.fillText("한 달 " + pct(r1), x1, y + 44); g.textAlign = "left"; }
    }
    if (Hh.intra && Hh.hist && Hh.hist.length > 5){ var r2 = (Hh.hist[Hh.hist.length - 1] / Hh.hist[0] - 1) * 100; g.fillStyle = SUB; font(g, 600, 22); g.fillText("최근 한 달 " , MX + 28, y + 276); g.fillStyle = cls(r2); font(g, 800, 22); g.fillText(pct(r2), MX + 28 + 112, y + 276); }
    return h + 24;
  }
  function bWorld(g, y, Wd){
    if (!Wd || !Wd.length) return 0;
    var n = Math.min(6, Wd.length), gap = 12, w = (CW - gap * (n - 1)) / n, h = 138;
    Wd.slice(0, n).forEach(function(x, i){ var xx = MX + i * (w + gap), bg = x.v == null || x.v === 0 ? "#eef0f4" : x.v > 0 ? "rgba(214,69,61,.10)" : "rgba(47,111,221,.10)";
      rr(g, xx, y, w, h, 18, bg);
      font(g, 600, 28); g.fillStyle = INK; g.fillText(x.f, xx + 14, y + 38);
      g.fillStyle = SUB; font(g, 600, 20); wrap(g, x.n, xx + 14, y + 68, w - 22, 22, 1);
      g.fillStyle = cls(x.v); font(g, 800, 34); g.fillText(pct(x.v), xx + 14, y + 110);
      if (x.s){ g.fillStyle = MUT; font(g, 500, 18); wrap(g, x.s, xx + 14, y + 130, w - 22, 20, 1); } });
    return h + 24;
  }
  function bHeat(g, y, Hm){
    if (!Hm || Hm.length < 8) return 0;
    var srt = Hm.slice().sort(function(a, b){ return b.v - a.v; }), items = srt.length > 18 ? srt.slice(0, 12).concat(srt.slice(-6)) : srt, cols = 6, rows = Math.ceil(items.length / cols), gap = 8, w = (CW - gap * (cols - 1)) / cols, th = 76, h = 40 + rows * (th + gap) + 8;
    rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("업종 열지도 — 강한 12 · 약한 6 (빨강 오름 · 파랑 내림)", MX + 22, y + 32);
    var mx = Math.max.apply(null, items.map(function(i){ return Math.abs(i.v); }).concat([1]));
    items.forEach(function(it, i){ var c = i % cols, r = Math.floor(i / cols), x = MX + 22 + c * (w + gap) - 22 + 22, yy = y + 44 + r * (th + gap);
      x = MX + 12 + c * (w - 4 + gap) ; var ww = w - 4;
      var a = Math.min(1, 0.18 + Math.abs(it.v) / mx * 0.82), bg = it.v > 0 ? "rgba(214,69,61," + a.toFixed(2) + ")" : it.v < 0 ? "rgba(47,111,221," + a.toFixed(2) + ")" : "#e6e8ec";
      rr(g, x, yy, ww, th, 12, bg);
      var dark = a > 0.5; g.fillStyle = dark ? "#fff" : INK; font(g, 700, 20); wrap(g, it.n, x + 10, yy + 30, ww - 16, 22, 1);
      font(g, 800, 24); g.fillText(pct(it.v), x + 10, yy + 62); });
    return h + 24;
  }
  function bGauge(g, y, G, T){
    if (!G) return 0;
    var h = 150; rr(g, MX, y, CW, h, 20, TILE);
    var upr = Math.round(G.up / G.total * 100), dnr = Math.round(G.down / G.total * 100);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("시장 온도 — 오늘 오른 종목 " + upr + "% (" + G.total.toLocaleString() + "개 중)", MX + 22, y + 32);
    var x0 = MX + 22, bw = CW - 44, yy = y + 52;
    g.fillStyle = DN; rr(g, x0, yy, bw, 30, 15, DN); g.fillStyle = "#c9ced8"; g.fillRect(x0 + bw * upr / 100, yy, bw * (100 - upr - dnr) / 100, 30); g.fillStyle = UP; rr(g, x0, yy, bw * upr / 100, 30, 15, UP); g.fillRect(x0 + 15, yy, Math.max(0, bw * upr / 100 - 15), 30);
    g.fillStyle = "#fff"; font(g, 800, 22); g.fillText("오름 " + upr + "%", x0 + 14, yy + 22); g.textAlign = "right"; g.fillText("내림 " + dnr + "%", x0 + bw - 14, yy + 22); g.textAlign = "left";
    var mood = upr >= 70 ? "🔥 거의 다 오르는 날" : upr >= 55 ? "🙂 오르는 종목이 더 많아요" : upr >= 45 ? "😐 반반이에요" : upr >= 30 ? "😟 내리는 종목이 더 많아요" : "🥶 거의 다 내리는 날";
    g.fillStyle = INK; font(g, 700, 26); g.fillText(mood, x0, y + 122);
    g.fillStyle = MUT; font(g, 500, 22); g.textAlign = "right"; g.fillText("상한가 " + G.lu + " · 하한가 " + G.ld, x0 + bw, y + 122); g.textAlign = "left";
    return h + 24;
  }
  function bAdvice(g, y, A, name){   // 📌 PB 코멘트 — 지금 해석 · 앞으로 볼 것 · 이렇게 대응
    if (!A || !A.read) return 0;
    var pad = 28, tw = CW - pad * 2 - 8, yy, h;
    var measure = function(t, sz, mx){ font(g, 600, sz); return nLines(g, t, tw, mx); };
    var RL = A.maxRead || 3, nRead = measure(A.read, 30, RL), nPlan = 0; (A.plan || []).forEach(function(p){ nPlan += measure("✓ " + p, 26, 2); });
    h = 70 + nRead * 42 + 22 + (A.watch && A.watch.length ? 44 + A.watch.length * 40 + 16 : 0) + (nPlan ? 44 + nPlan * 36 + (A.plan.length * 8) : 0) + 20;
    rr(g, MX, y, CW, h, 24, "#1f2d4d");
    g.fillStyle = "#d9a441"; g.fillRect(MX, y + 24, 8, 44);
    g.fillStyle = "#fff"; font(g, 800, 30); g.fillText("📌 " + (name ? name + "의 " : "PB ") + "코멘트" + (A.title ? " — " + A.title : " — 그래서 앞으로"), MX + pad, y + 56);
    yy = y + 70;
    g.fillStyle = "#f3f5fa"; font(g, 600, 30); yy += wrap(g, A.read, MX + pad, yy + 34, tw, 42, RL) + 22;
    if (A.watch && A.watch.length){
      g.fillStyle = "#d9a441"; font(g, 800, 24); g.fillText("앞으로 볼 일정", MX + pad, yy + 26); yy += 44;
      A.watch.forEach(function(w){ rr(g, MX + pad, yy + 4, 150, 32, 16, "rgba(255,255,255,.12)"); g.fillStyle = "#fff"; font(g, 700, 21); g.textAlign = "center"; g.fillText(w[0], MX + pad + 75, yy + 27); g.textAlign = "left";
        g.fillStyle = "#e6e9f2"; font(g, 600, 24); wrap(g, w[1], MX + pad + 166, yy + 28, tw - 166, 28, 1); yy += 40; });
      yy += 16;
    }
    if (A.plan && A.plan.length){
      g.fillStyle = "#d9a441"; font(g, 800, 24); g.fillText("이렇게 대응해요", MX + pad, yy + 26); yy += 44;
      A.plan.forEach(function(p){ g.fillStyle = "#fff"; font(g, 600, 26); yy += wrap(g, "✓ " + p, MX + pad, yy + 26, tw, 36, 2) + 8; });
    }
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
    H = C.kind === "market" ? 2160 : C.kind === "stock" ? 2400 : 1620;
    var c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d");
    g.fillStyle = BG; g.fillRect(0, 0, W, H);
    var d = kst(), y = 70;
    if (C.kind === "stock"){   // 그림 머리 (회사 사진 · 없으면 업종 그림 + 1년 주가 물결)
      var bh = 300, im = C.img;
      g.save(); g.beginPath(); g.rect(0, 0, W, bh); g.clip();
      if (im){ var sc = Math.max(W / im.width, bh / im.height), iw = im.width * sc, ih = im.height * sc; g.drawImage(im, (W - iw) / 2, (bh - ih) / 2, iw, ih); }
      else {
        var bg = g.createLinearGradient(0, 0, W, bh); bg.addColorStop(0, "#1b2a6b"); bg.addColorStop(1, "#3b5bdb"); g.fillStyle = bg; g.fillRect(0, 0, W, bh);
        var wv = (C.chart && C.chart.v) || []; if (wv.length > 5){ var mn = Math.min.apply(null, wv), mx = Math.max.apply(null, wv);
          g.beginPath(); wv.forEach(function(v, i){ var xx = i / (wv.length - 1) * W, yy = bh - 30 - (v - mn) / (mx - mn || 1) * (bh - 110); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); });
          g.lineTo(W, bh); g.lineTo(0, bh); g.closePath(); g.fillStyle = "rgba(255,255,255,.10)"; g.fill(); }
        g.globalAlpha = .9; font(g, 400, 150); g.textAlign = "right"; g.fillText(C.emoji || "🏢", W - MX, 200); g.textAlign = "left"; g.globalAlpha = 1;
      }
      var gr = g.createLinearGradient(0, 0, 0, bh); gr.addColorStop(0, "rgba(10,16,30,.25)"); gr.addColorStop(1, "rgba(10,16,30,.85)"); g.fillStyle = gr; g.fillRect(0, 0, W, bh); g.restore();
      g.fillStyle = "rgba(255,255,255,.85)"; font(g, 600, 24); g.fillText(d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일", MX, 56);
      if (name){ g.textAlign = "right"; font(g, 700, 24); g.fillText(name, W - MX, 56); g.textAlign = "left"; }
      g.fillStyle = "#fff"; font(g, 800, 56); wrap(g, C.title, MX, bh - 70, CW, 60, 1);
      g.fillStyle = "rgba(255,255,255,.85)"; font(g, 500, 26); wrap(g, C.sub || "", MX, bh - 28, CW, 30, 1);
      y = bh + 30;
      var blocksI = [["chips", C.chips], ["kpis", C.kpis], ["chart", C.chart], ["glance", C.glance], ["news", C.news], ["advice", C.advice, name], ["dna5", C.dna], ["anl", C.anl]];
      var FNI = {kpis: bKpis, chips: bChips, chart: bChart, glance: bGlance, news: bNews, advice: bAdvice, dna5: bDna5, anl: bAnl};
      var cI = document.createElement("canvas"); cI.width = W; cI.height = H; var gI = cI.getContext("2d");
      blocksI.forEach(function(b){ if (!b[1]) return; var hh = FNI[b[0]](gI, 0, b[1], b[2]) || 0; if (!hh || y + hh > H - 104) return; FNI[b[0]](g, y, b[1], b[2]); y += hh; });
      if (y + 130 < H){   // 내용만큼만 — 아래 빈 화면 없게
        var c2 = document.createElement("canvas"); c2.width = W; c2.height = Math.max(1500, y + 130); var g2 = c2.getContext("2d");
        g2.fillStyle = BG; g2.fillRect(0, 0, W, c2.height); g2.drawImage(c, 0, 0, W, y, 0, 0, W, y); c = c2; g = c2.getContext("2d"); H = c2.height;
      }
      g.fillStyle = LINE; g.fillRect(MX, H - 96, CW, 2); g.fillStyle = MUT; font(g, 500, 21);
      wrap(g, (C.note ? C.note + " · " : "") + "참고용 자료 · 과거 성과는 미래 수익을 보장하지 않아요 · 투자 판단과 책임은 본인에게 있어요", MX, H - 58, CW, 28, 2);
      return c;
    }
    g.fillStyle = MUT; font(g, 600, 24); g.fillText(d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일", MX, y);
    if (name){ g.textAlign = "right"; g.fillStyle = SUB; font(g, 700, 24); g.fillText(name, W - MX, y); g.textAlign = "left"; }
    y += 20; g.fillStyle = INK; font(g, 800, 52); y += wrap(g, C.title, MX, y + 52, CW, 60, 2);
    if (C.sub){ g.fillStyle = SUB; font(g, 500, 26); y += wrap(g, C.sub, MX, y + 36, CW, 34, 2) + 6; }
    y += 24;
    var blocks;
    if (C.kind === "market") blocks = [["hero", C.hero], ["world", C.world], ["heat", C.heat], ["gauge", C.gauge], ["advice", C.advice, name], ["kpis", C.kpis2], ["rows", C.themes], ["alloc", C.alloc, false]];
    else if (C.kind === "port") blocks = [["chips", C.chips], ["alloc", C.alloc, true], ["line", C.line], ["kpis", C.kpis], ["rows", C.why, "text"], ["bullets", C.bullets], ["rows", C.sched, "text"]];
    else if (C.kind === "bond") blocks = [["kpis", C.kpis], ["timeline", C.timeline], ["tiles", C.tiles], ["risk", C.risk, C.riskTitle], ["bars", C.cmp], ["bullets", C.bullets]];
    else if (C.kind === "els") blocks = [["chips", C.chips], ["kpis", C.kpis], ["steps", C.steps], ["prob", C.prob], ["tiles", C.tiles], ["bullets", C.bullets]];
    else if (C.kind === "stock") blocks = [["chips", C.chips], ["kpis", C.kpis], ["chart", C.chart], ["glance", C.glance], ["news", C.news], ["advice", C.advice, name], ["dna5", C.dna], ["anl", C.anl]];
    else if (C.kind === "myels") blocks = [["kpis", C.kpis], ["ua", C.uabars], ["advice", C.advice, name], ["steps", C.steps]];
    else blocks = [["chips", C.chips], ["kpis", C.kpis], ["risk", C.risk], ["bars", C.bars], ["tiles", C.tiles], ["bullets", C.bullets]];
    var FN = {kpis: bKpis, chips: bChips, bars: bBars, bullets: bBullets, events: bEvents, alloc: bAlloc, line: bLine, tiles: bTiles, timeline: bTimeline, steps: bSteps, prob: bProb, rows: bRows, risk: bRisk, hero: bHero, world: bWorld, heat: bHeat, gauge: bGauge, advice: bAdvice, chart: bChart, dna: bDna, anl: bAnl, ua: bUa, glance: bGlance, news: bNews, dna5: bDna5};
    var c2 = document.createElement("canvas"); c2.width = W; c2.height = H; var g2 = c2.getContext("2d");   // 먼저 재 보고 들어갈 때만 그림
    blocks.forEach(function(b){ if (!b[1]) return; var hh = FN[b[0]](g2, 0, b[1], b[2]) || 0; if (!hh || y + hh > H - 104) return; FN[b[0]](g, y, b[1], b[2]); y += hh; });
    g.fillStyle = LINE; g.fillRect(MX, H - 96, CW, 2);
    g.fillStyle = MUT; font(g, 500, 21);
    wrap(g, (C.note ? C.note + " · " : "") + "참고용 자료 · 과거 성과는 미래 수익을 보장하지 않아요 · 투자 판단과 책임은 본인에게 있어요", MX, H - 58, CW, 28, 2);
    return c;
  }


  /* ───────────── ⭐ 관심종목 · 📌 내 고객 상품 · 🎯 내 ELS → 한 장씩 (10/28 12:50 「관심종목 포함」) ───────────── */
  var OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function oj(path){ return gj(OPD + path); }
  var DNAP = null, SIGP = null;
  function dnaOf(sym){ if (!DNAP) DNAP = oj("dna.json").then(function(j){ var m = {}; ((j && j.rows) || []).forEach(function(r){ m[r[0]] = r; }); return m; }).catch(function(){ return {}; }); return DNAP.then(function(m){ return m[sym] || null; }); }
  function sigOf(sym){ if (!SIGP) SIGP = gj(RAWM + "market/sigindex.json").then(function(j){ return (j && j.ix) || {}; }).catch(function(){ return {}; }); return SIGP.then(function(m){ var c = sym.split(".")[0]; return m[sym] || m[c] || null; }); }
  function pxOf(code){ return window.V && V.price ? V.price(code).catch(function(){ return null; }) : Promise.resolve(null); }
  function fullSym(code, p){ if (/^\d{6}$/.test(code)){ return pxOf(code).then(function(){ return code; }); } return Promise.resolve(code); }
  function josa(w){ var c = String(w).slice(-1), k = c.charCodeAt(0); if (k >= 0xAC00 && k <= 0xD7A3) return w + ((k - 0xAC00) % 28 ? "은" : "는"); return w + "은(는)"; }
  function wlItems(){ var W = (window.store && store.wl) || {}; return Object.keys(W).map(function(k){ var w = W[k]; return {kind: "stock", id: w.s || k, nm: w.n || k}; }); }
  function pinItems(){
    var L = []; try { L = JSON.parse(localStorage.getItem("cpin") || "[]") || []; } catch(x) {}
    var E = []; try { E = JSON.parse(localStorage.getItem("elsmy") || "[]") || []; } catch(x) {}
    return L.map(function(p){ return {kind: p.k === "fund" ? "fund" : "bond", k: p.k, id: p.id, nm: p.nm, pin: p}; }).concat(E.map(function(e){ return {kind: "myels", id: e.id, nm: e.nm, it: e}; }));
  }
  // 종목 한 장 (10/28 13:02 「디자인·그림·가독성 · 주가랑 뉴스가 어제꺼」 → 사진 머리 · 실시간 가격(wl_live.json, 10분마다) · 한눈에 4칸 · 오늘 뉴스 · 코멘트 · 점수·증권사)
  function loadImg(url){ return new Promise(function(res){ if (!url) return res(null); var im = new Image(); im.crossOrigin = "anonymous"; var t = setTimeout(function(){ res(null); }, 3500); im.onload = function(){ clearTimeout(t); res(im); }; im.onerror = function(){ clearTimeout(t); res(null); }; im.src = url; }); }
  function mkStock(code, nm){
    var ks = /^\d{6}$/.test(code) ? [code + ".KS", code + ".KQ"] : [code];
    return Promise.all([pxOf(code), Promise.all(ks.map(function(k){ return oj("d/" + k + ".json"); })), Promise.all(ks.map(function(k){ return oj("e/" + k + ".json"); })), Promise.all(ks.map(dnaOf)), Promise.all(ks.map(sigOf)), gj("archive/x/live_kr.json" + q()), gj("archive/x/live_us_pre.json" + q()), window.__pbbrief ? __pbbrief() : null, gj("archive/x/wl_live.json" + q()), Promise.all(ks.map(function(k){ return oj("m/" + k + ".json"); }))]).then(function(r){
      var P = r[0], Dd = r[1].filter(Boolean)[0] || {}, E = r[2].filter(Boolean)[0] || {}, DN = r[3].filter(Boolean)[0], SG = r[4].filter(Boolean)[0], L = r[5], U = r[6], PB = r[7], WLv = ((r[8] || {}).q || {})[code], MD = r[9].filter(Boolean)[0] || {};
      if (!P && !WLv) return null;
      P = P || [WLv.t.slice(0, 10), WLv.p, WLv.prev, WLv.p, WLv.p, "", []];
      var kr = /^\d{6}$/.test(code), cur_ = kr ? "원" : (Dd.currency === "USD" || !Dd.currency ? "$" : " " + Dd.currency);
      var last = +P[1], prev = +P[2], hi = +P[3], lo = +P[4], wk = (P[6] || []).slice(), asof = P[0], live = false;
      var closed = false;
      if (WLv && WLv.p && WLv.t && WLv.t.slice(0, 10) >= String(P[0])){ last = +WLv.p; prev = WLv.prev ? +WLv.prev : prev; asof = WLv.t;
        var ago = (kst() - new Date(WLv.t.replace(" ", "T") + ":00Z")) / 60e3; live = ago < 45; closed = !live; }
      else if (kr && L && L.date === today() && P[0] < today()){
        var LV = {}; [].concat(L.value || [], L.movers || [], [].concat.apply([], (L.sectors || []).map(function(x){ return x.big || []; })), [].concat.apply([], (L.themes || []).map(function(x){ return x.lead || []; })), [].concat.apply([], (L.strong || []).map(function(x){ return x.lead || []; }))).forEach(function(x){ if (x && x.s) LV[x.s.split(".")[0]] = x; });
        var lv = LV[code]; if (lv && lv.p){ last = +lv.p; prev = lv.r != null ? last / (1 + lv.r / 100) : +P[1]; asof = today() + " " + (L.t || ""); live = true; }
      }
      hi = Math.max(hi, last); lo = Math.min(lo, last);
      if (wk.length) wk[wk.length - 1] = last;
      var d1 = prev ? (last / prev - 1) * 100 : null, r4 = wk.length > 5 ? (last / wk[wk.length - 5] - 1) * 100 : null, r13 = wk.length > 14 ? (last / wk[wk.length - 14] - 1) * 100 : null, r52 = wk.length >= 20 ? (last / wk[0] - 1) * 100 : null;
      var fromHi = hi ? (last / hi - 1) * 100 : null, posR = hi > lo ? (last - lo) / (hi - lo) * 100 : null;
      var fmtP = function(v){ return kr ? Math.round(v).toLocaleString() + "원" : (cur_ === "$" ? "$" + (+v).toFixed(2) : (+v).toFixed(2) + cur_); };
      var an = Dd.analyst || {}, tgt = an.target_mean, up = tgt && last ? (tgt / last - 1) * 100 : null;
      var mk = null; if (kr && L && L.date === today()){ var ix = (L.index || []).filter(function(x){ return x.name === "코스피"; })[0]; if (ix) mk = {n: "코스피", v: ix.chg}; }
      if (!kr && U && U.date === today()){ var es = (U.fut || []).filter(function(f){ return f.s === "ES=F"; })[0]; if (es) mk = {n: "S&P500 선물", v: es.chg}; }
      if (closed && !kr) mk = null;
      var earn = ((E.cal || {}).earn || []).filter(function(d){ return d >= today(); })[0];
      var tags = SG && SG.tags ? SG.tags.split("").filter(function(c){ return c.trim(); }) : [];
      var TAGN = {"☕": "☕ 컵 모양(돌파 대기)", "📈": "📈 갭 돌파", "🐋": "🐋 큰손 매수", "🤫": "🤫 조용한 매집", "🎯": "🎯 집중"};
      var nmS = nm || (Dd.ticker || {}).name || code;
      // 한눈에 4칸
      var trend = r13 == null ? null : r13 > 8 && (r4 == null || r4 > -5) ? ["📈", "상승 흐름", "석 달 " + pct(r13), UP] : r13 < -8 ? ["📉", "하락 흐름", "석 달 " + pct(r13), DN] : ["➡️", "옆걸음", "석 달 " + pct(r13), "#8a94a8"];
      var place = posR == null ? null : posR >= 80 ? ["🔝", "1년 높은 쪽", "최고가 " + pct(fromHi), UP] : posR <= 30 ? ["🔻", "1년 낮은 쪽", "최고가 " + pct(fromHi), DN] : ["📍", "1년 가운데", "최고가 " + pct(fromHi), "#8a94a8"];
      var val = DN && DN[3] != null ? (DN[3] >= 70 ? ["💰", "싼 편", "이익 대비 · " + DN[3] + "점", "#2f9e44"] : DN[3] <= 30 ? ["💸", "비싼 편", "이익 대비 · " + DN[3] + "점", UP] : ["⚖️", "보통", "이익 대비 · " + DN[3] + "점", "#8a94a8"]) : (Dd.pe ? ["⚖️", "PER " + (+Dd.pe).toFixed(1) + "배", "이익 대비 가격", "#8a94a8"] : null);
      var buyN = (an.strong_buy || 0) + (an.buy || 0), sellN = (an.sell || 0) + (an.strong_sell || 0);
      var pro = an.n_analysts ? (buyN / an.n_analysts >= 0.7 ? ["👍", "매수 우세", an.n_analysts + "곳 중 " + buyN + "곳", "#2f9e44"] : sellN / an.n_analysts >= 0.3 ? ["👎", "매도 많음", an.n_analysts + "곳 중 " + sellN + "곳", UP] : ["🤝", "의견 갈림", an.n_analysts + "곳", "#8a94a8"]) : null;
      var glance = [trend, place, val, pro].filter(Boolean);
      // 뉴스
      var news = WLv && WLv.news && WLv.news.length ? WLv.news.slice(0, 3).map(function(n){ var d = String(n.d || ""); return {t: n.t, s: (n.src || "") + (d.length >= 8 ? " · " + (d.slice(0, 8) === today().replace(/-/g, "") ? "오늘 " + d.slice(8, 10) + ":" + d.slice(10, 12) : d.slice(4, 6) + "/" + d.slice(6, 8)) : "")}; }) : null;
      // 📌 PB 코멘트
      var read = "", plan = [], watch = [];
      if (d1 != null){ var rel = mk ? d1 - mk.v : null; read = josa(nmS) + " " + (live ? "오늘 " : closed && !kr ? "지난밤 미국에서 " : "최근 거래일 ") + pct(d1) + (mk ? " — " + mk.n + "(" + pct(mk.v) + ")보다 " + (rel >= 0.5 ? "강해요" : rel <= -0.5 ? "약해요" : "비슷해요") : "") + ". "; }
      if (posR != null) read += posR >= 80 ? "1년 중 높은 쪽(최고가 대비 " + pct(fromHi) + ")이라 흐름은 좋지만 많이 오른 자리예요." : posR <= 30 ? "1년 중 낮은 쪽(최고가 대비 " + pct(fromHi) + ")이에요 — 싸 보이지만 내림이 멈췄는지 먼저 확인할 때예요." : "1년 가격 범위의 가운데쯤이에요.";
      if (r4 != null && r13 != null) read += " 한 달 " + pct(r4) + " · 석 달 " + pct(r13) + ".";
      if (r13 != null && r13 > 8 && (r4 == null || r4 > -5)) plan.push("흐름이 살아 있어요 — 들고 계시면 유지, 새로 담는다면 쉬어 가는 날에 나눠서.");
      else if (r13 != null && r13 < -8) plan.push("석 달째 내리는 흐름이에요 — 비중이 크면 일부 줄이고, 새로 담는 건 반등이 확인된 뒤에.");
      else if (r4 != null && r4 < -15) plan.push("한 달 새 크게 빠졌어요 — 한 번에 사기보다 2~3번 나눠서, 정한 비중 안에서만.");
      else plan.push("방향이 뚜렷하지 않아요 — 서두르지 말고 정한 비중 안에서만.");
      if (up != null && an.n_analysts) plan.push("증권사 " + an.n_analysts + "곳 평균 목표가 " + fmtP(tgt) + " — 지금보다 " + pct(up) + (up > 20 ? ", 여유가 있는 편이에요." : up < 0 ? ", 이미 넘어섰어요." : "."));
      if (earn) watch.push([earn === today() ? "오늘" : md(earn), "실적 발표 — 결과에 따라 크게 움직일 수 있어요"]);
      liveWatch((PB && PB.advice && PB.advice.watch) || []).slice(0, 2).forEach(function(w){ if (watch.length < 3) watch.push(w); });
      var tw = WLv && WLv.kr && WLv.kr.t && WLv.kr.t.slice(0, 10) === today() ? WLv.kr : null;
      if (tw){ read = "한국 본주 " + josa(tw.n) + " 지금(" + tw.t.slice(11, 16) + ") " + pct(tw.chg) + " — 오늘 밤 미국 주가도 이 흐름을 따라갈 가능성이 커요. 미국 상장 " + code + "는 " + read.replace(/^.*?(지난밤|오늘|최근 거래일)/, "$1"); }
      var kp = [{l: live ? "지금 " + (asof.length > 10 ? asof.slice(11, 16) : "") : closed && !kr ? md(asof) + " 미국 마감" : md(asof) + " 종가", v: fmtP(last), neutral: true}, {l: live ? "오늘" : "마지막 거래일", v: pct(d1)}, {l: "한 달", v: pct(r4)}, {l: wk.length >= 48 ? "1년" : wk.length >= 20 ? "상장 후" : "석 달", v: wk.length >= 20 ? pct(r52) : pct(r13)}];
      var dna = DN ? [{n: "성장", v: DN[1]}, {n: "수익성", v: DN[2]}, {n: "싸다", v: DN[3]}, {n: "주가 힘", v: DN[4]}, {n: "전문가", v: DN[5]}].filter(function(x){ return x.v != null; }) : null;
      var anl = an.n_analysts ? {n: an.n_analysts, sb: an.strong_buy || 0, b: an.buy || 0, h: an.hold || 0, s: sellN, tgt: tgt, up: up, lo: an.target_low, hi: an.target_high, last: last, fmt: fmtP} : null;
      return loadImg(MD.photo).then(function(img){
        var ind = (Dd.industry_ko || Dd.industry || "") + " " + nmS, EM = [[/반도체|메모리|hynix|하이닉스|Semicon/i, "💾"], [/자동차|Auto/i, "🚗"], [/배터리|2차전지|리튬|Albemarle|화학/i, "🔋"], [/바이오|제약|헬스|Pharma|Bio/i, "🧬"], [/은행|금융|보험|Bank|Financ/i, "🏦"], [/조선|해운|Ship/i, "🚢"], [/방산|항공|우주|Aero|Space|Defense/i, "🚀"], [/인터넷|소프트|플랫폼|Software|Internet|Meta|게임/i, "💻"], [/통신|네트워크|Network|Arista|Telecom/i, "📡"], [/에너지|정유|석유|Oil|Energy|전력|유틸/i, "⚡"], [/건설|Construction/i, "🏗️"], [/화장품|소비|유통|Retail|식품/i, "🛍️"], [/ETF|지수/i, "📊"]];
        var emo = "🏢"; for (var ei = 0; ei < EM.length; ei++) if (EM[ei][0].test(ind)){ emo = EM[ei][1]; break; }
        return {kind: "stock", emoji: emo, title: nmS + (kr ? "" : " · " + code), sub: [kr ? code : "", Dd.industry_ko || "", Dd.market_cap ? "시총 " + (kr ? Math.round(Dd.market_cap / 1e12).toLocaleString() + "조원" : "$" + Math.round(Dd.market_cap / 1e9).toLocaleString() + "B") : ""].filter(Boolean).join(" · "),
          img: img, live: live, asof: asof, chips: (tw ? ["🇰🇷 본주 " + tw.n + " 지금 " + Math.round(tw.p).toLocaleString() + "원 " + pct(tw.chg)] : []).concat(tags.map(function(t){ return TAGN[t] || ""; }).filter(Boolean)),
          kpis: kp, chart: wk.length > 10 ? {v: wk, hi: hi, lo: lo, last: last, fmt: fmtP} : null, glance: glance.length >= 3 ? glance : null, news: news ? {title: "📰 최근 뉴스", items: news} : null,
          dna: dna && dna.length >= 4 ? dna : null, anl: anl,
          advice: {title: "이 종목, 이렇게 봐요", maxRead: 5, read: read.trim(), watch: watch.slice(0, 3), plan: plan.slice(0, 2)},
          note: (live ? "가격 " + asof.slice(5, 16).replace("-", "/") + " 기준(10~15분 늦을 수 있음) · " : closed && !kr ? "가격 " + asof.slice(5, 16).replace("-", "/") + " 미국 마감 기준 · " : "가격 " + md(asof) + " 종가 기준 · ") + "개별 종목 정보는 참고용이에요 · 매수·매도 권유가 아니에요"};
      });
    });
  }
  function bGlance(g, y, G){
    if (!G || !G.length) return 0;
    var n = G.length, gap = 12, w = (CW - gap * (n - 1)) / n, h = 168;
    G.forEach(function(x, i){ var xx = MX + i * (w + gap); rr(g, xx, y, w, h, 20, TILE); g.fillStyle = x[3]; g.fillRect(xx, y + 20, 6, h - 40);
      font(g, 600, 46); g.fillStyle = INK; g.fillText(x[0], xx + 22, y + 62);
      g.fillStyle = x[3] === "#8a94a8" ? INK : x[3]; font(g, 800, 30); wrap(g, x[1], xx + 22, y + 108, w - 34, 32, 1);
      g.fillStyle = MUT; font(g, 500, 20); wrap(g, x[2], xx + 22, y + 142, w - 34, 22, 1); });
    return h + 24;
  }
  function bNews(g, y, N){
    if (!N || !N.items || !N.items.length) return 0;
    var items = N.items, h = 46; font(g, 700, 26); items.forEach(function(it){ h += nLines(g, it.t, CW - 60, 2) * 34 + 38; }); h += 6;
    rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(N.title, MX + 22, y + 32);
    var yy = y + 46;
    items.forEach(function(it, i){ g.fillStyle = INK; font(g, 700, 26); yy += wrap(g, it.t, MX + 22, yy + 28, CW - 60, 34, 2); g.fillStyle = MUT; font(g, 500, 20); g.fillText(it.s, MX + 22, yy + 22); yy += 38;
      if (i < items.length - 1){ g.fillStyle = LINE; g.fillRect(MX + 22, yy - 8, CW - 44, 1); } });
    return h + 24;
  }
  function bDna5(g, y, D){   // 다섯 점수 — 작은 원형 게이지 5개
    if (!D || !D.length) return 0;
    var n = D.length, w = CW / n, h = 196; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("다섯 가지 점수 (100점 만점 · 같은 시장 종목과 비교)", MX + 22, y + 32);
    D.forEach(function(d, i){ var cx = MX + w * i + w / 2, cy = y + 112, R = 46, c = d.v >= 70 ? "#2f9e44" : d.v >= 40 ? "#d9a441" : "#d6453d";
      g.lineWidth = 12; g.strokeStyle = "#eef0f4"; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = c; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * d.v / 100); g.stroke(); g.lineCap = "butt";
      g.fillStyle = c; font(g, 800, 30); g.textAlign = "center"; g.fillText(String(d.v), cx, cy + 11); g.fillStyle = INK; font(g, 700, 22); g.fillText(d.n, cx, y + 184); g.textAlign = "left"; });
    return h + 24;
  }
  // 📌 담은 채권·펀드 → 상품 한 장 (products.json 에서 원본 찾기)
  function mkPin(it){
    return gj("archive/x/products.json" + q()).then(function(D){
      D = D || {}; var o = null, k = it.k;
      if (k === "krw") o = (D.krw || []).filter(function(b){ return b.code === it.id; })[0];
      else if (k === "fund") o = (D.funds || []).filter(function(f){ return f.c === it.id; })[0];
      else if (k === "ust" || k === "aud") o = ((D[k] || {}).items || []).filter(function(b){ return b.name === it.id; })[0];
      if (!o) return null;
      return mkProduct({k: k, o: o});
    });
  }
  // 🎯 내 ELS 지금 어디쯤 (관제탑 계산 그대로)
  function mkMyEls(it){
    var E = window.__elsMy; if (!E) return Promise.resolve(null);
    return E.load().then(function(){ var qk = E.parseKey(it.key); return Promise.all(qk.ua.map(E.epx)).then(function(ss){
      if (ss.some(function(x){ return !x; })) return null;
      var G = E.align(ss); G.K = G.C.map(E.sparse); var M = E.monitor(it, G); if (!M || M.wait) return null;
      var dt = function(t){ return new Date(t * 864e5).toISOString().slice(0, 10); };
      if (M.done) return {kind: "myels", title: it.nm, sub: "내 ELS · " + (M.done.k + 1) + "차 평가(" + M.done.d + ")에 조기상환 조건 충족", kpis: [{l: "결과", v: "상환 조건 충족", neutral: true}], note: "실제 상환은 증권사 공지로 확인하세요"};
      var ua = qk.ua, bars = qk.bars, nx = M.next;
      var dd = nx ? Math.round(nx.t - Date.parse(today() + "T00:00:00Z") / 864e5) : null;
      var items = ua.map(function(n, i){ return {n: n, v: (M.cur[i] * 100)}; });
      var worst = Math.min.apply(null, items.map(function(x){ return x.v; })), gap = nx ? worst - nx.bar : null;
      var read = "가장 많이 빠진 기초자산이 처음 가격의 " + worst.toFixed(0) + "%예요. " + (nx ? (gap >= 0 ? "다음 평가 기준(" + nx.bar + "%)보다 " + gap.toFixed(0) + "%p 위라 지금 그대로면 " + (nx.k + 1) + "차에 상환돼요." : "다음 평가 기준(" + nx.bar + "%)까지 " + (-gap).toFixed(0) + "%p 모자라요 — 남은 평가에서 회복을 기다리는 구간이에요.") : "");
      if (qk.ki != null) read += M.kt ? " 낙인(" + qk.ki + "%)에 한 번 닿았어요 — 만기에 마지막 기준을 넘어야 원금이 지켜져요." : " 낙인(" + qk.ki + "%)까지는 " + (worst - qk.ki).toFixed(0) + "%p 여유가 있어요.";
      return {kind: "myels", title: it.nm, sub: "내 ELS 지금 위치 · 가입 기준 " + M.base + " · 만기 " + M.mat,
        kpis: [{l: "다음 평가", v: nx ? "D-" + Math.max(0, dd) : "–", s: nx ? (nx.k + 1) + "차 · " + dt(nx.t).slice(5).replace("-", "/") : "", neutral: true}, {l: "평가 기준", v: nx ? nx.bar + "%" : "–", neutral: true}, {l: "가장 약한 자산", v: worst.toFixed(0) + "%", neutral: true}],
        uabars: {items: items, bar: nx ? nx.bar : null, ki: qk.ki}, steps: {bars: bars, ki: qk.ki},
        advice: {title: "내 ELS, 이렇게 봐요", read: read, watch: nx ? [[dt(nx.t).slice(5).replace("-", "/"), (nx.k + 1) + "차 평가 — 모두 " + nx.bar + "% 위면 상환"]] : [], plan: [gap != null && gap >= 5 ? "지금은 여유 있게 상환 쪽이에요 — 그대로 지켜보면 돼요." : gap != null && gap >= 0 ? "기준 바로 위예요 — 평가일까지 흔들릴 수 있어요." : "당장 상환은 어려워요 — 다음 평가들과 낙인 여유를 같이 보세요."]},
        note: "과거·현재 가격으로 계산한 위치예요 · 실제 상환은 증권사 공지로 확인하세요"};
    }); }).catch(function(){ return null; });
  }
  // 그림 블록: 1년 주간 차트 · 다섯 가지 점수 · 증권사 의견 · 기초자산 위치
  function bChart(g, y, Cc){
    if (!Cc) return 0;
    var h = 300; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("최근 1년 흐름 (주간)", MX + 22, y + 32);
    var v = Cc.v, x0 = MX + 22, x1 = W - MX - 150, y0 = y + 60, y1 = y + h - 40, mn = Math.min(Cc.lo, Math.min.apply(null, v)), mx = Math.max(Cc.hi, Math.max.apply(null, v)); if (mx === mn) mx = mn + 1;
    var X = function(i){ return x0 + (x1 - x0) * i / (v.length - 1); }, Y = function(p){ return y1 - (p - mn) / (mx - mn) * (y1 - y0); };
    var col = v[v.length - 1] >= v[0] ? UP : DN;
    g.beginPath(); v.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); g.fillStyle = col === UP ? "rgba(214,69,61,.10)" : "rgba(47,111,221,.10)"; g.fill();
    g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = "round"; g.beginPath(); v.forEach(function(p, i){ i ? g.lineTo(X(i), Y(p)) : g.moveTo(X(i), Y(p)); }); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(X(v.length - 1), Y(v[v.length - 1]), 9, 0, 7); g.fill();
    font(g, 600, 21); g.textAlign = "left";
    [[Cc.hi, "1년 최고 ", "#8a94a8"], [Cc.lo, "1년 최저 ", "#8a94a8"]].forEach(function(z){ g.strokeStyle = "#e1e4ea"; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x0, Y(z[0])); g.lineTo(x1, Y(z[0])); g.stroke(); g.setLineDash([]); g.fillStyle = z[2]; g.fillText(z[1] + Cc.fmt(z[0]), x1 + 12, Y(z[0]) + 7); });
    g.fillStyle = col; font(g, 800, 22); g.fillText("지금 " + Cc.fmt(Cc.last), x1 + 12, Math.min(Math.max(Y(Cc.last) + 7, Y(Cc.hi) + 34), Y(Cc.lo) - 20));
    return h + 24;
  }
  function bDna(g, y, D){
    if (!D || !D.length) return 0;
    var h = 40 + D.length * 44 + 10; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("다섯 가지 점수 (0~100, 같은 시장 종목과 비교)", MX + 22, y + 32);
    D.forEach(function(d, i){ var yy = y + 44 + i * 44; g.fillStyle = INK; font(g, 700, 25); g.fillText(d.n, MX + 22, yy + 26);
      var bx = MX + 170, bw = CW - 170 - 100; g.fillStyle = "#eef0f4"; rr(g, bx, yy + 8, bw, 22, 11, "#eef0f4"); var c = d.v >= 70 ? "#2f9e44" : d.v >= 40 ? "#d9a441" : "#d6453d"; rr(g, bx, yy + 8, Math.max(22, bw * d.v / 100), 22, 11, c);
      g.fillStyle = c; font(g, 800, 26); g.textAlign = "right"; g.fillText(String(d.v), W - MX - 22, yy + 28); g.textAlign = "left"; });
    return h + 24;
  }
  function bAnl(g, y, A){
    if (!A) return 0;
    var h = 190; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("증권사 의견 " + A.n + "곳", MX + 22, y + 32);
    var tot = A.sb + A.b + A.h + A.s || 1, x = MX + 22, bw = CW - 44, parts = [[A.sb, "적극 매수", "#1f7a3a"], [A.b, "매수", "#2f9e44"], [A.h, "보유", "#d9a441"], [A.s, "매도", "#d6453d"]];
    parts.forEach(function(p_){ var w = bw * p_[0] / tot; if (w <= 0) return; g.fillStyle = p_[2]; g.fillRect(x, y + 50, w, 30); if (w > 70){ g.fillStyle = "#fff"; font(g, 700, 20); g.fillText(p_[1] + " " + p_[0], x + 8, y + 72); } x += w; });
    if (A.tgt){ var lo = A.lo || A.tgt, hi = A.hi || A.tgt, mn = Math.min(lo, A.last), mx = Math.max(hi, A.last), X = function(v){ return MX + 40 + (CW - 80) * (v - mn) / ((mx - mn) || 1); };
      g.strokeStyle = "#dfe3ea"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(X(lo), y + 122); g.lineTo(X(hi), y + 122); g.stroke();
      g.fillStyle = "#3b5bdb"; g.beginPath(); g.arc(X(A.tgt), y + 122, 11, 0, 7); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(X(A.last), y + 122, 9, 0, 7); g.fill();
      font(g, 600, 20); g.fillStyle = MUT; g.fillText("목표가 범위 " + A.fmt(lo) + " ~ " + A.fmt(hi), MX + 22, y + 170);
      g.textAlign = "right"; g.fillStyle = "#3b5bdb"; font(g, 800, 22); g.fillText("● 평균 " + A.fmt(A.tgt) + " (" + pct(A.up) + ")   ", W - MX - 22 - 130, y + 170); g.fillStyle = INK; g.fillText("● 지금", W - MX - 22, y + 170); g.textAlign = "left"; }
    return h + 24;
  }
  function bUa(g, y, U_){
    if (!U_ || !U_.items) return 0;
    var items = U_.items, h = 76 + items.length * 64 + 20; rr(g, MX, y, CW, h, 20, TILE);
    g.fillStyle = SUB; font(g, 700, 24); g.fillText("기초자산 지금 위치 (처음 가격 = 100)", MX + 22, y + 32);
    var bx = MX + 230, bw = CW - 230 - 120, lo = Math.min(U_.ki != null ? U_.ki - 5 : 50, Math.min.apply(null, items.map(function(x){ return x.v; })) - 5), hi = Math.max(120, Math.max.apply(null, items.map(function(x){ return x.v; })) + 5), X = function(v){ return bx + bw * (v - lo) / (hi - lo); };
    items.forEach(function(it, i){ var yy = y + 76 + i * 64; g.fillStyle = INK; font(g, 700, 25); wrap(g, it.n, MX + 22, yy + 32, 200, 28, 1);
      g.fillStyle = "#eef0f4"; g.fillRect(bx, yy + 16, bw, 24); var c = U_.bar != null && it.v >= U_.bar ? "#2f9e44" : U_.ki != null && it.v < U_.ki ? UP : "#d9a441"; g.fillStyle = c; g.fillRect(bx, yy + 16, Math.max(4, X(it.v) - bx), 24);
      g.fillStyle = c; font(g, 800, 26); g.textAlign = "right"; g.fillText(it.v.toFixed(0) + "%", W - MX - 22, yy + 36); g.textAlign = "left"; });
    var yb = y + 74, ye = y + h - 14;
    [[U_.bar, "#3b5bdb", "평가 기준 "], [U_.ki, UP, "낙인 "], [100, "#9aa0ab", ""]].forEach(function(z){ if (z[0] == null) return; g.strokeStyle = z[1]; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(X(z[0]), yb); g.lineTo(X(z[0]), ye); g.stroke(); g.setLineDash([]); if (z[2]){ g.fillStyle = z[1]; font(g, 700, 19); g.textAlign = "center"; g.fillText(z[2] + z[0], X(z[0]), yb - 8); g.textAlign = "left"; } });
    return h + 24;
  }

  // 고르기 창: 시황만 / 관심종목 포함
  function chooser(){
    var old = document.getElementById("opch"); if (old) old.remove();
    var W_ = wlItems(), P_ = pinItems(), all = W_.concat(P_);
    var box = document.createElement("div"); box.id = "opch";
    var row = function(it, i){ var ic = it.kind === "stock" ? "⭐" : it.kind === "myels" ? "🎯" : it.kind === "fund" ? "📦" : "🏦"; return '<label class="opc-r"><input type="checkbox" data-i="' + i + '"><span>' + ic + '</span><b>' + String(it.nm).replace(/[<>&]/g, "").slice(0, 26) + '</b><small>' + (it.kind === "stock" ? it.id : it.kind === "myels" ? "내 ELS" : it.kind === "fund" ? "펀드" : "채권") + '</small></label>'; };
    box.innerHTML = '<div class="opc-s"><h3>📨 고객에게 보내기</h3>' +
      '<button class="opc-b main" data-m="mkt">📊 시황만 <small>시장 한 장</small></button>' +
      '<button class="opc-b" data-m="pick">⭐ 관심종목 포함 <small>시장 한 장 + 고른 종목·상품 한 장씩</small></button>' +
      '<div id="opcl" hidden>' + (all.length ? '<div class="opc-h"><span>보낼 것 고르기</span><button type="button" data-all="1">전체</button></div><div class="opc-list">' + all.map(row).join("") + '</div><button class="opc-go" id="opcgo" disabled>골라 주세요</button>' :
        '<p class="note">⭐ 관심종목이나 📌 담아 둔 상품이 아직 없어요. 종목 화면의 ☆, 상품 카드의 「📌 담아 두기」, ELS 관제탑으로 담아 주세요.</p>') + '</div>' +
      '<button class="opc-x" data-x="1">닫기</button></div>';
    document.body.appendChild(box);
    var sel = function(){ return [].filter.call(box.querySelectorAll('input[type=checkbox]'), function(c){ return c.checked; }).map(function(c){ return all[+c.dataset.i]; }); };
    var upd = function(){ var b = document.getElementById("opcgo"); if (!b) return; var n = sel().length; b.disabled = !n; b.textContent = n ? "시장 한 장 + " + n + "장 = " + (n + 1) + "장 만들기" : "골라 주세요"; };
    box.addEventListener("change", upd);
    box.addEventListener("click", function(ev){
      var t = ev.target; if (t === box || t.closest("[data-x]")){ box.remove(); return; }
      var m = t.closest("[data-m]"); if (m){ if (m.dataset.m === "mkt"){ box.remove(); go(null); } else { document.getElementById("opcl").hidden = false; m.classList.add("on"); } return; }
      if (t.closest("[data-all]")){ var cs = box.querySelectorAll('input[type=checkbox]'), on = [].some.call(cs, function(c){ return !c.checked; }); [].forEach.call(cs, function(c){ c.checked = on; }); upd(); return; }
      if (t.closest("#opcgo")){ var L = sel(); box.remove(); goMany(L); }
    });
  }
  function goMany(L){
    toast("시장 한 장 + " + L.length + "장 만드는 중…");
    var nm = pbname();
    var jobs = [mkMarket()].concat(L.map(function(it){ return it.kind === "stock" ? mkStock(it.id, it.nm) : it.kind === "myels" ? mkMyEls(it.it) : mkPin(it.pin); }));
    Promise.all(jobs.map(function(p_){ return p_.catch(function(){ return null; }); })).then(function(Cs){
      var ok = Cs.filter(function(C){ return C && !C.refuse; }), miss = Cs.length - ok.length;
      if (!ok.length){ toast("자료를 못 가져왔어요"); return; }
      return shareMany(ok.map(function(C){ return {c: draw(C, nm), t: C.title}; })).then(function(){ if (miss) toast(miss + "개는 자료가 없어 뺐어요"); });
    }).catch(function(e){ console.warn(e); toast("만들지 못했어요"); });
  }
  function shareMany(arr){
    return Promise.all(arr.map(function(a, i){ return new Promise(function(res){ a.c.toBlob(function(b){ res(b ? new File([b], (i + 1) + "_" + (a.t || "한장").replace(/[^\w가-힣]+/g, "_").slice(0, 24) + "_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", {type: "image/png"}) : null); }, "image/png"); }); })).then(function(fs){
      fs = fs.filter(Boolean);
      if (navigator.canShare && navigator.canShare({files: fs})) return navigator.share({files: fs, title: "시장 한 장 외 " + (fs.length - 1) + "장"}).catch(function(e){ if (e && e.name !== "AbortError") throw e; });
      fs.forEach(function(f, i){ setTimeout(function(){ var u = URL.createObjectURL(f), a = document.createElement("a"); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 30000); }, i * 400); });
      toast("그림 " + fs.length + "장을 저장했어요 — 사진에서 보내세요");
    });
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
    b.onclick = function(ev){ ev.stopPropagation(); var k2 = cur(); if (k2 === "home" || k2 === "market") chooser(); else go(TABS[k2] === "상품" ? selected() : null); };
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
    "#opch{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}.opc-s{width:100%;max-width:520px;max-height:85vh;overflow:auto;background:var(--panel);color:var(--text);border-radius:18px 18px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 20px);box-sizing:border-box}.opc-s h3{margin:0 0 12px;font-size:17px}" +
    ".opc-b{display:block;width:100%;text-align:left;font:inherit;font-size:16px;font-weight:800;padding:14px;margin:0 0 8px;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2);color:var(--text)}.opc-b small{display:block;font-weight:500;font-size:12.5px;color:var(--sub,#aab);margin-top:3px}.opc-b.main,.opc-b.on{border-color:var(--acc,#7c9cff)}" +
    ".opc-h{display:flex;justify-content:space-between;align-items:center;margin:10px 0 6px;font-size:13px;color:var(--sub,#aab)}.opc-h button{font:inherit;font-size:12.5px;background:none;border:1px solid var(--line);color:var(--text);border-radius:999px;padding:3px 10px}" +
    ".opc-list{display:flex;flex-direction:column;gap:4px;max-height:40vh;overflow:auto}.opc-r{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:10px;background:var(--panel2);font-size:14px}.opc-r b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.opc-r small{color:var(--mut,#8a94a8);font-size:11.5px}.opc-r input{width:18px;height:18px}" +
    ".opc-go{display:block;width:100%;margin-top:10px;font:inherit;font-size:15px;font-weight:800;padding:13px;border-radius:14px;border:0;background:var(--acc,#7c9cff);color:#fff}.opc-go:disabled{opacity:.45}.opc-x{display:block;width:100%;margin-top:8px;font:inherit;font-size:14px;padding:10px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--text)}" +
    "#opbtn span{font-size:14px}:root[data-ui=light] #opbtn{background:#fff;color:#141a26;border-color:#dde2ea}#opbtn:active{transform:scale(.96)}.op-row{margin-top:8px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { fab(); } catch(x) {} try { rowBtns(); } catch(x) {} }, 300); }
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
  window.addEventListener("hashchange", soon);
  window.__onepage = {go: go, draw: draw, chooser: chooser, _mkStock: mkStock, _mkMyEls: mkMyEls, _mkPin: mkPin, _goMany: goMany, _mkProduct: mkProduct, _mkPort: mkPort, _mkMarket: mkMarket};
  soon();
})();
