/* =========================================================
   FOURTH MONTHSARY WEBSITE
   Interaction Script
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* =====================================================
       0. CONFIG
       ⚠️ CHANGE THIS to your own secret code (any length).
       Right now it's a placeholder: 0417
       ===================================================== */
    const CORRECT_PASSCODE = '0224';
    const STORAGE_KEY = 'monthsaryUnlocked';

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;


    /* =====================================================
       1. PASSCODE / AUTH OVERLAY
       ===================================================== */

    const authOverlay = document.getElementById('authOverlay');
    const authDots = document.getElementById('authDots');
    const authError = document.getElementById('authError');
    const authKeypad = document.getElementById('authKeypad');
    const mainContent = document.getElementById('mainContent');

    let enteredDigits = '';

    // Build the dots to match the passcode length
    function buildDots() {
        authDots.innerHTML = '';
        for (let i = 0; i < CORRECT_PASSCODE.length; i += 1) {
            const dot = document.createElement('span');
            authDots.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = authDots.querySelectorAll('span');
        dots.forEach((dot, index) => {
            dot.classList.toggle('is-filled', index < enteredDigits.length);
        });
    }

    function showError(message) {
        authError.textContent = message;
        authOverlay.classList.add('is-error');
        setTimeout(() => authOverlay.classList.remove('is-error'), 500);
    }

    function resetEntry() {
        enteredDigits = '';
        updateDots();
    }

    function unlockSite() {
    authOverlay.classList.add('is-unlocked');
    mainContent.removeAttribute('inert');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    // Audio Playback
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.play().catch(err => {
            console.log('Autoplay blocked:', err);
        });
    }

    try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (err) {}
}

    function handlePasscodeInput(key) {
        if (authOverlay.classList.contains('is-unlocked')) return;

        if (key === 'back') {
            enteredDigits = enteredDigits.slice(0, -1);
            updateDots();
            authError.textContent = '\u00A0';
            return;
        }

        if (enteredDigits.length >= CORRECT_PASSCODE.length) return;

        enteredDigits += key;
        updateDots();

        if (enteredDigits.length === CORRECT_PASSCODE.length) {
            if (enteredDigits === CORRECT_PASSCODE) {
                authError.textContent = '\u00A0';
                setTimeout(unlockSite, prefersReducedMotion ? 0 : 250);
            } else {
                showError("Mali po be — try po again");
                setTimeout(resetEntry, prefersReducedMotion ? 0 : 350);
            }
        }
    }

    // Keypad clicks
    authKeypad.addEventListener('click', (event) => {
        const button = event.target.closest('.auth-overlay__key[data-key]');
        if (!button) return;
        handlePasscodeInput(button.dataset.key);
    });

    // Physical keyboard support
    document.addEventListener('keydown', (event) => {
        if (authOverlay.classList.contains('is-unlocked')) return;

        if (/^[0-9]$/.test(event.key)) {
            handlePasscodeInput(event.key);
        } else if (event.key === 'Backspace') {
            handlePasscodeInput('back');
        }
    });

    buildDots();

    // Skip the gate if already unlocked earlier this session
    let alreadyUnlocked = false;
    try {
        alreadyUnlocked = sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch (err) {
        alreadyUnlocked = false;
    }

    if (alreadyUnlocked) {
        authOverlay.classList.add('is-unlocked');
        mainContent.removeAttribute('inert');
    }


    /* =====================================================
       2. FLOATING HEARTS
       ===================================================== */

    const heartsLayer = document.getElementById('heartsLayer');

    function spawnHeart(originXPercent) {
        if (prefersReducedMotion) return;

        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = '♡';
        heart.setAttribute('aria-hidden', 'true');

        const size = 14 + Math.random() * 18;
        const drift = (Math.random() - 0.5) * 160;
        const rotate = (Math.random() - 0.5) * 60;
        const duration = 2600 + Math.random() * 1800;

        heart.style.left = `${originXPercent}%`;
        heart.style.fontSize = `${size}px`;
        heart.style.setProperty('--heart-drift', `${drift}px`);
        heart.style.setProperty('--heart-rotate', `${rotate}deg`);
        heart.style.setProperty('--heart-duration', `${duration}ms`);

        heart.addEventListener('animationend', () => heart.remove());
        heartsLayer.appendChild(heart);
    }

    function spawnHeartBurst(originXPercent, count) {
        for (let i = 0; i < count; i += 1) {
            setTimeout(
                () => spawnHeart(originXPercent + (Math.random() - 0.5) * 12),
                i * 90
            );
        }
    }

    function xPercentFromEvent(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        return (centerX / window.innerWidth) * 100;
    }

    document.querySelectorAll('.heart-trigger').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            spawnHeartBurst(xPercentFromEvent(trigger), 6);
        });
    });


    /* =====================================================
       3. INTERACTIVE ENVELOPE
       ===================================================== */

    const envelopeScene = document.getElementById('envelopeScene');
    const envelope = document.getElementById('envelope');
    const envelopeSeal = document.getElementById('envelopeSeal');
    const envelopeHint = document.getElementById('envelopeHint');

    let envelopeOpened = false;

    envelopeSeal.addEventListener('click', () => {
        if (envelopeOpened) return;
        envelopeOpened = true;

        envelope.classList.add('is-open');
        envelopeHint.textContent = 'Opening your letter…';
        spawnHeartBurst(xPercentFromEvent(envelopeSeal), 8);

        const releaseDelay = prefersReducedMotion ? 50 : 1050;

        setTimeout(() => {
            envelopeScene.classList.add('is-released');
        }, releaseDelay);
    });

});