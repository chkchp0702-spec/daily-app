/* CH Investing — 화면 그대로 PDF (10/6)
   예전: 리포트 전체를 큰 캔버스 한 장으로 그림 → 아이폰 캔버스 한도에 걸려 그림(주가·매출)이 빠지고 카드가 잘림.
   지금: ① 화면을 몰래 복제해 SVG 차트는 다 그려진 PNG로, 외부 사진·로고는 중계 서버(wsrv.nl)로 받아 그림 데이터로 바꾸고
         ② 카드(섹션)를 한 장씩 작은 캔버스로 찍어 ③ PDF 쪽에 차례로 붙인다. 카드가 쪽 경계에서 잘리지 않는다. */
(function(){
  var PW = 114, PH = 203, M = 4;          // PDF 쪽 크기(mm)·여백 — 휴대폰 화면 비율
  var CPROPS = ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity",
                "font-size", "font-weight", "font-family", "text-anchor", "dominant-baseline", "color"];
  function rgb(v){ return window.toRGB ? toRGB(v) : v; }
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
      var out = w.document.createElement("img"); out.src = c.toDataURL("image/png");
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
      var opt = {margin: 0, jsPDF: {unit: "px", format: [width, 2000], orientation: "portrait", hotfixes: ["px_scaling"]}, html2canvas: {scale: (w.devicePixelRatio > 2 ? 1.6 : 2), backgroundColor: bg, useCORS: true, logging: false, scrollX: 0, scrollY: 0,
                                onclone: function(cd){ if (window.fixColors) try { fixColors(cd); } catch(e) {} }}};
      // 4) PDF 만들기 — 쪽 너비에 맞춰 카드를 차례로 붙이고, 남은 자리가 모자라면 새 쪽
      return H2P().set({jsPDF: {unit: "mm", format: [PW, PH], orientation: "portrait"}}).from(d.createElement("div")).toPdf().get("pdf").then(function(tmp){
        var PDF = tmp;                                     // 빈 첫 쪽이 하나 있는 jsPDF — 배경을 칠하고 그 위에 그린다
        var paint = function(){ PDF.setFillColor(bg); PDF.rect(0, 0, PW, PH, "F"); };
        paint();
        var y = M, i = 0, scale = (PW - M * 2) / width;    // mm per css px
        // 첫 줄: 제목
        var next = function(){
          if (i >= parts.length) return Promise.resolve();
          var el = parts[i++];
          if (prog) try { prog(i, parts.length); } catch(e) {}
          return wait(30).then(function(){ return H2P().set(opt).from(el).toCanvas().get("canvas"); }).then(function(cv){   // 카드 사이 숨 고르기 — 화면이 멈추지 않게
            var wmm = PW - M * 2, hmm = cv.height / cv.width * wmm, gap = 2.2;   // 찍힌 그림 비율 그대로
            if (hmm <= PH - M * 2){
              if (y + hmm > PH - M){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              PDF.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", M, y, wmm, hmm); y += hmm + gap;
            } else {                                         // 한 쪽보다 긴 카드: 쪽 높이로 잘라 이어 붙임
              var pxPerMm = cv.height / hmm, off = 0;
              if (y > M + 1){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              while (off < hmm - 0.5){
                var take = Math.min(PH - M * 2, hmm - off), sc = d.createElement("canvas");
                sc.width = cv.width; sc.height = Math.ceil(take * pxPerMm);
                sc.getContext("2d").drawImage(cv, 0, Math.floor(off * pxPerMm), cv.width, sc.height, 0, 0, cv.width, sc.height);
                PDF.addImage(sc.toDataURL("image/jpeg", 0.92), "JPEG", M, y, wmm, take); off += take; y += take + gap;
                if (off < hmm - 0.5){ PDF.addPage([PW, PH], "portrait"); paint(); y = M; }
              }
            }
            return next();
          });
        };
        return next().then(function(){ return PDF.output("blob"); });
      });
    }).finally(function(){ host.remove(); });
  };
})();
