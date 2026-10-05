/* CH Investing — 2차 업그레이드: ⭐ 관심종목·메모 + 9개 탭 기능 45개 */
(function(){
  var e = V.e, sgn = V.sgn, cls = V.cls, fmt = V.fmt;
  var XC = {};
  function X(name){ if (!XC[name]) XC[name] = getJSON("archive/x/" + name + "?" + (M.updated || "")).catch(function(){ XC[name] = null; return null; }); return XC[name]; }
  function card(title, body, extra, id){ return '<section class="card"' + (id ? ' id="' + id + '"' : '') + '>' + (title ? '<h3>' + title + (extra || "") + '</h3>' : '') + body + '</section>'; }
  function chip(t, c){ return '<span class="chip2 ' + (c || "") + '">' + t + '</span>'; }
  function pct(v){ return v == null || isNaN(v) ? "–" : sgn(v) + "%"; }
  function opA(code, inner){ return '<a class="xo" href="javascript:openOP(\'' + e(code).replace(/'/g, "") + '\')">' + inner + '</a>'; }
  function kn(c){ c = String(c || ""); return /^\d{6}(\.K[SQ])?$/.test(c) ? c.slice(0, 6) : c; }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function dAdd(d, n){ var t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
  function dDiff(a, b){ return Math.round((new Date(a + "T00:00:00Z") - new Date(b + "T00:00:00Z")) / 864e5); }
  function md(d){ return String(d || "").slice(5, 10).replace("-", "/"); }
  function latest(cat, fname){
    var L = (M.cats[cat] || []).filter(function(x){ return x.files.indexOf(fname) >= 0; });
    return L.length ? getJSON(file(cat, L[0].id, fname)).catch(function(){ return null; }) : Promise.resolve(null);
  }
  function compassNow(){ return latest("sector", "compass.json"); }
  function after(fn){ setTimeout(fn, 0); }
  function wrap(key, top, bottom){
    var OLD = RENDER[key];
    RENDER[key] = function(it, el){
      el.innerHTML = '<div class="pa"></div><div class="po"></div><div class="pb"></div>';
      var a = el.querySelector(".pa"), o = el.querySelector(".po"), b = el.querySelector(".pb");
      OLD(it, o);
      if (top) try { top(it, a, o); } catch(err) { console.error(err); }
      if (bottom) try { bottom(it, b, o); } catch(err) { console.error(err); }
    };
  }
  // 화면에 새로 생기는 요소마다 한 번씩 손대기
  var EACHN = 0;
  function each(root, sel, fn){
    var tag = "data-pl" + (++EACHN);
    var run = function(){ [].forEach.call(root.querySelectorAll(sel + ":not([" + tag + "])"), function(x){ x.setAttribute(tag, "1"); try { fn(x); } catch(err) { console.error(err); } }); };
    run(); new MutationObserver(run).observe(root, {childList: true, subtree: true});
  }

  /* =================== ⭐ 관심종목 · 메모 =================== */
  var WL = store.wl || {};
  if (!store.uid){ store.uid = Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, "x"); save(); }
  var UID = store.uid;
  function wlSave(){ store.wl = WL; save(); syncSoon(); refreshStars(); }
  function inWL(code){ return !!WL[kn(code)]; }
  function wlToggle(code, name){
    var k = kn(code);
    if (WL[k]){ if (!confirm((WL[k].n || k) + " 을(를) 관심종목에서 뺄까요?")) return false; delete WL[k]; wlSave(); toast("관심종목에서 뺐어요"); return false; }
    WL[k] = {n: name || k, s: code, t: today()};
    V.price(code).then(function(p){ if (p && WL[k]){ WL[k].p0 = p[1]; wlSave(); } });
    wlSave(); toast("⭐ 관심종목에 담았어요 — 신호가 뜨면 알려드려요");
    return true;
  }
  window.wlToggle = wlToggle;
  function starBtn(code, name, big){
    return '<button class="star' + (inWL(code) ? " on" : "") + (big ? " big" : "") + '" data-star="' + e(code) + '" data-nm="' + e(name || "") + '" aria-label="관심종목">' + (inWL(code) ? "★" : "☆") + (big ? '<span>' + (inWL(code) ? "관심종목" : "관심종목 담기") + '</span>' : '') + '</button>';
  }
  function refreshStars(){
    [].forEach.call(document.querySelectorAll("[data-star]"), function(b){
      var on = inWL(b.getAttribute("data-star"));
      b.classList.toggle("on", on);
      b.firstChild.nodeValue = on ? "★" : "☆";
      var sp = b.querySelector("span"); if (sp) sp.textContent = on ? "관심종목" : "관심종목 담기";
    });
    var hb = $("wlbtn"); if (hb) hb.querySelector("em").textContent = Object.keys(WL).length || "";
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-star]");
    if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    wlToggle(b.getAttribute("data-star"), b.getAttribute("data-nm"));
  }, true);
  function toast(t){
    var x = document.createElement("div"); x.className = "toast"; x.textContent = t; document.body.appendChild(x);
    setTimeout(function(){ x.classList.add("on"); }, 10); setTimeout(function(){ x.classList.remove("on"); setTimeout(function(){ x.remove(); }, 300); }, 2200);
  }

  // 서버 알림을 위해 관심종목·목표가만 올리기 (메모 글은 휴대폰에만)
  var SYNC = "chkchp-ch-sync", ST = null;
  function syncSoon(){ clearTimeout(ST); ST = setTimeout(sync, 2500); }
  function sync(){
    var al = store.al || {};
    var body = {uid: UID, wl: Object.keys(WL).map(function(k){ var w = WL[k]; return [k, (w.n || k).slice(0, 40), w.buy || null, w.tgt || null, w.stop || null]; }),
                quiet: al.quiet || [23, 7], brief: al.brief === 0 ? 0 : 1, lim: al.lim || null};
    fetch("https://ntfy.sh/" + SYNC, {method: "POST", body: JSON.stringify(body)}).then(function(){ store.synced = today(); save(); }).catch(function(){});
  }
  if (store.synced !== today() && (Object.keys(WL).length || store.al)) setTimeout(sync, 4000);
  window.MYTOPIC = "chkchp-ch-u-" + UID;

  // 헤더 ⭐ 버튼
  (function(){
    var top = document.querySelector("header .top"); if (!top) return;
    var b = document.createElement("button"); b.id = "wlbtn"; b.innerHTML = "⭐<em>" + (Object.keys(WL).length || "") + "</em>";
    b.onclick = function(){ openWL(); };
    top.insertBefore(b, $("stamp"));
  })();

  function openWL(){
    navPush({t: "go", key: cur, id: curDate});
    closeSheet();
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button class="sh-x" onclick="goBack()">✕</button><b>⭐ 내 관심종목</b></div><div class="sh-body" id="wlbody"><div class="loading">불러오는 중…</div></div>';
    document.body.appendChild(sh); document.body.classList.add("sheet-open"); updBack();
    drawWL();
  }
  window.openWL = openWL;
  function drawWL(){
    var box = $("wlbody"); if (!box) return;
    var ks = Object.keys(WL);
    if (!ks.length){ box.innerHTML = '<div class="empty"><div class="big">⭐</div>아직 담은 종목이 없어요.<br>카드나 종목리포트의 <b>☆</b>를 누르면 여기에 모여요.<br><br><small class="mut">담은 종목에 컵·갭·매집·고래·단타 신호가 뜨면 알림을 받을 수 있어요 (🔔 알림 탭).</small></div>'; return; }
    Promise.all([X("earn_cal.json"), X("whale_holdings.json"), todaySignals()]).then(function(r){
      var EC = r[0], WH = r[1], SG = r[2];
      var holders = whaleHolders(WH);
      var h = '<p class="note" style="margin:0 2px 12px">신호가 뜬 종목이 위로 와요. 누르면 종목리포트, ✏️로 매수가·목표가·손절가·메모.</p>';
      ks.sort(function(a, b){ return (SG[b] ? 1 : 0) - (SG[a] ? 1 : 0) || (WL[a].n || a).localeCompare(WL[b].n || b); });
      h += ks.map(function(k){
        var w = WL[k], sg = SG[k] || [], ec = ((EC && EC.items) || []).filter(function(x){ return kn(x.s) === k; })[0], wh = holders[k] || [];
        return '<section class="card wl" data-k="' + e(k) + '"><div class="row"><div class="wl-n">' + opA(w.s || k, '<b>' + e(w.n || k) + '</b> <em class="tk">' + e(V.cd(w.s || k)) + '</em>') + '</div>' +
          '<div class="wl-p" data-wp="' + e(w.s || k) + '">…</div></div>' +
          (sg.length ? '<div class="wl-sg">' + sg.map(function(s){ return '<a class="chip2 hot" href="javascript:go(\'' + s[1] + '\')">' + e(s[0]) + '</a>'; }).join("") + '</div>' : '') +
          '<div class="wl-m">' + (w.buy ? '<span>매수 ' + fmt(w.buy) + '</span>' : '') + (w.tgt ? '<span class="up">🎯 ' + fmt(w.tgt) + '</span>' : '') + (w.stop ? '<span class="dn">🛑 ' + fmt(w.stop) + '</span>' : '') +
          (ec ? '<span>📅 ' + e(ec.kind) + ' ' + md(ec.d) + '</span>' : '') + (wh.length ? '<span>🐋 ' + e(wh.slice(0, 2).map(function(x){ return x[0]; }).join(", ")) + (wh.length > 2 ? " 외 " + (wh.length - 2) : "") + '</span>' : '') + '</div>' +
          (w.memo ? '<p class="wl-memo">📝 ' + e(w.memo) + '</p>' : '') +
          '<div class="row" style="margin-top:8px"><span class="mut">' + md(w.t) + ' 담음' + (w.p0 ? ' · 그때 ' + fmt(w.p0) : '') + '</span><span><button class="btn wl-ed" data-k="' + e(k) + '">✏️ 메모</button> <button class="btn wl-rm" data-k="' + e(k) + '">빼기</button></span></div></section>';
      }).join("");
      h += '<section class="card"><h3>🔔 관심종목 알림 받기</h3><p class="note" style="margin-top:0">담은 종목에 신호가 뜨거나 목표가·손절가에 닿으면 이 휴대폰으로 알려줘요 (ntfy 앱 필요).</p>' +
        '<div class="al-b"><a class="btn al-sub" href="ntfy://ntfy.sh/' + MYTOPIC + '">🔔 내 알림 구독</a><a class="btn" href="javascript:go(\'alarm\')">알림 설정 →</a></div>' +
        '<p class="note">알림을 위해 종목 코드와 목표가·손절가만 서버에 올려요 (메모 글은 이 휴대폰에만). 다른 휴대폰에선 따로 담아야 해요.</p></section>';
      box.innerHTML = h;
      [].forEach.call(box.querySelectorAll("[data-wp]"), function(x){ V.price(x.getAttribute("data-wp")).then(function(p){
        var k = kn(x.getAttribute("data-wp")), w = WL[k] || {};
        if (!p){ x.textContent = "–"; return; }
        var c = (p[1] / p[2] - 1) * 100, base = w.buy || w.p0, r = base ? (p[1] / base - 1) * 100 : null;
        x.innerHTML = '<b>' + fmt(p[1]) + '</b> <span class="' + cls(c) + '">' + sgn(c) + '%</span>' + (r != null ? '<small class="' + cls(r) + '">' + (w.buy ? "매수가" : "담은 뒤") + ' ' + sgn(r) + '%</small>' : ''); }); });
      [].forEach.call(box.querySelectorAll(".wl-rm"), function(b){ b.onclick = function(){ if (wlToggle(b.dataset.k) === false) drawWL(); }; });
      [].forEach.call(box.querySelectorAll(".wl-ed"), function(b){ b.onclick = function(){ memoForm(b.closest(".wl"), b.dataset.k, drawWL); }; });
    });
  }
  function memoForm(host, k, done){
    var w = WL[k] || {};
    var f = document.createElement("div"); f.className = "memo-f";
    f.innerHTML = '<div class="mf3"><label>매수가<input type="number" inputmode="decimal" step="any" name="buy" value="' + (w.buy || "") + '"></label>' +
      '<label>🎯 목표가<input type="number" inputmode="decimal" step="any" name="tgt" value="' + (w.tgt || "") + '"></label>' +
      '<label>🛑 손절가<input type="number" inputmode="decimal" step="any" name="stop" value="' + (w.stop || "") + '"></label></div>' +
      '<label>📝 매수 이유 · 메모<textarea name="memo" rows="3" placeholder="왜 샀나, 무엇을 보면 팔까">' + e(w.memo || "") + '</textarea></label>' +
      '<div class="row"><span class="mut">목표가·손절가에 닿으면 알림 (매시간 확인)</span><button class="btn al-sub mf-ok">저장</button></div>';
    var old = host.querySelector(".memo-f"); if (old){ old.remove(); return; }
    host.appendChild(f);
    f.querySelector(".mf-ok").onclick = function(){
      var g = function(n){ var v = parseFloat(f.querySelector("[name=" + n + "]").value); return isNaN(v) || v <= 0 ? null : v; };
      WL[k] = Object.assign(WL[k] || {n: k, s: k, t: today()}, {buy: g("buy"), tgt: g("tgt"), stop: g("stop"), memo: f.querySelector("textarea").value.trim()});
      wlSave(); toast("저장했어요"); if (done) done();
    };
  }
  window.memoForm = memoForm;
  function whaleHolders(WH){
    var o = {};
    if (!WH || !WH.m) return o;
    Object.keys(WH.m).forEach(function(nm){ (WH.m[nm].items || []).forEach(function(x){ (o[kn(x.t)] = o[kn(x.t)] || []).push([nm, x.w, x.chg]); }); });
    Object.keys(o).forEach(function(k){ o[k].sort(function(a, b){ return b[1] - a[1]; }); });
    return o;
  }
  // 오늘 탭별 신호 → {키: [[설명, 탭]]}
  var SGP = null;
  function todaySignals(){
    if (SGP) return SGP;
    SGP = Promise.all([latest("cup", "cards.json"), latest("gap", "cards.json"), latest("accum", "list.json"), latest("danta", "alerts.json"), X("whale_x.json"), X("accum_x.json")]).then(function(r){
      var o = {}, add = function(c, t, tab){ (o[kn(c)] = o[kn(c)] || []).push([t, tab]); };
      var cu = r[0] || {}; (cu.ath || []).concat(cu.top || []).forEach(function(c){ if (c.brk) add(c.code, "☕ 컵 돌파", "cup"); else if (c.dist != null && c.dist >= -3) add(c.code, "☕ 돌파 임박", "cup"); else add(c.code, "☕ 컵 후보", "cup"); });
      ((r[1] || {}).top || []).forEach(function(c){ add(c.code, "📈 갭 " + (c.hold ? "유지" : "메움"), "gap"); });
      (r[2] || []).forEach(function(c){ add(c.code, "🤫 " + (c.tag || "매집"), "accum"); });
      (r[3] || []).forEach(function(c){ add(c.code, "⚡ 단타 " + c.time, "danta"); });
      ((r[4] || {}).consensus || []).forEach(function(c){ add(c.t, "🐋 고래 " + c.n + "명 매수", "whale"); });
      ((r[5] || {}).items || []).forEach(function(c){ if (c.brk) add(c.code, "🚀 박스 돌파", "accum"); });
      return o;
    });
    return SGP;
  }

  // 카드마다 ☆ 달기 (컵·갭·매집 카드: data-spark 에 코드가 있음)
  each(document.body, ".cc", function(cc){
    var sp = cc.querySelector("[data-spark]"); if (!sp) return;
    var code = sp.getAttribute("data-spark"), nm = (cc.querySelector(".nm2 b") || {}).textContent || code;
    var row = cc.querySelector(".row"); if (row) row.insertAdjacentHTML("beforeend", starBtn(code, nm));
  });
  each(document.body, ".list .st", function(st){
    var cd = st.querySelector(".cd"), nm = st.querySelector(".nm a"); if (!cd || !nm) return;
    nm.parentNode.insertAdjacentHTML("beforeend", starBtn(cd.textContent.trim(), nm.textContent.trim()));
  });

  window.PL = {X: X, card: card, chip: chip, pct: pct, opA: opA, kn: kn, today: today, dAdd: dAdd, dDiff: dDiff, md: md, latest: latest, compassNow: compassNow,
               wrap: wrap, each: each, starBtn: starBtn, WL: function(){ return WL; }, todaySignals: todaySignals, whaleHolders: whaleHolders, toast: toast, sync: sync, memoForm: memoForm};
})();
