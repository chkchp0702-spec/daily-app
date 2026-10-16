/* CH Investing — 🛍️ 상품: 미래에셋증권이 지금 파는 채권 · 펀드 · ELS (archive/x/products.json, products.yml 하루 3번)
   10/16 사용자: 「상품 카테고리 — 국채·미국채·브라질국채 / 펀드·사모펀드(수익률 순위) / ELS — 하위 3개 · 기존 카테고리 형식과 비슷하게」
   세 탭: bond(🏦 채권) · fund(📦 펀드) · els(🎯 ELS). 숫자는 미래에셋 공개 화면에서 받은 그대로 — 사라는 뜻 아님. */
(function(){
  var e = V.e, cls = V.cls, fmt = V.fmt;
  var SEL = {}, PER = "m3";
  try { SEL = JSON.parse(localStorage.getItem("prodsel") || "{}"); PER = localStorage.getItem("prodper") || "m3"; } catch(x) {}
  function keep(){ try { localStorage.setItem("prodsel", JSON.stringify(SEL)); localStorage.setItem("prodper", PER); } catch(x) {} }
  function card(t, b, x, id){ return '<section class="card"' + (id ? ' id="' + id + '"' : '') + '>' + (t ? '<h3>' + t + (x || "") + '</h3>' : '') + b + '</section>'; }
  function P(){ return getJSON("archive/x/products.json?" + Math.floor(Date.now() / 300000), {ttl: 300000}); }
  function pc(v, d){ return v == null ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function sg(v, d){ return v == null ? "–" : '<b class="' + cls(v) + '">' + (v > 0 ? "+" : "") + (+v).toFixed(d == null ? 1 : d) + "%</b>"; }
  function md(d){ return d ? String(d).slice(5).replace("-", "/") : ""; }
  function yrs(r){ return r.yrs + "년" + (r.days ? " " + r.days + "일" : ""); }
  function seg(id, items, on){ return '<div class="seg2" id="' + id + '">' + items.map(function(x){ return '<button' + (x[0] === on ? ' class="on"' : '') + ' data-k="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>'; }
  function bindSeg(id, fn){ var n = document.getElementById(id); if (!n) return; [].forEach.call(n.children, function(b){ b.onclick = function(){ [].forEach.call(n.children, function(x){ x.classList.toggle("on", x === b); }); fn(b.dataset.k); }; }); }
  function holdAt(sel, y){
    var stop = false, t0 = Date.now(), quit = function(){ stop = true; };
    window.addEventListener("touchstart", quit, {once: true, passive: true}); window.addEventListener("wheel", quit, {once: true, passive: true});
    (function f(){ if (stop) return; var n = document.querySelector(sel); if (n){ var d = n.getBoundingClientRect().top - y; if (Math.abs(d) > 1) window.scrollTo({top: window.scrollY + d, behavior: "instant"}); }
      if (Date.now() - t0 < 800) requestAnimationFrame(f); })();
  }
  function line1(vals, labels, opt){ return V.lines([{name: opt.name, color: opt.color || "#7c9cff", vals: vals}], labels, {h: opt.h || 150, endLabels: true, nolegend: true, nodots: true}); }
  function hist(h, n){ h = h || []; return h.slice(-(n || 260)); }
  function lbl(h){ return h.map(function(x){ return x[0].slice(2, 4) + "년 " + (+x[0].slice(5, 7)) + "월"; }); }
  function vals(h){ return h.map(function(x){ return x[1]; }); }
  var WARN = '<p class="note">미래에셋증권 홈페이지에 공개된 숫자를 그대로 옮긴 거예요. 사라는 뜻이 아니고, 실제 매수 조건(금리·수수료·세금)은 매매 화면에서 다시 확인하세요.</p>';

  /* ───────── 🏦 채권 ───────── */
  function bondView(D){
    var k = SEL.bond || "gov", K = D.krw || [], U = D.ust || {}, A = D.aud || {}, B = D.brl || {};
    var gov = K.filter(function(r){ return r.kind === "국채"; }), oth = K.filter(function(r){ return r.kind !== "국채"; });
    var top = function(a, f){ return a.slice().sort(function(x, y){ return (y[f] || 0) - (x[f] || 0); })[0]; };
    var g1 = top(gov, "after"), u1 = (U.items || []).slice().sort(function(x, y){ return (y.ytm || 0) - (x.ytm || 0); })[0], brl = (B.fx || []).slice(-1)[0], brl0 = (B.fx || []).slice(-2)[0];
    var h = '<div class="mg-kv">' +
      '<div><small>🇰🇷 국고채 세후 최고</small><b class="up">' + (g1 ? pc(g1.after) : "–") + '</b><em>' + (g1 ? e(g1.name) + " · " + yrs(g1) : "") + '</em></div>' +
      '<div><small>🇺🇸 미국채 10년 금리</small><b>' + (U.y10 != null ? pc(U.y10) : "–") + '</b><em>' + (U.y10_prev != null ? "전일 " + pc(U.y10_prev) + " · 환율 " + fmt(U.fx) : "") + '</em></div>' +
      '<div><small>🇺🇸 판매 미국채 최고 수익률</small><b>' + (u1 ? pc(u1.ytm) : "–") + '</b><em>' + (u1 ? e(u1.name) + " · 만기 " + e(u1.mat) : "") + '</em></div>' +
      '<div><small>🇧🇷 헤알/원 환율</small><b>' + (brl ? fmt(brl[1]) : "–") + '</b><em>' + (brl && brl0 ? "하루 " + V.sgn((brl[1] / brl0[1] - 1) * 100, 2) + "% · " + md(brl[0]) : "") + '</em></div></div>';
    h += seg("pdseg", [["gov", "🇰🇷 국채"], ["ust", "🇺🇸 미국채"], ["brl", "🇧🇷 브라질국채"], ["oth", "공사채·회사채"]], k) + '<div id="pdbody">' + bondBody(D, k) + '</div>';
    if (D.notice && D.notice.length) h += '<details class="card cpx-d"><summary>📢 채권 공지 <span class="mut">미래에셋 · 최근 ' + D.notice.length + '건</span></summary>' +
      D.notice.map(function(n){ return '<a class="pd-nt" href="' + e(n.url) + '" target="_blank" rel="noopener"><span class="mut">' + e(n.date || "") + '</span>' + e(n.title) + '</a>'; }).join("") + '</details>';
    return h + WARN;
  }
  function bondRows(rows, hi){
    if (!rows.length) return '<div class="empty">지금 파는 상품이 없어요.</div>';
    var mx = Math.max.apply(null, rows.map(function(r){ return r.after || 0; }).concat([0.1]));
    return '<div class="pd-list">' + rows.map(function(r, i){
      return '<div class="pd-it"><div class="pd-h"><span class="rk">' + (i + 1) + '</span><div class="pd-n"><b>' + e(r.name) + '</b><small>' + e(r.risk) + ' · 잔존 ' + yrs(r) + ' · ' + (/^9999/.test(r.mat) ? '영구채(콜 가능)' : '만기 ' + e(r.mat)) + '</small></div>' +
        '<div class="pd-v"><b class="up">' + pc(r.after) + '</b><small>세후 수익률</small></div></div>' +
        '<div class="pd-bar"><i style="width:' + ((r.after || 0) / mx * 100).toFixed(0) + '%"></i></div>' +
        '<div class="pd-row"><span>매수금리 <b>' + pc(r.buy, 3) + '</b></span><span>은행 예금으로 치면 <b>' + pc(r.bank) + '</b></span><span>단가 <b>' + fmt(r.px) + '</b></span></div></div>';
    }).join("") + '</div>';
  }
  function bondBody(D, k){
    var K = D.krw || [], U = D.ust || {}, A = D.aud || {}, B = D.brl || {}, H = D.ust_hist || {};
    if (k === "gov"){
      var g = K.filter(function(r){ return r.kind === "국채"; }).sort(function(x, y){ return (y.after || 0) - (x.after || 0); });
      return card("🇰🇷 국고채·국민주택채권 <span class='mut'>장외채권 · 세후 수익률 높은 순 · " + g.length + "개</span>",
        '<p class="note" style="margin:0 0 10px">「세후 수익률」은 이자 세금(15.4%)을 뗀 뒤 1년에 실제로 손에 쥐는 비율, 「은행 예금으로 치면」은 같은 돈을 예금했을 때 필요한 세전 금리예요. 만기가 긴 국채는 중간에 팔면 값이 크게 움직여요.</p>' + bondRows(g));
    }
    if (k === "ust"){
      var y = hist(H.y10, 260), fx = hist(H.usdkrw, 260), items = (U.items || []).slice().sort(function(a, b){ return a.mat < b.mat ? -1 : 1; });
      var h = card("🇺🇸 미래에셋이 파는 미국채 <span class='mut'>" + e(U.date ? md(U.date) + " 판매정보" : "") + "</span>",
        (items.length ? '<div class="pd-list">' + items.map(function(r){
          var yr = Math.max(0, (new Date(r.mat) - Date.now()) / 365.25 / 864e5);
          return '<div class="pd-it"><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' (약 ' + yr.toFixed(1) + '년) · 표면금리 ' + pc(r.cpn, 3) + ' · ' + e(r.cur) + '</small></div>' +
            '<div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>시세 수익률(세전)</small></div></div></div>'; }).join("") + '</div>' : '<div class="empty">오늘 판매정보가 아직 없어요.</div>') +
        '<p class="note">미국채는 달러로 사요 — 수익률은 달러 기준이고, 원화로 바꾸면 환율만큼 더해지거나 빠져요. 이자는 과세(15.4%), 표면금리가 낮은 채권은 이자 대신 싸게 사서 만기에 액면을 받는 몫이 커요. 매일 아침 미래에셋이 올리는 「미국채 시장동향·판매정보」 글에서 가져왔어요' + (U.url ? ' (<a href="' + e(U.url) + '" target="_blank" rel="noopener">원문</a>)' : '') + '.</p>');
      h += card("미국 10년 국채 금리 <span class='mut'>1년 · 야후</span>", (y.length > 5 ? line1(vals(y), lbl(y), {name: "10년", color: "#e66767", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 10년 금리 ' + (U.y10 != null ? '<b>' + pc(U.y10) + '</b> (전일 ' + pc(U.y10_prev) + ')' : '–') + '. 금리가 오르면 이미 산 채권 값은 내려가고, 내리면 올라가요 — 만기가 길수록 더 크게.</p>');
      h += card("원/달러 환율 <span class='mut'>1년</span>", (fx.length > 5 ? line1(vals(fx), lbl(fx), {name: "원/달러", color: "#7c9cff", h: 130}) : '<div class="spark-empty">자료 준비 중</div>') +
        '<p class="note">미래에셋 기준 ' + (U.fx != null ? '<b>' + fmt(U.fx) + '원</b> (전일 ' + fmt(U.fx_prev) + ')' : '–') + '. 달러가 싸질 때 사 두면 환차익, 비쌀 때 사면 환손실이 더해져요.</p>');
      if (A.items && A.items.length) h += '<details class="card cpx-d"><summary>🇦🇺 호주국채도 팔아요 <span class="mut">' + A.items.length + '개 · 10년 ' + pc(A.y10) + '</span></summary><div class="pd-list">' + A.items.map(function(r){
        return '<div class="pd-it"><div class="pd-h"><div class="pd-n"><b>' + e(r.name) + '</b><small>만기 ' + e(r.mat) + ' · 표면 ' + pc(r.cpn) + ' · AUD</small></div><div class="pd-v"><b class="up">' + pc(r.ytm) + '</b><small>수익률</small></div></div></div>'; }).join("") +
        '</div><p class="note">호주달러 환율 ' + fmt(A.fx) + '원 · 신용등급 AAA · 이자 과세.</p></details>';
      return h;
    }
    if (k === "brl"){
      var f = hist(B.fx, 260), ub = hist(B.usdbrl, 260), last = f.slice(-1)[0], first = f[0];
      var yr1 = last && first ? (last[1] / first[1] - 1) * 100 : null;
      return card("🇧🇷 브라질국채 <span class='mut'>미래에셋 · 단순중개</span>",
        '<div class="pd-brl"><div><small>이자 세금</small><b class="up">비과세</b><em>개인 · 한-브라질 조세협약</em></div><div><small>신용등급</small><b>BB</b><em>투기등급 (국제)</em></div><div><small>통화</small><b>BRL</b><em>헤알 · USD 표시도</em></div><div><small>잔존만기</small><b>1~30년</b><em>이표채·물가채·할인채</em></div></div>' +
        '<p class="note">미래에셋은 브라질국채를 「판매」가 아니라 <b>단순중개</b>로 다뤄요 — 홈페이지에 매일 파는 종목표가 올라오지 않고, MAPS(해외채권 중개 화면)나 영업점에서 종목·금리를 받아요. 수수료는 연환산 오프라인 30bp · 온라인 15bp. 브라질 10년 국채 금리는 공개 화면에 없어서 여기 안 적어요(지어내지 않음).</p>') +
        card("헤알/원 환율 <span class='mut'>1년 · 원/달러 ÷ 헤알/달러</span>", (f.length > 5 ? line1(vals(f), lbl(f), {name: "헤알/원", color: "#199e70", h: 150}) : '<div class="spark-empty">자료 준비 중</div>') +
          '<p class="note">지금 <b>' + (last ? fmt(last[1]) + "원" : "–") + '</b>' + (yr1 != null ? ' · 1년 ' + sg(yr1) : '') + '. 브라질국채 수익은 「채권 금리 + 환율」이라 헤알이 싸질 때 사면 환차익 몫이 커지고, 비쌀 때 사면 금리를 받아도 환손실이 더 클 수 있어요.</p>') +
        card("헤알/달러 <span class='mut'>1년 · 숫자가 커지면 헤알 약세</span>", (ub.length > 5 ? line1(vals(ub), lbl(ub), {name: "헤알/달러", color: "#c98500", h: 120}) : '<div class="spark-empty">자료 준비 중</div>'));
    }
    var o = (D.krw || []).filter(function(r){ return r.kind !== "국채"; }).sort(function(x, y){ return (y.after || 0) - (x.after || 0); });
    var kinds = {}; o.forEach(function(r){ kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
    return card("공사채·회사채·신종자본증권 <span class='mut'>장외채권 · 세후 수익률 높은 순 · " + o.length + "개</span>",
      '<div style="margin-bottom:8px">' + Object.keys(kinds).map(function(x){ return '<span class="chip2">' + e(x) + ' ' + kinds[x] + '</span>'; }).join("") + '</div>' +
      '<p class="note" style="margin:0 0 10px">「매우높은위험」으로 표시된 조건부자본증권(신종·후순위)은 은행이 어려워지면 원금을 날릴 수 있어서 금리가 높아요. 위험 등급을 꼭 같이 보세요.</p>' + bondRows(o));
  }

  /* ───────── 📦 펀드 ───────── */
  var PERS = [["m3", "3개월"], ["m6", "6개월"], ["y1", "1년"], ["y3", "3년"]], PN = {m3: "3개월", m6: "6개월", y1: "1년", y3: "3년"};
  function fname(n){ return String(n || "").replace(/\s*\((?:수수료|운용|보수)[^)]*\)\s*/g, "").replace(/\s*(종류|클래스|Class|class|CLASS)\s*[A-Za-z][-A-Za-z0-9]*\s*(\([^)]*\))?\s*$/, ""); }
  function frow(x, i, per){
    var v = x[per];
    return '<a class="pd-it pd-f" href="javascript:void(0)" data-fc="' + e(x.c) + '"><div class="pd-h"><span class="rk">' + (i + 1) + '</span><div class="pd-n"><b>' + e(fname(x.n)) + '</b><small>' + e(x.co || "") + ' · ' + e(x.t || "") + (x.st ? ' · ' + e(x.st) : '') + (x.rk ? ' · 위험 ' + x.rk + '등급' : '') + '</small></div>' +
      '<div class="pd-v">' + (v == null ? '<b class="mut">–</b>' : sg(v)) + '<small>' + PN[per] + '</small></div></div>' +
      '<div class="pd-row"><span>3개월 ' + sg(x.m3) + '</span><span>1년 ' + sg(x.y1) + '</span><span>3년 ' + sg(x.y3) + '</span><span>순자산 <b>' + (x.aum != null ? fmt(x.aum) + '억' : '–') + '</b></span></div></a>';
  }
  function fundView(D){
    var F = (D.funds || []).filter(function(x){ return x.t; }), k = SEL.fund || "pv";
    var pv = F.filter(function(x){ return x.pv; });
    var big = F.filter(function(x){ return (x.aum || 0) >= 10; });
    var h = '<div class="mg-kv"><div><small>판매 중 공모펀드</small><b>' + F.length.toLocaleString() + '개</b><em>미래에셋 펀드검색 · ' + e(D.updated || "") + '</em></div><div><small>사모펀드 (재간접)</small><b>' + pv.length + '개</b><em>공개 판매되는 것만</em></div></div>';
    h += seg("pdseg", [["pv", "🔒 사모펀드 순위"], ["all", "🏆 전체 순위"], ["type", "유형별 TOP"]], k) + seg("pdper", PERS, PER) + '<div id="pdbody">' + fundBody(D, k) + '</div>';
    return h + WARN;
  }
  function fundBody(D, k){
    var F = (D.funds || []).filter(function(x){ return x.t; }), per = PER;
    var by = function(a){ return a.filter(function(x){ return x[per] != null; }).sort(function(x, y){ return y[per] - x[per]; }); };
    if (k === "pv"){
      var pv = by(F.filter(function(x){ return x.pv; }));
      return card("🔒 사모펀드 수익률 순위 <span class='mut'>" + PN[per] + " · " + pv.length + "개</span>",
        '<p class="note" style="margin:0 0 10px">진짜 사모펀드(49인 이하 전문투자자용)는 공개 화면에 안 올라와요. 여기는 미래에셋이 일반 고객에게 파는 <b>「사모투자재간접형」</b> — 여러 사모(헤지)펀드에 나눠 투자하는 공모펀드예요. 사모펀드 성적을 일반 계좌로 받아 볼 수 있는 길이라 순위로 묶었어요.</p>' +
        (pv.length ? '<div class="pd-list">' + pv.map(function(x, i){ return frow(x, i, per); }).join("") + '</div>' : '<div class="empty">이 기간 수익률이 있는 사모펀드가 없어요.</div>') +
        '<p class="note">직접 사모펀드(헤지펀드) 가입은 영업점·PB 상담으로만 — 최소 가입금액·전문투자자 요건이 있어요.</p>');
    }
    if (k === "all"){
      var big = by(F.filter(function(x){ return (x.aum || 0) >= 10; })), top = big.slice(0, 30), bot = big.slice(-10).reverse();
      return card("🏆 수익률 TOP 30 <span class='mut'>" + PN[per] + " · 순자산 10억 이상 " + big.length + "개 중</span>", '<div class="pd-list">' + top.map(function(x, i){ return frow(x, i, per); }).join("") + '</div>') +
        '<details class="card cpx-d"><summary>📉 ' + PN[per] + ' 가장 많이 빠진 10개</summary><div class="pd-list">' + bot.map(function(x, i){ return frow(x, i, per); }).join("") + '</div></details>';
    }
    var types = {}; F.forEach(function(x){ if ((x.aum || 0) >= 10 && x[per] != null){ (types[x.t] = types[x.t] || []).push(x); } });
    var order = Object.keys(types).sort(function(a, b){ return types[b].length - types[a].length; });
    return order.map(function(t){
      var a = by(types[t]), avg = a.reduce(function(s, x){ return s + x[per]; }, 0) / a.length;
      return '<details class="card cpx-d"' + (t === order[0] ? " open" : "") + '><summary>' + e(t) + ' <span class="mut">' + a.length + '개 · 평균 ' + V.sgn(avg) + '%</span></summary><div class="pd-list">' + a.slice(0, 5).map(function(x, i){ return frow(x, i, per); }).join("") + '</div></details>';
    }).join("");
  }
  function fundSheet(x){
    if (!x) return;
    navPush({t: "fund", c: x.c}); closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    var u = "https://securities.miraeasset.com/hks/hks4116/p11.do?fd_cd=" + encodeURIComponent(x.c);
    sh.innerHTML = '<div class="sh-top"><button class="sh-x" onclick="goBack()">✕</button><b>' + e(fname(x.n)) + '</b></div><div class="sh-body">' +
      '<div class="mg-kv"><div><small>' + PN[PER] + ' 수익률</small>' + (x[PER] == null ? '<b>–</b>' : '<b class="' + cls(x[PER]) + '">' + V.sgn(x[PER]) + '%</b>') + '</div><div><small>순자산</small><b>' + (x.aum != null ? fmt(x.aum) + '억' : '–') + '</b></div>' +
      '<div><small>운용사</small><b style="font-size:14px">' + e(x.co || "–") + '</b></div><div><small>위험</small><b>' + (x.rk ? x.rk + '등급' : '–') + '</b><em>1 매우높음 ~ 6 매우낮음</em></div></div>' +
      card("기간별 수익률", V.dbars([["1주", x.w1], ["1개월", x.m1], ["3개월", x.m3], ["6개월", x.m6], ["1년", x.y1], ["3년", x.y3], ["5년", x.y5]].filter(function(r){ return r[1] != null; }).map(function(r){ return {label: r[0], v: r[1]}; }))) +
      card("정보", '<div class="pd-row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>유형 <b>' + e(x.t || "") + (x.st ? " · " + e(x.st) : "") + '</b></span><span>클래스 <b>' + e(x.cls || "–") + '</b></span><span>총보수 <b>' + (x.fee != null ? x.fee + "%" : "–") + '</b>' + (x.sfee ? ' · 선취 ' + x.sfee + '%' : '') + '</span><span>설정일 <b>' + e(x.est ? x.est.slice(0, 4) + "-" + x.est.slice(4, 6) + "-" + x.est.slice(6, 8) : "–") + '</b></span><span>기준가 날짜 <b>' + e(x.d ? x.d.slice(0, 4) + "-" + x.d.slice(4, 6) + "-" + x.d.slice(6, 8) : "–") + '</b></span></div>' +
        '<p class="note"><a href="' + u + '" target="_blank" rel="noopener">미래에셋 상품 상세 열기 ↗</a></p>') +
      '<p class="note" style="padding:0 4px 90px">' + e(x.n) + '</p></div>';
    document.body.appendChild(sh); document.body.classList.add("sheet-open"); try { updBack(); } catch(z) {}
  }

  /* ───────── 🎯 ELS ───────── */
  function dday(d){ if (!d) return ""; var n = Math.round((new Date(d + "T23:59:59+09:00") - Date.now()) / 864e5); return n < 0 ? "마감" : n === 0 ? "오늘 마감" : "D-" + n; }
  function elsRow(x, done){
    var t = x.t, pp = (x.pp || 0) >= 100;
    return '<div class="pd-it pd-e"><div class="pd-h"><div class="pd-n"><b>' + e(x.n) + '</b><small><span class="chip2 ' + (pp ? "cool" : "hot") + '">' + e(t) + (pp ? " · 원금지급" : " · 원금 비보장") + '</span>' + (x.hi ? '<span class="chip2">고난도</span>' : '') + (x.monthly ? '<span class="chip2">월지급</span>' : '') + (x.dl_e ? '<span class="chip2">숙려 ' + e(md(x.dl_e)) + '까지</span>' : '') + '</small></div>' +
      '<div class="pd-v"><b class="up">' + pc(x.cpn) + '</b><small>연 수익률(세전)</small></div></div>' +
      '<div class="pd-row"><span>기초자산 <b>' + e(x.ua || "–") + '</b></span></div>' +
      '<div class="pd-row"><span>구조 <b>' + e(x.kind || "") + '</b> ' + e(x.desc || "") + '</span></div>' +
      '<div class="pd-row"><span>만기 <b>' + e(x.mat || "–") + '</b> · ' + e(x.cyc || "") + '마다 상환 기회</span><span>최대 손실 <b class="' + ((x.loss || 0) < 0 ? "dn" : "") + '">' + (x.loss != null ? x.loss + "%" : "–") + '</b></span>' + (x.ki ? '<span>KI <b>' + x.ki + '</b></span>' : '') + '</div>' +
      '<div class="pd-row"><span>청약 ' + e(md(x.s)) + ' ~ ' + e(md(x.e)) + (done ? '' : ' <b class="' + (/오늘|D-[12]$/.test(dday(x.e)) ? "dn" : "") + '">' + dday(x.e) + '</b>') + '</span><span>모인 돈 <b>' + fmt(x.amt) + '억</b> / 한도 ' + fmt(x.lim) + '억' + (x.cr != null ? ' (' + (x.cr * 100).toFixed(1) + '%)' : '') + '</span></div></div>';
  }
  function elsView(D){
    var L = (D.els || []).slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); }), k = SEL.els || "open";
    var pp = L.filter(function(x){ return (x.pp || 0) >= 100; }), np = L.filter(function(x){ return (x.pp || 0) < 100; });
    var ua = {}; L.forEach(function(x){ String(x.ua || "").split(/,\s*/).forEach(function(u){ if (u) ua[u] = (ua[u] || 0) + 1; }); });
    var h = '<div class="mg-kv"><div><small>지금 청약 중</small><b>' + L.length + '개</b><em>ELS ' + np.length + ' · ELB(원금지급) ' + pp.length + '</em></div><div><small>최고 연 수익률</small><b class="up">' + (L[0] ? pc(L[0].cpn) : "–") + '</b><em>' + (L[0] ? e(L[0].n) : "") + '</em></div>' +
      '<div><small>청약 마감</small><b>' + (L.length ? e(md(L.map(function(x){ return x.e; }).sort()[0])) : "–") + '</b><em>' + (L.length ? dday(L.map(function(x){ return x.e; }).sort()[0]) : "") + '</em></div><div><small>많이 쓰는 기초자산</small><b style="font-size:14px">' + Object.keys(ua).sort(function(a, b){ return ua[b] - ua[a]; }).slice(0, 3).map(e).join(", ") + '</b></div></div>';
    h += seg("pdseg", [["open", "🟢 청약 중 " + L.length], ["done", "최근 청약 완료"]], k) + '<div id="pdbody">' + elsBody(D, k) + '</div>';
    h += '<details class="card cpx-d"><summary>📘 ELS 읽는 법</summary><p class="note" style="margin:0">「85-85-85-80-75-70, KI 45」= 6개월마다 기초자산이 처음의 85%·85%·85%·80%·75%·70% 위에 있으면 그때 수익과 함께 끝. <b>KI 45</b>는 중간에 한 번이라도 45% 아래로 떨어지면 만기 때 떨어진 만큼 손실(최대 −100%). 기초자산이 여럿이면 <b>가장 못한 것</b> 기준. ELB는 원금을 증권사가 지급(증권사 신용 위험은 남음). 「고난도」 상품은 숙려기간이 있어 청약 뒤 하루 더 생각할 시간을 줘요.</p></details>';
    return h + WARN;
  }
  function elsBody(D, k){
    if (k === "done"){
      var L = (D.els_done || []).slice(0, 40);
      return card("최근 청약 완료 <span class='mut'>" + L.length + "개 · 조건 참고용</span>", L.length ? '<div class="pd-list">' + L.map(function(x){ return elsRow(x, true); }).join("") + '</div>' : '<div class="empty">자료가 없어요.</div>');
    }
    var L = (D.els || []).slice().sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    var np = L.filter(function(x){ return (x.pp || 0) < 100; }), pp = L.filter(function(x){ return (x.pp || 0) >= 100; });
    return (np.length ? card("🎯 ELS · 원금 비보장 <span class='mut'>연 수익률 높은 순 · " + np.length + "개</span>", '<div class="pd-list">' + np.map(function(x){ return elsRow(x); }).join("") + '</div>') : '') +
      (pp.length ? card("🛡️ ELB · 원금지급형 <span class='mut'>" + pp.length + "개</span>", '<div class="pd-list">' + pp.map(function(x){ return elsRow(x); }).join("") + '</div>') : '') +
      (!L.length ? '<div class="empty">지금 청약 중인 상품이 없어요.</div>' : '');
  }

  /* ───────── 공통 ───────── */
  var VIEW = {bond: bondView, fund: fundView, els: elsView}, BODY = {bond: bondBody, fund: fundBody, els: elsBody};
  window.prodView = function(key){ return '<div id="pdroot" data-k="' + key + '"><div class="loading">미래에셋 상품 자료 불러오는 중…</div></div>'; };
  window.prodInit = function(key){
    P().then(function(D){
      var root = document.getElementById("pdroot"); if (!root || root.dataset.k !== key) return;
      root.innerHTML = (D.errors && D.errors.length ? '<p class="note" style="margin:0 0 8px">⚠️ 일부 자료를 못 받았어요: ' + e(D.errors.join(" · ").slice(0, 200)) + ' — 지난 값을 보여 줘요.</p>' : '') + VIEW[key](D);
      var redraw = function(){ var b = document.getElementById("pdbody"); if (!b) return; var y = b.getBoundingClientRect().top; b.innerHTML = BODY[key](D, SEL[key]); holdAt("#pdbody", y); };
      bindSeg("pdseg", function(k){ SEL[key] = k; keep(); redraw(); });
      bindSeg("pdper", function(k){ PER = k; keep(); redraw(); });
      root.addEventListener("click", function(ev){ var a = ev.target.closest && ev.target.closest("[data-fc]"); if (!a) return; ev.preventDefault();
        var x = (D.funds || []).filter(function(f){ return f.c === a.dataset.fc; })[0]; fundSheet(x); });
      var st = document.getElementById("pdstamp"); if (st) st.textContent = D.updated || "";
    }).catch(function(err){ console.error(err); var r = document.getElementById("pdroot"); if (r) r.innerHTML = '<div class="empty">상품 자료를 못 불러왔어요. 다음 수집 때 채워져요.</div>'; });
  };
  var css = document.createElement("style");
  css.textContent = ".pd-list{display:grid;gap:8px}.pd-it{display:block;background:var(--panel2);border-radius:14px;padding:11px 12px;color:var(--text);text-decoration:none}" +
    ".pd-h{display:flex;align-items:center;gap:10px}.pd-n{flex:1;min-width:0}.pd-n b{display:block;font-size:14px;line-height:1.35;word-break:keep-all}.pd-n small{display:block;color:var(--sub);font-size:11.5px;margin-top:2px;line-height:1.5}" +
    ".pd-v{text-align:right;flex:none}.pd-v b{display:block;font-size:19px;letter-spacing:-.3px}.pd-v small{display:block;color:var(--dim);font-size:10.5px}" +
    ".pd-it .rk{flex:none;width:22px;height:22px;border-radius:7px;background:var(--panel);color:var(--sub);font-size:12px;font-weight:800;display:inline-flex;align-items:center;justify-content:center}" +
    ".pd-bar{height:5px;border-radius:3px;background:var(--panel);margin:8px 0 6px;overflow:hidden}.pd-bar i{display:block;height:100%;background:var(--up);border-radius:3px}" +
    ".pd-row{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--sub);margin-top:6px;line-height:1.6}.pd-row b{color:var(--text)}" +
    ".pd-e .chip2{margin:4px 4px 0 0}.pd-nt{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none;font-size:13px;line-height:1.45}.pd-nt .mut{flex:none;width:78px}" +
    ".pd-brl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px}.pd-brl div{background:var(--panel2);border-radius:12px;padding:10px 12px}.pd-brl small{display:block;color:var(--sub);font-size:11.5px}.pd-brl b{font-size:18px}.pd-brl em{display:block;font-style:normal;font-size:11px;color:var(--dim)}" +
    "#pdper{margin-top:-4px}";
  document.head.appendChild(css);
})();
