const CACHE_NAME = 'brgy-pro-v2'; // Increment this (v2, v3) whenever you push to GitHub
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap'
];

// 1. Install Event: Force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); // This forces the waiting SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate Event: Claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // This makes the SW take control of the page immediately without a reload
  );
});

// 3. Fetch Event: Network First for the App, Cache First for Assets
self.addEventListener('fetch', (event) => {
  // Check if the request is for the main page (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // If network works, update the cache and return the fresh version
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If network fails (offline), return the cached version
          return caches.match(event.request);
        })
    );
  } else {
    // For images, fonts, styles, scripts: Use Cache First for speed
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
