/**
 * site-nav.js — WithAvis 공통 네비게이션 & 푸터 컴포넌트
 * 모든 페이지에서 이 파일 하나로 navbar/footer를 렌더링합니다.
 * 메뉴명이나 링크를 변경할 때 이 파일만 수정하면 전체 사이트에 반영됩니다.
 */
(function () {
    'use strict';

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
                    <span class="version-badge footer-version-badge" id="appVersionBadge">v9.1.5</span>
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

    function init() {
        renderNavbar();
        renderFooter();
        bindThemeToggle();
        bindSmoothScroll();
    }

    // DOM 로드 후 렌더링
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

