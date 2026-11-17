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
