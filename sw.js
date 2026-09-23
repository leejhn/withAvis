/**
 * sw.js — WithAvis PWA Service Worker
 * 오프라인 캐싱, 백그라운드 동기화 및 고속 런타임 캐싱을 제공합니다.
 */

const CACHE_NAME = 'withavis-pwa-v9.1.22';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './api-guide.html',
    './changelog.html',
    './privacy.html',
    './styles.css?v=9.1.22',
    './styles.css',
    './script.js',
    './site-nav.js?v=9.1.22',
    './site-nav.js',
    './manifest.json',
    './assets/icon16.png',
    './assets/icon48.png',
    './assets/icon192.png',
    './assets/icon512.png',
    './assets/icon512-maskable.png',
    './assets/apple-touch-icon.png',
    './assets/hero.png',
    './assets/gemini.png',
    './assets/claude.png',
    './assets/cerebras.png',
    './assets/opencode.png',
    './assets/openrouter.png',
    './assets/groq.png',
    './assets/atlas.png'
];

// ── Install: 필수 정적 리소스 프리캐싱 ──
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                for (const asset of PRECACHE_ASSETS) {
                    try {
                        await cache.add(asset);
                    } catch (err) {
                        console.warn(`[PWA-SW] Precache failed for: ${asset}`, err);
                    }
                }
            })
            .then(() => self.skipWaiting())
    );
});

// ── Activate: 구버전 캐시 정리 및 즉시 클라이언트 제어 ──
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME && key.startsWith('withavis-pwa-')) {
                        console.log(`[PWA-SW] Deleting old cache: ${key}`);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ── Fetch: HTML 및 코드(JS/CSS)는 Network-First, 이미지는 Stale-While-Revalidate ──
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // HTTP/HTTPS 외 스킴(예: chrome-extension, data) 무시
    if (!url.protocol.startsWith('http')) return;

    // POST, PUT 등 비-GET 요청 무시
    if (request.method !== 'GET') return;

    const isHtml = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
    const isCodeAsset = url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.json');

    // 1. HTML 및 핵심 코드(JS, CSS, JSON): Network-First (최신 배포 즉시 반영)
    if (isHtml || isCodeAsset) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // 네트워크 불가(오프라인 등) 시 캐시에서 제공
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) return cachedResponse;

                    if (isHtml) {
                        const indexFallback = await caches.match('./index.html');
                        if (indexFallback) return indexFallback;

                        return new Response('오프라인 상태입니다. 네트워크 연결을 확인해주세요.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                        });
                    }

                    return new Response(null, { status: 404 });
                })
        );
        return;
    }

    // 2. 미디어/이미지/폰트 등 정적 자산: Stale-While-Revalidate (빠른 로딩 및 점진적 갱신)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => null);

            return cachedResponse || fetchPromise.then((res) => res || new Response(null, { status: 404 }));
        })
    );
});

// ── Message: 즉시 활성화(SKIP_WAITING) 메시지 수신 ──
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
