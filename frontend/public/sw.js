const CACHE_NAME = 'reelogue-v3';
const APP_SHELL = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // API data is stored in IndexedDB by the application.
  if (url.pathname.startsWith('/movies') || url.pathname.startsWith('/genres')) {
    return;
  }

  // Do not interfere with YouTube or other cross-origin resources.
  if (url.origin !== self.location.origin) return;

  // Network-first for page navigation, with the cached root as fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }

          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/');
          return cached || Response.error();
        }),
    );

    return;
  }

  // Cache-first for Next.js chunks, CSS, icons, fonts, and other same-origin assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkResponse = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }

          return response;
        })
        .catch(() => cached || Response.error());

      return cached || networkResponse;
    }),
  );
});