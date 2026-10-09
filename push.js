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
      .then(function(r){ ls("pushId", r[0]); ls("pushSent", String(Date.now())); return post(SUB, Object.assign({op: "on", id: r[0]}, r[1])).then(function(){ return r[0]; }); });
  }
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

  window.alarmView = function(){
    var list = (window.ALARMS || []).map(function(a){ return '<div class="pu-li"><span>' + a.ic + '</span><div><b>' + a.nm + '</b><small>' + a.d + '</small></div></div>'; }).join("") +
      '<div class="pu-li"><span>🌐</span><div><b>아침 시황리포트 도착</b><small>매일 아침 리포트가 올라오면</small></div></div>';
    return '<section class="card pu-main"><div class="pu-top"><div><div class="pu-t">🔔 이 휴대폰으로 알림 받기</div><div class="pu-s" id="pust">확인하는 중…</div></div>' +
      '<button class="pu-sw" id="pusw" role="switch" aria-checked="false" aria-label="알림 받기"><i></i></button></div>' +
      '<div id="puhelp"></div><div class="pu-act" id="puact"></div></section>' +
      '<div class="sec">켜면 이런 알림이 와요</div><section class="card pu-list">' + list + '</section>' +
      '<p class="note">알림은 하루 몇 번, 중요한 순간에만 와요. 언제든 위 스위치로 끌 수 있어요.</p>';
  };
  window.alarmInit = function(){
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
    draw();
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
    ".pu-li>span{font-size:20px;line-height:1.3}.pu-li b{display:block;font-size:14.5px}.pu-li small{color:var(--sub);font-size:12.5px}";
  document.head.appendChild(css);
})();
