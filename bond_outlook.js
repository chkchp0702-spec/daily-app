/* 📄 채권 전망 보고서 (11/05 사용자 「국채·미국채·브라질국채를 선택했을 때 시황에 맞춘 전망 보고서를 매일 아침 미리 만들어 두고 탭하면 바로 — 한 장 + PDF 풀버전」)
   🛍 상품 › 채권 › 🇰🇷 국채 · 🇺🇸 미국채 · 🇧🇷 브라질(헤알·달러) 칸 맨 위에 카드 하나:
     오늘 판정(🟢 담기 좋은 자리 · 🟡 나눠서 담기 · ⚪ 서두를 필요 없음) + 한 줄 + [🖼 한 장] [📑 PDF 풀버전]
   파일은 bond_outlook.py 가 매일 아침(평일 08:05) 미리 만듦 → archive/x/bond_outlook/{ktb,ust,brl}.jpg·.pdf · index.json
   한 장 = 휴대폰 화면 크기 그림(📨 카톡 보내기) · PDF = 앱 안 PDF 보기(pdfBig, 저장 단추 있음) */
(function(){
  var MAP = {gov: "ktb", ust: "ust", brl: "brl", bru: "brl"}, IDX = null, BASE = "archive/x/bond_outlook/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function idx(){ return IDX || (IDX = getJSON(BASE + "index.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ IDX = null; return null; })); }
  function ver(J){ return encodeURIComponent((J && J.at) || ""); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function today(){ return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }

  function card(J, k){
    var it = J && J.items && J.items[k];
    if (!it) return '<div class="bo-c bo-none">📄 오늘 전망 보고서는 아침 8시쯤 올라와요.</div>';
    var old = J.date && J.date !== today();
    return '<div class="bo-c" data-bok="' + k + '"><div class="bo-h"><span class="bo-t">📄 ' + e(it.title) + ' 보고서</span><span class="bo-d">' + e(md(J.date)) + ' ' + e(J.edition || "") + (old ? ' · 지난 판' : '') + '</span></div>' +
      '<div class="bo-v"><b style="background:' + e(it.color) + '">' + e(it.tag) + ' ' + e(it.verdict) + '</b><span>📐 ' + e(it.stance) + '</span></div>' +
      '<p class="bo-o">' + e(it.one) + '</p>' +
      '<div class="bo-b"><button type="button" class="bo-one" data-bo1="' + k + '">🖼 한 장 보기<small>휴대폰 한 장 · 바로 보내기</small></button><button type="button" class="bo-pdf" data-bop="' + k + '">📑 PDF 풀버전<small>7쪽 · 차트·시나리오·계산</small></button></div></div>';
  }
  function fill(){
    var s = document.querySelector("#pdbody .bo-slot"); if (!s || s.dataset.done) return;
    var k = MAP[s.dataset.bo]; if (!k) return;
    s.dataset.done = "1";
    idx().then(function(J){ if (document.body.contains(s)) s.innerHTML = card(J, k); });
  }
  function oneOpen(k){
    idx().then(function(J){
      var it = J && J.items && J.items[k]; if (!it) return;
      var url = BASE + k + ".jpg?v=" + ver(J), d = document.createElement("div");
      d.className = "bo-ov";
      d.innerHTML = '<div class="bo-top"><button type="button" class="bo-x" aria-label="닫기">✕</button><b>' + e(it.title) + ' · 한 장</b><span style="flex:1"></span><button type="button" class="bo-send">📨 보내기</button></div><div class="bo-img"><img alt="" src="' + url + '"></div>';
      document.body.appendChild(d); document.body.classList.add("sheet-open");
      var close = function(){ d.remove(); document.body.classList.remove("sheet-open"); };
      d.querySelector(".bo-x").onclick = close;
      d.querySelector(".bo-send").onclick = function(){
        var b = this; b.textContent = "준비 중…";
        fetch(url).then(function(r){ return r.blob(); }).then(function(bl){
          var name = it.title.replace(/^\S+\s/, "").replace(/\s/g, "_") + "_" + (J.date || "") + ".jpg", f = new File([bl], name, {type: "image/jpeg"});
          if (navigator.canShare && navigator.canShare({files: [f]})) return navigator.share({files: [f]});
          var a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = name; document.body.appendChild(a); a.click(); a.remove();
        }).catch(function(){}).then(function(){ b.textContent = "📨 보내기"; });
      };
    });
  }
  function pdfOpen(k){
    idx().then(function(J){
      var it = J && J.items && J.items[k]; if (!it) return;
      var url = BASE + k + ".pdf?v=" + ver(J);
      if (window.pdfBig) pdfBig(url, it.title + " 보고서 " + md(J.date)); else window.open(url, "_blank");
    });
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-bo1],[data-bop]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    if (t.dataset.bo1) oneOpen(t.dataset.bo1); else pdfOpen(t.dataset.bop);
  }, true);
  var T = null;
  new MutationObserver(function(){ if (!T) T = setTimeout(function(){ T = null; try { fill(); } catch(x) {} }, 60); }).observe(document.documentElement, {childList: true, subtree: true});
  window.__bondOutlook = {card: card, idx: idx};   // 검사용

  var css = document.createElement("style");
  css.textContent =
    ".bo-c{background:linear-gradient(135deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:18px;padding:14px 14px 12px;margin:0 0 12px}" +
    ".bo-none{color:var(--sub);font-size:13.5px}" +
    ".bo-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.bo-t{font-weight:800;font-size:15.5px}.bo-d{color:var(--dim);font-size:12.5px;white-space:nowrap}" +
    ".bo-v{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:9px 0 6px}.bo-v b{color:#fff;font-size:13.5px;border-radius:999px;padding:4px 11px}.bo-v span{font-size:12.5px;color:var(--sub)}" +
    ".bo-o{margin:0 0 10px;font-size:14px;line-height:1.55;color:var(--text)}" +
    ".bo-b{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bo-b button{appearance:none;border:0;border-radius:14px;padding:11px 10px;font:inherit;font-weight:800;font-size:14.5px;color:#fff;cursor:pointer;text-align:left}" +
    ".bo-b button small{display:block;font-weight:500;font-size:11.5px;opacity:.85;margin-top:2px}.bo-one{background:#2f6fdf}.bo-pdf{background:#334155}" +
    ".bo-ov{position:fixed;inset:0;z-index:2147483000;background:#05080f;display:flex;flex-direction:column}" +
    ".bo-top{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;color:#fff}.bo-top b{font-size:15px}" +
    ".bo-top button{appearance:none;border:0;border-radius:12px;padding:8px 12px;font:inherit;font-weight:800;color:#fff;background:rgba(255,255,255,.14)}.bo-top .bo-send{background:#fee500;color:#191919}" +
    ".bo-img{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:0 10px calc(env(safe-area-inset-bottom,0px) + 14px)}.bo-img img{display:block;width:100%;max-width:560px;margin:0 auto;border-radius:14px}";
  document.head.appendChild(css);
})();
