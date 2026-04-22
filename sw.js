const CACHE_NAME = 'hidrosol-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/data.js',
  '/supabase.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
