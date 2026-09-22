/**
 * site-nav.js — WithAvis 공통 네비게이션 & 푸터 & PWA 컴포넌트
 * 모든 페이지에서 이 파일 하나로 navbar/footer/PWA(설치 및 Service Worker)를 렌더링하고 관리합니다.
 */
(function () {
    'use strict';

    // ── 단일 버전 정의 (Single Source of Truth) ──
    const APP_VERSION = 'v9.1.20';

    // ── Google Analytics (gtag.js) 자동 초기화 ──
    const GA_MEASUREMENT_ID = 'G-PGM46FRKZF';
    if (!document.querySelector(`script[src*="${GA_MEASUREMENT_ID}"]`)) {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = window.gtag || gtag;
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID);

        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(gaScript);
    }

    // ── 테마 즉시 복원 (FOUC 방지) ──
    const savedTheme = localStorage.getItem('withavis-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const isIndex = currentPage === 'index.html' || currentPage === '' || currentPage === 'withAvis';

    // index.html 내부 앵커는 #, 서브페이지는 index.html# 접두사
    const anchor = (hash) => isIndex ? `#${hash}` : `index.html#${hash}`;

    const navLinks = [
        { href: anchor('features'), text: '주요 기능' },
        { href: anchor('why'), text: '브라우징 편의성' },
        { href: anchor('api-guide'), text: 'API Key 발급 가이드' },
        { href: 'changelog.html', text: '업데이트 노트' },
        { href: 'privacy.html', text: '개인정보처리방침' },
    ];

    const WEBSTORE_URL = 'https://chromewebstore.google.com/detail/withavis/nloideoniafncdiplnodlghojenpfbjg';
    const logoHref = isIndex ? '#' : 'index.html';

    // ── PWA 전역 상태 ──
    let deferredPrompt = null;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints > 1 && window.matchMedia('(max-width: 1024px)').matches) ||
            (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
    };

    // ── Navbar ──
    function renderNavbar() {
        const target = document.getElementById('site-navbar');
        if (!target) return;

        const linksHtml = navLinks.map(link => {
            const isActive = (!isIndex && link.href === currentPage) ? ' class="active"' : '';
            return `<a href="${link.href}"${isActive}>${link.text}</a>`;
        }).join('\n                ');

        target.outerHTML = `
    <header class="navbar">
        <div class="container nav-container">
            <a href="${logoHref}" class="logo">
                <span class="logo-icon"><img src="assets/icon48.png" alt="WithAvis Logo" class="brand-logo-img"></span>
                <span class="logo-text">WithAvis</span>
            </a>
            <nav class="nav-links">
                ${linksHtml}
            </nav>
            <div class="nav-actions">
                <button type="button" class="theme-toggle-btn" id="themeToggleBtn" aria-label="테마 전환">
                    <i class="fa-solid fa-moon theme-icon-dark"></i>
                    <i class="fa-solid fa-sun theme-icon-light"></i>
                </button>
                <button type="button" class="pwa-install-btn" id="pwaInstallNavBtn" aria-label="웹앱 설치">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                    <span class="pwa-btn-text">앱 설치</span>
                </button>
                <a href="${WEBSTORE_URL}" target="_blank" class="nav-store-link">
                    <i class="fa-brands fa-chrome"></i> Chrome 웹스토어
                </a>
            </div>
        </div>
    </header>`;
    }

    // ── Footer ──
    function renderFooter() {
        const target = document.getElementById('site-footer');
        if (!target) return;

        const footerLinksHtml = navLinks.map(link =>
            `<a href="${link.href}">${link.text}</a>`
        ).join('\n                ');

        target.outerHTML = `
    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-left">
                <div class="logo">
                    <span class="logo-icon"><img src="assets/icon48.png" alt="WithAvis Logo" class="brand-logo-img"></span>
                    <span class="logo-text">WithAvis</span>
                    <span class="version-badge footer-version-badge" id="appVersionBadge">vv9.1.20</span>
                </div>
                <p>© 2026 WithAvis Project. All rights reserved.</p>
            </div>
            <div class="footer-right">
                ${footerLinksHtml}
                <a href="${WEBSTORE_URL}" target="_blank"><i class="fa-brands fa-chrome"></i> Chrome 웹스토어</a>
            </div>
        </div>
    </footer>`;
    }

    // ── PWA UI Elements (모바일 배너, iOS 모달, 토스트) ──
    function renderPwaUi() {
        if (document.getElementById('pwa-ui-container')) return;

        const container = document.createElement('div');
        container.id = 'pwa-ui-container';
        container.innerHTML = `
        <!-- 모바일 하단 PWA 설치 배너 -->
        <div class="pwa-floating-banner" id="pwaFloatingBanner" style="display: none;">
            <div class="pwa-banner-content">
                <img src="assets/icon48.png" alt="WithAvis" class="pwa-banner-icon">
                <div class="pwa-banner-text">
                    <strong>WithAvis 앱 설치</strong>
                    <span>홈 화면에서 빠르게 실행하고 오프라인 가이드를 확인하세요.</span>
                </div>
            </div>
            <div class="pwa-banner-actions">
                <button type="button" class="btn btn-sm btn-primary pwa-banner-install-btn" id="pwaBannerInstallBtn">
                    <i class="fa-solid fa-download"></i> 설치
                </button>
                <button type="button" class="pwa-banner-close-btn" id="pwaBannerCloseBtn" aria-label="닫기">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <!-- iOS Safari 홈 화면 추가 안내 모달 -->
        <div class="pwa-modal-backdrop" id="pwaIosModal" style="display: none;">
            <div class="pwa-modal-card">
                <div class="pwa-modal-header">
                    <div class="pwa-modal-title">
                        <img src="assets/icon48.png" alt="WithAvis" class="pwa-modal-icon">
                        <span>WithAvis 홈 화면에 추가</span>
                    </div>
                    <button type="button" class="pwa-modal-close" id="pwaIosModalClose">&times;</button>
                </div>
                <div class="pwa-modal-body">
                    <p class="pwa-modal-desc">iOS Safari에서 WithAvis를 앱처럼 간편하게 사용하실 수 있습니다.</p>
                    <ol class="pwa-ios-steps">
                        <li>Safari 하단 툴바의 <strong>공유 버튼 <i class="fa-solid fa-arrow-up-from-bracket"></i></strong>을 탭합니다.</li>
                        <li>메뉴를 아래로 스크롤하여 <strong>'홈 화면에 추가' <i class="fa-regular fa-square-plus"></i></strong>를 선택합니다.</li>
                        <li>우측 상단의 <strong>'추가'</strong>를 누르면 설치가 완료됩니다!</li>
                    </ol>
                </div>
                <div class="pwa-modal-footer">
                    <button type="button" class="btn btn-primary btn-block" id="pwaIosModalOk">확인했습니다</button>
                </div>
            </div>
        </div>

        <!-- PWA Toast Notification -->
        <div class="pwa-toast" id="pwaToast" style="display: none;">
            <i class="fa-solid fa-circle-check pwa-toast-icon"></i>
            <span id="pwaToastMsg">WithAvis 앱이 성공적으로 설치되었습니다.</span>
        </div>
        `;
        document.body.appendChild(container);
    }

    // ── 토스트 표시 ──
    function showToast(message) {
        const toast = document.getElementById('pwaToast');
        const toastMsg = document.getElementById('pwaToastMsg');
        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        toast.style.display = 'flex';
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 3500);
    }

    // ── PWA 설치 트리거 ──
    function triggerInstall() {
        if (isStandalone) {
            showToast('이미 앱이 설치되어 실행 중입니다.');
            return;
        }

        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('[PWA] User accepted the install prompt');
                } else {
                    console.log('[PWA] User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        } else if (isIos) {
            // iOS Safari 안내 모달 오픈
            const modal = document.getElementById('pwaIosModal');
            if (modal) modal.style.display = 'flex';
        } else {
            // 데스크탑 또는 이미 프롬프트가 지원되지 않는 환경
            showToast('브라우저 주소창의 설치 아이콘(⊕)을 누르거나 메뉴에서 "앱 설치"를 선택하세요.');
        }
    }

    // ── PWA 이벤트 바인딩 ──
    function initPwa() {
        // 1. Service Worker 등록
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((reg) => {
                        console.log('[PWA] Service Worker registered with scope:', reg.scope);
                    })
                    .catch((err) => {
                        console.warn('[PWA] Service Worker registration failed:', err);
                    });
            });
        }

        const navInstallBtn = document.getElementById('pwaInstallNavBtn');
        const banner = document.getElementById('pwaFloatingBanner');
        const bannerInstallBtn = document.getElementById('pwaBannerInstallBtn');
        const bannerCloseBtn = document.getElementById('pwaBannerCloseBtn');
        const iosModal = document.getElementById('pwaIosModal');
        const iosModalClose = document.getElementById('pwaIosModalClose');
        const iosModalOk = document.getElementById('pwaIosModalOk');

        // Standalone 모드에서는 설치 버튼 숨김
        if (isStandalone) {
            if (navInstallBtn) navInstallBtn.style.display = 'none';
            if (banner) banner.style.display = 'none';
            return;
        }

        // 네비바 설치 버튼 클릭
        if (navInstallBtn) {
            navInstallBtn.addEventListener('click', triggerInstall);
        }

        // 배너 설치 버튼 클릭
        if (bannerInstallBtn) {
            bannerInstallBtn.addEventListener('click', () => {
                triggerInstall();
                if (banner) banner.style.display = 'none';
            });
        }

        // 배너 닫기 버튼
        if (bannerCloseBtn) {
            bannerCloseBtn.addEventListener('click', () => {
                if (banner) banner.style.display = 'none';
                sessionStorage.setItem('withavis-pwa-banner-dismissed', 'true');
            });
        }

        // iOS 모달 닫기
        const closeIosModal = () => {
            if (iosModal) iosModal.style.display = 'none';
        };
        if (iosModalClose) iosModalClose.addEventListener('click', closeIosModal);
        if (iosModalOk) iosModalOk.addEventListener('click', closeIosModal);
        if (iosModal) {
            iosModal.addEventListener('click', (e) => {
                if (e.target === iosModal) closeIosModal();
            });
        }

        // 2. beforeinstallprompt 이벤트 캡처 (Chrome, Edge, Samsung Internet 등)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            if (navInstallBtn) {
                navInstallBtn.classList.add('visible');
            }

            // 하단 플로팅 배너는 모바일 상태에서 접근할 때만 노출
            const dismissed = sessionStorage.getItem('withavis-pwa-banner-dismissed');
            if (isMobileDevice() && !dismissed && banner) {
                setTimeout(() => {
                    banner.style.display = 'flex';
                    banner.classList.add('animate-slide-up');
                }, 1500);
            }
        });

        // 3. appinstalled 이벤트 처리
        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            if (navInstallBtn) navInstallBtn.style.display = 'none';
            if (banner) banner.style.display = 'none';
            showToast('🎉 WithAvis 앱이 성공적으로 설치되었습니다!');
        });

        // 4. iOS 환경에서 배너 노출 (방문 후 2초 뒤, 모바일 기기 전용)
        if (isIos && isMobileDevice() && !isStandalone) {
            const dismissed = sessionStorage.getItem('withavis-pwa-banner-dismissed');
            if (!dismissed && banner) {
                setTimeout(() => {
                    banner.style.display = 'flex';
                    banner.classList.add('animate-slide-up');
                }, 2000);
            }
        }
    }

    // ── Theme Toggle ──
    function bindThemeToggle() {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const html = document.documentElement;
            const isCurrentlyLight = html.getAttribute('data-theme') === 'light';
            const newTheme = isCurrentlyLight ? 'dark' : 'light';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('withavis-theme', newTheme);
        });
    }

    // ── Smooth Scroll for Index Anchors ──
    function bindSmoothScroll() {
        if (!isIndex) return;
        document.querySelectorAll('.navbar a[href^="#"], .footer a[href^="#"]').forEach(a => {
            a.addEventListener('click', function (e) {
                const hash = this.getAttribute('href');
                if (!hash || hash === '#') return;
                const el = document.querySelector(hash);
                if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ── 런타임 최신 버전 일치 (site-nav.js의 APP_VERSION을 페이지 요소에 단방향 전파) ──
    function syncDynamicVersion() {
        const changelogMeta = document.querySelector('.changelog-meta');
        if (changelogMeta) {
            changelogMeta.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> 최신 릴리즈 ${APP_VERSION} 기준`;
        }
        const firstCardTag = document.querySelector('.accordion-card:first-of-type .version-tag');
        if (firstCardTag && firstCardTag.textContent.trim() !== APP_VERSION) {
            firstCardTag.textContent = APP_VERSION;
        }
    }

    function init() {
        renderNavbar();
        renderFooter();
        renderPwaUi();
        syncDynamicVersion();
        bindThemeToggle();
        bindSmoothScroll();
        initPwa();
    }

    // DOM 로드 후 렌더링
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
