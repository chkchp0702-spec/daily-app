/* CH Investing — 서비스 워커: 알림 + ⑧ 빨리 뜨게 (10/10)
   · 자료(JSON·GitHub 원본): 먼저 새로 받아 보고, 3.5초 안에 안 오면 마지막으로 받아 둔 것을 보여 줌(뒤에서는 계속 받아 갱신) → 늘 최신이 원칙, 느릴 때만 마지막 것
   · 앱 파일(js·css·그림, ?v= 붙은 것): 한 번 받으면 버전이 바뀔 때까지 저장본 → 두 번째부터 바로 뜸
   · 첫 화면(index.html): 새로 받기, 끊기면 저장본 */
var DC = "ch-data-v1", SC = "ch-static-v1";
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== DC && k !== SC; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
function netFirst(req, name, wait){
  return caches.open(name).then(function(c){
    var net = fetch(req).then(function(res){ if (res && res.ok) c.put(req, res.clone()).catch(function(){}); return res; });
    var old = c.match(req, {ignoreSearch: true});
    return new Promise(function(ok, no){
      var done = false;
      var t = setTimeout(function(){ old.then(function(m){ if (m && !done){ done = true; ok(m); } }); }, wait);
      net.then(function(r){ if (!done){ done = true; clearTimeout(t); ok(r); } }).catch(function(){ old.then(function(m){ if (!done){ done = true; clearTimeout(t); m ? ok(m) : no(new Error("offline")); } }); });
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
  if (r.mode === "navigate") { e.respondWith(netFirst(r, SC, 4000)); return; }
  if (u.hostname === "raw.githubusercontent.com" || (same && /\.json$/.test(u.pathname))) { e.respondWith(netFirst(r, DC, 3500)); return; }
  if ((same && /\.(js|css|png|webmanifest)$/.test(u.pathname) && u.search) || /cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(u.hostname)) { e.respondWith(cacheFirst(r, SC)); return; }
});
self.addEventListener("push", function(e){
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(x) { d = {body: e.data ? e.data.text() : ""}; }
  e.waitUntil(self.registration.showNotification(d.title || "CH Investing", {
    body: d.body || "", icon: "icon.png?v=2", badge: "icon.png?v=2", tag: d.tag || undefined, renotify: !!d.tag,
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
