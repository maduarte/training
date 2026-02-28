// ══════════════════════════════════════════════════
// SERVICE WORKER — Nadie Corre Solo PWA
// Bump CACHE_NAME cuando cambies cualquier archivo local
// ══════════════════════════════════════════════════

const CACHE_NAME = 'ncs-trail-v5';
const FONT_CACHE = 'ncs-fonts-v1';  // caché separada y long-lived para fuentes

// ── Archivos pre-cacheados en la instalación ───────
const APP_SHELL = [
  './',
  './index.html',
  './core/app.js',
  './core/storage.js',
  './data/exercises.js',
  './data/races.js',
  './ui/styles.css',
  // Chart.js desde CDN (necesario para la pestaña de analíticas)
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',
];

// ── INSTALL: pre-cachear el app shell ──────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpiar cachés viejos ────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== FONT_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── FETCH: estrategia según tipo de request ────────
self.addEventListener('fetch', (event) => {
  // Solo GETs; ignorar protocolos no-http (chrome-extension, etc.)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // ── 1. APIs de red: GitHub Gist + endpoint de generación de planes
  //       Network Only. Sin conexión estas funciones simplemente no operan.
  if (
    url.hostname === 'api.github.com' ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(
          JSON.stringify({ error: 'Sin conexión — esta función requiere internet.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // ── 2. Google Fonts CSS (fonts.googleapis.com)
  //       Network First → caché como respaldo.
  //       El CSS varía según el User-Agent del browser, así que se actualiza online
  //       pero la versión cacheada sirve de fallback offline.
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ── 3. Archivos de fuentes (fonts.gstatic.com)
  //       Cache First: las URLs de fuentes son inmutables.
  //       Se cachean en la primera visita con red y se sirven desde caché siempre.
  if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // ── 4. App Shell + CDN (Chart.js y cualquier otro asset local)
  //       Cache First + actualización silenciosa en background.
  //       Respuesta inmediata desde caché; siempre fresco cuando hay red.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // sin red → devolver lo cacheado

      // Servir desde caché de inmediato; la red actualiza en segundo plano
      return cached || networkFetch;
    })
  );
});
