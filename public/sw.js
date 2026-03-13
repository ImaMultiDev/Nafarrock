/**
 * Service Worker mínimo para PWA.
 * Permite instalar la app. Las actualizaciones se aplican al cerrar todas las ventanas.
 */
self.addEventListener("install", () => {
  // No skipWaiting: la nueva versión se activa al cerrar todas las pestañas
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
