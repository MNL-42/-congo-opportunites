/* Service worker v17 — réseau d'abord pour les contenus, cache de secours hors-ligne. */
const CACHE_NAME = "congo-opportunites-v17";
const CORE = [
 "./","./index.html","./manifest.json",
 "./css/style.css?v=20261127-1","./css/responsive.css?v=20261127-1","./css/opportunities.css?v=20261127-1",
 "./js/config.js","./js/auth.js","./js/app.js","./js/courses/catalogue.js","./js/course-content.js",
 "./js/course-content-extra.js","./js/academy.js","./js/opportunities.js","./js/pwa-install.js","./js/extras.js?v=1",
 "./data/opportunities.json","./assets/icons/icon.svg","./assets/icons/icon-180.png","./assets/icons/icon-192.png",
 "./assets/icons/icon-512.png","./assets/icons/maskable-512.png","./assets/og-cover.svg","./assets/og-cover.png"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));
 self.skipWaiting();
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
 self.clients.claim();
});
self.addEventListener("fetch",event=>{
 const req=event.request;if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com"){
  event.respondWith(fetch(req).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,c));}return res;}).catch(()=>caches.match(req)));return;
 }
 if(url.origin!==self.location.origin)return;
 const page=req.mode==="navigate"||req.destination==="document";
 const fresh=page||/\.(?:js|css|json)(?:$|\?)/i.test(url.pathname+url.search);
 if(fresh){
  event.respondWith(fetch(req).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,c));}return res;})
   .catch(async()=>{const old=await caches.match(req);if(old)return old;if(page)return (await caches.match("./index.html"))||Response.error();return Response.error();}));
  return;
 }
 event.respondWith(caches.match(req).then(old=>old||fetch(req).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,c));}return res;})));
});
