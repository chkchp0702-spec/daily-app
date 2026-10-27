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
