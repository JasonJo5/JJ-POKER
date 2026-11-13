/* JJ POKER service worker: the site opens instantly and works offline after the first visit.
   Every file is served from the phone's cache straight away, then quietly refreshed from GitHub
   in the background, so new uploads show up on the next launch. */
const CACHE = 'jj-poker-v1';
const FILES = [
  './', 'index.html', 'core.js', 'app.js', 'poker.js', 'blackjack.js', 'mahjong.js', 'mahjong4.js', 'slots.js',
  'kingscup.js', 'bus.js', 'capsa.js', 'party.js', 'online.js', 'qr.js', 'i18n.js', 'net.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'sounds/sounds.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(new Request(f, {cache: 'reload'})).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('jj-poker-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function refresh(req, cache, cached, nav) {
  try {
    const res = await fetch(req, {cache: 'no-cache'});
    if (res && res.ok && res.type === 'basic') {
      const copy = res.clone();
      // tell open pages when the main page changed, so they can offer a reload
      if (cached && nav) {
        const [a, b] = await Promise.all([cached.clone().text(), res.clone().text()]);
        if (a !== b) (await self.clients.matchAll()).forEach(c => c.postMessage({type: 'jj-updated'}));
      }
      await cache.put(req, copy);
    }
    return res;
  } catch (e) { return null; }
}

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? new Request(url.pathname.endsWith('/') ? './' : url.pathname) : req;
    const cached = await cache.match(key, {ignoreSearch: true});
    const fresh = refresh(key, cache, cached, req.mode === 'navigate');
    if (cached) { e.waitUntil(fresh); return cached; }
    const res = await fresh;
    return res || (req.mode === 'navigate' ? (await cache.match('./')) || Response.error() : Response.error());
  })());
});
