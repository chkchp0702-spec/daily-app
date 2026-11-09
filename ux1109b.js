/* 🌱 11/09 A11/9-1 「신호가 켜지면 — 바닥 신호 4개의 과거 성적표」 (사용자 「다 진행해」)
   bear.json 시장마다 hist(src/bear_gate.py --bt → market/bear_sig_bt.json, 2000년부터 과거 🐻 하락장마다)를
   🐻 하락장 계기판 체크리스트(오늘 홈 · 쉬운 화면 「지금 규칙」 펼침)에 붙인다.
   ─ 머리: 신호 2·3·4개가 처음 켜진 날 → 6개월 뒤 코스피가 올라 있던 때 / 내려 있던 때 · 그날 뒤 바닥이 더 남아 있던 때 (「n번 중 m번」으로만)
   ─ 신호 줄 밑: 바닥 뒤 보통 며칠 · 바닥보다 몇 % 위에서 켜짐 · 「켜졌다가 더 빠진 적」은 누르면
   ─ 오늘 켜진 신호는 「🟢 켜짐」 · 이번 하락장에서 켜졌다 꺼진 횟수 한 줄
   숫자는 자료 그대로 · 평균·확률 % 안 씀 · 매수 권유 문구 없음 · 계산은 만드는 쪽(이 파일은 그리기만) */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pc(v){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(Math.round(v)) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  var NUM = ["①", "②", "③", "④"];

  function stepLine(n, s, nm){
    if (!s) return "";
    if (!s.hit) return '<li><b>신호 ' + n + '개</b> — 과거 하락장 ' + s.eps + '번 안에선 ' + n + '개가 한꺼번에 켜진 적 없음</li>';
    var r6n = (s.pos6 || 0) + (s.neg6 || 0);
    return '<li><b>신호 ' + n + '개</b> 처음 켜진 날 → 6개월 뒤 ' + e(nm) + ' 올라 있던 때 <b class="bs-u">' + s.pos6 + '번</b> · 내려 있던 때 <b class="bs-d">' + s.neg6 + '번</b>' +
      (r6n < s.hit ? ' <small>(' + (s.hit - r6n) + '번은 6개월이 아직 안 지남)</small>' : '') +
      '<br><small>그날 뒤로 바닥이 더 남아 있던 때 ' + s.early + '번' + (s.worst_more ? ' (가장 깊게 ' + e(s.worst_more.y) + '년 ' + pc(s.worst_more.more) + ' 더)' : '') + ' · ' + s.eps + '번 중 ' + s.hit + '번 켜짐</small></li>';
  }

  // 체크리스트 한 줄 밑에 붙는 과거 한 줄 (k = 0~3)
  window.__bearSigLine = function(m, k){
    var h = m && m.hist, s = h && h.sig && h.sig[k], c = m && m.checks && m.checks[k]; if (!s) return "";
    var fresh = (m.fresh || []).indexOf(k) >= 0, on = c && c.on;
    var main = !s.on ? '과거 하락장 ' + s.eps + '번: 바닥 뒤엔 한 번도 안 켜짐'
      : '과거 ' + s.eps + '번 중 ' + s.on + '번 · 보통 바닥 <b>' + Math.round(s.after) + '거래일</b> 뒤 · 바닥보다 <b>' + pc(s.up) + '</b> 위에서 켜짐';
    var fk = s.fake_eps ? '<details class="bs-f"><summary>켜졌다가 더 빠진 적 ' + s.eps + '번 중 ' + s.fake_eps + '번</summary><p>하락장 ' + s.fake_eps + '번에서 모두 ' + s.fake_n + '회 켜졌다가, 그 뒤 더 낮은 바닥이 나왔어요' +
      (s.fake_worst ? ' · 가장 깊게 ' + e(s.fake_worst.y) + '년 켜진 뒤 ' + pc(s.fake_worst.more) + ' 더 빠짐' : '') + '.' + (k === 3 && h.note4 ? ' ' + e(h.note4) + '.' : '') + '</p></details>'
      : (s.on ? '<small class="bs-ok">켜졌다가 더 빠진 적 없음</small>' : '');
    return '<div class="bs-l' + (on ? " on" : "") + '">' + (on ? '<b class="bs-on">🟢 ' + (fresh ? "오늘 " : "") + '켜짐</b> · ' : '') + '📜 ' + main + fk + '</div>';
  };

  // 체크리스트 위에 붙는 머리 (신호 n개째 처음 켜진 날 뒤 6개월)
  window.__bearSigHead = function(m){
    var h = m && m.hist; if (!h || !h.step) return "";
    var nm = m.name || "", S = h.step, eps = (S["2"] || {}).eps;
    var now = h.now && h.now.fake ? h.now.fake.map(function(n, i){ return n ? NUM[i] + ' ' + n + '회' : ""; }).filter(Boolean) : [];
    return '<div class="bs-h"><div class="bs-ht">📜 과거 ' + e(nm) + ' 하락장 ' + (eps || "") + '번이면 <small>' + e(String(h.from || "").slice(0, 4)) + '년부터 · 종가</small></div><ul class="bs-ul">' +
      stepLine(2, S["2"], nm) + stepLine(3, S["3"], nm) + stepLine(4, S["4"], nm) + '</ul>' +
      (h.now ? '<p class="bs-now">이번 하락장(' + md(h.now.in) + '부터 ' + h.now.len + '거래일): ' + (now.length ? '켜졌다가 도로 꺼진 신호 ' + now.join(" · ") : '아직 켜졌다 꺼진 신호 없음') + '</p>' : '') +
      '<p class="bs-n">하락장 수가 적어 「몇 번 중 몇 번」으로만 봐요 · 과거일 뿐 앞날 보장 아님 · 사라·팔라는 뜻 아님' + (h.note4 ? ' · ' + e(h.note4) : '') + '</p></div>';
  };

  var css = document.createElement("style");
  css.textContent =
    ".bs-h{margin:8px 0 6px;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08));box-shadow:inset 0 0 0 1px var(--line,rgba(127,127,127,.25))}" +
    ".bs-ht{font-size:14px;font-weight:900}.bs-ht small{font-size:12px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".bs-h ul{margin:6px 0 4px;padding-left:16px;font-size:13.5px;line-height:1.55;word-break:keep-all}.bs-h li{margin:3px 0}.bs-h li small{color:var(--sub);font-size:12.5px}" +
    ".bs-u{color:var(--up)}.bs-d{color:var(--down)}" +
    ".bs-now{margin:4px 0 0;font-size:13px;font-weight:700;word-break:keep-all}.bs-n{margin:4px 0 0;font-size:12px;color:var(--sub);line-height:1.5;word-break:keep-all}" +
    ".bs-l{display:block;width:100%;margin:3px 0 2px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all;font-weight:500}.bs-l b{color:var(--text)}.bs-l.on{color:var(--text)}.bs-on{color:#1f9d55!important}" +
    ".bs-f{margin-top:2px}.bs-f summary{cursor:pointer;list-style:none;color:var(--acc,#3182f6);font-weight:700}.bs-f summary::-webkit-details-marker{display:none}.bs-f p{margin:3px 0 0}.bs-ok{display:block;color:var(--sub)}" +
    ".bg-ck li .bs-l{grid-column:2}.bg-ck li .bs-l b{color:var(--text);font-weight:800}.bg-ck li .bs-l b.bs-on{color:#1f9d55}.bg-ck li .bs-l small{font-size:12.5px}" +
    ".ez-rule li .bs-l{margin-left:22px;width:auto}.ez-rule li .bs-l small{margin-left:0!important;display:block}.ez-rule .bs-h ul.bs-ul{list-style:disc;padding-left:16px;margin:6px 0 4px}.ez-rule .bs-h li{font-size:13.5px}.ez-rule .bs-h li small{display:inline;margin-left:0}.ez-rule .bs-h p{margin:4px 0 0}" +
    ".bs-h ul.bs-ul{list-style:disc}";
  document.head.appendChild(css);
})();
