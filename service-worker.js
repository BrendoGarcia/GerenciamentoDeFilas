const CACHE_NAME = 'vendedores-samsung-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css', // Separar seu CSS em um arquivo externo, se ainda não estiver
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Adicione outros recursos que deseja cachear
];

// Instalação do Service Worker e cache dos recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercepta as requisições e serve os recursos cacheados quando possível
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna o recurso cacheado, se encontrado
                if (response) {
                    return response;
                }
                // Caso contrário, busca na rede
                return fetch(event.request);
            })
    );
});

// Atualiza o Service Worker e limpa caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
