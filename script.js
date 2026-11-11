const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Hero: the pieces around the name lean toward the pointer, each by its own
// depth, so the nearer ones move more. Touch screens just get the slow drift.
// ---------------------------------------------------------------------------
const drift = document.querySelector('[data-drift]');
if (drift && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const hero = drift.closest('.hero');
    hero.addEventListener('pointermove', (e) => {
        const r = drift.getBoundingClientRect();
        const clamp = (v) => Math.max(-1, Math.min(1, v));
        drift.style.setProperty('--px', clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2)).toFixed(3));
        drift.style.setProperty('--py', clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2)).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
        drift.style.setProperty('--px', '0');
        drift.style.setProperty('--py', '0');
    });
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
