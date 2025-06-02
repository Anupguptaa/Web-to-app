// Service Worker (sw.js)

const CACHE_NAME = 'github-pwa-cache-v1'; // Cache ka naam, version badalne par change karein
const urlsToCache = [
    './', // Alias for ./index.html
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './images/icon-192x192.png',
    './images/icon-512x512.png',
    'https://via.placeholder.com/300x150.png?text=Online+Image' // Caching external image
];

// Install event: Jab Service Worker install hota hai
self.addEventListener('install', event => {
    console.log('SW: Install ho raha hai...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cache khul gaya, files cache ho rahi hain:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('SW: Sabhi zaroori files cache ho gayi hain.');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('SW: Caching mein error:', error);
            })
    );
});

// Activate event: Jab Service Worker activate hota hai
self.addEventListener('activate', event => {
    console.log('SW: Activate ho raha hai...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Purana cache delete kiya jaa raha hai:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('SW: Ab client ko control karne ke liye taiyar hai.');
            return self.clients.claim();
        })
    );
});

// Fetch event: Jab bhi website koi resource fetch karti hai
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('SW: Cache se fetch kiya:', event.request.url);
                    return cachedResponse;
                }

                console.log('SW: Network se fetch kiya:', event.request.url);
                return fetch(event.request).then(
                    networkResponse => {
                        // Response ko clone karo kyunki yeh ek stream hai
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Sirf valid responses ko cache karo (e.g. status 200)
                                // Aur agar 3rd party resource hai toh 'no-cors' type ka response ho sakta hai, use bhi cache kar sakte hain.
                                if (networkResponse.ok || networkResponse.type === 'opaque') {
                                    cache.put(event.request, responseToCache);
                                    console.log('SW: Network response cache kiya:', event.request.url);
                                } else {
                                    console.log('SW: Network response cache nahi kiya (status not OK):', event.request.url, networkResponse.status);
                                }
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.warn('SW: Network request fail hui. Shayad offline hain.', error);
                    // Offline fallback (agar specific offline page nahi hai, toh error ya cached '/' dikha sakte hain)
                    // return new Response("Network error. Aap offline ho sakte hain.", {
                    //     headers: { 'Content-Type': 'text/plain' }
                    // });
                    // Ya aap ek general fallback page/resource de sakte hain
                    // return caches.match('./index.html'); // Simple fallback to main page
                });
            })
    );
});
