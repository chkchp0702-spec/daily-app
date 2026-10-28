/* 📨 고객에게 보내기 — 한 장 (10/28 사용자 「동료 PB」 ②)
   🏠 오늘·🌐 시황 → 오늘 시장 한 장 · 💼 포트 → 오늘의 자산배분 한 장 · 🏦 채권·🎯 ELS·📦 펀드 → 펼친 상품 한 장.
   화면 캡처가 아니라 숫자만 골라 캔버스에 새로 그림(1080×1350 PNG) → 휴대폰 공유창(카톡 등). 사내 사모 라인업(🔒)은 절대 안 들어감.
   PB 이름은 휴대폰에만(pbname). 모든 장에 「참고용 · 과거 성과는 미래를 보장하지 않음」 문구. */
(function(){
  var TABS = {home: "시장", market: "시장", port: "포트", bond: "상품", els: "상품", fund: "상품"};
  var RAWM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/";
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function strip(t){ return String(t || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function md(s){ return s ? String(s).slice(5, 10).replace("-", "/") : ""; }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 600000}) : fetch(u).then(function(r){ return r.json(); })).catch(function(){ return null; }); }
  function pbname(){ var n = ls("pbname"); if (n) return n; n = prompt("한 장 아래에 넣을 이름 (예: 홍길동 PB · 비워도 돼요)", "") || ""; ls("pbname", n.trim().slice(0, 30)); return ls("pbname") || ""; }
  function pct(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0] : null; }

  // ---------- 내용 만들기 ----------
  function mkMarket(){
    // 10/28: 👔 PB 한 장(pbbrief.json, 장중 매시간)이 오늘 것이면 그걸로 「지금 시장 한 장」 · 아니면 아침 리포트 5줄
    var pb = window.__pbbrief ? __pbbrief() : Promise.resolve(null);
    return pb.then(function(j){
      if (j && j.asof && j.asof.slice(0, 10) === kst().toISOString().slice(0, 10) && (j.talk || []).length){
        var rows = (j.talk || []).slice(0, 4).map(function(l){ return {t: l}; });
        if (j.events && j.events.length) rows.push({t: "오늘: " + j.events.join(" · "), small: true});
        return {title: j.mode === "장중" ? "지금 시장 한 장" : "오늘 시장 한 장", sub: (j.label || "") + (j.regime ? " · " + j.regime : ""), rows: rows, note: j.mode === "장중" ? "장중 시세는 10~15분 늦을 수 있음" : null};
      }
      var it = latest("market"); if (!it) return null;
      return gj(file("market", it.id, "data.json")).then(function(d){
        if (!d) return null;
        var lines = ((d.kakao || {}).lines || (d.summary || {}).three_lines || []).map(strip).filter(Boolean).slice(0, 5);
        return {title: "오늘 시장 한 장", sub: md(d.date) + " 아침 · " + strip(d.one_liner).slice(0, 60), rows: lines.map(function(l){ return {t: l}; })};
      });
    });
  }
  function mkPort(){
    var it = latest("market");
    return Promise.all([gj(RAWM + "ledger/ledger.json"), gj(RAWM + "market/home.json"), it ? gj(file("market", it.id, "data.json")) : null]).then(function(r){
      var L = r[0], H = r[1], D = r[2] || {};
      var al = (L && L.allocation || []).filter(function(a){ return a.pct > 0; });
      if (!al.length){   // 원격이 막히면 리포트의 배분 판정(allocation_seen)에서 비중을 읽음
        var NM = ["S&P500 코어", "나스닥100 코어", "금", "현금·단기채"], IN = ["TIGER 미국S&P500 360750", "TIGER 미국나스닥100 133690", "TIGER KRX금현물 0072R0", "TIGER CD금리 499660"];
        (D.allocation_seen || []).forEach(function(a, i){ var m = /([\d.]+)/.exec(a.verdict || ""); if (m && +m[1] > 0) al.push({name: NM[i] || "", pct: +m[1], instruments: IN[i] || ""}); });
      }
      if (!al.length) return null;
      var P = (H && H.port) || {};
      var rows = [{t: "국면: " + (D.decision && D.decision.badges ? strip(D.decision.badges[0]) : "—")}];
      al.forEach(function(a){ rows.push({t: a.name, v: a.pct + "%", bar: a.pct, s: strip(a.instruments).split("/")[0].trim()}); });
      if (P.start) rows.push({t: md(P.start) + "부터 성과: 이 배분 " + pct(P.base) + " · S&P500 " + pct(P.spy), small: true});
      return {title: "오늘의 자산배분 제안", sub: (P.asof ? md(P.asof) + " 기준 · " : (D.date ? md(D.date) + " · " : "")) + "지수 ETF 뼈대 · 레버리지 없음", rows: rows, note: "시장 국면(S&P500 200일선)에 따라 비중이 바뀌는 규칙 · 개별 종목 추천 아님"};
    });
  }
  function selected(){
    var row = document.querySelector("#pdroot .pd-tap.on"); if (!row || !window.__pdObj) return null;
    var R = __pdObj(row.dataset.x); return R && R.o ? R : null;
  }
  function yrs(mat){ var t = (new Date(mat + "T00:00:00Z") - kst()) / 365.25 / 864e5; return t > 0 ? t : 0; }
  function mkProduct(R){
    var k = R.k, o = R.o;
    if (k === "pv" || k === "pvl" || (o && o.pv === true)) return Promise.resolve({refuse: "사내 사모 라인업은 고객용 한 장에 넣지 않아요"});
    if (k === "krw"){
      var y = yrs(o.mat), rows = [{t: "종류", v: o.kind + (o.risk ? " · " + o.risk : "")}, {t: "만기", v: o.mat + " (" + (y < 1 ? Math.round(y * 12) + "개월" : y.toFixed(1) + "년") + ")"},
        {t: "세후 수익률 (연)", v: o.after != null ? o.after.toFixed(2) + "%" : "–", big: true}, {t: "세전 수익률", v: o.buy != null ? o.buy.toFixed(2) + "%" : "–"},
        {t: "표면금리 · 이자", v: (o.cpn != null ? o.cpn + "%" : "–") + (o.freq ? " · " + o.freq + "개월마다" : "")}];
      if (o.after != null && y > 0) rows.push({t: "1,000만원이면 만기까지 세후 이자 대략", v: Math.round(1000 * o.after / 100 * y) + "만원", small: true});
      return Promise.resolve({title: o.name, sub: "원화 채권 · " + (o.redeem || "만기일시상환"), rows: rows, note: "세후 수익률은 매수 시점 가격 기준 · 중도 매도 시 가격 변동"});
    }
    if (k === "ust" || k === "aud" || k === "brl"){
      var y2 = yrs(o.mat);
      return Promise.resolve({title: o.name, sub: (o.kind || "해외 국채") + " · " + (o.cur || ""), rows: [{t: "만기", v: o.mat + " (" + y2.toFixed(1) + "년)"}, {t: "만기수익률 (연, " + (o.cur || "") + ")", v: o.ytm != null ? o.ytm + "%" : "–", big: true}, {t: "표면금리", v: o.cpn != null ? o.cpn + "%" : "–"}, {t: "환율", v: "원화 환산 수익은 환율에 따라 달라져요", small: true}]});
    }
    if (k === "els"){
      var rows2 = [{t: "기초자산", v: o.ua}, {t: "구조", v: o.desc, small: true}, {t: "연 수익률 (조건 충족 시)", v: o.cpn != null ? o.cpn + "%" : "–", big: true},
        {t: "낙인(KI)", v: o.ki != null ? o.ki + "%" : (o.pp >= 100 ? "원금지급형" : "없음")}, {t: "만기 · 평가 주기", v: (o.mat || "") + " · " + (o.cyc || "")}, {t: "청약 마감", v: o.e || "–"}];
      return gj("archive/x/els_replay.json").then(function(Rp){
        var key = Rp && Rp.by_id && Rp.by_id[o.isin], st = key && Rp.stats && Rp.stats[key];
        if (st && st.n){ rows2.push({t: "과거 재생 " + (st.from || "") + "~ 매일 가입했다면 (" + st.n + "번)", v: "1차 상환 " + Math.round(st.k[0]) + "% · 손실 " + (st.loss != null ? st.loss.toFixed(1) : "–") + "%", small: true}); }
        return {title: o.n, sub: (o.t || "ELS") + " · " + (o.kind || ""), rows: rows2, note: "과거 계산은 미래를 보장하지 않음 · 조건 미충족 시 원금 손실 가능"};
      });
    }
    if (k === "fund" || k === "pub"){
      return Promise.resolve({title: o.n, sub: (o.co || "") + " · " + (o.t || "") + (o.st ? " · " + o.st : "") + (o.rk ? " · 위험 " + o.rk + "등급" : ""),
        rows: [{t: "1개월", v: pct(o.m1)}, {t: "3개월", v: pct(o.m3)}, {t: "6개월", v: pct(o.m6)}, {t: "1년", v: pct(o.y1), big: true}, {t: "3년", v: pct(o.y3)}, {t: "총보수", v: o.fee != null ? o.fee + "%" + (o.sfee ? " (선취 " + o.sfee + "%)" : "") : "–", small: true}],
        note: "기준일 " + (o.d ? String(o.d).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3") : "") + " · 수익률은 보수 차감 후 · 과거 성과는 미래를 보장하지 않음"});
    }
    return Promise.resolve(null);
  }

  // ---------- 그리기 ----------
  function wrap(g, text, x, y, w, lh, max){
    var out = [], line = "", words = String(text).split(""), n = 0;
    for (var i = 0; i < words.length; i++){ var t = line + words[i]; if (g.measureText(t).width > w && line){ out.push(line); line = words[i]; } else line = t; }
    if (line) out.push(line);
    out = out.slice(0, max || 3);
    out.forEach(function(l, i){ g.fillText(l, x, y + i * lh); });
    return out.length * lh;
  }
  function draw(C, name){
    var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    var g = c.getContext("2d"), F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
    g.fillStyle = "#f6f3ee"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#1e2a44"; g.fillRect(0, 0, W, 150);
    g.fillStyle = "#fff"; g.font = "800 40px " + F; g.fillText("CH Investing", 56, 78);
    g.font = "500 26px " + F; g.fillStyle = "#c8d2ea"; var d = kst(); g.fillText((d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 · " + (TABS[cur()] || "") + " 한 장", 56, 118);
    var y = 230; g.fillStyle = "#1a1a1a"; g.font = "800 50px " + F; y += wrap(g, C.title, 56, y, W - 112, 62, 2);
    if (C.sub){ g.fillStyle = "#6b6b6b"; g.font = "500 28px " + F; y += wrap(g, C.sub, 56, y + 4, W - 112, 38, 2) + 10; }
    y += 24;
    function rr(x, y0, w, h){ g.beginPath(); if (g.roundRect) g.roundRect(x, y0, w, h, 18); else g.rect(x, y0, w, h); g.fill(); }
    (C.rows || []).forEach(function(r){
      if (y > H - 260) return;
      var big = r.big, small = r.small;
      if (r.v != null){
        g.font = (small ? "500 26px " : "600 30px ") + F; var tw = g.measureText(r.t).width;
        g.font = (big ? "800 56px " : small ? "700 30px " : "800 36px ") + F; var vw = g.measureText(r.v).width;
        var twoLine = tw + vw > W - 200, lh = big ? 76 : small ? 44 : 56, h = lh + (twoLine ? (small ? 34 : 40) : 0) + (r.s ? 30 : 0) + (r.bar != null ? 16 : 0);
        g.fillStyle = "#ffffff"; rr(56, y, W - 112, h);
        g.fillStyle = small ? "#555" : "#333"; g.font = (small ? "500 26px " : "600 30px ") + F; g.fillText(r.t, 80, y + (big ? 48 : 38));
        g.fillStyle = big ? "#c0392b" : "#1a1a1a"; g.font = (big ? "800 56px " : small ? "700 30px " : "800 36px ") + F;
        if (twoLine){ g.font = (small ? "700 28px " : "700 32px ") + F; g.fillText(r.v.length > 60 ? r.v.slice(0, 60) + "…" : r.v, 80, y + lh + (small ? 20 : 24)); }
        else { g.textAlign = "right"; g.fillText(r.v, W - 80, y + (big ? 52 : 40)); g.textAlign = "left"; }
        var yy = y + lh + (twoLine ? (small ? 34 : 40) : 0);
        if (r.s){ g.fillStyle = "#777"; g.font = "500 24px " + F; g.fillText(r.s, 80, yy + 18); yy += 30; }
        if (r.bar != null){ g.fillStyle = "#e3e8f2"; g.fillRect(80, yy + 2, W - 160, 8); g.fillStyle = "#3b5bdb"; g.fillRect(80, yy + 2, (W - 160) * Math.min(1, r.bar / 100), 8); }
        y += h + 14;
      } else {
        g.fillStyle = "#222"; g.font = (small ? "500 28px " : "600 32px ") + F;
        var hh = wrap(g, "· " + r.t, 64, y + 30, W - 128, small ? 38 : 44, 3);
        y += hh + 30;
      }
    });
    if (C.note){ g.fillStyle = "#777"; g.font = "500 24px " + F; wrap(g, "※ " + C.note, 56, Math.max(y + 10, H - 230), W - 112, 32, 2); }
    g.fillStyle = "#1e2a44"; g.fillRect(0, H - 150, W, 150);
    g.fillStyle = "#fff"; g.font = "700 30px " + F; g.fillText(name ? name : "CH Investing", 56, H - 92);
    g.fillStyle = "#c8d2ea"; g.font = "500 22px " + F; g.fillText("참고용 자료 · 과거 성과는 미래 수익을 보장하지 않습니다 · 투자 판단과 책임은 본인에게 있습니다", 56, H - 48);
    return c;
  }
  function share(c, title){
    return new Promise(function(res){ c.toBlob(function(b){ res(b); }, "image/png"); }).then(function(b){
      if (!b) throw new Error("blob");
      var f = new File([b], "CH_" + (title || "한장").replace(/[^\w가-힣]+/g, "_").slice(0, 30) + "_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", {type: "image/png"});
      if (navigator.canShare && navigator.canShare({files: [f]})) return navigator.share({files: [f], title: title}).catch(function(e){ if (e && e.name !== "AbortError") throw e; });
      var u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = f.name; a.target = "_blank"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 30000);
      toast("그림을 저장했어요 — 사진에서 보내세요");
    });
  }
  function go(R){
    var k = cur(), p = R ? mkProduct(R) : (k === "port" ? mkPort() : (k === "home" || k === "market") ? mkMarket() : null);
    if (!p){ if (TABS[k] === "상품") toast("보낼 상품을 하나 펼친 뒤 눌러 주세요"); else toast("이 화면은 한 장으로 못 만들어요"); return; }
    toast("한 장 만드는 중…");
    p.then(function(C){
      if (!C){ toast("자료를 못 가져왔어요"); return; }
      if (C.refuse){ toast(C.refuse); return; }
      var nm = pbname(); return share(draw(C, nm), C.title);
    }).catch(function(e){ console.warn(e); toast("만들지 못했어요"); });
  }

  // ---------- 단추 ----------
  function fab(){
    var k = cur(), b = document.getElementById("opbtn");
    if (!TABS[k] || document.getElementById("sheet")){ if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement("button"); b.id = "opbtn"; b.type = "button"; b.innerHTML = "📨 <span>고객에게</span>"; b.setAttribute("aria-label", "고객에게 보내기 — 한 장");
    b.onclick = function(ev){ ev.stopPropagation(); go(TABS[k] === "상품" ? selected() : null); };
    document.body.appendChild(b);
  }
  function rowBtns(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot .pd-tap.on > .pd-x:not([data-op1])"), function(p){
      p.setAttribute("data-op1", "1"); var row = p.parentNode, R = __pdObj(row.dataset.x); if (!R || !R.o) return;
      if (R.k === "pv" || R.k === "pvl" || R.o.pv === true) return;
      var b = document.createElement("button"); b.className = "em-add op-row"; b.type = "button"; b.textContent = "📨 이 상품 고객에게 보내기";
      b.onclick = function(ev){ ev.stopPropagation(); go(R); }; p.appendChild(b);
    });
  }
  var css = document.createElement("style");
  css.textContent = "#opbtn{position:fixed;left:16px;bottom:calc(env(safe-area-inset-bottom) + 74px);z-index:80;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:rgba(18,24,38,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--text);font:inherit;font-size:14px;font-weight:800;padding:9px 14px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.45)}" +
    "#opbtn span{font-size:14px}:root[data-ui=light] #opbtn{background:#fff;color:#141a26;border-color:#dde2ea}#opbtn:active{transform:scale(.96)}.op-row{margin-top:8px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { fab(); } catch(x) {} try { rowBtns(); } catch(x) {} }, 300); }
  try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
  window.addEventListener("hashchange", soon);
  window.__onepage = {go: go, draw: draw, _mkProduct: mkProduct, _mkPort: mkPort, _mkMarket: mkMarket};
  soon();
})();
