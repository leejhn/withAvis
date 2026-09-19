/**
 * WithAvis PWA Service Worker (sw.js)
 * 버전: v9.1.17
 * 정책:
 * - HTML 페이지(Navigate): Network-First (최신 컨텐츠 우선 + 오프라인 폴백)
 * - 정적 리소스(CSS, JS, 이미지, 아이콘): Stale-While-Revalidate (초고속 로딩 + 자동 백그라운드 갱신)
 */

const CACHE_VERSION = 'v9.1.17';
const CACHE_NAME = `withavis-pwa-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './api-guide.html',
    './changelog.html',
    './privacy.html',
    './styles.css',
    './script.js',
    './site-nav.js',
    './manifest.json',
    './assets/icon16.png',
    './assets/icon48.png',
    './assets/icon128.png',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/icon-512-maskable.png',
    './assets/hero.png',
    './assets/gemini.png',
    './assets/claude.png',
    './assets/cerebras.png',
    './assets/groq.png',
    './assets/atlas.png',
    './assets/opencode.png',
    './assets/openrouter.png'
];

// ── 설치 (Install): 핵심 리소스 사전 캐싱 ──
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // 개별 리소스 실패가 전체 캐시 실패로 이어지지 않도록 방어적 캐싱
            const cachePromises = PRECACHE_ASSETS.map(async (url) => {
                try {
                    const response = await fetch(url, { cache: 'reload' });
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (err) {
                    console.warn('[WithAvis SW] Precache failed for:', url, err);
                }
            });
            return Promise.all(cachePromises);
        })
    );
});

// ── 활성화 (Activate): 구버전 캐시 정리 및 즉시 클라이언트 제어 ──
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('withavis-pwa-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.debug('[WithAvis SW] Deleting outdated cache:', name);
                            return caches.delete(name);
                        })
                );
            })
        ])
    );
});

// ── 요청 가로채기 (Fetch) ──
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // HTTP/HTTPS 외 스키마(chrome-extension:// 등) 무시
    if (!request.url.startsWith('http')) return;

    // Google Analytics 및 외부 추적 스크립트는 네트워크 전용
    if (request.url.includes('google-analytics.com') || request.url.includes('googletagmanager.com')) {
        return;
    }

    // 1. 네비게이션(HTML 문서) 요청: Network-First 전략
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // 오프라인 시 캐시된 페이지 반환
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) return cachedResponse;
                    const fallbackIndex = await caches.match('./index.html');
                    return fallbackIndex ?? new Response('Offline: WithAvis 페이지를 불러올 수 없습니다.', {
                        status: 503,
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                })
        );
        return;
    }

    // 2. 정적 리소스(동일 Origin 에셋): Stale-While-Revalidate
    const requestUrl = new URL(request.url);
    if (requestUrl.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            const copy = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse ?? fetchPromise;
            })
        );
        return;
    }

    // 3. 외부 CDN(폰트, FontAwesome 등): Cache-First 전략
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return networkResponse;
            }).catch(() => new Response('', { status: 408 }));
        })
    );
});
