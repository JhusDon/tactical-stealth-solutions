// ==============================================
// TACTICAL STEALTH SOLUTIONS — main.js v2.0
// Access Gate · Navigation · Scroll Animations
// ==============================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Hamburger Menu ----
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('active');
            navLinks.classList.toggle('nav-open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close menu on nav link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('nav-open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ---- Header Shrink on Scroll ----
    const header = document.getElementById('site-header');
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 60);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ---- Scroll Reveal Animations ----
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ---- Active Nav Link Highlighting ----
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.toggle('nav-link--active',
                            link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(section => navObserver.observe(section));
    }

    // ---- Access Gate ----
    const accessGate = document.getElementById('access-gate');
    const mainContent = document.getElementById('main-content');
    const accessCodeInput = document.getElementById('access-code');
    const accessBtn = document.getElementById('access-btn');
    const errorMsg = document.getElementById('error-msg');

    const VALID_CODES = ['Hades'];
    const SESSION_KEY = 'tss_access_granted';

    // Check if already authenticated
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        unlockSite(true);
    }

    function checkAccess() {
        const input = accessCodeInput.value.toUpperCase().trim();

        if (VALID_CODES.some(code => code.toUpperCase() === input)) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            unlockSite(false);
        } else {
            showError();
        }
    }

    function unlockSite(immediate = false) {
        if (!accessGate || !mainContent) return;

        // Release iOS zoom
        if (accessCodeInput) accessCodeInput.blur();

        if (immediate) {
            accessGate.style.display = 'none';
            mainContent.classList.add('revealed');

            // Trigger scroll animations that are already in view
            requestAnimationFrame(() => {
                document.querySelectorAll('[data-animate]').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight) {
                        el.classList.add('visible');
                    }
                });
            });
            return;
        }

        errorMsg.classList.add('hidden');
        accessGate.style.opacity = '0';

        setTimeout(() => {
            accessGate.style.display = 'none';
            mainContent.classList.add('revealed');
            window.scrollTo(0, 0);

            // Trigger scroll animations after reveal
            setTimeout(() => {
                document.querySelectorAll('[data-animate]').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight) {
                        el.classList.add('visible');
                    }
                });
            }, 100);
        }, 600);
    }

    function showError() {
        errorMsg.classList.remove('hidden');
        accessCodeInput.classList.add('shake');

        setTimeout(() => {
            accessCodeInput.classList.remove('shake');
        }, 400);
    }

    if (accessBtn) {
        accessBtn.addEventListener('click', checkAccess);
    }

    if (accessCodeInput) {
        accessCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAccess();
            }
        });
    }

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = header ? header.offsetHeight : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
});
