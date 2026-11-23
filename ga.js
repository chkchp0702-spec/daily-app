/* 📊 11/23 구글 애널리틱스(GA4) — 사용자 「구글 ga 붙여줘」 · 범위: 화면 보기 + 누른 단추
   · 켜는 법: index.html 의 var GA_ID = "" 에 측정 ID(G-로 시작)를 넣고 버전만 올리면 바로 켜짐. 비어 있으면 아무것도 안 받고 안 보냄.
   · 보내는 것: 화면이 바뀔 때 page_view(화면 이름 · 주소는 「앱주소/화면키」 꼴 가상 경로) · 단추를 누를 때 ch_tap(usage.js 와 같은 단추 이름)
     단추 이름은 usage.js labelOf() 를 그대로 씀 → 숫자는 # 로 · 종목 이름 안 보냄(「종목 열기」) · 입력칸·고객 이름 칩·이 휴대폰에 저장된 고객/PB 이름과 같은 글자는 안 보냄
   · 안 보내는 것: 고객 이름 · 입력한 금액·글 · 관심종목 · 주소의 ?뒤(ez=·embed= 등)
   · 광고 신호(구글 신호·광고 맞춤) 끔 · 자동 검진(로봇 브라우저 · ?embed=1)은 안 보냄 · 이 휴대폰만 끄기: localStorage ga_off = "1"
   · 앱 안 집계(usage.js → ntfy → usage.py)는 그대로 — GA 는 따로 한 벌 더 */
(function(){
  var ID = String(window.GA_ID || "").trim();
  window.__chGA = null;
  if (!/^G-[A-Z0-9]{4,}$/i.test(ID)) return;
  var BOT = (function(){ try { return !!navigator.webdriver || /HeadlessChrome|Playwright|puppeteer/i.test(navigator.userAgent) || /[?&]embed=1/.test(location.search); } catch(x) { return false; } })();
  var off = false; try { off = localStorage.getItem("ga_off") === "1"; } catch(x) {}
  if (BOT || off) return;

  var BASE = location.origin + location.pathname.replace(/[^\/]*$/, "");   // …/daily-app/
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var standalone = false; try { standalone = !!(navigator.standalone || (window.matchMedia && matchMedia("(display-mode: standalone)").matches)); } catch(x) {}
  gtag("js", new Date());
  gtag("config", ID, {
    send_page_view: false,                       // 한 페이지 앱이라 화면이 바뀔 때 직접 보냄
    allow_google_signals: false, allow_ad_personalization_signals: false,
    page_location: BASE + "home", page_title: "오늘",
    app_version: String(window.APPV || "")
  });
  gtag("set", "user_properties", {app_mode: standalone ? "홈 화면 앱" : "브라우저", app_version: String(window.APPV || "")});
  var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
  document.head.appendChild(s);

  var last = "";
  window.__chGA = function(kind, label, key){
    try {
      label = String(label || "").replace(/\s+/g, " ").trim().slice(0, 100); if (!label) return;
      if (kind === "v"){
        key = String(key || label).replace(/[^\w\-]/g, "").slice(0, 40) || "home"; if (key === last) return; last = key;
        gtag("event", "page_view", {page_location: BASE + key, page_title: label});
      } else {
        var c = (typeof window.cur !== "undefined" && window.cur) || "";
        gtag("event", "ch_tap", {tap_label: label, screen_key: String(c).slice(0, 40)});
      }
    } catch(x) {}
  };
})();
