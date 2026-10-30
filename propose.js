/* 📝 제안서 (10/28 사용자)
   「매일 아침 시황이 나오면 그거에 맞게 주식(국내만·해외도)·개인연금·DC·IRP·국고채·미국채·브라질국채·ELS 투자제안서를 미리 만들어
    기본폼을 만들어 놓고 → 고객 이름·제안자 이름·소속·상품 선택·금액 선택을 넣으면 원페이지 전송용과 풀버전 PDF·PPT 까지 나오는 카테고리」
   · 기본폼: proposal.py 가 매일 아침 + 장중 매시간 archive/x/proposal.json 으로 만들어 둠 (AI·API 없음 → 0원)
   · 이 화면: 그 폼에 고객·금액을 끼워 휴대폰에서 바로 그림(PNG)·PDF·PPT 를 만듦 (lib/html2pdf · lib/pptxgen, 서버 안 씀)
   · 문장은 「~임」체 · 중학생도 읽히게 · 그림 위주 · 앱 이름은 안 넣음(고객용) */
(function(){
  var DATA = null, AT = 0;
  var ST = {sel: [], amt: {}, cust: "", busy: false};
  var ME = {};
  try { ME = JSON.parse(localStorage.getItem("propme") || "{}") || {}; } catch(x) {}
  ST.opt = {};   // 10/29 사용자 — 종목마다 {mode: "krw"|"usd", must: [{name, code, mkt, etf, pct}]}
  try { var s0 = JSON.parse(localStorage.getItem("propsel") || "{}"); if (s0 && s0.sel) { ST.sel = s0.sel; ST.amt = s0.amt || {}; ST.opt = s0.opt || {}; } } catch(x) {}
  function keep(){ try { localStorage.setItem("propme", JSON.stringify(ME)); localStorage.setItem("propsel", JSON.stringify({sel: ST.sel, amt: ST.amt, opt: ST.opt})); } catch(x) {} }
  var EQ = {kr_stock: 1, gl_stock: 1, pension: 1, dc: 1, irp: 1};
  var MCOL = ["#c9962b", "#b5651d", "#8e44ad", "#16a085", "#c0392b", "#2c3e50"];
  function opt(k){ ST.opt[k] = ST.opt[k] || {mode: "krw", must: []}; if (!ST.opt[k].must) ST.opt[k].must = []; return ST.opt[k]; }
  /* 🔎 추천 이유 — 앱이 이미 모아 둔 자료(종목리포트 d/ · ETF x/ · 뉴스 n/ · 시세 p/ · 시황 테마 · ETF 속 회사)로 규칙대로 씀 (10/29 사용자 「넌 이유를 찾아서 넣어」) */
  var RS = {}, RSP = {};
  function rkey(m){ return (m.sym || m.code || m.name || "").toUpperCase(); }
  var OPDX = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function oj(path){ return (typeof getJSON === "function" ? getJSON(OPDX + path, {ttl: 3600e3}) : fetch(OPDX + path).then(function(r){ if (!r.ok) throw 0; return r.json(); })).catch(function(){ return null; }); }
  function ofile(sym){ return sym.replace(/[^A-Za-z0-9.-]/g, "_"); }
  function shard(sym){ try { if (typeof opShard === "function") return opShard(sym); } catch(x) {} return null; }
  function resolveSym(m){
    if (m.sym) return Promise.resolve(m.sym);
    if (typeof opLoadIdx !== "function") return Promise.resolve(null);
    return opLoadIdx().then(function(ix){
      var c = String(m.code || "").toUpperCase(), n = String(m.name || "").replace(/\s/g, "").toLowerCase();
      var hit = ix.filter(function(r){ return c && (r.sym.toUpperCase() === c || r.sym.toUpperCase() === c + ".KS" || r.sym.toUpperCase() === c + ".KQ"); })[0] ||
                ix.filter(function(r){ return r.name.replace(/\s/g, "").toLowerCase() === n; })[0];
      return hit ? hit.sym : null;
    }).catch(function(){ return null; });
  }
  var SECKO = {CONSUMER_STAPLES: "필수소비재", consumer_defensive: "필수소비재", HEALTHCARE: "헬스케어", healthcare: "헬스케어", ENERGY: "에너지", energy: "에너지", IT: "IT", technology: "IT",
    INDUSTRIALS: "산업재", industrials: "산업재", FINANCIALS: "금융", financial_services: "금융", CONSUMER_DISCRETIONARY: "경기소비재", consumer_cyclical: "경기소비재", UTILITIES: "유틸리티", utilities: "유틸리티",
    MATERIALS: "소재", basic_materials: "소재", COMMUNICATION: "통신", communication_services: "통신", REAL_ESTATE: "부동산", realestate: "부동산"};
  var SEC2THEME = {"에너지": "에너지", "유틸리티": "전력·인프라", "IT": "반도체 (HBM)", "금융": "금융", "필수소비재": "필수소비재"};
  function nfmt(v, cur){ if (v == null) return "–"; return cur === "KRW" ? Math.round(v).toLocaleString("ko-KR") + "원" : (cur === "USD" ? "$" : "") + (+v).toLocaleString("ko-KR", {maximumFractionDigits: v < 100 ? 2 : 0}) + (cur && cur !== "USD" && cur !== "KRW" ? " " + cur : ""); }
  function first(t, n){ t = String(t || "").replace(/<[^>]+>/g, " ").replace(/^[-\s·]+/, "").replace(/\s+/g, " ").trim();
    var c = t.search(/[.。]\s|다\./); if (c > 0) t = t.slice(0, c + 1);
    t = t.replace(/하고 있습니다\.?$/, "하고 있음").replace(/있습니다\.?$/, "있음").replace(/합니다\.?$/, "함").replace(/됩니다\.?$/, "됨").replace(/입니다\.?$/, "임").replace(/[.。]$/, "");
    return t.length > n ? t.slice(0, n - 1) + "…" : t; }
  function bizLine(d){   // 「○○ 주식회사는 …에서 …를 운영하고 있습니다」 → 「…를 운영하고 있음」
    var t = String(d.business_summary_ko || "");
    t = t.replace(/^[^,.]{0,40}?(은|는)\s/, "").replace(/^(미국|한국|일본|중국|대만|홍콩|유럽|전 세계)[^.]{0,60}?(에서|적으로)\s/, "");
    return first(t, 70); }
  function capTxt(d, px){ var c = d.market_cap; if (!c) return ""; if (px && d.price) c = c * px / d.price;   /* 지금 값으로 다시 계산 */ return d.currency === "KRW" ? "시가총액 " + Math.round(c / 1e12).toLocaleString("ko-KR") + "조원" : d.currency === "USD" ? "시가총액 $" + (c >= 1e12 ? (c / 1e12).toFixed(1) + "T" : Math.round(c / 1e9) + "B") : ""; }
  function growth(fin){ fin = (fin || []).filter(function(x){ return x && x.revenue; }); if (fin.length < 2) return null; var a = fin[fin.length - 2], b = fin[fin.length - 1];
    return {p: b.period, rev: (b.revenue / a.revenue - 1) * 100, op: a.operating_income > 0 && b.operating_income != null ? (b.operating_income / a.operating_income - 1) * 100 : null}; }
  function buildReason(m, sym, d, x, n, p, ctx){
    var L = [], tag = [], nm = m.name;
    var px = p && p[1], hi = p && p[3], lo = p && p[4], r1y = p && p[6] && p[6][0] ? (p[1] / p[6][0] - 1) * 100 : null;
    if (x){   // ETF
      var what = x.index ? "「" + x.index + "」 지수를 따라감" : x.category ? (x.name_en || x.name) + " — 유형: " + x.category : first(x.desc, 70);
      L.push("📌 " + what + (x.issuer ? " · " + x.issuer : "") + (x.fee != null ? " · 보수 연 " + x.fee + "%" : ""));
      var rr = x.returns || {}, y1 = rr["1년"] != null ? rr["1년"] : (x.r1y != null ? x.r1y * 100 : r1y), y3 = rr["3년(연)"] != null ? rr["3년(연)"] : (x.r3y != null ? x.r3y * 100 : null);
      if (y1 != null || y3 != null) L.push("📈 1년 " + sgn(y1, 1) + (y3 != null ? " · 3년 연평균 " + sgn(y3, 1) : "") + (x.div_yield ? " · 분배(배당) 연 " + (+x.div_yield).toFixed(2) + "%" : ""));
      var h = (x.holdings || []).slice(0, 3).map(function(q){ return (q.name || q.code) + " " + (+q.w).toFixed(1) + "%"; }), sec = (x.sectors || []).slice().sort(function(a, b){ return b.w - a.w; })[0];
      if (h.length) L.push("🧺 주로 담는 곳: " + h.join(" · ") + (x.n_hold ? " 등 " + x.n_hold + "개" : "") + (sec ? " · 가장 큰 업종 " + (SECKO[sec.k] || sec.k) + " " + (+sec.w).toFixed(0) + "%" : ""));
      var fit = [];
      if (x.div_yield >= 2.5) fit.push("배당 연 " + (+x.div_yield).toFixed(1) + "%로 꾸준한 현금흐름을 더함");
      if (sec && SEC2THEME[SECKO[sec.k]]){ var th = (ctx.themes || []).filter(function(t){ return t.name === SEC2THEME[SECKO[sec.k]]; })[0]; if (th) fit.push("오늘 시황 리포트가 고른 「" + th.name + "」 테마와 겹침(흐름 " + th.sig + ")"); }
      if (x.aum && x.aum > (x.cur === "USD" ? 5e9 : 1e12)) fit.push("순자산 " + (x.cur === "USD" ? "$" + Math.round(x.aum / 1e9) + "B" : (x.aum / 1e12).toFixed(1) + "조원") + " 대형 ETF라 사고팔기 쉬움");
      if (fit.length) L.push("🔗 " + fit.join(" · "));
      tag.push("ETF");
    } else if (d){   // 종목
      var biz = bizLine(d), cp = capTxt(d, px);
      L.push("📌 " + [d.industry_ko, cp].filter(Boolean).join(" · ") + (biz ? " — " + biz : ""));
      var g = growth(d.financials);
      if (g) L.push("📊 " + g.p + "년 매출 " + sgn(g.rev, 0) + (g.op != null ? " · 영업이익 " + sgn(g.op, 0) : "") + (d.pe ? " · PER " + (+d.pe).toFixed(1) + "배" : "") + (d.dividend_yield ? " · 배당 " + (d.dividend_yield * 100).toFixed(1) + "%" : ""));
      var an = d.analyst || {};
      if (an.n_analysts){ var buy = Math.round(((an.strong_buy || 0) + (an.buy || 0)) / an.n_analysts * 100), cur = px || d.price, up = an.target_mean && cur ? (an.target_mean / cur - 1) * 100 : null;
        if (up != null && (up > 80 || up < -50)) up = null;   // 오래된 목표가·액면분할 등으로 튀는 값은 안 씀
        L.push("💡 애널리스트 " + an.n_analysts + "명 중 " + buy + "%가 매수 의견" + (up != null ? " · 평균 목표가 " + nfmt(an.target_mean, d.currency) + " (지금보다 " + sgn(up, 0) + ")" : "") + (d.as_of ? " · " + String(d.as_of).slice(5).replace("-", "/") + " 기준" : "")); }
      var link = [];
      (ctx.themes || []).forEach(function(t){ if ((t.stocks || []).some(function(s2){ return nm.indexOf(s2) >= 0 || s2.indexOf(nm) >= 0; })) link.push("시황 리포트 「" + t.name + "」 테마 대표 종목(흐름 " + t.sig + ")"); });
      var lk = ctx.look; if (lk && lk.top){ var j = -1; lk.top.forEach(function(t, i){ if (j < 0 && (t.t === sym || t.n === nm)) j = i; }); if (j >= 0) link.push("S&P500·나스닥 칸 안에서도 비중 " + (j + 1) + "위 — 직접 더 담아 비중을 키움"); }
      (ctx.hot || []).forEach(function(hh){ if ((hh.lead || []).indexOf(nm) >= 0) link.push("오늘 돈이 몰린 「" + hh.name + "」 업종 대표 종목"); });
      if (link.length) L.push("🔗 " + link.slice(0, 2).join(" · "));
      tag.push(d.industry_ko || "종목");
    }
    if (px && hi && lo && hi > lo) L.push("📍 지금 " + nfmt(px, (x || d || {}).currency || (x || {}).cur) + " · 52주 범위의 " + Math.round((px - lo) / (hi - lo) * 100) + "% 위치 (고점 대비 " + sgn((px / hi - 1) * 100, 0) + ")" + (r1y != null && !x ? " · 1년 " + sgn(r1y, 0) : ""));
    var nw = (n || (d && d.news) || []).filter(function(q){ return q && q.title; })[0];
    if (nw) L.push("📰 " + first(nw.title, 60) + (nw.date ? " (" + String(nw.date).slice(5).replace("-", "/") + ")" : "") + (nw.publisher ? " · " + nw.publisher : ""));
    return {lines: L.slice(0, 5), short: L.length ? L[0].replace(/^📌 /, "").slice(0, 60) : "", tag: tag[0] || ""};
  }
  function reasonFor(m, ctx){
    var key = rkey(m); if (RS[key]) return Promise.resolve(RS[key]); if (RSP[key]) return RSP[key];
    RSP[key] = resolveSym(m).then(function(sym){
      if (!sym){ RS[key] = {lines: [], short: ""}; return RS[key]; }
      m.sym = sym; var sh = shard(sym);
      return Promise.all([oj("d/" + ofile(sym) + ".json"), oj("x/" + ofile(sym) + ".json"), oj("n/" + ofile(sym) + ".json"), sh ? oj("p/" + sh + ".json") : Promise.resolve(null)]).then(function(r){
        RS[key] = buildReason(m, sym, r[0], r[1], r[2], r[3] && r[3][sym], ctx); return RS[key]; });
    }).catch(function(){ RS[key] = {lines: [], short: ""}; return RS[key]; });
    return RSP[key];
  }
  // 고른 종목들의 이유를 모두 받아 둠 (만들기·미리 보기 전에)
  function ensureReasons(){
    var jobs = [];
    ST.sel.forEach(function(k){ if (!EQ[k]) return; var f0 = form(k) || {}, o = ST.opt[k] || {};
      var ctx = {themes: f0.themes || ((f0.alt || {}).usd || {}).themes || [], look: (f0.sim || {}).look, hot: f0.kr_hot || []};
      (o.must || []).forEach(function(m){ if (m && m.name) jobs.push(reasonFor(m, ctx).then(function(){ if (m.sym) keep(); })); }); });
    return Promise.all(jobs);
  }
  // 고른 방식(원화/환전) + 꼭 넣을 종목을 기본폼에 덧입힌 「이 고객용」 폼
  var RET = {dc: 1, irp: 1};
  var MCOL2 = ["#c9962b", "#b5651d", "#8e44ad", "#16a085", "#c0392b", "#2c3e50", "#d35400", "#7f8c8d", "#27ae60", "#9b59b6"];
  function r1(v){ return Math.round(v * 10) / 10; }
  // 지정 종목을 넣고 기본 포트를 깎은 결과 (화면 요약·제안서 둘 다 이걸 씀)
  function mustPlan(k, f){
    var o = ST.opt[k] || {}, must = (o.must || []).filter(function(m){ return m && m.name && +m.pct > 0; });
    if (!must.length) return null;
    var base = f.alloc, Rb = base.filter(function(a){ return a.kind === "위험"; }).reduce(function(s2, a){ return s2 + a.pct; }, 0), Sb = 100 - Rb;
    var items = must.map(function(m){ return {m: m, pct: +m.pct, safe: !!(RET[k] && m.safe)}; });
    var tot = items.reduce(function(s2, x){ return s2 + x.pct; }, 0), warn = [];
    if (tot > 100){ items.forEach(function(x){ x.pct = x.pct * 100 / tot; }); warn.push("지정 비중 합이 100%를 넘어 100%로 맞춤"); }
    var fr = {}, cut = {};
    if (RET[k]){   // 위험 70% 한도: 위험형 지정은 위험 칸에서, 안전형 지정은 안전 칸에서 먼저 깎음
      var T = Rb, Mr = items.filter(function(x){ return !x.safe; }).reduce(function(s2, x){ return s2 + x.pct; }, 0), Ms = items.filter(function(x){ return x.safe; }).reduce(function(s2, x){ return s2 + x.pct; }, 0);
      if (Mr > T){ var sc0 = T / Mr; items.forEach(function(x){ if (!x.safe) x.pct *= sc0; }); warn.push("위험자산 지정이 " + (T >= 70 ? "법정 한도" : "이 제안의 위험자산 몫") + "(" + T + "%)를 넘어 " + T + "%로 줄임"); Mr = T; }
      var rb = Math.max(0, Math.min(T - Mr, 100 - Mr - Ms)), sb = Math.max(0, 100 - Mr - Ms - rb);
      fr["위험"] = Rb ? rb / Rb : 0; fr["안전"] = Sb ? sb / Sb : 0;
    } else {
      var M = items.reduce(function(s2, x){ return s2 + x.pct; }, 0);
      fr["위험"] = fr["안전"] = (100 - M) / 100;
    }
    var after = base.map(function(a){ var b = JSON.parse(JSON.stringify(a)); b.was = a.pct; b.pct = r1(a.pct * (fr[a.kind] != null ? fr[a.kind] : fr["위험"])); return b; });
    var ins = items.map(function(x, i){ var m = x.m; return {k: "must", pct: r1(x.pct), was: 0, name: "⭐ " + m.name, inst: m.name + (m.mkt ? " · " + m.mkt : ""), code: m.code || null, kind: x.safe ? "안전" : "위험", etf: !!m.etf,
      color: MCOL2[i % MCOL2.length], why: ((RS[rkey(m)] || {}).short || "PB 추천 " + (m.etf ? "ETF" : "종목")) + (x.safe ? " (안전자산으로 분류)" : ""), reason: (RS[rkey(m)] || {}).lines || [], sym: m.sym || ""}; });
    var all = ins.concat(after), diff = r1(100 - all.reduce(function(s2, a){ return s2 + a.pct; }, 0));
    if (diff){ var big = after.slice().sort(function(a, b){ return b.pct - a.pct; })[0] || ins[0]; if (big) big.pct = r1(big.pct + diff); }
    if (RET[k]){   // 반올림으로 70.1% 같은 것이 나오지 않게 — 넘친 만큼 위험 칸 → 안전 칸
      var rk = r1(all.filter(function(a){ return a.kind === "위험"; }).reduce(function(s2, a){ return s2 + a.pct; }, 0)), ex = r1(rk - Rb);
      if (ex > 0){ var pick = function(kd){ var c = after.filter(function(a){ return a.kind === kd && a.pct > 0; }); if (!c.length) c = all.filter(function(a){ return a.kind === kd; }); return c.sort(function(a, b){ return b.pct - a.pct; })[0]; }, br = pick("위험"), bs = pick("안전");
        if (br && bs){ br.pct = r1(br.pct - ex); bs.pct = r1(bs.pct + ex); } }
    }
    // 10/29 사용자 「비중 큰 순으로 내리고 설명도 그 순으로」
    var byP = function(a, b){ return b.pct - a.pct; };
    ins.sort(byP); ins.forEach(function(a, i){ a.color = MCOL2[i % MCOL2.length]; }); after.sort(byP);
    return {ins: ins, after: after, all: ins.concat(after).sort(byP), fr: fr, warn: warn, M: r1(ins.reduce(function(s2, a){ return s2 + a.pct; }, 0)),
            risky: r1(all.filter(function(a){ return a.kind === "위험"; }).reduce(function(s2, a){ return s2 + a.pct; }, 0))};
  }
  // 고른 방식(원화/환전) + 꼭 넣을 종목을 기본폼에 덧입힌 「이 고객용」 폼
  /* 🎚 10/29 A10/29-1 위험 정도 「안전 · 보통 · 적극」 — proposal_mkt.py tier_alloc 과 같은 규칙
     안전 = 위험자산 몫의 절반을 현금성(CD금리)으로 · 적극 = 안전자산 몫의 절반을 위험자산으로(비율 그대로 · DC·IRP 70% 한도) · 보통 = 오늘 기본폼 */
  var TIER = {safe: "🛡 안전", normal: "⚖️ 보통", bold: "🔥 적극"};
  function tierOK(f0, t){ return t === "normal" || !!(f0 && f0.sim && f0.sim.tiers && f0.sim.tiers[t]); }
  function tierAlloc(al, t, cap, cdT){
    al = al.filter(function(a){ return +a.pct > 0; }).map(function(a){ return JSON.parse(JSON.stringify(a)); });
    var R = 0, S = 0; al.forEach(function(a){ if (a.kind === "위험") R += a.pct; else S += a.pct; });
    var mv2 = 0;
    if (t === "safe"){ var mv = R * 0.5; al.forEach(function(a){ if (a.kind === "위험") a.pct *= 0.5; });
      var cd = al.filter(function(a){ return a.k === "cd"; })[0]; if (!cd){ cd = JSON.parse(JSON.stringify(cdT || {k: "cd", name: "현금성 (CD금리)", kind: "안전", color: "#3fb28f"})); cd.pct = 0; al.push(cd); } cd.pct += mv; }
    else { mv2 = S * 0.5; if (cap != null) mv2 = Math.min(mv2, cap - R); if (mv2 < 1 || R <= 0) return al;
      al.forEach(function(a){ if (a.kind === "위험") a.pct += mv2 * a.pct / R; else a.pct *= (S - mv2) / S; }); }
    var Rt = r1(t === "safe" ? R * 0.5 : R + mv2);
    al.forEach(function(a){ a.pct = r1(a.pct); }); al = al.filter(function(a){ return a.pct > 0; });
    [[true, Rt], [false, r1(100 - Rt)]].forEach(function(gt){   // 위험·안전 합이 딱 맞게 (proposal_mkt.py 와 같음)
      var g = al.filter(function(a){ return (a.kind === "위험") === gt[0]; }); if (!g.length) return;
      var d = r1(gt[1] - g.reduce(function(s2, a){ return s2 + a.pct; }, 0)); if (d){ var big = g.slice().sort(function(a, b){ return b.pct - a.pct; })[0]; big.pct = r1(big.pct + d); } });
    return al.sort(function(a, b){ return b.pct - a.pct; });
  }
  function riskyOf(al){ return r1(al.reduce(function(s2, a){ return s2 + (a.kind === "위험" ? +a.pct || 0 : 0); }, 0)); }
  // 원화/환전 + 위험 정도까지 입힌 폼 (⭐ 추천 종목 넣기 전)
  function baseX(k){
    var f0 = form(k); if (!f0) return null;
    var o = ST.opt[k] || {}, f = JSON.parse(JSON.stringify(f0));
    if (k === "gl_stock" && o.mode === "usd" && f.alt && f.alt.usd){ var u = f.alt.usd; for (var q in u) f[q] = u[q]; }
    var t = o.tier, T = EQ[k] && t && t !== "normal" && f.sim && f.sim.tiers && f.sim.tiers[t];
    if (T){
      var R0 = riskyOf(f.alloc), cdT = (T.alloc || []).filter(function(a){ return a.k === "cd"; })[0];
      var th0 = (f.alloc.filter(function(a){ return a.k === "theme"; })[0] || {}).pct;
      f.alloc = tierAlloc(f.alloc, t, f.sim.tier_cap, cdT);
      var th1 = (f.alloc.filter(function(a){ return a.k === "theme"; })[0] || {}).pct;
      (f.themes || []).forEach(function(x){ var rr = th0 ? (th1 || 0) / th0 : 0; if (x.pct != null) x.pct = r1(x.pct * rr); if (x.w != null) x.w = r1(x.w * rr); });
      var keepC = f.sim.contrib, tiers = f.sim.tiers, cap = f.sim.tier_cap;
      f.sim = JSON.parse(JSON.stringify(T)); f.sim.contrib = keepC; f.sim.tiers = tiers; f.sim.tier_cap = cap;
      f.sim.note = (f.sim.note || "") + " · " + TIER[t].slice(2) + " 단계 비중으로 계산";
      f.tier = t;
      f.headline = f.alloc.map(function(a){ return a.name.replace(/\s*\(.*\)$/, "") + " " + pc(a.pct); }).join(" · ") + " 제안임";
      f.points = [(t === "safe" ? "🛡 안전하게 — 오늘 기본 제안의 위험자산 " + pc(R0) + " 중 절반을 현금성(CD금리)으로 옮겨 " + pc(riskyOf(f.alloc)) + "만 담음"
                               : "🔥 적극적으로 — 오늘 기본 제안의 안전자산 몫 절반을 위험자산으로 옮겨 위험자산 " + pc(R0) + " → " + pc(riskyOf(f.alloc)) + (cap ? " (법정 한도 " + cap + "% 안)" : "")) +
                  " · 아래 설명의 % 숫자는 기본 제안 기준"].concat(f.points || []);
    }
    return f;
  }
  function formX(k){
    var f = baseX(k); if (!f) return null;
    if (!EQ[k]) return f;
    var P = mustPlan(k, f); if (!P) return f;
    var tf = (f.alloc.filter(function(a){ return a.k === "theme"; })[0] || {}).pct, ta = (P.after.filter(function(a){ return a.k === "theme"; })[0] || {}).pct;
    (f.themes || []).forEach(function(t){ t.w = r1(t.w * (tf ? ta / tf : 0)); });
    f.alloc = P.all.filter(function(a){ return a.pct > 0; });
    if (f.themes) f.themes.sort(function(a, b){ return b.w - a.w; });
    f.must = P.ins; f.mustPlan = P;
    // 머리말도 넣은 뒤 비중 큰 순으로 다시 씀 (기본폼 숫자가 남지 않게)
    f.headline = "⭐ 추천 종목 " + pc(P.M) + " + " + P.after.filter(function(a){ return a.pct > 0; }).map(function(a){ return a.name.replace(/\s*\(.*\)$/, "") + " " + pc(a.pct); }).join(" + ") + " 제안임";
    f.points = ["⭐ 추천 종목 " + P.ins.map(function(a){ return a.inst.split(" · ")[0] + " " + pc(a.pct); }).join(" · ") + " — 담는 이유는 아래 「추천 종목」 칸 · 나머지 " + pc(r1(100 - P.M)) + "는 기본 포트 비율 그대로 (아래 설명의 % 숫자는 추천 종목 넣기 전 기본 포트 기준)"].concat(RET[k] ? ["위험자산 합계 " + pc(P.risky) + " (법정 한도 70% 안)"] : []).concat(f.points || []);
    if (f.sim && f.sim.note) f.sim.note += " · ⭐ 추천 종목은 과거 계산에서 빼고 기본 포트 비율로 계산";
    return f;
  }
  var FONT = '"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo","Noto Sans KR","Noto Sans CJK KR",sans-serif';
  var NAVY = "#14304f", INK = "#1d2533", SUB = "#5b6576", LINE = "#e3e7ee", BG = "#f5f7fb", UP = "#d6402f", DN = "#2a62c9";

  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.setAttribute("role", "status"); d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function load(force){
    if (!force && DATA && Date.now() - AT < 120000) return Promise.resolve(DATA);
    return getJSON("archive/x/proposal.json?" + Math.floor(Date.now() / 120000), {ttl: 120000}).then(function(j){ DATA = j; AT = Date.now(); return j; });
  }
  function form(k){ return ((DATA && DATA.forms) || []).filter(function(f){ return f.key === k; })[0]; }
  function today(){ var d = new Date(Date.now() + 9 * 3600e3); return d.toISOString().slice(0, 10); }
  function dlabel(){ var d = new Date(Date.now() + 9 * 3600e3), w = "일월화수목금토"[d.getUTCDay()]; return d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + w + ")"; }

  /* ───────── 금액 ───────── */
  function man(won){   // 원 → 「1억 2,500만원」
    if (won == null || isNaN(won)) return "–";
    var m = Math.round(won / 10000);
    if (m === 0) return Math.round(won).toLocaleString("ko-KR") + "원";
    var eok = Math.floor(m / 10000), r = m % 10000;
    return (eok ? eok + "억" + (r ? " " : "") : "") + (r ? r.toLocaleString("ko-KR") + "만" : "") + "원";
  }
  function amtOf(k){ return (+ST.amt[k] || 0) * 10000; }
  function total(){ return ST.sel.reduce(function(s, k){ return s + amtOf(k); }, 0); }
  function sgn(v, d){ if (v == null) return "–"; return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 2 : d) + "%"; }
  function pc(v){ return (Math.round(v * 10) / 10).toString().replace(/\.0$/, "") + "%"; }

  /* ───────── 그림 (SVG → 그림 주소) ───────── */
  function svgUrl(s){ return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s); }
  function donutSvg(parts, size, thick){
    var r = size / 2, R = r - 2, ri = R - thick, a0 = -Math.PI / 2, out = "", tot = parts.reduce(function(s, p){ return s + (+p.pct || 0); }, 0) || 1;
    parts.forEach(function(p){
      var f = (+p.pct || 0) / tot; if (f <= 0) return;
      var a1 = a0 + f * Math.PI * 2 - (f < 1 ? 0.012 : 0);
      if (f >= 0.999){ out += '<circle cx="' + r + '" cy="' + r + '" r="' + (R - thick / 2) + '" fill="none" stroke="' + p.color + '" stroke-width="' + thick + '"/>'; a0 = a1; return; }
      var big = a1 - a0 > Math.PI ? 1 : 0, c = Math.cos, s = Math.sin;
      out += '<path d="M' + (r + R * c(a0)) + ' ' + (r + R * s(a0)) + ' A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + (r + R * c(a1)) + ' ' + (r + R * s(a1)) +
             ' L' + (r + ri * c(a1)) + ' ' + (r + ri * s(a1)) + ' A' + ri + ' ' + ri + ' 0 ' + big + ' 0 ' + (r + ri * c(a0)) + ' ' + (r + ri * s(a0)) + ' Z" fill="' + p.color + '"/>';
      a0 = a1 + 0.012;
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + out + '</svg>';
  }
  function donut(parts, size, thick, top, bot){
    return '<div style="position:relative;width:' + size + 'px;height:' + size + 'px;flex:none"><img src="' + svgUrl(donutSvg(parts, size, thick)) + '" width="' + size + '" height="' + size + '" style="display:block">' +
      '<div style="position:absolute;left:0;top:0;width:' + size + 'px;height:' + size + 'px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
      (top ? '<div style="font-size:' + Math.round(size * 0.075) + 'px;color:' + SUB + ';font-weight:700">' + e(top) + '</div>' : '') +
      (bot ? '<div style="font-size:' + Math.round(size * 0.115) + 'px;color:' + INK + ';font-weight:800;letter-spacing:-1px;line-height:1.15">' + e(bot) + '</div>' : '') + '</div></div>';
  }
  // 선 그림: series = [{vals, color, dash}] · x 가 있으면 그 간격대로(금리 곡선)
  function lineSvg(series, w, h, x){
    var all = []; series.forEach(function(s){ s.vals.forEach(function(v){ if (v != null) all.push(+v); }); });
    if (all.length < 2) return "";
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all), pad = (mx - mn) * 0.1 || 1; mn -= pad; mx += pad;
    var X = function(i, n){ if (x){ var x0 = x[0], x1 = x[x.length - 1]; return (x[i] - x0) / ((x1 - x0) || 1) * w; } return i / Math.max(1, n - 1) * w; };
    var Y = function(v){ return h - (v - mn) / (mx - mn) * h; };
    var grid = [0.25, 0.5, 0.75].map(function(f){ return '<line x1="0" x2="' + w + '" y1="' + (h * f) + '" y2="' + (h * f) + '" stroke="#e6eaf0" stroke-width="1"/>'; }).join("");
    var body = series.map(function(s, si){
      var pts = []; s.vals.forEach(function(v, i){ if (v != null) pts.push([X(i, s.vals.length), Y(+v)]); });
      if (pts.length < 2) return "";
      var d = pts.map(function(p, i){ return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" "), lp = pts[pts.length - 1];
      return (si === 0 && !s.dash && series.length === 1 ? '<path d="' + d + ' L' + lp[0].toFixed(1) + ' ' + h + ' L' + pts[0][0].toFixed(1) + ' ' + h + ' Z" fill="' + s.color + '" fill-opacity="0.10"/>' : '') +
        '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.dash ? 2 : 2.8) + '"' + (s.dash ? ' stroke-dasharray="6 5"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>' +
        (s.dash ? '' : '<circle cx="' + lp[0] + '" cy="' + lp[1] + '" r="5" fill="' + s.color + '" stroke="#fff" stroke-width="2"/>') +
        (s.dots ? pts.map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="' + s.color + '"/>'; }).join("") : '');
    }).join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + grid + body + '</svg>';
  }
  function fmtv(v, unit){ if (v == null) return "–"; if (unit === "원" && Math.abs(v) >= 1e6) return man(v); return unit === "%" ? (+v).toFixed(2) + "%" : unit === "원" ? (+v).toLocaleString("ko-KR", {maximumFractionDigits: v < 1000 ? 1 : 0}) + "원" : (+v).toLocaleString("ko-KR", {maximumFractionDigits: v < 100 ? 2 : 0}); }
  function chartBox(ch, w, h, fs){
    if (!ch || !ch.vals || ch.vals.length < 2) return "";
    var series = ch.multi ? ch.multi.map(function(m){ return {vals: m.vals, color: m.color}; }) : [{vals: ch.vals, color: ch.color || NAVY, dots: ch.kind === "curve"}].concat(ch.ma ? [{vals: ch.ma, color: "#9aa3b2", dash: 1}] : []);
    var v = ch.vals.filter(function(x){ return x != null; }), lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), last = v[v.length - 1], first = v[0];
    var right = ch.kind === "curve" ? "짧은 쪽 " + fmtv(first, ch.unit) + " → 긴 쪽 " + fmtv(last, ch.unit)
      : ch.multi ? "" : "지금 <b style=\"color:" + INK + "\">" + fmtv(last, ch.unit) + "</b> · " + (ch.unit === "%" ? "1년 " + ((last - first) >= 0 ? "+" : "−") + Math.abs(last - first).toFixed(2) + "%p" : "1년 " + sgn((last / first - 1) * 100, 1));
    var leg = ch.multi ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:6px;font-size:' + Math.round(fs * 0.85) + 'px;color:' + INK + '">' + ch.multi.map(function(m){ var lv = m.vals[m.vals.length - 1]; return '<span><span style="display:inline-block;width:12px;height:4px;border-radius:2px;background:' + m.color + ';vertical-align:middle;margin-right:5px"></span>' + e(m.name) + ' <b>' + sgn(lv - 100, 1) + '</b></span>'; }).join("") + '</div>'
      : ch.ma ? '<div style="font-size:' + Math.round(fs * 0.85) + 'px;color:' + SUB + ';margin-top:4px"><span style="display:inline-block;width:16px;border-top:2px dashed #9aa3b2;vertical-align:middle;margin-right:5px"></span>' + e(ch.mal || "평균선") + ' — 이 선 위면 상승 추세</div>' : '';
    var xl = ch.kind === "curve" ? [ch.labels[0], ch.labels[ch.labels.length - 1]] : [(ch.labels[0] || "").slice(0, 7).replace("-", "."), (ch.labels[ch.labels.length - 1] || "").slice(0, 7).replace("-", ".")];
    return '<div style="font-size:' + fs + 'px;color:' + INK + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:6px"><b style="color:' + INK + '">' + e(ch.title) + '</b><span style="color:' + SUB + ';font-size:' + Math.round(fs * 0.9) + 'px;white-space:nowrap">' + right + '</span></div>' +
      '<img src="' + svgUrl(lineSvg(series, w, h, ch.kind === "curve" ? ch.x : null)) + '" width="' + w + '" height="' + h + '" style="display:block;width:' + w + 'px;height:' + h + 'px">' +
      '<div style="display:flex;justify-content:space-between;color:' + SUB + ';font-size:' + Math.round(fs * 0.82) + 'px;margin-top:4px"><span>' + e(xl[0]) + '</span><span>' + (ch.multi ? "" : "최고 " + fmtv(hi, ch.unit) + " · 최저 " + fmtv(lo, ch.unit)) + '</span><span>' + e(xl[1]) + '</span></div>' + leg + '</div>';
  }
  function hbars(rows, fs, max, lw){   // rows: [label, value, color, right-text, bold]
    max = max || Math.max.apply(null, rows.map(function(r){ return Math.abs(+r[1] || 0); })) || 1;
    return rows.map(function(r){
      return '<div style="display:flex;align-items:center;gap:10px;margin:' + Math.round(fs * 0.45) + 'px 0;font-size:' + fs + 'px;color:' + INK + '">' +
        '<div style="width:' + (lw || 34) + '%;flex:none;color:' + INK + ';font-weight:' + (r[4] ? 800 : 600) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(r[0]) + '</div>' +
        '<div style="flex:1;height:' + Math.round(fs * 1.05) + 'px;background:#eef1f6;border-radius:99px;overflow:hidden"><div style="height:100%;width:' + Math.max(2, Math.min(100, Math.abs(+r[1] || 0) / max * 100)) + '%;background:' + (r[2] || NAVY) + ';border-radius:99px"></div></div>' +
        '<div style="width:24%;flex:none;text-align:right;font-weight:800;color:' + INK + '">' + e(r[3] != null ? r[3] : r[1]) + '</div></div>';
    }).join("");
  }
  // 위아래 막대 (계산서 시나리오 · 연도별) — 플러스 초록, 마이너스 빨강
  function pnBars(items, w, h, fs){   // items: [{l, v, t, hl}]
    if (!items.length) return "";
    var mx = Math.max.apply(null, items.map(function(x){ return Math.abs(x.v); })) || 1, n = items.length, bw = Math.min(90, w / n - 10), mid = h / 2;
    var anyNeg = items.some(function(x){ return x.v < 0; }), base = anyNeg ? mid : h - fs * 1.2;
    var cols = items.map(function(x){
      var bh = Math.max(2, Math.abs(x.v) / mx * (anyNeg ? mid - fs * 1.6 : h - fs * 2.6)), pos = x.v >= 0, col = x.hl ? NAVY : pos ? "#22a06b" : "#e0533d";
      return '<div style="position:relative;width:' + bw + 'px;height:' + h + 'px">' +
        '<div style="position:absolute;left:0;width:' + bw + 'px;' + (pos ? 'bottom:' + (h - base) + 'px' : 'top:' + base + 'px') + ';height:' + bh + 'px;background:' + col + ';border-radius:' + (pos ? '5px 5px 0 0' : '0 0 5px 5px') + '"></div>' +
        '<div style="position:absolute;left:-20px;width:' + (bw + 40) + 'px;text-align:center;font-size:' + Math.round(fs * 0.85) + 'px;font-weight:800;color:' + col + ';' + (pos ? 'bottom:' + (h - base + bh + 3) + 'px' : 'top:' + (base + bh + 3) + 'px') + '">' + e(x.t) + '</div></div>';
    }).join("");
    return '<div style="position:relative"><div style="display:flex;justify-content:space-around;align-items:flex-start;height:' + h + 'px;position:relative">' +
      '<div style="position:absolute;left:0;right:0;top:' + base + 'px;border-top:1px solid #c7ced9"></div>' + cols + '</div>' +
      '<div style="display:flex;justify-content:space-around;font-size:' + Math.round(fs * 0.8) + 'px;color:' + SUB + ';margin-top:4px">' + items.map(function(x){ return '<div style="width:' + (bw + 16) + 'px;text-align:center;line-height:1.3">' + e(x.l).replace(/\n/g, "<br>") + '</div>'; }).join("") + '</div></div>';
  }

  /* ───────── 계산 ───────── */
  function lines(f, amt){ return (f.alloc || []).map(function(a){ return {a: a, won: amt * (+a.pct || 0) / 100}; }); }
  function taxLine(f){
    if (!f.tax) return null;
    var L = f.tax.limit * 10000;
    return f.tax.rates.map(function(r){ return {rate: r[0], who: r[1], won: L * r[0] / 100, full: Math.round(L * r[0] / 100).toLocaleString("ko-KR") + "원"}; });
  }
  var CUR = {KRW: "원", USD: "달러", BRL: "헤알"};
  function fxOf(p, S){ return p.cur === "KRW" ? 1 : (p.fx || S.fx || 1); }
  // 채권: 만기까지 들고 가면
  function bondCalc(S, amt){
    var rows = (S.picks || []).map(function(p){
      var a = amt * p.pct / 100, fx = fxOf(p, S), ac = a / fx, face = ac / p.p, cpnAll, tax, total;
      if (p.comp5){ var g = Math.pow(1 + p.cpn / 100, 5); cpnAll = face * (g - 1); }
      else cpnAll = face * p.cpn / 100 * p.yrs;
      tax = cpnAll * (p.tax_int || 0) / 100; total = face + cpnAll - tax;
      var krw = total * fx, cagr = Math.pow(krw / a, 1 / p.yrs) - 1;
      var perYear = p.comp5 ? 0 : face * p.cpn / 100 * (1 - (p.tax_int || 0) / 100) * fx;
      var be = p.cur === "KRW" ? null : (a / (total * fx) - 1) * 100;
      return {p: p, a: a, fx: fx, face: face, cpnAll: cpnAll, tax: tax, gain: face - ac, total: total, krw: krw, cagr: cagr * 100, perYear: perYear, be: be};
    });
    var tot = rows.reduce(function(s, r){ return s + r.krw; }, 0);
    var yrs = rows.length ? rows.reduce(function(s, r){ return s + r.p.yrs * r.a; }, 0) / (amt || 1) : 0;
    var fxScen = (S.fx_moves || []).map(function(m){ var k = rows.reduce(function(s, r){ return s + (r.p.cur === "KRW" ? r.krw : r.krw * (1 + m / 100)); }, 0); return {m: m, krw: k, pnl: k - amt, pct: (k / amt - 1) * 100}; });
    // 1년 들고 있는 동안 버는 몫(만기수익률 − 이자 세금) + 금리 변화로 값이 변하는 몫(듀레이션)
    var carry = function(r){ var y = (r.p.y || 0) / 100, cy = r.p.comp5 ? 0 : (r.p.cpn / 100) / r.p.p; return y - cy * (r.p.tax_int || 0) / 100; };
    var after1 = function(r, d, fxm){ var v = r.a * (1 + carry(r) - Math.min(r.p.dur, r.p.yrs) * d / 100); return r.p.cur === "KRW" ? v : v * (1 + fxm / 100); };
    var rateScen = (S.rate_moves || []).map(function(d){ var v = rows.reduce(function(s, r){ return s + after1(r, d, 0) - r.a; }, 0); return {d: d, pnl: v, pct: v / (amt || 1) * 100}; });
    var heat = null;
    if (S.cur !== "KRW"){
      var fm = S.cur === "MIX" ? [-30, -20, -10, 0, 10, 20] : [-15, -10, -5, 0, 5, 10, 15], dm = [-1, -0.5, 0, 0.5, 1];
      heat = {fx: fm, d: dm, cells: fm.map(function(m){ return dm.map(function(d){ var v = rows.reduce(function(s, r){ return s + after1(r, d, m); }, 0) - amt; return {pnl: v, pct: v / (amt || 1) * 100}; }); })};
    }
    var years = [], maxY = Math.ceil(Math.max.apply(null, rows.map(function(r){ return r.p.yrs; }).concat([0])));
    for (var y = 1; y <= Math.min(maxY, 30); y++){ var c = rows.reduce(function(s, r){ return s + (y <= Math.ceil(r.p.yrs) ? r.perYear : 0); }, 0); years.push({y: y, v: c}); }
    return {heat: heat, rows: rows, tot: tot, pnl: tot - amt, cagr: amt ? (Math.pow(tot / amt, 1 / (yrs || 1)) - 1) * 100 : 0, yrs: yrs, fxScen: fxScen, rateScen: rateScen, years: years,
            be: (function(){ var kr = 0, fx = 0; rows.forEach(function(r){ if (r.p.cur === "KRW") kr += r.krw; else fx += r.krw; }); return fx ? ((amt - kr) / fx - 1) * 100 : null; })()};
  }
  function elsCalc(S, amt){
    return (S.picks || []).map(function(p){
      var a = amt * p.pct / 100, h = p.hist || {}, k = h.k || [], prev = 0, out = [];
      (p.steps.length ? p.steps : [0, 0, 0, 0, 0, 0]).forEach(function(b, i){
        var cum = k[i] != null ? k[i] : null, pr = cum != null ? Math.max(0, cum - prev) : null; if (cum != null) prev = cum;
        out.push({t: (i + 1) * (p.cyc || 6), bar: b, won: a * (1 + p.cpn / 100 * (i + 1) * (p.cyc || 6) / 12), pr: pr});
      });
      var rest = Math.max(0, 100 - prev), loss = h.loss || 0;
      var tail = p.pp ? [{lab: "원금만 돌려받음 (이자 없음)", won: a, pr: rest}] : [{lab: "만기 손실 (낙인 후 회복 못 함)", won: a * (1 + (h.loss_avg || -40) / 100), pr: loss, worst: h.loss_worst}].concat(rest - loss > 0.05 ? [{lab: "그 밖 (만기 원금 상환 등)", won: a, pr: rest - loss}] : []);
      var ev = out.reduce(function(s, o){ return s + (o.pr || 0) / 100 * o.won; }, 0) + tail.reduce(function(s, o){ return s + (o.pr || 0) / 100 * o.won; }, 0);
      return {p: p, a: a, steps: out, tail: tail, ev: ev, y1: (k[1] != null ? k[1] : null)};
    });
  }
  function eqCalc(S, amt){
    var b = S.bt, g = function(r, y){ return amt * Math.pow(1 + r / 100, y); };
    return {b: b, y1: [{l: "나쁜 해 (하위 10%)", r: b.y1.p10}, {l: "보통 해 (중간)", r: b.y1.p50}, {l: "좋은 해 (상위 10%)", r: b.y1.p90}].map(function(x){ return {l: x.l, r: x.r, won: g(x.r, 1)}; }),
            y5: b.y5 ? [{l: "나쁜 5년", r: b.y5.p10}, {l: "보통 5년", r: b.y5.p50}, {l: "좋은 5년", r: b.y5.p90}].map(function(x){ return {l: x.l, r: x.r, won: g(x.r, 5)}; }) : null,
            mdd: amt * b.mdd / 100};
  }
  function contrib(S, f){
    if (!S || !S.contrib) return null;
    var c = S.contrib * 10000, r = (S.bt.cagr || 6) / 100, r2 = ((S.bt.y5 && S.bt.y5.p10) || 2) / 100;
    var fv = function(rate, y){ var v = 0; for (var i = 0; i < y; i++) v = (v + c) * (1 + rate); return v; };
    return [10, 20].map(function(y){ return {y: y, put: c * y, mid: fv(r, y), low: fv(r2, y), tax165: c * y * 0.165, tax132: c * y * 0.132}; });
  }
  // 한 줄 요약 (한 장·요약 쪽)
  function simLine(f, amt){
    var S = f.sim; if (!S || !amt) return null;
    if (S.kind === "bond"){ var B = bondCalc(S, amt);
      return {big: man(B.tot), lab: "만기까지 들고 가면 받는 돈" + (S.cur === "KRW" ? " (세후)" : " (환율 그대로)"), sub: "이익 " + man(B.pnl) + " · 연 " + B.cagr.toFixed(1) + "% · 평균 " + B.yrs.toFixed(1) + "년" + (B.be != null ? " · 환율이 " + Math.abs(B.be).toFixed(0) + "% 넘게 안 빠지면 이익" : "")}; }
    if (S.kind === "els"){ var E = elsCalc(S, amt), ev = E.reduce(function(s, x){ return s + x.ev; }, 0), y1 = E.reduce(function(s, x){ return s + (x.y1 || 0) * x.a; }, 0) / amt;
      return {big: man(ev - amt), lab: "과거 확률로 본 평균 이익 (가입 금액 대비)", sub: "1년 안에 끝난 비율 약 " + Math.round(y1) + "% · 손실 비율 " + E.filter(function(x){ return !x.p.pp; }).map(function(x){ return ((x.p.hist || {}).loss || 0) + "%"; }).join("·")}; }
    if (S.kind === "equity"){ var Q = eqCalc(S, amt);
      return {big: "연 " + S.bt.cagr + "%", lab: S.bt.from.slice(0, 4) + "년부터 이 비중이었다면 (연평균)", sub: "1년 뒤 보통 " + man(Q.y1[1].won) + " · 나쁜 해 " + man(Q.y1[0].won) + " · 최대 하락 " + S.bt.mdd + "%"}; }
    return null;
  }
  /* ───────── 🎯 목표에서 거꾸로 (A10/30-1) ─────────
     처음 한 번에 · 매달 · 기간 · 목표 금액을 넣으면 → 폼마다 「과거에 이 기간을 매달 시작했다고 치면 몇 번 목표에 닿았나」
     주식·연금 폼 = proposal.json sim.bt.growth(매달 말 값)로 휴대폰에서 셈 · 채권 = 지금 금리(세후·환율 그대로) 그대로일 때 · ELS = 3년 안에 끝나 계산 밖
     매달 넣는 돈은 그달 첫날 넣는다고 침 · 배당·세금·수수료 빼고 · 과거 계산 · 보장 아님 · 입력은 이 휴대폰에만(propgoal) */
  var GL = (function(){ try { return JSON.parse(localStorage.getItem("propgoal") || "{}") || {}; } catch(x) { return {}; } })();
  function gkeep(){ try { localStorage.setItem("propgoal", JSON.stringify(GL)); } catch(x) {} }
  function gIn(){ return {L: (+GL.l || 0) * 1e4, M: (+GL.m || 0) * 1e4, H: Math.round((+GL.y || 0) * 12), G: (+GL.g || 0) * 1e4}; }
  function gOn(){ var q = gIn(); return q.H > 0 && q.G > 0 && (q.L > 0 || q.M > 0); }
  function gFv(q, r){ var a = Math.pow(1 + r, 1 / 12), v = q.L * Math.pow(a, q.H); for (var j = 0; j < q.H; j++) v += q.M * Math.pow(a, q.H - j); return v; }
  function gNeed(){   // 목표에 닿으려면 필요한 연 수익률
    var q = gIn(), put = q.L + q.M * q.H;
    if (put >= q.G) return {r: 0, put: put, enough: true};
    if (gFv(q, 1) < q.G) return {r: Infinity, put: put};
    var lo = -0.5, hi = 1; for (var i = 0; i < 50; i++){ var m = (lo + hi) / 2; if (gFv(q, m) >= q.G) hi = m; else lo = m; }
    return {r: hi * 100, put: put};
  }
  function gEq(bt){
    var g = bt && bt.growth, v = g && g.vals, lb = g && g.labels; if (!v || v.length < 24) return null;
    var q = gIn(), n = v.length - q.H; if (n < 12) return {few: 1, n: Math.max(0, n)};
    var hit = 0, worst = null, wi = 0, all = [];
    for (var i = 0; i < n; i++){ var end = v[i + q.H], val = q.L * end / v[i]; for (var j = 0; j < q.H; j++) val += q.M * end / v[i + j];
      all.push(val); if (val >= q.G) hit++; if (worst == null || val < worst){ worst = val; wi = i; } }
    all.sort(function(a, b){ return a - b; });
    return {n: n, hit: hit, pct: Math.round(hit / n * 100), worst: worst, wfrom: lb[wi], med: all[Math.floor(n / 2)], from: lb[0]};
  }
  function gOf(f){   // 폼 하나 → 배지 재료
    if (!f || !f.sim || !gOn()) return null;
    var S = f.sim, nd = gNeed();
    if (S.kind === "equity"){ var R = gEq(S.bt); if (!R) return null; R.kind = "eq"; return R; }
    if (S.kind === "bond"){ var B = bondCalc(S, 1e8), y = B.cagr; if (!isFinite(y)) return null;
      return {kind: "bond", y: y, ok: nd.enough || y >= nd.r, fx: S.cur !== "KRW", val: gFv(gIn(), y / 100), yrs: B.yrs}; }
    if (S.kind === "els") return {kind: "els"};
    return null;
  }
  function gBadge(f){
    var R = gOf(f); if (!R) return {c: "", h: ""};
    if (R.kind === "els") return {c: "na", h: '<b>⚪ 계산 밖</b><small>3년 안에 끝나는 상품</small>'};
    var sh = function(v){ return v >= 1e8 ? (v / 1e8).toFixed(1).replace(/\.0$/, "") + "억" : Math.round(v / 1e4).toLocaleString("ko-KR") + "만"; };
    if (R.kind === "bond") return {c: R.ok ? "ok" : "no", h: '<b>' + (R.ok ? "🟢 닿음" : "⚪ 모자람") + '</b><small>지금 금리 연 ' + R.y.toFixed(1) + '%' + (R.fx ? ' · 환율 그대로' : ' · 세후') + '</small>'};
    if (R.few) return {c: "na", h: '<b>⚪ 못 셈</b><small>기간이 길어 과거 ' + R.n + '번뿐</small>'};
    return {c: R.pct >= 70 ? "ok" : R.pct >= 40 ? "mid" : "no", h: '<b>' + (R.pct >= 70 ? "🟢" : R.pct >= 40 ? "🟡" : "⚪") + ' ' + R.pct + '% 닿음</b><small>' + R.n + '번 중 ' + R.hit + '번 · 최악 ' + sh(R.worst) + '</small>'};
  }
  function gWho(){ var q = gIn(); return [q.L ? "처음 " + man(q.L) : "", q.M ? "매달 " + man(q.M) : ""].filter(Boolean).join(" + ") + " · " + (+GL.y) + "년 · 목표 " + man(q.G); }
  function gSum(){
    if (!gOn()) return '<span class="mut">처음 넣을 돈이나 매달 넣을 돈 중 하나 + 기간 + 목표를 채우면 아래 폼마다 「과거에 닿았던 비율」이 붙어요</span>';
    var nd = gNeed(), q = gIn();
    return '넣는 돈 합계 <b>' + man(nd.put) + '</b> → 목표 <b>' + man(q.G) + '</b> · ' +
      (nd.enough ? '<b>넣은 돈만으로 닿음</b> (수익 0%여도)' : nd.r === Infinity ? '<b>연 100% 넘게 벌어야</b> — 목표를 다시 보세요' : '필요한 연 수익률 약 <b>' + nd.r.toFixed(1) + '%</b>') +
      '<br><span class="mut">주식·연금 폼 = 2006~07년부터 매달 시작했다고 치고 센 과거 계산 · 매달 돈은 그달 첫날 · 배당·세금·수수료 빼고 · 채권 = 지금 금리가 내내 그대로일 때 · 보장 아님</span>';
  }
  function gUpd(){
    var s = document.getElementById("ppgs"); if (s) s.innerHTML = gSum();
    ((DATA && DATA.forms) || []).forEach(function(f0){ var el = document.getElementById("ppgb_" + f0.key); if (!el) return; var B = gBadge(f0); el.className = "pp-gb " + B.c; el.innerHTML = B.h; });
  }
  function gLine(f){   // 한 장·📲·PDF 표지에 넣는 한 줄 (고객용 — 매수 권유 말 없음)
    var R = gOf(f); if (!R || R.kind === "els" || R.few) return "";
    if (R.kind === "bond") return "🎯 " + gWho() + " → 지금 금리(연 " + R.y.toFixed(1) + "%" + (R.fx ? ", 환율 그대로" : ", 세후") + ")가 그대로면 약 " + man(R.val) + " · 금리·환율은 바뀔 수 있음";
    return "🎯 " + gWho() + " → " + String(R.from).slice(0, 4) + "년부터 과거 " + R.n + "번 중 " + R.hit + "번 닿음(" + R.pct + "%) · 가운데 " + man(R.med) + " · 가장 나쁠 때 " + man(R.worst) + " · 과거 계산 · 보장 아님";
  }
  function gUI(){
    var inp = function(k, lab, ph, unit){ return '<label>' + lab + '<span class="pp-ar"><input inputmode="numeric" data-gk="' + k + '" placeholder="' + ph + '" value="' + e(GL[k] || "") + '"><span>' + unit + '</span></span></label>'; };
    return '<details class="pp-gl no-clp" data-xc="1" data-cz="done"' + (gOn() ? ' open' : '') + '><summary>🎯 목표에서 거꾸로 <small>매달 얼마 · 몇 년 · 목표 금액 → 폼마다 과거에 닿았던 비율</small></summary>' +
      '<div class="pp-gi">' + inp("l", "처음 한 번에", "예: 5000", "만원") + inp("m", "매달", "예: 100", "만원") + inp("y", "기간", "예: 10", "년") + inp("g", "목표", "예: 30000", "만원") + '</div>' +
      '<div class="pp-q pp-gq">' + [3, 5, 10, 15].map(function(y){ return '<button type="button" data-gy="' + y + '"' + (+GL.y === y ? ' class="on"' : '') + '>' + y + '년</button>'; }).join("") +
      '<button type="button" data-gx="1">지우기</button></div><div id="ppgs" class="pp-gs">' + gSum() + '</div></details>';
  }
  function model(){
    var items = ST.sel.map(function(k){ var f = formX(k); return f ? {f: f, amt: amtOf(k)} : null; }).filter(Boolean);
    return {cust: (ST.cust || "").trim(), pb: (ME.pb || "").trim(), org: (ME.org || "").trim(), date: dlabel(), items: items,
            total: items.reduce(function(s, x){ return s + x.amt; }, 0), notice: DATA.notice || [], basis: DATA.basis || ""};
  }
  function titleOf(m){ return m.items.length === 1 ? m.items[0].f.title : m.items.map(function(x){ return x.f.short; }).slice(0, 3).join(" · ") + (m.items.length > 3 ? " 외 " + (m.items.length - 3) : "") + " 포트폴리오"; }
  function custName(m){ return m.cust ? m.cust + " 고객님" : "고객님"; }
  function byLine(m){ return [m.org, m.pb ? m.pb + (/PB|팀장|부장|이사|대리|과장|차장|매니저|상무|센터장|지점장|실장/.test(m.pb) ? "" : " PB") : ""].filter(Boolean).join(" · "); }

  /* ───────── 공통 조각 ───────── */
  // 10/28 아이폰 다크 모드에서 글자가 흐리게(거의 안 보이게) 나오던 것 → 맨 바깥 대신 안쪽 상자에 글자색을 박아 둠
  function wrapInk(html, bg){ return '<div style="color:' + INK + ';background:' + (bg || "transparent") + '">' + html + '</div>'; }
  function kpiTiles(kp, fs, cols){
    kp = (kp || []).filter(function(x){ return x && x.value && x.value !== "–"; });
    return '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:' + Math.round(fs * 0.55) + 'px">' + kp.map(function(x){
      var c = x.tone > 0 ? "#1a8a5a" : x.tone < 0 ? UP : INK;
      return '<div style="background:#fff;border:1px solid ' + LINE + ';border-radius:' + Math.round(fs * 0.6) + 'px;padding:' + Math.round(fs * 0.6) + 'px ' + Math.round(fs * 0.7) + 'px;color:' + INK + '">' +
        '<div style="font-size:' + Math.round(fs * 0.78) + 'px;color:' + SUB + ';font-weight:700">' + e(x.label) + '</div>' +
        '<div style="font-size:' + Math.round(fs * 1.4) + 'px;font-weight:800;color:' + c + ';letter-spacing:-0.5px;margin:2px 0">' + e(x.value) + '</div>' +
        '<div style="font-size:' + Math.round(fs * 0.74) + 'px;color:' + SUB + ';line-height:1.35">' + e(x.sub || "") + '</div></div>';
    }).join("") + '</div>';
  }
  function legend(ls, fs, showWon){
    return ls.map(function(l){ var a = l.a;
      return '<div style="display:flex;align-items:center;gap:' + Math.round(fs * 0.5) + 'px;padding:' + Math.round(fs * 0.45) + 'px 0;border-bottom:1px solid ' + LINE + ';font-size:' + fs + 'px;color:' + INK + '">' +
        '<span style="flex:none;width:' + Math.round(fs * 0.75) + 'px;height:' + Math.round(fs * 0.75) + 'px;border-radius:3px;background:' + a.color + '"></span>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:800;color:' + INK + '">' + e(a.name) + '</div><div style="font-size:' + Math.round(fs * 0.8) + 'px;color:' + SUB + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(a.inst || "") + (a.code && String(a.code).length < 12 ? " (" + e(a.code) + ")" : "") + '</div></div>' +
        '<div style="text-align:right;flex:none"><div style="font-weight:800;color:' + INK + '">' + pc(a.pct) + '</div>' + (showWon ? '<div style="font-size:' + Math.round(fs * 0.82) + 'px;color:' + NAVY + ';font-weight:700">' + man(l.won) + '</div>' : '') + '</div></div>';
    }).join("");
  }
  function tbl(t, fs, opt){
    if (!t || !t.rows || !t.rows.length) return "";
    opt = opt || {};
    return (t.title ? '<div style="font-size:' + (fs + 2) + 'px;font-weight:800;margin:4px 0 8px;color:' + INK + '">' + e(t.title) + '</div>' : '') + '<table style="width:100%;border-collapse:collapse;font-size:' + fs + 'px;color:' + INK + '">' +
      '<tr>' + t.cols.map(function(c, i){ return '<th style="text-align:' + (i && opt.right ? "right" : "left") + ';background:' + NAVY + ';color:#fff;padding:7px 8px;font-weight:700">' + e(c) + '</th>'; }).join("") + '</tr>' +
      t.rows.map(function(r, i){ var hl = opt.hl && opt.hl(r, i); return '<tr style="background:' + (hl ? "#fff6e8" : i % 2 ? "#f7f9fc" : "#fff") + '">' + r.map(function(c, j){ return '<td style="padding:' + (opt.pad || "6px 8px") + ';border-bottom:1px solid ' + LINE + ';vertical-align:top;color:' + INK + ';' + (opt.nowrap ? 'white-space:nowrap;' : '') + 'text-align:' + (j && opt.right ? "right" : "left") + (hl || (opt.bold && opt.bold(j)) ? ';font-weight:800' : '') + '">' + (opt.raw ? c : e(c)) + '</td>'; }).join("") + '</tr>'; }).join("") + '</table>' +
      (t.src ? '<div style="font-size:' + (fs - 1) + 'px;color:' + SUB + ';margin-top:4px">자료: ' + e(t.src) + '</div>' : '');
  }
  function box(inner, extra){ return '<div style="background:' + BG + ';border-radius:14px;padding:16px 18px;color:' + INK + ';' + (extra || "") + '">' + inner + '</div>'; }
  function bullets(arr, fs, color){ return (arr || []).map(function(p){ return '<div style="display:flex;gap:10px;font-size:' + fs + 'px;line-height:1.6;margin-top:7px;color:' + INK + '"><span style="flex:none;color:' + (color || NAVY) + ';font-weight:900">▸</span><span>' + e(p) + '</span></div>'; }).join(""); }

  function onePageExtra(f, amt, multi){
    var S = f.sim; if (!S || !amt || multi) return "";
    var o = "";
    if (f.must && f.must.length) o += '<div style="margin:0 26px 16px;background:#fffaee;border-radius:16px;padding:14px 18px;color:' + INK + '"><div style="font-size:21px;color:' + SUB + ';font-weight:700;margin-bottom:8px">⭐ 추천 종목·ETF</div><div style="display:flex;gap:8px;flex-wrap:wrap">' +
      f.must.map(function(a){ var r0 = (a.reason || []).filter(function(t){ return /^(🔗|📈|📊|💡)/.test(t); })[0] || (a.reason || [])[0] || "";
        return '<div style="flex:1 1 45%;background:#fff;border:1px solid ' + LINE + ';border-left:6px solid ' + a.color + ';border-radius:12px;padding:8px 12px;font-size:22px"><b>' + e(a.inst.split(" · ")[0]) + '</b> ' + pc(a.pct) + ' <span style="color:' + NAVY + ';font-weight:800">' + man(amt * a.pct / 100) + '</span>' +
          (r0 ? '<div style="font-size:17px;color:' + SUB + ';line-height:1.4;margin-top:3px">' + e(r0) + '</div>' : '') + '</div>'; }).join("") + '</div></div>';
    if (f.mode) o += '<div style="margin:0 26px 16px;font-size:21px;color:' + INK + '">' + (f.mode === "usd" ? "💵 <b>환전해서</b> 미국 상장 ETF로 — 매매차익 분리과세 22%(250만원 공제)" : "💴 <b>원화로</b> 국내 상장 ETF로 — 환전 없이 바로 · 배당소득세 15.4%") + '</div>';
    if (f.themes && f.themes.length) o += '<div style="margin:0 26px 16px;background:#fff7ef;border-radius:16px;padding:14px 18px;color:' + INK + '"><div style="font-size:21px;color:' + SUB + ';font-weight:700;margin-bottom:8px">🧭 시황 테마 칸 — 리포트가 고른 「돈이 몰리는 곳」</div><div style="display:flex;gap:8px;flex-wrap:wrap">' +
      f.themes.map(function(t){ return '<span style="background:#fff;border:1px solid ' + LINE + ';border-left:6px solid ' + t.color + ';border-radius:12px;padding:8px 12px;font-size:21px"><b>' + e(t.name) + '</b> ' + pc(t.w) + ' <span style="color:' + NAVY + ';font-weight:800">' + man(amt * t.w / 100) + '</span><br><span style="font-size:17px;color:' + SUB + '">' + e(t.pick.name) + '</span></span>'; }).join("") + '</div></div>';
    if (S.kind === "equity"){
      if (S.look) o += '<div style="margin:0 26px 16px;background:' + BG + ';border-radius:16px;padding:14px 18px;color:' + INK + '"><div style="font-size:21px;color:' + SUB + ';font-weight:700;margin-bottom:8px">🔍 실제로 담기는 회사 TOP 5 (' + S.look.n + '개 회사에 나눠 담김)</div><div style="display:flex;gap:8px;flex-wrap:wrap">' +
        S.look.top.slice(0, 5).map(function(t){ return '<span style="background:#fff;border:1px solid ' + LINE + ';border-radius:12px;padding:8px 12px;font-size:21px"><b>' + e(t.n) + '</b> <span style="color:' + NAVY + ';font-weight:800">' + man(amt * t.w / 100) + '</span></span>'; }).join("") + '</div></div>';
      var cr = (S.stress || []).filter(function(r){ return /코로나|금융위기/.test(r.name); });
      if (cr.length) o += '<div style="margin:0 26px 16px;background:#fff4f2;border-radius:16px;padding:14px 18px;color:' + INK + '"><div style="font-size:21px;color:' + SUB + ';font-weight:700;margin-bottom:6px">🌪️ 위기 때는 (이 제안 vs 코스피만)</div>' +
        cr.map(function(r){ var w = r["이 제안"], k = r["코스피만"]; return '<div style="font-size:22px;padding:3px 0">' + e(r.name) + ': <b style="color:' + UP + '">' + sgn(w.ret, 1) + '</b> (' + man(Math.abs(amt * w.ret / 100)) + (w.rec != null ? ' · ' + w.rec + '개월 뒤 회복' : '') + ')' + (k ? ' <span style="color:' + SUB + '">vs 코스피 ' + sgn(k.ret, 1) + '</span>' : '') + '</div>'; }).join("") + '</div>';
    }
    if (S.kind === "bond" && S.cur !== "KRW"){
      var B = bondCalc(S, amt), LV = fxLv(S);
      o += '<div style="margin:0 26px 16px;background:' + BG + ';border-radius:16px;padding:14px 18px;color:' + INK + '"><div style="font-size:21px;color:' + SUB + ';font-weight:700;margin-bottom:6px">🌐 만기 때 환율이 바뀌면 — 원화 손익</div>' +
        pnBars(B.fxScen.map(function(q){ return {l: (q.m > 0 ? "+" : q.m < 0 ? "−" : "") + Math.abs(q.m) + "%" + (LV.fx ? "\n" + (LV.fx * (1 + q.m / 100)).toLocaleString("ko-KR", {maximumFractionDigits: LV.d}) + "원" : ""), v: q.pnl, t: (q.pnl >= 0 ? "+" : "−") + man(Math.abs(q.pnl)), hl: q.m === 0}; }), 950, 150, 20) +
        (B.be != null ? '<div style="font-size:21px;margin-top:8px">👉 환율이 만기까지 <b>' + Math.abs(B.be).toFixed(0) + '%</b> 넘게 떨어지지만 않으면 원화로도 이익</div>' : '') + '</div>';
    }
    return o;
  }

  /* ═════════ ① 원페이지 (전송용 그림 1080px) ═════════ */
  function onePage(m){
    var W = 1080, multi = m.items.length > 1;
    var h = '<div class="ppx" style="width:' + W + 'px;background:' + BG + ';font-family:' + FONT + '">' + '<div style="color:' + INK + ';padding-bottom:28px">';
    h += '<div style="background:linear-gradient(135deg,' + NAVY + ' 0%,#24508a 100%);padding:52px 56px 46px;position:relative;overflow:hidden"><div style="color:#fff;position:relative">' +
      '<div style="position:absolute;right:-150px;top:-140px;width:360px;height:360px;border-radius:50%;background:rgba(255,255,255,.06)"></div>' +
      '<div style="font-size:24px;opacity:.85;font-weight:700;letter-spacing:1px;color:#fff">INVESTMENT PROPOSAL · ' + e(m.date) + '</div>' +
      '<div style="font-size:52px;font-weight:800;letter-spacing:-1.5px;margin-top:14px;line-height:1.2;color:#fff">' + e(custName(m)) + '을 위한<br>' + e(titleOf(m)) + '</div>' +
      (m.total ? '<div style="display:inline-block;margin-top:22px;background:rgba(255,255,255,.14);border-radius:16px;padding:12px 22px;font-size:28px;color:#fff">제안 금액 <b style="font-size:36px">' + man(m.total) + '</b></div>' : '') +
      (function(){ var gl = m.items.length === 1 ? gLine(m.items[0].f) : ""; return gl ? '<div style="margin-top:16px;font-size:22px;line-height:1.5;color:#fff;opacity:.95">' + e(gl) + '</div>' : ''; })() + '</div></div>';
    if (multi){
      var parts = m.items.map(function(x){ return {pct: m.total ? x.amt / m.total * 100 : 100 / m.items.length, color: x.f.color}; });
      h += '<div style="padding:30px 44px 0"><div style="font-size:31px;font-weight:800;margin-bottom:14px;color:' + INK + '">🧺 전체 나눠 담기</div><div style="background:#fff;border:1px solid ' + LINE + ';border-radius:22px;padding:24px;display:flex;gap:26px;align-items:center">' +
        donut(parts, 250, 50, "합계", m.total ? man(m.total) : m.items.length + "개") + '<div style="flex:1">' +
        m.items.map(function(x){ return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid ' + LINE + ';font-size:26px;color:' + INK + '"><span style="width:20px;height:20px;border-radius:4px;background:' + x.f.color + '"></span><b style="flex:1">' + e(x.f.icon + " " + x.f.short) + '</b><span style="font-weight:800">' + (m.total ? pc(x.amt / m.total * 100) : "") + '</span><span style="width:170px;text-align:right;color:' + NAVY + ';font-weight:800">' + man(x.amt) + '</span></div>'; }).join("") + '</div></div></div>';
    }
    m.items.forEach(function(x){
      var f = x.f, ls = lines(f, x.amt), mk = f.mkt || {}, sl = simLine(f, x.amt), ch = (mk.charts || [])[0];
      h += '<div style="padding:30px 44px 0"><div style="background:#fff;border:1px solid ' + LINE + ';border-radius:22px;overflow:hidden">' +
        '<div style="background:' + f.color + ';padding:20px 26px"><div style="display:flex;align-items:center;gap:14px;color:#fff"><span style="font-size:40px">' + e(f.icon) + '</span><div style="flex:1"><div style="font-size:31px;font-weight:800;color:#fff">' + e(f.title) + '</div><div style="font-size:21px;color:#fff;opacity:.92">' + e(f.sub) + '</div></div>' + (x.amt ? '<div style="font-size:30px;font-weight:800;color:#fff">' + man(x.amt) + '</div>' : '') + '</div></div>' +
        '<div style="padding:20px 26px 0"><div style="font-size:24px;font-weight:800;color:' + SUB + ';margin-bottom:10px">📊 ' + e(mk.title || "시장 지금") + '</div>' + kpiTiles((mk.kpis || []).filter(function(k){ return k.value && k.value !== "–"; }).slice(0, multi ? 3 : 4), 22, multi ? 3 : 4) + '</div>' +
        (ch && !multi ? '<div style="padding:18px 26px 0">' + chartBox(ch, 980, 220, 21) + '</div>' : '') +
        '<div style="padding:22px 26px 6px;font-size:27px;font-weight:800;line-height:1.45;color:' + NAVY + '">' + e(f.headline) + '</div>' +
        '<div style="display:flex;gap:26px;align-items:center;padding:6px 26px 14px">' + donut(f.alloc, multi ? 220 : 270, multi ? 44 : 54, x.amt ? "제안 금액" : "비중", x.amt ? man(x.amt) : "100%") +
        '<div style="flex:1;min-width:0">' + legend(ls, multi ? 22 : 24, !!x.amt) + '</div></div>' +
        (sl ? '<div style="margin:0 26px 16px;background:#eef4ff;border-radius:16px;padding:16px 20px;color:' + INK + '"><div style="font-size:21px;color:' + SUB + ';font-weight:700">🧮 모의 계산 · ' + e(sl.lab) + '</div><div style="font-size:38px;font-weight:800;color:' + NAVY + ';margin:2px 0">' + e(sl.big) + '</div><div style="font-size:21px;color:' + INK + '">' + e(sl.sub) + '</div></div>' : '') +
        onePageExtra(f, x.amt, multi) +
        (f.tax ? '<div style="margin:0 26px 16px;background:#effaf4;border-radius:14px;padding:12px 18px;font-size:23px;color:' + INK + '">🧾 연 ' + f.tax.limit + '만원 넣으면 세액공제 <b>' + taxLine(f).map(function(t){ return t.full + "(" + t.rate + "%)"; }).join(" / ") + '</b></div>' : '') +
        '<div style="padding:0 26px 22px">' + bullets((mk.view || f.points || []).slice(0, multi ? 2 : 3), multi ? 21 : 23, f.color) + '</div></div></div>';
    });
    h += '<div style="margin:30px 44px 0;padding:22px 26px;border-radius:18px;background:' + NAVY + '"><div style="display:flex;align-items:center;gap:18px;color:#fff"><div style="font-size:44px">🤝</div><div style="flex:1"><div style="font-size:21px;opacity:.8;color:#fff">제안</div><div style="font-size:30px;font-weight:800;color:#fff">' + e(byLine(m) || "담당 PB") + '</div></div><div style="font-size:21px;opacity:.8;text-align:right;color:#fff">' + e(m.date) + '</div></div></div>';
    var D = discOf(m), sl = simNo(m);
    h += '<div style="margin:22px 44px 0;padding:18px 24px;border:1.5px solid #d5dbe5;border-radius:16px;background:#fafbfd;color:#4a5363">' +
      '<div style="font-size:19px;font-weight:800;color:' + NAVY + ';margin-bottom:6px">⚖️ 투자위험 고지</div>' +
      '<div style="font-size:15.5px;line-height:1.6">' + shortDisc(D).map(function(t){ return '<div style="display:flex;gap:8px"><span style="color:' + NAVY + '">·</span><span>' + e(t) + '</span></div>'; }).join("") + '</div>' +
      (sl ? '<div style="font-size:15px;color:' + SUB + ';text-align:right;margin-top:6px">' + e(sl) + '</div>' : '') + '</div></div></div>';
    return h;
  }

  /* ═════════ ② 풀버전 PDF (A4 794×1123 쪽마다) ═════════ */
  var PW = 794, PH = 1123, CW = PW - 96;
  function page(inner, n, of, m, color){
    return '<div class="ppx" style="width:' + PW + 'px;height:' + PH + 'px;background:#fff;font-family:' + FONT + ';position:relative;overflow:hidden"><div style="color:' + INK + ';width:' + PW + 'px;height:' + PH + 'px;position:relative">' +
      '<div style="height:8px;background:' + (color || NAVY) + '"></div>' +
      '<div style="padding:30px 48px 0;color:' + INK + '">' + inner + '</div>' +
      '<div style="position:absolute;left:48px;right:48px;bottom:24px;display:flex;justify-content:space-between;font-size:11px;color:#8a93a3;border-top:1px solid ' + LINE + ';padding-top:9px"><span>' + e(m.foot || custName(m) + ' 투자 제안 · ' + m.date) + '</span><span>' + e(byLine(m)) + '</span><span>' + n + ' / ' + of + '</span></div></div></div>';
  }
  function hTitle(t, sub, color){ return '<div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ' + (color || NAVY) + '"><div style="font-size:24px;font-weight:800;letter-spacing:-0.8px;color:' + (color || NAVY) + '">' + t + '</div>' + (sub ? '<div style="font-size:13.5px;color:' + SUB + ';padding-bottom:3px">' + e(sub) + '</div>' : '') + '</div>'; }
  function secT(t, c){ return '<div style="display:flex;align-items:center;gap:8px;font-size:17.5px;font-weight:800;margin:14px 0 9px;color:' + INK + '"><span style="width:5px;height:19px;border-radius:3px;background:' + (c || NAVY) + '"></span>' + t + '</div>'; }

  // 10/28 사용자 「레이아웃에 좀 더 신경쓰자 여백이 너무 많아」 — 쪽을 미리 나누지 않고 덩어리(블록)를 재서 A4에 빈틈없이 채움
  function gap(n){ return '<div style="height:' + (n || 12) + 'px"></div>'; }
  function stat3(cells){ return '<div style="display:flex;gap:10px">' + cells.map(function(c){ return box('<div style="font-size:12.5px;color:' + SUB + ';font-weight:700">' + c[0] + '</div><div style="font-size:24px;font-weight:800;color:' + (c[2] || INK) + ';letter-spacing:-0.5px">' + c[1] + '</div>' + (c[3] ? '<div style="font-size:12.5px;color:' + INK + '">' + c[3] + '</div>' : ''), "flex:1;padding:12px 14px;background:" + (c[4] || BG)); }).join("") + '</div>'; }
  function fxLv(S){   // 시나리오 환율 수준 글자 (미국채: 달러·원 · 브라질: 헤알·원)
    var p = (S.picks || []).filter(function(q){ return q.cur !== "KRW"; })[0] || {}, fx = p.fx || S.fx;
    return {fx: fx, unit: p.cur === "BRL" ? "원/헤알" : "원/달러", d: p.cur === "BRL" ? 1 : 0};
  }
  function heatBlock(BB, S, A){
    var H = BB.heat, L = fxLv(S), mx = 0;
    H.cells.forEach(function(r){ r.forEach(function(c){ mx = Math.max(mx, Math.abs(c.pct)); }); });
    var col = function(p){ var t = Math.min(1, Math.abs(p) / (mx || 1)); return p >= 0 ? "rgba(34,160,107," + (0.12 + t * 0.7).toFixed(2) + ")" : "rgba(224,83,61," + (0.12 + t * 0.7).toFixed(2) + ")"; };
    var head = '<tr><th style="background:' + NAVY + ';color:#fff;padding:7px 8px;text-align:left;font-size:11.5px">환율 ↓ · 금리 →</th>' + H.d.map(function(d){ return '<th style="background:' + NAVY + ';color:#fff;padding:7px 6px;font-size:11.5px">' + (d === 0 ? "그대로" : (d > 0 ? "+" : "−") + Math.abs(d) + "%p") + '</th>'; }).join("") + '</tr>';
    var body = H.fx.map(function(m, i){ return '<tr><td style="padding:6px 8px;font-size:11.5px;font-weight:800;color:' + INK + ';border-bottom:1px solid #fff;background:' + BG + '">' + (m === 0 ? "그대로" : (m > 0 ? "+" : "−") + Math.abs(m) + "%") + (L.fx ? ' <span style="font-weight:500;color:' + SUB + '">' + (L.fx * (1 + m / 100)).toLocaleString("ko-KR", {maximumFractionDigits: L.d}) + '</span>' : '') + '</td>' +
      H.cells[i].map(function(c, j){ var me = m === 0 && H.d[j] === 0; return '<td style="padding:6px 6px;text-align:center;font-size:11.5px;font-weight:' + (me ? 900 : 700) + ';color:' + INK + ';background:' + col(c.pct) + ';border:1px solid #fff' + (me ? ';outline:2px solid ' + NAVY : '') + '">' + (c.pnl >= 0 ? "+" : "−") + man(Math.abs(c.pnl)).replace("원", "") + '<br><span style="font-weight:500;font-size:10.5px">' + sgn(c.pct, 1) + '</span></td>'; }).join("") + '</tr>'; }).join("");
    return '<!--K-->' + secT("🌐 1년 뒤 원화 손익 — 환율 × 금리 한눈에 (" + man(A) + " 기준)") +
      '<div style="display:flex;gap:14px;align-items:flex-start"><table style="flex:1.6;border-collapse:collapse;color:' + INK + '">' + head + body + '</table>' +
      '<div style="flex:1;font-size:12.5px;line-height:1.6;color:' + INK + '">' + box('<b>읽는 법</b><br>가로 = 1년 뒤 금리 변화, 세로 = 1년 뒤 ' + (S.cur === "MIX" ? "헤알·달러" : "달러") + ' 값 변화 (옆 숫자 = 그때 ' + L.unit + ')<br>초록은 이익, 빨강은 손실 · 진할수록 큼<br><br><b>핵심</b><br>' +
        '· 금리보다 <b>환율</b>이 손익을 더 크게 흔듦<br>· 가운데(둘 다 그대로) = 1년 이자만큼 이익<br>· 1년 뒤 팔지 않고 만기까지 들고 가면 금리 영향은 사라짐', "padding:12px 13px") + '</div></div>';
  }
  function eqBlocks(S, A, f){
    var B = [], b = S.bt;
    if (S.cmp && S.cmp.length > 1){
      var mxc = Math.max.apply(null, S.cmp.map(function(c){ return Math.abs(c.cagr); }));
      var rows = S.cmp.map(function(c){ return [(c.me ? "★ " : "") + c.name, sgn(c.cagr, 1), sgn(c.mdd, 1), c.pos + "%", (c.uw || 0) + "개월", man(A * Math.pow(1 + c.cagr / 100, 10))]; });
      B.push('<!--K-->' + secT("⚔️ 다른 선택과 비교 — 같은 기간(" + b.from.slice(0, 4) + "년~), 같은 금액") +
        '<div style="display:flex;gap:14px;align-items:flex-start"><div style="flex:2">' + tbl({cols: ["", "연평균", "최대 하락", "1년 이익 확률", "원금 아래 최장", "10년 뒤"], rows: rows}, 11, {right: true, nowrap: true, pad: "6px 6px", hl: function(r){ return r[0].indexOf("★") === 0; }}) + '</div>' +
        '<div style="flex:1">' + box('<div style="font-size:13px;font-weight:800;margin-bottom:4px">연평균 수익</div>' + hbars(S.cmp.map(function(c){ return [c.name, c.cagr, c.me ? f.color : "#b7c0cf", sgn(c.cagr, 1), c.me]; }), 11.5, mxc, 38) +
          '<div style="font-size:13px;font-weight:800;margin:8px 0 4px">최대 하락 (작을수록 좋음)</div>' + hbars(S.cmp.map(function(c){ return [c.name, Math.abs(c.mdd), c.me ? "#e0533d" : "#f2b8b0", sgn(c.mdd, 0), c.me]; }), 11.5, 60, 38), "padding:10px 12px") + '</div></div>');
    }
    if (S.stress && S.stress.length){
      var keys = ["이 제안", "코스피만", "S&P500만"];
      var cell = function(w, me){ if (!w) return "–"; var c = w.ret >= 0 ? "#1a8a5a" : UP; return '<b style="color:' + c + '">' + sgn(w.ret, 1) + '</b>' + (me ? '<br><span style="font-size:10.5px;color:' + SUB + '">' + (w.ret >= 0 ? "+" : "−") + man(Math.abs(A * w.ret / 100)) + (w.rec != null ? " · " + w.rec + "개월 뒤 회복" : "") + '</span>' : ''); };
      B.push('<!--K-->' + secT("🌪️ 위기 때는 어땠나 — 스트레스 테스트 (같은 금액이 그때 있었다면)") +
        tbl({cols: ["위기", "기간", "이 제안", "코스피만", "S&P500만"], rows: S.stress.map(function(r){ return [r.name, r.from.slice(2, 7).replace("-", ".") + "~" + r.to.slice(2, 7).replace("-", "."), cell(r["이 제안"], 1), cell(r["코스피만"]), cell(r["S&P500만"])]; })}, 11.5, {raw: true, right: true}) +
        '<div style="font-size:12px;color:' + SUB + ';margin-top:4px;line-height:1.5">달러 자산은 달러 기준 — 위기 때는 보통 달러값이 올라 원화로는 손실이 이보다 작았음 · 「회복」 = 위기 시작 때 금액을 되찾기까지</div>');
    }
    var L = S.look;
    if (L){
      var trs = L.top.slice(0, 10).map(function(t, i){ return [(i + 1) + ". " + t.n, t.sec, t.w.toFixed(2) + "%", man(A * t.w / 100)]; });
      B.push('<!--K-->' + secT("🔍 실제로 담기는 회사 — ETF 속을 열어 보면 (" + L.n + "개 회사에 나눠 담김)") +
        '<div style="display:flex;gap:14px;align-items:flex-start"><div style="flex:1.35">' + tbl({cols: ["회사", "업종", "비중", "금액"], rows: trs}, 11.5, {right: true, pad: "4px 8px"}) + '</div>' +
        '<div style="flex:1">' + box('<div style="font-size:13px;font-weight:800;margin-bottom:4px">🧩 업종별 (주식 칸 전체 기준)</div>' + hbars(L.sector.map(function(x, i){ return [x[0], x[1], ["#2f6fdf", "#7b5cff", "#1f9fb5", "#22a06b", "#e6a817", "#f08a3c", "#c9568f", "#4f8fbf", "#b7c0cf"][i % 9], x[1].toFixed(1) + "%"]; }), 11, null, 44), "padding:10px 12px") + '</div></div>' +
        '<div style="font-size:11.5px;color:' + SUB + ';margin-top:4px">S&P500·나스닥100 ETF 공식 구성표(' + e(L.asof || "") + ') × 제안 비중 · 두 ETF에 같이 든 회사는 합쳐서 계산</div>');
    }
    if (S.region && S.region.length){
      B.push(box('<div style="display:flex;gap:18px;align-items:center"><div style="font-size:13.5px;font-weight:800;flex:none">🌍 돈이 어디에 있나</div><div style="flex:1;display:flex;height:30px;border-radius:8px;overflow:hidden">' +
        S.region.map(function(r2, i){ return '<div style="width:' + r2[1] + '%;background:' + ["#2f6fdf", "#e0533d", "#e6a817", "#3fb28f", "#9aa3b2"][i % 5] + ';color:#fff;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;white-space:nowrap;overflow:hidden">' + (r2[1] >= 8 ? e(r2[0]) + " " + pc(r2[1]) : "") + '</div>'; }).join("") + '</div></div>' +
        '<div style="font-size:12px;color:' + SUB + ';margin-top:6px">' + S.region.map(function(r2){ return e(r2[0]) + " " + pc(r2[1]) + " · " + man(A * r2[1] / 100); }).join("  |  ") + '</div>', "padding:12px 14px"));
    }
    return B;
  }
  // 🔑 한눈에 3가지 — 상품마다 가장 중요한 숫자
  function keyStrip(f, amt){
    var S = f.sim, A = amt || 100000000, c = [];
    if (S && S.kind === "bond"){ var B = bondCalc(S, A);
      c = [["연 환산 수익", B.cagr.toFixed(2) + "%", NAVY, S.cur === "KRW" ? "세후 · 만기까지" : "환율 그대로일 때"], ["만기까지 받는 돈", man(B.tot), "#1a8a5a", (amt ? "" : "1억 기준 · ") + "평균 " + B.yrs.toFixed(1) + "년"],
        B.be != null ? ["견딜 수 있는 환율 하락", Math.abs(B.be).toFixed(0) + "%", UP, "만기까지 이만큼 빠져도 원화 이익"] : ["예금으로 치면", (f.avg_bank || 0).toFixed(2) + "%", UP, "이 이자를 예금으로 받으려면"]]; }
    else if (S && S.kind === "els"){ var E = elsCalc(S, A), y6 = E.reduce(function(s2, q){ return s2 + (((q.p.hist || {}).k || [])[0] || 0) * q.a; }, 0) / A, ls2 = E.filter(function(q){ return !q.p.pp; }).map(function(q){ return (q.p.hist || {}).loss || 0; });
      c = [["조건 충족 시 연 이자", "연 " + (f.avg || 0).toFixed(1) + "%", NAVY, "담은 상품 평균"], ["6개월에 바로 끝날 확률", Math.round(y6) + "%", "#1a8a5a", "2006년부터 다시 돌려 본 결과"], ["손실 났던 비율", (ls2.length ? Math.max.apply(null, ls2) : 0) + "%", UP, "지수형 ELS 중 가장 높은 것"]]; }
    else if (S && S.kind === "equity"){ var b = S.bt;
      c = [[b.from.slice(0, 4) + "년부터 연평균", "연 " + b.cagr + "%", NAVY, "이 비중을 그대로 유지했다면"], ["1년 들고 있으면 이익 날 확률", b.y1.pos + "%", "#1a8a5a", "5년이면 " + (b.y5 ? b.y5.pos : "–") + "%"], ["최악일 때 하락", sgn(b.mdd, 1), UP, "2008년 금융위기 포함"]]; }
    if (!c.length) return "";
    return '<div style="display:flex;gap:10px">' + c.map(function(x){ return '<div style="flex:1;border:1.5px solid ' + LINE + ';border-top:4px solid ' + x[2] + ';border-radius:12px;padding:10px 13px;color:' + INK + '"><div style="font-size:12.5px;color:' + SUB + ';font-weight:700">' + e(x[0]) + '</div><div style="font-size:25px;font-weight:800;color:' + x[2] + ';letter-spacing:-0.6px">' + e(x[1]) + '</div><div style="font-size:11.5px;color:' + SUB + '">' + e(x[3]) + '</div></div>'; }).join("") + '</div>';
  }
  function pkn(p){ return p.name.indexOf(p.code) >= 0 ? p.name : p.name + " (" + p.code + ")"; }
  // ⭐ 추천 종목 · 💱 원화 vs 환전
  function mustBlocks(f, x){
    var B = [], A = x.amt;
    if (f.must && f.must.length){ var Mt = Math.round(f.must.reduce(function(s2, a){ return s2 + a.pct; }, 0) * 10) / 10;
      var cardsM = f.must.map(function(a){ var rs = a.reason || [];
        return '<div style="border:1px solid ' + LINE + ';border-left:6px solid ' + a.color + ';border-radius:12px;padding:10px 13px;color:' + INK + ';display:flex;gap:14px">' +
          '<div style="flex:none;width:150px"><div style="font-size:15px;font-weight:800;line-height:1.3">' + e(a.inst.split(" · ")[0]) + '</div><div style="font-size:11.5px;color:' + SUB + '">' + e([a.code, a.inst.split(" · ")[1]].filter(Boolean).join(" · ")) + '</div>' +
          '<div style="font-size:22px;font-weight:900;color:' + a.color + ';margin-top:4px">' + pc(a.pct) + '</div>' + (A ? '<div style="font-size:14px;font-weight:800;color:' + NAVY + '">' + man(A * a.pct / 100) + '</div>' : '') + '</div>' +
          '<div style="flex:1;min-width:0;font-size:12.5px;line-height:1.55">' + (rs.length ? '<div style="font-size:12px;font-weight:800;color:' + SUB + ';margin-bottom:2px">왜 담나</div>' + rs.map(function(t){ return '<div style="padding:2px 0">' + e(t) + '</div>'; }).join("") : '<div style="color:' + SUB + '">' + e(a.why) + '</div>') + '</div></div>'; });
      B.push('<!--K-->' + secT("⭐ 추천 종목·ETF " + pc(Mt) + (A ? " · " + man(A * Mt / 100) : "") + " — 왜 담나", f.color) + (cardsM[0] || ""));
      cardsM.slice(1).forEach(function(c){ B.push(c); });
      B.push((f.mustPlan ? '<div style="display:flex;gap:12px;align-items:flex-start;margin-top:2px"><div style="flex:1.4;min-width:0">' + tbl({cols: ["칸", "기본 포트", "추천 종목 넣은 뒤", "금액"], rows: f.mustPlan.all.map(function(a){ return [a.name, a.k === "must" ? "–" : pc(a.was), pc(a.pct), A ? man(A * a.pct / 100) : "–"]; }).concat([["합계", "100%", "100%", A ? man(A) : "–"]])}, 11.5, {right: true, pad: "4px 8px", hl: function(r){ return r[0] === "합계" || r[0].indexOf("⭐") === 0; }}) + '</div>' +
          '<div style="flex:1;min-width:0">' + box('<div style="font-size:13px;font-weight:800;margin-bottom:6px">이렇게 맞춤</div><div style="font-size:12.5px;line-height:1.6">① 추천 종목 ' + pc(f.mustPlan.M) + '를 먼저 담음<br>② 기본 포트는 칸마다 원래 비율 그대로 ' + pc(r1(100 - f.mustPlan.M)) + '로 줄임<br>③ 합계 100%' + (RET[f.key] ? '<br>④ 위험자산 ' + pc(f.mustPlan.risky) + ' — 법정 한도 70% 안' : '') + '</div>' +
          (f.mustPlan.warn.length ? '<div style="font-size:12px;color:' + UP + ';margin-top:6px">⚠️ ' + f.mustPlan.warn.map(e).join(" · ") + '</div>' : ''), "padding:12px 13px") + '</div></div>' : '') +
        '<div style="font-size:12px;color:' + SUB + ';margin-top:6px;line-height:1.5">개별 종목은 한 회사 소식에 크게 흔들리므로 비중을 너무 키우지 않는 것을 권함</div>');
    }
    if (f.taxbox && f.taxbox.length){ var usd = f.mode === "usd", f0 = form(f.key) || {}, other = usd ? f0 : (f0.alt || {}).usd || {};
      B.push('<!--K-->' + secT("💱 " + (usd ? "💵 환전해서 투자" : "💴 원화로 투자") + "하는 방식 — 세금·거래", f.color) + '<div style="display:flex;gap:12px">' +
        box('<div style="font-size:14px;font-weight:800;margin-bottom:4px;color:' + NAVY + '">✅ 이번 제안: ' + (usd ? "미국 상장 ETF (달러)" : "국내 상장 ETF (원화)") + '</div>' + f.taxbox.map(function(t){ return '<div style="font-size:12.5px;line-height:1.5;padding:3px 0">· ' + e(t) + '</div>'; }).join(""), "flex:1;background:#eef4ff") +
        (other.taxbox ? box('<div style="font-size:14px;font-weight:800;margin-bottom:4px;color:' + SUB + '">다른 방식: ' + (usd ? "국내 상장 ETF (원화)" : "미국 상장 ETF (달러)") + '</div>' + other.taxbox.map(function(t){ return '<div style="font-size:12.5px;line-height:1.5;padding:3px 0;color:' + SUB + '">· ' + e(t) + '</div>'; }).join("") +
          '<div style="font-size:12px;margin-top:6px;color:' + INK + '"><b>이렇게 고름</b> — 금융소득이 연 2,000만원 넘는 분·매매차익이 큰 분은 환전(분리과세 22%)이, 연금 계좌·소액·원화 편의는 원화(국내 상장)가 유리함</div>', "flex:1") : '') + '</div>' +
        '<div style="font-size:11.5px;color:' + SUB + ';margin-top:5px">2026년 현행 세법 기준 · 개인 기준 · 바뀔 수 있음</div>');
    }
    return B;
  }
  // 🧭 시황 테마 칸 — 테마마다 카드 (10/29 사용자 「지수 위주로만 단조롭지 않아?」)
  function themeBlocks(f, x){
    var th = f.themes || []; if (!th.length) return [];
    var tp = ((f.alloc || []).filter(function(a){ return a.k === "theme"; })[0] || {}).pct || 0, A = x.amt;
    var sc = {"강함": ["#1a8a5a", "#e7f6ee"], "보통": ["#5b6576", "#eef1f6"], "약함": [UP, "#fdecea"]};
    var cards = th.map(function(t){ var c = sc[t.sig] || sc["보통"];
      return '<div style="border:1px solid ' + LINE + ';border-left:6px solid ' + t.color + ';border-radius:12px;padding:10px 12px;color:' + INK + ';background:#fff">' +
        '<div style="display:flex;align-items:baseline;gap:8px"><b style="font-size:15px">' + e(t.name) + '</b><span style="font-size:11px;font-weight:800;color:' + c[0] + ';background:' + c[1] + ';border-radius:99px;padding:1px 8px">' + e(t.sig) + '</span>' +
        '<span style="margin-left:auto;font-size:17px;font-weight:900;color:' + t.color + '">' + pc(t.w) + '</span>' + (A ? '<span style="font-size:12.5px;font-weight:800;color:' + NAVY + '">' + man(A * t.w / 100) + '</span>' : '') + '</div>' +
        '<div style="font-size:12.5px;line-height:1.45;margin-top:3px">' + e(t.txt) + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;font-size:11.5px">' +
          '<span style="background:' + BG + ';border-radius:8px;padding:3px 8px"><b>담을 ETF</b> ' + e(pkn(t.pick)) + ' · <span style="color:' + SUB + '">' + e(t.pick.where) + '</span></span>' +
          (t.stocks && t.stocks.length ? '<span style="background:' + BG + ';border-radius:8px;padding:3px 8px"><b>대표 종목</b> ' + e(t.stocks.slice(0, 3).join(" · ")) + '</span>' : '') + '</div>' +
        '<div style="font-size:11.5px;color:' + SUB + ';margin-top:5px">📈 ' + e(t.sig_txt) + (t.ret != null ? ' · 리포트 의견대로 ' + e(String(t.since || "").slice(5).replace("-", "/")) + '부터 ' + sgn(t.ret, 1) : '') + '</div></div>'; });
    var head = '<!--K-->' + secT("🧭 시황 테마 칸 " + pc(tp) + (A ? " · " + man(A * tp / 100) : "") + " — 매일 아침 리포트가 고른 「돈이 몰리는 곳」", f.color) +
      '<div style="display:flex;height:22px;border-radius:7px;overflow:hidden;margin-bottom:10px">' + th.map(function(t){ return '<div style="width:' + (t.w / tp * 100) + '%;background:' + t.color + ';color:#fff;font-size:10.5px;font-weight:800;display:flex;align-items:center;justify-content:center;white-space:nowrap;overflow:hidden">' + (t.w / tp > 0.12 ? e(t.name) : "") + '</div>'; }).join("") + '</div>';
    var out = [], half = Math.ceil(cards.length / 2);
    for (var i = 0; i < cards.length; i += 2) out.push((i ? "" : head) + '<div style="display:flex;gap:10px"><div style="flex:1;min-width:0">' + cards[i] + '</div><div style="flex:1;min-width:0">' + (cards[i + 1] || "") + '</div></div>');
    out[out.length - 1] += '<div style="font-size:11.5px;color:' + SUB + ';margin-top:8px;line-height:1.5">돈은 ETF로 담음 — 한 회사 소식에 덜 흔들리게. 대표 종목은 같은 테마의 대표 회사로, 직접 종목으로 담고 싶을 때 참고. 테마와 비중은 리포트 의견이 바뀌면 같이 바뀌고, 8주마다 지수보다 나았는지 점검해 늘리거나 줄임.</div>';
    return out;
  }
  // 🪪 채권 명함 — 고른 채권마다 한 장
  function cardBlocks(f, x){
    var S = f.sim; if (!S || S.kind !== "bond") return [];
    var cards = (S.picks || []).map(function(p, i){ var a = (f.alloc || []).filter(function(z){ return z.inst === p.name; })[0] || {};
      var rows = [["만기", (p.mat || "").slice(0, 10) + " (" + p.yrs.toFixed(1) + "년)"], ["표면금리", (p.cpn || 0) + "%" + (p.comp5 ? " (5년 복리 · 만기 한 번)" : " · " + (p.freq === 2 ? "6개월마다" : "1년마다"))],
        [p.cur === "KRW" ? "매수 금리 → 세후" : "만기수익률", p.cur === "KRW" ? (p.y || 0).toFixed(3) + "% → " + (p.after || 0).toFixed(2) + "%" : (p.y || 0).toFixed(2) + "% (" + CUR[p.cur] + ")"],
        ["금리 1%p 변할 때", "값 약 " + Math.min(p.dur, p.yrs).toFixed(1) + "% 반대로"], ["세금", p.tax_int ? "이자 15.4% · 차익 비과세" : "개인 비과세(조세협약)"], ["비중", pc(p.pct) + (x.amt ? " · " + man(x.amt * p.pct / 100) : "")]];
      return '<div style="flex:1;min-width:0;border:1px solid ' + LINE + ';border-radius:12px;overflow:hidden;color:' + INK + '"><div style="background:' + (a.color || f.color) + ';color:#fff;padding:8px 12px"><div style="font-size:11.5px;opacity:.9">' + e(p.slot) + '</div><div style="font-size:13.5px;font-weight:800;line-height:1.3">' + e(p.name) + '</div></div>' +
        '<div style="padding:6px 12px 8px">' + rows.map(function(r){ return '<div style="display:flex;justify-content:space-between;gap:8px;font-size:11.5px;padding:4px 0;border-bottom:1px dashed ' + LINE + '"><span style="color:' + SUB + ';flex:none">' + e(r[0]) + '</span><b style="text-align:right">' + e(r[1]) + '</b></div>'; }).join("") + '</div></div>'; });
    return ['<!--K-->' + secT("🪪 담을 채권 한 장씩", f.color) + '<div style="display:flex;gap:10px">' + cards.join("") + '</div>'];
  }
  // 🔮 앞으로 시나리오 — 무엇을 보고 · 이 상품엔 어떤 영향
  function scenBlock(f){
    var S = f.scen; if (!S || !S.rows || !S.rows.length) return null;
    var rows = S.rows.map(function(r){ var ch = r.prev != null && r.prev !== r.pct ? (r.pct > r.prev ? "▲ " : "▼ ") + Math.abs(r.pct - r.prev) + "%p" : "그대로";
      return '<div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid ' + LINE + ';color:' + INK + '">' +
        '<div style="flex:none;width:92px;text-align:center"><div style="font-size:30px;font-weight:900;color:' + r.color + ';letter-spacing:-1px">' + r.pct + '%</div><div style="height:7px;border-radius:9px;background:#eef1f6;overflow:hidden;margin:3px 6px"><div style="height:100%;width:' + r.pct + '%;background:' + r.color + '"></div></div><div style="font-size:11px;color:' + SUB + '">지난주 대비 ' + ch + '</div></div>' +
        '<div style="flex:1;min-width:0"><div style="font-size:15.5px;font-weight:800">' + e(r.label) + '</div>' + (r.plain ? '<div style="font-size:13px;color:' + INK + ';margin-top:2px">' + e(r.plain) + '</div>' : '') +
        (r.why ? '<div style="font-size:12px;color:' + SUB + ';margin-top:4px">📌 근거: ' + e(r.why) + '</div>' : '') +
        (r.impact ? '<div style="font-size:13px;margin-top:6px;background:' + BG + ';border-left:4px solid ' + f.color + ';border-radius:6px;padding:6px 10px">👉 <b>이 제안에는</b> ' + e(r.impact) + '</div>' : '') + '</div></div>'; }).join("");
    return '<!--K-->' + secT("🔮 앞으로 시나리오 — 무엇을 보고 · 이 제안엔 어떤 영향", f.color) + rows +
      '<div style="font-size:11.5px;color:' + SUB + ';margin-top:6px;line-height:1.5">' + e(S.src) + (S.note ? " · " + e(S.note) : "") + '</div>';
  }
  // 📋 가입 후 관리 · 📖 어려운 말 풀이
  function careBlocks(f){
    var c = f.care || [], g = f.gloss || []; if (!c.length && !g.length) return [];
    return ['<!--K-->' + '<div style="display:flex;gap:12px;align-items:flex-start">' +
      (c.length ? box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">📋 가입 후 이렇게 관리함</div>' + c.map(function(t){ return '<div style="display:flex;gap:8px;font-size:12.5px;line-height:1.5;padding:5px 0;border-bottom:1px dashed ' + LINE + '"><span style="flex:none;color:' + f.color + ';font-weight:900">✔</span><span>' + e(t) + '</span></div>'; }).join(""), "flex:1;background:#f3f8ff") : '') +
      (g.length ? box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">📖 어려운 말 풀이</div>' + g.map(function(t){ return '<div style="font-size:12.5px;line-height:1.5;padding:5px 0;border-bottom:1px dashed ' + LINE + '"><b style="color:' + f.color + '">' + e(t[0]) + '</b> — ' + e(t[1]) + '</div>'; }).join(""), "flex:1") : '') + '</div>'];
  }
  // 🎯 ELS 구조 그림 — 6개월마다 조건선 · 손실 기준선
  function elsShape(p, w, h, color){
    var st = p.steps && p.steps.length ? p.steps : null; if (!st) return "";
    var lo = Math.min(p.ki || 60, Math.min.apply(null, st)) - 8, hi = 106;
    var n = st.length, x = function(i){ return 50 + i * (w - 70) / (n - 1); }, y = function(v){ return 22 + (hi - v) / (hi - lo) * (h - 50); };
    var path = st.map(function(v, i){ return (i ? "L" : "M") + x(i) + " " + y(v); }).join(" ");
    var g = '<line x1="40" x2="' + (w - 10) + '" y1="' + y(100) + '" y2="' + y(100) + '" stroke="#9aa3b2" stroke-dasharray="4 4"/>' +
      (p.ki ? '<line x1="40" x2="' + (w - 10) + '" y1="' + y(p.ki) + '" y2="' + y(p.ki) + '" stroke="#e0533d" stroke-width="2" stroke-dasharray="7 5"/><rect x="40" y="' + y(p.ki) + '" width="' + (w - 50) + '" height="' + (h - 26 - y(p.ki)) + '" fill="#e0533d" fill-opacity="0.07"/>' : '') +
      '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="3"/>' + st.map(function(v, i){ return '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="5.5" fill="#fff" stroke="' + color + '" stroke-width="3"/>'; }).join("");
    var lbl = st.map(function(v, i){ return '<div style="position:absolute;left:' + (x(i) - 30) + 'px;top:' + (y(v) - 26) + 'px;width:60px;text-align:center;font-size:11px;font-weight:800;color:' + color + '">' + v + '%</div><div style="position:absolute;left:' + (x(i) - 30) + 'px;top:' + (h - 20) + 'px;width:60px;text-align:center;font-size:10.5px;color:' + SUB + '">' + ((i + 1) * 6) + '개월</div>'; }).join("");
    return '<div style="position:relative;width:' + w + 'px;height:' + h + 'px"><img src="' + svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' + g + '</svg>') + '" width="' + w + '" height="' + h + '" style="position:absolute;left:0;top:0">' + lbl +
      '<div style="position:absolute;left:0;top:' + (y(100) - 8) + 'px;font-size:10.5px;color:' + SUB + '">처음 100</div>' + (p.ki ? '<div style="position:absolute;left:0;top:' + (y(p.ki) - 8) + 'px;font-size:10.5px;color:#e0533d;font-weight:800">KI ' + p.ki + '</div>' : '') + '</div>';
  }
  function propBlocks(f, x){
    var ls = lines(f, x.amt), sl = simLine(f, x.amt), B = [];
    B.push('<!--K--><div style="display:flex;align-items:center;gap:14px;margin-bottom:12px"><div style="font-size:40px">' + e(f.icon) + '</div><div><div style="font-size:26px;font-weight:800;letter-spacing:-0.8px;color:' + f.color + '">' + e(f.title) + '</div><div style="font-size:14px;color:' + SUB + '">' + e(f.sub) + '</div></div>' + (x.amt ? '<div style="margin-left:auto;text-align:right"><div style="font-size:12px;color:' + SUB + '">제안 금액</div><div style="font-size:24px;font-weight:800;color:' + NAVY + '">' + man(x.amt) + '</div></div>' : '') + '</div>' +
      '<div style="background:' + f.color + ';border-radius:14px;padding:14px 20px"><div style="color:#fff;font-size:17px;font-weight:800;line-height:1.5">' + e(f.headline) + '</div></div>');
    var ks = keyStrip(f, x.amt); if (ks) B.push(ks);
    B.push('<div style="display:flex;gap:22px;align-items:center">' + donut(f.alloc, 210, 42, x.amt ? "제안 금액" : "비중", x.amt ? man(x.amt) : "100%") + '<div style="flex:1;min-width:0">' + legend(ls, 15, !!x.amt) + '</div></div>');
    var why = secT("🤔 왜 이렇게 담나") + (f.points || []).map(function(p, i){ return '<div style="display:flex;gap:10px;font-size:14px;line-height:1.55;padding:5px 0;border-bottom:1px solid ' + LINE + ';color:' + INK + '"><span style="flex:none;width:21px;height:21px;border-radius:50%;background:' + f.color + ';color:#fff;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center">' + (i + 1) + '</span><span>' + e(p) + '</span></div>'; }).join("");
    var side = (sl ? box('<div style="font-size:12.5px;color:' + SUB + ';font-weight:700">🧮 모의 계산 · ' + e(sl.lab) + '</div><div style="font-size:23px;font-weight:800;color:' + NAVY + '">' + e(sl.big) + '</div><div style="font-size:13px;line-height:1.45">' + e(sl.sub) + '</div>', "background:#eef4ff;margin-bottom:10px") : '') +
      box('<div style="font-size:12.5px;color:' + SUB + ';font-weight:700">🙋 이런 분께</div><div style="font-size:13.5px;margin-top:3px;line-height:1.5">' + e(f.fit) + '</div><div style="margin-top:8px">' + (f.tags || []).map(function(t){ return '<span style="display:inline-block;background:#fff;border:1px solid ' + LINE + ';border-radius:99px;padding:2px 9px;font-size:12px;margin:0 5px 5px 0;color:' + INK + '">' + e(t) + '</span>'; }).join("") + '</div>');
    B.push('<div style="display:flex;gap:16px;align-items:flex-start"><div style="flex:1.35;min-width:0">' + why + '</div><div style="flex:1;min-width:0;padding-top:12px">' + side + '</div></div>');
    return B;
  }
  function mktBlocks(f){
    var mk = f.mkt || {}, ch = mk.charts || [], nk = (mk.kpis || []).filter(function(k){ return k.value && k.value !== "–"; }).length, B = [];
    B.push('<!--K-->' + hTitle("📊 " + e(mk.title || "시장 지금"), f.short + " 판단 근거", f.color) + kpiTiles(mk.kpis || [], 15, nk > 4 ? 3 : Math.max(1, nk)));
    if (ch[0] && ch[1]) B.push('<div style="display:flex;gap:10px">' + box(chartBox(ch[0], (CW - 46) / 2, 150, 12.5), "flex:1;padding:12px 13px") + box(chartBox(ch[1], (CW - 46) / 2, 150, 12.5), "flex:1;padding:12px 13px") + '</div>');
    else if (ch[0]) B.push(box(chartBox(ch[0], CW - 36, 190, 14)));
    B.push(secT("🔎 그래서 지금은", f.color) + bullets(mk.view, 14.5, f.color));
    var o = mk.outlook;
    if (o){   // 긴 표는 8줄씩 끊어서 쪽 빈칸을 채움
      var rs = o.rows.slice(0, 24), fs2 = rs.length > 14 ? 11 : 12.5, op = {right: true, pad: rs.length > 14 ? "4px 8px" : "6px 8px"};
      for (var i = 0; i < rs.length; i += 8) B.push((i ? "" : '<!--K-->' + secT("🔭 " + e(o.title))) + tbl({cols: o.cols, rows: rs.slice(i, i + 8), src: i + 8 >= rs.length ? o.src : ""}, fs2, op));
    }
    if (ch[2] && mk.curve) B.push('<div style="display:flex;gap:10px">' + box(chartBox(ch[2], (CW - 46) / 2, 140, 12.5), "flex:1;padding:12px 13px") + box('<div style="font-size:13px;font-weight:800;margin-bottom:4px">' + e(mk.curve.title) + '</div>' + hbars(mk.curve.rows.map(function(r){ return [r[0] + "년", r[1], f.color, r[1].toFixed(2) + "%"]; }), 12, null, 22), "flex:1;padding:12px 13px") + '</div>');
    else if (ch[2]) B.push(box(chartBox(ch[2], CW - 36, 150, 13)));
    else if (mk.curve) B.push(box('<div style="font-size:14px;font-weight:800;margin-bottom:6px">' + e(mk.curve.title) + '</div>' + hbars(mk.curve.rows.map(function(r){ return [r[0] + "년 만기", r[1], f.color, r[1].toFixed(2) + "%"]; }), 13, null, 20)));
    return B;
  }
  function simBlocks(f, amt){
    var S = f.sim; if (!S) return [];
    var A = amt || 100000000, demo = !amt, head = hTitle("🧮 모의투자 계산서", (demo ? "1억원 넣었다고 치면" : man(A) + " 넣으면") + " · " + f.short, f.color), B = [];
    var note = '<div style="font-size:11.5px;color:' + SUB + ';line-height:1.5">※ ' + e(S.note) + '</div>';
    if (S.kind === "bond"){
      var BB = bondCalc(S, A);
      var r1 = BB.rows.map(function(r){ var cu = r.p.cur, u = CUR[cu]; var fm = function(v){ return cu === "KRW" ? man(v) : (Math.round(v)).toLocaleString("ko-KR") + " " + u; };
        return [r.p.slot + "<br><span style='color:" + SUB + ";font-weight:500;font-size:11px'>" + e(r.p.name) + "</span>", man(r.a), fm(r.face) + "<br><span style='color:" + SUB + ";font-size:11px'>(액면)</span>", fm(r.cpnAll - r.tax) + (r.tax ? "<br><span style='color:" + SUB + ";font-size:11px'>세금 " + fm(r.tax) + " 뺌</span>" : "<br><span style='color:#1a8a5a;font-size:11px'>비과세</span>"),
          fm(r.total), "<b>" + man(r.krw) + "</b>", r.p.yrs.toFixed(1) + "년", r.cagr.toFixed(2) + "%"]; });
      B.push('<!--K-->' + head + stat3([["넣는 돈", man(A)], ["만기까지 받는 돈 " + (S.cur === "KRW" ? "(세후)" : "(환율 그대로)"), man(BB.tot), NAVY, "", "#eef4ff"], ["이익 · 연 환산", "+" + man(BB.pnl), "#1a8a5a", "연 " + BB.cagr.toFixed(2) + "% · 평균 " + BB.yrs.toFixed(1) + "년", "#effaf4"]]));
      B.push(tbl({title: "① 만기까지 들고 가면", cols: ["칸", "넣는 돈", "사게 되는 양", "받는 이자", "만기 총액", "원화로", "기간", "연 환산"], rows: r1}, 11.5, {raw: true, right: true}));
      var half = (CW - 16) / 2 - 28;
      var fx = BB.fxScen.length ? '<div style="font-size:15px;font-weight:800;margin-bottom:6px">② 환율이 바뀌면 (만기 때 ' + (S.cur === "MIX" ? "헤알·달러" : "달러") + ' 값이 지금보다)</div>' +
        pnBars(BB.fxScen.map(function(s){ var LV = fxLv(S); return {l: (s.m > 0 ? "+" : s.m < 0 ? "−" : "") + Math.abs(s.m) + "%" + (s.m === 0 ? " 그대로" : "") + (LV.fx ? "\n" + (LV.fx * (1 + s.m / 100)).toLocaleString("ko-KR", {maximumFractionDigits: LV.d}) + "원" : ""), v: s.pnl, t: (s.pnl >= 0 ? "+" : "−") + man(Math.abs(s.pnl)), hl: s.m === 0}; }), BB.rateScen.length ? half : CW, 120, 11.5) +
        (BB.be != null ? '<div style="font-size:12.5px;margin-top:6px;color:' + INK + ';line-height:1.45">👉 환율이 만기까지 <b>' + Math.abs(BB.be).toFixed(1) + '%</b> 넘게 떨어지지만 않으면 원화로도 이익임 (연 약 ' + Math.abs((Math.pow(1 + BB.be / 100, 1 / (BB.yrs || 1)) - 1) * 100).toFixed(1) + '%까지 견딤)</div>' : '') : '';
      var rt = BB.rateScen.length ? '<div style="font-size:15px;font-weight:800;margin-bottom:6px">' + (BB.fxScen.length ? "③" : "②") + ' 1년 뒤 팔면 — 금리가 바뀔 때</div>' +
        pnBars(BB.rateScen.map(function(s){ return {l: (s.d > 0 ? "+" : s.d < 0 ? "−" : "") + Math.abs(s.d) + "%p" + (s.d === 0 ? " 그대로" : ""), v: s.pnl, t: (s.pnl >= 0 ? "+" : "−") + man(Math.abs(s.pnl)), hl: s.d === 0}; }), BB.fxScen.length ? half : CW, 120, 11.5) +
        '<div style="font-size:12px;color:' + SUB + ';margin-top:6px;line-height:1.45">1년치 이자 포함 · 금리가 내리면 값이 올라 이익이 커짐 · 만기까지 들고 가면 이 변동은 사라짐' + (S.cur !== "KRW" ? " · 환율 변화는 빼고 계산" : "") + '</div>' : '';
      if (fx && rt) B.push('<div style="display:flex;gap:16px">' + box(fx, "flex:1;padding:12px 13px") + box(rt, "flex:1;padding:12px 13px") + '</div>');
      else if (fx || rt) B.push(box(fx || rt));
      if (BB.heat) B.push(heatBlock(BB, S, A));
      if (BB.years.filter(function(y){ return y.v > 0; }).length > 1) B.push(secT("📅 해마다 받는 이자 (지금 환율·세후)") + pnBars(BB.years.slice(0, 15).map(function(y){ return {l: y.y + "년", v: y.v, t: man(y.v).replace("만원", "만")}; }), CW, 80, 10.5));
      B.push(note);
      return B;
    }
    if (S.kind === "els"){
      var E = elsCalc(S, A);
      B.push('<!--K-->' + head + stat3([["넣는 돈", man(A)], ["과거 확률로 본 기대 회수액", man(E.reduce(function(s, q){ return s + q.ev; }, 0)), NAVY, "", "#eef4ff"], ["6개월에 바로 끝날 확률", Math.round(E.reduce(function(s, q){ return s + (((q.p.hist || {}).k || [])[0] || 0) * q.a; }, 0) / A) + "%", "#1a8a5a", "조건: 처음 값의 85% 이상", "#effaf4"]]));
      E.forEach(function(x, xi){ var p = x.p, h = p.hist;
        var rows = x.steps.map(function(s){ return [s.t + "개월", s.bar ? s.bar + "% 이상" : "–", man(s.won), "+" + man(s.won - x.a), s.pr != null ? s.pr.toFixed(1) + "%" : "–"]; })
          .concat(x.tail.map(function(t){ return [t.lab.replace(" (낙인 후 회복 못 함)", "").replace(" (이자 없음)", "").replace(" (만기 원금 상환 등)", ""), "", man(t.won), (t.won - x.a >= 0 ? "+" : "−") + man(Math.abs(t.won - x.a)), t.pr != null ? t.pr.toFixed(1) + "%" : "–"]; }));
        var pcol = ["#3fb28f", "#2f6fdf", "#7b5cff"][xi] || NAVY;
        B.push('<div style="display:flex;justify-content:space-between;align-items:baseline;font-size:14.5px;font-weight:800;margin:2px 0 6px"><span style="color:' + pcol + '">' + e(p.slot) + ' · ' + e(p.name) + '</span><span style="font-size:12.5px;color:' + SUB + '">' + e(p.ua) + ' · 연 ' + p.cpn + '%' + (p.ki ? ' · KI ' + p.ki + '%' : ' · 원금지급') + ' · ' + man(x.a) + '</span></div>' +
          '<div style="display:flex;gap:12px;align-items:flex-start"><div style="flex:1.45;min-width:0">' + tbl({cols: ["끝나는 때", "조건", "받는 돈", "이익", "과거 확률"], rows: rows}, 11, {right: true, nowrap: true, pad: "4px 6px", hl: function(r, i){ return i === 0; }}) + '</div>' +
          '<div style="flex:1;min-width:0">' + box('<div style="font-size:12.5px;font-weight:800;margin-bottom:4px">구조 한눈에 — 6개월마다 이 선 위면 끝</div>' + elsShape(p, 250, 200, pcol), "padding:10px 10px 4px") + '</div></div>' +
          '<div style="font-size:12px;color:' + SUB + ';margin-top:4px">' + (h ? "과거 " + h.from + "~" + h.to + " 매일 가입했다면 " + (h.n || 0).toLocaleString("ko-KR") + "번 중 · 평균 기대 회수액 <b style='color:" + NAVY + "'>" + man(x.ev) + "</b>" + (h.loss ? " · 손실 날 땐 평균 " + h.loss_avg + "% (최악 " + h.loss_worst + "%)" : "") : "과거 확률 자료 없음") + '</div>');
      });
      B.push(note);
      return B;
    }
    if (S.kind === "equity"){
      var Q = eqCalc(S, A), b = S.bt, cb = contrib(S, f), gv = b.growth.vals.map(function(v){ return v * A; });
      B.push('<!--K-->' + head + stat3([[b.from.slice(0, 4) + "년부터 연평균", "연 " + b.cagr + "%", NAVY, "", "#eef4ff"], ["1년 보유 시 이익 날 확률", b.y1.pos + "%", "#1a8a5a", "5년 보유 시 " + (b.y5 ? b.y5.pos + "%" : "–"), "#effaf4"], ["가장 크게 빠졌을 때", sgn(b.mdd, 1), UP, man(Math.abs(Q.mdd)) + " 줄었다가 회복", "#fff4f2"]]));
      B.push(box(chartBox({title: man(A) + "을 " + b.from.slice(0, 4) + "년에 넣었다면 (매달 비중 맞춤)", unit: "원", labels: b.growth.labels, vals: gv, color: f.color}, CW - 36, 170, 13)));
      var half2 = (CW - 16) / 2;
      B.push('<div style="display:flex;gap:16px">' + box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">① 1년 뒤 (과거 모든 1년 기준)</div>' + pnBars(Q.y1.map(function(q){ return {l: q.l.replace(/ \(.*\)/, ""), v: q.won - A, t: (q.r >= 0 ? "+" : "−") + man(Math.abs(q.won - A)), hl: /보통/.test(q.l)}; }), half2 - 26, 120, 11.5), "flex:1;padding:12px 13px") +
        box('<div style="font-size:15px;font-weight:800;margin-bottom:6px">② 5년 뒤 (연평균으로)</div>' + (Q.y5 ? tbl({cols: ["경우", "연평균", "5년 뒤", "이익"], rows: Q.y5.map(function(q){ return [q.l, sgn(q.r, 1), man(q.won), (q.won - A >= 0 ? "+" : "−") + man(Math.abs(q.won - A))]; })}, 12, {right: true, hl: function(r){ return /보통/.test(r[0]); }}) : ''), "flex:1;padding:12px 13px") + '</div>');
      B = B.concat(eqBlocks(S, A, f));
      if (cb) B.push(secT("③ 매년 " + S.contrib + "만원씩 넣으면 (세액공제 포함)") + tbl({cols: ["기간", "넣은 돈", "보통이면", "나쁘면", "돌려받는 세금"], rows: cb.map(function(c){ return [c.y + "년", man(c.put), man(c.mid), man(c.low), man(c.tax132) + "~" + man(c.tax165)]; })}, 12.5, {right: true}));
      B.push(secT("📅 해마다 수익률 (최근 " + b.years.length + "년)") + pnBars(b.years.map(function(y){ return {l: String(y[0]).slice(2) + "년", v: y[1], t: sgn(y[1], 0)}; }), CW, 90, 10.5));
      B.push(note);
      return B;
    }
    return B;
  }
  function detailBlocks(f, x){
    var ls = lines(f, x.amt), B = [];
    var rows = ls.map(function(l){ return [l.a.name, (l.a.inst || "") + (l.a.code && String(l.a.code).length < 12 ? " (" + l.a.code + ")" : ""), pc(l.a.pct), x.amt ? man(l.won) : "–"]; });
    B.push('<!--K-->' + hTitle(e(f.icon) + " 담을 상품 · 꼭 알아 둘 점", f.short, f.color) + tbl({cols: ["칸", "상품", "비중", "금액"], rows: rows}, 12.5) +
      '<div style="font-size:12.5px;color:' + INK + ';margin-top:8px;line-height:1.6">' + ls.map(function(l){ return "· <b>" + e(l.a.name) + "</b>: " + e(l.a.why); }).join("<br>") + '</div>');
    var tax = f.tax ? box('<div style="font-size:14.5px;font-weight:800;margin-bottom:6px">🧾 세액공제 (연 ' + f.tax.limit + '만원 넣을 때)</div>' + taxLine(f).map(function(t){ return '<div style="display:flex;justify-content:space-between;font-size:13.5px;padding:5px 0;border-bottom:1px solid ' + LINE + '"><span>' + e(t.who) + ' · ' + t.rate + '%</span><b style="color:' + NAVY + '">' + t.full + '</b></div>'; }).join("") + '<div style="font-size:11.5px;color:' + SUB + ';margin-top:6px">' + e(f.tax.note) + '</div>', "flex:1;background:#effaf4") : '';
    var split = f.split && x.amt ? box('<div style="font-size:14.5px;font-weight:800;margin-bottom:6px">🪜 나눠 사기 계획 (주식 칸)</div>' + ["오늘", "2주 뒤", "한 달 뒤"].map(function(w, i){ var eqAmt = x.amt * (100 - (f.alloc.filter(function(a){ return a.k === "cd"; })[0] || {pct: 0}).pct) / 100; return '<div style="display:flex;justify-content:space-between;font-size:13.5px;padding:5px 0;border-bottom:1px solid ' + LINE + '"><span>' + (i + 1) + '회차 · ' + w + '</span><b>' + f.split[i] + '% · ' + man(eqAmt * f.split[i] / 100) + '</b></div>'; }).join("") + '<div style="font-size:11.5px;color:' + SUB + ';margin-top:6px">그 사이 돈은 CD금리 ETF에서 이자를 받음</div>', "flex:1") : '';
    var risk = box('<div style="font-size:14.5px;font-weight:800;margin-bottom:4px;color:#b3372a">⚠️ 꼭 알아 둘 점</div>' + (f.risks || []).map(function(r){ return '<div style="font-size:13px;line-height:1.55;padding:2px 0;color:' + INK + '">· ' + e(r) + '</div>'; }).join(""), "flex:1.3;background:#fff4f2");
    var side = tax || split;
    B.push(side ? '<div style="display:flex;gap:12px;align-items:stretch">' + side + risk + '</div>' : risk);
    if (f.table && f.table.rows && f.table.rows.length && !/^(ktb|ust|brl|els)$/.test(f.key) && !(f.themes && f.themes.length)) B.push(tbl({title: f.table.title, cols: f.table.cols, rows: f.table.rows.slice(0, 8)}, 12));
    return B;
  }
  function coverPage(m){
    return '<div class="ppx" style="width:' + PW + 'px;height:' + PH + 'px;background:linear-gradient(160deg,' + NAVY + ' 0%,#1f4d86 60%,#2b6cb0 100%);font-family:' + FONT + ';position:relative;overflow:hidden"><div style="position:absolute;left:0;top:0;width:' + PW + 'px;height:' + PH + 'px;color:#fff">' +
      '<div style="position:absolute;right:-160px;top:-120px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.06)"></div><div style="position:absolute;left:-120px;bottom:-160px;width:420px;height:420px;border-radius:50%;background:rgba(255,255,255,.05)"></div>' +
      '<div style="padding:120px 70px 0;position:relative;color:#fff"><div style="font-size:16px;letter-spacing:4px;opacity:.8;font-weight:700">INVESTMENT PROPOSAL</div>' +
      '<div style="font-size:24px;margin-top:40px;opacity:.92">' + e(custName(m)) + '을 위한</div><div style="font-size:46px;font-weight:800;letter-spacing:-1.5px;line-height:1.25;margin-top:8px;color:#fff">' + e(titleOf(m)) + '<br>투자 제안서</div>' +
      '<div style="width:70px;height:5px;background:#f0b43c;margin:34px 0"></div>' +
      (m.total ? '<div style="font-size:18px;opacity:.88">제안 금액</div><div style="font-size:40px;font-weight:800;margin-top:4px;color:#fff">' + man(m.total) + '</div>' : '') +
      (function(){ var gl = m.items.length === 1 ? gLine(m.items[0].f) : ""; return gl ? '<div style="margin-top:14px;font-size:16px;line-height:1.55;color:#fff;opacity:.92;max-width:640px">' + e(gl) + '</div>' : ''; })() +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:30px">' + m.items.map(function(x){ return '<span style="background:rgba(255,255,255,.16);border-radius:99px;padding:8px 16px;font-size:16px;font-weight:700;color:#fff">' + e(x.f.icon + " " + x.f.short) + (x.amt ? " · " + man(x.amt) : "") + '</span>'; }).join("") + '</div>' +
      '<div style="margin-top:46px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:600px">' + (m.items.length <= 2 ? m.items : []).map(function(x){ var sl = simLine(x.f, x.amt); return '<div style="background:rgba(255,255,255,.1);border-radius:14px;padding:14px 16px;color:#fff"><div style="font-size:13px;opacity:.85">' + e(x.f.short) + (sl ? " · " + e(sl.lab) : "") + '</div><div style="font-size:22px;font-weight:800;margin-top:2px">' + e(sl ? sl.big : x.f.headline.slice(0, 20)) + '</div></div>'; }).join("") + '</div></div>' +
      '<div style="position:absolute;left:70px;right:70px;bottom:70px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,.3);padding-top:22px;color:#fff"><div><div style="font-size:14px;opacity:.8">제안</div><div style="font-size:24px;font-weight:800;margin-top:4px">' + e(byLine(m) || "담당 PB") + '</div></div><div style="font-size:16px;opacity:.88">' + e(m.date) + '</div></div></div></div>';
  }
  function summaryBlocks(m){
    var parts = m.items.map(function(x){ return {pct: m.total ? x.amt / m.total * 100 : 100 / m.items.length, color: x.f.color}; });
    return [hTitle("🧺 제안 한눈에", "상품별 금액과 핵심") + '<div style="display:flex;gap:28px;align-items:center">' + donut(parts, 210, 42, "합계", m.total ? man(m.total) : "") +
      '<div style="flex:1">' + m.items.map(function(x){ return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid ' + LINE + ';font-size:14.5px;color:' + INK + '"><span style="width:14px;height:14px;border-radius:3px;background:' + x.f.color + '"></span><b style="flex:1">' + e(x.f.icon + " " + x.f.title) + '</b><span style="font-weight:800">' + (m.total ? pc(x.amt / m.total * 100) : "") + '</span><span style="width:120px;text-align:right;color:' + NAVY + ';font-weight:800">' + man(x.amt) + '</span></div>'; }).join("") + '</div></div>',
      m.items.map(function(x){ var sl = simLine(x.f, x.amt); return '<div style="display:flex;gap:10px;font-size:13px;line-height:1.5;padding:8px 12px;margin-bottom:6px;background:' + BG + ';border-radius:10px;border-left:5px solid ' + x.f.color + ';color:' + INK + '"><b style="flex:none;width:92px;color:' + x.f.color + '">' + e(x.f.short) + '</b><span style="flex:1">' + e(x.f.headline) + (sl ? '<br><span style="color:' + NAVY + ';font-weight:700">🧮 ' + e(sl.lab) + ' ' + e(sl.big) + '</span>' : '') + '</span></div>'; }).join("")];
  }
  /* ───────── ⚖️ 투자위험 고지 (10/29 사용자 「실제 심의필에 필적할 위험고지를 모든 제안서 마지막에」) ─────────
     금융소비자보호법·금융투자협회 표준 안내 항목을 따름 · 고른 상품에 맞는 항목만 덧붙임 */
  var EQK = {kr_stock: 1, gl_stock: 1, pension: 1, dc: 1, irp: 1}, FXK = {gl_stock: 1, ust: 1, brl: 1, pension: 1, dc: 1, irp: 1};
  var DISC_VER = "2026.10.29-1";   // 문구를 고치면 이 값을 바꿈 → 예전 심의필은 자동으로 「다시 심의」
  function discOf(m, all){
    var ks = {}; m.items.forEach(function(x){ ks[x.f.key] = x.f; });
    var has = function(o){ for (var q in ks) if (o[q]) return true; return false; };
    var stock = all || m.items.some(function(x){ return (x.f.must || []).some(function(a){ return !a.etf && !a.safe && a.kind !== "안전"; }); });
    var usd = ks.gl_stock && (all || ks.gl_stock.mode === "usd");
    var C = [
      "본 자료는 고객의 투자 판단을 돕기 위해 작성한 참고 자료로, 특정 상품의 수익을 보장하거나 가입을 강요하지 않음. 최종 투자 판단과 그 결과에 대한 책임은 투자자 본인에게 있음",
      "금융투자상품은 「예금자보호법」에 따라 예금보험공사가 보호하지 않음" + (has({pension: 1, dc: 1, irp: 1}) ? " (연금·퇴직연금 계좌 안의 예금 등 보호 대상 상품은 다른 예금과 별도로 1인당 1억원 한도 안에서 보호됨)" : ""),
      "운용 결과에 따라 투자원금의 일부 또는 전부에 손실이 발생할 수 있으며, 그 손실은 투자자에게 귀속됨",
      "과거 수익률·모의 계산·위기 시 하락 예시는 작성일 기준 금리·환율과 과거 가격으로 계산한 가정치로, 미래 수익을 보장하지 않음. 보수·수수료·세금·거래비용이 모두 반영되지 않았을 수 있음",
      "투자자는 금융상품판매업자로부터 상품의 내용·위험·보수·수수료 등에 대해 충분한 설명을 받을 권리가 있음. 가입 전 (간이)투자설명서·상품설명서·약관을 반드시 읽어 보아야 함",
      "투자자성향 진단 결과에 맞지 않는 상품은 권유할 수 없음(적합성·적정성 원칙). 65세 이상 고령 투자자, 투자 경험이 적은 투자자는 녹취·숙려기간 등 추가 보호 절차가 적용될 수 있음",
      "금융소비자는 「금융소비자보호법」에 따라 청약철회권(대상 상품에 한함), 위법계약해지권(계약일로부터 5년 이내, 위법 사실을 안 날부터 1년 이내), 자료열람요구권을 가짐",
      "매매수수료·ETF 총보수·환전 수수료·계좌 수수료 등이 발생하며, 이는 실제 수익률을 낮춤",
      "세금 안내는 작성일 현재 세법 기준이며 세법 개정, 금융소득종합과세(이자·배당 연 2천만원 초과) 등 개인별 상황에 따라 달라질 수 있음. 구체적 세무 판단은 세무 전문가와 상의 필요",
      "본 자료의 시장 정보·전망·종목 정보는 신뢰할 만한 공개 자료를 바탕으로 작성했으나 정확성·완전성을 보장하지 않으며, 시장 상황에 따라 예고 없이 바뀔 수 있음",
      "회사는 제안 상품의 판매·운용과 관련해 보수·수수료를 받을 수 있으며, 회사 또는 계열사가 해당 상품을 발행·운용·보유할 수 있음",
      "본 자료는 고객 본인에게만 제공되며 무단 복제·배포를 금함. 민원·분쟁은 회사 고객센터 또는 금융감독원(국번 없이 1332)에 신청할 수 있음"
    ];
    var Pd = [];
    if (has(EQK)) Pd.push({ic: "📈", t: "주식·ETF", l: [
      "주식·ETF는 시장·업종·개별 기업 사정에 따라 가격이 크게 오르내리며, 단기간에 큰 손실이 날 수 있음",
      "ETF는 기초지수와 수익률이 다를 수 있음(추적오차) · 시장가격과 순자산가치가 벌어질 수 있음(괴리율) · 거래가 적으면 원하는 가격에 사고팔기 어려울 수 있고, 규모가 작아지면 상장폐지될 수 있음",
      "「시황 테마」 칸은 작성일 시장 흐름을 반영한 것으로, 테마 흐름이 바뀌면 다른 칸보다 손실이 클 수 있음"]});
    if (stock) Pd.push({ic: "⭐", t: "개별 종목", l: [
      "개별 종목은 한 회사의 실적·공시·소송·업황 등에 크게 영향을 받아 분산된 ETF보다 변동성이 큼",
      "종목 설명의 재무·애널리스트 의견·목표가는 표시된 기준일 자료이며, 이후 바뀌었을 수 있음. 특정 종목의 매수·매도를 권유하는 조사분석자료가 아님"]});
    if (has(FXK)) Pd.push({ic: "💱", t: "해외 자산·환율", l: [
      "해외 자산은 현지 가격뿐 아니라 환율 변동에 따라 원화 기준 수익률이 달라짐 · 환율이 내리면 원화 환산 손실이 날 수 있음",
      "해외 시장은 휴장일·거래 시간·정치·경제·세제 환경이 달라 국가 위험이 있음"].concat(usd ? [
      "미국 상장 주식·ETF 직접 투자: 연간 양도차익 250만원 초과분에 양도소득세 22%(지방세 포함) 신고·납부 · 배당은 현지 원천징수 15% · 환전 시 매매기준율과 차이(스프레드)가 비용으로 발생"] : []).concat(ks.gl_stock && (all || !usd) ? [
      "국내 상장 해외 ETF: 매매차익·분배금에 배당소득세 15.4%가 원천징수되며 금융소득종합과세 대상에 포함됨 (연금·IRP 계좌는 과세 이연)"] : [])});
    if (ks.pension) Pd.push({ic: "🛡", t: "연금저축", l: [
      "연금 외로 찾으면 세액공제받은 원금과 운용수익에 기타소득세 16.5%가 부과됨 · 연금으로 받으면 연금소득세 3.3~5.5%(나이에 따라)",
      "사적연금 수령액이 연 1,500만원을 넘으면 종합과세 또는 16.5% 분리과세 중 선택해야 함 · 세액공제 한도·공제율은 세법 개정으로 바뀔 수 있음"]});
    if (ks.dc || ks.irp) Pd.push({ic: "🏦", t: "퇴직연금 (DC·IRP)", l: [
      "퇴직연금 감독규정에 따라 위험자산 투자 한도는 적립금의 70%임 · 운용 결과에 대한 책임은 가입자 본인에게 있음",
      "중도인출은 무주택자 주택 구입, 6개월 이상 요양 등 법에서 정한 사유에만 가능함 · 연금 외 수령 시 퇴직소득세·기타소득세가 부과됨" + (ks.irp ? " · IRP는 운용·자산관리 수수료가 발생할 수 있음" : "")]});
    if (ks.ktb || ks.ust || ks.brl) Pd.push({ic: "🏛", t: "채권", l: [
      "금리가 오르면 채권 가격이 내려감 · 만기 전에 팔면 시장 가격에 따라 원금 손실이 날 수 있으며, 만기가 길수록 가격 변동이 큼",
      "발행자(국가) 신용도 변화·신용등급 하락 위험이 있으며, 장외 거래로 원하는 시점·가격에 팔기 어려울 수 있음(유동성 위험) · 제시 수익률은 작성일 시장 금리 기준으로 매수 시점에 따라 달라짐"]});
    if (ks.ust) Pd.push({ic: "💵", t: "미국 국채", l: [
      "달러로 투자하므로 원/달러 환율이 내리면 원화 환산 수익이 줄거나 손실이 날 수 있음 · 미국 금리·재정 상황 변화로 가격이 오르내림"]});
    if (ks.brl) Pd.push({ic: "🌎", t: "브라질 국채", l: [
      "헤알화는 변동성이 매우 큰 신흥국 통화로, 환율 하락 시 높은 이자를 넘는 원화 손실이 날 수 있음 · 원→달러→헤알 이중 환전 비용이 발생함",
      "브라질 정치·재정 위험, 국가 신용등급 하락 위험이 있음 · 한·브라질 조세조약에 따른 개인 비과세 혜택과 브라질 금융거래세(IOF)는 조약·현지 세법 변경으로 바뀔 수 있음"]});
    if (ks.els) Pd.push({ic: "🎯", t: "ELS (주가연계증권)", l: [
      "원금 비보장 상품으로, 기초자산 가격이 손실 기준(낙인) 아래로 떨어지면 하락률만큼 원금 손실이 나며 최대 원금 전액을 잃을 수 있음 · 수익은 약속된 쿠폰으로 제한됨",
      "발행사(증권사)가 파산하거나 신용이 나빠지면 조건과 상관없이 원금을 돌려받지 못할 수 있음(예금자보호 대상 아님) · 만기 전 중도상환 시 원금 손실이 날 수 있음",
      "조기상환 여부와 시점은 기초자산 가격에 따라 정해지며 보장되지 않음 · 고령·부적합 투자자는 녹취와 숙려기간이 적용될 수 있음 · 상품별 위험등급과 조건은 투자설명서로 반드시 확인"]});
    return {C: C, P: Pd};
  }
  function ymd(v){ return String(v || "").replace(/-/g, "."); }
  function simState(){
    var no = (ME.simNo || "").trim(); if (!no) return {ok: false, cls: "no", t: "⚠️ 심의필 없음", why: "아직 심의필 번호가 없음 — 아래 순서대로 받아 넣어 주세요"};
    if (ME.simVer && ME.simVer !== DISC_VER) return {ok: false, cls: "no", t: "🔄 문구 바뀜 · 다시 심의", why: "위험고지 문구가 바뀌었음(" + DISC_VER + ") — 새 문구로 다시 심의받아 번호를 넣어 주세요"};
    if (ME.simTo && ME.simTo < today()) return {ok: false, cls: "no", t: "⏰ 유효기간 지남", why: "심의필 유효기간(" + ymd(ME.simTo) + ")이 지났음 — 다시 심의받아 주세요"};
    var left = ME.simTo ? Math.round((new Date(ME.simTo) - new Date(today())) / 864e5) : null;
    return {ok: true, cls: left != null && left <= 30 ? "warn" : "ok", t: left != null && left <= 30 ? "⏳ 심의필 " + left + "일 남음" : "✅ 심의필 등록됨", why: ""};
  }
  function simText(){ var no = (ME.simNo || "").trim(); return no ? (/^제/.test(no) ? no : "제 " + no) + (/호$/.test(no) ? "" : "호") + (ME.simFrom || ME.simTo ? " (" + ymd(ME.simFrom) + "~" + ymd(ME.simTo) + ")" : "") : ""; }
  function simNo(m){ return simState().ok ? "준법감시인 심의필 " + simText() : ""; }
  // 한 장 요약용 줄임 문구 (한 장·심의 요청서 둘 다 씀)
  function shortDisc(D){ return [
        "본 자료는 투자 판단을 돕기 위한 참고 자료이며 수익을 보장하지 않음 · 투자 판단과 결과의 책임은 투자자 본인에게 있음",
        "금융투자상품은 예금자보호법에 따라 보호되지 않으며 운용 결과에 따라 원금 손실(최대 전액)이 발생할 수 있음",
        "과거 수익률·모의 계산은 가정치로 미래 수익을 보장하지 않음 · 보수·수수료·세금이 발생하며 세법은 바뀔 수 있음",
        "가입 전 (간이)투자설명서·상품설명서를 반드시 읽고 충분한 설명을 들으셔야 함 · 투자자성향에 맞지 않으면 권유할 수 없음",
        "금융소비자보호법상 청약철회권·위법계약해지권·자료열람요구권이 있음 · 민원 금융감독원 1332"
      ].concat(D.P.map(function(g){ return g.ic + " " + g.t + ": " + g.l[0]; })); }
  function allModel(){ return {cust: "", pb: (ME.pb || "").trim(), org: (ME.org || "").trim(), date: dlabel(), items: ((DATA && DATA.forms) || []).map(function(f){ return {f: f, amt: 0}; }), total: 0, notice: [], basis: (DATA && DATA.basis) || "", foot: "준법감시 심의 요청 · 위험고지 문구 " + DISC_VER}; }
  function discText(){
    var D = discOf(allModel(), true), n = 0, o = ["[CH Investing 투자 제안서 — 투자위험 고지 문구 · 버전 " + DISC_VER + "]", "", "■ 공통 사항"];
    D.C.forEach(function(t){ o.push((++n) + ". " + t); });
    D.P.forEach(function(g){ o.push("", "■ " + g.t + " 투자 시 위험 (해당 상품을 제안할 때만 들어감)"); g.l.forEach(function(t){ o.push((++n) + ". " + t); }); });
    o.push("", "■ 한 장 요약(카톡 전송용)에 들어가는 줄임 문구"); shortDisc(D).forEach(function(t){ o.push("· " + t); });
    return o.join("\n");
  }
  // 📝 준법감시 부서에 낼 심의 요청서 (PDF)
  function reviewPages(){
    var m = allModel(), D = discOf(m, true);
    var head = hTitle("📝 준법감시 심의 요청서", "투자 제안서 위험고지 문구") +
      tbl({cols: ["항목", "내용"], rows: [["요청자", byLine(m) || "–"], ["요청일", m.date], ["문구 버전", DISC_VER],
        ["쓰이는 자료", "CH Investing 투자 제안서 — 한 장 요약 그림 · 풀버전 PDF · 편집용 PPT · 그림판 PPT"],
        ["대상 상품", m.items.map(function(x){ return x.f.short; }).join(" · ")],
        ["들어가는 위치", "풀버전 PDF·PPT 맨 끝 「투자위험 고지」 쪽 전체 · 한 장 요약은 맨 아래 줄임 문구 · 상품별 항목은 그 상품을 제안할 때만 들어감"],
        ["요청 사항", "아래 문구를 검토해 주시고, 이상 없으면 심의필 번호와 유효기간을 부여해 주시기 바람"]]}, 12.5, {pad: "6px 10px"});
    var res = box('<div style="font-size:14px;font-weight:800;margin-bottom:10px;color:' + NAVY + '">✍️ 심의 결과 (준법감시 부서 기재)</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 22px;font-size:13px;color:' + INK + '">' +
      ["심의필 번호", "유효기간", "심의 의견 (승인 · 수정 후 승인 · 반려)", "심의자 / 서명"].map(function(t){ return '<div><div style="color:' + SUB + ';margin-bottom:4px">' + t + '</div><div style="border-bottom:1px solid #9aa3b2;height:30px"></div></div>'; }).join("") + '</div>', "padding:14px 18px");
    var sh = box('<div style="font-size:13px;font-weight:800;margin-bottom:6px;color:' + NAVY + '">📱 한 장 요약(카톡 전송용)에 들어가는 줄임 문구</div>' +
      shortDisc(D).map(function(t){ return '<div style="display:flex;gap:8px;font-size:11.5px;line-height:1.55;color:' + INK + '"><span>·</span><span>' + e(t) + '</span></div>'; }).join(""), "padding:12px 16px");
    var pages = pack([{color: NAVY, blocks: [head].concat(discBlocks(m, true)).concat([sh, res])}]);
    return pages.map(function(p, i){ return pageFrom(p, i + 1, pages.length, m); });
  }
  function discBlocks(m, all){
    var D = discOf(m, all), n = 0;
    var row = function(t){ n++; return '<div style="display:flex;gap:8px;font-size:11.5px;line-height:1.55;padding:4px 0;color:' + INK + '"><b style="color:' + NAVY + ';min-width:18px">' + n + '.</b><span>' + e(t) + '</span></div>'; };
    var B = [hTitle("⚖️ 투자위험 고지 및 투자자 유의사항") + '<div style="font-size:12px;color:' + SUB + ';line-height:1.55;margin:-4px 0 10px">이 제안서를 받으신 고객님께 꼭 알려 드려야 하는 사항임 · 가입 전 끝까지 읽어 주시기 바람' + (m.basis ? ' · 이 제안서는 ' + e(m.basis) + ' 자료로 만들었으며 배분과 상품은 시장 상황에 따라 매일 바뀔 수 있음' : '') + (all ? ' · <b>상품별 항목은 그 상품을 제안할 때만 들어감</b>' : '') + '</div>' +
      box('<div style="font-size:13px;font-weight:800;margin-bottom:4px;color:' + NAVY + '">공통 사항</div>' + D.C.map(row).join(""), "padding:12px 16px;background:#f7f9fc")];
    D.P.forEach(function(g){ B.push(box('<div style="font-size:13px;font-weight:800;margin-bottom:4px;color:#b3372a">' + g.ic + ' ' + e(g.t) + ' 투자 시 위험</div>' + g.l.map(row).join(""), "padding:12px 16px;background:#fff7f5")); });
    return B;
  }
  function signBlock(m){
    var sl = simNo(m);
    return '<div style="margin-top:18px;display:flex;justify-content:space-between;align-items:flex-end;color:' + INK + '"><div><div style="font-size:14px;color:' + SUB + '">제안</div><div style="font-size:24px;font-weight:800;margin-top:6px">' + e(byLine(m) || "담당 PB") + '</div></div><div style="text-align:right"><div style="font-size:14px;color:' + SUB + '">' + e(custName(m)) + ' — 위 위험 고지를 설명 듣고 이해했음</div><div style="width:240px;border-bottom:1px solid #9aa3b2;height:40px;margin-left:auto"></div></div></div>' +
      '<div style="margin-top:14px;padding-top:8px;border-top:1px solid ' + LINE + ';display:flex;justify-content:space-between;font-size:11px;color:' + SUB + '"><span>작성일 ' + e(m.date) + (m.org ? ' · ' + e(m.org) : '') + '</span><span>' + e(sl) + '</span></div>';
  }
  function noticeBlocks(m){   // 쉬운 안내 4줄은 아래 위험고지 공통 사항에 모두 들어 있어 위험고지로 합침
    return discBlocks(m).concat([signBlock(m)]);
  }
  // 덩어리 높이를 재서 쪽에 채움 · 남는 높이는 덩어리 사이 간격으로 고르게 나눔(너무 벌어지지 않게 최대 26px)
  var BODY_H = PH - 8 - 26 - 70, GAP = 14;
  function measure(blocks){
    var H = host(); H.innerHTML = '<div style="width:' + CW + 'px;font-family:' + FONT + ';color:' + INK + '">' + blocks.map(function(b){ return '<div class="ppb" style="width:' + CW + 'px">' + b + '</div>'; }).join("") + '</div>';
    var hs = [].map.call(H.querySelectorAll(".ppb"), function(n){ return Math.ceil(n.getBoundingClientRect().height); }); H.innerHTML = ""; return hs;
  }
  function pack(groups){   // groups: [{color, blocks:[...], fresh:true}]
    var pages = [];
    var cur = null;
    groups.forEach(function(g){
      var hs = measure(g.blocks);
      if (cur && BODY_H - cur.used < BODY_H * 0.25) cur = null;   // 남은 자리가 적으면 새 상품은 새 쪽에서
      else if (cur) { cur.used += 18; cur.items.push('<div style="height:4px;border-top:3px solid ' + g.color + ';margin-top:4px"></div>'); }
      g.blocks.forEach(function(b, i){
        var h = hs[i], next = b.indexOf("<!--K-->") === 0 && i + 1 < hs.length ? GAP + Math.min(hs[i + 1], 110) : 0;   // 제목 덩어리는 다음 덩어리 일부와 같이
        var fits = cur && cur.used + (cur.items.length ? GAP : 0) + h <= BODY_H, roomy = cur && BODY_H - cur.used > BODY_H * 0.3;
        if (!cur || (cur.used + (cur.items.length ? GAP : 0) + h + next > BODY_H && !(fits && roomy))){ cur = {color: g.color, items: [], used: 0}; pages.push(cur); }
        cur.used += (cur.items.length ? GAP : 0) + h; cur.items.push(b);
      });
    });
    return pages;
  }
  function pageFrom(p, n, of, m){
    var free = BODY_H - p.used, k = p.items.length > 1 ? Math.min(26, GAP + free / (p.items.length - 1) * 0.5) : GAP;
    if (free > BODY_H * 0.45) k = GAP;   // 반 넘게 비면(마지막 쪽) 벌리지 않음
    return page(p.items.join(gap(Math.round(k))), n, of, m, p.color).replace('padding:30px 48px 0', 'padding:26px 48px 0');
  }
  function fullPages(m){
    var groups = [];
    if (m.items.length > 1) groups.push({color: NAVY, blocks: summaryBlocks(m)});
    m.items.forEach(function(x){ var f = x.f;
      var mb = f.mkt ? mktBlocks(f) : [], sb = scenBlock(f);
      if (sb){ var oi = -1; mb.forEach(function(h2, i2){ if (h2.indexOf("🔭") >= 0 && oi < 0) oi = i2; }); if (oi < 0) mb.push(sb); else mb.splice(oi, 0, sb); }
      groups.push({color: f.color, blocks: propBlocks(f, x).concat(mustBlocks(f, x)).concat(themeBlocks(f, x)).concat(cardBlocks(f, x)).concat(mb).concat(simBlocks(f, x.amt)).concat(detailBlocks(f, x)).concat(careBlocks(f))}); });
    groups.push({color: NAVY, blocks: noticeBlocks(m)});
    var pages = pack(groups), of = pages.length + 1;
    return [coverPage(m)].concat(pages.map(function(p, i){ return pageFrom(p, i + 2, of, m); }));
  }

  /* ───────── 그림 찍기 ───────── */
  var HOST = null;
  function host(){ if (!HOST || !document.body.contains(HOST)){ HOST = document.createElement("div"); HOST.id = "ppxhost"; HOST.setAttribute("aria-hidden", "true");
      HOST.style.cssText = "position:fixed;left:-20000px;top:0;z-index:-1;pointer-events:none;color:" + INK + ";background:#fff;color-scheme:light"; document.body.appendChild(HOST); } return HOST; }
  function needLib(){ return new Promise(function(ok, no){ if (window.html2pdf) return ok(); var s = document.createElement("script"); s.src = "lib/html2pdf.bundle.min.js"; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("PDF 도구를 못 받음")); }; document.head.appendChild(s); }); }
  function needPpt(){ return new Promise(function(ok, no){ if (window.PptxGenJS) return ok(); var s = document.createElement("script"); s.src = "lib/pptxgen.bundle.js?v=1"; s.onload = function(){ ok(); }; s.onerror = function(){ no(new Error("PPT 도구를 못 받음")); }; document.head.appendChild(s); }); }
  function imgsReady(el){ return Promise.all([].map.call(el.querySelectorAll("img"), function(i){ return i.complete && i.naturalWidth ? 1 : new Promise(function(r){ i.onload = i.onerror = function(){ r(); }; setTimeout(r, 3000); }); })); }
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function snap(html, w, scale){
    var H = host(); H.innerHTML = html; var el = H.firstChild;
    return imgsReady(el).then(function(){
      var h = Math.ceil(el.getBoundingClientRect().height);
      return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [w, h], orientation: "portrait", hotfixes: ["px_scaling"]},
        html2canvas: {scale: scale, backgroundColor: "#ffffff", useCORS: true, logging: false, scrollX: 0, scrollY: 0, windowWidth: w, width: w, height: h,
          onclone: function(d){ try { d.documentElement.removeAttribute("data-ui"); d.documentElement.style.colorScheme = "light"; d.body.style.color = INK; d.body.style.background = "#fff"; } catch(x) {} }}}).from(el).toCanvas().get("canvas")
        .then(function(c){ H.innerHTML = ""; return c; });
    });
  }
  function shareBlob(blob, name, mime){
    // 🛠 10/28 아이폰은 누른 바로 그 순간에만 공유창 — PDF·PPT 를 만드는 사이 그 순간이 지나 카톡·문자로 안 열리던 것 → 준비 창의 「카톡·문자로 보내기」를 한 번 더 눌러 보냄
    try { var f0 = new File([blob], name, {type: mime}); if (window.__onepage && __onepage.ready){ __onepage.ready([f0], name); return Promise.resolve(); } } catch(x) {}
    try { var f = new File([blob], name, {type: mime}); if (navigator.canShare && navigator.canShare({files: [f]})) return navigator.share({files: [f], title: name}).catch(function(e2){ if (e2 && e2.name !== "AbortError") dl(blob, name); }); } catch(x) {}
    dl(blob, name); return Promise.resolve();
  }
  function dl(blob, name){ var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 30000); }
  function fname(m, ext){ return ((m.cust || "고객") + "_" + titleOf(m) + "_" + today().slice(5).replace("-", "")).replace(/[\\/:*?"<>|\s·]+/g, "_").slice(0, 60) + "." + ext; }

  function makePng(m){
    return needLib().then(function(){ return snap(onePage(m), 1080, IOS ? 1 : 1.25); }).then(function(c){
      return new Promise(function(r){ c.toBlob(function(b){ c.width = c.height = 0; r(b); }, "image/png"); }); });
  }
  function makePdf(m, pg){
    var pages = pg || fullPages(m), pdf = null;
    return needLib().then(function(){
      return pages.reduce(function(p, html){
        return p.then(function(){ return snap(html, PW, IOS ? 1.6 : 2).then(function(c){
          var url = c.toDataURL("image/jpeg", 0.9); c.width = c.height = 0;
          if (!pdf){ return html2pdf().set({margin: 0, jsPDF: {unit: "px", format: [PW, PH], orientation: "portrait", hotfixes: ["px_scaling"]}}).from(document.createElement("div")).toPdf().get("pdf").then(function(P0){ pdf = P0; pdf.addImage(url, "JPEG", 0, 0, PW, PH); }); }
          pdf.addPage([PW, PH], "portrait"); pdf.addImage(url, "JPEG", 0, 0, PW, PH);
        }); });
      }, Promise.resolve());
    }).then(function(){ return pdf.output("blob"); });
  }

  // 🖼️ 안 깨지는 그림판 PPT — PDF 쪽을 그림으로 한 장씩 (A4 세로)
  function makePptImg(m){
    var pages = fullPages(m), imgs = [];
    return needLib().then(needPpt).then(function(){
      return pages.reduce(function(p, html){ return p.then(function(){ return snap(html, PW, IOS ? 1.6 : 2).then(function(c){ imgs.push(c.toDataURL("image/jpeg", 0.9)); c.width = c.height = 0; }); }); }, Promise.resolve());
    }).then(function(){
      var P = new PptxGenJS(); P.defineLayout({name: "A4P", width: 8.27, height: 11.69}); P.layout = "A4P"; P.title = custName(m) + " 투자 제안서";
      imgs.forEach(function(u){ var sl = P.addSlide(); sl.background = {color: "FFFFFF"}; sl.addImage({data: u, x: 0, y: 0, w: 8.27, h: 11.69}); });
      return P.write({outputType: "blob"});
    });
  }
  // PPT 글에서 이모지 빼기 — 일부 뷰어(윈도우 옛 버전·휴대폰)에서 네모로 깨짐
  var EMO = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;
  function noEmo(x){
    if (typeof x === "string") return x.replace(EMO, "").replace(/^\s+/, "").replace(/\s{2,}/g, " ");
    if (Array.isArray(x)) return x.map(noEmo);
    if (x && typeof x === "object" && "text" in x){ var o = {}; for (var k in x) o[k] = x[k]; o.text = noEmo(x.text); return o; }
    return x;
  }

  /* ═════════ ③ PPT (16:9 · 맑은 고딕 · PPT 안에서 고칠 수 있는 진짜 차트) ═════════ */
  function hx(c){ return String(c || "#14304f").replace("#", "").toUpperCase(); }
  function makePpt(m){
    return needPpt().then(function(){
      var P = new PptxGenJS(), F = "맑은 고딕";
      P.layout = "LAYOUT_WIDE"; P.theme = {headFontFace: F, bodyFontFace: F};
      var _add = P.addSlide.bind(P);
      P.addSlide = function(){ var sl = _add(), at = sl.addText.bind(sl), tb = sl.addTable.bind(sl), ch = sl.addChart.bind(sl);
        sl.addText = function(t, o){ return at(noEmo(t), o); };
        sl.addTable = function(r, o){ return tb(noEmo(r), Object.assign({autoPage: false}, o || {})); };
        sl.addChart = function(tp, d, o){ if (o && o.title) o.title = noEmo(o.title); return ch(tp, (d || []).map(function(z){ var y = {}; for (var k in z) y[k] = z[k]; if (y.labels) y.labels = noEmo(y.labels); if (y.name) y.name = noEmo(y.name); return y; }), o); };
        return sl; }; P.title = custName(m) + " 투자 제안서"; P.author = byLine(m) || "PB";
      function T(s, text, o){ var d = {fontFace: F, fontSize: 14, color: "1D2533", valign: "top", margin: 0}; for (var k in o) d[k] = o[k]; s.addText(text, d); }
      function head(s, t, sub, color){ s.background = {color: "FFFFFF"}; s.addShape(P.ShapeType.rect, {x: 0, y: 0, w: 13.333, h: 0.12, fill: {color: hx(color || NAVY)}, line: {color: hx(color || NAVY)}});
        T(s, t, {x: 0.6, y: 0.32, w: 10, h: 0.6, fontSize: 25, bold: true, color: hx(color || NAVY)}); if (sub) T(s, sub, {x: 0.6, y: 0.92, w: 12, h: 0.35, fontSize: 12, color: "5B6576"});
        T(s, custName(m) + " 투자 제안 · " + m.date + (byLine(m) ? " · " + byLine(m) : ""), {x: 0.6, y: 7.08, w: 12.1, h: 0.28, fontSize: 9, color: "8A93A3"}); }
      function rbox(s, x, y, w, h, fill){ s.addShape(P.ShapeType.roundRect, {x: x, y: y, w: w, h: h, fill: {color: hx(fill || BG)}, line: {color: hx(fill || BG)}, rectRadius: 0.1}); }
      function th(cols){ return cols.map(function(c){ return {text: c, options: {bold: true, color: "FFFFFF", fill: {color: hx(NAVY)}}}; }); }
      function kpis(s, kp, x, y, w, cols){ kp = (kp || []).filter(function(k){ return k && k.value && k.value !== "–"; }); var cw = (w - 0.15 * (cols - 1)) / cols; (kp || []).forEach(function(k, i){ var xx = x + (i % cols) * (cw + 0.15), yy = y + Math.floor(i / cols) * 1.12;
        rbox(s, xx, yy, cw, 1.0); T(s, k.label, {x: xx + 0.12, y: yy + 0.08, w: cw - 0.2, h: 0.26, fontSize: 9.5, color: "5B6576", bold: true});
        T(s, k.value, {x: xx + 0.12, y: yy + 0.32, w: cw - 0.2, h: 0.38, fontSize: 17, bold: true, color: k.tone > 0 ? "1A8A5A" : k.tone < 0 ? hx(UP) : "1D2533"});
        T(s, k.sub || "", {x: xx + 0.12, y: yy + 0.68, w: cw - 0.2, h: 0.28, fontSize: 8, color: "5B6576"}); }); }
      function lineChart(s, ch, x, y, w, h, color){
        if (!ch || !ch.vals || ch.vals.length < 2) return;
        var step = Math.max(1, Math.floor(ch.vals.length / 70)), data = [];
        var sub = function(arr){ var o = []; for (var i = 0; i < arr.length; i += step) o.push(arr[i]); return o; };
        var lb = sub(ch.labels).map(function(l){ return ch.kind === "curve" ? l : String(l).slice(2, 7).replace("-", "."); });
        if (ch.multi) ch.multi.forEach(function(mm){ data.push({name: mm.name, labels: lb, values: sub(mm.vals)}); });
        else { data.push({name: ch.title, labels: lb, values: sub(ch.vals)}); if (ch.ma) data.push({name: ch.mal || "평균선", labels: lb, values: sub(ch.ma).map(function(v){ return v == null ? null : v; })}); }
        T(s, ch.title, {x: x, y: y, w: w, h: 0.3, fontSize: 12, bold: true});
        s.addChart(P.ChartType.line, data, {x: x - 0.1, y: y + 0.3, w: w + 0.1, h: h - 0.3, chartColors: ch.multi ? ch.multi.map(function(mm){ return hx(mm.color); }) : [hx(ch.color || color), "9AA3B2"], lineDataSymbol: ch.kind === "curve" ? "circle" : "none", lineDataSymbolSize: 5, lineSize: 2,
          catAxisLabelFontFace: F, catAxisLabelFontSize: 8, valAxisLabelFontFace: F, valAxisLabelFontSize: 8, showLegend: !!(ch.multi || ch.ma), legendPos: "b", legendFontFace: F, legendFontSize: 8, catAxisLabelFrequency: Math.max(1, Math.ceil(lb.length / 6)), valGridLine: {color: "EEF1F6", size: 0.5}});
      }
      function colChart(s, title, items, x, y, w, h){
        T(s, title, {x: x, y: y, w: w, h: 0.3, fontSize: 12, bold: true});
        s.addChart(P.ChartType.bar, [{name: title, labels: items.map(function(i){ return i.l; }), values: items.map(function(i){ return Math.round(i.v); })}], {x: x - 0.1, y: y + 0.3, w: w + 0.1, h: h - 0.3, barDir: "col",
          chartColors: items.map(function(i){ return i.v >= 0 ? "22A06B" : "E0533D"; }), showValue: true, dataLabelFormatCode: '#,##0', dataLabelFontFace: F, dataLabelFontSize: 8, catAxisLabelFontFace: F, catAxisLabelFontSize: 8.5, valAxisHidden: true, valGridLine: {style: "none"}, showLegend: false});
      }
      // 표지
      var s = P.addSlide(); s.background = {color: hx(NAVY)};
      s.addShape(P.ShapeType.ellipse, {x: 9.3, y: -1.6, w: 5.6, h: 5.6, fill: {color: "FFFFFF", transparency: 93}, line: {color: "FFFFFF", transparency: 100}});
      T(s, "INVESTMENT PROPOSAL", {x: 0.9, y: 1.1, w: 8, h: 0.4, fontSize: 13, color: "C9D6EA", bold: true, charSpacing: 4});
      T(s, custName(m) + "을 위한", {x: 0.9, y: 1.9, w: 11, h: 0.5, fontSize: 20, color: "E6EDF7"});
      T(s, titleOf(m) + " 투자 제안서", {x: 0.9, y: 2.45, w: 11.5, h: 1.3, fontSize: 36, bold: true, color: "FFFFFF"});
      s.addShape(P.ShapeType.rect, {x: 0.9, y: 3.95, w: 0.8, h: 0.07, fill: {color: "F0B43C"}, line: {color: "F0B43C"}});
      if (m.total) { T(s, "제안 금액", {x: 0.9, y: 4.3, w: 4, h: 0.35, fontSize: 13, color: "C9D6EA"}); T(s, man(m.total), {x: 0.9, y: 4.65, w: 6, h: 0.7, fontSize: 32, bold: true, color: "FFFFFF"}); }
      T(s, m.items.map(function(x){ return x.f.short + (x.amt ? " " + man(x.amt) : ""); }).join("   ·   "), {x: 0.9, y: 5.55, w: 11.5, h: 0.4, fontSize: 13, color: "E6EDF7"});
      T(s, "제안  " + (byLine(m) || "담당 PB"), {x: 0.9, y: 6.55, w: 8, h: 0.4, fontSize: 16, bold: true, color: "FFFFFF"});
      T(s, m.date, {x: 8.9, y: 6.6, w: 3.6, h: 0.35, fontSize: 12, color: "C9D6EA", align: "right"});
      if (m.items.length > 1){ s = P.addSlide(); head(s, "🧺 제안 한눈에", "상품별 금액");
        s.addChart(P.ChartType.doughnut, [{name: "금액", labels: m.items.map(function(x){ return x.f.short; }), values: m.items.map(function(x){ return x.amt || 1; })}],
          {x: 0.5, y: 1.4, w: 5, h: 5.3, holeSize: 58, chartColors: m.items.map(function(x){ return hx(x.f.color); }), showPercent: true, showLegend: true, legendPos: "b", legendFontFace: F, legendFontSize: 11, dataLabelColor: "FFFFFF", dataLabelFontFace: F, dataLabelFontSize: 11});
        s.addTable([th(["상품", "금액", "핵심"])].concat(m.items.map(function(x){ var sl = simLine(x.f, x.amt); return [{text: x.f.icon + " " + x.f.short, options: {bold: true}}, man(x.amt), x.f.headline + (sl ? "\n🧮 " + sl.lab + " " + sl.big : "")]; })),
          {x: 5.8, y: 1.5, w: 7.0, colW: [1.6, 1.3, 4.1], fontFace: F, fontSize: 10, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"}); }
      m.items.forEach(function(x){
        var f = x.f, ls = lines(f, x.amt), mk = f.mkt || {}, S = f.sim, A = x.amt || 100000000, sl = simLine(f, x.amt);
        // 제안
        s = P.addSlide(); head(s, f.icon + " " + f.title, f.sub, f.color);
        rbox(s, 0.6, 1.4, 12.1, 0.72, f.color); T(s, f.headline, {x: 0.8, y: 1.46, w: 11.8, h: 0.6, fontSize: 15, bold: true, color: "FFFFFF", valign: "middle"});
        s.addChart(P.ChartType.doughnut, [{name: "비중", labels: f.alloc.map(function(a){ return a.name; }), values: f.alloc.map(function(a){ return a.pct; })}],
          {x: 0.5, y: 2.3, w: 4.3, h: 4.5, holeSize: 55, chartColors: f.alloc.map(function(a){ return hx(a.color); }), showPercent: true, showLegend: false, dataLabelColor: "FFFFFF", dataLabelFontFace: F, dataLabelFontSize: 11, dataLabelFontBold: true});
        s.addTable([th(["칸", "상품", "비중", "금액"])].concat(ls.map(function(l){ return [{text: l.a.name, options: {bold: true, color: hx(l.a.color)}}, (l.a.inst || "") + (l.a.code && String(l.a.code).length < 12 ? " (" + l.a.code + ")" : ""), {text: pc(l.a.pct), options: {align: "right", bold: true}}, {text: x.amt ? man(l.won) : "–", options: {align: "right"}}]; })),
          {x: 5.0, y: 2.35, w: 7.7, colW: [1.9, 3.7, 0.8, 1.3], fontFace: F, fontSize: 11, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"});
        var yy = 2.45 + 0.38 * (ls.length + 1) + 0.15;
        if (sl){ rbox(s, 5.0, yy, 7.7, 0.85, "#EEF4FF"); T(s, "🧮 " + sl.lab, {x: 5.15, y: yy + 0.06, w: 7.4, h: 0.26, fontSize: 10, color: "5B6576", bold: true}); T(s, sl.big + "   " + sl.sub, {x: 5.15, y: yy + 0.33, w: 7.4, h: 0.45, fontSize: 12.5, bold: true, color: hx(NAVY)}); yy += 1.0; }
        T(s, (f.points || []).map(function(p){ return {text: p, options: {bullet: {code: "2714"}, breakLine: true}}; }), {x: 5.0, y: yy, w: 7.7, h: 6.9 - yy, fontSize: 11.5, paraSpaceAfter: 4});
        // 시장
        if (f.mkt){ s = P.addSlide(); head(s, "📊 " + (mk.title || "시장 지금"), f.short + " 판단 근거", f.color);
          var nk = Math.min(6, (mk.kpis || []).filter(function(k){ return k && k.value && k.value !== "–"; }).length), cols = nk > 4 ? 3 : nk;
          kpis(s, (mk.kpis || []).slice(0, 6), 0.6, 1.4, 6.3, cols || 1);
          var ky = 1.4 + Math.ceil(nk / (cols || 1)) * 1.12 + 0.1;
          T(s, "🔎 그래서 지금은", {x: 0.6, y: ky, w: 6.3, h: 0.3, fontSize: 13, bold: true});
          T(s, (mk.view || []).map(function(v){ return {text: v, options: {bullet: true, breakLine: true}}; }), {x: 0.6, y: ky + 0.35, w: 6.3, h: 6.95 - ky - 0.35, fontSize: 10.5, paraSpaceAfter: 4});
          var chs = mk.charts || [];
          lineChart(s, chs[0], 7.25, 1.4, 5.5, chs[1] ? 2.75 : 5.5, f.color);
          if (chs[1]) lineChart(s, chs[1], 7.25, 4.25, 5.5, 2.7, f.color);
          if (mk.outlook || chs[2]){ s = P.addSlide(); head(s, "🔭 " + (mk.outlook ? mk.outlook.title : "시장 자료"), f.short + " · " + ((mk.outlook || {}).src || ""), f.color);
            if (mk.outlook) s.addTable([th(mk.outlook.cols)].concat(mk.outlook.rows.slice(0, 14).map(function(r){ return r.map(function(c){ return String(c); }); })), {x: 0.6, y: 1.4, w: chs[2] || mk.curve ? 6.6 : 12.1, fontFace: F, fontSize: mk.outlook.rows.length > 10 ? 9 : 11, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
            if (chs[2]) lineChart(s, chs[2], 7.5, 1.4, 5.3, mk.curve ? 2.7 : 5.4, f.color);
            if (mk.curve){ var cy = chs[2] ? 4.3 : 1.4; T(s, mk.curve.title, {x: 7.5, y: cy, w: 5.3, h: 0.3, fontSize: 12, bold: true});
              s.addChart(P.ChartType.bar, [{name: "금리", labels: mk.curve.rows.map(function(r){ return r[0] + "년"; }), values: mk.curve.rows.map(function(r){ return r[1]; })}], {x: 7.4, y: cy + 0.3, w: 5.4, h: 2.4, barDir: "col", chartColors: [hx(f.color)], showValue: true, dataLabelFormatCode: "0.00", dataLabelFontFace: F, dataLabelFontSize: 8, catAxisLabelFontFace: F, catAxisLabelFontSize: 9, valAxisHidden: true, valGridLine: {style: "none"}, showLegend: false}); }
          }
        }
        // 계산서
        if (S){ s = P.addSlide(); head(s, "🧮 모의투자 계산서", (x.amt ? man(A) + " 넣으면" : "1억원 넣었다고 치면") + " · " + f.short, f.color);
          if (S.kind === "bond"){ var B = bondCalc(S, A);
            [["넣는 돈", man(A), "1D2533"], ["만기까지 받는 돈", man(B.tot), hx(NAVY)], ["이익 · 연 환산", "+" + man(B.pnl) + " · 연 " + B.cagr.toFixed(2) + "%", "1A8A5A"]].forEach(function(c, i){ rbox(s, 0.6 + i * 4.1, 1.4, 3.9, 0.95); T(s, c[0], {x: 0.75 + i * 4.1, y: 1.47, w: 3.6, h: 0.26, fontSize: 10, color: "5B6576", bold: true}); T(s, c[1], {x: 0.75 + i * 4.1, y: 1.75, w: 3.7, h: 0.5, fontSize: 18, bold: true, color: c[2]}); });
            s.addTable([th(["칸", "상품", "넣는 돈", "받는 이자(세후)", "원화로", "기간", "연 환산"])].concat(B.rows.map(function(r){ var cu = r.p.cur; return [r.p.slot, r.p.name, man(r.a), cu === "KRW" ? man(r.cpnAll - r.tax) : Math.round(r.cpnAll - r.tax).toLocaleString("ko-KR") + " " + CUR[cu], man(r.krw), r.p.yrs.toFixed(1) + "년", r.cagr.toFixed(2) + "%"]; })),
              {x: 0.6, y: 2.5, w: 12.1, colW: [1.5, 3.4, 1.4, 2.0, 1.5, 0.9, 1.4], fontFace: F, fontSize: 10, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"});
            if (B.fxScen.length) colChart(s, "환율이 바뀌면 — 이익 (원)" + (B.be != null ? " · 환율이 " + Math.abs(B.be).toFixed(1) + "% 넘게 안 빠지면 이익" : ""), B.fxScen.map(function(q){ return {l: "환율 " + (q.m > 0 ? "+" : q.m < 0 ? "−" : "") + Math.abs(q.m) + "%", v: q.pnl}; }), 0.6, 4.0, B.rateScen.length ? 6.0 : 12.1, 2.9);
            if (B.rateScen.length) colChart(s, "1년 뒤 팔면 — 금리가 바뀔 때 이익 (원)", B.rateScen.map(function(q){ return {l: "금리 " + (q.d > 0 ? "+" : q.d < 0 ? "−" : "") + Math.abs(q.d) + "%p", v: q.pnl}; }), B.fxScen.length ? 6.8 : 0.6, 4.0, B.fxScen.length ? 5.9 : 12.1, 2.9);
          } else if (S.kind === "els"){ var EE = elsCalc(S, A);
            var rws = []; EE.forEach(function(q){ q.steps.forEach(function(st, i){ rws.push([i === 0 ? q.p.slot + "\n" + q.p.name : "", st.t + "개월", man(st.won), "+" + man(st.won - q.a), st.pr != null ? st.pr.toFixed(1) + "%" : "–"]); }); q.tail.forEach(function(t){ rws.push(["", t.lab, man(t.won), (t.won - q.a >= 0 ? "+" : "−") + man(Math.abs(t.won - q.a)), t.pr != null ? t.pr.toFixed(1) + "%" : "–"]); }); });
            s.addTable([th(["상품", "끝나는 때", "받는 돈", "이익", "과거 확률"])].concat(rws), {x: 0.6, y: 1.4, w: 7.3, colW: [2.2, 1.9, 1.2, 1.1, 0.9], fontFace: F, fontSize: 8, rowH: 0.19, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
            colChart(s, "평균 기대 이익 (과거 확률 반영)", EE.map(function(q){ return {l: q.p.slot, v: q.ev - q.a}; }), 8.2, 1.4, 4.6, 3.0);
            T(s, S.note, {x: 8.2, y: 4.6, w: 4.6, h: 2.2, fontSize: 9.5, color: "5B6576"});
          } else if (S.kind === "equity"){ var Q = eqCalc(S, A), b = S.bt;
            [["연평균 (" + b.from.slice(0, 4) + "년부터)", "연 " + b.cagr + "%", hx(NAVY)], ["1년 보유 시 이익 확률", b.y1.pos + "%", "1A8A5A"], ["가장 크게 빠졌을 때", b.mdd + "%", hx(UP)]].forEach(function(c, i){ rbox(s, 0.6 + i * 4.1, 1.4, 3.9, 0.95); T(s, c[0], {x: 0.75 + i * 4.1, y: 1.47, w: 3.6, h: 0.26, fontSize: 10, color: "5B6576", bold: true}); T(s, c[1], {x: 0.75 + i * 4.1, y: 1.75, w: 3.7, h: 0.5, fontSize: 20, bold: true, color: c[2]}); });
            lineChart(s, {title: man(A) + "을 " + b.from.slice(0, 4) + "년에 넣었다면", labels: b.growth.labels, vals: b.growth.vals.map(function(v){ return Math.round(v * A / 10000); }), color: f.color}, 0.6, 2.55, 6.2, 4.3, f.color);
            colChart(s, "1년 뒤 이익 (원) — 나쁜·보통·좋은 해", Q.y1.map(function(q){ return {l: q.l.split(" ")[0] + " 해 " + sgn(q.r, 0), v: q.won - A}; }), 7.1, 2.55, 5.7, 2.1);
            colChart(s, "해마다 수익률 (%)", b.years.map(function(y){ return {l: String(y[0]).slice(2), v: y[1]}; }), 7.1, 4.75, 5.7, 2.1);
          }
        }
        if ((f.must && f.must.length) || f.taxbox){ s = P.addSlide(); head(s, (f.must && f.must.length ? "⭐ 추천 종목 · " : "") + "💱 " + (f.mode === "usd" ? "환전해서 투자 (미국 상장)" : "원화로 투자 (국내 상장)"), "세금·거래 방식", f.color);
          var yy2 = 1.4;
          if (f.must && f.must.length){ s.addTable([th(["종목·ETF", "비중", "금액", "왜 담나"])].concat(f.must.map(function(a){ return [{text: a.inst.split(" · ")[0] + "\n" + [a.code, a.inst.split(" · ")[1]].filter(Boolean).join(" · "), options: {bold: true, color: hx(a.color)}}, pc(a.pct), A ? man(A * a.pct / 100) : "–", (a.reason || []).slice(0, 4).join("\n") || a.why]; })),
            {x: 0.6, y: yy2, w: 12.1, colW: [2.6, 0.8, 1.2, 7.5], fontFace: F, fontSize: 9, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"}); yy2 += Math.min(4.2, 0.85 * f.must.length + 0.45) + 0.25; }
          if (f.taxbox){ rbox(s, 0.6, yy2, 12.1, Math.min(3.2, 6.9 - yy2), "#EEF4FF"); T(s, [{text: (f.mode === "usd" ? "환전해서 미국 상장 ETF로" : "원화로 국내 상장 ETF로"), options: {bold: true, breakLine: true, color: hx(NAVY)}}].concat(f.taxbox.map(function(t){ return {text: t, options: {bullet: true, breakLine: true}}; })).concat([{text: "금융소득 연 2,000만원 넘는 분·매매차익이 큰 분은 환전(분리과세)이, 연금 계좌·소액·원화 편의는 원화가 유리함", options: {color: "5B6576"}}]), {x: 0.8, y: yy2 + 0.15, w: 11.7, h: Math.min(3.2, 6.9 - yy2) - 0.3, fontSize: 12, paraSpaceAfter: 5}); }
        }
        if (f.themes && f.themes.length){ s = P.addSlide(); var tpp = ((f.alloc || []).filter(function(a){ return a.k === "theme"; })[0] || {}).pct || 0;
          head(s, "🧭 시황 테마 칸 " + pc(tpp) + " — 리포트가 고른 「돈이 몰리는 곳」", "돈은 ETF로 · 대표 종목은 참고 · 리포트 의견이 바뀌면 비중도 바뀜", f.color);
          s.addTable([th(["테마", "비중", "금액", "담을 ETF", "왜", "대표 종목(참고)", "흐름"])].concat(f.themes.map(function(t){ return [{text: t.name, options: {bold: true, color: hx(t.color)}}, pc(t.w), A ? man(A * t.w / 100) : "–", pkn(t.pick) + "\n" + t.pick.where, t.txt, (t.stocks || []).slice(0, 3).join(" · "), t.sig]; })),
            {x: 0.6, y: 1.4, w: 12.1, colW: [1.4, 0.7, 1.1, 2.6, 3.4, 2.0, 0.9], fontFace: F, fontSize: 9.5, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"});
        }
        // 10/28 「우와」 — 주식: 비교·위기·속 들여다보기 / 외화채: 환율 × 금리 표
        if (S && S.kind === "equity"){
          if (S.cmp && S.cmp.length > 1){ s = P.addSlide(); head(s, "⚔️ 다른 선택과 비교 · 🌪️ 위기 때는", "같은 기간(" + S.bt.from.slice(0, 4) + "년~) · 같은 금액 " + man(A), f.color);
            s.addTable([th(["", "연평균", "최대 하락", "1년 이익 확률", "원금 아래 최장", "10년 뒤"])].concat(S.cmp.map(function(c){ var o = c.me ? {bold: true, fill: {color: "FFF6E8"}} : {}; return [{text: (c.me ? "★ " : "") + c.name, options: o}, {text: sgn(c.cagr, 1), options: o}, {text: sgn(c.mdd, 1), options: o}, {text: c.pos + "%", options: o}, {text: (c.uw || 0) + "개월", options: o}, {text: man(A * Math.pow(1 + c.cagr / 100, 10)), options: o}]; })),
              {x: 0.6, y: 1.4, w: 7.4, colW: [1.7, 1.0, 1.1, 1.2, 1.2, 1.2], fontFace: F, fontSize: 10.5, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", align: "right"});
            s.addChart(P.ChartType.bar, [{name: "연평균 %", labels: S.cmp.map(function(c){ return c.name; }), values: S.cmp.map(function(c){ return c.cagr; })}], {x: 8.2, y: 1.3, w: 4.6, h: 2.3, barDir: "bar", chartColors: S.cmp.map(function(c){ return c.me ? hx(f.color) : "B7C0CF"; }), showValue: true, dataLabelFormatCode: '0.0"%"', dataLabelFontFace: F, dataLabelFontSize: 9, catAxisLabelFontFace: F, catAxisLabelFontSize: 9, valAxisHidden: true, valGridLine: {style: "none"}, showLegend: false, catAxisOrientation: "maxMin", showTitle: true, title: "연평균 수익", titleFontFace: F, titleFontSize: 11});
            if (S.stress && S.stress.length){
              var keys = ["이 제안", "코스피만", "S&P500만"];
              s.addChart(P.ChartType.bar, keys.map(function(k2){ return {name: k2, labels: S.stress.map(function(r){ return r.name; }), values: S.stress.map(function(r){ return r[k2] ? r[k2].ret : 0; })}; }),
                {x: 0.5, y: 3.75, w: 8.0, h: 3.2, barDir: "col", barGrouping: "clustered", chartColors: [hx(f.color), "E0533D", "9AA3B2"], showValue: true, dataLabelFormatCode: '0"%"', dataLabelFontFace: F, dataLabelFontSize: 8, catAxisLabelFontFace: F, catAxisLabelFontSize: 9, valAxisLabelFontFace: F, valAxisLabelFontSize: 8, showLegend: true, legendPos: "b", legendFontFace: F, legendFontSize: 9, showTitle: true, title: "위기 때 수익률 (스트레스 테스트)", titleFontFace: F, titleFontSize: 11});
              T(s, S.stress.map(function(r){ var w = r["이 제안"]; return {text: r.name + ": " + sgn(w.ret, 1) + " (" + (w.ret >= 0 ? "+" : "−") + man(Math.abs(A * w.ret / 100)) + (w.rec != null ? ", " + w.rec + "개월 뒤 회복" : "") + ")", options: {bullet: true, breakLine: true}}; }), {x: 8.7, y: 3.9, w: 4.1, h: 3.0, fontSize: 10, paraSpaceAfter: 4});
            }
          }
          if (S.look){ var L = S.look; s = P.addSlide(); head(s, "🔍 실제로 담기는 회사 — ETF 속을 열어 보면", L.n + "개 회사에 나눠 담김 · ETF 구성표 " + (L.asof || "") + " × 제안 비중", f.color);
            s.addTable([th(["회사", "업종", "비중", "금액"])].concat(L.top.slice(0, 12).map(function(t, i){ return [(i + 1) + ". " + t.n, t.sec, {text: t.w.toFixed(2) + "%", options: {align: "right"}}, {text: man(A * t.w / 100), options: {align: "right", bold: true}}]; })), {x: 0.6, y: 1.4, w: 6.6, colW: [2.4, 2.0, 0.9, 1.3], fontFace: F, fontSize: 10.5, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle"});
            s.addChart(P.ChartType.doughnut, [{name: "업종", labels: L.sector.map(function(x){ return x[0]; }), values: L.sector.map(function(x){ return x[1]; })}], {x: 7.5, y: 1.3, w: 5.3, h: 4.0, holeSize: 52, chartColors: ["2F6FDF", "7B5CFF", "1F9FB5", "22A06B", "E6A817", "F08A3C", "C9568F", "4F8FBF", "B7C0CF"], showPercent: true, showLegend: true, legendPos: "r", legendFontFace: F, legendFontSize: 9, dataLabelColor: "FFFFFF", dataLabelFontFace: F, dataLabelFontSize: 8, showTitle: true, title: "업종별 (주식 칸)", titleFontFace: F, titleFontSize: 11});
            if (S.region) T(s, "🌍 돈이 어디에 있나: " + S.region.map(function(r2){ return r2[0] + " " + pc(r2[1]) + "(" + man(A * r2[1] / 100) + ")"; }).join(" · "), {x: 7.5, y: 5.5, w: 5.3, h: 1.2, fontSize: 11, bold: true, color: hx(NAVY)});
          }
        }
        if (S && S.kind === "bond"){ var BH = bondCalc(S, A);
          if (BH.heat){ s = P.addSlide(); head(s, "🌐 1년 뒤 원화 손익 — 환율 × 금리", man(A) + " 기준 · 가로 = 금리 변화 · 세로 = " + (S.cur === "MIX" ? "헤알·달러" : "달러") + " 값 변화", f.color);
            var LV = fxLv(S), H2 = BH.heat, mx2 = 0; H2.cells.forEach(function(r){ r.forEach(function(c){ mx2 = Math.max(mx2, Math.abs(c.pct)); }); });
            var hcol = function(p2){ var t = Math.min(1, Math.abs(p2) / (mx2 || 1)); var mix = function(a2, b2){ return Math.round(a2 + (b2 - a2) * (0.15 + t * 0.7)); }; var to = p2 >= 0 ? [34, 160, 107] : [224, 83, 61]; return [mix(255, to[0]), mix(255, to[1]), mix(255, to[2])].map(function(v){ return ("0" + v.toString(16)).slice(-2); }).join("").toUpperCase(); };
            s.addTable([th(["환율 ↓ · 금리 →"].concat(H2.d.map(function(d){ return d === 0 ? "그대로" : (d > 0 ? "+" : "−") + Math.abs(d) + "%p"; })))].concat(H2.fx.map(function(m2, i){ return [{text: (m2 === 0 ? "그대로" : (m2 > 0 ? "+" : "−") + Math.abs(m2) + "%") + (LV.fx ? "  " + (LV.fx * (1 + m2 / 100)).toLocaleString("ko-KR", {maximumFractionDigits: LV.d}) + "원" : ""), options: {bold: true, fill: {color: "F5F7FB"}}}].concat(H2.cells[i].map(function(c){ return {text: (c.pnl >= 0 ? "+" : "−") + man(Math.abs(c.pnl)) + "\n" + sgn(c.pct, 1), options: {align: "center", fill: {color: hcol(c.pct)}, bold: m2 === 0}}; })); })),
              {x: 0.6, y: 1.4, w: 8.6, fontFace: F, fontSize: 10, border: {type: "solid", pt: 1, color: "FFFFFF"}, valign: "middle", rowH: 0.62});
            T(s, [{text: "읽는 법", options: {bold: true, breakLine: true}}, {text: "초록은 이익, 빨강은 손실 · 진할수록 큼", options: {breakLine: true}}, {text: " ", options: {breakLine: true}}, {text: "핵심", options: {bold: true, breakLine: true}},
              {text: "금리보다 환율이 손익을 더 크게 흔듦", options: {bullet: true, breakLine: true}}, {text: "가운데(둘 다 그대로) = 1년 이자만큼 이익", options: {bullet: true, breakLine: true}}, {text: "만기까지 들고 가면 금리 영향은 사라짐", options: {bullet: true, breakLine: true}},
              {text: (BH.be != null ? "환율이 만기까지 " + Math.abs(BH.be).toFixed(1) + "% 넘게 안 빠지면 원화로도 이익" : ""), options: {bullet: true}}], {x: 9.5, y: 1.4, w: 3.3, h: 4.8, fontSize: 11, paraSpaceAfter: 4});
          }
        }
        // 위험
        s = P.addSlide(); head(s, f.icon + " " + f.short + " — 담을 상품 · 꼭 알아 둘 점", "", f.color);
        s.addTable([th(["칸", "상품", "비중", "금액", "이유"])].concat(ls.map(function(l){ return [{text: l.a.name, options: {bold: true}}, l.a.inst || "", pc(l.a.pct), x.amt ? man(l.won) : "–", l.a.why]; })), {x: 0.6, y: 1.4, w: 12.1, colW: [1.6, 2.8, 0.8, 1.3, 5.6], fontFace: F, fontSize: 9.5, border: {type: "solid", pt: 0.5, color: "E3E7EE"}, valign: "middle", autoPage: false});
        var ry = 1.6 + 0.45 * (ls.length + 1);
        if (f.tax){ rbox(s, 0.6, ry, 5.9, 1.3, "#EFFAF4"); T(s, "🧾 세액공제 (연 " + f.tax.limit + "만원 넣을 때)\n" + taxLine(f).map(function(t){ return t.who + " · " + t.rate + "% → " + t.full; }).join("\n") + "\n" + f.tax.note, {x: 0.75, y: ry + 0.1, w: 5.6, h: 1.1, fontSize: 10}); }
        rbox(s, f.tax ? 6.8 : 0.6, ry, f.tax ? 5.9 : 12.1, 6.9 - ry, "#FFF4F2");
        T(s, "⚠️ 꼭 알아 둘 점", {x: (f.tax ? 6.95 : 0.75), y: ry + 0.1, w: 5.6, h: 0.3, fontSize: 12, bold: true, color: "B3372A"});
        T(s, (f.risks || []).map(function(r){ return {text: r, options: {bullet: true, breakLine: true}}; }), {x: (f.tax ? 6.95 : 0.75), y: ry + 0.45, w: (f.tax ? 5.6 : 11.8), h: 6.9 - ry - 0.55, fontSize: 11, paraSpaceAfter: 4});
      });
      s = P.addSlide(); head(s, "📌 투자 전 꼭 확인하실 점", m.basis);
      T(s, m.notice.concat(["모의 계산은 지금 금리·환율과 과거 자료로 계산한 예시이며 실제 결과와 다를 수 있음"]).map(function(t){ return {text: t, options: {bullet: {type: "number"}, breakLine: true}}; }), {x: 0.8, y: 1.5, w: 11.8, h: 3.6, fontSize: 15, paraSpaceAfter: 10});
      T(s, "제안  " + (byLine(m) || "담당 PB"), {x: 0.8, y: 5.6, w: 6, h: 0.5, fontSize: 20, bold: true, color: hx(NAVY)});
      T(s, custName(m) + " 확인  ______________________", {x: 6.8, y: 5.7, w: 6, h: 0.4, fontSize: 13, color: "5B6576", align: "right"});
      var D = discOf(m), nn = 0, li = function(t){ nn++; return {text: nn + ". " + t, options: {breakLine: true}}; };
      s = P.addSlide(); head(s, "⚖️ 투자위험 고지 — 공통 사항", "가입 전 반드시 확인");
      T(s, D.C.slice(0, 6).map(li), {x: 0.5, y: 1.35, w: 6.1, h: 5.3, fontSize: 11.5, paraSpaceAfter: 7, valign: "top"});
      T(s, D.C.slice(6).map(li), {x: 6.8, y: 1.35, w: 6.1, h: 5.3, fontSize: 11.5, paraSpaceAfter: 7, valign: "top"});
      for (var di = 0; di < D.P.length; di += 4){ var grp = D.P.slice(di, di + 4);
        s = P.addSlide(); head(s, "⚖️ 투자위험 고지 — 상품별 위험", D.P.length > 4 ? (di / 4 + 1) + "/" + Math.ceil(D.P.length / 4) : "제안 상품에 해당하는 항목");
        grp.forEach(function(g, gi){ var gx = 0.5 + (gi % 2) * 6.3, gy = 1.35 + Math.floor(gi / 2) * 2.85;
          rbox(s, gx, gy, 6.1, 2.7, "#FFF7F5");
          T(s, g.ic + " " + g.t + " 투자 시 위험", {x: gx + 0.15, y: gy + 0.08, w: 5.8, h: 0.32, fontSize: 11, bold: true, color: "B3372A"});
          T(s, g.l.map(function(t){ return {text: t, options: {bullet: true, breakLine: true}}; }), {x: gx + 0.15, y: gy + 0.42, w: 5.8, h: 2.2, fontSize: 10.5, paraSpaceAfter: 4, valign: "top"}); }); }
      T(s, ["작성일 " + m.date + (m.org ? " · " + m.org : ""), simNo(m)].filter(Boolean).join("   |   "), {x: 0.5, y: 6.72, w: 12.3, h: 0.28, fontSize: 9.5, color: "5B6576", align: "right"});
      return P.write({outputType: "blob"});
    });
  }

  /* ═════════ 앱 화면 ═════════ */
  var AMTS = [[1000, "1천만"], [3000, "3천만"], [5000, "5천만"], [10000, "1억"], [30000, "3억"]];
  window.propView = function(){ return '<div id="ppw"><div class="loading">오늘 기본폼 불러오는 중…</div></div>'; };
  window.propInit = function(){ load().then(function(){ takeSetting(); draw(); }).catch(function(){ var w = document.getElementById("ppw"); if (w) w.innerHTML = '<div class="empty"><div class="big">📝</div>오늘 기본폼을 아직 못 받았어요.<br>잠시 뒤 다시 열어 주세요.</div>'; }); };
  // ⚖️ 위험고지 · 심의필 칸 (10/29 사용자 「PB들이 누르면 내용을 확인하고 심의필을 받게」)
  function simCard(){
    var S = simState(), D = discOf(allModel(), true), n = 0, li = function(t){ return '<li><b>' + (++n) + '.</b> ' + e(t) + '</li>'; };
    return '<section data-xc="1" class="card pp-sim"><details class="no-clp" data-xc="1" data-cz="done"' + (S.ok ? '' : ' open') + '><summary><span class="pp-sh">⚖️ 위험고지 · 심의필' + jt(JOY.sim) + '</span><span id="ppsimst" class="pp-chip ' + S.cls + '">' + S.t + '</span></summary>' +
      '<div class="pp-hb no-clp" data-xc="1" data-cz="done">' +
      '<p id="ppsimwhy" class="pp-tip" style="margin:0 0 8px' + (S.why ? '' : ';display:none') + '">' + e(S.why) + '</p>' +
      '<ol class="pp-steps"><li><b>① 문구 확인</b><span>모든 제안서 맨 끝에 들어가는 위험고지 원문을 아래에서 읽어 봄</span></li>' +
      '<li><b>② 심의 요청</b><span>「📝 심의 요청서 PDF」를 받아 준법감시 부서에 제출 (결과 기재 칸 포함)</span></li>' +
      '<li><b>③ 번호 넣기</b><span>받은 심의필 번호·유효기간을 넣으면 한 장·PDF·PPT 모두에 자동으로 찍힘</span></li></ol>' +
      '<div class="pp-go" style="margin:10px 0"><button type="button" data-mk="disc" class="main">' + BTNL.disc + '</button><button type="button" id="ppdcp">📋 문구 전체 복사<small>메일·메신저로 보낼 때</small></button></div>' +
      '<div class="pp-dv">문구 버전 <b>' + DISC_VER + '</b> · 상품별 항목은 그 상품을 제안할 때만 들어감</div>' +
      '<div class="pp-dl"><div class="pp-dg">공통 사항</div><ul>' + D.C.map(li).join("") + '</ul>' +
      D.P.map(function(g){ return '<div class="pp-dg r">' + g.ic + ' ' + e(g.t) + ' 투자 시 위험</div><ul>' + g.l.map(li).join("") + '</ul>'; }).join("") +
      '<div class="pp-dg">📱 한 장 요약 줄임 문구</div><ul>' + shortDisc(D).map(function(t){ return '<li>· ' + e(t) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="pp-in" style="margin-top:12px"><label>심의필 번호<input id="ppsimno" maxlength="40" placeholder="예: 제2026-0000호" value="' + e(ME.simNo || "") + '"></label>' +
      '<label>유효기간 시작<input id="ppsimf" type="date" value="' + e(ME.simFrom || "") + '"></label>' +
      '<label>유효기간 끝<input id="ppsimt" type="date" value="' + e(ME.simTo || "") + '"></label></div>' +
      '<p class="pp-tip">이 휴대폰에 기억해 둠 · 유효기간이 지나거나 문구가 바뀌면 번호가 자동으로 빠지고 여기서 알려 드림 · 번호는 꼭 회사에서 받은 것만 넣어 주세요</p></div></details></section>';
  }
  function simUp(){ var S = simState(), c = document.getElementById("ppsimst"), w2 = document.getElementById("ppsimwhy");
    if (c){ c.className = "pp-chip " + S.cls; c.textContent = S.t; } if (w2){ w2.textContent = S.why; w2.style.display = S.why ? "" : "none"; } }
  /* 🧒 10/29 사용자 「제안서 카테고리의 조이는 설명이 거의 없어」 — 카드 제목 옆 조이를 누르면 읽어 주는 글(p.note → nav2 가 설명 칸으로 옮기고 조이가 읽음)
     · 칸 안 작은 제목(🎚·💱·⭐)과 ⚖️ 칸에는 data-tip 조이 · 숫자는 오늘 기본폼(proposal.json)에서 바로 읽음 */
  function notes(L){ return L.filter(Boolean).map(function(t){ return '<p class="note">' + e(t) + '</p>'; }).join(""); }
  function jt(tip){ return ' <span class="pp-jt" data-tip="' + e(tip) + '">ⓘ</span>'; }
  var JOY = {
    forms: function(){ var M = DATA.market || {};
      return ["매일 아침 시황 리포트가 나오면 9가지 제안서 틀(기본폼)이 저절로 다시 만들어져요. 장중에도 매시간 시세를 넣어 새로 고쳐요.",
        "🇺🇸 · 🇰🇷 칩은 지금 미국·한국 시장이 상승 추세(200일 평균선 위)인지예요. 지금은 미국 " + (M.us_up ? "상승 추세" : "조심") + " · 한국 " + (M.kr_up ? "상승 추세" : "회복 전") + "이라 주식 비중이 거기에 맞춰져 있어요.",
        "주식·개인연금 폼은 시황 리포트 배분표(미국 지수 + 한국 + 시황 테마 + 금)를 그대로 따르고, DC·IRP는 위험자산 법정 한도 70% 안에서 같은 비율로 담아요.",
        "국고채·미국채·브라질국채는 미래에셋이 지금 파는 채권 중 기간별로 세금 뗀 수익률이 가장 좋은 것을, ELS는 원금지급형 ELB에 지수형 ELS 2개를 섞어요.",
        "카드를 누르면 고르기, 한 번 더 누르면 빼기예요. 여러 개를 함께 고르면 한 제안서에 같이 들어가요.",
        "오늘 폼 한 줄씩:"].concat(DATA.forms.map(function(f){ var al = (f.alloc || []).filter(function(a){ return +a.pct > 0; });
          return f.icon + " " + f.short + " — " + (EQ[f.key] ? al.map(function(a){ return a.name.replace(/\s*\(.*\)$/, "") + " " + pc(a.pct); }).join(" · ") : String(f.headline || "").replace(/ 제안임$/, "")); })); },
    who: ["고객 이름은 표지와 인사말에만 들어가요. 이 휴대폰 밖(서버·동료 링크)으로는 나가지 않아요. 비워 두면 「고객님」으로 나와요.",
      "제안자 이름과 소속은 한 번 넣으면 이 휴대폰이 기억해서 다음부터 자동으로 들어가요.",
      "직함(PB·팀장·지점장 등)을 안 쓰면 이름 뒤에 「PB」를 붙여 줘요."],
    amt: ["상품마다 금액을 만원 단위로 적거나 칩(1천만~3억)을 눌러요. 그 금액으로 종목별 금액·이자·위기 때 줄어드는 돈이 원 단위로 계산돼요.",
      "🎚 위험 정도(주식·연금): ⚖️ 보통 = 오늘 기본폼 그대로 · 🛡 안전 = 위험자산의 절반을 현금성(CD금리)으로 · 🔥 적극 = 안전자산의 절반을 위험자산으로(DC·IRP는 70% 한도 안). 고른 단계가 한 장·PDF·PPT에 그대로 들어가요.",
      "💱 국내+해외 주식은 원화(국내 상장 ETF)로 할지, 환전해서 미국 상장 ETF로 할지 고를 수 있어요. 세금 방식이 달라요.",
      "⭐ 추천 종목·ETF를 넣으면 넣은 % 만큼 기본 포트를 원래 비율 그대로 줄여 합계 100%를 맞춰요. 왜 추천하는지는 앱 자료로 자동으로 써 줘요.",
      "개인연금·DC·IRP는 국내 상장 ETF만 담을 수 있어요."],
    make: ["📲 고객에게 보여 주기 — 상담 자리에서 휴대폰을 고객에게 건네는 화면이에요. 큰 글씨 카드를 옆으로 넘기고, 고객이 금액과 위험 정도를 직접 눌러 보면 숫자가 바로 바뀌어요. 닫을 땐 ✕를 두 번.",
      "그 화면 마지막 장의 🔗 동료 PB에게 보내기는 고른 상품·금액·위험 정도·추천 종목만 링크로 보내요. 고객 이름은 안 담겨요. 받은 PB가 열면 같은 세팅에 자기 이름·소속이 들어가요.",
      "📱 한 장 = 카톡으로 보내는 그림 한 장 · 📄 PDF = 표지·시장·상품별 분석·모의 계산·유의사항까지 다 · 📊 PPT(고칠 수 있는 판) = 글·표·차트를 PPT에서 직접 고침 · 🖼️ 그림판 PPT = 어디서 열어도 똑같이 보임.",
      "버튼을 한 번 누르면 만들고, 초록으로 바뀐 뒤 한 번 더 누르면 저장·공유 창이 떠요(아이폰은 누른 순간에만 공유 창이 열려서 그래요).",
      "모든 출력물 맨 끝에는 위험고지가 들어가요. 고객에게 드리기 전 숫자와 상품 조건을 한 번 더 확인해 주세요."],
    tier: "주식·연금 제안의 위험 정도를 세 단계로 골라요.\n⚖️ 보통 = 오늘 기본폼 그대로예요.\n🛡 안전 = 위험자산(주식·금) 몫의 절반을 현금성(CD금리 ETF)으로 옮겨요.\n🔥 적극 = 안전자산(현금성·회사채) 몫의 절반을 위험자산으로 옮겨요. DC·IRP는 법정 한도 70%를 넘지 않아요.\n이미 위험자산이 100%(또는 70% 한도)면 적극은 고를 수 없어요.\n과거 계산·위기 때 숫자도 고른 단계로 다시 계산돼서 한 장·PDF·PPT에 그대로 들어가요.",
    fx: "💴 원화로 = 국내 상장 ETF(TIGER 미국S&P500 등)로 담아요. 환전이 없고, 팔아서 남은 돈은 배당소득으로 15.4% 세금(금융소득종합과세 대상)이에요.\n💵 환전해서 = 미국 상장 ETF(SPY·QQQ·GLD 등)를 달러로 담아요. 팔아서 남은 돈은 1년에 250만원까지 빼고 22% 양도세(분리과세)예요.\n고른 방식에 맞춰 담을 ETF와 세금 설명이 바뀌어요.",
    must: "고객에게 꼭 넣고 싶은 종목·ETF를 검색해서 % 를 적어요(여러 개 가능).\n넣은 % 만큼 나머지 기본 포트를 원래 비율 그대로 줄여서 합계 100%를 맞춰요. 막대에서 줄어든 칸은 옛 % 가 흐리게 보여요.\n왜 추천하는지는 종목리포트·ETF 구성·실적·애널리스트·뉴스·시황 테마로 자동으로 써 줘요.\n개인연금·DC·IRP는 국내 상장 ETF만 담을 수 있고, DC·IRP에서 채권형·TDF는 「안전형」에 체크하면 안전자산 칸에서 깎아요.",
    sim: "모든 제안서 맨 끝에 들어가는 위험고지 문구를 확인하고 심의필을 관리하는 칸이에요.\n① 아래 원문을 읽어 보고 ② 「심의 요청서 PDF」를 받아 준법감시 부서에 내요.\n③ 받은 심의필 번호와 유효기간을 넣으면 한 장·PDF·PPT 모두에 저절로 찍혀요.\n유효기간이 지나거나 문구가 바뀌면 번호가 자동으로 빠지고 여기서 알려 줘요. 번호는 꼭 회사에서 받은 것만 넣어 주세요."
  };
  function draw(){
    var w = document.getElementById("ppw"); if (!w || !DATA) return;
    ST.sel = ST.sel.filter(function(k){ return !!form(k); });
    var M = DATA.market || {};
    var h = '<section data-xc="1" class="card pp-top"><h3>📋 오늘의 기본폼</h3>' + notes(JOY.forms()) + '<p class="pp-tip" style="margin-top:-4px">' + e(DATA.basis || "") + '</p>' +
      '<div class="pp-reg"><span class="' + (M.us_up ? "ok" : "no") + '">🇺🇸 ' + (M.us_up ? "상승 추세" : "조심") + '</span><span class="' + (M.kr_up ? "ok" : "no") + '">🇰🇷 ' + (M.kr_up ? "상승 추세" : "회복 전") + '</span><span class="mut">' + e(String(DATA.at || "").slice(5).replace("-", "/")) + ' 갱신</span></div>' +
      gUI() + '<p class="pp-tip">고를 상품을 누르세요 · 여러 개 함께 골라도 됨</p><div class="pp-grid">' + DATA.forms.map(function(f){ var on = ST.sel.indexOf(f.key) >= 0, GB = gBadge(f);
        return '<button type="button" class="pp-f' + (on ? " on" : "") + '" data-k="' + f.key + '" style="--fc:' + f.color + '"><span class="pp-i">' + e(f.icon) + '</span><b>' + e(f.short) + '</b><small>' + e(f.headline.replace(/ 제안임$/, "")) + '</small>' + (on ? '<em>✓</em>' : '') + '<span class="pp-gb ' + GB.c + '" id="ppgb_' + f.key + '">' + GB.h + '</span></button>'; }).join("") + '</div></section>';
    h += '<section data-xc="1" class="card"><h3>✍️ 누구에게 · 누가</h3>' + notes(JOY.who) + '<div class="pp-in">' +
      '<label>고객 이름<input id="ppcust" maxlength="20" placeholder="예: 홍길동" value="' + e(ST.cust) + '"></label>' +
      '<label>제안자 이름<input id="pppb" maxlength="20" placeholder="예: 김OO PB" value="' + e(ME.pb || "") + '"></label>' +
      '<label>소속<input id="pporg" maxlength="30" placeholder="예: OO WM센터" value="' + e(ME.org || "") + '"></label></div><p class="pp-tip">제안자·소속은 이 휴대폰에 기억해 둠</p></section>';
    h += simCard();
    h += '<section data-xc="1" class="card"><h3>💰 상품별 금액</h3>' + notes(JOY.amt) + '' + (ST.sel.length ? ST.sel.map(function(k){ var f = form(k), v = ST.amt[k] || "";
        return '<div class="pp-amt" style="--fc:' + f.color + '"><div class="pp-an"><span>' + e(f.icon) + '</span><b>' + e(f.short) + '</b><span class="pp-aw" id="ppw_' + k + '">' + (v ? man(v * 10000) : "") + '</span></div>' +
          '<div class="pp-ar"><input inputmode="numeric" data-ak="' + k + '" placeholder="금액 (만원)" value="' + e(v) + '"><span>만원</span></div>' +
          '<div class="pp-q">' + AMTS.map(function(a){ return '<button type="button" data-qk="' + k + '" data-qv="' + a[0] + '"' + (+v === a[0] ? ' class="on"' : '') + '>' + a[1] + '</button>'; }).join("") + '</div>' + optUI(k, f) + '</div>'; }).join("") +
        '<div class="pp-tot">합계 <b id="pptot">' + (total() ? man(total()) : "–") + '</b></div>'
      : '<p class="mut">위에서 상품을 먼저 골라 주세요.</p>') + '</section>';
    h += '<section data-xc="1" class="card"><h3>📤 만들기</h3>' + notes(JOY.make) + '<p class="pp-tip" style="margin-top:-4px">휴대폰에서 바로 만듦 · 돈 안 듦' + (simState().ok ? ' · ⚖️ 심의필 ' + e(simText()) + ' 찍힘' : ' · <span style="color:#ff7a6e">⚠️ 심의필 없음 — 위 「⚖️ 위험고지 · 심의필」에서 받아 넣어 주세요</span>') + '</p><div class="pp-go">' +
      '<button type="button" id="ppshow" class="pp-show">📲 고객에게 보여 주기 <small>큰 글씨 카드 · 넘겨 보기 · 고객이 금액·위험 정도를 직접 눌러 봄</small></button>' +
      '<button type="button" data-mk="png" class="main">📱 한 장 <small>카톡 전송용 그림</small></button>' +
      '<button type="button" data-mk="pdf">' + BTNL.pdf + '</button>' +
      '<button type="button" data-mk="ppt">' + BTNL.ppt + '</button>' +
      '<button type="button" data-mk="pptimg">' + BTNL.pptimg + '</button></div>' +
      '<div id="ppst" class="mut pp-st"></div>' + pptHelp() + pdfHelp() + '<div class="pp-pv-h">👀 한 장 미리 보기</div><div id="pppv" class="pp-pv"></div></section>';
    w.innerHTML = h;
    bind(); preview(); ensureReasons().then(function(){ preview(); });
  }
  var MKT = {KR: "한국", US: "미국", JP: "일본", CN: "중국", HK: "홍콩"};
  function optUI(k, f){
    if (!EQ[k]) return "";
    var o = opt(k), h2 = tierUI(k);
    if (k === "gl_stock") h2 += '<div class="pp-ol"><span data-tip="' + e(JOY.fx) + '">💱 해외 투자는 어떻게? ⓘ</span></div><div class="pp-md">' +
      [["krw", "💴 원화로", "국내 상장 ETF · 환전 없음"], ["usd", "💵 환전해서", "미국 상장 ETF · 달러로"]].map(function(x){ return '<button type="button" data-md="' + x[0] + '" data-mk2="' + k + '"' + (o.mode === x[0] ? ' class="on"' : '') + '><b>' + x[1] + '</b><small>' + x[2] + '</small></button>'; }).join("") + '</div>';
    var only = {pension: 1, dc: 1, irp: 1}[k], A = amtOf(k);
    h2 += '<div class="pp-ol"><span data-tip="' + e(JOY.must) + '">⭐ 추천 종목·ETF 넣기 ⓘ</span> <span class="mut">(여러 개 가능 · 이유는 자동으로 찾아 넣음)</span></div>' +
      (o.must || []).map(function(m, i){ return '<div class="pp-mu"><span class="pp-mn"><b>' + e(m.name) + '</b>' + (m.code ? ' <small>' + e(m.code) + (m.mkt ? " · " + e(m.mkt) : "") + '</small>' : ' <small>직접 입력</small>') +
        (A ? '<em class="pp-mw" id="ppmw_' + k + '_' + i + '">' + (+m.pct ? man(A * m.pct / 100) : "") + '</em>' : '') + '</span>' +
        (RET[k] ? '<label class="pp-sf"><input type="checkbox" data-mf="' + k + '" data-mi="' + i + '"' + (m.safe ? ' checked' : '') + '>안전형</label>' : '') +
        '<input inputmode="decimal" data-mp="' + k + '" data-mi="' + i + '" value="' + e(m.pct) + '"><span>%</span><button type="button" data-mx="' + k + '" data-mi="' + i + '" aria-label="빼기">✕</button></div>'; }).join("") +
      '<div class="pp-ms"><input data-ms="' + k + '" placeholder="' + (only ? "예: KODEX 200, TIGER 미국배당다우존스" : k === "gl_stock" && o.mode === "usd" ? "예: 엔비디아, AAPL, SCHD" : "예: 삼성전자, SK하이닉스, KODEX 200") + '" autocomplete="off"><button type="button" data-ma="' + k + '">더하기</button></div><div class="pp-sg" id="ppsg_' + k + '"></div>' +
      '<div class="pp-pl" id="pppl_' + k + '">' + planHTML(k) + '</div>' +
      '<p class="pp-tip" style="margin:4px 0 0">' + (only ? "연금·퇴직연금 계좌는 국내 상장 ETF만 담을 수 있음 (개별 주식·해외 상장 불가)" + (RET[k] ? " · 채권형·TDF 등은 「안전형」에 체크하면 안전자산 칸에서 깎음" : "") : "넣은 % 만큼 기본 포트를 원래 비율 그대로 줄여 합계 100%를 맞춤") + '</p>';
    return '<div class="pp-op">' + h2 + '</div>';
  }
  // 🎚 위험 정도 고르기 (주식·연금 폼) — 건네기 모드와 같은 값
  function tierUI(k){
    var f0 = form(k); if (!f0 || !f0.sim || !EQ[k]) return "";
    var o = opt(k), cur = o.tier || "normal", base = baseRisky(k);
    return '<div class="pp-ol"><span data-tip="' + e(JOY.tier) + '">🎚 위험 정도 ⓘ</span></div><div class="pp-md pp-tr">' + ["safe", "normal", "bold"].map(function(t){ var ok = tierOK(f0, t);
      return '<button type="button" data-tr="' + t + '" data-mk2="' + k + '"' + (cur === t ? ' class="on"' : '') + (ok ? '' : ' disabled') + '><b>' + TIER[t] + '</b><small>' + tierSub(k, t, base) + '</small></button>'; }).join("") + '</div>';
  }
  function baseRisky(k){ var f0 = form(k), o = ST.opt[k] || {}, al = f0.alloc; if (k === "gl_stock" && o.mode === "usd" && f0.alt && f0.alt.usd) al = f0.alt.usd.alloc; return riskyOf(al); }
  function tierSub(k, t, base){
    var f0 = form(k), T = f0 && f0.sim && f0.sim.tiers && f0.sim.tiers[t];
    if (t === "normal") return "위험자산 " + pc(base) + " · 오늘 기본폼";
    if (!f0.sim.tiers) return "준비 중";
    if (!T) return t === "bold" ? (f0.sim.tier_cap && base >= f0.sim.tier_cap ? "이미 법정 한도 " + f0.sim.tier_cap + "%" : "이미 위험자산 " + pc(base)) : "준비 중";
    return "위험자산 " + pc(T.risky);
  }
  // 지정 비중 → 기본 포트가 어떻게 줄어드는지 한눈에
  function planHTML(k){
    var f = baseX(k); if (!f) return "";
    var P = mustPlan(k, f); if (!P) return "";
    var all = P.all.filter(function(a){ return a.pct > 0; }), A = amtOf(k);
    return '<div class="pp-bar">' + all.map(function(a){ return '<i style="width:' + a.pct + '%;background:' + a.color + '"></i>'; }).join("") + '</div>' +
      '<div class="pp-pt">' + all.map(function(a){ return '<span><b style="color:' + a.color + '">●</b> ' + e(a.name.replace(/^⭐ /, "⭐")) + ' <b>' + pc(a.pct) + '</b>' + (a.k !== "must" && a.was !== a.pct ? ' <s>' + pc(a.was) + '</s>' : '') + '</span>'; }).join("") + '</div>' +
      '<div class="pp-ps">⭐ 지정 <b>' + pc(P.M) + '</b> + 기본 포트 <b>' + pc(r1(100 - P.M)) + '</b> = <b>100%</b>' + (A ? ' · 지정 금액 ' + man(A * P.M / 100) : '') + (RET[k] ? ' · 위험자산 ' + pc(P.risky) + ' / 한도 70%' : '') + '</div>' +
      (P.warn.length ? '<div class="pp-pw">⚠️ ' + P.warn.map(e).join(" · ") + '</div>' : '');
  }
  var sgT = null;
  function suggest(k, q){
    var box3 = document.getElementById("ppsg_" + k); if (!box3) return;
    if (!q || typeof opLoadIdx !== "function"){ box3.innerHTML = ""; box3._r = null; return; }
    clearTimeout(sgT); sgT = setTimeout(function(){
      opLoadIdx().then(function(){ var r = (typeof opSearch === "function" ? opSearch(q) : []).slice(0, 8), o = opt(k), krFirst = {pension: 1, dc: 1, irp: 1, kr_stock: 1}[k] || (k === "gl_stock" && o.mode !== "usd");
        if (krFirst) r = r.filter(function(x){ return x.mkt === "KR"; }).concat(r.filter(function(x){ return x.mkt !== "KR"; }));
        r = r.slice(0, 6);
        box3.innerHTML = r.map(function(x, i){ return '<button type="button" data-sk="' + k + '" data-si="' + i + '"><b>' + e(x.name) + '</b> <small>' + e(x.sym.replace(/\.(KS|KQ)$/, "")) + ' · ' + (MKT[x.mkt] || x.mkt) + (x.etf ? " · ETF" : "") + '</small></button>'; }).join("");
        box3._r = r;
      }).catch(function(){ box3.innerHTML = ""; });
    }, 180);
  }
  function addMust(k, m){
    var o = opt(k); if (!m || !m.name) return;
    if ({pension: 1, dc: 1, irp: 1}[k] && ((m.mkt && m.mkt !== "한국") || m.etf === false)) toast("연금·퇴직연금은 국내 상장 ETF만 담을 수 있어요 — 확인 후 쓰세요");
    if ((o.must || []).some(function(x){ return x.name === m.name && (x.code || "") === (m.code || ""); })){ toast("이미 넣은 종목이에요"); return; }
    var safe = RET[k] && /채권|국채|회사채|TDF|금리|단기|머니마켓|MMF|CD/i.test(m.name);
    o.must = (o.must || []).concat([{name: m.name, code: m.code || "", mkt: m.mkt || "", etf: !!m.etf, pct: 10, safe: safe, sym: m.sym || ""}]).slice(0, 20); keep(); resetBtns();
    ensureReasons().then(function(){ preview(); });
    var y = window.scrollY; draw(); window.scrollTo(0, y);
  }
  function pickR(r){ return {name: r.name, code: r.sym.replace(/\.(KS|KQ)$/, ""), mkt: MKT[r.mkt] || r.mkt, etf: r.etf, sym: r.sym}; }
  var pvT = null;
  function preview(){
    clearTimeout(pvT); pvT = setTimeout(function(){
      var box2 = document.getElementById("pppv"); if (!box2) return;
      if (!ST.sel.length){ box2.innerHTML = '<div class="mut" style="padding:18px;text-align:center">상품을 고르면 여기에 바로 보여요</div>'; box2.style.height = "auto"; return; }
      var m = model(), wd = box2.clientWidth || 340, sc = wd / 1080;
      box2.innerHTML = '<div class="pp-pv-in" style="transform:scale(' + sc + ');transform-origin:0 0;width:1080px">' + onePage(m) + '</div>';
      var inner = box2.firstChild; setTimeout(function(){ box2.style.height = Math.ceil(inner.getBoundingClientRect().height) + "px"; }, 30);
    }, 120);
  }
  function bind(){
    var w = document.getElementById("ppw");
    [].forEach.call(w.querySelectorAll(".pp-f"), function(b){ b.onclick = function(){ var k = b.dataset.k, i = ST.sel.indexOf(k); if (i >= 0) ST.sel.splice(i, 1); else { ST.sel.push(k); if (gOn() && !+ST.amt[k] && +GL.l) ST.amt[k] = +GL.l; } keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    // 🎯 목표에서 거꾸로 — 입력은 다시 그리지 않고 배지만 바꿈(입력 칸 초점 유지)
    [].forEach.call(w.querySelectorAll("[data-gk]"), function(inp){ inp.oninput = function(){ var v = inp.value.replace(/[^\d.]/g, ""); if (inp.value !== v) inp.value = v; GL[inp.dataset.gk] = v; gkeep(); gUpd();
      if (inp.dataset.gk === "y") [].forEach.call(w.querySelectorAll("[data-gy]"), function(x){ x.classList.toggle("on", +x.dataset.gy === +v); }); resetBtns(); preview(); }; });
    [].forEach.call(w.querySelectorAll("[data-gy]"), function(b){ b.onclick = function(){ GL.y = b.dataset.gy; gkeep(); var yi = w.querySelector('[data-gk="y"]'); if (yi) yi.value = GL.y;
      [].forEach.call(w.querySelectorAll("[data-gy]"), function(x){ x.classList.toggle("on", x === b); }); gUpd(); resetBtns(); preview(); }; });
    [].forEach.call(w.querySelectorAll("[data-gx]"), function(b){ b.onclick = function(){ GL = {}; gkeep(); resetBtns(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    var cu = document.getElementById("ppcust"), pb = document.getElementById("pppb"), og = document.getElementById("pporg");
    if (cu) cu.oninput = function(){ ST.cust = cu.value; preview(); };
    if (pb) pb.oninput = function(){ ME.pb = pb.value.trim(); keep(); preview(); };
    if (og) og.oninput = function(){ ME.org = og.value.trim(); keep(); preview(); };
    [["ppsimno", "simNo"], ["ppsimf", "simFrom"], ["ppsimt", "simTo"]].forEach(function(q){ var el = document.getElementById(q[0]); if (el) el.oninput = el.onchange = function(){ ME[q[1]] = el.value.trim(); ME.simVer = DISC_VER; keep(); simUp(); preview(); }; });
    var dc = document.getElementById("ppdcp"); if (dc) dc.onclick = function(){ var t = discText(), ok = function(){ dc.innerHTML = "✓ 복사했어요<small>붙여넣기 하면 됨</small>"; setTimeout(function(){ dc.innerHTML = "📋 문구 전체 복사<small>메일·메신저로 보낼 때</small>"; }, 2200); };
      try { navigator.clipboard.writeText(t).then(ok, fb); } catch(x) { fb(); }
      function fb(){ var ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch(y) {} ta.remove(); } };
    [].forEach.call(w.querySelectorAll("[data-ak]"), function(inp){ inp.oninput = function(){ var v = inp.value.replace(/[^\d]/g, ""); if (inp.value !== v) inp.value = v; ST.amt[inp.dataset.ak] = v ? +v : ""; keep(); upAmt(inp.dataset.ak); }; });
    [].forEach.call(w.querySelectorAll("[data-qk]"), function(b){ b.onclick = function(){ var k = b.dataset.qk; ST.amt[k] = +b.dataset.qv; keep(); var inp = w.querySelector('[data-ak="' + k + '"]'); if (inp) inp.value = ST.amt[k];
      [].forEach.call(b.parentNode.children, function(x){ x.classList.toggle("on", x === b); }); upAmt(k); }; });
    [].forEach.call(w.querySelectorAll("[data-mk]"), function(b){ b.onclick = function(){ make(b.dataset.mk, b); }; });
    var redraw = function(){ var y = window.scrollY; draw(); window.scrollTo(0, y); };
    [].forEach.call(w.querySelectorAll("[data-md]"), function(b){ b.onclick = function(){ opt(b.dataset.mk2).mode = b.dataset.md; keep(); resetBtns(); redraw(); }; });
    [].forEach.call(w.querySelectorAll("[data-tr]"), function(b){ b.onclick = function(){ if (b.disabled) return; opt(b.dataset.mk2).tier = b.dataset.tr; keep(); resetBtns(); redraw(); }; });
    var sh = document.getElementById("ppshow"); if (sh) sh.onclick = function(){ showOpen(); };
    [].forEach.call(w.querySelectorAll("[data-mx]"), function(b){ b.onclick = function(){ opt(b.dataset.mx).must.splice(+b.dataset.mi, 1); keep(); resetBtns(); redraw(); }; });
    var upPlan = function(k){ var pl = document.getElementById("pppl_" + k); if (pl) pl.innerHTML = planHTML(k); var A = amtOf(k);
      (opt(k).must || []).forEach(function(m, i){ var mw = document.getElementById("ppmw_" + k + "_" + i); if (mw) mw.textContent = A && +m.pct ? man(A * m.pct / 100) : ""; }); };
    [].forEach.call(w.querySelectorAll("[data-mp]"), function(inp){ inp.oninput = function(){ var v = inp.value.replace(/[^\d.]/g, ""); if (v !== inp.value) inp.value = v; opt(inp.dataset.mp).must[+inp.dataset.mi].pct = +v || 0; keep(); resetBtns(); upPlan(inp.dataset.mp); preview(); }; });
    [].forEach.call(w.querySelectorAll("[data-mf]"), function(cb){ cb.onchange = function(){ opt(cb.dataset.mf).must[+cb.dataset.mi].safe = cb.checked; keep(); resetBtns(); upPlan(cb.dataset.mf); preview(); }; });
    [].forEach.call(w.querySelectorAll("[data-ms]"), function(inp){ inp.oninput = function(){ suggest(inp.dataset.ms, inp.value.trim()); };
      inp.onkeydown = function(ev){ if (ev.key === "Enter"){ ev.preventDefault(); var b2 = w.querySelector('[data-ma="' + inp.dataset.ms + '"]'); if (b2) b2.click(); } }; });
    [].forEach.call(w.querySelectorAll("[data-ma]"), function(b){ b.onclick = function(){ var k = b.dataset.ma, inp = w.querySelector('[data-ms="' + k + '"]'), v = inp && inp.value.trim(); if (!v) return;
      var bx = document.getElementById("ppsg_" + k), r = bx && bx._r && bx._r[0];
      addMust(k, r ? pickR(r) : {name: v}); }; });
    [].forEach.call(w.querySelectorAll(".pp-sg"), function(bx){ bx.onclick = function(ev){ var t = ev.target.closest && ev.target.closest("[data-sk]"); if (!t || !bx._r) return; var r = bx._r[+t.dataset.si]; if (r) addMust(t.dataset.sk, pickR(r)); }; });
    var cp2 = document.getElementById("ppprc2"); if (cp2) cp2.onclick = function(){ var ok = function(){ cp2.textContent = "✓ 복사했어요"; setTimeout(function(){ cp2.textContent = "📋 문구 복사"; }, 2000); };
      try { navigator.clipboard.writeText(PDF_PROMPT).then(ok, function(){ fb(); }); } catch(x) { fb(); }
      function fb(){ var ta = document.createElement("textarea"); ta.value = PDF_PROMPT; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch(y) {} ta.remove(); } };
    var cp = document.getElementById("ppprc"); if (cp) cp.onclick = function(){ var t = PPT_PROMPT, ok = function(){ cp.textContent = "✓ 복사했어요"; setTimeout(function(){ cp.textContent = "📋 문구 복사"; }, 2000); };
      try { navigator.clipboard.writeText(t).then(ok, function(){ fallback(); }); } catch(x) { fallback(); }
      function fallback(){ var ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch(y) {} ta.remove(); } };
  }
  function upAmt(k){ try { var pl = document.getElementById("pppl_" + k); if (pl) pl.innerHTML = planHTML(k); (opt(k).must || []).forEach(function(m, i){ var mw = document.getElementById("ppmw_" + k + "_" + i); if (mw) mw.textContent = amtOf(k) && +m.pct ? man(amtOf(k) * m.pct / 100) : ""; }); } catch(x) {}
    var s = document.getElementById("ppw_" + k); if (s) s.textContent = ST.amt[k] ? man(ST.amt[k] * 10000) : ""; var t = document.getElementById("pptot"); if (t) t.textContent = total() ? man(total()) : "–"; preview(); }
  var BTNL = {disc: "📝 심의 요청서 PDF <small>준법감시 부서 제출용</small>", png: "📱 한 장 <small>카톡 전송용 그림</small>", pdf: "📄 풀버전 PDF <small>표지·시장·상품별 자세히 · 가장 안 깨짐</small>",
    ppt: "📊 PPT (고칠 수 있는 판) <small>맑은 고딕 · 글·표·차트를 PPT에서 직접 수정</small>", pptimg: "🖼️ PPT (안 깨지는 그림판) <small>PDF 그대로 한 쪽 = 한 장 · 어디서 열어도 똑같음</small>"};
  // 10/28 사용자 「PPT는 깨지더라 — 왜 깨지는지 설명 · 다른 AI 도구로 어떻게 고치면 좋은지 문구도」
  var PPT_PROMPT = "첨부한 PPT는 고객에게 줄 투자 제안서입니다. 숫자·상품명·비중·금액은 절대 바꾸지 말고 디자인만 다듬어 주세요.\n" +
    "1) 모든 글꼴을 맑은 고딕으로 통일하고, 글이 상자 밖으로 넘치면 글자 크기를 줄이거나 상자를 키워 주세요.\n" +
    "2) 표는 칸 너비를 내용에 맞게 다시 맞추고, 머리줄은 남색(#14304F) 바탕에 흰 글씨로 해 주세요.\n" +
    "3) 차트는 깨지거나 겹친 것을 바로잡고, 범례·축 글씨는 9pt 이상으로 해 주세요.\n" +
    "4) 슬라이드마다 여백을 고르게 맞추고, 문장 끝은 「~임」체를 그대로 두세요.\n" +
    "5) 결과는 같은 내용의 .pptx 파일로 주세요.";
  function pptHelp(){
    return '<details class="pp-help no-clp" data-xc="1" data-cz="done"><summary>ⓘ PPT가 깨져 보일 때 — 이유 · 다른 AI로 고치는 법</summary>' +
      '<div class="pp-hb no-clp" data-xc="1" data-cz="done"><b>왜 깨지나</b><ul>' +
      '<li><b>휴대폰 미리보기</b>(아이폰 파일·카톡 뷰어)는 PPT를 다 못 그림 — 차트·표 위치가 틀어져 보여도 PC 파워포인트에선 정상인 경우가 많음</li>' +
      '<li><b>글꼴</b>: 맑은 고딕은 윈도우 글꼴이라 아이폰·맥엔 없음 → 다른 글꼴로 바뀌며 글자 폭이 달라져 줄이 넘침</li>' +
      '<li><b>상자 크기가 고정</b>: PDF는 내용 높이를 재서 맞추지만 PPT는 칸이 정해져 있어 글이 길면 밖으로 넘침</li>' +
      '<li><b>진짜 차트</b>로 넣어서 고칠 수 있는 대신, 프로그램마다 차트를 그리는 방식이 달라 모양이 조금씩 다름</li></ul>' +
      '<b>이렇게 쓰면 안전함</b><ul><li>고객에게 보낼 땐 <b>📄 PDF</b> 또는 <b>🖼️ 그림판 PPT</b> (어디서 열어도 똑같음)</li><li>숫자·문구를 고쳐야 할 땐 <b>📊 고칠 수 있는 판</b>을 PC 파워포인트에서 열기</li></ul>' +
      '<b>다른 AI 도구로 다듬기</b><ul>' +
      '<li><b>파워포인트 Copilot</b>: 파일 열고 Copilot 창에 아래 문구 붙여넣기 · 「디자이너」로 슬라이드별 디자인 고르기</li>' +
      '<li><b>Gamma · Canva</b>: PPT 가져오기(Import) → 테마만 바꾸기 → 다시 PPT·PDF로 내보내기</li>' +
      '<li><b>ChatGPT · Claude</b>: PPT 파일을 올리고 아래 문구 붙여넣기</li></ul>' +
      '<div class="pp-pr"><pre id="pppr">' + e(PPT_PROMPT) + '</pre><button type="button" id="ppprc">📋 문구 복사</button></div>' +
      '<p class="mut" style="margin:6px 0 0">⚠️ AI가 숫자를 바꾸는 일이 있으니 다듬은 뒤 금액·비중·금리는 꼭 한 번 대조할 것</p></div></details>';
  }
  // 10/29 사용자 「PDF를 PPT로 변환해서 쓰는 방법에 대한 탭」
  var PDF_PROMPT = "첨부한 PDF는 고객에게 줄 투자 제안서입니다. 쪽마다 16:9 슬라이드 한 장으로 옮겨 .pptx 파일로 만들어 주세요.\n" +
    "1) 숫자·상품명·비중·금액·날짜는 한 글자도 바꾸지 마세요.\n" +
    "2) 쪽 전체가 그림이면 글자를 읽어서(OCR) 고칠 수 있는 글 상자로 넣어 주세요.\n" +
    "3) 표는 PPT 표로, 막대·도넛·선 그래프는 PPT 차트로 다시 만들어 주세요.\n" +
    "4) 글꼴은 전부 맑은 고딕, 머리줄은 남색(#14304F) 바탕에 흰 글씨로 해 주세요.\n" +
    "5) 문장 끝 「~임」체는 그대로 두고, 슬라이드마다 여백을 고르게 맞춰 주세요.";
  function pdfHelp(){
    return '<details class="pp-help no-clp" data-xc="1" data-cz="done"><summary>ⓘ PDF를 PPT로 바꿔 쓰는 법</summary>' +
      '<div class="pp-hb no-clp" data-xc="1" data-cz="done"><b>먼저 알아 둘 점</b><ul>' +
      '<li>이 앱의 PDF는 <b>쪽마다 그림</b>으로 만들어짐 — 그래서 어디서 열어도 똑같이 보이지만, 변환기에 넣으면 글자가 아닌 <b>그림 슬라이드</b>로 바뀌는 경우가 많음</li>' +
      '<li>글자·숫자를 고치려면 변환기에서 <b>OCR(글자 인식)</b>을 켜야 함 — 아니면 처음부터 <b>📊 PPT (고칠 수 있는 판)</b>을 받는 것이 가장 빠름</li>' +
      '<li>보기만 하면 되면 <b>🖼️ 그림판 PPT</b>가 이미 PDF와 똑같은 PPT임</li></ul>' +
      '<b>방법 ① 무료 변환 사이트</b><ul>' +
      '<li><b>Adobe Acrobat 온라인</b> (acrobat.adobe.com → 「PDF를 PPT로」) — 글자 인식이 가장 정확한 편 · 무료는 횟수 제한</li>' +
      '<li><b>iLovePDF · Smallpdf</b> (「PDF to PowerPoint」) — 무료 · 그림 PDF는 「OCR」 선택 필요</li>' +
      '<li><b>알PDF</b>(PC 프로그램) — 「변환 → PPT」 · 한글 인식이 무난함</li></ul>' +
      '<b>방법 ② 파워포인트에서 바로</b><ul>' +
      '<li>PC 파워포인트에서 <b>「삽입 → 그림」</b>으로 쪽 그림을 넣어 그 위에 글 상자를 덧씌움 — 표지·한 장 요약만 고칠 때 편함</li>' +
      '<li>워드(Word)로 PDF를 열면 글자로 바뀜 → 필요한 글만 복사해 PPT에 붙여넣기</li></ul>' +
      '<b>방법 ③ AI 도구</b><ul>' +
      '<li><b>Gamma</b> — 「가져오기(Import) → PDF」 하면 슬라이드로 다시 짜 줌 → PPTX로 내보내기</li>' +
      '<li><b>Canva</b> — PDF를 올리면 편집 가능한 디자인으로 열림 → 「공유 → 다운로드 → PPTX」</li>' +
      '<li><b>ChatGPT · Claude</b> — PDF를 올리고 아래 문구를 붙여넣으면 .pptx 파일로 만들어 줌</li>' +
      '<li><b>파워포인트 Copilot</b> — 「파일에서 프레젠테이션 만들기」 (회사 계정에서 쓸 수 있을 때)</li></ul>' +
      '<div class="pp-pr"><pre>' + e(PDF_PROMPT) + '</pre><button type="button" id="ppprc2">📋 문구 복사</button></div>' +
      '<p class="mut" style="margin:6px 0 0">⚠️ 고객 이름·금액이 든 파일을 외부 사이트에 올릴 땐 회사 보안 규정을 먼저 확인 · 변환 뒤 숫자는 원본 PDF와 꼭 한 번 대조</p></div></details>';
  }
  var READY = {};
  function make(kind, btn){
    if (!ST.sel.length && kind !== "disc"){ toast("상품을 먼저 골라 주세요"); return; }
    var m = model(), sig = JSON.stringify([kind, ST.sel, ST.amt, ST.opt, ST.cust, ME.pb, ME.org, ME.simNo, ME.simFrom, ME.simTo, DATA.at]);
    if (READY[kind] && READY[kind].sig === sig){ var R = READY[kind]; shareBlob(R.blob, R.name, R.mime); return; }   // 두 번째 누름 = 저장·공유 (아이폰은 누른 순간에만 공유창이 열림)
    if (ST.busy) return; ST.busy = true;
    var st = document.getElementById("ppst"), old = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = "⏳ 만드는 중…<small>몇 초 걸려요</small>"; if (st) st.textContent = "";
    var p = kind === "disc" ? makePdf(allModel(), reviewPages()) : ensureReasons().then(function(){ m = model(); return kind === "png" ? makePng(m) : kind === "pdf" ? makePdf(m) : kind === "pptimg" ? makePptImg(m) : makePpt(m); });
    var mime = kind === "png" ? "image/png" : kind === "pdf" || kind === "disc" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    p.then(function(blob){
      var name = kind === "disc" ? ("심의요청_제안서위험고지_" + DISC_VER + (ME.pb ? "_" + ME.pb : "")).replace(/[\\/:*?"<>|\s·]+/g, "_") + ".pdf" : kind === "pptimg" ? fname(m, "pptx").replace(/\.pptx$/, "_그림판.pptx") : fname(m, kind === "png" ? "png" : kind === "pdf" ? "pdf" : "pptx");
      READY[kind] = {sig: sig, blob: blob, name: name, mime: mime};
      btn.disabled = false; btn.classList.add("ready");
      btn.innerHTML = "⬇️ " + (kind === "png" ? "한 장" : kind === "disc" ? "심의 요청서" : kind === "pdf" ? "PDF" : kind === "pptimg" ? "그림판 PPT" : "PPT") + " 저장·보내기<small>" + e(name) + " · " + Math.max(1, Math.round(blob.size / 1024)) + "KB</small>";
      if (st) st.textContent = "✓ 다 만들었어요 — 버튼을 한 번 더 누르면 저장·공유 창이 떠요";
      try { if (window.ntfyUse) ntfyUse("propose_" + kind); } catch(x) {}
    }).catch(function(err){ btn.disabled = false; btn.innerHTML = old; if (st) st.textContent = "만들지 못했어요 · " + String((err && (err.message || err)) || "").slice(0, 80); try { console.error(err); } catch(x) {} })
      .then(function(){ ST.busy = false; });
  }
  // 상품·금액·이름이 바뀌면 다 만든 버튼은 다시 「만들기」로
  document.addEventListener("input", function(ev){ if (ev.target && ev.target.closest && ev.target.closest("#ppw")) resetBtns(); });
  document.addEventListener("click", function(ev){ if (ev.target && ev.target.closest && ev.target.closest("#ppw .pp-q button, #ppw .pp-f")) resetBtns(); }, true);
  function resetBtns(){ READY = {}; [].forEach.call(document.querySelectorAll("#ppw [data-mk].ready"), function(b){ b.classList.remove("ready");
    b.innerHTML = BTNL[b.dataset.mk]; }); var st = document.getElementById("ppst"); if (st) st.textContent = ""; }

  /* ───────── 📲 고객에게 보여 주기 (10/29 A10/29-1 「건네기 모드」) ─────────
     상담 자리에서 PB 폰을 고객에게 돌려 보여 주는 화면 — 큰 글씨 카드를 좌우로 넘김.
     고객이 직접 금액 칩·위험 정도(안전·보통·적극)를 누르면 모든 카드 숫자가 그 자리에서 바뀜(proposal.json 에 미리 계산해 둔 값 · 휴대폰 계산 없음).
     PB 전용 화면(확률·내 포트·채널)과 아래 탭은 덮어 가림 · 나가기는 ✕ 를 두 번 · 고객 이름은 화면에만(링크·서버에 안 실음). */
  var PX = {k: null, i: 0};
  function showOpen(){
    if (!DATA){ toast("기본폼을 아직 못 받았어요"); return; }
    if (!ST.sel.length){ toast("상품을 먼저 골라 주세요"); return; }
    PX.k = ST.sel.indexOf(PX.k) >= 0 ? PX.k : ST.sel[0]; PX.i = 0;
    ST.sel.forEach(function(k){ if (!+ST.amt[k]) ST.amt[k] = 10000; });   // 금액이 비었으면 1억으로 시작(고객이 칩으로 바꿈)
    keep();
    var x = document.getElementById("ppx"); if (x) x.remove();
    x = document.createElement("div"); x.id = "ppx"; x.setAttribute("role", "dialog"); x.setAttribute("aria-label", "고객에게 보여 주기");
    document.body.appendChild(x); document.documentElement.classList.add("ppx-on");
    showDraw(true);
    try { if (window.ntfyUse) ntfyUse("propose_show"); } catch(z) {}
  }
  function showClose(){ var x = document.getElementById("ppx"); if (x) x.remove(); document.documentElement.classList.remove("ppx-on");
    try { var y = window.scrollY; draw(); window.scrollTo(0, y); } catch(z) {} }
  function won(v){ return man(Math.round(v / 10000) * 10000); }
  function signWon(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + man(Math.abs(v)); }
  function slide(title, body, sub){ return '<section class="px-s"><div class="px-in">' + (title ? '<h2>' + title + '</h2>' : '') + (sub ? '<p class="px-sub">' + sub + '</p>' : '') + body + '</div></section>'; }
  function barRow(lab, sub, val, frac, color, right){
    return '<div class="px-br"><div class="px-bl"><b>' + lab + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><div class="px-bv"><b>' + val + '</b>' + (right ? '<small>' + right + '</small>' : '') + '</div>' +
      '<div class="px-bb"><i style="width:' + Math.max(2, Math.min(100, frac * 100)).toFixed(1) + '%;background:' + color + '"></i></div></div>';
  }
  function slidesEq(f, A){
    var S = f.sim, out = [], al = f.alloc.filter(function(a){ return a.pct > 0; }).sort(function(a, b){ return b.pct - a.pct; });
    var fromY = S.bt.from.slice(0, 4);
    // ② 어디에 얼마
    out.push(slide("어디에 얼마 담나", '<div class="px-dn"><div class="px-dw"><img alt="" src="' + svgUrl(donutSvg(al, 240, 40)) + '"><div class="px-dc"><small>제안 금액</small><b>' + man(A) + '</b></div></div></div>' +
      al.map(function(a){ return barRow('<i class="px-dot" style="background:' + a.color + '"></i>' + e(a.name.replace(/^⭐ /, "⭐")), e((a.inst || "").split(" · ")[0]), won(A * a.pct / 100), a.pct / al[0].pct, a.color, pc(a.pct)); }).join("") +
      '<p class="px-note">위험자산 ' + pc(riskyOf(al)) + ' · 안전자산 ' + pc(r1(100 - riskyOf(al))) + '</p>'));
    // ③ 실제로 담기는 회사 (ETF 속) — 없으면 나라·자산별
    if (S.look && S.look.top && S.look.top.length){
      var top = S.look.top.slice(0, 5);
      out.push(slide("이 돈이 실제로 들어가는 회사", top.map(function(r){ return barRow(e(r.n), e(r.sec), won(A * r.w / 100), r.w / top[0].w, "#2f6fdf", pc(r.w)); }).join("") +
        '<p class="px-note">ETF 속을 열어 보면 ' + S.look.n + '개 회사에 나눠 담김 · 구성표 ' + e(S.look.asof || "") + ' × 제안 비중</p>'));
    } else if (S.region && S.region.length){
      out.push(slide("어느 쪽에 나눠 담나", S.region.map(function(r){ return barRow(e(r[0]), "", won(A * r[1] / 100), r[1] / S.region[0][1], "#2f6fdf", pc(r[1])); }).join("")));
    }
    // ④ 위기 때는
    var cr = (S.stress || []).filter(function(r){ return /2008|2020|2022/.test(r.name) && r["이 제안"]; });
    if (cr.length){
      var worst = cr.reduce(function(m, r){ return r["이 제안"].mdd < m ? r["이 제안"].mdd : m; }, 0);
      out.push(slide("크게 빠졌던 때라면", '<div class="px-big dn">' + signWon(A * worst / 100) + '</div><p class="px-cap">가장 나빴던 때 잠깐 줄어든 돈 (' + man(A) + ' 기준)</p>' +
        cr.map(function(r){ var me = r["이 제안"], k1 = r["코스피만"], s1 = r["S&P500만"];
          return '<div class="px-cr"><b>' + e(r.name) + '</b><div class="px-crv"><span class="dn">' + signWon(A * me.mdd / 100) + '</span><small>' + sgn(me.mdd, 1) + (me.rec != null ? " · " + (me.rec ? me.rec + "개월 뒤 회복" : "바로 회복") : " · 아직 회복 전") + '</small></div>' +
            '<small class="px-crc">같은 때 ' + [k1 ? "코스피만 " + sgn(k1.mdd, 1) : "", s1 ? "S&P500만 " + sgn(s1.mdd, 1) : ""].filter(Boolean).join(" · ") + '</small></div>'; }).join(""),
        "같은 비중을 그때 들고 있었다면"));
    }
    // ⑤ 들고 있으면
    var Q = eqCalc(S, A), b = S.bt;
    out.push(slide("들고 있으면 어땠나", '<div class="px-pos"><b>' + b.y1.pos + '%</b><span>' + fromY + '년부터 아무 날에 사서 1년 들고 있었을 때 이익 난 비율</span></div>' +
      '<div class="px-3">' + Q.y1.map(function(x, i){ return '<div class="' + ["dn", "", "up"][i] + '"><small>' + x.l.replace(/ \(.*\)/, "") + '</small><b>' + won(x.won) + '</b><em>' + sgn(x.r, 1) + '</em></div>'; }).join("") + '</div>' +
      (Q.y5 ? '<p class="px-cap" style="margin-top:18px">5년 들고 있었다면 (연평균)</p><div class="px-3">' + Q.y5.map(function(x, i){ return '<div class="' + ["dn", "", "up"][i] + '"><small>' + x.l + '</small><b>' + won(x.won) + '</b><em>연 ' + sgn(x.r, 1) + '</em></div>'; }).join("") + '</div>' +
        '<p class="px-note">5년 들고 있었을 때 이익 난 비율 ' + (b.y5.pos) + '% · 연평균 ' + b.cagr + '% (' + fromY + '~지금)</p>' : ''),
      "1년 뒤 " + man(A) + "이"));
    return out;
  }
  function slidesBond(f, A){
    var S = f.sim, B = bondCalc(S, A), out = [], al = f.alloc.filter(function(a){ return a.pct > 0; });
    out.push(slide("어디에 얼마 담나", '<div class="px-dn"><div class="px-dw"><img alt="" src="' + svgUrl(donutSvg(al, 240, 40)) + '"><div class="px-dc"><small>제안 금액</small><b>' + man(A) + '</b></div></div></div>' +
      B.rows.map(function(r, i){ var c = (al[i] || {}).color || "#1f9fb5"; return barRow('<i class="px-dot" style="background:' + c + '"></i>' + e(r.p.slot || r.p.name), e(r.p.name) + " · " + r.p.yrs.toFixed(1) + "년", won(r.a), r.p.pct / 100, c, pc(r.p.pct)); }).join("")));
    out.push(slide("만기까지 들고 가면", '<div class="px-big up">' + man(B.tot) + '</div><p class="px-cap">' + (S.cur === "KRW" ? "세후로 돌려받는 돈" : "돌려받는 돈 (환율이 지금 그대로라면)") + '</p>' +
      '<div class="px-3"><div class="up"><small>이익</small><b>' + signWon(B.pnl) + '</b></div><div><small>연으로 치면</small><b>' + B.cagr.toFixed(1) + '%</b></div><div><small>평균 기간</small><b>' + B.yrs.toFixed(1) + '년</b></div></div>' +
      (B.years.length && B.years[0].v ? '<p class="px-note">해마다 들어오는 이자 약 ' + won(B.years[0].v) + ' (세후)</p>' : '') +
      (B.be != null ? '<p class="px-note">환율이 지금보다 ' + Math.abs(B.be).toFixed(0) + '% 넘게 떨어지지 않으면 이익</p>' : '')));
    var rs = B.rateScen || [], fx = B.fxScen || [];
    if (rs.length || fx.length){
      var mx = Math.max.apply(null, rs.concat(fx).map(function(x){ return Math.abs(x.pnl); }).concat([1]));
      out.push(slide("금리·환율이 움직이면", (rs.length ? '<p class="px-cap">1년 뒤 손익 · 금리가 이만큼 움직이면</p>' + rs.map(function(x){ return barRow((x.d > 0 ? "+" : x.d < 0 ? "−" : "") + Math.abs(x.d) + "%p", x.d ? (x.d > 0 ? "금리 오름" : "금리 내림") : "그대로", signWon(x.pnl), Math.abs(x.pnl) / mx, x.pnl >= 0 ? UP : DN, sgn(x.pct, 1)); }).join("") : '') +
        (fx.length ? '<p class="px-cap" style="margin-top:16px">만기 때 환율이 이만큼 움직이면</p>' + fx.map(function(x){ return barRow((x.m > 0 ? "+" : x.m < 0 ? "−" : "") + Math.abs(x.m) + "%", "", signWon(x.pnl), Math.abs(x.pnl) / mx, x.pnl >= 0 ? UP : DN, sgn(x.pct, 1)); }).join("") : '')));
    }
    return out;
  }
  function slidesEls(f, A){
    var E = elsCalc(f.sim, A), out = [], al = f.alloc.filter(function(a){ return a.pct > 0; });
    out.push(slide("어디에 얼마 담나", '<div class="px-dn"><div class="px-dw"><img alt="" src="' + svgUrl(donutSvg(al, 240, 40)) + '"><div class="px-dc"><small>제안 금액</small><b>' + man(A) + '</b></div></div></div>' +
      al.map(function(a){ return barRow('<i class="px-dot" style="background:' + a.color + '"></i>' + e(a.name), e((a.inst || "").slice(0, 34)), won(A * a.pct / 100), a.pct / 100, a.color, pc(a.pct)); }).join("")));
    out.push(slide("과거엔 어떻게 끝났나", E.map(function(x){ var p = x.p, h = p.hist || {};
      return '<div class="px-cr"><b>' + e(p.name || "") + '</b><small class="px-crc">' + (p.pp ? "원금지급형" : "연 " + p.cpn + "% · KI " + (p.ki || "없음")) + (p.ua ? " · " + e(p.ua) : "") + ' · ' + won(x.a) + '</small>' +
        '<div class="px-3" style="margin-top:8px"><div class="up"><small>1년 안에 끝남</small><b>' + (x.y1 != null ? Math.round(x.y1) + "%" : "–") + '</b></div><div class="dn"><small>손실로 끝남</small><b>' + (p.pp ? "0%" : (h.loss || 0) + "%") + '</b></div><div><small>평균 받은 돈</small><b>' + won(x.ev) + '</b></div></div></div>'; }).join(""),
      "같은 조건으로 " + String(((E[0] || {}).p || {}).hist && E[0].p.hist.from || "2006").slice(0, 4) + "년부터 매일 가입했다면"));
    return out;
  }
  function showDraw(first){
    var x = document.getElementById("ppx"); if (!x) return;
    var k = PX.k, f = formX(k), A = amtOf(k); if (!f){ showClose(); return; }
    var S = f.sim || {}, kind = S.kind, f0 = form(k), o = opt(k), cur = o.tier || "normal";
    var cover = '<section class="px-s"><div class="px-in px-cv" style="--fc:' + f.color + '"><p class="px-for">' + e(ST.cust ? ST.cust.trim() + " 고객님을 위한" : "고객님을 위한") + '</p><h1>' + e(f.icon) + ' ' + e(f.title) + '</h1>' +
      '<div class="px-amt">' + man(A) + '</div>' + (EQ[k] && cur !== "normal" ? '<div class="px-tg">' + TIER[cur] + ' 단계</div>' : '') +
      (function(){ var gl = gLine(f); return gl ? '<p class="px-goal">' + e(gl) + '</p>' : ''; })() +
      '<p class="px-hl">' + e(String(f.headline || "").replace(/ 제안임$/, "")) + '</p>' + (f.fit ? '<p class="px-fit">이런 분께 · ' + e(f.fit) + '</p>' : '') +
      '<p class="px-sw">옆으로 넘겨 보세요 →</p></div></section>';
    var body = kind === "equity" ? slidesEq(f, A) : kind === "bond" ? slidesBond(f, A) : kind === "els" ? slidesEls(f, A) : [];
    var link = '<section class="px-s"><div class="px-in"><h2>이 안으로 정리하면</h2>' +
      (function(){ var L = simLine(f, A); return L ? '<div class="px-big">' + e(L.big) + '</div><p class="px-cap">' + e(L.lab) + '</p><p class="px-note">' + e(L.sub) + '</p>' : ''; })() +
      '<div class="px-go"><button type="button" data-mk="png" class="main">📨 이 안 카톡으로 받기<small>한 장 그림으로 만들어 보내 드림</small></button>' +
      '<button type="button" id="pxlink">🔗 동료 PB에게 이 세팅 보내기<small>고른 상품·금액·위험 정도·추천 종목만 · 고객 이름은 안 담김</small></button></div></div></section>';
    var slides = [cover].concat(body).concat([link]);
    var n = slides.length; PX.i = Math.min(PX.i, n - 1);
    var chips = ST.sel.length > 1 ? '<div class="px-fs">' + ST.sel.map(function(q){ var g = form(q); return g ? '<button type="button" data-pf="' + q + '"' + (q === k ? ' class="on"' : '') + ' style="--fc:' + g.color + '">' + e(g.icon) + ' ' + e(g.short) + '</button>' : ''; }).join("") + '</div>' : '';
    var tiers = EQ[k] && f0.sim ? '<div class="px-seg">' + ["safe", "normal", "bold"].map(function(t){ return '<button type="button" data-pt="' + t + '"' + (cur === t ? ' class="on"' : '') + (tierOK(f0, t) ? '' : ' disabled') + '>' + TIER[t] + '</button>'; }).join("") + '</div>' : '';
    var amts = '<div class="px-am">' + AMTS.map(function(a){ return '<button type="button" data-pa="' + a[0] + '"' + (+ST.amt[k] === a[0] ? ' class="on"' : '') + '>' + a[1] + '</button>'; }).join("") + '</div>';
    x.innerHTML = '<div class="px-top">' + chips + '<button type="button" class="px-x" id="pxx" aria-label="닫기">✕</button></div>' +
      '<div class="px-ctl">' + amts + tiers + '</div>' +
      '<div class="px-rail" id="pxr">' + slides.join("") + '</div>' +
      '<div class="px-ft"><div class="px-dots">' + slides.map(function(_, i){ return '<i' + (i === PX.i ? ' class="on"' : '') + '></i>'; }).join("") + '</div>' +
      '<p>' + (kind === "equity" ? "과거 계산 · 미래 보장 아님 · 배당·수수료·세금 전" : kind === "bond" ? "지금 금리 기준 계산 · 중도 매도 땐 값이 달라짐" : "과거 계산 · 미래 보장 아님 · 원금 손실 가능") + '</p></div>';
    var rail = document.getElementById("pxr");
    rail.scrollLeft = PX.i * rail.clientWidth;
    var dots = x.querySelectorAll(".px-dots i"), tm = null;
    rail.addEventListener("scroll", function(){ clearTimeout(tm); tm = setTimeout(function(){ var i = Math.round(rail.scrollLeft / (rail.clientWidth || 1)); if (i !== PX.i){ PX.i = i; [].forEach.call(dots, function(d, j){ d.classList.toggle("on", j === i); }); } }, 60); }, {passive: true});
    [].forEach.call(dots, function(d, j){ d.onclick = function(){ rail.scrollTo({left: j * rail.clientWidth, behavior: "smooth"}); }; });
    // 나가기는 두 번 (고객이 실수로 닫지 않게)
    var xb = document.getElementById("pxx"), armed = 0;
    xb.onclick = function(){ if (Date.now() - armed < 1800){ showClose(); return; } armed = Date.now(); xb.textContent = "한 번 더"; xb.classList.add("arm"); setTimeout(function(){ if (xb.isConnected){ xb.textContent = "✕"; xb.classList.remove("arm"); } }, 1800); };
    [].forEach.call(x.querySelectorAll("[data-pf]"), function(b){ b.onclick = function(){ PX.k = b.dataset.pf; PX.i = 0; showDraw(); }; });
    [].forEach.call(x.querySelectorAll("[data-pa]"), function(b){ b.onclick = function(){ ST.amt[k] = +b.dataset.pa; keep(); resetBtns(); showDraw(); }; });
    [].forEach.call(x.querySelectorAll("[data-pt]"), function(b){ b.onclick = function(){ if (b.disabled) return; opt(k).tier = b.dataset.pt; keep(); resetBtns(); showDraw(); }; });
    [].forEach.call(x.querySelectorAll("[data-mk]"), function(b){ b.onclick = function(){ make(b.dataset.mk, b); }; });
    var lk = document.getElementById("pxlink"); if (lk) lk.onclick = function(){ shareSetting(lk); };
  }
  document.addEventListener("keydown", function(ev){ if (ev.key === "Escape" && document.getElementById("ppx")) showClose(); });

  /* 🔗 세팅 링크 — 고른 폼·금액·원화/환전·위험 정도·⭐ 추천 종목만 (고객 이름·제안자·소속은 안 담음) */
  function b64e(str){ return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64d(str){ str = str.replace(/-/g, "+").replace(/_/g, "/"); while (str.length % 4) str += "="; return decodeURIComponent(escape(atob(str))); }
  function settingCode(){
    var o = {v: 1, s: ST.sel.slice(), a: {}, o: {}};
    ST.sel.forEach(function(k){ if (+ST.amt[k]) o.a[k] = +ST.amt[k]; var q = ST.opt[k]; if (!q) return; var y = {};
      if (q.mode && q.mode !== "krw") y.m = q.mode; if (q.tier && q.tier !== "normal") y.t = q.tier;
      if (q.must && q.must.length) y.u = q.must.map(function(m){ var z = {n: m.name, p: +m.pct || 0}; if (m.code) z.c = m.code; if (m.mkt) z.k = m.mkt; if (m.sym) z.y = m.sym; if (m.etf) z.e = 1; if (m.safe) z.f = 1; return z; });
      if (Object.keys(y).length) o.o[k] = y; });
    return b64e(JSON.stringify(o));
  }
  function shareSetting(btn){
    var url = location.origin + location.pathname + "#prop~" + settingCode(), names = ST.sel.map(function(k){ var f = form(k); return f ? f.short : k; }).join(" · ");
    var text = "📝 제안서 세팅 — " + names + "\n열면 같은 상품·금액·위험 정도로 바로 만들 수 있어요 (이름·소속은 각자 것으로)";
    var done = function(m){ btn.innerHTML = m + '<small>고객 이름은 안 담겼어요</small>'; };
    if (navigator.share){ navigator.share({title: "제안서 세팅", text: text, url: url}).then(function(){ done("✓ 보냈어요"); }).catch(function(){}); return; }
    try { navigator.clipboard.writeText(text + "\n" + url).then(function(){ done("✓ 링크를 복사했어요"); }, function(){ prompt("이 링크를 복사해 보내세요", url); }); } catch(z) { prompt("이 링크를 복사해 보내세요", url); }
  }
  function takeSetting(){
    var m = /^#prop~([A-Za-z0-9_-]{4,4000})$/.exec(location.hash || ""); if (!m || !DATA) return;
    try { history.replaceState(history.state, "", location.pathname + location.search + "#prop"); } catch(z) {}
    var o; try { o = JSON.parse(b64d(m[1])); } catch(z) { toast("세팅 링크를 읽지 못했어요"); return; }
    if (!o || o.v !== 1 || !Array.isArray(o.s)) return;
    var ok = function(k){ return typeof k === "string" && !!form(k); }, str = function(v, n){ return String(v == null ? "" : v).slice(0, n || 40); };
    var sel = o.s.filter(ok).slice(0, 9); if (!sel.length) return;
    ST.sel = sel; ST.amt = {}; ST.opt = {};
    sel.forEach(function(k){ var a = +((o.a || {})[k]); if (a > 0 && a < 1e7) ST.amt[k] = Math.round(a);
      var y = (o.o || {})[k] || {}, q = {mode: y.m === "usd" ? "usd" : "krw", must: []};
      if (y.t === "safe" || y.t === "bold") q.tier = y.t;
      (Array.isArray(y.u) ? y.u : []).slice(0, 20).forEach(function(z){ if (!z || !z.n) return; var mm = {name: str(z.n), pct: Math.max(0, Math.min(100, +z.p || 0))};
        if (z.c) mm.code = str(z.c, 16); if (z.k) mm.mkt = str(z.k, 8); if (z.y) mm.sym = str(z.y, 20); if (z.e) mm.etf = true; if (z.f) mm.safe = true; q.must.push(mm); });
      ST.opt[k] = q; });
    ST.cust = ""; keep();
    toast("동료가 보낸 제안서 세팅을 불러왔어요 — 이름·소속은 내 것으로");
  }

  // 시험·다른 화면에서 쓰도록
  window.PROPOSE = {load: load, _tierAlloc: function(al, t, cap, cdT){ return tierAlloc(al, t, cap, cdT); }, _code: function(){ return settingCode(); }, show: function(){ showOpen(); }, model: function(){ return model(); }, set: function(o){ if (o.sel) ST.sel = o.sel; if (o.amt) ST.amt = o.amt; if (o.cust != null) ST.cust = o.cust; if (o.pb != null) ME.pb = o.pb; if (o.org != null) ME.org = o.org; if (o.sim != null){ ME.simNo = o.sim; ME.simVer = DISC_VER; } if (o.simTo != null) ME.simTo = o.simTo; if (o.simFrom != null) ME.simFrom = o.simFrom; if (o.opt) ST.opt = o.opt; },
    review: function(){ return makePdf(allModel(), reviewPages()); }, discText: function(){ return discText(); }, simState: function(){ return simState(); },
    png: function(){ return ensureReasons().then(function(){ return makePng(model()); }); }, pdf: function(){ return ensureReasons().then(function(){ return makePdf(model()); }); },
    ppt: function(){ return ensureReasons().then(function(){ return makePpt(model()); }); }, pptimg: function(){ return ensureReasons().then(function(){ return makePptImg(model()); }); }, reasons: function(){ return ensureReasons().then(function(){ return RS; }); }, onePage: function(){ return onePage(model()); }, pages: function(){ return fullPages(model()); }};

  var css = document.createElement("style");
  css.textContent =
    ".pp-reg{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:2px 0 8px}.pp-reg span{font-size:12.5px;padding:3px 9px;border-radius:99px;border:1px solid var(--line)}" +
    ".pp-reg .ok{background:rgba(34,160,107,.14);color:#2fbf7f;border-color:transparent;font-weight:700}.pp-reg .no{background:rgba(224,83,61,.14);color:#ff7a66;border-color:transparent;font-weight:700}.pp-reg .mut{border:0}" +
    ".pp-tip{font-size:12.5px;color:var(--sub);margin:4px 0 8px}" +
    ".pp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}" +
    ".pp-f{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;background:var(--panel2);border:1.5px solid var(--line);border-radius:14px;padding:10px 9px 9px;color:var(--text);font:inherit;min-width:0}" +
    ".pp-f .pp-i{font-size:20px;line-height:1}.pp-f b{font-size:13.5px;letter-spacing:-.3px}.pp-f small{font-size:10.5px;color:var(--sub);line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}" +
    ".pp-f.on{border-color:var(--fc);box-shadow:inset 0 0 0 1px var(--fc)}.pp-f em{position:absolute;right:7px;top:6px;font-style:normal;font-weight:900;color:#fff;background:var(--fc);width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px}" +
    ".pp-in{display:grid;gap:8px}.pp-in label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub);font-weight:700}" +
    ".pp-in input,.pp-ar input{background:var(--panel2);border:1px solid var(--line);border-radius:12px;color:var(--text);font:inherit;font-size:16px;padding:10px 12px;width:100%;box-sizing:border-box}" +
    ".pp-amt{border-left:4px solid var(--fc);padding:8px 0 10px 11px;margin-bottom:10px}.pp-an{display:flex;align-items:center;gap:6px;font-size:14px}.pp-aw{margin-left:auto;color:var(--sub);font-size:13px}" +
    ".pp-ar{display:flex;align-items:center;gap:8px;margin:6px 0}.pp-ar span{color:var(--sub);font-size:13px;flex:none}" +
    ".pp-q{display:flex;gap:6px;flex-wrap:wrap}.pp-q button{border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:99px;padding:5px 11px;font:inherit;font-size:12.5px}.pp-q button.on{background:var(--fc);color:#fff;border-color:transparent;font-weight:700}" +
    ".pp-tot{text-align:right;font-size:14px;color:var(--sub);border-top:1px solid var(--line);padding-top:8px}.pp-tot b{color:var(--text);font-size:17px;margin-left:6px}" +
    ".pp-go{display:grid;gap:8px}.pp-go button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:13px 14px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:15.5px;font-weight:800}" +
    ".pp-go button small{font-size:11.5px;color:var(--sub);font-weight:500}.pp-go button.main{background:var(--c,#7c9cff);color:#111;border-color:transparent}.pp-go button.main small{color:rgba(0,0,0,.65)}" +
    ".pp-go button.ready{background:#22a06b;color:#fff;border-color:transparent}.pp-go button.ready small{color:rgba(255,255,255,.85)}.pp-go button:disabled{opacity:.7}" +
    ".pp-op{margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)}.pp-ol{font-size:12.5px;font-weight:800;margin:8px 0 5px}" +
    ".pp-md{display:grid;grid-template-columns:1fr 1fr;gap:6px}.pp-md button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;border:1.5px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:8px 10px;font:inherit}" +
    ".pp-md button small{font-size:11px;color:var(--sub)}.pp-md button.on{border-color:var(--fc);box-shadow:inset 0 0 0 1px var(--fc)}" +
    ".pp-mw{display:inline-block;margin-left:6px;font-style:normal;font-size:11.5px;color:var(--sub)}.pp-sf{display:flex;align-items:center;gap:3px;font-size:11.5px;color:var(--sub);flex:none}" +
    ".pp-pl{margin:8px 0 2px}.pp-bar{display:flex;height:12px;border-radius:6px;overflow:hidden;background:var(--panel2)}.pp-bar i{display:block;height:100%}" +
    ".pp-pt{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11.5px;margin-top:6px}.pp-pt s{color:var(--sub);font-size:10.5px}.pp-ps{font-size:12.5px;margin-top:6px}.pp-pw{font-size:12px;color:#ff7a66;margin-top:4px}" +
    ".pp-mu{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;margin:6px 0;padding-bottom:6px;border-bottom:1px solid var(--line)}.pp-mn{flex:1 1 100%;min-width:0;font-size:13.5px;line-height:1.35}.pp-mu>.pp-mn+*{margin-left:auto}.pp-mn small{color:var(--sub)}" +
    ".pp-mu input{width:58px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;color:var(--text);font:inherit;font-size:16px;padding:6px 8px;text-align:right}.pp-mu button{border:0;background:transparent;color:var(--sub);font-size:16px;padding:4px 6px}" +
    ".pp-ms{display:flex;gap:6px}.pp-ms input{flex:1;min-width:0;background:var(--panel2);border:1px solid var(--line);border-radius:12px;color:var(--text);font:inherit;font-size:16px;padding:9px 11px}" +
    ".pp-ms button{flex:none;border:0;border-radius:12px;padding:0 14px;font:inherit;font-weight:800;background:var(--fc);color:#fff}" +
    ".pp-sg{display:flex;flex-direction:column}.pp-sg button{text-align:left;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--text);font:inherit;font-size:13.5px;padding:8px 4px}.pp-sg small{color:var(--sub)}" +
    ".pp-sim details>summary{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;list-style:none;padding:2px 0}.pp-sim details>summary::-webkit-details-marker{display:none}" +
    ".pp-sh{font-size:16px;font-weight:800}.pp-chip{font-size:12px;font-weight:800;border-radius:999px;padding:4px 10px;white-space:nowrap}.pp-chip.ok{background:rgba(46,160,90,.18);color:#3ecf7a}.pp-chip.warn{background:rgba(230,160,40,.2);color:#f0b445}.pp-chip.no{background:rgba(220,70,60,.18);color:#ff7a6e}" +
    ".pp-steps{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:6px}.pp-steps li{display:flex;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:13px;line-height:1.45}.pp-steps b{flex:none;min-width:74px}" +
    ".pp-dv{font-size:12px;color:var(--mut,#9aa3b2);margin:4px 0 6px}.pp-dl{max-height:360px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:12.5px;line-height:1.55}" +
    ".pp-dl ul{list-style:none;margin:2px 0 8px;padding:0}.pp-dl li{margin:3px 0}.pp-dg{font-weight:800;margin-top:6px;color:#8fb8ff}.pp-dg.r{color:#ff9a8e}" +
    ".pp-help{margin:10px 0 2px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font-size:13px}.pp-help summary{padding:10px 0;font-weight:800;cursor:pointer}" +
    ".pp-hb{padding:0 0 12px;line-height:1.55}.pp-hb ul{margin:4px 0 10px;padding-left:18px}.pp-hb li{margin:3px 0}" +
    ".pp-pr{position:relative;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px}.pp-pr pre{white-space:pre-wrap;margin:0 0 8px;font:inherit;font-size:12px;line-height:1.5}" +
    ".pp-pr button{border:0;border-radius:8px;padding:7px 12px;font:inherit;font-weight:800;background:var(--c,#7c9cff);color:#111}" +
    ".pp-st{font-size:12.5px;margin:8px 2px 0;min-height:1em}.pp-pv-h{font-size:13px;font-weight:800;margin:14px 0 6px}" +
    ".pp-pv{border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#f5f7fb;position:relative}.pp-pv-in{pointer-events:none}" +
    ".pp-jt{display:inline-flex;vertical-align:middle;margin-left:4px;cursor:pointer}.pp-tr{grid-template-columns:repeat(3,1fr)}.pp-tr button:disabled{opacity:.45}.pp-go button.pp-show{background:linear-gradient(135deg,#2f6fdf,#7b5cff);color:#fff;border-color:transparent}.pp-go button.pp-show small{color:rgba(255,255,255,.85)}" +
    "html.ppx-on,html.ppx-on body{overflow:hidden}" +
    "#ppx{position:fixed;inset:0;z-index:900;background:var(--bg,#0b0f17);color:var(--text);display:flex;flex-direction:column;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom);-webkit-user-select:none;user-select:none}" +
    ".px-top{display:flex;align-items:center;gap:8px;padding:10px 14px 4px}.px-fs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}.px-fs::-webkit-scrollbar{display:none}" +
    ".px-fs button{flex:none;border:1.5px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:7px 12px;font:inherit;font-size:14px;font-weight:700}.px-fs button.on{border-color:var(--fc);background:var(--fc);color:#fff}" +
    ".px-x{margin-left:auto;flex:none;min-width:44px;height:44px;border-radius:22px;border:1px solid var(--line);background:var(--panel2);color:var(--sub);font:inherit;font-size:18px;padding:0 12px}.px-x.arm{background:#e0533d;color:#fff;border-color:transparent;font-size:14px;font-weight:800}" +
    ".px-ctl{padding:4px 14px 8px;display:flex;flex-direction:column;gap:8px}.px-am{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.px-am::-webkit-scrollbar{display:none}" +
    ".px-am button{flex:1 0 auto;border:1px solid var(--line);background:transparent;color:var(--text);border-radius:12px;padding:10px 8px;font:inherit;font-size:16px;font-weight:700}.px-am button.on{background:var(--text);color:var(--bg,#0b0f17);border-color:transparent}" +
    ".px-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--line);border-radius:12px;overflow:hidden}.px-seg button{border:0;background:transparent;color:var(--text);font:inherit;font-size:16px;font-weight:700;padding:11px 4px}" +
    ".px-seg button+button{border-left:1px solid var(--line)}.px-seg button.on{background:#2f6fdf;color:#fff}.px-seg button:disabled{opacity:.35}" +
    ".px-rail{flex:1;min-height:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}.px-rail::-webkit-scrollbar{display:none}" +
    ".px-s{flex:0 0 100%;width:100%;scroll-snap-align:start;overflow-y:auto;box-sizing:border-box;padding:6px 18px 18px}.px-in{max-width:520px;margin:0 auto}" +
    ".px-s h2{font-size:28px;line-height:1.25;letter-spacing:-.8px;margin:8px 0 6px}.px-sub{font-size:16px;color:var(--sub);margin:0 0 14px}" +
    ".px-cv{display:flex;flex-direction:column;justify-content:center;min-height:100%;padding-top:4vh}.px-for{font-size:19px;color:var(--sub);margin:0 0 6px;font-weight:700}.px-cv h1{font-size:30px;line-height:1.25;letter-spacing:-.8px;margin:0 0 16px}" +
    ".px-amt{font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1.05;color:var(--fc)}.px-tg{display:inline-block;align-self:flex-start;margin-top:10px;padding:6px 12px;border-radius:99px;background:var(--panel2);font-size:16px;font-weight:800}" +
    ".px-hl{font-size:19px;line-height:1.5;margin:18px 0 8px;font-weight:700}.px-fit{font-size:16px;color:var(--sub);line-height:1.5;margin:0}.px-sw{margin-top:28px;font-size:15px;color:var(--sub)}" +
    ".px-dn{display:flex;justify-content:center;margin:4px 0 12px}.px-dw{position:relative;width:240px;height:240px}.px-dw img{display:block;width:240px;height:240px}" +
    ".px-dc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.px-dc small{font-size:15px;color:var(--sub)}.px-dc b{font-size:26px;letter-spacing:-1px}" +
    ".px-br{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:11px 0;border-bottom:1px solid var(--line)}.px-bl{min-width:0}.px-bl b{display:block;font-size:19px;line-height:1.3}.px-bl small,.px-bv small{display:block;font-size:14px;color:var(--sub);margin-top:2px}" +
    ".px-bv{text-align:right}.px-bv b{font-size:21px;white-space:nowrap}.px-s{word-break:keep-all}.px-bb{grid-column:1/-1;height:8px;border-radius:4px;background:var(--panel2);overflow:hidden;margin-top:6px}.px-bb i{display:block;height:100%;border-radius:4px}" +
    ".px-dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:7px;vertical-align:1px}" +
    ".px-note{font-size:15px;color:var(--sub);line-height:1.5;margin:12px 0 0}.px-cap{font-size:16px;color:var(--sub);margin:4px 0 12px;line-height:1.45}" +
    ".px-big{font-size:46px;font-weight:900;letter-spacing:-1.8px;line-height:1.1;margin-top:8px}.px-big.dn,.px-s .dn b,.px-crv .dn{color:#4d8dff}.px-big.up,.px-s .up b{color:#ff6b57}" +
    ".px-cr{padding:13px 0;border-bottom:1px solid var(--line)}.px-cr>b{font-size:18px}.px-crv{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-top:4px}.px-crv span{font-size:28px;font-weight:900;letter-spacing:-1px}.px-crv small{font-size:15px;color:var(--sub)}.px-crc{display:block;font-size:14px;color:var(--sub);margin-top:3px}" +
    ".px-pos{display:flex;align-items:center;gap:14px;margin:6px 0 16px}.px-pos b{flex:none;white-space:nowrap;font-size:56px;font-weight:900;letter-spacing:-2px;color:#ff6b57}.px-pos span{font-size:16px;line-height:1.45;color:var(--sub)}" +
    ".px-3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.px-3>div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 9px}.px-3 small{display:block;font-size:14px;color:var(--sub)}.px-3 b{display:block;font-size:16.5px;margin-top:4px;letter-spacing:-.5px;word-break:keep-all;line-height:1.25}.px-3 em{display:block;font-style:normal;font-size:14px;color:var(--sub);margin-top:2px}" +
    ".px-go{display:grid;gap:10px;margin-top:22px}.px-go button{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:16px;border-radius:16px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:18px;font-weight:800}" +
    ".px-go button small{font-size:13.5px;color:var(--sub);font-weight:500}.px-go button.main{background:#fee500;color:#191919;border-color:transparent}.px-go button.main small{color:rgba(0,0,0,.6)}.px-go button.ready{background:#22a06b;color:#fff}" +
    ".px-ft{padding:6px 14px 10px;text-align:center}.px-dots{display:flex;justify-content:center;gap:7px;margin-bottom:6px}.px-dots i{width:8px;height:8px;border-radius:4px;background:var(--line);transition:width .2s}.px-dots i.on{width:22px;background:var(--text)}" +
    ".px-ft p{margin:0;font-size:13.5px;color:var(--sub)}" +
    "@media (min-width:560px){.px-s h2{font-size:32px}}" +
    ".pp-gl{margin:10px 0 12px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:10px 12px}.pp-gl summary{font-weight:800;font-size:14.5px;cursor:pointer;list-style:none}.pp-gl summary::-webkit-details-marker{display:none}.pp-gl summary small{display:block;font-weight:600;font-size:12px;color:var(--sub);margin-top:2px}" +
    ".pp-gi{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-top:10px}.pp-gi label{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--sub);font-weight:700}.pp-gi .pp-ar{margin:0}.pp-gi input{background:var(--panel);border:1px solid var(--line);border-radius:10px;color:var(--text);font:inherit;font-size:16px;padding:8px 10px;width:100%;min-width:0;box-sizing:border-box}" +
    ".pp-gq{margin-top:8px;--fc:#3a7bd5}.pp-gs{margin-top:8px;font-size:13px;line-height:1.55}.pp-gs .mut{font-size:11.5px}" +
    ".pp-gb{display:block;width:100%;margin-top:5px;padding:4px 6px;border-radius:8px;font-size:11px;line-height:1.3;box-sizing:border-box}.pp-gb:empty{display:none}.pp-gb b{display:block;font-size:12px;letter-spacing:-.3px}.pp-gb small{display:block;-webkit-line-clamp:2!important;font-size:10px!important}" +
    ".pp-gb.ok{background:rgba(46,180,120,.16)}.pp-gb.mid{background:rgba(240,180,60,.18)}.pp-gb.no{background:rgba(150,160,175,.16)}.pp-gb.na{background:rgba(150,160,175,.10);opacity:.8}" +
    ".px-goal{font-size:16px;line-height:1.55;margin:14px 0 0;padding:10px 12px;border-radius:12px;background:var(--panel2);font-weight:700}" +
    "@media (min-width:560px){.pp-grid{grid-template-columns:repeat(5,1fr)}.pp-go{grid-template-columns:repeat(2,1fr)}}";
  document.head.appendChild(css);
})();
