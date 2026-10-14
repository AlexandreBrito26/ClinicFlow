const CACHE = "clinicflow-v2";
const BASE = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Rede primeiro; sem conexão, usa o cache. Assim o app abre offline depois da primeira visita.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copia));
        return res;
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match("/index.html"))),
  );
});
