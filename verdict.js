/* CH Investing — 🧭 오늘의 결론 하나로 (11/10 냉정 분석 3차 #1)
   문제: 첫 화면 「현금 100%까지」(코스피 하락장) ↔ 뭐 살까? 「현금 0%」(S&P 기준 배분표) ↔ 계기판 「🟢 S&P 정상」 — 판정 3개가 따로 놀아 PB가 그대로 못 전함.
   풀이: 둘 다 맞는 말임. 포트(배분표)는 해외 ETF 위주라 국내 주식 칸이 없음 → 「국내 주식」과 「해외 주식(포트)」을 나눠 한 줄씩.
   쓰는 곳: 쉬운 화면 첫 상자 · 전체 메뉴 홈 첫 카드 · 뭐 살까? 첫 카드 · 오늘 한 장  →  자리에 <div data-vd></div> 만 두면 여기서 채움 */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var V = null, P = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v){ return v == null ? "" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(0) + "%"; }
  var ST = {"🐻": ["dn", "하락장"], "🟡": ["yl", "조정"], "🟢": ["up", "정상"]};
  function load(){
    if (P) return P;
    var t = Math.floor(Date.now() / 600000);
    P = Promise.all([getJSON(RM + "bear.json?" + t, {ttl: 600000}).catch(function(){ return null; }), getJSON(RM + "port.json?" + t, {ttl: 600000}).catch(function(){ return null; })])
      .then(function(r){ V = build(r[0], r[1]); setTimeout(function(){ P = null; }, 600000); return V; });
    return P;
  }
  function build(B, PO){
    if (!B || !B.markets) return null;
    var M = {}; B.markets.forEach(function(m){ M[m.key] = m; });
    var k = M.kospi, s = M.sp500, cash = null;
    try { (PO.hold || []).forEach(function(h){ if (/현금/.test(h.name)) cash = (cash || 0) + (+h.pct || 0); }); } catch(x) {}
    if (!k || !s) return null;
    function line(m, isPort){
      var st = ST[m.state] || ["", m.state];
      var act = isPort
        ? (m.cash ? "주식 줄이고 " + (m.to || "현금") + " " + m.cash + "%까지" : "배분표 그대로" + (cash != null ? " · 현금 " + Math.round(cash) + "%" : ""))
        : (m.to ? (m.cash ? "주식 몫 " + m.cash + "% " + m.to + "으로 · 바닥 신호 3개면 복귀" : "배분표 그대로") : m.state === "🐻" ? "현금 " + (m.cash || 30) + "%까지 · 새로 사지 않기" : m.state === "🟡" ? "현금 " + (m.cash || 10) + "% · 추격 금지" : "현금 늘릴 필요 없음");
      return {c: st[0], st: m.state + " " + st[1], dd: m.dd, act: act, idx: m.name};
    }
    var o = {kr: line(k, false), us: line(s, true), asof: k.asof || s.asof};
    // 🔁 11/12 닮은 장 규칙 — 국내 주식 줄은 코스피·코스닥을 따로 (사용자 「코스닥 사라고 하고 이러면 이상하지 않니?」)
    function an(m){ var a = m && m.analog; if (!a) return null; return m.name + " 주식 " + a.stock + "%" + (a.stock < 100 ? " · " + a.next.replace(/ 위로 올라오면.*$/, a.stock ? " 넘으면 더 사기" : " 넘으면 사기").replace(/^월말 종가가 /, "") : ""); }
    var ka = an(k), qa = an(M.kosdaq);
    if (ka || qa) o.kr.act = [ka, qa].filter(Boolean).join(" / ");
    if (s.analog) o.us.act = s.analog.stock >= 100 ? "배분표 그대로" + (cash != null ? " · 현금 " + Math.round(cash) + "%" : "") : "주식 " + s.analog.stock + "% · " + s.analog.next;
    o.split = k.state !== s.state;
    o.text = "🇰🇷 국내 주식: " + o.kr.st + " → " + o.kr.act + "\n🌏 해외 주식(포트): S&P500 " + o.us.st + " → " + o.us.act;
    return o;
  }
  function html(o){
    if (!o) return "";
    function row(f, lab, idx, L){ return '<div class="vd-r ' + L.c + '"><span class="vd-f">' + f + '</span><span class="vd-l"><b>' + lab + ' <small>' + e(idx) + ' ' + e(L.st) + ' · 고점 ' + sg(L.dd) + '</small></b><em>→ ' + e(L.act) + '</em></span></div>'; }
    return '<div class="vd-in"><div class="vd-h">🧭 오늘의 결론 <small>' + (o.asof ? Number(o.asof.slice(5, 7)) + "/" + Number(o.asof.slice(8)) + " 종가 판정" : "종가 판정") + '</small></div>' +
      row("🇰🇷", "국내 주식", o.kr.idx, o.kr) + row("🌏", "해외 주식(포트)", o.us.idx, o.us) +
      (o.split ? '<p class="vd-n">포트는 해외 ETF 위주라 국내 판정과 따로 움직여요 — 국내 주식 가진 고객은 🇰🇷 줄, 해외·연금 ETF는 🌏 줄</p>' : '') + '</div>';
  }
  function fill(){
    var L = document.querySelectorAll("[data-vd]:not([data-vdok])"); if (!L.length) return;
    load().then(function(o){ if (!o) return; [].forEach.call(document.querySelectorAll("[data-vd]:not([data-vdok])"), function(x){ x.innerHTML = html(o); x.setAttribute("data-vdok", "1"); x.classList.add("vd"); }); });
  }
  window.__vdText = function(){ return load().then(function(o){ return o ? o.text : ""; }); };
  window.__vd = function(){ return V; };
  window.__vdLoad = load;
  var t = 0; new MutationObserver(function(){ clearTimeout(t); t = setTimeout(fill, 60); }).observe(document.documentElement, {childList: true, subtree: true});
  (function(){ var st = document.createElement("style"); st.textContent =
    ".vd{margin:10px 0;text-align:left}.vd .vd-in *{letter-spacing:normal}.vd .vd-h,.vd .vd-h small{font-size:13px!important;line-height:1.4!important}.vd .vd-h small{font-size:12px!important}.vd .vd-l b{font-size:14px!important;line-height:1.35!important;font-weight:800!important}.vd .vd-l b small{font-size:12px!important;font-weight:500!important}.vd .vd-r em{font-size:14px!important}.vd .vd-n{font-size:12px!important;line-height:1.5!important;color:var(--sub)!important;margin:6px 0 0!important}.vd .vd-f{font-size:20px!important}" +
    ".vd-in{border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:var(--panel)}" +
    ".vd-h{font-size:13px;font-weight:800;margin:0 0 4px;display:flex;justify-content:space-between;align-items:baseline}.vd-h small{font-weight:500;color:var(--sub);font-size:12px}" +
    ".vd-r{display:flex;align-items:center;gap:9px;padding:7px 0;border-top:1px solid var(--line)}.vd-f{font-size:20px;flex:0 0 auto}" +
    ".vd-l{flex:1;min-width:0}.vd-l b{display:block;font-size:14px;line-height:1.35;color:var(--text)}.vd-l b small{font-size:12px;font-weight:500;color:var(--sub);white-space:nowrap}" +
    ".vd-r em{display:block;font-style:normal;font-size:14px;font-weight:800;margin-top:2px;word-break:keep-all;line-height:1.4}" +
    ".vd-r.dn em{color:var(--down)}.vd-r.yl em{color:#d08a00}.vd-r.up em{color:var(--text)}" +
    ".vd-n{margin:6px 0 0;font-size:12px;line-height:1.5;color:var(--sub);word-break:keep-all}";
    document.head.appendChild(st); })();
})();
