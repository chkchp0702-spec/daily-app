/* ⚠️ 거래폭발 = 「따라 사지 마세요」 경고 (10/28 사용자 「넣어」)
   1분 자료 15거래일 검증: 거래가 갑자기 터진 종목(1분 거래대금이 그날 평균의 5배 + 2분 새 +1% 넘게 · VWAP 위)은
   그날 종가까지 시장(거래대금 상위 500종목 가운데값)보다 평균 −2.7%p 더 빠졌고, 15일 중 13일이 그랬음.
   → 사는 신호가 아니라 경고. stock-screener 가 장중 매분 data/burst_warn.json 에 쌓고, 여기서 2분마다 읽어 신호 화면 위에 보여 줌. */
(function(){
  var URL = "https://raw.githubusercontent.com/chkchp0702-spec/stock-screener/main/data/burst_warn.json";
  // 10/29 사용자 「단타 화면이 없으니 감춰~ 기록만 해둬」 → 어느 화면에도 안 띄움 · 기록은 stock-screener data/burst_log.csv 에 계속 쌓임
  var TABS = {};
  var W = null, at = 0;
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function kst(){ var d = new Date(Date.now() + 9 * 3600e3); return d.toISOString().slice(0, 10).replace(/-/g, ""); }
  function inWL(code){ try { var wl = (window.store && store.wl) || {}; for (var k in wl) if (String(k).replace(/\D/g, "").slice(0, 6) === code) return true; } catch(x) {} return false; }
  function load(){
    if (Date.now() - at < 110e3) return Promise.resolve(W);
    at = Date.now();
    return fetch(URL + "?" + Math.floor(Date.now() / 60000)).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ W = j; return j; }).catch(function(){ return W; });
  }
  function html(j){
    var L = (j.items || []).slice().reverse(), star = L.filter(function(x){ return inWL(x.code); });
    var row = function(x){ var w = inWL(x.code);
      return '<div class="bw-r' + (w ? ' bw-w' : '') + '"><span class="bw-t">' + e(x.t) + '</span><a href="https://m.stock.naver.com/domestic/stock/' + e(x.code) + '/total" target="_blank" rel="noopener"><b>' + (w ? '⭐ ' : '') + e(x.name) + '</b></a>' +
        '<span class="bw-v">' + (x.chg >= 0 ? "+" : "") + x.chg + '%</span><small>거래 ×' + x.x + ' · 2분 +' + x.px2 + '%</small></div>'; };
    var top = L.slice(0, 4), rest = L.slice(4);
    return '<section class="card bw" id="bwcard" data-cz="done"><h3>⚠️ 지금 따라 사지 마세요 <span class="mut">거래 폭발 ' + L.length + '개 · ' + e(j.at || "") + '</span></h3>' +
      (star.length ? '<div class="bw-star">⭐ 관심 종목 ' + star.map(function(x){ return e(x.name); }).join(", ") + ' — 들고 있다면 차익 실현을 생각해 볼 때예요</div>' : '') +
      '<div class="bw-l">' + top.map(row).join("") + '</div>' +
      (rest.length ? '<details class="bw-more"><summary>나머지 ' + rest.length + '개</summary>' + rest.map(row).join("") + '</details>' : '') +
      '<p class="note">' + e(j.why || "거래폭발 종목은 그날 종가까지 시장보다 평균 −2.7%p 더 빠졌어요") + '. 급하게 거래가 터진 뒤엔 대개 식어요 — 사라·팔라는 뜻이 아니라 「쫓아 사지 말자」는 경고예요.</p></section>';
  }
  function mount(){
    var k = (typeof cur !== "undefined" && cur) || "";
    var old = document.getElementById("bwcard");
    if (!TABS[k]){ if (old) old.remove(); return; }
    load().then(function(j){
      var k2 = (typeof cur !== "undefined" && cur) || "", o = document.getElementById("bwcard");
      if (!TABS[k2] || !j || j.date !== kst() || !(j.items || []).length){ if (o) o.remove(); return; }
      var h = html(j);
      if (o){ if (o.dataset.sig !== j.at + "|" + j.items.length){ o.outerHTML = h; o = document.getElementById("bwcard"); if (o) o.dataset.sig = j.at + "|" + j.items.length; } return; }
      var m = document.getElementById("main"); if (!m) return;
      var hero = m.querySelector(":scope > .hero"), box = document.createElement("div"); box.innerHTML = h; var c = box.firstChild;
      c.dataset.sig = j.at + "|" + j.items.length;
      if (hero && hero.nextSibling) m.insertBefore(c, hero.nextSibling); else m.insertBefore(c, m.firstChild);
    });
  }
  var css = document.createElement("style");
  css.textContent = ".bw{border:1.5px solid rgba(255,107,107,.55)!important;background:linear-gradient(180deg,rgba(255,107,107,.08),transparent 60%)}" +
    ".bw-r{display:flex;align-items:baseline;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);flex-wrap:wrap}.bw-r:last-child{border-bottom:0}" +
    ".bw-t{font-variant-numeric:tabular-nums;color:var(--mut,#8a94a8);font-size:12.5px;min-width:38px}.bw-r a{color:var(--text);text-decoration:none}" +
    ".bw-v{color:#ff6b6b;font-weight:700;margin-left:auto}.bw-r small{width:100%;padding-left:46px;color:var(--mut,#8a94a8);font-size:12px}" +
    ".bw-w{background:rgba(255,200,60,.10);border-radius:8px;padding-left:4px}.bw-star{margin:0 0 8px;padding:8px 10px;border-radius:10px;background:rgba(255,200,60,.14);font-weight:700;font-size:13.5px}" +
    ".bw-more summary{cursor:pointer;color:var(--mut,#8a94a8);padding:6px 0;font-size:13px}";
  document.head.appendChild(css);
  var T = null;
  function soon(){ if (!T) T = setTimeout(function(){ T = null; try { mount(); } catch(x) {} }, 400); }
  try { new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++){ var t = ms[i].target; if (t && t.closest && t.closest("#bwcard")) return; } soon(); }).observe(document.getElementById("main") || document.body, {childList: true}); } catch(x) {}
  setInterval(function(){ if (!document.hidden){ at = 0; mount(); } }, 120e3);
  window.__bwMount = mount;
  soon();
})();
