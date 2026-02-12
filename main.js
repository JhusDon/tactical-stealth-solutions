document.addEventListener('DOMContentLoaded', () => {

    // --- Hamburger Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('nav-open');
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('nav-open');
            });
        });
    }
    const accessGate = document.getElementById('access-gate');
    const mainContent = document.getElementById('main-content');
    const accessCodeInput = document.getElementById('access-code');
    const accessBtn = document.getElementById('access-btn');
    const errorMsg = document.getElementById('error-msg');

    // Simple client-side check for demo purposes
    // In production, this would be server-side or at least hashed
    const VALID_CODES = ['Hades'];
    const SESSION_KEY = 'tss_access_granted';

    // Check if already logged in from previous session
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        unlockSite(true); // true = immediate unlock
    }

    function checkAccess() {
        const input = accessCodeInput.value.toUpperCase().trim();

        if (VALID_CODES.includes(input)) {
            // Success
            sessionStorage.setItem(SESSION_KEY, 'true');
            unlockSite(false);
        } else {
            // Fail
            showError();
        }
    }

    function unlockSite(immediate = false) {
        if (!accessGate || !mainContent) return;

        if (immediate) {
            accessGate.style.display = 'none';
            mainContent.classList.add('revealed');
            return;
        }

        errorMsg.classList.add('hidden');
        accessGate.style.opacity = '0';

        setTimeout(() => {
            accessGate.style.display = 'none';
            mainContent.classList.add('revealed');
        }, 500);
    }

    function showError() {
        errorMsg.classList.remove('hidden');
        accessCodeInput.classList.add('shake');

        // Reset shake
        setTimeout(() => {
            accessCodeInput.classList.remove('shake');
        }, 500);
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
});
