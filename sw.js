/* Caucasus Sweets Home: small service worker.
   - pages, CSS and JS: network first, so updates show up immediately; falls back to the last copy when offline
   - images and fonts: cache first
   - videos are not cached (large, streamed) */
const VERSION = 'v1';
const CORE = ['/', '/products.html', '/en/', '/en/products.html', '/style.css', '/script.js', '/products-data.js',
  '/fonts/fonts.css', '/img/logo-wine.webp', '/img/logo-white.webp', '/img/favicon.png', '/img/icon-192.png', '/404.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(CORE).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/^\/video\//.test(url.pathname) || req.headers.has('range')) return;          // never cache video
  var asset = /^\/(img|fonts)\//.test(url.pathname);
  if (asset) {                                                                       // cache first
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); return res; });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (res) {                                     // network first
    if (res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (req.mode !== 'navigate') return undefined;
      var en = /^\/en(\/|$)/.test(url.pathname);
      return caches.match(en ? '/en/' : '/').then(function (home) { return home || caches.match('/404.html'); });
    });
  }));
});
