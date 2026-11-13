/* 📏 11/13 A11/13-1 「선이 내려오는 날 — 가격이 가만히 있어도 50일선·장기선이 지금 값에 닿는 날짜」 (사용자 「진행」)
   규칙의 기준선(50일선·200일선)은 지난 n개 종가의 평균이라 옛 종가가 하루씩 빠지며 스스로 움직임 →
   만드는 쪽 bear_gate.py 가 bear.json markets[]/more[] 에 meet 칸(최근 60일 가격·선 + 「오늘 종가 그대로면」 선의 앞길 + 닿는 거래일·날짜)을 붙이고 앱은 그리기만.
   붙는 곳: ① 🏠 「📏 언제 다시 사나 ▾」 펼침 — 그림(가격선·선 두 가닥 + 그대로면 점선)과 「오늘 당장이면 +x% ↔ 그대로면 약 n거래일 뒤」 한 문장(본체)
           ② 🐻 계기판 시장 줄·체크리스트·🌏 일본·중국·홍콩 줄 — 한 토막씩(글자만)
   예측 아님 · 산수 · 「닿음 ≠ 사기」(규칙 조건은 종가 기준 그대로) · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function mn(v){ return String(v).replace("-", "−"); }
  function pct(v){ return (v > 0 ? "+" : "") + mn(v) + "%"; }
  function num(v){ return v == null ? "–" : mn(Math.round(v).toLocaleString("en-US")); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  var LN = {m50: "50일선", m200: "장기 평균선(200일)", dd20: "고점 −20% 선"};
  function lname(L){ return LN[L.k] || L.k; }

  /* 한 문장 — 두 날 사이 */
  function sentence(L, short){
    var ln = lname(L), lv = num(L.lv);
    if (L.k === "dd20") return "📏 " + ln + "(" + lv + ")까지 " + pct(L.need) + " · 이 선은 움직이지 않아요";
    var slope = L.slope != null ? " · 선은 요즘 하루 약 " + (L.slope > 0 ? "+" : "") + mn(L.slope) + "p" : "";
    if (L.above){   // 가격이 선 위 — 선이 올라와 닿으면 「아래로」 시작
      return "📏 지금 " + ln.replace(/\(.*\)/, "") + "(" + lv + ")보다 " + pct(-L.need) + " 위" + (L.days ? " · 가격이 그대로면 약 " + L.days + "거래일 뒤(" + md(L.date) + ") 선이 올라와 닿아요" : " · 가격이 그대로면 " + (L.proj ? L.proj.length : 130) + "거래일 안엔 안 닿아요") + slope + (short ? "" : " · 예측 아님, 산수");
    }
    var a = "오늘 당장이면 " + pct(L.need) + "(" + lv + ")";
    var b = L.days ? "가격이 그대로면 약 " + L.days + "거래일 뒤(" + md(L.date) + ") 선이 내려와 닿아요" : "가격이 그대로면 " + (L.proj ? L.proj.length : 130) + "거래일 안엔 안 닿아요 — 가격이 올라야 만나요";
    return "📏 " + ln + " — " + a + " ↔ " + b + (short ? "" : " · 실제는 이 사이 어딘가" + slope + " · 예측 아님, " + L.n + "개 종가 평균의 산수");
  }

  /* 그림 — 최근 60일 가격선·선 + 오른쪽 「그대로면」 점선 두 가닥 + 닿는 점 */
  function chart(L, name){
    var H = L.hist || []; if (H.length < 10) return "";
    var P = L.px, proj = (L.proj || []).slice(0, L.days || Math.min(60, (L.proj || []).length));
    if (!L.days && proj.length > 60) proj = proj.slice(0, 60);
    var N = H.length + proj.length, W = 340, HT = 128, pl = 6, pr = 64, pt = 12, pb = 20;
    var vals = [P]; H.forEach(function(h){ vals.push(h[0], h[1]); }); proj.forEach(function(v){ vals.push(v); });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
    function X(i){ return pl + (W - pl - pr) * i / Math.max(1, N - 1); }
    function Y(v){ return pt + (HT - pt - pb) * (1 - (v - lo) / (hi - lo)); }
    var px = H.map(function(h, i){ return X(i).toFixed(1) + "," + Y(h[0]).toFixed(1); }).join(" ");
    var ma = H.map(function(h, i){ return X(i).toFixed(1) + "," + Y(h[1]).toFixed(1); }).join(" ");
    var i0 = H.length - 1, xt = X(i0);
    var ppx = proj.length ? [xt.toFixed(1) + "," + Y(P).toFixed(1)].concat(proj.map(function(v, j){ return X(i0 + j + 1).toFixed(1) + "," + Y(P).toFixed(1); })).join(" ") : "";
    var pma = proj.length ? [xt.toFixed(1) + "," + Y(H[i0][1]).toFixed(1)].concat(proj.map(function(v, j){ return X(i0 + j + 1).toFixed(1) + "," + Y(v).toFixed(1); })).join(" ") : "";
    var xe = X(N - 1), ye = Y(P);
    var meet = L.days ? '<circle class="mt-dot" cx="' + xe.toFixed(1) + '" cy="' + ye.toFixed(1) + '" r="4"/><text class="mt-t mt-td" x="' + (xe + 6).toFixed(1) + '" y="' + (ye - 6).toFixed(1) + '">약 ' + e(md(L.date)) + '</text><text class="mt-t" x="' + (xe + 6).toFixed(1) + '" y="' + (ye + 8).toFixed(1) + '">' + L.days + '거래일 뒤</text>' : '';
    var lab = '<text class="mt-t" x="' + (xt + 4).toFixed(1) + '" y="' + (Y(H[i0][1]) + (H[i0][1] > P ? -5 : 11)).toFixed(1) + '">' + e(lname(L).replace(/\(.*\)/, "")) + ' ' + e(num(L.lv)) + '</text>' +
              '<text class="mt-t" x="' + (xt + 4).toFixed(1) + '" y="' + (ye + (H[i0][1] > P ? 11 : -5)).toFixed(1) + '">지금 ' + e(num(P)) + '</text>';
    return '<svg class="mt-svg" viewBox="0 0 ' + W + ' ' + HT + '" role="img" aria-label="' + e(name) + ' 가격과 ' + e(lname(L)) + ' — 가격이 그대로면 선이 닿는 날">' +
      '<line class="mt-ax" x1="' + xt.toFixed(1) + '" y1="' + pt + '" x2="' + xt.toFixed(1) + '" y2="' + (HT - pb) + '"/>' +
      '<polyline class="mt-ma" points="' + ma + '"/><polyline class="mt-px" points="' + px + '"/>' +
      (proj.length ? '<polyline class="mt-ma mt-dash" points="' + pma + '"/><polyline class="mt-px mt-dash" points="' + ppx + '"/>' : '') + meet + lab +
      '<text class="mt-t mt-x" x="' + pl + '" y="' + (HT - 5) + '">' + H.length + '거래일 전</text><text class="mt-t mt-x" x="' + xt.toFixed(1) + '" y="' + (HT - 5) + '" text-anchor="middle">오늘</text>' +
      (proj.length ? '<text class="mt-t mt-x" x="' + xe.toFixed(1) + '" y="' + (HT - 5) + '" text-anchor="end">그대로면 →</text>' : '') + '</svg>';
  }

  /* ① 📏 언제 다시 사나 펼침 — 한국 시장 전부(그림 + 문장) */
  function block(m){
    var M = (m.meet && m.meet.lines) || []; if (!M.length) return "";
    return '<div class="mt-box"><div class="mt-h">' + (m.nat === "kr" ? "🇰🇷" : m.nat === "us" ? "🇺🇸" : "") + ' <b>' + e(m.name) + '</b> <small>선이 내려오는 날 · ' + e(md(m.meet.asof)) + ' 종가</small></div>' +
      M.map(function(L){ return (L.k === "dd20" ? "" : chart(L, m.name)) + '<p class="mt-s">' + e(sentence(L)) + '</p>'; }).join("") + '</div>';
  }
  window.__meetHtml = function(w, BR){
    var A = ((BR && BR.markets) || []).filter(function(m){ return m.nat === "kr" && m.meet && m.meet.lines && m.meet.lines.length; });
    if (!A.length && w && w.meet) A = [w];
    if (!A.length) return "";
    return '<div class="mt-wrap">' + A.map(block).join("") + '<p class="mt-n">선은 지난 50·200개 종가의 평균이라 옛 종가가 빠지면서 날마다 움직여요 — 「그대로면」은 오늘 종가가 안 변한다는 가정의 산수(예측 아님) · 닿았다고 사는 게 아니라 규칙 조건(종가 기준)은 그대로 · 휴장일 안 셈 · 사라·팔라는 뜻 아님</p></div>';
  };
  /* 요약 줄 꼬리 「· 그대로면 약 1/8」 */
  window.__meetTail = function(w){
    var L = ((w && w.meet && w.meet.lines) || []).filter(function(x){ return x.days && !x.above; })[0];
    return L ? " · 그대로면 약 " + md(L.date) : "";
  };
  /* ② 한 토막(글자만) — 계기판 체크리스트·시장별 방식 줄·🌏 줄 */
  window.__meetLine = function(m, cls){
    var M = (m && m.meet && m.meet.lines) || []; if (!M.length) return "";
    return M.map(function(L){ return '<p class="' + (cls || "mt-line") + '">' + e(sentence(L, true)) + '</p>'; }).join("");
  };

  var css = document.createElement("style"); css.id = "ux1113css";
  css.textContent =
    ".mt-wrap{margin:8px 0 4px}.mt-box{margin:0 0 10px;padding:8px 10px;border:1px solid var(--line,#e5e7eb);border-radius:12px}" +
    ".mt-h{font-size:13px;margin-bottom:4px}.mt-h small{color:var(--sub,#888);font-weight:600;margin-left:4px}" +
    ".mt-svg{width:100%;height:auto;display:block;margin:2px 0 4px}.mt-px{fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}.mt-ma{fill:none;stroke:#2f80ed;stroke-width:2;stroke-linejoin:round}" +
    ".mt-dash{stroke-dasharray:4 3;stroke-width:1.6;opacity:.85}.mt-ax{stroke:rgba(127,127,127,.5);stroke-dasharray:2 3}.mt-dot{fill:#e5484d}" +
    ".mt-t{font-size:9.5px;fill:var(--sub,#888);font-weight:700}.mt-td{fill:#e5484d;font-size:10.5px}.mt-x{font-size:9px;font-weight:600}" +
    ".mt-s{margin:2px 0 6px;font-size:13px;line-height:1.5;word-break:keep-all}.mt-n{margin:2px 0 0;font-size:11.5px;color:var(--sub,#888);line-height:1.45;word-break:keep-all}" +
    ".mt-line{margin:4px 0 0;font-size:12.5px;line-height:1.5;word-break:keep-all;color:var(--text,#111)}.bmm .mt-line{display:block;margin:2px 0 0;font-size:11.5px;color:var(--sub,#888)}" +
    ":root[data-ui=light] .mt-ma{stroke:#2f80ed}:root:not([data-ui=light]) .mt-ma{stroke:#5aa0ff}";
  document.head.appendChild(css);
})();
