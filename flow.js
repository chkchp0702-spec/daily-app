/* CH Investing — 🧲 수급: 국내 주식 누가 사고 있나 (외국인·기관 집중 매수) · archive/x/flow_kr.json (flow_kr.yml 하루 3번)
   11/10 사용자 「국내 주식 수급 분석, 외국인·기관 집중 매수 종목들 파악해서 그런 칸을」
   · 시총 상위 300 · 하루/5일/20일 순매수 금액 · 시총 대비 세기 · 연속 일수 · 쌍끌이
   · 사는 신호가 아님 — 10/28 10년 검증(기관 따라 사기 2021년 뒤 손해 · 외국인 약한 플러스)을 화면에 같이 적음 */
(function(){
  var e = V.e;
  var ST = {mk: "A", per: "5", who: "f", side: "buy", sort: "amt"};
  try { var s0 = JSON.parse(localStorage.getItem("flowst") || "{}"); for (var k in s0) if (k in ST) ST[k] = s0[k]; } catch(x) {}
  var D = null;
  function keep(){ try { localStorage.setItem("flowst", JSON.stringify(ST)); } catch(x) {} }
  function won(v){ if (v == null) return "–"; var a = Math.abs(v), sg = v > 0 ? "+" : v < 0 ? "−" : "";
    return sg + (a >= 10000 ? (a / 10000).toFixed(a >= 100000 ? 0 : 1) + "조" : a >= 100 ? Math.round(a).toLocaleString() + "억" : a.toFixed(a >= 10 ? 0 : 1) + "억"); }
  function pct(v, d){ return v == null ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? Number(d.slice(5, 7)) + "/" + Number(d.slice(8, 10)) : ""; }
  function sym(s){ return s.c + (s.m === "P" ? ".KS" : ".KQ"); }
  function uni(){ return D.stocks.filter(function(s){ return ST.mk === "A" || s.m === ST.mk; }); }
  function val(s, who, per){ return s[who + per]; }
  function inten(s, who, per){ var v = val(s, who, per); return v != null && s.mc ? v / s.mc * 100 : null; }
  // 20일 하루 순매수 막대(작게) — 위 빨강 = 산 날 · 아래 파랑 = 판 날
  function spark(a, w, H){
    if (!a || !a.length) return "";
    var m = Math.max.apply(null, a.map(Math.abs)) || 1, g = 1; w = w || 3; H = H || 22;
    return '<svg class="fl-sp" width="' + a.length * (w + g) + '" height="' + H + '" aria-hidden="true">' + a.map(function(v, i){
      var h = Math.max(1, Math.abs(v) / m * (H / 2 - 1));
      return '<rect x="' + i * (w + g) + '" y="' + (v >= 0 ? H / 2 - h : H / 2) + '" width="' + w + '" height="' + h + '" fill="var(--' + (v >= 0 ? "up" : "down") + ')"/>'; }).join("") + '</svg>';
  }
  function chips(key, opts){ return '<div class="fl-ch">' + opts.map(function(o){ return '<button type="button" data-fk="' + key + '" data-fv="' + o[0] + '"' + (ST[key] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join("") + '</div>'; }
  function row(s, i, main, sub, sp, tag){
    return '<button type="button" class="fl-r" data-fop="' + sym(s) + '"><i class="fl-n">' + (i + 1) + '</i><span class="fl-nm"><b>' + e(s.n) + '</b><small>' + (tag ? tag + ' · ' : '') + (s.r5 != null ? '주가 5일 <em class="' + cl(s.r5) + '">' + pct(s.r5) + '</em>' : '') + '</small></span>' +
      (sp ? '<span class="fl-spw">' + sp + '</span>' : '') + '<span class="fl-v">' + main + '<small>' + sub + '</small></span></button>';
  }
  function strk(n){ return n ? Math.abs(n) + "일 연속 " + (n > 0 ? "매수" : "매도") : ""; }

  // ── 시장 전체 ──
  function mktCard(){
    var mk = ST.mk === "Q" ? "KOSDAQ" : "KOSPI", R = (D.mkt || {})[mk] || [];
    if (!R.length || R[0].f == null) return "";
    var r = R[0], f20 = 0, i20 = 0, p20 = 0; R.forEach(function(x){ f20 += x.f || 0; i20 += x.i || 0; p20 += x.p || 0; });
    var U = R[0].f != null && Math.abs(R[0].f) > 1e6 ? 1e8 : 1;   // 원 단위면 억으로
    function b(lab, v, v20){ return '<div class="fl-m"><small>' + lab + '</small><b class="' + cl(v) + '">' + won(v / U) + '</b><em>20일 <i class="' + cl(v20) + '">' + won(v20 / U) + '</i></em></div>'; }
    var fs = 0; for (var i = 0; i < R.length; i++){ if ((R[i].f > 0) === (R[0].f > 0) && R[i].f) fs++; else break; }
    var say = (fs <= 1 ? "외국인 " + (r.f > 0 ? "매수" : "매도") + "로 돌아섬" : "외국인 " + fs + "거래일째 " + (r.f > 0 ? "사는 중" : "파는 중")) + " · 20일 합계 " + won(f20 / U) + ". " +
      (r.f < 0 && r.i > 0 ? "기관이 받고 있어요." : r.f < 0 && r.p > 0 ? "개인이 받고 있어요." : r.f > 0 && r.i > 0 ? "외국인·기관이 같이 사요." : r.f > 0 ? "외국인만 사요." : "외국인·기관 모두 팔아요.");
    return '<section class="card fl-mk"><h3>' + (mk === "KOSPI" ? "코스피" : "코스닥") + ' 전체 <span class="mut">' + md(r.d) + ' 하루 순매수</span></h3>' +
      '<p class="fl-say">' + e(say) + '</p><div class="fl-m3">' + b("외국인", r.f, f20) + b("기관", r.i, i20) + b("개인", r.p, p20) + '</div>' +
      (function(){ var d = r.det || {}, L = [["금융투자", d.FINANCIAL_INVESTOR], ["투신", d.MUTUAL_FUND], ["연기금", d.PENSION_FUND], ["사모", d.PRIVATE_EQUITY_FUND], ["보험", d.INSURANCE_COMPANIES]].filter(function(x){ return x[1] != null; });
        return L.length ? '<p class="fl-det"><b>기관 안쪽</b> ' + L.map(function(x){ return x[0] + ' <i class="' + cl(x[1]) + '">' + won(x[1] / U) + '</i>'; }).join(" · ") + '</p>' : ''; })() +
      '<div class="fl-bars"><small>외국인 20일</small>' + spark(R.map(function(x){ return (x.f || 0) / U; }).reverse(), 9, 44) + '</div></section>';
  }

  // ── 집중 매수·매도 순위 ──
  function rankCard(){
    var who = ST.who, per = ST.per, buy = ST.side === "buy", by = ST.sort;
    var L = uni().filter(function(s){ return val(s, who, per) != null && (by === "amt" || s.mc); });
    L.sort(function(a, b){ var x = by === "amt" ? val(a, who, per) : inten(a, who, per), y = by === "amt" ? val(b, who, per) : inten(b, who, per); return buy ? y - x : x - y; });
    L = L.filter(function(s){ return buy ? val(s, who, per) > 0 : val(s, who, per) < 0; }).slice(0, 10);
    var nm = who === "f" ? "외국인" : "기관";
    return '<section class="card" id="flrank"><h3>' + (who === "f" ? "🌍" : "🏛") + ' ' + nm + ' 집중 ' + (buy ? "매수" : "매도") + ' <span class="mut">' + (per === "1" ? "하루" : per + "일 합계") + ' · ' + md(D.day) + ' 마감</span></h3>' +
      '<div class="fl-cr">' + chips("who", [["f", "외국인"], ["i", "기관"]]) + chips("side", [["buy", "많이 산"], ["sell", "많이 판"]]) + '</div>' +
      '<div class="fl-cr">' + chips("per", [["1", "하루"], ["5", "5일"], ["20", "20일"]]) + chips("sort", [["amt", "금액순"], ["int", "덩치 대비"]]) + '</div>' +
      (L.length ? L.map(function(s, i){
        var v = val(s, who, per), it = inten(s, who, per), sk = s[who + "s"];
        return row(s, i, '<b class="' + cl(v) + '">' + won(v) + '</b>', (it != null ? "시총의 " + Math.abs(it).toFixed(2) + "%" : ""), spark(s["s" + who], 2, 22), sk && Math.abs(sk) >= 3 ? strk(sk) : "");
      }).join("") : '<p class="note">해당 종목이 없어요.</p>') +
      '<p class="fl-ft">「덩치 대비」 = 순매수 금액 ÷ 시가총액 — 작은 회사에 큰돈이 들어온 순서 · 작은 막대 = 최근 20일 하루하루(위 빨강 산 날)</p></section>';
  }

  // ── 🏭 업종별 (11/10 #5) ──
  function secCard(){
    var G = (D.secs || []).filter(function(g){ return g.k >= 3; });
    if (G.length < 4) return "";
    var by = function(g){ return (g.f5 || 0) + (g.i5 || 0); };
    var inn = G.filter(function(g){ return by(g) > 0; }).slice(0, 6), out = G.filter(function(g){ return by(g) < 0; }).sort(function(a, b){ return by(a) - by(b); }).slice(0, 4);
    var mx = Math.max.apply(null, inn.concat(out).map(function(g){ return Math.abs(by(g)); })) || 1;
    function bar(g){ var v = by(g), w = Math.max(4, Math.abs(v) / mx * 100);
      return '<div class="fl-sg"><span class="fl-sgn">' + e(g.ic + " " + g.n) + '<small>' + e((g.top || []).slice(0, 2).join(" · ")) + '</small></span><span class="fl-sgb"><i class="' + (v >= 0 ? "u" : "d") + '" style="width:' + w + '%"></i></span><b class="' + cl(v) + '">' + won(v) + '</b></div>'; }
    return '<section class="card" id="flsec"><h3>🏭 돈이 들어간 업종 <span class="mut">외국인+기관 5일 · 시총 상위 300 안</span></h3>' +
      (inn.length ? '<p class="fl-sgh">들어간 곳</p>' + inn.map(bar).join("") : '') + (out.length ? '<p class="fl-sgh">빠진 곳</p>' + out.map(bar).join("") : '') + '</section>';
  }
  // ── 쌍끌이 ──
  function bothCard(){
    var L = uni().filter(function(s){ return s.f5 > 0 && s.i5 > 0 && s.mc; }).map(function(s){ return {s: s, v: s.f5 + s.i5, it: (s.f5 + s.i5) / s.mc * 100}; })
      .sort(function(a, b){ return b.it - a.it; }).slice(0, 8);
    if (!L.length) return "";
    return '<section class="card"><h3>🤝 외국인·기관이 같이 산 종목 <span class="mut">5일 · 덩치 대비 순</span></h3>' +
      L.map(function(o, i){ return row(o.s, i, '<b class="up">' + won(o.v) + '</b>', "외 " + won(o.s.f5) + " · 기 " + won(o.s.i5), ""); }).join("") + '</section>';
  }
  // ── 연속 ──
  function streakCard(){
    var L = [];
    uni().forEach(function(s){ if (s.fs >= 5) L.push({s: s, n: s.fs, w: "외국인", v: s.f5}); if (s.is >= 5) L.push({s: s, n: s.is, w: "기관", v: s.i5}); });
    L.sort(function(a, b){ return b.n - a.n || b.v - a.v; }); L = L.slice(0, 8);
    if (!L.length) return "";
    return '<section class="card"><h3>🔁 하루도 안 쉬고 사는 중 <span class="mut">5거래일 이상 연속</span></h3>' +
      L.map(function(o, i){ return row(o.s, i, '<b>' + (o.n >= 24 ? "24일+" : o.n + "일째") + '</b>', o.w + " · 5일 " + won(o.v), ""); }).join("") + '</section>';
  }
  // ⭐ 내 관심종목 수급 — 내 종목 얘기라 다시 열 이유가 됨 (관심종목에 국내 종목이 있을 때만)
  function wlCard(){
    var wl = (window.store && store.wl) || {}, codes = {}; for (var k in wl){ var c = String(k).replace(/\D/g, "").slice(0, 6); if (c.length === 6) codes[c] = 1; }
    var L = D.stocks.filter(function(s){ return codes[s.c]; });
    if (!L.length) return "";
    return '<section class="card"><h3>⭐ 내 관심종목 수급 <span class="mut">5일 합계</span></h3>' + L.slice(0, 12).map(function(s, i){
      return row(s, i, '<b class="' + cl(s.f5) + '">외 ' + won(s.f5) + '</b>', '기관 <i class="' + cl(s.i5) + '">' + won(s.i5) + '</i>', spark(s.sf, 2, 22), Math.abs(s.fs) >= 3 ? "외국인 " + strk(s.fs) : ""); }).join("") + '</section>';
  }
  function honest(){
    return '<section class="card fl-hon"><h3>📌 먼저 알고 보세요</h3><p><b>「많이 샀다」가 「오른다」는 아니에요.</b> 2016~2026년 10년을 직접 돌려 봤어요(시총 상위 200 · 20일 순매수 상위 10% · 다음 날 진입).</p>' +
      '<div class="fl-tb"><div><span>기관·연기금이 많이 산 종목</span><b class="dn">2021년 뒤 60일 −2.0%p</b></div><div><span>외국인이 많이 산 종목</span><b>+1.6%p (통계로 확실하진 않음)</b></div></div>' +
      '<p>그래서 이 화면은 <b>사는 신호가 아니라</b> 「요즘 큰돈이 어디로 가나」를 고객과 이야기할 재료예요. 외국인 바구니는 10/27부터 실제 성적을 따로 재고 있고, 의미가 생기면 알려 드려요.</p></section>';
  }
  function copyText(){
    var mk = (D.mkt || {}).KOSPI || [], U = mk[0] && Math.abs(mk[0].f) > 1e6 ? 1e8 : 1;
    function top(who, n){ return D.stocks.filter(function(s){ return s[who + "5"] > 0; }).sort(function(a, b){ return b[who + "5"] - a[who + "5"]; }).slice(0, n).map(function(s){ return s.n + "(" + won(s[who + "5"]) + ")"; }).join(", "); }
    return "[" + md(D.day) + " 국내 수급]\n" + (mk[0] && mk[0].f != null ? "코스피 하루: 외국인 " + won(mk[0].f / U) + " · 기관 " + won(mk[0].i / U) + " · 개인 " + won(mk[0].p / U) + "\n" : "") +
      "외국인 5일 순매수 상위: " + top("f", 5) + "\n기관 5일 순매수 상위: " + top("i", 5) + "\n※ 참고용 자료이며 매수 권유가 아닙니다.";
  }
  function draw(){
    var el = document.getElementById("flbody"); if (!el) return;
    if (!D || !D.stocks || !D.stocks.length){ el.innerHTML = '<section class="card"><p class="note" style="margin:0">수급 자료가 아직 안 올라왔어요 — 장 마감 뒤 저녁·다음 날 아침에 채워져요.</p></section>'; return; }
    el.innerHTML = '<div class="fl-top">' + chips("mk", [["A", "전체"], ["P", "코스피"], ["Q", "코스닥"]]) + '<button type="button" id="flcopy">📋 한 줄 복사</button></div>' +
      mktCard() + wlCard() + secCard() + rankCard() + bothCard() + streakCard() + honest() +
      '<p class="fl-src">시총 상위 ' + D.n + '종목 · ' + md(D.day) + ' 마감 기준(종목별 자료는 그날 밤에 나와요) · 금액은 순매수 수량 × 종가로 어림 · 자료: 다음 금융</p>';
    [].forEach.call(el.querySelectorAll("[data-fk]"), function(b){ b.onclick = function(){ var y = b.getBoundingClientRect().top; ST[b.dataset.fk] = b.dataset.fv; keep(); draw();
      var n = document.querySelector('[data-fk="' + b.dataset.fk + '"][data-fv="' + b.dataset.fv + '"]'); if (n) window.scrollBy(0, n.getBoundingClientRect().top - y); }; });
    [].forEach.call(el.querySelectorAll("[data-fop]"), function(b){ b.onclick = function(){ if (window.openOP) openOP(b.dataset.fop); }; });
    var c = document.getElementById("flcopy");
    if (c) c.onclick = function(){ var t = copyText(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ c.textContent = "✅ 복사됨 — 카톡에 붙여 넣기"; }, function(){ window.prompt("길게 눌러 복사하세요", t); }); };
  }
  // ── 🧲 11/10 #3 수급 한 줄 (홈·오늘 한 장·고객 한 장) · #4 종목리포트 수급 칸 ──
  var LP = null;
  function loadF(){ if (D && D.stocks) return Promise.resolve(D); if (LP) return LP;
    LP = getJSON("archive/x/flow_kr.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).then(function(j){ D = D || j; window.__flowJ = j; return j; }).catch(function(){ LP = null; return null; }); return LP; }
  function mline(J){
    var R = ((J && J.mkt) || {}).KOSPI || []; if (!R.length || R[0].f == null) return "";
    var r = R[0], U = Math.abs(r.f) > 1e6 ? 1e8 : 1, fs = 0; for (var i = 0; i < R.length; i++){ if (R[i].f && (R[i].f > 0) === (r.f > 0)) fs++; else break; }
    return "코스피 " + md(r.d) + " 외국인 " + won(r.f / U) + (fs >= 2 ? "(" + fs + "일째)" : "") + " · 기관 " + won(r.i / U) + " · 개인 " + won(r.p / U);
  }
  window.__flowLine = function(){ return loadF().then(function(J){ return mline(J); }); };
  function stkHtml(c){
    var s = (D.stocks || []).filter(function(x){ return x.c === c; })[0]; if (!s) return "";
    var rk = D.stocks.slice().sort(function(a, b){ return (b.f5 || 0) - (a.f5 || 0); }).indexOf(s) + 1;
    function lane(lab, a, v5, v20, sk){ return '<div class="fs-l"><span class="fs-lb">' + lab + '</span>' + spark(a, 4, 30) + '<span class="fs-v"><b class="' + cl(v5) + '">5일 ' + won(v5) + '</b><small>20일 ' + won(v20) + (Math.abs(sk) >= 3 ? ' · ' + strk(sk) : '') + '</small></span></div>'; }
    return '<section class="card fs-c no-clp" data-cz="done" data-xc="1"><h3>🧲 누가 사고 있나 <span class="mut">' + md(D.day) + ' 마감 · 최근 20일</span></h3>' +
      lane("🌍 외국인", s.sf, s.f5, s.f20, s.fs || 0) + lane("🏛 기관", s.si, s.i5, s.i20, s.is || 0) +
      '<p class="fs-n">외국인 보유 ' + (s.fr != null ? s.fr.toFixed(1) + "%" : "–") + (s.fr20 != null ? ' (20일 ' + (s.fr20 >= 0 ? "+" : "−") + Math.abs(s.fr20).toFixed(2) + '%p)' : '') + ' · 외국인 5일 순매수 300종목 중 ' + rk + '위 · <a data-goto="flow">수급 전체 ›</a></p></section>';
  }
  function fillAll(){
    var L = document.querySelectorAll("[data-flow]:not([data-flok]), [data-flowstk]:not([data-flok])"); if (!L.length) return;
    loadF().then(function(J){ if (!J) return;
      [].forEach.call(document.querySelectorAll("[data-flow]:not([data-flok])"), function(x){ var t = mline(J); x.setAttribute("data-flok", "1"); if (!t) return;
        x.innerHTML = '<button type="button" class="fl-line" data-goto="flow">🧲 ' + e(t) + ' <i>›</i></button>'; });
      [].forEach.call(document.querySelectorAll("[data-flowstk]:not([data-flok])"), function(x){ x.setAttribute("data-flok", "1"); var m = /^(\d{6})\.K[SQ]$/.exec(x.getAttribute("data-flowstk") || ""); x.innerHTML = m ? stkHtml(m[1]) : ""; });
    });
  }
  var FT = 0; new MutationObserver(function(){ clearTimeout(FT); FT = setTimeout(fillAll, 80); }).observe(document.documentElement, {childList: true, subtree: true});
  (window.requestIdleCallback || function(f){ setTimeout(f, 3000); })(function(){ setTimeout(loadF, 2500); });
  window.flowView = function(){ return '<div id="flbody"><div class="loading">수급 자료 불러오는 중…</div></div>'; };
  window.flowInit = function(){
    D = null; LP = null; loadF().then(function(j){ D = j; draw(); });
  };
  (function(){ var st = document.createElement("style"); st.textContent =
    ".fl-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px}.fl-top .fl-ch{margin:0}" +
    "#flcopy{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:8px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}" +
    ".fl-cr{display:flex;justify-content:space-between;gap:8px;margin:0 0 8px}.fl-cr .fl-ch{margin:0;gap:0;flex-wrap:nowrap;border:1px solid var(--line);border-radius:999px;overflow:hidden}.fl-cr .fl-ch button{border:0;border-radius:0;padding:7px 11px}" +
    ".fl-ch{display:flex;gap:6px;margin:0 0 8px;flex-wrap:wrap}.fl-ch button{border:1px solid var(--line);background:var(--panel2,transparent);color:var(--sub);border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;cursor:pointer;min-height:34px}" +
    ".fl-ch button.on{background:var(--text);color:var(--panel);border-color:var(--text);font-weight:700}" +
    ".fl-say{font-size:15px;font-weight:700;line-height:1.5;margin:2px 0 12px;word-break:keep-all}" +
    ".fl-m3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fl-m{background:var(--panel2,rgba(127,127,127,.08));border-radius:12px;padding:10px 8px;text-align:center;min-width:0}" +
    ".fl-m small{display:block;font-size:12.5px;color:var(--sub)}.fl-m b{display:block;font-size:19px;font-weight:800;line-height:1.3;white-space:nowrap}.fl-m em{font-style:normal;font-size:12px;color:var(--sub);white-space:nowrap}.fl-m i{font-style:normal}" +
    ".fl-det{font-size:12.5px;line-height:1.7;color:var(--sub);margin:10px 0 0;word-break:keep-all}.fl-det b{color:var(--text)}.fl-det i{font-style:normal;font-weight:700}" +
    ".fl-bars{display:flex;align-items:center;justify-content:space-between;margin-top:12px}.fl-bars small{color:var(--sub);font-size:12.5px}" +
    ".fl-r{display:flex;align-items:center;gap:9px;width:100%;padding:10px 0;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);font:inherit;text-align:left;cursor:pointer}.fl-r:last-of-type{border-bottom:0}" +
    ".fl-n{flex:0 0 18px;font-style:normal;font-size:13px;color:var(--sub);text-align:center}.fl-nm{flex:1 1 110px;min-width:110px}.fl-nm b{display:block;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fl-nm small{display:block;font-size:12px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fl-nm em{font-style:normal}" +
    ".fl-spw{flex:0 0 auto;line-height:0}.fl-v{flex:0 0 auto;text-align:right;line-height:1.25}.fl-v b{display:block;font-size:15px;font-weight:800;white-space:nowrap}.fl-v small{display:block;font-size:12px;color:var(--sub);white-space:nowrap}" +
    "#flbody .up{color:var(--up)}#flbody .dn{color:var(--down)}.fl-ft,.fl-src{font-size:12px;color:var(--sub);line-height:1.5;margin:10px 0 0;word-break:keep-all}.fl-src{text-align:center;margin:4px 8px 16px}" +
    ".fl-hon p{font-size:13.5px;line-height:1.6;margin:0 0 8px;word-break:keep-all;color:var(--sub)}.fl-hon p b{color:var(--text)}.fl-tb{margin:0 0 10px}.fl-tb div{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px}.fl-tb div:last-child{border:0}.fl-tb b{text-align:right;white-space:nowrap}" +
    ".fl-sgh{font-size:12px;color:var(--sub);margin:10px 0 2px;font-weight:700}.fl-sg{display:flex;align-items:center;gap:8px;padding:6px 0}.fl-sgn{flex:0 0 42%;min-width:0;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fl-sgn small{display:block;font-size:11.5px;font-weight:400;color:var(--sub);overflow:hidden;text-overflow:ellipsis}.fl-sgb{flex:1;height:10px;border-radius:5px;background:var(--panel2,rgba(127,127,127,.1));overflow:hidden}.fl-sgb i{display:block;height:100%;border-radius:5px}.fl-sgb i.u{background:var(--up)}.fl-sgb i.d{background:var(--down)}.fl-sg b{flex:0 0 auto;font-size:13px;min-width:62px;text-align:right}" +
    ".fl-line{display:block;width:100%;text-align:left;border:0;border-radius:12px;background:var(--panel2,rgba(127,127,127,.08));color:var(--text);font:inherit;font-size:13px;font-weight:600;padding:9px 11px;margin:8px 0 0;cursor:pointer;line-height:1.45;word-break:keep-all}.fl-line i{font-style:normal;color:var(--sub)}" +
    ".fs-c h3{margin-bottom:6px}.fs-l{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}.fs-lb{flex:0 0 64px;font-size:13px;font-weight:700}.fs-v{margin-left:auto;text-align:right;line-height:1.3}.fs-v b{display:block;font-size:14px}.fs-v small{font-size:12px;color:var(--sub)}" +
    ".fs-n{font-size:12.5px;color:var(--sub);margin:8px 0 0;line-height:1.5}.fs-n a{color:var(--acc,#7c9cff);cursor:pointer}#main .fs-c .up{color:var(--up)}#main .fs-c .dn{color:var(--down)}" +
    ".fl-v small i{font-style:normal;font-weight:700}@media(max-width:360px){.fl-spw{display:none}}";
    document.head.appendChild(st); })();
})();
