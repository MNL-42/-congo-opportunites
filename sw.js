/* Congo Opportunités — service worker v15.
   Stratégie réseau d'abord pour HTML, JS, CSS et données JSON.
   En cas de hors-ligne, la dernière copie en cache reste disponible. */
const CACHE_NAME = "congo-opportunites-v15";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css?v=20261126-6",
  "./css/responsive.css?v=20261126-6",
  "./css/opportunities.css?v=20261126-6",
  "./js/config.js",
  "./js/auth.js",
  "./js/app.js",
  "./js/courses/catalogue.js",
  "./js/course-content.js",
  "./js/course-content-extra.js",
  "./js/academy.js",
  "./js/opportunities.js",
  "./js/pwa-install.js",
  "./data/opportunities.json",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/og-cover.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          throw new Error("Ressource distante indisponible hors ligne");
        }
      })());
    }
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        const shell = await cache.match("./index.html");
        if (shell) return shell;
      }
      return new Response("Contenu indisponible hors ligne.", {
        status: 503,
        headers: {"Content-Type":"text/plain; charset=utf-8"}
      });
    }
  })());
});
