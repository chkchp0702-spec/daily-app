/* 📦 app.b06.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 6/8 (ux1023.js … home2.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
if(typeof __bs!=="function"){window.__bs=window.__bk=window.__be=function(){};}
__bs(6,55,["ux1023.js", "ux1026.js", "voices.js", "ux1104.js", "mc.js", "iconz.js", "today.js", "vidmap.js", "guide.js", "easy.js", "habit.js", "home2.js"],[4, 387, 675, 875, 1372, 1531, 1710, 2105, 2173, 2488, 2602, 2960]);
/* ======== ux1023.js ======== */
/* 10/23 사용자 「1,2,3 다 진행하고 내 돈 전체 비상 훈련도 진행」 — 📱 앱 아이디어 A10/23-1·2·3 + 🧯 비상 훈련
   ① 🐇🐢 누가 먼저 말했나 (A10/23-1) — 📄 종목 화면 「🧵 앱 성적표」 위: 피드 채널마다 이 종목 이름을 처음 부른 때를 주가 선 위 점으로 +
      「그 뒤 ±%」 · 📣 채널 성적표 줄마다 「🐇 먼저 m/n · 평균 n일 늦음」.
      자료: market-strategy-report feeds/lead.json (src/feed_score.py · 평일 07:25·16:10 — 시세는 야후 일봉)
   ② 🧬 DNA 쌍둥이 (A10/23-2) — 📄 종목 화면 DNA 레이더 밑: 다섯 축(성장·수익성·싸다·주가 힘·전문가)이 가장 가까운 종목 5개, 업종 무관 ·
      덩치(시총) ±1 단계 안 · 같은 회사(우선주·ADR·두 종류 주식)는 뺌. 자료: opdata/dna.json (opdb/dna.py · opprice 뒤)
   ③ 🔬 내 돈 속 진짜 종목 (A10/23-3) — 💼 포트 설계기 밑: 설계기 비중(S&P·나스닥·금·현금·종목) × 투자금 + 📌 담아 둔 펀드(금액)를
      구성 종목까지 풀어 「내 돈의 ○%는 사실 상위 7종목」 · 「나스닥 몫 중 S&P 에도 든 종목 ○%」 · 슬라이더를 밀면 같이 움직임.
      자료: archive/x/etf_hold.json (etf_hold.py · 하루 한 번 · SSGA·Invesco 공식 구성표) · archive/x/fund_hold.json (펀드 보유 상위)
   ④ 🧯 내 돈 전체 비상 훈련 — 💼 포트 설계기 밑: 지금 설계기 포트(투자금) + 📌 내 ELS 관제탑에 담은 ELS(금액)를
      2008·2011·2018·2020·2022·2025 S&P 큰 낙폭에 그대로 되돌려 「포트 −○원 · 회복까지 ○일 · 그 무렵 가입한 ELS 는 KI 닿음 ○% · 결국 손실 ○%」.
      「못 견딜 금액」을 넣으면 몇 번 넘었는지만(비중 제안 없음).
   원칙: 과거 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」). */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function s2day(s){ return Date.parse(String(s).slice(0, 10) + "T00:00:00Z") / 864e5; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function won(v){ var m = v / 1e4, a = Math.abs(m); return a >= 1e4 ? (m / 1e4).toFixed(a >= 1e5 ? 0 : 1) + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function J(u, t){ return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / (t || 600000)), {ttl: t || 600000}).catch(function(){ return null; }); }
  function stop(el){ el.addEventListener("click", function(ev){ ev.stopPropagation(); }); }
  function names(){ var m = {}; (window.OPIDX || []).forEach(function(x){ m[x.sym] = x.name; }); return m; }
  var FLAG = {KR: "🇰🇷", US: "🇺🇸", JP: "🇯🇵", CN: "🇨🇳", HK: "🇭🇰"};
  function mkOf(s){ return /\.K[SQ]$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /\.(SS|SZ)$/.test(s) ? "CN" : "US"; }
  function sameSym(a, b){ a = String(a || ""); b = String(b || ""); if (a === b) return true; var ca = a.split(".")[0], cb = b.split(".")[0]; return /^\d{6}$/.test(ca) && ca === cb; }

  /* ═════════ ① 🐇🐢 누가 먼저 말했나 ═════════ */
  var LD = null;
  function lead(){ if (!LD) LD = J(RAWM + "feeds/lead.json", 600000).then(function(j){ if (!j) LD = null; return j; }); return LD; }
  function leadOf(L, sym){ if (!L || !L.s) return null; if (L.s[sym]) return L.s[sym]; for (var k in L.s) if (sameSym(k, sym)) return L.s[k]; return null; }
  var LCOL = ["#f4a261", "#7ee0b5", "#5ac8fa", "#c792ea", "#ffd166", "#ff8fa3", "#8ab4f8", "#b5e48c", "#f7a072", "#9aa5b1", "#e9c46a"];
  function leadChart(x, since){
    var px = x.px || []; if (px.length < 2) return "";
    var W = 340, H = 118, L = 8, R = 8, T = 10, B = 20, t0 = s2day(px[0][0]), t1 = s2day(px[px.length - 1][0]);
    x.first.forEach(function(f){ var t = s2day(f[0]); if (t > t1) t1 = t; });
    var lo = Infinity, hi = -Infinity; px.forEach(function(p){ if (p[1] < lo) lo = p[1]; if (p[1] > hi) hi = p[1]; });
    var pad = (hi - lo) * 0.12 || hi * 0.02; lo -= pad; hi += pad;
    var X = function(t){ return L + (t - t0) / Math.max(1, t1 - t0) * (W - L - R); }, Y = function(v){ return T + (hi - v) / (hi - lo) * (H - T - B); };
    var at = function(d){ var t = s2day(d), v = px[0][1]; for (var i = 0; i < px.length; i++){ if (s2day(px[i][0]) <= t) v = px[i][1]; else break; } return v; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ld-svg" role="img" aria-label="주가 선 위 채널별 첫 언급">';
    var ts = s2day(since);
    if (ts > t0 && ts < t1) s += '<line x1="' + X(ts).toFixed(1) + '" x2="' + X(ts).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" class="ld-since"/><text x="' + (X(ts) + 3).toFixed(1) + '" y="' + (T + 8) + '" class="ld-tx">기록 시작</text>';
    s += '<polyline fill="none" class="ld-line" points="' + px.map(function(p){ return X(s2day(p[0])).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
    var stk = {};   // 같은 날 여러 채널이면 점을 위로 쌓음
    x.first.forEach(function(f, i){ var k = f[0], j = stk[k] = (stk[k] || 0) + 1, cx = X(s2day(f[0])), cy0 = Y(at(f[0])), cy = cy0 - (j - 1) * 12 * (cy0 > H / 2 ? 1 : -1);
      if (j > 1) s += '<line x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + cy0.toFixed(1) + '" y2="' + cy.toFixed(1) + '" stroke="var(--sub)" stroke-width=".8"/>';
      s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="6" fill="' + LCOL[i % LCOL.length] + '" stroke="var(--panel)" stroke-width="1.5"/><text x="' + cx.toFixed(1) + '" y="' + (cy + 3.2).toFixed(1) + '" text-anchor="middle" class="ld-n">' + (i + 1) + '</text>'; });
    s += '<text x="' + L + '" y="' + (H - 5) + '" class="ld-tx">' + md(px[0][0]) + '</text><text x="' + (W - R) + '" y="' + (H - 5) + '" text-anchor="end" class="ld-tx">' + md(px[px.length - 1][0]) + ' 종가</text></svg>';
    return s;
  }
  function leadCard(L, x){
    var F = x.first, n = F.length, d0 = s2day(F[0][0]);
    var rows = F.map(function(f, i){
      var lag = Math.round(s2day(f[0]) - d0), ic = i === 0 ? "🐇" : (i === n - 1 && n > 2 ? "🐢" : "");
      return '<div class="ld-r"><i style="background:' + LCOL[i % LCOL.length] + '">' + (i + 1) + '</i><span class="ld-d">' + md(f[0]) + (f[1] ? '<small>' + e(f[1]) + '</small>' : '') + '</span>' +
        '<span class="ld-c">' + ic + ' ' + (f[4] ? '<a href="' + e(f[4]) + '" target="_blank" rel="noopener">' + e(String(f[3]).replace(/\s*\(.*\)/, "")) + ' ↗</a>' : e(f[3])) +
        '<small>' + (i === 0 ? (x.pre ? '기록 첫날부터 부름' : '가장 먼저') : (lag === 0 ? '같은 날' : '+' + lag + '일 늦음')) + '</small></span>' +
        '<b class="' + cl(f[5]) + '">' + (f[5] == null ? '<span class="mut">채점 전</span>' : sg(f[5], 1) + '%') + '</b></div>'; }).join("");
    var gap = n >= 2 ? Math.round(s2day(F[1][0]) - d0) : null, last = n >= 2 ? Math.round(s2day(F[n - 1][0]) - d0) : null;
    var lc = L.ch && L.ch[F[0][2]];
    var head = n === 1 ? '채널 1곳만 불렀어요 · 언급 ' + x.cnt + '번' : '채널 ' + n + '곳 · 언급 ' + x.cnt + '번 · 둘째 채널까지 ' + (gap === 0 ? '같은 날' : gap + '일') + (last ? ' · 마지막은 ' + last + '일 뒤' : '');
    return '<section class="card ldc"><h3>🐇🐢 누가 먼저 말했나 <span class="mut">' + head + '</span></h3>' + leadChart(x, L.since) +
      '<div class="ld-rs">' + rows + '</div>' +
      '<p class="ld-s">숫자 = 그 채널이 처음 부른 날(또는 뒤 첫 거래일) 종가 → ' + md((x.last || [])[0]) + ' 종가' +
        (lc && lc.n >= 5 ? ' · 🐇 ' + e(String(lc.name).replace(/\s*\(.*\)/, "")) + '은(는) 여러 채널이 부른 종목 ' + lc.n + '개 중 <b>' + lc.first + '번</b> 가장 먼저' : '') + '</p>' +
      '<p class="note" style="margin:4px 0 0">피드 기록이 ' + md(L.since) + '부터라 ' + (x.pre ? '<b>이 종목은 그날 이미 불렸어요 — 실제로는 더 먼저 말한 곳이 있을 수 있어요</b>' : '그 전 언급은 몰라요') + ' · 사람 글(텔레그램·블로그)만 · 먼저 말한 채널이 더 낫다는 뜻도, 사라는 뜻도 아니에요.</p></section>';
  }
  function leadMount(){
    var el = document.getElementById("opsig"); if (!el || el.querySelector(".ldc") || el.dataset.ld === CURSYM) return;
    var sym = CURSYM; if (!sym) return; el.dataset.ld = sym;
    lead().then(function(L){
      var x = leadOf(L, sym), el2 = document.getElementById("opsig"); if (!x || !el2 || CURSYM !== sym || el2.querySelector(".ldc")) return;
      var w = document.createElement("div"); w.innerHTML = leadCard(L, x); var sec = w.firstChild;
      var t = el2.querySelector(".tlc"); if (t) t.parentNode.insertBefore(sec, t); else el2.appendChild(sec);
    });
  }
  // 📣 채널 성적표 줄마다 「🐇 먼저」
  function feedLead(){
    var rs = document.querySelectorAll(".fd-scr[data-fk]:not([data-ld])"); if (!rs.length) return;
    lead().then(function(L){ if (!L || !L.ch) return;
      [].forEach.call(document.querySelectorAll(".fd-scr[data-fk]:not([data-ld])"), function(r){
        r.setAttribute("data-ld", "1"); var c = L.ch[r.getAttribute("data-fk")], v = r.querySelector(".fd-scv"); if (!v) return;
        var s = document.createElement("span"); s.className = "ld-fs";
        s.innerHTML = c && c.n ? '🐇 먼저 <b>' + c.first + '/' + c.n + '</b>' + (c.lag != null ? ' · 뒤따를 땐 평균 ' + c.lag + '일 늦음' : '') : '<span class="mut">🐇 여러 채널이 부른 종목 없음</span>';
        v.appendChild(s); });
      var h = document.querySelector(".fd-scc h3"); if (h && !document.getElementById("ldnote")){ var p = document.createElement("p"); p.id = "ldnote"; p.className = "note"; p.style.margin = "0 0 6px";
        p.innerHTML = '🐇 먼저 m/n = 2개 넘는 채널이 부른 종목 n개 중 이 채널이 가장 먼저 부른 수 (' + md(L.since) + ' 기록 첫날에 이미 불린 종목은 뺌 · 둘째 채널까지 보통 ' + (L.gap_med == null ? '–' : L.gap_med + '일') + ') · 종목 화면에 「누가 먼저 말했나」'; h.parentNode.insertBefore(p, h.nextSibling); }
    });
  }

  /* ═════════ ② 🧬 DNA 쌍둥이 ═════════ */
  var DNA = null;
  function dna(){ if (!DNA) DNA = J(OPD + "dna.json", 3600e3).then(function(j){ if (!j || !j.rows) { DNA = null; return null; } var m = {}; j.rows.forEach(function(r){ m[r[0]] = r; }); j.by = m; return j; }); return DNA; }
  function twinsOf(D, me){
    var out = [], same = function(a, b){ return (a[11] && a[11] === b[11]) || (a[7] && a[7] === b[7] && b[10] && Math.abs(Math.log(a[10] / b[10])) < 0.14); };
    D.rows.forEach(function(r){
      if (r[0] === me[0] || Math.abs(r[6] - me[6]) > 1 || same(r, me) || (r[8] && r[8] === me[8])) return;
      var d = 0; for (var i = 1; i <= 5; i++) d += (r[i] - me[i]) * (r[i] - me[i]);
      out.push([Math.sqrt(d), r]); });
    out.sort(function(a, b){ return a[0] - b[0]; });
    var pick = [];
    for (var k = 0; k < out.length && pick.length < 5; k++){ var r = out[k][1]; if (pick.some(function(p){ return same(p[1], r); })) continue; pick.push(out[k]); }
    return pick;
  }
  function mini(me, r){
    var W = 64, c = 32, R = 26, pt = function(i, v){ var a = -Math.PI / 2 + i * 2 * Math.PI / 5; return (c + R * v / 100 * Math.cos(a)).toFixed(1) + "," + (c + R * v / 100 * Math.sin(a)).toFixed(1); };
    var poly = function(x){ return [1, 2, 3, 4, 5].map(function(i){ return pt(i - 1, x[i]); }).join(" "); };
    return '<svg viewBox="0 0 ' + W + ' ' + W + '" class="dt-rd"><polygon points="' + [0, 1, 2, 3, 4].map(function(i){ return pt(i, 100); }).join(" ") + '" fill="none" stroke="var(--line)"/>' +
      '<polygon points="' + poly(me) + '" fill="none" stroke="#8a94a8" stroke-dasharray="3 2" stroke-width="1.4"/><polygon points="' + poly(r) + '" fill="#5ac8fa" fill-opacity=".28" stroke="#5ac8fa" stroke-width="1.6"/></svg>';
  }
  function dnaCard(D, me){
    var T = twinsOf(D, me), N = names(), AX = D.axes;
    if (!T.length) return '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이</div><p class="note">덩치가 비슷한 종목 중 다섯 축이 다 있는 게 없어요.</p></div>';
    T.sort(function(a, b){ return b[1][3] - a[1][3] || a[0] - b[0]; });   // 같은 DNA 안에서 더 싼 것 먼저
    var word = function(d){ return d < 20 ? "아주 닮음" : d < 40 ? "닮음" : d < 60 ? "조금 닮음" : "멀리 닮음"; };
    var rows = T.map(function(z){ var r = z[1], df = [];
      for (var i = 1; i <= 5; i++) df.push([AX[i - 1], r[i] - me[i]]);
      df.sort(function(a, b){ return Math.abs(b[1]) - Math.abs(a[1]); });
      var diff = df.slice(0, 2).filter(function(x){ return Math.abs(x[1]) >= 8; }).map(function(x){ return '<span class="' + (x[1] > 0 ? "dt-p" : "dt-m") + '">' + x[0] + ' ' + (x[1] > 0 ? "↑" : "↓") + Math.abs(x[1]) + '</span>'; }).join("");
      var nm = N[r[0]] || r[8] || r[0];
      return '<a class="dt-r" href="javascript:openOP(\'' + e(r[0]) + '\')">' + mini(me, r) + '<span class="dt-b"><b>' + FLAG[mkOf(r[0])] + ' ' + e(String(nm).slice(0, 18)) + '</b><small>' + e(r[7] || "") + ' · PER ' + r[9] + '배 · ' + word(z[0]) + '</small>' +
        '<span class="dt-df">' + (diff || '<span class="mut">다섯 축이 거의 같음</span>') + '</span></span></a>'; }).join("");
    var mine = '<span class="dt-me">이 종목 ' + AX.map(function(a, i){ return a + ' ' + me[i + 1]; }).join(" · ") + '</span>';
    return '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이 <span class="mut">숫자가 가장 닮은 5개 · 업종 상관없이 · 더 싼 것 먼저</span></div>' + mine + rows +
      '<p class="note">점선 = 이 종목 · 파란 칸 = 쌍둥이 · ↑↓ = 이 종목보다 높고 낮은 축(싸다 ↑ = 업종 대비 PER 더 낮음) · 🌏 동종주(같은 업종)와 달리 업종을 안 봐요 · 덩치(시총) 약 3배 안 · 우선주·ADR 같은 같은 회사는 뺌 · 「신호」 축은 뺌 · 적자 등 PER 없는 종목은 빠짐 · PER 은 오늘 종가로 맞춤(' + e(String(D.updated || "").slice(5, 16)) + ') · 숫자 비교일 뿐 사라는 뜻이 아니에요.</p></div>';
  }
  function dnaMount(){
    var w = document.querySelector("#opsig .opx .rd-w"); if (!w || !CURSYM) return;
    var host = w.parentNode; if (host.querySelector(".dnt") || host.dataset.dn === CURSYM) return;
    var sym = CURSYM; host.dataset.dn = sym;
    var idx = typeof opLoadIdx === "function" && !window.OPIDX ? opLoadIdx().catch(function(){}) : Promise.resolve();
    Promise.all([dna(), idx]).then(function(r){
      var D = r[0], w2 = document.querySelector("#opsig .opx .rd-w"); if (!w2 || CURSYM !== sym || w2.parentNode.querySelector(".dnt")) return;
      var me = D && (D.by[sym] || D.by[sym + ".KS"] || D.by[sym + ".KQ"]);
      var box = document.createElement("div");
      box.innerHTML = !D ? '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이</div><p class="note">쌍둥이 자료를 아직 못 받았어요 — 잠시 뒤 다시 열어 주세요.</p></div>'
        : !me ? '<div class="dnt"><div class="sub2">🧬 DNA 쌍둥이</div><p class="note">이 종목은 다섯 축 자료(매출 2년·PER·1년 가격·애널리스트 목표가) 중 빠진 게 있어서 쌍둥이를 못 찾아요.</p></div>' : dnaCard(D, me);
      w2.parentNode.insertBefore(box.firstChild, w2.nextSibling);
    });
  }

  /* ═════════ ③ 🔬 내 돈 속 진짜 종목 ═════════ */
  var EH = null, FH = null, PRODF = null;
  function etfH(){ if (!EH) EH = J("archive/x/etf_hold.json", 3600e3).then(function(j){ if (!j) EH = null; return j; }); return EH; }
  function fundH(){ if (!FH) FH = Promise.all([J("archive/x/fund_hold.json", 3600e3), J("archive/x/products.json", 3600e3)]).then(function(r){ if (!r[0]) { FH = null; return null; } PRODF = (r[1] && r[1].funds) || []; return r[0]; }); return FH; }
  function nn(s){ return String(s || "").toUpperCase().replace(/\(.*?\)/g, " ").replace(/[^A-Z0-9가-힣 ]/g, " ").replace(/\b(CORP(ORATION)?|INC|CO|LTD|PLC|NV|SA|AG|SE|CLASS [ABC]|CL [ABC]|COM|COMMON|STOCK|SHS|ORD|THE|HOLDINGS?|GROUP|ADR|SPON(SORED)?|NEW)\b/g, " ").replace(/\s+/g, " ").trim(); }
  var KO = {"NVDA": "엔비디아", "AAPL": "애플", "MSFT": "마이크로소프트", "AMZN": "아마존", "GOOGL": "알파벳 A", "GOOG": "알파벳 C", "META": "메타", "AVGO": "브로드컴", "TSLA": "테슬라", "BRK-B": "버크셔 B", "NFLX": "넷플릭스", "AMD": "AMD", "COST": "코스트코", "PLTR": "팔란티어", "MU": "마이크론", "JPM": "JP모건", "LLY": "일라이 릴리", "WMT": "월마트", "V": "비자", "ORCL": "오라클"};
  function myFunds(){ var a = ls("xrFunds"); return Array.isArray(a) ? a : []; }
  var XR = {open: 0, q: "", sig: ""};
  function xrCalc(E, FHd){
    var C = window.__pdz && __pdz.cfg ? __pdz.cfg() : null; if (!C) return null;
    var A = amt(), w = C.w, SX = C.sx || [], x = SX.reduce(function(t, o){ return t + (+o.w || 0) / 100; }, 0), BD = C.bd || {}, bt = 0; for (var bk in BD) bt += BD[bk] / 100;   // 🏦 11/17 섞은 채권만큼 떼어 냄
    var k = Math.max(0, 1 - x - bt);
    var parts = {SPY: A * w.SPY / 100 * k, QQQ: A * w.QQQ / 100 * k, GLD: A * w.GLD / 100 * k, BIL: A * Math.max(0, 100 - w.SPY - w.QQQ - w.GLD) / 100 * k};
    var M = {}, add = function(key, nm, v, src){ if (!(v > 0)) return; var o = M[key] || (M[key] = {nm: nm, v: 0, s: {}}); o.v += v; o.s[src] = (o.s[src] || 0) + v; };
    var et = (E && E.etf) || {}, byName = {};
    ["SPY", "QQQ"].forEach(function(f){ ((et[f] || {}).top || []).forEach(function(h){ byName[nn(h[1])] = h[0]; }); });
    var expand = function(f, v, src){ var H = et[f]; if (!H || !H.top){ add("~" + f, f === "SPY" ? "S&P500 (구성 자료 없음)" : "나스닥100 (구성 자료 없음)", v, src); return; }
      H.top.forEach(function(h){ add(h[0], KO[h[0]] || h[1], v * h[2] / 100, src); }); if (H.rest > 0) add("~" + f + "r", (f === "SPY" ? "S&P500 나머지 " : "나스닥100 나머지 ") + Math.max(0, H.n - H.top.length) + "종목", v * H.rest / 100, src); };
    expand("SPY", parts.SPY, "S"); expand("QQQ", parts.QQQ, "Q"); add("~GLD", "금", parts.GLD, "G"); add("~BIL", "현금·단기채", parts.BIL, "C");
    SX.forEach(function(o){ var v = A * (+o.w || 0) / 100; if (!o.e && !/^\^/.test(o.s)) add(o.s, KO[o.s] || o.n, v, "X"); else add("~X" + o.s, o.n, v, "X"); });   // ➕ 11/18 섞은 종목 — 개별 종목은 종목으로(미국 종목은 S&P·나스닥 속 같은 종목과 합침)
    var BDN = {IEF: "미국채 10년", TLT: "미국채 30년", BRBOND: "브라질국채"}; for (var bk2 in BD) add("~B" + bk2, BDN[bk2] || bk2, A * BD[bk2] / 100, "B");
    var tot = A, F = myFunds(), fmiss = 0;
    F.forEach(function(f){
      var fa = +f.amt || 0; if (!(fa > 0)) return; tot += fa;
      var h = FHd && FHd.items && FHd.items[f.id]; if (!h){ add("~F" + f.id, f.nm + " (구성 자료 없음)", fa, "F"); fmiss++; return; }
      var s = 0;
      h.h.forEach(function(r){ var v = fa * r[1] / 100; s += r[1];
        if (/S&P\s*500/i.test(r[0]) && /ETF|INDEX|TRUST/i.test(r[0])) return expand("SPY", v, "F");
        if (/NASDAQ[\s-]*100|\bQQQ\b/i.test(r[0])) return expand("QQQ", v, "F");
        if (r[2] === "주식"){ var t = byName[nn(r[0])]; add(t || "n:" + nn(r[0]), t ? (KO[t] || r[0]) : r[0], v, "F"); }
        else if (r[2] === "채권") add("~BOND", "채권(펀드 속)", v, "F");
        else if (/예금|CASH|증거금|콜론|\bRP\b|현금|예탁|USD CALL|미수|미지급/i.test(r[0])) add("~CASHF", "현금·기타(펀드 속)", v, "F");
        else add("~FF" + nn(r[0]), r[0].slice(0, 22) + " (펀드 속 다른 펀드 — 더 못 풂)", v, "F"); });
      if (s < 99.5) add("~Fr" + f.id, f.nm.slice(0, 14) + " — 공개 안 된 " + Math.round(100 - s) + "%", fa * (100 - s) / 100, "F");
    });
    var L = Object.keys(M).map(function(k2){ var o = M[k2]; o.k = k2; return o; });
    var stocks = L.filter(function(o){ return o.k.charAt(0) !== "~"; }).sort(function(a, b){ return b.v - a.v; });
    var top7 = stocks.slice(0, 7), t7 = top7.reduce(function(s, o){ return s + o.v; }, 0);
    // 나스닥 몫 중 S&P 에도 든 종목 비중
    var ov = null; if (et.SPY && et.QQQ && et.SPY.top && et.QQQ.top && et.SPY.top.length >= 400){ var inS = {}; et.SPY.top.forEach(function(h){ inS[h[0]] = 1; inS[h[0].replace("-", ".")] = 1; });
      ov = 0; et.QQQ.top.forEach(function(h){ if (inS[h[0]] || (h[0] === "GOOG" && inS.GOOGL) || (h[0] === "GOOGL" && inS.GOOG)) ov += h[2]; }); }
    var both = parts.SPY > 0 && parts.QQQ > 0 ? stocks.filter(function(o){ return o.s.S && o.s.Q; }).reduce(function(s, o){ return s + o.v; }, 0) : 0;
    return {A: A, tot: tot, top7: top7, t7: t7, ov: ov, both: both, nStock: stocks.length, F: F, fmiss: fmiss, E: E, parts: parts, cfg: C};
  }
  var SCOL = {S: "#3987e5", Q: "#d95926", F: "#9b6bd6", X: "#d55181"};
  function xrH(R){
    if (!R) return '<div class="loading">계산 중…</div>';
    var max = R.top7.length ? R.top7[0].v : 1;
    var bars = R.top7.map(function(o){ var seg = ["S", "Q", "F", "X"].map(function(s){ return o.s[s] ? '<i style="flex:' + (o.s[s] / max).toFixed(4) + ';background:' + SCOL[s] + '"></i>' : ''; }).join("");
      return '<div class="xr-r"><span>' + e(String(o.nm).slice(0, 14)) + '</span><div class="xr-b">' + seg + '<i style="flex:' + Math.max(0, 1 - o.v / max).toFixed(4) + '"></i></div><b>' + (o.v / R.tot * 100).toFixed(1) + '%</b><em>' + won(o.v) + '원</em></div>'; }).join("");
    var E = R.E && R.E.etf || {}, srcs = ["SPY", "QQQ"].filter(function(f){ return E[f]; }).map(function(f){ return (f === "SPY" ? "S&P500" : "나스닥100") + " " + E[f].src + " " + md(E[f].asof); }).join(" · ");
    return '<div class="xr-k"><div><small>내 돈 ' + won(R.tot) + '원 중</small><b>' + (R.t7 / R.tot * 100).toFixed(1) + '%</b><em>상위 7종목</em></div>' +
      '<div><small>종목 수</small><b>' + R.nStock.toLocaleString() + '</b><em>풀어 보니</em></div>' +
      '<div><small>나스닥 몫 중</small><b>' + (R.ov == null ? '–' : Math.round(R.ov) + '%') + '</b><em>S&P 에도 든 종목</em></div></div>' +
      (R.top7.length ? '<div class="xr-lg">' + [["S", "S&P500"], ["Q", "나스닥100"], ["F", "펀드"], ["X", "종목"]].filter(function(z){ return R.top7.some(function(o){ return o.s[z[0]]; }); }).map(function(z){ return '<span><i style="background:' + SCOL[z[0]] + '"></i>' + z[1] + ' 몫</span>'; }).join("") + '</div>' + bars : '<p class="empty">주식 비중이 0 이에요 — 설계기 막대를 밀어 보세요.</p>') +
      (R.both > 0 ? '<p class="xr-s">S&P 와 나스닥에 나눠 담았지만, <b>두 곳에 다 든 종목</b>에 들어간 돈이 <b>' + won(R.both) + '원(' + (R.both / R.tot * 100).toFixed(0) + '%)</b> — 이름은 둘이어도 같은 회사를 두 번 사고 있어요.</p>' : '') +
      '<div class="xr-f"><b>📌 펀드 더하기</b> <small>금액을 넣으면 그 펀드 속 보유 종목까지 같이 풀어요(휴대폰에만 저장)</small>' +
        R.F.map(function(f){ return '<div class="xr-fr"><span>' + e(f.nm.slice(0, 26)) + '</span><input type="number" inputmode="numeric" min="0" step="100" placeholder="만원" value="' + (f.amt ? Math.round(f.amt / 1e4) : "") + '" data-xfa="' + e(f.id) + '"><small>만원</small><button data-xfx="' + e(f.id) + '" aria-label="빼기">✕</button></div>'; }).join("") +
        '<button class="em-add" id="xradd">' + (XR.open ? '닫기 ▴' : '＋ 펀드 담기') + '</button><div id="xrpick"' + (XR.open ? '' : ' hidden') + '></div></div>' +
      '<p class="note" style="margin:6px 0 0">설계기 비중 × 투자금(' + won(R.A) + '원 · 💼 주문서 칸)' + (R.cfg.st ? ' · 종목 ' + e(R.cfg.st) + ' ' + R.cfg.stw + '%' : '') + ' · 막대를 밀면 같이 바뀌어요 · ' + (srcs || '구성표 아직 없음 — 상품 작업이 하루 한 번 받아요') + ' · 펀드는 운용사 공개 보유 상위(금투협)만 · 같은 이름 통일은 글자 맞춤이라 일부 안 합쳐질 수 있어요 · 사라는 뜻이 아니에요.</p>';
  }
  function xrPaint(){
    var b = document.getElementById("xrbody"); if (!b) return;
    Promise.all([etfH(), fundH()]).then(function(r){ var b2 = document.getElementById("xrbody"); if (!b2) return; var R = xrCalc(r[0], r[1]); b2.innerHTML = xrH(R); xrBind(b2, r[1]); });
  }
  function xrBind(b, FHd){
    [].forEach.call(b.querySelectorAll("[data-xfa]"), function(i){ stop(i); i.onchange = function(){ var id = i.getAttribute("data-xfa"), v = Math.max(0, +i.value || 0) * 1e4; ls("xrFunds", myFunds().map(function(f){ if (f.id === id) f.amt = v; return f; })); xrPaint(); drPaint(); }; });
    [].forEach.call(b.querySelectorAll("[data-xfx]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var id = x.getAttribute("data-xfx"); ls("xrFunds", myFunds().filter(function(f){ return f.id !== id; })); xrPaint(); drPaint(); }; });
    var ad = document.getElementById("xradd"); if (ad) ad.onclick = function(ev){ ev.stopPropagation(); XR.open = !XR.open; xrPaint(); };
    if (XR.open) xrPick(FHd);
  }
  function xrPick(FHd){
    var el = document.getElementById("xrpick"); if (!el) return;
    var have = {}; myFunds().forEach(function(f){ have[f.id] = 1; });
    var items = (FHd && FHd.items) || {}, q = XR.q.trim().toLowerCase();
    var L = (PRODF || []).filter(function(f){ return items[f.c] && (!q || (f.n + f.co + f.t).toLowerCase().indexOf(q) >= 0); });
    var seen = {}; L = L.filter(function(f){ var k = f.n.replace(/\s*종류.*$|\s*Class.*$|\(.*?\)\s*[A-Za-z-]*$/i, ""); if (seen[k]) return false; seen[k] = 1; return true; });
    el.innerHTML = '<input aria-label="펀드 이름·운용사" class="em-q" id="xrq" placeholder="🔎 펀드 이름·운용사 (예: 미국, 반도체, 미래에셋)" value="' + e(XR.q) + '"><div class="em-pl">' +
      (L.length ? L.slice(0, 40).map(function(f){ return '<div class="em-pr"><div><b>' + e(f.n) + '</b><small>' + e(f.co) + ' · ' + e(f.t || "") + ' · 보유 상위 ' + items[f.c].h.length + '개 공개(' + e(String(items[f.c].d).replace(/(\d{4})(\d\d)(\d\d)/, "$1.$2.$3")) + ')</small></div>' +
        (have[f.c] ? '<span class="mut">담음</span>' : '<button data-xfp="' + e(f.c) + '">📌 담기</button>') + '</div>'; }).join("") : '<div class="empty">맞는 펀드가 없어요 — 보유 종목이 공개된 펀드만 담을 수 있어요.</div>') + '</div>';
    var qi = document.getElementById("xrq"); stop(qi);
    qi.oninput = function(){ XR.q = qi.value; clearTimeout(xrPick.t); xrPick.t = setTimeout(function(){ xrPick(FHd); var n = document.getElementById("xrq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); };
    [].forEach.call(el.querySelectorAll("[data-xfp]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); var id = b.getAttribute("data-xfp"), f = L.filter(function(x){ return x.c === id; })[0]; if (!f) return;
      var F = myFunds(); F.push({id: id, nm: f.n, amt: 1e7}); ls("xrFunds", F); XR.open = 0; xrPaint(); drPaint(); }; });
  }

  /* ═════════ ④ 🧯 내 돈 전체 비상 훈련 ═════════ */
  var DR = {busy: 0, sig: "", res: null};
  function episodes(r){   // S&P 가 고점에서 15% 넘게 빠진 구간: 고점·바닥·회복
    var sp = r.sp, N = sp.length, pk = 0, out = [], cur = null;
    for (var u = 1; u < N; u++){
      if (sp[u] >= sp[pk]){ if (cur && cur.dd <= -0.15){ cur.rec = u; out.push(cur); } pk = u; cur = null; continue; }
      var dd = sp[u] / sp[pk] - 1; if (!cur) cur = {pk: pk, tr: u, dd: dd};
      if (dd < cur.dd){ cur.dd = dd; cur.tr = u; }
    }
    if (cur && cur.dd <= -0.15){ cur.rec = null; out.push(cur); }
    return out;
  }
  function portEp(r, ep){   // 같은 구간 이 포트: 고점(S&P 고점 날) 대비 가장 낮은 값 · 그날 · 다시 고점 값까지 거래일
    var nv = r.nv, N = nv.length, base = nv[ep.pk], lo = base, lu = ep.pk, end = ep.rec == null ? N - 1 : Math.min(N - 1, ep.rec + 260);
    for (var u = ep.pk; u <= (ep.rec == null ? N - 1 : ep.rec); u++) if (nv[u] < lo){ lo = nv[u]; lu = u; }
    var back = null; for (var v = lu; v < N; v++) if (nv[v] >= base){ back = v - ep.pk; break; }
    var spBack = ep.rec == null ? null : ep.rec - ep.pk;
    return {dd: (lo / base - 1) * 100, tr: day2s(r.D[r.i0 + lu]), back: back, spBack: spBack, sp: ep.dd * 100, pkD: day2s(r.D[r.i0 + ep.pk]), trD: day2s(r.D[r.i0 + ep.tr]), recD: ep.rec == null ? null : day2s(r.D[r.i0 + ep.rec]), pkT: r.D[r.i0 + ep.pk], trT: r.D[r.i0 + ep.tr]};
  }
  function lbI(a, v){ var lo = 0, hi = a.length; while (lo < hi){ var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
  function rminA(K, a, b){ if (b < a) return Infinity; var k = 31 - Math.clz32(b - a + 1), x = K[k][a], y = K[k][b - (1 << k) + 1]; return x < y ? x : y; }
  function elsEp(G, q, EM, pkT, trT){   // 그 구간 고점 전 1년 안 매 거래일 가입했다면: 바닥까지 KI 닿음 · 끝까지 손실 · 손실 크기
    var D = G.D, s0 = lbI(D, pkT - 365), s1 = lbI(D, pkT), tE = lbI(D, trT); if (s1 >= D.length) s1 = D.length - 1; if (tE >= D.length) tE = D.length - 1;
    var n = 0, ki = 0, done = 0, loss = 0, lsum = 0, worst = 0;
    for (var s = s0; s <= s1; s++){
      n++;
      if (q.ki != null){ for (var a = 0; a < G.C.length; a++) if (rminA(G.K[a], s, tE) / G.C[a][s] < q.ki / 100){ ki++; break; } }
      var sim = EM.simAt(G, q, s); if (!sim) continue; done++;
      if (sim.k < 0 && sim.loss){ var p = sim.ev[sim.ev.length - 1], w = Infinity; for (var a2 = 0; a2 < G.C.length; a2++){ var r = G.C[a2][p] / G.C[a2][s]; if (r < w) w = r; } loss++; lsum += (w - 1) * 100; if ((w - 1) * 100 < worst) worst = (w - 1) * 100; }
    }
    return n ? {n: n, ki: ki, done: done, loss: loss, avg: loss ? lsum / loss : null, worst: worst} : null;
  }
  function myEls(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function drRun(){
    if (!window.__pdz || !__pdz.ready) return Promise.resolve(null);
    var C = __pdz.cfg(), w = __pdz.wts();
    var sig = JSON.stringify([C, amt(), myEls().map(function(x){ return [x.id, x.amt]; })]);
    if (DR.res && DR.sig === sig) return Promise.resolve(DR.res);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var r = __pdz.engine(A, w || (function(){ var s = C.w.SPY / 100, q = C.w.QQQ / 100, g = C.w.GLD / 100; return {SPY: s, QQQ: q, GLD: g, BIL: Math.max(0, 1 - s - q - g)}; })(), {reg: C.reg, vol: C.vol, start: ""});
      if (!r) return null;
      var EPS = episodes(r).map(function(ep){ return portEp(r, ep); });
      var L = myEls().filter(function(x){ return +x.amt > 0; }), EM = window.__elsMy;
      if (!L.length || !EM) return {r: r, eps: EPS, els: [], C: C, stk: !w};
      return EM.load().then(function(){
        return Promise.all(L.map(function(it){ var q = EM.parseKey(it.key); return Promise.all(q.ua.map(EM.epx)).then(function(ss){
          if (ss.some(function(x){ return !x; })) return {it: it, na: 1};
          var G = EM.align(ss); G.K = G.C.map(EM.sparse);
          return {it: it, q: q, per: EPS.map(function(ep){ return G.D[0] <= ep.pkT - 365 ? elsEp(G, q, EM, ep.pkT, ep.trT) : null; }), from: day2s(G.D[0])}; }); }));
      }).then(function(ELS){ return {r: r, eps: EPS, els: ELS, C: C, stk: !w}; });
    }).then(function(R){ DR.res = R; DR.sig = sig; return R; });
  }
  function drH(R){
    if (!R) return '<div class="empty">설계기 일봉을 아직 못 받았어요.</div>';
    var A = amt(), E = R.els || [], lim = +(ls("drLim") || 0), over = 0;
    var Etot = E.reduce(function(s, x){ return s + (+x.it.amt || 0); }, 0);
    var cards = R.eps.map(function(p, i){
      var pl = A * p.dd / 100, el = 0, eh = "";
      E.forEach(function(x){ if (x.na){ eh += '<div class="dr-e mut">' + e(x.it.nm.slice(0, 16)) + ' — 기초자산 일봉 없음</div>'; return; }
        var s = x.per[i]; if (!s){ eh += '<div class="dr-e mut">' + e(x.it.nm.slice(0, 16)) + ' — 그때 기초자산 자료 없음(' + x.from.slice(0, 4) + '~)</div>'; return; }
        var lr = s.done ? s.loss / s.done : null, exp = lr != null && s.avg != null ? +x.it.amt * lr * s.avg / 100 : 0; el += exp;
        eh += '<div class="dr-e"><b>' + e(x.it.nm.slice(0, 22)) + '</b> 고점 전 1년 안 가입한 날 ' + s.n + '번 → ' + (x.q.ki != null ? '바닥까지 <b class="' + (s.ki ? "dn" : "") + '">KI 닿음 ' + Math.round(s.ki / s.n * 100) + '%</b> · ' : '') +
          (s.done ? '끝까지 가 보니 손실 <b class="' + (s.loss ? "dn" : "") + '">' + Math.round(s.loss / s.done * 100) + '%</b>' + (s.loss ? '(손실이면 평균 ' + sg(s.avg, 0) + '%)' : '') + (s.done < s.n ? ' <span class="mut">· 만기 전 ' + (s.n - s.done) + '번 뺌</span>' : '') : '<span class="mut">아직 만기 전</span>') +
          (exp ? ' → 평균 <b class="dn">' + won(exp) + '원</b>' : '') + '</div>'; });
      var tot = pl + el; if (lim > 0 && -tot >= lim) over++;
      return '<div class="dr-c' + (lim > 0 && -tot >= lim ? ' over' : '') + '"><div class="dr-h"><b>' + p.pkD.slice(0, 7).replace("-", ".") + ' ~ ' + p.trD.slice(2, 7).replace("-", ".") + '</b><span>S&P ' + sg(p.sp, 0) + '%</span></div>' +
        '<div class="dr-m"><div><small>💼 내 포트</small><b class="dn">' + (pl < 0 ? "−" : "+") + won(Math.abs(pl)) + '원</b><em>' + sg(p.dd, 1) + '% · 바닥 ' + md(p.tr) + '</em></div>' +
          '<div><small>회복까지</small><b>' + (p.back == null ? '아직' : p.back + '일') + '</b><em>' + (p.back == null ? '고점 못 되찾음' : '거래일' + (p.spBack ? ' · S&P ' + p.spBack + '일' : '')) + '</em></div>' +
          (E.length ? '<div><small>합계(ELS 평균)</small><b class="dn">' + (tot < 0 ? "−" : "+") + won(Math.abs(tot)) + '원</b><em>' + sg(tot / (A + Etot) * 100, 1) + '%</em></div>' : '') + '</div>' + eh + '</div>'; }).join("");
    return '<p class="dr-in">지금 설계기 포트(' + won(A) + '원 · ' + (R.C.reg ? '🛡 방어 켬' : '🛡 방어 끔') + ' · ' + (R.C.vol ? '📉 변동성 맞춤 켬' : '📉 끔') + ')' + (Etot ? ' + 📌 ELS ' + E.length + '개(' + won(Etot) + '원)' : '') + '를 과거 큰 낙폭(S&P 고점에서 15% 넘게)에 그대로 넣어 봤어요.' + (R.stk ? ' <span class="mut">(설계기의 종목 칸은 빼고 셈)</span>' : '') + '</p>' +
      cards +
      '<div class="dr-lim"><label>😣 이만큼 잃으면 못 견딜 것 같다 <input type="number" inputmode="numeric" min="0" step="100" id="drlim" placeholder="만원" value="' + (lim ? Math.round(lim / 1e4) : "") + '"> 만원</label>' +
        (lim > 0 ? '<b' + (over ? ' class="dn"' : '') + '>' + R.eps.length + '번 중 ' + over + '번 넘었어요</b>' : '<small class="mut">넣으면 몇 번 넘었는지만 보여 줘요(비중을 고르라는 말은 안 해요)</small>') + '</div>' +
      drElsAmt() +
      '<p class="note" style="margin:6px 0 0">포트 = 설계기와 같은 엔진(배당 포함 SPY·QQQ·GLD·BIL · 규칙 그대로) · 손실 = S&P 고점 날 대비 가장 낮은 날 · 회복 = 그 고점 값을 되찾기까지 거래일 · ELS = 그 고점 전 1년 안 매 거래일 같은 조건으로 가입했다면(기본 스텝다운 · 손실 크기 = 만기 때 가장 못한 자산) · 「합계」의 ELS 는 평균(손실 비율 × 손실 크기) · 킥·종목·세금은 빼고 · 과거 계산이고 미래를 보장하지 않아요 · 팔라·사라는 뜻이 아니에요.</p>';
  }
  function drElsAmt(){
    var L = myEls(); if (!L.length) return '<p class="dr-in mut">🎯 상품 → ELS 탭 「📌 내 ELS 관제탑」에 담은 ELS 가 있으면 여기서 금액을 넣어 같이 셀 수 있어요.</p>';
    return '<div class="dr-ea"><b>📌 ELS 금액</b>' + L.map(function(x){ return '<div class="xr-fr"><span>' + e(String(x.nm).slice(0, 24)) + '</span><input type="number" inputmode="numeric" min="0" step="100" placeholder="만원" value="' + (x.amt ? Math.round(x.amt / 1e4) : "") + '" data-dra="' + e(x.id) + '"><small>만원</small></div>'; }).join("") + '</div>';
  }
  function drPaint(){
    var b = document.getElementById("drbody"); if (!b || DR.busy) return;
    DR.busy = 1;
    drRun().then(function(R){ DR.busy = 0; var b2 = document.getElementById("drbody"); if (!b2) return; b2.innerHTML = drH(R); drBind(b2); }, function(x){ DR.busy = 0; console.warn(x); });
  }
  function drBind(b){
    var li = document.getElementById("drlim"); if (li){ stop(li); li.onchange = function(){ ls("drLim", Math.max(0, +li.value || 0) * 1e4); var b2 = document.getElementById("drbody"); if (b2 && DR.res){ b2.innerHTML = drH(DR.res); drBind(b2); } }; }
    [].forEach.call(b.querySelectorAll("[data-dra]"), function(i){ stop(i); i.onchange = function(){ var id = i.getAttribute("data-dra"), v = Math.max(0, +i.value || 0) * 1e4; ls("elsmy", myEls().map(function(x){ if (x.id === id) x.amt = v; return x; })); drPaint(); }; });
  }

  /* ── 포트 탭에 붙이기 (설계기 카드 밑) ── */
  function portMount(){
    var pz = document.querySelector("#podz section.card.pz"); if (!pz) return;
    if (!document.getElementById("xrsec")){
      var s = document.createElement("section"); s.className = "card xr no-clp"; s.id = "xrsec"; s.dataset.xc = "1";
      s.innerHTML = '<div class="xr-hd"><b>🔬 내 돈 속 진짜 종목</b><small>설계기 비중 · 펀드까지 구성 종목으로 풀어 보기</small></div><div id="xrbody"><div class="loading">구성표 불러오는 중…</div></div>';
      pz.parentNode.insertBefore(s, pz.nextSibling); xrPaint();
    }
    if (!document.getElementById("drsec")){
      var d = document.createElement("section"); d.className = "card dr no-clp"; d.id = "drsec"; d.dataset.xc = "1";
      d.innerHTML = '<div class="xr-hd"><b>🧯 내 돈 전체 비상 훈련</b><small>지금 포트 + 담아 둔 ELS 를 과거 폭락에 그대로</small></div><div id="drbody"><div class="loading">2008년부터 다시 굴리는 중…</div></div>';
      var x = document.getElementById("xrsec"); x.parentNode.insertBefore(d, x.nextSibling); drPaint();
    }
    var C = window.__pdz && __pdz.cfg ? JSON.stringify(__pdz.cfg()) + amt() : "";
    if (C && C !== XR.sig){ var first = !XR.sig; XR.sig = C; if (!first){ xrPaint(); clearTimeout(portMount.t); portMount.t = setTimeout(drPaint, 400); } }
  }
  // 슬라이더를 미는 동안에도 🔬 를 같이 움직임(계산이 가벼움 · 🧯 는 손을 뗄 때)
  document.addEventListener("input", function(ev){ var t = ev.target; if (t && t.matches && t.matches("#podz input[data-pz], #podz #pzstw")){ clearTimeout(xrPaint.t); xrPaint.t = setTimeout(xrPaint, 60); } }, true);

  /* ── 종목 화면: 지금 열린 종목 ── */
  var CURSYM = "";
  var OLD = window.sigBadges;
  if (typeof OLD === "function") window.sigBadges = function(sym){ CURSYM = sym; return OLD(sym); };
  window.__u1023 = {lead: lead, dna: dna, twinsOf: twinsOf, xrCalc: function(){ return Promise.all([etfH(), fundH()]).then(function(r){ return xrCalc(r[0], r[1]); }); }, drRun: drRun, episodes: episodes};   // 검사용

  var T = null;
  function tick(){ T = null; try { leadMount(); } catch(x) { console.warn(x); } try { dnaMount(); } catch(x) { console.warn(x); } try { feedLead(); } catch(x) { console.warn(x); } try { portMount(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".ldc h3 .mut{font-size:12.5px;font-weight:500}.ld-svg{width:100%;height:auto;display:block;margin:4px 0 2px}.ld-line{stroke:var(--text);stroke-width:1.6;opacity:.75}.ld-since{stroke:var(--sub);stroke-dasharray:3 3;stroke-width:1}" +
    ".ld-tx{font-size:9.5px;fill:var(--sub)}.ld-n{font-size:8px;font-weight:800;fill:#111}" +
    ".ld-r{display:grid;grid-template-columns:20px 44px 1fr auto;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:13px}.ld-r>i{width:18px;height:18px;border-radius:50%;font-style:normal;font-size:12.5px;font-weight:800;color:#111;display:flex;align-items:center;justify-content:center}" +
    ".ld-d{font-variant-numeric:tabular-nums;color:var(--sub);font-size:12.5px}.ld-d small{display:block;font-size:12.5px;color:var(--dim)}.ld-c a{color:var(--text);text-decoration:none;font-weight:700}.ld-c small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".ld-r>b{font-variant-numeric:tabular-nums;white-space:nowrap;font-size:14px}.ld-r b.up,.ld-s b.up{color:var(--up)}.ld-r b.dn{color:var(--down)}.ld-s{font-size:12.5px;color:var(--sub);margin:6px 0 0;word-break:keep-all}.ld-s b{color:var(--text)}" +
    ".ld-fs{font-size:12.5px;color:var(--sub)}.ld-fs b{color:var(--text)}" +
    ".dnt{margin-top:10px}.dt-me{display:block;font-size:12.5px;color:var(--sub);margin:2px 0 4px;word-break:keep-all}.dt-r{display:flex;gap:10px;align-items:center;padding:7px 0;border-top:1px solid var(--line);color:inherit;text-decoration:none}" +
    ".dt-rd{width:58px;height:58px;flex:none}.dt-b{min-width:0;flex:1}.dt-b b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dt-b small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".dt-df{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}.dt-df span{font-size:12.5px;padding:1px 7px;border-radius:999px;background:var(--panel2)}.dt-df .dt-p{color:var(--up)}.dt-df .dt-m{color:var(--down)}" +
    ".xr-hd b{display:block;font-size:var(--fs-h,17px);font-weight:800}.xr-hd small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px}" +
    ".xr-k{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0 8px}.xr-k>div{background:var(--panel2);border-radius:10px;padding:7px 4px;text-align:center}.xr-k small,.xr-k em{display:block;font-size:12.5px;color:var(--sub);font-style:normal;word-break:keep-all}.xr-k b{display:block;font-size:20px;font-variant-numeric:tabular-nums;white-space:nowrap;margin:1px 0}" +
    ".xr-lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:2px 0 4px}.xr-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".xr-r{display:grid;grid-template-columns:86px 1fr 46px 52px;gap:6px;align-items:center;font-size:12.5px;margin:5px 0}.xr-r span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xr-r b{text-align:right;font-variant-numeric:tabular-nums}.xr-r em{font-style:normal;font-size:12.5px;color:var(--sub);text-align:right;white-space:nowrap}" +
    ".xr-b{display:flex;height:10px;border-radius:5px;overflow:hidden;background:var(--panel2)}.xr-b i{display:block;height:100%}" +
    ".xr-s{font-size:12.5px;margin:8px 0 0;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#d95926 10%,var(--panel2));word-break:keep-all}" +
    ".xr-f{margin-top:10px;padding-top:8px;border-top:1px solid var(--line)}.xr-f>small{display:block;font-size:12.5px;color:var(--sub)}.xr-f>b,.dr-ea>b{font-size:14px}" +
    ".xr-fr{display:grid;grid-template-columns:1fr 84px auto auto;gap:6px;align-items:center;font-size:12.5px;margin:6px 0}.xr-fr span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.xr-fr input,.dr-lim input{font:inherit;font-size:14px;padding:4px 6px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--text);width:100%;box-sizing:border-box;text-align:right}" +
    ".xr-fr small{font-size:12.5px;color:var(--sub)}.xr-fr button{border:0;background:none;color:var(--sub);font-size:15px;cursor:pointer}" +
    ".dr-in{font-size:12.5px;color:var(--sub);margin:8px 0 6px;word-break:keep-all}.dr-c{margin:8px 0 0;padding:9px 10px;border-radius:12px;background:var(--panel2)}.dr-c.over{box-shadow:inset 0 0 0 1.5px var(--down)}" +
    ".dr-h{display:flex;justify-content:space-between;font-size:13.5px}.dr-h span{color:var(--sub);font-size:12.5px}.dr-m{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;margin:6px 0 2px}" +
    ".dr-m small,.dr-m em{display:block;font-size:12.5px;color:var(--sub);font-style:normal}.dr-m b{display:block;font-size:17px;font-variant-numeric:tabular-nums;white-space:nowrap}.dr-m b.dn,.dr-e b.dn,.dr-lim b.dn{color:var(--down)}.dr-lim b.up{color:var(--up)}" +
    ".dr-e{font-size:12.5px;margin-top:5px;word-break:keep-all}.dr-lim{margin:10px 0 0;font-size:13px}.dr-lim label{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.dr-lim input{width:96px}.dr-lim b,.dr-lim small{display:block;margin-top:4px}.dr-ea{margin-top:10px}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
__bk(55);
/* ======== ux1026.js ======== */
/* 10/26 사용자 「다 진행해」 — 📱 앱 아이디어 A10/26-1·2·3
   ① 🎯 어느 쪽이 먼저 닿나 (A10/26-1) — 📄 종목 화면 📝 내 메모 밑: 매수가(없으면 지금 값)·목표가·손절가의 「비율」로
      2006년부터 매 거래일 들어갔다면 목표가가 먼저 닿은 비율 · 손절가가 먼저 · 기간 안 둘 다 아님 · 걸린 날 중앙값.
      같은 비율을 그 시장 지수에 넣은 기준선, 목표·손절 슬라이더, 20·60·120거래일 칩.
      자료: archive/x/memo_px/<코드>.json (memo_px.py · 매시간 watch 뒤 — 관심종목(목표가 알림 때문에 이미 올라가는 코드)만 2006~ 일봉)
   ② 📐 오늘 등락 세 조각 (A10/26-2) — 📄 종목 화면 「지금은」 밑: 최근 마감 등락 = 시장 + 업종(이 종목 뺀 시총 가중, 시장보다) + 이 종목만.
      「이 종목만」이 ±2% 넘으면 그 무렵 뉴스 3개. 20거래일은 한 줄.
      자료: opdata compass.json markets[시장].ind_r (opdb/compass.py · 업종마다 종목 수·시총 합·등락) · q/ 일봉 60일 · sec.json(업종·시총)
   ③ 🗺 거르기 한 장 지도 (A10/26-3) — 🔎 아침 거르기 맨 위: 가로 = 52주 고점 대비 · 세로 = 20일 수익 · 크기 = 거래대금 ·
      테두리 색 = 거름망 4종 · 👁 찍은 것 ★. 지난 거르기에 처음 걸린 날 위치의 작은 점을 「그 뒤 지금까지」 오름(빨강)/내림(파랑)으로.
      자료: archive/screen/<날짜>/screens.json · opdata screen_px.json (opdb/screens.py screen_px · 지난 거르기 종목의 최근 종가)
   원칙: 과거 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」·「준비 중」). */
(function(){
  var OPD = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function J(u, t){ return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + "h=" + Math.floor(Date.now() / (t || 600000)), {ttl: t || 600000}).catch(function(){ return null; }); }
  function kn(c){ c = String(c || ""); return /^\d{6}(\.K[SQ])?$/.test(c) ? c.slice(0, 6) : c; }
  function mkOf(s){ return /^\d{6}$/.test(s) || /\.K[SQ]$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /\.(SS|SZ)$/.test(s) ? "CN" : "US"; }
  function fnv(str){ var h = 0x811c9dc5, b = new TextEncoder().encode(str); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function shard(sym){ var x = (fnv(sym) % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  function fname(s){ return String(s).replace(/[^A-Za-z0-9._-]/g, "_"); }
  function median(a){ if (!a.length) return null; var b = a.slice().sort(function(x, y){ return x - y; }), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  function wl(){ try { return (window.PL && PL.WL && PL.WL()) || (store && store.wl) || {}; } catch(x) { return {}; } }
  function nowPx(sym){ return window.V && V.price ? V.price(kn(sym)).catch(function(){ return null; }) : Promise.resolve(null); }

  /* ═════════ ① 🎯 어느 쪽이 먼저 닿나 ═════════ */
  var BASEIX = {US: ["^GSPC", "S&P500"], KR: ["^KS11", "코스피"], KQ: ["^KQ11", "코스닥"], JP: ["^N225", "닛케이"], HK: ["^HSI", "항셍"], CN: ["000001.SS", "상해종합"]};
  var MPX = {};
  function memoPx(code){ var f = fname(code); if (!MPX[f]) MPX[f] = J("archive/x/memo_px/" + f + ".json", 3600e3).then(function(j){ if (!j || !j.c) MPX[f] = null; return j && j.c ? j : null; }); return MPX[f]; }
  // 매 거래일 종가에 들어가 → 다음 날부터 H 거래일 안: 고가 ≥ 목표 / 저가 ≤ 손절 (같은 날 둘 다면 손절로 — 보수적으로)
  function firstHit(P, tp, sp, H){
    var c = P.c, h = P.h, l = P.l, n = c.length, T = 0, S = 0, N = 0, days = [], both = 0;
    for (var i = 0; i + H < n; i++){
      var up = c[i] * (1 + tp), dn = c[i] * (1 - sp), got = 0;
      for (var j = i + 1; j <= i + H; j++){
        var hs = l[j] <= dn, ht = h[j] >= up;
        if (hs || ht){ if (hs){ S++; if (ht) both++; } else T++; days.push(j - i); got = 1; break; }
      }
      if (!got) N++;
    }
    var tot = T + S + N;
    return tot ? {n: tot, t: T / tot * 100, s: S / tot * 100, x: N / tot * 100, med: median(days), both: both} : null;
  }
  var MM = {};     // 종목별 슬라이더 상태 (화면 안에서만)
  function memoMount(){
    var memo = document.getElementById("opmemo"); if (!memo) return;
    var sec = memo.closest("section") || memo.parentNode, st = sec.querySelector(".vd [data-star]");
    var sym = st ? st.getAttribute("data-star") : null; if (!sym) return;
    var k = kn(sym), w = wl()[k] || {}, sig = k + "|" + (w.buy || "") + "|" + (w.tgt || "") + "|" + (w.stop || "");
    var box = sec.querySelector(".mfh");
    if (box && box.dataset.sig === sig) return;
    if (!w.tgt && !w.stop){ if (box) box.remove(); return; }
    if (!box){ box = document.createElement("div"); box.className = "mfh"; memo.parentNode.insertBefore(box, memo.nextSibling); }
    box.dataset.sig = sig;
    if (!w.tgt || !w.stop){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">목표가와 손절가를 <b>둘 다</b> 적으면, 과거 이 종목에 같은 비율로 들어갔을 때 어느 쪽이 먼저 닿았는지 보여 드려요.</p>'; return; }
    box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">불러오는 중…</p>';
    var mk = mkOf(sym), bi = BASEIX[/\.KQ$/.test(sym) ? "KQ" : mk] || BASEIX.US;
    Promise.all([memoPx(k), memoPx(bi[0]), w.buy ? Promise.resolve(null) : nowPx(sym)]).then(function(r){
      if (!box.isConnected || box.dataset.sig !== sig) return;
      var P = r[0], B = r[1], base = +w.buy || (r[2] && r[2][1]);
      if (!base){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">기준 값(매수가)을 몰라 계산을 못 해요 — 매수가를 적어 주세요.</p>'; return; }
      var tp0 = +w.tgt / base - 1, sp0 = 1 - +w.stop / base;
      if (!(tp0 > 0) || !(sp0 > 0) || sp0 >= 0.95){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">목표가는 ' + (w.buy ? "매수가" : "지금 값") + '보다 위, 손절가는 아래여야 계산할 수 있어요.</p>'; return; }
      if (!P){ box.innerHTML = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나</div><p class="mfh-n">📥 이 종목 2006년부터의 일봉을 받는 중이에요 — 관심종목이 동기화된 뒤 다음 감시(장중 매시간 · 저녁 8시)에 받아요. 그 뒤 다시 열면 보여요.</p>'; return; }
      var S0 = MM[k] && MM[k].sig === sig ? MM[k] : (MM[k] = {sig: sig, tp: Math.round(tp0 * 1000) / 10, sp: Math.round(sp0 * 1000) / 10, H: 60});
      function draw(){
        var tp = S0.tp / 100, sp = S0.sp / 100, R = firstHit(P, tp, sp, S0.H), RB = B ? firstHit(B, tp, sp, S0.H) : null;
        var yrs = ((P.t[P.t.length - 1] || 0) / 365.25), mine = Math.abs(S0.tp - tp0 * 100) < 0.05 && Math.abs(S0.sp - sp0 * 100) < 0.05;
        var h = '<div class="mfh-h">🎯 어느 쪽이 먼저 닿나 <small>과거 되감기 · ' + e(P.d0.slice(0, 4)) + '년부터 매 거래일</small></div>';
        if (!R){ box.innerHTML = h + '<p class="mfh-n">일봉이 짧아(' + P.c.length + '일) 계산을 못 해요.</p>'; return; }
        h += '<p class="mfh-q">' + (w.buy ? "매수가" : "지금 값") + ' 기준 <b class="up">목표 +' + S0.tp.toFixed(1) + '%</b> · <b class="dn">손절 −' + S0.sp.toFixed(1) + '%</b> 비율로 ' + S0.H + '거래일 안에' + (mine ? '' : ' <span class="mfh-x">(슬라이더 값)</span>') + '</p>' +
          '<div class="mfh-bar"><i class="a" style="width:' + R.t + '%"></i><i class="b" style="width:' + R.s + '%"></i><i class="c" style="width:' + R.x + '%"></i></div>' +
          '<div class="mfh-k"><div><small>🎯 목표 먼저</small><b class="g">' + R.t.toFixed(0) + '%</b></div><div><small>🛑 손절 먼저</small><b class="r">' + R.s.toFixed(0) + '%</b></div><div><small>둘 다 아님</small><b>' + R.x.toFixed(0) + '%</b></div></div>' +
          '<p class="mfh-l">닿은 경우 걸린 날 가운데 값 <b>' + (R.med == null ? "–" : R.med + "거래일") + '</b>' + (RB ? ' · 기준선 ' + e(bi[1]) + '에 같은 비율이면 목표 먼저 <b>' + RB.t.toFixed(0) + '%</b> · 손절 먼저 <b>' + RB.s.toFixed(0) + '%</b>' : '') + '</p>' +
          '<label class="mfh-s"><span>🎯 목표 +<b>' + S0.tp.toFixed(1) + '</b>%</span><input type="range" min="1" max="100" step="0.5" value="' + Math.min(100, S0.tp) + '" data-k="tp"></label>' +
          '<label class="mfh-s"><span>🛑 손절 −<b>' + S0.sp.toFixed(1) + '</b>%</span><input type="range" min="1" max="50" step="0.5" value="' + Math.min(50, S0.sp) + '" data-k="sp"></label>' +
          '<div class="mfh-c">' + [20, 60, 120].map(function(x){ return '<button type="button" data-h="' + x + '" class="' + (x === S0.H ? "on" : "") + '">' + x + '거래일</button>'; }).join("") +
          (mine ? '' : '<button type="button" data-r="1">↺ 내 메모 값</button>') + '</div>' +
          '<p class="mfh-n">표본 ' + R.n.toLocaleString() + '번(약 ' + yrs.toFixed(0) + '년' + (yrs < 5 ? " — 짧아요" : "") + ') · 고가·저가로 확인, 같은 날 둘 다 닿은 ' + R.both + '번은 손절로 셈 · 배당·분할 반영 일봉. 과거 계산이고 미래를 보장하지 않아요 — 사라·팔라는 뜻이 아니에요.</p>';
        box.innerHTML = h;
        [].forEach.call(box.querySelectorAll("input[type=range]"), function(inp){
          inp.oninput = function(){ S0[inp.dataset.k] = +inp.value; var b = inp.parentNode.querySelector("b"); if (b) b.textContent = (+inp.value).toFixed(1); };
          inp.onchange = function(){ S0[inp.dataset.k] = +inp.value; draw(); };
        });
        [].forEach.call(box.querySelectorAll(".mfh-c button"), function(b){ b.onclick = function(){ if (b.dataset.r){ S0.tp = Math.round(tp0 * 1000) / 10; S0.sp = Math.round(sp0 * 1000) / 10; } else S0.H = +b.dataset.h; draw(); }; });
      }
      draw();
    });
  }

  /* ═════════ ② 📐 오늘 등락 세 조각 ═════════ */
  var SECJ = null, QS = {};
  function secAll(){ return SECJ || (SECJ = getJSON(OPD + "sec.json").catch(function(){ SECJ = null; return {}; })); }
  function qShard(sh){ if (!QS[sh]) QS[sh] = getJSON(OPD + "q/" + sh + ".json", {ttl: 3600e3}).catch(function(){ QS[sh] = null; return {}; }); return QS[sh]; }
  function qOf(sym){ return qShard(shard(sym)).then(function(j){ return j && j[sym]; }); }
  function newsOf(sym){ return getJSON(OPD + "n/" + fname(sym) + ".json").catch(function(){ return []; }); }
  function addD(d, n){ var t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
  function ixFor(sym, R){ var mk = mkOf(sym), ix = R.ix || {}, pick = mk === "KR" ? (/\.KQ$/.test(sym) ? "^KQ11" : "^KS11") : mk === "US" ? "^GSPC" : mk === "JP" ? "^N225" : mk === "HK" ? "^HSI" : (/\.SZ$/.test(sym) ? "399001.SZ" : "000001.SS");
    if (ix[pick]) return [pick, ix[pick]]; for (var k in ix) return [k, ix[k]]; return null; }
  var IXNM = {"^GSPC": "S&P500", "^KS11": "코스피", "^KQ11": "코스닥", "^N225": "닛케이", "^HSI": "항셍", "000001.SS": "상해종합", "399001.SZ": "선전성분", "^IXIC": "나스닥"};
  function wfall(parts, tot){
    // 폭포 막대: 0 → 시장 → +업종 → +이 종목만 = 합
    var W = 340, H = 64, L = 8, R = 8, mx = 0.5, run = 0, pts = [];
    parts.forEach(function(p){ pts.push([run, run + p[1]]); run += p[1]; mx = Math.max(mx, Math.abs(run)); });
    pts.forEach(function(q){ mx = Math.max(mx, Math.abs(q[0]), Math.abs(q[1])); });
    var X = function(v){ return L + (v + mx) / (2 * mx) * (W - L - R); }, bh = 12, s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dcp-svg" role="img" aria-label="등락 나누기">';
    s += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="2" y2="' + (H - 2) + '" class="dcp-z"/>';
    parts.forEach(function(p, i){ var a = X(pts[i][0]), b = X(pts[i][1]), y = 4 + i * (bh + 4);
      s += '<rect x="' + Math.min(a, b).toFixed(1) + '" y="' + y + '" width="' + Math.max(1.5, Math.abs(b - a)).toFixed(1) + '" height="' + bh + '" rx="3" fill="' + p[2] + '"/>';
      if (i) s += '<line x1="' + a.toFixed(1) + '" x2="' + a.toFixed(1) + '" y1="' + (y - 4) + '" y2="' + y + '" class="dcp-k"/>'; });
    return s + '</svg>';
  }
  function decompMount(){
    var vd = document.querySelector("#main .vd"); if (!vd) return;
    var st = vd.querySelector("[data-star]"), sym = st && st.getAttribute("data-star"); if (!sym) return;
    if (/^\d{6}$/.test(sym)) return;             // 거래소 접미사가 없는 코드는 아래에서 .KS/.KQ 로 찾음
    var host = vd.parentNode; if (!host || host.querySelector(".dcp") || host.dataset.dcp === sym) return;
    host.dataset.dcp = sym;
    var mk = mkOf(sym);
    Promise.all([getJSON(OPD + "compass.json").catch(function(){ return null; }), secAll(), qOf(sym)]).then(function(r){
      var C = r[0], SEC = r[1] || {}, Q = r[2], m = C && C.markets && C.markets[mk], R = m && m.ind_r;
      if (!R || !R.i || !Q || !host.isConnected || host.querySelector(".dcp")) return;
      var meta = SEC[sym] || [], ind = meta[1], cap = +meta[2] || 0, IR = ind ? R.i[ind] : null, ixp = ixFor(sym, R);
      // 이 종목: 업종 집계와 같은 마감일의 종가
      var d0 = Q[0], t = Q[1], c = Q[2], i = -1;
      for (var a = t.length - 1; a >= 0; a--) if (addD(d0, t[a]) === R.d){ i = a; break; }
      if (i < 1) return;
      var s1 = (c[i] / c[i - 1] - 1) * 100, s20 = i >= 20 ? (c[i] / c[i - 20] - 1) * 100 : null;
      var mx1 = ixp && ixp[1][0] != null ? +ixp[1][0] : null, mx20 = ixp && ixp[1][1] != null ? +ixp[1][1] : null;
      var ex1 = null, ex20 = null, nx = 0;
      if (IR && IR[0] - 1 >= 2 && cap > 0 && IR[1] - cap > IR[1] * 0.02){ ex1 = (IR[2] * IR[1] - s1 * cap) / (IR[1] - cap); nx = IR[0] - 1;
        if (IR[3] && IR[4] != null && s20 != null && IR[3] - cap > IR[3] * 0.02) ex20 = (IR[4] * IR[3] - s20 * cap) / (IR[3] - cap); }
      else if (IR && cap <= 0 && IR[0] >= 3){ ex1 = IR[2]; nx = IR[0]; if (IR[4] != null) ex20 = IR[4]; }
      if (mx1 == null) return;
      var parts = [["🌐 시장(" + (IXNM[ixp[0]] || ixp[0]) + ")", mx1, "#8a94a8"]];
      if (ex1 != null) parts.push(["🏭 업종(" + ind + ")", ex1 - mx1, "#e9c46a"]);
      parts.push(["🎯 이 종목만", s1 - (ex1 != null ? ex1 : mx1), "#5ac8fa"]);
      var own = parts[parts.length - 1][1];
      var h = '<div class="dcp-h">📐 ' + md(R.d) + ' 등락 세 조각 <b class="' + cl(s1) + '">' + sg(s1) + '%</b> <small>' + md(R.d) + ' 마감 기준</small></div>' + wfall(parts, s1) +
        '<div class="dcp-l">' + parts.map(function(p, k){ return '<span><i style="background:' + p[2] + '"></i>' + e(p[0]) + ' <b class="' + cl(p[1]) + '">' + sg(p[1]) + (k ? '%p' : '%') + '</b></span>'; }).join("") + '</div>';
      var big = parts.slice().sort(function(x, y){ return Math.abs(y[1]) - Math.abs(x[1]); })[0];
      h += '<p class="dcp-t">' + (Math.abs(s1) < 0.3 ? "거의 안 움직인 날이에요." : "가장 큰 몫은 <b>" + e(big[0].replace(/^\S+ /, "")) + "</b>" + (big[0].indexOf("이 종목만") >= 0 ? " — 시장·업종과 따로 움직였어요." : big[0].indexOf("업종") >= 0 ? " — 같은 업종이 다 같이 움직였어요." : " — 시장 전체가 움직인 날이에요.")) + '</p>';
      if (s20 != null && mx20 != null){
        var o20 = s20 - (ex20 != null ? ex20 : mx20);
        h += '<p class="dcp-t">📅 20거래일 <b class="' + cl(s20) + '">' + sg(s20) + '%</b> = 시장 ' + sg(mx20) + '%' + (ex20 != null ? ' · 업종 ' + sg(ex20 - mx20) + '%p' : '') + ' · 이 종목만 <b class="' + cl(o20) + '">' + sg(o20) + '%p</b></p>';
      }
      h += '<p class="dcp-n">업종 = ' + (ex1 != null ? e(ind) + ' ' + nx + '종목(이 종목 뺀 시가총액 가중)' : '자료 없음') + ' · 시장 = ' + e(IXNM[ixp[0]] || ixp[0]) + ' 지수' + (ixp[1][2] && ixp[1][2] !== R.d ? ' (' + md(ixp[1][2]) + ')' : '') + ' · 장중 값은 마감 뒤 반영</p>';
      var box = document.createElement("div"); box.className = "dcp"; box.innerHTML = h + (Math.abs(own) >= 2 ? '<div class="dcp-nw" id="dcpnw"><small>🗞 이 종목만 ' + sg(own) + '%p — 그 무렵 소식 불러오는 중…</small></div>' : '');
      vd.parentNode.insertBefore(box, vd.nextSibling);
      if (Math.abs(own) >= 2) newsOf(sym).then(function(N){
        var el = box.querySelector("#dcpnw"); if (!el) return;
        var lo = addD(R.d, -3), hi = addD(R.d, 1);
        var L = (N || []).filter(function(x){ return x && x.date && x.date >= lo && x.date <= hi; }).slice(0, 3);
        el.innerHTML = '<small>🗞 이 종목만 ' + sg(own) + '%p — ' + md(lo) + '~' + md(R.d) + ' 소식' + (L.length ? '' : ' 없음 (📰 피드·종목 뉴스를 확인해 보세요)') + '</small>' +
          L.map(function(x){ return '<a href="' + e(x.link) + '" target="_blank" rel="noopener">' + e(x.title) + ' <em>' + e(x.publisher || "") + ' · ' + md(x.date) + '</em></a>'; }).join("");
      });
    });
  }

  /* ═════════ ③ 🗺 거르기 한 장 지도 ═════════ */
  var GRP = {quiet: ["🤫", "조용한 돈 유입", "#f4a261"], lead: ["🏆", "섹터 1등주", "#e9c46a"], hush: ["🌱", "조용한 신고가", "#7ee0b5"], triple: ["🐋", "고래+임원+차트", "#c792ea"]};
  var SCR = {};
  function scrDay(d){ if (!SCR[d]) SCR[d] = getJSON("archive/screen/" + d + "/screens.json", {ttl: 3600e3}).catch(function(){ SCR[d] = null; return null; }); return SCR[d]; }
  function curScrDate(){ var d = window.curDate; return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }
  function eyesOn(d){ var o = ls("eyeScr"); return (o && o[d]) || []; }
  var MAP = {past: true, sel: null, date: null, data: null};
  function rowsOf(D){ var out = [], seen = {}; Object.keys(GRP).forEach(function(k){ (D && D[k] || []).forEach(function(r){ if (!r || !r.s || seen[r.s] || r.hi == null || r.r20 == null) return; seen[r.s] = 1; out.push({s: r.s, n: r.n, m: r.m, g: k, hi: +r.hi, r20: +r.r20, tv: +r.tv || 0, c: +r.c}); }); }); return out; }
  function mapData(date){
    var ids = ((window.M && M.cats && M.cats.screen) || []).map(function(x){ return x.id; }).filter(function(x){ return /^\d{4}-\d{2}-\d{2}$/.test(x) && x <= date; }).sort();
    var past = ids.filter(function(x){ return x < date; }).slice(-20);
    return Promise.all([scrDay(date), J(OPD + "screen_px.json", 1800e3)].concat(past.map(scrDay))).then(function(r){
      var today = rowsOf(r[0]), PX = (r[1] && r[1].px) || {}, first = {};
      past.forEach(function(d, k){ var D = r[k + 2]; if (!D) return; var sd = D.date || d;
        rowsOf(D).forEach(function(x){ if (first[x.s]) return; var p = PX[x.s]; x.d = sd; if (p && p[0] > sd && p[1] > 0 && x.c > 0){ x.after = (p[1] / x.c - 1) * 100; x.at = p[0]; } first[x.s] = x; }); });
      var P = Object.keys(first).map(function(s){ return first[s]; }).filter(function(x){ return x.after != null; });
      return {today: today, past: P, ndays: past.length, at: r[1] && r[1].at};
    });
  }
  function mapSvg(Dt){
    var W = 340, H = 236, L = 34, R = 8, T = 10, B = 30, today = Dt.today, past = MAP.past ? Dt.past : [];
    var all = today.concat(past), xs = all.map(function(x){ return x.hi; }), ys = all.map(function(x){ return x.r20; });
    if (!all.length) return "";
    var srt = function(a){ return a.slice().sort(function(p, q){ return p - q; }); }, q = function(a, f){ var b = srt(a); return b[Math.max(0, Math.min(b.length - 1, Math.floor(f * (b.length - 1))))]; };
    var x0 = Math.min(-5, Math.floor(q(xs, 0.03) / 5) * 5), x1 = Math.max(0, Math.ceil(q(xs, 1) / 5) * 5);
    var y0 = Math.min(-10, Math.floor(q(ys, 0.03) / 10) * 10), y1 = Math.max(10, Math.ceil(q(ys, 0.97) / 10) * 10);
    var X = function(v){ return L + (Math.max(x0, Math.min(x1, v)) - x0) / (x1 - x0) * (W - L - R); }, Y = function(v){ return T + (y1 - Math.max(y0, Math.min(y1, v))) / (y1 - y0) * (H - T - B); };
    var tvs = srt(today.map(function(x){ return x.tv; })), tvMax = tvs[tvs.length - 1] || 1;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="smap-svg" role="img" aria-label="거르기 지도">';
    var xs_ = x1 - x0 > 30 ? 10 : 5;
    for (var gx = Math.ceil(x0 / xs_) * xs_; gx <= x1; gx += xs_) s += '<line x1="' + X(gx).toFixed(1) + '" x2="' + X(gx).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" class="smap-g"/><text x="' + X(gx).toFixed(1) + '" y="' + (H - B + 13) + '" class="smap-t" text-anchor="' + (gx + xs_ > x1 ? "end" : "middle") + '">' + (gx ? gx : "고점") + '</text>';
    var ys_ = (y1 - y0) > 80 ? 20 : 10;
    for (var gy = Math.ceil(y0 / ys_) * ys_; gy <= y1; gy += ys_) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(gy).toFixed(1) + '" y2="' + Y(gy).toFixed(1) + '" class="smap-g' + (gy ? '' : ' z') + '"/><text x="' + (L - 4) + '" y="' + (Y(gy) + 3.5).toFixed(1) + '" class="smap-t" text-anchor="end">' + (gy > 0 ? "+" : "") + gy + '</text>';
    s += '<text x="' + ((L + W - R) / 2) + '" y="' + (H - 4) + '" class="smap-t" text-anchor="middle">← 52주 고점에서 먼 · 고점 대비 % · 가까운 →</text>';
    past.forEach(function(x){ s += '<circle cx="' + X(x.hi).toFixed(1) + '" cy="' + Y(x.r20).toFixed(1) + '" r="2.4" class="smap-p ' + (x.after > 0 ? "u" : x.after < 0 ? "d" : "") + '"/>'; });
    var mine = eyesOn(MAP.date);
    today.slice().sort(function(a, b){ return b.tv - a.tv; }).forEach(function(x, i){
      var rr = 3.5 + 7 * Math.sqrt(x.tv / tvMax), sel = MAP.sel === x.s, cx = X(x.hi).toFixed(1), cy = Y(x.r20).toFixed(1);
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr.toFixed(1) + '" class="smap-c' + (sel ? " on" : "") + '" style="stroke:' + GRP[x.g][2] + '" data-s="' + e(x.s) + '"/>';
      if (mine.indexOf(x.s) >= 0) s += '<text x="' + cx + '" y="' + (+cy + 4) + '" class="smap-star" text-anchor="middle">★</text>';
    });
    // 누르기 쉽게 투명 큰 점
    today.forEach(function(x){ s += '<circle cx="' + X(x.hi).toFixed(1) + '" cy="' + Y(x.r20).toFixed(1) + '" r="11" fill="transparent" data-s="' + e(x.s) + '" style="cursor:pointer"/>'; });
    return s + '<text x="' + (L + 3) + '" y="' + (T + 9) + '" class="smap-t">20일 수익 %</text></svg>';
  }
  function corners(P){
    if (P.length < 40) return "";
    var q = [[0, 0], [0, 0], [0, 0], [0, 0]];
    P.forEach(function(x){ var k = (x.hi >= -5 ? 1 : 0) + (x.r20 >= 10 ? 2 : 0); q[k][1]++; if (x.after > 0) q[k][0]++; });
    var lab = ["고점에서 멀고 · 20일 약함", "고점 가깝고 · 20일 약함", "고점에서 멀고 · 20일 강함", "고점 가깝고 · 20일 강함"];
    return '<div class="smap-q">' + [2, 3, 0, 1].map(function(k){ var n = q[k][1]; return '<div><small>' + lab[k] + '</small>' + (n >= 15 ? '<b>' + Math.round(q[k][0] / n * 100) + '%</b><em>' + q[k][0] + '/' + n + ' 오름</em>' : '<em>표본 ' + n + ' — 적음</em>') + '</div>'; }).join("") + '</div>';
  }
  function mapDraw(box){
    var Dt = MAP.data; if (!Dt) return;
    var up = Dt.past.filter(function(x){ return x.after > 0; }).length;
    var h = '<div class="smap-h"><b>🗺 한 장 지도</b><small>' + md(MAP.date) + ' ' + Dt.today.length + '종목 · 점 크기 = 거래대금 · 테두리 = 거름망' + (eyesOn(MAP.date).length ? ' · ★ = 👁 찍은 것' : '') + '</small></div>' +
      mapSvg(Dt) +
      '<div class="smap-lg">' + Object.keys(GRP).filter(function(k){ return Dt.today.some(function(x){ return x.g === k; }); }).map(function(k){ return '<span><i style="border-color:' + GRP[k][2] + '"></i>' + GRP[k][0] + ' ' + GRP[k][1] + '</span>'; }).join("") +
      (Dt.past.length ? '<span><i class="p u"></i><i class="p d"></i>지난 ' + Dt.ndays + '일 처음 걸린 날 자리 → 그 뒤 오름·내림</span>' : '') + '</div>';
    if (Dt.past.length) h += '<div class="smap-tg"><button type="button" class="' + (MAP.past ? "on" : "") + '">' + (MAP.past ? "지난 점 숨기기" : "지난 점 보기") + '</button><span>지난 ' + Dt.ndays + '일 ' + Dt.past.length + '종목 중 그 뒤 오른 것 <b>' + up + '</b> (' + Math.round(up / Dt.past.length * 100) + '%)' + (Dt.at ? ' · 종가 ' + e(Dt.at.slice(5, 10).replace("-", "/")) : '') + '</span></div>' + (MAP.past ? corners(Dt.past) : '');
    else h += '<p class="smap-n">지난 거르기 「그 뒤」 종가는 다음 전 종목 가격 갱신(새벽 5시 47분·오후 4시 20분) 뒤부터 칠해져요.</p>';
    var sx = MAP.sel && Dt.today.filter(function(x){ return x.s === MAP.sel; })[0];
    h += '<div class="smap-i">' + (sx ? GRP[sx.g][0] + ' <b>' + e(sx.n) + '</b> · 고점 ' + sg(sx.hi) + '% · 20일 ' + sg(sx.r20) + '% <a href="javascript:void 0" data-go="' + e(sx.s) + '" data-g="' + sx.g + '">카드로 ↓</a> <a href="javascript:openOP(\'' + e(sx.s).replace(/'/g, "") + '\')">종목리포트</a>' : '<span class="mut">점을 누르면 이름이 나와요</span>') + '</div>' +
      '<p class="smap-n">위치 = 걸린 날 숫자 · 지난 점 색 = 처음 걸린 날 종가 → 가장 최근 종가. 표본이 짧아 「이 자리가 오른다」는 뜻은 아니에요 — 사라는 뜻이 아니에요.</p>';
    box.innerHTML = h;
    [].forEach.call(box.querySelectorAll("[data-s]"), function(c){ c.addEventListener("click", function(ev){ ev.stopPropagation(); MAP.sel = c.getAttribute("data-s"); mapDraw(box); }); });
    var tg = box.querySelector(".smap-tg button"); if (tg) tg.onclick = function(){ MAP.past = !MAP.past; mapDraw(box); };
    var go = box.querySelector("[data-go]"); if (go) go.onclick = function(){
      var s = go.getAttribute("data-go"), g = go.getAttribute("data-g"), btn = document.querySelector('#scrk button[data-k="' + g + '"]');
      if (btn && !btn.classList.contains("on")) btn.click();
      setTimeout(function(){ var a = [].filter.call(document.querySelectorAll("#main .list .st .nm a"), function(x){ return (x.getAttribute("href") || "").indexOf("'" + s + "'") >= 0; })[0];
        if (a){ var st = a.closest(".st"); st.scrollIntoView({behavior: "smooth", block: "center"}); st.classList.add("smap-fl"); setTimeout(function(){ st.classList.remove("smap-fl"); }, 1800); } }, 120);
    };
  }
  function mapMount(){
    var k = document.getElementById("scrk"); if (!k) return;
    var root = k.parentNode, date = curScrDate(); if (!date) return;
    var box = root.querySelector(".smap");
    if (box && box.dataset.d === date){ if (!box.firstChild && MAP.data && MAP.date === date) mapDraw(box); return; }
    if (!box){ box = document.createElement("div"); box.className = "smap"; var eye = root.querySelector("#eyesum"); root.insertBefore(box, eye ? eye.nextSibling : k); }
    box.dataset.d = date;
    if (MAP.data && MAP.date === date){ mapDraw(box); return; }
    box.innerHTML = '<div class="smap-h"><b>🗺 한 장 지도</b><small>불러오는 중…</small></div>';
    MAP.date = date; MAP.sel = null;
    mapData(date).then(function(Dt){ if (MAP.date !== date) return; MAP.data = Dt; var b2 = document.querySelector(".smap"); if (b2 && b2.dataset.d === date) mapDraw(b2); });
  }

  /* ═════════ 붙이기 ═════════ */
  var T = null;
  function tick(){ T = null; try { memoMount(); } catch(x) { console.error(x); } try { decompMount(); } catch(x) { console.error(x); } try { mapMount(); } catch(x) { console.error(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 250); }
  var css = document.createElement("style");
  css.textContent =
    ".mfh{margin:10px 0 0;padding:10px 12px;border-radius:12px;background:var(--panel2)}.mfh-h{font-weight:800;font-size:14.5px}.mfh-h small{font-weight:400;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    ".mfh-q{font-size:12.5px;margin:5px 0 6px;word-break:keep-all}.mfh-x{color:var(--sub);font-size:12.5px}.mfh-bar{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1px;background:var(--line)}" +
    ".mfh-bar .a{background:#3fb950}.mfh-bar .b{background:#ff6b6b}.mfh-bar .c{background:#6b7385}" +
    ".mfh-k{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0 4px}.mfh-k>div{background:var(--panel);border-radius:10px;padding:6px 4px;text-align:center}.mfh-k small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".mfh-k b{display:block;font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}.mfh-k b.g{color:#3fb950}.mfh-k b.r{color:#ff6b6b}" +
    ".mfh-l{font-size:12.5px;margin:4px 0 6px;word-break:keep-all}.mfh-s{display:flex;align-items:center;gap:8px;font-size:12.5px;margin:4px 0}.mfh-s span{flex:none;width:108px;white-space:nowrap}.mfh-s input{flex:1;min-width:0}" +
    ".mfh-c{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 2px}.mfh-c button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".mfh-c button.on{background:#f4a261;border-color:#f4a261;color:#111;font-weight:700}.mfh-n{font-size:12.5px;color:var(--sub);margin:6px 0 0;word-break:keep-all}" +
    ".dcp{margin:10px 0 2px;padding:10px 12px;border-radius:12px;background:var(--panel2)}.dcp-h{font-weight:800;font-size:14px}.dcp-h small{font-weight:400;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    ".dcp-svg{display:block;width:100%;height:auto;margin:6px 0 2px}.dcp-z{stroke:var(--sub);stroke-width:1;stroke-dasharray:2 2}.dcp-k{stroke:var(--sub);stroke-width:1}" +
    ".dcp-l{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:12.5px}.dcp-l span{white-space:nowrap}.dcp-l i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".dcp-t{font-size:12.5px;margin:6px 0 0;word-break:keep-all}.dcp-n{font-size:12.5px;color:var(--sub);margin:5px 0 0;word-break:keep-all}" +
    ".dcp-nw{margin:8px 0 0;padding-top:7px;border-top:1px solid var(--line)}.dcp-nw small{display:block;font-size:12.5px;color:var(--sub);margin-bottom:3px}" +
    ".dcp-nw a{display:block;font-size:12.5px;padding:4px 0;color:var(--text);text-decoration:none;word-break:keep-all}.dcp-nw a em{font-style:normal;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    ".smap{margin:0 0 10px;padding:10px 12px;border-radius:14px;background:var(--panel)}.smap-h b{font-size:15px}.smap-h small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".smap-svg{display:block;width:100%;height:auto;margin:6px 0 4px;touch-action:manipulation}.smap-g{stroke:var(--line);stroke-width:1}.smap-g.z{stroke:var(--sub);stroke-dasharray:3 3}" +
    ".smap-t{fill:var(--sub);font-size:9.5px}.smap-p{fill:#6b7385;opacity:.55}.smap-p.u{fill:var(--up)}.smap-p.d{fill:var(--down)}" +
    ".smap-c{fill:color-mix(in srgb,var(--panel) 55%,transparent);stroke-width:2}.smap-c.on{stroke-width:3.5;fill:color-mix(in srgb,var(--text) 18%,transparent)}.smap-star{font-size:10px;fill:#ffd166;pointer-events:none}" +
    ".smap-lg{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:12.5px;color:var(--sub)}.smap-lg i{display:inline-block;width:9px;height:9px;border-radius:50%;border:2px solid;margin-right:4px;vertical-align:-1px}" +
    ".smap-lg i.p{border:0;width:6px;height:6px;margin-right:2px}.smap-lg i.p.u{background:var(--up)}.smap-lg i.p.d{background:var(--down);margin-right:4px}" +
    ".smap-tg{display:flex;align-items:center;gap:8px;font-size:12.5px;margin:8px 0 0;word-break:keep-all}.smap-tg button{flex:none;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".smap-q{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0 0}.smap-q>div{background:var(--panel2);border-radius:9px;padding:5px 8px}.smap-q small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".smap-q b{font-size:16px;margin-right:5px;font-variant-numeric:tabular-nums}.smap-q em{font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".smap-i{font-size:12.5px;margin:8px 0 0;min-height:18px;word-break:keep-all}.smap-i a{margin-left:6px;font-weight:700}.smap-n{font-size:12.5px;color:var(--sub);margin:6px 0 0;word-break:keep-all}" +
    ".smap-fl{outline:2px solid #f4a261;outline-offset:2px;transition:outline-color 1.5s}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
__bk(56);
/* ======== voices.js ======== */
/* 🗣 목소리 경주 — 10/27 A10/27-1 (사용자 「1번만 하자」)
   「누구 말을 따랐어야 했나」: 앱 안 목소리마다 「처음 부른 날 종가에 같은 돈을 넣고 지금까지 들고 있었다면」 곡선을
   💼 포트 탭(🏁 시장 비교 바로 밑)에서 🙋 내 포트·코스피·S&P500 선과 한 그림으로.
   목소리: 📣 피드 채널 11곳 · 🔎 아침 거르기 거름망 4종 · ⚡ 킥이 고른 종목 (자료: market-strategy-report feeds/voices_race.json —
           src/voices_race.py · 평일 07:25·16:10, feed-score 작업 뒤) + 👁 내 눈(휴대폰 eyeScr — 같은 규칙으로 여기서 계산, 종가는 그 파일의 px 표)
   규칙: 한 종목은 처음 부른 날 한 번만 삼 · 판 적 없음 · 부를 때마다 같은 돈 → 넣은 돈 대비 % · 그림자 = 같은 날 같은 돈을 그 나라 지수에(지수 대비 %p)
         · 각 나라 돈(환율 뺌) · 포트·지수 선은 시작일에 한 번 넣고 그대로(포트는 포트 탭과 같은 달러 기준)
   원칙: 언급 = 추천 아님(「팔아라」 글도 「부른 날 샀다면」으로 셈) · 숫자를 지어내지 않음 · 종목 5개 밑 목소리는 순위에서 뺌 · 사라·팔라는 말 없음. */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  var BEN = {KR: "^KS11", US: "^GSPC", JP: "^N225", HK: "^HSI", CN: "000001.SS"};
  var PAL = ["#f4a261", "#7ee0b5", "#9b7cff", "#5ac8fa", "#ffd166", "#ff8fc7", "#b9e769", "#3dd6c6"];
  var MINN = 5;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function kn(c){ c = String(c || ""); return /^\d{6}\.K[SQ]$/.test(c) ? c.slice(0, 6) : c; }
  function mkOf(s){ return /\.K[SQ]$/.test(s) || /^\d{6}$/.test(s) ? "KR" : /\.T$/.test(s) ? "JP" : /\.HK$/.test(s) ? "HK" : /\.(SS|SZ)$/.test(s) ? "CN" : "US"; }

  var ST = {p: null, D: null, sort: ls("vrSort") === "ex" ? "ex" : "ret", sel: {}, open: null};
  function load(){
    if (!ST.p) ST.p = getJSON(RAWM + "feeds/voices_race.json?h=" + Math.floor(Date.now() / 1800e3), {ttl: 1800e3})
      .then(function(D){ return D && D.dates && D.voices ? D : null; }).catch(function(){ return null; });
    return ST.p;
  }

  /* ── 👁 내 눈: 휴대폰 기록(eyeScr)으로 같은 규칙 ── */
  function firstIdx(arr, cal, d){ if (!arr) return -1; for (var j = 0; j < cal.length; j++) if (cal[j] >= d && arr[j] != null) return j; return -1; }
  function ffill(arr){ var o = [], l = null; for (var j = 0; j < arr.length; j++){ if (arr[j] != null) l = arr[j]; o.push(l); } return o; }
  function eyeVoice(D){
    var E = ls("eyeScr"); if (!E || typeof E !== "object") return null;
    var first = {}; Object.keys(E).sort().forEach(function(d){ (E[d] || []).forEach(function(s){ if (!(s in first)) first[s] = d; }); });
    var cal = D.dates, X = D.px || {}, C = X.c || {}, M = X.meta || {}, B = X.bench || {}, pos = [], miss = 0, FF = {};
    var ff = function(k, a){ if (!FF[k]) FF[k] = ffill(a || []); return FF[k]; };
    Object.keys(first).forEach(function(s0){
      var s = C[s0] ? s0 : C[s0 + ".KS"] ? s0 + ".KS" : C[s0 + ".KQ"] ? s0 + ".KQ" : null;
      if (!s){ miss++; return; }
      var i = firstIdx(C[s], cal, first[s0]); if (i < 0){ miss++; return; }
      var mk = (M[s] || [])[1] || mkOf(s), b = BEN[mk] || "^GSPC", bi = firstIdx(B[b], cal, cal[i]);
      if (bi < 0){ miss++; return; }
      pos.push({s: s, n: (M[s] || [])[0] || s, ei: i, px: C[s][i], b: b, bpx: B[b][bi], mk: mk});
    });
    if (!pos.length) return {k: "eye", empty: true, n: 0, miss: miss};
    var curve = [], shadow = null;
    for (var j = 0; j < cal.length; j++){
      var rs = 0, bs = 0, n = 0;
      pos.forEach(function(p){ if (p.ei > j) return; var c = ff(p.s, C[p.s])[j], bc = ff(p.b, B[p.b])[j]; if (c == null || bc == null) return; rs += c / p.px - 1; bs += bc / p.bpx - 1; n++; });
      curve.push(n ? Math.round(rs / n * 10000) / 100 : null);
      if (j === cal.length - 1) shadow = n ? Math.round(bs / n * 10000) / 100 : null;
    }
    var picks = pos.map(function(p){ var c = ff(p.s, C[p.s])[cal.length - 1]; return [p.s, p.n, cal[p.ei], c ? Math.round((c / p.px - 1) * 1000) / 10 : null, p.mk]; })
      .sort(function(a, b){ return (b[3] == null ? -1e9 : b[3]) - (a[3] == null ? -1e9 : a[3]); });
    var r = curve[curve.length - 1];
    return {k: "eye", name: "내 눈 (👁 찍은 것)", ic: "👁", kind: "eye", n: pos.length, miss: miss, first: cal[Math.min.apply(null, pos.map(function(p){ return p.ei; }))],
      ret: r, shadow: shadow, ex: r != null && shadow != null ? Math.round((r - shadow) * 100) / 100 : null,
      up: picks.filter(function(x){ return x[3] > 0; }).length, curve: curve, picks: picks};
  }

  /* ── 포트·지수 선(시작일에 넣고 그대로) ── */
  function portLine(cal, start, pd, L){
    if (!pd || !L) return null;
    var at = function(d){ var v = null; for (var i = 0; i < pd.length && pd[i] <= d; i++) if (L[i] != null) v = L[i]; return v; };
    var v0 = at(start); if (v0 == null) return null;
    return cal.map(function(d){ var v = at(d); return v == null ? null : Math.round(((1 + v / 100) / (1 + v0 / 100) - 1) * 10000) / 100; });
  }
  function refs(D){
    var out = [], PL = window.__poLines || {}, mine = portLine(D.dates, D.start, PL.dates, PL.mine), base = portLine(D.dates, D.start, PL.dates, PL.base);
    if (mine) out.push({k: "ref:mine", ic: "🙋", name: PL.mineName || "내 포트", line: mine, col: "#f472b6", w: 3, dash: ""});
    else if (base) out.push({k: "ref:base", ic: "💼", name: "기본 포트", line: base, col: "#e9c46a", w: 3, dash: ""});
    var Ls = D.lines || {};
    if (Ls["코스피"]) out.push({k: "ref:kospi", ic: "🇰🇷", name: "코스피", line: Ls["코스피"], col: "#8a94a8", w: 1.6, dash: "5 4"});
    if (Ls["S&P500"]) out.push({k: "ref:spx", ic: "🇺🇸", name: "S&P500", line: Ls["S&P500"], col: "#c9d1e0", w: 1.6, dash: "2 3"});
    out.forEach(function(r){ var z = r.line.filter(function(v){ return v != null; }); r.ret = z.length ? z[z.length - 1] : null; });
    return out;
  }
  function last(a){ for (var i = a.length - 1; i >= 0; i--) if (a[i] != null) return a[i]; return null; }

  /* ── 그리기 ── */
  function svg(cal, lines){
    var W = 340, H = 196, L = 34, R = 8, T = 10, Bm = 22, all = [0];
    lines.forEach(function(l){ l.line.forEach(function(v){ if (v != null) all.push(v); }); });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = Math.max(0.5, (hi - lo) * 0.08); lo -= pad; hi += pad;
    var n = cal.length, X = function(i){ return L + (n > 1 ? i / (n - 1) : 0) * (W - L - R); }, Y = function(v){ return T + (hi - v) / (hi - lo) * (H - T - Bm); };
    var step = Math.pow(10, Math.floor(Math.log10((hi - lo) / 3 || 1))), tick = [1, 2, 5, 10].map(function(m){ return m * step; }).filter(function(t){ return (hi - lo) / t <= 5; })[0] || step * 10;
    var s = '<svg class="vr-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="목소리별 같은 돈 곡선">';
    for (var t = Math.ceil(lo / tick) * tick; t <= hi; t += tick){ var y = Y(t).toFixed(1);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="vr-g' + (Math.abs(t) < 1e-9 ? ' z' : '') + '"/><text x="' + (L - 4) + '" y="' + (+y + 3) + '" text-anchor="end" class="vr-t">' + (t > 0 ? "+" : t < 0 ? "−" : "") + Math.abs(+t.toFixed(4)) + '%</text>'; }
    s += '<text x="' + L + '" y="' + (H - 6) + '" class="vr-t">' + md(cal[0]) + '</text><text x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end" class="vr-t">' + md(cal[n - 1]) + '</text>';
    lines.forEach(function(l){
      var d = "", pen = false;
      l.line.forEach(function(v, i){ if (v == null){ pen = false; return; } d += (pen ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); pen = true; });
      if (!d) return;
      s += '<path d="' + d + '" fill="none" stroke="' + l.col + '" stroke-width="' + (l.w || 2) + '"' + (l.dash ? ' stroke-dasharray="' + l.dash + '"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>';
      var li = -1; for (var i = l.line.length - 1; i >= 0; i--) if (l.line[i] != null){ li = i; break; }
      if (li >= 0) s += '<circle cx="' + X(li).toFixed(1) + '" cy="' + Y(l.line[li]).toFixed(1) + '" r="2.8" fill="' + l.col + '"/>';
    });
    return s + '</svg>';
  }

  function draw(el){
    var D = ST.D, cal = D.dates;
    var VS = D.voices.slice(), eye = eyeVoice(D);
    if (eye && !eye.empty) VS.push(eye);
    var key = ST.sort === "ex" ? "ex" : "ret", val = function(v){ return v[key] == null ? -1e9 : v[key]; };
    var big = VS.filter(function(v){ return v.n >= MINN && v.ret != null; }).sort(function(a, b){ return val(b) - val(a); });
    var small = VS.filter(function(v){ return !(v.n >= MINN && v.ret != null); });
    big.forEach(function(v, i){ v.col = v.col || PAL[i % PAL.length]; });
    var RF = refs(D);
    var shown = big.filter(function(v, i){ return i < 3 || ST.sel[v.k]; });
    if (eye && !eye.empty && eye.n >= MINN && shown.indexOf(eye) < 0) shown.push(eye);
    var lines = shown.map(function(v){ return {line: v.curve, col: v.col, w: v.k === "eye" ? 2.6 : 2}; }).concat(RF.map(function(r){ return {line: r.line, col: r.col, w: r.w, dash: r.dash}; }));
    var top = big[0], wk = Math.max(1, Math.round((new Date(cal[cal.length - 1]) - new Date(D.start)) / 864e5 / 7));
    var head = '<div class="vr-hd">' + (top ? '🥇 <b>' + e(top.ic + " " + top.name) + '</b> <b class="' + cl(top[key]) + '">' + sg(top[key]) + (key === "ex" ? '%p' : '%') + '</b>' : '') +
      RF.map(function(r){ return ' · ' + r.ic + ' ' + e(r.name) + ' <b class="' + cl(r.ret) + '">' + sg(r.ret) + '%</b>'; }).join("") + '</div>' +
      '<div class="vr-sub">' + md(D.start) + '부터 ' + wk + '주째 · 부를 때마다 같은 돈 · 넣은 돈 대비 · ' + md(cal[cal.length - 1]) + ' 종가까지</div>';
    var chips = '<div class="vr-ch"><button type="button" data-vrs="ret" class="' + (key === "ret" ? "on" : "") + '">💰 그냥 수익률</button><button type="button" data-vrs="ex" class="' + (key === "ex" ? "on" : "") + '">🏳 지수 대비</button></div>';
    var lg = '<div class="vr-lg">' + shown.map(function(v){ return '<span><i style="background:' + v.col + '"></i>' + e(v.ic + " " + v.name) + '</span>'; }).join("") +
      RF.map(function(r){ return '<span><i class="ln" style="border-color:' + r.col + (r.dash ? ';border-top-style:dashed' : '') + '"></i>' + e(r.ic + " " + r.name) + '</span>'; }).join("") + '</div>';
    var tag = function(v){ return v.kind === "ch" ? "피드 채널" : v.kind === "scr" ? "아침 거르기" : v.kind === "kick" ? "킥" : v.kind === "eye" ? "휴대폰 기록" : ""; };
    var row = function(v, i){
      var on = shown.indexOf(v) >= 0, op = ST.open === v.k;
      var h = '<div class="vr-r' + (on ? " on" : "") + (op ? " op" : "") + (v.k === "eye" ? " me" : "") + '" data-vrk="' + e(v.k) + '"><span class="no">' + (i + 1) + '</span>' +
        '<span class="nm"><i style="background:' + (on ? v.col : "transparent") + ';border-color:' + v.col + '"></i><b>' + e(v.ic + " " + v.name) + '</b><small>' + tag(v) + ' · 종목 ' + v.n + '개 중 ' + v.up + '개 오름' + (v.first > D.start ? ' · ' + md(v.first) + '부터' : '') + '</small></span>' +
        '<span class="v"><b class="' + cl(v.ret) + '">' + sg(v.ret) + '%</b><small class="' + cl(v.ex) + '">지수 대비 ' + sg(v.ex) + '%p</small></span></div>';
      if (op){
        var P = v.picks || [], top = P.slice(0, 4), bot = P.length > 7 ? P.slice(-3) : P.slice(4);
        var pk = function(x){ return '<a href="javascript:void 0" data-vrop="' + e(kn(x[0])) + '">' + e(x[1]) + ' <em>' + md(x[2]) + '</em> <b class="' + cl(x[3]) + '">' + sg(x[3], 1) + '%</b></a>'; };
        h += '<div class="vr-pk"><small>가장 많이 오른 것</small>' + top.map(pk).join("") + (bot.length ? '<small>가장 많이 내린 것</small>' + bot.map(pk).join("") : '') +
          '<small class="vr-pn">날짜 = 처음 부른 뒤 산 날 · 그 뒤 ' + md(cal[cal.length - 1]) + ' 종가까지' + (v.miss ? ' · 시세 없는 ' + v.miss + '개 뺌' : '') + '</small></div>';
      }
      return h;
    };
    var eyeHint = !eye ? '<div class="vr-eh">👁 아침 거르기에서 「볼 만함」을 누르면 <b>내 눈</b>도 여기서 같이 달려요.</div>' :
      eye.empty ? '<div class="vr-eh">👁 찍은 종목의 시세를 아직 못 찾았어요(다음 갱신 뒤).</div>' :
      eye.n < MINN ? '<div class="vr-eh">👁 내 눈: 찍은 종목 ' + eye.n + '개 <b class="' + cl(eye.ret) + '">' + sg(eye.ret) + '%</b> — 5개부터 순위에 들어가요.</div>' : '';
    el.innerHTML = head + chips + svg(cal, lines) + lg +
      '<div class="vr-l">' + big.map(function(v, i){ return ST.all || i < 8 || ST.open === v.k || v.k === "eye" ? row(v, i) : ""; }).join("") + '</div>' +
      (big.length > 8 ? '<button type="button" class="vr-more" data-vrall="1">' + (ST.all ? '접기 ▴' : '＋' + (big.length - 8) + '곳 더 보기 ▾') + '</button>' : '') + eyeHint +
      (small.length ? '<div class="vr-sm">종목 5개 밑이라 순위에서 뺌: ' + small.filter(function(v){ return v.k !== "eye"; }).map(function(v){ return e(v.ic + " " + v.name) + ' ' + v.n + '개 ' + sg(v.ret) + '%'; }).join(" · ") + '</div>' : '') +
      '<p class="vr-n">줄을 누르면 그래프에 넣고 빼고, 그 목소리가 부른 종목이 열려요. 목소리 = 종목을 <b>처음 부른 날 종가에 같은 돈</b>을 넣고 판 적 없이 들고 있었다면(같은 종목은 한 번만 · 한국은 15:30 넘은 글이면 다음 날 종가). ' +
      '「지수 대비」 = 같은 날 같은 돈을 그 나라 지수에 넣은 것과의 차이. 각 나라 돈 기준(환율 뺌). 포트·지수 선은 ' + md(D.start) + '에 한 번 넣고 그대로(포트는 포트 탭과 같은 달러 기준). ' +
      '<b>언급 = 추천 아님</b> — 「팔아라」 글도 「부른 날 샀다면」으로 셈. 과거 계산 · 참고용.</p>';
  }

  function mount(){
    var el = document.getElementById("vrace"); if (!el) return;
    if (el.offsetParent === null) return;          // 접힌 칸 안 — 펼칠 때 받기
    if (el.dataset.on) return; el.dataset.on = "1";
    load().then(function(D){
      var el2 = document.getElementById("vrace"); if (!el2) return;
      if (!D){ el2.innerHTML = '<small class="mut">경주 자료 준비 중 — 평일 07:25·16:10 갱신 뒤 보여요.</small>'; return; }
      ST.D = D; draw(el2);
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target;
    var s = t.closest && t.closest("[data-vrs]");
    if (s){ ST.sort = s.getAttribute("data-vrs"); ls("vrSort", ST.sort); var el = document.getElementById("vrace"); if (el && ST.D) draw(el); return; }
    if (t.closest && t.closest("[data-vrall]")){ ST.all = !ST.all; var ea = document.getElementById("vrace"); if (ea && ST.D) draw(ea); return; }
    var o = t.closest && t.closest("[data-vrop]");
    if (o){ ev.preventDefault(); ev.stopPropagation(); if (window.openOP) openOP(o.getAttribute("data-vrop")); return; }
    var r = t.closest && t.closest("[data-vrk]");
    if (r){ var k = r.getAttribute("data-vrk"); ST.sel[k] = !ST.sel[k]; ST.open = ST.open === k ? null : k;
      var el3 = document.getElementById("vrace"); if (el3 && ST.D) draw(el3); return; }
    soon();                                          // 접힌 칸을 펼쳤을 수 있음
  }, true);

  var T = null;
  function tick(){ T = null; try { mount(); } catch(x) { console.error(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 250); }
  var css = document.createElement("style");
  css.textContent =
    ".vr-w{min-height:40px}.vr-hd{font-size:13.5px;line-height:1.55;word-break:keep-all}.vr-hd b.up{color:var(--up)}.vr-hd b.dn{color:var(--down)}" +
    ".vr-sub{font-size:12.5px;color:var(--sub);margin:2px 0 6px;word-break:keep-all}" +
    ".vr-ch{display:flex;gap:6px;margin:4px 0 2px}.vr-ch button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:4px 11px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".vr-ch button.on{background:var(--acc);border-color:var(--acc);color:#0b0f17;font-weight:700}" +
    ".vr-svg{display:block;width:100%;height:auto;margin:6px 0 2px}.vr-g{stroke:var(--line);stroke-width:1}.vr-g.z{stroke:var(--sub);stroke-dasharray:3 3}.vr-t{fill:var(--sub);font-size:9.5px}" +
    ".vr-lg{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:12.5px;margin:0 0 6px}.vr-lg span{white-space:nowrap}.vr-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".vr-lg i.ln{width:14px;height:0;border-radius:0;border-top:2px solid;vertical-align:3px;background:none}" +
    ".vr-l{border-top:1px solid var(--line)}.vr-r{display:grid;grid-template-columns:20px 1fr auto;gap:6px;align-items:center;padding:7px 2px;border-bottom:1px solid var(--line);cursor:pointer}" +
    ".vr-r .no{font-size:12.5px;color:var(--sub);text-align:center}.vr-r .nm{min-width:0}.vr-r .nm i{display:inline-block;width:9px;height:9px;border-radius:50%;border:2px solid;margin-right:5px;vertical-align:-1px}" +
    ".vr-r .nm b{font-size:13.5px;word-break:keep-all}.vr-r .nm small{display:block;font-size:12.5px;color:var(--sub);word-break:keep-all}" +
    ".vr-r .v{text-align:right}.vr-r .v b{display:block;font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.vr-r .v small{display:block;font-size:12.5px;white-space:nowrap;color:var(--sub)}" +
    ".vr-r .v b.up,.vr-r .v small.up{color:var(--up)}.vr-r .v b.dn,.vr-r .v small.dn{color:var(--down)}.vr-r.me{background:color-mix(in srgb,#ffd166 10%,transparent)}.vr-r.op{border-bottom:0}" +
    ".vr-pk{padding:2px 4px 8px 28px;border-bottom:1px solid var(--line)}.vr-pk small{display:block;font-size:12.5px;color:var(--sub);margin:6px 0 2px}.vr-pk small.vr-pn{margin-top:6px;word-break:keep-all}" +
    ".vr-pk a{display:flex;gap:6px;align-items:baseline;font-size:12.5px;padding:3px 0;color:var(--text);text-decoration:none}.vr-pk a em{font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".vr-pk a b{margin-left:auto;font-variant-numeric:tabular-nums}.vr-pk a b.up{color:var(--up)}.vr-pk a b.dn{color:var(--down)}" +
    ".vr-eh{font-size:12.5px;margin:8px 0 0;padding:7px 9px;border-radius:9px;background:var(--panel2);word-break:keep-all}.vr-eh b.up{color:var(--up)}.vr-eh b.dn{color:var(--down)}" +
    ".vr-more{display:block;width:100%;margin:6px 0 0;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".vr-sm{font-size:12.5px;color:var(--sub);margin:8px 0 0;word-break:keep-all}.vr-n{font-size:12.5px;color:var(--sub);margin:8px 0 0;line-height:1.5;word-break:keep-all}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
  window.__voices = {eyeVoice: eyeVoice, portLine: portLine, state: ST};   // 검사용
})();
;
__bk(57);
/* ======== ux1104.js ======== */
/* 11/04 사용자 「둘 다 진행해」 — 📱 앱 아이디어 A11/4-1 · A11/4-2
   ① 🪜 금 가는 순서표 (A11/4-1) — 💼 포트 탭 🎛 설계기 위: 코스피200이 지금보다 더 빠지면 내 돈에서 「무엇이 먼저 깨지나」를 순서대로.
      📌 내 ELS(관제탑) 다음 평가 배리어·KI · 📦 담아 둔 펀드 −10% · 💼 설계기 포트 −10%·2008년 뒤 가장 깊은 낙폭 · 📝 제안서 주식·연금 폼 −10%.
      「같이 움직이는 크기」= 최근 1년 주간(5거래일) 등락으로 잰 코스피200 대비 비율(β) — 대략. 지금 위치는 KODEX200 10분 시세(live_px).
      막대를 끌면 그 깊이에서 깨진 것·대략 손실이 바로 바뀜.
   ② 🔢 숫자로 찾기 (A11/4-2) — 머리 🔍 에 「5%」「3년」「1000만원」「1년 +10%」를 치면 종목 대신 상품:
      채권(세전 매수금리) · ELS(조건 맞으면 연 쿠폰 · 청약 중) · 펀드(지난 1년) 를 위험 낮은 순으로 한 줄씩 → 「📲 크게 보기」 한 장 → 📨 그림으로 보내기.
      「1000만원」 → ⚖️ 세 갈래 길(💼 주문서 투자금과 같은 칸) · 「1년 +10%」 → 📝 주식·연금 폼 중 과거 1년 +10% 넘긴 비율 순.
   원칙: 과거 계산 · 미래 보장 아님 · 사라·팔라는 말 없음 · 숫자를 지어내지 않음(자료 없으면 「자료 없음」) · 사모(pv) 빼기. */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function pc(v, d){ return v == null || isNaN(v) ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function s2day(s){ return Date.parse(String(s).slice(0, 10) + "T00:00:00Z") / 864e5; }
  function day2s(t){ return new Date(t * 864e5).toISOString().slice(0, 10); }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function won(v){ var m = v / 1e4, a = Math.abs(m); return a >= 1e4 ? (m / 1e4).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "억" : Math.round(m).toLocaleString() + "만"; }
  function amt(){ try { var a = +(JSON.parse(localStorage.getItem("portSet") || "{}").amt); return a > 0 ? a : 1e7; } catch(x) { return 1e7; } }
  function ls(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(x) { return null; } }
  function J(u, t){ t = t || 600000; return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / t), {ttl: t}).catch(function(){ return null; }); }
  function stop(el){ el.addEventListener("click", function(ev){ ev.stopPropagation(); }); }

  /* ════════════ 공통: 날짜 맞추기 · 같이 움직이는 크기(β) ════════════ */
  function join(a, b){   // a, b: {d:[day], c:[close]} → 둘 다 있는 날
    var m = {}, D = [], A = [], B = []; for (var i = 0; i < b.d.length; i++) m[b.d[i]] = b.c[i];
    for (var j = 0; j < a.d.length; j++){ var v = m[a.d[j]]; if (v != null && a.c[j] > 0 && v > 0){ D.push(a.d[j]); A.push(a.c[j]); B.push(v); } }
    return {d: D, a: A, b: B};
  }
  // 최근 1년(약 260거래일) 겹치지 않는 5거래일 등락으로 β = cov(x, k) / var(k) · 끝에서부터 거꾸로 묶음
  function beta5(x, k){
    var n = x.length, rx = [], rk = [];
    for (var i = n - 1; i - 5 >= 0 && n - 1 - i < 260; i -= 5){ rx.push(x[i] / x[i - 5] - 1); rk.push(k[i] / k[i - 5] - 1); }
    var N = rx.length; if (N < 30) return null;
    var mx = 0, mk = 0; for (var j = 0; j < N; j++){ mx += rx[j]; mk += rk[j]; } mx /= N; mk /= N;
    var c = 0, v = 0, vx = 0; for (var q = 0; q < N; q++){ c += (rx[q] - mx) * (rk[q] - mk); v += (rk[q] - mk) * (rk[q] - mk); vx += (rx[q] - mx) * (rx[q] - mx); }
    return v > 0 ? {b: c / v, r: vx > 0 ? c / Math.sqrt(v * vx) : 0, n: N} : null;
  }
  var LABU = {"KOSPI200": "코스피200", "S&P500": "S&P500", "EUROSTOXX50": "유로스탁스50", "NIKKEI225": "니케이225", "HSCEI": "항셍중국(H)", "NASDAQ100": "나스닥100"};
  function lab(n){ return LABU[n] || n; }

  /* ── 코스피200 기준선: 일봉(KODEX200 · els_px) + 지금(live_px 069500 10분 시세) ── */
  var KB = null, KBT = 0;
  function kbase(){
    if (KB && Date.now() - KBT < 300000) return KB;
    var EM = window.__elsMy; if (!EM) return Promise.resolve(null);
    KBT = Date.now();
    KB = EM.load().then(function(){ return Promise.all([EM.epx("KOSPI200"), J("archive/x/live_px.json", 300000), J("archive/x/els_px/index.json", 3600e3)]); }).then(function(r){
      var s = r[0]; if (!s || s.d.length < 300) return null;
      var d = Array.prototype.slice.call(s.d), c = Array.prototype.slice.call(s.c), lv = r[1], td = today(), tdd = s2day(td), live = null;
      var q = lv && lv.q && lv.q["069500"];
      if (lv && lv.date === td && q && q[0] > 0){
        if (d[d.length - 1] === tdd){ d.pop(); c.pop(); }   // 아침에 받아 둔 오늘 값은 버리고 지금 값으로
        d.push(tdd); c.push(+q[0]); live = {t: lv.t, chg: +q[1]};
      }
      var n = c.length, hi = 0, hiAt = n - 1; for (var i = Math.max(0, n - 20); i < n; i++) if (c[i] > hi){ hi = c[i]; hiAt = i; }
      var chg = live ? live.chg : (c[n - 1] / c[n - 2] - 1) * 100;
      return {d: d, c: c, now: c[n - 1], at: day2s(d[n - 1]), live: live, chg: chg, hi: hi, hiAt: day2s(d[hiAt]), dd: (c[n - 1] / hi - 1) * 100, idx: r[2], lvq: lv && lv.date === td ? lv.q : null};
    }).catch(function(x){ console.warn(x); return null; });
    return KB;
  }
  var BC = {};
  function betaOf(name, K, dn){   // ELS 기초자산 일봉(els_px) 기준 · dn = 기준 시장 이름
    if (name === dn) return Promise.resolve({b: 1, r: 1, n: 0});
    var key = dn + "|" + name; if (BC[key]) return BC[key];
    BC[key] = window.__elsMy.epx(name).then(function(s){ if (!s) return null; var j = join(s, K); return beta5(j.a, j.b); }).catch(function(){ return null; });
    return BC[key];
  }
  // 기준 시장: 🇰🇷 코스피200(지금 = KODEX200 10분 시세) · 🇺🇸 S&P500(마지막 종가)
  var DRV = {KOSPI200: {ic: "🇰🇷", nm: "코스피200", sh: "코스피"}, "S&P500": {ic: "🇺🇸", nm: "S&P500", sh: "S&P"}};
  function drvName(){ var v = null; try { v = localStorage.getItem("ldDrv"); } catch(x) {} return DRV[v] ? v : "KOSPI200"; }
  function dbase(dn){
    if (dn === "KOSPI200") return kbase();
    return kbase().then(function(K0){ return window.__elsMy.epx(dn).then(function(s){
      if (!s || s.d.length < 300) return null;
      var d = Array.prototype.slice.call(s.d), c = Array.prototype.slice.call(s.c), n = c.length, hi = 0, hiAt = n - 1;
      for (var i = Math.max(0, n - 20); i < n; i++) if (c[i] > hi){ hi = c[i]; hiAt = i; }
      return {d: d, c: c, now: c[n - 1], at: day2s(d[n - 1]), live: null, chg: (c[n - 1] / c[n - 2] - 1) * 100, hi: hi, hiAt: day2s(d[hiAt]), dd: (c[n - 1] / hi - 1) * 100, idx: K0 && K0.idx, lvq: K0 && K0.lvq, k200: K0};
    }); });
  }

  /* ════════════ ① 🪜 금 가는 순서표 ════════════ */
  var FT = {"주식형": 1, "주식혼합형": 0.5, "채권혼합형": 0.3};
  var FREG = [[/중국/, "HSCEI"], [/일본/, "NIKKEI225"], [/유럽/, "EUROSTOXX50"], [/정보기술|나스닥|기술/, "NASDAQ100"], [/북미|미국|글로벌주식|글로벌 공격|헬스케어|에너지|섹터|테마/, "S&P500"]];
  var LD = {busy: 0, sig: "", R: null, m: 0};
  var MAX = -30;
  function myEls(){ var a = ls("elsmy"); return Array.isArray(a) ? a : []; }
  function myFunds(){ var a = ls("xrFunds"); return Array.isArray(a) ? a : []; }

  function fundBeta(f, P, FH, K, dn){   // 돌려줌 {b, how} · {zero} · {na: 이유}
    if (!P) return Promise.resolve({na: "펀드 자료 없음"});
    var t = P.t || "", st = P.st || "";
    if (/채권형|MMF/.test(t) && !/혼합/.test(t)) return Promise.resolve({zero: 1, how: t});
    if (/^해외/.test(t)){
      if (!/주식/.test(t)) return Promise.resolve({na: t + " — 지수로 셀 수 없음"});
      var reg = FREG.filter(function(x){ return x[0].test(st); })[0]; if (!reg) return Promise.resolve({na: st + " — 비교할 지수 자료 없음"});
      var k = /혼합/.test(t) ? 0.5 : 1;
      return betaOf(reg[1], K, dn).then(function(B){ return B ? {b: B.b * k, how: lab(reg[1]) + "처럼" + (k < 1 ? " × 주식 몫 ½" : "")} : {na: "지수 자료 없음"}; });
    }
    var H = FH && FH.items && FH.items[P.c], eqS = null, how = "";
    if (H && H.h && H.h.length){
      var cov = 0, eq = 0; H.h.forEach(function(h){ cov += +h[1] || 0; if (h[2] === "주식") eq += +h[1] || 0; });
      if (cov >= 25){ eqS = eq / cov; how = "상위 보유 " + Math.round(cov) + "% 중 주식 " + Math.round(eqS * 100) + "%"; }
    }
    if (eqS == null && FT[t] != null && /K200|인덱스/.test(st)){ eqS = 1; how = "코스피200 인덱스"; }
    if (eqS == null) return Promise.resolve({na: "상위 보유 자료가 적어 추정 못 함"});
    return betaOf("KOSPI200", K, dn).then(function(B){ return B ? {b: eqS * B.b, how: how + " · 국내 주식은 코스피200처럼"} : {na: "코스피200 자료 없음"}; });
  }

  function ldRun(){
    var EM = window.__elsMy, PD = window.__pdz, dn = drvName(), DV = DRV[dn];
    if (!EM || !PD || !PD.ready) return Promise.resolve(null);
    return dbase(dn).then(function(K){
      if (!K) return null;
      var K2 = dn === "KOSPI200" ? K : K.k200;   // ELS 지금 값 맞추기는 늘 코스피200·한국 종목 10분 시세로
      var Kd = {d: K.d, c: K.c};
      var A0 = amt(), C = PD.cfg(), w = PD.wts();
      var ev = [], st = [], out = [], nb = {}, sep = DV.sh + "와 거의 따로";
      LD.port = null;
      /* 💼 설계기 포트 · 📝 제안서 폼 — 같은 미국 ETF 일봉(port_px) */
      var pPort = PD.ready().then(function(A){
        if (!A) return;
        var D = Array.prototype.slice.call(A.D), bk = {};
        ["SPY", "QQQ", "GLD"].forEach(function(k){ var j = join({d: D, c: Array.prototype.slice.call(A.C[k])}, Kd); bk[k] = beta5(j.a, j.b); });
        var ww = w || (function(){ var s = C.w.SPY / 100, q = C.w.QQQ / 100, g = C.w.GLD / 100; return {SPY: s, QQQ: q, GLD: g, BIL: Math.max(0, 1 - s - q - g)}; })();
        var r = PD.engine(A, ww, {reg: C.reg, vol: C.vol, start: ""});
        if (r){
          var pd = [], pc_ = []; for (var u = 0; u < r.nv.length; u++){ pd.push(r.D[r.i0 + u]); pc_.push(r.nv[u]); }
          var jp = join({d: pd, c: pc_}, Kd), bp = beta5(jp.a, jp.b);
          var pk = 0; for (var i = 0; i < r.nv.length; i++) if (r.nv[i] > pk) pk = r.nv[i];
          var ddp = r.nv[r.nv.length - 1] / pk - 1, nm = "💼 설계기 포트" + (w ? "" : "(기본 비중)");
          if (bp && bp.b > 0.05){
            ev.push({g: "port", t: nm + " −10%", s: won(A0) + "원이면 " + won(A0 * 0.1) + "원 줄어듦", m: -10 / bp.b, b: bp.b});
            var y = (1 + r.mdd / 100) / (1 + ddp) - 1;
            if (y < 0) ev.push({g: "port", t: nm + " 2008년 뒤 가장 깊었던 낙폭 수준", s: "그때 고점 대비 " + sg(r.mdd, 1) + "%(" + r.mddAt.slice(0, 7).replace("-", ".") + ") · 지금 고점 대비 " + sg(ddp * 100, 1) + "% · " + won(A0) + "원이면 " + won(A0 * -y) + "원 더 줄어듦", m: y * 100 / bp.b, b: bp.b});
            LD.port = {b: bp.b, A: A0, nm: nm};
          } else out.push(nm + " — " + sep + "(같이 움직이는 크기 " + (bp ? bp.b.toFixed(2) : "–") + ")");
        }
        return Promise.all([J("archive/x/proposal.json", 3600e3), J("archive/x/port_px/KOSPI.json", 864e5)]).then(function(rr){
          var P = rr[0], KJ = rr[1], bK = null;
          if (KJ && KJ.dd){ var t = s2day(KJ.d0), dd = [], cc = []; for (var z = 0; z < KJ.dd.length; z++){ t += KJ.dd[z]; dd.push(t); cc.push(+KJ.c[z]); } var jk = join({d: dd, c: cc}, Kd); bK = beta5(jk.a, jk.b); }
          ((P && P.forms) || []).forEach(function(f){
            var W = f.sim && f.sim.bt && f.sim.bt.w; if (!W) return;
            var b = 0, ok = true; Object.keys(W).forEach(function(k){ var x = +W[k] / 100; if (k === "BIL") return; var B = k === "KOSPI" ? bK : bk[k]; if (B) b += x * B.b; else ok = false; });
            if (!ok) return;
            var nm = "📝 " + f.title.replace(/ 포트폴리오$/, "") + " 폼";
            if (b > 0.05) ev.push({g: "form", t: nm + " −10%", s: "1억 넣었다면 1,000만원 줄어듦", m: -10 / b, b: b, key: f.key});
            else out.push(nm + " — " + sep);
          });
        });
      });
      /* 📦 담아 둔 펀드 */
      var F = myFunds(), pFund = F.length ? Promise.all([J("archive/x/products.json", 3600e3), J("archive/x/fund_hold.json", 3600e3)]).then(function(r){
        var PM = {}; ((r[0] && r[0].funds) || []).forEach(function(f){ PM[f.c] = f; });
        return Promise.all(F.map(function(f){ return fundBeta(f, PM[f.id], r[1], Kd, dn).then(function(B){
          var nm = String(f.nm || PM[f.id] && PM[f.id].n || f.id).replace(/증권.*$|투자신탁.*$/, "").slice(0, 22), a = +f.amt || 0;
          if (B.zero) out.push("📦 " + nm + " — " + B.how);
          else if (B.na) out.push("📦 " + nm + " — " + B.na);
          else if (B.b > 0.05) ev.push({g: "fund", t: "📦 " + nm + " −10%", s: (a ? won(a) + "원이면 " + won(a * 0.1) + "원 줄어듦 · " : "") + B.how, m: -10 / B.b, b: B.b, amt: a});
          else out.push("📦 " + nm + " — " + sep);
        }); }));
      }) : Promise.resolve();
      /* 📌 내 ELS — 다음 평가 배리어 · KI (가장 먼저 닿는 기초자산 기준) */
      var L = myEls(), pEls = L.length ? EM.load().then(function(){
        return Promise.all(L.map(function(it){
          var q = EM.parseKey(it.key), nm = String(it.nm || "").slice(0, 22), a = +it.amt || 0;
          return Promise.all(q.ua.map(EM.epx)).then(function(ss){
            if (ss.some(function(x){ return !x; })){ out.push("📌 " + nm + " — 기초자산 일봉 없음"); return; }
            var G = EM.align(ss); G.K = G.C.map(EM.sparse); var M = EM.monitor(it, G);
            if (!M || M.wait){ st.push("📌 " + nm + " — 기준가가 아직 안 정해짐"); return; }
            if (M.done){ st.push("📌 " + nm + " — " + (M.done.k + 1) + "차 평가에서 상환 조건을 넘음"); return; }
            // 지금 값으로: 코스피200 = KODEX200 10분 시세 · 한국 종목 = live_px · 나머지 = 마지막 종가
            var idx = (K.idx && K.idx.assets) || {}, cur = M.cur.slice();
            q.ua.forEach(function(u, i){
              var lastC = G.C[i][G.C[i].length - 1], nowV = null;
              if (u === "KOSPI200") nowV = K2 && K2.now;
              else { var f = idx[u] && idx[u].f, cd = f && /^(\d{6})_K[SQ]\.json$/.exec(f); if (cd && K.lvq && K.lvq[cd[1]]) nowV = +K.lvq[cd[1]][0]; }
              if (nowV > 0 && lastC > 0) cur[i] = M.cur[i] * nowV / lastC;
            });
            return Promise.all(q.ua.map(function(u){ return betaOf(u, Kd, dn); })).then(function(BS){
              function first(level){   // level: 기준가 대비 비율 → 기준 시장 몇 % 에서 처음 닿나
                var best = null, who = null, now = false;
                q.ua.forEach(function(u, i){ if (cur[i] < level){ now = true; return; } var B = BS[i]; if (!B || B.b <= 0.05) return;
                  var mm = (level / cur[i] - 1) * 100 / B.b; if (best == null || mm > best){ best = mm; who = u; } });
                return {now: now, m: best, who: who};
              }
              if (M.next){
                var br = first(M.next.bar / 100);
                if (br.now) st.push("📌 " + nm + " — 지금 " + (M.next.k + 1) + "차 배리어(" + M.next.bar + ") 밑 · 이대로면 " + md(day2s(M.next.t)) + " 평가에 상환 안 됨");
                else if (br.m != null) ev.push({g: "els", t: "📌 " + nm + " · " + (M.next.k + 1) + "차 배리어 " + M.next.bar + " 밑", s: lab(br.who) + "가 먼저 닿음 · " + md(day2s(M.next.t)) + " 평가 때 이 아래면 이번엔 상환 안 됨", m: br.m, amt: a});
                else out.push("📌 " + nm + " 배리어 — " + sep);
              }
              if (q.ki != null){
                if (M.kt) st.push("📌 " + nm + " — KI " + q.ki + " 이미 닿음(만기에 못 넘으면 손실)");
                else { var kr = first(q.ki / 100);
                  if (kr.now) st.push("📌 " + nm + " — 지금 KI " + q.ki + " 밑(장중 · 종가로 확인)");
                  else if (kr.m != null) ev.push({g: "els", t: "📌 " + nm + " · KI " + q.ki + " 닿음", s: lab(kr.who) + "가 먼저 닿음 · 만기에 못 넘으면 원금 손실" + (a ? " · " + won(a) + "원 걸림" : ""), m: kr.m, amt: a, ki: 1});
                  else out.push("📌 " + nm + " KI — " + sep); }
              }
            });
          });
        }));
      }) : Promise.resolve();
      // 다른 시장도 같이 보여 주기(대략): 기준이 코스피면 S&P, S&P 면 코스피200
      var other = dn === "KOSPI200" ? "S&P500" : "KOSPI200", pOth = betaOf(other, Kd, dn).then(function(B){ nb.oth = B ? {b: B.b, nm: DRV[other].nm} : null; });
      return Promise.all([pPort, pFund, pEls, pOth]).then(function(){
        ev.sort(function(x, y){ return y.m - x.m; });
        return {K: K, dn: dn, ev: ev, st: st, out: out, nb: nb, els: L.length, funds: F.length, A: A0};
      });
    });
  }

  function ldH(R){
    if (!R) return '<div class="empty">일봉·설계기 자료를 아직 못 받았어요.</div>';
    var K = R.K, ev = R.ev, m = LD.m, DV = DRV[R.dn];
    var inR = ev.filter(function(x){ return x.m >= MAX; }), far = ev.filter(function(x){ return x.m < MAX; });
    var nx = inR[0];
    var tg = '<div class="ld-drv">어느 시장이 빠지면 ' + Object.keys(DRV).map(function(k){ return '<button type="button" data-ldd="' + e(k) + '" class="' + (k === R.dn ? "on" : "") + '">' + DRV[k].ic + ' ' + DRV[k].nm + '</button>'; }).join("") + '</div>';
    var head = '<div class="ld-now"><div><small>' + DV.nm + ' ' + (K.live ? '지금' : '마지막') + '</small><b class="' + (K.chg < 0 ? "dn" : "up") + '">' + sg(K.chg, 1) + '%</b><em>' + (K.live ? K.live.t + ' · KODEX200 시세' : md(K.at) + ' 종가') + '</em></div>' +
      '<div><small>20거래일 고점(' + md(K.hiAt) + ') 대비</small><b class="' + (K.dd < -0.05 ? "dn" : "") + '">' + sg(K.dd, 1) + '%</b><em>여기서 더 빠지면 ↓</em></div>' +
      '<div class="ld-nx"><small>다음 금까지</small><b>' + (nx ? sg(nx.m, 1) + '%' : '–') + '</b><em>' + (nx ? e(nx.t.replace(/^\S+\s/, "")) : DV.sh + ' −30% 안에선 없음') + '</em></div></div>';
    var rows = '<div class="ld-ld">' +
      '<div class="ld-r ld-me"><span class="ld-l"><b>0%</b><small>지금</small></span><i class="ld-dot"></i><span class="ld-t"><b>📍 지금 여기</b><small>' + DV.nm + (K.live ? ' 오늘 ' : ' ' + md(K.at) + ' ') + sg(K.chg, 1) + '% · 20거래일 고점 대비 ' + sg(K.dd, 1) + '%</small></span></div>' +
      (inR.length ? inR.map(function(x){ var on = m < 0 && x.m >= m;
        return '<div class="ld-r' + (on ? ' on' : '') + (x.ki ? ' ki' : '') + '" data-g="' + x.g + '"><span class="ld-l"><b>' + sg(x.m, 1) + '%</b><small>고점 ' + sg(((1 + K.dd / 100) * (1 + x.m / 100) - 1) * 100, 0) + '%</small></span><i class="ld-dot"></i>' +
          '<span class="ld-t"><b>' + e(x.t) + '</b><small>' + e(x.s) + (x.b ? ' · 같이 움직이는 크기 ' + x.b.toFixed(2) : '') + '</small></span></div>'; }).join("")
        : '<div class="ld-r"><span class="ld-l"><b>−30%</b></span><i class="ld-dot"></i><span class="ld-t"><b>' + DV.sh + '이 30% 더 빠져도 먼저 깨지는 게 없어요</b><small>담아 둔 것이 ' + DV.sh + '와 따로 움직이거나, 여유가 커요</small></span></div>') +
      '</div>';
    var tail = (far.length ? '<p class="ld-far">' + DV.sh + ' −30% 안에선 안 닿음: ' + far.map(function(x){ return e(x.t) + '(' + sg(x.m, 0) + '%)'; }).join(" · ") + '</p>' : '') +
      (R.st.length ? '<div class="ld-st"><b>⚠️ 이미 걸린 것</b>' + R.st.map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') +
      (R.out.length ? '<p class="ld-far">따로 움직여 뺀 것: ' + R.out.map(e).join(" · ") + '</p>' : '') +
      (!R.els ? '<p class="ld-hint">📌 상품 → ELS 「내 ELS 관제탑」에 담은 ELS 가 있으면 <b>다음 평가 배리어·KI 가 어디서 깨지나</b>도 여기 같이 서요.</p>' : '') +
      (!R.funds ? '<p class="ld-hint">📦 「🎛 포트 설계기」를 펼쳐 「🔬 내 돈 속 진짜 종목」에서 펀드를 담으면 그 펀드도 같이 서요.</p>' : '');
    var sl = '<div class="ld-sl"><label>👆 ' + DV.nm + '이 지금보다 <b id="ldmv">' + sg(m, 1) + '%</b> 더 빠지면 <input type="range" id="ldm" min="' + MAX + '" max="0" step="0.5" value="' + m + '" aria-label="더 빠지면"></label><div id="ldsum">' + ldSum(R, m) + '</div></div>';
    return tg + head + sl + rows + tail +
      '<p class="note" style="margin:8px 0 0">대략 — 「같이 움직이는 크기」= 최근 1년 주간(5거래일) 등락으로 잰 「' + DV.nm + '이 1% 움직일 때 같이 움직인 %」(위기 때는 더 커질 수 있음) · 미국 ETF·지수는 달러 기준(환율 빼고) · 펀드는 상위 보유 주식 비중 · ELS 는 기준가 대비 지금 값(코스피200·한국 종목은 10분 시세, 나머지는 마지막 종가) · 과거 계산 · 미래 보장 아님 · 사라·팔라는 뜻 아님</p>';
  }
  function ldSum(R, m){
    if (!(m < 0)) return '<small class="mut">막대를 왼쪽으로 끌면 그 깊이에서 무엇이 깨지는지 · 대략 얼마 줄어드는지 바로 보여요</small>';
    var K = R.K, br = R.ev.filter(function(x){ return x.m >= m; }), O = R.nb.oth, P = LD.port, lossF = 0;
    R.ev.forEach(function(x){ if (x.g === "fund" && x.amt) lossF += x.amt * x.b * -m / 100; });
    var ki = br.filter(function(x){ return x.ki; }).length, bar = br.filter(function(x){ return x.g === "els" && !x.ki; }).length;
    return '<div class="ld-sm"><span>고점 대비 <b class="dn">' + sg(((1 + K.dd / 100) * (1 + m / 100) - 1) * 100, 1) + '%</b></span>' + (O ? '<span>' + O.nm + ' 대략 <b class="dn">' + sg(O.b * m, 1) + '%</b></span>' : '') +
      '<span>깨진 것 <b>' + br.length + '</b>개</span>' + (P ? '<span>💼 포트 대략 <b class="dn">−' + won(P.A * P.b * -m / 100) + '원</b></span>' : '') + (lossF ? '<span>📦 펀드 대략 <b class="dn">−' + won(lossF) + '원</b></span>' : '') +
      (bar || ki ? '<span>📌 배리어 밑 ' + bar + ' · KI ' + ki + '</span>' : '') + '</div>';
  }
  function ldBind(b){
    [].forEach.call(b.querySelectorAll("[data-ldd]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); try { localStorage.setItem("ldDrv", x.getAttribute("data-ldd")); } catch(z) {} LD.m = 0; ldPaint(); }; });
    var r = document.getElementById("ldm"); if (!r) return; stop(r);
    r.oninput = function(){ LD.m = +r.value; var v = document.getElementById("ldmv"); if (v) v.textContent = sg(LD.m, 1) + "%";
      var s = document.getElementById("ldsum"); if (s && LD.R) s.innerHTML = ldSum(LD.R, LD.m);
      var ev = LD.R ? LD.R.ev.filter(function(x){ return x.m >= MAX; }) : [];
      [].forEach.call(b.querySelectorAll(".ld-ld .ld-r[data-g]"), function(row, i){ var x = ev[i]; row.classList.toggle("on", !!x && LD.m < 0 && x.m >= LD.m); }); };
  }
  function ldPaint(){
    var b = document.getElementById("ldbody"); if (!b || LD.busy) return;
    LD.busy = 1;
    ldRun().then(function(R){ LD.busy = 0; LD.R = R; var b2 = document.getElementById("ldbody"); if (!b2) return; b2.innerHTML = ldH(R); ldBind(b2); }, function(x){ LD.busy = 0; console.warn(x); });
  }
  function ldSig(){ var P = window.__pdz; return JSON.stringify([drvName(), P && P.cfg ? P.cfg() : 0, amt(), myEls().map(function(x){ return [x.id, x.amt, x.base]; }), myFunds().map(function(f){ return [f.id, f.amt]; })]); }
  function portMount(){
    var pz = document.querySelector("#podz section.card.pz"); if (!pz) return;
    if (!document.getElementById("ldsec")){
      var s = document.createElement("section"); s.className = "card ld4 no-clp"; s.id = "ldsec"; s.dataset.xc = "1";
      s.innerHTML = '<h3 class="ld-hd">🪜 금 가는 순서표</h3><small class="ld-sub">코스피200이 더 빠지면 내 돈에서 무엇이 먼저 깨지나 — 📌 ELS · 📦 펀드 · 💼 포트 · 📝 제안서 폼</small><div id="ldbody"><div class="loading">순서 세우는 중…</div></div>';
      var pd = document.getElementById("podz");   // 설계기 덩어리(접힘) 바로 위 — 포트 탭의 다른 카드처럼 제목 한 줄로 접히고 누르면 펼침
      pd.parentNode.insertBefore(s, pd); LD.sig = ldSig(); ldPaint();
      var fj = document.querySelector("#pobody .fold-jump, .fold-jump");
      if (fj && !fj.querySelector("[data-ldj]")){ var bt = document.createElement("button"); bt.setAttribute("data-ldj", "1"); bt.textContent = "🪜 금"; fj.appendChild(bt);
        bt.onclick = function(){ var el = document.getElementById("ldsec"); if (!el) return; el.classList.remove("cz-on"); var y = el.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 50; window.scrollTo({top: y, behavior: "smooth"}); }; }
      return;
    }
    var sg_ = ldSig(); if (sg_ !== LD.sig){ LD.sig = sg_; clearTimeout(portMount.t); portMount.t = setTimeout(ldPaint, 500); }
  }
  // 장중엔 10분마다 다시(지금 위치가 움직임)
  setInterval(function(){ if (document.getElementById("ldbody") && !document.hidden){ KB = null; ldPaint(); } }, 600000);

  /* ════════════ ② 🔢 숫자로 찾기 ════════════ */
  var NS = {P: null, E: null, PR: null};
  function nsData(){
    if (!NS.P) NS.P = Promise.all([J("archive/x/products.json", 1800e3), J("archive/x/els_all.json", 1800e3), J("archive/x/proposal.json", 3600e3)]).then(function(r){ NS.PR = r[2]; return {p: r[0], e: r[1], pr: r[2]}; });
    return NS.P;
  }
  // 「5%」「3년」「18개월」「1000만원」「1억」「5천만」「1년 +10%」 — 숫자 말고 다른 글자가 남으면 종목 검색으로 둠
  function parse(q0){
    var q = String(q0 || "").replace(/,/g, "").trim(); if (!q || !/\d/.test(q)) return null;
    var o = {}, rest = q, m;
    m = /1\s*년\s*(?:에\s*)?\+?\s*(\d+(?:\.\d+)?)\s*%/.exec(rest); if (m){ o.goal = +m[1]; rest = rest.replace(m[0], " "); }
    m = /(\d+(?:\.\d+)?)\s*(억|천만|백만|만)\s*원?/.exec(rest); if (m){ o.amt = +m[1] * {"억": 1e8, "천만": 1e7, "백만": 1e6, "만": 1e4}[m[2]]; rest = rest.replace(m[0], " "); }
    else { m = /(\d{6,})\s*원/.exec(rest); if (m){ o.amt = +m[1]; rest = rest.replace(m[0], " "); } }
    m = /(\d+(?:\.\d+)?)\s*%/.exec(rest); if (m){ o.rate = +m[1]; rest = rest.replace(m[0], " "); }
    m = /(\d+(?:\.\d+)?)\s*(년|개월|달)/.exec(rest); if (m){ o.yrs = m[2] === "년" ? +m[1] : +m[1] / 12; rest = rest.replace(m[0], " "); }
    rest = rest.replace(/연|이상|넘는|넘게|넘|짜리|안팎|정도|쯤|만기|이자|금리|수익|수익률|상품|으로|로|에|이면|이|원|\+|~|\s/g, "");
    if (/[A-Za-z가-힣0-9]/.test(rest)) return null;
    if (o.goal == null && o.amt == null && o.rate == null && o.yrs == null) return null;
    if (o.rate != null && (o.rate <= 0 || o.rate > 30)) return null;
    return o;
  }
  var RK = {"매우낮은위험": 0, "낮은위험": 1, "보통위험": 2, "다소높은위험": 3, "높은위험": 4, "매우높은위험": 5};
  var BK = {"국채": 0, "공사채·지방채": 1, "회사채": 2, "신종·후순위": 3};
  function yTo(s){ return (s2day(s) - s2day(today())) / 365.25; }
  function ytxt(y){ var a = Math.floor(y), mo = Math.round((y - a) * 12); if (mo === 12){ a++; mo = 0; } return (a ? a + "년" : "") + (mo ? " " + mo + "개월" : "") || "1개월 안"; }
  function within(y, H){ return Math.abs(y - H) <= Math.max(0.25, H * 0.15); }
  function uaClean(u){   // 공시 글에서 기초자산 칸에 긴 문장이 들어온 경우가 있음 → 짧은 이름만, 아니면 「설명서 확인」
    var t = String(u || "").replace(/\s*지수/g, "").replace(/\s*보통주\s*\(\d{6}\)/g, "").replace(/\(\d{6}\)/g, "").trim();
    if (!t || t.length > 40 || /산출기관|발행인|경우/.test(t)) return "기초자산은 설명서 확인";
    return t;
  }
  function pick(D, o){
    var td = today(), P = D.p || {}, R = {bond: [], els: [], fund: []};
    // 채권: 원화(세전 매수금리 buy · 세후 after) + 미국채·호주국채(달러·호주달러 기준 만기수익률)
    (P.krw || []).forEach(function(b){ if (!(b.buy > 0) || !b.mat) return; var y = yTo(b.mat); if (y <= 0) return;
      if (o.rate != null && b.buy < o.rate) return; if (o.yrs != null && !within(y, o.yrs)) return;
      R.bond.push({k: "bond", nm: b.name, r: b.buy, aft: b.after, y: y, risk: b.risk, rk: RK[b.risk] == null ? 9 : RK[b.risk], bk: BK[b.kind] == null ? 5 : BK[b.kind], kind: b.kind, cur: "원화"}); });
    [["ust", "달러"], ["aud", "호주달러"]].forEach(function(z){ ((P[z[0]] && P[z[0]].items) || []).forEach(function(b){ if (!(b.ytm > 0) || !b.mat) return; var y = yTo(b.mat); if (y <= 0) return;
      if (o.rate != null && b.ytm < o.rate) return; if (o.yrs != null && !within(y, o.yrs)) return;
      R.bond.push({k: "bond", nm: (b.kind || "") + " " + b.name, r: b.ytm, y: y, risk: "환율 따로", rk: 1.5, bk: 0.5, kind: b.kind, cur: z[1]}); }); });
    R.bond.sort(function(a, b){ return (a.cur !== "원화") - (b.cur !== "원화") || a.rk - b.rk || a.bk - b.bk || (o.rate != null ? a.r - b.r : b.r - a.r); });   // 원화 먼저(환율 위험 없음) → 위험 낮은 순 → 조건에 가장 가까운 금리
    // ELS·ELB: 청약 중(마감 ≥ 오늘) · 조건 맞으면 연 쿠폰
    (((D.e && D.e.items) || [])).forEach(function(x){ if (!x.e || x.e < td || !(x.cpn > 0) || x.pv === true) return; var y = x.mat ? yTo(x.mat) : null;
      if (o.rate != null && x.cpn < o.rate) return; if (o.yrs != null && (y == null || !within(y, o.yrs))) return;
      var elb = x.kind === "ELB" || x.nolos;
      R.els.push({k: "els", nm: String(x.nm || "").replace(/\s*\(.*$/, "").replace(/파생결합증권|주가연계증권|파생결합사채|주가연계파생결합사채/g, "").replace(/\s+/g, " ").trim() || x.id, iss: String(x.iss || "").replace(/주식회사|\(주\)/g, "").trim(),
        r: x.cpn, y: y, ua: uaClean(x.ua), ki: x.ki, bars: x.bars, e: x.e, elb: elb, ord: elb ? 0 : 1, kio: x.ki == null ? (elb ? 0 : 99) : x.ki}); });
    R.els.sort(function(a, b){ return a.ord - b.ord || a.kio - b.kio || (o.rate != null ? a.r - b.r : b.r - a.r); });
    // 펀드: 지난 1년 수익률(과거) · 만기가 없으니 「n년」만 친 경우는 뺌
    if (o.rate != null) (P.funds || []).forEach(function(f){ if (f.pv || f.y1 == null || (f.aum || 0) < 10) return;
      if (/채권형|MMF/.test(f.t || "") && !/혼합/.test(f.t) && f.y1 > 12) return;   // 채권·MMF 인데 1년 +12% 넘으면 자료 이상으로 보고 뺌
      if (f.y1 < o.rate || f.y1 > 300) return;
      R.fund.push({k: "fund", nm: f.n, r: f.y1, t: f.t, st: f.st, rk: f.rk, co: f.co, c: f.c}); });
    R.fund.sort(function(a, b){ return (b.rk || 0) - (a.rk || 0) || a.r - b.r; });   // rk 6 = 매우 낮은 위험 → 조건에 가장 가까운 것
    return R;
  }
  function rowTxt(x, o){
    var A = o.amt;
    if (x.k === "bond") return {h: "🏦 채권", nm: x.nm, big: (x.cur === "원화" ? "세전 연 " : x.cur + " 기준 연 ") + pc(x.r, 2), sub: (x.aft != null ? "세후 " + pc(x.aft, 2) + " · " : "") + "남은 기간 " + ytxt(x.y) + " · " + (x.kind || "") + " · " + x.risk,
      mean: x.cur === "원화" ? "만기까지 들고 있으면 받는 금리(발행한 곳이 갚는다는 전제)" : "만기까지 들고 있으면 받는 금리 — 원화로는 환율에 따라 달라짐", won: A && x.cur === "원화" ? won(A * x.r / 100) + "원/년(세전)" : ""};
    if (x.k === "els") return {h: x.elb ? "🎯 ELB(원금 지급형)" : "🎯 ELS", nm: x.nm + (x.iss ? " · " + x.iss : ""), big: "조건 맞으면 연 " + pc(x.r, 1), sub: String(x.ua || "") + (x.ki != null ? " · KI " + x.ki : "") + (x.y != null ? " · 최장 " + ytxt(x.y) : "") + " · 청약 " + md(x.e) + " 마감",
      mean: x.elb ? "원금은 지급 · 조건 못 맞추면 최저 수익" : "조건 못 맞추면 원금 손실 가능 — 쿠폰은 약속된 최대치", won: A ? "조건 맞으면 " + won(A * x.r / 100) + "원/년" : ""};
    return {h: "📦 펀드", nm: x.nm.replace(/증권.*$|투자신탁.*$/, "").trim() + (x.co ? " · " + x.co : ""), big: "지난 1년 " + sg(x.r, 1) + "%", sub: (x.t || "") + (x.st ? " · " + x.st : "") + (x.rk ? " · 위험 " + x.rk + "등급(6 = 가장 낮음)" : ""),
      mean: "지나간 1년 결과일 뿐 — 앞으로 보장 아님 · 원금 손실 가능", won: A ? "지난 1년이었다면 " + (x.r >= 0 ? "+" : "−") + won(Math.abs(A * x.r / 100)) + "원" : ""};
  }
  function title(o){
    var a = []; if (o.rate != null) a.push("연 " + o.rate + "% 넘는"); if (o.yrs != null) a.push(ytxt(o.yrs).trim() + " 안팎"); return a.join(" · ") + " 상품";
  }
  function goalForms(PR, g){
    return ((PR && PR.forms) || []).map(function(f){ var G = f.sim && f.sim.bt && f.sim.bt.growth; if (!G || !G.vals || G.vals.length < 30) return null;
      var v = G.vals, n = 0, k = 0, best = -1e9, worst = 1e9; for (var i = 0; i + 12 < v.length; i++){ var r = (v[i + 12] / v[i] - 1) * 100; n++; if (r >= g) k++; if (r > best) best = r; if (r < worst) worst = r; }
      return {key: f.key, t: f.title.replace(/ 포트폴리오$/, ""), ic: f.icon || "📝", n: n, k: k, p: k / n * 100, from: G.labels[0], worst: worst}; }).filter(Boolean).sort(function(a, b){ return b.p - a.p; });
  }
  function jump(tab, sel){
    var o = document.getElementById("gsq"); if (o) o.remove(); document.body.classList.remove("gs-open");
    if (!window.goTo){ if (window.go) go(tab); return; }
    if (sel && sel.charAt(0) === "#"){ goTo(tab, sel.slice(1)); return; }
    goTo(tab); if (!sel) return;
    var t0 = Date.now(); (function f(){ var el = document.querySelector(sel); if (el){ if (!el.id) el.id = "nsj" + Math.random().toString(36).slice(2, 7); goTo(tab, el.id); return; } if (Date.now() - t0 < 8000) setTimeout(f, 200); })();
  }
  var CUR = null;
  function nsHTML(o, D){
    var h = "";
    if (o.rate != null || o.yrs != null){
      var R = pick(D, o), top = [R.bond[0], R.els[0], R.fund[0]].filter(Boolean);
      CUR = {o: o, R: R, top: top};
      h += '<div class="ns-hd">🔢 <b>' + e(title(o)) + '</b><small>채권 ' + R.bond.length + ' · ELS ' + R.els.length + (o.rate != null ? ' · 펀드 ' + R.fund.length : ' · 펀드는 만기가 없어 뺌') + ' — 위험 낮은 것부터 한 줄씩</small></div>';
      h += top.length ? '<div class="ns-top">' + top.map(function(x){ var T = rowTxt(x, o); return '<div class="ns-c"><small>' + T.h + '</small><b class="ns-big">' + e(T.big) + '</b><span class="ns-nm">' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' + (T.won ? '<u>' + e(T.won) + '</u>' : '') + '</div>'; }).join("") + '</div>' +
        '<div class="ns-act"><button type="button" data-ns="big">📲 크게 보기 · 한 장</button></div>' : '<div class="gs-hint">조건에 맞는 상품이 지금 목록에 없어요.</div>';
      [["bond", "🏦 채권", R.bond, "bond"], ["els", "🎯 ELS·ELB(청약 중)", R.els, "els"], ["fund", "📦 펀드(지난 1년)", R.fund, "fund"]].forEach(function(z){
        if (!z[2].length) return;
        h += '<details class="ns-more"><summary>' + z[1] + ' ' + z[2].length + '개 더 보기</summary>' + z[2].slice(0, 8).map(function(x){ var T = rowTxt(x, o); return '<div class="ns-r"><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><small>' + e(T.sub) + '</small></div>'; }).join("") +
          '<button type="button" class="ns-go" data-nsj="' + z[3] + '">' + z[1] + ' 탭에서 보기 ›</button></details>';
      });
    }
    if (o.goal != null){
      var GF = goalForms(D.pr, o.goal);
      h += '<div class="ns-hd">🎯 <b>1년에 +' + o.goal + '% 넘었던 비율</b><small>📝 제안서 주식·연금 폼 · 매달 시작했다면 그 뒤 1년</small></div>' +
        (GF.length ? GF.map(function(g){ return '<button type="button" class="ns-g" data-nsf="' + e(g.key) + '"><span>' + e(g.ic) + ' <b>' + e(g.t) + '</b><small>' + g.from.replace("-", ".") + '~ · ' + g.n + '번 중 ' + g.k + '번 · 가장 나쁜 1년 ' + sg(g.worst, 1) + '%</small></span><b class="ns-p">' + Math.round(g.p) + '%</b></button>'; }).join("") +
          '<p class="ns-n">과거 계산 · 미래 보장 아님 · 채권·ELS 폼은 확정·조건 수익이라 뺌 · 누르면 그 폼으로</p>' : '<div class="gs-hint">폼 자료를 못 받았어요.</div>');
    }
    if (false && o.amt != null){   // 11/05 세 갈래 길 뺌
      h += '<div class="ns-hd">💰 <b>' + won(o.amt) + '원</b><small>같은 돈을 채권·ELS·포트에 나눠 보면</small></div>' +
        '<button type="button" class="ns-g" data-nsa="' + o.amt + '"><span>⚖️ <b>' + won(o.amt) + '원으로 세 갈래 길 열기</b><small>채권 한 점 · ELS · 포트 3년 범위 — 💼 주문서 투자금도 같은 칸이라 ' + won(o.amt) + '원으로 바뀌어요(지금 ' + won(amt()) + '원)</small></span><b class="ns-p">›</b></button>';
    }
    return h + '<p class="ns-n">참고용 · 투자 권유 아님 · 세금·수수료 전 · 숫자는 미래에셋 판매 목록(채권·펀드)·DART 청약 공시(ELS) 그대로</p>';
  }
  function chipsHTML(){
    return '<div class="ns-chips"><small>🔢 숫자로 찾기</small>' + ["5%", "3년", "4% 3년", "1년 +10%"].map(function(x){ return '<button type="button" data-nsc="' + e(x) + '">' + e(x) + '</button>'; }).join("") + '</div>';
  }
  function hook(){
    var o = document.getElementById("gsq"); if (!o || o.dataset.ns) return; o.dataset.ns = "1";
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres"), ask = document.getElementById("gsask"); if (!inp || !res) return;
    inp.placeholder = "종목명·코드 · 숫자도 돼요 (예: 삼성전자, 5%, 3년)";
    var box = document.createElement("div"); box.id = "gsnum"; res.parentNode.insertBefore(box, res);
    function draw(){
      var q = inp.value.trim(), P = parse(q);
      if (!q){ box.innerHTML = chipsHTML(); res.style.display = ""; return; }
      if (!P){ box.innerHTML = ""; res.style.display = ""; return; }
      res.style.display = "none"; if (ask) ask.style.display = "none";
      box.innerHTML = '<div class="gs-hint">상품 목록 불러오는 중…</div>';
      nsData().then(function(D){ if (inp.value.trim() !== q) return; box.innerHTML = nsHTML(P, D); });
    }
    inp.addEventListener("input", draw);
    inp.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && parse(inp.value.trim())){ ev.stopImmediatePropagation(); ev.preventDefault(); inp.blur(); } }, true);
    box.addEventListener("click", function(ev){
      var t = ev.target.closest && ev.target.closest("button"); if (!t) return; ev.stopPropagation();
      if (t.dataset.nsc){ inp.value = t.dataset.nsc; draw(); try { if (window.ntfyUse) ntfyUse("num_chip"); } catch(z) {} return; }
      if (t.dataset.ns === "big"){ bigOpen(); return; }
      if (t.dataset.nsj){ jump(t.dataset.nsj, "#pdbody"); return; }
      if (t.dataset.nsf){ jump("prop", '.pp-f[data-k="' + t.dataset.nsf + '"]'); return; }
      if (t.dataset.nsa){ try { var s = JSON.parse(localStorage.getItem("portSet") || "{}"); s.amt = +t.dataset.nsa; localStorage.setItem("portSet", JSON.stringify(s)); } catch(z) {} jump("bond", "#pd3w"); return; }
    });
    draw();
  }
  /* 📲 크게 보기 — 고객에게 폰을 건넬 때(큰 글씨) · 📨 그림 한 장으로 보내기 */
  var DISC = "투자 권유 아님 · 과거 수익률은 미래를 보장하지 않음 · ELS·펀드는 원금 손실 가능 · 세금·수수료 전 · 상품 설명서를 꼭 확인";
  function bigOpen(){
    if (!CUR || !CUR.top.length) return;
    var old = document.getElementById("nsbig"); if (old) old.remove();
    var o = CUR.o, d = document.createElement("div"); d.id = "nsbig"; d.className = "no-clp";
    d.innerHTML = '<div class="nb-in"><div class="nb-top"><small>' + md(today()) + ' · 참고용</small><button type="button" class="nb-x" aria-label="닫기">✕</button></div>' +
      '<h2>' + e(title(o)) + '</h2><p class="nb-s">' + (o.amt ? won(o.amt) + '원 기준 · ' : '') + '위험이 낮은 것부터 한 가지씩</p>' +
      CUR.top.map(function(x){ var T = rowTxt(x, o); return '<div class="nb-c"><small>' + T.h + '</small><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' + (T.won ? '<u>' + e(T.won) + '</u>' : '') + '</div>'; }).join("") +
      '<p class="nb-d">' + DISC + '</p><button type="button" class="nb-send">📨 이 한 장 보내기</button></div>';
    document.body.appendChild(d);
    d.querySelector(".nb-x").onclick = function(){ d.remove(); };
    d.querySelector(".nb-send").onclick = function(){ sendImg(); };
  }
  function wrap(g, t, maxW){ var out = [], line = ""; String(t).split(/(\s+)/).forEach(function(w){ var tt = line + w; if (g.measureText(tt).width > maxW && line.trim()){ out.push(line.trim()); line = w.trim(); } else line = tt; }); if (line.trim()) out.push(line.trim()); return out; }
  function sendImg(){
    if (!CUR) return;
    var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d"), o = CUR.o;
    var F = "-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText(md(today()) + " · 참고용 상품 비교", 64, 90);
    g.fillStyle = "#111827"; g.font = "800 58px " + F; g.fillText(title(o), 64, 170);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText((o.amt ? won(o.amt) + "원 기준 · " : "") + "위험이 낮은 것부터 한 가지씩", 64, 222);
    var y = 270, cols = {bond: "#2563eb", els: "#d97706", fund: "#059669"};
    CUR.top.forEach(function(x){
      var T = rowTxt(x, o), h0 = y;
      g.fillStyle = "#f3f4f6"; g.beginPath(); if (g.roundRect) g.roundRect(48, y, W - 96, 300, 28); else g.rect(48, y, W - 96, 300); g.fill();
      g.fillStyle = cols[x.k]; g.fillRect(48, y + 24, 10, 252);
      g.fillStyle = "#374151"; g.font = "700 30px " + F; g.fillText(T.h, 88, y + 58);
      g.fillStyle = "#111827"; g.font = "800 56px " + F; g.fillText(T.big, 88, y + 126);
      g.fillStyle = "#111827"; g.font = "600 30px " + F; wrap(g, T.nm, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 172); });
      g.fillStyle = "#4b5563"; g.font = "500 26px " + F; wrap(g, T.sub, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 212); });
      g.fillStyle = "#b45309"; g.font = "500 26px " + F; wrap(g, T.mean + (T.won ? " · " + T.won : ""), W - 190).slice(0, 2).forEach(function(l, i){ g.fillText(l, 88, y + 250 + i * 32); });
      y = h0 + 320;
    });
    g.fillStyle = "#6b7280"; g.font = "500 24px " + F; wrap(g, DISC, W - 128).forEach(function(l, i){ g.fillText(l, 64, H - 110 + i * 34); });
    c.toBlob(function(b){
      if (!b) return;
      var f = new File([b], "상품비교_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"});
      if (window.__onepage && __onepage.ready) __onepage.ready([f], "상품 비교 한 장");
      else { var a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); }
    }, "image/png");
  }
  window.__u1104 = {parse: parse, pick: pick, goalForms: goalForms, ldRun: ldRun, beta5: beta5, kbase: kbase, nsData: nsData, rowTxt: rowTxt, ytxt: ytxt, title: title};   // 11/05 ux1105b 가 rowTxt·ytxt 를 같이 씀   // 검사용

  var T = null;
  function tick(){ T = null; try { portMount(); } catch(x) { console.warn(x); } try { hook(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".ld4 h3.ld-hd{margin:0;font-size:16px}.ld4 .ld-sub{display:block;color:var(--sub);font-size:12.5px;margin-top:2px;word-break:keep-all}" +
    ".ld-now{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px;margin:10px 0 8px}.ld-now>div{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:8px 9px;min-width:0}" +
    ".ld-now small{display:block;font-size:11.5px;color:var(--sub);word-break:keep-all}.ld-now b{display:block;font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}.ld-now em{display:block;font-style:normal;font-size:11.5px;color:var(--sub);word-break:keep-all}" +
    ".ld-now .ld-nx{border-color:var(--down,#4b8bff)}.ld-now b.dn,.ld-sm b.dn{color:var(--down)}.ld-now b.up{color:var(--up)}" +
    ".ld-drv{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12.5px;color:var(--sub);margin:10px 0 0}.ld-drv button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 11px;font:inherit;font-size:13px;cursor:pointer}.ld-drv button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}" +
    ".ld-sl{margin:4px 0 10px}.ld-sl label{display:block;font-size:13.5px}.ld-sl input{width:100%;margin:6px 0 2px}.ld-sm{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub)}.ld-sm b{color:var(--text);font-variant-numeric:tabular-nums}" +
    ".ld-ld{position:relative;margin:4px 0 0;padding-left:2px}.ld-ld:before{content:'';position:absolute;left:79px;top:10px;bottom:10px;width:2px;background:var(--line)}" +
    ".ld-r{display:grid;grid-template-columns:70px 16px 1fr;gap:6px;align-items:start;padding:6px 0;position:relative}.ld-l{text-align:right;font-variant-numeric:tabular-nums}.ld-l b{display:block;font-size:14.5px;white-space:nowrap}.ld-l small{display:block;font-size:11px;color:var(--sub);white-space:nowrap}" +
    ".ld-dot{width:12px;height:12px;border-radius:50%;background:var(--panel);border:2px solid var(--sub);margin:4px 0 0 2px;font-style:normal;z-index:1}.ld-t{min-width:0}.ld-t b{display:block;font-size:14px;word-break:keep-all}.ld-t small{display:block;font-size:12px;color:var(--sub);word-break:keep-all}" +
    ".ld-me .ld-dot{background:#ffb84d;border-color:#ffb84d}.ld-me .ld-l b{color:#ffb84d}.ld-0 .ld-l b{color:var(--sub)}" +
    ".ld-r.on{background:rgba(255,159,67,.14);border-radius:10px}.ld-r.on .ld-dot{background:#ff9f43;border-color:#ff9f43}.ld-r.ki .ld-t b:after{content:' ⚠️'}" +
    ".ld-far,.ld-hint{font-size:12.5px;color:var(--sub);margin:8px 0 0;word-break:keep-all}.ld-hint b{color:var(--text)}.ld-st{margin:8px 0 0;font-size:12.5px;border:1px solid var(--line);border-radius:10px;padding:7px 9px}.ld-st div{margin-top:3px;word-break:keep-all}" +
    "#gsnum .ns-chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--line)}#gsnum .ns-chips small{font-size:12.5px;font-weight:800;margin-right:2px}" +
    "#gsnum .ns-chips button{border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 11px;font:inherit;font-size:13.5px;cursor:pointer}" +
    "#gsnum{max-height:72vh;overflow-y:auto}.ns-hd{padding:10px 12px 4px;font-size:14.5px}.ns-hd small{display:block;color:var(--sub);font-size:12px;margin-top:1px;word-break:keep-all}" +
    ".ns-top{display:flex;flex-direction:column;gap:6px;padding:4px 10px}.ns-c{border:1px solid var(--line);border-radius:12px;padding:9px 11px;background:var(--panel2)}.ns-c small{font-size:12px;color:var(--sub);font-weight:700}" +
    ".ns-c .ns-big{display:block;font-size:19px;font-variant-numeric:tabular-nums}.ns-c .ns-nm{display:block;font-size:13.5px;font-weight:700;word-break:keep-all}.ns-c em,.ns-c i,.ns-c u{display:block;font-style:normal;font-size:12px;color:var(--sub);text-decoration:none;word-break:keep-all}.ns-c i{color:#d99a2b}.ns-c u{color:var(--text);font-weight:700}" +
    ".ns-act{padding:6px 10px}.ns-act button,.ns-go{width:100%;border:0;border-radius:12px;padding:11px;font:inherit;font-size:14.5px;font-weight:800;background:var(--c,#7c9cff);color:#111;cursor:pointer}" +
    ".ns-more{margin:4px 10px;border:1px solid var(--line);border-radius:12px;padding:6px 10px}.ns-more summary{font-size:13.5px;font-weight:700;cursor:pointer}.ns-r{padding:6px 0;border-top:1px solid var(--line);font-size:13px}.ns-r b{display:block;font-variant-numeric:tabular-nums}.ns-r span{display:block;word-break:keep-all}.ns-r small{display:block;color:var(--sub);font-size:12px;word-break:keep-all}" +
    ".ns-go{margin:6px 0 2px;background:var(--panel);color:var(--text);border:1px solid var(--line)}" +
    ".gs-box .ns-g{display:flex;width:calc(100% - 20px);margin:4px 10px;align-items:center;gap:8px;text-align:left;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text);padding:9px 11px;font:inherit;cursor:pointer}" +
    ".ns-g span{flex:1;min-width:0;font-size:14px}.ns-g small{display:block;color:var(--sub);font-size:12px;word-break:keep-all}.ns-g .ns-p{font-size:19px;font-variant-numeric:tabular-nums}.ns-n{font-size:11.5px;color:var(--sub);padding:6px 12px 10px;margin:0;line-height:1.45}" +
    "#nsbig{position:fixed;inset:0;z-index:10000;background:var(--bg,#0b0f17);overflow-y:auto;padding:calc(env(safe-area-inset-top) + 12px) 16px calc(env(safe-area-inset-bottom) + 20px)}" +
    ".nb-in{max-width:560px;margin:0 auto}.nb-top{display:flex;justify-content:space-between;align-items:center;color:var(--sub);font-size:14px}.nb-x{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;font-size:20px;padding:6px 14px}" +
    "#nsbig h2{font-size:30px;line-height:1.25;margin:14px 0 4px;word-break:keep-all}.nb-s{color:var(--sub);font-size:17px;margin:0 0 14px}" +
    ".nb-c{border:1px solid var(--line);background:var(--panel);border-radius:18px;padding:16px 16px 14px;margin:0 0 12px}.nb-c small{font-size:16px;color:var(--sub);font-weight:800}.nb-c b{display:block;font-size:32px;margin:4px 0;font-variant-numeric:tabular-nums}" +
    ".nb-c span{display:block;font-size:18px;font-weight:700;word-break:keep-all}.nb-c em,.nb-c i,.nb-c u{display:block;font-style:normal;text-decoration:none;font-size:15.5px;color:var(--sub);margin-top:4px;word-break:keep-all}.nb-c i{color:#d99a2b}.nb-c u{color:var(--text);font-weight:800}" +
    ".nb-d{font-size:14px;color:var(--sub);line-height:1.5;word-break:keep-all}.nb-send{width:100%;border:0;border-radius:14px;padding:15px;font:inherit;font-size:17px;font-weight:800;background:var(--c,#7c9cff);color:#111;margin-top:6px}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
;
__bk(58);
/* ======== mc.js ======== */
/* 🎲 1만 번 돌려보기 (11/04 사용자: 틱톡 「AI 주식 자동매매 1만 번 시뮬레이션 승률」 보고 「너 이거 돼?」 → 「넣어봐」)
   📊 성적표 맨 위 카드. 영상보다 정직하게 — 지어낸 승률이 아니라 「실제로 있었던 것」만 무작위로 다시 뽑음.
   ① 💼 기본 포트: 2008년부터 매일 굴린 💼 기본 규칙(포트 설계기 엔진 · S&P 200일선 · 변동성 맞춤)과 S&P500 의 하루 수익을
      21거래일(한 달) 덩어리째 12개 뽑아 1년을 만듦 → 1만 번. 같은 덩어리를 둘 다에 써서(같은 시장) 공정하게 비교.
   ② ☕ 컵 · 📈 갭: 앱이 10/6부터 실제로 낸 신호의 「5거래일 뒤 수익」에서 거래 비용 0.3%를 뺀 값을, 같은 날 지수(한국 = 코스피, 나머지 = S&P500)
      5일 수익과 짝지어 둠 → 「1년 = 신호 48번 × 매번 100만 원」을 1만 번 뽑음.
   숫자는 날마다 같은 씨앗(seed)이라 열 때마다 흔들리지 않음 · 「🔁 다시 돌리기」는 새 씨앗.
   원칙: 과거 계산 · 미래 보장 아님 · 표본이 적으면 크게 경고 · 사라는 말 없음. */
(function(){
  var N = 10000, SEL = "port", SEED = 0, CACHE = {};
  try { var s0 = localStorage.getItem("mc_sel"); if (s0) SEL = s0; } catch(x) {}
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kday(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function rng(seed){ var a = seed >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedOf(){ var d = kday().replace(/-/g, ""); return (+d * 2654435761 + SEED * 97) >>> 0; }
  function pct(a, p){ var b = Array.prototype.slice.call(a).sort(function(x, y){ return x - y; }); var i = Math.min(b.length - 1, Math.max(0, Math.floor(p * (b.length - 1)))); return b[i]; }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(d == null ? 1 : d); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function man(v){ var a = Math.abs(v); return (v < 0 ? "−" : v > 0 ? "+" : "") + (a >= 1e4 ? (a / 1e4).toFixed(1) + "억" : Math.round(a).toLocaleString()) + "만"; }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }

  /* ── ① 💼 기본 포트 ── */
  function portData(){
    if (CACHE.port) return Promise.resolve(CACHE.port);
    if (!window.__pdz) return Promise.resolve(null);
    return __pdz.ready().then(function(A){
      if (!A) return null;
      var r = __pdz.engine(A, {SPY: .475, QQQ: .475, GLD: .05, BIL: 0}, {reg: 1, vol: 1, start: "2007-06-01"}); if (!r) return null;
      var n = r.nv.length, rp = new Float64Array(n - 1), rs = new Float64Array(n - 1);
      for (var i = 1; i < n; i++){ rp[i - 1] = r.nv[i] / r.nv[i - 1] - 1; rs[i - 1] = r.sp[i] / r.sp[i - 1] - 1; }
      // 실제 있었던 모든 1년(252거래일) 구간 — 시뮬레이션과 나란히 보여 줄 「진짜」
      var real = 0, rn = 0; for (var j = 0; j + 252 < n; j += 5){ rn++; if (r.nv[j + 252] / r.nv[j] > r.sp[j + 252] / r.sp[j]) real++; }
      CACHE.port = {rp: rp, rs: rs, from: r.from, to: r.to, real: rn ? real / rn * 100 : null, cagr: r.cagr, sp_cagr: r.sp_cagr, mdd: r.mdd, sp_mdd: r.sp_mdd};
      return CACHE.port;
    });
  }
  function runPort(P){
    var R = rng(seedOf()), n = P.rp.length, B = 21, K = 12, out = new Float64Array(N), spo = new Float64Array(N), ex = new Float64Array(N), win = 0, pos = 0;
    for (var s = 0; s < N; s++){
      var a = 1, b = 1;
      for (var k = 0; k < K; k++){ var st = Math.floor(R() * (n - B)); for (var t = st; t < st + B; t++){ a *= 1 + P.rp[t]; b *= 1 + P.rs[t]; } }
      out[s] = (a - 1) * 100; spo[s] = (b - 1) * 100; ex[s] = out[s] - spo[s]; if (a > b) win++; if (a > 1) pos++;
    }
    return {kind: "port", win: win / N * 100, pos: pos / N * 100, med: pct(out, .5), smed: pct(spo, .5), p10: pct(out, .1), sp10: pct(spo, .1), p1: pct(out, .01), sp1: pct(spo, .01), exmed: pct(ex, .5), ex: ex, n: n};
  }

  /* ── ② 신호 (컵 · 갭) ── */
  function bench(){
    if (CACHE.bench) return Promise.resolve(CACHE.bench);
    return Promise.all([gj("archive/x/port_px/SPY.json"), gj("archive/x/port_px/KOSPI.json")]).then(function(a){
      function mk(j){ if (!j) return null; var t = Date.parse(j.d0 + "T00:00:00Z") / 864e5, m = {}, L = []; for (var i = 0; i < j.dd.length; i++){ t += j.dd[i]; L.push(t); m[t] = i; } return {m: m, L: L, c: j.c}; }
      CACHE.bench = {US: mk(a[0]), KR: mk(a[1])}; return CACHE.bench;
    });
  }
  function r5bench(B, d0){   // d0 종가에 사서 5거래일 뒤 — 그날이 쉬면 다음 거래일
    if (!B) return null; var t = Date.parse(d0 + "T00:00:00Z") / 864e5, i = null;
    for (var k = 0; k < 6 && i == null; k++) if (B.m[t + k] != null) i = B.m[t + k];
    if (i == null || i + 5 >= B.c.length) return null; return (B.c[i + 5] / B.c[i] - 1) * 100;
  }
  var COST = 0.3;
  function sigData(kind){
    if (CACHE[kind]) return Promise.resolve(CACHE[kind]);
    return Promise.all([gj("archive/x/perf_" + kind + ".json"), bench()]).then(function(a){
      var J = a[0], B = a[1]; if (!J || !J.signals) return null;
      var S = J.signals.filter(function(x){ return x.r5 != null; }), r = [], x = [], days = {};
      S.forEach(function(s){ var net = s.r5 - COST, b = r5bench(s.mkt === "KR" ? B.KR : B.US, s.d0); r.push(net); x.push(b == null ? null : net - b); days[s.d0] = 1; });
      CACHE[kind] = {r: r, x: x, nd: Object.keys(days).length, first: J.first, n: r.length}; return CACHE[kind];
    });
  }
  function runSig(D){
    var R = rng(seedOf() ^ 0x9e37), T = 48, AMT = 100, n = D.r.length, out = new Float64Array(N), ex = new Float64Array(N), win = 0, pos = 0;
    var xs = []; for (var i = 0; i < n; i++) if (D.x[i] != null) xs.push(i);
    for (var s = 0; s < N; s++){
      var a = 0, b = 0;
      for (var k = 0; k < T; k++){ var j = Math.floor(R() * n); a += D.r[j]; if (xs.length){ var q = xs[Math.floor(R() * xs.length)]; b += D.x[q]; } }
      out[s] = a / 100 * AMT; ex[s] = b / 100 * AMT; if (a > 0) pos++; if (b > 0) win++;
    }
    var wr = D.r.filter(function(v){ return v > 0; }).length / Math.max(1, n) * 100, avg = D.r.reduce(function(p, v){ return p + v; }, 0) / Math.max(1, n);
    return {kind: "sig", pos: pos / N * 100, win: xs.length ? win / N * 100 : null, med: pct(out, .5), p10: pct(out, .1), p90: pct(out, .9), p1: pct(out, .01), ex: ex, exmed: pct(ex, .5), wr: wr, avg: avg, T: T, AMT: AMT, n: n, nd: D.nd};
  }

  /* ── 그리기 ── */
  function hist(ex, unit){
    var lo = pct(ex, .01), hi = pct(ex, .99); if (hi - lo < 1e-9){ lo -= 1; hi += 1; }
    var NB = 28, w = (hi - lo) / NB, H = new Array(NB).fill(0), mx = 0;
    for (var i = 0; i < ex.length; i++){ var b = Math.floor((ex[i] - lo) / w); if (b < 0 || b >= NB) continue; H[b]++; }
    mx = Math.max.apply(null, H.concat([1]));
    var W = 300, Ht = 92, bw = W / NB, z = lo < 0 && hi > 0 ? (0 - lo) / (hi - lo) * W : null;
    var bars = H.map(function(h, k){ var mid = lo + (k + .5) * w, hh = h / mx * (Ht - 4); return '<rect x="' + (k * bw + .6).toFixed(1) + '" y="' + (Ht - hh).toFixed(1) + '" width="' + (bw - 1.2).toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="1.5" class="' + (mid >= 0 ? "u" : "d") + '"/>'; }).join("");
    return '<svg class="mc-h" viewBox="0 0 ' + W + ' ' + (Ht + 18) + '" role="img" aria-label="1만 번 결과 분포">' + bars +
      (z != null ? '<line x1="' + z.toFixed(1) + '" y1="0" x2="' + z.toFixed(1) + '" y2="' + Ht + '" class="z"/><text x="' + z.toFixed(1) + '" y="' + (Ht + 14) + '" text-anchor="middle">0</text>' : '') +
      '<text x="0" y="' + (Ht + 14) + '">' + e(unit === "pp" ? sg(lo, 0) + "%p" : man(lo)) + '</text><text x="' + W + '" y="' + (Ht + 14) + '" text-anchor="end">' + e(unit === "pp" ? sg(hi, 0) + "%p" : man(hi)) + '</text></svg>';
  }
  function body(R, P){
    if (R.kind === "port"){
      return '<div class="mc-big"><small>1년 뒤 S&amp;P500을 이길 확률</small><b class="' + (R.win >= 50 ? "up" : "dn") + '">' + Math.round(R.win) + '%</b><p>💼 기본 포트(S&amp;P 반·나스닥 반 + 금 5% · 200일선·변동성 규칙)를 1년씩 <b>1만 번</b> 굴린 결과예요.</p></div>' +
        '<div class="mc-g"><div><small>보통의 해</small><b class="' + cl(R.med) + '">' + sg(R.med) + '%</b><em>S&amp;P ' + sg(R.smed) + '%</em></div>' +
        '<div><small>운 나쁜 10%</small><b class="' + cl(R.p10) + '">' + sg(R.p10) + '%</b><em>S&amp;P ' + sg(R.sp10) + '%</em></div>' +
        '<div><small>최악 1%</small><b class="' + cl(R.p1) + '">' + sg(R.p1) + '%</b><em>S&amp;P ' + sg(R.sp1) + '%</em></div></div>' +
        '<div class="mc-ht"><small>S&amp;P500보다 몇 %p 더(덜) 벌었나 · 1만 번</small>' + hist(R.ex, "pp") + '</div>' +
        '<ul class="mc-n"><li>✅ 실제로 있었던 모든 1년 구간(' + e(P.from.slice(0, 4)) + '~' + e(P.to.slice(0, 4)) + ')에선 <b>' + (P.real == null ? "–" : Math.round(P.real) + "%") + '</b> 이겼어요 — 1만 번 결과와 비교해 보세요.</li>' +
        '<li>🛡 이 포트의 강점은 「덜 잃기」예요. 보통의 해엔 S&amp;P와 비슷하거나 덜 벌지만, 운 나쁜 해엔 덜 빠져요.</li>' +
        '<li>방법: 2008년부터 실제 하루 수익을 <b>한 달 덩어리째 12개</b> 무작위로 뽑아 1년을 만듦(포트·S&amp;P 같은 덩어리) · 매매 비용 포함 · 세금·환전 비용 제외.</li></ul>';
    }
    var warn = R.nd < 60 ? '<div class="mc-w">⚠️ 아직 <b>' + R.nd + '일치 · ' + R.n + '번</b> 기록뿐이에요. 표본이 적어서 이 숫자는 크게 흔들려요 — 「이런 식으로 재요」 정도로만 보세요.</div>' : '';
    return warn + '<div class="mc-big"><small>1년 동안 신호마다 100만 원씩 ' + R.T + '번 — 돈을 벌 확률</small><b class="' + (R.pos >= 50 ? "up" : "dn") + '">' + Math.round(R.pos) + '%</b><p>앱이 실제로 낸 신호의 <b>5일 뒤 수익(비용 0.3% 뺌)</b>을 무작위로 뽑아 <b>1만 번</b> 굴린 결과예요.</p></div>' +
      '<div class="mc-g"><div><small>가운데</small><b class="' + cl(R.med) + '">' + man(R.med) + '</b><em>48번 합계</em></div>' +
      '<div><small>운 나쁜 10%</small><b class="' + cl(R.p10) + '">' + man(R.p10) + '</b><em>좋은 10% ' + man(R.p90) + '</em></div>' +
      '<div><small>지수보다 나음</small><b class="' + cl((R.win || 0) - 50) + '">' + (R.win == null ? "–" : Math.round(R.win) + "%") + '</b><em>같은 날 지수 대비</em></div></div>' +
      '<div class="mc-ht"><small>같은 날 지수(한국 = 코스피 · 나머지 = S&amp;P500)를 샀을 때보다 · 1만 번</small>' + hist(R.ex, "man") + '</div>' +
      '<ul class="mc-n"><li>실제 기록: ' + R.n + '번 중 <b>' + Math.round(R.wr) + '%</b>가 5일 뒤 플러스 · 평균 <b class="' + cl(R.avg) + '">' + sg(R.avg, 2) + '%</b>(비용 뺀 값)</li>' +
      (R.win != null && R.win - R.pos > 20 ? '<li>⚠️ 이 기간엔 지수 자체가 빠져서 「지수보다 나음」이 높게 나와요. 오른 장에서도 그런지는 기록이 더 쌓여야 알 수 있어요.</li>' : '') +
      '<li>그래서 지금은 이 신호를 ⚡ 공격 포트에 「성과가 확인될 때만」 넣어요. 기록이 쌓일수록 이 카드 숫자가 진짜에 가까워져요.</li>' +
      '<li>방법: 신호 하나 = 그날 종가에 사서 5거래일 뒤 팔기 · 한 번에 100만 원 · 겹쳐 사는 건 따지지 않음(단순화).</li></ul>';
  }
  var LAB = {port: "💼 기본 포트", cup: "☕ 컵 차트", gap: "📈 갭 상승"};
  function paint(box){
    box.innerHTML = '<h3>🎲 1만 번 돌려보기 <span class="mut">실제 기록을 무작위로 다시 뽑기</span></h3>' +
      '<div class="mc-seg">' + Object.keys(LAB).map(function(k){ return '<button type="button" data-mc="' + k + '" class="' + (k === SEL ? "on" : "") + '">' + LAB[k] + '</button>'; }).join("") + '</div>' +
      '<div id="mcb"><div class="loading">1만 번 굴리는 중…</div></div>' +
      '<div class="mc-f"><button type="button" id="mcre">🔁 다시 돌리기</button><small>과거 계산 · 미래 보장 아님 · 사라는 뜻 아님</small></div>';
    [].forEach.call(box.querySelectorAll("[data-mc]"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); SEL = b.dataset.mc; try { localStorage.setItem("mc_sel", SEL); } catch(x) {} paint(box); }; });
    var re = box.querySelector("#mcre"); if (re) re.onclick = function(ev){ ev.stopPropagation(); SEED++; paint(box); };
    var pr = SEL === "port" ? portData() : sigData(SEL);
    pr.then(function(P){
      var b = box.querySelector("#mcb"); if (!b) return;
      if (!P || (P.n != null && P.n < 10)){ b.innerHTML = '<p class="note">자료를 아직 못 불러왔어요. 잠시 뒤 다시 열어 주세요.</p>'; return; }
      setTimeout(function(){ var t0 = Date.now(), R = SEL === "port" ? runPort(P) : runSig(P); b.innerHTML = body(R, P); b.setAttribute("data-ms", String(Date.now() - t0)); }, 30);
    }).catch(function(){ var b = box.querySelector("#mcb"); if (b) b.innerHTML = '<p class="note">계산하지 못했어요.</p>'; });
  }
  function mount(){
    if ((typeof cur === "undefined" ? "" : cur) !== "score") return;
    var m = document.getElementById("main"); if (!m || document.getElementById("mc10k")) return;
    var box = document.createElement("section"); box.className = "card mc no-clp"; box.id = "mc10k"; box.setAttribute("data-xc", "1"); box.setAttribute("data-xs", "keep");
    var hero = m.querySelector(":scope > .hero"); if (hero) hero.insertAdjacentElement("afterend", box); else m.insertBefore(box, m.firstChild);
    paint(box);
  }
  var T = 0;
  new MutationObserver(function(){ if (T) return; T = setTimeout(function(){ T = 0; mount(); }, 120); }).observe(document.documentElement, {childList: true, subtree: true});
  window.mc10k = {runPort: runPort, runSig: runSig, portData: portData, sigData: sigData};

  var css = document.createElement("style");
  css.textContent =
    ".mc-seg{display:flex;gap:6px;margin:0 0 14px;overflow-x:auto;scrollbar-width:none}.mc-seg::-webkit-scrollbar{display:none}" +
    ".mc-seg button{flex:none;font:inherit;font-size:15px;font-weight:700;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--sub)}.mc-seg button.on{background:var(--text);color:var(--bg);border-color:transparent}" +
    ".mc-big small{display:block;font-size:14px;font-weight:700;color:var(--sub)}.mc-big>b{display:block;font-size:clamp(44px,13vw,58px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin:2px 0 6px}.mc-big>b.up{color:var(--up,#f04452)}.mc-big>b.dn{color:var(--down,#3182f6)}.mc-big p b{color:var(--text);font-weight:800}" +
    ".mc-big p{margin:0 0 14px;font-size:15px;line-height:1.55;color:var(--sub);word-break:keep-all}" +
    ".mc-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}.mc-g>div{background:var(--panel2);border-radius:14px;padding:10px 10px 9px;min-width:0}" +
    ".mc-g small{display:block;font-size:13px;color:var(--sub);font-weight:600;line-height:1.3;word-break:keep-all}.mc-g b{display:block;font-size:19px;font-weight:900;letter-spacing:-.6px;margin:3px 0 2px;white-space:nowrap}.mc-g em{display:block;font-style:normal;font-size:13px;color:var(--dim);line-height:1.3;word-break:keep-all}" +
    ".mc-g b.up{color:var(--up,#f04452)}.mc-g b.dn{color:var(--down,#3182f6)}" +
    ".mc-ht small{display:block;font-size:13.5px;color:var(--sub);margin-bottom:4px}.mc-h{width:100%;height:auto;display:block}.mc-h rect.u{fill:var(--up,#f04452);opacity:.85}.mc-h rect.d{fill:var(--down,#3182f6);opacity:.85}.mc-h .z{stroke:var(--text);stroke-width:1.2;stroke-dasharray:3 3}.mc-h text{fill:var(--dim);font-size:11px}" +
    ".mc-n{margin:12px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:var(--sub)}.mc-n li{margin:3px 0}.mc-n b{color:var(--text)}" +
    ".mc-w{background:color-mix(in srgb,#f59f00 14%,var(--panel));border:1px solid color-mix(in srgb,#f59f00 40%,transparent);border-radius:14px;padding:10px 12px;font-size:14px;line-height:1.5;margin-bottom:12px}" +
    ".mc-f{display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap}.mc-f button{font:inherit;font-size:15px;font-weight:800;padding:10px 16px;border-radius:999px;border:0;background:var(--acc,#3182f6);color:#fff}.mc-f small{font-size:13px;color:var(--dim)}";
  document.head.appendChild(css);
})();
;
__bk(59);
/* ======== iconz.js ======== */
/* 🔣 아이콘 풀이 (10/22 사용자 「설정 칸에 아이콘 풀이도 — 모든 아이콘 쉽게 설명」)
   ⚙️ 보기 설정 › 「🔣 아이콘 풀이」 → 아래에서 올라오는 칸(용어 풀이와 같은 모양) · 묶음별 · 위 찾기 칸으로 거르기 */
(function(){
  var G = [
    ["📍 화면 위·아래 버튼", [
      ["🏠", "오늘 — 오늘 꼭 볼 것만 모은 첫 화면"],
      ["🌐", "시장 · 시황 — 매일 아침 시장 전략 리포트"],
      ["🧭", "나침반 — 한국·미국·일본·중국·홍콩 5개 시장을 한눈에"],
      ["🎲", "시장확률 — 다음 장이 오를 확률(아직 검증 중이라 약하게만 말해요)"],
      ["💼", "포트 — 시황대로 투자했다면 얼마 벌었나"],
      ["📊", "성적표 — 앱이 한 말이 맞았는지 채점"],
      ["🎯", "신호 — 고래·컵·갭 같은 종목 신호 모음 (ELS 탭과 「집중」에도 쓰여요)"],
      ["🛍️", "상품 — 채권·펀드·ELS"],
      ["📰", "피드 — 매일 읽는 블로그·텔레그램·뉴스"],
      ["🔍", "종목 검색 — 이름이나 코드로 찾기"],
      ["⭐", "관심 종목 — 별표 해 둔 종목 모아 보기"],
      ["⚙️", "보기 설정 — 화면 밝기·글자 크기·순서 (지금 이 칸)"],
      ["🧒", "조이(Joey) 얼굴 — 어플 안내자. 누르면 그 화면·카드를 설명해 줘요"],
      ["🔴", "CH 옆 작은 점 — 오늘 시장 날씨 색(초록 맑음 · 노랑 흐림 · 빨강 비)"],
      ["⟳", "몇 분 전 — 자료가 마지막으로 바뀐 시각"],
      ["←", "뒤로 — 앞 화면으로"]
    ]],
    ["🎨 색과 표시", [
      ["빨강 숫자", "올랐다 (+)"],
      ["파랑 숫자", "내렸다 (−)"],
      ["회색 밑줄", "누르면 그 화면으로 이동"],
      ["▲ ▼", "올라감 · 내려감 (지난번 본 값과 비교할 때도)"],
      ["🟢", "좋음 · 켬 · 사기 · 상승장"],
      ["🔴", "나쁨 · 끔 · 팔기 · 상승장 아님"],
      ["🟡", "보통 · 절반만 팔기"],
      ["⚪", "중립 · 판단 없음"],
      ["✓ ✅", "맞았다 · 확인됨"],
      ["✗ ❌", "틀렸다 · 기각(써 봤는데 안 됨)"],
      ["⚠️", "주의 — 기준에 못 미치거나 조심할 것"],
      ["⏳", "기다리는 중 · 자료가 늦어짐"],
      ["🆕", "새로 생김"],
      ["👑", "1등"],
      ["▾ ▴", "펼치기 · 접기"],
      ["›", "자세히 보기 · 그 화면으로"]
    ]],
    ["🌤 오늘 날씨와 시간", [
      ["☀️", "맑음 — 크게 오른 날"],
      ["🌤", "구름 조금 — 조금 오른 날"],
      ["☁️ ⛅", "흐림 — 큰 움직임 없음 · 신호가 엇갈림"],
      ["🌧", "비 — 내린 날"],
      ["⛈", "폭풍 — 크게 내린 날"],
      ["🌫", "보류 — 판단할 신호가 적음"],
      ["🌅", "아침판 — 밤사이 미국 + 오늘 볼 것"],
      ["🌞", "장중판 — 지금 한국 장"],
      ["🌆", "저녁판 — 오늘 마감 + 내일 확률"],
      ["🌙", "밤판 — 미국 장"],
      ["🗓", "주말판"]
    ]],
    ["💼 포트", [
      ["💼", "기본 포트 — 시황 배분표대로(S&P500 반 + 나스닥 반이 뼈대)"],
      ["⚡", "공격(킥) 포트 — 기본에 검증된 신호 종목을 조금 섞은 것"],
      ["🎯", "집중 포트 — 오르는 장일 때만 몰아서 담기"],
      ["🙋", "내 포트 — 내가 정한 비중"],
      ["🎛", "설계기 — 비중을 밀면 2008년부터 다시 계산"],
      ["🏁", "경주 · 비교 — 시장(S&P500 등)과 누가 앞서나"],
      ["📋", "따라하기 — 지금 뭘 얼마나 담으면 되나"],
      ["🔁", "비중 바뀐 날"],
      ["🧩", "칸별 — 어느 칸이 벌고 잃었나"],
      ["🦴", "뼈대 · 변동성 맞춤 — 시장이 많이 흔들리면 주식을 줄임"],
      ["🅿️", "빈 자리 주차 — 신호가 없을 땐 그 돈을 지수에 넣어 둠"],
      ["🛑", "멈춤 — 이 신호가 많이 잃어 한동안 새로 안 삼"],
      ["✂", "반 크기 — 손실이 나서 절반만 삼"],
      ["⛔", "브레이크 — 공격 칸이 많이 빠져 새로 안 삼"]
    ]],
    ["🐋 신호 출처 (종목 앞 작은 표시)", [
      ["🐋", "고래 — 큰 펀드·유명 투자자가 새로 산 종목"],
      ["☕", "컵 — 컵 모양으로 바닥을 다지고 오르려는 차트"],
      ["📈", "갭 — 전날보다 훌쩍 높게 시작해 지키는 종목"],
      ["🤫", "조용한 매집 — 가격은 그대로인데 거래가 늘어남"],
      ["📊", "실적 갭 · 실적 표류 — 실적 발표 뒤 움직임"],
      ["🏔", "신고가 — 52주(1년) 최고가를 새로 씀"],
      ["🩹", "급락 반등 — 크게 빠진 뒤 튀어 오름"],
      ["🔌", "고객사 → 납품사 — 큰 고객이 좋으면 납품하는 회사도"],
      ["🕵", "내부자 매수 — 임원이 자기 돈으로 삼"],
      ["🔗", "선행 — 먼저 움직이는 종목을 따라감"],
      ["🤝", "신호 합의 — 여러 신호에 같이 뜸"],
      ["🌱", "조용한 신고가 — 거래 없이 신고가"],
      ["🏆", "섹터 1등주 · 오늘의 배지"],
      ["🎰 🐸", "거름망 — 너무 튄 종목·불안한 종목 걸러냄"],
      ["📰", "뉴스 없는 갭 (피드 탭에선 뉴스·글)"]
    ]],
    ["🧪 검증 · 정직", [
      ["🧪", "시험 중 — 절반 크기로 먼저 해 봄"],
      ["👻", "그림자 — 실제론 안 사고 「샀다면」만 채점"],
      ["🧾", "정직 계산 · 시도 장부 — 비용까지 뺀 성적, 시험한 조합 수"],
      ["📡", "실측 — 공개된 기준가로 직접 계산"],
      ["🧮", "추정 — 기준가가 없어 비슷한 것으로 계산"],
      ["📷", "사진 값 — 받은 화면 사진 그대로"],
      ["🔮", "예고 — 시황 리포트가 한 예상(다음 날 채점)"],
      ["🗳", "내 표 — 예고에 👍👎 던지기"],
      ["👁", "내 눈 — 내가 「볼 만함」 찍은 종목 성적"],
      ["🌙", "밤 연구 — 매일 밤 규칙을 시험"]
    ]],
    ["🧠 시장 분석", [
      ["🧠 💭", "두뇌 · 지금 생각 — 뉴스·글을 읽고 매시간 고치는 판단"],
      ["🫀", "심리 계기판 — VIX·선물·옵션·신용"],
      ["😱", "공포 · 급락 — 「그날 팔았다면?」"],
      ["🌡️", "체감 온도 — 공포·탐욕"],
      ["🧲", "오늘과 닮은 날 — 과거에 비슷했던 날"],
      ["🔥", "강함 · 과열 (오늘 탭에선 연속 방문)"],
      ["🧊", "계속 약함"],
      ["🍂", "힘 빠지는 중"],
      ["🚀", "박스 돌파"],
      ["🕳", "갭 메움 — 뛴 만큼 다시 내려옴"],
      ["🌉", "미국 밤 → 한국 아침"],
      ["🏛", "연기금 · 프로그램 매매"],
      ["🛰 💵", "선행 지표 · 자금 흐름"],
      ["🪙", "크립토(코인) 공포·탐욕"],
      ["🕸 ⚔ 🚨 💸 🕰", "고래 겹침 · 고래끼리 · 고래 매도 경보 · 고래보다 싸게 · 고래 타임라인"],
      ["🧬", "매집의 생애"],
      ["🌗", "미국 시간외 가격"],
      ["🗺", "섹터 지도"],
      ["📜", "국면 기록"]
    ]],
    ["🛍️ 상품", [
      ["🏦", "채권"],
      ["📦", "펀드"],
      ["🎯", "ELS"],
      ["🔒 🔓", "사모 라인업 잠금 · 열림"],
      ["🎬", "과거 재생 — 2006년부터 매일 가입했다면"],
      ["📌", "담아 두기 — 내 ELS 지금 어디쯤"],
      ["🧺", "구성 엿보기 — 펀드가 담은 종목"],
      ["💵", "달러 상품"]
    ]],
    ["🌏 나라", [
      ["🇰🇷", "한국"], ["🇺🇸", "미국"], ["🇯🇵", "일본"], ["🇨🇳", "중국"], ["🇭🇰", "홍콩"], ["🇧🇷", "브라질"], ["🇦🇺", "호주"], ["🌏", "해외 · 동종주"]
    ]],
    ["🔧 기타 버튼", [
      ["📤", "공유 — 카톡 등으로 보내기"],
      ["🔔", "알림 켜기·끄기"],
      ["💬", "의견함 — 앱에 바라는 점"],
      ["📖", "용어 풀이"],
      ["👆", "카드를 길게 누르면 조이가 요약"],
      ["📅", "날짜 · 일정"],
      ["📝", "기록 · 메모"]
    ]]
  ];
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function open(){
    var old = document.getElementById("icz"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "icz";
    d.innerHTML = '<div class="gl-in"><div class="gl-t"><b>🔣 아이콘 풀이</b><button class="icz-x" aria-label="닫기">✕</button></div>' +
      '<input aria-label="찾기" class="icz-q" type="search" placeholder="찾기 (예: 고래, 빨강, 🧪)">' +
      G.map(function(g){ return '<div class="icz-g"><div class="icz-h">' + e(g[0]) + '</div>' + g[1].map(function(x){ var t = /[가-힣]/.test(x[0]), c = /빨강/.test(x[0]) ? " up" : /파랑/.test(x[0]) ? " dn" : /밑줄/.test(x[0]) ? " ul" : "";
        return '<div class="icz-r"><span class="' + (t ? "t" + c : "") + '">' + (t && c && c !== " ul" ? (c === " up" ? "+2.3%" : "−1.8%") : t && c === " ul" ? "포트 ›" : e(x[0])) + '</span><p>' + (t && c ? "<b>" + e(x[0]) + "</b> — " : "") + e(x[1]) + '</p></div>'; }).join("") + '</div>'; }).join("") +
      '<p class="icz-n">숫자·말은 「사라·팔라」는 뜻이 아니에요.</p></div>';
    d.onclick = function(ev){ if (ev.target === d || ev.target.closest(".icz-x")) d.remove(); };
    var q = d.querySelector(".icz-q");
    q.oninput = function(){ var v = q.value.trim();
      [].forEach.call(d.querySelectorAll(".icz-g"), function(g){ var any = 0;
        [].forEach.call(g.querySelectorAll(".icz-r"), function(r){ var ok = !v || r.textContent.indexOf(v) >= 0; r.style.display = ok ? "" : "none"; if (ok) any = 1; });
        g.style.display = any ? "" : "none"; }); };
    document.body.appendChild(d);
  }
  window.chIcons = open;
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-icons]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); open(); }, true);
  // ⚙️ 보기 설정 칸에 단추 넣기 (📖 용어 풀이 다음)
  function addBtn(){ var g = document.querySelector("#uiset .us-go"); if (!g || g.querySelector("[data-icons]")) return;
    var b = document.createElement("button"); b.setAttribute("data-icons", "1"); b.textContent = "🔣 아이콘 풀이";
    var gl = g.querySelector("[data-gloss]"); g.insertBefore(b, gl ? gl.nextSibling : g.firstChild); }
  new MutationObserver(function(){ if (document.getElementById("uiset")) addBtn(); }).observe(document.documentElement, {childList: true, subtree: true});
  var st = document.createElement("style");
  st.textContent = "#icz{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}" +
    ".icz-q{width:100%;box-sizing:border-box;margin:2px 0 8px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:15px}" +
    ".icz-h{position:sticky;top:-14px;background:var(--panel);font-weight:800;font-size:14px;padding:10px 0 6px;margin-top:6px;border-bottom:1px solid var(--line);z-index:1}" +
    ".icz-r{display:grid;grid-template-columns:76px 1fr;gap:10px;align-items:center;padding:8px 2px;border-bottom:1px dashed var(--line)}.icz-r:last-child{border-bottom:0}" +
    ".icz-r span{font-size:20px;text-align:center;line-height:1.2;word-break:keep-all}.icz-r p{margin:0;font-size:14px;line-height:1.5;color:var(--text)}" +
    ".icz-r span.t{font-size:15px;font-weight:800}.icz-r span.up{color:var(--up)}.icz-r span.dn{color:var(--down)}.icz-r span.ul{color:var(--sub);text-decoration:underline;text-underline-offset:3px;font-weight:600}" +
    ".icz-n{font-size:12.5px;color:var(--sub);margin:12px 0 0;text-align:center}";
  document.head.appendChild(st);
})();
;
__bk(60);
/* ======== today.js ======== */
/* 🏠 오늘 탭 10가지 (10/22 사용자 「오늘 카테고리 더 임팩트·신선·우와·레이아웃·눈에 확 — 다해」)
   ① 🌤 날씨판 — 맨 위 한 장면: 오늘 숫자로 배경·날씨가 바뀌고 꼬마가 그날 표정으로 한마디
   ② 🔥 히어로 숫자 — 지금 가장 중요한 숫자 하나를 크게 + 그날 장중 선을 배경으로 · 「2000년 이후 이만큼 움직인 날 N번」
   ③ ⚡ 카운트업 — 날씨판 숫자가 0 에서 촤르륵
   ④ 🎞 「그날 팔았다면?」 → 세 컷 만화 (숫자 표는 「숫자로 자세히」 접기 안에 그대로)
   ⑤ 🏁 내 포트 경주 트랙 — 기본·공격·집중·S&P 레인 + 하루하루 S&P 이긴 날 점 띠 (선 그래프는 「선으로 보기」)
   ⑥ 🧭 바뀐 것 → 세로 타임라인 · 바뀐 칩은 색이 들어오며 등장
   ⑦ 🌙 시간대별 첫 장면 — 아침(밤사이 미국)·장중(지금 코스피)·저녁(오늘 마감 + 내일 확률)·밤(미국 선물)
   ⑧ 🏆 오늘의 배지 — 어제 S&P 이김 · 예고 적중 · 시장 절반 넘게 앞섬 · 연속 방문
   ⑨ 👆 카드를 길게 누르면 꼬마가 한 줄씩 요약 (window.gdSay · guide.js)
   ⑩ 🎨 색 규칙 — 오름 빨강 · 내림 파랑 · 바로가기는 회색 밑줄 (파랑 = 내림 하나로)
   원칙: 숫자는 자료 그대로(지어내지 않음) · 사라·팔라는 말 없음 · 자료가 없으면 그 칸은 안 보임 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function gj(u, ttl){ return typeof getJSON === "function" ? getJSON(u, {ttl: ttl || 120000}).catch(function(){ return null; }) : Promise.resolve(null); }
  var q2 = function(){ return "?" + Math.floor(Date.now() / 120000); };

  /* ── ⑦ 시간대 ── */
  function slot(){ var t = kst(), m = t.getUTCHours() * 60 + t.getUTCMinutes(), wd = t.getUTCDay();
    if (wd === 0 || wd === 6) return "week";
    if (m >= 6 * 60 && m < 9 * 60) return "morn";
    if (m >= 9 * 60 && m < 15 * 60 + 30) return "day";
    if (m >= 15 * 60 + 30 && m < 22 * 60 + 30) return "eve";
    return "night"; }
  var SLOT = {morn: ["🌅", "아침판"], day: ["🌞", "장중판"], eve: ["🌆", "저녁판"], night: ["🌙", "밤판"], week: ["🗓", "주말판"]};

  /* ── ① 날씨 ── */
  var WX = {
    sun:   {ic: "☀️", w: "맑음",      kid: "img/kid_joy.jpg?v=1", acc: "", say: "기분 좋은 날이에요"},
    part:  {ic: "🌤", w: "구름 조금", kid: "img/kid_thumb.jpg?v=1",  acc: "",   say: "살짝 맑아요"},
    cloud: {ic: "☁️", w: "흐림",      kid: "img/kid_globe.jpg?v=1", acc: "",   say: "큰 움직임 없이 흐려요"},
    rain:  {ic: "🌧", w: "비",        kid: "img/kid_umb.jpg?v=1", acc: "", say: "비가 와요, 서두르지 말아요"},
    storm: {ic: "⛈", w: "폭풍",      kid: "img/kid_worry.jpg?v=1", acc: "⛈", say: "폭풍우예요 — 오늘은 숫자보다 마음을 지켜요"}
  };
  function wxOf(r){ return r == null ? "cloud" : r >= 1.5 ? "sun" : r >= 0.3 ? "part" : r > -0.3 ? "cloud" : r > -1.5 ? "rain" : "storm"; }

  /* ── 자료 ── */
  var KP = null;
  function kospiHist(){
    if (KP) return KP;
    KP = gj("archive/x/port_px/index.json?" + Math.floor(Date.now() / 600000), 600000).then(function(ix){
      var a = ix && ix.assets && ix.assets.KOSPI; if (!a) return null;
      return gj("archive/x/port_px/" + a.f + "?" + String(a.at || "").replace(/\D/g, ""), 3600e3);
    }).then(function(j){
      if (!j || !j.dd) return null;
      var c = j.c.map(Number), rs = [];
      for (var i = 1; i < c.length; i++) rs.push((c[i] / c[i - 1] - 1) * 100);
      return {rs: rs, from: String(j.d0).slice(0, 4)};
    }).catch(function(){ return null; });
    return KP;
  }
  function load(){
    return Promise.all([gj(RAW + "home.json" + q2()), gj("archive/x/live_kr.json" + q2()), gj("archive/x/live_us_pre.json" + q2()), gj("archive/x/prob.json" + q2()), kospiHist()]);
  }

  /* ── ①②⑦ 장면 고르기 ── */
  function scene(H, LK, US, PB){
    var s = slot(), P = (H && H.port) || {}, td = today();
    var kr = LK && LK.date === td ? (LK.index || []).filter(function(x){ return x.name === "코스피"; })[0] : null;
    var kq = LK && LK.date === td ? (LK.index || []).filter(function(x){ return x.name === "코스닥"; })[0] : null;
    var es = US && US.date === td ? (US.fut || []).filter(function(x){ return x.s === "ES=F"; })[0] : null;
    var krp = PB && PB.markets && PB.markets.KR;
    var S = {slot: s, P: P, kr: kr, kq: kq, es: es};
    // 큰 숫자 하나
    if (s === "day" && kr) S.big = {lab: "🇰🇷 지금 코스피", sh: "지금 코스피", v: kr.chg, krx: 1, sub: (LK.up != null ? "오른 종목 " + Math.round(LK.up / Math.max(1, LK.total) * 100) + "%" : "") + " · " + e(LK.t) + " 기준"};
    else if (s === "eve" && kr) S.big = {lab: "🇰🇷 오늘 코스피 마감", sh: "코스피 마감", v: kr.chg, krx: 1, sub: kq ? "코스닥 " + sg(kq.chg, 1) + "%" : ""};
    else if ((s === "night" || s === "eve") && es) S.big = {lab: "🇺🇸 S&P500 선물", sh: "S&P 선물", v: es.chg, sub: "미국 장 열기 전 · " + e(US.t) + " 기준"};
    else if (P.d1_spy != null) S.big = {lab: "🇺🇸 밤사이 S&P500", sh: "밤사이 S&P", v: P.d1_spy, sub: md(P.d1_date) + " 미국 종가"};
    else if (kr) S.big = {lab: "🇰🇷 코스피", sh: "코스피", v: kr.chg, krx: 1, sub: ""};
    S.wx = wxOf(S.big ? S.big.v : null);
    // 장중 선 (코스피 등락 % — snaps 네 번째 칸)
    S.line = LK && LK.date === td && (LK.snaps || []).length > 3 ? LK.snaps.map(function(x){ return +x[3]; }).filter(function(v){ return !isNaN(v); }) : null;
    // 내일 확률(저녁·주말) — 실전 성적이 쌓이기 전이라 말은 약하게
    if ((s === "eve" || s === "week") && krp && krp.p1 != null){
      var hit = PB.score && PB.score.all && PB.score.all.d1 ? PB.score.all.d1.hit : null;
      S.prob = {p: Math.round(krp.p1 * 100), tone: krp.tone1 || "", day: nextLab(krp.next_day), hit: hit, weak: hit != null && hit < 50}; }
    // 꼬마 한마디
    var W = WX[S.wx], b = S.big;
    var lead = s === "morn" ? "좋은 아침이에요! " : s === "eve" ? "오늘 장 끝! " : s === "night" ? "밤이에요 🌙 " : s === "week" ? "주말이에요 🗓 " : "";
    S.say = lead + (b ? b.sh + " " + sg(b.v, 1) + "% · " : "") + W.say;
    if (s === "morn" && (H.focus || []).length) S.say2 = "오늘 볼 곳: " + H.focus.map(function(t){ return t.name; }).slice(0, 2).join(" · ");
    else if (S.prob && (S.prob.p >= 85 || S.prob.p <= 15)) S.say2 = S.prob.day + " 코스피 확률은 극단값 — 오늘은 참고하지 않아요";   // 🎲 11/10 #2
    else if (S.prob && !S.prob.weak) S.say2 = S.prob.day + " 코스피 오를 확률 " + S.prob.p + "% (" + S.prob.tone + " · 아직 검증 중)";
    else if (S.prob) S.say2 = S.prob.day + " 코스피는 " + S.prob.tone + " · 실전 적중 " + Math.round(S.prob.hit) + "%라 참고만";   // 10/31 A4: 성적 낮을 땐 숫자 빼고 회색으로
    return S;
  }

  /* 10/31 A2: 「내일」이 주말·휴장이면 실제 다음 장 요일로 */
  function nextLab(nd){
    if (!nd) return "다음 장";
    var t = Date.parse(today() + "T00:00:00Z"), n = Date.parse(nd + "T00:00:00Z");
    if (isNaN(n)) return "다음 장";
    var dd = Math.round((n - t) / 864e5);
    if (dd === 1) return "내일";
    if (dd === 0) return "오늘";
    return ["일", "월", "화", "수", "목", "금", "토"][new Date(n).getUTCDay()] + "요일(" + nd.slice(5).replace("-", "/") + ")";
  }

  /* ── ⑧ 배지 ── */
  function streak(){
    var V = ls("td_visits") || [], d = today();
    if (V[V.length - 1] !== d){ V.push(d); V = V.slice(-60); ls("td_visits", V); }
    var n = 1, t = Date.parse(d + "T00:00:00Z");
    for (var i = V.length - 2; i >= 0; i--){ t -= 864e5; var dd = new Date(t).toISOString().slice(0, 10);
      while (new Date(t).getUTCDay() === 0 || new Date(t).getUTCDay() === 6){ if (V[i] === dd) break; t -= 864e5; dd = new Date(t).toISOString().slice(0, 10); }
      if (V[i] === dd) n++; else break; }
    return n;
  }
  function badges(H){
    var P = (H && H.port) || {}, G = H && H.grade, out = [];
    if (P.d1 != null && P.d1_spy != null && P.d1 > P.d1_spy) out.push(["🏆", "어제 S&P 이김", "내 포트(기본) " + sg(P.d1, 2) + "% vs S&P " + sg(P.d1_spy, 2) + "% (" + md(P.d1_date) + ")"]);
    if (G && (G.items || []).length){ var ok = G.items.filter(function(x){ return x.cls === "ok"; }).length, n = G.items.filter(function(x){ return x.cls === "ok" || x.cls === "no"; }).length;
      if (n && ok / n >= 0.6) out.push(["🎯", "예고 " + ok + "/" + n + " 적중", md(G.prev || G.date) + " 시황 예고 채점"]); }
    if (P.n_bench && P.beat_kick != null && P.beat_kick * 2 > P.n_bench) out.push(["📈", "시장 " + P.n_bench + "곳 중 " + P.beat_kick + "곳 앞섬", md(P.start) + "부터 · 공격(킥) 기준"]);
    var st = streak(); if (st >= 2) out.push(["🔥", st + "일 연속", "평일 기준 연속으로 앱을 연 날"]);
    return out.slice(0, 3);
  }

  /* ── ② 장중 선 배경 svg ── */
  function bgLine(L){
    if (!L || L.length < 4) return "";
    var mn = Math.min.apply(null, L.concat([0])), mx = Math.max.apply(null, L.concat([0])), r = (mx - mn) || 1, W = 300, Hh = 90;
    var pts = L.map(function(v, i){ return (i / (L.length - 1) * W).toFixed(1) + "," + (8 + (mx - v) / r * (Hh - 16)).toFixed(1); }).join(" ");
    var z = (8 + mx / r * (Hh - 16)).toFixed(1);
    return '<svg class="tz-bg" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + z + '" y2="' + z + '" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>' +
      '<polyline points="0,' + Hh + ' ' + pts + ' ' + W + ',' + Hh + '" fill="rgba(255,255,255,.10)" stroke="none"/><polyline class="tz-bgl" points="' + pts + '" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
  }

  /* ── ①② 날씨판 그리기 ── */
  function rankLine(S, K){
    var b = S.big; if (!b || !b.krx || !K || Math.abs(b.v) < 1.5) return "";
    var r = b.v, n = K.rs.filter(function(x){ return r < 0 ? x <= r : x >= r; }).length, pct = n / K.rs.length * 100;
    return '<div class="tz-rank">' + K.from + '년 이후 하루 ' + Math.abs(r).toFixed(1) + '% 넘게 ' + (r < 0 ? "빠진" : "오른") + ' 날 <b>' + n + '번</b> · 상위 ' + (pct < 1 ? pct.toFixed(1) : Math.round(pct)) + '%</div>';
  }
  function hero(H, LK, US, PB, K){
    var S = scene(H, LK, US, PB), W = WX[S.wx], P = S.P, sl = SLOT[S.slot], b = S.big;
    var mini = [];
    if (S.kr && !(b && b.krx)) mini.push(["🇰🇷 코스피", S.kr.chg, S.kr.status === "CLOSE" ? "마감" : "지금"]);   // 10/31 A2: 큰 숫자와 같은 건 작은 칸에서 뺌
    var bigUS = b && /S&P/.test(b.sh || "");
    if (S.es && S.slot !== "morn" && S.slot !== "week" && !/선물/.test(b && b.sh || "")) mini.push(["🇺🇸 S&P 선물", S.es.chg, "지금"]);
    else if (P.d1_spy != null && !bigUS) mini.push(["🇺🇸 S&P500", P.d1_spy, md(P.d1_date)]);
    if (bigUS && P.d1_qqq != null) mini.push(["🇺🇸 나스닥", P.d1_qqq, md(P.d1_date)]);
    if (P.d1 != null) mini.push(["💼 내 포트", P.d1, md(P.d1_date)]);
    var BG = badges(H);
    var rw = !!(b && b.krx && S.line && S.line.length >= 4);   // 🎞 되감기 (A10/30-3)
    var h = '<div class="tz-sky ' + S.wx + (rw ? ' tz-rwok' : '') + '">' + (S.wx === "rain" || S.wx === "storm" ? '<i class="tz-rain" aria-hidden="true"></i>' : S.wx === "sun" ? '<i class="tz-sun" aria-hidden="true"></i>' : '') + bgLine(S.line) +
      '<div class="tz-top"><span class="tz-wx">' + W.ic + ' <b>' + W.w + '</b></span><span class="tz-sl">' + sl[0] + ' ' + sl[1] + '</span></div>' +
      '<div class="tz-main">' +
        '<div class="tz-kid" style="background-image:url(' + (S.slot === "night" && S.wx !== "storm" ? "img/kid_night.jpg?v=1" : W.kid) + ')"' + ' aria-hidden="true">' + (W.acc ? '<i>' + W.acc + '</i>' : '') + '</div>' +
        '<div class="tz-num">' + (b ? '<small>' + e(b.lab) + '</small><b class="tz-cnt" data-v="' + b.v + '">' + sg(b.v, 2) + '%</b><em>' + e(b.sub || "") + '</em>' : '<small>오늘</small><b>–</b>') + '</div>' +
      '</div>' +
      rankLine(S, K) +
      '<div class="tz-say"><b>' + e(S.say) + '</b>' + (S.say2 ? '<small>' + e(S.say2) + '</small>' : '') + '</div>' +
      (mini.length ? '<div class="tz-mini">' + mini.map(function(m){ return '<div><small>' + m[0] + '</small><b class="tz-cnt" data-v="' + m[1] + '">' + sg(m[1], 2) + '%</b><em>' + e(m[2]) + '</em></div>'; }).join("") + '</div>' : '') +
      (BG.length ? '<div class="tz-bdg">' + BG.map(function(x){ return '<span title="' + e(x[2]) + '" data-why="' + e(x[2]) + '">' + x[0] + ' ' + e(x[1]) + '</span>'; }).join("") + '</div>' : '') +
      '<div class="tz-hint">' + (rw ? '⏪ 카드를 옆으로 밀면 오늘 하루가 되감겨요' : '👆 카드를 길게 누르면 조이가 요약해 줘요') + '</div>' +
    '</div>';
    return h;
  }
  /* ── 🎞 오늘 하루 되감기 (A10/30-3 · 10/30 사용자 「1,3번 진행해」) ──
     장중 선이 깔린 큰 카드를 옆으로 밀면 그 시각(10분마다 저장된 snaps)의 코스피 % · 오른/내린 종목 수 · 코스닥 · 가장 센/약한 업종으로 바뀜
     손을 떼면 지금으로 돌아옴 · 세로로 움직이면 그냥 스크롤 · 숫자는 live_kr.json snaps 그대로(지어내지 않음) */
  var RWX = 0;
  function rewind(d, LK){
    var sky = d.querySelector(".tz-sky.tz-rwok"); if (!sky || !LK || LK.date !== today()) return;
    var sn = (LK.snaps || []).filter(function(x){ return x && x[3] != null && !isNaN(+x[3]); }); if (sn.length < 4) return;
    var nb = sky.querySelector(".tz-num b"), lab = sky.querySelector(".tz-num small"), sub = sky.querySelector(".tz-num em"); if (!nb || !lab) return;
    var L = sn.map(function(x){ return +x[3]; }), mn = Math.min.apply(null, L.concat([0])), mx = Math.max.apply(null, L.concat([0])), rr = (mx - mn) || 1, last = sn[sn.length - 1];
    var cur = document.createElement("i"); cur.className = "tz-rwc"; cur.innerHTML = '<i class="tz-rwd"></i>'; sky.appendChild(cur);
    var tip = document.createElement("div"); tip.className = "tz-rwt"; sky.appendChild(tip);
    var o = null, st = null, idx = -1;
    function show(i){
      if (i === idx) return; idx = i; var s = sn[i], v = +s[3], n = sn.length;
      if (!o) o = {nb: nb.textContent, nc: nb.className, lab: lab.innerHTML, sub: sub ? sub.innerHTML : ""};
      nb.textContent = sg(v, 2) + "%"; nb.className = "tz-cnt " + cl(v);
      lab.textContent = "⏪ " + s[0] + " 코스피";
      var tot = (+s[1] || 0) + (+s[2] || 0);
      if (sub) sub.textContent = "오른 종목 " + s[1] + " · 내린 " + s[2] + (tot ? " (오른 비율 " + Math.round(s[1] / tot * 100) + "%)" : "") + " · 코스닥 " + sg(+s[4], 1) + "%";
      var x = n > 1 ? i / (n - 1) * 100 : 50, y = 58 + (8 + (mx - v) / rr * 74) / 90 * 42;
      cur.style.left = x + "%"; cur.firstChild.style.top = y + "%"; sky.classList.add("tz-rwon");
      var aft = +last[3] - v;
      tip.innerHTML = (s[5] ? '<span>🔥 ' + e(s[5]) + ' <b>' + sg(+s[6], 1) + '%</b></span><span>🧊 ' + e(s[7]) + ' <b>' + sg(+s[8], 1) + '%</b></span>' : '') +
        (i < n - 1 ? '<span>그 뒤 ' + e(last[0]) + '까지 <b>' + sg(aft, 1) + '%p</b></span>' : '<span>지금</span>');
      try { navigator.vibrate && navigator.vibrate(4); } catch(z) {}
    }
    function back(){ if (!o) return; nb.textContent = o.nb; nb.className = o.nc; lab.innerHTML = o.lab; if (sub) sub.innerHTML = o.sub; o = null; idx = -1; sky.classList.remove("tz-rwon"); }
    function at(ev){ var r = sky.getBoundingClientRect(), f = Math.max(0, Math.min(1, (ev.clientX - r.left) / (r.width || 1))); return Math.round(f * (sn.length - 1)); }
    sky.addEventListener("pointerdown", function(ev){ if (ev.button > 0) return; st = {x: ev.clientX, y: ev.clientY, m: null, id: ev.pointerId}; });
    sky.addEventListener("pointermove", function(ev){
      if (!st || ev.pointerId !== st.id) return;
      var dx = ev.clientX - st.x, dy = ev.clientY - st.y;
      if (!st.m){ if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)){ st.m = "rw"; try { sky.setPointerCapture(ev.pointerId); } catch(z) {} } else if (Math.abs(dy) > 12){ st = null; return; } }
      if (st.m === "rw"){ ev.preventDefault(); show(at(ev)); }
    });
    function end(ev){ if (st && st.m === "rw"){ RWX = Date.now(); setTimeout(back, 900); } st = null; }
    sky.addEventListener("pointerup", end); sky.addEventListener("pointercancel", end);
  }

  /* ── ③ 카운트업 ── */
  function countUp(root){
    [].forEach.call(root.querySelectorAll(".tz-cnt:not([data-done])"), function(el){
      el.setAttribute("data-done", "1");
      var v = parseFloat(el.dataset.v); if (isNaN(v) || RM) return;
      var t0 = null, dur = 900;
      (function step(ts){ if (!document.body.contains(el)) return; if (t0 == null) t0 = ts;
        var q = Math.min(1, (ts - t0) / dur), ez = 1 - Math.pow(1 - q, 3);
        el.textContent = sg(v * ez, 2) + "%"; el.className = "tz-cnt " + cl(v);
        if (q < 1) requestAnimationFrame(step); })(performance.now());
    });
  }

  /* ── ④ 세 컷 만화 ── */
  function comic(){
    var s = document.getElementById("hmpanic"); if (!s || s.dataset.td) return;
    var h = s.querySelector(".pnh-h b"), r1 = s.querySelector(".pnh-r:not(.pnh-b):not(.pnh-now)"), rn = s.querySelector(".pnh-now"), rb = s.querySelector(".pnh-b"); if (!h || !r1) return;
    s.dataset.td = "1";
    var tt = h.textContent.replace(/^😱\s*/, "").split(" — ")[0];
    var c1 = r1.children, lab1 = c1[0] ? c1[0].textContent : "", v1 = c1[1] ? c1[1].textContent : "", n1 = c1[2] ? c1[2].textContent : "";
    var vb = rb && rb.children[1] ? rb.children[1].textContent : null, lb = rb && rb.children[0] ? rb.children[0].textContent.replace(/^↔\s*반대로\s*/, "") : "";
    var keep = document.createElement("details"); keep.className = "tz-raw";
    keep.innerHTML = '<summary>숫자로 자세히 ▾</summary>';
    var czh = s.querySelector(':scope > .cz-h'), czf = s.querySelector(':scope > .cz-f');   // 🔧 11/17 🩺 「#home 빈 카드 hmpanic」 — 접기(calm.js)가 먼저 붙인 제목 줄까지 「숫자로 자세히」 속에 넣어 접힌 카드가 빈 칸으로 보이던 것 → 제목 줄·접기 단추는 밖에 둠
    if (czh) czh.remove(); if (czf) czf.remove();
    while (s.firstChild) keep.appendChild(s.firstChild);
    var pan = function(img, cap, big, cls_, small){ return '<div class="tz-pan"><div class="tz-pk" style="background-image:url(' + img + ')"></div><div class="tz-pt"><small>' + cap + '</small><b class="' + (cls_ || "") + '">' + big + '</b>' + (small ? '<em>' + small + '</em>' : '') + '</div></div>'; };
    var neg1 = /^−|^-/.test(v1.trim());
    s.insertAdjacentHTML("afterbegin", '<div class="tz-ch"><b>🎞 ' + e(tt) + ' — 그날 팔았다면?</b><small>2000년 이후 같은 급락일로 되짚은 세 컷</small></div>' +
      '<div class="tz-comic">' +
        pan("img/kid_worry.jpg?v=1", "① " + e(tt.replace(/\s*[−-][\d.]+%.*$/, "")), e((tt.match(/[−-][\d.]+%/) || [""])[0]), "dn", "😱 깜짝 놀라 팔고 싶어져요") +
        pan("img/kid_piggy.jpg?v=1", "② 팔고 " + e(lab1.replace(/\s*뒤\s*돌아옴$/, "")) + " 뒤 돌아왔다면", e(v1), neg1 ? "dn" : "up", e(n1) + (neg1 ? " — 놓친 몫" : "")) +
        (vb ? pan(/^\+/.test(vb) ? "img/kid_joy.jpg?v=1" : "img/kid_umb.jpg?v=1", "③ 반대로 " + e(lb.replace(/\s*\d+거래일 뒤$/, "")), e(vb), /^\+/.test(vb) ? "up" : "dn", "120거래일 뒤 평균") : "") +
      '</div>' +
      (rn ? '<div class="tz-now">' + e(rn.children[0] ? rn.children[0].textContent : "") + (rn.children[1] && rn.children[1].tagName === "B" ? '<br>과거엔 120거래일 뒤 평균 <b class="' + rn.children[1].className + '">' + e(rn.children[1].textContent) + '</b>' + (rn.children[2] ? '<small>' + e(rn.children[2].textContent.replace(/ · 120거래일 뒤 평균/, "")) + '</small>' : '') : '') + '</div>' : ''));
    s.appendChild(keep); if (czh) s.insertBefore(czh, s.firstChild); if (czf) s.appendChild(czf);
    keep.addEventListener("click", function(ev){ ev.stopPropagation(); }, true);
  }

  /* ── ⑤ 경주 트랙 ── */
  function race(H){
    var c = document.querySelector('#hmbody section.hm-c[data-goto^="port"]'); if (!c || c.querySelector(".tz-race")) return;
    var P = (H && H.port) || {}, sp = c.querySelector(".hm-sp");
    var L = [["기본", P.base, "#e9b949"], ["공격(킥)", P.kick, "#ff6b6b"], ["집중", P.conc, "#4dd47a"], ["S&P500", P.spy, "#7c9cff"]].filter(function(x){ return x[1] != null; });
    if (L.length < 2) return;
    var vs = L.map(function(x){ return x[1]; }).concat([0]), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), pad = (mx - mn) * 0.12 || 1;
    mn -= pad; mx += pad;
    var X = function(v){ return (v - mn) / (mx - mn) * 100; }, top = Math.max.apply(null, L.map(function(x){ return x[1]; }));
    var dots = "", nW = 0, nT = 0;
    var nav = P.nav || [], spl = P.spy_line || [];
    for (var i = 1; i < Math.min(nav.length, spl.length); i++){ var a = nav[i] - nav[i - 1], b = spl[i] - spl[i - 1], w = a > b; nT++; if (w) nW++; dots += '<i class="' + (w ? "w" : "l") + '"></i>'; }
    var gap = P.base != null && P.spy != null ? P.base - P.spy : null;
    var el = document.createElement("div"); el.className = "tz-race";
    el.innerHTML = '<div class="tz-rh"><b>🏁 ' + md(P.start) + '부터 경주</b>' + (gap != null ? '<span class="' + cl(gap) + '">기본이 S&P보다 ' + sg(gap, 1) + '%p</span>' : '') + '</div>' +
      L.map(function(x){ var me = x[0] !== "S&P500";
        return '<div class="tz-ln"><span class="tz-lb">' + x[0] + '</span><div class="tz-tk"><i class="tz-z" style="left:' + X(0).toFixed(1) + '%"></i><i class="tz-rn' + (me ? " me" : "") + '" data-x="' + X(x[1]).toFixed(1) + '" style="left:' + X(0).toFixed(1) + '%;--c:' + x[2] + '">' + (x[1] === top ? "👑" : "") + '</i></div><b class="' + cl(x[1]) + '">' + sg(x[1], 2) + '%</b></div>'; }).join("") +
      (nT ? '<div class="tz-dw"><small>하루하루 S&P와 승부 — <b>' + nT + '일 중 ' + nW + '일</b> 이김</small><div>' + dots + '</div></div>' : '') +
      (sp ? '<button type="button" class="tz-tg">선으로 보기 ▾</button>' : '');
    if (sp){ sp.parentNode.insertBefore(el, sp); sp.classList.add("tzx-hide"); }
    else c.appendChild(el);
    var tg = el.querySelector(".tz-tg"); if (tg) tg.onclick = function(ev){ ev.stopPropagation(); ev.preventDefault(); var o = sp.classList.toggle("tzx-hide"); tg.textContent = o ? "선으로 보기 ▾" : "선 접기 ▴"; };
    requestAnimationFrame(function(){ setTimeout(function(){ [].forEach.call(el.querySelectorAll(".tz-rn"), function(r){ r.style.left = r.dataset.x + "%"; }); }, 60); });
  }

  /* ── ⑥ 바뀐 것 타임라인 ── */
  function timeline(){ var c = document.querySelector("#hmbody .hm-chg"); if (c && !c.classList.contains("tz-tl")) c.classList.add("tz-tl"); }

  /* ── ⑨ 길게 누르면 꼬마 요약 ── */
  var LP = {t: null, x: 0, y: 0, el: null, fired: 0};
  function summary(card){
    var tEl = card.querySelector(".hm-h b, .pl-h small, .tz-ch b, h3"), title = tEl ? tEl.textContent.replace(/\s+/g, " ").trim() : "이 카드";
    var seen = {}, lines = [];
    String(card.innerText || "").split("\n").forEach(function(l){ l = l.replace(/\s+/g, " ").replace(/[›▾▴]/g, "").trim();
      if (!l || l.length < 4 || seen[l] || l === title || /^(열기|자세히|포트|시황|숫자로 자세히|선으로 보기|선 접기)$/.test(l)) return; seen[l] = 1; lines.push(l); });
    var withNum = lines.filter(function(l){ return /[\d%]/.test(l); }), rest = lines.filter(function(l){ return !/[\d%]/.test(l); });
    var L = withNum.slice(0, 4).concat(rest.slice(0, 2));
    // 짧은 조각(라벨·숫자)은 앞 줄에 붙여 한 문장처럼
    var out = []; L.forEach(function(l){ if (out.length && l.length <= 10) out[out.length - 1] += " · " + l; else out.push(l); });
    return {title: "👆 " + title + " — 요약", lines: out.slice(0, 5)};
  }
  function lpStart(ev){
    var c = ev.target.closest && ev.target.closest("#hmbody section.card"); if (!c || ev.button > 0) return;
    LP.el = c; LP.x = ev.clientX; LP.y = ev.clientY; LP.fired = 0; clearTimeout(LP.t);
    LP.t = setTimeout(function(){ if (!LP.el) return; LP.fired = Date.now(); try { navigator.vibrate && navigator.vibrate(12); } catch(x) {}
      var s = summary(LP.el); if (window.gdSay && s.lines.length) gdSay(s.title, s.lines, "", "img/kid_thumb.jpg?v=1"); LP.el = null; }, 550);
  }
  function lpCancel(ev){ if (!LP.el) return; if (ev && ev.type === "pointermove" && Math.abs(ev.clientX - LP.x) < 10 && Math.abs(ev.clientY - LP.y) < 10) return; clearTimeout(LP.t); LP.el = null; }
  document.addEventListener("pointerdown", lpStart, true);
  ["pointermove", "pointerup", "pointercancel", "scroll"].forEach(function(t){ document.addEventListener(t, lpCancel, true); });
  document.addEventListener("click", function(ev){ if (LP.fired && Date.now() - LP.fired < 800 && ev.target.closest && ev.target.closest("#hmbody")){ ev.stopImmediatePropagation(); ev.preventDefault(); LP.fired = 0; } }, true);
  document.addEventListener("contextmenu", function(ev){ if (ev.target.closest && ev.target.closest("#hmbody section.card")) ev.preventDefault(); }, true);

  /* ── 붙이기 ── */
  var busy = 0, H0 = null, stamp = 0;
  function apply(){
    var b = document.getElementById("hmbody"); if (!b || busy) return;
    timeline(); comic();
    if (H0) race(H0);
    if (document.getElementById("tdhero") && Date.now() - stamp < 120000) return;
    if (!b.querySelector("section.card")) return;
    busy = 1;
    load().then(function(a){
      busy = 0; stamp = Date.now(); H0 = a[0] || H0;
      var b2 = document.getElementById("hmbody"); if (!b2) return;
      var old = document.getElementById("tdhero"), d = document.createElement("div"); d.id = "tdhero"; d.className = "tz-hero"; d.setAttribute("role", "button");
      d.innerHTML = hero(a[0] || {}, a[1], a[2], a[3], a[4]);
      if (old) old.replaceWith(d); else b2.insertBefore(d, b2.firstChild);
      d.onclick = function(ev){ var bd = ev.target.closest && ev.target.closest(".tz-bdg span"); ev.stopPropagation();
        if (Date.now() - RWX < 700) return;   // 되감기 손을 뗀 직후의 눌림은 무시
        if (bd){ if (window.gdSay) gdSay("🏆 오늘의 배지", [bd.textContent, bd.dataset.why], "", "img/kid_gift.jpg?v=1"); return; }
        if (window.goTo) goTo("market", "live"); else if (window.go) go("market"); };
      countUp(d); try { rewind(d, a[1]); } catch(z) {} if (H0) race(H0);
    }, function(){ busy = 0; });
  }
  var tm = null;
  new MutationObserver(function(){ if (tm) return; tm = setTimeout(function(){ tm = null; if (window.cur === "home" || document.getElementById("hmbody")) apply(); }, 150); })
    .observe(document.documentElement, {childList: true, subtree: true});

  /* ── 모양 ── */
  var css = document.createElement("style");
  css.textContent =
    // ① 날씨판
    ".tz-hero{margin:4px 0 14px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".tz-sky{position:relative;overflow:hidden;border-radius:26px;padding:16px 18px 14px;color:#fff;box-shadow:0 10px 30px rgba(20,30,60,.18);isolation:isolate}" +
    ".tz-sky.sun{background:linear-gradient(155deg,#ffb347 0%,#ff7e5f 55%,#e8557a 100%)}" +
    ".tz-sky.part{background:linear-gradient(155deg,#56ccf2 0%,#2f80ed 100%)}" +
    ".tz-sky.cloud{background:linear-gradient(155deg,#94a3b8 0%,#5b6b80 100%)}" +
    ".tz-sky.rain{background:linear-gradient(160deg,#4b6cb7 0%,#1e2f5c 100%)}" +
    ".tz-sky.storm{background:linear-gradient(160deg,#3a3f5c 0%,#14172b 100%)}" +
    ".tz-bg{position:absolute;left:0;right:0;bottom:0;width:100%;height:42%;z-index:-1;opacity:.45}" +
    ".tz-bgl{stroke-dasharray:1200;stroke-dashoffset:1200;animation:tdDraw 1.6s ease-out .2s forwards}@keyframes tdDraw{to{stroke-dashoffset:0}}" +
    ".tz-rain{position:absolute;inset:-40px 0 0;z-index:-1;background:repeating-linear-gradient(105deg,rgba(255,255,255,.0) 0 14px,rgba(255,255,255,.16) 14px 15px);animation:tdRain .7s linear infinite;opacity:.8}" +
    "@keyframes tdRain{from{transform:translateY(-20px)}to{transform:translateY(20px)}}" +
    ".tz-sky.storm:after{content:'';position:absolute;inset:0;z-index:-1;background:#fff;opacity:0;animation:tdFlash 6s infinite}@keyframes tdFlash{0%,92%,100%{opacity:0}93%{opacity:.35}94%{opacity:0}95%{opacity:.2}}" +
    ".tz-sun{position:absolute;right:-60px;top:-60px;width:200px;height:200px;z-index:-1;border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.22) 0 8deg,transparent 8deg 22deg);animation:tdSpin 30s linear infinite}@keyframes tdSpin{to{transform:rotate(360deg)}}" +
    ".tz-top{display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:.95}.tz-wx b{font-weight:800}.tz-sl{background:rgba(255,255,255,.18);padding:3px 10px;border-radius:999px;font-weight:700}" +
    ".tz-main{display:flex;align-items:center;gap:14px;margin-top:10px}" +
    ".tz-kid{flex:none;width:86px;height:110px;border-radius:20px;background:#f3e6d6 center top/cover no-repeat;box-shadow:0 6px 18px rgba(0,0,0,.25);position:relative;animation:tdHop 2.6s ease-in-out infinite}" +
    ".tz-kid i{position:absolute;right:-10px;top:-12px;font-size:30px;font-style:normal;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}" +
    "@keyframes tdHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}" +
    ".tz-num{min-width:0}.tz-num small{display:block;font-size:13px;opacity:.9;font-weight:700}" +
    ".tz-num b{display:block;font-size:52px;line-height:1.05;font-weight:900;letter-spacing:-2px;font-variant-numeric:tabular-nums;color:#fff!important;text-shadow:0 3px 14px rgba(0,0,0,.25)}" +
    ".tz-num em{display:block;font-style:normal;font-size:12.5px;opacity:.85;margin-top:2px}" +
    ".tz-rank{margin-top:10px;font-size:13px;background:rgba(0,0,0,.18);border-radius:12px;padding:7px 11px;display:inline-block}.tz-rank b{font-weight:900}" +
    ".tz-say{margin-top:10px;background:rgba(255,255,255,.95);color:#1d2433;border-radius:16px 16px 16px 4px;padding:10px 13px;font-size:15px;line-height:1.45;box-shadow:0 4px 14px rgba(0,0,0,.12)}.tz-say b{font-weight:800}.tz-say small{display:block;color:#5d667a;font-size:12.5px;margin-top:3px}" +
    ".tz-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.tz-mini div{background:rgba(255,255,255,.14);border-radius:14px;padding:8px 10px;min-width:0}" +
    ".tz-mini small{display:block;font-size:12.5px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tz-mini b{display:block;font-size:20px;font-weight:900;color:#fff!important;font-variant-numeric:tabular-nums;letter-spacing:-.5px}.tz-mini em{font-style:normal;font-size:12.5px;opacity:.8}" +
    ".tz-bdg{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.tz-bdg span{background:rgba(255,255,255,.95);color:#1d2433;border-radius:999px;padding:5px 11px;font-size:12.5px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.12);animation:tdPop .5s cubic-bezier(.2,1.6,.4,1) both}" +
    ".tz-bdg span:nth-child(2){animation-delay:.12s}.tz-bdg span:nth-child(3){animation-delay:.24s}@keyframes tdPop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}" +
    ".tz-hint{margin-top:9px;font-size:12.5px;opacity:.75;text-align:right}" +
    ".tz-sky.tz-rwok{touch-action:pan-y;-webkit-user-select:none;user-select:none}" +
    ".tz-rwc{position:absolute;top:0;bottom:0;width:0;border-left:1.5px dashed rgba(255,255,255,.85);z-index:2;pointer-events:none;display:none}.tz-rwd{position:absolute;left:-6px;width:11px;height:11px;margin-top:-5px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.35)}" +
    ".tz-rwt{position:absolute;top:8px;left:10px;right:10px;z-index:3;pointer-events:none;display:none;flex-wrap:wrap;gap:2px 10px;background:rgba(10,14,30,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:10px;padding:6px 9px;font-size:11.5px;line-height:1.35}.tz-rwt b{font-weight:800}" +
    ".tz-rwon .tz-rwc{display:block}.tz-rwon .tz-rwt{display:flex}.tz-rwon .tz-bg{opacity:.85}" +
    // ④ 세 컷
    ".tz-ch b{display:block;font-size:16px;font-weight:800}.tz-ch small{color:var(--sub);font-size:12.5px}" +
    ".tz-now{margin:8px 0 4px;padding:9px 11px;border-radius:12px;background:rgba(255,80,80,.10);border:1px solid rgba(255,80,80,.35);font-size:14px;font-weight:700;line-height:1.45}.tz-now b{font-size:16px}.tz-now small{display:block;font-weight:500;opacity:.75;font-size:12.5px;margin-top:2px}" +
    ".tz-comic{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 6px}" +
    ".tz-pan{border:2px solid var(--text);border-radius:14px;overflow:hidden;background:var(--panel2);display:flex;flex-direction:column;animation:tdPop .45s both}.tz-pan:nth-child(2){animation-delay:.15s}.tz-pan:nth-child(3){animation-delay:.3s}" +
    ".tz-pk{height:92px;background:#f3e6d6 center 12%/cover no-repeat;border-bottom:2px solid var(--text)}" +
    ".tz-pt{padding:7px 8px 9px;min-width:0}.tz-pt small{display:block;font-size:12.5px;color:var(--sub);line-height:1.3}.tz-pt b{display:block;font-size:clamp(15px,4.6vw,19px);font-weight:900;letter-spacing:-.6px;margin:2px 0;white-space:nowrap}.tz-pt em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);line-height:1.3}" +
    ".tz-raw summary{font-size:12.5px;color:var(--sub);text-decoration:underline;cursor:pointer;list-style:none;margin-top:4px}.tz-raw summary::-webkit-details-marker{display:none}" +
    // ⑤ 경주
    ".tz-race{margin:10px 0 4px;padding:10px 12px;border-radius:16px;background:var(--panel2)}" +
    ".tz-rh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px;margin-bottom:6px}.tz-rh b{font-weight:800}.tz-rh span{font-weight:800}" +
    ".tz-ln{display:grid;grid-template-columns:62px 1fr 64px;align-items:center;gap:8px;margin:7px 0}.tz-lb{font-size:12.5px;color:var(--sub);white-space:nowrap}.tz-ln>b{text-align:right;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums}" +
    ".tz-tk{position:relative;height:14px;border-radius:999px;background:repeating-linear-gradient(90deg,var(--line) 0 6px,transparent 6px 12px);}" +
    ".tz-z{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--sub);opacity:.6;border-radius:2px}" +
    ".tz-rn{position:absolute;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px var(--panel2),0 2px 6px rgba(0,0,0,.25);transition:left 1.1s cubic-bezier(.2,.9,.25,1);font-style:normal;font-size:12.5px;line-height:18px;text-align:center}" +
    ".tz-rn:empty{font-size:0}.tz-rn:not(:empty){width:22px;height:22px;margin:-11px 0 0 -11px;line-height:22px;background:#fff;box-shadow:0 0 0 3px var(--c),0 2px 6px rgba(0,0,0,.25)}" +
    ".tz-dw{margin-top:8px}.tz-dw small{font-size:12.5px;color:var(--sub)}.tz-dw small b{color:var(--text)}.tz-dw div{display:flex;gap:3px;margin-top:4px}.tz-dw i{flex:1;height:10px;border-radius:3px;background:#3987e5;opacity:.75}.tz-dw i.w{background:#e66767;opacity:1}" +
    ".tz-tg{margin-top:6px;border:0;background:none;color:var(--sub);font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;padding:2px 0}.hm-sp.tzx-hide{display:none}" +
    // ⑥ 타임라인
    ".hm-chg.tz-tl .hm-chi{position:relative;padding-left:4px;border-top:0!important}" +
    ".hm-chg.tz-tl .hm-chi>span:first-child{position:relative;z-index:1;width:34px;height:34px;flex:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--panel2);box-shadow:0 0 0 2px var(--line)}" +
    ".hm-chg.tz-tl .hm-chi:not(:last-child)>span:first-child:after{content:'';position:absolute;left:50%;top:36px;width:2px;height:40px;margin-left:-1px;background:var(--line);z-index:-1}" +
    ".hm-chg.tz-tl .hm-chi:first-of-type>span:first-child{box-shadow:0 0 0 2px #3987e5;animation:tdPulse 2s ease-out 2}@keyframes tdPulse{0%{box-shadow:0 0 0 2px #3987e5,0 0 0 0 rgba(57,135,229,.5)}100%{box-shadow:0 0 0 2px #3987e5,0 0 0 12px rgba(57,135,229,0)}}" +
    ".hm-chg.tz-tl .hm-cb s,.hm-chg.tz-tl .hm-chi s{opacity:.55}" +
    ".hm-chg.tz-tl .hm-chi b:last-of-type{animation:tdIn .8s ease-out .3s both}@keyframes tdIn{from{filter:grayscale(1);opacity:.4;transform:translateX(-6px)}to{filter:none;opacity:1;transform:none}}" +
    // ⑩ 색 규칙 — 바로가기는 회색 밑줄 (파랑은 내림에만)
    "#hmbody .hm-nw,#hmbody .pnh-go,#hmbody a[data-goto]:not(.hm-chip),#hmbody .hm-go,#hmbody .pl a{color:var(--sub)!important;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;font-weight:600}" +
    "#hmbody .hm-nw b{color:var(--text)!important}" +
    "@media (max-width:360px){.tz-num b{font-size:42px}.tz-kid{width:72px;height:94px}.tz-pk{height:76px}.tz-pt b{font-size:16px}}" +
    "@media (prefers-reduced-motion:reduce){.tz-kid,.tz-rain,.tz-sun,.tz-sky.storm:after,.tz-bgl,.tz-bdg span,.tz-pan{animation:none!important}.tz-bgl{stroke-dashoffset:0}.tz-rn{transition:none}}";
  document.head.appendChild(css);
})();
;
__bk(61);
/* ======== vidmap.js ======== */
// 자동 생성(explain/vidmap.py) — 조이 설명 영상 목록: 「화면|제목키」 → vid/<파일>.mp4  (61개 · 10/28 쉬운 말 다시 찍음 + 이번에 안 찍힌 옛 영상 유지)
window.VIDC = {
"home|☀️오늘한장": "c_home_1",
"home|🌤오늘날씨판": "c_home_2",
"home|🎞그날팔았다면": "c_home_3",
"home|🏆오늘의배지": "c_home_4",
"home|👋조이인사": "c_home_5",
"market|✅오늘할일": "c_market_1",
"prob|🎲다음장오를확률": "c_prob_1",
"prob|🎲다음장시장확률": "c_prob_1",
"port|🏁시장곳과비교": "c_port_1",
"port|🗣목소리경주": "c_port_2",
"port|🎯집중포트": "c_port_3",
"port|📋지금이렇게담으면돼요": "c_port_4",
"port|🔁비중바뀐날": "c_port_5",
"port|🌏미국강세섹터×해외동종주": "c_port_6",
"port|🧩어느칸이벌고잃었나": "c_port_7",
"port|📅날짜별성적": "c_port_8",
"port|포트개뭐가달라요": "c_port_9",
"port|🎯집중포트오르는시장이면벌때번다검증한규칙그대로": "c_port_10",
"score|🧪포트규칙검증": "c_score_1",
"score|📊성적표안내": "c_score_2",
"cup|🎯돌파임박": "c_cup_1",
"cup|이화면은☕컵모양차트를찾는화면": "c_cup_2",
"gap|이화면은📈갭상승돌파를찾는화면": "c_gap_1",
"gap|이화면은📈갭돌파를찾는화면": "c_gap_1",
"whale|오늘의큰손top": "c_whale_1",
"whale|오늘의고래top": "c_whale_1",
"whale|이화면은🐋유명펀드투자자의보유종목을보는화면": "c_whale_2",
"bond|🇰🇷국고채국민주택채권": "c_bond_1",
"bond|🏦채권안내": "c_bond_2",
"els|🎯els원금비보장": "c_els_1",
"els|🛡️elb원금지급형": "c_els_2",
"els|🎯els안내": "c_els_3",
"els|📘els구조빨리읽기": "c_els_4",
"feed|📰피드안내": "c_feed_1",
"fund|📦펀드안내": "c_fund_1",
"screen|🔎종목찾기안내": "c_screen_1",
"screen|🔎거르기안내": "c_screen_1",
"sigmore|🧠자동분석전망": "c_sigmore_1",
"sigmore|🧠두뇌논지": "c_sigmore_1",
"sigmore|📂신호상세": "c_sigmore_2",
"els|🎛els내맘대로설계기": "d_els_dz",
"accum|🚀박스돌파": "c_accum_1",
"accum|거래량이상종목": "c_accum_2",
"accum|이화면은🤫거래량이상종목참고용": "c_accum_3",
"alarm|안내": "c_alarm_1",
"danta|📺오늘알람실시간전광판": "c_danta_1",
"danta|날짜별성적": "c_danta_2",
"danta|이화면은⚡단타당일급등신호알람을모은화면": "c_danta_3",
"danta|품질c": "c_danta_4",
"idea|✍️의견남기기": "c_idea_1",
"mgr|어디에돈을넣었나": "c_mgr_1",
"mgr|보유종목top": "c_mgr_2",
"mgr|이번분기에판종목": "c_mgr_3",
"onepager|🐇🐢누가먼저말했나": "c_onepager_1",
"onepager|🧵이종목앱성적표": "c_onepager_2",
"onepager|안내": "c_onepager_3",
"_v": "6",
"sector|🧭국면신호판": "c_sector_1",
"sector|⚡장중나침반": "c_sector_2",
"prob|🧭섹터종목확률": "c_prob_2",
"sector|🌍간밤글로벌": "c_sector_3",
"sector|전일섹터등락": "c_sector_4"
};
;
__bk(62);
/* ======== guide.js ======== */
/* 🧒 꼬마 안내원 (10/22 사용자: 둘째 아들을 닮은 3D 캐릭터로 앱 각 카테고리 설명 — Kling 영상 대신 비용 0원 안내 카드)
   · 머리 「CH Investing」 옆 작은 얼굴 버튼 하나 → 누르면 지금 보고 있는 묶음(오늘·시장·포트·신호·상품·피드)을 말풍선으로 설명
   · 처음 보는 묶음에선 얼굴 버튼에 작은 링이 한 번만 반짝 — 한 번 열면 조용히
   · 앱을 처음 연 사람에게만 인사 카드 한 번 (다시 안 뜸)
   · 대사는 아래 SAY 만 고치면 됨 (화면이 바뀌어도 다시 찍을 필요 없음) */
(function(){
  var IMG = "img/guide.jpg?v=1", BODY = "img/guide_body.jpg?v=1";
  // 🎨 10/22 Canva 로 만든 꼬마 자세 (나머지 묶음·자세히는 기본 그림) — 사용자 「일단 지금 있는 것만」
  var POSE = {intro: "img/kid_wave.jpg?v=1", home: "img/kid_thumb.jpg?v=1", mkt: "img/kid_globe.jpg?v=1", inv: "img/kid_piggy.jpg?v=1", prod: "img/kid_gift.jpg?v=1", sig: "img/kid_detect.jpg?v=1", feed: "img/kid_tablet.jpg?v=1"};  // 10/25 신호 = 돋보기 조이
  // 10/23 사용자 「꼬마 여러 표정을 적재적소에」 — 조이(Joey) 표정: 기쁨(kid_joy) · 우산(kid_umb, 조심·내림) · 엄지(kid_thumb) · 손인사(kid_wave) · 지구본(kid_globe) · 저금통(kid_piggy) · 놀람(guide_src)
  var FACE = {joy: "img/kid_joy.jpg?v=1", umb: "img/kid_umb.jpg?v=1", thumb: "img/kid_thumb.jpg?v=1", wow: "img/guide_src.jpg?v=1", think: "img/kid_think.jpg?v=1", detect: "img/kid_detect.jpg?v=1", night: "img/kid_night.jpg?v=1", worry: "img/kid_worry.jpg?v=1", tablet: "img/kid_tablet.jpg?v=1", gift: "img/kid_gift.jpg?v=1"};  // 11/03 +선물(kid_gift) · 11/02 +걱정(kid_worry)·태블릿(kid_tablet)  // 10/26 +졸린 밤(kid_night)  // 10/24 +생각(kid_think) · 10/25 +돋보기(kid_detect)
  function faceFor(L){ var t = (L || []).join(" ");     // 말 내용으로 표정 고르기
    if (/급락|폭락|큰 손실|폭풍/.test(t)) return FACE.worry;
    if (/⚠️|주의|조심|못 미|미달|아직 검증|무리|이르|손실|내림|빠진|급락/.test(t)) return FACE.umb;
    if (/🎁|새 기능|새로 나|업데이트|배지/.test(t)) return FACE.gift;
    if (/🏆|이김|적중|확인됨|✅|앞섬/.test(t)) return FACE.joy;
    if (/추정|검증 중|확률/.test(t)) return FACE.think;
    return null; }
  var MKPOSE = {prob: FACE.think, cup: FACE.detect, gap: FACE.detect, screen: FACE.detect, feed: FACE.tablet};                      // 자세히 묶음별 자세 (확률 = 생각하는 조이)
  var GRP = {home: "home", market: "mkt", sector: "mkt", prob: "mkt", flow: "mkt", port: "inv", divc: "inv", score: "inv",
             whale: "sig", cup: "sig", gap: "sig", screen: "sig", sigmore: "sig", accum: "sig", danta: "sig",
             bond: "prod", fund: "prod", els: "prod", feed: "feed", prop: "prop", luck: "luck", saju: "luck", tarot: "luck", lotto: "luck"};
  var NAME = {intro: "👋 인사", home: "🏠 오늘", mkt: "🌐 시장", inv: "💼 포트", sig: "🎯 신호", prod: "🛍️ 상품", prop: "📝 제안서", feed: "📰 피드", luck: "🔮 운세"};
  var SAY = {
    intro: ["안녕하세요! 저는 어플 안내자 조이(Joey)예요.", "어려운 투자 이야기, 제가 쉽게 알려 줄게요.", "궁금할 땐 위에 있는 제 얼굴을 눌러 주세요!"],
    home: ["여기는 「오늘」이에요.", "오늘 꼭 알아야 할 것만 한 장에 모았어요.", "카드를 누르면 그 탭으로 바로 가요.", "맨 위 동그라미를 누르면 오늘 이야기를 한 장씩 보여 줘요 — 마지막 장에서 그 탭으로 바로 가요.", "✨ 옆으로 넘기는 「오늘의 발견」엔 탭마다 가장 놀라운 숫자가 있어요.", "👀 다시 오면 그사이 바뀐 것부터 보여 줘요.", "🎯 아침마다 「코스피 오를까?」 한 번 눌러 동료랑 맞혀 봐요!", "바쁠 땐 여기만 봐도 돼요!"],
    mkt: ["「시장」에서는 어느 나라, 어느 업종으로 돈이 몰리는지 봐요.", "🌐 시황은 매일 아침 시황 리포트예요.", "🧭 나침반은 한국·미국·일본·중국·홍콩을 한눈에 보여 줘요.", "🎲 시장확률은 오늘 장이 오를 확률이에요!"],
    inv: ["「포트」는 시황 리포트대로 투자했다면 얼마 벌었을지 보여 줘요.", "뭘 얼마나 사야 하는지도 바로 보여요.", "💰 배당비교는 비슷한 종목·ETF를 몇 개 넣으면 배당을 나란히 보여 줘요 — 100만원이면 1년에 얼마, 언제 들어오는지까지요.", "📊 성적표에서는 우리 신호들이 잘 맞았는지 매일 채점해요.", "시장보다 잘했는지 늘 정직하게 비교해요!"],
    sig: ["「신호」에는 차트와 큰손이 보내는 신호가 모여요.", "🐋 고래는 큰 펀드가 새로 산 종목이에요.", "☕ 컵은 컵 모양 차트, 📈 갭은 힘차게 뛰어오른 종목이에요.", "성적이 확인된 신호만 포트에 들어가요!"],
    prod: ["「상품」에서는 채권, 펀드, ELS를 한곳에서 비교해요.", "🏦 채권은 만기 순서로도 볼 수 있어요.", "하루 세 번 새 정보로 바뀌어요!"],
    feed: ["「피드」는 매일 읽는 블로그와 텔레그램 글을 모아 둔 곳이에요.", "주요 뉴스도 15분마다 들어와요.", "중요한 글은 시황 리포트에도 들어가요!"],
    luck: ["「운세」는 생일만 넣으면 되는 곳이에요.", "🔮 오늘의 운세는 오늘 점수랑 행운의 색을 알려 줘요.", "📜 사주 리포트는 나를 읽는 긴 리포트예요. PDF로도 받아요!", "생일은 이 휴대폰에만 저장돼요!"],
    prop: ["「제안서」는 고객에게 줄 투자 제안서를 만드는 곳이에요.", "매일 아침 시황에 맞춰 9가지 기본폼이 미리 만들어져 있어요.", "상품을 고르고 금액만 넣으면 한 장 그림·PDF·PPT가 바로 나와요.", "📲 「고객에게 보여 주기」를 누르면 휴대폰을 고객에게 건네서 큰 글씨로 보여 줄 수 있어요.", "카드 제목 옆 제 얼굴을 누르면 칸마다 자세히 알려 줘요!"]
  };
  // ⓘ 자세히 (10/22 사용자: 「작은 i 설명칸에도 캐릭터 얼굴 탭 — 확률은 이렇게 계산된다, 아직 그대로 따라하긴 무리, 컵은 매일 몇 종목 돌린다, 포트는 과거로 돌려 볼 수 있다, ELS는 직접 짜고 과거 확률도 본다 … 싹 다」)
  //   숫자는 바뀌기 쉬운 것(오늘 성적)은 넣지 않고, 방법·규모·한계만. 오늘 성적은 「📊 성적표」로 보냄
  var MORE = {
    home: ["「오늘」은 앱 전체에서 오늘 꼭 볼 것만 뽑은 한 장이에요.", "포트 성적, 킥이 사고판 것, 오늘 집중할 곳, 알람, 두뇌 생각, 성적표가 한 줄씩 있어요.", "카드를 누르면 그 탭의 자세한 화면으로 바로 가요.", "매시간 새로 계산해요. 장중엔 한국 시장 숫자가 10분마다 바뀌어요."],
    market: ["🌐 시황은 매일 아침 7시 20분쯤 만드는 시장 전략 리포트예요.", "미국·한국 전날 종가, 밤사이 뉴스, 전략가 의견, 매일 읽는 블로그·텔레그램 글을 다 읽고 써요.", "「어느 나라·어느 업종으로 돈이 몰리나 → 수혜 종목·ETF → 오늘 여기 집중」 순서예요.", "리포트가 한 예고는 다음 날 맞았는지 스스로 채점해요(확률로 적고 브라이어 점수로 쌓아요).", "⚠️ 리포트는 판단을 돕는 자료예요. 매수 추천이 아니에요."],
    sector: ["🧭 나침반은 한국·미국·일본·중국·홍콩 5개 시장을 한 화면에 모은 거예요.", "오른 종목 수와 내린 종목 수, 지수 흐름, 강한 업종과 약한 업종을 보여 줘요.", "장중엔 10분마다 새 숫자로 바뀌어요.", "미국 장이 열리기 전엔 미국 지수 선물과 아시아·유럽 시장으로 미국을 미리 짐작해요."],
    divc: ["💰 배당비교는 비슷한 종목·ETF의 배당을 나란히 보여 줘요. 먼저 몇 개 비교할지 고르고, 칸마다 이름을 넣은 뒤 「비교하기」를 눌러요.", "100만원 넣으면 1년에 얼마 받는지, 한 번에 얼마인지, 몇 월에 들어오는지 그림으로 보여 줘요.", "배당이 많다고 꼭 수익이 큰 건 아니에요 — 「주가+배당 1년」 줄도 같이 봐요!"],
    flow: ["🧲 수급은 국내 주식을 누가 사고 있는지 보여 줘요. 외국인과 기관이 하루·5일·20일 동안 많이 산 종목 순서예요.", "「덩치 대비」를 누르면 회사 크기에 비해 큰돈이 들어온 순서로 바뀌어요. 종목을 누르면 종목리포트가 열려요.", "꼭 기억하세요 — 많이 샀다고 꼭 오르진 않아요. 10년을 돌려 보니 기관이 많이 산 종목은 오히려 덜 올랐어요. 고객과 이야기할 재료로만 써요."],
    prob: ["🎲 시장확률은 내일과 일주일 뒤 시장이 오를 확률이에요.", "계산법: 평소 오르는 비율(기저율)에서 출발해요. 추세·변동성·심리(공포·탐욕)·자금(크레딧·환율)·시장 폭·외국인 수급·옵션 만기·전날 미국장 같은 근거 20가지 정도를 하나씩 더해요.", "근거끼리 비슷한 말을 하는 경우가 많아서, 근거가 많아도 「서로 다른 근거 2개 정도」 몫만 믿어요.", "과거에 잘 맞힌 방법은 가중치를 올리고, 못 맞힌 방법은 내려요(매일 자동 채점).", "그래서 숫자가 50% 근처에 자주 머물러요. 억지로 부풀리지 않으려는 거예요.", "⚠️ 실전 방향 성적이 20건 넘게 쌓이고 55%를 넘기 전까진 「약간 ○○ 쪽」까지만 말해요. 아직 그대로 따라 사고팔긴 무리예요."],
    port: ["💼 포트는 「시황 리포트 배분표대로 투자했다면」을 매일 계산해요.", "💼 기본 = 뼈대(S&P500 반 + 나스닥 반, 시장이 200일선 아래면 현금·금을 늘림) · ⚡ 킥 = 기본에 확인된 신호(고래·컵·갭) 조금 · 🎯 집중 = 오르는 시장에 몰아서.", "시작일은 10/2가 기본이고, 날짜를 바꿔 다른 날부터 볼 수도 있어요.", "🎛 포트 설계기에서는 비중을 손가락으로 밀면 2008년부터 다시 굴려서 연 수익·최대 낙폭·최악의 해를 바로 보여 줘요.", "「정직」 숫자는 다음 날 진입·사고팔 때 비용까지 뺀 값이에요.", "⚠️ 실전 기록은 10/2부터라 아직 몇 주뿐이에요. 그대로 따라 하기엔 이르니, 위의 S&P500 비교 숫자와 성적표를 꼭 같이 보세요."],
    score: ["📊 성적표는 앱이 한 말이 맞았는지 한곳에서 채점하는 곳이에요.", "시황 예고, 두뇌 생각, 킥 신호, 단타 알람, 해외 상품까지 다 매겨요.", "🧪 포트 규칙 검증은 규칙을 2008~2016년에서 고르고 2017년부터 시험한 결과예요.", "🧾 시도 장부는 지금까지 시험한 규칙 조합 수예요. 많이 시험할수록 1등은 운으로도 좋아 보여서, 과거 숫자는 절반쯤 깎아서 봐요."],
    whale: ["🐋 고래는 미국 큰 펀드와 유명 투자자예요.", "SEC 13F 공시로 수익률 좋은 기관 20곳 + 유명 투자자 20곳, 모두 40곳을 매일 골라요(1년 복제 수익률 순위).", "그 40곳이 새로 사거나 크게 늘린 종목을 알려 줘요.", "🐋 원픽은 고래·차트·수급·흐름·뉴스를 100점으로 매겨 하나 뽑은 거예요.", "⚠️ 13F는 분기가 끝나고 45일 뒤에 공개돼요. 고래가 실제로 산 날보다 늦게 알게 돼요."],
    cup: ["☕ 컵은 컵 모양(U자로 내렸다 회복) + 손잡이(살짝 쉬었다 가기) 차트예요.", "한국·미국·일본·중국·홍콩 약 2만 종목을 매일 다 훑어요.", "컵 깊이, 기간, 손잡이 거래량 감소, 사상최고가와의 거리, 주가 강도 같은 조건을 모두 통과한 것만 남겨요.", "봇이 눈으로 한 번 더 걸러요(👁 눈 검사).", "⚠️ 컵이 보인다고 다 오르진 않아요. 손잡이를 「돌파」한 뒤가 중요하고, 성적표의 정직 숫자를 같이 보세요."],
    gap: ["📈 갭은 전날 종가보다 훌쩍 높게 시작해서 그 자리를 지키는 종목이에요.", "컵과 같은 5개 시장 약 2만 종목을 매일 훑어요.", "갭 직전에 평평하게 쉬던 박스, 신고가 돌파, 갭을 메우지 않고 지키는지로 모양 점수를 매겨요.", "우리 기록에선 4~8% 갭이 그보다 큰 갭보다 나았어요.", "⚠️ 비용과 다음 날 진입까지 뺀 「정직」 숫자가 기준(손익비 1.5)에 못 미치면 ⚠ 표시가 붙어요. 그땐 참고로만 보세요."],
    screen: ["🔎 아침 거르기는 약 2만 7천 종목 중 하루 거래대금 10억 원 넘는 약 1만 2천 종목을 매일 아침 걸러요.", "거름망 네 개: 🤫 조용한 돈 유입 · 🏆 섹터 1등주 · 🌱 조용한 신고가 · 🐋 고래+임원 매수+차트(미국).", "👁 「볼 만함」을 눌러 두면, 다음 날 내 눈이 거름망보다 나았는지 채점해 줘요.", "⚠️ 살펴볼 후보일 뿐, 사라는 뜻이 아니에요."],
    sigmore: ["🗂 더 보기는 있으면 좋은 자세한 자료를 모은 곳이에요.", "예고 채점, 두뇌 논지, 고래·컵·갭 상세, 단타 통계가 있어요.", "🤫 매집·⚡ 단타는 화면 대신 알림으로만 받아요. 단타는 아직 성적이 마이너스라 대부분 기록만 해요."],
    bond: ["🏦 채권은 미래에셋증권이 지금 파는 국고채·미국채·브라질국채·공사채·회사채예요.", "세금 뗀 뒤 수익률 순으로 보여 주고, 만기 순서로도 정렬할 수 있어요.", "하루 세 번 새 정보로 바뀌어요."],
    fund: ["📦 펀드는 미래에셋이 파는 공모펀드 약 1,800개예요.", "사모펀드(재간접) 수익률 순위, 전체 순위, 유형별로 볼 수 있어요.", "⚠️ 과거 수익률은 앞으로를 보장하지 않아요. 보수(수수료)도 같이 보세요."],
    els: ["🎯 ELS는 지금 청약 중인 ELS·ELB의 연 수익률·기초자산·구조·마감일을 모은 거예요.", "🎬 과거 재생: 이 조건으로 2006년부터 매일 가입했다면 몇 번이 일찍 끝나고 몇 번이 손실이었는지 보여 줘요.", "🎛 설계: 배리어·낙인·기초자산을 손가락으로 밀어 내 ELS를 직접 짜 보고, 과거 확률이 바로 바뀌어요.", "타사 비교, 📌 담아 두기(들고 있는 ELS가 지금 어디쯤인지)도 있어요.", "⚠️ 과거 계산이에요. 미래를 보장하지 않아요."],
    prop: ["📝 제안서 기본폼 9종: 국내 주식 · 국내+해외 주식 · 개인연금 · DC · IRP · 국고채 · 미국채 · 브라질국채 · ELS.", "주식·연금은 매일 아침 시황 배분표(미국 S&P500 200일선 규칙)를, 퇴직연금은 위험자산 70% 한도를 따라요.", "채권·ELS는 미래에셋이 지금 파는 상품 중 기간별 세후 1등, 원금지급형+지수형으로 골라요.", "🎚 위험 정도: 안전은 위험자산 절반을 현금성으로, 적극은 안전자산 절반을 위험자산으로 옮겨요. 과거 계산도 그 단계로 다시 해요.", "📲 고객에게 보여 주기: 상담 자리에서 휴대폰을 건네면 고객이 금액·위험 정도를 직접 눌러 보며 큰 글씨 카드를 넘겨 봐요. ✕ 두 번이면 닫혀요.", "🔗 동료 PB에게 세팅 링크를 보낼 수 있어요. 고객 이름은 안 담겨요.", "📱 한 장은 카톡용 그림, 📄 PDF는 표지부터 유의사항까지, 📊 PPT는 맑은 고딕에 차트를 PPT에서 고칠 수 있어요.", "⚖️ 모든 출력물 끝에 위험고지가 들어가고, 심의필 번호를 넣으면 같이 찍혀요.", "⚠️ 참고 자료예요. 고객에게 드리기 전 숫자와 상품 조건을 한 번 더 확인해 주세요."],
    luck: ["🔮 오늘의 운세는 그날의 기운(일진)과 태어난 사주를 비교해서 점수를 매겨요.", "일 · 돈 · 사람 · 몸 네 가지와 행운의 색 · 숫자 · 방향 · 좋은 시간을 알려 줘요.", "이번 주 막대를 누르면 다른 날 운세도 볼 수 있어요. 가족 · 고객을 여러 명 넣어 두면 「모두의 오늘」로 한눈에 봐요.", "인터넷 · API 없이 휴대폰 안에서 계산해요. 생일은 이 휴대폰에만 저장돼요.", "⚠️ 재미로 보는 참고예요. 투자 판단의 근거가 아니에요."],
    lotto: ["🎱 로또는 1회부터 지금까지 모든 당첨 번호를 분석해요.", "솔직히 말하면, 어떤 번호든 1등 확률은 똑같아요. 과거 번호로 다음 번호는 못 맞혀요.", "대신 1~3등은 당첨자끼리 나누니까, 남들이 덜 찍는 조합이면 혼자 받을 수 있어요. 3·4등 당첨자 수로 사람들이 좋아하는 번호를 재서 덜 겹치는 조합을 만들어요.", "검증해 보니 덜 겹친다고 본 쪽이 1등을 탔을 때 평균 약 25% 더 받았어요.", "⚠️ 로또는 기대 수익이 마이너스인 놀이예요. 즐길 만큼만!"],
    tarot: ["🃏 타로는 질문을 적고 카드를 고르면, 그 질문에 맞춰 풀어 줘요.", "질문을 읽어서 투자 · 돈 · 연애 · 결혼 · 직장 · 사업 · 시험 · 건강 · 관계 · 이사 중 어떤 주제인지, 「해도 될까 · 언제 · 어떻게 · A냐 B냐」 중 무엇을 묻는지 알아내요.", "78장 카드마다 주제별 해석을 미리 써 둬서 인터넷 · API 비용 없이 바로 풀어요.", "더 깊게 보고 싶으면 「AI에 붙여 심화 해석 듣기」로 복사해 Claude · ChatGPT · Gemini 등 쓰는 AI에 붙여 넣어요. 해석 기준과 답 형식이 들어 있어 어느 AI든 비슷하게 풀어요.", "⚠️ 재미와 자기 성찰용이에요. 투자 판단의 근거가 아니에요."],
    saju: ["📜 사주 리포트는 예전 「나를 읽는 리포트」 모양 그대로예요.", "8글자 · 숨은 글자 · 관계도 · 간판 · 가장 필요한 기운 · 특별한 표시 · 다섯 기운 · 재물 · 10년 대운 · 연도별 · 올해 월별 · 배우자 · 별자리 · 생활 · 정리까지.", "만세력(절기 · 음력 · 윤달), 서머타임, 태어난 곳 경도까지 천문 계산식으로 직접 계산해요.", "📄 PDF로 저장해서 보낼 수 있어요. 더 깊은 글은 「AI에 붙여 심화판 받기」로 복사해 쓰는 AI 채팅에 붙여 넣으면 돼요(API 비용 없음).", "⚠️ 전통 이론에 따른 해석이고, 과학적 예측이 아니에요."],
    feed: ["📰 피드는 매일 읽는 블로그·텔레그램 글과 주요 뉴스를 한곳에 모았어요.", "15분마다 새 글을 가져와요.", "📣 채널 성적표: 채널이 이름을 부른 종목을 5일·20일 뒤 채점해서, 어느 채널 말이 잘 맞는지 보여 줘요.", "중요한 글은 다음 날 시황 리포트 재료로 들어가요."]
  };
  var MORE_ALIAS = {accum: "sigmore", danta: "sigmore"};
  // 10/26 사용자 「조이를 탭하면 그 화면과 기능을 영상으로 설명」 — 실제 앱 화면을 찍어 HyperFrames 로 만든 세로 영상(소리 없음, 자막)
  //   t_<탭> = 탭 설명 · m_<자세히> = ⓘ 자세히. 영상이 없으면 지금처럼 글 말풍선
  var VID = {t_home: 1, t_mkt: 1, t_inv: 1, t_sig: 1, t_prod: 1, t_feed: 1, m_home: 1, m_market: 1, m_sector: 1, m_prob: 1, m_port: 1, m_score: 1,
             m_whale: 1, m_cup: 1, m_gap: 1, m_screen: 1, m_sigmore: 1, m_bond: 1, m_fund: 1, m_els: 1, m_feed: 1};
  var VIDV = "6";
  function vidOf(g, mk){ var k = mk ? "m_" + mk : "t_" + g; return VID[k] ? "vid/" + k + ".mp4?v=" + VIDV : ""; }
  // 10/26 사용자 「조이가 있는 모든 곳에 설명 영상」 — 카드 머리·접기 ⓘ·「ⓘ 설명」·「ⓘ …」 접는 칸: vidmap.js(window.VIDC, 자동 생성)에 「화면|제목」 → 파일
  function vkey(t){ return String(t || "").replace(/[\s\d·:%,.()\[\]~\-–—+/…?!「」『』()−▲▼△▽›‹]/g, "").replace(/(미국|한국|일본|중국|홍콩)시장은어느(국면|장분위기)인가/g, "").toLowerCase().slice(0, 24); }   // 10/27 고른 나라에 따라 바뀌는 부제는 빼고
  // 10/27 사용자 「조이 사진 있는 곳은 다」 — ① 이 화면에서 같은 제목 ② 다른 화면(시트·종목리포트 등)에서 같은 제목 ③ 없으면 이 화면 설명 영상(글 먼저, ▶ 로 보기)
  function vid1(title){ var m = window.VIDC; if (!m) return ""; var vk = vkey(title); if (!vk || vk === "설명") return "";   // 10/27: 제목 없는 회색 설명 줄(「설명」)이 엉뚱한 카드 영상(펀드 화면에서 ELS 설계 영상)에 붙던 것 → 화면 소개 영상으로
    var k = ((typeof cur !== "undefined" && cur) || "") + "|" + vk, f = m[k];
    if (!f && vk) for (var x in m) if (x.slice(x.indexOf("|") + 1) === vk){ f = m[x]; break; }
    return f ? "vid/" + f + ".mp4?v=" + (m._v || VIDV) : ""; }
  // 🗣 10/28 쉬운 말: 제목 그대로(새로 찍은 영상) → 바꾸기 전 글(easyBack) → 낱말 되돌림(easyBackTerms) 순서로 찾음
  function vidFor(title){ var r = vid1(title); if (r) return r;
    var b = window.easyBack ? easyBack(title) : title; if (b !== title && (r = vid1(b))) return r;
    return window.easyBackTerms ? vid1(easyBackTerms(b)) : ""; }
  function vidScreen(){ var c = (typeof cur !== "undefined" && cur) || "", k = VID["m_" + (MORE_ALIAS[c] || c)] ? "m_" + (MORE_ALIAS[c] || c) : "t_" + curGrp(); return VID[k] ? "vid/" + k + ".mp4?v=" + VIDV : ""; }
  function vidHtml(vs, wait){ return vs ? '<div class="gd-vw"><video class="gd-v" src="' + vs + '" muted playsinline preload="metadata" controls disablepictureinpicture></video></div>' : ""; }   // 🎨 11/04: 자동 재생 안 함(56MB) — ▶ 누를 때만
  var MORE_NAME = {home: "🏠 오늘", market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", port: "💼 포트", score: "📊 성적표", whale: "🐋 고래", cup: "☕ 컵", gap: "📈 갭", screen: "🔎 거르기", sigmore: "🗂 더 보기", bond: "🏦 채권", fund: "📦 펀드", els: "🎯 ELS", feed: "📰 피드", luck: "🔮 오늘의 운세", saju: "📜 사주 리포트", tarot: "🃏 타로", lotto: "🎱 로또"};
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function seen(){ return ls("gd_seen") || {}; }
  function mark(g){ var s = seen(); s[g] = 1; ls("gd_seen", s); }
  function curGrp(){ var k = (typeof cur !== "undefined" && cur) || (window.store && store.tab) || "home"; return GRP[k] || "home"; }

  var css = document.createElement("style");
  css.textContent =
    "#gdbtn{width:28px;height:28px;padding:0;margin:0 0 0 8px;border:1.5px solid var(--line);border-radius:50%;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat;cursor:pointer;position:relative;flex:none;vertical-align:middle}" +
    "#gdbtn.new:after{content:'';position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--acc);animation:gdring 1.6s ease-out 3}" +
    "@keyframes gdring{0%{opacity:.9;transform:scale(.85)}100%{opacity:0;transform:scale(1.35)}}" +
    "#gdq{position:fixed;inset:0;z-index:9998;background:rgba(5,8,14,.55);display:flex;align-items:flex-end;justify-content:center;animation:gdfade .2s ease}" +
    "@keyframes gdfade{from{opacity:0}to{opacity:1}}" +
    "#gdq .gd-sh{width:100%;max-width:560px;background:var(--panel);border:1px solid var(--line);border-bottom:0;border-radius:22px 22px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom) + 14px);animation:gdup .28s cubic-bezier(.2,.8,.2,1)}" +
    "@keyframes gdup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}" +
    "#gdq .gd-row{display:flex;gap:12px;align-items:flex-end}" +
    "#gdq .gd-kid{width:104px;height:170px;flex:none;border-radius:16px;background:#f3e6d6 url(" + BODY + ") center top/cover no-repeat;animation:gdhop 2.4s ease-in-out infinite}" +
    "@keyframes gdhop{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}" +
    "#gdq .gd-bub{flex:1;min-height:150px;background:var(--panel2);border:1px solid var(--line);border-radius:16px 16px 16px 4px;padding:12px 14px;font-size:15px;line-height:1.55;color:var(--text)}" +
    "#gdq .gd-t{font-size:12.5px;color:var(--sub);margin-bottom:6px}" +
    "#gdq .gd-l{opacity:0;transform:translateY(4px);transition:opacity .35s,transform .35s;margin:0 0 5px}" +
    "#gdq .gd-l.on{opacity:1;transform:none}" +
    "#gdq .gd-ft{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;align-items:center}" +
    "#gdq .gd-ft button{border:1px solid var(--line);background:var(--panel2);color:var(--sub);border-radius:999px;padding:5px 10px;font:inherit;font-size:12.5px;cursor:pointer}" +
    "#gdq .gd-ft button.on{color:var(--text);border-color:var(--acc)}" +
    "#gdq .gd-x{margin-left:auto;color:var(--text)!important}" +
    "#gdq .gd-vw{display:flex;justify-content:center}" +
    ".tz-kid,.tz-pk{cursor:pointer;-webkit-tap-highlight-color:transparent}.tz-kid:active,.tz-pk:active{transform:scale(.96)}#gdq .gd-txt .gd-kid{cursor:pointer}" +
    "#gdq .gd-v{display:block;height:min(66vh,820px);max-width:100%;aspect-ratio:9/16;border-radius:16px;background:#e9eefb;object-fit:contain}" +
    "#gdq .gd-hasv .gd-row{display:none}#gdq .gd-hasv.gd-txt .gd-row{display:flex}#gdq .gd-hasv.gd-txt .gd-vw{display:none}" +
    "#gdq .gd-more .gd-bub{max-height:52vh;overflow-y:auto;font-size:14.5px}#gdq .gd-more .gd-kid{width:84px;height:138px}" +
    "#main > .hero.gd-on h1:after{content:'';display:inline-block;width:28px;height:28px;margin-left:6px;vertical-align:-3px;border-radius:50%;border:1.5px solid var(--line);background:#f3e6d6 url(" + IMG + ") center/cover no-repeat}" +
    ".gd-i{display:inline-block;width:15px;height:15px;border-radius:50%;vertical-align:-2px;margin:0 1px;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat;box-shadow:0 0 0 1px var(--line);font-style:normal}" +
    // 10/22 사용자 「작은 꼬마 잘 안 눌러져」 — 카드 머리 꼬마는 진짜 요소(.gd-b)로 크게(26px) + 보이지 않는 누르는 칸을 사방 12px 넓힘
    "h3.tt-h:after,.mk-lab.tt-h:after,h3.tt-h.tt-on:after,.mk-lab.tt-h.tt-on:after{content:none!important;display:none!important}" +
    ".gd-b{display:inline-block;flex:none;width:26px;height:26px;margin-left:6px;border-radius:50%;vertical-align:-6px;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat;box-shadow:0 0 0 1.5px var(--line);position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".gd-b:after,.gd-i:after{content:'';position:absolute;inset:-12px;border-radius:50%}" +
    ".gd-i{position:relative;width:18px!important;height:18px!important;vertical-align:-4px!important}" +
    ".gd-b:active,.gd-i:active{transform:scale(.9)}" +
    ":root:not(.td-off) .td-n::before{content:''!important;width:14px;height:14px;top:3px!important;border-radius:50%;background:#f3e6d6 url(" + IMG + ") center/cover no-repeat}" +
    "@media (prefers-reduced-motion:reduce){#gdq .gd-kid,#gdbtn.new:after{animation:none}}";
  document.head.appendChild(css);

  var timer = null;
  function open(g){
    close();
    var q = document.createElement("div"); q.id = "gdq";
    var mk = g.indexOf("more:") === 0 ? g.slice(5) : null; if (mk) mk = MORE_ALIAS[mk] || mk;
    var L = mk ? (MORE[mk] || SAY.home) : (SAY[g] || SAY.home);
    var pz = POSE[g] || (mk && (MKPOSE[mk] || faceFor((MORE[MORE_ALIAS[mk] || mk] || []).slice(-1)) || POSE[GRP[mk] || ""]));
    var vs = vidOf(g, mk) || (g === "intro" ? vidFor("👋 조이 인사") : "") || vidOf(curGrp()); var fb = "";
    q.innerHTML = '<div class="gd-sh' + (mk ? ' gd-more' : '') + (vs ? ' gd-hasv' : '') + '" role="dialog" aria-label="안내자 조이">' +
      (vs ? '<div class="gd-vw"><video class="gd-v" src="' + vs + '" muted playsinline preload="metadata" controls disablepictureinpicture></video></div>' : '') +
      '<div class="gd-row"><div class="gd-kid" aria-hidden="true"' + (pz ? ' style="background-image:url(' + pz + ')"' : '') + '></div><div class="gd-bub"><div class="gd-t">' + (mk ? (MORE_NAME[mk] || "") + ' 자세히' : NAME[g] + ' 설명') + '</div>' +
      L.map(function(s){ return '<p class="gd-l">' + s + '</p>'; }).join("") + '</div></div><div class="gd-ft">' +
      (mk ? '' : ["home", "mkt", "inv", "sig", "prod", "feed"].map(function(k){ return '<button data-g="' + k + '"' + (k === g ? ' class="on"' : '') + '>' + NAME[k] + '</button>'; }).join("")) +
      (vs ? '<button class="gd-tx">📝 글로 보기</button>' : fb ? '<button class="gd-tx">▶ 이 화면 영상</button>' : '') + '<button class="gd-x">닫기</button></div></div>';
    document.body.appendChild(q);
    var ps = q.querySelectorAll(".gd-l"), i = 0;
    function next(){ if (i < ps.length) ps[i++].classList.add("on"); if (i >= ps.length) { clearInterval(timer); timer = null; } }
    var sh = q.querySelector(".gd-sh"), vv = q.querySelector(".gd-v");
    if (vv && fb){ vv.onerror = function(){ var t = q.querySelector(".gd-tx"); if (t) t.remove(); sh.classList.remove("gd-hasv", "gd-txt"); }; }
    else if (vv){ var pp = vv.play && vv.play(); if (pp && pp.catch) pp.catch(function(){}); vv.onerror = function(){ sh.classList.remove("gd-hasv"); var t = q.querySelector(".gd-tx"); if (t) t.remove(); }; }
    if (!vs) { next(); timer = setInterval(next, mk ? 750 : 1100); }
    q.onclick = function(e){
      var b = e.target.closest && e.target.closest("button");
      if (e.target === q || (b && b.classList.contains("gd-x"))) return close();
      if (b && b.dataset.g) return open(b.dataset.g);
      if (vv && e.target.closest && e.target.closest(".gd-kid") && sh.classList.contains("gd-txt")){ b = q.querySelector(".gd-tx"); }   // 말풍선 옆 조이 그림 → 영상으로
      if (b && b.classList.contains("gd-tx")){                                   // 영상 ↔ 글
        var toTxt = sh.classList.toggle("gd-txt"); b.textContent = toTxt ? "▶ 영상으로 보기" : "📝 글로 보기";
        if (toTxt){ if (vv) vv.pause(); while (i < ps.length) next(); } else if (vv){ var p2 = vv.play(); if (p2 && p2.catch) p2.catch(function(){}); }
        return;
      }
      if (timer) { while (i < ps.length) next(); }      // 말풍선을 누르면 남은 줄을 한 번에
    };
    if (g !== "intro" && !mk) { mark(g); var bt = document.getElementById("gdbtn"); if (bt) bt.classList.remove("new"); }
  }
  function close(){ if (timer) { clearInterval(timer); timer = null; } var q = document.getElementById("gdq"); if (q) { var v = q.querySelector("video"); if (v) { try { v.pause(); v.removeAttribute("src"); v.load(); } catch(x) {} } q.remove(); } }
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") close(); });
  // ── 10/22 사용자 「세세한 곳들도 다 꼬마 설명으로」 — 앱 곳곳의 ⓘ(카드 머리·회색 설명 줄·「ⓘ 설명」·정직 칩 같은 풍선 도움말·「ⓘ 이 화면은?」)
  //    → 글자 ⓘ 는 꼬마 얼굴로 바꾸고, 누르면 그 설명을 꼬마 말풍선으로. 그래프 위 점 도움말(svg)은 손가락으로 훑는 것이라 그대로 둠
  function esc(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function plain(h){ var d = document.createElement("div"); d.innerHTML = String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n"); return d.textContent || ""; }
  function paras(t){ return String(t || "").replace(/ⓘ/g, "").split(/\n+/).map(function(x){ return x.replace(/\s+/g, " ").trim(); }).filter(function(x){ return x; }); }
  function say(title, L, foot, face){
    if (!L || !L.length) return;
    close();
    var q = document.createElement("div"); q.id = "gdq";
    var vs = vidFor(title), fb = vs ? "" : vidScreen();
    q.innerHTML = '<div class="gd-sh gd-more' + (vs || fb ? ' gd-hasv' : '') + (fb ? ' gd-txt' : '') + '" role="dialog" aria-label="안내자 조이">' + vidHtml(vs || fb, !!fb) + '<div class="gd-row"><div class="gd-kid" aria-hidden="true" style="background-image:url(' + (face || faceFor(L) || BODY) + ')"></div><div class="gd-bub"><div class="gd-t">' + esc(title || "설명") + '</div>' +
      L.slice(0, 14).map(function(x){ return '<p class="gd-l">' + esc(x) + '</p>'; }).join("") + '</div></div><div class="gd-ft">' + (foot || "") + (vs ? '<button class="gd-tx">📝 글로 보기</button>' : fb ? '<button class="gd-tx">▶ 이 화면 영상</button>' : '') + '<button class="gd-x">닫기</button></div></div>';
    document.body.appendChild(q);
    var ps = q.querySelectorAll(".gd-l"), i = 0;
    function next(){ if (i < ps.length) ps[i++].classList.add("on"); if (i >= ps.length) { clearInterval(timer); timer = null; } }
    var sh = q.querySelector(".gd-sh"), vv = q.querySelector(".gd-v");
    if (vv && fb){ vv.onerror = function(){ var t = q.querySelector(".gd-tx"); if (t) t.remove(); sh.classList.remove("gd-hasv", "gd-txt"); }; }
    else if (vv){ var pp = vv.play && vv.play(); if (pp && pp.catch) pp.catch(function(){}); vv.onerror = function(){ sh.classList.remove("gd-hasv"); var t = q.querySelector(".gd-tx"); if (t) t.remove(); if (!timer && i < ps.length){ next(); timer = setInterval(next, 450); } }; }
    if (!vs) { next(); timer = setInterval(next, 450); }
    q.onclick = function(e){
      var b = e.target.closest && e.target.closest("button");
      if (vv && e.target.closest && e.target.closest(".gd-kid") && sh.classList.contains("gd-txt")){ b = q.querySelector(".gd-tx"); }   // 말풍선 옆 조이 그림 → 영상으로
      if (b && b.dataset.goto){ setTimeout(close, 0); return; }          // 「관련 화면」 → 앱의 원래 이동 처리에 맡김
      if (e.target === q || (b && b.classList.contains("gd-x"))) return close();
      if (b && b.classList.contains("gd-tx")){                                   // 영상 ↔ 글
        var toTxt = sh.classList.toggle("gd-txt"); b.textContent = toTxt ? "▶ 영상으로 보기" : "📝 글로 보기";
        if (toTxt){ if (vv) vv.pause(); while (i < ps.length) next(); } else if (vv){ var p2 = vv.play(); if (p2 && p2.catch) p2.catch(function(){}); }
        return;
      }
      if (timer) { while (i < ps.length) next(); }
    };
  }
  window.gdSay = say;
  // 10/27 사용자 「조이 사진 있는 곳은 다 탭하면 영상」 — 오늘 탭 날씨판 꼬마(.tz-kid) · 세 컷 만화 꼬마(.tz-pk) · 첫 화면 꼬마(#kidsplash)
  var KIDX = {
    hero: ["🌤 오늘 날씨판", ["맨 위 날씨판은 오늘 시장을 날씨로 보여 줘요.", "크게 오르면 ☀️ 맑음, 조금 오르면 🌤, 제자리면 ☁️ 흐림, 내리면 🌧 비, 크게 내리면 ⛈ 폭풍이에요.", "큰 숫자는 지금 가장 중요한 숫자 하나예요.", "날씨판을 누르면 시장 탭으로 가요. 카드를 길게 누르면 제가 한 줄씩 요약해 줘요!"]],
    comic: ["🎞 그날 팔았다면?", ["2000년 이후 같은 급락일들을 되짚은 세 컷 만화예요.", "① 깜짝 놀라 팔고 싶어지는 순간 · ② 그날 팔았다면 놓친 몫 · ③ 반대로 더 샀다면 120거래일 뒤 평균.", "과거 평균일 뿐, 앞으로를 약속하지는 않아요."]]
  };
  window.addEventListener("click", function(ev){
    var t = ev.target; if (!t.closest || t.closest("#gdq")) return;
    var k = t.closest(".tz-kid") ? "hero" : t.closest(".tz-pk") ? "comic" : null; if (!k) return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    say(KIDX[k][0], KIDX[k][1], "", k === "comic" ? "img/guide_src.jpg?v=1" : null);
  }, true);
  (function(){ var sp = document.getElementById("kidsplash"); if (!sp) return;
    sp.addEventListener("click", function(){ setTimeout(function(){ if (!document.getElementById("gdq")) { ls("gd_intro", 1); open("intro"); } }, 480); }); })();
  function titleOf(el){
    var c = el.closest && (el.closest(".fold") || el.closest("section.card") || el.closest(".card"));
    var h = c && c.querySelector("h3, .fold-h, .mk-lab, summary");
    var t = h ? (h.innerText || h.textContent || "") : "";
    return t.replace(/ⓘ|▴|▾|▸|▼|▲|접기|펼치기/g, "").replace(/\s+/g, " ").trim().slice(0, 40) || ((MORE_NAME[(typeof cur !== "undefined" && cur) || ""] || "") + " 안내").trim() || "설명";
  }
  function inGuide(t){ return t.closest && t.closest("#gdq"); }
  // ① 풍선 도움말(data-tip) — 그래프(svg) 밖의 칩·줄만
  function tipEl(t){ var x = t.closest && t.closest("[data-tip]"); return x && !x.closest("svg") && !inGuide(x) && x.getAttribute("data-tip") ? x : null; }
  window.addEventListener("pointerdown", function(ev){ if (tipEl(ev.target)) ev.stopImmediatePropagation(); }, true);
  window.addEventListener("click", function(ev){
    var t = ev.target; if (!t.closest || inGuide(t)) return;
    var x = tipEl(t);
    if (x && !t.closest("a,input,select,textarea,[data-goto],[data-op]")){
      ev.stopImmediatePropagation(); ev.preventDefault();
      var lab = (x.innerText || x.textContent || "").replace(/ⓘ/g, "").replace(/\s+/g, " ").trim();
      return say(lab && lab.length <= 30 ? lab : titleOf(x), paras(plain(x.getAttribute("data-tip"))));
    }
    // ② 회색 설명 줄(ⓘ 첫 마디…) — 펼치는 대신 꼬마가 읽어 줌
    var n = t.closest(".td-n");
    if (n && !document.documentElement.classList.contains("td-off") && !t.closest("a,button")){
      ev.stopImmediatePropagation(); return say(titleOf(n), paras(n.innerText || n.textContent));
    }
    // ③ 「ⓘ 설명」 단추(나침반)
    var nb = t.closest(".nt-b");
    if (nb){ var nt = nb.nextElementSibling; ev.stopImmediatePropagation(); return say(titleOf(nb), paras(nt ? (nt.innerText || nt.textContent) : "")); }
    // ④ 「ⓘ 이 화면은? / 포트 4개, 뭐가 달라요?」 같은 접는 칸
    var sm = t.closest("summary");
    if (sm && sm.querySelector(".gd-i") && !t.closest("a,button")){
      var d = sm.parentNode; ev.preventDefault(); ev.stopImmediatePropagation();
      var body = [].filter.call(d.children, function(c){ return c !== sm; }).map(function(c){ return c.innerText || c.textContent; }).join("\n");
      return say((sm.innerText || sm.textContent).replace(/ⓘ|눌러서 열고 닫기/g, "").replace(/\s+/g, " ").trim(), paras(body));
    }
    // ⑤ 카드 머리 ⓘ(nav2 의 「이 카드는」 칸) — 칸이 만들어지면 그 내용을 꼬마 말풍선으로 옮기고 칸은 닫음
    var hh = t.closest("h3.tt-h, .mk-lab.tt-h") || (t.closest(".tt-i") && t.closest(".fold-h"));
    if (hh && !t.closest("a,input,select,label,textarea,[data-op],[data-goto]") && (t.closest(".tt-i") || !t.closest("button"))){
      setTimeout(function(){
        var bx = hh.nextElementSibling; if (!bx || !bx.classList.contains("tt-x")) return;
        bx.hidden = true; hh.classList.remove("tt-on");
        var L = [], w = bx.querySelector(".ttx-what"), em = bx.querySelector(".ttx-h em");
        if (em && em.textContent.trim()) L.push(em.textContent.trim());
        if (w && w.textContent.trim() && (!em || w.textContent.trim() !== em.textContent.trim())) L.push(w.textContent.trim());
        [].forEach.call(bx.querySelectorAll(".ttx-n > :not(small)"), function(p){ L = L.concat(paras(p.innerText || p.textContent)); });
        var go = [].map.call(bx.querySelectorAll(".ttx-l"), function(b){ return '<button data-goto="' + esc(b.dataset.goto) + '">' + esc(b.textContent) + '</button>'; }).join("");
        var b0 = bx.querySelector(".ttx-h b");
        say((b0 && b0.textContent.trim()) || titleOf(hh), L, go);
      }, 0);
    }
  }, true);
  // 글자 ⓘ → 꼬마 얼굴 (새로 그려질 때마다 · 잠깐 모았다가 한 번에)
  var swT = null;
  function swap(){
    swT = null;
    [].forEach.call(document.querySelectorAll("h3.tt-h, .mk-lab.tt-h"), function(h){
      if (h.querySelector(":scope > .gd-b")) return;
      var b = document.createElement("i"); b.className = "gd-b"; b.setAttribute("aria-label", "조이 설명"); h.appendChild(b);
    });
    [document.getElementById("main"), document.getElementById("sheet")].forEach(function(root){
      if (!root) return;
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: function(x){ var p = x.parentNode;
        return p && !/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/.test(p.nodeName) && x.nodeValue.indexOf("ⓘ") >= 0 && !(p.closest && (p.closest("svg") || p.closest("#gdq"))) ? 1 : 3; }}), L = [], x;
      while ((x = w.nextNode())) L.push(x);
      L.forEach(function(tn){
        var parts = tn.nodeValue.split("ⓘ"), f = document.createDocumentFragment();
        parts.forEach(function(s, k){ if (k){ var i = document.createElement("i"); i.className = "gd-i"; i.setAttribute("aria-label", "조이 설명"); f.appendChild(i); } if (s) f.appendChild(document.createTextNode(s)); });
        tn.parentNode.replaceChild(f, tn);
      });
    });
  }
  new MutationObserver(function(){ if (!swT) swT = setTimeout(swap, 250); }).observe(document.documentElement, {childList: true, subtree: true, characterData: true});

  // 탭 머리(제목·꼬마 얼굴)를 누르면 소개 글 대신 바로 꼬마 설명 (nav2 의 소개 글 펼치기보다 먼저 잡음)
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest("#main > .hero.gd-on"); if (!h || ev.target.closest("button,a")) return;
    var k = (typeof cur !== "undefined" && cur) || ""; if (!(MORE[k] || MORE_ALIAS[k])) return;
    ev.stopImmediatePropagation(); ev.stopPropagation(); open("more:" + k);
  }, true);

  function addBtn(){
    var brand = document.querySelector("header .top .brand"); if (!brand) return;
    var b = document.getElementById("gdbtn");
    if (!b){
      b = document.createElement("button"); b.id = "gdbtn"; b.setAttribute("aria-label", "안내자 조이 — 이 화면 설명");
      b.onclick = function(e){ e.stopPropagation(); open(curGrp()); };
      brand.parentNode.insertBefore(b, brand.nextSibling);
    }
    b.classList.toggle("new", !seen()[curGrp()]);
    // 10/22 사용자 「i 를 꼬마 얼굴로, 누르면 바로 꼬마 설명」 — 설명이 있는 탭은 머리에 표시만 달아 둠
    var h = document.querySelector("#main > .hero"), k = (typeof cur !== "undefined" && cur) || "";
    if (h) h.classList.toggle("gd-on", !!(MORE[k] || MORE_ALIAS[k]));
  }
  // 탭을 옮길 때마다 링 상태만 다시 (go 를 감쌈)
  function hook(){
    if (typeof window.go !== "function" || window.go.__gd) return;
    var g0 = window.go;
    window.go = function(){ var r = g0.apply(this, arguments); try { addBtn(); } catch(x) {} return r; };
    window.go.__gd = 1;
  }
  function init(){
    addBtn(); hook();
    if (!ls("gd_intro") && !/[?&]embed=1/.test(location.search)) setTimeout(function(){ if (document.getElementById("gdq") || ls("gd_intro") || document.getElementById("wowob")) return; ls("gd_intro", 1); open("intro"); }, 2900);   // 🎨 11/04: wow.js 3장 안내가 대신   // 인사 화면(2초) 뒤
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  setTimeout(function(){ addBtn(); hook(); }, 900);
  window.gdOpen = open;
})();
;
__bk(63);
/* ======== easy.js ======== */
/* 🗣 쉬운 말 (10/28 사용자 「여전히 어렵고 복잡하다는 말을 많이 들어」 → 「쉬운 말로 바꾸는 건 하고」 → 「쉬운 말 전체로」)
   만든 사람 말(킥·고래·국면·나침반·두뇌·뼈대·정직 계산·매집·표본·손익비…)을 처음 보는 사람도 아는 말로.
   적용: ① 앱 화면 글자·풍선 도움말 ② 그림으로 그리는 장(오늘 한 장·고객 한 장 캔버스) ③ 휴대폰 푸시 알림(sw.js 가 이 파일을 불러 씀) ④ 조이 말풍선·용어 풀이.
   조사(이/가·은/는·을/를·과/와·으로/로·이에요/예요)는 바뀐 말 받침에 맞춰 고침. 낱말 앞뒤가 다른 한글이면 안 바꿈(킥오프 등).
   끄기(원복): localStorage easy = "off" (화면·그림) · 코드째 원복은 index.html 의 easy.js 줄과 sw.js 의 importScripts 줄 빼기.
   조이 영상 찾기(guide.js vidFor)는 제목 그대로 → easyBack(바꾼 글→원래 글) → easyBackTerms(낱말 되돌림) 순서. */
(function(G){
  var R = [
    // [원래 말(정규식), 쉬운 말, 앞 경계 검사, 바로 뒤에 오면 안 바꾸는 것]
    ["공격\\(킥\\) 포트", "공격 포트"], ["킥 포트", "공격 포트"], ["공격\\(킥\\)", "공격"], ["킥 슬리브", "공격 몫"], ["슬리브", "몫"],
    ["킥", "공격", 1],
    ["시장확률", "오를 확률"],
    ["국면 신호판", "장 분위기판"], ["국면", "장 분위기", 1],
    ["나침반", "시장 흐름", 1],
    ["고래들", "큰손들", 1], ["고래", "큰손", 1],
    ["두뇌 논지", "자동 분석 전망"], ["두뇌", "자동 분석", 1], ["논지", "전망", 1],
    ["정직 계산", "비용 뺀 계산"], ["정직 성적", "비용 뺀 성적"], ["정직 방식", "비용 뺀 방식"], ["정직 숫자", "비용 뺀 숫자"], ["정직", "비용 뺀", 1],
    ["예고 채점", "예측 채점"], ["예고", "예측", 1],
    ["뼈대", "기본 틀", 1],
    ["변동성 맞춤", "흔들림 조절"], ["변동성", "출렁임", 1],
    ["횡보", "제자리", 1],
    ["아웃퍼폼", "시장보다 나음"], ["언더퍼폼", "시장보다 못함"], ["익스포저", "비중", 1], ["모멘텀", "오름세", 1],
    ["거르기", "종목 찾기", 1],
    ["조용한 매집", "조용히 사 모으기"], ["매집", "사 모으기", 1],
    ["표본", "사례", 1],
    ["손익비", "번 돈÷잃은 돈", 1],
    ["적중률", "맞힌 비율", 1],
    ["최대 낙폭", "가장 크게 빠진 폭"], ["낙폭", "하락폭", 1],
    ["코어", "기본", 1],
    ["컵앤핸들", "컵 모양 차트"], ["핸들", "손잡이", 1], ["피벗", "돌파 기준점", 1],
    ["알파", "시장보다 더 번 몫", 1],
    ["헤지", "손실 막기", 1],
    ["샤프", "위험 대비 수익", 1],
    // 🎨 11/04 용어 2차 (사용자 「초보자도 쉽게」)
    ["거름망", "골라낸 종목", 1], ["돌파 임박", "곧 뚫을 듯"], ["횡보장", "옆으로 가는 장"], ["베리어", "기준선", 1], ["배리어", "기준선", 1],
    ["낙인", "손실 시작선", 1], ["리밸런싱", "비중 다시 맞추기", 1], ["드로다운", "고점 대비 하락", 1], ["밸류에이션", "값이 싼지 비싼지", 1],
    ["컨센서스", "전문가 평균 예상", 1], ["리스크", "위험", 1, "온|오프"], ["스프레드", "금리 차이", 1], ["듀레이션", "금리 민감도", 1],
    ["200일 평균선", "장기 평균선"], ["200일 평균", "장기 평균"], ["200일선", "장기 평균선"],   // 🔰 11/05
    ["컵", "컵 차트", 1, " ?차트| ?모양|앤"],
    ["갭", "갭 상승", 1, " ?상승| ?메|\\)"]
  ];
  var EXACT = {"☕ 컵": "☕ 컵 차트", "📈 갭": "📈 갭 상승"};
  var PART = "(이에요|예요|으로|로|이|가|은|는|을|를|과|와)?";
  function jong(w){ var c = w.charCodeAt(w.length - 1) - 0xAC00; if (c < 0 || c > 11171) return -1; return c % 28; }   // 0 = 받침 없음, 8 = ㄹ
  function fix(w, p){
    if (!p) return w; var j = jong(w); if (j < 0) return w + p; var has = j > 0;
    switch (p){
      case "이": case "가": return w + (has ? "이" : "가");
      case "은": case "는": return w + (has ? "은" : "는");
      case "을": case "를": return w + (has ? "을" : "를");
      case "과": case "와": return w + (has ? "과" : "와");
      case "으로": case "로": return w + (has && j !== 8 ? "으로" : "로");
      case "이에요": case "예요": return w + (has ? "이에요" : "예요");
    }
    return w + p;
  }
  var RX = R.map(function(r){ return {re: new RegExp((r[2] ? "(^|[^가-힣A-Za-z])" : "()") + r[0] + (r[3] ? "(?!" + r[3] + ")" : "") + PART + "(?![가-힣])", "g"), to: r[1]}; });
  var TEST = new RegExp(R.map(function(r){ return r[0]; }).join("|"));
  function conv(v){
    if (v == null) return v; var s = String(v), t = s.trim();
    if (EXACT[t]) return s.replace(t, EXACT[t]);
    if (!TEST.test(s)) return s;
    RX.forEach(function(x){ s = s.replace(x.re, function(m, pre, p){ return pre + fix(x.to, p); }); });
    return s;
  }
  var TERMB = [["큰손", "고래"], ["장 분위기판", "국면 신호판"], ["장 분위기", "국면"], ["시장 흐름", "나침반"], ["오를 확률", "시장확률"], ["자동 분석 전망", "두뇌 논지"], ["자동 분석", "두뇌"], ["기본 틀", "뼈대"], ["비용 뺀", "정직"],
    ["예측", "예고"], ["제자리", "횡보"], ["공격 포트", "킥 포트"], ["종목 찾기", "거르기"], ["컵 차트", "컵"], ["갭 상승", "갭"], ["조용히 사 모으기", "조용한 매집"], ["사 모으기", "매집"], ["흔들림 조절", "변동성 맞춤"], ["출렁임", "변동성"], ["맞힌 비율", "적중률"], ["사례", "표본"], ["하락폭", "낙폭"]];
  G.easyText = conv;
  G.easyBackTerms = function(str){ var o = String(str || ""); TERMB.forEach(function(t){ o = o.split(t[0]).join(t[1]); }); return o; };   // 낱말 단위 되돌리기(영상 못 찾았을 때만)

  if (typeof document === "undefined") return;                          // ↓ 여기부터는 앱 화면(서비스 워커는 위 conv 만 씀)
  try { if (localStorage.getItem("easy") === "off"){ G.easyText = function(v){ return v; }; return; } } catch(x) {}

  // ② 그림으로 그리는 장(캔버스) — 재는 글자와 그리는 글자가 같아야 줄바꿈이 맞음
  try {
    var P = CanvasRenderingContext2D.prototype;
    ["fillText", "strokeText", "measureText"].forEach(function(k){ var f = P[k]; if (!f || f._ez) return;
      var g = function(t){ var a = [].slice.call(arguments); a[0] = conv(t); return f.apply(this, a); }; g._ez = 1; P[k] = g; });
  } catch(x) {}

  var BACK = new Map();
  G.easyBack = function(str){
    if (!str) return str; var o = String(str);
    BACK.forEach(function(orig, easy){ if (o.indexOf(easy) >= 0) o = o.split(easy).join(orig); });
    return o;
  };
  var SKIP = "script,style,svg,textarea,input,select,code,pre,[contenteditable],.ez-no";
  function doNode(n){
    var v = n.nodeValue; if (!v) return;
    var p = n.parentElement; if (!p || p.closest(SKIP)) return;
    var o = conv(v);
    if (o !== v){ var e1 = o.trim(), o1 = v.trim(); if (e1 && e1 !== o1 && BACK.size < 4000) BACK.set(e1, o1); n.nodeValue = o; }
  }
  function walk(root){
    if (!root) return;
    if (root.nodeType === 3) return doNode(root);
    if (root.nodeType !== 1 || (root.closest && root.closest(SKIP))) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), a = [], x; while ((x = w.nextNode())) a.push(x); a.forEach(doNode);
  }
  // 풍선 도움말(data-tip)·누르면 뜨는 제목(title)·입력 칸 안내(placeholder)
  var ATTR = ["data-tip", "title", "placeholder"];
  function doAttr(el){ if (!el || el.nodeType !== 1 || (el.closest && el.closest("svg"))) return; ATTR.forEach(function(a){ var v = el.getAttribute(a); if (v){ var o = conv(v); if (o !== v){ var e1 = o.trim(), o1 = v.trim(); if (BACK.size < 4000) BACK.set(e1, o1); el.setAttribute(a, o); } } }); }
  function walkAttr(root){ if (!root || root.nodeType !== 1) return; doAttr(root); [].forEach.call(root.querySelectorAll("[data-tip],[title],[placeholder]"), doAttr); }
  var q = [], sch = false;
  function flush(){ sch = false; var a = q; q = []; a.forEach(function(n){ walk(n); walkAttr(n); }); }
  new MutationObserver(function(ms){
    ms.forEach(function(m){ if (m.type === "childList") [].forEach.call(m.addedNodes, function(n){ q.push(n); }); else q.push(m.target); });
    if (!sch && q.length){ sch = true; (window.requestAnimationFrame || setTimeout)(flush); }
  }).observe(document.documentElement, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR});
  walk(document.body); walkAttr(document.body);
})(typeof window !== "undefined" ? window : self);
;
__bk(64);
/* ======== habit.js ======== */
/* CH Investing — 🏠 다시 오게 하는 홈 (10/31 사용자: 「A·B 다 진행 · C는 3·4 빼고 다」)
   B8 홈을 화면 1.5장쯤으로 — 긴 카드는 핵심 한 줄만, 나머지는 「펼치기」
   C1 🎯 아침 1탭 예측 — 「코스피 오를까?」 한 번 누르고, 3시 반에 결과 · 주간 순위 · 조이 vs 사람 (vote.py 가 모아 채점)
   C2 📛 앱 아이콘 숫자 — 홈을 보면 0으로 (숫자는 알림이 올 때 sw.js 가 올림)
   C5 🔮 운세 → 시장 다리 — 생일이 저장된 사람은 홈에 「오늘 투자운 N점」 칩 · 운세 화면엔 진짜 시장 날씨(mktWeather)
   C6 ⚡ 장중 「지금 바뀐 것」 — 한국 장중에만 3줄(30분 전과 비교 · 강한 업종 · 돈이 몰린 종목 · 환율), 5분마다 갈아끼움
   C7 📨 이번 주 한 장 — 금요일 장 끝~일요일 홈 카드 · 누르면 고객에게 보낼 주간 요약 그림 (금 16시 알림: plus.py week1)
   C8 👀 다시 오면 「마지막으로 본 뒤 바뀐 것」만 먼저 — 날씨판 바로 아래 */
(function(){
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var VOTE_TOPIC = "chkchp-ch-vote";
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function hm(){ return kst().toISOString().slice(11, 16); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 300000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function q5(){ return "?" + Math.floor(Date.now() / 300000); }
  var WDK = ["일", "월", "화", "수", "목", "금", "토"];
  function wd(d){ return WDK[new Date(d + "T00:00:00Z").getUTCDay()]; }
  function onHome(){ return (typeof cur !== "undefined" && cur === "home") && document.getElementById("hmbody"); }
  function toast(m){ if (window.P && P.toast) return P.toast(m); var d = document.createElement("div"); d.className = "ch-toast"; d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function dev(){ var d = null; try { d = localStorage.getItem("us_dev"); } catch(x) {} if (!d){ d = Math.random().toString(36).slice(2, 10); try { localStorage.setItem("us_dev", d); } catch(x) {} } return d; }

  /* ───────── 🌤 시장 날씨 (운세 화면 · 다른 곳에서 같이 씀) ───────── */
  function wxOf(r){ return r == null ? ["☁️", "흐림"] : r >= 1.5 ? ["☀️", "맑음"] : r >= 0.3 ? ["🌤", "구름 조금"] : r > -0.3 ? ["☁️", "흐림"] : r > -1.5 ? ["🌧", "비"] : ["⛈", "폭풍"]; }
  window.mktWeather = function(){
    return Promise.all([gj("archive/x/live_kr.json" + q5()), gj(RAWM + "home.json" + q5())]).then(function(r){
      var L = r[0] || {}, H = r[1] || {}, P = H.port || {};
      var k = (L.index || []).filter(function(x){ return x.name === "코스피"; })[0];
      var liveToday = L.date === today() && k;
      var big = liveToday ? k.chg : P.d1_spy != null ? P.d1_spy : k ? k.chg : null, w = wxOf(big);
      var parts = [];
      if (k) parts.push("코스피 " + sg(k.chg) + (liveToday ? (L.t && L.t < "15:30" ? " (" + L.t + ")" : " 마감") : " (" + wd(L.date) + ")"));
      if (P.d1_spy != null) parts.push("S&P " + sg(P.d1_spy) + " (" + wd(P.d1_date) + ")");
      return {ic: w[0], w: w[1], line: parts.join(" · ") + " — 눌러서 홈으로"};
    });
  };

  /* ───────── B8 홈 접기 ───────── */
  var OPEN = {};   // 이번에 펼친 카드 (매시간 다시 그려져도 펼친 채로)
  function foldBtn(key, lab){ return '<button type="button" class="hf-b" data-hf="' + key + '" data-lab="' + lab + '">' + (OPEN[key] ? "접기 ▴" : lab + " ▾") + '</button>'; }
  function foldOne(card, key, parts, lab, where){
    if (!card) return;
    // 다른 화면 js 가 카드 안에 늦게 붙이는 칸(경주 그림 등)도 잡도록 매번 다시 표시
    parts.forEach(function(sel){ [].forEach.call(card.querySelectorAll(sel + ":not(.hf-x)"), function(x){ x.classList.add("hf-x"); }); });
    if (card.getAttribute("data-hfk")) return;
    if (!card.querySelector(".hf-x")) return;
    card.setAttribute("data-hfk", key); card.classList.add("hf-c"); if (OPEN[key]) card.classList.add("hf-open");
    var at = where ? card.querySelector(where) : null;
    var w = document.createElement("div"); w.className = "hf-row"; w.innerHTML = foldBtn(key, lab);
    if (at && at.parentNode === card) at.insertAdjacentElement("afterend", w); else card.appendChild(w);
  }
  function fold(){
    var b = document.getElementById("hmbody"); if (!b) return;
    // ☀️ 오늘 한 장 — 나라별 한 줄만 · 할 말·일정·보내기는 펼치면 (보내기는 왼쪽 아래 📨 단추에도 있음)
    foldOne(document.getElementById("pbcard"), "pb", [".pb-talk", ".pb-ev", ".pb-ft"], "3줄 요약·일정 보기", ".pb-reg");
    // 💼 내 포트 — 숫자 세 개 + 할 일만 · 경주 그림은 펼치면
    [].forEach.call(b.querySelectorAll("section.card"), function(c){
      var t = (c.querySelector(".hm-h b") || {}).textContent || "";
      if (/내 포트/.test(t)) foldOne(c, "port", [".tz-race", ".hm-sp"], "10/2부터 경주 보기", ".hm-l");
      else if (/이번 주 복기/.test(t)){ if (document.getElementById("wk1")) c.classList.add("hf-gone"); else foldOne(c, "week", [".hm-wn", ".hm-l"], "자세히", ".hm-big"); }   // 주말엔 📨 이번 주 한 장 카드에 합침
      else if (c.classList.contains("hm-chg")) foldOne(c, "chg", [".hm-chi:nth-of-type(n+4)"], "더 보기", null);
    });
    var hint = b.querySelector(".tz-hint"); if (hint) hint.classList.add("hf-gone");
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-hf]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var c = t.closest(".hf-c"), k = t.dataset.hf; if (!c) return;
    OPEN[k] = !OPEN[k]; c.classList.toggle("hf-open", OPEN[k]); t.textContent = OPEN[k] ? "접기 ▴" : (t.getAttribute("data-lab") || "펼치기") + " ▾";
  }, true);

  /* ───────── C8 👀 마지막으로 본 뒤 바뀐 것 ───────── */
  var SEEN_K = "hb_seen", SINCE = null;   // SINCE = 이번 방문에 보여 줄 「바뀐 것」(30분 유지)
  function snapOf(H){
    var P = (H && H.port) || {}, mk = window.M && M.cats && M.cats.market && M.cats.market[0];
    return {at: Date.now(), base: P.base, kick: P.kick, conc: P.conc, asof: P.asof, mkt: mk ? mk.id : "",
      focus: ((H && H.focus) || []).map(function(f){ return f.name; }), ev: ((H && H.kick && H.kick.events) || []).map(function(x){ return x.k + ":" + x.name; }),
      chg: ((H && H.chg && H.chg.items) || []).map(function(x){ return x.t; })};
  }
  function ago(t){ var m = Math.round((Date.now() - t) / 60000); if (m < 60) return m + "분 전"; var h = Math.round(m / 60); if (h < 24) return h + "시간 전"; return Math.round(h / 24) + "일 전"; }
  function diffs(H, old){
    var now = snapOf(H), out = [];
    if (!old) return out;
    var mk = window.M && M.cats && M.cats.market && M.cats.market[0];
    if (now.mkt && old.mkt && now.mkt !== old.mkt) out.push({ic: "🌐", t: "새 시황 나옴", s: dateLab(now.mkt), go: "market"});
    if (now.asof && old.asof && now.asof !== old.asof && now.base != null && old.base != null)
      out.push({ic: "💼", t: "내 포트(기본) " + sg(old.base) + " → " + sg(now.base), s: md(now.asof) + " 미국 종가 반영", go: "port~pohero"});
    var nf = now.focus.filter(function(f){ return old.focus.indexOf(f) < 0; });
    if (nf.length) out.push({ic: "🎯", t: "새 집중 테마: " + nf.join(" · "), go: "market~mkfo"});
    var ne = now.ev.filter(function(f){ return old.ev.indexOf(f) < 0; });
    if (ne.length) out.push({ic: "⚡", t: "공격 할 일: " + ne.map(function(x){ return x.replace(":", " "); }).join(" · "), go: "port~pokick"});
    ((H && H.chg && H.chg.items) || []).forEach(function(x){
      if (old.chg.indexOf(x.t) >= 0 || /시황 나옴/.test(x.t) && out.some(function(o){ return o.ic === "🌐"; })) return;
      out.push({ic: x.ic, t: x.lab ? x.lab + (x.a ? " " + x.a + " → " + x.b : "") + (x.note ? " (" + x.note + ")" : "") : x.t, s: x.sub || "", go: x.go || "home"}); });
    return out.slice(0, 4);
    function dateLab(id){ var d = id.slice(0, 10); return md(d) + "(" + wd(d) + ") " + ({AM: "오전", PM: "오후", HOL: "휴장"}[id.slice(11)] || ""); }
  }
  function sinceCard(H){
    var b = document.getElementById("hmbody"); if (!b || !H) return;
    var old = ls(SEEN_K);
    if (!SINCE || Date.now() - SINCE.made > 30 * 60e3){
      // 3시간 넘게 지나 다시 온 사람에게만 — 방금 본 사람에겐 같은 걸 또 보여 주지 않음
      SINCE = {made: Date.now(), from: old && old.at, items: old && Date.now() - old.at > 3 * 3600e3 ? diffs(H, old) : []};
      ls(SEEN_K, snapOf(H));
    }
    var ex = document.getElementById("hbsince");
    if (!SINCE.items.length){ if (ex) ex.remove(); return; }
    var h = '<div class="hm-h"><span class="hm-i">👀</span><div><b>마지막으로 본 뒤 바뀐 것</b><small>' + ago(SINCE.from) + '에 봄 · ' + SINCE.items.length + '가지</small></div></div>' +
      SINCE.items.map(function(x){ return '<div class="hb-si" data-goto="' + e(x.go) + '"><span>' + e(x.ic) + '</span><div><b>' + e(x.t) + '</b>' + (x.s ? '<small>' + e(x.s) + '</small>' : '') + '</div><i>›</i></div>'; }).join("");
    if (!ex){ ex = document.createElement("section"); ex.id = "hbsince"; ex.className = "card hb-since"; }
    if (ex.getAttribute("data-sig") !== String(SINCE.made)){ ex.innerHTML = h; ex.setAttribute("data-sig", String(SINCE.made)); }
    var hero = document.getElementById("tdhero");
    if (hero && ex.previousElementSibling !== hero) hero.insertAdjacentElement("afterend", ex);
    else if (!hero && ex.parentNode !== b) b.insertBefore(ex, b.firstChild);
    // 같은 내용인 서버 「바뀐 것」 카드는 숨김 (겹치지 않게)
    var dup = b.querySelector(".hm-chg"); if (dup) dup.classList.add("hf-gone");
  }

  /* ───────── C2 📛 아이콘 숫자 지우기 ───────── */
  function clearBadge(){
    try { if (navigator.clearAppBadge) navigator.clearAppBadge().catch(function(){}); } catch(x) {}
    try { if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({t: "badge", n: 0}); } catch(x) {}
  }

  /* ───────── C5 🔮 오늘 투자운 칩 ───────── */
  function luckChip(){
    var hero = document.getElementById("tdhero"); if (!hero || hero.querySelector(".hb-luck")) return;
    var ppl = ls("sj_people"); if (!ppl || !ppl.length) return;
    (window.needMod ? needMod("luck") : Promise.resolve()).then(function(){
      var L = window.luckToday && luckToday(); if (!L || L.inv == null || !document.getElementById("tdhero") || hero.querySelector(".hb-luck")) return;
      var a = document.createElement("button"); a.type = "button"; a.className = "hb-luck";
      a.innerHTML = '🔮 ' + e(L.name) + ' 님 오늘 투자운 <b>' + L.inv + '점</b> ›';
      a.onclick = function(ev){ ev.stopPropagation(); go("luck"); };
      var say = hero.querySelector(".tz-say"); if (say) say.insertAdjacentElement("afterend", a); else hero.appendChild(a);
    });
  }

  /* ───────── C6 ⚡ 장중 지금 바뀐 것 ───────── */
  var LIVE_T = 0;
  function liveStrip(){
    var b = document.getElementById("hmbody"); if (!b) return;
    var d = kst(), m = d.getUTCHours() * 60 + d.getUTCMinutes(), wk = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    var ex = document.getElementById("hblive");
    if (wk || m < 9 * 60 || m > 15 * 60 + 40){ if (ex) ex.remove(); return; }
    Promise.all([gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/wl_live.json" + q5(), 120000)]).then(function(r){
      var L = r[0], W = r[1]; if (!L || L.date !== today() || !onHome()) return;
      var ix = {}; (L.index || []).forEach(function(x){ ix[x.name] = x; });
      var ks = ix["코스피"], sn = L.snaps || [], rows = [];
      if (ks && sn.length >= 4){   // 30분 전(스냅 3칸 전)과 비교
        var p = sn[Math.max(0, sn.length - 4)], dlt = ks.chg - (+p[3]);
        rows.push('<b>📈 코스피 ' + sg(ks.chg) + '</b> <span class="mut">30분 전 ' + sg(+p[3]) + ' → ' + (Math.abs(dlt) < 0.15 ? "제자리" : dlt > 0 ? '<span class="up">올라오는 중</span>' : '<span class="dn">밀리는 중</span>') + '</span>');
      }
      var st = (L.strong || []).filter(function(s){ return s.n >= 5; }).slice(0, 2);
      if (st.length) rows.push('<b>🔥 강한 업종</b> ' + st.map(function(s){ return e(s.name.replace(/\(.*?\)/g, "")) + ' <span class="' + cls(s.r) + '">' + sg(s.r) + '</span>'; }).join(" · "));
      var v = (L.value || []).slice(0, 3);
      if (v.length) rows.push('<b>💰 돈이 몰린 종목</b> ' + v.map(function(s){ return '<a data-op="' + e(s.s) + '">' + e(s.n) + '</a> <span class="' + cls(s.r) + '">' + sg(s.r) + '</span>'; }).join(" · "));
      var fx = W && W.fx; if (fx && fx.p && String(fx.t || "").slice(0, 10) === today()){ var dw = fx.prev ? fx.p - fx.prev : null; rows.push('<b>💱 원/달러</b> ' + (Math.round(fx.p * 10) / 10).toLocaleString() + '원' + (dw != null ? ' <span class="' + cls(dw) + '">' + (dw > 0 ? "▲" : dw < 0 ? "▼" : "") + Math.abs(dw).toFixed(1) + '원</span>' : '')); }
      if (!rows.length) return;
      ex = ex || document.getElementById("hblive");   // 🎨 11/04: 동시에 두 번 불리면 카드가 둘 생기던 것
      if (!ex){ ex = document.createElement("section"); ex.id = "hblive"; ex.className = "card hb-live"; }
      ex.innerHTML = '<div class="hb-lh"><b>⚡ 지금 바뀐 것</b><span class="mut">' + e(L.t || "") + ' 기준 · 10분마다</span></div>' + rows.map(function(x){ return '<div class="hb-lr">' + x + '</div>'; }).join("");
      var after = document.getElementById("hbsince") || document.getElementById("tdhero");
      if (after){ if (ex.previousElementSibling !== after) after.insertAdjacentElement("afterend", ex); }
      else if (ex.parentNode !== b) b.insertBefore(ex, b.firstChild);
    });
  }

  /* ───────── C1 🎯 아침 1탭 예측 ───────── */
  var VK = "hb_vote";   // {day: p}
  function myVotes(){ return ls(VK) || {}; }
  function nick(){ var n = ls("hb_nick"); return n || ""; }   // 🔍 11/05 B7: 자동 별명(PB-xxxx) 없앰 — 비우면 순위에서 빠짐
  function target(PB, L){
    var kr = PB && PB.markets && PB.markets.KR, nd = kr && kr.next_day, td = today(), m = hm(), wk = [0, 6].indexOf(kst().getUTCDay()) >= 0;
    var session = !wk && m >= "09:00" && m < "15:30" && L && L.date === td;
    if (session) return {day: td, open: false, session: true};
    if (nd && (nd > td || (nd === td && m < "09:00"))) return {day: nd, open: true};
    if (!wk && m < "09:00") return {day: td, open: true};
    return {day: nd || td, open: false};
  }
  function dayLab(d){ var td = today(); if (d === td) return "오늘"; var dd = Math.round((Date.parse(d) - Date.parse(td)) / 864e5); return dd === 1 ? "내일" : wd(d) + "요일(" + md(d) + ")"; }
  function sendVote(day, p){
    var V = myVotes(); V[day] = p; var keep = {}; Object.keys(V).sort().slice(-60).forEach(function(k){ keep[k] = V[k]; }); ls(VK, keep);
    try { fetch("https://ntfy.sh/" + VOTE_TOPIC, {method: "POST", body: JSON.stringify({d: dev(), day: day, p: p, nm: nick()}), headers: {"Title": "vote"}, keepalive: true}).catch(function(){}); } catch(x) {}
  }
  function myRecord(VJ, L){
    var V = myVotes(), w = 0, n = 0, run = 0, last = null;
    Object.keys(V).sort().forEach(function(d){
      var r = resOf(d, VJ, L); if (r == null || r === 0) return;
      n++; var ok = V[d] === r; if (ok) w++; run = ok ? (run > 0 ? run + 1 : 1) : 0; last = {d: d, ok: ok};
    });
    return {w: w, n: n, run: run, last: last};
  }
  function resOf(d, VJ, L){
    var x = VJ && VJ.days && VJ.days[d]; if (x && x.res != null) return x.res;
    if (L && L.date === d && String(L.t || "") >= "15:30"){ var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0]; if (k) return k.chg > 0 ? 1 : k.chg < 0 ? -1 : 0; }
    return null;
  }
  function chgOf(d, VJ, L){ var x = VJ && VJ.days && VJ.days[d]; if (x && x.chg != null) return x.chg; if (L && L.date === d){ var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0]; if (k) return k.chg; } return null; }
  function voteCard(){
    var b = document.getElementById("hmbody"); if (!b) return;
    Promise.all([gj("archive/x/prob.json" + q5()), gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/vote.json" + q5())]).then(function(r){
      var PB = r[0], L = r[1], VJ = r[2] || {}; if (!onHome()) return;
      var T = target(PB, L), V = myVotes(), mine = V[T.day], dx = (VJ.days || {})[T.day] || {}, kr = PB && PB.markets && PB.markets.KR;
      var joeyP = dx.joey_p != null ? dx.joey_p : kr && kr.next_day === T.day && kr.p1 != null ? Math.round(kr.p1 * 100) : null;
      var joey = joeyP == null ? "" : joeyP >= 50 ? "📈 오른다" : "📉 내린다";
      var rec = myRecord(VJ, L), h = '';
      // 어제(가장 최근) 결과 먼저
      var prev = Object.keys(V).filter(function(d){ return d < T.day || (d === T.day && !T.open && !T.session); }).sort().pop();
      if (prev){ var pr = resOf(prev, VJ, L), pc = chgOf(prev, VJ, L);
        if (pr != null && pr !== 0) h += '<div class="hv-res ' + (V[prev] === pr ? "ok" : "no") + '">' + (V[prev] === pr ? "✅ 맞혔어요!" : "❌ 아쉬워요") + ' <span>' + md(prev) + ' 코스피 ' + sg(pc) + ' · 내 답 ' + (V[prev] > 0 ? "📈" : "📉") + '</span></div>'; }
      if (T.session){
        var k = (L.index || []).filter(function(i){ return i.name === "코스피"; })[0], my = V[T.day];
        h += '<div class="hv-q">오늘 코스피, 3시 반에 결과</div>' + (my && k ? '<div class="hv-now">내 답 ' + (my > 0 ? "📈 오른다" : "📉 내린다") + ' · 지금 코스피 <b class="' + cls(k.chg) + '">' + sg(k.chg) + '</b> → ' + ((my > 0) === (k.chg > 0) ? '<b class="ok">맞는 중</b>' : '<b class="no">틀리는 중</b>') + '</div>' : '<div class="hv-now mut">오늘은 투표가 끝났어요 (9시 전까지) · 내일 아침에 참여해 보세요</div>');
      } else if (T.open){
        h += '<div class="hv-q">' + dayLab(T.day) + ' 코스피, 오를까요? <small>' + (T.day === today() ? "9시 전까지" : dayLab(T.day) + " 9시 전까지") + ' · 바꿀 수 있어요</small></div>' +
          '<div class="hv-bt"><button type="button" data-hv="1" class="' + (mine === 1 ? "on" : "") + '">📈 오른다</button><button type="button" data-hv="-1" class="' + (mine === -1 ? "on" : "") + '">📉 내린다</button></div>';
        var tot = (dx.up || 0) + (dx.dn || 0);
        h += '<div class="hv-sub">' + (joey ? '🧒 조이는 <b>' + joey + '</b>' + (joeyP != null ? ' (오를 확률 ' + joeyP + '%)' : '') : '') + (tot ? ' · 동료 ' + tot + '명 중 📈 ' + Math.round((dx.up || 0) / tot * 100) + '%' : '') + '</div>';
      } else {
        h += '<div class="hv-q">다음 투표는 ' + dayLab(T.day) + ' 아침에 열려요</div>';
      }
      // 기록 · 조이 vs 사람 · 주간 순위
      var Wk = VJ.week || {}, rows = Wk.rows || [], me = dev().slice(0, 4), jw = Wk.joey || {}, pw = Wk.people || {};
      var foot = [];
      if (rec.n) foot.push('내 기록 <b>' + rec.w + '/' + rec.n + '</b>' + (rec.run >= 2 ? ' · 🔥 ' + rec.run + '연속' : ''));
      if (jw.n) foot.push('이번 주 🧒 조이 ' + jw.w + '/' + jw.n + ' vs 👥 사람 ' + (pw.n ? Math.round(pw.w / pw.n * 100) + '%' : '–'));
      var rank = rows.length ? '<div class="hv-rk"><small>🏆 이번 주 순위 (' + md(Wk.from) + '~)</small>' + rows.slice(0, 3).map(function(x, i){ return '<div class="' + (x.id === me ? "me" : "") + '"><span>' + ["🥇", "🥈", "🥉"][i] + '</span><b>' + e(x.nm) + '</b><span>' + x.w + '/' + x.n + '</span></div>'; }).join("") +
        (rows.slice(3).some(function(x){ return x.id === me; }) ? '<div class="me"><span>' + (rows.map(function(x){ return x.id; }).indexOf(me) + 1) + '위</span><b>나</b><span></span></div>' : '') + '</div>' : '';
      var html = '<div class="hm-h"><span class="hm-i">🎯</span><div><b>1탭 예측</b><small>동료 PB와 맞히기 · 재미로</small></div><button type="button" class="hv-nk" data-hvnk="1">' + (nick() ? '별명 ' + e(nick()) + ' ✏️' : '✏️ 별명 정하기') + '</button></div>' + h +
        (foot.length ? '<div class="hv-ft">' + foot.join(" · ") + '</div>' : '') + rank;
      var ex = document.getElementById("hbvote");
      if (!ex){ ex = document.createElement("section"); ex.id = "hbvote"; ex.className = "card hb-vote"; }
      if (ex.getAttribute("data-h") !== html){ ex.innerHTML = html; ex.setAttribute("data-h", html); }
      var pl = b.querySelector("section.card.pl");   // 오늘 한 줄 다음
      if (pl){ if (ex.previousElementSibling !== pl) pl.insertAdjacentElement("afterend", ex); }
      else if (ex.parentNode !== b) b.appendChild(ex);
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-hv],[data-hvnk]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    if (t.dataset.hvnk){
      var n = prompt("순위에 보일 별명 (실명 말고 별명 · 10자 이내)", ls("hb_nick") || "");
      if (n != null){ n = n.trim().slice(0, 10); ls("hb_nick", n || null); var ex0 = document.getElementById("hbvote"); if (ex0) ex0.removeAttribute("data-h"); voteCard(); }
      return;
    }
    // 🔍 11/05 B7 「순위에 PB-xxxx 같은 자동 별명 말고」 — 첫 투표 때 별명을 먼저 정함(비우면 「익명」으로 순위에선 빠짐)
    if (!ls("hb_nick") && !ls("hb_nick_ask")){ ls("hb_nick_ask", 1); var n0 = prompt("이번 주 순위에 보일 별명을 정해 주세요 (실명 말고 · 10자 이내)\n비우면 순위에 안 나와요", ""); if (n0 && n0.trim()) ls("hb_nick", n0.trim().slice(0, 10)); }
    Promise.all([gj("archive/x/prob.json" + q5()), gj("archive/x/live_kr.json" + q5(), 120000)]).then(function(r){
      var T = target(r[0], r[1]); if (!T.open){ toast("지금은 투표 시간이 아니에요"); return; }
      sendVote(T.day, +t.dataset.hv); toast((+t.dataset.hv > 0 ? "📈 오른다" : "📉 내린다") + " — " + dayLab(T.day) + " 3시 반에 채점해요");
      try { if (navigator.vibrate) navigator.vibrate(12); } catch(x) {}
      var ex = document.getElementById("hbvote"); if (ex) ex.removeAttribute("data-h"); voteCard();
    });
  }, true);

  /* ───────── C7 📨 이번 주 한 장 ───────── */
  function weekWin(){ var d = kst(), w = d.getUTCDay(), m = d.getUTCHours() * 60 + d.getUTCMinutes(); return (w === 5 && m >= 15 * 60 + 30) || w === 6 || w === 0; }
  function weekCard(){
    var b = document.getElementById("hmbody"); if (!b) return;
    var ex = document.getElementById("wk1");
    if (!weekWin()){ if (ex) ex.remove(); return; }
    if (!ex){
      ex = document.createElement("section"); ex.id = "wk1"; ex.className = "card hb-wk";
      ex.innerHTML = '<div class="hb-wkb"><span>📨</span><div><b>이번 주 한 장</b><small>5개 시장 한 주 · 강했던·약했던 업종 · 다음 주 일정 — 고객에게 바로 보내기</small></div><i>›</i></div><div class="hb-wkp" id="wk1p"></div>';
      ex.onclick = function(ev){ if (ev.target.closest("[data-goto]")) return; weekSend(); };
    }
    // 이번 주 내 포트 한 줄 (홈 「이번 주 복기」 카드를 여기로 합침)
    var Wk = H0 && H0.week, pp = document.getElementById("wk1p");
    if (pp && Wk && Wk.days && !pp.innerHTML){
      var it = [["기본", Wk.base], ["공격", Wk.kick], ["집중", Wk.conc]].filter(function(x){ return x[1] != null; });
      pp.innerHTML = '<span data-goto="port">💼 이번 주 내 포트 ' + it.map(function(x){ return x[0] + ' <b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b>'; }).join(" · ") + ' <span class="mut">vs S&amp;P ' + sg(Wk.spy) + '</span> ›</span>';
    }
    var v = document.getElementById("hbvote") || b.querySelector("section.card.pl");
    if (v){ if (ex.previousElementSibling !== v) v.insertAdjacentElement("afterend", ex); } else if (ex.parentNode !== b) b.appendChild(ex);
  }
  function weekSpec(){
    var it = window.M && M.cats && M.cats.sector && M.cats.sector[0];
    return Promise.all([it ? gj("archive/sector/" + it.id + "/compass.json") : null, window.__pbbrief ? __pbbrief() : gj("archive/x/pbbrief.json" + q5())]).then(function(r){
      var C = r[0], PB = r[1] || {}; if (!C || !C.markets) return null;
      var MK = [["KR", "🇰🇷", "코스피"], ["US", "🇺🇸", "S&P500"], ["JP", "🇯🇵", "닛케이"], ["CN", "🇨🇳", "상해"], ["HK", "🇭🇰", "항셍"]], world = [], lastD = "";
      MK.forEach(function(k){ var m = C.markets[k[0]], ix = m && (m.index || [])[0]; if (ix && ix.chg5 != null){ world.push({f: k[1], n: k[2], v: ix.chg5, s: md(ix.date) + "까지"}); if (ix.date > lastD) lastD = ix.date; } });
      var secs = [];
      ["KR", "US"].forEach(function(k){ var m = C.markets[k]; ((m && m.sectors) || []).forEach(function(s){ if (s.r5 != null && (s.n || 0) >= 5) secs.push({n: (k === "KR" ? "🇰🇷 " : "🇺🇸 ") + (s.pn || s.name).replace(/\(.*?\)/g, ""), v: s.r5}); }); });
      secs.sort(function(a, b){ return b.v - a.v; });
      var bars = secs.length >= 6 ? secs.slice(0, 3).concat(secs.slice(-3)) : secs;
      var up = world.filter(function(w){ return w.v > 0; }), best = world.slice().sort(function(a, b){ return b.v - a.v; })[0], worst = world.slice().sort(function(a, b){ return a.v - b.v; })[0];
      var one = world.length ? "이번 주 5개 시장 중 " + up.length + "곳 상승 — 가장 강한 곳 " + best.n + " " + sg(best.v) + ", 가장 약한 곳 " + worst.n + " " + sg(worst.v) + "." : "";
      var watch = ((PB.advice && PB.advice.watch) || []).map(function(w){ return {n: w[1], v: w[0], vc: "#5d667a"}; });
      var plan = ((PB.advice && PB.advice.plan) || [])[0] || "";
      var wkFrom = new Date(Date.parse((lastD || today()) + "T00:00:00Z") - 4 * 864e5).toISOString().slice(0, 10);
      return {kind: "screen", scene: "city_" + (up.length >= 3 ? "up" : up.length <= 1 ? "down" : "flat"), mood: up.length >= 3 ? "up" : up.length <= 1 ? "down" : "flat",
        title: "이번 주 한 장", sub: md(wkFrom) + " ~ " + md(lastD) + " · 5개 시장 한 주 흐름",
        blocks: [["world", world], ["note", {h: "📌 한 주 정리", t: one, tone: "dark", max: 3}], ["bars", bars.length ? {title: "한 주 강했던 업종 · 약했던 업종 (5일)", items: bars} : null],
          ["list", watch.length ? {title: "📅 다음 주 볼 일정", items: watch, rank: false} : null], ["note", plan ? {h: "🧭 자산배분 원칙", t: plan, tone: "info", max: 3} : null]],
        note: "주간 등락은 각 시장 마지막 5거래일 기준"};
    });
  }
  function weekSend(){
    var O = window.__onepage; if (!O || !O.draw || !O.ready){ toast("잠시 뒤 다시 눌러 주세요"); return; }
    toast("이번 주 한 장 만드는 중…");
    weekSpec().then(function(C){
      if (!C){ toast("자료를 못 가져왔어요"); return; }
      var nm = ""; try { nm = localStorage.getItem("pbname") || ""; } catch(x) {}
      var c = O.draw(C, nm);
      c.toBlob(function(b){ if (!b){ toast("만들지 못했어요"); return; }
        O.ready([new File([b], "이번주_한장_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"})], "이번 주 한 장"); }, "image/png");
    }).catch(function(x){ console.warn(x); toast("만들지 못했어요"); });
  }
  window.__weekSend = weekSend;

  /* ───────── 붙이기 ───────── */
  var H0 = null;
  function loadH(){ return gj(RAWM + "home.json" + q5()).then(function(H){ if (H) H0 = H; return H0; }); }
  function apply(){
    if (!onHome()) return;
    try { fold(); } catch(x) { console.warn("fold", x); }
    try { weekCard(); } catch(x) {}
    try { luckChip(); } catch(x) {}
    loadH().then(function(H){ if (onHome()){ try { sinceCard(H); } catch(x) { console.warn("since", x); } try { weekCard(); } catch(x) {} } });
    voteCard();
    if (Date.now() - LIVE_T > 60000){ LIVE_T = Date.now(); liveStrip(); }
    if (!document.hidden) clearBadge();
  }
  var T = 0;
  function soon(){ if (T) return; T = setTimeout(function(){ T = 0; apply(); }, 150); }
  try { new MutationObserver(function(ms){
    for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && (t.closest("#hbvote") || t.closest("#hblive") || t.closest("#hbsince") || t.closest("#wk1"))) continue; soon(); return; }
  }).observe(document.getElementById("main") || document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (onHome() && !document.hidden){ LIVE_T = 0; apply(); } }, 5 * 60e3);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden && onHome()){ LIVE_T = 0; apply(); } });

  var css = document.createElement("style");
  css.textContent =
    ".hf-c .hf-x{display:none!important}.hf-c.hf-open .hf-x{display:block!important}.hf-c.hf-open .tz-race.hf-x,.hf-c.hf-open .hm-sp.hf-x{display:block!important}.hf-gone{display:none!important}" +
    ".hf-row{margin:6px 0 0}.hf-b{font:inherit;font-size:13px;font-weight:700;color:var(--sub);background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:6px 12px;cursor:pointer}" +
    ".hb-since .hb-si{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line);cursor:pointer}.hb-since .hb-si:first-of-type{border-top:0}.hb-si>span{font-size:20px;flex:none;width:28px;text-align:center}.hb-si div{flex:1;min-width:0}.hb-si b{display:block;font-size:15px;line-height:1.4}.hb-si small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hb-si i{font-style:normal;color:var(--sub)}" +
    ".hb-since{box-shadow:0 0 0 2px rgba(57,135,229,.45)}" +
    ".hb-live .hb-lh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}.hb-live .hb-lh b{font-size:15.5px}.hb-live .hb-lh span{font-size:12px}.hb-lr{font-size:14px;line-height:1.5;padding:5px 0;border-top:1px solid var(--line)}.hb-lr:first-of-type{border-top:0}.hb-lr b{margin-right:4px}.hb-lr a{color:inherit;text-decoration:underline;text-decoration-color:var(--line)}" +
    ".hb-luck{display:inline-flex;align-items:center;gap:4px;margin:8px 0 0;font:inherit;font-size:13px;font-weight:700;color:#1d2433;background:rgba(255,255,255,.88);border:0;border-radius:999px;padding:6px 12px;cursor:pointer}.hb-luck b{color:#7b4dff}" +
    ".hb-vote .hm-h{position:relative}.hv-nk{margin-left:auto;font:inherit;font-size:12px;color:var(--sub);background:none;border:1px solid var(--line);border-radius:999px;padding:4px 9px;white-space:nowrap}" +
    ".hv-q{font-size:16.5px;font-weight:800;margin:6px 0 8px}.hv-q small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px}" +
    ".hv-bt{display:flex;gap:8px}.hv-bt button{flex:1;font:inherit;font-size:17px;font-weight:800;padding:14px 0;border-radius:14px;border:1.5px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}.hv-bt button.on{border-color:#3987e5;background:rgba(57,135,229,.14)}.hv-bt button:active{transform:scale(.97)}" +
    ".hv-sub{font-size:13px;color:var(--sub);margin-top:8px}.hv-now{font-size:14.5px;line-height:1.5}.hv-now .ok,.hv-res.ok{color:#2f9e44}.hv-now .no,.hv-res.no{color:#d6453d}" +
    ".hv-res{font-size:15px;font-weight:800;margin:4px 0 6px}.hv-res span{font-size:13px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".hv-ft{font-size:13px;color:var(--sub);margin-top:10px;padding-top:8px;border-top:1px solid var(--line)}" +
    ".hv-rk{margin-top:8px}.hv-rk small{display:block;font-size:12px;color:var(--sub);margin-bottom:4px}.hv-rk div{display:flex;gap:8px;align-items:center;font-size:14px;padding:3px 0}.hv-rk div b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hv-rk div.me b{color:#3987e5}" +
    ".hb-wk{cursor:pointer;background:linear-gradient(135deg,rgba(57,135,229,.14),rgba(124,156,255,.08))!important}.hb-wkb{display:flex;align-items:center;gap:12px}.hb-wkb>span{font-size:28px}.hb-wkb div{flex:1;min-width:0}.hb-wkb b{display:block;font-size:16.5px}.hb-wkb small{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.4}.hb-wkb i{font-style:normal;font-size:20px;color:var(--sub)}.hb-wkp{font-size:13.5px;margin-top:10px;padding-top:9px;border-top:1px solid var(--line)}.hb-wkp:empty{display:none}";
  document.head.appendChild(css);
})();
;
__bk(65);
/* ======== home2.js ======== */
/* CH Investing — 🏠 오늘 v2 시안 (10/31 사용자: 「오늘 카테고리 임팩트가 약해 — 우와 소리 나고, 오늘이 좋아서 다른 카테고리도 열어 보게」)
   10/31 13:00 「싹 바꿔서 적용」 → 모든 사람 기본으로 켬 · 예전 홈으로 돌아가기: 주소 끝에 ?home2=0 (다시 켜기 ?home2=1)
   ① 📍 스토리 링 — 맨 위 동그라미 8개(밤사이 미국 · 한국 · 돈 몰리는 곳 · 큰손 · 차트 신호 · 상품 · 내 포트 · 운세).
      오늘 안 본 건 무지개 테두리. 누르면 꽉 찬 화면 스토리(넘기기·자동 6초) → 마지막에 「○○ 탭에서 자세히」
   ② 🌏 5개 시장 타일 — 큰 숫자 + 5일 흐름 · 누르면 나침반
   ③ ✨ 오늘의 발견 — 옆으로 넘기는 큰 카드: 카테고리마다 가장 눈에 띄는 숫자 하나(큰손이 함께 산 종목 · 컵 돌파 임박 · 브라질 국채 · ELS · 펀드 1위 · 제안서 · 피드 · 운세)
   ④ 🗺 업종 지도 — 한국(장중·마감) 또는 미국 업종을 넓이·색으로 한눈에
   나머지(오늘 한 줄 · 1탭 예측 · 내 포트 · 바뀐 것)는 그대로 아래에. 숫자는 전부 앱이 이미 받는 자료 그대로 — 지어내지 않음 */
(function(){
  var ON_K = "home2";
  try { var qm = /[?&]home2=(\d)/.exec(location.search); if (qm) localStorage.setItem(ON_K, qm[1]); } catch(x) {}
  function on(){ try { return localStorage.getItem(ON_K) !== "0"; } catch(x) { return true; } }   // 10/31 13:00 사용자 「이렇게 싹 바꿔서 적용」 → 모두 기본으로 켬 (예전 홈은 ?home2=0)
  window.home2On = on;
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  var WDK = ["일", "월", "화", "수", "목", "금", "토"];
  function wd(d){ return d ? WDK[new Date(String(d).slice(0, 10) + "T00:00:00Z").getUTCDay()] : ""; }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var k = d == null ? 1 : d, a = Math.abs(+v).toFixed(k); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }   // 🎨 11/04: 「−0.0%」 안 나오게
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function q5(){ return "?" + Math.floor(Date.now() / 300000); }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 300000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0] : null; }
  function arc(cat, name){ var it = latest(cat); return it && (it.files || []).indexOf(name) >= 0 ? gj("archive/" + cat + "/" + it.id + "/" + name) : Promise.resolve(null); }
  function short(n){ var t = String(n || "").replace(/\s+(Common Stock|Ordinary Shares|Class [A-Z]).*$/i, "").replace(/\s+-\s.*$/, ""); return t.replace(/,?\s*(Inc\.?|Corporation|Corp\.?|Ltd\.?|Holdings|plc)$/i, "").trim(); }
  function nm(code, name){ var m = window.SIGNM || {}; return m[code] || (name && /[가-힣]/.test(name) ? name : short(name)) || code; }
  function nmT(code, name){ var k = nm(code, name); return k === code ? code : k; }
  function goTab(t){ var p = String(t).split("~"); if (window.goTo) goTo(p[0], p[1]); else go(p[0]); }
  function heatBg(v, a){ var x = Math.min(1, Math.abs(v || 0) / 3); a = a == null ? 1 : a; return v > 0 ? "rgba(214,69,61," + (0.18 + x * 0.72) * a + ")" : v < 0 ? "rgba(47,111,221," + (0.18 + x * 0.72) * a + ")" : "rgba(140,148,168," + 0.35 * a + ")"; }
  var JOEY = {joy: "img/kid_joy.jpg?v=1", umb: "img/kid_umb.jpg?v=1", thumb: "img/kid_thumb.jpg?v=1", globe: "img/kid_globe.jpg?v=1", piggy: "img/kid_piggy.jpg?v=1", detect: "img/kid_detect.jpg?v=1", wow: "img/guide_src.jpg?v=1", think: "img/kid_think.jpg?v=1", wave: "img/kid_wave.jpg?v=1", night: "img/kid_night.jpg?v=1"};

  /* ───────── 자료 한 번에 ───────── */
  var D = null, DT = 0;
  function load(){
    if (D && Date.now() - DT < 120000) return Promise.resolve(D);
    var sec = latest("sector");
    return Promise.all([
      gj("archive/x/live_kr.json" + q5(), 120000), gj("archive/x/live_us.json" + q5(), 120000), gj("archive/x/live_jp.json" + q5(), 120000),
      gj("archive/x/live_cn.json" + q5(), 120000), gj("archive/x/live_hk.json" + q5(), 120000),
      gj(RAWM + "market/home.json" + q5()), sec ? gj("archive/sector/" + sec.id + "/compass.json") : null,
      gj("archive/x/whale_pick.json" + q5()), gj("archive/x/whale_x.json" + q5()), arc("cup", "cards.json"), arc("gap", "cards.json"),
      gj("archive/x/products.json" + q5(), 600000), gj("archive/x/prob.json" + q5()), gj(RAWM + "feeds/hot.json" + q5()), gj("archive/x/pbbrief.json" + q5(), 300000),   // 🎨 11/04: 오늘 한 줄(pbbrief)
      window.SIGNMP || null, gj(RAWM + "market/bear.json" + q5()), gj(RAWM + "market/bubble.json" + q5())   // 🐻 11/09 하락장 계기판 · 🫧 11/10 버블 경보판
    ]).then(function(r){
      D = {kr: r[0], us: r[1], jp: r[2], cn: r[3], hk: r[4], H: r[5] || {}, C: r[6], wp: r[7], wx: r[8], cup: r[9], gap: r[10], pd: r[11], pb: r[12], hot: r[13], brief: r[14], bear: r[16], bub: r[17]};
      DT = Date.now(); return D;
    });
  }
  function ix(J, n){ return J ? ((J.index || []).filter(function(x){ return x.name === n; })[0] || null) : null; }
  function liveNow(J){ return J && J.date === today() && J.t && J.t < "15:31"; }

  /* ───────── 이야기(스토리) 만들기 — 장면마다 {bg, joey, title, sub, html, cta:[탭, 글]} ───────── */
  function seenKey(id){ return "h2_seen_" + id; }
  function seen(id){ return ls(seenKey(id)) === today(); }
  function markSeen(id){ ls(seenKey(id), today()); }
  function bigNum(v, unit){ return '<div class="s2-big ' + cls(v) + '">' + sg(v) + (unit ? '<small>' + unit + '</small>' : '') + '</div>'; }
  function bars(rows){   // [{n, v, s}]
    var mx = Math.max.apply(null, rows.map(function(r){ return Math.abs(r.v); }).concat([0.5]));
    return '<div class="s2-bars">' + rows.map(function(r){ var w = Math.abs(r.v) / mx * 46;
      return '<div class="s2-br"><span class="n">' + e(r.n) + (r.s ? '<small>' + e(r.s) + '</small>' : '') + '</span><span class="t"><i class="z"></i><i class="b ' + (r.v >= 0 ? "u" : "d") + '" style="' + (r.v >= 0 ? "left:50%" : "right:50%") + ';width:' + w.toFixed(1) + '%"></i></span><b class="' + cls(r.v) + '">' + sg(r.v) + '</b></div>'; }).join("") + '</div>'; }
  function stories(d){
    var S = [], H = d.H || {}, P = H.port || {};
    // 🌙 밤사이 미국
    var sp = ix(d.us, "S&P500"), nq = ix(d.us, "나스닥");
    if (sp){
      var usd = d.us.t && d.us.t < "12:00" ? new Date(Date.parse(d.us.date + "T00:00:00Z") - 864e5).toISOString().slice(0, 10) : d.us.date;
      var secs = (d.us.sectors || []).filter(function(s){ return s.n >= 5; }).slice().sort(function(a, b){ return b.r - a.r; });
      var big = (d.us.value || []).slice(0, 3);
      S.push({id: "us", ic: "🇺🇸", lab: "밤사이 미국", grad: ["#1b2a52", "#3b5bdb"], slides: [
        {joey: sp.chg >= 0 ? JOEY.joy : JOEY.umb, title: "밤사이 미국 " + md(usd) + "(" + wd(usd) + ")", html: '<div class="s2-k">S&amp;P500</div>' + bigNum(sp.chg) + '<div class="s2-row"><span>나스닥 <b class="' + cls(nq && nq.chg) + '">' + sg(nq && nq.chg) + '</b></span><span>오른 종목 <b>' + (d.us.up || 0) + '</b>/' + (d.us.total || 0) + '</span></div>' +
          '<div class="s2-gauge"><i style="width:' + Math.round((d.us.up || 0) / Math.max(1, d.us.total || 1) * 100) + '%"></i></div><p class="s2-p">' + (sp.chg <= -1.5 ? "크게 흔들린 밤이에요. 하루 급락은 흔히 되돌림이 나와요." : sp.chg >= 1.5 ? "시원하게 오른 밤이에요." : "큰 방향 없이 지나간 밤이에요.") + '</p>'},
        secs.length ? {joey: JOEY.globe, title: "미국에서 돈이 간 곳 · 빠진 곳", html: bars(secs.slice(0, 3).concat(secs.slice(-3)).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, ""), v: s.r}; }))} : null,
        big.length ? {joey: JOEY.detect, title: "거래가 가장 몰린 종목", html: '<div class="s2-list">' + big.map(function(x, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(x.n) + '<small>' + e(x.s) + '</small></b><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></div>'; }).join("") + '</div>'} : null
      ].filter(Boolean), cta: ["sector", "🧭 시장 흐름에서 5개 시장 보기"]});
    }
    // 🇰🇷 한국
    var ks = ix(d.kr, "코스피"), kq = ix(d.kr, "코스닥");
    if (ks){
      var live = liveNow(d.kr), ksec = (d.kr.sectors || []).filter(function(s){ return s.n >= 5; }).slice().sort(function(a, b){ return b.r - a.r; });
      var ups = d.kr.total ? Math.round((d.kr.up || 0) / d.kr.total * 100) : null;
      S.push({id: "kr", ic: "🇰🇷", lab: live ? "지금 한국" : "한국 마감", grad: ["#4a1c2a", "#d6453d"], slides: [
        {joey: ks.chg >= 0 ? JOEY.joy : JOEY.umb, title: (live ? "지금 코스피 · " + d.kr.t : "코스피 " + md(d.kr.date) + "(" + wd(d.kr.date) + ") 마감"), html: '<div class="s2-k">코스피 ' + Math.round(ks.last || 0).toLocaleString() + '</div>' + bigNum(ks.chg) +
          '<div class="s2-row"><span>코스닥 <b class="' + cls(kq && kq.chg) + '">' + sg(kq && kq.chg) + '</b></span><span>오른 종목 <b>' + (ups == null ? "–" : ups + "%") + '</b></span></div><div class="s2-gauge"><i style="width:' + (ups || 0) + '%"></i></div>'},
        ksec.length ? {joey: JOEY.globe, title: "업종 1등 · 꼴등", html: bars(ksec.slice(0, 3).concat(ksec.slice(-3)).map(function(s){ return {n: (s.icon || "") + " " + s.name.replace(/\(.*?\)/g, ""), v: s.r}; }))} : null,
        (d.kr.value || []).length ? {joey: JOEY.detect, title: "돈이 가장 몰린 종목", html: '<div class="s2-list">' + d.kr.value.slice(0, 4).map(function(x, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(x.n) + '<small>거래 ' + Math.round(x.v || 0).toLocaleString() + '억</small></b><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></div>'; }).join("") + '</div>'} : null
      ].filter(Boolean), cta: ["market", "🌐 시황에서 오늘 전략 보기"]});
    }
    // 🔥 돈 몰리는 곳 (집중 테마)
    var F = H.focus || [];
    if (F.length) S.push({id: "focus", ic: "🔥", lab: "돈 몰리는 곳", grad: ["#4a2a10", "#f08c00"], slides: F.slice(0, 3).map(function(t){
      return {joey: JOEY.thumb, title: "돈이 몰리는 테마", html: '<div class="s2-k">' + e(t.stage || "") + '</div><div class="s2-big2">' + e(t.name) + '</div><div class="s2-row"><span>5일 <b class="' + cls(t.r5) + '">' + sg(t.r5) + '</b></span><span>S&amp;P보다 20일 <b class="' + cls(t.rs20) + '">' + sg(t.rs20) + '</b></span></div>' +
        ((t.stars || []).length ? '<div class="s2-chips">' + t.stars.slice(0, 3).map(function(s){ return '<span>★ ' + e(s.name) + ' <small>' + e(s.t) + '</small></span>'; }).join("") + '</div>' : '') + (t.do ? '<p class="s2-p">' + e(t.do) + '</p>' : '')}; }), cta: ["market~mkfo", "🎯 오늘 집중 자세히"]});
    // 🐋 큰손
    var pk = d.wp && d.wp.pick, cons = (d.wx && d.wx.consensus) || [];
    if (pk || cons.length) S.push({id: "whale", ic: "🐋", lab: "큰손", grad: ["#0b3b3a", "#12b886"], slides: [
      pk ? {joey: JOEY.detect, title: "오늘의 큰손 픽", html: '<div class="s2-k">고래 점수 ' + Math.round(pk.tot) + '점</div><div class="s2-big2">' + e(pk.n) + ' <small>' + e(pk.s) + '</small></div><div class="s2-row"><span>20일 <b class="' + cls(pk.r20) + '">' + sg(pk.r20) + '</b></span><span>어제 <b class="' + cls(pk.r1) + '">' + sg(pk.r1) + '</b></span></div><ul class="s2-ul">' + (pk.why || []).slice(0, 3).map(function(w){ return '<li>' + e(w) + '</li>'; }).join("") + '</ul>'} : null,
      cons.length ? {joey: JOEY.wow, title: "유명 투자자들이 함께 산 종목", html: '<div class="s2-list">' + cons.slice(0, 3).map(function(c, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(c.t)) + ' <em>' + e(c.t) + '</em><small>' + e((c.by || []).slice(0, 3).join(" · ")) + (c.n > 3 ? " 외 " + (c.n - 3) : "") + '</small></b><span>' + c.n + '명</span></div>'; }).join("") + '</div><p class="s2-p">' + e(d.wx.quarter || "") + ' 공시 기준 · 지금 가격은 그때보다 ' + sg(cons[0].vs) + '</p>'} : null
    ].filter(Boolean), cta: ["whale", "🐋 고래 탭에서 40명 보기"]});
    // ☕📈 차트 신호
    var cupT = d.cup && d.cup.top || [], gapT = d.gap && d.gap.top || [];
    var near = cupT.filter(function(c){ return c.dist != null && c.dist > -5 && c.dist <= 3; }).sort(function(a, b){ return (b.brk ? 1 : 0) - (a.brk ? 1 : 0) || Math.abs(a.dist) - Math.abs(b.dist); });
    if (cupT.length || gapT.length) S.push({id: "chart", ic: "☕", lab: "차트 신호", grad: ["#3d2a10", "#e8a33d"], slides: [
      cupT.length ? {joey: JOEY.detect, title: "컵 모양 — 막 돌파했거나 곧 돌파", html: '<div class="s2-k">후보 ' + (d.cup.total || cupT.length) + '개 중 ' + near.length + '개</div><div class="s2-list">' + (near.length ? near : cupT).slice(0, 4).map(function(c, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(c.code, c.name)) + ' <em>' + e(String(c.code).replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "")) + '</em><small>' + e(c.sector && c.sector !== "미분류" ? c.sector : c.mkt) + ' · ' + (c.shape || "") + ' 컵 · 깊이 ' + Math.round(c.depth || 0) + '%</small></b><span class="' + (c.brk ? "up" : "") + '">' + (c.brk ? "🚀 돌파" : "−" + Math.abs(c.dist).toFixed(1) + "%") + '</span></div>'; }).join("") + '</div><p class="s2-p">숫자 = 돌파 가격(피벗)까지 남은 거리</p>'} : null,
      gapT.length ? {joey: JOEY.wow, title: "힘차게 뛰어오른 갭", html: '<div class="s2-list">' + gapT.slice(0, 4).map(function(g, i){ return '<div><span class="r">' + (i + 1) + '</span><b>' + e(nm(g.code, g.name)) + ' <em>' + e(String(g.code).replace(/\.(KS|KQ|T|HK|SS|SZ)$/, "")) + '</em><small>' + md(g.gday) + ' 갭 · 그 뒤 ' + sg(g.after, 0) + ' · ' + (g.hold ? "갭 지키는 중" : "갭 메움") + '</small></b><span class="up">+' + (+g.gap).toFixed(1) + '%</span></div>'; }).join("") + '</div>'} : null
    ].filter(Boolean), cta: ["cup", "☕ 컵 탭에서 차트 보기"]});
    // 🛍️ 상품
    var pd = d.pd || {}, slides = [];
    var brl = (pd.anb || []).slice().sort(function(a, b){ return (b.r || 0) - (a.r || 0); })[0];
    var kb = (pd.krw || []).slice().sort(function(a, b){ return (b.after || 0) - (a.after || 0); })[0];
    var el = (pd.els || []).filter(function(x){ return !x.e || x.e >= today(); }).sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    var fd = (pd.funds || []).filter(function(f){ return f.m1 != null && f.m1 < 50 && f.buy !== "1"; }).sort(function(a, b){ return b.m1 - a.m1; });
    if (brl || kb) slides.push({joey: JOEY.piggy, title: "지금 살 수 있는 채권", html: (brl ? '<div class="s2-k">🇧🇷 브라질 국채 ' + e(brl.code) + ' · ' + String(brl.mat).slice(0, 4) + '년 만기</div><div class="s2-big up">연 ' + (+brl.r).toFixed(1) + '%</div>' : '') + (kb ? '<div class="s2-row"><span>🇰🇷 원화 채권 세후 최고 <b>' + (+kb.after).toFixed(2) + '%</b></span></div><p class="s2-p">' + e(kb.btype || kb.kind || "") + ' · ' + String(kb.mat).slice(0, 4) + '년 만기 · ' + e(kb.risk || "") + '</p>' : '') + '<p class="s2-p mut">브라질 국채는 헤알화 환율에 따라 원화 수익이 크게 달라져요</p>'});
    if (el.length) slides.push({joey: JOEY.thumb, title: "지금 청약 중인 ELS·ELB", html: '<div class="s2-k">' + el.length + '개 청약 중</div><div class="s2-big up">연 ' + (+el[0].cpn).toFixed(1) + '%</div><p class="s2-p">' + e(el[0].n) + ' · ' + e(el[0].ua || "") + '</p><div class="s2-row"><span>' + (el[0].loss ? "원금 손실 가능" : "원금 지급형") + '</span><span>마감 <b>' + md(el[0].e) + '</b></span></div>'});
    if (fd.length) slides.push({joey: JOEY.joy, title: "한 달 수익률 1등 펀드", html: '<div class="s2-big2">' + e(fd[0].n.replace(/\[.*?\]/g, "").slice(0, 26)) + '</div><div class="s2-big up">' + sg(fd[0].m1) + '<small>1개월</small></div><p class="s2-p">' + e(fd[0].co) + ' · ' + e(fd[0].st || fd[0].t || "") + ' · 1년 ' + sg(fd[0].y1) + '</p>'});
    if (slides.length) S.push({id: "prod", ic: "🛍️", lab: "상품", grad: ["#10304a", "#1c7ed6"], slides: slides, cta: ["bond", "🏦 상품 탭에서 비교하기"]});
    // 💼 내 포트
    if (P.base != null) S.push({id: "port", ic: "💼", lab: "내 포트", grad: ["#3a3010", "#e9c46a"], slides: [{joey: P.conc > P.spy ? JOEY.joy : JOEY.piggy, title: md(P.start) + "부터 내 포트 vs S&P500",
      html: bars([{n: "🎯 집중", v: P.conc}, {n: "⚡ 공격", v: P.kick}, {n: "💼 기본", v: P.base}, {n: "🇺🇸 S&P500", v: P.spy}].filter(function(x){ return x.v != null; }).sort(function(a, b){ return b.v - a.v; })) +
        '<p class="s2-p">' + (P.d1 != null ? md(P.d1_date) + " 하루 기본 " + sg(P.d1) + " · S&P " + sg(P.d1_spy) + ". " : "") + '세계 지수 ' + P.n_bench + '곳 중 ' + P.beat_kick + '곳을 앞섰어요.</p>'}], cta: ["port", "💼 포트에서 담을 비중 보기"]});
    // 🔮 운세 (생일 저장된 사람)
    var L = window.luckToday && luckToday();
    if (L && L.inv != null) S.push({id: "luck", ic: "🔮", lab: "운세", grad: ["#2b1747", "#9c6ade"], slides: [{joey: JOEY.wave, title: e(L.name) + " 님 오늘", html: '<div class="s2-k">오늘 점수 ' + L.sc + '점</div><div class="s2-big2">📈 투자운 ' + L.inv + '점</div>' + (L.word ? '<p class="s2-p">「' + e(L.word) + '」</p>' : '') + '<p class="s2-p mut">재미로 보는 참고예요 — 투자 판단의 근거가 아니에요</p>'}], cta: ["luck", "🔮 오늘의 운세 전부 보기"]});
    return S;
  }

  /* ───────── ① 스토리 링 ───────── */
  function ringsHtml(S){
    return '<div class="h2-rings" id="h2rings">' + S.map(function(s, i){ return '<button type="button" class="h2-ring' + (seen(s.id) ? " seen" : "") + '" data-st="' + i + '"><span class="o"><span class="i">' + s.ic + '</span></span><small>' + e(s.lab) + '</small></button>'; }).join("") + '</div>';
  }
  /* ───────── 스토리 보기 ───────── */
  var SV = null;
  function openStory(S, si){
    closeStory();
    var box = document.createElement("div"); box.id = "h2sv"; document.body.appendChild(box);
    SV = {S: S, si: si, k: 0, t: 0, box: box, paused: false};
    document.documentElement.classList.add("h2-lock");
    box.addEventListener("click", function(ev){
      var t = ev.target;
      if (t.closest("[data-x]")){ closeStory(); return; }
      var c = t.closest("[data-cta]"); if (c){ var tab = c.getAttribute("data-cta"); closeStory(); goTab(tab); return; }
      var w = box.clientWidth; if (ev.clientX < w * 0.3) step(-1); else step(1);
    });
    var y0 = null;
    box.addEventListener("touchstart", function(ev){ y0 = ev.touches[0].clientY; SV && (SV.paused = true); }, {passive: true});
    box.addEventListener("touchend", function(ev){ if (SV) SV.paused = false; if (y0 != null && ev.changedTouches[0].clientY - y0 > 90) closeStory(); y0 = null; }, {passive: true});
    draw();
  }
  function closeStory(){ if (!SV) return; clearInterval(SV.t); SV.box.remove(); SV = null; document.documentElement.classList.remove("h2-lock"); var r = document.getElementById("h2rings"); if (r) paintRings(); }
  function paintRings(){ [].forEach.call(document.querySelectorAll(".h2-ring"), function(b){ var s = (CUR_S || [])[+b.dataset.st]; if (s) b.classList.toggle("seen", seen(s.id)); }); }
  function step(dlt){
    if (!SV) return; var st = SV.S[SV.si];
    SV.k += dlt;
    if (SV.k < 0){ if (SV.si > 0){ SV.si--; SV.k = SV.S[SV.si].slides.length - 1; } else SV.k = 0; }
    else if (SV.k >= st.slides.length){ if (SV.si < SV.S.length - 1){ SV.si++; SV.k = 0; } else { closeStory(); return; } }
    draw();
  }
  function draw(){
    var st = SV.S[SV.si], sl = st.slides[SV.k]; markSeen(st.id);
    var last = SV.k === st.slides.length - 1;
    SV.box.style.background = "linear-gradient(160deg," + st.grad[0] + "," + st.grad[1] + ")";
    SV.box.innerHTML = '<div class="sv-bars">' + st.slides.map(function(_, i){ return '<i class="' + (i < SV.k ? "done" : i === SV.k ? "now" : "") + '"><b></b></i>'; }).join("") + '</div>' +
      '<div class="sv-top"><span class="sv-ic">' + st.ic + '</span><div><b>' + st.ic + ' ' + e(st.lab) + '</b><small>' + (SV.si + 1) + ' / ' + SV.S.length + ' 이야기</small></div><button type="button" data-x="1" aria-label="닫기">✕</button></div>' +
      '<div class="sv-body"><img class="sv-hero" src="' + sl.joey + '" alt=""><h2>' + sl.title + '</h2>' + sl.html + '</div>' +
      '<div class="sv-foot"><button type="button" class="sv-cta' + (last ? " hot" : "") + '" data-cta="' + e(st.cta[0]) + '">' + e(st.cta[1]) + ' ›</button><small>화면 오른쪽 = 다음 · 왼쪽 = 이전 · 아래로 밀면 닫기</small></div>';
    clearInterval(SV.t);
    var t0 = Date.now(), dur = 6500, bar = SV.box.querySelector(".sv-bars i.now b");
    SV.t = setInterval(function(){
      if (!SV) return; if (SV.paused){ t0 += 100; return; }
      var p = Math.min(1, (Date.now() - t0) / dur); if (bar) bar.style.width = (p * 100) + "%";
      if (p >= 1){ clearInterval(SV.t); step(1); }
    }, 100);
  }

  /* ───────── ⑰ 오늘의 숫자 — 그날 제일 중요한 숫자 하나 + 한 줄 이유 (🎨 11/04 사용자 「오늘 한 줄을 맨 위 큰 글씨로」) ─────────
     한국 장중 = 코스피 지금 · 장 끝난 뒤 = 코스피 마감 · 아침 9시 전 = 밤사이 S&P500. 오를 확률이 70% 넘거나 30% 아래면 그게 더 눈에 띄니 그걸로. 한 줄은 pbbrief(오늘 한 장)의 one 그대로 */
  /* 🔍 11/05 A1 「홈 첫 줄은 결론 한 문장」 — 확률 하나로 겁주지 않게: 오늘 할 일(지키기·지켜보기·담기) + 숫자 2개, 확률은 작게(극단값이면 꼬리표) */
  function numHtml(d){
    var ks = ix(d.kr, "코스피"), sp = ix(d.us, "S&P500"), h = kst().getUTCHours() + kst().getUTCMinutes() / 60, wk = [0, 6].indexOf(kst().getUTCDay()) < 0;
    var pk = d.pb && d.pb.markets && d.pb.markets.KR, p1 = pk && pk.p1 != null ? Math.round(pk.p1 * 100) : null;
    try { var lv_ = pk && window.probLive && probLive(pk, d.kr, d.pb); if (lv_ && lv_.p1 != null) p1 = Math.round(lv_.p1 * 100); } catch(x) {}
    var kLive = ks && wk && h >= 8.9 && h < 15.6 && liveNow(d.kr);
    var kv = ks ? +ks.chg : null, sv = sp ? +sp.chg : null;
    var fut = null; try { var tk = (d.brief && d.brief.talk) || []; tk.forEach(function(t){ var m = /S&P500 선물 ([+−\-]?\d+(?:\.\d+)?)%/.exec(t); if (m) fut = +m[1].replace("−", "-"); }); } catch(x) {}
    // 오늘의 결론 — 한국 하락이 크거나 확률이 낮으면 「지키는 날」, 반대면 「담는 날」, 그 밖엔 「지켜보는 날」
    var px_ = p1 != null && (p1 <= 15 || p1 >= 85);   // 🎲 11/10 #2: 극단 확률은 판정에도 화면에도 안 씀 (−45% 하락장 다음 날 「99%」)
    var down = (kv != null && kv <= -1.5) || (p1 != null && !px_ && p1 <= 30), up = (kv != null && kv >= 1.5) || (p1 != null && !px_ && p1 >= 70);
    var V = down && !up ? {ic: "🛡", t: "오늘은 지키는 날", c: "dn", s: "서둘러 팔기보다 비중·현금 점검"} : up && !down ? {ic: "🚀", t: "오늘은 담는 날", c: "up", s: "계획한 분할 매수를 진행할 때"} : {ic: "👀", t: "오늘은 지켜보는 날", c: "", s: "큰 결정은 미루고 흐름 확인"};
    if (down && fut != null && fut >= 0.8) V.s = "미국 선물 " + sg(fut) + " — 반등 기대도 있음 · 추격 매도 금지";
    /* 🐻 11/09 「쉬운 화면은 🔴 조심하는 장인데 여기는 🚀 담는 날?」 — 하루 등락·확률보다 하락장 계기판(종가 판정)이 먼저.
       🐻 하락장: 바닥 신호 0~1개면 절대 「담는 날」 아님(오늘 반등 = 현금 맞출 기회) · 2개↑면 「조금 담는 날」(신호마다 1/3씩)
       🟡 조정: 「담는 날」 → 「지켜보는 날」로 낮춤 */
    var BM = {}; ((d.bear && d.bear.markets) || []).forEach(function(m){ BM[m.key] = m; });
    var bw = [BM.kospi, BM.sp500].filter(function(m){ return m && m.state === "🐻"; })[0], yw = [BM.kospi, BM.sp500].filter(function(m){ return m && m.state === "🟡"; })[0];
    if (bw){
      var bn = bw.n || 0, nm = bw.name + " 하락장(고점 " + sg(bw.dd) + ")", ba = bw.analog;
      if (ba) V = ba.stock > 0 ? {ic: "🌱", t: "오늘은 나눠 담는 날", c: "", s: nm + " · 주식 " + ba.stock + "% — 다시 늘리는 때: " + ba.next}   // 🧭 11/22 계기판(장 꼴 규칙)과 같은 말
                               : {ic: "🛡", t: "오늘은 지키는 날", c: "dn", s: nm + " · 주식 0% — 다시 늘리는 때: " + ba.next + " · 투매는 금지"};
      else if (bn >= 2) V = {ic: "🌱", t: "오늘은 조금 담는 날", c: "", s: nm + " · 바닥 신호 " + bn + "/4 — 현금 " + bw.cash + "%는 남기고 나눠서만"};
      else V = {ic: "🛡", t: "오늘은 지키는 날", c: "dn", s: nm + " · 바닥 신호 " + bn + "/4 — " + (up ? "오늘 반등은 현금 " + bw.cash + "% 맞출 기회 · 새로 사기는 신호 2개부터" : "현금 " + bw.cash + "%까지 · 투매는 금지")};
    } else if (yw && V.c === "up"){
      V = {ic: "👀", t: "오늘은 지켜보는 날", c: "", s: yw.name + " 조정(고점 " + sg(yw.dd) + ") · 오늘 강해도 추격 말고 계획대로 나눠서"};
    }
    var one = d.brief && d.brief.one ? String(d.brief.one).split(" ｜ ").pop() : "";   // 🧭 11/10 앞 절반(하락장 판정)은 바로 위 「오늘의 결론」과 같은 말
    var nums = [];
    if (ks) nums.push({l: "🇰🇷 코스피" + (kLive ? " 지금" : " " + md(d.kr.date)), v: kv});
    if (fut != null && kLive) nums.push({l: "🇺🇸 S&P 선물", v: fut}); else if (sp) nums.push({l: "🇺🇸 S&P500", v: sv});
    var pr = p1 == null ? "" : px_ ? '<span class="h2-np x" data-goto="prob">🎲 오늘은 확률이 극단으로 튀는 날 — 숫자는 참고하지 않아요 ›</span>' : '<span class="h2-np" data-goto="prob">🎲 ' + (pk && pk.open_now ? "오늘" : "다음 장") + ' 오를 확률 <b>' + p1 + '%</b></span>';
    return '<section class="card h2-num wow-big no-clp" data-xc="1" data-cz="done" data-goto="sector"><div class="h2-vd ' + V.c + '"><span>' + V.ic + '</span><b>' + V.t + '</b></div>' +
      '<div class="h2-vs">' + e(V.s) + '</div><div data-vd></div>' + (one ? '<p>' + e(one) + '</p>' : '') +
      '<div class="h2-nn">' + nums.map(function(n){ return '<div><small>' + e(n.l) + '</small><b class="' + cls(n.v) + '">' + sg(n.v) + '</b></div>'; }).join("") + '</div>' + pr + '<div data-flow></div></section>';
  }
  /* ⑳ 하루 흐름 작은 선 — live_*.json 의 snaps([시각, 오른 수, 내린 수, 지수 등락, …]) */
  function spark(J){
    var S = J && J.snaps; if (!S || S.length < 3) return "";
    var v = S.map(function(s){ return +s[3]; }).filter(function(x){ return !isNaN(x); }); if (v.length < 3) return "";
    var mn = Math.min.apply(null, v.concat([0])), mx = Math.max.apply(null, v.concat([0])), rg = (mx - mn) || 1, W = 100, H = 28;
    var pts = v.map(function(x, i){ return (i / (v.length - 1) * W).toFixed(1) + "," + (H - 2 - (x - mn) / rg * (H - 4)).toFixed(1); }).join(" ");
    var zero = (H - 2 - (0 - mn) / rg * (H - 4)).toFixed(1);
    return '<svg class="h2-sp" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="' + zero + '" x2="100" y2="' + zero + '"/><polyline points="' + pts + '"/></svg>';
  }

  /* ───────── ② 5개 시장 타일 ───────── */
  function worldHtml(d){
    var C = d.C && d.C.markets || {};
    var MK = [["KR", "🇰🇷", "코스피", d.kr, "코스피"], ["US", "🇺🇸", "S&P500", d.us, "S&P500"], ["JP", "🇯🇵", "닛케이", d.jp, "닛케이 225"], ["CN", "🇨🇳", "상해", d.cn, "상해종합"], ["HK", "🇭🇰", "항셍", d.hk, "항셍"]];
    var t = MK.map(function(m){ var x = ix(m[3], m[4]), c = C[m[0]], c5 = c && (c.index || [])[0] && c.index[0].chg5; if (!x) return "";
      var lv = liveNow(m[3]) && m[0] !== "US";
      return '<button type="button" class="h2-w' + (m[0] === "KR" || m[0] === "US" ? " big" : "") + '" data-goto="sector" style="background:' + heatBg(x.chg) + '"><span class="f">' + m[1] + '</span><small>' + m[2] + '</small><b>' + sg(x.chg) + '</b><em>' + (lv ? "● " + e(m[3].t) : wd(m[0] === "US" && m[3].t < "12:00" ? new Date(Date.parse(m[3].date + "T00:00:00Z") - 864e5).toISOString() : m[3].date) + " 마감") + '</em>' + (c5 != null ? '<em>5일 ' + sg(c5) + '</em>' : '') + (lv ? spark(m[3]) : '') + '</button>'; }).join("");
    return '<section class="card h2-world"><div class="h2-hd"><b>🌏 5개 시장 지금</b><span class="mut">누르면 시장 흐름 ›</span></div><div class="h2-wg">' + t + '</div></section>';
  }

  /* ───────── ③ 오늘의 발견 ───────── */
  function discHtml(d){
    var C = [], pk = d.wp && d.wp.pick, cons = (d.wx && d.wx.consensus) || [], cupT = d.cup && d.cup.top || [], gapT = d.gap && d.gap.top || [], pd = d.pd || {};
    if (cons.length) C.push({tab: "whale", c: ["#0b3b3a", "#12b886"], ic: "🐋", k: "유명 투자자 " + cons[0].n + "명이 함께 산", big: nm(cons[0].t), sub: cons[0].t + " · " + (cons[0].by || []).slice(0, 2).join(" · ") + " 등", go: "큰손 40명 보기"});
    if (pk) C.push({tab: "whale", c: ["#083344", "#0ca678"], ic: "🐳", k: "오늘의 큰손 픽 · " + Math.round(pk.tot) + "점", big: pk.n, sub: pk.s + " · 20일 " + sg(pk.r20), go: "왜 골랐나"});
    var near = cupT.filter(function(c){ return c.dist != null && c.dist > -5 && c.dist <= 3; }).sort(function(a, b){ return Math.abs(a.dist) - Math.abs(b.dist); });
    if (cupT.length){ var c0 = near[0] || cupT[0]; C.push({tab: "cup", c: ["#3d2a10", "#e8a33d"], ic: "☕", k: "컵 모양 " + (d.cup.total || cupT.length) + "개 중 " + (c0.brk ? "막 돌파" : "돌파 가장 가까운"), big: nm(c0.code, c0.name), sub: String(c0.code).replace(/\.(KS|KQ|T|HK)$/, "") + " · " + (c0.brk ? "돌파 가격 넘음 🚀" : "돌파까지 " + Math.abs(c0.dist).toFixed(1) + "%"), go: "차트 보기"}); }
    if (gapT.length) C.push({tab: "gap", c: ["#2b1747", "#9c6ade"], ic: "📈", k: "갭 점수 1위", big: nm(gapT[0].code, gapT[0].name), sub: String(gapT[0].code).replace(/\.(KS|KQ|T|HK)$/, "") + " · 갭 +" + (+gapT[0].gap).toFixed(1) + "% · " + md(gapT[0].gday), go: "갭 보기"});
    var brl = (pd.anb || []).slice().sort(function(a, b){ return (b.r || 0) - (a.r || 0); })[0];
    if (brl) C.push({tab: "bond", c: ["#0b3d1f", "#2f9e44"], ic: "🇧🇷", k: "브라질 국채 지금 금리", big: "연 " + (+brl.r).toFixed(1) + "%", sub: brl.code + " · " + brl.mat.slice(0, 4) + "년 만기 · 헤알화 환율 따라 달라져요", go: "채권 비교"});
    var el = (pd.els || []).filter(function(x){ return !x.e || x.e >= today(); }).sort(function(a, b){ return (b.cpn || 0) - (a.cpn || 0); });
    if (el.length){ var dd = el[0].e ? Math.round((Date.parse(el[0].e) - Date.parse(today())) / 864e5) : null; C.push({tab: "els", c: ["#4a2a10", "#f08c00"], ic: "🎯", k: "청약 중 ELS·ELB " + el.length + "개 중 최고", big: "연 " + (+el[0].cpn).toFixed(1) + "%", sub: (el[0].ua || "") + (dd != null ? " · 마감 " + (dd <= 0 ? "오늘" : "D-" + dd) : ""), go: "ELS 보기"}); }
    var fd = (pd.funds || []).filter(function(f){ return f.m1 != null && f.m1 < 50 && f.buy !== "1"; }).sort(function(a, b){ return b.m1 - a.m1; });
    if (fd.length) C.push({tab: "fund", c: ["#1b2a52", "#3b5bdb"], ic: "📦", k: "펀드 1,800개 중 한 달 1등", big: sg(fd[0].m1), sub: fd[0].n.replace(/\[.*?\]/g, "").slice(0, 24), go: "펀드 순위"});
    C.push({tab: "prop", c: ["#18263f", "#4c6ef5"], ic: "📝", k: "오늘 시황에 맞춘 제안서", big: "9종 준비", sub: "고객 이름·금액만 넣으면 한 장·PDF·PPT", go: "제안서 만들기"});
    var hot = d.hot && d.hot.items ? Object.keys(d.hot.items).map(function(k){ return d.hot.items[k]; }).filter(function(x){ return x.lv === 1; }).sort(function(a, b){ return a.at < b.at ? 1 : -1; }) : [];
    if (hot.length) C.push({tab: "feed", c: ["#3a1d1d", "#e03131"], ic: "📰", k: "피드 🔴 핵심 · " + md(hot[0].at), big: hot[0].why.split(/ — |—/)[0].slice(0, 28), sub: (hot[0].why.split(/ — |—/)[1] || "").slice(0, 40), go: "피드 보기"});
    var L = window.luckToday && luckToday();
    if (L && L.inv != null) C.push({tab: "luck", c: ["#2b1747", "#c2255c"], ic: "🔮", k: L ? L.name + " 님 오늘 투자운" : "오늘의 운세 · 타로", big: L && L.inv != null ? L.inv + "점" : "생일만 넣으면", sub: L ? "재미로 보는 오늘 기운" : "점수 · 행운의 색 · 투자운까지", go: "운세 보기"});
    return '<section class="h2-disc"><div class="h2-hd"><b>✨ 오늘의 발견</b><span class="mut">옆으로 넘겨 보세요 · ' + C.length + '가지</span></div><div class="h2-dc" id="h2dc">' + C.map(function(x){
      return '<button type="button" class="h2-d" data-goto="' + x.tab + '" style="background:linear-gradient(150deg,' + x.c[0] + ',' + x.c[1] + ')"><span class="ic">' + x.ic + '</span><small>' + e(x.k) + '</small><b>' + e(x.big) + '</b><em>' + e(x.sub) + '</em><span class="go">' + e(x.go) + ' ›</span></button>'; }).join("") + '</div></section>';
  }

  /* ───────── ④ 업종 지도 (넓이 = 종목 수 · 색 = 오늘 등락) ───────── */
  function squarify(items, x, y, w, h){
    var out = [], tot = items.reduce(function(a, b){ return a + b.w; }, 0), rest = items.slice();
    function worst(row, s){ var sum = row.reduce(function(a, b){ return a + b.a; }, 0), mx = Math.max.apply(null, row.map(function(r){ return r.a; })), mn = Math.min.apply(null, row.map(function(r){ return r.a; })); return Math.max(s * s * mx / (sum * sum), sum * sum / (s * s * mn)); }
    rest.forEach(function(it){ it.a = it.w / tot * w * h; });
    while (rest.length){
      var s = Math.min(w, h), row = [rest[0]], i = 1;
      while (i < rest.length && worst(row.concat([rest[i]]), s) <= worst(row, s)){ row.push(rest[i]); i++; }
      var sum = row.reduce(function(a, b){ return a + b.a; }, 0);
      if (w >= h){ var cw = sum / h, yy = y; row.forEach(function(r){ var rh = r.a / cw; out.push({it: r, x: x, y: yy, w: cw, h: rh}); yy += rh; }); x += cw; w -= cw; }
      else { var ch = sum / w, xx = x; row.forEach(function(r){ var rw = r.a / ch; out.push({it: r, x: xx, y: y, w: rw, h: ch}); xx += rw; }); y += ch; h -= ch; }
      rest = rest.slice(row.length);
    }
    return out;
  }
  /* 🗺 11/05 사용자 「깔끔하게 쫌」 — 칸이 15개라 글자가 잘리고 겹쳤음 → 큰 업종 9개 + 「그 밖」 한 칸 · 칸 안 그림 없앰 ·
     글자 크기는 칸의 실제 크기에 맞춰(fitMap) — 좁으면 이름은 빼고 숫자만, 아주 작으면 둘 다 뺌(누르면 보임) */
  function mapHtml(d){
    var useKr = d.kr && d.kr.sectors && (liveNow(d.kr) || !(d.us && d.us.sectors) || (kst().getUTCHours() >= 9 && kst().getUTCHours() < 22 && [0, 6].indexOf(kst().getUTCDay()) < 0));
    var J = useKr ? d.kr : d.us; if (!J || !J.sectors) return "";
    var all = J.sectors.filter(function(s){ return s.n >= 5; }).map(function(s){ return {n: s.name.replace(/\(.*?\)/g, "").split(/[·\/]/)[0].trim(), ic: s.icon || "", v: s.r, w: Math.pow(s.n, 0.6), cnt: s.n, big: (s.big || []).slice(0, 3), up: s.up, down: s.down}; }).sort(function(a, b){ return b.w - a.w; });
    if (all.length < 6) return "";
    var it = all.slice(0, 12);   // 종목 수가 많은 큰 업종 12개만 (작은 업종은 시장 흐름 탭에)
    var W = 100, Hh = 78, R = squarify(it, 0, 0, W, Hh);
    var cells = R.map(function(r, k){
      return '<div class="h2-tm" data-k="' + k + '" style="left:' + r.x.toFixed(2) + '%;top:' + (r.y / Hh * 100).toFixed(2) + '%;width:' + r.w.toFixed(2) + '%;height:' + (r.h / Hh * 100).toFixed(2) + '%;background:' + heatBg(r.it.v) + '"><span>' + e(r.it.n) + '</span><b>' + sg(r.it.v) + '</b></div>'; }).join("");
    var when = useKr ? (liveNow(d.kr) ? "지금 " + d.kr.t : md(d.kr.date) + " 마감") : "미국 " + (d.us.t && d.us.t < "12:00" ? md(new Date(Date.parse(d.us.date + "T00:00:00Z") - 864e5).toISOString()) : md(d.us.date)) + " 마감";
    MAPIT = R.map(function(r){ return r.it; });
    return '<section class="card h2-map"><div class="h2-hd h2-mh" data-goto="sector"><b>' + (useKr ? "🇰🇷 한국" : "🇺🇸 미국") + ' 업종 지도</b><span class="mut">' + e(when) + ' · 큰 업종 ' + it.length + '개 · 칸을 누르면 대표 종목</span></div><div class="h2-tmw" data-nofs>' + cells + '</div><div class="h2-pick" id="h2pick"></div><div class="h2-lg" data-nofs><span class="dn">■ 내림</span><span class="up">오름 ■</span></div></section>';
  }
  function fitMap(){
    [].forEach.call(document.querySelectorAll(".h2-tm"), function(c){
      var w = c.clientWidth, h = c.clientHeight, sp = c.querySelector("span"), b = c.querySelector("b"); if (!w || !sp || !b) return;
      var vl = (b.textContent || "").length, nl = Math.max(2, (sp.textContent || "").length);
      var vf = Math.max(10, Math.min(20, h / 2.6, (w - 12) / (vl * 0.7))), nf = Math.max(10, Math.min(14, h / 4, (w - 8) / (nl * 0.95)));
      b.style.setProperty("font-size", vf.toFixed(1) + "px", "important"); sp.style.setProperty("font-size", nf.toFixed(1) + "px", "important");
      sp.style.display = (w >= 54 && h >= 46) ? "" : "none";
      b.style.display = (w >= 36 && h >= 22) ? "" : "none";
      b.dataset.wfs = sp.dataset.wfs = "1"; b.dataset.f13 = sp.dataset.f13 = "1";
    });
  }
  window.addEventListener("resize", function(){ setTimeout(fitMap, 100); });
  function mapPick(k){   // ⑲ 🎨 11/04 업종 칸 터치 → 대표 종목 3개 (사용자 「지금은 보기만 함」)
    var it = MAPIT[k], box = document.getElementById("h2pick"); if (!it || !box) return;
    [].forEach.call(document.querySelectorAll(".h2-tm.on"), function(x){ x.classList.remove("on"); });
    if (box.dataset.k === String(k)){ box.innerHTML = ""; box.dataset.k = ""; return; }
    var t = document.querySelector('.h2-tm[data-k="' + k + '"]'); if (t) t.classList.add("on");
    box.dataset.k = String(k);
    box.innerHTML = '<div class="h2-ph"><b>' + e(it.ic + " " + it.n) + ' <span class="' + cls(it.v) + '">' + sg(it.v) + '</span></b><small>' + (it.rest ? '' : '오른 ' + (it.up || 0) + ' · 내린 ' + (it.down || 0)) + '</small></div>' + (it.rest ? '<p class="note" style="margin:0 0 6px">' + e(it.rest.join(" · ")) + '</p>' : '') +
      (it.big.length ? it.big.map(function(x){ return '<button type="button" class="h2-pr" data-op="' + e(x.s) + '"><b>' + e(x.n) + '</b><em>' + e(String(x.s).replace(/\.(KS|KQ)$/, "")) + '</em><span class="' + cls(x.r) + '">' + sg(x.r) + '</span></button>'; }).join("") : '<p class="note">대표 종목 자료가 없어요.</p>');
  }
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest(".h2-tm[data-k]"); if (!t || !t.closest("#h2map")) return; ev.stopPropagation(); ev.preventDefault(); mapPick(+t.dataset.k); }, true);
  /* ㉑ 고객에게 보낼 한 장 미리보기 — 홈에서 바로 「보내기」 (onepage.js 의 고르기 창을 엶) */
  /* 🔍 11/05 A3 「한 장」 3개(고객에게 보낼 한 장 · ☀️ 오늘 한 장 · 📨 이번 주 한 장)를 카드 하나로 — 위 탭 3칸 */
  var CLT = "c";
  function clientHtml(d){
    var b = d.brief; if (!b || !b.one) return "";
    var tk = (b.talk || []).slice(0, 2), A = b.advice || {};
    var fri = (function(){ var k = kst(), w = k.getUTCDay(), hh = k.getUTCHours(); return (w === 5 && hh >= 15) || w === 6 || w === 0; })();
    var pane = {
      c: '<div class="h2-clp"><div class="h2-clt">' + e(b.one) + '</div>' + (tk.length ? '<ul>' + tk.map(function(x){ return '<li>' + e(x) + '</li>'; }).join("") + '</ul>' : '') + (A.read ? '<p>' + e(A.read) + '</p>' : '') + '</div>' +
         '<button type="button" class="h2-clb" data-clgo="op">📨 카톡으로 보내기 — 한 장 고르기</button>',
      p: '<div class="h2-clp">' + (b.regime ? '<div class="h2-clr">' + e(b.regime) + '</div>' : '') + '<ul>' + (b.talk || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("") + '</ul>' +
         ((b.events || []).length ? '<div class="h2-cle"><b>📅 오늘 일정</b>' + b.events.map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') +
         ((A.plan || []).length ? '<div class="h2-cle"><b>🧭 대응</b>' + A.plan.slice(0, 2).map(function(x){ return '<div>' + e(x) + '</div>'; }).join("") + '</div>' : '') + '</div>' +
         '<button type="button" class="h2-clb alt" data-clgo="pb">☀️ PB용 한 장 그림으로 받기</button>',
      w: '<div class="h2-clp"><div class="h2-clt">' + (fri ? "이번 주 한 장이 준비됐어요" : "금요일 장이 끝나면 이번 주 한 장이 열려요") + '</div><p>' + (fri ? "이번 주 지수·업종·포트 흐름을 고객용 그림 한 장으로 만들어 드려요." : "지금 눌러도 지난 금요일까지의 주간 요약으로 만들 수 있어요.") + '</p></div>' +
         '<button type="button" class="h2-clb" data-clgo="wk">📨 이번 주 한 장 만들기</button>'
    };
    if (fri && CLT === "c" && !ls("h2_clt_pick")) CLT = "w";
    var tabs = [["c", "👥 고객용"], ["p", "📋 PB 요약"], ["w", "📅 이번 주"]];
    return '<section class="card h2-cl no-clp" data-cz="done" data-xc="1"><div class="h2-hd"><b>📨 오늘의 한 장</b><span class="mut">' + e(b.label || "") + '</span></div>' +
      '<div class="h2-clt3">' + tabs.map(function(t){ return '<button type="button" data-clt="' + t[0] + '"' + (CLT === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>'; }).join("") + '</div>' +
      '<div class="h2-clw">' + tabs.map(function(t){ return '<div data-clp="' + t[0] + '"' + (CLT === t[0] ? '' : ' hidden') + '>' + pane[t[0]] + '</div>'; }).join("") + '</div></section>';
  }
  function clientBind(root){
    [].forEach.call(root.querySelectorAll("[data-clt]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); CLT = x.dataset.clt; ls("h2_clt_pick", 1);
      [].forEach.call(root.querySelectorAll("[data-clt]"), function(y){ y.classList.toggle("on", y === x); });
      [].forEach.call(root.querySelectorAll("[data-clp]"), function(y){ y.hidden = y.dataset.clp !== CLT; }); }; });
    [].forEach.call(root.querySelectorAll("[data-clgo]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var k = x.dataset.clgo;
      if (k === "wk"){ if (window.__weekSend) __weekSend(); else if (window.toast) window.toast("잠시 뒤 다시 눌러 주세요"); return; }
      if (k === "pb"){ var pc = document.querySelector("#pbcard .pb-ft button, #pbcard [data-pbsend], #pbcard button"); if (pc){ pc.click(); return; } }
      var ob = document.getElementById("opbtn"); if (ob) ob.click(); else if (window.goTo) goTo("home"); }; });
  }

  /* ───────── 붙이기 ───────── */
  var CUR_S = null, BUSY = false;
  /* 🐻 11/09 하락장 계기판 — 사용자 「하락장이면 현금 늘리라 권하고, 바닥이면 이 조건 충족 시 비중 늘리자 — 네가 설명하고 이끌어」
     market/bear.json(src/bear_gate.py, 종가 기계 판정): 시장별 🟢/🟡/🐻 · 현금 권고 · 🌱 바닥 신호 4개. 결론 한 줄 + 펼치면 체크리스트 */
  /* 🏁 11/11 사용자 「각 시장에 고친 방식을 적용하고 신호, 설명창도 추가」 — 시장마다 채택한 방식(best_bt 1등) · 지금 켜진 신호 · 누르면 쉬운 설명 */
  var METH = {
    kospi: {t: "흔들리면 전부 현금 · 아주 싸지면 주식", how: "하락장(고점 −20%) · 신용 경보 + 200일선 아래 · 버블 시계 4시 반 — 셋 중 하나라도 켜지면 주식 몫 전부 현금",
            back: "바닥이 다져지고(저점 10일 넘게 안 깨짐) 50일선 위로 올라오면 다시 주식 (하락장은 판정이 풀릴 때) · 🧩 11/12부터: 코스피가 5년 평균선보다 많이 아래(자기 과거 하위 15%)로 싸지면 경고가 켜져 있어도 현금을 풀고 주식으로",
            why: "1999년부터 다시 돌려 보니 경고 규칙만 쓰면 1년 수익 9.8% · 「아주 싸지면 주식」까지 얹으면 11.9% (2012년까지 13.8% · 2013년 뒤 9.9%) · 그냥 들고 있기 8.5%",
            note: "11/12 수익을 택했어요 — 대신 가장 크게 잃은 폭이 −26% → −43%로 커져요(싸진 뒤에 더 빠진 때가 있었음). 지금 코스피는 5년 평균선보다 +61%라 이 신호는 꺼져 있어요"},
    kosdaq: {t: "버블 시계 6시면 전부 현금 · 미국이 비싸면 절반", how: "버블 시계가 6시를 넘으면 주식 몫 전부 현금 · 🧩 11/12부터: 미국 CAPE(10년 평균 이익 대비 주가)가 과거 상위 10%로 비싸면 최소 절반은 현금",
            back: "신저가가 나온 뒤 바닥 신호가 4개 중 3개 켜지면 다시 주식",
            why: "그냥 들고 있으면 1년 −0.8%(손해)였는데 시계만 쓰면 +4.0% · 미국 CAPE 경고까지 얹으면 +4.9% · 가장 크게 잃은 폭 −72% → −42%", note: "미국 CAPE 경고는 코스피·S&P500·나스닥에도 얹어 봤지만 2012년까지·2013년 뒤 둘 다 나아진 곳은 코스닥뿐이라 코스닥에만 썼어요"},
    sp500: {t: "흔들리면 절반만 채권", how: "고점 −10%(조정) · 또는 신용 경보 + 200일선 아래 — 켜지면 주식 몫 절반을 채권형(중기국채)으로",
            back: "신저가가 나온 뒤 바닥 신호가 켜지면 다시 주식 (신저가 없이 회복하면 바로 복귀)",
            why: "1년 수익 8.6% → 9.4% · 가장 크게 잃은 폭 −55% → −40% · 현금으로 빼면 2013년 뒤엔 손해였고 채권 절반이 가장 나았어요", note: ""},
    nasdaq: {t: "그냥 들고 있기", how: "신호가 와도 팔지 않아요", back: "—",
            why: "200가지 넘게 돌려 봤는데 2012년까지와 2013년 뒤를 둘 다 이긴 방식이 없었어요 — 크게 빠져도 빨리 회복해서 팔면 손해", note: "크게 흔들리는 시장이라 처음부터 비중을 적당히 두는 게 방패예요"}
  };
  var BODY = {};
  function methHtml(B){
    var FL = {kr: "🇰🇷", us: "🇺🇸"};
    var rows = (B.markets || []).map(function(m){
      var D = METH[m.key]; if (!D) return "";
      var ap = m.analog;   // 🔁 11/12 닮은 장 규칙 채택 — 설명을 그 규칙으로 바꿔 보여 줌
      if (ap) D = {t: "🔁 " + ap.rule, how: (ap.shape_name ? "지금은 「" + ap.shape_name + "」 꼴이에요 — " + (ap.why || "") + " → " + ap.rule : "지금 장과 닮았던 " + ap.n + "번에서 2년 뒤 가운데값이 가장 좋았던 방식이에요 — " + ap.rule), back: ap.next,
        why: ap.shape_name && m.hold && m.hold.head ? "🎲 " + m.hold.head : "닮은 때 2년 뒤 가운데값 " + sg(ap.y2_med) + " · 가장 나빴던 때 " + sg(ap.y2_worst) + " · 현금보다 나았던 때 " + ap.beat_cash + "/" + ap.n + "번 (지금 다 샀다면 가운데 " + sg(ap.lump_med) + " · 최악 " + sg(ap.lump_worst) + ")",
        note: (ap.shape_name ? "닮았던 12번으로 날마다 다시 고르던 방식은 참고로만(11/22)" : "하나 빼고 고르기 검증: 가운데 " + sg((ap.loo || {}).med) + " · 최악 " + sg((ap.loo || {}).worst)) + (m.cash_old != null && m.cash_old !== m.cash ? " · 예전 규칙이면 " + (m.to || "현금") + " " + m.cash_old + "% — " + METH[m.key].t : " · 예전 방식: " + METH[m.key].t)};
      var b = m.best || {}, ck = m.checks || [], nb = ck.filter(function(c){ return c.on; }).length;
      var sig = [];
      if (ap) sig = [];
      else if (m.key === "kospi") sig = [["하락장", m.state === "🐻"], ["신용 경보", !!(m.clock && m.clock.kospi_on)], ["시계 4시 반", !!b.on], ["🌱 아주 쌈", !!((m.overlay && m.overlay.parts) || []).filter(function(p){ return p.on; }).length]];
      else if (m.key === "kosdaq") sig = [["시계 6시", !!b.on], ["미국 CAPE 비쌈", !!((m.overlay && m.overlay.parts) || []).filter(function(p){ return p.on; }).length]];
      else if (m.key === "sp500") sig = [["고점 −10%", !!(m.b50 && m.b50.on)], ["신용 경보+200일선", !!b.on]];
      var out = m.cash || 0, to = m.to || "현금";
      var now = m.key === "nasdaq" && !ap ? "주식 그대로" : out ? "주식 " + (100 - out) + "% · " + to + " " + out + "%" : "주식 100%";
      var backNow = ap ? "" : out && m.key !== "nasdaq" ? '<div class="bm-back">🌱 다시 사는 신호 <b>' + nb + '/4</b> — ' + e(D.back) + '</div>' : "";
      var bx = '<div class="bm-x"><p><b>' + (ap ? "어떤 방식" : "언제 옮기나") + '</b> ' + e(D.how) + '</p>' + (ap ? '<p><b>다음에 바뀌는 때</b> ' + e(D.back) + '</p>' : m.key !== "nasdaq" ? '<p><b>언제 다시 사나</b> ' + e(D.back) + '</p>' : '') +
        (window.__meetLine ? __meetLine(m) : '') + '<p><b>왜 이 방식</b> ' + e(D.why) + '</p>' + (D.note ? '<p class="bm-note">' + e(D.note) + '</p>' : '') + '</div>';
      BODY[m.key] = bx;   // 🧭 11/22 한 줄 표가 펼칠 때 쓰는 설명(글은 그대로)
      return '<details class="bm-r' + (out ? " on" : "") + '"><summary><span class="bm-n">' + FL[m.nat] + ' <b>' + e(m.name) + '</b><small>' + e(D.t) + '</small></span>' +
        '<span class="bm-now"><b>' + e(now) + '</b>' + (sig.length ? '<span class="bm-sg">' + sig.map(function(x){ return '<i class="' + (x[1] ? "on" : "") + '">' + (x[1] ? "🔴 " : "⚪ ") + e(x[0]) + '</i>'; }).join("") + '</span>' : '') + '</span></summary>' +
        '<div class="bm-x"><p><b>' + (ap ? "어떤 방식" : "언제 옮기나") + '</b> ' + e(D.how) + '</p>' + (ap ? '<p><b>다음에 바뀌는 때</b> ' + e(D.back) + '</p>' : m.key !== "nasdaq" ? '<p><b>언제 다시 사나</b> ' + e(D.back) + '</p>' : '') +
        (window.__meetLine ? __meetLine(m) : '') +   // 📏 11/13 A11/13-1
        '<p><b>왜 이 방식</b> ' + e(D.why) + '</p>' + (D.note ? '<p class="bm-note">' + e(D.note) + '</p>' : '') +
        (b.since && b.on ? '<p class="bm-note">' + e(b.ent === "credit200" ? "신용 경보+200일선" : b.ent === "clock6" ? "시계 6시" : b.ent === "clock4.5" ? "시계 4시 반" : "신호") + ' 켜진 날 ' + e(md(b.since)) + ' · 대리 버블 시계 지금 ' + (b.h_free != null ? b.h_free + "시" : "–") + '</p>' : '') +
        '</div>' + backNow + '</details>';
    }).join("");
    return '<div class="bm"><div class="bm-h">🏁 시장별 방식 <small>🧱 같은 꼴이었던 과거 결과로 정한 고정 표 · 누르면 설명</small></div>' + rows + '<p class="bm-note">💼 기본 포트는 S&P500 🎯 판정(200일선 아래 3일이면 줄이고 · 다시 위로 3일이면 담기)이 먼저예요 · 🧱 장 꼴 규칙은 국내 주식과 시장별 참고용 — 🇺🇸 200일선 아래로 내려가 두 규칙이 엇갈리기 시작하면 알림</p></div>';
  }
  function moreHtml(B){   // 🌏 11/12 일본·중국·홍콩 — 판정 + 닮은 장 규칙 (bear.json more)
    var A = B.more || []; if (!A.length) return "";
    var FL = {jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰", us: "🇺🇸"}, NM = {"🟢": "정상", "🟡": "조정", "🐻": "하락장"};
    return '<details class="bm bm-more"><summary class="bm-h">🌏 일본·중국·홍콩·기술 지수 <small>' + A.map(function(m){ return m.state + e(m.name.replace("225", "").replace("종합", "").replace("성분", "")); }).join(" ") + '</small></summary>' +
      A.map(function(m){ var ap = m.analog;
        return '<div class="bmm"><span>' + (FL[m.nat] || "") + ' <b>' + e(m.name) + '</b> ' + m.state + ' ' + NM[m.state] + ' <small>고점보다 ' + sg(m.dd) + '</small></span><em>' + (ap ? "주식 " + ap.stock + "%" : "정하지 않음") + '</em>' +
          '<small>' + (ap ? '🔁 ' + e(ap.rule) + ' · 다음: ' + e(ap.next) : '닮은 장에서 통하는 방식이 없었어요 — 한 번에 사지 말고 나눠 사기만 참고') + '</small>' + (window.__meetLine ? __meetLine(m) : '') + '</div>'; }).join("") +   // 📏 11/13
      '<p class="bm-note">상태나 주식 몫이 바뀌면 알림이 가요 · 매수·매도 추천 아님</p></details>';
  }
  /* 🧭 11/22 사용자 「여전히 숫자가 통일이 안 되어 있고 복잡 — 설명은 안 건드려도 되니 더 직관적으로」
     칩·결론 줄·시장별 방식·일본·중국 줄을 「시장마다 한 줄」 표 하나로: 주식 몫(큰 숫자 + 막대) · 다시 늘리는 때(선 + 거리) — 누르면 예전 설명 그대로 */
  function nextOf(m){
    var a = m.analog || {}, st = a.stock, c = m.close, k = a.k;
    if (st == null) return {t: "정하지 않음 — 나눠 사기만 참고"};
    if (st >= 100) return {t: k === "a50" ? "50일선 아래로 내려가면 줄여요" : k === "a200" ? "200일선 아래로 내려가면 줄여요" : "그대로 들고 가요", ok: true};
    var ln = null, nm = "";
    if (k === "a50") { ln = m.m50; nm = "50일선"; }
    else if (k === "a200" || k === "half200") { ln = m.m200; nm = "200일선"; }
    else if (k === "half5020" || k === "third") { if (st < (k === "third" ? 67 : 75)) { ln = m.m50; nm = "50일선"; } else { ln = m.m200; nm = "200일선"; } }
    if (!ln || !c) return {t: a.next || ""};
    var g = (ln / c - 1) * 100;
    return {t: nm + " " + Math.round(ln).toLocaleString("en-US"), d: g};
  }
  function rowHtml(m, body){
    var FL = {kr: "🇰🇷", us: "🇺🇸", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰"};
    var a = m.analog || {}, st = a.stock, nx = nextOf(m);
    var col = st == null ? "s-na" : st >= 100 ? "s-full" : st > 0 ? "s-half" : "s-zero";
    var ddc = m.state === "🐻" ? "dd3" : m.state === "🟡" ? "dd2" : "dd1";
    return '<details class="ub-r ' + col + '"><summary>' +
      '<span class="ub-n">' + (FL[m.nat] || "") + ' <b>' + e(m.name) + '</b><small class="' + ddc + '">' + sg(m.dd, 0) + '</small></span>' +
      '<span class="ub-v"><b>' + (st == null ? "–" : st + "%") + '</b><i class="ub-bar"><i style="width:' + (st || 0) + '%"></i></i></span>' +
      '<span class="ub-nx">' + (nx.ok ? "✓ " : "다시 늘리는 때 · ") + e(nx.t) + (nx.d != null ? ' <em>' + (nx.d > 0 ? "+" : "") + nx.d.toFixed(1).replace("-", "−") + '%</em>' : '') + '</span></summary>' +
      '<div class="ub-x">' + (a.shape_name ? '<p class="ub-sh">🧱 지금 꼴: <b>' + e(a.shape_name) + '</b> — ' + e(a.rule || "") + '</p>' : '') + (body || "") + '</div></details>';
  }
  function unifiedHtml(B){
    methHtml(B);   // BODY 채우기(설명 글)
    var main = (B.markets || []).map(function(m){ return rowHtml(m, BODY[m.key] || (window.__meetLine ? __meetLine(m) : "")); }).join("");
    var more = (B.more || []).map(function(m){ return rowHtml(m, '<p class="ub-p"><b>다음에 바뀌는 때</b> ' + e((m.analog || {}).next || "") + '</p>' + (window.__meetLine ? __meetLine(m) : "")); }).join("");
    return '<div class="ub"><div class="ub-hd"><span>시장 · 고점 대비</span><span>주식 몫</span></div>' + main +
      (more ? '<details class="ub-more"><summary>다른 시장 ' + (B.more || []).length + '개 — 일본·중국·홍콩·기술 지수 ▾</summary>' + more + '</details>' : '') +
      '<p class="ub-note">주식 몫 = 그 시장 주식을 지금 얼마나 들고 갈지(나머지는 현금) · 줄을 누르면 왜 그런지 · 💼 기본 포트는 이 표와 따로 S&P500 판정(200일선)으로 움직여요 — 실제 비중은 포트 탭</p></div>';
  }
  function bearHtml(d){
    var B = d.bear; if (!B || !B.markets || !B.markets.length) return "";
    var M_ = B.markets, bad = M_.filter(function(m){ return m.state !== "🟢"; });
    var FL = {kr: "🇰🇷", us: "🇺🇸"}, NM = {"🟢": "정상", "🟡": "조정", "🐻": "하락장"};
    var chips = M_.map(function(m){ return '<span class="bg-c s' + (m.state === "🐻" ? 3 : m.state === "🟡" ? 2 : 1) + '">' + FL[m.nat] + ' ' + e(m.name) + ' <b>' + m.state + ' ' + NM[m.state] + '</b><small>' + sg(m.dd, 0) + '</small></span>'; }).join("");
    var lead = bad.length ? B.lead : "네 시장 모두 정상 — 현금을 따로 늘릴 때 아님";
    var det = bad.map(function(m){
      var ladder = m.state === "🐻" ? [30, 30, 20, 10, 0] : [10, 10, 5, 0, 0];
      return '<div class="bg-m"><div class="bg-mh">' + FL[m.nat] + ' <b>' + e(m.name) + '</b> ' + m.state + ' ' + NM[m.state] + ' · 고점보다 ' + sg(m.dd) + ' · 지금 권고 현금 <b>' + m.cash + '%</b></div>' +
        (m.analog ? '<div class="bg-n">' + (m.analog.shape_name ? '🧱 ' + e(m.analog.shape_name) + ' 꼴' : '🔁 닮은 장 규칙') + ' — <b>' + e(m.analog.rule) + '</b> · 다음: ' + e(m.analog.next) + ' · 아래 신호는 참고</div>'
          : m.rule && m.rule.id === "OFF" ? '<div class="bg-n">⏸ 이 시장은 현금 규칙을 꺼 뒀어요 — 2013년 이후엔 어떤 현금 규칙도 그냥 보유를 못 이겼어요 · 판정과 아래 신호는 참고</div>'
          : m.rule && !m.nuse ? '<div class="bg-n">🌱 ' + e(m.rule.name) + ' · 아래 신호는 참고</div>'
          : '<div class="bg-n">🌱 다시 사는 조건 <b>' + m.n + '/' + (m.nuse || 4) + '</b> — ' + e(m.rule ? m.rule.name : "켜질수록 3분의 1씩 다시 사기") + '</div>') +   // 🌱 11/09 시장별 다시 사기 규칙
        (window.__meetLine ? __meetLine(m) : '') +   // 📏 11/13 A11/13-1 선이 닿는 날 한 토막 (ux1113.js)
        (window.__bearSigHead ? __bearSigHead(m) : '') +   // 🌱 11/09 A11/9-1 과거 성적표 (ux1109b.js)
        '<ul class="bg-ck">' + (m.checks || []).map(function(c, k){ return '<li class="' + (c.on ? "on" : "") + '"><i>' + (c.on ? "✅" : "⬜") + '</i><b>' + e(c.k) + (c.use === false ? ' <em class="bg-ref">참고</em>' : '') + '</b><small>' + e(c.d) + '</small>' + (window.__bearSigLine ? __bearSigLine(m, k) : '') + '</li>'; }).join("") + '</ul>' +
        '<div class="bg-lad">' + (m.ladder ? m.ladder.map(function(x){ return [x[0], x[1]]; }) : [[ladder[0], "신호 0~1개"], [ladder[2], "2개"], [ladder[3], "3개"], [ladder[4], "4개"]]).map(function(x, i, A){ var now = m.ladder && m.ladder.length ? x[0] === m.cash : Math.max(0, m.n - 1) === i; return '<span class="' + (now ? "now" : "") + '"><small>' + e(x[1]) + '</small><b>' + e(m.to || '현금') + ' ' + x[0] + '%</b></span>'; }).join("") + '</div>' +
        '<p class="bg-ad">' + e(m.advice) + '</p></div>';
    }).join("");
    return '<section class="card h2-bear" id="bear" data-cz="done"><div class="bg-h">🐻 하락장 계기판 <small>' + e(md(B.at)) + ' ' + e(String(B.at || "").slice(11, 16)) + ' · 종가 판정</small></div>' +
      unifiedHtml(B) +
      (bad.length ? '<details class="bg-d"><summary>무엇을 보면 다시 사나 · 체크리스트 펼치기</summary>' + det +
        '<p class="note bg-ru">판정: 고점보다 −10% 조정 · −20% 하락장 (종가) · 현금 권고(11/11부터): 위 🏁 시장별 방식 — 1999년부터 200여 가지를 돌려 2012년까지·2013년 뒤 둘 다 그냥 들고 있기를 이긴 것 중 수익 1등(best_bt). 판정 규칙은 결과 보기 전 등록 · 매수·매도 추천 아님 — 고객 성향·기간에 맞춰 판단.</p></details>' : '') +
      '</section>';
  }
  function apply(){
    if (!on() || typeof cur === "undefined" || cur !== "home") return;
    var b = document.getElementById("hmbody"); if (!b || BUSY) return;
    // 🧊 11/09 ⑪ 쉬운 화면에서 「오늘 자세히 보기」를 안 열었으면 무거운 자료(상품 0.9MB·나침반 0.7MB 등)를 받지 않음 — 열 때 받음
    if (document.documentElement.getAttribute("data-ez") === "easy" && !b.classList.contains("ez-open")) return;
    var hero = document.getElementById("tdhero"); if (!hero) return;
    if (b.getAttribute("data-h2") === String(DT) && document.getElementById("h2rings")) return reorder(b);
    BUSY = true;
    load().then(function(d){
      BUSY = false; if (!d || cur !== "home") return;
      var S = stories(d); CUR_S = S;
      ["h2rings", "h2world", "h2disc", "h2map", "h2num", "h2cl"].forEach(function(id){ var x = document.getElementById(id); if (x) x.remove(); });
      var mk = function(id, html){ var w = document.createElement("div"); w.id = id; w.innerHTML = html; return w; };
      var rings = mk("h2ringsw", ringsHtml(S)); rings.id = "h2ringsw";
      var old = document.getElementById("h2ringsw"); if (old) old.remove();
      b.insertBefore(rings, b.firstChild);
      var num = mk("h2num", numHtml(d)); b.insertBefore(num, b.firstChild);   // ⑰ 오늘의 숫자 맨 위
      var ob = document.getElementById("h2bear"); if (ob) ob.remove(); var bh = bearHtml(d); if (bh) num.insertAdjacentElement("afterend", mk("h2bear", bh));   // 🐻 11/09 결론 바로 아래
      var obb = document.getElementById("h2bub"); if (obb) obb.remove(); try { var bbh = window.__bubCard ? __bubCard(d.bub) : ""; if (bbh) (document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2bub", bbh)); } catch(x) {}   // 🫧 11/10 버블 경보판 — 계기판 바로 아래 (ux1110b.js)
      var osc = document.getElementById("h2season"); if (osc) osc.remove(); try { var sch = window.__seasonCard && window.__seasonData ? __seasonCard(window.__seasonData) : ""; if (sch) (document.getElementById("h2bub") || document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2season", sch)); } catch(x) {}   // 🧭 11/12 계절 시계 (ux1112.js)
      var osp = document.getElementById("h2sigprob"); if (osp) osp.remove(); try { var sph = window.__sigProbCard && window.__sigProbData ? __sigProbCard(window.__sigProbData) : ""; if (sph) (document.getElementById("h2season") || document.getElementById("h2bub") || document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2sigprob", sph)); } catch(x) {}   // 🎯 11/12 신호 확률판 (ux1112d.js)
      var oan = document.getElementById("h2analog"); if (oan) oan.remove(); try { var anh = window.__analogCard && window.__analogData ? __analogCard(window.__analogData) : ""; if (anh) (document.getElementById("h2bub") || document.getElementById("h2bear") || num).insertAdjacentElement("afterend", mk("h2analog", anh)); } catch(x) {}   // 🔁 11/12 닮은 장 백테스트 (ux1112e.js) — 버블 경보판 바로 아래
      var orb = document.getElementById("h2reb"); if (orb) orb.remove();   // 📨 11/10 A11/10-1 반등 날 기록 — 🛡 결론 밑 · 계기판 위 (ux1110.js · 반등 날에만)
      try { var kx_ = ix(d.kr, "코스피"), rh = window.__rebCard && kx_ && d.kr && d.kr.date === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) ? __rebCard(d.bear, kx_.chg, "home") : ""; if (rh) num.insertAdjacentElement("afterend", mk("h2reb", rh)); } catch(x) {}
      var world = mk("h2world", worldHtml(d)), disc = mk("h2disc", discHtml(d)), map = mk("h2map", mapHtml(d)), cl = mk("h2cl", clientHtml(d));
      rings.insertAdjacentElement("afterend", world); world.insertAdjacentElement("afterend", hero);   // 날씨판은 타일 아래로
      hero.insertAdjacentElement("afterend", disc);
      var pl = b.querySelector("section.card.pl"); (pl || disc).insertAdjacentElement("afterend", map); map.insertAdjacentElement("afterend", cl);
      clientBind(cl);
      setTimeout(fitMap, 30); setTimeout(fitMap, 600);
      world.querySelector(".card") && world.querySelector(".card").setAttribute("data-cz", "done"); map.querySelector(".card") && map.querySelector(".card").setAttribute("data-cz", "done");
      b.setAttribute("data-h2", String(DT));
      [].forEach.call(rings.querySelectorAll("[data-st]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); openStory(S, +x.dataset.st); }; });
      reorder(b);
    }).catch(function(x){ BUSY = false; console.warn("home2", x); });
  }
  window.__h2apply = function(){ try { apply(); } catch(x) {} };
  function reorder(b){   // v2에선 「오늘 한 장」·「바뀐 것」·5개 시장과 겹치는 띠는 아래로 / 숨김
    var hm = document.getElementById("hmlive"); if (hm) hm.classList.add("h2-hide");
    var more = b.querySelector(".hm-more"); if (more) more.classList.add("h2-hide");   // 아래 바로가기 줄 → 「오늘의 발견」이 대신
    var nm_ = document.getElementById("h2num"); if (nm_ && b.firstElementChild !== nm_) b.insertBefore(nm_, b.firstChild);
    var br_ = document.getElementById("h2bear"); if (nm_ && br_ && nm_.nextElementSibling !== br_) nm_.insertAdjacentElement("afterend", br_);
    var bb_ = document.getElementById("h2bub"), ba_ = br_ || nm_; if (ba_ && bb_ && ba_.nextElementSibling !== bb_) ba_.insertAdjacentElement("afterend", bb_);
    var hz = document.getElementById("tdhero"), wz = document.getElementById("h2world"); if (hz && wz && wz.nextElementSibling !== hz) wz.insertAdjacentElement("afterend", hz);
    // 🔍 11/05 A3: ☀️ 오늘 한 장 · 📨 이번 주 한 장 카드는 「📨 오늘의 한 장」 탭으로 합쳤으니 홈에선 숨김(보내기 단추는 그대로 씀)
    var pb = document.getElementById("pbcard"); if (pb && document.getElementById("h2cl")) pb.classList.add("h2-hide");
    var w1 = document.getElementById("wk1"); if (w1 && document.getElementById("h2cl")) w1.classList.add("h2-hide");
    // 🔍 11/05 A2: 홈은 4장만 펼침 — 나머지는 제목 한 줄(펼치기). 날씨판·발견·바뀐 것 등에 제목을 달아 둠(calm.js 가 접음)
    var hz2 = document.getElementById("tdhero"); if (hz2 && !hz2.dataset.czt) hz2.dataset.czt = "🌤 지금 시장 날씨";
    var dz = document.querySelector("#h2disc .h2-disc"); if (dz && !dz.dataset.czt){ dz.dataset.czt = "✨ 오늘의 발견"; dz.classList.add("card"); }
    var vt = b.querySelector(".hb-vote"); if (vt) vt.setAttribute("data-cz", "done");
  }
  var T = 0;
  try { new MutationObserver(function(ms){
    if (!on()) return;
    for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t.closest && t.closest("#h2ringsw,#h2world,#h2disc,#h2map,#h2sv,#h2bear,#h2bub")) continue; if (T) return; T = setTimeout(function(){ T = 0; apply(); }, 200); return; }
  }).observe(document.getElementById("main") || document.body, {childList: true, subtree: true}); } catch(x) {}
  setInterval(function(){ if (on() && !document.hidden && typeof cur !== "undefined" && cur === "home"){ DT = 0; var b = document.getElementById("hmbody"); if (b) b.removeAttribute("data-h2"); apply(); } }, 5 * 60e3);

  var css = document.createElement("style");
  css.textContent =
    ".h2-hide{display:none!important}html.h2-lock{overflow:hidden}" +
    ".h2-bear{padding:16px 16px 14px!important}.bg-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bg-h small{font-size:12px;font-weight:600;color:var(--sub);margin-left:4px}" +
    ".bg-cs{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 8px}.bg-c{display:inline-flex;align-items:baseline;gap:4px;font-size:13.5px;border-radius:12px;padding:7px 10px;background:var(--panel2)}.bg-c b{font-weight:800}.bg-c small{font-size:12px;color:var(--sub);font-weight:700}" +
    ".bg-c.s3{background:rgba(47,111,221,.14);box-shadow:inset 0 0 0 1.5px rgba(47,111,221,.45)}.bg-c.s2{background:rgba(240,180,60,.16)}.bg-c.s1{opacity:.85}" +
    ".ub{margin:10px 0 4px}.ub-hd{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);font-weight:700;padding:0 12px 4px}" +
    ".ub-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));margin-top:6px;padding:9px 12px}.ub-r>summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:1fr auto;grid-template-areas:'n v' 'x x';column-gap:10px;row-gap:3px;align-items:center}" +
    ".ub-r>summary::-webkit-details-marker{display:none}.ub-n{grid-area:n;min-width:0;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ub-n b{font-weight:900}.ub-n small{margin-left:6px;font-size:12px;font-weight:700;color:var(--sub)}.ub-n small.dd3{color:#2f6fdd}" +
    ".ub-v{grid-area:v;display:flex;align-items:center;gap:8px}.ub-v b{font-size:19px;font-weight:900;min-width:52px;text-align:right}.ub-bar{display:block;width:56px;height:9px;border-radius:5px;background:rgba(127,127,127,.22);overflow:hidden}.ub-bar i{display:block;height:100%;background:#e5484d;border-radius:5px}" +
    ".s-zero .ub-v b{color:#2f6fdd}.s-half .ub-v b{color:#d9822b}.s-full .ub-v b{color:#e5484d}.s-half .ub-bar i{background:#d9822b}" +
    ".ub-nx{grid-area:x;font-size:12px;letter-spacing:-.2px;color:var(--sub);font-weight:700;word-break:keep-all}.ub-nx em{font-style:normal;color:var(--text);font-weight:900;white-space:nowrap}" +
    ".ub-x{margin-top:8px;padding-top:8px;border-top:1px solid var(--line,rgba(127,127,127,.2))}.ub-sh,.ub-p{margin:0 0 6px;font-size:12.5px;line-height:1.5;word-break:keep-all}.ub-x .bm-x{display:block}" +
    ".ub-more{margin-top:8px}.ub-more>summary{cursor:pointer;font-size:13px;font-weight:800;padding:8px 2px;color:var(--sub)}.ub-note{margin:8px 2px 0;font-size:11.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".bg-lead{margin:0;font-size:15.5px;line-height:1.5;font-weight:700;word-break:keep-all;text-wrap:pretty}.bg-lead.warn{color:var(--text)}" +
    ".bg-d{margin-top:10px}.bg-d summary{cursor:pointer;font-size:14px;font-weight:800;color:var(--accent,#3182f6);list-style:none}.bg-d summary::-webkit-details-marker{display:none}.bg-d summary:after{content:' ▾'}.bg-d[open] summary:after{content:' ▴'}" +
    ".bg-m{background:var(--panel2);border-radius:14px;padding:12px;margin-top:10px}.bg-mh{font-size:14.5px;line-height:1.5;word-break:keep-all}.bg-n{font-size:14px;font-weight:700;margin:6px 0 4px}" +
    ".bg-ck{list-style:none;margin:0;padding:0}.bg-ck li{display:grid;grid-template-columns:22px 1fr;column-gap:4px;padding:5px 0;border-top:1px solid var(--line,rgba(0,0,0,.06));font-size:14px}.bg-ck li i{font-style:normal;grid-row:span 2}.bg-ck li b{font-weight:700}.bg-ck li small{color:var(--sub);font-size:12.5px;word-break:keep-all}.bg-ck li.on b{color:var(--up,#f04452)}" +
    ".bg-lad{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:8px 0 6px}.bg-lad span{text-align:center;border-radius:10px;padding:6px 2px;background:var(--panel,#fff);opacity:.6}.bg-lad span.now{opacity:1;box-shadow:inset 0 0 0 2px var(--accent,#3182f6)}.bg-lad small{display:block;font-size:11.5px;color:var(--sub);font-weight:700}.bg-lad b{font-size:14px;font-weight:900}" +
    ".bm-more summary{cursor:pointer;list-style:none;min-height:44px}.bm-more summary::-webkit-details-marker{display:none}.bm-more summary:after{content:\" ▾\";color:var(--sub)}.bmm{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:8px 0;border-top:1px solid var(--line,rgba(127,127,127,.18));font-size:14px}.bmm em{font-style:normal;font-weight:900}.bmm>small{grid-column:1/-1;font-size:12.5px;line-height:1.45;color:var(--sub);word-break:keep-all}.bmm span small{color:var(--sub)}" +
    ".bm{margin:12px 0 4px}.bm-h{font-size:14px;font-weight:900;margin-bottom:6px}.bm-h small{display:block;font-size:11.5px;font-weight:600;color:var(--sub);margin-top:1px}" +
    ".bm-r{border-radius:12px;background:var(--panel,rgba(127,127,127,.07));padding:10px 12px;margin-top:6px}.bm-r.on{box-shadow:inset 3px 0 0 #e5484d}.bm-r>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.bm-r>summary::-webkit-details-marker{display:none}" +
    ".bm-n{min-width:0}.bm-n b{font-size:14px;font-weight:900}.bm-n small{display:block;font-size:12px;color:var(--sub);font-weight:700;margin-top:1px}.bm-now{text-align:right;flex:0 0 auto;max-width:58%}.bm-now>b{font-size:13.5px;font-weight:900;white-space:nowrap}" +
    ".bm-sg{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:3px;margin-top:4px}.bm-sg i{font-style:normal;font-size:11px;font-weight:700;padding:1px 6px;border-radius:999px;background:rgba(127,127,127,.12);color:var(--sub);white-space:nowrap}.bm-sg i.on{background:rgba(229,72,77,.14);color:#e5484d}" +
    ".bm-x{margin-top:8px;font-size:13px;line-height:1.55;word-break:keep-all}.bm-x p{margin:4px 0 0}.bm-x b{font-weight:800;margin-right:4px}.bm-note{color:var(--sub);font-size:12px}.bm-back{margin-top:6px;font-size:12.5px;font-weight:600;word-break:keep-all}.bm-back b{color:#30a46c}" +
    ".bg-ad{margin:4px 0 0;font-size:14px;line-height:1.5;font-weight:600;word-break:keep-all}.bg-ru{font-size:12px;margin:10px 0 0}" +
    /* 🔍 11/05 A1 오늘의 결론 · A3 한 장 탭 */
    ".h2-vd{display:flex;align-items:center;gap:8px;margin:0 0 2px}.h2-num .h2-vd span{font-size:28px}.h2-num .h2-vd b{display:inline;margin:0;font-size:clamp(26px,8vw,32px);font-weight:900;letter-spacing:-1px;line-height:1.15}.h2-num .h2-vd.dn b{color:var(--down,#3182f6)}.h2-num .h2-vd.up b{color:var(--up,#f04452)}" +
    ".h2-vs{font-size:14.5px;font-weight:700;color:var(--sub);margin:2px 0 10px}" +
    ".h2-nn{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 8px}.h2-num .h2-nn div{background:var(--panel2);border-radius:14px;padding:10px 12px}.h2-num .h2-nn small{display:block;font-size:13px;font-weight:700;color:var(--sub)}.h2-num .h2-nn b{display:block;font-size:26px;font-weight:900;letter-spacing:-.8px;margin-top:2px}.h2-num .h2-nn b.up{color:var(--up,#f04452)}.h2-num .h2-nn b.dn{color:var(--down,#3182f6)}" +
    ".h2-np{display:inline-flex;align-items:center;gap:4px;font-size:13.5px;color:var(--sub);cursor:pointer}.h2-num .h2-np b{display:inline;font-size:inherit;margin:0;letter-spacing:0;line-height:inherit;color:var(--text)}.h2-np em{font-style:normal;font-size:12px;font-weight:800;color:#b7791f;background:rgba(240,180,60,.18);border-radius:999px;padding:2px 8px}" +
    ".h2-clt3{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:var(--panel2);border-radius:12px;padding:4px;margin-bottom:10px}.h2-clt3 button{font:inherit;font-size:14px;font-weight:800;border:0;border-radius:9px;padding:9px 4px;background:transparent;color:var(--sub)}.h2-clt3 button.on{background:var(--panel);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.12)}" +
    ".h2-clr{font-size:14px;font-weight:700;margin-bottom:6px}.h2-cle{margin-top:10px;font-size:14px;line-height:1.5}.h2-cle b{display:block;font-size:14px;margin-bottom:2px}.h2-cle div{padding:2px 0;color:var(--text)}.h2-clb.alt{background:var(--panel2);color:var(--text);border:1px solid var(--line)}" +
    /* ⑰ 오늘의 숫자 */
    ".h2-num{cursor:pointer;padding:22px 20px 18px!important}.h2-num small{display:block;font-size:14px;font-weight:700;color:var(--sub);letter-spacing:-.2px}.h2-num b{display:block;font-size:clamp(40px,12vw,54px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin:4px 0 6px}" +
    ".h2-num b.up{color:var(--up,#f04452)}.h2-num b.dn{color:var(--down,#3182f6)}.h2-num p{margin:0;font-size:16.5px;line-height:1.5;font-weight:600;word-break:keep-all;text-wrap:pretty}.h2-nsub{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.h2-nsub span{font-size:13px;font-weight:700;color:var(--sub);background:var(--panel2);border-radius:999px;padding:4px 10px}" +
    /* ⑳ 타일 안 하루 흐름 */
    ".h2-w{position:relative;overflow:hidden}.h2-sp{position:absolute;left:0;right:0;bottom:0;width:100%;height:30%;opacity:.5}.h2-sp line{stroke:#fff;stroke-width:.6;stroke-dasharray:2 2;vector-effect:non-scaling-stroke}.h2-sp polyline{fill:none;stroke:#fff;stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}" +
    /* ⑲ 지도 터치 */
    ".h2-tm.on{outline:3px solid #fff;outline-offset:-3px;z-index:2}.h2-pick{margin-top:8px}.h2-ph{display:flex;justify-content:space-between;align-items:baseline;padding:8px 2px 4px}.h2-ph b{font-size:16.5px}.h2-ph small{color:var(--sub);font-size:13px}" +
    ".h2-pr{display:flex;align-items:center;gap:8px;width:100%;font:inherit;text-align:left;padding:10px 4px;border:0;border-top:1px solid var(--line);background:transparent;color:var(--text)}.h2-pr b{font-size:15.5px;font-weight:700}.h2-pr em{font-style:normal;font-size:13px;color:var(--dim)}.h2-pr span{margin-left:auto;font-weight:800;font-size:15.5px}" +
    /* ㉑ 고객 한 장 */
    ".h2-clp{background:var(--panel2);border-radius:14px;padding:14px 16px;margin-bottom:12px}.h2-clt{font-size:17px;font-weight:800;letter-spacing:-.3px;line-height:1.4;margin-bottom:8px}.h2-clp ul{margin:0;padding-left:18px;font-size:14px;line-height:1.55;color:var(--sub)}.h2-clp p{margin:8px 0 0;font-size:14px;line-height:1.55;color:var(--sub)}" +
    ".h2-clb{display:block;width:100%;font:inherit;font-size:16px;font-weight:800;padding:14px;border-radius:14px;border:0;background:#fee500;color:#191600}" +
    ".h2-hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 2px 10px}.h2-hd b{font-size:16.5px;letter-spacing:-.3px}.h2-hd .mut{font-size:12px}" +
    /* 링 */
    ".h2-rings{display:flex;gap:12px;overflow-x:auto;padding:4px 4px 12px;margin:0 -4px;scrollbar-width:none}.h2-rings::-webkit-scrollbar{display:none}" +
    ".h2-ring{flex:none;display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:0;padding:0;font:inherit;color:var(--text);cursor:pointer;width:64px}" +
    ".h2-ring .o{width:62px;height:62px;border-radius:50%;padding:3px;background:conic-gradient(#f08c00,#e03131,#c2255c,#7048e8,#1c7ed6,#12b886,#f08c00);display:block}" +
    ".h2-ring.seen .o{background:var(--line)}.h2-ring .i{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;background:var(--panel);border:3px solid var(--bg);font-size:27px}" +
    ".h2-ring small{font-size:11.5px;font-weight:700;letter-spacing:-.4px;white-space:nowrap}.h2-ring:active .o{transform:scale(.94)}" +
    /* 세계 */
    ".h2-wg{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.h2-wg .h2-w{grid-column:span 2}.h2-wg .h2-w.big{grid-column:span 3;padding:12px 12px 10px}.h2-w.big b{font-size:30px;letter-spacing:-1.2px}.h2-w.big small{font-size:13px}.h2-w.big em{font-size:12px}.h2-w{display:flex;flex-direction:column;align-items:flex-start;gap:1px;border:0;border-radius:14px;padding:9px 7px 8px;font:inherit;color:#fff;text-align:left;cursor:pointer;min-width:0}" +
    ".h2-w .f{font-size:18px}.h2-w small{font-size:11px;font-weight:700;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.h2-w b{font-size:16.5px;font-weight:900;letter-spacing:-.6px;margin:2px 0}.h2-w em{font-style:normal;font-size:10.5px;opacity:.88;white-space:nowrap}" +
    /* 발견 */
    ".h2-disc{margin:14px 0}.h2-dc{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 2px 6px;scrollbar-width:none}.h2-dc::-webkit-scrollbar{display:none}" +
    ".h2-d{flex:none;width:74%;max-width:300px;min-height:178px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:flex-start;gap:4px;border:0;border-radius:22px;padding:16px 16px 14px;color:#fff;font:inherit;text-align:left;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.18);position:relative;overflow:hidden}" +
    ".h2-d .ic{font-size:30px;line-height:1}.h2-d small{font-size:12.5px;font-weight:700;opacity:.9;margin-top:4px}.h2-d b{font-size:25px;font-weight:900;letter-spacing:-.8px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".h2-d em{font-style:normal;font-size:12.5px;opacity:.88;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.h2-d .go{margin-top:auto;padding-top:8px;font-size:13px;font-weight:800;background:rgba(255,255,255,.18);border-radius:999px;padding:5px 11px}" +
    ".h2-d:after{content:'';position:absolute;right:-30px;top:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)}.h2-d:active{transform:scale(.98)}" +
    /* 지도 */
    ".h2-map{cursor:pointer}.h2-tmw{position:relative;width:100%;aspect-ratio:100/78;border-radius:14px;overflow:hidden}.h2-tm{position:absolute;box-sizing:border-box;border:1.5px solid var(--panel);padding:4px 5px;color:#fff;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}" +
    ".h2-tm span{font-size:12px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;opacity:.95}.h2-tm b{font-size:13.5px;font-weight:900;white-space:nowrap;letter-spacing:-.5px;line-height:1.15;max-width:100%;overflow:hidden}" +
    ".h2-mh{display:block!important}.h2-mh b{display:block;font-size:18px}.h2-mh .mut{display:block;font-size:13px;margin-top:2px}.h2-lg{justify-content:space-between}.h2-lg{display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-top:6px}" +
    /* 스토리 */
    "#h2sv{position:fixed;inset:0;z-index:100050;color:#fff;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 10px) 18px calc(env(safe-area-inset-bottom) + 16px);user-select:none;-webkit-user-select:none;animation:svIn .22s ease}@keyframes svIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}" +
    ".sv-bars{display:flex;gap:4px}.sv-bars i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden}.sv-bars i b{display:block;height:100%;width:0;background:#fff}.sv-bars i.done b{width:100%}" +
    ".sv-top{display:flex;align-items:center;gap:10px;margin-top:12px}.sv-top img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.7)}.sv-top div{flex:1}.sv-top b{display:block;font-size:15px}.sv-top small{font-size:12px;opacity:.75}.sv-top button{background:none;border:0;color:#fff;font-size:24px;padding:4px 8px}" +
    ".sv-ic{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:22px}" +
    ".sv-hero{width:118px;height:118px;border-radius:34px;object-fit:cover;box-shadow:0 14px 36px rgba(0,0,0,.35);border:3px solid rgba(255,255,255,.55);margin-bottom:8px;animation:svPop .45s cubic-bezier(.2,1.4,.4,1)}@keyframes svPop{from{transform:scale(.6) rotate(-6deg);opacity:0}to{transform:none;opacity:1}}" +
    ".s2-list b em{font-style:normal;font-size:12px;font-weight:700;opacity:.7;margin-left:4px}" +
    ".sv-body{flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:10px 4px}.sv-body h2{font-size:21px;font-weight:800;letter-spacing:-.5px;margin:0 0 4px;opacity:.95}" +
    ".s2-k{font-size:15px;font-weight:700;opacity:.85}.s2-big{font-size:68px;font-weight:900;letter-spacing:-2.5px;line-height:1}.s2-big small{font-size:16px;font-weight:700;margin-left:6px;letter-spacing:0;opacity:.85}.s2-big2{font-size:34px;font-weight:900;letter-spacing:-1px;line-height:1.2}.s2-big2 small{font-size:15px;opacity:.8}" +
    "#h2sv .up{color:#ffb4ae}#h2sv .dn{color:#a9c8ff}#h2sv .s2-big.up{color:#fff;text-shadow:0 0 30px rgba(255,90,80,.7)}#h2sv .s2-big.dn{color:#fff;text-shadow:0 0 30px rgba(80,140,255,.8)}" +
    ".s2-row{display:flex;gap:16px;flex-wrap:wrap;font-size:15px}.s2-row b{font-weight:800}.s2-gauge{height:10px;border-radius:5px;background:rgba(80,140,255,.55);overflow:hidden}.s2-gauge i{display:block;height:100%;background:#ff6b6b}" +
    ".s2-p{font-size:15px;line-height:1.55;opacity:.92;margin:4px 0 0}.s2-ul{margin:4px 0 0;padding-left:18px;font-size:14px;line-height:1.55;opacity:.92}.s2-chips{display:flex;flex-wrap:wrap;gap:6px}.s2-chips span{background:rgba(255,255,255,.16);border-radius:999px;padding:6px 11px;font-size:14px;font-weight:700}.s2-chips small{opacity:.75}" +
    ".s2-list>div{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.15)}.s2-list .r{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex:none}.s2-list b{flex:1;min-width:0;font-size:17px}.s2-list b small{display:block;font-size:12.5px;font-weight:500;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s2-list>div>span:last-child{font-size:16px;font-weight:800}" +
    ".s2-bars{display:flex;flex-direction:column;gap:9px}.s2-br{display:grid;grid-template-columns:minmax(0,1.1fr) 1fr auto;gap:10px;align-items:center}.s2-br .n{font-size:15px;font-weight:700;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s2-br .t{position:relative;height:14px;background:rgba(255,255,255,.12);border-radius:7px;overflow:hidden}.s2-br .z{position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.5)}.s2-br .b{position:absolute;top:2px;bottom:2px;border-radius:5px}.s2-br .b.u{background:#ff6b6b}.s2-br .b.d{background:#5c9dff}.s2-br>b{font-size:15px;font-weight:800;min-width:56px;text-align:right}" +
    ".sv-foot{display:flex;flex-direction:column;align-items:center;gap:8px}.sv-cta{width:100%;font:inherit;font-size:16px;font-weight:800;padding:15px;border-radius:16px;border:1.5px solid rgba(255,255,255,.45);background:rgba(255,255,255,.12);color:#fff}.sv-cta.hot{background:#fff;color:#1d2433;border-color:#fff}.sv-foot small{font-size:11.5px;opacity:.6}";
  document.head.appendChild(css);
})();
;
__bk(66);
__be(6);
