/* CH Investing — 화면 그대로 PDF (10/6)
   예전: 리포트 전체를 큰 캔버스 한 장으로 그림 → 아이폰 캔버스 한도에 걸려 그림(주가·매출)이 빠지고 카드가 잘림.
   지금: ① 화면을 몰래 복제해 SVG 차트는 다 그려진 PNG로, 외부 사진·로고는 중계 서버(wsrv.nl)로 받아 그림 데이터로 바꾸고
         ② 카드(섹션)를 한 장씩 작은 캔버스로 찍어 ③ PDF 쪽에 차례로 붙인다. 카드가 쪽 경계에서 잘리지 않는다. */
(function(){
  var PW = 114, PH = 203, M = 4;
  // 아이폰 사파리: 캔버스 메모리 한도가 작아 한 번에 많이 그리면 실패 → 작게 찍고, 쓴 캔버스는 바로 비우고, 한 카드가 실패해도 건너뛰고 계속
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);          // PDF 쪽 크기(mm)·여백 — 휴대폰 화면 비율
  var CPROPS = ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity",
                "font-size", "font-weight", "font-family", "text-anchor", "dominant-baseline", "color"];
  function rgb(v){ return conv(v); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function loadImg(img){
    return new Promise(function(ok){ if (img.complete && img.naturalWidth) return ok(true);
      var t = setTimeout(function(){ ok(false); }, 8000);
      img.onload = function(){ clearTimeout(t); ok(true); }; img.onerror = function(){ clearTimeout(t); ok(false); }; });
  }
  // SVG → PNG (다 그려진 뒤의 그림). 원본 SVG에서 계산된 색·굵기를 복사해 넣는다
  function svgToPng(svg, srcSvg, w){
    var r = srcSvg.getBoundingClientRect(); if (!r.width || !r.height) return Promise.resolve(null);
    var a = [srcSvg].concat([].slice.call(srcSvg.querySelectorAll("*"))), b = [svg].concat([].slice.call(svg.querySelectorAll("*")));
    a.forEach(function(n, i){ var cs = w.getComputedStyle(n), st = ""; CPROPS.forEach(function(p){ var v = cs.getPropertyValue(p); if (v) st += p + ":" + rgb(v) + ";"; }); if (b[i]) b[i].setAttribute("style", st); });
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg"); svg.setAttribute("width", r.width); svg.setAttribute("height", r.height);
    var img = new w.Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    return loadImg(img).then(function(ok){
      if (!ok) return null;
      var c = w.document.createElement("canvas"), s = 2; c.width = Math.ceil(r.width * s); c.height = Math.ceil(r.height * s);
      var g = c.getContext("2d"); g.scale(s, s); g.drawImage(img, 0, 0, r.width, r.height);
      var out = w.document.createElement("img"); out.src = c.toDataURL("image/png"); c.width = c.height = 0;   // 캔버스 메모리 바로 돌려줌(아이폰)
      out.style.cssText = "display:block;width:" + r.width + "px;height:" + r.height + "px;max-width:100%";
      return loadImg(out).then(function(){ return out; });
    });
  }
  // 외부 이미지(로고·사진) → 그림 데이터. 직접 못 받으면 중계 서버로
  function inlineImg(img, w){
    var src = img.getAttribute("src") || "";
    if (!src || /^data:/.test(src)) return Promise.resolve();
    var abs; try { abs = new URL(src, w.location.href).href; } catch(e) { return Promise.resolve(); }
    var toData = function(u){ var ac = window.AbortController ? new AbortController() : null; if (ac) setTimeout(function(){ ac.abort(); }, 5000);   // 5초 안에 안 오면 포기 (멈춤 방지)
      return fetch(u, {mode: "cors", signal: ac ? ac.signal : undefined}).then(function(r){ if (!r.ok) throw 0; return r.blob(); }).then(function(bl){
      return new Promise(function(ok){ var fr = new FileReader(); fr.onload = function(){ ok(fr.result); }; fr.readAsDataURL(bl); }); }); };
    return toData(abs).catch(function(){ return toData("https://wsrv.nl/?url=" + encodeURIComponent(abs) + "&output=png"); })
      .then(function(d){ img.src = d; return loadImg(img); })
      .catch(function(){ img.style.visibility = "hidden"; });
  }

  // 복제본 안의 색 계산값 color(srgb …)·color(display-p3 …) 등을 rgb 로 한 번만 (html2canvas 가 못 읽음 — 아이폰 사파리 「unsupported color function "color"」)
  //   10/14: 아이폰은 색이 들어가는 모든 속성(테두리·그림자·글자 장식·::before/::after 까지)에서 color() 가 나와서, 이름에 색 관련 말이 든 속성은 전부 + 앞뒤 꾸밈(가상 요소)까지 고친다
  function conv(v){
    if (!v || !/(color|lab|lch|oklab|oklch)\(/.test(v)) return v;
    v = v.replace(/color\(\s*(srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65)\s+([-\d.e]+|none)\s+([-\d.e]+|none)\s+([-\d.e]+|none)(?:\s*\/\s*([-\d.e%]+|none))?\s*\)/g, function(_, sp, r, g, b, a){
      var f = function(x){ x = x === "none" ? 0 : +x; return Math.max(0, Math.min(255, Math.round(x * 255))); };
      var al = a == null || a === "none" ? 1 : (/%$/.test(a) ? parseFloat(a) / 100 : +a);
      return "rgba(" + f(r) + "," + f(g) + "," + f(b) + "," + al + ")"; });
    return v.replace(/(oklab|oklch|lab|lch|color)\([^()]*\)/g, "rgba(128,128,128,0.5)");   // 못 바꾸는 건 회색으로 (그림이 실패하는 것보다 낫게)
  }
  var CKEYS = null;
  function fixOnce(root, w){
    var d = root.ownerDocument, css = [], n = 0;
    var keys = function(cs){ if (CKEYS) return CKEYS; CKEYS = [];
      for (var k = 0; k < cs.length; k++){ var p = cs[k]; if (/color|shadow|background|border|outline|decoration|fill|stroke|caret|column-rule|emphasis/.test(p)) CKEYS.push(p); }
      return CKEYS; };
    [root].concat([].slice.call(root.querySelectorAll("*"))).forEach(function(el){
      var cs = w.getComputedStyle(el), ks = keys(cs);
      ks.forEach(function(p){ var v = cs.getPropertyValue(p); if (v && v.indexOf("(") >= 0 && /(color|lab|lch)\(/.test(v)) el.style.setProperty(p, conv(v), "important"); });
      ["::before", "::after"].forEach(function(ps){
        var pc = w.getComputedStyle(el, ps); if (!pc || pc.content === "none" || pc.content === "normal") return;
        var rule = "";
        ks.forEach(function(p){ var v = pc.getPropertyValue(p); if (v && v.indexOf("(") >= 0 && /(color|lab|lch)\(/.test(v)) rule += p + ":" + conv(v) + " !important;"; });
        if (rule){ if (!el.dataset.pfx) el.dataset.pfx = String(++n); css.push('[data-pfx="' + el.dataset.pfx + '"]' + ps + "{" + rule + "}"); }
      });
    });
    if (css.length){ var st = d.createElement("style"); st.textContent = css.join("\n"); root.appendChild(st); }
  }
  /* w: 화면이 있는 window(iframe 이면 그 contentWindow), root: 찍을 영역, bg: 배경색 */
  window.screenPdf = function(w, root, name, bg, prog){
    var d = w.document, H2P = w.html2pdf;
    if (!H2P) return Promise.reject("html2pdf 없음");
    var width = root.getBoundingClientRect().width || 390;
    // 1) 화면 복제 (보이는 화면은 건드리지 않음)
    var host = d.createElement("div");
    host.style.cssText = "position:absolute;left:-20000px;top:0;width:" + width + "px;background:" + bg;
    var clone = root.cloneNode(true); host.appendChild(clone); d.body.appendChild(host);
    [].forEach.call(clone.querySelectorAll(".pdfbar,.pdfb,button.more,.xs-tg,.xs-cl,#xs-more,script"), function(x){ x.remove(); });
    [].forEach.call(clone.querySelectorAll(".xs-clamp"), function(x){ x.classList.remove("xs-clamp"); });   // 접어 둔 긴 카드는 PDF에선 다 펼침
    // 2) SVG → PNG, 외부 이미지 → 데이터
    var srcSvgs = root.querySelectorAll("svg"), cSvgs = clone.querySelectorAll("svg"), jobs = [];
    [].forEach.call(cSvgs, function(svg, i){ var s0 = srcSvgs[i]; if (!s0) return;
      jobs.push(svgToPng(svg, s0, w).then(function(img){ if (img && svg.parentNode) svg.parentNode.replaceChild(img, svg); })); });
    [].forEach.call(clone.querySelectorAll("img"), function(img){ jobs.push(inlineImg(img, w)); });
    return Promise.all(jobs).then(function(){ return wait(150); }).then(function(){
      // 3) 카드(섹션) 목록: 한 줄로 쌓인 맨 위 자식들. 여러 단 그리드는 그 안의 카드로 쪼갬
      var parts = [];
      (function walk(el){ [].forEach.call(el.children, function(ch){
        if (!ch.offsetHeight) return;
        var cs = w.getComputedStyle(ch);
        if (ch.children.length > 1 && ch.offsetHeight > 700 && !ch.matches(".card,section,table,svg,img,canvas,.cc,.kpi")) return walk(ch);   // 큰 묶음이면 안의 카드 단위로
        parts.push(ch); }); })(clone);
      if (!parts.length) parts = [clone];
      // 찍는 폭 = 화면 폭 그대로 (html2pdf 는 쪽 너비로 다시 배치하므로 쪽을 px 로 화면 폭과 같게)
      // 10/14: 예전엔 카드마다 문서 전체(수천 개)의 색을 다시 고쳐서 나침반이 2분 넘게 걸리고 휴대폰에선 멈춤
      //   → 색 고치기는 복제본에 한 번만, 찍을 땐 원래 화면은 건너뜀(ignoreElements)
      fixOnce(host, w);
      // 문서 바탕(html·body)의 색도 html2canvas 가 읽음 — 잠깐 rgb 로 바꿔 두고 끝나면 되돌림
      [d.documentElement, d.body].forEach(function(el){ var cs = w.getComputedStyle(el), keep = el.getAttribute("style");
        (CKEYS || []).forEach(function(p){ var v = cs.getPropertyValue(p); if (v && /(color|lab|lch)\(/.test(v)){ if (!el.__pfxKeep) el.__pfxKeep = [keep]; el.style.setProperty(p, conv(v), "important"); } }); });
      var opt = {margin: 0, jsPDF: {unit: "px", format: [width, 2000], orientation: "portrait", hotfixes: ["px_scaling"]}, html2canvas: {scale: IOS ? 1.25 : (w.devicePixelRatio > 2 ? 1.5 : 1.8), backgroundColor: bg, useCORS: true, logging: false, scrollX: 0, scrollY: 0,
                                ignoreElements: function(n){ return n.parentNode === d.body && n !== host && !(n.classList && n.classList.contains("html2pdf__overlay")) && !/^(HEAD|STYLE|LINK|SCRIPT)$/.test(n.tagName); }}};
      // 4) PDF 만들기 — 쪽 너비에 맞춰 카드를 차례로 붙이고, 남은 자리가 모자라면 새 쪽
      return H2P().set({jsPDF: {unit: "mm", format: [PW, PH], orientation: "portrait"}}).from(d.createElement("div")).toPdf().get("pdf").then(function(tmp){
        var PDF = tmp;                                     // 빈 첫 쪽이 하나 있는 jsPDF — 배경을 칠하고 그 위에 그린다
        var hx = (function(c){ var m = String(c).match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/); return m ? "#" + [m[1], m[2], m[3]].map(function(x){ return ("0" + (+x).toString(16)).slice(-2); }).join("") : c; })(bg);
        var paint = function(){ PDF.setFillColor(hx); PDF.rect(0, 0, PW, PH, "F"); };
        paint();
        var y = M, i = 0, scale = (PW - M * 2) / width, okN = 0, failN = 0, lastErr = null;    // mm per css px
        // 첫 줄: 제목
        var next = function(){
          if (i >= parts.length) return Promise.resolve();
          var el = parts[i++];
          if (prog) try { prog(i, parts.length); } catch(e) {}
          return wait(IOS ? 60 : 30).then(function(){ return H2P().set(opt).from(el).toCanvas().get("canvas"); }).then(function(cv){   // 카드 사이 숨 고르기 — 화면이 멈추지 않게
            [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); });
            if (!cv || !cv.width || !cv.height) throw new Error("빈 그림");
            var wmm = PW - M * 2, hmm = cv.height / cv.width * wmm, gap = 2.2;   // 찍힌 그림 비율 그대로
            if (hmm <= PH - M * 2){
              if (y + hmm > PH - M){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              PDF.addImage(cv.toDataURL("image/jpeg", 0.88), "JPEG", M, y, wmm, hmm); y += hmm + gap;
            } else {                                         // 한 쪽보다 긴 카드: 쪽 높이로 잘라 이어 붙임
              var pxPerMm = cv.height / hmm, off = 0;
              if (y > M + 1){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              while (off < hmm - 0.5){
                var take = Math.min(PH - M * 2, hmm - off), sc = d.createElement("canvas");
                sc.width = cv.width; sc.height = Math.ceil(take * pxPerMm);
                sc.getContext("2d").drawImage(cv, 0, Math.floor(off * pxPerMm), cv.width, sc.height, 0, 0, cv.width, sc.height);
                PDF.addImage(sc.toDataURL("image/jpeg", 0.88), "JPEG", M, y, wmm, take); off += take; y += take + gap; sc.width = sc.height = 0;
                if (off < hmm - 0.5){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              }
            }
            cv.width = cv.height = 0; okN++;
            return next();
          }).catch(function(e){ failN++; lastErr = e; [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); return next(); });
        };
        return next().then(function(){
          if (!okN) throw new Error("카드를 하나도 못 찍음 · " + (lastErr && (lastErr.message || lastErr) || ""));
          if (failN) try { console.warn("pdf: 건너뛴 카드", failN, lastErr); } catch(e) {}
          return PDF.output("blob"); });
      });
    }).finally(function(){ host.remove();
      [d.documentElement, d.body].forEach(function(el){ if (el.__pfxKeep){ var k = el.__pfxKeep[0]; if (k == null) el.removeAttribute("style"); else el.setAttribute("style", k); el.__pfxKeep = null; } });
      // 10/14: html2pdf 가 남기는 투명 덮개(html2pdf__overlay)가 화면을 덮어 「PDF 저장하기」를 못 누르던 문제 — 다 치움
      [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); });
  };

  /* 📨 10/28 「어느 화면에서든 그 화면의 대부분을 고객 한 장으로」 — 보이는 카드만 밝은 화면으로 찍어 캔버스 목록으로 (onepage.js 가 그림 머리·바닥글 틀에 끼움)
     조이(꼬마) 그림·단추·펼치기 줄은 빼고, SVG 차트는 그림으로 바꿔 찍음. */
  window.snapEls = function(els, opt){
    opt = opt || {};
    var w = window, d = document, H2P = w.html2pdf;
    if (!H2P) return Promise.reject("html2pdf 없음");
    var root = d.documentElement, oldUi = root.getAttribute("data-ui"), light = opt.light !== false;
    var cover = d.createElement("div"); cover.style.cssText = "position:fixed;inset:0;z-index:2147483646;background:rgba(10,14,22,.82);color:#fff;display:flex;align-items:center;justify-content:center;font:700 16px system-ui";
    cover.textContent = "📨 한 장 만드는 중…"; d.body.appendChild(cover);
    if (light) root.setAttribute("data-ui", "light");
    var sx = w.scrollX, sy = w.scrollY, shEl = d.getElementById("sheet"), shY = shEl ? shEl.scrollTop : 0;
    w.scrollTo(0, 0);   // html2canvas 는 스크롤만큼 어긋나 찍힘 → 덮개 뒤에서 잠깐 맨 위로
    var restore = function(){ w.scrollTo(sx, sy); if (shEl) shEl.scrollTop = shY; if (light){ if (oldUi == null) root.removeAttribute("data-ui"); else root.setAttribute("data-ui", oldUi); } cover.remove();
      [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); };
    return wait(120).then(function(){
      var width = Math.round(els[0].getBoundingClientRect().width) || 360, bg = w.getComputedStyle(d.body).backgroundColor || "#fff";
      var host = d.createElement("div"); host.id = "snaphost"; host.style.cssText = "position:absolute;left:-20000px;top:0;width:" + width + "px;background:" + conv(bg);
      var hs = d.createElement("style"); hs.textContent = "#snaphost *::before{background-image:none!important}"; host.appendChild(hs);
      d.body.appendChild(host);
      var clones = els.map(function(el){ var c = el.cloneNode(true); c.style.margin = "0"; c.style.maxHeight = "none"; c.style.width = width + "px"; host.appendChild(c); return {src: el, c: c}; });
      var jobs = [];
      clones.forEach(function(o){
        [].forEach.call(o.c.querySelectorAll("button,.pdfbar,.pdfb,.xs-tg,.xs-cl,script,input,select,.seg2 button:not(.on)"), function(x){ x.remove(); });
        [].forEach.call(o.c.querySelectorAll("img"), function(im){ if (/img\/(kid_|guide)/.test(im.getAttribute("src") || "")) im.remove(); });
        [].forEach.call(o.c.querySelectorAll(".gd-b,.gd-kid,.gd-vw,video,[class*=joy]"), function(x){ x.remove(); });   // 조이 얼굴(작은 동그라미)
        [].forEach.call(o.c.querySelectorAll(".td-n"), function(x){ x.classList.remove("td-n"); });
        [].forEach.call(o.c.querySelectorAll(".xs-clamp"), function(x){ x.classList.remove("xs-clamp"); });
        var ss = o.src.querySelectorAll("svg"), cs = o.c.querySelectorAll("svg");
        [].forEach.call(cs, function(svg, i){ var s0 = ss[i]; if (!s0) return; jobs.push(svgToPng(svg, s0, w).then(function(img){ if (img && svg.parentNode) svg.parentNode.replaceChild(img, svg); })); });
        [].forEach.call(o.c.querySelectorAll("img"), function(im){ jobs.push(inlineImg(im, w)); });
      });
      return Promise.all(jobs).then(function(){ return wait(120); }).then(function(){
        fixOnce(host, w);
        var o2 = {margin: 0, jsPDF: {unit: "px", format: [width, 2000], orientation: "portrait", hotfixes: ["px_scaling"]}, html2canvas: {scale: IOS ? 2 : 2.4, scrollX: 0, scrollY: 0, backgroundColor: conv(bg), useCORS: true,
          ignoreElements: function(n){ return n.parentNode === d.body && n !== host && !(n.classList && n.classList.contains("html2pdf__overlay")) && !/^(HEAD|STYLE|LINK|SCRIPT)$/.test(n.tagName); }}};
        var out = [], i = 0;
        var next = function(){ if (i >= clones.length) return Promise.resolve(out); var el = clones[i++].c;
          return H2P().set(o2).from(el).toCanvas().get("canvas").then(function(cv){ [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); if (cv && cv.width && cv.height) out.push(cv); return next(); }, function(){ return next(); }); };
        return next();
      }).then(function(out){ host.remove(); restore(); return out; }, function(e){ host.remove(); restore(); throw e; });
    }, function(e){ restore(); throw e; });
  };
})();
