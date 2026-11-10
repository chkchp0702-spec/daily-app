/* 🫧 11/10 버블 경보판 — 「주식보다 채권이 먼저 운다」 (사용자: 전병서 11/11 「AI 버블, 지금 몇 시인가」를 올리며 「네 두뇌에 생각을 더해 · 이 글부터 바로 반영」)
   🏠 오늘 홈 🐻 하락장 계기판 바로 아래 카드 한 장:
   ─ 머리: 🔴·🟠·🟢 개수 띠 + 결론 한 줄(신용 경보 켜짐이면 「출구 설계: 현금 도는 기업·전력/데이터·외상 없는 삽 장수」)
   ─ 📅 분수령 날짜(엔비디아 실적 · FOMC) D-day
   ─ 펼치면: 신용 / 바늘 / 완충 묶음별 칸 — 자동(야후 종가) · 손(두뇌가 출처와 함께 갱신) 꼬리표
   계산은 만드는 쪽(market-strategy-report src/bubble_gate.py → market/bubble.json) — 이 파일은 그리기만 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function dday(d){
    var t = Date.parse(String(d).slice(0, 10) + "T00:00:00+09:00"), n = Date.parse(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + "T00:00:00+09:00");
    var k = Math.round((t - n) / 864e5); return k === 0 ? "오늘" : k > 0 ? "D-" + k : "";
  }
  var GN = {"신용": "💳 신용 — 채권이 먼저 우는 곳", "바늘": "📌 바늘 — 풍선 곁에 모인 것", "완충": "🛟 완충 — 버텨 주는 것"};
  var SC = {"🔴": "r", "🟠": "o", "🟢": "g"};

  window.__bubCard = function(B){
    if (!B || !B.items || !B.items.length) return "";
    var n = (B.red || 0) + (B.orange || 0) + (B.green || 0) || B.items.length;
    var bar = [["r", B.red], ["o", B.orange], ["g", B.green]].map(function(x){ return x[1] ? '<i class="bbx-b' + x[0] + '" style="flex:' + x[1] + '"></i>' : ""; }).join("");
    var cnt = '<span class="bbx-n"><b class="r">🔴 ' + (B.red || 0) + '</b><b class="o">🟠 ' + (B.orange || 0) + '</b><b class="g">🟢 ' + (B.green || 0) + '</b>' + (B.credit_on ? '<em>신용 경보 켜짐</em>' : '') + '</span>';
    var dates = (B.dates || []).slice(0, 3).map(function(d){ var dd = dday(d.d); return '<li><b>' + e(md(d.d)) + (dd ? ' <em>' + dd + '</em>' : '') + '</b><span>' + e(d.t) + '<small>' + e(d.why) + '</small></span></li>'; }).join("");
    var groups = {}; B.items.forEach(function(x){ (groups[x.grp || "바늘"] = groups[x.grp || "바늘"] || []).push(x); });
    var det = ["신용", "바늘", "완충"].filter(function(g){ return groups[g]; }).map(function(g){
      return '<div class="bbx-g"><div class="bbx-gh">' + e(GN[g] || g) + '</div><ul>' + groups[g].map(function(x){
        return '<li class="' + (SC[x.state] || "") + '"><i>' + e(x.state) + '</i><div><b>' + e(x.name) + ' <small>기준: ' + e(x.th) + '</small></b><p>' + e(x.now) + '</p><small class="bbx-src">' +
          (x.auto ? '<em class="a">자동</em> 야후 종가 · ' + e(String(x.at || "").slice(5, 16).replace("-", "/")) : '<em>손</em> ' + e(x.src) + ' · ' + e(md(x.at))) + '</small></div></li>';
      }).join("") + '</ul></div>';
    }).join("");
    var fr = B.frame ? '<details class="bbx-f"><summary>이 틀은 어디서? — ' + e(B.frame.title) + '</summary><ul>' + (B.frame.lines || []).map(function(l){ return '<li>' + e(l) + '</li>'; }).join("") + '</ul></details>' : "";
    return '<section class="card bbx" id="bubble" data-cz="done">' +
      '<div class="bbx-h">🫧 버블 경보판 <small>' + e(md(B.at)) + ' ' + e(String(B.at || "").slice(11, 16)) + ' · 주식보다 채권이 먼저 울어요</small></div>' +
      '<div class="bbx-bar">' + bar + '</div>' + cnt +
      '<p class="bbx-lead' + (B.credit_on || B.red >= 3 ? " warn" : "") + '">' + e(B.lead) + '</p>' + (B.sub ? '<p class="bbx-sub">' + e(B.sub) + '</p>' : '') +
      (dates ? '<ul class="bbx-d">' + dates + '</ul>' : '') +
      '<details class="bbx-det"><summary>' + n + '칸 펼치기 · 무엇이 울고 있나</summary>' + det + fr +
      '<p class="note bbx-ru">자동 칸 기준 — 신용: 하이일드÷국채(HYG/IEF) 20일 −1.5%↓ 🔴 · −0.5%↓ 🟠 / 10년물 5% 위 5일 연속 🔴 · 4.75%↑ 🟠 / 브렌트 100$ 🔴 · 90$ 🟠 / 평균 종목(동일가중 S&P) 1년 고점 −15% 🔴 · −8% 🟠 / ' +
      '현금 도피 = 나스닥100 하루 −5%↓ + 방어주도 하락 + 신용 악화 🔴 · 방어주가 기술주보다 20일 +3%p = 업종 갈아타기 🟠. 생각의 틀이에요 — 포트 비중·현금 규칙은 이 판 혼자 바꾸지 않아요(현금은 🐻 계기판) · 매수·매도 추천 아님.</p></details></section>';
  };

  var css = document.createElement("style");
  css.textContent =
    ".bbx{padding:16px 16px 14px!important}.bbx-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bbx-h small{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--sub)}" +
    ".bbx-bar{display:flex;gap:3px;height:8px;margin:12px 0 8px;border-radius:6px;overflow:hidden}.bbx-bar i{display:block;min-width:6px}.bbx-br{background:#e5484d}.bbx-bo{background:#f59e0b}.bbx-bg{background:#30a46c}" +
    ".bbx-n{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font-size:13px}.bbx-n b{font-weight:800}.bbx-n em{font-style:normal;font-size:12px;font-weight:800;color:#e5484d;padding:2px 8px;border-radius:999px;background:rgba(229,72,77,.12)}" +
    ".bbx-lead{margin:10px 0 0;font-size:14px;font-weight:700;line-height:1.5;word-break:keep-all}.bbx-lead.warn{color:var(--text)}.bbx-sub{margin:4px 0 0;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    ".bbx-d{list-style:none;margin:12px 0 0;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08))}.bbx-d li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.4}.bbx-d li+li{margin-top:8px}" +
    ".bbx-d li>b{flex:0 0 64px;font-weight:900}.bbx-d li>b em{display:block;font-style:normal;font-size:11px;color:#f59e0b}.bbx-d li>span{flex:1;min-width:0;font-weight:700;word-break:keep-all}.bbx-d small{display:block;font-weight:500;color:var(--sub);font-size:12px;margin-top:2px}" +
    ".bbx-det{margin-top:12px}.bbx-det>summary,.bbx-f>summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--accent,#3987e5);list-style:none}.bbx-det>summary::-webkit-details-marker,.bbx-f>summary::-webkit-details-marker{display:none}" +
    ".bbx-g{margin-top:12px}.bbx-gh{font-size:12px;font-weight:800;color:var(--sub);margin-bottom:6px}.bbx-g ul{list-style:none;margin:0;padding:0}" +
    ".bbx-g li{display:flex;gap:8px;padding:9px 10px;border-radius:10px;background:var(--panel,rgba(127,127,127,.06))}.bbx-g li+li{margin-top:6px}.bbx-g li.r{box-shadow:inset 3px 0 0 #e5484d}.bbx-g li.o{box-shadow:inset 3px 0 0 #f59e0b}.bbx-g li.g{box-shadow:inset 3px 0 0 #30a46c}" +
    ".bbx-g li>i{font-style:normal;flex:0 0 auto}.bbx-g li>div{flex:1;min-width:0}.bbx-g li b{font-size:13px;font-weight:800}.bbx-g li b small{font-weight:600;color:var(--sub);font-size:11px;margin-left:4px}" +
    ".bbx-g li p{margin:3px 0 0;font-size:13px;line-height:1.45;word-break:keep-all;overflow-wrap:anywhere}.bbx-src{display:block;margin-top:3px;font-size:11px;color:var(--sub)}.bbx-src em{font-style:normal;font-weight:800;padding:0 5px;border-radius:5px;background:rgba(127,127,127,.18)}.bbx-src em.a{background:rgba(57,135,229,.18)}" +
    ".bbx-f{margin-top:12px}.bbx-f ul{margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.5;word-break:keep-all}.bbx-f li+li{margin-top:4px}.bbx-ru{margin-top:12px!important}";
  document.head.appendChild(css);
  if (window.__h2apply) try { __h2apply(); } catch(x) {}
})();
