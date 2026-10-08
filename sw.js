// もちたの箱庭: インストール(アプリ化)と、ネットがなくても開けるための小さなサービスワーカー。
// 方針: ネットにつながるときは いつも最新を取りに行き(更新がすぐ反映)、つながらないときだけ保存したものを使う。
const CACHE = 'mochita-v2-pwa-4';
const CORE = ['./', './index.html', './style.css', './manifest.webmanifest', './assets/mochita_rigged.glb', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
});
