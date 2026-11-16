/* 🧊 11/16 냉정 분석 5차 — 사용자 「1,5 진행하고 8번은 후자만 진행」
   ① 🩻 포트 진단 한 장 (#diag · 한 장 탭 위 작은 탭) — 고객 보유 종목·금액 → 쏠림 · 나라 · 업종 · 배당 · 1년 고점 대비를 그림 한 장(1080px)으로.
      자료: opdata d/(종목) · x/(ETF) · p/(종가) · archive/x/dv(배당 이력, 배당비교와 같은 식). 입력은 이 휴대폰(localStorage dg_rows)에만.
      사실만 적음(「~하세요」 없음 · 투자 권유 아님). 사모·비상장은 「그 밖의 자산」으로 금액만.
   ⑤ 🖼 고객 질문 답 → 그림 한 장 — 「💬 고객이 이렇게 물으면」 답 아래 단추(mine.js data-qimg → __qaImg).
      글이 길어 근거는 꼬리표 + 첫 문장만, 「그래서 이렇게」·「바뀌는 조건」까지. 받는 분 이름 칸.
   ⑧ 🎯 신호 한눈에 (#sigall) — 큰손·컵·갭·오를 확률을 한 화면에 5줄씩. 네 화면은 지우지 않고 「전체 보기」로(nav2.js sigd 묶음 · 위 작은 탭 「‹ 신호」).
   끄기: index.html 📦list 에서 이 줄을 빼고 nav2.js·ux1112b.js 의 11/16 줄을 되돌림 */
(function(){
  var D = document, RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function toast(m){ var d = D.createElement("div"); d.className = "ch-toast"; d.textContent = m; D.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function gj(u, ttl){ return (window.getJSON ? getJSON(u, {ttl: ttl || 600000}) : fetch(u).then(function(r){ if (!r.ok) throw 0; return r.json(); })).catch(function(){ return null; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function won(man){   // 만원 → 「1억 2,500만원」
    man = Math.round(man); if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만원" : " 원"); }
    return man.toLocaleString("ko-KR") + "만원"; }
  function isUS(sym){ return /^[A-Z][A-Z0-9.\-]{0,6}$/.test(sym) && !/\.(KS|KQ|T|SS|SZ|HK)$/.test(sym); }
  function idxMap(){ return (typeof opLoadIdx === "function" ? opLoadIdx() : Promise.resolve([])).then(function(L){ var m = {}; (L || []).forEach(function(r){ m[r.sym] = r; }); return m; }).catch(function(){ return {}; }); }
  function pbname(){ var n = ls("pbname"); if (n != null) return n; n = prompt("한 장 위에 넣을 내 이름 (예: 김OO PB · 비워도 돼요)", "") || ""; ls("pbname", n.trim().slice(0, 30)); return ls("pbname") || ""; }
  function recent(){ try { var a = JSON.parse(ls("op_clients") || "[]"); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 8) : []; } catch(x){ return []; } }
  function saveCl(c){ c = String(c || "").trim(); if (!c) return; var a = recent().filter(function(x){ return x !== c; }); a.unshift(c); ls("op_clients", JSON.stringify(a.slice(0, 8))); }

  /* ═════════ 그림 도구 (1080px · onepage.js 와 같은 색·글꼴) ═════════ */
  var W = 1080, MX = 60, CW = W - MX * 2;
  var INK = "#141414", SUB = "#6a6f7a", MUT = "#9aa0ab", LINE = "#e6e8ec", UP = "#d6453d", DN = "#2f6fdd", ACC = "#1f2d4d", BLUE = "#3182f6", BG = "#f7f7f5", TILE = "#ffffff";
  var F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  var PAL = ["#1f2d4d", "#3b5bdb", "#d9a441", "#4aa37a", "#b0567e", "#8a94a8", "#c9ced8"];
  function font(g, w, s){ g.font = w + " " + s + "px " + F; }
  function rr(g, x, y, w, h, r, fill){ g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }
  function lines(g, text, w, max){   // 낱말(띄어쓰기) 단위로 줄바꿈 — 긴 낱말만 글자 단위
    var out = [], line = "", toks = String(text == null ? "" : text).split(/(\s+)/);
    toks.forEach(function(tk){
      if (!tk) return;
      if (g.measureText(line + tk).width <= w){ line += tk; return; }
      if (/^\s+$/.test(tk)){ if (line){ out.push(line); line = ""; } return; }
      if (line.trim()){ out.push(line.replace(/\s+$/, "")); line = ""; }
      while (g.measureText(tk).width > w){ var i = 1; while (i < tk.length && g.measureText(tk.slice(0, i + 1)).width <= w) i++; out.push(tk.slice(0, i)); tk = tk.slice(i); }
      line = tk; });
    if (line.trim()) out.push(line.replace(/\s+$/, ""));
    if (max && out.length > max){ out = out.slice(0, max); var l = out[max - 1]; while (l.length > 1 && g.measureText(l + "…").width > w) l = l.slice(0, -1); out[max - 1] = l + "…"; }
    return out; }
  function para(g, text, x, y, w, lh, max){ var L = lines(g, text, w, max); L.forEach(function(t, i){ g.fillText(t, x, y + i * lh); }); return L.length * lh; }
  function fit(g, text, w){ var t = String(text); if (g.measureText(t).width <= w) return t; while (t.length > 1 && g.measureText(t + "…").width > w) t = t.slice(0, -1); return t + "…"; }
  function canvas(h){ var c = D.createElement("canvas"); c.width = W; c.height = h; var g = c.getContext("2d"); g.textBaseline = "alphabetic"; g.fillStyle = BG; g.fillRect(0, 0, W, h); return [c, g]; }
  function head(g, client, name){   // 맨 위 한 줄 — 「○○ 고객님께」 · 날짜 · 보내는 사람
    var d = kst(), ds = d.getUTCFullYear() + "년 " + (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + "일월화수목금토"[d.getUTCDay()] + ")";
    var cl = String(client || "").trim(); if (cl) cl = /님$/.test(cl) ? cl : cl + " 고객님";
    if (!cl){ g.fillStyle = MUT; font(g, 600, 24); g.fillText(ds, MX, 70); if (name){ g.textAlign = "right"; g.fillStyle = SUB; font(g, 700, 24); g.fillText(name, W - MX, 70); g.textAlign = "left"; } return 100; }
    g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, cl + "께", CW * 0.55), MX, 72);
    g.textAlign = "right"; g.fillStyle = SUB; font(g, 600, 22); g.fillText(fit(g, ds.replace(/^\d+년 /, "") + (name ? " · " + name + " 드림" : ""), CW * 0.42), W - MX, 70); g.textAlign = "left"; return 104; }
  function foot(c, y, note){   // 내용만큼만 잘라 내고 맨 아래 안내 줄
    var H = Math.max(1350, y + 150), o = canvas(H), g = o[1]; g.drawImage(c, 0, 0, W, y, 0, 0, W, y);
    g.fillStyle = LINE; g.fillRect(MX, H - 104, CW, 2); g.fillStyle = MUT; font(g, 500, 21);
    para(g, (note ? note + " · " : "") + "참고용 자료 · 투자 권유 아님 · 과거 성과는 미래 수익을 보장하지 않아요 · 투자 판단과 책임은 본인에게 있어요", MX, H - 68, CW, 28, 3);
    return o[0]; }
  function sec(g, y, t, sub){ g.fillStyle = INK; font(g, 800, 32); g.fillText(t, MX, y + 34); if (sub){ var w = g.measureText(t).width; g.fillStyle = MUT; font(g, 500, 22); g.fillText(fit(g, sub, CW - w - 20), MX + w + 16, y + 32); } return 56; }
  function toFile(c, fname){ return new Promise(function(ok){ var done = false, end = function(b){ if (done) return; done = true; ok(b ? new File([b], fname, {type: b.type || "image/png"}) : null); };
    setTimeout(function(){ end(null); }, 8000); try { c.toBlob(function(b){ end(b); }, "image/png"); } catch(x){ end(null); } }); }
  function send(c, fname, title){ return toFile(c, fname).then(function(f){ if (!f){ toast("그림을 만들지 못했어요 — 다시 눌러 주세요"); return; }
    if (window.__onepage && __onepage.ready) __onepage.ready([f], title); else { var a = D.createElement("a"); a.href = URL.createObjectURL(f); a.download = fname; a.click(); } }); }

  /* ═════════ ⑤ 고객 질문 답 → 그림 한 장 ═════════ */
  function firstSent(t, lim){   // 첫 문장(들)만 — lim 글자 안에서 문장 끝으로
    t = String(t || "").replace(/\s+/g, " ").trim(); if (t.length <= lim) return t;
    var cut = -1, re = /(요|다|음|함|임)\.(\s|$)|[.!?](\s|$)| — /g, m;
    while ((m = re.exec(t))){ var p = m[0] === " — " ? m.index : m.index + m[0].replace(/\s+$/, "").length; if (p > lim) break; if (p >= 24) cut = p; }
    if (cut > 0) return t.slice(0, cut).trim();
    var s = t.slice(0, lim), sp = s.lastIndexOf(" "); return (sp > lim * 0.6 ? s.slice(0, sp) : s) + "…"; }
  function qaCanvas(x, A, client, name){
    var o = canvas(4200), c = o[0], g = o[1], y = head(g, client, name) + 6;
    // 질문
    rr(g, MX, y, 64, 64, 18, BLUE); g.fillStyle = "#fff"; font(g, 800, 38); g.textAlign = "center"; g.fillText("Q", MX + 32, y + 46); g.textAlign = "left";
    g.fillStyle = INK; font(g, 800, 50); var ql = lines(g, x.q, CW - 84, 3); ql.forEach(function(t, i){ g.fillText(t, MX + 84, y + 50 + i * 62); }); y += Math.max(64, ql.length * 62) + 30;
    // 결론
    font(g, 700, 34); var al = lines(g, x.a, CW - 72, 9), ah = al.length * 50 + 96;
    rr(g, MX, y, CW, ah, 26, ACC); g.fillStyle = "rgba(255,255,255,.66)"; font(g, 700, 22); g.fillText("결론", MX + 36, y + 46);
    g.fillStyle = "#fff"; font(g, 700, 34); al.forEach(function(t, i){ g.fillText(t, MX + 36, y + 94 + i * 50); }); y += ah + 38;
    // 근거
    var P = (x.pts || []).slice(0, 4);
    if (P.length){ y += sec(g, y, "근거 " + P.length + "가지");
      P.forEach(function(p, i){
        font(g, 500, 28); var tl = lines(g, firstSent(p.t, 118), CW - 108, 4), h = 50 + tl.length * 40 + 30;
        rr(g, MX, y, CW, h, 20, TILE);
        rr(g, MX + 24, y + 24, 44, 44, 22, "#eef3ff"); g.fillStyle = BLUE; font(g, 800, 24); g.textAlign = "center"; g.fillText(String(i + 1), MX + 46, y + 55); g.textAlign = "left";
        g.fillStyle = INK; font(g, 800, 28); g.fillText(fit(g, p.k || "", CW - 108), MX + 84, y + 54);
        g.fillStyle = "#3d424d"; font(g, 500, 28); tl.forEach(function(t, k){ g.fillText(t, MX + 84, y + 96 + k * 40); });
        y += h + 12; }); y += 22; }
    // 그래서 이렇게
    var Aa = (x.act || []).slice(0, 3);
    if (Aa.length){ y += sec(g, y, "그래서 이렇게");
      Aa.forEach(function(a){ font(g, 500, 28); var tl = lines(g, a[1], CW - 60, 3), h = 58 + tl.length * 40 + 22;
        rr(g, MX, y, CW, h, 20, "#eef3ff"); g.fillStyle = BLUE; font(g, 800, 26); g.fillText(fit(g, a[0], CW - 60), MX + 30, y + 46);
        g.fillStyle = INK; font(g, 600, 28); tl.forEach(function(t, k){ g.fillText(t, MX + 30, y + 88 + k * 40); }); y += h + 12; }); y += 22; }
    // 바뀌는 조건
    if (x.flip){ font(g, 500, 27); var fl = lines(g, firstSent(x.flip, 130), CW - 60, 4), fh = 62 + fl.length * 38 + 22;
      rr(g, MX, y, CW, fh, 20, "#fff6dd"); g.fillStyle = "#8a5a00"; font(g, 800, 26); g.fillText("이 답이 바뀌는 조건", MX + 30, y + 46);
      g.fillStyle = "#4a3a12"; font(g, 500, 27); fl.forEach(function(t, k){ g.fillText(t, MX + 30, y + 88 + k * 38); }); y += fh + 20; }
    var bs = (A && A.date ? Number(A.date.slice(5, 7)) + "/" + Number(A.date.slice(8)) + " " + (A.edition || "") + " 시황 기준" : "");
    return foot(c, y, bs.trim());
  }
  window.__qaImg = function(x, A){
    var old = D.getElementById("qimgs"); if (old) old.remove();
    var R = recent(), d = D.createElement("div"); d.id = "qimgs"; d.className = "no-clp"; d.setAttribute("data-xc", "1"); d.setAttribute("data-cz", "done");
    d.innerHTML = '<div class="qi-in"><b>🖼 답을 그림 한 장으로</b><p>' + e(x.q) + '</p>' +
      '<label>💌 받는 분 <input id="qicl" maxlength="20" placeholder="고객 이름 (비워도 돼요)" autocomplete="off"></label>' +
      (R.length ? '<div class="qi-rc">' + R.map(function(n){ return '<button type="button" data-qicl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<div class="qi-b"><button type="button" class="qi-x">닫기</button><button type="button" class="qi-go">그림 만들기</button></div></div>';
    D.body.appendChild(d);
    d.addEventListener("click", function(ev){ ev.stopPropagation();
      var t = ev.target; if (t === d || (t.closest && t.closest(".qi-x"))){ d.remove(); return; }
      var r = t.closest && t.closest("[data-qicl]"); if (r){ D.getElementById("qicl").value = r.dataset.qicl; return; }
      if (t.closest && t.closest(".qi-go")){ var cl = D.getElementById("qicl").value.trim().slice(0, 20), nm = pbname(); saveCl(cl); d.remove();
        try { send(qaCanvas(x, A, cl, nm), (cl ? cl + "_" : "") + "질문답_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", "고객 질문 답 한 장"); } catch(z){ console.error(z); toast("그림을 만들지 못했어요"); } }
    });
  };

  /* ═════════ ① 포트 진단 한 장 ═════════ */
  var SECKO = {technology: "IT", it: "IT", financial_services: "금융", financials: "금융", financial: "금융", healthcare: "헬스케어", health_care: "헬스케어", consumer_cyclical: "경기소비재", consumer_discretionary: "경기소비재",
    consumer_defensive: "필수소비재", consumer_staples: "필수소비재", industrials: "산업재", basic_materials: "소재", materials: "소재", energy: "에너지", utilities: "유틸리티", real_estate: "부동산", realestate: "부동산",
    communication_services: "통신·미디어", communication: "통신·미디어" };
  function secKo(k){ var n = String(k || "").toLowerCase().replace(/[\s\-]+/g, "_"); return SECKO[n] || (k ? String(k) : "기타"); }
  var MKN = {KR: "한국", US: "미국", JP: "일본", CN: "중국", HK: "홍콩"};
  function etfRegion(t, mkt){ t = String(t || "");
    if (/미국|S&P|나스닥|NASDAQ|다우|필라델피아|Russell|러셀|U\.S\.|\bUS\b|Treasury|미국채/i.test(t)) return "미국";
    if (/차이나|중국|항셍|CSI|과창판|심천|China|Hang Seng/i.test(t)) return "중국·홍콩";
    if (/일본|닛케이|TOPIX|Japan|Nikkei/i.test(t)) return "일본";
    if (/인도|India|Nifty/i.test(t)) return "인도";
    if (/글로벌|선진국|전세계|World|Global|ACWI|신흥국|Emerging/i.test(t)) return "글로벌";
    if (/유럽|유로|Europe|Euro/i.test(t)) return "유럽";
    return mkt === "HK" || mkt === "CN" ? "중국·홍콩" : (MKN[mkt] || "기타"); }
  function etfClass(t, assets){ t = String(t || "");
    var b = 0; (assets || []).forEach(function(a){ if (/bond|채권/i.test(a.k)) b += +a.w || 0; });
    if (b >= 60 || /채권|국고채|국채|회사채|단기자금|머니마켓|CD금리|KOFR|Treasury|Bond|종합채|통안/i.test(t)) return "채권·현금";
    if (/금현물|골드|Gold|금선물|KRX금/i.test(t)) return "금";
    return "주식"; }
  var DVC = {}, PSC = {};
  function dvOf(sym){ var sh = opShard(sym); if (!DVC[sh]) DVC[sh] = gj("archive/x/dv/" + sh + ".json?d=" + kst().toISOString().slice(0, 10), 3600e3); return DVC[sh].then(function(j){ return (j && j[sym]) || null; }); }
  function pxOf(sym){ var sh = opShard(sym); if (window.OPP && OPP[sh]) return Promise.resolve(OPP[sh][sym] || null); if (!PSC[sh]) PSC[sh] = gj(OPD + "p/" + sh + ".json", 1800e3); return PSC[sh].then(function(j){ return (j && j[sym]) || null; }); }
  function yieldOf(y0, price, rec){   // 배당비교(divc.js)와 같은 식: 지난 1년 지급 합 ÷ 지금 가격 · 이력이 없으면 자료 배당률(15% 넘으면 못 믿어 버림)
    var h = rec && rec.h ? rec.h.slice().sort(function(a, b){ return a[0] < b[0] ? -1 : 1; }) : [];
    if (h.length && price){ var lim = Date.now() - 400 * 864e5, sum = 0; h.forEach(function(x){ if (Date.parse(x[0]) >= lim) sum += +x[1] || 0; }); var yy = sum / price * 100; if (yy >= 0 && yy < 40) return yy; }
    return y0 != null && y0 >= 0 && y0 <= 15 ? y0 : null; }
  function loadOne(row, IX){
    if (row.t !== "s") return Promise.resolve({row: row, name: row.n, cls: row.t === "c" ? "채권·현금" : row.t === "b" ? "채권·현금" : "기타", region: row.t === "o" ? "기타" : "한국", sec: null, y: null, off: null, ok: true, kind: row.t});
    var sym = row.s, r = IX[sym] || {}, etf = !!r.etf;
    return Promise.all([gj(OPD + (etf ? "x/" : "d/") + opFile(sym) + ".json", 3600e3), pxOf(sym), dvOf(sym)]).then(function(z){
      var d = z[0] || {}, p = z[1], price = p ? p[1] : (d.price != null ? d.price : null), o = {row: row, name: r.name || row.n, sym: sym, etf: etf, ok: !!z[0], kind: "s"};
      if (etf){ var t = (r.name || "") + " " + (d.name || "") + " " + (d.index || "") + " " + (d.category || "");
        o.cls = etfClass(t, d.assets); o.region = etfRegion(t, r.mkt);
        o.secs = o.cls === "주식" ? (d.sectors || []).filter(function(s){ return +s.w > 0; }).map(function(s){ return [secKo(s.k), +s.w]; }) : [];
        o.y = yieldOf(d.div_yield != null ? +d.div_yield : null, price, z[2]);
        o.off = d.w52_hi && price ? (price / d.w52_hi - 1) * 100 : null; o.tag = o.cls === "주식" ? "ETF" : "ETF · " + o.cls;
      } else { o.cls = "주식"; o.region = MKN[r.mkt] || "기타"; o.sec = d.sector ? secKo(d.sector) : null; o.tag = d.industry_ko || o.sec || "";
        o.y = yieldOf(d.dividend_yield != null ? d.dividend_yield * 100 : null, price, z[2]);
        o.off = d.week52_high && price ? (price / d.week52_high - 1) * 100 : null; }
      if (o.off != null && (o.off > 0.5 || o.off < -95)) o.off = o.off > 0 ? 0 : null;
      return o; });
  }
  function analyze(rows){
    return idxMap().then(function(IX){ return Promise.all(rows.map(function(r){ return loadOne(r, IX); })); }).then(function(L){
      var tot = 0; L.forEach(function(o){ tot += o.row.a; });
      L.forEach(function(o){ o.w = o.row.a / tot * 100; }); L.sort(function(a, b){ return b.w - a.w; });
      function agg(fn){ var m = {}; L.forEach(function(o){ (fn(o) || []).forEach(function(kv){ m[kv[0]] = (m[kv[0]] || 0) + kv[1]; }); }); return Object.keys(m).map(function(k){ return [k, m[k]]; }).sort(function(a, b){ return b[1] - a[1]; }); }
      var R = {L: L, tot: tot, n: L.length};
      R.cls = agg(function(o){ return [[o.cls, o.w]]; });
      R.eq = 0; L.forEach(function(o){ if (o.cls === "주식") R.eq += o.w; });
      R.region = agg(function(o){ return o.cls === "주식" ? [[o.region, o.w]] : []; });
      R.sec = agg(function(o){ if (o.cls !== "주식") return []; if (o.secs && o.secs.length){ var s = 0; o.secs.forEach(function(x){ s += x[1]; }); return o.secs.map(function(x){ return [x[0], o.w * x[1] / s]; }); } return [[o.sec || "기타", o.w]]; });
      var S = L.filter(function(o){ return o.kind === "s" && !o.etf; });   // 쏠림은 개별 종목 기준(ETF 는 이미 여러 종목)
      R.top1 = S[0] || null; R.top3 = 0; S.slice(0, 3).forEach(function(o){ R.top3 += o.w; });
      var dv = 0, dcov = 0; L.forEach(function(o){ if (o.y != null){ dv += o.row.a * o.y / 100; dcov += o.w; } }); R.div = dv; R.divY = dv / tot * 100; R.divCov = dcov;
      var os = 0, ow = 0, deep = 0; L.forEach(function(o){ if (o.cls === "주식" && o.off != null){ os += o.off * o.w; ow += o.w; if (o.off <= -30) deep++; } }); R.off = ow ? os / ow : null; R.offCov = ow; R.deep = deep;
      R.miss = L.filter(function(o){ return o.kind === "s" && !o.ok; }).map(function(o){ return o.name; });
      R.pts = points(R); return R; });
  }
  function points(R){
    var P = [], t = R.top1, bond = 0, gold = 0; R.cls.forEach(function(c){ if (c[0] === "채권·현금") bond = c[1]; if (c[0] === "금") gold = c[1]; });
    if (t && t.w >= 30) P.push(["쏠림", t.name + " 한 종목이 전체의 " + Math.round(t.w) + "% — 이 종목이 −20% 움직이면 전체가 −" + (t.w * 0.2).toFixed(1) + "% 움직임"]);
    else if (t && R.top3 >= 60) P.push(["쏠림", "큰 종목 3개가 전체의 " + Math.round(R.top3) + "% — 세 종목이 성적을 거의 결정함"]);
    else if (t) P.push(["쏠림", "가장 큰 종목도 " + Math.round(t.w) + "% — 한 종목 쏠림은 크지 않음"]);
    var s = R.sec[0]; if (s && R.eq > 0 && s[0] !== "기타"){ var sp = s[1] / R.eq * 100; if (sp >= 50) P.push(["업종", "주식의 " + Math.round(sp) + "%가 " + s[0] + " 한 업종 — 같이 오르고 같이 빠지는 구조"]); else P.push(["업종", "가장 큰 업종은 " + s[0] + "(주식의 " + Math.round(sp) + "%) — 업종은 나뉘어 있는 편"]); }
    var g = R.region[0]; if (g && R.eq > 0){ var gp = g[1] / R.eq * 100; if (gp >= 80) P.push(["나라", "주식의 " + Math.round(gp) + "%가 " + g[0] + " — " + (g[0] === "한국" ? "원화·한국 시장 한 곳에 묶여 있음" : g[0] === "미국" ? "달러 자산이라 환율도 같이 움직임" : "한 나라에 묶여 있음")]);
      else P.push(["나라", R.region.slice(0, 3).map(function(x){ return x[0] + " " + Math.round(x[1] / R.eq * 100) + "%"; }).join(" · ") + " (주식 안에서)"]); }
    P.push(["완충", bond + gold < 0.5 ? "채권·현금·금이 0% — 주식이 빠질 때 받쳐 줄 칸이 없음" : "채권·현금 " + Math.round(bond) + "%" + (gold >= 0.5 ? " · 금 " + Math.round(gold) + "%" : "") + " — 주식 " + Math.round(R.eq) + "%가 빠질 때 받쳐 주는 몫"]);
    if (R.off != null && R.offCov >= 20) P.push(["지금 위치", "보유 주식은 1년 고점보다 평균 " + sg(R.off, 0) + (R.deep ? " · " + R.deep + "개는 −30% 넘게 내려와 있음" : "")]);
    if (R.divCov >= 20) P.push(["배당", "지난 1년 배당 그대로면 한 해 약 " + won(R.div) + "(세전 · 배당률 " + R.divY.toFixed(1) + "%)" + (R.divY < 1 ? " — 배당보다 값 오르기를 보는 구성" : "")]);
    return P.slice(0, 6); }
  function stack(g, y, title, items, base){   // 가로로 쌓은 막대 + 범례
    g.fillStyle = SUB; font(g, 700, 24); g.fillText(title, MX, y + 24); var x = MX, by = y + 40, tot = 0; items.forEach(function(i){ tot += i[1]; });
    if (!tot) return 0;
    items = items.slice(0, 5).concat(items.length > 5 ? [["그 외", items.slice(5).reduce(function(a, b){ return a + b[1]; }, 0)]] : []);
    g.save(); g.beginPath(); if (g.roundRect) g.roundRect(MX, by, CW, 40, 12); else g.rect(MX, by, CW, 40); g.clip();
    items.forEach(function(i, k){ var w = CW * i[1] / tot; g.fillStyle = PAL[k % PAL.length]; g.fillRect(x, by, w + 1, 40); x += w; }); g.restore();
    var lx = MX, ly = by + 76; font(g, 600, 24);
    items.forEach(function(i, k){ var t = i[0] + " " + Math.round(i[1] / (base || tot) * 100) + "%", w = g.measureText(t).width + 44; if (lx + w > W - MX){ lx = MX; ly += 38; }
      rr(g, lx, ly - 19, 20, 20, 6, PAL[k % PAL.length]); g.fillStyle = INK; font(g, 600, 24); g.fillText(t, lx + 28, ly); lx += w + 14; });
    return ly - y + 30; }
  function diagCanvas(R, client, name){
    var o = canvas(4600), c = o[0], g = o[1], y = head(g, client, name) + 10;
    g.fillStyle = INK; font(g, 800, 54); g.fillText("포트폴리오 진단", MX, y + 50); y += 78;
    g.fillStyle = SUB; font(g, 500, 26); g.fillText("보유 " + R.n + "개 · 총 " + won(R.tot) + " · " + (kst().getUTCMonth() + 1) + "/" + kst().getUTCDate() + " 최근 종가 기준", MX, y + 26); y += 56;
    // 숫자 3칸
    var K = [["가장 큰 종목", R.top1 ? Math.round(R.top1.w) + "%" : "–", R.top1 ? R.top1.name : "개별 종목 없음", R.top1 && R.top1.w >= 30 ? UP : INK],
             ["주식 비중", Math.round(R.eq) + "%", "주식 외 " + Math.round(100 - R.eq) + "%", INK],
             ["한 해 배당(세전)", R.divCov >= 20 ? "약 " + won(R.div).replace(/만원$/, "만") : "–", R.divCov >= 20 ? "배당률 " + R.divY.toFixed(1) + "%" : "자료 부족", INK]];
    var kw = (CW - 28) / 3; K.forEach(function(k, i){ var x = MX + i * (kw + 14); rr(g, x, y, kw, 168, 22, TILE);
      g.fillStyle = SUB; font(g, 600, 22); g.fillText(k[0], x + 22, y + 42);
      g.fillStyle = k[3]; var fs = 50; font(g, 800, fs); while (g.measureText(k[1]).width > kw - 40 && fs > 28){ fs -= 2; font(g, 800, fs); } g.fillText(k[1], x + 22, y + 104);
      g.fillStyle = MUT; font(g, 500, 21); g.fillText(fit(g, k[2], kw - 40), x + 22, y + 142); }); y += 168 + 40;
    // 종목별 비중
    y += sec(g, y, "무엇을 얼마나", "비중 큰 순서 · 오른쪽은 1년 고점 대비");
    var show = R.L.slice(0, 10), mx = show[0].w;
    show.forEach(function(o){
      g.fillStyle = INK; font(g, 700, 28); var nm = fit(g, o.name, 430); g.fillText(nm, MX, y + 30);
      var sub = [o.sym && isUS(o.sym) ? o.sym : "", o.tag || (o.kind === "c" ? "현금·예금" : o.kind === "b" ? "채권" : o.kind === "o" ? "그 밖의 자산" : "")].filter(Boolean).join(" · ");
      g.fillStyle = MUT; font(g, 500, 21); g.fillText(fit(g, sub, 430), MX, y + 60);
      var bx = MX + 450, bw = 300; rr(g, bx, y + 14, bw, 26, 8, "#eceef2"); rr(g, bx, y + 14, Math.max(6, bw * o.w / mx), 26, 8, o.cls === "주식" ? ACC : "#d9a441");
      g.fillStyle = INK; font(g, 800, 28); g.fillText(Math.round(o.w) + "%", bx + bw + 16, y + 38);
      g.textAlign = "right"; g.fillStyle = o.off == null ? MUT : o.off <= -30 ? DN : SUB; font(g, 600, 24); g.fillText(o.off == null ? "–" : o.off > -0.5 ? "고점 근처" : sg(o.off, 0), W - MX, y + 38); g.textAlign = "left";
      g.fillStyle = LINE; g.fillRect(MX, y + 78, CW, 1); y += 84; });
    if (R.L.length > 10){ var rest = 0; R.L.slice(10).forEach(function(o){ rest += o.w; }); g.fillStyle = SUB; font(g, 500, 23); g.fillText("그 외 " + (R.L.length - 10) + "개 · 합쳐서 " + Math.round(rest) + "%", MX, y + 26); y += 44; }
    y += 30;
    // 어디에 · 무엇으로
    y += sec(g, y, "어디에 들어 있나");
    y += stack(g, y, "자산", R.cls) + 8;
    if (R.region.length) y += stack(g, y, "나라 (주식 안에서)", R.region) + 8;
    var S5 = R.sec.filter(function(s){ return s[1] > 0; });
    if (S5.length && !(S5.length === 1 && S5[0][0] === "기타")) y += stack(g, y, "업종 (주식 안에서 · ETF 는 속을 풀어서)", S5) + 8;
    y += 26;
    // 점검
    y += sec(g, y, "눈에 띄는 점");
    R.pts.forEach(function(p){ font(g, 500, 28); var tl = lines(g, p[1], CW - 190, 3), h = Math.max(1, tl.length) * 40 + 40;
      rr(g, MX, y, CW, h, 18, TILE); rr(g, MX + 20, y + 20, 126, 40, 12, "#eef3ff"); g.fillStyle = BLUE; font(g, 800, 22); g.textAlign = "center"; g.fillText(p[0], MX + 83, y + 48); g.textAlign = "left";
      g.fillStyle = INK; font(g, 500, 28); tl.forEach(function(t, k){ g.fillText(t, MX + 166, y + 50 + k * 40); }); y += h + 10; });
    y += 14;
    if (R.vd){ var vl = String(R.vd).split("\n").map(function(t){ return t.replace(/^[^\s가-힣A-Za-z]+\s*/, ""); }); font(g, 500, 25); var all = []; vl.forEach(function(t){ all = all.concat(lines(g, t, CW - 60, 3)); });
      var vh = 64 + all.length * 36 + 22; rr(g, MX, y, CW, vh, 20, "#fff6dd"); g.fillStyle = "#8a5a00"; font(g, 800, 24); g.fillText("참고 · 지금 시장 판정" + (R.vdAsof ? " (" + R.vdAsof + " 종가)" : ""), MX + 30, y + 44);
      g.fillStyle = "#4a3a12"; font(g, 500, 25); all.forEach(function(t, k){ g.fillText(t, MX + 30, y + 84 + k * 36); }); y += vh + 10; }
    return foot(c, y, "입력한 금액과 최근 종가로 어림한 값 · 배당은 지난 1년 지급 기준");
  }

  /* 입력 화면 */
  var ROWS = [], LASTR = null;
  function load(){ try { var a = JSON.parse(ls("dg_rows") || "[]"); ROWS = Array.isArray(a) ? a.filter(function(r){ return r && r.n && r.t; }).slice(0, 40) : []; } catch(x){ ROWS = []; } }
  function save(){ ls("dg_rows", JSON.stringify(ROWS)); }
  function rowsHTML(){
    if (!ROWS.length) return '<p class="dg-e">아직 없어요 — 아래에서 종목을 찾아 넣어 주세요</p>';
    return ROWS.map(function(r, i){ return '<div class="dg-r"><div class="dg-nm"><b>' + e(r.n) + '</b>' + (r.t === "s" ? (isUS(r.s) ? '<small>' + e(r.s) + '</small>' : '') : '<small>' + (r.t === "c" ? "현금·예금" : r.t === "b" ? "채권" : "그 밖의 자산") + '</small>') + '</div>' +
      '<label><input type="text" inputmode="numeric" data-dga="' + i + '" value="' + (r.a ? Number(r.a).toLocaleString("ko-KR") : "") + '" placeholder="금액" aria-label="' + e(r.n) + ' 금액(만원)"><span>만원</span></label><button type="button" data-dgx="' + i + '" aria-label="' + e(r.n) + ' 빼기">✕</button></div>'; }).join(""); }
  function sumLine(){ var t = 0; ROWS.forEach(function(r){ t += +r.a || 0; }); return ROWS.length ? ROWS.length + "개 · 합계 " + won(t) : ""; }
  function diagView(){
    load(); var R = recent();
    return '<div id="dg" data-noemo="1"><section class="card hub-c no-clp" data-cz="done" data-xc="1"><p class="hub-h">포트 진단 한 장</p>' +
      '<p class="hub-p">고객이 가진 종목과 금액을 넣으면 쏠림 · 나라 · 업종 · 배당 · 고점 대비를 그림 한 장으로 만들어요. 넣은 내용은 이 휴대폰에만 남아요.</p>' +
      '<label class="dg-cl">💌 받는 분 <input id="dgcl" maxlength="20" placeholder="고객 이름 (비워도 돼요)" autocomplete="off"></label>' +
      (R.length ? '<div class="qi-rc">' + R.map(function(n){ return '<button type="button" data-dgcl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<div id="dgrows">' + rowsHTML() + '</div><p class="dg-sum" id="dgsum">' + sumLine() + '</p>' +
      '<div class="dg-add"><input id="dgq" placeholder="종목·ETF 찾아 넣기 (예: 삼전, 엔비디아, KODEX 200)" autocomplete="off" enterkeyhint="search" aria-label="종목 찾기"><div id="dgsug"></div></div>' +
      '<div class="dg-ch"><button type="button" data-dgadd="c">＋ 현금·예금</button><button type="button" data-dgadd="b">＋ 채권</button><button type="button" data-dgadd="o">＋ 그 밖의 자산</button></div>' +
      '<details class="dg-p"><summary>여러 종목 한 번에 붙여 넣기</summary><textarea id="dgta" rows="5" placeholder="한 줄에 하나씩 · 이름 금액(만원)&#10;삼성전자 3000&#10;엔비디아 2000&#10;KODEX 200 1500&#10;예금 2000"></textarea><button type="button" class="hub-sub" data-dgpaste="1">넣기</button></details>' +
      '<button type="button" class="hub-cta" data-dggo="1">진단하기</button>' +
      '<button type="button" class="dg-clr" data-dgclr="1">전부 지우기</button>' + '</section><div id="dgout"></div>' +
      '<p class="hub-n">금액은 대략이면 돼요 · 비중으로 계산해요 · 사모·비상장은 「그 밖의 자산」으로</p></div>';
  }
  function redraw(){ var b = D.getElementById("dgrows"); if (b) b.innerHTML = rowsHTML(); var s = D.getElementById("dgsum"); if (s) s.textContent = sumLine(); save(); }
  function addStock(r, amt){ if (ROWS.some(function(x){ return x.t === "s" && x.s === r.sym; })){ toast("이미 넣은 종목이에요"); return false; } if (ROWS.length >= 40){ toast("40개까지 넣을 수 있어요"); return false; } ROWS.push({t: "s", s: r.sym, n: r.name, a: amt || 0}); return true; }
  function sug(){ var q = D.getElementById("dgq"), box = D.getElementById("dgsug"); if (!q || !box) return; var v = q.value.trim(); if (!v){ box.innerHTML = ""; return; }
    idxMap().then(function(){ if (q.value.trim() !== v) return; var L = (typeof opSearch === "function" ? opSearch(v, 6) : []) || []; L = L.slice(0, 6);
      box.innerHTML = L.length ? L.map(function(r){ return '<button type="button" data-dgpick="' + e(r.sym) + '"><b>' + e(r.name) + '</b><small>' + e(r.sym.replace(/\.(KS|KQ)$/, "")) + (r.etf ? " · ETF" : "") + '</small></button>'; }).join("") : '<p class="dg-e">못 찾았어요 — 「＋ 그 밖의 자산」으로 넣을 수 있어요</p>'; }); }
  function paste(){ var ta = D.getElementById("dgta"); if (!ta) return; var txt = ta.value; if (!txt.trim()) return;
    idxMap().then(function(){ var ok = 0, bad = [];
      txt.split(/\n+/).forEach(function(line){ line = line.trim(); if (!line) return;
        var m = /^(.*?)[\s,\t:]+([\d,.]+)\s*(억|만원|만)?\s*$/.exec(line), nm = m ? m[1].trim() : line, amt = m ? parseFloat(m[2].replace(/,/g, "")) * (m[3] === "억" ? 10000 : 1) : 0;
        if (!nm) return;
        if (/^(현금|예금|예수금|MMF|CMA|적금)$/i.test(nm)){ ROWS.push({t: "c", n: nm, a: amt}); ok++; return; }
        if (/채권|국채|국고채|회사채|브라질/.test(nm) && !/ETF|KODEX|TIGER|ACE|SOL|RISE|PLUS/i.test(nm)){ ROWS.push({t: "b", n: nm, a: amt}); ok++; return; }
        var hit = (typeof opFind === "function" && opFind(nm)) || ((typeof opSearch === "function" ? opSearch(nm, 1) : [])[0]);
        if (hit && addStock(hit, amt)) ok++; else if (!hit) bad.push(nm); });
      ta.value = bad.join("\n"); redraw(); toast(ok + "개 넣었어요" + (bad.length ? " · 못 찾은 " + bad.length + "개는 칸에 남겼어요" : "")); }); }
  function run(){
    var rows = ROWS.filter(function(r){ return +r.a > 0; }), out = D.getElementById("dgout"); if (!out) return;
    if (!rows.length){ toast("종목과 금액을 넣어 주세요"); return; }
    out.innerHTML = '<section class="card hub-c" data-cz="done"><div class="loading">진단하는 중…</div></section>';
    var cl = (D.getElementById("dgcl") || {}).value || "";
    Promise.all([analyze(rows), window.__vdLoad ? __vdLoad().catch(function(){ return null; }) : null]).then(function(z){
      var R = z[0], vd = z[1]; if (vd && vd.text && rows.some(function(r){ return r.t === "s"; })){ R.vd = vd.text; R.vdAsof = vd.asof ? Number(vd.asof.slice(5, 7)) + "/" + Number(vd.asof.slice(8)) : ""; }
      LASTR = R; var c = diagCanvas(R, cl.trim(), ls("pbname") || ""), url;
      try { url = c.toDataURL("image/png"); } catch(x){ url = ""; }
      out.innerHTML = '<section class="card hub-c no-clp" data-cz="done" data-xc="1"><p class="hub-h">진단 결과</p>' +
        '<ul class="dg-pt">' + R.pts.map(function(p){ return '<li><b>' + e(p[0]) + '</b>' + e(p[1]) + '</li>'; }).join("") + '</ul>' +
        (R.miss.length ? '<p class="dg-e">자료를 못 받은 종목: ' + e(R.miss.join(", ")) + ' — 비중에는 들어가고 업종·배당에서는 빠졌어요</p>' : '') +
        '<button type="button" class="hub-cta" data-dgsend="1">📨 한 장으로 보내기</button>' +
        (url ? '<img class="dg-img" src="' + url + '" alt="포트 진단 한 장 미리 보기">' : '') + '</section>';
      try { out.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {}
    }).catch(function(x){ console.error(x); out.innerHTML = '<section class="card hub-c"><p class="dg-e">진단하지 못했어요 — 잠시 뒤 다시 눌러 주세요</p></section>'; });
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#dg [data-dgx],#dg [data-dgadd],#dg [data-dgpick],#dg [data-dgpaste],#dg [data-dggo],#dg [data-dgsend],#dg [data-dgclr],#dg [data-dgcl]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.dgx != null){ ROWS.splice(+t.dataset.dgx, 1); redraw(); return; }
    if (t.dataset.dgadd){ var k = t.dataset.dgadd, n = k === "c" ? "현금·예금" : k === "b" ? "채권" : (prompt("자산 이름 (예: 사모펀드, 비상장 주식, 부동산 펀드)", "") || "").trim().slice(0, 20); if (!n) return;
      if (k !== "o" && ROWS.some(function(x){ return x.t === k; })){ toast("이미 있어요 — 금액만 고쳐 주세요"); return; } ROWS.push({t: k, n: n, a: 0}); redraw(); var ins = D.querySelectorAll("#dgrows input"); if (ins.length) ins[ins.length - 1].focus(); return; }
    if (t.dataset.dgpick){ idxMap().then(function(IX){ var r = IX[t.dataset.dgpick]; if (r && addStock(r, 0)){ redraw(); var q = D.getElementById("dgq"); if (q) q.value = ""; D.getElementById("dgsug").innerHTML = ""; var ins = D.querySelectorAll("#dgrows input"); if (ins.length) ins[ins.length - 1].focus(); } }); return; }
    if (t.dataset.dgpaste){ paste(); return; }
    if (t.dataset.dgclr){ if (confirm("넣은 종목을 전부 지울까요?")){ ROWS = []; redraw(); var o2 = D.getElementById("dgout"); if (o2) o2.innerHTML = ""; } return; }
    if (t.dataset.dgcl){ var I = D.getElementById("dgcl"); if (I) I.value = I.value === t.dataset.dgcl ? "" : t.dataset.dgcl; return; }
    if (t.dataset.dggo){ run(); return; }
    if (t.dataset.dgsend && LASTR){ var cl = ((D.getElementById("dgcl") || {}).value || "").trim().slice(0, 20), nm = pbname(); saveCl(cl);
      send(diagCanvas(LASTR, cl, nm), (cl ? cl + "_" : "") + "포트진단_" + kst().toISOString().slice(5, 10).replace("-", "") + ".png", "포트 진단 한 장"); }
  });
  D.addEventListener("input", function(ev){ var t = ev.target; if (!t || !t.closest) return;
    if (t.id === "dgq"){ clearTimeout(sug.t); sug.t = setTimeout(sug, 180); return; }
    if (t.dataset && t.dataset.dga != null && t.closest("#dg")){ var v = parseFloat(String(t.value).replace(/[^\d.]/g, "")) || 0, r = ROWS[+t.dataset.dga]; if (r){ r.a = v; save(); var s = D.getElementById("dgsum"); if (s) s.textContent = sumLine(); } } });
  D.addEventListener("blur", function(ev){ var t = ev.target; if (t && t.dataset && t.dataset.dga != null){ var r = ROWS[+t.dataset.dga]; if (r && r.a) t.value = Number(r.a).toLocaleString("ko-KR"); } }, true);

  /* ═════════ ⑧ 🎯 신호 한눈에 ═════════ */
  function sigView(){
    return '<div id="sga" data-noemo="1">' +
      [["prob", "오를 확률", "5개 시장 · 오늘 장"], ["whale", "큰손", "기관·유명 투자자가 담는 종목"], ["cup", "컵 차트", "돌파 후보"], ["gap", "갭 상승", "갭 뒤 버티는 종목"]].map(function(s){
        return '<section class="card hub-c sgx-c" data-cz="done" id="sg-' + s[0] + '"><p class="hub-h ez-no">' + s[1] + ' <small>' + s[2] + '</small></p><div class="sgx-b"><div class="loading">불러오는 중…</div></div><button type="button" class="hub-sub ez-no" data-sgall="' + s[0] + '">' + s[1] + ' 전체 보기 ›</button></section>'; }).join("") +
      '<p class="hub-n">신호는 살펴볼 후보예요 · 사라는 뜻이 아니에요</p></div>'; }
  function put(k, html, sub){ var b = D.querySelector("#sg-" + k + " .sgx-b"); if (b) b.innerHTML = html || '<p class="dg-e">오늘 자료가 아직 없어요</p>'; if (sub){ var s = D.querySelector("#sg-" + k + " .hub-h small"); if (s) s.textContent = sub; } }
  function row(sym, name, mid, right, cls){ return '<button type="button" class="sgx-r" data-sgop="' + e(sym) + '"><span class="sgx-n"><b>' + e(name) + '</b>' + (isUS(sym) ? '<small>' + e(sym) + '</small>' : '') + '</span><span class="sgx-m">' + e(mid || "") + '</span><em class="' + (cls || "") + '">' + e(right || "") + '</em></button>'; }
  function latest(cat){ var L = (window.M && M.cats && M.cats[cat]) || []; return L.length ? L[0].id : null; }
  function sigInit(){
    gj("archive/x/prob.json?" + Math.floor(Date.now() / 300000), 300000).then(function(p){ if (!p || !p.markets) return put("prob", "");
      var h = '<div class="sgx-p">' + ["KR", "US", "JP", "CN", "HK"].map(function(k){ var m = p.markets[k]; if (!m) return ""; var v = m.p1, ext = v >= 0.85 || v <= 0.15;
        return '<div><span>' + e(m.flag || "") + ' ' + e(m.name) + '</span><b class="' + (ext ? "" : v >= 0.55 ? "up" : v <= 0.45 ? "down" : "") + '">' + (ext ? "극단" : Math.round(v * 100) + "%") + '</b><small>1주 ' + Math.round(m.p5 * 100) + '%</small></div>'; }).join("") + '</div>' +
        '<p class="sgx-t">' + (p.date ? Number(p.date.slice(5, 7)) + "/" + Number(p.date.slice(8)) + " " + (p.t || "") + " · " : "") + '오늘 종가가 어제보다 높을 확률 · 85% 넘거나 15% 밑은 「극단」이라 참고하지 않아요</p>';
      put("prob", h); });
    Promise.all([gj("archive/x/whale_pick.json?" + Math.floor(Date.now() / 600000)), idxMap()]).then(function(z){ var w = z[0]; if (!w || !(w.rank || []).length) return put("whale", "");
      put("whale", w.rank.slice(0, 5).map(function(r){ return row(r.s, r.n || r.s, String((r.why || [""])[0]).replace(/^[^\s가-힣A-Za-z0-9]+\s*/, "").split(" · ").slice(0, 2).join(" · "), r.tot != null ? Math.round(r.tot) + "점" : "", ""); }).join(""), "점수 높은 순 5개 · " + String(w.at || "").slice(5).replace("-", "/")); });
    ["cup", "gap"].forEach(function(cat){ var id = latest(cat); if (!id) return put(cat, "");
      Promise.all([gj("archive/" + cat + "/" + id + "/cards.json"), idxMap()]).then(function(z){ var d = z[0], IX = z[1]; if (!d || !(d.top || []).length) return put(cat, "");
        var T = d.top.slice().sort(function(a, b){ return (b.score || 0) - (a.score || 0); }).slice(0, 5);
        put(cat, T.map(function(c){ var nm = (IX[c.code] && IX[c.code].name) || String(c.name || c.code).replace(/\s*-\s*(Common|Class|Ordinary).*$/i, "").replace(/,? (Inc|Corp|Ltd|Co)\.?.*$/i, "");
          var mid = cat === "cup" ? (c.brk ? "돌파" : c.dist != null && c.dist > -5 ? "돌파 임박" : "기준가까지 " + Math.abs(c.dist).toFixed(1) + "%") + (c.weeks ? " · " + Math.round(c.weeks) + "주 컵" : "") : "갭 " + sg(c.gap, 0) + (c.after != null ? " · " + Math.round(c.after) + "일째" : "") + (c.hold ? " · 버팀" : "");
          return row(c.code, nm, mid, c.score != null ? Math.round(c.score) + "점" : "", ""); }).join(""), (cat === "cup" ? "돌파 후보 " : "후보 ") + (d.total || d.top.length) + "개 중 5개 · " + id.slice(5).replace("-", "/")); }); });
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#sga [data-sgall],#sga [data-sgop]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.sgall){ if (typeof window.go === "function"){ go(t.dataset.sgall); window.scrollTo(0, 0); } return; }
    if (t.dataset.sgop && window.openOP) openOP(t.dataset.sgop);
  });

  /* ═════════ 화면 연결 (index.html go → hubView/hubInit) ═════════ */
  var V0 = window.hubView, I0 = window.hubInit;
  window.hubView = function(key){ if (key === "diag") return diagView(); if (key === "sigall") return sigView(); return V0 ? V0(key) : ""; };
  window.hubInit = function(key){ if (key === "sigall"){ sigInit(); return; } if (key === "diag") return; if (I0) I0(key); };

  var st = D.createElement("style");
  st.textContent =
    "#dg .hub-p{margin:0 0 12px;font-size:14.5px;line-height:1.55;color:var(--sub);word-break:keep-all}" +
    ".dg-cl,.qi-in label{display:flex;align-items:center;gap:8px;font-size:14.5px;font-weight:700;margin:0 0 8px;white-space:nowrap}" +
    ".dg-cl input,.qi-in label input,#dgq,#dgta{flex:1;min-width:0;width:100%;font:inherit;font-size:16px;padding:11px 12px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);box-sizing:border-box}" +
    ".qi-rc{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.qi-rc button{font:inherit;font-size:13.5px;padding:6px 11px;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);cursor:pointer}" +
    "#dgrows{margin:6px 0 4px;border-top:1px solid var(--line)}" +
    ".dg-r{display:grid;grid-template-columns:minmax(0,1fr) 132px 40px;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}" +
    ".dg-nm{min-width:0}.dg-nm b{display:block;font-size:15.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dg-nm small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".dg-r label{display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:10px;padding:0 9px}.dg-r label input{flex:1;min-width:0;width:100%;font:inherit;font-size:16px;font-weight:700;text-align:right;padding:9px 0;border:0;background:transparent;color:var(--text);font-variant-numeric:tabular-nums}.dg-r label span{font-size:12.5px;color:var(--sub);white-space:nowrap}" +
    ".dg-r>button{font:inherit;font-size:15px;width:40px;height:40px;border:0;border-radius:10px;background:transparent;color:var(--sub);cursor:pointer}" +
    ".dg-sum{margin:6px 2px 12px;font-size:13.5px;font-weight:700;color:var(--sub);text-align:right;min-height:18px;font-variant-numeric:tabular-nums}" +
    ".dg-e{margin:10px 2px;font-size:13.5px;color:var(--sub);line-height:1.5}" +
    ".dg-add{position:relative}#dgsug button{display:flex;justify-content:space-between;align-items:baseline;gap:10px;width:100%;font:inherit;text-align:left;padding:11px 4px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer}#dgsug b{font-size:15px;font-weight:700}#dgsug small{font-size:12.5px;color:var(--sub);white-space:nowrap}" +
    ".dg-ch{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.dg-ch button{font:inherit;font-size:13.5px;font-weight:600;padding:8px 12px;border:1px dashed var(--line);border-radius:999px;background:transparent;color:var(--text);cursor:pointer}" +
    ".dg-p{margin:4px 0 14px}.dg-p summary{font-size:14px;font-weight:700;color:var(--sub);padding:8px 2px;cursor:pointer}.dg-p textarea{margin-top:6px;line-height:1.5;resize:vertical}" +
    ".dg-clr{display:block;margin:10px auto 0;font:inherit;font-size:13px;color:var(--sub);background:transparent;border:0;text-decoration:underline;cursor:pointer;padding:8px}" +
    ".dg-pt{list-style:none;margin:0 0 14px;padding:0}.dg-pt li{padding:10px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.55;word-break:keep-all}.dg-pt li:last-child{border-bottom:0}.dg-pt b{display:inline-block;font-size:12px;font-weight:800;color:#3182f6;background:rgba(49,130,246,.12);border-radius:7px;padding:2px 7px;margin-right:8px}" +
    ".dg-img{display:block;width:100%;height:auto;margin-top:14px;border-radius:14px;border:1px solid var(--line)}" +
    "#qimgs{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}" +
    ".qi-in{width:100%;max-width:520px;background:var(--panel,#121826);color:var(--text);border-radius:20px 20px 0 0;padding:20px 18px calc(18px + env(safe-area-inset-bottom))}.qi-in>b{font-size:17px}.qi-in>p{margin:6px 0 14px;font-size:14px;color:var(--sub);line-height:1.5}" +
    ".qi-b{display:flex;gap:8px;margin-top:6px}.qi-b button{flex:1;font:inherit;font-size:16px;font-weight:800;padding:13px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer}.qi-b .qi-go{flex:2;border:0;background:#3182f6;color:#fff}" +
    ".mn-qc.qa-img{border-color:rgba(49,130,246,.6);color:#3182f6;font-weight:800}" +
    "#sga .hub-h small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".sgx-r{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:10px 2px;cursor:pointer}.sgx-r:first-child{border-top:0}" +
    ".sgx-n{min-width:0}.sgx-n b{display:block;font-size:15px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sgx-n small{display:block;font-size:12px;color:var(--sub)}.sgx-m{font-size:12.5px;color:var(--sub);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.sgx-r em{font-style:normal;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".sgx-p{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.sgx-p>div{text-align:center;padding:10px 2px;border:1px solid var(--line);border-radius:12px;min-width:0}.sgx-p span{display:block;font-size:12px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgx-p b{display:block;font-size:19px;font-weight:800;margin:3px 0 1px;font-variant-numeric:tabular-nums}.sgx-p b.up{color:var(--up)}.sgx-p b.down{color:var(--down)}.sgx-p small{font-size:11.5px;color:var(--sub)}" +
    ".sgx-t{margin:9px 2px 0;font-size:12.5px;color:var(--sub);line-height:1.5}";
  D.head.appendChild(st);
})();
