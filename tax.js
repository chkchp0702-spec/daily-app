/* CH Investing — 🧾 11/16 세무계산기 (🔬 연구실 › 세무계산기 · #tax)
   사용자: 「세무계산기 카테고리 — 통합으로 진행 · 연구실에 넣고 · 항목 선택하면 필요값만 입력하면 계산 결과 나오는 형태로」
   항목 6개(한 화면 · 고르면 그 항목 입력칸만 보임 · 넣는 즉시 계산):
     ① 2,000만 경보기 — 금융소득종합과세 + 건강보험료(피부양자·지역·직장) 통합 + 고배당 분리과세 비교
     ② 연금계좌 세액공제   ③ 퇴직소득세(일시금 vs 연금)   ④ 연금 받을 때 세금   ⑤ 해외주식 양도세   ⑥ ISA 절세
   ★ 세법 숫자는 전부 아래 LAW 한 곳에만 있음 — 해가 바뀌거나 법이 바뀌면 LAW 만 고칠 것 (기준: 2026년 귀속 · 2026-11-16 확인)
     확인한 곳: 건강보험공단 「2026년 달라지는 제도」(보험료율 7.19%·장기요양 0.9448%) · 시행규칙 별표 1의2(피부양자 2,000만·5.4억·9억)
               조특법 고배당 분리과세(14·20·25·30% · 2026~2028 지급분) · 소득세법 48조(퇴직 근속연수공제·환산급여공제) · 59조의3(연금계좌 600/900)
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
    div: [[2000, .14], [30000, .20], [500000, .25], [Infinity, .30]],   // 고배당기업 배당 분리과세(2026~2028 지급분)
    hi: {rate: .0719, ltc: .9448 / 7.19, finIn: 1000, depLine: 2000, depLow: 1000, propMid: 54000, propMax: 90000, empFree: 2000, half: .5},
    pen: {save: 600, all: 900, wageLine: 5500, hiRate: .165, loRate: .132, isaRate: .1, isaMax: 300},
    pay: {line: 1500, sep: .165, r: [[70, .055], [80, .044], [999, .033]], life: .033},
    ret: {keep: [[10, .7], [20, .6], [999, .5]]},                       // 연금 수령 연차별 내는 비율(20년 초과 50%는 2026~)
    ovs: {ded: 250, rate: .22},
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
  function hiMonth(yearMan){ var p = Math.max(0, yearMan) / 12 * LAW.hi.rate; return wonM(p * (1 + LAW.hi.ltc)); }   // 연 소득(만원) → 월 건보료+장기요양(원)

  /* ───────── 결과 그리기 도구 ───────── */
  function big(lab, val, sub, tone){ return '<div class="tx-big' + (tone ? " tx-" + tone : "") + '"><small>' + lab + '</small><b>' + val + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; }
  function bars(rows){ var mx = 0; rows.forEach(function(r){ if (r[1] > mx) mx = r[1]; });
    return '<div class="tx-bars">' + rows.map(function(r){ var w = mx > 0 ? Math.max(r[1] > 0 ? 3 : 0, r[1] / mx * 100) : 0;
      return '<div class="tx-b' + (r[3] ? " tx-best" : "") + '"><span>' + r[0] + '</span><i><u style="width:' + w.toFixed(1) + '%"></u></i><b>' + (r[2] || won(r[1])) + '</b></div>'; }).join("") + '</div>'; }
  function tips(t, a){ a = a.filter(Boolean); return a.length ? '<p class="tx-th">' + t + '</p><ul class="tx-tip">' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul>' : ''; }
  function basis(a){ return '<details class="tx-base"><summary>계산 기준 · 가정 보기</summary><ul>' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul></details>'; }
  function head(t, s){ return '<p class="hub-h">' + t + (s ? ' <small>' + s + '</small>' : '') + '</p>'; }

  /* ───────── 계산기 6개 ───────── */
  var CALCS = [
    { k: "alarm", ic: "🚨", t: "2,000만 경보기", d: "금융소득 세금 + 건보료 한 번에",
      segs: [{id: "ins", label: "건강보험", opts: [["emp", "직장가입자"], ["dep", "피부양자"], ["loc", "지역가입자"]]}],
      fields: [
        {id: "fin", label: "이자·배당 합계", sub: "1년 · 세전", req: 1, ph: "예: 2500"},
        {id: "hd", label: "그중 고배당기업 배당", sub: "분리과세 대상 · 없으면 비움", ph: "선택"},
        {id: "wage", label: "연봉(총급여)", sub: "세전", ph: "예: 8000", on: function(v){ return v.ins === "emp"; }},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "예: 1200", on: function(v){ return v.ins !== "emp"; }},
        {id: "biz", label: "사업·임대 등 다른 소득", sub: "경비 뺀 금액", ph: "선택", on: function(v){ return v.ins !== "dep"; }},
        {id: "prop", label: "재산세 과세표준", sub: "주택은 공시가의 약 60%", ph: "선택", on: function(v){ return v.ins === "dep"; }}
      ],
      run: function(v){
        var F = v.fin || 0; if (!F) return null;
        var H = LAW.hi, HD = Math.min(v.hd || 0, F), ins = v.ins, wage = v.wage || 0, pen = v.pen || 0, biz = ins === "dep" ? 0 : (v.biz || 0), prop = v.prop || 0;
        var inc = (ins === "emp" ? Math.max(0, wage - wageDed(wage)) : Math.max(0, pen - penDed(pen))) + biz, O = Math.max(0, inc - 150);
        function ft(f){ return f > LAW.finLine ? Math.max(itax(O + f - LAW.finLine) + LAW.finLine * LAW.wh, itax(O) + f * LAW.wh) - itax(O) : f * LAW.wh; }   // 금융소득 f 에 붙는 소득세
        var gen = ft(F) * LAW.local, wh = F * LAW.wh * LAW.local, extra = Math.max(0, gen - wh), sep = HD > 0 ? (prog(HD, LAW.div) + ft(F - HD)) * LAW.local : null;
        var h = "", over = F > LAW.finLine;
        /* 그림: 1,000만 · 2,000만 선 */
        var mx = Math.min(4000, Math.max(3000, F * 1.15)), pos = Math.min(100, F / mx * 100);
        h += '<div class="tx-g"><div class="tx-gt"><u style="width:' + pos.toFixed(1) + '%" class="' + (over ? "r" : F > H.finIn ? "y" : "g") + '"></u>' +
          '<i class="up" style="left:' + (H.finIn / mx * 100).toFixed(1) + '%"><em>1,000만 · 건보료 선</em></i><i style="left:' + (LAW.finLine / mx * 100).toFixed(1) + '%"><em>2,000만 · 종합과세 선</em></i></div>' +
          '<p>지금 <b>' + won(F) + '</b> — ' + (over ? '2,000만 선을 <b class="tx-r">' + won(F - LAW.finLine) + '</b> 넘음' : F > H.finIn ? '2,000만 선까지 <b>' + won(LAW.finLine - F) + '</b> 남음' : '1,000만 선까지 <b>' + won(H.finIn - F) + '</b> 남음') + '</p></div>';
        /* ① 세금 */
        h += '<p class="tx-sec">① 세금</p>';
        if (!over) h += big("금융소득 세금", won(wh), "15.4% 떼고 끝 · 더 낼 세금 없음", "ok");
        else if (extra < 0.05) h += big("더 낼 세금", "0원", "종합과세 대상이지만 다른 소득이 적어 이미 뗀 15.4%(" + won(wh) + ")로 끝 · 5월 신고는 해야 함", "ok");
        else h += big("5월에 더 낼 세금", won(extra), "이미 뗀 " + won(wh) + " + 추가 " + won(extra) + " = 모두 " + won(gen) + " · 초과분 세율 약 " + pct(mrate(O + F - LAW.finLine) * LAW.local), "bad");
        if (sep != null && over){ var gain = gen - sep;
          h += bars([["그냥 종합과세", gen, null, gain <= 0.05], ["고배당 분리과세 선택", sep, null, gain > 0.05]]) +
            '<p class="tx-n">' + (gain > 0.05 ? '고배당 배당 ' + won(HD) + '을 분리과세로 신청하면 <b class="tx-a">' + won(gain) + '</b> 덜 냄 (5월 신고 때 신청)' : gain < -0.05 ? '다른 소득이 적어 분리과세를 고르면 오히려 <b class="tx-r">' + won(-gain) + '</b> 더 냄 — 신청하지 않는 쪽이 유리' : '이 경우는 분리과세를 골라도 세금 차이가 없음') + '</p>'; }
        else if (sep != null) h += '<p class="tx-n">2,000만 이하라 고배당 분리과세를 골라도 세금은 같음(14%)</p>';
        /* ② 건보료 */
        var Fh = F > H.finIn ? F : 0, msg = "";
        h += '<p class="tx-sec">② 건강보험료</p>';
        if (ins === "emp"){ var ext = Fh + biz, add = ext > H.empFree ? hiMonth(ext - H.empFree) : 0;
          h += add ? big("월급 말고 더 내는 건보료", "월 " + wn(add), "연 " + wn(add * 12) + " · 월급 외 소득 " + won(ext) + " 중 2,000만 넘는 " + won(ext - H.empFree) + "에 부과 · 전액 본인 부담", "bad")
                   : big("더 내는 건보료", "없음", "월급 외 소득 " + won(ext) + " — 2,000만 이하" + (F <= H.finIn && F > 0 ? " (이자·배당 1,000만 이하는 아예 안 봄)" : ""), "ok");
        } else if (ins === "dep"){ var tot = Fh + pen, why = [];
          if (tot > H.depLine) why.push("소득 합계 " + won(tot) + " — 2,000만 초과");
          if (prop > H.propMax) why.push("재산세 과세표준 " + won(prop) + " — 9억 초과");
          else if (prop > H.propMid && tot > H.depLow) why.push("재산 과표 5.4억~9억 구간인데 소득 " + won(tot) + " — 1,000만 초과");
          if (why.length){ var est = hiMonth(Fh + pen * H.half);
            h += big("피부양자 탈락", "월 " + wn(est) + " +α", "지역가입자로 바뀜 · 소득분만 계산한 값(연 " + wn(est * 12) + ") · 집·땅이 있으면 재산분이 더 붙음", "bad") + '<p class="tx-n">탈락 이유: ' + why.join(" · ") + '</p>';
          } else { var room = (prop > H.propMid ? H.depLow : H.depLine) - tot;
            h += big("피부양자 유지", "보험료 0원", "소득 합계 " + won(tot) + " · 기준선까지 " + won(room) + " 남음" + (F <= H.finIn ? " · 이자·배당 1,000만 이하는 0원으로 봄" : ""), "ok");
            if (F <= H.finIn && pen + H.finIn > (prop > H.propMid ? H.depLow : H.depLine)) msg = "⚠ 이자·배당이 1,000만을 1원이라도 넘으면 전액이 소득에 잡혀 바로 탈락함"; }
        } else { var now = hiMonth(Fh + pen * H.half + biz), low = hiMonth(pen * H.half + biz);
          h += big("소득분 건보료", "월 " + wn(now), "연 " + wn(now * 12) + " · 재산분은 따로 붙음", Fh ? "bad" : "ok");
          if (Fh) h += bars([["지금", now, "월 " + wn(now)], ["이자·배당 1,000만 이하면", low, "월 " + wn(low), 1]]) + '<p class="tx-n">이자·배당을 1,000만 이하로 맞추면 <b class="tx-a">연 ' + wn((now - low) * 12) + '</b> 줄어듦</p>';
          else if (F > 0) msg = "⚠ 이자·배당이 1,000만을 넘는 순간 전액이 잡혀 월 약 " + wn(hiMonth(H.finIn + pen * H.half + biz) - low) + " 이상 오름"; }
        if (msg) h += '<p class="tx-n tx-w">' + msg + '</p>';
        h += tips("줄이는 방법", [
          F > H.finIn * .7 ? "이자·배당 나는 상품을 <b>ISA·연금저축·IRP</b> 안으로 — 그 안 수익은 2,000만·건보료 계산에서 빠짐" : "",
          F > H.finIn * .7 ? "<b>받는 해를 나누기</b> — ELS 상환·채권 만기·예금 만기가 한 해에 몰리지 않게" : "",
          over ? "<b>가족 명의로 나누기</b> — 배우자 6억·성인 자녀 5천만(10년)까지 증여세 없음 · 2,000만은 사람마다 따로 셈" : "",
          F > H.finIn * .7 ? "이자 대신 <b>매매차익이 큰 상품</b> — 국내 주식 차익·저쿠폰 채권의 차익은 금융소득에 안 들어감" : "",
          HD > 0 || over ? "고배당기업 배당은 분리과세로 세금은 줄지만 <b>건보료 계산에는 그대로 잡힐 수 있음</b>" : ""]);
        h += basis(["금융소득종합과세: 2,000만 초과분을 다른 소득과 합쳐 누진세율(6~45%), 14% 원천징수세액과 비교해 큰 쪽 · 지방소득세 10% 포함",
          "다른 소득 과세표준은 " + (ins === "emp" ? "연봉 − 근로소득공제 − 본인 기본공제 150만" : "공적연금 − 연금소득공제 − 본인 기본공제 150만") + "으로만 어림(약 " + won(O) + ") — 실제 공제가 더 많으면 세금은 더 적음",
          "배당 가산(Gross-up)·배당세액공제는 넣지 않은 간이 계산",
          "고배당 분리과세: 2,000만 이하 14% · 3억 이하 20% · 50억 이하 25% · 초과 30% (2026~2028년 지급분 · 요건 맞는 상장사 현금배당만)",
          "건보료율 7.19% + 장기요양(건보료의 약 13.14%) · 이자·배당은 1,000만 초과 시 전액 반영 · 공적연금은 자격 판정 100%, 보험료 계산 50%",
          "피부양자는 사업소득이 있으면(사업자등록 시 1원 · 미등록 500만 초과 · 주택임대는 금액 무관) 따로 탈락 — 여기서는 안 봄",
          "건보료는 올해 소득이 내년 11월부터 반영됨 · 상·하한과 재산분(과표 1억 공제 뒤 점수제)은 뺐음"]);
        return h; } },

    { k: "pen", ic: "🏦", t: "연금 세액공제", d: "연금저축·IRP 넣으면 얼마 환급",
      fields: [
        {id: "wage", label: "연봉(총급여)", sub: "세전", req: 1, ph: "예: 7000"},
        {id: "save", label: "연금저축 올해 넣은(넣을) 돈", ph: "예: 400"},
        {id: "irp", label: "IRP 올해 넣은(넣을) 돈", sub: "본인 추가 납입분", ph: "예: 0"},
        {id: "isa", label: "ISA 만기 → 연금으로 옮긴 돈", ph: "선택"}
      ],
      run: function(v){
        var P = LAW.pen, w = v.wage || 0; if (!w) return null;
        var s = v.save || 0, ir = v.irp || 0, isa = v.isa || 0, rate = w <= P.wageLine ? P.hiRate : P.loRate;
        var sOk = Math.min(s, P.save), base = Math.min(sOk + ir, P.all), isaOk = Math.min(isa * P.isaRate, P.isaMax), tot = base + isaOk, back = tot * rate, room = P.all - base, lost = s - sOk;
        var h = big("돌려받는 세금", won(back), "공제 대상 " + won(tot) + " × " + pct(rate) + (isaOk ? " (ISA 전환분 " + won(isaOk) + " 포함)" : ""), back > 0 ? "ok" : "");
        h += '<div class="tx-lim"><div class="tx-lt"><u style="width:' + (base / P.all * 100).toFixed(1) + '%"></u><i style="left:' + (P.save / P.all * 100).toFixed(1) + '%"><em>연금저축만 600만</em></i></div><p>한도 900만 중 <b>' + won(base) + '</b> 채움' + (room > 0 ? ' · <b class="tx-a">' + won(room) + '</b> 더 넣을 수 있음' : ' · 한도 다 채움') + '</p></div>';
        if (room > 0) h += bars([["지금", back], ["한도까지 채우면", back + room * rate, null, 1]]) + '<p class="tx-n">' + won(room) + ' 더 넣으면 <b class="tx-a">' + won(room * rate) + '</b> 더 돌려받음 (12월 31일 입금분까지)</p>';
        h += tips("체크", [
          lost > 0 ? "연금저축 " + won(s) + " 중 <b>600만 넘는 " + won(lost) + "은 공제 안 됨</b> — 그만큼은 IRP로 넣어야 공제됨" : "",
          w > P.wageLine && w <= P.wageLine * 1.06 ? "연봉이 5,500만을 조금 넘어 공제율이 13.2% — 5,500만 이하면 16.5%" : "",
          !isa ? "ISA 만기 자금을 60일 안에 연금계좌로 옮기면 옮긴 돈의 10%(최대 300만)를 한도와 별도로 더 공제" : "",
          "55세 전에 깨면 기타소득세 16.5% — 넣기 전에 묶여도 되는 돈인지 확인"]);
        h += basis(["공제율: 총급여 5,500만 이하 16.5% · 초과 13.2% (지방소득세 포함) — 근로소득만 있다고 보고 계산 · 사업자는 종합소득금액 4,500만 기준",
          "한도: 연금저축 600만 · IRP 합쳐 900만 · 넣는 것 자체는 연 1,800만까지",
          "낸 세금(결정세액)보다 많이는 못 돌려받음 — 이미 다른 공제로 세금이 0이면 환급도 0",
          "회사가 넣어 주는 퇴직연금(DB·DC 회사 부담분)은 해당 없음"]);
        return h; } },

    { k: "ret", ic: "🧳", t: "퇴직소득세", d: "한 번에 vs 연금으로 받기",
      fields: [
        {id: "pay", label: "퇴직금", sub: "세전", req: 1, ph: "예: 30000"},
        {id: "yrs", label: "근속연수", unit: "년", req: 1, ph: "예: 25", max: 60},
        {id: "span", label: "연금으로 나눠 받을 기간", unit: "년", ph: "기본 20", max: 50}
      ],
      run: function(v){
        var p = v.pay || 0, n = Math.ceil(v.yrs || 0); if (!p || !n) return null;
        var Y = Math.max(1, Math.round(v.span || 20));
        var d1 = n <= 5 ? 100 * n : n <= 10 ? 500 + 200 * (n - 5) : n <= 20 ? 1500 + 250 * (n - 10) : 4000 + 300 * (n - 20);
        var conv = Math.max(0, p - d1) * 12 / n;
        var d2 = conv <= 800 ? conv : conv <= 7000 ? 800 + (conv - 800) * .6 : conv <= 10000 ? 4520 + (conv - 7000) * .55 : conv <= 30000 ? 6170 + (conv - 10000) * .45 : 15170 + (conv - 30000) * .35;
        var base = Math.max(0, conv - d2), tax = itax(base) * n / 12 * LAW.local;
        function keep(yy){ var s = 0; for (var i = 1; i <= yy; i++){ for (var j = 0; j < LAW.ret.keep.length; j++) if (i <= LAW.ret.keep[j][0]){ s += LAW.ret.keep[j][1]; break; } } return s / yy; }
        var rows = [["한 번에 받기", tax, null, 0]], seen = {};
        [10, 20, Y].sort(function(a, b){ return a - b; }).forEach(function(y){ if (seen[y]) return; seen[y] = 1; rows.push([y + "년 연금", tax * keep(y), null, 0]); });
        var mn = rows.reduce(function(a, r){ return r[1] < a[1] ? r : a; }, rows[0]); mn[3] = 1;
        var mine = tax * keep(Y);
        var h = big("한 번에 받으면 세금", won(tax), "퇴직금의 " + pct(p ? tax / p : 0) + " · 실제 받는 돈 " + won(p - tax), tax > 0 ? "bad" : "ok");
        if (tax > 0.05){ h += bars(rows) + '<p class="tx-n">IRP로 옮겨 ' + Y + '년 동안 나눠 받으면 세금 ' + won(mine) + ' — <b class="tx-a">' + won(tax - mine) + '</b> 덜 냄 (' + pct(1 - keep(Y), 0) + ' 감면)</p>';
          h += '<p class="tx-n">' + Y + '년 균등이면 세전 연 ' + won(p / Y) + ' · 월 ' + won(p / Y / 12) + ' 꼴 (운용 수익 빼고)</p>'; }
        else h += '<p class="tx-n">근속연수 공제가 커서 세금이 거의 없음 — 한 번에 받아도 부담 없음</p>';
        h += tips("체크", [
          tax > 0.05 ? "나눠 받는 해가 길수록 유리 — 1~10년째 30% · 11~20년째 40% · <b>21년째부터 50%</b> 감면(2026년 수령분부터)" : "",
          tax > 0.05 ? "IRP로 옮기면 세금을 나중에 내므로 <b>세금 낼 돈까지 굴릴 수 있음</b> (과세이연)" : "",
          "55세 이후 · IRP로 받아야 감면 — 중간에 한꺼번에 찾으면 남은 세금을 그때 다 냄",
          "퇴직금으로 받는 연금은 <b>연 1,500만 한도와 상관없음</b> · 금융소득·건보료에도 안 잡힘"]);
        h += basis(["2023년 이후 퇴직 기준 — 근속연수공제 " + won(d1) + " → 환산급여 " + won(conv) + " → 환산급여공제 " + won(d2) + " → 과세표준 " + won(base),
          "세액 = 과세표준 × 기본세율(6~45%) × 근속연수 ÷ 12 · 지방소득세 10% 포함 · 근속 1년 미만은 1년으로 올림",
          "연금 수령은 매년 같은 금액을 받는다고 가정(연금수령한도 안) · IRP 운용 수익에 붙는 세금은 뺐음",
          "임원 퇴직금 한도 초과분·중간정산 합산 특례·비과세 퇴직급여는 안 넣음"]);
        return h; } },

    { k: "pay", ic: "👵", t: "연금 받을 때 세금", d: "1,500만 선 · 얼마씩 받을까",
      segs: [{id: "life", label: "받는 방식", opts: [["n", "기간 정해서"], ["y", "종신형"]]}],
      fields: [
        {id: "age", label: "받는 나이", unit: "세", req: 1, ph: "예: 60", max: 110},
        {id: "amt", label: "연금저축·IRP에서 받는 돈", sub: "1년 · 세액공제 받은 돈+수익", req: 1, ph: "예: 1800"},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "선택"},
        {id: "oth", label: "그 밖의 소득", sub: "사업·임대·근로 소득금액", ph: "선택"}
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
        }
        h += tips("체크", [
          A > P.line ? "<b>1원이라도 넘으면 전액</b>이 높은 세율 — 받는 기간을 늘려 연 1,500만 이하로 맞추기" : "",
          v.life !== "y" && age < 80 ? "종신형으로 계약하면 나이와 상관없이 3.3% (2026년~)" : "",
          age < 70 ? "늦게 받을수록 세율이 내려감 — 70세부터 4.4% · 80세부터 3.3%" : "",
          "퇴직금에서 나온 연금·세액공제 안 받은 원금은 1,500만 계산에서 빠짐",
          "연금저축·IRP 연금은 지금은 건보료가 안 붙음(공적연금만 반영) — 제도가 바뀔 수 있음"]);
        h += basis(["사적연금(연금저축·IRP 중 세액공제 받은 돈과 운용 수익) 연 1,500만 이하: 나이별 5.5% · 4.4% · 3.3% 원천징수로 끝 (지방소득세 포함)",
          "1,500만 초과: 전액을 16.5% 분리과세 또는 종합과세 중 선택 — 종합과세는 연금소득공제(최대 900만)와 본인 기본공제 150만만 반영한 어림",
          "연금수령한도를 넘겨 찾는 돈은 연금이 아니라 기타소득(16.5%)으로 과세 — 여기서는 안 봄"]);
        return h; } },

    { k: "ovs", ic: "🌎", t: "해외주식 양도세", d: "올해 얼마 · 손실로 줄이기",
      fields: [
        {id: "gain", label: "올해 판 종목의 이익 합계", sub: "원화 기준", req: 1, ph: "예: 3000"},
        {id: "loss", label: "올해 판 종목의 손실 합계", ph: "예: 500"},
        {id: "un", label: "아직 안 판 종목의 평가손실", sub: "연말 전에 팔 수 있는 것", ph: "선택"}
      ],
      run: function(v){
        var L = LAW.ovs, g = v.gain || 0; if (!g) return null;
        var l = Math.abs(v.loss || 0), u = Math.abs(v.un || 0), net = g - l, tax = Math.max(0, net - L.ded) * L.rate, tax2 = Math.max(0, net - u - L.ded) * L.rate;
        var h = big("내년 5월에 낼 세금", won(tax), tax > 0 ? "순이익 " + won(net) + " − 공제 250만 = " + won(net - L.ded) + " × 22%" : "순이익 " + won(net) + " — 250만 공제 안이라 세금 없음 (신고는 해야 함)", tax > 0 ? "bad" : "ok");
        if (u > 0 && tax > 0) h += bars([["지금대로", tax], ["손실 종목도 팔면", tax2, null, 1]]) + '<p class="tx-n">평가손실 ' + won(u) + '을 올해 안에 팔아 확정하면 <b class="tx-a">' + won(tax - tax2) + '</b> 덜 냄 — 다시 사도 됨</p>';
        else if (tax > 0) h += '<p class="tx-n">손실 난 해외 종목이 있다면 올해 안에 팔아 이익과 상계 — 손실 100만마다 세금 22만 줄어듦</p>';
        else if (net < L.ded && net > 0) h += '<p class="tx-n">공제가 <b class="tx-a">' + won(L.ded - net) + '</b> 남음 — 이익 난 종목을 그만큼 팔았다 다시 사면 취득가를 세금 없이 높일 수 있음</p>';
        h += tips("체크", [
          "<b>결제일 기준</b> — 12월 마지막 주에 판 건 내년으로 넘어갈 수 있음 · 증권사의 연말 매도 마감일 확인",
          "250만 공제는 <b>1년에 한 번 · 사람마다</b> — 해외주식·국내 과세 주식 합쳐서",
          tax > 0 ? "배우자에게 증여(10년 6억 공제) 뒤 팔기는 <b>1년 넘게 가진 뒤 팔아야</b> 효과 있음 (2025년~)" : "",
          "양도세는 금융소득 2,000만·건보료 계산에 안 들어감 · 배당은 따로 15% 원천징수(금융소득)"]);
        h += basis(["세율 22% = 양도소득세 20% + 지방소득세 2% · 기본공제 연 250만",
          "같은 해 해외주식끼리 이익·손실 합산 · 손실은 다음 해로 못 넘김",
          "환율은 결제일 기준으로 원화 환산 — 넣은 금액이 이미 원화라고 보고 계산 · 수수료·거래세는 이익에서 빼고 넣기",
          "국내 상장 해외 ETF는 양도세가 아니라 배당소득세(15.4%) — 이 계산기 대상 아님"]);
        return h; } },

    { k: "isa", ic: "🧺", t: "ISA 절세", d: "일반 계좌보다 얼마 아끼나",
      segs: [{id: "kind", label: "가입 유형", opts: [["n", "일반형"], ["s", "서민형·농어민"]]}],
      fields: [
        {id: "pf", label: "만기까지 예상 순이익", sub: "이자·배당·ETF 분배금·해외 ETF 차익", req: 1, ph: "예: 1000"},
        {id: "mv", label: "만기 때 연금계좌로 옮길 돈", ph: "선택"}
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
          "국내 주식 매매차익은 원래 세금이 없어 ISA 효과가 없음 — 배당·이자·해외 ETF 쪽이 효과 큼",
          "3년은 채워야 혜택 · 넣은 원금까지는 중간에 찾아도 됨",
          "직전 3년 안에 금융소득종합과세 대상이었으면 가입 불가"]);
        h += basis(["비과세 한도: 일반형 200만 · 서민형·농어민형 400만 · 초과분 9.9% 분리과세 (지방소득세 포함)",
          "납입 한도: 연 2,000만 · 총 1억 (안 쓴 한도는 다음 해로 넘어감)",
          "2026년 세제개편안(국회 심의 중)이 통과되면 2027년부터 한도 이월 폐지 · 총 계약 5년 · 국내 투자용 「생산적 금융 ISA」(연 2,000만·총 2억 · 이자·배당 전액 비과세)가 따로 생김 — 확정되면 이 계산기에 반영",
          "서민형: 총급여 5,000만(종합소득 3,800만) 이하"]);
        return h; } }
  ];

  /* ───────── 화면 ───────── */
  var ST = {};   // 항목별로 넣은 값(메모리에만)
  CALCS.forEach(function(c){ ST[c.k] = {}; (c.segs || []).forEach(function(s){ ST[c.k][s.id] = s.opts[0][0]; }); });
  function sel(){ var k = ls("txsel"); return CALCS.filter(function(c){ return c.k === k; })[0] || null; }
  function pickHtml(c0){ return '<div class="tx-pick">' + CALCS.map(function(c){ return '<button type="button" data-txk="' + c.k + '"' + (c0 && c0.k === c.k ? ' class="on"' : '') + '><span>' + c.ic + '</span><b>' + c.t + '</b><small>' + c.d + '</small></button>'; }).join("") + '</div>'; }
  function formHtml(c){ var v = ST[c.k];
    return head(c.ic + " " + c.t, LAW.asof) +
      (c.segs || []).map(function(s){ return '<div class="tx-seg" role="group" aria-label="' + s.label + '"><em>' + s.label + '</em><div>' + s.opts.map(function(o){ return '<button type="button" data-txs="' + s.id + '" data-v="' + o[0] + '"' + (v[s.id] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join("") + '</div></div>'; }).join("") +
      c.fields.filter(function(f){ return !f.on || f.on(v); }).map(function(f){
        return '<label class="tx-f"><span>' + f.label + (f.req && !f.sub ? '' : '<small>' + (f.req ? '' : '<s>선택</s>') + (f.sub || '') + '</small>') + '</span><i><input data-txf="' + f.id + '" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" maxlength="' + (f.unit ? 3 : 10) + '" placeholder="' + e(f.ph || "") + '" value="' + (v[f.id] ? (f.unit ? v[f.id] : Number(v[f.id]).toLocaleString()) : "") + '"><em>' + (f.unit || "만원") + '</em></i></label>'; }).join("") +
      '<button type="button" class="tx-clr" data-txclr="1">입력 지우기</button>';
  }
  function outHtml(c){ var h = null; try { h = c.run(ST[c.k]); } catch(x){ console.error("tax", x); h = '<p class="tx-n">계산하지 못했어요 — 숫자를 다시 확인해 주세요</p>'; }
    if (h == null){ var need = c.fields.filter(function(f){ return f.req; }).map(function(f){ return f.label; });
      return '<p class="tx-wait"><b>' + need.join(" · ") + '</b>만 넣으면 바로 계산돼요<small>나머지는 넣을수록 정확해져요 · 단위는 만원</small></p>'; }
    return head("결과", "넣는 즉시 다시 계산") + h; }
  function view(){ var c = sel();
    return '<div id="tx" data-noemo="1"><section class="card hub-c no-clp" data-cz="done" data-xc="1">' + head("세무계산기", "항목을 고르고 숫자만 넣으면 끝") + pickHtml(c) + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txform"' + (c ? '' : ' hidden') + '>' + (c ? formHtml(c) : '') + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txout"' + (c ? '' : ' hidden') + '>' + (c ? outHtml(c) : '') + '</section>' +
      '<p class="hub-n">' + LAW.asof + ' 세법으로 어림한 참고용 계산 · 넣은 금액은 저장되지 않아요<br>실제 신고·부과 금액은 세무사·국세청 홈택스·건강보험공단에서 확인</p></div>'; }
  function paintOut(){ var c = sel(), o = D.getElementById("txout"); if (c && o){ o.hidden = false; o.innerHTML = outHtml(c); } }
  function paintForm(){ var c = sel(), f = D.getElementById("txform"); if (c && f){ f.hidden = false; f.innerHTML = formHtml(c); } paintOut(); }
  function choose(k, scroll){ ls("txsel", k);
    [].forEach.call(D.querySelectorAll("#tx [data-txk]"), function(b){ b.classList.toggle("on", b.dataset.txk === k); });
    paintForm();
    if (scroll){ var f = D.getElementById("txform"); try { f.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} } }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#tx [data-txk], #tx [data-txs], #tx [data-txclr]"); if (!t) return;
    var c = sel();
    if (t.dataset.txk){ choose(t.dataset.txk, true); return; }
    if (!c) return;
    if (t.dataset.txs){ ST[c.k][t.dataset.txs] = t.dataset.v; paintForm(); return; }
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
    ".tx-clr{display:block;margin:8px 0 0 auto;font:inherit;font-size:13px;color:var(--sub);background:transparent;border:0;text-decoration:underline;cursor:pointer;padding:8px 2px}" +
    ".tx-wait{margin:6px 0;font-size:15px;line-height:1.55;text-align:center;color:var(--sub);word-break:keep-all}.tx-wait b{color:var(--text)}.tx-wait small{display:block;font-size:12.5px;margin-top:4px}" +
    ".tx-sec{margin:18px 0 8px;font-size:13.5px;font-weight:800;color:var(--sub)}" +
    ".tx-big{border-radius:16px;padding:14px 16px;margin:0 0 10px;background:rgba(128,128,128,.10)}.tx-big small{display:block;font-size:13.5px;font-weight:700;color:var(--sub)}" +
    ".tx-big b{display:block;font-size:28px;font-weight:800;letter-spacing:-.6px;line-height:1.25;font-variant-numeric:tabular-nums;word-break:keep-all}.tx-big span{display:block;font-size:13.5px;color:var(--sub);line-height:1.5;margin-top:3px;word-break:keep-all}" +
    ".tx-big.tx-ok{background:rgba(49,130,246,.10)}.tx-big.tx-ok b{color:#3182f6}.tx-big.tx-bad{background:rgba(240,68,82,.10)}.tx-big.tx-bad b{color:#f04452}" +
    ".tx-bars{margin:12px 0 4px}.tx-b{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:baseline;margin:0 0 10px}.tx-b>span{font-size:13.5px;font-weight:600;color:var(--sub);word-break:keep-all}.tx-b>b{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".tx-b>i{grid-column:1/3;display:block;height:12px;border-radius:6px;background:rgba(128,128,128,.14);overflow:hidden}.tx-b>i u{display:block;height:100%;border-radius:6px;background:rgba(128,128,128,.55);text-decoration:none}" +
    ".tx-b.tx-best>span{color:var(--text);font-weight:800}.tx-b.tx-best>b{color:#3182f6}.tx-b.tx-best>i u{background:#3182f6}" +
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
