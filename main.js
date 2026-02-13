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

    // ---- 3D Parallax Tilt Effect ----
    const tiltContainers = document.querySelectorAll('.tilt-container');
    if (tiltContainers.length > 0) {
        const MAX_TILT = 15;
        const EASE = 0.08;
        const RESET = 0.05;

        tiltContainers.forEach(container => {
            const card = container.querySelector('.tilt-card');
            const gloss = container.querySelector('.tilt-gloss');
            if (!card) return;

            let cx = 0, cy = 0, tx = 0, ty = 0, gx = 50, gy = 50;
            let hovering = false;
            let useGyro = false;
            let autoT = Math.random() * 100; // offset so cards don't sync

            // Mouse
            container.addEventListener('mouseenter', () => { hovering = true; });
            container.addEventListener('mouseleave', () => {
                hovering = false;
                tx = 0; ty = 0; gx = 50; gy = 50;
            });
            container.addEventListener('mousemove', (e) => {
                if (!hovering) return;
                const r = container.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                tx = (y - 0.5) * -2 * MAX_TILT;
                ty = (x - 0.5) * 2 * MAX_TILT;
                gx = x * 100;
                gy = y * 100;
            });

            // Touch
            container.addEventListener('touchmove', (e) => {
                if (useGyro) return;
                const t = e.touches[0];
                const r = container.getBoundingClientRect();
                const x = (t.clientX - r.left) / r.width;
                const y = (t.clientY - r.top) / r.height;
                tx = (y - 0.5) * -2 * MAX_TILT;
                ty = (x - 0.5) * 2 * MAX_TILT;
                gx = x * 100;
                gy = y * 100;
                hovering = true;
            }, { passive: true });
            container.addEventListener('touchend', () => {
                hovering = false;
                tx = 0; ty = 0; gx = 50; gy = 50;
            });

            // Animate
            function tick() {
                // Auto-rock on mobile when idle
                const mobile = window.matchMedia('(max-width: 768px)').matches;
                if (mobile && !hovering && !useGyro) {
                    autoT += 0.015;
                    tx = Math.sin(autoT * 0.7) * 4;
                    ty = Math.sin(autoT) * 6;
                    gx = 50 + Math.sin(autoT) * 15;
                    gy = 50 + Math.cos(autoT * 0.7) * 10;
                }

                const e = hovering ? EASE : RESET;
                cx += (tx - cx) * e;
                cy += (ty - cy) * e;

                card.style.transform = `rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
                if (gloss) {
                    gloss.style.background = `radial-gradient(circle at ${gx.toFixed(0)}% ${gy.toFixed(0)}%, rgba(0, 255, 157, 0.1) 0%, transparent 55%)`;
                }

                requestAnimationFrame(tick);
            }
            tick();
        });

        // Gyroscope (shared across all tilt containers)
        if (window.DeviceOrientationEvent) {
            const bindGyro = () => {
                let bg = null, bb = null;
                window.addEventListener('deviceorientation', (e) => {
                    if (e.gamma === null) return;
                    if (bg === null) { bg = e.gamma; bb = e.beta; }
                    tiltContainers.forEach(c => {
                        const card = c.querySelector('.tilt-card');
                        if (!card) return;
                        // Access the card's tilt state via data attributes
                    });
                }, { passive: true });
            };

            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                document.addEventListener('click', async () => {
                    try {
                        const p = await DeviceOrientationEvent.requestPermission();
                        if (p === 'granted') bindGyro();
                    } catch (e) { /* denied */ }
                }, { once: true });
            } else {
                bindGyro();
            }
        }
    }
});
