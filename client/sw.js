/* MediRescue AI service worker — cache-first for static assets, network-first for APIs */
const CACHE = "medirescue-v10";
const ASSETS = [
  "./", "./index.html", "./emergency.html", "./ambulance.html", "./hospitals.html",
  "./doctors.html", "./beds.html", "./blood-bank.html", "./assistant.html", "./dashboard.html", "./login.html",
  "./css/style.css?v=10", "./css/emergency.css?v=10", "./css/dashboard.css?v=10",
  "./js/app.js?v=10", "./js/sos.js?v=10", "./js/ai.js?v=10", "./js/auth.js?v=10", "./js/maps.js?v=10",
  "./js/hospitals-data.js?v=10", "./js/ambulance.js?v=10", "./js/blood.js?v=10", "./js/dashboard.js?v=10",
  "./js/doctors-data.js?v=10", "./js/doctors.js?v=10", "./js/beds-data.js?v=10", "./js/beds.js?v=10", "./js/home-beds.js?v=10",
  "./favicon.svg", "./manifest.webmanifest",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  if (url.pathname.includes("/api/")) {
    // Network-first for API calls; app has localStorage fallbacks when offline.
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({ offline: true }), { headers: { "Content-Type": "application/json" } })));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((res) => {
          if (res.ok && (url.origin === location.origin || url.hostname.includes("unpkg.com") || url.hostname.includes("fonts"))) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        }).catch(() => cached)
    )
  );
});
