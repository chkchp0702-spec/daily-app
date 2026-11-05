/* 11/05 사용자 「1,3 진행해」 — 📱 앱 아이디어 A11/5-1 · A11/5-3
   ① 📐 수익률 지도 (A11/5-1) — 🛍 상품 탭(채권·펀드·ELS 어디서든) 맨 위 한 장:
      가로 = 남은 기간(만기 · ELS 는 최장) · 세로 = 연 수익률(원화 채권 = 세전 매수 금리 · 미국채·호주국채 = 그 나라 돈 기준 · ELS·ELB = 조건 맞으면 연 쿠폰 · 펀드 = 지난 1년).
      펀드는 만기가 없어 오른쪽 「만기 없음」 칸에 유형마다 대표 하나(설정액 가장 큰 것) + 🔬 에 담아 둔 펀드.
      손가락을 옆으로 끌며 네모를 그리면 그 안 상품이 밑에 서고 → 「📲 크게 보기 · 한 장」 → 📨 그림으로 보내기. 점 하나 누르면 그 상품 한 줄.
   ③ 📋 받은 글 → 답장 한 장 (A11/5-3) — 머리 🔍 에 카톡으로 받은 긴 글을 붙여넣으면 검색 대신:
      글에 나온 종목 지금 등락 · 그 종목(·지수)이 기초자산인 청약 중 ELS · 📌 내 ELS 겹침 · 글 속 숫자 조건(5%·3년)에 맞는 상품 · 답이 될 카드(💬 고객이 물으면) → 한 장.
      받은 글은 이 휴대폰 화면 안에서만 읽음(저장·전송 없음) · 한 장에는 원문을 싣지 않음(종목·숫자만).
   원칙: 숫자를 지어내지 않음(자료 없으면 「자료 없음」) · 사라·팔라는 말 없음 · 과거 수익률은 미래 보장 아님 · 사모(pv) 빼기. */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d); }
  function pc(v, d){ return v == null || isNaN(v) ? "–" : (+v).toFixed(d == null ? 2 : d) + "%"; }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function ls(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(x) { return null; } }
  function U(){ return window.__u1104 || null; }
  function J(u, t){ t = t || 600000; return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / t), {ttl: t}).catch(function(){ return null; }); }
  var DISC = "투자 권유 아님 · 과거 수익률은 미래를 보장하지 않음 · ELS·펀드는 원금 손실 가능 · 세금·수수료 전 · 상품 설명서를 꼭 확인";
  var COL = {bond: "#4b8bff", ust: "#7aa7ff", els: "#ff9f43", elb: "#f2c94c", fund: "#2ecc71"};

  /* ════════════ 공통: 크게 보기 · 그림 한 장 ════════════
     S = {title, sub, cards: [{t: "p", h, big, nm, sub, mean, won, k} | {t: "l", h, lines: [[왼쪽, 오른쪽, 색]] , note}], fn} */
  var SHEET = null;
  function bigOpen(S){
    SHEET = S; var old = document.getElementById("nsbig"); if (old) old.remove();
    var d = document.createElement("div"); d.id = "nsbig"; d.className = "no-clp";
    d.innerHTML = '<div class="nb-in"><div class="nb-top"><small>' + md(today()) + ' · 참고용</small><button type="button" class="nb-x" aria-label="닫기">✕</button></div>' +
      '<h2>' + e(S.title) + '</h2><p class="nb-s">' + e(S.sub || "") + '</p>' +
      S.cards.map(function(c){
        if (c.t === "l") return '<div class="nb-c yb-l"><small>' + e(c.h) + '</small>' + c.lines.map(function(l){ return '<div class="yb-li"><span>' + e(l[0]) + '</span><b' + (l[2] ? ' style="color:var(--' + (l[2] === "up" ? "up" : "down") + ')"' : '') + '>' + e(l[1]) + '</b></div>'; }).join("") + (c.note ? '<i>' + e(c.note) + '</i>' : '') + '</div>';
        return '<div class="nb-c"><small>' + e(c.h) + '</small><b>' + e(c.big) + '</b><span>' + e(c.nm) + '</span><em>' + e(c.sub || "") + '</em>' + (c.mean ? '<i>' + e(c.mean) + '</i>' : '') + (c.won ? '<u>' + e(c.won) + '</u>' : '') + '</div>';
      }).join("") +
      '<p class="nb-d">' + DISC + '</p><button type="button" class="nb-send">📨 이 한 장 보내기</button></div>';
    document.body.appendChild(d);
    d.querySelector(".nb-x").onclick = function(){ d.remove(); };
    d.querySelector(".nb-send").onclick = function(){ sendImg(S); };
  }
  function wrap(g, t, maxW){ var out = [], line = ""; String(t).split(/(\s+)/).forEach(function(w){ var tt = line + w; if (g.measureText(tt).width > maxW && line.trim()){ out.push(line.trim()); line = w.trim(); } else line = tt; }); if (line.trim()) out.push(line.trim()); return out; }
  function cardH(c){ return c.t === "l" ? 80 + c.lines.length * 50 + (c.note ? 50 : 0) : 300; }
  function sendImg(S){
    S = S || SHEET; if (!S) return;
    var W = 1080, need = 270 + S.cards.reduce(function(a, c){ return a + cardH(c) + 20; }, 0) + 150, H = Math.min(1920, Math.max(1350, need));
    var c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d");
    var F = "-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", IC = {bond: "#2563eb", els: "#d97706", fund: "#059669"};
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; g.fillText(md(today()) + " · 참고용", 64, 90);
    g.fillStyle = "#111827"; g.font = "800 54px " + F; wrap(g, S.title, W - 128).slice(0, 1).forEach(function(l){ g.fillText(l, 64, 168); });
    g.fillStyle = "#6b7280"; g.font = "500 30px " + F; wrap(g, S.sub || "", W - 128).slice(0, 1).forEach(function(l){ g.fillText(l, 64, 220); });
    var y = 260;
    S.cards.forEach(function(cd){
      var h = cardH(cd); if (y + h > H - 140) return;
      g.fillStyle = "#f3f4f6"; g.beginPath(); if (g.roundRect) g.roundRect(48, y, W - 96, h, 28); else g.rect(48, y, W - 96, h); g.fill();
      g.fillStyle = IC[cd.k] || "#6366f1"; g.fillRect(48, y + 24, 10, h - 48);
      g.fillStyle = "#374151"; g.font = "700 30px " + F; g.fillText(cd.h, 88, y + 58);
      if (cd.t === "l"){
        cd.lines.forEach(function(l, i){ var yy = y + 110 + i * 50;
          g.fillStyle = "#111827"; g.font = "600 32px " + F; var lt = wrap(g, l[0], W - 470)[0] || ""; g.fillText(lt, 88, yy);
          g.fillStyle = l[2] === "up" ? "#dc2626" : l[2] === "dn" ? "#2563eb" : "#111827"; g.font = "800 32px " + F; var tw = g.measureText(l[1]).width; g.fillText(l[1], W - 88 - tw, yy); });
        if (cd.note){ g.fillStyle = "#b45309"; g.font = "500 25px " + F; g.fillText(wrap(g, cd.note, W - 190)[0] || "", 88, y + 114 + cd.lines.length * 50); }
      } else {
        g.fillStyle = "#111827"; g.font = "800 54px " + F; g.fillText(cd.big, 88, y + 124);
        g.font = "600 30px " + F; wrap(g, cd.nm, W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 170); });
        g.fillStyle = "#4b5563"; g.font = "500 26px " + F; wrap(g, cd.sub || "", W - 190).slice(0, 1).forEach(function(l){ g.fillText(l, 88, y + 210); });
        g.fillStyle = "#b45309"; g.font = "500 26px " + F; wrap(g, (cd.mean || "") + (cd.won ? " · " + cd.won : ""), W - 190).slice(0, 2).forEach(function(l, i){ g.fillText(l, 88, y + 248 + i * 32); });
      }
      y += h + 20;
    });
    g.fillStyle = "#6b7280"; g.font = "500 24px " + F; wrap(g, DISC, W - 128).forEach(function(l, i){ g.fillText(l, 64, H - 100 + i * 34); });
    c.toBlob(function(b){
      if (!b) return;
      var f = new File([b], (S.fn || "한장") + "_" + today().slice(5).replace("-", "") + ".png", {type: "image/png"});
      if (window.__onepage && __onepage.ready) __onepage.ready([f], S.title);
      else { var a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); }
    }, "image/png");
  }

  /* ════════════ ① 📐 수익률 지도 ════════════ */
  var FTYPES = ["주식형", "해외주식형", "주식혼합형", "채권혼합형", "해외채권혼합형", "채권형", "해외채권형", "MMF"];
  var YM = {D: null, P: null, box: null, tap: null, open: 1, kinds: {bond: 1, els: 1, elb: 1, fund: 1}};
  try { var so = sessionStorage.getItem("ymOpen"); if (so != null) YM.open = +so; } catch(x) {}
  function fundOk(f){ return !f.pv && f.y1 != null && !(f.y1 > 300) && !(/채권형|MMF/.test(f.t || "") && !/혼합/.test(f.t) && f.y1 > 12); }
  function ymPoints(D){
    var u = U(); if (!u) return [];
    var R = u.pick(D, {rate: -99}), pts = [], i;
    R.bond.forEach(function(b){ pts.push({k: "bond", x: b.y, r: b.r, o: b, nm: b.nm, fx: b.cur !== "원화"}); });
    R.els.forEach(function(x){ if (x.y == null || x.y <= 0) return; pts.push({k: x.elb ? "elb" : "els", x: x.y, r: x.r, o: x, nm: x.nm}); });
    var F = ((D.p && D.p.funds) || []).filter(function(f){ return fundOk(f) && (f.aum || 0) >= 10; }), slot = 0;
    FTYPES.forEach(function(t){
      var G = F.filter(function(f){ return f.t === t; }); if (!G.length) return;
      var ys = G.map(function(f){ return f.y1; }).sort(function(a, b){ return a - b; }), med = ys[Math.floor(ys.length / 2)];
      var big = G.slice().sort(function(a, b){ return (b.aum || 0) - (a.aum || 0); })[0];
      pts.push({k: "fund", fund: 1, slot: slot++, r: big.y1, nm: big.n, t: t, med: med, n: G.length, o: {k: "fund", nm: big.n, r: big.y1, t: big.t, st: big.st, rk: big.rk, co: big.co, c: big.c}});
    });
    var mine = ls("xrFunds"), all = (D.p && D.p.funds) || [];
    if (Array.isArray(mine)) mine.forEach(function(m){ for (i = 0; i < all.length; i++){ var f = all[i]; if (f.c === m.id && fundOk(f)){ pts.push({k: "fund", fund: 1, mine: 1, slot: slot++, r: f.y1, nm: f.n, t: f.t, o: {k: "fund", nm: f.n, r: f.y1, t: f.t, st: f.st, rk: f.rk, co: f.co, c: f.c}}); break; } } });
    return pts;
  }
  // 그림 좌표: 만기는 로그 눈금 log(1+년)(가까운 쪽을 넓게 — ELS·단기채가 몰린 1~3년이 보이게) · 오른쪽 띠 = 펀드(만기 없음)
  var G = {W: 358, H: 250, L: 34, R: 62, T: 12, B: 30, XM: 30, YM: 20};
  function gx(y){ return G.L + Math.log(1 + Math.max(0, Math.min(G.XM, y))) / Math.log(1 + G.XM) * (G.W - G.L - G.R); }
  function gy(r){ return G.T + (1 - Math.max(0, Math.min(G.YM, r)) / G.YM) * (G.H - G.T - G.B); }
  function ix(px){ var t = (px - G.L) / (G.W - G.L - G.R); t = Math.max(0, Math.min(1, t)); return Math.exp(t * Math.log(1 + G.XM)) - 1; }
  function iy(py){ return (1 - (py - G.T) / (G.H - G.T - G.B)) * G.YM; }
  function fbx(){ return G.W - G.R + 10; }
  function ptXY(p, nf){ if (p.fund){ var bw = G.R - 16, n = Math.max(1, nf); return [fbx() + 4 + (n === 1 ? bw / 2 : p.slot / (n - 1) * (bw - 8)), gy(p.r)]; } return [gx(p.x), gy(p.r)]; }
  function vis(p){ return YM.kinds[p.k]; }
  function ymSVG(pts){
    var W = G.W, H = G.H, s = '<svg id="ymsvg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="만기와 수익률 지도">';
    [0, 5, 10, 15, 20].forEach(function(r){ var y = gy(r); s += '<line x1="' + G.L + '" x2="' + (W - 6) + '" y1="' + y + '" y2="' + y + '" class="ym-gl"/><text x="' + (G.L - 4) + '" y="' + (y + 4) + '" class="ym-tx" text-anchor="end">' + r + '%</text>'; });
    [1, 3, 5, 10, 30].forEach(function(t){ var x = gx(t); s += '<line x1="' + x + '" x2="' + x + '" y1="' + G.T + '" y2="' + (H - G.B) + '" class="ym-gl ym-v"/><text x="' + x + '" y="' + (H - G.B + 15) + '" class="ym-tx" text-anchor="' + (t === 30 ? "end" : "middle") + '">' + t + '년</text>'; });
    var fb = fbx(); s += '<rect x="' + (fb - 4) + '" y="' + G.T + '" width="' + (G.R - 8) + '" height="' + (H - G.T - G.B) + '" rx="6" class="ym-fb"/><text x="' + (fb + (G.R - 16) / 2) + '" y="' + (H - G.B + 15) + '" class="ym-tx" text-anchor="middle">만기 없음</text>';
    var nf = pts.filter(function(p){ return p.fund; }).length, order = {fund: 0, bond: 1, elb: 2, els: 3};
    pts.slice().sort(function(a, b){ return order[a.k] - order[b.k]; }).forEach(function(p){
      if (!vis(p)) return; var q = ptXY(p, nf), over = p.r > G.YM, cy = over ? G.T + 3 : q[1], col = p.k === "bond" && p.fx ? COL.ust : COL[p.k];
      var sel = YM.box && inBox(p, nf), cls = "ym-p" + (sel ? " on" : YM.box ? " off" : "");
      if (p.k === "elb") s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="3.4" class="' + cls + '" fill="none" stroke="' + col + '" stroke-width="1.6"/>';
      else s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (p.fund ? 5 : 3.3) + '" class="' + cls + '" fill="' + col + '"' + (p.mine ? ' stroke="#fff" stroke-width="1.6"' : '') + '/>';
      if (over) s += '<text x="' + q[0].toFixed(1) + '" y="' + (G.T + 1) + '" class="ym-ov" text-anchor="middle">▲</text>';
    });
    if (YM.box){ var b = YM.box; s += '<rect x="' + Math.min(b.x0, b.x1) + '" y="' + Math.min(b.y0, b.y1) + '" width="' + Math.abs(b.x1 - b.x0) + '" height="' + Math.abs(b.y1 - b.y0) + '" class="ym-box"/>'; }
    if (YM.tap){ var t = YM.tap, tq = ptXY(t, nf); s += '<circle cx="' + tq[0] + '" cy="' + Math.min(tq[1], t.r > G.YM ? G.T + 3 : tq[1]) + '" r="8" class="ym-tap"/>'; }
    return s + '</svg>';
  }
  function inBox(p, nf){ var b = YM.box; if (!b) return false; var q = ptXY(p, nf), y = p.r > G.YM ? G.T + 3 : q[1];
    return q[0] >= Math.min(b.x0, b.x1) - 2 && q[0] <= Math.max(b.x0, b.x1) + 2 && y >= Math.min(b.y0, b.y1) - 2 && y <= Math.max(b.y0, b.y1) + 2; }
  function boxTxt(){
    var b = YM.box; if (!b) return "";
    var xa = Math.min(b.x0, b.x1), xb = Math.max(b.x0, b.x1), ra = iy(Math.max(b.y0, b.y1)), rb = iy(Math.min(b.y0, b.y1)), u = U(), t = [];
    if (xa < G.W - G.R) t.push("남은 기간 " + (ix(xa) < 0.08 ? "0" : u.ytxt(ix(xa)).trim()) + " ~ " + (xb >= G.W - G.R ? "30년" : u.ytxt(ix(xb)).trim()));
    if (xb >= fbx() - 4) t.push("펀드(만기 없음)");
    t.push("연 " + Math.max(0, ra).toFixed(1) + "% ~ " + (Math.min(b.y0, b.y1) <= G.T + 4 ? "그 위" : rb.toFixed(1) + "%"));
    return t.join(" · ");
  }
  var KN = {bond: "🏦 채권", elb: "🎯 ELB(원금 지급형)", els: "🎯 ELS", fund: "📦 펀드"};
  function selList(pts){
    var nf = pts.filter(function(p){ return p.fund; }).length, S = {bond: [], elb: [], els: [], fund: []};
    pts.forEach(function(p){ if (vis(p) && inBox(p, nf)) S[p.k].push(p); });
    return S;
  }
  function selHTML(pts){
    if (YM.tap){
      var p = YM.tap, T = U().rowTxt(p.o, {});
      return '<div class="ym-one"><small>' + T.h + (p.mine ? ' · 🔬 담아 둔 펀드' : '') + '</small><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i>' +
        (p.fund && p.n ? '<em>같은 유형(' + e(p.t) + ') ' + p.n + '개 가운데값 지난 1년 ' + sg(p.med, 1) + '% · 점은 설정액이 가장 큰 펀드</em>' : '') +
        '<button type="button" class="ym-go" data-ymj="' + (p.k === "bond" ? "bond" : p.k === "fund" ? "fund" : "els") + '">' + KN[p.k] + ' 탭에서 보기 ›</button></div>';
    }
    if (!YM.box) return '<p class="ym-hint">👆 손가락을 <b>옆으로 끌면서</b> 네모를 그리면 그 안 상품이 여기 모여요 · 점 하나를 누르면 그 상품 · 위아래로 밀면 화면이 내려가요</p>';
    var S = selList(pts), n = S.bond.length + S.elb.length + S.els.length + S.fund.length;
    var h = '<div class="ym-sh"><b>▭ ' + e(boxTxt()) + '</b><small>채권 ' + S.bond.length + ' · ELB ' + S.elb.length + ' · ELS ' + S.els.length + ' · 펀드 ' + S.fund.length + '</small><button type="button" class="ym-clr">지우기</button></div>';
    if (!n) return h + '<p class="ym-hint">이 네모 안엔 상품이 없어요. 조금 넓게 그려 보세요.</p>';
    var top = ymTop(S);
    h += '<div class="ns-top">' + top.map(function(x){ var T = U().rowTxt(x, {}); return '<div class="ns-c"><small>' + T.h + '</small><b class="ns-big">' + e(T.big) + '</b><span class="ns-nm">' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i></div>'; }).join("") + '</div>' +
      '<div class="ns-act"><button type="button" class="ym-big">📲 크게 보기 · 한 장</button></div>';
    [["bond", S.bond], ["elb", S.elb], ["els", S.els], ["fund", S.fund]].forEach(function(z){
      if (z[1].length < 2) return;
      h += '<details class="ns-more"><summary>' + KN[z[0]] + ' ' + z[1].length + '개 모두</summary>' + sortK(z[0], z[1]).slice(0, 12).map(function(p){ var T = U().rowTxt(p.o, {}); return '<div class="ns-r"><b>' + e(T.big) + '</b><span>' + e(T.nm) + '</span><small>' + e(T.sub) + '</small></div>'; }).join("") + (z[1].length > 12 ? '<p class="ym-hint">…위험 낮은 순 12개까지</p>' : '') + '</details>';
    });
    return h;
  }
  function sortK(k, L){   // ux1104 숫자로 찾기와 같은 순서: 원화 먼저·위험 낮은 순 / ELB 먼저·KI 낮은 순 / 펀드는 위험 낮은 순
    L = L.slice();
    if (k === "bond") L.sort(function(a, b){ return (a.o.cur !== "원화") - (b.o.cur !== "원화") || a.o.rk - b.o.rk || a.o.bk - b.o.bk || b.r - a.r; });
    else if (k === "fund") L.sort(function(a, b){ return (b.o.rk || 0) - (a.o.rk || 0) || b.r - a.r; });
    else L.sort(function(a, b){ return a.o.kio - b.o.kio || b.r - a.r; });
    return L;
  }
  function ymTop(S){ return [sortK("bond", S.bond)[0], sortK("elb", S.elb)[0] || sortK("els", S.els)[0], sortK("fund", S.fund)[0]].filter(Boolean).map(function(p){ return p.o; }); }
  function ymSheet(pts){
    var S = selList(pts), top = ymTop(S); if (!top.length) return;
    bigOpen({title: "이 범위의 상품 한눈에", sub: boxTxt() + " · 위험이 낮은 것부터 한 가지씩", fn: "수익률지도",
      cards: top.map(function(x){ var T = U().rowTxt(x, {}); return {t: "p", k: x.k, h: T.h, big: T.big, nm: T.nm, sub: T.sub, mean: T.mean}; })});
  }
  var PRESET = [["1년 안", 0, 1, 0, 20], ["3년 안팎 · 연 4%↑", 2.3, 3.8, 4, 20], ["연 8%↑", 0, 30, 8, 20], ["5년 넘게", 5, 30, 0, 20]];
  function presetBox(i){ var p = PRESET[i]; YM.tap = null; YM.box = {x0: gx(p[1]) - 1, x1: p[2] >= 30 ? G.W - G.R - 1 : gx(p[2]) + 1, y0: gy(p[4]) - 1, y1: gy(p[3]) + 1}; }
  function ymCard(){
    var pts = YM.pts || [];
    var cnt = {bond: 0, elb: 0, els: 0, fund: 0}; pts.forEach(function(p){ cnt[p.k]++; });
    return '<div class="ym-hd" data-ymt="1"><h3>📐 수익률 지도 <small>만기 × 수익률 · 한 판에</small></h3><span class="ym-tg">' + (YM.open ? "접기 ▴" : "펼치기 ▾") + '</span></div>' +
      (YM.open ? '<p class="ym-sub">채권 ' + cnt.bond + ' · ELS ' + cnt.els + ' · ELB ' + cnt.elb + '(청약 중) · 펀드 유형 대표 ' + cnt.fund + ' — 점 하나가 상품 하나</p>' +
      '<div class="ym-kd">' + [["bond", "채권", COL.bond], ["els", "ELS", COL.els], ["elb", "ELB 원금지급", COL.elb], ["fund", "펀드", COL.fund]].map(function(k){ return '<button type="button" data-ymk="' + k[0] + '" class="' + (YM.kinds[k[0]] ? "on" : "") + '"><i style="' + (k[0] === "elb" ? "border:2px solid " + k[2] : "background:" + k[2]) + '"></i>' + k[1] + '</button>'; }).join("") + '</div>' +
      '<div class="ym-cv">' + ymSVG(pts) + '</div>' +
      '<div class="ym-ps">' + PRESET.map(function(p, i){ return '<button type="button" data-ymp="' + i + '">' + e(p[0]) + '</button>'; }).join("") + '</div>' +
      '<div id="ymsel">' + selHTML(pts) + '</div>' +
      '<p class="ym-n">세로: 원화 채권 = 세전 매수 금리(만기까지 들고 있으면) · 미국채·호주국채(옅은 파랑) = 그 나라 돈 기준 · ELS·ELB = 조건 맞으면 받는 연 쿠폰(약속된 최대치 · ELS 는 원금 손실 가능 · 가로는 최장 만기) · 펀드 = 지나간 1년(앞으로 보장 아님) — 셋은 위험이 다른 숫자예요. ' + G.YM + '% 넘는 점은 맨 위 ▲. 미래에셋 판매 목록·DART 청약 공시 그대로 · 참고용</p>' : '');
  }
  function ymPaint(){
    var c = document.getElementById("ymap"); if (!c) return;
    c.innerHTML = ymCard(); ymBind(c);
  }
  function ymPaintSel(){ var s = document.getElementById("ymsel"), v = document.querySelector("#ymap .ym-cv"); if (v) v.innerHTML = ymSVG(YM.pts || []); if (s) s.innerHTML = selHTML(YM.pts || []); ymBindSvg(); }
  function svgPt(svg, ev){ var r = svg.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * G.W, (ev.clientY - r.top) / r.height * G.H]; }
  function ymBindSvg(){
    var svg = document.getElementById("ymsvg"); if (!svg || svg.dataset.b) return; svg.dataset.b = "1";
    var st = null;
    svg.addEventListener("pointerdown", function(ev){ st = {p: svgPt(svg, ev), id: ev.pointerId, draw: ev.pointerType === "mouse", moved: false}; });
    svg.addEventListener("pointermove", function(ev){
      if (!st || ev.pointerId !== st.id) return; var q = svgPt(svg, ev), dx = q[0] - st.p[0], dy = q[1] - st.p[1];
      if (!st.draw){ if (Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy)){ st.draw = true; try { svg.setPointerCapture(ev.pointerId); } catch(z) {} } else return; }
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      st.moved = true; ev.preventDefault();
      YM.tap = null; YM.box = {x0: st.p[0], y0: st.p[1], x1: Math.max(0, Math.min(G.W, q[0])), y1: Math.max(G.T, Math.min(G.H - G.B, q[1]))};
      var b = YM.box, r = svg.querySelector(".ym-box");   // 끄는 동안엔 네모만 고침(그림 전체를 다시 그리면 손가락이 끊김)
      if (!r){ r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); r.setAttribute("class", "ym-box"); svg.appendChild(r); }
      r.setAttribute("x", Math.min(b.x0, b.x1)); r.setAttribute("y", Math.min(b.y0, b.y1)); r.setAttribute("width", Math.abs(b.x1 - b.x0)); r.setAttribute("height", Math.abs(b.y1 - b.y0));
    });
    function end(ev){
      if (!st) return; var s0 = st; st = null;
      if (s0.moved){ ymPaintSel(); try { if (window.ntfyUse) ntfyUse("ymap_box"); } catch(z) {} return; }
      // 누르기 = 가장 가까운 점(14px 안)
      var q = svgPt(svg, ev), best = null, bd = 14 * 14, pts = YM.pts || [], nf = pts.filter(function(p){ return p.fund; }).length;
      pts.forEach(function(p){ if (!vis(p)) return; var a = ptXY(p, nf), y = p.r > G.YM ? G.T + 3 : a[1], d = (a[0] - q[0]) * (a[0] - q[0]) + (y - q[1]) * (y - q[1]); if (d < bd){ bd = d; best = p; } });
      if (best){ YM.tap = best; YM.box = null; ymPaintSel(); }
    }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", function(){ st = null; });
  }
  function ymBind(c){
    c.onclick = function(ev){
      var t = ev.target.closest && ev.target.closest("[data-ymt],button"); if (!t) return; ev.stopPropagation();
      if (t.dataset.ymt){ YM.open = YM.open ? 0 : 1; try { sessionStorage.setItem("ymOpen", YM.open); } catch(z) {} ymPaint(); return; }
      if (t.dataset.ymk){ YM.kinds[t.dataset.ymk] = YM.kinds[t.dataset.ymk] ? 0 : 1; YM.tap = null; ymPaint(); return; }
      if (t.dataset.ymp != null){ presetBox(+t.dataset.ymp); ymPaintSel(); return; }
      if (t.classList.contains("ym-clr")){ YM.box = null; YM.tap = null; ymPaintSel(); return; }
      if (t.classList.contains("ym-big")){ ymSheet(YM.pts || []); return; }
      if (t.dataset.ymj){ var k = t.dataset.ymj; if (window.goTo) goTo(k, "pdbody"); else if (window.go) go(k); }
    };
    ymBindSvg();
  }
  function ymMount(){
    var root = document.getElementById("pdroot"); if (!root || !/^(bond|fund|els)$/.test(root.dataset.k || "")) return;
    if (root.querySelector(".loading") && !root.querySelector("#pdbody")) return;
    if (document.getElementById("ymap")) return;
    var c = document.createElement("section"); c.className = "card no-clp ym4"; c.id = "ymap"; c.dataset.xc = "1";
    c.innerHTML = '<div class="ym-hd"><h3>📐 수익률 지도</h3></div><p class="ym-hint">상품 목록 불러오는 중…</p>';
    root.insertBefore(c, root.firstChild);
    var u = U(); if (!u) return;
    var w = root.clientWidth; if (w > 200) G.W = Math.min(560, Math.round(w - 26));
    u.nsData().then(function(D){ YM.pts = ymPoints(D); ymPaint(); }).catch(function(){ c.innerHTML = '<p class="ym-hint">상품 자료를 못 받았어요.</p>'; });
  }

  /* ════════════ ③ 📋 받은 글 → 답장 한 장 ════════════ */
  var NM = null, TKSTOP = {};   // 금융 줄임말과 같은 티커는 종목으로 안 셈(ELS = 미국 리츠 티커 등)
  "ELS ELB DLS DLB ETF ETN IRP ISA CEO CFO GDP CPI PPI IPO EPS PER PBR ROE USD KRW FED ECB BOJ MMF RSI TDF ATM OTC SEC ESG NAV CMA RIA ADR VIX KOSPI FOMC AI IT".split(" ").forEach(function(k){ TKSTOP[k] = 1; });
  function nameList(){
    if (NM || !window.OPIDX) return NM;
    var L = [];
    OPIDX.forEach(function(r){
      if (/ ADR$/.test(r.name)) return;
      var nm = String(r.name || "").trim(), t = r.tier || 0, kr = r.mkt === "KR";
      if (kr){ if (nm.length >= 3 || (nm.length === 2 && t >= 4)) L.push({w: nm, r: r}); }
      else if (/[가-힣]/.test(nm) && t >= 3 && nm.replace(/\s/g, "").length >= 2) L.push({w: nm, r: r});
      (r.altRaw || []).forEach(function(a){ if (a !== nm && a.length >= 3 && t >= 3 && /^[가-힣A-Za-z0-9]+$/.test(a)) L.push({w: a, r: r}); });
      if (!kr && t >= 4 && /^[A-Z]{3,5}$/.test(r.sym) && !TKSTOP[r.sym]) L.push({w: r.sym, r: r, tk: 1});
    });
    L.sort(function(a, b){ return b.w.length - a.w.length; });
    return NM = L;
  }
  var HAN = /[가-힣]/;
  function findStocks(t){
    var L = nameList() || [], used = new Uint8Array(t.length), out = [], seen = {};
    for (var i = 0; i < L.length && out.length < 8; i++){
      var c = L[i], w = c.w, from = 0, at;
      while ((at = t.indexOf(w, from)) >= 0){
        from = at + 1; var ok = true;
        for (var j = at; j < at + w.length; j++) if (used[j]){ ok = false; break; }
        if (!ok) continue;
        var pre = at ? t.charAt(at - 1) : "", post = t.charAt(at + w.length);
        if (c.tk){ if (/[A-Za-z0-9]/.test(pre) || /[A-Za-z0-9]/.test(post)) continue; }
        else if (w.length <= 3 && HAN.test(pre)) continue;   // 짧은 이름은 앞에 한글이 붙으면(낱말 속) 안 셈
        else if (/^[A-Za-z]/.test(w) && /[A-Za-z]/.test(pre)) continue;
        for (j = at; j < at + w.length; j++) used[j] = 1;
        if (!seen[c.r.sym]){ seen[c.r.sym] = 1; out.push({r: c.r, w: w, at: at}); }
        break;
      }
    }
    return out.sort(function(a, b){ return a.at - b.at; });
  }
  var IDXW = [[/코스피|KOSPI/i, "KOSPI200", "코스피200"], [/S&P|에스앤피|S&amp;P/i, "S&P500", "S&P500"], [/나스닥|NASDAQ/i, "NASDAQ100", "나스닥100"], [/니케이|닛케이|NIKKEI|일본\s*증시/i, "NIKKEI225", "니케이225"], [/항셍|HSCEI|홍콩/i, "HSCEI", "항셍중국"], [/유로스톡스|유로스탁스|EuroStoxx|유럽\s*증시/i, "EUROSTOXX50", "유로스탁스50"]];
  function uaHas(ua, keys){ var s = String(ua || "").replace(/\s/g, "").toUpperCase(); return keys.some(function(k){ return s.indexOf(String(k).replace(/\s/g, "").toUpperCase()) >= 0; }); }
  function numCond(t){   // 글 속 「5%」「3년」 — 금리·쿠폰 뜻으로 쓴 것만(「−3%」 같은 등락은 뺌)
    var o = {}, m;
    m = /(?:연|금리|이자|쿠폰|수익률?)\s*(\d+(?:\.\d+)?)\s*%|(\d+(?:\.\d+)?)\s*%\s*(?:짜리|넘는|이상|되는|대|정도)/.exec(t);
    if (m){ var v = +(m[1] || m[2]); if (v > 0 && v <= 30) o.rate = v; }
    m = /(\d+(?:\.\d+)?)\s*(년|개월)\s*(?:짜리|만기|묶|정도|안팎|동안)/.exec(t); if (m) o.yrs = m[2] === "년" ? +m[1] : +m[1] / 12;
    m = /(\d+(?:\.\d+)?)\s*(억|천만|백만)\s*원?/.exec(t.replace(/,/g, "")); if (m) o.amt = +m[1] * {"억": 1e8, "천만": 1e7, "백만": 1e6}[m[2]];
    return o;
  }
  var ASKK = [[0, /금리|채권|국채|이자/], [1, /ELS|ELB|이엘에스|낙인|녹인/i], [2, /들어가|사도|매수|진입|타이밍/], [3, /급락|폭락|팔아|팔까|손절|빠졌|빠져|빠지|떨어/], [4, /요즘|뭐가 좋|업종|테마|센 거|강한/],
    [5, /환율|달러/], [6, /연금|IRP|퇴직/], [7, /목표|모으|노후/], [8, /섞|분산|나눠/], [9, /포트|내 계좌|수익률 괜찮/], [10, /큰손|외국인|기관|고래/], [11, /일정|실적 발표|FOMC|금통위|이번 주/]];
  var CUR = {US: "$", JP: "¥", CN: "위안 ", HK: "HK$"};
  function fmtPx(v, mkt){ if (v == null) return "–"; if (mkt === "KR") return Math.round(v).toLocaleString() + "원"; var s = v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(2); return (mkt === "CN" ? s + "위안" : (CUR[mkt] || "") + s); }
  function code6(sym){ var m = /^(\d{6})\.(KS|KQ)$/.exec(sym); return m ? m[1] : null; }
  var RP = {live: null, kr: null, sh: {}};
  function pxOf(r){
    var c6 = code6(r.sym);
    if (c6) return (RP.live || (RP.live = J("archive/x/live_px.json", 300e3))).then(function(L){ var q = L && L.q && L.q[c6]; return q ? {p: q[0], c: q[1], when: (L.date === today() ? "오늘 " : md(L.date) + " ") + L.t, live: L.date === today()} : null; });
    if (typeof opShard !== "function" || typeof OPD === "undefined") return Promise.resolve(null);
    var sh = opShard(r.sym);
    return (RP.sh[sh] || (RP.sh[sh] = getJSON(OPD + "p/" + sh + ".json").catch(function(){ return {}; }))).then(function(P){
      var a = P && P[r.sym]; if (!a) return null; var s = a[6] || [], n = s.length;
      return {p: a[1], c: n >= 2 && s[n - 2] > 0 ? (s[n - 1] / s[n - 2] - 1) * 100 : null, when: md(a[0]) + " 마감"}; });
  }
  function myElsUa(D){
    var my = ls("elsmy"); if (!Array.isArray(my) || !my.length) return [];
    var A = (D.e && D.e.items) || [], P = (D.p && D.p.els) || [];
    return my.map(function(m){ var x = null, i; for (i = 0; i < A.length; i++) if (A[i].id === m.id){ x = A[i]; break; }
      if (!x) for (i = 0; i < P.length; i++) if (P[i].isin === m.id){ x = P[i]; break; }
      return x ? {nm: m.nm, ua: x.ua} : null; }).filter(Boolean);
  }
  function rpBuild(t, D){
    var u = U(), td = today(), st = findStocks(t), R = {t: t.length, st: st, idx: [], els: [], my: [], cond: null, ask: []};
    IDXW.forEach(function(w){ if (w[0].test(t)) R.idx.push(w); });
    var open = ((D.e && D.e.items) || []).filter(function(x){ return x.e && x.e >= td && x.cpn > 0 && x.pv !== true; }), mine = myElsUa(D);
    st.forEach(function(s){ var keys = [s.r.name].concat((s.r.altRaw || []).filter(function(a){ return a.length >= 3; }));
      var L = open.filter(function(x){ return uaHas(x.ua, keys); }), M = mine.filter(function(x){ return uaHas(x.ua, keys); });
      if (L.length || M.length) R.els.push({nm: s.r.name, L: L, M: M}); });
    R.idx.forEach(function(w){ var L = open.filter(function(x){ return uaHas(x.ua, [w[1], w[1].replace(/\d+$/, "")]); }), M = mine.filter(function(x){ return uaHas(x.ua, [w[1]]); });
      if (L.length || M.length) R.els.push({nm: w[2] + "(지수)", L: L, M: M}); });
    var o = numCond(t);
    if (o.rate != null || o.yrs != null){ var P = u.pick(D, o); R.cond = {o: o, top: [P.bond[0], P.els[0], P.fund[0]].filter(Boolean), n: P.bond.length + P.els.length + P.fund.length}; }
    var AL = (window.__gsAsk && __gsAsk.list) || [];
    ASKK.forEach(function(a){ if (R.ask.length < 3 && a[1].test(t) && AL[a[0]]) R.ask.push(a[0]); });
    if (R.els.length && R.ask.indexOf(1) < 0 && R.ask.length < 3) R.ask.push(1);
    return R;
  }
  function elsLine(g){
    var S = g.L.filter(function(x){ return !(x.kind === "ELB" || x.nolos); }), B = g.L.length - S.length;
    var cp = S.map(function(x){ return x.cpn; }), ki = S.map(function(x){ return x.ki; }).filter(function(v){ return v > 0; }), lo = Math.min.apply(null, cp), hi = Math.max.apply(null, cp);
    var sub = [];
    if (S.length) sub.push("ELS " + S.length + " — 조건 맞으면 연 " + (lo === hi ? pc(lo, 1) : pc(lo, 1) + "~" + pc(hi, 1)) + (ki.length ? " · 낙인(KI) " + Math.min.apply(null, ki) + "~" + Math.max.apply(null, ki) : ""));
    if (B) sub.push("ELB(원금 지급) " + B);
    if (g.M.length) sub.push("📌 내 ELS " + g.M.length + "개도 이 기초자산");
    return {left: g.nm + " 기초", right: g.L.length ? "청약 중 " + g.L.length + "개" : "청약 중 없음", sub: sub.join(" · ")};
  }
  var RPC = null;
  function rpHTML(R, PX, MK){
    var u = U(), h = '<div class="rp-hd">📨 <b>답장 한 장</b><small>받은 글 ' + R.t + '자 — 이 화면 안에서만 읽고 저장·전송 안 함 · 한 장엔 원문을 싣지 않음</small></div>';
    if (MK) h += '<div class="rp-mk">' + e(MK) + '</div>';
    if (R.st.length){
      h += '<div class="rp-sec"><small>📈 글에 나온 종목 ' + R.st.length + '</small>' + R.st.map(function(s, i){ var p = PX[i];
        return '<button type="button" class="rp-st" data-rps="' + e(s.r.sym) + '"><span>' + ((window.FLAG || {})[s.r.mkt] || "") + ' <b>' + e(s.r.name) + '</b>' + (s.w !== s.r.name ? '<em>「' + e(s.w) + '」</em>' : '') + '</span>' +
          (p ? '<b class="' + (p.c > 0 ? "up" : p.c < 0 ? "dn" : "") + '">' + e(fmtPx(p.p, s.r.mkt)) + ' ' + (p.c == null ? "" : sg(p.c, 2) + "%") + '<small>' + e(p.when) + '</small></b>' : '<b><small>시세 자료 없음</small></b>') + '</button>'; }).join("") +
        '<p class="rp-n">이름이 둘 이상 겹치거나 다른 종목이면 위 검색 칸을 지우고 정확한 이름으로 찾아 주세요 · 누르면 종목 화면</p></div>';
    }
    if (R.els.length) h += '<div class="rp-sec"><small>🎯 이 종목·지수가 기초자산인 ELS</small>' + R.els.map(function(g){ var l = elsLine(g); return '<div class="rp-el"><span><b>' + e(l.left) + '</b><em>' + e(l.sub) + '</em></span><b>' + e(l.right) + '</b></div>'; }).join("") + '<button type="button" class="ns-go" data-rpj="els">🎯 ELS 탭에서 보기 ›</button></div>';
    if (R.cond && R.cond.top.length) h += '<div class="rp-sec"><small>🔢 글 속 조건 「' + e(u.title(R.cond.o)) + '」 — 위험 낮은 것부터</small><div class="ns-top">' + R.cond.top.map(function(x){ var T = u.rowTxt(x, R.cond.o); return '<div class="ns-c"><small>' + T.h + '</small><b class="ns-big">' + e(T.big) + '</b><span class="ns-nm">' + e(T.nm) + '</span><em>' + e(T.sub) + '</em><i>' + e(T.mean) + '</i></div>'; }).join("") + '</div></div>';
    if (R.ask.length){ var AL = __gsAsk.list; h += '<div class="rp-sec"><small>💬 답이 될 카드</small>' + R.ask.map(function(i){ return AL[i][1].slice(0, 2).map(function(d, j){ return '<button type="button" class="rp-ask" data-rpa="' + i + '_' + j + '">' + e(AL[i][0]) + ' → ' + e(d[0]) + '</button>'; }).join(""); }).join("") + '</div>'; }
    var any = R.st.length || R.els.length || (R.cond && R.cond.top.length);
    h += any ? '<div class="ns-act"><button type="button" class="rp-big">📲 크게 보기 · 한 장</button></div>' : '<div class="gs-hint">글에서 종목·지수·조건(예: 「연 5%」「3년짜리」)을 못 찾았어요. 종목은 정확한 이름(예: SK하이닉스)이면 찾아요.</div>';
    return h + '<p class="ns-n">참고용 · 투자 권유 아님 · 숫자는 앱이 받는 시세(국내 10분)·미래에셋 판매 목록·DART 청약 공시 그대로</p>';
  }
  function rpSheet(R, PX, MK){
    var u = U(), cards = [];
    if (R.st.length) cards.push({t: "l", k: "st", h: "📈 말씀하신 종목 · 지금", lines: R.st.slice(0, 6).map(function(s, i){ var p = PX[i]; return [s.r.name, p ? fmtPx(p.p, s.r.mkt) + " " + (p.c == null ? "" : sg(p.c, 2) + "%") : "자료 없음", p && p.c > 0 ? "up" : p && p.c < 0 ? "dn" : ""]; }),
      note: (PX.filter(Boolean)[0] || {}).when ? "기준 " + PX.filter(Boolean)[0].when + " · 국내 10분 시세 · 해외는 최근 마감" : ""});
    if (R.els.length) cards.push({t: "l", k: "els", h: "🎯 이 기초자산으로 지금 청약 중인 ELS", lines: R.els.slice(0, 4).map(function(g){ var l = elsLine(g); return [l.left, l.right, ""]; }), note: "조건 맞으면 받는 쿠폰 · 못 맞추면 원금 손실 가능(ELB 는 원금 지급)"});
    if (R.cond) R.cond.top.slice(0, cards.length >= 2 ? 1 : 2).forEach(function(x){ var T = u.rowTxt(x, R.cond.o); cards.push({t: "p", k: x.k, h: T.h, big: T.big, nm: T.nm, sub: T.sub, mean: T.mean}); });
    bigOpen({title: "말씀하신 것, 지금 숫자로", sub: MK || "", cards: cards, fn: "답장"});
  }
  function mkLine(){
    return J("archive/x/live_kr.json", 300e3).then(function(K){
      if (!K || !Array.isArray(K.index)) return "";
      var k = K.index.filter(function(x){ return x.name === "코스피"; })[0]; if (!k) return "";
      var on = K.date === today(), up = +K.up, tot = +K.total;
      return (on ? "오늘 " + K.t : md(K.date) + " 마감") + " 코스피 " + Math.round(k.last).toLocaleString() + " " + sg(k.chg, 2) + "%" + (tot ? " · 오른 종목 " + Math.round(up / tot * 100) + "%" : "");
    }).catch(function(){ return ""; });
  }
  function isLong(q){ return q.length >= 20 && (q.match(/\s+/g) || []).length >= 3 && !(U() && U().parse(q)); }
  function rpHook(){
    var o = document.getElementById("gsq"); if (!o || o.dataset.rp) return;
    var inp = document.getElementById("gsin"), res = document.getElementById("gsres"); if (!inp || !res) return; o.dataset.rp = "1";
    var box = document.createElement("div"); box.id = "gsreply"; res.parentNode.insertBefore(box, res);
    var tip = document.createElement("div"); tip.id = "gsrptip"; tip.innerHTML = '<button type="button" class="rp-paste">📋 카톡으로 받은 글 붙여넣기 → 답장 한 장</button>';
    var ask = document.getElementById("gsask"); if (ask) ask.parentNode.insertBefore(tip, ask); else res.parentNode.insertBefore(tip, res);
    var seq = 0;
    function draw(){
      var q = inp.value.trim(), long = isLong(q), num = document.getElementById("gsnum");
      tip.style.display = q ? "none" : "";
      if (!long){ box.innerHTML = ""; box.style.display = "none"; return; }
      res.style.display = "none"; if (num) num.style.display = "none"; if (ask) ask.style.display = "none"; box.style.display = "";
      var my = ++seq; box.innerHTML = '<div class="gs-hint">받은 글에서 종목·상품·숫자 찾는 중…</div>';
      Promise.all([U().nsData(), window.opLoadIdx ? opLoadIdx().catch(function(){}) : null, mkLine()]).then(function(r){
        if (my !== seq) return; var R = rpBuild(q, r[0]), MK = r[2];
        return Promise.all(R.st.map(function(s){ return pxOf(s.r).catch(function(){ return null; }); })).then(function(PX){
          if (my !== seq) return; RPC = {R: R, PX: PX, MK: MK}; box.innerHTML = rpHTML(R, PX, MK);
          try { if (window.ntfyUse) ntfyUse("reply_build"); } catch(z) {} });
      }).catch(function(x){ console.warn(x); if (my === seq) box.innerHTML = '<div class="gs-hint">자료를 못 불러왔어요. 잠시 뒤 다시.</div>'; });
    }
    inp.addEventListener("input", function(){ var n = document.getElementById("gsnum"); if (n && !isLong(inp.value.trim())) n.style.display = ""; draw(); });
    inp.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && isLong(inp.value.trim())){ ev.stopImmediatePropagation(); ev.preventDefault(); inp.blur(); } }, true);
    tip.onclick = function(ev){ ev.stopPropagation();
      var put = function(s){ inp.value = String(s || "").replace(/\s+/g, " ").trim(); inp.dispatchEvent(new Event("input")); draw(); };
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(put).catch(function(){ inp.focus(); tip.innerHTML = '<p class="rp-n">검색 칸을 길게 눌러 「붙여넣기」 해 주세요 — 두 줄 넘는 글이면 답장 한 장이 만들어져요.</p>'; });
      else { inp.focus(); tip.innerHTML = '<p class="rp-n">검색 칸을 길게 눌러 「붙여넣기」 해 주세요.</p>'; } };
    box.addEventListener("click", function(ev){
      var t = ev.target.closest && ev.target.closest("button"); if (!t) return; ev.stopPropagation();
      if (t.dataset.rps){ var g = document.getElementById("gsq"); if (g) g.remove(); document.body.classList.remove("gs-open"); if (window.openOP) openOP(t.dataset.rps); return; }
      if (t.dataset.rpa){ var q = t.dataset.rpa.split("_"), d = __gsAsk.list[+q[0]][1][+q[1]]; __gsAsk.jump(d[1], d[2]); return; }
      if (t.dataset.rpj){ __gsAsk.jump(t.dataset.rpj, "#pdbody"); return; }
      if (t.classList.contains("rp-big") && RPC){ rpSheet(RPC.R, RPC.PX, RPC.MK); return; }
    });
    draw();
  }

  window.__u1105b = {findStocks: findStocks, numCond: numCond, rpBuild: rpBuild, ymPoints: ymPoints, G: G, YM: YM, sendImg: sendImg};   // 검사용

  var T = null;
  function tick(){ T = null; try { ymMount(); } catch(x) { console.warn(x); } try { rpHook(); } catch(x) { console.warn(x); } }
  function soon(){ if (!T) T = setTimeout(tick, 150); }
  var css = document.createElement("style");
  css.textContent =
    ".ym4{padding-bottom:10px}.ym-hd{display:flex;align-items:center;justify-content:space-between;cursor:pointer}.ym-hd h3{margin:0;font-size:16px}.ym-hd h3 small{font-weight:500;color:var(--sub);font-size:12.5px;margin-left:4px}.ym-tg{font-size:13px;color:var(--sub)}" +
    ".ym-sub{font-size:12.5px;color:var(--sub);margin:4px 0 6px;word-break:keep-all}.ym-kd,.ym-ps{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}" +
    ".ym-kd{flex-wrap:nowrap;overflow-x:auto}.ym-kd button,.ym-ps button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:99px;padding:6px 9px;font:inherit;font-size:13px;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;gap:5px}" +
    ".ym-kd button:not(.on){opacity:.45}.ym-kd i{box-sizing:border-box;width:10px;height:10px;border-radius:50%;display:inline-block}.ym-ps button{border-style:dashed}" +
    ".ym-cv{margin:6px 0 2px;touch-action:pan-y;user-select:none;-webkit-user-select:none}#ymsvg{display:block;touch-action:pan-y}" +
    ".ym-gl{stroke:var(--line);stroke-width:1}.ym-v{stroke-dasharray:2 3}.ym-tx{fill:var(--sub);font-size:10.5px}.ym-fb{fill:var(--panel2);stroke:var(--line)}.ym-ov{fill:var(--sub);font-size:8px}" +
    ".ym-p{opacity:.85}.ym-p.off{opacity:.18}.ym-p.on{opacity:1}.ym-box{fill:rgba(124,156,255,.14);stroke:#7c9cff;stroke-width:1.5;stroke-dasharray:4 3}.ym-tap{fill:none;stroke:var(--text);stroke-width:2}" +
    ".ym-hint{font-size:12.5px;color:var(--sub);margin:8px 2px;word-break:keep-all}.ym-hint b{color:var(--text)}" +
    ".ym-sh{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;margin:8px 2px 4px;font-size:13.5px}.ym-sh b{flex:1 1 100%;word-break:keep-all}.ym-sh small{color:var(--sub);font-size:12.5px;flex:1}" +
    ".ym-clr{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:4px 10px;font:inherit;font-size:12.5px}" +
    "#ymap .ns-top{padding:4px 0}#ymap .ns-act{padding:6px 0}#ymap .ns-more{margin:4px 0}" +
    ".ym-one{border:1px solid var(--line);border-radius:12px;padding:9px 11px;background:var(--panel2);margin-top:8px}.ym-one small{font-size:12px;color:var(--sub);font-weight:700}.ym-one b{display:block;font-size:19px;font-variant-numeric:tabular-nums}" +
    ".ym-one span{display:block;font-size:13.5px;font-weight:700;word-break:keep-all}.ym-one em,.ym-one i{display:block;font-style:normal;font-size:12px;color:var(--sub);word-break:keep-all}.ym-one i{color:#d99a2b}" +
    ".ym-go{margin-top:8px;width:100%;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px;font:inherit;font-size:13.5px;font-weight:700}" +
    ".ym-n{font-size:11.5px;color:var(--sub);line-height:1.5;margin:8px 2px 0;word-break:keep-all}" +
    "#gsrptip{padding:8px 10px 0}.rp-paste{width:100%;border:1px dashed var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}" +
    "#gsreply{max-height:72vh;overflow-y:auto}.rp-hd{padding:10px 12px 4px;font-size:15px}.rp-hd small{display:block;color:var(--sub);font-size:12px;margin-top:2px;word-break:keep-all}" +
    ".rp-mk{margin:4px 10px;padding:8px 10px;border-radius:10px;background:var(--panel2);font-size:13.5px;font-weight:700;font-variant-numeric:tabular-nums}" +
    ".rp-sec{margin:8px 10px;border:1px solid var(--line);border-radius:12px;padding:8px 10px}.rp-sec>small{display:block;font-size:12.5px;font-weight:800;color:var(--sub);margin-bottom:4px}" +
    ".rp-st{display:flex;width:100%;align-items:center;gap:8px;justify-content:space-between;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--text);padding:8px 0;font:inherit;font-size:14px;cursor:pointer}.rp-st:first-of-type{border-top:0}" +
    ".rp-st span{min-width:0;word-break:keep-all}.rp-st em{font-style:normal;color:var(--sub);font-size:12px;margin-left:4px}.rp-st>b{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.rp-st>b small{display:block;font-weight:500;color:var(--sub);font-size:11.5px}" +
    ".rp-st b.up{color:var(--up)}.rp-st b.dn{color:var(--down)}.rp-n{font-size:11.5px;color:var(--sub);margin:4px 0 0;line-height:1.45;word-break:keep-all}" +
    ".rp-el{display:flex;gap:8px;justify-content:space-between;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line);font-size:13.5px}.rp-el:first-of-type{border-top:0}.rp-el span{min-width:0}.rp-el em{display:block;font-style:normal;color:var(--sub);font-size:12px;word-break:keep-all}.rp-el>b{white-space:nowrap}" +
    ".rp-sec .ns-top{padding:4px 0}.rp-ask{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:8px 10px;margin:5px 0;font:inherit;font-size:13.5px;cursor:pointer;word-break:keep-all}" +
    ".yb-l .yb-li{display:flex;justify-content:space-between;gap:10px;font-size:18px;padding:5px 0;border-top:1px solid var(--line)}.yb-l .yb-li:first-of-type{border-top:0}.yb-l .yb-li span{min-width:0;word-break:keep-all}.yb-l .yb-li b{display:inline;font-size:18px;margin:0;white-space:nowrap}";
  document.head.appendChild(css);
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) { setInterval(tick, 1500); }
  soon();
})();
