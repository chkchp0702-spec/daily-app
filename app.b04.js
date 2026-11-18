/* 📦 app.b04.js — tools/bundle.py 가 index.html 의 📦list 목록 순서대로 합친 조각 4/8 (push.js … nav2.js). 직접 고치지 말 것(원본 .js 를 고치고 다시 합침). */
/* ======== push.js ======== */
/* 🔔 알림 (10/9 단순화) — 이 앱을 설치한 휴대폰이 「알림 받기」만 켜고 끄면 끝.
   켜면: 알림 허락 → 웹 푸시 구독 → 구독 정보를 휴대폰에서 암호화(RSA 공개키)해서 보냄 → 서버(stock-screener 저장소의 push-relay, 6시간 이어달리기)가 신호마다 푸시.
   다른 앱(ntfy) 설치·구독 단계 없음. */
(function(){
  var NT = "https://ntfy.sh/", SUB = "chkchp-ch-pushsub-k4t9", TEST = "chkchp-ch-pushtest-k4t9";
  var C = window.crypto && window.crypto.subtle, TE = new TextEncoder(), KEYS = null;
  function b64(buf){ var s = "", a = new Uint8Array(buf); for (var i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
  function ub64(s){ var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function ub64u(s){ s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return ub64(s); }
  function hex(buf){ return [].map.call(new Uint8Array(buf), function(x){ return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e) {} return null; }

  var standalone = function(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; };
  var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var can = function(){ return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window; };

  function reg(){ return navigator.serviceWorker.register("sw.js", {scope: "./"}).then(function(){ return navigator.serviceWorker.ready; }); }
  if ("serviceWorker" in navigator) { try { reg().catch(function(){}); } catch(e) {} }

  function keys(){ return KEYS ? Promise.resolve(KEYS) : fetch("https://raw.githubusercontent.com/chkchp0702-spec/stock-screener/main/push/keys.json?" + Date.now()).then(function(r){ if (!r.ok) throw new Error("keys"); return r.json(); }).then(function(k){ KEYS = k; return k; }); }
  function idOf(sub){ return C.digest("SHA-256", TE.encode(sub.endpoint)).then(function(h){ return hex(h).slice(0, 24); }); }
  function seal(obj, pub){
    var K;
    return C.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt"]).then(function(k){ K = k;
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return Promise.all([
        C.importKey("spki", ub64(pub), {name: "RSA-OAEP", hash: "SHA-256"}, false, ["encrypt"]).then(function(pk){ return C.exportKey("raw", K).then(function(raw){ return C.encrypt({name: "RSA-OAEP"}, pk, raw); }); }),
        C.encrypt({name: "AES-GCM", iv: iv}, K, TE.encode(JSON.stringify(obj))).then(function(ct){ return {iv: iv, ct: ct}; })
      ]);
    }).then(function(r){ return {k: b64(r[0]), iv: b64(r[1].iv), ct: b64(r[1].ct)}; });
  }
  function post(topic, body){ return fetch(NT + topic, {method: "POST", body: typeof body === "string" ? body : JSON.stringify(body)}).then(function(r){ if (!r.ok) throw new Error("ntfy " + r.status); }); }
  function sendSub(sub){
    return keys().then(function(k){ return Promise.all([idOf(sub), seal(sub.toJSON(), k.rsa_pub)]); })
      .then(function(r){ ls("pushId", r[0]); ls("pushSent", String(Date.now()));
        var uid = ""; try { uid = (window.store && store.uid) || (JSON.parse(localStorage.getItem("app") || "{}").uid) || ""; } catch(z) {}
        return post(SUB, Object.assign({op: "on", id: r[0], mode: mode(), uid: uid}, r[1])).then(function(){ return r[0]; }); });
  }
  // 10/28 알림 다이어트(동료 PB ④): 👔 PB 기본 = 하루 2개(☀️ PB 한 장 + 📌 내 고객 상품·⭐ 관심종목) · 🔔 전부
  function mode(){ return ls("pushMode") === "all" ? "all" : "pb"; }
  window.__pushMode = function(m){ ls("pushMode", m === "all" ? "all" : "pb"); if (ls("pushOn") === "1") current().then(function(s){ if (s) sendSub(s).catch(function(){}); }); };
  function current(){ if (!can()) return Promise.resolve(null); return navigator.serviceWorker.getRegistration("./").then(function(r){ return r ? r.pushManager.getSubscription() : null; }).catch(function(){ return null; }); }

  function turnOn(){
    if (!can()) return Promise.reject(new Error("unsupported"));
    return Notification.requestPermission().then(function(p){
      if (p !== "granted") throw new Error("denied");
      return Promise.all([reg(), keys()]);
    }).then(function(r){
      return r[0].pushManager.getSubscription().then(function(s){ return s || r[0].pushManager.subscribe({userVisibleOnly: true, applicationServerKey: ub64u(r[1].vapid_pub)}); });
    }).then(sendSub).then(function(){ ls("pushOn", "1"); });
  }
  function turnOff(){
    return current().then(function(s){
      var id = ls("pushId");
      var p = s ? s.unsubscribe().catch(function(){}) : Promise.resolve();
      return p.then(function(){ return id ? post(SUB, {op: "off", id: id}).catch(function(){}) : null; });
    }).then(function(){ ls("pushOn", null); ls("pushId", null); });
  }
  // 켜 둔 휴대폰은 하루 한 번 구독 정보를 다시 보냄 (서버 쪽 목록이 빠지지 않게)
  setTimeout(function(){
    if (ls("pushOn") !== "1") return;
    current().then(function(s){ if (s && Date.now() - (+ls("pushSent") || 0) > 20 * 3600e3) sendSub(s).catch(function(){}); });
  }, 4000);

  /* 10/14 A14-5 「켜면 이런 알림이 와요」 — 고르는 목록처럼 보이던 11줄을 하루 시간표 4묶음으로 (스위치 하나는 그대로) · 묶음마다 최근 10일 실제 건수(push_log.json) */
  var GROUPS = [
    {k: "am", ic: "🌅", t: "아침 6~9시", s: "미국 장이 끝난 뒤", tp: ["brief", "cup", "whale", "report"],
     it: [["☀️", "아침 요약", "국면·시황 할 일·오늘 신호 수·다가오는 실적을 한 번에"], ["🌐", "시황리포트 도착", "매일 아침 리포트가 올라오면"], ["☕", "컵 돌파 임박 · 돌파", "돌파선까지 2% 안으로 온 종목, 돌파한 종목"], ["🐋", "고래 픽 변경", "오늘의 고래 픽이 바뀌면"]]},
    {k: "kr", ic: "🏙", t: "한국 장중 9~15시", s: "장이 열려 있는 동안", tp: ["danta", "danta-a", "danta-best", "focus"],
     it: [["⚡", "단타 알람", "장중 단타 신호 (시험 중이라 참고만) · 연속 손절이면 「쉬어 가기」"], ["🎯", "오늘의 집중 — 돌파·이탈", "아침에 고른 집중 종목이 기준가를 뚫거나 20일선 아래로 (10분마다)"]]},
    {k: "us", ic: "🌃", t: "밤 9시~새벽 1시", s: "미국 장 시작 전·첫 30분", tp: ["gap"],
     it: [["📈", "갭 — 장 전 ±4% · 첫 30분 지킴/무너짐", "새로 나온 갭 돌파 종목도 함께"]]},
    {k: "any", ic: "📅", t: "가끔", s: "조건이 맞는 날에만", tp: ["compass", "accum"],
     it: [["🧭", "시장 국면 변화", "5개 시장 중 상승장·하락장·횡보장이 바뀌면"], ["🤫", "매집 종목 박스 돌파", "조용히 모으던 종목이 20일 고점을 넘는 날"]]}
  ];
  window.alarmView = function(){
    var list = GROUPS.map(function(g){
      return '<div class="pu-g"><div class="pu-gh"><span>' + g.ic + '</span><b>' + g.t + '</b><small>' + g.s + '</small><em class="pu-n" data-g="' + g.k + '"></em></div>' +
        g.it.map(function(a){ return '<div class="pu-li"><span>' + a[0] + '</span><div><b>' + a[1] + '</b><small>' + a[2] + '</small></div></div>'; }).join("") + '</div>';
    }).join("");
    var pb = mode() === "pb";
    var pick = '<section class="card pu-mode"><div class="sec" style="margin:0 0 8px">얼마나 받을까요</div>' +
      '<label class="pu-opt' + (pb ? ' on' : '') + '"><input type="radio" name="pumode" value="pb"' + (pb ? ' checked' : '') + '><div><b>👔 PB 기본 — 하루 2개</b><small>아침 8시 ☀️ 오늘 한 장 + 📌 내 고객 상품·⭐ 관심종목에 일이 있을 때만</small></div></label>' +
      '<label class="pu-opt' + (pb ? '' : ' on') + '"><input type="radio" name="pumode" value="all"' + (pb ? '' : ' checked') + '><div><b>🔔 전부</b><small>아래 시간표의 신호 알림까지 모두 (최근 10일 하루 평균 6건쯤)</small></div></label></section>';
    return pick + '<section class="card pu-main"><div class="pu-top"><div><div class="pu-t">🔔 이 휴대폰으로 알림 받기</div><div class="pu-s" id="pust">확인하는 중…</div></div>' +
      '<button class="pu-sw" id="pusw" role="switch" aria-checked="false" aria-label="알림 받기"><i></i></button></div>' +
      '<div id="puhelp"></div><div class="pu-act" id="puact"></div></section>' +
      '<div class="sec">켜면 하루에 이렇게 와요 <span class="mut" id="putot"></span></div><section class="card pu-list">' + list + '</section>' +
      '<section class="card pu-lv"><b>알림 제목 앞 동그라미</b><div><span>🔴</span>지금 봐야 함 <small>(돌파·손절가 도달·국면 변화)</small></div><div><span>🟡</span>오늘 중에 보면 됨</div><div><span>⚪</span>참고 <small>(요약·성적)</small></div>' +
      '<p class="note" style="margin:6px 0 0">밤 11시~아침 7시에 오는 알림은 소리 없이 와요. 언제든 위 스위치로 끌 수 있어요.</p></section>';
  };
  function counts(){
    var get = window.getJSON ? getJSON("archive/x/push_log.json?" + ((window.M && M.updated) || Date.now())) : fetch("archive/x/push_log.json").then(function(r){ return r.json(); });
    get.then(function(L){
      if (!L || !L.length) return;
      var last = L[0].t.slice(0, 10), d0 = new Date(last + "T00:00:00Z"); d0.setUTCDate(d0.getUTCDate() - 9);
      var from = d0.toISOString().slice(0, 10), R = L.filter(function(x){ return x.t.slice(0, 10) >= from; }), days = {};
      R.forEach(function(x){ days[x.t.slice(0, 10)] = 1; });
      GROUPS.forEach(function(g){ var n = R.filter(function(x){ return g.tp.indexOf(x.topic) >= 0; }).length, el = document.querySelector('.pu-n[data-g="' + g.k + '"]');
        if (el) el.textContent = n ? "최근 10일 " + n + "건" : "최근 10일 없음"; });
      var tot = document.getElementById("putot"), nd = Object.keys(days).length;
      if (tot && nd) tot.textContent = "· 최근 10일 " + R.length + "건, 하루 평균 약 " + Math.round(R.length / 10) + "건";
    }).catch(function(){});
  }
  window.alarmInit = function(){
    [].forEach.call(document.querySelectorAll('input[name="pumode"]'), function(r){ r.onchange = function(){ __pushMode(r.value); [].forEach.call(document.querySelectorAll(".pu-opt"), function(l){ l.classList.toggle("on", l.querySelector("input").checked); }); }; });
    var sw = document.getElementById("pusw"), st = document.getElementById("pust"), help = document.getElementById("puhelp"), act = document.getElementById("puact");
    function set(on, msg, cls){ sw.classList.toggle("on", !!on); sw.setAttribute("aria-checked", on ? "true" : "false"); st.className = "pu-s " + (cls || ""); st.innerHTML = msg; }
    function testBtn(){ act.innerHTML = '<button class="btn pu-test" id="putest">테스트 알림 보내기</button>';
      document.getElementById("putest").onclick = function(){ var b = this, id = ls("pushId"); b.disabled = true; b.textContent = "보내는 중… (1분 안에 와요)";
        post(TEST, id || "").then(function(){ setTimeout(function(){ b.disabled = false; b.textContent = "테스트 알림 보내기"; }, 60000); }).catch(function(){ b.disabled = false; b.textContent = "다시 시도"; }); }; }
    function draw(){
      help.innerHTML = ""; act.innerHTML = "";
      if (ios && !standalone()){
        set(false, "홈 화면에 추가한 앱에서만 켤 수 있어요", "warn"); sw.disabled = true;
        help.innerHTML = '<div class="pu-help"><b>아이폰은 이렇게 한 번만</b><ol><li>사파리 아래 <b>공유 버튼(□↑)</b> → <b>홈 화면에 추가</b></li><li>홈 화면의 <b>CH Investing</b> 아이콘으로 열기</li><li>이 화면에서 스위치 켜기</li></ol><a class="btn" href="install.html">그림으로 보기 →</a></div>';
        return;
      }
      if (!can()){ set(false, "이 브라우저는 알림을 지원하지 않아요 (아이폰은 iOS 16.4 이상)", "warn"); sw.disabled = true; return; }
      if (Notification.permission === "denied"){ set(false, "알림이 막혀 있어요", "warn");
        help.innerHTML = '<div class="pu-help">휴대폰 <b>설정 → 알림 → CH Investing</b> 에서 <b>알림 허용</b>을 켠 뒤 다시 와 주세요.</div>'; return; }
      current().then(function(s){
        if (s && Notification.permission === "granted"){ set(true, "켜져 있어요 · 신호가 뜨면 바로 알려 드려요", "ok"); testBtn(); if (ls("pushOn") !== "1"){ ls("pushOn", "1"); sendSub(s).catch(function(){}); } }
        else set(false, "꺼져 있어요 · 스위치를 누르면 켜져요");
      });
    }
    sw.onclick = function(){
      if (sw.disabled || sw.dataset.busy) return; sw.dataset.busy = 1;
      var on = sw.classList.contains("on");
      set(!on, on ? "끄는 중…" : "켜는 중… 알림 허용을 물으면 「허용」");
      (on ? turnOff() : turnOn()).then(function(){ delete sw.dataset.busy; draw(); if (!on) st.innerHTML = "켜졌어요 ✓ · 아래 테스트로 확인해 보세요"; })
        .catch(function(e){ delete sw.dataset.busy; draw();
          if (e && e.message === "denied") set(false, "알림 허용을 눌러야 켜져요", "warn");
          else if (e && e.message === "keys") set(false, "알림 서버 준비 중이에요. 잠시 뒤 다시 눌러 주세요", "warn");
          else set(false, "켜지 못했어요 — 다시 눌러 주세요", "warn"); });
    };
    draw(); counts();
  };

  var css = document.createElement("style");
  css.textContent =
    ".pu-main{padding:18px 16px}.pu-top{display:flex;align-items:center;gap:12px}.pu-top>div{flex:1}" +
    ".pu-t{font-size:18px;font-weight:800}.pu-s{font-size:13.5px;color:var(--sub);margin-top:3px}.pu-s.ok{color:#4dd47a}.pu-s.warn{color:#ffb84d}" +
    ".pu-sw{flex:none;width:62px;height:36px;border-radius:18px;border:0;background:#3a4258;position:relative;cursor:pointer;transition:background .2s}" +
    ".pu-sw i{position:absolute;top:3px;left:3px;width:30px;height:30px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 2px 6px rgba(0,0,0,.3)}" +
    ".pu-sw.on{background:#34c759}.pu-sw.on i{left:29px}.pu-sw:disabled{opacity:.4}" +
    ".pu-help{margin-top:14px;padding:12px;border-radius:12px;background:var(--panel2);font-size:14px;line-height:1.6}.pu-help ol{margin:6px 0 10px;padding-left:20px}" +
    ".pu-act{margin-top:12px}.pu-test{width:100%}" +
    ".pu-list{padding:6px 14px}.pu-li{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);align-items:flex-start}.pu-li:last-child{border-bottom:0}" +
    ".pu-g{padding:4px 0 6px;border-bottom:1px solid var(--line)}.pu-g:last-child{border-bottom:0}.pu-g .pu-li{border-bottom:0;padding:7px 0 7px 4px}" +
    ".pu-gh{display:flex;align-items:baseline;gap:7px;padding:10px 0 2px}.pu-gh>span{font-size:18px}.pu-gh b{font-size:15.5px}.pu-gh small{color:var(--sub);font-size:12.5px;flex:1;min-width:0}.pu-n{font-style:normal;font-size:12.5px;color:var(--sub);background:var(--panel2);border-radius:999px;padding:2px 8px;white-space:nowrap}.pu-n:empty{display:none}" +
    ".pu-lv{padding:12px 14px;font-size:13.5px}.pu-lv>b{display:block;margin-bottom:6px;font-size:14px}.pu-lv div{padding:3px 0}.pu-lv span{display:inline-block;width:24px}.pu-lv small{color:var(--sub)}" +
    ".pu-li>span{font-size:20px;line-height:1.3}.pu-li b{display:block;font-size:14.5px}.pu-li small{color:var(--sub);font-size:12.5px}";
  document.head.appendChild(css);
  (function(){ var c = document.createElement("style"); c.textContent = ".pu-opt{display:flex;gap:10px;align-items:flex-start;padding:10px;border:1.5px solid var(--line);border-radius:12px;margin-bottom:8px;cursor:pointer}.pu-opt.on{border-color:var(--acc,#7c9cff);background:rgba(124,156,255,.08)}.pu-opt input{margin-top:4px}.pu-opt b{display:block;font-size:14.5px}.pu-opt small{color:var(--sub,#aab);font-size:12.5px;line-height:1.4}"; document.head.appendChild(c); })();
})();
;
/* ======== port.js ======== */
/* 💼 포트 (10/9) — 「시황리포트 배분표대로 투자했다면」
   자료: market-strategy-report/market/port.json (src/port.py, 매시간 갱신)
   ① 지금까지 성적(S&P·코스피·60/40 비교) ② 따라하기: 금액 넣으면 칸별·상품별 얼마/몇 주 ③ 비중 바뀐 날 ④ 칸별 기여 ⑤ 날짜별 성적 */
(function(){
  var URL_P = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/port.json";
  var COL = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9", "#2ab3c0", "#8a94a8", "#6fbf4a", "#e0a43a"];
  var URL_K = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/kick.json";
  var URL_C = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/conc.json";   // 🎯 집중 포트 (10/11)
  var CN = null;
  var P = null, K = null, PE = null, S = {amt: 10000000, mode: "us", pf: "base", bg: "전체", bsel: ["S&P500", "코스피", "코스닥", "MSCI 전세계"], cmine: 1, hv: 0, have: {}, my: {spx: 40, ndx: 40, gold: 5, per: 3, wm: "all", w: {}, pick: {}, own: [], prod: [], nm: ""}, mySaved: [], myEdit: null, inf: 0};   // my: 10/14 🙋 내 포트(뼈대 비중 직접 + 킥 종목 체크) · inf: 포트 설명 칸 열림   // cmine: 10/14 A11-2 「내 포트만」 그래프 · hv/have: 10/14 A11-4 「갖고 있는 주 수 → 바꿀 것만」(휴대폰에만 저장)
  // 📅 비교 구간 (10/14 사용자: "포트 수익률과 비교 구간은 10/2 기본, 날짜를 바꿀 수도 있게") — S.from 이 없으면 port.json start(10/02)
  //   고른 날 전 거래일 종가를 0% 로 다시 맞춤(모든 포트·지수 같은 기준) · 앱을 다시 열면 기본(10/02)으로
  var P0 = null, WB = 0;
  function winIdx(){ var ds = P0.dates, f = S.from || P0.start, bi = 0; for (var i = 0; i < ds.length; i++) if (ds[i] < f) bi = i; return Math.max(0, Math.min(bi, ds.length - 2)); }
  function rbase(arr, bi){ if (!arr) return arr; var b = arr[bi]; b = b == null ? 0 : b;
    return arr.slice(bi).map(function(v){ return v == null ? null : Math.round(((1 + v / 100) / (1 + b / 100) - 1) * 10000) / 100; }); }
  function winApply(PF){   // 전체 줄로 계산한 뒤 고른 구간만 잘라 다시 0% 부터
    WB = winIdx(); if (!WB) return;
    var Bn = {}; Object.keys(P0.bench).forEach(function(n){ Bn[n] = rbase(P0.bench[n], WB); });
    var ds = P0.dates.slice(WB);
    P = Object.assign({}, P0, {dates: ds, start: ds[1], bench: Bn, daily: (P0.daily || []).filter(function(d){ return d.d >= ds[1]; })});
    PF.forEach(function(f){ f.line = rbase(f.line, WB); });
  }
  function winHtml(){
    var ds = P0.dates, last = ds[ds.length - 1], cur = P.start, def = !WB;
    var ago = function(n){ var d = new Date(last + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
    var pre = [["기본", P0.start]].concat([[ "1주", ago(7)], ["2주", ago(14)], ["1개월", ago(30)], ["3개월", ago(91)]].filter(function(x){ return x[1] > P0.start; }))
      .concat(ds.length > 2 ? [["마지막 하루", ds[ds.length - 1]]] : []);
    return '<div class="po-win"><span class="po-wl">📅 비교 구간</span>' + pre.map(function(x){ var on = x[0] === "기본" ? def : (!def && S.from === x[1]);
        return '<button type="button" data-win="' + x[1] + '" class="' + (on ? "on" : "") + '">' + x[0] + (x[0] === "기본" ? ' <small>' + md(P0.start) + '</small>' : '') + '</button>'; }).join("") +
      '<details class="po-wdd"><summary>📅 날짜로</summary><label class="po-wd"><input type="date" id="powin" value="' + cur + '" min="' + P0.start + '" max="' + last + '"></label></details>' +
      '<small class="po-wn">' + md(cur) + ' ~ ' + md(last) + ' · ' + (P.dates.length - 1) + '거래일' + (def ? '' : ' · <b>바꾼 구간</b>') + '</small></div>';
  }
  var URL_PE = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/peers.json";
  // 🐻 11/09 A11/9-2 하락장 규칙 겹쳐 보기 — 보기 전용(배분표·규칙은 그대로) · 시장마다 그 시장 주식 칸에만 bear.json 현금 % 적용
  var URL_BR = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bear.json", BR = null, BEARON = false;
  document.addEventListener("click", function(ev){ var c = ev.target.closest && ev.target.closest('.ez-cta.red[data-ezgo="port"]'); if (c) BEARON = true; }, true);   // 쉬운 화면 「하락장 규칙대로 비중 확인하기」로 오면 켜 둠
  try { var sv = JSON.parse(localStorage.getItem("portSet") || "{}"); ["amt", "mode", "pf", "bg"].forEach(function(k){ if (sv[k]) S[k] = sv[k]; }); if (sv.cmine != null) S.cmine = sv.cmine ? 1 : 0; if (sv.hv) S.hv = 1; if (sv.have && typeof sv.have === "object") S.have = sv.have; if (sv.bsel && sv.bsel.length) S.bsel = sv.bsel; if (sv.my && typeof sv.my === "object") S.my = Object.assign(S.my, sv.my, {pick: sv.my.pick || {}, w: sv.my.w || {}, own: sv.my.own || [], prod: sv.my.prod || []}); if (sv.mySaved && sv.mySaved.length) S.mySaved = sv.mySaved; if (sv.myEdit != null) S.myEdit = sv.myEdit; if (sv.inf) S.inf = 1; } catch(e) {}
  // 비교 지수 색 (늘 같은 색)
  var BCOL = {"S&P500": "#7c9cff", "나스닥100": "#b38cff", "다우": "#5fa8d3", "코스피": "#8fd3ff", "코스닥": "#4dd4c6", "MSCI 전세계": "#ffb84d",
              "MSCI 선진국": "#e0a43a", "MSCI 신흥국": "#d98b5f", "니케이225": "#ff8fab", "항셍": "#e66767", "중국 CSI300": "#c96b6b", "심천성분": "#e07a5f", "과창판50": "#f2a65a", "주식60·채권40": "#8a94a8"};
  var BGRP = ["전체", "미국", "한국", "MSCI", "중국", "아시아", "자산배분"];
  function keep(){ try { localStorage.setItem("portSet", JSON.stringify(S)); } catch(e) {} }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null) return "–"; d = d == null ? 2 : d; return (v > 0 ? "+" : "") + v.toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function won(v){ if (v >= 1e8) return (v / 1e8).toFixed(v >= 1e9 ? 1 : 2).replace(/\.?0+$/, "") + "억"; if (v >= 1e4) return Math.round(v / 1e4).toLocaleString("ko-KR") + "만"; return Math.round(v).toLocaleString("ko-KR"); }
  function md(d){ return d ? d.slice(5).replace("-", "/") : ""; }
  // 🧾 정직 계산 (10/11) — 기본: port.json honest.base(주 1회 리밸런싱·비용) · 킥: kick.json honest.ret(다음 날 진입·비용). 없으면 숨김
  function honV(f){ if (WB || f.k === "conc" || f.k === "mine") return null; return f.k === "kick" ? (K && K.honest ? K.honest.ret : null) : ((P.honest && P.honest.base != null) ? P.honest.base : (P.stat || {}).base_honest); }
  function honC(f){ var v = honV(f); return v == null || !window.HON ? "" : HON.chip(v, {d: 2, note: f.k === "kick" ? (K.honest || {}).note : (P.honest || {}).note}); }

  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("#pobody [data-op], #pobrain [data-op]");
    if (t && window.openOP){ ev.preventDefault(); ev.stopPropagation(); openOP(t.getAttribute("data-op")); }
  }, true);
  window.portView = function(){ return '<div id="pobody"><div class="loading">포트 불러오는 중…</div></div>'; };
  window.portInit = function(){
    var t = Date.now();
    Promise.all([fetch(URL_P + "?" + t).then(function(r){ if (!r.ok) throw 0; return r.json(); }),
                 fetch(URL_K + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_PE + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_C + "?" + t).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
                 fetch(URL_BR + "?" + Math.floor(t / 300000)).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })])
      .then(function(a){ P = P0 = a[0]; K = a[1]; PE = a[2]; CN = a[3]; BR = a[4]; draw(); })
      .catch(function(err){ try { console.error("port", err); } catch(x) {} var b = document.getElementById("pobody"); if (b) b.innerHTML = '<div class="empty"><div class="big">💼</div>포트 계산이 아직 안 올라왔어요.<br>다음 자동 수집(매시간) 때 채워져요.</div>'; });
  };

  function draw(){
    var b = document.getElementById("pobody"); if (!b || !P0) return;
    P = P0; WB = 0;
    var B = P.bench, mk = [["S&P500", "S&P500"], ["코스피", "코스피"], ["주식60·채권40", "60·40"]];
    // 두 포트 (같은 날짜 줄)
    var PF = [{k: "base", ic: "💼", t: "기본 포트", s: "킥 없음 · 배분표 그대로", s2: "킥 없음", line: P.nav, color: "#e9c46a"}];
    if (K) PF.push({k: "kick", ic: "⚡", t: "킥 포트", s: (K.rule && K.rule.base_now ? "국면 현금 + 🐋 고래 10% + 확인된 돌파 🧪" : "현금 15%p → 성과 확인된 신호만 🐋☕📈🤫"), s2: "킥 " + Math.round((((K.rules || {}).sleeve || 0) + ((K.rules || {}).whale_sleeve || 0)) * 100) + "% 포함", line: K.kick, color: "#ff6b6b"});
    if (CN && CN.nav && CN.nav.length){   // 🎯 집중 — 포트와 같은 날짜 줄에 맞춤
      var cm = {}; (CN.dates || []).forEach(function(d, i){ cm[d] = CN.nav[i]; });
      var lastv = 0, cl = P.dates.map(function(d){ if (cm[d] != null) lastv = cm[d]; return lastv; });
      PF.push({k: "conc", ic: "🎯", t: "집중 포트", s: "오르는 시장이면 주식 100% · 아니면 절반", s2: (CN.regime && CN.regime.up ? "🟢 상승장" : "🔴 상승장 아님"), line: cl, color: "#4dd47a"});
    }
    // 🙋 내 포트 (10/14 사용자) — S&P·나스닥·금 비중은 내가 정하고, ⚡ 킥 종목은 체크한 것만 · 계산은 휴대폰에서(myLine)
    var MW = myW();
    PF.push({k: "mine", ic: "🙋", t: S.my.nm || "내 포트", s: "S&P " + r1(MW.spx) + "% · 나스닥 " + r1(MW.ndx) + "% · 금 " + r1(MW.gold) + "% · 종목 " + MW.st.length + "개" + ((MW.pr || []).length ? " · 상품 " + MW.pr.length + "개" : ""), s2: "내가 고른 것", line: myLine(MW), color: "#f472b6"});
    PF.forEach(function(f){ f.line0 = f.line; }); PFR = PF;   // 10/15 A11-3: 문지르기는 자르기 전 줄로 다시 셈
    winApply(PF); B = P.bench;   // 📅 고른 구간으로 자르고 다시 0% 부터
    PF.forEach(function(f){
      var v = f.line, n = v.length, peak = -1e9, mdd = 0, win = 0, best = null, worst = null;
      for (var i = 0; i < n; i++){ var x = 1 + v[i] / 100; peak = Math.max(peak, x); mdd = Math.min(mdd, (x / peak - 1) * 100);
        if (i){ var r = ((1 + v[i] / 100) / (1 + v[i - 1] / 100) - 1) * 100, sp = ((1 + B["S&P500"][i] / 100) / (1 + B["S&P500"][i - 1] / 100) - 1) * 100;
          if (r >= sp) win++; if (!best || r > best.r) best = {d: P.dates[i], r: r}; if (!worst || r < worst.r) worst = {d: P.dates[i], r: r}; } }
      f.ret = v[n - 1]; f.mdd = mdd; f.win = win; f.days = n - 1; f.best = best; f.worst = worst;
    });
    if (!PF.some(function(f){ return f.k === S.pf; })) S.pf = "base";
    var F = PF.filter(function(f){ return f.k === S.pf; })[0] || PF[0];
    // 비교 지수 목록 (port.json bench_meta — 달러 기준, 현지 통화도)
    var BM = (P.bench_meta || Object.keys(B).map(function(n){ return {name: n, group: "", ok: true}; })).filter(function(m){ return m.ok !== false && B[m.name]; })
      .map(function(m){ var v = B[m.name]; return {name: m.name, group: m.group || "", ret: v[v.length - 1], local: m.local, r1: m.r1}; });
    S.bsel = S.bsel.filter(function(n){ return B[n]; }); if (!S.bsel.length) S.bsel = ["S&P500"];
    var beat = function(f){ return BM.filter(function(m){ return f.ret >= m.ret; }).length; };
    var bmx = Math.max.apply(null, BM.map(function(m){ return Math.abs(m.ret); }).concat(PF.map(function(f){ return Math.abs(f.ret); }), [0.5]));
    var rowsB = BM.filter(function(m){ return S.bg === "전체" || m.group === S.bg; }).map(function(m){ return {b: m, ret: m.ret}; })
      .concat(PF.map(function(f){ return {f: f, ret: f.ret}; })).sort(function(a, b){ return b.ret - a.ret; });
    // 10/13 「우와」 ③: 내 포트 위아래 2줄만 · 「전체 보기」로 펼침 (S&P500 줄은 늘 보임)
    var nearI = {}; rowsB.forEach(function(x, i){ if (x.f || (x.b && x.b.name === "S&P500")) for (var j = i - 2; j <= i + 2; j++) nearI[j] = 1; });
    var lbCut = !S.lbAll && rowsB.length > 9;
    var myRank = rowsB.map(function(x){ return x.f && x.f.k; }).indexOf(F.k) + 1;
    // 10/14 A11-3: 등수 변천 — 「전체」 묶음에서 날짜마다 내 포트가 몇 위였나(시작일은 모두 0% 라 뺌)
    var rkH = null, rkTot = BM.length + PF.length, rkY = null, rkSvg = "";
    if (S.bg === "전체" && P.dates.length > 2){ rkH = [];
      for (var di = 1; di < P.dates.length; di++){ var mv = F.line[di]; if (mv == null){ rkH.push(null); continue; }
        var cnt = 1; BM.forEach(function(m){ var v = (B[m.name] || [])[di]; if (v != null && v > mv) cnt++; }); PF.forEach(function(f){ if (f !== F && f.line[di] != null && f.line[di] > mv) cnt++; });
        rkH.push(cnt); }
      rkY = rkH.length > 1 ? rkH[rkH.length - 2] : null;
      var pts = [], rw = 64, rh = 18, rn = rkH.length;
      rkH.forEach(function(rv, i){ if (rv == null) return; pts.push((2 + i * (rw - 4) / Math.max(1, rn - 1)).toFixed(1) + "," + (2 + (rv - 1) / Math.max(1, rkTot - 1) * (rh - 4)).toFixed(1)); });
      if (pts.length > 1) rkSvg = '<svg class="po-rks" viewBox="0 0 ' + rw + ' ' + rh + '" width="' + rw + '" height="' + rh + '"><polyline points="' + pts.join(" ") + '" fill="none" stroke="' + F.color + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + pts[pts.length - 1].split(",")[0] + '" cy="' + pts[pts.length - 1].split(",")[1] + '" r="2.2" fill="' + F.color + '"/></svg>';
    }
    var rkNow = rkH && rkH.length ? rkH[rkH.length - 1] : myRank;
    var rkDelta = rkY == null || rkNow == null ? '' : (rkNow < rkY ? '<em class="w">어제 ' + rkY + '위 ↑</em>' : rkNow > rkY ? '<em class="l">어제 ' + rkY + '위 ↓</em>' : '<em>어제도 ' + rkY + '위</em>');
    // 10/15 A11-5: 포트 카드 4장(같은 「9/14곳 이김」 반복) → 등수 한 줄 띠 · 「전체」 묶음 기준 · 어제 등수와 비교
    var rkOf = function(f, di){ var mv = f.line[di]; if (mv == null) return null; var c = 1;
      BM.forEach(function(m){ var v = (B[m.name] || [])[di]; if (v != null && v > mv) c++; }); PF.forEach(function(g){ if (g !== f && g.line[di] != null && g.line[di] > mv) c++; }); return c; };
    var nL = P.dates.length - 1, RK = PF.map(function(f){ return {f: f, now: rkOf(f, nL), y: nL >= 2 ? rkOf(f, nL - 1) : null, w: beat(f)}; })
      .sort(function(a, b){ return (a.now || 99) - (b.now || 99); });
    var wSame = RK.every(function(x){ return x.w === RK[0].w; });
    var stripH = '<div class="po-rkb"><div class="po-rkbh">🏁 전체 ' + rkTot + '곳 중 등수 <small>누르면 그 포트 기준</small></div><div class="po-rkbr">' +
      RK.map(function(x){ return '<button type="button" data-pf="' + x.f.k + '" class="' + (S.pf === x.f.k ? "on" : "") + '">' + x.f.ic + ' <b>' + (x.now || "–") + '</b>위</button>'; }).join("") + '</div>' +
      '<div class="po-rkbs">' + (wSame ? (PF.length > 1 ? PF.length + '개 포트 모두 ' : '') + '시장 ' + BM.length + '곳 중 <b>' + RK[0].w + '</b>곳 이김'
        : '이긴 시장 ' + RK.map(function(x){ return x.f.ic + ' <b>' + x.w + '</b>'; }).join(' · ') + ' / ' + BM.length + '곳') + '</div>' +
      (nL >= 2 ? '<div class="po-rkbs">어제보다 ' + RK.map(function(x){ if (x.y == null || x.now == null) return x.f.ic + ' –';
        return x.y === x.now ? x.f.ic + ' ' + x.now + ' 그대로' : '<span class="' + (x.now < x.y ? "w" : "l") + '">' + x.f.ic + ' ' + x.y + '→' + x.now + (x.now < x.y ? ' ↑' : ' ↓') + '</span>'; }).join(' · ') + '</div>' : '') +
      (honC(F) ? '<div class="po-rkbo">' + F.ic + ' ' + F.t + ' ' + honC(F) + '</div>' : '') + '</div>';
    var cmpH = '<div class="sec">🏁 시장 ' + BM.length + '곳과 비교 <small class="mut">' + md(P.start) + '부터 · 달러 기준</small></div><section class="card po-lb">' +
      stripH +
      '<div class="po-chips">' + BGRP.filter(function(g){ return g === "전체" || BM.some(function(m){ return m.group === g; }); }).map(function(g){
        return '<button data-bg="' + g + '" class="' + (S.bg === g ? "on" : "") + '">' + g + '</button>'; }).join("") + '</div>' +
      '<div class="po-rank"><b>' + F.ic + ' ' + F.t + '</b>' + (rkSvg ? '<span class="po-rkh">' + rkDelta + rkSvg + '</span>' : '') + '<span class="po-rn">' + myRank + '<small>위 / ' + rowsB.length + '</small></span></div>' +
      '<div class="po-rk">' + rowsB.map(function(x, i){
        if (lbCut && !nearI[i]) return (nearI[i - 1] ? '<div class="po-gapr">⋯</div>' : '');
        var v = x.ret, dv = v - F.ret, cap = 3, w = Math.min(Math.abs(dv), cap) / cap * 50;   // 10/14 A11-3: 막대 가운데 = 내 포트(0점) · 오른쪽 = 그쪽이 앞섬 · 왼쪽 = 내가 앞섬 · ±3%p 넘으면 ›‹
        var bar = '<div class="bar z"><span class="' + (dv > 0 ? "p" : "m") + '" style="width:' + w.toFixed(1) + '%"></span>' + (Math.abs(dv) > cap ? '<em class="ov ' + (dv > 0 ? "r" : "l") + '">' + (dv > 0 ? "›" : "‹") + '</em>' : '') + '</div>';
        if (x.f) return '<div class="po-rr me' + (x.f.k === "kick" ? " k" : "") + (S.pf === x.f.k ? " on" : "") + '" data-pf="' + x.f.k + '"><span class="no">' + (i + 1) + '</span><span class="n">' + x.f.ic + ' <b>' + x.f.t + '</b></span>' + bar + '<b class="v ' + cls(v) + '">' + sg(v) + '</b><span class="d"></span></div>';
        var m = x.b, on = S.bsel.indexOf(m.name) >= 0, d = F.ret - m.ret;
        return '<div class="po-rr' + (on ? " sel" : "") + '" data-bn="' + e(m.name) + '"><span class="no">' + (i + 1) + '</span><span class="n"><i class="dot" style="' + (on ? "background:" + (BCOL[m.name] || "#8a94a8") : "") + '"></i>' + e(m.name) +
          '<small>' + e(m.group) + (m.local != null && Math.abs(m.local - m.ret) >= 0.05 ? ' · 현지 ' + sg(m.local, 1) : '') + '</small></span>' + bar +
          '<b class="v ' + cls(v) + '">' + sg(v) + '</b><span class="d ' + (d >= 0 ? "w" : "l") + '">' + (d >= 0 ? "앞섬 " : "뒤짐 ") + sg(d, 1).replace("%", "p") + '</span></div>'; }).join("") + '</div>' +
      (rowsB.length > 9 ? '<button class="po-all" data-lball="1">' + (S.lbAll ? '내 자리 근처만 보기 ▴' : '전체 ' + rowsB.length + '곳 보기 ▾') + '</button>' : '') +
      '<p class="note" style="margin:6px 0 0">지수 줄을 누르면 아래 그래프 「전체」에 넣고 빼요(최대 5개). 막대 가운데 선 = ' + F.ic + ' ' + F.t + ' (초록 왼쪽 = 내가 앞섬 · 빨강 오른쪽 = 그쪽이 앞섬 · ±3%p 넘으면 ›). 「앞섬·뒤짐」도 같은 기준. 포트와 같은 달러 기준이라 코스피·니케이처럼 현지 통화와 다를 땐 「현지」 수익률을 함께 적었어요.</p></section>';
    var ex = F.ret - B["S&P500"][B["S&P500"].length - 1];
    var cmp = S.bsel.slice(0, 4);
    var spN = B["S&P500"][B["S&P500"].length - 1];
    var gapB = function(v){ var d = v - spN; return '<em class="' + (d >= 0 ? "w" : "l") + '">' + (d >= 0 ? "앞섬 " : "뒤짐 ") + sg(d).replace("%", "%p") + '</em>'; };
    var FB = PF.filter(function(f){ return f.k === "base"; })[0], FM = PF.filter(function(f){ return f.k === "mine"; })[0];
    var fxv = FB && FM && FB.ret != null && FM.ret != null ? FM.ret - FB.ret : null, fxD = myDiff(MW);
    var h = winHtml() + '<section class="po-sum" id="posum"><div class="po-sh"><span id="posumh">' + md(P.start) + '부터 성적</span> <small>S&P500보다 <button class="po-shb" type="button" data-pshare="1">📤 공유</button></small></div>' +
      PF.map(function(f){ var op = S.sumOpen === f.k; return '<button class="po-sr' + (S.pf === f.k ? " on" : "") + (op ? " op" : "") + ' ' + f.k + '" data-pf="' + f.k + '" data-sumo="1"><span>' + f.ic + ' ' + f.t + ' <i class="po-sra">' + (op ? '▴' : '▾') + '</i></span><b class="' + cls(f.ret) + '">' + sg(f.ret) + '</b>' + gapB(f.ret) + '</button>' + (op ? holdBox(f) : ''); }).join("") +
      (fxv != null ? '<div class="po-myfx" id="pomyfx">🙋 내 선택 효과 ' + fxTag(fxv) + ' <small>' + (fxD.length ? '💼 기본 포트 대비' : '아직 기본과 같은 비중') + '</small></div>' : '') +
      '<div class="po-sr sp"><span>🇺🇸 S&P500</span><b class="' + cls(spN) + '">' + sg(spN) + '</b><em>기준</em></div></section>' + infHtml() +
      '<section class="po-hero' + (F.k === "kick" ? " kick" : F.k === "conc" ? " conc" : F.k === "mine" ? " mine" : "") + '"><div class="po-k">' + F.ic + ' <b>' + F.t + '</b> · ' + F.s + ' · ' + md(P.start) + '부터</div>' +
      '<div class="po-gap ' + (ex >= 0 ? "w" : "l") + '"><small>S&P500보다</small><b>' + sg(ex).replace("%", "%p") + '</b><em>' + (ex >= 0 ? "앞서는 중 👍" : "뒤지는 중") + '</em></div>' +
      '<div class="po-rl2">수익률 <b class="' + cls(F.ret) + '">' + sg(F.ret) + '</b> · S&P500 <b class="' + cls(spN) + '">' + sg(spN) + '</b></div>' + (F.k === "mine" && fxv != null ? '<div class="po-fx"><div class="po-fxh">🙋 내 선택 효과 ' + fxTag(fxv) + '<small>내 포트 ' + sg(FM.ret) + ' vs 💼 기본 ' + sg(FB.ret) + '</small></div>' +
        '<div class="po-fxd">' + (fxD.length ? '다른 점: ' + fxD.map(e).join(' · ') : '아직 기본 포트와 같은 비중이에요 — 아래 🙋 칸에서 바꾸면 여기 차이가 생겨요') + '</div>' +
        '<details class="po-fxb"><summary>날짜별로 내 선택이 벌고 잃은 것</summary>' + fxBars(FM, FB) + '</details></div>' : '') + (honV(F) != null ? '<div class="po-hon">' + honC(F) + '<small>' + (F.k === "kick" ? "돌파 칸은 다음 거래일 종가에 사고 비용을 뺀 값" : "주 1회만 비중을 맞추고 그때 비용을 뺀 값") + '</small></div>' : '') +
      '<div class="po-won">💰 ' + won(S.amt) + '원 넣었다면 <b class="' + cls(F.ret) + '">' + (F.ret >= 0 ? "+" : "−") + won(Math.abs(S.amt * F.ret / 100)) + '원</b>' +
        ' <small>S&P였다면 ' + (B["S&P500"][B["S&P500"].length - 1] >= 0 ? "+" : "−") + won(Math.abs(S.amt * B["S&P500"][B["S&P500"].length - 1] / 100)) + '원 · 금액은 📋 따라하기 투자금 기준</small></div>' +
      (F.k === "conc" && CN && CN.now ? '<div class="po-cbuy"><div class="po-cbh">🛒 지금 살 것 <small>' + won(S.amt) + '원 · ' + (S.mode === "kr" ? "₩ 원화" : "💵 외화") + ' · ' + (CN.regime && CN.regime.up ? "🟢 오르는 시장" : "🔴 오르는 시장 아님") + '</small></div>' +
        concPlan().map(function(c){ var it = c.items[0] || {};
          if (c.kick) return '<div class="cn-buy" data-goto="port~pofollow"><b class="pct">' + c.x.pct + '%</b><span class="nm">⚡ 킥 종목 ' + c.items.length + '개<small>' + c.items.slice(0, 4).map(function(t){ return e(t.short); }).join(" · ") + (c.items.length > 4 ? " …" : "") + '</small></span><span class="q"><b>›</b><small>' + won(c.amt) + '원</small></span></div>';
          return '<div class="cn-buy" data-op="' + e(it.code) + '"><b class="pct">' + c.x.pct + '%</b><span class="nm">' + e(c.x.name) + '<small>' + e(it.nm) + (it.code && it.code !== it.nm ? ' ' + e(it.code) : '') + '</small></span>' +
            '<span class="q"><b>' + (it.sh != null ? it.sh.toLocaleString("ko-KR") + '주' : '가격 확인') + '</b><small>' + won(c.amt) + '원</small></span></div>'; }).join("") +
        '<div class="po-cbn">판정이 바뀌는 날 · 🔄 월말 흐름 날에만 고치면 돼요 · 투자금은 📋 따라하기에서</div></div>' : '') +
      (function(){ var VR = F.k === "kick" ? (K && K.vol_rule) : F.k === "conc" ? (CN && CN.vol_rule) : F.k === "mine" ? null : P.vol_rule; if (!VR || !VR.on) return '';
        return '<div class="po-vr" data-tip="' + e("🦴 변동성 맞춤(" + VR.role + ") — S&P½+나스닥½ 최근 20일 흔들림이 목표 " + VR.target + "%를 넘으면 주식을 그만큼 줄여 현금·단기채로. 바닥 " + VR.floor + "% · 5%p 넘게 바뀔 때만 조정 · " + (VR.from || "").slice(5) + "부터") + '">🦴 변동성 방어(' + e(VR.role) + ') · 주식 <b>' + VR.eq_scale + '%</b> 유지 <small>20일 흔들림 ' + VR.vol20 + '% / 목표 ' + VR.target + '% ⓘ</small></div>'; })() +
      // 🔄 10/28 Q10/28-2: 연기금 월말 리밸런싱 앞지르기 (💼 port.json month_flow · 🎯 conc.json month_flow — Q10/28-3)
      (function(){ var M = F.k === "conc" ? (CN && CN.month_flow) : (F.k === "kick" || F.k === "mine") ? null : P.month_flow; if (!M || !M.on) return '';
        var tip = "🔄 월말 흐름 — 매달 마지막 " + M.k + "거래일, 60/40 펀드(S&P·중기채) 주식 비중이 ±" + M.th + "%p 넘게 쏠리면 펀드가 억지로 사고팔 쪽에 미리 섬: 넘침 → 주식 칸 " + Math.round((M.f || 0.6) * 100) + "% 미국 장기채(TLT) · 모자람 → " + (F.k === "conc" ? "추세·현금" : "금·추세") + " 칸 " + Math.round((M.f || 0.6) * 100) + "% 주식. 하루 먼저 알림 → 그날 밤 미국 종가 예약(LOC). 검증 2017~ 연 +" + (F.k === "conc" ? "2.3" : "2.4") + "%p · " + (M.from || "").slice(5) + "부터";
        var st = M.sig > 0 ? '주식 → 장기채 <b>' + M.pct + '%</b>' : M.sig < 0 ? (F.k === "conc" ? '추세·현금 → 주식 쪽' : '금·추세 → 주식 쪽') : M.window ? '쏠림 작음 · 그대로' : '쉬는 중 · 월말 ' + M.k + '거래일에만';
        // ⏰ 11/17 Q11/6-3: 하루 먼저 알림 — 오늘 밤 미국 종가 예약(LOC) 주문 (port.json·conc.json month_flow.tonight)
        var T = M.tonight, ton = T && T.act ? '<div class="po-vr" style="border:1px solid #ffb84d;background:rgba(255,184,77,.10)" data-tip="' + e((T.note || "") + " · " + (T.for || "").slice(5) + " 비중을 오늘 밤 장 마감 가격으로 맞춰 둠") + '">⏰ <b>' + e(T.text) + '</b> <small>' + (T.order_at || "").slice(5) + ' 밤 · ' + (T.drift != null ? '쏠림 ' + (T.drift >= 0 ? "+" : "") + T.drift + '%p · ' : '') + '하루 먼저 알림 ⓘ</small></div>' : '';
        return ton + '<div class="po-vr" data-tip="' + e(tip) + '">🔄 월말 흐름 · ' + st + ' <small>' + (M.drift != null ? '쏠림 ' + (M.drift >= 0 ? "+" : "") + M.drift + '%p · ' : '') + (M.for || "").slice(5) + ' 기준 ⓘ</small></div>'; })() +
      '<div class="po-sub">' + F.days + '거래일 · 시장 ' + BM.length + '곳 중 <b>' + beat(F) + '</b>곳보다 앞섬 · 가장 크게 빠졌을 때 <b>' + sg(F.mdd) + '</b></div>' +
      '<div class="po-cmp n' + cmp.length + '">' + cmp.map(function(n){ var x = B[n][B[n].length - 1];
        return '<div style="border-top:3px solid ' + (BCOL[n] || "#8a94a8") + '"><small>' + e(n) + '</small><b class="' + cls(x) + '">' + sg(x) + '</b><em class="' + (F.ret >= x ? "w" : "l") + '">' + (F.ret >= x ? "포트가 앞섬" : "포트가 뒤짐") + '</em></div>'; }).join("") + '</div>' +
      // 10/14 A11-2: 「🔍 내 포트만」(기본) = 💼⚡🎯 + S&P 만 · 둥근 눈금 · 선 끝 값(범례 없음) / 「전체」 = 고른 지수까지(지수 줄 눌러 넣고 빼기)
      '<div class="po-ctg"><button data-cm="1" class="' + (S.cmine ? "on" : "") + '">🔍 내 포트만</button><button data-cm="0" class="' + (S.cmine ? "" : "on") + '">전체 ' + (S.bsel.length + 1) + '</button>' +
        '<small>' + (S.cmine ? "S&P 와 세 포트만 크게" : "지수 줄을 누르면 넣고 빼요") + '</small></div>' +
      '<div class="po-ch">' + (S.cmine
        ? V.lines(PF.map(function(f){ return {name: f.ic + " " + f.t, short: f.ic, color: f.color, vals: f.line}; }).concat([{name: "S&P500", short: "S&P", color: BCOL["S&P500"], vals: B["S&P500"], dash: 1}]),
            P.dates.map(md), {h: 200, unit: "%", zero: 1, nodots: P.dates.length > 12, marks: marks(F), endLabels: 1, niceTicks: 1, nolegend: 1})
        : V.lines([{name: F.ic + " " + F.t, color: F.color, vals: F.line}].concat(S.bsel.map(function(n){ return {name: n, color: BCOL[n] || "#8a94a8", vals: B[n], dash: 1}; })),
            P.dates.map(md), {h: 200, unit: "%", zero: 1, nodots: P.dates.length > 12, marks: marks(F), niceTicks: 1})) + '</div>' +
      '<div class="po-mk"><span><i style="background:#ffb84d"></i>비중·상품 바뀐 날</span>' + (F.k === "kick" ? '<span><i style="background:#4dd47a"></i>킥 사기</span><span><i style="background:#ff6b6b"></i>킥 팔기</span>' : '') + '</div>' +
      '<div class="po-w">S&P를 이긴 날 <b>' + F.win + ' / ' + F.days + '</b>' + (F.best ? ' · 가장 좋았던 날 ' + md(F.best.d) + ' <b class="up">' + sg(F.best.r) + '</b>' : '') + (F.worst ? ' · 가장 나빴던 날 ' + md(F.worst.d) + ' <b class="dn">' + sg(F.worst.r) + '</b>' : '') + '</div>' +
      (P0.dates.length > 3 ? '<div class="po-scr" id="poscr"><div class="po-scrh">👆 시작일 문지르기 <small>밀면 「그날부터 샀다면」이 바로 바뀌어요</small></div>' +
        '<input type="range" id="poscrr" min="0" max="' + (P0.dates.length - 2) + '" step="1" value="' + WB + '" aria-label="비교 시작일">' +
        '<div class="po-scrt"><span>' + md(P0.dates[1]) + '</span><span>' + md(P0.dates[P0.dates.length - 1]) + '</span></div>' +
        '<div class="po-scro" id="poscro">' + scrubOut(WB) + '</div></div>' : '') + '</section>';
    if (S.pf === "mine") h += myHtml(MW);   // 🙋 고르는 칸은 성적 바로 아래 (바꾸면 위 숫자가 바로 바뀌는 게 보이게)
    h += cmpH;   // 10/12: 위 바로가기 칩 순서(💼 성적 → 🏁 비교)와 맞춤
    // 🗣 10/27 A10/27-1 목소리 경주 (voices.js) — 포트 선은 여기서 넘겨 줌(🙋 내 포트는 휴대폰 계산)
    try { window.__poLines = {dates: P.dates, base: FB && FB.line, mine: FM && FM.line, mineName: FM && FM.t}; } catch(x) {}
    h += '<div class="sec">🗣 목소리 경주 <small class="mut">누구 말을 따랐어야 했나 · 같은 돈</small></div><section class="card vr-c"><div id="vrace" class="vr-w"><small class="mut">불러오는 중…</small></div></section>';
    h += '<div id="podz"></div>';   // 🎛 10/21 A10/21-1 포트 설계기 (port_design.js)

    if (CN && CN.regime) h += concHtml();
    if (K && S.pf === "kick") h += kickHtml();

    // ② 따라하기
    var isC = S.pf === "conc" && CN && CN.now;
    var segs = S.pf === "mine" ? myPlan().map(function(c, i){ return {label: c.x.name, v: c.x.pct, color: c.kick ? "#ff6b6b" : c.prod ? "#38bdf8" : c.i >= 0 ? COL[c.i % COL.length] : "#8a94a8"}; }) : isC ? concPlan().map(function(c, i){ return {label: c.x.name, v: c.x.pct, color: c.kick ? "#ff6b6b" : COL[i % COL.length]}; }) : P.hold.map(function(x, i){ return {label: x.name, v: x.pct, color: COL[i % COL.length]}; });
    h += '<div class="sec">📋 지금 이렇게 담으면 돼요 <small class="mut">' + (S.pf === "mine" ? "🙋 내가 정한 비중 기준" : md(P.changes[0] && P.changes[0].date) + ' 배분표 기준') + '</small></div>' +
      '<section class="card po-follow"><div data-vd></div><div class="po-sb">' + segs.map(function(sg_, i){ return sg_.v > 0 ? '<i data-ix="' + i + '" style="flex:' + sg_.v + ';background:' + sg_.color + '" title="' + e(sg_.label) + '"></i>' : ''; }).join("") + '</div>' +
      '<div class="po-sbl">' + segs.map(function(sg_, i){ return '<span data-ix="' + i + '" class="' + (sg_.v > 0 ? "" : "z") + '"><i style="background:' + sg_.color + '"></i>' + e(sg_.label) + ' <b>' + sg_.v + '%</b></span>'; }).join("") + '</div>' +
      '<div class="po-in"><label>내 투자금</label><div class="po-amt"><input id="poamt" inputmode="numeric" value="' + S.amt.toLocaleString("ko-KR") + '"><span>원</span></div>' +
      '<div class="po-q">' + [3e6, 1e7, 3e7, 1e8].map(function(v){ return '<button data-v="' + v + '">' + won(v) + '</button>'; }).join("") + '</div>' +
      '<div class="po-mode po-pf"><button data-pf="base" class="' + (S.pf === "base" ? "on" : "") + '">💼 기본</button>' + (K ? '<button data-pf="kick" class="' + (S.pf === "kick" ? "on" : "") + '">⚡ 킥 포함</button>' : '') + (CN && CN.now ? '<button data-pf="conc" class="' + (S.pf === "conc" ? "on" : "") + '">🎯 집중+킥</button>' : '') + '<button data-pf="mine" class="' + (S.pf === "mine" ? "on" : "") + '">🙋 내 포트</button></div>' +
      '<div class="po-mode"><button data-m="us" class="' + (S.mode === "us" ? "on" : "") + '">💵 외화 베이스</button><button data-m="kr" class="' + (S.mode === "kr" ? "on" : "") + '">₩ 원화 베이스</button></div></div>' +
      '<div class="po-rcp"><div class="po-rch">🧾 주문서 <small>' + won(S.amt) + '원 · ' + (S.mode === "kr" ? "₩ 원화" : "💵 외화") + '</small></div>' +
      // 10/14 A11-4: 「갖고 있는 주 수」를 넣으면 주문서가 「처음부터 다 사기」 대신 「바꿀 것만」(+n주 사기 · −n주 팔기 · 그대로)
      '<div class="po-hv"><button type="button" id="pohvt" class="' + (S.hv ? "on" : "") + '">' + (S.hv ? "✍️ 갖고 있는 주 수 넣는 중" : "✍️ 갖고 있는 주 수 넣기") + '</button><small>' + (S.hv ? "주문서가 「바꿀 것만」 보여 줘요 · 휴대폰에만 저장" : "넣으면 「바꿀 것만」 보여 줘요") + '</small></div>' +
      '<p class="po-rl" style="margin:6px 0 2px;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all">💼 기본 포트는 S&P500 200일선 규칙이 먼저예요 · 🔁 닮은 장 규칙은 국내 주식과 시장별 참고용 (11/12)</p>' +   // 🔁 11/12 사용자 「그 한 줄 넣고」
      bearBtn() +
      '<div id="porows"></div><div id="pobrx"></div><div id="pohvx"></div>' +
      '<div class="po-cp"><button class="btn" id="pocopy">📋 주문 목록 복사</button><span id="pocpst"></span></div></div>' +
      '<p class="note">환율 ' + (P.fx ? P.fx.toLocaleString("ko-KR") + "원" : "–") + ' · 주 수는 ' + md(P.asof) + ' 종가 기준 내림. <b>외화 베이스</b> = 미국 ETF를 달러로 · <b>원화 베이스</b> = 같은 걸 담은 한국 상장 ETF로 바꿔 원화로. 원화 상품이 없는 칸과 해외 개별 종목(🇭🇰 등)은 원화 베이스에서도 외화예요. ' +
      '<b>비중이 바뀐 날(아래 「비중 바뀐 날」)에만 고치면</b> 돼요.</p></section>';

    // ③ 비중 바뀐 날
    h += '<div class="sec">🔁 비중 바뀐 날</div><section class="card po-tl no-clp">' + P.changes.map(function(c, i){
      return '<div class="po-tli' + (i === 0 ? " now" : "") + '"><span class="d">' + md(c.date) + (i === 0 ? ' <em>지금</em>' : '') + '</span><span class="t">' + e(c.why || "") + '</span></div>'; }).join("") +
      (P.changes.length < 2 ? '<p class="note" style="margin:6px 0 0">' + md(P.start) + ' 이후 배분표가 그대로예요. 리포트가 비중을 바꾸면 여기에 쌓이고 알림이 가요.</p>' : '') + '</section>';

    // 🧭 섹터 의견 (10/11 C안) — 리포트의 섹터 판단은 배분표 밖에서 그림자로 채점 (port.json views)
    if (P.views && P.views.rows && P.views.rows.length){
      var VW = P.views, vmx = Math.max.apply(null, VW.rows.map(function(x){ return Math.abs(x.ret || 0); }).concat([0.5]));
      // 10/28 사용자 「2번」: 섹터 의견 = 실제 돈 (🧭 섹터 칸 = 주식의 20%) — 칩의 %는 실제 비중
      var SLV = (P.hold || []).filter(function(x){ return /^🧭/.test(x.name); }).reduce(function(a, x){ return a + (+x.pct || 0); }, 0), VT = VW.rows.reduce(function(a, x){ return a + (+x.pct || 0); }, 0);
      var realPct = function(x){ return SLV && VT ? Math.round(x.pct / VT * SLV * 10) / 10 : x.pct; };
      h += '<div class="sec">🧭 섹터 칸 <small class="mut">' + (SLV ? '실제 ' + Math.round(SLV * 10) / 10 + '% (주식의 20%) · 리포트 섹터 판단대로 · 지수 코어와 비교' : '리포트의 섹터 판단 · 돈은 안 넣고 지수 코어와 비교') + '</small></div><section class="card po-vw">' +
        (VW.pending ? '<p class="cn-n">' + md(VW.since) + ' 첫 거래일부터 채점해요. 12/23에 코어(S&P½+나스닥½)와 비교해 키울지·접을지 정해요.</p>'
          : '<div class="cn-v" style="grid-template-columns:repeat(3,1fr)"><div class="me"><small>🧭 섹터 ' + (SLV ? "칸" : "의견") + '</small><b class="' + cls(VW.ret) + '">' + sg(VW.ret) + '</b></div><div><small>코어</small><b class="' + cls(VW.core) + '">' + sg(VW.core) + '</b></div><div><small>차이</small><b class="' + cls(VW.edge) + '">' + sg(VW.edge).replace("%", "%p") + '</b></div></div>') +
        '<div class="po-vcs">' + VW.rows.map(function(x, i){ var st = x.ret == null ? "wait" : x.ret - (VW.core || 0) >= 0 ? "g" : "b";
          return '<button class="po-vc ' + st + '" data-vi="' + i + '"><b>' + e(x.name.replace(/\s*\(.*\)$/, "")) + '</b> ' + realPct(x) + '%<small>' + (x.ret == null ? "대기" : sg(x.ret, 1) + (st === "g" ? " ↑" : " ↓")) + '</small></button>'; }).join("") + '</div>' +
        '<div class="po-vd" id="povd"></div>' +
        '<p class="note" style="margin:6px 0 0">10/11부터 💼 기본 포트 뼈대는 검증한 규칙(🟢 S&P·나스닥 코어 95%·금 5% / 🔴 코어 63%·금 11%·현금 26%)이 정해요. 2017년 이후 옛 뼈대(섹터 칸 + 현금 26% 상시)는 S&P보다 연 −1.5%p, 새 뼈대는 +1.9%p였어요.</p></section>';
    }

    // 🌏 해외 동종주 (market/peers.json) — 미국 강세 섹터와 같은 일을 하는 일·중·홍·대만·한국 종목을 달러 기준으로 비교
    if (PE && PE.themes && PE.themes.length) h += peersHtml();

    // ④ 칸별 기여
    var mx = Math.max.apply(null, P.hold.map(function(x){ return Math.abs(x.contrib) || 0.01; }));
    h += '<div class="sec">🧩 어느 칸이 벌고 잃었나 <small class="mut">' + md(P0.start) + '부터 기여 %p' + (WB ? ' (📅 구간과 상관없이 처음부터)' : '') + '  · 칸별 신호(S&P 대비·20일선)</small></div><section class="card po-ct">' +
      P.hold.slice().sort(function(a, b){ return b.contrib - a.contrib; }).map(function(x){
        var i = P.hold.indexOf(x), w = Math.abs(x.contrib) / mx * 50;
        var us = x.us.map(function(u){ return '<span class="po-tk" data-op="' + e(u.t) + '">' + e(u.t) + '</span> ' + sg(u.since, 1); }).join(" · ");
        var sgc = /^강함/.test(x.sig || "") ? "g" : /^약함/.test(x.sig || "") ? "b" : /^꺾이/.test(x.sig || "") ? "w" : "";
        return '<div class="po-cr"><div class="n"><i style="background:' + COL[i % COL.length] + '"></i>' + e(x.name) + ' <small>' + x.pct + '%</small>' + (sgc ? ' <span class="po-sg ' + sgc + '">' + e(x.sig.split(" — ")[0]) + '</span>' : '') + '<em>' + us + '</em>' + (sgc ? '<em class="sgt">' + e((x.sig.split(" — ")[1] || "")) + '</em>' : '') + pvs(x.pick_vs) + '</div>' +
          '<div class="bar"><span class="' + (x.contrib >= 0 ? "p" : "m") + '" style="width:' + w.toFixed(1) + '%"></span></div><b class="' + cls(x.contrib) + '">' + sg(x.contrib) + 'p<small class="po-cw">' + (x.contrib >= 0 ? "+" : "−") + won(Math.abs(S.amt * x.contrib / 100)) + '원</small></b></div>'; }).join("") + '</section>';

    // ⑤ 날짜별
    var CNm = {}; if (CN && CN.dates) CN.dates.forEach(function(d, i){ CNm[d] = i; });
    h += '<div class="sec">📅 날짜별 성적</div><section class="card"><table class="po-dt"><tr><th>날짜(미국)</th><th>💼 기본</th>' + (K ? '<th>⚡ 킥</th>' : '') + (CN ? '<th>🎯 집중</th>' : '') + '<th>🙋 내</th><th>S&P500</th></tr>' +
      P.daily.slice().reverse().slice(0, 15).map(function(d){
        var j = K ? K.dates.indexOf(d.d) : -1, kr = j > 0 ? ((1 + K.kick[j] / 100) / (1 + K.kick[j - 1] / 100) - 1) * 100 : null;
        var tag = function(x){ return x == null ? '' : (x >= d.spy ? ' <em class="w">이김</em>' : ' <em class="l">짐</em>'); };
        var mi = P.dates.indexOf(d.d), ml = PF.filter(function(f){ return f.k === "mine"; })[0].line, mr = mi > 0 ? ((1 + ml[mi] / 100) / (1 + ml[mi - 1] / 100) - 1) * 100 : null;
        var ci = CNm[d.d], cr = ci > 0 ? ((1 + CN.nav[ci] / 100) / (1 + CN.nav[ci - 1] / 100) - 1) * 100 : (ci === 0 ? CN.nav[0] : null);
        return '<tr><td>' + md(d.d) + '</td><td class="' + cls(d.r) + '">' + sg(d.r) + tag(d.r) + '</td>' + (K ? '<td class="' + cls(kr) + '">' + sg(kr) + tag(kr) + '</td>' : '') + (CN ? '<td class="' + cls(cr) + '">' + sg(cr) + tag(cr) + '</td>' : '') + '<td class="' + cls(mr) + '">' + sg(mr) + tag(mr) + '</td><td class="' + cls(d.spy) + '">' + sg(d.spy) + '</td></tr>'; }).join("") + '</table></section>' +
      '<p class="note">' + e(P.note) + ' 계산 ' + e(P.at) + (P.miss && P.miss.length ? ' · 시세 없음: ' + e(P.miss.join(", ")) : '') + '</p>';
    b.innerHTML = h;
    rows();
    var inp = document.getElementById("poamt");
    inp.oninput = function(){ var v = +inp.value.replace(/[^\d]/g, "") || 0; S.amt = v; keep(); rows(); };
    inp.onblur = function(){ inp.value = S.amt.toLocaleString("ko-KR"); };
    [].forEach.call(b.querySelectorAll(".po-q button"), function(x){ x.onclick = function(){ S.amt = +x.dataset.v; inp.value = S.amt.toLocaleString("ko-KR"); keep(); rows(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(x){ x.onclick = function(){ S.mode = x.dataset.m; keep();
      [].forEach.call(b.querySelectorAll(".po-mode button[data-m]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ if (x.dataset.sumo) S.sumOpen = S.sumOpen === x.dataset.pf ? "" : x.dataset.pf; S.pf = x.dataset.pf; keep(); pfJump(x); }; });
    [].forEach.call(b.querySelectorAll("[data-hbx]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var k = S.sumOpen; S.sumOpen = ""; keep(); var r = document.querySelector('#posum .po-sr[data-pf="' + k + '"]'); if (r) pfJump(r); else draw(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(x){ x.onclick = function(){ S.pf = x.dataset.p; keep();
      [].forEach.call(b.querySelectorAll("[data-pf]"), function(x){ x.onclick = function(){ if (x.dataset.sumo) S.sumOpen = S.sumOpen === x.dataset.pf ? "" : x.dataset.pf; S.pf = x.dataset.pf; keep(); pfJump(x); }; });
    [].forEach.call(b.querySelectorAll("[data-hbx]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var k = S.sumOpen; S.sumOpen = ""; keep(); var r = document.querySelector('#posum .po-sr[data-pf="' + k + '"]'); if (r) pfJump(r); else draw(); }; });
    [].forEach.call(b.querySelectorAll(".po-mode button[data-p]"), function(y){ y.classList.toggle("on", y === x); }); rows(); }; });
    document.getElementById("pocopy").onclick = copy;
    myBind(b);
    if (window.portDesign) try { portDesign(document.getElementById("podz"), {spx: +MW.spx || 0, ndx: +MW.ndx || 0, gold: +MW.gold || 0}); } catch(x) {}   // 🎛 A10/21-1
    var inf = b.querySelector(".po-inf"); if (inf) inf.addEventListener("toggle", function(){ S.inf = inf.open ? 1 : 0; keep(); });
    var hvt = document.getElementById("pohvt"); if (hvt) hvt.onclick = function(){ S.hv = S.hv ? 0 : 1; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); };   // A11-4
    var brt = document.getElementById("pobrt"); if (brt) brt.onclick = function(){ BEARON = !BEARON; var y = window.scrollY; draw(); window.scrollTo(0, y); };   // 🐻 A11/9-2
    if (window.foldify) foldify(b);
    // ⑩ 위에 붙는 미니 성적 띠 (접기 바로가기 칩과 한 덩어리) — 요약 카드가 안 보일 때만
    var fj = b.querySelector(".fold-jump");
    if (fj){ var st = document.createElement("div"); st.className = "po-stk"; fj.parentNode.insertBefore(st, fj);
      var mini = document.createElement("button"); mini.className = "po-mini"; mini.type = "button";
      mini.innerHTML = PF.map(function(f){ return '<span>' + f.ic + '<b class="' + cls(f.ret) + '">' + sg(f.ret) + '</b></span>'; }).join("") + '<span class="sp">S&P <b class="' + cls(spN) + '">' + sg(spN) + '</b></span><i>▲</i>';
      mini.onclick = function(){ var t = document.getElementById("posum"); if (t){ var y = t.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 8; window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); } };
      st.appendChild(mini); st.appendChild(fj);
      var sm = document.getElementById("posum"), upd = function(){ if (!st.isConnected) return window.removeEventListener("scroll", upd);
        var r = sm ? sm.getBoundingClientRect() : null; st.classList.toggle("mini-on", !!r && r.bottom < ((document.querySelector("header") || {}).offsetHeight || 0) + 10); };
      window.addEventListener("scroll", upd, {passive: true}); upd(); }
    [].forEach.call(b.querySelectorAll("[data-pshare]"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); if (!window.chShare) return;
      chShare("CH Investing", "💼 CH Investing 포트 (" + md(P.start) + "부터)\n" + PF.map(function(f){ return f.ic + " " + f.t + " " + sg(f.ret) + " (S&P보다 " + sg(f.ret - spN).replace("%", "%p") + ")"; }).join("\n") + "\n🇺🇸 S&P500 " + sg(spN) + "\n\n※ 투자 참고용 · 매수 추천 아님", "port"); }; });
    // ③ 비교표 전체/내 자리
    [].forEach.call(b.querySelectorAll("[data-lball]"), function(x){ x.onclick = function(){ S.lbAll = !S.lbAll; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    // ④ 막대·범례를 누르면 그 칸 줄로
    [].forEach.call(b.querySelectorAll(".po-sb [data-ix], .po-sbl [data-ix]"), function(x){ x.onclick = function(){
      var r = b.querySelector('#porows .po-r[data-ix="' + x.dataset.ix + '"]') || b.querySelectorAll("#porows .po-r")[+x.dataset.ix]; if (!r) return;
      var y = r.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3; window.scrollTo({top: Math.max(0, y), behavior: "smooth"});
      r.classList.remove("flash"); void r.offsetWidth; r.classList.add("flash"); }; });
    // ⑧ 타임라인: 누르면 그날 이유 펼침
    [].forEach.call(b.querySelectorAll(".po-tli"), function(x){ x.onclick = function(){ x.classList.toggle("open"); }; });
    // ⑨ 섹터 의견 칩: 누르면 담는 상품
    [].forEach.call(b.querySelectorAll(".po-vc"), function(x){ x.onclick = function(){
      var d = document.getElementById("povd"), on = !x.classList.contains("on");
      [].forEach.call(b.querySelectorAll(".po-vc"), function(y){ y.classList.remove("on"); });
      if (!on || !d){ if (d) d.innerHTML = ""; return; } x.classList.add("on");
      var r = P.views.rows[+x.dataset.vi] || {};
      d.innerHTML = '<b>' + e(r.name) + '</b> · ' + r.pct + '%' + (r.ret != null ? ' · ' + sg(r.ret) : ' · 채점 대기') + (r.t && r.t.length ? '<br>담는 상품: ' + r.t.map(function(t){ return '<span class="po-tk" data-op="' + e(t) + '">' + e(t) + '</span>'; }).join(" · ") : ''); }; });
    [].forEach.call(b.querySelectorAll("[data-bn]"), function(x){ x.onclick = function(){ var n = x.dataset.bn, i = S.bsel.indexOf(n);
      if (i >= 0){ if (S.bsel.length > 1) S.bsel.splice(i, 1); } else { S.bsel.push(n); if (S.bsel.length > 5) S.bsel.shift(); }
      keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll("[data-bg]"), function(x){ x.onclick = function(){ S.bg = x.dataset.bg; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll("[data-win]"), function(x){ x.onclick = function(){ S.from = x.dataset.win === P0.start ? null : x.dataset.win; var y = window.scrollY; draw(); window.scrollTo(0, y); }; });
    var wi = document.getElementById("powin"); if (wi) wi.onchange = function(){ var v = wi.value; if (!v) return; S.from = v <= P0.start ? null : v; var y = window.scrollY; draw(); window.scrollTo(0, y); };
    [].forEach.call(b.querySelectorAll("[data-cm]"), function(x){ x.onclick = function(){ S.cmine = +x.dataset.cm; keep(); var y = window.scrollY; draw(); window.scrollTo(0, y); }; });   // A11-2
    var sr = document.getElementById("poscrr");   // 10/15 A11-3: 미는 동안은 숫자만, 손 떼면 그래프·등수까지 다시 그림
    if (sr){ sr.oninput = function(){ scrubLive(+sr.value); };
      sr.onchange = function(){ var bi = +sr.value; S.from = bi ? P0.dates[bi + 1] : null; var top = sr.getBoundingClientRect().top; draw();
        var n = document.getElementById("poscrr"); if (n) window.scrollTo({top: window.scrollY + n.getBoundingClientRect().top - top, behavior: "instant"}); }; }
  }

  // 10/15 A11-4: 🙋 내 선택 효과 — 내 포트 − 기본 포트 (같은 구간·같은 날짜 줄)
  function fxTag(v){ var z = Math.abs(v) < 0.005; return '<b class="' + (z ? "" : v > 0 ? "w" : "l") + '">' + (z ? "0.00%p" : sg(v).replace("%", "%p")) + '</b>'; }
  function myDiff(MW){
    var H = P0.hold || [], pk = function(re){ var x = H.filter(function(h){ return re.test(h.name); })[0]; return x ? +x.pct || 0 : 0; };
    var bw = {spx: pk(/S&P/), ndx: pk(/나스닥/), gold: pk(/^금/), cash: pk(/현금/)}, out = [];
    [["S&P", "spx"], ["나스닥", "ndx"], ["금", "gold"], ["현금", "cash"]].forEach(function(q){ var a = bw[q[1]], c = +MW[q[1]] || 0; if (Math.abs(a - c) >= 0.5) out.push(q[0] + " " + r1(a) + "→" + r1(c) + "%"); });
    if (MW.st.length) out.push("⚡ 종목 " + MW.st.length + "개");
    return out;
  }
  function fxBars(FM, FB){
    var rows = [], mx = 0.05;
    for (var i = 1; i < P.dates.length; i++){ var a = FM.line[i], a0 = FM.line[i - 1], c = FB.line[i], c0 = FB.line[i - 1]; if (a == null || c == null) continue;
      var d = ((1 + a / 100) / (1 + (a0 || 0) / 100) - (1 + c / 100) / (1 + (c0 || 0) / 100)) * 100; rows.push([P.dates[i], d]); mx = Math.max(mx, Math.abs(d)); }
    if (!rows.length) return '<p class="note">아직 날짜가 부족해요.</p>';
    return rows.reverse().map(function(r){ var w = Math.abs(r[1]) / mx * 50, z = Math.abs(r[1]) < 0.005;
      return '<div class="po-fxr"><span>' + md(r[0]) + '</span><div class="po-fxbar"><i class="' + (r[1] >= 0 ? "g" : "n") + '" style="width:' + w.toFixed(1) + '%"></i></div><b class="' + (z ? "" : r[1] > 0 ? "w" : "l") + '">' + (r[1] > 0 ? "+" : "") + r[1].toFixed(2) + '%p</b></div>'; }).join("") +
      '<p class="note">초록 오른쪽 = 그날 내 선택이 기본보다 더 벌었음 · 파랑 왼쪽 = 덜 벌었음</p>';
  }
  // 10/15 A11-3: 👆 시작일 문지르기 — 미는 동안 「그날부터 샀다면」 숫자만 그 자리에서 다시 셈(그래프·등수는 손 뗄 때)
  var PFR = null;
  function relAt(arr, bi){ if (!arr) return null; var a = arr[bi], z = arr[arr.length - 1]; if (z == null) return null; a = a == null ? 0 : a; return ((1 + z / 100) / (1 + a / 100) - 1) * 100; }
  function scrubVals(bi){ return {sp: relAt(P0.bench["S&P500"], bi), pf: (PFR || []).map(function(f){ return {f: f, r: relAt(f.line0, bi)}; })}; }
  function scrubOut(bi){
    var X = scrubVals(bi), d = P0.dates[bi + 1], sel = X.pf.filter(function(x){ return x.f.k === S.pf; })[0] || X.pf[0];
    var gap = !sel || sel.r == null || X.sp == null ? null : sel.r - X.sp;
    return '<div class="po-scd"><b>' + md(d) + '부터</b> 샀다면' + (gap == null ? '' : ' <em class="' + (gap >= 0 ? "w" : "l") + '">' + sel.f.ic + ' S&P보다 ' + (gap >= 0 ? "앞섬 " : "뒤짐 ") + sg(gap).replace("%", "%p") + '</em>') + '</div>' +
      '<div class="po-scv">' + X.pf.map(function(x){ return '<span class="' + (x.f.k === S.pf ? "on" : "") + '">' + x.f.ic + ' <b class="' + cls(x.r) + '">' + sg(x.r) + '</b></span>'; }).join("") +
      '<span class="sp">S&P <b class="' + cls(X.sp) + '">' + sg(X.sp) + '</b></span></div>';
  }
  function scrubLive(bi){
    var o = document.getElementById("poscro"); if (o) o.innerHTML = scrubOut(bi);
    var X = scrubVals(bi), sh = document.getElementById("posumh"); if (sh) sh.textContent = md(P0.dates[bi + 1]) + "부터 성적";
    var R = {}; X.pf.forEach(function(x){ R[x.f.k] = x.r;
      var row = document.querySelector('#posum .po-sr[data-pf="' + x.f.k + '"]'); if (!row || x.r == null) return;
      var bb = row.querySelector("b"), ee = row.querySelector("em"); if (bb){ bb.className = cls(x.r); bb.textContent = sg(x.r); }
      if (ee && X.sp != null){ var g = x.r - X.sp; ee.className = g >= 0 ? "w" : "l"; ee.textContent = (g >= 0 ? "앞섬 " : "뒤짐 ") + sg(g).replace("%", "%p"); } });
    var spb = document.querySelector("#posum .po-sr.sp b"); if (spb && X.sp != null){ spb.className = cls(X.sp); spb.textContent = sg(X.sp); }
    var fx = document.querySelector("#pomyfx b"); if (fx && R.mine != null && R.base != null){ var t = document.createElement("span"); t.innerHTML = fxTag(R.mine - R.base); fx.replaceWith(t.firstChild); }
    var gp = document.querySelector("#pobody .po-hero .po-gap"); if (gp && R[S.pf] != null && X.sp != null){ var g2 = R[S.pf] - X.sp;
      gp.className = "po-gap " + (g2 >= 0 ? "w" : "l"); var gb = gp.querySelector("b"), ge = gp.querySelector("em"); if (gb) gb.textContent = sg(g2).replace("%", "%p"); if (ge) ge.textContent = g2 >= 0 ? "앞서는 중 👍" : "뒤지는 중"; }
  }
  // ② 그래프 표시: 비중·상품 바뀐 날(노랑) · 킥 사기(초록)·팔기(빨강) — 「그때 그 판단이 맞았나」를 눈으로
  function marks(F){
    var out = [], idx = function(d){ var i = P.dates.indexOf(d); if (i < 0) for (var j = 0; j < P.dates.length; j++) if (P.dates[j] >= d){ i = j; break; } return i; };
    (P.changes || []).forEach(function(c){ var i = idx(c.date); if (i > 0) out.push({i: i, color: "#ffb84d", t: "🔁 " + md(c.date) + " 비중·상품 바뀜"}); });
    if (F.k === "kick" && K) (K.events || []).forEach(function(ev){ if (ev.k !== "사기" && ev.k !== "팔기") return; if (ev.d < P.dates[0]) return; var i = idx(ev.d); if (i >= 0) out.push({i: i, color: ev.k === "사기" ? "#4dd47a" : "#ff6b6b", t: (ev.k === "사기" ? "🟢 사기 " : "🔴 팔기 ") + nm(ev.name) + (ev.r != null ? " " + sg(ev.r, 1) : "")}); });
    return out;
  }
  // 포트 고르기(기본·킥·집중): 다시 그린 뒤 「누른 버튼」이 화면 같은 자리에 오도록 (위 칸 높이가 바뀌어도 안 튐 · 10/12)
  function pfJump(x){
    var grp = x.closest(".po-sum") ? ".po-sum" : x.closest(".po-pf") ? ".po-pf" : x.closest(".po-pf2") ? ".po-pf2" : x.closest(".po-lbs") ? ".po-lbs" : x.closest(".po-rkb") ? ".po-rkb" : x.closest(".po-rk") ? ".po-rk" : null;
    var top = x.getBoundingClientRect().top, y0 = window.scrollY;
    var fold = {}; [].forEach.call(document.querySelectorAll("#pobody .fold"), function(f){ fold[f.id] = f.classList.contains("open"); });
    draw();
    var n = grp && document.querySelector("#pobody " + grp + ' [data-pf="' + S.pf + '"]');
    if (n){ var f = n.closest(".fold"); if (f && fold[f.id] && !f.classList.contains("open")) f.classList.add("open");
      // 다시 그린 뒤 1초 동안은 긴 글 접기·그림이 자리를 바꿔도 누른 버튼을 같은 자리에 붙잡아 둠 (손으로 스크롤하면 멈춤)
      var t0 = Date.now(), stop = false, quit = function(){ stop = true; };
      window.addEventListener("touchstart", quit, {once: true, passive: true}); window.addEventListener("wheel", quit, {once: true, passive: true});
      // 10/21: 붙잡는 1.2초 안에 다른 것(ⓘ 등)을 누르면 멈춤 — 안 멈추면 그 위에 설명 칸이 열릴 때 화면이 끌려가 누른 ⓘ 가 화면 밖으로 튐(화면 점검 port ⓘ 313→−14px)
      setTimeout(function(){ window.addEventListener("click", quit, {once: true, capture: true}); window.addEventListener("pointerdown", quit, {once: true, passive: true}); }, 0);
      (function hold(){ if (stop || !n.isConnected) return; var d = n.getBoundingClientRect().top - top; if (Math.abs(d) > 1) window.scrollTo({top: window.scrollY + d, behavior: "instant"});
        if (Date.now() - t0 < 1200) requestAnimationFrame(hold); })(); }
    else window.scrollTo(0, y0);
  }
  // 칸마다 무엇을 얼마나
  function wRows(){ return (K && K.whale && K.whale.rows || []).filter(function(r){ return r.on; }); }
  function kHold(){ return K && K.hold ? K.hold : (K ? K.open.map(function(o){ return {code: o.code, name: o.name, tags: "", w: o.w, r: o.r, now: o.now, rule: "손절 " + pr(o.stop)}; }) : []); }
  function kickW(){ return (K && S.pf === "kick") ? kHold().reduce(function(a, o){ return a + (o.w || 0); }, 0) : 0; }
  // 🎯 집중 포트 따라하기 (10/12) — conc.json now(지금 담을 것) · 가격은 기본 포트 칸에서 같은 티커를 찾아 씀
  function concPlan(){
    // 10/12 사용자: 집중 = S&P·나스닥 뼈대 + ⚡ 킥 종목 같이. 킥 칸 비중만큼 뼈대를 줄이고, 킥 줄은 킥 포함과 같은 모양
    var px = {}; P.hold.forEach(function(h){ (h.us || []).forEach(function(u){ px[u.t] = u; }); (h.kr || []).forEach(function(k){ px[k.code] = k; }); });
    var KH = K ? kHold() : [], kw = KH.reduce(function(a, o){ return a + (o.w || 0); }, 0), share = (100 - kw) / 100;
    var out = CN.now.map(function(n, i){
      var pct = Math.round(n.pct * share * 10) / 10, amt = S.amt * pct / 100, items = [], kr = n.kr && px[n.kr.code];
      if (n.items){ n.items.forEach(function(u){ var a3 = amt * (u.w || 0), usd3 = P.fx ? a3 / P.fx : null;    // 🧭 10/28 Q10/28-1: 현금 몫 → 자산 추세 칸(칸 안 비중대로)
        items.push({nm: (u.name ? u.name + " " : "") + u.t, code: u.t, amt: a3, usd: usd3, sh: usd3 && u.px ? Math.floor(usd3 / u.px) : null, px: u.px, cur: "$"}); }); }
      else if (S.mode === "kr" && n.kr){ var kp = kr && kr.px; items.push({nm: n.kr.name, code: n.kr.code, amt: amt, sh: kp ? Math.floor(amt / kp) : null, px: kp, cur: "원"}); }
      else { var u = px[n.t] || {}, usd = P.fx ? amt / P.fx : null; items.push({nm: n.t, code: n.t, amt: amt, usd: usd, sh: usd && u.px ? Math.floor(usd / u.px) : null, px: u.px, cur: "$"}); }
      return {x: {name: n.name, pct: pct}, i: i, amt: amt, items: items};
    });
    if (kw) out.push({x: {name: "⚡ 킥", pct: Math.round(kw * 10) / 10}, i: -1, amt: S.amt * kw / 100, kick: 1, items: KH.map(function(o){
      var a2 = S.amt * o.w / 100, kr2 = /^\d{6}\.K[SQ]$/.test(o.code), us2 = /^[A-Z\-]+$/.test(o.code), usd2 = us2 && P.fx ? a2 / P.fx : null;
      return {tags: o.tags || "", short: nm(o.name), nm: (o.tags ? o.tags + " " : "") + nm(o.name), code: o.code, amt: a2, usd: usd2, cur: us2 ? "$" : kr2 ? "원" : "현지",
              sh: us2 ? (usd2 && o.now ? Math.floor(usd2 / o.now) : null) : kr2 ? Math.floor(a2 / o.now) : null, note: o.rule || ""}; })});
    return out;
  }
  // 11/05 사용자 「각 포트 누르면 뭐를 담고 있는지 보여줘」 — 성적 줄을 누르면 그 포트가 지금 담은 칸·상품·종목을 바로 아래에 펼침(다시 누르거나 「닫기」로 접음)
  function holdBox(f){
    var sv = S.pf, pl = [];
    try { S.pf = f.k; pl = plan() || []; } catch(x) { console.warn("holdBox", x); } finally { S.pf = sv; }
    pl = pl.filter(function(p){ return p.x && p.x.pct > 0; });
    if (!pl.length) return '<div class="po-hb"><div class="po-hbn">담은 것을 아직 못 불러왔어요</div></div>';
    var col = function(p){ return p.kick ? "#ff6b6b" : p.prod ? "#38bdf8" : COL[p.i % COL.length]; };
    var tk = function(it){ var c = String(it.code || ""), us = /^[A-Z][A-Z.\-]{0,6}$/.test(c), n = String(it.short || it.nm || c).replace(c, "").replace(/\s*(Incorporated|Corporation|Holdings?|Company|Group|Class [A-C]|Common Stock)\b.*$/i, "").replace(/[\s\-–,·]+$/, "").trim() || c;
      if (n.length > 16) n = n.slice(0, 15) + "…";   // 미국 종목은 이름 밑에 티커
      return '<span class="po-hbi"' + (c ? ' data-op="' + e(c) + '"' : '') + '>' + (it.tags && n.indexOf(it.tags) < 0 ? e(it.tags) + ' ' : '') + e(n) + (us && n !== c ? '<small>' + e(c) + '</small>' : '') + '</span>'; };
    return '<div class="po-hb" data-hb="' + f.k + '"><div class="po-hbh">' + f.ic + ' <b>' + f.t + '</b>가 지금 담은 것 <small>' + (S.mode === "kr" ? "₩ 원화 상품" : "💵 외화 상품") + ' 기준</small></div>' +
      '<div class="po-hbbar">' + pl.map(function(p){ return '<i style="flex:' + p.x.pct + ';background:' + col(p) + '"></i>'; }).join("") + '</div>' +
      pl.map(function(p){ return '<div class="po-hbr"><div class="po-hbc"><i style="background:' + col(p) + '"></i><b>' + e(p.x.name) + '</b><span>' + p.x.pct + '%</span></div>' +
        '<div class="po-hbl">' + (p.items.length ? p.items.map(tk).join("") : '<span class="po-hbe">' + (p.kick ? '지금 빈 자리(현금)' : '현금·단기채') + '</span>') + '</div></div>'; }).join("") +
      '<button type="button" class="po-hbx" data-hbx="1">닫기 ▴</button></div>';
  }
  function plan(){
    if (S.pf === "conc" && CN && CN.now) return concPlan();
    if (S.pf === "mine") return myPlan();
    var kw = kickW(), out;
    // 🧪 10/12부터 킥 포트: 기본 칸은 규칙 비중(국면 현금) × (1 − 돌파 − 고래), 킥에서 안 쓴 자리는 현금
    var RB = (kw && K.rule && K.rule.base_now) ? K.rule.base_now : null;
    var share = RB ? 1 - ((K.rules || {}).sleeve || 0) - ((K.rules || {}).whale_sleeve || 0) : 1;
    var spare = RB ? Math.max(0, (1 - share) * 100 - kw) : 0;
    out = P.hold.map(function(x, i){
      // 🅿️ 10/19 Q10/19-1: 킥 빈 자리(spare)는 현금 대신 💼 기본 칸 비중 그대로 나눠 담음 (kick.json park.on)
      var rb0 = RB ? (RB[x.name] != null ? RB[x.name] : x.trend ? 0 : x.pct) : 0, PK = K && K.park && K.park.on;   // 🧭 10/28: 추세 주차 칸은 💼 에만(킥 기본 칸은 규칙 비중 그대로)
      var pct = RB ? rb0 * share + (PK ? rb0 / 100 * spare : (/현금/.test(x.name) ? spare : 0)) : x.pct - (kw && /현금/.test(x.name) ? kw : 0);
      x = Object.assign({}, x, {pct: Math.round(pct * 10) / 10});
      var amt = S.amt * x.pct / 100, items = [];
      var kr = (x.kr || []).filter(function(k){ return k.etf; });
      if (S.mode === "kr" && kr.length){
        var k = kr[0];
        items.push({nm: k.name, code: k.code, amt: amt, sh: k.px ? Math.floor(amt / k.px) : null, px: k.px, cur: "원"});
      } else {
        var us = x.us.filter(function(u){ return u.px; }), each = us.length ? amt / us.length : 0;
        us.forEach(function(u){
          if (u.w != null) each = amt * u.w;      // 🧭 자산 추세 칸: 칸 안 비중대로
          if (u.cur && u.cur !== "달러"){      // 🌏 미국 밖 종목: 원화 환산가(krw)로 주 수
            items.push({nm: u.name || u.t, code: u.t, amt: each, sh: u.krw ? Math.floor(each / u.krw) : null, px: u.px, cur: "원", fx: u.cur, r1: u.r1}); return; }
          var usd = P.fx ? each / P.fx : null;
          items.push({nm: u.name || u.t, code: u.t, amt: each, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$", r1: u.r1}); });
      }
      return {x: x, i: i, amt: amt, items: items};
    });
    if (kw) out.push({x: {name: "⚡ 킥", pct: Math.round(kw * 10) / 10}, i: -1, amt: S.amt * kw / 100, kick: 1, items: kHold().map(function(o){
      var a = S.amt * o.w / 100, kr = /^\d{6}\.K[SQ]$/.test(o.code), us = /^[A-Z\-]+$/.test(o.code);
      var usd = us && P.fx ? a / P.fx : null;
      return {tags: o.tags || "", short: nm(o.name), nm: (o.tags ? o.tags + " " : "") + nm(o.name), code: o.code, amt: a, usd: usd, cur: us ? "$" : kr ? "원" : "현지", sh: us ? (usd && o.now ? Math.floor(usd / o.now) : null) : kr ? Math.floor(a / o.now) : null,
              note: o.rule || ""}; })});
    return out;
  }

  // ---- 🙋 내 포트 (10/14 사용자: 「기본 포트에서 킥 종목 중 v자 체크해서 채우기 · S&P·나스닥 비중도 내가 정하기 · 수익률 비교는 다 똑같이」 — 킥 종목을 현실적으로 다 사진 않으니까)
  //      10/14 2차: 「종목 직접 추가 · 종목마다 가중치 일괄/개별 · 내 포트 저장·편집」
  function r1(v){ return Math.round(v * 10) / 10; }
  function myCfg(){ var m = S.my, c = {spx: m.spx, ndx: m.ndx, gold: m.gold, per: m.per, wm: m.wm, w: m.w, pick: m.pick, own: m.own}; if (m.prod && m.prod.length) c.prod = m.prod; return JSON.parse(JSON.stringify(c)); }
  function mySlot(){ return (S.mySaved || []).filter(function(x){ return x.nm === S.my.nm; })[0]; }
  function myDirty(){ var sl = mySlot(); return !!S.my.nm && (!sl || JSON.stringify(sl.cfg) !== JSON.stringify(myCfg())); }
  function wOf(code){ var m = S.my; return m.wm === "each" && m.w[code] != null ? +m.w[code] : (+m.per || 0); }
  function myStocks(){   // ⚡ 킥에서 체크한 것 + ✍️ 직접 넣은 것
    var out = [], seen = {};
    if (K) kHold().forEach(function(h){ if (!S.my.pick[h.code]) return; seen[h.code] = 1;
      out.push({code: h.code, name: nm(h.name), tags: h.tags || "", kind: "kick", d0: h.d0, entry: h.entry, kline: h.line, r: h.r, now: h.now, rule: h.rule}); });
    (S.my.own || []).forEach(function(o){ if (seen[o.code]) return; seen[o.code] = 1; out.push({code: o.code, name: o.name || o.code, tags: "✍️", kind: "own", d0: o.d0 || P.start, mkt: o.mkt}); });
    return out;
  }
  function myW(){   // 합이 100% 넘으면 비율대로 줄임 · 남는 건 현금·단기채
    var m = S.my, st = myStocks(); st.forEach(function(x){ x.w0 = wOf(x.code); });
    var pr = (m.prod || []).map(function(p){ return Object.assign({}, p, {w0: +p.w || 0}); });
    var tot = (+m.spx || 0) + (+m.ndx || 0) + (+m.gold || 0) + st.reduce(function(a, x){ return a + x.w0; }, 0) + pr.reduce(function(a, x){ return a + x.w0; }, 0), sc = tot > 100 ? 100 / tot : 1;
    st.forEach(function(x){ x.w = x.w0 * sc; }); pr.forEach(function(x){ x.w = x.w0 * sc; });
    return {spx: (+m.spx || 0) * sc, ndx: (+m.ndx || 0) * sc, gold: (+m.gold || 0) * sc, st: st, pr: pr, tot: tot, sc: sc, cash: Math.max(0, 100 - tot)};
  }
  function onP(arr, kd){   // kick.json 날짜 줄 → 포트 날짜 줄 (null 은 그대로 = 아직 안 산 날)
    if (!arr || !kd) return null; var m = {}; kd.forEach(function(d, i){ m[d] = arr[i]; });
    var last = null, seen = false; return P.dates.map(function(d){ if (d in m){ last = m[d]; seen = true; } return seen ? last : null; });
  }
  // 직접 넣은 종목 시세: opdata q/(최근 60일 일봉) → 없으면 p/(주간 종가 + 마지막 종가)로 대략
  var OPDU = "https://raw.githubusercontent.com/chkchp0702-spec/daily-app/opdata/", SHD = {p: {}, q: {}}, SHP = {};
  function fnv(str){ var h = 0x811c9dc5, b = new TextEncoder().encode(str); for (var i = 0; i < b.length; i++){ h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function shd(sym){ var x = (fnv(sym) % 256).toString(16); return x.length < 2 ? "0" + x : x; }
  function shGet(dir, sh){ var k = dir + sh; if (!SHP[k]) SHP[k] = fetch(OPDU + dir + "/" + sh + ".json").then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; }).then(function(j){ SHD[dir][sh] = j; return j; }); return SHP[k]; }
  var myWait = 0;
  function myLoad(st){   // 아직 안 받은 묶음만 받고, 다 받으면 한 번 다시 그림
    var need = []; st.forEach(function(x){ if (x.kind === "kick" && x.kline) return; var sh = shd(x.code); if (!SHD.p[sh]) need.push(shGet("p", sh), shGet("q", sh)); });
    if (!need.length || myWait) return; myWait = 1;
    Promise.all(need).then(function(){ myWait = 0; if (document.getElementById("pobody") && P){ var y = window.scrollY; draw(); window.scrollTo(0, y); } });
  }
  function iso(d){ return d.toISOString().slice(0, 10); }
  function pxSer(code){
    var sh = shd(code), q = (SHD.q[sh] || {})[code], p = (SHD.p[sh] || {})[code], pts = [];
    if (!q && !p) return null;
    if (p && p[6] && p[6].length){ var fri = new Date(p[0] + "T00:00:00Z"); fri.setUTCDate(fri.getUTCDate() + (5 - fri.getUTCDay() + 7) % 7);
      p[6].forEach(function(v, k){ var d = new Date(fri); d.setUTCDate(d.getUTCDate() - 7 * (p[6].length - 1 - k)); var ds = iso(d); pts.push([ds > p[0] ? p[0] : ds, v]); }); }
    if (q){ pts = pts.filter(function(x){ return x[0] < q[0]; }); var d0 = new Date(q[0] + "T00:00:00Z");
      q[1].forEach(function(o, i){ var d = new Date(d0); d.setUTCDate(d.getUTCDate() + o); pts.push([iso(d), q[2][i]]); }); }
    if (p && (!pts.length || pts[pts.length - 1][0] < p[0])) pts.push([p[0], p[1]]);
    return {pts: pts, daily: !!q, last: pts.length ? pts[pts.length - 1] : null};
  }
  function pxOn(ser, d){ var v = null; for (var i = 0; i < ser.pts.length && ser.pts[i][0] <= d; i++) v = ser.pts[i][1]; return v; }
  function stLine(x){
    if (x.kind === "kick" && x.kline && K) return onP(x.kline, K.dates);
    var ser = pxSer(x.code); if (!ser) return null; x.daily = ser.daily;
    var d0 = x.d0 || P.start, en = (x.kind === "kick" && x.entry) ? x.entry : (pxOn(ser, d0) || (ser.pts[0] && ser.pts[0][1]));
    if (!en) return null;
    if (ser.last){ x.now = ser.last[1]; x.r = Math.round((ser.last[1] / en - 1) * 1000) / 10; }
    return P.dates.map(function(d){ if (d < d0) return null; var c = pxOn(ser, d); return c == null ? null : Math.round((c / en - 1) * 10000) / 100; });
  }
  /* 🛍️ 상품 칸 (10/16 사용자 「포트에 주식 부분에 상품 부분을 더한 포트 · 비교 방식, 넣는 방식은 같게」)
     채권·ELS: 연 수익률(y)을 날마다 고르게 쌓음(중간 가격 변동·환율 빼고) · 펀드: 기준일에서 1일·1주·1·3·6개월·1년 전 수익률을 이어 붙인 길(그 사이는 고르게) */
  function dnum(d){ return Date.parse(d + "T00:00:00Z") / 864e5; }
  function prodLine(p){
    var d0 = p.d0 || P.start, t0 = dnum(d0);
    if (p.per){
      var a = dnum(p.asof), pts = [[a, 0]], L = [["d1", 1], ["w1", 7], ["m1", 30.4], ["m3", 91.3], ["m6", 182.6], ["y1", 365.25]];
      L.forEach(function(q){ var v = p.per[q[0]]; if (v != null && v > -99) pts.push([a - q[1], -Math.log(1 + v / 100)]); });
      pts.sort(function(x, y){ return x[0] - y[0]; });
      var lv = function(t){ if (t < pts[0][0]) return null; if (t >= a) return 0; for (var i = 1; i < pts.length; i++) if (t <= pts[i][0]){ var u = pts[i - 1], w = pts[i]; return u[1] + (w[1] - u[1]) * (t - u[0]) / ((w[0] - u[0]) || 1); } return 0; };
      var s0 = lv(Math.max(t0, pts[0][0]));
      return P.dates.map(function(d){ var t = dnum(d); if (t < t0) return null; var v = lv(t); return v == null || s0 == null ? null : Math.round((Math.exp(v - s0) - 1) * 10000) / 100; });
    }
    var y = (+p.y || 0) / 100;
    return P.dates.map(function(d){ var t = dnum(d); return t < t0 ? null : Math.round((Math.pow(1 + y, (t - t0) / 365.25) - 1) * 10000) / 100; });
  }
  function myLine(W){
    var A = (K && K.assets) || {}, kd = K && K.dates, B = P.bench;
    var spx = onP(A.SPY, kd) || B["S&P500"], ndx = onP(A.QQQ, kd) || B["나스닥100"], gld = onP(A.GLD, kd), cash = onP(A.SGOV, kd);
    W.miss = []; W.rough = [];
    if (!gld && W.gold){   // 금 일봉이 아직 kick.json 에 없으면 GLD 를 직접 넣은 종목처럼
      var g = {code: "GLD", kind: "own", d0: P.dates[0]}; gld = stLine(g); if (!gld){ myLoad([g]); W.miss.push("금"); } }
    var parts = [[W.spx, spx], [W.ndx, ndx], [W.gold, gld], [W.cash, cash]];
    myLoad(W.st);
    W.st.forEach(function(x){ var L = stLine(x); if (L){ parts.push([x.w, L]); if (x.kind === "own" && !x.daily) W.rough.push(x.name); } else W.miss.push(x.name); });
    (W.pr || []).forEach(function(x){ var L = prodLine(x), z = L.filter(function(v){ return v != null; }); x.r = z.length ? z[z.length - 1] : null; parts.push([x.w, L]); });
    var v = 1, out = [0];
    for (var j = 1; j < P.dates.length; j++){
      var r = 0;
      parts.forEach(function(q){ var w = q[0], L = q[1]; if (!w || !L) return; var a = L[j - 1], b = L[j]; if (b == null) return;
        r += w / 100 * (a == null ? b / 100 : (1 + b / 100) / (1 + a / 100) - 1); });   // 종목은 산 날 값부터 (그 전엔 그 몫이 현금)
      v *= 1 + r; out.push(Math.round((v - 1) * 10000) / 100);
    }
    return out;
  }
  function myHtml(W){
    var m = S.my, KH = K ? kHold() : [], ed = S.myEdit == null ? !(S.mySaved || []).length : !!S.myEdit;
    var kind = {"돌파": "☕📈 돌파", "고래": "🐋 고래", "추세": "🧭 추세"};
    var stepper = function(k, val, d, cls_){ return '<span class="my-sp ' + (cls_ || "") + '"><button type="button" data-myk="' + k + '" data-d="-' + d + '">−</button><input class="my-in" inputmode="decimal" data-myk="' + k + '" value="' + r1(+val || 0) + '"><b>%</b><button type="button" data-myk="' + k + '" data-d="' + d + '">+</button></span>'; };
    var row = function(k, lab, col){ return '<div class="my-st"><span class="n"><i style="background:' + col + '"></i>' + lab + '</span>' + stepper(k, m[k], 5) + '</div>'; };
    var sw = W.st.reduce(function(a, x){ return a + x.w; }, 0), pw = W.pr.reduce(function(a, x){ return a + x.w; }, 0);
    // 저장한 포트 칩
    var saved = S.mySaved || [];
    var h = '<div class="sec">🙋 내 포트 <small class="mut">휴대폰에만 저장 · 바꾸면 위 성적이 바로 다시 계산돼요</small></div><section class="card my-c">' +
      '<div class="my-sv">' + saved.map(function(x, i){ return '<button type="button" data-myload="' + i + '" class="' + (x.nm === m.nm ? "on" : "") + '">' + e(x.nm) + (x.nm === m.nm && myDirty() ? ' <i>●</i>' : '') + '</button>'; }).join("") +
        '<button type="button" data-mynew="1" class="nw">＋ 새 포트</button></div>' +
      '<div class="my-top"><b>' + e(m.nm || "이름 없는 포트") + '</b>' + (m.nm ? (myDirty() ? ' <small class="dt">● 저장 안 한 변경</small>' : ' <small class="ok">✓ 저장됨</small>') : ' <small class="dt">아직 저장 안 함</small>') +
        '<span class="my-acts"><button type="button" data-mysave="1" class="pri">💾 저장</button>' + (m.nm ? '<button type="button" data-myas="1">다른 이름으로</button><button type="button" data-myren="1">이름 바꾸기</button><button type="button" data-mydel="1">🗑</button>' : '') + '</span></div>' +
      '<div class="my-sb"><i style="flex:' + W.spx + ';background:' + COL[0] + '"></i><i style="flex:' + W.ndx + ';background:' + COL[1] + '"></i><i style="flex:' + W.gold + ';background:' + COL[2] + '"></i><i style="flex:' + sw + ';background:#f472b6"></i><i style="flex:' + pw + ';background:#38bdf8"></i><i style="flex:' + W.cash + ';background:#8a94a8"></i></div>' +
      '<div class="my-lg">S&P ' + r1(W.spx) + '% · 나스닥 ' + r1(W.ndx) + '% · 금 ' + r1(W.gold) + '% · <span style="color:#f472b6">종목 ' + W.st.length + '개 ' + r1(sw) + '%</span> · <span style="color:#38bdf8">상품 ' + W.pr.length + '개 ' + r1(pw) + '%</span> · 현금 ' + r1(W.cash) + '%</div>' +
      (W.sc < 1 ? '<div class="my-warn">합이 ' + r1(W.tot) + '% 라 100%에 맞게 비율대로 줄여서 계산해요</div>' : '');
    // 고른 종목 (편집 안 할 때도 보임)
    h += '<div class="my-h">담은 종목 <small>' + W.st.length + '개</small></div>' + (W.st.length ? '<div class="my-sl">' + W.st.map(function(x){
        return '<div class="my-si' + (ed ? ' ed' : '') + '"><span class="nm"><b>' + e(x.tags) + ' ' + e(x.name) + '</b><small>' + (x.kind === "kick" ? '⚡ 킥 · ' + md(x.d0) + ' 킥이 산 값부터' : '✍️ 직접 · ' + md(x.d0) + '부터 계산' + (x.daily === false ? ' · 주간 시세로 대략' : '')) + '</small></span>' +
          '<b class="r ' + cls(x.r) + '">' + (x.r != null ? sg(x.r, 1) : '…') + '</b>' +
          (ed ? '<span class="my-ctl">' + (m.wm === "each" ? stepper("w:" + x.code, wOf(x.code), 1, "sm") : '<span class="my-wv">' + r1(x.w) + '%</span>') + '<button type="button" class="my-x" data-myrm="' + e(x.code) + '" data-kind="' + x.kind + '" aria-label="빼기">✕ 빼기</button></span>' : '<span class="my-wv">' + r1(x.w) + '%</span>') + '</div>'; }).join("") + '</div>'
      : '<p class="note" style="margin:2px 0 6px">아직 없어요 — ' + (ed ? '아래에서 킥 종목을 ✓ 하거나 직접 넣어요' : '✏️ 편집에서 넣어요') + '</p>');
    h += '<div class="my-h">🛍️ 담은 상품 <small>' + W.pr.length + '개 · 채권·펀드·ELS</small></div>' + (W.pr.length ? '<div class="my-sl">' + W.pr.map(function(x){
        return '<div class="my-si' + (ed ? ' ed' : '') + '"><span class="nm"><b>' + e(PGN[x.g] || "") + ' ' + e(x.name) + '</b><small>' + e(x.sub || "") + ' · ' + md(x.d0) + '부터' + (x.per ? ' · 기간 수익률 이어 붙임' : ' · 연 ' + (+x.y).toFixed(2) + '% 쌓기') + '</small></span>' +
          '<b class="r ' + cls(x.r) + '">' + (x.r != null ? sg(x.r, 1) : '…') + '</b>' +
          (ed ? '<span class="my-ctl">' + stepper("pw:" + x.id, x.w0, 1, "sm") + '<button type="button" class="my-x" data-myprm="' + e(x.id) + '" aria-label="빼기">✕ 빼기</button></span>' : '<span class="my-wv">' + r1(x.w) + '%</span>') + '</div>'; }).join("") + '</div>'
      : '<p class="note" style="margin:2px 0 6px">아직 없어요 — ' + (ed ? '아래 ⑤에서 채권·펀드·ELS를 골라 넣어요' : '✏️ 편집에서 넣어요') + '</p>');
    if (!ed){
      h += '<button type="button" class="my-edit" data-myedit="1">✏️ 편집 (비중·종목 바꾸기)</button>';
    } else {
      h += '<div class="my-h">① 뼈대 비중</div>' + row("spx", "S&P500", COL[0]) + row("ndx", "나스닥100", COL[1]) + row("gold", "금", COL[2]) +
        '<div class="my-h">② 종목 가중치 <span class="my-seg"><button type="button" data-mywm="all" class="' + (m.wm !== "each" ? "on" : "") + '">일괄</button><button type="button" data-mywm="each" class="' + (m.wm === "each" ? "on" : "") + '">개별</button></span></div>' +
        (m.wm !== "each" ? '<div class="my-st"><span class="n">모든 종목 똑같이</span>' + stepper("per", m.per, 1) + '</div>'
          : '<p class="note" style="margin:0 0 4px">위 「담은 종목」 줄마다 비중을 따로 정해요 (처음 값 = 일괄 ' + r1(+m.per || 0) + '%)</p>') +
        '<div class="my-h">③ ✍️ 종목 직접 넣기</div><div class="my-add"><input aria-label="종목 이름·코드" id="myq" type="search" autocomplete="off" placeholder="종목 이름·코드 (예: MSFT, 036930)"><div id="myres" class="my-res"></div>' +
        '<label class="my-d0">계산 시작일 <input id="myd0" type="date" value="' + e(S.myD0 || P.start) + '" min="' + P.dates[0] + '" max="' + P.dates[P.dates.length - 1] + '"><small>산 날을 넣으면 그날 종가부터</small></label></div>' +
        '<div class="my-h">④ ⚡ 킥 종목에서 고르기</div>' +
        (KH.length ? '<div class="my-all"><button type="button" data-myall="1">전부 체크</button><button type="button" data-myall="0">전부 빼기</button><small>' + KH.filter(function(o){ return m.pick[o.code]; }).length + ' / ' + KH.length + ' 체크</small></div>' +
          '<div class="my-ks">' + KH.map(function(o){ var on = !!m.pick[o.code];
            return '<label class="my-k' + (on ? " on" : "") + '"><input type="checkbox" data-pick="' + e(o.code) + '"' + (on ? " checked" : "") + '><span class="ck">' + (on ? "✓" : "") + '</span>' +
              '<span class="nm"><b>' + e(o.tags || "") + ' ' + e(nm(o.name)) + '</b><small>' + e(kind[o.kind] || o.kind || "") + ' · ' + md(o.d0) + ' 산 값부터</small></span>' +
              '<b class="r ' + cls(o.r) + '">' + sg(o.r, 1) + '</b></label>'; }).join("") + '</div>'
          : '<p class="note">지금 킥에 든 종목이 없어요.</p>') +
        '<div class="my-h">⑤ 🛍️ 상품 넣기 <small>상품 탭에 있는 채권·펀드·ELS</small></div><div class="my-add"><div class="my-pk">' + PGK.map(function(g){ return '<button type="button" data-mypg="' + g[0] + '" class="' + ((S.myPg || "ust") === g[0] ? "on" : "") + '">' + g[1] + '</button>'; }).join("") + '</div>' +
          '<input aria-label="상품 이름 검색" id="mypq" type="search" autocomplete="off" placeholder="상품 이름 검색 (비우면 인기·높은 순)"><div id="mypres" class="my-res"><div class="my-hint">상품 목록 불러오는 중…</div></div></div>' +
        '<button type="button" class="my-edit done" data-myedit="0">✓ 편집 끝' + (m.nm && myDirty() ? ' (저장은 💾)' : '') + '</button>';
    }
    h += (W.miss && W.miss.length ? '<div class="my-warn">시세를 불러오는 중이거나 아직 없어 현금처럼 계산: ' + e(W.miss.join(", ")) + '</div>' : '') +
      '<p class="note" style="margin:8px 0 0">계산 방법: 고른 비중을 ' + md(P.start) + '부터 매일 그대로 유지했다면(매일 비중 맞춤 · 비용 빼지 않음 · 종목은 그 나라 통화 기준). 킥 종목은 킥이 산 날·값부터, 직접 넣은 종목은 계산 시작일 종가부터 들어가고 그 전엔 그 몫이 현금이에요. 킥이 판 종목은 목록에서 빠져요.' + (W.pr.length ? ' 🛍️ 상품: 채권·ELS는 연 수익률을 날마다 고르게 쌓은 값(중간 가격 변동·환율·세금 빼고 · ELS는 조기상환 조건이 맞는다고 가정), 펀드는 기준일의 1일·1주·1·3·6개월·1년 수익률을 이어 붙인 길(그 사이는 고르게)이에요. 외화 상품은 그 나라 통화 기준.' : '') + ' 내가 고른 대로의 계산일 뿐 매수 추천이 아니에요.</p></section>';
    return h;
  }
  var PGK = [["ust", "🇺🇸 미국채"], ["krw", "🇰🇷 국내채권"], ["brl", "🇧🇷 브라질"], ["fund", "📦 공모펀드"], ["pvl", "🔒 사모 라인업"], ["els", "🎯 ELS"]];
  var PGN = {ust: "🇺🇸", krw: "🇰🇷", brl: "🇧🇷", fund: "📦", pvl: "🔒", els: "🎯"}, PCAT = null, PCATP = null;
  function pcat(){ if (!PCATP && window.prodCatalog) PCATP = prodCatalog().then(function(c){ PCAT = c; return c; }, function(){ PCATP = null; return null; }); return PCATP || Promise.resolve(null); }
  function myBind(b){
    // 10/19 🔧: 누른 단추가 그 자리에 그대로 있게 — 위쪽 「담은 종목」이 늘거나 줄어도 화면이 튀지 않음 (ui_audit 「전부 체크」 407→1963px)
    var redraw = function(anc){ keep(); var y = window.scrollY, a0 = anc && document.querySelector(anc), t0 = a0 && a0.getBoundingClientRect().top; draw(); window.scrollTo(0, y);
      var a1 = anc && document.querySelector(anc); if (a1 && t0 != null){ var d = a1.getBoundingClientRect().top - t0; if (Math.abs(d) > 2) window.scrollBy(0, d); } };
    var setV = function(k, v){ v = Math.max(0, Math.min(100, Math.round(v * 10) / 10));
      if (k.indexOf("pw:") === 0){ (S.my.prod || []).forEach(function(p){ if (p.id === k.slice(3)) p.w = v; }); return; }
      if (k.indexOf("w:") === 0) S.my.w[k.slice(2)] = v; else S.my[k] = v; };
    var getV = function(k){ if (k.indexOf("pw:") === 0){ var p = (S.my.prod || []).filter(function(x){ return x.id === k.slice(3); })[0]; return p ? +p.w || 0 : 0; } return k.indexOf("w:") === 0 ? wOf(k.slice(2)) : (+S.my[k] || 0); };
    [].forEach.call(b.querySelectorAll("button[data-myk]"), function(x){ x.onclick = function(){ setV(x.dataset.myk, getV(x.dataset.myk) + (+x.dataset.d)); redraw(); }; });
    [].forEach.call(b.querySelectorAll("input.my-in"), function(x){ x.onchange = function(){ setV(x.dataset.myk, +String(x.value).replace(/[^\d.]/g, "") || 0); redraw(); };
      x.onkeydown = function(ev){ if (ev.key === "Enter") x.blur(); }; });
    [].forEach.call(b.querySelectorAll("[data-pick]"), function(x){ x.onchange = function(){ if (x.checked) S.my.pick[x.dataset.pick] = 1; else delete S.my.pick[x.dataset.pick]; redraw('[data-pick="' + x.dataset.pick + '"]'); }; });
    [].forEach.call(b.querySelectorAll("[data-myall]"), function(x){ x.onclick = function(){ S.my.pick = {}; if (x.dataset.myall === "1") kHold().forEach(function(h){ S.my.pick[h.code] = 1; }); redraw('[data-myall="' + x.dataset.myall + '"]'); }; });
    [].forEach.call(b.querySelectorAll("[data-myrm]"), function(x){ x.onclick = function(){ var c = x.dataset.myrm;
      if (x.dataset.kind === "kick") delete S.my.pick[c]; else S.my.own = S.my.own.filter(function(o){ return o.code !== c; }); delete S.my.w[c]; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-mywm]"), function(x){ x.onclick = function(){ S.my.wm = x.dataset.mywm; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myedit]"), function(x){ x.onclick = function(){ S.myEdit = +x.dataset.myedit; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myprm]"), function(x){ x.onclick = function(){ var id = x.dataset.myprm; S.my.prod = (S.my.prod || []).filter(function(p){ return p.id !== id; }); redraw(); }; });
    var pq = document.getElementById("mypq"), pres = document.getElementById("mypres");
    if (pq && pres){
      var pshow = function(){
        if (!PCAT){ pres.innerHTML = '<div class="my-hint">상품 목록 불러오는 중…</div>'; return; }
        var g = S.myPg || "ust", t = pq.value.trim().toLowerCase(), have = {}; (S.my.prod || []).forEach(function(p){ have[p.id] = 1; });
        if (g === "pvl" && !PCAT.pvl){ pres.innerHTML = '<div class="my-hint">🔒 사모 라인업은 상품 › 펀드 탭에서 비밀번호로 한 번 열면 여기서도 보여요.</div>'; return; }
        var L = PCAT.items.filter(function(x){ return x.g === g && (!t || (x.name + " " + x.sub).toLowerCase().indexOf(t) >= 0); });
        if (!t){ if (g === "fund" || g === "pvl") L.sort(function(a, c){ return (c.rank || -1e9) - (a.rank || -1e9); }); else if (g === "ust") L.sort(function(a, c){ return (c.mir ? 1 : 0) - (a.mir ? 1 : 0) || c.y - a.y; }); else L.sort(function(a, c){ return c.y - a.y; }); }
        pres.innerHTML = L.length ? L.slice(0, 12).map(function(x){ return '<button type="button" data-padd="' + e(x.id) + '"' + (have[x.id] ? ' disabled' : '') + '><b>' + e(x.name) + '</b> <small>' + e(x.sub) + (have[x.id] ? ' · 이미 담음' : '') + '</small></button>'; }).join("") + (L.length > 12 ? '<div class="my-hint">' + L.length + '개 중 12개 — 이름으로 더 찾아요</div>' : '')
          : '<div class="my-hint">「' + e(pq.value) + '」 — 못 찾았어요</div>';
        [].forEach.call(pres.querySelectorAll("[data-padd]"), function(y){ y.onclick = function(){
          var x = PCAT.items.filter(function(z){ return z.id === y.dataset.padd; })[0]; if (!x) return;
          var dd = (document.getElementById("myd0") || {}).value || P.start; if (dd < P.dates[0]) dd = P.dates[0];
          S.my.prod = (S.my.prod || []).concat([{id: x.id, g: x.g, name: x.name, sub: x.sub, y: x.y, per: x.per, asof: x.asof, cur: x.cur, w: 10, d0: dd}]); redraw(); }; });
      };
      pq.oninput = pshow; pshow(); if (!PCAT) pcat().then(pshow);
    }
    [].forEach.call(b.querySelectorAll("[data-mypg]"), function(x){ x.onclick = function(){ S.myPg = x.dataset.mypg; redraw(); }; });
    // 💾 저장 · 다른 이름 · 이름 바꾸기 · 삭제 · 불러오기 · 새 포트
    var ask = function(msg, def){ var n = window.prompt(msg, def || ""); n = (n || "").trim().slice(0, 20); return n || null; };
    var put = function(n){ S.mySaved = (S.mySaved || []).filter(function(x){ return x.nm !== n; }); S.mySaved.push({nm: n, cfg: myCfg()}); S.my.nm = n; };
    [].forEach.call(b.querySelectorAll("[data-mysave]"), function(x){ x.onclick = function(){ var n = S.my.nm || ask("이 포트 이름을 정해 주세요", "내 포트 " + ((S.mySaved || []).length + 1)); if (!n) return;
      if (!S.my.nm && (S.mySaved || []).some(function(y){ return y.nm === n; }) && !window.confirm("「" + n + "」 이 이미 있어요. 덮어쓸까요?")) return; put(n); S.myEdit = 0; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myas]"), function(x){ x.onclick = function(){ var n = ask("새 이름", S.my.nm + " 2"); if (!n) return; put(n); redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myren]"), function(x){ x.onclick = function(){ var o = S.my.nm, n = ask("바꿀 이름", o); if (!n || n === o) return;
      S.mySaved = (S.mySaved || []).filter(function(y){ return y.nm !== n; }).map(function(y){ return y.nm === o ? {nm: n, cfg: y.cfg} : y; }); S.my.nm = n; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-mydel]"), function(x){ x.onclick = function(){ if (!window.confirm("「" + S.my.nm + "」 을 지울까요? (지금 화면의 비중·종목은 남아요)")) return;
      var o = S.my.nm; S.mySaved = (S.mySaved || []).filter(function(y){ return y.nm !== o; }); S.my.nm = ""; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-myload]"), function(x){ x.onclick = function(){ var sl = S.mySaved[+x.dataset.myload]; if (!sl || sl.nm === S.my.nm) return;
      if (myDirty() && !window.confirm("「" + S.my.nm + "」 의 저장 안 한 변경이 사라져요. 바꿀까요?")) return;
      S.my = Object.assign({prod: []}, JSON.parse(JSON.stringify(sl.cfg)), {nm: sl.nm}); S.myEdit = 0; redraw(); }; });
    [].forEach.call(b.querySelectorAll("[data-mynew]"), function(x){ x.onclick = function(){
      if (myDirty() && !window.confirm("「" + S.my.nm + "」 의 저장 안 한 변경이 사라져요. 새로 만들까요?")) return;
      S.my = {spx: 40, ndx: 40, gold: 5, per: 3, wm: "all", w: {}, pick: {}, own: [], prod: [], nm: ""}; S.myEdit = 1; redraw(); }; });
    // ✍️ 종목 직접 넣기 — 앱 검색 목록(약 2만 종목 + ETF)에서 고름
    var q = document.getElementById("myq"), res = document.getElementById("myres"), d0 = document.getElementById("myd0");
    if (d0) d0.onchange = function(){ S.myD0 = d0.value || ""; keep(); };
    if (q && res){
      var show = function(){ var t = q.value.trim(); if (!t){ res.innerHTML = ""; return; }
        if (!window.opSearch || !window.OPIDX){ res.innerHTML = '<div class="my-hint">종목 목록 불러오는 중…</div>'; return; }
        var have = {}; myStocks().forEach(function(x){ have[x.code] = 1; });
        var r = opSearch(t).slice(0, 8), FL = window.FLAG || {};
        res.innerHTML = r.length ? r.map(function(x){ return '<button type="button" data-add="' + e(x.sym) + '" data-nm="' + e(x.name) + '" data-mk="' + e(x.mkt || "") + '"' + (have[x.sym] ? ' disabled' : '') + '>' + (FL[x.mkt] || "") + ' <b>' + e(x.name) + '</b> <small>' + e(window.V && V.cd ? V.cd(x.sym) : x.sym) + (have[x.sym] ? ' · 이미 담음' : '') + '</small></button>'; }).join("")
          : '<div class="my-hint">「' + e(t) + '」 — 못 찾았어요</div>';
        [].forEach.call(res.querySelectorAll("[data-add]"), function(y){ y.onclick = function(){
          var dd = (d0 && d0.value) || P.start; if (dd < P.dates[0]) dd = P.dates[0];
          S.my.own = (S.my.own || []).concat([{code: y.dataset.add, name: y.dataset.nm, mkt: y.dataset.mk, d0: dd}]); redraw();
          setTimeout(function(){ var n = document.getElementById("myq"); if (n) n.focus(); }, 0); }; });
      };
      q.oninput = show; q.onkeydown = function(ev){ if (ev.key === "Enter"){ var f = res.querySelector("[data-add]:not([disabled])"); if (f) f.click(); } };
      if (window.opLoadIdx && !window.OPIDX) opLoadIdx().then(show, function(){});
    }
  }
  function myPlan(){   // 📋 주문서 — 뼈대 칸은 기본 포트 상품 그대로, 종목은 담은 것만
    var W = myW(), want = {"S&P": W.spx, "나스닥": W.ndx, "금": W.gold, "현금": W.cash};
    var out = P.hold.map(function(x, i){
      var key = /S&P/.test(x.name) ? "S&P" : /나스닥/.test(x.name) ? "나스닥" : /^금/.test(x.name) ? "금" : /현금/.test(x.name) ? "현금" : null;
      var pct = r1(key ? want[key] : 0), amt = S.amt * pct / 100, items = [], kr = (x.kr || []).filter(function(k){ return k.etf; });
      if (S.mode === "kr" && kr.length){ var k = kr[0]; items.push({nm: k.name, code: k.code, amt: amt, sh: k.px ? Math.floor(amt / k.px) : null, px: k.px, cur: "원"}); }
      else { var u = (x.us || []).filter(function(u){ return u.px; })[0]; if (u){ var usd = P.fx ? amt / P.fx : null; items.push({nm: u.name || u.t, code: u.t, amt: amt, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$"}); } }
      return {x: {name: x.name, pct: pct}, i: i, amt: amt, items: items};
    });
    if (W.st.length){ myLine(W);   // 직접 넣은 종목의 지금 가격(x.now) 채우기
      out.push({x: {name: "🙋 담은 종목", pct: r1(W.st.reduce(function(a, x){ return a + x.w; }, 0))}, i: -1, amt: S.amt * W.st.reduce(function(a, x){ return a + x.w; }, 0) / 100, kick: 1, items: W.st.map(function(o){
        var a = S.amt * o.w / 100, kr = /^\d{6}\.K[SQ]$/.test(o.code), us = /^[A-Z\-]+$/.test(o.code), usd = us && P.fx ? a / P.fx : null;
        return {tags: o.tags || "", short: o.name, nm: (o.tags ? o.tags + " " : "") + o.name, code: o.code, amt: a, usd: usd, cur: us ? "$" : kr ? "원" : "현지",
                sh: o.now ? (us ? (usd ? Math.floor(usd / o.now) : null) : kr ? Math.floor(a / o.now) : null) : null, note: o.rule || ""}; })}); }
    if (W.pr.length) out.push({x: {name: "🛍️ 담은 상품", pct: r1(W.pr.reduce(function(a, x){ return a + x.w; }, 0))}, i: -1, amt: S.amt * W.pr.reduce(function(a, x){ return a + x.w; }, 0) / 100, prod: 1,
      items: W.pr.map(function(o){ return {nm: (PGN[o.g] || "") + " " + o.name, amt: S.amt * o.w / 100, w: o.w, cur: o.cur, sub: o.sub}; })});
    return out;
  }
  // ⓘ 포트 설명 칸 (10/14 사용자: 「킥포트와 집중포트에 대한 탭하면 정보 나오고 닫는 칸」)
  function infHtml(){
    var R = (K && K.rules) || {}, CR = (CN && CN.rule) || {};
    var pc = function(v){ return v == null ? "–" : Math.round(v * 100) + "%"; };
    return '<details class="card po-inf no-clp"><summary>ⓘ 포트 4개, 뭐가 달라요? <small>눌러서 열고 닫기</small></summary><div class="po-infb">' +
      '<div><b>💼 기본 포트</b> — 뼈대. S&P500·나스닥100 반반에 금 조금. 시장이 나빠지면 현금을 늘려요. 개별 종목은 없어요.</div>' +
      (K ? '<div class="k"><b>⚡ 킥 포트</b> — <u>기본 뼈대 + 개별 종목 양념</u>. 돈의 약 ' + pc(R.sleeve) + '는 ☕ 컵·📈 갭 같은 신호가 뜬 종목을 최대 ' + (R.slots || "–") + '개, 약 ' + pc(R.whale_sleeve) + '는 🐋 고래가 새로 산 종목 묶음에 담아요. 종목마다 ' +
        (R.stop != null ? Math.round(R.stop * 100) + '% 손절 · ' : '') + (R.take != null ? '+' + Math.round(R.take * 100) + '% 익절 · ' : '') + (R.time ? R.time + '거래일 지나면 정리' : '') + '. 사고파는 일이 잦고, 스캐너가 잘 맞히느냐에 성적이 걸려 있어요.</div>' : '') +
      (CN ? '<div class="c"><b>🎯 집중 포트</b> — <u>' + (CR.core ? '나스닥100에 몰빵' : '지수 두 개에 몰빵') + ' + 날씨 따라 우산</u>. 개별 종목 없이 ' + (CR.core ? '나스닥100(11/18부터)' : 'S&P500·나스닥100') + '만. 판정: ' + e(CR.judge || "S&P500 200일선") + '. ' + e(CR.on || "") + ' / ' + e(CR.off || "") + '. 손은 주 1회 비중 맞출 때와 판정이 바뀐 날에만 가요 · 🔄 월말 흐름은 하루 먼저 ⏰ 알림 → 그날 밤 미국 종가 예약(LOC).</div>' : '') +
      '<div class="m"><b>🙋 내 포트</b> — <u>내가 실제로 담는 그대로</u>. S&P·나스닥·금 비중을 직접 정하고, ⚡ 킥 종목 중 산 것만 ✓ 체크. 성적·비교·그래프는 다른 포트와 똑같이 보여 줘요.</div>' +
      '<p class="note" style="margin:6px 0 0">셋 다 「규칙대로 했다면」 계산이지 매수 추천이 아니에요.</p></div></details>';
  }
  // ---- 🐻 11/09 A11/9-2 하락장 규칙 겹쳐 보기 ----
  var BMK = {kospi: "🇰🇷 코스피", kosdaq: "🇰🇷 코스닥", sp500: "🇺🇸 S&P500", nasdaq: "🇺🇸 나스닥"}, BNM = {"🟢": "정상", "🟡": "조정", "🐻": "하락장"};
  function bearM(){ var o = {}; ((BR && BR.markets) || []).forEach(function(m){ o[m.key] = m; }); return o; }
  function bearAny(){ return ((BR && BR.markets) || []).some(function(m){ return m.state !== "🟢"; }); }
  function bearOn(){ return BEARON && bearAny(); }
  function bearHead(){ return ((BR && BR.markets) || []).filter(function(m){ return m.key !== "kosdaq"; }).map(function(m){ return m.state + m.name + (m.cash ? " " + (m.to || "현금") + " " + m.cash + "%" : ""); }).join(" · ") + " · " + md((BR.markets[0] || {}).asof) + " 종가 판정"; }
  function bearBtn(){
    if (!bearAny()) return '';
    return '<div class="po-hv po-brt"><button type="button" id="pobrt" class="' + (BEARON ? "on" : "") + '">' + (BEARON ? "🐻 하락장 규칙 겹쳐 보는 중" : "🐻 하락장 규칙 겹쳐 보기") + '</button><small>' + (BEARON ? "보기 전용 · 끄면 원래 배분표" : "켜면 시장마다 그 시장 칸에 계기판 현금 권고를 겹쳐 주황으로") + '</small></div>';
  }
  function pplan(){
    var pl = plan(); if (!bearOn()) return pl;
    // 11/09 오후 2차 「코스피는 켜고 미국은 끄는걸로」: 시장마다 그 시장 칸에만 그 시장 현금 권고(🇰🇷 하락장 100% · 🇺🇸 꺼 둠 0%)
    //   (그 전 「2번 후자로」 = 포트 전체를 가장 센 권고로 — 미국을 끈 뒤엔 코스피 100%가 미국 칸까지 지우게 돼 시장별로 되돌림)
    var BM_ = bearM(), cut = 0, out = pl.map(function(p){
      var mk = rowMk(p); if (!mk) return p;
      var q = Object.assign({}, p, {x: Object.assign({}, p.x)}), lost = 0, mks = {};
      q.items = p.items.map(function(it){
        var k = mk === "item" ? itemMk(it) : mk, c = (BM_[k] && BM_[k].cash) || 0; if (!c) return it;
        var f = 1 - c / 100, n = Object.assign({}, it, {amt: it.amt * f, sh0: it.sh, amt0: it.amt});
        if (it.usd != null) n.usd = it.usd * f;
        if (it.sh != null) n.sh = it.usd != null && it.px ? Math.floor(it.usd * f / it.px) : it.cur === "원" && it.px && !it.fx ? Math.floor(it.amt * f / it.px) : Math.floor(it.sh * f);
        lost += it.amt - n.amt; mks[k] = c; return n; });
      if (!p.items.length){ var k0 = mk === "item" ? "sp500" : mk, c0 = (BM_[k0] && BM_[k0].cash) || 0; if (c0){ lost = p.amt * c0 / 100; mks[k0] = c0; } }
      if (lost <= 0) return p;
      q.amt0 = p.amt; q.amt = p.amt - lost; q.x.pct0 = p.x.pct; q.x.pct = Math.round(q.amt / S.amt * 1000) / 10;
      var ks = Object.keys(mks); q.bc = ks.length === 1 ? mks[ks[0]] : Math.round(lost / p.amt * 100);
      q.bmk = ks.map(function(k){ return BMK[k] + " " + (BM_[k].state || "") + " " + BNM[BM_[k].state] + " " + mks[k] + "%"; }).join(" · ");
      cut += lost; return q; });
    if (cut > 0){
      var ci = -1; out.forEach(function(p, i){ if (ci < 0 && /현금/.test(p.x.name) && !p.kick && !p.prod) ci = i; });
      var src = P.hold.filter(function(h){ return /현금/.test(h.name); })[0];
      var base = ci >= 0 ? out[ci] : {x: {name: "현금·단기채", pct: 0}, i: src ? P.hold.indexOf(src) : 0, amt: 0, items: []};
      var amt = base.amt + cut, items = [];
      if (S.mode === "kr" && src && (src.kr || []).filter(function(k){ return k.etf && k.px; }).length){ var k = src.kr.filter(function(k){ return k.etf && k.px; })[0]; items.push({nm: k.name, code: k.code, amt: amt, sh: Math.floor(amt / k.px), px: k.px, cur: "원"}); }
      else if (src && (src.us || []).filter(function(u){ return u.px; }).length){ var u = src.us.filter(function(u){ return u.px; })[0], usd = P.fx ? amt / P.fx : null; items.push({nm: u.name || u.t, code: u.t, amt: amt, usd: usd, sh: usd ? Math.floor(usd / u.px) : null, px: u.px, cur: "$"}); }
      var cr = Object.assign({}, base, {x: {name: base.x.name, pct: Math.round(amt / S.amt * 1000) / 10, pct0: base.x.pct}, amt: amt, amt0: base.amt, items: items, bcash: 1});
      if (ci >= 0) out[ci] = cr; else out.push(cr);
    }
    out._cut = cut; return out;
  }
  // 칸 → 시장: 이름으로(원화 베이스에서 한국 상장 ETF 로 바뀌어도 S&P 칸은 S&P) · 종목 칸(킥·담은 종목)은 종목 코드로 · 금·현금·채권·자산 추세·상품은 주식이 아니라 그대로
  function rowMk(p){
    var n = String(p.x.name || "");
    if (p.prod || /현금|단기|채권|추세|달러|^금$|^금 |🥇/.test(n)) return null;
    if (/나스닥|QQQ/i.test(n)) return "nasdaq";
    if (/S&P|SPY/i.test(n)) return "sp500";
    if (/코스피|코스닥|국내|한국|KOSPI/i.test(n)) return "kospi";
    if (/^🧭/.test(n)) return "sp500";
    return "item";
  }
  function itemMk(it){ return /^\d{6}(\.K[SQ])?$/.test(String(it.code || "")) ? "kospi" : "sp500"; }
  function bearWorst(){ var ms = ((BR && BR.markets) || []).filter(function(m){ return m.cash > 0; }); ms.sort(function(a, b){ return b.cash - a.cash || a.dd - b.dd; }); return ms[0] || null; }
  function bearSum(PL){
    var bx = document.getElementById("pobrx"); if (!bx) return;
    if (!bearOn()){ bx.innerHTML = ""; return; }
    var cut = PL._cut || 0, used = {};
    PL.forEach(function(p){ var mk = rowMk(p); if (!mk) return; if (mk === "item") p.items.forEach(function(it){ used[itemMk(it)] = 1; }); else used[mk] = 1; });
    var cr = PL.filter(function(p){ return p.bcash; })[0];
    var lines = ((BR && BR.markets) || []).filter(function(m){ return m.key !== "kosdaq"; }).map(function(m){   // 🌱 11/11 코스닥은 판정·알림만(포트 칸 없음)
      var off = m.rule && m.rule.id === "OFF";
      var tx = off ? "현금 규칙 꺼 둠 — 그대로" : !m.cash ? "그대로" : !used[m.key] ? "이 포트엔 " + (m.key === "kospi" ? "한국 주식 칸이 없어 해당 없음" : "그 시장 칸이 없어 해당 없음") : "그 시장 주식 칸의 " + m.cash + "% 덜기";
      return '<li><b>' + BMK[m.key] + ' ' + m.state + ' ' + BNM[m.state] + '</b>' + (m.cash ? ' ' + (m.to || '현금') + ' ' + m.cash + '%' : '') + ' → ' + tx + '</li>'; }).join("");
    bx.innerHTML = '<div class="po-brs"><div class="po-brh">🐻 하락장 규칙 겹쳐 봄 <small>' + e(md((BR.markets[0] || {}).asof)) + ' 종가 판정</small></div>' +
      '<div class="po-brn">현금·단기 <b>' + (cr ? cr.x.pct0 : 0) + '%</b> → <b class="po-bcv">' + (cr ? cr.x.pct : 0) + '%</b> <small>(' + (cut ? '+' + won(cut) + '원' : '바뀌는 줄 없음') + ')</small></div>' +
      '<ul>' + lines + '</ul>' +
      '<p>시장마다 그 시장 칸에만 🔁 닮은 장 규칙의 현금 몫을 적용 — 금·자산 추세·현금·상품은 그대로 · 켜 둔 동안 「주문 목록 복사」도 이대로</p>' +
      '<p class="po-brt2">💼 기본 포트는 S&P500 200일선 규칙이 먼저예요 · 🔁 닮은 장 규칙은 국내 주식과 시장별 참고용 · 보기 전용 · 매수·매도 권유 아님</p></div>';
  }
  function rows(){
    var box = document.getElementById("porows"); if (!box) return;
    var PL = pplan(); bearSum(PL);
    box.innerHTML = PL.map(function(p){
      if (p.kick) return kickRow(p);
      if (!p.x.pct) return '';
      if (p.prod) return '<div class="po-r"><div class="po-rh"><i style="background:#38bdf8"></i><b>' + e(p.x.name) + '</b><span class="pct">' + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        p.items.map(function(it){ return '<div class="po-it"><span class="tk">' + e(it.nm) + ' <small>' + r1(it.w) + '%</small></span><span class="v">' + won(it.amt) + '원' + (it.cur && it.cur !== "원" ? ' · ' + e(it.cur) + '로' : '') + '</span></div>'; }).join("") +
        '<div class="po-itn">상품은 상품 탭 · 미래에셋 매매 화면에서 금액으로 사요(채권 단가·펀드 최소금액 확인)</div></div>';                              // 0% 칸은 주문서에서 뺌
      return '<div class="po-r' + (p.kick ? ' po-rk' : '') + (p.bc ? ' po-bc' : '') + '" data-ix="' + p.i + '"><div class="po-rh"><i style="background:' + (p.kick ? "#ff6b6b" : p.bcash ? "#8a94a8" : COL[p.i % COL.length]) + '"></i><b>' + e(p.x.name) + '</b><span class="pct">' + (p.bc ? '<s>' + p.x.pct0 + '%</s> → ' : '') + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
        (p.bc ? '<div class="po-bcn">🐻 ' + e(p.bmk) + ' — 이 칸의 ' + p.bc + '% 덜기 · −' + won(p.amt0 - p.amt) + '원</div>' : '') +
        (p.bcash ? '<div class="po-bcn">🐻 덜어 낸 돈 ' + won(p.amt - (p.amt0 || 0)) + '원이 여기로</div>' : '') +
        p.items.map(function(it){
          return '<div class="po-it" data-op="' + e(it.code) + '"><span class="tk">' + e(it.nm) + (it.code !== it.nm ? ' <small>' + e(it.code) + '</small>' : '') + ' <i class="po-go">›</i></span>' +
            '<span class="v">' + (it.cur === "$" ? (it.usd != null ? '$' + Math.round(it.usd).toLocaleString("en-US") + ' · ' : '') : won(it.amt) + '원 · ') +
            (it.sh != null ? (it.sh0 != null && it.sh0 !== it.sh ? '<s>' + it.sh0.toLocaleString("ko-KR") + '주</s> → <b class="po-bcv">' + it.sh.toLocaleString("ko-KR") + '주</b>' : '<b>' + it.sh.toLocaleString("ko-KR") + '주</b>') : it.cur === "현지" ? '현지 통화로' : '가격 확인') + (it.fx ? ' <small class="po-fx">' + flag(it.code) + ' ' + e(it.fx) + '</small>' : '') + '</span></div>' +
            (S.hv && it.sh != null ? hvLine(it) : '') +
            (it.note ? '<div class="po-itn">' + e(it.note) + '</div>' : ''); }).join("") +
          (p.kick && !p.items.length ? '<div class="po-itn">지금 빈 자리 — 신호가 뜨면 3%씩 들어가요 (그때까지 현금)</div>' : '') + '</div>';
    }).join("");
    hvAfter(box);
  }
  // ---- 10/14 A11-4 「갖고 있는 것 → 바꿀 것만」 ----
  function hvQty(code){ var v = S.have[code]; return v == null || v === "" ? null : +v; }
  function hvDiff(it){ var h = hvQty(it.code); if (h == null || it.sh == null) return null; return it.sh - h; }
  function hvTxt(d){ return d > 0 ? '<b class="hv-b">+' + d.toLocaleString("ko-KR") + '주 사기</b>' : d < 0 ? '<b class="hv-s">−' + (-d).toLocaleString("ko-KR") + '주 팔기</b>' : '<b class="hv-k">그대로 ✓</b>'; }
  function hvLine(it){
    var h = hvQty(it.code), d = hvDiff(it);
    return '<div class="po-hvl" data-hvl="1"><span>지금 <input aria-label="지금 가진 주식 수" class="po-hin" inputmode="numeric" data-code="' + e(it.code) + '" value="' + (h == null ? "" : h) + '" placeholder="0">주</span>' +
      '<span class="hv-d">' + (d == null ? '<small>주 수를 넣으면 「바꿀 것」이 나와요</small>' : '→ ' + hvTxt(d)) + '</span></div>';
  }
  function hvAfter(box){
    var ex = document.getElementById("pohvx"); if (ex) ex.innerHTML = "";
    if (!S.hv) return;
    [].forEach.call(box.querySelectorAll(".po-hin"), function(inp){
      inp.onclick = function(ev){ ev.stopPropagation(); };
      inp.oninput = function(ev){ ev.stopPropagation(); var v = inp.value.replace(/[^\d]/g, ""); if (v === "") delete S.have[inp.dataset.code]; else S.have[inp.dataset.code] = +v; keep();
        var row = inp.closest(".po-hvl"), code = inp.dataset.code, it = null; pplan().forEach(function(p){ p.items.forEach(function(x){ if (x.code === code) it = x; }); });
        if (row && it){ var d = hvDiff(it); row.querySelector(".hv-d").innerHTML = d == null ? '<small>주 수를 넣으면 「바꿀 것」이 나와요</small>' : '→ ' + hvTxt(d); } hvExtra(); };
    });
    // ⚡ 킥 칩(kickRow)에도 보유 수 입력은 없음 — 킥 칸은 종목이 바뀌니 「배분표에 없는 보유분」 줄로 「팔 것」을 알려 줌
    hvExtra();
  }
  function hvExtra(){
    var ex = document.getElementById("pohvx"); if (!ex || !S.hv) return;
    var inPlan = {}; pplan().forEach(function(p){ p.items.forEach(function(x){ inPlan[x.code] = 1; }); });
    var left = Object.keys(S.have).filter(function(c){ return !inPlan[c] && hvQty(c) > 0; });
    var sum = hvSummary();
    ex.innerHTML = (left.length ? '<div class="po-hvx"><b>지금 배분표에 없는 보유분</b> → 팔기: ' + left.map(function(c){ return '<span class="po-tk" data-op="' + e(c) + '">' + e(c) + '</span> ' + hvTxt(-hvQty(c)) + ' <button aria-label="닫기" type="button" class="hv-rm" data-rm="' + e(c) + '">✕</button>'; }).join(" · ") + '</div>' : '') +
      (sum ? '<div class="po-hvs">' + sum + '</div>' : '');
    [].forEach.call(ex.querySelectorAll(".hv-rm"), function(b){ b.onclick = function(ev){ ev.stopPropagation(); delete S.have[b.dataset.rm]; keep(); hvExtra(); }; });
  }
  function hvSummary(){
    var buy = 0, sell = 0, keepN = 0, miss = 0;
    pplan().forEach(function(p){ p.items.forEach(function(it){ if (it.sh == null) return; var d = hvDiff(it); if (d == null){ miss++; return; } if (d > 0) buy++; else if (d < 0) sell++; else keepN++; }); });
    if (!buy && !sell && !keepN) return "";
    return '바꿀 것 ' + (buy + sell) + '줄 <small>(사기 ' + buy + ' · 팔기 ' + sell + ' · 그대로 ' + keepN + (miss ? ' · 주 수 안 넣음 ' + miss : '') + ')</small>';
  }
  // ⚡ 킥 칸은 간단히: 신호별 개수 한 줄 + 종목 칩(이모티콘·이름·주 수) · 규칙·손절은 「킥」 카드에서
  function kickRow(p){
    var cnt = {}; p.items.forEach(function(it){ (it.tags.match(/\p{Extended_Pictographic}/gu) || ["·"]).forEach(function(t){ cnt[t] = (cnt[t] || 0) + 1; }); });
    var lab = {"🐋": "고래", "☕": "컵", "📈": "갭", "🤫": "매집", "🧪": "시험"};
    var sum = Object.keys(cnt).filter(function(t){ return lab[t]; }).map(function(t){ return t + ' ' + lab[t] + ' ' + cnt[t]; }).join(' · ');
    return '<div class="po-r po-rk' + (p.bc ? ' po-bc' : '') + '"><div class="po-rh"><i style="background:#ff6b6b"></i><b>' + e(p.x.name) + '</b><span class="pct">' + (p.bc ? '<s>' + p.x.pct0 + '%</s> → ' : '') + p.x.pct + '%</span><span class="am">' + won(p.amt) + '원</span></div>' +
      (p.bc ? '<div class="po-bcn">🐻 ' + e(p.bmk) + ' · −' + won(p.amt0 - p.amt) + '원 (종목마다 그 시장 권고만큼)</div>' : '') +
      (p.items.length ? '<div class="po-ksum">' + p.items.length + '종목 · 한 종목 약 ' + won(p.amt / p.items.length) + '원' + (sum ? ' · ' + sum : '') + '</div><div class="po-kg">' +
        p.items.map(function(it){
          var q = it.sh ? it.sh.toLocaleString("ko-KR") + '주' : it.cur === "현지" ? won(it.amt) + '원' : '<span class="po-k0">1주 안 됨</span>';
          return '<span class="po-kc" data-op="' + e(it.code) + '"><i>' + e(it.tags.replace(/🧪/g, "")) + '</i><b>' + e(it.short) + '</b><small>' + q + '</small></span>'; }).join("") + '</div>' +
        '<div class="po-kl" data-goto="port~pokick">손절·익절 규칙과 수익은 ⚡ 킥 카드에서 ›</div>'
      : '<div class="po-itn">지금 빈 자리 — 신호가 뜨면 3%씩 들어가요 (그때까지 현금)</div>') + '</div>';
  }
  function nm(x){ return String(x || "").replace(/,? (Inc\.?|Corp\.?|Corporation|Ltd\.?|Company|plc|N\.V\.|S\.A\.|ASA)?\s*(Common Stock|Ordinary Shares|Class [A-Z].*|American Depositary.*)$/i, "").replace(/,? (Inc\.?|Corporation|Corp\.?|Ltd\.?)$/i, "").trim(); }
  function pr(v){ return v == null ? "–" : (+v).toLocaleString("ko-KR", {maximumFractionDigits: v >= 1000 ? 0 : 2}); }
  function flag(t){ t = String(t || ""); return /\.T$/.test(t) ? "🇯🇵" : /\.K[SQ]$/.test(t) ? "🇰🇷" : /\.HK$/.test(t) ? "🇭🇰" : /\.(SS|SZ)$/.test(t) ? "🇨🇳" : "🇺🇸"; }
  function pvs(v){
    if (!v) return '';
    if (v.pending || v.edge == null) return '<em class="pvs">🌏 ' + md(v.since) + ' 고른 상품 — 다음 거래일부터 원래 상품(' + e((v.base || []).join("·")) + ')과 비교</em>';
    return '<em class="pvs">🌏 고른 상품 ' + sg(v.pick, 1) + ' vs 원래 ' + e((v.base || []).join("·")) + ' ' + sg(v.base_r, 1) + ' → <b class="' + (v.edge >= 0 ? "w" : "l") + '">' + (v.edge >= 0 ? "앞섬 " : "뒤짐 ") + sg(v.edge, 1).replace("%", "p") + '</b> · ' + v.days + '일</em>';
  }
  function peersHtml(){
    var held = {}; P.hold.forEach(function(x){ (x.picks || []).forEach(function(t){ held[t] = x.name; }); });
    var vc = function(v){ return /편입/.test(v) ? "g" : /매매 불가/.test(v) ? "n" : /과열/.test(v) ? "w" : /약함/.test(v) ? "b" : ""; };
    var h = '<div class="sec">🌏 미국 강세 섹터 × 해외 동종주 <small class="mut">3개월 달러 수익 · 위험 대비 · 과열 — 이기는 쪽을 포트에 담아요</small></div><section class="card po-pe">';
    h += PE.themes.map(function(T, ti){
      var et = T.etf || {}, all = T.rows || [], rows = all;
      var inP = rows.filter(function(r){ return held[r.t]; }).length;
      return '<details><summary><b>' + e(T.name) + '</b>' + (inP ? ' <span class="po-sg g">포트 ' + inP + '</span>' : '') +
        '<em>' + (/^미국/.test(et.t || "") ? '' : '미국 기준 ') + e(et.t || "") + ' 3개월 <b class="' + cls(et.r3) + '">' + sg(et.r3, 0) + '</b></em></summary>' +
        rows.map(function(r, ri){ var mine = held[r.t];
          return '<div class="po-per' + (mine ? " mine" : "") + (ri >= 8 && !mine ? " more" : "") + (r.nobuy ? " nb" : "") + '" data-op="' + e(r.t) + '"><span class="n">' + flag(r.t) + ' ' + e(r.name) + (mine ? ' <span class="po-sg g">✓ 담음</span>' : '') +
            '<small>' + e(r.t) + ' · 1개월 ' + sg(r.r1, 0) + ' · 낙폭 ' + sg(r.mdd, 0) + (r.ma50 ? ' · 50일선 위' : ' · 50일선 아래') + (r.nobuy ? ' · 🔒 ' + e(r.nobuy) : '') + '</small></span>' +
            '<span class="r"><b class="' + cls(r.r3) + '">' + sg(r.r3, 0) + '</b><small>vs 미국 ' + (r.ex3 >= 0 ? "+" : "") + Math.round(r.ex3) + 'p</small></span>' +
            '<span class="po-sg ' + vc(r.verdict || "") + '">' + e(r.verdict || "") + '</span></div>'; }).join("") +
          (all.length > 8 ? '<button class="po-more" onclick="this.parentNode.classList.toggle(\'all\');this.textContent=this.parentNode.classList.contains(\'all\')?\'접기\':\'전체 ' + all.length + '개 보기\'">전체 ' + all.length + '개 보기</button>' : '') + '</details>'; }).join("");
    return h + '<p class="note">' + e(PE.note || "") + ' · ' + e(PE.at || "") + ' · 「✓ 담음」 = 지금 포트 칸의 상품. 🔒 = 창업판·과창판이라 비교만 해요. 리포트가 매일 아침 이 표로 칸마다 가장 나은 상품을 고르고 바꾸면 「비중 바뀐 날」에 남아요.</p></section>';
  }
  // 🎯 집중 포트 카드 (10/11 사용자: "선택과 집중 — 오르는 시장이면 벌 때 벌어야, 단 오르는 시장 판단이 먼저")
  function concHtml(){
    var R = CN.regime, up = R.up, bt = CN.bt || {}, o = bt.oos || {}, so = bt.spy_oos || {}, ii = bt.is || {}, cu = bt.cur_oos || {};
    var h = '<div class="sec">🎯 집중 포트 <small class="mut">오르는 시장이면 벌 때 번다 · 검증한 규칙 그대로</small></div><section class="card cn-c">' +
      '<div class="cn-rg ' + (up ? "g" : "r") + '"><div class="cn-l">' + (up ? "🟢 오르는 시장" : "🔴 오르는 시장 아님") + '</div>' +
        '<div class="cn-s">S&P500 ' + (R.spx || 0).toLocaleString("en-US") + ' · 200일선보다 <b>' + sg(R.gap, 1) + '</b> · ' + md(R.since) + '부터' +
        (R.kospi_up != null ? ' · 코스피 ' + (R.kospi_up ? "🟢" : "🔴") + ' (' + sg(R.kospi_gap, 1) + ')' : '') + '</div>' +
        (R.raw_today !== up ? '<div class="cn-w">⚠ 오늘 종가는 반대쪽 — 3거래일 이어지면 판정이 바뀌어요</div>' : '') + '</div>' +
      '<div class="cn-h">지금 살 것 <small>' + won(S.amt) + '원 기준 · ' + (S.mode === "kr" ? "₩ 원화 베이스" : "💵 외화 베이스") + ' · 다음 거래일 종가</small></div>' +
      concPlan().filter(function(c){ return !c.kick; }).map(function(c){ var it = c.items[0] || {};
        return '<div class="cn-buy" data-op="' + e(it.code) + '"><b class="pct">' + c.x.pct + '%</b><span class="nm">' + e(c.x.name) + '<small>' + e(it.nm) + (it.code && it.code !== it.nm ? ' ' + e(it.code) : '') + '</small></span>' +
          '<span class="q"><b>' + (it.sh != null ? it.sh.toLocaleString("ko-KR") + '주' : '가격 확인') + '</b><small>' + won(c.amt) + '원</small></span></div>'; }).join("") +
      (CN.vol_rule && CN.vol_rule.on ? '<div class="cn-vr">🦴 변동성 방어(' + e(CN.vol_rule.role) + ') · 주식 <b>' + CN.vol_rule.eq_scale + '%</b> 유지 <small>20일 흔들림 ' + CN.vol_rule.vol20 + '% / 목표 ' + CN.vol_rule.target + '%</small></div>' : '') +
      (CN.month_flow && CN.month_flow.on ? (function(M){ var fp = Math.round((M.f || 0.6) * 100), st = M.sig > 0 ? '주식 ' + fp + '% → 장기채 <b>' + M.pct + '%</b>' : M.sig < 0 ? '추세·현금 ' + fp + '% → 주식' : M.window ? '쏠림 작음 · 그대로' : '쉬는 중 · 월말 ' + M.k + '거래일에만';
        return (M.tonight && M.tonight.act ? '<div class="cn-vr" style="border:1px solid #ffb84d">⏰ <b>' + e(M.tonight.text) + '</b></div>' : '') + '<div class="cn-vr">🔄 월말 흐름 · ' + st + ' <small>' + (M.drift != null ? '쏠림 ' + (M.drift >= 0 ? "+" : "") + M.drift + '%p · ' : '') + (M.for || "").slice(5) + ' 기준</small></div>'; })(CN.month_flow) : '') +
      '<p class="cn-n2">판정이 바뀌는 날(🟢↔🔴)과 🔄 월말 흐름 날에만 고치면 돼요. 금액·환율 바꾸기는 아래 📋 따라하기에서.</p>' +
      '<details class="cn-d"><summary>📊 성적·검증 보기</summary>' +
      '<div class="cn-h">' + md(CN.start) + '부터 <small>비용 포함 · 달러 기준</small></div>' +
      '<div class="cn-v">' + [["🎯 집중", CN.ret], ["💼 기본", CN.base], ["⚡ 킥", CN.kick], ["S&P500", CN.spy_ret], ["나스닥100", CN.qqq_ret]].map(function(x){
        return '<div' + (x[0] === "🎯 집중" ? ' class="me"' : '') + '><small>' + x[0] + '</small><b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b></div>'; }).join("") + '</div>';
    if (o.cagr != null){
      h += '<div class="cn-h">검증 — 규칙 고를 때 안 본 ' + e((bt.period || [])[0] || "").slice(0, 4) + '~' + e((bt.period || [])[1] || "").slice(0, 4) + ' <small>다음 날 체결·비용 포함</small></div>' +
        '<table class="cn-t"><tr><th></th><th>연수익</th><th>최대 낙폭</th><th>이긴 해</th></tr>' +
        '<tr class="me"><td>🎯 이 규칙</td><td class="up">' + sg(o.cagr, 1) + '</td><td>' + sg(o.mdd, 0) + '</td><td>' + o.beat_years + '/' + o.years + '</td></tr>' +
        '<tr><td>S&P500</td><td>' + sg(so.cagr, 1) + '</td><td>' + sg(so.mdd, 0) + '</td><td>–</td></tr>' +
        (cu.cagr != null ? '<tr><td>현금 26% 늘 들기<br><small>지금 기본 포트 닮은꼴</small></td><td class="dn">' + sg(cu.cagr, 1) + '</td><td>' + sg(cu.mdd, 0) + '</td><td>' + cu.beat_years + '/' + cu.years + '</td></tr>' : '') + '</table>' +
        '<p class="cn-n">S&P보다 연 <b class="' + cls(o.ex) + '">' + sg(o.ex, 1) + 'p</b> · 낙폭은 ' + Math.abs((o.mdd || 0) - (so.mdd || 0)).toFixed(0) + '%p 작게' + (ii.ex != null ? ' · 규칙 고른 2008~2016에서도 ' + sg(ii.ex, 1) + 'p' : '') + '</p>';
      if (bt.yr){
        var ys = Object.keys(bt.yr).filter(function(y){ return y >= "2017"; });
        var mx = Math.max.apply(null, ys.map(function(y){ return Math.max(Math.abs(bt.yr[y][0]), Math.abs(bt.yr[y][1])); }).concat([1]));
        h += '<div class="cn-yr">' + ys.map(function(y){ var a = bt.yr[y][0], b2 = bt.yr[y][1], w = a >= b2;
          return '<div><span>' + y.slice(2) + '</span><i class="a ' + (a < 0 ? "m" : "") + '" style="height:' + (Math.abs(a) / mx * 34).toFixed(0) + 'px"></i><i class="b" style="height:' + (Math.abs(b2) / mx * 34).toFixed(0) + 'px"></i><em class="' + (w ? "w" : "l") + '">' + (w ? "●" : "○") + '</em></div>'; }).join("") + '</div>' +
          '<div class="cn-lg"><span><i class="a"></i>🎯 규칙</span><span><i class="b"></i>S&P500</span><span>● 이긴 해</span></div>';
      }
    }
    h += '</details><details class="cn-d"><summary>왜 이 규칙인가 · 규칙 그대로</summary><p>' +
      '「강한 섹터 2~3개에 몰기」는 2017년 이후 576가지 조합 중 2~7%만 S&P를 이겼어요(섹터를 늦게 타고 늦게 내림 + 비용). 지는 가장 큰 이유는 상승장에서도 현금·금을 크게 들고 있는 것이었어요. ' +
      '그래서 「섹터」가 아니라 「시장에 싣는 양」에 집중합니다. 상승장 판정은 평균 수익을 올리기보다 나쁜 꼬리(20일 최악 10%: −3.6% vs −7%)를 절반으로 줄여요.</p>' +
      '<p><b>판정</b> ' + e(CN.rule.judge) + '<br>' + e(CN.rule.on) + '<br>' + e(CN.rule.off) + '<br><small>' + e(CN.rule.how) + '</small></p>' +
      ((R.flips || []).length ? '<p><b>판정이 바뀐 날</b><br>' + R.flips.map(function(f){ return (f.up ? "🟢 " : "🔴 ") + e(f.d); }).join(" · ") + '</p>' : '') +
      '<p class="mut">' + e(CN.note) + ' 계산 ' + e(CN.at) + '</p></details></section>';
    return h;
  }

  function kickHtml(){
    var ks = K.stat, d = ks.kick - ks.base, rows2;
    var h = '<div class="sec">⚡ 킥 칸 속 <small class="mut">킥 포트에만 있는 ' + Math.round((((K.rules || {}).sleeve || 0) + ((K.rules || {}).whale_sleeve || 0)) * 100) + '% · 기본 포트보다 ' + sg(d) + 'p</small></div><section class="card po-vs">' +
      '<div class="po-ks">' + (K.whale ? '<span>🐋 들어온 고래 종목 <b class="' + cls(K.whale.ret) + '">' + sg(K.whale.ret) + '</b></span><span>☕📈 돌파 종목 <b class="' + cls(K.sleeve) + '">' + sg(K.sleeve) + '</b></span>' : '<span>슬리브 <b class="' + cls(K.sleeve) + '">' + sg(K.sleeve) + '</b></span>') + '<span>자리 <b>' + ks.slots + '</b></span><span>끝난 거래 <b>' + ks.trades + '</b>' +
      (ks.win != null ? ' · 이긴 비율 <b>' + ks.win + '%</b>' : '') + '</span>' + (ks.avg_win != null ? '<span>이길 때 <b class="up">' + sg(ks.avg_win, 1) + '</b> · 질 때 <b class="dn">' + sg(ks.avg_loss, 1) + '</b></span>' : '') +
      (ks.paused ? '<span class="warn">⛔ 브레이크 중 (새 진입 멈춤)</span>' : '') + '</div>';
    if (K.rule && K.rule.base_now){
      var R = K.rule, P0 = {}; P.hold.forEach(function(x){ P0[x.name] = x.pct; });
      var cashN = Object.keys(R.base_now).filter(function(n){ return /현금/.test(n); })[0];
      h += '<div class="po-rule"><b>🧪 ' + md(R.from) + '부터 킥 포트 규칙</b> <small>검증을 통과한 것만 · 💼 기본 포트(리포트 그대로)와 S&P500에 견줘요</small>' +
        '<div>① 현금 = 국면 「' + e(R.quad || "") + '」 → <b>' + R.cash + '%</b>' + (cashN ? ' <span class="mut">(리포트 ' + P0[cashN] + '%)</span>' : '') + '</div>' +
        '<div>② 🐋 고래 바스켓 <b>' + Math.round((R.whale_sleeve || 0) * 100) + '%</b> <span class="mut">(전 6%)</span> · 돌파 ' + Math.round(((K.rules || {}).sleeve || 0) * 100) + '%</div>' +
        '<div class="mut">③ 강한 칸 기울이기 · ④ 추세 브레이크는 2008년~ 검증에서 효과가 없어 꺼 둠 · 📊 실적 갭은 그림자 채점부터</div>' +
        '<div class="po-rl" data-goto="score~scrbt">검증 결과 보기 ›</div></div>';
    }
    // 🛑 10/22 신호별 손실 한도 — 정상이면 아무것도 안 보임, 걸렸을 때만 작은 꼬리표
    var GN = (K.guard || {}).now || {}, GR = (K.guard || {}).rule || {};
    function gTag(k){ var g = GN[k]; if (!g || g.mult == null || g.mult >= 1) return '';
      return ' <small class="' + (g.mult === 0 ? 'dn' : 'warn') + '" data-tip="' + e("🛑 신호별 손실 한도 — 이 신호의 끝난 거래 장부가 고점 대비 " + g.dd + "% · " + (GR.doc || "")) + '">' + (g.mult === 0 ? '🛑 멈춤' : '✂ ½') + '</small>'; }
    if (K.proof) h += '<div class="po-pf3">' + [["whale", "🐋 고래"], ["cup", "☕ 컵"], ["gap", "📈 갭"], ["earn", "📊 실적 갭"], ["trend", "🧭 추세"], ["pead", "📊 실적 표류"], ["nh52", "🏔 신고가"], ["dip", "🩹 급락 반등"]].filter(function(x){ return K.proof[x[0]]; }).map(function(x){ var p = K.proof[x[0]] || {}; var ID = (K.ideas || {})[x[0]]; if (ID && !ID.on) p = Object.assign({}, p, {on: false, trial: false, n: null, shadow: ID.state});
      var ho = p.honest, ht = ho && ho.n && ho.avg != null ? "<br>🧾 정직 " + (ho.avg > 0 ? "+" : "") + ho.avg.toFixed(1) + "% · " + ho.n + "건" + (ho.pf != null ? " · 손익비 " + ho.pf : "") + (ho.pf != null && ho.pf < 1.5 ? " ⚠ 정직 기준 미달" : "") + (ho.insample ? " · 같은 자료로 맞춘 값" : "") : p.fixed ? "<br>4분기 표본·고정 판정" : "";
      return '<span class="' + (p.trial ? "trial" : p.on ? "on" : "wait") + '" data-tip="' + e((p.why || "") + ht) + '">' + x[1] + ' ' + (p.trial ? '🧪 시험 ½' : p.on ? '✓' : p.shadow ? (p.shadow === '❌' ? '❌ 기각' : '👻 그림자') : '⏳ ' + (p.n || 0) + '/20') + (ho && ho.n && ho.avg != null ? ' <small class="' + cls(ho.avg) + '">정직 ' + sg(ho.avg, 1) + '</small>' : '') + gTag(x[0]) + '</span>'; }).join("") + '</div>';
    if (K.shadow_stat && Object.keys(K.shadow_stat).length) h += '<div class="po-itn" style="padding-left:0">👻 못 들어온 신호도 「들어갔다면」으로 계속 채점 — ' + Object.keys(K.shadow_stat).map(function(k){ var v = K.shadow_stat[k];
      return e(v.tag || k) + ' ' + v.n + '건 평균 ' + sg(v.avg, 1); }).join(" · ") + ' (20건·손익비 1.5 넘으면 자동 편입)</div>';
    var HL = kHold();
    h += '<div class="po-kh">지금 들고 있는 것 <small>' + HL.length + '종목</small></div>' + (HL.length ? HL.map(function(o){
      return '<div class="po-kp" data-op="' + e(o.code) + '"><div><span class="po-tg">' + e(o.tags || "") + '</span> <b>' + e(nm(o.name)) + ' <i class="po-go">›</i></b> <small>' + e(o.code) + ' · ' + (Math.round(o.w * 10) / 10) + '%</small>' + (o.half ? ' <span class="po-sg w">절반 익절</span>' : '') +
        '<em>' + md(o.d0) + ' 진입 ' + pr(o.entry) + ' · ' + e(o.rule || "") + (o.by && o.by.length ? ' · ' + e(o.by.join(", ")) : '') + '</em></div><b class="' + cls(o.r) + '">' + sg(o.r, 1) + '<small class="po-cw">' + (o.r >= 0 ? "+" : "−") + won(Math.abs(S.amt * o.w / 100 * o.r / 100)) + '원</small></b></div>'; }).join("")
      : '<div class="po-itn">빈 자리 — 확인된 신호를 기다리는 중</div>');
    if (K.park && K.park.on) h += '<div class="po-itn" style="padding-left:0">🅿️ 빈 자리 ' + (K.park.w != null ? '<b>' + (Math.round(K.park.w * 10) / 10) + '%</b> ' : '') + '는 현금 대신 💼 기본 칸과 똑같이(S&P·나스닥 비중 그대로) 담아 둬요 — 신호가 오면 그만큼 지수를 팔아 사요 (' + md(K.park.from) + '부터)</div>';
    if (K.tags) h += '<p class="po-itn" style="padding-left:0">' + Object.keys(K.tags).map(function(k){ return k + ' ' + e(K.tags[k]); }).join(" · ") + '</p>';
    if (K.closed.length) h += '<div class="po-kh">끝난 거래</div>' + K.closed.slice(0, 8).map(function(c){
      return '<div class="po-kp" data-op="' + e(c.code) + '"><div><b>' + e(nm(c.name)) + ' <i class="po-go">›</i></b> <small>' + e(c.code) + '</small><em>' + md(c.d0) + '→' + md(c.d1) + ' · ' + c.days + '일 · ' + e(c.why) + '</em></div><b class="' + cls(c.r) + '">' + sg(c.r, 1) + '</b></div>'; }).join("");
    h += '<p class="note">' + e(K.note) + '</p></section>';
    return h;
  }
  function copy(){
    var t;
    if (S.hv){   // A11-4: 바꿀 것만 복사
      var ls = []; pplan().forEach(function(p){ p.items.forEach(function(it){ if (it.sh == null) return; var d = hvDiff(it); if (d == null) ls.push("· " + it.nm + " " + it.sh + "주 (지금 주 수 안 넣음)"); else if (d) ls.push("· " + it.nm + " " + (d > 0 ? "+" + d + "주 사기" : "−" + (-d) + "주 팔기")); }); });
      var inPlan = {}; pplan().forEach(function(p){ p.items.forEach(function(x){ inPlan[x.code] = 1; }); });
      Object.keys(S.have).forEach(function(c){ if (!inPlan[c] && hvQty(c) > 0) ls.push("· " + c + " −" + hvQty(c) + "주 팔기 (배분표에 없음)"); });
      t = "💼 CH Investing 포트 바꿀 것만 (" + md(P.changes[0] && P.changes[0].date) + " 배분표 · 투자금 " + won(S.amt) + "원)\n" + (ls.length ? ls.join("\n") : "· 바꿀 것 없음 ✓") + "\n※ 매수 추천 아님 · 리포트 배분표와 내 보유분의 차이 계산";
    } else
    t = "💼 CH Investing 포트 따라하기 (" + md(P.changes[0] && P.changes[0].date) + " 배분표 · 투자금 " + won(S.amt) + "원)" + (bearOn() ? " · 🐻 하락장 규칙 겹친 것(" + bearHead() + ")" : "") + "\n" +
      pplan().filter(function(p){ return p.x.pct > 0; }).map(function(p){ return "· " + p.x.name + " " + p.x.pct + "% (" + won(p.amt) + "원): " + p.items.map(function(it){ return it.nm + (it.sh != null ? " " + it.sh + "주" : ""); }).join(", "); }).join("\n") +
      (bearOn() ? "\n※ 🐻 보기 전용 겹침 — 시장마다 그 시장 칸에만 계기판 현금 권고(🇰🇷 하락장 100% · 🇺🇸 꺼 둠)(배분표 규칙은 그대로)" : "") + "\n※ 매수 추천 아님 · 리포트 배분표를 그대로 옮긴 계산";
    var ok = function(){ var s = document.getElementById("pocpst"); if (s){ s.textContent = "복사됐어요 ✓"; setTimeout(function(){ s.textContent = ""; }, 2500); } };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok).catch(function(){ prompt("복사하세요", t); });
    else prompt("복사하세요", t);
  }

  var css = document.createElement("style");
  css.textContent =
    ".po-brt button.on{background:rgba(255,140,40,.18);box-shadow:inset 0 0 0 1.5px rgba(255,140,40,.6);color:var(--text)}" +
    ".po-bc{box-shadow:inset 3px 0 0 #ff8c28}.po-bc .pct s,.po-r .v s{opacity:.55;font-weight:600}.po-bcn{font-size:12.5px;font-weight:700;color:#d9731a;margin:2px 0 4px;word-break:keep-all}.po-bcv{color:#d9731a}" +
    ".po-brs{margin:10px 0 2px;padding:12px;border-radius:12px;background:rgba(255,140,40,.09);box-shadow:inset 0 0 0 1px rgba(255,140,40,.35)}.po-brh{font-size:14.5px;font-weight:900}.po-brh small{font-size:12px;color:var(--sub);font-weight:600;margin-left:4px}" +
    ".po-brw b{color:#d9731a}.po-brn{font-size:15px;margin:6px 0}.po-brn small{color:var(--sub)}.po-brs ul{margin:4px 0 6px;padding-left:18px;font-size:13px;line-height:1.55;word-break:keep-all}.po-brs p{margin:4px 0 0;font-size:12.5px;color:var(--sub);line-height:1.5;word-break:keep-all}.po-brs .po-brt2{font-weight:700}" +
    ".po-hero{background:linear-gradient(160deg,rgba(233,196,106,.16),rgba(18,24,38,.4) 60%);border:1px solid var(--line);border-radius:18px;padding:16px 14px;margin-bottom:6px}" +
    ".po-hon{margin:-2px 0 6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.po-hon small{font-size:12.5px;color:var(--sub)}.po-lbs .hon-chip{display:flex;width:max-content;margin:2px 0 0;font-size:12.5px}" +
    ".po-k{font-size:13px;color:var(--sub)}.po-big{font-size:44px;font-weight:900;letter-spacing:-1px;line-height:1.1;margin:4px 0}" +
    ".po-sub{font-size:13.5px;color:var(--sub)}.po-sub b{color:var(--text)}" +
    ".po-cmp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 8px}.po-cmp>div{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px}" +
    ".po-cmp small{display:block;font-size:12.5px;color:var(--sub)}.po-cmp b{font-size:16px}.po-cmp em{display:block;font-style:normal;font-size:12.5px;margin-top:2px}" +
    ".po-ksum{font-size:12.5px;color:var(--sub);margin:2px 0 8px}" +
    ".po-kg{display:grid;grid-template-columns:1fr 1fr;gap:6px}" +
    ".po-kc{display:flex;align-items:center;gap:4px;min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:7px 8px;cursor:pointer}" +
    ".po-kc i{font-style:normal;font-size:12.5px;flex:none}.po-kc b{font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".po-kc small{flex:none;font-size:12.5px;font-weight:700}.po-k0{color:var(--sub);font-weight:400;font-size:12.5px}" +
    ".po-kl{font-size:12.5px;color:var(--accent,#e9c46a);margin-top:8px;cursor:pointer}" +
    "em.w{color:#4dd47a;font-style:normal}em.l{color:#8a94a8;font-style:normal}" +
    ".po-ch{margin-top:6px}.po-w{font-size:12.5px;color:var(--sub);margin-top:4px}" +
    ".po-follow .dn-w{margin-bottom:10px}.po-in label{font-size:13px;color:var(--sub)}" +
    ".po-amt{display:flex;align-items:center;gap:6px;margin-top:4px}.po-amt input{flex:1;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:10px 12px;font:inherit;font-size:22px;font-weight:800;text-align:right;min-width:0}" +
    ".po-q,.po-mode{display:flex;gap:6px;margin-top:8px}.po-q button,.po-mode button{flex:1;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 4px;font:inherit;font-size:13px;cursor:pointer}" +
    ".po-mode button.on{background:#e9c46a;color:#111;border-color:transparent;font-weight:800}" +
    ".po-r{border-top:1px solid var(--line);padding:10px 0}.po-r:first-child{margin-top:12px}" +
    ".po-rh{display:flex;align-items:center;gap:7px}.po-rh i{width:10px;height:10px;border-radius:3px;flex:none}.po-rh b{flex:1;font-size:15px}.po-rh .pct{color:var(--sub);font-size:13px}.po-rh .am{font-weight:800;min-width:64px;text-align:right}" +
    ".po-it{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;padding:4px 0 0 17px}.po-it .tk small{color:var(--dim)}.po-it .v{color:var(--sub);white-space:nowrap}.po-it .v b{color:var(--text)}" +
    ".po-hv{display:flex;align-items:center;gap:8px;margin:8px 0 2px;flex-wrap:wrap}.po-hv button{font:inherit;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text)}.po-hv button.on{background:#4dd47a;color:#0b0f17;border-color:transparent}.po-hv small{font-size:12.5px;color:var(--sub)}" +
    ".po-hvl{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:var(--sub);padding:3px 0 2px 17px}.po-hin{width:52px;font:inherit;font-size:14px;font-weight:800;text-align:right;padding:3px 6px;margin:0 3px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--text)}.po-hvl .hv-d{white-space:nowrap;min-width:0}.po-hvl .hv-d small{font-size:12px;white-space:normal;word-break:keep-all;display:block;text-align:right}.hv-b{color:#4dd47a}.hv-s{color:#e66767}.hv-k{color:var(--sub)}" +
    ".po-hvx{margin-top:10px;padding:8px 10px;border-radius:10px;background:rgba(230,103,103,.08);font-size:12.5px;line-height:1.7}.po-hvx .hv-rm{font:inherit;font-size:12.5px;border:0;background:transparent;color:var(--dim);padding:0 2px}.po-hvs{margin-top:8px;font-size:13px;font-weight:800;text-align:right}.po-hvs small{font-weight:600;color:var(--sub)}" +
    ".po-cp{display:flex;align-items:center;gap:10px;margin-top:10px}.po-cp span{font-size:13px;color:#4dd47a}" +
    ".po-tli{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px}.po-tli:last-of-type{border-bottom:0}.po-tli .d{font-weight:800;min-width:42px}.po-tli em{background:#e9c46a;color:#111;border-radius:6px;padding:0 6px;font-style:normal;font-size:12.5px;font-weight:800}" +
    ".po-cr{display:grid;grid-template-columns:1fr 34% 58px;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}.po-cr:last-child{border-bottom:0}" +
    ".po-cr .n{font-size:13.5px}.po-cr .n i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}.po-cr .n small{color:var(--sub)}.po-cr .n em{display:block;font-style:normal;font-size:12.5px;color:var(--dim)}" +
    ".po-cr .bar{position:relative;height:10px;background:var(--panel2);border-radius:5px}.po-cr .bar span{position:absolute;top:0;bottom:0;border-radius:5px}" +
    ".po-cr .bar .p{left:50%;background:#e66767}.po-cr .bar .m{right:50%;background:#3987e5}.po-cr>b{text-align:right;font-size:13px}" +
    ".po-sg{font-size:12.5px;font-weight:800;border-radius:5px;padding:0 5px;margin-left:3px}.po-sg.g{background:rgba(77,212,122,.18);color:#4dd47a}.po-sg.b{background:rgba(57,135,229,.2);color:#7cb0ff}.po-sg.w{background:rgba(255,184,77,.18);color:#ffb84d}.po-cr .n em.sgt{color:var(--sub)}" +
    ".po-vs2{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:6px;margin-bottom:8px}.po-vs2>div{background:var(--panel2);border-radius:12px;padding:8px;text-align:center}.po-vs2>div.k{background:rgba(255,107,107,.13);border:1px solid rgba(255,107,107,.4)}" +
    ".po-vs2 small{display:block;font-size:12.5px;color:var(--sub)}.po-vs2 b{font-size:19px}.po-vs2 em{display:block;font-style:normal;font-size:12.5px}" +
    ".po-ks{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--sub);margin:6px 0}.po-ks b{color:var(--text)}.po-ks .warn{color:#ffb84d}" +
    ".po-kh{font-size:12.5px;font-weight:800;color:var(--sub);margin:12px 0 2px}.po-kp{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}.po-kp small{color:var(--dim)}.po-kp em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".po-itn{font-size:12.5px;color:var(--dim);padding:2px 0 0 17px}.po-rk{background:rgba(255,107,107,.06);border-radius:10px;padding:10px 6px}" +
    ".po-mx table{width:100%;border-collapse:collapse;font-size:12.5px}.po-mx td,.po-mx th{white-space:nowrap}.po-mx th{font-size:12.5px;color:var(--sub);font-weight:600;text-align:right;padding:3px}.po-mx th:first-child{text-align:left}" +
    ".po-mx td{text-align:right;padding:8px 3px;border-top:1px solid var(--line);vertical-align:top}.po-mx td:first-child{text-align:left;font-weight:800;white-space:nowrap}.po-mx td small{display:block;font-weight:400;font-size:12.5px;color:var(--sub)}" +
    ".po-sra{font-style:normal;font-size:12px;color:var(--sub);margin-left:2px}.po-sr.op{background:color-mix(in srgb,#e9c46a 10%,var(--panel2))}" +
    ".po-hb{margin:2px 0 8px;padding:10px;border-radius:12px;background:var(--panel2);border:1px solid var(--line)}.po-hbh{font-size:13.5px;margin-bottom:6px}.po-hbh small{display:block;font-size:12px;color:var(--sub)}" +
    ".po-hbbar{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1px;margin:0 0 6px}.po-hbbar i{display:block}" +
    ".po-hbr{padding:6px 0;border-top:1px solid var(--line)}.po-hbr:first-of-type{border-top:0}.po-hbc{display:flex;align-items:center;gap:6px;font-size:13.5px}.po-hbc i{width:9px;height:9px;border-radius:2px;flex:none}.po-hbc b{flex:1;min-width:0}.po-hbc span{font-weight:800;font-variant-numeric:tabular-nums}" +
    ".po-hbl{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 0 15px}.po-hbi{display:inline-flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:3px 7px;font-size:12.5px;line-height:1.3;cursor:pointer}.po-hbi small{font-size:11.5px;color:var(--sub)}.po-hbe{font-size:12.5px;color:var(--sub)}" +
    ".po-hbx{display:block;margin:8px auto 0;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:6px 18px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".po-mx td em{display:block;font-style:normal;font-size:12.5px}.po-mx tr[data-pf]{cursor:pointer}.po-mx tr.on td{background:rgba(233,196,106,.08)}.po-mx tr.mkt td{color:var(--sub);font-size:12.5px}" +
    ".po-cbuy{margin:10px 0 8px;padding:10px 12px;border-radius:14px;background:rgba(77,212,122,.08);border:1px solid rgba(77,212,122,.35)}.po-cbh{font-weight:800;font-size:14px}.po-cbh small{font-weight:400;color:var(--sub);font-size:12.5px;margin-left:4px}.po-cbuy .cn-buy:last-of-type{border-bottom:0}.po-cbn{font-size:12.5px;color:var(--sub);margin-top:4px}" +
    ".cn-buy{display:flex;align-items:center;gap:10px;padding:10px 2px;border-bottom:1px solid var(--line);cursor:pointer}.cn-buy .pct{font-size:18px;min-width:46px}.cn-buy .nm{flex:1;min-width:0;font-weight:700}.cn-buy .nm small{display:block;font-weight:400;color:var(--sub);font-size:12.5px;margin-top:2px}.cn-buy .q{text-align:right}.cn-buy .q b{font-size:17px;display:block}.cn-buy .q small{color:var(--sub);font-size:12.5px}.cn-vr{margin:8px 0 2px;font-size:12.5px}.cn-vr small{color:var(--sub);margin-left:4px}.cn-n2{font-size:12.5px;color:var(--sub);margin:6px 0 8px}.cn-d>summary{cursor:pointer;font-size:13px;font-weight:700;padding:8px 0}" +
    ".my-pk{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px}.my-pk button{border:1px solid var(--line);background:transparent;color:var(--sub);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px}.my-pk button.on{color:var(--text);border-color:#38bdf8;background:rgba(56,189,248,.14)}" +
    ".po-vr{margin:4px 0 6px;font-size:12.5px;color:var(--text)}.po-vr small{color:var(--sub);margin-left:4px}.po-pf2{margin:12px 0 8px}.po-hero.kick{background:linear-gradient(160deg,rgba(255,107,107,.16),rgba(18,24,38,.4) 60%)}.po-hero.conc{background:linear-gradient(160deg,rgba(77,212,122,.16),rgba(18,24,38,.4) 60%)}.po-hero.mine{background:linear-gradient(160deg,rgba(244,114,182,.16),rgba(18,24,38,.4) 60%)}" +
    ".po-go{font-style:normal;color:var(--c,#e9c46a);font-weight:800;margin-left:2px}.po-it[data-op],.po-kp[data-op],.po-tk{cursor:pointer}.po-tk{text-decoration:underline dotted;text-underline-offset:2px;color:var(--text)}" +
    ".po-it[data-op]:active,.po-kp[data-op]:active{background:rgba(255,255,255,.05)}" +
    ".po-lbs button{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;min-width:0;overflow:hidden}.po-lbs .po-big{font-size:20px;line-height:1.2;white-space:nowrap}" +
    ".po-lbs .po-hs{display:block;width:100%;min-height:20px;margin:3px 0 6px}.po-lbs .po-hs .hon-chip{background:none!important;border:0!important;padding:0!important;display:inline-flex;align-items:center;gap:3px;width:auto;max-width:100%;margin:0;font-size:12.5px;white-space:nowrap;overflow:hidden}" +
    ".po-lbs .po-hs .hon-chip b{font-size:12.5px!important;line-height:1}.po-lbs .po-hs .hon-chip i{font-style:normal;opacity:.7}.po-lbs .po-hn{font-size:12.5px;color:var(--sub);white-space:nowrap}" +
    ".po-lbs em{margin-top:auto!important;width:100%;white-space:nowrap}.po-lbs em b{font-size:12.5px!important}" +
    ".po-lbs{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:6px}.po-lbs button{text-align:left;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:12px;padding:8px 10px;font:inherit;cursor:pointer}" +
    ".po-lbs button.on{border-color:#e9c46a;background:rgba(233,196,106,.1)}.po-lbs button.k.on{border-color:#ff6b6b;background:rgba(255,107,107,.1)}.po-lbs small{display:block;font-size:12.5px;color:var(--sub)}.po-lbs b{font-size:20px}" +
    ".po-lbs em{display:block;font-style:normal;font-size:12.5px;color:var(--sub);margin-top:2px}.po-lbs em b{font-size:12.5px;color:var(--text)}.po-wbar{display:block;height:5px;border-radius:3px;background:var(--panel);margin:3px 0 2px;overflow:hidden}.po-wbar i{display:block;height:100%;background:#4dd47a}" +
    ".cn-rg{border-radius:12px;padding:10px 12px;margin-bottom:10px}.cn-rg.g{background:rgba(77,212,122,.12)}.cn-rg.r{background:rgba(255,107,107,.12)}.cn-l{font-weight:800;font-size:17px}.cn-s{font-size:12.5px;color:var(--sub);margin-top:3px}.cn-w{font-size:12.5px;color:#ffb84d;margin-top:4px}" +
    ".cn-h{font-weight:800;font-size:13.5px;margin:12px 0 6px}.cn-h small{font-weight:400;color:var(--sub);font-size:12.5px;margin-left:4px}" +
    ".cn-r{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--line)}.cn-r>b{font-size:17px;min-width:44px}.cn-r>span{flex:1;font-size:14px}.cn-r small{display:block;color:var(--sub);font-size:12.5px}.cn-r em{font-style:normal;font-weight:700;font-size:13px}" +
    ".cn-v{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}.cn-v div{background:var(--panel2);border-radius:9px;padding:6px 2px;text-align:center}.cn-v div.me{outline:2px solid #4dd47a}.cn-v small{display:block;font-size:12.5px;color:var(--sub)}.cn-v b{font-size:13px}" +
    ".cn-t{width:100%;border-collapse:collapse;font-size:12.5px}.cn-t th{color:var(--sub);font-weight:400;text-align:right;padding:4px}.cn-t td{text-align:right;padding:5px 4px;border-top:1px solid var(--line)}.cn-t td:first-child,.cn-t th:first-child{text-align:left}.cn-t tr.me td{font-weight:800}.cn-t small{color:var(--sub);font-weight:400}" +
    ".cn-n{font-size:12.5px;margin:6px 0 0}.cn-yr{display:flex;gap:3px;align-items:flex-end;margin-top:10px;height:62px}.cn-yr div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:1px;position:relative}" +
    ".cn-yr i{display:block;width:40%;border-radius:2px}.cn-yr i.a{background:#4dd47a}.cn-yr i.a.m{background:#4dd47a;opacity:.4}.cn-yr i.b{background:#7c9cff;opacity:.6}.cn-yr div{flex-direction:row;align-items:flex-end}.cn-yr span{position:absolute;bottom:-14px;font-size:12.5px;color:var(--sub)}.cn-yr em{position:absolute;top:-2px;font-size:8px;font-style:normal}.cn-yr em.w{color:#4dd47a}.cn-yr em.l{color:var(--sub)}" +
    ".cn-lg{display:flex;gap:12px;font-size:12.5px;color:var(--sub);margin-top:18px}.cn-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:3px;vertical-align:-1px}.cn-lg i.a{background:#4dd47a}.cn-lg i.b{background:#7c9cff;opacity:.6}" +
    ".cn-d{margin-top:10px;font-size:12.5px}.cn-d summary{cursor:pointer;color:var(--acc);font-weight:700}.cn-d p{margin:6px 0;line-height:1.55}" +
    ".po-chips{display:flex;gap:5px;overflow-x:auto;margin:10px 0 4px;scrollbar-width:none}.po-chips::-webkit-scrollbar{display:none}.po-chips button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;cursor:pointer}.po-chips button.on{background:var(--text);color:var(--bg,#111);border-color:transparent;font-weight:800}" +
    ".po-rr{display:grid;grid-template-columns:16px minmax(0,1fr) 14% 54px 58px;align-items:center;gap:6px;padding:7px 2px;border-bottom:1px solid var(--line);font-size:13.5px;cursor:pointer}.po-rr:last-child{border-bottom:0}" +
    ".po-rr .no{font-size:12.5px;color:var(--dim);text-align:right}.po-rr .n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.po-rr .n small{display:block;font-size:12.5px;color:var(--dim);white-space:normal;line-height:1.3}" +
    ".po-rr .dot{display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid var(--dim);margin-right:5px;vertical-align:0}.po-rr.sel .dot{border-color:transparent}" +
    ".po-rr .bar{position:relative;height:9px;background:var(--panel2);border-radius:5px}.po-rr .bar span{position:absolute;top:0;bottom:0;border-radius:5px}.po-rr .bar .p{left:50%;background:#e66767}.po-rr .bar .m{right:50%;background:#3987e5}" +
    ".po-rr .bar.z::before{content:\"\";position:absolute;left:50%;top:-2px;bottom:-2px;width:1.5px;background:var(--sub);opacity:.7}.po-rr .bar.z .m{background:#4dd47a}.po-rr .bar.z .p{background:#e66767}.po-rr .bar .ov{position:absolute;top:-6px;font-size:13px;font-weight:900;color:var(--sub);line-height:1}.po-rr .bar .ov.r{right:-2px}.po-rr .bar .ov.l{left:-2px}" +
    ".po-rkh{display:inline-flex;align-items:center;gap:6px;margin-left:auto;margin-right:10px;font-size:12.5px}.po-rkh em{font-style:normal;color:var(--sub)}.po-rkh em.w{color:#4dd47a}.po-rkh em.l{color:var(--dim)}.po-rks{display:block}" +
    ".po-rr .v{text-align:right;font-size:13px}.po-rr .d{text-align:right;font-size:12.5px}.po-rr .d.w{color:#4dd47a}.po-rr .d.l{color:var(--dim)}" +
    ".po-rr.me{background:rgba(233,196,106,.1);border-radius:10px;border-bottom-color:transparent;margin:2px 0}.po-rr.me.k{background:rgba(255,107,107,.1)}.po-rr.me.on{outline:1.5px solid #e9c46a}.po-rr.me.k.on{outline-color:#ff6b6b}" +
    ".po-cmp.n4{grid-template-columns:repeat(2,1fr)}.po-cmp.n1{grid-template-columns:1fr}.po-cmp.n2{grid-template-columns:repeat(2,1fr)}" +
    ".po-pe details{border-bottom:1px solid var(--line);padding:8px 0}.po-pe details:last-of-type{border-bottom:0}.po-pe summary{cursor:pointer;font-size:14px;list-style:none}.po-pe summary::-webkit-details-marker{display:none}.po-pe summary em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".po-per{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:6px 0 6px 6px;border-top:1px dashed var(--line);font-size:13.5px;cursor:pointer}.po-per .n small{display:block;font-size:12.5px;color:var(--dim)}" +
    ".po-per .r{text-align:right}.po-per .r small{display:block;font-size:12.5px;color:var(--sub)}.po-per.mine{background:rgba(77,212,122,.07);border-radius:8px}.po-fx{color:var(--dim)}" +
    ".po-cr .n em.pvs{color:var(--sub)}.po-cr .n em.pvs b.w{color:#4dd47a}.po-cr .n em.pvs b.l{color:#ff8a8a}" +
    ".po-pe details .po-per.more{display:none}.po-pe details.all .po-per.more{display:grid}.po-more{display:block;width:100%;margin-top:6px;border:1px dashed var(--line);background:none;color:var(--sub);border-radius:8px;padding:6px;font:inherit;font-size:12.5px;cursor:pointer}" +
    ".po-per.nb .n{opacity:.8}.po-sg.n{background:rgba(138,148,168,.18);color:#aab3c5}" +
    ".po-rule{background:rgba(124,156,255,.08);border:1px solid rgba(124,156,255,.25);border-radius:12px;padding:10px 12px;margin:8px 0;font-size:13px;line-height:1.6}.po-rule>b{font-size:13.5px}.po-rule small{display:block;color:var(--sub);font-size:12.5px;margin-bottom:4px}.po-rl{color:var(--c,#e9c46a);font-weight:700;margin-top:4px;cursor:pointer}" +
    ".po-pf3{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 2px}.po-pf3 span{font-size:12.5px;border-radius:999px;padding:3px 9px;border:1px solid var(--line)}.po-pf3 .on{background:rgba(77,212,122,.12);color:#4dd47a;border-color:transparent}.po-pf3 .wait{color:var(--sub)}.po-pf3 .trial{background:rgba(255,184,77,.14);color:#ffb84d;border-color:transparent}" +
    ".po-tg{font-size:13px;letter-spacing:-1px}" +
    ".po-won{font-size:14px;margin:2px 0 4px}.po-won b{font-size:16px}.po-won small{display:block;color:var(--sub);font-size:12.5px}" +
    ".po-cw{display:block;font-size:12.5px;font-weight:600;opacity:.85}" +
    ".po-ctg{display:flex;align-items:center;gap:6px;margin:10px 0 4px}.po-ctg button{font:inherit;font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--sub)}.po-ctg button.on{background:var(--text);color:var(--bg);border-color:transparent}.po-ctg small{margin-left:auto;font-size:12.5px;color:var(--sub)}" +
    ".po-mk{display:flex;gap:12px;font-size:12.5px;color:var(--sub);margin-top:2px}.po-mk i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}" +
        ".po-sum{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:12px 12px 6px;margin:4px 0 10px}" +
    ".po-win{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 2px 10px}.po-wl{font-size:12.5px;font-weight:800;color:var(--sub);margin-right:2px}" +
    ".po-win button{border:1px solid var(--line,#2a3142);background:transparent;color:var(--sub);border-radius:999px;padding:5px 10px;font-size:12.5px;cursor:pointer}.po-win button small{opacity:.7;font-size:12.5px}" +
    ".po-win button.on{background:var(--acc,#7c9cff);border-color:var(--acc,#7c9cff);color:#fff;font-weight:700}.po-wd input{border:1px solid var(--line,#2a3142);background:transparent;color:inherit;border-radius:8px;padding:4px 6px;font-size:12.5px;color-scheme:dark light}" +
    ".po-wn{flex-basis:100%;font-size:12.5px;color:var(--sub)}.po-wn b{color:#ffb84d}" +
    ".po-wdd summary{list-style:none;cursor:pointer;border:1px solid var(--line,#2a3142);color:var(--sub);border-radius:999px;padding:5px 10px;font-size:12.5px}.po-wdd summary::-webkit-details-marker{display:none}.po-wdd[open]{flex-basis:100%;display:flex;align-items:center;gap:8px}.po-wdd[open] summary{color:var(--text)}.po-wd input{font-family:inherit}" +
    /* 10/15 A11-3 문지르기 */
    ".po-scr{margin-top:12px;padding:12px 12px 10px;border-radius:14px;background:var(--panel2);border:1px solid var(--line)}.po-scrh{font-size:13px;font-weight:800}.po-scrh small{font-weight:400;font-size:12.5px;color:var(--sub);margin-left:4px}" +
    "#poscrr{-webkit-appearance:none;appearance:none;width:100%;height:30px;background:transparent;margin:6px 0 0;cursor:pointer}" +
    "#poscrr::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(90deg,rgba(124,156,255,.25),rgba(124,156,255,.6))}#poscrr::-moz-range-track{height:6px;border-radius:3px;background:rgba(124,156,255,.4)}" +
    "#poscrr::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;margin-top:-10px;border-radius:50%;background:#fff;border:3px solid var(--acc,#7c9cff);box-shadow:0 2px 8px rgba(0,0,0,.35)}#poscrr::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid var(--acc,#7c9cff)}" +
    ".po-scrt{display:flex;justify-content:space-between;font-size:12.5px;color:var(--dim)}.po-scro{margin-top:6px}.po-scd{font-size:14px}.po-scd em{font-style:normal;font-weight:800;margin-left:4px}.po-scd em.w{color:#4dd47a}.po-scd em.l{color:#7cb0ff}" +
    ".po-scv{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:4px;font-size:13px;color:var(--sub)}.po-scv span{white-space:nowrap}.po-scv span.on{color:var(--text);font-weight:700}.po-scv b{font-variant-numeric:tabular-nums}" +
    /* 10/15 A11-4 내 선택 효과 */
    ".po-myfx{font-size:12.5px;color:var(--sub);padding:0 4px 8px 30px;margin-top:-4px}.po-myfx b{font-size:13.5px;margin:0 2px}.po-myfx b.w,.po-fx b.w,.po-fxr b.w{color:#4dd47a}.po-myfx b.l,.po-fx b.l,.po-fxr b.l{color:#7cb0ff}.po-myfx small{font-size:12.5px}" +
    ".po-fx{margin:8px 0 6px;padding:10px 12px;border-radius:12px;background:rgba(244,114,182,.08);border:1px solid rgba(244,114,182,.25)}.po-fxh{font-size:14px;font-weight:800;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px}.po-fxh b{font-size:18px}.po-fxh small{font-weight:400;font-size:12.5px;color:var(--sub)}" +
    ".po-fxd{font-size:12.5px;color:var(--sub);margin-top:3px}.po-fxb{margin-top:6px}.po-fxb summary{cursor:pointer;font-size:12.5px;color:var(--acc,#7c9cff);font-weight:700}" +
    ".po-fxr{display:grid;grid-template-columns:40px minmax(0,1fr) 64px;align-items:center;gap:8px;font-size:12.5px;padding:3px 0}.po-fxr span{color:var(--sub)}.po-fxr b{text-align:right;font-variant-numeric:tabular-nums}" +
    ".po-fxbar{position:relative;height:8px;background:var(--panel2);border-radius:4px}.po-fxbar::before{content:\"\";position:absolute;left:50%;top:-2px;bottom:-2px;width:1.5px;background:var(--sub);opacity:.6}.po-fxbar i{position:absolute;top:0;bottom:0;border-radius:4px}.po-fxbar i.g{left:50%;background:#4dd47a}.po-fxbar i.n{right:50%;background:#3987e5}" +
    /* 10/15 A11-5 등수 한 줄 띠 */
    ".po-rkb{background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:10px 12px}.po-rkbh{font-size:12.5px;font-weight:800;color:var(--sub)}.po-rkbh small{font-weight:400;font-size:12.5px;margin-left:4px}" +
    ".po-rkbr{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:5px;margin:7px 0 6px}.po-rkbr button{border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:6px 2px;font:inherit;font-size:12.5px;min-width:0;overflow:hidden;cursor:pointer;white-space:nowrap}.po-rkbr button b{font-size:16px;color:var(--text);margin:0 1px}.po-rkbr button.on{border-color:#e9c46a;background:rgba(233,196,106,.12);color:var(--text);font-weight:800}" +
    ".po-rkbs{font-size:12.5px;color:var(--sub);margin-top:2px}.po-rkbs b{color:var(--text)}.po-rkbs .w{color:#4dd47a}.po-rkbs .l{color:#7cb0ff}.po-rkbo{margin-top:6px;font-size:12.5px;color:var(--sub);display:flex;align-items:center;gap:6px;flex-wrap:wrap}" +
    ".po-sh{font-size:13px;font-weight:800;color:var(--sub);display:flex;justify-content:space-between;margin:0 2px 4px}.po-sh small{font-weight:400;font-size:12.5px}" +
    ".po-shb{margin-left:6px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:2px 9px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".po-sr{display:grid;grid-template-columns:1fr auto 92px;align-items:center;gap:10px;width:100%;background:none;border:0;border-top:1px solid var(--line);color:var(--text);font:inherit;padding:11px 4px;text-align:left;cursor:pointer;border-radius:0}" +
    ".po-sr:first-of-type{border-top:0}.po-sr>span{font-size:15px;font-weight:700}.po-sr>b{font-size:18px;font-weight:900;letter-spacing:-.3px}.po-sr>em{font-style:normal;font-size:12.5px;font-weight:800;text-align:right}" +
    ".po-sr>em.w{color:#4dd47a}.po-sr>em.l{color:#7cb0ff}.po-sr.on{background:rgba(233,196,106,.1);border-radius:12px;border-top-color:transparent}.po-sr.on+.po-sr{border-top-color:transparent}" +
    ".po-sr.kick.on{background:rgba(255,107,107,.1)}.po-sr.conc.on{background:rgba(77,212,122,.1)}.po-sr.sp{cursor:default;color:var(--sub)}.po-sr.sp>span{font-weight:500;font-size:13.5px}.po-sr.sp>b{font-size:15px;font-weight:700}.po-sr.sp>em{color:var(--dim);font-weight:400}" +
    ".po-gap{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:6px 0 2px}.po-gap small{width:100%;font-size:12.5px;color:var(--sub)}.po-gap b{font-size:44px;font-weight:900;letter-spacing:-1.2px;line-height:1.05}.po-gap em{font-style:normal;font-size:15px;font-weight:800}" +
    ".po-gap.w b,.po-gap.w em{color:#4dd47a}.po-gap.l b,.po-gap.l em{color:#7cb0ff}.po-rl2{font-size:14px;color:var(--sub);margin-bottom:6px}.po-rl2 b{font-size:15px}" +
    ".po-rank{display:flex;align-items:center;justify-content:space-between;margin:12px 2px 4px;font-size:13px}.po-rn{font-size:24px;font-weight:900;color:var(--text)}.po-rn small{font-size:12.5px;color:var(--sub);font-weight:600;margin-left:2px}" +
    ".po-gapr{text-align:center;color:var(--dim);font-size:13px;line-height:1;padding:2px 0;letter-spacing:3px}" +
    ".po-all{display:block;width:100%;margin-top:8px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:9px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}" +
    ".po-rr:not(.me) .bar span{background:var(--dim)!important;opacity:.45}.po-rr:not(.me):not(.sel) .v{font-weight:600}" +
    ".po-sb{display:flex;height:22px;border-radius:8px;overflow:hidden;gap:2px;margin:4px 0 8px}.po-sb i{display:block;min-width:4px;cursor:pointer}" +
    ".po-sbl{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;margin-bottom:12px}.po-sbl span{cursor:pointer;white-space:nowrap}.po-sbl span.z{color:var(--dim)}.po-sbl i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:0}" +
    ".po-follow .po-q button,.po-follow .po-mode button{padding:6px 2px;font-size:12.5px;border-radius:999px}.po-follow .po-mode{margin-top:6px}" +
    ".po-rcp{margin-top:14px;background:var(--panel2);border-radius:14px;padding:12px 12px 10px;border:1px dashed var(--line)}" +
    ".po-rch{font-weight:900;font-size:15px;display:flex;justify-content:space-between;align-items:baseline;padding-bottom:8px;border-bottom:2px solid var(--line)}.po-rch small{font-weight:600;font-size:12.5px;color:var(--sub)}" +
    ".po-rcp .po-r{border-top:1px dashed var(--line)}.po-rcp .po-r:first-child{margin-top:0;border-top:0}.po-rcp .po-rh .am{font-variant-numeric:tabular-nums}.po-rcp .po-it .v b{font-size:15px}" +
    ".po-rcp .po-cp{display:block;margin-top:10px;padding-top:10px;border-top:2px solid var(--line)}.po-rcp #pocopy{display:block;width:100%;padding:12px;font-size:15px;font-weight:900;border-radius:12px;background:#e9c46a;color:#111;border:0}.po-rcp .po-cp span{display:block;text-align:center;margin-top:6px}" +
    ".po-r.flash{animation:flash 1.6s ease}" +
    ".po-tl{position:relative;padding-left:18px!important}.po-tl:before{content:'';position:absolute;left:21px;top:20px;bottom:20px;width:2px;background:var(--line)}" +
    ".po-tli{position:relative;display:block;padding:8px 0 8px 18px;border-bottom:0;cursor:pointer}.po-tli:before{content:'';position:absolute;left:-1px;top:13px;width:10px;height:10px;border-radius:50%;background:var(--panel2);border:2px solid var(--dim)}" +
    ".po-tli.now:before{background:#e9c46a;border-color:#e9c46a;box-shadow:0 0 0 4px rgba(233,196,106,.2)}.po-tli .d{display:block;font-size:13px;min-width:0}" +
    ".po-tli .t{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;color:var(--sub);font-size:13px;margin-top:1px}.po-tli.open .t{-webkit-line-clamp:unset;color:var(--text)}" +
    ".po-tli .d:after{content:' ▾';color:var(--dim);font-weight:400;font-size:12.5px}.po-tli.open .d:after{content:' ▴'}" +
    ".po-vcs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}.po-vc{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;padding:7px 10px;font:inherit;font-size:12.5px;cursor:pointer;text-align:left}" +
    ".po-vc b{font-size:13px}.po-vc small{display:block;font-size:12.5px;color:var(--sub)}.po-vc.g{background:rgba(77,212,122,.12);border-color:rgba(77,212,122,.4)}.po-vc.g small{color:#4dd47a;font-weight:800}" +
    ".po-vc.b{background:rgba(57,135,229,.1);border-color:rgba(57,135,229,.35)}.po-vc.b small{color:#7cb0ff;font-weight:800}.po-vc.on{outline:2px solid var(--text)}" +
    ".po-vd{font-size:12.5px;color:var(--sub);line-height:1.6}.po-vd:not(:empty){background:var(--panel2);border-radius:10px;padding:8px 10px;margin:4px 0 6px}.po-vd b{color:var(--text)}" +
    ".po-stk{position:sticky;top:var(--hh,140px);z-index:6;margin:0 -16px 10px;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}" +
    ".po-stk .fold-jump{position:static!important;margin:0!important;background:none!important;backdrop-filter:none!important}" +
    ".po-mini{display:none;width:100%;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);font:inherit;font-size:11px;padding:6px 4px;gap:2px;justify-content:space-between;align-items:center;cursor:pointer;white-space:nowrap;overflow:hidden}" +
    ".po-stk.mini-on .po-mini{display:flex}.po-mini b{font-weight:900}.po-mini .sp{color:var(--sub)}.po-mini i{margin-left:0;flex:none;font-style:normal;color:var(--dim);font-size:12px}.po-mini span{flex:0 0 auto;letter-spacing:-.4px}@media(max-width:430px){.po-mini i{display:none}.po-mini span{letter-spacing:-.6px}}" +
    ".po-inf{padding:0!important;margin:0 0 10px}.po-inf>summary{list-style:none;cursor:pointer;padding:12px 14px;font-weight:800;font-size:14px;display:flex;justify-content:space-between;align-items:center}.po-inf>summary::-webkit-details-marker{display:none}" +
    ".po-inf>summary small{font-weight:400;color:var(--sub);font-size:12.5px}.po-inf>summary:after{content:'▾';color:var(--dim);margin-left:6px}.po-inf[open]>summary:after{content:'▴'}" +
    ".po-infb{padding:0 14px 12px;font-size:13.5px;line-height:1.65}.po-infb>div{padding:8px 10px;border-radius:10px;margin-top:6px;background:var(--panel2);border-left:3px solid #e9c46a}.po-infb>div.k{border-left-color:#ff6b6b}.po-infb>div.c{border-left-color:#4dd47a}.po-infb>div.m{border-left-color:#f472b6}.po-infb u{text-decoration:none;font-weight:800}" +
    ".po-sr.mine.on{background:rgba(244,114,182,.12)}.po-lbs.n4{grid-template-columns:repeat(2,minmax(0,1fr))}" +
    ".my-sv{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 8px}.my-sv::-webkit-scrollbar{display:none}.my-sv button{flex:none;font:inherit;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-sv button.on{background:#f472b6;border-color:#f472b6;color:#111}.my-sv button i{font-style:normal;font-size:12.5px;vertical-align:2px}.my-sv button.nw{border-style:dashed;color:var(--sub)}" +
    ".my-top{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;margin:0 0 8px}.my-top>b{font-size:16px}.my-top small.dt{color:#ffb84d;font-size:12.5px}.my-top small.ok{color:#4dd47a;font-size:12.5px}.my-acts{display:flex;gap:5px;margin-left:auto;flex-wrap:wrap}.my-acts button{font:inherit;font-size:12.5px;font-weight:700;padding:5px 10px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-acts button.pri{background:#f472b6;border-color:#f472b6;color:#111}" +
    ".my-sl{display:flex;flex-direction:column}.my-si{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--line)}.my-si .nm{flex:1;min-width:0}.my-si .nm b{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.my-si .nm small{display:block;font-size:12.5px;color:var(--sub)}.my-si .r{font-size:13.5px;min-width:50px;text-align:right}.my-wv{font-size:13px;font-weight:800;min-width:44px;text-align:right;color:#f472b6}" +
    ".my-x{height:28px;border-radius:8px;border:1px solid var(--line);background:none;color:var(--sub);font:inherit;font-size:12.5px;padding:0 9px;flex:none}.my-si.ed{flex-wrap:wrap}.my-ctl{display:flex;align-items:center;gap:8px;margin-left:auto}.my-si.ed .my-ctl{flex-basis:100%;justify-content:flex-end}" +
    ".my-sp{display:inline-grid;grid-template-columns:34px 58px 12px 34px;align-items:center;gap:4px}.my-sp.sm{grid-template-columns:28px 46px 10px 28px}.my-sp button{height:32px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:17px;font-weight:700;padding:0}.my-sp.sm button{height:28px;font-size:15px}.my-sp.sm .my-in{height:28px;font-size:13px}.my-sp b{font-size:12.5px;color:var(--sub)}" +
    ".my-seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}.my-seg button{font:inherit;font-size:12.5px;font-weight:700;padding:5px 14px;border:0;background:none;color:var(--sub)}.my-seg button.on{background:#f472b6;color:#111}" +
    ".my-edit{display:block;width:100%;margin:10px 0 2px;padding:11px;border-radius:12px;border:1px solid #f472b6;background:rgba(244,114,182,.1);color:var(--text);font:inherit;font-size:14px;font-weight:800}.my-edit.done{background:#f472b6;color:#111}" +
    ".my-add{position:relative}.my-add input[type=search]{width:100%;box-sizing:border-box;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);font:inherit;font-size:16px;padding:0 12px}" +
    ".my-res{display:flex;flex-direction:column;gap:2px;margin-top:4px}.my-res button{text-align:left;font:inherit;font-size:14px;padding:8px 10px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-res button small{color:var(--sub)}.my-res button[disabled]{opacity:.5}.my-hint{font-size:12.5px;color:var(--sub);padding:6px 2px}" +
    ".my-d0{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;margin-top:8px;font-size:13px;font-weight:700}.my-d0 input{font:inherit;font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text)}.my-d0 small{font-weight:400;color:var(--sub);font-size:12.5px}" +
    ".my-sb{display:flex;height:16px;border-radius:6px;overflow:hidden;gap:2px;margin:2px 0 6px}.my-sb i{display:block}.my-lg{font-size:12.5px;color:var(--sub);margin-bottom:6px}" +
    ".my-warn{font-size:12.5px;color:#ffb84d;background:rgba(255,184,77,.1);border-radius:8px;padding:6px 9px;margin:6px 0}" +
    ".my-h{font-weight:800;font-size:13.5px;margin:12px 0 6px;display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap}" +
    ".my-st{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:5px 0;border-top:1px dashed var(--line)}.my-st .n{font-size:14px;font-weight:700}.my-st .n i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px}" +
    ".my-in{width:100%;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);font:inherit;font-size:16px;font-weight:800;text-align:center;padding:0}" +
    ""+
    ".my-all{display:flex;gap:6px;align-items:center;margin-bottom:6px}.my-all button{font:inherit;font-size:12.5px;font-weight:700;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text)}.my-all small{margin-left:auto;color:var(--sub);font-size:12.5px}" +
    ".my-k{position:relative;display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 6px;border-top:1px solid var(--line);cursor:pointer;border-radius:10px}.my-k input{position:absolute;opacity:0;pointer-events:none}" +
    ".my-k .ck{width:24px;height:24px;border-radius:7px;border:2px solid var(--dim);display:flex;align-items:center;justify-content:center;font-weight:900;color:#111}.my-k.on .ck{background:#f472b6;border-color:#f472b6}.my-k.on{background:rgba(244,114,182,.08)}" +
    ".my-k .nm b{font-size:14px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.my-k .nm small{display:block;font-size:12.5px;color:var(--sub)}.my-k .r{font-size:14px}" +
    ".po-dt{width:100%;border-collapse:collapse;font-size:13.5px}.po-dt th{font-size:12.5px;color:var(--sub);text-align:right;font-weight:600;padding:4px}.po-dt th:first-child,.po-dt td:first-child{text-align:left}.po-dt td{text-align:right;padding:6px 4px;border-top:1px solid var(--line)}.po-dt td em{display:block;font-size:12.5px}";
  document.head.appendChild(css);
})();
;
/* ======== simple.js ======== */
/* CH Investing — 보기 단순하게 (10/6)
   탭마다 핵심 카드만 바로 보여주고, 나머지 카드는 맨 아래 「📂 더 보기」에 제목 한 줄씩 모은다.
   한 줄을 누르면 그 카드가 아래에서 올라오는 화면(#sheet)으로 열린다. ← 뒤로 / ✕ 로 닫으면 제자리로 돌아간다.
   종목 카드의 이름을 누르면 종목리포트로 간다. */
(function(){
  // 탭별로 바로 보여줄 카드 (제목에 이 말이 들어가면). 제목 없는 카드(킥·미국장 등)는 항상 보임.
  var KEEP = {
    market: /오늘 할 일|자산 배분|오늘의 판단/,
    whale:  /TOP 10|오늘의 신호|함께 든 종목/,
    cup:    /오늘 컵 지도|나라별|많이 나온 섹터|돌파 임박/,
    gap:    /오늘 갭 지도|나라별|많이 나온 섹터/,
    sector: /국면 신호판|장중 나침반|5개 시장 한눈에|대표 지수|포트 비교 지수|섹터 등락/,
    accum:  /거래량 이상 종목|박스 돌파/,
    danta:  /전광판|날짜별 성적/,
    alarm:  /내 알림|처음 한 번만|알림 기록/
  };
  var T = null, OPEN = null;
  // 🧭 나침반: 상위(묶음) → 하위(카드). 묶음마다 대표 카드 하나만 펼쳐 두고, 나머지는 묶음 머리의 칩으로 (누르면 아래에서 열림)
  var GROUPS = [
    {k: "reg",  ic: "🧭", t: "지금 시장은 어느 국면?", s: "큰 그림 · 경기·타이밍·공포탐욕",
     main: /국면 신호판/, sub: /국면 전환 예보|국면 기록|공포·탐욕 지수|체감 온도|제일 강할까/},
    {k: "live", ic: "⚡", t: "오늘 장 흐름", s: "5개 시장 실시간 · 서로 어떻게 따라가나",
     main: /장중 나침반/, sub: /5개 시장 한눈에|세계 시장 하루 흐름|누가 누구를 따라가나|미국 → 한국 연결고리/},
    {k: "ix",   ic: "📈", t: "지수 · 시장 폭", s: "대표 지수 · 오른 종목 vs 내린 종목 · 신고가",
     main: /대표 지수|포트 비교 지수/, sub: /오늘 오른 종목 · 내린 종목|상승 − 하락 종목 수 흐름|신고가 vs 신저가|52주 신고가/},
    {k: "watch", ic: "🎯", t: "오늘 볼 업종·종목", s: "고른 나라 기준 · 업종 3곳과 대장주",
     main: /오늘 이 업종·종목을 보자/, sub: /^$/},
    {k: "sec",  ic: "🏭", t: "섹터 · 업종", s: "돈이 어디로 가나 · 강한 업종 · 대형주",
     main: /^섹터 등락/, sub: /오늘 강한 업종|약한 업종|많이 오른 대형주|섹터 로테이션|섹터 히트맵|섹터 흐름 되감기|환율·금리에 민감/},
    {k: "brf",  ic: "☀️", t: "아침 섹터 브리핑", s: "오늘 볼 섹터 · 간밤 글로벌",
     main: /모닝 섹터 브리핑/, sub: /간밤 글로벌|전일 섹터 등락/}
  ];
  function groupOf(t){ for (var i = 0; i < GROUPS.length; i++){ if (GROUPS[i].main.test(t)) return {g: GROUPS[i], main: true}; if (GROUPS[i].sub.test(t)) return {g: GROUPS[i], main: false}; } return null; }

  function titleOf(c){
    var h = c.querySelector(":scope > h3") || c.querySelector(":scope > summary");
    if (!h) return null;
    var main = h.cloneNode(true), sub = "";
    var m = main.querySelector(".mut"); if (m){ sub = m.textContent.trim(); m.remove(); }
    [].forEach.call(main.querySelectorAll("button,a.btn,select,input"), function(x){ x.remove(); });
    var t = main.textContent.replace(/\s+/g, " ").trim();
    return t ? {t: t, sub: sub} : null;
  }

  function drawer(body){
    var d = document.getElementById("xs-more");
    if (!d || !body.contains(d)){
      d = document.createElement("section"); d.id = "xs-more"; d.className = "card xs-more";
      d.innerHTML = '<h3>📂 더 보기 <span class="mut" id="xs-n"></span></h3><div class="xs-list"></div>';
      body.appendChild(d);
    } else if (d !== body.lastElementChild){ body.appendChild(d); }   // 늘 맨 아래
    return d;
  }

  function scan(){
    T = null;
    var body = document.getElementById("body") || document.getElementById("main"); if (!body || !cur) return;
    var re = KEEP[cur]; if (!re) return;
    var cards = body.querySelectorAll("section.card, details.card");
    var d = null;
    if (cur === "sector"){ groupScan(body, cards); return; }
    [].forEach.call(cards, function(c){
      if (c.dataset.xs || c.id === "xs-more" || c.closest("#xs-more")) return;
      if (c.parentElement && c.parentElement.closest(".card")) { c.dataset.xs = "in"; return; }   // 카드 안의 카드는 그대로
      var ti = titleOf(c);
      if (!ti || re.test(ti.t)){ c.dataset.xs = "keep"; return; }
      c.dataset.xs = "hide"; c.classList.add("xs-hid");
      d = d || drawer(body);
      var row = document.createElement("button"); row.className = "xs-row";
      row.innerHTML = '<span class="xs-t"></span><span class="xs-s mut"></span><span class="hgo">›</span>';
      row.querySelector(".xs-t").textContent = ti.t; row.querySelector(".xs-s").textContent = ti.sub;
      row.onclick = function(){ openCard(c, ti.t); };
      d.querySelector(".xs-list").appendChild(row);
    });
    var dd = document.getElementById("xs-more");
    if (dd){ drawer(body); var n = dd.querySelectorAll(".xs-row").length; dd.querySelector("#xs-n").textContent = n + "개 · 누르면 열려요"; fold(dd); }
  }
  // 📂 더 보기 줄이 많으면 처음엔 5개만 · 「전체 n개 보기 ▾」 (10/12)
  var MORE_OPEN = {};
  function fold(dd){
    var rows = dd.querySelectorAll(".xs-row"), n = rows.length, k = cur, open = !!MORE_OPEN[k];
    var b = dd.querySelector(".xs-all");
    if (n <= 6){ if (b) b.remove(); [].forEach.call(rows, function(r){ if (r.hidden) r.hidden = false; }); return; }
    [].forEach.call(rows, function(r, i){ var v = !open && i >= 5; if (r.hidden !== v) r.hidden = v; });   // 🎨 11/04: 같은 값은 다시 안 씀(DOM 변경 폭주 → 떨림 예방)
    if (!b){ b = document.createElement("button"); b.type = "button"; b.className = "xs-all clp-btn"; dd.appendChild(b);
      b.onclick = function(){ MORE_OPEN[cur] = !MORE_OPEN[cur]; fold(dd); }; }
    else dd.appendChild(b);
    var bt = open ? "접기 ▴" : "전체 " + n + "개 보기 ▾"; if (b.textContent !== bt) b.textContent = bt;
  }

  // 나침반 묶음 만들기
  function groupScan(body, cards){
    var by = {};
    [].forEach.call(cards, function(c){
      if (c.closest("#xs-more") || c.id === "xs-more") return;
      if (c.parentElement && c.parentElement.closest(".card")) return;
      var ti = titleOf(c); if (!ti) return;
      var m = groupOf(ti.t);
      var k = m ? m.g.k : "etc";
      by[k] = by[k] || {main: null, subs: []};
      if (m && m.main && !by[k].main) by[k].main = c;
      else if (m && m.main){ c.dataset.xs = "keep"; c.classList.remove("xs-hid"); }   // 대표 카드가 둘(📈 대표 지수 + 🏁 포트 비교 지수)이면 둘 다 펼침
      else if (c.dataset.xs !== "keep" || !m) by[k].subs.push({c: c, t: ti.t, sub: ti.sub});
    });
    var n = 0;
    GROUPS.forEach(function(g){
      var o = by[g.k]; if (!o) return;
      n++;
      if (o.main && o.main.dataset.xs !== "keep"){ o.main.dataset.xs = "keep"; o.main.classList.remove("xs-hid"); }
      o.subs.forEach(function(x){ if (x.c.dataset.xs !== "hide"){ x.c.dataset.xs = "hide"; x.c.classList.add("xs-hid"); } });   // 🎨 11/04: 같은 값은 다시 안 씀
      var anchor = o.main || (o.subs[0] && o.subs[0].c); if (!anchor) return;
      var h = anchor.previousElementSibling && anchor.previousElementSibling.classList.contains("cg-h") ? anchor.previousElementSibling : null;
      [].forEach.call(body.querySelectorAll('.cg-h[data-g="' + g.k + '"]'), function(x){ if (x !== h) x.remove(); });   // 자리 바뀐 옛 머리 지우기
      var sig = o.subs.map(function(x){ return x.t; }).join("|");
      if (h && h.dataset.sig === sig){ h._subs = o.subs; return; }                    // 바뀐 게 없으면 그대로 (무한 반복 방지)
      if (!h){ h = document.createElement("div"); h.className = "cg-h"; anchor.parentNode.insertBefore(h, anchor); }
      h.dataset.g = g.k; h.dataset.sig = sig; h._subs = o.subs;
      h.innerHTML = '<div class="cg-t"><span class="cg-i">' + g.ic + '</span><div><b>' + g.t + '</b><small>' + g.s + '</small></div></div>' +
        (o.subs.length ? '<div class="cg-chips"></div>' : '');
      var box = h.querySelector(".cg-chips");
      o.subs.forEach(function(x, i){
        var b = document.createElement("button"); b.className = "cg-chip"; b.textContent = x.t.replace(/^[^\w가-힣]+/, "").slice(0, 18);
        b.onclick = function(){ var y = (h._subs || [])[i] || x; openCard(y.c, y.t); }; box.appendChild(b);
      });
    });
    // 나라 고르는 줄 위에도 머리 하나 (아래 지수·섹터는 고른 나라 기준)
    var seg = document.getElementById("cpseg");
    if (seg && !(seg.previousElementSibling && seg.previousElementSibling.classList.contains("cg-h"))){
      var hh = document.createElement("div"); hh.className = "cg-h"; hh.dataset.g = "ctry";
      hh.innerHTML = '<div class="cg-t"><span class="cg-i">🌏</span><div><b>나라 골라 자세히</b><small>아래 국면·지수·섹터는 고른 나라 기준이에요</small></div></div>';
      seg.parentNode.insertBefore(hh, seg);
    }
    // 묶음에 안 들어간 카드는 예전처럼 「더 보기」
    var etc = (by.etc || {subs: []}).subs.filter(function(x){ return x.c.dataset.xs !== "keep" && !KEEP.sector.test(x.t); });
    if (etc.length){
      var d = drawer(body);
      etc.forEach(function(x){ if (x.c.dataset.xs === "hide") return; x.c.dataset.xs = "hide"; x.c.classList.add("xs-hid");
        var row = document.createElement("button"); row.className = "xs-row";
        row.innerHTML = '<span class="xs-t"></span><span class="xs-s mut"></span><span class="hgo">›</span>';
        row.querySelector(".xs-t").textContent = x.t; row.querySelector(".xs-s").textContent = x.sub;
        row.onclick = function(){ openCard(x.c, x.t); }; d.querySelector(".xs-list").appendChild(row); });
      var dd = document.getElementById("xs-more"); dd.querySelector("#xs-n").textContent = dd.querySelectorAll(".xs-row").length + "개 · 누르면 열려요"; fold(dd);
    } else { var old = document.getElementById("xs-more"); if (old && !old.querySelector(".xs-row")) old.remove(); }
  }

  // ❓ 이 화면은 무엇을 찾나요 (컵·갭·조용한 매집)
  var HELP = {
    cup: ["☕ 컵앤핸들을 찾는 화면", [
      "<b>무엇을</b> — 오르던 종목(주도주)이 한 번 쉬면서 <b>U자·V자 그릇(컵)</b>을 만들고, 왼쪽 고점 근처까지 돌아온 뒤 살짝 눌리며 <b>손잡이</b>를 만드는 종목. 윌리엄 오닐(CAN SLIM)의 대표 매수 모양이에요.",
      "<b>어떻게 고르나</b> — 한·미·일·중·홍 전 종목 → 숫자 규칙(컵 깊이·기간·회복·상대강도) → 차트를 그림으로 그려 <b>눈으로</b> 한 번 더 걸러요. 매일 아침 새로.",
      "<b>사는 자리</b> — 손잡이 위 <b>기준가(왼쪽 고점, 점선)</b>를 큰 거래량으로 뚫을 때. 카드의 「기준가까지 %」가 0 근처면 임박, 이미 +5% 넘게 달아났으면 추격 주의.",
      "<b>보는 법</b> — 위 <b>지도(나라×섹터)</b> 숫자를 누르면 그 종목만. 차트의 파란 음영 = 컵, 노란 음영 = 손잡이. 이름을 누르면 종목리포트."]],
    gap: ["📈 갭 돌파를 찾는 화면", [
      "<b>무엇을</b> — 몇 주~몇 달 <b>옆으로 기던 박스(성곽)</b>를 어느 날 시가부터 <b>빈칸(갭)</b>을 내며 뛰어넘은 종목. 큰 거래량이 같이 터지면 기관·큰손이 들어온 신호예요.",
      "<b>어떻게 고르나</b> — 갭 전 횡보 4주 이상 · 시가가 박스 고점 위 · 거래량 1.5배 이상 · 지금도 박스 위에 있는 것. 그다음 그림으로 눈 검사.",
      "<b>사는 자리</b> — 갭 시가 위에서 버티는 동안. 박스 안으로 다시 들어오면(갭 메움) 실패. 갭 시가보다 +15% 넘게 오른 건 추격 금지.",
      "<b>보는 법</b> — 위 <b>갭 지도</b> 숫자·막대를 누르면 그 종목만. 🎯 갭 크기×거래량 그림에서 오른쪽 위일수록 힘이 센 갭."]],
    accum: ["🤫 거래량 이상 종목 (참고용)", [
      "<b>무엇을</b> — <b>가격은 거의 제자리</b>인데 최근 한 달 <b>거래량이 그 전 석 달의 3배</b> 이상으로 꾸준히 늘어난 종목. 누군가 사 모으는 흔적일 수도, 파는 흔적(분배)일 수도 있어요.",
      "<b>성적</b> — 2012년부터 5개 시장에서 다시 돌려 보니 지수도, 같은 시장 아무 종목도 못 이겼어요(40일 초과수익 2012~19년 −1.9% · 2020년~ −2.2%). 점수·「강한 매집」·박스 돌파 확인도 나아지지 않았어요.",
      "<b>쓰는 법</b> — <b>매수 신호가 아니에요.</b> 이미 관심 있는 종목에 거래량이 몰리는지 확인하는 참고로만. 킥 포트 후보에서도 뺐어요(10/12).",
      "<b>보는 법</b> — 막대·카드 이름을 누르면 종목리포트."]]
  };
  HELP.whale = ["🐋 유명 펀드·투자자의 보유 종목을 보는 화면", [
      "<b>무엇을</b> — 버핏·애크먼 같은 유명 펀드·투자자 40곳(고래)이 미국 SEC에 분기마다 내는 보유 보고서(13F)를 모아, <b>무엇을 새로 사고 늘리고 팔았는지</b> 보여줘요.",
      "<b>어떻게 보나</b> — 「TOP 10」은 여러 고래가 함께 든 종목·비중이 큰 종목. 「오늘의 신호」는 새로 담거나 크게 늘린 종목. 고래 이름을 누르면 그 펀드의 포트폴리오 전체.",
      "<b>주의</b> — 13F는 분기 말 기준이고 45일 늦게 나와요. 지금도 들고 있는지는 모르니 <b>아이디어 출발점</b>으로 쓰고, 차트(컵·갭)와 함께 확인하세요.",
      "<b>보는 법</b> — 종목 이름을 누르면 종목리포트, 막대를 누르면 숫자가 나와요."]];
  HELP.danta = ["⚡ 단타(당일 급등 신호) 알람을 모은 화면", [
      "<b>무엇을</b> — 장중에 <b>거래량이 갑자기 터지면서 가격이 뛰는 종목</b>을 스크리너가 실시간으로 잡아 텔레그램·앱으로 알린 기록이에요. 같은 알람이 이 화면에 바로 쌓여요.",
      "<b>전광판</b> — 오늘 알람 종목과 알람 뒤 지금까지 몇 % 움직였는지. 「날짜별 성적」은 그날 알람이 난 종목들이 지금까지 평균 몇 % 벌었는지(날짜별 막대).",
      "<b>쓰는 법</b> — 알람은 <b>출발 신호</b>일 뿐이에요. 거래대금이 크고, 알람 뒤 눌림에서 버티는 종목만 보세요. 손절 자리를 먼저 정하고 들어가는 게 원칙.",
      "<b>보는 법</b> — 종목 이름을 누르면 종목리포트. 잘 맞는 시간대·업종 통계도 아래 「더 보기」에 있어요."]];
  function addHelp(){
    if (document.documentElement.hasAttribute("data-wow")) return;   // 🎨 11/04: 칩 줄 다이어트 — 제목·조이 얼굴이 같은 설명을 엶
    var h = HELP[cur]; if (!h) return;
    var body = document.getElementById("body"); if (!body || body.querySelector(":scope > .xp-card, :scope > .xp-mini")) return;
    var d = document.createElement("details"); d.className = "xp-mini no-clp"; d.dataset.xs = "keep";
    d.innerHTML = '<summary>ⓘ 이 화면은? <span>' + h[0] + '</span></summary><div class="xp-in">' + h[1].map(function(x){ return '<p>' + x + '</p>'; }).join("") + '</div>';
    body.insertBefore(d, body.firstChild);
  }

  function openCard(c, t){
    if (window.closeSheet && document.getElementById("sheet")) closeSheet();
    var ph = document.createComment("xs"); if (c.parentNode) c.parentNode.insertBefore(ph, c);   // 🔧 11/04: 화면이 다시 그려져 카드가 떨어져 나간 뒤 줄을 누르면 insertBefore 오류 → 그래도 시트로 엶
    var sh = document.createElement("div"); sh.id = "sheet";
    sh.innerHTML = '<div class="sh-top"><button aria-label="닫기" class="sh-x" onclick="goBack()">✕</button><b></b></div><div class="sh-body"></div>';
    sh.querySelector("b").textContent = t;
    document.body.appendChild(sh); document.body.classList.add("sheet-open");
    c.classList.remove("xs-hid"); sh.querySelector(".sh-body").appendChild(c);
    OPEN = {c: c, ph: ph};
    try { history.pushState({t: "xs", d: navD() + 1}, "", location.pathname + "#" + cur); } catch(e) {}
    if (window.updBack) updBack();
  }
  function restore(){
    if (!OPEN) return;
    var o = OPEN; OPEN = null;
    if (o.ph.parentNode){ o.ph.parentNode.insertBefore(o.c, o.ph); o.ph.remove(); }
    o.c.classList.add("xs-hid");
  }
  // 기존 시트 닫기에 "카드 제자리로" 끼워 넣기
  var _close = window.closeSheet;
  window.closeSheet = function(){ restore(); if (_close) _close(); };

  // 종목 카드 이름 누르면 종목리포트
  document.addEventListener("click", function(ev){
    var n = ev.target.closest && ev.target.closest(".cc .nm2");
    if (!n || ev.target.closest("a,button")) return;
    var cd = n.querySelector(".cd"); if (cd && window.openOP) openOP(cd.textContent.trim());
  });

  // 종목 카드: 이름·차트·핵심 숫자·맨 아래 줄만 보이고, 나머지(뉴스·설명·막대 등)는 「자세히 ▾」로
  function slimCards(){
    var main = document.getElementById("main"); if (!main) return;
    [].forEach.call(main.querySelectorAll(".cc"), function(cc){
      var tg = cc.querySelector(":scope > .xs-tg");
      var extra = [].filter.call(cc.children, function(x){ return x !== cc.firstElementChild && x !== cc.lastElementChild && !x.matches(".sp-box,.st4,.xs-tg"); });
      if (!extra.length){ if (tg) tg.remove(); return; }
      if (!tg){
        tg = document.createElement("button"); tg.className = "xs-tg"; tg.textContent = "자세히 ▾";
        tg.onclick = function(ev){ ev.stopPropagation(); var o = cc.classList.toggle("xs-open"); tg.textContent = o ? "접기 ▴" : "자세히 ▾"; };
        cc.insertBefore(tg, cc.lastElementChild);
      } else if (tg.nextElementSibling !== cc.lastElementChild){ cc.insertBefore(tg, cc.lastElementChild); }
    });
  }

  // 너무 긴 카드(휴대폰 한 화면 넘게)는 앞부분만 보이고 「전체 보기 ▾」
  function clampLong(){
    var main = document.getElementById("main"); if (!main) return;
    [].forEach.call(main.querySelectorAll("section.card"), function(c){
      if (c.dataset.xc || c.classList.contains("ixc-card") || c.closest("#pobody") || (c.classList.contains("br") && cur !== "feed") || c.classList.contains("pu-main") || c.classList.contains("pl") || c.classList.contains("pu-list") || c.classList.contains("xs-hid") || c.closest("#sheet") || c.id === "xs-more" || c.parentElement.closest(".card")) return;
      if (c.querySelector(".rb-x")) return;                     // 국면 신호판: 점수 설명을 펼친 카드는 자르지 않음
      if (c.offsetHeight < (window.cur === "home" ? 520 : 900)) return;   // 🔍 11/05 C10 홈 카드는 한 화면 안
      c.dataset.xc = "1"; c.classList.add("xs-clamp");
      var b = document.createElement("button"); b.className = "xs-cl"; b.textContent = "전체 보기 ▾";
      // 10/19 사용자 「전체보기를 눌렀는데 이상한 데로 가니」 — 카드 전체가 누르면 다른 탭으로 가는 카드(data-goto)일 때 이 단추 클릭이 카드로 번져 탭이 바뀌었음
      b.onclick = function(ev){ if (ev){ ev.preventDefault(); ev.stopPropagation(); } var o = c.classList.toggle("xs-clamp"); b.textContent = o ? "전체 보기 ▾" : "접기 ▴"; if (o) c.scrollIntoView({block: "start", behavior: "smooth"}); };
      c.appendChild(b);
    });
  }

  function watch(){
    var main = document.getElementById("main"); if (!main) return setTimeout(watch, 200);
    new MutationObserver(function(){ if (!T) T = setTimeout(function(){ addHelp(); scan(); slimCards(); setTimeout(clampLong, 400); }, 120); }).observe(main, {childList: true, subtree: true});
  }
  watch();
})();
;
/* ======== pdfx.js ======== */
/* CH Investing — 화면 그대로 PDF (10/6)
   예전: 리포트 전체를 큰 캔버스 한 장으로 그림 → 아이폰 캔버스 한도에 걸려 그림(주가·매출)이 빠지고 카드가 잘림.
   지금: ① 화면을 몰래 복제해 SVG 차트는 다 그려진 PNG로, 외부 사진·로고는 중계 서버(wsrv.nl)로 받아 그림 데이터로 바꾸고
         ② 카드(섹션)를 한 장씩 작은 캔버스로 찍어 ③ PDF 쪽에 차례로 붙인다. 카드가 쪽 경계에서 잘리지 않는다. */
(function(){
  var PW = 114, PH = 203, M = 4;
  // 아이폰 사파리: 캔버스 메모리 한도가 작아 한 번에 많이 그리면 실패 → 작게 찍고, 쓴 캔버스는 바로 비우고, 한 카드가 실패해도 건너뛰고 계속
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);          // PDF 쪽 크기(mm)·여백 — 휴대폰 화면 비율
  var CPROPS = ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity",
                "font-size", "font-weight", "font-family", "font-style", "letter-spacing", "text-anchor", "dominant-baseline", "paint-order", "color"];   // 10/28 paint-order 빠지면 글자 테두리가 글자를 덮어 흰 덩어리(섹터 로테이션 지도)
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
    var restore = function(){ w.scrollTo(sx, sy); if (shEl) shEl.scrollTop = shY; var sc_ = d.getElementById("snapcss"); if (sc_) sc_.remove(); if (light){ if (oldUi == null) root.removeAttribute("data-ui"); else root.setAttribute("data-ui", oldUi); } cover.remove();
      [].forEach.call(d.querySelectorAll(".html2pdf__overlay,.html2pdf__container"), function(x){ x.remove(); }); };
    return wait(120).then(function(){
      var width = Math.round(els[0].getBoundingClientRect().width) || 360, bg = w.getComputedStyle(d.body).backgroundColor || "#fff";
      var host = d.createElement("div"); host.id = "snaphost"; host.style.cssText = "position:absolute;left:-20000px;top:0;width:" + width + "px;background:" + conv(bg);
      var hs = d.createElement("style"); hs.id = "snapcss";   // 조이 얼굴은 안내 스크립트가 새 카드에 다시 붙임 → 찍는 동안 통째로 숨김 (html2pdf 복제본 포함)
      hs.textContent = "#snaphost *::before,.html2pdf__container *::before{background-image:none!important}#snaphost [class*=gd-],.html2pdf__container [class*=gd-],#snaphost video,.html2pdf__container video{display:none!important}";
      d.head.appendChild(hs);
      d.body.appendChild(host);
      var clones = els.map(function(el){ var c = el.cloneNode(true); c.style.margin = "0"; c.style.maxHeight = "none"; c.style.width = width + "px"; host.appendChild(c); return {src: el, c: c}; });
      var jobs = [];
      clones.forEach(function(o){
        [].forEach.call(o.c.querySelectorAll("button,.pdfbar,.pdfb,.xs-tg,.xs-cl,script,input,select,.seg2 button:not(.on)"), function(x){ x.remove(); });
        [].forEach.call(o.c.querySelectorAll("img"), function(im){ if (/img\/(kid_|guide)/.test(im.getAttribute("src") || "")) im.remove(); });
        [].forEach.call(o.c.querySelectorAll("[class*=gd-],video,[class*=joy]"), function(x){ x.remove(); });   // 조이 얼굴(작은 동그라미)
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
;
/* ======== honest.js ======== */
/* CH Investing — 🧾 정직 성적 (10/11)
   지금 숫자 옆에 「정직 계산」(다음 날 가격에 사고 · 수수료·세금·환전 비용을 뺀 값)을 나란히.
   ① ☕ 컵 · 📈 갭 탭 맨 위 한 줄: 목록 전체 20일 성적 + 킥이 고르는 돌파 + 정직 계산
   ② HON.chip / HON.tags — 🏠 홈 · 💼 포트 · 📊 성적표에서 같이 씀
   자료(edge·kick·port·home·scores)에 정직 칸이 아직 없으면 조용히 숨김 */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  var WHY = "다음 날 가격에 사고 수수료·세금·환전 비용을 뺀 값";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function num(v){ return v != null && v !== "" && !isNaN(v); }
  function sg(v, d){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(+v).toFixed(d == null ? 1 : d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? String(d).slice(5, 10).replace("-", "/") : ""; }
  function oosTxt(o){ return o && o.n ? "뒤 절반(" + md(o.from) + "~, 맞출 때 안 쓴 자료) " + o.n + "건 · 평균 " + sg(o.avg) + (num(o.pf) ? " · 손익비 " + o.pf : "") : ""; }

  // 「정직 +1.0% ⓘ」 칩 — 누르면 무슨 뜻인지
  function chip(v, o){
    if (!num(v)) return "";
    o = o || {};
    var tip = "<b>🧾 정직 계산</b><br>" + WHY + (o.basis ? "<br><small>" + e(o.basis) + "</small>" : "") + (o.n ? "<br>" + o.n + "건" + (num(o.pf) ? " · 손익비 " + o.pf : "") : "") + (oosTxt(o.oos) ? "<br>" + e(oosTxt(o.oos)) : "") + (o.note ? "<br><small>" + e(o.note) + "</small>" : "");
    return '<span class="hon-chip" data-tip="' + e(tip) + '">' + (o.label || "정직") + ' <b class="' + cls(v) + '">' + sg(v, o.d) + '</b> <i>ⓘ</i></span>';
  }
  // 경고 꼬리표: 손익비 1.5 미만 → 「정직 기준 미달」 · 같은 표본으로 고른 필터 → 「같은 자료로 맞춘 값」
  function tags(h){
    if (!h) return "";
    var sr = h.h_n !== undefined;   // 📊 성적표 줄(h_ 칸) — 그 줄의 n·pf 는 정직이 아닌 원래 숫자라 h_ 쪽만 봄
    var n = sr ? h.h_n : h.n, pf = sr ? h.h_pf : h.pf, ins = sr ? h.h_insample : h.insample, out = "";
    if (!n) return "";
    if (pf != null && pf < 1.5) out += '<span class="hon-tag" data-tip="' + e("정직 계산 손익비 " + pf + " — 1.5 아래면 비용·진입 지연을 견딜 만큼 강하다고 보기 어려워요") + '">⚠ 정직 기준 미달</span>';
    if (ins === true) out += '<span class="hon-tag" data-tip="' + e("이 필터를 고를 때 쓴 같은 자료로 잰 값이라 실제보다 좋아 보일 수 있어요") + '">같은 자료로 맞춘 값</span>';
    return out;
  }
  function whale(p){ return p && p.fixed ? '<span class="hon-tag" data-tip="' + e(p.why_note || "4분기 표본 · 코드에 고정된 판정") + '">4분기 표본·고정 판정</span>' : ""; }
  // 칩·꼬리표를 눌러도 카드 이동(data-goto)이 일어나지 않게 — 설명만
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest(".hon-chip,.hon-tag"); if (t){ ev.preventDefault(); ev.stopPropagation(); } }, true);

  var t5 = function(){ return Math.floor(Date.now() / 300000); };
  function edge(){ return getJSON(RAW + "edge.json?" + t5()).catch(function(){ return null; }); }
  function perf(name){ return getJSON("archive/x/" + name + "?" + ((window.M && M.updated) || "")).catch(function(){ return null; }); }
  window.HON = {chip: chip, tags: tags, whale: whale, edge: edge, WHY: WHY};

  /* ---------- ① 컵·갭 탭 맨 위 한 줄 ---------- */
  function line(kind, el){
    var box = document.createElement("div"); box.className = "hon-line"; box.style.display = "none"; el.insertBefore(box, el.firstChild);
    Promise.all([perf(kind === "cup" ? "perf_cup.json" : "perf_gap.json"), edge()]).then(function(r){
      var A = r[0] && r[0].stats && r[0].stats.all && r[0].stats.all.r20, E = r[1] && r[1][kind], parts = [];
      if (A && A.n) parts.push('목록 전체 20일 평균 <b class="' + cls(A.avg) + '">' + sg(A.avg) + '</b><span class="mut">(승률 ' + Math.round(A.win) + '%, ' + A.n + '건)</span>');
      var K = E ? (kind === "cup" ? E.brk_real_kick : (E["돌파_by_size"] || {})["4-8%"]) : null, H = E && E.honest;
      if (K && num(K.avg) || H && num(H.avg)) parts.push((kind === "cup" ? "킥이 고르는 돌파" : "킥이 고르는 갭 4~8%") + ': ' +
        (K && num(K.avg) ? '<b class="' + cls(K.avg) + '">' + sg(K.avg) + '</b>' : '') +
        (H && num(H.avg) ? ' / ' + chip(H.avg, {label: "정직", basis: H.basis, n: H.n, pf: H.pf, oos: H.oos}) + tags(H) : '') +
        (H && num(H.avg) ? ' <span class="mut">(다음 날 진입·비용 뺌)</span>' : ''));
      if (!parts.length) { box.remove(); return; }
      box.innerHTML = '📊 <b>지금까지</b> · ' + parts.join(" · ");
      box.style.display = "";
    });
  }
  ["cup", "gap"].forEach(function(k){
    var OLD = window.RENDER && RENDER[k]; if (!OLD) return;
    RENDER[k] = function(it, el){ OLD(it, el); try { line(k, el); } catch(x) { console.error(x); } };
  });
})();
;
/* ======== up10.js ======== */
/* CH Investing — 앱 업그레이드 10 (10/10 사용자: "어플 전체를 업그레이드하는 전략 열 개 … 다 진행해")
   ① 🏠 오늘 — 첫 화면 한 장 (market/home.json)
   ③ 📊 성적 — 판단 채점을 한 곳에 (market/scores.json)
   ⑤ 접히는 카드 + 바로가기 칩 (💼 포트)
   ⑥ 밝은 테마 · 글자 크기 (⚙️)
   ⑦ 종목 화면: 🐋☕📈🤫🎯🧠 신호 · 포트·킥에 들어 있나 (market/sigindex.json)
   ⑨ 알림을 누르면 그 카드로 바로 (#탭~카드id)
   ⑧ 자료는 서비스 워커가 마지막 것을 들고 있다가 느리면 그걸 먼저 (sw.js) */
(function(){
  var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/";
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function sg(v, d){ if (v == null || isNaN(v)) return "–"; d = d == null ? 2 : d; return (v > 0 ? "+" : "") + (+v).toFixed(d) + "%"; }
  function cls(v){ return v > 0 ? "up" : v < 0 ? "dn" : ""; }
  function md(d){ return d ? String(d).slice(5, 10).replace("-", "/") : ""; }
  function hon(v, o){ return window.HON ? HON.chip(v, o) : ""; }   // 🧾 정직 계산 칩 (honest.js · 자료 없으면 빈칸)
  function J(name){ return getJSON(RAW + name + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }   // 같은 2분 안엔 한 번만 받음 (index.html getJSON)
  var UI = {theme: "auto", fs: "auto", home: "time", mkt: "time"};   // 10/14 A15-3: fs = "auto"(아이폰 글자 크기 따라감) | 0.88~1.22   // 10/14 A9-1: home = "time"(시간대 맞춤 순서) | "fixed"(고정)
  try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); if (u.theme) UI.theme = u.theme; if (u.fs) UI.fs = u.fs === 1 ? "auto" : u.fs === 0.92 ? 0.94 : u.fs === 1.12 ? 1.1 : u.fs; if (u.home) UI.home = u.home; if (u.mkt) UI.mkt = u.mkt; } catch(x) {}
  function keepUI(){ try { localStorage.setItem("ui", JSON.stringify(UI)); } catch(x) {} }

  /* ---------- ⑥ 테마 · 글자 크기 ---------- */
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : null;
  function applyUI(){
    var t = UI.theme === "auto" ? (mq && mq.matches ? "light" : "dark") : UI.theme;
    document.documentElement.setAttribute("data-ui", t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "light" ? "#f5f6fa" : "#0b0f17");
    document.documentElement.style.setProperty("--fs", UI.fs === "auto" ? 1 : UI.fs);
    // 10/14 A15-3: zoom(카드·여백까지 다 커짐) 대신 글자만 키움 — ux1014c.js chFont 가 글자 크기 규칙만 고쳐 씀
    if (document.body) document.body.style.zoom = "";
    if (window.chFont) window.chFont(UI.fs);
  }
  if (mq && mq.addEventListener) mq.addEventListener("change", applyUI);
  applyUI();
  function settings(){
    var old = document.getElementById("uiset"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "uiset";
    var row = function(lab, key, opts){ return '<div class="us-r"><span>' + lab + '</span><div class="us-seg">' + opts.map(function(o){
      return '<button data-k="' + key + '" data-v="' + o[0] + '" class="' + (String(UI[key]) === String(o[0]) ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div></div>'; };
    d.innerHTML = '<b>⚙️ 보기 설정</b>' + row("화면", "theme", [["auto", "자동"], ["dark", "🌙 어둡게"], ["light", "☀️ 밝게"]]) +
      row("글자", "fs", [["auto", "📱 자동"], [1, "보통"], [1.12, "크게"], [1.25, "아주 크게"]]) +
      row("🌐 시황 순서", "mkt", [["time", "🕘 시간대"], ["fixed", "고정"]]) +
      '<small>글자 「📱 자동」 = 아이폰 설정 › 디스플레이 › 텍스트 크기를 따라가요(가 다섯 개 = 아주 작게 ~ 아주 크게, 카드 모양은 그대로). 화면 자동 = 휴대폰 설정(다크 모드)을 따라가요. 시황 「시간대」 = 아침·장중·저녁·밤마다 지금 볼 카드를 맨 위로.</small>' +
      '<div class="us-ver">앱 버전 v' + e(window.APPV || "") + (window.M && M.updated ? ' · 자료 목록 ' + e(String(M.updated).slice(5)) : '') + '</div>' +
      '<div class="us-go"><button data-gloss="1">📖 용어 풀이</button><button data-go="score">📊 성적표</button><button data-go="alarm">🔔 알림 켜기·끄기</button><button data-go="idea">💬 의견함</button><button data-go="onepager">📄 종목리포트</button></div>';
    document.body.appendChild(d);
    [].forEach.call(d.querySelectorAll("[data-go]"), function(b){ b.onclick = function(){ d.remove(); go(b.dataset.go); }; });
    [].forEach.call(d.querySelectorAll("button[data-k]"), function(b){ b.onclick = function(){ var k = b.dataset.k, v = b.dataset.v; UI[k] = k === "fs" && v !== "auto" ? +v : v; keepUI(); applyUI(); d.remove(); settings();
      if (k === "home" && window.cur === "home" && window.homeInit) homeInit(); if (k === "mkt" && window.cur === "market") go("market", window.curDate); }; });
    setTimeout(function(){ document.addEventListener("click", function off(ev){ if (!d.contains(ev.target) && ev.target.id !== "uibtn"){ d.remove(); document.removeEventListener("click", off); } }); }, 0);
  }
  function addBtn(){
    var top = document.querySelector("header .top"); if (!top || document.getElementById("uibtn")) return;
    var b = document.createElement("button"); b.id = "uibtn"; b.textContent = "⚙️"; b.setAttribute("aria-label", "보기 설정"); b.onclick = settings;
    top.appendChild(b);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function(){ addBtn(); applyUI(); }) : (addBtn(), applyUI());

  /* ---------- ⑨ 알림·링크에서 바로 그 카드로: #port~pokick ---------- */
  window.goTo = function(tab, anchor){
    if (typeof go === "function" && cur !== tab) go(tab);
    if (!anchor) return;
    var t0 = Date.now();
    (function find(){
      var el = document.getElementById(anchor);
      if (el){ if (window.unclamp) unclamp(el); var f = el.closest(".fold"); if (f && !f.classList.contains("open")) f.classList.add("open");
        if (el.classList.contains("xs-hid") && window.closeSheet){ /* 「더 보기」로 숨은 카드면 그대로 펼쳐 보이기 */ el.classList.remove("xs-hid"); }
        setTimeout(function(){ var hd = document.querySelector("header"), jb = document.querySelector(".fold-jump");
          var y = el.getBoundingClientRect().top + window.scrollY - ((hd ? hd.offsetHeight : 0) + (jb ? jb.offsetHeight : 0) + 8);
          window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); el.classList.add("flash"); setTimeout(function(){ el.classList.remove("flash"); }, 1800); }, 80); return; }
      // ⚡ 킥 카드는 포트 탭이 「킥 포트」일 때만 있으니, 없으면 킥 포트로 바꿔서 다시 찾기
      if (anchor === "pokick" && Date.now() - t0 > 400 && !find.sw){ var kb = document.querySelector('#pobody [data-pf="kick"]'); if (kb){ find.sw = 1; kb.click(); } }
      if (Date.now() - t0 < 8000) setTimeout(find, 150);
    })();
  };
  function deep(){
    var h = (location.hash || "").slice(1); if (h.indexOf("~") < 0) return;
    var p = h.split("~"); setTimeout(function(){ goTo(p[0], p[1]); }, 50);
  }
  window.addEventListener("hashchange", deep);
  window.addEventListener("load", function(){ setTimeout(deep, 400); });
  // 화면 연동 (10/10 사용자: "뭐든지 누르면 화면 연동 잘 되게") — 어디서든 ① 종목 이름(data-op) → 그 종목 화면 ② 줄·칩·카드(data-goto) → 그 탭의 그 카드
  document.addEventListener("click", function(ev){
    if (ev.defaultPrevented || !ev.target.closest) return;            // 다른 화면이 이미 처리한 클릭
    var op = ev.target.closest("[data-op]");
    if (op && window.openOP){ ev.preventDefault(); ev.stopPropagation(); openOP(op.getAttribute("data-op")); return; }
    var t = ev.target.closest("[data-goto]"); if (!t) return;
    // 10/19: 카드 안의 단추·링크(접기·펼치기·전체 보기 등)를 누르면 카드 전체 이동(data-goto)을 하지 않음
    var ctl = ev.target.closest("button,a,summary,input,select,label,.fold"); if (ctl && !ctl.hasAttribute("data-goto") && t !== ctl && t.contains(ctl)) return;
    ev.preventDefault(); var p = t.getAttribute("data-goto").split("~"); goTo(p[0], p[1]);
  });

  /* ---------- ① 🏠 오늘 ---------- */
  window.homeView = function(){ return '<div id="hmbody"><div class="loading">오늘 할 일 모으는 중…</div></div>'; };
  window.homeInit = function(){
    Promise.all([J("home.json"), J("sigindex.json").catch(function(){ return null; })]).then(function(a){ SIG = a[1] && a[1].ix; drawHome(a[0]); })
      .catch(function(){ var b = document.getElementById("hmbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">🏠</div>오늘 요약이 아직 안 올라왔어요.<br>매시간 자동으로 만들어져요.</div>'; });
  };
  function card(go, ic, t, sub, body, goLab){
    return '<section class="card hm-c" data-goto="' + go + '"><div class="hm-h"><span class="hm-i">' + ic + '</span><div><b>' + t + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><span class="hm-go">' + (goLab || "열기") + ' ›</span></div>' + body + '</section>';
  }
  /* ---------- 🗳 A9-5 「🔮 예고에 내 표 던지기」 — 표는 이 휴대폰 안(localStorage)에만 ---------- */
  var VOTE = {}, VH = {};
  try { VOTE = JSON.parse(localStorage.getItem("hvote") || "{}") || {}; VH = JSON.parse(localStorage.getItem("hvote_hist") || "{}") || {}; } catch(x) {}
  function keepVote(){ try { localStorage.setItem("hvote", JSON.stringify(VOTE)); localStorage.setItem("hvote_hist", JSON.stringify(VH)); } catch(x) {} }
  function prevKey(G){   // 어제 예고의 날짜: home.json 이 주면 그것, 없으면 표가 있는 날 중 채점일보다 앞선 가장 최근
    if (G.prev) return G.prev;
    var ks = Object.keys(VOTE).filter(function(k){ return !G.date || k < G.date; }).sort();
    return ks.length ? ks[ks.length - 1] : null;
  }
  function gradeVotes(G){   // 채점 카드 한 줄 — 앱 ✓✗ 와 내 ✓✗ 나란히 · 누적은 날짜당 한 번만 셈
    var pk = prevKey(G), mine = pk && VOTE[pk] || {}, out = {rows: [], me_ok: 0, me_n: 0, app_ok: 0, app_n: 0};
    (G.items || []).forEach(function(x, i){
      var v = mine[String(i + 1)], scored = x.cls === "ok" || x.cls === "no";
      if (scored){ out.app_n++; if (x.cls === "ok") out.app_ok++; }
      var r = null;
      if (v && scored){ r = (v > 0) === (x.cls === "ok"); out.me_n++; if (r) out.me_ok++; }
      out.rows.push({v: v, r: r});
    });
    if (G.date && out.app_n && !VH[G.date]){ VH[G.date] = {app_ok: out.app_ok, app_n: out.app_n, me_ok: out.me_ok, me_n: out.me_n}; keepVote(); }
    var T = {app_ok: 0, app_n: 0, me_ok: 0, me_n: 0};
    Object.keys(VH).forEach(function(k){ var h = VH[k]; T.app_ok += h.app_ok || 0; T.app_n += h.app_n || 0; T.me_ok += h.me_ok || 0; T.me_n += h.me_n || 0; });
    out.tot = T;
    return out;
  }
  function voteBtns(date, i){
    var v = (VOTE[date] || {})[String(i)];
    return '<span class="hm-vt"><button data-vote="' + e(date) + '|' + i + '|1" class="' + (v > 0 ? "on" : "") + '" aria-label="그렇다">👍</button><button data-vote="' + e(date) + '|' + i + '|-1" class="' + (v < 0 ? "on" : "") + '" aria-label="아니다">👎</button></span>';
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-vote]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var p = t.dataset.vote.split("|"), d = p[0], i = p[1], v = +p[2];
    VOTE[d] = VOTE[d] || {};
    if (VOTE[d][i] === v) delete VOTE[d][i]; else VOTE[d][i] = v;   // 같은 걸 또 누르면 취소
    keepVote();
    var wrap = t.closest(".hm-vt"); if (wrap){ [].forEach.call(wrap.children, function(b){ b.classList.toggle("on", (VOTE[d][i] || 0) === +b.dataset.vote.split("|")[2]); }); }
    if (window.P && window.P.toast) window.P.toast(VOTE[d][i] ? (v > 0 ? "👍 그렇다 — 내일 아침 채점해요" : "👎 아니다 — 내일 아침 채점해요") : "표 취소");
  }, true);

  /* ---------- 🌅 A9-1 시간대 맞춤 홈 — 지금 볼 카드를 맨 위로 (설정 「홈 순서」로 고정 가능) ---------- */
  function edition(now){   // now = 한국 시간으로 맞춘 Date (getUTC* 로 읽음)
    var m = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (m < 6 * 60) return {k: "night", ic: "🌙", t: "밤판", order: ["port", "score", "kick", "grade", "focus", "brain"], why: "미국 장 끝 — 포트 성적부터"};
    if (m < 9 * 60) return {k: "morn", ic: "🌅", t: "아침판", order: ["grade", "kick", "port", "focus", "brain", "score"], why: "어제 결과·오늘 할 일부터"};
    if (m < 15 * 60 + 30) return {k: "day", ic: "🌞", t: "장중판", order: ["focus", "brain", "kick", "port", "grade", "score"], why: "한국 장중 — 오늘 집중·지금 생각부터"};
    if (m < 22 * 60 + 30) return {k: "eve", ic: "🌆", t: "저녁판", order: ["kick", "grade", "port", "focus", "brain", "score"], why: "미국 장 전 — 킥 할 일·🔮 예고부터"};
    return {k: "night", ic: "🌙", t: "밤판", order: ["port", "score", "kick", "grade", "focus", "brain"], why: "미국 장중 — 포트 성적부터"};
  }
  var FIXED = ["grade", "port", "kick", "focus", "brain", "score"];

  function drawHome(H){
    var b = document.getElementById("hmbody"); if (!b) return;
    var P = H.port || {}, K = H.kick || {}, D = H.danta || {}, Bn = H.brain || {}, S = H.scores || {};
    var now = new Date(Date.now() + 9 * 3600e3), wd = "일월화수목금토"[now.getUTCDay()];
    var ED = edition(now), useTime = UI.home !== "fixed";
    // 10/15 A9-3: 「08:56 기준」 글자 → ⟳ 신선도 칩(ux1015.js 가 「N분 전」·색을 채움) · 가운뎃점 대신 간격
    var h = '<div class="hm-day"><span class="hm-date">' + (now.getUTCMonth() + 1) + '/' + now.getUTCDate() + ' (' + wd + ')</span>' +
      '<span class="hm-fresh" id="hmfresh" role="button" data-at="' + e(H.at || "") + '">⟳ ' + e(String(H.at || "").slice(11, 16)) + '</span>' +
      '</div>' +
      '<div class="hm-live" id="hmlive" data-ed="' + ED.k + '" role="button" hidden></div>';   // 10/15 A9-1 🌞 장중 띠 (ux1015.js)
    // 10/13 「더 자주 열게」 ③ 어제보다 바뀐 것 · ⑦ 이번 주 복기(주말) · ⑥ 어제 예고 → 오늘 결과
    var CH = (H.chg && H.chg.items) || [];
    /* 🧹 10/21 사용자 「앱이 복잡하고 산만하다 — 다 진행해」: 홈 = 오늘 한 장(① 오늘 한 줄+볼 곳 ux1019.js · ② 내 포트 · ③ 바뀐 것 3줄) — 나머지는 각 탭·🗂 신호 › 더 보기·📊 성적표로 */
    var chgH = "";
    if (CH.length) chgH = '<section class="card hm-chg" data-strip="home"><div class="hm-h"><span class="hm-i">🆕</span><div><b>바뀐 것</b><small>' + (H.chg.since ? md(H.chg.since) + ' 이후' : '') + (CH.length > 3 ? ' · 중요한 3가지' : '') + '</small></div></div>' +
      CH.slice(0, 3).map(function(x){ return '<div class="hm-chi" data-goto="' + e(x.go || "home") + '"><span>' + e(x.ic) + '</span>' + chgBody(x) + '<i>›</i></div>'; }).join("") + '</section>';
    var Wk = H.week || {}, dw = now.getUTCDay(), wkH = "";
    if ((dw === 6 || dw === 0) && Wk.days){
      var wb = [["💼 기본", Wk.base], ["⚡ 킥", Wk.kick], ["🎯 집중", Wk.conc]].filter(function(x){ return x[1] != null; });
      var wkH = card("port", "📅", "이번 주 복기", md(Wk.from) + "부터 " + Wk.days + "거래일 (미국 날짜)",
        '<div class="hm-big">' + wb.map(function(x){ return '<div><small>' + x[0] + '</small><b class="' + cls(x[1]) + '">' + sg(x[1]) + '</b></div>'; }).join("") + '</div>' +
        '<div class="hm-l">S&amp;P500 <b class="' + cls(Wk.spy) + '">' + sg(Wk.spy) + '</b> · 코스피 <b class="' + cls(Wk.kospi) + '">' + sg(Wk.kospi) + '</b>' +
        (Wk.rep && Wk.rep.n ? ' · 시황 예고 ✓' + Wk.rep.win + ' ✗' + Wk.rep.loss : '') +
        (Wk.kick_ev && (Wk.kick_ev.buy || Wk.kick_ev.sell) ? ' · 킥 사기 ' + Wk.kick_ev.buy + ' · 팔기 ' + Wk.kick_ev.sell : '') + '</div>' +
        ((Wk.next || []).length ? '<div class="hm-wn"><small>앞으로 볼 일정</small>' + Wk.next.map(function(x){ return '<div><b>' + e(x.when) + '</b> ' + e(x.what) + '</div>'; }).join("") + '</div>' : '') +
        '', "포트");
    }
    var C = {};
    // 💼 포트 (A9-2: 선 끝에 값 · 범례 없음)
    var ex = (P.kick || 0) - (P.spy || 0);
    var spark = (window.V && P.nav && P.nav.length > 1) ? V.lines([{name: "공격(킥)", short: "공격", color: "#ff6b6b", vals: P.kick_line}].concat((function(){ var c = (P.conc_line || []).slice(), n = (P.nav || []).length; while (c.length && c.length < n) c.unshift(0); return c.length === n ? [{name: "집중", short: "집중", color: "#4dd47a", vals: c}] : []; })()).concat([{name: "기본", short: "기본", color: "#e9c46a", vals: P.nav}, {name: "S&P", short: "S&P", color: "#7c9cff", vals: P.spy_line, dash: 1}]),
      (P.nav || []).map(function(_, i){ return i ? "" : md(P.start); }), {h: 96, unit: "%", zero: 1, nodots: 1, endLabels: 1, nolegend: 1}) : "";
    // ⚡ 공격(킥) 오늘 할 일 — 포트 카드 안 한 줄로 합침 (10/21)
    var ev = K.events || [];
    var kickLine = ev.length ? ev.map(function(x){ return '<div class="hm-ev ' + (x.k === "사기" ? "buy" : "sell") + '">' + (x.k === "사기" ? "🟢 사기" : x.k === "팔기" ? "🔴 팔기" : "🟡 절반") + ' <b data-op="' + e(x.code) + '">' + e(x.name) + ' ›</b>' + (x.r != null ? ' ' + sg(x.r, 1) : '') + (x.why ? ' <small>' + e(x.why) + '</small>' : '') + '</div>'; }).join("")
      : '<div class="hm-l mut">공격(킥) 오늘 할 일 없음 — ' + md(K.asof) + ' 마감 기준 그대로</div>';
    C.port = card("port~pohero", "💼", "내 포트", md(P.start) + "부터 · " + md(P.asof) + " 미국 종가",
      '<div class="hm-big"><div data-goto="port~pohero"><small>기본</small><b class="' + cls(P.base) + '" data-num="' + P.base + '" data-k="base">' + sg(P.base, 1) + '</b></div>' +
        '<div data-goto="port~pokick"><small>공격(킥)</small><b class="' + cls(P.kick) + '" data-num="' + P.kick + '" data-k="kick">' + sg(P.kick, 1) + '</b></div>' +
        (P.conc != null ? '<div data-goto="port~poconc"><small>집중</small><b class="' + cls(P.conc) + '" data-num="' + P.conc + '" data-k="conc">' + sg(P.conc, 1) + '</b></div>' : '') + '</div>' +
      '<div class="hm-l">S&amp;P500 <b class="' + cls(P.spy) + '">' + sg(P.spy, 1) + '</b> · <a data-goto="port~pocmp" class="hm-nw">시장 ' + P.n_bench + '곳 중 <b>' + P.beat_kick + '</b>곳 앞섬 <small>(공격)</small> ›</a></div>' +
      '<div class="hm-sp">' + spark + '</div>' +
      (P.change ? '<div class="hm-alert" data-goto="port~pofollow">🔁 ' + md(P.change.date) + ' 비중·상품 바뀜 — <b>따라하기에서 맞추기 ›</b></div>' : '') + kickLine, "포트");
    // 🎯 집중
    if ((H.focus || []).length) C.focus = card("market~mkfo", "🎯", "오늘 집중", "돈이 몰리는 테마",
      H.focus.map(function(t){ return '<div class="hm-f"><b>' + e(t.name) + '</b> <span class="hm-chip ' + (t.stage === "과열" ? "b" : "g") + '">' + e(t.stage || "") + '</span> <small>5일 ' + sg(t.r5, 1) + ' · S&P 대비 20일 ' + sg(t.rs20, 1) + 'p</small>' +
        '<div class="hm-l">' + e(t.do || "") + ((t.stars || []).length ? ' · ★ ' + t.stars.map(function(s){ return '<a data-op="' + e(s.t) + '">' + e(s.name) + '</a>'; }).join(", ") : '') + ((t.etf_kr || []).length ? ' · 🇰🇷 <a data-op="' + e(t.etf_kr[0].t) + '">' + e(t.etf_kr[0].name) + '</a>' : '') + '</div></div>'; }).join(""), "시황");
    // ⚡ 단타
    // 10/12: ⚡ 단타 카드 뺌 — 단타는 알림(앱·텔레그램)으로만
    // 🧠 두뇌
    // ⏳ 10/19 사용자 「지금 생각 시각 좀 봐라…」(10:50 에 09:35 급락 개장 문장) → 몇 분 전 생각인지 붙이고, 60분 넘으면 「그 뒤 시장」 한 줄을 장중 나침반에서 바로 채움
    var bnAge = Bn.at ? Math.round((Date.now() - Date.parse(String(Bn.at).replace(" ", "T") + ":00+09:00")) / 60000) : null;
    if (Bn.summary) C.brain = card("feed~fdbrain", "🧠", "지금 생각", (Bn.regime || "") + " · " + md(Bn.at) + " " + String(Bn.at || "").slice(11, 16) + (bnAge != null && bnAge >= 0 ? (bnAge < 60 ? " · " + bnAge + "분 전" : ' · <b class="dn">⏳ ' + (bnAge < 120 ? bnAge + "분" : Math.round(bnAge / 60) + "시간") + ' 전 생각</b>') : ""),
      (bnAge != null && bnAge >= 60 ? '<div class="hm-l" id="hmbrlive"><small class="mut">그 뒤 시장 불러오는 중…</small></div>' : '') +
      '<div class="hm-l">' + e(Bn.summary) + '</div>' + ((Bn.ideas || []).length ? '<div class="hm-chips">' + Bn.ideas.map(function(x){ var t = typeof x === "string" ? x : ((x["칸"] || x.box || "") + " " + (x["제안"] || x.idea || "")); return t.trim() ? '<span class="hm-chip" data-goto="port~poct">💡 ' + e(t) + '</span>' : ''; }).join("") + '</div>' : ''), "피드");
    // 📊 성적
    C.score = card("score", "📊", "성적 한 줄", "무엇이 이기고 지나",
      '<div class="hm-l">' + ((S.good || []).length ? '✅ ' + e(S.good.join(" · ")) : '') + ((S.bad || []).length ? '<br>❌ ' + e(S.bad.join(" · ")) : '') + (!(S.good || []).length && !(S.bad || []).length ? '표본이 쌓이는 중' : '') + '</div>', "성적표");
    h += (C.port || "") + chgH + (wkH || "") +
      '<div class="hm-more"><a data-goto="sector">🧭 나침반</a><a data-goto="sigmore">🗂 예고 채점·두뇌 논지</a><a data-goto="score">📊 성적표</a><a data-goto="feed~fdbrain">🧠 지금 생각</a><a data-gloss="1">📖 용어 풀이</a></div>';
    b.innerHTML = h;
    HSH = H;
    if (document.getElementById("hmbrlive")) getJSON("archive/x/live_kr.json?" + Math.floor(Date.now() / 120000), {ttl: 120000}).then(function(L){
      var el = document.getElementById("hmbrlive"); if (!el) return;
      var ix = L && L.index || [], ok = L && L.date === new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      if (!ok || !ix.length){ el.innerHTML = '<small class="mut">⏳ 아래 생각은 ' + e(String(Bn.at).slice(11, 16)) + ' 것 — 다음 검토 때 바뀌어요</small>'; return; }
      var ss = (L.sectors || []).filter(function(x){ return x.r != null; }).sort(function(a, b2){ return b2.r - a.r; });
      el.innerHTML = '<b>⚡ 그 뒤 ' + e(L.t) + ' 지금</b> ' + ix.map(function(x){ return e(x.name) + ' <b class="' + cls(x.chg) + '">' + sg(x.chg, 2) + '</b>'; }).join(" · ") +
        (ss.length ? ' · 강한 ' + e(ss[0].name) + ' ' + sg(ss[0].r, 1) + ' · 약한 ' + e(ss[ss.length - 1].name) + ' ' + sg(ss[ss.length - 1].r, 1) : '') +
        '<br><small class="mut">아래 생각은 ' + e(String(Bn.at).slice(11, 16)) + ' 것 — 그 사이 시장이 바뀌었을 수 있어요</small>';
    }).catch(function(){});
    var edl = document.getElementById("hmed"); if (edl) edl.onclick = function(ev){ ev.stopPropagation(); if (window.P && window.P.toast) window.P.toast(ED.ic + " " + ED.t + " — " + ED.why + " · 순서는 ⚙️ 설정에서"); };
    var sb = document.getElementById("hmstory"); if (sb) sb.onclick = function(ev){ ev.stopPropagation(); if (window.hmStory) hmStory(); };
    if (window.hmAfter) try { hmAfter(H); } catch(x) { if (window.console) console.warn("hmAfter", x); }   // 10/15 A9-1·3·4 (ux1015.js)
  }
  /* 🎯 어제 예고 → 오늘 결과 — 10/21부터 홈이 아니라 🎯 신호 › 🗂 더 보기(sigmore)에 */
  function gradeCard(H){
    var G = H && H.grade; if (!G || !(G.items || []).length) return "";
      var ok = G.items.filter(function(x){ return x.cls === "ok"; }).length, no = G.items.filter(function(x){ return x.cls === "no"; }).length;
      var GV = gradeVotes(G), meTxt = GV.me_n ? ' · 나 ✓' + GV.me_ok + ' ✗' + (GV.me_n - GV.me_ok) : '';
      var tot = GV.tot, cum = (tot.me_n >= 1 && tot.app_n >= 1) ? '<div class="hm-vs"><span>🗳 나 vs 앱 적중률</span>' +
        '<div><small>나</small><i><b style="width:' + Math.round(tot.me_ok / tot.me_n * 100) + '%"></b></i><em>' + Math.round(tot.me_ok / tot.me_n * 100) + '% <span class="mut">(' + tot.me_n + '건)</span></em></div>' +
        '<div><small>앱</small><i><b style="width:' + Math.round(tot.app_ok / tot.app_n * 100) + '%"></b></i><em>' + Math.round(tot.app_ok / tot.app_n * 100) + '% <span class="mut">(' + tot.app_n + '건)</span></em></div></div>' : '';
      return card("market", "🎯", "어제 예고 → 오늘 결과", md(G.date) + " " + e(G.label || "") + " 채점 · 앱 ✓" + ok + " ✗" + no + meTxt + (G.rate != null ? ' · 누적 적중 <span data-num="' + G.rate + '" data-k="rate" data-d="0" data-u="%" data-nosign="1">' + G.rate + '%</span>' : "") + ((G.last10 || []).length ? ' <span class="hm-l10" title="최근 ' + G.last10.length + '번 채점 (왼쪽이 옛날)">' + dots(G.last10) + '</span>' : ""),
        G.items.map(function(x, i){ var r = GV.rows[i] || {};
          return '<div class="hm-gr ' + e(x.cls || "") + '"><span>' + e(x.mark || "·") + '</span><div><b>' + e(x.t) +
            (r.v ? ' <span class="hm-me ' + (r.r === true ? "ok" : r.r === false ? "no" : "") + '">나 ' + (r.v > 0 ? "👍" : "👎") + (r.r === true ? " ✓" : r.r === false ? " ✗" : "") + '</span>' : '') +
            '</b>' + trail(x.tr, true) + '<small>' + e(x.x) + '</small></div></div>'; }).join("") + cum + voices(G.voices) +
        ((G.next || []).length ? '<div class="hm-wn"><small>🔮 오늘의 예고 — 내일 아침 채점 · 👍👎 로 내 표도</small>' + G.next.map(function(x, i){
          return '<div class="hm-nx">' + (x.p != null ? '<span class="hm-pb" title="앱이 보는 확률 ' + Math.round(x.p * 100) + '%"><i style="width:' + Math.round(x.p * 100) + '%"></i><b>' + Math.round(x.p * 100) + '%</b></span>' : '') +
            '<span class="hm-nxt">' + e(x.t) + trail(x.tr, false) + '</span>' + (G.date ? voteBtns(G.date, i + 1) : '') + '</div>'; }).join("") + '</div>' : '') +
        '<button class="hm-sh" data-share="grade">📤 카톡으로 공유</button>', "시황");
  }
  window.gradeCard = gradeCard;
  window.hmEdition = edition;
  /* ---------- 🔀 10/15 A9-2 「바뀐 것」 전 → 후 두 토막 · 같은 말은 흐리게 ---------- */
  function chgBody(x){
    var a = x.a, b = x.b, lab = x.lab, note = x.note;
    if (lab && a == null) return '<div class="hm-cb"><b>' + e(lab) + '</b>' + (x.sub ? '<small class="hm-cs">' + e(x.sub) + '</small>' : '') + '</div>';
    if (a == null || b == null){   // 옛 home.json — 「 → 」 마지막 것 기준으로 나눠 봄
      var t = String(x.t || ""), i = t.lastIndexOf(" → ");
      if (i < 0) return '<b>' + e(t) + '</b>';
      lab = ""; a = t.slice(0, i); b = t.slice(i + 3);
    }
    var sp = function(v){ return String(v).split(" / "); }, A = sp(a), B = sp(b);
    var mark = function(L, O){ return L.map(function(seg){ return '<span class="' + (O.indexOf(seg) >= 0 ? "same" : "diff") + '">' + e(seg) + '</span>'; }).join('<span class="sl"> / </span>'); };
    return '<div class="hm-cb">' + (lab ? '<b>' + e(lab) + (note ? ' <small>(' + e(note) + ')</small>' : '') + '</b>' : '') +
      ('<div class="hm-ab"><span class="hm-a">' + mark(A, B) + '</span><span class="hm-to">→</span><span class="hm-b">' + mark(B, A) + '</span></div>') + '</div>';
  }
  /* ---------- 🗣 10/19 A10/19-3 「엇갈린 날, 누가 맞았나」 — 코스피를 두고 🎲 시장확률 · 🧠 두뇌 · 💭 지금 생각(열쇠 적은 날만)을 매일 종가로 채점 (home.py voices · market/voices.json) ---------- */
  function voices(V){
    if (!V || !V.today) return "";
    var W = {up: "오름", down: "내림", flat: "중립"}, tv = V.today.v || {}, keys = [["dice", "🎲 시장확률"], ["brain", "🧠 두뇌"], ["think", "💭 지금 생각"]];
    var todayTxt = function(k){ var x = tv[k]; if (!x) return '<em class="mut">' + (k === "think" ? "열쇠 없음" : "—") + '</em>'; return '<em class="' + (x.d === "up" ? "up" : x.d === "down" ? "dn" : "") + '">' + e(k === "dice" && x.t ? x.t : (W[x.d] || x.d)) + (x.p != null ? ' ' + Math.round(x.p * 100) + '%' : '') + '</em>'; };
    var ds = Object.keys(tv).map(function(k){ return tv[k].d; }), one = ds.length >= 2 && ds.every(function(d){ return d === ds[0]; });
    var r = V.today.r, rTxt = r && r.chg != null ? ' · 코스피 종가 ' + (r.chg > 0 ? "+" : "") + r.chg.toFixed(2) + '%' : (V.today.at ? ' · ' + e(V.today.at) + ' 적어 둠, 마감 뒤 채점' : '');
    var row = function(k, lab, S){ S = S || {}; var n = S.n || 0, w = S.win || 0;
      return '<div class="hm-vr"><span>' + lab + '</span>' + (k ? todayTxt(k) : '<em class="mut">' + (one ? "오늘 한목소리 " + e(W[ds[0]]) : "오늘은 엇갈림") + '</em>') +
        '<b>' + ((S.last10 || []).length ? dots(S.last10) : '') + (n ? ' ✓' + w + ' ✗' + (n - w) + (n >= 10 ? ' <i class="pc">' + Math.round(w / n * 100) + '%</i>' : '') : '<i class="mut">아직 0</i>') + '</b></div>'; };
    return '<div class="hm-vc"><small>🗣 코스피를 두고 앱의 세 목소리 — 장 시작 무렵 적어 두고 매일 종가로 채점' + rTxt + '</small>' +
      keys.map(function(z){ return row(z[0], z[1], V[z[0]]); }).join("") + row(null, "🎯 한목소리 날", V.chorus) +
      '<div class="hm-vn">오름 = 종가 + · 내림 = − · 중립 = ±0.5% 안 · 💭 는 지금 생각에 방향 열쇠를 적은 날만 · ' + (V.days || 0) + '일 채점</div></div>';
  }

  /* ---------- 🧵 10/15 A9-5 예고 실타래 — 같은 주제 최근 맞음(●)·빗나감(○) ---------- */
  function dots(L){ return (L || []).map(function(m){ var v = typeof m === "string" ? m : m.m; return '<i class="' + (v === "ok" ? "o" : "x") + '"></i>'; }).join(""); }
  function trail(tr, inGrade){
    if (!tr || !tr.length || (inGrade && tr.length < 2)) return "";
    var last = tr[tr.length - 1].m, run = 0; for (var i = tr.length - 1; i >= 0 && tr[i].m === last; i--) run++;
    var ok = tr.filter(function(x){ return x.m === "ok"; }).length;
    var lab = run >= 2 ? (last === "ok" ? run + "번 연속 맞음" : run + "번 연속 빗나감") : "최근 " + tr.length + "번 ✓" + ok + " ✗" + (tr.length - ok);
    return '<span class="hm-tr" role="button" title="같은 주제 최근 채점 — 누르면 날짜별">' + dots(tr) + '<em class="' + (run >= 2 ? (last === "ok" ? "ok" : "no") : "") + '">' + lab + '</em></span>' +
      '<span class="hm-trd" hidden>' + tr.map(function(x){ return md(x.d) + ' ' + (x.m === "ok" ? "✓" : "✗"); }).join(" · ") + ' <span class="mut">(채점한 날)</span></span>';
  }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest(".hm-tr"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var d = t.nextElementSibling; if (d && d.classList.contains("hm-trd")) d.hidden = !d.hidden;
  }, true);
  // ⑧ 공유: 카드 내용을 글로 만들어 휴대폰 공유창(카톡 등)으로
  var HSH = null;
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-share]"); if (!t || !HSH) return;
    ev.preventDefault(); ev.stopPropagation();
    var H = HSH, P = H.port || {}, k = t.dataset.share, txt = "", hash = "";
    if (k === "port"){ txt = "💼 CH Investing 포트 (" + md(P.start) + "부터)\n" + (P.conc != null ? "🎯 집중 " + sg(P.conc) + " · " : "") + "⚡ 킥 " + sg(P.kick) + " · 💼 기본 " + sg(P.base) + "\nS&P500 " + sg(P.spy) + " · 시장 " + P.n_bench + "곳 중 " + P.beat_kick + "곳보다 앞섬"; hash = "port"; }
    else if (k === "grade"){ var G = H.grade || {}; txt = "🎯 시황 예고 채점 (" + md(G.date) + ")\n" + (G.items || []).map(function(x){ return x.mark + " " + x.t; }).join("\n") + (G.rate != null ? "\n누적 적중 " + G.rate + "%" : "") + ((G.next || []).length ? "\n\n🔮 오늘 예고\n" + G.next.map(function(x){ return (x.p != null ? Math.round(x.p * 100) + "% " : "") + x.t; }).join("\n") : ""); hash = "market"; }
    else if (k === "week"){ var W = H.week || {}; txt = "📅 이번 주 복기 (" + md(W.from) + "부터)\n💼 기본 " + sg(W.base) + (W.kick != null ? " · ⚡ 킥 " + sg(W.kick) : "") + (W.conc != null ? " · 🎯 집중 " + sg(W.conc) : "") + "\nS&P500 " + sg(W.spy) + " · 코스피 " + sg(W.kospi); hash = "home"; }
    if (window.chShare) chShare("CH Investing", txt + "\n\n※ 투자 참고용 · 매수 추천 아님", hash);
  }, true);

  /* ---------- 🗂 10/21 신호 › 더 보기 — 「있으면 좋은 것」 한 단계 아래 (사용자: 「6번은 신호 탭 안에서 한 단계 내리는 걸로」)
     ① 어제 예고 → 오늘 결과(예고 채점 · 내 표) ② 두뇌 논지 목록 ③ 고래·컵·갭 상세 · 단타 통계 · 조용한 매집 바로가기 ---------- */
  window.sigmoreView = function(){ return '<div id="smbody"><div class="loading">모으는 중…</div></div>'; };
  window.sigmoreInit = function(){
    Promise.all([J("home.json").catch(function(){ return null; }), getJSON("https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/brain/state.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })]).then(function(a){
      var b = document.getElementById("smbody"); if (!b) return;
      var H = a[0] || {}, T = a[1] || {}; HSH = H;
      var h = gradeCard(H) || '<section class="card"><h3>🎯 예고 채점</h3><div class="empty">오늘 채점이 아직 없어요.</div></section>';
      var th = (T.theses || []).slice().sort(function(x, y){ return (y.conf || 0) - (x.conf || 0); });
      if (th.length) h += '<section class="card sm-th"><h3>🧠 두뇌 논지 <span class="mut">' + th.length + '개 · 확신 높은 순 · 매시간 점검</span></h3>' + th.map(function(x){
        var c = Math.round((x.conf || 0) * 100);
        return '<div class="sm-t"><div class="sm-tb"><b>' + e(x.t) + '</b><span class="sm-c"><i style="width:' + c + '%"></i><em>' + c + '%</em></span></div>' +
          (x.breaks ? '<small>이러면 틀림 — ' + e(x.breaks) + '</small>' : '') + (x.since ? '<small class="mut">' + md(x.since) + '부터</small>' : '') + '</div>'; }).join("") + '</section>';
      var L = [["whale", "🐋", "고래 상세", "고래별 성적·합의 매수·매도 경보 등 17가지"], ["cup", "☕", "컵 상세", "돌파 후 추적·주봉 컵·신호 성적표"], ["gap", "📈", "갭 상세", "갭 메움·미국 밤 갭·실적 갭"],
               ["danta", "⚡", "단타 통계", "전광판·날짜별 성적 (알림으로 받는 것)"], ["accum", "🤫", "조용한 매집", "거래량 이상·박스 돌파 (참고용)"]];
      h += '<section class="card"><h3>📂 신호 상세 <span class="mut">각 화면 맨 아래 「더 보기」</span></h3>' + L.map(function(x){
        return '<div class="sm-go" data-goto="' + x[0] + '"><span>' + x[1] + '</span><div><b>' + x[2] + '</b><small>' + x[3] + '</small></div><i>›</i></div>'; }).join("") + '</section>';
      b.innerHTML = h;
    });
  };
  /* ---------- ③ 📊 성적표 ---------- */
  window.scoreView = function(){ return '<div id="scbody"><div class="loading">채점 모으는 중…</div></div>'; };
  window.scoreInit = function(){
    Promise.all([J("scores.json"), getJSON("archive/x/prob.json?" + Math.floor(Date.now() / 600000), {ttl: 600000}).catch(function(){ return null; })]).then(function(a){ drawScore(a[0], a[1]); }).catch(function(){ var b = document.getElementById("scbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">📊</div>성적표가 아직 안 올라왔어요.</div>'; });
  };
  function bar(w, l){ var n = (w || 0) + (l || 0); if (!n) return ''; return '<div class="sc-bar"><span class="w" style="flex:' + w + '">' + (w ? w : "") + '</span><span class="l" style="flex:' + l + '">' + (l ? l : "") + '</span></div>'; }
  /* 🩺 10/29 성적표 ⚡ 신호별에 「nh52·pead·cust·ins·earn·maxcut·frog」 영어 내부 이름이 그대로 보이던 것 — 건강검진 「영어 내부 이름」 검사로 찾음 */
  var SIGK = {cup: "컵", gap: "갭", accum: "매집", whale: "고래", focus: "집중", lead: "선행", nh52: "52주 신고가", pead: "실적 표류", dip: "급락 반등", trend: "추세",
    cust: "고객사 따라", ins: "내부자 매수", earn: "실적 갭", maxcut: "복권 거름망", frog: "개구리 갭", agree: "신호 겹침", nonews: "뉴스 없는 갭", pbskip: "눌림 안 온 갭", krgap: "한국 돌파 갭", cup_eye: "컵(눈 검사)"};
  function drawScore(S, PB){
    var b = document.getElementById("scbody"); if (!b) return;
    /* 🎲 10/21: 홈 첫 카드의 「아직 동전보다 못함」 경고·적중률은 여기로 (전면엔 말로만) */
    var d1 = PB && PB.score && PB.score.all && PB.score.all.d1 || {}, okN = d1.n ? Math.round(d1.hit / 100 * d1.n) : 0, proven = (d1.n || 0) >= 20 && (d1.hit || 0) >= 55;
    var pcard = d1.n ? '<section class="card sc-c" data-goto="prob"><div class="sc-h"><span class="hm-i">🎲</span><div><b>시장확률 — 다음 날 방향</b><small>홈 「오늘 한 줄」이 얼마나 맞나 · 5개 시장 합산</small></div>' +
      '<div class="sc-rate ' + (d1.hit >= 55 ? "up" : d1.hit < 45 ? "dn" : "") + '">' + Math.round(d1.hit) + '%<small>맞음</small></div><span class="hm-go">보기 ›</span></div>' + bar(okN, d1.n - okN) +
      '<p class="note">' + d1.n + '번 중 ' + okN + '번 맞음. ' + (proven ? '20번 넘게 채점해 55%를 넘어서, 홈에서 「세게」 말해요.' : '<b>아직 동전보다 확실히 낫지 않아요</b> — 20번 넘게 채점해 55%를 넘기 전까지 홈에서는 「약간 오를 쪽」처럼 약하게만 말해요. 이 숫자로 사고팔지 마세요.') + '</p></section>' : '';
    /* 📊 10/31 B9 「번 돈÷잃은 돈 1.6 (비용 뺀 36건)」 글자 벽 → 막대 그림 — 가운데 선 = 본전(1배), 오른쪽 초록 = 버는 쪽, 왼쪽 빨강 = 잃는 쪽 */
    var pfRow = function(x, good){ var m = /^(.*?)\s*손익비\s*([\d.]+)\s*(?:\((.*)\))?/.exec(String(x)); if (!m) return '<div class="pf-r"><span class="pf-n">' + e(x) + '</span></div>';
      var v = +m[2], L = Math.min(1, Math.abs(Math.log(Math.max(v, 0.05))) / Math.log(4)) * 50, sub = (m[3] || "").replace(/비용 뺀\s*/, "").replace(/비용 전\s*([\d.]+)/, "비용 빼기 전 $1배");
      return '<div class="pf-r"><span class="pf-n">' + e(m[1]) + (sub ? '<small>' + e(sub) + '</small>' : '') + '</span><span class="pf-t"><i class="pf-z"></i><i class="pf-b ' + (v >= 1 ? "g" : "r") + '" style="' + (v >= 1 ? "left:50%" : "right:50%") + ';width:' + L.toFixed(1) + '%"></i></span><b class="pf-v ' + (v >= 1 ? "g" : "r") + '">' + v.toFixed(v >= 10 ? 0 : 1) + '배</b></div>'; };
    var pfAll = (S.good || []).map(function(x){ return pfRow(x, 1); }).concat((S.bad || []).map(function(x){ return pfRow(x, 0); }));
    var h = pcard + '<section class="card sc-top sc-c" data-goto="port~pokick"><div class="sc-h"><span class="hm-i">⚖️</span><div><b>신호별 번 돈 ÷ 잃은 돈</b><small>가운데 선 = 본전(1배) · 오른쪽으로 길수록 잘 버는 신호</small></div></div>' +
      (pfAll.length ? '<div class="pf-l">' + pfAll.join("") + '</div>' : '<p class="mut">표본 쌓는 중</p>') +
      '<p class="note">매시간 자동 채점 · ' + e(String(S.at || "").slice(5)) + ' · 매일 저녁 자가 업그레이드가 이 숫자로 규칙을 고쳐요(지는 건 줄이고 이기는 건 늘림).</p></section>';
    (S.rows || []).forEach(function(r){
      var top = '<div class="sc-h"><span class="hm-i">' + r.ic + '</span><div><b>' + e(r.t) + '</b><small>' + e(r.note || "") + '</small></div>' +
        (r.rate != null && ((r.win || 0) + (r.loss || 0) >= 5 || (r.k === "kick" && (r.n || 0) >= 5)) ? '<div class="sc-rate ' + (r.rate >= 55 ? "up" : r.rate < 45 ? "dn" : "") + '">' + r.rate + '%<small>맞음</small></div>' : r.avg != null ? '<div class="sc-rate ' + cls(r.avg) + '">' + sg(r.avg, 1) + '<small>평균</small></div>' : '') + '</div>';
      var nn = (r.win || 0) + (r.loss || 0);
      var body = nn && nn < 5 && r.k !== "port" ? '<div class="sc-few">표본 ' + nn + '건 — 5건 넘으면 비율을 보여 줘요</div>' : bar(r.win, r.loss);
      if (r.k === "report" && r.recent) body += r.recent.map(function(x){ return '<div class="sc-li"><span class="sc-v ' + (/맞/.test(x.v) ? "w" : /틀/.test(x.v) ? "l" : "") + '">' + e(x.v) + '</span>' + md(x.d) + ' ' + e(String(x.t || "").slice(0, 70)) + '</div>'; }).join("");
      if (r.k === "report" && r.cal && r.cal.n) body += '<div class="sc-cal"><b>🎯 확률 채점 ' + r.cal.n + '건 · 브라이어 ' + r.cal.brier + ' <span class="mut">(0 완벽 · 0.25 동전)</span> · ' + e(r.cal.tone || "") + '</b>' +
        (r.cal.cats || []).map(function(c){ return '<span class="' + (c.ok ? "ok" : "") + '">' + e(c.k) + ' ' + c.rate + '% <small>' + c.n + '건</small>' + (c.ok ? ' ✓' : '') + '</span>'; }).join("") +
        '<small>' + e(r.cal.gate || "") + ' · ✓ = 비중을 바꿔도 되는 분야</small></div>';
      if (r.k === "kick" && r.sig) body += '<div class="sc-sig">' + r.sig.map(function(x){ return '<div class="' + (x.shadow ? "sh" : x.trial ? "tr" : x.on ? "on" : "off") + '"><b>' + e(x.tag) + ' ' + e(SIGK[x.k] || x.name || x.k) + '</b>' +
        '<small>' + (x.shadow ? "👻 그림자 " : x.trial ? "🧪 시험 " : x.on ? "✓ 킥에 들어감 " : "⏳ 대기 ") + (x.n != null ? x.n + "건" : "") + (x.avg != null ? " · 평균 " + sg(x.avg, 1) : "") + (x.pf ? " · 손익비 " + x.pf : "") + '</small>' +
        (window.HON ? '<div class="sc-hon">' + (x.h_n ? HON.chip(x.h_avg, {n: x.h_n, pf: x.h_pf, basis: x.h_basis, oos: x.h_oos}) + HON.tags(x) : '') + (x.k === "whale" ? HON.whale(x) : '') + '</div>' : '') + '</div>'; }).join("") + '</div>' +
        (r.honest_ret != null && window.HON ? '<div class="sc-hon">⚡ 킥 포트 전체 ' + HON.chip(r.honest_ret, {d: 2, note: r.honest_note}) + '</div>' : '');
      if (r.k === "danta" && r.rows) body += '<table class="lrn"><tr><th></th><th>09시</th><th>10시</th><th>11~12시</th><th>13시~</th></tr>' + r.rows.map(function(x){
        return '<tr><td>' + e(x.k) + '<small>' + (x.n || 0) + '건 ' + sg(x.avg) + '</small></td>' + ["09시", "10시", "11~12시", "13시 이후"].map(function(s){ var c = (x.slots || {})[s] || {};
          return '<td><b class="st-' + e(c.st) + '">' + e({"강함": "⭐", "켬": "켬", "관찰": "👀", "닫힘": "닫힘"}[c.st] || "–") + '</b><small>' + (c.n ? c.n + "건 " + sg(c.avg, 1) : "") + '</small></td>'; }).join("") + '</tr>'; }).join("") + '</table>';
      if (r.k === "picks" && r.rows) body += r.rows.map(function(x){ return '<div class="sc-li">' + e(x.name) + ' · ' + e((x.picks || []).join("·")) + (x.edge != null ? ' <b class="' + cls(x.edge) + '">' + (x.edge >= 0 ? "앞섬 " : "뒤짐 ") + sg(x.edge, 1).replace("%", "p") + '</b>' : ' <span class="mut">채점 대기</span>') + '</div>'; }).join("");
      var GO = {report: "market", bets: "feed~fdbrain", kick: "port~pokick", picks: "port~poct", focus: "market~mkfo", port: "port~pocmp", whale: "port~pokick"}[r.k];
      h += '<section class="card sc-c"' + (GO ? ' data-goto="' + GO + '"' : '') + '>' + top.replace('</div></div>', '</div><span class="hm-go">보기 ›</span></div>') + body + '</section>';
    });
    b.innerHTML = h + '<div id="scrbt"></div>';
    J("rules_bt.json").then(function(T){ var x = document.getElementById("scrbt"); if (!x || !T || !T.rows) return;
      x.outerHTML = '<section class="card sc-bt" id="scrbt"><h3>🧪 포트 규칙 검증 <span class="mut">' + e(T.from.slice(0, 4)) + '~' + e(T.to.slice(0, 4)) + ' · 매주 일요일 다시</span></h3>' +
        '<table class="sc-bt-t"><tr><th></th><th>연 수익</th><th>최대 낙폭</th><th>샤프</th><th></th></tr>' + T.rows.map(function(r){
          return '<tr' + (/켬/.test(r.lab) ? ' class="kp"' : '') + '><td>' + e(r.lab) + '</td><td class="' + cls(r.cagr) + '">' + sg(r.cagr, 1) + '</td><td>' + r.mdd + '%</td><td>' + (r.sharpe != null ? r.sharpe : "–") + '</td><td>' + e(r.verdict || "") + '</td></tr>'; }).join("") + '</table>' +
        '<p class="note">「같은 비중」에 규칙 하나씩 붙여 본 결과예요. ✅ 나아진 것만 킥 포트에 켜요 — 지금은 ① 국면 현금만 켜져 있어요. ' + e(T.note || "") + '</p><p class="note" id="sctri"></p></section>';
      // 🧾 10/22 시도 장부 — 지금까지 시험한 조합 수 한 줄 (조합이 많을수록 1등은 운으로도 좋아 보임)
      J("trials.json").then(function(R){ var y = document.getElementById("sctri"); if (y && R && R.line) y.textContent = R.line; }).catch(function(){});
    }).catch(function(){});
  }

  /* ---------- ⑤ 접히는 카드 + 바로가기 칩 (💼 포트) ---------- */
  var FOLD = {};
  try { FOLD = JSON.parse(localStorage.getItem("fold") || "{}"); } catch(x) {}
  // 10/21 「결론 → 근거」: 포트 탭 묶음은 처음엔 모두 접힘(맨 위 「부터 성적」이 결론) — 한 번 펼치면 기억
  var FMAP = [[/시장 .*비교/, "pocmp", "🏁 비교", 0], [/목소리 경주/, "povoice", "🗣 목소리", 0], [/집중 포트/, "poconc", "🎯 집중", 0], [/섹터 의견/, "poviews", "🧭 섹터", 0], [/킥 칸 속/, "pokick", "⚡ 킥", 0], [/이렇게 담으면/, "pofollow", "📋 따라하기", 0], [/비중 바뀐 날/, "potl", "🔁 바뀐 날", 0],
              [/해외 동종주/, "popeers", "🌏 동종주", 0], [/벌고 잃었나/, "poct", "🧩 칸별", 0], [/날짜별/, "podt", "📅 날짜별", 0]];
  window.foldify = function(root){
    if (!root) return;
    var kids = [].slice.call(root.children), groups = [], g = null;
    kids.forEach(function(k){
      if (k.classList.contains("sec")){
        var t = k.textContent, m = FMAP.filter(function(x){ return x[0].test(t); })[0];
        g = m ? {sec: k, m: m, body: []} : null; if (g) groups.push(g); return;
      }
      if (g && !k.classList.contains("po-mode") && !k.classList.contains("po-hero") && k.id !== "podz") g.body.push(k); else g = null;
    });
    if (!groups.length) return;
    groups.forEach(function(x){
      var id = x.m[1], open = FOLD[id] == null ? !!x.m[3] : !!FOLD[id];
      var w = document.createElement("div"); w.className = "fold" + (open ? " open" : ""); w.id = id;
      x.sec.parentNode.insertBefore(w, x.sec);
      x.sec.classList.add("fold-h"); x.sec.insertAdjacentHTML("beforeend", '<i class="fchev"></i>');   // 글자는 CSS(펼치기 ▾ / 접기 ▴)
      w.appendChild(x.sec);
      var bd = document.createElement("div"); bd.className = "fold-b"; x.body.forEach(function(n){ bd.appendChild(n); }); w.appendChild(bd);
      // 11/05 사용자 「집중 포트 눌렀더니 닫기 버튼이 없어」 — 펼친 묶음 맨 아래에 「접기 ▴」 (제목 줄 ▾ 만으로는 안 보임) · 제목 줄도 「펼치기 ▾ / 접기 ▴」 글자로
      var cb = document.createElement("button"); cb.type = "button"; cb.className = "fold-x"; cb.textContent = "접기 ▴"; bd.appendChild(cb);
      var setF = function(o){ w.classList.toggle("open", o); FOLD[id] = o ? 1 : 0; try { localStorage.setItem("fold", JSON.stringify(FOLD)); } catch(z) {} };
      cb.onclick = function(ev){ ev.stopPropagation(); setF(false); var y = w.getBoundingClientRect().top; var hh = (document.querySelector("header") || {}).offsetHeight || 0; if (y < hh + 46) window.scrollTo({top: window.scrollY + y - hh - 52, behavior: "instant"}); };
      x.sec.onclick = function(ev){ if (ev.target.closest("button,a,[data-op],.tt-i")) return; setF(!w.classList.contains("open")); };
    });
    var bar_ = document.createElement("div"); bar_.className = "fold-jump";
    bar_.innerHTML = '<button data-j="pohero">💼 성적</button>' + groups.map(function(x){ return '<button data-j="' + x.m[1] + '">' + x.m[2] + '</button>'; }).join("");
    root.insertBefore(bar_, root.firstChild);
    var hero = root.querySelector(".po-hero"); if (hero && !hero.id) hero.id = "pohero";
    [].forEach.call(bar_.querySelectorAll("button"), function(bt){ bt.onclick = function(){ var el = document.getElementById(bt.dataset.j); if (!el) return;
      if (el.classList.contains("fold") && !el.classList.contains("open")){ el.classList.add("open"); FOLD[el.id] = 1; try { localStorage.setItem("fold", JSON.stringify(FOLD)); } catch(z) {} }
      var y = el.getBoundingClientRect().top + window.scrollY - (document.querySelector("header").offsetHeight + 46); window.scrollTo({top: y, behavior: "smooth"}); }; });
  };

  /* ---------- ⑦ 종목 화면 신호 배지: 포트·킥·집중·두뇌까지 ---------- */
  var SIG = null;
  function sigOf(sym){
    var p = SIG ? Promise.resolve(SIG) : J("sigindex.json").then(function(j){ SIG = j.ix; return SIG; }).catch(function(){ return {}; });
    return p.then(function(ix){ var s = String(sym || "").toUpperCase(), c = s.replace(/\.(KS|KQ)$/, ""); return ix[s] || ix[c] || ix[c.replace(/^0+/, "")] || null; });
  }
  var _sb = window.sigBadges;
  if (_sb) window.sigBadges = function(sym){
    return Promise.all([_sb(sym).catch(function(){ return ""; }), sigOf(sym)]).then(function(a){
      var x = a[1]; if (!x) return a[0];
      var parts = [];
      if (x.tags) parts.push('<span class="sgx-t">' + e(x.tags) + '</span>');
      if (x.kick != null) parts.push('<a class="sgx k" data-goto="port~pokick">⚡ 킥에 ' + (+x.kick).toFixed(1) + '% 들어 있음' + (x.kick_r != null ? ' <b class="' + cls(x.kick_r) + '">' + sg(x.kick_r, 1) + '</b>' : '') + '</a>');
      if (x.port) parts.push('<a class="sgx p" data-goto="port~pofollow">💼 포트 「' + e(x.port) + '」 칸 상품</a>');
      if (x.focus) parts.push('<a class="sgx f" data-goto="market">🎯 오늘 집중 「' + e(x.focus) + '」 ★</a>');
      if (x.bet) parts.push('<a class="sgx b" data-goto="feed">🧠 두뇌 선제 아이디어 · ' + e(x.bet) + '</a>');
      if (!parts.length) return a[0];
      return '<div class="card sgx-c">' + parts.join("") + '</div>' + a[0];
    });
  };

  /* ---------- 탭 그리기 보완: 홈·성적 버튼은 같은 모양 ---------- */
  var css = document.createElement("style");
  css.textContent = [
    /* 탭: 두 줄 7칸 (아이콘 위·글자 아래) */
    "header .tabs{grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:2px 8px 8px}",
    "header .tab{flex-direction:column;gap:1px;padding:5px 0 4px;font-size:12.5px;border-radius:10px;letter-spacing:-.6px}",
    "header .tab .ic{font-size:16px}",
    "@media (max-width:350px){header .tab .ic{display:block;font-size:14px}header .tab{font-size:12.5px}}",
    "#uibtn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:3px 8px;font-size:14px;margin-left:8px;cursor:pointer}",
    "#uiset{position:fixed;z-index:60;top:calc(env(safe-area-inset-top) + 52px);right:12px;width:260px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:12px;box-shadow:0 18px 40px -12px rgba(0,0,0,.5)}",
    ".us-go{display:flex;flex-direction:column;gap:6px;margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.us-go button{text-align:left;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:9px 10px;font:inherit;font-size:14px;cursor:pointer}",
    "#uiset b{display:block;margin-bottom:8px}#uiset small{display:block;color:var(--sub);font-size:12.5px;margin-top:8px}",
    ".us-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}.us-r>span{font-size:13px;color:var(--sub)}",
    ".us-seg{display:flex;gap:4px}.us-seg button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:9px;padding:5px 8px;font:inherit;font-size:12.5px;cursor:pointer}.us-seg button.on{background:var(--c,#7c9cff);color:#111;border-color:transparent;font-weight:800}",
    /* 홈 */
    ".hm-day{font-size:13px;color:var(--sub);margin:-4px 2px 10px;display:flex;align-items:center;flex-wrap:wrap;gap:5px}.hm-date{white-space:nowrap}.hm-day .hm-story{padding:3px 8px}.hm-day>*{flex-shrink:0}.hm-cs{display:block;font-size:12.5px;color:var(--sub);margin-top:2px;line-height:1.4}",
    /* 10/14 A9-1 시간대 라벨 · A9-4 30초 스토리 버튼 */
    ".hm-ed{background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:12.5px;color:var(--text);cursor:pointer;white-space:nowrap}",
    ".hm-story{margin-left:auto;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer}",
    /* A9-2 줄 안 꺾임 · 선 끝 라벨 */
    ".hm-nw{white-space:nowrap}.lc-e{font-size:12.5px}",
    /* A9-3 킥 제목 · 잘 가는/안 가는 줄 */
    ".hm-kt.rest{color:var(--sub);font-weight:700}.hm-kt.buy{color:#4dd47a}.hm-kt.sell{color:#ff8a8a}.hm-cl{flex:none;align-self:center;font-size:12.5px;color:var(--sub);font-weight:700;margin-right:2px}",
    /* A9-5 🔮 예고 표 · 확률 막대 · 나 vs 앱 */
    ".hm-nx{display:flex;align-items:center;gap:7px;padding:5px 0;border-top:1px dashed var(--line)}.hm-nx:first-of-type{border-top:0}.hm-nxt{flex:1;min-width:0}",
    ".hm-pb{position:relative;flex:none;width:44px;height:16px;border-radius:5px;background:var(--panel);overflow:hidden;border:1px solid var(--line)}.hm-pb i{position:absolute;left:0;top:0;bottom:0;background:rgba(255,184,77,.55)}.hm-pb b{position:absolute;inset:0;font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;justify-content:center}",
    ".hm-vt{display:flex;flex:none;gap:3px}.hm-vt button{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:2px 6px;font-size:14px;line-height:1.2;cursor:pointer;opacity:.75}.hm-vt button.on{opacity:1;border-color:#ffb84d;background:rgba(255,184,77,.22)}",
    ".hm-me{font-size:12.5px;font-weight:700;color:var(--sub);background:var(--panel2);border-radius:6px;padding:0 5px;margin-left:4px;white-space:nowrap}.hm-me.ok{color:#4dd47a}.hm-me.no{color:#ff8a8a}",
    ".hm-vs{margin-top:8px;background:var(--panel2);border-radius:10px;padding:7px 10px;font-size:12.5px}.hm-vs>span{display:block;font-weight:800;margin-bottom:4px}.hm-vs>div{display:flex;align-items:center;gap:7px;margin:3px 0}.hm-vs small{width:18px;color:var(--sub);font-weight:700}.hm-vs i{flex:1;height:8px;border-radius:4px;background:var(--panel);overflow:hidden;display:block}.hm-vs i b{display:block;height:100%;background:#7c9cff;border-radius:4px}.hm-vs>div:first-of-type i b{background:#ffb84d}.hm-vs em{font-style:normal;font-weight:800;width:72px;text-align:right;white-space:nowrap}",
    ".hm-c{cursor:pointer;transition:transform .12s}.hm-c:active{transform:scale(.99)}",
    ".hm-cb{flex:1;min-width:0}.hm-cb>b{display:block;font-weight:700;font-size:13.5px}.hm-cb>b small{font-weight:600;color:var(--sub);font-size:12.5px}" +
    ".hm-ab{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;margin-top:3px}.hm-a,.hm-b{border-radius:8px;padding:2px 8px;font-size:12.5px;line-height:1.45}.hm-a{background:var(--panel2);color:var(--sub)}.hm-b{background:color-mix(in srgb,var(--acc,#7c9cff) 16%,var(--panel2));font-weight:700}" +
    ".hm-a .diff{text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--sub) 60%,transparent)}.hm-a .same,.hm-b .same{opacity:.55}.hm-b .diff{color:var(--text)}.hm-ab .sl{opacity:.4}.hm-to{color:var(--dim);font-weight:800}" +
    ".hm-tr{display:inline-flex;align-items:center;gap:3px;margin:3px 0 1px;cursor:pointer;vertical-align:middle}.hm-tr em,.hm-l10{font-style:normal}.hm-tr em{font-size:12.5px;color:var(--sub);margin-left:4px;font-weight:700}.hm-tr em.no{color:#ff8a8a}.hm-tr em.ok{color:#4dd47a}" +
    ".hm-tr i,.hm-l10 i{display:inline-block;width:8px;height:8px;border-radius:50%}.hm-tr i.o,.hm-l10 i.o{background:#4dd47a}.hm-tr i.x,.hm-l10 i.x{border:1.5px solid #ff8a8a;box-sizing:border-box}" +
    ".hm-l10{display:inline-flex;gap:2px;vertical-align:middle;margin-left:2px}.hm-trd[hidden]{display:none!important}.hm-trd{display:block;font-size:12.5px;color:var(--sub);margin:2px 0 3px}.hm-nxt .hm-tr{display:flex}" +
    ".hm-vc{margin-top:8px;background:var(--panel2);border-radius:10px;padding:7px 10px;font-size:12.5px}.hm-vc>small{display:block;color:var(--sub);margin-bottom:4px;line-height:1.4}.hm-vr{display:flex;align-items:center;gap:6px;margin:4px 0;white-space:nowrap}.hm-vr>span{width:84px;flex:none;font-weight:700}.hm-vr>em{flex:1;min-width:0;font-style:normal;font-weight:800;overflow:hidden;text-overflow:ellipsis}.hm-vr>em.up{color:var(--up)}.hm-vr>em.dn{color:var(--dn)}.hm-vr>em.mut{color:var(--dim);font-weight:500}.hm-vr>b{display:inline-flex;align-items:center;gap:2px;font-size:12.5px;color:var(--sub);font-weight:700}.hm-vr>b i{display:inline-block;width:8px;height:8px;border-radius:50%}.hm-vr>b i.o{background:#4dd47a}.hm-vr>b i.x{border:1.5px solid #ff8a8a;box-sizing:border-box}.hm-vr>b i.pc{width:auto;height:auto;border:0;border-radius:0;font-style:normal;color:var(--text);margin-left:2px}.hm-vr>b i.mut{width:auto;height:auto;border:0;border-radius:0;font-style:normal;color:var(--dim);font-weight:500}.hm-vn{font-size:12.5px;color:var(--dim);margin-top:4px;line-height:1.4}" +
    ".hm-chg{padding:12px 14px!important}.hm-cht{font-weight:800;font-size:14px;margin-bottom:6px}.hm-chi{display:flex;align-items:center;gap:8px;padding:8px 2px;border-top:1px solid var(--line);font-size:13.5px;cursor:pointer}.hm-chi:first-of-type{border-top:0}.hm-chi b{flex:1;font-weight:600}.hm-chi i{font-style:normal;color:var(--dim)}",
    ".hm-gr{display:flex;gap:9px;padding:7px 0;border-top:1px solid var(--line)}.hm-gr:first-of-type{border-top:0}.hm-gr>span{font-weight:900;font-size:16px;min-width:16px}.hm-gr.ok>span{color:#4dd47a}.hm-gr.no>span{color:#ff8a8a}.hm-gr.hold>span{color:var(--sub)}.hm-gr b{display:block;font-size:13.5px}.hm-gr small{display:block;font-size:12.5px;color:var(--sub);line-height:1.45}",
    ".hm-wn{margin-top:8px;background:var(--panel2);border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.5}.hm-wn small{display:block;color:var(--sub);font-weight:700;margin-bottom:2px}.hm-p{color:#ffb84d}",
    ".hm-sh{display:block;margin:10px 0 0 auto;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}",
    ".hm-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.hm-h>div{flex:1;min-width:0}.hm-h b{font-size:16px}.hm-h small{display:block;font-size:12.5px;color:var(--sub)}",
    ".hm-i{font-size:22px;width:36px;height:36px;border-radius:11px;background:var(--panel2);display:flex;align-items:center;justify-content:center;flex:none}",
    ".hm-go{font-size:12.5px;color:var(--sub);white-space:nowrap}",
    ".sc-hon:empty{display:none}.sc-hon{margin-top:3px;font-size:12.5px;color:var(--sub)}.hm-big .hon-chip{display:flex;width:max-content;margin:3px 0 0;font-size:12.5px;padding:1px 6px}.hm-big .hon-chip b{font-size:12.5px;letter-spacing:0}" +
    ".hm-big{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:2px 0 6px}.hm-big>div{background:var(--panel2);border-radius:12px;padding:7px 9px}.hm-big small{display:block;font-size:12.5px;color:var(--sub)}.hm-big b{font-size:20px;letter-spacing:-.5px}",
    ".hm-l{font-size:13.5px;line-height:1.5;color:var(--text)}.hm-l small{color:var(--sub)}.hm-l a{color:var(--acc);cursor:pointer}",
    ".hm-sp{margin:4px -4px 0}.hm-sp .lg{font-size:12.5px}",
    ".hm-alert{margin-top:8px;background:rgba(255,184,77,.12);border:1px solid rgba(255,184,77,.4);border-radius:12px;padding:8px 10px;font-size:13px}.hm-alert small{display:block;color:var(--sub);font-size:12.5px;margin-top:2px}",
    ".hm-cn{display:flex;justify-content:space-between;align-items:center;gap:8px;border-radius:10px;padding:7px 10px;margin-bottom:8px;font-size:13px;cursor:pointer}.hm-cn.g{background:rgba(77,212,122,.12)}.hm-cn.r{background:rgba(255,107,107,.12)}.hm-cn small{color:var(--sub)}" +
    ".hm-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.hm-chip{font-size:12.5px;background:var(--panel2);border-radius:999px;padding:3px 9px}.hm-chip.g{background:rgba(77,212,122,.14);color:#4dd47a}.hm-chip.b{background:rgba(57,135,229,.16);color:#7cb0ff}",
    ".hm-ev{font-size:14px;padding:5px 0;border-bottom:1px dashed var(--line)}.hm-ev small{color:var(--sub)}",
    ".hm-f{padding:6px 0;border-bottom:1px dashed var(--line)}.hm-f:last-child{border-bottom:0}.hm-f small{color:var(--sub);font-size:12.5px}",
    /* 누르는 곳 */
    ".hm-chip[data-op],.hm-chip[data-goto],[data-op],a[data-goto]{cursor:pointer}.hm-l a,.hm-ev b[data-op]{color:var(--acc);text-decoration:none}",
    ".sc-cal{margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--panel2);font-size:12.5px;display:flex;flex-wrap:wrap;gap:5px}.sc-cal>b{width:100%;font-size:12.5px}.sc-cal span{border:1px solid var(--line);border-radius:999px;padding:2px 8px}.sc-cal span.ok{border-color:#4dd47a;color:#4dd47a}.sc-cal>small{width:100%;color:var(--sub);font-size:12.5px}",
    ".sc-bt-t{width:100%;border-collapse:collapse;font-size:12.5px}.sc-bt-t td,.sc-bt-t th{padding:6px 4px;border-bottom:1px solid var(--line);text-align:right}.sc-bt-t td:first-child,.sc-bt-t th:first-child{text-align:left}.sc-bt-t tr.kp td{font-weight:800}",
    ".hm-chip[data-op]:active,.hm-chip[data-goto]:active,.sc-c:active{opacity:.7}.sc-c{cursor:pointer}",
    /* 성적표 */
    ".pf-l{margin-top:8px}.pf-r{display:grid;grid-template-columns:minmax(0,1.25fr) 1fr auto;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--line)}.pf-r:first-child{border-top:0}.pf-n{font-size:13.5px;font-weight:700;line-height:1.35;min-width:0}.pf-n small{display:block;font-size:11.5px;font-weight:500;color:var(--sub)}" +
    ".pf-t{position:relative;height:14px;background:var(--panel2);border-radius:7px;overflow:hidden}.pf-z{position:absolute;left:50%;top:-2px;bottom:-2px;width:2px;margin-left:-1px;background:var(--sub);opacity:.6}.pf-b{position:absolute;top:2px;bottom:2px;border-radius:5px}.pf-b.g{background:#2f9e44}.pf-b.r{background:#d6453d}" +
    ".pf-v{font-size:14px;font-weight:800;min-width:42px;text-align:right}.pf-v.g{color:#2f9e44}.pf-v.r{color:#d6453d}",
    ".sc-gb{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sc-gb>div{background:var(--panel2);border-radius:12px;padding:9px}.sc-gb b{display:block;font-size:13px;margin-bottom:4px}.sc-gb span{display:block;font-size:12.5px;line-height:1.5}",
    ".sc-h{display:flex;align-items:center;gap:10px}.sc-h>div:nth-child(2){flex:1;min-width:0}.sc-h b{font-size:15px}.sc-h small{display:block;font-size:12.5px;color:var(--sub)}",
    ".sc-rate{font-size:22px;font-weight:900;text-align:right;line-height:1.05}.sc-rate small{display:block;font-size:12.5px;color:var(--sub);font-weight:600}",
    ".sc-bar{display:flex;height:16px;border-radius:8px;overflow:hidden;margin:9px 0 4px;font-size:12.5px;font-weight:800}.sc-bar .w{background:#3fae6a;color:#fff;padding-left:6px}.sc-bar .l{background:#d0574f;color:#fff;text-align:right;padding-right:6px}",
    ".sc-li{font-size:12.5px;padding:5px 0;border-top:1px dashed var(--line)}.sc-v{font-size:12.5px;font-weight:800;border-radius:5px;padding:0 5px;margin-right:5px;background:var(--panel2)}.sc-v.w{background:rgba(77,212,122,.18);color:#4dd47a}.sc-v.l{background:rgba(230,103,103,.18);color:#ff8a8a}",
    ".sc-sig{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:9px}.sc-sig .hon-chip{width:auto;max-width:100%;flex-wrap:wrap}.sc-sig .hon-tag,.sc-sig .sc-hon{white-space:normal}.sc-sig>div{min-width:0;overflow-wrap:anywhere;border-radius:10px;padding:7px 9px;background:var(--panel2)}.sc-sig b{display:block;font-size:13px}.sc-sig small{font-size:12.5px;color:var(--sub)}",
    ".sc-sig .on{background:rgba(77,212,122,.12)}.sc-sig .tr{background:rgba(255,184,77,.12)}.sc-sig .sh{background:rgba(124,156,255,.1)}",
    ".sc-few{font-size:12.5px;color:var(--sub);margin-top:6px}",
    ".lrn .st-강함{color:#4dd47a}.lrn .st-관찰{color:#ffb84d}.lrn .st-닫힘{color:var(--dim)}",
    /* 접기 */
    ".fold .fold-h{cursor:pointer;display:flex;align-items:center;gap:6px}.fold .fold-h .fchev{margin-left:auto;flex:none;font-style:normal;white-space:nowrap}",
    ".fold .fold-h .fchev::after{content:'접기 ▴';font-size:12.5px;font-weight:700;color:var(--sub);border:1px solid var(--line);border-radius:999px;padding:3px 9px;background:var(--panel)}.fold:not(.open) .fold-h .fchev::after{content:'펼치기 ▾'}",
    ".fold:not(.open) .fold-b{display:none}.fold:not(.open){margin-bottom:6px}",
    ".fold-x{display:block;margin:10px auto 2px;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:999px;padding:8px 22px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}",
    ".fold:not(.open) .fold-h{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:11px 12px}",
    ".fold-jump{position:sticky;top:var(--hh,140px);z-index:5;display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin:0 -16px 10px;padding:6px 16px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}",
    ".fold-jump::-webkit-scrollbar{display:none}.fold-jump button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;cursor:pointer}",
    ".flash{animation:flash 1.6s ease}@keyframes flash{0%,40%{box-shadow:0 0 0 3px var(--c,#7c9cff)}100%{box-shadow:none}}",
    /* 종목 신호 */
    ".sgx-c{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 12px}.sgx-t{font-size:20px;letter-spacing:-1px}",
    ".sgx{font-size:12.5px;border-radius:999px;padding:4px 10px;background:var(--panel2);color:var(--text);text-decoration:none;cursor:pointer}.sgx.k{background:rgba(255,107,107,.14)}.sgx.p{background:rgba(233,196,106,.16)}.sgx.f{background:rgba(124,156,255,.14)}.sgx.b{background:rgba(77,212,122,.12)}",
    /* ⑥ 밝은 테마 */
    ":root[data-ui=light]{--bg:#f4f6fa;--panel:#ffffff;--panel2:#eef1f6;--line:#dde2ea;--text:#141a26;--sub:#5a6476;--dim:#636d7b;--acc:#3d63dd;--up:#d64545;--down:#2f6fd0}",
    ":root[data-ui=light] header{background:rgba(244,246,250,.9)}",
    ":root[data-ui=light] header .tab{background:#fff;border-color:#dde2ea;color:#5a6476}",
    ":root[data-ui=light] header .tab.on{color:#fff}",
    ":root[data-ui=light] .chip{background:rgba(20,26,38,.06)}",
    ":root[data-ui=light] .card,:root[data-ui=light] .hero{box-shadow:0 1px 2px rgba(20,26,38,.05)}",
    ":root[data-ui=light] .po-hero{background:linear-gradient(160deg,rgba(233,196,106,.22),#fff 60%)}",
    ":root[data-ui=light] .po-hero.kick{background:linear-gradient(160deg,rgba(255,107,107,.18),#fff 60%)}",
    ":root[data-ui=light] .vtip{background:#141a26;color:#fff}",
    ":root[data-ui=light] .lc-g{stroke:#e3e7ee}:root[data-ui=light] .lc-a{fill:#6b7486}",
    ":root[data-ui=light] svg circle[stroke='#121826']{stroke:#fff}",
    ":root[data-ui=light] .up{color:#d64545}:root[data-ui=light] .dn{color:#2f6fd0}",
    ":root[data-ui=light] #backbtn{background:#fff;color:#141a26;border-color:#dde2ea}",
    ":root[data-ui=light] .hm-chip.g,:root[data-ui=light] .po-sg.g{color:#1f8b4c}:root[data-ui=light] .hm-chip.b{color:#2f6fd0}",
    ":root[data-ui=light] .sc-v.w{color:#1f8b4c}:root[data-ui=light] .sc-v.l{color:#c23b3b}",
    ":root[data-ui=light] em.w,:root[data-ui=light] .po-rr .d.w,:root[data-ui=light] .mk-t td small.up{color:#1f8b4c}",
    ":root[data-ui=light] .po-pf3 .on{color:#1f8b4c}:root[data-ui=light] .po-pf3 .trial{color:#b26b00}",
    ":root[data-ui=light] .hero{background:radial-gradient(120% 140% at 100% 0%,color-mix(in srgb,var(--c) 28%,transparent),transparent 60%),#fff}",
    ":root[data-ui=light] iframe.rep{background:#fff}"
  ].join("\n");
  document.head.appendChild(css);
  // 접기 칩이 헤더 바로 아래 붙도록 헤더 높이 기억
  function hh(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }
  window.addEventListener("resize", hh); setTimeout(hh, 300); setTimeout(hh, 1500);
})();
;
/* ======== nav2.js ======== */
/* CH Investing — 화면 정리 (10/11 사용자: "보기 좋게 심플하게 · 상위 하위 · 펼치기 접기 · 중복은 빼도 됨 · 돋보기가 있는데 종목 카테고리가 있는 것도")
   ① 아래 탭 바 5개(오늘·시장·포트·신호·피드) → 위에는 그 묶음의 작은 탭만 (14칸 격자 대신)
   ② 📄 종목 탭은 🔍 검색으로, 🔔 알림·💬 의견함은 ⚙️ 안으로 (주소 #onepager·#alarm·#idea 는 그대로 열림)
   ③ 탭 머리(큰 소개 카드)는 한 줄로 — 소개 글은 머리를 누르면
   ④ 뒤로 버튼은 돌아갈 곳이 있을 때만 */
(function(){
  var GROUPS = [
    /* 🧊 11/12 냉정 분석 4차 「한 화면 · 할 일 5칸 · 연구실」 — 사용자 「네 의견대로 다 진행해」
       아래 탭 = PB 가 하는 일 5가지. 나머지(포트·성적표·확률·신호·운세)는 지우지 않고 🔬 연구실(#lab) 한곳으로 — 숨은 묶음이라 아래 탭엔 없지만 들어가면 위 작은 탭은 그대로.
       되돌리기: 브랜치 backup-before-job5-1112 */
    {k: "home",  ic: "🏠", t: "오늘",   tabs: ["home", "market", "sector", "feed"]},
    {k: "send",  ic: "📨", t: "한 장", tabs: ["send", "diag"]},   // 🩻 11/16 포트 진단 한 장(ux1116.js)
    {k: "prop",  ic: "📝", t: "제안서", tabs: ["prop"]},
    {k: "prod",  ic: "🛍️", t: "상품",   tabs: ["bond", "fund", "els", "divc"]},
    {k: "stock", ic: "🔍", t: "종목",   tabs: ["onepager", "flow"]},
    {k: "lab",   ic: "🔬", t: "연구실", tabs: ["lab"], hide: true},
    {k: "inv",   ic: "💼", t: "포트",   tabs: ["port", "score"], hide: true, lab: 1},
    /* 🧊 11/16 냉정 분석 5차 — 큰손·컵·갭·오를 확률을 「신호 한눈에」(sigall · ux1116.js) 한 화면으로 합침. 네 화면은 지우지 않고 그 안 「전체 보기」로 */
    {k: "sig",   ic: "🎯", t: "신호",   tabs: ["sigall", "screen", "sigmore"], hide: true, lab: 1},
    {k: "sigd",  ic: "🎯", t: "신호 상세", tabs: ["whale", "cup", "gap", "prob"], hide: true, lab: 1, up: "sigall", upt: "신호"},
    {k: "luck",  ic: "🔮", t: "운세",   tabs: ["luck", "saju", "tarot", "lotto"], hide: true, lab: 1},
    {k: "tax",   ic: "🧾", t: "세무계산기", tabs: ["tax"], hide: true, lab: 1}   // 🧾 11/16 tax.js
  ];
  var LAB = {tax: "🧾 세무계산기", diag: "🩻 포트 진단", sigall: "🎯 신호 한눈에", send: "📨 고객에게 한 장", lab: "🔬 연구실", onepager: "🔍 종목 찾기", home: "🏠 오늘", feed: "📰 피드", market: "🌐 시황", sector: "🧭 나침반", prob: "🎲 시장확률", flow: "🧲 수급", port: "💼 포트", divc: "💰 배당비교", score: "📊 성적표", whale: "🐋 큰손", cup: "☕ 컵", gap: "📈 갭", accum: "🤫 매집", danta: "⚡ 단타", screen: "🔎 거르기", sigmore: "🗂 더 보기", bond: "🏦 채권", fund: "📦 펀드", els: "🎯 ELS", luck: "🔮 오늘의 운세", saju: "📜 사주 리포트", tarot: "🃏 타로", lotto: "🎱 로또", prop: "📝 제안서"};
  window.__navMap = {groups: GROUPS, lab: LAB};   // 🔎 11/12 메뉴 찾기 — 화면이 바뀌어도 지금 이름·자리로 길 안내
  function grpOf(k){ for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].tabs.indexOf(k) >= 0) return GROUPS[i]; return null; }
  function last(g){ var m = (window.store && store.gl) || {}; return m[g.k] && g.tabs.indexOf(m[g.k]) >= 0 ? m[g.k] : g.tabs[0]; }

  function bar(){
    var b = document.getElementById("bnav");
    if (!b){
      b = document.createElement("nav"); b.id = "bnav";
      b.innerHTML = GROUPS.filter(function(g){ return !g.hide; }).map(function(g){ return '<button data-g="' + g.k + '"><span class="i">' + g.ic + '</span><span>' + g.t + '</span></button>'; }).join("");
      document.body.appendChild(b);
      [].forEach.call(b.children, function(x){ x.onclick = function(){
        var g = GROUPS.filter(function(y){ return y.k === x.dataset.g; })[0], gc = grpOf(cur);
        if (gc === g){ window.scrollTo({top: 0, behavior: "smooth"}); return; }   // 지금 묶음을 또 누르면 맨 위로
        go(last(g)); }; });
    }
    var gc = grpOf(cur);
    [].forEach.call(b.children, function(x){ x.classList.toggle("on", !!gc && x.dataset.g === gc.k); });
  }
  window.drawTabs = function(){
    var nav = document.getElementById("tabs"); if (!nav) return;
    var g = grpOf(cur);
    if (cur && cur !== "onepager"){ store.lastTab = cur; }
    try { updBack(); } catch(x) {}
    if (g){ store.gl = store.gl || {}; store.gl[g.k] = cur; try { save(); } catch(x) {} }
    if (g && (g.tabs.length > 1 || g.lab)){   // 🧾 11/16 연구실 안 화면은 탭이 하나여도 「‹ 연구실」을 보임(세무계산기)
      // 🧊 11/12: 홈에서도 위 작은 탭을 보임(오늘·시황·시장 흐름·피드 — 「뭐가 있는지 모르겠다」)
      nav.className = "tabs sub";
      nav.innerHTML = (g.up ? '<button class="tab tab-lab" data-k="' + g.up + '">‹ ' + g.upt + '</button>' : g.lab ? '<button class="tab tab-lab" data-k="lab">‹ 연구실</button>' : '') + g.tabs.map(function(k){ var c = CATS.filter(function(x){ return x.key === k; })[0] || {};
        return '<button class="tab' + (k === cur ? " on" : "") + '" style="--c:' + c.color + '" data-k="' + k + '">' + String(LAB[k] || c.name).replace(/^[^\s가-힣A-Za-z]+\s+/, "") + '</button>'; }).join("");   // 🧊 11/12 위 작은 탭은 글자만(이모지 뺌)
      [].forEach.call(nav.children, function(b){ b.onclick = function(){ if (b.dataset.k !== cur || cur === "onepager") go(b.dataset.k); }; });   // 🧊 11/12 종목리포트를 보다가 「종목 찾기」를 누르면 검색으로
      var on = nav.querySelector(".on"); if (on && on.scrollIntoView) try { on.scrollIntoView({inline: "center", block: "nearest"}); } catch(x) {}
      if (window.subBadges) try { subBadges(nav); } catch(x) {}   // 📱 A12-5 신호 탭 숫자 배지
    } else { nav.className = "tabs sub none"; nav.innerHTML = ""; }
    bar();
    setTimeout(function(){ var h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); }, 0);   // 접기 칩이 헤더 바로 아래 붙게
  };

  // ⑦ 뒤로: 홈이 아니면 늘 보이게 (알림 링크로 종목 화면을 바로 열었을 때도) — 더 돌아갈 기록이 없으면 보던 탭 → 오늘로
  window.updBack = function(){ var b = document.getElementById("backbtn"); if (!b) return; b.classList.add("on");
    // 🎨 11/04: 아래 탭으로 가는 첫 화면(돌아갈 기록 없음)에선 숨김 — 종목리포트처럼 탭에 없는 화면은 보임
    var tabbed = !!(window.cur && document.querySelector("#bnav") && ["home","market","sector","flow","divc","bond","fund","els","prop","feed","send","lab"].indexOf(cur) >= 0);
    b.classList.toggle("root", tabbed ? !document.getElementById("sheet") : !(navD() > 0 || !!document.getElementById("sheet") || (window.cur && cur !== "home"))); };
  var _goBack = window.goBack;
  window.goBack = function(){
    if (document.getElementById("sheet") || navD() > 0) return _goBack();
    var t = (cur === "onepager" && store.lastTab && store.lastTab !== "onepager") ? store.lastTab : "home";
    if (cur !== t) go(t); else window.scrollTo({top: 0, behavior: "smooth"});
  };
  // ③ 탭 머리: 누르면 소개 글
  document.addEventListener("click", function(ev){
    var h = ev.target.closest && ev.target.closest("#main > .hero"); if (!h || ev.target.closest("button,a")) return;
    h.classList.toggle("show");
  });

  // ④ 긴 카드 접기는 simple.js(clampLong)가 함 — 알림·링크로 그 안의 카드에 갈 땐 펼쳐서
  window.unclamp = function(el){ var c = el && el.closest && el.closest(".xs-clamp"); if (c){ c.classList.remove("xs-clamp"); var b = c.querySelector(":scope > .xs-cl"); if (b) b.textContent = "접기 ▴"; } };


  // ⑤ 차트 글씨가 겹치면 비켜 쓰기 (섹터 시계·지도·되감기 — 10/11 사용자: "겹치면 비켜써")
  function declutter(svg){
    var ts = [].slice.call(svg.querySelectorAll("text.rotl"));
    var fw = svg.closest(".famw"), ff = fw ? fw.dataset.ff || "" : "";
    if (!svg.getBoundingClientRect().width) return;                          // 안 보이는 카드 — 보일 때 다시
    ts = ts.filter(function(t){ var g = t.closest("[data-fam]"); return !g || (ff ? g.dataset.fam === ff : !!g.closest("[data-top]") || !fw); });
    var sig = ff + "#" + ts.map(function(t){ return (t.dataset.x0 || t.getAttribute("x")) + "," + (t.dataset.y0 || t.getAttribute("y")); }).join("|");
    if (!ts.length || svg.dataset.dc === sig) return;
    var boxes = [];
    try {        // 점(동그라미)도 피해서
      [].forEach.call(svg.querySelectorAll("circle"), function(c){ var r = +c.getAttribute("r"), g = c.closest("[data-fam]"); if (ff && g && g.dataset.fam !== ff) return; if (r >= 3 && r <= 9){ var cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy"); boxes.push({x: cx - r, y: cy - r, w: 2 * r, h: 2 * r}); } });
    } catch(x) {}
    try {        // 구역 이름(🔥 계속 강함 등)도 피해서
      [].forEach.call(svg.querySelectorAll("text.rotq"), function(q){ var b = q.getBBox(); if (b.width) boxes.push({x: b.x, y: b.y, w: b.width, h: b.height}); });
    } catch(x) {}
    [].forEach.call(svg.querySelectorAll(".dc-ln"), function(l){ l.remove(); });
    ts.sort(function(a, b){ return (+a.getAttribute("y")) - (+b.getAttribute("y")); });
    var over = function(b){ return boxes.some(function(o){ return b.x < o.x + o.w + 1 && o.x < b.x + b.w + 1 && b.y < o.y + o.h && o.y < b.y + b.h; }); };
    var W = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 9999;
    for (var i = 0; i < ts.length; i++){
      var t = ts[i];
      if (t.dataset.x0){ t.setAttribute("x", t.dataset.x0); t.setAttribute("y", t.dataset.y0); t.removeAttribute("text-anchor"); }
      var bb; try { bb = t.getBBox(); } catch(x) { return; }
      if (!bb.width) return;                                  // 아직 안 보이는 카드 — 보일 때 다시
      var x0 = +t.getAttribute("x"), y0 = +t.getAttribute("y"); t.dataset.x0 = x0; t.dataset.y0 = y0;
      var dy = bb.y - y0, dx = bb.x - x0, L = -(bb.width + 14), put = null;
      var tries = [[0, 0], [L, 0], [0, -11], [0, 11], [L, -11], [L, 11], [0, -22], [0, 22], [L, -22], [L, 22], [0, -33], [0, 33], [L, -33], [L, 33], [0, -44], [0, 44]];
      for (var j = 0; j < tries.length; j++){
        var b = {x: x0 + dx + tries[j][0], y: y0 + dy + tries[j][1], w: bb.width, h: bb.height};
        if (b.x < 0 || b.x + b.w > W) continue;
        if (!over(b)){ put = tries[j]; boxes.push(b); break; }
      }
      if (!put){ boxes.push({x: bb.x, y: bb.y, w: bb.width, h: bb.height}); continue; }
      if (put[0] || put[1]){
        t.setAttribute("x", x0 + put[0]); t.setAttribute("y", y0 + put[1]);
        if (Math.abs(put[1]) > 0){
          var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
          ln.setAttribute("class", "dc-ln"); ln.setAttribute("x1", x0 - 6); ln.setAttribute("y1", y0 - 4);
          ln.setAttribute("x2", put[0] ? x0 + put[0] + bb.width + 1 : x0 - 1); ln.setAttribute("y2", y0 + put[1] - 4);
          t.parentNode.insertBefore(ln, t);
        }
      }
    }
    svg.dataset.dc = sig;
  }
  // ⑧ 모든 카드 제목: 누르면 설명 칸(닫기 ✕) + 관련 화면 바로가기 (10/11 사용자: "모든 타이틀들이 설명이나 연동 화면으로 가게 · 되돌아오거나 닫기")
  //    국면 신호판 점수 설명(plus6)과 같은 모양. 카드 안의 「읽는 법」 글(p.note)은 이 칸 안으로 옮겨 카드를 가볍게.
  var DESC = [
    // 🎲 시장확률 — 🌡️ 시장 심리 온도 (10/28 · 옛 이름 공포·탐욕)
    [/시장 심리 온도/, "시장 사람들이 지금 얼마나 들떠 있는지를 0~100으로 나타내요. 지수 추세·변동성(VIX)·회사채·안전자산·위험선호 같은 7가지를 지난 1년과 비교한 순위예요. 그래서 「무섭다」가 아니라 「1년 중 몇 번째로 들떠 있나」로 읽어야 해요. 많이 오른 해엔 잠깐 쉬어도 낮게 나와요. 2007년 이후 기록으론 가장 움츠린 구간 뒤가 오히려 조금 더 잘 올랐어요. CNN 공포·탐욕 지수는 원래 이름 그대로 아래에 같이 보여 줘요."],
    // 🏠 오늘 — ☀️ 오늘 한 장 (10/28 · 옛 이름 PB 한 장)
    [/오늘 한 장/, "지금 시장을 고객에게 설명할 때 쓸 한 장이에요. 맨 위 줄은 나라별 흐름(횡보·상승·하락)과 오늘 가장 중요한 이유, 「고객에게 할 말」은 그대로 읽어 줘도 되는 3~4줄이에요. 장중엔 매시간 새로 써요(옆 시각이 마지막으로 쓴 때). 「📨 보내기」를 누르면 이 내용으로 「지금 시장 한 장」 그림을 만들어 카톡 등으로 보낼 수 있어요. 투자 참고용이고 매수 추천이 아니에요."],
    // 📝 제안서 (10/29 사용자 「제안서 카테고리의 조이는 설명이 거의 없어」 — 자세한 건 propose.js 의 JOY 글)
    [/오늘의 기본폼/, "매일 아침 시황에 맞춰 미리 만들어 둔 제안서 틀 9가지예요. 고를 상품을 누르면 아래 칸이 열려요."],
    [/누구에게 · 누가/, "제안서 표지에 들어갈 고객 이름과 제안자(나)·소속을 넣는 칸이에요."],
    [/상품별 금액/, "고른 상품마다 금액과 위험 정도·환전 여부·꼭 넣을 종목을 정하는 칸이에요."],
    [/^📤 만들기|^만들기/, "고객에게 바로 보여 주거나, 한 장 그림·PDF·PPT로 만들어 보내는 칸이에요."],
    // 🌐 시황
    [/오늘의 킥/, "오늘 짧게 노려 볼 기회(킥)와 그 이유예요. 킥 포트에 실제로 담기는 건 성과가 확인된 신호뿐이에요."],
    [/전일 미국장/, "어젯밤 미국장에서 중요했던 움직임과 오늘 한국장에 줄 영향이에요."],
    [/오늘의 집중/, "오늘 돈이 가는 길 → 그걸 담는 방법 → 오늘 할 행동을 한 장으로 정리했어요."],
    [/돈이 몰리는 곳/, "지금 돈(거래·상승)이 몰리는 섹터·테마예요."],
    [/숫자 복기/, "이번 주에 앱의 신호들(컵·갭·매집·고래·킥 등)이 실제로 얼마나 벌었는지 숫자로 되돌아보는 표예요."],
    [/밤사이 가장 크게/, "우리가 자는 동안 미국·세계 시장에서 평소보다 크게 움직인 것 3개를 골라, 오늘 한국장에 줄 영향을 같이 적었어요."],
    [/일정판/, "이번 주 경제 발표·실적 일정이에요. 내 관심종목이나 신호 종목의 실적이 있으면 따로 표시돼요."],
    [/오늘 할 일/, "오늘 시황을 보고 할 일을 정리한 목록이에요. 체크하면 이 휴대폰에 기억돼요."],
    [/리포트에 나온 종목/, "오늘 시황 리포트에 나온 종목들이에요. 이름을 누르면 그 종목의 종목리포트로 가요."],
    [/지난 시황 검색/, "지난 시황 리포트를 낱말로 찾아요. 예: 「금리」, 「반도체」."],
    [/실시간 시장판/, "지수·환율·금리·원자재의 지금 값과 오늘 등락이에요."],
    [/오늘의 숫자/, "오늘 시황의 핵심 숫자들이에요."],
    [/경우의 수/, "시황 리포트가 본 앞으로의 시나리오와 각각의 확률이에요. 확률이 바뀌면 순서도 바뀌어요."],
    [/킥 포함 자산 배분/, "기본 배분에서 현금 일부를 떼어, 성과가 확인된 신호(킥)에 담은 배분이에요. 기본과 킥을 같은 날 같은 기준으로 비교해요."],
    [/자산 배분/, "시황 리포트 기준으로 지금 주식·채권·금·현금을 얼마씩 담을지 정리한 표예요. 예시이며 매수 추천은 아니에요."],
    [/최근 흐름/, "최근 리포트들의 판단이 어떻게 바뀌어 왔는지 한 줄씩 보여줘요."],
    [/규칙 발동/, "미리 정해 둔 매매 규칙 중 오늘 조건이 맞아 켜진 것이 있는지 확인해요."],
    [/오늘의 판단/, "오늘 시황의 결론 한 줄과 그 이유예요."],
    [/어제 예고/, "어제 리포트가 예고한 것이 오늘 맞았는지 채점한 결과예요."],
    [/다가오는 일정/, "앞으로 시장을 흔들 수 있는 발표·행사 일정이에요."],
    [/이러면 틀린 것/, "오늘 판단이 틀렸다고 볼 신호예요. 이게 나오면 생각을 바꿔요 — 고집하지 않기 위한 장치."],
    [/카톡 요약/, "카톡으로 보내기 좋게 줄인 오늘 시황 요약이에요."],
    [/적중률/, "시황 리포트의 예고가 실제로 맞은 비율을 계속 쌓아 채점한 기록이에요."],
    [/대응표/, "시나리오마다 내가 어떻게 할지 미리 적어 두는 칸이에요. 미리 정해 두면 장이 흔들려도 덜 흔들려요."],
    [/리포트대로 굴렸다면/, "리포트의 배분을 그대로 들고 있었다면 1억이 지금 얼마가 됐을지 계산한 거예요."],
    [/금리 한 장 지도/, "미국 10년 금리와 코스피를 한 그림에 놓고, 금리가 주식을 누르는지 보는 지도예요."],
    [/킥 되감기/, "그날 썼던 킥(짧게 노린 기회)이 그 뒤 실제로 맞았는지 자동으로 붙여 보는 기록이에요."],
    // 🧭 나침반
    [/국면 신호판/, "경기 사이클(6~18개월 뒤 경기)과 시장 타이밍(1~3개월 뒤 주가) 두 점수로 지금이 어떤 국면인지 보여줘요. 점수를 누르면 신호별 설명이 나와요."],
    [/5개 시장 한눈에/, "한국·미국·일본·중국·홍콩 5개 시장에서 오늘 오른 종목과 내린 종목 비율을 한 줄씩 비교해요."],
    [/세계 시장 하루 흐름/, "해가 뜨는 순서(일본 → 한국 → 중국 → 홍콩 → 미국)로 시장마다 오른 종목 비율을 원으로 보여줘요."],
    [/누가 누구를 따라가나/, "5개 시장의 지수가 하루하루 얼마나 같이 움직였는지(상관) 보여줘요. 1이면 똑같이, 0이면 상관없이 움직여요."],
    [/제일 강할까/, "체감 온도 점수로 5개 시장을 줄 세웠어요. 높을수록 사람들이 사고 싶어 하는 시장이에요."],
    [/국면 전환 예보/, "지수와 20일선·60일선의 위치·기울기로 상승장·횡보장·하락장을 판정하고(급락 — 20일 −8%·20일 고점 대비 −10% — 은 바로 하락장), 지금 속도면 언제 바뀔지 예보해요."],
    [/로테이션 시계/, "섹터마다 고른 기간(1·3·6개월)의 흐름과 그보다 짧은 기간 흐름으로 시계 위 자리를 정해요. 돈은 보통 시계 방향으로 돌아요."],
    [/로테이션 지도/, "위 탭으로 기간을 골라요 — 1개월(가로 한 달·세로 1주) · 3개월(가로 석 달·세로 1개월) · 6개월(가로 반년·세로 석 달). 고른 기간은 섹터 묶음 전체(등락·시계·되감기·업종·대형주)에 같이 적용돼요. 어느 섹터로 돈이 들어오고 빠지는지 한 장으로 봐요."],
    [/이 업종·종목을 보자/, "오늘 등락·1주 흐름·업종 안 오른 종목 비율로 고른 업종 3곳과 대장주예요."],
    [/체감 온도/, "오늘 하루 오른 종목 비율·신고가·지수 위치를 섞어 시장 분위기를 0(차가움)~100(뜨거움)으로 나타내요. CNN 방식 공포·탐욕은 시장확률 탭에 있어요."],
    [/오른 종목 · 내린 종목/, "오늘 오른 종목과 내린 종목 수예요. 지수가 대형주 위주라서, 이 숫자가 보통 종목의 실제 체감이에요."],
    [/대표 지수/, "나라별 대표 지수 차트예요. 차트를 누르고 옆으로 밀면 그날 값이 나와요."],
    [/포트 비교 지수/, "내 포트가 이겨야 할 시장 14곳의 지수예요. 포트 탭의 「시장 14곳과 비교」와 같은 목록이에요."],
    [/상승 − 하락/, "매일 오른 종목 수에서 내린 종목 수를 뺀 값의 흐름이에요. 시장의 체력을 봐요."],
    [/섹터 등락/, "시가총액 가중으로 본 섹터별 오늘 등락이에요. 섹터를 누르면 그 섹터 종목이 나와요."],
    [/52주 신고가/, "1년 중 가장 높은 값을 오늘 새로 쓴 종목이에요. 큰 회사 순."],
    [/많이 오른 대형주/, "오늘 많이 오른 큰 회사들이에요."],
    [/약한 업종/, "오늘 가장 약했던 업종이에요."],
    [/히트맵/, "섹터별로 기간(1주·1개월·3개월 등) 수익률을 색으로 보여줘요. 빨강 = 오름, 파랑 = 내림."],
    [/국면 기록/, "최근 60거래일 동안 시장 국면(상승·횡보·하락)이 어떻게 바뀌어 왔는지 기록이에요."],
    [/흐름 되감기/, "최근 15거래일 동안 섹터들이 지도 위에서 어떻게 움직였는지 다시 돌려 봐요. 섹터를 고르면 그것만 돌려요."],
    [/신고가 vs 신저가/, "신고가 종목과 신저가 종목의 비율 흐름이에요. 지수는 오르는데 이 선이 내려가면 몇 종목만 끄는 장이에요."],
    [/환율·금리에 민감/, "환율·금리가 움직일 때 같이 움직인 업종이에요. 환율·금리 뉴스가 나오면 어느 업종이 영향을 받을지 봐요."],
    [/미국 → 한국/, "미국에서 강한 업종을 한국 같은 업종이 따라왔는지 봐요. 덜 따라온 곳은 따라잡을 여지를 볼 만해요."],
    // 💼 포트
    [/시장 \d+곳과 비교/, "내 포트(기본·킥)를 세계 주요 지수 14곳과 같은 날부터 달러 기준으로 비교해요. 목표는 S&P500을 이기는 것."],
    [/킥 칸 속/, "킥 칸 안에 무엇이 들어 있고, 손절·익절 규칙과 수익이 어떤지 보여줘요."],
    [/이렇게 담으면/, "지금 배분표대로 담으려면 무엇을 몇 주 사면 되는지 금액을 넣어 계산해 줘요."],
    [/비중 바뀐 날/, "배분 비중이나 상품이 바뀐 날과 그 이유의 기록이에요."],
    [/해외 동종주/, "미국에서 강한 섹터마다 한국·일본·대만 등 해외 같은 업종 종목을 달러 수익·위험 대비로 비교해, 이기는 쪽을 포트에 담아요."],
    [/벌고 잃었나/, "포트의 칸(자산)마다 시작일부터 수익에 얼마나 더하고 뺐는지(기여 %p)와 지금 신호예요."],
    [/날짜별 성적/, "날짜마다 성적(수익률)을 차례로 보여줘요."],
    // 📊 성적표
    [/규칙 검증/, "포트 규칙(국면 현금·칸 기울이기·추세 브레이크)을 2008년부터 미국 섹터 ETF에 매일 적용해 본 결과예요. 나아진 규칙만 킥 포트에 켜요."],
    // 🐋 고래
    [/고래 지수 vs/, "고래(유명 펀드)들이 많이 든 종목으로 만든 지수와 S&P500의 1년 수익률을 비교해요."],
    [/TOP 10/, "고래 보유·최근 매수·가격 위치를 점수로 매긴 오늘의 상위 10종목이에요."],
    [/오늘의 신호/, "오늘 새로 생긴 고래 관련 신호예요."],
    [/함께 든 종목/, "여러 고래가 같이 들고 있는 종목이에요. 많이 겹칠수록 믿음이 모인 종목."],
    [/행동별 이후 성적/, "고래가 새로 산·늘린·줄인·판 종목이 그 뒤 실제로 얼마나 올랐는지 비교해요."],
    [/이것 하나/, "매일 하나씩 고른 「오늘 이것 하나」가 그 뒤 얼마나 올랐는지 기록이에요."],
    [/수익률 상위 고래/, "1년 수익률이 높은 고래 순이에요. 누르면 그 고래의 보유 종목."],
    [/합의 매수/, "같은 분기에 여러 고래가 새로 산 종목이에요."],
    [/고래보다 싸게/, "고래가 산 분기의 마지막 날 가격보다 지금 더 싼 종목이에요."],
    [/따라하기 수익곡선/, "고래의 큰 신규 매수를 공시일에 따라 샀다면 수익이 어땠는지 곡선으로 보여줘요."],
    [/분기 타임라인/, "고래별로 분기마다 무엇을 사고팔았는지 시간 순서로 보여줘요."],
    [/13F 공시 카운트다운/, "미국 기관이 보유 내역(13F)을 내는 마감까지 남은 날과 아직 안 낸 곳이에요."],
    [/매도 경보/, "여러 고래가 정리하거나 크게 줄인 종목이에요. 들고 있다면 한 번 점검."],
    [/확신도/, "비중을 크게 새로 담았거나 크게 늘린 고래 순이에요. 돈을 크게 건 쪽을 보여줘요."],
    [/내부자도 사는 중/, "최근 90일 동안 회사 임원·대주주가 자기 돈으로 장에서 산 기록이에요."],
    [/관심종목을 가진 고래/, "내 ⭐ 관심종목을 들고 있는 고래와 그 비중이에요."],
    [/그대로 따라 사기/, "고래들이 많이 든 상위 15종목을 그 비중대로 산다면 어떻게 되는지 보여줘요."],
    [/새로 산 종목, 그 뒤/, "고래가 새로 산 종목을 공시일에 샀다면 지금까지 수익이 어떤지 모았어요. 그 고래를 얼마나 믿을지의 근거."],
    [/겹침 지도/, "고래들의 보유 종목이 얼마나 겹치는지 그림으로 보여줘요. 가까울수록 같은 이야기에 베팅 중."],
    [/고래 vs 고래/, "고래 두 곳을 골라 보유 종목과 성적을 나란히 비교해요."],
    // ☕ 컵 · 📈 갭
    [/돌파 후 추적/, "컵 돌파가 난 종목이 그 뒤 성공(+20%)했는지 실패(−8%)했는지 따라가 봐요."],
    [/잘 맞던 조건/, "지금까지 성적이 좋았던 조건만 남겨 고른 종목이에요."],
    [/매수 계획/, "금액과 손절 폭을 넣으면 몇 주를 살지 계산해 줘요."],
    [/주봉 컵/, "몇 달~1년 넘게 만든 큰 컵 모양이에요. 일봉 컵보다 큰 그림."],
    [/돌파 임박/, "돌파선(왼쪽 고점)까지 3% 안으로 다가온 종목이에요."],
    [/이중 신호/, "컵과 갭 신호가 동시에 나온 종목이에요. 두 신호가 겹치면 더 볼 만해요."],
    [/컵 지도|갭 지도/, "오늘 신호가 어느 나라·섹터에 몰렸는지 보여주는 표예요. 숫자를 누르면 그 종목만 남아요."],
    [/^나라별/, "나라별 신호 수예요. 누르면 그 나라 종목만 보여요."],
    [/많이 나온 섹터/, "신호가 많이 나온 섹터예요. 누르면 그 섹터 종목만 보여요."],
    [/신호 성적표/, "이 화면의 신호가 처음 나온 날 샀다면 그 뒤 성적이 어땠는지 모은 표예요."],
    [/섹터별 신호 수/, "섹터마다 신호가 몇 개 나왔고 성적이 어땠는지 보여줘요."],
    [/메움 레이스/, "최근 갭이 갭 전 자리까지 되돌아오는지(메움) 경주처럼 보여줘요. 멀리 남은 종목이 강한 종목."],
    [/갭 크기 × 거래량/, "갭 크기와 거래량을 한 그림에 놓았어요. 오른쪽 위(크게 + 거래 많이)가 가장 믿을 만한 갭."],
    [/밤 갭/, "미국 대장주가 밤에 크게 갭이 나면 다음 날 한국 짝꿍 종목이 어떻게 움직였는지 2년 기록이에요."],
    [/갭 유형별/, "갭 종류(돌파·실적·소진 의심 등)마다 갭을 메운 비율이에요."],
    [/메움 확률표/, "갭 크기·거래량 조합마다 5일·20일 안에 갭을 메운 확률이에요. 낮을수록 잘 버틴 조합."],
    [/연속 갭/, "최근 20일 안에 위로 갭이 2번 넘게 난 종목이에요. 사는 힘이 강하다는 뜻."],
    [/실적 다음날 갭/, "실적 발표 다음 날 생긴 갭과, 실적을 앞둔 후보예요."],
    [/장 전 갭 후보/, "미국 장이 열리기 전 거래에서 갭이 날 것 같은 관심 종목이에요."],
    [/메움 추적/, "갭을 지킨 종목과 메운 종목의 그 뒤 수익을 비교해요."],
    // 🤫 매집
    [/매집 강도/, "가격은 조용한데 거래·수급이 쌓이는 정도를 점수로 매긴 순위예요."],
    [/관심이 식는/, "매집 조건에서 빠지거나 거래가 줄어든 종목이에요. 들고 있다면 점검."],
    [/박스 돌파/, "최근 20일 고점 위로 올라선 매집 종목이에요."],
    [/외국인·기관 순매수/, "최근 5일 동안 외국인·기관이 산 양이에요. 매집과 같이 나오면 더 믿을 만해요."],
    [/매집 달력/, "최근 8일 매집 점수를 달력처럼 보여줘요. 진할수록 점수가 높아요."],
    [/매집 종목 섹터/, "매집 종목이 어느 섹터에 몰려 있는지 보여줘요."],
    [/거래량 이상 종목/, "거래량이 그 전 석 달보다 크게 늘었는데 가격은 제자리인 종목이에요. 참고용 — 과거 검증에서 매수 신호로는 안 통했어요."],
    [/기간별 돌파/, "매집이 며칠째였는지에 따라 그 뒤 박스 돌파에 성공한 비율이에요."],
    [/숨소리/, "가격은 조용한데 거래량이 쌓이는 모습을 60일 그림으로 보여줘요."],
    [/누가 모으나/, "최근 10일 동안 개인·외국인·기관 중 누가 샀는지 보여줘요."],
    [/오래 모으는/, "매집이 오래된 순이에요. 같은 기간대의 과거 돌파율을 같이 적었어요."],
    [/매집의 생애/, "매집 → 돌파 → 상승의 평균 흐름과 지금 종목의 위치를 보여줘요."],
    // ⚡ 단타
    [/전광판/, "오늘 뜬 단타 알람과 지금 값이에요. 막대 = 장중 최저~최고, 흰 점 = 지금."],
    [/스스로 배운/, "쌓인 1분 자료와 실제 알람 결과로 단타 알람이 스스로 고친 규칙이에요."],
    [/성적 대시보드/, "단타 알람 전체의 승률과 평균 수익이에요."],
    [/손절·익절 라인/, "알람이 정한 손절가·목표가와 실제 움직임을 비교해요."],
    [/가상 매매 일지/, "알람마다 1주씩 샀다면 어땠는지 규칙대로 계산한 일지예요."],
    [/잘 맞는 시간대/, "몇 시에 뜬 알람이 잘 맞았는지 보여줘요."],
    [/손절 난 알람/, "손절까지 간 알람들의 공통점을 찾아봐요."],
    [/오늘 같은 장/, "오늘처럼 코스닥이 움직인 날에 알람 성적이 어땠는지 보여줘요."],
    [/유형별 가장 잘 된/, "알람 유형마다 가장 잘 된 알람이에요."],
    // 기타
    [/간밤 글로벌/, "간밤 미국·유럽 증시와 환율·금리·원자재가 어떻게 끝났는지 요약이에요."],
    [/전일 섹터 등락/, "어제 섹터별 등락이에요."],
    [/장중 나침반/, "장이 열려 있는 동안 5개 시장의 섹터 흐름을 몇 분마다 새로 보여줘요."],
    [/장중 섹터 발동/, "장중에 갑자기 강해진 섹터 기록이에요."],
    [/대장주/, "이 섹터에서 시가총액이 가장 큰 종목들이에요. 이름을 누르면 종목리포트."],
    [/오늘 많이 오른 종목/, "이 섹터에서 오늘 많이 오른 종목이에요."],
    [/구성 종목|테마 종목/, "이 섹터·테마에 속한 종목 목록이에요. 이름을 누르면 종목리포트."],
    [/한국 같은 섹터|관련주/, "같은 업종의 다른 나라 종목이에요. 이름을 누르면 종목리포트."],
    [/내 알림|알림 받기|알림 개수/, "휴대폰으로 받을 알림을 고르는 칸이에요."],
    [/종목 찾기/, "종목 이름이나 코드로 찾아 종목리포트를 열어요."],
    [/의견 남기기/, "앱에 바라는 점을 남기는 칸이에요. 운영자만 볼 수 있어요."]
  ];
  // 관련 화면 바로가기 [제목 규칙, 버튼 글, 갈 곳(탭~카드)]
  var LINKS = [
    [/킥/, "⚡ 킥 포트 보기", "port~pokick"],
    [/자산 배분|리포트대로 굴렸다면|이렇게 담으면/, "📋 포트에서 따라하기", "port~pofollow"],
    [/포트 비교 지수|시장 \d+곳과 비교/, "🏁 포트 vs 시장 14곳", "port~pocmp"],
    [/포트 비교 지수|시장 \d+곳과 비교/, "📈 나침반 지수 차트", "sector"],
    [/적중률|어제 예고|신호 성적표|성적 대시보드|규칙 검증|숫자 복기/, "📊 성적표", "score"],
    [/규칙 검증/, "⚡ 규칙이 켜진 킥 포트", "port~pokick"],
    [/국면|공포·탐욕|심리 온도|경우의 수|오늘의 판단/, "🧭 국면 신호판", "sector"],
    [/섹터|업종|로테이션|히트맵|돈이 몰리는 곳/, "🧭 나침반 섹터", "sector"],
    [/해외 동종주|벌고 잃었나/, "🧭 나침반 섹터", "sector"],
    [/이중 신호/, "☕ 컵", "cup"], [/이중 신호/, "📈 갭", "gap"],
    [/고래|13F|내부자/, "🐋 고래", "whale"],
    [/매집|외국인·기관/, "🤫 매집", "accum"],
    [/돌파 임박|박스 돌파|국면 기록|시간대|전광판|매도 경보|관심종목 알림/, "🔔 알림 켜기", "alarm"],
    [/밤사이|일정판|다가오는 일정|오늘 할 일|오늘의 판단/, "🎯 오늘의 집중", "market~mkfo"],
    [/리포트에 나온 종목|종목 찾기/, "📰 피드", "feed"],
    [/국면 신호판|국면 전환 예보|국면 기록/, "🧪 국면 규칙 검증", "score~scrbt"],
    [/섹터 등락|로테이션|히트맵|미국 → 한국/, "🌏 포트의 섹터별 동종주", "port~popeers"],
    [/52주 신고가|신고가 vs/, "☕ 컵 (돌파 후보)", "cup"],
    [/비중 바뀐 날|날짜별 성적/, "🌐 시황 판단", "market"],
    [/날짜별 성적/, "📊 성적표", "score"]
  ];
  function ttText(h){ var c = h.cloneNode(true); [].forEach.call(c.querySelectorAll(".mut,button,select,input,.fchev,.tt-i,a.btn,.gd-b,.gd-i"), function(x){ x.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim(); }
  var KEEPV = /추천 아님|변경 없음|종목은 없어요|넘은 비율|브라이어|보류 \d+건|도달은/;
  function titles(){
    var hs = document.querySelectorAll("#main section.card > h3, #sheet section.card > h3, #main section.card > .mk-lab, #main .fold > .fold-h");
    [].forEach.call(hs, function(h){
      if (h.dataset.tt) return;
      var c = h.closest(".fold") || h.closest("section.card");
      if (!c || c.id === "xs-more" || c.matches(".hm-c,.sc-c,.xs-more") || h.closest("[data-goto],[data-op]")) return;
      var t = ttText(h); if (!t) return;
      h.dataset.tt = "1";
      if (h.classList.contains("fold-h")){                 // 💼 포트 접기 머리: 머리 누르면 접기 그대로, ⓘ 만 설명
        var ib = document.createElement("button"); ib.type = "button"; ib.className = "tt-i"; ib.textContent = "ⓘ";
        var ch = h.querySelector(".fchev"); h.insertBefore(ib, ch || null);
      } else h.classList.add("tt-h");
      // 카드의 「읽는 법」 글을 설명 칸으로 (조작 버튼·현재 상태 글은 카드에 그대로)
      var ns = [].filter.call(c.querySelectorAll(c.matches(".fold") ? ":scope > .fold-b > section > p.note, :scope > .fold-b > p.note" : ":scope > p.note"), function(n){
        return !n.dataset.nt && n.textContent.trim() && !n.querySelector("button,a,input,select,textarea,label") && !KEEPV.test(n.textContent); });
      if (ns.length){ ns.forEach(function(n){ n.dataset.nt = "1"; n.classList.add("tt-note"); }); }
      h._tt = {t: t, ns: ns};
    });
  }
  function ttOpen(h){
    var c = h.closest(".fold") || h.closest("section.card"), box = h.nextElementSibling;
    if (box && box.classList.contains("tt-x")){ var o = box.hidden; box.hidden = !o; h.classList.toggle("tt-on", o); return; }
    var info = h._tt || {t: ttText(h), ns: []}, t = info.t;
    var sub = h.querySelector(".mut"); sub = sub ? sub.textContent.replace(/\s+/g, " ").trim() : "";
    var d = DESC.filter(function(x){ return x[0].test(t); })[0];
    var seen = {}, ls = LINKS.filter(function(x){ if (!x[0].test(t)) return false; var tab = x[2].split("~")[0];
      if (tab === cur && x[2].indexOf("~") < 0) return false; if (x[2].split("~")[1] && document.getElementById(x[2].split("~")[1]) && c.contains(document.getElementById(x[2].split("~")[1]))) return false;
      if (seen[x[2]]) return false; seen[x[2]] = 1; return true; }).slice(0, 3);
    box = document.createElement("div"); box.className = "tt-x";
    box.innerHTML = '<div class="ttx-h"><div><small>ⓘ 이 카드는</small><b></b>' + (sub ? '<em></em>' : '') + '</div><button class="ttx-x" type="button">닫기 ✕</button></div>' +
      (d ? '<p class="ttx-what"></p>' : '') + '<div class="ttx-n"></div>' +
      (ls.length ? '<div class="ttx-go"><small>관련 화면</small>' + ls.map(function(x){ return '<button type="button" class="ttx-l" data-goto="' + x[2] + '">' + x[1] + ' ›</button>'; }).join("") + '</div>' : '') +
      '<div class="ttx-bt"><button class="ttx-sh" type="button">📤 이 카드 공유</button><button class="ttx-x ttx-x2" type="button">설명 닫기 ▴</button></div>';
    box.querySelector("b").textContent = t;
    if (sub) box.querySelector("em").textContent = sub;
    if (d) box.querySelector(".ttx-what").textContent = d[1];
    var nb = box.querySelector(".ttx-n");
    (info.ns || []).forEach(function(n){ if (n.parentNode){ n.classList.remove("tt-note"); nb.appendChild(n); } });
    if (!nb.children.length) nb.remove(); else nb.insertAdjacentHTML("afterbegin", "<small>읽는 법</small>");
    if (!d){ var p0 = document.createElement("p"); p0.className = "ttx-what"; p0.textContent = sub || t; box.insertBefore(p0, box.children[1]); }
    h.parentNode.insertBefore(box, h.nextSibling);
    h.classList.add("tt-on");
    if (window.unclamp) unclamp(h);
    box.classList.add("ttx-in");
  }
  document.addEventListener("click", function(ev){
    var t = ev.target; if (!t.closest) return;
    var x = t.closest(".ttx-x");
    if (x){ ev.stopPropagation(); var bx = x.closest(".tt-x"), h = bx.previousElementSibling; bx.hidden = true; if (h) h.classList.remove("tt-on");
      if (x.classList.contains("ttx-x2") && h){ var y = h.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header") || {}).offsetHeight || 0) - 12;
        if (h.getBoundingClientRect().top < 0) window.scrollTo({top: Math.max(0, y), behavior: "smooth"}); }
      return; }
    var sh = t.closest(".ttx-sh");
    if (sh){ ev.stopPropagation(); var bx2 = sh.closest(".tt-x"), h2 = bx2.previousElementSibling, c2 = h2 && (h2.closest(".fold") || h2.closest("section.card"));
      var title = (h2 && h2._tt && h2._tt.t) || "", body = "";
      if (c2){ var all = (c2.innerText || "").replace(bx2.innerText || "", ""), seen = {}, out = [];
        all.split("\n").map(function(l){ return l.replace(/\s+/g, " ").trim(); }).forEach(function(l){
          if (!l || l === title || l.indexOf(title) === 0 || /^(ⓘ|전체 보기|접기|더 보기|자세히)/.test(l) || seen[l]) return; seen[l] = 1;
          if (out.length && (l.length <= 6 || out[out.length - 1].length <= 3)) out[out.length - 1] += " · " + l; else out.push(l); });
        body = out.slice(0, 6).join("\n"); }
      chShare("CH Investing", "📌 " + title + (body ? "\n" + body.slice(0, 260) : "") + "\n\n※ 투자 참고용 · 매수 추천 아님", cur); return; }
    var ib = t.closest(".tt-i"); if (ib){ ev.stopPropagation(); ttOpen(ib.closest(".fold-h")); return; }
    var h = t.closest("h3.tt-h, .mk-lab.tt-h"); if (!h) return;
    if (t.closest("button,a,input,select,label,textarea,[data-op],[data-goto]")) return;
    ttOpen(h);
  }, true);

  // ⑨ 공유 (10/13 「더 자주 열게」 ⑧) — 휴대폰 공유창(카톡 등) · 안 되면 복사
  window.chShare = function(title, text, hash){
    var url = "https://chkchp0702-spec.github.io/daily-app/" + (hash ? "#" + hash : "");
    var toast = function(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.setAttribute("role", "status"); d.setAttribute("aria-live", "polite"); d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); };
    var copy = function(){ var all = text + "\n" + url;
      if (navigator.clipboard) navigator.clipboard.writeText(all).then(function(){ toast("복사했어요 — 카톡 대화창에 붙여넣기 하세요"); }, function(){ prompt("길게 눌러 복사하세요", all); });
      else prompt("길게 눌러 복사하세요", all); };
    if (navigator.share) navigator.share({title: title, text: text, url: url}).catch(function(e){ if (e && e.name !== "AbortError") copy(); });
    else copy();
  };
  // ⑥ 나침반: 설명 글은 「ⓘ 설명」을 눌러야 보이게 (10/11 사용자: "지우지 말고 밑에 누르면 설명 부분 나오게 · 나침반이 복잡해 보여")
  var NOTE_TABS = {sector: 1};
  function notes(){
    [].forEach.call(document.querySelectorAll("#sheet details.cpx-d:not([data-op1])"), function(d){ d.dataset.op1 = "1"; d.open = true; });   // 칩으로 열면 바로 펼친 채로
    if (!NOTE_TABS[cur]) return;
    [].forEach.call(document.querySelectorAll("#main p.note, #main .rb-help, #sheet p.note"), function(n){
      if (n.dataset.nt || !n.textContent.trim()) return;
      n.dataset.nt = "1"; n.classList.add("nt-h");
      var b = document.createElement("button"); b.className = "nt-b"; b.type = "button"; b.textContent = "ⓘ 설명";
      b.onclick = function(ev){ ev.stopPropagation(); var o = n.classList.toggle("nt-h"); b.textContent = o ? "ⓘ 설명" : "ⓘ 설명 접기"; };
      n.parentNode.insertBefore(b, n);
    });
  }
  // 세부 섹터 계열 고르기 (시계·지도·되감기 같이)
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".famc [data-ffam]"); if (!b) return;
    var f = b.dataset.ffam; try { store.secf = f; save(); } catch(x) {}
    [].forEach.call(document.querySelectorAll(".famw"), function(w){ w.dataset.ff = f; });
    [].forEach.call(document.querySelectorAll(".famc [data-ffam]"), function(x){ x.classList.toggle("on", x.dataset.ffam === f); });
    setTimeout(function(){ [].forEach.call(document.querySelectorAll(".famw svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 30);
  });
  var DCT = null;
  new MutationObserver(function(){ if (DCT) return; DCT = setTimeout(function(){ DCT = null; try { titles(); } catch(x) {} notes();
    [].forEach.call(document.querySelectorAll("svg"), function(sv){ if (sv.querySelector("text.rotl")) declutter(sv); }); }, 200); })
    .observe(document.body, {childList: true, subtree: true});

  var css = document.createElement("style");
  css.textContent =
    // 위: 묶음 안의 작은 탭 (가로로 밀기)
    "header .tabs.sub{display:flex!important;gap:6px;overflow-x:auto;padding:0 12px 10px;scrollbar-width:none;grid-template-columns:none}" +
    "header .tabs.sub::-webkit-scrollbar{display:none}header .tabs.sub.none{display:none!important}" +
    "header .tabs.sub .tab{flex:none;flex-direction:row;padding:7px 14px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:-.3px;gap:0;min-width:auto}" +
    "header .tabs.sub .tab.on{background:var(--c);color:#111;border-color:transparent}" +
    ".top{padding-bottom:8px!important}.brand{font-size:20px!important}" +
    // 아래 탭 바
    "#bnav{position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;background:rgba(11,15,23,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);" +
    "border-top:1px solid var(--line);padding:4px 4px calc(env(safe-area-inset-bottom) + 4px)}" +
    "#bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;color:var(--sub);font:inherit;font-size:12.5px;padding:5px 0 3px;cursor:pointer;position:relative}" +
    "#bnav button .i{font-size:21px;line-height:1.15;filter:grayscale(.6);opacity:.75}" +
    "#bnav button.on{color:var(--text);font-weight:800}#bnav button.on .i{filter:none;opacity:1}" +
    "#bnav button.on:before{content:'';position:absolute;top:-4px;left:30%;right:30%;height:3px;border-radius:0 0 3px 3px;background:var(--c,#7c9cff)}" +
    ":root[data-ui=light] #bnav{background:rgba(255,255,255,.94);border-top-color:#dde2ea}" +
    "#backbtn{bottom:calc(env(safe-area-inset-bottom) + 74px)!important}#main{padding-bottom:120px!important}footer{padding-bottom:110px!important}" +
    // 탭 머리 한 줄
    "#main > .hero{background:none!important;border:0!important;box-shadow:none!important;padding:2px 4px 8px!important;margin:0 0 4px!important;cursor:pointer}" +
    "#main > .hero h1{display:inline;font-size:19px!important;letter-spacing:-.4px}" +
    "#main > .hero .meta{display:inline-flex!important;margin:0 0 0 8px!important;vertical-align:2px;gap:4px!important}" +
    "#main > .hero .meta .chip{font-size:12.5px;padding:2px 7px}" +
    "#main > .hero p{display:none}#main > .hero.show p{display:block;margin-top:6px}" +
    "#main > .hero h1:after{content:' ⓘ';font-size:12.5px;color:var(--dim);font-weight:400}" +
    // 카드 제목 설명 칸
    "h3.tt-h{justify-content:flex-start!important;gap:6px}h3.tt-h>.mut{margin-left:auto}h3.tt-h,.mk-lab.tt-h{cursor:pointer;-webkit-tap-highlight-color:transparent}h3.tt-h:after,.mk-lab.tt-h:after{content:'ⓘ';margin-left:4px;font-size:12.5px;color:var(--dim);font-weight:400;flex:none}" +
    "h3.tt-h.tt-on:after,.mk-lab.tt-h.tt-on:after{content:'ⓘ ▴';color:var(--text)}.tt-note{display:none!important}" +
    ".tt-i{flex:none;border:0;background:none;color:var(--dim);font:inherit;font-size:13px;padding:2px 6px;cursor:pointer}" +
    ".tt-x{margin:2px 0 12px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);padding:12px 12px 10px;font-size:13px;line-height:1.55;color:var(--text);font-weight:400;text-align:left}" +
    ".tt-x.ttx-in{animation:rbxIn .2s ease-out}@keyframes rbxIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}" +
    ".ttx-h{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;border-left:4px solid var(--c,#7c9cff);padding-left:10px}" +
    ".ttx-h small{display:block;color:var(--sub);font-size:12.5px}.ttx-h b{display:block;font-size:15.5px;font-weight:800;color:var(--text)}.ttx-h em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".ttx-x{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ttx-what{margin:10px 0 6px}.ttx-n{background:var(--panel);border-radius:10px;padding:8px 10px;margin:6px 0}.ttx-n>small,.ttx-go>small{display:block;color:var(--sub);font-size:12.5px;font-weight:700;margin-bottom:2px}" +
    ".ttx-n p.note{margin:4px 0 0!important;font-size:12.5px;color:var(--text)}" +
    ".ttx-go{margin:8px 0 2px;display:flex;flex-wrap:wrap;gap:6px}.ttx-go>small{flex-basis:100%}" +
    ".ttx-l{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ttx-bt{display:flex;gap:6px;margin-top:10px}.ttx-bt .ttx-x2{flex:1;margin:0}.ttx-sh{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}" +
    ".ch-toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 90px);transform:translateX(-50%);z-index:99;background:var(--text);color:var(--bg);border-radius:12px;padding:10px 14px;font-size:13.5px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center}" +
    ".ttx-x2{display:block;width:100%;margin-top:10px;padding:9px}" +
    // 나침반 접기·설명
    ".nt-h{display:none!important}.nt-b{display:inline-block;border:0;background:none;color:var(--sub);font:inherit;font-size:12.5px;padding:4px 2px;margin:2px 0;cursor:pointer}" +
    "details.cpx-d>summary,.rb-det>summary{cursor:pointer;font-weight:800;font-size:15px;list-style:none;padding:2px 0}details.cpx-d>summary::-webkit-details-marker,.rb-det>summary::-webkit-details-marker{display:none}" +
    "details.cpx-d>summary:after,.rb-det>summary:after{content:' ▾';color:var(--dim);font-weight:400}details.cpx-d[open]>summary:after,.rb-det[open]>summary:after{content:' ▴'}" +
    "details.cpx-d>summary .mut{display:block;font-size:12.5px;font-weight:400;margin-top:2px}details.cpx-d[open]>summary{margin-bottom:10px}" +
    ".rb-det{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.rb-det>summary{font-size:14px;color:var(--sub)}" +
    // 계열 고르기
    ".famc{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin:6px 0 2px;padding-bottom:2px}.famc::-webkit-scrollbar{display:none}" +
    ".famc button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:4px 10px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}.famc button.on{background:var(--text);color:var(--bg);border-color:transparent}" +
    ".famw[data-ff=it] [data-fam]:not([data-fam=it]),.famw[data-ff=hc] [data-fam]:not([data-fam=hc]),.famw[data-ff=ind] [data-fam]:not([data-fam=ind]),.famw[data-ff=fin] [data-fam]:not([data-fam=fin])," +
    ".famw[data-ff=con] [data-fam]:not([data-fam=con]),.famw[data-ff=com] [data-fam]:not([data-fam=com]),.famw[data-ff=mat] [data-fam]:not([data-fam=mat]),.famw[data-ff=re] [data-fam]:not([data-fam=re]){display:none}" +
    ".famw[data-ff=''] [data-fam]:not([data-top]) .rotl,.famw:not([data-ff]) [data-fam]:not([data-top]) .rotl{display:none}" +   // 전체일 땐 움직임 큰 10곳만 이름
    // 겹친 글씨 비켜 쓴 선 · 밝은 화면의 카드 창 머리
    "svg .dc-ln{stroke:var(--sub);stroke-width:.8;opacity:.6}" +
    ":root[data-ui=light] .sh-top{background:rgba(255,255,255,.94)!important}:root[data-ui=light] .sh-top b{color:#141a26}" +
    // 날짜 칩 한 줄로 작게
    "#main .dates{margin-bottom:10px}#main .date{padding:5px 11px!important;border-radius:999px!important;font-size:12.5px!important;line-height:1.3}" +
    "#main .date b{display:inline!important;font-size:13.5px!important;margin-right:3px}" +
    "#backbtn.root{display:none!important}#backbtn{padding:9px 14px!important;font-size:14px!important}" +
    // 🫥 10/31 B7: 읽으려고 아래로 내리는 동안엔 「보내기」「뒤로」를 아래로 숨김 — 글자를 가리지 않게 (위로 살짝 올리거나 맨 위·맨 아래면 다시)
    "#backbtn,#opbtn{transition:transform .25s ease,opacity .25s ease!important}" +
    "html.fab-hide #backbtn,html.fab-hide #opbtn{transform:translateY(140%)!important;opacity:0!important;pointer-events:none!important}" +
    "";
  document.head.appendChild(css);
  (function(){
    var D = document.documentElement, lastY = window.scrollY;
    window.addEventListener("scroll", function(){
      var y = window.scrollY, dy = y - lastY, end = y + window.innerHeight >= document.documentElement.scrollHeight - 40;
      if (y < 0 || y > document.documentElement.scrollHeight - window.innerHeight - 4) return;   // 11/03 맨 위·아래 튕김 구간은 무시(단추가 들락날락 흔들리던 것)
      if (y < 80 || end || dy < -30) D.classList.remove("fab-hide");
      else if (dy > 30) D.classList.add("fab-hide");
      if (Math.abs(dy) > 30) lastY = y;
    }, {passive: true});
  })();
  if (window.cur) try { window.drawTabs(); } catch(x) {}
})();
;
