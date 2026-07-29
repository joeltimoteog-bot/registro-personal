// Service Worker mínimo - Sistema de Registro de Personal
// NO guarda caché: siempre va a la red, para que el sistema de
// actualizaciones automáticas (version.json) siga funcionando normal.
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pasar todo directo a la red (sin caché)
  e.respondWith(fetch(e.request));
});
