/* 📦 app.b08.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 8/8 (tax.js … stab.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
if(typeof __bs!=="function"){window.__bs=window.__bk=window.__be=function(){};}
__bs(8,85,["tax.js", "ux1118.js", "ux1119.js", "stab.js"]);
/* ======== tax.js ======== */
/* CH Investing — 🧾 11/16 세무계산기 (🔬 연구실 › 세무계산기 · #tax)
   사용자: 「세무계산기 카테고리 — 통합으로 진행 · 연구실에 넣고 · 항목 선택하면 필요값만 입력하면 계산 결과 나오는 형태로」
   항목 6개(한 화면 · 고르면 그 항목 입력칸만 보임 · 넣는 즉시 계산):
     ① 2,000만 경보기 — 금융소득종합과세 + 건강보험료(피부양자·지역·직장) 통합 + 고배당 분리과세 비교
     ② 연금계좌 세액공제   ③ 퇴직소득세(일시금 vs 연금)   ④ 연금 받을 때 세금   ⑤ 해외주식 양도세   ⑥ ISA 절세
   ★ 세법 숫자는 전부 아래 LAW 한 곳에만 있음 — 해가 바뀌거나 법이 바뀌면 LAW 만 고칠 것 (기준: 2026년 귀속)
   ★ 11/16 밤 3차: 사용자 「기억값으로 어림이라니… 철저하게 다시」 → 계산에 쓰는 숫자를 전부 법령·국세청·공단 원문과 대조(기억값 0) · 공식 예시로 맞춰 보는 검산 파일 tools/tax_check.js
     [소득세] 세율 §55(시행 2026) · 근로소득공제 §47·연금소득공제 §47의2(시행규칙 별지 40호(1) 2026.3.20 표) · 근로소득세액공제 §59 · 연금계좌세액공제 §59의3 · 표준세액공제 §59의4⑨
              금융소득 2,000만 §14③6 · 배당가산 10% §17③(2024.1.1 이후) · 고배당 분리과세(국세청 2026.3.9 보도자료) · 사적연금 1,500만 §14③9·15% 선택 §64의4
              연금 원천징수 5·4·3%·종신 3%·이연퇴직 70·60·50%(국세청 「연금소득 원천징수 방법」 · 2026.1.1 이후 수령분) · 연금수령한도·기산연차 시행령 §40의2 · 인출순서 §40의3
              퇴직 근속연수공제·환산급여공제 §48(국세청 「퇴직소득세 계산방법」) · 해외주식 기본공제 250만 §118의7·세율 20% · 증여 후 1년 이월과세 §97의2 · RIA 조특법 §91의26
     [건보]  보험료율 7.19%·장기요양 0.9448%·점수당 211.5원·상한 4,591,740·하한 20,160(공단 「2026년 달라지는 제도」·고시 2025-222호) · 재산 60등급 시행령 별표 4(공단 게시표와 대조)
              소득 평가(이자·배당·사업·기타 100% / 근로·연금 50% / 이자·배당 1,000만 이하 제외) 시행규칙 §44 · 보수 외 2,000만 시행령 §41④ · 피부양자 시행규칙 별표 1의2
     [4대보험] 국민연금 9.5%(본인 4.75%)·기준소득월액 상한 637만(~2026.6)·659만(2026.7~) · 고용보험 본인 0.9%
     [증여]  배우자 6억·직계존비속 5천만(미성년 2천만) 상증법 §53 / [ISA] 200·400만·9.9%·서민형 5,000만/3,800만·전환 10%(300만)
   11/16 밤 사용자 「정말 이리 간단한거야? 다른 고려할 요인들 없는지 면밀히 살펴」 → 2차: 배당 Gross-up·배당세액공제 / 4대보험 반영한 과세표준 어림·직접 입력 /
     지역 재산분(60등급)·상한·최저 / 연금공제 결정세액 한도·사업자 / 퇴직 연금수령한도·원금 먼저 인출·수익률 / RIA 50% 공제 / 부양가족 100만·세대 합산·부부 동반 탈락 안내
     기본 화면은 그대로 필수 1~2칸 — 추가 칸은 「＋ 더 정확하게」를 눌러야 보임(adv)
   넣은 금액은 어디에도 저장·전송하지 않음(화면을 떠나면 사라짐) — 마지막에 고른 항목만 이 휴대폰에 기억.
   화면 연결: index.html go("tax") → hubView/hubInit (ux1116.js 와 같은 방식) · nav2.js GROUPS(tax · lab:1) · ux1112b.js LABS · gsearch.js MENU */
(function(){
  var D = document;
  var LAW = {
    asof: "2026년 기준",
    br: [[1400, .06], [5000, .15], [8800, .24], [15000, .35], [30000, .38], [50000, .40], [100000, .42], [Infinity, .45]],   // 종합소득세율(만원)
    local: 1.1,                 // 지방소득세 10% 포함
    finLine: 2000,              // 금융소득종합과세 기준
    wh: .14,                    // 이자·배당 원천징수(소득세)
    gross: .10,                 // 배당가산(Gross-up) — 국내 회사 배당 중 2,000만 초과분 · 같은 금액을 배당세액공제
    ins4: {np: .0475, npMax: (637 * 6 + 659 * 6) * .0475, ei: .009},   // 근로자 보험료 본인 부담: 국민연금 4.75%(기준소득월액 상한 1~6월 637만·7~12월 659만 → 연 369.36만) / 고용 0.9% / 건보는 hi 에서
    div: [[2000, .14], [30000, .20], [500000, .25], [Infinity, .30]],   // 고배당기업 배당 분리과세(2026~2028 지급분)
    hi: {rate: .0719, ltc: .9448 / 7.19, finIn: 1000, depLine: 2000, depLow: 1000, propMid: 54000, propMax: 90000, empFree: 2000, half: .5,
         cap: 4591740, floor: 20160, floorM: 28, propDed: 10000, pt: 211.5,   // 월 상한·지역 최저(소득월액 28만 이하)·재산 기본공제 1억·점수당 금액
         /* 재산보험료부과점수 60등급(시행령 별표 4 · 기본공제 뒤 금액 상한(만원), 점수) — 2022.9 이후 구간 고정, 점수당 금액만 해마다 바뀜 */
         grade: [[450,22],[900,44],[1350,66],[1800,97],[2250,122],[2700,146],[3150,171],[3600,195],[4050,219],[4500,244],[5020,268],[5590,294],[6220,320],[6930,344],[7710,365],[8590,386],[9570,412],[10700,439],[11900,465],[13300,490],
                 [14800,516],[16400,535],[18300,559],[20400,586],[22700,611],[25300,637],[28100,659],[31300,681],[34900,706],[38800,731],[43200,757],[48100,785],[53600,812],[59700,841],[66500,881],[74000,921],[82400,961],[91800,1001],[103000,1041],[114000,1091],
                 [127000,1141],[142000,1191],[158000,1241],[176000,1291],[196000,1341],[218000,1391],[242000,1451],[270000,1511],[300000,1571],[330000,1641],[363000,1711],[399300,1781],[439230,1851],[483153,1921],[531468,1991],[584615,2061],[643077,2131],[707385,2201],[778124,2271],[Infinity,2341]]},
    pen: {save: 600, all: 900, wageLine: 5500, incLine: 4500, hiRate: .165, loRate: .132, isaRate: .1, isaMax: 300},
    pay: {line: 1500, sep: .165, r: [[70, .055], [80, .044], [999, .033]], life: .033},
    ret: {keep: [[10, .7], [20, .6], [999, .5]]},                       // 연금 수령 연차별 내는 비율(20년 초과 50%는 2026~)
    ovs: {ded: 250, rate: .22, ria: .5},   // RIA(국내시장 복귀계좌) 2026년 8~12월 결제분 공제율 50% · 2026년 한시
    isa: {free: {n: 200, s: 400}, rate: .099, normal: .154}
  };
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function prog(x, br){ var t = 0, lo = 0; x = Math.max(0, x); for (var i = 0; i < br.length; i++){ var hi = br[i][0]; if (x > lo) t += (Math.min(x, hi) - lo) * br[i][1]; lo = hi; } return t; }
  function itax(x){ return prog(x, LAW.br); }
  function mrate(x){ for (var i = 0; i < LAW.br.length; i++) if (x <= LAW.br[i][0]) return LAW.br[i][1]; return .45; }
  function wageDed(w){ var d = w <= 500 ? w * .7 : w <= 1500 ? 350 + (w - 500) * .4 : w <= 4500 ? 750 + (w - 1500) * .15 : w <= 10000 ? 1200 + (w - 4500) * .05 : 1475 + (w - 10000) * .02; return Math.min(d, 2000, w); }
  function penDed(p){ var d = p <= 350 ? p : p <= 700 ? 350 + (p - 350) * .4 : p <= 1400 ? 490 + (p - 700) * .2 : 630 + (p - 1400) * .1; return Math.min(d, 900, p); }
  /* 금액 표시 — 넣는 단위는 만원 */
  function won(x){ if (Math.abs(x) < 0.05) return "0원"; var neg = x < 0; x = Math.abs(x); var s;
    if (x >= 9999.5){ var m = Math.round(x), uk = Math.floor(m / 10000), r = m % 10000; s = uk.toLocaleString() + "억" + (r ? " " + r.toLocaleString() + "만" : "") + " 원"; }
    else if (x >= 100) s = Math.round(x).toLocaleString() + "만 원";
    else s = (Math.round(x * 10) / 10).toLocaleString() + "만 원";
    return (neg ? "−" : "") + s; }
  function wonM(man){ return Math.round(man * 10000 / 10) * 10; }                    // 만원 → 원(10원 단위)
  function wn(v){ return v.toLocaleString() + "원"; }
  function pct(r, d){ return (r * 100).toFixed(d == null ? 1 : d).replace(/\.0$/, "") + "%"; }
  function ins4(w){ var I = LAW.ins4; return Math.min(w * I.np, I.npMax) + w * LAW.hi.rate / 2 * (1 + LAW.hi.ltc) + w * I.ei; }   // 근로자 보험료 본인 부담(만원) = 연금보험료공제 + 건강·고용보험료 특별소득공제 — 1년 내내 근무·비과세 급여 없음 가정
  function fl10(x){ return Math.floor(x / 10) * 10; }
  function propPts(base){ var x = (base || 0) - LAW.hi.propDed; if (x <= 0) return 0; var G = LAW.hi.grade; for (var i = 0; i < G.length; i++) if (x <= G[i][0]) return G[i][1]; return 2341; }
  /* 지역가입자 월 보험료(원): 소득분(소득월액 28만 이하는 최저보험료) + 재산분, 상한, 장기요양 포함 → {inc, prop, tot} */
  function hiLocal(yearMan, propBase){ var H = LAW.hi, m = Math.max(0, yearMan) / 12, inc = m <= H.floorM ? H.floor : m * 10000 * H.rate, pr = propPts(propBase) * H.pt, sum = inc + pr, k = sum > H.cap ? H.cap / sum : 1;
    var hi = fl10(Math.min(sum, H.cap)), tot = hi + fl10(hi * H.ltc), a = sum > 0 ? Math.round(tot * inc / sum / 10) * 10 : 0;   // 건보료·장기요양 각각 10원 미만 버림(공단 방식)
    return {inc: a, prop: tot - a, tot: tot}; }
  function hiExtra(yearMan){ var H = LAW.hi; var hi = fl10(Math.min(H.cap, Math.max(0, yearMan) / 12 * 10000 * H.rate)); return hi + fl10(hi * H.ltc); }   // 직장가입자 소득월액 보험료(월 · 원)

  /* ───────── 결과 그리기 도구 ───────── */
  function big(lab, val, sub, tone){ return '<div class="tx-big' + (tone ? " tx-" + tone : "") + '"><small>' + lab + '</small><b>' + val + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; }
  function bars(rows){ var mx = 0; rows.forEach(function(r){ if (r[1] > mx) mx = r[1]; });
    return '<div class="tx-bars">' + rows.map(function(r){ var w = mx > 0 ? Math.max(r[1] > 0 ? 3 : 0, r[1] / mx * 100) : 0;
      return '<div class="tx-b' + (r[3] ? " tx-best" : "") + '"><span>' + r[0] + '</span><i><u style="width:' + w.toFixed(1) + '%"></u></i><b>' + (r[2] || won(r[1])) + '</b></div>'; }).join("") + '</div>'; }
  function tips(t, a){ a = a.filter(Boolean); return a.length ? '<p class="tx-th">' + t + '</p><ul class="tx-tip">' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul>' : ''; }
  function basis(a){ return '<details class="tx-base"><summary>계산 기준 · 가정 보기</summary><ul>' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul></details>'; }
  function head(t, s){ return '<p class="hub-h">' + t + (s ? ' <small>' + s + '</small>' : '') + '</p>'; }

  /* ───────── 계산기 6개 ─────────
     field: {id, label, sub, req, ph, unit, max, on(v) 보일 조건, adv: 1 → 「더 정확하게」를 눌러야 보이는 칸} */
  var CALCS = [
    { k: "alarm", ic: "🚨", t: "2,000만 경보기", d: "금융소득 세금 + 건보료 한 번에",
      segs: [{id: "ins", label: "건강보험", opts: [["emp", "직장가입자"], ["dep", "피부양자"], ["loc", "지역가입자"]]}],
      fields: [
        {id: "fin", label: "이자·배당 합계", sub: "1년 · 세전", req: 1, ph: "예: 2500"},
        {id: "wage", label: "연봉(총급여)", sub: "세전", ph: "예: 8000", on: function(v){ return v.ins === "emp"; }},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "예: 1200", on: function(v){ return v.ins !== "emp"; }},
        {id: "dv", label: "그중 국내 회사 주식 배당", sub: "ETF·펀드·해외·이자는 빼고", ph: "선택", adv: 1},
        {id: "hd", label: "그중 고배당기업 배당", sub: "분리과세 신청할 수 있는 배당", ph: "선택", adv: 1},
        {id: "biz", label: "사업·임대 등 다른 소득", sub: "경비 뺀 금액", ph: "선택", adv: 1, on: function(v){ return v.ins !== "dep"; }},
        {id: "prop", label: "재산세 과세표준", sub: "주택은 공시가의 약 60%", ph: "선택", adv: 1, on: function(v){ return v.ins !== "emp"; }},
        {id: "tb", label: "다른 소득의 과세표준", sub: "원천징수영수증에 있는 값 · 알면 직접", ph: "선택", adv: 1}
      ],
      run: function(v){
        var F = v.fin || 0; if (!F) return null;
        var H = LAW.hi, HD = Math.min(v.hd || 0, F), DV = Math.min(F, Math.max(v.dv || 0, HD)), ins = v.ins, wage = v.wage || 0, pen = v.pen || 0, biz = ins === "dep" ? 0 : (v.biz || 0), prop = ins === "emp" ? 0 : (v.prop || 0);
        var est = Math.max(0, (ins === "emp" ? Math.max(0, wage - wageDed(wage) - ins4(wage)) : Math.max(0, pen - penDed(pen))) + biz - 150), O = v.tb ? v.tb : est;
        /* 금융소득 f(그중 Gross-up 대상 국내 배당 d)에 붙는 소득세 — 2,000만 초과분만 합산 · 배당가산 10% 더했다가 같은 금액을 세액공제 · 14% 원천징수세액보다 작을 수 없음 */
        function ft(f, d){ if (f <= LAW.finLine) return f * LAW.wh;
          var ex = f - LAW.finLine, g = Math.min(d, ex) * LAW.gross;
          return Math.max(itax(O + ex + g) + LAW.finLine * LAW.wh - g, itax(O) + f * LAW.wh) - itax(O); }
        var gen = ft(F, DV) * LAW.local, wh = F * LAW.wh * LAW.local, extra = Math.max(0, gen - wh), sep = HD > 0 ? (prog(HD, LAW.div) + ft(F - HD, DV - HD)) * LAW.local : null;
        var h = "", over = F > LAW.finLine;
        var mx = Math.min(4000, Math.max(3000, F * 1.15)), pos = Math.min(100, F / mx * 100);
        h += '<div class="tx-g"><div class="tx-gt"><u style="width:' + pos.toFixed(1) + '%" class="' + (over ? "r" : F > H.finIn ? "y" : "g") + '"></u>' +
          '<i class="up" style="left:' + (H.finIn / mx * 100).toFixed(1) + '%"><em>1,000만 · 건보료 선</em></i><i style="left:' + (LAW.finLine / mx * 100).toFixed(1) + '%"><em>2,000만 · 종합과세 선</em></i></div>' +
          '<p>지금 <b>' + won(F) + '</b> — ' + (over ? '2,000만 선을 <b class="tx-r">' + won(F - LAW.finLine) + '</b> 넘음' : F > H.finIn ? '2,000만 선까지 <b>' + won(LAW.finLine - F) + '</b> 남음' : '1,000만 선까지 <b>' + won(H.finIn - F) + '</b> 남음') + '</p></div>';
        /* ① 세금 */
        h += '<p class="tx-sec">① 세금</p>';
        if (!over) h += big("금융소득 세금", won(wh), "15.4% 떼고 끝 · 더 낼 세금 없음", "ok");
        else if (extra < 0.05) h += big("더 낼 세금", "0원", "종합과세 대상이지만 다른 소득이 적어 이미 뗀 15.4%(" + won(wh) + ")로 끝 · 5월 신고는 해야 함", "ok");
        else h += big("5월에 더 낼 세금", won(extra), "이미 뗀 " + won(wh) + " + 추가 " + won(extra) + " = 모두 " + won(gen) + " · 초과분에 붙는 세율 약 " + pct(mrate(O + F - LAW.finLine) * LAW.local), "bad");
        if (over && extra >= 0.05 && !v.dv && !v.hd) h += '<p class="tx-n tx-s">전부 이자·ETF 분배금으로 본 값 — 국내 회사 배당이 섞여 있으면 「더 정확하게」에 넣기 (배당세액공제로 세금이 줄어듦)</p>';
        if (sep != null && over){ var gain = gen - sep;
          h += bars([["그냥 종합과세", gen, null, gain <= 0.05], ["고배당 분리과세 신청", sep, null, gain > 0.05]]) +
            '<p class="tx-n">' + (gain > 0.05 ? '고배당 배당 ' + won(HD) + '을 분리과세로 신청하면 <b class="tx-a">' + won(gain) + '</b> 덜 냄 (5월 신고 때 신청서를 내야 적용)' : gain < -0.05 ? '다른 소득이 적어 분리과세를 고르면 오히려 <b class="tx-r">' + won(-gain) + '</b> 더 냄 — 신청하지 않는 쪽이 유리' : '이 경우는 분리과세를 골라도 세금 차이가 없음') + '</p>'; }
        else if (sep != null) h += '<p class="tx-n">2,000만 이하라 고배당 분리과세를 골라도 세금은 같음(14%)</p>';
        /* ② 건보료 */
        var Fh = F > H.finIn ? F : 0, msg = "", pp = propPts(prop);
        h += '<p class="tx-sec">② 건강보험료</p>';
        if (ins === "emp"){ var ext = Fh + biz, add = ext > H.empFree ? hiExtra(ext - H.empFree) : 0;
          h += add ? big("월급 말고 더 내는 건보료", "월 " + wn(add), "연 " + wn(add * 12) + " · 월급 외 소득 " + won(ext) + " 중 2,000만 넘는 " + won(ext - H.empFree) + "에 부과 · 전액 본인 부담", "bad")
                   : big("더 내는 건보료", "없음", "월급 외 소득 " + won(ext) + " — 2,000만 이하" + (F <= H.finIn && F > 0 ? " (이자·배당 1,000만 이하는 아예 안 봄)" : ""), "ok");
        } else if (ins === "dep"){ var tot = Fh + pen, why = [];
          if (tot > H.depLine) why.push("소득 합계 " + won(tot) + " — 2,000만 초과");
          if (prop > H.propMax) why.push("재산세 과세표준 " + won(prop) + " — 9억 초과");
          else if (prop > H.propMid && tot > H.depLow) why.push("재산 과표 5.4억~9억 구간인데 소득 " + won(tot) + " — 1,000만 초과");
          if (why.length){ var L = hiLocal(Fh + pen * H.half, prop);
            h += big("피부양자 탈락", "월 " + wn(L.tot) + (prop ? "" : " +α"), "지역가입자로 바뀜 · 연 " + wn(L.tot * 12) + (prop ? " · 소득분 " + wn(L.inc) + " + 재산분 " + wn(L.prop) : " · 소득분만 계산 — 집·땅이 있으면 「더 정확하게」에 재산세 과세표준을 넣어야 재산분까지 나옴"), "bad") +
              '<p class="tx-n">탈락 이유: ' + why.join(" · ") + '</p><p class="tx-n tx-s">부부는 한 사람만 소득 기준을 넘어도 둘 다 탈락 · 지역보험료는 같은 세대 가족의 소득·재산을 합쳐서 계산</p>';
          } else { var room = (prop > H.propMid ? H.depLow : H.depLine) - tot;
            h += big("피부양자 유지", "보험료 0원", "소득 합계 " + won(tot) + " · 기준선까지 " + won(room) + " 남음" + (F <= H.finIn ? " · 이자·배당 1,000만 이하는 0원으로 봄" : ""), "ok");
            if (F <= H.finIn && pen + H.finIn > (prop > H.propMid ? H.depLow : H.depLine)) msg = "⚠ 이자·배당이 1,000만을 1원이라도 넘으면 전액이 소득에 잡혀 바로 탈락함";
            h += '<p class="tx-n tx-s">배우자가 소득 기준을 넘으면 함께 탈락 · 사업자등록이 있고 사업소득이 있으면 금액과 상관없이 탈락</p>'; }
        } else { var N = hiLocal(Fh + pen * H.half + biz, prop), Lo = hiLocal(pen * H.half + biz, prop);
          h += big("지역 건보료", "월 " + wn(N.tot) + (prop ? "" : " +α"), "연 " + wn(N.tot * 12) + (prop ? " · 소득분 " + wn(N.inc) + " + 재산분 " + wn(N.prop) : " · 소득분만 — 재산분은 「더 정확하게」에 재산세 과세표준을 넣으면 나옴"), Fh ? "bad" : "ok");
          if (Fh) h += bars([["지금", N.tot, "월 " + wn(N.tot)], ["이자·배당 1,000만 이하면", Lo.tot, "월 " + wn(Lo.tot), 1]]) + '<p class="tx-n">이자·배당을 1,000만 이하로 맞추면 <b class="tx-a">연 ' + wn((N.tot - Lo.tot) * 12) + '</b> 줄어듦</p>';
          else if (F > 0) msg = "⚠ 이자·배당이 1,000만을 넘는 순간 전액이 잡혀 월 약 " + wn(hiLocal(H.finIn + pen * H.half + biz, prop).tot - Lo.tot) + " 이상 오름";
          h += '<p class="tx-n tx-s">같은 세대 가족의 소득·재산을 합쳐서 계산 — 본인 것만 넣었다면 실제는 더 많을 수 있음</p>'; }
        if (msg) h += '<p class="tx-n tx-w">' + msg + '</p>';
        h += tips("줄이는 방법 · 같이 볼 것", [
          F > H.finIn * .7 ? "이자·배당 나는 상품을 <b>ISA·연금저축·IRP</b> 안으로 — 그 안 수익은 2,000만·건보료 계산에서 빠짐" : "",
          F > H.finIn * .7 ? "<b>받는 해를 나누기</b> — ELS 상환·채권 만기·예금 만기가 한 해에 몰리지 않게 (ELS·펀드·국내 상장 해외 ETF 수익도 배당소득)" : "",
          over ? "<b>가족 명의로 나누기</b> — 배우자 6억·성인 자녀 5천만(10년)까지 증여세 없음 · 2,000만은 사람마다 따로 셈" : "",
          F > H.finIn * .7 ? "이자 대신 <b>매매차익이 큰 상품</b> — 국내 주식 차익·저쿠폰 채권의 차익은 금융소득에 안 들어감" : "",
          over ? "2,000만을 넘은 사람은 <b>가족의 연말정산 부양가족 공제에서 빠지고</b>, 3년간 ISA 새 가입이 막힘" : "",
          HD > 0 ? "고배당 분리과세 배당의 건보료: 법령에는 부과 근거가 있고 지금 실무는 분리과세 금융소득을 빼고 있음 — <b>공단 방침이 아직 확정 안내 전</b>이라 여기서는 포함해 계산(보수적)" : ""]);
        h += basis(["금융소득종합과세(소득세법 §14·§62): 2,000만 초과분만 다른 소득과 합쳐 누진세율(6~45% · §55) · 14% 원천징수세액과 비교해 큰 쪽 · 지방소득세 10% 포함",
          "다른 소득 과세표준 약 " + won(O) + (v.tb ? " (직접 넣은 값)" : " — " + (ins === "emp" ? "연봉 − 근로소득공제 − 국민연금·건강·고용보험료(법정 요율) − 본인 기본공제 150만" : "공적연금 − 연금소득공제 − 본인 기본공제 150만") + "으로 계산 = 다른 공제가 하나도 없을 때의 값 · 부양가족·카드 등 공제가 더 있으면 세금은 더 적음 → 원천징수영수증의 과세표준을 「과세표준」 칸에 넣으면 정확"),
          "국내 회사 배당은 2,000만 초과분에 10%를 더해(Gross-up · §17③) 계산한 뒤 같은 금액을 세액공제(§56) — 「국내 회사 주식 배당」 칸에 넣은 금액만 반영 · 2,000만은 이자·ETF 분배금부터 채운다고 봄",
          "해외 주식 배당은 현지에서 뗀 세금(미국 15%)을 외국납부세액으로 빼 줌 — 여기서는 국내와 같이 15.4%를 뗐다고 봄",
          "고배당 분리과세: 2,000만 이하 14% · 3억 이하 20% · 50억 이하 25% · 초과 30% · 신청하면 그 배당은 2,000만 판정에서도 빠짐 · 2026년 1월 1일 이후 받은 배당부터(한시) · 고배당기업 여부는 거래소 KIND 공시 (국세청 2026.3.9)",
          "건보료율 7.19% + 장기요양(0.9448% ÷ 7.19% = 건보료의 약 13.14%) · 이자·배당은 1,000만 초과 시 전액 · 공적연금은 자격 판정 100%, 보험료 계산 50%(시행규칙 §44) · 월 상한 4,591,740원 · 지역 최저 20,160원(소득월액 28만 이하)",
          "재산분(시행령 별표 4): (재산세 과세표준 − 1억) → 60등급 점수 × 211.5원 · 전월세는 (보증금+월세×40)×30%를 재산으로 봄(여기서는 넣은 과세표준만)",
          "피부양자(시행규칙 별표 1의2): 소득 합계 2,000만 이하 · 재산 과표 5.4억 이하(9억 이하는 소득 1,000만 이하) · 부부 모두 충족 · 사업소득 요건(등록 시 1원 · 미등록 500만 초과 · 주택임대는 금액 무관)은 따로 확인",
          "건보료는 올해 소득이 내년 11월 ~ 그다음 해 10월 보험료에 반영됨(시행령 §41)"]);
        return h; } },

    { k: "pen", ic: "🏦", t: "연금 세액공제", d: "연금저축·IRP 넣으면 얼마 환급",
      segs: [{id: "who", label: "소득 종류", opts: [["emp", "근로자"], ["biz", "사업자·기타"]]}],
      fields: [
        {id: "wage", label: "연봉(총급여)", sub: "세전", req: 1, ph: "예: 7000", on: function(v){ return v.who !== "biz"; }},
        {id: "inc", label: "종합소득금액", sub: "수입 − 경비", req: 1, ph: "예: 6000", on: function(v){ return v.who === "biz"; }},
        {id: "save", label: "연금저축 올해 넣은(넣을) 돈", ph: "예: 400"},
        {id: "irp", label: "IRP 올해 넣은(넣을) 돈", sub: "본인 추가 납입분 · DC 추가 납입 포함", ph: "예: 0"},
        {id: "isa", label: "ISA 만기 → 연금으로 옮긴 돈", ph: "선택", adv: 1},
        {id: "det", label: "작년 결정세액(소득세)", sub: "원천징수영수증 · 알면 직접", ph: "선택", adv: 1}
      ],
      run: function(v){
        var P = LAW.pen, emp = v.who !== "biz", w = emp ? (v.wage || 0) : (v.inc || 0); if (!w) return null;
        var s = v.save || 0, ir = v.irp || 0, isa = v.isa || 0, rate = (emp ? w <= P.wageLine : w <= P.incLine) ? P.hiRate : P.loRate;
        var sOk = Math.min(s, P.save), base = Math.min(sOk + ir, P.all), isaOk = Math.min(isa * P.isaRate, P.isaMax), tot = base + isaOk, back = tot * rate, room = P.all - base, lost = s - sOk;
        /* 낸 세금(결정세액)보다 많이는 못 돌려받음 — 근로자만 어림 */
        var cap = null; if (emp){ var b0 = Math.max(0, w - wageDed(w) - ins4(w) - 150), c0 = itax(b0), wc = Math.min(c0 <= 130 ? c0 * .55 : 71.5 + (c0 - 130) * .3, w <= 3300 ? 74 : w <= 7000 ? Math.max(66, 74 - (w - 3300) * .008) : w <= 12000 ? Math.max(50, 66 - (w - 7000) * .5) : Math.max(20, 50 - (w - 12000) * .5));
          cap = Math.max(0, c0 - wc) * LAW.local; }
        if (v.det) cap = v.det * LAW.local;
        var real = cap != null ? Math.min(back, cap) : back, cut = cap != null && back > cap + 0.05;
        var h = big("돌려받는 세금", won(real), "공제 대상 " + won(tot) + " × " + pct(rate) + (isaOk ? " (ISA 전환분 " + won(isaOk) + " 포함)" : "") + (cut ? " = " + won(back) + "이지만 낸 세금이 그보다 적음" : ""), real > 0 ? "ok" : "");
        if (cut) h += '<p class="tx-n tx-w">⚠ ' + (v.det ? '넣은 결정세액 기준으로 1년에 내는 세금이 ' + won(cap) + '(지방소득세 포함)이라 그 이상은 못 돌려받음.' : '이 연봉에서 1년에 내는 세금은 많아야 ' + won(cap) + ' — 그 이상은 못 돌려받음. 부양가족·카드 공제가 있으면 더 적으니 원천징수영수증의 「결정세액」을 「더 정확하게」에 넣어 확인.') + ' 공제 못 받은 납입액은 다음 해로 넘겨 공제받거나 나중에 세금 없이 찾을 수 있음</p>';
        h += '<div class="tx-lim"><div class="tx-lt"><u style="width:' + (base / P.all * 100).toFixed(1) + '%"></u><i style="left:' + (P.save / P.all * 100).toFixed(1) + '%"><em>연금저축만 600만</em></i></div><p>한도 900만 중 <b>' + won(base) + '</b> 채움' + (room > 0 ? ' · <b class="tx-a">' + won(room) + '</b> 더 넣을 수 있음' : ' · 한도 다 채움') + '</p></div>';
        if (room > 0 && !cut){ var more = cap != null ? Math.min(back + room * rate, cap) : back + room * rate;
          h += bars([["지금", real], ["한도까지 채우면", more, null, 1]]) + '<p class="tx-n">' + won(room) + ' 더 넣으면 <b class="tx-a">' + won(more - real) + '</b> 더 돌려받음 (12월 31일 입금분까지)' + (cap != null && back + room * rate > cap + 0.05 ? ' — 낸 세금 한도(약 ' + won(cap) + ')에 걸려 다 채워도 여기까지' : '') + '</p>'; }
        h += tips("체크", [
          lost > 0 ? "연금저축 " + won(s) + " 중 <b>600만 넘는 " + won(lost) + "은 공제 안 됨</b> — 그만큼은 IRP로 넣어야 공제됨" : "",
          emp && w > P.wageLine && w <= P.wageLine * 1.06 ? "연봉이 5,500만을 조금 넘어 공제율이 13.2% — 5,500만 이하면 16.5%" : "",
          "맞벌이는 <b>공제율 16.5%인 쪽(연봉 5,500만 이하)</b>이 넣는 게 유리 — 단, 낸 세금이 충분한지 먼저 확인",
          !isa ? "ISA 만기 자금을 60일 안에 연금계좌로 옮기면 옮긴 돈의 10%(최대 300만)를 한도와 별도로 더 공제" : "",
          "받을 때는 연금소득세 3.3~5.5% — 지금 13.2~16.5% 돌려받고 나중에 낮은 세율로 내는 구조 · 55세 전에 깨면 16.5%"]);
        h += basis(["공제율(소득세법 §59의3): 총급여 5,500만 이하(근로소득만) · 종합소득금액 4,500만 이하 15% · 초과 12% — 지방소득세 10%를 더해 16.5% · 13.2%",
          "한도: 연금저축 600만 · IRP 합쳐 900만 · 넣는 것 자체는 연 1,800만까지",
          v.det ? "낸 세금 한도 = 넣은 결정세액 " + won(v.det) + " + 지방소득세 10%" : emp ? "낸 세금 한도(" + won(cap) + ") = 연봉 − 근로소득공제(§47) − 국민연금·건강·고용보험료(법정 요율) − 본인 기본공제 150만 → 산출세액 − 근로소득세액공제(§59) · 다른 공제가 하나도 없을 때의 최대치 · 실제는 원천징수영수증 「결정세액」" : "사업자는 낸 세금(결정세액) 한도를 넣은 값으로만 봄 — 종합소득세 결정세액보다 많이는 못 돌려받음",
          "회사가 넣어 주는 퇴직연금(DB·DC 회사 부담분)은 해당 없음"]);
        return h; } },

    { k: "ret", ic: "🧳", t: "퇴직소득세", d: "한 번에 vs 연금 · 중간정산 합산",
      segs: [{id: "mid", label: "퇴직금 중간정산 받은 적", opts: [["n", "없음"], ["y", "있음"]]}],
      fields: [
        {id: "pay", label: "퇴직금", sub: "이번에 받는 돈 · 세전 · 명예퇴직금·위로금 포함", req: 1, ph: "예: 30000"},
        {id: "yrs", label: "근속연수", unit: "년", req: 1, ph: "예: 25", max: 60, on: function(v){ return v.mid !== "y"; }},
        {id: "yrs2", label: "중간정산 다음 날부터 근속", sub: "1년 안 되는 달은 1년으로", unit: "년", req: 1, ph: "예: 10", max: 60, on: function(v){ return v.mid === "y"; }},
        {id: "mpay", label: "중간정산 때 받은 퇴직금", sub: "원천징수영수증 「퇴직급여」", req: 1, ph: "예: 16000", on: function(v){ return v.mid === "y"; }},
        {id: "myr", label: "중간정산 때 근속연수", sub: "원천징수영수증 「근속연수」", unit: "년", req: 1, ph: "예: 23", max: 60, on: function(v){ return v.mid === "y"; }},
        {id: "mtax", label: "중간정산 때 낸 퇴직소득세", sub: "원천징수영수증 「퇴직소득세」 · 지방소득세 빼고 · 홈택스 지급명세서에도 있음", req: 1, ph: "예: 492", on: function(v){ return v.mid === "y"; }},
        {id: "mon", label: "입사일 ~ 퇴직일 전체 개월 수", sub: "두 기간이 겹치거나 끊긴 달이 있으면 · 겹친 달은 한 번만", unit: "개월", ph: "선택", max: 720, adv: 1, on: function(v){ return v.mid === "y"; }},
        {id: "span", label: "연금으로 나눠 받을 기간", unit: "년", ph: "기본 20", max: 50},
        {id: "ror", label: "IRP 예상 수익률", sub: "1년 · 넣으면 원금이 빨리 나오는 것까지 계산", unit: "%", ph: "선택", max: 15, adv: 1}
      ],
      run: function(v){
        var mid = v.mid === "y", p = v.pay || 0, n = Math.ceil((mid ? v.yrs2 : v.yrs) || 0); if (!p || !n) return null;
        var mp = v.mpay || 0, my = Math.ceil(v.myr || 0), mt = v.mtax || 0; if (mid && (!mp || !my || !v.mtax)) return null;
        var Y = Math.max(1, Math.round(v.span || 20)), r = (v.ror || 0) / 100;
        /* 퇴직소득세(국세 · 만원) — 소득세법 §48·§55 · 국세청 「퇴직소득세 계산방법」(2020년 이후 퇴직 · 근속연수공제는 2023년 이후 표) */
        function rt(pp, nn){ var a = nn <= 5 ? 100 * nn : nn <= 10 ? 500 + 200 * (nn - 5) : nn <= 20 ? 1500 + 250 * (nn - 10) : 4000 + 300 * (nn - 20), c = Math.max(0, pp - a) * 12 / nn,
            b = c <= 800 ? c : c <= 7000 ? 800 + (c - 800) * .6 : c <= 10000 ? 4520 + (c - 7000) * .55 : c <= 30000 ? 6170 + (c - 10000) * .45 : 15170 + (c - 30000) * .35, q = Math.max(0, c - b);
          return {d1: a, conv: c, d2: b, base: q, t: itax(q) * nn / 12, n: nn, p: pp}; }
        var R = rt(p, n), M = null, N = 0, addT = 0, useM = false;
        if (mid){ N = v.mon ? Math.ceil(v.mon / 12) : n + my;   // 정산 근속 = 두 근속 월수 합 − 중복 월수 (1년 미만 올림) — 시행령 §203 · 국세청 「퇴직소득 세액정산」
          M = rt(p + mp, N); addT = Math.max(0, M.t - mt); useM = addT < R.t - 0.0005; }
        var tax = (useM ? addT : R.t) * LAW.local, d1 = (useM ? M : R).d1, conv = (useM ? M : R).conv, d2 = (useM ? M : R).d2, base = (useM ? M : R).base;
        function keep(k){ for (var j = 0; j < LAW.ret.keep.length; j++) if (k <= LAW.ret.keep[j][0]) return LAW.ret.keep[j][1]; return .5; }
        /* yy년 동안 매년 같은 금액을 받는다고 보고 한 해씩 계산: 퇴직금 원금이 먼저 나옴 · 10년째까지는 연금수령한도(잔액÷(11−연차)×120%) 안만 감면 · 한도 넘는 부분은 감면 없음 */
        function sim(yy){ var bal = p, pr = p, t = 0, A = r > 0 ? p * r / (1 - Math.pow(1 + r, -yy)) : p / yy, done = 0, xs = 0;
          for (var k = 1; k <= yy && bal > 0.001; k++){ var wd = k === yy ? bal : Math.min(A, bal), lim = k <= 10 ? bal / (11 - k) * 1.2 : Infinity, q = Math.min(wd, lim);
            var a = Math.min(pr, q); t += tax * a / p * keep(k); pr -= a;
            var b = Math.min(pr, wd - q); if (b > 0.001){ t += tax * b / p; pr -= b; xs += b; }
            if (pr <= 0.001 && !done) done = k;
            bal = (bal - wd) * (1 + r); }
          return {tax: t, done: done || yy, A: A, xs: xs}; }
        var rows = [["한 번에 받기", tax, null, 0]], seen = {}, S = sim(Y);
        [10, 20, 30, Y].sort(function(a, b){ return a - b; }).forEach(function(y){ if (seen[y]) return; seen[y] = 1; rows.push([y + "년 연금", y === Y ? S.tax : sim(y).tax, null, 0]); });
        var mn = rows.reduce(function(a, x){ return x[1] < a[1] ? x : a; }, rows[0]); mn[3] = 1;
        /* 11/17 사용자 「퇴직소득세 항목에서 금액·세율 순이 아니라 반대로 — 세율을 더 강조」 → 이번 퇴직금 대비 실효세율을 크게, 금액은 작게 */
        function er(t){ var x = p ? t / p : 0; return pct(x, x > 0 && x < .01 ? 2 : 1); }
        function rw(t){ return er(t) + ' <small class="tx-am">' + won(t) + '</small>'; }
        rows.forEach(function(x){ x[2] = rw(x[1]); });
        var h = "";
        if (mid){ var sepT = R.t * LAW.local, mrgT = addT * LAW.local, gap = sepT - mrgT;
          h += big((useM ? "합산 특례 세율" : "이번 퇴직금 세율") + " · 실효", er(tax), "세금 " + won(tax) + (useM ? " · 따로 계산하면 " + er(sepT) + "(" + won(sepT) + ") → " + er(gap) + "p 낮춤 · " + won(gap) + " 덜 냄" : " · 합산 특례가 오히려 불리 — 따로 계산이 유리"), tax > 0 ? "bad" : "ok") +
            bars([["따로 계산 (중간정산 뒤 " + n + "년만)", sepT, rw(sepT), !useM], ["합산 특례 (" + N + "년 · 퇴직금 " + won(p + mp) + ")", mrgT, rw(mrgT), useM]]) +
            '<p class="tx-n">합산 특례: 두 퇴직금을 합쳐 ' + N + '년으로 계산한 세금 ' + won(M.t * LAW.local) + ' − 중간정산 때 낸 ' + won(mt * LAW.local) + '(지방소득세 포함) = ' + won(mrgT) + '</p>';
          if (M.t < mt - 0.05) h += '<p class="tx-n tx-s">합쳐 계산한 세금이 그때 낸 세금보다 적어도 차액은 돌려받지 못함(추가 0원) — 중간정산금을 IRP로 옮겨 세금을 미뤄 둔 경우만 일부 환급(시행령 §203②)</p>';
          if (useM) h += '<p class="tx-n">회사에 <b>중간정산 때 원천징수영수증을 내며 정산을 요청</b>해야 적용 — 안 내면 회사는 따로 계산으로 뗌 (소득세법 §148)</p>';
          h += '<p class="tx-sec">이번 퇴직금 ' + won(p) + ' — 한 번에 vs 연금</p>'; }
        h += big((mid ? "한 번에 받으면" : "한 번에 받으면 세율") + " · 실효", er(tax), "세금 " + won(tax) + " · 실제 받는 돈 " + won(p - tax), tax > 0 ? "bad" : "ok");
        if (tax > 0.05){ h += bars(rows) + '<p class="tx-n">IRP로 옮겨 ' + Y + '년 동안 나눠 받으면 세율 <b class="tx-a">' + er(tax) + ' → ' + er(S.tax) + '</b> (' + pct(1 - S.tax / tax, 0) + ' 감면) — 세금 ' + won(S.tax) + ', ' + won(tax - S.tax) + ' 덜 냄</p>';
          h += '<p class="tx-n">세전 연 ' + won(S.A) + ' · 월 ' + won(S.A / 12) + ' 꼴' + (r > 0 ? ' (수익률 ' + pct(r) + ' 가정)' : ' (운용 수익 빼고)') + '</p>';
          if (S.xs > 0.05) h += '<p class="tx-n tx-w">⚠ ' + Y + '년은 너무 짧음 — 처음 10년은 해마다 찾을 수 있는 한도가 있어 넘는 ' + won(S.xs) + '은 감면을 못 받음. 한도 안에서만 받으려면 10년 이상으로</p>';
          if (r > 0 && S.done < Y) h += '<p class="tx-n">퇴직금 원금은 <b>' + S.done + '년째</b>에 다 나옴 — 그 뒤 ' + (Y - S.done) + '년은 운용 수익을 받는 것이라 연금소득세(3.3~5.5%)가 붙고 <b>연 1,500만 계산에 들어감</b></p>'; }
        else h += '<p class="tx-n">근속연수 공제가 커서 세금이 거의 없음 — 한 번에 받아도 부담 없음</p>';
        h += tips("체크", [
          tax > 0.05 ? "받는 연차가 길수록 유리 — 1~10년째 30% · 11~20년째 40% · <b>21년째부터 50%</b> 감면(2026년 수령분부터)" : "",
          tax > 0.05 ? "연차는 <b>실제로 받은 해</b>만 셈 — 55세에 최소 금액이라도 받기 시작하면 연차가 먼저 쌓임" : "",
          tax > 0.05 ? "IRP로 옮기면 세금을 나중에 내므로 <b>세금 낼 돈까지 굴릴 수 있음</b> (과세이연) · 받은 뒤 60일 안에 넣어도 됨" : "",
          "55세 이후 · 연금수령한도 안에서 받아야 감면 — 중간에 한꺼번에 찾으면 남은 세금을 그때 다 냄",
          "퇴직금 원금으로 받는 연금은 <b>연 1,500만 한도와 상관없고</b> 금융소득·건보료에도 안 잡힘 — 운용 수익과 세액공제 받은 돈은 한도에 들어가니 계좌를 따로 두면 관리가 쉬움"]);
        h += basis([(mid ? (useM ? "합산 특례로 계산(퇴직금 " + won(p + mp) + " · " + N + "년) — " : "따로 계산(퇴직금 " + won(p) + " · " + n + "년) — ") : "") + "2023년 이후 퇴직 기준(소득세법 §48 · 국세청 퇴직소득세 계산방법) — 근속연수공제 " + won(d1) + " → 환산급여 " + won(conv) + " → 환산급여공제 " + won(d2) + " → 과세표준 " + won(base),
          mid ? "중간정산 뒤 퇴직하면 근속연수는 중간정산 다음 날부터 셈(국세청 원천세과-233) · 합산 특례(소득세법 §148·시행령 §203): 이미 받은 퇴직금과 합쳐 세금을 다시 계산한 뒤 그때 낸 세금을 뺌 · 정산 근속 = 두 근속 월수 합 − 겹친 월수(1년 미만 올림)" + (v.mon ? "" : " — 여기서는 두 근속연수를 더함(각각 올림한 연수라 실제보다 최대 1년 길 수 있음 → 「더 정확하게」에 전체 개월 수)") : "",
          mid ? "중간정산 때 낸 세금은 넣은 값(당시 세법) 그대로 빼고, 합산 세금은 지금 세법(2023년 이후 근속연수공제)으로 계산 · 명예퇴직금처럼 처음 입사일부터 근속을 세는 퇴직금이 섞이면 겹친 기간 처리가 달라짐(국세청 서면1팀-510)" : "",
          "세액 = 과세표준 × 기본세율(6~45%) × 근속연수 ÷ 12 · 지방소득세 10% 포함 · 근속 1년 미만은 1년으로 올림",
          "연금 수령: 해마다 같은 금액 · 연금 계좌에서는 세액공제 안 받은 돈 → 퇴직금 → 세액공제 받은 돈·수익 순서로 나옴 · IRP에 퇴직금만 있다고 봄",
          "연금수령한도(시행령 §40의2) = 그해 1월 1일 계좌 평가액 ÷ (11 − 연금수령연차) × 120% · 11년차부터 한도 없음 · 한도 연차는 55세 이후 「받을 수 있게 된 해」부터 안 받아도 올라감(2013년 3월 전 계좌는 6년차부터) — 여기서는 받기 시작한 해를 1년차로 봄(가장 불리한 경우)",
          "감면 70·60·50%는 「실제로 받은 해」만 세는 연차 기준(국세청 연금소득 원천징수 방법 · 20년 초과 50%는 2026.1.1 이후 수령분)",
          "IRP 운용 수익에 붙는 세금과 수수료는 뺐음 · 임원 퇴직금 한도 초과분·비과세 퇴직급여는 안 넣음"].filter(Boolean));
        return h; } },

    { k: "pay", ic: "👵", t: "연금 받을 때 세금", d: "1,500만 선 · 얼마씩 받을까",
      segs: [{id: "life", label: "받는 방식", opts: [["n", "기간 정해서"], ["y", "종신형"]]}],
      fields: [
        {id: "age", label: "받는 나이", unit: "세", req: 1, ph: "예: 60", max: 110},
        {id: "amt", label: "연금저축·IRP에서 받는 돈", sub: "1년 · 세액공제 받은 돈+수익 · 퇴직금 원금은 빼고", req: 1, ph: "예: 1800"},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "선택", adv: 1},
        {id: "oth", label: "그 밖의 소득", sub: "사업·임대·근로 소득금액", ph: "선택", adv: 1}
      ],
      run: function(v){
        var P = LAW.pay, age = v.age || 0, A = v.amt || 0; if (!age || !A) return null;
        var pub = v.pen || 0, oth = v.oth || 0, r = P.r[0][1];
        for (var i = 0; i < P.r.length; i++) if (age < P.r[i][0]){ r = P.r[i][1]; break; }
        if (v.life === "y") r = Math.min(r, P.life);
        var h = "", low = Math.min(A, P.line) * r;
        if (age < 55) h += '<p class="tx-n tx-w">⚠ 55세 전에는 연금으로 못 받음 — 찾으면 기타소득세 16.5%</p>';
        if (A <= P.line){
          h += big("연금 세금", won(A * r), pct(r) + "만 떼고 끝 · 실제 받는 돈 월 " + won((A - A * r) / 12), "ok") +
            '<div class="tx-lim"><div class="tx-lt"><u style="width:' + (A / P.line * 100).toFixed(1) + '%"></u></div><p>1,500만 선까지 <b>' + won(P.line - A) + '</b> 남음 (월 ' + won(P.line / 12) + '까지 낮은 세율)</p></div>';
        } else {
          var b0 = Math.max(0, pub - penDed(pub) + oth - 150), b1 = Math.max(0, pub + A - penDed(pub + A) + oth - 150);
          var sep = A * P.sep, tot = (itax(b1) - itax(b0)) * LAW.local, best = Math.min(sep, tot);
          h += big("연금 세금", won(best), "1,500만을 " + won(A - P.line) + " 넘어 낮은 세율(" + pct(r) + ")을 못 씀 · " + (tot < sep ? "종합과세" : "16.5% 분리과세") + "가 유리", "bad");
          h += bars([["16.5% 분리과세", sep, null, sep <= tot], ["종합과세(다른 소득과 합산)", tot, null, tot < sep], ["1,500만까지만 받으면", low, null, 0]]);
          h += '<p class="tx-n">연 1,500만(월 125만)까지만 받으면 세금 ' + won(low) + ' — 지금보다 <b class="tx-a">' + won(best - low) + '</b> 덜 냄</p>';
          if (!pub && !oth) h += '<p class="tx-n tx-s">다른 소득이 없다고 본 값 — 국민연금·임대소득 등이 있으면 「더 정확하게」에 넣어야 종합과세 쪽이 맞게 나옴</p>';
        }
        h += tips("체크", [
          A > P.line ? "<b>1원이라도 넘으면 전액</b>이 높은 세율 — 받는 기간을 늘려 연 1,500만 이하로 맞추기" : "",
          "1,500만은 <b>연금저축·IRP 여러 계좌를 다 합쳐서</b> 셈 — 퇴직금 원금·세액공제 안 받은 원금·국민연금은 빠지고, 퇴직금을 굴려 생긴 수익은 들어감",
          v.life !== "y" && age < 80 ? "종신형으로 계약하면 나이와 상관없이 3.3% (2026년 수령분부터)" : "",
          age < 70 ? "늦게 받을수록 세율이 내려감 — 70세부터 4.4% · 80세부터 3.3%" : "",
          "해마다 찾을 수 있는 한도(연금수령한도)를 넘겨 찾은 돈은 연금이 아니라 <b>기타소득 16.5%</b>",
          "연금 받는 분이 <b>자녀의 부양가족 공제 대상</b>이면 종합과세를 고르지 말 것 — 분리과세로 끝내야 공제가 유지됨(종합과세면 연 약 517만 초과 수령 시 탈락)",
          "연금저축·IRP 연금은 지금은 건보료가 안 붙음(공적연금만 반영) — 제도가 바뀔 수 있음"]);
        h += basis(["사적연금(연금저축·IRP 중 세액공제 받은 돈과 운용 수익) 연 1,500만 이하(소득세법 §14③9): 70세 미만 5% · 80세 미만 4% · 80세 이상 3% · 종신형 3%(2026.1.1 이후 수령분) — 지방소득세 10%를 더해 5.5 · 4.4 · 3.3% · 겹치면 낮은 쪽",
          "1,500만 초과(§64의4): 전액을 15%(지방소득세 포함 16.5%) 분리과세 또는 종합과세 중 선택 — 종합과세는 연금소득공제(공적+사적 합쳐 최대 900만)와 본인 기본공제 150만만 반영한 어림",
          "국민연금은 2002년 이후 낸 보험료에서 나온 부분만 과세 대상 — 넣은 금액 전부를 과세 대상으로 보고 계산(보수적)",
          "의료비 등 부득이한 사유로 찾는 돈은 한도와 상관없이 3.3~5.5%"]);
        return h; } },

    { k: "ovs", ic: "🌎", t: "해외주식 양도세", d: "올해 얼마 · 손실로 줄이기",
      fields: [
        {id: "gain", label: "올해 판 종목의 이익 합계", sub: "원화 기준 · 수수료 뺀 뒤", req: 1, ph: "예: 3000"},
        {id: "loss", label: "올해 판 종목의 손실 합계", ph: "예: 500"},
        {id: "un", label: "아직 안 판 종목의 평가손실", sub: "연말 전에 팔 수 있는 것", ph: "선택"},
        {id: "ria", label: "그중 RIA 계좌에서 판(팔) 이익", sub: "국내시장 복귀계좌 · 2026년만", ph: "선택", adv: 1}
      ],
      run: function(v){
        var L = LAW.ovs, g = v.gain || 0; if (!g) return null;
        var l = Math.abs(v.loss || 0), u = Math.abs(v.un || 0), ria = Math.min(v.ria || 0, g), cut = ria * L.ria, net = g - l;
        var tax0 = Math.max(0, net - L.ded) * L.rate, tax = Math.max(0, net - cut - L.ded) * L.rate, tax2 = Math.max(0, net - u - cut - L.ded) * L.rate, riaOn = Date.now() < Date.UTC(2026, 11, 31, 15);
        var h = big("내년 5월에 낼 세금", won(tax), tax > 0 ? "순이익 " + won(net) + (cut ? " − RIA 공제 " + won(cut) : "") + " − 기본공제 250만 = " + won(net - cut - L.ded) + " × 22%" : "순이익 " + won(net) + (cut ? " − RIA 공제 " + won(cut) : "") + " — 250만 공제 안이라 세금 없음 (신고는 해야 함)", tax > 0 ? "bad" : "ok");
        if (cut > 0 && tax0 > tax) h += bars([["RIA 없이", tax0], ["RIA 공제 반영", tax, null, 1]]) + '<p class="tx-n">RIA 계좌에서 판 이익 ' + won(ria) + '의 50%를 공제받아 <b class="tx-a">' + won(tax0 - tax) + '</b> 덜 냄 — 판 돈을 1년간 RIA 안에서 국내 주식·펀드에 둬야 유지됨</p>';
        if (u > 0 && tax > 0) h += bars([["지금대로", tax], ["손실 종목도 팔면", tax2, null, 1]]) + '<p class="tx-n">평가손실 ' + won(u) + '을 올해 안에 팔아 확정하면 <b class="tx-a">' + won(tax - tax2) + '</b> 덜 냄 — 다시 사도 됨</p>';
        else if (tax > 0) h += '<p class="tx-n">손실 난 해외 종목이 있다면 올해 안에 팔아 이익과 상계 — 손실 100만마다 세금 22만 줄어듦</p>';
        else if (net - cut < L.ded && net > 0) h += '<p class="tx-n">공제가 <b class="tx-a">' + won(L.ded - (net - cut)) + '</b> 남음 — 이익 난 종목을 그만큼 팔았다 다시 사면 취득가를 세금 없이 높일 수 있음</p>';
        h += tips("체크", [
          "<b>결제일 기준</b> — 12월 마지막 주에 판 건 내년으로 넘어갈 수 있음 · 나라마다 마감일이 다르니 증권사 공지 확인",
          riaOn && !ria && tax > 0 ? "<b>RIA(국내시장 복귀계좌)</b>: 2025년 12월 23일에 갖고 있던 해외주식을 RIA로 옮겨 12월 31일(결제)까지 팔면 그 이익의 50% 공제 — 매도금액 5,000만 한도 · 판 돈은 1년간 국내 주식·펀드 · 다른 계좌에서 해외주식을 새로 사면 그만큼 깎임" : "",
          "250만 공제는 <b>1년에 한 번 · 사람마다</b> — 해외주식·국내 과세 주식(대주주·장외) 합쳐서",
          "배우자·자녀 계좌에서 판 이익(손실 뺀 뒤)이 <b>100만을 넘으면 연말정산 부양가족 공제에서 빠짐</b> — 250만이 아니라 100만이 기준",
          tax > 0 ? "배우자에게 증여(10년 6억 공제) 뒤 팔기는 <b>1년 넘게 가진 뒤 팔아야</b> 효과 있음 (2025년 증여분부터)" : "",
          "양도세는 금융소득 2,000만·건보료 계산에 안 들어감 · 배당은 따로 과세(미국 15% 현지 원천징수 · 금융소득에 포함)"]);
        h += basis(["세율 22% = 양도소득세 20% + 지방소득세 2% · 기본공제 연 250만(소득세법 §118의7)",
          "같은 해 해외주식끼리 이익·손실 합산 · 손실은 다음 해로 못 넘김",
          "이익은 판 날·산 날 각각의 환율로 원화 환산한 차이 — 환율이 올라 생긴 이익도 과세 · 같은 종목을 나눠 샀으면 증권사 방식(선입선출·이동평균)에 따라 이익이 달라짐",
          "RIA(조특법 §91의26): 공제액 = RIA 안 양도소득 × 공제율(결제일 5/31까지 100% · 7/31까지 80% · 12/31까지 50%) × 조정비율(다른 계좌에서 해외주식을 순매수하면 줄어듦) — 여기서는 12월 50%·조정 없음으로 계산",
          "세금이 없어도 신고 대상 · 신고·납부를 안 하면 무신고·납부지연 가산세가 붙음",
          "국내 상장 해외 ETF는 양도세가 아니라 배당소득세(15.4%) — 이 계산기 대상 아님"]);
        return h; } },

    { k: "isa", ic: "🧺", t: "ISA 절세", d: "일반 계좌보다 얼마 아끼나",
      segs: [{id: "kind", label: "가입 유형", opts: [["n", "일반형"], ["s", "서민형·농어민"]]}],
      fields: [
        {id: "pf", label: "만기까지 예상 순이익", sub: "이자·배당·ETF 분배금·해외 ETF 차익 (손실 뺀 뒤)", req: 1, ph: "예: 1000"},
        {id: "mv", label: "만기 때 연금계좌로 옮길 돈", ph: "선택", adv: 1}
      ],
      run: function(v){
        var I = LAW.isa, p = v.pf || 0; if (!p) return null;
        var free = I.free[v.kind === "s" ? "s" : "n"], n = p * I.normal, t = Math.max(0, p - free) * I.rate, mv = v.mv || 0, cr = Math.min(mv * LAW.pen.isaRate, LAW.pen.isaMax);
        var h = big("ISA로 아끼는 세금", won(n - t), "일반 계좌 " + won(n) + " → ISA " + won(t), "ok") + bars([["일반 계좌 (15.4%)", n], ["ISA", t, null, 1]]);
        h += '<p class="tx-n">' + won(Math.min(p, free)) + '까지 세금 0' + (p > free ? ' · 넘는 ' + won(p - free) + '은 9.9%로 끝' : ' — 비과세 한도 ' + won(free - p) + ' 남음') + '</p>';
        if (cr > 0) h += '<p class="tx-n">만기에 ' + won(mv) + '을 연금계좌로 옮기면 <b class="tx-a">' + won(cr * LAW.pen.loRate) + '~' + won(cr * LAW.pen.hiRate) + '</b> 추가 환급 (옮긴 돈의 10% · 최대 300만 공제)</p>';
        h += tips("체크", [
          "ISA 안 수익은 <b>금융소득 2,000만·건보료 계산에서 빠짐</b> — 9.9% 떼고 끝",
          "이익과 손실을 <b>합쳐서</b> 순이익에만 과세 — 일반 계좌는 이익에만 과세",
          "국내 주식·국내 주식형 ETF 매매차익은 원래 세금이 없어 ISA 효과가 없음 — 배당·이자·해외 ETF·ELS 쪽이 효과 큼",
          "비과세 한도는 <b>계좌를 닫을 때 한 번</b> 적용 — 3년 채운 뒤 해지하고 다시 가입하면 한도를 또 쓸 수 있음",
          "3년은 채워야 혜택(그 전에 깨면 15.4%) · 넣은 원금까지는 중간에 찾아도 됨",
          "직전 3년 안에 금융소득종합과세 대상이었으면 가입 불가"]);
        h += basis(["비과세 한도(조특법 §91의18): 일반형 200만 · 서민형·농어민형 400만 · 초과분 9.9% 분리과세 (지방소득세 포함)",
          "납입 한도: 연 2,000만 · 총 1억 (안 쓴 한도는 다음 해로 넘어감)",
          "일반 계좌 세율은 15.4%로 봄 — 해외 ETF 분배금의 현지 세금은 따로",
          "2026년 세제개편안(국회 심의 중)이 통과되면 2027년부터 한도 이월 폐지 · 총 계약 5년 · 국내 투자용 「생산적 금융 ISA」(연 2,000만·총 2억 · 이자·배당 전액 비과세)가 따로 생김 — 확정되면 이 계산기에 반영",
          "서민형: 총급여 5,000만(종합소득 3,800만) 이하"]);
        return h; } }
  ];

  /* ───────── 화면 ───────── */
  var ST = {};   // 항목별로 넣은 값(메모리에만)
  CALCS.forEach(function(c){ ST[c.k] = {}; (c.segs || []).forEach(function(s){ ST[c.k][s.id] = s.opts[0][0]; }); });
  function sel(){ var k = ls("txsel"); return CALCS.filter(function(c){ return c.k === k; })[0] || null; }
  function pickHtml(c0){ return '<div class="tx-pick">' + CALCS.map(function(c){ return '<button type="button" data-txk="' + c.k + '" data-j="txform"' + (c0 && c0.k === c.k ? ' class="on"' : '') + '><span>' + c.ic + '</span><b>' + c.t + '</b><small>' + c.d + '</small></button>'; }).join("") + '</div>'; }
  function formHtml(c){ var v = ST[c.k];
    return head(c.ic + " " + c.t, LAW.asof) +
      (c.segs || []).map(function(s){ return '<div class="tx-seg" role="group" aria-label="' + s.label + '"><em>' + s.label + '</em><div>' + s.opts.map(function(o){ return '<button type="button" data-txs="' + s.id + '" data-v="' + o[0] + '"' + (v[s.id] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join("") + '</div></div>'; }).join("") +
      (function(){ var show = c.fields.filter(function(f){ return !f.on || f.on(v); }), adv = show.filter(function(f){ return f.adv; }), open = v._adv || adv.some(function(f){ return v[f.id]; });
        function one(f){ return '<label class="tx-f"><span>' + f.label + (f.req && !f.sub ? '' : '<small>' + (f.req ? '' : '<s>선택</s>') + (f.sub || '') + '</small>') + '</span><i><input data-txf="' + f.id + '" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" maxlength="' + (f.unit ? 3 : 10) + '" placeholder="' + e(f.ph || "") + '" value="' + (v[f.id] ? (f.unit ? v[f.id] : Number(v[f.id]).toLocaleString()) : "") + '"><em>' + (f.unit || "만원") + '</em></i></label>'; }
        return show.filter(function(f){ return !f.adv; }).map(one).join("") +
          (adv.length ? (open ? '<p class="tx-advh">더 정확하게 <small>아는 것만 넣으면 됨</small></p>' + adv.map(one).join("") : '<button type="button" class="tx-adv" data-txadv="1">＋ 더 정확하게 <small>' + adv.map(function(f){ return f.label.replace(/^그중 /, ""); }).join(" · ") + '</small></button>') : ''); })() +
      '<button type="button" class="tx-clr" data-txclr="1">입력 지우기</button>';
  }
  function outHtml(c){ var h = null; try { h = c.run(ST[c.k]); } catch(x){ console.error("tax", x); h = '<p class="tx-n">계산하지 못했어요 — 숫자를 다시 확인해 주세요</p>'; }
    if (h == null){ var vv = ST[c.k], need = c.fields.filter(function(f){ return f.req && (!f.on || f.on(vv)); }).map(function(f){ return f.label; });
      return '<p class="tx-wait"><b>' + need.join(" · ") + '</b>만 넣으면 바로 계산돼요<small>나머지는 넣을수록 정확해져요 · 단위는 만원</small></p>'; }
    return head("결과", "넣는 즉시 다시 계산") + h; }
  function view(){ var c = sel();
    return '<div id="tx" data-noemo="1"><section class="card hub-c no-clp" data-cz="done" data-xc="1">' + head("세무계산기", "항목을 고르고 숫자만 넣으면 끝") + pickHtml(c) + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txform"' + (c ? '' : ' hidden') + '>' + (c ? formHtml(c) : '') + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txout"' + (c ? '' : ' hidden') + '>' + (c ? outHtml(c) : '') + '</section>' +
      '<p class="hub-n">' + LAW.asof + ' · 세율·공제·한도는 법령·국세청·건강보험공단 원문과 대조한 값 (2026-11-16)<br>개인별 공제·세대 합산은 넣은 값만 반영 — 신고 전 세무사·홈택스·공단 확인 · 넣은 금액은 저장되지 않아요</p></div>'; }
  function paintOut(){ var c = sel(), o = D.getElementById("txout"); if (c && o){ o.hidden = false; o.innerHTML = outHtml(c); } }
  function paintForm(){ var c = sel(), f = D.getElementById("txform"); if (c && f){ f.hidden = false; f.innerHTML = formHtml(c); } paintOut(); }
  function choose(k, scroll){ ls("txsel", k);
    [].forEach.call(D.querySelectorAll("#tx [data-txk]"), function(b){ b.classList.toggle("on", b.dataset.txk === k); });
    paintForm();
    if (scroll){ var f = D.getElementById("txform"); try { f.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} } }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#tx [data-txk], #tx [data-txs], #tx [data-txclr], #tx [data-txadv]"); if (!t) return;
    var c = sel();
    if (t.dataset.txk){ choose(t.dataset.txk, true); return; }
    if (!c) return;
    if (t.dataset.txs){ ST[c.k][t.dataset.txs] = t.dataset.v; paintForm(); return; }
    if (t.dataset.txadv){ ST[c.k]._adv = 1; paintForm(); return; }
    if (t.dataset.txclr){ var keep = {}; (c.segs || []).forEach(function(s){ keep[s.id] = ST[c.k][s.id]; }); ST[c.k] = keep; paintForm(); }
  });
  D.addEventListener("input", function(ev){
    var t = ev.target; if (!t || !t.dataset || !t.dataset.txf || !t.closest("#tx")) return;
    var c = sel(); if (!c) return;
    var f = c.fields.filter(function(x){ return x.id === t.dataset.txf; })[0] || {};
    var raw = String(t.value).replace(/[０-９]/g, function(ch){ return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); }).replace(/[^0-9]/g, ""), n = raw ? parseInt(raw, 10) : 0;
    if (f.max && n > f.max) n = f.max;
    ST[c.k][f.id] = n;
    var show = raw ? (f.unit ? String(n) : n.toLocaleString()) : ""; if (t.value !== show) t.value = show;
    paintOut();
  });
  D.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && ev.target && ev.target.dataset && ev.target.dataset.txf) ev.target.blur(); });

  /* 화면 연결 (index.html go → hubView/hubInit) */
  var V0 = window.hubView, I0 = window.hubInit;
  window.hubView = function(key){ if (key === "tax") return view(); return V0 ? V0(key) : ""; };
  window.hubInit = function(key){ if (key === "tax") return; if (I0) I0(key); };
  window.__tax = {calcs: CALCS, state: ST, law: LAW, choose: choose};   // 점검용

  var st = D.createElement("style");
  st.textContent =
    "html[data-tab=tax] #main>.hero{display:none!important}" +
    ".tx-pick{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".tx-pick button{font:inherit;text-align:left;color:var(--text);background:transparent;border:1px solid var(--line);border-radius:14px;padding:11px 12px 10px;cursor:pointer;display:flex;flex-direction:column;gap:1px;min-width:0}" +
    ".tx-pick button:active{transform:scale(.98)}.tx-pick button.on{border-color:#3182f6;background:rgba(49,130,246,.10);box-shadow:inset 0 0 0 1px #3182f6}" +
    ".tx-pick span{font-size:20px;line-height:1.2}.tx-pick b{font-size:15px;font-weight:800;letter-spacing:-.3px;word-break:keep-all}.tx-pick small{font-size:12.5px;color:var(--sub);line-height:1.35;word-break:keep-all}" +
    ".tx-seg{margin:0 0 12px}.tx-seg>em{display:block;font-style:normal;font-size:13px;font-weight:700;color:var(--sub);margin:0 2px 6px}.tx-seg>div{display:flex;gap:6px}" +
    ".tx-seg button{flex:1 1 0;min-width:0;font:inherit;font-size:14.5px;font-weight:700;padding:10px 4px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);cursor:pointer;word-break:keep-all}" +
    ".tx-seg button.on{background:#3182f6;border-color:#3182f6;color:#fff}" +
    ".tx-f{display:grid;grid-template-columns:minmax(0,1fr) 142px;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}" +
    ".tx-f>span{font-size:15px;font-weight:700;line-height:1.35;word-break:keep-all;min-width:0}.tx-f>span small{display:block;font-size:12.5px;font-weight:500;color:var(--sub)}.tx-f>span s{text-decoration:none;font-size:11.5px;font-weight:600;border:1px solid var(--line);border-radius:6px;padding:0 5px;margin-right:5px;white-space:nowrap}" +
    ".tx-f>i{font-style:normal;display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:12px;padding:0 10px;min-width:0}.tx-f>i:focus-within{border-color:#3182f6}" +
    ".tx-f input{flex:1;min-width:0;width:100%;font:inherit;font-size:17px;font-weight:700;text-align:right;padding:11px 0;border:0;outline:0;background:transparent;color:var(--text);font-variant-numeric:tabular-nums}.tx-f input::placeholder{font-size:13px;font-weight:500;color:var(--sub);opacity:.7}" +
    ".tx-f>i em{font-style:normal;font-size:13px;color:var(--sub);white-space:nowrap}" +
    ".tx-adv{display:block;width:100%;font:inherit;font-size:14.5px;font-weight:700;text-align:left;color:#3182f6;background:transparent;border:0;border-top:1px solid var(--line);padding:13px 0 6px;cursor:pointer;word-break:keep-all}.tx-adv small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px;line-height:1.4}" +
    ".tx-advh{margin:0;padding:13px 0 8px;border-top:1px solid var(--line);font-size:14.5px;font-weight:800;color:#3182f6}.tx-advh small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".tx-s{font-size:13px!important;color:var(--sub)}" +
    ".tx-clr{display:block;margin:8px 0 0 auto;font:inherit;font-size:13px;color:var(--sub);background:transparent;border:0;text-decoration:underline;cursor:pointer;padding:8px 2px}" +
    ".tx-wait{margin:6px 0;font-size:15px;line-height:1.55;text-align:center;color:var(--sub);word-break:keep-all}.tx-wait b{color:var(--text)}.tx-wait small{display:block;font-size:12.5px;margin-top:4px}" +
    ".tx-sec{margin:18px 0 8px;font-size:13.5px;font-weight:800;color:var(--sub)}" +
    ".tx-big{border-radius:16px;padding:14px 16px;margin:0 0 10px;background:rgba(128,128,128,.10)}.tx-big small{display:block;font-size:13.5px;font-weight:700;color:var(--sub)}" +
    ".tx-big b{display:block;font-size:28px;font-weight:800;letter-spacing:-.6px;line-height:1.25;font-variant-numeric:tabular-nums;word-break:keep-all}.tx-big span{display:block;font-size:13.5px;color:var(--sub);line-height:1.5;margin-top:3px;word-break:keep-all}" +
    ".tx-big.tx-ok{background:rgba(49,130,246,.10)}.tx-big.tx-ok b{color:#3182f6}.tx-big.tx-bad{background:rgba(240,68,82,.10)}.tx-big.tx-bad b{color:#f04452}" +
    ".tx-bars{margin:12px 0 4px}.tx-b{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:baseline;margin:0 0 10px}.tx-b>span{font-size:13.5px;font-weight:600;color:var(--sub);word-break:keep-all}.tx-b>b{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".tx-b>i{grid-column:1/3;display:block;height:12px;border-radius:6px;background:rgba(128,128,128,.14);overflow:hidden}.tx-b>i u{display:block;height:100%;border-radius:6px;background:rgba(128,128,128,.55);text-decoration:none}" +
    ".tx-b>b .tx-am{font-size:12.5px;font-weight:600;color:var(--sub);margin-left:4px}.tx-b.tx-best>span{color:var(--text);font-weight:800}.tx-b.tx-best>b{color:#3182f6}.tx-b.tx-best>i u{background:#3182f6}" +
    ".tx-n{margin:6px 2px 10px;font-size:14.5px;line-height:1.55;word-break:keep-all}.tx-a{color:#3182f6}.tx-r{color:#f04452}.tx-w{color:#f04452;font-weight:700}" +
    ".tx-g{margin:4px 0 6px}.tx-gt,.tx-lt{position:relative;height:14px;border-radius:7px;background:rgba(128,128,128,.14);margin:26px 0 26px}.tx-lt{margin-top:6px}.tx-gt i.up em{top:auto;bottom:22px}" +
    ".tx-gt u,.tx-lt u{display:block;height:100%;border-radius:7px;background:#3182f6;text-decoration:none;max-width:100%}.tx-gt u.y{background:#f5a623}.tx-gt u.r{background:#f04452}" +
    ".tx-gt i,.tx-lt i{position:absolute;top:-3px;width:2px;height:20px;background:var(--text);opacity:.75}.tx-gt i em,.tx-lt i em{position:absolute;top:22px;left:50%;transform:translateX(-50%);font-style:normal;font-size:11.5px;font-weight:700;line-height:1.25;color:var(--sub);text-align:center;white-space:nowrap;opacity:1}" +
    ".tx-g p,.tx-lim p{margin:0 2px 4px;font-size:14.5px;line-height:1.5;word-break:keep-all}.tx-lim{margin:10px 0 6px}" +
    ".tx-th{margin:16px 0 4px;font-size:13.5px;font-weight:800;color:var(--sub)}.tx-tip{list-style:none;margin:0;padding:0}.tx-tip li{position:relative;padding:8px 0 8px 16px;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.55;word-break:keep-all}.tx-tip li:last-child{border-bottom:0}.tx-tip li:before{content:'';position:absolute;left:2px;top:17px;width:6px;height:6px;border-radius:50%;background:#3182f6}" +
    ".tx-base{margin:12px 0 0;border-top:1px solid var(--line)}.tx-base summary{font-size:13.5px;font-weight:700;color:var(--sub);padding:11px 2px 4px;cursor:pointer}.tx-base ul{margin:4px 0 0;padding:0 0 0 16px}.tx-base li{font-size:12.5px;color:var(--sub);line-height:1.55;margin:0 0 5px;word-break:keep-all}" +
    "@media (max-width:340px){.tx-seg button{font-size:13px;padding:10px 2px;white-space:nowrap;letter-spacing:-.5px}.tx-f{grid-template-columns:minmax(0,1fr) 118px}.tx-big b{font-size:24px}}";
  D.head.appendChild(st);
})();
;
__bk(85);
/* ======== ux1118.js ======== */
/* 🧊 11/18 냉정 분석 6차 「만드는 속도 vs 쓰이는 속도」 — 사용자 「1,2,3,4,5,6,7,8,14 진행해」
   새 화면은 없음(2주 동결) — 있는 것을 찾기 쉽게·다시 쓰기 쉽게만.
   ① 🆕 새로 생긴 것 (홈 · 최근 7일 추가 기능 3줄 · 누르거나 ✕ 하면 사라짐 · localStorage nw18)
   ② 📌 내 바로가기 4칸 (홈 맨 위 · 자주 연 화면이 저절로 · 길게 누르면 고정 · localStorage sc18)
   ③ 🗺 섹터 지도 미리보기 (홈 「할 수 있는 일」 첫 줄 — ux1112b.js mapHtml 이 __secTile() 을 부름)
   ⑥ 👀 제안서 「완성본 먼저」 · ⑦ 🔁 「지난번 그대로」 (제안서 맨 위 · propose.js __prop.sample/apply · localStorage pp_hist — 고객 이름은 이 휴대폰에만)
   ⑧ 🧾 세무계산기 결과 → 고객에게 한 장 (1080px 그림 · 받는 분·심의필 번호 칸 · localStorage tx_sim)
   ⑭ 💼 포트: 규칙·지금 판정 먼저, 성적은 접어 둠 (자동 검진 때는 펼친 채)
   ④ 재방문 측정은 usage.py(주 단위 익명 번호) · ⑭ 무게는 tools/bundle.py(묶음 나누기)·sw.js
   끄기: index.html 📦list 에서 이 줄을 빼고 ux1112b.js 의 11/18 줄을 되돌림 */
(function(){
  var D = document;
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function lj(k, d){ try { var v = JSON.parse(ls(k) || "null"); return v == null ? d : v; } catch(x){ return d; } }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function toast(m){ var d = D.createElement("div"); d.className = "ch-toast"; d.textContent = m; D.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2800); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function goTo(k){ if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); } }
  var AUTO = !!navigator.webdriver && ls("x18test") !== "1";   // 자동 검진(health.py·ui_audit)은 예전처럼 펼친 화면을 봄

  /* ═════════ ② 내 바로가기 4칸 ═════════ */
  var SCN = {market: ["🌐", "시황"], sector: ["🧭", "섹터 지도"], feed: ["📰", "피드"], send: ["📨", "한 장"], prop: ["📝", "제안서"], bond: ["🏦", "채권"], fund: ["📦", "펀드"], els: ["🎯", "ELS"],
    divc: ["💰", "배당비교"], onepager: ["🔍", "종목"], flow: ["🧲", "수급"], port: ["💼", "포트"], score: ["📊", "성적표"], sigall: ["🎯", "신호"], tax: ["🧾", "세금 계산"], diag: ["🩻", "포트 진단"],
    lab: ["🔬", "연구실"], luck: ["🔮", "운세"], prob: ["🎲", "오를 확률"], whale: ["🐋", "큰손"], cup: ["☕", "컵 차트"], gap: ["📈", "갭 상승"], screen: ["🔎", "종목 찾기"]};
  var SCDEF = ["sector", "divc", "prop", "tax"];
  function scGet(){ var o = lj("sc18", {}); if (!o || typeof o !== "object") o = {}; o.cnt = o.cnt || {}; o.pin = (o.pin || []).filter(function(k){ return SCN[k]; }).slice(0, 4); return o; }
  function scList(){ var o = scGet(), out = o.pin.slice();
    Object.keys(o.cnt).filter(function(k){ return SCN[k] && o.cnt[k] >= 2 && out.indexOf(k) < 0; }).sort(function(a, b){ return o.cnt[b] - o.cnt[a]; }).forEach(function(k){ if (out.length < 4) out.push(k); });
    SCDEF.forEach(function(k){ if (out.length < 4 && out.indexOf(k) < 0) out.push(k); });
    return {keys: out.slice(0, 4), pin: o.pin}; }
  var scLast = "";
  function scCount(){ var c = cur(); if (!c || c === scLast) return; scLast = c; if (c === "home" || !SCN[c] || AUTO) return; var o = scGet(); o.cnt[c] = Math.min(999, (o.cnt[c] || 0) + 1); ls("sc18", JSON.stringify(o)); }
  function scHtml(){ var L = scList();
    return '<p class="x18-h">내 바로가기 <small>자주 여는 화면이 저절로 · 길게 누르면 고정</small></p><div class="sc18-g">' + L.keys.map(function(k){
      return '<button type="button" data-sc18="' + k + '"' + (L.pin.indexOf(k) >= 0 ? ' class="pin"' : '') + '><span>' + SCN[k][0] + '</span><b>' + SCN[k][1] + '</b></button>'; }).join("") + '</div>'; }
  function scPin(k){ var o = scGet(), i = o.pin.indexOf(k);
    if (i >= 0){ o.pin.splice(i, 1); toast("고정을 풀었어요"); } else { if (o.pin.length >= 4) o.pin.pop(); o.pin.unshift(k); toast("📌 " + SCN[k][1] + " 고정했어요"); }
    ls("sc18", JSON.stringify(o)); homePaint(true); }
  var lpT = null, lpDone = false;
  D.addEventListener("pointerdown", function(ev){ var t = ev.target.closest && ev.target.closest("[data-sc18]"); if (!t) return; lpDone = false; clearTimeout(lpT);
    lpT = setTimeout(function(){ lpDone = true; try { navigator.vibrate && navigator.vibrate(12); } catch(x) {} scPin(t.dataset.sc18); }, 600); }, true);
  ["pointerup", "pointercancel", "pointerleave", "scroll"].forEach(function(n){ D.addEventListener(n, function(){ clearTimeout(lpT); }, true); });
  D.addEventListener("contextmenu", function(ev){ if (ev.target.closest && ev.target.closest("[data-sc18]")) ev.preventDefault(); });

  /* ═════════ ① 새로 생긴 것 ═════════ */
  var NEWS = [
    ["n1119a", "2026-11-19", "🌅", "아침 30초 — 카드 5장", "달라진 것 · 돈의 흐름 · 성향별 할 일 · 오늘 장 준비 (옆으로 넘기기)", "market"],
    ["n1119b", "2026-11-19", "🩻", "포트 진단 → 오늘 리포트 처방", "고객 포트를 넣으면 성향별로 줄일 몫·늘릴 칸을 PB용으로", "diag"],
    ["n1118a", "2026-11-18", "🧾", "세무계산기 → 연말 절세 한 장", "결과를 고객에게 그림 한 장으로", "tax"],
    ["n1118b", "2026-11-18", "📝", "제안서 — 완성본 먼저 · 지난번 그대로", "견본을 먼저 보고, 지난 제안서는 이름만 바꿔 다시", "prop"],
    ["n1117b", "2026-11-17", "🗓", "섹터 지도 1·3·6개월", "기간을 바꾸면 섹터 카드 전체가 같이 바뀜", "sector"],
    ["n1117c", "2026-11-17", "🏦", "포트 설계기 — 채권·종목 섞어 보기", "미국채·브라질국채·종목을 넣어 과거 성적 다시 계산", "@design"],
    ["n1117d", "2026-11-17", "💸", "연금·IRP 월 출금 계획", "제안서에 매달 꺼내 쓸 금액을 넣으면 계획표가 붙음", "prop"],
    ["n1116a", "2026-11-16", "🩻", "포트 진단 한 장", "고객 보유 종목 → 쏠림 · 배당 · 고점 대비", "diag"],
    ["n1116b", "2026-11-16", "🖼", "고객 질문 답을 그림 한 장으로", "「지금 팔아야 해요?」 답을 카톡 그림으로", "@qa"]
  ];
  function nwSeen(){ var o = lj("nw18", {}); return o && typeof o === "object" ? o : {}; }
  function nwList(){ var s = nwSeen(), lim = new Date(kst().getTime() - 7 * 864e5).toISOString().slice(0, 10);
    return NEWS.filter(function(n){ return n[1] >= lim && !s[n[0]]; }); }
  var nwAll = false;
  function nwHtml(){ var L = nwList(); if (!L.length) return "";
    var show = nwAll ? L : L.slice(0, 3);
    return '<p class="x18-h">새로 생긴 것 <small>' + L.length + '개 · 최근 7일</small><button type="button" class="nw18-x" data-nw18x="1" aria-label="다 봤어요">다 봤어요 ✕</button></p><div class="nw18-l">' + show.map(function(n){
      return '<button type="button" data-nw18="' + n[0] + '"><span>' + n[2] + '</span><b>' + e(n[3]) + ' <small>' + e(n[4]) + '</small></b><i>›</i></button>'; }).join("") +
      (L.length > show.length ? '<button type="button" class="nw18-m" data-nw18m="1">' + (L.length - show.length) + '개 더 ▾</button>' : '') + '</div>'; }
  function nwGo(id){ var n = NEWS.filter(function(x){ return x[0] === id; })[0]; if (!n) return;
    var s = nwSeen(); s[id] = 1; ls("nw18", JSON.stringify(s));
    var k = n[5];
    if (id === "n1118a") txIntent = 1;   // 🩹 11/18 절세 한 장 줄 → 세무 화면에 만드는 법 안내
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); else goTo("send"); return; }
    if (k === "@design"){ goTo("port"); var c = 0; (function seek(){ var z = D.getElementById("podz"), more = D.getElementById("ezcapb");
      if (z && z.classList.contains("ez-cap-hid") && more) more.click();
      if (z && z.getBoundingClientRect().height > 0){ z.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++c < 30) setTimeout(seek, 300); })(); return; }
    goTo(k); }

  /* ═════════ ③ 섹터 지도 미리보기 (ux1112b.js mapHtml → __secTile) ═════════ */
  var SEC = null, SECT = 0;
  function secLoad(){ if (Date.now() - SECT < 300000 || !window.getJSON || typeof M === "undefined") return; SECT = Date.now();
    try { var it = ((M.cats && M.cats.sector) || [])[0]; if (!it || (it.files || []).indexOf("compass.json") < 0) return;
      getJSON(file("sector", it.id, "compass.json"), {ttl: 300000}).then(function(C){ var m = C && C.markets && C.markets.KR; if (!m || !m.sectors) return;
        var ix = (m.index || [])[0] || {}, b20 = +ix.chg20 || 0, b5 = +ix.chg5 || 0;
        var ss = m.sectors.filter(function(x){ return x.r20 != null && x.r5 != null; }).map(function(x){ return {n: String(x.name || "").replace(/\(.*$/, "").split("·")[0].trim(), x: x.r20 - b20, y: x.r5 - b5}; });
        if (ss.length < 4) return;
        SEC = {ss: ss, date: m.date || C.date, ix: ix.name || "코스피"}; }).catch(function(){}); } catch(x) {} }
  window.__secTile = function(){
    secLoad(); if (!SEC) return "";
    var ss = SEC.ss, W = 108, H = 72, P = 6, lim = function(a){ var v = a.map(Math.abs).sort(function(p, q){ return p - q; }); return Math.max(1, v[Math.floor(v.length * 0.85)] || 1); };
    var mx = lim(ss.map(function(o){ return o.x; })), my = lim(ss.map(function(o){ return o.y; }));
    var X = function(v){ v = Math.max(-mx, Math.min(mx, v)); return P + (v + mx) / (2 * mx) * (W - 2 * P); }, Y = function(v){ v = Math.max(-my, Math.min(my, v)); return P + (my - v) / (2 * my) * (H - 2 * P); };
    var sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="sec18-sv" aria-hidden="true"><rect x="' + X(0) + '" y="' + P + '" width="' + (W - P - X(0)) + '" height="' + (Y(0) - P) + '" fill="#e66767" opacity=".13"/>' +
      '<rect x="' + P + '" y="' + Y(0) + '" width="' + (X(0) - P) + '" height="' + (H - P - Y(0)) + '" fill="#3987e5" opacity=".13"/>' +
      '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="currentColor" opacity=".25"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + P + '" y2="' + (H - P) + '" stroke="currentColor" opacity=".25"/>' +
      ss.map(function(o){ var hot = o.x > 0 && o.y > 0, cold = o.x < 0 && o.y < 0; return '<circle cx="' + X(o.x).toFixed(1) + '" cy="' + Y(o.y).toFixed(1) + '" r="3" fill="' + (hot ? "#e0524a" : cold ? "#3f7fe0" : "#9aa3b5") + '"/>'; }).join("") + '</svg>';
    var by = ss.slice().sort(function(a, b){ return b.x - a.x; }), up = by.slice(0, 2).map(function(o){ return o.n; }), dn = by.slice(-2).reverse().map(function(o){ return o.n; });
    return '<button type="button" class="jm-t sec18" data-jm="sector">' + sv + '<span class="sec18-t"><b>오늘 섹터 지도</b><small>🇰🇷 한 달 ' + e(SEC.ix) + '보다 강한 곳 <u class="up">' + e(up.join(" · ")) + '</u></small><small>약한 곳 <u class="dn">' + e(dn.join(" · ")) + '</u></small><em>' + md(SEC.date) + ' 기준 · 5개 시장 보기 ›</em></span></button>'; };

  /* ═════════ 홈에 얹기 (①·②) ═════════ */
  function homePaint(force){
    if (cur() !== "home"){ return; }
    var hero = D.getElementById("ezhero"); if (!hero) return;
    var box = D.getElementById("x18home");
    if (!box){ box = D.createElement("section"); box.id = "x18home"; box.className = "no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    if (hero.previousElementSibling !== box) hero.insertAdjacentElement("beforebegin", box);
    var nh = AUTO ? "" : nwHtml(), h = '<div class="sc18">' + scHtml() + '</div>' + (nh ? '<div class="nw18">' + nh + '</div>' : '');
    if (force || box._h !== h){ box.innerHTML = h; box._h = h; }
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-sc18],[data-nw18],[data-nw18x],[data-nw18m]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.sc18){ if (lpDone){ lpDone = false; return; } goTo(t.dataset.sc18); return; }
    if (t.dataset.nw18){ nwGo(t.dataset.nw18); return; }
    if (t.dataset.nw18m){ nwAll = true; homePaint(true); return; }
    if (t.dataset.nw18x){ var s = nwSeen(); nwList().forEach(function(n){ s[n[0]] = 1; }); ls("nw18", JSON.stringify(s)); homePaint(true); }
  });

  /* ═════════ ⑥ 완성본 먼저 · ⑦ 지난번 그대로 (제안서) ═════════ */
  function b64e(str){ return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  var SAMP = [
    ["pension", "🌴 은퇴 준비", "개인연금 3억 · 매달 150만원 꺼내 쓰기", {v: 1, s: ["pension"], p: 3, a: {pension: 30000}, o: {pension: {w: 150, c: "1101"}}}],
    ["gl_stock", "🚀 성장형", "국내+해외 주식 1억", {v: 1, s: ["gl_stock"], p: 5, a: {gl_stock: 10000}, o: {gl_stock: {c: "1111"}}}],
    ["ktb", "🛡 안정형", "국고채 2억", {v: 1, s: ["ktb"], p: 1, a: {ktb: 20000}, o: {}}]
  ];
  function won(w){ var man = Math.round(w / 10000); if (!man) return ""; if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만" : ""); } return man.toLocaleString("ko-KR") + "만"; }
  function hist(){ var a = lj("pp_hist", []); return Array.isArray(a) ? a.filter(function(x){ return x && x.code && x.names; }).slice(0, 6) : []; }
  D.addEventListener("click", function(ev){   // 만들 때마다 「지난번」으로 기억 (심의 요청서는 빼고)
    var t = ev.target.closest && ev.target.closest("#ppw [data-mk], #ppw #ppshow"); if (!t || !window.__prop) return;
    if (t.dataset.mk && /^rev/.test(t.dataset.mk)) return;
    try { var code = __prop.code(); if (!code) return; var I = __prop.info(); if (!I.total) return;
      var a = hist().filter(function(x){ return !(x.code === code && x.cust === I.cust); });
      a.unshift({code: code, cust: I.cust, names: I.names.join(" · "), total: I.total, prof: I.prof, at: today()}); ls("pp_hist", JSON.stringify(a.slice(0, 6))); } catch(x) {}
  }, true);
  function ppStep(i){ var n = 0; (function seek(){ var b = D.querySelector('#ezwiz [data-st="' + i + '"]'); if (b){ b.click(); return; } if (++n < 20) setTimeout(seek, 150); })(); }
  function ppApply(code, cust, step, msg){ if (!window.__prop || !__prop.apply(code, cust)){ toast("불러오지 못했어요 — 잠시 뒤 다시 눌러 주세요"); return; }
    ppStep(step); if (msg) toast(msg); }
  var ppOpen = true, ppThumbT = null;
  function ppHtml(){
    var H = hist(), S = SAMP.filter(function(s){ return __prop.has(s[0]); });
    var h = "";
    if (H.length) h += '<p class="x18-h">지난번 그대로 <small>이 휴대폰에만 기억</small></p><div class="pp18-l">' + H.slice(0, 3).map(function(x, i){
      return '<div class="pp18-r"><button type="button" data-pp18h="' + i + '"><b>' + e(x.cust || "고객님") + '</b><small>' + e(x.names) + (won(x.total) ? " · " + won(x.total) : "") + (x.prof ? " · " + e(x.prof) : "") + ' · ' + md(x.at) + '</small></button>' +
        '<button type="button" class="alt" data-pp18n="' + i + '">이름만 바꿔</button></div>'; }).join("") + '</div>';
    if (S.length) h += '<p class="x18-h">완성본 먼저 보기 <small>이렇게 나와요 · 누르면 이 틀로 시작</small></p>' +
      '<div class="pp18-s">' + S.map(function(s, i){ return '<button type="button" class="pp18-c" data-pp18s="' + i + '"><span class="pp18-th" data-th="' + i + '"><i class="loading">그리는 중…</i></span><b>' + s[1] + '</b><small>' + e(s[2]) + '</small><em>이 틀로 만들기 ›</em></button>'; }).join("") + '</div>';
    return h; }
  function ppThumbs(){ clearTimeout(ppThumbT); var S = SAMP.filter(function(s){ return __prop.has(s[0]); }), i = 0;
    (function one(){ var el = D.querySelector('#pp18 [data-th="' + i + '"]'); if (!el || i >= S.length) return;
      var html = ""; try { html = __prop.sample(b64e(JSON.stringify(S[i][3]))); } catch(x) {}
      if (html){ var w = el.clientWidth || 200, sc = w / 1080; el.innerHTML = '<div class="pp18-in" style="transform:scale(' + sc + ');transform-origin:0 0;width:1080px">' + html.replace(/\sid="[^"]*"/g, "") + '</div>'; }
      else el.innerHTML = '<i class="loading">견본을 못 그렸어요</i>';
      i++; ppThumbT = setTimeout(one, 120); })(); }
  function ppPaint(){
    var box = D.getElementById("pp18");
    if (cur() !== "prop" || AUTO){ if (box) box.remove(); return; }
    var w = D.getElementById("ppw"); if (!w || !window.__prop || !__prop.ready() || !w.querySelector(".pp-pf")) return;
    var on = D.querySelector("#ezwiz .ezw-s button.on"), st = on ? +on.dataset.st : 0;
    if (st >= 2){ if (box) box.hidden = true; return; }
    if (!box){ box = D.createElement("section"); box.id = "pp18"; box.className = "card no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box.hidden = false;
    var anchor = D.getElementById("ezwiz") || w; if (anchor.previousElementSibling !== box) anchor.parentNode.insertBefore(box, anchor);
    var key = JSON.stringify(hist()) + "|" + ppOpen + "|" + SAMP.map(function(s){ return __prop.has(s[0]) ? 1 : 0; }).join("");
    if (box._k === key) return; box._k = key;
    var h = ppHtml(); if (!h){ box.hidden = true; return; }
    box.innerHTML = h; if (ppOpen) ppThumbs();
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pp18 [data-pp18h],#pp18 [data-pp18n],#pp18 [data-pp18s],#pp18 [data-pp18o]"); if (!t) return; ev.stopPropagation();
    var H = hist(), S = SAMP.filter(function(s){ return window.__prop && __prop.has(s[0]); }), x;
    if (t.dataset.pp18h != null && (x = H[+t.dataset.pp18h])){ ppApply(x.code, x.cust, 3, "지난번 그대로 불러왔어요 — 📱 한 장 · PDF 중 하나만 누르면 끝"); return; }
    if (t.dataset.pp18n != null && (x = H[+t.dataset.pp18n])){ ppApply(x.code, "", 2, "상품·금액은 그대로 — 고객 이름만 넣어 주세요"); return; }
    if (t.dataset.pp18o != null){ if (+t.dataset.pp18o < 0){ ppOpen = true; var b = D.getElementById("pp18"); if (b) b._k = ""; ppPaint(); return; } x = S[+t.dataset.pp18o]; }
    if (t.dataset.pp18s != null) x = S[+t.dataset.pp18s];
    if (x) ppApply(b64e(JSON.stringify(x[3])), "", 3, "견본을 불러왔어요 — 아래 미리 보기 확인 · 이름·금액은 3단계에서 바꿔요");
  });

  /* ═════════ ⑧ 세무계산기 결과 → 고객에게 한 장 ═════════ */
  var W = 1080, MX = 60, CW = W - MX * 2;
  var INK = "#141414", SUB = "#6a6f7a", MUT = "#9aa0ab", LINE = "#e6e8ec", RED = "#d6453d", GRN = "#1f9d6b", BLUE = "#3182f6", BG = "#f7f7f5", TILE = "#ffffff";
  var F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  function font(g, w, s){ g.font = w + " " + s + "px " + F; }
  function rr(g, x, y, w, h, r, fill){ g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }
  function lines(g, text, w, max){
    var out = [], line = "", toks = String(text == null ? "" : text).split(/(\s+)/);
    toks.forEach(function(tk){ if (!tk) return;
      if (g.measureText(line + tk).width <= w){ line += tk; return; }
      if (/^\s+$/.test(tk)){ if (line){ out.push(line); line = ""; } return; }
      if (line.trim()){ out.push(line.replace(/\s+$/, "")); line = ""; }
      while (g.measureText(tk).width > w){ var i = 1; while (i < tk.length && g.measureText(tk.slice(0, i + 1)).width <= w) i++; out.push(tk.slice(0, i)); tk = tk.slice(i); }
      line = tk; });
    if (line.trim()) out.push(line.replace(/\s+$/, ""));
    if (max && out.length > max){ out = out.slice(0, max); var l = out[max - 1]; while (l.length > 1 && g.measureText(l + "…").width > w) l = l.slice(0, -1); out[max - 1] = l + "…"; }
    return out; }
  function para(g, text, x, y, w, lh, max){ var L = lines(g, text, w, max); L.forEach(function(t, i){ g.fillText(t, x, y + i * lh); }); return L.length * lh; }
  function fit(g, text, w){ var t = String(text); if (g.measureText(t).width <= w) return t; while (t.length > 1 && g.measureText(t + "…").width > w) t = t.slice(0, -1); return t + "…"; }
  function tx(el){ return String((el && (el.innerText || el.textContent)) || "").replace(/\s+/g, " ").trim(); }
  function pctOf(el, prop){ var m = /([\d.]+)%/.exec((el && el.style && el.style[prop]) || ""); return m ? Math.max(0, Math.min(100, +m[1])) / 100 : null; }
  function taxCanvas(o){
    var c = D.createElement("canvas"); c.width = W; c.height = 6000; var g = c.getContext("2d"); g.textBaseline = "alphabetic"; g.fillStyle = BG; g.fillRect(0, 0, W, 6000);
    var d = kst(), ds = (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + "일월화수목금토"[d.getUTCDay()] + ")", y;
    var cl = String(o.client || "").trim(); if (cl) cl = /님$/.test(cl) ? cl : cl + " 고객님";
    if (cl){ g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, cl + "께", CW * 0.55), MX, 72); }
    g.textAlign = "right"; g.fillStyle = SUB; font(g, 600, 22); g.fillText(fit(g, ds + (o.pb ? " · " + o.pb + " 드림" : ""), CW * (cl ? 0.42 : 1)), W - MX, 70); g.textAlign = "left"; y = 112;
    g.fillStyle = INK; font(g, 900, 50); y += para(g, o.title, MX, y + 50, CW, 62, 2) + 14;
    if (o.inputs){ g.fillStyle = SUB; font(g, 500, 25); y += para(g, "넣은 값 — " + o.inputs, MX, y + 28, CW, 36, 3) + 16; }
    y += 10;
    o.nodes.forEach(function(n){
      if (n.k === "sec"){ y += 14; g.fillStyle = INK; font(g, 800, 32); g.fillText(fit(g, n.t, CW), MX, y + 34); y += 54; return; }
      if (n.k === "gauge"){
        rr(g, MX, y, CW, 150 + 0, 24, TILE); var bx = MX + 32, bw = CW - 64, by = y + 62;
        rr(g, bx, by, bw, 18, 9, LINE); if (n.w != null) rr(g, bx, by, Math.max(18, bw * n.w), 18, 9, n.red ? RED : BLUE);
        n.marks.forEach(function(m){ var px = bx + bw * m.x; g.fillStyle = INK; g.fillRect(px - 1.5, by - 10, 3, 38); g.fillStyle = SUB; font(g, 600, 20); g.textAlign = m.x > 0.7 ? "right" : m.x < 0.2 ? "left" : "center"; g.fillText(m.t, px, by - 20); g.textAlign = "left"; });
        g.fillStyle = INK; font(g, 700, 27); g.fillText(fit(g, n.t, bw), bx, by + 66); y += 150 + 16; return; }
      if (n.k === "big"){
        font(g, 500, 23); var sl = n.sub ? lines(g, n.sub, CW - 64, 4) : [], h = 132 + sl.length * 32 + (sl.length ? 8 : 0);
        rr(g, MX, y, CW, h, 24, TILE); rr(g, MX, y + 22, 8, h - 44, 4, n.tone === "bad" ? RED : n.tone === "good" ? GRN : BLUE);
        g.fillStyle = SUB; font(g, 600, 24); g.fillText(fit(g, n.lab, CW - 64), MX + 32, y + 46);
        g.fillStyle = n.tone === "bad" ? RED : n.tone === "good" ? GRN : INK; font(g, 900, 54); g.fillText(fit(g, n.val, CW - 64), MX + 32, y + 108);
        g.fillStyle = SUB; font(g, 500, 23); sl.forEach(function(t, i){ g.fillText(t, MX + 32, y + 150 + i * 32); });
        y += h + 16; return; }
      if (n.k === "bars"){
        var rh = 62, h2 = 28 + n.rows.length * rh + 12; rr(g, MX, y, CW, h2, 24, TILE);
        n.rows.forEach(function(r, i){ var ry = y + 28 + i * rh, lw = 330, vw = 250, bx2 = MX + 32 + lw + 12, bw2 = CW - 64 - lw - vw - 24;
          g.fillStyle = r.best ? INK : SUB; font(g, r.best ? 800 : 600, 24); g.fillText(fit(g, r.lab, lw), MX + 32, ry + 30);
          rr(g, bx2, ry + 12, bw2, 20, 10, LINE); if (r.w > 0) rr(g, bx2, ry + 12, Math.max(10, bw2 * r.w), 20, 10, r.best ? BLUE : "#aab4c8");
          g.textAlign = "right"; g.fillStyle = r.best ? BLUE : INK; font(g, 800, 25); g.fillText(fit(g, r.val, vw), W - MX - 32, ry + 31); g.textAlign = "left"; });
        y += h2 + 16; return; }
      if (n.k === "tips"){
        y += 10; g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, n.t, CW), MX, y + 32); y += 54;
        n.items.forEach(function(t){ g.fillStyle = BLUE; g.beginPath(); g.arc(MX + 10, y + 18, 6, 0, 6.3); g.fill(); g.fillStyle = INK; font(g, 500, 25); y += para(g, t, MX + 34, y + 27, CW - 34, 37, 4) + 14; });
        y += 6; return; }
      if (n.k === "note"){ g.fillStyle = SUB; font(g, 500, 23); y += para(g, n.t, MX, y + 26, CW, 34, 4) + 14; return; }
    });
    var foot = (o.asof ? o.asof + " 세법 · " : "") + "넣은 값만으로 한 어림 계산 — 개인별 공제·세대 사정에 따라 실제 세금·보험료는 달라요 · 신고 전 세무사·홈택스·건강보험공단 확인 · 세무 자문·투자 권유 아님" + (o.sim ? " · " + o.sim : "");
    var H = Math.max(1350, y + 190), o2 = D.createElement("canvas"); o2.width = W; o2.height = H; var g2 = o2.getContext("2d"); g2.textBaseline = "alphabetic"; g2.fillStyle = BG; g2.fillRect(0, 0, W, H);
    g2.drawImage(c, 0, 0, W, y, 0, 0, W, y); g2.fillStyle = LINE; g2.fillRect(MX, H - 150, CW, 2); g2.fillStyle = MUT; font(g2, 500, 21); para(g2, foot, MX, H - 112, CW, 29, 4);
    return o2; }
  function taxNodes(out){
    var N = []; [].forEach.call(out.children, function(el){
      var cn = el.className || "";
      if (el.id === "tx18" || /hub-h|tx-base|tx-wait/.test(cn) || el.tagName === "DETAILS") return;
      if (/tx-sec/.test(cn)){ N.push({k: "sec", t: tx(el)}); return; }
      if (/\btx-g\b/.test(cn)){ var u = el.querySelector(".tx-gt u"); N.push({k: "gauge", w: pctOf(u, "width"), red: !!(u && /\br\b/.test(u.className)), t: tx(el.querySelector("p")),
        marks: [].map.call(el.querySelectorAll(".tx-gt i"), function(i){ return {x: pctOf(i, "left") || 0, t: tx(i)}; })}); return; }
      if (/tx-big/.test(cn)){ N.push({k: "big", lab: tx(el.querySelector("small")), val: tx(el.querySelector("b")), sub: tx(el.querySelector("span")), tone: /tx-bad/.test(cn) ? "bad" : /tx-good|tx-ok/.test(cn) ? "good" : ""}); return; }
      if (/tx-bars/.test(cn)){ N.push({k: "bars", rows: [].map.call(el.querySelectorAll(".tx-b"), function(r){ return {lab: tx(r.querySelector("span")), val: tx(r.querySelector("b")), w: pctOf(r.querySelector("u"), "width") || 0, best: /tx-best/.test(r.className)}; })}); return; }
      if (/tx-th/.test(cn)){ N.push({k: "tips", t: tx(el), items: []}); return; }
      if (/tx-tip/.test(cn)){ var last = N[N.length - 1]; if (!last || last.k !== "tips"){ last = {k: "tips", t: "같이 볼 것", items: []}; N.push(last); }
        [].slice.call(el.querySelectorAll("li"), 0, 5).forEach(function(li){ last.items.push(tx(li)); }); return; }
      var t = tx(el); if (t && !/더 정확하게|칸에 넣/.test(t)) N.push({k: "note", t: t});
    });
    return N.filter(function(n){ return n.k !== "tips" || n.items.length; }); }
  function taxInputs(c, v){ var out = [];
    (c.segs || []).forEach(function(s){ var o = s.opts.filter(function(x){ return x[0] === v[s.id]; })[0]; if (o) out.push(o[1]); });
    c.fields.forEach(function(f){ if ((f.on && !f.on(v)) || !v[f.id]) return; out.push(f.label.replace(/^그중 /, "") + " " + (f.unit ? v[f.id] + f.unit : Number(v[f.id]).toLocaleString("ko-KR") + "만원")); });
    return out.join(" · "); }
  function simGet(){ var o = lj("tx_sim", {}); return o && typeof o === "object" ? o : {}; }
  function simLine(){ var s = simGet(); if (!s.no) return ""; if (s.to && s.to < today()) return ""; return "심의필 " + s.no + (s.to ? " (유효 ~" + s.to.replace(/-/g, ".") + ")" : ""); }
  function recent(){ var a = lj("op_clients", []); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 6) : []; }
  function taxSheet(){
    var T = window.__tax, out = D.getElementById("txout"); if (!T || !out) return;
    var k = ls("txsel"), c = T.calcs.filter(function(x){ return x.k === k; })[0]; if (!c || !out.querySelector(".tx-big,.tx-bars")){ toast("숫자를 먼저 넣어 주세요"); return; }
    var old = D.getElementById("opch"); if (old) old.remove();
    var s = simGet(), exp = s.no && s.to && s.to < today(), box = D.createElement("div"); box.id = "opch";
    box.innerHTML = '<div class="opc-s"><h3>📨 ' + c.ic + ' ' + e(c.t) + ' — 고객에게 한 장</h3>' +
      '<label class="opc-n">💌 받는 분 <input id="tx18c" maxlength="20" placeholder="고객 이름 (비워도 돼요)"></label>' +
      (recent().length ? '<div class="tx18-rc">' + recent().map(function(n){ return '<button type="button" data-tx18c="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<label class="opc-n">✍️ 보내는 사람 <input id="tx18p" maxlength="30" placeholder="내 이름 (예: 김OO PB)" value="' + e(ls("pbname") || "") + '"></label>' +
      '<label class="opc-n">⚖️ 심의필 번호 <input id="tx18n" maxlength="40" placeholder="예: 제2026-0000호 (받은 것만)" value="' + e(s.no || "") + '"></label>' +
      '<label class="opc-n">유효기간 끝 <input id="tx18t" type="date" value="' + e(s.to || "") + '"></label>' +
      '<p class="tx18-w" id="tx18w">' + (exp ? "⏰ 심의필 유효기간이 지났어요 — 번호 없이 만들어져요" : s.no ? "✅ 그림 아래에 심의필 번호가 찍혀요" : "⚠️ 심의필 번호가 없어요 — 고객에게 보내기 전에 준법감시 심의를 받아 번호를 넣어 주세요") + '</p>' +
      '<button class="opc-go" data-tx18go="1">한 장 만들기</button><button class="opc-x" data-x="1">닫기</button></div>';
    D.body.appendChild(box);
    box.addEventListener("click", function(ev){ var t = ev.target;
      if (t === box || t.closest("[data-x]")){ box.remove(); return; }
      var rc = t.closest("[data-tx18c]"); if (rc){ D.getElementById("tx18c").value = rc.dataset.tx18c; return; }
      if (!t.closest("[data-tx18go]")) return;
      var client = D.getElementById("tx18c").value.trim().slice(0, 20), pb = D.getElementById("tx18p").value.trim().slice(0, 30);
      ls("pbname", pb); ls("tx_sim", JSON.stringify({no: D.getElementById("tx18n").value.trim().slice(0, 40), to: D.getElementById("tx18t").value || ""}));
      if (client){ var a = recent().filter(function(x){ return x !== client; }); a.unshift(client); ls("op_clients", JSON.stringify(a.slice(0, 8))); }
      box.remove(); toast("한 장 만드는 중…");
      var cv; try { cv = taxCanvas({client: client, pb: pb, title: c.ic + " " + c.t, inputs: taxInputs(c, T.state[c.k] || {}), nodes: taxNodes(out), asof: T.law && T.law.asof, sim: simLine()}); } catch(x){ console.error("tax18", x); toast("그림을 만들지 못했어요"); return; }
      var fname = (client ? client.replace(/[^\w가-힣]+/g, "") + "님_" : "") + "절세_" + c.t.replace(/[^\w가-힣]+/g, "") + "_" + today().slice(5).replace("-", "") + ".png";
      var done = false, end = function(b){ if (done) return; done = true; if (!b){ toast("그림을 만들지 못했어요 — 다시 눌러 주세요"); return; } var f = new File([b], fname, {type: "image/png"});
        if (window.__onepage && __onepage.ready) __onepage.ready([f], "절세 한 장"); else { var a2 = D.createElement("a"); a2.href = URL.createObjectURL(f); a2.download = fname; a2.click(); } };
      setTimeout(function(){ end(null); }, 8000); try { cv.toBlob(function(b){ end(b); }, "image/png"); } catch(x){ end(null); }
    });
  }
  /* 🩹 11/18 「연말 절세 한 장」(🆕 줄 · 📨 보내기 화면 줄)으로 들어오면 계산기 6칸만 보이고 보내기 단추는 결과 밑에만 생겨 못 찾았음
     → 그 두 입구로 왔을 때만: 결과가 나오기 전까지 맨 위에 만드는 법 한 줄, 단추가 생기면 한 번 반짝. 연구실에서 그냥 열면 그대로. */
  var txIntent = 0, txWas = false;
  D.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest('.hub-send [data-hub="tax"]'); if (t) txIntent = 1; }, true);
  function txHint(has){
    var h = D.getElementById("tx18h"), tx = D.getElementById("tx");
    if (!txIntent || has || !tx){ if (h) h.remove(); return; }
    if (h && h.parentNode === tx && tx.firstElementChild === h) return;
    if (!h){ h = D.createElement("p"); h.id = "tx18h"; h.innerHTML = '<b>📨 연말 절세 한 장 만드는 법</b>① 아래에서 계산기를 고르고 ② 숫자를 넣으면 ③ 결과 맨 아래에 <u>「📨 이 결과를 고객에게 한 장으로」</u> 단추가 생겨요'; }
    tx.insertBefore(h, tx.firstElementChild);
  }
  function taxPaint(){
    if (cur() !== "tax"){ if (txWas){ txIntent = 0; txWas = false; } return; }
    txWas = true;
    var out = D.getElementById("txout"), has = !!(out && !out.hidden && out.querySelector(".tx-big,.tx-bars"));
    txHint(has);
    if (!out || out.hidden) return;
    var b = D.getElementById("tx18");
    if (!has){ if (b) b.remove(); return; }
    if (b && b.parentNode === out && !b.nextElementSibling) return;
    if (!b){ b = D.createElement("button"); b.type = "button"; b.id = "tx18"; b.className = "hub-cta"; b.setAttribute("data-j", "opch"); b.innerHTML = '📨 이 결과를 고객에게 한 장으로<small>받는 분 이름 · 심의필 번호를 넣을 수 있어요</small>';
      if (txIntent){ b.classList.add("tx18-hi"); txIntent = 0; } }
    out.appendChild(b);
  }
  D.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("#tx18"); if (!t) return; ev.stopPropagation(); taxSheet(); });

  /* ═════════ ⑭ 포트 — 성적은 접어 둠 ═════════ */
  var pfOpen = false;
  function portPaint(){
    if (cur() !== "port"){ pfOpen = false; return; }
    var sum = D.getElementById("posum"), win = D.querySelector("#pobody > .po-win"); if (!sum) return;
    var b = D.getElementById("pf18"), off = !pfOpen && !AUTO;
    sum.classList.toggle("pf18-off", off); if (win) win.classList.toggle("pf18-off", off);
    if (AUTO){ if (b) b.remove(); return; }
    if (!b){ b = D.createElement("button"); b.type = "button"; b.id = "pf18"; }
    if (sum.previousElementSibling !== b) sum.parentNode.insertBefore(b, sum);   // 성적 카드 바로 앞(다른 스크립트가 카드 순서를 바꿔도 따라감)
    var h = pfOpen ? '📊 성적 접기 ▴' : '📊 성적 보기 ▾<small>10/2부터 · 시장과 비교 — 규칙과 지금 판정은 위에</small>'; if (b._h !== h){ b.innerHTML = h; b._h = h; }
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pf18, #pobody .po-stk button, #pobody .po-stk a"); if (!t) return;
    if (t.id === "pf18"){ ev.stopPropagation(); pfOpen = !pfOpen; portPaint(); return; }
    if (!pfOpen && /성적|비교/.test(t.textContent || "")){ pfOpen = true; portPaint(); }
  }, true);

  /* ═════════ 모양 ═════════ */
  var st = D.createElement("style");
  st.textContent =
    "#x18home{margin:0 0 12px}.x18-h{margin:4px 4px 8px;font-size:15px;font-weight:800;display:flex;align-items:baseline;gap:6px}.x18-h small{font-size:12.5px;font-weight:500;color:var(--sub);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sc18-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.sc18-g button{position:relative;font:inherit;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:10px 4px 9px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}" +
    ".sc18-g button:active{transform:scale(.97)}.sc18-g span{font-size:22px;line-height:1}.sc18-g b{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.sc18-g button.pin{border-color:#3182f6}.sc18-g button.pin:after{content:'';position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;background:#3182f6}" +
    ".nw18{margin-top:10px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:10px 12px 2px}.nw18 .x18-h{margin:0 2px 2px}.nw18-x{font:inherit;font-size:12.5px;font-weight:600;color:var(--sub);background:transparent;border:0;padding:4px 2px;cursor:pointer;flex:none}" +
    ".nw18-l button{display:grid;grid-template-columns:26px 1fr 14px;column-gap:8px;align-items:center;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:8px 2px;cursor:pointer}.nw18-l button:first-child{border-top:0}" +
    ".nw18-l span{font-size:18px;text-align:center}.nw18-l b{display:block;font-size:15px;font-weight:700;min-width:0;white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis}.nw18-l b small{display:inline!important;white-space:nowrap!important;font-size:13px;font-weight:500;color:var(--sub);margin-left:4px}.nw18-l i{font-style:normal;color:var(--sub);font-size:18px}" +
    ".nw18-l button.nw18-m{display:block;text-align:center;font-size:13px;font-weight:700;color:var(--sub);padding:7px 2px}" +
    /* 섹터 타일 */
    ".jm-t.sec18{flex-direction:row;align-items:center;gap:12px;min-height:0;width:100%;margin:0 0 8px;padding:12px 14px}.sec18-sv{width:108px;height:72px;flex:none;border-radius:10px;background:var(--panel2,rgba(127,127,127,.08));color:var(--sub)}" +
    ".sec18-t{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.sec18-t small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sec18-t u{text-decoration:none;font-weight:700}.sec18-t u.up{color:#e0524a}.sec18-t u.dn{color:#3f7fe0}.jm-t.sec18 em{margin-top:2px;padding-top:2px;min-height:0}" +
    /* 제안서 */
    "#pp18{padding:14px 14px 12px;margin-bottom:12px}#pp18 .x18-h{margin:2px 2px 8px}#pp18 .x18-h+*{margin-bottom:12px}#pp18>*:last-child{margin-bottom:0}" +
    ".pp18-r{display:flex;gap:8px;align-items:stretch;border-top:1px solid var(--line);padding:8px 0}.pp18-r:first-child{border-top:0;padding-top:0}.pp18-r button{font:inherit;color:var(--text);background:transparent;border:0;cursor:pointer;text-align:left;min-width:0}" +
    ".pp18-r button:first-child{flex:1;display:flex;flex-direction:column;gap:2px;padding:4px 2px}.pp18-r b{font-size:15.5px;font-weight:800}.pp18-r small{font-size:13px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pp18-r button.alt{flex:none;font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:12px;padding:0 12px;color:var(--sub)}" +
    ".pp18-chips{display:flex;flex-direction:column;gap:8px}.pp18-chips button{font:inherit;color:var(--text);background:var(--panel2,transparent);border:1px solid var(--line);border-radius:14px;padding:10px 12px;cursor:pointer;text-align:left;display:flex;align-items:baseline;gap:8px;min-width:0}.pp18-chips b{font-size:15px;font-weight:800;flex:none}.pp18-chips small{font-size:13px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pp18-open{display:block;width:100%;font:inherit;font-size:14px;font-weight:700;color:#3182f6;background:transparent;border:0;padding:8px 0 2px;cursor:pointer}" +
    ".pp18-s{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:4px}.pp18-c{flex:none;width:62%;max-width:240px;scroll-snap-align:start;font:inherit;color:var(--text);background:transparent;border:1px solid var(--line);border-radius:16px;padding:8px 8px 10px;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:3px}" +
    ".pp18-th{display:block;position:relative;height:270px;overflow:hidden;border-radius:10px;background:#fff;margin-bottom:6px;pointer-events:none}.pp18-th:after{content:'';position:absolute;left:0;right:0;bottom:0;height:46px;background:linear-gradient(rgba(255,255,255,0),#fff)}.pp18-th .loading{display:block;padding:20px 8px;font-style:normal;font-size:13px;color:#888;text-align:center}" +
    ".pp18-c b{font-size:15px;font-weight:800}.pp18-c small{font-size:13px;color:var(--sub);line-height:1.35}.pp18-c em{font-style:normal;font-size:13px;font-weight:700;color:#3182f6;margin-top:2px}" +
    /* 세무 한 장 */
    "#tx18h{margin:0 0 10px;padding:12px 14px;border-radius:14px;background:rgba(49,130,246,.10);border:1px solid rgba(49,130,246,.35);font-size:14px;line-height:1.55;word-break:keep-all}#tx18h b{display:block;font-size:14.5px;margin-bottom:2px}#tx18h u{text-decoration:none;font-weight:700;color:#3182f6}" +
    "#tx18.tx18-hi{animation:tx18hi 1.2s ease-in-out 3}@keyframes tx18hi{50%{box-shadow:0 0 0 4px rgba(49,130,246,.45)}}" +
    "#tx18{margin-top:14px}#tx18 small{display:block;font-size:12.5px;font-weight:500;opacity:.85;margin-top:2px}.tx18-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 8px}.tx18-rc button{font:inherit;font-size:13px;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);padding:4px 10px;cursor:pointer}.tx18-w{margin:4px 2px 10px;font-size:13px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    /* 포트 성적 접기 */
    ".pf18-off{display:none!important}#pf18{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:13px 12px;margin:10px 0;cursor:pointer}#pf18 small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:3px}";
  D.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; [scCount, homePaint, ppPaint, taxPaint, portPaint].forEach(function(f){ try { f(); } catch(x){ console.warn("ux1118", x); } }); }
  function soon(){ if (!q) q = setTimeout(tick, 180); }
  function start(){ tick(); try { new MutationObserver(soon).observe(D.body, {childList: true, subtree: true}); } catch(x) {} setInterval(tick, 3000); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  window.__ux1118 = {news: NEWS, taxNodes: taxNodes, taxCanvas: taxCanvas};   // 점검용
})();
;
__bk(86);
/* ======== ux1119.js ======== */
/* 🌅 11/19 아침 시황 업그레이드 — 사용자 「매일 아침 시황리포트를 냉정·객관적으로 분석해 업그레이드 · PB·고객이 아침에 보고 전략·리밸런싱에 쓰게 · 우와」 → 「전부 다 진행」
   자료: market-strategy-report src/morning.py → market/morning.json (리포트 새 1·2쪽과 같은 숫자)
   ④ 넘겨 보는 카드 5장 (#mo19) — 오늘 홈 첫 칸 아래 · 시황 탭 맨 위. 결론 → 달라진 것 → 돈의 흐름 → 행동(성향별) → 오늘 장 준비
      그 아래 접힌 두 줄: ⑨ 우리 조언 성적표 · ⑩ 우리가 틀렸다면
   ⑦ 고객 포트 대입 (#dg19) — 🩻 포트 진단 결과 아래에 「오늘 리포트 기준이면」 PB용 처방(주식 % · 한국 주식 · 업종 · 완충) — 그림 한 장(고객용)에는 넣지 않음
   새 화면 없음(12/1까지 동결 약속) — 있는 화면 맨 위에 얹기만.
   끄기: index.html 📦list 에서 이 줄을 빼면 끝 */
(function(){
  var D = document, RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 300000}) : fetch(u).then(function(r){ if (!r.ok) throw 0; return r.json(); })).catch(function(){ return null; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v == null ? "" : v >= 0 ? "u" : "d"; }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function won(man){ man = Math.round(Math.abs(man)); if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만원" : "원"); } return man.toLocaleString("ko-KR") + "만원"; }
  function goTo(k){ if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); } }
  var MO = null, MOT = 0;
  function load(){ if (MO && Date.now() - MOT < 300000) return Promise.resolve(MO);
    return gj(RM + "morning.json?" + Math.floor(Date.now() / 300000)).then(function(j){ if (j && j.changes){ MO = j; MOT = Date.now(); } return MO; }); }
  function fresh(M){ if (!M || !M.date) return false; return (kst() - new Date(M.date + "T00:00:00Z")) < 4 * 864e5; }

  /* ═════════ ④ 카드 5장 ═════════ */
  var PK = ["안정추구형", "위험중립형", "성장형"];
  function pIdx(){ var v = +(ls("mo19p") || 1); return v >= 0 && v <= 2 ? v : 1; }
  function acCard(c){
    var cls = c.dir === "up" ? "u" : c.dir === "hold" ? "h" : "d";
    return '<div class="m19a ' + cls + (c.small ? " sm" : "") + '"><b>' + e(c.name) + ' <i>' + e(c.sym) + '</i></b>' +
      (c.kr && c.kr !== "—" ? '<small>🇰🇷 ' + e(c.kr) + (c.pct ? ' · 지금 ' + c.pct + '%' : '') + '</small>' : (c.pct ? '<small>지금 ' + c.pct + '%</small>' : '')) +
      (c.chg ? '<em>' + e(c.chg) + '</em>' : c.dir === "avoid" ? '<em class="dd">새로 사지 않기</em>' : '') +
      '<p>' + e(c.why) + '</p>' + (c.cond ? '<p class="f"><b>틀리면</b> ' + e(c.cond) + '</p>' : '') +
      (c.hit && c.hit.n ? '<span class="ht ' + (c.hit.rate < 40 ? "bad" : c.hit.rate >= 60 ? "ok" : "") + '">이 칸 조언 ' + Math.round(c.hit.n * c.hit.rate / 100) + '/' + c.hit.n + ' 맞음' + (c.small ? ' → 작게' : '') + '</span>' : '') + '</div>'; }
  function deck(M){
    var C = M.changes || {}, A = M.actions || {}, F = M.flowmap || {}, P = (M.persona || {}).items || [], pi = pIdx(), p = P[pi] || {};
    var ttl = function(n, t, s){ return '<div class="m19k"><span>' + n + '/5</span>' + t + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
    var c1 = '<div class="m19c c1">' + ttl(1, "오늘의 결론", M.edition ? e(md(M.date) + " " + M.edition) : "") +
      '<p class="m19big">' + e((M.cards && M.cards[0] && M.cards[0].t) || "") + '</p>' +
      ((M.cards && M.cards[0] && M.cards[0].s) ? '<p class="m19so">→ ' + e(M.cards[0].s) + '</p>' : '') + '<p class="m19sw">옆으로 넘기면 달라진 것 · 돈의 흐름 · 할 일 ›</p></div>';
    var c2 = '<div class="m19c">' + ttl(2, "어제와 달라진 것", C.prev_date ? md(C.prev_date) + " 대비" : "") +
      '<p class="m19big">' + (C.none ? '<b class="ok">오늘은 바꿀 것 없음</b> — 어제 배분 그대로' : e(C.head)) + '</p>' +
      (C.items || []).map(function(i){ return '<div class="m19ch ' + i.lv + '"><b>' + e(i.ic + " " + i.t) + '</b><small>' + e(i.s) + (i.lv === "watch" ? " · 오늘 밤 바뀔 수 있음" : "") + '</small></div>'; }).join("") + '</div>';
    var mx = 1; (F["in"] || []).concat(F.out || []).forEach(function(r){ mx = Math.max(mx, Math.abs(r.rs5 || 0)); });
    var c3 = '<div class="m19c">' + ttl(3, "돈의 흐름 지도", md(F.asof) + " 종가") +
      '<div class="m19ct">' + (F.countries || []).map(function(c){ var k = c.label === "돈이 들어오는 곳" ? "in" : c.label === "빠지는 곳" ? "out" : "mid";
        return '<div class="' + k + '"><b>' + e(c.flag) + '</b><span class="' + cl(c.chg5) + '">' + sg(c.chg5) + '</span><small>' + e(c.name) + '</small></div>'; }).join("") + '</div>' +
      '<div class="m19dv">' + (F["in"] || []).slice(0, 4).concat((F.out || []).slice(0, 3)).map(function(r){ var w = Math.abs(r.rs5) / mx * 50;
        return '<div><span>' + (r.rs5 >= 0 ? "🔥 " : "🧊 ") + e(r.name) + '</span><i><s style="' + (r.rs5 >= 0 ? "left:50%;background:var(--up,#d6453d)" : "right:50%;background:var(--down,#2f6fdd)") + ';width:' + w.toFixed(1) + '%"></s></i><b class="' + cl(r.rs5) + '">' + (r.rs5 > 0 ? "+" : "") + r.rs5.toFixed(1) + '</b></div>'; }).join("") +
      '</div><p class="m19n">미국 섹터·테마 5일 S&amp;P500 대비(%p) · 🇰🇷 어제 업종: ' + (F.kr_in || []).slice(0, 2).map(function(x){ return e(x.name) + " " + sg(x.r1); }).join(" · ") + '</p></div>';
    var c4 = '<div class="m19c">' + ttl(4, "오늘 할 일", "") +
      '<div class="m19pp">' + P.map(function(x, i){ return '<button type="button" data-mo19p="' + i + '" class="' + (i === pi ? "on" : "") + '">' + e(x.ic + " " + x.k) + '</button>'; }).join("") + '</div>' +
      (p.k ? '<div class="m19bar">' + [["stock", "주식", "#d6453d"], ["bond", "채권", "#2f6fdd"], ["gold", "금", "#c99a2e"], ["cash", "현금", "#8a94a8"]].map(function(k){ return p[k[0]] > 0 ? '<i style="flex:' + p[k[0]] + ';background:' + k[2] + '">' + (p[k[0]] >= 12 ? k[1] + " " + p[k[0]] : "") + '</i>' : ''; }).join("") + '</div>' +
        '<p class="m19n">' + e(p.chg) + ' · ' + e(p.kr) + '</p>' : '') +
      '<div class="m19g"><p class="u">늘릴 것</p>' + ((A.up || []).map(acCard).join("") || '<p class="m19e">오늘은 없음</p>') +
      '<p class="d">줄일 · 피할 것</p>' + ((A.down || []).map(acCard).join("") || '<p class="m19e">오늘은 없음</p>') +
      '<p class="h">그대로 둘 것</p>' + (A.hold || []).slice(0, 2).map(acCard).join("") + '</div>' +
      '<button type="button" class="m19go" data-mo19go="diag">🩻 내 고객 포트에 대입해 보기 ›</button></div>';
    var OV = M.overnight || {}, T = (M.triggers || []).slice(0, 4);
    var c5 = '<div class="m19c">' + ttl(5, "오늘 장 준비", "") +
      T.map(function(t){ return '<div class="m19t' + (t.near ? " nr" : "") + '"><div><b>' + e(t.signal) + '</b><small>→ ' + e(t.claim) + '</small></div><i><s style="width:' + Math.round((t.fill || 0) * 100) + '%"></s></i><em>' + e(t.dist) + '</em></div>'; }).join("") +
      '<p class="m19s">밤사이 미국 → 오늘 한국</p>' + (OV.up || []).slice(0, 2).concat((OV.down || []).slice(0, 1)).map(function(x){
        return '<div class="m19o"><b>' + (x.r1 > 0 ? "🔥" : "🧊") + ' ' + e(x.name) + ' <span class="' + cl(x.r1) + '">' + sg(x.r1, 2) + '</span></b><small>' + (x.kr || []).slice(0, 3).map(function(k){ return e(k.name); }).join(" · ") + '</small></div>'; }).join("") +
      '<div class="m19tm">' + (OV.times || []).slice(0, 3).map(function(t){ return '<span><b>' + e(t.t) + '</b>' + e(t.what) + '</span>'; }).join("") + '</div></div>';
    var S = M.score || {}, SA = S.all || {}, CW = M.counter || {};
    var tail = '<details class="m19d"><summary>📊 우리 조언 성적표 <b>' + (SA.win || 0) + '/' + (SA.n || 0) + '</b> <small>5거래일 뒤 S&amp;P500 대비 · 대기 ' + (S.pending || 0) + '</small></summary>' +
      '<div class="m19sc">' + (S.by_list || []).map(function(v){ return '<span class="' + (v.rate >= 60 ? "ok" : v.rate < 40 ? "bad" : "") + '">' + e(v.name) + ' <b>' + v.win + '/' + v.n + '</b></span>'; }).join("") + '</div>' +
      '<p class="m19n">' + ((S.weak || []).length ? '⚠️ ' + e(S.weak.join(", ")) + ' 칸은 적중 40% 아래 — 이 칸 조언은 작게 · ' : '') + e(S.rule || "") + '</p></details>' +
      '<details class="m19d"><summary>🗣 우리가 틀렸다면 <small>가장 강한 반론 1개</small></summary><p class="m19cw">' + e(CW.claim || "") + '</p>' +
      (CW.watch ? '<p class="m19n">📏 가장 가까운 「틀렸다」 신호: <b>' + e(CW.watch.signal) + '</b> · 남은 거리 <b>' + e(CW.watch.dist) + '</b></p>' : '') + '</details>';
    return '<p class="m19h">🌅 오늘 아침 30초 <small>' + e(md(M.date)) + ' ' + e(M.edition || "") + ' · 옆으로 넘겨 보기</small></p>' +
      '<div class="m19w" id="m19w">' + c1 + c2 + c3 + c4 + c5 + '</div><div class="m19dot" id="m19dot">' + [0, 1, 2, 3, 4].map(function(i){ return '<i data-mo19d="' + i + '"' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join("") + '</div>' + tail;
  }
  function place(){
    var k = cur(), box = D.getElementById("mo19"), anchor = null, where = "after";
    if (k === "home"){ anchor = D.getElementById("ezrows") || D.getElementById("jobmap"); }   // 11/19 고침: 첫 칸(ezhero) 바로 아래는 「할 수 있는 일」(ux1112b)이 자리 잡는 곳 — 둘이 서로 밀어내며 화면이 흔들렸음 → 그 아래로
    else if (k === "market"){ anchor = D.getElementById("live"); where = "before"; }
    if (!anchor || !MO || !fresh(MO)){ if (box && (!anchor || k !== box._k)) box.remove(); return; }
    if (!box){ box = D.createElement("section"); box.id = "mo19"; box.className = "card no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box._k = k;
    var need = where === "after" ? anchor.nextElementSibling !== box : anchor.previousElementSibling !== box;
    if (need){   // 다른 스크립트와 자리다툼이면(2초에 3번 넘게 옮김) 지금 자리에 그대로 둠 — 화면이 흔들리지 않게
      var now = Date.now(); place.mv = (place.mv || []).filter(function(t){ return now - t < 2000; });
      if (place.mv.length < 3 || !box.parentNode){ place.mv.push(now); if (where === "after") anchor.insertAdjacentElement("afterend", box); else anchor.insertAdjacentElement("beforebegin", box); }
    }
    var key = MO.at + "|" + pIdx();
    if (box._h === key) return; box._h = key;
    var sl = D.getElementById("m19w"), x = sl ? sl.scrollLeft : 0;
    box.innerHTML = deck(MO);
    var w = D.getElementById("m19w"); if (w){ w.scrollLeft = x; w.addEventListener("scroll", dots, {passive: true}); }
    fitH();
    if (w && window.ResizeObserver){ var ro = new ResizeObserver(function(){ w._h = 0; fitH(); }); [].forEach.call(w.children, function(c){ ro.observe(c); }); }
  }
  function fitH(){   // 넘김 칸 높이 = 지금 보는 카드 높이 (긴 카드에 맞춰 짧은 카드 밑이 텅 비던 것)
    var w = D.getElementById("m19w"); if (!w || !w.children.length) return;
    var i = Math.max(0, Math.min(w.children.length - 1, Math.round(w.scrollLeft / Math.max(1, w.children[0].offsetWidth + 10))));
    var h = w.children[i].offsetHeight + 8; if (h > 40 && w._h !== h){ w._h = h; w.style.height = h + "px"; }
  }
  function dots(){ var w = D.getElementById("m19w"), d = D.getElementById("m19dot"); if (!w || !d) return;
    clearTimeout(dots.t); dots.t = setTimeout(fitH, 90);
    var i = Math.round(w.scrollLeft / Math.max(1, w.children[0].offsetWidth + 10)); [].forEach.call(d.children, function(x, k){ x.classList.toggle("on", k === i); });
    if (i >= 1 && !dots.used){ dots.used = 1; try { window.__track && __track("mo19swipe"); } catch(x) {} } }

  /* ═════════ ⑦ 고객 포트 대입 (포트 진단 결과 아래) ═════════ */
  var SECMAP = {IGV: "IT", SMH: "IT", SKYY: "IT", CIBR: "IT", IGM: "IT", XLK: "IT", XLE: "에너지", XOP: "에너지", XLV: "헬스케어", IHI: "헬스케어", XBI: "헬스케어",
    XLF: "금융", KBE: "금융", KRE: "금융", IAI: "금융", KBWB: "금융", XLP: "필수소비재", XLY: "경기소비재", XRT: "경기소비재", GRID: "유틸리티", XLU: "유틸리티",
    XLI: "산업재", ITA: "산업재", PAVE: "산업재", COPX: "소재", XME: "소재", XLB: "소재", GDX: "소재", XLC: "통신·미디어", XLRE: "부동산"};
  function rx(R, M){
    var P = (M.persona || {}).items || [], pi = pIdx(), p = P[pi] || {}, A = M.actions || {}, out = [];
    var tot = R.tot || 0, eq = R.eq || 0, bond = 0, gold = 0;
    (R.cls || []).forEach(function(c){ if (c[0] === "채권·현금") bond = c[1]; if (c[0] === "금") gold = c[1]; });
    if (p.k){ var dlt = eq - p.stock;
      out.push(["주식 비중", "지금 " + Math.round(eq) + "% → " + p.k + " 기준 " + p.stock + "%" + (Math.abs(dlt) < 3 ? " — 거의 맞음" : " — " + (dlt > 0 ? "줄일" : "늘릴") + " 몫 약 " + won(tot * Math.abs(dlt) / 100) + " (" + Math.round(Math.abs(dlt)) + "%p)")]); }
    var kr = 0; (R.region || []).forEach(function(g){ if (g[0] === "한국") kr = g[1]; });
    var ks = (M.persona || {}).kospi_stock;
    if (kr >= 5 && ks != null && ks < 50) out.push(["한국 주식", "전체의 " + Math.round(kr) + "%(약 " + won(tot * kr / 100) + ") — 오늘 규칙은 코스피 주식 " + ks + "%(하락장). 한 번에 말고 반등 때 나눠 해외 ETF(TIGER 미국나스닥100 133690)로 옮길 후보"]);
    else if (kr >= 5) out.push(["한국 주식", "전체의 " + Math.round(kr) + "% — 오늘 규칙상 줄일 이유 없음"]);
    var sec = {}; (R.sec || []).forEach(function(s){ sec[s[0]] = s[1]; });
    (A.down || []).forEach(function(c){ var s = SECMAP[c.sym]; if (s && sec[s] >= 3) out.push(["줄이자 칸", s + " " + Math.round(sec[s]) + "% 보유 — 오늘 리포트는 " + c.name + " " + (c.dir === "avoid" ? "새로 사지 않기" : "줄이기") + " (" + (c.why || "").slice(0, 50) + ")"]); });
    (A.up || []).forEach(function(c){ var s = SECMAP[c.sym]; if (!s) return; var h = sec[s] || 0;
      out.push(["늘리자 칸", c.name + "(" + c.sym + ") — 고객 " + s + " " + Math.round(h) + "% · " + (h < 5 ? "비어 있음 → 작게 담을 후보 " + (c.kr && c.kr !== "—" ? c.kr : c.sym) : "이미 담겨 있음 → 더 늘릴 필요 적음") + (c.small ? " · ⚠️ 이 칸 조언 적중 낮음 → 작게" : "")]); });
    var buf = bond + gold, tb = p.k ? (p.bond || 0) + (p.gold || 0) + (p.cash || 0) : null;
    if (tb != null) out.push(["완충(채권·현금·금)", "지금 " + Math.round(buf) + "% → " + p.k + " 기준 " + tb + "%" + (gold < 1 && (p.gold || 0) > 0 ? " · 금 " + p.gold + "%(TIGER KRX금현물 0072R0) 없음" : "")]);
    return out;
  }
  function diagPaint(){
    if (cur() !== "diag") return;
    var out = D.getElementById("dgout"), R = window.__dgLast; if (!out || !R || !MO || !out.querySelector(".dg-pt")) return;
    var box = D.getElementById("dg19");
    var key = (R.tot || 0) + "|" + (R.n || 0) + "|" + pIdx() + "|" + MO.at;
    if (box && box._k === key && out.contains(box)) return;
    if (!box){ box = D.createElement("section"); box.id = "dg19"; box.className = "card hub-c no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box._k = key;
    var P = (MO.persona || {}).items || [], L = rx(R, MO);
    box.innerHTML = '<p class="hub-h">🌅 오늘 리포트 기준이면 <small>PB용 · ' + e(md(MO.date)) + ' 아침판 · 그림 한 장엔 안 들어감</small></p>' +
      '<div class="m19pp">' + P.map(function(x, i){ return '<button type="button" data-mo19p="' + i + '" class="' + (i === pIdx() ? "on" : "") + '">' + e(x.ic + " " + x.k) + '</button>'; }).join("") + '</div>' +
      '<ul class="dg19">' + L.map(function(x){ return '<li><b>' + e(x[0]) + '</b>' + e(x[1]) + '</li>'; }).join("") + '</ul>' +
      '<p class="m19n">💼 기본 포트를 성향대로 줄인 예시와 오늘 행동 카드에 견준 것 · 매수·매도 권유 아님 · 성향에 맞는 상품만(제안서 성향 규칙)</p>';
    out.appendChild(box);
  }

  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-mo19p],[data-mo19go],[data-mo19d]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.mo19p != null){ ls("mo19p", t.dataset.mo19p); var b = D.getElementById("mo19"); if (b) b._h = ""; var g = D.getElementById("dg19"); if (g) g._k = ""; tick(); return; }
    if (t.dataset.mo19go){ goTo(t.dataset.mo19go); return; }
    if (t.dataset.mo19d != null){ var w = D.getElementById("m19w"), c = w && w.children[+t.dataset.mo19d]; if (c) w.scrollTo({left: c.offsetLeft - w.offsetLeft, behavior: "smooth"}); }
  });

  var st = D.createElement("style");
  st.textContent =
    "#mo19{padding:14px 0 10px;overflow:hidden}#mo19 .m19h{margin:0 16px 8px;font-size:16px;font-weight:800;color:var(--text)}#mo19 .m19h small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".m19w{display:flex;align-items:flex-start;gap:10px;overflow-x:auto;overflow-y:hidden;transition:height .25s ease;scroll-snap-type:x mandatory;padding:2px 16px 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.m19w::-webkit-scrollbar{display:none}" +
    ".m19c{flex:0 0 88%;scroll-snap-align:center;border:1px solid var(--line);border-radius:18px;padding:14px 14px 12px;background:var(--panel);box-sizing:border-box;word-break:keep-all}" +
    ".m19c.c1{background:linear-gradient(160deg,#1f2d4d,#2c4a86);color:#fff;border:0}.m19c.c1 .m19k,.m19c.c1 .m19k small{color:#c9d6ea}.m19c.c1 .m19so{color:#ffd27a}" +
    ".m19k{font-size:13px;font-weight:800;color:var(--sub);margin-bottom:8px}.m19k span{display:inline-block;font-size:11px;border:1px solid currentColor;border-radius:999px;padding:0 7px;margin-right:6px;opacity:.8}.m19k small{font-weight:500;margin-left:6px}" +
    ".m19big{font-size:19px;font-weight:800;line-height:1.42;margin:0 0 10px}.m19big .ok{color:#1f9d55}.m19so{font-size:15px;line-height:1.5;font-weight:700;margin:0}.m19sw{margin:14px 0 0;font-size:12.5px;opacity:.7}" +
    ".m19ch{border-radius:12px;padding:9px 11px;margin-bottom:7px;background:rgba(127,127,127,.08);border-left:4px solid #8a94a8}.m19ch.big{border-left-color:#d6453d;background:rgba(214,69,61,.08)}.m19ch.watch{border-left-color:#e3a21a;background:rgba(227,162,26,.1)}" +
    ".m19ch b{display:block;font-size:16px}.m19ch small{display:block;font-size:13px;color:var(--sub);margin-top:2px;line-height:1.4}" +
    ".m19ct{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px}.m19ct div{border-radius:10px;padding:6px 2px;text-align:center;background:rgba(127,127,127,.08)}.m19ct div.in{background:rgba(214,69,61,.12)}.m19ct div.out{background:rgba(47,111,221,.1)}" +
    ".m19ct b{display:block;font-size:18px}.m19ct span{display:block;font-size:13.5px;font-weight:800}.m19ct small{font-size:11.5px;color:var(--sub)}" +
    ".m19dv div{display:grid;grid-template-columns:104px 1fr 40px;gap:6px;align-items:center;font-size:13px;margin-bottom:4px}.m19dv span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.m19dv i{position:relative;height:10px;border-radius:5px;background:rgba(127,127,127,.12)}" +
    ".m19dv s{position:absolute;top:0;height:10px;border-radius:5px;text-decoration:none}.m19dv b{text-align:right;font-size:12.5px}" +
    "#mo19 .m19g>p.u{color:var(--up,#d6453d)}#mo19 .m19g>p.d{color:var(--down,#2f6fdd)}#mo19 b.u,#mo19 span.u{color:var(--up,#d6453d)}#mo19 b.d,#mo19 span.d{color:var(--down,#2f6fdd)}" +
    ".m19n{font-size:12.5px;color:var(--sub);line-height:1.45;margin:8px 0 0}.m19pp{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}.m19pp button{font:inherit;font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);padding:5px 10px;cursor:pointer}.m19pp button.on{background:#3182f6;border-color:#3182f6;color:#fff}" +
    ".m19bar{display:flex;height:22px;border-radius:7px;overflow:hidden}.m19bar i{display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;font-style:normal;white-space:nowrap}" +
    ".m19g>p{font-size:13px;font-weight:800;margin:12px 0 5px}.m19g>p.h{color:var(--sub)}.m19e{font-size:13px;color:var(--sub);font-weight:500!important}" +
    ".m19a{border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin-bottom:6px;border-left:4px solid #8a94a8}.m19a.u{border-left-color:#d6453d}.m19a.d{border-left-color:#2f6fdd}.m19a.sm{border-style:dashed;opacity:.85}" +
    ".m19a b{font-size:15px}.m19a b i{font-style:normal;font-size:11px;background:#1f2d4d;color:#fff;border-radius:5px;padding:1px 6px;margin-left:5px;vertical-align:2px}.m19a small{display:block;font-size:12px;color:var(--sub);margin-top:1px}" +
    ".m19a em{display:block;font-style:normal;font-size:13px;font-weight:800;color:#b07500;margin-top:2px}.m19a em.dd{color:var(--down,#2f6fdd)}.m19a p{font-size:13px;line-height:1.45;margin:3px 0 0}.m19a p.f{color:var(--sub)}.m19a p.f b{font-size:13px;color:var(--up,#d6453d)}" +
    ".m19a .ht{display:inline-block;font-size:11.5px;font-weight:800;border-radius:6px;padding:1px 7px;margin-top:5px;background:rgba(127,127,127,.12)}.m19a .ht.bad{background:rgba(214,69,61,.12);color:#d6453d}.m19a .ht.ok{background:rgba(31,157,85,.12);color:#1f9d55}" +
    ".m19go{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;padding:11px;border:0;border-radius:12px;background:#3182f6;color:#fff;margin-top:10px;cursor:pointer}" +
    ".m19t{display:grid;grid-template-columns:1fr 64px 52px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px dashed var(--line)}.m19t b{display:block;font-size:13.5px;line-height:1.35}.m19t small{font-size:12px;color:var(--sub)}" +
    ".m19t i{height:9px;border-radius:5px;background:rgba(127,127,127,.15);overflow:hidden}.m19t s{display:block;height:9px;background:#8a94a8;text-decoration:none}.m19t.nr s{background:#d6453d}.m19t em{font-style:normal;font-weight:800;font-size:13px;text-align:right}.m19t.nr em{color:#d6453d}" +
    ".m19s{font-size:13px;font-weight:800;margin:10px 0 4px}.m19o{padding:4px 0}.m19o b{font-size:14px}.m19o small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".m19tm{display:flex;flex-direction:column;gap:4px;margin-top:8px}.m19tm span{font-size:12.5px;line-height:1.4;background:rgba(127,127,127,.08);border-radius:8px;padding:5px 8px}.m19tm b{margin-right:6px}" +
    ".m19dot{display:flex;justify-content:center;gap:6px;margin:4px 0 6px}.m19dot i{width:7px;height:7px;border-radius:50%;background:var(--line);cursor:pointer}.m19dot i.on{background:#3182f6;width:18px;border-radius:4px}" +
    ".m19d{margin:4px 16px 0;border-top:1px solid var(--line);padding:9px 0 2px}.m19d summary{font-size:14.5px;font-weight:800;cursor:pointer;list-style:none}.m19d summary::-webkit-details-marker{display:none}.m19d summary small{font-size:12px;font-weight:500;color:var(--sub);margin-left:4px}" +
    ".m19sc{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.m19sc span{font-size:12.5px;border-radius:8px;padding:3px 8px;background:rgba(127,127,127,.1)}.m19sc span.bad{background:rgba(214,69,61,.12)}.m19sc span.ok{background:rgba(31,157,85,.12)}" +
    ".m19cw{font-size:14px;font-weight:700;line-height:1.5;margin:8px 0 0}" +
    ".dg19{list-style:none;margin:0;padding:0}.dg19 li{font-size:14px;line-height:1.5;padding:7px 0;border-bottom:1px solid var(--line)}.dg19 li b{display:block;font-size:12.5px;color:var(--sub)}";
  D.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; [place, diagPaint].forEach(function(f){ try { f(); } catch(x){ console.warn("ux1119", x); } }); }
  function soon(){ if (!q) q = setTimeout(tick, 200); }
  function start(){ load().then(tick); try { new MutationObserver(soon).observe(D.body, {childList: true, subtree: true}); } catch(x) {} setInterval(function(){ load().then(tick); }, 60000); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  window.addEventListener("resize", function(){ var w = D.getElementById("m19w"); if (w) w._h = 0; fitH(); });
  window.__ux1119 = {load: load, deck: deck, rx: rx};   // 점검용
})();
;
__bk(87);
/* ======== stab.js ======== */
/* 🛡 11/18 안정도 (사용자 「어플 안정도를 좀 높여 포괄적으로」) — 묶음 맨 끝에서 읽힘
   ① 화면 그리기 보호: go()(탭 열기)가 그리다 오류를 내면 전엔 화면이 반쯤 그려진 채 멈추거나 비었음
      → 오류를 수집(early.js chErr)하고, 맨 위에 「⚠ 이 화면 일부를 못 그렸어요 · 다시 그리기」 띠. 이미 그려진 것은 그대로 둠.
   ② 끝없는 「불러오는 중…」 막기: 화면에 보이는 「불러오는 중」이 30초 넘게 그대로면 「⏳ 오래 걸려요 · 다시 시도」 단추로 바꿈
      (자료가 안 오거나 그리기가 중간에 멈춘 경우 — 전엔 하염없이 돌았음).
   ③ 화면 지킴이 반복 오류 막기: 모든 보정 스크립트는 그대로 */
(function(){
  if (typeof window.go !== "function" || window.go.__stab) return;
  var G = window.go;
  function bar(msg){
    var m = document.getElementById("main"); if (!m) return;
    var old = document.getElementById("stabbar"); if (old) old.remove();
    var b = document.createElement("div"); b.id = "stabbar";
    b.style.cssText = "margin:8px 12px;padding:10px 12px;border-radius:12px;background:rgba(255,170,0,.14);border:1px solid rgba(255,170,0,.45);font-size:13px;line-height:1.45";
    b.innerHTML = "⚠ " + msg + ' <button type="button" class="btn" style="margin-left:6px">다시 그리기</button>';
    b.querySelector("button").onclick = function(){ b.remove(); try { if (window.getJSONdrop) getJSONdrop(); G(window.cur, (typeof curDate !== "undefined" && window.M && M.cats && M.cats[window.cur]) ? curDate : undefined); } catch(e) { location.reload(); } };
    m.insertBefore(b, m.firstChild);
  }
  var guarded = function(key, id){
    try { return G.apply(this, arguments); }
    catch(e){
      if (window.chErr) chErr("render", (e && e.message) || e, (e && e.stack && (/([^\/\s(]+\.js)/.exec(e.stack) || [])[1]) || "", " · " + key);
      try { bar("이 화면 일부를 못 그렸어요"); } catch(z) {}
    }
  };
  guarded.__stab = 1;
  try { window.go = guarded; go = guarded; } catch(e) {}

  // ② 「불러오는 중」 지킴이
  var seen = typeof WeakMap === "function" ? new WeakMap() : null;
  if (!seen) return;
  setInterval(function(){
    if (document.hidden) return;
    var L = document.querySelectorAll("#main .loading, #main .ez-skel, #main .wow-sk, #main .ez-ph"), now = Date.now();   // 🛡 11/18 16시: 회색 뼈대·「불러오는 중」 글자도
    for (var i = 0; i < L.length; i++){
      var el = L[i]; if (!el.offsetParent || el.__stabDone) continue;
      var t = seen.get(el); if (!t){ seen.set(el, now); continue; }
      if (now - t < 25000) continue;
      el.__stabDone = 1;
      if (window.chErr) chErr("stuck", "30초 넘게 불러오는 중", "", " · " + (window.cur || "") + " · " + String(el.textContent || "").slice(0, 20));
      el.innerHTML = '⏳ 오래 걸려요 (인터넷이 느리거나 자료가 아직 없어요) <button type="button" class="btn" style="margin-left:6px">다시 시도</button>';
      el.querySelector("button").onclick = function(){ try { if (window.getJSONdrop) getJSONdrop(); G(window.cur, (typeof curDate !== "undefined" && window.M && M.cats && M.cats[window.cur]) ? curDate : undefined); } catch(e) { location.reload(); } };
    }
  }, 3000);
})();
;
__bk(88);
__be(8);
