// ---------------------------------------------------------------------------
// Hero: the size tag measures the canvas, as debug paint does. On load it
// counts up from 0 × 0 while the canvas opens; after that it tracks resizes.
// ---------------------------------------------------------------------------
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sizeTag = document.querySelector('[data-size]');
const canvas = document.querySelector('.inspect-canvas');
const frame = document.querySelector('.inspect-frame');

if (sizeTag && canvas) {
    let size = { w: canvas.offsetWidth, h: canvas.offsetHeight };
    let counting = !reducedMotion;
    const show = (w, h) => {
        sizeTag.textContent = `${Math.round(w)} × ${Math.round(h)}`;
    };

    if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
            size = { w: canvas.offsetWidth, h: canvas.offsetHeight };
            if (!counting) show(size.w, size.h);
        }).observe(canvas);
    }

    if (counting) {
        // Matches the canvas opening: 150ms in, over 800ms, easing out
        const start = performance.now() + 150;
        const step = (now) => {
            const t = Math.min(Math.max((now - start) / 800, 0), 1);
            const eased = 1 - Math.pow(1 - t, 3);
            show(size.w * eased, size.h * eased);
            if (t < 1) requestAnimationFrame(step);
            else counting = false;
        };
        show(0, 0);
        requestAnimationFrame(step);
    } else {
        show(size.w, size.h);
    }
}

// Julius drifts a few pixels with the pointer, against the still grid
if (frame && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', (e) => {
        const r = frame.getBoundingClientRect();
        const clamp = (v) => Math.max(-1, Math.min(1, v));
        frame.style.setProperty('--mx', clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 1.5)).toFixed(3));
        frame.style.setProperty('--my', clamp((e.clientY - (r.top + r.height / 2)) / r.height).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
        frame.style.setProperty('--mx', '0');
        frame.style.setProperty('--my', '0');
    });
}

// ---------------------------------------------------------------------------
// Release board: one row open at a time, Spendory first
// ---------------------------------------------------------------------------
const releases = [...document.querySelectorAll('.release')];

function setOpen(release, open) {
    const toggle = release.querySelector('.release-toggle');
    const detail = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.setAttribute('aria-expanded', String(open));
    detail.hidden = !open;
    release.classList.toggle('is-open', open);
}

releases.forEach((release, i) => {
    setOpen(release, i === 0);
    release.querySelector('.release-toggle').addEventListener('click', () => {
        const opening = !release.classList.contains('is-open');
        releases.forEach((r) => setOpen(r, r === release && opening));
    });
});

// ---------------------------------------------------------------------------
// Contact: the time in Lagos, and an email address you can copy
// ---------------------------------------------------------------------------
const clock = document.querySelector('[data-clock]');
const lagos = document.querySelector('[data-lagos]');
if (clock || lagos) {
    const lagosTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    const tick = () => {
        const now = lagosTime.format(new Date());
        if (clock) clock.textContent = `It’s ${now} now.`;
        if (lagos) lagos.textContent = `Lagos, ${now} now`;
    };
    tick();
    setInterval(tick, 15000);
}

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
        reset = setTimeout(() => {
            copyButton.textContent = 'Copy email';
        }, 2000);
    });
}
