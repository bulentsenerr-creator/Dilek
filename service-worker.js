/* MasterKoleksiyon PWA Service Worker */
const CACHE_NAME = 'masterkoleksiyon-v34.6.13';
const APP_SHELL = [
  './',
  './index.html',
  './MasterKoleksiyon.html',
  './manifest.json',
  './service-worker.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null))),
      self.clients.claim()
    ])
  );
});

function isSameOrigin(req) {
  try { return new URL(req.url).origin === self.location.origin; }
  catch(e) { return false; }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (isSameOrigin(req)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        }).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // Cross-origin (Google Fonts vb.) network-first + runtime cache
  event.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req))
  );
});
