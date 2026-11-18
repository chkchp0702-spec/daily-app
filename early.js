/* CH Investing — 🔍 11/05 뒤에서 (먼저 읽힘 · defer 아님)
   D14 화면 감시 묶기: 보정 스크립트 20개 남짓이 각자 MutationObserver 로 화면 전체를 지켜봄 → 콜백을 한 프레임(requestAnimationFrame)에 한 번씩 몰아서 부름.
       · 같은 프레임에 생긴 변화는 한꺼번에 · 앱이 뒤로 가 있으면(rAF 멈춤) 아무것도 안 돎 → 버벅임·배터리 줄임 · 다음 그림(paint) 전에 돌아서 깜빡임 없음
   D15 자료 한 곳으로: raw.githubusercontent.com(시황 저장소) 가 막히면(회사망 등) 같은 주소 github.io 의 archive/m/ 사본에서 받음 (tools/mirror.py · mirror.yml 30분마다) */
(function(){
  /* ── D14 ── */
  var MO = window.MutationObserver, RAF = window.requestAnimationFrame;
  if (MO && RAF && !MO.__hub){
    var pend = [], raf = 0, stat = window.__moStat = {obs: 0, calls: 0, frames: 0};
    var flush = function(){
      raf = 0; stat.frames++;
      var p = pend; pend = [];
      for (var i = 0; i < p.length; i++){ var w = p[i], q = w._q; w._q = []; w._in = 0;
        if (q.length){ stat.calls++; try { w._cb.call(w, q, w); } catch(e){ try { console.warn("MO", e); } catch(z) {} } } }
    };
    var Hub = function(cb){
      var self = this; this._cb = cb; this._q = []; this._in = 0; stat.obs++;
      this._o = new MO(function(rs){ for (var i = 0; i < rs.length; i++) self._q.push(rs[i]); if (!self._in){ self._in = 1; pend.push(self); } if (!raf) raf = RAF.call(window, flush); });
    };
    Hub.prototype.observe = function(t, o){ return this._o.observe(t, o); };
    Hub.prototype.disconnect = function(){ this._q = []; return this._o.disconnect(); };
    Hub.prototype.takeRecords = function(){ var r = this._q.concat(this._o.takeRecords()); this._q = []; return r; };
    Hub.__hub = 1; Hub.native = MO;
    window.MutationObserver = Hub;
  }

  /* ── D15 ── */
  var F = window.fetch;
  if (F && !F.__mir){
    var RX = /^https:\/\/raw\.githubusercontent\.com\/chkchp0702-spec\/market-strategy-report\/main\/((?:market|brain|feeds|ledger)\/[^?#]+\.json)/;
    var BAD = 0;   // 한 번 막히면 이번 방문 동안은 바로 사본으로
    var mf = function(input, init){
      var u = typeof input === "string" ? input : (input && input.url) || "", m = RX.exec(u);
      if (!m) return F.apply(this, arguments);
      var alt = "archive/m/" + m[1] + "?" + Math.floor(Date.now() / 300000);
      var viaAlt = function(){ return F.call(window, alt, init).then(function(r){ if (!r.ok) throw new TypeError("mirror " + r.status); return r; }); };
      if (BAD > 1) return viaAlt();
      var self = this, args = arguments;
      return F.apply(self, args).then(function(r){ if (r.ok) return r; return viaAlt().catch(function(){ return r; }); },
        function(err){ BAD++; return viaAlt().catch(function(){ throw err; }); });
    };
    mf.__mir = 1; window.fetch = mf;
  }
})();

/* 🛡 11/18 안정도 (사용자 「어플 안정도를 좀 높여 포괄적으로」)
   ① 오류 수집: 실제 휴대폰에서 난 자바스크립트 오류를 모아(이름·입력값·따옴표 속 글자는 지움) 10분에 한 번 · 앱을 내릴 때 익명으로 보냄
      → usage.py 가 archive/x/errors.json 에 날짜·버전별로 쌓고 🩺 건강검진이 문제로 셈. 전엔 휴대폰 오류를 우리가 알 길이 없었음.
   ② 묶음 스스로 고치기: app.bNN.js 는 파일 30여 개를 이어 붙인 것이라, 중간 파일 하나가 시작하다 오류를 내면 그 조각의 나머지 파일이 통째로 안 돌았음
      (시험: 조각 3 중간 오류 → 시황 카드 28장 → 15장). bundle.py 가 파일마다 __bk(번호) 표식을 넣으니,
      조각이 도중에 멈추면 같은 조각을 저장본에서 다시 읽어 「멈춘 파일 다음부터」 이어서 실행 → 오류 난 파일 하나만 빠지고 나머지는 그대로. 평소엔 하는 일 없음(속도 그대로). */
(function(){
  var DEV = function(){ try { var d = localStorage.getItem("us_dev"); if (!d){ d = Math.random().toString(36).slice(2, 10); localStorage.setItem("us_dev", d); } return d; } catch(x) { return "x"; } };
  var BUF = {}, NB = 0, SENT = 0, T = null;
  function clean(s){
    return String(s || "").replace(/"[^"]*"|'[^']*'|`[^`]*`|“[^”]*”/g, "…").replace(/\d{3,}/g, "#").replace(/https?:\/\/[^\s)]+\/([^\/\s?)]+)(\?[^\s)]*)?/g, "$1").replace(/\s+/g, " ").trim().slice(0, 150);
  }
  function file(s){ s = String(s || ""); var m = /([^\/?#]+\.js)/.exec(s); return m ? m[1] : (s ? "inline" : ""); }
  function flush(){
    T = null; var ks = Object.keys(BUF); if (!ks.length || SENT >= 4) return;
    var day = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    var body = JSON.stringify({k: "err", d: DEV(), day: day, v: (typeof APPV !== "undefined" ? APPV : ""), e: ks.slice(0, 12).map(function(k){ return BUF[k]; })});
    BUF = {}; SENT++;
    try { fetch("https://ntfy.sh/chkchp-ch-open", {method: "POST", body: body.slice(0, 3900), headers: {"Title": "err"}, keepalive: true}).catch(function(){}); } catch(x) {}
  }
  var chErr = window.chErr = function(kind, msg, src, extra){
    try {
      var m = clean(msg); if (!m) return;
      if (/^Script error\.?$|ResizeObserver loop|Non-Error promise rejection captured|AbortError|The operation was aborted|NotAllowedError|play\(\) request|cancell?ed/i.test(m)) return;
      if (/extension:\/\/|safari-web-extension|webkit-masked-url/i.test(String(src || ""))) return;
      var tab = (typeof cur !== "undefined" && cur) || (location.hash || "#").slice(1, 13);
      var k = kind + "|" + m + "|" + file(src);
      if (BUF[k]){ BUF[k].n++; return; }
      if (++NB > 30) return;   // 한 번 열 때 30가지까지만
      BUF[k] = {k: kind, m: m, s: file(src) + (extra || ""), t: String(tab).slice(0, 12), n: 1};
      if (!T) T = setTimeout(flush, NB === 1 ? 8000 : 600000);
    } catch(x) {}
  };
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);

  /* ── ② 묶음 스스로 고치기 ── */
  var BK = window.__BKS = {last: -1, run: 0, ok: {}, names: {}, healed: []};
  window.__bs = function(c, first, names){ BK.run = c; BK.last = first - 1; BK.names[c] = {first: first, list: names || []}; };
  window.__bk = function(n){ BK.last = n; };
  window.__be = function(c){ BK.ok[c] = 1; if (BK.run === c) BK.run = 0; };
  function heal(c, src){
    var info = BK.names[c] || {first: 0, list: []}, txt = null;
    try { var x = new XMLHttpRequest(); x.open("GET", src, false); x.send(); if (x.status >= 200 && x.status < 300) txt = x.responseText; } catch(e) {}
    if (!txt) return false;
    for (var guard = 0; guard < 40 && !BK.ok[c]; guard++){
      var bad = BK.last + 1, mark = "\n__bk(" + bad + ");\n", at = txt.indexOf(mark);
      var nm = info.list[bad - info.first] || ("#" + bad);
      BK.healed.push(nm);
      if (at < 0) return false;
      try { (0, eval)(txt.slice(at + mark.length) + "\n//# sourceURL=" + src.split("?")[0].split("/").pop() + "-heal" + guard + ".js"); }
      catch(e2){ chErr("load", (e2 && e2.message) || e2, src, " · " + (info.list[BK.last + 1 - info.first] || "")); }
    }
    return !!BK.ok[c];
  }
  window.addEventListener("error", function(ev){
    var src = String(ev.filename || ""), m = /\/app\.b(\d+)\.js/.exec(src), c = m ? +m[1] : 0;
    var live = false; try { live = String(new Error().stack || "").indexOf("app.b" + (c < 10 ? "0" : "") + c + ".js") >= 0; } catch(z) {}   // 아직 그 조각이 돌고 있음(이벤트 안 오류) → 멈춘 게 아님
    if (c && BK.run === c && !BK.ok[c] && !live){   // 조각이 시작은 했는데 끝 표식 전에 멈춤 = 그 조각 안 파일 하나가 시작하다 오류
      var info = BK.names[c] || {first: 0, list: []}, nm = info.list[BK.last + 1 - info.first] || "";
      chErr("load", (ev.error && ev.error.message) || ev.message, src, " · " + nm);
      heal(c, src);
      return;
    }
    if (ev.target && ev.target !== window && (ev.target.src || ev.target.href)){ return; }   // 그림·스크립트 못 받음은 따로 안 셈(너무 흔함)
    chErr("js", (ev.error && ev.error.message) || ev.message, src);
  }, true);
  window.addEventListener("unhandledrejection", function(ev){
    var r = ev.reason, msg = r && (r.message || (typeof r === "string" ? r : "")) || "";
    if (!msg) return;                        // throw 0 같은 「못 받음」 표시는 셈하지 않음
    var net = /Failed to fetch|Load failed|NetworkError|network connection|timed? ?out|offline/i.test(msg);
    chErr(net ? "net" : "promise", msg, r && r.stack ? (/([^\/\s(]+\.js)/.exec(r.stack) || [])[1] : "");
  });
})();
