/* 📱 11/02 사용자 「밑에 메뉴 화면이 왜 고정 안 되고 떠 있니」
   iOS 26 사파리·홈 화면 앱 버그: 글자 칸(검색·제안서 입력 등)에서 키보드를 열었다 닫으면 visualViewport.offsetTop 이 0으로 안 돌아와
   화면에 붙어 있어야 할 것들(아래 탭 바·위 성적 띠·상태 표시줄 가림막)이 어긋나 떠 보임 (WebKit 297779 · Apple 포럼 800154).
   → 실제로 보이는 영역(visualViewport)과 어긋난 만큼만 되돌려 붙임. 어긋남이 없으면(정상 기기) 0 이라 아무것도 안 바뀜.
   키보드가 열려 있는 동안·두 손가락으로 확대한 동안은 건드리지 않음. */
(function(){
  var vv = window.visualViewport, D = document.documentElement;
  if (!vv) return;
  var css = document.createElement("style");
  css.textContent =
    "#bnav,#opbtn,.ch-toast{translate:0 var(--vvb,0px)}" +
    "#sbcover,header,.po-stk,.fold-jump{translate:0 var(--vvt,0px)}";
  document.head.appendChild(css);
  var lb = null, lt = null, raf = 0;
  function typing(){ var a = document.activeElement; return !!(a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable) && !/^(button|checkbox|radio|range|submit)$/i.test(a.type || "")); }
  function up(){
    raf = 0;
    var b = 0, t = 0;
    if (!typing() && Math.abs((vv.scale || 1) - 1) < 0.01){
      b = Math.round(vv.offsetTop + vv.height - window.innerHeight);   // 보이는 아래 끝 − 화면 배치 아래 끝 (정상이면 0)
      t = Math.round(vv.offsetTop);                                    // 위쪽이 밀린 만큼 (정상이면 0)
      if (Math.abs(b) < 2 || Math.abs(b) > 320) b = 0;
      if (t < 2 || t > 320) t = 0;
    }
    if (b !== lb){ lb = b; D.style.setProperty("--vvb", b + "px"); }
    if (t !== lt){ lt = t; D.style.setProperty("--vvt", t + "px"); }
  }
  function soon(){ if (!raf) raf = requestAnimationFrame(up); }
  vv.addEventListener("resize", soon);
  vv.addEventListener("scroll", soon);
  window.addEventListener("scroll", soon, {passive: true});
  window.addEventListener("orientationchange", function(){ setTimeout(up, 400); });
  // 키보드가 닫힌 직후: 화면을 한 번 제자리로 다시 맞추고(같은 위치로 스크롤) 다시 잼
  document.addEventListener("focusout", function(){
    setTimeout(function(){ if (!typing()){ try { window.scrollTo(window.scrollX, window.scrollY); } catch(x) {} up(); } }, 320);
    setTimeout(up, 800);
  });
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) setTimeout(up, 200); });
  up();
  window.__vvfix = function(){ return {vvb: lb, vvt: lt, offTop: vv.offsetTop, vvH: vv.height, inH: window.innerHeight}; };
})();
