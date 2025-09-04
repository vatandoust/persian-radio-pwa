
// Very light cache strategy: app shell only (not the live stream)
const CACHE = 'persian-radio-v1';
const APP_SHELL = ['/', '/index.html', '/styles.css', '/script.js', '/manifest.json', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/logo.png'];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // Never cache streaming media
  if (url.pathname.includes('/stream')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(resp=> resp || fetch(e.request))
  );
});
