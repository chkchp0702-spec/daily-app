/* CH Investing — 알림 전용 서비스 워커 (화면·자료 캐시는 하지 않음: 항상 최신 자료) */
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
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
