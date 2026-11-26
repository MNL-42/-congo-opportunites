/* Congo Opportunités — cache v15 : réseau d'abord, cache de secours hors ligne. */
const CACHE_NAME = "congo-opportunites-v15";
const CORE = [
  "./", "./index.html", "./manifest.json",
  "./css/style.css?v=20261126-5",
  "./css/responsive.css?v=20261126-5",
  "./css/opportunities.css?v=20261126-6",
  "./js/config.js", "./js/auth.js", "./js/app.js",
  "./js/courses/catalogue.js", "./js/course-content.js",
  "./js/course-content-extra.js", "./js/academy.js",
  "./js/opportunities.js", "./js/pwa-install.js",
  "./data/opportunities.json",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/og-cover.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE.map(async path => {
      try {
        const response = await fetch(path, {cache:"reload"});
        if (response.ok) await cache.put(path, response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("congo-opportunites-") && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(event.request);
        if (response.ok || response.type === "opaque") await cache.put(event.request, response.clone());
        return response;
      } catch (_) {
        return (await cache.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  const networkFirst = event.request.mode === "navigate"
    || /\.(?:html|js|css|json)$/i.test(path)
    || path.endsWith("/");

  if (networkFirst) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(event.request, {cache:"no-store"});
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch (_) {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return (await cache.match("./index.html")) || Response.error();
        }
        return Response.error();
      }
    })());
  } else {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch (_) { return Response.error(); }
    })());
  }
});
