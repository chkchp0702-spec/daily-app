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
    var A = amt(), w = C.w, x = C.st ? C.stw / 100 : 0, k = 1 - x;
    var parts = {SPY: A * w.SPY / 100 * k, QQQ: A * w.QQQ / 100 * k, GLD: A * w.GLD / 100 * k, BIL: A * Math.max(0, 100 - w.SPY - w.QQQ - w.GLD) / 100 * k};
    var M = {}, add = function(key, nm, v, src){ if (!(v > 0)) return; var o = M[key] || (M[key] = {nm: nm, v: 0, s: {}}); o.v += v; o.s[src] = (o.s[src] || 0) + v; };
    var et = (E && E.etf) || {}, byName = {};
    ["SPY", "QQQ"].forEach(function(f){ ((et[f] || {}).top || []).forEach(function(h){ byName[nn(h[1])] = h[0]; }); });
    var expand = function(f, v, src){ var H = et[f]; if (!H || !H.top){ add("~" + f, f === "SPY" ? "S&P500 (구성 자료 없음)" : "나스닥100 (구성 자료 없음)", v, src); return; }
      H.top.forEach(function(h){ add(h[0], KO[h[0]] || h[1], v * h[2] / 100, src); }); if (H.rest > 0) add("~" + f + "r", (f === "SPY" ? "S&P500 나머지 " : "나스닥100 나머지 ") + Math.max(0, H.n - H.top.length) + "종목", v * H.rest / 100, src); };
    expand("SPY", parts.SPY, "S"); expand("QQQ", parts.QQQ, "Q"); add("~GLD", "금", parts.GLD, "G"); add("~BIL", "현금·단기채", parts.BIL, "C");
    if (x) add("~X" + C.st, C.st, A * x, "X");
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
