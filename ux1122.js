/* 🎲 11/22 「들고 가면 · 규칙대로 하면 — 이익 확률」 (사용자: 「지금은 이걸 이렇게 들고 가는 게 이익 볼 확률이 몇 퍼센트다 — 표현은 직관적으로 ·
   왜 그런지는 밑에 자세히 탭으로 · 분할해서 현금/주식 비중을 늘려요 같은 표현도」)
   계산은 만드는 쪽(market-strategy-report src/hold_prob.py → bear.json markets[]/more[] 의 hold 칸: 같은 꼴이었던 과거 달들의 2년 뒤 빈도) — 이 파일은 그리기만.
   붙는 곳: 🐻 하락장 계기판 시장 줄 · 🌏 일본·중국·홍콩 줄 (📏 선이 내려오는 날 한 토막 바로 위 · 새 화면 없음)
   과거 빈도 · 앞날 보장 아님 · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function row(lab, up, big, cls){
    return '<div class="hp-r ' + cls + '"><span class="hp-l">' + lab + '</span><span class="hp-bar"><i style="width:' + Math.max(4, Math.min(100, up)) + '%"></i></span>' +
      '<b>이익 ' + up + '%</b><small>크게 잃을 확률 ' + big + '%</small></div>';
  }
  function holdHtml(m){
    var h = m && m.hold; if (!h || h.hold_up == null) return "";
    var same = h.rule_up == null || (h.rule_up === h.hold_up && h.rule_big === h.hold_big) || (m.analog && m.analog.stock >= 100 && m.analog.k === "floor");
    var why = (h.why || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("");
    return '<div class="hp"><div class="hp-h">🎲 <b>' + e(h.shape_name || "") + '</b> 꼴 — 과거 같은 꼴 ' + e(h.n) + '번의 2년 뒤</div>' +
      row("그냥 들고 가면", h.hold_up, h.hold_big, "hp-a") + (same ? "" : row("규칙대로 하면", h.rule_up, h.rule_big, "hp-b")) +
      (h.act ? '<p class="hp-act">👉 ' + e(h.act) + '</p>' : '') +
      '<details class="hp-why"><summary>왜 그런가요</summary><ul>' + why + '<li>「크게 잃을 확률」 = 2년 뒤 −20% 넘게 손실로 끝난 비율 · 과거 빈도일 뿐 앞날을 보장하지 않아요 · 매수·매도 추천 아님</li></ul></details></div>';
  }
  window.__holdHtml = holdHtml;
  var prev = window.__meetLine;
  window.__meetLine = function(m, cls){ var a = ""; try { a = holdHtml(m); } catch (_) {} return a + (prev ? prev(m, cls) : ""); };

  var css = document.createElement("style"); css.id = "ux1122css";
  css.textContent =
    ".hp{margin:8px 0 6px;padding:9px 10px;border:1px solid var(--line,#e5e7eb);border-radius:12px;display:block;width:100%;box-sizing:border-box;text-align:left}" +
    ".hp-h{font-size:12px;color:var(--sub,#888);margin-bottom:6px;word-break:keep-all}.hp-h b{color:var(--text,#111)}" +
    ".hp-r{display:grid;grid-template-columns:92px 1fr auto;grid-template-areas:'l bar p' 'l s s';column-gap:8px;align-items:center;margin:5px 0}" +
    ".hp-l{grid-area:l;font-size:12.5px;font-weight:700;word-break:keep-all}.hp-bar{grid-area:bar;height:10px;border-radius:6px;background:rgba(127,127,127,.18);overflow:hidden;display:block}" +
    ".hp-bar i{display:block;height:100%;border-radius:6px;background:#9aa3ad}.hp-b .hp-bar i{background:#2f80ed}" +
    ".hp-r b{grid-area:p;font-size:14px;white-space:nowrap}.hp-b b{color:#2f80ed}.hp-r small{grid-area:s;font-size:11.5px;color:var(--sub,#888);display:block;margin:1px 0 0}" +
    ".hp-act{margin:7px 0 2px;font-size:13px;line-height:1.5;font-weight:700;word-break:keep-all;color:var(--text,#111)}" +
    ".hp-why{margin-top:4px}.hp-why summary{font-size:12px;color:var(--sub,#888);cursor:pointer;padding:4px 0}.hp-why ul{margin:4px 0 0;padding-left:16px}" +
    ".hp-why li{font-size:11.5px;line-height:1.5;color:var(--sub,#888);margin:2px 0;word-break:keep-all;display:list-item}" +
    ":root:not([data-ui=light]) .hp-b .hp-bar i{background:#5aa0ff}:root:not([data-ui=light]) .hp-b b{color:#5aa0ff}";
  document.head.appendChild(css);
})();
