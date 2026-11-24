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
