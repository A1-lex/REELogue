const CACHE_NAME = 'reelogue-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json'
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  clients.claim(); // Fixed from self.claim()
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip API requests from offline static caching (let API handle its own errors)
  if (event.request.url.includes('/movies') || event.request.url.includes('/genres')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback for offline root navigation if needed
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});