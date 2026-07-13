// RozgarHub service worker — dependency-free offline support for workers on
// patchy 2G/3G. Strategy:
//   • Navigations (HTML): network-first, fall back to the cached app shell so
//     the app opens even with no connection.
//   • Static assets (JS/CSS/img/font): cache-first with background refresh
//     (stale-while-revalidate) for instant loads.
//   • API calls (/api/*): never cached — always live, to avoid stale data.
// Bump CACHE_VERSION to invalidate old caches on deploy.

const CACHE_VERSION = "rozgarhub-v1";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  // Warm the cache with the app shell so the very first offline load works.
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.add(OFFLINE_URL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Drop caches from older versions.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle same-origin requests; never touch API traffic.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api")) return;

  // App shell / navigations: network-first, fall back to cache when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(OFFLINE_URL, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL).then((r) => r || caches.match(request))),
    );
    return;
  }

  // Static assets: serve from cache immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
