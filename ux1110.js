/* 📨 11/10 A11/10-1 「이번 하락장 반등 날 n번, 그 뒤엔」 — 반등 날에만 뜨는 기록 카드 (사용자 「네 추천 진행시켜」)
   코스피가 🐻 하락장이고 오늘 +3% 넘게 오른 날에만:
   ─ 🔰 쉬운 첫 화면 「그래서 오늘은」 밑 · 전체 메뉴 🏠 🛡 결론 카드 밑(계기판 위) · 📨 고객 한 장(시장) 한 줄
   ─ 「7/8 하락장 시작 뒤 +3% 넘게 오른 날 n번 — 그 뒤 20거래일 안에 그날까지 저점을 다시 깬 때 m번 · 안 깬 때 k번 · 미정 j번」 + 이번 하락장만의 점 띠
   ─ n < 3 이면 안 띄움 · 과거 하락장 겹치기 없음 · 확률 % 없음 · 「규칙은 그대로, 이건 기록」
   계산은 만드는 쪽(market-strategy-report src/bear_gate.py rebounds() → bear.json 코스피 칸 rebounds) — 이 파일은 그리기만 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function sg(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }

  // bear.json(전체) 또는 코스피 칸 → 오늘 보여 줄 정보 (없으면 null)
  function info(B, chg){
    var m = B && B.markets ? B.markets.filter(function(x){ return x.key === "kospi"; })[0] : B;
    var R = m && m.rebounds;
    if (!m || m.state !== "🐻" || !R || !(R.n >= (R.min || 3))) return null;
    chg = chg == null ? null : +String(chg).replace("−", "-");
    if (chg == null || isNaN(chg) || chg < (R.up || 3)) return null;
    var k = kst(), wd = k.getUTCDay(), hm = k.getUTCHours() * 60 + k.getUTCMinutes();
    if (wd === 0 || wd === 6 || hm < 9 * 60) return null;     // 장 열기 전엔 「오늘」 등락이 아님
    var td = today(), pts = R.pts || [], inPts = pts.some(function(p){ return p.d === td; });
    var last = pts[pts.length - 1];
    return {m: m, R: R, chg: chg, td: td, inPts: inPts, last: last};
  }

  function lastLine(p){
    if (!p) return "";
    var t = "가장 최근 " + md(p.d) + " " + sg(p.r1) + " → ";
    if (p.out === "broke") t += p.bd + "거래일 뒤 저점 다시 깸";
    else if (p.out === "held") t += "20거래일 동안 안 깸" + (p.r20 != null ? " (20일 뒤 " + sg(p.r20) + ")" : "");
    else t += "아직 " + p.left + "거래일 남음 · 미정";
    return t;
  }

  // 이번 하락장만의 점 띠 (날짜 비례 · 안 깸 = 빨강 · 다시 깸 = 파랑 · 미정 = 회색 · 오늘 = 빈 동그라미)
  function strip(I){
    var R = I.R, t0 = Date.parse(R.from), t1 = Date.parse(I.td), W = 300, L = 8, Rr = 292;
    if (!(t1 > t0)) return "";
    var x = function(d){ return L + (Date.parse(d) - t0) / (t1 - t0) * (Rr - L); };
    var col = {held: "var(--up,#e66767)", broke: "var(--down,#3987e5)", open: "var(--dim,#8a93a5)"};
    var dots = (R.pts || []).map(function(p){ return '<circle cx="' + x(p.d).toFixed(1) + '" cy="14" r="5" fill="' + col[p.out] + '"><title>' + e(md(p.d) + " " + sg(p.r1)) + '</title></circle>'; }).join("");
    var now = I.inPts ? "" : '<circle cx="' + Rr + '" cy="14" r="5" fill="none" stroke="var(--text,#e8ecf4)" stroke-width="1.6"/>';
    return '<svg class="rbx-sv" viewBox="0 0 ' + W + ' 28" preserveAspectRatio="none" aria-hidden="true"><line x1="' + L + '" y1="14" x2="' + Rr + '" y2="14" stroke="var(--line,rgba(127,127,127,.35))" stroke-width="1.5"/>' + dots + now + '</svg>' +
      '<div class="rbx-ax"><span>' + e(md(R.from)) + ' 하락장 시작</span><span>오늘</span></div>' +
      '<div class="rbx-lg"><i style="background:var(--up,#e66767)"></i>안 깸 <i style="background:var(--down,#3987e5)"></i>다시 깸' + (R.open ? ' <i style="background:var(--dim,#8a93a5)"></i>미정' : '') + (I.inPts ? '' : ' <i class="o"></i>오늘') + '</div>';
  }

  function main(I){
    var R = I.R;
    return md(R.from) + " 하락장 시작 뒤 <b>+" + (R.up || 3) + "% 넘게 오른 날 " + R.n + "번</b> — 그 뒤 " + (R.nd || 20) + "거래일 안에 그날까지의 저점을 " +
      '다시 깬 때 <b class="rbx-d">' + R.broke + "번</b> · 안 깬 때 <b class=\"rbx-u\">" + R.held + "번</b>" + (R.open ? " · 아직 " + (R.nd || 20) + "일 안 지나 미정 " + R.open + "번" : "");
  }

  // 화면 카드 (where: "ez" 쉬운 화면 · "home" 전체 메뉴 홈)
  window.__rebCard = function(B, chg, where){
    var I = info(B, chg); if (!I) return "";
    return '<section class="rbx-c' + (where === "ez" ? " ez" : " card") + '" id="rbcard" data-cz="done">' +
      '<div class="rbx-h">📈 이번 하락장 반등 날 ' + I.R.n + '번, 그 뒤엔 <small>오늘 코스피 ' + sg(I.chg) + '</small></div>' +
      '<p class="rbx-m">' + main(I) + '</p>' +
      (I.last ? '<p class="rbx-s">' + e(lastLine(I.last)) + (I.inPts ? '' : ' · 오늘 ' + sg(I.chg) + '은 마감 뒤 ' + (I.R.n + 1) + '번째로 들어가요') + '</p>' : '') +
      strip(I) +
      '<p class="rbx-n">규칙은 그대로, 이건 기록 · 종가 기준 · 이번 하락장 안에서만 셈 · 사라·팔라는 뜻 아님</p></section>';
  };

  // 📨 고객 한 장 한 줄 ({h, t, tone, max} · onepage.js note 블록)
  window.__rebNote = function(B, chg){
    var I = info(B, chg); if (!I) return null;
    var R = I.R;
    return {h: "📈 이번 하락장 반등 날 " + R.n + "번, 그 뒤엔",
      t: md(R.from) + " 하락장 시작 뒤 +" + (R.up || 3) + "% 넘게 오른 날 " + R.n + "번 중 " + (R.nd || 20) + "거래일 안에 저점을 다시 깬 때 " + R.broke + "번 · 안 깬 때 " + R.held + "번" + (R.open ? " · 미정 " + R.open + "번" : "") + " — 반등 하루로 판단하지 않고 정한 규칙대로 가요 (종가 기준 기록)",
      tone: "dark", max: 3};
  };

  var css = document.createElement("style");
  css.textContent =
    ".rbx-c{margin:10px 0;padding:12px 14px;border-radius:14px;background:var(--panel,rgba(127,127,127,.08));box-shadow:inset 0 0 0 1px var(--line,rgba(127,127,127,.25))}" +
    ".rbx-c.card{margin:10px 0}" +
    ".rbx-h{font-size:15px;font-weight:900;line-height:1.35;word-break:keep-all}.rbx-h small{display:block;margin-top:2px;font-size:12px;font-weight:700;color:var(--up,#e66767)}" +
    ".rbx-m{margin:6px 0 2px;font-size:14px;line-height:1.55;word-break:keep-all}.rbx-u{color:var(--up,#e66767)}.rbx-d{color:var(--down,#3987e5)}" +
    ".rbx-s{margin:2px 0 6px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".rbx-sv{display:block;width:100%;height:28px}" +
    ".rbx-ax{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-top:-2px}" +
    ".rbx-lg{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin-top:4px;font-size:12px;color:var(--sub)}.rbx-lg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:3px}.rbx-lg i.o{background:none;box-shadow:inset 0 0 0 1.5px var(--text,#e8ecf4)}" +
    ".rbx-n{margin:6px 0 0;font-size:12px;color:var(--sub);line-height:1.5;word-break:keep-all}";
  document.head.appendChild(css);
})();
