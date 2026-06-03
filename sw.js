const CACHE = 'toolsnest-v3';

const PAGES = [
  '/',
  '/tools/compress-image/',
  '/tools/passport-photo/',
  '/tools/image-to-pdf/',
  '/tools/bmi-calculator/',
  '/tools/cgpa-calculator/',
  '/tools/case-converter/',
  '/tools/word-counter/',
  '/tools/password-generator/',
  '/tools/base64-encoder/',
  '/tools/citation-generator/',
  '/tools/assignment-formatter/',
  '/tools/unit-converter/',
  '/tools/pdf-editor/',
  '/about/',
  '/privacy/',
];

const ASSETS = [
  '/css/shared.css',
  '/favicon.svg',
  '/manifest.json',
];

// Install: cache all pages and assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([...PAGES, ...ASSETS]))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, update in background (stale-while-revalidate)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Skip external requests (fonts, CDN icons)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => cached || caches.match('/'));

        return cached || networkFetch;
      })
    )
  );
});
