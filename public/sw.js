// Service Worker for Polaroid PWA
const CACHE_NAME = "polaroid-v1";
const OFFLINE_URL = "/offline";

// Cache essential resources
const CACHE_URLS = [
  "/",
  "/camera",
  "/photos",
  "/scan",
  "/offline",
  "/manifest.json",
  // Add your CSS and JS files
  "/_next/static/css/",
  "/_next/static/js/",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log("[SW] Caching app shell");

        // Cache essential resources
        const essentialResources = ["/", "/manifest.json", "/offline"];

        await cache.addAll(essentialResources);
      } catch (error) {
        console.error("[SW] Failed to cache resources:", error);
      }
    })(),
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");

  event.waitUntil(
    (async () => {
      try {
        // Delete old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(
          (cacheName) => cacheName !== CACHE_NAME,
        );

        await Promise.all(
          oldCaches.map((cacheName) => {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }),
        );

        // Take control of all clients
        await self.clients.claim();
      } catch (error) {
        console.error("[SW] Failed to activate:", error);
      }
    })(),
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try to get from cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log("[SW] Serving from cache:", event.request.url);
          return cachedResponse;
        }

        // If not in cache, fetch from network
        console.log("[SW] Fetching from network:", event.request.url);
        const networkResponse = await fetch(event.request);

        // Cache successful responses
        if (networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);

          // Only cache specific types of requests
          const url = new URL(event.request.url);
          if (
            url.pathname.startsWith("/_next/static/") ||
            url.pathname.endsWith(".png") ||
            url.pathname.endsWith(".jpg") ||
            url.pathname.endsWith(".jpeg") ||
            url.pathname.endsWith(".svg") ||
            url.pathname.endsWith(".webp") ||
            url.pathname === "/" ||
            url.pathname === "/camera" ||
            url.pathname === "/photos" ||
            url.pathname === "/scan"
          ) {
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
          }
        }

        return networkResponse;
      } catch (error) {
        console.error("[SW] Fetch failed:", error);

        // For navigation requests, return offline page
        if (event.request.mode === "navigate") {
          const cache = await caches.open(CACHE_NAME);
          const offlineResponse = await cache.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }

        // For other requests, return a basic response
        return new Response("オフラインです", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({
            "Content-Type": "text/plain; charset=utf-8",
          }),
        });
      }
    })(),
  );
});

// Handle background sync (for future implementation)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);
  // Handle background sync tasks here
});

// Handle push notifications (for future implementation)
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "新しい通知があります",
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id || "1",
      },
      actions: [
        {
          action: "open",
          title: "開く",
          icon: "/icon-192x192.png",
        },
        {
          action: "close",
          title: "閉じる",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Polaroid", options),
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received.");

  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(clients.openWindow("/"));
  }
});
