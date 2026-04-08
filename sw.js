/**
 * SW.JS - Service Worker para PWA
 * Implementa offline support y caching
 */

const CACHE_NAME = 'control-gastos-v1';
const URL_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/data.js',
    '/app.js',
    '/charts.js',
    '/importador.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(URL_TO_CACHE).catch(err => {
                    // Si algún archivo no existe, continúa
                    console.warn('Algunos archivos no pudieron ser cacheados:', err);
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache obsoleto:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia: Cache first, network fallback
self.addEventListener('fetch', event => {
    // Solo cachea peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en cache, retorna
                if (response) {
                    return response;
                }

                // Si no, intenta desde la red
                return fetch(event.request)
                    .then(response => {
                        // No cachea respuestas inválidas
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clona la respuesta
                        const responseToCache = response.clone();

                        // Cachea la respuesta exitosa
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(err => console.warn('Error al cachear:', err));

                        return response;
                    })
                    .catch(err => {
                        // Si falla la red, retorna página offline (si existe)
                        console.warn('Fetch failed; returning offline page instead.', err);
                        return new Response('No hay conexión. Los datos se sincronizarán cuando te conectes.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Sincronización en background (para futuras mejoras)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Aquí se pueden sincronizar datos pendientes cuando se restaure la conexión
    console.log('Sincronizando datos...');
    // Lógica de sincronización
}

// Push notifications (para futuras mejoras)
self.addEventListener('push', event => {
    let notification = {
        title: 'Control Gastos',
        body: event.data ? event.data.text() : 'Notificación de la app',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23206BFF" width="192" height="192"/><text x="50%" y="50%" font-size="96" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">$</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><circle cx="96" cy="96" r="96" fill="%23206BFF"/><text x="50%" y="50%" font-size="96" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">$</text></svg>'
    };

    event.waitUntil(self.registration.showNotification(notification.title, notification));
});

// Click en notificación push
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
