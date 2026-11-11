const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Hero: the divider between "how it's built" and "what you get".
// --split is how far across the screen the divider sits, as a percentage.
// ---------------------------------------------------------------------------
const screen = document.querySelector('[data-split]');
const handle = screen?.querySelector('.handle');

if (screen && handle) {
    const MIN = 4;
    const MAX = 96;
    let split = 50;

    const describe = (v) => {
        if (v <= 10) return 'Finished view';
        if (v >= 90) return 'Construction view';
        return `${Math.round(v)}% construction, ${Math.round(100 - v)}% finished`;
    };

    const setSplit = (value) => {
        split = Math.min(MAX, Math.max(MIN, value));
        screen.style.setProperty('--split', `${split}%`);
        handle.setAttribute('aria-valuenow', String(Math.round(split)));
        handle.setAttribute('aria-valuetext', describe(split));
    };

    // Tween used by the load sweep, double-click and the keyboard
    let tween;
    const animateTo = (target, duration = 500, from = split) => {
        cancelAnimationFrame(tween);
        if (reducedMotion) return setSplit(target);
        const start = performance.now();
        const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            screen.style.setProperty('--split', `${from + (target - from) * eased}%`);
            if (t < 1) tween = requestAnimationFrame(step);
            else setSplit(target);
        };
        tween = requestAnimationFrame(step);
    };

    // Drag with a mouse, pen or finger
    const fromPointer = (e) => {
        const rect = screen.getBoundingClientRect();
        setSplit(((e.clientX - rect.left) / rect.width) * 100);
    };
    let dragging = false;
    handle.addEventListener('pointerdown', (e) => {
        cancelAnimationFrame(tween);
        dragging = true;
        try { handle.setPointerCapture(e.pointerId); } catch { /* capture is a nicety, not a requirement */ }
        screen.classList.add('dragging');
        screen.classList.remove('hint');
    });
    handle.addEventListener('pointermove', (e) => {
        if (dragging) fromPointer(e);
    });
    const release = () => {
        dragging = false;
        screen.classList.remove('dragging');
    };
    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
    handle.addEventListener('lostpointercapture', release);
    handle.addEventListener('dblclick', () => animateTo(50));

    // Keyboard
    handle.addEventListener('keydown', (e) => {
        const keys = { ArrowLeft: split - 5, ArrowRight: split + 5, Home: MIN, End: MAX };
        if (!(e.key in keys)) return;
        e.preventDefault();
        screen.classList.remove('hint');
        animateTo(keys[e.key], 180);
    });

    // On load the whole screen starts as construction, then the divider
    // sweeps across and settles in the middle, so the page builds itself.
    if (reducedMotion) {
        setSplit(50);
    } else {
        screen.style.setProperty('--split', `${MAX}%`);
        split = MAX;
        setTimeout(() => {
            animateTo(50, 1400, MAX);
            setTimeout(() => screen.classList.add('hint'), 1500);
        }, 1150);
    }
}

// The time in the phone's corner is the real time in Lagos
const clocks = document.querySelectorAll('[data-lagos-time]');
if (clocks.length) {
    const lagos = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    const tick = () => {
        const now = lagos.format(new Date());
        clocks.forEach((c) => { c.textContent = now; });
    };
    tick();
    setInterval(tick, 15000);
}

// ---------------------------------------------------------------------------
// Apps: each panel's screens slide up the first time it comes into view
// ---------------------------------------------------------------------------
const panels = document.querySelectorAll('.app');
if ('IntersectionObserver' in window && !reducedMotion) {
    const seen = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            seen.unobserve(entry.target);
        });
    }, { threshold: 0.25 });
    panels.forEach((p) => seen.observe(p));
} else {
    panels.forEach((p) => p.classList.add('in'));
}

// ---------------------------------------------------------------------------
// Header menu on small screens
// ---------------------------------------------------------------------------
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (menuToggle && nav) {
    const setMenu = (open) => {
        nav.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    };
    menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

// ---------------------------------------------------------------------------
// Contact: copy the email address
// ---------------------------------------------------------------------------
const copyButton = document.querySelector('[data-copy]');
if (copyButton && navigator.clipboard) {
    copyButton.hidden = false;
    let reset;
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(copyButton.dataset.copy);
            copyButton.textContent = 'Copied';
        } catch {
            copyButton.textContent = 'Couldn’t copy';
        }
        clearTimeout(reset);
        reset = setTimeout(() => { copyButton.textContent = 'Copy email'; }, 2000);
    });
}
