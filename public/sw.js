// Minimal service worker — lets browsers treat the site as an installable app.
// No caching here on purpose: prices & stock must always be fresh.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
