// Profil Raskroy — service worker (oflayn + avtomat yangilanish)
const CACHE = 'raskroy-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg'
];

// O'rnatishda fayllarni keshlash
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Eski keshlarni tozalash
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: internet bo'lsa har doim yangi versiya, bo'lmasa keshdan (oflayn)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
