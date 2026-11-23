/**
 * Service worker: guarda o app no iPhone para abrir sem internet.
 * Ao mudar qualquer arquivo do app, aumente VERSION (o teste tests/unit/sw.test.js
 * confere se todo arquivo de js/ e css/ está na lista PRECACHE).
 */
const VERSION = 'lentes-v6';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/main.js',
  './js/camera.js',
  './js/recorder.js',
  './js/gallery.js',
  './js/selection.js',
  './js/media-store.js',
  './js/share.js',
  './js/lenses.js',
  './js/ui.js',
  './js/log.js',
  './js/prefs.js',
  './icons/icon-180.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Primeiro o que está guardado no celular (funciona sem internet);
// com internet, busca a versão nova em segundo plano para a próxima abertura.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(event.request, { ignoreSearch: true });
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => null);
      return cached || (await network) || cache.match('./index.html');
    }),
  );
});
