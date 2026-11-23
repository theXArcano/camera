const VERSAO = 'lentes-v4';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primeiro o que está guardado no celular (funciona sem internet);
// se houver internet, busca a versão nova em segundo plano para a próxima abertura.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSAO).then(async cache => {
      const guardado = await cache.match(e.request, { ignoreSearch: true });
      const daRede = fetch(e.request).then(resp => {
        if (resp && resp.ok) cache.put(e.request, resp.clone());
        return resp;
      }).catch(() => null);
      return guardado || (await daRede) || cache.match('./index.html');
    })
  );
});
