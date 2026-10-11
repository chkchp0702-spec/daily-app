/* CH Investing — 🧾 정직 성적 (10/11)
   지금 숫자 옆에 「정직 계산」(다음 날 가격에 사고 · 수수료·세금·환전 비용을 뺀 값)을 나란히.
   ① ☕ 컵 · 📈 갭 탭 맨 위 한 줄: 목록 전체 20일 성적 + 킥이 고르는 돌파 + 정직 계산
   ② HON.chip / HON.tags — 🏠 홈 · 💼 포트 · 📊 성적표에서 같이 씀
   자료(edge·kick·port·home·scores)에 정직 칸이 아직 없으면 조용히 숨김 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var WHY = "다음 날 가격에 사고 수수료·세금·환전 비용을 뺀 값";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function num(v){ return v != null && v !== "" && !isNaN(v); }
  function sg(v, d){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? String(d).slice(5, 10).replace("-", "/") : ""; }
  function oosTxt(o){ return o && o.n ? "뒤 절반(" + md(o.from) + "~, 맞출 때 안 쓴 자료) " + o.n + "건 · 평균 " + sg(o.avg) + (num(o.pf) ? " · 손익비 " + o.pf : "") : ""; }

  // 「정직 +1.0% ⓘ」 칩 — 누르면 무슨 뜻인지
  function chip(v, o){
    if (!num(v)) return "";
    o = o || {};
    var tip = "<b>🧾 정직 계산</b><br>" + WHY + (o.basis ? "<br><small>" + e(o.basis) + "</small>" : "") + (o.n ? "<br>" + o.n + "건" + (num(o.pf) ? " · 손익비 " + o.pf : "") : "") + (oosTxt(o.oos) ? "<br>" + e(oosTxt(o.oos)) : "") + (o.note ? "<br><small>" + e(o.note) + "</small>" : "");
    return '<span class="hon-chip" data-tip="' + e(tip) + '">' + (o.label || "정직") + ' <b class="' + cls(v) + '">' + sg(v, o.d) + '</b> <i>ⓘ</i></span>';
  }
  // 경고 꼬리표: 손익비 1.5 미만 → 「정직 기준 미달」 · 같은 표본으로 고른 필터 → 「같은 자료로 맞춘 값」
  function tags(h){
    if (!h) return "";
    var sr = h.h_n !== undefined;   // 📊 성적표 줄(h_ 칸) — 그 줄의 n·pf 는 정직이 아닌 원래 숫자라 h_ 쪽만 봄
    var n = sr ? h.h_n : h.n, pf = sr ? h.h_pf : h.pf, ins = sr ? h.h_insample : h.insample, out = "";
    if (!n) return "";
    if (pf != null && pf < 1.5) out += '<span class="hon-tag" data-tip="' + e("정직 계산 손익비 " + pf + " — 1.5 아래면 비용·진입 지연을 견딜 만큼 강하다고 보기 어려워요") + '">⚠ 정직 기준 미달</span>';
    if (ins === true) out += '<span class="hon-tag" data-tip="' + e("이 필터를 고를 때 쓴 같은 자료로 잰 값이라 실제보다 좋아 보일 수 있어요") + '">같은 자료로 맞춘 값</span>';
    return out;
  }
  function whale(p){ return p && p.fixed ? '<span class="hon-tag" data-tip="' + e(p.why_note || "4분기 표본 · 코드에 고정된 판정") + '">4분기 표본·고정 판정</span>' : ""; }
  // 칩·꼬리표를 눌러도 카드 이동(data-goto)이 일어나지 않게 — 설명만
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest(".hon-chip,.hon-tag"); if (t){ ev.preventDefault(); ev.stopPropagation(); } }, true);

  var t5 = function(){ return Math.floor(Date.now() / 300000); };
  function edge(){ return getJSON(RAW + "edge.json?" + t5()).catch(function(){ return null; }); }
  function perf(name){ return getJSON("archive/x/" + name + "?" + ((window.M && M.updated) || "")).catch(function(){ return null; }); }
  window.HON = {chip: chip, tags: tags, whale: whale, edge: edge, WHY: WHY};

  /* ---------- ① 컵·갭 탭 맨 위 한 줄 ---------- */
  function line(kind, el){
    var box = document.createElement("div"); box.className = "hon-line"; box.style.display = "none"; el.insertBefore(box, el.firstChild);
    Promise.all([perf(kind === "cup" ? "perf_cup.json" : "perf_gap.json"), edge()]).then(function(r){
      var A = r[0] && r[0].stats && r[0].stats.all && r[0].stats.all.r20, E = r[1] && r[1][kind], parts = [];
      if (A && A.n) parts.push('목록 전체 20일 평균 <b class="' + cls(A.avg) + '">' + sg(A.avg) + '</b><span class="mut">(승률 ' + Math.round(A.win) + '%, ' + A.n + '건)</span>');
      var K = E ? (kind === "cup" ? E.brk_real_kick : (E["돌파_by_size"] || {})["4-8%"]) : null, H = E && E.honest;
      if (K && num(K.avg) || H && num(H.avg)) parts.push((kind === "cup" ? "킥이 고르는 돌파" : "킥이 고르는 갭 4~8%") + ': ' +
        (K && num(K.avg) ? '<b class="' + cls(K.avg) + '">' + sg(K.avg) + '</b>' : '') +
        (H && num(H.avg) ? ' / ' + chip(H.avg, {label: "정직", basis: H.basis, n: H.n, pf: H.pf, oos: H.oos}) + tags(H) : '') +
        (H && num(H.avg) ? ' <span class="mut">(다음 날 진입·비용 뺌)</span>' : ''));
      if (!parts.length) { box.remove(); return; }
      box.innerHTML = '📊 <b>지금까지</b> · ' + parts.join(" · ");
      box.style.display = "";
    });
  }
  ["cup", "gap"].forEach(function(k){
    var OLD = window.RENDER && RENDER[k]; if (!OLD) return;
    RENDER[k] = function(it, el){ OLD(it, el); try { line(k, el); } catch(x) { console.error(x); } };
  });
})();
