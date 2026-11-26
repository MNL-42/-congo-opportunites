const CACHE_NAME = "congo-opportunites-v10";
const CORE = ["./", "./index.html", "./manifest.json", "./css/style.css?v=20261126-2", "./css/responsive.css?v=20261126-2", "./js/config.js", "./js/auth.js", "./js/app.js", "./js/courses/catalogue.js", "./js/course-content.js", "./js/academy.js", "./js/pwa-install.js", "./assets/icons/icon.svg", "./assets/icons/icon-180.png", "./assets/og-cover.svg", "./assets/og-cover.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.hostname === "fonts.googleapis.com" || requestUrl.hostname === "fonts.gstatic.com") {
    event.respondWith(caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok || response.type === "opaque") await cache.put(event.request, response.clone());
      return response;
    }));
    return;
  }
  if (requestUrl.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
