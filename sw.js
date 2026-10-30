/* CH Investing — 서비스 워커: 알림 + ⑧ 빨리 뜨게 (10/10)
   · 자료(JSON·GitHub 원본): 먼저 새로 받아 보고, 3.5초 안에 안 오면 마지막으로 받아 둔 것을 보여 줌(뒤에서는 계속 받아 갱신) → 늘 최신이 원칙, 느릴 때만 마지막 것
   · 앱 파일(js·css·그림, ?v= 붙은 것): 한 번 받으면 버전이 바뀔 때까지 저장본 → 두 번째부터 바로 뜸
   · 첫 화면(index.html): 새로 받기, 끊기면 저장본
   · 10/11: 저장본을 보여 줄 땐 X-From-Cache·X-Saved-At 머리표 + 화면에 메시지 → 위쪽 「⚠ 연결이 느려 HH:MM 저장본」 띠 · 앱 파일 저장소 이름에 버전 */
var VER = "20261030a";                                  // 앱 버전과 같이 올림 → 옛 ?v= 파일 저장본은 activate 때 지움
try { importScripts("easy.js?v=3"); } catch(x) {}         // 🗣 10/28 쉬운 말 — 푸시 알림 글도 (못 불러와도 알림은 그대로)
var DC = "ch-data-v1", SC = "ch-static-" + VER;
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return [DC, SC, "ch-page", "ch-lib"].indexOf(k) < 0; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
// 화면에 알리기: 저장본을 보여 줌(stale) · 새 것이 옴(fresh) · 끝내 못 받음(fail) → 앱 위쪽 띠 (10/11)
function tell(id, msg){ if (!id) return; self.clients.get(id).then(function(c){ if (c) c.postMessage(msg); }).catch(function(){}); }
// 저장할 때 받은 시각을 붙여 둠 → 저장본을 보여 줄 때 「HH:MM 저장본」
function stamp(res){
  if (!res || res.type === "opaque") return Promise.resolve(res);
  var h = new Headers(res.headers); h.set("X-Saved-At", String(Date.now()));
  return res.blob().then(function(b){ return new Response(b, {status: res.status, statusText: res.statusText, headers: h}); });
}
function marked_(m){
  if (!m || m.type === "opaque") return m;
  var h = new Headers(m.headers); h.set("X-From-Cache", "1"); if (!h.get("X-Saved-At")) h.set("X-Saved-At", "0");
  return new Response(m.body, {status: m.status, statusText: m.statusText, headers: h});
}
function netFirst(req, name, wait, cid){
  return caches.open(name).then(function(c){
    var net = fetch(name === "ch-page" ? new Request(req.url, {cache: "no-cache", credentials: "same-origin"}) : req).then(function(res){ if (res && res.ok) stamp(res.clone()).then(function(r2){ return c.put(req, r2); }).catch(function(){}); return res; });
    var old = c.match(req, {ignoreSearch: true});
    return new Promise(function(ok, no){
      var done = false, stale = false;
      var serveOld = function(m, why){ done = true; stale = true; var at = +(m.headers.get("X-Saved-At") || 0);
        tell(cid, {t: "stale", url: req.url, at: at, why: why}); ok(marked_(m)); };
      var t = setTimeout(function(){ old.then(function(m){ if (m && !done) serveOld(m, "slow"); }); }, wait);
      net.then(function(r){
        if (!done){ done = true; clearTimeout(t); ok(r); }
        else if (stale) tell(cid, {t: "fresh", url: req.url, ok: !!(r && r.ok)});
      }).catch(function(){ old.then(function(m){
        if (!done){ clearTimeout(t); if (m) serveOld(m, "off"); else { done = true; no(new Error("offline")); } }
        else if (stale) tell(cid, {t: "fail", url: req.url}); }); });
    });
  });
}
function cacheFirst(req, name){
  return caches.open(name).then(function(c){ return c.match(req).then(function(m){ return m || fetch(req).then(function(res){ if (res && res.ok) c.put(req, res.clone()).catch(function(){}); return res; }); }); });
}
self.addEventListener("fetch", function(e){
  var r = e.request; if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (u.hostname === "ntfy.sh" || /version\.txt$/.test(u.pathname) || /\.pdf$/.test(u.pathname)) return;
  var same = u.origin === self.location.origin;
  if (r.mode === "navigate") { e.respondWith(netFirst(r, "ch-page", 4000)); return; }
  // 10/19: 자료(JSON)는 브라우저 HTTP 캐시(GitHub Pages 10분)를 건너뛰고 늘 서버에 확인 — 장중 10분마다 바뀌는 파일이 옛것으로 보이던 문제
  if (u.hostname === "raw.githubusercontent.com" || (same && /\.json$/.test(u.pathname))) { e.respondWith(netFirst(new Request(r, {cache: "no-cache"}), DC, 3500, e.clientId)); return; }
  if (/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(u.hostname)) { e.respondWith(cacheFirst(r, "ch-lib")); return; }   // 주소에 버전이 박힌 외부 도구 — 앱 버전과 무관
  if (same && /\.(js|css|png|webmanifest)$/.test(u.pathname) && u.search) { e.respondWith(cacheFirst(r, SC)); return; }
});
self.addEventListener("push", function(e){
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(x) { d = {body: e.data ? e.data.text() : ""}; }
  var ez = self.easyText || function(v){ return v; };
  e.waitUntil(self.registration.showNotification(ez(d.title || "CH Investing"), {
    body: ez(d.body || ""), icon: "icon.png?v=2", badge: "icon.png?v=2", tag: d.tag || undefined, renotify: !!d.tag,
    data: {url: d.url || "./"}
  }));
});
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(function(cs){
    for (var i = 0; i < cs.length; i++){ if ("focus" in cs[i]){ cs[i].navigate(url).catch(function(){}); return cs[i].focus(); } }
    return self.clients.openWindow(url);
  }));
});
