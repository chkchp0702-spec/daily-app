/* 📌 내 고객 상품 (10/28 사용자 「동료 PB」 ③) — 동료 PB 가 자기 고객이 든 채권·펀드를 담아 두면
   🏠 오늘 맨 위에 「오늘 내 고객 상품 중 챙길 것」: 만기 D-n · 이자일 · 펀드 큰 등락 · ELS 다음 평가(ELS 는 📌 관제탑 것을 같이 씀).
   휴대폰에만 저장(cpin) · 서버 알림용으로는 종류·코드·이름·만기만 올림(plus.js sync 의 cp). 고객 이름은 어디에도 없음. */
(function(){
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pins(){ var a = ls("cpin"); return Array.isArray(a) ? a : []; }
  function save(L){ ls("cpin", L); try { if (window.store){ store.cp = L.map(function(p){ return [p.k, p.id, p.nm, p.mat || null]; }); if (typeof window.save === "function") window.save(); } } catch(x) {} try { if (window.__cpSync) __cpSync(); } catch(x) {} }
  function kst(){ return new Date(Date.now() + 9 * 3600e3); }
  function ymd(d){ return d.toISOString().slice(0, 10); }
  function dday(s){ if (!s) return null; var t = new Date(s + "T00:00:00Z"), n = new Date(ymd(kst()) + "T00:00:00Z"); return Math.round((t - n) / 864e5); }
  function addM(s, m){ var d = new Date(s + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + m); return ymd(d); }
  var KN = {krw: "원화 채권", ust: "미국채", aud: "호주국채", brl: "브라질국채", fund: "펀드", els: "ELS"};

  // ---------- 담기 단추: 펼친 상품 카드 안 ----------
  function pinBtns(){
    if (!window.__pdObj) return;
    [].forEach.call(document.querySelectorAll("#pdroot .pd-tap.on > .pd-x:not([data-cp])"), function(p){
      p.setAttribute("data-cp", "1"); var row = p.parentNode, R = __pdObj(row.dataset.x); if (!R) return;
      var k = R.k, o = R.o, it = null;
      if (k === "krw") it = {k: k, id: o.code, nm: o.name, mat: o.mat, cpn: o.cpn, freq: o.freq, issue: o.issue, ctype: o.ctype};
      else if (k === "ust" || k === "aud" || k === "brl") it = {k: k, id: o.name, nm: o.name, mat: o.mat, cpn: o.cpn, freq: 6, issue: o.issue};
      else if (k === "fund" && !o.pv) it = {k: "fund", id: o.c, nm: o.n};
      if (!it || !it.id) return;
      var have = pins().some(function(x){ return x.k === it.k && x.id === it.id; });
      var b = document.createElement("button"); b.className = "em-add cp-pin"; b.type = "button";
      b.textContent = have ? "📌 내 고객 상품에 담겨 있어요" : "📌 내 고객 상품에 담아 두기"; b.disabled = have;
      b.onclick = function(ev){ ev.stopPropagation(); var L = pins(); if (!L.some(function(x){ return x.k === it.k && x.id === it.id; })){ it.at = ymd(kst()); L.push(it); save(L); }
        b.textContent = "📌 담았어요 — 🏠 오늘 맨 위에서 챙겨요"; b.disabled = true; };
      p.appendChild(b);
    });
  }

  // ---------- 챙길 것 계산 ----------
  function bondItems(p){
    var out = [], dm = dday(p.mat);
    if (dm != null && dm >= 0 && dm <= 45) out.push({lv: dm <= 7 ? 2 : 1, t: "만기 D-" + dm + (dm === 0 ? " (오늘)" : "") + " · 재투자 상담", d: p.mat});
    if (p.freq && p.issue && !/복리|할인/.test(p.ctype || "")){
      var t = p.issue, n = 0; while (t < ymd(kst()) && n < 600){ t = addM(t, p.freq); n++; }
      var di = dday(t); if (di != null && di >= 0 && di <= 7) out.push({lv: 1, t: "이자 지급일 D-" + di + (p.cpn ? " (표면 " + p.cpn + "%)" : ""), d: t});
    }
    return out;
  }
  function fundItems(p, F){
    var f = F && F[p.id]; if (!f) return [];
    var out = [];
    if (f.w1 != null && Math.abs(f.w1) >= 3) out.push({lv: Math.abs(f.w1) >= 6 ? 2 : 1, t: "1주 " + (f.w1 > 0 ? "+" : "") + f.w1.toFixed(1) + "% · 고객에게 한마디", d: f.d});
    else if (f.m1 != null && Math.abs(f.m1) >= 5) out.push({lv: 1, t: "1개월 " + (f.m1 > 0 ? "+" : "") + f.m1.toFixed(1) + "%", d: f.d});
    return out;
  }
  function elsItems(it){
    var out = []; if (!it.key || !it.base) return out;
    var pr = String(it.key).split("|"), cyc = +pr[2] || 6, bars = (pr[1] || "").split("-"), t = it.base, k = 0;
    while (t <= ymd(kst()) && k < bars.length){ t = addM(it.base, cyc * (k + 1)); k++; }
    var d = dday(t); if (d != null && d >= 0 && d <= 21) out.push({lv: d <= 7 ? 2 : 1, t: (k === bars.length ? "만기 평가" : k + "차 평가") + " D-" + d + (bars[k - 1] ? " · 배리어 " + bars[k - 1] : ""), d: t});
    return out;
  }
  var FUND = null;
  function funds(){ if (FUND) return FUND; return FUND = fetch("archive/x/products.json?" + Math.floor(Date.now() / 1800e3)).then(function(r){ return r.ok ? r.json() : null; }).then(function(D){ var m = {}; ((D && D.funds) || []).forEach(function(f){ m[f.c] = f; }); return m; }).catch(function(){ return {}; }); }

  // ---------- 🏠 카드 ----------
  function card(){
    var L = pins(), E = (ls("elsmy") || []), all = L.length + E.length;
    var b = document.getElementById("hmbody"); if (!b) return;
    var old = document.getElementById("cpcard");
    if (!all){ if (old) old.remove(); return; }
    funds().then(function(F){
      var rows = [];
      L.forEach(function(p){ (p.k === "fund" ? fundItems(p, F) : bondItems(p)).forEach(function(x){ rows.push({p: p, x: x}); }); });
      E.forEach(function(it){ elsItems(it).forEach(function(x){ rows.push({p: {k: "els", id: it.id, nm: it.nm}, x: x}); }); });
      rows.sort(function(a, b2){ return b2.x.lv - a.x.lv || (a.x.d < b2.x.d ? -1 : 1); });
      var sig = all + "|" + rows.map(function(r){ return r.p.id + r.x.t; }).join(",");
      if (old && old.dataset.sig === sig) return;
      var h = '<section class="card cpc" id="cpcard" data-sig="' + e(sig) + '" data-cz="done"><h3>📌 오늘 내 고객 상품 <span class="mut">' + all + '개 담음</span></h3>' +
        (rows.length ? '<div class="cp-l">' + rows.slice(0, 8).map(function(r){ return '<div class="cp-r lv' + r.x.lv + '"><span class="cp-k">' + e(KN[r.p.k] || r.p.k) + '</span><b>' + e(String(r.p.nm).slice(0, 28)) + '</b><small>' + e(r.x.t) + '</small></div>'; }).join("") + '</div>' +
          (rows.length > 8 ? '<p class="note" style="margin:4px 0 0">외 ' + (rows.length - 8) + '건</p>' : '') :
          '<p class="note" style="margin:0">오늘 챙길 건 없어요 — 만기·이자일 7일 안, 펀드 1주 ±3% 넘게, ELS 평가 3주 안이면 여기 떠요.</p>') +
        '<div class="cp-ft"><button type="button" data-cpm="1">목록 · 빼기</button><span class="mut">채권·펀드는 상품 카드를 펼쳐 📌 담아요 · ELS 는 관제탑</span></div>' +
        '<div id="cpm" hidden></div></section>';
      if (old) old.outerHTML = h; else { var hero = b.querySelector(":scope > .hero, :scope > #tdhero"), box = document.createElement("div"); box.innerHTML = h; var c = box.firstChild; if (hero && hero.nextSibling) b.insertBefore(c, hero.nextSibling); else b.insertBefore(c, b.firstChild); }
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target;
    if (t.closest && t.closest("[data-cpm]")){ ev.stopPropagation(); var m = document.getElementById("cpm"); if (!m) return; m.hidden = !m.hidden; if (!m.hidden) m.innerHTML = pins().map(function(p, i){ return '<div class="cp-r"><span class="cp-k">' + e(KN[p.k] || p.k) + '</span><b>' + e(String(p.nm).slice(0, 30)) + '</b>' + (p.mat ? '<small>만기 ' + e(p.mat) + '</small>' : '') + '<button type="button" data-cpx="' + i + '">✕</button></div>'; }).join("") + ((ls("elsmy") || []).length ? '<p class="note" style="margin:6px 0 0">ELS ' + (ls("elsmy") || []).length + '개는 🎯 ELS 관제탑에서 빼요</p>' : '') + (pins().length ? '' : '<p class="note" style="margin:0">담은 채권·펀드가 없어요</p>'); return; }
    var x = t.closest && t.closest("[data-cpx]"); if (x){ ev.stopPropagation(); var L = pins(); L.splice(+x.dataset.cpx, 1); save(L); var o = document.getElementById("cpcard"); if (o) o.remove(); card(); return; }
  }, true);

  var css = document.createElement("style");
  css.textContent = ".cp-l{display:flex;flex-direction:column;gap:6px}.cp-r{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding:7px 10px;border-radius:10px;background:var(--panel2)}.cp-r.lv2{background:rgba(255,107,107,.12)}" +
    ".cp-k{font-size:11.5px;color:var(--mut,#8a94a8);min-width:52px}.cp-r b{font-size:14px}.cp-r small{width:100%;color:var(--sub,#aab);font-size:12.5px}.cp-r button{margin-left:auto;background:none;border:0;color:var(--mut,#8a94a8);font-size:14px}" +
    ".cp-ft{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px}.cp-ft button{font:inherit;font-size:12.5px;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.cp-pin{margin-top:8px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { pinBtns(); } catch(x) {} try { card(); } catch(x) {} }, 300); }
  try { new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t && t.closest && t.closest("#cpcard")) return; } soon(); }).observe(document.body, {childList: true, subtree: true}); } catch(x) {}
  window.__cpPins = pins;
  soon();
})();
