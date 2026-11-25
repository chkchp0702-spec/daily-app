/* 📦 app.b08.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 8/8 (ux1122.js … stab.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
if(typeof __bs!=="function"){window.__bs=window.__bk=window.__be=function(){};}
__bs(8,84,["ux1122.js", "ux1116.js", "tax.js", "ux1118.js", "ux1119.js", "ux1123.js", "ux1124.js", "ux1124b.js", "say.js", "notice.js", "stab.js"],[4, 48, 433, 891, 1269, 1462, 1591, 1681, 1776, 2046, 2104]);
/* ======== ux1122.js ======== */
/* 🎲 11/22 「들고 가면 · 규칙대로 하면 — 이익 확률」 (사용자: 「지금은 이걸 이렇게 들고 가는 게 이익 볼 확률이 몇 퍼센트다 — 표현은 직관적으로 ·
   왜 그런지는 밑에 자세히 탭으로 · 분할해서 현금/주식 비중을 늘려요 같은 표현도」)
   계산은 만드는 쪽(market-strategy-report src/hold_prob.py → bear.json markets[]/more[] 의 hold 칸: 같은 꼴이었던 과거 달들의 2년 뒤 빈도) — 이 파일은 그리기만.
   붙는 곳: 🐻 하락장 계기판 시장 줄 · 🌏 일본·중국·홍콩 줄 (📏 선이 내려오는 날 한 토막 바로 위 · 새 화면 없음)
   과거 빈도 · 앞날 보장 아님 · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function row(lab, up, big, cls){
    return '<div class="hp-r ' + cls + '"><span class="hp-l">' + lab + '</span><span class="hp-bar"><i style="width:' + Math.max(4, Math.min(100, up)) + '%"></i></span>' +
      '<b>이익 ' + up + '%</b><small>크게 잃을 확률 ' + big + '%</small></div>';
  }
  function holdHtml(m){
    var h = m && m.hold; if (!h || h.hold_up == null) return "";
    var same = h.rule_up == null || (h.rule_up === h.hold_up && h.rule_big === h.hold_big) || (m.analog && m.analog.stock >= 100 && m.analog.k === "floor");
    var why = (h.why || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("");
    return '<div class="hp"><div class="hp-h">🎲 <b>' + e(h.shape_name || "") + '</b> 꼴 — 과거 같은 꼴 ' + e(h.n) + '번의 2년 뒤</div>' +
      (h.regime ? '<p class="hp-reg">' + e(h.regime) + '</p>' : '') +   // 🇺🇸 11/22 지금과 같은 조건만 본 숫자(몇 년째 상승+금리 상승+기술주 거품)
      row("그냥 들고 가면", h.hold_up, h.hold_big, "hp-a") + (same ? "" : row("규칙대로 하면", h.rule_up, h.rule_big, "hp-b")) +
      (h.act ? '<p class="hp-act">👉 ' + e(h.act) + '</p>' : '') +
      '<details class="hp-why"><summary>왜 그런가요</summary><ul>' + why + '<li>「크게 잃을 확률」 = 2년 뒤 −20% 넘게 손실로 끝난 비율 · 과거 빈도일 뿐 앞날을 보장하지 않아요 · 매수·매도 추천 아님</li></ul></details></div>';
  }
  window.__holdHtml = holdHtml;
  var prev = window.__meetLine;
  window.__meetLine = function(m, cls){ var a = ""; try { a = holdHtml(m); } catch (_) {} return a + (prev ? prev(m, cls) : ""); };

  var css = document.createElement("style"); css.id = "ux1122css";
  css.textContent =
    ".hp{margin:8px 0 6px;padding:9px 10px;border:1px solid var(--line,#e5e7eb);border-radius:12px;display:block;width:100%;box-sizing:border-box;text-align:left}" +
    ".hp-h{font-size:12px;color:var(--sub,#888);margin-bottom:6px;word-break:keep-all}.hp-h b{color:var(--text,#111)}" +
    ".hp-r{display:grid;grid-template-columns:92px 1fr auto;grid-template-areas:'l bar p' 'l s s';column-gap:8px;align-items:center;margin:5px 0}" +
    ".hp-l{grid-area:l;font-size:12.5px;font-weight:700;word-break:keep-all}.hp-bar{grid-area:bar;height:10px;border-radius:6px;background:rgba(127,127,127,.18);overflow:hidden;display:block}" +
    ".hp-bar i{display:block;height:100%;border-radius:6px;background:#9aa3ad}.hp-b .hp-bar i{background:#2f80ed}" +
    ".hp-r b{grid-area:p;font-size:14px;white-space:nowrap}.hp-b b{color:#2f80ed}.hp-r small{grid-area:s;font-size:11.5px;color:var(--sub,#888);display:block;margin:1px 0 0}" +
    ".hp-reg{margin:0 0 8px;padding:7px 9px;border-radius:9px;background:rgba(229,72,77,.10);font-size:12.5px;line-height:1.5;font-weight:700;word-break:keep-all;color:var(--text,#111)}" +
    ".hp-act{margin:7px 0 2px;font-size:13px;line-height:1.5;font-weight:700;word-break:keep-all;color:var(--text,#111)}" +
    ".hp-why{margin-top:4px}.hp-why summary{font-size:12px;color:var(--sub,#888);cursor:pointer;padding:4px 0}.hp-why ul{margin:4px 0 0;padding-left:16px}" +
    ".hp-why li{font-size:11.5px;line-height:1.5;color:var(--sub,#888);margin:2px 0;word-break:keep-all;display:list-item}" +
    ":root:not([data-ui=light]) .hp-b .hp-bar i{background:#5aa0ff}:root:not([data-ui=light]) .hp-b b{color:#5aa0ff}";
  document.head.appendChild(css);
})();
;
__bk(84);
/* ======== ux1116.js ======== */
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
      LASTR = R; window.__dgLast = R; var c = diagCanvas(R, cl.trim(), ls("pbname") || ""), url;
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
;
__bk(85);
/* ======== tax.js ======== */
/* CH Investing — 🧾 11/16 세무계산기 (🔬 연구실 › 세무계산기 · #tax)
   사용자: 「세무계산기 카테고리 — 통합으로 진행 · 연구실에 넣고 · 항목 선택하면 필요값만 입력하면 계산 결과 나오는 형태로」
   항목 6개(한 화면 · 고르면 그 항목 입력칸만 보임 · 넣는 즉시 계산):
     ① 2,000만 경보기 — 금융소득종합과세 + 건강보험료(피부양자·지역·직장) 통합 + 고배당 분리과세 비교
     ② 연금계좌 세액공제   ③ 퇴직소득세(일시금 vs 연금)   ④ 연금 받을 때 세금   ⑤ 해외주식 양도세   ⑥ ISA 절세
   ★ 세법 숫자는 전부 아래 LAW 한 곳에만 있음 — 해가 바뀌거나 법이 바뀌면 LAW 만 고칠 것 (기준: 2026년 귀속)
   ★ 11/16 밤 3차: 사용자 「기억값으로 어림이라니… 철저하게 다시」 → 계산에 쓰는 숫자를 전부 법령·국세청·공단 원문과 대조(기억값 0) · 공식 예시로 맞춰 보는 검산 파일 tools/tax_check.js
     [소득세] 세율 §55(시행 2026) · 근로소득공제 §47·연금소득공제 §47의2(시행규칙 별지 40호(1) 2026.3.20 표) · 근로소득세액공제 §59 · 연금계좌세액공제 §59의3 · 표준세액공제 §59의4⑨
              금융소득 2,000만 §14③6 · 배당가산 10% §17③(2024.1.1 이후) · 고배당 분리과세(국세청 2026.3.9 보도자료) · 사적연금 1,500만 §14③9·15% 선택 §64의4
              연금 원천징수 5·4·3%·종신 3%·이연퇴직 70·60·50%(국세청 「연금소득 원천징수 방법」 · 2026.1.1 이후 수령분) · 연금수령한도·기산연차 시행령 §40의2 · 인출순서 §40의3
              퇴직 근속연수공제·환산급여공제 §48(국세청 「퇴직소득세 계산방법」) · 해외주식 기본공제 250만 §118의7·세율 20% · 증여 후 1년 이월과세 §97의2 · RIA 조특법 §91의26
     [건보]  보험료율 7.19%·장기요양 0.9448%·점수당 211.5원·상한 4,591,740·하한 20,160(공단 「2026년 달라지는 제도」·고시 2025-222호) · 재산 60등급 시행령 별표 4(공단 게시표와 대조)
              소득 평가(이자·배당·사업·기타 100% / 근로·연금 50% / 이자·배당 1,000만 이하 제외) 시행규칙 §44 · 보수 외 2,000만 시행령 §41④ · 피부양자 시행규칙 별표 1의2
     [4대보험] 국민연금 9.5%(본인 4.75%)·기준소득월액 상한 637만(~2026.6)·659만(2026.7~) · 고용보험 본인 0.9%
     [증여]  배우자 6억·직계존비속 5천만(미성년 2천만) 상증법 §53 / [ISA] 200·400만·9.9%·서민형 5,000만/3,800만·전환 10%(300만)
   11/16 밤 사용자 「정말 이리 간단한거야? 다른 고려할 요인들 없는지 면밀히 살펴」 → 2차: 배당 Gross-up·배당세액공제 / 4대보험 반영한 과세표준 어림·직접 입력 /
     지역 재산분(60등급)·상한·최저 / 연금공제 결정세액 한도·사업자 / 퇴직 연금수령한도·원금 먼저 인출·수익률 / RIA 50% 공제 / 부양가족 100만·세대 합산·부부 동반 탈락 안내
     기본 화면은 그대로 필수 1~2칸 — 추가 칸은 「＋ 더 정확하게」를 눌러야 보임(adv)
   넣은 금액은 어디에도 저장·전송하지 않음(화면을 떠나면 사라짐) — 마지막에 고른 항목만 이 휴대폰에 기억.
   화면 연결: index.html go("tax") → hubView/hubInit (ux1116.js 와 같은 방식) · nav2.js GROUPS(tax · lab:1) · ux1112b.js LABS · gsearch.js MENU */
(function(){
  var D = document;
  var LAW = {
    asof: "2026년 기준",
    br: [[1400, .06], [5000, .15], [8800, .24], [15000, .35], [30000, .38], [50000, .40], [100000, .42], [Infinity, .45]],   // 종합소득세율(만원)
    local: 1.1,                 // 지방소득세 10% 포함
    finLine: 2000,              // 금융소득종합과세 기준
    wh: .14,                    // 이자·배당 원천징수(소득세)
    gross: .10,                 // 배당가산(Gross-up) — 국내 회사 배당 중 2,000만 초과분 · 같은 금액을 배당세액공제
    ins4: {np: .0475, npMax: (637 * 6 + 659 * 6) * .0475, ei: .009},   // 근로자 보험료 본인 부담: 국민연금 4.75%(기준소득월액 상한 1~6월 637만·7~12월 659만 → 연 369.36만) / 고용 0.9% / 건보는 hi 에서
    div: [[2000, .14], [30000, .20], [500000, .25], [Infinity, .30]],   // 고배당기업 배당 분리과세(2026~2028 지급분)
    hi: {rate: .0719, ltc: .9448 / 7.19, finIn: 1000, depLine: 2000, depLow: 1000, propMid: 54000, propMax: 90000, empFree: 2000, half: .5,
         cap: 4591740, floor: 20160, floorM: 28, propDed: 10000, pt: 211.5,   // 월 상한·지역 최저(소득월액 28만 이하)·재산 기본공제 1억·점수당 금액
         /* 재산보험료부과점수 60등급(시행령 별표 4 · 기본공제 뒤 금액 상한(만원), 점수) — 2022.9 이후 구간 고정, 점수당 금액만 해마다 바뀜 */
         grade: [[450,22],[900,44],[1350,66],[1800,97],[2250,122],[2700,146],[3150,171],[3600,195],[4050,219],[4500,244],[5020,268],[5590,294],[6220,320],[6930,344],[7710,365],[8590,386],[9570,412],[10700,439],[11900,465],[13300,490],
                 [14800,516],[16400,535],[18300,559],[20400,586],[22700,611],[25300,637],[28100,659],[31300,681],[34900,706],[38800,731],[43200,757],[48100,785],[53600,812],[59700,841],[66500,881],[74000,921],[82400,961],[91800,1001],[103000,1041],[114000,1091],
                 [127000,1141],[142000,1191],[158000,1241],[176000,1291],[196000,1341],[218000,1391],[242000,1451],[270000,1511],[300000,1571],[330000,1641],[363000,1711],[399300,1781],[439230,1851],[483153,1921],[531468,1991],[584615,2061],[643077,2131],[707385,2201],[778124,2271],[Infinity,2341]]},
    pen: {save: 600, all: 900, wageLine: 5500, incLine: 4500, hiRate: .165, loRate: .132, isaRate: .1, isaMax: 300},
    pay: {line: 1500, sep: .165, r: [[70, .055], [80, .044], [999, .033]], life: .033},
    ret: {keep: [[10, .7], [20, .6], [999, .5]]},                       // 연금 수령 연차별 내는 비율(20년 초과 50%는 2026~)
    ovs: {ded: 250, rate: .22, ria: .5},   // RIA(국내시장 복귀계좌) 2026년 8~12월 결제분 공제율 50% · 2026년 한시
    isa: {free: {n: 200, s: 400}, rate: .099, normal: .154}
  };
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function prog(x, br){ var t = 0, lo = 0; x = Math.max(0, x); for (var i = 0; i < br.length; i++){ var hi = br[i][0]; if (x > lo) t += (Math.min(x, hi) - lo) * br[i][1]; lo = hi; } return t; }
  function itax(x){ return prog(x, LAW.br); }
  function mrate(x){ for (var i = 0; i < LAW.br.length; i++) if (x <= LAW.br[i][0]) return LAW.br[i][1]; return .45; }
  function wageDed(w){ var d = w <= 500 ? w * .7 : w <= 1500 ? 350 + (w - 500) * .4 : w <= 4500 ? 750 + (w - 1500) * .15 : w <= 10000 ? 1200 + (w - 4500) * .05 : 1475 + (w - 10000) * .02; return Math.min(d, 2000, w); }
  function penDed(p){ var d = p <= 350 ? p : p <= 700 ? 350 + (p - 350) * .4 : p <= 1400 ? 490 + (p - 700) * .2 : 630 + (p - 1400) * .1; return Math.min(d, 900, p); }
  /* 금액 표시 — 넣는 단위는 만원 */
  function won(x){ if (Math.abs(x) < 0.05) return "0원"; var neg = x < 0; x = Math.abs(x); var s;
    if (x >= 9999.5){ var m = Math.round(x), uk = Math.floor(m / 10000), r = m % 10000; s = uk.toLocaleString() + "억" + (r ? " " + r.toLocaleString() + "만" : "") + " 원"; }
    else if (x >= 100) s = Math.round(x).toLocaleString() + "만 원";
    else s = (Math.round(x * 10) / 10).toLocaleString() + "만 원";
    return (neg ? "−" : "") + s; }
  function wonM(man){ return Math.round(man * 10000 / 10) * 10; }                    // 만원 → 원(10원 단위)
  function wn(v){ return v.toLocaleString() + "원"; }
  function pct(r, d){ return (r * 100).toFixed(d == null ? 1 : d).replace(/\.0$/, "") + "%"; }
  function ins4(w){ var I = LAW.ins4; return Math.min(w * I.np, I.npMax) + w * LAW.hi.rate / 2 * (1 + LAW.hi.ltc) + w * I.ei; }   // 근로자 보험료 본인 부담(만원) = 연금보험료공제 + 건강·고용보험료 특별소득공제 — 1년 내내 근무·비과세 급여 없음 가정
  function fl10(x){ return Math.floor(x / 10) * 10; }
  function propPts(base){ var x = (base || 0) - LAW.hi.propDed; if (x <= 0) return 0; var G = LAW.hi.grade; for (var i = 0; i < G.length; i++) if (x <= G[i][0]) return G[i][1]; return 2341; }
  /* 지역가입자 월 보험료(원): 소득분(소득월액 28만 이하는 최저보험료) + 재산분, 상한, 장기요양 포함 → {inc, prop, tot} */
  function hiLocal(yearMan, propBase){ var H = LAW.hi, m = Math.max(0, yearMan) / 12, inc = m <= H.floorM ? H.floor : m * 10000 * H.rate, pr = propPts(propBase) * H.pt, sum = inc + pr, k = sum > H.cap ? H.cap / sum : 1;
    var hi = fl10(Math.min(sum, H.cap)), tot = hi + fl10(hi * H.ltc), a = sum > 0 ? Math.round(tot * inc / sum / 10) * 10 : 0;   // 건보료·장기요양 각각 10원 미만 버림(공단 방식)
    return {inc: a, prop: tot - a, tot: tot}; }
  function hiExtra(yearMan){ var H = LAW.hi; var hi = fl10(Math.min(H.cap, Math.max(0, yearMan) / 12 * 10000 * H.rate)); return hi + fl10(hi * H.ltc); }   // 직장가입자 소득월액 보험료(월 · 원)

  /* ───────── 결과 그리기 도구 ───────── */
  function big(lab, val, sub, tone){ return '<div class="tx-big' + (tone ? " tx-" + tone : "") + '"><small>' + lab + '</small><b>' + val + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; }
  function bars(rows){ var mx = 0; rows.forEach(function(r){ if (r[1] > mx) mx = r[1]; });
    return '<div class="tx-bars">' + rows.map(function(r){ var w = mx > 0 ? Math.max(r[1] > 0 ? 3 : 0, r[1] / mx * 100) : 0;
      return '<div class="tx-b' + (r[3] ? " tx-best" : "") + '"><span>' + r[0] + '</span><i><u style="width:' + w.toFixed(1) + '%"></u></i><b>' + (r[2] || won(r[1])) + '</b></div>'; }).join("") + '</div>'; }
  function tips(t, a){ a = a.filter(Boolean); return a.length ? '<p class="tx-th">' + t + '</p><ul class="tx-tip">' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul>' : ''; }
  function basis(a){ return '<details class="tx-base"><summary>계산 기준 · 가정 보기</summary><ul>' + a.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul></details>'; }
  function head(t, s){ return '<p class="hub-h">' + t + (s ? ' <small>' + s + '</small>' : '') + '</p>'; }

  /* ───────── 계산기 6개 ─────────
     field: {id, label, sub, req, ph, unit, max, on(v) 보일 조건, adv: 1 → 「더 정확하게」를 눌러야 보이는 칸} */
  var CALCS = [
    { k: "alarm", ic: "🚨", t: "2,000만 경보기", d: "금융소득 세금 + 건보료 한 번에",
      segs: [{id: "ins", label: "건강보험", opts: [["emp", "직장가입자"], ["dep", "피부양자"], ["loc", "지역가입자"]]}],
      fields: [
        {id: "fin", label: "이자·배당 합계", sub: "1년 · 세전", req: 1, ph: "예: 2500"},
        {id: "wage", label: "연봉(총급여)", sub: "세전", ph: "예: 8000", on: function(v){ return v.ins === "emp"; }},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "예: 1200", on: function(v){ return v.ins !== "emp"; }},
        {id: "dv", label: "그중 국내 회사 주식 배당", sub: "ETF·펀드·해외·이자는 빼고", ph: "선택", adv: 1},
        {id: "hd", label: "그중 고배당기업 배당", sub: "분리과세 신청할 수 있는 배당", ph: "선택", adv: 1},
        {id: "biz", label: "사업·임대 등 다른 소득", sub: "경비 뺀 금액", ph: "선택", adv: 1, on: function(v){ return v.ins !== "dep"; }},
        {id: "prop", label: "재산세 과세표준", sub: "주택은 공시가의 약 60%", ph: "선택", adv: 1, on: function(v){ return v.ins !== "emp"; }},
        {id: "tb", label: "다른 소득의 과세표준", sub: "원천징수영수증에 있는 값 · 알면 직접", ph: "선택", adv: 1}
      ],
      run: function(v){
        var F = v.fin || 0; if (!F) return null;
        var H = LAW.hi, HD = Math.min(v.hd || 0, F), DV = Math.min(F, Math.max(v.dv || 0, HD)), ins = v.ins, wage = v.wage || 0, pen = v.pen || 0, biz = ins === "dep" ? 0 : (v.biz || 0), prop = ins === "emp" ? 0 : (v.prop || 0);
        var est = Math.max(0, (ins === "emp" ? Math.max(0, wage - wageDed(wage) - ins4(wage)) : Math.max(0, pen - penDed(pen))) + biz - 150), O = v.tb ? v.tb : est;
        /* 금융소득 f(그중 Gross-up 대상 국내 배당 d)에 붙는 소득세 — 2,000만 초과분만 합산 · 배당가산 10% 더했다가 같은 금액을 세액공제 · 14% 원천징수세액보다 작을 수 없음 */
        function ft(f, d){ if (f <= LAW.finLine) return f * LAW.wh;
          var ex = f - LAW.finLine, g = Math.min(d, ex) * LAW.gross;
          return Math.max(itax(O + ex + g) + LAW.finLine * LAW.wh - g, itax(O) + f * LAW.wh) - itax(O); }
        var gen = ft(F, DV) * LAW.local, wh = F * LAW.wh * LAW.local, extra = Math.max(0, gen - wh), sep = HD > 0 ? (prog(HD, LAW.div) + ft(F - HD, DV - HD)) * LAW.local : null;
        var h = "", over = F > LAW.finLine;
        var mx = Math.min(4000, Math.max(3000, F * 1.15)), pos = Math.min(100, F / mx * 100);
        h += '<div class="tx-g"><div class="tx-gt"><u style="width:' + pos.toFixed(1) + '%" class="' + (over ? "r" : F > H.finIn ? "y" : "g") + '"></u>' +
          '<i class="up" style="left:' + (H.finIn / mx * 100).toFixed(1) + '%"><em>1,000만 · 건보료 선</em></i><i style="left:' + (LAW.finLine / mx * 100).toFixed(1) + '%"><em>2,000만 · 종합과세 선</em></i></div>' +
          '<p>지금 <b>' + won(F) + '</b> — ' + (over ? '2,000만 선을 <b class="tx-r">' + won(F - LAW.finLine) + '</b> 넘음' : F > H.finIn ? '2,000만 선까지 <b>' + won(LAW.finLine - F) + '</b> 남음' : '1,000만 선까지 <b>' + won(H.finIn - F) + '</b> 남음') + '</p></div>';
        /* ① 세금 */
        h += '<p class="tx-sec">① 세금</p>';
        if (!over) h += big("금융소득 세금", won(wh), "15.4% 떼고 끝 · 더 낼 세금 없음", "ok");
        else if (extra < 0.05) h += big("더 낼 세금", "0원", "종합과세 대상이지만 다른 소득이 적어 이미 뗀 15.4%(" + won(wh) + ")로 끝 · 5월 신고는 해야 함", "ok");
        else h += big("5월에 더 낼 세금", won(extra), "이미 뗀 " + won(wh) + " + 추가 " + won(extra) + " = 모두 " + won(gen) + " · 초과분에 붙는 세율 약 " + pct(mrate(O + F - LAW.finLine) * LAW.local), "bad");
        if (over && extra >= 0.05 && !v.dv && !v.hd) h += '<p class="tx-n tx-s">전부 이자·ETF 분배금으로 본 값 — 국내 회사 배당이 섞여 있으면 「더 정확하게」에 넣기 (배당세액공제로 세금이 줄어듦)</p>';
        if (sep != null && over){ var gain = gen - sep;
          h += bars([["그냥 종합과세", gen, null, gain <= 0.05], ["고배당 분리과세 신청", sep, null, gain > 0.05]]) +
            '<p class="tx-n">' + (gain > 0.05 ? '고배당 배당 ' + won(HD) + '을 분리과세로 신청하면 <b class="tx-a">' + won(gain) + '</b> 덜 냄 (5월 신고 때 신청서를 내야 적용)' : gain < -0.05 ? '다른 소득이 적어 분리과세를 고르면 오히려 <b class="tx-r">' + won(-gain) + '</b> 더 냄 — 신청하지 않는 쪽이 유리' : '이 경우는 분리과세를 골라도 세금 차이가 없음') + '</p>'; }
        else if (sep != null) h += '<p class="tx-n">2,000만 이하라 고배당 분리과세를 골라도 세금은 같음(14%)</p>';
        /* ② 건보료 */
        var Fh = F > H.finIn ? F : 0, msg = "", pp = propPts(prop);
        h += '<p class="tx-sec">② 건강보험료</p>';
        if (ins === "emp"){ var ext = Fh + biz, add = ext > H.empFree ? hiExtra(ext - H.empFree) : 0;
          h += add ? big("월급 말고 더 내는 건보료", "월 " + wn(add), "연 " + wn(add * 12) + " · 월급 외 소득 " + won(ext) + " 중 2,000만 넘는 " + won(ext - H.empFree) + "에 부과 · 전액 본인 부담", "bad")
                   : big("더 내는 건보료", "없음", "월급 외 소득 " + won(ext) + " — 2,000만 이하" + (F <= H.finIn && F > 0 ? " (이자·배당 1,000만 이하는 아예 안 봄)" : ""), "ok");
        } else if (ins === "dep"){ var tot = Fh + pen, why = [];
          if (tot > H.depLine) why.push("소득 합계 " + won(tot) + " — 2,000만 초과");
          if (prop > H.propMax) why.push("재산세 과세표준 " + won(prop) + " — 9억 초과");
          else if (prop > H.propMid && tot > H.depLow) why.push("재산 과표 5.4억~9억 구간인데 소득 " + won(tot) + " — 1,000만 초과");
          if (why.length){ var L = hiLocal(Fh + pen * H.half, prop);
            h += big("피부양자 탈락", "월 " + wn(L.tot) + (prop ? "" : " +α"), "지역가입자로 바뀜 · 연 " + wn(L.tot * 12) + (prop ? " · 소득분 " + wn(L.inc) + " + 재산분 " + wn(L.prop) : " · 소득분만 계산 — 집·땅이 있으면 「더 정확하게」에 재산세 과세표준을 넣어야 재산분까지 나옴"), "bad") +
              '<p class="tx-n">탈락 이유: ' + why.join(" · ") + '</p><p class="tx-n tx-s">부부는 한 사람만 소득 기준을 넘어도 둘 다 탈락 · 지역보험료는 같은 세대 가족의 소득·재산을 합쳐서 계산</p>';
          } else { var room = (prop > H.propMid ? H.depLow : H.depLine) - tot;
            h += big("피부양자 유지", "보험료 0원", "소득 합계 " + won(tot) + " · 기준선까지 " + won(room) + " 남음" + (F <= H.finIn ? " · 이자·배당 1,000만 이하는 0원으로 봄" : ""), "ok");
            if (F <= H.finIn && pen + H.finIn > (prop > H.propMid ? H.depLow : H.depLine)) msg = "⚠ 이자·배당이 1,000만을 1원이라도 넘으면 전액이 소득에 잡혀 바로 탈락함";
            h += '<p class="tx-n tx-s">배우자가 소득 기준을 넘으면 함께 탈락 · 사업자등록이 있고 사업소득이 있으면 금액과 상관없이 탈락</p>'; }
        } else { var N = hiLocal(Fh + pen * H.half + biz, prop), Lo = hiLocal(pen * H.half + biz, prop);
          h += big("지역 건보료", "월 " + wn(N.tot) + (prop ? "" : " +α"), "연 " + wn(N.tot * 12) + (prop ? " · 소득분 " + wn(N.inc) + " + 재산분 " + wn(N.prop) : " · 소득분만 — 재산분은 「더 정확하게」에 재산세 과세표준을 넣으면 나옴"), Fh ? "bad" : "ok");
          if (Fh) h += bars([["지금", N.tot, "월 " + wn(N.tot)], ["이자·배당 1,000만 이하면", Lo.tot, "월 " + wn(Lo.tot), 1]]) + '<p class="tx-n">이자·배당을 1,000만 이하로 맞추면 <b class="tx-a">연 ' + wn((N.tot - Lo.tot) * 12) + '</b> 줄어듦</p>';
          else if (F > 0) msg = "⚠ 이자·배당이 1,000만을 넘는 순간 전액이 잡혀 월 약 " + wn(hiLocal(H.finIn + pen * H.half + biz, prop).tot - Lo.tot) + " 이상 오름";
          h += '<p class="tx-n tx-s">같은 세대 가족의 소득·재산을 합쳐서 계산 — 본인 것만 넣었다면 실제는 더 많을 수 있음</p>'; }
        if (msg) h += '<p class="tx-n tx-w">' + msg + '</p>';
        h += tips("줄이는 방법 · 같이 볼 것", [
          F > H.finIn * .7 ? "이자·배당 나는 상품을 <b>ISA·연금저축·IRP</b> 안으로 — 그 안 수익은 2,000만·건보료 계산에서 빠짐" : "",
          F > H.finIn * .7 ? "<b>받는 해를 나누기</b> — ELS 상환·채권 만기·예금 만기가 한 해에 몰리지 않게 (ELS·펀드·국내 상장 해외 ETF 수익도 배당소득)" : "",
          over ? "<b>가족 명의로 나누기</b> — 배우자 6억·성인 자녀 5천만(10년)까지 증여세 없음 · 2,000만은 사람마다 따로 셈" : "",
          F > H.finIn * .7 ? "이자 대신 <b>매매차익이 큰 상품</b> — 국내 주식 차익·저쿠폰 채권의 차익은 금융소득에 안 들어감" : "",
          over ? "2,000만을 넘은 사람은 <b>가족의 연말정산 부양가족 공제에서 빠지고</b>, 3년간 ISA 새 가입이 막힘" : "",
          HD > 0 ? "고배당 분리과세 배당의 건보료: 법령에는 부과 근거가 있고 지금 실무는 분리과세 금융소득을 빼고 있음 — <b>공단 방침이 아직 확정 안내 전</b>이라 여기서는 포함해 계산(보수적)" : ""]);
        h += basis(["금융소득종합과세(소득세법 §14·§62): 2,000만 초과분만 다른 소득과 합쳐 누진세율(6~45% · §55) · 14% 원천징수세액과 비교해 큰 쪽 · 지방소득세 10% 포함",
          "다른 소득 과세표준 약 " + won(O) + (v.tb ? " (직접 넣은 값)" : " — " + (ins === "emp" ? "연봉 − 근로소득공제 − 국민연금·건강·고용보험료(법정 요율) − 본인 기본공제 150만" : "공적연금 − 연금소득공제 − 본인 기본공제 150만") + "으로 계산 = 다른 공제가 하나도 없을 때의 값 · 부양가족·카드 등 공제가 더 있으면 세금은 더 적음 → 원천징수영수증의 과세표준을 「과세표준」 칸에 넣으면 정확"),
          "국내 회사 배당은 2,000만 초과분에 10%를 더해(Gross-up · §17③) 계산한 뒤 같은 금액을 세액공제(§56) — 「국내 회사 주식 배당」 칸에 넣은 금액만 반영 · 2,000만은 이자·ETF 분배금부터 채운다고 봄",
          "해외 주식 배당은 현지에서 뗀 세금(미국 15%)을 외국납부세액으로 빼 줌 — 여기서는 국내와 같이 15.4%를 뗐다고 봄",
          "고배당 분리과세: 2,000만 이하 14% · 3억 이하 20% · 50억 이하 25% · 초과 30% · 신청하면 그 배당은 2,000만 판정에서도 빠짐 · 2026년 1월 1일 이후 받은 배당부터(한시) · 고배당기업 여부는 거래소 KIND 공시 (국세청 2026.3.9)",
          "건보료율 7.19% + 장기요양(0.9448% ÷ 7.19% = 건보료의 약 13.14%) · 이자·배당은 1,000만 초과 시 전액 · 공적연금은 자격 판정 100%, 보험료 계산 50%(시행규칙 §44) · 월 상한 4,591,740원 · 지역 최저 20,160원(소득월액 28만 이하)",
          "재산분(시행령 별표 4): (재산세 과세표준 − 1억) → 60등급 점수 × 211.5원 · 전월세는 (보증금+월세×40)×30%를 재산으로 봄(여기서는 넣은 과세표준만)",
          "피부양자(시행규칙 별표 1의2): 소득 합계 2,000만 이하 · 재산 과표 5.4억 이하(9억 이하는 소득 1,000만 이하) · 부부 모두 충족 · 사업소득 요건(등록 시 1원 · 미등록 500만 초과 · 주택임대는 금액 무관)은 따로 확인",
          "건보료는 올해 소득이 내년 11월 ~ 그다음 해 10월 보험료에 반영됨(시행령 §41)"]);
        return h; } },

    { k: "pen", ic: "🏦", t: "연금 세액공제", d: "연금저축·IRP 넣으면 얼마 환급",
      segs: [{id: "who", label: "소득 종류", opts: [["emp", "근로자"], ["biz", "사업자·기타"]]}],
      fields: [
        {id: "wage", label: "연봉(총급여)", sub: "세전", req: 1, ph: "예: 7000", on: function(v){ return v.who !== "biz"; }},
        {id: "inc", label: "종합소득금액", sub: "수입 − 경비", req: 1, ph: "예: 6000", on: function(v){ return v.who === "biz"; }},
        {id: "save", label: "연금저축 올해 넣은(넣을) 돈", ph: "예: 400"},
        {id: "irp", label: "IRP 올해 넣은(넣을) 돈", sub: "본인 추가 납입분 · DC 추가 납입 포함", ph: "예: 0"},
        {id: "isa", label: "ISA 만기 → 연금으로 옮긴 돈", ph: "선택", adv: 1},
        {id: "det", label: "작년 결정세액(소득세)", sub: "원천징수영수증 · 알면 직접", ph: "선택", adv: 1}
      ],
      run: function(v){
        var P = LAW.pen, emp = v.who !== "biz", w = emp ? (v.wage || 0) : (v.inc || 0); if (!w) return null;
        var s = v.save || 0, ir = v.irp || 0, isa = v.isa || 0, rate = (emp ? w <= P.wageLine : w <= P.incLine) ? P.hiRate : P.loRate;
        var sOk = Math.min(s, P.save), base = Math.min(sOk + ir, P.all), isaOk = Math.min(isa * P.isaRate, P.isaMax), tot = base + isaOk, back = tot * rate, room = P.all - base, lost = s - sOk;
        /* 낸 세금(결정세액)보다 많이는 못 돌려받음 — 근로자만 어림 */
        var cap = null; if (emp){ var b0 = Math.max(0, w - wageDed(w) - ins4(w) - 150), c0 = itax(b0), wc = Math.min(c0 <= 130 ? c0 * .55 : 71.5 + (c0 - 130) * .3, w <= 3300 ? 74 : w <= 7000 ? Math.max(66, 74 - (w - 3300) * .008) : w <= 12000 ? Math.max(50, 66 - (w - 7000) * .5) : Math.max(20, 50 - (w - 12000) * .5));
          cap = Math.max(0, c0 - wc) * LAW.local; }
        if (v.det) cap = v.det * LAW.local;
        var real = cap != null ? Math.min(back, cap) : back, cut = cap != null && back > cap + 0.05;
        var h = big("돌려받는 세금", won(real), "공제 대상 " + won(tot) + " × " + pct(rate) + (isaOk ? " (ISA 전환분 " + won(isaOk) + " 포함)" : "") + (cut ? " = " + won(back) + "이지만 낸 세금이 그보다 적음" : ""), real > 0 ? "ok" : "");
        if (cut) h += '<p class="tx-n tx-w">⚠ ' + (v.det ? '넣은 결정세액 기준으로 1년에 내는 세금이 ' + won(cap) + '(지방소득세 포함)이라 그 이상은 못 돌려받음.' : '이 연봉에서 1년에 내는 세금은 많아야 ' + won(cap) + ' — 그 이상은 못 돌려받음. 부양가족·카드 공제가 있으면 더 적으니 원천징수영수증의 「결정세액」을 「더 정확하게」에 넣어 확인.') + ' 공제 못 받은 납입액은 다음 해로 넘겨 공제받거나 나중에 세금 없이 찾을 수 있음</p>';
        h += '<div class="tx-lim"><div class="tx-lt"><u style="width:' + (base / P.all * 100).toFixed(1) + '%"></u><i style="left:' + (P.save / P.all * 100).toFixed(1) + '%"><em>연금저축만 600만</em></i></div><p>한도 900만 중 <b>' + won(base) + '</b> 채움' + (room > 0 ? ' · <b class="tx-a">' + won(room) + '</b> 더 넣을 수 있음' : ' · 한도 다 채움') + '</p></div>';
        if (room > 0 && !cut){ var more = cap != null ? Math.min(back + room * rate, cap) : back + room * rate;
          h += bars([["지금", real], ["한도까지 채우면", more, null, 1]]) + '<p class="tx-n">' + won(room) + ' 더 넣으면 <b class="tx-a">' + won(more - real) + '</b> 더 돌려받음 (12월 31일 입금분까지)' + (cap != null && back + room * rate > cap + 0.05 ? ' — 낸 세금 한도(약 ' + won(cap) + ')에 걸려 다 채워도 여기까지' : '') + '</p>'; }
        h += tips("체크", [
          lost > 0 ? "연금저축 " + won(s) + " 중 <b>600만 넘는 " + won(lost) + "은 공제 안 됨</b> — 그만큼은 IRP로 넣어야 공제됨" : "",
          emp && w > P.wageLine && w <= P.wageLine * 1.06 ? "연봉이 5,500만을 조금 넘어 공제율이 13.2% — 5,500만 이하면 16.5%" : "",
          "맞벌이는 <b>공제율 16.5%인 쪽(연봉 5,500만 이하)</b>이 넣는 게 유리 — 단, 낸 세금이 충분한지 먼저 확인",
          !isa ? "ISA 만기 자금을 60일 안에 연금계좌로 옮기면 옮긴 돈의 10%(최대 300만)를 한도와 별도로 더 공제" : "",
          "받을 때는 연금소득세 3.3~5.5% — 지금 13.2~16.5% 돌려받고 나중에 낮은 세율로 내는 구조 · 55세 전에 깨면 16.5%"]);
        h += basis(["공제율(소득세법 §59의3): 총급여 5,500만 이하(근로소득만) · 종합소득금액 4,500만 이하 15% · 초과 12% — 지방소득세 10%를 더해 16.5% · 13.2%",
          "한도: 연금저축 600만 · IRP 합쳐 900만 · 넣는 것 자체는 연 1,800만까지",
          v.det ? "낸 세금 한도 = 넣은 결정세액 " + won(v.det) + " + 지방소득세 10%" : emp ? "낸 세금 한도(" + won(cap) + ") = 연봉 − 근로소득공제(§47) − 국민연금·건강·고용보험료(법정 요율) − 본인 기본공제 150만 → 산출세액 − 근로소득세액공제(§59) · 다른 공제가 하나도 없을 때의 최대치 · 실제는 원천징수영수증 「결정세액」" : "사업자는 낸 세금(결정세액) 한도를 넣은 값으로만 봄 — 종합소득세 결정세액보다 많이는 못 돌려받음",
          "회사가 넣어 주는 퇴직연금(DB·DC 회사 부담분)은 해당 없음"]);
        return h; } },

    { k: "ret", ic: "🧳", t: "퇴직소득세", d: "한 번에 vs 연금 · 중간정산 합산",
      segs: [{id: "mid", label: "퇴직금 중간정산 받은 적", opts: [["n", "없음"], ["y", "있음"]]}],
      fields: [
        {id: "pay", label: "퇴직금", sub: "이번에 받는 돈 · 세전 · 명예퇴직금·위로금 포함", req: 1, ph: "예: 30000"},
        {id: "yrs", label: "근속연수", unit: "년", req: 1, ph: "예: 25", max: 60, on: function(v){ return v.mid !== "y"; }},
        {id: "yrs2", label: "중간정산 다음 날부터 근속", sub: "1년 안 되는 달은 1년으로", unit: "년", req: 1, ph: "예: 10", max: 60, on: function(v){ return v.mid === "y"; }},
        {id: "mpay", label: "중간정산 때 받은 퇴직금", sub: "원천징수영수증 「퇴직급여」", req: 1, ph: "예: 16000", on: function(v){ return v.mid === "y"; }},
        {id: "myr", label: "중간정산 때 근속연수", sub: "원천징수영수증 「근속연수」", unit: "년", req: 1, ph: "예: 23", max: 60, on: function(v){ return v.mid === "y"; }},
        {id: "mtax", label: "중간정산 때 낸 퇴직소득세", sub: "원천징수영수증 「퇴직소득세」 · 지방소득세 빼고 · 홈택스 지급명세서에도 있음", req: 1, ph: "예: 492", on: function(v){ return v.mid === "y"; }},
        {id: "mon", label: "입사일 ~ 퇴직일 전체 개월 수", sub: "두 기간이 겹치거나 끊긴 달이 있으면 · 겹친 달은 한 번만", unit: "개월", ph: "선택", max: 720, adv: 1, on: function(v){ return v.mid === "y"; }},
        {id: "span", label: "연금으로 나눠 받을 기간", unit: "년", ph: "기본 20", max: 50},
        {id: "ror", label: "IRP 예상 수익률", sub: "1년 · 넣으면 원금이 빨리 나오는 것까지 계산", unit: "%", ph: "선택", max: 15, adv: 1}
      ],
      run: function(v){
        var mid = v.mid === "y", p = v.pay || 0, n = Math.ceil((mid ? v.yrs2 : v.yrs) || 0); if (!p || !n) return null;
        var mp = v.mpay || 0, my = Math.ceil(v.myr || 0), mt = v.mtax || 0; if (mid && (!mp || !my || !v.mtax)) return null;
        var Y = Math.max(1, Math.round(v.span || 20)), r = (v.ror || 0) / 100;
        /* 퇴직소득세(국세 · 만원) — 소득세법 §48·§55 · 국세청 「퇴직소득세 계산방법」(2020년 이후 퇴직 · 근속연수공제는 2023년 이후 표) */
        function rt(pp, nn){ var a = nn <= 5 ? 100 * nn : nn <= 10 ? 500 + 200 * (nn - 5) : nn <= 20 ? 1500 + 250 * (nn - 10) : 4000 + 300 * (nn - 20), c = Math.max(0, pp - a) * 12 / nn,
            b = c <= 800 ? c : c <= 7000 ? 800 + (c - 800) * .6 : c <= 10000 ? 4520 + (c - 7000) * .55 : c <= 30000 ? 6170 + (c - 10000) * .45 : 15170 + (c - 30000) * .35, q = Math.max(0, c - b);
          return {d1: a, conv: c, d2: b, base: q, t: itax(q) * nn / 12, n: nn, p: pp}; }
        var R = rt(p, n), M = null, N = 0, addT = 0, useM = false;
        if (mid){ N = v.mon ? Math.ceil(v.mon / 12) : n + my;   // 정산 근속 = 두 근속 월수 합 − 중복 월수 (1년 미만 올림) — 시행령 §203 · 국세청 「퇴직소득 세액정산」
          M = rt(p + mp, N); addT = Math.max(0, M.t - mt); useM = addT < R.t - 0.0005; }
        var tax = (useM ? addT : R.t) * LAW.local, d1 = (useM ? M : R).d1, conv = (useM ? M : R).conv, d2 = (useM ? M : R).d2, base = (useM ? M : R).base;
        function keep(k){ for (var j = 0; j < LAW.ret.keep.length; j++) if (k <= LAW.ret.keep[j][0]) return LAW.ret.keep[j][1]; return .5; }
        /* yy년 동안 매년 같은 금액을 받는다고 보고 한 해씩 계산: 퇴직금 원금이 먼저 나옴 · 10년째까지는 연금수령한도(잔액÷(11−연차)×120%) 안만 감면 · 한도 넘는 부분은 감면 없음 */
        function sim(yy){ var bal = p, pr = p, t = 0, A = r > 0 ? p * r / (1 - Math.pow(1 + r, -yy)) : p / yy, done = 0, xs = 0;
          for (var k = 1; k <= yy && bal > 0.001; k++){ var wd = k === yy ? bal : Math.min(A, bal), lim = k <= 10 ? bal / (11 - k) * 1.2 : Infinity, q = Math.min(wd, lim);
            var a = Math.min(pr, q); t += tax * a / p * keep(k); pr -= a;
            var b = Math.min(pr, wd - q); if (b > 0.001){ t += tax * b / p; pr -= b; xs += b; }
            if (pr <= 0.001 && !done) done = k;
            bal = (bal - wd) * (1 + r); }
          return {tax: t, done: done || yy, A: A, xs: xs}; }
        var rows = [["한 번에 받기", tax, null, 0]], seen = {}, S = sim(Y);
        [10, 20, 30, Y].sort(function(a, b){ return a - b; }).forEach(function(y){ if (seen[y]) return; seen[y] = 1; rows.push([y + "년 연금", y === Y ? S.tax : sim(y).tax, null, 0]); });
        var mn = rows.reduce(function(a, x){ return x[1] < a[1] ? x : a; }, rows[0]); mn[3] = 1;
        /* 11/17 사용자 「퇴직소득세 항목에서 금액·세율 순이 아니라 반대로 — 세율을 더 강조」 → 이번 퇴직금 대비 실효세율을 크게, 금액은 작게 */
        function er(t){ var x = p ? t / p : 0; return pct(x, x > 0 && x < .01 ? 2 : 1); }
        function rw(t){ return er(t) + ' <small class="tx-am">' + won(t) + '</small>'; }
        rows.forEach(function(x){ x[2] = rw(x[1]); });
        var h = "";
        if (mid){ var sepT = R.t * LAW.local, mrgT = addT * LAW.local, gap = sepT - mrgT;
          h += big((useM ? "합산 특례 세율" : "이번 퇴직금 세율") + " · 실효", er(tax), "세금 " + won(tax) + (useM ? " · 따로 계산하면 " + er(sepT) + "(" + won(sepT) + ") → " + er(gap) + "p 낮춤 · " + won(gap) + " 덜 냄" : " · 합산 특례가 오히려 불리 — 따로 계산이 유리"), tax > 0 ? "bad" : "ok") +
            bars([["따로 계산 (중간정산 뒤 " + n + "년만)", sepT, rw(sepT), !useM], ["합산 특례 (" + N + "년 · 퇴직금 " + won(p + mp) + ")", mrgT, rw(mrgT), useM]]) +
            '<p class="tx-n">합산 특례: 두 퇴직금을 합쳐 ' + N + '년으로 계산한 세금 ' + won(M.t * LAW.local) + ' − 중간정산 때 낸 ' + won(mt * LAW.local) + '(지방소득세 포함) = ' + won(mrgT) + '</p>';
          if (M.t < mt - 0.05) h += '<p class="tx-n tx-s">합쳐 계산한 세금이 그때 낸 세금보다 적어도 차액은 돌려받지 못함(추가 0원) — 중간정산금을 IRP로 옮겨 세금을 미뤄 둔 경우만 일부 환급(시행령 §203②)</p>';
          if (useM) h += '<p class="tx-n">회사에 <b>중간정산 때 원천징수영수증을 내며 정산을 요청</b>해야 적용 — 안 내면 회사는 따로 계산으로 뗌 (소득세법 §148)</p>';
          h += '<p class="tx-sec">이번 퇴직금 ' + won(p) + ' — 한 번에 vs 연금</p>'; }
        h += big((mid ? "한 번에 받으면" : "한 번에 받으면 세율") + " · 실효", er(tax), "세금 " + won(tax) + " · 실제 받는 돈 " + won(p - tax), tax > 0 ? "bad" : "ok");
        if (tax > 0.05){ h += bars(rows) + '<p class="tx-n">IRP로 옮겨 ' + Y + '년 동안 나눠 받으면 세율 <b class="tx-a">' + er(tax) + ' → ' + er(S.tax) + '</b> (' + pct(1 - S.tax / tax, 0) + ' 감면) — 세금 ' + won(S.tax) + ', ' + won(tax - S.tax) + ' 덜 냄</p>';
          h += '<p class="tx-n">세전 연 ' + won(S.A) + ' · 월 ' + won(S.A / 12) + ' 꼴' + (r > 0 ? ' (수익률 ' + pct(r) + ' 가정)' : ' (운용 수익 빼고)') + '</p>';
          if (S.xs > 0.05) h += '<p class="tx-n tx-w">⚠ ' + Y + '년은 너무 짧음 — 처음 10년은 해마다 찾을 수 있는 한도가 있어 넘는 ' + won(S.xs) + '은 감면을 못 받음. 한도 안에서만 받으려면 10년 이상으로</p>';
          if (r > 0 && S.done < Y) h += '<p class="tx-n">퇴직금 원금은 <b>' + S.done + '년째</b>에 다 나옴 — 그 뒤 ' + (Y - S.done) + '년은 운용 수익을 받는 것이라 연금소득세(3.3~5.5%)가 붙고 <b>연 1,500만 계산에 들어감</b></p>'; }
        else h += '<p class="tx-n">근속연수 공제가 커서 세금이 거의 없음 — 한 번에 받아도 부담 없음</p>';
        h += tips("체크", [
          tax > 0.05 ? "받는 연차가 길수록 유리 — 1~10년째 30% · 11~20년째 40% · <b>21년째부터 50%</b> 감면(2026년 수령분부터)" : "",
          tax > 0.05 ? "연차는 <b>실제로 받은 해</b>만 셈 — 55세에 최소 금액이라도 받기 시작하면 연차가 먼저 쌓임" : "",
          tax > 0.05 ? "IRP로 옮기면 세금을 나중에 내므로 <b>세금 낼 돈까지 굴릴 수 있음</b> (과세이연) · 받은 뒤 60일 안에 넣어도 됨" : "",
          "55세 이후 · 연금수령한도 안에서 받아야 감면 — 중간에 한꺼번에 찾으면 남은 세금을 그때 다 냄",
          "퇴직금 원금으로 받는 연금은 <b>연 1,500만 한도와 상관없고</b> 금융소득·건보료에도 안 잡힘 — 운용 수익과 세액공제 받은 돈은 한도에 들어가니 계좌를 따로 두면 관리가 쉬움"]);
        h += basis([(mid ? (useM ? "합산 특례로 계산(퇴직금 " + won(p + mp) + " · " + N + "년) — " : "따로 계산(퇴직금 " + won(p) + " · " + n + "년) — ") : "") + "2023년 이후 퇴직 기준(소득세법 §48 · 국세청 퇴직소득세 계산방법) — 근속연수공제 " + won(d1) + " → 환산급여 " + won(conv) + " → 환산급여공제 " + won(d2) + " → 과세표준 " + won(base),
          mid ? "중간정산 뒤 퇴직하면 근속연수는 중간정산 다음 날부터 셈(국세청 원천세과-233) · 합산 특례(소득세법 §148·시행령 §203): 이미 받은 퇴직금과 합쳐 세금을 다시 계산한 뒤 그때 낸 세금을 뺌 · 정산 근속 = 두 근속 월수 합 − 겹친 월수(1년 미만 올림)" + (v.mon ? "" : " — 여기서는 두 근속연수를 더함(각각 올림한 연수라 실제보다 최대 1년 길 수 있음 → 「더 정확하게」에 전체 개월 수)") : "",
          mid ? "중간정산 때 낸 세금은 넣은 값(당시 세법) 그대로 빼고, 합산 세금은 지금 세법(2023년 이후 근속연수공제)으로 계산 · 명예퇴직금처럼 처음 입사일부터 근속을 세는 퇴직금이 섞이면 겹친 기간 처리가 달라짐(국세청 서면1팀-510)" : "",
          "세액 = 과세표준 × 기본세율(6~45%) × 근속연수 ÷ 12 · 지방소득세 10% 포함 · 근속 1년 미만은 1년으로 올림",
          "연금 수령: 해마다 같은 금액 · 연금 계좌에서는 세액공제 안 받은 돈 → 퇴직금 → 세액공제 받은 돈·수익 순서로 나옴 · IRP에 퇴직금만 있다고 봄",
          "연금수령한도(시행령 §40의2) = 그해 1월 1일 계좌 평가액 ÷ (11 − 연금수령연차) × 120% · 11년차부터 한도 없음 · 한도 연차는 55세 이후 「받을 수 있게 된 해」부터 안 받아도 올라감(2013년 3월 전 계좌는 6년차부터) — 여기서는 받기 시작한 해를 1년차로 봄(가장 불리한 경우)",
          "감면 70·60·50%는 「실제로 받은 해」만 세는 연차 기준(국세청 연금소득 원천징수 방법 · 20년 초과 50%는 2026.1.1 이후 수령분)",
          "IRP 운용 수익에 붙는 세금과 수수료는 뺐음 · 임원 퇴직금 한도 초과분·비과세 퇴직급여는 안 넣음"].filter(Boolean));
        return h; } },

    { k: "pay", ic: "👵", t: "연금 받을 때 세금", d: "1,500만 선 · 얼마씩 받을까",
      segs: [{id: "life", label: "받는 방식", opts: [["n", "기간 정해서"], ["y", "종신형"]]}],
      fields: [
        {id: "age", label: "받는 나이", unit: "세", req: 1, ph: "예: 60", max: 110},
        {id: "amt", label: "연금저축·IRP에서 받는 돈", sub: "1년 · 세액공제 받은 돈+수익 · 퇴직금 원금은 빼고", req: 1, ph: "예: 1800"},
        {id: "pen", label: "국민연금 등 공적연금", sub: "1년", ph: "선택", adv: 1},
        {id: "oth", label: "그 밖의 소득", sub: "사업·임대·근로 소득금액", ph: "선택", adv: 1}
      ],
      run: function(v){
        var P = LAW.pay, age = v.age || 0, A = v.amt || 0; if (!age || !A) return null;
        var pub = v.pen || 0, oth = v.oth || 0, r = P.r[0][1];
        for (var i = 0; i < P.r.length; i++) if (age < P.r[i][0]){ r = P.r[i][1]; break; }
        if (v.life === "y") r = Math.min(r, P.life);
        var h = "", low = Math.min(A, P.line) * r;
        if (age < 55) h += '<p class="tx-n tx-w">⚠ 55세 전에는 연금으로 못 받음 — 찾으면 기타소득세 16.5%</p>';
        if (A <= P.line){
          h += big("연금 세금", won(A * r), pct(r) + "만 떼고 끝 · 실제 받는 돈 월 " + won((A - A * r) / 12), "ok") +
            '<div class="tx-lim"><div class="tx-lt"><u style="width:' + (A / P.line * 100).toFixed(1) + '%"></u></div><p>1,500만 선까지 <b>' + won(P.line - A) + '</b> 남음 (월 ' + won(P.line / 12) + '까지 낮은 세율)</p></div>';
        } else {
          var b0 = Math.max(0, pub - penDed(pub) + oth - 150), b1 = Math.max(0, pub + A - penDed(pub + A) + oth - 150);
          var sep = A * P.sep, tot = (itax(b1) - itax(b0)) * LAW.local, best = Math.min(sep, tot);
          h += big("연금 세금", won(best), "1,500만을 " + won(A - P.line) + " 넘어 낮은 세율(" + pct(r) + ")을 못 씀 · " + (tot < sep ? "종합과세" : "16.5% 분리과세") + "가 유리", "bad");
          h += bars([["16.5% 분리과세", sep, null, sep <= tot], ["종합과세(다른 소득과 합산)", tot, null, tot < sep], ["1,500만까지만 받으면", low, null, 0]]);
          h += '<p class="tx-n">연 1,500만(월 125만)까지만 받으면 세금 ' + won(low) + ' — 지금보다 <b class="tx-a">' + won(best - low) + '</b> 덜 냄</p>';
          if (!pub && !oth) h += '<p class="tx-n tx-s">다른 소득이 없다고 본 값 — 국민연금·임대소득 등이 있으면 「더 정확하게」에 넣어야 종합과세 쪽이 맞게 나옴</p>';
        }
        h += tips("체크", [
          A > P.line ? "<b>1원이라도 넘으면 전액</b>이 높은 세율 — 받는 기간을 늘려 연 1,500만 이하로 맞추기" : "",
          "1,500만은 <b>연금저축·IRP 여러 계좌를 다 합쳐서</b> 셈 — 퇴직금 원금·세액공제 안 받은 원금·국민연금은 빠지고, 퇴직금을 굴려 생긴 수익은 들어감",
          v.life !== "y" && age < 80 ? "종신형으로 계약하면 나이와 상관없이 3.3% (2026년 수령분부터)" : "",
          age < 70 ? "늦게 받을수록 세율이 내려감 — 70세부터 4.4% · 80세부터 3.3%" : "",
          "해마다 찾을 수 있는 한도(연금수령한도)를 넘겨 찾은 돈은 연금이 아니라 <b>기타소득 16.5%</b>",
          "연금 받는 분이 <b>자녀의 부양가족 공제 대상</b>이면 종합과세를 고르지 말 것 — 분리과세로 끝내야 공제가 유지됨(종합과세면 연 약 517만 초과 수령 시 탈락)",
          "연금저축·IRP 연금은 지금은 건보료가 안 붙음(공적연금만 반영) — 제도가 바뀔 수 있음"]);
        h += basis(["사적연금(연금저축·IRP 중 세액공제 받은 돈과 운용 수익) 연 1,500만 이하(소득세법 §14③9): 70세 미만 5% · 80세 미만 4% · 80세 이상 3% · 종신형 3%(2026.1.1 이후 수령분) — 지방소득세 10%를 더해 5.5 · 4.4 · 3.3% · 겹치면 낮은 쪽",
          "1,500만 초과(§64의4): 전액을 15%(지방소득세 포함 16.5%) 분리과세 또는 종합과세 중 선택 — 종합과세는 연금소득공제(공적+사적 합쳐 최대 900만)와 본인 기본공제 150만만 반영한 어림",
          "국민연금은 2002년 이후 낸 보험료에서 나온 부분만 과세 대상 — 넣은 금액 전부를 과세 대상으로 보고 계산(보수적)",
          "의료비 등 부득이한 사유로 찾는 돈은 한도와 상관없이 3.3~5.5%"]);
        return h; } },

    { k: "ovs", ic: "🌎", t: "해외주식 양도세", d: "올해 얼마 · 손실로 줄이기",
      fields: [
        {id: "gain", label: "올해 판 종목의 이익 합계", sub: "원화 기준 · 수수료 뺀 뒤", req: 1, ph: "예: 3000"},
        {id: "loss", label: "올해 판 종목의 손실 합계", ph: "예: 500"},
        {id: "un", label: "아직 안 판 종목의 평가손실", sub: "연말 전에 팔 수 있는 것", ph: "선택"},
        {id: "ria", label: "그중 RIA 계좌에서 판(팔) 이익", sub: "국내시장 복귀계좌 · 2026년만", ph: "선택", adv: 1}
      ],
      run: function(v){
        var L = LAW.ovs, g = v.gain || 0; if (!g) return null;
        var l = Math.abs(v.loss || 0), u = Math.abs(v.un || 0), ria = Math.min(v.ria || 0, g), cut = ria * L.ria, net = g - l;
        var tax0 = Math.max(0, net - L.ded) * L.rate, tax = Math.max(0, net - cut - L.ded) * L.rate, tax2 = Math.max(0, net - u - cut - L.ded) * L.rate, riaOn = Date.now() < Date.UTC(2026, 11, 31, 15);
        var h = big("내년 5월에 낼 세금", won(tax), tax > 0 ? "순이익 " + won(net) + (cut ? " − RIA 공제 " + won(cut) : "") + " − 기본공제 250만 = " + won(net - cut - L.ded) + " × 22%" : "순이익 " + won(net) + (cut ? " − RIA 공제 " + won(cut) : "") + " — 250만 공제 안이라 세금 없음 (신고는 해야 함)", tax > 0 ? "bad" : "ok");
        if (cut > 0 && tax0 > tax) h += bars([["RIA 없이", tax0], ["RIA 공제 반영", tax, null, 1]]) + '<p class="tx-n">RIA 계좌에서 판 이익 ' + won(ria) + '의 50%를 공제받아 <b class="tx-a">' + won(tax0 - tax) + '</b> 덜 냄 — 판 돈을 1년간 RIA 안에서 국내 주식·펀드에 둬야 유지됨</p>';
        if (u > 0 && tax > 0) h += bars([["지금대로", tax], ["손실 종목도 팔면", tax2, null, 1]]) + '<p class="tx-n">평가손실 ' + won(u) + '을 올해 안에 팔아 확정하면 <b class="tx-a">' + won(tax - tax2) + '</b> 덜 냄 — 다시 사도 됨</p>';
        else if (tax > 0) h += '<p class="tx-n">손실 난 해외 종목이 있다면 올해 안에 팔아 이익과 상계 — 손실 100만마다 세금 22만 줄어듦</p>';
        else if (net - cut < L.ded && net > 0) h += '<p class="tx-n">공제가 <b class="tx-a">' + won(L.ded - (net - cut)) + '</b> 남음 — 이익 난 종목을 그만큼 팔았다 다시 사면 취득가를 세금 없이 높일 수 있음</p>';
        h += tips("체크", [
          "<b>결제일 기준</b> — 12월 마지막 주에 판 건 내년으로 넘어갈 수 있음 · 나라마다 마감일이 다르니 증권사 공지 확인",
          riaOn && !ria && tax > 0 ? "<b>RIA(국내시장 복귀계좌)</b>: 2025년 12월 23일에 갖고 있던 해외주식을 RIA로 옮겨 12월 31일(결제)까지 팔면 그 이익의 50% 공제 — 매도금액 5,000만 한도 · 판 돈은 1년간 국내 주식·펀드 · 다른 계좌에서 해외주식을 새로 사면 그만큼 깎임" : "",
          "250만 공제는 <b>1년에 한 번 · 사람마다</b> — 해외주식·국내 과세 주식(대주주·장외) 합쳐서",
          "배우자·자녀 계좌에서 판 이익(손실 뺀 뒤)이 <b>100만을 넘으면 연말정산 부양가족 공제에서 빠짐</b> — 250만이 아니라 100만이 기준",
          tax > 0 ? "배우자에게 증여(10년 6억 공제) 뒤 팔기는 <b>1년 넘게 가진 뒤 팔아야</b> 효과 있음 (2025년 증여분부터)" : "",
          "양도세는 금융소득 2,000만·건보료 계산에 안 들어감 · 배당은 따로 과세(미국 15% 현지 원천징수 · 금융소득에 포함)"]);
        h += basis(["세율 22% = 양도소득세 20% + 지방소득세 2% · 기본공제 연 250만(소득세법 §118의7)",
          "같은 해 해외주식끼리 이익·손실 합산 · 손실은 다음 해로 못 넘김",
          "이익은 판 날·산 날 각각의 환율로 원화 환산한 차이 — 환율이 올라 생긴 이익도 과세 · 같은 종목을 나눠 샀으면 증권사 방식(선입선출·이동평균)에 따라 이익이 달라짐",
          "RIA(조특법 §91의26): 공제액 = RIA 안 양도소득 × 공제율(결제일 5/31까지 100% · 7/31까지 80% · 12/31까지 50%) × 조정비율(다른 계좌에서 해외주식을 순매수하면 줄어듦) — 여기서는 12월 50%·조정 없음으로 계산",
          "세금이 없어도 신고 대상 · 신고·납부를 안 하면 무신고·납부지연 가산세가 붙음",
          "국내 상장 해외 ETF는 양도세가 아니라 배당소득세(15.4%) — 이 계산기 대상 아님"]);
        return h; } },

    { k: "isa", ic: "🧺", t: "ISA 절세", d: "일반 계좌보다 얼마 아끼나",
      segs: [{id: "kind", label: "가입 유형", opts: [["n", "일반형"], ["s", "서민형·농어민"]]}],
      fields: [
        {id: "pf", label: "만기까지 예상 순이익", sub: "이자·배당·ETF 분배금·해외 ETF 차익 (손실 뺀 뒤)", req: 1, ph: "예: 1000"},
        {id: "mv", label: "만기 때 연금계좌로 옮길 돈", ph: "선택", adv: 1}
      ],
      run: function(v){
        var I = LAW.isa, p = v.pf || 0; if (!p) return null;
        var free = I.free[v.kind === "s" ? "s" : "n"], n = p * I.normal, t = Math.max(0, p - free) * I.rate, mv = v.mv || 0, cr = Math.min(mv * LAW.pen.isaRate, LAW.pen.isaMax);
        var h = big("ISA로 아끼는 세금", won(n - t), "일반 계좌 " + won(n) + " → ISA " + won(t), "ok") + bars([["일반 계좌 (15.4%)", n], ["ISA", t, null, 1]]);
        h += '<p class="tx-n">' + won(Math.min(p, free)) + '까지 세금 0' + (p > free ? ' · 넘는 ' + won(p - free) + '은 9.9%로 끝' : ' — 비과세 한도 ' + won(free - p) + ' 남음') + '</p>';
        if (cr > 0) h += '<p class="tx-n">만기에 ' + won(mv) + '을 연금계좌로 옮기면 <b class="tx-a">' + won(cr * LAW.pen.loRate) + '~' + won(cr * LAW.pen.hiRate) + '</b> 추가 환급 (옮긴 돈의 10% · 최대 300만 공제)</p>';
        h += tips("체크", [
          "ISA 안 수익은 <b>금융소득 2,000만·건보료 계산에서 빠짐</b> — 9.9% 떼고 끝",
          "이익과 손실을 <b>합쳐서</b> 순이익에만 과세 — 일반 계좌는 이익에만 과세",
          "국내 주식·국내 주식형 ETF 매매차익은 원래 세금이 없어 ISA 효과가 없음 — 배당·이자·해외 ETF·ELS 쪽이 효과 큼",
          "비과세 한도는 <b>계좌를 닫을 때 한 번</b> 적용 — 3년 채운 뒤 해지하고 다시 가입하면 한도를 또 쓸 수 있음",
          "3년은 채워야 혜택(그 전에 깨면 15.4%) · 넣은 원금까지는 중간에 찾아도 됨",
          "직전 3년 안에 금융소득종합과세 대상이었으면 가입 불가"]);
        h += basis(["비과세 한도(조특법 §91의18): 일반형 200만 · 서민형·농어민형 400만 · 초과분 9.9% 분리과세 (지방소득세 포함)",
          "납입 한도: 연 2,000만 · 총 1억 (안 쓴 한도는 다음 해로 넘어감)",
          "일반 계좌 세율은 15.4%로 봄 — 해외 ETF 분배금의 현지 세금은 따로",
          "2026년 세제개편안(국회 심의 중)이 통과되면 2027년부터 한도 이월 폐지 · 총 계약 5년 · 국내 투자용 「생산적 금융 ISA」(연 2,000만·총 2억 · 이자·배당 전액 비과세)가 따로 생김 — 확정되면 이 계산기에 반영",
          "서민형: 총급여 5,000만(종합소득 3,800만) 이하"]);
        return h; } }
  ];

  /* ───────── 화면 ───────── */
  var ST = {};   // 항목별로 넣은 값(메모리에만)
  CALCS.forEach(function(c){ ST[c.k] = {}; (c.segs || []).forEach(function(s){ ST[c.k][s.id] = s.opts[0][0]; }); });
  function sel(){ var k = ls("txsel"); return CALCS.filter(function(c){ return c.k === k; })[0] || null; }
  function pickHtml(c0){ return '<div class="tx-pick">' + CALCS.map(function(c){ return '<button type="button" data-txk="' + c.k + '" data-j="txform"' + (c0 && c0.k === c.k ? ' class="on"' : '') + '><span>' + c.ic + '</span><b>' + c.t + '</b><small>' + c.d + '</small></button>'; }).join("") + '</div>'; }
  function formHtml(c){ var v = ST[c.k];
    return head(c.ic + " " + c.t, LAW.asof) +
      (c.segs || []).map(function(s){ return '<div class="tx-seg" role="group" aria-label="' + s.label + '"><em>' + s.label + '</em><div>' + s.opts.map(function(o){ return '<button type="button" data-txs="' + s.id + '" data-v="' + o[0] + '"' + (v[s.id] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join("") + '</div></div>'; }).join("") +
      (function(){ var show = c.fields.filter(function(f){ return !f.on || f.on(v); }), adv = show.filter(function(f){ return f.adv; }), open = v._adv || adv.some(function(f){ return v[f.id]; });
        function one(f){ return '<label class="tx-f"><span>' + f.label + (f.req && !f.sub ? '' : '<small>' + (f.req ? '' : '<s>선택</s>') + (f.sub || '') + '</small>') + '</span><i><input data-txf="' + f.id + '" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" maxlength="' + (f.unit ? 3 : 10) + '" placeholder="' + e(f.ph || "") + '" value="' + (v[f.id] ? (f.unit ? v[f.id] : Number(v[f.id]).toLocaleString()) : "") + '"><em>' + (f.unit || "만원") + '</em></i></label>'; }
        return show.filter(function(f){ return !f.adv; }).map(one).join("") +
          (adv.length ? (open ? '<p class="tx-advh">더 정확하게 <small>아는 것만 넣으면 됨</small></p>' + adv.map(one).join("") : '<button type="button" class="tx-adv" data-txadv="1">＋ 더 정확하게 <small>' + adv.map(function(f){ return f.label.replace(/^그중 /, ""); }).join(" · ") + '</small></button>') : ''); })() +
      '<button type="button" class="tx-clr" data-txclr="1">입력 지우기</button>';
  }
  function outHtml(c){ var h = null; try { h = c.run(ST[c.k]); } catch(x){ console.error("tax", x); h = '<p class="tx-n">계산하지 못했어요 — 숫자를 다시 확인해 주세요</p>'; }
    if (h == null){ var vv = ST[c.k], need = c.fields.filter(function(f){ return f.req && (!f.on || f.on(vv)); }).map(function(f){ return f.label; });
      return '<p class="tx-wait"><b>' + need.join(" · ") + '</b>만 넣으면 바로 계산돼요<small>나머지는 넣을수록 정확해져요 · 단위는 만원</small></p>'; }
    return head("결과", "넣는 즉시 다시 계산") + h; }
  function view(){ var c = sel();
    return '<div id="tx" data-noemo="1"><section class="card hub-c no-clp" data-cz="done" data-xc="1">' + head("세무계산기", "항목을 고르고 숫자만 넣으면 끝") + pickHtml(c) + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txform"' + (c ? '' : ' hidden') + '>' + (c ? formHtml(c) : '') + '</section>' +
      '<section class="card hub-c no-clp" data-cz="done" data-xc="1" id="txout"' + (c ? '' : ' hidden') + '>' + (c ? outHtml(c) : '') + '</section>' +
      '<p class="hub-n">' + LAW.asof + ' · 세율·공제·한도는 법령·국세청·건강보험공단 원문과 대조한 값 (2026-11-16)<br>개인별 공제·세대 합산은 넣은 값만 반영 — 신고 전 세무사·홈택스·공단 확인 · 넣은 금액은 저장되지 않아요</p></div>'; }
  function paintOut(){ var c = sel(), o = D.getElementById("txout"); if (c && o){ o.hidden = false; o.innerHTML = outHtml(c); } }
  function paintForm(){ var c = sel(), f = D.getElementById("txform"); if (c && f){ f.hidden = false; f.innerHTML = formHtml(c); } paintOut(); }
  function choose(k, scroll){ ls("txsel", k);
    [].forEach.call(D.querySelectorAll("#tx [data-txk]"), function(b){ b.classList.toggle("on", b.dataset.txk === k); });
    paintForm();
    if (scroll){ var f = D.getElementById("txform"); try { f.scrollIntoView({behavior: "smooth", block: "start"}); } catch(x) {} } }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#tx [data-txk], #tx [data-txs], #tx [data-txclr], #tx [data-txadv]"); if (!t) return;
    var c = sel();
    if (t.dataset.txk){ choose(t.dataset.txk, true); return; }
    if (!c) return;
    if (t.dataset.txs){ ST[c.k][t.dataset.txs] = t.dataset.v; paintForm(); return; }
    if (t.dataset.txadv){ ST[c.k]._adv = 1; paintForm(); return; }
    if (t.dataset.txclr){ var keep = {}; (c.segs || []).forEach(function(s){ keep[s.id] = ST[c.k][s.id]; }); ST[c.k] = keep; paintForm(); }
  });
  D.addEventListener("input", function(ev){
    var t = ev.target; if (!t || !t.dataset || !t.dataset.txf || !t.closest("#tx")) return;
    var c = sel(); if (!c) return;
    var f = c.fields.filter(function(x){ return x.id === t.dataset.txf; })[0] || {};
    var raw = String(t.value).replace(/[０-９]/g, function(ch){ return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); }).replace(/[^0-9]/g, ""), n = raw ? parseInt(raw, 10) : 0;
    if (f.max && n > f.max) n = f.max;
    ST[c.k][f.id] = n;
    var show = raw ? (f.unit ? String(n) : n.toLocaleString()) : ""; if (t.value !== show) t.value = show;
    paintOut();
  });
  D.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && ev.target && ev.target.dataset && ev.target.dataset.txf) ev.target.blur(); });

  /* 화면 연결 (index.html go → hubView/hubInit) */
  var V0 = window.hubView, I0 = window.hubInit;
  window.hubView = function(key){ if (key === "tax") return view(); return V0 ? V0(key) : ""; };
  window.hubInit = function(key){ if (key === "tax") return; if (I0) I0(key); };
  window.__tax = {calcs: CALCS, state: ST, law: LAW, choose: choose};   // 점검용

  var st = D.createElement("style");
  st.textContent =
    "html[data-tab=tax] #main>.hero{display:none!important}" +
    ".tx-pick{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".tx-pick button{font:inherit;text-align:left;color:var(--text);background:transparent;border:1px solid var(--line);border-radius:14px;padding:11px 12px 10px;cursor:pointer;display:flex;flex-direction:column;gap:1px;min-width:0}" +
    ".tx-pick button:active{transform:scale(.98)}.tx-pick button.on{border-color:#3182f6;background:rgba(49,130,246,.10);box-shadow:inset 0 0 0 1px #3182f6}" +
    ".tx-pick span{font-size:20px;line-height:1.2}.tx-pick b{font-size:15px;font-weight:800;letter-spacing:-.3px;word-break:keep-all}.tx-pick small{font-size:12.5px;color:var(--sub);line-height:1.35;word-break:keep-all}" +
    ".tx-seg{margin:0 0 12px}.tx-seg>em{display:block;font-style:normal;font-size:13px;font-weight:700;color:var(--sub);margin:0 2px 6px}.tx-seg>div{display:flex;gap:6px}" +
    ".tx-seg button{flex:1 1 0;min-width:0;font:inherit;font-size:14.5px;font-weight:700;padding:10px 4px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);cursor:pointer;word-break:keep-all}" +
    ".tx-seg button.on{background:#3182f6;border-color:#3182f6;color:#fff}" +
    ".tx-f{display:grid;grid-template-columns:minmax(0,1fr) 142px;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}" +
    ".tx-f>span{font-size:15px;font-weight:700;line-height:1.35;word-break:keep-all;min-width:0}.tx-f>span small{display:block;font-size:12.5px;font-weight:500;color:var(--sub)}.tx-f>span s{text-decoration:none;font-size:11.5px;font-weight:600;border:1px solid var(--line);border-radius:6px;padding:0 5px;margin-right:5px;white-space:nowrap}" +
    ".tx-f>i{font-style:normal;display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:12px;padding:0 10px;min-width:0}.tx-f>i:focus-within{border-color:#3182f6}" +
    ".tx-f input{flex:1;min-width:0;width:100%;font:inherit;font-size:17px;font-weight:700;text-align:right;padding:11px 0;border:0;outline:0;background:transparent;color:var(--text);font-variant-numeric:tabular-nums}.tx-f input::placeholder{font-size:13px;font-weight:500;color:var(--sub);opacity:.7}" +
    ".tx-f>i em{font-style:normal;font-size:13px;color:var(--sub);white-space:nowrap}" +
    ".tx-adv{display:block;width:100%;font:inherit;font-size:14.5px;font-weight:700;text-align:left;color:#3182f6;background:transparent;border:0;border-top:1px solid var(--line);padding:13px 0 6px;cursor:pointer;word-break:keep-all}.tx-adv small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:2px;line-height:1.4}" +
    ".tx-advh{margin:0;padding:13px 0 8px;border-top:1px solid var(--line);font-size:14.5px;font-weight:800;color:#3182f6}.tx-advh small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".tx-s{font-size:13px!important;color:var(--sub)}" +
    ".tx-clr{display:block;margin:8px 0 0 auto;font:inherit;font-size:13px;color:var(--sub);background:transparent;border:0;text-decoration:underline;cursor:pointer;padding:8px 2px}" +
    ".tx-wait{margin:6px 0;font-size:15px;line-height:1.55;text-align:center;color:var(--sub);word-break:keep-all}.tx-wait b{color:var(--text)}.tx-wait small{display:block;font-size:12.5px;margin-top:4px}" +
    ".tx-sec{margin:18px 0 8px;font-size:13.5px;font-weight:800;color:var(--sub)}" +
    ".tx-big{border-radius:16px;padding:14px 16px;margin:0 0 10px;background:rgba(128,128,128,.10)}.tx-big small{display:block;font-size:13.5px;font-weight:700;color:var(--sub)}" +
    ".tx-big b{display:block;font-size:28px;font-weight:800;letter-spacing:-.6px;line-height:1.25;font-variant-numeric:tabular-nums;word-break:keep-all}.tx-big span{display:block;font-size:13.5px;color:var(--sub);line-height:1.5;margin-top:3px;word-break:keep-all}" +
    ".tx-big.tx-ok{background:rgba(49,130,246,.10)}.tx-big.tx-ok b{color:#3182f6}.tx-big.tx-bad{background:rgba(240,68,82,.10)}.tx-big.tx-bad b{color:#f04452}" +
    ".tx-bars{margin:12px 0 4px}.tx-b{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:baseline;margin:0 0 10px}.tx-b>span{font-size:13.5px;font-weight:600;color:var(--sub);word-break:keep-all}.tx-b>b{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".tx-b>i{grid-column:1/3;display:block;height:12px;border-radius:6px;background:rgba(128,128,128,.14);overflow:hidden}.tx-b>i u{display:block;height:100%;border-radius:6px;background:rgba(128,128,128,.55);text-decoration:none}" +
    ".tx-b>b .tx-am{font-size:12.5px;font-weight:600;color:var(--sub);margin-left:4px}.tx-b.tx-best>span{color:var(--text);font-weight:800}.tx-b.tx-best>b{color:#3182f6}.tx-b.tx-best>i u{background:#3182f6}" +
    ".tx-n{margin:6px 2px 10px;font-size:14.5px;line-height:1.55;word-break:keep-all}.tx-a{color:#3182f6}.tx-r{color:#f04452}.tx-w{color:#f04452;font-weight:700}" +
    ".tx-g{margin:4px 0 6px}.tx-gt,.tx-lt{position:relative;height:14px;border-radius:7px;background:rgba(128,128,128,.14);margin:26px 0 26px}.tx-lt{margin-top:6px}.tx-gt i.up em{top:auto;bottom:22px}" +
    ".tx-gt u,.tx-lt u{display:block;height:100%;border-radius:7px;background:#3182f6;text-decoration:none;max-width:100%}.tx-gt u.y{background:#f5a623}.tx-gt u.r{background:#f04452}" +
    ".tx-gt i,.tx-lt i{position:absolute;top:-3px;width:2px;height:20px;background:var(--text);opacity:.75}.tx-gt i em,.tx-lt i em{position:absolute;top:22px;left:50%;transform:translateX(-50%);font-style:normal;font-size:11.5px;font-weight:700;line-height:1.25;color:var(--sub);text-align:center;white-space:nowrap;opacity:1}" +
    ".tx-g p,.tx-lim p{margin:0 2px 4px;font-size:14.5px;line-height:1.5;word-break:keep-all}.tx-lim{margin:10px 0 6px}" +
    ".tx-th{margin:16px 0 4px;font-size:13.5px;font-weight:800;color:var(--sub)}.tx-tip{list-style:none;margin:0;padding:0}.tx-tip li{position:relative;padding:8px 0 8px 16px;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.55;word-break:keep-all}.tx-tip li:last-child{border-bottom:0}.tx-tip li:before{content:'';position:absolute;left:2px;top:17px;width:6px;height:6px;border-radius:50%;background:#3182f6}" +
    ".tx-base{margin:12px 0 0;border-top:1px solid var(--line)}.tx-base summary{font-size:13.5px;font-weight:700;color:var(--sub);padding:11px 2px 4px;cursor:pointer}.tx-base ul{margin:4px 0 0;padding:0 0 0 16px}.tx-base li{font-size:12.5px;color:var(--sub);line-height:1.55;margin:0 0 5px;word-break:keep-all}" +
    "@media (max-width:340px){.tx-seg button{font-size:13px;padding:10px 2px;white-space:nowrap;letter-spacing:-.5px}.tx-f{grid-template-columns:minmax(0,1fr) 118px}.tx-big b{font-size:24px}}";
  D.head.appendChild(st);
})();
;
__bk(86);
/* ======== ux1118.js ======== */
/* 🧊 11/18 냉정 분석 6차 「만드는 속도 vs 쓰이는 속도」 — 사용자 「1,2,3,4,5,6,7,8,14 진행해」
   새 화면은 없음(2주 동결) — 있는 것을 찾기 쉽게·다시 쓰기 쉽게만.
   ① 🆕 새로 생긴 것 (홈 · 최근 7일 추가 기능 3줄 · 누르거나 ✕ 하면 사라짐 · localStorage nw18)
   ② 📌 내 바로가기 4칸 (홈 맨 위 · 자주 연 화면이 저절로 · 길게 누르면 고정 · localStorage sc18)
   ③ 🗺 섹터 지도 미리보기 (홈 「할 수 있는 일」 첫 줄 — ux1112b.js mapHtml 이 __secTile() 을 부름)
   ⑥ 👀 제안서 「완성본 먼저」 · ⑦ 🔁 「지난번 그대로」 (제안서 맨 위 · propose.js __prop.sample/apply · localStorage pp_hist — 고객 이름은 이 휴대폰에만)
   ⑧ 🧾 세무계산기 결과 → 고객에게 한 장 (1080px 그림 · 받는 분·심의필 번호 칸 · localStorage tx_sim)
   ⑭ 💼 포트: 규칙·지금 판정 먼저, 성적은 접어 둠 (자동 검진 때는 펼친 채)
   ④ 재방문 측정은 usage.py(주 단위 익명 번호) · ⑭ 무게는 tools/bundle.py(묶음 나누기)·sw.js
   끄기: index.html 📦list 에서 이 줄을 빼고 ux1112b.js 의 11/18 줄을 되돌림 */
(function(){
  var D = document;
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function lj(k, d){ try { var v = JSON.parse(ls(k) || "null"); return v == null ? d : v; } catch(x){ return d; } }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function toast(m){ var d = D.createElement("div"); d.className = "ch-toast"; d.textContent = m; D.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2800); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function goTo(k){ if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); } }
  var AUTO = !!navigator.webdriver && ls("x18test") !== "1";   // 자동 검진(health.py·ui_audit)은 예전처럼 펼친 화면을 봄

  /* ═════════ ② 내 바로가기 4칸 ═════════ */
  var SCN = {market: ["🌐", "시황"], sector: ["🧭", "섹터 지도"], feed: ["📰", "피드"], send: ["📨", "한 장"], prop: ["📝", "제안서"], bond: ["🏦", "채권"], fund: ["📦", "펀드"], els: ["🎯", "ELS"],
    divc: ["💰", "배당비교"], onepager: ["🔍", "종목"], flow: ["🧲", "수급"], port: ["💼", "포트"], score: ["📊", "성적표"], sigall: ["🎯", "신호"], tax: ["🧾", "세금 계산"], diag: ["🩻", "포트 진단"],
    lab: ["🔬", "연구실"], luck: ["🔮", "운세"], prob: ["🎲", "오를 확률"], whale: ["🐋", "큰손"], cup: ["☕", "컵 차트"], gap: ["📈", "갭 상승"], screen: ["🔎", "종목 찾기"]};
  var SCDEF = ["sector", "divc", "prop", "tax"];
  function scGet(){ var o = lj("sc18", {}); if (!o || typeof o !== "object") o = {}; o.cnt = o.cnt || {}; o.pin = (o.pin || []).filter(function(k){ return SCN[k]; }).slice(0, 4); return o; }
  function scList(){ var o = scGet(), out = o.pin.slice();
    Object.keys(o.cnt).filter(function(k){ return SCN[k] && o.cnt[k] >= 2 && out.indexOf(k) < 0; }).sort(function(a, b){ return o.cnt[b] - o.cnt[a]; }).forEach(function(k){ if (out.length < 4) out.push(k); });
    SCDEF.forEach(function(k){ if (out.length < 4 && out.indexOf(k) < 0) out.push(k); });
    return {keys: out.slice(0, 4), pin: o.pin}; }
  var scLast = "";
  function scCount(){ var c = cur(); if (!c || c === scLast) return; scLast = c; if (c === "home" || !SCN[c] || AUTO) return; var o = scGet(); o.cnt[c] = Math.min(999, (o.cnt[c] || 0) + 1); ls("sc18", JSON.stringify(o)); }
  function scHtml(){ var L = scList();
    return '<p class="x18-h">내 바로가기 <small>자주 여는 화면이 저절로 · 길게 누르면 고정</small></p><div class="sc18-g">' + L.keys.map(function(k){
      return '<button type="button" data-sc18="' + k + '"' + (L.pin.indexOf(k) >= 0 ? ' class="pin"' : '') + '><span>' + SCN[k][0] + '</span><b>' + SCN[k][1] + '</b></button>'; }).join("") + '</div>'; }
  function scPin(k){ var o = scGet(), i = o.pin.indexOf(k);
    if (i >= 0){ o.pin.splice(i, 1); toast("고정을 풀었어요"); } else { if (o.pin.length >= 4) o.pin.pop(); o.pin.unshift(k); toast("📌 " + SCN[k][1] + " 고정했어요"); }
    ls("sc18", JSON.stringify(o)); homePaint(true); }
  var lpT = null, lpDone = false;
  D.addEventListener("pointerdown", function(ev){ var t = ev.target.closest && ev.target.closest("[data-sc18]"); if (!t) return; lpDone = false; clearTimeout(lpT);
    lpT = setTimeout(function(){ lpDone = true; try { navigator.vibrate && navigator.vibrate(12); } catch(x) {} scPin(t.dataset.sc18); }, 600); }, true);
  ["pointerup", "pointercancel", "pointerleave", "scroll"].forEach(function(n){ D.addEventListener(n, function(){ clearTimeout(lpT); }, true); });
  D.addEventListener("contextmenu", function(ev){ if (ev.target.closest && ev.target.closest("[data-sc18]")) ev.preventDefault(); });

  /* ═════════ ① 새로 생긴 것 ═════════ */
  var NEWS = [
    ["n1119a", "2026-11-19", "🌅", "아침 30초 — 카드 5장", "달라진 것 · 돈의 흐름 · 성향별 할 일 · 오늘 장 준비 (옆으로 넘기기)", "market"],
    ["n1119b", "2026-11-19", "🩻", "포트 진단 → 오늘 리포트 처방", "고객 포트를 넣으면 성향별로 줄일 몫·늘릴 칸을 PB용으로", "diag"],
    ["n1118a", "2026-11-18", "🧾", "세무계산기 → 연말 절세 한 장", "결과를 고객에게 그림 한 장으로", "tax"],
    ["n1118b", "2026-11-18", "📝", "제안서 — 완성본 먼저 · 지난번 그대로", "견본을 먼저 보고, 지난 제안서는 이름만 바꿔 다시", "prop"],
    ["n1117b", "2026-11-17", "🗓", "섹터 지도 1·3·6개월", "기간을 바꾸면 섹터 카드 전체가 같이 바뀜", "sector"],
    ["n1117c", "2026-11-17", "🏦", "포트 설계기 — 채권·종목 섞어 보기", "미국채·브라질국채·종목을 넣어 과거 성적 다시 계산", "@design"],
    ["n1117d", "2026-11-17", "💸", "연금·IRP 월 출금 계획", "제안서에 매달 꺼내 쓸 금액을 넣으면 계획표가 붙음", "prop"],
    ["n1116a", "2026-11-16", "🩻", "포트 진단 한 장", "고객 보유 종목 → 쏠림 · 배당 · 고점 대비", "diag"],
    ["n1116b", "2026-11-16", "🖼", "고객 질문 답을 그림 한 장으로", "「지금 팔아야 해요?」 답을 카톡 그림으로", "@qa"]
  ];
  function nwSeen(){ var o = lj("nw18", {}); return o && typeof o === "object" ? o : {}; }
  function nwList(){ var s = nwSeen(), lim = new Date(kst().getTime() - 7 * 864e5).toISOString().slice(0, 10);
    return NEWS.filter(function(n){ return n[1] >= lim && !s[n[0]]; }); }
  var nwAll = false;
  function nwHtml(){ var L = nwList(); if (!L.length) return "";
    var show = nwAll ? L : L.slice(0, 3);
    return '<p class="x18-h">새로 생긴 것 <small>' + L.length + '개 · 최근 7일</small><button type="button" class="nw18-x" data-nw18x="1" aria-label="다 봤어요">다 봤어요 ✕</button></p><div class="nw18-l">' + show.map(function(n){
      return '<button type="button" data-nw18="' + n[0] + '"><span>' + n[2] + '</span><b>' + e(n[3]) + ' <small>' + e(n[4]) + '</small></b><i>›</i></button>'; }).join("") +
      (L.length > show.length ? '<button type="button" class="nw18-m" data-nw18m="1">' + (L.length - show.length) + '개 더 ▾</button>' : '') + '</div>'; }
  function nwGo(id){ var n = NEWS.filter(function(x){ return x[0] === id; })[0]; if (!n) return;
    var s = nwSeen(); s[id] = 1; ls("nw18", JSON.stringify(s));
    var k = n[5];
    if (id === "n1118a") txIntent = 1;   // 🩹 11/18 절세 한 장 줄 → 세무 화면에 만드는 법 안내
    if (k === "@qa"){ if (window.__qaOpen) __qaOpen(); else goTo("send"); return; }
    if (k === "@design"){ goTo("port"); var c = 0; (function seek(){ var z = D.getElementById("podz"), more = D.getElementById("ezcapb");
      if (z && z.classList.contains("ez-cap-hid") && more) more.click();
      if (z && z.getBoundingClientRect().height > 0){ z.scrollIntoView({behavior: "smooth", block: "start"}); return; } if (++c < 30) setTimeout(seek, 300); })(); return; }
    goTo(k); }

  /* ═════════ ③ 섹터 지도 미리보기 (ux1112b.js mapHtml → __secTile) ═════════ */
  var SEC = null, SECT = 0;
  function secLoad(){ if (Date.now() - SECT < 300000 || !window.getJSON || typeof M === "undefined") return; SECT = Date.now();
    try { var it = ((M.cats && M.cats.sector) || [])[0]; if (!it || (it.files || []).indexOf("compass.json") < 0) return;
      getJSON(file("sector", it.id, "compass.json"), {ttl: 300000}).then(function(C){ var m = C && C.markets && C.markets.KR; if (!m || !m.sectors) return;
        var ix = (m.index || [])[0] || {}, b20 = +ix.chg20 || 0, b5 = +ix.chg5 || 0;
        // 🗓 11/19 사용자 「왜 아직도 18일이냐고」 — 지수(chg20·chg5)는 장중 값으로 덧입혀져 있는데 업종은 어제 마감이라 날짜도 18일·비교도 어긋났음
        //    → 서버가 붙여 둔 오늘 업종 등락(m.live.ss)을 1주·1달 수익에 곱해 오늘 장까지 넣고, 꼬리표는 「오늘 HH:MM 장중」
        var td = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), LV = m.live && m.live.date === td && m.live.ss ? m.live : null, TD = {};
        if (LV) LV.ss.forEach(function(a){ TD[a[0]] = +a[1]; });
        var gw = function(r, t){ return t == null ? r : ((1 + r / 100) * (1 + t / 100) - 1) * 100; };
        var ss = m.sectors.filter(function(x){ return x.r20 != null && x.r5 != null; }).map(function(x){ var t = LV ? TD[x.name] : null; return {n: String(x.name || "").replace(/\(.*$/, "").split("·")[0].trim(), x: gw(x.r20, t) - b20, y: gw(x.r5, t) - b5}; });
        if (ss.length < 4) return;
        var done = LV && new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 16) >= "15:40";
        SEC = {ss: ss, date: m.date || C.date, ix: ix.name || "코스피", lt: LV ? (done ? "오늘 마감" : "오늘 " + (LV.t || "") + " 장중") : ""}; }).catch(function(){}); } catch(x) {} }
  window.__secTile = function(){
    secLoad(); if (!SEC) return "";
    var ss = SEC.ss, W = 108, H = 72, P = 6, lim = function(a){ var v = a.map(Math.abs).sort(function(p, q){ return p - q; }); return Math.max(1, v[Math.floor(v.length * 0.85)] || 1); };
    var mx = lim(ss.map(function(o){ return o.x; })), my = lim(ss.map(function(o){ return o.y; }));
    var X = function(v){ v = Math.max(-mx, Math.min(mx, v)); return P + (v + mx) / (2 * mx) * (W - 2 * P); }, Y = function(v){ v = Math.max(-my, Math.min(my, v)); return P + (my - v) / (2 * my) * (H - 2 * P); };
    var sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="sec18-sv" aria-hidden="true"><rect x="' + X(0) + '" y="' + P + '" width="' + (W - P - X(0)) + '" height="' + (Y(0) - P) + '" fill="#e66767" opacity=".13"/>' +
      '<rect x="' + P + '" y="' + Y(0) + '" width="' + (X(0) - P) + '" height="' + (H - P - Y(0)) + '" fill="#3987e5" opacity=".13"/>' +
      '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="currentColor" opacity=".25"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + P + '" y2="' + (H - P) + '" stroke="currentColor" opacity=".25"/>' +
      ss.map(function(o){ var hot = o.x > 0 && o.y > 0, cold = o.x < 0 && o.y < 0; return '<circle cx="' + X(o.x).toFixed(1) + '" cy="' + Y(o.y).toFixed(1) + '" r="3" fill="' + (hot ? "#e0524a" : cold ? "#3f7fe0" : "#9aa3b5") + '"/>'; }).join("") + '</svg>';
    var by = ss.slice().sort(function(a, b){ return b.x - a.x; }), up = by.slice(0, 2).map(function(o){ return o.n; }), dn = by.slice(-2).reverse().map(function(o){ return o.n; });
    return '<button type="button" class="jm-t sec18" data-jm="sector">' + sv + '<span class="sec18-t"><b>오늘 섹터 지도</b><small>🇰🇷 한 달 ' + e(SEC.ix) + '보다 강한 곳 <u class="up">' + e(up.join(" · ")) + '</u></small><small>약한 곳 <u class="dn">' + e(dn.join(" · ")) + '</u></small><em>' + (SEC.lt ? e(SEC.lt) : md(SEC.date) + ' 기준') + ' · 5개 시장 보기 ›</em></span></button>'; };

  /* ═════════ 홈에 얹기 (①·②) ═════════ */
  function homePaint(force){
    if (cur() !== "home"){ return; }
    var hero = D.getElementById("ezhero"); if (!hero) return;
    var box = D.getElementById("x18home");
    if (!box){ box = D.createElement("section"); box.id = "x18home"; box.className = "no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    if (hero.previousElementSibling !== box) hero.insertAdjacentElement("beforebegin", box);
    var nh = AUTO ? "" : nwHtml(), h = '<div class="sc18">' + scHtml() + '</div>' + (nh ? '<div class="nw18">' + nh + '</div>' : '');
    if (force || box._h !== h){ box.innerHTML = h; box._h = h; }
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-sc18],[data-nw18],[data-nw18x],[data-nw18m]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.sc18){ if (lpDone){ lpDone = false; return; } goTo(t.dataset.sc18); return; }
    if (t.dataset.nw18){ nwGo(t.dataset.nw18); return; }
    if (t.dataset.nw18m){ nwAll = true; homePaint(true); return; }
    if (t.dataset.nw18x){ var s = nwSeen(); nwList().forEach(function(n){ s[n[0]] = 1; }); ls("nw18", JSON.stringify(s)); homePaint(true); }
  });

  /* ═════════ ⑥ 완성본 먼저 · ⑦ 지난번 그대로 (제안서) ═════════ */
  function b64e(str){ return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  var SAMP = [
    ["pension", "🌴 은퇴 준비", "개인연금 3억 · 매달 150만원 꺼내 쓰기", {v: 1, s: ["pension"], p: 3, a: {pension: 30000}, o: {pension: {w: 150, c: "1101"}}}],
    ["gl_stock", "🚀 성장형", "국내+해외 주식 1억", {v: 1, s: ["gl_stock"], p: 5, a: {gl_stock: 10000}, o: {gl_stock: {c: "1111"}}}],
    ["ktb", "🛡 안정형", "국고채 2억", {v: 1, s: ["ktb"], p: 1, a: {ktb: 20000}, o: {}}]
  ];
  function won(w){ var man = Math.round(w / 10000); if (!man) return ""; if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만" : ""); } return man.toLocaleString("ko-KR") + "만"; }
  function hist(){ var a = lj("pp_hist", []); return Array.isArray(a) ? a.filter(function(x){ return x && x.code && x.names; }).slice(0, 6) : []; }
  D.addEventListener("click", function(ev){   // 만들 때마다 「지난번」으로 기억 (심의 요청서는 빼고)
    var t = ev.target.closest && ev.target.closest("#ppw [data-mk], #ppw #ppshow"); if (!t || !window.__prop) return;
    if (t.dataset.mk && /^rev/.test(t.dataset.mk)) return;
    try { var code = __prop.code(); if (!code) return; var I = __prop.info(); if (!I.total) return;
      var a = hist().filter(function(x){ return !(x.code === code && x.cust === I.cust); });
      a.unshift({code: code, cust: I.cust, names: I.names.join(" · "), total: I.total, prof: I.prof, at: today()}); ls("pp_hist", JSON.stringify(a.slice(0, 6))); } catch(x) {}
  }, true);
  function ppStep(i){ var n = 0; (function seek(){ var b = D.querySelector('#ezwiz [data-st="' + i + '"]'); if (b){ b.click(); return; } if (++n < 20) setTimeout(seek, 150); })(); }
  function ppApply(code, cust, step, msg){ if (!window.__prop || !__prop.apply(code, cust)){ toast("불러오지 못했어요 — 잠시 뒤 다시 눌러 주세요"); return; }
    ppStep(step); if (msg) toast(msg); }
  var ppOpen = true, ppThumbT = null;
  function ppHtml(){
    var H = hist(), S = SAMP.filter(function(s){ return __prop.has(s[0]); });
    var h = "";
    if (H.length) h += '<p class="x18-h">지난번 그대로 <small>이 휴대폰에만 기억</small></p><div class="pp18-l">' + H.slice(0, 3).map(function(x, i){
      return '<div class="pp18-r"><button type="button" data-pp18h="' + i + '"><b>' + e(x.cust || "고객님") + '</b><small>' + e(x.names) + (won(x.total) ? " · " + won(x.total) : "") + (x.prof ? " · " + e(x.prof) : "") + ' · ' + md(x.at) + '</small></button>' +
        '<button type="button" class="alt" data-pp18n="' + i + '">이름만 바꿔</button></div>'; }).join("") + '</div>';
    if (S.length) h += '<p class="x18-h">완성본 먼저 보기 <small>이렇게 나와요 · 누르면 이 틀로 시작</small></p>' +
      '<div class="pp18-s">' + S.map(function(s, i){ return '<button type="button" class="pp18-c" data-pp18s="' + i + '"><span class="pp18-th" data-th="' + i + '"><i class="loading">그리는 중…</i></span><b>' + s[1] + '</b><small>' + e(s[2]) + '</small><em>이 틀로 만들기 ›</em></button>'; }).join("") + '</div>';
    return h; }
  function ppThumbs(){ clearTimeout(ppThumbT); var S = SAMP.filter(function(s){ return __prop.has(s[0]); }), i = 0;
    (function one(){ var el = D.querySelector('#pp18 [data-th="' + i + '"]'); if (!el || i >= S.length) return;
      var html = ""; try { html = __prop.sample(b64e(JSON.stringify(S[i][3]))); } catch(x) {}
      if (html){ var w = el.clientWidth || 200, sc = w / 1080; el.innerHTML = '<div class="pp18-in" style="transform:scale(' + sc + ');transform-origin:0 0;width:1080px">' + html.replace(/\sid="[^"]*"/g, "") + '</div>'; }
      else el.innerHTML = '<i class="loading">견본을 못 그렸어요</i>';
      i++; ppThumbT = setTimeout(one, 120); })(); }
  function ppPaint(){
    var box = D.getElementById("pp18");
    if (cur() !== "prop" || AUTO){ if (box) box.remove(); return; }
    var w = D.getElementById("ppw"); if (!w || !window.__prop || !__prop.ready() || !w.querySelector(".pp-pf")) return;
    var on = D.querySelector("#ezwiz .ezw-s button.on"), st = on ? +on.dataset.st : 0;
    if (st >= 2){ if (box) box.hidden = true; return; }
    if (!box){ box = D.createElement("section"); box.id = "pp18"; box.className = "card no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box.hidden = false;
    var anchor = D.getElementById("ezwiz") || w; if (anchor.previousElementSibling !== box) anchor.parentNode.insertBefore(box, anchor);
    var key = JSON.stringify(hist()) + "|" + ppOpen + "|" + SAMP.map(function(s){ return __prop.has(s[0]) ? 1 : 0; }).join("");
    if (box._k === key) return; box._k = key;
    var h = ppHtml(); if (!h){ box.hidden = true; return; }
    box.innerHTML = h; if (ppOpen) ppThumbs();
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pp18 [data-pp18h],#pp18 [data-pp18n],#pp18 [data-pp18s],#pp18 [data-pp18o]"); if (!t) return; ev.stopPropagation();
    var H = hist(), S = SAMP.filter(function(s){ return window.__prop && __prop.has(s[0]); }), x;
    if (t.dataset.pp18h != null && (x = H[+t.dataset.pp18h])){ ppApply(x.code, x.cust, 3, "지난번 그대로 불러왔어요 — 📱 한 장 · PDF 중 하나만 누르면 끝"); return; }
    if (t.dataset.pp18n != null && (x = H[+t.dataset.pp18n])){ ppApply(x.code, "", 2, "상품·금액은 그대로 — 고객 이름만 넣어 주세요"); return; }
    if (t.dataset.pp18o != null){ if (+t.dataset.pp18o < 0){ ppOpen = true; var b = D.getElementById("pp18"); if (b) b._k = ""; ppPaint(); return; } x = S[+t.dataset.pp18o]; }
    if (t.dataset.pp18s != null) x = S[+t.dataset.pp18s];
    if (x) ppApply(b64e(JSON.stringify(x[3])), "", 3, "견본을 불러왔어요 — 아래 미리 보기 확인 · 이름·금액은 3단계에서 바꿔요");
  });

  /* ═════════ ⑧ 세무계산기 결과 → 고객에게 한 장 ═════════ */
  var W = 1080, MX = 60, CW = W - MX * 2;
  var INK = "#141414", SUB = "#6a6f7a", MUT = "#9aa0ab", LINE = "#e6e8ec", RED = "#d6453d", GRN = "#1f9d6b", BLUE = "#3182f6", BG = "#f7f7f5", TILE = "#ffffff";
  var F = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  function font(g, w, s){ g.font = w + " " + s + "px " + F; }
  function rr(g, x, y, w, h, r, fill){ g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }
  function lines(g, text, w, max){
    var out = [], line = "", toks = String(text == null ? "" : text).split(/(\s+)/);
    toks.forEach(function(tk){ if (!tk) return;
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
  function tx(el){ return String((el && (el.innerText || el.textContent)) || "").replace(/\s+/g, " ").trim(); }
  function pctOf(el, prop){ var m = /([\d.]+)%/.exec((el && el.style && el.style[prop]) || ""); return m ? Math.max(0, Math.min(100, +m[1])) / 100 : null; }
  function taxCanvas(o){
    var c = D.createElement("canvas"); c.width = W; c.height = 6000; var g = c.getContext("2d"); g.textBaseline = "alphabetic"; g.fillStyle = BG; g.fillRect(0, 0, W, 6000);
    var d = kst(), ds = (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 (" + "일월화수목금토"[d.getUTCDay()] + ")", y;
    var cl = String(o.client || "").trim(); if (cl) cl = /님$/.test(cl) ? cl : cl + " 고객님";
    if (cl){ g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, cl + "께", CW * 0.55), MX, 72); }
    g.textAlign = "right"; g.fillStyle = SUB; font(g, 600, 22); g.fillText(fit(g, ds + (o.pb ? " · " + o.pb + " 드림" : ""), CW * (cl ? 0.42 : 1)), W - MX, 70); g.textAlign = "left"; y = 112;
    g.fillStyle = INK; font(g, 900, 50); y += para(g, o.title, MX, y + 50, CW, 62, 2) + 14;
    if (o.inputs){ g.fillStyle = SUB; font(g, 500, 25); y += para(g, "넣은 값 — " + o.inputs, MX, y + 28, CW, 36, 3) + 16; }
    y += 10;
    o.nodes.forEach(function(n){
      if (n.k === "sec"){ y += 14; g.fillStyle = INK; font(g, 800, 32); g.fillText(fit(g, n.t, CW), MX, y + 34); y += 54; return; }
      if (n.k === "gauge"){
        rr(g, MX, y, CW, 150 + 0, 24, TILE); var bx = MX + 32, bw = CW - 64, by = y + 62;
        rr(g, bx, by, bw, 18, 9, LINE); if (n.w != null) rr(g, bx, by, Math.max(18, bw * n.w), 18, 9, n.red ? RED : BLUE);
        n.marks.forEach(function(m){ var px = bx + bw * m.x; g.fillStyle = INK; g.fillRect(px - 1.5, by - 10, 3, 38); g.fillStyle = SUB; font(g, 600, 20); g.textAlign = m.x > 0.7 ? "right" : m.x < 0.2 ? "left" : "center"; g.fillText(m.t, px, by - 20); g.textAlign = "left"; });
        g.fillStyle = INK; font(g, 700, 27); g.fillText(fit(g, n.t, bw), bx, by + 66); y += 150 + 16; return; }
      if (n.k === "big"){
        font(g, 500, 23); var sl = n.sub ? lines(g, n.sub, CW - 64, 4) : [], h = 132 + sl.length * 32 + (sl.length ? 8 : 0);
        rr(g, MX, y, CW, h, 24, TILE); rr(g, MX, y + 22, 8, h - 44, 4, n.tone === "bad" ? RED : n.tone === "good" ? GRN : BLUE);
        g.fillStyle = SUB; font(g, 600, 24); g.fillText(fit(g, n.lab, CW - 64), MX + 32, y + 46);
        g.fillStyle = n.tone === "bad" ? RED : n.tone === "good" ? GRN : INK; font(g, 900, 54); g.fillText(fit(g, n.val, CW - 64), MX + 32, y + 108);
        g.fillStyle = SUB; font(g, 500, 23); sl.forEach(function(t, i){ g.fillText(t, MX + 32, y + 150 + i * 32); });
        y += h + 16; return; }
      if (n.k === "bars"){
        var rh = 62, h2 = 28 + n.rows.length * rh + 12; rr(g, MX, y, CW, h2, 24, TILE);
        n.rows.forEach(function(r, i){ var ry = y + 28 + i * rh, lw = 330, vw = 250, bx2 = MX + 32 + lw + 12, bw2 = CW - 64 - lw - vw - 24;
          g.fillStyle = r.best ? INK : SUB; font(g, r.best ? 800 : 600, 24); g.fillText(fit(g, r.lab, lw), MX + 32, ry + 30);
          rr(g, bx2, ry + 12, bw2, 20, 10, LINE); if (r.w > 0) rr(g, bx2, ry + 12, Math.max(10, bw2 * r.w), 20, 10, r.best ? BLUE : "#aab4c8");
          g.textAlign = "right"; g.fillStyle = r.best ? BLUE : INK; font(g, 800, 25); g.fillText(fit(g, r.val, vw), W - MX - 32, ry + 31); g.textAlign = "left"; });
        y += h2 + 16; return; }
      if (n.k === "tips"){
        y += 10; g.fillStyle = INK; font(g, 800, 30); g.fillText(fit(g, n.t, CW), MX, y + 32); y += 54;
        n.items.forEach(function(t){ g.fillStyle = BLUE; g.beginPath(); g.arc(MX + 10, y + 18, 6, 0, 6.3); g.fill(); g.fillStyle = INK; font(g, 500, 25); y += para(g, t, MX + 34, y + 27, CW - 34, 37, 4) + 14; });
        y += 6; return; }
      if (n.k === "note"){ g.fillStyle = SUB; font(g, 500, 23); y += para(g, n.t, MX, y + 26, CW, 34, 4) + 14; return; }
    });
    var foot = (o.asof ? o.asof + " 세법 · " : "") + "넣은 값만으로 한 어림 계산 — 개인별 공제·세대 사정에 따라 실제 세금·보험료는 달라요 · 신고 전 세무사·홈택스·건강보험공단 확인 · 세무 자문·투자 권유 아님" + (o.sim ? " · " + o.sim : "");
    var H = Math.max(1350, y + 190), o2 = D.createElement("canvas"); o2.width = W; o2.height = H; var g2 = o2.getContext("2d"); g2.textBaseline = "alphabetic"; g2.fillStyle = BG; g2.fillRect(0, 0, W, H);
    g2.drawImage(c, 0, 0, W, y, 0, 0, W, y); g2.fillStyle = LINE; g2.fillRect(MX, H - 150, CW, 2); g2.fillStyle = MUT; font(g2, 500, 21); para(g2, foot, MX, H - 112, CW, 29, 4);
    return o2; }
  function taxNodes(out){
    var N = []; [].forEach.call(out.children, function(el){
      var cn = el.className || "";
      if (el.id === "tx18" || /hub-h|tx-base|tx-wait/.test(cn) || el.tagName === "DETAILS") return;
      if (/tx-sec/.test(cn)){ N.push({k: "sec", t: tx(el)}); return; }
      if (/\btx-g\b/.test(cn)){ var u = el.querySelector(".tx-gt u"); N.push({k: "gauge", w: pctOf(u, "width"), red: !!(u && /\br\b/.test(u.className)), t: tx(el.querySelector("p")),
        marks: [].map.call(el.querySelectorAll(".tx-gt i"), function(i){ return {x: pctOf(i, "left") || 0, t: tx(i)}; })}); return; }
      if (/tx-big/.test(cn)){ N.push({k: "big", lab: tx(el.querySelector("small")), val: tx(el.querySelector("b")), sub: tx(el.querySelector("span")), tone: /tx-bad/.test(cn) ? "bad" : /tx-good|tx-ok/.test(cn) ? "good" : ""}); return; }
      if (/tx-bars/.test(cn)){ N.push({k: "bars", rows: [].map.call(el.querySelectorAll(".tx-b"), function(r){ return {lab: tx(r.querySelector("span")), val: tx(r.querySelector("b")), w: pctOf(r.querySelector("u"), "width") || 0, best: /tx-best/.test(r.className)}; })}); return; }
      if (/tx-th/.test(cn)){ N.push({k: "tips", t: tx(el), items: []}); return; }
      if (/tx-tip/.test(cn)){ var last = N[N.length - 1]; if (!last || last.k !== "tips"){ last = {k: "tips", t: "같이 볼 것", items: []}; N.push(last); }
        [].slice.call(el.querySelectorAll("li"), 0, 5).forEach(function(li){ last.items.push(tx(li)); }); return; }
      var t = tx(el); if (t && !/더 정확하게|칸에 넣/.test(t)) N.push({k: "note", t: t});
    });
    return N.filter(function(n){ return n.k !== "tips" || n.items.length; }); }
  function taxInputs(c, v){ var out = [];
    (c.segs || []).forEach(function(s){ var o = s.opts.filter(function(x){ return x[0] === v[s.id]; })[0]; if (o) out.push(o[1]); });
    c.fields.forEach(function(f){ if ((f.on && !f.on(v)) || !v[f.id]) return; out.push(f.label.replace(/^그중 /, "") + " " + (f.unit ? v[f.id] + f.unit : Number(v[f.id]).toLocaleString("ko-KR") + "만원")); });
    return out.join(" · "); }
  function simGet(){ var o = lj("tx_sim", {}); return o && typeof o === "object" ? o : {}; }
  function simLine(){ var s = simGet(); if (!s.no) return ""; if (s.to && s.to < today()) return ""; return "심의필 " + s.no + (s.to ? " (유효 ~" + s.to.replace(/-/g, ".") + ")" : ""); }
  function recent(){ var a = lj("op_clients", []); return Array.isArray(a) ? a.filter(function(x){ return typeof x === "string" && x; }).slice(0, 6) : []; }
  function taxSheet(){
    var T = window.__tax, out = D.getElementById("txout"); if (!T || !out) return;
    var k = ls("txsel"), c = T.calcs.filter(function(x){ return x.k === k; })[0]; if (!c || !out.querySelector(".tx-big,.tx-bars")){ toast("숫자를 먼저 넣어 주세요"); return; }
    var old = D.getElementById("opch"); if (old) old.remove();
    var s = simGet(), exp = s.no && s.to && s.to < today(), box = D.createElement("div"); box.id = "opch";
    box.innerHTML = '<div class="opc-s"><h3>📨 ' + c.ic + ' ' + e(c.t) + ' — 고객에게 한 장</h3>' +
      '<label class="opc-n">💌 받는 분 <input id="tx18c" maxlength="20" placeholder="고객 이름 (비워도 돼요)"></label>' +
      (recent().length ? '<div class="tx18-rc">' + recent().map(function(n){ return '<button type="button" data-tx18c="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<label class="opc-n">✍️ 보내는 사람 <input id="tx18p" maxlength="30" placeholder="내 이름 (예: 김OO PB)" value="' + e(ls("pbname") || "") + '"></label>' +
      '<label class="opc-n">⚖️ 심의필 번호 <input id="tx18n" maxlength="40" placeholder="예: 제2026-0000호 (받은 것만)" value="' + e(s.no || "") + '"></label>' +
      '<label class="opc-n">유효기간 끝 <input id="tx18t" type="date" value="' + e(s.to || "") + '"></label>' +
      '<p class="tx18-w" id="tx18w">' + (exp ? "⏰ 심의필 유효기간이 지났어요 — 번호 없이 만들어져요" : s.no ? "✅ 그림 아래에 심의필 번호가 찍혀요" : "⚠️ 심의필 번호가 없어요 — 고객에게 보내기 전에 준법감시 심의를 받아 번호를 넣어 주세요") + '</p>' +
      '<button class="opc-go" data-tx18go="1">한 장 만들기</button><button class="opc-x" data-x="1">닫기</button></div>';
    D.body.appendChild(box);
    box.addEventListener("click", function(ev){ var t = ev.target;
      if (t === box || t.closest("[data-x]")){ box.remove(); return; }
      var rc = t.closest("[data-tx18c]"); if (rc){ D.getElementById("tx18c").value = rc.dataset.tx18c; return; }
      if (!t.closest("[data-tx18go]")) return;
      var client = D.getElementById("tx18c").value.trim().slice(0, 20), pb = D.getElementById("tx18p").value.trim().slice(0, 30);
      ls("pbname", pb); ls("tx_sim", JSON.stringify({no: D.getElementById("tx18n").value.trim().slice(0, 40), to: D.getElementById("tx18t").value || ""}));
      if (client){ var a = recent().filter(function(x){ return x !== client; }); a.unshift(client); ls("op_clients", JSON.stringify(a.slice(0, 8))); }
      box.remove(); toast("한 장 만드는 중…");
      var cv; try { cv = taxCanvas({client: client, pb: pb, title: c.ic + " " + c.t, inputs: taxInputs(c, T.state[c.k] || {}), nodes: taxNodes(out), asof: T.law && T.law.asof, sim: simLine()}); } catch(x){ console.error("tax18", x); toast("그림을 만들지 못했어요"); return; }
      var fname = (client ? client.replace(/[^\w가-힣]+/g, "") + "님_" : "") + "절세_" + c.t.replace(/[^\w가-힣]+/g, "") + "_" + today().slice(5).replace("-", "") + ".png";
      var done = false, end = function(b){ if (done) return; done = true; if (!b){ toast("그림을 만들지 못했어요 — 다시 눌러 주세요"); return; } var f = new File([b], fname, {type: "image/png"});
        if (window.__onepage && __onepage.ready) __onepage.ready([f], "절세 한 장"); else { var a2 = D.createElement("a"); a2.href = URL.createObjectURL(f); a2.download = fname; a2.click(); } };
      setTimeout(function(){ end(null); }, 8000); try { cv.toBlob(function(b){ end(b); }, "image/png"); } catch(x){ end(null); }
    });
  }
  /* 🩹 11/18 「연말 절세 한 장」(🆕 줄 · 📨 보내기 화면 줄)으로 들어오면 계산기 6칸만 보이고 보내기 단추는 결과 밑에만 생겨 못 찾았음
     → 그 두 입구로 왔을 때만: 결과가 나오기 전까지 맨 위에 만드는 법 한 줄, 단추가 생기면 한 번 반짝. 연구실에서 그냥 열면 그대로. */
  var txIntent = 0, txWas = false;
  D.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest('.hub-send [data-hub="tax"]'); if (t) txIntent = 1; }, true);
  function txHint(has){
    var h = D.getElementById("tx18h"), tx = D.getElementById("tx");
    if (!txIntent || has || !tx){ if (h) h.remove(); return; }
    if (h && h.parentNode === tx && tx.firstElementChild === h) return;
    if (!h){ h = D.createElement("p"); h.id = "tx18h"; h.innerHTML = '<b>📨 연말 절세 한 장 만드는 법</b>① 아래에서 계산기를 고르고 ② 숫자를 넣으면 ③ 결과 맨 아래에 <u>「📨 이 결과를 고객에게 한 장으로」</u> 단추가 생겨요'; }
    tx.insertBefore(h, tx.firstElementChild);
  }
  function taxPaint(){
    if (cur() !== "tax"){ if (txWas){ txIntent = 0; txWas = false; } return; }
    txWas = true;
    var out = D.getElementById("txout"), has = !!(out && !out.hidden && out.querySelector(".tx-big,.tx-bars"));
    txHint(has);
    if (!out || out.hidden) return;
    var b = D.getElementById("tx18");
    if (!has){ if (b) b.remove(); return; }
    if (b && b.parentNode === out && !b.nextElementSibling) return;
    if (!b){ b = D.createElement("button"); b.type = "button"; b.id = "tx18"; b.className = "hub-cta"; b.setAttribute("data-j", "opch"); b.innerHTML = '📨 이 결과를 고객에게 한 장으로<small>받는 분 이름 · 심의필 번호를 넣을 수 있어요</small>';
      if (txIntent){ b.classList.add("tx18-hi"); txIntent = 0; } }
    out.appendChild(b);
  }
  D.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("#tx18"); if (!t) return; ev.stopPropagation(); taxSheet(); });

  /* ═════════ ⑭ 포트 — 성적은 접어 둠 ═════════ */
  var pfOpen = false;
  function portPaint(){
    if (cur() !== "port"){ pfOpen = false; return; }
    var sum = D.getElementById("posum"), win = D.querySelector("#pobody > .po-win"); if (!sum) return;
    var b = D.getElementById("pf18"), off = !pfOpen && !AUTO;
    sum.classList.toggle("pf18-off", off); if (win) win.classList.toggle("pf18-off", off);
    if (AUTO){ if (b) b.remove(); return; }
    if (!b){ b = D.createElement("button"); b.type = "button"; b.id = "pf18"; }
    if (sum.previousElementSibling !== b) sum.parentNode.insertBefore(b, sum);   // 성적 카드 바로 앞(다른 스크립트가 카드 순서를 바꿔도 따라감)
    var h = pfOpen ? '📊 성적 접기 ▴' : '📊 성적 보기 ▾<small>10/2부터 · 시장과 비교 — 규칙과 지금 판정은 위에</small>'; if (b._h !== h){ b.innerHTML = h; b._h = h; }
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pf18, #pobody .po-stk button, #pobody .po-stk a"); if (!t) return;
    if (t.id === "pf18"){ ev.stopPropagation(); pfOpen = !pfOpen; portPaint(); return; }
    if (!pfOpen && /성적|비교/.test(t.textContent || "")){ pfOpen = true; portPaint(); }
  }, true);

  /* ═════════ 모양 ═════════ */
  var st = D.createElement("style");
  st.textContent =
    "#x18home{margin:0 0 12px}.x18-h{margin:4px 4px 8px;font-size:15px;font-weight:800;display:flex;align-items:baseline;gap:6px}.x18-h small{font-size:12.5px;font-weight:500;color:var(--sub);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sc18-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.sc18-g button{position:relative;font:inherit;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:10px 4px 9px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}" +
    ".sc18-g button:active{transform:scale(.97)}.sc18-g span{font-size:22px;line-height:1}.sc18-g b{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.sc18-g button.pin{border-color:#3182f6}.sc18-g button.pin:after{content:'';position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;background:#3182f6}" +
    ".nw18{margin-top:10px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:10px 12px 2px}.nw18 .x18-h{margin:0 2px 2px}.nw18-x{font:inherit;font-size:12.5px;font-weight:600;color:var(--sub);background:transparent;border:0;padding:4px 2px;cursor:pointer;flex:none}" +
    ".nw18-l button{display:grid;grid-template-columns:26px 1fr 14px;column-gap:8px;align-items:center;width:100%;font:inherit;text-align:left;color:var(--text);background:transparent;border:0;border-top:1px solid var(--line);padding:8px 2px;cursor:pointer}.nw18-l button:first-child{border-top:0}" +
    ".nw18-l span{font-size:18px;text-align:center}.nw18-l b{display:block;font-size:15px;font-weight:700;min-width:0;white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis}.nw18-l b small{display:inline!important;white-space:nowrap!important;font-size:13px;font-weight:500;color:var(--sub);margin-left:4px}.nw18-l i{font-style:normal;color:var(--sub);font-size:18px}" +
    ".nw18-l button.nw18-m{display:block;text-align:center;font-size:13px;font-weight:700;color:var(--sub);padding:7px 2px}" +
    /* 섹터 타일 */
    ".jm-t.sec18{flex-direction:row;align-items:center;gap:12px;min-height:0;width:100%;margin:0 0 8px;padding:12px 14px}.sec18-sv{width:108px;height:72px;flex:none;border-radius:10px;background:var(--panel2,rgba(127,127,127,.08));color:var(--sub)}" +
    ".sec18-t{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.sec18-t small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sec18-t u{text-decoration:none;font-weight:700}.sec18-t u.up{color:#e0524a}.sec18-t u.dn{color:#3f7fe0}.jm-t.sec18 em{margin-top:2px;padding-top:2px;min-height:0}" +
    /* 제안서 */
    "#pp18{padding:14px 14px 12px;margin-bottom:12px}#pp18 .x18-h{margin:2px 2px 8px}#pp18 .x18-h+*{margin-bottom:12px}#pp18>*:last-child{margin-bottom:0}" +
    ".pp18-r{display:flex;gap:8px;align-items:stretch;border-top:1px solid var(--line);padding:8px 0}.pp18-r:first-child{border-top:0;padding-top:0}.pp18-r button{font:inherit;color:var(--text);background:transparent;border:0;cursor:pointer;text-align:left;min-width:0}" +
    ".pp18-r button:first-child{flex:1;display:flex;flex-direction:column;gap:2px;padding:4px 2px}.pp18-r b{font-size:15.5px;font-weight:800}.pp18-r small{font-size:13px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pp18-r button.alt{flex:none;font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:12px;padding:0 12px;color:var(--sub)}" +
    ".pp18-chips{display:flex;flex-direction:column;gap:8px}.pp18-chips button{font:inherit;color:var(--text);background:var(--panel2,transparent);border:1px solid var(--line);border-radius:14px;padding:10px 12px;cursor:pointer;text-align:left;display:flex;align-items:baseline;gap:8px;min-width:0}.pp18-chips b{font-size:15px;font-weight:800;flex:none}.pp18-chips small{font-size:13px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pp18-open{display:block;width:100%;font:inherit;font-size:14px;font-weight:700;color:#3182f6;background:transparent;border:0;padding:8px 0 2px;cursor:pointer}" +
    ".pp18-s{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:4px}.pp18-c{flex:none;width:62%;max-width:240px;scroll-snap-align:start;font:inherit;color:var(--text);background:transparent;border:1px solid var(--line);border-radius:16px;padding:8px 8px 10px;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:3px}" +
    ".pp18-th{display:block;position:relative;height:270px;overflow:hidden;border-radius:10px;background:#fff;margin-bottom:6px;pointer-events:none}.pp18-th:after{content:'';position:absolute;left:0;right:0;bottom:0;height:46px;background:linear-gradient(rgba(255,255,255,0),#fff)}.pp18-th .loading{display:block;padding:20px 8px;font-style:normal;font-size:13px;color:#888;text-align:center}" +
    ".pp18-c b{font-size:15px;font-weight:800}.pp18-c small{font-size:13px;color:var(--sub);line-height:1.35}.pp18-c em{font-style:normal;font-size:13px;font-weight:700;color:#3182f6;margin-top:2px}" +
    /* 세무 한 장 */
    "#tx18h{margin:0 0 10px;padding:12px 14px;border-radius:14px;background:rgba(49,130,246,.10);border:1px solid rgba(49,130,246,.35);font-size:14px;line-height:1.55;word-break:keep-all}#tx18h b{display:block;font-size:14.5px;margin-bottom:2px}#tx18h u{text-decoration:none;font-weight:700;color:#3182f6}" +
    "#tx18.tx18-hi{animation:tx18hi 1.2s ease-in-out 3}@keyframes tx18hi{50%{box-shadow:0 0 0 4px rgba(49,130,246,.45)}}" +
    "#tx18{margin-top:14px}#tx18 small{display:block;font-size:12.5px;font-weight:500;opacity:.85;margin-top:2px}.tx18-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 8px}.tx18-rc button{font:inherit;font-size:13px;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);padding:4px 10px;cursor:pointer}.tx18-w{margin:4px 2px 10px;font-size:13px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    /* 포트 성적 접기 */
    ".pf18-off{display:none!important}#pf18{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:13px 12px;margin:10px 0;cursor:pointer}#pf18 small{display:block;font-size:12.5px;font-weight:500;color:var(--sub);margin-top:3px}";
  D.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; [scCount, homePaint, ppPaint, taxPaint, portPaint].forEach(function(f){ try { f(); } catch(x){ console.warn("ux1118", x); } }); }
  function soon(){ if (!q) q = setTimeout(tick, 180); }
  function start(){ tick(); try { new MutationObserver(soon).observe(D.body, {childList: true, subtree: true}); } catch(x) {} setInterval(tick, 3000); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  window.__ux1118 = {news: NEWS, taxNodes: taxNodes, taxCanvas: taxCanvas};   // 점검용
})();
;
__bk(87);
/* ======== ux1119.js ======== */
/* 🌅 11/19 아침 시황 업그레이드 — 사용자 「매일 아침 시황리포트를 냉정·객관적으로 분석해 업그레이드 · PB·고객이 아침에 보고 전략·리밸런싱에 쓰게 · 우와」 → 「전부 다 진행」
   자료: market-strategy-report src/morning.py → market/morning.json (리포트 새 1·2쪽과 같은 숫자)
   ④ 넘겨 보는 카드 5장 (#mo19) — 오늘 홈 첫 칸 아래 · 시황 탭 맨 위. 결론 → 달라진 것 → 돈의 흐름 → 행동(성향별) → 오늘 장 준비
      그 아래 접힌 두 줄: ⑨ 우리 조언 성적표 · ⑩ 우리가 틀렸다면
   ⑦ 고객 포트 대입 (#dg19) — 🩻 포트 진단 결과 아래에 「오늘 리포트 기준이면」 PB용 처방(주식 % · 한국 주식 · 업종 · 완충) — 그림 한 장(고객용)에는 넣지 않음
   새 화면 없음(12/1까지 동결 약속) — 있는 화면 맨 위에 얹기만.
   끄기: index.html 📦list 에서 이 줄을 빼면 끝 */
(function(){
  var D = document, RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function gj(u){ return (window.getJSON ? getJSON(u, {ttl: 300000}) : fetch(u).then(function(r){ if (!r.ok) throw 0; return r.json(); })).catch(function(){ return null; }); }
  function sg(v, d){ return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v){ return v == null ? "" : v >= 0 ? "u" : "d"; }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function won(man){ man = Math.round(Math.abs(man)); if (man >= 10000){ var u = Math.floor(man / 10000), r = man % 10000; return u.toLocaleString("ko-KR") + "억" + (r ? " " + r.toLocaleString("ko-KR") + "만원" : "원"); } return man.toLocaleString("ko-KR") + "만원"; }
  function goTo(k){ if (typeof window.go === "function"){ go(k); window.scrollTo(0, 0); } }
  var MO = null, MOT = 0;
  function load(){ if (MO && Date.now() - MOT < 300000) return Promise.resolve(MO);
    return gj(RM + "morning.json?" + Math.floor(Date.now() / 300000)).then(function(j){ if (j && j.changes){ MO = j; MOT = Date.now(); } return MO; }); }
  function fresh(M){ if (!M || !M.date) return false; return (kst() - new Date(M.date + "T00:00:00Z")) < 4 * 864e5; }

  /* ═════════ ④ 카드 5장 ═════════ */
  var PK = ["안정추구형", "위험중립형", "성장형"];
  function pIdx(){ var v = +(ls("mo19p") || 1); return v >= 0 && v <= 2 ? v : 1; }
  function acCard(c){
    var cls = c.dir === "up" ? "u" : c.dir === "hold" ? "h" : "d";
    return '<div class="m19a ' + cls + (c.small ? " sm" : "") + '"><b>' + e(c.name) + ' <i>' + e(c.sym) + '</i></b>' +
      (c.kr && c.kr !== "—" ? '<small>🇰🇷 ' + e(c.kr) + (c.pct ? ' · 지금 ' + c.pct + '%' : '') + '</small>' : (c.pct ? '<small>지금 ' + c.pct + '%</small>' : '')) +
      (c.chg ? '<em>' + e(c.chg) + '</em>' : c.dir === "avoid" ? '<em class="dd">새로 사지 않기</em>' : '') +
      '<p>' + e(c.why) + '</p>' + (c.cond ? '<p class="f"><b>틀리면</b> ' + e(c.cond) + '</p>' : '') +
      (c.hit && c.hit.n ? '<span class="ht ' + (c.hit.rate < 40 ? "bad" : c.hit.rate >= 60 ? "ok" : "") + '">이 칸 조언 ' + Math.round(c.hit.n * c.hit.rate / 100) + '/' + c.hit.n + ' 맞음' + (c.small ? ' → 작게' : '') + '</span>' : '') + '</div>'; }
  function deck(M){
    var C = M.changes || {}, A = M.actions || {}, F = M.flowmap || {}, P = (M.persona || {}).items || [], pi = pIdx(), p = P[pi] || {};
    var ttl = function(n, t, s){ return '<div class="m19k"><span>' + n + '/5</span>' + t + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
    var c1 = '<div class="m19c c1">' + ttl(1, "오늘의 결론", M.edition ? e(md(M.date) + " " + M.edition) : "") +
      '<p class="m19big">' + e((M.cards && M.cards[0] && M.cards[0].t) || "") + '</p>' +
      ((M.cards && M.cards[0] && M.cards[0].s) ? '<p class="m19so">→ ' + e(M.cards[0].s) + '</p>' : '') + '<p class="m19sw">옆으로 넘기면 달라진 것 · 돈의 흐름 · 할 일 ›</p></div>';
    var c2 = '<div class="m19c">' + ttl(2, "어제와 달라진 것", C.prev_date ? md(C.prev_date) + " 대비" : "") +
      '<p class="m19big">' + (C.none ? '<b class="ok">오늘은 바꿀 것 없음</b> — 어제 배분 그대로' : e(C.head)) + '</p>' +
      (C.items || []).map(function(i){ return '<div class="m19ch ' + i.lv + '"><b>' + e(i.ic + " " + i.t) + '</b><small>' + e(i.s) + (i.lv === "watch" ? " · 오늘 밤 바뀔 수 있음" : "") + '</small></div>'; }).join("") + '</div>';
    var mx = 1; (F["in"] || []).concat(F.out || []).forEach(function(r){ mx = Math.max(mx, Math.abs(r.rs5 || 0)); });
    var c3 = '<div class="m19c">' + ttl(3, "돈의 흐름 지도", md(F.asof) + " 종가") +
      '<div class="m19ct">' + (F.countries || []).map(function(c){ var k = c.label === "돈이 들어오는 곳" ? "in" : c.label === "빠지는 곳" ? "out" : "mid";
        return '<div class="' + k + '"><b>' + e(c.flag) + '</b><span class="' + cl(c.chg5) + '">' + sg(c.chg5) + '</span><small>' + e(c.name) + '</small></div>'; }).join("") + '</div>' +
      '<div class="m19dv">' + (F["in"] || []).slice(0, 4).concat((F.out || []).slice(0, 3)).map(function(r){ var w = Math.abs(r.rs5) / mx * 50;
        return '<div><span>' + (r.rs5 >= 0 ? "🔥 " : "🧊 ") + e(r.name) + '</span><i><s style="' + (r.rs5 >= 0 ? "left:50%;background:var(--up,#d6453d)" : "right:50%;background:var(--down,#2f6fdd)") + ';width:' + w.toFixed(1) + '%"></s></i><b class="' + cl(r.rs5) + '">' + (r.rs5 > 0 ? "+" : "") + r.rs5.toFixed(1) + '</b></div>'; }).join("") +
      '</div><p class="m19n">미국 섹터·테마 5일 S&amp;P500 대비(%p) · 🇰🇷 어제 업종: ' + (F.kr_in || []).slice(0, 2).map(function(x){ return e(x.name) + " " + sg(x.r1); }).join(" · ") + '</p></div>';
    var c4 = '<div class="m19c">' + ttl(4, "오늘 할 일", "") +
      '<div class="m19pp">' + P.map(function(x, i){ return '<button type="button" data-mo19p="' + i + '" class="' + (i === pi ? "on" : "") + '">' + e(x.ic + " " + x.k) + '</button>'; }).join("") + '</div>' +
      (p.k ? '<div class="m19bar">' + [["stock", "주식", "#d6453d"], ["bond", "채권", "#2f6fdd"], ["gold", "금", "#c99a2e"], ["cash", "현금", "#8a94a8"]].map(function(k){ return p[k[0]] > 0 ? '<i style="flex:' + p[k[0]] + ';background:' + k[2] + '">' + (p[k[0]] >= 12 ? k[1] + " " + p[k[0]] : "") + '</i>' : ''; }).join("") + '</div>' +
        '<p class="m19n">' + e(p.chg) + ' · ' + e(p.kr) + '</p>' : '') +
      '<div class="m19g"><p class="u">늘릴 것</p>' + ((A.up || []).map(acCard).join("") || '<p class="m19e">오늘은 없음</p>') +
      '<p class="d">줄일 · 피할 것</p>' + ((A.down || []).map(acCard).join("") || '<p class="m19e">오늘은 없음</p>') +
      '<p class="h">그대로 둘 것</p>' + (A.hold || []).slice(0, 2).map(acCard).join("") + '</div>' +
      '<button type="button" class="m19go" data-mo19go="diag">🩻 내 고객 포트에 대입해 보기 ›</button></div>';
    var OV = M.overnight || {}, T = (M.triggers || []).slice(0, 4);
    var c5 = '<div class="m19c">' + ttl(5, "오늘 장 준비", "") +
      T.map(function(t){ return '<div class="m19t' + (t.near ? " nr" : "") + '"><div><b>' + e(t.signal) + '</b><small>→ ' + e(t.claim) + '</small></div><i><s style="width:' + Math.round((t.fill || 0) * 100) + '%"></s></i><em>' + e(t.dist) + '</em></div>'; }).join("") +
      '<p class="m19s">밤사이 미국 → 오늘 한국</p>' + (OV.up || []).slice(0, 2).concat((OV.down || []).slice(0, 1)).map(function(x){
        return '<div class="m19o"><b>' + (x.r1 > 0 ? "🔥" : "🧊") + ' ' + e(x.name) + ' <span class="' + cl(x.r1) + '">' + sg(x.r1, 2) + '</span></b><small>' + (x.kr || []).slice(0, 3).map(function(k){ return e(k.name); }).join(" · ") + '</small></div>'; }).join("") +
      '<div class="m19tm">' + (OV.times || []).slice(0, 3).map(function(t){ return '<span><b>' + e(t.t) + '</b>' + e(t.what) + '</span>'; }).join("") + '</div></div>';
    var S = M.score || {}, SA = S.all || {}, CW = M.counter || {};
    var tail = '<details class="m19d"><summary>📊 우리 조언 성적표 <b>' + (SA.win || 0) + '/' + (SA.n || 0) + '</b> <small>5거래일 뒤 S&amp;P500 대비 · 대기 ' + (S.pending || 0) + '</small></summary>' +
      '<div class="m19sc">' + (S.by_list || []).map(function(v){ return '<span class="' + (v.rate >= 60 ? "ok" : v.rate < 40 ? "bad" : "") + '">' + e(v.name) + ' <b>' + v.win + '/' + v.n + '</b></span>'; }).join("") + '</div>' +
      '<p class="m19n">' + ((S.weak || []).length ? '⚠️ ' + e(S.weak.join(", ")) + ' 칸은 적중 40% 아래 — 이 칸 조언은 작게 · ' : '') + e(S.rule || "") + '</p></details>' +
      '<details class="m19d"><summary>🗣 우리가 틀렸다면 <small>가장 강한 반론 1개</small></summary><p class="m19cw">' + e(CW.claim || "") + '</p>' +
      (CW.watch ? '<p class="m19n">📏 가장 가까운 「틀렸다」 신호: <b>' + e(CW.watch.signal) + '</b> · 남은 거리 <b>' + e(CW.watch.dist) + '</b></p>' : '') + '</details>';
    return '<p class="m19h">🌅 오늘 아침 30초 <small>' + e(md(M.date)) + ' ' + e(M.edition || "") + ' · 옆으로 넘겨 보기</small></p>' +
      '<div class="m19w" id="m19w">' + c1 + c2 + c3 + c4 + c5 + '</div><div class="m19dot" id="m19dot">' + [0, 1, 2, 3, 4].map(function(i){ return '<i data-mo19d="' + i + '"' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join("") + '</div>' + tail;
  }
  function place(){
    var k = cur(), box = D.getElementById("mo19"), anchor = null, where = "after";
    if (k === "home"){ anchor = D.getElementById("ezrows") || D.getElementById("jobmap"); }   // 11/19 고침: 첫 칸(ezhero) 바로 아래는 「할 수 있는 일」(ux1112b)이 자리 잡는 곳 — 둘이 서로 밀어내며 화면이 흔들렸음 → 그 아래로
    else if (k === "market"){ anchor = D.getElementById("live"); where = "before"; }
    if (!anchor || !MO || !fresh(MO)){ if (box && (!anchor || k !== box._k)) box.remove(); return; }
    if (!box){ box = D.createElement("section"); box.id = "mo19"; box.className = "card no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box._k = k;
    var need = where === "after" ? anchor.nextElementSibling !== box : anchor.previousElementSibling !== box;
    if (need){   // 다른 스크립트와 자리다툼이면(2초에 3번 넘게 옮김) 지금 자리에 그대로 둠 — 화면이 흔들리지 않게
      var now = Date.now(); place.mv = (place.mv || []).filter(function(t){ return now - t < 2000; });
      if (place.mv.length < 3 || !box.parentNode){ place.mv.push(now); if (where === "after") anchor.insertAdjacentElement("afterend", box); else anchor.insertAdjacentElement("beforebegin", box); }
    }
    var key = MO.at + "|" + pIdx();
    if (box._h === key) return; box._h = key;
    var sl = D.getElementById("m19w"), x = sl ? sl.scrollLeft : 0;
    box.innerHTML = deck(MO);
    var w = D.getElementById("m19w"); if (w){ w.scrollLeft = x; w.addEventListener("scroll", dots, {passive: true}); }
    fitH();
    if (w && window.ResizeObserver){ var ro = new ResizeObserver(function(){ w._h = 0; fitH(); }); [].forEach.call(w.children, function(c){ ro.observe(c); }); }
  }
  function fitH(){   // 넘김 칸 높이 = 지금 보는 카드 높이 (긴 카드에 맞춰 짧은 카드 밑이 텅 비던 것)
    var w = D.getElementById("m19w"); if (!w || !w.children.length) return;
    var i = Math.max(0, Math.min(w.children.length - 1, Math.round(w.scrollLeft / Math.max(1, w.children[0].offsetWidth + 10))));
    var h = w.children[i].offsetHeight + 8; if (h > 40 && w._h !== h){ w._h = h; w.style.height = h + "px"; }
  }
  function dots(){ var w = D.getElementById("m19w"), d = D.getElementById("m19dot"); if (!w || !d) return;
    clearTimeout(dots.t); dots.t = setTimeout(fitH, 90);
    var i = Math.round(w.scrollLeft / Math.max(1, w.children[0].offsetWidth + 10)); [].forEach.call(d.children, function(x, k){ x.classList.toggle("on", k === i); });
    if (i >= 1 && !dots.used){ dots.used = 1; try { window.__track && __track("mo19swipe"); } catch(x) {} } }

  /* ═════════ ⑦ 고객 포트 대입 (포트 진단 결과 아래) ═════════ */
  var SECMAP = {IGV: "IT", SMH: "IT", SKYY: "IT", CIBR: "IT", IGM: "IT", XLK: "IT", XLE: "에너지", XOP: "에너지", XLV: "헬스케어", IHI: "헬스케어", XBI: "헬스케어",
    XLF: "금융", KBE: "금융", KRE: "금융", IAI: "금융", KBWB: "금융", XLP: "필수소비재", XLY: "경기소비재", XRT: "경기소비재", GRID: "유틸리티", XLU: "유틸리티",
    XLI: "산업재", ITA: "산업재", PAVE: "산업재", COPX: "소재", XME: "소재", XLB: "소재", GDX: "소재", XLC: "통신·미디어", XLRE: "부동산"};
  function rx(R, M){
    var P = (M.persona || {}).items || [], pi = pIdx(), p = P[pi] || {}, A = M.actions || {}, out = [];
    var tot = R.tot || 0, eq = R.eq || 0, bond = 0, gold = 0;
    (R.cls || []).forEach(function(c){ if (c[0] === "채권·현금") bond = c[1]; if (c[0] === "금") gold = c[1]; });
    if (p.k){ var dlt = eq - p.stock;
      out.push(["주식 비중", "지금 " + Math.round(eq) + "% → " + p.k + " 기준 " + p.stock + "%" + (Math.abs(dlt) < 3 ? " — 거의 맞음" : " — " + (dlt > 0 ? "줄일" : "늘릴") + " 몫 약 " + won(tot * Math.abs(dlt) / 100) + " (" + Math.round(Math.abs(dlt)) + "%p)")]); }
    var kr = 0; (R.region || []).forEach(function(g){ if (g[0] === "한국") kr = g[1]; });
    var ks = (M.persona || {}).kospi_stock;
    if (kr >= 5 && ks != null && ks < 50) out.push(["한국 주식", "전체의 " + Math.round(kr) + "%(약 " + won(tot * kr / 100) + ") — 오늘 규칙은 코스피 주식 " + ks + "%(하락장). 한 번에 말고 반등 때 나눠 해외 ETF(TIGER 미국나스닥100 133690)로 옮길 후보"]);
    else if (kr >= 5) out.push(["한국 주식", "전체의 " + Math.round(kr) + "% — 오늘 규칙상 줄일 이유 없음"]);
    var sec = {}; (R.sec || []).forEach(function(s){ sec[s[0]] = s[1]; });
    (A.down || []).forEach(function(c){ var s = SECMAP[c.sym]; if (s && sec[s] >= 3) out.push(["줄이자 칸", s + " " + Math.round(sec[s]) + "% 보유 — 오늘 리포트는 " + c.name + " " + (c.dir === "avoid" ? "새로 사지 않기" : "줄이기") + " (" + (c.why || "").slice(0, 50) + ")"]); });
    (A.up || []).forEach(function(c){ var s = SECMAP[c.sym]; if (!s) return; var h = sec[s] || 0;
      out.push(["늘리자 칸", c.name + "(" + c.sym + ") — 고객 " + s + " " + Math.round(h) + "% · " + (h < 5 ? "비어 있음 → 작게 담을 후보 " + (c.kr && c.kr !== "—" ? c.kr : c.sym) : "이미 담겨 있음 → 더 늘릴 필요 적음") + (c.small ? " · ⚠️ 이 칸 조언 적중 낮음 → 작게" : "")]); });
    var buf = bond + gold, tb = p.k ? (p.bond || 0) + (p.gold || 0) + (p.cash || 0) : null;
    if (tb != null) out.push(["완충(채권·현금·금)", "지금 " + Math.round(buf) + "% → " + p.k + " 기준 " + tb + "%" + (gold < 1 && (p.gold || 0) > 0 ? " · 금 " + p.gold + "%(TIGER KRX금현물 0072R0) 없음" : "")]);
    return out;
  }
  function diagPaint(){
    if (cur() !== "diag") return;
    var out = D.getElementById("dgout"), R = window.__dgLast; if (!out || !R || !MO || !out.querySelector(".dg-pt")) return;
    var box = D.getElementById("dg19");
    var key = (R.tot || 0) + "|" + (R.n || 0) + "|" + pIdx() + "|" + MO.at;
    if (box && box._k === key && out.contains(box)) return;
    if (!box){ box = D.createElement("section"); box.id = "dg19"; box.className = "card hub-c no-clp"; box.setAttribute("data-noemo", "1"); box.setAttribute("data-cz", "done"); box.setAttribute("data-xc", "1"); }
    box._k = key;
    var P = (MO.persona || {}).items || [], L = rx(R, MO);
    box.innerHTML = '<p class="hub-h">🌅 오늘 리포트 기준이면 <small>PB용 · ' + e(md(MO.date)) + ' 아침판 · 그림 한 장엔 안 들어감</small></p>' +
      '<div class="m19pp">' + P.map(function(x, i){ return '<button type="button" data-mo19p="' + i + '" class="' + (i === pIdx() ? "on" : "") + '">' + e(x.ic + " " + x.k) + '</button>'; }).join("") + '</div>' +
      '<ul class="dg19">' + L.map(function(x){ return '<li><b>' + e(x[0]) + '</b>' + e(x[1]) + '</li>'; }).join("") + '</ul>' +
      '<p class="m19n">💼 기본 포트를 성향대로 줄인 예시와 오늘 행동 카드에 견준 것 · 매수·매도 권유 아님 · 성향에 맞는 상품만(제안서 성향 규칙)</p>';
    out.appendChild(box);
  }

  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-mo19p],[data-mo19go],[data-mo19d]"); if (!t) return; ev.stopPropagation();
    if (t.dataset.mo19p != null){ ls("mo19p", t.dataset.mo19p); var b = D.getElementById("mo19"); if (b) b._h = ""; var g = D.getElementById("dg19"); if (g) g._k = ""; tick(); return; }
    if (t.dataset.mo19go){ goTo(t.dataset.mo19go); return; }
    if (t.dataset.mo19d != null){ var w = D.getElementById("m19w"), c = w && w.children[+t.dataset.mo19d]; if (c) w.scrollTo({left: c.offsetLeft - w.offsetLeft, behavior: "smooth"}); }
  });

  var st = D.createElement("style");
  st.textContent =
    "#mo19{padding:14px 0 10px;overflow:hidden}#mo19 .m19h{margin:0 16px 8px;font-size:16px;font-weight:800;color:var(--text)}#mo19 .m19h small{font-size:12.5px;font-weight:500;color:var(--sub);margin-left:6px}" +
    ".m19w{display:flex;align-items:flex-start;gap:10px;overflow-x:auto;overflow-y:hidden;transition:height .25s ease;scroll-snap-type:x mandatory;padding:2px 16px 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.m19w::-webkit-scrollbar{display:none}" +
    ".m19c{flex:0 0 88%;scroll-snap-align:center;border:1px solid var(--line);border-radius:18px;padding:14px 14px 12px;background:var(--panel);box-sizing:border-box;word-break:keep-all}" +
    ".m19c.c1{background:linear-gradient(160deg,#1f2d4d,#2c4a86);color:#fff;border:0}.m19c.c1 .m19k,.m19c.c1 .m19k small{color:#c9d6ea}.m19c.c1 .m19so{color:#ffd27a}" +
    ".m19k{font-size:13px;font-weight:800;color:var(--sub);margin-bottom:8px}.m19k span{display:inline-block;font-size:11px;border:1px solid currentColor;border-radius:999px;padding:0 7px;margin-right:6px;opacity:.8}.m19k small{font-weight:500;margin-left:6px}" +
    ".m19big{font-size:19px;font-weight:800;line-height:1.42;margin:0 0 10px}.m19big .ok{color:#1f9d55}.m19so{font-size:15px;line-height:1.5;font-weight:700;margin:0}.m19sw{margin:14px 0 0;font-size:12.5px;opacity:.7}" +
    ".m19ch{border-radius:12px;padding:9px 11px;margin-bottom:7px;background:rgba(127,127,127,.08);border-left:4px solid #8a94a8}.m19ch.big{border-left-color:#d6453d;background:rgba(214,69,61,.08)}.m19ch.watch{border-left-color:#e3a21a;background:rgba(227,162,26,.1)}" +
    ".m19ch b{display:block;font-size:16px}.m19ch small{display:block;font-size:13px;color:var(--sub);margin-top:2px;line-height:1.4}" +
    ".m19ct{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px}.m19ct div{border-radius:10px;padding:6px 2px;text-align:center;background:rgba(127,127,127,.08)}.m19ct div.in{background:rgba(214,69,61,.12)}.m19ct div.out{background:rgba(47,111,221,.1)}" +
    ".m19ct b{display:block;font-size:18px}.m19ct span{display:block;font-size:13.5px;font-weight:800}.m19ct small{font-size:11.5px;color:var(--sub)}" +
    ".m19dv div{display:grid;grid-template-columns:104px 1fr 40px;gap:6px;align-items:center;font-size:13px;margin-bottom:4px}.m19dv span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.m19dv i{position:relative;height:10px;border-radius:5px;background:rgba(127,127,127,.12)}" +
    ".m19dv s{position:absolute;top:0;height:10px;border-radius:5px;text-decoration:none}.m19dv b{text-align:right;font-size:12.5px}" +
    "#mo19 .m19g>p.u{color:var(--up,#d6453d)}#mo19 .m19g>p.d{color:var(--down,#2f6fdd)}#mo19 b.u,#mo19 span.u{color:var(--up,#d6453d)}#mo19 b.d,#mo19 span.d{color:var(--down,#2f6fdd)}" +
    ".m19n{font-size:12.5px;color:var(--sub);line-height:1.45;margin:8px 0 0}.m19pp{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}.m19pp button{font:inherit;font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--text);padding:5px 10px;cursor:pointer}.m19pp button.on{background:#3182f6;border-color:#3182f6;color:#fff}" +
    ".m19bar{display:flex;height:22px;border-radius:7px;overflow:hidden}.m19bar i{display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;font-style:normal;white-space:nowrap}" +
    ".m19g>p{font-size:13px;font-weight:800;margin:12px 0 5px}.m19g>p.h{color:var(--sub)}.m19e{font-size:13px;color:var(--sub);font-weight:500!important}" +
    ".m19a{border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin-bottom:6px;border-left:4px solid #8a94a8}.m19a.u{border-left-color:#d6453d}.m19a.d{border-left-color:#2f6fdd}.m19a.sm{border-style:dashed;opacity:.85}" +
    ".m19a b{font-size:15px}.m19a b i{font-style:normal;font-size:11px;background:#1f2d4d;color:#fff;border-radius:5px;padding:1px 6px;margin-left:5px;vertical-align:2px}.m19a small{display:block;font-size:12px;color:var(--sub);margin-top:1px}" +
    ".m19a em{display:block;font-style:normal;font-size:13px;font-weight:800;color:#b07500;margin-top:2px}.m19a em.dd{color:var(--down,#2f6fdd)}.m19a p{font-size:13px;line-height:1.45;margin:3px 0 0}.m19a p.f{color:var(--sub)}.m19a p.f b{font-size:13px;color:var(--up,#d6453d)}" +
    ".m19a .ht{display:inline-block;font-size:11.5px;font-weight:800;border-radius:6px;padding:1px 7px;margin-top:5px;background:rgba(127,127,127,.12)}.m19a .ht.bad{background:rgba(214,69,61,.12);color:#d6453d}.m19a .ht.ok{background:rgba(31,157,85,.12);color:#1f9d55}" +
    ".m19go{display:block;width:100%;font:inherit;font-size:15px;font-weight:800;padding:11px;border:0;border-radius:12px;background:#3182f6;color:#fff;margin-top:10px;cursor:pointer}" +
    ".m19t{display:grid;grid-template-columns:1fr 64px 52px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px dashed var(--line)}.m19t b{display:block;font-size:13.5px;line-height:1.35}.m19t small{font-size:12px;color:var(--sub)}" +
    ".m19t i{height:9px;border-radius:5px;background:rgba(127,127,127,.15);overflow:hidden}.m19t s{display:block;height:9px;background:#8a94a8;text-decoration:none}.m19t.nr s{background:#d6453d}.m19t em{font-style:normal;font-weight:800;font-size:13px;text-align:right}.m19t.nr em{color:#d6453d}" +
    ".m19s{font-size:13px;font-weight:800;margin:10px 0 4px}.m19o{padding:4px 0}.m19o b{font-size:14px}.m19o small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".m19tm{display:flex;flex-direction:column;gap:4px;margin-top:8px}.m19tm span{font-size:12.5px;line-height:1.4;background:rgba(127,127,127,.08);border-radius:8px;padding:5px 8px}.m19tm b{margin-right:6px}" +
    ".m19dot{display:flex;justify-content:center;gap:6px;margin:4px 0 6px}.m19dot i{width:7px;height:7px;border-radius:50%;background:var(--line);cursor:pointer}.m19dot i.on{background:#3182f6;width:18px;border-radius:4px}" +
    ".m19d{margin:4px 16px 0;border-top:1px solid var(--line);padding:9px 0 2px}.m19d summary{font-size:14.5px;font-weight:800;cursor:pointer;list-style:none}.m19d summary::-webkit-details-marker{display:none}.m19d summary small{font-size:12px;font-weight:500;color:var(--sub);margin-left:4px}" +
    ".m19sc{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.m19sc span{font-size:12.5px;border-radius:8px;padding:3px 8px;background:rgba(127,127,127,.1)}.m19sc span.bad{background:rgba(214,69,61,.12)}.m19sc span.ok{background:rgba(31,157,85,.12)}" +
    ".m19cw{font-size:14px;font-weight:700;line-height:1.5;margin:8px 0 0}" +
    ".dg19{list-style:none;margin:0;padding:0}.dg19 li{font-size:14px;line-height:1.5;padding:7px 0;border-bottom:1px solid var(--line)}.dg19 li b{display:block;font-size:12.5px;color:var(--sub)}";
  D.head.appendChild(st);

  var q = 0;
  function tick(){ q = 0; [place, diagPaint].forEach(function(f){ try { f(); } catch(x){ console.warn("ux1119", x); } }); }
  function soon(){ if (!q) q = setTimeout(tick, 200); }
  function start(){ load().then(tick); try { new MutationObserver(soon).observe(D.body, {childList: true, subtree: true}); } catch(x) {} setInterval(function(){ load().then(tick); }, 60000); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  window.addEventListener("resize", function(){ var w = D.getElementById("m19w"); if (w) w._h = 0; fitH(); });
  window.__ux1119 = {load: load, deck: deck, rx: rx};   // 점검용
})();
;
__bk(88);
/* ======== ux1123.js ======== */
/* 📨 11/23 A11/23-1 「한 장은 '오늘 실제로 나갈 그림'으로 연다」 — 사용자 「네 추천대로」
   근거(집계 11/18~20): 📨 한 장 화면 477번 열림 · 「고객에게 한 장 보내기」 누름 53(13%) · 228번은 5초 안에 떠남 — 첫 칸이 홈과 똑같은 결론 카드 복사본이고 그림은 누르기 전엔 못 봤음
   ① 📨 한 장 화면 첫 칸 = 보내기를 누르면 실제로 만들어지는 1080px 「시장 한 장」(onepage.js mkMarket → draw)을 열자마자 그림으로 · 밑에 단추 하나 「📨 보내기」
      받는 분 칸(넣으면 그림 맨 위 「○○ 고객님께」가 바로 다시 그려짐 · 최근 8명 칩 · 보낸 뒤 비움 — onepage.js 원칙 그대로) · 그림을 누르면 크게(확대·스크롤)
      고객 질문 25개 · 「다른 것도 한 장으로」는 접은 채(머리를 누르면 펼침)
      자료를 못 받으면 예전 첫 칸(결론 상자 + 보내기 단추)으로 그대로
   ② 홈 「▾ 오늘 자세히 보기」 안 🛡 카드의 「오늘의 결론」 상자는 맨 위 신호등 상자와 글자까지 같아 숨김 · 대신 신호등 상자 안 결론 두 줄 밑에 「포트는 해외 ETF 위주…」 꼬리 문구를 보이게(같은 카드 세 번 → 한 번)
   끄기: index.html 📦list 에서 이 줄을 빼면 전부 예전대로 */
(function(){
  var D = document;
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function toast(m){ var d = D.createElement("div"); d.className = "ch-toast"; d.textContent = m; D.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2800); }
  function OP(){ var o = window.__onepage; return o && o._mkMarket && o._safeDraw && o._share && o._client ? o : null; }

  /* ═════════ ① 📨 한 장 화면 — 첫 칸을 실제 그림으로 ═════════ */
  var CACHE = {C: null, at: 0, cv: null, cl: "", nm: ""};   // 시장 자료 C 는 2분, 그림은 받는 분·보내는 사람이 같으면 재사용
  function firstCard(){
    var o = OP(), nm = o ? o._pbname() : "", R = o ? o._cliRecent() : [];
    return '<section class="card hub-c x23-c" data-cz="done" data-xc="1" data-noemo="1">' +
      '<p class="hub-h">고객에게 한 장 <small id="x23st">오늘 그림 만드는 중…</small></p>' +
      '<div class="x23-pv" id="x23pv" role="button" aria-label="그림 크게 보기"><div class="x23-sk"><i></i><i></i><i></i></div></div>' +
      '<label class="x23-n">💌 받는 분 <input id="x23cl" maxlength="20" placeholder="고객 이름 (비워도 돼요)" autocomplete="off" enterkeyhint="done"></label>' +
      (R.length ? '<div class="x23-rc">' + R.map(function(n){ return '<button type="button" data-x23cl="' + e(n) + '">' + e(n) + '</button>'; }).join("") + '</div>' : '') +
      '<button type="button" class="hub-cta x23-go" id="x23go" disabled>📨 보내기</button>' +
      '<p class="hub-n x23-f"><span id="x23nm">' + (nm ? '보내는 사람 ' + e(nm) : '보내는 사람 없음') + '</span> <button type="button" class="x23-lk" data-x23="nm">바꾸기</button> · <button type="button" class="x23-lk" data-x23="more">⭐ 종목·상품도 같이 보내기 ›</button></p>' +
      '</section>';
  }
  var V0 = window.hubView, I0 = window.hubInit;
  window.hubView = function(key){
    var h = V0 ? V0(key) : "";
    if (key !== "send" || !h || !OP()) return h;
    var a = h.indexOf('<section class="card hub-c" data-cz="done"><p class="hub-h">고객에게 한 장</p>'); if (a < 0) return h;
    var b = h.indexOf("</section>", a); if (b < 0) return h;
    h = h.slice(0, a) + firstCard() + h.slice(b + 10);
    // 나머지 두 카드(고객 질문 · 다른 것도 한 장으로)는 접은 채 — 머리는 보이고 누르면 펼침
    h = h.replace(/<section class="card hub-c" data-cz="done"><p class="hub-h">(고객이 이렇게 물으면|다른 것도 한 장으로)/g, '<section class="card hub-c" data-cz="done" data-x23fold="1"><p class="hub-h x23-th">$1');
    h = h.replace(/(<p class="hub-h x23-th">[^<]*(?:<small[^>]*><\/small>)?)<\/p>/g, '$1<i class="x23-car">▾</i></p>');
    return h;
  };
  window.hubInit = function(key){
    if (I0) I0(key);
    if (key !== "send" || !D.getElementById("x23pv")) return;
    bind(); build();
  };
  function bind(){
    var o = OP(); if (!o) return;
    o._client("");
    var I = D.getElementById("x23cl"), T = null;
    if (I) I.addEventListener("input", function(){ var v = I.value.trim().slice(0, 20); o._client(v); chips(); clearTimeout(T); T = setTimeout(function(){ paint(); }, 450); });
    if (I) I.addEventListener("keydown", function(ev){ if (ev.key === "Enter"){ I.blur(); } });
  }
  function chips(){ var o = OP(), v = o ? o._client() : ""; [].forEach.call(D.querySelectorAll("[data-x23cl]"), function(b){ b.classList.toggle("on", b.dataset.x23cl === v); }); }
  function st(t){ var s = D.getElementById("x23st"); if (s) s.textContent = t; }
  function fallback(){   // 자료를 못 받음 → 예전 첫 칸(결론 상자 + 예전 보내기 길)
    var pv = D.getElementById("x23pv"), g = D.getElementById("x23go"); if (!pv) return;
    pv.innerHTML = '<div data-vd></div>'; pv.classList.add("x23-fb"); st("오늘 그림은 잠시 뒤 — 결론은 아래");
    if (g){ g.disabled = false; g.textContent = "📨 고객에게 한 장 보내기"; g.dataset.fb = "1"; }
  }
  function build(){
    var o = OP(); if (!o){ fallback(); return; }
    var now = Date.now(), p = CACHE.C && now - CACHE.at < 120000 ? Promise.resolve(CACHE.C) : o._mkMarket().then(function(C){ if (C && !C.refuse){ CACHE.C = C; CACHE.at = Date.now(); } return C; });
    var t0 = Date.now();
    p.then(function(C){
      if (cur() !== "send" || !D.getElementById("x23pv")) return;
      if (!C || C.refuse){ fallback(); return; }
      paint(); st((C.title || "오늘 시장 한 장") + " · " + (C.label || ""));
    }).catch(function(x){ console.warn(x); fallback(); });
  }
  function paint(){   // 자료 C 로 1080px 그림을 그려 첫 칸에 — 받는 분·보내는 사람이 같으면 그린 것 재사용
    var o = OP(), C = CACHE.C, pv = D.getElementById("x23pv"), g = D.getElementById("x23go"); if (!o || !C || !pv) return;
    var cl = o._client(), nm = o._pbname();
    var cv = CACHE.cv && CACHE.cl === cl && CACHE.nm === nm && CACHE.cv.width ? CACHE.cv : null;
    if (!cv){ try { cv = o._safeDraw(C, nm); } catch(x){ console.warn(x); fallback(); return; } CACHE.cv = cv; CACHE.cl = cl; CACHE.nm = nm; }
    if (pv.firstChild !== cv){ pv.innerHTML = ""; pv.appendChild(cv); pv.classList.remove("x23-fb"); }
    if (g){ g.disabled = false; g.textContent = cl ? "📨 " + cl + " 고객님께 보내기" : "📨 보내기"; delete g.dataset.fb; }
  }
  function send(){
    var o = OP(), g = D.getElementById("x23go"); if (!o) return;
    if (g && g.dataset.fb){ (o.chooser || o.go)(null); return; }   // 예전 길
    var C = CACHE.C, cv = CACHE.cv; if (!C || !cv || !cv.width){ build(); return; }
    var fresh; try { fresh = o._safeDraw(C, o._pbname()); } catch(x){ fresh = cv; }   // 보내는 건 새로 구움(미리보기 캔버스는 화면에 남김)
    toast("한 장 준비 중…");
    var p = o._share(fresh, C.title); o._cliDone();
    var I = D.getElementById("x23cl"); if (I){ I.value = ""; } chips(); CACHE.cv = null;   // 보낸 뒤 받는 분은 비움(다른 고객에게 잘못 가지 않게) → 다음 그림은 이름 없이
    if (p && p.then) p.then(function(){ setTimeout(paint, 200); }, function(x){ console.warn(x); toast("만들지 못했어요"); });
  }
  function big(){   // 그림을 누르면 크게 — 가로 2배 · 손가락으로 끌어 봄
    var cv = CACHE.cv; if (!cv || !cv.width) return;
    var old = D.getElementById("x23big"); if (old) old.remove();
    var box = D.createElement("div"); box.id = "x23big"; box.className = "no-clp"; box.setAttribute("data-cz", "done");
    var url; try { url = cv.toDataURL("image/jpeg", 0.85); } catch(x){ return; }
    box.innerHTML = '<div class="x23-bs"><img src="' + url + '" alt="오늘 시장 한 장"></div><button type="button" class="x23-bx">✕ 닫기</button>';
    box.addEventListener("click", function(ev){ if (ev.target.closest(".x23-bx") || ev.target === box) box.remove(); });
    D.body.appendChild(box);
  }
  D.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#x23go,[data-x23cl],[data-x23],#x23pv,.x23-th"); if (!t) return;
    ev.stopPropagation();
    if (t.id === "x23go"){ send(); return; }
    if (t.id === "x23pv"){ if (!t.classList.contains("x23-fb")) big(); return; }
    if (t.dataset.x23cl != null){ var I = D.getElementById("x23cl"), on = (OP() ? OP()._client() : "") !== t.dataset.x23cl; if (I){ I.value = on ? t.dataset.x23cl : ""; I.dispatchEvent(new Event("input")); } return; }
    if (t.dataset.x23 === "nm"){ var o = OP(), n = prompt("한 장 위에 넣을 내 이름 (예: 김OO PB · 비워도 돼요)", o ? o._pbname() : ""); if (n == null) return; try { localStorage.setItem("pbname", n.trim().slice(0, 30)); } catch(x) {} var s = D.getElementById("x23nm"); if (s) s.textContent = n.trim() ? "보내는 사람 " + n.trim().slice(0, 30) : "보내는 사람 없음"; CACHE.cv = null; paint(); return; }
    if (t.dataset.x23 === "more"){ var o2 = OP(); if (o2) (o2.chooser || o2.go)(null); return; }
    if (t.classList.contains("x23-th")){ var c = t.parentNode; if (c.hasAttribute("data-x23fold")) c.removeAttribute("data-x23fold"); else c.setAttribute("data-x23fold", "1"); return; }
  }, true);

  /* ═════════ ② 홈 — 자세히 보기 안 같은 결론 상자 숨김 · 신호등 상자 꼬리 문구 보이기 ═════════ */
  var st_ = D.createElement("style");
  st_.textContent =
    "#ezhero ~ #hmbody .h2-num > [data-vd]{display:none!important}" +
    "#ezhero .vd-mini .vd-n{display:block!important;margin:6px 0 0;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all;opacity:.9}" +
    /* 한 장 화면 */
    ".x23-c .hub-h small{font-weight:500}" +
    ".x23-pv{position:relative;margin:2px 0 10px;border-radius:14px;overflow:auto;-webkit-overflow-scrolling:touch;max-height:min(62vh,540px);background:#f7f7f5;border:1px solid var(--line);min-height:200px;cursor:zoom-in}.x23-pv:not(.x23-fb):after{content:'아래로 끌면 더 · 누르면 크게';position:sticky;bottom:0;display:block;text-align:center;font-size:11.5px;padding:22px 0 6px;color:#555;background:linear-gradient(rgba(247,247,245,0),rgba(247,247,245,.95) 55%);pointer-events:none}" +
    ".x23-pv canvas{display:block;width:100%;height:auto}.x23-pv.x23-fb{background:transparent;border:0;cursor:default;min-height:0}.x23-pv.x23-fb .vd{margin:0}" +
    ".x23-sk{padding:18px 16px}.x23-sk i{display:block;height:14px;border-radius:7px;background:rgba(127,127,127,.18);margin:0 0 12px;animation:x23p 1.2s infinite}.x23-sk i:nth-child(2){width:70%}.x23-sk i:nth-child(3){width:45%}" +
    "@keyframes x23p{0%,100%{opacity:.5}50%{opacity:1}}" +
    ".x23-n{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub);margin:0 0 8px}.x23-n input{flex:1;min-width:0;font:inherit;font-size:15px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text)}" +
    ".x23-rc{display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 10px}.x23-rc button{font:inherit;font-size:13px;font-weight:700;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text)}.x23-rc button.on{border-color:var(--acc,#7c9cff);background:rgba(124,156,255,.18)}" +
    ".x23-go:disabled{opacity:.5}.x23-f{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px}.x23-lk{font:inherit;font-size:12.5px;color:var(--sub);background:none;border:0;padding:0;text-decoration:underline;text-underline-offset:2px}" +
    ".hub-c[data-x23fold] > :not(.x23-th){display:none!important}.x23-th{cursor:pointer;position:relative;padding-right:22px}.x23-th .x23-car{position:absolute;right:0;top:0;font-style:normal;color:var(--sub);font-size:14px}.hub-c:not([data-x23fold]) .x23-th .x23-car{transform:rotate(180deg)}" +
    "#x23big{position:fixed;inset:0;z-index:100004;background:rgba(0,0,0,.88);display:flex;flex-direction:column}.x23-bs{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 10px) 10px 10px}.x23-bs img{display:block;width:200%;max-width:none;border-radius:8px}" +
    ".x23-bx{flex:none;margin:8px 16px calc(env(safe-area-inset-bottom) + 14px);font:inherit;font-size:15px;font-weight:800;padding:12px;border-radius:14px;border:0;background:#fff;color:#141a26}";
  D.head.appendChild(st_);
})();
;
__bk(89);
/* ======== ux1124.js ======== */
/* 🔦 11/24 바닥 점검표 15칸 — 코스피·코스닥 (사용자: 「코스피 코스닥 바닥 신호인지를 심층분석 · 모든 방법을 동원해서」 → 「둘 다 진행」)
   「팔 사람은 다 팔았나」(투매·청산 8칸) 와 「살 사람이 들어왔나」(확인 7칸) 를 따로 세어 한 줄 판정 + 펼치면 15칸.
   계산은 만드는 쪽(market-strategy-report src/floor_check.py → bear.json 코스피·코스닥 칸의 floor) — 이 파일은 그리기만.
   붙는 곳: 🐻 하락장 계기판 시장 줄 안, 📜 과거 성적표 바로 위 (새 화면 없음 · 12/1까지 새 화면 동결 지킴)
   규칙(현금·주식 비중)은 안 바꿈 · 기록 · 과거 빈도는 앞날 보장 아님 · 매수·매도 권유 없음 · 밝은·어두운 화면 둘 다 */
(function(){
  "use strict";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var IC = {on: "✔", half: "△", off: "✖", na: "?"}, NM = {on: "켜짐", half: "반쯤", off: "꺼짐", na: "자료 확인 중"};   // 🩹 11/24 na = 숫자가 말이 안 돼 빼고 센 칸
  function dots(cells){ return cells.map(function(c){ return '<i class="fc-' + c.st + '" title="' + e(c.k) + '"></i>'; }).join(""); }
  function rows(cells){
    return cells.map(function(c){
      return '<li class="fc-' + c.st + '"><span class="fc-i" aria-label="' + NM[c.st] + '">' + IC[c.st] + '</span><b>' + e(c.k) + '</b><small>' + e(c.d) + (c.asof ? ' <em>' + e(c.asof) + ' 기준</em>' : '') + (c.bad ? ' <em class="fc-bad">자료 확인 중 · ' + e(c.bad) + ' — 셈에서 뺌</em>' : '') + '</small></li>';
    }).join("");
  }
  function floorHtml(m){
    var f = m && m.floor; if (!f || !f.cells || !f.cells.length) return "";
    var S = f.cells.filter(function(c){ return c.g === "sell"; }), C = f.cells.filter(function(c){ return c.g === "conf"; });
    var nS = S.filter(function(c){ return c.st !== "na"; }).length, nC = C.filter(function(c){ return c.st !== "na"; }).length;
    var past = (f.past && f.past.lines || []).map(function(x){ return '<li>' + e(x) + '</li>'; }).join("");
    var d = String(f.asof || "").slice(5).replace("-", "/").replace(/^0/, "");
    return '<div class="fc"><div class="fc-h">🔦 ' + e(f.name || m.name || "") + ' 바닥 점검표 <small>' + e(d) + ' 종가 · ' + f.cells.length + '칸</small></div>' +
      '<div class="fc-v fc-' + e(f.lv) + '">' + e(f.head) + '</div>' +
      '<div class="fc-g"><span>팔 사람은 다 팔았나</span><span class="fc-dots">' + dots(S) + '</span><b>' + f.sell_on + '/' + nS + '</b></div>' +
      '<div class="fc-g"><span>살 사람이 들어왔나</span><span class="fc-dots">' + dots(C) + '</span><b>' + f.conf_on + '/' + nC + '</b></div>' +
      (f.chg && f.chg.k && f.chg.k.length ? '<p class="fc-chg">🔄 ' + e(String(f.chg.d || "").slice(5).replace("-", "/")) + ' 바뀐 칸: ' + e(f.chg.k.join(" · ")) + '</p>' : '') +
      '<details class="fc-d"><summary>' + f.cells.length + '칸 펼치기</summary>' +
        '<div class="fc-t">투매·청산 — 팔 사람은 다 팔았나</div><ul class="fc-ul">' + rows(S) + '</ul>' +
        '<div class="fc-t">확인 — 살 사람이 들어왔나</div><ul class="fc-ul">' + rows(C) + '</ul>' +
        '<p class="fc-n">확인 5칸↑ = 🟢 바닥 확인 쪽 · 확인 3칸↑ + 투매 4칸↑ = 🟡 가능성 높아짐 · 투매 4칸↑ = 🟠 바닥 구간일 수 있음(확인 전)</p>' +
        (past ? '<div class="fc-t">과거 채점 — 같은 판정이 켜졌던 때의 그 뒤</div><ul class="fc-past">' + past + '</ul>' : '') +
        '<p class="fc-n">' + e(f.note || "규칙은 그대로 · 기록 · 매수·매도 추천 아님") + '</p></details></div>';
  }
  window.__floorHtml = floorHtml;
  /* 11/24 사용자 「왜 바닥점검표가 코스피만 있냐 — 코스닥 s&p500 나스닥100 다 만들어」
     → 처음엔 📜 과거 성적표 머리(__bearSigHead)에만 붙여서, 첫 화면 「지금 규칙」(가장 나쁜 시장 한 곳 = 코스피)과 깊숙한 체크리스트에서만 보였음.
     이제 시장 줄마다 불리는 __meetLine 에 붙임 → 🐻 계기판의 코스피·코스닥·S&P500·나스닥 줄을 펼치면 각각 보임.
     같은 시장에서 두 머리가 잇달아 불리면(체크리스트 펼침) 한 번만 그림. */
  /* 첫 화면 「지금 규칙」 펼침 — 네 시장 한 표(줄마다 판정·n/8·n/7 · 누르면 그 시장 15칸). ux1105c.js ruleHtml 이 부름. */
  /* 🌏 11/24 사용자 「여기에도 넣으라고」 — 하락장 계기판의 나머지 9개 지수(일본·중국·홍콩·기술 지수)도 이 표에. 칸 수는 지수마다 다름(그 나라에서 받는 자료만) */
  var FL = {kr: "🇰🇷", us: "🇺🇸", jp: "🇯🇵", cn: "🇨🇳", hk: "🇭🇰"}, allT = 0, TECH = {star50: 1, chinext: 1, hstech: 1, sox: 1};
  function floorAll(BR){
    var ok = function(m){ return m.floor && m.floor.cells && m.floor.cells.length; };
    var ms = ((BR && BR.markets) || []).filter(ok), mo = ((BR && BR.more) || []).filter(ok);
    if (!ms.length && !mo.length) return "";
    allT = Date.now();
    var grp = [[null, ms], ["일본 · 중국 · 홍콩", mo.filter(function(m){ return !TECH[m.key]; })], ["기술 지수", mo.filter(function(m){ return TECH[m.key]; })]];
    return '<div class="fa"><div class="fa-h">🔦 바닥 점검표 <small>시장 ' + (ms.length + mo.length) + '곳 · 누르면 칸마다</small></div>' + grp.filter(function(g){ return g[1].length; }).map(function(g){ return (g[0] ? '<div class="fa-sub">' + g[0] + '</div>' : '') + g[1].map(faRow).join(""); }).join("") + '</div>';
  }
  function faRow(m){
      var f = m.floor, ns = f.cells.filter(function(c){ return c.g === "sell" && c.st !== "na"; }).length, nc = f.cells.filter(function(c){ return c.g === "conf" && c.st !== "na"; }).length;
      return '<details class="fa-r fc-' + e(f.lv) + '"><summary><span class="fa-n">' + (FL[m.nat] || "") + ' <b>' + e(f.name || m.name) + '</b></span>' +
        '<span class="fa-v">' + e(String(f.head || "").replace(" · 확인 전", "")) + '</span>' +
        '<span class="fa-c">팔 사람 <b>' + f.sell_on + '/' + ns + '</b> · 살 사람 <b>' + f.conf_on + '/' + nc + '</b></span></summary>' + floorHtml(m) + '</details>';
  }
  window.__floorAll = floorAll;
  var lastM = null, lastT = 0;
  var prevMeet = window.__meetLine;
  window.__meetLine = function(m, cls){ var a = ""; try { a = floorHtml(m); if (a){ lastM = m; lastT = Date.now(); } } catch (_) {} return a + (prevMeet ? prevMeet(m, cls) : ""); };
  var prev = window.__bearSigHead;
  window.__bearSigHead = function(m){ var a = ""; try { if (!(lastM === m && Date.now() - lastT < 40) && !(Date.now() - allT < 40)) a = floorHtml(m); lastM = null; allT = 0; } catch (_) {} return a + (prev ? prev(m) : ""); };
  var css = document.createElement("style");
  css.textContent =
    ".fc{margin:8px 0 8px;padding:10px 10px 8px;border:1px solid var(--line,#e5e7eb);border-radius:12px;display:block;width:100%;box-sizing:border-box;text-align:left}" +
    ".fc-h{font-size:13px;font-weight:800;margin-bottom:6px}.fc-h small{font-size:11.5px;font-weight:600;color:var(--sub,#888);margin-left:4px}" +
    ".fc-v{font-size:15px;font-weight:900;line-height:1.4;padding:7px 9px;border-radius:9px;margin-bottom:8px;word-break:keep-all;background:rgba(127,127,127,.12);color:var(--text,#111)}" +
    ".fc-v.fc-orange{background:rgba(245,158,11,.16)}.fc-v.fc-yellow{background:rgba(234,179,8,.20)}.fc-v.fc-green{background:rgba(34,160,90,.18)}" +
    ".fc-g{display:grid;grid-template-columns:118px 1fr auto;column-gap:8px;align-items:center;margin:5px 0;font-size:12.5px;font-weight:700}" +
    ".fc-g span:first-child{word-break:keep-all}.fc-g b{font-size:14px;white-space:nowrap}" +
    ".fc-dots{display:flex;gap:4px;flex-wrap:nowrap;min-width:0}.fc-dots i{flex:1 1 0;max-width:22px;height:10px;border-radius:5px;background:rgba(127,127,127,.22);display:block}" +
    ".fc-dots i.fc-na{background:transparent;border:1px dashed rgba(127,127,127,.45)}.fc-bad{color:#b45309!important;white-space:normal!important}.fc-dots i.fc-on{background:#22a05a}.fc-dots i.fc-half{background:#f0b429}" +
    ".fc-chg{margin:6px 0 2px;font-size:12px;line-height:1.5;color:var(--text,#111);word-break:keep-all}" +
    ".fc-d{margin-top:4px}.fc-d summary{font-size:12px;color:var(--sub,#888);cursor:pointer;padding:6px 0;min-height:24px}" +
    ".fc-t{font-size:12px;font-weight:800;margin:8px 0 4px;color:var(--text,#111)}" +
    ".fc-ul{list-style:none;margin:0;padding:0}.fc-ul li{display:grid;grid-template-columns:20px 1fr;grid-template-areas:'i k' 'i d';column-gap:6px;padding:5px 0;border-top:1px solid var(--line,rgba(127,127,127,.18))}" +
    ".fc-ul li:first-child{border-top:0}.fc-i{grid-area:i;font-size:13px;font-weight:900;line-height:1.5;color:var(--sub,#888)}" +
    ".fc-ul li.fc-on .fc-i{color:#22a05a}.fc-ul li.fc-half .fc-i{color:#d99a0b}" +
    ".fc-ul b{grid-area:k;font-size:13px;line-height:1.5;word-break:keep-all}.fc-ul small{grid-area:d;font-size:11.5px;line-height:1.5;color:var(--sub,#888);word-break:keep-all;display:block}" +
    ".fc-ul small em{font-style:normal;opacity:.8;white-space:nowrap}" +
    ".fc-past{margin:2px 0 0;padding-left:16px}.fc-past li{font-size:11.5px;line-height:1.55;color:var(--sub,#888);margin:2px 0;word-break:keep-all;display:list-item}" +
    ".fa-sub{margin:10px 2px 2px;font-size:12px;font-weight:800;color:var(--sub,#888)}.fa{margin:8px 0}.fa-h{font-size:13px;font-weight:800;margin-bottom:4px}.fa-h small{font-size:11.5px;font-weight:600;color:var(--sub,#888);margin-left:4px}" +
    ".fa-r{border:1px solid var(--line,#e5e7eb);border-radius:11px;margin:5px 0;padding:0 9px;display:block}.fa-r>summary{display:grid;grid-template-columns:1fr auto;grid-template-areas:'n c' 'v v';gap:2px 8px;align-items:center;padding:8px 0;cursor:pointer;list-style:none;min-height:44px}" +
    ".fa-r>summary::-webkit-details-marker{display:none}.fa-r>summary::after,.fa-r>summary::before{content:none!important;display:none!important}.fa-v::after{content:' ▾';font-weight:600;color:var(--sub,#888)}.fa-r[open] .fa-v::after{content:' ▴'}.fa-n{grid-area:n;font-size:13.5px;white-space:nowrap}.fa-c{grid-area:c;font-size:11.5px;color:var(--sub,#888);white-space:nowrap;text-align:right}.fa-c b{color:var(--text,#111);font-size:12.5px}" +
    ".fa-v{grid-area:v;font-size:12.5px;font-weight:800;word-break:keep-all}.fa-r[open]>summary{border-bottom:1px solid var(--line,rgba(127,127,127,.18))}.fa-r .fc{border:0;padding:8px 0 6px;margin:0}.fa-r .fc-h,.fa-r .fc-v{display:none}" +
    ".fc-n{margin:8px 0 0;font-size:11px;line-height:1.5;color:var(--sub,#888);word-break:keep-all}";
  document.head.appendChild(css);
})();
;
__bk(90);
/* ======== ux1124b.js ======== */
/* 🗺 11/24 A11/24-2 「섹터 지도 기간 탭(1·3·6개월)을 누르면 점이 옛 자리에서 새 자리로 미끄러지고, 꼬리가 다음 탭을 누를 때까지 남음」 — 사용자 「2번 진행해」
   근거(집계): 「시장 흐름 · #개월」 11/23 108번/32기기(기기당 3.4번) · 11/20 96번/12기기(8번) — 기간을 번갈아 누르며 눈으로 비교하는 손.
   지금은 탭을 누르면 지도(compass.js rotSvgNow)가 통째로 즉시 다시 그려져 「1개월엔 어디였더라」를 머리로 기억해야 함.
   하는 일(🔄 섹터 로테이션 지도 · data-secpb="map" 에만 · 🎞 되감기 카드는 그대로):
   ① 기간 탭(1M·3M·6M)을 누르면 SECP.refresh 앞에서 지도의 점 자리(그림 위 좌표)를 적어 두고, 다시 그려진 뒤 섹터 점 10개가 옛 자리 → 새 자리로 0.6초 미끄러짐(CSS transform · 줄어든 움직임 설정이면 바로)
   ② 옛 자리에 빈 동그라미 + 옛 자리 → 새 자리 꼬리 선(섹터 색)이 남음 — 다음 탭을 누를 때(지도를 다시 그릴 때)까지
   ③ 🔥/🌱/🍂/🧊 네 칸 경계를 넘은 섹터만 꼬리가 굵고, 그림 밑 한 줄에 「반도체 🔥→🧊」 식으로 이름이 붙음(안 넘었으면 가는 꼬리만)
   ④ 꼬리는 「그림 위 자리」 기준(축 눈금은 기간마다 달라 한 줄 꼬리표로 밝힘) · 새 단추·새 줄 없음(꼬리 줄은 탭을 누른 뒤에만 · 다음 그리기 때 사라짐)
   끄기: index.html 📦list 에서 이 줄을 빼면 전부 예전대로 */
(function(){
  var D = document;
  if (!window.SECP || typeof SECP.refresh !== "function") return;
  var Q = {RU: "🔥", LU: "🌱", RD: "🍂", LD: "🧊"};
  var PEND = null;
  function e(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function lab(p){ try { return (SECP.lab(p) || {}).xl || p; } catch(x){ return p; } }
  function reduced(){ try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(x){ return false; } }

  /* 기간 탭 누름을 SECP 의 click(버블)보다 먼저(캡처) 봄 — 그때 SECP.cur() 가 아직 「옛 기간」 */
  D.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-secp]"); if (!b) return;
    var v = b.dataset.secp; if (!/^(1M|3M|6M)$/.test(v)) return;
    var from = SECP.cur();
    PEND = from === v ? null : {from: from, to: v, at: Date.now()};
  }, true);

  /* 지도 한 장의 점 자리 읽기: {x0, y0, pos: {섹터키: {cx, cy, col, fam, name}}} */
  function snap(el){
    var svg = el.querySelector("svg.rotsv"); if (!svg) return null;
    var ln = svg.querySelectorAll("line"); if (ln.length < 2) return null;
    var o = {x0: +ln[1].getAttribute("x1"), y0: +ln[0].getAttribute("y1"), pos: {}, n: 0};
    [].forEach.call(svg.querySelectorAll("g[data-csec]"), function(g){
      var c = g.querySelector('circle[r="5"]'); if (!c) return;
      var t = g.querySelector("text.rotl"), tm = /<b>(.*?)<\/b>/.exec(g.dataset.tip || "");
      o.pos[g.dataset.csec] = {cx: +c.getAttribute("cx"), cy: +c.getAttribute("cy"), col: c.getAttribute("fill") || "#9aa4b8", fam: g.dataset.fam || "", name: tm ? tm[1] : t ? t.textContent : g.dataset.csec, g: g};
      o.n++;
    });
    return o.n ? o : null;
  }
  function quad(p, x0, y0){ return (p.cx >= x0 ? "R" : "L") + (p.cy <= y0 ? "U" : "D"); }
  var NS = "http://www.w3.org/2000/svg";
  function mk(tag, at){ var n = D.createElementNS(NS, tag); for (var k in at) n.setAttribute(k, at[k]); return n; }

  function animate(el, old, pend){
    var now = snap(el); if (!now) return;
    var svg = el.querySelector("svg.rotsv"), first = svg.querySelector("g[data-csec]"), tr = mk("g", {"class": "secp-tr"});
    var moved = [], cross = [], slow = reduced();
    for (var k in now.pos){
      var a = old.pos[k], b = now.pos[k]; if (!a) continue;
      var dx = a.cx - b.cx, dy = a.cy - b.cy, len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1.5) continue;
      var qa = quad(a, old.x0, old.y0), qb = quad(b, now.x0, now.y0), xc = qa !== qb;
      moved.push(k); if (xc) cross.push({n: b.name, c: b.col, a: qa, b: qb});
      var gg = mk("g", {"data-fam": b.fam});
      var line = mk("line", {x1: a.cx.toFixed(1), y1: a.cy.toFixed(1), x2: b.cx.toFixed(1), y2: b.cy.toFixed(1), stroke: b.col, "stroke-width": xc ? 3 : 1.5, "stroke-opacity": xc ? .75 : .38, "stroke-linecap": "round"});
      if (!slow){ line.setAttribute("stroke-dasharray", len.toFixed(1)); line.setAttribute("stroke-dashoffset", len.toFixed(1)); }
      gg.appendChild(mk("circle", {cx: a.cx.toFixed(1), cy: a.cy.toFixed(1), r: xc ? 3 : 2.3, fill: "none", stroke: b.col, "stroke-width": 1.4, opacity: .6}));
      gg.appendChild(line); tr.appendChild(gg);
      /* 점은 옛 자리에서 시작해 새 자리로 */
      var g = b.g; g.style.transition = "none"; g.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
    }
    if (!moved.length) return;
    svg.insertBefore(tr, first || null);
    var note = D.createElement("div"); note.className = "secp-trl"; note.setAttribute("data-noemo", "1");   // 🔥🧊 는 칸 이름이라 calm.js 꾸밈 이모지 빼기에서 제외
    var nm = function(n){ n = String(n || "").replace(/^[^A-Za-z0-9가-힣]+/, ""); try { return window.V && V.shortSec ? V.shortSec(n) : n; } catch(x){ return n; } };
    note.innerHTML = '<b>⟶ 꼬리</b> = 「' + e(lab(pend.from)) + '」에서 있던 자리 → 「' + e(lab(pend.to)) + '」 · ' +
      (cross.length ? '칸을 넘은 곳 <b>' + cross.length + '</b>: ' + cross.slice(0, 6).map(function(c){ return '<span><i style="background:' + c.c + '"></i>' + e(nm(c.n)) + ' ' + Q[c.a] + '→' + Q[c.b] + '</span>'; }).join(" ") + (cross.length > 6 ? ' 외 ' + (cross.length - 6) + '곳(굵은 꼬리)' : '') : '칸을 넘은 섹터는 없어요') +
      ' <span class="mut">· 다음 탭을 누를 때까지 남아요 · 눈금은 기간마다 달라요</span>';
    var out = el.querySelector(".secp-out"); el.insertBefore(note, out || null);
    if (slow){ moved.forEach(function(k){ var g = now.pos[k].g; g.style.transition = ""; g.style.transform = ""; }); return; }
    void svg.getBoundingClientRect();   // 시작 자리를 먼저 그리게
    requestAnimationFrame(function(){
      moved.forEach(function(k){ var g = now.pos[k].g; g.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)"; g.style.transform = "translate(0,0)"; });
      [].forEach.call(tr.querySelectorAll("line"), function(l){ l.style.transition = "stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)"; l.style.strokeDashoffset = "0"; });
      setTimeout(function(){ moved.forEach(function(k){ var g = now.pos[k].g; if (g.isConnected){ g.style.transition = ""; g.style.transform = ""; } }); }, 700);
    });
  }

  var refresh0 = SECP.refresh;
  SECP.refresh = function(){
    var pend = PEND && Date.now() - PEND.at < 1500 ? PEND : null; PEND = null;
    var snaps = [];
    if (pend) [].forEach.call(D.querySelectorAll('[data-secpb="map"]'), function(el){ var s = snap(el); if (s) snaps.push({el: el, s: s}); });
    var r = refresh0.apply(this, arguments);
    if (pend) snaps.forEach(function(o){ try { animate(o.el, o.s, pend); } catch(x){ try { console.warn("secp trail", x); } catch(y) {} } });
    return r;
  };

  var cs = D.createElement("style");
  cs.textContent = ".rotsv g[data-csec]{will-change:transform}.secp-trl{font-size:12.5px;color:var(--sub);margin:4px 2px 2px;line-height:1.7}.secp-trl span{white-space:nowrap;margin-right:8px;color:var(--text)}.secp-trl i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:3px;vertical-align:-1px}.secp-trl .mut{color:var(--dim)}";
  D.head.appendChild(cs);
})();
;
__bk(91);
/* ======== say.js ======== */
/* CH Investing — 🗣 오늘 첫 화면 「한 목소리」 (11/24 사용자 「오늘을 더 심플하고 가독성 있게 · 통일성 있게 다 같은 말을 하게」 → 냉정 분석 7차 「다 진행 · 3번 네 추천대로」)
   ① 숫자·말의 원본은 market/say.json 하나(market-strategy-report src/say.py) — 주식 몫 · 다시 늘리는 선 · 남은 거리 · 오늘 규칙 한 단어(늘리기·지키기·줄이기)
   ② 첫 화면 = 한 문장 + 지수 2칸 + 주식 몫 3줄(남은 거리 막대 — 장중엔 실시간 값으로 다시 계산) + 한 줄 + 보내기 단추
   ③ 그 아래 = 오늘 왜 움직였나 · (내 종목·대형주·이번 주·고객 질문 한 줄씩) · 근거 더 보기 — 지운 것 없음, 예전 칸은 근거 줄을 누르면 열림
   ④ 순서는 CSS order 로만 바꿈(다른 스크립트가 칸을 끼워 넣는 자리는 그대로 — 서로 자리 다툼 없음) · 새 화면 없음(12/1 동결)
   ⑤ 📨 「이 화면 그대로 고객에게」 = 같은 모델(window.__sayModel)로 한 장을 그림(onepage.js SCREENS.say)
   say.json 을 못 받으면 아무것도 안 바꿈 → 예전 첫 화면 그대로 */
(function(){
  var RM = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var S = null, K = null, FU = null, FL = "", T0 = 0, OPEN = {}, PT = null, BR = null, FB = null, BN = null;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function gj(u, ttl){ if (!window.getJSON) return Promise.resolve(null); return getJSON(u + (u.indexOf("?") < 0 ? "?" : "&") + Math.floor(Date.now() / (ttl || 300000)), {ttl: ttl || 300000}).catch(function(){ return null; }); }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function today(){ return kst().toISOString().slice(0, 10); }
  function md(s){ var m = /\d{4}-(\d\d)-(\d\d)/.exec(String(s || "")); return m ? (+m[1]) + "/" + (+m[2]) : ""; }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; var a = Math.abs(v).toFixed(d == null ? 1 : d); return (+a === 0 ? "" : v > 0 ? "+" : "−") + a + "%"; }
  function cl(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function n0(v){ return v >= 1000 ? Math.round(v).toLocaleString("en-US") : (Math.round(v * 10) / 10).toLocaleString("en-US"); }
  function cur(){ return (typeof window.cur !== "undefined" && window.cur) || ""; }
  function EZ(){ return !window.ezMode || window.ezMode() === "easy"; }

  function load(){
    if (S && Date.now() - T0 < 120000) return Promise.resolve(S);
    return Promise.all([gj(RM + "say.json", 120000), gj("archive/x/live_kr.json", 120000), gj("archive/x/live_us_pre.json", 120000), window.__flowLine ? window.__flowLine().catch(function(){ return ""; }) : "",
      gj(RM + "port.json", 600000), gj(RM + "bear.json", 300000), gj(RM + "floor_bt.json", 3600000), gj(RM.replace(/market\/$/, "brain/") + "state.json", 600000)])
      .then(function(r){ if (r[0] && r[0].markets){ var first = !S; S = r[0]; T0 = Date.now(); if (first) setTimeout(function(){ try { if (window.__h2apply) __h2apply(true); } catch(x) {} }, 60); } K = r[1] || K; FU = r[2] || FU; FL = r[3] || FL; PT = r[4] || PT; BR = r[5] || BR; FB = r[6] || FB; BN = r[7] || BN; return S; });
  }
  window.__sayNow = function(){ return S; };
  window.__sayLoad = load;

  /* ── 모델 하나 — 화면과 고객 한 장이 같이 씀 ── */
  function dtxt(d){ return d > 0.05 ? "+" + d.toFixed(1) + "% 남음" : Math.abs(d).toFixed(1) + "% 위"; }   // 말 사전: 거리는 늘 한 방향
  function model(){
    if (!S) return null;
    var td = today(), isT = !!(K && K.date === td && K.index), IX = {};
    if (K && K.index) K.index.forEach(function(x){ IX[x.name] = x; });
    var kp = IX["코스피"], kq = IX["코스닥"], hm = kst().toISOString().slice(11, 16);
    var closed = !isT || String(K.t || "") >= "15:30" || hm >= "15:40";
    var fut = FU && FU.date === td ? (FU.fut || []).filter(function(f){ return f.name === "S&P500 선물"; })[0] : null;
    var rows = S.markets.map(function(r){
      var px = isT && r.key === "kospi" && kp ? kp.last : isT && r.key === "kosdaq" && kq ? kq.last : null;
      var d = px && r.line ? (r.line / px - 1) * 100 : r.dist, live = px != null;
      var o = {key: r.key, name: r.name, share: r.share, share_txt: r.share_txt, cond: r.cond, line_txt: r.line_txt || r.cond, line: r.line, line_name: r.line_name || "", px: px || r.close, cond2: r.cond2 || "", dist: d, live: live,
        dist_txt: d == null ? "" : dtxt(d), prev_txt: live && r.dist != null && Math.abs(r.dist - d) >= 0.3 ? "어제 " + (r.dist > 0 ? "+" : "−") + Math.abs(r.dist).toFixed(1) + "%" : "",
        fill: d == null ? 0 : Math.max(3, Math.min(100, 100 - d * 3.3)), prev_fill: r.dist == null ? null : Math.max(3, Math.min(100, 100 - r.dist * 3.3)), move: r.move};
      if (r.key === "us" && fut && fut.chg != null && r.close && r.line){ o.fut = fut.chg; o.fut_over = r.close * (1 + fut.chg / 100) > r.line; }
      o.odds = r.odds || null;
      o.steps = (r.steps && r.steps.length > 1 ? r.steps : fallbackSteps(r)).map(function(t){ var dd = t.line && px ? (t.line / px - 1) * 100 : t.dist; return {share: t.share, cond: t.cond, now: !!t.now, dir: t.dir || "", dist: dd, dprev: px && t.dist != null && Math.abs(t.dist - dd) >= 0.3 ? t.dist : null}; });
      return o;
    });
    // 한 문장 = 오늘 사실(코스피) + 오늘 규칙 한 단어
    var kr = rows[0] || {}, lead = "", big = isT && kp ? kp.chg : null;
    if (big != null){ var vb = big >= 3 ? (S.markets[0] && S.markets[0].below ? "반등" : "급등") : big <= -3 ? "급락" : big >= 0.5 ? "상승" : big <= -0.5 ? "하락" : "보합"; lead = "코스피 " + sg(big) + " " + vb; }
    var wk = S.word_key, tail = wk === "keep" ? (big != null && big >= 3 ? "규칙은 아직 지키기" : "오늘 규칙은 지키기") : wk === "down" ? "오늘 규칙은 줄이기" : "오늘 규칙은 늘리기";
    var num = "";
    (S.nums || []).some(function(n){
      var ok = n.when === "any" || (n.when === "kospi_up3" && big != null && big >= 3) || (n.when === "kosdaq_up3" && isT && kq && kq.chg >= 3 && !(big >= 3)) || (n.when === "kospi_live" && isT && kr.live);
      if (ok){ num = String(n.t).replace("{live}", kr.dist_txt ? kr.dist_txt.replace(" 남음", "") : ""); if (n.when === "kospi_live" && kr.prev_txt) num += " (" + kr.prev_txt + ")"; }
      return ok; });
    var tiles = [kp, kq].filter(Boolean).map(function(x){ return {n: x.name, chg: x.chg, v: x.name === "코스닥" ? (Math.round(x.last * 10) / 10).toLocaleString("en-US") : Math.round(x.last).toLocaleString("en-US")}; });
    var when = (K && K.date ? (isT ? (closed ? K.t + " 마감" : K.t + " 장중") : md(K.date) + " 마감") : "") + (S.asof ? " · 판정은 " + md(S.asof) + " 종가" : "");
    // 왜 — 업종은 큰 업종 표(live_kr sectors) 하나만 씀(업종 지도·한 장과 같은 분류)
    var secs = ((K && K.sectors) || []).filter(function(x){ return (x.n || 0) >= 30 && x.r != null; }).slice().sort(function(a, b){ return b.r - a.r; });
    var up = (K && K.up) || 0, dn = (K && K.down) || 0, tot = up + dn + ((K && K.flat) || 0), upr = tot > 100 ? Math.round(up / tot * 100) : null;
    var fm = /외국인 ([+−\-][\d,.]+(?:억|조))/.exec(FL || ""), flow = (FL || "").replace(/^코스(?:피|닥) \d+\/\d+ /, "");
    var why = [];
    if (secs.length >= 3){ why.push({k: "강한 업종", h: secs.slice(0, 2).map(function(x){ return e(x.name) + ' <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "), t: secs.slice(0, 2).map(function(x){ return x.name + " " + sg(x.r); }).join(" · ")});
      why.push({k: "약한 업종", h: secs.slice(-2).reverse().map(function(x){ return e(x.name) + ' <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "), t: secs.slice(-2).reverse().map(function(x){ return x.name + " " + sg(x.r); }).join(" · ")}); }
    var V = ((K && K.value) || []).slice(0, 2);
    if (V.length) why.push({k: "돈 몰린 종목", h: V.map(function(x){ return '<u data-op="' + e(x.s) + '">' + e(x.n) + '</u> <b class="' + cl(x.r) + '">' + sg(x.r) + '</b>'; }).join(" · "), t: V.map(function(x){ return x.n + " " + sg(x.r); }).join(" · ")});
    if (flow) why.push({k: "누가 샀나", h: e(flow).replace(/([+][\d,.]+(?:억|조))/g, '<b class="up">$1</b>').replace(/(−[\d,.]+(?:억|조))/g, '<b class="dn">$1</b>'), t: flow, go: "flow"});
    var one = [fm ? "외국인 " + fm[1] : "", secs.length ? "강한 곳 " + secs[0].name + " " + sg(secs[0].r) : "", upr != null ? "오른 종목 " + upr + "%" : ""].filter(Boolean);
    return {word: S.word, word_key: wk, why_word: S.why, lead: lead, tail: tail, num: num, tiles: tiles, rows: rows, when: when, isT: isT, big: big,
      kdate: K && K.date, numsel: (S.nums || []).filter(function(n){ return (n.when === "kospi_up3" && big != null && big >= 3) || (n.when === "kosdaq_up3" && isT && kq && kq.chg >= 3 && !(big >= 3)); })[0] || null,
      whyTitle: !K || !K.date ? "" : isT ? (big != null && big < 0 ? "오늘 왜 내렸나" : "오늘 왜 올랐나") : md(K.date) + " 장은 이랬어요", why: why, one: one, note: S.note};
  }
  /* 🩹 11/24 사용자 「장난하냐」 — 앱은 새것인데 say.json 이 계단(steps) 넣기 전 캐시 파일이면 「지금」 칸 하나만 그려졌음 → 줄 정보(선·거리·조건)로 계단을 직접 만듦 */
  function fallbackSteps(r){
    var sh = r.share, up = {cond: r.cond, line: r.line, dist: r.dist, dir: "up"};
    if (r.key === "us"){
      if (sh === 50) return [{share: 0, cond: r.cond2 || "20일선 위·200일선 아래 마감 날 나머지 절반도 현금", dir: "down"}, {share: 50, cond: "평소 몫의 절반", now: true}, Object.assign({share: 100}, up)];
      if (sh === 0) return [{share: 0, cond: "현금으로 기다림", now: true}, Object.assign({share: 100}, up)];
      return [{share: sh, now: true}];
    }
    if (sh >= 100) return [{share: 100, now: true}];
    if (r.key === "kosdaq" && sh === 50) return [{share: 50, cond: "절반은 지금부터 들고 감", now: true}, Object.assign({share: 75}, up), {share: 100, cond: "200일선 위로", dir: "up"}];
    return [{share: sh, cond: "현금으로 기다림", now: true}, Object.assign({share: 100}, up)];
  }
  window.__sayModel = function(){ return load().then(function(){ var M = model(); if (M) try { M.easy = easy(M); } catch(x) {} return M; }); };

  /* ── 그리기 ── */
  /* 🧒 11/24 저녁 사용자 「자세히는 놔두고 · 직관적이고 중학생도 이해하게 오늘을 쉽게 · 두뇌가 바닥·주식/현금 비중도 줄 거니 그거에 맞춰」
     ① 한 문장(쉬운 말) ② 100만원이 있다면(주식·금·현금 그림) ③ 시장마다 10칸 중 몇 칸 + 다시 사는 때 ④ 바닥인가요? 4단계 — 어려운 말(○○일선·계단·같은 꼴) 은 첫 화면에서 뺌(근거·자세히엔 그대로)
     🧠 두뇌 자리: brain/state.json 의 easy 가 있으면 그 말을 먼저 씀 — {at, say, sub, mix:{stock,gold,cash}, bottom:{kospi:{lv:"gray|orange|yellow|green", t}, kosdaq:{…}, us:{…}}, todo}. 없으면 원본(say.json)·포트(port.json)·바닥 점검표(bear.json floor)로 그림 */
  var LVN = {gray: 0, orange: 1, yellow: 2, green: 3}, LVT = ["아직 바닥 신호가 아니에요", "많이 빠져서 바닥 근처일 수 있어요", "바닥일 가능성이 높아졌어요", "바닥을 다지는 중이에요"], LVI = ["⚪", "🟠", "🟡", "🟢"];
  function easy(M){
    var BE = (BN && BN.easy) || {}, big = M.big, wk = M.word_key, day = M.isT ? "오늘" : (md(M.kdate) || "지난 장");
    var mv = big == null ? "" : big >= 3 ? "크게 올랐어요" : big >= 0.5 ? "올랐어요" : big > -0.5 ? "거의 그대로예요" : big > -3 ? "내렸어요" : "크게 내렸어요";
    var t0 = M.tiles[0], h1 = mv ? day + " 코스피가 " + mv : (t0 ? day + " 코스피 " + sg(t0.chg) : "오늘의 시장");
    var but = (big != null && ((big >= 3 && wk !== "up") || (big <= -3 && wk === "up"))) ? "하지만 " : "";
    var h2 = wk === "up" ? "주식을 늘려도 되는 때예요" : wk === "down" ? "오늘은 주식을 줄이는 날이에요" : "아직은 현금을 들고 기다릴 때예요";
    var ns = M.numsel, num = ns && ns.n ? "이번 하락장에서 이렇게 크게 오른 날이 " + ns.n + "번 있었는데, 그중 " + ns.broke + "번은 그 뒤에 더 내려갔어요." : "";
    // ② 100만원이 있다면 — 두뇌가 주면 그 값, 아니면 💼 기본 포트의 오늘 실제 비중
    var mix = null, src = "";
    if (BE.mix && BE.mix.stock != null){ mix = {stock: +BE.mix.stock, gold: +(BE.mix.gold || 0), cash: BE.mix.cash != null ? +BE.mix.cash : Math.max(0, 100 - BE.mix.stock - (BE.mix.gold || 0))}; src = "🧠 두뇌 판단"; }
    else if (PT && PT.rule && PT.rule.now){ var N = PT.rule.now, g = 0, c = 0, st = 0; Object.keys(N).forEach(function(k){ var v = +N[k] || 0; if (/^금/.test(k)) g += v; else if (/현금|단기채|채권/.test(k)) c += v; else st += v; }); mix = {stock: st, gold: g, cash: c}; src = "💼 기본 포트 기준"; }
    if (mix){ var tt = mix.stock + mix.gold + mix.cash || 100; mix.stock = Math.round(mix.stock / tt * 100); mix.gold = Math.round(mix.gold / tt * 100); mix.cash = 100 - mix.stock - mix.gold; mix.src = src; }
    // ③ 시장마다 10칸
    var NM = {kospi: ["코스피", "한국 큰 회사들"], kosdaq: ["코스닥", "한국 작은·기술 회사들"], us: ["미국", "미국 큰 회사들"]}, AVG = {"50일선": "최근 50일 평균값", "200일선": "최근 열 달 평균값", "20일선": "최근 한 달 평균값"};
    var rows = M.rows.map(function(r){
      var sh = r.share == null ? null : r.share, full = sh != null && sh >= 100, nx = (r.steps || []).filter(function(t){ return !t.now && t.dir === "up" && t.dist != null; })[0];
      var lab = sh == null ? r.share_txt : sh <= 0 ? "주식 없음 · 전부 현금" : sh >= 100 ? "전부 주식" : sh === 50 ? "절반만 주식" : "주식 " + sh + "%";
      var when = "", far = "";
      if (!full && r.line){ when = n0(r.line) + " 위로 올라오면" + (r.key === "us" ? " (3일 버티면)" : "") + " " + (nx && nx.share < 100 ? "더 사요" : "다시 다 사요");
        if (r.dist != null) far = r.dist > 0.05 ? "지금 " + n0(r.px) + " · " + r.dist.toFixed(1) + "% 더 올라야 해요" : "지금 " + n0(r.px) + " · 선을 넘었어요";
        if (r.prev_txt && r.dist > 0.05) far += " (" + r.prev_txt.replace("어제 +", "어제는 ") + ")"; }
      else if (full && r.line) when = n0(r.line) + " 아래로 내려가면 줄여요";
      return {key: r.key, name: (NM[r.key] || [r.name])[0], gloss: (NM[r.key] || ["", ""])[1], share: sh, lab: lab, when: when, far: far, avg: AVG[r.line_name] || "", fut: r.fut};
    });
    // ④ 바닥인가요?
    var bm = {}; ((BR && BR.markets) || []).forEach(function(m){ bm[m.key] = m; });
    var bot = [["kospi", "코스피"], ["kosdaq", "코스닥"], ["sp500", "미국"]].map(function(x){
      var f = bm[x[0]] && bm[x[0]].floor, be = BE.bottom && (BE.bottom[x[0]] || (x[0] === "sp500" && BE.bottom.us));
      if (be && be.lv){ return {name: x[1], lv: LVN[be.lv] || 0, t: be.t || "", brain: true}; }
      if (!f || !f.cells) return null;
      var S_ = f.cells.filter(function(c){ return c.g === "sell" && c.st !== "na"; }).length, C_ = f.cells.filter(function(c){ return c.g === "conf" && c.st !== "na"; }).length;
      var a = S_ ? f.sell_on / S_ : 0, b = C_ ? f.conf_on / C_ : 0;
      return {name: x[1], lv: LVN[f.lv] || 0, t: (a >= 0.75 ? "팔 사람은 거의 다 팔았어요" : a >= 0.5 ? "팔 사람이 꽤 팔았어요" : "아직 덜 팔았어요") + " · " + (b >= 0.6 ? "사는 사람이 돌아왔어요" : b >= 0.3 ? "사는 사람이 조금 보여요" : "사는 사람은 아직이에요")};
    }).filter(Boolean);
    var pf = FB && FB.pooled && FB.pooled.first, cav = "";
    if (pf && pf.orange && pf.yellow && bot.some(function(x){ return x.lv === 1; })) cav = "과거에 🟠 신호 뒤에는 10번 중 " + Math.round(pf.orange.broke / 10) + "번 한 번 더 내려갔어요. 🟡·🟢이 되면 그 위험이 절반쯤으로 줄었어요.";
    return {icon: wk === "up" ? "☀️" : wk === "down" ? "🌧" : "⛅", h1: BE.say || h1 + (mv && t0 ? " (" + sg(t0.chg) + ")" : ""), h2: BE.sub || but + h2, why: M.why_word, num: num, todo: BE.todo || "", mix: mix, rows: rows, bot: bot, cav: cav, brain: !!(BE.say || BE.sub)};
  }
  function cells10(sh){ var h = ""; for (var i = 0; i < 10; i++){ var f = sh == null ? 0 : Math.max(0, Math.min(1, (sh - i * 10) / 10)); h += '<i' + (f >= 1 ? ' class="on"' : f > 0 ? ' class="hf"' : '') + '></i>'; } return h; }
  function heroHtml(M){
    var E = easy(M); M.easy = E;
    var h = '<div class="say-top"><span>' + e(M.when) + '</span></div>' +
      '<div class="say-head ez w-' + M.word_key + '"><div class="ez-hd"><span class="ez-ic" aria-hidden="true">' + E.icon + '</span><div><p class="say-h1">' + e(E.h1) + '</p><p class="ez-h2">' + e(E.h2) + '</p></div></div>' +
      '<div class="say-bd"><b>' + e(M.word) + '</b><span>' + e(E.why || "") + (E.brain ? ' · 🧠 두뇌' : '') + '</span></div>' + (E.num ? '<p class="say-num">' + e(E.num) + '</p>' : '') + (E.todo ? '<p class="say-num">👉 ' + e(E.todo) + '</p>' : '') + '</div>';
    if (M.tiles.length) h += '<div class="say-ts">' + M.tiles.map(function(t){ return '<div><small>' + e(t.n) + (M.isT ? '' : ' · 지난 장') + '</small><p><b class="' + cl(t.chg) + '">' + sg(t.chg) + '</b><em>' + e(t.v) + '</em></p></div>'; }).join("") + '</div>';
    if (E.mix){ var m = E.mix;
      h += '<button type="button" class="say-sh ez-mix" data-saynav="port" data-j="1"><span class="say-shh"><b>💰 100만원이 있다면</b><span>' + e(m.src) + '</span></span>' +
        '<span class="ez-bar" role="img" aria-label="주식 ' + m.stock + ' 금 ' + m.gold + ' 현금 ' + m.cash + '">' + (m.stock > 0 ? '<i class="zs" style="flex:' + m.stock + '"></i>' : '') + (m.gold > 0 ? '<i class="zg" style="flex:' + m.gold + '"></i>' : '') + (m.cash > 0 ? '<i class="zc" style="flex:' + m.cash + '"></i>' : '') + '</span>' +
        '<span class="ez-lg"><span><i class="zs"></i>주식 <b>' + m.stock + '만원</b></span>' + (m.gold > 0 ? '<span><i class="zg"></i>금 <b>' + m.gold + '만원</b></span>' : '') + '<span><i class="zc"></i>현금 <b>' + m.cash + '만원</b></span></span>' +
        '<span class="ez-nt">' + (m.cash >= 50 ? "절반 넘게 현금으로 쉬고 있어요 — 오르는 장일 때보다 주식을 많이 줄여 둔 상태예요" : m.stock >= 70 ? "대부분 주식에 들어가 있어요" : "주식과 현금을 나눠 들고 있어요") + '</span></button>'; }
    h += '<div class="say-sh"><div class="say-shh"><b>시장마다 주식을 얼마나?</b><span>■ 한 칸 = 10%</span></div>' + E.rows.map(function(r){
      return '<button type="button" class="say-r ez-r" data-saygo="rule" data-j="1"><span class="say-rn"><b>' + e(r.name) + ' <small>' + e(r.gloss) + '</small></b><strong>' + e(r.lab) + '</strong></span>' +
        '<span class="ez-c10">' + cells10(r.share) + '</span>' +
        (r.when ? '<span class="ez-wh"><em>🔓 다시 사는 때</em> ' + e(r.when) + (r.avg ? ' <small>(' + e(r.avg) + ')</small>' : '') + '</span>' : '') +
        (r.far ? '<span class="ez-far">' + e(r.far) + (r.fut != null ? ' · 밤사이 선물 ' + sg(r.fut) : '') + '</span>' : '') + '</button>'; }).join("") + '</div>';
    if (E.bot.length) h += '<button type="button" class="say-sh ez-bt" data-saygo="rule" data-j="1"><span class="say-shh"><b>🔦 바닥인가요?</b><span>4단계 중 지금</span></span>' + E.bot.map(function(b){
      return '<span class="ez-b"><span class="ez-bn"><b>' + e(b.name) + '</b><span class="ez-st">' + [0, 1, 2, 3].map(function(i){ return '<i class="' + (i === b.lv ? "now l" + i : i < b.lv ? "past" : "") + '"></i>'; }).join("") + '</span></span>' +
        '<span class="ez-bv">' + LVI[b.lv] + ' ' + LVT[b.lv] + '</span><span class="ez-bs">' + e(b.t) + (b.brain ? ' · 🧠' : '') + '</span></span>'; }).join("") +
      (E.cav ? '<span class="ez-nt">' + e(E.cav) + '</span>' : '') + '</button>';
    h += '<button type="button" class="say-cta" data-saysend="1">📨 이 화면 고객에게 한 장</button>';
    if (M.why.length) h += '<div class="say-why"><div class="say-shh"><b>' + e(M.whyTitle) + '</b></div>' + M.why.map(function(w){ return '<div class="say-w"' + (w.go ? ' data-ezgo="' + w.go + '"' : '') + '><small>' + e({"강한 업종": "잘 나간 업종", "약한 업종": "부진한 업종", "돈 몰린 종목": "돈이 몰린 회사"}[w.k] || w.k) + '</small><p>' + w.h + '</p></div>'; }).join("") + '</div>';
    return h;
  }
  /* 🪜 11/24 사용자 「막대그래프보다 좀 더 직관적으로 · 0·50·100% 는 너무 성의 없지 않니」 — 몫 하나만 보여 주던 막대 → 규칙이 밟는 계단 전체(지금 칸 · 다음 칸까지 남은 거리 · 어제보다 얼마나 다가왔나) + 같은 꼴 장의 이익 확률 */
  function dTxt(d){ return d == null ? "" : d > 0.05 ? "+" + d.toFixed(1) + "% 남음" : "넘음"; }
  function stepRow(r){
    var S = r.steps && r.steps.length ? r.steps : [{share: r.share, cond: "", now: true}], ci = 0;
    S.forEach(function(t, i){ if (t.now) ci = i; });
    var nx = S.filter(function(t, i){ return i > ci && t.dist != null; })[0], dn = S.filter(function(t, i){ return i < ci && t.dir === "down" && t.dist != null; })[0];
    var cells = S.map(function(t, i){
      var cls = i === ci ? "now" : i < ci ? (t.dir === "down" ? "dn" : "past") : "next";
      return '<span class="sp-c ' + cls + '"><b>' + (t.share == null ? "–" : t.share + "%") + '</b><small>' + (i === ci ? "지금" : t.dist != null ? (t.dist > 0.05 ? "+" + t.dist.toFixed(1) + "%" : "넘음") : "") + '</small></span>' + (i < S.length - 1 ? '<i class="sp-a' + (i + 1 === ci && t.dir === "down" ? " back" : "") + '"></i>' : '');
    }).join("");
    var go = nx ? '<p class="sp-go"><span class="sp-up">↑ 다음</span>' + e(nx.cond) + ' → <b>주식 ' + nx.share + '%</b>' + (nx.dprev != null ? ' <small>어제 +' + nx.dprev.toFixed(1) + '% → 오늘 ' + e(dTxt(nx.dist)) + '</small>' : '') + (r.fut != null && r.key === "us" ? ' <small>밤사이 선물 ' + sg(r.fut) + '</small>' : '') + '</p>' : '';
    var dw = dn ? '<p class="sp-go dnl"><span class="sp-dn">↓ 반대로</span>' + e(dn.cond) + '</p>' : '';
    var od = r.odds ? '<p class="sp-od">같은 꼴 장에서 2년 뒤 이익 본 비율 <b>규칙대로 ' + r.odds.rule_up + '%</b> · 그냥 들고 가면 ' + r.odds.hold_up + '%' + (r.odds.n && r.odds.n < 12 ? ' <small>(사례 ' + r.odds.n + '번뿐)</small>' : '') + '</p>' : '';
    return '<button type="button" class="say-r" data-saygo="rule" data-j="1"><span class="say-rn"><b>' + e(r.name) + '</b><strong>' + e(r.share_txt) + '</strong></span>' +
      (S.length < 2 ? '<p class="sp-go">' + e(r.cond || "") + '</p>' : '<span class="sp" style="grid-template-columns:' + S.map(function(){ return "auto"; }).join(" minmax(10px,1fr) ") + '">' + cells + '</span>') + go + dw + od + '</button>';
  }
  function listHtml(){
    var B = window.__ezBrief ? __ezBrief() : null, kp = S.markets[0] || {}, hit = "", bub = "";
    try { var r = B && B._sc && (B._sc.rows || []).filter(function(x){ return x.k === "report"; })[0]; if (r && r.n) hit = "예고 적중 " + r.rate + "%"; } catch(x) {}
    try { var CK = B && B._bub && window.__bubClock ? __bubClock(B._bub) : null; if (CK) bub = "버블 시계 " + CK.label; } catch(x) {}
    var R = [["hero", "판정 자세히 · 언제 다시 사나", kp.line ? kp.line_name + " " + n0(kp.line) : ""], ["mo", "오늘 아침 30초", "카드 5장"], ["rows", "오늘 한 줄씩", hit || "뉴스 · 달라진 것"], ["more", "하락장 계기판 · 버블 시계 · 확률판", bub || "자세히"]];
    return '<div class="say-shh"><b>근거 더 보기</b><span>누르면 그 자리에서 열려요</span></div>' + R.filter(function(x){ return x[0] !== "mo" || document.getElementById("mo19"); }).map(function(x){
      return '<button type="button" class="say-l' + (OPEN[x[0]] ? " on" : "") + '" data-saytog="' + x[0] + '" aria-expanded="' + (OPEN[x[0]] ? "true" : "false") + '"><b>' + x[1] + '</b><span>' + e(x[2]) + '</span><i>' + (OPEN[x[0]] ? "▴" : "›") + '</i></button>'; }).join("");
  }
  var LAST = "";
  function draw(){
    var hero = document.getElementById("ezhero"), hb0 = document.getElementById("hmbody"), P = hero ? hero.parentNode : hb0 ? hb0.parentNode : null, box = document.getElementById("sayhero"), lst = document.getElementById("saylist");
    var on = cur() === "home" && EZ() && (!!S || !FAIL) && !!P;   // 자료가 오기 전에도 자리를 먼저 잡음(왔을 때 화면이 밀리지 않게) · 못 받으면 예전 화면으로
    [].forEach.call(document.querySelectorAll(".say-on"), function(x){ if (!on || x !== P) x.classList.remove("say-on", "say-o-hero", "say-o-mo", "say-o-rows"); });
    if (!on){ if (box && cur() === "home") box.remove(); if (lst && cur() === "home") lst.remove(); return; }
    P.classList.add("say-on"); ["hero", "mo", "rows"].forEach(function(k){ P.classList.toggle("say-o-" + k, !!OPEN[k]); });
    if (!box || box.parentNode !== P){ if (box) box.remove(); box = document.createElement("section"); box.id = "sayhero"; box.setAttribute("data-noemo", "1"); P.insertBefore(box, hero || hb0); LAST = ""; }
    if (!lst || lst.parentNode !== P){ if (lst) lst.remove(); lst = document.createElement("section"); lst.id = "saylist"; lst.setAttribute("data-noemo", "1"); P.insertBefore(lst, hero || hb0); }
    var M = model(); if (!M){ if (!box.firstChild) box.innerHTML = '<div class="say-skel"><i></i><i></i><i></i></div>'; return; }
    var h = heroHtml(M); if (h !== LAST){ box.innerHTML = h; LAST = h; }
    if (!S) return; var l = listHtml(); if (lst.__h !== l){ lst.innerHTML = l; lst.__h = l; }
  }
  var FAIL = false;
  function tick(){ if (cur() !== "home"){ draw(); return; } draw(); load().then(function(x){ FAIL = !x; draw(); }, function(){ FAIL = !S; draw(); }); }

  document.addEventListener("click", function(ev){
    if (!ev.target.closest) return;
    var t = ev.target.closest("[data-saytog]");
    if (t){ ev.stopPropagation(); var k = t.dataset.saytog;
      if (k === "more"){ var hb = document.getElementById("hmbody"), op = document.querySelector("#ezmore .ez-open"); if (op){ if (hb && !hb.classList.contains("ez-open")) op.click(); setTimeout(function(){ op.scrollIntoView({block: "start", behavior: "smooth"}); }, 60); } return; }
      OPEN[k] = !OPEN[k]; var lst = document.getElementById("saylist"); if (lst) lst.__h = ""; draw();
      if (OPEN[k]){ var el = document.getElementById({hero: "ezhero", mo: "mo19", rows: "ezrows"}[k]); if (el) setTimeout(function(){ el.scrollIntoView({block: "nearest", behavior: "smooth"}); }, 60); }
      return; }
    var g = ev.target.closest("[data-saygo]");
    if (g){ ev.stopPropagation(); if (!OPEN.hero){ OPEN.hero = true; var l2 = document.getElementById("saylist"); if (l2) l2.__h = ""; draw(); } var eh = document.getElementById("ezhero"); if (eh) setTimeout(function(){ eh.scrollIntoView({block: "start", behavior: "smooth"}); }, 60); return; }
    var nv = ev.target.closest("[data-saynav]");
    if (nv){ ev.stopPropagation(); try { (window.go || function(){})(nv.dataset.saynav); } catch(x) {} return; }
    var s = ev.target.closest("[data-saysend]");
    if (s){ ev.stopPropagation(); if (window.__onepage && __onepage.sendSay) __onepage.sendSay(); else if (window.__onepage) (__onepage.chooser || __onepage.go)(null); }
  });

  function start(){ tick(); setInterval(tick, 4000); try { var q = 0; new MutationObserver(function(){ if (!q) q = setTimeout(function(){ q = 0; draw(); if (cur() === "home" && !S) tick(); }, 120); }).observe(document.getElementById("main") || document.body, {childList: true}); } catch(x) {} addEventListener("hashchange", function(){ setTimeout(tick, 80); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  var st = document.createElement("style"); st.textContent =
    /* 순서만 바꿈 — 첫 화면 → 한 줄 목록 → 근거 → (열었을 때) 예전 칸 → 나머지는 원래 순서 */
    ".say-on{display:flex;flex-direction:column}.say-on>*{order:50;min-width:0}.say-on>#sayhero{order:1}.say-on>#mnbox{order:2}.say-on>#saylist{order:3}.say-on>#ezhero{order:4}.say-on>#mo19{order:5}.say-on>#ezrows{order:6}" +
    /* 🛡 11/24 「불안정」 — 처음 1~2초 동안 내 종목·대형주·이번 주·고객 질문 칸이 펼쳐진 채 그려졌다 접히며 화면이 1,400px 출렁였음 → 접힌 모양으로 먼저 */
    "html[data-ez=easy] #mnbox>section:not(.ez-x)>:not(h3){display:none!important}" +
    ".say-on>#ezhero,.say-on>#mo19,.say-on>#ezrows{display:none}.say-on.say-o-hero>#ezhero,.say-on.say-o-mo>#mo19,.say-on.say-o-rows>#ezrows{display:block}" +
    "#sayhero{margin:0 0 12px;display:flex;flex-direction:column;gap:8px}#sayhero *{letter-spacing:normal;word-break:keep-all}" +
    ".say-top{font-size:12px;line-height:1.3;color:var(--sub);text-align:right;margin:-4px 2px -2px}" +
    ".say-head{background:#0f1e3d;border-radius:18px;padding:13px 16px}.say-bd{display:flex;gap:8px;align-items:center;margin-bottom:6px}" +
    ".say-bd b{font-size:12px;font-weight:800;border-radius:999px;padding:3px 10px;background:#fde68a;color:#7a4a00}.say-head.w-up .say-bd b{background:#bbf7d0;color:#14532d}.say-head.w-down .say-bd b{background:#fecaca;color:#7f1d1d}" +
    ".say-bd span{font-size:12px;color:#c7d2e5}.say-h1{margin:0;font-size:22px;line-height:1.28;font-weight:900;color:#fff}.say-num{margin:6px 0 0;font-size:13px;line-height:1.45;color:#c7d2e5}" +
    ".say-ts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.say-ts>div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:7px 13px}.say-ts small{font-size:12px;color:var(--sub)}" +
    ".say-ts p{margin:1px 0 0;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:8px;row-gap:0}.say-ts b,.say-ts em{white-space:nowrap}.say-ts b{font-size:clamp(18px,6vw,22px);font-weight:900}.say-ts b.up,.say-one b.up,.say-w b.up{color:var(--up)}.say-ts b.dn,.say-one b.dn,.say-w b.dn{color:var(--down)}.say-ts em{font-style:normal;font-size:13px;color:var(--sub)}" +
    ".say-sh,.say-why,#saylist{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:11px 15px 4px}.say-why{padding-bottom:6px}#saylist{margin:0 0 12px;padding-bottom:4px}" +
    ".say-shh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px}.say-shh b{font-size:15px;font-weight:900;color:var(--text)}.say-shh span{font-size:12px;color:var(--sub)}" +
    ".say-r{display:block;width:100%;text-align:left;font:inherit;color:inherit;background:none;border:0;border-top:1px solid var(--line);padding:8px 0 8px;cursor:pointer}.say-r:first-of-type{border-top:0}" +
    ".say-rn{display:flex;justify-content:space-between;align-items:baseline}.say-rn b{font-size:15px;font-weight:700}.say-rn strong{font-size:17px;font-weight:900}" +
    ".say-bar{display:block;position:relative;height:8px;border-radius:999px;background:var(--panel2);margin:5px 0;overflow:hidden}.say-bar>i{display:block;height:8px;border-radius:999px;background:var(--acc);transition:width .6s}.say-bar.full>i{background:var(--up)}" +
    ".say-bar>u{position:absolute;top:0;bottom:0;width:2px;background:var(--sub);opacity:.7;z-index:1}" +
    ".say-rc{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:12px;line-height:1.4;color:var(--sub)}.say-rc>span{min-width:0}.say-rc em{font-style:normal;font-size:13px;font-weight:800;color:var(--text);text-align:right;flex:0 0 auto;white-space:nowrap}.say-rc small{font-size:11px;font-weight:500;color:var(--sub)}" +
    ".say-one{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:8px 15px;font-size:13px;line-height:1.45}" +
    ".say-cta{display:block;width:calc(100% - 104px);font:inherit;font-size:16px;font-weight:800;color:#fff;background:#2563eb;border:0;border-radius:14px;padding:13px;cursor:pointer}.say-cta:active{transform:scale(.99)}" +
    ".say-w{display:flex;gap:10px;font-size:13px;line-height:1.45;padding:8px 0;border-top:1px solid var(--line)}.say-w small{font-size:13px;color:var(--sub);flex:0 0 78px}.say-w p{margin:0;font-weight:700;flex:1;min-width:0}.say-w u{text-decoration:none}" +
    ".say-l{display:flex;width:100%;align-items:baseline;gap:10px;text-align:left;font:inherit;color:inherit;background:none;border:0;border-top:1px solid var(--line);padding:12px 0;cursor:pointer;min-height:44px}" +
    ".say-l b{font-size:14px;font-weight:700;flex:1;min-width:0}.say-l span{font-size:12px;color:var(--sub);flex:0 0 auto}.say-l i{font-style:normal;color:var(--sub);flex:0 0 auto}.say-l.on b{color:var(--acc)}" +
    ".sp{display:grid;align-items:start;margin:8px 0 6px}.sp-c{display:flex;flex-direction:column;align-items:center;min-width:52px}" +
    ".sp-c b{display:block;font-size:14px;font-weight:900;line-height:1;padding:7px 10px;border-radius:999px;border:1.5px solid var(--line);color:var(--sub);background:var(--panel);white-space:nowrap}" +
    ".sp-c small{display:block;margin-top:4px;font-size:11px;font-weight:700;color:var(--sub);white-space:nowrap}" +
    ".sp-c.now b{background:#0f1e3d;border-color:#0f1e3d;color:#fff;font-size:15px;padding:8px 12px}.sp-c.now small{color:var(--text)}" +
    ".sp-c.next b{border-style:dashed;color:var(--text)}.sp-c.next small{color:var(--acc)}.sp-c.dn b{border-style:dashed;color:var(--down)}.sp-c.dn small{color:var(--down)}" +
    ".sp-a{align-self:start;height:2px;margin:15px 4px 0;background:repeating-linear-gradient(90deg,var(--sub) 0 4px,transparent 4px 8px);opacity:.6;position:relative}" +
    ".sp-a::after{content:'';position:absolute;right:-1px;top:-4px;border:5px solid transparent;border-left:7px solid var(--sub);border-right:0}.sp-a.back::after{right:auto;left:-1px;border-left:0;border-right:7px solid var(--sub)}" +
    ".sp-go{margin:2px 0 0;font-size:12.5px;line-height:1.5;color:var(--text);word-break:keep-all}.sp-go b{font-weight:900}.sp-go small{font-size:11.5px;color:var(--sub);white-space:nowrap}" +
    ".sp-up,.sp-dn{display:inline-block;font-size:11px;font-weight:800;border-radius:6px;padding:1px 6px;margin-right:6px;background:rgba(37,99,235,.12);color:var(--acc)}.sp-dn{background:rgba(57,135,229,.10);color:var(--down)}.sp-go.dnl{color:var(--sub)}" +
    ".sp-od{margin:3px 0 0;font-size:11.5px;line-height:1.45;color:var(--sub);word-break:keep-all}.sp-od b{color:var(--text)}" +
    ".say-head.ez{padding:14px 16px}.ez-hd{display:flex;gap:12px;align-items:center;margin-bottom:10px}.ez-ic{font-size:40px;line-height:1;flex:0 0 auto}.say-head.ez .say-h1{font-size:20px;line-height:1.32}.ez-h2{margin:3px 0 0;font-size:16px;line-height:1.4;font-weight:800;color:#fde68a}.say-head.ez.w-up .ez-h2{color:#bbf7d0}.say-head.ez.w-down .ez-h2{color:#fecaca}.say-head.ez .say-bd{margin:0}.say-head.ez .say-num{font-size:13.5px;line-height:1.55}" +
    "button.say-sh{display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer;padding-bottom:11px}.say-sh .say-shh{display:flex}" +
    ".ez-bar{display:flex;height:26px;border-radius:9px;overflow:hidden;margin:8px 0 9px;gap:2px}.ez-bar i{display:block;min-width:6px}.ez-bar .zs,.ez-lg i.zs{background:var(--acc)}.ez-bar .zg,.ez-lg i.zg{background:#d9a520}.ez-bar .zc,.ez-lg i.zc{background:var(--line)}" +
    ".ez-lg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:14px;color:var(--text)}.ez-lg>span{white-space:nowrap}.ez-lg i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:-1px}.ez-lg b{font-weight:900}" +
    ".ez-nt{display:block;margin-top:7px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".ez-r .say-rn b small{font-size:11.5px;font-weight:500;color:var(--sub);margin-left:4px}.ez-r .say-rn strong{font-size:15px}" +
    ".ez-c10{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:4px;margin:7px 0 7px}.ez-c10 i{display:block;height:16px;border-radius:5px;background:var(--panel2);border:1px solid var(--line)}.ez-c10 i.on{background:var(--acc);border-color:var(--acc)}.ez-c10 i.hf{background:linear-gradient(90deg,var(--acc) 50%,var(--panel2) 50%)}" +
    ".ez-wh{display:block;font-size:13.5px;line-height:1.5;color:var(--text);font-weight:700;word-break:keep-all}.ez-wh em{font-style:normal;font-size:11.5px;font-weight:800;color:var(--acc);background:rgba(37,99,235,.12);border-radius:6px;padding:1px 6px;margin-right:4px;white-space:nowrap}.ez-wh small{font-size:11.5px;font-weight:500;color:var(--sub)}.ez-far{display:block;margin-top:2px;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".ez-b{display:block;padding:9px 0 8px;border-top:1px solid var(--line)}.ez-bt .say-shh+.ez-b{border-top:0;padding-top:4px}.ez-bn{display:flex;justify-content:space-between;align-items:center}.ez-bn b{font-size:15px;font-weight:700}" +
    ".ez-st{display:flex;gap:4px}.ez-st i{display:block;width:26px;height:9px;border-radius:999px;background:var(--panel2);border:1px solid var(--line)}.ez-st i.past{background:var(--sub);border-color:var(--sub);opacity:.45}.ez-st i.now{border-color:transparent}.ez-st i.l0{background:var(--sub)}.ez-st i.l1{background:#f08c2e}.ez-st i.l2{background:#e3b400}.ez-st i.l3{background:#22a05a}" +
    ".ez-bv{display:block;margin-top:4px;font-size:14px;font-weight:800;color:var(--text)}.ez-bs{display:block;font-size:12.5px;line-height:1.5;color:var(--sub);word-break:keep-all}" +
    ".say-skel{display:flex;flex-direction:column;gap:8px}.say-skel i{display:block;border-radius:18px;background:var(--panel);border:1px solid var(--line);height:150px}.say-skel i:nth-child(2){height:66px}.say-skel i:nth-child(3){height:330px}" +
    ":root[data-ui=light] .say-bar>i{background:#2563eb}";
  document.head.appendChild(st);
})();
;
__bk(92);
/* ======== notice.js ======== */
/* 📢 11/25 안내 공지 — 사용자 「어플 처음에 안내 공지를 띄우자」
   계산 저장소(market-strategy-report)가 11/24 저녁부터 GitHub 에 막혀, 시황·두뇌·계기판·포트 등 분석 자료가 11/24 저녁 기준으로 멈춤.
   하는 일: 앱을 열 때(탭/창 하나에 한 번) 가운데 안내 창 + 닫은 뒤에도 맨 위에 얇은 띠 한 줄.
   저절로 사라짐: 막힌 저장소의 자료(raw)를 다시 읽을 수 있으면 = 풀린 것 → 창·띠 모두 안 띄움.
   끄기: index.html 에서 notice.js 줄을 빼면 끝 (정상화되면 뺄 것) */
(function(){
  var D = document;
  var MSG_T = "📢 안내";
  var MSG_B = "현재 자료 서버(GitHub) 문제로 <b>시황·두뇌·계기판·포트 등 분석 자료 대부분이 11월 24일 저녁 기준으로 멈춰</b> 있음.<br><br>" +
              "이용에 착오 없으시길 바람.<br><br>" +
              "<b>이 공지가 사라지면 해결된 것</b>으로 보시면 됨.";
  var PROBE = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/kick.json?";

  function ss(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch(x){ return null; } }

  function bar(){
    if (D.getElementById("ntc-bar")) return;
    var b = D.createElement("div");
    b.id = "ntc-bar";
    b.style.cssText = "position:sticky;top:0;z-index:9998;background:#fff4d6;color:#6b4a00;border-bottom:1px solid #f0d58a;font-size:13px;line-height:1.4;padding:calc(env(safe-area-inset-top,0px) + 7px) 12px 7px;text-align:center;cursor:pointer";
    b.innerHTML = "⚠ 분석 자료 대부분 <b>11/24 저녁 기준</b> (자료 서버 문제) · 눌러서 보기";
    b.onclick = pop;
    D.body.insertBefore(b, D.body.firstChild);
  }

  function pop(){
    if (D.getElementById("ntc-pop")) return;
    var w = D.createElement("div");
    w.id = "ntc-pop";
    w.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px";
    w.innerHTML = '<div style="background:#fff;color:#222;max-width:360px;width:100%;border-radius:16px;padding:22px 20px 16px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:15px;line-height:1.6">' +
      '<div style="font-size:18px;font-weight:700;margin-bottom:10px">' + MSG_T + '</div>' +
      '<div>' + MSG_B + '</div>' +
      '<button id="ntc-ok" style="margin-top:16px;width:100%;padding:12px;border:0;border-radius:10px;background:#2b6cff;color:#fff;font-size:16px;font-weight:600">확인</button></div>';
    D.body.appendChild(w);
    function close(){ ss("ntc1125", "1"); if (w.parentNode) w.parentNode.removeChild(w); }
    D.getElementById("ntc-ok").onclick = close;
    w.addEventListener("click", function(ev){ if (ev.target === w) close(); });
  }

  function show(){ bar(); if (ss("ntc1125") !== "1") pop(); }

  function go(){
    var done = false;
    /* 막힌 저장소를 다시 읽을 수 있으면 공지 안 띄움. 5초 안에 답이 없으면 막힌 것으로 보고 띄움 */
    var t = setTimeout(function(){ if (!done){ done = true; show(); } }, 5000);
    fetch(PROBE + Math.floor(Date.now() / 300000), {cache: "no-store"}).then(function(r){
      if (done) return; done = true; clearTimeout(t);
      /* 🩹 sw.js 가 404 일 때 예전 저장본(X-From-Cache)을 대신 줌 → 저장본은 「풀림」으로 안 셈 */
      if (!r.ok || r.headers.get("X-From-Cache")) show();
    }).catch(function(){ if (!done){ done = true; clearTimeout(t); show(); } });
  }

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", go); else go();
})();
;
__bk(93);
/* ======== stab.js ======== */
/* 🛡 11/18 안정도 (사용자 「어플 안정도를 좀 높여 포괄적으로」) — 묶음 맨 끝에서 읽힘
   ① 화면 그리기 보호: go()(탭 열기)가 그리다 오류를 내면 전엔 화면이 반쯤 그려진 채 멈추거나 비었음
      → 오류를 수집(early.js chErr)하고, 맨 위에 「⚠ 이 화면 일부를 못 그렸어요 · 다시 그리기」 띠. 이미 그려진 것은 그대로 둠.
   ② 끝없는 「불러오는 중…」 막기: 화면에 보이는 「불러오는 중」이 30초 넘게 그대로면 「⏳ 오래 걸려요 · 다시 시도」 단추로 바꿈
      (자료가 안 오거나 그리기가 중간에 멈춘 경우 — 전엔 하염없이 돌았음).
   ③ 화면 지킴이 반복 오류 막기: 모든 보정 스크립트는 그대로 */
(function(){
  if (typeof window.go !== "function" || window.go.__stab) return;
  var G = window.go;
  function bar(msg){
    var m = document.getElementById("main"); if (!m) return;
    var old = document.getElementById("stabbar"); if (old) old.remove();
    var b = document.createElement("div"); b.id = "stabbar";
    b.style.cssText = "margin:8px 12px;padding:10px 12px;border-radius:12px;background:rgba(255,170,0,.14);border:1px solid rgba(255,170,0,.45);font-size:13px;line-height:1.45";
    b.innerHTML = "⚠ " + msg + ' <button type="button" class="btn" style="margin-left:6px">다시 그리기</button>';
    b.querySelector("button").onclick = function(){ b.remove(); try { if (window.getJSONdrop) getJSONdrop(); G(window.cur, (typeof curDate !== "undefined" && window.M && M.cats && M.cats[window.cur]) ? curDate : undefined); } catch(e) { location.reload(); } };
    m.insertBefore(b, m.firstChild);
  }
  var guarded = function(key, id){
    try { return G.apply(this, arguments); }
    catch(e){
      if (window.chErr) chErr("render", (e && e.message) || e, (e && e.stack && (/([^\/\s(]+\.js)/.exec(e.stack) || [])[1]) || "", " · " + key);
      try { bar("이 화면 일부를 못 그렸어요"); } catch(z) {}
    }
  };
  guarded.__stab = 1;
  try { window.go = guarded; go = guarded; } catch(e) {}

  // ② 「불러오는 중」 지킴이
  var seen = typeof WeakMap === "function" ? new WeakMap() : null;
  if (!seen) return;
  setInterval(function(){
    if (document.hidden) return;
    var L = document.querySelectorAll("#main .loading, #main .ez-skel, #main .wow-sk, #main .ez-ph"), now = Date.now();   // 🛡 11/18 16시: 회색 뼈대·「불러오는 중」 글자도
    for (var i = 0; i < L.length; i++){
      var el = L[i]; if (!el.offsetParent || el.__stabDone) continue;
      var t = seen.get(el); if (!t){ seen.set(el, now); continue; }
      if (now - t < 25000) continue;
      el.__stabDone = 1;
      if (window.chErr) chErr("stuck", "30초 넘게 불러오는 중", "", " · " + (window.cur || "") + " · " + String(el.textContent || "").slice(0, 20));
      el.innerHTML = '⏳ 오래 걸려요 (인터넷이 느리거나 자료가 아직 없어요) <button type="button" class="btn" style="margin-left:6px">다시 시도</button>';
      el.querySelector("button").onclick = function(){ try { if (window.getJSONdrop) getJSONdrop(); G(window.cur, (typeof curDate !== "undefined" && window.M && M.cats && M.cats[window.cur]) ? curDate : undefined); } catch(e) { location.reload(); } };
    }
  }, 3000);
})();
;
__bk(94);
__be(8);
