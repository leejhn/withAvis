/**
 * sw.js — WithAvis PWA Service Worker
 * 오프라인 캐싱, 백그라운드 동기화 및 고속 런타임 캐싱을 제공합니다.
 */

const CACHE_NAME = 'withavis-pwa-v9.1.17';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './api-guide.html',
    './changelog.html',
    './privacy.html',
    './styles.css?v=9.1.17',
    './styles.css',
    './script.js',
    './site-nav.js',
    './manifest.json',
    './assets/icon16.png',
    './assets/icon48.png',
    './assets/icon128.png',
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
                // 개별 리소스 실패가 전체 설치를 차단하지 않도록 안전하게 캐싱
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

// ── Fetch: 오프라인 캐시 및 Stale-While-Revalidate 전략 ──
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // HTTP/HTTPS 외 스킴(예: chrome-extension, data) 무시
    if (!url.protocol.startsWith('http')) return;

    // POST, PUT 등 비-GET 요청 무시
    if (request.method !== 'GET') return;

    // 1. HTML 페이지 네비게이션 요청: Network-First with Cache Fallback
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) return cachedResponse;

                    // fallback to index.html
                    const indexFallback = await caches.match('./index.html');
                    if (indexFallback) return indexFallback;

                    return new Response('오프라인 상태입니다. 네트워크 연결을 확인해주세요.', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                })
        );
        return;
    }

    // 2. 정적 자산(CSS, JS, 이미지, 외부 폰트 등): Stale-While-Revalidate
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
                .catch((err) => {
                    // 네트워크 에러 시 무시 (이미 캐시가 있다면 그것을 사용)
                    return null;
                });

            // 캐시가 있으면 즉시 반환하고 백그라운드에서 갱신, 없으면 네트워크 응답 대기
            return cachedResponse || fetchPromise.then((res) => res || new Response(null, { status: 404 }));
        })
    );
});

// ── Message: 수동 업데이트 트리거 지원 ──
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
