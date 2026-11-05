/* CH Investing — 🔍 11/05 냉정 분석 「다 진행해」 (분석 문서: 🔍 냉정 분석 — 효용·가독성·활용도 + 아이디어 2026-11-05)
   A4 홈 맨 아래 「🔮 운세 · 사주 · 타로 · 로또」 한 줄 (아래 탭에서 운세 칸을 뺐으니 여기로)
   C9 본문 글자 최소 13px — 설명·날짜에 많던 10.5~12px 글자를 13px 로 (그림·차트·표 칸·제안서 미리보기는 그대로)
   C10 홈 카드는 한 화면(520px)을 넘지 않게 — 넘치면 「전체 보기」 (simple.js clampLong 이 홈에선 520px 기준)
   C11 빈 카드는 얇은 띠 한 줄로 — 「아직 안 올라왔어요」 큰 빈 상자 대신
   C13 어두운 화면 대비 — 흐린 글자(--dim)·잠긴 칸 투명도 올림
   D17 첫 실행 30초 안내 — 조이 인사 뒤 「📝 제안서 → 📨 오늘의 한 장 → 🎯 1탭 예측」 3곳만 짚어 줌(한 번만) */
(function(){
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) {} return null; }
  function onHome(){ return typeof window.cur !== "undefined" && window.cur === "home"; }

  /* ── A4 운세 줄 ── */
  function luckRow(){
    if (!onHome()) return;
    var b = document.getElementById("hmbody"); if (!b || document.getElementById("uxluck")) return;
    var d = document.createElement("div"); d.id = "uxluck"; d.className = "ux-luck";
    d.innerHTML = [["luck", "🔮", "오늘의 운세"], ["saju", "📜", "사주"], ["tarot", "🃏", "타로"], ["lotto", "🎱", "로또"]].map(function(x){ return '<button type="button" data-go="' + x[0] + '"><span>' + x[1] + '</span>' + x[2] + '</button>'; }).join("");
    d.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-go]"); if (!t) return; ev.stopPropagation(); if (window.go) go(t.dataset.go); });
    b.appendChild(d);
  }

  /* ── C9 13px ── */
  var SKIP = "svg,canvas,header,#bnav,.ppx,.pp-pv,#ppx .px-ft,.h2-tm,.h2-tmw,.ixc,.ixc-card,.sv-bars,.chip-x,sup,sub,.pp-gb,.tz-race,.ds-ic,.kpis,.h2-wg,[data-nofs]";
  function fs13(root){
    if (!root) return;
    var L = root.querySelectorAll("small,span,em,i,b,p,div,li,td,th,a,label,button");
    for (var i = 0; i < L.length; i++){
      var el = L[i]; if (el.dataset.f13) continue; el.dataset.f13 = "1";
      if (el.closest(SKIP)) continue;
      var has = false; for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim().length > 1){ has = true; break; }
      if (!has) continue;
      var v = parseFloat(getComputedStyle(el).fontSize);
      if (v >= 10 && v < 12.9) el.style.fontSize = "13px";
    }
  }

  /* ── C11 빈 카드 → 띠 ── */
  function thin(root){
    if (!root) return;
    [].forEach.call(root.querySelectorAll(".empty"), function(x){
      if (x.dataset.thin || x.closest(".ppx,#sheet")) return;
      var others = root.querySelectorAll("section.card").length;
      if (others < 2) return;   // 화면에 이것뿐이면 그대로(무엇이 비었는지 크게 알려야 함)
      x.dataset.thin = "1"; x.classList.add("ux-thin");
    });
  }

  /* ── D17 첫 실행 안내 ── */
  var OB = [
    {sel: '#bnav [data-g="prop"]', t: "📝 제안서", d: "고객 이름 · 투자성향 · 금액만 넣으면<br>오늘 시황에 맞춘 PDF · PPT가 바로 나와요"},
    {sel: "#h2cl .h2-cl", t: "📨 오늘의 한 장", d: "고객에게 카톡으로 보낼 그림 한 장<br>👥 고객용 · 📋 PB 요약 · 📅 이번 주"},
    {sel: "#hbvote", t: "🎯 1탭 예측", d: "아침에 한 번 누르고 3시 반에 채점<br>동료 PB와 이번 주 순위 경쟁"}
  ];
  var obOn = false;
  function tour(){
    if (obOn || ls("ux_ob3") || navigator.webdriver || /[?&]embed=1/.test(location.search)) return;
    if (!ls("wow_ob") || document.getElementById("wowob") || !onHome()) return;   // 조이 첫 인사가 끝난 뒤
    if (!document.querySelector(OB[0].sel) || !document.querySelector(OB[1].sel)) return;
    obOn = true; var k = 0;
    var mask = document.createElement("div"); mask.id = "uxob"; document.body.appendChild(mask);
    function step(){
      var o = OB[k], el = document.querySelector(o.sel);
      while (!el && k < OB.length - 1){ k++; o = OB[k]; el = document.querySelector(o.sel); }
      if (!el){ end(); return; }
      if (o.sel.indexOf("#bnav") < 0) el.scrollIntoView({block: "center"});
      setTimeout(function(){
        var r = el.getBoundingClientRect(), pad = 6, top = r.top - pad, h = r.height + pad * 2;
        var below = r.top < window.innerHeight * 0.5;
        mask.innerHTML = '<div class="uxob-hole" style="left:' + (r.left - pad) + 'px;top:' + top + 'px;width:' + (r.width + pad * 2) + 'px;height:' + Math.min(h, window.innerHeight * 0.6) + 'px"></div>' +
          '<div class="uxob-tip" style="' + (below ? "top:" + Math.min(top + Math.min(h, window.innerHeight * 0.6) + 12, window.innerHeight - 190) + "px" : "bottom:" + (window.innerHeight - top + 12) + "px") + '">' +
          '<small>' + (k + 1) + ' / ' + OB.length + '</small><b>' + o.t + '</b><p>' + o.d + '</p><div><button type="button" data-ob="skip">건너뛰기</button><button type="button" class="go" data-ob="next">' + (k === OB.length - 1 ? "시작하기 🚀" : "다음") + '</button></div></div>';
      }, 260);
    }
    function end(){ ls("ux_ob3", 1); mask.remove(); obOn = false; window.scrollTo({top: 0, behavior: "smooth"}); }
    mask.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-ob]"); if (!b){ return; } ev.stopPropagation();
      if (b.dataset.ob === "next" && k < OB.length - 1){ k++; step(); } else end(); });
    step();
  }

  /* ── 🩹 11/05 「옆에 짤림… 일일이 내가 다 얘기해야 하니」 — 넘침 자동 고침 ──
     카드(또는 화면) 오른쪽 끝을 넘는 글·칸을 찾아, 그 칸부터 카드까지 거슬러 올라가며
     ① 한 줄 고정(nowrap) → 줄바꿈 허용 ② 가로 줄(flex) → 다음 줄로 넘김 ③ 표 칸(grid) → 칸 폭 줄어들게 ④ 고정 폭 → 100%까지
     를 차례로 풀어 줌. 가로로 밀어 보는 줄(스크롤)·그림·지도·제안서 미리보기는 손대지 않음. 화면을 그릴 때·카드를 펼칠 때마다 다시 봄 */
  var HX = "svg,canvas,.ppx,.pp-pv,#ppx,.h2-tmw,.sv-bars,#uxob,.ixc,.h2-dc,[data-noheal]";
  function scroller(el, stop){ for (var p = el; p && p !== stop && p !== document.body; p = p.parentElement){ var o = getComputedStyle(p).overflowX; if ((o === "auto" || o === "scroll") && p.scrollWidth > p.clientWidth + 2) return true; } return false; }
  function loosen(n, stop){
    for (var a = n; a && a !== stop && a !== document.body; a = a.parentElement){
      var cs = getComputedStyle(a);
      if (cs.position === "absolute" || cs.position === "fixed") return;
      a.style.minWidth = "0";
      // 짧은 덩어리(「▲ 348」「상승 71%」 같은 12자 이하)는 쪼개지 않고 통째로 다음 줄로 — 줄바꿈은 긴 글만
      if ((cs.whiteSpace === "nowrap" || cs.whiteSpace === "pre") && (a.textContent || "").trim().length > 12){ a.style.whiteSpace = "normal"; a.style.overflowWrap = "anywhere"; }
      if (cs.display.indexOf("flex") >= 0 && cs.flexWrap === "nowrap" && cs.flexDirection.indexOf("row") === 0) a.style.flexWrap = "wrap";
      if (cs.display.indexOf("grid") >= 0){ var nC = cs.gridTemplateColumns.split(" ").filter(Boolean).length; if (nC > 1) a.style.gridTemplateColumns = "repeat(" + nC + ",minmax(0,1fr))"; }
      if (/px$/.test(a.style.width || "") || (cs.width && parseFloat(cs.width) > stop.clientWidth)) a.style.maxWidth = "100%";
      if (cs.flexShrink === "0") a.style.flexShrink = "1";
    }
  }
  function heal(){
    var vw = document.documentElement.clientWidth;
    [document.getElementById("main"), document.getElementById("sheet")].forEach(function(root){
      if (!root) return;
      for (var pass = 0; pass < 3; pass++){
        var n = 0, CR = new Map(), L = root.querySelectorAll("*");
        var limOf = function(el){ var c = el.closest("button,.card"); if (c && c.tagName === "BUTTON" && c.getBoundingClientRect().width < 120) c = c.parentElement && c.parentElement.closest(".card"); if (!c || !root.contains(c)) c = root; var v = CR.get(c); if (v == null){ v = Math.min(c.getBoundingClientRect().right, vw); CR.set(c, v); } return [c, v]; };
        for (var i = 0; i < L.length; i++){
          var el = L[i]; if (!el.offsetParent || el.closest(HX)) continue;
          var r = el.getBoundingClientRect(); if (!r.width || r.right <= vw * 0.5) continue;
          var cl = limOf(el), lim = cl[1]; if (r.right <= lim + 1) continue;
          var pe = el.parentElement; if (pe && pe !== cl[0] && pe.getBoundingClientRect().right > lim + 1) continue;   // 바깥쪽부터
          if (scroller(el, cl[0])) continue;
          loosen(el, cl[0]); n++;
        }
        if (!n) break;
      }
    });
  }
  window.__heal = heal;
  var hT = 0; function healSoon(){ clearTimeout(hT); hT = setTimeout(function(){ try { heal(); } catch(x) {} }, 220); }
  document.addEventListener("click", function(){ setTimeout(healSoon, 120); }, true);
  document.addEventListener("toggle", healSoon, true);
  window.addEventListener("resize", healSoon);

  /* ── 돌리기 ── */
  var q = 0;
  function tick(){ q = 0; var m = document.getElementById("main");
    try { luckRow(); } catch(x) {}
    try { fs13(m); fs13(document.getElementById("sheet")); } catch(x) {}
    try { thin(m); } catch(x) {}
    // 「더 보기」로 따로 연 카드는 이미 고른 것이니 바로 펼쳐 보여 줌(접힌 채로 열려 한 번 더 눌러야 했음)
    try { [].forEach.call(document.querySelectorAll("#sheet .cz.cz-on"), function(c){ c.classList.remove("cz-on"); }); } catch(x) {}
    healSoon();
    try { if (onHome()) setTimeout(tour, 2500); } catch(x) {} }
  function soon(){ if (!q) q = setTimeout(tick, 250); }
  function start(){ tick(); try { new MutationObserver(soon).observe(document.body, {childList: true, subtree: true}); } catch(x) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  var st = document.createElement("style");
  st.textContent =
    ".ux-luck{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:4px 0 14px}.ux-luck button{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;font-size:13px;font-weight:700;color:var(--sub);background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 4px;cursor:pointer}.ux-luck button span{font-size:20px}" +
    ".ux-thin{display:flex!important;align-items:center;gap:8px;padding:9px 14px!important;margin:0 0 12px!important;font-size:13px!important;line-height:1.4!important;text-align:left!important;color:var(--sub);background:var(--panel2);border-radius:12px;min-height:0!important}.ux-thin .big{font-size:16px!important;margin:0!important}.ux-thin br{display:none}.ux-thin button,.ux-thin .btn{display:none!important}" +
    /* 🩹 막대 그림 칸 이름: 맨 끝 칸은 안쪽으로 붙임 · 아래 구간 이름은 줄바꿈 */
    ".vc-c:last-child .vc-n,.vc-c:last-child .vc-x{left:auto;right:0;transform:none;text-align:right}.vc-c:first-child .vc-n,.vc-c:first-child .vc-x{left:0;transform:none}" +
    ".bins div{min-width:0}.bins small{white-space:normal!important;text-align:center;word-break:keep-all;line-height:1.2}" +
    /* 🌏 5개 시장 한눈에(나침반) — 좁은 화면·큰 글씨에서도 한 칸 안에 */
    ".cp-row .cp-h{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px}.cp-row .cp-h>b{white-space:nowrap}.cp-row .cp-ix{margin-left:auto;white-space:nowrap}.cp-row .cp-n{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto;gap:6px;align-items:baseline}.cp-row .cp-n span{white-space:nowrap}.cp-row .cp-n .mut{text-align:center;overflow:hidden;text-overflow:clip;font-size:.92em}.cp-lb{font-style:normal}@media (max-width:360px){.cp-lb{display:none}}" +
    /* C13 어두운 화면 대비 */
    ":root:not([data-ui=light]){--dim:#9aa3b5}.pp-f.lk{opacity:.62!important}.cz.cz-on .cz-h span{color:var(--text)}" +
    /* D17 */
    "#uxob{position:fixed;inset:0;z-index:9998}.uxob-hole{position:fixed;border-radius:16px;box-shadow:0 0 0 9999px rgba(8,12,20,.66);transition:all .25s;pointer-events:none;border:2px solid #fee500}" +
    ".uxob-tip{position:fixed;left:16px;right:16px;background:#fff;color:#191f28;border-radius:18px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.3)}.uxob-tip small{font-size:12.5px;color:#6b7684;font-weight:700}.uxob-tip b{display:block;font-size:19px;margin:2px 0 4px}.uxob-tip p{margin:0 0 12px;font-size:15px;line-height:1.5;color:#333d4b}" +
    ".uxob-tip div{display:flex;gap:8px;justify-content:flex-end}.uxob-tip button{font:inherit;font-size:15px;font-weight:700;border:0;border-radius:12px;padding:10px 16px;background:#f2f4f6;color:#4e5968}.uxob-tip button.go{background:#3182f6;color:#fff}";
  document.head.appendChild(st);
})();
